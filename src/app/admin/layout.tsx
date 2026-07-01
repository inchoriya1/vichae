import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // 관리자 권한 확인
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  if (!profile?.is_admin) {
    // 관리자가 아니면 메인 페이지로 쫓아냄
    redirect('/');
  }

  return (
    <div className="flex flex-col md:flex-row gap-8 w-full max-w-7xl mx-auto pb-12 animate-fade-in-up">
      {/* 관리자 전용 사이드바 */}
      <aside className="w-full md:w-64 flex-shrink-0">
        <div className="bg-zinc-900 rounded-3xl p-6 text-white sticky top-24">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center font-bold text-xl shadow-lg">
              A
            </div>
            <div>
              <h2 className="font-bold text-lg">Admin Panel</h2>
              <p className="text-xs text-zinc-400">관리자 전용 대시보드</p>
            </div>
          </div>
          
          <nav className="flex flex-col gap-2">
            <Link href="/admin" className="px-4 py-3 hover:bg-white/10 rounded-xl font-medium text-sm flex items-center gap-3 transition-colors text-white">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-rose-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
              </svg>
              대시보드 홈
            </Link>
            <Link href="/admin/reports" className="px-4 py-3 hover:bg-white/10 rounded-xl font-medium text-sm flex items-center gap-3 transition-colors text-white">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-rose-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              신고 관리
            </Link>
          </nav>
        </div>
      </aside>

      {/* 관리자 메인 콘텐츠 영역 */}
      <div className="flex-1 min-w-0">
        {children}
      </div>
    </div>
  );
}
