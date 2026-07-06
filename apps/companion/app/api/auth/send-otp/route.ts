import { NextResponse } from 'next/server';
import { assertCanSendOtp, generateOtpCode, saveOtpCode } from '@/lib/airtable/otp-codes';
import { sendOtpSms } from '@/lib/auth/solapi';
import { normalizePhone } from '@/lib/user-profile';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone } = body as { phone?: string };

    if (!phone?.trim()) {
      return NextResponse.json({ error: '휴대폰 번호를 입력해주세요.' }, { status: 400 });
    }

    const normalized = normalizePhone(phone);
    if (normalized.length < 10 || normalized.length > 11) {
      return NextResponse.json({ error: '올바른 휴대폰 번호를 입력해주세요.' }, { status: 400 });
    }

    await assertCanSendOtp(normalized);

    const code = generateOtpCode();
    await saveOtpCode(normalized, code);
    await sendOtpSms(normalized, code);

    return NextResponse.json({ success: true, phone: normalized });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '인증번호 발송에 실패했습니다.' },
      { status: 500 },
    );
  }
}
