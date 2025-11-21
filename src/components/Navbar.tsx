import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, User, Menu, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { User as SupabaseUser } from "@supabase/supabase-js";
import logo from "@/assets/bauconnect-logo-new.png";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserRole(session.user.id);
        loadUnreadCount(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserRole(session.user.id);
        loadUnreadCount(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserRole = async (userId: string) => {
    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);

    if (data && data.length > 0) {
      // Priority: admin > contractor > customer
      const roles = data.map(r => r.role);
      if (roles.includes('admin')) {
        setUserRole('admin');
      } else if (roles.includes('contractor')) {
        setUserRole('contractor');
      } else if (roles.includes('customer')) {
        setUserRole('customer');
      }
    }
  };

  const loadUnreadCount = async (userId: string) => {
    const { data: convs } = await supabase
      .from('conversations')
      .select('id')
      .or(`customer_id.eq.${userId},contractor_id.eq.${userId}`);
    
    const convIds = convs?.map(c => c.id) || [];
    
    if (convIds.length > 0) {
      const { count } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .in('conversation_id', convIds)
        .eq('read', false)
        .neq('sender_id', userId);
      
      setUnreadCount(count || 0);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <nav className="border-b bg-card">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="BauConnect" className="h-12 md:h-16" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(userRole === 'customer' ? '/kunde/dashboard' : '/handwerker/dashboard')}
                >
                  <User className="mr-2 h-4 w-4" />
                  Dashboard
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/nachrichten')}
                  className="relative"
                >
                  <span className="mr-2">💬</span>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
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

          {/* Mobile Navigation */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="sm">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px]">
              <div className="flex flex-col gap-4 mt-8">
                {user ? (
                  <>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => {
                        navigate(userRole === 'customer' ? '/kunde/dashboard' : '/handwerker/dashboard');
                        setMobileMenuOpen(false);
                      }}
                    >
                      <User className="mr-2 h-4 w-4" />
                      Dashboard
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start relative"
                      onClick={() => {
                        navigate('/nachrichten');
                        setMobileMenuOpen(false);
                      }}
                    >
                      <span className="mr-2">💬</span>
                      Nachrichten
                      {unreadCount > 0 && (
                        <span className="ml-auto bg-destructive text-destructive-foreground rounded-full w-6 h-6 text-xs flex items-center justify-center">
                          {unreadCount}
                        </span>
                      )}
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start"
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Abmelden
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      variant="ghost" 
                      className="w-full"
                      onClick={() => {
                        navigate("/login");
                        setMobileMenuOpen(false);
                      }}
                    >
                      Anmelden
                    </Button>
                    <Button 
                      variant="default" 
                      className="w-full"
                      onClick={() => {
                        navigate("/register");
                        setMobileMenuOpen(false);
                      }}
                    >
                      Registrieren
                    </Button>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};
