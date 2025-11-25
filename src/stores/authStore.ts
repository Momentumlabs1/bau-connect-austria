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
      // Get initial session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Get user role
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .single();

        set({
          user: session.user,
          session: session,
          role: roleData?.role as 'customer' | 'contractor' | 'admin' || null,
          loading: false,
          initialized: true
        });
      } else {
        set({ user: null, session: null, role: null, loading: false, initialized: true });
      }

      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('🔐 Auth state changed:', event);
        
        if (session?.user) {
          // Get user role
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', session.user.id)
            .single();

          set({
            user: session.user,
            session: session,
            role: roleData?.role as 'customer' | 'contractor' | 'admin' || null,
            loading: false
          });
        } else {
          set({ user: null, session: null, role: null, loading: false });
        }
      });
    } catch (error) {
      console.error('❌ Auth initialization error:', error);
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
    signOut: store.signOut,
    refreshUser: store.refreshUser
  };
};
