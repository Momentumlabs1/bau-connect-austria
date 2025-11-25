import { create } from 'zustand';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  timestamp: Date;
}

interface UIState {
  notifications: Notification[];
  unreadCount: number;
  sidebarOpen: boolean;
  
  // Actions
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  setUnreadCount: (count: number) => void;
  incrementUnreadCount: () => void;
  resetUnreadCount: () => void;
  toggleSidebar: () => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  sidebarOpen: false,

  addNotification: (notification) => {
    const id = Math.random().toString(36).substring(7);
    const newNotification = {
      ...notification,
      id,
      timestamp: new Date()
    };
    
    set((state) => ({
      notifications: [newNotification, ...state.notifications].slice(0, 50) // Keep last 50
    }));

    // Auto-remove after 5 seconds
    setTimeout(() => {
      get().removeNotification(id);
    }, 5000);
  },

  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter(n => n.id !== id)
    }));
  },

  clearNotifications: () => {
    set({ notifications: [] });
  },

  setUnreadCount: (count) => {
    set({ unreadCount: count });
  },

  incrementUnreadCount: () => {
    set((state) => ({ unreadCount: state.unreadCount + 1 }));
  },

  resetUnreadCount: () => {
    set({ unreadCount: 0 });
  },

  toggleSidebar: () => {
    set((state) => ({ sidebarOpen: !state.sidebarOpen }));
  }
}));

// Convenience hook
export const useNotifications = () => {
  const store = useUIStore();
  return {
    notifications: store.notifications,
    unreadCount: store.unreadCount,
    addNotification: store.addNotification,
    removeNotification: store.removeNotification,
    clearNotifications: store.clearNotifications,
    incrementUnreadCount: store.incrementUnreadCount,
    resetUnreadCount: store.resetUnreadCount
  };
};
