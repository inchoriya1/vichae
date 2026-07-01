'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { createProduct } from './actions';
import { useRouter } from 'next/navigation';

export default function SellPage() {
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleImageAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...newFiles]);
      const newUrls = newFiles.map((f) => URL.createObjectURL(f));
      setPreviewUrls((prev) => [...prev, ...newUrls]);
    }
    // input 리셋 (같은 파일 재선택 가능)
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (idx: number) => {
    URL.revokeObjectURL(previewUrls[idx]);
    setFiles((prev) => prev.filter((_, i) => i !== idx));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const form = e.currentTarget;
      const formData = new FormData();
      formData.append('title', (form.elements.namedItem('title') as HTMLInputElement).value);
      formData.append('price', (form.elements.namedItem('price') as HTMLInputElement).value);
      formData.append('description', (form.elements.namedItem('description') as HTMLTextAreaElement).value);
      formData.append('location', (form.elements.namedItem('location') as HTMLInputElement).value);
      
      files.forEach((file) => {
        formData.append('images', file);
      });

      const result = await createProduct(formData);
      if (result?.error) {
        setErrorMsg(result.error);
      }
    } catch {
      // redirect가 에러를 throw할 수 있음 - 정상 동작
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto pb-20 animate-fade-in-up">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
          내 물건 팔기
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1">
          사진과 함께 상품 정보를 입력해주세요.
        </p>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm font-medium flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 flex-shrink-0">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Image Upload Section */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6">
          <label className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
            상품 이미지 <span className="text-zinc-400 font-normal">({previewUrls.length}/10)</span>
          </label>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {/* Upload Button */}
            <label className="flex-shrink-0 w-28 h-28 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500 dark:hover:border-emerald-500 transition-all hover:bg-emerald-50/50 dark:hover:bg-emerald-500/5 group">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7 text-zinc-400 group-hover:text-emerald-500 mb-1 transition-colors">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              <span className="text-xs text-zinc-400 group-hover:text-emerald-500 transition-colors">사진 추가</span>
              <input ref={fileInputRef} type="file" className="hidden" accept="image/*" multiple onChange={handleImageAdd} />
            </label>

            {/* Image Previews */}
            {previewUrls.map((url, idx) => (
              <div key={idx} className="relative flex-shrink-0 w-28 h-28 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 group">
                <Image src={url} alt={`preview-${idx}`} fill className="object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute top-1.5 right-1.5 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 hover:bg-black/80 transition-all"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                    <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                  </svg>
                </button>
                {idx === 0 && (
                  <div className="absolute bottom-0 left-0 right-0 bg-emerald-600 text-white text-[10px] font-bold text-center py-0.5">
                    대표
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Fields */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
              제목 <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              maxLength={40}
              placeholder="상품 제목을 입력해주세요 (최대 40자)"
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent focus:bg-white dark:focus:bg-zinc-900 transition-all"
            />
          </div>

          {/* Price */}
          <div>
            <label htmlFor="price" className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
              가격 <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                id="price"
                name="price"
                required
                min="0"
                placeholder="가격을 입력해주세요"
                className="w-full pl-4 pr-12 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent focus:bg-white dark:focus:bg-zinc-900 transition-all"
              />
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-zinc-400 font-medium">
                원
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <label htmlFor="location" className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
              거래 위치
            </label>
            <input
              type="text"
              id="location"
              name="location"
              placeholder="예: 강남구 역삼동"
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent focus:bg-white dark:focus:bg-zinc-900 transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
              자세한 설명
            </label>
            <textarea
              id="description"
              name="description"
              rows={6}
              placeholder="상품에 대한 자세한 설명을 적어주세요.&#10;(예: 구매 시기, 사용 기간, 하자 여부 등)"
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent focus:bg-white dark:focus:bg-zinc-900 transition-all resize-none"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-lg font-bold rounded-2xl shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              업로드 중...
            </span>
          ) : '등록하기'}
        </button>
      </form>
    </div>
  );
}
