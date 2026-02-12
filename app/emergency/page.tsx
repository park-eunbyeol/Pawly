"use client";

import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import React, { useState, Suspense } from 'react';

const symptoms = [
    '구토', '설사', '기력저하', '식욕부진', '호흡곤란',
    '경련', '피부발진', '눈곱/눈충혈', '절뚝거림', '출혈'
];

function EmergencyContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pet = searchParams.get('pet');
    const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
    const [description, setDescription] = useState('');
    const [customSymptom, setCustomSymptom] = useState('');

    const categories = {
        "전신/행동": ["기력저하", "식욕부진", "발열", "체중감소", "과호흡", "음수량증가"],
        "소화기": ["구토", "설사", "혈변", "변비", "복부팽만", "침흘림"],
        "호흡기/순환기": ["기침", "재채기", "콧물", "호흡곤란", "청색증", "코피"],
        "피부/외과": ["가려움", "탈모", "발진", "출혈", "파행(절뚝거림)", "경련"]
    };

    const toggleSymptom = (symptom: string) => {
        setSelectedSymptoms(prev =>
            prev.includes(symptom)
                ? prev.filter(s => s !== symptom)
                : [...prev, symptom]
        );
    };

    const addCustomSymptom = () => {
        if (customSymptom.trim() !== '' && !selectedSymptoms.includes(customSymptom.trim())) {
            setSelectedSymptoms(prev => [...prev, customSymptom.trim()]);
            setCustomSymptom('');
        }
    };

    return (
        <main className="max-w-[480px] mx-auto flex flex-col min-h-screen">
            <main className="flex-1 px-6 pt-10 space-y-12 pb-24">
                {/* Screen Header */}
                <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <p className="text-[10px] font-black text-[#4A90E2] uppercase tracking-[0.3em]">Step 02</p>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">아이에게 어떤<br />증상이 있나요?</h2>
                </div>

                {/* Categorized Symptom Selection */}
                <div className="space-y-10">
                    {Object.entries(categories).map(([category, items], catIdx) => (
                        <div key={category} className={`space-y-4 animate-in fade-in slide-in-from-bottom-6 duration-700`} style={{ animationDelay: `${catIdx * 100}ms` }}>
                            <div className="flex items-center gap-3">
                                <div className="w-1.5 h-4 bg-blue-500 rounded-full" />
                                <h3 className="text-sm font-black text-slate-800">{category}</h3>
                            </div>
                            <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar -mx-6 px-6">
                                {items.map((item) => {
                                    const isSelected = selectedSymptoms.includes(item);
                                    return (
                                        <button
                                            key={item}
                                            onClick={() => toggleSymptom(item)}
                                            className={`shrink-0 h-14 px-6 rounded-2xl border-2 transition-all flex items-center justify-center gap-2 whitespace-nowrap ${isSelected
                                                ? 'bg-blue-600 border-blue-600 text-white shadow-lg'
                                                : 'bg-white border-slate-50 text-slate-500 font-bold text-xs'
                                                }`}
                                        >
                                            <span>{item}</span>
                                            {isSelected && <span className="text-[10px]">✕</span>}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Additional Details Section */}
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-400">
                    <div className="flex items-center justify-between">
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none">Additional Details</p>
                    </div>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="그 외에 보호자님이 관찰하신 특이사항이 있다면 적어주세요 (예: 밥을 안 먹은지 이틀 됐어요)"
                        className="w-full bg-slate-50 border border-slate-100 rounded-[32px] p-6 text-sm font-bold text-slate-600 focus:outline-none focus:border-blue-100 transition-all min-h-[160px] resize-none leading-relaxed"
                    />
                </div>

                {/* Selected Summary Tags */}
                {selectedSymptoms.length > 0 && (
                    <div className="space-y-4 animate-in zoom-in duration-500">
                        <p className="text-[10px] font-black text-[#4A90E2] uppercase tracking-widest">Selected Issues ({selectedSymptoms.length})</p>
                        <div className="flex flex-wrap gap-2">
                            {selectedSymptoms.map(tag => (
                                <div key={tag} className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-100 flex items-center gap-2 text-[10px] font-black">
                                    <span>{tag}</span>
                                    <button onClick={() => toggleSymptom(tag)} className="opacity-40 hover:opacity-100">✕</button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Action Button */}
                <div className="pt-6">
                    <button
                        onClick={() => {
                            if (selectedSymptoms.length > 0 || description.trim().length > 0) {
                                const params = new URLSearchParams();
                                if (pet) params.set('pet', pet);
                                if (selectedSymptoms.length > 0) params.set('symptoms', selectedSymptoms.join(','));
                                if (description.trim().length > 0) params.set('description', description);

                                router.push(`/result?${params.toString()}`);
                            }
                        }}
                        disabled={selectedSymptoms.length === 0 && description.trim().length === 0}
                        className={`w-full py-8 rounded-[36px] text-xl font-black transition-all shadow-2xl ${(selectedSymptoms.length > 0 || description.trim().length > 0)
                            ? 'bg-slate-900 text-white shadow-slate-200 active:scale-[0.98]'
                            : 'bg-slate-100 text-slate-200 cursor-not-allowed shadow-none'
                            }`}
                    >
                        {(selectedSymptoms.length > 0 || description.trim().length > 0) ? '분석 리포트 생성' : '증상 또는 내용을 입력해주세요'}
                    </button>
                </div>
            </main>
        </main>
    );
}

export default function EmergencyPage() {
    return (
        <Suspense fallback={
            <div className="w-full h-screen bg-slate-950 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
        }>
            <EmergencyContent />
        </Suspense>
    );
}
