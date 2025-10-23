import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, AuthState, LoginCredentials, RegisterCredentials, CanvasAccount, Subscription } from '../types/user';

interface UserStore extends AuthState {
  // Auth actions
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  
  // User management
  updateProfile: (updates: Partial<User>) => Promise<void>;
  addCanvasAccount: (account: Omit<CanvasAccount, 'id' | 'createdAt'>) => Promise<void>;
  removeCanvasAccount: (accountId: string) => Promise<void>;
  setActiveCanvasAccount: (accountId: string) => Promise<void>;
  
  // Subscription management
  updateSubscription: (subscription: Subscription) => void;
  cancelSubscription: () => Promise<void>;
  
  // Utility
  clearError: () => void;
}

// Mock API service - replace with real API calls
class UserAPIService {
  private baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

  async login(credentials: LoginCredentials): Promise<User> {
    // Mock implementation - replace with real API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (credentials.email === 'demo@example.com' && credentials.password === 'demo123') {
      return {
        id: '1',
        email: 'demo@example.com',
        name: 'Demo User',
        avatar: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        subscription: {
          id: 'sub_1',
          plan: 'premium',
          status: 'active',
          currentPeriodStart: new Date().toISOString(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          cancelAtPeriodEnd: false,
          features: ['unlimited_canvas_accounts', 'ai_assistant', 'priority_support']
        },
        canvasAccounts: []
      };
    }
    
    throw new Error('Invalid credentials');
  }

  async register(credentials: RegisterCredentials): Promise<User> {
    // Mock implementation - replace with real API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      id: Math.random().toString(36).substr(2, 9),
      email: credentials.email,
      name: credentials.name,
      avatar: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      subscription: {
        id: 'sub_free',
        plan: 'free',
        status: 'active',
        currentPeriodStart: new Date().toISOString(),
        currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        cancelAtPeriodEnd: false,
        features: ['basic_canvas_integration', 'limited_ai_queries']
      },
      canvasAccounts: []
    };
  }

  async refreshUser(userId: string): Promise<User> {
    // Mock implementation - replace with real API
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      id: userId,
      email: 'demo@example.com',
      name: 'Demo User',
      avatar: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      subscription: {
        id: 'sub_1',
        plan: 'premium',
        status: 'active',
        currentPeriodStart: new Date().toISOString(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        cancelAtPeriodEnd: false,
        features: ['unlimited_canvas_accounts', 'ai_assistant', 'priority_support']
      },
      canvasAccounts: []
    };
  }

  async updateProfile(userId: string, updates: Partial<User>): Promise<User> {
    // Mock implementation - replace with real API
    await new Promise(resolve => setTimeout(resolve, 500));
    throw new Error('Not implemented - replace with real API');
  }

  async addCanvasAccount(userId: string, account: Omit<CanvasAccount, 'id' | 'createdAt'>): Promise<CanvasAccount> {
    // Mock implementation - replace with real API
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      id: Math.random().toString(36).substr(2, 9),
      ...account,
      createdAt: new Date().toISOString()
    };
  }

  async removeCanvasAccount(userId: string, accountId: string): Promise<void> {
    // Mock implementation - replace with real API
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  async cancelSubscription(userId: string): Promise<void> {
    // Mock implementation - replace with real API
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}

const apiService = new UserAPIService();

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true, error: null });
        try {
          const user = await apiService.login(credentials);
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      register: async (credentials: RegisterCredentials) => {
        set({ isLoading: true, error: null });
        try {
          const user = await apiService.register(credentials);
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      logout: () => {
        set({ user: null, isAuthenticated: false, error: null });
      },

      refreshUser: async () => {
        const { user } = get();
        if (!user) return;
        
        set({ isLoading: true });
        try {
          const refreshedUser = await apiService.refreshUser(user.id);
          set({ user: refreshedUser, isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      updateProfile: async (updates: Partial<User>) => {
        const { user } = get();
        if (!user) return;
        
        set({ isLoading: true });
        try {
          const updatedUser = await apiService.updateProfile(user.id, updates);
          set({ user: updatedUser, isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      addCanvasAccount: async (account: Omit<CanvasAccount, 'id' | 'createdAt'>) => {
        const { user } = get();
        if (!user) return;
        
        set({ isLoading: true });
        try {
          const newAccount = await apiService.addCanvasAccount(user.id, account);
          const updatedUser = {
            ...user,
            canvasAccounts: [...user.canvasAccounts, newAccount]
          };
          set({ user: updatedUser, isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      removeCanvasAccount: async (accountId: string) => {
        const { user } = get();
        if (!user) return;
        
        set({ isLoading: true });
        try {
          await apiService.removeCanvasAccount(user.id, accountId);
          const updatedUser = {
            ...user,
            canvasAccounts: user.canvasAccounts.filter(acc => acc.id !== accountId)
          };
          set({ user: updatedUser, isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      setActiveCanvasAccount: async (accountId: string) => {
        const { user } = get();
        if (!user) return;
        
        const updatedUser = {
          ...user,
          canvasAccounts: user.canvasAccounts.map(acc => ({
            ...acc,
            isActive: acc.id === accountId
          }))
        };
        set({ user: updatedUser });
      },

      updateSubscription: (subscription: Subscription) => {
        const { user } = get();
        if (!user) return;
        
        const updatedUser = { ...user, subscription };
        set({ user: updatedUser });
      },

      cancelSubscription: async () => {
        const { user } = get();
        if (!user) return;
        
        set({ isLoading: true });
        try {
          await apiService.cancelSubscription(user.id);
          const updatedUser = {
            ...user,
            subscription: user.subscription ? {
              ...user.subscription,
              status: 'cancelled' as const,
              cancelAtPeriodEnd: true
            } : undefined
          };
          set({ user: updatedUser, isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      clearError: () => set({ error: null })
    }),
    {
      name: 'user-store',
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      })
    }
  )
);
