import React, { useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import {
  Send,
  AlertTriangle,
  Wifi,
  WifiOff,
  ShieldCheck,
  MessageSquareText,
  Loader2,
  Mic,
  Square,
  Play,
  Pause,
  Volume2,
} from "lucide-react";

/**
 * ChatTab.jsx (Responder)
 * - Text chat (socket)
 * - Audio record (MediaRecorder) -> upload to POST /api/message/audio -> realtime notify via socket
 *
 * Backend required (already in your backend changes):
 * - POST /api/message/init
 * - GET  /api/message/:emergencyId
 * - POST /api/message/audio  (multipart: audio + emergencyId)
 * - socket: chat:join, chat:send, chat:new
 */
export default function ChatTab({
  emergencyId,
  token,
  apiBaseUrl = "http://localhost:5000",
}) {
  const [status, setStatus] = useState("idle"); // idle|initializing|connecting|ready|error
  const [error, setError] = useState("");
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [showMeta, setShowMeta] = useState(false);

  // Audio recording UI state
  const [isRecording, setIsRecording] = useState(false);
  const [recordMs, setRecordMs] = useState(0);
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);

  // Local audio preview (optional)
  const [localAudioUrl, setLocalAudioUrl] = useState(null);

  // Per-message audio playback state
  const audioPlayersRef = useRef(new Map()); // key -> HTMLAudioElement
  const [playingKey, setPlayingKey] = useState(null);

  const socketRef = useRef(null);
  const listRef = useRef(null);
  const inputRef = useRef(null);

  // MediaRecorder refs
  const mediaStreamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordTimerRef = useRef(null);

  const api = useMemo(() => {
    const client = axios.create({ baseURL: apiBaseUrl });
    if (token) client.defaults.headers.common.Authorization = `Bearer ${token}`;
    return client;
  }, [apiBaseUrl, token]);

  const normalizedEmergencyId = useMemo(() => {
    if (emergencyId === undefined || emergencyId === null || emergencyId === "")
      return null;
    const n = Number(emergencyId);
    return Number.isFinite(n) ? n : null;
  }, [emergencyId]);

  const scrollToBottom = (force = false) => {
    const el = listRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    const nearBottom = distanceFromBottom < 120;
    if (force || nearBottom) el.scrollTop = el.scrollHeight;
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages.length]);

  const cleanupSocket = () => {
    const s = socketRef.current;
    if (s) {
      s.off("chat:new");
      s.off("receive_message");
      s.off("error_alert");
      s.off("connect_error");
      s.off("connect");
      s.disconnect();
    }
    socketRef.current = null;
  };

  const stopAllAudioPlayback = () => {
    const map = audioPlayersRef.current;
    for (const a of map.values()) {
      try {
        a.pause();
        a.currentTime = 0;
      } catch {}
    }
    setPlayingKey(null);
  };

  const cleanupRecorder = async () => {
    try {
      if (recordTimerRef.current) clearInterval(recordTimerRef.current);
      recordTimerRef.current = null;
      setRecordMs(0);
      setIsRecording(false);
    } catch {}

    try {
      const rec = mediaRecorderRef.current;
      if (rec && rec.state !== "inactive") rec.stop();
    } catch {}

    try {
      const stream = mediaStreamRef.current;
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    } catch {}

    mediaRecorderRef.current = null;
    mediaStreamRef.current = null;
    audioChunksRef.current = [];
  };

  useEffect(() => {
    let mounted = true;

    const boot = async () => {
      setError("");
      setMessages([]);

      if (!normalizedEmergencyId) {
        setStatus("idle");
        return;
      }

      if (!token) {
        setStatus("error");
        setError("Missing token. Please login again.");
        return;
      }

      try {
        setStatus("initializing");

        // responder-only init
        await api.post("/api/message/init", { emergencyId: normalizedEmergencyId });

        // load history
        const historyRes = await api.get(`/api/message/${normalizedEmergencyId}`);
        if (!mounted) return;
        setMessages(Array.isArray(historyRes.data?.data) ? historyRes.data.data : []);

        // socket connect
        setStatus("connecting");
        const s = io(apiBaseUrl, {
          auth: { token: `Bearer ${token}` },
          transports: ["websocket"],
        });
        socketRef.current = s;

        s.on("connect", () => {
          s.emit("chat:join", { emergencyId: normalizedEmergencyId });
          if (mounted) setStatus("ready");
          setTimeout(() => inputRef.current?.focus(), 50);
          setTimeout(() => scrollToBottom(true), 50);
        });

        const onIncoming = (msg) => {
          if (!mounted) return;
          setMessages((prev) => [...prev, msg]);
        };

        s.on("chat:new", onIncoming);
        s.on("receive_message", onIncoming); // legacy

        s.on("error_alert", (e) => {
          if (!mounted) return;
          if (e?.message) setError(e.message);
        });

        s.on("connect_error", (e) => {
          if (!mounted) return;
          setStatus("error");
          setError(e?.message || "Socket connection failed.");
        });
      } catch (e) {
        if (!mounted) return;
        setStatus("error");
        setError(e?.response?.data?.message || e.message || "Failed to init chat.");
      }
    };

    cleanupSocket();
    boot();

    return () => {
      mounted = false;
      cleanupSocket();
      stopAllAudioPlayback();
      cleanupRecorder();
      if (localAudioUrl) URL.revokeObjectURL(localAudioUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [normalizedEmergencyId, token, apiBaseUrl]);

  const canSendText = status === "ready" && !!text.trim() && !isUploadingAudio && !isRecording;

  const sendText = () => {
    setError("");
    const s = socketRef.current;
    const t = text.trim();

    if (!s) return setError("Socket not connected.");
    if (!normalizedEmergencyId) return;
    if (!t) return;

    s.emit("chat:send", { emergencyId: normalizedEmergencyId, text: t });
    setText("");
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const startRecording = async () => {
    setError("");

    if (status !== "ready") return setError("Chat not connected yet.");
    if (isUploadingAudio) return;
    if (isRecording) return;

    stopAllAudioPlayback();

    try {
      // Request mic access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      // Choose a supported mimeType
      const candidates = [
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/ogg;codecs=opus",
        "audio/ogg",
      ];
      const mimeType = candidates.find((t) => window.MediaRecorder && MediaRecorder.isTypeSupported(t)) || "";

      const rec = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = rec;
      audioChunksRef.current = [];

      rec.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      rec.onstop = async () => {
        // Build blob from chunks
        const chunks = audioChunksRef.current;
        audioChunksRef.current = [];

        // If user stopped immediately
        if (!chunks.length) return;

        const blob = new Blob(chunks, { type: rec.mimeType || "audio/webm" });

        // Local preview url
        try {
          if (localAudioUrl) URL.revokeObjectURL(localAudioUrl);
          const url = URL.createObjectURL(blob);
          setLocalAudioUrl(url);
        } catch {}

        // Upload and notify
        await uploadAudioBlob(blob);
      };

      rec.start();
      setIsRecording(true);
      setRecordMs(0);

      recordTimerRef.current = setInterval(() => {
        setRecordMs((ms) => ms + 250);
      }, 250);
    } catch (e) {
      console.error(e);
      setError("Microphone permission denied or recording failed.");
      await cleanupRecorder();
    }
  };

  const stopRecording = async () => {
    if (!isRecording) return;
    try {
      if (recordTimerRef.current) clearInterval(recordTimerRef.current);
      recordTimerRef.current = null;

      const rec = mediaRecorderRef.current;
      if (rec && rec.state !== "inactive") rec.stop();
    } catch (e) {
      console.error(e);
      setError("Failed to stop recording.");
      await cleanupRecorder();
    } finally {
      // Stop stream tracks
      try {
        const stream = mediaStreamRef.current;
        if (stream) stream.getTracks().forEach((t) => t.stop());
      } catch {}
      mediaStreamRef.current = null;
      setIsRecording(false);
      setRecordMs(0);
    }
  };

  const uploadAudioBlob = async (blob) => {
    if (!normalizedEmergencyId) return;
    if (!token) return;

    try {
      setIsUploadingAudio(true);

      // IMPORTANT: backend endpoint expects field name "audio"
      const ext =
        blob.type.includes("ogg") ? "ogg" : blob.type.includes("webm") ? "webm" : "webm";

      const file = new File(
        [blob],
        `chat_audio_${normalizedEmergencyId}_${Date.now()}.${ext}`,
        { type: blob.type || "audio/webm" },
      );

      const form = new FormData();
      form.append("emergencyId", String(normalizedEmergencyId));
      form.append("audio", file);

      const res = await api.post("/api/message/audio", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const saved = res.data?.data;
      if (!saved?.audioUrl) {
        throw new Error("Audio uploaded but audioUrl missing.");
      }

      // Realtime broadcast (backend will store again if you call chat:send with text only,
      // but here we send audioUrl so all clients receive instantly)
      const s = socketRef.current;
      if (s) {
        s.emit("chat:send", {
          emergencyId: normalizedEmergencyId,
          audioUrl: saved.audioUrl,
        });
      }

      // Also add locally (in case socket echo is delayed)
      setMessages((prev) => [...prev, saved]);
      scrollToBottom(true);
    } catch (e) {
      console.error(e);
      setError(e?.response?.data?.message || e.message || "Audio upload failed.");
    } finally {
      setIsUploadingAudio(false);
      await cleanupRecorder();
    }
  };

  const togglePlay = (key, src) => {
    if (!src) return;

    const map = audioPlayersRef.current;
    let player = map.get(key);

    // Stop any other playing audio
    if (playingKey && playingKey !== key) {
      const other = map.get(playingKey);
      try {
        other?.pause();
        if (other) other.currentTime = 0;
      } catch {}
      setPlayingKey(null);
    }

    if (!player) {
      player = new Audio(src);
      player.preload = "auto";
      player.onended = () => setPlayingKey(null);
      player.onerror = () => {
        setError("Failed to play audio.");
        setPlayingKey(null);
      };
      map.set(key, player);
    }

    if (playingKey === key) {
      try {
        player.pause();
      } catch {}
      setPlayingKey(null);
      return;
    }

    try {
      player.play();
      setPlayingKey(key);
    } catch (e) {
      console.error(e);
      setError("Browser blocked audio playback. Click play again.");
    }
  };

  const StatusPill = () => {
    const base =
      "inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-widest";
    if (status === "ready")
      return (
        <span className={`${base} bg-emerald-50 text-emerald-700 border border-emerald-200`}>
          <Wifi size={14} /> Connected
        </span>
      );
    if (status === "connecting" || status === "initializing")
      return (
        <span className={`${base} bg-blue-50 text-blue-700 border border-blue-200`}>
          <Loader2 size={14} className="animate-spin" /> {status}
        </span>
      );
    if (status === "error")
      return (
        <span className={`${base} bg-red-50 text-red-700 border border-red-200`}>
          <WifiOff size={14} /> Error
        </span>
      );
    return (
      <span className={`${base} bg-slate-50 text-slate-700 border border-slate-200`}>
        <ShieldCheck size={14} /> Idle
      </span>
    );
  };

  const formatTime = (iso) => {
    if (!iso) return "";
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  };

  const isResponderMsg = (m) => m?.senderType === "responderTeam";

  const renderMessageBody = (m) => {
    // audio message
    if (m?.messageType === "audio" || m?.audioUrl) {
      const url = m.audioUrl ? `${apiBaseUrl}${m.audioUrl}` : null;
      const key = m.id ?? `${m.senderType}-${m.senderId}-${m.createdAt}`;
      const isPlaying = playingKey === key;

      return (
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => togglePlay(key, url)}
            className="shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-xl border border-white/25 bg-white/10 hover:bg-white/15 active:scale-[0.98] transition"
            title={isPlaying ? "Pause audio" : "Play audio"}
          >
            {isPlaying ? <Pause size={18} /> : <Play size={18} />}
          </button>

          <div className="min-w-0">
            <div className="text-[11px] font-black uppercase tracking-widest opacity-90">
              Voice message
            </div>
            <div className="text-[12px] opacity-90 flex items-center gap-2">
              <Volume2 size={14} />
              <span className="truncate">{m.audioUrl}</span>
            </div>
          </div>
        </div>
      );
    }

    // text message
    return (
      <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
        {m.text}
      </div>
    );
  };

  const recordLabel = () => {
    const sec = Math.floor(recordMs / 1000);
    const mm = String(Math.floor(sec / 60)).padStart(2, "0");
    const ss = String(sec % 60).padStart(2, "0");
    return `${mm}:${ss}`;
  };

  return (
    <div className="h-full w-full flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
                <MessageSquareText size={18} />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                  Emergency Chat
                </div>
                <div className="text-sm font-bold text-slate-800 truncate">
                  Emergency #{normalizedEmergencyId ?? "-"}
                </div>
              </div>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-2">
              <StatusPill />
              <button
                type="button"
                onClick={() => setShowMeta((v) => !v)}
                className="text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-700 transition-colors"
              >
                {showMeta ? "Hide info" : "Show info"}
              </button>

              {isUploadingAudio ? (
                <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-widest bg-amber-50 text-amber-700 border border-amber-200">
                  <Loader2 size={14} className="animate-spin" /> Uploading audio…
                </span>
              ) : null}

              {isRecording ? (
                <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-widest bg-red-50 text-red-700 border border-red-200">
                  <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                  Recording {recordLabel()}
                </span>
              ) : null}
            </div>

            {showMeta && (
              <div className="mt-2 text-[11px] text-slate-500">
                <div>
                  <span className="font-bold">Backend:</span> {apiBaseUrl}
                </div>
                <div>
                  <span className="font-bold">Rule:</span> chat initializes from responder dashboard only.
                </div>
              </div>
            )}
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                cleanupSocket();
                stopAllAudioPlayback();
                cleanupRecorder();
                setStatus("idle");
                setError("");
                setMessages([]);
                setText("");
                setTimeout(() => window.location.reload(), 50);
              }}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-[11px] font-black uppercase tracking-widest hover:bg-slate-50 active:scale-[0.98] transition"
              title="Hard refresh chat"
            >
              Reset
            </button>
          </div>
        </div>

        {error ? (
          <div className="mt-3 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
            <AlertTriangle className="text-red-600 mt-0.5" size={16} />
            <div className="min-w-0">
              <div className="text-[10px] font-black uppercase tracking-widest text-red-700">
                Chat error
              </div>
              <div className="text-sm text-red-800 break-words">{error}</div>
            </div>
          </div>
        ) : null}
      </div>

      {/* Messages */}
      <div ref={listRef} className="flex-1 overflow-auto bg-slate-50 px-4 py-4">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="max-w-md w-full text-center p-6 rounded-2xl border border-dashed border-slate-300 bg-white">
              <div className="mx-auto w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center">
                <MessageSquareText size={22} />
              </div>
              <div className="mt-4 text-sm font-bold text-slate-800">No messages yet</div>
              <div className="mt-1 text-[12px] text-slate-500">
                When the citizen joins this emergency, messages will appear here.
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((m) => {
              const mine = isResponderMsg(m);
              const key = m.id ?? `${m.senderType}-${m.senderId}-${m.createdAt}-${Math.random()}`;
              return (
                <div key={key} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm border ${
                      mine
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-slate-900 border-slate-200"
                    }`}
                  >
                    {renderMessageBody(m)}

                    <div
                      className={`mt-2 flex items-center justify-between gap-3 text-[11px] ${
                        mine ? "text-white/80" : "text-slate-500"
                      }`}
                    >
                      <span className="font-bold uppercase tracking-widest">
                        {mine ? "Responder" : "Citizen"}
                      </span>
                      <span className="font-mono opacity-90">{formatTime(m.createdAt)}</span>
                    </div>

                    {showMeta && (
                      <div
                        className={`mt-2 text-[11px] font-mono ${
                          mine ? "text-white/75" : "text-slate-500"
                        }`}
                      >
                        senderType={m.senderType} senderId={m.senderId} · citizenId={m.citizenId} · responderTeamId=
                        {m.responderTeamId} · messageType={m.messageType} · audioUrl={m.audioUrl || "-"}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Composer */}
      <div className="border-t border-slate-100 bg-white p-4">
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 mb-2">
              Message
            </div>

            <textarea
              ref={inputRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={
                status === "ready"
                  ? isRecording
                    ? "Recording… (stop to send)"
                    : isUploadingAudio
                      ? "Uploading audio…"
                      : "Type your message…"
                  : "Connecting…"
              }
              rows={2}
              disabled={status !== "ready" || isRecording || isUploadingAudio}
              className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-300 disabled:opacity-60"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (canSendText) sendText();
                }
              }}
            />

            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
              <span>
                Press <b>Enter</b> to send • <b>Shift+Enter</b> for new line
              </span>
              <span className="font-mono">{text.length}/1000</span>
            </div>

            {localAudioUrl ? (
              <div className="mt-3 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
                <div className="shrink-0 w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                  <Volume2 size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Last recording preview
                  </div>
                  <audio controls src={localAudioUrl} className="w-full mt-1" />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    try {
                      URL.revokeObjectURL(localAudioUrl);
                    } catch {}
                    setLocalAudioUrl(null);
                  }}
                  className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-[11px] font-black uppercase tracking-widest hover:bg-slate-50 active:scale-[0.98] transition"
                >
                  Clear
                </button>
              </div>
            ) : null}
          </div>

          {/* Audio record button */}
          <button
            type="button"
            disabled={status !== "ready" || isUploadingAudio}
            onClick={isRecording ? stopRecording : startRecording}
            className={`h-[46px] px-4 rounded-2xl font-black uppercase tracking-widest text-[11px] flex items-center gap-2 shadow-sm border transition active:scale-[0.98] ${
              status === "ready" && !isUploadingAudio
                ? isRecording
                  ? "bg-red-600 text-white border-red-600 hover:bg-red-700"
                  : "bg-white text-slate-900 border-slate-300 hover:bg-slate-50"
                : "bg-slate-200 text-slate-500 border-slate-200 cursor-not-allowed"
            }`}
            title={isRecording ? "Stop recording (uploads + sends)" : "Record audio"}
          >
            {isRecording ? <Square size={16} /> : <Mic size={16} />}
            {isRecording ? "Stop" : "Audio"}
          </button>

          {/* Send text button */}
          <button
            type="button"
            onClick={sendText}
            disabled={!canSendText}
            className={`h-[46px] px-4 rounded-2xl font-black uppercase tracking-widest text-[11px] flex items-center gap-2 shadow-sm border transition active:scale-[0.98] ${
              canSendText
                ? "bg-slate-900 text-white border-slate-900 hover:bg-black"
                : "bg-slate-200 text-slate-500 border-slate-200 cursor-not-allowed"
            }`}
          >
            <Send size={16} />
            Send
          </button>
        </div>
      </div>
    </div>
  );
}