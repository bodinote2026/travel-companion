import type { ChatMessageRow, ChatRoomRow, ChatRoomWithPeer } from '@/lib/chat/types';
import { createRecord, escapeAirtableFormula, getRecord, listRecords, updateRecord } from './client';
import { requireAirtableConfig } from './config';
import { getUserById, toProfileRow, userDisplayName } from './users';

type ChatRoomFields = {
  Region: string;
  'Last Message At'?: string;
};

type ChatRoomMemberFields = {
  'Room ID': string;
  'User ID': string;
  'Last Read At'?: string;
};

type ChatMessageFields = {
  'Room ID': string;
  'Sender ID': string;
  Body: string;
};

type MemberRecord = {
  id: string;
  fields: ChatRoomMemberFields;
};

function mapRoom(record: { id: string; createdTime?: string; fields: ChatRoomFields }): ChatRoomRow {
  return {
    id: record.id,
    region: record.fields.Region,
    last_message_at: record.fields['Last Message At'] ?? null,
    created_at: record.createdTime ?? new Date().toISOString(),
  };
}

function mapMessage(record: {
  id: string;
  createdTime?: string;
  fields: ChatMessageFields;
}): ChatMessageRow {
  return {
    id: record.id,
    room_id: record.fields['Room ID'],
    sender_id: record.fields['Sender ID'],
    body: record.fields.Body,
    created_at: record.createdTime ?? new Date().toISOString(),
  };
}

function countUnread(
  messages: ChatMessageRow[],
  myProfileId: string,
  lastReadAt: string | null | undefined,
): number {
  const readMs = lastReadAt ? new Date(lastReadAt).getTime() : 0;
  return messages.filter(
    (m) => m.sender_id !== myProfileId && new Date(m.created_at).getTime() > readMs,
  ).length;
}

async function findExistingRoom(profileA: string, profileB: string): Promise<ChatRoomRow | null> {
  const config = requireAirtableConfig();

  const membersA = await listRecords<ChatRoomMemberFields>(config.chatRoomMembersTable, {
    filterByFormula: `{User ID}="${escapeAirtableFormula(profileA)}"`,
  });

  for (const member of membersA) {
    const roomId = member.fields['Room ID'];
    const membersB = await listRecords<ChatRoomMemberFields>(config.chatRoomMembersTable, {
      filterByFormula: `AND({Room ID}="${escapeAirtableFormula(roomId)}",{User ID}="${escapeAirtableFormula(profileB)}")`,
      maxRecords: 1,
    });
    if (membersB.length === 0) continue;

    const roomRecord = await getRecord<ChatRoomFields>(config.chatRoomsTable, roomId);
    return mapRoom(roomRecord);
  }

  return null;
}

async function getMembership(
  roomId: string,
  userId: string,
): Promise<MemberRecord | null> {
  const config = requireAirtableConfig();
  const formula = `AND({Room ID}="${escapeAirtableFormula(roomId)}",{User ID}="${escapeAirtableFormula(userId)}")`;
  const records = await listRecords<ChatRoomMemberFields>(config.chatRoomMembersTable, {
    filterByFormula: formula,
    maxRecords: 1,
  });
  if (records.length === 0) return null;
  return { id: records[0].id, fields: records[0].fields };
}

export async function getOrCreateChatRoom(input: {
  myProfileId: string;
  peerProfileId?: string;
  companionSeedId?: string;
  region: string;
}): Promise<ChatRoomRow> {
  const { getOrCreateCompanionUser } = await import('./users');

  let peerId = input.peerProfileId;
  if (!peerId && input.companionSeedId) {
    const peer = await getOrCreateCompanionUser(input.companionSeedId, input.region);
    peerId = peer.id;
  }
  if (!peerId) throw new Error('대화 상대가 필요합니다.');
  if (peerId === input.myProfileId) throw new Error('자신과는 대화할 수 없습니다.');

  const existing = await findExistingRoom(input.myProfileId, peerId);
  if (existing) return existing;

  const config = requireAirtableConfig();
  const created = await createRecord<ChatRoomFields>(config.chatRoomsTable, {
    Region: input.region,
  });
  const room = mapRoom(created);
  const now = new Date().toISOString();

  await createRecord<ChatRoomMemberFields>(config.chatRoomMembersTable, {
    'Room ID': room.id,
    'User ID': input.myProfileId,
    'Last Read At': now,
  }, { typecast: true });
  await createRecord<ChatRoomMemberFields>(config.chatRoomMembersTable, {
    'Room ID': room.id,
    'User ID': peerId,
  });

  return room;
}

export async function listChatRooms(profileId: string): Promise<ChatRoomWithPeer[]> {
  const config = requireAirtableConfig();

  const memberships = await listRecords<ChatRoomMemberFields>(config.chatRoomMembersTable, {
    filterByFormula: `{User ID}="${escapeAirtableFormula(profileId)}"`,
  });

  const results: ChatRoomWithPeer[] = [];

  for (const membership of memberships) {
    const roomId = membership.fields['Room ID'];
    const roomMembers = await listRecords<ChatRoomMemberFields>(config.chatRoomMembersTable, {
      filterByFormula: `{Room ID}="${escapeAirtableFormula(roomId)}"`,
    });

    const peerId = roomMembers
      .map((m) => m.fields['User ID'])
      .find((id) => id !== profileId);
    if (!peerId) continue;

    const peerUser = await getUserById(peerId);
    if (!peerUser) continue;

    const roomRecord = await getRecord<ChatRoomFields>(config.chatRoomsTable, roomId);
    const room = mapRoom(roomRecord);

    const messages = await listRecords<ChatMessageFields>(config.chatMessagesTable, {
      filterByFormula: `{Room ID}="${escapeAirtableFormula(roomId)}"`,
    });
    const sortedMessages = messages.map(mapMessage).sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );
    const last = sortedMessages[sortedMessages.length - 1];
    const myLastRead = membership.fields['Last Read At'] ?? null;

    results.push({
      ...room,
      peer: {
        id: peerUser.id,
        name: userDisplayName(peerUser),
        avatar_url: peerUser.avatarUrl,
        companion_seed_id: peerUser.companionSeedId,
      },
      last_message: last?.body ?? null,
      unread_count: countUnread(sortedMessages, profileId, myLastRead),
    });
  }

  return results.sort(
    (a, b) =>
      new Date(b.last_message_at ?? b.created_at).getTime() -
      new Date(a.last_message_at ?? a.created_at).getTime(),
  );
}

export async function countTotalUnread(profileId: string): Promise<number> {
  const rooms = await listChatRooms(profileId);
  return rooms.reduce((sum, room) => sum + (room.unread_count ?? 0), 0);
}

export async function isRoomMember(roomId: string, profileId: string): Promise<boolean> {
  const membership = await getMembership(roomId, profileId);
  return membership != null;
}

export async function markRoomAsRead(roomId: string, profileId: string): Promise<string> {
  const membership = await getMembership(roomId, profileId);
  if (!membership) throw new Error('채팅방 멤버가 아닙니다.');

  const config = requireAirtableConfig();
  const now = new Date().toISOString();
  await updateRecord<ChatRoomMemberFields>(
    config.chatRoomMembersTable,
    membership.id,
    { 'Last Read At': now },
    { typecast: true },
  );
  return now;
}

export async function getPeerLastReadAt(
  roomId: string,
  myProfileId: string,
): Promise<string | null> {
  const config = requireAirtableConfig();
  const members = await listRecords<ChatRoomMemberFields>(config.chatRoomMembersTable, {
    filterByFormula: `{Room ID}="${escapeAirtableFormula(roomId)}"`,
  });
  const peer = members.find((m) => m.fields['User ID'] !== myProfileId);
  return peer?.fields['Last Read At'] ?? null;
}

export async function listMessages(
  roomId: string,
  options?: { since?: string },
): Promise<ChatMessageRow[]> {
  const config = requireAirtableConfig();
  const records = await listRecords<ChatMessageFields>(config.chatMessagesTable, {
    filterByFormula: `{Room ID}="${escapeAirtableFormula(roomId)}"`,
  });

  let messages = records
    .map(mapMessage)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

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
  const text = input.body.trim();
  if (!text) throw new Error('메시지를 입력해주세요.');

  const config = requireAirtableConfig();
  const now = new Date().toISOString();

  const created = await createRecord<ChatMessageFields>(config.chatMessagesTable, {
    'Room ID': input.roomId,
    'Sender ID': input.senderId,
    Body: text,
  });

  await updateRecord<ChatRoomFields>(config.chatRoomsTable, input.roomId, {
    'Last Message At': now,
  });

  // 보낸 사람은 해당 시점까지 읽은 것으로 처리
  try {
    await markRoomAsRead(input.roomId, input.senderId);
  } catch {
    // 멤버십 갱신 실패해도 메시지 전송은 유지
  }

  return mapMessage(created);
}

export async function getRoomPeer(roomId: string, myProfileId: string) {
  const config = requireAirtableConfig();
  const members = await listRecords<ChatRoomMemberFields>(config.chatRoomMembersTable, {
    filterByFormula: `{Room ID}="${escapeAirtableFormula(roomId)}"`,
  });

  const peerId = members.map((m) => m.fields['User ID']).find((id) => id !== myProfileId);
  if (!peerId) return null;

  const user = await getUserById(peerId);
  return user ? toProfileRow(user) : null;
}
