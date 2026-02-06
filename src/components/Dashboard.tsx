import { motion } from 'framer-motion'
import { format, differenceInDays } from 'date-fns'
import { ja } from 'date-fns/locale'
import { Settings, BookOpen, Target, Clock } from 'lucide-react'
import { useStore } from '../stores/useStore'
import { Card } from './ui/card'
import { Button } from './ui/button'
import { Progress } from './ui/progress'
import TaskCard from './TaskCard'

export default function Dashboard() {
    const { tasks, settings, logs, setSettingsOpen } = useStore()

    const today = format(new Date(), 'yyyy-MM-dd')
    const todayTasks = tasks.filter((t) => t.date === today)
    const completedToday = todayTasks.filter((t) => t.status === 'completed').length
    const totalToday = todayTasks.length
    const progress = totalToday > 0 ? (completedToday / totalToday) * 100 : 0

    const daysUntilExam = differenceInDays(new Date(settings.examDate), new Date())

    const todayStudyMinutes = logs
        .filter((l) => l.date === today)
        .reduce((acc, l) => acc + l.duration, 0)

    const totalStudyHours = Math.floor(
        logs.reduce((acc, l) => acc + l.duration, 0) / 60
    )

    const inputTasks = todayTasks.filter(
        (t) => t.type === 'インプット' || t.title.includes('学習')
    )
    const outputTasks = todayTasks.filter(
        (t) => t.type !== 'インプット' && !t.title.includes('学習')
    )

    return (
        <div className="space-y-6">
            {/* Hero Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Card className="relative overflow-hidden bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 border-0 text-white">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-50" />
                    <div className="relative p-6">
                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <p className="text-white/80 text-sm font-medium uppercase tracking-wider">
                                    TODAY'S PLAN
                                </p>
                                <p className="text-white/60 text-xs mt-1">
                                    {format(new Date(), 'M月d日 (E)', { locale: ja })}
                                </p>
                            </div>
                            <Button
                                size="icon"
                                variant="ghost"
                                className="bg-white/20 hover:bg-white/30 text-white"
                                onClick={() => setSettingsOpen(true)}
                            >
                                <Settings className="h-5 w-5" />
                            </Button>
                        </div>

                        <div className="flex items-end gap-2 mb-4">
                            <span className="text-6xl font-extrabold tracking-tight">
                                {Math.max(0, daysUntilExam)}
                            </span>
                            <span className="text-xl font-semibold mb-2 opacity-90">日</span>
                        </div>
                        <p className="text-white/80 text-sm">試験日まで</p>
                    </div>
                </Card>
            </motion.div>

            {/* Progress Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
            >
                <Card className="p-5">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-sm text-muted-foreground">
                            今日の進捗
                        </h3>
                        <span className="text-2xl font-bold text-primary">
                            {completedToday}/{totalToday}
                        </span>
                    </div>
                    <Progress value={progress} className="h-3" />
                </Card>
            </motion.div>

            {/* Stats Grid */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="grid grid-cols-3 gap-3"
            >
                <Card className="p-4 text-center">
                    <Clock className="h-5 w-5 mx-auto mb-2 text-primary" />
                    <p className="text-xl font-bold">{todayStudyMinutes}</p>
                    <p className="text-xs text-muted-foreground">今日 (分)</p>
                </Card>
                <Card className="p-4 text-center">
                    <Target className="h-5 w-5 mx-auto mb-2 text-emerald-500" />
                    <p className="text-xl font-bold">{totalStudyHours}</p>
                    <p className="text-xs text-muted-foreground">累計 (時間)</p>
                </Card>
                <Card className="p-4 text-center">
                    <BookOpen className="h-5 w-5 mx-auto mb-2 text-amber-500" />
                    <p className="text-xl font-bold">{tasks.filter(t => t.status === 'completed').length}</p>
                    <p className="text-xs text-muted-foreground">完了タスク</p>
                </Card>
            </motion.div>

            {/* Today's Tasks */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="space-y-4"
            >
                {totalToday === 0 ? (
                    <Card className="p-8 text-center">
                        <div className="text-4xl mb-4">🌱</div>
                        <h3 className="font-semibold text-lg mb-2">今日のタスクを決めましょう</h3>
                        <p className="text-muted-foreground text-sm mb-4">
                            計画を生成するか、手動でタスクを追加してください
                        </p>
                        <Button onClick={() => useStore.getState().generateAutoPlan()}>
                            📅 計画を自動生成
                        </Button>
                    </Card>
                ) : (
                    <>
                        {inputTasks.length > 0 && (
                            <div>
                                <h3 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground mb-3">
                                    <BookOpen className="h-4 w-4" />
                                    インプット学習
                                </h3>
                                <div className="space-y-3">
                                    {inputTasks.map((task, index) => (
                                        <TaskCard key={task.id} task={task} index={index} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {outputTasks.length > 0 && (
                            <div>
                                <h3 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground mb-3">
                                    <Target className="h-4 w-4" />
                                    演習・過去問
                                </h3>
                                <div className="space-y-3">
                                    {outputTasks.map((task, index) => (
                                        <TaskCard key={task.id} task={task} index={index} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </motion.div>
        </div>
    )
}
