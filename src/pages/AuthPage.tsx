import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../stores/userStore';
import { BookOpen, Mail, Lock, User, Eye, EyeOff, ArrowRight, Sparkles } from 'lucide-react';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });
  
  const { login, register, isLoading, error, clearError } = useUserStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    try {
      if (isLogin) {
        await login({ email: formData.email, password: formData.password });
      } else {
        await register({ 
          email: formData.email, 
          password: formData.password, 
          name: formData.name 
        });
      }
      navigate('/dashboard');
    } catch (error) {
      // Error is handled by the store
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) clearError();
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({ email: '', password: '', name: '' });
    clearError();
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="bg-gradient-to-r from-primary-600 to-secondary-600 p-4 rounded-2xl shadow-2xl">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 bg-accent-500 p-2 rounded-full">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gradient mb-2">
            Canvas AI Assistant
          </h1>
          <p className="text-neutral-600 text-lg">
            {isLogin ? 'Welcome back!' : 'Start your journey with AI-powered learning'}
          </p>
        </div>

        {/* Auth Form */}
        <div className="card-elevated p-8 animate-slide-in-right">
          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-neutral-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
                  <input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="input-field pl-10"
                    placeholder="Enter your full name"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-neutral-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="input-field pl-10"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-neutral-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="input-field pl-10 pr-10"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="status-error p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              ) : (
                <ArrowRight className="h-5 w-5 mr-2" />
              )}
              {isLoading 
                ? 'Processing...' 
                : isLogin 
                  ? 'Sign In' 
                  : 'Create Account'
              }
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={toggleMode}
              className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
            >
              {isLogin 
                ? "Don't have an account? Sign up" 
                : "Already have an account? Sign in"
              }
            </button>
          </div>
        </div>

        {/* Demo Mode */}
        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setFormData({ email: 'demo@example.com', password: 'demo123', name: 'Demo User' });
              setIsLogin(true);
            }}
            className="btn-outline w-full"
          >
            Try Demo Mode
          </button>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-1 gap-4 text-center">
          <div className="flex items-center justify-center space-x-2 text-neutral-600">
            <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
            <span className="text-sm">AI-powered assignment assistance</span>
          </div>
          <div className="flex items-center justify-center space-x-2 text-neutral-600">
            <div className="w-2 h-2 bg-secondary-500 rounded-full"></div>
            <span className="text-sm">Smart Canvas integration</span>
          </div>
          <div className="flex items-center justify-center space-x-2 text-neutral-600">
            <div className="w-2 h-2 bg-accent-500 rounded-full"></div>
            <span className="text-sm">Advanced study planning</span>
          </div>
        </div>
      </div>
    </div>
  );
}
