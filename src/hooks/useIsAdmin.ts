import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';

export function useIsAdmin(userId: string | null | undefined) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // 데모 모드 확인
  const isDemoMode = auth.app.options.apiKey === 'demo-api-key';

  useEffect(() => {
    if (!userId) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    // 데모 모드인 경우 로컬 스토리지에서 확인
    if (isDemoMode) {
      const demoIsAdmin = localStorage.getItem('demoIsAdmin') === 'true';
      setIsAdmin(demoIsAdmin);
      setLoading(false);
      return;
    }

    // Firestore에서 관리자 권한 확인
    const adminRef = doc(db, 'admins', userId);
    
    const unsubscribe = onSnapshot(
      adminRef,
      (doc) => {
        setIsAdmin(doc.exists() && doc.data()?.isAdmin === true);
        setLoading(false);
      },
      (error) => {
        console.error('관리자 권한 확인 실패:', error);
        setIsAdmin(false);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId, isDemoMode]);

  return { isAdmin, loading };
}