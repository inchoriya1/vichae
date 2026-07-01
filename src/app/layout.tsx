import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ViChae | 비우고채우고 - 중고거래 플랫폼",
  description: "안 쓰는 물건을 비우고 필요한 물건으로 채우는 중고거래 플랫폼. 합리적인 중고 라이프를 시작하세요.",
  keywords: ["중고거래", "중고마켓", "비우고채우고", "ViChae"],
  openGraph: {
    title: "ViChae | 비우고채우고",
    description: "안 쓰는 물건을 비우고 필요한 물건으로 채우는 중고거래 플랫폼. 합리적인 중고 라이프를 시작하세요.",
    url: "https://vichae.vercel.app",
    siteName: "ViChae",
    images: [
      {
        url: "https://vichae.vercel.app/og-default.jpg", // 기본 OG 이미지 (추후 추가 가능)
        width: 1200,
        height: 630,
        alt: "ViChae 커버 이미지",
      },
    ],
    locale: "ko_KR",
    type: "website",
  },
};

import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  let isRestricted = false;
  let restrictionMessage = '';

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('account_status, suspended_until')
      .eq('id', user.id)
      .single();

    if (profile) {
      if (profile.account_status === 'banned') {
        isRestricted = true;
        restrictionMessage = '영구 정지된 계정입니다. 서비스 이용이 불가능합니다.';
      } else if (profile.account_status === 'suspended' && profile.suspended_until) {
        const untilDate = new Date(profile.suspended_until);
        if (untilDate > new Date()) {
          isRestricted = true;
          restrictionMessage = `기간 정지 상태입니다. (${untilDate.toLocaleDateString()}까지 이용 제한)`;
        } else {
          // 정지 기간이 지났으면 상태 원상복구 (비동기 처리)
          supabase.from('profiles').update({ account_status: 'active', suspended_until: null }).eq('id', user.id).then();
        }
      }
    }
  }

  if (isRestricted) {
    return (
      <html lang="ko" className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <body className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 max-w-md w-full shadow-2xl text-center border border-zinc-200 dark:border-zinc-800">
            <div className="w-20 h-20 bg-rose-100 dark:bg-rose-500/20 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-10 h-10">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">서비스 이용 제한 안내</h1>
            <p className="text-rose-600 font-semibold mb-6">{restrictionMessage}</p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-8 leading-relaxed">
              운영원칙 위반으로 인해 서비스 이용이 제한되었습니다.<br />
              이의제기가 필요하신 경우 고객센터로 문의해주세요.
            </p>
            <form action={async () => {
              'use server';
              const sb = await createClient();
              await sb.auth.signOut();
            }}>
              <button type="submit" className="w-full py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold rounded-xl transition-transform active:scale-95">
                로그아웃
              </button>
            </form>
          </div>
        </body>
      </html>
    );
  }

  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <body className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-sans selection:bg-emerald-500/30">
        <NavBar />
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
