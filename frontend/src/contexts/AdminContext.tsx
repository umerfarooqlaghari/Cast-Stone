'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';

interface Admin {
  id: string;
  email: string;
  name: string;
  role: string;
  permissions: {
    products: { create: boolean; read: boolean; update: boolean; delete: boolean };
    orders: { create: boolean; read: boolean; update: boolean; delete: boolean };
    users: { create: boolean; read: boolean; update: boolean; delete: boolean };
    admins: { create: boolean; read: boolean; update: boolean; delete: boolean };
    analytics: { read: boolean };
  };
  mustChangePassword: boolean;
  lastLogin?: string;
}

interface AdminState {
  admin: Admin | null;
  isLoading: boolean;
  sidebarCollapsed: boolean;
  notifications: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message?: string;
    timestamp: Date;
  }>;
}

type AdminAction =
  | { type: 'SET_ADMIN'; payload: Admin }
  | { type: 'CLEAR_ADMIN' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_SIDEBAR_COLLAPSED'; payload: boolean }
  | { type: 'ADD_NOTIFICATION'; payload: Omit<AdminState['notifications'][0], 'id' | 'timestamp'> }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'CLEAR_NOTIFICATIONS' };

const initialState: AdminState = {
  admin: null,
  isLoading: false,
  sidebarCollapsed: false,
  notifications: []
};

const adminReducer = (state: AdminState, action: AdminAction): AdminState => {
  switch (action.type) {
    case 'SET_ADMIN':
      return {
        ...state,
        admin: action.payload,
        isLoading: false
      };
    
    case 'CLEAR_ADMIN':
      return {
        ...state,
        admin: null,
        isLoading: false
      };
    
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };
    
    case 'TOGGLE_SIDEBAR':
      return {
        ...state,
        sidebarCollapsed: !state.sidebarCollapsed
      };
    
    case 'SET_SIDEBAR_COLLAPSED':
      return {
        ...state,
        sidebarCollapsed: action.payload
      };
    
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [
          ...state.notifications,
          {
            ...action.payload,
            id: Math.random().toString(36).substr(2, 9),
            timestamp: new Date()
          }
        ]
      };
    
    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload)
      };
    
    case 'CLEAR_NOTIFICATIONS':
      return {
        ...state,
        notifications: []
      };
    
    default:
      return state;
  }
};

const AdminContext = createContext<{
  state: AdminState;
  dispatch: React.Dispatch<AdminAction>;
  hasPermission: (resource: string, action: string) => boolean;
  addNotification: (notification: Omit<AdminState['notifications'][0], 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  logout: () => void;
  apiCall: (url: string, options?: RequestInit) => Promise<any>;
} | null>(null);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(adminReducer, initialState);

  // Load admin data on mount
  useEffect(() => {
    const loadAdminData = async () => {
      const token = localStorage.getItem('adminToken');
      if (!token) return;

      dispatch({ type: 'SET_LOADING', payload: true });

      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        const response = await fetch(`${API_BASE_URL}/admin/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          dispatch({ type: 'SET_ADMIN', payload: data.admin });
        } else {
          localStorage.removeItem('adminToken');
          dispatch({ type: 'CLEAR_ADMIN' });
        }
      } catch (error) {
        console.error('Failed to load admin data:', error);
        localStorage.removeItem('adminToken');
        dispatch({ type: 'CLEAR_ADMIN' });
      }
    };

    loadAdminData();
  }, []);

  // Load sidebar state from localStorage
  useEffect(() => {
    const savedSidebarState = localStorage.getItem('adminSidebarCollapsed');
    if (savedSidebarState) {
      dispatch({ 
        type: 'SET_SIDEBAR_COLLAPSED', 
        payload: JSON.parse(savedSidebarState) 
      });
    }
  }, []);

  // Save sidebar state to localStorage
  useEffect(() => {
    localStorage.setItem('adminSidebarCollapsed', JSON.stringify(state.sidebarCollapsed));
  }, [state.sidebarCollapsed]);

  const hasPermission = (resource: string, action: string): boolean => {
    if (!state.admin) return false;
    if (state.admin.role === 'super_admin') return true;
    
    const resourcePermissions = state.admin.permissions[resource as keyof typeof state.admin.permissions];
    if (!resourcePermissions) return false;
    
    return resourcePermissions[action as keyof typeof resourcePermissions] || false;
  };

  const addNotification = (notification: Omit<AdminState['notifications'][0], 'id' | 'timestamp'>) => {
    dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
    
    const id = Math.random().toString(36).substr(2, 9);
    setTimeout(() => {
      dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
    }, 5000);
  };

  const removeNotification = (id: string) => {
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (token) {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        await fetch(`${API_BASE_URL}/admin/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('adminToken');
      dispatch({ type: 'CLEAR_ADMIN' });
      window.location.href = '/admin/login';
    }
  };

  const apiCall = async (url: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('adminToken');
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...(options.headers || {})
    };
    try {
      const response = await fetch(`${API_BASE_URL}${url}`, {
        ...options,
        headers
      });
      const data = await response.json();
      return data;
    } catch (error) {
      return { success: false, message: 'Network error', error };
    }
  };

  return (
    <AdminContext.Provider value={{
      state,
      dispatch,
      hasPermission,
      addNotification,
      removeNotification,
      logout,
      apiCall
    }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};
