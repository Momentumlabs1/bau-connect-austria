import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

/**
 * Hook for navigating to chat with proper conversation handling.
 * Finds or creates a conversation before navigating.
 */
export const useChatNavigation = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isNavigating, setIsNavigating] = useState(false);

  /**
   * Navigate to chat with a specific conversation.
   * If conversationId is provided, navigate directly.
   * Otherwise, find or create a conversation based on projectId and participant IDs.
   */
  const navigateToChat = async ({
    conversationId,
    projectId,
    customerId,
    contractorId,
  }: {
    conversationId?: string;
    projectId?: string;
    customerId?: string;
    contractorId?: string;
  }) => {
    if (isNavigating) return;
    
    // If we already have a conversation ID, navigate directly
    if (conversationId) {
      navigate(`/nachrichten?conversation=${conversationId}`);
      return;
    }

    // Need both projectId and both participant IDs
    if (!projectId || !customerId || !contractorId) {
      console.error("❌ useChatNavigation: Missing required params", {
        projectId,
        customerId,
        contractorId,
      });
      toast({
        title: "Navigation nicht möglich",
        description: "Fehlende Projektinformationen für den Chat.",
        variant: "destructive",
      });
      return;
    }

    setIsNavigating(true);

    try {
      // Check for existing conversation
      const { data: existingConv, error: findError } = await supabase
        .from("conversations")
        .select("id")
        .eq("project_id", projectId)
        .eq("customer_id", customerId)
        .eq("contractor_id", contractorId)
        .maybeSingle();

      if (findError) {
        console.error("❌ Error finding conversation:", findError);
        throw findError;
      }

      if (existingConv?.id) {
        console.log("✅ Found existing conversation:", existingConv.id);
        navigate(`/nachrichten?conversation=${existingConv.id}`);
        return;
      }

      // Create new conversation
      console.log("📝 Creating new conversation...");
      const { data: newConv, error: createError } = await supabase
        .from("conversations")
        .insert({
          project_id: projectId,
          customer_id: customerId,
          contractor_id: contractorId,
          last_message_at: new Date().toISOString(),
        })
        .select("id")
        .single();

      if (createError) {
        console.error("❌ Error creating conversation:", createError);
        throw createError;
      }

      console.log("✅ Created new conversation:", newConv.id);
      navigate(`/nachrichten?conversation=${newConv.id}`);
    } catch (error: any) {
      console.error("💥 Chat navigation failed:", error);
      toast({
        title: "Fehler",
        description: "Chat konnte nicht geöffnet werden.",
        variant: "destructive",
      });
    } finally {
      setIsNavigating(false);
    }
  };

  return { navigateToChat, isNavigating };
};
