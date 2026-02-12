"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, User, Bell, Shield, HelpCircle, LogOut, FileText, Dog, LogIn } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { supabase } from '@/lib/supabase';

export default function SettingsPage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const checkUser = async () => {
            // 1. Supabase 세션 확인
            const { data: { session } } = await supabase.auth.getSession();

            if (session?.user) {
                const metadata = session.user.user_metadata;
                setUser({
                    userName: metadata.full_name || metadata.name || session.user.email?.split('@')[0],
                    petName: metadata.petName || '우리 아이',
                    email: session.user.email
                });
            } else {
                // 2. localStorage 확인
                const saved = localStorage.getItem('pawly_user');
                if (saved) setUser(JSON.parse(saved));
            }
        };

        checkUser();
    }, []);

    const handleLogout = async () => {
        if (confirm('정말 로그아웃 하시겠습니까?')) {
            await supabase.auth.signOut();
            localStorage.removeItem('pawly_user');
            setUser(null);
            router.push('/');
        }
    };

    return (
        <div className="w-full bg-slate-50 min-h-screen font-sans text-slate-800 relative pb-24">
            {/* Header */}
            <header className="sticky top-0 w-full bg-white/80 backdrop-blur-xl border-b border-slate-100 z-50 px-6 h-16 flex items-center gap-4">
                <Link href="/" className="w-10 h-10 -ml-2 flex items-center justify-center rounded-full hover:bg-slate-50 transition-colors">
                    <ChevronLeft className="w-6 h-6 text-slate-800" strokeWidth={2} />
                </Link>
                <h1 className="text-lg font-bold text-slate-900">설정</h1>
            </header>

            <main className="px-6 pt-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

                {/* Profile Section */}
                <section className="flex items-center gap-4 bg-white p-5 rounded-[24px] border border-slate-100 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16" />
                    <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-3xl shadow-inner text-blue-500 relative z-10 font-bold">
                        {user ? '🐶' : <User className="w-8 h-8" />}
                    </div>
                    <div className="flex-1 relative z-10">
                        <h2 className="text-xl font-black text-slate-900">{user ? user.userName : '게스트'}</h2>
                        <p className="text-sm font-medium text-slate-400">{user ? `${user.petName}의 보호자` : '로그인하고 기록을 저장하세요'}</p>
                    </div>
                    {user && (
                        <button className="px-4 py-2 bg-slate-50 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-500 transition-colors relative z-10 border border-slate-100">
                            Edit
                        </button>
                    )}
                </section>

                {/* Group 1: Pet Management */}
                <section className="space-y-3">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider ml-2">Pet Management</h3>
                    <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden">
                        <button className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors text-left group">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500">
                                    <Dog className="w-5 h-5" />
                                </div>
                                <span className="font-bold text-slate-700 group-hover:text-slate-900">우리 아이 관리</span>
                            </div>
                            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-500" />
                        </button>
                    </div>
                </section>

                {/* Group 2: App Settings */}
                <section className="space-y-3">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider ml-2">App Settings</h3>
                    <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-50">

                        {/* Notification */}
                        <div className="w-full flex items-center justify-between p-5">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
                                    <Bell className="w-5 h-5" />
                                </div>
                                <span className="font-bold text-slate-700">푸시 알림</span>
                            </div>
                            <div className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" defaultChecked />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </div>
                        </div>

                        {/* Privacy */}
                        <button className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors text-left group">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-500">
                                    <Shield className="w-5 h-5" />
                                </div>
                                <span className="font-bold text-slate-700 group-hover:text-slate-900">개인정보 처리방침</span>
                            </div>
                            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-500" />
                        </button>

                        {/* Help */}
                        <button className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors text-left group">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-500">
                                    <HelpCircle className="w-5 h-5" />
                                </div>
                                <span className="font-bold text-slate-700 group-hover:text-slate-900">고객센터 / 도움말</span>
                            </div>
                            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-500" />
                        </button>
                    </div>
                </section>

                {/* Group 3: Account */}
                <section className="space-y-3">
                    <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden">
                        {user ? (
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center justify-between p-5 hover:bg-red-50 transition-colors text-left group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-500 group-hover:bg-red-100 transition-colors">
                                        <LogOut className="w-5 h-5" />
                                    </div>
                                    <span className="font-bold text-slate-700 group-hover:text-red-600 transition-colors">로그아웃</span>
                                </div>
                            </button>
                        ) : (
                            <Link
                                href="/login"
                                className="w-full flex items-center justify-between p-5 hover:bg-blue-50 transition-colors text-left group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 group-hover:bg-blue-100 transition-colors">
                                        <LogIn className="w-5 h-5" />
                                    </div>
                                    <span className="font-bold text-slate-700 group-hover:text-blue-600 transition-colors">로그인 / 회원가입</span>
                                </div>
                                <ChevronRight className="w-5 h-5 text-slate-300" />
                            </Link>
                        )}
                    </div>
                    <p className="text-center text-[10px] font-bold text-slate-300 mt-4 uppercase tracking-widest">Version 1.0.0 • Build 2026.02.12</p>
                </section>

            </main>
        </div>
    );
}
