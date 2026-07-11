import { getAirtableConfig } from '@/lib/airtable/config';
import {
  createComment as createAirtableComment,
  deleteComment as deleteAirtableComment,
  getCommentById as getAirtableCommentById,
  listComments as listAirtableComments,
  updateCommentBody as updateAirtableCommentBody,
  type CommentRecord,
  type CommentTargetType,
} from '@/lib/airtable/comments';

export type { CommentRecord, CommentTargetType };

const memoryComments = new Map<string, CommentRecord>();

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
    author_avatar_url: null,
    body: input.body.trim(),
    created_at: new Date().toISOString(),
  };
  memoryComments.set(row.id, row);
  return row;
}

export async function getCommentById(commentId: string): Promise<CommentRecord | null> {
  if (getAirtableConfig()) {
    return getAirtableCommentById(commentId);
  }
  return memoryComments.get(commentId) ?? null;
}

export async function updateCommentBody(
  commentId: string,
  body: string,
): Promise<CommentRecord> {
  if (getAirtableConfig()) {
    return updateAirtableCommentBody(commentId, body);
  }

  const existing = memoryComments.get(commentId);
  if (!existing) {
    throw new Error('댓글을 찾을 수 없습니다.');
  }
  const updated: CommentRecord = { ...existing, body: body.trim() };
  memoryComments.set(commentId, updated);
  return updated;
}

export async function deleteComment(commentId: string): Promise<void> {
  if (getAirtableConfig()) {
    return deleteAirtableComment(commentId);
  }
  memoryComments.delete(commentId);
}
