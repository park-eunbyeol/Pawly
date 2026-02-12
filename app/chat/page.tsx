"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Send, Trash2 } from 'lucide-react';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    hospitals?: any[]; // Array of hospital data
}

export default function ChatPage() {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: '궁금한 점을 물어보세요.',
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
    }, [messages]);

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

            const data = await res.json();

            if (!res.ok) {
                console.error('Server error response:', data);
                throw new Error(data.error || 'Failed to fetch response');
            }

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: data.content,
                timestamp: new Date(),
                hospitals: data.recommendedHospitals // Add hospitals data
            };

            setMessages((prev) => [...prev, assistantMessage]);
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

    return (
        <div className="w-full min-h-screen bg-slate-50 flex flex-col font-sans pb-[200px]">
            {/* Header */}
            <div className="px-6 py-4 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between sticky top-0 z-40">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-lg shadow-slate-200">
                        <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-lg font-black text-slate-900 leading-tight">AI 상담소</h1>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Medical Assistant</p>
                    </div>
                </div>
                <button
                    onClick={clearHistory}
                    className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-red-500 transition-all"
                    title="기록 초기화"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 px-6 py-6 space-y-6">
                {messages.map((m) => (
                    <div key={m.id} className={`flex w-full ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`flex flex-col max-w-[85%] ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                            {m.role === 'assistant' && (
                                <div className="flex items-center gap-2 mb-2 ml-1">
                                    <div className="w-6 h-6 rounded-full bg-slate-900 flex items-center justify-center">
                                        <Sparkles className="w-3 h-3 text-white" />
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-400">PAWLY AI</span>
                                </div>
                            )}
                            <div className={`px-5 py-3.5 rounded-[20px] text-sm font-medium leading-relaxed shadow-sm break-words whitespace-pre-wrap ${m.role === 'user'
                                ? 'bg-blue-600 text-white rounded-tr-none shadow-blue-500/20'
                                : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
                                }`}>
                                {m.content}
                                {/* Hospital Recommendation Cards */}
                                {(m as any).hospitals && (m as any).hospitals.length > 0 && (
                                    <div className="mt-4 flex flex-col gap-3">
                                        <div className="text-[11px] font-bold text-slate-400 border-t border-slate-100 pt-3 mb-1">
                                            🏥 추천 동물병원 리스트 (실시간 운영정보 확인)
                                        </div>
                                        {(m as any).hospitals.map((h: any, idx: number) => (
                                            <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-2 shadow-sm hover:shadow-md transition-all">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h4 className="text-base font-black text-slate-900 leading-tight">
                                                            {h.name}
                                                            {h.timeInfo && <span className="ml-1 text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-md font-bold">{h.timeInfo.replace(/[\[\]]/g, '')}</span>}
                                                        </h4>
                                                        <p className="text-xs text-slate-500 font-bold mt-1 line-clamp-1">{h.address}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <a
                                                        href={h.mapLink}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex-1 py-2 bg-white border border-slate-200 rounded-lg text-[10px] text-center font-bold text-slate-600 hover:bg-slate-100 hover:text-blue-600 transition-colors flex items-center justify-center gap-1"
                                                    >
                                                        <span>🕒 오늘 운영시간/휴무 확인</span>
                                                    </a>
                                                    {h.phone !== '전화번호 미제공' && (
                                                        <a href={`tel:${h.phone}`} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                                                            📞
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <span className="text-[9px] font-bold text-slate-300 mt-1.5 px-1">
                                {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="flex justify-start w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="flex flex-col items-start">
                            <div className="flex items-center gap-2 mb-2 ml-1">
                                <div className="w-6 h-6 rounded-full bg-slate-900 flex items-center justify-center">
                                    <Sparkles className="w-3 h-3 text-white" />
                                </div>
                                <span className="text-[10px] font-bold text-slate-400">Typing...</span>
                            </div>
                            <div className="bg-white border border-slate-100 px-5 py-4 rounded-[24px] rounded-tl-none shadow-sm flex gap-1.5">
                                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                            </div>
                        </div>
                    </div>
                )}
                <div ref={scrollRef} />
            </div>

            {/* Input Area - Fixed above BottomNav */}
            <div className="fixed bottom-[120px] left-0 right-0 mx-auto max-w-[600px] px-4 z-40">
                <form onSubmit={handleSend} className="flex gap-2 bg-white/90 backdrop-blur-xl p-2 rounded-[24px] border border-slate-100 shadow-xl shadow-slate-200/50">
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="무엇이든 물어보세요..."
                        className="flex-1 bg-transparent px-4 py-3 text-sm font-medium focus:outline-none placeholder:text-slate-400"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        className="w-11 h-11 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-slate-800 disabled:opacity-50 disabled:bg-slate-300 transition-all active:scale-95"
                    >
                        <Send className="w-5 h-5 ml-0.5" />
                    </button>
                </form>
            </div>
        </div>
    );
}
