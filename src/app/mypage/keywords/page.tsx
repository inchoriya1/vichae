import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import Link from 'next/link';

export default async function KeywordsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // 내 키워드 목록 가져오기
  const { data: keywords } = await supabase
    .from('keywords')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  // 키워드 추가 서버 액션
  async function addKeyword(formData: FormData) {
    'use server';
    const supabaseServer = await createClient();
    const { data: { user: currentUser } } = await supabaseServer.auth.getUser();
    if (!currentUser) return;

    const keyword = formData.get('keyword') as string;
    if (!keyword || keyword.trim() === '') return;

    // 중복 체크 및 추가 (Postgres Unique 에러 방지 위해 upsert나 ignore 방식 사용 가능하지만 간단히 insert 시도)
    const { error } = await supabaseServer
      .from('keywords')
      .insert({ user_id: currentUser.id, keyword: keyword.trim() });
    
    if (!error) {
      revalidatePath('/mypage/keywords');
    }
  }

  // 키워드 삭제 서버 액션
  async function deleteKeyword(formData: FormData) {
    'use server';
    const supabaseServer = await createClient();
    const { data: { user: currentUser } } = await supabaseServer.auth.getUser();
    if (!currentUser) return;

    const id = formData.get('id') as string;
    await supabaseServer
      .from('keywords')
      .delete()
      .match({ id, user_id: currentUser.id });
    
    revalidatePath('/mypage/keywords');
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6 lg:px-8 animate-fade-in-up">
      
      {/* 헤더 부분 */}
      <div className="mb-8 flex items-center gap-4">
        <Link href="/mypage" className="p-2 -ml-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
            관심 키워드 설정
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1 text-sm">
            원하는 키워드를 등록하고 새 글 알림을 받아보세요.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 shadow-sm">
        <form action={addKeyword} className="flex gap-3 mb-8">
          <input
            type="text"
            name="keyword"
            placeholder="예: 아이패드, 맥북, 에어팟"
            maxLength={20}
            className="flex-1 px-5 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-zinc-900 dark:text-white transition-all placeholder:text-zinc-400"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-colors whitespace-nowrap active:scale-95"
          >
            추가
          </button>
        </form>

        <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">
          등록된 키워드 ({keywords?.length || 0}/10)
        </h3>

        <div className="flex flex-wrap gap-3">
          {keywords && keywords.length > 0 ? (
            keywords.map((k) => (
              <div
                key={k.id}
                className="inline-flex items-center gap-2 pl-4 pr-1 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 rounded-full"
              >
                <span className="text-emerald-700 dark:text-emerald-400 font-medium text-sm">
                  {k.keyword}
                </span>
                <form action={deleteKeyword}>
                  <input type="hidden" name="id" value={k.id} />
                  <button
                    type="submit"
                    className="p-1.5 rounded-full text-emerald-500 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                      <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                    </svg>
                  </button>
                </form>
              </div>
            ))
          ) : (
            <div className="text-zinc-500 dark:text-zinc-400 text-sm py-4">
              등록된 키워드가 없습니다.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
