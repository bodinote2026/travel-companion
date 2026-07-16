type ImageDimensions = { width: number; height: number };

function parsePngDimensions(buffer: Buffer): ImageDimensions | null {
  if (buffer.length < 24 || buffer.toString('ascii', 1, 4) !== 'PNG') return null;
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
}

function parseJpegDimensions(buffer: Buffer): ImageDimensions | null {
  if (buffer.length < 4 || buffer[0] !== 0xff || buffer[1] !== 0xd8) return null;

  let offset = 2;
  while (offset < buffer.length - 8) {
    if (buffer[offset] !== 0xff) {
      offset += 1;
      continue;
    }

    const marker = buffer[offset + 1];
    if (marker === 0xc0 || marker === 0xc1 || marker === 0xc2) {
      return {
        height: buffer.readUInt16BE(offset + 5),
        width: buffer.readUInt16BE(offset + 7),
      };
    }

    const segmentLength = buffer.readUInt16BE(offset + 2);
    if (segmentLength < 2) break;
    offset += 2 + segmentLength;
  }

  return null;
}

function parseWebpDimensions(buffer: Buffer): ImageDimensions | null {
  if (buffer.length < 30 || buffer.toString('ascii', 0, 4) !== 'RIFF') return null;
  if (buffer.toString('ascii', 8, 12) !== 'WEBP') return null;

  const chunk = buffer.toString('ascii', 12, 16);
  if (chunk === 'VP8 ' && buffer.length >= 30) {
    return {
      width: buffer.readUInt16LE(26) & 0x3fff,
      height: buffer.readUInt16LE(28) & 0x3fff,
    };
  }

  if (chunk === 'VP8L' && buffer.length >= 25) {
    const bits = buffer.readUInt32LE(21);
    return {
      width: (bits & 0x3fff) + 1,
      height: ((bits >> 14) & 0x3fff) + 1,
    };
  }

  if (chunk === 'VP8X' && buffer.length >= 30) {
    return {
      width: (buffer.readUIntLE(24, 3) & 0xffffff) + 1,
      height: (buffer.readUIntLE(27, 3) & 0xffffff) + 1,
    };
  }

  return null;
}

function parseImageDimensions(buffer: Buffer): ImageDimensions | null {
  return (
    parsePngDimensions(buffer) ??
    parseJpegDimensions(buffer) ??
    parseWebpDimensions(buffer)
  );
}

/** 원격 이미지 원본 크기 — CLS 방지용 (실패 시 null) */
export async function getRemoteImageDimensions(
  url: string,
): Promise<ImageDimensions | null> {
  const trimmed = url.trim();
  if (!trimmed) return null;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    let response = await fetch(trimmed, {
      signal: controller.signal,
      headers: { Range: 'bytes=0-65535' },
      next: { revalidate: 86_400 },
    });

    if (response.status === 416 || response.status === 404) {
      response = await fetch(trimmed, {
        signal: controller.signal,
        next: { revalidate: 86_400 },
      });
    }

    clearTimeout(timeout);
    if (!response.ok) return null;

    const buffer = Buffer.from(await response.arrayBuffer());
    const dimensions = parseImageDimensions(buffer);
    if (!dimensions || dimensions.width <= 0 || dimensions.height <= 0) return null;
    return dimensions;
  } catch {
    return null;
  }
}
