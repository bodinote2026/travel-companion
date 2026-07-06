'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Loader2, Phone, ShieldCheck, User } from 'lucide-react';
import { DEFAULT_REGION_CODE } from '@/lib/regions';

function safeReturnUrl(url: string | null): string {
  if (!url || !url.startsWith('/') || url.startsWith('//')) return '/';
  return url;
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = safeReturnUrl(searchParams.get('returnUrl'));

  const [step, setStep] = useState<'phone' | 'verify'>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? '인증번호 발송 실패');
      setPhone(data.phone ?? phone.trim());
      setStep('verify');
    } catch (err) {
      setError(err instanceof Error ? err.message : '인증번호 발송에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phone.trim(),
          code: code.trim(),
          name: name.trim(),
          region: DEFAULT_REGION_CODE,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? '로그인 실패');
      router.push(returnUrl);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : '로그인에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-5 px-4 pb-28 pt-2">
      <p className="text-sm leading-relaxed text-muted-foreground">
        휴대폰 번호로 인증번호를 받아 로그인합니다. 채팅·공동구매 결제·마이페이지 이용 시 필요해요.
      </p>

      {step === 'phone' ? (
        <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
          <label className="block">
            <span className="flex items-center gap-1.5 text-sm font-medium">
              <Phone className="size-4 text-primary" />
              휴대폰 번호
            </span>
            <input
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="01012345678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm"
              required
            />
          </label>
          <button
            type="submit"
            disabled={loading || !phone.trim()}
            className="flex h-12 items-center justify-center rounded-2xl bg-primary text-base font-semibold text-primary-foreground disabled:opacity-70"
          >
            {loading ? <Loader2 className="size-5 animate-spin" /> : '인증번호 받기'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerify} className="flex flex-col gap-4">
          <p className="rounded-xl bg-secondary px-3 py-2 text-sm text-secondary-foreground">
            <span className="font-medium">{phone}</span>으로 인증번호를 보냈습니다.
          </p>
          <label className="block">
            <span className="flex items-center gap-1.5 text-sm font-medium">
              <ShieldCheck className="size-4 text-primary" />
              인증번호 (6자리)
            </span>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="123456"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              className="mt-1.5 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm tracking-widest"
              required
            />
          </label>
          <label className="block">
            <span className="flex items-center gap-1.5 text-sm font-medium">
              <User className="size-4 text-primary" />
              이름
            </span>
            <input
              type="text"
              autoComplete="name"
              placeholder="홍길동"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm"
              required
            />
          </label>
          <button
            type="submit"
            disabled={loading || !code.trim() || !name.trim()}
            className="flex h-12 items-center justify-center rounded-2xl bg-primary text-base font-semibold text-primary-foreground disabled:opacity-70"
          >
            {loading ? <Loader2 className="size-5 animate-spin" /> : '로그인'}
          </button>
          <button
            type="button"
            onClick={() => {
              setStep('phone');
              setCode('');
              setError('');
            }}
            className="text-sm font-medium text-muted-foreground underline-offset-2 hover:underline"
          >
            번호 다시 입력
          </button>
        </form>
      )}

      {error && (
        <p className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
