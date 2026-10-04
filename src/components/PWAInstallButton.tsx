import React, { useState } from 'react';
import { usePWAInstall } from '../utils/usePWAInstall';
import { Download, Smartphone, X } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed standalone PWA, hide the button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 shadow-2xs transition-colors"
      >
        <Download className="h-3.5 w-3.5 text-indigo-600" />
        <span>התקן אפליקציה</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 shadow-2xs transition-colors"
        >
          <Smartphone className="h-3.5 w-3.5 text-indigo-600" />
          <span>התקנה ב-iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl border border-neutral-200">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                <h3 className="text-base font-bold text-neutral-900">התקנה ב-iPhone / iPad</h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="rounded-lg p-1 text-neutral-400 hover:text-neutral-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-neutral-600">
                1. לחץ על כפתור <strong>השיתוף (Share)</strong> בתחתית דפדפן Safari.<br />
                2. גלול מטה ובחר באפשרות <strong>הוסף למסך הבית (Add to Home Screen)</strong>.<br />
                3. האפליקציה תותקן ותפעל באופן מלא גם ללא חיבור לאינטרנט!
              </p>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-lg bg-indigo-600 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
              >
                הבנתי, תודה
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
