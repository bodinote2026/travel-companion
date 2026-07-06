export type ProfileRow = {
  id: string;
  phone: string;
  name: string;
  region: string;
  avatar_url: string | null;
  companion_seed_id: string | null;
  created_at: string;
  updated_at: string;
};

export type ChatRoomRow = {
  id: string;
  region: string;
  last_message_at: string | null;
  created_at: string;
};

export type ChatMessageRow = {
  id: string;
  room_id: string;
  sender_id: string;
  body: string;
  created_at: string;
};

export type ChatRoomWithPeer = ChatRoomRow & {
  peer: Pick<ProfileRow, 'id' | 'name' | 'avatar_url' | 'companion_seed_id'>;
  last_message?: string | null;
};

export const CHAT_POLL_INTERVAL_MS = 4000;
