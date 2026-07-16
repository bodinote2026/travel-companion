import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';
import { uploadImageToCloudinary, getCloudinaryConfig } from '@/lib/cloudinary/upload';

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

/** 동행 모집 대표 이미지 Cloudinary 업로드 (URL만 반환) */
export async function POST(request: Request) {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }

  if (!getCloudinaryConfig()) {
    return NextResponse.json(
      { error: '이미지 업로드 설정이 완료되지 않았습니다.' },
      { status: 503 },
    );
  }

  try {
    const form = await request.formData();
    const file = form.get('file');
    if (!(file instanceof File)) {
      return NextResponse.json({ error: '이미지 파일이 필요합니다.' }, { status: 400 });
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: 'jpg, png, webp, gif 이미지만 업로드할 수 있습니다.' },
        { status: 400 },
      );
    }

    if (file.size <= 0 || file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: '이미지 크기는 5MB 이하여야 합니다.' },
        { status: 400 },
      );
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const url = await uploadImageToCloudinary({
      bytes,
      filename: file.name || 'gathering-cover.jpg',
      mimeType: file.type,
      folder: 'travel-companion/gatherings',
    });

    return NextResponse.json({ url });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '대표 이미지 업로드 실패' },
      { status: 500 },
    );
  }
}
