'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function ErrorContent() {
    const searchParams = useSearchParams();
    const error = searchParams.get('error');
    const errorCode = searchParams.get('error_code');
    const errorDescription = searchParams.get('error_description');

    // URL 해시(#)에 있는 에러를 파싱하기 위한 로직 (클라이언트 사이드)
    // Next.js useSearchParams는 쿼리스트링(?)만 가져오므로, 해시가 있으면 JS로 읽어야 함.
    if (typeof window !== 'undefined' && window.location.hash) {
        const hashParams = new URLSearchParams(window.location.hash.slice(1));
        if (hashParams.get('error')) {
            return (
                <div className="text-center space-y-4">
                    <h2 className="text-xl font-bold text-red-600">
                        {hashParams.get('error') || '로그인 오류'}
                    </h2>
                    <p className="text-gray-700 font-medium">
                        {hashParams.get('error_description')?.replace(/\+/g, ' ') || '알 수 없는 오류가 발생했습니다.'}
                    </p>
                    <div className="text-sm text-gray-500 bg-gray-100 p-4 rounded text-left overflow-auto">
                        <p>Code: {hashParams.get('error_code')}</p>
                        <p>Detail: {hashParams.get('error_description')}</p>
                    </div>
                </div>
            )
        }
    }

    return (
        <div className="text-center space-y-4">
            <h2 className="text-xl font-bold text-red-600">
                {error || '로그인 오류 발생'}
            </h2>
            <p className="text-gray-700">
                {errorDescription || '로그인 처리 중 문제가 발생했습니다.'}
            </p>
            {errorCode && (
                <p className="text-sm text-gray-500">에러 코드: {errorCode}</p>
            )}
        </div>
    );
}

export default function AuthCodeErrorPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>

                <Suspense fallback={<p>에러 정보를 불러오는 중...</p>}>
                    <ErrorContent />
                </Suspense>

                <div className="mt-8">
                    <Link
                        href="/login"
                        className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-slate-900 hover:bg-slate-800 transition-colors"
                    >
                        로그인 페이지로 돌아가기
                    </Link>
                </div>
            </div>
        </div>
    );
}
