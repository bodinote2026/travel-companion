import { NextResponse } from 'next/server';
import { listOrdersByPhone } from '@/lib/db/orders';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const phone = searchParams.get('phone');

  if (!phone?.trim()) {
    return NextResponse.json({ error: '연락처가 필요합니다.' }, { status: 400 });
  }

  try {
    const orders = await listOrdersByPhone(phone.trim());
    return NextResponse.json({ orders });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: '내역 조회에 실패했습니다.' }, { status: 500 });
  }
}
