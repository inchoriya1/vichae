'use client';

import { useState } from 'react';
import { blockUser, reportUser } from '@/app/actions/user';
import { useRouter } from 'next/navigation';

export default function ProductActions({ 
  productId, 
  sellerId 
}: { 
  productId: string, 
  sellerId: string 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reason, setReason] = useState('사기 글이에요');
  const [details, setDetails] = useState('');
  const router = useRouter();

  const handleBlock = async () => {
    if (!confirm('이 사용자를 차단하시겠습니까? 차단하면 이 사용자의 게시글이 보이지 않습니다.')) return;
    try {
      await blockUser(sellerId);
      alert('차단되었습니다.');
      router.push('/products');
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleReport = async () => {
    try {
      await reportUser(sellerId, 'product', productId, reason, details);
      alert('신고가 접수되었습니다. 빠른 시일 내에 조치하겠습니다.');
      setIsReportOpen(false);
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-lg z-50 overflow-hidden">
            <button 
              onClick={() => { setIsOpen(false); setIsReportOpen(true); }}
              className="w-full text-left px-4 py-3 text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 font-medium transition-colors"
            >
              게시글/유저 신고하기
            </button>
            <button 
              onClick={() => { setIsOpen(false); handleBlock(); }}
              className="w-full text-left px-4 py-3 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 font-medium transition-colors border-t border-zinc-100 dark:border-zinc-800"
            >
              이 유저 차단하기
            </button>
          </div>
        </>
      )}

      {isReportOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-4">신고하기</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">신고 사유</label>
                <select value={reason} onChange={e => setReason(e.target.value)} className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-3 text-zinc-900 dark:text-white focus:ring-rose-500 focus:border-rose-500">
                  <option>사기 글이에요</option>
                  <option>불쾌감을 줘요</option>
                  <option>비매너 사용자예요</option>
                  <option>전문 판매업자 같아요</option>
                  <option>기타</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">상세 내용 (선택)</label>
                <textarea value={details} onChange={e => setDetails(e.target.value)} placeholder="신고 내용을 자세히 적어주세요." rows={3} className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-3 text-zinc-900 dark:text-white focus:ring-rose-500 focus:border-rose-500" />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setIsReportOpen(false)} className="px-5 py-2.5 rounded-xl font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                취소
              </button>
              <button onClick={handleReport} className="px-5 py-2.5 rounded-xl font-medium bg-rose-600 hover:bg-rose-500 text-white transition-colors">
                신고 접수
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
