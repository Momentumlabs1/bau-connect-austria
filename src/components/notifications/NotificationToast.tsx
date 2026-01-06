import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/stores/authStore';
import { Bell, MessageSquare, CheckCircle, Euro } from 'lucide-react';

export const NotificationToast = () => {
  const navigate = useNavigate();
  const { user, isContractor } = useAuth();

  useEffect(() => {
    if (!user) return;

    console.log('🔔 Setting up realtime notifications for user:', user.id);

    // Subscribe to notifications table
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `handwerker_id=eq.${user.id}`
        },
        (payload) => {
          console.log('📨 New notification:', payload);
          const notification = payload.new;

          // Choose icon based on notification type
          let Icon = Bell;
          if (notification.type === 'new_message') Icon = MessageSquare;
          if (notification.type === 'offer_accepted') Icon = CheckCircle;
          if (notification.type === 'new_lead') Icon = Euro;

          // Show toast
          toast(notification.title, {
            description: notification.body,
            icon: <Icon className="w-4 h-4" />,
            duration: 5000
          });
        }
      )
      .subscribe();

    // Subscribe to new messages
    const messagesChannel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          console.log('💬 New message:', payload);
          const message = payload.new;
          
          // Only show toast if message is not from current user
          if (message.sender_id !== user.id) {
            toast('Neue Nachricht', {
              description: message.message.substring(0, 100) + (message.message.length > 100 ? '...' : ''),
              icon: <MessageSquare className="w-4 h-4" />,
              duration: 5000,
              action: {
                label: 'Öffnen',
                onClick: () => navigate(`/nachrichten?conversation=${message.conversation_id}`)
              }
            });
          }
        }
      )
      .subscribe();

    // Subscribe to new matches (for contractors) - always initialize but conditionally subscribe
    let matchesChannel: ReturnType<typeof supabase.channel> | null = null;
    
    if (isContractor) {
      matchesChannel = supabase
        .channel('matches')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'matches',
            filter: `contractor_id=eq.${user.id}`
          },
          (payload) => {
            console.log('🎯 New match:', payload);
            toast('Neuer Lead verfügbar!', {
              description: 'Ein neues Projekt passt zu deinem Profil',
              icon: <Euro className="w-4 h-4" />,
              duration: 5000
            });
          }
        )
        .subscribe();
    }

    // Always use the same cleanup pattern regardless of isContractor
    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(messagesChannel);
      if (matchesChannel) {
        supabase.removeChannel(matchesChannel);
      }
    };
  }, [user, isContractor]);

  return null; // This component doesn't render anything
};
