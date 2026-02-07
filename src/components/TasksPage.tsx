import { motion } from 'framer-motion'
import { Plus, BookOpen, Target } from 'lucide-react'
import { useStore, Task } from '../stores/useStore'
import { Card } from './ui/card'
import { Button } from './ui/button'
import TaskCard from './TaskCard'
import { useState } from 'react'

interface TasksPageProps {
    onPlayTask?: (task: Task) => void
}

export default function TasksPage({ onPlayTask }: TasksPageProps) {
    const { tasks } = useStore()
    const [activeTab, setActiveTab] = useState<'input' | 'output'>('input')

    const todoTasks = tasks.filter((t) => t.status !== 'completed')
        .sort((a, b) => a.date.localeCompare(b.date))

    const inputTasks = todoTasks.filter(
        (t) => t.type === 'インプット' || t.title.includes('学習')
    )
    const outputTasks = todoTasks.filter(
        (t) => t.type !== 'インプット' && !t.title.includes('学習')
    )

    const displayTasks = activeTab === 'input' ? inputTasks : outputTasks

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between"
            >
                <h1 className="text-xl font-bold">タスク管理</h1>
                <Button size="sm" className="gap-2">
                    <Plus className="h-4 w-4" />
                    新規作成
                </Button>
            </motion.div>

            {/* Tab Switcher */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <Card className="p-1 flex gap-1">
                    <button
                        onClick={() => setActiveTab('input')}
                        className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${activeTab === 'input'
                            ? 'bg-primary text-white shadow-lg shadow-primary/25'
                            : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        <BookOpen className="h-4 w-4" />
                        インプット
                    </button>
                    <button
                        onClick={() => setActiveTab('output')}
                        className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${activeTab === 'output'
                            ? 'bg-primary text-white shadow-lg shadow-primary/25'
                            : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        <Target className="h-4 w-4" />
                        演習
                    </button>
                </Card>
            </motion.div>

            {/* Task List */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="space-y-3"
            >
                {displayTasks.length === 0 ? (
                    <Card className="p-8 text-center">
                        <p className="text-muted-foreground">
                            {activeTab === 'input'
                                ? 'インプットタスクはありません'
                                : '演習タスクはありません'}
                        </p>
                    </Card>
                ) : (
                    displayTasks.map((task, index) => (
                        <TaskCard key={task.id} task={task} index={index} onPlay={onPlayTask} />
                    ))
                )}
            </motion.div>
        </div>
    )
}
