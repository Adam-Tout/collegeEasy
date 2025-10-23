import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../stores/userStore';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Edit, 
  Check, 
  X, 
  CreditCard, 
  Crown,
  Shield,
  Zap,
  Users,
  Settings as SettingsIcon,
  BookOpen,
  AlertCircle
} from 'lucide-react';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, addCanvasAccount, removeCanvasAccount, setActiveCanvasAccount, updateProfile, cancelSubscription } = useUserStore();
  const [activeTab, setActiveTab] = useState<'canvas' | 'subscription' | 'profile'>('canvas');
  const [isAddingCanvas, setIsAddingCanvas] = useState(false);
  const [newCanvasAccount, setNewCanvasAccount] = useState({
    domain: '',
    accessToken: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAddCanvasAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCanvasAccount.domain || !newCanvasAccount.accessToken) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      await addCanvasAccount({
        domain: newCanvasAccount.domain,
        accessToken: newCanvasAccount.accessToken,
        isActive: true
      });
      setNewCanvasAccount({ domain: '', accessToken: '' });
      setIsAddingCanvas(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveCanvasAccount = async (accountId: string) => {
    if (!confirm('Are you sure you want to remove this Canvas account?')) return;
    
    setIsLoading(true);
    try {
      await removeCanvasAccount(accountId);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetActiveCanvas = async (accountId: string) => {
    setIsLoading(true);
    try {
      await setActiveCanvasAccount(accountId);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getPlanFeatures = (plan: string) => {
    const features = {
      free: ['Basic Canvas integration', 'Limited AI queries (10/month)', 'Basic support'],
      basic: ['Unlimited Canvas accounts', 'AI assistant', 'Priority support', 'Advanced analytics'],
      premium: ['Everything in Basic', 'Unlimited AI queries', 'Advanced study planning', 'Custom integrations'],
      enterprise: ['Everything in Premium', 'Team collaboration', 'Custom branding', 'Dedicated support']
    };
    return features[plan as keyof typeof features] || features.free;
  };

  const getPlanPrice = (plan: string) => {
    const prices = {
      free: '$0',
      basic: '$9.99/month',
      premium: '$19.99/month',
      enterprise: 'Contact us'
    };
    return prices[plan as keyof typeof prices] || prices.free;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-primary-50">
      {/* Header */}
      <header className="glass-effect border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 text-neutral-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="bg-primary-100 p-2 rounded-lg">
                  <SettingsIcon className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-neutral-900">Settings</h1>
                  <p className="text-sm text-neutral-600">Manage your account and preferences</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab('canvas')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === 'canvas' 
                    ? 'bg-primary-100 text-primary-700 border border-primary-200' 
                    : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                <BookOpen className="h-5 w-5" />
                <span>Canvas Accounts</span>
              </button>
              
              <button
                onClick={() => setActiveTab('subscription')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === 'subscription' 
                    ? 'bg-primary-100 text-primary-700 border border-primary-200' 
                    : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                <Crown className="h-5 w-5" />
                <span>Subscription</span>
              </button>
              
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === 'profile' 
                    ? 'bg-primary-100 text-primary-700 border border-primary-200' 
                    : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                <Shield className="h-5 w-5" />
                <span>Profile</span>
              </button>
            </nav>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'canvas' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-neutral-900">Canvas Accounts</h2>
                    <p className="text-neutral-600">Manage your Canvas integrations</p>
                  </div>
                  <button
                    onClick={() => setIsAddingCanvas(true)}
                    className="btn-primary flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Account
                  </button>
                </div>

                {error && (
                  <div className="status-error p-4 rounded-lg">
                    {error}
                  </div>
                )}

                {/* Add Canvas Account Form */}
                {isAddingCanvas && (
                  <div className="card p-6">
                    <h3 className="text-lg font-semibold text-neutral-900 mb-4">Add Canvas Account</h3>
                    <form onSubmit={handleAddCanvasAccount} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          Canvas Domain
                        </label>
                        <input
                          type="text"
                          value={newCanvasAccount.domain}
                          onChange={(e) => setNewCanvasAccount(prev => ({ ...prev, domain: e.target.value }))}
                          placeholder="your-school.instructure.com"
                          className="input-field"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          Access Token
                        </label>
                        <input
                          type="password"
                          value={newCanvasAccount.accessToken}
                          onChange={(e) => setNewCanvasAccount(prev => ({ ...prev, accessToken: e.target.value }))}
                          placeholder="Your Canvas API access token"
                          className="input-field"
                          required
                        />
                      </div>
                      <div className="flex space-x-3">
                        <button
                          type="submit"
                          disabled={isLoading}
                          className="btn-primary flex items-center"
                        >
                          {isLoading ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          ) : (
                            <Check className="h-4 w-4 mr-2" />
                          )}
                          Add Account
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsAddingCanvas(false);
                            setNewCanvasAccount({ domain: '', accessToken: '' });
                            setError('');
                          }}
                          className="btn-outline flex items-center"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Canvas Accounts List */}
                <div className="space-y-4">
                  {user?.canvasAccounts?.length === 0 ? (
                    <div className="card p-8 text-center">
                      <BookOpen className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-neutral-900 mb-2">No Canvas Accounts</h3>
                      <p className="text-neutral-600 mb-4">Connect your Canvas account to get started</p>
                      <button
                        onClick={() => setIsAddingCanvas(true)}
                        className="btn-primary"
                      >
                        Add Your First Account
                      </button>
                    </div>
                  ) : (
                    user?.canvasAccounts?.map((account) => (
                      <div key={account.id} className="card p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className={`p-3 rounded-lg ${
                              account.isActive ? 'bg-primary-100' : 'bg-neutral-100'
                            }`}>
                              <BookOpen className={`h-6 w-6 ${
                                account.isActive ? 'text-primary-600' : 'text-neutral-400'
                              }`} />
                            </div>
                            <div>
                              <h3 className="font-semibold text-neutral-900">{account.domain}</h3>
                              <p className="text-sm text-neutral-600">
                                {account.isActive ? 'Active' : 'Inactive'} • 
                                Added {new Date(account.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {!account.isActive && (
                              <button
                                onClick={() => handleSetActiveCanvas(account.id)}
                                disabled={isLoading}
                                className="px-3 py-1 bg-primary-100 text-primary-700 rounded-md text-sm font-medium hover:bg-primary-200 transition-colors"
                              >
                                Activate
                              </button>
                            )}
                            <button
                              onClick={() => handleRemoveCanvasAccount(account.id)}
                              disabled={isLoading}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'subscription' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-neutral-900">Subscription</h2>
                  <p className="text-neutral-600">Manage your subscription and billing</p>
                </div>

                {user?.subscription && (
                  <div className="card p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-3">
                        <div className="bg-primary-100 p-3 rounded-lg">
                          <Crown className="h-6 w-6 text-primary-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-neutral-900 capitalize">
                            {user.subscription.plan} Plan
                          </h3>
                          <p className="text-neutral-600">
                            {getPlanPrice(user.subscription.plan)} • 
                            Status: <span className="capitalize">{user.subscription.status}</span>
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-neutral-600">Next billing</p>
                        <p className="font-semibold text-neutral-900">
                          {new Date(user.subscription.currentPeriodEnd).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-neutral-900 mb-3">Plan Features</h4>
                        <ul className="space-y-2">
                          {getPlanFeatures(user.subscription.plan).map((feature, index) => (
                            <li key={index} className="flex items-center space-x-2 text-sm text-neutral-600">
                              <Check className="h-4 w-4 text-green-600" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-neutral-900 mb-3">Actions</h4>
                        <div className="space-y-3">
                          <button className="btn-outline w-full flex items-center justify-center">
                            <CreditCard className="h-4 w-4 mr-2" />
                            Update Payment Method
                          </button>
                          {user.subscription.status === 'active' && (
                            <button
                              onClick={() => {
                                if (confirm('Are you sure you want to cancel your subscription?')) {
                                  cancelSubscription();
                                }
                              }}
                              className="w-full px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                            >
                              Cancel Subscription
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Upgrade Options */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="card p-6">
                    <div className="text-center mb-4">
                      <h3 className="text-lg font-semibold text-neutral-900">Basic</h3>
                      <p className="text-3xl font-bold text-neutral-900">$9.99</p>
                      <p className="text-neutral-600">per month</p>
                    </div>
                    <ul className="space-y-2 mb-6">
                      <li className="flex items-center space-x-2 text-sm text-neutral-600">
                        <Check className="h-4 w-4 text-green-600" />
                        <span>Unlimited Canvas accounts</span>
                      </li>
                      <li className="flex items-center space-x-2 text-sm text-neutral-600">
                        <Check className="h-4 w-4 text-green-600" />
                        <span>AI assistant</span>
                      </li>
                      <li className="flex items-center space-x-2 text-sm text-neutral-600">
                        <Check className="h-4 w-4 text-green-600" />
                        <span>Priority support</span>
                      </li>
                    </ul>
                    <button className="btn-outline w-full">Upgrade to Basic</button>
                  </div>

                  <div className="card p-6 border-2 border-primary-200 relative">
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-primary-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                        Popular
                      </span>
                    </div>
                    <div className="text-center mb-4">
                      <h3 className="text-lg font-semibold text-neutral-900">Premium</h3>
                      <p className="text-3xl font-bold text-neutral-900">$19.99</p>
                      <p className="text-neutral-600">per month</p>
                    </div>
                    <ul className="space-y-2 mb-6">
                      <li className="flex items-center space-x-2 text-sm text-neutral-600">
                        <Check className="h-4 w-4 text-green-600" />
                        <span>Everything in Basic</span>
                      </li>
                      <li className="flex items-center space-x-2 text-sm text-neutral-600">
                        <Check className="h-4 w-4 text-green-600" />
                        <span>Unlimited AI queries</span>
                      </li>
                      <li className="flex items-center space-x-2 text-sm text-neutral-600">
                        <Check className="h-4 w-4 text-green-600" />
                        <span>Advanced study planning</span>
                      </li>
                    </ul>
                    <button className="btn-primary w-full">Upgrade to Premium</button>
                  </div>

                  <div className="card p-6">
                    <div className="text-center mb-4">
                      <h3 className="text-lg font-semibold text-neutral-900">Enterprise</h3>
                      <p className="text-3xl font-bold text-neutral-900">Custom</p>
                      <p className="text-neutral-600">pricing</p>
                    </div>
                    <ul className="space-y-2 mb-6">
                      <li className="flex items-center space-x-2 text-sm text-neutral-600">
                        <Check className="h-4 w-4 text-green-600" />
                        <span>Everything in Premium</span>
                      </li>
                      <li className="flex items-center space-x-2 text-sm text-neutral-600">
                        <Check className="h-4 w-4 text-green-600" />
                        <span>Team collaboration</span>
                      </li>
                      <li className="flex items-center space-x-2 text-sm text-neutral-600">
                        <Check className="h-4 w-4 text-green-600" />
                        <span>Custom integrations</span>
                      </li>
                    </ul>
                    <button className="btn-outline w-full">Contact Sales</button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-neutral-900">Profile Settings</h2>
                  <p className="text-neutral-600">Manage your personal information</p>
                </div>

                <div className="card p-6">
                  <form className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          Full Name
                        </label>
                        <input
                          type="text"
                          defaultValue={user?.name || ''}
                          className="input-field"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          defaultValue={user?.email || ''}
                          className="input-field"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Current Password
                      </label>
                      <input
                        type="password"
                        className="input-field"
                        placeholder="Enter current password"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          New Password
                        </label>
                        <input
                          type="password"
                          className="input-field"
                          placeholder="Enter new password"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          className="input-field"
                          placeholder="Confirm new password"
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <button className="btn-primary">
                        Save Changes
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
