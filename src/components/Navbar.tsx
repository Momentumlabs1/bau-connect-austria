import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Hammer, LogOut, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { User as SupabaseUser } from "@supabase/supabase-js";

export const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<SupabaseUser | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <nav className="border-b bg-card">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Hammer className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold text-foreground">BauConnect24</span>
          </Link>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/profile")}
                >
                  <User className="mr-2 h-4 w-4" />
                  Profil
                </Button>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Abmelden
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => navigate("/login")}>
                  Anmelden
                </Button>
                <Button variant="default" size="sm" onClick={() => navigate("/register")}>
                  Registrieren
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
