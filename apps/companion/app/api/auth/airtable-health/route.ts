import { NextResponse } from 'next/server';
import { listRecords } from '@/lib/airtable/client';
import { getAirtableConfig } from '@/lib/airtable/config';

type CheckResult = {
  ok: boolean;
  baseId?: string;
  table?: string;
  error?: string;
};

async function checkTable(table: string): Promise<CheckResult> {
  const config = getAirtableConfig();
  if (!config) {
    return { ok: false, error: 'AIRTABLE_PERSONAL_ACCESS_TOKEN 또는 AIRTABLE_BASE_ID가 없습니다.' };
  }

  try {
    await listRecords(table, { maxRecords: 1 });
    return { ok: true, baseId: config.baseId, table };
  } catch (error) {
    return {
      ok: false,
      baseId: config.baseId,
      table,
      error: error instanceof Error ? error.message : '알 수 없는 오류',
    };
  }
}

/** Airtable 연결 진단 — 전체 테이블 접근 테스트 */
export async function GET() {
  const config = getAirtableConfig();
  if (!config) {
    return NextResponse.json(
      {
        ok: false,
        error: 'Airtable 환경 변수가 설정되지 않았습니다.',
        required: ['AIRTABLE_PERSONAL_ACCESS_TOKEN', 'AIRTABLE_BASE_ID'],
      },
      { status: 500 },
    );
  }

  const [users, otp, products, orders, participants, chatRooms, chatMembers, chatMessages] =
    await Promise.all([
      checkTable(config.usersTable),
      checkTable(config.otpTable),
      checkTable(config.productsTable),
      checkTable(config.ordersTable),
      checkTable(config.participantsTable),
      checkTable(config.chatRoomsTable),
      checkTable(config.chatRoomMembersTable),
      checkTable(config.chatMessagesTable),
    ]);

  const commerceOk = products.ok && orders.ok && participants.ok;
  const chatOk = chatRooms.ok && chatMembers.ok && chatMessages.ok;

  return NextResponse.json({
    ok: users.ok && commerceOk && chatOk,
    config: {
      baseId: config.baseId,
      usersTable: config.usersTable,
      otpTable: config.otpTable,
      productsTable: config.productsTable,
      ordersTable: config.ordersTable,
      participantsTable: config.participantsTable,
      chatRoomsTable: config.chatRoomsTable,
      chatRoomMembersTable: config.chatRoomMembersTable,
      chatMessagesTable: config.chatMessagesTable,
    },
    checks: {
      users,
      otp,
      products,
      orders,
      participants,
      chatRooms,
      chatMembers,
      chatMessages,
    },
  });
}
