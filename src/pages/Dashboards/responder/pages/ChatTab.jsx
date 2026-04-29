import React, { useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import {
  Send,
  AlertCircle,
  Wifi,
  WifiOff,
  Shield,
  MessageCircle,
  Loader2,
  Mic,
  Square,
  Play,
  Pause,
  RefreshCw,
  Clock,
  MoreHorizontal
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

  const socketRef = useRef(null);
  const listRef = useRef(null);
  const inputRef = useRef(null);
  const audioPlayersRef = useRef(new Map());
  const mediaRecorderRef = useRef(null);
  const recordTimerRef = useRef(null);

  const api = useMemo(() => {
    const client = axios.create({ baseURL: apiBaseUrl });
    if (token) client.defaults.headers.common.Authorization = `Bearer ${token}`;
    return client;
  }, [apiBaseUrl, token]);

  // --- LOGIC HANDLERS (Integrated) ---

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

        s.on("chat:new", (msg) => mounted && setMessages(prev => [...prev, msg]));
      } catch (e) {
        if (mounted) { setStatus("error"); setError("Connection failed"); }
      }
    };
    initChat();
    return () => { mounted = false; socketRef.current?.disconnect(); };
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
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      const chunks = [];
      recorder.ondataavailable = e => chunks.push(e.data);
      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        uploadAudio(blob);
        stream.getTracks().forEach(t => t.stop());
      };
      recorder.start();
      setIsRecording(true);
      setRecordMs(0);
      recordTimerRef.current = setInterval(() => setRecordMs(prev => prev + 1000), 1000);
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
    } catch (e) { setError("Audio failed to upload"); }
    setIsUploadingAudio(false);
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#f4f7ff] overflow-hidden font-sans">
      {/* HEADER */}
      <header className="flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-md border-b border-indigo-100 shadow-sm z-10">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <Shield size={20} />
            </div>
            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${status === 'ready' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800 leading-tight">Case #ID-{emergencyId}</h2>
            <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest flex items-center gap-1">
              <Clock size={10} /> Live Tactical Feed
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => window.location.reload()} className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400">
            <RefreshCw size={18} />
          </button>
        </div>
      </header>

      {/* MESSAGES */}
      <div 
        ref={listRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-indigo-100"
      >
        {messages.map((m, i) => {
          const isMine = m.senderType === "responderTeam";
          return (
            <div key={i} className={`flex ${isMine ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2`}>
              <div className={`max-w-[75%] flex flex-col ${isMine ? "items-end" : "items-start"}`}>
                <div className={`px-4 py-3 rounded-2xl shadow-sm ${
                  isMine ? "bg-indigo-600 text-white rounded-tr-none" : "bg-white border border-indigo-50 text-slate-800 rounded-tl-none"
                }`}>
                  {m.audioUrl ? (
                    <CompactAudioPlayer 
                      url={`${apiBaseUrl}${m.audioUrl}`} 
                      isMine={isMine} 
                      isPlaying={playingKey === i}
                      onPlay={() => setPlayingKey(playingKey === i ? null : i)}
                    />
                  ) : (
                    <p className="text-sm leading-relaxed">{m.text}</p>
                  )}
                </div>
                <span className="mt-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-tighter px-1">
                  {isMine ? "Unit Alpha" : "Citizen"} • {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* COMPOSER */}
      <footer className="p-4 bg-white border-t border-indigo-50 shadow-[0_-4px_20px_rgba(99,102,241,0.05)]">
        {error && <div className="mb-3 p-2 bg-rose-50 text-rose-600 text-[10px] font-bold rounded-lg flex items-center gap-2"><AlertCircle size={14}/> {error}</div>}
        
        <div className="flex items-end gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-200 focus-within:border-indigo-400 transition-all">
          <button 
            onClick={toggleRecording}
            className={`p-3 rounded-xl transition-all ${isRecording ? "bg-rose-500 text-white animate-pulse" : "bg-white text-slate-500 hover:text-indigo-600 border border-slate-200"}`}
          >
            {isRecording ? <Square size={18} fill="currentColor"/> : <Mic size={18}/>}
          </button>
          
          <textarea
            ref={inputRef}
            rows={1}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={isRecording ? `Recording... ${recordMs/1000}s` : "Type clear instructions..."}
            className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-3 px-2 resize-none"
            disabled={isRecording}
          />

          <button
            onClick={handleSend}
            disabled={!text.trim() || isRecording}
            className="p-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-xl shadow-md transition-all active:scale-95"
          >
            {isUploadingAudio ? <Loader2 size={18} className="animate-spin"/> : <Send size={18}/>}
          </button>
        </div>
      </footer>
    </div>
  );
}

// --- SMALL COMPACT PLAYER ---
function CompactAudioPlayer({ url, isMine, isPlaying, onPlay }) {
  const audioRef = useRef(new Audio(url));
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    const updateProgress = () => setProgress((audio.currentTime / audio.duration) * 100);
    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("ended", () => { onPlay(null); setProgress(0); });
    
    if (isPlaying) audio.play();
    else audio.pause();

    return () => {
      audio.removeEventListener("timeupdate", updateProgress);
      audio.pause();
    };
  }, [isPlaying]);

  return (
    <div className={`flex items-center gap-3 py-1 min-w-[160px] ${isMine ? "text-indigo-100" : "text-slate-500"}`}>
      <button 
        onClick={onPlay}
        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
          isMine ? "bg-white/20 hover:bg-white/30" : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
        }`}
      >
        {isPlaying ? <Pause size={14} fill="currentColor"/> : <Play size={14} fill="currentColor" className="ml-0.5"/>}
      </button>
      
      <div className="flex-1 flex flex-col gap-1">
        <div className="flex justify-between items-center text-[9px] font-bold opacity-70 uppercase tracking-tighter">
          <span>Voice note</span>
          <span>{isPlaying ? "Live" : "0:00"}</span>
        </div>
        <div className={`h-1 rounded-full relative overflow-hidden ${isMine ? "bg-white/20" : "bg-slate-100"}`}>
          <div 
            className={`h-full absolute left-0 top-0 transition-all duration-300 ${isMine ? "bg-white" : "bg-indigo-500"}`} 
            style={{ width: `${progress}%` }} 
          />
        </div>
      </div>
    </div>
  );
}