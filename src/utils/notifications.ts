// Browser notification & Web Audio API chime system (100% offline)

// Play a pleasant, melodic notification chime using Web Audio API (no external file needed!)
export function playNotificationChime(): void {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // Harmonic frequencies: C6 (1046.5Hz) -> E6 (1318.5Hz) -> G6 (1567.98Hz)
    const notes = [
      { freq: 1046.5, time: 0.0, duration: 0.18 },
      { freq: 1318.5, time: 0.12, duration: 0.22 },
      { freq: 1567.98, time: 0.24, duration: 0.35 },
    ];

    notes.forEach(({ freq, time, duration }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + time);

      gain.gain.setValueAtTime(0, now + time);
      gain.gain.linearRampToValueAtTime(0.2, now + time + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + time + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + time);
      osc.stop(now + time + duration);
    });
  } catch (err) {
    console.warn('Web Audio chime could not play:', err);
  }
}

// Check current notification permission
export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
}

// Request permission for browser notifications
export async function requestNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      sendBrowserNotification('תזכורות דפדפן הופעלו בהצלחה!', {
        body: 'מעתה תקבל תזכורות בזמן עבור משימות שנקבע להן מועד.',
        tag: 'permission-granted',
      });
    }
    return permission;
  } catch (err) {
    console.error('Error requesting notification permission:', err);
    return Notification.permission;
  }
}

// Send browser notification with offline fallback
export function sendBrowserNotification(title: string, options?: NotificationOptions): Notification | null {
  // Always play sound chime if enabled
  playNotificationChime();

  if (typeof window === 'undefined' || !('Notification' in window)) {
    return null;
  }

  if (Notification.permission === 'granted') {
    try {
      const notification = new Notification(title, {
        icon: '/icon.svg',
        badge: '/pwa-192x192.png',
        dir: 'rtl',
        lang: 'he',
        ...options,
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      return notification;
    } catch (err) {
      console.warn('Direct notification error, trying service worker:', err);
      if ('serviceWorker' in navigator && navigator.serviceWorker.ready) {
        navigator.serviceWorker.ready.then((reg) => {
          reg.showNotification(title, {
            icon: '/icon.svg',
            badge: '/pwa-192x192.png',
            dir: 'rtl',
            lang: 'he',
            ...options,
          });
        });
      }
    }
  }

  return null;
}
