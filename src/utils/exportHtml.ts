import { Task } from '../types/task';

// Generates a fully self-contained, standalone single-file HTML application
// that runs completely offline with ZERO server dependencies.
export function generateSingleFileHtml(tasks: Task[]): string {
  const tasksJson = JSON.stringify(tasks, null, 2);

  return `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tactic - מנהל משימות וביצועים (גרסה עצמאית אופליין)</title>
  <meta name="theme-color" content="#4f46e5">
  <style>
    :root {
      --primary: #4f46e5;
      --primary-hover: #4338ca;
      --bg: #f8fafc;
      --card-bg: #ffffff;
      --text: #0f172a;
      --text-muted: #64748b;
      --border: #e2e8f0;
      --success: #10b981;
      --amber: #f59e0b;
      --rose: #ef4444;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.5;
      padding-bottom: 60px;
    }
    .header {
      background: #ffffff;
      border-bottom: 1px solid var(--border);
      position: sticky;
      top: 0;
      z-index: 20;
      padding: 12px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .brand { font-size: 1.25rem; font-weight: 700; color: var(--text); display: flex; align-items: center; gap: 8px; }
    .brand span { font-size: 0.75rem; font-weight: normal; color: var(--text-muted); }
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      border: 1px solid transparent;
      transition: all 0.15s;
    }
    .btn-primary { background: var(--primary); color: #fff; }
    .btn-primary:hover { background: var(--primary-hover); }
    .btn-outline { background: #fff; border-color: var(--border); color: var(--text); }
    .btn-outline:hover { background: #f1f5f9; }
    .container { max-width: 1000px; margin: 24px auto; padding: 0 16px; }
    .tabs { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 8px; margin-bottom: 16px; }
    .tab {
      padding: 8px 14px;
      border-radius: 8px;
      font-size: 0.85rem;
      cursor: pointer;
      background: #e2e8f0;
      color: var(--text-muted);
      border: none;
      white-space: nowrap;
    }
    .tab.active { background: var(--primary); color: #fff; font-weight: 600; }
    .card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 12px;
      display: flex;
      align-items: flex-start;
      gap: 12px;
      transition: box-shadow 0.15s;
    }
    .card.completed { opacity: 0.65; background: #f8fafc; }
    .card.completed h4 { text-decoration: line-through; color: var(--text-muted); }
    .checkbox {
      width: 22px;
      height: 22px;
      border-radius: 6px;
      border: 2px solid #cbd5e1;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      flex-shrink: 0;
      margin-top: 2px;
    }
    .checkbox.checked { background: var(--success); border-color: var(--success); color: #fff; }
    .task-content { flex: 1; }
    .task-content h4 { font-size: 0.95rem; font-weight: 600; margin-bottom: 4px; }
    .task-content p { font-size: 0.85rem; color: var(--text-muted); margin-bottom: 6px; }
    .meta { font-size: 0.75rem; color: var(--text-muted); display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
    .quick-add {
      background: #fff;
      border: 1px solid var(--border);
      padding: 12px;
      border-radius: 12px;
      display: flex;
      gap: 8px;
      margin-bottom: 20px;
    }
    .quick-add input {
      flex: 1;
      padding: 8px 12px;
      border: 1px solid var(--border);
      border-radius: 8px;
      font-size: 0.9rem;
    }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px; }
    .stat-box { background: #fff; border: 1px solid var(--border); border-radius: 12px; padding: 16px; }
    .stat-box .num { font-size: 1.8rem; font-weight: 700; color: var(--primary); font-family: monospace; }
    .stat-box .lbl { font-size: 0.8rem; color: var(--text-muted); }
    .toast {
      position: fixed;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%);
      background: #0f172a;
      color: #fff;
      padding: 10px 20px;
      border-radius: 10px;
      font-size: 0.85rem;
      z-index: 50;
      display: none;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="brand">
      טקטיק <span>אפליקציית משימות אופליין עצמאית</span>
    </div>
    <div style="display:flex; gap:8px;">
      <button class="btn btn-outline" onclick="requestNotification()">🔔 הפעל תזכורות דפדפן</button>
      <button class="btn btn-outline" onclick="testNotification()">⚡ בדיקת צליל ותזכורת</button>
    </div>
  </div>

  <div class="container">
    <div class="stats-grid">
      <div class="stat-box">
        <div class="num" id="stat-completed">0/0</div>
        <div class="lbl">משימות שהושלמו במחזור</div>
      </div>
      <div class="stat-box">
        <div class="num" id="stat-rate">0%</div>
        <div class="lbl">אחוז ביצוע כולל</div>
      </div>
      <div class="stat-box">
        <div class="num" id="stat-streaks">0</div>
        <div class="lbl">רצפים פעילים (Streaks)</div>
      </div>
    </div>

    <div class="quick-add">
      <input type="text" id="quick-input" placeholder="הוסף משימה חדשה... (לחץ Enter)">
      <select id="quick-scope" style="padding:8px; border-radius:8px; border:1px solid var(--border); font-size:0.85rem;">
        <option value="hourly">שעתית</option>
        <option value="daily" selected>יומית</option>
        <option value="weekly">שבועית</option>
        <option value="monthly">חודשית</option>
        <option value="yearly">שנתית</option>
        <option value="custom">מותאם אישית</option>
        <option value="general">כללית</option>
      </select>
      <button class="btn btn-primary" onclick="quickAdd()">הוסף משימה</button>
    </div>

    <div class="tabs" id="scope-tabs">
      <button class="tab active" onclick="setScope('all')">הכל</button>
      <button class="tab" onclick="setScope('hourly')">שעתיות</button>
      <button class="tab" onclick="setScope('daily')">יומיות</button>
      <button class="tab" onclick="setScope('weekly')">שבועיות</button>
      <button class="tab" onclick="setScope('monthly')">חודשיות</button>
      <button class="tab" onclick="setScope('yearly')">שנתיות</button>
      <button class="tab" onclick="setScope('custom')">מותאם אישית</button>
      <button class="tab" onclick="setScope('general')">כלליות</button>
    </div>

    <div id="tasks-list"></div>
  </div>

  <div class="toast" id="toast"></div>

  <script>
    // Embedded tasks data
    let tasks = ${tasksJson};
    let currentScope = 'all';

    // LocalStorage recovery if newer
    try {
      const saved = localStorage.getItem('tactic_offline_tasks');
      if (saved) tasks = JSON.parse(saved);
    } catch(e) {}

    function saveTasks() {
      try {
        localStorage.setItem('tactic_offline_tasks', JSON.stringify(tasks));
      } catch(e) {}
      render();
    }

    function showToast(msg) {
      const t = document.getElementById('toast');
      t.innerText = msg;
      t.style.display = 'block';
      setTimeout(() => { t.style.display = 'none'; }, 3000);
    }

    function playChime() {
      try {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) return;
        const ctx = new AudioContextClass();
        const now = ctx.currentTime;
        [1046.5, 1318.5, 1567.98].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.12);
          gain.gain.setValueAtTime(0, now + idx * 0.12);
          gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.12 + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.12 + 0.25);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.12);
          osc.stop(now + idx * 0.12 + 0.25);
        });
      } catch(e) {}
    }

    function requestNotification() {
      if ('Notification' in window) {
        Notification.requestPermission().then(p => {
          if (p === 'granted') {
            playChime();
            new Notification('תזכורות דפדפן פעילות!', { body: 'מעתה תקבל תזכורות ישירות מהקובץ האופליין.' });
            showToast('תזכורות דפדפן הופעלו בהצלחה');
          }
        });
      } else {
        alert('הדפדפן אינו תומך בהתראות');
      }
    }

    function testNotification() {
      playChime();
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('בדיקת תזכורת טקטיק', { body: 'התזכורת פועלת במצב אופליין מלא!' });
      }
      showToast('הושמעה תזכורת בדיקה');
    }

    function toggleTask(id) {
      tasks = tasks.map(t => {
        if (t.id !== id) return t;
        const next = !t.completed;
        const streak = next ? (t.streak || 0) + 1 : Math.max(0, (t.streak || 1) - 1);
        if (next) {
          playChime();
          showToast('המשימה הושלמה! רצף: ' + streak);
        }
        return { ...t, completed: next, streak, bestStreak: Math.max(t.bestStreak || 0, streak) };
      });
      saveTasks();
    }

    function renewTask(id) {
      tasks = tasks.map(t => {
        if (t.id !== id) return t;
        showToast('המשימה חודשה למחזור הבא עם רצף של ' + t.streak);
        return { ...t, completed: false };
      });
      saveTasks();
    }

    function quickAdd() {
      const input = document.getElementById('quick-input');
      const val = input.value.trim();
      if (!val) return;
      const scope = document.getElementById('quick-scope').value;
      const newTask = {
        id: 'task-' + Date.now(),
        title: val,
        scope: scope,
        priority: 'medium',
        category: 'work',
        renewOnNextPeriod: scope !== 'general',
        completed: false,
        streak: 0,
        bestStreak: 0,
        subtasks: [],
        createdAt: new Date().toISOString()
      };
      tasks.unshift(newTask);
      input.value = '';
      showToast('משימה נוספה בהצלחה');
      saveTasks();
    }

    document.getElementById('quick-input').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') quickAdd();
    });

    function setScope(scope) {
      currentScope = scope;
      document.querySelectorAll('#scope-tabs .tab').forEach(b => {
        b.classList.toggle('active', b.innerText.includes(scope === 'all' ? 'הכל' : ''));
      });
      render();
    }

    function render() {
      const list = document.getElementById('tasks-list');
      const filtered = tasks.filter(t => currentScope === 'all' || t.scope === currentScope);
      
      const completedCount = tasks.filter(t => t.completed).length;
      document.getElementById('stat-completed').innerText = completedCount + '/' + tasks.length;
      document.getElementById('stat-rate').innerText = tasks.length > 0 ? Math.round((completedCount/tasks.length)*100) + '%' : '0%';
      document.getElementById('stat-streaks').innerText = tasks.filter(t => t.streak > 0).length;

      if (filtered.length === 0) {
        list.innerHTML = '<div style="text-align:center; padding:40px; color:#94a3b8;">אין משימות בטווח זה</div>';
        return;
      }

      list.innerHTML = filtered.map(t => {
        return \`
          <div class="card \${t.completed ? 'completed' : ''}">
            <div class="checkbox \${t.completed ? 'checked' : ''}" onclick="toggleTask('\${t.id}')">
              \${t.completed ? '✓' : ''}
            </div>
            <div class="task-content">
              <h4>\${t.title}</h4>
              \${t.description ? '<p>' + t.description + '</p>' : ''}
              <div class="meta">
                <span>טווח: \${t.scope}</span>
                \${t.renewOnNextPeriod ? '<span>· 🔄 מתחדשת במחזור הבא</span>' : ''}
                \${t.streak > 0 ? '<span>· 🔥 רצף של ' + t.streak + '</span>' : ''}
                \${t.renewOnNextPeriod ? '<button onclick="renewTask(\\'' + t.id + '\\')" style="background:none; border:none; color:var(--primary); cursor:pointer; font-size:0.75rem;">[חדש עכשיו למחזור הבא]</button>' : ''}
              </div>
            </div>
          </div>
        \`;
      }).join('');
    }

    render();
  </script>
</body>
</html>`;
}

export function downloadStandaloneHtml(tasks: Task[]): void {
  const htmlContent = generateSingleFileHtml(tasks);
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `tactic-tasks-offline-${new Date().toISOString().split('T')[0]}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
