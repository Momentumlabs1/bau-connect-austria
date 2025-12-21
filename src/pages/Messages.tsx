import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Send, Loader2, MessageSquare, ExternalLink, ArrowLeft } from "lucide-react";
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
    searchParams.get("conversation")
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [showChat, setShowChat] = useState(Boolean(searchParams.get("conversation")));

  useEffect(() => {
    checkAuthAndLoad();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle deep links
  useEffect(() => {
    const handleDeepLink = async () => {
      if (!userId) return;

      const conversationParam = searchParams.get("conversation");
      if (conversationParam) {
        setSelectedConvId(conversationParam);
        setShowChat(true);
        return;
      }

      const projectId = searchParams.get("project");
      const contractorId = searchParams.get("contractor");
      const customerId = searchParams.get("customer");

      if (!projectId) return;

      const isUserCustomer = (customerId && userId === customerId) || (!!contractorId && userId !== contractorId && !customerId);
      const isUserContractor = (contractorId && userId === contractorId) || (!!customerId && userId !== customerId && !contractorId);

      const otherParticipantId = isUserCustomer ? contractorId : isUserContractor ? customerId : null;

      if (!otherParticipantId) {
        console.warn("🔗 Deep link missing participant:", { projectId, contractorId, customerId, userId });
        return;
      }

      console.log("🔗 Deep link detected:", {
        projectId,
        userId,
        otherParticipantId,
        role: isUserCustomer ? "customer" : "contractor",
      });

      try {
        const { data: existingConv, error: existingError } = await supabase
          .from("conversations")
          .select("id")
          .or(
            `and(project_id.eq.${projectId},customer_id.eq.${userId},contractor_id.eq.${otherParticipantId}),and(project_id.eq.${projectId},contractor_id.eq.${userId},customer_id.eq.${otherParticipantId})`
          )
          .maybeSingle();

        if (existingError) {
          console.error("❌ Error checking existing conversation:", existingError);
        }

        if (existingConv?.id) {
          console.log("✅ Found existing conversation:", existingConv.id);
          setSelectedConvId(existingConv.id);
          setShowChat(true);
          return;
        }

        console.log("📝 Creating new conversation...");
        const insertPayload = isUserCustomer
          ? {
              project_id: projectId,
              customer_id: userId,
              contractor_id: otherParticipantId,
              last_message_at: new Date().toISOString(),
            }
          : {
              project_id: projectId,
              contractor_id: userId,
              customer_id: otherParticipantId,
              last_message_at: new Date().toISOString(),
            };

        const { data: newConv, error } = await supabase
          .from("conversations")
          .insert(insertPayload)
          .select("id")
          .single();

        if (error) {
          console.error("❌ Error creating conversation:", error);
          toast({
            title: "Fehler",
            description: "Konversation konnte nicht erstellt werden",
            variant: "destructive",
          });
          return;
        }

        console.log("✅ Created new conversation:", newConv.id);
        await loadConversations(userId);
        setSelectedConvId(newConv.id);
        setShowChat(true);
      } catch (error) {
        console.error("❌ Deep link handling failed:", error);
      }
    };

    handleDeepLink();
  }, [userId, searchParams]);

  useEffect(() => {
    if (!selectedConvId) return;
    loadMessages(selectedConvId);
    const cleanup = subscribeToMessages(selectedConvId);
    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedConvId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const checkAuthAndLoad = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/login");
      return;
    }
    setUserId(session.user.id);
    await loadConversations(session.user.id);
    setLoading(false);
  };

  const loadConversations = async (uid: string) => {
    try {
      const { data, error } = await supabase
        .from("conversations")
        .select(`*, project:projects(title)`)
        .or(`customer_id.eq.${uid},contractor_id.eq.${uid}`)
        .order("updated_at", { ascending: false });

      if (error) {
        console.error("❌ Error loading conversations:", error);
        toast({
          title: "Fehler",
          description: "Unterhaltungen konnten nicht geladen werden.",
          variant: "destructive",
        });
        setConversations([]);
        return;
      }

      const list = (data || []) as any[];
      if (list.length === 0) {
        setConversations([]);
        return;
      }

      const contractorIds = Array.from(
        new Set(list.map((c) => c.contractor_id).filter(Boolean))
      ) as string[];
      const customerIds = Array.from(
        new Set(list.map((c) => c.customer_id).filter(Boolean))
      ) as string[];

      const [{ data: contractors }, { data: customers }] = await Promise.all([
        contractorIds.length
          ? supabase.from("contractors").select("id, company_name").in("id", contractorIds)
          : Promise.resolve({ data: [] } as any),
        customerIds.length
          ? supabase.from("profiles").select("id, first_name, last_name").in("id", customerIds)
          : Promise.resolve({ data: [] } as any),
      ]);

      const contractorMap = new Map((contractors || []).map((c: any) => [c.id, c]));
      const customerMap = new Map((customers || []).map((p: any) => [p.id, p]));

      const enriched = list.map((conv) => ({
        ...conv,
        contractor: conv.contractor_id ? contractorMap.get(conv.contractor_id) : null,
        customer: conv.customer_id ? customerMap.get(conv.customer_id) : null,
      }));

      setConversations(enriched as any);
    } catch (e) {
      console.error("💥 loadConversations failed:", e);
      setConversations([]);
    }
  };

  const loadMessages = async (convId: string) => {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", convId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("❌ Error loading messages:", error);
      toast({
        title: "Fehler",
        description: "Nachrichten konnten nicht geladen werden.",
        variant: "destructive",
      });
      setMessages([]);
      return;
    }

    setMessages(data || []);

    await supabase
      .from("messages")
      .update({ read: true })
      .eq("conversation_id", convId)
      .neq("sender_id", userId);
  };

  const subscribeToMessages = (convId: string) => {
    const channel = supabase
      .channel(`messages:${convId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${convId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConvId || !userId) return;

    try {
      const trimmedMessage = newMessage.trim();

      if (trimmedMessage.length === 0) {
        toast({
          title: "Fehler",
          description: "Nachricht darf nicht leer sein.",
          variant: "destructive",
        });
        return;
      }

      if (trimmedMessage.length > 5000) {
        toast({
          title: "Nachricht zu lang",
          description: "Nachricht darf maximal 5000 Zeichen lang sein.",
          variant: "destructive",
        });
        return;
      }

      if (/<script|javascript:|on\w+=/i.test(trimmedMessage)) {
        toast({
          title: "Ungültige Nachricht",
          description: "Nachricht enthält nicht erlaubte Zeichen.",
          variant: "destructive",
        });
        return;
      }

      console.log("📤 Sending message...", { conversation_id: selectedConvId });

      const { error: insertError } = await supabase.from("messages").insert({
        conversation_id: selectedConvId,
        sender_id: userId,
        message: trimmedMessage,
      });

      if (insertError) {
        console.error("❌ Error inserting message:", insertError);
        throw insertError;
      }

      const { error: updateError } = await supabase
        .from("conversations")
        .update({
          updated_at: new Date().toISOString(),
          last_message_at: new Date().toISOString(),
        })
        .eq("id", selectedConvId);

      if (updateError) {
        console.error("❌ Error updating conversation:", updateError);
      }

      console.log("✅ Message sent successfully");
      setNewMessage("");

      if (selectedConversation && otherParticipantId) {
        supabase.functions
          .invoke("send-message-notification", {
            body: {
              conversationId: selectedConvId,
              senderId: userId,
              recipientId: otherParticipantId,
              messagePreview: trimmedMessage,
            },
          })
          .catch((err) => console.error("Email notification failed:", err));
      }
    } catch (error: any) {
      console.error("💥 Send message failed:", error);
      toast({
        title: "Fehler beim Senden",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getConversationTitle = (conv: Conversation) => {
    const iAmContractor = conv.contractor_id === userId;

    if (iAmContractor) {
      const fn = conv.customer?.first_name?.trim();
      const ln = conv.customer?.last_name?.trim();
      const full = [fn, ln].filter(Boolean).join(" ").trim();
      return full || "Kunde";
    }

    return conv.contractor?.company_name || "Handwerker";
  };

  const selectedConversation = conversations.find((c) => c.id === selectedConvId);
  const isContractor = selectedConversation?.contractor_id === userId;
  const otherParticipantId = isContractor
    ? selectedConversation?.customer_id
    : selectedConversation?.contractor_id;

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
              <Button onClick={() => navigate("/kunde/projekt-erstellen")}>
                Projekt erstellen
              </Button>
              <Button variant="outline" onClick={() => navigate("/handwerker/dashboard")}>
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
        <h1 className="text-2xl md:text-3xl font-bold mb-6">Nachrichten</h1>

        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Conversations Sidebar */}
          <Card className={`p-4 overflow-y-auto ${showChat ? "hidden lg:block" : "block"}`}>
            <h2 className="text-xl font-bold mb-4">Unterhaltungen</h2>
            <div className="space-y-2">
              {conversations.map((conv) => {
                const isUserContractor = conv.contractor_id === userId;
                const projectLink = isUserContractor
                  ? `/handwerker/projekt/${conv.project_id}`
                  : `/kunde/projekt/${conv.project_id}`;

                return (
                  <div
                    key={conv.id}
                    className={cn(
                      "p-3 rounded-lg cursor-pointer hover:bg-muted transition-colors",
                      selectedConvId === conv.id && "bg-primary/10"
                    )}
                    onClick={() => {
                      setSelectedConvId(conv.id);
                      setShowChat(true);
                    }}
                  >
                    <h3 className="font-semibold">{getConversationTitle(conv)}</h3>
                    <Link
                      to={projectLink}
                      className="text-sm text-primary hover:underline flex items-center gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {conv.project?.title || "Projekt"}
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Messages Area */}
          <Card
            className={`lg:col-span-2 p-4 flex flex-col ${!showChat && !selectedConvId ? "hidden lg:flex" : "flex"}`}
          >
            {selectedConvId && selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="border-b pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="lg:hidden"
                      onClick={() => setShowChat(false)}
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex-1">
                      <h3 className="font-semibold text-base md:text-lg">
                        {isContractor ? (
                          <span>{getConversationTitle(selectedConversation)}</span>
                        ) : (
                          <Link
                            to={`/handwerker/${selectedConversation.contractor_id}`}
                            className="hover:text-primary transition-colors"
                          >
                            {getConversationTitle(selectedConversation)}
                          </Link>
                        )}
                      </h3>
                      <Link
                        to={
                          isContractor
                            ? `/handwerker/projekt/${selectedConversation.project_id}`
                            : `/kunde/projekt/${selectedConversation.project_id}`
                        }
                        className="text-xs md:text-sm text-muted-foreground hover:text-primary flex items-center gap-1"
                      >
                        {selectedConversation.project?.title || "Projekt"}
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Messages List */}
                <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex",
                        msg.sender_id === userId ? "justify-end" : "justify-start"
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[85%] md:max-w-[70%] rounded-lg p-3",
                          msg.sender_id === userId
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        )}
                      >
                        <p className="text-sm break-words">{msg.message}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {new Date(msg.created_at).toLocaleTimeString("de-DE", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                    placeholder="Nachricht eingeben..."
                    className="text-sm md:text-base"
                  />
                  <Button onClick={sendMessage} size="icon">
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
