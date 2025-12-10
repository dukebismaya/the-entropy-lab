const API_ENDPOINT = 'https://api.imgbb.com/1/upload';

export interface ImgbbImageVariant {
  filename: string;
  name: string;
  mime: string;
  extension: string;
  url: string;
}

export interface ImgbbImagePayload {
  id: string;
  title: string;
  url_viewer: string;
  url: string;
  display_url: string;
  width: string;
  height: string;
  size: string;
  time: string;
  expiration: string;
  delete_url: string;
  image: ImgbbImageVariant;
  thumb?: ImgbbImageVariant;
  medium?: ImgbbImageVariant;
}

interface UploadOptions {
  image: File | Blob | string;
  name?: string;
  expiration?: number;
  signal?: AbortSignal;
}

interface ImgbbErrorPayload {
  message?: string;
}

interface ImgbbResponse {
  data: ImgbbImagePayload;
  success: boolean;
  status: number;
  error?: ImgbbErrorPayload;
}

const missingKeyError = () =>
  new Error('Missing Imgbb API key. Make sure VITE_IMGBB_KEY is set in your environment.');

export async function uploadImageToImgbb(options: UploadOptions): Promise<ImgbbImagePayload> {
  const apiKey = import.meta.env.VITE_IMGBB_KEY;

  if (!apiKey) {
    throw missingKeyError();
  }

  const formData = new FormData();
  const { image, name, expiration, signal } = options;

  if (typeof image === 'string') {
    formData.append('image', image);
  } else {
    formData.append('image', image);
  }

  if (name) {
    formData.append('name', name);
  }

  if (expiration) {
    formData.append('expiration', Math.min(Math.max(expiration, 60), 15_552_000).toString());
  }

  const response = await fetch(`${API_ENDPOINT}?key=${apiKey}`, {
    method: 'POST',
    body: formData,
    signal,
  });

  const payload = (await response.json()) as ImgbbResponse;

  if (!response.ok || !payload.success) {
    const errorMessage = payload?.error?.message || 'Imgbb upload failed. Please try again.';
    throw new Error(errorMessage);
  }

  return payload.data;
}

export async function deleteImageFromImgbb(deleteUrl: string): Promise<void> {
  if (!deleteUrl) return;
  try {
    const response = await fetch(deleteUrl, { method: 'GET' });
    if (!response.ok) {
      console.warn('Failed to delete Imgbb asset', await response.text());
    }
  } catch (error) {
    console.warn('Failed to talk to Imgbb delete endpoint', error);
  }
}
