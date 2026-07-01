'use client';

import { applySanction, dismissReport } from '@/app/admin/actions';

export default function ReportActions({ reportId, reportedId }: { reportId: string, reportedId: string }) {
  const handleWarning = async () => {
    if (!confirm('해당 유저에게 경고(매너온도 차감) 조치를 하시겠습니까?')) return;
    try {
      await applySanction(reportId, reportedId, 'warning');
      alert('경고 처리되었습니다.');
    } catch (e: any) { alert(e.message); }
  };

  const handleSuspend = async () => {
    const daysStr = prompt('정지할 기간(일)을 입력하세요. (예: 3, 7, 30)', '3');
    if (!daysStr) return;
    const days = parseInt(daysStr, 10);
    if (isNaN(days) || days <= 0) return alert('올바른 숫자를 입력하세요.');

    if (!confirm(`해당 유저를 ${days}일간 기간 정지하시겠습니까?`)) return;
    try {
      await applySanction(reportId, reportedId, 'suspend', days);
      alert('기간 정지 처리되었습니다.');
    } catch (e: any) { alert(e.message); }
  };

  const handleBan = async () => {
    if (!confirm('해당 유저를 영구 정지(강제 탈퇴)하시겠습니까?')) return;
    try {
      await applySanction(reportId, reportedId, 'ban');
      alert('영구 정지 처리되었습니다.');
    } catch (e: any) { alert(e.message); }
  };

  const handleDismiss = async () => {
    if (!confirm('이 신고를 무혐의(기각) 처리하시겠습니까?')) return;
    try {
      await dismissReport(reportId);
      alert('기각 처리되었습니다.');
    } catch (e: any) { alert(e.message); }
  };

  return (
    <div className="flex gap-2 flex-wrap mt-4">
      <button onClick={handleWarning} className="px-3 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-white text-xs font-bold rounded-lg transition-colors">
        경고 및 주의
      </button>
      <button onClick={handleSuspend} className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-lg transition-colors">
        이용 제한 (기간제)
      </button>
      <button onClick={handleBan} className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition-colors">
        영구 정지
      </button>
      <button onClick={handleDismiss} className="px-3 py-1.5 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-bold rounded-lg transition-colors">
        무혐의 (기각)
      </button>
    </div>
  );
}
