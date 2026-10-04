import React from 'react';
import { TaskScope, TaskCategory } from '../types/task';
import { Clock, Calendar, CalendarDays, CalendarRange, Flame, Sparkles, FolderArchive, Search } from 'lucide-react';

interface ScopeTabsProps {
  selectedScope: 'all' | TaskScope;
  onSelectScope: (scope: 'all' | TaskScope) => void;
  scopeCounts: Record<string, { total: number; completed: number; pending: number }>;
  statusFilter: 'all' | 'active' | 'completed';
  onStatusFilterChange: (status: 'all' | 'active' | 'completed') => void;
  categoryFilter: 'all' | TaskCategory;
  onCategoryFilterChange: (cat: 'all' | TaskCategory) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const SCOPES: { id: 'all' | TaskScope; label: string; icon: React.ReactNode; desc: string }[] = [
  { id: 'all', label: 'הכל', icon: <Sparkles className="h-4 w-4" />, desc: 'כל טווחי הזמן' },
  { id: 'hourly', label: 'שעתיות', icon: <Clock className="h-4 w-4" />, desc: 'חלוקה לפי שעות היום' },
  { id: 'daily', label: 'יומיות', icon: <Calendar className="h-4 w-4" />, desc: 'יעדים ומשימות יומיות' },
  { id: 'weekly', label: 'שבועיות', icon: <CalendarDays className="h-4 w-4" />, desc: 'משימות שבועיות וספרינט' },
  { id: 'monthly', label: 'חודשיות', icon: <CalendarRange className="h-4 w-4" />, desc: 'יעדים ומעקב חודשי' },
  { id: 'yearly', label: 'שנתיות', icon: <Flame className="h-4 w-4" />, desc: 'יעדים שנתיים ומטרות-על' },
  { id: 'custom', label: 'מותאם אישית', icon: <CalendarRange className="h-4 w-4" />, desc: 'מחזורים לפי X ימים' },
  { id: 'general', label: 'כלליות', icon: <FolderArchive className="h-4 w-4" />, desc: 'ללא תאריך יעד מחזורי' },
];

const CATEGORIES: { id: 'all' | TaskCategory; label: string }[] = [
  { id: 'all', label: 'כל הקטגוריות' },
  { id: 'work', label: 'עבודה' },
  { id: 'personal', label: 'אישי' },
  { id: 'health', label: 'בריאות וכושר' },
  { id: 'study', label: 'לימודים' },
  { id: 'finance', label: 'פיננסים' },
  { id: 'home', label: 'בית ומשפחה' },
];

export const ScopeTabs: React.FC<ScopeTabsProps> = ({
  selectedScope,
  onSelectScope,
  scopeCounts,
  statusFilter,
  onStatusFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  searchQuery,
  onSearchChange,
}) => {
  return (
    <div className="space-y-4">
      {/* Scope segmented tabs */}
      <div className="overflow-x-auto pb-1 scrollbar-none">
        <div className="flex items-center gap-1.5 p-1 bg-neutral-100/90 rounded-xl min-w-max border border-neutral-200/70">
          {SCOPES.map((scope) => {
            const isSelected = selectedScope === scope.id;
            const counts = scopeCounts[scope.id] || { total: 0, pending: 0, completed: 0 };
            return (
              <button
                key={scope.id}
                onClick={() => onSelectScope(scope.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                  isSelected
                    ? 'bg-white text-neutral-900 shadow-xs font-semibold'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/50'
                }`}
                title={scope.desc}
              >
                <span className={isSelected ? 'text-indigo-600' : 'text-neutral-500'}>
                  {scope.icon}
                </span>
                <span>{scope.label}</span>
                <span
                  className={`rounded-md px-1.5 py-0.5 text-[11px] tabular-nums ${
                    isSelected
                      ? 'bg-neutral-100 text-neutral-800'
                      : 'bg-neutral-200/70 text-neutral-600'
                  }`}
                >
                  {counts.completed}/{counts.total}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter and search bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-neutral-200">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="חיפוש משימה לפי כותרת או תיאור..."
            className="w-full pr-9 pl-4 py-1.5 text-xs sm:text-sm bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
          />
        </div>

        {/* Secondary filters: Status & Category */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status selector */}
          <div className="flex items-center p-0.5 bg-neutral-100 rounded-lg text-xs font-medium text-neutral-600">
            <button
              onClick={() => onStatusFilterChange('all')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                statusFilter === 'all' ? 'bg-white text-neutral-900 shadow-xs' : 'hover:text-neutral-900'
              }`}
            >
              הכל
            </button>
            <button
              onClick={() => onStatusFilterChange('active')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                statusFilter === 'active' ? 'bg-white text-neutral-900 shadow-xs' : 'hover:text-neutral-900'
              }`}
            >
              פעילות
            </button>
            <button
              onClick={() => onStatusFilterChange('completed')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                statusFilter === 'completed' ? 'bg-white text-neutral-900 shadow-xs' : 'hover:text-neutral-900'
              }`}
            >
              הושלמו
            </button>
          </div>

          {/* Category dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => onCategoryFilterChange(e.target.value as any)}
            aria-label="סינון לפי קטגוריה"
            className="text-xs bg-neutral-50 border border-neutral-200 rounded-lg px-2.5 py-1.5 font-medium text-neutral-700 focus:outline-none focus:border-indigo-500"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
