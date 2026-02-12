"use client";

import Link from 'next/link';
import { useState } from 'react';

const categories = [
    { id: 'dog', name: '강아지', icon: '🐶' },
    { id: 'cat', name: '고양이', icon: '🐱' },
];

const specialPets = ['토끼', '고슴도치', '햄스터', '뱀', '앵무새'];

export default function SelectPetPage() {
    const [selectedPet, setSelectedPet] = useState<string | null>(null);

    return (
        <div className="w-full min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">

            <div className="max-w-[480px] mx-auto flex flex-col min-h-screen">
                <main className="flex-1 px-6 pt-10 space-y-12 pb-24">
                    {/* Screen Header */}
                    <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <p className="text-[10px] font-black text-[#4A90E2] uppercase tracking-[0.3em]">Step 01</p>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">어떤 아이가<br />아픈가요?</h2>
                    </div>

                    {/* Search Bar Placeholder - Native App Look */}
                    <div className="relative group animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300">🔍</div>
                        <input
                            type="text"
                            placeholder="아이의 축종을 검색해보세요"
                            className="w-full bg-slate-50 border border-slate-100 rounded-[24px] py-4 pl-12 pr-6 text-sm font-bold text-slate-600 focus:outline-none focus:border-blue-100 transition-all"
                        />
                    </div>

                    {/* Main Species Selection - Circular Grid */}
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none">Popular Species</p>
                        <div className="grid grid-cols-2 gap-4">
                            {categories.map((category) => (
                                <button
                                    key={category.id}
                                    onClick={() => setSelectedPet(category.id)}
                                    className={`group relative p-8 rounded-[40px] border-2 transition-all duration-300 flex flex-col items-center gap-4 ${selectedPet === category.id
                                        ? 'bg-blue-600 border-blue-600 shadow-xl shadow-blue-500/20'
                                        : 'bg-white border-slate-100 hover:border-blue-50'
                                        }`}
                                >
                                    <div className="text-4xl group-hover:scale-110 transition-transform">
                                        {category.icon}
                                    </div>
                                    <div className="text-center">
                                        <p className={`text-sm font-black ${selectedPet === category.id ? 'text-white' : 'text-slate-900'}`}>{category.name}</p>
                                        <p className={`text-[9px] font-bold ${selectedPet === category.id ? 'text-white/60' : 'text-slate-400'}`}>{category.id.toUpperCase()}</p>
                                    </div>
                                    {selectedPet === category.id && (
                                        <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white text-[10px]">✓</div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Special Pets - Horizontal Scroll */}
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
                        <div className="flex items-center justify-between">
                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none">Other Species</p>
                            <button className="text-[10px] font-black text-blue-500 uppercase">View All</button>
                        </div>
                        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-6 px-6">
                            {specialPets.map((pet) => (
                                <button
                                    key={pet}
                                    onClick={() => setSelectedPet(pet)}
                                    className={`shrink-0 h-16 px-6 rounded-2xl border-2 transition-all flex items-center justify-center gap-2 whitespace-nowrap ${selectedPet === pet
                                        ? 'bg-blue-600 border-blue-600 text-white shadow-lg'
                                        : 'bg-white border-slate-50 text-slate-400 font-bold text-xs'
                                        }`}
                                >
                                    <span>{pet}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Bottom Action Button - Floating Style in Container */}
                    <div className="pt-6">
                        <Link href={selectedPet ? `/emergency?pet=${selectedPet}` : "#"} className="block">
                            <button
                                disabled={!selectedPet}
                                className={`w-full py-8 rounded-[36px] text-xl font-black transition-all shadow-2xl ${selectedPet
                                    ? 'bg-slate-900 text-white shadow-slate-200 active:scale-[0.98]'
                                    : 'bg-slate-50 text-slate-200 cursor-not-allowed shadow-none'
                                    }`}
                            >
                                {selectedPet ? '진단 시작하기' : '아이를 선택해주세요'}
                            </button>
                        </Link>
                    </div>
                </main>
            </div>
        </div>
    );
}
