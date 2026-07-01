'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();
  if (pathname.startsWith('/chat')) return null;

  return (
    <footer className="w-full border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white font-bold text-sm">
                V
              </div>
              <span className="font-bold text-lg text-zinc-900 dark:text-white">ViChae</span>
            </div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
              비우고 채우는 가치 있는 거래.<br />
              합리적인 중고 라이프를 시작하세요.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 md:col-span-2">
            {/* Quick Links */}
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-3">바로가기</h3>
              <div className="flex flex-col gap-2">
                <Link href="/products" className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">곳간 채우기</Link>
                <Link href="/sell" className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">판매하기</Link>
                <Link href="/login" className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">로그인</Link>
              </div>
            </div>

            {/* Info */}
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-3">고객지원</h3>
              <div className="flex flex-col gap-2">
                <span className="text-sm text-zinc-500 dark:text-zinc-400">이용약관</span>
                <span className="text-sm text-zinc-500 dark:text-zinc-400">개인정보처리방침</span>
                <span className="text-sm text-zinc-500 dark:text-zinc-400">문의하기</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800 text-center text-xs text-zinc-400 dark:text-zinc-500">
          © 2025 ViChae. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
