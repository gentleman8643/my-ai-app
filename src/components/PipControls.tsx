import { useCallback, useEffect, useRef, useState } from 'react';
import { Monitor, Smartphone } from 'lucide-react';
import {
  isPipSupported,
  openPip,
  type PipOrientation,
  type PipSession,
} from '@/lib/pip';

type PipControlsProps = {
  stream: MediaStream | null;
};

export function PipControls({ stream }: PipControlsProps) {
  const [active, setActive] = useState<PipOrientation | null>(null);
  const sessionRef = useRef<PipSession | null>(null);

  const close = useCallback(() => {
    sessionRef.current?.close();
    sessionRef.current = null;
    setActive(null);
  }, []);

  useEffect(() => {
    if (!stream) close();
  }, [stream, close]);

  useEffect(() => {
    return () => close();
  }, [close]);

  const toggle = useCallback(
    async (orientation: PipOrientation) => {
      if (!stream) return;
      if (active === orientation) {
        close();
        return;
      }
      close();
      try {
        const session = await openPip(stream, orientation, () => {
          sessionRef.current = null;
          setActive(null);
        });
        sessionRef.current = session;
        setActive(orientation);
      } catch {
        sessionRef.current = null;
        setActive(null);
      }
    },
    [stream, active, close]
  );

  if (!isPipSupported() || !stream) return null;

  return (
    <div className="flex items-center gap-2">
      <PipButton
        orientation="portrait"
        active={active === 'portrait'}
        onClick={() => toggle('portrait')}
      />
      <PipButton
        orientation="landscape"
        active={active === 'landscape'}
        onClick={() => toggle('landscape')}
      />
    </div>
  );
}

function PipButton({
  orientation,
  active,
  onClick,
}: {
  orientation: PipOrientation;
  active: boolean;
  onClick: () => void;
}) {
  const isPortrait = orientation === 'portrait';
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors focus-ring ${
        active
          ? 'border-primary-500 bg-primary-500/15 text-primary-300'
          : 'border-border bg-surface text-text-1 hover:border-border-strong hover:text-text-0'
      }`}
      aria-pressed={active}
      title={isPortrait ? 'Pop out portrait (phone)' : 'Pop out landscape (laptop)'}
    >
      {isPortrait ? <Smartphone className="h-3.5 w-3.5" /> : <Monitor className="h-3.5 w-3.5" />}
      {isPortrait ? 'Portrait PiP' : 'Landscape PiP'}
    </button>
  );
}
