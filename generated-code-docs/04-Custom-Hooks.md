# 04-Custom-Hooks

Generated: 2025-12-10 16:23:00

---

## File: src\hooks\useFirebaseAuth.ts

```typescript
import { useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

interface User {
  id: string;
  email: string;
  displayName?: string;
  phone?: string;
}

// 데모 계정 정보
const DEMO_ACCOUNTS = {
  'user@demo.com': {
    password: 'demo123',
    id: 'demo-user-001',
    email: 'user@demo.com',
    displayName: '데모 사용자',
    isAdmin: false,
  },
  'admin@demo.com': {
    password: 'admin123',
    id: 'demo-admin-001',
    email: 'admin@demo.com',
    displayName: '관리자',
    isAdmin: true,
  },
};

export function useFirebaseAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 데모 모드 확인
  const isDemoMode = auth.app.options.apiKey === 'demo-api-key';

  useEffect(() => {
    // 데모 모드인 경우 로컬 스토리지에서 사용자 정보 로드
    if (isDemoMode) {
      const demoUser = localStorage.getItem('demoUser');
      if (demoUser) {
        setUser(JSON.parse(demoUser));
      }
      setLoading(false);
      return;
    }

    // Firebase 인증 모드
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Firestore에서 추가 정보(phone 등) 가져오기
        const userRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userRef);
        const userData = userDoc.data();

        setUser({
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: userData?.displayName || firebaseUser.displayName || undefined, // Firestore 데이터 우선
          phone: userData?.phone || undefined,
        });

        // Firestore에 사용자 문서 생성 (없으면)
        if (!userDoc.exists()) {
          await ensureUserDocument(firebaseUser);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isDemoMode]);

  const signup = async (email: string, password: string, displayName?: string, phone?: string) => {
    // 데모 모드
    if (isDemoMode) {
      // 데모 모드에서는 회원가입 시뮬레이션
      const newUser: User = {
        id: `demo-user-${Date.now()}`,
        email,
        displayName: displayName || email.split('@')[0],
        phone: phone || '010-0000-0000',
      };
      setUser(newUser);
      localStorage.setItem('demoUser', JSON.stringify(newUser));
      localStorage.setItem('demoIsAdmin', 'false');
      return;
    }

    // Firebase 모드
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // 프로필 업데이트
      if (displayName && userCredential.user) {
        await updateProfile(userCredential.user, { displayName });
      }

      // Firestore에 사용자 문서 생성
      await createUserDocument(userCredential.user, displayName, phone);

      return userCredential.user;
    } catch (error) {
      const errorCode = (error as { code?: string }).code || 'unknown';
      throw new Error(getAuthErrorMessage(errorCode));
    }
  };

  const login = async (email: string, password: string) => {
    // 데모 모드
    if (isDemoMode) {
      const demoAccount = DEMO_ACCOUNTS[email as keyof typeof DEMO_ACCOUNTS];

      if (!demoAccount) {
        throw new Error('존재하지 않는 사용자입니다. 데모 계정을 사용해주세요:\n- user@demo.com / demo123\n- admin@demo.com / admin123');
      }

      if (demoAccount.password !== password) {
        throw new Error('잘못된 비밀번호입니다');
      }

      // 데모 계정 로그인
      const { id, email: demoEmail, displayName, isAdmin } = demoAccount;
      const demoUser: User = { id, email: demoEmail, displayName };

      setUser(demoUser);
      localStorage.setItem('demoUser', JSON.stringify(demoUser));
      localStorage.setItem('demoIsAdmin', String(isAdmin));

      return;
    }

    // Firebase 모드
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      const errorCode = (error as { code?: string }).code || 'unknown';
      throw new Error(getAuthErrorMessage(errorCode));
    }
  };

  const logout = async () => {
    // 데모 모드
    if (isDemoMode) {
      setUser(null);
      localStorage.removeItem('demoUser');
      localStorage.removeItem('demoIsAdmin');
      return;
    }

    // Firebase 모드
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      throw new Error('로그아웃에 실패했습니다');
    }
  };

  return { user, loading, signup, login, logout };
}

// Firestore에 사용자 문서 생성
async function createUserDocument(firebaseUser: FirebaseUser, displayName?: string, phone?: string) {
  const userRef = doc(db, 'users', firebaseUser.uid);

  await setDoc(userRef, {
    email: firebaseUser.email,
    displayName: displayName || firebaseUser.email?.split('@')[0] || '',
    phone: phone || '',
    createdAt: new Date(),
    updatedAt: new Date(),
  }, { merge: true });
}

// 사용자 문서 확인 및 생성
async function ensureUserDocument(firebaseUser: FirebaseUser) {
  const userRef = doc(db, 'users', firebaseUser.uid);
  const userDoc = await getDoc(userRef);

  if (!userDoc.exists()) {
    await createUserDocument(firebaseUser, firebaseUser.displayName || undefined);
  }
}

// Firebase 에러 메시지 한글화
function getAuthErrorMessage(errorCode: string): string {
  const errorMessages: Record<string, string> = {
    'auth/email-already-in-use': '이미 사용 중인 이메일입니다',
    'auth/invalid-email': '올바른 이메일 형식이 아닙니다',
    'auth/operation-not-allowed': '이메일/비밀번호 로그인이 비활성화되어 있습니다',
    'auth/weak-password': '비밀번호는 최소 6자 이상이어야 합니다',
    'auth/user-disabled': '비활성화된 계정입니다',
    'auth/user-not-found': '존재하지 않는 사용자입니다',
    'auth/wrong-password': '잘못된 비밀번호입니다',
    'auth/too-many-requests': '너무 많은 시도가 있었습니다. 잠시 후 다시 시도해주세요',
    'auth/network-request-failed': '네트워크 오류가 발생했습니다',
  };

  return errorMessages[errorCode] || '인증 오류가 발생했습니다';
}
```

---

## File: src\hooks\useFirestoreCollection.ts

```typescript
import { useState, useEffect, useRef } from 'react';
import {
  Query,
  onSnapshot,
  DocumentData,
  queryEqual
} from 'firebase/firestore';

interface UseFirestoreCollectionResult<T> {
  data: T[];
  loading: boolean;
  error: Error | null;
}

export function useFirestoreCollection<T extends DocumentData>(
  query: Query | null
): UseFirestoreCollectionResult<T> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // 쿼리 객체 참조 안정화 (Deep Compare)
  const queryRef = useRef<Query | null>(query);

  // 렌더링 도중에 ref 업데이트 (useEffect보다 먼저 실행되어야 함)
  if (!queryEqual(queryRef.current, query)) {
    queryRef.current = query;
  }

  // 이제 useEffect는 안정화된 queryRef.current가 변경될 때만 실행됨
  // 즉, 쿼리의 내용이 실제로 바뀌었을 때만 재구독 발생
  useEffect(() => {
    const activeQuery = queryRef.current;

    if (!activeQuery) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const unsubscribe = onSnapshot(
        activeQuery,
        (snapshot) => {
          const items = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          })) as T[];

          setData(items);
          setLoading(false);
          setError(null);
        },
        (err) => {
          console.error(`Firestore collection error:`, err);
          setError(err as Error);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (err) {
      setError(err as Error);
      setLoading(false);
    }
  }, [queryRef.current]); // query 대신 queryRef.current 사용

  return { data, loading, error };
}

```

---

## File: src\hooks\useFirestoreDocument.ts

```typescript
import { useState, useEffect } from 'react';
import { doc, onSnapshot, DocumentData } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface UseFirestoreDocumentResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

export function useFirestoreDocument<T extends DocumentData>(
  collectionName: string | string[],
  documentId: string | null | undefined
): UseFirestoreDocumentResult<T> {
  // 안정적인 의존성 키 생성 (배열인 경우 문자열로 결합)
  const collectionPath = Array.isArray(collectionName)
    ? collectionName.join('/')
    : collectionName;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!documentId) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      // collectionPath(문자열)를 사용하여 참조 생성
      const docRef = doc(db, collectionPath, documentId);

      const unsubscribe = onSnapshot(
        docRef,
        (snapshot) => {
          if (snapshot.exists()) {
            setData({
              id: snapshot.id,
              ...snapshot.data(),
            } as T);
          } else {
            setData(null);
          }
          setLoading(false);
          setError(null);
        },
        (err) => {
          console.error(`Firestore document error (${collectionPath}/${documentId}):`, err);
          setError(err as Error);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (err) {
      setError(err as Error);
      setLoading(false);
    }
  }, [collectionPath, documentId]); // 안정된 문자열 키 사용

  return { data, loading, error };
}

```

---

## File: src\hooks\useIsAdmin.ts

```typescript
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

    // Firestore에서 관리자 권한 확인 (System Admin OR Store Owner)
    // 1. System Admin 체크
    const adminRef = doc(db, 'admins', userId);

    // 2. Store Owner 체크 (단일 상점 모드: 'default')
    const adminStoreRef = doc(db, 'adminStores', `${userId}_default`);

    // 두 경로 중 하나라도 존재하면 관리자로 인정
    // 실시간 리스너를 각각 연결하는 대신, 편의상 하나씩 확인하거나
    // 여기서는 onSnapshot을 두 번 호출하여 상태를 합칩니다.

    let isSystemAdmin = false;
    let isStoreOwner = false;

    // 리스너 관리를 위한 클린업 함수 배열
    const unsubscribes: (() => void)[] = [];

    const updateAdminStatus = () => {
      setIsAdmin(isSystemAdmin || isStoreOwner);
      setLoading(false);
    };

    const unsubAdmin = onSnapshot(adminRef, (doc) => {
      isSystemAdmin = doc.exists() && doc.data()?.isAdmin === true;
      updateAdminStatus();
    }, (err) => {
      console.error('System admin check failed:', err);
      // 에러 시 무시 (false)
    });
    unsubscribes.push(unsubAdmin);

    const unsubStore = onSnapshot(adminStoreRef, (doc) => {
      isStoreOwner = doc.exists(); // adminStores에 레코드가 있으면 권한 보유로 간주 (role 체크 추가 가능)
      updateAdminStatus();
    }, (err) => {
      console.error('Store owner check failed:', err);
    });
    unsubscribes.push(unsubStore);

    return () => {
      unsubscribes.forEach(unsub => unsub());
    };
  }, [userId, isDemoMode]);

  return { isAdmin, loading };
}
```

---

