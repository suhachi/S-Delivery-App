import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Menu } from '../types/menu';

const COLLECTION_NAME = 'menus';

// 메뉴 추가
export async function createMenu(menuData: Omit<Menu, 'id' | 'createdAt'>) {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...menuData,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('메뉴 추가 실패:', error);
    throw error;
  }
}

// 메뉴 수정
export async function updateMenu(menuId: string, menuData: Partial<Menu>) {
  try {
    const menuRef = doc(db, COLLECTION_NAME, menuId);
    await updateDoc(menuRef, {
      ...menuData,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('메뉴 수정 실패:', error);
    throw error;
  }
}

// 메뉴 삭제
export async function deleteMenu(menuId: string) {
  try {
    const menuRef = doc(db, COLLECTION_NAME, menuId);
    await deleteDoc(menuRef);
  } catch (error) {
    console.error('메뉴 삭제 실패:', error);
    throw error;
  }
}

// 품절 상태 변경
export async function toggleMenuSoldout(menuId: string, soldout: boolean) {
  try {
    const menuRef = doc(db, COLLECTION_NAME, menuId);
    await updateDoc(menuRef, {
      soldout,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('품절 상태 변경 실패:', error);
    throw error;
  }
}

// Query 헬퍼 함수들
export function getMenusQuery() {
  return query(
    collection(db, COLLECTION_NAME),
    orderBy('createdAt', 'desc')
  );
}

export function getMenusByCategoryQuery(category: string) {
  return query(
    collection(db, COLLECTION_NAME),
    where('category', 'array-contains', category),
    orderBy('createdAt', 'desc')
  );
}