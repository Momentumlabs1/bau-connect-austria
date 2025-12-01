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
    // Prevent multiple initializations
    if (get().initialized) {
      console.log('Auth already initialized, skipping');
      return;
    }

    try {
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

      // 1. FIRST: Set up auth state listener
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, session) => {
          console.log('Auth event:', event, session?.user?.email);
          
          // Synchronous state updates only
          set({
            user: session?.user ?? null,
            session: session,
            loading: false,
            initialized: true
          });
          
          // Defer database calls
          if (session?.user) {
            setTimeout(() => {
              fetchUserRole(session.user.id);
            }, 0);
          } else {
            set({ role: null });
          }
        }
      );

      // 2. THEN: Check for existing session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        console.log('Existing session found:', session.user.email);
        set({
          user: session.user,
          session: session,
          loading: false,
          initialized: true
        });
        
        // Fetch role
        await fetchUserRole(session.user.id);
      } else {
        console.log('No existing session');
        set({ 
          user: null, 
          session: null, 
          role: null, 
          loading: false, 
          initialized: true 
        });
      }

    } catch (error) {
      console.error('Auth initialization error:', error);
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

// Convenience hook with single store call to prevent hook count changes
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
    roleLoaded: store.role !== null,
    signOut: store.signOut,
    refreshUser: store.refreshUser
  };
};
