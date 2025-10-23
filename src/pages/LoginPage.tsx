import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { CanvasService } from '../services/canvasService'
import { BookOpen, LogIn, Play } from 'lucide-react'
import { demoUser } from '../data/demoData'

export default function LoginPage() {
  const [domain, setDomain] = useState('')
  const [accessToken, setAccessToken] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { login } = useAuthStore()
  const googleButtonRef = useRef<HTMLDivElement | null>(null)
  const navigate = useNavigate()
  const location = useLocation()
  const params = new URLSearchParams(location.search)
  const redirectTo = params.get('redirect') || '/dashboard'

  useEffect(() => {
    const clientId = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID
    const google = (window as any).google
    if (clientId && google && googleButtonRef.current) {
      google.accounts.id.initialize({
        client_id: clientId,
        callback: async () => {
          try {
            await login('demo.instructure.com', 'demo_token_12345')
            useAuthStore.getState().setUser({
              id: 1,
              name: 'Demo User',
              sortable_name: 'Demo User',
              short_name: 'Demo',
              email: 'demo@example.com',
              login_id: 'demo@example.com',
              avatar_url: '',
              primary_email: 'demo@example.com'
            })
            navigate(redirectTo)
          } catch (err) {
            console.error('Google login error:', err)
            setError('Google login failed. Please try Canvas credentials or Demo Mode.')
          }
        },
        auto_select: false
      })
      google.accounts.id.renderButton(googleButtonRef.current, {
        theme: 'outline',
        size: 'large',
        text: 'continue_with',
        shape: 'pill',
      })
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // Test the Canvas API connection
      const canvasService = new CanvasService(accessToken, domain)
      const user = await canvasService.getUser()
       
      // If successful, login and store credentials
      await login(domain, accessToken)
      
      // Store user info
      useAuthStore.getState().setUser(user)
      // Redirect to intended page
      navigate(redirectTo)
      
    } catch (err: any) {
      const msg = err?.message ? err.message : 'Failed to connect to Canvas. Please check your domain and access token.'
      setError(msg)
      console.error('Login error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoMode = async () => {
    setIsLoading(true)
    setError('')

    try {
      // Simulate Canvas login with demo data
      await login('demo.instructure.com', 'demo_token_12345')
      useAuthStore.getState().setUser({
        id: 1,
        name: 'Demo User',
        sortable_name: 'Demo User',
        short_name: 'Demo',
        email: 'demo@example.com',
        login_id: 'demo@example.com',
        avatar_url: '',
        primary_email: 'demo@example.com'
      })
      navigate(redirectTo)
    } catch (err) {
      setError('Failed to initialize demo mode.')
      console.error('Demo mode error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-600 p-3 rounded-full">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Canvas Student Dashboard</h1>
          <p className="text-gray-600">Connect your Canvas account to get started</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="domain" className="block text-sm font-medium text-gray-700 mb-1">
                Canvas Domain
              </label>
              <input
                id="domain"
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="your-school.instructure.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Your school's Canvas domain (without https://)
              </p>
            </div>

            <div>
              <label htmlFor="token" className="block text-sm font-medium text-gray-700 mb-1">
                Access Token
              </label>
              <input
                id="token"
                type="password"
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
                placeholder="Your Canvas API access token"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Get your token from Canvas → Account → Settings → Approved Integrations → New Access Token
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Connecting...
                </div>
              ) : (
                <>
                  <LogIn className="h-4 w-4 mr-2" />
                  Connect to Canvas
                </>
              )}
            </button>
          </form>

          <div className="mt-4 grid grid-cols-1 gap-3">
            <button
              onClick={handleDemoMode}
              disabled={isLoading}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Loading...
                </div>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Try Demo Mode
                </>
              )}
            </button>
            <div className="flex items-center justify-center">
              <div id="google-login" ref={googleButtonRef} />
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-md">
            <h3 className="text-sm font-medium text-blue-900 mb-2">Demo Instructions:</h3>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• Get your Canvas access token from your Canvas account settings</li>
              <li>• Enter your school's Canvas domain (e.g., school.instructure.com)</li>
              <li>• Or click "Try Demo Mode" or "Continue with Google" to see the app with sample data</li>
              <li>• The dashboard will show your upcoming assignments and AI chat</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}