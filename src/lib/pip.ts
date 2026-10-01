export type PipOrientation = 'portrait' | 'landscape';

export const PIP_DIMENSIONS: Record<PipOrientation, { width: number; height: number }> = {
  portrait: { width: 300, height: 533 },
  landscape: { width: 533, height: 300 },
};

export type PipSession = {
  close: () => void;
};

export function isDocumentPipSupported(): boolean {
  return typeof window !== 'undefined' && 'documentPictureInPicture' in window;
}

export function isStandardPipSupported(): boolean {
  return (
    typeof document !== 'undefined' &&
    'pictureInPictureEnabled' in document &&
    (document as { pictureInPictureEnabled?: boolean }).pictureInPictureEnabled === true
  );
}

export function isPipSupported(): boolean {
  return isDocumentPipSupported() || isStandardPipSupported();
}

export async function openPip(
  stream: MediaStream,
  orientation: PipOrientation,
  onClose: () => void
): Promise<PipSession> {
  const dims = PIP_DIMENSIONS[orientation];

  if (isDocumentPipSupported()) {
    const dpiP = (
      window as unknown as {
        documentPictureInPicture: {
          requestWindow: (opts: { width: number; height: number }) => Promise<Window>;
        };
      }
    ).documentPictureInPicture;
    const pipWindow = await dpiP.requestWindow({ width: dims.width, height: dims.height });
    const doc = pipWindow.document;
    doc.body.style.cssText = 'margin:0;padding:0;background:#000;overflow:hidden;';
    const video = doc.createElement('video');
    video.srcObject = stream;
    video.autoplay = true;
    video.playsInline = true;
    video.muted = true;
    video.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
    doc.body.appendChild(video);
    await video.play().catch(() => {});

    let closed = false;
    const handleHide = () => {
      if (closed) return;
      closed = true;
      try {
        pipWindow.close();
      } catch {
        // ignore
      }
      onClose();
    };
    pipWindow.addEventListener('pagehide', handleHide, { once: true });

    return {
      close: () => {
        if (closed) return;
        closed = true;
        try {
          pipWindow.close();
        } catch {
          // ignore
        }
      },
    };
  }

  if (isStandardPipSupported()) {
    const video = document.createElement('video');
    video.srcObject = stream;
    video.muted = true;
    video.playsInline = true;
    video.style.cssText =
      'position:fixed;top:-9999px;left:-9999px;width:2px;height:2px;opacity:0;';
    document.body.appendChild(video);
    await video.play().catch(() => {});
    await (video as unknown as { requestPictureInPicture: () => Promise<void> }).requestPictureInPicture();

    let closed = false;
    const handleLeave = () => {
      if (closed) return;
      closed = true;
      video.remove();
      video.srcObject = null;
      onClose();
    };
    video.addEventListener('leavepictureinpicture', handleLeave, { once: true });

    return {
      close: () => {
        if (closed) return;
        closed = true;
        try {
          (document as unknown as { exitPictureInPicture: () => void }).exitPictureInPicture();
        } catch {
          // ignore
        }
        video.remove();
        video.srcObject = null;
      },
    };
  }

  throw new Error('Picture-in-Picture is not supported in this browser.');
}
