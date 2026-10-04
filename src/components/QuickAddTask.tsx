import React, { useState } from 'react';
import { TaskScope, TaskPriority } from '../types/task';
import { Plus, RotateCw, Clock } from 'lucide-react';

interface QuickAddTaskProps {
  currentScope: 'all' | TaskScope;
  onAddTask: (title: string, scope: TaskScope, renew: boolean) => void;
  onOpenFullModal: () => void;
}

export const QuickAddTask: React.FC<QuickAddTaskProps> = ({
  currentScope,
  onAddTask,
  onOpenFullModal,
}) => {
  const [title, setTitle] = useState('');
  const [targetScope, setTargetScope] = useState<TaskScope>(
    currentScope === 'all' ? 'daily' : currentScope
  );
  const [renew, setRenew] = useState(true);

  // Sync if currentScope changes
  React.useEffect(() => {
    if (currentScope !== 'all') {
      setTargetScope(currentScope);
      if (currentScope === 'general') setRenew(false);
      else setRenew(true);
    }
  }, [currentScope]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAddTask(title.trim(), targetScope, renew);
    setTitle('');
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 rounded-xl border border-neutral-200/90 bg-white p-2.5 shadow-xs transition-all focus-within:border-indigo-400 focus-within:shadow-sm"
    >
      <div className="flex-1 flex items-center gap-2">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="הוסף משימה מהירה... (למשל: סיום סקירת מסמך, הליכת ערב)"
          className="w-full text-xs sm:text-sm px-2 py-1.5 bg-transparent border-0 focus:outline-none placeholder-neutral-400 text-neutral-900"
        />
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 border-neutral-100">
        {/* Scope selector */}
        <select
          value={targetScope}
          onChange={(e) => {
            const sc = e.target.value as TaskScope;
            setTargetScope(sc);
            if (sc === 'general') setRenew(false);
            else setRenew(true);
          }}
          aria-label="טווח זמן למשימה המהירה"
          className="text-xs bg-neutral-100/70 border-0 rounded-lg px-2 py-1.5 text-neutral-700 font-medium focus:ring-1 focus:ring-indigo-500"
        >
          <option value="hourly">שעתית</option>
          <option value="daily">יומית</option>
          <option value="weekly">שבועית</option>
          <option value="monthly">חודשית</option>
          <option value="yearly">שנתית</option>
          <option value="custom">מותאם אישית</option>
          <option value="general">כללית</option>
        </select>

        {/* Auto renew quick toggle */}
        <button
          type="button"
          onClick={() => setRenew(!renew)}
          title={renew ? 'המשימה תתחדש אוטומטית במחזור הבא' : 'משימה חד-פעמית'}
          className={`flex items-center gap-1 text-xs px-2 py-1.5 rounded-lg border transition-colors ${
            renew
              ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-medium'
              : 'border-neutral-200 text-neutral-400 hover:text-neutral-700'
          }`}
        >
          <RotateCw className="h-3 w-3" />
          <span className="hidden sm:inline">מתחדשת</span>
        </button>

        <button
          type="submit"
          disabled={!title.trim()}
          className="flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>הוסף</span>
        </button>

        <button
          type="button"
          onClick={onOpenFullModal}
          className="text-xs text-neutral-500 hover:text-indigo-600 px-2 py-1 hover:underline whitespace-nowrap"
        >
          הגדרות מלאות...
        </button>
      </div>
    </form>
  );
};
