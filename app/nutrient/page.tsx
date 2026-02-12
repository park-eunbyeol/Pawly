"use client";

import Link from 'next/link';
import { ChevronLeft, Droplets, Flame, Utensils, Plus, Coffee, Apple } from 'lucide-react';

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
                        {/* Log Item 1 */}
                        <div className="bg-white p-4 rounded-[24px] border border-slate-100 shadow-sm flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500">
                                    <Utensils className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800">아침 식사</h4>
                                    <p className="text-xs text-slate-500">오리젠 오리지널 40g</p>
                                </div>
                            </div>
                            <span className="font-bold text-slate-700">180 kcal</span>
                        </div>

                        {/* Log Item 2 */}
                        <div className="bg-white p-4 rounded-[24px] border border-slate-100 shadow-sm flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500">
                                    <Apple className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800">오후 간식</h4>
                                    <p className="text-xs text-slate-500">동결건조 북어 트릿 3개</p>
                                </div>
                            </div>
                            <span className="font-bold text-slate-700">45 kcal</span>
                        </div>

                        {/* Log Item 3 */}
                        <div className="bg-white p-4 rounded-[24px] border border-slate-100 shadow-sm flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500">
                                    <Coffee className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800">수분 섭취</h4>
                                    <p className="text-xs text-slate-500">오후 산책 후</p>
                                </div>
                            </div>
                            <span className="font-bold text-slate-700">120 ml</span>
                        </div>
                    </div>
                </section>
            </main>

            {/* Floating Action Button */}
            <button className="fixed bottom-[120px] right-6 sm:right-[calc(50%-270px)] w-14 h-14 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-orange-500/30 active:scale-95 transition-all z-[60]">
                <Plus className="w-7 h-7" strokeWidth={2.5} />
            </button>
        </div>
    );
}
