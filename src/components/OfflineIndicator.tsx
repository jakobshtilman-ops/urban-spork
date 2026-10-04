import React from 'react';
import { useOnlineStatus } from '../utils/useOnlineStatus';
import { WifiOff, ShieldCheck } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) {
    return null;
  }

  return (
    <div className="fixed top-16 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2 text-xs font-semibold text-white shadow-lg animate-in fade-in slide-in-from-top-2">
      <WifiOff className="h-4 w-4" />
      <span>מצב אופליין פעיל — כל הנתונים והתזכורות נשמרים ופועלים מקומית בדפדפן</span>
    </div>
  );
};
