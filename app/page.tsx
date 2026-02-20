"use client";

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, User, Heart } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function HomePage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkUser = async () => {
      // 1. Supabase 세션 확인 (소셜 로그인용)
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        const metadata = session.user.user_metadata;
        setUser({
          userName: metadata.full_name || metadata.name || session.user.email?.split('@')[0],
          petName: metadata.petName || '우리 아이', // 소셜 로그인은 아직 아이 이름이 없음
          email: session.user.email
        });
      } else {
        // 2. localStorage 확인 (일반 로그인/레거시용)
        const saved = localStorage.getItem('pawly_user');
        if (saved) setUser(JSON.parse(saved));
      }
    };

    checkUser();
  }, []);

  return (
    <div className="w-full bg-slate-50 font-sans text-slate-800 relative overflow-hidden min-h-screen flex flex-col">
      {/* Background Ambient Effects */}
      <div className="absolute top-0 right-0 w-[80%] h-[60%] bg-gradient-to-bl from-blue-100/40 via-purple-50/20 to-transparent pointer-events-none -z-10 blur-3xl opacity-60" />
      <div className="absolute top-20 left-[-10%] w-[50%] h-[50%] bg-indigo-50/40 rounded-full blur-[120px] pointer-events-none -z-10" />

      <main className="flex-1 w-full px-6 flex flex-col items-center justify-center text-center animate-in fade-in duration-700 space-y-8 pb-32">

        {/* Logo & Text Content */}
        <div className="space-y-6">
          <div className="relative h-24 w-60 mx-auto opacity-90 transition-transform hover:scale-105 duration-300">
            <Image
              src="/logo.png"
              alt="Pawly"
              fill
              sizes="240px"
              priority
              className="object-contain object-center"
            />
          </div>

          <div className="space-y-4">
            {user && (
              <div className="animate-in zoom-in-95 duration-500 inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider mb-2 border border-blue-100">
                <Heart className="w-3 h-3 fill-current" />
                {user.petName} & {user.userName}
              </div>
            )}

            <h1 className="text-4xl font-black text-slate-900 leading-tight tracking-tight">
              반려동물을 위한<br />
              <span className="text-blue-600">응급Q&A 챗봇</span>
            </h1>
            <p className="text-lg text-slate-500 font-medium leading-relaxed max-w-[300px] mx-auto">
              쉽고 빠르게<br />
              응급 도우미를 만나보세요
            </p>
          </div>
        </div>

      </main>

      {/* Bottom Button Area */}
      <div className="fixed bottom-[140px] left-0 right-0 px-6 w-full max-w-[600px] mx-auto z-20">
        <Link
          href="/select-pet"
          className="group block w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl py-4 shadow-xl shadow-blue-500/30 active:scale-[0.98] transition-all duration-300 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          <div className="relative flex items-center justify-center gap-2">
            <span className="text-xl font-bold tracking-wide">시작하기</span>
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" strokeWidth={2.5} />
          </div>
        </Link>
      </div>

    </div>
  );
}
