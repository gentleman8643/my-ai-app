"use client";

import { useEffect, useRef, useState } from "react";
import { createDecartClient, models } from "@decartai/sdk";

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);

  const [apiKey, setApiKey] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [status, setStatus] = useState("");
  const [emotion, setEmotion] = useState("neutral");

  const [useImageBackground, setUseImageBackground] = useState(true);

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
  // ULTRA REALISM PROMPT ENGINE
  // ---------------------------
  const getPrompt = (emotion: string) => {
    const base =
      "photorealistic human portrait, ultra detailed skin texture, natural pores, DSLR photo, 85mm lens, shallow depth of field, cinematic lighting, zero cartoon style, zero animation look";

    const identityLock =
      "consistent face identity, stable facial structure, no morphing, no distortion, realistic proportions";

    const expression =
      emotion === "talk"
        ? "natural speaking, subtle lip motion, realistic jaw movement"
        : emotion === "blink"
        ? "natural blinking, realistic eye micro-movements"
        : "neutral expression, relaxed face";

    const background = useImageBackground
      ? "keep original background from reference image"
      : "professional studio nature background, soft sunlight, cinematic bokeh, realistic depth"

    const antiCartoon =
      "no anime, no cartoon, no illustration, no stylized rendering, no CGI look";

    return `${base}, ${identityLock}, ${expression}, ${background}, ${antiCartoon}`;
  };

  // ---------------------------
  // FACE TRACKING (STABILIZED)
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
      minDetectionConfidence: 0.9,
      minTrackingConfidence: 0.9,
    });

    let lastEmotion = "neutral";

    faceMesh.onResults((results: any) => {
      const lm = results.multiFaceLandmarks?.[0];
      if (!lm) return;

      const mouth = Math.abs(lm[13].y - lm[14].y);
      const blink = Math.abs(lm[159].y - lm[145].y);

      let newEmotion = "neutral";

      if (mouth > 0.055) newEmotion = "talk";
      else if (blink > 0.025) newEmotion = "blink";

      // 🔥 prevent flicker (IMPORTANT FOR REALISM)
      if (newEmotion !== lastEmotion) {
        lastEmotion = newEmotion;
        setEmotion(newEmotion);
      }
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
      setStatus("Starting Ultra Realistic Mode...");

      if (!apiKey) return setStatus("❌ Missing API key");
      if (!image) return setStatus("❌ Upload image");

      running = true;

      const camStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });

      setStream(camStream);

      const video = videoRef.current!;
      video.srcObject = camStream;
      await video.play();

      await initTracking(video);

      setStatus("Connecting Ultra Realism Engine...");

      const decart = createDecartClient({ apiKey });
      const model = models.realtime("lucy-latest");

      const output = document.getElementById("out") as HTMLVideoElement;

      const connection = await decart.realtime.connect(camStream, {
        model,

        onRemoteStream: (remoteStream) => {
          output.srcObject = remoteStream;
          setStatus("🟢 ULTRA REALISTIC PRO MODE ACTIVE");
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
        <h2>🔥 ULTRA REALISTIC PRO MODE</h2>

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

        <label style={{ display: "block", marginTop: "10px" }}>
          <input
            type="checkbox"
            checked={useImageBackground}
            onChange={(e) => setUseImageBackground(e.target.checked)}
          />
          Use Image Background
        </label>

        <button onClick={start}>START PRO MODE</button>
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
          width: 340px;
          padding: 12px;
        }

        input,
        button {
          padding: 10px;
          margin: 6px 0;
          width: 100%;
        }

        button {
          background: #22c55e;
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