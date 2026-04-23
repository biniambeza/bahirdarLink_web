import React, { useState, useRef, useEffect } from "react";
import { Send, Mic, User, ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";

const ChatTab = ({ emergencyId }) => {
  const [messages, setMessages] = useState([
    { id: 1, text: "Dispatcher: High priority assigned. Please confirm arrival.", sender: "system", time: "10:02" },
    { id: 2, text: "Responder: En route. ETA 5 minutes.", sender: "me", time: "10:04" },
  ]);
  const [input, setInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const scrollRef = useRef();

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([
      ...messages,
      { id: Date.now(), text: input, sender: "me", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    ]);
    setInput("");
  };

  return (
    <div className="flex flex-col h-full bg-[#f8fafc]">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex items-end gap-2 ${msg.sender === "me" ? "flex-row-reverse" : "flex-row"}`}>
            {/* Avatar Placeholder */}
            <div className={`w-7 h-7 rounded-full flex items-center justify-center border ${
              msg.sender === "me" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
            }`}>
              {msg.sender === "me" ? <User size={14} className="text-white" /> : <ShieldAlert size={14} className="text-blue-600" />}
            </div>

            <div className={`group relative max-w-[75%] px-4 py-3 rounded-2xl shadow-sm transition-all ${
              msg.sender === "me" 
                ? "bg-slate-900 text-white rounded-br-none" 
                : "bg-white text-slate-800 border border-slate-200 rounded-bl-none"
            }`}>
              <p className="text-sm font-medium leading-relaxed tracking-tight">{msg.text}</p>
              <div className={`mt-1 flex items-center gap-2 ${msg.sender === "me" ? "justify-end" : "justify-start"}`}>
                <span className={`text-[9px] font-black uppercase tracking-tighter opacity-40`}>
                  {msg.time}
                </span>
              </div>
            </div>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-100 shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.05)]">
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl p-1.5 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-50/50 transition-all">
          
          {/* Audio/Mic Button */}
          <button 
            onClick={() => setIsRecording(!isRecording)}
            className={`p-2.5 rounded-xl transition-all ${
              isRecording ? "bg-red-50 text-red-500 animate-pulse" : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Mic size={20} fill={isRecording ? "currentColor" : "none"} />
          </button>

          {/* Text Input */}
          <input 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder={isRecording ? "Recording audio..." : "Type tactical update..."} 
            className="flex-1 bg-transparent border-none px-2 py-2 text-sm font-medium text-slate-700 placeholder:text-slate-400 outline-none" 
          />

          {/* Send Button */}
          <button 
            onClick={handleSend} 
            disabled={!input.trim()}
            className="p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 active:scale-95 disabled:opacity-30 disabled:grayscale transition-all shadow-md shadow-blue-200"
          >
            <Send size={18} />
          </button>
        </div>
        <p className="text-center text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] mt-3">
          Encrypted Communication Channel
        </p>
      </div>
    </div>
  );
};

export default ChatTab;