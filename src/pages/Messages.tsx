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
  unread_count?: number;
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

  // Handle deep links - simplified and more robust
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
      let contractorId = searchParams.get("contractor");
      let customerId = searchParams.get("customer");

      // Handle contractor-only deep link (from public profile "Nachricht senden")
      if (contractorId && !projectId) {
        console.log("🔗 Contractor-only deep link:", { contractorId, userId });
        
        // Customer wants to message a contractor - need to find/select a project
        // First check if there are existing conversations with this contractor
        const { data: existingConvs } = await supabase
          .from("conversations")
          .select("id, project:projects(id, title)")
          .eq("customer_id", userId)
          .eq("contractor_id", contractorId)
          .order("updated_at", { ascending: false });

        if (existingConvs && existingConvs.length > 0) {
          // Use the most recent conversation
          console.log("✅ Found existing conversation with contractor:", existingConvs[0].id);
          setSelectedConvId(existingConvs[0].id);
          setShowChat(true);
          return;
        }

        // No existing conversation - check if customer has projects
        const { data: customerProjects } = await supabase
          .from("projects")
          .select("id, title")
          .eq("customer_id", userId)
          .in("status", ["open", "assigned", "in_progress"])
          .order("created_at", { ascending: false });

        if (!customerProjects || customerProjects.length === 0) {
          toast({
            title: "Kein Projekt vorhanden",
            description: "Erstellen Sie zuerst ein Projekt, um den Handwerker zu kontaktieren.",
            variant: "destructive",
          });
          navigate("/kunde/projekt-erstellen");
          return;
        }

        // Use the first/most recent project to start conversation
        const selectedProjectId = customerProjects[0].id;
        console.log("📝 Creating conversation with first project:", selectedProjectId);

        const { data: newConv, error } = await supabase
          .from("conversations")
          .insert({
            project_id: selectedProjectId,
            customer_id: userId,
            contractor_id: contractorId,
            last_message_at: new Date().toISOString(),
          })
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
        return;
      }

      if (!projectId) return;

      console.log("🔗 Deep link detected:", { projectId, contractorId, customerId, userId });

      try {
        // If we're missing either participant, try to get them from the database
        if (!contractorId || !customerId) {
          // Check if user is a contractor
          const { data: contractorData } = await supabase
            .from("contractors")
            .select("id")
            .eq("id", userId)
            .maybeSingle();

          const isUserContractor = !!contractorData;
          
          if (isUserContractor) {
            contractorId = userId;
            // Get customer from project
            if (!customerId) {
              const { data: projectData } = await supabase
                .from("projects")
                .select("customer_id")
                .eq("id", projectId)
                .single();
              customerId = projectData?.customer_id || null;
            }
          } else {
            customerId = userId;
            // Get contractor from matches
            if (!contractorId) {
              const { data: matchData } = await supabase
                .from("matches")
                .select("contractor_id")
                .eq("project_id", projectId)
                .eq("lead_purchased", true)
                .limit(1)
                .maybeSingle();
              contractorId = matchData?.contractor_id || null;
            }
          }
        }

        if (!contractorId || !customerId) {
          console.warn("❌ Could not determine both participants:", { contractorId, customerId });
          return;
        }

        console.log("🔍 Looking for conversation:", { projectId, customerId, contractorId });

        // Check for existing conversation
        const { data: existingConv, error: existingError } = await supabase
          .from("conversations")
          .select("id")
          .eq("project_id", projectId)
          .eq("customer_id", customerId)
          .eq("contractor_id", contractorId)
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
        const { data: newConv, error } = await supabase
          .from("conversations")
          .insert({
            project_id: projectId,
            customer_id: customerId,
            contractor_id: contractorId,
            last_message_at: new Date().toISOString(),
          })
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

  // Global realtime listener for unread message updates
  useEffect(() => {
    if (!userId || conversations.length === 0) return;

    const conversationIds = conversations.map((c) => c.id);

    const channel = supabase
      .channel("global-messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          const msg = payload.new as Message;
          // Only increment unread if message is from someone else and not in the currently open chat
          if (
            msg.sender_id !== userId &&
            conversationIds.includes(msg.conversation_id) &&
            msg.conversation_id !== selectedConvId
          ) {
            setConversations((prev) =>
              prev.map((conv) =>
                conv.id === msg.conversation_id
                  ? { ...conv, unread_count: (conv.unread_count || 0) + 1 }
                  : conv
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, conversations.length, selectedConvId]);

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

      const conversationIds = list.map((c) => c.id);
      const contractorIds = Array.from(
        new Set(list.map((c) => c.contractor_id).filter(Boolean))
      ) as string[];
      const customerIds = Array.from(
        new Set(list.map((c) => c.customer_id).filter(Boolean))
      ) as string[];

      // Fetch contractors, customers, and unread counts in parallel
      const [{ data: contractors }, { data: customers }, { data: unreadMessages }] = await Promise.all([
        contractorIds.length
          ? supabase.from("contractors").select("id, company_name").in("id", contractorIds)
          : Promise.resolve({ data: [] } as any),
        customerIds.length
          ? supabase.from("profiles").select("id, first_name, last_name").in("id", customerIds)
          : Promise.resolve({ data: [] } as any),
        supabase
          .from("messages")
          .select("conversation_id")
          .in("conversation_id", conversationIds)
          .neq("sender_id", uid)
          .eq("read", false),
      ]);

      // Build unread count map
      const unreadMap = new Map<string, number>();
      (unreadMessages || []).forEach((msg: any) => {
        const count = unreadMap.get(msg.conversation_id) || 0;
        unreadMap.set(msg.conversation_id, count + 1);
      });

      const contractorMap = new Map((contractors || []).map((c: any) => [c.id, c]));
      const customerMap = new Map((customers || []).map((p: any) => [p.id, p]));

      const enriched = list.map((conv) => ({
        ...conv,
        contractor: conv.contractor_id ? contractorMap.get(conv.contractor_id) : null,
        customer: conv.customer_id ? customerMap.get(conv.customer_id) : null,
        unread_count: unreadMap.get(conv.id) || 0,
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

    // Mark messages as read in database
    await supabase
      .from("messages")
      .update({ read: true })
      .eq("conversation_id", convId)
      .neq("sender_id", userId);

    // Update local unread count to 0
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === convId ? { ...conv, unread_count: 0 } : conv
      )
    );
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
                const projectLink = conv.project_id
                  ? isUserContractor
                    ? `/handwerker/projekt/${conv.project_id}`
                    : `/kunde/projekt/${conv.project_id}`
                  : null;

                const hasUnread = (conv.unread_count || 0) > 0;

                return (
                  <div
                    key={conv.id}
                    className={cn(
                      "p-3 rounded-lg cursor-pointer transition-colors",
                      selectedConvId === conv.id && "bg-primary/10",
                      hasUnread && selectedConvId !== conv.id
                        ? "bg-green-100 dark:bg-green-900/30 border-l-4 border-green-500 hover:bg-green-50 dark:hover:bg-green-900/40"
                        : "hover:bg-muted"
                    )}
                    onClick={() => {
                      setSelectedConvId(conv.id);
                      setShowChat(true);
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold">{getConversationTitle(conv)}</h3>
                      {hasUnread && (
                        <span className="bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                          {conv.unread_count}
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {conv.project?.title || "Projekt nicht verfügbar"}
                    </span>
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
                      {selectedConversation.project_id ? (
                        <Link
                          to={
                            isContractor
                              ? `/handwerker/projekt/${selectedConversation.project_id}`
                              : `/kunde/projekt/${selectedConversation.project_id}`
                          }
                          className="text-xs md:text-sm text-muted-foreground hover:text-primary flex items-center gap-1"
                        >
                          {selectedConversation.project?.title || "Projekt ansehen"}
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      ) : (
                        <span className="text-xs md:text-sm text-muted-foreground">
                          {selectedConversation.project?.title || "Projekt nicht verfügbar"}
                        </span>
                      )}
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
