import { getSupabaseAdmin } from './orders';

export type InquiryRecord = {
  id: string;
  name: string;
  phone: string;
  message: string;
  region: string;
  created_at: string;
};

const memoryInquiries: InquiryRecord[] = [];

export async function saveInquiry(
  inquiry: Omit<InquiryRecord, 'id' | 'created_at'>,
): Promise<InquiryRecord> {
  const supabase = getSupabaseAdmin();
  const row = {
    ...inquiry,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
  };

  if (supabase) {
    const { data, error } = await supabase.from('inquiries').insert(row).select().single();
    if (error) throw new Error(error.message);
    return data as InquiryRecord;
  }

  memoryInquiries.unshift(row);
  return row;
}

export async function listInquiriesByPhone(phone: string): Promise<InquiryRecord[]> {
  const normalized = phone.replace(/\D/g, '');
  const supabase = getSupabaseAdmin();

  if (supabase) {
    const { data, error } = await supabase
      .from('inquiries')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return ((data ?? []) as InquiryRecord[]).filter(
      (i) => i.phone.replace(/\D/g, '') === normalized,
    );
  }

  return memoryInquiries.filter((i) => i.phone.replace(/\D/g, '') === normalized);
}
