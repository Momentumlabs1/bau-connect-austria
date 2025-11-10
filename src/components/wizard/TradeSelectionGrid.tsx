import { 
  Paintbrush, 
  Zap, 
  Droplet, 
  Home,
  Search,
  ArrowRight,
  Lightbulb
} from "lucide-react";
import { SelectionCard } from "./SelectionCard";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

export interface Trade {
  id: string;
  label: string;
  icon: any;
  color: string;
  description: string;
  base_price: number;
  popular?: boolean;
}

const iconMap: Record<string, any> = {
  'Zap': Zap,
  'Droplet': Droplet,
  'Home': Home,
  'Paintbrush': Paintbrush
};

interface TradeSelectionGridProps {
  selectedTrade: string;
  onTradeSelect: (trade: string) => void;
}

export function TradeSelectionGrid({ selectedTrade, onTradeSelect }: TradeSelectionGridProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrades();
  }, []);

  const loadTrades = async () => {
    try {
      const { data, error } = await supabase
        .from('gewerke_config')
        .select('*')
        .order('base_price', { ascending: false });

      if (error) throw error;

      const mappedTrades: Trade[] = (data || []).map(gewerk => ({
        id: gewerk.id,
        label: gewerk.label,
        icon: iconMap[gewerk.icon] || Home,
        color: getColorForGewerk(gewerk.id),
        description: gewerk.description,
        base_price: Number(gewerk.base_price),
        popular: ['elektriker', 'sanitar-heizung', 'maler'].includes(gewerk.id)
      }));

      setTrades(mappedTrades);
    } catch (error) {
      console.error('Error loading gewerke:', error);
    } finally {
      setLoading(false);
    }
  };

  const getColorForGewerk = (id: string): string => {
    const colors: Record<string, string> = {
      'elektriker': 'text-yellow-500',
      'sanitar-heizung': 'text-blue-500',
      'dachdecker': 'text-slate-600',
      'fassade': 'text-orange-500',
      'maler': 'text-purple-500'
    };
    return colors[id] || 'text-muted-foreground';
  };

  const popularTrades = trades.filter(t => t.popular);
  const filteredTrades = searchQuery
    ? trades.filter(trade => 
        trade.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trade.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : trades;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Lade Gewerke...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-3"
      >
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          Der zuverlässige Weg, einen Handwerker zu beauftragen
        </h1>
        <p className="text-lg text-muted-foreground">
          Wählen Sie das passende Gewerk für Ihr Projekt
        </p>
      </motion.div>

      {/* Search Bar */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mx-auto max-w-2xl"
      >
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="z. B.: Malerarbeiten, Elektrik, Badezimmer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-14 pl-12 text-lg"
          />
        </div>
      </motion.div>

      {/* Popular Categories - Only show if no search */}
      {!searchQuery && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="mb-4 flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            <h2 className="text-lg font-semibold">Beliebte Kategorien</h2>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {popularTrades.map((trade, index) => {
              const Icon = trade.icon;
              return (
                <motion.div
                  key={trade.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                >
                  <SelectionCard
                    icon={<Icon className={cn("h-10 w-10", trade.color)} />}
                    label={trade.label}
                    isSelected={selectedTrade === trade.id}
                    onClick={() => onTradeSelect(trade.id)}
                    className="h-32"
                  />
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* All Categories */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: searchQuery ? 0 : 0.4 }}
      >
        <div className="mb-4">
          <h2 className="text-lg font-semibold">
            {searchQuery ? "Suchergebnisse" : "Alle Gewerke"}
          </h2>
        </div>
        
        {filteredTrades.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5">
            {filteredTrades.map((trade, index) => {
              const Icon = trade.icon;
              return (
                <motion.div
                  key={trade.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: searchQuery ? 0 : 0.45 + index * 0.03 }}
                >
                  <SelectionCard
                    icon={<Icon className={cn("h-8 w-8", trade.color)} />}
                    label={trade.label}
                    isSelected={selectedTrade === trade.id}
                    onClick={() => onTradeSelect(trade.id)}
                    className="h-28"
                  />
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">
              Keine passenden Gewerke gefunden. Versuchen Sie "Sonstige" für spezielle Anfragen.
            </p>
          </div>
        )}
      </motion.div>

      {/* Help Text */}
      {selectedTrade && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-2 text-sm text-muted-foreground"
        >
          <span>Ausgewählt: <strong className="text-primary">{selectedTrade}</strong></span>
          <ArrowRight className="h-4 w-4" />
          <span>Klicken Sie auf "Weiter" um fortzufahren</span>
        </motion.div>
      )}
    </div>
  );
}
