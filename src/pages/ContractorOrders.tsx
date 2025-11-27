import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { MapPin, Euro, Calendar, MessageSquare, Eye } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface Order {
  id: string;
  project_id: string;
  purchased_at: string;
  project: {
    id: string;
    title: string;
    description: string;
    gewerk_id: string;
    city: string;
    postal_code: string;
    status: string;
    urgency: string;
    customer_id: string;
    created_at: string;
  };
  customer: {
    first_name?: string;
    last_name?: string;
    email: string;
    phone?: string;
  } | null;
  lastMessage?: string;
  unreadCount?: number;
}

export default function ContractorOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("active");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      // Get all purchased leads
      const { data: matches, error } = await supabase
        .from('matches')
        .select(`
          id,
          project_id,
          purchased_at,
          projects:project_id (
            id,
            title,
            description,
            gewerk_id,
            city,
            postal_code,
            status,
            urgency,
            customer_id,
            created_at
          )
        `)
        .eq('contractor_id', user.id)
        .eq('lead_purchased', true)
        .order('purchased_at', { ascending: false });

      if (error) throw error;

      // Get customer details for each order
      const ordersWithCustomers = await Promise.all(
        (matches || []).map(async (match: any) => {
          const { data: customer } = await supabase
            .from('profiles')
            .select('first_name, last_name, email, phone')
            .eq('id', match.projects.customer_id)
            .single();

          // Get conversation info
          const { data: conversation } = await supabase
            .from('conversations')
            .select(`
              id,
              messages (message, created_at, read, sender_id)
            `)
            .eq('contractor_id', user.id)
            .eq('project_id', match.project_id)
            .order('last_message_at', { ascending: false })
            .maybeSingle();

          const messages = conversation?.messages || [];
          const lastMsg = messages[0];
          const unreadCount = messages.filter((m: any) => !m.read && m.sender_id !== user.id).length;

          return {
            id: match.id,
            project_id: match.project_id,
            purchased_at: match.purchased_at,
            project: match.projects,
            customer,
            lastMessage: lastMsg?.message,
            unreadCount
          };
        })
      );

      setOrders(ordersWithCustomers);
    } catch (error: any) {
      console.error('Error loading orders:', error);
      toast({
        title: "Fehler beim Laden",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'default';
      case 'in_progress': return 'secondary';
      case 'completed': return 'outline';
      case 'cancelled': return 'destructive';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open': return 'Offen';
      case 'in_progress': return 'In Bearbeitung';
      case 'completed': return 'Abgeschlossen';
      case 'cancelled': return 'Abgelehnt';
      default: return status;
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  const getUrgencyLabel = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'Dringend';
      case 'medium': return 'Normal';
      case 'low': return 'Niedrig';
      default: return urgency;
    }
  };

  const filterOrders = (status: string) => {
    switch (status) {
      case 'active':
        return orders.filter(o => ['open', 'in_progress'].includes(o.project.status));
      case 'completed':
        return orders.filter(o => o.project.status === 'completed');
      case 'cancelled':
        return orders.filter(o => o.project.status === 'cancelled');
      default:
        return orders;
    }
  };

  const renderOrderCard = (order: Order) => (
    <Card key={order.id} className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between mb-2">
          <div className="flex gap-2">
            <Badge>{order.project.gewerk_id}</Badge>
            <Badge variant={getStatusColor(order.project.status)}>
              {getStatusLabel(order.project.status)}
            </Badge>
            <Badge variant={getUrgencyColor(order.project.urgency)}>
              {getUrgencyLabel(order.project.urgency)}
            </Badge>
          </div>
          {order.unreadCount! > 0 && (
            <Badge variant="destructive" className="ml-2">
              {order.unreadCount} neue
            </Badge>
          )}
        </div>
        <CardTitle className="text-lg">{order.project.title}</CardTitle>
        <CardDescription className="line-clamp-2">
          {order.project.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            {order.project.postal_code} {order.project.city}
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            Gekauft: {format(new Date(order.purchased_at), 'dd. MMM yyyy', { locale: de })}
          </div>

          {order.customer && (
            <div className="border-t pt-3">
              <p className="text-sm font-medium mb-1">Kundenkontakt:</p>
              <p className="text-sm text-muted-foreground">
                {order.customer.first_name && order.customer.last_name
                  ? `${order.customer.first_name} ${order.customer.last_name}`
                  : order.customer.email}
              </p>
              {order.customer.phone && (
                <a href={`tel:${order.customer.phone}`} className="text-sm text-primary hover:underline">
                  {order.customer.phone}
                </a>
              )}
            </div>
          )}

          {order.lastMessage && (
            <div className="border-t pt-3">
              <p className="text-sm text-muted-foreground line-clamp-2">
                💬 {order.lastMessage}
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 pt-2">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate(`/handwerker/projekt/${order.project_id}`)}
            >
              <Eye className="h-4 w-4 mr-2" />
              Details
            </Button>
            <Button 
              className="w-full"
              onClick={() => navigate('/nachrichten')}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Nachricht
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-12 flex justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Meine Aufträge</h1>
          <p className="text-muted-foreground">
            Übersicht über alle gekauften Leads und deren Status
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="active">
              Aktuelle Aufträge ({filterOrders('active').length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Abgeschlossene ({filterOrders('completed').length})
            </TabsTrigger>
            <TabsTrigger value="cancelled">
              Abgelehnte ({filterOrders('cancelled').length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active">
            {filterOrders('active').length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">Keine aktiven Aufträge vorhanden</p>
                <Button className="mt-4" onClick={() => navigate('/handwerker/projekte')}>
                  Neue Leads entdecken
                </Button>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filterOrders('active').map(renderOrderCard)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed">
            {filterOrders('completed').length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">Keine abgeschlossenen Aufträge</p>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filterOrders('completed').map(renderOrderCard)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="cancelled">
            {filterOrders('cancelled').length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">Keine abgelehnten Aufträge</p>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filterOrders('cancelled').map(renderOrderCard)}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
