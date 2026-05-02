import React, { useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import {
  Send, Shield, Loader2, Mic, Square, Play, Pause,
  RefreshCw, CheckCheck, Paperclip, X, Video, PhoneOff,
} from "lucide-react";

export default function ChatTab({
  emergencyId,
  token,
  apiBaseUrl = "http://localhost:5000",
}) {
  // ── Chat state ─────────────────────────────────────────────────────────────
  const [status,           setStatus]           = useState("idle");
  const [error,            setError]            = useState("");
  const [messages,         setMessages]         = useState([]);
  const [text,             setText]             = useState("");
  const [isRecording,      setIsRecording]      = useState(false);
  const [recordMs,         setRecordMs]         = useState(0);
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);
  const [playingKey,       setPlayingKey]       = useState(null);

  // ── Call state ─────────────────────────────────────────────────────────────
  const [isCallOpen,     setIsCallOpen]     = useState(false);
  const [callStatus,     setCallStatus]     = useState("idle");
  const [reporterUserId, setReporterUserId] = useState(null);

  // ── DOM refs ───────────────────────────────────────────────────────────────
  const listRef  = useRef(null);
  const inputRef = useRef(null);

  // ── Socket / recorder refs ─────────────────────────────────────────────────
  const socketRef        = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordTimerRef   = useRef(null);
  const mountedRef       = useRef(true);

  // ── WebRTC refs ────────────────────────────────────────────────────────────
  const pcRef             = useRef(null);
  const localStreamRef    = useRef(null);
  const remoteStreamRef   = useRef(null);
  const localVideoRef     = useRef(null);
  const remoteVideoRef    = useRef(null);
  const isInitiatorRef    = useRef(false);
  const peerSocketIdRef   = useRef(null);
  const reporterUserIdRef = useRef(null);
  const offerSentRef      = useRef(false);
  const emergencyIdRef    = useRef(emergencyId);

  // ICE candidates received before setRemoteDescription
  const pendingIceRef = useRef([]);

  // Keep emergencyIdRef in sync without re-running the main effect
  useEffect(() => { emergencyIdRef.current = emergencyId; }, [emergencyId]);

  // ── Axios instance ─────────────────────────────────────────────────────────
  const api = useMemo(() => {
    const client = axios.create({ baseURL: apiBaseUrl });
    if (token)
      client.defaults.headers.common.Authorization =
        token.startsWith("Bearer ") ? token : `Bearer ${token}`;
    return client;
  }, [apiBaseUrl, token]);

  // ── Auto-scroll messages ───────────────────────────────────────────────────
  useEffect(() => {
    if (listRef.current)
      listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, isRecording]);

  // ── Re-attach video streams when overlay mounts ────────────────────────────
  // Safety net: if tracks arrived before the <video> elements were in the DOM,
  // this effect wires them up the moment isCallOpen flips to true.
  useEffect(() => {
    if (!isCallOpen) return;
    const id = setTimeout(() => {
      if (remoteStreamRef.current && remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStreamRef.current;
        remoteVideoRef.current.play().catch(() => {});
      }
      if (localStreamRef.current && localVideoRef.current) {
        localVideoRef.current.srcObject = localStreamRef.current;
        localVideoRef.current.play().catch(() => {});
      }
    }, 50);
    return () => clearTimeout(id);
  }, [isCallOpen]);

  // ── WebRTC helpers ─────────────────────────────────────────────────────────

  /**
   * Normalise an SDP descriptor so we always send a plain { type, sdp } object
   * rather than an RTCSessionDescription instance (not JSON-serialisable).
   */
  const sdpPayload = (desc) =>
    desc && typeof desc === "object" && "sdp" in desc
      ? { type: desc.type, sdp: desc.sdp }
      : desc;

  /** Wire srcObject on both video elements whenever streams are available. */
  const attachVideoElements = () => {
    if (remoteStreamRef.current && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStreamRef.current;
      remoteVideoRef.current.play().catch(() => {});
    }
    if (localStreamRef.current && localVideoRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current;
      localVideoRef.current.play().catch(() => {});
    }
  };

  /**
   * Create (or return) the RTCPeerConnection, acquire local media, and wire
   * all event handlers.  Idempotent — safe to call multiple times.
   */
  const ensurePeerConnection = async (socket) => {
    if (pcRef.current) return pcRef.current;

    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
      ],
    });

    // Create the remote MediaStream container up-front
    remoteStreamRef.current = new MediaStream();

    // ── ontrack ─────────────────────────────────────────────────────────────
    pc.ontrack = (event) => {
      const rs = remoteStreamRef.current;
      if (!rs) return;

      // Prefer event.streams[0] (populated on web); fall back to event.track
      const tracks =
        event.streams[0]?.getTracks().length
          ? event.streams[0].getTracks()
          : [event.track];

      tracks.forEach((t) => {
        if (!rs.getTracks().find((e) => e.id === t.id)) rs.addTrack(t);
      });

      attachVideoElements();
    };

    // ── onicecandidate ───────────────────────────────────────────────────────
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

    // ── onconnectionstatechange ──────────────────────────────────────────────
    pc.onconnectionstatechange = () => {
      if (!mountedRef.current) return;
      const state = pc.connectionState;
      if (state === "connected")    setCallStatus("in-call");
      if (state === "failed")       setCallStatus("failed");
      if (state === "disconnected") setCallStatus("disconnected");
    };

    // ── Acquire local media ──────────────────────────────────────────────────
    if (!localStreamRef.current) {
      try {
        localStreamRef.current = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
      } catch (mediaErr) {
        // Fall back to audio-only if camera is unavailable
        console.warn("Video unavailable, falling back to audio-only:", mediaErr);
        localStreamRef.current = await navigator.mediaDevices.getUserMedia({
          video: false,
          audio: true,
        });
      }
    }

    // Wire local preview immediately if the overlay is already mounted
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current;
      localVideoRef.current.play().catch(() => {});
    }

    localStreamRef.current
      .getTracks()
      .forEach((track) => pc.addTrack(track, localStreamRef.current));

    pcRef.current = pc;
    return pc;
  };

  // ── Cleanup helpers ────────────────────────────────────────────────────────

  /** Tear down WebRTC resources without touching React state. */
  const cleanupCallRefsOnly = ({ skipState = false } = {}) => {
    isInitiatorRef.current    = false;
    offerSentRef.current      = false;
    peerSocketIdRef.current   = null;
    reporterUserIdRef.current = null;
    pendingIceRef.current     = [];

    // Stop sender tracks before closing
    try { pcRef.current?.getSenders?.().forEach((s) => s.track?.stop()); } catch (_) {}
    try { pcRef.current?.close?.(); } catch (_) {}
    pcRef.current = null;

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }
    remoteStreamRef.current = null;

    if (localVideoRef.current)  localVideoRef.current.srcObject  = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;

    if (!skipState) {
      setReporterUserId(null);
      setIsCallOpen(false);
    }
  };

  /** Full cleanup including React state reset. */
  const cleanupCall = () => {
    cleanupCallRefsOnly({ skipState: false });
    setCallStatus("ended");
    setTimeout(() => { if (mountedRef.current) setCallStatus("idle"); }, 800);
  };

  // ── Socket + signalling setup ──────────────────────────────────────────────
  useEffect(() => {
    mountedRef.current = true;

    const initChat = async () => {
      if (!emergencyId || !token) return;

      try {
        setStatus("connecting");

        // Initialise message history
        await api.post("/api/message/init", { emergencyId });
        const history = await api.get(`/api/message/${emergencyId}`);
        if (mountedRef.current) setMessages(history.data?.data || []);

        // Connect socket
        const s = io(apiBaseUrl, {
          auth: {
            token: token.startsWith("Bearer ") ? token : `Bearer ${token}`,
          },
          transports: ["websocket"],
        });
        socketRef.current = s;

        // ── chat events ────────────────────────────────────────────────────
        s.on("connect", () => {
          s.emit("chat:join", { emergencyId });
          if (mountedRef.current) setStatus("ready");
        });

        s.on("chat:new", (msg) => {
          if (mountedRef.current) setMessages((p) => [...p, msg]);
        });

        // ── call:initiated — server confirmed initiation, gives reporterUserId
        s.on("call:initiated", (p) => {
          if (!mountedRef.current) return;
          const rid = p?.reporterUserId ?? p?.toUserId;
          if (rid != null) {
            reporterUserIdRef.current = Number(rid);
            setReporterUserId(Number(rid));
          }
        });

        // ── call:peer-joined — Flutter accepted and joined the signalling room
        s.on("call:peer-joined", async (payload) => {
          if (!mountedRef.current) return;
          if (!isInitiatorRef.current || offerSentRef.current) return;

          const { socketId, identity } = payload || {};
          if (!socketId || !identity) return;

          // Only accept joins from citizen/user senders (Flutter side)
          if (identity.senderType !== "user") return;

          // Optionally verify the reporter matches what we expect
          const expected = reporterUserIdRef.current;
          if (expected != null && Number(identity.id) !== Number(expected)) return;

          peerSocketIdRef.current = socketId;
          if (mountedRef.current) setCallStatus("connecting");

          try {
            const pc    = await ensurePeerConnection(s);
            const offer = await pc.createOffer();
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
            if (mountedRef.current) setError("Failed to create WebRTC offer");
          }
        });

        // ── call:answer — Flutter replied with its answer SDP
        s.on("call:answer", async (payload) => {
          try {
            const pc = pcRef.current;
            if (!pc) return;

            // The answer SDP may arrive as payload.sdp (nested) or flat
            const rawSdp = payload?.sdp ?? payload;
            if (!rawSdp?.type || !rawSdp?.sdp) {
              console.error("call:answer: invalid SDP payload", payload);
              return;
            }

            await pc.setRemoteDescription(new RTCSessionDescription(rawSdp));

            // Drain ICE candidates queued before the answer arrived
            for (const cand of pendingIceRef.current) {
              try { await pc.addIceCandidate(cand); } catch (_) {}
            }
            pendingIceRef.current = [];

            if (mountedRef.current) setCallStatus("in-call");
          } catch (err) {
            console.error("setRemoteDescription(answer) failed:", err);
            if (mountedRef.current) setError("Failed to apply remote answer");
          }
        });

        // ── call:ice — trickle ICE candidate from Flutter
        s.on("call:ice", async (payload) => {
          try {
            const pc = pcRef.current;
            if (!pc) return;

            // Candidate may be nested under payload.candidate or be the object itself
            const rawCand = payload?.candidate ?? payload;
            if (!rawCand || (!rawCand.candidate && !rawCand.sdpMid)) return;

            const cand =
              rawCand instanceof RTCIceCandidate
                ? rawCand
                : new RTCIceCandidate(rawCand);

            // Queue if remote description not yet applied
            if (!pc.remoteDescription || !pc.remoteDescription.type) {
              pendingIceRef.current.push(cand);
              return;
            }

            await pc.addIceCandidate(cand);
          } catch (_) { /* transient — ignore */ }
        });

        // ── Remote-initiated call end ──────────────────────────────────────
        const endFromRemote = () => {
          if (!mountedRef.current) return;
          cleanupCallRefsOnly({ skipState: false });
          setCallStatus("ended");
          setTimeout(
            () => { if (mountedRef.current) setCallStatus("idle"); },
            800
          );
        };
        s.on("call:hangup",    endFromRemote);
        s.on("call:peer-left", endFromRemote);

        s.on("call:error", (p) => {
          if (!mountedRef.current) return;
          console.error("call:error from server:", p);
          setError(p?.message || "Call error from server");
          cleanupCallRefsOnly({ skipState: false });
          setCallStatus("idle");
          setIsCallOpen(false);
        });

        s.on("disconnect", () => {
          if (mountedRef.current) setStatus("idle");
        });

      } catch (err) {
        console.error("initChat failed:", err);
        if (mountedRef.current) {
          setStatus("error");
          setError("Connection failed — please reload");
        }
      }
    };

    initChat();

    return () => {
      mountedRef.current = false;
      cleanupCallRefsOnly({ skipState: true });
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emergencyId, token, apiBaseUrl]);

  // ── Chat actions ───────────────────────────────────────────────────────────
  const handleSend = () => {
    if (!text.trim() || status !== "ready") return;
    socketRef.current?.emit("chat:send", { emergencyId, text: text.trim() });
    setText("");
  };

  const toggleRecording = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      clearInterval(recordTimerRef.current);
      return;
    }
    try {
      const stream   = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      const chunks = [];
      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        uploadAudio(new Blob(chunks, { type: "audio/webm" }));
        stream.getTracks().forEach((t) => t.stop());
      };
      recorder.start();
      setIsRecording(true);
      setRecordMs(0);
      recordTimerRef.current = setInterval(
        () => setRecordMs((p) => p + 1000),
        1000
      );
    } catch {
      setError("Microphone access denied");
      setTimeout(() => setError(""), 3000);
    }
  };

  const uploadAudio = async (blob) => {
    setIsUploadingAudio(true);
    const formData = new FormData();
    formData.append("audio", blob);
    formData.append("emergencyId", emergencyId);
    try {
      const res = await api.post("/api/message/audio", formData);
      socketRef.current?.emit("chat:send", {
        emergencyId,
        audioUrl: res.data.data.audioUrl,
      });
    } catch {
      setError("Audio upload failed");
    }
    setIsUploadingAudio(false);
  };

  // ── Call actions ───────────────────────────────────────────────────────────
  const startVideoCall = async () => {
    const s = socketRef.current;
    if (!s || status !== "ready") return;

    try {
      setError("");

      // Open the overlay FIRST so <video> elements mount in the DOM before
      // ensurePeerConnection runs and before any tracks or state arrives.
      setIsCallOpen(true);
      setCallStatus("starting");
      isInitiatorRef.current  = true;
      offerSentRef.current    = false;
      peerSocketIdRef.current = null;
      pendingIceRef.current   = [];

      // Yield to React so the overlay DOM is fully flushed before we touch refs
      await new Promise((r) => setTimeout(r, 50));

      // Pre-warm the PC and acquire media now that video elements exist in DOM
      await ensurePeerConnection(s);

      // Tell the server → server sends call:incoming to Flutter via identity room
      s.emit("call:initiate", { emergencyId });
      // Join signalling room → when Flutter joins, server fires call:peer-joined here
      s.emit("call:join",     { emergencyId });

      setCallStatus("ringing");
    } catch (err) {
      console.error("startVideoCall failed:", err);
      setError("Failed to start video call: " + (err?.message ?? "unknown error"));
      cleanupCallRefsOnly({ skipState: false });
      setCallStatus("idle");
      setIsCallOpen(false);
    }
  };

  const hangup = () => {
    const s      = socketRef.current;
    const target = peerSocketIdRef.current;
    const rid    = reporterUserIdRef.current;

    const payload = { emergencyId };
    if (target)        payload.toSocketId = target;
    else if (rid != null) payload.toIdentity = { senderType: "user", id: Number(rid) };

    s?.emit("call:hangup", payload);
    cleanupCall();
  };

  const callStatusLabel = {
    starting:      "Starting…",
    ringing:       "Ringing reporter's app…",
    connecting:    "Peer connected, negotiating…",
    "in-call":     "In call",
    disconnected:  "Reconnecting…",
    failed:        "Connection failed",
    ended:         "Call ended",
  }[callStatus] ?? "";

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full w-full bg-[#E6EBF0] overflow-hidden font-sans relative selection:bg-[#24A1DE]/30">
      {/* Subtle background pattern */}
      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage: `url('https://www.transparenttextures.com/patterns/p4.png')`,
          backgroundSize: "400px",
        }}
      />

      {/* ── Header ── */}
      <header className="flex items-center justify-between px-5 py-3 bg-white/80 backdrop-blur-md border-b border-gray-200 z-20 sticky top-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#24A1DE] to-[#3eb5f0] flex items-center justify-center text-white shadow-sm">
              <Shield size={20} />
            </div>
            <div
              className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white transition-colors ${
                status === "ready" ? "bg-green-500" : "bg-orange-400 animate-pulse"
              }`}
            />
          </div>
          <div>
            <h2 className="text-[15px] font-bold text-gray-800 leading-tight">
              Case Feed #{emergencyId}
            </h2>
            <span className="text-[11px] font-semibold text-[#24A1DE] uppercase tracking-wider">
              Tactical Network
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={startVideoCall}
            disabled={status !== "ready" || isCallOpen}
            title="Ring reporter (video)"
            className={`p-2.5 rounded-full transition-all ${
              status !== "ready" || isCallOpen
                ? "text-gray-300 cursor-not-allowed"
                : "text-gray-500 hover:bg-gray-100 hover:text-[#24A1DE]"
            }`}
          >
            <Video size={18} />
          </button>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="p-2.5 hover:bg-gray-100 rounded-full text-gray-400 transition-all active:rotate-180 duration-500"
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </header>

      {/* ── Call overlay ── */}
      {isCallOpen && (
        <div className="absolute inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-4xl bg-[#0b1220] rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col">

            {/* Call status bar */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
              <div>
                <p className="text-white text-sm font-bold">
                  Video call — Reporter
                  {reporterUserId != null && (
                    <span className="ml-2 text-xs font-normal text-white/40">
                      user #{reporterUserId}
                    </span>
                  )}
                </p>
                <p
                  className={`text-xs mt-0.5 font-semibold ${
                    callStatus === "in-call"
                      ? "text-green-400"
                      : callStatus === "failed"
                      ? "text-red-400"
                      : "text-white/50"
                  }`}
                >
                  {callStatusLabel}
                </p>
              </div>
              <button
                type="button"
                onClick={hangup}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm transition-all active:scale-95"
              >
                <PhoneOff size={16} /> Hang up
              </button>
            </div>

            {/* Video grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4">

              {/* Remote — Flutter / reporter */}
              <div className="relative rounded-xl overflow-hidden bg-black aspect-video">
                {/*
                  ref is guaranteed to exist here because isCallOpen=true means
                  this subtree is mounted before ensurePeerConnection runs.
                  autoPlay + playsInline are required for mobile browsers.
                */}
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-2 left-2 text-xs font-bold text-white/80 bg-black/50 px-2 py-1 rounded-lg">
                  Reporter
                </span>
                {callStatus !== "in-call" && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/60">
                    <Loader2 size={28} className="text-white/50 animate-spin" />
                    <span className="text-white/50 text-xs">{callStatusLabel}</span>
                  </div>
                )}
              </div>

              {/* Local — responder (you) */}
              <div className="relative rounded-xl overflow-hidden bg-black aspect-video">
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-2 left-2 text-xs font-bold text-white/80 bg-black/50 px-2 py-1 rounded-lg">
                  You
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Message list ── */}
      <div
        ref={listRef}
        className="flex-1 overflow-y-auto px-4 py-6 space-y-4 z-10 scrollbar-hide"
      >
        {messages.map((m, i) => {
          const isMine = m.senderType === "responderTeam";
          return (
            <div
              key={i}
              className={`flex ${isMine ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-1 duration-300`}
            >
              <div
                className={`relative max-w-[85%] min-w-[100px] px-3.5 py-2 shadow-sm ${
                  isMine
                    ? "bg-[#EFFDDE] text-gray-800 rounded-2xl rounded-tr-none"
                    : "bg-white text-gray-800 rounded-2xl rounded-tl-none"
                }`}
              >
                {/* Telegram-style bubble tail */}
                <div
                  className={`absolute top-0 w-3 h-3 ${
                    isMine
                      ? "-right-2 bg-[#EFFDDE] [clip-path:polygon(0_0,0_100%,100%_0)]"
                      : "-left-2 bg-white [clip-path:polygon(100%_0,0_0,100%_100%)]"
                  }`}
                />
                {m.audioUrl ? (
                  <TelegramAudioPlayer
                    url={`${apiBaseUrl}${m.audioUrl}`}
                    isMine={isMine}
                    isPlaying={playingKey === i}
                    onTogglePlay={() =>
                      setPlayingKey(playingKey === i ? null : i)
                    }
                  />
                ) : (
                  <p className="text-[14.5px] leading-relaxed break-words">{m.text}</p>
                )}
                <div className="flex items-center justify-end gap-1.5 mt-1 opacity-60">
                  <span className="text-[10px] font-medium">
                    {new Date(m.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  {isMine && <CheckCheck size={14} className="text-green-600" />}
                </div>
              </div>
            </div>
          );
        })}

        {error && (
          <div className="flex justify-center">
            <div className="bg-red-500/90 backdrop-blur-sm text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-2">
              <X
                size={14}
                className="cursor-pointer shrink-0"
                onClick={() => setError("")}
              />
              {error}
            </div>
          </div>
        )}
      </div>

      {/* ── Footer / input bar ── */}
      <footer className="p-3 bg-white/95 backdrop-blur-sm border-t border-gray-100 z-20">
        <div className="max-w-4xl mx-auto flex items-center gap-2">
          <button
            type="button"
            className="p-2 text-gray-400 hover:text-[#24A1DE] transition-colors rounded-full hover:bg-gray-50"
          >
            <Paperclip size={22} />
          </button>

          <div className="flex-1 bg-[#F1F3F4] rounded-[22px] transition-all focus-within:bg-white focus-within:ring-1 focus-within:ring-gray-200 flex items-center px-4 py-1.5 min-h-[44px]">
            {isRecording ? (
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                  <span className="text-[15px] font-mono font-bold text-gray-700">
                    {Math.floor(recordMs / 60000)}:
                    {(Math.floor(recordMs / 1000) % 60).toString().padStart(2, "0")}
                  </span>
                </div>
                <span className="text-[#24A1DE] text-sm font-medium animate-pulse">
                  Recording
                </span>
              </div>
            ) : (
              <textarea
                ref={inputRef}
                rows={1}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Message"
                className="flex-1 bg-transparent border-none focus:ring-0 text-[15px] py-1.5 resize-none max-h-32"
              />
            )}
          </div>

          <div className="relative w-12 h-12 flex items-center justify-center">
            {text.trim() || isUploadingAudio ? (
              <button
                type="button"
                onClick={handleSend}
                className="w-11 h-11 bg-[#24A1DE] text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-[#24A1DE]/40 transition-all active:scale-90"
              >
                {isUploadingAudio ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <Send size={20} className="ml-0.5" />
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={toggleRecording}
                className={`w-11 h-11 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-90 ${
                  isRecording
                    ? "bg-red-500 text-white animate-pulse"
                    : "bg-[#24A1DE] text-white hover:bg-[#1e8ec4]"
                }`}
              >
                {isRecording ? (
                  <Square size={18} fill="currentColor" />
                ) : (
                  <Mic size={22} />
                )}
              </button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}

// ── TelegramAudioPlayer ────────────────────────────────────────────────────
function TelegramAudioPlayer({ url, isMine, isPlaying, onTogglePlay }) {
  const audioRef    = useRef(null);
  const onToggleRef = useRef(onTogglePlay);
  onToggleRef.current = onTogglePlay;

  const [progress, setProgress] = useState(0);
  const bars = useMemo(
    () => Array.from({ length: 28 }, () => Math.random() * 80 + 20),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [url]
  );

  useEffect(() => {
    const audio = new Audio(url);
    audioRef.current = audio;

    const onTime = () => {
      if (audio.duration)
        setProgress((audio.currentTime / audio.duration) * 100);
    };
    const onEnd = () => { onToggleRef.current?.(); setProgress(0); };

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

  return (
    <div className="flex items-center gap-3 py-1.5 min-w-[220px]">
      <button
        type="button"
        onClick={onTogglePlay}
        className={`w-11 h-11 rounded-full flex items-center justify-center transition-all shadow-sm ${
          isMine ? "bg-[#86C166] text-white" : "bg-[#24A1DE] text-white"
        }`}
      >
        {isPlaying ? (
          <Pause size={22} fill="currentColor" />
        ) : (
          <Play size={22} fill="currentColor" className="ml-1" />
        )}
      </button>
      <div className="flex-1 flex flex-col justify-center">
        <div className="h-6 flex items-center gap-[2.5px]">
          {bars.map((height, i) => (
            <div
              key={i}
              className={`w-[2.5px] rounded-full transition-colors duration-300 ${
                (i / bars.length) * 100 < progress
                  ? isMine ? "bg-[#5b913d]" : "bg-[#24A1DE]"
                  : "bg-gray-300/60"
              }`}
              style={{ height: `${height}%` }}
            />
          ))}
        </div>
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mt-1">
          Voice Note
        </span>
      </div>
    </div>
  );
}