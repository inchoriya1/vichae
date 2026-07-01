import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import ReportActions from './ReportActions';

export const revalidate = 0;

export default async function AdminReportsPage() {
  const supabase = await createClient();
  
  // 1. 관리자 권한 확인
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();
    
  if (!profile?.is_admin) redirect('/');

  // 2. 신고 내역 조회
  const { data: reports } = await supabase
    .from('reports')
    .select(`
      id,
      reason,
      details,
      status,
      created_at,
      target_type,
      reporter:reporter_id (id, username, avatar_url),
      reported:reported_id (id, username, avatar_url, account_status, temperature)
    `)
    .order('created_at', { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6">신고 내역 관리</h1>
      
      {reports && reports.length > 0 ? (
        <div className="space-y-4">
          {reports.map((report: any) => (
            <div key={report.id} className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  report.status === 'pending' ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400' :
                  report.status === 'resolved' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' :
                  'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400'
                }`}>
                  {report.status === 'pending' ? '처리 대기중' : report.status === 'resolved' ? '처리 완료' : '기각됨'}
                </span>
                <span className="text-xs text-zinc-500">{new Date(report.created_at).toLocaleString()}</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 bg-zinc-50 dark:bg-zinc-950 p-4 rounded-2xl">
                <div>
                  <h4 className="text-xs font-semibold text-zinc-500 uppercase mb-2">신고자</h4>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-zinc-200 rounded-full flex items-center justify-center text-xs font-bold">
                      {report.reporter?.username?.charAt(0) || '?'}
                    </div>
                    <span className="text-sm font-medium text-zinc-900 dark:text-white">
                      {report.reporter?.username || '알 수 없음'}
                    </span>
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-rose-500 uppercase mb-2">피신고자 (대상)</h4>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-rose-200 text-rose-700 rounded-full flex items-center justify-center text-xs font-bold">
                      {report.reported?.username?.charAt(0) || '?'}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-zinc-900 dark:text-white">
                        {report.reported?.username || '알 수 없음'}
                      </span>
                      <span className="text-xs text-zinc-500">
                        상태: {report.reported?.account_status} / 매너온도: {report.reported?.temperature}°C
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="text-sm font-bold text-zinc-900 dark:text-white mb-1">신고 사유: {report.reason}</h4>
                {report.details && (
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-xl">
                    {report.details}
                  </p>
                )}
              </div>

              {report.status === 'pending' && report.reported && (
                <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
                  <h4 className="text-xs font-semibold text-zinc-500 uppercase mb-2">관리자 조치</h4>
                  <ReportActions reportId={report.id} reportedId={report.reported.id} />
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-3xl border-2 border-dashed border-zinc-200 dark:border-zinc-800">
          <p className="text-zinc-500">접수된 신고 내역이 없습니다.</p>
        </div>
      )}
    </div>
  );
}
