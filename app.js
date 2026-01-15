/**
 * AP Study Planner Logic - Rebuilt based on new specifications
 * Specs: 2026/04 Exam, ~45min/day, Auto-Plan with Phases
 */

// --- Constants ---
const STORAGE_KEY = 'ap_planner_v3_data';
const CATEGORIES = ['テクノロジ', 'マネジメント', 'ストラテジ', '午後演習', '過去問'];
// 応用情報技術者試験 公式シラバスに基づく大分類を中心に12章構成へ変更
// ※ 基礎理論・アルゴリズムは最後に回しています
const AP_CHAPTERS = [
    { name: '3. コンピュータ構成要素', cat: 'テクノロジ' },
    { name: '4. システム構成要素', cat: 'テクノロジ' },
    { name: '5. ソフトウェアとOS', cat: 'テクノロジ' },
    { name: '6. データベース', cat: 'テクノロジ' },
    { name: '7. ネットワーク', cat: 'テクノロジ' },
    { name: '8. セキュリティ', cat: 'テクノロジ' },
    { name: '9. システム開発技術', cat: 'テクノロジ' },
    { name: '10. プロジェクトマネジメント・サービス', cat: 'マネジメント' },
    { name: '11. 経営・システム戦略', cat: 'ストラテジ' },
    { name: '12. 企業と法務', cat: 'ストラテジ' },
    { name: '1. 基礎理論（離散数学・応用数学）', cat: 'テクノロジ' },
    { name: '2. アルゴリズムとプログラミング', cat: 'テクノロジ' }
];

const TYPES = ['インプット', '過去問', '復習'];

// --- State Management ---
let state = {
    settings: {
        examDate: '2026-04-19',
        dailyTargetMinutes: 45,
        studyDaysPerWeek: 7,
        startDate: new Date().toISOString().split('T')[0]
    },
    viewState: { dashboardTab: 'input' }, // input or output
    tasks: [],
    logs: [],
    activeTimer: null
};

// --- Initialization ---
function init() {
    loadData();
    if (state.tasks.length === 0) generateAutoPlan();
    else rolloverTasks();

    setupRouting();
    setupModalEvents();
    setupSettingsEvents();
    setupTaskEvents();
    setupTimerEvents();
    render('dashboard');
}

// --- Data Persistence ---
function loadData() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
        try {
            const data = JSON.parse(raw);
            // 明示的にtasksとlogsを配列として保持
            if (data.tasks && Array.isArray(data.tasks)) {
                state.tasks = data.tasks;
            }
            if (data.logs && Array.isArray(data.logs)) {
                state.logs = data.logs;
            }
            if (data.settings) {
                state.settings = { ...state.settings, ...data.settings };
            }
            // viewStateはリセット、activeTimerはnullに
            state.viewState = { dashboardTab: 'input' };
            state.activeTimer = null;
            console.log('Data loaded:', state.tasks.length, 'tasks');
        } catch (e) {
            console.error('Data load error', e);
        }
    }
}
function saveData() {
    // viewStateを除外して保存したいが、簡易実装のため丸ごと保存しても支障は少ない
    // ただしload時にリセットしているのでOK
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// --- Logic: Auto Plan Generator ---
function generateAutoPlan() {
    state.tasks = [];

    // 今日は空けておき、明日から計画を埋める
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const exam = new Date(state.settings.examDate);
    const dailyMins = state.settings.dailyTargetMinutes;

    let current = new Date(tomorrow);
    let dayCount = 0;

    while (current < exam) {
        const dateStr = current.toISOString().split('T')[0];
        const dayOfWeek = current.getDay();

        const weekNum = Math.floor(dayCount / 7);
        const chapter = AP_CHAPTERS[weekNum % AP_CHAPTERS.length];

        if (dayOfWeek === 0) {
            createTask(dateStr, '午後記述式: ' + chapter.name, chapter.cat, '過去問', 45, 'high');
        } else {
            const inputDur = (dailyMins >= 45) ? 30 : 15;
            createTask(dateStr, `【学習】${chapter.name}`, chapter.cat, 'インプット', inputDur, 'medium');

            if (dailyMins - inputDur >= 15) {
                createTask(dateStr, `【演習】午前過去問 10道場`, '過去問', '過去問', 15, 'low');
            }
        }

        current.setDate(current.getDate() + 1);
        dayCount++;
        if (dayCount > 180) break;
    }
    saveData();
    render('dashboard');
}

// 明日以降のタスクを今日に持ってくる（おすすめロード）
window.populateToday = function () {
    const todayStr = new Date().toISOString().split('T')[0];

    // 一番近い未来のタスクを探す
    // シンプルに「明日」の分を今日にする
    // 明日の日付を取得
    const today = new Date();
    const tmr = new Date(today);
    tmr.setDate(tmr.getDate() + 1);
    const tmrStr = tmr.toISOString().split('T')[0];

    const candidates = state.tasks.filter(t => t.date === tmrStr);

    if (candidates.length === 0) {
        alert('明日以降の計画がありません。設定から計画を再生成してください。');
        return;
    }

    candidates.forEach(t => t.date = todayStr);
    saveData();
    render('dashboard');
    alert('明日の学習プランを今日に前倒ししました 💪');
};

function createTask(date, title, cat, type, dur, prio) {
    const id = Math.random().toString(36).substr(2, 9);
    state.tasks.push({ id, title, cat, type, date, dur: parseInt(dur), prio, status: 'todo' });
}

function rolloverTasks() {
    const todayStr = new Date().toISOString().split('T')[0];
    let mod = false;
    state.tasks.forEach(t => {
        if (t.status !== 'completed' && t.date < todayStr) {
            t.date = todayStr;
            if (!t.title.startsWith('[繰越]')) t.title = '[繰越] ' + t.title;
            mod = true;
        }
    });
    if (mod) saveData();
}

// --- View Rendering ---
function render(viewName = 'dashboard') {
    if (!state.viewState) state.viewState = { dashboardTab: 'input', taskTab: 'input' };
    const container = document.getElementById('main-container');

    // Update active nav
    document.querySelectorAll('.nav-item').forEach(el => {
        if (el.dataset.view === viewName) {
            el.classList.add('active');
        } else {
            el.classList.remove('active');
        }
    });

    if (viewName === 'dashboard') renderDashboard(container);
    else if (viewName === 'tasks') renderTaskList(container);
    else if (viewName === 'stats') renderStats(container);
}

window.switchTaskTab = function (tab) {
    state.viewState.taskTab = tab;
    renderTaskList(document.getElementById('main-container'));
};

function renderDashboard(container) {
    const todayStr = getTodayStr();
    const todaysTasks = state.tasks.filter(t => t.date === todayStr);
    const completed = todaysTasks.filter(t => t.status === 'completed').length;
    const total = todaysTasks.length;
    const daysLeft = Math.ceil((new Date(state.settings.examDate) - new Date()) / 86400000);

    // Dashboardはシンプルに全リスト表示（ただしセクションは分ける）
    const inputTasks = todaysTasks.filter(t => t.type === 'インプット' || t.title.includes('学習'));
    const outputTasks = todaysTasks.filter(t => t.type !== 'インプット' && !t.title.includes('学習'));

    // 今日のタスクが無い場合のUI
    let contentHtml = '';
    if (total === 0) {
        contentHtml = `
            <div class="empty-state-card" style="text-align:center; padding:40px 20px; background:var(--bg-card); border-radius:16px; border:1px solid var(--border);">
                <div style="font-size:3rem; margin-bottom:16px;">🌱</div>
                <div style="font-weight:700; font-size:1.1rem; margin-bottom:8px;">今日のタスクを決めましょう</div>
                <div style="color:var(--text-sub); font-size:0.9rem; margin-bottom:24px;">自動生成された計画は明日から始まります。<br>今日は何をしますか？</div>
                
                <div style="display:flex; flex-direction:column; gap:12px;">
                    <button class="btn btn-primary" onclick="populateToday()" style="width:100%">
                        📑 明日の計画を今日やる (おすすめ)
                    </button>
                    <button class="btn" style="background:var(--bg-body); border:1px solid var(--border); color:var(--text-main); width:100%" onclick="openTaskModal()">
                        ✏️ 手動でタスクを作る
                    </button>
                </div>
            </div>
        `;
    } else {
        contentHtml = `
            <div class="section-title">今日のタスク (${completed}/${total})</div>
            
            ${inputTasks.length > 0 ? `
            <div class="sheet-label">📖 インプット学習</div>
            <div class="task-group">
                ${inputTasks.map(t => renderTaskItem(t)).join('')}
            </div>` : ''}
    
            ${outputTasks.length > 0 ? `
            <div class="sheet-label" style="margin-top:20px;">🔥 演習・過去問</div>
            <div class="task-group">
                 ${outputTasks.map(t => renderTaskItem(t)).join('')}
            </div>` : ''}
            
            <div style="text-align:center; margin-top:24px;">
               <button class="btn-text" onclick="openTaskModal()">+ タスクを追加</button>
            </div>
        `;
    }

    container.innerHTML = `
        <div class="header-card">
            <div class="header-top">
                <span class="header-date">TODAY'S PLAN</span>
                <button class="settings-btn" onclick="openSettings()">⚙️</button>
            </div>
            <div>試験日まであと <span class="header-countdown">${Math.max(0, daysLeft)}</span> <span class="header-unit">日</span></div>
        </div>
        ${contentHtml}
    `;
}

function renderTaskList(container) {
    const activeTab = state.viewState.taskTab || 'input';

    // 全タスクから未完了を取得
    const allTasks = state.tasks.filter(t => t.status !== 'completed').sort((a, b) => a.date.localeCompare(b.date));

    const inputTasks = allTasks.filter(t => t.type === 'インプット' || t.title.includes('学習'));
    const outputTasks = allTasks.filter(t => t.type !== 'インプット' && !t.title.includes('学習'));

    const tasksToShow = activeTab === 'input' ? inputTasks : outputTasks;
    const emptyMsg = activeTab === 'input' ? '未完了のインプット課題はありません' : '未完了の演習課題はありません';

    container.innerHTML = `
        <div class="section-header">
            <div class="section-title">タスク管理</div>
            <button class="section-action" onclick="openTaskModal()">+ 新規作成</button>
        </div>

        <!-- Tab Switcher -->
        <div class="dashboard-tabs">
            <button class="dash-tab ${activeTab === 'input' ? 'active' : ''}" onclick="switchTaskTab('input')">
                📖 インプットシート
            </button>
            <button class="dash-tab ${activeTab === 'output' ? 'active' : ''}" onclick="switchTaskTab('output')">
                🔥 演習シート
            </button>
        </div>

        <div class="task-sheet-container">
             <div class="sheet-header">
                ${activeTab === 'input' ? '完了を目指すインプットタスク' : '消化すべき演習タスク'}
            </div>
            <div class="task-group">
                ${tasksToShow.length ? tasksToShow.map(t => renderTaskItem(t)).join('') : `<div class="empty-msg">${emptyMsg}</div>`}
            </div>
        </div>
    `;
}

function renderStats(container) {
    // Calculcate Stats
    const totalMins = state.logs.reduce((acc, l) => acc + l.dur, 0);
    const todayStr = getTodayStr();
    const todayMins = state.logs.filter(l => l.date === todayStr).reduce((acc, l) => acc + l.dur, 0);

    container.innerHTML = `
        <div class="section-header">
            <div class="section-title">学習分析</div>
        </div>
        <div class="stats-grid">
             <div class="stat-box">
                <div class="stat-num">${todayMins}<span style="font-size:1rem">分</span></div>
                <div class="stat-sub">今日の学習</div>
             </div>
             <div class="stat-box">
                <div class="stat-num">${Math.floor(totalMins / 60)}<span style="font-size:1rem">時間</span></div>
                <div class="stat-sub">累計学習</div>
             </div>
        </div>
        <div class="chart-container">
            <canvas id="statsChart"></canvas>
        </div>
    `;

    setTimeout(() => {
        const ctx = document.getElementById('statsChart');
        if (ctx) {
            // Aggregate by Category
            const catData = {};
            state.logs.forEach(l => {
                const task = state.tasks.find(t => t.id === l.taskId);
                const cat = task ? task.cat : 'その他';
                catData[cat] = (catData[cat] || 0) + l.dur;
            });

            new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: Object.keys(catData),
                    datasets: [{
                        data: Object.values(catData),
                        backgroundColor: ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#64748B']
                    }]
                },
                options: { maintainAspectRatio: false }
            });
        }
    }, 50);
}

function renderTaskItem(t, showPlay = true) {
    const badgeClass = t.cat === 'テクノロジ' ? 'badge-tech' :
        t.cat === 'マネジメント' ? 'badge-mgmt' :
            t.cat === 'ストラテジ' ? 'badge-strat' : 'badge-past';

    return `
        <div class="task-card ${t.status === 'completed' ? 'completed' : ''}" id="task-${t.id}">
            <div class="task-check" onclick="toggleTaskStatus('${t.id}')"></div>
            <div class="task-content" onclick="editTask('${t.id}')">
                <div class="task-title">${t.title}</div>
                <div class="task-meta">
                    <span class="badge ${badgeClass}">${t.cat}</span>
                    <span>${t.type}</span>
                    <span>⏱ ${t.dur}分</span>
                </div>
            </div>
            ${showPlay && t.status !== 'completed' ? `
            <button class="play-btn" onclick="startTimer('${t.id}')">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
            </button>` : ''}
        </div>
    `;
}

// --- Helpers ---
function getTodayStr() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// --- Interaction Actions ---
window.toggleTaskStatus = (id) => {
    const task = state.tasks.find(t => t.id === id);
    if (task) {
        task.status = task.status === 'completed' ? 'todo' : 'completed';
        saveData();
        render(document.querySelector('.nav-item.active').dataset.view);
    }
};

let timerInterval;

function updateTimerDisplay() {
    if (!state.activeTimer) return;

    let now = Date.now();
    if (state.activeTimer.isPaused) {
        now = state.activeTimer.pauseStart;
    }

    const diff = Math.max(0, Math.floor((now - state.activeTimer.start - state.activeTimer.totalPaused) / 1000));
    const m = Math.floor(diff / 60).toString().padStart(2, '0');
    const s = (diff % 60).toString().padStart(2, '0');
    document.getElementById('timer-clock').textContent = `${m}:${s}`;
}

window.startTimer = (taskId) => {
    state.activeTimer = {
        taskId,
        start: Date.now(),
        totalPaused: 0,
        isPaused: false,
        pauseStart: null
    };
    const task = state.tasks.find(t => t.id === taskId);

    document.getElementById('timer-task-title').textContent = task.title;
    document.getElementById('timer-task-badge').textContent = task.type;

    // Check if element exists before setting textContent
    const toggleBtn = document.getElementById('timer-toggle-btn');
    if (toggleBtn) toggleBtn.textContent = '⏸ 一時停止';

    document.getElementById('timer-modal').classList.add('active');

    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(updateTimerDisplay, 1000);
    updateTimerDisplay();
};

function toggleTimer() {
    if (!state.activeTimer) return;
    const btn = document.getElementById('timer-toggle-btn');

    if (state.activeTimer.isPaused) {
        // Resume
        const pausedDuration = Date.now() - state.activeTimer.pauseStart;
        state.activeTimer.totalPaused += pausedDuration;
        state.activeTimer.isPaused = false;
        state.activeTimer.pauseStart = null;

        btn.textContent = '⏸ 一時停止';
        timerInterval = setInterval(updateTimerDisplay, 1000);
    } else {
        // Pause
        state.activeTimer.isPaused = true;
        state.activeTimer.pauseStart = Date.now();

        btn.textContent = '▶ 再開';
        clearInterval(timerInterval);
        updateTimerDisplay();
    }
}

// --- View Setup & Events ---
function setupRouting() {
    document.querySelectorAll('[data-view]').forEach(btn => {
        btn.addEventListener('click', () => {
            render(btn.dataset.view);
        });
    });
}

function setupModalEvents() {
    window.closeModal = (id) => {
        document.getElementById(id).classList.remove('active');
        if (id === 'timer-modal') {
            if (timerInterval) clearInterval(timerInterval);
        }
    };

    window.openSettings = () => {
        document.getElementById('setting-exam-date').value = state.settings.examDate;
        document.getElementById('setting-daily-mins').value = state.settings.dailyTargetMinutes;
        document.getElementById('settings-modal').classList.add('active');
    };

    window.openTaskModal = () => window.editTask(null);
}

function setupSettingsEvents() {
    const range = document.getElementById('setting-daily-mins');
    if (range) {
        range.addEventListener('input', e => {
            const disp = document.getElementById('setting-daily-disp');
            if (disp) disp.textContent = e.target.value + '分';
        });
    }

    const saveBtn = document.getElementById('save-settings-btn');
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            state.settings.examDate = document.getElementById('setting-exam-date').value;
            state.settings.dailyTargetMinutes = parseInt(range.value);
            generateAutoPlan(); // Regenerate
            closeModal('settings-modal');
        });
    }
}

function setupTaskEvents() {
    let editingId = null;

    window.editTask = (id) => {
        editingId = id;
        const modal = document.getElementById('task-modal');
        const btnDelete = document.getElementById('delete-task-btn');
        const titleInput = document.getElementById('task-modal-title');

        if (id) {
            const t = state.tasks.find(task => task.id === id);
            document.getElementById('edit-task-title').value = t.title;
            document.getElementById('edit-task-cat').value = t.cat;
            document.getElementById('edit-task-type').value = t.type;
            document.getElementById('edit-task-dur').value = t.dur;
            document.getElementById('edit-task-date').value = t.date;
            titleInput.textContent = 'タスク編集';
            btnDelete.classList.remove('hidden');
        } else {
            const dateInput = document.getElementById('edit-task-date');
            document.getElementById('edit-task-title').value = '';
            if (dateInput) dateInput.value = getTodayStr();
            titleInput.textContent = '新規タスク';
            btnDelete.classList.add('hidden');
        }
        modal.classList.add('active');
    };

    const saveTaskBtn = document.getElementById('save-task-btn');
    if (saveTaskBtn) {
        saveTaskBtn.addEventListener('click', () => {
            const title = document.getElementById('edit-task-title').value;
            if (!title) return alert('タイトルは必須です');

            const data = {
                title,
                cat: document.getElementById('edit-task-cat').value,
                type: document.getElementById('edit-task-type').value,
                dur: parseInt(document.getElementById('edit-task-dur').value),
                date: document.getElementById('edit-task-date').value,
                prio: document.querySelector('input[name="prio"]:checked').value
            };

            if (editingId) {
                const t = state.tasks.find(task => task.id === editingId);
                Object.assign(t, data);
            } else {
                createTask(data.date, data.title, data.cat, data.type, data.dur, data.prio);
            }
            saveData();
            closeModal('task-modal');
            render(document.querySelector('.nav-item.active').dataset.view);
        });
    }

    const delTaskBtn = document.getElementById('delete-task-btn');
    if (delTaskBtn) {
        delTaskBtn.addEventListener('click', () => {
            if (editingId && confirm('削除しますか？')) {
                state.tasks = state.tasks.filter(t => t.id !== editingId);
                saveData();
                closeModal('task-modal');
                render(document.querySelector('.nav-item.active').dataset.view);
            }
        });
    }
}

function setupTimerEvents() {
    // Add Toggle Listener
    const toggleBtn = document.getElementById('timer-toggle-btn');
    if (toggleBtn) {
        const newToggleBtn = toggleBtn.cloneNode(true);
        toggleBtn.parentNode.replaceChild(newToggleBtn, toggleBtn);
        newToggleBtn.addEventListener('click', toggleTimer);
    }

    // Stop Listener
    const stopBtn = document.getElementById('timer-stop-btn');
    if (stopBtn) {
        const newStopBtn = stopBtn.cloneNode(true);
        stopBtn.parentNode.replaceChild(newStopBtn, stopBtn);

        newStopBtn.addEventListener('click', () => {
            if (!state.activeTimer) return;
            clearInterval(timerInterval);

            // Calculate final duration
            let endTime = Date.now();
            if (state.activeTimer.isPaused) {
                endTime = state.activeTimer.pauseStart;
            }
            const effectiveMs = endTime - state.activeTimer.start - state.activeTimer.totalPaused;
            const dur = Math.ceil(effectiveMs / 1000 / 60);

            const task = state.tasks.find(x => x.id === state.activeTimer.taskId);
            const targetDur = task ? task.dur : 0;
            const remaining = targetDur - dur;

            // Log it
            if (dur > 0) {
                state.logs.push({
                    id: Date.now(),
                    taskId: state.activeTimer.taskId,
                    dur: dur,
                    date: getTodayStr()
                });

                if (remaining <= 0) {
                    // 目標時間を達成した場合
                    if (confirm(`🎉 ${dur}分学習しました！目標達成！\nタスクを完了にしますか？`)) {
                        if (task) task.status = 'completed';
                    }
                } else {
                    // 目標時間に満たない場合
                    alert(`${dur}分学習しました。\n残り ${remaining}分 です。引き続き頑張りましょう！`);
                    // 残り時間をタスクに反映
                    if (task) task.dur = remaining;
                }
            }

            state.activeTimer = null;
            saveData();
            closeModal('timer-modal');
            render(document.querySelector('.nav-item.active').dataset.view);
        });
    }
}

// Start
document.addEventListener('DOMContentLoaded', init);
