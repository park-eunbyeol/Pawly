"use client";

import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Minus, Maximize2, Sparkles, Trash2 } from 'lucide-react';
import { usePathname } from 'next/navigation';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

export default function ChatBot() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: '안녕하세요! 반려동물 건강 전문가 폴리(Pawly) AI입니다. 무엇을 도와드릴까요?',
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    // 모든 훅 선언(useState, useRef, useEffect 등)이 완료된 후에 체크
    const isHiddenPath = ['/diary', '/history', '/nutrient', '/settings'].includes(pathname);
    if (isHiddenPath) return null;

    const handleSend = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input.trim(),
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            const formattedMessages = [...messages, userMsg].map(m => ({
                role: m.role === 'assistant' ? 'assistant' : 'user',
                content: m.content
            }));

            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: formattedMessages })
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                console.error('Server error response:', errorData);
                throw new Error(errorData.details || errorData.error || '채팅 요청 실패');
            }

            const data = await res.json();

            const assistMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: data.content,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, assistMsg]);
        } catch (err: any) {
            console.error('Chat error:', err);
            setMessages(prev => [...prev, {
                id: 'error-' + Date.now(),
                role: 'assistant',
                content: `죄송합니다. 오류가 발생했습니다: ${err.message}`,
                timestamp: new Date()
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const clearHistory = () => {
        if (confirm('대화 기록을 지우시겠습니까?')) {
            setMessages([
                {
                    id: '1',
                    role: 'assistant',
                    content: '대화 기록이 초기화되었습니다. 무엇을 도와드릴까요?',
                    timestamp: new Date()
                }
            ]);
        }
    };

    // Event Listener for external open triggers
    useEffect(() => {
        const handleOpenChat = () => {
            setIsOpen(true);
            setIsMinimized(false);
        };

        window.addEventListener('open-chatbot', handleOpenChat);
        return () => window.removeEventListener('open-chatbot', handleOpenChat);
    }, []);

    if (!isOpen && !isMinimized) return null;

    if (!isOpen) {
        // This block is unreachable based on logic above, but keeping for safety structure if needed
        return null;
    }

    return (
        <div className={`fixed right-6 z-[70] transition-all duration-500 ease-out ${isMinimized ? 'top-24 w-14 h-14' : 'top-24 w-[calc(100%-3rem)] max-w-[380px] h-[500px]'}`}>
            {isMinimized ? (
                <button
                    onClick={() => setIsMinimized(false)}
                    className="w-full h-full bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform"
                >
                    <Maximize2 className="w-6 h-6" />
                </button>
            ) : (
                <div className="w-full h-full bg-white rounded-[32px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-slate-100 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 duration-500">
                    {/* Header */}
                    <div className="px-6 py-4 bg-slate-900 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                                <Sparkles className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-white leading-tight">폴리 AI</h3>
                                <p className="text-[9px] font-bold text-blue-400 uppercase tracking-widest">Health Expert Assistant</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <button onClick={clearHistory} className="p-2 text-slate-400 hover:text-white transition-colors" title="기록 초기화">
                                <Trash2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => setIsMinimized(true)} className="p-2 text-slate-400 hover:text-white transition-colors">
                                <Minus className="w-4 h-4" />
                            </button>
                            <button onClick={() => setIsOpen(false)} className="p-2 text-slate-400 hover:text-white transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div
                        ref={scrollRef}
                        className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50"
                    >
                        {messages.map((m) => (
                            <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm font-medium leading-relaxed ${m.role === 'user'
                                    ? 'bg-blue-600 text-white rounded-tr-none shadow-lg shadow-blue-500/20'
                                    : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none shadow-sm'
                                    }`}>
                                    {m.content}
                                    <div className={`text-[8px] mt-1 opacity-50 ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
                                        {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white border border-slate-100 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm">
                                    <div className="flex gap-1">
                                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" />
                                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input */}
                    <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-100">
                        <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-2xl p-1 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                            <input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="질문을 입력하세요..."
                                className="flex-1 bg-transparent px-3 py-2 text-sm font-medium focus:outline-none"
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || isLoading}
                                className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center disabled:opacity-50 disabled:bg-slate-300 transition-all"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
