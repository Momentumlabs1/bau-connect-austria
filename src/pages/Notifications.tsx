import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  created_at: string;
}

export default function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    checkAuthAndLoad();
  }, [filter]);

  const checkAuthAndLoad = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/login');
      return;
    }
    setUserId(session.user.id);
    await loadNotifications(session.user.id);
    setLoading(false);
  };

  const loadNotifications = async (uid: string) => {
    let query = supabase
      .from('notifications')
      .select('*')
      .eq('handwerker_id', uid)
      .order('created_at', { ascending: false });
    
    if (filter === 'unread') {
      query = query.eq('read', false);
    } else if (filter === 'read') {
      query = query.eq('read', true);
    }
    
    const { data } = await query;
    setNotifications(data || []);
  };

  const markAllAsRead = async () => {
    await supabase
      .from('notifications')
      .update({ read: true, read_at: new Date().toISOString() })
      .eq('handwerker_id', userId)
      .eq('read', false);
    
    loadNotifications(userId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Benachrichtigungen</h1>
          <Button onClick={markAllAsRead}>
            Alle als gelesen markieren
          </Button>
        </div>
        
        <Tabs value={filter} onValueChange={setFilter} className="mb-6">
          <TabsList>
            <TabsTrigger value="all">Alle</TabsTrigger>
            <TabsTrigger value="unread">Ungelesen</TabsTrigger>
            <TabsTrigger value="read">Gelesen</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="space-y-4">
          {notifications.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">
                Keine Benachrichtigungen
              </p>
            </Card>
          ) : (
            notifications.map(notif => (
              <Card 
                key={notif.id}
                className={cn(
                  "p-6",
                  !notif.read && "border-l-4 border-l-primary bg-primary/5"
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{notif.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {notif.body}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(notif.created_at).toLocaleString('de-DE')}
                    </p>
                  </div>
                  
                  {!notif.read && (
                    <Badge>Neu</Badge>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}