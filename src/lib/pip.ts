export type PipOrientation = 'portrait' | 'landscape';

export type PipSession = {
  close: () => void;
};

export function isPipSupported(): boolean {
  return (
    typeof document !== 'undefined' &&
    'pictureInPictureEnabled' in document &&
    (document as { pictureInPictureEnabled?: boolean }).pictureInPictureEnabled === true
  );
}

export async function openPip(
  stream: MediaStream,
  orientation: PipOrientation,
  onClose: () => void
): Promise<PipSession> {
  if (!isPipSupported()) {
    throw new Error('Picture-in-Picture is not supported in this browser.');
  }

  const source = document.createElement('video');
  source.srcObject = stream;
  source.muted = true;
  source.playsInline = true;
  await source.play();

  const canvas = document.createElement('canvas');
  const width = orientation === 'portrait' ? 1080 : 1920;
  const height = orientation === 'portrait' ? 1920 : 1080;
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Could not create the PiP video.');

  const canvasStream = canvas.captureStream(30);
  for (const track of stream.getAudioTracks()) canvasStream.addTrack(track);

  let animationFrame = 0;
  const drawFrame = () => {
    if (source.videoWidth && source.videoHeight) {
      const scale = Math.max(width / source.videoWidth, height / source.videoHeight);
      const drawnWidth = source.videoWidth * scale;
      const drawnHeight = source.videoHeight * scale;
      context.drawImage(
        source,
        (width - drawnWidth) / 2,
        (height - drawnHeight) / 2,
        drawnWidth,
        drawnHeight
      );
    }
    animationFrame = requestAnimationFrame(drawFrame);
  };
  drawFrame();

  const pipVideo = document.createElement('video');
  pipVideo.srcObject = canvasStream;
  pipVideo.muted = stream.getAudioTracks().length === 0;
  pipVideo.playsInline = true;
  pipVideo.style.cssText =
    'position:fixed;top:-9999px;left:-9999px;width:2px;height:2px;opacity:0;pointer-events:none;';
  document.body.appendChild(pipVideo);
  await pipVideo.play();

  let closed = false;
  const cleanup = () => {
    if (closed) return;
    closed = true;
    cancelAnimationFrame(animationFrame);
    pipVideo.srcObject = null;
    pipVideo.remove();
    source.pause();
    source.srcObject = null;
    canvasStream.getTracks().forEach((track) => track.stop());
    onClose();
  };

  pipVideo.addEventListener('leavepictureinpicture', cleanup, { once: true });
  await (
    pipVideo as HTMLVideoElement & { requestPictureInPicture: () => Promise<void> }
  ).requestPictureInPicture();

  return {
    close: () => {
      if (closed) return;
      try {
        void document.exitPictureInPicture();
      } catch {
        cleanup();
      }
    },
  };
}
