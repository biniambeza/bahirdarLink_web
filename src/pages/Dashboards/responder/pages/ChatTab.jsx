import React, {
  useEffect, useMemo, useRef, useState, useCallback,
} from "react";
import { io } from "socket.io-client";
import axios from "axios";
import {
  Send, Shield, Loader2, Mic, Square, Play, Pause,
  RefreshCw, CheckCheck, Paperclip, Video, PhoneOff, X, Monitor,
} from "lucide-react";

/* ─────────────────────────────────────────────────────────────────────────────
   Audio unlock (iOS Safari requires user-gesture before AudioContext)
───────────────────────────────────────────────────────────────────────────── */
let _audioUnlocked = false;
function unlockAudioContext() {
  if (_audioUnlocked) return;
  _audioUnlocked = true;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const buf = ctx.createBuffer(1, 1, 22050);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.connect(ctx.destination);
    src.start(0);
    setTimeout(() => ctx.close(), 500);
  } catch (_) {}
}

/* ─────────────────────────────────────────────────────────────────────────────
   SINGLE-DEVICE TESTING FIX:
   React (responder) uses getDisplayMedia (screen share) instead of the webcam.
   This means the physical camera stays free for Flutter (reporter) to grab.

   In real deployment on separate devices, swap TEST_MODE to false and it will
   use getUserMedia as normal.
───────────────────────────────────────────────────────────────────────────── */
const TEST_MODE = true; // ← set false for production / separate devices

async function getLocalStream() {
  if (TEST_MODE) {
    // Use screen share so the physical camera is free for Flutter
    try {
      const screen = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: { ideal: 30 } },
        audio: true,
      });
      return screen;
    } catch (_) {
      // User cancelled screen share — fall through to camera
    }
  }

  const attempts = [
    { video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" }, audio: true },
    { video: { width: { ideal: 640  }, height: { ideal: 480  } }, audio: true },
    { video: true, audio: true },
    { video: false, audio: true },
  ];
  let lastErr;
  for (const constraints of attempts) {
    try { return await navigator.mediaDevices.getUserMedia(constraints); }
    catch (e) { lastErr = e; }
  }
  throw lastErr;
}

function stopStream(stream) {
  if (!stream) return;
  try { stream.getTracks().forEach((t) => t.stop()); } catch (_) {}
}

const STUN_SERVERS = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
  { urls: "stun:stun2.l.google.com:19302" },
];

async function safePlay(el) {
  if (!el) return;
  try { await el.play(); } catch (_) {}
}

function attachStream(el, stream) {
  if (!el || !stream) return;
  if (el.srcObject !== stream) el.srcObject = stream;
  safePlay(el);
}

const sdpPayload = (desc) =>
  desc && "sdp" in desc ? { type: desc.type, sdp: desc.sdp } : desc;

const getMsgId  = (m) => m?._id ?? m?.id ?? null;
const isMineMsg = (m) => m?.senderType === "responderTeam";

/* ─────────────────────────────────────────────────────────────────────────────
   ChatTab
───────────────────────────────────────────────────────────────────────────── */
export default function ChatTab({
  emergencyId,
  token,
  apiBaseUrl = "http://localhost:5000",
}) {
  /* ── chat ── */
  const [status,           setStatus]           = useState("idle");
  const [error,            setError]            = useState("");
  const [messages,         setMessages]         = useState([]);
  const [text,             setText]             = useState("");
  const [isRecording,      setIsRecording]      = useState(false);
  const [recordMs,         setRecordMs]         = useState(0);
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);
  const [playingKey,       setPlayingKey]       = useState(null);

  /* ── call ── */
  const [isCallOpen,     setIsCallOpen]     = useState(false);
  const [callStatus,     setCallStatus]     = useState("idle");
  const [reporterUserId, setReporterUserId] = useState(null);

  // TEST_MODE indicator state
  const [usingScreenShare, setUsingScreenShare] = useState(false);

  /* ── DOM refs ── */
  const listRef        = useRef(null);
  const inputRef       = useRef(null);
  const localVideoRef  = useRef(null);
  const remoteVideoRef = useRef(null);

  /* ── socket / recorder refs ── */
  const socketRef        = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordTimerRef   = useRef(null);
  const mountedRef       = useRef(true);

  /* ── dedup ── */
  const seenIdsRef = useRef(new Set());

  /* ── WebRTC refs ── */
  const pcRef             = useRef(null);
  const localStreamRef    = useRef(null);
  const remoteStreamRef   = useRef(null);
  const isInitiatorRef    = useRef(false);
  const peerSocketIdRef   = useRef(null);
  const reporterUserIdRef = useRef(null);
  const offerSentRef      = useRef(false);
  const emergencyIdRef    = useRef(emergencyId);
  const pendingIceRef     = useRef([]);
  const flutterReadyRef   = useRef(false);

  useEffect(() => { emergencyIdRef.current = emergencyId; }, [emergencyId]);

  /* ── axios ── */
  const api = useMemo(() => {
    const client = axios.create({ baseURL: apiBaseUrl });
    if (token)
      client.defaults.headers.common.Authorization =
        token.startsWith("Bearer ") ? token : `Bearer ${token}`;
    return client;
  }, [apiBaseUrl, token]);

  /* ── auto-scroll ── */
  useEffect(() => {
    if (listRef.current)
      listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, isRecording]);

  /* ── Re-attach video when overlay opens ── */
  useEffect(() => {
    if (!isCallOpen) return;
    let attempts = 0;
    const tryAttach = () => {
      attachStream(remoteVideoRef.current, remoteStreamRef.current);
      attachStream(localVideoRef.current,  localStreamRef.current);
      if (++attempts < 10) setTimeout(tryAttach, 300);
    };
    setTimeout(tryAttach, 80);
  }, [isCallOpen]);

  /* ─────────────────────────────────────────────────────────────────────────
     WebRTC helpers
  ───────────────────────────────────────────────────────────────────────── */
  const attachVideoElements = useCallback(() => {
    attachStream(remoteVideoRef.current, remoteStreamRef.current);
    attachStream(localVideoRef.current,  localStreamRef.current);
  }, []);

  const ensurePeerConnection = useCallback(async (socket) => {
    if (pcRef.current) return pcRef.current;

    const pc = new RTCPeerConnection({ iceServers: STUN_SERVERS });
    remoteStreamRef.current = new MediaStream();

    pc.ontrack = (event) => {
      const rs = remoteStreamRef.current;
      if (!rs) return;
      const tracks = event.streams?.[0]?.getTracks().length
        ? event.streams[0].getTracks()
        : [event.track];
      tracks.forEach((t) => {
        if (!rs.getTracks().find((e) => e.id === t.id)) rs.addTrack(t);
      });
      [0, 200, 500, 1000, 2000].forEach((delay) =>
        setTimeout(attachVideoElements, delay)
      );
    };

    pc.onicecandidate = (event) => {
      if (!event.candidate) return;
      const s      = socket || socketRef.current;
      const target = peerSocketIdRef.current;
      if (!target || !s) return;
      s.emit("call:ice", {
        emergencyId:  emergencyIdRef.current,
        toSocketId:   target,
        fromSocketId: s.id,
        candidate:    event.candidate.toJSON(),
      });
    };

    pc.oniceconnectionstatechange = () => {
      if (!mountedRef.current) return;
      const st = pc.iceConnectionState;
      if (st === "connected" || st === "completed") {
        setCallStatus("in-call");
        setTimeout(attachVideoElements, 300);
      }
      if (st === "failed")       setCallStatus("failed");
      if (st === "disconnected") setCallStatus("disconnected");
    };

    pc.onconnectionstatechange = () => {
      if (!mountedRef.current) return;
      const st = pc.connectionState;
      if (st === "connected") {
        setCallStatus("in-call");
        setTimeout(attachVideoElements, 300);
      }
      if (st === "failed")       setCallStatus("failed");
      if (st === "disconnected") setCallStatus("disconnected");
    };

    // ── SINGLE-DEVICE FIX: get local stream (screen share in TEST_MODE) ──
    if (!localStreamRef.current) {
      const stream = await getLocalStream();
      localStreamRef.current = stream;

      // Detect if we ended up with a screen share track
      const hasDisplay = stream.getVideoTracks().some(
        (t) => t.label.toLowerCase().includes("screen") ||
               t.label.toLowerCase().includes("display") ||
               t.label.toLowerCase().includes("entire")
      );
      setUsingScreenShare(hasDisplay);

      // When the user stops screen share via the browser's built-in button,
      // handle gracefully (don't crash the call)
      stream.getVideoTracks().forEach((t) => {
        t.onended = () => {
          setUsingScreenShare(false);
          // Remove the ended video track from the PC sender
          pc.getSenders()
            .filter((s) => s.track?.kind === "video")
            .forEach((s) => {
              try { pc.removeTrack(s); } catch (_) {}
            });
        };
      });
    }

    attachStream(localVideoRef.current, localStreamRef.current);
    localStreamRef.current
      .getTracks()
      .forEach((track) => pc.addTrack(track, localStreamRef.current));

    pcRef.current = pc;
    return pc;
  }, [attachVideoElements]);

  const cleanupCallRefsOnly = useCallback(({ skipState = false } = {}) => {
    isInitiatorRef.current    = false;
    offerSentRef.current      = false;
    peerSocketIdRef.current   = null;
    reporterUserIdRef.current = null;
    pendingIceRef.current     = [];
    flutterReadyRef.current   = false;

    try { pcRef.current?.getSenders?.().forEach((s) => s.track?.stop()); } catch (_) {}
    try { pcRef.current?.close?.(); } catch (_) {}
    pcRef.current = null;

    stopStream(localStreamRef.current);
    localStreamRef.current  = null;
    remoteStreamRef.current = null;

    if (localVideoRef.current)  localVideoRef.current.srcObject  = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;

    setUsingScreenShare(false);

    if (!skipState) {
      setReporterUserId(null);
      setIsCallOpen(false);
    }
  }, []);

  const cleanupCall = useCallback(() => {
    cleanupCallRefsOnly({ skipState: false });
    setCallStatus("ended");
    setTimeout(() => { if (mountedRef.current) setCallStatus("idle"); }, 800);
  }, [cleanupCallRefsOnly]);

  /* ─────────────────────────────────────────────────────────────────────────
     Main socket + signalling effect
  ───────────────────────────────────────────────────────────────────────── */
  useEffect(() => {
    mountedRef.current = true;

    const init = async () => {
      if (!emergencyId || !token) return;
      try {
        setStatus("connecting");
        await api.post("/api/message/init", { emergencyId });

        const history = await api.get(`/api/message/${emergencyId}`);
        if (mountedRef.current) {
          const msgs = history.data?.data || [];
          seenIdsRef.current = new Set(msgs.map(getMsgId).filter(Boolean));
          setMessages(msgs);
        }

        const s = io(apiBaseUrl, {
          auth: { token: token.startsWith("Bearer ") ? token : `Bearer ${token}` },
          transports: ["websocket"],
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
        });
        socketRef.current = s;

        s.on("connect", () => {
          s.emit("chat:join", { emergencyId });
          if (mountedRef.current) setStatus("ready");
        });
        s.on("disconnect", () => {
          if (mountedRef.current) setStatus("idle");
        });

        s.on("chat:new", (msg) => {
          if (!mountedRef.current) return;
          const id = getMsgId(msg);
          if (id) {
            if (seenIdsRef.current.has(id)) return;
            seenIdsRef.current.add(id);
          }
          setMessages((prev) => [...prev, msg]);
        });

        /* ── Call signalling ── */
        s.on("call:initiated", (p) => {
          if (!mountedRef.current) return;
          const rid = p?.reporterUserId ?? p?.toUserId;
          if (rid != null) {
            reporterUserIdRef.current = Number(rid);
            setReporterUserId(Number(rid));
          }
        });

        // ── SINGLE-DEVICE FIX: when Flutter signals ready, we DON'T need to
        // release our stream anymore — we're using screen share, not the camera!
        // We just acknowledge and let Flutter proceed.
        s.on("call:flutter-ready", (p) => {
          if (!mountedRef.current) return;
          const incomingId = p?.emergencyId;
          if (incomingId != null && Number(incomingId) !== Number(emergencyIdRef.current)) return;
          flutterReadyRef.current = true;
          // In TEST_MODE we keep our screen-share stream alive — Flutter can open
          // the camera freely since we never grabbed it.
          // In production (separate devices), this is a no-op too since the camera
          // is on a different physical device.
        });

        s.on("call:peer-joined", async (payload) => {
          if (!mountedRef.current || !isInitiatorRef.current || offerSentRef.current) return;

          const { socketId, identity } = payload || {};
          if (!socketId) return;

          const senderType = identity?.senderType;
          if (senderType && senderType !== "user") return;

          const expected = reporterUserIdRef.current;
          if (expected != null && identity?.id != null) {
            if (Number(identity.id) !== Number(expected)) return;
          }

          peerSocketIdRef.current = socketId;
          if (mountedRef.current) setCallStatus("connecting");

          try {
            const pc    = await ensurePeerConnection(s);
            const offer = await pc.createOffer({
              offerToReceiveAudio: true,
              offerToReceiveVideo: true,
            });
            await pc.setLocalDescription(offer);
            offerSentRef.current = true;
            s.emit("call:offer", {
              emergencyId:  emergencyIdRef.current,
              toSocketId:   socketId,
              fromSocketId: s.id,
              sdp:          sdpPayload(offer),
            });
          } catch (err) {
            console.error("createOffer failed:", err);
            if (mountedRef.current) setError("Failed to create offer");
          }
        });

        s.on("call:answer", async (payload) => {
          try {
            const pc = pcRef.current;
            if (!pc) return;
            const rawSdp = payload?.sdp ?? payload;
            if (!rawSdp?.type || !rawSdp?.sdp) return;
            await pc.setRemoteDescription(new RTCSessionDescription(rawSdp));
            for (const cand of pendingIceRef.current) {
              try { await pc.addIceCandidate(cand); } catch (_) {}
            }
            pendingIceRef.current = [];
            [200, 600, 1200, 2000].forEach((delay) =>
              setTimeout(attachVideoElements, delay)
            );
            if (mountedRef.current) setCallStatus("in-call");
          } catch (err) {
            console.error("setRemoteDescription failed:", err);
            if (mountedRef.current) setError("Failed to apply answer SDP");
          }
        });

        s.on("call:ice", async (payload) => {
          try {
            const pc = pcRef.current;
            if (!pc) return;
            const rawCand = payload?.candidate ?? payload;
            if (!rawCand || (!rawCand.candidate && !rawCand.sdpMid)) return;
            const cand = rawCand instanceof RTCIceCandidate
              ? rawCand
              : new RTCIceCandidate(rawCand);
            if (!pc.remoteDescription?.type) {
              pendingIceRef.current.push(cand);
              return;
            }
            await pc.addIceCandidate(cand);
          } catch (_) {}
        });

        const endFromRemote = () => {
          if (!mountedRef.current) return;
          cleanupCallRefsOnly({ skipState: false });
          setCallStatus("ended");
          setTimeout(() => { if (mountedRef.current) setCallStatus("idle"); }, 800);
        };
        s.on("call:hangup",    endFromRemote);
        s.on("call:peer-left", endFromRemote);
        s.on("call:error", (p) => {
          if (!mountedRef.current) return;
          setError(p?.message || "Call error");
          cleanupCallRefsOnly({ skipState: false });
          setCallStatus("idle");
          setIsCallOpen(false);
        });

      } catch (err) {
        console.error("init failed:", err);
        if (mountedRef.current) {
          setStatus("error");
          setError("Connection failed — please reload");
        }
      }
    };

    init();
    return () => {
      mountedRef.current = false;
      cleanupCallRefsOnly({ skipState: true });
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emergencyId, token, apiBaseUrl]);

  /* ─────────────────────────────────────────────────────────────────────────
     Chat actions
  ───────────────────────────────────────────────────────────────────────── */
  const handleSend = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed || status !== "ready") return;

    const s = socketRef.current;
    if (!s) return;

    const optKey = `opt_${Date.now()}_${Math.random()}`;
    const optimistic = {
      id:          optKey,
      _id:         optKey,
      emergencyId,
      senderType:  "responderTeam",
      messageType: "text",
      text:        trimmed,
      audioUrl:    null,
      createdAt:   new Date().toISOString(),
    };
    seenIdsRef.current.add(optKey);
    setMessages((prev) => [...prev, optimistic]);

    s.emit("chat:send", { emergencyId, text: trimmed });
    setText("");
  }, [text, status, emergencyId]);

  const toggleRecording = useCallback(async () => {
    unlockAudioContext();
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      clearInterval(recordTimerRef.current);
      return;
    }
    try {
      const stream   = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/mp4")
        ? "audio/mp4"
        : "";
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : {});
      mediaRecorderRef.current = recorder;
      const chunks = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType || "audio/webm" });
        uploadAudio(blob);
        stream.getTracks().forEach((t) => t.stop());
      };
      recorder.start(100);
      setIsRecording(true);
      setRecordMs(0);
      recordTimerRef.current = setInterval(() => setRecordMs((p) => p + 1000), 1000);
    } catch {
      setError("Microphone access denied");
      setTimeout(() => setError(""), 3000);
    }
  }, [isRecording]);

  const uploadAudio = async (blob) => {
    setIsUploadingAudio(true);
    const formData = new FormData();
    formData.append("audio", blob);
    formData.append("emergencyId", emergencyId);
    try {
      await api.post("/api/message/audio", formData);
    } catch {
      setError("Audio upload failed");
    }
    setIsUploadingAudio(false);
  };

  /* ─────────────────────────────────────────────────────────────────────────
     Call actions
  ───────────────────────────────────────────────────────────────────────── */
  const startVideoCall = useCallback(async () => {
    const s = socketRef.current;
    if (!s || status !== "ready") return;
    unlockAudioContext();

    try {
      setError("");
      setIsCallOpen(true);
      setCallStatus("starting");
      isInitiatorRef.current  = true;
      offerSentRef.current    = false;
      peerSocketIdRef.current = null;
      pendingIceRef.current   = [];
      flutterReadyRef.current = false;

      await new Promise((r) => setTimeout(r, 80));
      await ensurePeerConnection(s);

      s.emit("call:initiate", { emergencyId });
      s.emit("call:join",     { emergencyId });

      setCallStatus("ringing");
    } catch (err) {
      console.error("startVideoCall failed:", err);
      setError("Failed to start call: " + (err?.message ?? "unknown"));
      cleanupCallRefsOnly({ skipState: false });
      setCallStatus("idle");
      setIsCallOpen(false);
    }
  }, [status, emergencyId, ensurePeerConnection, cleanupCallRefsOnly]);

  const hangup = useCallback(() => {
    const s      = socketRef.current;
    const target = peerSocketIdRef.current;
    const rid    = reporterUserIdRef.current;
    const payload = { emergencyId };
    if (target)           payload.toSocketId = target;
    else if (rid != null) payload.toIdentity = { senderType: "user", id: Number(rid) };
    s?.emit("call:hangup", payload);
    cleanupCall();
  }, [emergencyId, cleanupCall]);

  const callStatusLabel = {
    starting:     "Starting…",
    ringing:      "Ringing reporter's app…",
    connecting:   "Negotiating connection…",
    "in-call":    "Connected",
    disconnected: "Reconnecting…",
    failed:       "Connection failed",
    ended:        "Call ended",
  }[callStatus] ?? "";

  /* ─────────────────────────────────────────────────────────────────────────
     Render
  ───────────────────────────────────────────────────────────────────────── */
  return (
    <div
      className="relative flex flex-col h-full w-full overflow-hidden"
      style={{ background: "#EEF2F7", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}
    >
      {/* ── Header ── */}
      <header style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "10px 16px",
        background: "linear-gradient(135deg, #1E3A8A 0%, #1E40AF 100%)",
        boxShadow: "0 2px 12px rgba(30,64,175,.35)",
        zIndex: 20, position: "relative",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ position: "relative" }}>
            <div style={{
              width: 42, height: 42, borderRadius: "50%",
              background: "rgba(255,255,255,.18)",
              display: "flex", alignItems: "center", justifyContent: "center",
              border: "1.5px solid rgba(255,255,255,.3)",
            }}>
              <Shield size={20} color="#fff" />
            </div>
            <span style={{
              position: "absolute", bottom: 1, right: 1,
              width: 11, height: 11, borderRadius: "50%",
              background: status === "ready" ? "#22C55E" : "#F59E0B",
              border: "2px solid #1E40AF",
              animation: status !== "ready" ? "pulse 1.4s infinite" : "none",
            }} />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", letterSpacing: ".01em" }}>
              Case Feed #{emergencyId}
            </div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,.6)", marginTop: 1, letterSpacing: ".04em" }}>
              {status === "ready" ? "LIVE · Tactical Network" : "CONNECTING…"}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {/* TEST_MODE badge */}
          {TEST_MODE && (
            <div style={{
              fontSize: 9, fontWeight: 700, letterSpacing: ".06em",
              color: "#FCD34D", background: "rgba(251,191,36,.15)",
              border: "1px solid rgba(251,191,36,.35)",
              padding: "3px 8px", borderRadius: 6,
            }}>
              TEST MODE · Screen Share
            </div>
          )}
          <button
            onClick={startVideoCall}
            disabled={status !== "ready" || isCallOpen}
            title="Start video call"
            style={{
              width: 38, height: 38, borderRadius: "50%",
              background: status === "ready" && !isCallOpen ? "rgba(255,255,255,.18)" : "rgba(255,255,255,.07)",
              border: "1px solid rgba(255,255,255,.25)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: status === "ready" && !isCallOpen ? "pointer" : "not-allowed",
              transition: "background .2s",
            }}
          >
            <Video size={17} color={status === "ready" && !isCallOpen ? "#fff" : "rgba(255,255,255,.3)"} />
          </button>
          <button
            onClick={() => window.location.reload()}
            title="Refresh"
            style={{
              width: 38, height: 38, borderRadius: "50%",
              background: "rgba(255,255,255,.12)",
              border: "1px solid rgba(255,255,255,.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <RefreshCw size={16} color="#fff" />
          </button>
        </div>
      </header>

      {/* ── Video call overlay ── */}
      {isCallOpen && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 50,
          background: "rgba(8,12,24,.93)",
          display: "flex", flexDirection: "column",
        }}>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "14px 16px",
            borderBottom: "0.5px solid rgba(255,255,255,.1)",
          }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>
                Video call — Reporter
                {reporterUserId != null && (
                  <span style={{ fontSize: 11, fontWeight: 400, color: "rgba(255,255,255,.35)", marginLeft: 6 }}>
                    #{reporterUserId}
                  </span>
                )}
              </div>
              <div style={{
                fontSize: 12, marginTop: 3, fontWeight: 600,
                color: callStatus === "in-call" ? "#22C55E"
                     : callStatus === "failed"  ? "#EF4444"
                     : "rgba(255,255,255,.45)",
              }}>
                {callStatusLabel}
              </div>
            </div>
            <button
              onClick={hangup}
              style={{
                display: "flex", alignItems: "center", gap: 7,
                background: "#EF4444", border: "none", color: "#fff",
                fontWeight: 700, fontSize: 13, padding: "9px 16px",
                borderRadius: 12, cursor: "pointer",
                transition: "background .2s, transform .1s",
                WebkitTapHighlightColor: "transparent",
              }}
              onTouchStart={(e) => e.currentTarget.style.transform = "scale(.96)"}
              onTouchEnd={(e) => e.currentTarget.style.transform = "scale(1)"}
            >
              <PhoneOff size={15} />
              Hang up
            </button>
          </div>

          <div style={{
            flex: 1, display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: 10, padding: 14, alignContent: "start",
          }}>
            {/* Remote — reporter (Flutter side) — shows reporter's CAMERA */}
            <div style={{
              position: "relative", borderRadius: 14,
              overflow: "hidden", background: "#0d1a2e",
              aspectRatio: "4/3", display: "flex",
              alignItems: "center", justifyContent: "center",
            }}>
              <video
                ref={remoteVideoRef}
                autoPlay playsInline controls={false}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
              <span style={{
                position: "absolute", bottom: 8, left: 10,
                fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,.85)",
                background: "rgba(0,0,0,.5)", padding: "3px 9px", borderRadius: 8,
              }}>
                📱 Reporter (camera)
              </span>
              {callStatus !== "in-call" && (
                <div style={{
                  position: "absolute", inset: 0,
                  display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center",
                  gap: 10, background: "rgba(0,0,0,.6)",
                }}>
                  <Loader2 size={26} color="rgba(255,255,255,.4)"
                    style={{ animation: "spin 1s linear infinite" }} />
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,.35)" }}>
                    {callStatusLabel}
                  </span>
                </div>
              )}
            </div>

            {/* Local — responder (React side) — shows screen share in TEST_MODE */}
            <div style={{
              position: "relative", borderRadius: 14,
              overflow: "hidden", background: "#0d1a2e",
              aspectRatio: "4/3",
            }}>
              <video
                ref={localVideoRef}
                autoPlay muted playsInline controls={false}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
              <span style={{
                position: "absolute", bottom: 8, left: 10,
                fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,.85)",
                background: "rgba(0,0,0,.5)", padding: "3px 9px", borderRadius: 8,
                display: "flex", alignItems: "center", gap: 5,
              }}>
                {usingScreenShare
                  ? <><Monitor size={9} /> You (screen share)</>
                  : <>🎥 You (camera)</>
                }
              </span>
            </div>
          </div>

          {/* TEST_MODE hint banner */}
          {TEST_MODE && (
            <div style={{
              margin: "0 14px 12px",
              padding: "10px 14px",
              background: "rgba(251,191,36,.08)",
              border: "1px solid rgba(251,191,36,.25)",
              borderRadius: 10,
              fontSize: 11, color: "#FCD34D", lineHeight: 1.6,
            }}>
              <strong>Single-device test mode:</strong> React uses screen share so Flutter can freely open the camera.
              Flutter's big frame = Reporter's camera. React's frame = your screen.
              On real separate devices, set <code>TEST_MODE = false</code>.
            </div>
          )}
        </div>
      )}

      {/* ── Message list ── */}
      <div
        ref={listRef}
        style={{
          flex: 1, overflowY: "auto",
          padding: "16px 12px",
          display: "flex", flexDirection: "column", gap: 10,
          WebkitOverflowScrolling: "touch",
        }}
      >
        {messages.length === 0 && status === "ready" && (
          <div style={{
            textAlign: "center", marginTop: 40,
            color: "rgba(30,64,175,.4)", fontSize: 13,
          }}>
            No messages yet. Start the conversation.
          </div>
        )}

        {messages.map((m, i) => {
          const mine = isMineMsg(m);
          return (
            <div key={getMsgId(m) ?? i} style={{
              display: "flex",
              justifyContent: mine ? "flex-end" : "flex-start",
            }}>
              {!mine && (
                <div style={{
                  display: "flex", flexDirection: "column", alignItems: "flex-start", maxWidth: "78%",
                }}>
                  <span style={{
                    fontSize: 10, fontWeight: 700, color: "#1E40AF",
                    marginBottom: 3, marginLeft: 4, letterSpacing: ".03em",
                    textTransform: "uppercase",
                  }}>
                    {m.senderType === "user" ? "Reporter" : m.senderType}
                  </span>
                  <MessageBubble
                    m={m}
                    mine={mine}
                    i={i}
                    apiBaseUrl={apiBaseUrl}
                    playingKey={playingKey}
                    setPlayingKey={setPlayingKey}
                  />
                </div>
              )}
              {mine && (
                <MessageBubble
                  m={m}
                  mine={mine}
                  i={i}
                  apiBaseUrl={apiBaseUrl}
                  playingKey={playingKey}
                  setPlayingKey={setPlayingKey}
                />
              )}
            </div>
          );
        })}

        {error && (
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              background: "#EF4444", color: "#fff",
              padding: "7px 16px", borderRadius: 24,
              fontSize: 12, fontWeight: 600,
              boxShadow: "0 2px 8px rgba(239,68,68,.3)",
            }}>
              <X size={13} style={{ cursor: "pointer" }} onClick={() => setError("")} />
              {error}
            </div>
          </div>
        )}
      </div>

      {/* ── Input bar ── */}
      <footer style={{
        padding: "8px 10px",
        background: "#fff",
        borderTop: "0.5px solid #e5e9ef",
        zIndex: 20,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, maxWidth: 640, margin: "0 auto" }}>
          <button style={{
            width: 36, height: 36, borderRadius: "50%", border: "none",
            background: "transparent", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            WebkitTapHighlightColor: "transparent",
          }}>
            <Paperclip size={20} color="#9CA3AF" />
          </button>

          <div style={{
            flex: 1, background: "#EEF2F7", borderRadius: 22,
            display: "flex", alignItems: "center",
            padding: "0 14px", minHeight: 42,
          }}>
            {isRecording ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{
                    width: 10, height: 10, borderRadius: "50%", background: "#EF4444",
                    animation: "pulse 1s infinite",
                    boxShadow: "0 0 8px rgba(239,68,68,.5)",
                  }} />
                  <span style={{ fontSize: 14, fontFamily: "monospace", fontWeight: 700, color: "#1a1a2e" }}>
                    {Math.floor(recordMs / 60000)}:{String(Math.floor(recordMs / 1000) % 60).padStart(2, "0")}
                  </span>
                </div>
                <span style={{ fontSize: 12, color: "#1E40AF", fontWeight: 600, animation: "pulse 1.4s infinite" }}>
                  Recording…
                </span>
              </div>
            ) : (
              <textarea
                ref={inputRef}
                rows={1}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
                }}
                placeholder="Message"
                style={{
                  flex: 1, border: "none", background: "transparent",
                  fontSize: 14, outline: "none", resize: "none",
                  maxHeight: 120, padding: "10px 0",
                  color: "#1a1a2e", lineHeight: 1.5,
                  WebkitAppearance: "none",
                }}
              />
            )}
          </div>

          {text.trim() || isUploadingAudio ? (
            <button
              onClick={handleSend}
              style={{
                width: 42, height: 42, borderRadius: "50%",
                background: "#1E40AF", border: "none", color: "#fff",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", flexShrink: 0,
                boxShadow: "0 3px 10px rgba(30,64,175,.4)",
                transition: "transform .1s",
                WebkitTapHighlightColor: "transparent",
              }}
              onTouchStart={(e) => e.currentTarget.style.transform = "scale(.93)"}
              onTouchEnd={(e)   => e.currentTarget.style.transform = "scale(1)"}
            >
              {isUploadingAudio
                ? <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />
                : <Send size={18} style={{ marginLeft: 1 }} />
              }
            </button>
          ) : (
            <button
              onClick={toggleRecording}
              style={{
                width: 42, height: 42, borderRadius: "50%",
                background: isRecording ? "#EF4444" : "#1E40AF",
                border: "none", color: "#fff",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", flexShrink: 0,
                boxShadow: `0 3px 10px ${isRecording ? "rgba(239,68,68,.4)" : "rgba(30,64,175,.4)"}`,
                animation: isRecording ? "pulse 1.2s infinite" : "none",
                WebkitTapHighlightColor: "transparent",
              }}
            >
              {isRecording ? <Square size={16} fill="#fff" /> : <Mic size={20} />}
            </button>
          )}
        </div>
      </footer>

      <style>{`
        @keyframes spin  { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:.45; } }
      `}</style>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   MessageBubble
───────────────────────────────────────────────────────────────────────────── */
function MessageBubble({ m, mine, i, apiBaseUrl, playingKey, setPlayingKey }) {
  return (
    <div style={{
      maxWidth: "78%", minWidth: 90,
      padding: "8px 12px 6px",
      borderRadius: 16,
      borderBottomRightRadius: mine ? 4 : 16,
      borderBottomLeftRadius:  mine ? 16 : 4,
      background: mine ? "#1E40AF" : "#fff",
      color: mine ? "#fff" : "#1a1a2e",
      boxShadow: "0 1px 3px rgba(0,0,0,.08)",
    }}>
      {m.audioUrl ? (
        <TelegramAudioPlayer
          url={`${apiBaseUrl}${m.audioUrl}`}
          isMine={mine}
          isPlaying={playingKey === i}
          onTogglePlay={() => setPlayingKey(playingKey === i ? null : i)}
        />
      ) : (
        <p style={{ fontSize: 14, lineHeight: 1.5, wordBreak: "break-word", margin: 0 }}>
          {m.text}
        </p>
      )}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "flex-end",
        gap: 4, marginTop: 3, opacity: .55,
      }}>
        <span style={{ fontSize: 10, fontWeight: 500 }}>
          {m.createdAt
            ? new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            : ""}
        </span>
        {mine && <CheckCheck size={13} color="rgba(255,255,255,.8)" />}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   TelegramAudioPlayer
───────────────────────────────────────────────────────────────────────────── */
function TelegramAudioPlayer({ url, isMine, isPlaying, onTogglePlay }) {
  const audioRef    = useRef(null);
  const toggleRef   = useRef(onTogglePlay);
  toggleRef.current = onTogglePlay;

  const [progress, setProgress] = useState(0);
  const bars = useMemo(
    () => Array.from({ length: 30 }, () => Math.random() * 75 + 20),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [url],
  );

  useEffect(() => {
    const audio = new Audio(url);
    audio.preload = "metadata";
    audioRef.current = audio;

    const onTime = () => {
      if (audio.duration) setProgress((audio.currentTime / audio.duration) * 100);
    };
    const onEnd = () => { toggleRef.current?.(); setProgress(0); };

    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("ended",      onEnd);

    if (isPlaying) audio.play().catch(() => {});
    else           audio.pause();

    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("ended",      onEnd);
      audio.pause();
      audio.src = "";
    };
  }, [url, isPlaying]);

  const accent  = isMine ? "rgba(255,255,255,.9)" : "#1E40AF";
  const trackBg = isMine ? "rgba(255,255,255,.25)" : "#CBD5E1";

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 200, padding: "2px 0" }}>
      <button
        onClick={onTogglePlay}
        style={{
          width: 38, height: 38, borderRadius: "50%", border: "none",
          background: isMine ? "rgba(255,255,255,.25)" : "#EEF2F7",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", flexShrink: 0,
          WebkitTapHighlightColor: "transparent",
        }}
      >
        {isPlaying
          ? <Pause size={18} fill={accent} color={accent} />
          : <Play  size={18} fill={accent} color={accent} style={{ marginLeft: 1 }} />
        }
      </button>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ height: 24, display: "flex", alignItems: "center", gap: "2px" }}>
          {bars.map((h, idx) => (
            <div key={idx} style={{
              width: 2.5, borderRadius: 2, flexShrink: 0,
              height: `${h}%`,
              background: (idx / bars.length) * 100 < progress ? accent : trackBg,
              transition: "background .15s",
            }} />
          ))}
        </div>
        <div style={{
          fontSize: 9, fontWeight: 700, marginTop: 3, letterSpacing: ".05em",
          color: isMine ? "rgba(255,255,255,.5)" : "#9CA3AF",
        }}>VOICE NOTE</div>
      </div>
    </div>
  );
}