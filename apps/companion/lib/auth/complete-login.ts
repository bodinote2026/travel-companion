import { upsertProfile } from '@/lib/db/profiles';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { normalizePhone } from '@/lib/user-profile';
import { upsertUser } from '@/lib/airtable/users';
import type { SessionUser } from './session';

export async function completeLogin(input: {
  name: string;
  phone: string;
  region: string;
}): Promise<SessionUser> {
  const phone = normalizePhone(input.phone);
  const name = input.name.trim();
  const region = input.region;

  const airtableUser = await upsertUser({ phone, name, region });

  let appUserId = airtableUser.id;

  if (getSupabaseAdmin()) {
    const supabaseProfile = await upsertProfile({ phone, name, region });
    appUserId = supabaseProfile.id;
  }

  return {
    id: appUserId,
    phone,
    name,
    region,
    airtableId: airtableUser.id,
  };
}
