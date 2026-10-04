import React, { useState } from 'react';
import { 
  X, 
  Download, 
  Terminal, 
  Github, 
  CheckCircle2, 
  Layers, 
  FileCode, 
  Laptop, 
  Monitor, 
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

interface DesktopExeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDownloadHtml: () => void;
}

export const DesktopExeModal: React.FC<DesktopExeModalProps> = ({
  isOpen,
  onClose,
  onDownloadHtml,
}) => {
  const [copiedCode, setCopiedCode] = useState(false);

  if (!isOpen) return null;

  const gitHubWorkflowCode = `name: Build Standalone Windows EXE
on:
  push:
    branches: [ main, master ]
  workflow_dispatch:

jobs:
  build-windows-exe:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm install
      - run: npm run build
      - run: npx electron-builder --win --x64
      - uses: actions/upload-artifact@v4
        with:
          name: Tactic-Windows-App-EXE
          path: dist_electron/*.exe`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(gitHubWorkflowCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 3000);
  };

  const handleDownloadBatchLauncher = () => {
    const batContent = `@echo off
title טקטיק - מנהל משימות וביצועים
echo ========================================================
echo  טקטיק - אפליקציית משימות עצמאית ואופליין
echo ========================================================
echo  מפעיל את האפליקציה בחלון שולחן עבודה מקומי...
start msedge --app="%~dp0index.html" 2>nul || start chrome --app="%~dp0index.html" 2>nul || start "" "%~dp0index.html"
exit`;

    const blob = new Blob([batContent], { type: 'application/x-bat' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'הפעל-טקטיק-אופליין.bat';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-neutral-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-neutral-50/50">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
              <Laptop className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-neutral-900">
                יצירת אפליקציית מחשב וקובץ EXE אופליין
              </h3>
              <p className="text-xs text-neutral-500">
                איך GitHub יוצר מזה קובץ EXE ואיך להפעיל ישירות על המחשב
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-neutral-700">
          {/* Section 1: How GitHub creates an EXE */}
          <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-4 space-y-3">
            <div className="flex items-center gap-2 text-indigo-950 font-bold text-sm">
              <Github className="h-4 w-4 text-indigo-600" />
              <span>1. איך GitHub יודע ליצור מזה אפליקציה וקובץ EXE?</span>
            </div>

            <p className="text-xs text-neutral-600 leading-relaxed">
              הוגדרו בפרויקט שני מנגנוני בנייה אוטומטיים באמצעות <strong>GitHub Actions</strong>:
            </p>

            <ul className="text-xs text-neutral-700 space-y-1.5 pr-4 list-disc marker:text-indigo-600">
              <li>
                <strong>גרסת Electron (מומלצת):</strong> מופעלת ע״י <code className="bg-white px-1 py-0.5 rounded border border-indigo-200 text-indigo-900 font-mono text-[11px]">.github/workflows/build-exe.yml</code> ומפיקה קובץ התקנה סטנדרטי <span className="font-mono font-bold text-indigo-900">Tactic-Setup.exe</span>.
              </li>
              <li>
                <strong>גרסת Tauri (קלת משקל):</strong> מופעלת ע״י <code className="bg-white px-1 py-0.5 rounded border border-indigo-200 text-indigo-900 font-mono text-[11px]">.github/workflows/build.yml</code> ומפיקה קובץ <span className="font-mono font-bold text-indigo-900">msi / exe</span> קל-משקל בטכנולוגיית Rust.
              </li>
              <li>
                <strong>הורדה ישירה מ-GitHub:</strong> לאחר כל push, הקבצים המוכנים ממתינים להורדה בלשונית <strong>Actions &gt; Artifacts</strong> ב-GitHub שלך!
              </li>
            </ul>

            <div className="pt-2">
              <div className="flex items-center justify-between text-[11px] text-neutral-500 mb-1">
                <span>קובץ ה-Workflow שהוגדר עבורך ב-GitHub:</span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  {copiedCode ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                  <span>{copiedCode ? 'הועתק!' : 'העתק קוד'}</span>
                </button>
              </div>
              <pre className="bg-neutral-900 text-neutral-200 p-3 rounded-lg text-[10px] font-mono overflow-x-auto text-left dir-ltr leading-relaxed max-h-32">
                {gitHubWorkflowCode}
              </pre>
            </div>
          </div>

          {/* Section 2: Direct Offline Options NOW */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
              <Monitor className="h-4 w-4 text-emerald-600" />
              <span>2. דרכים להפעלת האפליקציה כתוכנת מחשב אופליין כבר עכשיו:</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option A: PWA Desktop App */}
              <div className="p-3.5 rounded-xl border border-neutral-200 bg-neutral-50/60 space-y-2 flex flex-col justify-between">
                <div>
                  <div className="font-bold text-neutral-900 text-xs flex items-center gap-1.5">
                    <Laptop className="h-3.5 w-3.5 text-indigo-600" />
                    <span>התקנה ישירה לשולחן העבודה (PWA)</span>
                  </div>
                  <p className="text-[11px] text-neutral-500 mt-1">
                    מתקין את האפליקציה כתוכנה מלאה במחשב בלחיצה אחת, כולל אייקון בשולחן העבודה ובתפריט Start, עובד 100% ללא אינטרנט.
                  </p>
                </div>
                <div className="pt-2">
                  <PWAInstallButton />
                </div>
              </div>

              {/* Option B: Offline Windows Launcher */}
              <div className="p-3.5 rounded-xl border border-neutral-200 bg-neutral-50/60 space-y-2 flex flex-col justify-between">
                <div>
                  <div className="font-bold text-neutral-900 text-xs flex items-center gap-1.5">
                    <Terminal className="h-3.5 w-3.5 text-emerald-600" />
                    <span>קובץ הפעלה מקומי ל-Windows (.BAT)</span>
                  </div>
                  <p className="text-[11px] text-neutral-500 mt-1">
                    קובץ הרצה מהיר שפותח את האפליקציה בחלון ייעודי עצמאי במחשב שלך בלחיצה כפולה.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadBatchLauncher}
                  className="flex items-center justify-center gap-1.5 text-xs text-neutral-800 bg-white hover:bg-neutral-100 border border-neutral-200 px-3 py-1.5 rounded-lg transition-colors font-medium shadow-2xs"
                >
                  <Download className="h-3.5 w-3.5 text-emerald-600" />
                  <span>הורד קובץ הרצה (BAT)</span>
                </button>
              </div>
            </div>

            {/* Option C: Single file HTML */}
            <div className="p-3.5 rounded-xl border border-neutral-200 bg-neutral-50/60 flex items-center justify-between gap-3">
              <div>
                <div className="font-bold text-neutral-900 text-xs flex items-center gap-1.5">
                  <FileCode className="h-3.5 w-3.5 text-indigo-600" />
                  <span>הורדת קובץ HTML מלא ועצמאי</span>
                </div>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                  קובץ בודד המכיל את כל קוד האפליקציה, הגרפים והלוחות לשימוש מקומי בכל מחשב.
                </p>
              </div>
              <button
                type="button"
                onClick={onDownloadHtml}
                className="flex items-center gap-1.5 text-xs text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-lg transition-colors font-semibold shrink-0 shadow-2xs"
              >
                <Download className="h-3.5 w-3.5" />
                <span>הורד HTML</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-100 bg-neutral-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 rounded-lg text-xs font-semibold transition-colors"
          >
            סגור
          </button>
        </div>
      </div>
    </div>
  );
};
