'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { Loader2, MessageSquare } from 'lucide-react';
import { AuthorChatAvatar } from '@/components/AuthorChatAvatar';
import type { CommentRecord, CommentTargetType } from '@/lib/db/comments';
import { useUserProfile } from '@/hooks/useUserProfile';

function formatCommentTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

type Props = {
  targetType: CommentTargetType;
  targetId: string;
  initialComments?: CommentRecord[];
  loginReturnUrl: string;
};

export function CommentSection({
  targetType,
  targetId,
  initialComments = [],
  loginReturnUrl,
}: Props) {
  const { profile, ready } = useUserProfile();
  const [comments, setComments] = useState<CommentRecord[]>(initialComments);
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    const res = await fetch(
      `/api/comments/${targetType}/${encodeURIComponent(targetId)}`,
    );
    const data = await res.json();
    if (res.ok && data.comments) setComments(data.comments);
  }, [targetType, targetId]);

  useEffect(() => {
    if (initialComments.length === 0) {
      void refresh();
    }
  }, [initialComments.length, refresh]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const text = body.trim();
    if (!text) {
      setError('댓글 내용을 입력해주세요.');
      return;
    }
    if (!profile) {
      setError('로그인이 필요합니다.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `/api/comments/${targetType}/${encodeURIComponent(targetId)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ body: text }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? '댓글 작성 실패');
      setComments((prev) => [...prev, data.comment]);
      setBody('');
    } catch (err) {
      setError(err instanceof Error ? err.message : '댓글 작성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mt-6 px-5 pb-4">
      <h2 className="flex items-center gap-1.5 text-sm font-bold">
        <MessageSquare className="size-4" />
        댓글 <span className="text-primary">{comments.length}</span>
      </h2>

      <ul className="mt-3 flex flex-col gap-2">
        {comments.length === 0 ? (
          <li className="rounded-xl border border-border bg-card px-4 py-6 text-center text-sm text-muted-foreground">
            아직 댓글이 없습니다. 첫 댓글을 남겨 보세요.
          </li>
        ) : (
          comments.map((comment) => (
            <li
              key={comment.id}
              className="rounded-xl border border-border bg-card px-4 py-3"
            >
              <div className="flex items-center justify-between gap-2">
                <AuthorChatAvatar
                  authorId={comment.author_id}
                  authorName={comment.author_name}
                  authorAvatarUrl={comment.author_avatar_url}
                  size="sm"
                  showName
                  nameClassName="text-sm font-semibold"
                />
                <span className="text-xs text-muted-foreground">
                  {formatCommentTime(comment.created_at)}
                </span>
              </div>
              <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                {comment.body}
              </p>
            </li>
          ))
        )}
      </ul>

      {!ready ? (
        <div className="mt-4 flex justify-center py-2">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </div>
      ) : profile ? (
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-2">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="댓글을 입력하세요"
            rows={3}
            maxLength={1000}
            className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2.5 text-sm leading-relaxed"
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="flex h-11 items-center justify-center rounded-2xl bg-primary text-sm font-semibold text-primary-foreground disabled:opacity-70"
          >
            {loading ? <Loader2 className="size-4 animate-spin" /> : '댓글 등록'}
          </button>
        </form>
      ) : (
        <p className="mt-4 rounded-xl border border-border bg-card px-4 py-3 text-center text-sm text-muted-foreground">
          댓글을 쓰려면{' '}
          <Link
            href={`/login?returnUrl=${encodeURIComponent(loginReturnUrl)}`}
            className="font-medium text-primary"
          >
            로그인
          </Link>
          이 필요해요.
        </p>
      )}
    </section>
  );
}
