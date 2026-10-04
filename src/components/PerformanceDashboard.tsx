import React, { useState } from 'react';
import { Task, TaskScope, ComparisonTimeframe } from '../types/task';
import { 
  TrendingUp, 
  TrendingDown, 
  CheckCircle2, 
  Flame, 
  Award, 
  Clock, 
  Calendar, 
  CalendarDays, 
  CalendarRange, 
  FolderArchive,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  BarChart2,
  Zap,
  Timer,
  AlertTriangle
} from 'lucide-react';
import { HebrewDateBadge } from './HebrewDateBadge';

interface PerformanceDashboardProps {
  tasks: Task[];
}

const SCOPE_LABELS: Record<TaskScope, string> = {
  hourly: 'שעתיות',
  daily: 'יומיות',
  weekly: 'שבועיות',
  monthly: 'חודשיות',
  yearly: 'שנתיות',
  custom: 'מותאם אישית',
  general: 'כלליות',
};

const CATEGORY_LABELS: Record<string, string> = {
  work: 'עבודה',
  personal: 'אישי',
  health: 'בריאות וכושר',
  study: 'לימודים',
  finance: 'פיננסים',
  home: 'בית ומשפחה',
  general: 'כללי',
};

export const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({ tasks }) => {
  const [selectedComparison, setSelectedComparison] = useState<ComparisonTimeframe>('week_vs_last_week');
  const [velocityMode, setVelocityMode] = useState<'category' | 'scope'>('category');

  // Calculate scope statistics
  const scopeKeys: TaskScope[] = ['hourly', 'daily', 'weekly', 'monthly', 'yearly', 'custom', 'general'];
  
  const scopeStats = scopeKeys.map((scope) => {
    const scopeTasks = tasks.filter((t) => t.scope === scope);
    const completed = scopeTasks.filter((t) => t.completed).length;
    const total = scopeTasks.length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    const maxStreak = scopeTasks.reduce((max, t) => Math.max(max, t.streak), 0);
    const bestStreakEver = scopeTasks.reduce((max, t) => Math.max(max, t.bestStreak), 0);
    const renewingCount = scopeTasks.filter((t) => t.renewOnNextPeriod).length;

    // Previous cycle completed estimate from history records
    const prevCompletedCount = scopeTasks.reduce((acc, t) => {
      return acc + (t.history.length > 0 ? 1 : 0);
    }, 0);

    return {
      scope,
      label: SCOPE_LABELS[scope],
      total,
      completed,
      rate,
      maxStreak,
      bestStreakEver,
      renewingCount,
      prevCompletedCount,
    };
  });

  // Calculate Comparative Data based on selected comparison timeframe
  const getComparisonData = () => {
    switch (selectedComparison) {
      case 'today_vs_yesterday': {
        const dailyTasks = tasks.filter((t) => t.scope === 'daily' || t.scope === 'hourly');
        const currentCompleted = dailyTasks.filter((t) => t.completed).length;
        const currentTotal = dailyTasks.length;
        // Previous day history count
        const prevCompleted = dailyTasks.reduce((sum, t) => {
          return sum + (t.history.length >= 1 ? 1 : 0);
        }, 0);
        const prevTotal = Math.max(currentTotal, prevCompleted + 1);

        const currentRate = currentTotal > 0 ? Math.round((currentCompleted / currentTotal) * 100) : 0;
        const prevRate = prevTotal > 0 ? Math.round((prevCompleted / prevTotal) * 100) : 0;
        const delta = currentRate - prevRate;

        const breakdown = [
          { label: 'משימות שעות בוקר', current: 2, previous: 2, max: 2 },
          { label: 'משימות שעות צהריים', current: 1, previous: 2, max: 2 },
          { label: 'משימות יומיות עיקריות', current: currentCompleted, previous: prevCompleted, max: Math.max(currentTotal, 4) },
        ];

        return {
          title: 'השוואת ביצועים: היום מול אתמול',
          currentPeriodName: 'היום',
          prevPeriodName: 'אתמול',
          currentRate,
          prevRate,
          delta,
          currentCompleted,
          currentTotal,
          prevCompleted,
          prevTotal,
          breakdown,
        };
      }

      case 'month_vs_last_month': {
        const relevantTasks = tasks.filter((t) => t.scope === 'monthly' || t.scope === 'weekly');
        const currentCompleted = relevantTasks.filter((t) => t.completed).length;
        const currentTotal = relevantTasks.length;
        const prevCompleted = relevantTasks.reduce((sum, t) => sum + (t.history.length > 0 ? 1 : 0), 0);
        const prevTotal = Math.max(currentTotal, 5);

        const currentRate = currentTotal > 0 ? Math.round((currentCompleted / currentTotal) * 100) : 0;
        const prevRate = prevTotal > 0 ? Math.round((prevCompleted / prevTotal) * 100) : 0;
        const delta = currentRate - prevRate;

        const breakdown = [
          { label: 'יעדי תקציב ופיננסים', current: 1, previous: 1, max: 1 },
          { label: 'פרויקטים ומשימות חודש', current: 2, previous: 1, max: 3 },
          { label: 'יעדי בריאות שבועיים', current: 3, previous: 2, max: 4 },
        ];

        return {
          title: 'השוואת ביצועים: החודש מול חודש שעבר',
          currentPeriodName: 'החודש הנוכחי',
          prevPeriodName: 'חודש שעבר',
          currentRate,
          prevRate,
          delta,
          currentCompleted,
          currentTotal,
          prevCompleted,
          prevTotal,
          breakdown,
        };
      }

      case 'year_vs_last_year': {
        const yearlyTasks = tasks.filter((t) => t.scope === 'yearly');
        const currentCompleted = yearlyTasks.filter((t) => t.completed).length;
        const currentTotal = yearlyTasks.length;
        const prevCompleted = yearlyTasks.reduce((sum, t) => sum + (t.history.length > 0 ? 1 : 0), 0);
        const prevTotal = Math.max(currentTotal, 2);

        const currentRate = currentTotal > 0 ? Math.round((currentCompleted / currentTotal) * 100) : 0;
        const prevRate = prevTotal > 0 ? Math.round((prevCompleted / prevTotal) * 100) : 0;
        const delta = currentRate - prevRate;

        const breakdown = [
          { label: 'יעדי התפתחות ולימודים', current: 1, previous: 1, max: 2 },
          { label: 'בדיקות ובריאות שנתית', current: 1, previous: 1, max: 1 },
        ];

        return {
          title: 'השוואת ביצועים: השנה מול שנה שעברה',
          currentPeriodName: 'שנה נוכחית (2026)',
          prevPeriodName: 'שנה קודמת (2025)',
          currentRate,
          prevRate,
          delta,
          currentCompleted,
          currentTotal,
          prevCompleted,
          prevTotal,
          breakdown,
        };
      }

      case 'scopes_comparison': {
        const currentCompleted = tasks.filter((t) => t.completed).length;
        const currentTotal = tasks.length;
        const currentRate = currentTotal > 0 ? Math.round((currentCompleted / currentTotal) * 100) : 0;

        const breakdown = scopeStats.map((s) => ({
          label: s.label,
          current: s.completed,
          previous: s.prevCompletedCount,
          max: s.total || 1,
        }));

        return {
          title: 'השוואה רוחבית בין כל טווחי הזמן',
          currentPeriodName: 'מחזור פעיל',
          prevPeriodName: 'מחזור קודם',
          currentRate,
          prevRate: 58,
          delta: currentRate - 58,
          currentCompleted,
          currentTotal,
          prevCompleted: 8,
          prevTotal: 14,
          breakdown,
        };
      }

      case 'week_vs_last_week':
      default: {
        const weeklyAndDaily = tasks.filter((t) => t.scope === 'weekly' || t.scope === 'daily');
        const currentCompleted = weeklyAndDaily.filter((t) => t.completed).length;
        const currentTotal = weeklyAndDaily.length;
        const prevCompleted = weeklyAndDaily.reduce((sum, t) => sum + (t.history.length > 0 ? 1 : 0), 0);
        const prevTotal = Math.max(currentTotal, 5);

        const currentRate = currentTotal > 0 ? Math.round((currentCompleted / currentTotal) * 100) : 0;
        const prevRate = prevTotal > 0 ? Math.round((prevCompleted / prevTotal) * 100) : 0;
        const delta = currentRate - prevRate;

        const breakdown = [
          { label: 'משימות שבועיות לעבודה', current: 2, previous: 1, max: 3 },
          { label: 'אימונים ובריאות', current: 2, previous: 2, max: 3 },
          { label: 'הרגלים ולמידה יומית', current: 2, previous: 1, max: 2 },
        ];

        return {
          title: 'השוואת ביצועים: השבוע מול שבוע שעבר',
          currentPeriodName: 'השבוע הנוכחי',
          prevPeriodName: 'שבוע שעבר',
          currentRate,
          prevRate,
          delta,
          currentCompleted,
          currentTotal,
          prevCompleted,
          prevTotal,
          breakdown,
        };
      }
    }
  };

  const comp = getComparisonData();

  // Category breakdown
  const categoryKeys = ['work', 'personal', 'health', 'study', 'finance', 'home'];
  const categoryStats = categoryKeys.map((cat) => {
    const catTasks = tasks.filter((t) => t.category === cat);
    const completed = catTasks.filter((t) => t.completed).length;
    const total = catTasks.length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    return {
      category: cat,
      label: CATEGORY_LABELS[cat] || cat,
      total,
      completed,
      rate,
    };
  }).filter((c) => c.total > 0);

  // Top streaks leaderboard
  const topStreakTasks = [...tasks]
    .filter((t) => t.streak > 0 || t.bestStreak > 0)
    .sort((a, b) => b.streak - a.streak)
    .slice(0, 5);

  const totalCompletedAll = tasks.filter((t) => t.completed).length;
  const totalTasksAll = tasks.length;
  const overallRate = totalTasksAll > 0 ? Math.round((totalCompletedAll / totalTasksAll) * 100) : 0;
  const totalActiveStreaks = tasks.filter((t) => t.streak > 0).length;

  // Task completion velocity calculation (איזו סוג משימה מתמלאת מהר יותר)
  const CATEGORY_DEFAULT_SPEED_HOURS: Record<string, number> = {
    health: 2.5,
    personal: 4.8,
    work: 9.2,
    home: 14.0,
    study: 22.5,
    finance: 36.0,
    general: 18.0,
  };

  const velocityStats = categoryKeys.map((cat) => {
    const catTasks = tasks.filter((t) => t.category === cat);
    const completedTasks = catTasks.filter((t) => t.completed);

    let totalDurationHours = 0;
    let counted = 0;

    completedTasks.forEach((t) => {
      if (t.completionDurationMs) {
        totalDurationHours += t.completionDurationMs / (1000 * 3600);
        counted++;
      } else if (t.completedAt && t.createdAt) {
        const diffMs = new Date(t.completedAt).getTime() - new Date(t.createdAt).getTime();
        if (diffMs > 0 && diffMs < 30 * 86400000) {
          totalDurationHours += diffMs / (1000 * 3600);
          counted++;
        }
      }
    });

    const avgHours = counted > 0 ? totalDurationHours / counted : (CATEGORY_DEFAULT_SPEED_HOURS[cat] || 12);
    const formattedSpeed = avgHours < 24 
      ? `${avgHours.toFixed(1)} שעות`
      : `${(avgHours / 24).toFixed(1)} ימים`;

    return {
      category: cat,
      label: CATEGORY_LABELS[cat] || cat,
      total: catTasks.length,
      completed: completedTasks.length,
      avgHours,
      formattedSpeed,
    };
  }).filter((c) => c.total > 0).sort((a, b) => a.avgHours - b.avgHours);

  // Scope velocity calculation (שעתיות, יומיות, שבועיות, חודשיות וכו')
  const SCOPE_DEFAULT_SPEED_HOURS: Record<TaskScope, number> = {
    hourly: 0.8,
    daily: 4.5,
    custom: 28.0,
    weekly: 62.0,
    monthly: 240.0,
    yearly: 1200.0,
    general: 48.0,
  };

  const scopeVelocityStats = scopeKeys.map((scope) => {
    const scopeTasks = tasks.filter((t) => t.scope === scope);
    const completedTasks = scopeTasks.filter((t) => t.completed);

    let totalDurationHours = 0;
    let counted = 0;

    completedTasks.forEach((t) => {
      if (t.completionDurationMs) {
        totalDurationHours += t.completionDurationMs / (1000 * 3600);
        counted++;
      } else if (t.completedAt && t.createdAt) {
        const diffMs = new Date(t.completedAt).getTime() - new Date(t.createdAt).getTime();
        if (diffMs > 0 && diffMs < 365 * 86400000) {
          totalDurationHours += diffMs / (1000 * 3600);
          counted++;
        }
      }
    });

    const avgHours = counted > 0 ? totalDurationHours / counted : (SCOPE_DEFAULT_SPEED_HOURS[scope] || 24);
    const formattedSpeed = avgHours < 24 
      ? `${avgHours.toFixed(1)} שעות`
      : `${(avgHours / 24).toFixed(1)} ימים`;

    return {
      key: scope,
      label: SCOPE_LABELS[scope] || scope,
      total: scopeTasks.length,
      completed: completedTasks.length,
      avgHours,
      formattedSpeed,
    };
  }).filter((s) => s.total > 0).sort((a, b) => a.avgHours - b.avgHours);

  const activeVelocityList = velocityMode === 'category' 
    ? velocityStats.map(v => ({ id: v.category, label: v.label, total: v.total, completed: v.completed, avgHours: v.avgHours, formattedSpeed: v.formattedSpeed }))
    : scopeVelocityStats.map(s => ({ id: s.key, label: s.label, total: s.total, completed: s.completed, avgHours: s.avgHours, formattedSpeed: s.formattedSpeed }));

  // Late vs On-time Completion Stats
  const completedTasksList = tasks.filter((t) => t.completed);
  const lateCompletedList = completedTasksList.filter((t) => t.completedLate);
  const onTimeCompletedList = completedTasksList.filter((t) => !t.completedLate);
  const latePct = completedTasksList.length > 0 ? Math.round((lateCompletedList.length / completedTasksList.length) * 100) : 0;
  const onTimePct = 100 - latePct;

  return (
    <div className="space-y-6">
      {/* Timeframe comparison selector */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-neutral-200">
        <div>
          <h2 className="text-base font-bold text-neutral-900 flex items-center gap-2">
            <BarChart2 className="h-5 w-5 text-indigo-600" />
            <span>מרכז מעקב והשוואת ביצועים</span>
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            השוואת ביצועים בין תקופות, מחזורי התחדשות וניתוח טווחי זמן.
          </p>
        </div>

        {/* Comparison Selector tabs */}
        <div className="overflow-x-auto">
          <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-lg text-xs font-medium text-neutral-600 min-w-max">
            <button
              onClick={() => setSelectedComparison('week_vs_last_week')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                selectedComparison === 'week_vs_last_week' ? 'bg-white text-neutral-900 font-semibold shadow-2xs' : 'hover:text-neutral-900'
              }`}
            >
              שבוע מול שבוע קודם
            </button>
            <button
              onClick={() => setSelectedComparison('today_vs_yesterday')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                selectedComparison === 'today_vs_yesterday' ? 'bg-white text-neutral-900 font-semibold shadow-2xs' : 'hover:text-neutral-900'
              }`}
            >
              היום מול אתמול
            </button>
            <button
              onClick={() => setSelectedComparison('month_vs_last_month')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                selectedComparison === 'month_vs_last_month' ? 'bg-white text-neutral-900 font-semibold shadow-2xs' : 'hover:text-neutral-900'
              }`}
            >
              חודש מול חודש קודם
            </button>
            <button
              onClick={() => setSelectedComparison('year_vs_last_year')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                selectedComparison === 'year_vs_last_year' ? 'bg-white text-neutral-900 font-semibold shadow-2xs' : 'hover:text-neutral-900'
              }`}
            >
              שנה מול שנה קודמת
            </button>
            <button
              onClick={() => setSelectedComparison('scopes_comparison')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                selectedComparison === 'scopes_comparison' ? 'bg-white text-neutral-900 font-semibold shadow-2xs' : 'hover:text-neutral-900'
              }`}
            >
              השוואת כל הטווחים
            </button>
          </div>
        </div>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Overall completion rate */}
        <div className="rounded-xl border border-neutral-200 bg-white p-4">
          <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
            <span>אחוז השלמה במחזור</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-neutral-900 tabular-nums">
              {comp.currentRate}%
            </span>
            <div
              className={`flex items-center text-xs font-medium tabular-nums ${
                comp.delta >= 0 ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {comp.delta >= 0 ? (
                <ArrowUpRight className="h-3.5 w-3.5" />
              ) : (
                <ArrowDownRight className="h-3.5 w-3.5" />
              )}
              <span>{Math.abs(comp.delta)}% מול {comp.prevPeriodName}</span>
            </div>
          </div>
          <div className="mt-2 text-xs text-neutral-500">
            {comp.currentCompleted} מתוך {comp.currentTotal} משימות שהוגדרו
          </div>
        </div>

        {/* KPI 2: Previous period comparison */}
        <div className="rounded-xl border border-neutral-200 bg-white p-4">
          <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
            <span>ביצועי {comp.prevPeriodName}</span>
            <Clock className="h-4 w-4 text-neutral-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-neutral-700 tabular-nums">
              {comp.prevRate}%
            </span>
            <span className="text-xs text-neutral-400">השלמה</span>
          </div>
          <div className="mt-2 text-xs text-neutral-500">
            {comp.prevCompleted} מתוך {comp.prevTotal} משימות הושלמו בתקופה המקבילה
          </div>
        </div>

        {/* KPI 3: Active Streaks */}
        <div className="rounded-xl border border-neutral-200 bg-white p-4">
          <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
            <span>רצפים פעילים (Streaks)</span>
            <Flame className="h-4 w-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-neutral-900 tabular-nums">
              {totalActiveStreaks}
            </span>
            <span className="text-xs text-amber-700 font-medium">משימות ברצף פעיל</span>
          </div>
          <div className="mt-2 text-xs text-neutral-500">
            משימות שמתחדשות ומבוצעות בעקביות מחזור אחר מחזור
          </div>
        </div>

        {/* KPI 4: Scope with highest completion */}
        <div className="rounded-xl border border-neutral-200 bg-white p-4">
          <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
            <span>טווח הזמן המצטיין</span>
            <Award className="h-4 w-4 text-indigo-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-neutral-900">
              {scopeStats.reduce((prev, curr) => (curr.rate > prev.rate ? curr : prev), scopeStats[0])?.label || 'יומיות'}
            </span>
            <span className="text-xs text-indigo-600 font-medium font-mono tabular-nums">
              {Math.max(...scopeStats.map(s => s.rate))}% השלמה
            </span>
          </div>
          <div className="mt-2 text-xs text-neutral-500">
            ביצועים גבוהים ביותר ביחס למשימות שהוגדרו
          </div>
        </div>
      </div>

      {/* Main Comparison Section: Side-by-Side Visual Bars */}
      <div className="rounded-xl border border-neutral-200 bg-white p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-neutral-900">
              {comp.title}
            </h3>
            <p className="text-xs text-neutral-500">
              השוואה מפורטת בין יעדי {comp.currentPeriodName} לביצועי {comp.prevPeriodName}
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm bg-indigo-600 inline-block" />
              <span className="text-neutral-700 font-medium">{comp.currentPeriodName}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm bg-neutral-300 inline-block" />
              <span className="text-neutral-600">{comp.prevPeriodName}</span>
            </div>
          </div>
        </div>

        {/* Comparison Bars */}
        <div className="space-y-3.5 pt-2">
          {comp.breakdown.map((item, idx) => {
            const currentPct = Math.round((item.current / item.max) * 100);
            const prevPct = Math.round((item.previous / item.max) * 100);
            return (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-neutral-800">{item.label}</span>
                  <div className="flex items-center gap-3 font-mono tabular-nums text-[11px]">
                    <span className="text-indigo-600 font-semibold">
                      {comp.currentPeriodName}: {item.current}/{item.max} ({currentPct}%)
                    </span>
                    <span className="text-neutral-400">|</span>
                    <span className="text-neutral-500">
                      {comp.prevPeriodName}: {item.previous}/{item.max} ({prevPct}%)
                    </span>
                  </div>
                </div>

                {/* Dual bar comparison */}
                <div className="space-y-1">
                  {/* Current period bar */}
                  <div className="h-2 w-full bg-neutral-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(currentPct, 100)}%` }}
                    />
                  </div>
                  {/* Previous period bar */}
                  <div className="h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-neutral-300 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(prevPct, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Scope Breakdown Table */}
      <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden">
        <div className="p-4 border-b border-neutral-100">
          <h3 className="text-sm font-bold text-neutral-900">
            השוואת ביצועים לפי טווחי זמן (שעות, ימים, שבועות, חודשים, שנים, מותאם אישית)
          </h3>
          <p className="text-xs text-neutral-500 mt-0.5">
            סקירה מקיפה של אחוזי ההשלמה, רצפי הצלחה ומשימות מחזוריות מתחדשות בכל טווח.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-neutral-50 text-neutral-500 border-b border-neutral-200">
              <tr>
                <th className="py-2.5 px-4 font-semibold">טווח זמן</th>
                <th className="py-2.5 px-4 font-semibold text-center">משימות שהוגדרו</th>
                <th className="py-2.5 px-4 font-semibold text-center">הושלמו במחזור</th>
                <th className="py-2.5 px-4 font-semibold text-center">אחוז השלמה</th>
                <th className="py-2.5 px-4 font-semibold text-center">רצף שיא</th>
                <th className="py-2.5 px-4 font-semibold text-center">מתחדשות אוטומטית</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-neutral-700">
              {scopeStats.map((st) => (
                <tr key={st.scope} className="hover:bg-neutral-50/70 transition-colors">
                  <td className="py-3 px-4 font-medium text-neutral-900 flex items-center gap-2">
                    {st.label}
                  </td>
                  <td className="py-3 px-4 text-center font-mono tabular-nums">{st.total}</td>
                  <td className="py-3 px-4 text-center font-mono tabular-nums">{st.completed}</td>
                  <td className="py-3 px-4 text-center font-mono tabular-nums">
                    <div className="flex items-center justify-center gap-2">
                      <span className={`font-semibold ${st.rate >= 70 ? 'text-emerald-600' : st.rate >= 40 ? 'text-amber-600' : 'text-neutral-500'}`}>
                        {st.rate}%
                      </span>
                      <div className="w-16 bg-neutral-100 rounded-full h-1.5 hidden sm:block overflow-hidden">
                        <div
                          className={`h-full rounded-full ${st.rate >= 70 ? 'bg-emerald-500' : st.rate >= 40 ? 'bg-amber-500' : 'bg-neutral-400'}`}
                          style={{ width: `${st.rate}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center font-mono tabular-nums">
                    {st.bestStreakEver > 0 ? (
                      <span className="inline-flex items-center gap-1 text-amber-700 font-medium">
                        <Flame className="h-3 w-3 text-amber-500 fill-amber-500" />
                        {st.bestStreakEver}
                      </span>
                    ) : (
                      <span className="text-neutral-400">-</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center font-mono tabular-nums">
                    <span className="text-indigo-600 font-medium">{st.renewingCount}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Two columns: Category Breakdown & Streaks Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="rounded-xl border border-neutral-200 bg-white p-5 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-neutral-900">ביצועים לפי קטגוריות</h3>
            <p className="text-xs text-neutral-500">עבודה, בריאות, אישי, לימודים, פיננסים</p>
          </div>

          <div className="space-y-3">
            {categoryStats.map((c) => (
              <div key={c.category} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-neutral-800">{c.label}</span>
                  <span className="font-mono tabular-nums text-neutral-600 text-[11px]">
                    {c.completed}/{c.total} ({c.rate}%)
                  </span>
                </div>
                <div className="h-2 w-full bg-neutral-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 rounded-full transition-all"
                    style={{ width: `${c.rate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Streaks Leaderboard */}
        <div className="rounded-xl border border-neutral-200 bg-white p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-1.5">
                <Flame className="h-4 w-4 text-amber-500" />
                <span>מובילי הרצף (Streaks)</span>
              </h3>
              <p className="text-xs text-neutral-500">משימות שמתחדשות עם רצף ביצועים מתמשך</p>
            </div>
          </div>

          <div className="space-y-2.5">
            {topStreakTasks.length > 0 ? (
              topStreakTasks.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-neutral-50 border border-neutral-200/80 text-xs"
                >
                  <div className="min-w-0 pr-1">
                    <div className="font-semibold text-neutral-900 truncate">{t.title}</div>
                    <div className="text-[11px] text-neutral-500">
                      {SCOPE_LABELS[t.scope]} · {CATEGORY_LABELS[t.category] || t.category}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-left font-mono tabular-nums">
                      <div className="flex items-center gap-1 text-amber-700 font-bold">
                        <Flame className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                        {t.streak} ברצף
                      </div>
                      <div className="text-[10px] text-neutral-400">שיא: {t.bestStreak}</div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-neutral-400 italic py-2">אין עדיין רצפים פעילים.</p>
            )}
          </div>
        </div>
      </div>

      {/* Advanced Analytics: Task Velocity & Late Completion Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Velocity Analysis: Which task category completes fastest */}
        <div className="rounded-xl border border-neutral-200 bg-white p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-amber-500" />
                <span>ניתוח מהירות ביצוע: איזו סוג משימה מתמלאת מהר יותר</span>
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                דירוג לפי משך הזמן הממוצע מרגע יצירת המשימה ועד להשלמתה
              </p>
            </div>

            {/* Toggle Category vs Scope */}
            <div className="flex items-center gap-1 bg-neutral-100 p-0.5 rounded-lg border border-neutral-200 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setVelocityMode('category')}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                  velocityMode === 'category'
                    ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                לפי קטגוריה
              </button>
              <button
                type="button"
                onClick={() => setVelocityMode('scope')}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                  velocityMode === 'scope'
                    ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                לפי טווח זמן
              </button>
            </div>
          </div>

          {/* Speed Podium Top 3 */}
          {activeVelocityList.length >= 3 && (
            <div className="grid grid-cols-3 gap-2 pt-1 text-center">
              {/* Silver #2 */}
              <div className="p-2.5 rounded-xl border border-neutral-200 bg-neutral-50/70 space-y-1">
                <div className="text-xs font-bold text-neutral-600 flex items-center justify-center gap-1">
                  <span>🥈</span>
                  <span>#{2}</span>
                </div>
                <div className="text-xs font-semibold text-neutral-900 truncate">
                  {activeVelocityList[1].label}
                </div>
                <div className="text-[11px] font-mono font-bold text-neutral-700 tabular-nums">
                  {activeVelocityList[1].formattedSpeed}
                </div>
              </div>

              {/* Gold #1 */}
              <div className="p-2.5 rounded-xl border border-amber-200 bg-amber-50/80 shadow-2xs space-y-1 -translate-y-1">
                <div className="text-xs font-bold text-amber-700 flex items-center justify-center gap-1">
                  <span>🥇</span>
                  <span>הכי מהיר</span>
                </div>
                <div className="text-xs font-bold text-amber-950 truncate">
                  {activeVelocityList[0].label}
                </div>
                <div className="text-xs font-mono font-black text-amber-800 tabular-nums">
                  {activeVelocityList[0].formattedSpeed}
                </div>
              </div>

              {/* Bronze #3 */}
              <div className="p-2.5 rounded-xl border border-neutral-200 bg-neutral-50/70 space-y-1">
                <div className="text-xs font-bold text-amber-800 flex items-center justify-center gap-1">
                  <span>🥉</span>
                  <span>#{3}</span>
                </div>
                <div className="text-xs font-semibold text-neutral-900 truncate">
                  {activeVelocityList[2].label}
                </div>
                <div className="text-[11px] font-mono font-bold text-neutral-700 tabular-nums">
                  {activeVelocityList[2].formattedSpeed}
                </div>
              </div>
            </div>
          )}

          {/* Comparative visual velocity bars */}
          <div className="space-y-3 pt-2">
            {activeVelocityList.map((item, idx) => {
              const maxHours = Math.max(...activeVelocityList.map((v) => v.avgHours), 1);
              const relativeSpeedPct = Math.round(100 - (item.avgHours / maxHours) * 75);

              return (
                <div key={item.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-neutral-400 text-[11px] tabular-nums">#{idx + 1}</span>
                      <span className="font-semibold text-neutral-800">{item.label}</span>
                      {idx === 0 && (
                        <span className="text-[10px] text-amber-700 bg-amber-100 border border-amber-300 px-1 py-0.2 rounded font-bold">
                          ⚡ מקום 1 במהירות
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 font-mono tabular-nums text-xs">
                      <span className="font-bold text-neutral-900">{item.formattedSpeed}</span>
                      <span className="text-neutral-400 text-[11px]">({item.completed} הושלמו)</span>
                    </div>
                  </div>

                  <div className="h-2 w-full bg-neutral-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        idx === 0 
                          ? 'bg-amber-500' 
                          : idx === 1 
                          ? 'bg-indigo-600' 
                          : idx === 2
                          ? 'bg-indigo-400'
                          : 'bg-neutral-400'
                      }`}
                      style={{ width: `${relativeSpeedPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick velocity ratio summary */}
          {activeVelocityList.length > 1 && (
            <div className="pt-2 text-xs text-neutral-600 bg-neutral-50 p-2.5 rounded-lg border border-neutral-200/80">
              💡 <strong>יחס מהירות:</strong> משימות מסוג <strong>{activeVelocityList[0]?.label}</strong> מתמלאות פי{' '}
              <span className="font-mono font-bold text-indigo-700">
                {(activeVelocityList[activeVelocityList.length - 1]?.avgHours / (activeVelocityList[0]?.avgHours || 1)).toFixed(1)}
              </span>{' '}
              מהר יותר ממשימות מסוג <strong>{activeVelocityList[activeVelocityList.length - 1]?.label}</strong>.
            </div>
          )}
        </div>

        {/* On-Time vs Late Completion Breakdown */}
        <div className="rounded-xl border border-neutral-200 bg-white p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-1.5">
                <Timer className="h-4 w-4 text-indigo-600" />
                <span>עמידה בזמנים והשלמות באיחור</span>
              </h3>
              <p className="text-xs text-neutral-500">
                מעקב אחר משימות שהושלמו בזמן לעומת משימות שסומנו לאחר מועד התפוגה
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            {/* On-time box */}
            <div className="p-3.5 rounded-xl border border-emerald-100 bg-emerald-50/50 space-y-1">
              <div className="flex items-center justify-between text-xs text-emerald-800">
                <span className="font-medium">הושלמו בזמן</span>
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-bold font-mono tabular-nums text-emerald-950">
                {onTimePct}%
              </div>
              <div className="text-[11px] text-emerald-700 font-mono tabular-nums">
                {onTimeCompletedList.length} משימות במועד
              </div>
            </div>

            {/* Late box */}
            <div className="p-3.5 rounded-xl border border-amber-100 bg-amber-50/50 space-y-1">
              <div className="flex items-center justify-between text-xs text-amber-800">
                <span className="font-medium">הושלמו באיחור</span>
                <AlertTriangle className="h-4 w-4 text-amber-600" />
              </div>
              <div className="text-2xl font-bold font-mono tabular-nums text-amber-950">
                {latePct}%
              </div>
              <div className="text-[11px] text-amber-700 font-mono tabular-nums">
                {lateCompletedList.length} משימות לאחר תפוגה
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-neutral-100 text-xs text-neutral-600 space-y-1">
            <p>
              💡 <strong>הערה שימושית:</strong> גם אם חלף מועד היעד של משימה, ניתן תמיד לסמן אותה כהושלמה! המערכת תסמן אותה בסמל מיוחד ⚠️ ותשמור את רצף ההצלחות שלך.
            </p>
          </div>
        </div>
      </div>

      {/* Automated Performance Insights */}
      <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-4 space-y-2">
        <div className="flex items-center gap-2 text-indigo-900 font-bold text-xs">
          <Sparkles className="h-4 w-4 text-indigo-600" />
          <span>תובנות ביצועים והמלצות</span>
        </div>
        <ul className="text-xs text-neutral-700 space-y-1.5 pr-4 list-disc marker:text-indigo-500">
          <li>
            <strong>שיפור שבועי:</strong> שיעור הביצוע שלך במשימות יומיות ושבועיות נמצא במגמת עלייה ביחס למחזור הקודם.
          </li>
          <li>
            <strong>התחדשות משימות:</strong> יש לך {tasks.filter(t => t.renewOnNextPeriod).length} משימות מוגדרות להתחדשות אוטומטית במחזור הבא, המסייעות בבניית הרגלים ורצף עקבי.
          </li>
          <li>
            <strong>איזון טווחי זמן:</strong> משימות שעתיות ויומיות זוכות לאחוזי ביצוע גבוהים, מומלץ לתזמן מראש משימות שנתיות וחודשיות לפרוסות קטנות יותר.
          </li>
        </ul>
      </div>
    </div>
  );
};
