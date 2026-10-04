import React, { useRef } from 'react';
import { 
  CheckSquare, 
  BarChart3, 
  Clock, 
  Plus, 
  RotateCcw, 
  Bell, 
  FileCode,
  ShieldCheck,
  Calendar,
  FileJson,
  Upload,
  Eye,
  Archive,
  Laptop,
  HardDrive
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

interface TopNavProps {
  activeTab: 'tasks' | 'performance' | 'hourly' | 'calendar' | 'history';
  setActiveTab: (tab: 'tasks' | 'performance' | 'hourly' | 'calendar' | 'history') => void;
  onOpenNewTask: () => void;
  onResetData: () => void;
  totalPendingCount: number;
  historyCount?: number;
  onDownloadHtml: () => void;
  onTestNotification: () => void;
  notificationPermission: NotificationPermission | 'unsupported';
  onRequestNotificationPermission: () => void;
  onExportJson: () => void;
  onImportJson: (e: React.ChangeEvent<HTMLInputElement>) => void;
  showGregorianDates?: boolean;
  onToggleGregorianDates?: () => void;
  onOpenExeModal?: () => void;
  onOpenDiskStorageModal?: () => void;
  isDiskFileLinked?: boolean;
  linkedDiskFileName?: string | null;
}

export const TopNav: React.FC<TopNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewTask,
  onResetData,
  totalPendingCount,
  historyCount = 0,
  onDownloadHtml,
  onTestNotification,
  notificationPermission,
  onRequestNotificationPermission,
  onExportJson,
  onImportJson,
  showGregorianDates = false,
  onToggleGregorianDates,
  onOpenExeModal,
  onOpenDiskStorageModal,
  isDiskFileLinked = false,
  linkedDiskFileName = null,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-3 sm:px-6 py-2.5 sm:py-3">
        {/* Zone 1: Wordmark brand with offline status */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-xs">
            <CheckSquare className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-neutral-900 block leading-tight">
              טקטיק
            </span>
            <span className="text-[10px] text-emerald-700 font-medium flex items-center gap-1">
              <ShieldCheck className="h-3 w-3 text-emerald-600" />
              100% אופליין בדפדפן
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Links (Tasks, Calendar, Performance, Hourly) */}
        <nav className="flex items-center gap-1 sm:gap-1.5">
          <button
            onClick={() => setActiveTab('tasks')}
            className={`flex items-center gap-1.5 sm:gap-2 rounded-lg px-2.5 sm:px-3.5 py-2 text-xs sm:text-sm font-medium transition-colors ${
              activeTab === 'tasks'
                ? 'bg-neutral-100 text-neutral-900 font-semibold'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
            }`}
          >
            <CheckSquare className="h-4 w-4" />
            <span>משימות</span>
            {totalPendingCount > 0 && (
              <span className="mr-1 rounded-full bg-indigo-100 text-indigo-700 px-1.5 py-0.2 text-xs font-medium tabular-nums">
                {totalPendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex items-center gap-1.5 sm:gap-2 rounded-lg px-2.5 sm:px-3.5 py-2 text-xs sm:text-sm font-medium transition-colors ${
              activeTab === 'calendar'
                ? 'bg-neutral-100 text-neutral-900 font-semibold'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
            }`}
          >
            <Calendar className="h-4 w-4" />
            <span>לוח שנה עברי</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-1.5 sm:gap-2 rounded-lg px-2.5 sm:px-3.5 py-2 text-xs sm:text-sm font-medium transition-colors ${
              activeTab === 'history'
                ? 'bg-neutral-100 text-neutral-900 font-semibold'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
            }`}
          >
            <Archive className="h-4 w-4" />
            <span>היסטוריית משימות</span>
            {historyCount > 0 && (
              <span className="mr-1 rounded-full bg-amber-100 text-amber-800 px-1.5 py-0.2 text-xs font-semibold tabular-nums">
                {historyCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('performance')}
            className={`flex items-center gap-1.5 sm:gap-2 rounded-lg px-2.5 sm:px-3.5 py-2 text-xs sm:text-sm font-medium transition-colors ${
              activeTab === 'performance'
                ? 'bg-neutral-100 text-neutral-900 font-semibold'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            <span>ביצועים והשוואה</span>
          </button>

          <button
            onClick={() => setActiveTab('hourly')}
            className={`hidden md:flex items-center gap-1.5 sm:gap-2 rounded-lg px-2.5 sm:px-3.5 py-2 text-xs sm:text-sm font-medium transition-colors ${
              activeTab === 'hourly'
                ? 'bg-neutral-100 text-neutral-900 font-semibold'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
            }`}
          >
            <Clock className="h-4 w-4" />
            <span>לו״ז שעתי</span>
          </button>
        </nav>

        {/* Zone 3: Primary Actions & Backup Tools */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* JSON Export / Import */}
          <div className="hidden lg:flex items-center gap-1 bg-neutral-100/70 p-0.5 rounded-lg border border-neutral-200/80">
            <button
              onClick={onExportJson}
              title="ייצוא כל המשימות והרצפים לקובץ JSON"
              className="flex items-center gap-1 text-[11px] text-neutral-700 hover:text-neutral-900 px-2 py-1 rounded hover:bg-white transition-colors"
            >
              <FileJson className="h-3 w-3 text-indigo-600" />
              <span>ייצוא JSON</span>
            </button>
            <div className="h-3 w-px bg-neutral-300" />
            <button
              onClick={() => fileInputRef.current?.click()}
              title="ייבוא משימות מקובץ JSON"
              className="flex items-center gap-1 text-[11px] text-neutral-700 hover:text-neutral-900 px-2 py-1 rounded hover:bg-white transition-colors"
            >
              <Upload className="h-3 w-3 text-indigo-600" />
              <span>ייבוא</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={onImportJson}
              className="hidden"
            />
          </div>

          {/* Save to Computer Disk Modal */}
          {onOpenDiskStorageModal && (
            <button
              type="button"
              onClick={onOpenDiskStorageModal}
              title={linkedDiskFileName ? `שמירה ישירה לקובץ במחשב: ${linkedDiskFileName}` : "שמירת נתונים ישירות על המחשב (דיסק מקומי)"}
              className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg transition-colors font-medium border shadow-2xs whitespace-nowrap ${
                isDiskFileLinked
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold'
                  : 'bg-white hover:bg-neutral-50 text-neutral-700 border-neutral-200'
              }`}
            >
              <HardDrive className={`h-3.5 w-3.5 ${isDiskFileLinked ? 'text-emerald-600' : 'text-indigo-600'}`} />
              <span className="hidden sm:inline">{isDiskFileLinked ? `שמור במחשב: ${linkedDiskFileName}` : 'שמירה במחשב'}</span>
              <span className="sm:hidden">מחשב</span>
            </button>
          )}

          {/* Desktop EXE App Info / Download */}
          {onOpenExeModal && (
            <button
              type="button"
              onClick={onOpenExeModal}
              title="מידע על יצירת קובץ EXE מ-GitHub והורדת אפליקציית מחשב"
              className="flex items-center gap-1.5 text-xs text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-2.5 py-1.5 rounded-lg transition-colors font-semibold shadow-2xs whitespace-nowrap"
            >
              <Laptop className="h-3.5 w-3.5 text-indigo-600" />
              <span className="hidden sm:inline">גרסת מחשב (EXE)</span>
              <span className="sm:hidden">EXE</span>
            </button>
          )}

          {/* Standalone HTML Download */}
          <button
            onClick={onDownloadHtml}
            title="הורד קובץ HTML מלא ועצמאי לשמירה מקומית על המחשב ללא צורך בשרת"
            className="hidden sm:flex items-center gap-1 text-xs text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap"
          >
            <FileCode className="h-3.5 w-3.5 text-indigo-600" />
            <span>HTML עצמאי</span>
          </button>

          {/* Browser Notification test / prompt */}
          {notificationPermission !== 'granted' ? (
            <button
              onClick={onRequestNotificationPermission}
              title="הפעל תזכורות דפדפן"
              className="flex items-center gap-1 text-xs text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2 py-1.5 rounded-lg transition-colors"
            >
              <Bell className="h-3.5 w-3.5 text-amber-600" />
              <span className="hidden xl:inline">הפעל תזכורות</span>
            </button>
          ) : (
            <button
              onClick={onTestNotification}
              title="בדיקת צליל ותזכורת דפדפן"
              className="hidden sm:flex items-center gap-1 text-xs text-neutral-600 hover:text-neutral-900 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 px-2 py-1.5 rounded-lg transition-colors"
            >
              <Bell className="h-3.5 w-3.5 text-indigo-600" />
            </button>
          )}

          {/* Gregorian Dates Toggle Button */}
          {onToggleGregorianDates && (
            <button
              type="button"
              onClick={onToggleGregorianDates}
              title={showGregorianDates ? 'הסתר תאריכים לועזיים (חזרה לתאריך עברי בלבד)' : 'הצג תאריכים לועזיים לצד התאריך העברי'}
              className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border transition-colors ${
                showGregorianDates
                  ? 'bg-neutral-200 border-neutral-300 text-neutral-900 font-semibold'
                  : 'text-neutral-600 hover:text-neutral-900 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200'
              }`}
            >
              <Eye className="h-3.5 w-3.5 text-indigo-600" />
              <span className="hidden sm:inline">{showGregorianDates ? 'הסתר לועזי' : 'בדוק לועזי'}</span>
            </button>
          )}

          {/* PWA Install Button */}
          <PWAInstallButton />

          <button
            onClick={onResetData}
            title="איפוס נתוני הדגמה"
            className="hidden xl:flex items-center p-2 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100 transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>

          {/* New Task Button */}
          <button
            onClick={onOpenNewTask}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 sm:px-3.5 py-1.5 text-xs sm:text-sm font-medium text-white shadow-xs hover:bg-indigo-700 active:scale-95 transition-all whitespace-nowrap"
          >
            <Plus className="h-4 w-4" />
            <span>משימה חדשה</span>
          </button>
        </div>
      </div>
    </header>
  );
};
