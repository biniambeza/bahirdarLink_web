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
  PhoneOff
} from "lucide-react";

export default function ChatTab({ emergencyId, token, apiBaseUrl = "http://localhost:5000" }) {
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordMs, setRecordMs] = useState(0);
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);
  const [playingKey, setPlayingKey] = useState(null);

  // --- Video call state ---
  const [isCallOpen, setIsCallOpen] = useState(false);
  const [callStatus, setCallStatus] = useState("idle"); // idle | starting | ringing | connecting | in-call | ended
  const [peerSocketId, setPeerSocketId] = useState(null);

  const socketRef = useRef(null);
  const listRef = useRef(null);
  const inputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordTimerRef = useRef(null);

  // --- WebRTC refs ---
  const pcRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const isInitiatorRef = useRef(false);

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

    const initChat = async () => {
      if (!emergencyId || !token) return;
      try {
        setStatus("connecting");
        await api.post("/api/message/init", { emergencyId });
        const history = await api.get(`/api/message/${emergencyId}`);
        if (mounted) setMessages(history.data?.data || []);

        const s = io(apiBaseUrl, { auth: { token: `Bearer ${token}` }, transports: ["websocket"] });
        socketRef.current = s;

        s.on("connect", () => {
          s.emit("chat:join", { emergencyId });
          if (mounted) setStatus("ready");
        });

        s.on("chat:new", (msg) => mounted && setMessages((prev) => [...prev, msg]));

        // --- WebRTC signaling listeners ---
        s.on("call:peer-joined", async ({ socketId }) => {
          // If responder initiated a call, and the user joins later, send offer directly to them.
          setPeerSocketId(socketId);
          if (isInitiatorRef.current && pcRef.current && callStatus !== "in-call") {
            try {
              setCallStatus("connecting");
              const offer = await pcRef.current.createOffer();
              await pcRef.current.setLocalDescription(offer);
              s.emit("call:offer", { emergencyId, toSocketId: socketId, sdp: offer });
            } catch (e) {
              setError("Failed to create offer");
            }
          }
        });

        s.on("call:offer", async ({ fromSocketId, sdp }) => {
          try {
            setPeerSocketId(fromSocketId);
            setIsCallOpen(true);
            setCallStatus("connecting");

            await ensurePeerConnection();
            await pcRef.current.setRemoteDescription(sdp);

            const answer = await pcRef.current.createAnswer();
            await pcRef.current.setLocalDescription(answer);

            s.emit("call:answer", { emergencyId, toSocketId: fromSocketId, sdp: answer });
          } catch (e) {
            setError("Failed to answer call");
          }
        });

        s.on("call:answer", async ({ sdp }) => {
          try {
            if (!pcRef.current) return;
            await pcRef.current.setRemoteDescription(sdp);
            setCallStatus("in-call");
          } catch (e) {
            setError("Failed to set remote answer");
          }
        });

        s.on("call:ice", async ({ candidate }) => {
          try {
            if (!pcRef.current) return;
            await pcRef.current.addIceCandidate(candidate);
          } catch (e) {
            // ignore some transient ICE errors
          }
        });

        const endFromRemote = () => {
          cleanupCall();
          setCallStatus("ended");
          setTimeout(() => setCallStatus("idle"), 800);
        };

        s.on("call:hangup", endFromRemote);
        s.on("call:peer-left", endFromRemote);
      } catch (e) {
        if (mounted) {
          setStatus("error");
          setError("Connection failed");
        }
      }
    };

    initChat();
    return () => {
      mounted = false;
      cleanupCall();
      socketRef.current?.disconnect();
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
      } catch (err) {
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
    } catch (e) {
      setError("Audio failed to upload");
    }
    setIsUploadingAudio(false);
  };

  // -----------------------------
  // Video Call helpers
  // -----------------------------
  const ensurePeerConnection = async () => {
    if (pcRef.current) return pcRef.current;

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
    });

    remoteStreamRef.current = new MediaStream();

    pc.ontrack = (event) => {
      event.streams[0].getTracks().forEach((t) => remoteStreamRef.current.addTrack(t));
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStreamRef.current;
    };

    pc.onicecandidate = (event) => {
      if (!event.candidate) return;
      socketRef.current?.emit("call:ice", {
        emergencyId,
        toSocketId: peerSocketId || undefined,
        candidate: event.candidate
      });
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "connected") setCallStatus("in-call");
      if (pc.connectionState === "failed" || pc.connectionState === "disconnected") {
        // let user hang up or auto-clean
      }
    };

    // Get local media once per call
    if (!localStreamRef.current) {
      localStreamRef.current = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (localVideoRef.current) localVideoRef.current.srcObject = localStreamRef.current;
    }

    localStreamRef.current.getTracks().forEach((track) => pc.addTrack(track, localStreamRef.current));

    pcRef.current = pc;
    return pc;
  };

  const startVideoCall = async () => {
    if (!socketRef.current || status !== "ready") return;

    try {
      setIsCallOpen(true);
      setCallStatus("starting");
      isInitiatorRef.current = true;

      // Join call room on backend
      socketRef.current.emit("call:join", { emergencyId });

      await ensurePeerConnection();

      // If peer already known, offer immediately; else wait for call:peer-joined
      setCallStatus(peerSocketId ? "connecting" : "ringing");

      if (peerSocketId) {
        const offer = await pcRef.current.createOffer();
        await pcRef.current.setLocalDescription(offer);
        socketRef.current.emit("call:offer", { emergencyId, toSocketId: peerSocketId, sdp: offer });
      }
    } catch (e) {
      setError("Failed to start video call");
      setIsCallOpen(false);
      setCallStatus("idle");
      cleanupCall();
    }
  };

  const hangup = () => {
    socketRef.current?.emit("call:hangup", { emergencyId, toSocketId: peerSocketId || undefined });
    cleanupCall();
    setCallStatus("ended");
    setTimeout(() => setCallStatus("idle"), 800);
  };

  const cleanupCall = () => {
    isInitiatorRef.current = false;

    try {
      pcRef.current?.getSenders?.().forEach((s) => s.track && s.track.stop());
    } catch {}
    try {
      pcRef.current?.close?.();
    } catch {}

    pcRef.current = null;

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }
    remoteStreamRef.current = null;

    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;

    setPeerSocketId(null);
    setIsCallOpen(false);
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#E6EBF0] overflow-hidden font-sans relative selection:bg-[#24A1DE]/30">
      {/* BACKGROUND PATTERN */}
      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage: `url('https://www.transparenttextures.com/patterns/p4.png')`,
          backgroundSize: "400px"
        }}
      />

      {/* PRO HEADER */}
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
            <h2 className="text-[15px] font-bold text-gray-800 leading-tight">Case Feed #{emergencyId}</h2>
            <span className="text-[11px] font-semibold text-[#24A1DE] uppercase tracking-wider">
              Tactical Network
            </span>
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={startVideoCall}
            disabled={status !== "ready"}
            title="Start video call"
            className={`p-2.5 rounded-full transition-all ${
              status !== "ready"
                ? "text-gray-300 cursor-not-allowed"
                : "text-gray-500 hover:bg-gray-100 hover:text-[#24A1DE]"
            }`}
          >
            <Video size={18} />
          </button>

          <button
            onClick={() => window.location.reload()}
            className="p-2.5 hover:bg-gray-100 rounded-full text-gray-400 transition-all active:rotate-180 duration-500"
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </header>

      {/* CALL MODAL */}
      {isCallOpen && (
        <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-4xl bg-[#0b1220] rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <div className="text-white">
                <div className="text-sm font-bold">Video Call</div>
                <div className="text-xs text-white/60">
                  {callStatus === "ringing" && "Calling user…"}
                  {callStatus === "connecting" && "Connecting…"}
                  {callStatus === "in-call" && "In call"}
                  {callStatus === "starting" && "Starting…"}
                  {callStatus === "ended" && "Ended"}
                </div>
              </div>
              <button
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
                  User
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

      {/* MESSAGES LIST */}
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
                  isMine ? "bg-[#EFFDDE] text-gray-800 rounded-2xl rounded-tr-none" : "bg-white text-gray-800 rounded-2xl rounded-tl-none"
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
                    onPlay={() => setPlayingKey(playingKey === i ? null : i)}
                  />
                ) : (
                  <p className="text-[14.5px] leading-relaxed break-words">{m.text}</p>
                )}

                <div className="flex items-center justify-end gap-1.5 mt-1 opacity-60">
                  <span className="text-[10px] font-medium">
                    {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
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

      {/* PRO INPUT FOOTER */}
      <footer className="p-3 bg-white/95 backdrop-blur-sm border-t border-gray-100 z-20">
        <div className="max-w-4xl mx-auto flex items-center gap-2">
          <button className="p-2 text-gray-400 hover:text-[#24A1DE] transition-colors rounded-full hover:bg-gray-50">
            <Paperclip size={22} />
          </button>

          <div className="flex-1 bg-[#F1F3F4] rounded-[22px] transition-all focus-within:bg-white focus-within:ring-1 focus-within:ring-gray-200 flex items-center px-4 py-1.5 min-h-[44px]">
            {isRecording ? (
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                  <span className="text-[15px] font-mono font-bold text-gray-700">
                    {Math.floor(recordMs / 60000)}:{(Math.floor(recordMs / 1000) % 60).toString().padStart(2, "0")}
                  </span>
                </div>
                <span className="text-[#24A1DE] text-sm font-medium animate-pulse">Slide to cancel</span>
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
                onClick={handleSend}
                className="w-11 h-11 bg-[#24A1DE] text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-[#24A1DE]/40 transition-all active:scale-90"
              >
                {isUploadingAudio ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} className="ml-0.5" />}
              </button>
            ) : (
              <button
                onClick={toggleRecording}
                className={`w-11 h-11 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-90 ${
                  isRecording ? "bg-red-500 text-white animate-pulse" : "bg-[#24A1DE] text-white hover:bg-[#1e8ec4]"
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

function TelegramAudioPlayer({ url, isMine, isPlaying, onPlay }) {
  const audioRef = useRef(new Audio(url));
  const [progress, setProgress] = useState(0);
  const bars = useMemo(() => Array.from({ length: 28 }, () => Math.random() * 80 + 20), []);

  useEffect(() => {
    const audio = audioRef.current;
    const updateProgress = () => setProgress((audio.currentTime / audio.duration) * 100);
    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("ended", () => {
      onPlay(null);
      setProgress(0);
    });

    if (isPlaying) audio.play();
    else audio.pause();

    return () => {
      audio.removeEventListener("timeupdate", updateProgress);
      audio.pause();
    };
  }, [isPlaying]);

  return (
    <div className="flex items-center gap-3 py-1.5 min-w-[220px]">
      <button
        onClick={onPlay}
        className={`w-11 h-11 rounded-full flex items-center justify-center transition-all shadow-sm ${
          isMine ? "bg-[#86C166] text-white" : "bg-[#24A1DE] text-white"
        }`}
      >
        {isPlaying ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" className="ml-1" />}
      </button>

      <div className="flex-1 flex flex-col justify-center">
        <div className="h-6 flex items-center gap-[2.5px]">
          {bars.map((height, i) => (
            <div
              key={i}
              className={`w-[2.5px] rounded-full transition-colors duration-300 ${
                (i / bars.length) * 100 < progress ? (isMine ? "bg-[#5b913d]" : "bg-[#24A1DE]") : "bg-gray-300/60"
              }`}
              style={{ height: `${height}%` }}
            />
          ))}
        </div>
        <div className="flex justify-between items-center mt-1">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Voice Note</span>
          <span className="text-[10px] font-mono text-gray-500">0:32</span>
        </div>
      </div>
    </div>
  );
}