import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Task, TaskScope, TaskCategory } from './types/task';
import { 
  loadTasksFromStorage, 
  saveTasksToStorage, 
  resetTasksToDefaults, 
  checkAndRenewTasks 
} from './utils/storage';
import { getPeriodKey, getPeriodLabel, formatHebrewDate } from './utils/dateUtils';
import { 
  getNotificationPermission, 
  requestNotificationPermission, 
  sendBrowserNotification, 
  playNotificationChime 
} from './utils/notifications';
import { downloadStandaloneHtml } from './utils/exportHtml';
import { exportTasksToJson, importTasksFromJson } from './utils/exportJson';
import { TopNav } from './components/TopNav';
import { ScopeTabs } from './components/ScopeTabs';
import { QuickAddTask } from './components/QuickAddTask';
import { TaskCard } from './components/TaskCard';
import { TaskModal } from './components/TaskModal';
import { PerformanceDashboard } from './components/PerformanceDashboard';
import { HourlyTimeline } from './components/HourlyTimeline';
import { CalendarView } from './components/CalendarView';
import { TaskHistoryView } from './components/TaskHistoryView';
import { DesktopExeModal } from './components/DesktopExeModal';
import { LocalDiskStorageModal } from './components/LocalDiskStorageModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { HebrewDateBadge } from './components/HebrewDateBadge';
import { 
  restoreLinkedFileHandle, 
  loadTasksFromTauriDisk, 
  getLinkedFileName, 
  isTauriEnvironment 
} from './utils/localDiskStorage';
import { 
  Plus, 
  RotateCw, 
  CheckCircle2, 
  Flame, 
  Sparkles, 
  FilterX,
  Calendar,
  Layers,
  Bell,
  Download,
  ShieldCheck,
  FileCode,
  FileJson,
  Archive,
  Laptop,
  HardDrive
} from 'lucide-react';

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(() => loadTasksFromStorage());
  const [activeTab, setActiveTab] = useState<'tasks' | 'performance' | 'hourly' | 'calendar' | 'history'>('tasks');
  const [selectedScope, setSelectedScope] = useState<'all' | TaskScope>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | TaskCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showGregorianHelper, setShowGregorianHelper] = useState(false);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExeModalOpen, setIsExeModalOpen] = useState(false);
  const [isDiskModalOpen, setIsDiskModalOpen] = useState(false);
  const [linkedDiskFileName, setLinkedDiskFileName] = useState<string | null>(null);
  const [isTauriApp, setIsTauriApp] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [modalDefaultScope, setModalDefaultScope] = useState<TaskScope>('daily');
  const [modalDefaultDate, setModalDefaultDate] = useState<string | undefined>(undefined);

  // Feedback toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Notification permission state
  const [notifPermission, setNotifPermission] = useState<NotificationPermission | 'unsupported'>(
    getNotificationPermission()
  );

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? null : curr));
    }, 4000);
  };

  // Check for native Tauri environment and restore linked disk file handle on mount
  useEffect(() => {
    const tauri = isTauriEnvironment();
    setIsTauriApp(tauri);

    if (tauri) {
      loadTasksFromTauriDisk().then((diskTasks) => {
        if (diskTasks && diskTasks.length > 0) {
          setTasks(diskTasks);
          showToast('נתוני המשימות נטענו ישירות מדיסק המחשב (Tauri) 💾');
        }
      });
    } else {
      restoreLinkedFileHandle().then((fileName) => {
        if (fileName) {
          setLinkedDiskFileName(fileName);
        }
      });
    }
  }, []);

  // Save to storage on tasks change
  useEffect(() => {
    saveTasksToStorage(tasks);
  }, [tasks]);

  // Periodic check for cycle shift every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setTasks((prev) => {
        const renewed = checkAndRenewTasks(prev);
        return renewed;
      });
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Browser Reminder Check Interval (every 15 seconds)
  useEffect(() => {
    const reminderTimer = setInterval(() => {
      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMinutes = String(now.getMinutes()).padStart(2, '0');
      const currentTimeStr = `${currentHours}:${currentMinutes}`;
      const todayDateStr = now.toISOString().split('T')[0];

      setTasks((prevTasks) => {
        let changed = false;
        const updated = prevTasks.map((task) => {
          if (!task.reminderEnabled || !task.reminderTime || task.completed) {
            return task;
          }

          // Check if reminderTime matches current minute
          if (task.reminderTime === currentTimeStr) {
            const alreadyNotified = task.reminderNotifiedPeriods?.includes(todayDateStr);
            if (!alreadyNotified) {
              changed = true;
              sendBrowserNotification(`⏰ תזכורת: ${task.title}`, {
                body: task.description || `הגיע הזמן לבצע את המשימה (${task.reminderTime})`,
                tag: `reminder-${task.id}-${todayDateStr}`,
              });
              showToast(`⏰ תזכורת הופעלה: ${task.title}`);

              return {
                ...task,
                reminderNotifiedPeriods: [...(task.reminderNotifiedPeriods || []), todayDateStr],
              };
            }
          }
          return task;
        });

        return changed ? updated : prevTasks;
      });
    }, 15000);

    return () => clearInterval(reminderTimer);
  }, []);

  // Request browser notification permission
  const handleRequestNotificationPermission = async () => {
    const res = await requestNotificationPermission();
    setNotifPermission(res);
    if (res === 'granted') {
      showToast('תזכורות דפדפן הופעלו בהצלחה!');
    } else if (res === 'denied') {
      showToast('התראות דפדפן נחסמו בהגדרות הדפדפן שלך.');
    }
  };

  // Test notification button
  const handleTestNotification = () => {
    playNotificationChime();
    sendBrowserNotification('בדיקת תזכורת וצליל של טקטיק', {
      body: 'מערכת התזכורות והצלילים פועלת 100% מקומית ואופליין בדפדפן!',
      tag: 'test-reminder',
    });
    showToast('צליל ותזכורת בדיקה הופעלו בהצלחה 🔔');
  };

  // Download standalone single-file HTML
  const handleDownloadHtml = () => {
    downloadStandaloneHtml(tasks);
    showToast('קובץ HTML מלא ועצמאי הורד בהצלחה! ניתן להפעיל אותו מכל מכשיר אופליין.');
  };

  // JSON Export
  const handleExportJson = () => {
    exportTasksToJson(tasks);
    showToast('קובץ JSON יוצא בהצלחה!');
  };

  // JSON Import
  const handleImportJson = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const importedTasks = await importTasksFromJson(file);
      setTasks(importedTasks);
      showToast(`ייבוא הושלם בהצלחה! נטענו ${importedTasks.length} משימות.`);
    } catch (err: any) {
      showToast(`שגיאה בייבוא הקובץ: ${err}`);
    }
    // reset input
    e.target.value = '';
  };

  // Quantitative Progress Update Handler
  const handleUpdateProgress = (taskId: string, increment: number) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== taskId || !task.isProgressTask) return task;

        const oldVal = task.currentValue || 0;
        const target = task.targetValue || 1;
        const newVal = Math.max(0, oldVal + increment);

        let completed = task.completed;
        let streak = task.streak;
        let bestStreak = task.bestStreak;

        // Auto-complete if reached target
        if (newVal >= target && !task.completed) {
          completed = true;
          streak = (task.streak || 0) + 1;
          bestStreak = Math.max(task.bestStreak || 0, streak);
          playNotificationChime();
          showToast(`מזל טוב! יעד ${task.title} הושלם במלואו (${newVal.toLocaleString()} ${task.unit || ''}) 🎉`);
        } else if (newVal < target && task.completed) {
          completed = false;
        }

        return {
          ...task,
          currentValue: newVal,
          completed,
          streak,
          bestStreak,
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  // Scope counts for badges in main task view (active or recurring)
  const scopeCounts = useMemo(() => {
    // Only count active or recurring tasks in main scope tabs
    const mainTasks = tasks.filter((t) => !(t.completed && !t.renewOnNextPeriod));
    const counts: Record<string, { total: number; completed: number; pending: number }> = {
      all: { 
        total: mainTasks.length, 
        completed: mainTasks.filter((t) => t.completed).length, 
        pending: mainTasks.filter((t) => !t.completed).length 
      },
    };
    const scopes: TaskScope[] = ['hourly', 'daily', 'weekly', 'monthly', 'yearly', 'custom', 'general'];
    for (const sc of scopes) {
      const scopeTasks = mainTasks.filter((t) => t.scope === sc);
      counts[sc] = {
        total: scopeTasks.length,
        completed: scopeTasks.filter((t) => t.completed).length,
        pending: scopeTasks.filter((t) => !t.completed).length,
      };
    }
    return counts;
  }, [tasks]);

  // Count of completed tasks that do NOT renew (archived in task history)
  const historyTasksCount = useMemo(() => {
    return tasks.filter((t) => t.completed && !t.renewOnNextPeriod).length;
  }, [tasks]);

  // Filtered task list:
  // Completed tasks that do NOT renew appear strictly in the dedicated History tab!
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Exclude completed non-renewing tasks from the active task list
      if (task.completed && !task.renewOnNextPeriod) return false;
      // Scope filter
      if (selectedScope !== 'all' && task.scope !== selectedScope) return false;
      // Status filter
      if (statusFilter === 'active' && task.completed) return false;
      if (statusFilter === 'completed' && !task.completed) return false;
      // Category filter
      if (categoryFilter !== 'all' && task.category !== categoryFilter) return false;
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesTitle = task.title.toLowerCase().includes(query);
        const matchesDesc = task.description?.toLowerCase().includes(query) ?? false;
        if (!matchesTitle && !matchesDesc) return false;
      }
      return true;
    });
  }, [tasks, selectedScope, statusFilter, categoryFilter, searchQuery]);

  // Handlers
  const handleToggleComplete = (taskId: string) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) => {
        if (task.id !== taskId) return task;

        const nextCompleted = !task.completed;
        const now = new Date();
        const currentPeriodKey = task.currentPeriodKey || getPeriodKey(task.scope, now, task.customDaysInterval);

        if (nextCompleted) {
          playNotificationChime();
          const isPastDue = !!task.targetDate && new Date(task.targetDate + 'T23:59:59').getTime() < now.getTime();
          let daysLate: number | undefined = undefined;
          if (isPastDue && task.targetDate) {
            const targetEnd = new Date(task.targetDate + 'T23:59:59').getTime();
            const diffMs = now.getTime() - targetEnd;
            daysLate = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
          }

          const durationMs = task.createdAt
            ? Math.max(1000, now.getTime() - new Date(task.createdAt).getTime())
            : undefined;

          const newStreak = (task.streak || 0) + 1;
          const bestStreak = Math.max(task.bestStreak || 0, newStreak);
          const newRecord = {
            periodKey: currentPeriodKey,
            completedAt: now.toISOString(),
            periodLabel: getPeriodLabel(task.scope, currentPeriodKey),
            onTime: !isPastDue,
          };
          const updatedHistory = [...task.history, newRecord];

          if (isPastDue) {
            showToast(`המשימה "${task.title}" הושלמה באיחור (${daysLate} ימים לאחר התפוגה) וסומנה בסימון מיוחד ⚠️`);
          } else if (task.renewOnNextPeriod) {
            showToast(`כל הכבוד! המשימה הושלמה ורצף ההצלחות שלך עלה ל-${newStreak} 🔥`);
          } else {
            showToast(`המשימה "${task.title}" הושלמה בהצלחה! ✨`);
          }

          return {
            ...task,
            completed: true,
            completedAt: now.toISOString(),
            completedLate: isPastDue,
            daysLate: isPastDue ? daysLate : undefined,
            completionDurationMs: durationMs,
            streak: newStreak,
            bestStreak,
            totalCompletions: (task.totalCompletions || 0) + 1,
            history: updatedHistory,
            // If it's a progress task, complete to 100%
            currentValue: task.isProgressTask && task.targetValue ? task.targetValue : task.currentValue,
            updatedAt: now.toISOString(),
          };
        } else {
          // Reverting completion
          const newStreak = Math.max(0, (task.streak || 1) - 1);
          return {
            ...task,
            completed: false,
            completedAt: undefined,
            completedLate: false,
            daysLate: undefined,
            streak: newStreak,
            totalCompletions: Math.max(0, (task.totalCompletions || 1) - 1),
            history: task.history.filter((h) => h.periodKey !== currentPeriodKey),
            updatedAt: now.toISOString(),
          };
        }
      })
    );
  };

  const handleToggleSubtask = (taskId: string, subtaskId: string) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== taskId) return task;
        return {
          ...task,
          subtasks: task.subtasks.map((st) =>
            st.id === subtaskId ? { ...st, completed: !st.completed } : st
          ),
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  // Manual fast renewal to test next cycle
  const handleManualRenew = (taskId: string) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== taskId) return task;

        const nextCycleKey = `cycle-${Date.now().toString(36)}`;
        showToast(`המשימה "${task.title}" חודשה למחזור הבא עם רצף של ${task.streak} 🔥`);

        return {
          ...task,
          currentPeriodKey: nextCycleKey,
          completed: false,
          completedAt: undefined,
          // If progress task, reset current value for the new period
          currentValue: task.isProgressTask ? 0 : task.currentValue,
          subtasks: task.subtasks.map((st) => ({ ...st, completed: false })),
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  const handleQuickAdd = (title: string, scope: TaskScope, renew: boolean) => {
    const now = new Date();
    const currentKey = getPeriodKey(scope, now);
    const newTask: Task = {
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title,
      scope,
      priority: 'medium',
      category: 'work',
      renewOnNextPeriod: renew,
      completed: false,
      currentPeriodKey: currentKey,
      streak: 0,
      bestStreak: 0,
      totalCompletions: 0,
      history: [],
      subtasks: [],
      targetHour: scope === 'hourly' ? '10:00 - 11:00' : undefined,
      customDaysInterval: scope === 'custom' ? 3 : undefined,
      targetDate: scope === 'daily' || scope === 'custom' ? now.toISOString().split('T')[0] : undefined,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };
    setTasks((prev) => [newTask, ...prev]);
    showToast(`משימה חדשה נוספה בהצלחה!`);
  };

  const handleSaveModalTask = (taskData: Partial<Task>) => {
    const now = new Date();
    if (editingTask) {
      // Update existing
      setTasks((prev) =>
        prev.map((t) =>
          t.id === editingTask.id
            ? { ...t, ...taskData, updatedAt: now.toISOString() }
            : t
        )
      );
      showToast('המשימה עודכנה בהצלחה!');
    } else {
      // Create new
      const currentKey = getPeriodKey(taskData.scope || 'daily', now, taskData.customDaysInterval);
      const newTask: Task = {
        id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        title: taskData.title || '',
        description: taskData.description,
        scope: taskData.scope || 'daily',
        priority: taskData.priority || 'medium',
        category: taskData.category || 'work',
        targetHour: taskData.targetHour,
        targetDate: taskData.targetDate,
        customDaysInterval: taskData.customDaysInterval,
        renewOnNextPeriod: taskData.renewOnNextPeriod ?? true,
        reminderEnabled: taskData.reminderEnabled,
        reminderTime: taskData.reminderTime,
        isProgressTask: taskData.isProgressTask,
        targetValue: taskData.targetValue,
        currentValue: taskData.currentValue,
        unit: taskData.unit,
        progressStep: taskData.progressStep,
        completed: false,
        currentPeriodKey: currentKey,
        streak: 0,
        bestStreak: 0,
        totalCompletions: 0,
        history: [],
        subtasks: taskData.subtasks || [],
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      };
      setTasks((prev) => [newTask, ...prev]);
      showToast('משימה חדשה נוצרה בהצלחה!');
    }
    setEditingTask(null);
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    showToast('המשימה נמחקה');
  };

  const handleDuplicateTask = (task: Task) => {
    const now = new Date();
    const duplicated: Task = {
      ...task,
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title: `${task.title} (העתק)`,
      completed: false,
      completedAt: undefined,
      streak: 0,
      bestStreak: 0,
      totalCompletions: 0,
      history: [],
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };
    setTasks((prev) => [duplicated, ...prev]);
    showToast('המשימה שוכפלה');
  };

  const handleResetData = () => {
    if (window.confirm('האם לאפס את כל המשימות לנתוני ברירת המחדל להדגמה?')) {
      const reset = resetTasksToDefaults();
      setTasks(reset);
      showToast('נתוני ההדגמה אופסו בהצלחה');
    }
  };

  // Restore task from history back to active
  const handleRestoreTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        return {
          ...t,
          completed: false,
          completedAt: undefined,
          completedLate: false,
          daysLate: undefined,
          updatedAt: new Date().toISOString(),
        };
      })
    );
    showToast('המשימה הוחזרה לרשימת המשימות הפעילות ↩️');
  };

  // Convert non-renewing archived task to renewing periodic task
  const handleConvertToRenewing = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        return {
          ...t,
          renewOnNextPeriod: true,
          updatedAt: new Date().toISOString(),
        };
      })
    );
    showToast('המשימה הוגדרה כמשימה מחזורית שמתחדשת אוטומטית במחזור הבא 🔄');
  };

  // Clear all archived history tasks permanently
  const handleClearHistory = () => {
    if (window.confirm('האם אתה בטוח שברצונך לנקות את כל המשימות שהושלמו מהארכיון וההיסטוריה לצמיתות?')) {
      setTasks((prev) => prev.filter((t) => !(t.completed && !t.renewOnNextPeriod)));
      showToast('היסטוריית המשימות נוקתה לצמיתות 🗑️');
    }
  };

  const totalPending = tasks.filter((t) => !t.completed).length;

  return (
    <div className="min-h-screen bg-neutral-50/80 text-neutral-900 pb-16">
      {/* Offline Connectivity Warning */}
      <OfflineIndicator />

      {/* Top Bar Navigation */}
      <TopNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewTask={() => {
          setEditingTask(null);
          setModalDefaultDate(undefined);
          setModalDefaultScope(selectedScope === 'all' ? 'daily' : selectedScope);
          setIsModalOpen(true);
        }}
        onResetData={handleResetData}
        totalPendingCount={totalPending}
        historyCount={historyTasksCount}
        onDownloadHtml={handleDownloadHtml}
        onTestNotification={handleTestNotification}
        notificationPermission={notifPermission}
        onRequestNotificationPermission={handleRequestNotificationPermission}
        onExportJson={handleExportJson}
        onImportJson={handleImportJson}
        showGregorianDates={showGregorianHelper}
        onToggleGregorianDates={() => setShowGregorianHelper(!showGregorianHelper)}
        onOpenExeModal={() => setIsExeModalOpen(true)}
        onOpenDiskStorageModal={() => setIsDiskModalOpen(true)}
        isDiskFileLinked={isTauriApp || Boolean(linkedDiskFileName)}
        linkedDiskFileName={isTauriApp ? 'Tauri (קובץ מקומי)' : linkedDiskFileName}
      />

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-3 sm:px-6 pt-5">
        {/* Offline & Features Kicker Banner */}
        <div className="mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-indigo-100 bg-indigo-50/50 p-3 text-xs text-indigo-950">
          <div className="flex flex-wrap items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-indigo-600 shrink-0" />
            <span>
              <strong>אפליקציה עצמאית 100% אופליין:</strong> כולל לוח שנה עברי, תזכורות דפדפן, מעקב יעדים כספיים ושמירה פיזית במחשב.
            </span>
            {isTauriApp && (
              <span className="inline-flex items-center gap-1 text-emerald-900 font-bold bg-emerald-100/90 px-2 py-0.5 rounded-md border border-emerald-300 text-[11px]">
                <HardDrive className="h-3 w-3 text-emerald-600" />
                <span>שמירה מקומית בדיסק פעילה (Tauri)</span>
              </span>
            )}
            {linkedDiskFileName && !isTauriApp && (
              <span className="inline-flex items-center gap-1 text-emerald-900 font-bold bg-emerald-100/90 px-2 py-0.5 rounded-md border border-emerald-300 text-[11px]">
                <HardDrive className="h-3 w-3 text-emerald-600" />
                <span>מחובר לקובץ במחשב: {linkedDiskFileName}</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsDiskModalOpen(true)}
              title="ניהול שמירת קובץ ישירות על דיסק המחשב"
              className="flex items-center gap-1 font-semibold text-emerald-800 hover:text-emerald-950 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 px-2.5 py-1 rounded-lg hover:shadow-2xs transition-all"
            >
              <HardDrive className="h-3.5 w-3.5 text-emerald-600" />
              <span>שמירה במחשב</span>
            </button>
            <button
              onClick={handleExportJson}
              className="flex items-center gap-1 font-semibold text-neutral-700 hover:text-neutral-900 bg-white border border-neutral-200 px-2.5 py-1 rounded-lg hover:shadow-2xs transition-all"
            >
              <FileJson className="h-3.5 w-3.5 text-indigo-600" />
              <span>גיבוי JSON</span>
            </button>
            <button
              onClick={handleDownloadHtml}
              className="flex items-center gap-1 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-2.5 py-1 rounded-lg shadow-2xs transition-all"
            >
              <FileCode className="h-3.5 w-3.5" />
              <span>שמור HTML</span>
            </button>
          </div>
        </div>

        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-xl bg-neutral-900 px-4 py-2.5 text-xs sm:text-sm font-medium text-white shadow-lg animate-in fade-in slide-in-from-bottom-2">
            <Sparkles className="h-4 w-4 text-amber-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* View 1: Tasks List */}
        {activeTab === 'tasks' && (
          <div className="space-y-6">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-200/80 pb-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900">
                  ניהול משימות וטווחי זמן
                </h1>
                <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
                  הגדרת משימות לפי שעות, ימים, שבועות, חודשים, שנים ומותאם אישית עם התחדשות במחזור הבא ומעקב התקדמות.
                </p>
              </div>

              {/* Date & Overall Status */}
              <div className="flex items-center gap-3 text-xs text-neutral-500">
                <HebrewDateBadge 
                  date={new Date()} 
                  showDayName={true} 
                  forceShowGregorian={showGregorianHelper} 
                />
                <span aria-hidden="true" className="text-neutral-300">·</span>
                <span className="tabular-nums font-medium text-indigo-700">
                  {tasks.filter(t => t.completed).length}/{tasks.length} הושלמו
                </span>
              </div>
            </div>

            {/* Scope Filter Tabs */}
            <ScopeTabs
              selectedScope={selectedScope}
              onSelectScope={setSelectedScope}
              scopeCounts={scopeCounts}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              categoryFilter={categoryFilter}
              onCategoryFilterChange={setCategoryFilter}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />

            {/* Quick Add Bar */}
            <QuickAddTask
              currentScope={selectedScope}
              onAddTask={handleQuickAdd}
              onOpenFullModal={() => {
                setEditingTask(null);
                setModalDefaultScope(selectedScope === 'all' ? 'daily' : selectedScope);
                setIsModalOpen(true);
              }}
            />

            {/* Tasks Grid */}
            {filteredTasks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {filteredTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onToggleComplete={handleToggleComplete}
                    onToggleSubtask={handleToggleSubtask}
                    onEditTask={(t) => {
                      setEditingTask(t);
                      setIsModalOpen(true);
                    }}
                    onDeleteTask={handleDeleteTask}
                    onDuplicateTask={handleDuplicateTask}
                    onManualRenew={handleManualRenew}
                    onUpdateProgress={handleUpdateProgress}
                  />
                ))}
              </div>
            ) : (
              /* Empty state */
              <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-12 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 text-neutral-400 mb-3">
                  <FilterX className="h-6 w-6" />
                </div>
                <h3 className="text-base font-semibold text-neutral-900">
                  לא נמצאו משימות תואמות
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-neutral-500 max-w-sm mx-auto">
                  נסה לשנות את הסינון, לנקות את מילות החיפוש, או להוסיף משימה חדשה לטווח זה.
                </p>
                <div className="mt-5 flex justify-center gap-3">
                  <button
                    onClick={() => {
                      setSelectedScope('all');
                      setStatusFilter('all');
                      setCategoryFilter('all');
                      setSearchQuery('');
                    }}
                    className="text-xs font-medium text-neutral-600 hover:text-neutral-900 px-3 py-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-50"
                  >
                    אפס מסננים
                  </button>
                  <button
                    onClick={() => {
                      setEditingTask(null);
                      setModalDefaultScope(selectedScope === 'all' ? 'daily' : selectedScope);
                      setIsModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-indigo-700"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>הוסף משימה</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* View 2: Hebrew Calendar View */}
        {activeTab === 'calendar' && (
          <CalendarView
            tasks={tasks}
            onToggleComplete={handleToggleComplete}
            onUpdateProgress={handleUpdateProgress}
            onAddTaskForDate={(dateStr) => {
              setEditingTask(null);
              setModalDefaultScope('daily');
              setModalDefaultDate(dateStr);
              setIsModalOpen(true);
            }}
            onEditTask={(t) => {
              setEditingTask(t);
              setIsModalOpen(true);
            }}
          />
        )}

        {/* View 3: Performance & Comparison Dashboard */}
        {activeTab === 'performance' && (
          <PerformanceDashboard tasks={tasks} />
        )}

        {/* View 4: Hourly Schedule View */}
        {activeTab === 'hourly' && (
          <HourlyTimeline
            tasks={tasks}
            onToggleComplete={handleToggleComplete}
            onAddTaskForHour={(hourStr) => {
              setEditingTask(null);
              setModalDefaultScope('hourly');
              setModalDefaultDate(undefined);
              setIsModalOpen(true);
            }}
            onEditTask={(t) => {
              setEditingTask(t);
              setIsModalOpen(true);
            }}
            onManualRenew={handleManualRenew}
          />
        )}

        {/* View 5: Dedicated Task History View (משימות שהושלמו ואינן מתחדשות) */}
        {activeTab === 'history' && (
          <TaskHistoryView
            tasks={tasks}
            onRestoreTask={handleRestoreTask}
            onConvertToRenewing={handleConvertToRenewing}
            onDuplicateTask={handleDuplicateTask}
            onDeleteTask={handleDeleteTask}
            onClearHistory={handleClearHistory}
            onExportJson={handleExportJson}
          />
        )}
      </main>

      {/* Task Creation / Editing Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTask(null);
          setModalDefaultDate(undefined);
        }}
        onSaveTask={handleSaveModalTask}
        editingTask={editingTask}
        defaultScope={modalDefaultScope}
        defaultDate={modalDefaultDate}
      />

      {/* Desktop EXE & Offline Information Modal */}
      <DesktopExeModal
        isOpen={isExeModalOpen}
        onClose={() => setIsExeModalOpen(false)}
        onDownloadHtml={handleDownloadHtml}
      />

      {/* Local Disk Storage Modal */}
      <LocalDiskStorageModal
        isOpen={isDiskModalOpen}
        onClose={() => {
          setIsDiskModalOpen(false);
          setLinkedDiskFileName(getLinkedFileName());
        }}
        tasks={tasks}
        onTasksLoaded={(newTasks) => {
          setTasks(newTasks);
          saveTasksToStorage(newTasks);
        }}
        onShowToast={showToast}
      />
    </div>
  );
}
