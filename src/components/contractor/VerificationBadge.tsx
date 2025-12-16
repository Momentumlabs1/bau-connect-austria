import { CheckCircle2, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface VerificationBadgeProps {
  verified: boolean;
  className?: string;
  size?: "sm" | "default";
}

export function VerificationBadge({ verified, className, size = "default" }: VerificationBadgeProps) {
  if (verified) {
    return (
      <Badge 
        className={cn(
          "bg-green-100 text-green-700 border-green-200 hover:bg-green-100",
          size === "sm" && "text-xs px-1.5 py-0",
          className
        )}
      >
        <CheckCircle2 className={cn("mr-1", size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5")} />
        Verifiziert
      </Badge>
    );
  }

  return (
    <Badge 
      variant="outline"
      className={cn(
        "bg-yellow-50 text-yellow-700 border-yellow-300 hover:bg-yellow-50",
        size === "sm" && "text-xs px-1.5 py-0",
        className
      )}
    >
      <AlertCircle className={cn("mr-1", size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5")} />
      Nicht verifiziert
    </Badge>
  );
}
