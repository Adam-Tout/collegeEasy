import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuthStore } from './stores/authStore'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import ConnectionTest from './pages/ConnectionTest'
import AssignmentWorkspacePage from './pages/AssignmentWorkspacePage'

function App() {
  const { isAuthenticated } = useAuthStore()
  const [restoringAuth, setRestoringAuth] = useState(true)

  useEffect(() => {
    const restore = async () => {
      try {
        const storedAuth = localStorage.getItem('canvas_auth')
        if (storedAuth && !isAuthenticated) {
          const parsed = JSON.parse(storedAuth)
          await useAuthStore.getState().login(parsed.domain, parsed.accessToken)
        }
      } catch (error) {
        console.error('Failed to restore auth:', error)
        localStorage.removeItem('canvas_auth')
      } finally {
        setRestoringAuth(false)
      }
    }
    restore()
  }, [])

  function ProtectedRoute({ element }: { element: JSX.Element }) {
    const location = useLocation()
    if (restoringAuth) {
      return (
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading...</span>
        </div>
      )
    }
    return isAuthenticated
      ? element
      : (
        <Navigate
          to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`}
          replace
        />
      )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/test-connection" element={<ConnectionTest />} />
        <Route
          path="/dashboard"
          element={<ProtectedRoute element={<DashboardPage />} />}
        />
        <Route
          path="/workspace/:courseId/:assignmentId"
          element={<ProtectedRoute element={<AssignmentWorkspacePage />} />}
        />
        <Route
          path="/"
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
