export type TaskScope = 
  | 'hourly'    // שעות
  | 'daily'     // ימים
  | 'weekly'    // שבועות
  | 'monthly'   // חודשיות
  | 'yearly'    // שנתיות
  | 'custom'    // זמן מותאם אישית
  | 'general';  // כלליות

export type TaskPriority = 'high' | 'medium' | 'low';

export type TaskCategory = 
  | 'work'      // עבודה
  | 'personal'  // אישי
  | 'health'    // בריאות וכושר
  | 'study'     // לימודים
  | 'finance'   // פיננסים
  | 'home'      // בית ומשפחה
  | 'general';  // כללי

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface CompletionRecord {
  periodKey: string;     // e.g. "2026-10-03-14" (hourly), "2026-10-03" (daily), "2026-W40" (weekly), "2026-10" (monthly), "2026" (yearly)
  completedAt: string;   // ISO timestamp
  periodLabel: string;   // human readable label
  onTime: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  scope: TaskScope;
  priority: TaskPriority;
  category: TaskCategory;
  
  // Timeframe details
  targetHour?: string;       // e.g. "09:00" or "09:00 - 10:00"
  targetDate?: string;       // YYYY-MM-DD
  customDaysInterval?: number; // e.g. every 3 days, 10 days
  customStartDate?: string;
  customEndDate?: string;

  // Auto-renewal in next period
  renewOnNextPeriod: boolean; // האם מתחדשת אוטומטית במחזור הבא
  renewalInterval?: number;   // default 1 (every 1 day/week/month/hour)
  
  // Browser Reminder & Notification
  reminderEnabled?: boolean;  // האם להפעיל תזכורת דפדפן
  reminderTime?: string;     // שעת התזכורת e.g. "09:30"
  reminderNotifiedPeriods?: string[]; // period keys where notification already fired
  
  // Quantitative progress tracking (financial savings, study pages/hours, etc.)
  isProgressTask?: boolean;   // האם זו משימה עם יעד כמותי
  targetValue?: number;       // יעד מספרי (לדוגמה: 5000 ₪, 300 עמודים)
  currentValue?: number;      // ערך נוכחי (לדוגמה: 1250 ₪)
  unit?: string;              // יחידת מידה (למשל: ₪, עמודים, שעות, ק״מ)
  progressStep?: number;      // קפיצת הוספה מהירה (למשל: 50 ₪ או 10 עמודים)

  // Status & Cycles
  completed: boolean;        // In active period
  completedAt?: string;      // Last completion
  completedLate?: boolean;   // האם הושלמה לאחר תאריך התפוגה / באיחור
  daysLate?: number;         // מספר הימים באיחור
  completionDurationMs?: number; // משך הזמן מיצירה עד השלמה במילישניות (לניתוח מהירות)
  currentPeriodKey: string;  // Active period identifier
  
  // Performance & Streaks
  streak: number;            // Current consecutive cycles completed
  bestStreak: number;        // Highest streak achieved
  totalCompletions: number;  // Total times completed across all cycles
  history: CompletionRecord[];
  
  subtasks: Subtask[];
  createdAt: string;
  updatedAt: string;
}

export interface ScopeStats {
  scope: TaskScope;
  total: number;
  completed: number;
  completionRate: number;
  activeStreaks: number;
}

export type ComparisonTimeframe = 'today_vs_yesterday' | 'week_vs_last_week' | 'month_vs_last_month' | 'year_vs_last_year' | 'scopes_comparison';
