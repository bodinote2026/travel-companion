import { getAirtableConfig } from '@/lib/airtable/config';
import {
  createComment as createAirtableComment,
  listComments as listAirtableComments,
  type CommentRecord,
  type CommentTargetType,
} from '@/lib/airtable/comments';

export type { CommentRecord, CommentTargetType };

const memoryComments = new Map<string, CommentRecord>();

function memoryKey(targetType: CommentTargetType, targetId: string) {
  return `${targetType}:${targetId}`;
}

export async function listComments(
  targetType: CommentTargetType,
  targetId: string,
): Promise<CommentRecord[]> {
  if (getAirtableConfig()) {
    return listAirtableComments(targetType, targetId);
  }

  return [...memoryComments.values()]
    .filter((c) => c.target_type === targetType && c.target_id === targetId)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
}

export async function createComment(input: {
  targetType: CommentTargetType;
  targetId: string;
  authorId: string;
  authorName: string;
  body: string;
}): Promise<CommentRecord> {
  if (getAirtableConfig()) {
    return createAirtableComment(input);
  }

  const row: CommentRecord = {
    id: crypto.randomUUID(),
    target_type: input.targetType,
    target_id: input.targetId,
    author_id: input.authorId,
    author_name: input.authorName.trim(),
    body: input.body.trim(),
    created_at: new Date().toISOString(),
  };
  memoryComments.set(row.id, row);
  void memoryKey;
  return row;
}
