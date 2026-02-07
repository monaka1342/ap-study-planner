import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Play, Pause, Square } from 'lucide-react'
import { useStore, Task } from '../stores/useStore'
import { Button } from './ui/button'
import { Card } from './ui/card'

interface TimerModalProps {
    task: Task | null
    isOpen: boolean
    onClose: () => void
}

export default function TimerModal({ task, isOpen, onClose }: TimerModalProps) {
    const { addLog, toggleTaskStatus } = useStore()
    const [isRunning, setIsRunning] = useState(true)
    const [elapsedSeconds, setElapsedSeconds] = useState(0)
    const startTimeRef = useRef<number>(Date.now())
    const pausedTimeRef = useRef<number>(0)
    const intervalRef = useRef<NodeJS.Timeout | null>(null)

    useEffect(() => {
        if (isOpen && task) {
            // 新しいタイマーを開始
            startTimeRef.current = Date.now()
            pausedTimeRef.current = 0
            setElapsedSeconds(0)
            setIsRunning(true)
        }
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
            }
        }
    }, [isOpen, task])

    useEffect(() => {
        if (isRunning && isOpen) {
            intervalRef.current = setInterval(() => {
                const now = Date.now()
                const elapsed = Math.floor((now - startTimeRef.current - pausedTimeRef.current) / 1000)
                setElapsedSeconds(elapsed)
            }, 1000)
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
            }
        }
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
            }
        }
    }, [isRunning, isOpen])

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    const handleToggle = () => {
        if (isRunning) {
            // 一時停止
            pausedTimeRef.current += Date.now() - startTimeRef.current - pausedTimeRef.current - (elapsedSeconds * 1000)
        }
        setIsRunning(!isRunning)
    }

    const handleStop = () => {
        if (!task) return

        // 経過時間を分に変換
        const minutes = Math.round(elapsedSeconds / 60)

        if (minutes > 0) {
            // ログを追加
            addLog({
                taskId: task.id,
                duration: minutes,
                date: new Date().toISOString().split('T')[0],
            })

            // タスクを完了にするか確認
            if (task.status !== 'completed') {
                toggleTaskStatus(task.id)
            }
        }

        onClose()
    }

    const handleClose = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current)
        }
        onClose()
    }

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
                            <div className="text-center mb-8">
                                <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary mb-3">
                                    {task.type}
                                </span>
                                <h2 className="text-lg font-bold leading-tight">{task.title}</h2>
                            </div>

                            {/* Timer Display */}
                            <div className="text-center mb-8">
                                <motion.div
                                    key={elapsedSeconds}
                                    initial={{ scale: 1.05 }}
                                    animate={{ scale: 1 }}
                                    className="text-6xl font-mono font-bold tracking-wider"
                                >
                                    {formatTime(elapsedSeconds)}
                                </motion.div>
                                <p className="text-sm text-muted-foreground mt-2">
                                    {isRunning ? '学習中...' : '一時停止中'}
                                </p>
                            </div>

                            {/* Controls */}
                            <div className="flex justify-center gap-4">
                                <Button
                                    size="lg"
                                    variant="outline"
                                    onClick={handleToggle}
                                    className="w-16 h-16 rounded-full"
                                >
                                    {isRunning ? (
                                        <Pause className="h-8 w-8" />
                                    ) : (
                                        <Play className="h-8 w-8 ml-1" />
                                    )}
                                </Button>
                                <Button
                                    size="lg"
                                    onClick={handleStop}
                                    className="w-16 h-16 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
                                >
                                    <Square className="h-6 w-6" />
                                </Button>
                            </div>

                            {/* Elapsed Info */}
                            <p className="text-center text-xs text-muted-foreground mt-6">
                                学習時間は停止ボタンを押すと記録されます
                            </p>
                        </Card>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
