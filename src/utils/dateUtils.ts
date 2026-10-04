import { TaskScope } from '../types/task';

// Full Gematria converter for any number from 1 to 999
export function numberToHebrewGematria(num: number, withGershayim = true): string {
  if (num <= 0) return '';
  const hundreds = ['', 'ק', 'ר', 'ש', 'ת', 'תק', 'תר', 'תש', 'תת', 'תתק'];
  const tens = ['', 'י', 'כ', 'ל', 'מ', 'נ', 'ס', 'ע', 'פ', 'צ'];
  const units = ['', 'א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט'];

  let n = num % 1000;
  if (n === 0) return '';

  let res = '';
  // hundreds
  const h = Math.floor(n / 100);
  if (h > 0) res += hundreds[h] || '';
  n %= 100;

  // special cases for 15 and 16
  if (n === 15) {
    res += 'טו';
  } else if (n === 16) {
    res += 'טז';
  } else {
    const t = Math.floor(n / 10);
    if (t > 0) res += tens[t] || '';
    const u = n % 10;
    if (u > 0) res += units[u] || '';
  }

  if (!withGershayim) return res;

  if (res.length === 1) {
    return res + '׳';
  } else if (res.length > 1) {
    return res.slice(0, -1) + '״' + res.slice(-1);
  }
  return res;
}

// Convert day number (1-30) to Hebrew Letters ONLY with Gershayim / Geresh
export function toHebrewLetterDay(n: number): string {
  return numberToHebrewGematria(n, true);
}

// Convert Hebrew year (e.g. 5786, 5787, 5788) to Hebrew letters ONLY (תשפ״ו, תשפ״ז, תשפ״ח)
export function toHebrewLetterYear(yearNum: number, withThousandsPrefix = false): string {
  if (!yearNum) return 'תשפ״ז';
  const rem = yearNum % 1000;
  const baseLetterYear = numberToHebrewGematria(rem, true);
  if (withThousandsPrefix) {
    const thousands = Math.floor(yearNum / 1000);
    const thousandsLetter = numberToHebrewGematria(thousands, false);
    return `${thousandsLetter}׳${baseLetterYear}`;
  }
  return baseLetterYear;
}

export interface HebrewCalendarDate {
  hebrewDayLetter: string;   // e.g. "כ״ב", "א׳", "ט״ו"
  hebrewMonth: string;       // e.g. "תשרי", "ניסן"
  hebrewYearLetter: string;  // e.g. "תשפ״ז"
  fullHebrew: string;        // e.g. "יום שבת, כ״ב בתשרי תשפ״ז" (letters only!)
  shortHebrew: string;       // e.g. "כ״ב בתשרי תשפ״ז"
  shortHebrewDayMonth: string; // e.g. "כ״ב בתשרי"
  gregorianDateStr: string;  // e.g. "03/10/2026"
  rawDate: Date;
}

// Hebrew months standard list
export const HEBREW_MONTHS_LIST = [
  'תשרי',
  'מרחשוון',
  'כסלו',
  'טבת',
  'שבט',
  'אדר',
  'אדר א׳',
  'אדר ב׳',
  'ניסן',
  'אייר',
  'סיון',
  'תמוז',
  'אב',
  'אלול',
];

// Hebrew days list (1-30 in Hebrew letters)
export const HEBREW_DAYS_LETTERS_LIST = Array.from({ length: 30 }, (_, i) => ({
  num: i + 1,
  letter: toHebrewLetterDay(i + 1),
}));

// Extract full Hebrew letter date using Intl and Gematria conversion
// GUARANTEE: The Hebrew date contains LETTERS ONLY, NO DIGITS!
export function getHebrewDate(dateInput: Date | string = new Date()): HebrewCalendarDate {
  let date: Date;
  if (typeof dateInput === 'string') {
    // If it's a date string like "YYYY-MM-DD"
    if (dateInput.includes('T')) {
      date = new Date(dateInput);
    } else {
      const parts = dateInput.split('-');
      if (parts.length === 3) {
        date = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      } else {
        date = new Date(dateInput);
      }
    }
  } else {
    date = dateInput;
  }

  const validDate = isNaN(date.getTime()) ? new Date() : date;

  const daysHebrew = ['יום ראשון', 'יום שני', 'יום שלישי', 'יום רביעי', 'יום חמישי', 'יום שישי', 'יום שבת'];
  const dayName = daysHebrew[validDate.getDay()];

  let rawDayNum = validDate.getDate();
  let rawMonthName = 'תשרי';
  let rawYearNum = 5787;

  try {
    const formatter = new Intl.DateTimeFormat('he-u-ca-hebrew', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    const parts = formatter.formatToParts(validDate);

    parts.forEach((p) => {
      if (p.type === 'day') {
        const parsed = parseInt(p.value, 10);
        if (!isNaN(parsed)) rawDayNum = parsed;
      }
      if (p.type === 'month') {
        rawMonthName = p.value.replace(/^ב/, '').trim(); // Remove leading 'ב' if present
      }
      if (p.type === 'year') {
        const parsed = parseInt(p.value, 10);
        if (!isNaN(parsed)) rawYearNum = parsed;
      }
    });
  } catch (err) {
    console.warn('Hebrew calendar formatting fallback:', err);
  }

  const hebrewDayLetter = toHebrewLetterDay(rawDayNum);
  const hebrewYearLetter = toHebrewLetterYear(rawYearNum);

  const shortHebrewDayMonth = `${hebrewDayLetter} ב${rawMonthName}`;
  const shortHebrew = `${hebrewDayLetter} ב${rawMonthName} ${hebrewYearLetter}`;
  const fullHebrew = `${dayName}, ${shortHebrew}`;

  const dayStr = String(validDate.getDate()).padStart(2, '0');
  const monthStr = String(validDate.getMonth() + 1).padStart(2, '0');
  const yearStr = validDate.getFullYear();
  const gregorianDateStr = `${dayStr}/${monthStr}/${yearStr}`;

  return {
    hebrewDayLetter,
    hebrewMonth: rawMonthName,
    hebrewYearLetter,
    fullHebrew,
    shortHebrew,
    shortHebrewDayMonth,
    gregorianDateStr,
    rawDate: validDate,
  };
}

// Global Hebrew Date String Formatter (ALL in Hebrew Letters!)
export function formatHebrewDate(dateInput: Date | string = new Date()): string {
  const heb = getHebrewDate(dateInput);
  return heb.fullHebrew;
}

// Short Hebrew Letters Date Formatter with Year
export function formatShortHebrewDate(dateStr: string): string {
  if (!dateStr) return '';
  const heb = getHebrewDate(dateStr);
  return heb.shortHebrew;
}

// Short Hebrew Letters Date Formatter (Day + Month only)
export function formatShortHebrewDayMonth(dateStr: string): string {
  if (!dateStr) return '';
  const heb = getHebrewDate(dateStr);
  return heb.shortHebrewDayMonth;
}

// Gregorian Date formatted as DD/MM/YYYY for checking
export function formatGregorianDate(dateInput: Date | string = new Date()): string {
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return '';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

// Get ISO week number (1-53)
export function getISOWeek(date: Date = new Date()): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

// Returns the unique period key for a given scope and date
export function getPeriodKey(scope: TaskScope, date: Date = new Date(), customInterval?: number): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');

  switch (scope) {
    case 'hourly':
      return `${y}-${m}-${d}-${h}`;
    case 'daily':
      return `${y}-${m}-${d}`;
    case 'weekly':
      return `${y}-W${getISOWeek(date)}`;
    case 'monthly':
      return `${y}-${m}`;
    case 'yearly':
      return `${y}`;
    case 'custom': {
      const intervalDays = customInterval || 3;
      const epochDay = Math.floor(date.getTime() / (1000 * 60 * 60 * 24));
      const cycleIndex = Math.floor(epochDay / intervalDays);
      return `custom-${intervalDays}d-${cycleIndex}`;
    }
    case 'general':
    default:
      return 'ongoing';
  }
}

// Human readable period label in HEBREW LETTERS
export function getPeriodLabel(scope: TaskScope, periodKey: string): string {
  if (scope === 'general' || periodKey === 'ongoing') return 'כללי / מתמשך';
  if (scope === 'hourly') {
    const parts = periodKey.split('-');
    if (parts.length >= 4) {
      const date = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      const heb = getHebrewDate(date);
      return `שעה ${parts[3]}:00 (${heb.shortHebrew})`;
    }
    return periodKey;
  }
  if (scope === 'daily') {
    const parts = periodKey.split('-');
    if (parts.length >= 3) {
      const date = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      const heb = getHebrewDate(date);
      return `יום ${heb.shortHebrew}`;
    }
    return periodKey;
  }
  if (scope === 'weekly') {
    const parts = periodKey.split('-W');
    const weekNum = parseInt(parts[1], 10);
    const weekLetter = toHebrewLetterDay(weekNum);
    return `שבוע ${weekLetter} (${toHebrewLetterYear(parseInt(parts[0], 10) + 3760)})`;
  }
  if (scope === 'monthly') {
    const parts = periodKey.split('-');
    const date = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, 15);
    const heb = getHebrewDate(date);
    return `חודש ${heb.hebrewMonth} (${heb.hebrewYearLetter})`;
  }
  if (scope === 'yearly') {
    const yearGreg = parseInt(periodKey, 10);
    const hebYear = toHebrewLetterYear(yearGreg + 3760);
    return `שנת ${hebYear}`;
  }
  if (scope === 'custom') {
    return 'מחזור מותאם אישית';
  }
  return periodKey;
}

// Helper to get previous period key for comparative metrics
export function getPreviousPeriodKey(scope: TaskScope, date: Date = new Date(), customInterval?: number): string {
  const prevDate = new Date(date);
  switch (scope) {
    case 'hourly':
      prevDate.setHours(prevDate.getHours() - 1);
      break;
    case 'daily':
      prevDate.setDate(prevDate.getDate() - 1);
      break;
    case 'weekly':
      prevDate.setDate(prevDate.getDate() - 7);
      break;
    case 'monthly':
      prevDate.setMonth(prevDate.getMonth() - 1);
      break;
    case 'yearly':
      prevDate.setFullYear(prevDate.getFullYear() - 1);
      break;
    case 'custom': {
      const intervalDays = customInterval || 3;
      prevDate.setDate(prevDate.getDate() - intervalDays);
      break;
    }
    default:
      return 'ongoing';
  }
  return getPeriodKey(scope, prevDate, customInterval);
}

// Generate calendar days for a given Gregorian month (0-indexed month)
export interface CalendarGridDay {
  date: Date;
  dateStr: string; // YYYY-MM-DD
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  hebrewDayLetter: string; // e.g. "כ״ג"
  hebrewMonth: string;     // e.g. "תשרי"
  shortHebrew: string;     // e.g. "כ״ג בתשרי"
  gregorianDateStr: string;// e.g. "03/10/2026"
}

export function getMonthCalendarDays(year: number, month: number): CalendarGridDay[] {
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  // Day of week for first day (0 = Sunday in Israel)
  const startDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  const days: CalendarGridDay[] = [];

  // Previous month trailing days
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const dayNum = prevMonthLastDay - i;
    const d = new Date(year, month - 1, dayNum);
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dayFormatted = String(d.getDate()).padStart(2, '0');
    const dateStr = `${d.getFullYear()}-${m}-${dayFormatted}`;
    const heb = getHebrewDate(d);
    days.push({
      date: d,
      dateStr,
      dayNumber: dayNum,
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
      hebrewDayLetter: heb.hebrewDayLetter,
      hebrewMonth: heb.hebrewMonth,
      shortHebrew: heb.shortHebrew,
      gregorianDateStr: heb.gregorianDateStr,
    });
  }

  // Current month days
  for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
    const d = new Date(year, month, dayNum);
    const m = String(month + 1).padStart(2, '0');
    const dayFormatted = String(dayNum).padStart(2, '0');
    const dateStr = `${year}-${m}-${dayFormatted}`;
    const heb = getHebrewDate(d);
    days.push({
      date: d,
      dateStr,
      dayNumber: dayNum,
      isCurrentMonth: true,
      isToday: dateStr === todayStr,
      hebrewDayLetter: heb.hebrewDayLetter,
      hebrewMonth: heb.hebrewMonth,
      shortHebrew: heb.shortHebrew,
      gregorianDateStr: heb.gregorianDateStr,
    });
  }

  // Next month leading days to complete full weeks
  const remainingCells = (7 - (days.length % 7)) % 7;
  for (let i = 1; i <= remainingCells; i++) {
    const d = new Date(year, month + 1, i);
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dayFormatted = String(d.getDate()).padStart(2, '0');
    const dateStr = `${d.getFullYear()}-${m}-${dayFormatted}`;
    const heb = getHebrewDate(d);
    days.push({
      date: d,
      dateStr,
      dayNumber: i,
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
      hebrewDayLetter: heb.hebrewDayLetter,
      hebrewMonth: heb.hebrewMonth,
      shortHebrew: heb.shortHebrew,
      gregorianDateStr: heb.gregorianDateStr,
    });
  }

  return days;
}
