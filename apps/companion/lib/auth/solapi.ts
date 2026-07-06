import { SolapiMessageService } from 'solapi';
import { getOtpExpiresMinutes } from '@/lib/auth/constants';

function requireSolapiConfig() {
  const apiKey = process.env.SOLAPI_API_KEY;
  const apiSecret = process.env.SOLAPI_API_SECRET;
  const from = process.env.SOLAPI_SENDER_PHONE;

  if (!apiKey || !apiSecret || !from) {
    throw new Error('솔라피 환경 변수(SOLAPI_API_KEY, SOLAPI_API_SECRET, SOLAPI_SENDER_PHONE)가 필요합니다.');
  }

  return { apiKey, apiSecret, from: from.replace(/\D/g, '') };
}

export async function sendOtpSms(phone: string, code: string): Promise<void> {
  const { apiKey, apiSecret, from } = requireSolapiConfig();
  const to = phone.replace(/\D/g, '');
  const minutes = getOtpExpiresMinutes();

  const messageService = new SolapiMessageService(apiKey, apiSecret);
  await messageService.send({
    to,
    from,
    text: `[묵호동행] 인증번호는 ${code} 입니다. ${minutes}분 내에 입력해주세요.`,
  });
}
