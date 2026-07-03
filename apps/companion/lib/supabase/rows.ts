import type { Database } from './types';

type Tables = Database['public']['Tables'];

export type OrderInsert = Tables['orders']['Insert'];
export type OrderUpdate = Tables['orders']['Update'];
export type ParticipantInsert = Tables['participants']['Insert'];

/** Supabase Insert/Update는 undefined를 허용하지 않으므로 null로 정규화 */
export function nullToDb<T>(value: T | null | undefined): T | null {
  return value ?? null;
}

export function toOrderInsert(input: {
  id: string;
  created_at: string;
  order_code: string;
  profile_id?: string | null;
  product_id?: string | null;
  product_name: string;
  participant_name: string;
  participant_phone: string;
  region: string;
  amount: number;
  payment_status: OrderInsert['payment_status'];
  imp_uid?: string | null;
  merchant_uid?: string | null;
}): OrderInsert {
  return {
    id: input.id,
    created_at: input.created_at,
    order_code: input.order_code,
    profile_id: nullToDb(input.profile_id),
    product_id: nullToDb(input.product_id),
    product_name: input.product_name,
    participant_name: input.participant_name,
    participant_phone: input.participant_phone,
    region: input.region,
    amount: input.amount,
    payment_status: input.payment_status,
    imp_uid: nullToDb(input.imp_uid),
    merchant_uid: nullToDb(input.merchant_uid),
  };
}

export function toOrderUpdate(input: {
  payment_status?: OrderUpdate['payment_status'];
  imp_uid?: string | null;
  profile_id?: string | null;
}): OrderUpdate {
  const update: OrderUpdate = {};
  if (input.payment_status !== undefined) update.payment_status = input.payment_status;
  if (input.imp_uid !== undefined) update.imp_uid = nullToDb(input.imp_uid);
  if (input.profile_id !== undefined) update.profile_id = nullToDb(input.profile_id);
  return update;
}

export function toParticipantInsert(input: {
  id: string;
  created_at: string;
  profile_id?: string | null;
  product_id?: string | null;
  display_name: string;
  order_code: string;
}): ParticipantInsert {
  return {
    id: input.id,
    created_at: input.created_at,
    profile_id: nullToDb(input.profile_id),
    product_id: nullToDb(input.product_id),
    display_name: input.display_name,
    order_code: input.order_code,
  };
}
