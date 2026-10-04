import React, { useState, useMemo } from 'react';
import { Task, TaskCategory, TaskScope } from '../types/task';
import { HebrewDateBadge } from './HebrewDateBadge';
import { 
  Archive, 
  RotateCcw, 
  Trash2, 
  Search, 
  RotateCw, 
  Copy, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Calendar,
  Layers,
  FileJson,
  Sparkles,
  FilterX
} from 'lucide-react';

interface TaskHistoryViewProps {
  tasks: Task[];
  onRestoreTask: (taskId: string) => void;
  onConvertToRenewing: (taskId: string) => void;
  onDuplicateTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onClearHistory: () => void;
  onExportJson: () => void;
}

const CATEGORY_NAMES: Record<string, string> = {
  work: 'עבודה',
  personal: 'אישי',
  health: 'בריאות וכושר',
  study: 'לימודים',
  finance: 'פיננסים',
  home: 'בית ומשפחה',
  general: 'כללי',
};

const SCOPE_NAMES: Record<string, string> = {
  hourly: 'שעתית',
  daily: 'יומית',
  weekly: 'שבועית',
  monthly: 'חודשית',
  yearly: 'שנתית',
  custom: 'מותאם אישית',
  general: 'כללית',
};

export const TaskHistoryView: React.FC<TaskHistoryViewProps> = ({
  tasks,
  onRestoreTask,
  onConvertToRenewing,
  onDuplicateTask,
  onDeleteTask,
  onClearHistory,
  onExportJson,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | TaskCategory>('all');
  const [selectedScope, setSelectedScope] = useState<'all' | TaskScope>('all');

  // Filter tasks that are completed AND do NOT renew on next period
  const historyTasks = useMemo(() => {
    return tasks.filter((t) => t.completed && !t.renewOnNextPeriod);
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    return historyTasks.filter((task) => {
      if (selectedCategory !== 'all' && task.category !== selectedCategory) return false;
      if (selectedScope !== 'all' && task.scope !== selectedScope) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const inTitle = task.title.toLowerCase().includes(q);
        const inDesc = task.description?.toLowerCase().includes(q) ?? false;
        if (!inTitle && !inDesc) return false;
      }
      return true;
    }).sort((a, b) => {
      // Sort most recently completed first
      const timeA = a.completedAt ? new Date(a.completedAt).getTime() : 0;
      const timeB = b.completedAt ? new Date(b.completedAt).getTime() : 0;
      return timeB - timeA;
    });
  }, [historyTasks, selectedCategory, selectedScope, searchQuery]);

  const formatDuration = (ms?: number) => {
    if (!ms || ms <= 0) return null;
    const hours = ms / (1000 * 3600);
    if (hours < 1) {
      const minutes = Math.max(1, Math.round(ms / (1000 * 60)));
      return `${minutes} דקות`;
    }
    if (hours < 24) {
      return `${hours.toFixed(1)} שעות`;
    }
    const days = (hours / 24).toFixed(1);
    return `${days} ימים`;
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-xl border border-neutral-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
              <Archive className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-neutral-900">
                היסטוריית משימות שהושלמו (ארכיון)
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                משימות חד-פעמיות שהושלמו בהצלחה ואינן מתחדשות אוטומטית. ניתן להחזירן, לשכפלן או להפכן למחזוריות.
              </p>
            </div>
          </div>
        </div>

        {/* Global actions */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={onExportJson}
            title="ייצוא כל היסטוריית המשימות לקובץ JSON"
            className="flex items-center gap-1.5 text-xs text-neutral-700 bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 px-3 py-1.5 rounded-lg transition-colors font-medium"
          >
            <FileJson className="h-3.5 w-3.5 text-indigo-600" />
            <span>ייצוא גיבוי</span>
          </button>

          {historyTasks.length > 0 && (
            <button
              type="button"
              onClick={onClearHistory}
              title="מחיקת כל המשימות מההיסטוריה לצמיתות"
              className="flex items-center gap-1.5 text-xs text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3 py-1.5 rounded-lg transition-colors font-medium"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>נקה היסטוריה</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-neutral-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="חיפוש משימה בהיסטוריה..."
              className="w-full pl-3 pr-9 py-1.5 text-xs rounded-lg border border-neutral-200 bg-neutral-50/70 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-neutral-500 text-[11px] shrink-0">קטגוריה:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as any)}
              className="rounded-lg border border-neutral-200 bg-neutral-50/70 py-1.5 px-2 text-xs text-neutral-700"
            >
              <option value="all">כל הקטגוריות</option>
              {Object.entries(CATEGORY_NAMES).map(([id, label]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>

            {/* Scope Filter */}
            <select
              value={selectedScope}
              onChange={(e) => setSelectedScope(e.target.value as any)}
              className="rounded-lg border border-neutral-200 bg-neutral-50/70 py-1.5 px-2 text-xs text-neutral-700"
            >
              <option value="all">כל הטווחים</option>
              {Object.entries(SCOPE_NAMES).map(([id, label]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Counter Summary */}
        <div className="flex items-center justify-between text-[11px] text-neutral-500 border-t border-neutral-100 pt-2">
          <span>
            סה״כ משימות שהושלמו בארכיון: <strong className="text-neutral-900 font-mono tabular-nums">{historyTasks.length}</strong>
            {filteredTasks.length !== historyTasks.length && (
              <span> (מוצגות {filteredTasks.length})</span>
            )}
          </span>
          <span className="text-emerald-700 font-medium flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            משימות חד-פעמיות אינן מופיעות ברשימת המשימות הפעילה
          </span>
        </div>
      </div>

      {/* Task List */}
      {filteredTasks.length > 0 ? (
        <div className="space-y-3">
          {filteredTasks.map((task) => {
            const durationText = formatDuration(task.completionDurationMs);

            return (
              <div
                key={task.id}
                className="group relative rounded-xl border border-neutral-200 bg-white p-4 shadow-2xs hover:border-neutral-300 transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    {/* Checked Icon */}
                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 border border-emerald-300">
                      <CheckCircle2 className="h-3.5 w-3.5 stroke-[2.5]" />
                    </div>

                    <div className="space-y-1 min-w-0">
                      <h3 className="text-sm sm:text-base font-semibold text-neutral-800 line-through decoration-neutral-300 truncate">
                        {task.title}
                      </h3>
                      {task.description && (
                        <p className="text-xs text-neutral-500 line-clamp-2">
                          {task.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions for Archived Task */}
                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity shrink-0">
                    <button
                      type="button"
                      onClick={() => onRestoreTask(task.id)}
                      title="החזר למשימות פעילות (בטל השלמה)"
                      className="flex items-center gap-1 text-[11px] font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-2.5 py-1 rounded-md transition-colors shadow-2xs"
                    >
                      <RotateCcw className="h-3 w-3" />
                      <span>החזר לפעילות</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onConvertToRenewing(task.id)}
                      title="הגדר כמשימה מחזורית שמתחדשת אוטומטית במחזור הבא"
                      className="p-1.5 text-neutral-500 hover:text-indigo-600 hover:bg-neutral-100 rounded-md transition-colors"
                    >
                      <RotateCw className="h-3.5 w-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onDuplicateTask(task)}
                      title="שכפל משימה"
                      className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onDeleteTask(task.id)}
                      title="מחק לצמיתות מההיסטוריה"
                      className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Metadata row with Hebrew Date, Late marker, Duration, Category */}
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-neutral-500 pt-1 border-t border-neutral-100">
                  {/* Completion Hebrew Date */}
                  {task.completedAt && (
                    <div className="flex items-center gap-1 font-medium text-neutral-700">
                      <span>הושלמה:</span>
                      <HebrewDateBadge date={task.completedAt} showYear={true} />
                    </div>
                  )}

                  {/* Late completion badge if applicable */}
                  {task.completedLate && (
                    <>
                      <span aria-hidden="true" className="text-neutral-300">·</span>
                      <span 
                        className="inline-flex items-center gap-1 text-amber-950 bg-amber-100 border border-amber-300 px-1.5 py-0.2 rounded text-[11px] font-bold"
                        title={`הושלמה באיחור של ${task.daysLate || 1} ימים לאחר תאריך התפוגה`}
                      >
                        <AlertTriangle className="h-3 w-3 text-amber-600" />
                        <span>⚠️ הושלמה באיחור {task.daysLate ? `(${task.daysLate} ימים)` : ''}</span>
                      </span>
                    </>
                  )}

                  {/* Duration taken */}
                  {durationText && (
                    <>
                      <span aria-hidden="true" className="text-neutral-300">·</span>
                      <span className="flex items-center gap-1 font-mono tabular-nums text-neutral-600">
                        <Clock className="h-3 w-3 text-neutral-400" />
                        משך ביצוע: {durationText}
                      </span>
                    </>
                  )}

                  {/* Scope */}
                  <span aria-hidden="true" className="text-neutral-300">·</span>
                  <span>{SCOPE_NAMES[task.scope] || task.scope}</span>

                  {/* Category */}
                  <span aria-hidden="true" className="text-neutral-300">·</span>
                  <span>{CATEGORY_NAMES[task.category] || task.category}</span>

                  {/* Quantitative progress completed */}
                  {task.isProgressTask && task.targetValue && (
                    <>
                      <span aria-hidden="true" className="text-neutral-300">·</span>
                      <span className="font-semibold text-indigo-900 font-mono tabular-nums">
                        יעד הושג במלואו: {task.targetValue.toLocaleString()} {task.unit || ''}
                      </span>
                    </>
                  )}

                  {/* Subtasks summary */}
                  {task.subtasks.length > 0 && (
                    <>
                      <span aria-hidden="true" className="text-neutral-300">·</span>
                      <span className="text-neutral-500 font-mono tabular-nums">
                        {task.subtasks.filter(s => s.completed).length}/{task.subtasks.length} תתי-משימות
                      </span>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center space-y-3 shadow-2xs">
          <Archive className="h-12 w-12 text-neutral-300 mx-auto" />
          <h3 className="text-base font-bold text-neutral-800">
            {historyTasks.length === 0 ? 'אין משימות שהושלמו בארכיון עדיין' : 'לא נמצאו משימות התואמות את הסינון'}
          </h3>
          <p className="text-xs text-neutral-500 max-w-md mx-auto">
            משימות חד-פעמיות שתסמן כהושלמו יעברו לכאן באופן אוטומטי, כדי לשמור על לוח המשימות הראשי שלך נקי וממוקד ביעדים הפעילים.
          </p>
        </div>
      )}
    </div>
  );
};
