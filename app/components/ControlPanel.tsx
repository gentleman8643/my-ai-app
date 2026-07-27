"use client";

import { Eye, EyeOff, KeyRound, Play, Square, Wand2, Zap } from "lucide-react";
import { useState } from "react";
import { ModelDropdown } from "./ModelDropdown";
import { ReferenceUploader } from "./ReferenceUploader";
import type { ImageValidation } from "../lib/imageValidation";
import type { ModelOption } from "../lib/models";

export type BackgroundMode = "image" | "live";

type ControlPanelProps = {
  apiKey: string;
  onApiKeyChange: (key: string) => void;
  modelId: ModelOption["id"];
  onModelChange: (id: ModelOption["id"]) => void;
  prompt: string;
  onPromptChange: (prompt: string) => void;
  background: BackgroundMode;
  onBackgroundChange: (mode: BackgroundMode) => void;
  file: File | null;
  previewUrl: string | null;
  validation: ImageValidation | null;
  onFileChange: (file: File | null) => void;
  onValidationChange: (v: ImageValidation | null) => void;
  isStreaming: boolean;
  isConnecting: boolean;
  canStart: boolean;
  onStart: () => void;
  onStop: () => void;
  statusMessage: string;
};

export function ControlPanel(props: ControlPanelProps) {
  const [showKey, setShowKey] = useState(false);
  const {
    apiKey,
    onApiKeyChange,
    modelId,
    onModelChange,
    prompt,
    onPromptChange,
    background,
    onBackgroundChange,
    file,
    previewUrl,
    validation,
    onFileChange,
    onValidationChange,
    isStreaming,
    isConnecting,
    canStart,
    onStart,
    onStop,
    statusMessage,
  } = props;

  const blocked = isStreaming || isConnecting;

  return (
    <aside className="flex w-full flex-col gap-5 rounded-2xl border border-border bg-bg-1/60 p-4 backdrop-blur-sm lg:w-[380px] lg:p-5">
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <Wand2 className="h-4 w-4 text-primary-400" />
        <h2 className="text-sm font-semibold tracking-tight text-text-0">Studio Controls</h2>
      </div>

      <section className="flex flex-col gap-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-text-2">
          Decart Model
        </label>
        <ModelDropdown value={modelId} onChange={onModelChange} disabled={blocked} />
      </section>

      <section className="flex flex-col gap-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-text-2">
          Prompt
        </label>
        <textarea
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
          disabled={blocked}
          rows={4}
          placeholder="Describe the look you want..."
          className="w-full resize-none rounded-xl border border-border bg-surface px-3.5 py-3 text-sm leading-relaxed text-text-0 placeholder:text-text-3 transition-colors hover:border-border-strong focus:border-primary-500 disabled:opacity-50 focus-ring"
        />
        <p className="text-[11px] text-text-3">
          The prompt guides every generated frame. Be specific about style, identity, and lighting.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-text-2">
          Background
        </label>
        <div className="grid grid-cols-2 gap-2">
          <BackgroundButton
            active={background === "image"}
            onClick={() => onBackgroundChange("image")}
            disabled={blocked}
            icon={<Eye className="h-4 w-4" />}
            label="Use Picture"
            hint="Keep reference bg"
          />
          <BackgroundButton
            active={background === "live"}
            onClick={() => onBackgroundChange("live")}
            disabled={blocked}
            icon={<Zap className="h-4 w-4" />}
            label="Live Camera"
            hint="Stream your scene"
          />
        </div>
      </section>

      <ReferenceUploader
        file={file}
        previewUrl={previewUrl}
        validation={validation}
        onFileChange={onFileChange}
        onValidationChange={onValidationChange}
        disabled={blocked}
      />

      <section className="flex flex-col gap-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-text-2">
          Decart API Key
        </label>
        <div className="relative">
          <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-3" />
          <input
            type={showKey ? "text" : "password"}
            value={apiKey}
            onChange={(e) => onApiKeyChange(e.target.value)}
            disabled={blocked}
            placeholder="ek_..."
            autoComplete="off"
            spellCheck={false}
            className="w-full rounded-xl border border-border bg-surface py-3 pl-9 pr-10 text-sm text-text-0 placeholder:text-text-3 transition-colors hover:border-border-strong focus:border-primary-500 disabled:opacity-50 focus-ring"
          />
          <button
            type="button"
            onClick={() => setShowKey((v) => !v)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-text-3 transition-colors hover:text-text-1 focus-ring"
            aria-label={showKey ? "Hide key" : "Show key"}
          >
            {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <p className="text-[11px] text-text-3">
          Stored only in your browser. Get one at{" "}
          <a
            href="https://www.decart.ai"
            target="_blank"
            rel="noreferrer"
            className="text-primary-300 hover:text-primary-400"
          >
            decart.ai
          </a>
          .
        </p>
      </section>

      <div className="flex flex-col gap-2 border-t border-border pt-4">
        {isStreaming || isConnecting ? (
          <button
            type="button"
            onClick={onStop}
            className="flex items-center justify-center gap-2 rounded-xl bg-error px-4 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:brightness-110 active:scale-[0.98] focus-ring"
          >
            <Square className="h-4 w-4 fill-current" />
            {isConnecting ? "Cancel" : "Stop Stream"}
          </button>
        ) : (
          <button
            type="button"
            onClick={onStart}
            disabled={!canStart}
            className="flex items-center justify-center gap-2 rounded-xl bg-success px-4 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-surface disabled:text-text-3 disabled:shadow-none focus-ring"
          >
            <Play className="h-4 w-4 fill-current" />
            Start Live AI
          </button>
        )}

        {statusMessage && (
          <div className="flex items-center gap-2 rounded-lg border border-border bg-bg-2 px-3 py-2 text-xs text-text-1">
            <span
              className={`h-1.5 w-1.5 flex-none rounded-full ${
                isStreaming
                  ? "bg-success animate-pulse-glow"
                  : isConnecting
                  ? "bg-warning animate-pulse"
                  : "bg-text-3"
              }`}
            />
            <span>{statusMessage}</span>
          </div>
        )}
      </div>
    </aside>
  );
}

function BackgroundButton({
  active,
  onClick,
  disabled,
  icon,
  label,
  hint,
}: {
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
  icon: React.ReactNode;
  label: string;
  hint: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex flex-col items-start gap-1 rounded-xl border px-3 py-2.5 text-left transition-all disabled:cursor-not-allowed disabled:opacity-50 focus-ring ${
        active
          ? "border-primary-500 bg-primary-500/10 text-text-0 shadow-glow"
          : "border-border bg-surface text-text-1 hover:border-border-strong"
      }`}
    >
      <span className={`flex items-center gap-1.5 text-sm font-medium ${active ? "text-primary-300" : ""}`}>
        {icon}
        {label}
      </span>
      <span className="text-[11px] text-text-3">{hint}</span>
    </button>
  );
}
