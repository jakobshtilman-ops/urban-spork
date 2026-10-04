import { Task } from '../types/task';
import { getPeriodKey, getPreviousPeriodKey, getPeriodLabel } from './dateUtils';
import { saveTasksToComputerDisk } from './localDiskStorage';

const STORAGE_KEY = 'tactic_tasks_v1';

export function getInitialTasks(): Task[] {
  const now = new Date();
  const currentHourlyKey = getPeriodKey('hourly', now);
  const prevHourlyKey = getPreviousPeriodKey('hourly', now);

  const currentDailyKey = getPeriodKey('daily', now);
  const prevDailyKey = getPreviousPeriodKey('daily', now);

  const currentWeeklyKey = getPeriodKey('weekly', now);
  const prevWeeklyKey = getPreviousPeriodKey('weekly', now);

  const currentMonthlyKey = getPeriodKey('monthly', now);
  const prevMonthlyKey = getPreviousPeriodKey('monthly', now);

  const currentYearlyKey = getPeriodKey('yearly', now);
  const prevYearlyKey = getPreviousPeriodKey('yearly', now);

  const currentCustomKey = getPeriodKey('custom', now, 3);
  const prevCustomKey = getPreviousPeriodKey('custom', now, 3);

  const sampleTasks: Task[] = [
    // 1. HOURLY TASKS
    {
      id: 'task-h1',
      title: 'סנכרון בוקר ותעדוף משימות יומיות',
      description: 'בדיקת יומן, דוא״ל דחוף וקביעת 3 יעדי מפתח לשעות העבודה.',
      scope: 'hourly',
      priority: 'high',
      category: 'work',
      targetHour: '09:00 - 10:00',
      renewOnNextPeriod: true,
      renewalInterval: 1,
      reminderEnabled: true,
      reminderTime: '09:00',
      completed: true,
      completedAt: new Date(now.getTime() - 20 * 60 * 1000).toISOString(),
      currentPeriodKey: currentHourlyKey,
      streak: 6,
      bestStreak: 12,
      totalCompletions: 28,
      history: [
        {
          periodKey: prevHourlyKey,
          completedAt: new Date(now.getTime() - 80 * 60 * 1000).toISOString(),
          periodLabel: getPeriodLabel('hourly', prevHourlyKey),
          onTime: true,
        },
        {
          periodKey: currentHourlyKey,
          completedAt: new Date(now.getTime() - 20 * 60 * 1000).toISOString(),
          periodLabel: getPeriodLabel('hourly', currentHourlyKey),
          onTime: true,
        },
      ],
      subtasks: [
        { id: 'sub-1', title: 'מעבר על הודעות שלא נקראו', completed: true },
        { id: 'sub-2', title: 'הגדרת טופ 3 משימות להיום', completed: true },
      ],
      createdAt: new Date(now.getTime() - 7 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'task-h2',
      title: 'שעת ריכוז עמוק (Deep Work) ללא התראות',
      description: 'בלוק עבודה רצוף על פיתוח הפיצ׳ר המרכזי ללא קטיעות.',
      scope: 'hourly',
      priority: 'high',
      category: 'work',
      targetHour: '14:00 - 15:00',
      renewOnNextPeriod: true,
      renewalInterval: 1,
      completed: false,
      currentPeriodKey: currentHourlyKey,
      streak: 3,
      bestStreak: 5,
      totalCompletions: 14,
      history: [
        {
          periodKey: prevHourlyKey,
          completedAt: new Date(now.getTime() - 24 * 3600000).toISOString(),
          periodLabel: getPeriodLabel('hourly', prevHourlyKey),
          onTime: true,
        },
      ],
      subtasks: [
        { id: 'sub-h2-1', title: 'הפעלת מצב שקט', completed: true },
        { id: 'sub-h2-2', title: 'השלמת מקטע הקוד הראשי', completed: false },
      ],
      createdAt: new Date(now.getTime() - 5 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    },

    // 2. DAILY TASKS
    {
      id: 'task-d1',
      title: 'אימון כושר יומי והליכה קצרה',
      description: 'פעילות גופנית של לפחות 40 דקות לשמירה על חדות ואנרגיה.',
      scope: 'daily',
      priority: 'high',
      category: 'health',
      targetDate: currentDailyKey,
      renewOnNextPeriod: true,
      completed: true,
      completedAt: new Date(now.getTime() - 3 * 3600000).toISOString(),
      currentPeriodKey: currentDailyKey,
      streak: 5,
      bestStreak: 14,
      totalCompletions: 42,
      history: [
        {
          periodKey: prevDailyKey,
          completedAt: new Date(now.getTime() - 26 * 3600000).toISOString(),
          periodLabel: getPeriodLabel('daily', prevDailyKey),
          onTime: true,
        },
        {
          periodKey: currentDailyKey,
          completedAt: new Date(now.getTime() - 3 * 3600000).toISOString(),
          periodLabel: getPeriodLabel('daily', currentDailyKey),
          onTime: true,
        },
      ],
      subtasks: [
        { id: 'sub-d1', title: 'מתיחות 10 דקות', completed: true },
        { id: 'sub-d2', title: '30 דקות אימון אינטרוולים', completed: true },
      ],
      createdAt: new Date(now.getTime() - 30 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'task-d2',
      title: 'שתיית 2.5 ליטר מים לאורך היום',
      description: 'מעקב הידרציה לאורך שעות העבודה והערב.',
      scope: 'daily',
      priority: 'medium',
      category: 'health',
      targetDate: currentDailyKey,
      renewOnNextPeriod: true,
      completed: false,
      currentPeriodKey: currentDailyKey,
      streak: 7,
      bestStreak: 21,
      totalCompletions: 55,
      history: [
        {
          periodKey: prevDailyKey,
          completedAt: new Date(now.getTime() - 22 * 3600000).toISOString(),
          periodLabel: getPeriodLabel('daily', prevDailyKey),
          onTime: true,
        },
      ],
      subtasks: [
        { id: 'sub-w1', title: 'בקבוק ראשון (1 ליטר) עד 12:00', completed: true },
        { id: 'sub-w2', title: 'בקבוק שני עד 17:00', completed: false },
      ],
      createdAt: new Date(now.getTime() - 60 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'task-d3',
      title: 'קריאת ספר מקצועי בארכיטקטורה',
      description: 'למידה מתמדת של ארכיטקטורת מערכות וניהול מוצר (הוסף עמודים שנקראו).',
      scope: 'daily',
      priority: 'medium',
      category: 'study',
      targetDate: currentDailyKey,
      renewOnNextPeriod: true,
      isProgressTask: true,
      targetValue: 320,
      currentValue: 160,
      unit: 'עמודים',
      progressStep: 10,
      completed: false,
      currentPeriodKey: currentDailyKey,
      streak: 4,
      bestStreak: 10,
      totalCompletions: 31,
      history: [
        {
          periodKey: prevDailyKey,
          completedAt: new Date(now.getTime() - 25 * 3600000).toISOString(),
          periodLabel: getPeriodLabel('daily', prevDailyKey),
          onTime: true,
        },
        {
          periodKey: currentDailyKey,
          completedAt: new Date(now.getTime() - 5 * 3600000).toISOString(),
          periodLabel: getPeriodLabel('daily', currentDailyKey),
          onTime: true,
        },
      ],
      subtasks: [],
      createdAt: new Date(now.getTime() - 20 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'task-d-late',
      title: 'הגשת דוח הוצאות נסיעה לחשבות שכר',
      description: 'איסוף קבלות והגשה לפורטל השכר החודשי (הושלמה באיחור לאחר מועד התפוגה).',
      scope: 'daily',
      priority: 'high',
      category: 'finance',
      targetDate: new Date(now.getTime() - 4 * 86400000).toISOString().split('T')[0],
      renewOnNextPeriod: false,
      completed: true,
      completedAt: new Date(now.getTime() - 1 * 86400000).toISOString(),
      completedLate: true,
      daysLate: 3,
      completionDurationMs: 48 * 3600 * 1000,
      currentPeriodKey: currentDailyKey,
      streak: 1,
      bestStreak: 2,
      totalCompletions: 3,
      history: [
        {
          periodKey: prevDailyKey,
          completedAt: new Date(now.getTime() - 1 * 86400000).toISOString(),
          periodLabel: 'הושלמה באיחור',
          onTime: false,
        }
      ],
      subtasks: [],
      createdAt: new Date(now.getTime() - 10 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'task-d-overdue',
      title: 'עדכון מסמך אפיון תוכנה לרבעון הבא',
      description: 'תיעוד ארכיטקטורה והגדרת ממשקים טכנולוגיים (חלף מועד היעד! ניתן לסמן כהושלמה כעת).',
      scope: 'daily',
      priority: 'high',
      category: 'work',
      targetDate: new Date(now.getTime() - 2 * 86400000).toISOString().split('T')[0],
      renewOnNextPeriod: false,
      completed: false,
      currentPeriodKey: currentDailyKey,
      streak: 0,
      bestStreak: 2,
      totalCompletions: 2,
      history: [],
      subtasks: [
        { id: 'sub-ov-1', title: 'כתיבת תרשימי זרימה', completed: true },
        { id: 'sub-ov-2', title: 'אישור מול מנהל המוצר', completed: false },
      ],
      createdAt: new Date(now.getTime() - 7 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'task-future-1',
      title: 'הערכת ביצועי צוות ומשוב חצי-שנתי',
      description: 'שיחות אישיות, סיכום יעדים והגדרת תוכנית צמיחה מקצועית.',
      scope: 'daily',
      priority: 'high',
      category: 'work',
      targetDate: new Date(now.getTime() + 12 * 86400000).toISOString().split('T')[0],
      renewOnNextPeriod: false,
      completed: false,
      currentPeriodKey: currentDailyKey,
      streak: 0,
      bestStreak: 0,
      totalCompletions: 0,
      history: [],
      subtasks: [],
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: 'task-future-2',
      title: 'סגירת תקציב שנתי והשקעות הון לתוכנית עבודה',
      description: 'הכנת ספר תקציב ויעדי השקעה לקראת השנה הבאה.',
      scope: 'monthly',
      priority: 'high',
      category: 'finance',
      targetDate: new Date(now.getTime() + 25 * 86400000).toISOString().split('T')[0],
      renewOnNextPeriod: true,
      completed: false,
      currentPeriodKey: currentMonthlyKey,
      streak: 0,
      bestStreak: 1,
      totalCompletions: 1,
      history: [],
      subtasks: [],
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    },

    // 3. WEEKLY TASKS
    {
      id: 'task-w1',
      title: 'דוח ביצועים שבועי ותכנון השבוע הבא',
      description: 'ניתוח תפוקה, סגירת משימות פתוחות והכנת יעדים לשבוע הקרוב.',
      scope: 'weekly',
      priority: 'high',
      category: 'work',
      renewOnNextPeriod: true,
      completed: true,
      completedAt: new Date(now.getTime() - 2 * 86400000).toISOString(),
      currentPeriodKey: currentWeeklyKey,
      streak: 3,
      bestStreak: 8,
      totalCompletions: 16,
      history: [
        {
          periodKey: prevWeeklyKey,
          completedAt: new Date(now.getTime() - 9 * 86400000).toISOString(),
          periodLabel: getPeriodLabel('weekly', prevWeeklyKey),
          onTime: true,
        },
        {
          periodKey: currentWeeklyKey,
          completedAt: new Date(now.getTime() - 2 * 86400000).toISOString(),
          periodLabel: getPeriodLabel('weekly', currentWeeklyKey),
          onTime: true,
        },
      ],
      subtasks: [
        { id: 'sub-wk-1', title: 'הפקת נתוני השלמה', completed: true },
        { id: 'sub-wk-2', title: 'הגדרת לו״ז ישיבות ומשימות ראשיות', completed: true },
      ],
      createdAt: new Date(now.getTime() - 40 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'task-w2',
      title: '3 אימוני התנגדות בחדר כושר',
      description: 'אימוני A/B/C להעלאת מסת שריר וכוח.',
      scope: 'weekly',
      priority: 'medium',
      category: 'health',
      renewOnNextPeriod: true,
      completed: false,
      currentPeriodKey: currentWeeklyKey,
      streak: 2,
      bestStreak: 6,
      totalCompletions: 11,
      history: [
        {
          periodKey: prevWeeklyKey,
          completedAt: new Date(now.getTime() - 8 * 86400000).toISOString(),
          periodLabel: getPeriodLabel('weekly', prevWeeklyKey),
          onTime: true,
        },
      ],
      subtasks: [
        { id: 'sub-gym-1', title: 'אימון חזה וגב', completed: true },
        { id: 'sub-gym-2', title: 'אימון רגליים וכתפיים', completed: true },
        { id: 'sub-gym-3', title: 'אימון ידיים וליבה', completed: false },
      ],
      createdAt: new Date(now.getTime() - 25 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    },

    // 4. MONTHLY TASKS
    {
      id: 'task-m1',
      title: 'סגירת תקציב חודשי, חשבוניות והוצאות',
      description: 'בדיקת כרטיסי אשראי, סיווג הוצאות עסקיות ופרטיות, העברה לחסכונות.',
      scope: 'monthly',
      priority: 'high',
      category: 'finance',
      renewOnNextPeriod: true,
      completed: true,
      completedAt: new Date(now.getTime() - 3 * 86400000).toISOString(),
      currentPeriodKey: currentMonthlyKey,
      streak: 4,
      bestStreak: 7,
      totalCompletions: 9,
      history: [
        {
          periodKey: prevMonthlyKey,
          completedAt: new Date(now.getTime() - 32 * 86400000).toISOString(),
          periodLabel: getPeriodLabel('monthly', prevMonthlyKey),
          onTime: true,
        },
        {
          periodKey: currentMonthlyKey,
          completedAt: new Date(now.getTime() - 3 * 86400000).toISOString(),
          periodLabel: getPeriodLabel('monthly', currentMonthlyKey),
          onTime: true,
        },
      ],
      subtasks: [
        { id: 'sub-m1-1', title: 'ייצוא דוחות בנק וכרטיסי אשראי', completed: true },
        { id: 'sub-m1-2', title: 'התאמת חשבוניות לרואה חשבון', completed: true },
        { id: 'sub-m1-3', title: 'העברת הוראת קבע לקרן חירום', completed: true },
      ],
      createdAt: new Date(now.getTime() - 120 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'task-m2',
      title: 'גיבוי נתונים מלא וסדר דיגיטלי במחשב',
      description: 'ניקוי תיקיית הורדות, גיבוי כונן מקומי לענן ורענון סיסמאות.',
      scope: 'monthly',
      priority: 'low',
      category: 'personal',
      renewOnNextPeriod: true,
      completed: false,
      currentPeriodKey: currentMonthlyKey,
      streak: 1,
      bestStreak: 4,
      totalCompletions: 6,
      history: [
        {
          periodKey: prevMonthlyKey,
          completedAt: new Date(now.getTime() - 35 * 86400000).toISOString(),
          periodLabel: getPeriodLabel('monthly', prevMonthlyKey),
          onTime: true,
        },
      ],
      subtasks: [],
      createdAt: new Date(now.getTime() - 90 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'task-m3',
      title: 'חיסכון לקופת חירום והשקעות',
      description: 'הפקדת כל שקל שנכנס לקופה עד ליעד של 10,000 ₪ (הוסף כל שקל שנכנס).',
      scope: 'monthly',
      priority: 'high',
      category: 'finance',
      renewOnNextPeriod: true,
      isProgressTask: true,
      targetValue: 10000,
      currentValue: 3450,
      unit: '₪',
      progressStep: 100,
      completed: false,
      currentPeriodKey: currentMonthlyKey,
      streak: 3,
      bestStreak: 5,
      totalCompletions: 3,
      history: [],
      subtasks: [
        { id: 'sub-f1', title: 'הפקדה ראשונה של 1,500 ₪', completed: true },
        { id: 'sub-f2', title: 'הפקדת הכנסה נוספת', completed: true },
      ],
      createdAt: new Date(now.getTime() - 60 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    },

    // 5. YEARLY TASKS
    {
      id: 'task-y1',
      title: 'השלמת קורס הסמכה מקצועי מתקדם',
      description: 'השגת תעודת מומחה טכנולוגי כולל הגשת פרויקט גמר.',
      scope: 'yearly',
      priority: 'high',
      category: 'study',
      renewOnNextPeriod: true,
      completed: false,
      currentPeriodKey: currentYearlyKey,
      streak: 1,
      bestStreak: 2,
      totalCompletions: 2,
      history: [
        {
          periodKey: prevYearlyKey,
          completedAt: new Date(now.getTime() - 300 * 86400000).toISOString(),
          periodLabel: getPeriodLabel('yearly', prevYearlyKey),
          onTime: true,
        },
      ],
      subtasks: [
        { id: 'sub-y1-1', title: 'מעבר מודול 1 ו-2', completed: true },
        { id: 'sub-y1-2', title: 'מבחן אמצע מסלול', completed: true },
        { id: 'sub-y1-3', title: 'פרויקט סיום והגשה', completed: false },
      ],
      createdAt: new Date(now.getTime() - 200 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'task-y2',
      title: 'בדיקות סקר בריאותיות שנתיות',
      description: 'בדיקות דם מקיפות, רופא עיניים, רופא שיניים וארגומטריה.',
      scope: 'yearly',
      priority: 'medium',
      category: 'health',
      renewOnNextPeriod: true,
      completed: true,
      completedAt: new Date(now.getTime() - 60 * 86400000).toISOString(),
      currentPeriodKey: currentYearlyKey,
      streak: 3,
      bestStreak: 3,
      totalCompletions: 3,
      history: [
        {
          periodKey: prevYearlyKey,
          completedAt: new Date(now.getTime() - 365 * 86400000).toISOString(),
          periodLabel: getPeriodLabel('yearly', prevYearlyKey),
          onTime: true,
        },
        {
          periodKey: currentYearlyKey,
          completedAt: new Date(now.getTime() - 60 * 86400000).toISOString(),
          periodLabel: getPeriodLabel('yearly', currentYearlyKey),
          onTime: true,
        },
      ],
      subtasks: [],
      createdAt: new Date(now.getTime() - 400 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    },

    // 6. CUSTOM TIMEFRAME TASKS (זמן מותאם אישית)
    {
      id: 'task-c1',
      title: 'בדיקת לחץ אוויר ומים ברכב (כל 14 ימים)',
      description: 'תחזוקה מונעת לרכב לשמירה על בטיחות וחיסכון בדלק.',
      scope: 'custom',
      priority: 'medium',
      category: 'home',
      customDaysInterval: 14,
      renewOnNextPeriod: true,
      completed: true,
      completedAt: new Date(now.getTime() - 1 * 86400000).toISOString(),
      currentPeriodKey: currentCustomKey,
      streak: 5,
      bestStreak: 7,
      totalCompletions: 12,
      history: [
        {
          periodKey: prevCustomKey,
          completedAt: new Date(now.getTime() - 15 * 86400000).toISOString(),
          periodLabel: 'מחזור קודם (14 ימים)',
          onTime: true,
        },
        {
          periodKey: currentCustomKey,
          completedAt: new Date(now.getTime() - 1 * 86400000).toISOString(),
          periodLabel: 'מחזור נוכחי (14 ימים)',
          onTime: true,
        },
      ],
      subtasks: [
        { id: 'sub-c1-1', title: 'בדיקת צמיגים וניפוח', completed: true },
        { id: 'sub-c1-2', title: 'מילוי נוזל שמשות ושמן', completed: true },
      ],
      createdAt: new Date(now.getTime() - 90 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'task-c2',
      title: 'השקיית צמחים יסודית ודישון (כל 3 ימים)',
      description: 'טיפול בעציצי הבית והמרפסת.',
      scope: 'custom',
      priority: 'low',
      category: 'home',
      customDaysInterval: 3,
      renewOnNextPeriod: true,
      completed: false,
      currentPeriodKey: currentCustomKey,
      streak: 8,
      bestStreak: 12,
      totalCompletions: 24,
      history: [
        {
          periodKey: prevCustomKey,
          completedAt: new Date(now.getTime() - 4 * 86400000).toISOString(),
          periodLabel: 'מחזור קודם (3 ימים)',
          onTime: true,
        },
      ],
      subtasks: [],
      createdAt: new Date(now.getTime() - 30 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    },

    // 7. GENERAL TASKS (כלליות)
    {
      id: 'task-g1',
      title: 'חידוש דרכון ורישיון בינלאומי',
      description: 'קביעת תור בלשכת האוכלוסין והגשת טופס מקוון.',
      scope: 'general',
      priority: 'high',
      category: 'personal',
      renewOnNextPeriod: false,
      completed: false,
      currentPeriodKey: 'ongoing',
      streak: 0,
      bestStreak: 0,
      totalCompletions: 0,
      history: [],
      subtasks: [
        { id: 'sub-g1-1', title: 'צילום תמונת פספורט', completed: true },
        { id: 'sub-g1-2', title: 'תשלום אגרה באתר הממשלתי', completed: false },
        { id: 'sub-g1-3', title: 'הגעה לתור עם המסמכים', completed: false },
      ],
      createdAt: new Date(now.getTime() - 14 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'task-g2',
      title: 'מיון וסידור מחסן הבית ותרומת ציוד',
      description: 'העברת ארגזים ישנים, בגדים לתרומה וסידור מדפים.',
      scope: 'general',
      priority: 'low',
      category: 'home',
      renewOnNextPeriod: false,
      completed: true,
      completedAt: new Date(now.getTime() - 4 * 86400000).toISOString(),
      currentPeriodKey: 'ongoing',
      streak: 1,
      bestStreak: 1,
      totalCompletions: 1,
      history: [],
      subtasks: [],
      createdAt: new Date(now.getTime() - 45 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  return sampleTasks;
}

// Check and renew tasks when time period advances
export function checkAndRenewTasks(tasks: Task[]): Task[] {
  const now = new Date();
  let modified = false;

  const updatedTasks = tasks.map((task) => {
    // If not set to renew, or if general, no periodic rollover
    if (!task.renewOnNextPeriod || task.scope === 'general') {
      return task;
    }

    const currentKey = getPeriodKey(task.scope, now, task.customDaysInterval);

    // If task is still in the same period, keep as is
    if (task.currentPeriodKey === currentKey) {
      return task;
    }

    // The period has shifted!
    modified = true;

    // Check if the previous period was completed:
    // If it was completed, streak is maintained/incremented. If it expired without completion, streak resets to 0.
    const wasCompletedInPreviousPeriod = task.completed;
    const newStreak = wasCompletedInPreviousPeriod ? task.streak : 0;

    return {
      ...task,
      currentPeriodKey: currentKey,
      completed: false, // Ready for new cycle!
      completedAt: undefined,
      streak: newStreak,
      // reset subtasks completion for the new period
      subtasks: task.subtasks.map((st) => ({ ...st, completed: false })),
      updatedAt: new Date().toISOString(),
    };
  });

  return updatedTasks;
}

export function loadTasksFromStorage(): Task[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = getInitialTasks();
      saveTasksToStorage(initial);
      return initial;
    }
    const parsed: Task[] = JSON.parse(raw);
    const renewed = checkAndRenewTasks(parsed);
    saveTasksToStorage(renewed);
    return renewed;
  } catch (err) {
    console.error('Error loading tasks from storage:', err);
    return getInitialTasks();
  }
}

export function saveTasksToStorage(tasks: Task[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    // Also save directly to physical computer disk (Tauri AppData file or linked file handle)
    saveTasksToComputerDisk(tasks).catch((err) => {
      console.warn('Background computer disk save notice:', err);
    });
  } catch (err) {
    console.error('Error saving tasks to storage:', err);
  }
}

export function resetTasksToDefaults(): Task[] {
  const defaults = getInitialTasks();
  saveTasksToStorage(defaults);
  return defaults;
}
