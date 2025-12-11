import { useState } from "react";
import { X } from "lucide-react";
import { Link } from "react-router-dom";

export const ContractorPromoBanner = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-muted/50 border-b">
      <div className="container mx-auto px-4 py-2 flex items-center justify-center gap-2 text-sm">
        <span className="text-muted-foreground">Sind Sie Handwerker?</span>
        <Link 
          to="/register?role=contractor" 
          className="font-medium text-primary hover:underline"
        >
          Kostenlos registrieren
        </Link>
        <button
          onClick={() => setIsVisible(false)}
          className="ml-4 p-1 rounded-full hover:bg-muted transition-colors"
          aria-label="Banner schließen"
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
};
