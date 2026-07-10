import { createHash } from 'crypto';

export type CloudinaryConfig = {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
};

export function getCloudinaryConfig(): CloudinaryConfig | null {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();
  if (!cloudName || !apiKey || !apiSecret) return null;
  return { cloudName, apiKey, apiSecret };
}

export function requireCloudinaryConfig(): CloudinaryConfig {
  const config = getCloudinaryConfig();
  if (!config) {
    throw new Error(
      'Cloudinary 설정이 없습니다. CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET을 확인하세요.',
    );
  }
  return config;
}

function signParams(params: Record<string, string>, apiSecret: string): string {
  const toSign = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&');
  return createHash('sha1').update(`${toSign}${apiSecret}`).digest('hex');
}

export async function uploadImageToCloudinary(input: {
  bytes: Buffer;
  filename: string;
  mimeType: string;
  folder?: string;
}): Promise<string> {
  const config = requireCloudinaryConfig();
  const folder = input.folder ?? 'travel-companion/avatars';
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const paramsToSign: Record<string, string> = { folder, timestamp };
  const signature = signParams(paramsToSign, config.apiSecret);

  const form = new FormData();
  form.append(
    'file',
    new Blob([new Uint8Array(input.bytes)], { type: input.mimeType }),
    input.filename,
  );
  form.append('api_key', config.apiKey);
  form.append('timestamp', timestamp);
  form.append('folder', folder);
  form.append('signature', signature);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${config.cloudName}/image/upload`,
    { method: 'POST', body: form },
  );
  const data = (await res.json().catch(() => null)) as {
    secure_url?: string;
    error?: { message?: string };
  } | null;

  if (!res.ok || !data?.secure_url) {
    throw new Error(data?.error?.message ?? 'Cloudinary 업로드에 실패했습니다.');
  }

  return data.secure_url;
}
