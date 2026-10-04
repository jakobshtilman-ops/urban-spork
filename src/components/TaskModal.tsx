import React, { useState, useEffect } from 'react';
import { Task, TaskScope, TaskPriority, TaskCategory, Subtask } from '../types/task';
import { X, Plus, Trash2, RotateCw, Clock, Calendar, AlertCircle, Bell, TrendingUp } from 'lucide-react';
import { getPeriodKey, getHebrewDate } from '../utils/dateUtils';
import { requestNotificationPermission } from '../utils/notifications';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveTask: (taskData: Partial<Task>) => void;
  editingTask?: Task | null;
  defaultScope?: TaskScope;
  defaultDate?: string;
}

const SCOPES_OPTIONS: { id: TaskScope; label: string; desc: string }[] = [
  { id: 'hourly', label: 'שעתיות', desc: 'מתמקדת בשעה ספציפית ביום' },
  { id: 'daily', label: 'יומיות', desc: 'יעדים ומשימות יומיות' },
  { id: 'weekly', label: 'שבועיות', desc: 'משימות לשבוע הנוכחי' },
  { id: 'monthly', label: 'חודשיות', desc: 'יעדי החודש' },
  { id: 'yearly', label: 'שנתיות', desc: 'יעדים שנתיים ומטרות-על' },
  { id: 'custom', label: 'זמן מותאם אישית', desc: 'מחזורים לפי X ימים' },
  { id: 'general', label: 'כלליות', desc: 'ללא תאריך יעד מחזורי' },
];

const CATEGORIES_OPTIONS: { id: TaskCategory; label: string }[] = [
  { id: 'work', label: 'עבודה' },
  { id: 'personal', label: 'אישי' },
  { id: 'health', label: 'בריאות וכושר' },
  { id: 'study', label: 'לימודים' },
  { id: 'finance', label: 'פיננסים' },
  { id: 'home', label: 'בית ומשפחה' },
  { id: 'general', label: 'כללי' },
];

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSaveTask,
  editingTask,
  defaultScope = 'daily',
  defaultDate,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [scope, setScope] = useState<TaskScope>(defaultScope);
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [category, setCategory] = useState<TaskCategory>('work');
  const [targetHour, setTargetHour] = useState('09:00 - 10:00');
  const [customDaysInterval, setCustomDaysInterval] = useState(3);
  const [targetDate, setTargetDate] = useState('');
  const [renewOnNextPeriod, setRenewOnNextPeriod] = useState(true);
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState('09:00');
  const [isProgressTask, setIsProgressTask] = useState(false);
  const [targetValue, setTargetValue] = useState<number>(100);
  const [currentValue, setCurrentValue] = useState<number>(0);
  const [unit, setUnit] = useState('₪');
  const [progressStep, setProgressStep] = useState<number>(50);
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setDescription(editingTask.description || '');
      setScope(editingTask.scope);
      setPriority(editingTask.priority);
      setCategory(editingTask.category);
      setTargetHour(editingTask.targetHour || '09:00 - 10:00');
      setCustomDaysInterval(editingTask.customDaysInterval || 3);
      setTargetDate(editingTask.targetDate || '');
      setRenewOnNextPeriod(editingTask.renewOnNextPeriod);
      setReminderEnabled(editingTask.reminderEnabled || false);
      setReminderTime(editingTask.reminderTime || '09:00');
      setIsProgressTask(editingTask.isProgressTask || false);
      setTargetValue(editingTask.targetValue || 100);
      setCurrentValue(editingTask.currentValue || 0);
      setUnit(editingTask.unit || '₪');
      setProgressStep(editingTask.progressStep || 50);
      setSubtasks(editingTask.subtasks || []);
    } else {
      setTitle('');
      setDescription('');
      setScope(defaultScope);
      setPriority('medium');
      setCategory('work');
      setTargetHour('09:00 - 10:00');
      setCustomDaysInterval(3);
      setTargetDate(defaultDate || new Date().toISOString().split('T')[0]);
      setRenewOnNextPeriod(defaultScope !== 'general');
      setReminderEnabled(false);
      setReminderTime('09:00');
      setIsProgressTask(false);
      setTargetValue(100);
      setCurrentValue(0);
      setUnit('₪');
      setProgressStep(50);
      setSubtasks([]);
    }
  }, [editingTask, defaultScope, defaultDate, isOpen]);

  if (!isOpen) return null;

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    const newSt: Subtask = {
      id: `sub-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title: newSubtaskTitle.trim(),
      completed: false,
    };
    setSubtasks([...subtasks, newSt]);
    setNewSubtaskTitle('');
  };

  const handleRemoveSubtask = (id: string) => {
    setSubtasks(subtasks.filter((s) => s.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const currentKey = getPeriodKey(scope, new Date(), customDaysInterval);

    onSaveTask({
      title: title.trim(),
      description: description.trim(),
      scope,
      priority,
      category,
      targetHour: scope === 'hourly' ? targetHour : undefined,
      customDaysInterval: scope === 'custom' ? customDaysInterval : undefined,
      targetDate: targetDate || undefined,
      renewOnNextPeriod,
      reminderEnabled,
      reminderTime: reminderEnabled ? reminderTime : undefined,
      isProgressTask,
      targetValue: isProgressTask ? Number(targetValue) : undefined,
      currentValue: isProgressTask ? Number(currentValue) : undefined,
      unit: isProgressTask ? unit : undefined,
      progressStep: isProgressTask ? Number(progressStep) : undefined,
      subtasks,
      currentPeriodKey: editingTask?.currentPeriodKey || currentKey,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs">
      <div 
        className="w-full max-w-lg rounded-2xl bg-white shadow-xl border border-neutral-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4">
          <h2 className="text-lg font-bold text-neutral-900">
            {editingTask ? 'עריכת משימה' : 'הגדרת משימה חדשה'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-5 flex-1">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              שם המשימה <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="למשל: סקירת יומן בוקר, אימון כושר, דוח רבעוני..."
              className="w-full rounded-lg border border-neutral-300 px-3.5 py-2 text-sm text-neutral-900 placeholder-neutral-400 focus:border-indigo-600 focus:outline-none"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              תיאור או דגשים (אופציונלי)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="פרטים נוספים, קישורים או הנחיות לביצוע..."
              className="w-full rounded-lg border border-neutral-300 px-3.5 py-2 text-sm text-neutral-900 placeholder-neutral-400 focus:border-indigo-600 focus:outline-none"
            />
          </div>

          {/* Scope Selector */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              טווח זמן המשימה <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {SCOPES_OPTIONS.map((sc) => (
                <button
                  type="button"
                  key={sc.id}
                  onClick={() => {
                    setScope(sc.id);
                    if (sc.id === 'general') setRenewOnNextPeriod(false);
                    else setRenewOnNextPeriod(true);
                  }}
                  className={`px-3 py-2 text-xs rounded-lg border text-right transition-colors ${
                    scope === sc.id
                      ? 'border-indigo-600 bg-indigo-50/50 text-indigo-950 font-semibold'
                      : 'border-neutral-200 text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50'
                  }`}
                >
                  <div className="font-medium">{sc.label}</div>
                  <div className="text-[10px] text-neutral-500 truncate">{sc.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Scope specific settings */}
          {scope === 'hourly' && (
            <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200/80 space-y-2">
              <label className="block text-xs font-semibold text-neutral-700">
                שעת היעד ביום (למשל: 09:00 - 10:00)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={targetHour}
                  onChange={(e) => setTargetHour(e.target.value)}
                  placeholder="09:00 - 10:00 או 14:30"
                  className="w-full rounded-lg border border-neutral-300 px-3 py-1.5 text-sm bg-white font-mono tabular-nums"
                />
              </div>
              <p className="text-[11px] text-neutral-500">
                משימות שעתיות מסודרות בלוח הזמנים לפי שעת היעד.
              </p>
            </div>
          )}

          {scope === 'custom' && (
            <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200/80 space-y-2">
              <label className="block text-xs font-semibold text-neutral-700">
                אורך המחזור המותאם אישית (בימים)
              </label>
              <div className="flex items-center gap-3">
                <span className="text-xs text-neutral-600">מתחדשת כל:</span>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={customDaysInterval}
                  onChange={(e) => setCustomDaysInterval(parseInt(e.target.value, 10) || 1)}
                  className="w-20 rounded-lg border border-neutral-300 px-3 py-1.5 text-sm bg-white font-mono tabular-nums text-center"
                />
                <span className="text-xs text-neutral-600">ימים</span>
              </div>
              <p className="text-[11px] text-neutral-500">
                לדוגמה: בדיקת רכב כל 14 ימים, דישון צמחים כל 3 ימים, ספרינט עבודה כל 10 ימים.
              </p>
            </div>
          )}

          {/* Target Future Date Section */}
          <div className="rounded-xl border border-neutral-200 bg-white p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-indigo-600" />
                <span>מועד יעד / תאריך עתידי לביצוע</span>
              </label>
              {targetDate && (
                <button
                  type="button"
                  onClick={() => setTargetDate('')}
                  className="text-[11px] text-neutral-400 hover:text-rose-600"
                >
                  נקה תאריך
                </button>
              )}
            </div>

            {/* Hebrew Date Display */}
            {targetDate ? (
              <div className="p-3 rounded-xl bg-indigo-50/80 border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div>
                  <div className="font-bold text-indigo-950 text-sm">
                    תאריך עברי: {getHebrewDate(targetDate).fullHebrew}
                  </div>
                  <div className="text-[11px] text-neutral-500 font-sans mt-0.5">
                    (תאריך עברי מלא באותיות בלבד - ללא ספרות)
                  </div>
                </div>

                {/* Inspect Gregorian date button */}
                <button
                  type="button"
                  onClick={() => {
                    const heb = getHebrewDate(targetDate);
                    alert(`תאריך עברי: ${heb.fullHebrew}\nתאריך לועזי מקביל: ${heb.gregorianDateStr}`);
                  }}
                  title="לחץ לבדיקת התאריך הלועזי המקביל"
                  className="self-start sm:self-auto flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-indigo-200 text-indigo-800 font-mono text-[11px] hover:bg-indigo-100/70 transition-colors shadow-2xs"
                >
                  <span>👁️ בדוק לועזי:</span>
                  <span className="font-bold tabular-nums">{getHebrewDate(targetDate).gregorianDateStr}</span>
                </button>
              </div>
            ) : (
              <div className="text-xs text-neutral-400 italic">
                לא הוגדר תאריך יעד ספציפי (פתוח לביצוע)
              </div>
            )}

            {/* Date Input & Future Presets */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-xs bg-neutral-50 font-mono tabular-nums focus:bg-white focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Quick Future Presets for Any Date */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-neutral-600 block">
                  קביעת תאריך עתידי מהיר (בחר טווח זמן קדימה):
                </span>
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date();
                      setTargetDate(d.toISOString().split('T')[0]);
                    }}
                    className="px-2.5 py-1 rounded-md bg-neutral-100 hover:bg-indigo-50 hover:text-indigo-700 text-neutral-700 text-[11px] font-medium border border-neutral-200/80 transition-colors"
                  >
                    היום
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date();
                      d.setDate(d.getDate() + 1);
                      setTargetDate(d.toISOString().split('T')[0]);
                    }}
                    className="px-2.5 py-1 rounded-md bg-neutral-100 hover:bg-indigo-50 hover:text-indigo-700 text-neutral-700 text-[11px] font-medium border border-neutral-200/80 transition-colors"
                  >
                    מחר
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date();
                      d.setDate(d.getDate() + 3);
                      setTargetDate(d.toISOString().split('T')[0]);
                    }}
                    className="px-2.5 py-1 rounded-md bg-neutral-100 hover:bg-indigo-50 hover:text-indigo-700 text-neutral-700 text-[11px] font-medium border border-neutral-200/80 transition-colors"
                  >
                    בעוד 3 ימים
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date();
                      d.setDate(d.getDate() + 7);
                      setTargetDate(d.toISOString().split('T')[0]);
                    }}
                    className="px-2.5 py-1 rounded-md bg-neutral-100 hover:bg-indigo-50 hover:text-indigo-700 text-neutral-700 text-[11px] font-medium border border-neutral-200/80 transition-colors"
                  >
                    שבוע הבא
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date();
                      d.setDate(d.getDate() + 14);
                      setTargetDate(d.toISOString().split('T')[0]);
                    }}
                    className="px-2.5 py-1 rounded-md bg-neutral-100 hover:bg-indigo-50 hover:text-indigo-700 text-neutral-700 text-[11px] font-medium border border-neutral-200/80 transition-colors"
                  >
                    בעוד שבועיים
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date();
                      d.setMonth(d.getMonth() + 1);
                      setTargetDate(d.toISOString().split('T')[0]);
                    }}
                    className="px-2.5 py-1 rounded-md bg-neutral-100 hover:bg-indigo-50 hover:text-indigo-700 text-neutral-700 text-[11px] font-medium border border-neutral-200/80 transition-colors"
                  >
                    חודש הבא
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date();
                      d.setMonth(d.getMonth() + 3);
                      setTargetDate(d.toISOString().split('T')[0]);
                    }}
                    className="px-2.5 py-1 rounded-md bg-neutral-100 hover:bg-indigo-50 hover:text-indigo-700 text-neutral-700 text-[11px] font-medium border border-neutral-200/80 transition-colors"
                  >
                    בעוד 3 חודשים
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date();
                      d.setFullYear(d.getFullYear() + 1);
                      setTargetDate(d.toISOString().split('T')[0]);
                    }}
                    className="px-2.5 py-1 rounded-md bg-neutral-100 hover:bg-indigo-50 hover:text-indigo-700 text-neutral-700 text-[11px] font-medium border border-neutral-200/80 transition-colors"
                  >
                    שנה הבאה
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Priority & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                רמת עדיפות
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm bg-white"
              >
                <option value="high">🔴 עדיפות גבוהה</option>
                <option value="medium">🟡 עדיפות בינונית</option>
                <option value="low">⚪ עדיפות רגילה</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                קטגוריה
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TaskCategory)}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm bg-white"
              >
                {CATEGORIES_OPTIONS.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Auto Renewal Toggle */}
          <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={renewOnNextPeriod}
                onChange={(e) => setRenewOnNextPeriod(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-neutral-300 text-indigo-600 focus:ring-indigo-500"
              />
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-900">
                  <RotateCw className="h-3.5 w-3.5 text-indigo-600" />
                  התחדשות אוטומטית בטווח הזמן הבא (המחזור הבא)
                </div>
                <p className="text-[11px] text-neutral-600 leading-normal">
                  כאשר מסומן, בסיום טווח הזמן (השעה הבאה, היום הבא, השבוע הבא וכו׳) המשימה תתחדש אוטומטית עבור המחזור החדש ותצבור רצף הצלחות (Streak).
                </p>
              </div>
            </label>
          </div>

          {/* Browser Reminder / Notification Toggle */}
          <div className="rounded-xl border border-neutral-200 bg-white p-4 space-y-3">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={reminderEnabled}
                onChange={async (e) => {
                  const val = e.target.checked;
                  setReminderEnabled(val);
                  if (val) {
                    await requestNotificationPermission();
                  }
                }}
                className="mt-0.5 h-4 w-4 rounded border-neutral-300 text-indigo-600 focus:ring-indigo-500"
              />
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-900">
                  <Bell className="h-3.5 w-3.5 text-amber-500" />
                  הפעל תזכורת דפדפן (כולל צליל ואופליין)
                </div>
                <p className="text-[11px] text-neutral-600 leading-normal">
                  קבלת התראת דפדפן עם השמעת צליל תזכורת במועד הנבחר, פועל באופן מלא מקומית בדפדפן.
                </p>
              </div>
            </label>

            {reminderEnabled && (
              <div className="pt-2 border-t border-neutral-100 flex items-center gap-3">
                <span className="text-xs font-medium text-neutral-700">שעת התזכורת:</span>
                <input
                  type="time"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  className="rounded-lg border border-neutral-300 px-3 py-1 text-xs font-mono tabular-nums bg-neutral-50"
                />
              </div>
            )}
          </div>

          {/* Quantitative Progress Tracking (Financial savings, study pages/hours) */}
          <div className="rounded-xl border border-neutral-200 bg-white p-4 space-y-3">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isProgressTask}
                onChange={(e) => setIsProgressTask(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-neutral-300 text-indigo-600 focus:ring-indigo-500"
              />
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-900">
                  <TrendingUp className="h-3.5 w-3.5 text-indigo-600" />
                  מעקב התקדמות כמותי (חיסכון כספי, עמודים, שעות...)
                </div>
                <p className="text-[11px] text-neutral-600 leading-normal">
                  מאפשר להוסיף סכומים באופן הדרגתי (למשל: כל שקל שנכנס לקופה, כל עמוד או שעת לימוד) עם מד התקדמות חזותי.
                </p>
              </div>
            </label>

            {isProgressTask && (
              <div className="pt-3 border-t border-neutral-100 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                      ערך היעד הסופי
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={targetValue}
                      onChange={(e) => setTargetValue(parseFloat(e.target.value) || 0)}
                      placeholder="לדוגמה: 5000"
                      className="w-full rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-mono tabular-nums bg-neutral-50"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                      יחידת מידה
                    </label>
                    <input
                      type="text"
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      placeholder="למשל: ₪, עמודים, שעות, ק״מ..."
                      className="w-full rounded-lg border border-neutral-300 px-3 py-1.5 text-xs bg-neutral-50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                      ערך התחלתי נוכחי
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={currentValue}
                      onChange={(e) => setCurrentValue(parseFloat(e.target.value) || 0)}
                      className="w-full rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-mono tabular-nums bg-neutral-50"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                      צעד הוספה מהירה בכפתור
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={progressStep}
                      onChange={(e) => setProgressStep(parseFloat(e.target.value) || 1)}
                      placeholder="לדוגמה: 50"
                      className="w-full rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-mono tabular-nums bg-neutral-50"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Subtasks */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
              תתי-משימות וצעדים לביצוע
            </label>
            <div className="space-y-2 mb-2">
              {subtasks.map((st) => (
                <div
                  key={st.id}
                  className="flex items-center justify-between gap-2 p-2 rounded-lg bg-neutral-50 border border-neutral-200"
                >
                  <span className="text-xs text-neutral-800">{st.title}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSubtask(st.id)}
                    className="text-neutral-400 hover:text-rose-600 p-1"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
                placeholder="הוסף שלב/תת-משימה ולחץ Enter..."
                className="flex-1 rounded-lg border border-neutral-300 px-3 py-1.5 text-xs focus:border-indigo-600 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="px-3 py-1.5 text-xs font-medium bg-neutral-100 hover:bg-neutral-200 rounded-lg text-neutral-800"
              >
                הוסף
              </button>
            </div>
          </div>
        </form>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-3 border-t border-neutral-100 px-6 py-3 bg-neutral-50">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-xs sm:text-sm font-medium text-neutral-600 hover:bg-neutral-200/60 transition-colors"
          >
            ביטול
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="rounded-lg bg-indigo-600 px-5 py-2 text-xs sm:text-sm font-medium text-white hover:bg-indigo-700 active:scale-95 transition-all"
          >
            {editingTask ? 'שמור שינויים' : 'צור משימה'}
          </button>
        </div>
      </div>
    </div>
  );
};
