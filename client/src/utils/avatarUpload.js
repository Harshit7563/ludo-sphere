const MAX_SIZE = 512;
const JPEG_QUALITY = 0.82;
const MAX_BYTES = 280000;

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not load image'));
    };
    img.src = url;
  });
}

export async function compressAvatarFile(file) {
  if (!file?.type?.startsWith('image/')) {
    throw new Error('Please choose an image file');
  }
  if (file.size > 8 * 1024 * 1024) {
    throw new Error('Image too large (max 8MB)');
  }

  const img = await loadImage(file);
  const scale = Math.min(1, MAX_SIZE / Math.max(img.width, img.height));
  const w = Math.max(1, Math.round(img.width * scale));
  const h = Math.max(1, Math.round(img.height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, w, h);

  let quality = JPEG_QUALITY;
  let dataUrl = canvas.toDataURL('image/jpeg', quality);
  while (dataUrl.length > MAX_BYTES && quality > 0.45) {
    quality -= 0.08;
    dataUrl = canvas.toDataURL('image/jpeg', quality);
  }

  if (dataUrl.length > MAX_BYTES) {
    throw new Error('Image still too large. Try a smaller photo.');
  }

  return dataUrl;
}

export function isCustomAvatarUrl(url) {
  return Boolean(url && !url.startsWith('kfp:'));
}
