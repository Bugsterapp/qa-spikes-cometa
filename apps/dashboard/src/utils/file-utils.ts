export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Error reading file'));
    };

    reader.readAsDataURL(file);
  });
}

export async function fileToSerializableFormat(file: File) {
  const base64Data = await fileToBase64(file);

  return {
    name: file.name,
    type: file.type,
    data: base64Data,
  };
}

export function serializableFormatToFile(fileData: { name: string; type: string; data: string }): File {
  const byteCharacters = atob(fileData.data.split(',')[1]);
  const byteNumbers = new Array(byteCharacters.length);

  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }

  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: fileData.type });

  return new File([blob], fileData.name, { type: fileData.type });
}

export async function handleDownloadFile(url: string, filename?: string) {
  const response = await fetch(url);
  const blob = await response.blob();
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;

  if (filename) {
    link.download = filename;
  } else {
    const urlParts = url.split('/');
    link.download = urlParts[urlParts.length - 1] || 'downloaded-file';
  }

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(downloadUrl);
}

export async function compressImage(file: File, maxSizeKB = 500): Promise<File> {
  if (!file.type.startsWith('image/')) {
    return validateNonImageFileSize(file, maxSizeKB);
  }

  if (file.size <= maxSizeKB * 1024) {
    return file;
  }

  return compressImageFile(file, maxSizeKB);
}

function validateNonImageFileSize(file: File, maxSizeKB: number): File {
  if (file.size > maxSizeKB * 1024) {
    throw new Error(`El archivo PDF es demasiado grande. Máximo permitido: ${maxSizeKB}KB`);
  }
  return file;
}

function calculateResizedDimensions(width: number, height: number, maxDimension = 1920) {
  if (width <= maxDimension && height <= maxDimension) {
    return { width, height };
  }

  if (width > height) {
    return {
      width: maxDimension,
      height: (height / width) * maxDimension,
    };
  }

  return {
    width: (width / height) * maxDimension,
    height: maxDimension,
  };
}

function createCanvasFromImage(img: HTMLImageElement): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  const { width, height } = calculateResizedDimensions(img.width, img.height);

  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  ctx.drawImage(img, 0, 0, width, height);
  return canvas;
}

function compressCanvasToFile(
  canvas: HTMLCanvasElement,
  fileName: string,
  targetSize: number,
  quality: number
): Promise<File | null> {
  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          resolve(null);
          return;
        }

        if (blob.size <= targetSize || quality <= 0.1) {
          const compressedFile = new File([blob], fileName, {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });
          resolve(compressedFile);
        } else {
          resolve(null);
        }
      },
      'image/jpeg',
      quality
    );
  });
}

async function iterativelyCompressCanvas(
  canvas: HTMLCanvasElement,
  fileName: string,
  targetSize: number
): Promise<File> {
  let quality = 0.9;

  while (quality >= 0.1) {
    const result = await compressCanvasToFile(canvas, fileName, targetSize, quality);
    if (result) {
      return result;
    }
    quality -= 0.1;
  }

  throw new Error('Failed to compress image to target size');
}

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Failed to load image'));

      if (e.target?.result) {
        img.src = e.target.result as string;
      }
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

async function compressImageFile(file: File, maxSizeKB: number): Promise<File> {
  const img = await loadImageFromFile(file);
  const canvas = createCanvasFromImage(img);
  const targetSize = maxSizeKB * 1024;
  return iterativelyCompressCanvas(canvas, file.name, targetSize);
}
