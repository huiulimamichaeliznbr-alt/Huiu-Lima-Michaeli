import JSZip from 'jszip';
import { ImageItem } from '../types';

export interface PromptItem {
  id: number;
  title: string;
  prompt: string;
  category: string;
  tags: string[];
  mood: string;
}

export async function checkServerHealth(): Promise<{ status: string; hasApiKey: boolean }> {
  try {
    const res = await fetch('/api/health');
    if (!res.ok) {
      throw new Error('Servidor não respondeu adequadamente');
    }
    return await res.json();
  } catch (err) {
    console.warn('Health check warning:', err);
    return { status: 'offline', hasApiKey: false };
  }
}

export async function expandPrompts(
  prompt: string,
  style: string,
  count = 50
): Promise<{ prompts: PromptItem[]; source: string }> {
  const res = await fetch('/api/expand-prompts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, style, count }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Falha ao expandir prompts');
  }

  return await res.json();
}

export async function generateGeminiImage(
  prompt: string,
  aspectRatio = '1:1'
): Promise<{ imageUrl: string; model: string }> {
  const res = await fetch('/api/generate-gemini-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, aspectRatio }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const err: any = new Error(errorData.error || 'Erro ao gerar imagem com Gemini');
    err.isQuotaError = errorData.isQuotaError;
    err.needsKey = errorData.needsKey;
    throw err;
  }

  return await res.json();
}

// Trigger single image download to user's device
export function downloadImageFile(imageUrl: string, filename: string): void {
  const link = document.createElement('a');
  link.href = imageUrl;
  link.download = filename.endsWith('.png') ? filename : `${filename}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Download a batch of images as a compressed ZIP file directly on device
export async function downloadImagesZip(
  images: ImageItem[],
  zipName: string,
  onProgress?: (progress: number, current: number, total: number) => void
): Promise<void> {
  const zip = new JSZip();
  const folderName = zipName.replace(/[^a-zA-Z0-9_-]/g, '_');
  const folder = zip.folder(folderName) || zip;

  const total = images.length;
  for (let i = 0; i < total; i++) {
    const img = images[i];
    const cleanTitle = (img.title || `imagem-${i + 1}`).toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 30);
    const fileName = `${String(i + 1).padStart(2, '0')}-${cleanTitle}.png`;

    // Extract base64 payload
    const base64Data = img.imageUrl.split(',')[1];
    if (base64Data) {
      folder.file(fileName, base64Data, { base64: true });
    }

    if (onProgress) {
      onProgress(Math.round(((i + 1) / total) * 60), i + 1, total);
    }
  }

  // Add metadata index file
  const meta = {
    exportedAt: new Date().toISOString(),
    batchTitle: zipName,
    totalImages: images.length,
    images: images.map((img, idx) => ({
      index: idx + 1,
      title: img.title,
      prompt: img.prompt,
      category: img.category,
      tags: img.tags,
      mood: img.mood,
      aspectRatio: img.aspectRatio,
      dimensions: `${img.width}x${img.height}`,
      createdAt: new Date(img.createdAt).toISOString(),
    })),
  };
  folder.file('metadados-lote.json', JSON.stringify(meta, null, 2));

  // Generate zip file with compression
  const blob = await zip.generateAsync(
    {
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    },
    (metadata) => {
      if (onProgress) {
        onProgress(60 + Math.round(metadata.percent * 0.4), total, total);
      }
    }
  );

  // Trigger download
  const blobUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = `${folderName}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
}
