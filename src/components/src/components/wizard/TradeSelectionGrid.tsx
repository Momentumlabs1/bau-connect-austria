import { 
  Paintbrush, 
  Zap, 
  Droplet, 
  Construction,
  Hammer,
  Wrench,
  Flame,
  Trees,
  Wind,
  Home,
  Fence,
  DoorOpen,
  Sofa,
  Lightbulb,
  ShowerHead,
  ArrowRight,
  Search,
  Drill,
  Snowflake,
  PackageOpen,
  Sparkles,
  MoreHorizontal
} from "lucide-react";
import { SelectionCard } from "./SelectionCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface Trade {
  value: string;
  label: string;
  icon: any;
  color: string;
  popular?: boolean;
}

export const allTrades: Trade[] = [
  { value: "Maler", label: "Maler", icon: Paintbrush, color: "text-purple-500", popular: true },
  { value: "Elektriker", label: "Elektriker", icon: Zap, color: "text-yellow-500", popular: true },
  { value: "Sanitär", label: "Sanitär", icon: Droplet, color: "text-blue-500", popular: true },
  { value: "Heizung", label: "Heizung", icon: Flame, color: "text-red-500", popular: true },
  { value: "Bau", label: "Bau & Maurer", icon: Construction, color: "text-orange-500", popular: false },
  { value: "Tischler", label: "Tischler", icon: Hammer, color: "text-amber-700", popular: false },
  { value: "Klima", label: "Klima & Lüftung", icon: Wind, color: "text-cyan-500", popular: false },
  { value: "Garten", label: "Garten & Landschaft", icon: Trees, color: "text-green-500", popular: false },
  { value: "Dachdecker", label: "Dachdecker", icon: Home, color: "text-slate-600", popular: false },
  { value: "Bodenleger", label: "Bodenleger", icon: PackageOpen, color: "text-amber-600", popular: false },
  { value: "Fensterbau", label: "Fenster & Türen", icon: DoorOpen, color: "text-blue-600", popular: false },
  { value: "Möbelmontage", label: "Möbelmontage", icon: Sofa, color: "text-indigo-500", popular: false },
  { value: "Zaunbau", label: "Zaunbau", icon: Fence, color: "text-green-700", popular: false },
  { value: "Bohrarbeiten", label: "Bohrarbeiten", icon: Drill, color: "text-gray-600", popular: false },
  { value: "Reinigung", label: "Reinigung", icon: Sparkles, color: "text-pink-500", popular: false },
  { value: "Sonstige", label: "Sonstige", icon: MoreHorizontal, color: "text-muted-foreground", popular: false }
];

interface TradeSelectionGridProps {
  selectedTrade: string;
  onTradeSelect: (trade: string) => void;
}

export function TradeSelectionGrid({ selectedTrade, onTradeSelect }: TradeSelectionGridProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const popularTrades = allTrades.filter(t => t.popular);
  const filteredTrades = searchQuery
    ? allTrades.filter(trade => 
        trade.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allTrades;

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
                  key={trade.value}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                >
                  <SelectionCard
                    icon={<Icon className={cn("h-10 w-10", trade.color)} />}
                    label={trade.label}
                    isSelected={selectedTrade === trade.value}
                    onClick={() => onTradeSelect(trade.value)}
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
                  key={trade.value}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: searchQuery ? 0 : 0.45 + index * 0.03 }}
                >
                  <SelectionCard
                    icon={<Icon className={cn("h-8 w-8", trade.color)} />}
                    label={trade.label}
                    isSelected={selectedTrade === trade.value}
                    onClick={() => onTradeSelect(trade.value)}
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
