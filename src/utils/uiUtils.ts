import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

/**
 * Extracts a dominant color from a base64 image string.
 * This is a simplified version that samples pixels.
 */
export async function extractDominantColor(base64: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve("#0f172a");
        return;
      }

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      try {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        let r = 0, g = 0, b = 0;
        let count = 0;

        // Sample every 10th pixel to be faster
        for (let i = 0; i < imageData.length; i += 40) {
          // Skip transparent or near-white/near-black pixels
          const alpha = imageData[i + 3];
          if (alpha < 128) continue;

          const pr = imageData[i];
          const pg = imageData[i + 1];
          const pb = imageData[i + 2];

          // Skip white/grey/black
          const brightness = (pr + pg + pb) / 3;
          const diff = Math.max(Math.abs(pr - pg), Math.abs(pg - pb), Math.abs(pb - pr));
          
          if (brightness > 240 || brightness < 15 || diff < 15) continue;

          r += pr;
          g += pg;
          b += pb;
          count++;
        }

        if (count === 0) {
          resolve("#0f172a");
          return;
        }

        r = Math.floor(r / count);
        g = Math.floor(g / count);
        b = Math.floor(b / count);

        const hex = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
        resolve(hex);
      } catch (e) {
        resolve("#0f172a");
      }
    };
    img.onerror = () => resolve("#0f172a");
  });
}
