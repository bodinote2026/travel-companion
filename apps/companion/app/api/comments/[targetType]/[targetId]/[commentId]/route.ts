import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';
import {
  deleteComment,
  getCommentById,
  updateCommentBody,
  type CommentRecord,
  type CommentTargetType,
} from '@/lib/db/comments';

type Props = {
  params: Promise<{ targetType: string; targetId: string; commentId: string }>;
};

function parseTargetType(value: string): CommentTargetType | null {
  if (value === 'gathering' || value === 'product') return value;
  return null;
}

type OwnedCommentResult =
  | { ok: true; comment: CommentRecord; commentId: string }
  | { ok: false; response: NextResponse };

async function loadOwnedComment(params: Props['params']): Promise<OwnedCommentResult> {
  const session = await getSessionUser();
  if (!session) {
    return {
      ok: false,
      response: NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 }),
    };
  }

  const { targetType: rawType, targetId: rawTargetId, commentId } = await params;
  const targetType = parseTargetType(rawType);
  const targetId = decodeURIComponent(rawTargetId);
  if (!targetType || !targetId || !commentId) {
    return {
      ok: false,
      response: NextResponse.json({ error: '잘못된 요청입니다.' }, { status: 400 }),
    };
  }

  const comment = await getCommentById(commentId);
  if (
    !comment ||
    comment.target_type !== targetType ||
    comment.target_id !== targetId
  ) {
    return {
      ok: false,
      response: NextResponse.json({ error: '댓글을 찾을 수 없습니다.' }, { status: 404 }),
    };
  }

  if (comment.author_id !== session.id) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: '본인 댓글만 수정·삭제할 수 있습니다.' },
        { status: 403 },
      ),
    };
  }

  return { ok: true, comment, commentId };
}

export async function PATCH(request: Request, { params }: Props) {
  try {
    const loaded = await loadOwnedComment(params);
    if (!loaded.ok) return loaded.response;

    const body = await request.json();
    const text = typeof body.body === 'string' ? body.body.trim() : '';
    if (!text) {
      return NextResponse.json({ error: '댓글 내용을 입력해주세요.' }, { status: 400 });
    }
    if (text.length > 1000) {
      return NextResponse.json({ error: '댓글은 1000자 이내로 작성해주세요.' }, { status: 400 });
    }

    const comment = await updateCommentBody(loaded.commentId, text);
    return NextResponse.json({ comment });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '댓글 수정 실패' },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, { params }: Props) {
  try {
    const loaded = await loadOwnedComment(params);
    if (!loaded.ok) return loaded.response;

    await deleteComment(loaded.commentId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '댓글 삭제 실패' },
      { status: 500 },
    );
  }
}
