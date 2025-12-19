import { useState } from "react";
import { X } from "lucide-react";
import { Link } from "react-router-dom";

export const ContractorPromoBanner = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-blue-50 border-b border-blue-100">
      <div className="container mx-auto px-4 py-1 flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs">
          <span className="text-muted-foreground whitespace-nowrap">Sind Sie Handwerker?</span>
          <Link 
            to="/register?role=contractor" 
            className="font-medium text-primary hover:underline whitespace-nowrap"
          >
            Kostenlos registrieren
          </Link>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="p-1 rounded-full hover:bg-blue-100 transition-colors flex-shrink-0 ml-4"
          aria-label="Banner schließen"
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
};
