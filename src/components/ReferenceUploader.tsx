import { useCallback, useRef, useState } from 'react';
import { AlertTriangle, CheckCircle2, ImagePlus, Loader2, Upload, X } from 'lucide-react';
import { validateReferenceImage, type ImageValidation } from '@/lib/imageValidation';

type ReferenceUploaderProps = {
  file: File | null;
  previewUrl: string | null;
  validation: ImageValidation | null;
  onFileChange: (file: File | null) => void;
  onValidationChange: (validation: ImageValidation | null) => void;
  disabled?: boolean;
};

export function ReferenceUploader({
  file,
  previewUrl,
  validation,
  onFileChange,
  onValidationChange,
  disabled,
}: ReferenceUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [validating, setValidating] = useState(false);

  const handleFile = useCallback(
    async (next: File | null) => {
      onFileChange(next);
      if (!next) {
        onValidationChange(null);
        return;
      }
      setValidating(true);
      const result = await validateReferenceImage(next);
      onValidationChange(result);
      setValidating(false);
    },
    [onFileChange, onValidationChange]
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-text-2">
          Reference Image
        </label>
        {file && !disabled && (
          <button
            type="button"
            onClick={() => {
              handleFile(null);
              if (inputRef.current) inputRef.current.value = '';
            }}
            className="flex items-center gap-1 text-xs font-medium text-text-3 transition-colors hover:text-error focus-ring"
          >
            <X className="h-3 w-3" /> Remove
          </button>
        )}
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (disabled) return;
          const next = e.dataTransfer.files?.[0];
          if (next) handleFile(next);
        }}
        onClick={() => !disabled && inputRef.current?.click()}
        className={`group relative flex min-h-[180px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed p-4 text-center transition-colors ${
          dragging
            ? 'border-primary-500 bg-primary-500/5'
            : 'border-border bg-surface hover:border-border-strong'
        } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/avif"
          className="hidden"
          disabled={disabled}
          onChange={(e) => {
            const next = e.target.files?.[0];
            if (next) handleFile(next);
          }}
        />

        {previewUrl ? (
          <div className="flex w-full flex-col items-center gap-3">
            <div className="relative">
              <img
                src={previewUrl}
                alt="Reference preview"
                className="max-h-40 rounded-lg object-contain shadow-md"
              />
              {validation && (
                <span
                  className={`absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full border-2 border-surface ${
                    validation.ready ? 'bg-success' : 'bg-error'
                  }`}
                >
                  {validation.ready ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                  ) : (
                    <AlertTriangle className="h-3.5 w-3.5 text-white" />
                  )}
                </span>
              )}
            </div>
            <div className="flex w-full items-center justify-center gap-2 text-xs text-text-2">
              <span className="truncate">{file?.name}</span>
              <span className="text-text-3">·</span>
              <span>{file ? `${(file.size / 1024).toFixed(0)} KB` : ''}</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-500/10 text-primary-300">
              {validating ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <ImagePlus className="h-5 w-5" />
              )}
            </div>
            <div className="text-sm font-medium text-text-1">
              {validating ? 'Checking image...' : 'Drop a reference photo'}
            </div>
            <div className="text-xs text-text-3">PNG, JPG, WEBP · max 12 MB · min 256px</div>
            <div className="mt-1 flex items-center gap-1 text-xs font-medium text-primary-300">
              <Upload className="h-3 w-3" /> Browse files
            </div>
          </div>
        )}
      </div>

      {validation && (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-text-2">Readiness</span>
            <span
              className={`font-semibold ${
                validation.score >= 80
                  ? 'text-success'
                  : validation.score >= 50
                    ? 'text-warning'
                    : 'text-error'
              }`}
            >
              {validation.ready ? 'Ready' : 'Needs fixing'} · {validation.score}/100
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-bg-2">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                validation.score >= 80
                  ? 'bg-success'
                  : validation.score >= 50
                    ? 'bg-warning'
                    : 'bg-error'
              }`}
              style={{ width: `${validation.score}%` }}
            />
          </div>
          <ul className="mt-1 flex flex-col gap-1">
            {validation.issues.map((issue, i) => (
              <li
                key={i}
                className={`flex items-start gap-1.5 text-xs leading-snug ${
                  issue.level === 'error'
                    ? 'text-error'
                    : issue.level === 'warn'
                      ? 'text-warning'
                      : 'text-success'
                }`}
              >
                {issue.level === 'ok' ? (
                  <CheckCircle2 className="mt-0.5 h-3 w-3 flex-none" />
                ) : (
                  <AlertTriangle className="mt-0.5 h-3 w-3 flex-none" />
                )}
                <span>{issue.message}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
