import { create } from 'zustand';
import { CanvasAuth, CanvasUser } from '../types/canvas';

interface AuthStore {
  isAuthenticated: boolean;
  user: CanvasUser | null;
  auth: CanvasAuth | null;
  login: (domain: string, accessToken: string) => Promise<void>;
  logout: () => void;
  setUser: (user: CanvasUser) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  isAuthenticated: false,
  user: null,
  auth: null,
  
  login: async (domain: string, accessToken: string) => {
    set({ 
      isAuthenticated: true, 
      auth: { accessToken, domain } 
    });
    
    // Store in localStorage for persistence
    localStorage.setItem('canvas_auth', JSON.stringify({ accessToken, domain }));
  },
  
  logout: () => {
    set({ 
      isAuthenticated: false, 
      user: null, 
      auth: null 
    });
    localStorage.removeItem('canvas_auth');
  },
  
  setUser: (user: CanvasUser) => {
    set({ user });
  }
}));