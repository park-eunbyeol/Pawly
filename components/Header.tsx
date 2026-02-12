"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { Bell, User, Menu, X, Home, Syringe, Bone, Settings, LogOut, ChevronRight, LogIn } from 'lucide-react';
import { usePushNotifications } from './PushNotificationManager';

import { supabase } from '@/lib/supabase';

export default function Header() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isNotiOpen, setIsNotiOpen] = useState(false);
    const { permission, requestPermission, showLocalNotification, notifications, clearNotifications } = usePushNotifications();

    // 사용자 정보 상태 관리
    const [userInfo, setUserInfo] = useState<any>(null);

    useEffect(() => {
        const checkUser = async () => {
            // 1. Supabase 세션 확인
            const { data: { session } } = await supabase.auth.getSession();

            if (session?.user) {
                const metadata = session.user.user_metadata;
                setUserInfo({
                    userName: metadata.full_name || metadata.name || session.user.email?.split('@')[0],
                    petName: metadata.petName || '우리 아이',
                    email: session.user.email
                });
            } else {
                // 2. localStorage 확인
                const saved = localStorage.getItem('pawly_user');
                if (saved) setUserInfo(JSON.parse(saved));
                else setUserInfo(null);
            }
        };

        if (isSidebarOpen) checkUser();
    }, [isSidebarOpen]); // 사이드바가 열릴 때마다 최신 상태 확인

    const handleLogout = async () => {
        if (confirm('정말 로그아웃 하시겠습니까?')) {
            await supabase.auth.signOut();
            localStorage.removeItem('pawly_user');
            setUserInfo(null);
            setIsSidebarOpen(false);
            window.location.href = '/';
        }
    };

    return (
        <>
            <header className="sticky top-0 w-full bg-white/80 backdrop-blur-xl border-b border-slate-100 z-50">
                <div className="px-6 h-16 flex items-center justify-between relative">
                    {/* Left: Hamburger Menu */}
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-900 hover:bg-slate-200 transition-colors z-10"
                    >
                        <Menu className="w-6 h-6" strokeWidth={2} />
                    </button>

                    {/* Center: Logo */}
                    <Link href="/" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 group">
                        <div className="relative h-12 w-40 group-active:scale-95 transition-transform duration-300">
                            <Image
                                src="/logo.png"
                                alt="Pawly Logo"
                                fill
                                sizes="160px"
                                className="object-contain object-center"
                                priority
                            />
                        </div>
                    </Link>

                    {/* Right: Notification */}
                    <div className="flex items-center gap-2 z-10">
                        <div className="relative">
                            <button
                                onClick={async () => {
                                    if (permission !== 'granted') {
                                        const res = await requestPermission();
                                        if (res === 'granted') {
                                            showLocalNotification('Pawly 알림 활성화', '이제부터 푸시 알림을 받으실 수 있습니다! 🐾');
                                        }
                                    } else {
                                        setIsNotiOpen(!isNotiOpen);
                                    }
                                }}
                                className="w-10 h-10 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors relative"
                            >
                                <Bell className="w-6 h-6" strokeWidth={2} />
                                {notifications.length > 0 && permission === 'granted' && (
                                    <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white animate-pulse"></span>
                                )}
                                {permission !== 'granted' && (
                                    <span className="absolute top-2 right-2.5 w-2 h-2 bg-slate-400 rounded-full border border-white"></span>
                                )}
                            </button>

                            {/* Notification Popover */}
                            {isNotiOpen && (
                                <>
                                    <div className="fixed inset-0 z-[60]" onClick={() => setIsNotiOpen(false)} />
                                    <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-100 z-[70] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                        <div className="p-4 border-b border-slate-50 flex justify-between items-center">
                                            <h3 className="font-bold text-slate-900 text-sm">알림</h3>
                                            <button
                                                onClick={clearNotifications}
                                                className="text-[10px] font-bold text-slate-400 hover:text-red-500 uppercase tracking-wider"
                                            >
                                                전체 삭제
                                            </button>
                                        </div>
                                        <div className="max-h-80 overflow-y-auto">
                                            {notifications.length > 0 ? (
                                                notifications.map((n: any) => (
                                                    <div key={n.id} className="p-4 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                                                        <div className="flex justify-between items-start mb-1">
                                                            <p className="font-bold text-xs text-slate-900">{n.title}</p>
                                                            <span className="text-[10px] text-slate-400">{n.time}</span>
                                                        </div>
                                                        <p className="text-xs text-slate-500 leading-relaxed">{n.body}</p>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="p-8 text-center">
                                                    <Bell className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                                                    <p className="text-xs text-slate-400 font-medium">새로운 알림이 없습니다.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-[60] backdrop-blur-sm transition-opacity"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar Drawer */}
            <div className={`fixed top-0 right-0 h-full w-[80%] max-w-sm bg-white z-[70] shadow-2xl transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="p-6 h-full flex flex-col">
                    {/* Sidebar Header */}
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl font-bold text-slate-900">Menu</h2>
                        <button
                            onClick={() => setIsSidebarOpen(false)}
                            className="p-2 -mr-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* User Profile Summary */}
                    <div className="bg-slate-50 p-5 rounded-[24px] mb-8 border border-slate-100 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full -mr-8 -mt-8" />

                        {userInfo ? (
                            <div className="flex items-center gap-4 relative z-10">
                                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 text-blue-500">
                                    <span className="text-2xl">🐶</span>
                                </div>
                                <div>
                                    <div className="flex items-center gap-1 mb-0.5">
                                        <span className="font-black text-slate-900 text-lg">{userInfo.petName}</span>
                                        <span className="text-xs font-bold text-slate-400">🐾</span>
                                    </div>
                                    <p className="text-xs font-bold text-slate-500 flex items-center gap-1">
                                        보호자 <span className="text-slate-900">{userInfo.userName}님</span>
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="relative z-10 space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 text-slate-300">
                                        <User className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-slate-900">게스트님, 안녕하세요!</p>
                                        <p className="text-[10px] font-bold text-slate-400">기록을 안전하게 저장해 보세요 🐾</p>
                                    </div>
                                </div>
                                <Link
                                    href="/login"
                                    onClick={() => setIsSidebarOpen(false)}
                                    className="flex items-center justify-center gap-2 w-full py-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-colors"
                                >
                                    로그인 / 회원가입 <ChevronRight className="w-4 h-4" />
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Navigation Links */}
                    <nav className="space-y-2 flex-1">
                        <Link href="/" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-4 p-4 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors font-medium">
                            <Home className="w-5 h-5" />
                            <span>홈</span>
                        </Link>
                        <Link href="/history" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-4 p-4 rounded-xl text-slate-600 hover:bg-green-50 hover:text-green-700 transition-colors font-medium">
                            <Syringe className="w-5 h-5" />
                            <span>접종 기록</span>
                        </Link>
                        <Link href="/nutrient" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-4 p-4 rounded-xl text-slate-600 hover:bg-orange-50 hover:text-orange-700 transition-colors font-medium">
                            <Bone className="w-5 h-5" />
                            <span>수분/영양 관리</span>
                        </Link>
                        <Link href="/settings" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-4 p-4 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors font-medium">
                            <Settings className="w-5 h-5" />
                            <span>설정</span>
                        </Link>
                    </nav>

                    {/* Footer / Logout */}
                    {userInfo && (
                        <div className="pt-6 border-t border-slate-100">
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 text-slate-400 hover:text-red-500 transition-colors px-4 py-2 w-full font-medium text-sm"
                            >
                                <LogOut className="w-4 h-4" />
                                <span>로그아웃</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}