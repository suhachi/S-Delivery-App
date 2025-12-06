import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Review, CreateReviewData, UpdateReviewData } from '../types/review';

const REVIEWS_COLLECTION = 'reviews';
const ORDERS_COLLECTION = 'orders';

/**
 * 리뷰 생성
 */
export async function createReview(
  reviewData: CreateReviewData
): Promise<string> {
  try {
    // 1. 리뷰 생성
    const docRef = await addDoc(collection(db, REVIEWS_COLLECTION), {
      ...reviewData,
      createdAt: serverTimestamp(),
    });

    // 2. 주문 문서에 리뷰 정보 미러링
    const orderRef = doc(db, ORDERS_COLLECTION, reviewData.orderId);
    await updateDoc(orderRef, {
      reviewed: true,
      reviewText: reviewData.comment,
      reviewRating: reviewData.rating,
      reviewedAt: serverTimestamp(),
    });

    return docRef.id;
  } catch (error) {
    console.error('리뷰 생성 실패:', error);
    throw error;
  }
}

/**
 * 리뷰 수정
 */
export async function updateReview(
  reviewId: string,
  reviewData: UpdateReviewData
): Promise<void> {
  try {
    const reviewRef = doc(db, REVIEWS_COLLECTION, reviewId);
    await updateDoc(reviewRef, {
      ...reviewData,
      updatedAt: serverTimestamp(),
    });

    // 주문 문서 업데이트 로직 (선택적)
    // 여기서는 간단하게 생략하거나 필요 시 추가 구현
  } catch (error) {
    console.error('리뷰 수정 실패:', error);
    throw error;
  }
}

/**
 * 리뷰 삭제
 */
export async function deleteReview(
  reviewId: string,
  orderId: string
): Promise<void> {
  try {
    // 1. 리뷰 삭제
    const reviewRef = doc(db, REVIEWS_COLLECTION, reviewId);
    await deleteDoc(reviewRef);

    // 2. 주문 문서 리뷰 필드 초기화
    const orderRef = doc(db, ORDERS_COLLECTION, orderId);
    await updateDoc(orderRef, {
      reviewed: false,
      reviewText: null,
      reviewRating: null,
      reviewedAt: null,
    });
  } catch (error) {
    console.error('리뷰 삭제 실패:', error);
    throw error;
  }
}

/**
 * 특정 주문의 리뷰 조회
 */
export async function getReviewByOrder(
  orderId: string,
  userId: string
): Promise<Review | null> {
  try {
    const q = query(
      collection(db, REVIEWS_COLLECTION),
      where('orderId', '==', orderId),
      where('userId', '==', userId)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
    } as Review;
  } catch (error) {
    console.error('리뷰 조회 실패:', error);
    throw error;
  }
}

/**
 * 모든 리뷰 쿼리 (최신순)
 */
export function getAllReviewsQuery() {
  return query(
    collection(db, REVIEWS_COLLECTION),
    orderBy('createdAt', 'desc')
  );
}

/**
 * 특정 평점 이상 리뷰 쿼리
 */
export function getReviewsByRatingQuery(minRating: number) {
  return query(
    collection(db, REVIEWS_COLLECTION),
    where('rating', '>=', minRating),
    orderBy('rating', 'desc'),
    orderBy('createdAt', 'desc')
  );
}
