import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  where,
  orderBy,
  increment
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Coupon } from '../types/coupon';

const COLLECTION_NAME = 'coupons';

// 쿠폰 생성
export async function createCoupon(couponData: Omit<Coupon, 'id' | 'createdAt' | 'usedCount'>) {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...couponData,
      usedCount: 0,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('쿠폰 생성 실패:', error);
    throw error;
  }
}

// 쿠폰 수정
export async function updateCoupon(couponId: string, couponData: Partial<Coupon>) {
  try {
    const couponRef = doc(db, COLLECTION_NAME, couponId);
    await updateDoc(couponRef, {
      ...couponData,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('쿠폰 수정 실패:', error);
    throw error;
  }
}

// 쿠폰 삭제
export async function deleteCoupon(couponId: string) {
  try {
    const couponRef = doc(db, COLLECTION_NAME, couponId);
    await deleteDoc(couponRef);
  } catch (error) {
    console.error('쿠폰 삭제 실패:', error);
    throw error;
  }
}

// 쿠폰 활성화/비활성화
export async function toggleCouponActive(couponId: string, isActive: boolean) {
  try {
    const couponRef = doc(db, COLLECTION_NAME, couponId);
    await updateDoc(couponRef, {
      isActive,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('쿠폰 상태 변경 실패:', error);
    throw error;
  }
}

// 쿠폰 사용
export async function useCoupon(couponId: string) {
  try {
    const couponRef = doc(db, COLLECTION_NAME, couponId);
    await updateDoc(couponRef, {
      usedCount: increment(1),
    });
  } catch (error) {
    console.error('쿠폰 사용 처리 실패:', error);
    throw error;
  }
}

// Query 헬퍼 함수들
export function getAllCouponsQuery() {
  return query(
    collection(db, COLLECTION_NAME),
    orderBy('createdAt', 'desc')
  );
}

export function getActiveCouponsQuery() {
  return query(
    collection(db, COLLECTION_NAME),
    where('isActive', '==', true),
    orderBy('createdAt', 'desc')
  );
}