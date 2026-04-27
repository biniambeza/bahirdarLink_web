import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import {
  Send,
  ShieldAlert,
  RefreshCcw,
  Mic,
  FileAudio,
  Lock,
} from "lucide-react";
import { io } from "socket.io-client";
import axios from "axios";

const API_BASE = "http://localhost:5000";

const ChatTab = ({ emergencyId }) => {
  // --- State Management ---
  const [messages, setMessages] = useState([]);
  const [chatId, setChatId] = useState(null);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [errorStatus, setErrorStatus] = useState(null);
  const [isPeerTyping, setIsPeerTyping] = useState(false);

  // --- Refs ---
  const socketRef = useRef();
  const scrollRef = useRef();
  const fileInputRef = useRef();
  const typingTimeoutRef = useRef();

  // --- 1. Auth Context Extraction ---
  const { token, user } = useMemo(() => {
    let rawToken = localStorage.getItem("token");
    const rawUser = localStorage.getItem("user");

    // Strip "Bearer " for Socket Handshake compatibility
    if (rawToken?.startsWith("Bearer ")) {
      rawToken = rawToken.slice(7);
    }

    return {
      token: rawToken && rawToken !== "undefined" ? rawToken : null,
      user: rawUser ? JSON.parse(rawUser) : null,
    };
  }, []);

  // --- 2. Auto-Scroll Logic ---
  const scrollToBottom = useCallback(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isPeerTyping, scrollToBottom]);

  // --- 3. Chat Session Initialization ---
  useEffect(() => {
    const initChat = async () => {
      if (!emergencyId || !token) return;

      try {
        setIsLoading(true);
        // GET or CREATE chat for this emergency
        const chatRes = await axios.get(
          `${API_BASE}/api/chats/emergency/${emergencyId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        const activeChatId = chatRes.data.data.id;
        setChatId(activeChatId);

        // Fetch existing message history
        const msgRes = await axios.get(
          `${API_BASE}/api/messages/chat/${activeChatId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setMessages(msgRes.data?.data || []);
      } catch (err) {
        console.error("Chat Init Error:", err);
        setErrorStatus(err.response?.status === 401 ? "auth" : "server");
      } finally {
        setIsLoading(false);
      }
    };

    initChat();
  }, [emergencyId, token]);

  // --- 4. Socket.io Real-time Engine ---
  useEffect(() => {
    if (!token || !chatId) return;

    socketRef.current = io(API_BASE, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnection: true,
    });

    const socket = socketRef.current;

    socket.on("connect", () => {
      console.log("📡 Connected to Emergency Mesh:", socket.id);
      socket.emit("joinChat", chatId);
    });

    socket.on("newMessage", (msg) => {
      setMessages((prev) => {
        const exists = prev.find((m) => m.id === msg.id);
        return exists ? prev : [...prev, msg];
      });
    });

    socket.on("userTyping", (data) => {
      // Logic: Only show typing for the OTHER person
      if (Number(data.userId) !== Number(user?.id)) {
        setIsPeerTyping(data.isTyping);
      }
    });

    return () => socket.disconnect();
  }, [token, chatId, user?.id]);

  // --- 5. Message Transmitters ---
  const handleSend = () => {
    if (!input.trim() || !chatId) return;

    const payload = {
      chatId,
      emergencyId, // Essential for DB NOT NULL constraint
      message: input.trim(),
      senderId: user?.id,
      senderRole: user?.role,
      type: "text",
    };

    socketRef.current.emit("sendMessage", payload);
    socketRef.current.emit("typing", { chatId, isTyping: false });
    setInput("");
  };

  const handleAudioUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !chatId) return;

    const formData = new FormData();
    formData.append("attachment", file);
    formData.append("chatId", chatId);
    formData.append("type", "audio");

    try {
      setIsUploading(true);
      const res = await axios.post(`${API_BASE}/api/messages`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      // Once uploaded, broadcast to the room via socket
      socketRef.current.emit("sendMessage", res.data.data);
    } catch (err) {
      alert("Encryption/Upload failure. Retry transmission.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // --- 6. Typing Feedback Logic ---
  const onInputChange = (e) => {
    setInput(e.target.value);

    if (socketRef.current) {
      socketRef.current.emit("typing", { chatId, isTyping: true });

      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socketRef.current.emit("typing", { chatId, isTyping: false });
      }, 2000);
    }
  };

  // --- Render States ---
  if (isLoading) return <LoadingScreen />;
  if (errorStatus === "auth") return <ErrorScreen type="auth" />;
  if (errorStatus === "server") return <ErrorScreen type="server" />;

  return (
    <div className="flex flex-col h-full bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-2xl">
      {/* Mesh Header */}
      <div className="px-6 py-4 bg-slate-950 text-white flex justify-between items-center border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping absolute" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 relative" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-mono tracking-widest text-emerald-500 uppercase">
              Secure Link
            </span>
            <span className="text-xs font-bold opacity-70">
              INCIDENT_ID: {emergencyId}
            </span>
          </div>
        </div>
        <Lock size={14} className="text-slate-500" />
      </div>

      {/* Messaging Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            msg={msg}
            isMe={Number(msg.senderId) === Number(user?.id)}
          />
        ))}
        {isPeerTyping && (
          <div className="flex justify-start animate-in fade-in slide-in-from-left-2">
            <div className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-2xl rounded-bl-none text-[11px] font-medium shadow-sm">
              Responder is typing updates...
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input Surface */}
      <div className="p-5 bg-white border-t border-slate-100">
        <div className="flex items-center gap-3 bg-slate-100 p-2 rounded-2xl border border-slate-200 focus-within:ring-2 focus-within:ring-slate-900 focus-within:bg-white transition-all">
          <input
            type="file"
            accept="audio/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleAudioUpload}
          />
          <button
            disabled={isUploading}
            onClick={() => fileInputRef.current.click()}
            className="p-3 text-slate-500 hover:text-slate-900 hover:bg-white rounded-xl transition-all"
          >
            {isUploading ? (
              <RefreshCcw size={20} className="animate-spin" />
            ) : (
              <Mic size={20} />
            )}
          </button>

          <input
            value={input}
            onChange={onInputChange}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type status report..."
            className="flex-1 bg-transparent px-2 text-sm outline-none text-slate-800 placeholder:text-slate-400 font-medium"
          />

          <button
            onClick={handleSend}
            disabled={!input.trim() || isUploading}
            className="bg-slate-900 text-white p-3 rounded-xl hover:bg-black transition-all shadow-lg disabled:opacity-30"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Sub-Components ---

const MessageBubble = ({ msg, isMe }) => {
  // Normalize Audio URL for Windows/Linux server paths
  const audioUrl = msg.attachmentUrl
    ? msg.attachmentUrl.startsWith("http")
      ? msg.attachmentUrl
      : `${API_BASE}/${msg.attachmentUrl.replace(/\\/g, "/")}`
    : null;

  return (
    <div className={`flex ${isMe ? "justify-end" : "justify-start"} group`}>
      <div
        className={`max-w-[85%] px-4 py-3 rounded-2xl shadow-sm relative transition-all ${
          isMe
            ? "bg-slate-900 text-white rounded-br-none"
            : "bg-white border border-slate-200 text-slate-900 rounded-bl-none"
        }`}
      >
        {msg.type === "audio" ? (
          <div className="flex flex-col gap-3 min-w-[200px]">
            <div className="flex items-center gap-2 opacity-70">
              <FileAudio size={16} />
              <span className="text-[10px] font-mono font-bold tracking-tighter">
                VOICE_TRANSMISSION
              </span>
            </div>
            <audio controls className="h-10 w-full filter grayscale invert">
              <source src={audioUrl} type="audio/mpeg" />
            </audio>
          </div>
        ) : (
          <p className="text-[13px] leading-relaxed font-medium">
            {msg.message}
          </p>
        )}

        <div
          className={`text-[9px] mt-2 font-mono opacity-40 font-bold uppercase ${isMe ? "text-right" : "text-left"}`}
        >
          {new Date(msg.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
          {isMe && " // SENT"}
        </div>
      </div>
    </div>
  );
};

const LoadingScreen = () => (
  <div className="flex flex-col items-center justify-center h-full bg-slate-50 rounded-3xl border border-slate-200 p-10">
    <RefreshCcw
      className="animate-spin text-slate-900 mb-6"
      size={40}
      strokeWidth={1}
    />
    <span className="text-[10px] font-mono text-slate-400 tracking-[0.4em] uppercase">
      Encrypting Channel...
    </span>
  </div>
);

const ErrorScreen = ({ type }) => (
  <div className="flex flex-col items-center justify-center h-full bg-white rounded-3xl border-2 border-dashed border-slate-200 p-12 text-center">
    <ShieldAlert
      size={50}
      className={type === "auth" ? "text-amber-500" : "text-red-500"}
      strokeWidth={1.5}
    />
    <h2 className="mt-4 font-mono text-sm font-bold tracking-tighter uppercase">
      {type === "auth" ? "Authorization Failed" : "System Link Down"}
    </h2>
    <p className="mt-2 text-xs text-slate-400 leading-relaxed max-w-[220px]">
      {type === "auth"
        ? "Your credentials have expired. Please re-sign into the mesh."
        : "The remote server rejected the connection. Verification required."}
    </p>
  </div>
);

export default ChatTab;
