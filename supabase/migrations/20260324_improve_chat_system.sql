-- Chat System Improvements
-- Adds read status, conversation linking, and strengthens RLS policies

-- Add read column to messages table
ALTER TABLE messages ADD COLUMN IF NOT EXISTS read boolean DEFAULT false;

-- Add conversation_id to messages for explicit linking
ALTER TABLE messages ADD COLUMN IF NOT EXISTS conversation_id uuid 
  REFERENCES conversations(id) ON DELETE CASCADE;

-- Create indexes for faster message queries
CREATE INDEX IF NOT EXISTS idx_messages_gig_id ON messages(gig_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_recipient ON messages(sender_id, recipient_id);

-- Drop existing weak policy
DROP POLICY IF EXISTS "Users can send messages" ON messages;

-- Create stronger messages INSERT policy that verifies gig participation
CREATE POLICY "users_can_send_messages" ON messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND (
      -- User must be the gig client
      EXISTS (SELECT 1 FROM gigs WHERE gigs.id = gig_id AND gigs.client_id = auth.uid())
      OR
      -- OR user must have accepted application for the gig
      EXISTS (
        SELECT 1 FROM applications 
        WHERE applications.gig_id = gig_id 
        AND applications.freelancer_id = auth.uid() 
        AND applications.status = 'accepted'
      )
    )
  );

-- Create policy to update read status (only recipient can mark as read)
CREATE POLICY "users_can_update_own_messages" ON messages
  FOR UPDATE USING (
    auth.uid() = recipient_id
  );

-- Enable realtime for messages and conversations
-- Using DO block to ignore errors if already enabled
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE messages;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'messages table already in publication (OK to ignore)';
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'conversations table already in publication (OK to ignore)';
END $$;

-- Create trigger to auto-fill conversation_id when inserting messages
CREATE OR REPLACE FUNCTION fill_conversation_id()
RETURNS TRIGGER AS $$
BEGIN
  -- Find or create conversation for this gig
  IF NEW.conversation_id IS NULL THEN
    SELECT id INTO NEW.conversation_id
    FROM conversations
    WHERE gig_id = NEW.gig_id
    LIMIT 1;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_conversation_id ON messages;
CREATE TRIGGER set_conversation_id
  BEFORE INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION fill_conversation_id();

-- Create function to update conversation's updated_at when new message is sent
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations 
  SET updated_at = NOW()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_conversation_on_message ON messages;
CREATE TRIGGER update_conversation_on_message
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_timestamp();
