import React, { useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import {
  Send,
  Shield,
  Loader2,
  Mic,
  Square,
  Play,
  Pause,
  RefreshCw,
  CheckCheck,
  Paperclip,
  X,
  Video,
  PhoneOff,
} from "lucide-react";

/**
 * Responder dashboard chat + WebRTC video (offerer).
 *
 * Backend (BahirLink-Backend/socket/videoCallSocket.js):
 * 1. Emit `call:initiate` { emergencyId } → server notifies reporter via `call:incoming` (identity_user_<citizenId>).
 * 2. Emit `call:join` { emergencyId } → join emergency_<id> signaling room (idempotent if initiate already joined).
 * 3. When reporter’s app calls `call:join`, this socket receives `call:peer-joined` with their socketId → send `call:offer`.
 * 4. ICE/answer: use `toSocketId` from peer; optional `toIdentity: { senderType: "user", id: reporterUserId }` for hangup.
 */
export default function ChatTab({
  emergencyId,
  token,
  apiBaseUrl = "http://localhost:5000",
}) {
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordMs, setRecordMs] = useState(0);
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);
  const [playingKey, setPlayingKey] = useState(null);

  const [isCallOpen, setIsCallOpen] = useState(false);
  const [callStatus, setCallStatus] = useState("idle");
  const [peerSocketId, setPeerSocketId] = useState(null);
  const [reporterUserId, setReporterUserId] = useState(null);

  const socketRef = useRef(null);
  const listRef = useRef(null);
  const inputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordTimerRef = useRef(null);

  const pcRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const isInitiatorRef = useRef(false);
  const peerSocketIdRef = useRef(null);
  const reporterUserIdRef = useRef(null);
  const offerSentRef = useRef(false);
  const emergencyIdRef = useRef(emergencyId);

  useEffect(() => {
    emergencyIdRef.current = emergencyId;
  }, [emergencyId]);

  const api = useMemo(() => {
    const client = axios.create({ baseURL: apiBaseUrl });
    if (token) client.defaults.headers.common.Authorization = `Bearer ${token}`;
    return client;
  }, [apiBaseUrl, token]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, isRecording]);

  useEffect(() => {
    let mounted = true;

    const sdpPayload = (desc) =>
      desc && typeof desc === "object" && "sdp" in desc
        ? { type: desc.type, sdp: desc.sdp }
        : desc;

    const initChat = async () => {
      if (!emergencyId || !token) return;
      try {
        setStatus("connecting");
        await api.post("/api/message/init", { emergencyId });
        const history = await api.get(`/api/message/${emergencyId}`);
        if (mounted) setMessages(history.data?.data || []);

        const s = io(apiBaseUrl, {
          auth: { token: token.startsWith("Bearer ") ? token : `Bearer ${token}` },
          transports: ["websocket"],
        });
        socketRef.current = s;

        s.on("connect", () => {
          s.emit("chat:join", { emergencyId });
          if (mounted) setStatus("ready");
        });

        s.on("chat:new", (msg) => mounted && setMessages((prev) => [...prev, msg]));

        s.on("call:error", (p) => {
          if (!mounted) return;
          setError(p?.message || "Call error");
          cleanupCallRefsOnly({ skipState: false });
          setCallStatus("idle");
          setIsCallOpen(false);
        });

        s.on("call:initiated", (p) => {
          if (!mounted) return;
          const rid = p?.reporterUserId ?? p?.toUserId;
          if (rid != null) {
            reporterUserIdRef.current = Number(rid);
            setReporterUserId(Number(rid));
          }
        });

        s.on("call:peer-joined", async (payload) => {
          if (!mounted || !isInitiatorRef.current || offerSentRef.current) return;

          const { socketId, identity } = payload || {};
          if (!socketId || !identity) return;

          if (identity.senderType !== "user") return;

          const expected = reporterUserIdRef.current;
          if (expected != null && Number(identity.id) !== Number(expected)) return;

          peerSocketIdRef.current = socketId;
          if (mounted) {
            setPeerSocketId(socketId);
            setCallStatus("connecting");
          }

          try {
            const pc = await ensurePeerConnection(s);
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            offerSentRef.current = true;
            s.emit("call:offer", {
              emergencyId: emergencyIdRef.current,
              toSocketId: socketId,
              sdp: sdpPayload(offer),
            });
          } catch {
            if (mounted) setError("Failed to create offer");
          }
        });

        s.on("call:answer", async (payload) => {
          try {
            const pc = pcRef.current;
            if (!pc || !payload?.sdp) return;
            await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
            if (mounted) setCallStatus("in-call");
          } catch {
            if (mounted) setError("Failed to apply answer");
          }
        });

        s.on("call:ice", async (payload) => {
          try {
            const pc = pcRef.current;
            if (!pc || !payload?.candidate) return;
            const cand =
              payload.candidate instanceof RTCIceCandidate
                ? payload.candidate
                : new RTCIceCandidate(payload.candidate);
            await pc.addIceCandidate(cand);
          } catch {
            /* transient ICE */
          }
        });

        const endFromRemote = () => {
          cleanupCallRefsOnly({ skipState: false });
          if (mounted) {
            setCallStatus("ended");
            setTimeout(() => setCallStatus("idle"), 800);
          }
        };

        s.on("call:hangup", endFromRemote);
        s.on("call:peer-left", endFromRemote);
      } catch {
        if (mounted) {
          setStatus("error");
          setError("Connection failed");
        }
      }
    };

    initChat();
    return () => {
      mounted = false;
      cleanupCallRefsOnly({ skipState: true });
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emergencyId, token, apiBaseUrl]);

  const handleSend = () => {
    if (!text.trim() || status !== "ready") return;
    socketRef.current.emit("chat:send", { emergencyId, text: text.trim() });
    setText("");
  };

  const toggleRecording = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      clearInterval(recordTimerRef.current);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        mediaRecorderRef.current = recorder;
        const chunks = [];
        recorder.ondataavailable = (e) => chunks.push(e.data);
        recorder.onstop = async () => {
          const blob = new Blob(chunks, { type: "audio/webm" });
          uploadAudio(blob);
          stream.getTracks().forEach((t) => t.stop());
        };
        recorder.start();
        setIsRecording(true);
        setRecordMs(0);
        recordTimerRef.current = setInterval(() => setRecordMs((prev) => prev + 1000), 1000);
      } catch {
        setError("Microphone access denied");
        setTimeout(() => setError(""), 3000);
      }
    }
  };

  const uploadAudio = async (blob) => {
    setIsUploadingAudio(true);
    const formData = new FormData();
    formData.append("audio", blob);
    formData.append("emergencyId", emergencyId);
    try {
      const res = await api.post("/api/message/audio", formData);
      socketRef.current.emit("chat:send", { emergencyId, audioUrl: res.data.data.audioUrl });
    } catch {
      setError("Audio failed to upload");
    }
    setIsUploadingAudio(false);
  };

  const ensurePeerConnection = async (socket) => {
    if (pcRef.current) return pcRef.current;

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    remoteStreamRef.current = new MediaStream();

    pc.ontrack = (event) => {
      const rs = remoteStreamRef.current;
      if (!rs) return;
      event.streams[0].getTracks().forEach((t) => rs.addTrack(t));
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = rs;
    };

    pc.onicecandidate = (event) => {
      if (!event.candidate) return;
      const s = socket || socketRef.current;
      const target = peerSocketIdRef.current;
      const rid = reporterUserIdRef.current;
      const payload = {
        emergencyId: emergencyIdRef.current,
        candidate: event.candidate.toJSON ? event.candidate.toJSON() : event.candidate,
      };
      if (target) payload.toSocketId = target;
      else if (rid != null)
        payload.toIdentity = { senderType: "user", id: Number(rid) };
      s?.emit("call:ice", payload);
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "connected") setCallStatus("in-call");
    };

    if (!localStreamRef.current) {
      localStreamRef.current = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      if (localVideoRef.current) localVideoRef.current.srcObject = localStreamRef.current;
    }

    localStreamRef.current.getTracks().forEach((track) => pc.addTrack(track, localStreamRef.current));

    pcRef.current = pc;
    return pc;
  };

  /** Full teardown + UI reset */
  const cleanupCall = () => {
    cleanupCallRefsOnly({ skipState: false });
    setCallStatus("ended");
    setTimeout(() => setCallStatus("idle"), 800);
  };

  function cleanupCallRefsOnly({ skipState = false } = {}) {
    isInitiatorRef.current = false;
    offerSentRef.current = false;
    peerSocketIdRef.current = null;
    reporterUserIdRef.current = null;

    try {
      pcRef.current?.getSenders?.().forEach((x) => x.track && x.track.stop());
    } catch {
      /* noop */
    }
    try {
      pcRef.current?.close?.();
    } catch {
      /* noop */
    }
    pcRef.current = null;

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }
    remoteStreamRef.current = null;

    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;

    if (!skipState) {
      setPeerSocketId(null);
      setReporterUserId(null);
      setIsCallOpen(false);
    }
  }

  const startVideoCall = async () => {
    const s = socketRef.current;
    if (!s || status !== "ready") return;

    try {
      setError("");
      setIsCallOpen(true);
      setCallStatus("starting");
      isInitiatorRef.current = true;
      offerSentRef.current = false;
      peerSocketIdRef.current = null;

      s.emit("call:initiate", { emergencyId });
      s.emit("call:join", { emergencyId });

      await ensurePeerConnection(s);

      setCallStatus("ringing");
    } catch {
      setError("Failed to start video call");
      cleanupCallRefsOnly({ skipState: false });
      setCallStatus("idle");
      setIsCallOpen(false);
    }
  };

  const hangup = () => {
    const s = socketRef.current;
    const target = peerSocketIdRef.current;
    const rid = reporterUserIdRef.current;
    const payload = { emergencyId };
    if (target) payload.toSocketId = target;
    else if (rid != null) payload.toIdentity = { senderType: "user", id: Number(rid) };
    s?.emit("call:hangup", payload);
    cleanupCall();
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#E6EBF0] overflow-hidden font-sans relative selection:bg-[#24A1DE]/30">
      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage: `url('https://www.transparenttextures.com/patterns/p4.png')`,
          backgroundSize: "400px",
        }}
      />

      <header className="flex items-center justify-between px-5 py-3 bg-white/80 backdrop-blur-md border-b border-gray-200 z-20 sticky top-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#24A1DE] to-[#3eb5f0] flex items-center justify-center text-white shadow-sm">
              <Shield size={20} />
            </div>
            <div
              className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
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
            disabled={status !== "ready"}
            title="Ring reporter’s app (video)"
            className={`p-2.5 rounded-full transition-all ${
              status !== "ready"
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

      {isCallOpen && (
        <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-4xl bg-[#0b1220] rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <div className="text-white">
                <div className="text-sm font-bold">Video call → reporter</div>
                <div className="text-xs text-white/60">
                  {reporterUserId != null && `Reporter user #${reporterUserId} · `}
                  {callStatus === "ringing" && "Ringing mobile app…"}
                  {callStatus === "connecting" && "Connecting…"}
                  {callStatus === "in-call" && "In call"}
                  {callStatus === "starting" && "Starting…"}
                  {callStatus === "ended" && "Ended"}
                </div>
              </div>
              <button
                type="button"
                onClick={hangup}
                className="px-3 py-2 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition flex items-center gap-2"
              >
                <PhoneOff size={18} />
                Hang up
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3">
              <div className="relative rounded-xl overflow-hidden bg-black">
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-[320px] md:h-[420px] object-cover"
                />
                <div className="absolute bottom-2 left-2 text-xs font-bold text-white/80 bg-black/40 px-2 py-1 rounded-lg">
                  Reporter
                </div>
              </div>

              <div className="relative rounded-xl overflow-hidden bg-black">
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-[320px] md:h-[420px] object-cover"
                />
                <div className="absolute bottom-2 left-2 text-xs font-bold text-white/80 bg-black/40 px-2 py-1 rounded-lg">
                  You
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-6 space-y-4 z-10 scrollbar-hide">
        {messages.map((m, i) => {
          const isMine = m.senderType === "responderTeam";
          return (
            <div
              key={i}
              className={`flex ${
                isMine ? "justify-end" : "justify-start"
              } animate-in fade-in slide-in-from-bottom-1 duration-300`}
            >
              <div
                className={`relative max-w-[85%] min-w-[100px] px-3.5 py-2 shadow-sm ${
                  isMine
                    ? "bg-[#EFFDDE] text-gray-800 rounded-2xl rounded-tr-none"
                    : "bg-white text-gray-800 rounded-2xl rounded-tl-none"
                }`}
              >
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
                    onTogglePlay={() => setPlayingKey(playingKey === i ? null : i)}
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
              <X size={14} className="cursor-pointer" onClick={() => setError("")} /> {error}
            </div>
          </div>
        )}
      </div>

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
                <span className="text-[#24A1DE] text-sm font-medium animate-pulse">Recording</span>
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
                {isRecording ? <Square size={18} fill="currentColor" /> : <Mic size={22} />}
              </button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}

function TelegramAudioPlayer({ url, isMine, isPlaying, onTogglePlay }) {
  const audioRef = useRef(null);
  const onToggleRef = useRef(onTogglePlay);
  onToggleRef.current = onTogglePlay;
  const [progress, setProgress] = useState(0);
  const bars = useMemo(() => Array.from({ length: 28 }, () => Math.random() * 80 + 20), [url]);

  useEffect(() => {
    const audio = new Audio(url);
    audioRef.current = audio;
    const updateProgress = () => {
      if (audio.duration) setProgress((audio.currentTime / audio.duration) * 100);
    };
    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("ended", () => {
      onToggleRef.current?.();
      setProgress(0);
    });

    if (isPlaying) audio.play().catch(() => {});
    else audio.pause();

    return () => {
      audio.removeEventListener("timeupdate", updateProgress);
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
                  ? isMine
                    ? "bg-[#5b913d]"
                    : "bg-[#24A1DE]"
                  : "bg-gray-300/60"
              }`}
              style={{ height: `${height}%` }}
            />
          ))}
        </div>
        <div className="flex justify-between items-center mt-1">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
            Voice Note
          </span>
        </div>
      </div>
    </div>
  );
}
