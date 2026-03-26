import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Loader2, Bot, RotateCcw, ChevronDown } from 'lucide-react';
import { streamChat, ChatMessage, TrainingContext } from '../services/claude';

interface AIAssistantProps {
  onClose: () => void;
  context: TrainingContext;
}

const SUGGESTED_QUESTIONS = [
  '¿Cómo está mi volumen semanal por grupo muscular?',
  '¿Qué desequilibrios tiene mi rutina actual?',
  '¿Cómo puedo optimizar mis días de entrenamiento?',
  '¿El volumen de mis levantamientos prioritarios es suficiente?',
];

export default function AIAssistant({ onClose, context }: AIAssistantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isStreaming) return;
    setError(null);

    const userMsg: ChatMessage = { role: 'user', content: text };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setIsStreaming(true);

    const assistantPlaceholder: ChatMessage = { role: 'assistant', content: '' };
    setMessages([...updatedMessages, assistantPlaceholder]);

    await streamChat(
      updatedMessages,
      context,
      (chunk) => {
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          return [
            ...prev.slice(0, -1),
            { ...last, content: last.content + chunk },
          ];
        });
      },
      () => setIsStreaming(false),
      (err) => {
        setError(err);
        setIsStreaming(false);
        setMessages((prev) => prev.slice(0, -1));
      }
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setError(null);
    inputRef.current?.focus();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full sm:max-w-lg h-[85vh] sm:h-[80vh] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-800 rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center">
              <Bot size={18} className="text-white" />
            </div>
            <div>
              <p className="text-white font-black text-sm uppercase tracking-tight">
                Coach IA
              </p>
              <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest">
                Powered by Claude Opus
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <button
                onClick={clearChat}
                className="text-slate-400 hover:text-white transition-colors p-1"
                title="Limpiar chat"
              >
                <RotateCcw size={15} />
              </button>
            )}
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors p-1"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center gap-6 text-center py-4">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center">
                <Bot size={32} className="text-slate-400" />
              </div>
              <div>
                <p className="text-slate-800 font-black text-sm uppercase">
                  Analiza tu rutina con IA
                </p>
                <p className="text-slate-400 text-xs mt-1 max-w-xs">
                  Claude analiza tu rutina actual, volumen y objetivos para darte
                  recomendaciones personalizadas.
                </p>
              </div>
              <div className="w-full space-y-2">
                <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1">
                  <ChevronDown size={10} /> Preguntas sugeridas
                </p>
                {SUGGESTED_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="w-full text-left text-xs font-medium text-slate-700 bg-slate-50 hover:bg-blue-50 hover:text-blue-700 border border-slate-200 hover:border-blue-200 rounded-xl px-4 py-3 transition-all"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-6 h-6 bg-slate-800 rounded-lg flex items-center justify-center mr-2 mt-1 flex-shrink-0">
                  <Bot size={12} className="text-white" />
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-slate-800 text-white rounded-br-sm'
                    : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-bl-sm'
                }`}
              >
                {msg.content ? (
                  <span style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</span>
                ) : (
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <Loader2 size={12} className="animate-spin" />
                    Analizando...
                  </span>
                )}
              </div>
            </div>
          ))}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-xs text-red-700 font-medium">
              {error}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t border-slate-100 bg-white">
          <div className="flex gap-2 items-center bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2 focus-within:border-blue-400 transition-colors">
            <input
              ref={inputRef}
              className="flex-1 bg-transparent text-xs font-medium text-slate-800 placeholder-slate-400 outline-none"
              placeholder="Pregunta sobre tu rutina..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isStreaming}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isStreaming}
              className="w-7 h-7 bg-slate-800 disabled:bg-slate-200 text-white disabled:text-slate-400 rounded-xl flex items-center justify-center transition-all hover:bg-slate-900 flex-shrink-0"
            >
              {isStreaming ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <Send size={13} />
              )}
            </button>
          </div>
          <p className="text-[8px] text-slate-300 font-bold uppercase text-center mt-2 tracking-widest">
            Claude Opus 4.6 · Anthropic
          </p>
        </div>
      </div>
    </div>
  );
}
