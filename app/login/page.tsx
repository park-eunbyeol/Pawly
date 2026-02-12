"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Mail, Lock, User, Heart, ChevronLeft, ArrowRight, Sparkles } from 'lucide-react';

import { supabase } from '@/lib/supabase';

export default function LoginPage() {
    const [mode, setMode] = useState<'login' | 'signup'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [userName, setUserName] = useState('');
    const [petName, setPetName] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // 실제로는 Supabase나 API 연동 가이드에 따라 처리
        localStorage.setItem('pawly_user', JSON.stringify({ userName, petName, email }));
        alert(mode === 'login' ? '로그인되었습니다!' : '회원가입이 완료되었습니다!');
        window.location.href = '/';
    };

    const handleSocialLogin = async (provider: 'kakao' | 'google') => {
        try {
            const options: any = {
                redirectTo: `${window.location.origin}/auth/callback`,
            };

            // 카카오의 경우 이메일 권한이 없으면 에러가 나므로, 명시적으로 닉네임 정보만 요청합니다.
            if (provider === 'kakao') {
                options.scopes = 'profile_nickname,profile_image';
            }

            const { error } = await supabase.auth.signInWithOAuth({
                provider,
                options,
            });
            if (error) throw error;
        } catch (error: any) {
            alert(`소셜 로그인 중 오류가 발생했습니다: ${error.message}`);
        }
    };

    return (
        <div className="min-h-screen bg-white font-sans text-slate-900 flex flex-col">
            {/* Header */}
            <header className="px-6 h-16 flex items-center">
                <Link href="/" className="w-10 h-10 -ml-2 flex items-center justify-center rounded-full hover:bg-slate-50 transition-colors">
                    <ChevronLeft className="w-6 h-6 text-slate-800" strokeWidth={2.5} />
                </Link>
            </header>

            <main className="flex-1 px-8 pt-4 pb-12 flex flex-col max-w-[500px] mx-auto w-full">
                {/* Hero Section */}
                <div className="mb-12 space-y-4">
                    <div className="w-16 h-16 bg-blue-600 rounded-[24px] flex items-center justify-center text-white shadow-xl shadow-blue-500/20 mb-6">
                        <Heart className="w-8 h-8 fill-current" />
                    </div>
                    <h1 className="text-3xl font-black tracking-tight leading-tight">
                        {mode === 'login' ? (
                            <>반가워요!<br />다시 보게 되어 기뻐요 🐾</>
                        ) : (
                            <>처음 뵙겠습니다!<br />아이와 보호자님의 정보를 알려주세요 ✨</>
                        )}
                    </h1>
                    <p className="text-slate-500 font-medium">
                        반려동물 건강 비서 Pawly와 함께<br />더 스마트하게 관리하세요.
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    {mode === 'signup' && (
                        <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">보호자 성함</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="text"
                                        value={userName}
                                        onChange={(e) => setUserName(e.target.value)}
                                        placeholder="김철수"
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-11 pr-4 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-300"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">아이 이름</label>
                                <div className="relative">
                                    <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="text"
                                        value={petName}
                                        onChange={(e) => setPetName(e.target.value)}
                                        placeholder="초코"
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-11 pr-4 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-300"
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">이메일 주소</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="hello@pawly.me"
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-11 pr-4 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-300"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">비밀번호</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-11 pr-4 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-300"
                                required
                            />
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-slate-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
                        >
                            {mode === 'login' ? '로그인하기' : '준비 완료! 가입하기'}
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </form>

                {/* Switch Mode */}
                <div className="mt-8 text-center text-sm font-bold text-slate-400">
                    {mode === 'login' ? (
                        <>
                            아직 회원이 아니신가요?{' '}
                            <button onClick={() => setMode('signup')} className="text-blue-600 hover:underline">회원가입</button>
                        </>
                    ) : (
                        <>
                            이미 계정이 있으신가요?{' '}
                            <button onClick={() => setMode('login')} className="text-blue-600 hover:underline">로그인</button>
                        </>
                    )}
                </div>

                {/* Social Login Separator */}
                <div className="mt-12 mb-8 flex items-center gap-4">
                    <div className="flex-1 h-px bg-slate-100" />
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">간편 로그인</span>
                    <div className="flex-1 h-px bg-slate-100" />
                </div>

                {/* Social Login Buttons */}
                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={() => handleSocialLogin('kakao')}
                        className="flex items-center justify-center gap-2 py-4 bg-[#FEE500] rounded-2xl font-black text-xs text-[#3C1E1E] active:scale-95 transition-all shadow-sm"
                    >
                        <span className="text-lg">K</span> 카카오
                    </button>
                    <button
                        onClick={() => handleSocialLogin('google')}
                        className="flex items-center justify-center gap-2 py-4 bg-white border border-slate-100 rounded-2xl font-black text-xs text-slate-700 shadow-sm active:scale-95 transition-all"
                    >
                        <span className="text-lg">G</span> Google
                    </button>
                </div>
            </main>
        </div>
    );
}
