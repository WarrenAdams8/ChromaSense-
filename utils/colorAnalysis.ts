import { RGB, PaletteResult } from '../types';

// Helper to convert RGB to Hex using bitwise operations for speed
const rgbToHex = (r: number, g: number, b: number): string => {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};

// Calculate squared Euclidean distance (avoids expensive Math.sqrt)
const colorDistanceSq = (c1: RGB, c2: RGB): number => {
  return (
    (c1.r - c2.r) ** 2 +
    (c1.g - c2.g) ** 2 +
    (c1.b - c2.b) ** 2
  );
};

export const analyzeImage = (imageElement: HTMLImageElement): PaletteResult => {
  const canvas = document.createElement('canvas');
  // 'willReadFrequently' hint optimizes canvas for read-heavy operations on some browsers
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  
  if (!ctx) {
    throw new Error('Could not get canvas context');
  }

  // Optimize: Reduce analysis size. 
  // 128px is sufficient for dominant color extraction and is significantly faster than 256px.
  // 128x128 = 16k pixels vs 256x256 = 65k pixels.
  const MAX_SIZE = 128;
  const scale = Math.min(MAX_SIZE / imageElement.width, MAX_SIZE / imageElement.height, 1);
  canvas.width = Math.floor(imageElement.width * scale);
  canvas.height = Math.floor(imageElement.height * scale);

  ctx.drawImage(imageElement, 0, 0, canvas.width, canvas.height);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const length = data.length;

  // Optimize: Use Map with integer keys to avoid string allocation overhead.
  const colorCounts = new Map<number, number>();
  
  // Optimize: Sampling step. 
  // Skipping pixels (e.g., every 4th pixel) speeds up the loop with negligible accuracy loss for palettes.
  const step = 4 * 4; // 4 pixels * 4 channels (r,g,b,a)

  for (let i = 0; i < length; i += step) {
    const a = data[i + 3];

    // Ignore transparent pixels
    if (a < 128) continue;

    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Quantize: Masking lower 4 bits (0xF0) is equivalent to rounding to nearest 16.
    // Pack RGB into a single 24-bit integer for fast Map lookups.
    // Format: 0xRRGGBB
    const rgbInt = ((r & 0xF0) << 16) | ((g & 0xF0) << 8) | (b & 0xF0);

    const count = colorCounts.get(rgbInt) || 0;
    colorCounts.set(rgbInt, count + 1);
  }

  // Sort by frequency
  const sortedColors = Array.from(colorCounts.entries())
    .sort((a, b) => b[1] - a[1]) // Sort by count descending
    .map(([rgbInt]) => {
      // Unpack integer back to RGB
      return {
        r: (rgbInt >> 16) & 0xFF,
        g: (rgbInt >> 8) & 0xFF,
        b: rgbInt & 0xFF
      };
    });

  // Extract Dominant Color
  let dominantHex = "#000000";
  if (sortedColors.length > 0) {
    const d = sortedColors[0];
    dominantHex = rgbToHex(d.r, d.g, d.b);
  }

  // Build Palette
  const palette: RGB[] = [];
  const MIN_DISTANCE_SQ = 40 * 40; // Squared threshold (equivalent to 40 Euclidean distance)

  for (const color of sortedColors) {
    if (palette.length >= 5) break;

    // Check distinctness using squared distance to avoid Sqrt
    const isDistinct = palette.every(p => colorDistanceSq(p, color) > MIN_DISTANCE_SQ);

    if (isDistinct) {
      palette.push(color);
    }
  }

  const hexPalette = palette.map(p => rgbToHex(p.r, p.g, p.b));

  return {
    dominant: dominantHex,
    palette: hexPalette
  };
};

export const loadImage = (file: File): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};