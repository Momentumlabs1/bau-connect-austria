import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';

interface ContractorProfile {
  id: string;
  company_name: string;
  wallet_balance: number;
  rating: number;
  total_reviews: number;
  leads_bought: number;
  leads_won: number;
  conversion_rate: number;
  quality_score: number;
  trades: string[];
  postal_codes: string[];
  handwerker_status: string;
  profile_image_url: string | null;
}

interface ContractorState {
  profile: ContractorProfile | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  loadProfile: (userId: string) => Promise<void>;
  updateWalletBalance: (newBalance: number) => void;
  refreshProfile: () => Promise<void>;
}

export const useContractorStore = create<ContractorState>((set, get) => ({
  profile: null,
  loading: false,
  error: null,

  loadProfile: async (userId: string) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('contractors')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      set({ 
        profile: data as ContractorProfile,
        loading: false 
      });
    } catch (error: any) {
      console.error('❌ Failed to load contractor profile:', error);
      set({ 
        error: error.message,
        loading: false 
      });
    }
  },

  updateWalletBalance: (newBalance: number) => {
    const profile = get().profile;
    if (profile) {
      set({ 
        profile: { ...profile, wallet_balance: newBalance }
      });
    }
  },

  refreshProfile: async () => {
    const profile = get().profile;
    if (profile) {
      await get().loadProfile(profile.id);
    }
  }
}));

// Convenience hook
export const useContractor = () => {
  const store = useContractorStore();
  return {
    profile: store.profile,
    loading: store.loading,
    error: store.error,
    walletBalance: store.profile?.wallet_balance ?? 0,
    loadProfile: store.loadProfile,
    updateWalletBalance: store.updateWalletBalance,
    refreshProfile: store.refreshProfile
  };
};
