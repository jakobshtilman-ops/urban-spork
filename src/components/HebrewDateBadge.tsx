import React, { useState } from 'react';
import { getHebrewDate } from '../utils/dateUtils';
import { Calendar, Eye, HelpCircle } from 'lucide-react';

interface HebrewDateBadgeProps {
  date: Date | string;
  showDayName?: boolean;
  showYear?: boolean;
  className?: string;
  allowToggleGregorian?: boolean;
  forceShowGregorian?: boolean;
}

export const HebrewDateBadge: React.FC<HebrewDateBadgeProps> = ({
  date,
  showDayName = false,
  showYear = true,
  className = '',
  allowToggleGregorian = true,
  forceShowGregorian = false,
}) => {
  const [showGregorian, setShowGregorian] = useState(false);
  const heb = getHebrewDate(date);

  const displayHebrewText = showDayName
    ? heb.fullHebrew
    : showYear
    ? heb.shortHebrew
    : heb.shortHebrewDayMonth;

  const isGregorianVisible = forceShowGregorian || showGregorian;

  return (
    <span
      className={`inline-flex items-center gap-1.5 group/date select-none ${className}`}
      title={`תאריך עברי מלא (באותיות): ${heb.fullHebrew}\nתאריך לועזי: ${heb.gregorianDateStr}\n(לחץ על האייקון או התאריך לבדיקת התאריך הלועזי)`}
    >
      <span
        onClick={(e) => {
          if (allowToggleGregorian) {
            e.stopPropagation();
            setShowGregorian(!showGregorian);
          }
        }}
        className="inline-flex items-center gap-1 cursor-pointer hover:text-indigo-900 transition-colors"
      >
        <Calendar className="h-3 w-3 text-indigo-500 shrink-0 opacity-80 group-hover/date:opacity-100" />
        <span className="font-semibold text-neutral-900 group-hover/date:text-indigo-900">
          {displayHebrewText}
        </span>
      </span>

      {/* Button to inspect Gregorian date */}
      {allowToggleGregorian && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setShowGregorian(!showGregorian);
          }}
          title={isGregorianVisible ? 'הסתר תאריך לועזי' : 'בדוק מהו התאריך הלועזי המקביל'}
          className={`text-[10px] px-1 py-0.2 rounded transition-colors flex items-center gap-0.5 ${
            isGregorianVisible
              ? 'bg-neutral-200 text-neutral-800 font-mono font-medium'
              : 'text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100'
          }`}
        >
          {isGregorianVisible ? (
            <span className="tabular-nums font-mono">({heb.gregorianDateStr})</span>
          ) : (
            <span className="text-[10px] opacity-70 hover:opacity-100 flex items-center gap-0.5">
              <Eye className="h-2.5 w-2.5" />
              <span>לועזי</span>
            </span>
          )}
        </button>
      )}
    </span>
  );
};
