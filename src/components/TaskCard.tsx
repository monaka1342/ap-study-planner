import { motion } from 'framer-motion'
import { Check, Play, Clock } from 'lucide-react'
import { useStore, Task } from '../stores/useStore'
import { Card } from './ui/card'
import { Button } from './ui/button'
import { cn } from '../lib/utils'

interface TaskCardProps {
    task: Task
    index: number
}

const categoryColors: Record<string, string> = {
    'テクノロジ': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    'マネジメント': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    'ストラテジ': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    '過去問': 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
    '午後演習': 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
}

export default function TaskCard({ task, index }: TaskCardProps) {
    const { toggleTaskStatus } = useStore()
    const isCompleted = task.status === 'completed'

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
        >
            <Card
                className={cn(
                    'p-4 flex items-start gap-4 cursor-pointer group',
                    isCompleted && 'opacity-50'
                )}
            >
                {/* Checkbox */}
                <button
                    onClick={() => toggleTaskStatus(task.id)}
                    className={cn(
                        'w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all flex-shrink-0 mt-0.5',
                        isCompleted
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : 'border-gray-300 dark:border-gray-600 group-hover:border-primary'
                    )}
                >
                    {isCompleted && <Check className="h-4 w-4" />}
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <h4
                        className={cn(
                            'font-medium text-sm leading-tight',
                            isCompleted && 'line-through text-muted-foreground'
                        )}
                    >
                        {task.title}
                    </h4>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span
                            className={cn(
                                'px-2 py-0.5 rounded-full text-xs font-medium',
                                categoryColors[task.category] || categoryColors['過去問']
                            )}
                        >
                            {task.category}
                        </span>
                        <span className="text-xs text-muted-foreground">{task.type}</span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {task.duration}分
                        </span>
                    </div>
                </div>

                {/* Play Button */}
                {!isCompleted && (
                    <Button
                        size="icon"
                        variant="ghost"
                        className="h-10 w-10 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white flex-shrink-0"
                    >
                        <Play className="h-4 w-4 ml-0.5" />
                    </Button>
                )}
            </Card>
        </motion.div>
    )
}
