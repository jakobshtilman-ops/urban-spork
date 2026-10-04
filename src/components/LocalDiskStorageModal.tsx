import React, { useState, useEffect } from 'react';
import { Task } from '../types/task';
import { 
  X, 
  HardDrive, 
  CheckCircle2, 
  Download, 
  Upload, 
  FileCode, 
  Link, 
  Unlink, 
  ShieldCheck, 
  FolderCheck,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { 
  isTauriEnvironment, 
  linkLocalDiskFile, 
  unlinkLocalDiskFile, 
  getLinkedFileName, 
  saveTasksToComputerDisk 
} from '../utils/localDiskStorage';
import { exportTasksToJson, importTasksFromJson } from '../utils/exportJson';

interface LocalDiskStorageModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  onTasksLoaded: (tasks: Task[]) => void;
  onShowToast: (message: string) => void;
}

export const LocalDiskStorageModal: React.FC<LocalDiskStorageModalProps> = ({
  isOpen,
  onClose,
  tasks,
  onTasksLoaded,
  onShowToast,
}) => {
  const [isTauri, setIsTauri] = useState(false);
  const [linkedFile, setLinkedFile] = useState<string | null>(null);
  const [isLinking, setIsLinking] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setIsTauri(isTauriEnvironment());
      setLinkedFile(getLinkedFileName());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLinkFile = async () => {
    try {
      setIsLinking(true);
      const fileName = await linkLocalDiskFile(tasks);
      setLinkedFile(fileName);
      onShowToast(`הקובץ "${fileName}" חובר בהצלחה! מעכשיו כל שינוי יישמר ישירות בדיסק המחשב.`);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        onShowToast(err.message || 'שגיאה בחיבור קובץ במחשב');
      }
    } finally {
      setIsLinking(false);
    }
  };

  const handleUnlinkFile = async () => {
    await unlinkLocalDiskFile();
    setLinkedFile(null);
    onShowToast('חיבור הקובץ נותק. הנתונים ממשיכים להישמר בזיכרון המקומי.');
  };

  const handleExportNow = () => {
    exportTasksToJson(tasks);
    onShowToast('קובץ נתוני המשימות (JSON) נשמר בהצלחה במחשב שלך!');
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const loaded = await importTasksFromJson(file);
      onTasksLoaded(loaded);
      onShowToast(`נטענו בהצלחה ${loaded.length} משימות מקובץ המחשב!`);
      onClose();
    } catch (err: any) {
      onShowToast(`שגיאה בטעינת הקובץ: ${err}`);
    }
    e.target.value = '';
  };

  const handleManualSaveNow = async () => {
    const res = await saveTasksToComputerDisk(tasks);
    if (res.savedToTauri) {
      onShowToast(`נשמר בהצלחה בדיסק המחשב: ${res.filePath || 'tactic-tasks.json'}`);
    } else if (res.savedToFile) {
      onShowToast(`נשמר ישירות לקובץ המקושר במחשב: ${linkedFile}`);
    } else {
      handleExportNow();
    }
  };

  const isFileSystemAccessSupported = typeof window !== 'undefined' && Boolean((window as any).showSaveFilePicker);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-neutral-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-neutral-50/70">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
              <HardDrive className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-neutral-900">
                שמירת נתונים ישירות על המחשב
              </h3>
              <p className="text-xs text-neutral-500">
                ניהול אחסון פיזי בדיסק המקומי ללא תלות בדפדפן
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs sm:text-sm text-neutral-700">
          {/* Status Badge */}
          {isTauri ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 space-y-1.5">
              <div className="flex items-center gap-2 text-emerald-900 font-bold">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>מצב אפליקציית מחשב עצמאית (Tauri) פעיל</span>
              </div>
              <p className="text-xs text-emerald-800 leading-relaxed">
                כל שינוי במשימות נכתב אוטומטית לקובץ פיזי מקומי בדיסק הקשיח בנתיב המערכת:
                <br />
                <code className="font-mono bg-white/80 px-2 py-0.5 rounded border border-emerald-300 text-emerald-950 text-[11px] mt-1 inline-block">
                  %APPDATA%\Tactic\tactic-tasks.json
                </code>
              </p>
            </div>
          ) : linkedFile ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-900 font-bold">
                  <FolderCheck className="h-4 w-4 text-emerald-600" />
                  <span>מחובר ישירות לקובץ פיזי במחשב שלך!</span>
                </div>
                <button
                  type="button"
                  onClick={handleUnlinkFile}
                  className="flex items-center gap-1 text-[11px] text-rose-700 hover:text-rose-900 font-semibold"
                >
                  <Unlink className="h-3 w-3" />
                  <span>נתק קובץ</span>
                </button>
              </div>
              <p className="text-xs text-emerald-800">
                קובץ פעיל: <strong className="font-mono text-emerald-950">{linkedFile}</strong>
                <br />
                בכל פעם שאתה מוסיף, מעדכן או מסמן משימה, האפליקציה כותבת ישירות לקובץ זה בדיסק הקשיח.
              </p>
            </div>
          ) : (
            <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-4 space-y-3">
              <div className="flex items-center gap-2 text-indigo-950 font-bold">
                <HardDrive className="h-4 w-4 text-indigo-600" />
                <span>חיבור קובץ קבוע במחשב לשמירה אוטומטית</span>
              </div>
              <p className="text-xs text-neutral-600 leading-relaxed">
                באפשרותך לבחור מיקום פיזי במחשב שלך (למשל במסמכים או בשולחן העבודה). מאותו רגע, כל פעולה באפליקציה תישמר באופן ישיר לקובץ זה בדיסק.
              </p>

              {isFileSystemAccessSupported ? (
                <button
                  type="button"
                  onClick={handleLinkFile}
                  disabled={isLinking}
                  className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-xs transition-all shadow-xs"
                >
                  <Link className="h-4 w-4" />
                  <span>{isLinking ? 'בוחר קובץ...' : 'בחר קובץ במחשב לשמירה אוטומטית קבועה (JSON)'}</span>
                </button>
              ) : (
                <div className="flex items-center gap-1.5 text-xs text-amber-800 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                  <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
                  <span>דפדפן זה אינו תומך בבחירת קובץ ישירה. ניתן לשמור קובץ למחשב באמצעות הכפתור מטה.</span>
                </div>
              )}
            </div>
          )}

          {/* Quick Manual Disk Actions */}
          <div className="space-y-3 pt-1">
            <h4 className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
              <FolderCheck className="h-4 w-4 text-indigo-600" />
              <span>פעולות קבצים מהירות במחשב</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Save directly now */}
              <button
                type="button"
                onClick={handleExportNow}
                className="flex items-center justify-between p-3.5 rounded-xl border border-neutral-200 bg-neutral-50/70 hover:bg-white hover:border-neutral-300 transition-all text-right group"
              >
                <div>
                  <div className="font-bold text-neutral-900 text-xs flex items-center gap-1.5">
                    <Download className="h-3.5 w-3.5 text-emerald-600" />
                    <span>שמור קובץ במחשב כעת</span>
                  </div>
                  <p className="text-[11px] text-neutral-500 mt-1">
                    מוריד את כל המשימות כקובץ JSON ישירות לתיקיית ההורדות במחשב.
                  </p>
                </div>
              </button>

              {/* Load from computer file */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-between p-3.5 rounded-xl border border-neutral-200 bg-neutral-50/70 hover:bg-white hover:border-neutral-300 transition-all text-right group"
              >
                <div>
                  <div className="font-bold text-neutral-900 text-xs flex items-center gap-1.5">
                    <Upload className="h-3.5 w-3.5 text-indigo-600" />
                    <span>טען קובץ מהמחשב</span>
                  </div>
                  <p className="text-[11px] text-neutral-500 mt-1">
                    טוען ומשחזר משימות מקובץ JSON שנשמר בעבר במחשב.
                  </p>
                </div>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleImportFile}
                className="hidden"
              />
            </div>
          </div>

          {/* Privacy & Safety Note */}
          <div className="flex items-center gap-2 p-3 rounded-xl bg-neutral-50 border border-neutral-200 text-neutral-500 text-[11px]">
            <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>
              <strong>פרטיות מלאה ואופליין 100%:</strong> כל הנתונים נשמרים מקומית על המחשב שלך בלבד. שום מידע אינו נשלח לשרת חיצוני.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-100 bg-neutral-50 flex items-center justify-between">
          <span className="text-[11px] text-neutral-500 font-mono">
            {tasks.length} משימות שמורות במערכת
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            סגור
          </button>
        </div>
      </div>
    </div>
  );
};
