import {
  collection,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Order, OrderStatus } from '../types/order';

const COLLECTION_NAME = 'orders';

// 주문 생성
export async function createOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...orderData,
      status: '접수' as OrderStatus,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('주문 생성 실패:', error);
    throw error;
  }
}

// 주문 상태 변경
export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  try {
    const orderRef = doc(db, COLLECTION_NAME, orderId);
    await updateDoc(orderRef, {
      status,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('주문 상태 변경 실패:', error);
    throw error;
  }
}

// 주문 취소
export async function cancelOrder(orderId: string) {
  try {
    const orderRef = doc(db, COLLECTION_NAME, orderId);
    await updateDoc(orderRef, {
      status: '취소' as OrderStatus,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('주문 취소 실패:', error);
    throw error;
  }
}

// Query 헬퍼 함수들
export function getUserOrdersQuery(userId: string) {
  return query(
    collection(db, COLLECTION_NAME),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
}

export function getAllOrdersQuery() {
  return query(
    collection(db, COLLECTION_NAME),
    orderBy('createdAt', 'desc')
  );
}

export function getOrdersByStatusQuery(status: OrderStatus) {
  return query(
    collection(db, COLLECTION_NAME),
    where('status', '==', status),
    orderBy('createdAt', 'desc')
  );
}