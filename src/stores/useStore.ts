import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ストレージキー
const STORAGE_KEY = 'ap-study-planner-v2'
const BACKUP_KEY = 'ap-study-planner-v2-backup'

export interface Task {
    id: string
    title: string
    category: 'テクノロジ' | 'マネジメント' | 'ストラテジ' | '過去問' | '午後演習'
    type: 'インプット' | '過去問' | '復習'
    duration: number
    date: string
    status: 'todo' | 'completed'
    priority: 'low' | 'medium' | 'high'
}

export interface StudyLog {
    id: string
    taskId: string
    duration: number
    date: string
    createdAt: number
}

export interface Settings {
    examDate: string
    dailyTargetMinutes: number
    studyDaysPerWeek: number
    darkMode: boolean
}

interface StoreState {
    tasks: Task[]
    logs: StudyLog[]
    settings: Settings
    activeTab: 'home' | 'tasks' | 'stats'
    settingsOpen: boolean
    lastSaved: number

    // Actions
    addTask: (task: Omit<Task, 'id'>) => void
    updateTask: (id: string, updates: Partial<Task>) => void
    deleteTask: (id: string) => void
    toggleTaskStatus: (id: string) => void
    addLog: (log: Omit<StudyLog, 'id' | 'createdAt'>) => void
    updateSettings: (settings: Partial<Settings>) => void
    setActiveTab: (tab: 'home' | 'tasks' | 'stats') => void
    setSettingsOpen: (open: boolean) => void
    toggleDarkMode: () => void
    generateAutoPlan: () => void
    restoreFromBackup: () => boolean
    createBackup: () => void
}

// 応用情報技術者試験のチャプター
const AP_CHAPTERS = [
    { name: '3. コンピュータ構成要素', cat: 'テクノロジ' as const },
    { name: '4. システム構成要素', cat: 'テクノロジ' as const },
    { name: '5. ソフトウェアとOS', cat: 'テクノロジ' as const },
    { name: '6. データベース', cat: 'テクノロジ' as const },
    { name: '7. ネットワーク', cat: 'テクノロジ' as const },
    { name: '8. セキュリティ', cat: 'テクノロジ' as const },
    { name: '9. システム開発技術', cat: 'テクノロジ' as const },
    { name: '10. プロジェクトマネジメント', cat: 'マネジメント' as const },
    { name: '11. 経営・システム戦略', cat: 'ストラテジ' as const },
    { name: '12. 企業と法務', cat: 'ストラテジ' as const },
    { name: '1. 基礎理論', cat: 'テクノロジ' as const },
    { name: '2. アルゴリズム', cat: 'テクノロジ' as const },
]

// バックアップを作成
function saveBackup() {
    try {
        const current = localStorage.getItem(STORAGE_KEY)
        if (current) {
            const parsed = JSON.parse(current)
            if (parsed?.state?.tasks?.length || parsed?.state?.logs?.length) {
                localStorage.setItem(BACKUP_KEY, current)
                console.log('[Backup] Created backup')
            }
        }
    } catch (e) {
        console.error('[Backup] Failed:', e)
    }
}

// バックアップから復元
function loadBackup(): { tasks: Task[]; logs: StudyLog[]; settings: Settings } | null {
    try {
        const backup = localStorage.getItem(BACKUP_KEY)
        if (backup) {
            const parsed = JSON.parse(backup)
            if (parsed?.state) {
                return {
                    tasks: parsed.state.tasks || [],
                    logs: parsed.state.logs || [],
                    settings: parsed.state.settings || {
                        examDate: '2026-04-19',
                        dailyTargetMinutes: 45,
                        studyDaysPerWeek: 7,
                        darkMode: false,
                    }
                }
            }
        }
    } catch (e) {
        console.error('[Restore] Failed:', e)
    }
    return null
}

export const useStore = create<StoreState>()(
    persist(
        (set, get) => ({
            tasks: [],
            logs: [],
            settings: {
                examDate: '2026-04-19',
                dailyTargetMinutes: 45,
                studyDaysPerWeek: 7,
                darkMode: false,
            },
            activeTab: 'home',
            settingsOpen: false,
            lastSaved: Date.now(),

            addTask: (task) =>
                set((state) => ({
                    tasks: [
                        ...state.tasks,
                        { ...task, id: Math.random().toString(36).slice(2, 11) },
                    ],
                    lastSaved: Date.now(),
                })),

            updateTask: (id, updates) =>
                set((state) => ({
                    tasks: state.tasks.map((t) =>
                        t.id === id ? { ...t, ...updates } : t
                    ),
                    lastSaved: Date.now(),
                })),

            deleteTask: (id) =>
                set((state) => ({
                    tasks: state.tasks.filter((t) => t.id !== id),
                    lastSaved: Date.now(),
                })),

            toggleTaskStatus: (id) => {
                // 変更前にバックアップ
                saveBackup()
                set((state) => ({
                    tasks: state.tasks.map((t) =>
                        t.id === id
                            ? { ...t, status: t.status === 'completed' ? 'todo' : 'completed' }
                            : t
                    ),
                    lastSaved: Date.now(),
                }))
            },

            addLog: (log) =>
                set((state) => ({
                    logs: [
                        ...state.logs,
                        {
                            ...log,
                            id: Math.random().toString(36).slice(2, 11),
                            createdAt: Date.now(),
                        },
                    ],
                    lastSaved: Date.now(),
                })),

            updateSettings: (updates) =>
                set((state) => ({
                    settings: { ...state.settings, ...updates },
                    lastSaved: Date.now(),
                })),

            setActiveTab: (tab) => set({ activeTab: tab }),

            setSettingsOpen: (open) => set({ settingsOpen: open }),

            toggleDarkMode: () =>
                set((state) => {
                    const newDarkMode = !state.settings.darkMode
                    // DOMにクラスを適用
                    if (newDarkMode) {
                        document.documentElement.classList.add('dark')
                    } else {
                        document.documentElement.classList.remove('dark')
                    }
                    return {
                        settings: { ...state.settings, darkMode: newDarkMode },
                        lastSaved: Date.now(),
                    }
                }),

            createBackup: () => {
                saveBackup()
            },

            restoreFromBackup: () => {
                const backup = loadBackup()
                if (backup) {
                    set({
                        tasks: backup.tasks,
                        logs: backup.logs,
                        settings: backup.settings,
                        lastSaved: Date.now(),
                    })
                    return true
                }
                return false
            },

            generateAutoPlan: () => {
                const { settings, logs } = get()

                // 現在のデータをバックアップ
                saveBackup()

                const today = new Date()
                today.setHours(0, 0, 0, 0)
                const tomorrow = new Date(today)
                tomorrow.setDate(tomorrow.getDate() + 1)
                const exam = new Date(settings.examDate)
                const dailyMins = settings.dailyTargetMinutes

                const newTasks: Task[] = []
                let current = new Date(tomorrow)
                let dayCount = 0

                while (current < exam && dayCount < 180) {
                    const dateStr = current.toISOString().split('T')[0]
                    const dayOfWeek = current.getDay()
                    const weekNum = Math.floor(dayCount / 7)
                    const chapter = AP_CHAPTERS[weekNum % AP_CHAPTERS.length]

                    if (dayOfWeek === 0) {
                        newTasks.push({
                            id: Math.random().toString(36).slice(2, 11),
                            title: `午後記述式: ${chapter.name}`,
                            category: chapter.cat,
                            type: '過去問',
                            duration: 45,
                            date: dateStr,
                            status: 'todo',
                            priority: 'high',
                        })
                    } else {
                        const inputDur = dailyMins >= 45 ? 30 : 15
                        newTasks.push({
                            id: Math.random().toString(36).slice(2, 11),
                            title: `【学習】${chapter.name}`,
                            category: chapter.cat,
                            type: 'インプット',
                            duration: inputDur,
                            date: dateStr,
                            status: 'todo',
                            priority: 'medium',
                        })

                        if (dailyMins - inputDur >= 15) {
                            newTasks.push({
                                id: Math.random().toString(36).slice(2, 11),
                                title: '【演習】午前過去問 10問',
                                category: '過去問',
                                type: '過去問',
                                duration: 15,
                                date: dateStr,
                                status: 'todo',
                                priority: 'low',
                            })
                        }
                    }

                    current.setDate(current.getDate() + 1)
                    dayCount++
                }

                // ログは保持する
                set({ tasks: newTasks, logs, lastSaved: Date.now() })
                console.log('[AutoPlan] Generated', newTasks.length, 'tasks, preserved', logs.length, 'logs')
            },
        }),
        {
            name: STORAGE_KEY,
            partialize: (state) => ({
                tasks: state.tasks,
                logs: state.logs,
                settings: state.settings,
            }),
        }
    )
)

// 初回読み込み時にダークモードを適用
if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
        try {
            const parsed = JSON.parse(stored)
            if (parsed?.state?.settings?.darkMode) {
                document.documentElement.classList.add('dark')
            }
        } catch {
            // ignore
        }
    }
}
