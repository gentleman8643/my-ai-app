"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createDecartClient, models, type RealTimeClient } from "@decartai/sdk";
import { ControlPanel, type BackgroundMode } from "./ControlPanel";
import { PreviewStage } from "./PreviewStage";
import { DEFAULT_MODEL_ID, DEFAULT_PROMPT, getModel, type ModelOption } from "../lib/models";
import type { ImageValidation } from "../lib/imageValidation";

const API_KEY_STORAGE = "decart_api_key";

export function Studio() {
  const [apiKey, setApiKey] = useState("");
  const [modelId, setModelId] = useState<ModelOption["id"]>(DEFAULT_MODEL_ID);
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [background, setBackground] = useState<BackgroundMode>("image");
  const [file, setFile] = useState<File | null>(null);
  const [validation, setValidation] = useState<ImageValidation | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [outputReady, setOutputReady] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const cameraVideoRef = useRef<HTMLVideoElement | null>(null);
  const outputVideoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const clientRef = useRef<RealTimeClient | null>(null);

  const previewUrl = useMemo(
    () => (file ? URL.createObjectURL(file) : null),
    [file]
  );

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  useEffect(() => {
    const saved = localStorage.getItem(API_KEY_STORAGE);
    if (saved) setApiKey(saved);
  }, []);

  useEffect(() => {
    if (apiKey) localStorage.setItem(API_KEY_STORAGE, apiKey);
  }, [apiKey]);

  useEffect(() => {
    return () => {
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const canStart = Boolean(
    apiKey && file && (validation?.ready ?? false) && prompt.trim()
  );

  const cleanup = useCallback(() => {
    try {
      clientRef.current?.disconnect();
    } catch {
      // ignore
    }
    clientRef.current = null;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
    }
    streamRef.current = null;
    if (cameraVideoRef.current) cameraVideoRef.current.srcObject = null;
    if (outputVideoRef.current) outputVideoRef.current.srcObject = null;
    setCameraReady(false);
    setOutputReady(false);
  }, []);

  const handleStart = useCallback(async () => {
    if (!apiKey || !file || !validation?.ready || !prompt.trim()) return;

    setIsConnecting(true);
    setIsStreaming(true);
    setOutputReady(false);
    setStatusMessage("Requesting camera access...");

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30, max: 30 },
          facingMode: "user",
        },
        audio: false,
      };
      const camStream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = camStream;

      const camVideo = cameraVideoRef.current;
      if (camVideo) {
        camVideo.srcObject = camStream;
        camVideo.muted = true;
        camVideo.playsInline = true;
        await camVideo.play().catch(() => {});
        setCameraReady(true);
      }

      setStatusMessage("Connecting to Decart realtime...");

      const decart = createDecartClient({ apiKey });
      const model = models.realtime(modelId);

      const connection = await decart.realtime.connect(camStream, {
        model,
        resolution: "720p",
        mirror: "auto",
        onRemoteStream: (remoteStream) => {
          const out = outputVideoRef.current;
          if (out) {
            out.srcObject = remoteStream;
            out.muted = true;
            out.playsInline = true;
            out.play().catch(() => {});
          }
          setOutputReady(true);
          setIsConnecting(false);
          setStatusMessage("Live AI active — generating every frame in real time.");
        },
        onConnectionChange: (state) => {
          if (state === "disconnected") {
            setStatusMessage(`Connection ${state}. Stopped to save credits.`);
            handleStop();
          }
        },
        initialState: {
          prompt: { text: prompt, enhance: true },
          image: file,
        },
      });

      clientRef.current = connection;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      setStatusMessage(`Failed to start: ${msg}`);
      setIsConnecting(false);
      setIsStreaming(false);
      cleanup();
    }
  }, [apiKey, file, modelId, prompt, validation, cleanup]);

  const handleStop = useCallback(() => {
    cleanup();
    setIsStreaming(false);
    setIsConnecting(false);
    setStatusMessage("Stopped. Credits preserved.");
  }, [cleanup]);

  const handleApplyPrompt = useCallback(async () => {
    const client = clientRef.current;
    if (!client || !isStreaming) return;
    try {
      await client.setPrompt(prompt, { enhance: true });
      setStatusMessage("Prompt updated for the live stream.");
    } catch {
      setStatusMessage("Could not update prompt while streaming.");
    }
  }, [isStreaming, prompt]);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row lg:px-8">
      <ControlPanel
        apiKey={apiKey}
        onApiKeyChange={setApiKey}
        modelId={modelId}
        onModelChange={setModelId}
        prompt={prompt}
        onPromptChange={setPrompt}
        background={background}
        onBackgroundChange={setBackground}
        file={file}
        previewUrl={previewUrl}
        validation={validation}
        onFileChange={setFile}
        onValidationChange={setValidation}
        isStreaming={isStreaming}
        isConnecting={isConnecting}
        canStart={canStart}
        onStart={handleStart}
        onStop={handleStop}
        statusMessage={statusMessage}
      />

      <div className="flex flex-1 flex-col gap-4">
        <PreviewStage
          isStreaming={isStreaming}
          isConnecting={isConnecting}
          background={background}
          cameraReady={cameraReady}
          outputReady={outputReady}
          onCameraVideoRef={(el) => (cameraVideoRef.current = el)}
          onOutputVideoRef={(el) => (outputVideoRef.current = el)}
        />

        {isStreaming && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-bg-1/60 px-4 py-3 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-xs text-text-2">
              <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse-glow" />
              Streaming with <span className="font-semibold text-text-0">{getModel(modelId).label}</span>
            </div>
            <button
              type="button"
              onClick={handleApplyPrompt}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-text-1 transition-colors hover:border-primary-500 hover:text-primary-300 focus-ring"
            >
              Re-apply prompt
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
