import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Clock, Check } from 'lucide-react'
import { useStore, Task } from '../stores/useStore'
import { Button } from './ui/button'
import { Card } from './ui/card'

interface StudyInputModalProps {
    task: Task | null
    isOpen: boolean
    onClose: () => void
}

export default function StudyInputModal({ task, isOpen, onClose }: StudyInputModalProps) {
    const { addLog, toggleTaskStatus } = useStore()
    const [hours, setHours] = useState(0)
    const [minutes, setMinutes] = useState(0)

    const handleSubmit = () => {
        if (!task) return

        const totalMinutes = hours * 60 + minutes

        if (totalMinutes > 0) {
            // ログを追加
            addLog({
                taskId: task.id,
                duration: totalMinutes,
                date: new Date().toISOString().split('T')[0],
            })

            // 基準時間以上学習したらタスクを完了にする
            if (totalMinutes >= task.duration && task.status !== 'completed') {
                toggleTaskStatus(task.id)
            }
        }

        // 入力をリセットしてモーダルを閉じる
        setHours(0)
        setMinutes(0)
        onClose()
    }

    const handleClose = () => {
        setHours(0)
        setMinutes(0)
        onClose()
    }

    const totalMinutes = hours * 60 + minutes
    const isEnoughTime = task && totalMinutes >= task.duration

    if (!task) return null

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                        onClick={handleClose}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed inset-0 flex items-center justify-center z-50 p-4"
                    >
                        <Card className="w-full max-w-sm p-6 relative">
                            {/* Close Button */}
                            <Button
                                size="icon"
                                variant="ghost"
                                onClick={handleClose}
                                className="absolute top-4 right-4 rounded-full"
                            >
                                <X className="h-5 w-5" />
                            </Button>

                            {/* Task Info */}
                            <div className="text-center mb-6">
                                <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary mb-3">
                                    {task.type}
                                </span>
                                <h2 className="text-lg font-bold leading-tight">{task.title}</h2>
                                <p className="text-sm text-muted-foreground mt-2">
                                    基準時間: {task.duration}分
                                </p>
                            </div>

                            {/* Time Input */}
                            <div className="mb-6">
                                <label className="flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground mb-4">
                                    <Clock className="h-4 w-4" />
                                    学習時間を入力
                                </label>
                                <div className="flex items-center justify-center gap-4">
                                    {/* Hours */}
                                    <div className="flex flex-col items-center">
                                        <input
                                            type="number"
                                            min="0"
                                            max="12"
                                            value={hours}
                                            onChange={(e) => setHours(Math.max(0, parseInt(e.target.value) || 0))}
                                            className="w-20 h-16 text-3xl font-bold text-center rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none bg-background"
                                        />
                                        <span className="text-xs text-muted-foreground mt-1">時間</span>
                                    </div>
                                    <span className="text-3xl font-bold text-muted-foreground">:</span>
                                    {/* Minutes */}
                                    <div className="flex flex-col items-center">
                                        <input
                                            type="number"
                                            min="0"
                                            max="59"
                                            value={minutes}
                                            onChange={(e) => setMinutes(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                                            className="w-20 h-16 text-3xl font-bold text-center rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none bg-background"
                                        />
                                        <span className="text-xs text-muted-foreground mt-1">分</span>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Buttons */}
                            <div className="flex justify-center gap-2 mb-6">
                                {[15, 30, 45, 60].map((m) => (
                                    <Button
                                        key={m}
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                            if (m >= 60) {
                                                setHours(Math.floor(m / 60))
                                                setMinutes(m % 60)
                                            } else {
                                                setHours(0)
                                                setMinutes(m)
                                            }
                                        }}
                                        className="text-xs"
                                    >
                                        {m >= 60 ? `${m / 60}h` : `${m}分`}
                                    </Button>
                                ))}
                            </div>

                            {/* Status Message */}
                            {totalMinutes > 0 && (
                                <div className={`text-center text-sm mb-4 p-2 rounded-lg ${isEnoughTime
                                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                                        : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                                    }`}>
                                    {isEnoughTime ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <Check className="h-4 w-4" />
                                            基準時間クリア！タスクが完了になります
                                        </span>
                                    ) : (
                                        <span>
                                            あと{task.duration - totalMinutes}分で基準時間クリア
                                        </span>
                                    )}
                                </div>
                            )}

                            {/* Submit Button */}
                            <Button
                                onClick={handleSubmit}
                                disabled={totalMinutes === 0}
                                className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
                            >
                                記録する
                            </Button>
                        </Card>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
