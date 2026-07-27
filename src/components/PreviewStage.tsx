import { ImageIcon, Loader2, Sparkles, Video, VideoOff } from 'lucide-react';
import type { BackgroundMode } from './ControlPanel';

type PreviewStageProps = {
  isStreaming: boolean;
  isConnecting: boolean;
  background: BackgroundMode;
  cameraReady: boolean;
  outputReady: boolean;
  previewUrl: string | null;
  onCameraVideoRef: (el: HTMLVideoElement | null) => void;
  onOutputVideoRef: (el: HTMLVideoElement | null) => void;
};

export function PreviewStage({
  isStreaming,
  isConnecting,
  background,
  cameraReady,
  outputReady,
  previewUrl,
  onCameraVideoRef,
  onOutputVideoRef,
}: PreviewStageProps) {
  const useImageBackground = background === 'image' && Boolean(previewUrl);
  const showCamera = background === 'live' || (isStreaming && !useImageBackground);
  const showOutput = isStreaming || outputReady;

  return (
    <section className="flex flex-1 flex-col gap-4">
      <div className="grid flex-1 grid-cols-1 gap-4 lg:grid-cols-2">
        <PreviewCard
          label={useImageBackground ? 'Reference Background' : 'Live Camera'}
          icon={useImageBackground ? <ImageIcon className="h-3.5 w-3.5" /> : <Video className="h-3.5 w-3.5" />}
          active={useImageBackground ? Boolean(previewUrl) : background === 'live' && cameraReady}
          muted
        >
          {useImageBackground && previewUrl ? (
            <img
              src={previewUrl}
              alt="Reference background"
              className="h-full w-full object-cover opacity-100"
            />
          ) : (
            <video
              ref={onCameraVideoRef}
              autoPlay
              playsInline
              muted
              className={`h-full w-full object-cover transition-opacity duration-300 ${
                showCamera && cameraReady ? 'opacity-100' : 'opacity-0'
              }`}
            />
          )}
          {!useImageBackground && !cameraReady && (
            <PlaceholderState
              icon={<VideoOff className="h-7 w-7" />}
              title="Camera off"
              hint="Start the stream to enable your camera."
            />
          )}
          {useImageBackground && !previewUrl && (
            <PlaceholderState
              icon={<ImageIcon className="h-7 w-7" />}
              title="No reference"
              hint="Upload a reference picture to lock its background."
            />
          )}
        </PreviewCard>

        <PreviewCard
          label="AI Output"
          icon={<Sparkles className="h-3.5 w-3.5" />}
          active={isStreaming && outputReady}
          accent
        >
          <video
            ref={onOutputVideoRef}
            autoPlay
            playsInline
            muted
            className={`h-full w-full object-cover transition-opacity duration-300 ${
              showOutput && outputReady ? 'opacity-100' : 'opacity-0'
            }`}
          />
          {!showOutput && !isConnecting && (
            <PlaceholderState
              icon={<Sparkles className="h-7 w-7" />}
              title="No output yet"
              hint="Pick a model, add a reference, and press Start Live AI."
            />
          )}
          {isConnecting && !outputReady && (
            <PlaceholderState
              icon={<Loader2 className="h-7 w-7 animate-spin" />}
              title="Connecting..."
              hint="Negotiating the realtime stream with Decart."
              loading
            />
          )}
        </PreviewCard>
      </div>
    </section>
  );
}

function PreviewCard({
  label,
  icon,
  active,
  accent,
  muted,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  active?: boolean;
  accent?: boolean;
  muted?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`relative flex min-h-[280px] flex-col overflow-hidden rounded-2xl border bg-bg-1 transition-colors lg:min-h-[420px] ${
        active
          ? accent
            ? 'border-primary-500/60 shadow-glow'
            : 'border-success/50'
          : 'border-border'
      }`}
    >
      <div className="absolute left-3 top-3 z-10 flex items-center gap-1.5 rounded-full border border-border bg-bg-0/80 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-text-1 backdrop-blur">
        {icon}
        {label}
        {active && (
          <span
            className={`ml-1 h-1.5 w-1.5 rounded-full ${
              muted ? 'bg-text-3' : 'bg-success animate-pulse-glow'
            }`}
          />
        )}
      </div>
      {children}
    </div>
  );
}

function PlaceholderState({
  icon,
  title,
  hint,
  loading,
}: {
  icon: React.ReactNode;
  title: string;
  hint: string;
  loading?: boolean;
}) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
      <div
        className={`flex h-14 w-14 items-center justify-center rounded-full ${
          loading ? 'bg-warning/10 text-warning' : 'bg-surface text-text-3'
        }`}
      >
        {icon}
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium text-text-1">{title}</span>
        <span className="max-w-[220px] text-xs text-text-3">{hint}</span>
      </div>
    </div>
  );
}
