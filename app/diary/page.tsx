"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Plus, Droplets, Bone, Activity, Stethoscope, MapPin, X, Check, Pill, Thermometer } from 'lucide-react';

// Mock Data
type RecordType = 'meal' | 'weight' | 'excretion' | 'symptom' | 'hospital' | 'walk' | 'medication' | 'receipt';

interface HealthRecord {
    id: string;
    type: RecordType;
    icon: any;
    color: string;
    bg: string;
    date: Date;
    time: string;
    title: string;
    value: string;
    memo?: string;
    imageUrl?: string;
}

// Initial Mock Data (Deterministic)
const generateInitialData = (): HealthRecord[] => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();

    // Create some records for this month
    return [
        {
            id: '1', type: 'meal', icon: Bone, color: 'text-orange-500', bg: 'bg-orange-50',
            date: new Date(year, month, 2), time: '08:30', title: '아침 식사', value: '사료 70g'
        },
        {
            id: '2', type: 'excretion', icon: Droplets, color: 'text-blue-500', bg: 'bg-blue-50',
            date: new Date(year, month, 2), time: '09:15', title: '소변', value: '정상'
        },
        {
            id: '3', type: 'weight', icon: Activity, color: 'text-purple-500', bg: 'bg-purple-50',
            date: new Date(year, month, 3), time: '10:00', title: '몸무게 측정', value: '4.5kg'
        },
        {
            id: '5', type: 'walk', icon: MapPin, color: 'text-green-500', bg: 'bg-green-50',
            date: new Date(year, month, 2), time: '18:30', title: '저녁 산책', value: '30분 / 1.5km', memo: '공원에서 친구 만남'
        },
        {
            id: '4', type: 'hospital', icon: Stethoscope, color: 'text-red-500', bg: 'bg-red-50',
            date: new Date(year, month, 5), time: '14:00', title: '동물병원 방문', value: '정기 검진', memo: '심장사상충 예방접종'
        },
    ];
};

export default function DiaryPage() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [records, setRecords] = useState<HealthRecord[]>(generateInitialData());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [viewingImage, setViewingImage] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [aiReport, setAiReport] = useState<{
        summary: string;
        insights: string[];
        suggestions: string[];
        healthScore: number;
    } | null>(null);
    const [showAiModal, setShowAiModal] = useState(false);

    // Calendar Helpers (Same as before)
    const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const getFirstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    const onDateClick = (day: number) => setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));

    const isSelected = (day: number) => {
        return (
            selectedDate.getDate() === day &&
            selectedDate.getMonth() === currentDate.getMonth() &&
            selectedDate.getFullYear() === currentDate.getFullYear()
        );
    };

    const isToday = (day: number) => {
        const today = new Date();
        return (
            day === today.getDate() &&
            currentDate.getMonth() === today.getMonth() &&
            currentDate.getFullYear() === today.getFullYear()
        );
    };

    const hasRecord = (day: number) => {
        return records.some(r =>
            r.date.getDate() === day &&
            r.date.getMonth() === currentDate.getMonth() &&
            r.date.getFullYear() === currentDate.getFullYear()
        );
    };

    const renderCalendarDays = () => {
        const daysInMonth = getDaysInMonth(currentDate);
        const firstDay = getFirstDayOfMonth(currentDate);
        const days = [];

        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-10 w-full" />);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const hasRec = hasRecord(day);
            days.push(
                <button
                    key={day}
                    onClick={() => onDateClick(day)}
                    className={`h-12 w-full flex flex-col items-center justify-center relative rounded-xl transition-all
                        ${isSelected(day) ? 'bg-blue-600 text-white shadow-md scale-105' : 'text-slate-700 hover:bg-slate-50'}
                        ${isToday(day) && !isSelected(day) ? 'bg-blue-50 text-blue-600 font-bold' : ''}
                    `}
                >
                    <span className={`text-sm ${isSelected(day) ? 'font-bold' : ''}`}>{day}</span>
                    {hasRec && !isSelected(day) && (
                        <div className="flex gap-0.5 mt-1">
                            <span className="w-1 h-1 rounded-full bg-blue-400"></span>
                        </div>
                    )}
                </button>
            );
        }
        return days;
    };

    const currentRecords = records.filter(r =>
        r.date.getDate() === selectedDate.getDate() &&
        r.date.getMonth() === selectedDate.getMonth() &&
        r.date.getFullYear() === selectedDate.getFullYear()
    );

    const handleAddRecord = (newRecord: HealthRecord) => {
        setRecords([...records, { ...newRecord, date: selectedDate }]);
        setIsModalOpen(false);
    };

    const handleDeleteRecord = (id: string) => {
        if (confirm('이 기록을 삭제하시겠습니까?')) {
            setRecords(records.filter(r => r.id !== id));
        }
    };

    const handleAiAnalysis = async () => {
        if (records.length === 0) {
            alert('기록이 없으면 AI 분석을 할 수 없습니다. 기록을 먼저 추가해주세요.');
            return;
        }

        setIsAnalyzing(true);
        setShowAiModal(true);

        try {
            const res = await fetch('/api/diary/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    records: currentRecords, // 오늘 기록 기준
                    pet: 'dog' // 기본값 (추후 연동 가능)
                })
            });

            if (!res.ok) throw new Error('AI 분석 요청 실패');

            const data = await res.json();
            setAiReport(data);
        } catch (err) {
            console.error(err);
            alert('AI 분석 중 오류가 발생했습니다.');
            setShowAiModal(false);
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-24 font-sans max-w-[600px] mx-auto relative">

            {/* Header */}
            <header className="sticky top-0 bg-white/80 backdrop-blur-xl z-20 px-6 py-4 flex items-center justify-between border-b border-slate-100">
                <Link href="/" className="p-2 -ml-2 hover:bg-slate-50 rounded-full transition-colors">
                    <ChevronLeft className="w-6 h-6 text-slate-800" />
                </Link>
                <h1 className="text-lg font-bold text-slate-900">건강 수첩</h1>
                <div className="w-10" />
            </header>

            <main className="px-6 py-6 space-y-8">

                {/* Upcoming Care Banner */}
                <section className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-[32px] p-6 text-white shadow-lg shadow-blue-500/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <Stethoscope className="w-32 h-32" />
                    </div>

                    <div className="relative z-10">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4 sm:gap-0">
                            <h2 className="text-lg font-bold flex items-center gap-2 whitespace-nowrap">
                                <Stethoscope className="w-5 h-5" />
                                예정된 케어
                            </h2>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleAiAnalysis}
                                    className="text-xs font-bold bg-white text-blue-600 hover:bg-white/90 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1 shadow-sm whitespace-nowrap"
                                >
                                    <Activity className="w-3 h-3" />
                                    AI 건강 리포트
                                </button>
                                <button className="text-xs font-bold bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1 whitespace-nowrap">
                                    <Plus className="w-3 h-3" />
                                    추가
                                </button>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                                    💉
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-bold text-sm">심장사상충 예방</h3>
                                        <span className="text-xs font-bold bg-white/20 px-2 py-0.5 rounded text-white">D-2</span>
                                    </div>
                                    <p className="text-xs text-blue-100 mt-0.5">2026.02.14 예정</p>
                                </div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                                    💊
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-bold text-sm">종합백신 5차</h3>
                                        <span className="text-xs font-bold bg-red-400 px-2 py-0.5 rounded text-white shadow-sm">오늘</span>
                                    </div>
                                    <p className="text-xs text-blue-100 mt-0.5">병원 방문 필요</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Calendar Card */}
                <section className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-slate-900">
                            {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
                        </h2>
                        <div className="flex gap-2">
                            <button onClick={prevMonth} className="p-2 hover:bg-slate-50 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button onClick={nextMonth} className="p-2 hover:bg-slate-50 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Weekdays */}
                    <div className="grid grid-cols-7 mb-2">
                        {['일', '월', '화', '수', '목', '금', '토'].map((day, i) => (
                            <div key={day} className={`text-center text-xs font-bold py-2 ${i === 0 ? 'text-red-400' : 'text-slate-400'}`}>
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Days Grid */}
                    <div className="grid grid-cols-7 gap-y-1 gap-x-1">
                        {renderCalendarDays()}
                    </div>
                </section>

                {/* Daily Records */}
                <section>
                    <div className="flex items-center justify-between mb-4 px-2">
                        <h3 className="text-lg font-bold text-slate-900">
                            {selectedDate.getMonth() + 1}월 {selectedDate.getDate()}일 기록
                        </h3>
                        <span className="text-sm text-slate-500 font-medium">
                            총 <span className="text-blue-600">{currentRecords.length}</span>개
                        </span>
                    </div>

                    <div className="space-y-4">
                        {currentRecords.length > 0 ? (
                            currentRecords.map((record) => (
                                <div key={record.id} className="bg-white p-5 rounded-[24px] shadow-sm border border-slate-100 flex gap-4 animate-in slide-in-from-bottom-2 duration-500">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${record.bg} ${record.color} shrink-0`}>
                                        <record.icon className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between mb-1">
                                            <h4 className="font-bold text-slate-900">{record.title}</h4>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">{record.time}</span>
                                                <button
                                                    onClick={() => handleDeleteRecord(record.id)}
                                                    className="text-slate-300 hover:text-red-500 transition-colors p-1 -mr-2"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                        <p className="text-slate-600 font-medium">{record.value}</p>

                                        {/* Attachment Preview */}
                                        {record.imageUrl && (
                                            <div
                                                onClick={() => setViewingImage(record.imageUrl!)}
                                                className="mt-4 relative group cursor-zoom-in"
                                            >
                                                <img
                                                    src={record.imageUrl}
                                                    alt="첨부 이미지"
                                                    className="w-full h-40 object-cover rounded-2xl border border-slate-100"
                                                />
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-2xl flex items-center justify-center">
                                                    <Plus className="text-white opacity-0 group-hover:opacity-100 w-8 h-8" />
                                                </div>
                                            </div>
                                        )}

                                        {record.memo && (
                                            <p className="text-sm text-slate-400 mt-2 bg-slate-50 p-3 rounded-xl">
                                                {record.memo}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12 bg-white rounded-[32px] border border-dashed border-slate-200">
                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                                    <ClipboardList className="w-8 h-8" />
                                </div>
                                <p className="text-slate-400 font-medium">기록된 내용이 없습니다.</p>
                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    className="mt-4 text-blue-600 font-bold text-sm hover:underline"
                                >
                                    + 첫 기록 남기기
                                </button>
                            </div>
                        )}
                    </div>
                </section>
            </main>

            {/* Add Record Modal */}
            {isModalOpen && (
                <AddRecordModal
                    onClose={() => setIsModalOpen(false)}
                    onAdd={handleAddRecord}
                    selectedDate={selectedDate}
                />
            )}

            {/* AI Report Modal */}
            {showAiModal && (
                <AiReportModal
                    isOpen={showAiModal}
                    onClose={() => setShowAiModal(false)}
                    isAnalyzing={isAnalyzing}
                    result={aiReport}
                />
            )}

            {/* Image Detail Lightbox */}
            {viewingImage && (
                <div
                    className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex flex-col animate-in fade-in duration-300"
                    onClick={() => setViewingImage(null)}
                >
                    <div className="flex justify-end p-6">
                        <button className="text-white p-2">
                            <X className="w-8 h-8" />
                        </button>
                    </div>
                    <div className="flex-1 flex items-center justify-center p-6">
                        <img
                            src={viewingImage}
                            alt="상세 보기"
                            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                        />
                    </div>
                    <div className="p-8 text-center">
                        <p className="text-white/60 text-sm font-medium">화면을 클릭하여 닫기</p>
                    </div>
                </div>
            )}

        </div>
    );
}

// AI Report Modal Component
function AiReportModal({ isOpen, onClose, isAnalyzing, result }: {
    isOpen: boolean;
    onClose: () => void;
    isAnalyzing: boolean;
    result: any;
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-md flex items-end justify-center sm:items-center p-0 sm:p-6 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-[500px] h-[80vh] sm:h-auto sm:max-h-[90vh] rounded-t-[40px] sm:rounded-[40px] shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom duration-500">
                {/* Header */}
                <div className="px-8 py-6 flex items-center justify-between border-b border-slate-50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-xl">✨</div>
                        <div>
                            <h3 className="text-lg font-black text-slate-900 tracking-tighter">AI 건강 리포트</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Powered by Google Gemini</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
                        <X className="w-6 h-6 text-slate-400" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-8 py-8">
                    {isAnalyzing ? (
                        <div className="h-full flex flex-col items-center justify-center gap-6 py-12">
                            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                            <div className="text-center">
                                <p className="text-sm font-black text-slate-800 tracking-tight">오늘의 건강 기록을 분석 중입니다...</p>
                                <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-[0.2em]">Deep Learning Analysis</p>
                            </div>
                        </div>
                    ) : result ? (
                        <div className="space-y-10">
                            {/* Score Card */}
                            <div className="bg-slate-50 rounded-[32px] p-8 flex items-center justify-between border border-slate-100/50">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Health Score</p>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-5xl font-black text-slate-900 tracking-tighter">{result.healthScore}</span>
                                        <span className="text-xl font-bold text-slate-400">/ 100</span>
                                    </div>
                                </div>
                                <div className="w-20 h-20 rounded-full border-8 border-blue-500/10 flex items-center justify-center relative">
                                    <div className="absolute inset-0 rounded-full border-8 border-blue-500 border-t-transparent animate-pulse" style={{ clipPath: `inset(${100 - result.healthScore}% 0 0 0)` }} />
                                    <Activity className="w-8 h-8 text-blue-500" />
                                </div>
                            </div>

                            {/* Summary */}
                            <div className="space-y-4">
                                <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest border-l-4 border-blue-500 pl-3">상태 요약</h4>
                                <p className="text-lg font-bold text-slate-600 leading-relaxed break-keep">
                                    {result.summary}
                                </p>
                            </div>

                            {/* Insights */}
                            <div className="space-y-4">
                                <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest border-l-4 border-emerald-500 pl-3">AI 인사이트</h4>
                                <div className="space-y-3">
                                    {result.insights.map((item: string, i: number) => (
                                        <div key={i} className="flex gap-4 p-4 bg-emerald-50 rounded-2xl border border-emerald-100/50">
                                            <div className="text-emerald-500 mt-0.5">💡</div>
                                            <p className="text-sm font-bold text-emerald-700 leading-relaxed">{item}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Suggestions */}
                            <div className="space-y-4">
                                <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest border-l-4 border-orange-500 pl-3">추천 행동</h4>
                                <div className="space-y-3">
                                    {result.suggestions.map((item: string, i: number) => (
                                        <div key={i} className="flex gap-4 p-4 bg-orange-50 rounded-2xl border border-orange-100/50">
                                            <div className="text-orange-500 mt-0.5">✨</div>
                                            <p className="text-sm font-bold text-orange-700 leading-relaxed">{item}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-slate-400 font-bold">인사이트를 불러올 수 없습니다.</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-8 py-6 bg-slate-50 border-t border-slate-100">
                    <button
                        onClick={onClose}
                        className="w-full py-5 bg-slate-900 text-white rounded-[24px] font-black text-sm uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-all"
                    >
                        확인했습니다
                    </button>
                    <p className="text-[9px] font-bold text-slate-300 text-center mt-4">
                        * AI 분석 결과는 전문 수의사의 진단을 대신할 수 없습니다.
                    </p>
                </div>
            </div>
        </div>
    );
}

function ClipboardList({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
            <path d="M9 12h-1" />
            <path d="M15 12h-1" />
            <path d="M9 16h-1" />
            <path d="M15 16h-1" />
        </svg>
    )
}

// Add Record Modal Component
function AddRecordModal({ onClose, onAdd, selectedDate }: { onClose: () => void, onAdd: (record: any) => void, selectedDate: Date }) {
    const [type, setType] = useState<RecordType>('meal');
    const [time, setTime] = useState(new Date().toTimeString().slice(0, 5));
    const [value, setValue] = useState('');
    const [memo, setMemo] = useState('');
    const [imageUrl, setImageUrl] = useState<string | null>(null);

    const handleImageUpload = () => {
        // Simulated upload - in a real app, this would use an input[type=file]
        const mockImages = [
            'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
        ];
        setImageUrl(mockImages[Math.floor(Math.random() * mockImages.length)]);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        let title = '';
        let icon: any = Bone;
        let color = '';
        let bg = '';

        switch (type) {
            case 'meal':
                title = '식사/간식';
                icon = Bone;
                color = 'text-orange-500';
                bg = 'bg-orange-50';
                break;
            case 'weight':
                title = '몸무게';
                icon = Activity;
                color = 'text-purple-500';
                bg = 'bg-purple-50';
                break;
            case 'excretion':
                title = '배변';
                icon = Droplets;
                color = 'text-blue-500';
                bg = 'bg-blue-50';
                break;
            case 'walk':
                title = '산책';
                icon = MapPin;
                color = 'text-green-500';
                bg = 'bg-green-50';
                break;
            case 'hospital':
                title = '병원';
                icon = Stethoscope;
                color = 'text-red-500';
                bg = 'bg-red-50';
                break;
            case 'medication':
                title = '약/영양제';
                icon = Pill;
                color = 'text-teal-500';
                bg = 'bg-teal-50';
                break;
            case 'receipt':
                title = '처방전/영수증';
                icon = ClipboardList;
                color = 'text-indigo-500';
                bg = 'bg-indigo-50';
                break;
            case 'symptom':
                title = '이상징후';
                icon = Thermometer;
                color = 'text-yellow-500';
                bg = 'bg-yellow-50';
                break;
            default:
                title = '기타';
        }

        onAdd({
            id: Date.now().toString(),
            type,
            icon,
            color,
            bg,
            time,
            title,
            value,
            memo: memo.trim() || undefined,
            imageUrl: imageUrl || undefined
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-[600px] rounded-t-[32px] sm:rounded-[32px] p-6 shadow-2xl animate-in slide-in-from-bottom duration-300">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-slate-900">
                        {selectedDate.getMonth() + 1}월 {selectedDate.getDate()}일 기록 추가
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <X className="w-6 h-6 text-slate-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Type Selection */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">기록 유형</label>
                        <div className="grid grid-cols-4 gap-2">
                            {[
                                { id: 'meal', label: '식사', icon: '🍖' },
                                { id: 'excretion', label: '배변', icon: '💧' },
                                { id: 'walk', label: '산책', icon: '🐾' },
                                { id: 'weight', label: '체중', icon: '⚖️' },
                                { id: 'hospital', label: '병원', icon: '🏥' },
                                { id: 'medication', label: '투약', icon: '💊' },
                                { id: 'receipt', label: '서류', icon: '📄' },
                                { id: 'symptom', label: '증상', icon: '🤒' },
                            ].map((item) => (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => setType(item.id as RecordType)}
                                    className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all ${type === item.id
                                        ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm'
                                        : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50'
                                        }`}
                                >
                                    <span className="text-xl mb-1">{item.icon}</span>
                                    <span className="text-xs font-bold">{item.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-1">
                            <label className="block text-sm font-bold text-slate-700 mb-2">시간</label>
                            <input
                                type="time"
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-bold text-slate-700 mb-2">내용</label>
                            <input
                                type="text"
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                                placeholder="예: 구토 1회, 심장사상충 약"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">기록 본문</label>
                        <textarea
                            value={memo}
                            onChange={(e) => setMemo(e.target.value)}
                            placeholder="오늘 상태가 어떤가요?"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
                        />
                    </div>

                    {/* Image Upload Area */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">사진 첨부 (처방전/영수증 등)</label>
                        {imageUrl ? (
                            <div className="relative w-full h-40 rounded-2xl overflow-hidden border border-slate-200 group">
                                <img src={imageUrl} alt="Uploaded" className="w-full h-full object-cover" />
                                <button
                                    onClick={() => setImageUrl(null)}
                                    className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={handleImageUpload}
                                className="w-full h-24 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-1 text-slate-400 hover:bg-slate-50 hover:border-blue-300 hover:text-blue-500 transition-all"
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                                    <circle cx="12" cy="13" r="4" />
                                </svg>
                                <span className="text-[10px] font-black uppercase tracking-widest">사진 추가하기</span>
                            </button>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2"
                    >
                        <Check className="w-5 h-5" />
                        기록 저장하기
                    </button>
                    <div className="h-4 sm:hidden" /> {/* Mobile bottom spacer */}
                </form>
            </div>
        </div>
    );
}
