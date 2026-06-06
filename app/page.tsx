"use client";

import { useEffect, useRef, useState } from "react";
import { createDecartClient, models } from "@decartai/sdk";

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);

  const [apiKey, setApiKey] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [status, setStatus] = useState("");
  const [emotion, setEmotion] = useState("neutral");

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [client, setClient] = useState<any>(null);

  let faceMesh: any;
  let running = false;

  // ---------------------------
  // LOAD API KEY
  // ---------------------------
  useEffect(() => {
    const saved = localStorage.getItem("decart_api");
    if (saved) setApiKey(saved);
  }, []);

  // ---------------------------
  // PROMPT ENGINE
  // ---------------------------
  const getPrompt = (emotion: string) => {
    if (emotion === "talk") {
      return "ultra realistic human speaking, natural lip movement, cinematic lighting";
    }
    if (emotion === "blink") {
      return "realistic human blinking, subtle motion, natural face";
    }
    return "ultra realistic neutral human face, sharp detail, no duplicates";
  };

  // ---------------------------
  // FACE TRACKING ONLY (NO AUDIO)
  // ---------------------------
  async function initTracking(video: HTMLVideoElement) {
    if (typeof window === "undefined") return;

    const vision = await import("@mediapipe/face_mesh");

    faceMesh = new vision.FaceMesh({
      locateFile: (file: string) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
    });

    faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.8,
      minTrackingConfidence: 0.8,
    });

    faceMesh.onResults((results: any) => {
      const lm = results.multiFaceLandmarks?.[0];
      if (!lm) return;

      const mouth = Math.abs(lm[13].y - lm[14].y);
      const blink = Math.abs(lm[159].y - lm[145].y);

      if (mouth > 0.05) setEmotion("talk");
      else if (blink > 0.02) setEmotion("blink");
      else setEmotion("neutral");
    });

    const loop = async () => {
      if (!running) return;

      if (video.readyState >= 2) {
        await faceMesh.send({ image: video });
      }

      requestAnimationFrame(loop);
    };

    loop();
  }

  // ---------------------------
  // START
  // ---------------------------
  async function start() {
    try {
      setStatus("Starting...");

      if (!apiKey) return setStatus("❌ Missing API key");
      if (!image) return setStatus("❌ Upload image");

      running = true;

      const camStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false, // 🔥 AUDIO REMOVED
      });

      setStream(camStream);

      const video = videoRef.current!;
      video.srcObject = camStream;
      await video.play();

      await initTracking(video);

      setStatus("Connecting AI...");

      const decart = createDecartClient({ apiKey });
      const model = models.realtime("lucy-latest");

      const output = document.getElementById("out") as HTMLVideoElement;

      const connection = await decart.realtime.connect(camStream, {
        model,

        onRemoteStream: (remoteStream) => {
          output.srcObject = remoteStream;
          setStatus("🟢 LIVE (NO AUDIO MODE)");
        },

        initialState: {
          prompt: {
            text: getPrompt(emotion),
            enhance: true,
          },
          image,
        },
      });

      setClient(connection);
    } catch (e: any) {
      console.error(e);
      setStatus("❌ Failed: " + e.message);
    }
  }

  // ---------------------------
  // STOP
  // ---------------------------
  function stop() {
    running = false;

    client?.disconnect();
    setClient(null);

    stream?.getTracks().forEach((t) => t.stop());

    setStatus("🔴 STOPPED");
  }

  return (
    <div className="wrap">
      <video ref={videoRef} style={{ display: "none" }} />

      <div className="panel">
        <h2>🔥 VTUBER CLEAN MODE</h2>

        <input
          placeholder="API Key"
          value={apiKey}
          onChange={(e) => {
            setApiKey(e.target.value);
            localStorage.setItem("decart_api", e.target.value);
          }}
        />

        <input
          type="file"
          onChange={(e) => setImage(e.target.files?.[0] || null)}
        />

        <button onClick={start}>START</button>
        <button onClick={stop}>STOP</button>

        <p>Status: {status}</p>
        <p>Emotion: {emotion}</p>
      </div>

      <div className="view">
        <video id="out" autoPlay playsInline muted />
      </div>

      <style jsx>{`
        .wrap {
          display: flex;
          height: 100vh;
          background: #050816;
          color: white;
        }

        .panel {
          width: 320px;
          padding: 12px;
        }

        input,
        button {
          padding: 10px;
          margin: 6px 0;
          width: 100%;
        }

        button {
          background: #6366f1;
          border: none;
          color: white;
        }

        .view {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        video {
          width: 85%;
          border-radius: 12px;
        }
      `}</style>
    </div>
  );
}