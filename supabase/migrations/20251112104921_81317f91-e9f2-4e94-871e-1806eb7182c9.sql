-- Create Conversations Table
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  contractor_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_message_at TIMESTAMPTZ,
  UNIQUE(project_id, customer_id, contractor_id)
);

-- Create Messages Table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- RLS Policies
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Users view own conversations
CREATE POLICY "users_view_own_conversations" ON conversations
  FOR SELECT USING (
    auth.uid() = customer_id OR auth.uid() = contractor_id
  );

-- Users create conversations
CREATE POLICY "users_create_conversations" ON conversations
  FOR INSERT WITH CHECK (
    auth.uid() = customer_id OR auth.uid() = contractor_id
  );

-- Users view messages in their conversations
CREATE POLICY "users_view_own_messages" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE id = messages.conversation_id 
      AND (customer_id = auth.uid() OR contractor_id = auth.uid())
    )
  );

-- Users send messages
CREATE POLICY "users_send_messages" ON messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE id = conversation_id 
      AND (customer_id = auth.uid() OR contractor_id = auth.uid())
    )
  );

-- Users update message read status
CREATE POLICY "users_update_message_read" ON messages
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE id = messages.conversation_id 
      AND (customer_id = auth.uid() OR contractor_id = auth.uid())
    )
  );