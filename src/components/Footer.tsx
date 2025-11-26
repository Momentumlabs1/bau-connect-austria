import { Link } from "react-router-dom";
import { Separator } from "@/components/ui/separator";

export const Footer = () => {
  return (
    <footer className="bg-muted/30 border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-muted-foreground">
            © 2025 BauConnect24 e.U - Alle Rechte vorbehalten
          </div>
          
          <div className="flex flex-wrap justify-center items-center gap-4 text-sm">
            <Link 
              to="/impressum" 
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Impressum
            </Link>
            <Separator orientation="vertical" className="h-4" />
            <Link 
              to="/datenschutz" 
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Datenschutz
            </Link>
            <Separator orientation="vertical" className="h-4" />
            <Link 
              to="/agb" 
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              AGB
            </Link>
            <Separator orientation="vertical" className="h-4" />
            <Link 
              to="/widerruf" 
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Widerruf
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
