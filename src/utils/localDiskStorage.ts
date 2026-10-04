import { Task } from '../types/task';

// Check if running inside Tauri desktop application
export function isTauriEnvironment(): boolean {
  return typeof window !== 'undefined' && Boolean((window as any).__TAURI__);
}

// In-memory or cached file handle for the Web File System Access API
let linkedFileHandle: any = null;
let linkedFileName: string | null = null;

const DB_NAME = 'tactic_file_storage';
const STORE_NAME = 'handles';
const KEY_NAME = 'linked_file_handle';

// Open IndexedDB to store file handle across page reloads
function getDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      return reject(new Error('IndexedDB not supported'));
    }
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE_NAME);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

// Save handle to IndexedDB
async function persistHandle(handle: any, name: string) {
  try {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put({ handle, name }, KEY_NAME);
  } catch (e) {
    console.warn('Could not persist file handle to IndexedDB', e);
  }
}

// Restore handle from IndexedDB
export async function restoreLinkedFileHandle(): Promise<string | null> {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const req = tx.objectStore(STORE_NAME).get(KEY_NAME);
      req.onsuccess = async () => {
        if (req.result && req.result.handle) {
          try {
            const status = await req.result.handle.queryPermission({ mode: 'readwrite' });
            if (status === 'granted') {
              linkedFileHandle = req.result.handle;
              linkedFileName = req.result.name;
              resolve(linkedFileName);
              return;
            }
          } catch {
            // handle error
          }
        }
        resolve(null);
      };
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

// Link a local file on computer using File System Access API
export async function linkLocalDiskFile(tasks: Task[]): Promise<string> {
  if (typeof window === 'undefined' || !(window as any).showSaveFilePicker) {
    throw new Error('הדפדפן הנוכחי אינו תומך ב-File System Access API ישירות, ניתן להוריד קובץ ישירות למחשב.');
  }

  const handle = await (window as any).showSaveFilePicker({
    suggestedName: 'tactic-tasks.json',
    types: [
      {
        description: 'קובץ נתוני משימות של טקטיק (JSON)',
        accept: { 'application/json': ['.json'] },
      },
    ],
  });

  linkedFileHandle = handle;
  linkedFileName = handle.name;
  await persistHandle(handle, handle.name);

  // Write initial tasks to this selected file immediately!
  await writeTasksToFileHandle(handle, tasks);
  return handle.name;
}

// Disconnect linked file
export async function unlinkLocalDiskFile(): Promise<void> {
  linkedFileHandle = null;
  linkedFileName = null;
  try {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(KEY_NAME);
  } catch {}
}

export function getLinkedFileName(): string | null {
  return linkedFileName;
}

// Write to active file handle
async function writeTasksToFileHandle(handle: any, tasks: Task[]): Promise<void> {
  const writable = await handle.createWritable();
  const jsonStr = JSON.stringify(tasks, null, 2);
  await writable.write(jsonStr);
  await writable.close();
}

// Save tasks to local computer (Tauri native file or linked web file or both)
export async function saveTasksToComputerDisk(tasks: Task[]): Promise<{ savedToTauri: boolean; savedToFile: boolean; filePath?: string }> {
  let savedToTauri = false;
  let savedToFile = false;
  let filePath: string | undefined = undefined;

  // 1. If in Tauri desktop app
  if (isTauriEnvironment()) {
    try {
      const invoke = (window as any).__TAURI__.invoke;
      const res = await invoke('save_tasks_to_disk', {
        tasksJson: JSON.stringify(tasks, null, 2),
      });
      savedToTauri = true;
      filePath = res;
    } catch (err) {
      console.error('Tauri disk save error:', err);
    }
  }

  // 2. If browser has a linked local file handle
  if (linkedFileHandle) {
    try {
      await writeTasksToFileHandle(linkedFileHandle, tasks);
      savedToFile = true;
    } catch (err) {
      console.warn('Writing to linked file failed:', err);
    }
  }

  return { savedToTauri, savedToFile, filePath };
}

// Load tasks from Tauri disk if available
export async function loadTasksFromTauriDisk(): Promise<Task[] | null> {
  if (isTauriEnvironment()) {
    try {
      const invoke = (window as any).__TAURI__.invoke;
      const jsonStr = await invoke('load_tasks_from_disk');
      if (jsonStr) {
        const parsed = JSON.parse(jsonStr);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (err) {
      console.log('Tauri load error or first launch:', err);
    }
  }
  return null;
}
