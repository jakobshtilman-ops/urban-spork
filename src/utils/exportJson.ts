import { Task } from '../types/task';

// Export tasks to formatted JSON file
export function exportTasksToJson(tasks: Task[]): void {
  const dataStr = JSON.stringify(tasks, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const dateStr = new Date().toISOString().split('T')[0];
  a.download = `tactic-tasks-backup-${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Read and parse uploaded JSON file with validation
export function importTasksFromJson(file: File): Promise<Task[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);
        if (!Array.isArray(parsed)) {
          throw new Error('קובץ ה-JSON אינו מכיל רשימת משימות תקינה');
        }
        // Basic check for task structure
        const validated: Task[] = parsed.map((item, idx) => {
          if (!item.id || !item.title) {
            throw new Error(`משימה במספר ${idx + 1} אינה תקינה`);
          }
          return {
            ...item,
            history: Array.isArray(item.history) ? item.history : [],
            subtasks: Array.isArray(item.subtasks) ? item.subtasks : [],
          };
        });
        resolve(validated);
      } catch (err: any) {
        reject(err.message || 'שגיאה בקריאת קובץ ה-JSON');
      }
    };
    reader.onerror = () => reject('שגיאה בטעינת הקובץ');
    reader.readAsText(file);
  });
}
