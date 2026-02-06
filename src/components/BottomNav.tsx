import { Home, CheckSquare, BarChart3 } from 'lucide-react'
import { useStore } from '../stores/useStore'
import { cn } from '../lib/utils'

export default function BottomNav() {
    const { activeTab, setActiveTab } = useStore()

    const tabs = [
        { id: 'home' as const, icon: Home, label: 'ホーム' },
        { id: 'tasks' as const, icon: CheckSquare, label: 'タスク' },
        { id: 'stats' as const, icon: BarChart3, label: '分析' },
    ]

    return (
        <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md">
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-full px-4 py-2 shadow-xl shadow-black/10 border border-gray-200/50 dark:border-gray-700/50">
                <div className="flex justify-around items-center">
                    {tabs.map((tab) => {
                        const Icon = tab.icon
                        const isActive = activeTab === tab.id
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    'flex flex-col items-center gap-1 px-6 py-2 rounded-full transition-all',
                                    isActive
                                        ? 'text-primary'
                                        : 'text-muted-foreground hover:text-foreground'
                                )}
                            >
                                <Icon
                                    className={cn(
                                        'h-5 w-5 transition-transform',
                                        isActive && 'scale-110'
                                    )}
                                />
                                <span className="text-[10px] font-semibold tracking-wide">
                                    {tab.label}
                                </span>
                                {isActive && (
                                    <span className="absolute -bottom-1 w-1 h-1 rounded-full bg-primary" />
                                )}
                            </button>
                        )
                    })}
                </div>
            </div>
        </nav>
    )
}
