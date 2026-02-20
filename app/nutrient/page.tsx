"use client";

import Link from 'next/link';
import { useState } from 'react';
import { ChevronLeft, Droplets, Flame, Utensils, Plus, Coffee, Apple, X, Trash2 } from 'lucide-react';

export default function NutrientPage() {
    // Mock Data
    const waterCurrent = 650;
    const waterTarget = 1000; // ml
    const calorieCurrent = 320;
    const calorieTarget = 500; // kcal

    const waterPercentage = Math.min((waterCurrent / waterTarget) * 100, 100);
    const caloriePercentage = Math.min((calorieCurrent / calorieTarget) * 100, 100);

    // SVG Circle calculations
    const radius = 36;
    const circumference = 2 * Math.PI * radius;
    const waterOffset = circumference - (waterPercentage / 100) * circumference;
    const calorieOffset = circumference - (caloriePercentage / 100) * circumference;

    // ✅ State for Dynamic Logs
    const [logs, setLogs] = useState([
        { id: 1, type: 'meal', name: '아침 식사', desc: '오리젠 오리지널 40g', amount: '180 kcal', icon: Utensils, color: 'orange' },
        { id: 2, type: 'snack', name: '오후 간식', desc: '동결건조 북어 트릿 3개', amount: '45 kcal', icon: Apple, color: 'amber' },
        { id: 3, type: 'water', name: '수분 섭취', desc: '오후 산책 후', amount: '120 ml', icon: Coffee, color: 'blue' },
    ]);

    const [showModal, setShowModal] = useState(false);
    const [newLog, setNewLog] = useState({ type: 'meal', name: '', desc: '', amount: '' });

    const handleAddLog = () => {
        if (!newLog.name || !newLog.amount) return;
        const icon = newLog.type === 'meal' ? Utensils : newLog.type === 'snack' ? Apple : Coffee;
        const color = newLog.type === 'meal' ? 'orange' : newLog.type === 'snack' ? 'amber' : 'blue';
        const unit = newLog.type === 'water' ? 'ml' : 'kcal';

        setLogs([{
            id: Date.now(),
            type: newLog.type,
            name: newLog.name,
            desc: newLog.desc,
            amount: `${newLog.amount} ${unit}`,
            icon,
            color
        }, ...logs]);
        setShowModal(false);
        setNewLog({ type: 'meal', name: '', desc: '', amount: '' });
    };

    // ✅ 기록 삭제 핸들러
    const handleDeleteLog = (id: number) => {
        setLogs(logs.filter(log => log.id !== id));
    };

    return (
        <div className="w-full bg-slate-50 min-h-screen font-sans text-slate-800 relative pb-24">
            {/* Header */}
            <header className="sticky top-0 w-full bg-white/80 backdrop-blur-xl border-b border-slate-100 z-50 px-6 h-16 flex items-center gap-4">
                <Link href="/" className="w-10 h-10 -ml-2 flex items-center justify-center rounded-full hover:bg-slate-50 transition-colors">
                    <ChevronLeft className="w-6 h-6 text-slate-800" strokeWidth={2} />
                </Link>
                <h1 className="text-lg font-bold text-slate-900">식단/수분 관리</h1>
            </header>

            <main className="px-6 pt-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

                {/* Daily Progress Section */}
                <section className="grid grid-cols-2 gap-4">
                    {/* Water Card */}
                    <div className="bg-white p-5 rounded-[28px] border border-slate-100 shadow-sm flex flex-col items-center justify-center space-y-4">
                        <div className="relative w-24 h-24 flex items-center justify-center">
                            {/* Background Circle */}
                            <svg className="w-full h-full transform -rotate-90">
                                <circle cx="48" cy="48" r={radius} stroke="#E2E8F0" strokeWidth="8" fill="transparent" />
                                <circle
                                    cx="48" cy="48" r={radius}
                                    stroke="#3B82F6" strokeWidth="8" fill="transparent"
                                    strokeDasharray={circumference}
                                    strokeDashoffset={waterOffset}
                                    strokeLinecap="round"
                                    className="transition-all duration-1000 ease-out"
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Droplets className="w-6 h-6 text-blue-500" fill="currentColor" />
                            </div>
                        </div>
                        <div className="text-center">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Water</p>
                            <h3 className="text-xl font-black text-slate-800">{waterCurrent}<span className="text-sm font-medium text-slate-500">ml</span></h3>
                            <p className="text-[10px] text-slate-400">목표 {waterTarget}ml</p>
                        </div>
                    </div>

                    {/* Calorie Card */}
                    <div className="bg-white p-5 rounded-[28px] border border-slate-100 shadow-sm flex flex-col items-center justify-center space-y-4">
                        <div className="relative w-24 h-24 flex items-center justify-center">
                            {/* Background Circle */}
                            <svg className="w-full h-full transform -rotate-90">
                                <circle cx="48" cy="48" r={radius} stroke="#E2E8F0" strokeWidth="8" fill="transparent" />
                                <circle
                                    cx="48" cy="48" r={radius}
                                    stroke="#F97316" strokeWidth="8" fill="transparent"
                                    strokeDasharray={circumference}
                                    strokeDashoffset={calorieOffset}
                                    strokeLinecap="round"
                                    className="transition-all duration-1000 ease-out"
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Flame className="w-6 h-6 text-orange-500" fill="currentColor" />
                            </div>
                        </div>
                        <div className="text-center">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Calories</p>
                            <h3 className="text-xl font-black text-slate-800">{calorieCurrent}<span className="text-sm font-medium text-slate-500">kcal</span></h3>
                            <p className="text-[10px] text-slate-400">목표 {calorieTarget}kcal</p>
                        </div>
                    </div>
                </section>

                {/* Today's Log Section */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-slate-900">오늘의 기록</h3>
                        <span className="text-sm font-medium text-slate-500">2026. 02. 09</span>
                    </div>

                    <div className="space-y-3">
                        {logs.length > 0 ? (
                            logs.map((log: any) => {
                                const Icon = log.icon;
                                let colorClasses = "bg-orange-50 text-orange-500";
                                if (log.color === 'amber') colorClasses = "bg-amber-50 text-amber-500";
                                if (log.color === 'blue') colorClasses = "bg-blue-50 text-blue-500";

                                return (
                                    <div key={log.id} className="bg-white p-4 rounded-[24px] border border-slate-100 shadow-sm flex items-center justify-between animate-in slide-in-from-bottom-2 group">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${colorClasses}`}>
                                                <Icon className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-800">{log.name}</h4>
                                                <p className="text-xs text-slate-500">{log.desc}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="font-bold text-slate-700">{log.amount}</span>
                                            <button
                                                onClick={() => handleDeleteLog(log.id)}
                                                className="p-2 -mr-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                                                aria-label="Delete log"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="py-10 text-center text-slate-400 font-medium bg-white rounded-[24px] border border-slate-100 border-dashed">
                                기록이 없습니다.
                            </div>
                        )}
                    </div>
                </section>
            </main>

            {/* Floating Action Button */}
            <button
                onClick={() => setShowModal(true)}
                className="fixed bottom-[120px] right-6 sm:right-[calc(50%-270px)] w-14 h-14 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-orange-500/30 active:scale-95 transition-all z-[60]"
            >
                <Plus className="w-7 h-7" strokeWidth={2.5} />
            </button>

            {/* ✅ Add Log Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center sm:px-4">
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />

                    {/* Modal Content */}
                    <div className="relative w-full sm:max-w-sm bg-white rounded-t-[32px] sm:rounded-[32px] p-8 space-y-6 shadow-2xl animate-in slide-in-from-bottom-10 duration-300">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-black text-slate-900">기록 추가하기</h3>
                            <button onClick={() => setShowModal(false)} className="p-2 -mr-2 text-slate-400 hover:text-slate-800">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Type Selector */}
                        <div className="flex p-1 bg-slate-100 rounded-2xl">
                            {['meal', 'snack', 'water'].map((t) => (
                                <button
                                    key={t}
                                    onClick={() => setNewLog({ ...newLog, type: t as any })}
                                    className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${newLog.type === t
                                        ? 'bg-white text-slate-900 shadow-sm'
                                        : 'text-slate-400 hover:text-slate-600'
                                        }`}
                                >
                                    {t === 'meal' ? '식사' : t === 'snack' ? '간식' : '수분'}
                                </button>
                            ))}
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 ml-1">항목 이름</label>
                                <input
                                    type="text"
                                    value={newLog.name}
                                    onChange={(e) => setNewLog({ ...newLog, name: e.target.value })}
                                    placeholder={newLog.type === 'water' ? '예: 오후 산책 후' : '예: 아침 식사'}
                                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-100"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 ml-1">상세 내용 (선택)</label>
                                <input
                                    type="text"
                                    value={newLog.desc}
                                    onChange={(e) => setNewLog({ ...newLog, desc: e.target.value })}
                                    placeholder="예: 오리젠 사료 40g"
                                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-100"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 ml-1">섭취량 ({newLog.type === 'water' ? 'ml' : 'kcal'})</label>
                                <input
                                    type="number"
                                    value={newLog.amount}
                                    onChange={(e) => setNewLog({ ...newLog, amount: e.target.value })}
                                    placeholder="0"
                                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-100"
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleAddLog}
                            className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-lg shadow-xl shadow-slate-200 active:scale-[0.98] transition-transform"
                        >
                            추가하기
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
