import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Sparkles, X, Send, MessageCircle, Bot } from 'lucide-react';
import { useChat } from '../hooks/useChat';
import { Spinner } from './ui/Spinner';

const ROLE_PERSONA = {
  attendee: { name: 'Nexus Concierge', hint: 'Ask about events, dates, or how to register.' },
  organizer: { name: 'Organizer Copilot', hint: 'Ask about your events, RSVPs, or revenue.' },
  admin: { name: 'Admin Assistant', hint: 'Ask about platform stats or moderation.' },
};

export function ChatWidget() {
  const { token, role } = useSelector((state) => state.auth);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const { messages, sendMessage, streaming, sources } = useChat();
  const scrollRef = useRef(null);
  const navigate = useNavigate();

  const persona = ROLE_PERSONA[role] || ROLE_PERSONA.attendee;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  if (!token) return null;

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage(input);
    setInput('');
  };

  return (
    <div className="fixed bottom-6 right-6 z-[60]">
      {open && (
        <div className="mb-3 w-[360px] max-w-[calc(100vw-3rem)] h-[500px] max-h-[70vh] bg-[#121315]/97 border border-white/[0.1] rounded-[24px] shadow-[0_24px_80px_rgba(0,0,0,0.6)] backdrop-blur-2xl flex flex-col overflow-hidden animate-fade-in">
          <div className="p-4 border-b border-white/[0.06] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-luma-blue/10 border border-luma-blue/20 flex items-center justify-center">
                <Bot className="w-4 h-4 text-luma-blue" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">{persona.name}</p>
                <p className="text-[10px] text-luma-text-dimmed capitalize">{role} mode</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="p-1.5 text-luma-text-muted hover:text-white cursor-pointer bg-transparent border-none">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <div className="text-center py-8">
                <Sparkles className="w-6 h-6 text-luma-blue mx-auto mb-2" />
                <p className="text-xs text-luma-text-muted">{persona.hint}</p>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed whitespace-pre-line ${
                    m.role === 'user' ? 'bg-luma-blue/15 text-white border border-luma-blue/20' : 'bg-white/[0.04] text-luma-text-light-gray border border-white/[0.06]'
                  }`}
                >
                  {m.content || (streaming && i === messages.length - 1 ? <Spinner size="xs" /> : '')}
                </div>
              </div>
            ))}
            {sources.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {sources.slice(0, 3).map((s) => (
                  <button
                    key={s.id}
                    onClick={() => navigate(`/eventdetails/${s.id}`)}
                    className="text-[10px] font-semibold text-luma-blue bg-luma-blue/10 border border-luma-blue/20 rounded-full px-2.5 py-1 hover:bg-luma-blue/20 transition-colors cursor-pointer"
                  >
                    {s.title}
                  </button>
                ))}
              </div>
            )}
          </div>

          <form onSubmit={handleSend} className="p-3 border-t border-white/[0.06] flex items-center gap-2 shrink-0">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything..."
              disabled={streaming}
              className="flex-1 bg-white/[0.03] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-luma-text-gray outline-none focus:border-luma-blue disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={streaming || !input.trim()}
              className="h-9 w-9 shrink-0 rounded-xl bg-white text-black flex items-center justify-center disabled:opacity-40 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        className="h-14 w-14 rounded-full bg-white text-black shadow-[0_8px_32px_rgba(0,0,0,0.4)] flex items-center justify-center hover:scale-105 active:scale-95 transition-transform cursor-pointer"
      >
        {open ? <X className="w-5 h-5" /> : <MessageCircle className="w-5 h-5" />}
      </button>
    </div>
  );
}
