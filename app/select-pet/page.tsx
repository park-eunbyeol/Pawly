"use client";

import Link from 'next/link';
import { useState } from 'react';

const categories = [
    { id: 'dog', name: '강아지', icon: '🐶' },
    { id: 'cat', name: '고양이', icon: '🐱' },
];

const specialPets = ['토끼', '고슴도치', '햄스터', '뱀', '앵무새', '거북이', '기니피그', '페럿', '도마뱀', '다람쥐', '친칠라', '이구아나'];

// 간단한 품종 매핑 (실제로는 더 많은 데이터가 필요하지만 예시로 주요 품종만 추가)
const breedMap: Record<string, string> = {
    '말티즈': 'dog', '푸들': 'dog', '포메라니안': 'dog', '치와와': 'dog', '시츄': 'dog',
    '골든리트리버': 'dog', '진돗개': 'dog', '비숑': 'dog',
    '코리안숏헤어': 'cat', '페르시안': 'cat', '러시안블루': 'cat', '샴': 'cat',
    '터키쉬앙고라': 'cat', '스핑크스': 'cat', '먼치킨': 'cat'
};

export default function SelectPetPage() {
    const [selectedPet, setSelectedPet] = useState<string | null>(null);
    const [showAllSpecies, setShowAllSpecies] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // 검색어에 따라 필터링된 특수동물 목록
    const filteredSpecialPets = specialPets.filter(pet =>
        pet.includes(searchTerm)
    );

    // 검색 핸들러
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const term = e.target.value;
        setSearchTerm(term);

        if (term) {
            setShowAllSpecies(true); // 검색 시 자동으로 펼치기

            // 품종 검색 시 해당 카테고리 자동 선택 (예: 말티즈 -> 강아지 선택됨)
            // 정확히 일치하거나 포함되는 경우 찾기
            const foundBreed = Object.keys(breedMap).find(breed => breed.includes(term));
            if (foundBreed) {
                setSelectedPet(breedMap[foundBreed]);
            }
        }
    };

    return (
        <div className="w-full min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">

            <div className="max-w-[480px] mx-auto flex flex-col min-h-screen">
                <main className="flex-1 px-6 pt-10 space-y-7 pb-12">
                    {/* Screen Header */}
                    <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <p className="text-[10px] font-black text-[#4A90E2] uppercase tracking-[0.3em]">Step 01</p>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">어떤 아이가<br />아픈가요?</h2>
                    </div>

                    {/* Search Bar Placeholder - Native App Look */}
                    <div className="relative group animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300">🔍</div>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={handleSearch}
                            placeholder="동물 종류나 품종을 검색해보세요"
                            className="w-full bg-white border border-slate-100 rounded-[24px] py-4 pl-12 pr-6 text-sm font-bold text-slate-600 focus:outline-none focus:border-blue-100 transition-all shadow-sm shadow-slate-100/50"
                        />
                    </div>

                    {/* Main Species Selection - Circular Grid */}
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none pl-1">Popular Species</p>
                        <div className="grid grid-cols-2 gap-4">
                            {categories.map((category) => (
                                <button
                                    key={category.id}
                                    onClick={() => setSelectedPet(category.id)}
                                    className={`group relative py-8 px-6 rounded-[32px] border transition-all duration-300 flex flex-col items-center gap-4 ${selectedPet === category.id
                                        ? 'bg-blue-600 border-blue-600 shadow-xl shadow-blue-500/20 translate-y-[-2px]'
                                        : 'bg-white border-slate-100 hover:border-blue-50 hover:bg-blue-50/10'
                                        }`}
                                >
                                    <div className="text-5xl group-hover:scale-110 transition-transform duration-300">
                                        {category.icon}
                                    </div>
                                    <div className="text-center space-y-0.5">
                                        <p className={`text-base font-black ${selectedPet === category.id ? 'text-white' : 'text-slate-900'}`}>{category.name}</p>
                                        <p className={`text-[10px] font-bold ${selectedPet === category.id ? 'text-white/60' : 'text-slate-400'}`}>{category.id.toUpperCase()}</p>
                                    </div>
                                    {selectedPet === category.id && (
                                        <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white text-[10px]">✓</div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Special Pets - Grid Selection */}
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
                        <div className="flex items-center justify-between pl-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Other Species</p>
                            <button
                                onClick={() => setShowAllSpecies(!showAllSpecies)}
                                className="text-[10px] font-black text-blue-500 uppercase hover:text-blue-600 transition-colors"
                            >
                                {showAllSpecies ? 'COLLAPSE' : 'VIEW ALL'}
                            </button>
                        </div>

                        {filteredSpecialPets.length > 0 ? (
                            <div className="grid grid-cols-3 gap-3">
                                {(showAllSpecies ? filteredSpecialPets : filteredSpecialPets.slice(0, 6)).map((pet) => (
                                    <button
                                        key={pet}
                                        onClick={() => setSelectedPet(pet)}
                                        className={`w-full h-14 rounded-2xl border transition-all flex items-center justify-center gap-2 text-[13px] ${selectedPet === pet
                                            ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20'
                                            : 'bg-white border-slate-100 text-slate-500 font-bold hover:border-blue-200 hover:bg-slate-50/50'
                                            }`}
                                    >
                                        <span>{pet}</span>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="py-8 text-center bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
                                <p className="text-xs text-slate-400 font-bold">검색 결과가 없습니다 😢</p>
                            </div>
                        )}
                    </div>

                    {/* Bottom Action Button - Floating Style in Container */}
                    <div className="pt-6 sticky bottom-6">
                        <Link href={selectedPet ? `/emergency?pet=${selectedPet}` : "#"} className="block">
                            <button
                                disabled={!selectedPet}
                                className={`w-full py-5 rounded-[28px] text-lg font-black transition-all shadow-xl ${selectedPet
                                    ? 'bg-slate-900 text-white shadow-slate-300 active:scale-[0.98]'
                                    : 'bg-white text-slate-300 border border-slate-100 cursor-not-allowed'
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
