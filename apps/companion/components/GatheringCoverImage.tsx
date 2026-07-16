import Image from 'next/image';
import { getRemoteImageDimensions } from '@/lib/images/remote-dimensions';

type Props = {
  src: string;
};

/** 모집글 상세 Cover Image — 없으면 렌더하지 않음 */
export async function GatheringCoverImage({ src }: Props) {
  const trimmed = src.trim();
  if (!trimmed) return null;

  const dimensions = await getRemoteImageDimensions(trimmed);

  if (dimensions) {
    return (
      <div className="my-4">
        <Image
          src={trimmed}
          alt=""
          width={dimensions.width}
          height={dimensions.height}
          className="h-auto w-full rounded-2xl"
          unoptimized
          priority
        />
      </div>
    );
  }

  return (
    <div className="my-4">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={trimmed}
        alt=""
        className="h-auto w-full rounded-2xl"
        decoding="async"
        loading="eager"
      />
    </div>
  );
}
