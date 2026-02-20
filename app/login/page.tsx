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

    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (mode === 'signup') {
            // 회원가입: 입력받은 정보로 새로 저장
            const userDataToSave = { userName, petName, email };
            localStorage.setItem('pawly_user', JSON.stringify(userDataToSave));
            alert('회원가입이 완료되었습니다! 로그인해주세요.');
            setMode('login');
            setPassword('');
        } else {
            // 로그인: 이메일은 업데이트하되, 이름 정보는 기존 것 유지 (없으면 기본값)
            const existingData = localStorage.getItem('pawly_user');
            const parsedData = existingData ? JSON.parse(existingData) : {};

            const userDataToSave = {
                email,
                userName: parsedData.userName || '보호자',
                petName: parsedData.petName || '우리 아이'
            };

            localStorage.setItem('pawly_user', JSON.stringify(userDataToSave));
            alert('로그인되었습니다!');
            window.location.href = '/';
        }
    };

    const handleSocialLogin = async (provider: 'kakao' | 'google') => {
        setIsLoading(true);
        try {
            const options: any = {
                redirectTo: `${window.location.origin}/auth/callback`,
            };

            // 핵심 수정: 카카오 로그인 시 이메일 등 불필요한 권한 요청을 막아 에러 방지
            if (provider === 'kakao') {
                options.queryParams = {
                    scope: 'profile_nickname profile_image',
                    prompt: 'login',
                };
            }

            const { error } = await supabase.auth.signInWithOAuth({
                provider,
                options,
            });
            if (error) throw error;
        } catch (error: any) {
            alert(`소셜 로그인 중 오류가 발생했습니다: ${error.message}`);
            setIsLoading(false);
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
                        disabled={isLoading}
                        className="relative flex items-center justify-center gap-2 py-4 bg-[#FEE500] hover:bg-[#FDD835] rounded-2xl transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:scale-100 group"
                    >
                        <svg className="w-5 h-5 absolute left-4" viewBox="0 0 24 24" fill="#3C1E1E">
                            <path d="M12 3C5.9 3 1 6.9 1 11.8c0 3.2 2.1 6 5.3 7.6-.1.6-.4 2.3-.5 2.6 0 0 0 .2.1.3.1.1.3.1.4.1.6 0 3.8-2.6 4.4-3 .5.1 1 .1 1.5.1 6 0 10.9-3.9 10.9-8.8S18.1 3 12 3z" />
                        </svg>
                        <span className="text-xs font-black text-[#3C1E1E]/90 pl-4">카카오 시작</span>
                    </button>
                    <button
                        onClick={() => handleSocialLogin('google')}
                        disabled={isLoading}
                        className="relative flex items-center justify-center gap-2 py-4 bg-white border border-slate-200 hover:bg-slate-50 rounded-2xl transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:scale-100 group"
                    >
                        <svg className="w-5 h-5 absolute left-4" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        <span className="text-xs font-black text-slate-600 pl-4">Google 시작</span>
                    </button>
                </div>
            </main>
        </div>
    );
}
