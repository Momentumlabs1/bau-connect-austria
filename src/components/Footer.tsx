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
            <a 
              href="/impressum" 
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Impressum
            </a>
            <Separator orientation="vertical" className="h-4" />
            <a 
              href="/datenschutz" 
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Datenschutz
            </a>
            <Separator orientation="vertical" className="h-4" />
            <a 
              href="/agb" 
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              AGB
            </a>
            <Separator orientation="vertical" className="h-4" />
            <a 
              href="/widerruf" 
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Widerruf
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
