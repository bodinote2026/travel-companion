import { getAirtableConfig } from '@/lib/airtable/config';
import * as airtableChat from '@/lib/airtable/chat';
import type {
  ChatMessageRow,
  ChatRoomRow,
  ChatRoomWithPeer,
  ProfileRow,
} from '@/lib/chat/types';
import { getOrCreateCompanionProfile, getProfileById } from './profiles';

const memoryRooms: ChatRoomRow[] = [];
const memoryMembers: { room_id: string; profile_id: string }[] = [];
const memoryMessages: ChatMessageRow[] = [];

async function findExistingRoomMemory(profileA: string, profileB: string): Promise<ChatRoomRow | null> {
  for (const room of memoryRooms) {
    const members = memoryMembers.filter((m) => m.room_id === room.id).map((m) => m.profile_id);
    if (members.includes(profileA) && members.includes(profileB)) return room;
  }
  return null;
}

export async function getOrCreateChatRoom(input: {
  myProfileId: string;
  peerProfileId?: string;
  companionSeedId?: string;
  region: string;
}): Promise<ChatRoomRow> {
  if (getAirtableConfig()) {
    return airtableChat.getOrCreateChatRoom(input);
  }

  let peerId = input.peerProfileId;
  if (!peerId && input.companionSeedId) {
    const peer = await getOrCreateCompanionProfile(input.companionSeedId, input.region);
    peerId = peer.id;
  }
  if (!peerId) throw new Error('대화 상대가 필요합니다.');
  if (peerId === input.myProfileId) throw new Error('자신과는 대화할 수 없습니다.');

  const existing = await findExistingRoomMemory(input.myProfileId, peerId);
  if (existing) return existing;

  const room: ChatRoomRow = {
    id: crypto.randomUUID(),
    region: input.region,
    last_message_at: null,
    created_at: new Date().toISOString(),
  };
  memoryRooms.push(room);
  memoryMembers.push({ room_id: room.id, profile_id: input.myProfileId });
  memoryMembers.push({ room_id: room.id, profile_id: peerId });
  return room;
}

export async function listChatRooms(profileId: string): Promise<ChatRoomWithPeer[]> {
  if (getAirtableConfig()) {
    return airtableChat.listChatRooms(profileId);
  }

  const roomIds = memoryMembers.filter((m) => m.profile_id === profileId).map((m) => m.room_id);
  const results: ChatRoomWithPeer[] = [];

  for (const roomId of roomIds) {
    const room = memoryRooms.find((r) => r.id === roomId);
    if (!room) continue;
    const peerMember = memoryMembers.find((m) => m.room_id === roomId && m.profile_id !== profileId);
    if (!peerMember) continue;
    const peer = await getProfileById(peerMember.profile_id);
    if (!peer) continue;
    const msgs = memoryMessages.filter((m) => m.room_id === roomId);
    const last = msgs[msgs.length - 1];
    results.push({
      ...room,
      peer: {
        id: peer.id,
        name: peer.name,
        avatar_url: peer.avatar_url,
        companion_seed_id: peer.companion_seed_id,
      },
      last_message: last?.body ?? null,
    });
  }

  return results.sort(
    (a, b) =>
      new Date(b.last_message_at ?? b.created_at).getTime() -
      new Date(a.last_message_at ?? a.created_at).getTime(),
  );
}

export async function isRoomMember(roomId: string, profileId: string): Promise<boolean> {
  if (getAirtableConfig()) {
    return airtableChat.isRoomMember(roomId, profileId);
  }
  return memoryMembers.some((m) => m.room_id === roomId && m.profile_id === profileId);
}

export async function listMessages(
  roomId: string,
  options?: { since?: string },
): Promise<ChatMessageRow[]> {
  if (getAirtableConfig()) {
    return airtableChat.listMessages(roomId, options);
  }

  let messages = memoryMessages.filter((m) => m.room_id === roomId);
  if (options?.since) {
    const sinceMs = new Date(options.since).getTime();
    messages = messages.filter((m) => new Date(m.created_at).getTime() > sinceMs);
  }
  return messages;
}

export async function sendMessage(input: {
  roomId: string;
  senderId: string;
  body: string;
}): Promise<ChatMessageRow> {
  if (getAirtableConfig()) {
    return airtableChat.sendMessage(input);
  }

  const text = input.body.trim();
  if (!text) throw new Error('메시지를 입력해주세요.');

  const now = new Date().toISOString();
  const row: ChatMessageRow = {
    id: crypto.randomUUID(),
    room_id: input.roomId,
    sender_id: input.senderId,
    body: text,
    created_at: now,
  };
  memoryMessages.push(row);
  const room = memoryRooms.find((r) => r.id === input.roomId);
  if (room) room.last_message_at = now;
  return row;
}

export async function getRoomPeer(roomId: string, myProfileId: string): Promise<ProfileRow | null> {
  if (getAirtableConfig()) {
    return airtableChat.getRoomPeer(roomId, myProfileId);
  }
  const peerMember = memoryMembers.find((m) => m.room_id === roomId && m.profile_id !== myProfileId);
  return peerMember ? getProfileById(peerMember.profile_id) : null;
}
