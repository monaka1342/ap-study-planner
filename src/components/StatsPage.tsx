import { motion } from 'framer-motion'
import { Card } from './ui/card'
import { useStore } from '../stores/useStore'
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
} from 'recharts'
import { format, subDays } from 'date-fns'

const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EC4899', '#64748B']

export default function StatsPage() {
    const { tasks, logs } = useStore()

    const totalMinutes = logs.reduce((acc, l) => acc + l.duration, 0)
    const totalHours = Math.floor(totalMinutes / 60)
    const completedTasks = tasks.filter((t) => t.status === 'completed').length

    // Category breakdown
    const categoryData = tasks
        .filter((t) => t.status === 'completed')
        .reduce((acc, t) => {
            const existing = acc.find((item) => item.name === t.category)
            if (existing) {
                existing.value += t.duration
            } else {
                acc.push({ name: t.category, value: t.duration })
            }
            return acc
        }, [] as { name: string; value: number }[])

    // Last 7 days chart
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = format(subDays(new Date(), 6 - i), 'yyyy-MM-dd')
        const dayLogs = logs.filter((l) => l.date === date)
        const minutes = dayLogs.reduce((acc, l) => acc + l.duration, 0)
        return {
            date: format(subDays(new Date(), 6 - i), 'M/d'),
            minutes,
        }
    })

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-xl font-bold">学習分析</h1>
            </motion.div>

            {/* Stats Cards */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-2 gap-4"
            >
                <Card className="p-5 text-center">
                    <p className="text-3xl font-bold text-primary">{totalHours}</p>
                    <p className="text-sm text-muted-foreground mt-1">累計学習時間</p>
                </Card>
                <Card className="p-5 text-center">
                    <p className="text-3xl font-bold text-emerald-500">{completedTasks}</p>
                    <p className="text-sm text-muted-foreground mt-1">完了タスク</p>
                </Card>
            </motion.div>

            {/* Weekly Chart */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <Card className="p-5">
                    <h3 className="font-semibold mb-4">直近7日間の学習時間</h3>
                    <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={last7Days}>
                                <XAxis
                                    dataKey="date"
                                    tick={{ fontSize: 12 }}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis hide />
                                <Tooltip
                                    formatter={(value: number) => [`${value}分`, '学習時間']}
                                    contentStyle={{
                                        borderRadius: '12px',
                                        border: 'none',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                    }}
                                />
                                <Bar
                                    dataKey="minutes"
                                    fill="#6366F1"
                                    radius={[6, 6, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </motion.div>

            {/* Category Pie Chart */}
            {categoryData.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <Card className="p-5">
                        <h3 className="font-semibold mb-4">カテゴリ別学習時間</h3>
                        <div className="h-48">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={categoryData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={50}
                                        outerRadius={70}
                                        paddingAngle={2}
                                        dataKey="value"
                                    >
                                        {categoryData.map((_, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={COLORS[index % COLORS.length]}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value: number) => [`${value}分`, '']}
                                        contentStyle={{
                                            borderRadius: '12px',
                                            border: 'none',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex flex-wrap justify-center gap-3 mt-4">
                            {categoryData.map((item, index) => (
                                <div key={item.name} className="flex items-center gap-2">
                                    <div
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                    />
                                    <span className="text-xs text-muted-foreground">{item.name}</span>
                                </div>
                            ))}
                        </div>
                    </Card>
                </motion.div>
            )}
        </div>
    )
}
