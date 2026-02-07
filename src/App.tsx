import { useState } from 'react'
import { useStore, Task } from './stores/useStore'
import Dashboard from './components/Dashboard'
import TasksPage from './components/TasksPage'
import StatsPage from './components/StatsPage'
import BottomNav from './components/BottomNav'
import SettingsModal from './components/SettingsModal'
import TimerModal from './components/TimerModal'

function App() {
  const { activeTab } = useStore()
  const [timerTask, setTimerTask] = useState<Task | null>(null)
  const [isTimerOpen, setIsTimerOpen] = useState(false)

  const handlePlayTask = (task: Task) => {
    setTimerTask(task)
    setIsTimerOpen(true)
  }

  const handleCloseTimer = () => {
    setIsTimerOpen(false)
    setTimerTask(null)
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <main className="max-w-md mx-auto px-4 py-6">
        {activeTab === 'home' && <Dashboard onPlayTask={handlePlayTask} />}
        {activeTab === 'tasks' && <TasksPage onPlayTask={handlePlayTask} />}
        {activeTab === 'stats' && <StatsPage />}
      </main>
      <BottomNav />
      <SettingsModal />
      <TimerModal
        task={timerTask}
        isOpen={isTimerOpen}
        onClose={handleCloseTimer}
      />
    </div>
  )
}

export default App
