import React, { useEffect, useRef, useState } from 'react';
import { Bot, ChevronRight, Info, Maximize2, Minimize2, Send, Sparkles, X, Stethoscope, Apple, AlertTriangle } from 'lucide-react';
import { askAIChatbotApi } from '../services/api';

export default function AIChatbotWidget({ currentPatient, initialPrompt, onClearInitialPrompt }) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'bot',
      text: 'Xin chào! Tôi là Sahara AI Copilot. Tôi có thể giúp bạn giải thích ý nghĩa các chỉ số xét nghiệm, đánh giá mức độ bất thường và gợi ý câu hỏi để bạn trao đổi với Bác sĩ.'
    }
  ]);
  const endRef = useRef(null);

  const send = async (text = input) => {
    if (!text || !text.trim()) return;
    const q = text.trim();
    
    // Thêm câu hỏi của user vào danh sách
    setMessages(prev => [...prev, { id: Date.now(), role: 'user', text: q }]);
    setInput('');
    setTyping(true);

    try {
      // Gọi API Chatbot với ngữ cảnh hồ sơ bệnh nhân
      const replyText = await askAIChatbotApi(q, currentPatient);
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'bot', text: replyText }]);
    } catch (error) {
      setMessages(prev => [
        ...prev,
        { 
          id: Date.now() + 1, 
          role: 'bot', 
          text: 'Xin lỗi, hiện tại trợ lý AI đang quá tải. Bạn vui lòng thử lại sau ít phút hoặc trao đổi trực tiếp với bác sĩ.' 
        }
      ]);
    } finally {
      setTyping(false);
    }
  };

  useEffect(() => {
    if (initialPrompt) {
      setOpen(true);
      send(initialPrompt);
      onClearInitialPrompt?.();
    }
  }, [initialPrompt]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const suggestions = [
    { label: 'Giải thích chỉ số bất thường', icon: AlertTriangle },
    { label: 'Tôi nên khám chuyên khoa nào?', icon: Stethoscope },
    { label: 'Gợi ý chế độ ăn & lối sống', icon: Apple }
  ];

  return (
    <div id="ai-copilot" className={`fixed z-50 ${open ? 'inset-x-3 bottom-3 sm:left-auto sm:right-5 sm:w-[410px]' : 'bottom-5 right-5'}`}>
      
      {/* Expanded / Open Chat Window */}
      <div 
        className={`${open ? 'flex' : 'hidden'} ${expanded ? 'sm:w-[580px]' : ''} h-[min(690px,calc(100vh-28px))] flex-col overflow-hidden rounded-3xl border border-cyan-300/30 bg-slate-950/95 shadow-2xl shadow-cyan-950/60 backdrop-blur-2xl transition-all duration-200`}
      >
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 bg-white/[.04] px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-cyan-400 via-teal-400 to-emerald-400 text-slate-950 shadow-neon">
              <Bot size={18} />
            </span>
            <div>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                Sahara AI Copilot
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-400/20 text-cyan-300 font-mono">v2.0 LIS</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Đồng bộ hồ sơ: {currentPatient?.fullName || 'Bệnh nhân'}
              </div>
            </div>
          </div>

          <div className="flex gap-1">
            <button 
              onClick={() => setExpanded(!expanded)} 
              className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
              title={expanded ? 'Thu nhỏ cửa sổ' : 'Phóng to cửa sổ'}
            >
              {expanded ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
            </button>
            <button 
              onClick={() => setOpen(false)} 
              className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
              title="Đóng chat"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 space-y-3.5 overflow-y-auto p-4 text-xs">
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div 
                className={`max-w-[88%] rounded-2xl px-4 py-3 leading-relaxed whitespace-pre-wrap ${
                  m.role === 'user'
                    ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-medium shadow-md'
                    : 'border border-white/10 bg-white/[.05] text-slate-200'
                }`}
              >
                {m.role === 'bot' && (
                  <div className="mb-1.5 flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-cyan-300">
                    <Sparkles size={11} /> Sahara Clinical AI Insight
                  </div>
                )}
                {m.text}
              </div>
            </div>
          ))}

          {/* Quick Suggestions on First Message */}
          {messages.length === 1 && (
            <div className="space-y-2 pt-2">
              <div className="text-[11px] text-slate-400 font-medium">Gợi ý câu hỏi nhanh:</div>
              <div className="flex flex-col gap-1.5">
                {suggestions.map((s, idx) => {
                  const Icon = s.icon;
                  return (
                    <button 
                      key={idx} 
                      onClick={() => send(s.label)} 
                      className="flex items-center justify-between rounded-xl border border-cyan-400/20 bg-cyan-400/5 px-3 py-2 text-left text-[11px] font-semibold text-cyan-200 hover:bg-cyan-400/15 transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <Icon size={13} className="text-cyan-300" />
                        {s.label}
                      </span>
                      <ChevronRight size={13} />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Typing Indicator */}
          {typing && (
            <div className="flex items-center gap-1.5 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-cyan-300 w-fit">
              <span className="text-[11px] text-slate-400 mr-1">Sahara AI đang phân tích dữ liệu</span>
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-cyan-300" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-300 [animation-delay:150ms]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-cyan-300 [animation-delay:300ms]" />
            </div>
          )}

          <div ref={endRef} />
        </div>

        {/* Input Footer */}
        <div className="border-t border-white/10 p-3 bg-white/[.02]">
          <div className="mb-2 flex items-start gap-1.5 text-[10px] leading-4 text-slate-400">
            <Info size={13} className="mt-0.5 shrink-0 text-amber-300" />
            <span>AI hỗ trợ diễn giải thông số cận lâm sàng, không thay thế chẩn đoán của Bác sĩ.</span>
          </div>

          <form 
            onSubmit={(e) => { e.preventDefault(); send(); }} 
            className="flex gap-2"
          >
            <input 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              placeholder={`Hỏi AI về hồ sơ của ${currentPatient?.fullName || 'bệnh nhân'}...`} 
              className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/30 px-3.5 py-2.5 text-xs text-white outline-none placeholder:text-slate-500 focus:border-cyan-400/60" 
            />
            <button 
              type="submit"
              disabled={!input.trim()}
              className="neon-button grid h-10 w-10 shrink-0 place-items-center rounded-xl disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send size={15} />
            </button>
          </form>
        </div>

      </div>

      {/* Floating Toggle Button */}
      {!open && (
        <button 
          onClick={() => setOpen(true)} 
          className="neon-button flex items-center gap-2 rounded-full px-5 py-3.5 text-xs font-bold shadow-2xl transition-transform hover:scale-105"
        >
          <Bot size={18} />
          <span>Hỏi Sahara AI</span>
        </button>
      )}

    </div>
  );
}
