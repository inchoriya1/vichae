'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function updateProduct(productId: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('로그인이 필요합니다.');
  }

  const title = formData.get('title') as string;
  const price = formData.get('price') as string;
  const description = formData.get('description') as string;
  const status = formData.get('status') as string;

  if (!title || !price || !description) {
    throw new Error('필수 항목을 모두 입력해주세요.');
  }

  // 본인 상품인지 확인
  const { data: product } = await supabase
    .from('products')
    .select('seller_id')
    .eq('id', productId)
    .single();

  if (product?.seller_id !== user.id) {
    throw new Error('수정 권한이 없습니다.');
  }

  const { error } = await supabase
    .from('products')
    .update({
      title,
      price: parseInt(price, 10),
      description,
      status
    })
    .eq('id', productId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/products/${productId}`);
  revalidatePath('/products');
  revalidatePath('/mypage');
  revalidatePath('/');
  
  redirect(`/products/${productId}`);
}

export async function updateProductStatus(productId: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('로그인이 필요합니다.');

  const status = formData.get('status') as string;
  if (!status) return;

  const { data: product } = await supabase
    .from('products')
    .select('seller_id')
    .eq('id', productId)
    .single();

  if (product?.seller_id !== user.id) throw new Error('수정 권한이 없습니다.');

  const { error } = await supabase
    .from('products')
    .update({ status })
    .eq('id', productId);

  if (error) throw new Error(error.message);

  revalidatePath(`/products/${productId}`);
  revalidatePath('/products');
  revalidatePath('/');
  revalidatePath('/chat', 'layout');
}

export async function deleteProduct(productId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: '로그인이 필요합니다.' };
  }

  const { data: product } = await supabase
    .from('products')
    .select('seller_id, images')
    .eq('id', productId)
    .single();

  if (!product) {
    return { error: '상품을 찾을 수 없습니다.' };
  }

  if (product.seller_id !== user.id) {
    return { error: '삭제 권한이 없습니다.' };
  }

  if (product.images && product.images.length > 0) {
    const filePaths = product.images.map((url: string) => {
      const parts = url.split('/product-images/');
      return parts.length > 1 ? parts[1] : null;
    }).filter(Boolean);

    if (filePaths.length > 0) {
      await supabase.storage.from('product-images').remove(filePaths);
    }
  }

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', productId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/products');
  revalidatePath('/mypage');
  revalidatePath('/');
  redirect('/products');
}

export async function createReview(productId: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('로그인이 필요합니다.');

  const rating = parseInt(formData.get('rating') as string, 10);
  const content = formData.get('content') as string;
  const sellerId = formData.get('seller_id') as string;

  if (!rating || !content || !sellerId) throw new Error('필수 정보가 누락되었습니다.');

  // 본인 상품에 리뷰를 남기려는 경우 (혹시 모를 우회 방지)
  if (user.id === sellerId) {
    throw new Error('자신의 상품에는 후기를 남길 수 없습니다.');
  }

  // 리뷰가 이미 작성되었는지 확인
  const { data: existingReview } = await supabase
    .from('reviews')
    .select('id')
    .eq('product_id', productId)
    .eq('reviewer_id', user.id)
    .single();

  if (existingReview) {
    throw new Error('이미 이 상품에 대한 후기를 작성하셨습니다.');
  }

  const { error } = await supabase
    .from('reviews')
    .insert({
      product_id: productId,
      reviewer_id: user.id,
      seller_id: sellerId,
      rating,
      content
    });

  if (error) {
    throw new Error(error.message);
  }

  // 매너 온도는 SQL Trigger를 통해 자동 업데이트 됩니다.
}
