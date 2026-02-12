"use client";

import Link from 'next/link';
import { ChevronLeft, Syringe, Pill, Calendar, Plus, Clock } from 'lucide-react';

export default function HistoryPage() {
    return (
        <div className="w-full bg-slate-50 min-h-screen font-sans text-slate-800 relative pb-24">
            {/* Header */}
            <header className="sticky top-0 w-full bg-white/80 backdrop-blur-xl border-b border-slate-100 z-50 px-6 h-16 flex items-center gap-4">
                <Link href="/" className="w-10 h-10 -ml-2 flex items-center justify-center rounded-full hover:bg-slate-50 transition-colors">
                    <ChevronLeft className="w-6 h-6 text-slate-800" strokeWidth={2} />
                </Link>
                <h1 className="text-lg font-bold text-slate-900">접종/투약 기록</h1>
            </header>

            <main className="px-6 pt-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

                {/* Next Schedule Hero Card */}
                <section className="relative overflow-hidden bg-gradient-to-br from-green-500 to-emerald-600 rounded-[32px] p-8 text-white shadow-xl shadow-green-500/20">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />

                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-6">
                            <div className="bg-white/20 backdrop-blur-md rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider">
                                Next Vaccine
                            </div>
                            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                                <Clock className="w-6 h-6 text-white" />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <div className="flex items-baseline gap-2">
                                <h2 className="text-3xl font-black">종합백신 5차</h2>
                                <span className="text-2xl font-bold text-green-100">D-12</span>
                            </div>
                            <p className="text-green-50 font-medium">2026년 2월 24일 예정</p>
                        </div>
                    </div>
                </section>

                {/* Timeline Section */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-slate-900">최근 기록</h3>
                        <button className="text-sm font-bold text-blue-600 hover:bg-blue-50 px-3 py-1 rounded-full transition-colors">
                            전체보기
                        </button>
                    </div>

                    <div className="relative border-l-2 border-slate-200 ml-4 space-y-8 pb-4">
                        {/* Timeline Item 1 */}
                        <div className="relative pl-8 group">
                            <div className="absolute -left-[9px] top-1 w-4 h-4 bg-white border-4 border-green-500 rounded-full group-hover:scale-125 transition-transform" />
                            <div className="bg-white p-5 rounded-[24px] border border-slate-100 shadow-sm hover:shadow-md transition-all">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className="bg-green-50 text-green-600 text-[10px] font-bold px-2 py-1 rounded-full uppercase">Vaccine</span>
                                        <span className="text-slate-400 text-xs font-medium">2024. 01. 10</span>
                                    </div>
                                </div>
                                <h4 className="text-lg font-bold text-slate-900 mb-1">인플루엔자 접종</h4>
                                <p className="text-slate-500 text-sm">서울 튼튼 동물병원</p>
                            </div>
                        </div>

                        {/* Timeline Item 2 */}
                        <div className="relative pl-8 group">
                            <div className="absolute -left-[9px] top-1 w-4 h-4 bg-white border-4 border-blue-500 rounded-full group-hover:scale-125 transition-transform" />
                            <div className="bg-white p-5 rounded-[24px] border border-slate-100 shadow-sm hover:shadow-md transition-all">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-1 rounded-full uppercase">Check-up</span>
                                        <span className="text-slate-400 text-xs font-medium">2023. 12. 15</span>
                                    </div>
                                </div>
                                <h4 className="text-lg font-bold text-slate-900 mb-1">정기 건강검진</h4>
                                <p className="text-slate-500 text-sm">체중 4.5kg, 특이사항 없음</p>
                            </div>
                        </div>

                        {/* Timeline Item 3 */}
                        <div className="relative pl-8 group">
                            <div className="absolute -left-[9px] top-1 w-4 h-4 bg-white border-4 border-orange-400 rounded-full group-hover:scale-125 transition-transform" />
                            <div className="bg-white p-5 rounded-[24px] border border-slate-100 shadow-sm hover:shadow-md transition-all">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className="bg-orange-50 text-orange-600 text-[10px] font-bold px-2 py-1 rounded-full uppercase">Medicine</span>
                                        <span className="text-slate-400 text-xs font-medium">2023. 11. 20</span>
                                    </div>
                                </div>
                                <h4 className="text-lg font-bold text-slate-900 mb-1">심장사상충 예방</h4>
                                <p className="text-slate-500 text-sm">넥스가드 스펙트라 투여</p>
                            </div>
                        </div>

                    </div>
                </section>
            </main>
        </div>
    );
}
