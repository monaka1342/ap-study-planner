import { useStore } from './stores/useStore'
import Dashboard from './components/Dashboard'
import TasksPage from './components/TasksPage'
import StatsPage from './components/StatsPage'
import BottomNav from './components/BottomNav'
import SettingsModal from './components/SettingsModal'

function App() {
  const { activeTab } = useStore()

  return (
    <div className="min-h-screen bg-background pb-24">
      <main className="max-w-md mx-auto px-4 py-6">
        {activeTab === 'home' && <Dashboard />}
        {activeTab === 'tasks' && <TasksPage />}
        {activeTab === 'stats' && <StatsPage />}
      </main>
      <BottomNav />
      <SettingsModal />
    </div>
  )
}

export default App
