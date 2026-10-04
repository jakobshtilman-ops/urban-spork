import React, { useState } from 'react';
import { Task } from '../types/task';
import { 
  getMonthCalendarDays, 
  CalendarGridDay, 
  getHebrewDate,
  formatShortHebrewDate
} from '../utils/dateUtils';
import { 
  ChevronRight, 
  ChevronLeft, 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  Flame, 
  Plus, 
  Clock, 
  TrendingUp,
  RotateCw,
  Check
} from 'lucide-react';

interface CalendarViewProps {
  tasks: Task[];
  onToggleComplete: (taskId: string) => void;
  onUpdateProgress?: (taskId: string, increment: number) => void;
  onAddTaskForDate: (dateStr: string) => void;
  onEditTask: (task: Task) => void;
}

const MONTH_NAMES_HEBREW = [
  'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
  'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'
];

const WEEKDAY_NAMES = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

export const CalendarView: React.FC<CalendarViewProps> = ({
  tasks,
  onToggleComplete,
  onUpdateProgress,
  onAddTaskForDate,
  onEditTask,
}) => {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [showGregorianHelper, setShowGregorianHelper] = useState(false);
  const [selectedDateStr, setSelectedDateStr] = useState<string>(
    `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  );

  const days = getMonthCalendarDays(currentYear, currentMonth);

  // Month navigation
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleJumpToToday = () => {
    const t = new Date();
    setCurrentYear(t.getFullYear());
    setCurrentMonth(t.getMonth());
    setSelectedDateStr(
      `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`
    );
  };

  // Hebrew month range for header
  const midMonthDate = new Date(currentYear, currentMonth, 15);
  const hebrewInfo = getHebrewDate(midMonthDate);

  // Get tasks for a given date
  const getTasksForDate = (dateStr: string) => {
    return tasks.filter((t) => {
      // 1. Direct targetDate match
      if (t.targetDate === dateStr) return true;

      // 2. Completed on this date in history
      const hasCompletedOnDate = t.history.some((h) => h.completedAt && h.completedAt.startsWith(dateStr));
      if (hasCompletedOnDate) return true;

      // 3. Daily task and this is today
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      if (t.scope === 'daily' && dateStr === todayStr) return true;

      // 4. Hourly task on today
      if (t.scope === 'hourly' && dateStr === todayStr) return true;

      return false;
    });
  };

  const selectedDayTasks = getTasksForDate(selectedDateStr);
  const selectedDayHebrew = selectedDateStr ? getHebrewDate(new Date(selectedDateStr)) : null;

  return (
    <div className="space-y-6">
      {/* Calendar Header with Gregorian and Hebrew Month */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
            <CalendarIcon className="h-5 w-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-baseline gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-neutral-900">
                חודש {hebrewInfo.hebrewMonth} {hebrewInfo.hebrewYearLetter}
              </h2>
              <button
                type="button"
                onClick={() => setShowGregorianHelper(!showGregorianHelper)}
                className={`text-xs font-medium px-2 py-0.5 rounded-md border transition-colors flex items-center gap-1 ${
                  showGregorianHelper
                    ? 'bg-neutral-200 border-neutral-300 text-neutral-900 font-semibold'
                    : 'bg-neutral-100 border-neutral-200 text-neutral-600 hover:text-neutral-900'
                }`}
                title="הצג/הסתר תאריכים לועזיים ברשת"
              >
                <span>👁️ {showGregorianHelper ? 'הסתר לועזי' : 'בדוק לועזי'}</span>
                {showGregorianHelper && (
                  <span className="font-mono tabular-nums">({MONTH_NAMES_HEBREW[currentMonth]} {currentYear})</span>
                )}
              </button>
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">
              תצוגת רשת חודשית עברית מלאה (באותיות בלבד) - לחץ על כל יום כדי להוסיף משימה עתידית.
            </p>
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <button
            onClick={handleJumpToToday}
            className="text-xs font-medium px-3 py-1.5 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 transition-colors"
          >
            חזור להיום
          </button>
          <div className="flex items-center border border-neutral-200 rounded-lg overflow-hidden bg-white">
            <button
              onClick={handleNextMonth}
              title="חודש הבא"
              className="p-1.5 hover:bg-neutral-50 text-neutral-600 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <div className="h-4 w-px bg-neutral-200" />
            <button
              onClick={handlePrevMonth}
              title="חודש קודם"
              className="p-1.5 hover:bg-neutral-50 text-neutral-600 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Calendar Grid (2 columns on large screen) */}
        <div className="lg:col-span-2 rounded-xl border border-neutral-200 bg-white overflow-hidden shadow-2xs">
          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 border-b border-neutral-200 bg-neutral-50 text-center text-xs font-semibold text-neutral-600 py-2.5">
            {WEEKDAY_NAMES.map((w, idx) => (
              <div key={w} className={idx === 6 ? 'text-indigo-600' : ''}>
                {w}
              </div>
            ))}
          </div>

          {/* Grid Cells */}
          <div className="grid grid-cols-7 divide-x divide-y divide-neutral-100 bg-neutral-100/30">
            {days.map((day) => {
              const dayTasks = getTasksForDate(day.dateStr);
              const completedTasks = dayTasks.filter((t) => t.completed);
              const hasActiveStreak = dayTasks.some((t) => t.streak > 0);
              const isSelected = day.dateStr === selectedDateStr;

              return (
                <div
                  key={day.dateStr}
                  onClick={() => setSelectedDateStr(day.dateStr)}
                  className={`group/cell min-h-[82px] sm:min-h-[96px] p-2 flex flex-col justify-between cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-indigo-50/80 ring-2 ring-indigo-500 ring-inset z-10'
                      : day.isCurrentMonth
                      ? 'bg-white hover:bg-neutral-50'
                      : 'bg-neutral-50/60 opacity-50 hover:opacity-80'
                  }`}
                >
                  {/* Top Day Header: Primary Hebrew Letter Date with Gregorian in tooltip/subtle */}
                  <div className="flex items-start justify-between">
                    <span
                      className={`h-7 px-1.5 rounded-md flex items-center justify-center text-xs font-bold font-sans ${
                        day.isToday
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : isSelected
                          ? 'bg-indigo-100 text-indigo-950 font-black'
                          : 'text-neutral-900 font-semibold'
                      }`}
                      title={`תאריך עברי מלא (באותיות): ${day.shortHebrew}\nתאריך לועזי: ${day.gregorianDateStr}`}
                    >
                      {day.hebrewDayLetter}
                    </span>

                    {/* Gregorian Day check option or quick add */}
                    <div className="flex items-center gap-1">
                      {showGregorianHelper && (
                        <span 
                          className="text-[10px] text-neutral-400 font-mono tabular-nums"
                          title={`תאריך לועזי: ${day.gregorianDateStr}`}
                        >
                          {day.dayNumber}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddTaskForDate(day.dateStr);
                        }}
                        title={`הוסף משימה לתאריך ${day.shortHebrew}`}
                        className="opacity-0 group-hover/cell:opacity-100 p-0.5 text-neutral-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-opacity"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  {/* Indicators for tasks & streaks */}
                  <div className="mt-1 space-y-1">
                    {dayTasks.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1">
                        {/* Task Count badge */}
                        <div
                          className={`text-[10px] px-1.5 py-0.2 rounded font-medium tabular-nums ${
                            completedTasks.length === dayTasks.length
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-neutral-100 text-neutral-700'
                          }`}
                        >
                          {completedTasks.length}/{dayTasks.length}
                        </div>

                        {/* Streak Flame indicator */}
                        {hasActiveStreak && (
                          <Flame className="h-3 w-3 text-amber-500 fill-amber-500" />
                        )}
                      </div>
                    )}

                    {/* Preview first task title */}
                    {dayTasks.length > 0 && (
                      <div className="hidden sm:block text-[11px] truncate text-neutral-600 leading-tight">
                        {dayTasks[0].title}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Day Details Panel */}
        <div className="rounded-xl border border-neutral-200 bg-white p-5 space-y-4 shadow-2xs flex flex-col justify-between">
          <div className="space-y-4">
            {/* Panel Header */}
            <div className="border-b border-neutral-100 pb-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-neutral-900">
                    משימות ל{selectedDayHebrew?.fullHebrew || selectedDateStr}
                  </h3>
                  {selectedDayHebrew && (
                    <button
                      type="button"
                      onClick={() => setShowGregorianHelper(!showGregorianHelper)}
                      className="mt-1 flex items-center gap-1 text-[11px] text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded font-mono tabular-nums transition-colors"
                      title="לחץ להצגת/הסתרת תאריכים לועזיים"
                    >
                      <span>👁️ בדוק לועזי:</span>
                      <span className="font-bold">{selectedDayHebrew.gregorianDateStr}</span>
                    </button>
                  )}
                </div>
                <button
                  onClick={() => onAddTaskForDate(selectedDateStr)}
                  className="flex items-center gap-1 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 px-3 py-1.5 text-xs font-semibold shadow-2xs transition-colors shrink-0"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>הוסף משימה לתאריך</span>
                </button>
              </div>
            </div>

            {/* List of Tasks on Selected Date */}
            <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
              {selectedDayTasks.length > 0 ? (
                selectedDayTasks.map((t) => {
                  const isProgress = !!t.isProgressTask && typeof t.targetValue === 'number';
                  const curr = t.currentValue || 0;
                  const target = t.targetValue || 1;
                  const pct = Math.min(100, Math.round((curr / target) * 100));

                  return (
                    <div
                      key={t.id}
                      className={`p-3 rounded-xl border transition-all ${
                        t.completed
                          ? 'bg-neutral-50/80 border-neutral-200/80 text-neutral-400'
                          : 'bg-white border-neutral-200 shadow-2xs hover:border-neutral-300'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <button
                          type="button"
                          onClick={() => onToggleComplete(t.id)}
                          className={`mt-0.5 h-4 w-4 shrink-0 rounded border flex items-center justify-center transition-colors ${
                            t.completed
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : 'border-neutral-300 bg-white hover:border-neutral-500'
                          }`}
                        >
                          {t.completed && <Check className="h-3 w-3 stroke-[3]" />}
                        </button>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <h4
                              className={`text-xs sm:text-sm font-semibold truncate ${
                                t.completed ? 'line-through text-neutral-400' : 'text-neutral-900'
                              }`}
                            >
                              {t.title}
                            </h4>
                            {t.streak > 0 && (
                              <span className="flex items-center gap-0.5 text-amber-700 text-[11px] font-bold shrink-0 font-mono tabular-nums">
                                <Flame className="h-3 w-3 text-amber-500 fill-amber-500" />
                                {t.streak}
                              </span>
                            )}
                          </div>

                          {/* Late Completion Indicator */}
                          {t.completed && t.completedLate && (
                            <div className="mt-1">
                              <span className="inline-flex items-center gap-1 text-amber-950 bg-amber-100 border border-amber-300 px-1.5 py-0.2 rounded text-[10px] font-bold">
                                ⚠️ הושלמה באיחור {t.daysLate ? `(${t.daysLate} ימים)` : ''}
                              </span>
                            </div>
                          )}

                          {/* Progress summary if progress task */}
                          {isProgress && (
                            <div className="mt-2 space-y-1 bg-neutral-50 p-2 rounded-lg border border-neutral-200/70">
                              <div className="flex justify-between text-[11px] font-mono tabular-nums">
                                <span className="font-semibold text-indigo-900">
                                  {curr.toLocaleString()} / {target.toLocaleString()} {t.unit || ''}
                                </span>
                                <span className="text-indigo-600 font-bold">{pct}%</span>
                              </div>
                              <div className="w-full bg-neutral-200 rounded-full h-1.5 overflow-hidden">
                                <div
                                  className="bg-indigo-600 h-full rounded-full transition-all"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              {onUpdateProgress && (
                                <div className="flex items-center gap-1 pt-1">
                                  <button
                                    onClick={() => onUpdateProgress(t.id, t.progressStep || 10)}
                                    className="text-[10px] font-semibold bg-white border border-neutral-200 px-1.5 py-0.5 rounded hover:bg-neutral-100"
                                  >
                                    +{t.progressStep || 10} {t.unit || ''}
                                  </button>
                                </div>
                              )}
                            </div>
                          )}

                          <div className="mt-1.5 flex items-center gap-2 text-[11px] text-neutral-400">
                            <span>טווח: {t.scope}</span>
                            {t.renewOnNextPeriod && <span>· 🔄 מתחדשת</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-10 text-center text-neutral-400 space-y-2">
                  <CalendarIcon className="h-8 w-8 mx-auto opacity-30" />
                  <p className="text-xs">אין משימות מתוזמנות לתאריך זה</p>
                  <button
                    onClick={() => onAddTaskForDate(selectedDateStr)}
                    className="inline-flex items-center gap-1 text-xs text-indigo-600 font-semibold hover:underline"
                  >
                    <Plus className="h-3 w-3" />
                    <span>צור משימה לתאריך זה</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Quick Month Legend */}
          <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-500">
            <div className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-indigo-600 inline-block" />
              <span>היום הנוכחי</span>
            </div>
            <div className="flex items-center gap-1">
              <Flame className="h-3 w-3 text-amber-500 fill-amber-500 inline-block" />
              <span>רצף ביצוע פעיל</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" />
              <span>הושלמו</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
