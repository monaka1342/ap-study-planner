import { motion, AnimatePresence } from 'framer-motion'
import { X, Moon, Sun, Save, RotateCcw } from 'lucide-react'
import { useStore } from '../stores/useStore'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { useState } from 'react'

export default function SettingsModal() {
    const { settings, settingsOpen, setSettingsOpen, updateSettings, toggleDarkMode, restoreFromBackup, createBackup } = useStore()
    const [examDate, setExamDate] = useState(settings.examDate)
    const [dailyTarget, setDailyTarget] = useState(settings.dailyTargetMinutes)
    const [showRestoreConfirm, setShowRestoreConfirm] = useState(false)

    const handleSave = () => {
        updateSettings({
            examDate,
            dailyTargetMinutes: dailyTarget,
        })
        setSettingsOpen(false)
    }

    const handleRestore = () => {
        const success = restoreFromBackup()
        if (success) {
            alert('バックアップから復元しました')
        } else {
            alert('バックアップが見つかりませんでした')
        }
        setShowRestoreConfirm(false)
    }

    const handleBackup = () => {
        createBackup()
        alert('バックアップを作成しました')
    }

    return (
        <AnimatePresence>
            {settingsOpen && (
                <>
                    {/* Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                        onClick={() => setSettingsOpen(false)}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 100 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto"
                    >
                        <Card className="rounded-b-none rounded-t-3xl p-6 border-b-0">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold">設定</h2>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => setSettingsOpen(false)}
                                    className="rounded-full"
                                >
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>

                            {/* Settings Form */}
                            <div className="space-y-6">
                                {/* Dark Mode Toggle */}
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">ダークモード</p>
                                        <p className="text-sm text-muted-foreground">画面の配色を切り替えます</p>
                                    </div>
                                    <Button
                                        size="icon"
                                        variant={settings.darkMode ? 'default' : 'outline'}
                                        onClick={toggleDarkMode}
                                        className="rounded-full"
                                    >
                                        {settings.darkMode ? (
                                            <Moon className="h-5 w-5" />
                                        ) : (
                                            <Sun className="h-5 w-5" />
                                        )}
                                    </Button>
                                </div>

                                {/* Exam Date */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        試験日
                                    </label>
                                    <input
                                        type="date"
                                        value={examDate}
                                        onChange={(e) => setExamDate(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                    />
                                </div>

                                {/* Daily Target */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        1日の目標学習時間: {dailyTarget}分
                                    </label>
                                    <input
                                        type="range"
                                        min="15"
                                        max="120"
                                        step="15"
                                        value={dailyTarget}
                                        onChange={(e) => setDailyTarget(Number(e.target.value))}
                                        className="w-full accent-primary"
                                    />
                                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                        <span>15分</span>
                                        <span>120分</span>
                                    </div>
                                </div>

                                {/* Data Management */}
                                <div className="pt-4 border-t">
                                    <p className="font-medium mb-3">データ管理</p>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleBackup}
                                            className="flex-1 gap-2"
                                        >
                                            <Save className="h-4 w-4" />
                                            バックアップ
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setShowRestoreConfirm(true)}
                                            className="flex-1 gap-2"
                                        >
                                            <RotateCcw className="h-4 w-4" />
                                            復元
                                        </Button>
                                    </div>
                                </div>

                                {/* Save Button */}
                                <Button onClick={handleSave} className="w-full" size="lg">
                                    設定を保存
                                </Button>
                            </div>

                            {/* Restore Confirmation */}
                            <AnimatePresence>
                                {showRestoreConfirm && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="absolute inset-0 bg-background/95 backdrop-blur-sm rounded-t-3xl flex flex-col items-center justify-center p-6"
                                    >
                                        <p className="text-lg font-semibold mb-2">データを復元しますか？</p>
                                        <p className="text-sm text-muted-foreground mb-6 text-center">
                                            現在のデータは上書きされます
                                        </p>
                                        <div className="flex gap-3">
                                            <Button
                                                variant="outline"
                                                onClick={() => setShowRestoreConfirm(false)}
                                            >
                                                キャンセル
                                            </Button>
                                            <Button onClick={handleRestore}>
                                                復元する
                                            </Button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </Card>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
