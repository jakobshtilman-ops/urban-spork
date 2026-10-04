import React, { useState } from 'react';
import { Task } from '../types/task';
import { 
  Check, 
  RotateCw, 
  Trash2, 
  Edit3, 
  Flame, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  Copy,
  Calendar,
  Layers,
  Bell,
  TrendingUp,
  Plus,
  Minus,
  AlertTriangle,
  AlertCircle
} from 'lucide-react';
import { formatShortHebrewDate, getHebrewDate } from '../utils/dateUtils';
import { HebrewDateBadge } from './HebrewDateBadge';

interface TaskCardProps {
  task: Task;
  onToggleComplete: (taskId: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onDuplicateTask: (task: Task) => void;
  onManualRenew: (taskId: string) => void;
  onUpdateProgress?: (taskId: string, increment: number) => void;
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

const PRIORITY_LABELS: Record<string, { label: string; textClass: string; borderClass: string }> = {
  high: { label: 'עדיפות גבוהה', textClass: 'text-rose-600 font-medium', borderClass: 'border-r-4 border-r-rose-500' },
  medium: { label: 'עדיפות בינונית', textClass: 'text-amber-600', borderClass: 'border-r-4 border-r-amber-500' },
  low: { label: 'עדיפות רגילה', textClass: 'text-neutral-500', borderClass: 'border-r-4 border-r-neutral-300' },
};

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onToggleComplete,
  onToggleSubtask,
  onEditTask,
  onDeleteTask,
  onDuplicateTask,
  onManualRenew,
  onUpdateProgress,
}) => {
  const [showSubtasks, setShowSubtasks] = useState(true);
  const [customAmount, setCustomAmount] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const priorityInfo = PRIORITY_LABELS[task.priority] || PRIORITY_LABELS.low;

  const completedSubtasksCount = task.subtasks.filter((s) => s.completed).length;
  const hasSubtasks = task.subtasks.length > 0;

  // Quantitative progress calculations
  const isProgress = !!task.isProgressTask && typeof task.targetValue === 'number' && task.targetValue > 0;
  const currVal = task.currentValue || 0;
  const targetVal = task.targetValue || 1;
  const progressPct = Math.min(100, Math.round((currVal / targetVal) * 100));
  const step = task.progressStep || (task.unit === '₪' ? 50 : 10);

  const handleAddAmount = (amount: number) => {
    if (onUpdateProgress) {
      onUpdateProgress(task.id, amount);
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(customAmount);
    if (!isNaN(parsed) && parsed !== 0 && onUpdateProgress) {
      onUpdateProgress(task.id, parsed);
      setCustomAmount('');
      setShowCustomInput(false);
    }
  };

  // Check if overdue
  const isOverdue = !!task.targetDate && !task.completed && new Date(task.targetDate + 'T23:59:59').getTime() < Date.now();

  return (
    <div
      className={`group relative rounded-xl border bg-white p-4 transition-all duration-150 ${
        priorityInfo.borderClass
      } ${
        task.completed
          ? 'border-neutral-200/60 bg-neutral-50/50 opacity-90'
          : 'border-neutral-200 shadow-xs hover:border-neutral-300 hover:shadow-sm'
      }`}
    >
      <div className="flex items-start gap-3.5">
        {/* Checkbox */}
        <button
          type="button"
          onClick={() => onToggleComplete(task.id)}
          aria-label={task.completed ? 'סמן כלא הושלם' : 'סמן כהושלם'}
          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
            task.completed
              ? 'border-emerald-600 bg-emerald-600 text-white'
              : 'border-neutral-300 hover:border-neutral-500 bg-white'
          }`}
        >
          {task.completed && <Check className="h-3.5 w-3.5 stroke-[3]" />}
        </button>

        {/* Content body */}
        <div className="min-w-0 flex-1 space-y-2">
          {/* Header row: Title + Actions */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3
                className={`text-sm sm:text-base font-semibold leading-snug transition-colors ${
                  task.completed
                    ? 'text-neutral-400 line-through'
                    : 'text-neutral-900 group-hover:text-indigo-950'
                }`}
              >
                {task.title}
              </h3>
              {task.description && (
                <p className={`mt-1 text-xs sm:text-sm leading-relaxed ${task.completed ? 'text-neutral-400' : 'text-neutral-600'}`}>
                  {task.description}
                </p>
              )}
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
              {task.renewOnNextPeriod && (
                <button
                  type="button"
                  onClick={() => onManualRenew(task.id)}
                  title="בצע חידוש למחזור הבא עכשיו (התחלת מחזור חדש וצבירת רצף)"
                  className="p-1.5 text-neutral-400 hover:text-indigo-600 hover:bg-neutral-100 rounded-md transition-colors"
                >
                  <RotateCw className="h-3.5 w-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={() => onDuplicateTask(task)}
                title="שכפל משימה"
                className="p-1.5 text-neutral-400 hover:text-neutral-800 hover:bg-neutral-100 rounded-md transition-colors"
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onEditTask(task)}
                title="ערוך משימה"
                className="p-1.5 text-neutral-400 hover:text-neutral-800 hover:bg-neutral-100 rounded-md transition-colors"
              >
                <Edit3 className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onDeleteTask(task.id)}
                title="מחק משימה"
                className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Zero-Pill Metadata Line: Clean typography with subtle bullet separators */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-neutral-500">
            {/* Scope */}
            <span className="font-medium text-neutral-700">
              {SCOPE_NAMES[task.scope] || task.scope}
            </span>

            {/* Specific Hour / Interval */}
            {task.scope === 'hourly' && task.targetHour && (
              <>
                <span aria-hidden="true" className="text-neutral-300">·</span>
                <span className="flex items-center gap-1 font-mono text-neutral-700 tabular-nums">
                  <Clock className="h-3 w-3 text-neutral-400" />
                  {task.targetHour}
                </span>
              </>
            )}

            {task.scope === 'custom' && task.customDaysInterval && (
              <>
                <span aria-hidden="true" className="text-neutral-300">·</span>
                <span>כל {task.customDaysInterval} ימים</span>
              </>
            )}

            {task.targetDate && (
              <>
                <span aria-hidden="true" className="text-neutral-300">·</span>
                <HebrewDateBadge date={task.targetDate} showYear={false} />
              </>
            )}

            {/* Late Completion Marker (הושלמה באיחור) */}
            {task.completed && task.completedLate && (
              <>
                <span aria-hidden="true" className="text-neutral-300">·</span>
                <span 
                  className="inline-flex items-center gap-1.5 text-amber-950 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-md text-xs font-bold shadow-2xs"
                  title={`משימה זו הושלמה לאחר תאריך התפוגה שלה${task.daysLate ? ` (באיחור של ${task.daysLate} ימים)` : ''}`}
                >
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                  <span>⚠️ הושלמה באיחור {task.daysLate ? `(${task.daysLate} ימים לאחר התפוגה)` : ''}</span>
                </span>
              </>
            )}

            {/* Overdue Marker (פג תוקף - ניתן להשלים באיחור) */}
            {!task.completed && isOverdue && (
              <>
                <span aria-hidden="true" className="text-neutral-300">·</span>
                <span 
                  className="inline-flex items-center gap-1 text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded text-[11px] font-bold"
                  title="חלף תאריך היעד למשימה זו! תוכל לסמן אותה כהושלמה כעת והיא תסומן כהושלמה באיחור."
                >
                  <AlertCircle className="h-3.5 w-3.5 text-rose-600" />
                  פג תוקף (ניתן להשלים באיחור)
                </span>
              </>
            )}

            {/* Category */}
            <span aria-hidden="true" className="text-neutral-300">·</span>
            <span>{CATEGORY_NAMES[task.category] || task.category}</span>

            {/* Priority */}
            <span aria-hidden="true" className="text-neutral-300">·</span>
            <span className={priorityInfo.textClass}>{priorityInfo.label}</span>

            {/* Auto Renewal Indicator */}
            {task.renewOnNextPeriod && (
              <>
                <span aria-hidden="true" className="text-neutral-300">·</span>
                <span className="flex items-center gap-1 text-indigo-700 font-medium">
                  <RotateCw className="h-3 w-3 text-indigo-500" />
                  מתחדשת במחזור הבא
                </span>
              </>
            )}

            {/* Reminder Indicator */}
            {task.reminderEnabled && task.reminderTime && (
              <>
                <span aria-hidden="true" className="text-neutral-300">·</span>
                <span className="flex items-center gap-1 text-amber-700 font-medium font-mono tabular-nums">
                  <Bell className="h-3 w-3 text-amber-500" />
                  תזכורת {task.reminderTime}
                </span>
              </>
            )}

            {/* Streak & Completion Count */}
            {task.streak > 0 && (
              <>
                <span aria-hidden="true" className="text-neutral-300">·</span>
                <span className="flex items-center gap-1 text-amber-700 font-medium tabular-nums">
                  <Flame className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                  רצף של {task.streak} {task.scope === 'hourly' ? 'שעות' : task.scope === 'weekly' ? 'שבועות' : task.scope === 'monthly' ? 'חודשים' : 'מחזורים'}
                  {task.bestStreak > task.streak && (
                    <span className="text-neutral-400 text-[11px]">(שיא: {task.bestStreak})</span>
                  )}
                </span>
              </>
            )}

            {task.totalCompletions > 0 && task.streak === 0 && (
              <>
                <span aria-hidden="true" className="text-neutral-300">·</span>
                <span className="tabular-nums text-neutral-400">
                  הושלמה {task.totalCompletions} פעמים בעבר
                </span>
              </>
            )}
          </div>

          {/* Quantitative Progress Section (e.g. savings box, study pages, hours) */}
          {isProgress && (
            <div className="mt-2.5 rounded-lg border border-neutral-200/90 bg-neutral-50/70 p-2.5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-medium text-neutral-800">
                  <TrendingUp className="h-3.5 w-3.5 text-indigo-600" />
                  <span>התקדמות יעד כמותי:</span>
                  <span className="font-mono tabular-nums font-bold text-indigo-900">
                    {currVal.toLocaleString()} / {targetVal.toLocaleString()} {task.unit || ''}
                  </span>
                </div>
                <span className="font-mono tabular-nums font-bold text-xs text-indigo-600">
                  {progressPct}%
                </span>
              </div>

              {/* Visual Progress Bar */}
              <div className="w-full bg-neutral-200/80 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    progressPct >= 100 ? 'bg-emerald-500' : 'bg-indigo-600'
                  }`}
                  style={{ width: `${progressPct}%` }}
                />
              </div>

              {/* Fast Increment & Custom Amount Controls */}
              <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1 text-xs">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleAddAmount(1)}
                    title={`הוסף 1 ${task.unit || ''}`}
                    className="flex items-center gap-0.5 rounded-md border border-neutral-200 bg-white px-2 py-0.5 font-medium text-neutral-700 hover:border-neutral-300 hover:bg-neutral-100 transition-colors"
                  >
                    <Plus className="h-3 w-3 text-indigo-600" />
                    <span>1</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAddAmount(step)}
                    title={`הוסף ${step} ${task.unit || ''}`}
                    className="flex items-center gap-0.5 rounded-md border border-neutral-200 bg-white px-2 py-0.5 font-medium text-neutral-700 hover:border-neutral-300 hover:bg-neutral-100 transition-colors"
                  >
                    <Plus className="h-3 w-3 text-indigo-600" />
                    <span>{step}</span>
                  </button>

                  {step !== 100 && (
                    <button
                      type="button"
                      onClick={() => handleAddAmount(step * 5)}
                      title={`הוסף ${step * 5} ${task.unit || ''}`}
                      className="flex items-center gap-0.5 rounded-md border border-neutral-200 bg-white px-2 py-0.5 font-medium text-neutral-700 hover:border-neutral-300 hover:bg-neutral-100 transition-colors"
                    >
                      <Plus className="h-3 w-3 text-indigo-600" />
                      <span>{step * 5}</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleAddAmount(-step)}
                    title={`הפחת ${step} ${task.unit || ''}`}
                    className="flex items-center gap-0.5 rounded-md border border-neutral-200 bg-white px-1.5 py-0.5 text-neutral-500 hover:text-rose-600 hover:bg-neutral-100 transition-colors"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                </div>

                {/* Custom Amount Form Toggle */}
                {showCustomInput ? (
                  <form onSubmit={handleCustomSubmit} className="flex items-center gap-1">
                    <input
                      type="number"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      placeholder={`סכום ב-${task.unit || ''}...`}
                      autoFocus
                      className="w-20 rounded border border-neutral-300 px-1.5 py-0.5 text-xs font-mono tabular-nums bg-white"
                    />
                    <button
                      type="submit"
                      className="rounded bg-indigo-600 px-2 py-0.5 text-[11px] font-semibold text-white hover:bg-indigo-700"
                    >
                      הוסף
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCustomInput(false)}
                      className="text-neutral-400 hover:text-neutral-700 text-xs px-1"
                    >
                      ✕
                    </button>
                  </form>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowCustomInput(true)}
                    className="text-[11px] text-indigo-600 hover:text-indigo-800 hover:underline"
                  >
                    + סכום מותאם אישית
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Subtasks Section if any */}
          {hasSubtasks && (
            <div className="mt-3 pt-2.5 border-t border-neutral-100">
              <div className="flex items-center justify-between text-xs text-neutral-500 mb-1.5">
                <button
                  type="button"
                  onClick={() => setShowSubtasks(!showSubtasks)}
                  className="flex items-center gap-1 font-medium hover:text-neutral-800 transition-colors"
                >
                  <Layers className="h-3.5 w-3.5 text-neutral-400" />
                  <span>תתי-משימות</span>
                  <span className="tabular-nums font-mono text-[11px] text-neutral-600">
                    ({completedSubtasksCount}/{task.subtasks.length})
                  </span>
                  {showSubtasks ? (
                    <ChevronUp className="h-3 w-3" />
                  ) : (
                    <ChevronDown className="h-3 w-3" />
                  )}
                </button>
                <div className="w-24 bg-neutral-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-indigo-500 h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${(completedSubtasksCount / task.subtasks.length) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {showSubtasks && (
                <div className="space-y-1.5 pr-2 pt-1">
                  {task.subtasks.map((st) => (
                    <div
                      key={st.id}
                      className="flex items-center gap-2 group/st cursor-pointer"
                      onClick={() => onToggleSubtask(task.id, st.id)}
                    >
                      <div
                        className={`h-3.5 w-3.5 rounded border flex items-center justify-center transition-colors ${
                          st.completed
                            ? 'bg-indigo-600 border-indigo-600 text-white'
                            : 'border-neutral-300 bg-white group-hover/st:border-neutral-500'
                        }`}
                      >
                        {st.completed && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                      </div>
                      <span
                        className={`text-xs transition-colors ${
                          st.completed ? 'text-neutral-400 line-through' : 'text-neutral-700'
                        }`}
                      >
                        {st.title}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Overdue callout banner with fast completion button */}
          {!task.completed && isOverdue && (
            <div className="mt-2.5 flex items-center justify-between p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs">
              <div className="flex items-center gap-1.5 text-rose-900 font-medium">
                <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                <span>חלף מועד התפוגה של משימה זו! באפשרותך לסמן אותה כהושלמה כעת:</span>
              </div>
              <button
                type="button"
                onClick={() => onToggleComplete(task.id)}
                className="px-2.5 py-1 bg-white hover:bg-rose-100 text-rose-800 font-bold border border-rose-300 rounded shadow-2xs transition-colors shrink-0 text-xs"
              >
                סמן כהושלמה באיחור
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
