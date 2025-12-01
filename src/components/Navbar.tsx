import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, User, Menu, X, MessageSquare, Bell } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/stores/authStore";
import logo from "@/assets/bauconnect-logo-new.png";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export const Navbar = () => {
  const navigate = useNavigate();
  const { user, role, roleLoaded, signOut, initialized } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Loading guard AFTER all hooks
  if (!initialized) {
    return (
      <nav className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/">
              <img src={logo} alt="BauConnect" className="h-16 md:h-20" />
            </Link>
            <div className="animate-pulse bg-gray-200 h-8 w-24 rounded"></div>
          </div>
        </div>
      </nav>
    );
  }

  useEffect(() => {
    if (user?.id) {
      loadUnreadCount(user.id);
      
      // Realtime subscription for new messages
      const channel = supabase
        .channel('navbar-messages')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages'
          },
          () => {
            loadUnreadCount(user.id);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

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
    await signOut();
    navigate("/");
  };

  return (
    <nav className="border-b bg-card">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="BauConnect" className="h-16 md:h-20" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                {roleLoaded && role && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(role === 'customer' ? '/kunde/dashboard' : '/handwerker/dashboard')}
                  >
                    <User className="mr-2 h-4 w-4" />
                    Dashboard
                  </Button>
                )}
                {!roleLoaded && (
                  <Button variant="ghost" size="sm" disabled>
                    Lädt...
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/nachrichten')}
                  className="relative"
                >
                  <MessageSquare className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                      {unreadCount}
                    </Badge>
                  )}
                </Button>
                {role === 'contractor' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/benachrichtigungen')}
                  >
                    <Bell className="h-4 w-4" />
                  </Button>
                )}
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
                    {roleLoaded && role && (
                      <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => {
                          navigate(role === 'customer' ? '/kunde/dashboard' : '/handwerker/dashboard');
                          setMobileMenuOpen(false);
                        }}
                      >
                        <User className="mr-2 h-4 w-4" />
                        Dashboard
                      </Button>
                    )}
                    {!roleLoaded && (
                      <Button disabled className="w-full justify-start">
                        Lädt...
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      className="w-full justify-start relative"
                      onClick={() => {
                        navigate('/nachrichten');
                        setMobileMenuOpen(false);
                      }}
                    >
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Nachrichten
                      {unreadCount > 0 && (
                        <Badge className="ml-auto h-6 w-6 p-0 flex items-center justify-center text-xs">
                          {unreadCount}
                        </Badge>
                      )}
                    </Button>
                    {role === 'contractor' && (
                      <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => {
                          navigate('/benachrichtigungen');
                          setMobileMenuOpen(false);
                        }}
                      >
                        <Bell className="mr-2 h-4 w-4" />
                        Benachrichtigungen
                      </Button>
                    )}
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
