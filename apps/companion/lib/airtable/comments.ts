import {
  createRecord,
  escapeAirtableFormula,
  listRecords,
} from './client';
import { requireAirtableConfig } from './config';
import { resolveAuthorAvatars } from '@/lib/users/avatars';

export type CommentTargetType = 'gathering' | 'product';

export type AirtableCommentFields = {
  'Target Type'?: CommentTargetType;
  'Target ID'?: string;
  'Author ID'?: string;
  'Author Name'?: string;
  Body?: string;
};

export type CommentRecord = {
  id: string;
  target_type: CommentTargetType;
  target_id: string;
  author_id: string;
  author_name: string;
  author_avatar_url: string | null;
  body: string;
  created_at: string;
};

function mapComment(record: {
  id: string;
  createdTime?: string;
  fields: AirtableCommentFields;
}): CommentRecord {
  return {
    id: record.id,
    target_type: record.fields['Target Type'] === 'product' ? 'product' : 'gathering',
    target_id: record.fields['Target ID']?.trim() || '',
    author_id: record.fields['Author ID']?.trim() || '',
    author_name: record.fields['Author Name']?.trim() || '',
    author_avatar_url: null,
    body: record.fields.Body?.trim() || '',
    created_at: record.createdTime ?? new Date().toISOString(),
  };
}

export async function listComments(
  targetType: CommentTargetType,
  targetId: string,
): Promise<CommentRecord[]> {
  const config = requireAirtableConfig();
  const formula = `AND({Target Type}="${escapeAirtableFormula(targetType)}",{Target ID}="${escapeAirtableFormula(targetId)}")`;
  const records = await listRecords<AirtableCommentFields>(config.commentsTable, {
    filterByFormula: formula,
  });

  const comments = records
    .map(mapComment)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  const avatars = await resolveAuthorAvatars(comments.map((c) => c.author_id));
  return comments.map((c) => ({
    ...c,
    author_avatar_url: avatars.get(c.author_id) ?? null,
  }));
}

export async function createComment(input: {
  targetType: CommentTargetType;
  targetId: string;
  authorId: string;
  authorName: string;
  body: string;
}): Promise<CommentRecord> {
  const config = requireAirtableConfig();
  const created = await createRecord<AirtableCommentFields>(
    config.commentsTable,
    {
      'Target Type': input.targetType,
      'Target ID': input.targetId,
      'Author ID': input.authorId,
      'Author Name': input.authorName.trim(),
      Body: input.body.trim(),
    },
    { typecast: true },
  );
  const comment = mapComment(created);
  const avatars = await resolveAuthorAvatars([comment.author_id]);
  return {
    ...comment,
    author_avatar_url: avatars.get(comment.author_id) ?? null,
  };
}
