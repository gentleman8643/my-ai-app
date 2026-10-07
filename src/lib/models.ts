import type { RealTimeModels } from '@decartai/sdk';

export type ModelKind = 'realtime' | 'video' | 'image';

export type ModelOption = {
  id: RealTimeModels;
  label: string;
  version: string;
  description: string;
  kind: ModelKind;
  badge?: string;
  recommended?: boolean;
};

export const MODEL_OPTIONS: ModelOption[] = [
  {
    id: 'lucy-latest',
    label: 'Lucy Latest',
    version: '2.5',
    description:
      'Newest live AI model. Best quality, physically-aware VFX, self-anchoring edits at 30 FPS.',
    kind: 'realtime',
    badge: 'Recommended',
    recommended: true,
  },
  {
    id: 'lucy-2.1',
    label: 'Lucy 2.1',
    version: '2.1',
    description: 'Stable realtime video editing with strong temporal consistency.',
    kind: 'realtime',
  },
  {
    id: 'lucy-vton-latest',
    label: 'Lucy VTON Latest',
    version: '2.5',
    description: 'Live virtual try-on. Swap clothing on a live stream with realistic draping.',
    kind: 'realtime',
    badge: 'Try-on',
  },
  {
    id: 'lucy-vton-3',
    label: 'Lucy VTON 3',
    version: '3',
    description: 'Virtual try-on v3 with improved garment fidelity.',
    kind: 'realtime',
  },
  {
    id: 'lucy-vton-2',
    label: 'Lucy VTON 2',
    version: '2',
    description: 'Virtual try-on v2 baseline.',
    kind: 'realtime',
  },
  {
    id: 'lucy-restyle-latest',
    label: 'Lucy Restyle Latest',
    version: '2.5',
    description: 'Live video restyling. Re-theme an entire scene in real time.',
    kind: 'realtime',
    badge: 'Restyle',
  },
  {
    id: 'lucy-restyle-2',
    label: 'Lucy Restyle 2',
    version: '2',
    description: 'Realtime restyling baseline.',
    kind: 'realtime',
  },
];

export const DEFAULT_MODEL_ID: RealTimeModels = 'lucy-latest';

export const DEFAULT_PROMPT =
  'photorealistic human portrait, ultra detailed skin texture, natural pores, DSLR photo, 85mm lens, shallow depth of field, cinematic lighting, consistent face identity, stable facial structure, no morphing, no distortion, realistic proportions, no anime, no cartoon, no illustration';

export function getModel(id: RealTimeModels): ModelOption {
  return MODEL_OPTIONS.find((m) => m.id === id) ?? MODEL_OPTIONS[0];
}
