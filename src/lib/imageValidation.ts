export type ImageIssue = {
  level: 'ok' | 'warn' | 'error';
  message: string;
};

export type ImageValidation = {
  issues: ImageIssue[];
  score: number;
  ready: boolean;
};

const MAX_BYTES = 12 * 1024 * 1024;
const MIN_DIMENSION = 256;
const IDEAL_MIN_DIMENSION = 512;
const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/avif'];

export async function validateReferenceImage(file: File): Promise<ImageValidation> {
  const issues: ImageIssue[] = [];

  if (!ACCEPTED_TYPES.includes(file.type)) {
    issues.push({
      level: 'error',
      message: `Unsupported format "${file.type || 'unknown'}". Use PNG, JPG, WEBP, or AVIF.`,
    });
    return { issues, score: 0, ready: false };
  }

  if (file.size > MAX_BYTES) {
    issues.push({
      level: 'error',
      message: `File is ${(file.size / 1024 / 1024).toFixed(1)} MB. Max is 12 MB.`,
    });
  }

  const dims = await readDimensions(file).catch(() => null);

  if (dims) {
    const { width, height } = dims;
    const minSide = Math.min(width, height);

    if (minSide < MIN_DIMENSION) {
      issues.push({
        level: 'error',
        message: `Image is ${width}x${height}px. Smallest side must be at least ${MIN_DIMENSION}px.`,
      });
    } else if (minSide < IDEAL_MIN_DIMENSION) {
      issues.push({
        level: 'warn',
        message: `Image is ${width}x${height}px. For best identity fidelity, use at least ${IDEAL_MIN_DIMENSION}px on the shortest side.`,
      });
    }

    const ratio = width / height;
    if (ratio > 2.4 || ratio < 0.42) {
      issues.push({
        level: 'warn',
        message: `Unusual aspect ratio (${ratio.toFixed(2)}:1). A near-square, well-lit face photo works best.`,
      });
    }
  }

  if (issues.length === 0) {
    issues.push({ level: 'ok', message: 'Reference looks good. Ready to stream.' });
  }

  const score = computeScore(issues);
  const ready = issues.every((i) => i.level !== 'error');

  return { issues, score, ready };
}

function computeScore(issues: ImageIssue[]): number {
  let score = 100;
  for (const issue of issues) {
    if (issue.level === 'error') score -= 40;
    else if (issue.level === 'warn') score -= 15;
  }
  return Math.max(0, score);
}

function readDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to decode image'));
    };
    img.src = url;
  });
}
