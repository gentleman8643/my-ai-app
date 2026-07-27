"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Sparkles } from "lucide-react";
import { MODEL_OPTIONS, type ModelOption } from "../lib/models";

type ModelDropdownProps = {
  value: ModelOption["id"];
  onChange: (id: ModelOption["id"]) => void;
  disabled?: boolean;
};

export function ModelDropdown({ value, onChange, disabled }: ModelDropdownProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const selected = MODEL_OPTIONS.find((m) => m.id === value) ?? MODEL_OPTIONS[0];

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 rounded-xl border border-border bg-surface px-4 py-3 text-left transition-colors hover:border-border-strong disabled:cursor-not-allowed disabled:opacity-50 focus-ring"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="flex min-w-0 items-center gap-3">
          <span className="flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-primary-500/15 text-primary-300">
            <Sparkles className="h-4 w-4" />
          </span>
          <span className="flex min-w-0 flex-col">
            <span className="flex items-center gap-2">
              <span className="truncate text-sm font-semibold text-text-0">
                {selected.label}
              </span>
              <span className="flex-none rounded-md bg-primary-500/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary-300">
                v{selected.version}
              </span>
              {selected.badge && (
                <span className="flex-none rounded-md bg-accent/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent">
                  {selected.badge}
                </span>
              )}
            </span>
            <span className="truncate text-xs text-text-2">{selected.description}</span>
          </span>
        </span>
        <ChevronDown
          className={`h-4 w-4 flex-none text-text-2 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute z-50 mt-2 max-h-[320px] w-full overflow-auto rounded-xl border border-border bg-bg-1 p-1.5 shadow-lg animate-fade-in-up"
        >
          {MODEL_OPTIONS.map((m) => {
            const active = m.id === value;
            return (
              <button
                key={m.id}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => {
                  onChange(m.id);
                  setOpen(false);
                }}
                className={`flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-surface ${
                  active ? "bg-surface" : ""
                }`}
              >
                <span className="mt-0.5 flex h-8 w-8 flex-none items-center justify-center rounded-lg bg-primary-500/10 text-primary-300">
                  <Sparkles className="h-3.5 w-3.5" />
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="flex items-center gap-2">
                    <span className="text-sm font-medium text-text-0">{m.label}</span>
                    <span className="rounded bg-primary-500/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-primary-300">
                      v{m.version}
                    </span>
                    {m.badge && (
                      <span className="rounded bg-accent/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-accent">
                        {m.badge}
                      </span>
                    )}
                  </span>
                  <span className="mt-0.5 text-xs leading-snug text-text-2">
                    {m.description}
                  </span>
                </span>
                {active && <Check className="mt-1 h-4 w-4 flex-none text-primary-400" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
