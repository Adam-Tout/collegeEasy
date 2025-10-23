import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useUserStore } from './stores/userStore'
import { useAuthStore } from './stores/authStore'
import AuthPage from './pages/AuthPage'
import DashboardPage from './pages/DashboardPage'
import SettingsPage from './pages/SettingsPage'
import ConnectionTest from './pages/ConnectionTest'
import AssignmentWorkspacePage from './pages/AssignmentWorkspacePage'

function App() {
  const { isAuthenticated: userAuthenticated, user } = useUserStore()
  const { isAuthenticated: canvasAuthenticated } = useAuthStore()
  
  // Suppress unused variable warning for future use
  void canvasAuthenticated
  const [restoringAuth, setRestoringAuth] = useState(true)

  useEffect(() => {
    const restore = async () => {
      try {
        // Check if user is authenticated
        if (userAuthenticated && user) {
          // Try to restore Canvas auth if user has active Canvas accounts
          const activeCanvasAccount = user.canvasAccounts?.find(acc => acc.isActive)
          if (activeCanvasAccount) {
            try {
              await useAuthStore.getState().login(activeCanvasAccount.domain, activeCanvasAccount.accessToken)
            } catch (error) {
              console.warn('Failed to restore Canvas auth:', error)
            }
          }
        }
      } catch (error) {
        console.error('Failed to restore auth:', error)
      } finally {
        setRestoringAuth(false)
      }
    }
    restore()
  }, [userAuthenticated, user])

  function ProtectedRoute({ element }: { element: JSX.Element }) {
    const location = useLocation()
    if (restoringAuth) {
      return (
        <div className="flex items-center justify-center h-screen gradient-bg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <span className="text-neutral-600 text-lg">Loading your dashboard...</span>
          </div>
        </div>
      )
    }
    return userAuthenticated
      ? element
      : (
        <Navigate
          to={`/auth?redirect=${encodeURIComponent(location.pathname + location.search)}`}
          replace
        />
      )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/test-connection" element={<ConnectionTest />} />
        <Route
          path="/dashboard"
          element={<ProtectedRoute element={<DashboardPage />} />}
        />
        <Route
          path="/settings"
          element={<ProtectedRoute element={<SettingsPage />} />}
        />
        <Route
          path="/workspace/:courseId/:assignmentId"
          element={<ProtectedRoute element={<AssignmentWorkspacePage />} />}
        />
        <Route
          path="/"
          element={
            userAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/auth" replace />
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
