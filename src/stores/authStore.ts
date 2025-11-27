import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  role: 'customer' | 'contractor' | 'admin' | null;
  loading: boolean;
  initialized: boolean;
  
  // Actions
  initialize: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  role: null,
  loading: true,
  initialized: false,

  initialize: async () => {
    try {
      // Helper function to fetch user role
      const fetchUserRole = async (userId: string) => {
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId)
          .single();
        
        set({
          role: roleData?.role as 'customer' | 'contractor' | 'admin' || null
        });
      };

      // Get initial session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        set({
          user: session.user,
          session: session,
          loading: false,
          initialized: true
        });
        
        // Fetch role separately
        await fetchUserRole(session.user.id);
      } else {
        set({ user: null, session: null, role: null, loading: false, initialized: true });
      }

      // Listen for auth changes - ONLY synchronous updates in callback
      supabase.auth.onAuthStateChange((event, session) => {
        // Only synchronous state updates here
        set({
          user: session?.user ?? null,
          session: session,
          loading: false
        });
        
        // Defer Supabase calls with setTimeout to prevent deadlock
        if (session?.user) {
          setTimeout(() => {
            fetchUserRole(session.user.id);
          }, 0);
        } else {
          set({ role: null });
        }
      });
    } catch (error) {
      set({ loading: false, initialized: true });
    }
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null, role: null });
  },

  refreshUser: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      set({
        user,
        role: roleData?.role as 'customer' | 'contractor' | 'admin' || null
      });
    }
  }
}));

// Convenience hook
export const useAuth = () => {
  const store = useAuthStore();
  return {
    user: store.user,
    session: store.session,
    role: store.role,
    loading: store.loading,
    initialized: store.initialized,
    isAuthenticated: !!store.user,
    isCustomer: store.role === 'customer',
    isContractor: store.role === 'contractor',
    isAdmin: store.role === 'admin',
    roleLoaded: store.role !== null, // Flag ob Rolle geladen wurde
    signOut: store.signOut,
    refreshUser: store.refreshUser
  };
};
