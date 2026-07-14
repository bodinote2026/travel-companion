/** Nickname 정규화·중복 판별용 키 */

/** 저장용 표시 문자열 — 양끝 공백 제거, 내부 연속 공백 1칸 */
export function displayNickname(nickname: string): string {
  return nickname.trim().replace(/\s+/g, ' ');
}

/**
 * 중복 비교 키 — displayNickname + 소문자.
 * "짜리" / "짜리 " / "짜  리" / "ZZARI"·"zzari" 를 같은 닉네임으로 취급.
 */
export function normalizeNicknameKey(nickname: string): string {
  return displayNickname(nickname).toLowerCase();
}
