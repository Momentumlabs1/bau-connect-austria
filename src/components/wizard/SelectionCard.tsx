import { ReactNode } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelectionCardProps {
  icon?: ReactNode;
  label: string;
  description?: string;
  isSelected: boolean;
  onClick: () => void;
  className?: string;
}

export function SelectionCard({ icon, label, description, isSelected, onClick, className }: SelectionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex flex-col items-center justify-center gap-3 rounded-lg border-2 bg-background p-6 transition-all hover:border-primary/50 hover:shadow-md text-left",
        isSelected ? "border-primary bg-primary/5 shadow-md" : "border-border",
        className
      )}
    >
      {isSelected && (
        <div className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Check className="h-4 w-4" />
        </div>
      )}
      
      {icon && (
        <div className={cn(
          "text-4xl transition-colors",
          isSelected ? "text-primary" : "text-muted-foreground"
        )}>
          {icon}
        </div>
      )}
      
      <div className="w-full space-y-1">
        <span className={cn(
          "block text-center text-sm font-medium transition-colors",
          isSelected ? "text-foreground" : "text-muted-foreground"
        )}>
          {label}
        </span>
        
        {description && (
          <p className="text-xs text-center text-muted-foreground line-clamp-2">
            {description}
          </p>
        )}
      </div>
    </button>
  );
}