# 묵호 동행 · 웹 MVP

Next.js 웹앱 — 묵호 지역 동행 찾기 + 공동구매 + 1:1 채팅 + 마이페이지.

**Repository:** https://github.com/bodinote2026/travel-companion  
**App path:** `apps/companion`

## 로컬 실행

```bash
# 저장소 루트
git clone https://github.com/bodinote2026/travel-companion.git
cd travel-companion
npm install
npm run dev
# http://localhost:3001
```

## Vercel 배포 (bodinote 팀)

| 설정 | 값 |
|------|-----|
| Git Repository | `bodinote2026/travel-companion` |
| Root Directory | `apps/companion` |
| Production Branch | `main` |

환경 변수는 `.env.local.example` 참고 (`NEXT_PUBLIC_SUPABASE_*`, `SUPABASE_SECRET_KEY` 등).

Supabase SQL: `supabase/schema.sql` → Dashboard SQL Editor에서 실행.

## 범위

- ✅ 묵호 지역 데이터, GPS 거리·각도 (화면 사용 중)
- ✅ 공동구매, PortOne(아임포트) 테스트 PG
- ✅ Supabase 1:1 채팅 (Realtime), 마이페이지·주문 내역
