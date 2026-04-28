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
  Lock,
  MessageSquareQuote,
} from "lucide-react";
import { io } from "socket.io-client";
import axios from "axios";

const API_BASE = "http://localhost:5000";

const ChatTab = ({ emergencyId }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorStatus, setErrorStatus] = useState(null);
  const [isPeerTyping, setIsPeerTyping] = useState(false);
  const [citizenId, setCitizenId] = useState(null);

  const socketRef = useRef();
  const scrollRef = useRef();
  const typingTimeoutRef = useRef();

  // --- 1. Identity & Token Management ---
  const { token, user } = useMemo(() => {
    let rawToken = localStorage.getItem("token");
    const rawUser = localStorage.getItem("user");

    if (rawToken?.startsWith("Bearer ")) {
      rawToken = rawToken.slice(7);
    }

    return {
      token: rawToken && rawToken !== "undefined" ? rawToken : null,
      user: rawUser ? JSON.parse(rawUser) : null,
    };
  }, []);

  const scrollToBottom = useCallback(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isPeerTyping, scrollToBottom]);

  // --- 2. Fetch History & Emergency Details ---
  useEffect(() => {
    const initChatData = async () => {
      if (!emergencyId || !token) return;
      try {
        setIsLoading(true);
        // Fetching history and extracting citizenId from the response
        const res = await axios.get(`${API_BASE}/api/message/${emergencyId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setMessages(res.data?.data || []);

        // Ensure we know who the reporter is for logic checks
        if (res.data?.emergency) {
          setCitizenId(res.data.emergency.citizenId);
        }
      } catch (err) {
        console.error("Initialization Error:", err);
        setErrorStatus(err.response?.status === 401 ? "auth" : "server");
      } finally {
        setIsLoading(false);
      }
    };
    initChatData();
  }, [emergencyId, token]);

  // --- 3. Socket Engine (Responder Context) ---
  useEffect(() => {
    if (!token || !emergencyId) return;

    // Clear any previous error on retry
    setErrorStatus(null);

    socketRef.current = io(API_BASE, {
      auth: { token },
      transports: ["polling", "websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
    });

    const socket = socketRef.current;

    socket.on("connect", () => {
      console.log("Responder Link Established:", socket.id);
      socket.emit("join_emergency", emergencyId);
    });

    socket.on("receive_message", (msg) => {
      setMessages((prev) => {
        const exists = prev.find((m) => m.id === msg.id);
        return exists ? prev : [...prev, msg];
      });
    });

    socket.on("typing_indicator", (data) => {
      // Only show typing if it's NOT the current logged-in user
      if (Number(data.senderId) !== Number(user?.id)) {
        setIsPeerTyping(true);
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(
          () => setIsPeerTyping(false),
          3000,
        );
      }
    });

    socket.on("connect_error", (err) => {
      console.error("Connection Error:", err.message);
      // "User not found" often triggers here if the JWT is stale/invalid
      if (err.message.includes("User not found")) {
        setErrorStatus("auth");
      }
    });

    return () => {
      if (socket) socket.disconnect();
    };
  }, [token, emergencyId, user?.id]);

  // --- 4. Transmitters ---
  const handleSend = () => {
    if (!input.trim() || !socketRef.current) return;

    const payload = {
      emergencyId,
      text: input.trim(),
    };

    socketRef.current.emit("send_message", payload);
    setInput("");
  };

  const onInputChange = (e) => {
    setInput(e.target.value);
    if (socketRef.current) {
      socketRef.current.emit("typing", emergencyId);
    }
  };

  if (isLoading) return <LoadingScreen />;
  if (errorStatus === "auth") return <ErrorScreen type="auth" />;
  if (errorStatus === "server") return <ErrorScreen type="server" />;

  return (
    <div className="flex flex-col h-full bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="px-6 py-4 bg-slate-950 text-white flex justify-between items-center border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping absolute" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 relative" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-mono tracking-widest text-emerald-500 uppercase">
              Responder Dispatch Link
            </span>
            <span className="text-xs font-bold opacity-70">
              CASE_ID: {emergencyId}
            </span>
          </div>
        </div>
        <Lock size={14} className="text-slate-500" />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full opacity-20 grayscale">
            <MessageSquareQuote size={48} />
            <p className="text-xs mt-4 font-bold">
              AWAITING CONNECTION TO CITIZEN
            </p>
          </div>
        )}
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            msg={msg}
            isMe={Number(msg.senderId) === Number(user?.id)}
          />
        ))}
        {isPeerTyping && (
          <div className="flex justify-start animate-pulse">
            <div className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-2xl rounded-bl-none text-[11px] font-medium">
              Citizen is typing...
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input Area */}
      <div className="p-5 bg-white border-t border-slate-100">
        <div className="flex items-center gap-3 bg-slate-100 p-2 rounded-2xl border border-slate-200 focus-within:ring-2 focus-within:ring-slate-900 focus-within:bg-white transition-all">
          <input
            value={input}
            onChange={onInputChange}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type status update to citizen..."
            className="flex-1 bg-transparent px-2 text-sm outline-none text-slate-800 font-medium"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="bg-slate-900 text-white p-3 rounded-xl hover:bg-black transition-all shadow-lg disabled:opacity-30"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

const MessageBubble = ({ msg, isMe }) => (
  <div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
    <div
      className={`max-w-[85%] px-4 py-3 rounded-2xl shadow-sm ${
        isMe
          ? "bg-slate-900 text-white rounded-br-none"
          : "bg-white border border-slate-200 text-slate-900 rounded-bl-none"
      }`}
    >
      <p className="text-[13px] leading-relaxed font-medium">
        {msg.text || msg.message}
      </p>
      <div
        className={`text-[9px] mt-2 font-mono opacity-40 font-bold uppercase ${isMe ? "text-right" : "text-left"}`}
      >
        {new Date(msg.createdAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </div>
    </div>
  </div>
);

const LoadingScreen = () => (
  <div className="flex flex-col items-center justify-center h-full bg-slate-50 rounded-3xl p-10">
    <RefreshCcw className="animate-spin text-slate-900 mb-6" size={40} />
    <span className="text-[10px] font-mono text-slate-400 tracking-[0.4em] uppercase">
      Encrypting Link...
    </span>
  </div>
);

const ErrorScreen = ({ type }) => (
  <div className="flex flex-col items-center justify-center h-full bg-white rounded-3xl border-2 border-dashed border-slate-200 p-12 text-center">
    <ShieldAlert
      size={50}
      className={type === "auth" ? "text-amber-500" : "text-red-500"}
    />
    <h2 className="mt-4 font-mono text-sm font-bold tracking-tighter uppercase">
      {type === "auth" ? "Session Expired" : "Link Interrupted"}
    </h2>
    <p className="text-[10px] mt-2 opacity-50 uppercase tracking-widest">
      {type === "auth"
        ? "Please relogin to your responder dashboard"
        : "Check server status"}
    </p>
  </div>
);

export default ChatTab;
