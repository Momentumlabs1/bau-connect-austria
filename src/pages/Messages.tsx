import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Send, Loader2, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface Conversation {
  id: string;
  project_id: string;
  customer_id: string;
  contractor_id: string;
  created_at: string;
  updated_at: string;
  project?: { title: string };
  customer?: { first_name: string; last_name: string };
  contractor?: { company_name: string };
}

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  message: string;
  read: boolean;
  created_at: string;
}

export default function Messages() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [userId, setUserId] = useState<string>("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(
    searchParams.get('conversation')
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthAndLoad();
  }, []);

  useEffect(() => {
    if (selectedConvId) {
      loadMessages(selectedConvId);
      subscribeToMessages(selectedConvId);
    }
  }, [selectedConvId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const checkAuthAndLoad = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/login');
      return;
    }
    setUserId(session.user.id);
    await loadConversations(session.user.id);
    setLoading(false);
  };

  const loadConversations = async (uid: string) => {
    const { data } = await supabase
      .from('conversations')
      .select(`
        *,
        project:projects(title)
      `)
      .or(`customer_id.eq.${uid},contractor_id.eq.${uid}`)
      .order('updated_at', { ascending: false });
    
    // Fetch contractor/customer names separately
    const conversationsWithNames = await Promise.all(
      (data || []).map(async (conv) => {
        if (conv.contractor_id) {
          const { data: contractor } = await supabase
            .from('contractors')
            .select('company_name')
            .eq('id', conv.contractor_id)
            .maybeSingle();
          return { ...conv, contractor };
        }
        if (conv.customer_id) {
          const { data: customer } = await supabase
            .from('profiles')
            .select('first_name, last_name')
            .eq('id', conv.customer_id)
            .maybeSingle();
          return { ...conv, customer };
        }
        return conv;
      })
    );
    
    setConversations(conversationsWithNames as any);
  };

  const loadMessages = async (convId: string) => {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', convId)
      .order('created_at', { ascending: true });
    
    setMessages(data || []);
    
    // Mark as read
    await supabase
      .from('messages')
      .update({ read: true })
      .eq('conversation_id', convId)
      .neq('sender_id', userId);
  };

  const subscribeToMessages = (convId: string) => {
    const channel = supabase
      .channel(`messages:${convId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${convId}`
      }, (payload) => {
        setMessages(prev => [...prev, payload.new as Message]);
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConvId || !userId) return;

    try {
      // ============================================================
      // SECURITY: Validate message before insertion
      // ============================================================
      const trimmedMessage = newMessage.trim();
      
      if (trimmedMessage.length === 0) {
        toast({
          title: "Fehler",
          description: "Nachricht darf nicht leer sein.",
          variant: "destructive"
        });
        return;
      }
      
      if (trimmedMessage.length > 5000) {
        toast({
          title: "Nachricht zu lang",
          description: "Nachricht darf maximal 5000 Zeichen lang sein.",
          variant: "destructive"
        });
        return;
      }
      
      // Check for potentially malicious content
      if (/<script|javascript:|on\w+=/i.test(trimmedMessage)) {
        toast({
          title: "Ungültige Nachricht",
          description: "Nachricht enthält nicht erlaubte Zeichen.",
          variant: "destructive"
        });
        return;
      }

      console.log('📤 Sending message...', { conversation_id: selectedConvId });
      
      const { error: insertError } = await supabase.from('messages').insert({
        conversation_id: selectedConvId,
        sender_id: userId,
        message: trimmedMessage
      });

      if (insertError) {
        console.error('❌ Error inserting message:', insertError);
        throw insertError;
      }
      
      const { error: updateError } = await supabase
        .from('conversations')
        .update({ 
          updated_at: new Date().toISOString(),
          last_message_at: new Date().toISOString()
        })
        .eq('id', selectedConvId);

      if (updateError) {
        console.error('❌ Error updating conversation:', updateError);
      }
      
      console.log('✅ Message sent successfully');
      setNewMessage('');
    } catch (error: any) {
      console.error('💥 Send message failed:', error);
      toast({
        title: "Fehler beim Senden",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const getConversationTitle = (conv: Conversation) => {
    if (conv.contractor?.company_name) return conv.contractor.company_name;
    if (conv.customer?.first_name) return `${conv.customer.first_name} ${conv.customer.last_name || ''}`;
    return 'Unbekannt';
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

  if (conversations.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Card className="p-12 text-center max-w-lg mx-auto">
            <MessageSquare className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2">Keine Nachrichten</h2>
            <p className="text-muted-foreground mb-6">
              Sie haben noch keine Unterhaltungen. Kontaktieren Sie Handwerker über Ihre Projekte oder durchsuchen Sie verfügbare Leads.
            </p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => navigate('/kunde/projekt-erstellen')}>
                Projekt erstellen
              </Button>
              <Button variant="outline" onClick={() => navigate('/handwerker/dashboard')}>
                Leads ansehen
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Nachrichten</h1>
        
        <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-250px)]">
          {/* Conversations Sidebar */}
          <Card className="p-4 overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Unterhaltungen</h2>
            <div className="space-y-2">
              {conversations.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Noch keine Unterhaltungen
                </p>
              ) : (
                conversations.map(conv => (
                  <div
                    key={conv.id}
                    className={cn(
                      "p-3 rounded-lg cursor-pointer hover:bg-muted transition-colors",
                      selectedConvId === conv.id && "bg-primary/10"
                    )}
                    onClick={() => setSelectedConvId(conv.id)}
                  >
                    <h3 className="font-semibold">{getConversationTitle(conv)}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {conv.project?.title || 'Projekt'}
                    </p>
                  </div>
                ))
              )}
            </div>
          </Card>
          
          {/* Messages Area */}
          <Card className="lg:col-span-2 p-4 flex flex-col">
            {selectedConvId ? (
              <>
                <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                  {messages.map(msg => (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex",
                        msg.sender_id === userId ? "justify-end" : "justify-start"
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[70%] rounded-lg p-3",
                          msg.sender_id === userId
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        )}
                      >
                        <p>{msg.message}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {new Date(msg.created_at).toLocaleTimeString('de-DE', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
                
                <div className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && sendMessage()}
                    placeholder="Nachricht eingeben..."
                  />
                  <Button onClick={sendMessage}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Wählen Sie eine Unterhaltung aus
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}