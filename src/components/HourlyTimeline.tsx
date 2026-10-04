import React from 'react';
import { Task } from '../types/task';
import { Clock, Plus, Check, RotateCw, Flame } from 'lucide-react';
import { HebrewDateBadge } from './HebrewDateBadge';

interface HourlyTimelineProps {
  tasks: Task[];
  onToggleComplete: (taskId: string) => void;
  onAddTaskForHour: (hourStr: string) => void;
  onEditTask: (task: Task) => void;
  onManualRenew: (taskId: string) => void;
}

const HOURS = [
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
  '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
  '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'
];

export const HourlyTimeline: React.FC<HourlyTimelineProps> = ({
  tasks,
  onToggleComplete,
  onAddTaskForHour,
  onEditTask,
  onManualRenew,
}) => {
  const currentHourNum = new Date().getHours();
  const currentHourFormatted = `${String(currentHourNum).padStart(2, '0')}:00`;

  const hourlyTasks = tasks.filter((t) => t.scope === 'hourly');
  const completedHourly = hourlyTasks.filter((t) => t.completed).length;

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-neutral-200">
        <div>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-indigo-600" />
            <h2 className="text-base font-bold text-neutral-900">לוח זמנים שעתי יומי</h2>
          </div>
          <div className="mt-0.5">
            <HebrewDateBadge date={new Date()} showDayName={true} />
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-neutral-500">הושלמו היום:</span>
            <span className="font-semibold text-neutral-900 tabular-nums">
              {completedHourly} מתוך {hourlyTasks.length}
            </span>
          </div>
          <div className="w-24 bg-neutral-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-indigo-600 h-full rounded-full transition-all"
              style={{
                width: `${hourlyTasks.length > 0 ? (completedHourly / hourlyTasks.length) * 100 : 0}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Timeline slots */}
      <div className="bg-white rounded-xl border border-neutral-200 divide-y divide-neutral-100 overflow-hidden">
        {HOURS.map((hour) => {
          const hourNum = parseInt(hour.split(':')[0], 10);
          const isCurrentHour = hourNum === currentHourNum;
          const isPastHour = hourNum < currentHourNum;

          // Find tasks that match this hour
          const slotTasks = hourlyTasks.filter((t) => {
            if (!t.targetHour) return false;
            return t.targetHour.includes(hour) || t.targetHour.startsWith(`${hourNum}:`) || t.targetHour.startsWith(`0${hourNum}:`);
          });

          return (
            <div
              key={hour}
              className={`flex items-start transition-colors ${
                isCurrentHour ? 'bg-indigo-50/30' : isPastHour ? 'bg-neutral-50/40' : 'bg-white'
              }`}
            >
              {/* Hour Column */}
              <div className="w-20 sm:w-28 py-3.5 px-3 border-l border-neutral-100 text-left font-mono tabular-nums text-xs shrink-0">
                <div className={`font-semibold flex items-center gap-1.5 ${isCurrentHour ? 'text-indigo-600' : 'text-neutral-600'}`}>
                  {isCurrentHour && (
                    <span className="h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />
                  )}
                  {hour}
                </div>
                {isCurrentHour && (
                  <span className="text-[10px] text-indigo-500 font-sans font-medium">עכשיו</span>
                )}
              </div>

              {/* Tasks in this slot */}
              <div className="flex-1 p-3 min-w-0">
                {slotTasks.length > 0 ? (
                  <div className="space-y-2">
                    {slotTasks.map((t) => (
                      <div
                        key={t.id}
                        className={`flex items-center justify-between gap-3 p-2.5 rounded-lg border transition-all ${
                          t.completed
                            ? 'bg-neutral-50/80 border-neutral-200 text-neutral-400'
                            : 'bg-white border-neutral-200 shadow-2xs hover:border-neutral-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <button
                            type="button"
                            onClick={() => onToggleComplete(t.id)}
                            className={`h-4 w-4 rounded border flex items-center justify-center transition-colors ${
                              t.completed
                                ? 'bg-emerald-600 border-emerald-600 text-white'
                                : 'border-neutral-300 bg-white hover:border-neutral-500'
                            }`}
                          >
                            {t.completed && <Check className="h-3 w-3 stroke-[3]" />}
                          </button>
                          <span
                            className={`text-xs sm:text-sm font-medium truncate ${
                              t.completed ? 'line-through text-neutral-400' : 'text-neutral-900'
                            }`}
                          >
                            {t.title}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 text-xs">
                          {t.streak > 0 && (
                            <span className="hidden sm:flex items-center gap-1 text-amber-700 text-[11px] tabular-nums">
                              <Flame className="h-3 w-3 text-amber-500 fill-amber-500" />
                              {t.streak}
                            </span>
                          )}
                          {t.renewOnNextPeriod && (
                            <button
                              type="button"
                              onClick={() => onManualRenew(t.id)}
                              title="חדש לשעה הבאה"
                              className="text-neutral-400 hover:text-indigo-600 p-1"
                            >
                              <RotateCw className="h-3 w-3" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => onEditTask(t)}
                            className="text-neutral-400 hover:text-neutral-700 text-xs px-1.5 py-0.5"
                          >
                            ערוך
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-between py-1 group/empty">
                    <span className="text-xs text-neutral-400 italic">פנוי למשימה</span>
                    <button
                      type="button"
                      onClick={() => onAddTaskForHour(hour)}
                      className="opacity-0 group-hover/empty:opacity-100 flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 transition-opacity"
                    >
                      <Plus className="h-3 w-3" />
                      <span>הוסף לשעה זו</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
