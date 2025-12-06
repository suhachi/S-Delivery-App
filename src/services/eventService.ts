import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Event } from '../types/event';

const COLLECTION_NAME = 'events';

/**
 * 이벤트 생성
 */
export async function createEvent(
  eventData: Omit<Event, 'id' | 'createdAt'>
): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      title: eventData.title,
      imageUrl: eventData.imageUrl,
      link: eventData.link,
      active: eventData.active,
      startDate: Timestamp.fromDate(new Date(eventData.startDate)),
      endDate: Timestamp.fromDate(new Date(eventData.endDate)),
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('이벤트 생성 실패:', error);
    throw error;
  }
}

/**
 * 이벤트 수정
 */
export async function updateEvent(
  eventId: string,
  eventData: Partial<Omit<Event, 'id' | 'createdAt'>>
): Promise<void> {
  try {
    const eventRef = doc(db, COLLECTION_NAME, eventId);
    const updateData: any = {};

    if (eventData.title !== undefined) updateData.title = eventData.title;
    if (eventData.imageUrl !== undefined) updateData.imageUrl = eventData.imageUrl;
    if (eventData.link !== undefined) updateData.link = eventData.link;
    if (eventData.active !== undefined) updateData.active = eventData.active;
    if (eventData.startDate !== undefined) {
      updateData.startDate = Timestamp.fromDate(new Date(eventData.startDate));
    }
    if (eventData.endDate !== undefined) {
      updateData.endDate = Timestamp.fromDate(new Date(eventData.endDate));
    }

    await updateDoc(eventRef, updateData);
  } catch (error) {
    console.error('이벤트 수정 실패:', error);
    throw error;
  }
}

/**
 * 이벤트 삭제
 */
export async function deleteEvent(
  eventId: string
): Promise<void> {
  try {
    const eventRef = doc(db, COLLECTION_NAME, eventId);
    await deleteDoc(eventRef);
  } catch (error) {
    console.error('이벤트 삭제 실패:', error);
    throw error;
  }
}

/**
 * 이벤트 활성화 토글
 */
export async function toggleEventActive(
  eventId: string,
  active: boolean
): Promise<void> {
  try {
    const eventRef = doc(db, COLLECTION_NAME, eventId);
    await updateDoc(eventRef, { active });
  } catch (error) {
    console.error('이벤트 활성화 상태 변경 실패:', error);
    throw error;
  }
}

/**
 * 모든 이벤트 쿼리 (생성일 내림차순)
 */
export function getAllEventsQuery() {
  return query(
    collection(db, COLLECTION_NAME),
    orderBy('createdAt', 'desc')
  );
}

/**
 * 활성화된 이벤트만 조회
 */
export function getActiveEventsQuery() {
  return query(
    collection(db, COLLECTION_NAME),
    where('active', '==', true),
    orderBy('startDate', 'asc')
  );
}
