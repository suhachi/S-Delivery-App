# 프로젝트 마스터 스냅샷 v1.0.0 - 프론트엔드 진입점

**생성일**: 2025-12-10  
**목적**: 프론트엔드 애플리케이션 진입점 파일 원본 보관

---

## 1. src/main.tsx

```typescript
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
```

---

## 2. src/App.tsx

```typescript
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import WelcomePage from './pages/WelcomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import MenuPage from './pages/MenuPage';
import CartPage from './pages/CartPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import CheckoutPage from './pages/CheckoutPage';
import MyPage from './pages/MyPage';
import StoreSetupWizard from './pages/StoreSetupWizard';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminMenuManagement from './pages/admin/AdminMenuManagement';
import AdminOrderManagement from './pages/admin/AdminOrderManagement';
import AdminCouponManagement from './pages/admin/AdminCouponManagement';
import AdminReviewManagement from './pages/admin/AdminReviewManagement';
import AdminNoticeManagement from './pages/admin/AdminNoticeManagement';
import AdminEventManagement from './pages/admin/AdminEventManagement';
import AdminStoreSettings from './pages/admin/AdminStoreSettings';
import NoticePage from './pages/NoticePage';
import EventsPage from './pages/EventsPage';
import ReviewBoardPage from './pages/ReviewBoardPage';
import { CartProvider } from './contexts/CartContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { StoreProvider, useStore } from './contexts/StoreContext';
import TopBar from './components/common/TopBar';
import AdminOrderAlert from './components/admin/AdminOrderAlert';
import NicepayReturnPage from './pages/NicepayReturnPage';
import './styles/globals.css';

// Protected Route Component
function RequireAuth({ children, requireAdmin = false }: { children: React.ReactNode; requireAdmin?: boolean }) {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const { store, loading: storeLoading } = useStore();
  const location = useLocation();

  if (authLoading || (requireAdmin && storeLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  // 상점이 생성되지 않은 상태에서 관리자가 접속하면 상점 생성 페이지로 리다이렉트
  if (requireAdmin && isAdmin && !store && !storeLoading) {
    if (location.pathname !== '/store-setup') {
      return <Navigate to="/store-setup" replace />;
    }
  }

  return <>{children}</>;
}

function AppContent() {
  const { user, loading: authLoading } = useAuth();
  const { store, loading: storeLoading } = useStore();

  // 테마 색상 적용
  React.useEffect(() => {
    if (store?.primaryColor) {
      const root = document.documentElement;
      const primary = store.primaryColor;

      // 메인 색상 적용
      root.style.setProperty('--color-primary-500', primary);

      // 그라데이션 등을 위한 파생 색상 생성 (간단히 조금 더 어두운 색상으로 설정)
      // 실제로는 더 정교한 색상 팔레트 생성 로직이 필요할 수 있음
      root.style.setProperty('--color-primary-600', adjustBrightness(primary, -10));
    }
  }, [store?.primaryColor]);

  // 상점 이름으로 타이틀 변경
  React.useEffect(() => {
    if (store?.name) {
      document.title = store.name;
    } else {
      document.title = 'Simple Delivery App';
    }
  }, [store?.name]);

  // 디버깅: 로딩 상태 확인
  if (authLoading || storeLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <CartProvider>
      <div className="min-h-screen bg-gray-50">
        {user && <TopBar />}
        <AdminOrderAlert />
        <Routes>
          <Route path="/" element={<WelcomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/menu" element={<RequireAuth><MenuPage /></RequireAuth>} />

          <Route path="/cart" element={<RequireAuth><CartPage /></RequireAuth>} />
          <Route path="/payment/nicepay/return" element={<NicepayReturnPage />} />
          <Route path="/nicepay/return" element={<NicepayReturnPage />} />
          <Route path="/notices" element={<NoticePage />} />
          <Route path="/events" element={<EventsPage />} />

          {/* ... (imports remain the same) */}

          {/* ... inside AppContent routes ... */}
          <Route path="/orders" element={<RequireAuth><OrdersPage /></RequireAuth>} />
          <Route path="/orders/:orderId" element={<RequireAuth><OrderDetailPage /></RequireAuth>} />
          <Route path="/reviews" element={<ReviewBoardPage />} />
          <Route path="/checkout" element={<RequireAuth><CheckoutPage /></RequireAuth>} />

          <Route path="/mypage" element={<RequireAuth><MyPage /></RequireAuth>} />

          {/* Admin Routes */}
          <Route path="/admin" element={<RequireAuth requireAdmin><AdminDashboard /></RequireAuth>} />
          <Route path="/admin/menus" element={<RequireAuth requireAdmin><AdminMenuManagement /></RequireAuth>} />
          <Route path="/admin/orders" element={<RequireAuth requireAdmin><AdminOrderManagement /></RequireAuth>} />
          <Route path="/admin/coupons" element={<RequireAuth requireAdmin><AdminCouponManagement /></RequireAuth>} />
          <Route path="/admin/reviews" element={<RequireAuth requireAdmin><AdminReviewManagement /></RequireAuth>} />
          <Route path="/admin/notices" element={<RequireAuth requireAdmin><AdminNoticeManagement /></RequireAuth>} />
          <Route path="/admin/events" element={<RequireAuth requireAdmin><AdminEventManagement /></RequireAuth>} />
          <Route path="/admin/store-settings" element={<RequireAuth requireAdmin><AdminStoreSettings /></RequireAuth>} />

          {/* Store Setup */}
          <Route path="/store-setup" element={<RequireAuth requireAdmin><StoreSetupWizard /></RequireAuth>} />
        </Routes>
      </div>
      <Toaster position="bottom-center" richColors duration={2000} />
    </CartProvider>
  );
}

// 색상 밝기 조절 유틸리티
function adjustBrightness(hex: string, percent: number) {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 + (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 + (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <StoreProvider>
          <AppContent />
        </StoreProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
```

---

## 3. src/index.css

**참고**: `src/index.css`는 Tailwind CSS v4의 컴파일된 결과물로 매우 큽니다 (3500줄 이상).  
실제 소스는 `src/styles/globals.css`를 참조하세요.

---

## 4. src/vite-env.d.ts

```typescript
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY?: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN?: string;
  readonly VITE_FIREBASE_PROJECT_ID?: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET?: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID?: string;
  readonly VITE_FIREBASE_APP_ID?: string;
  readonly VITE_FIREBASE_MEASUREMENT_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

---

## 5. src/styles/globals.css

```css
@import 'tailwindcss';

/* Modern Design System */
:root {
  /* Primary Colors - Vibrant Blue */
  --color-primary-50: #eff6ff;
  --color-primary-100: #dbeafe;
  --color-primary-200: #bfdbfe;
  --color-primary-300: #93c5fd;
  --color-primary-400: #60a5fa;
  --color-primary-500: #3b82f6;
  --color-primary-600: #2563eb;
  --color-primary-700: #1d4ed8;
  --color-primary-800: #1e40af;
  --color-primary-900: #1e3a8a;
  
  /* Secondary Colors - Orange Accent */
  --color-secondary-50: #fff7ed;
  --color-secondary-100: #ffedd5;
  --color-secondary-200: #fed7aa;
  --color-secondary-300: #fdba74;
  --color-secondary-400: #fb923c;
  --color-secondary-500: #f97316;
  --color-secondary-600: #ea580c;
  --color-secondary-700: #c2410c;
  --color-secondary-800: #9a3412;
  --color-secondary-900: #7c2d12;
  
  /* Success Green */
  --color-success: #10b981;
  --color-success-light: #d1fae5;
  
  /* Warning */
  --color-warning: #f59e0b;
  --color-warning-light: #fef3c7;
  
  /* Error */
  --color-error: #ef4444;
  --color-error-light: #fee2e2;
  
  /* Neutrals */
  --color-gray-50: #f9fafb;
  --color-gray-100: #f3f4f6;
  --color-gray-200: #e5e7eb;
  --color-gray-300: #d1d5db;
  --color-gray-400: #9ca3af;
  --color-gray-500: #6b7280;
  --color-gray-600: #4b5563;
  --color-gray-700: #374151;
  --color-gray-800: #1f2937;
  --color-gray-900: #111827;
  
  /* Spacing */
  --spacing-xs: 0.5rem;
  --spacing-sm: 0.75rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  --spacing-2xl: 3rem;
  
  /* Border Radius */
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
  --radius-2xl: 1.5rem;
  --radius-full: 9999px;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
  
  /* Transitions */
  --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-base: 200ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slow: 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

/* Typography */
h1 {
  font-size: 2.25rem;
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.025em;
}

h2 {
  font-size: 1.875rem;
  font-weight: 700;
  line-height: 1.3;
  letter-spacing: -0.025em;
}

h3 {
  font-size: 1.5rem;
  font-weight: 600;
  line-height: 1.4;
}

h4 {
  font-size: 1.25rem;
  font-weight: 600;
  line-height: 1.5;
}

h5 {
  font-size: 1.125rem;
  font-weight: 600;
  line-height: 1.5;
}

p {
  font-size: 1rem;
  line-height: 1.625;
  color: var(--color-gray-700);
}

small {
  font-size: 0.875rem;
  line-height: 1.5;
  color: var(--color-gray-600);
}

/* Base Styles */
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: var(--color-gray-900);
  background-color: var(--color-gray-50);
}

/* Custom Scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: var(--color-gray-100);
  border-radius: var(--radius-full);
}

::-webkit-scrollbar-thumb {
  background: var(--color-gray-400);
  border-radius: var(--radius-full);
  transition: background var(--transition-base);
}

::-webkit-scrollbar-thumb:hover {
  background: var(--color-gray-500);
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes scaleIn {
  from {
    transform: scale(0.95);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.animate-fade-in {
  animation: fadeIn var(--transition-base) ease-out;
}

.animate-slide-up {
  animation: slideUp var(--transition-slow) ease-out;
}

.animate-scale-in {
  animation: scaleIn var(--transition-base) ease-out;
}

/* Utility Classes */
.glass-effect {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.gradient-primary {
  background: linear-gradient(135deg, var(--color-primary-600) 0%, var(--color-primary-500) 100%);
}

.gradient-secondary {
  background: linear-gradient(135deg, var(--color-secondary-600) 0%, var(--color-secondary-500) 100%);
}

.card-hover {
  transition: all var(--transition-base);
}

.card-hover:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

/* Hide scrollbar utility */
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.hide-scrollbar::-webkit-scrollbar {
  display: none;
}

/* Button Base Styles */
button {
  font-family: inherit;
  cursor: pointer;
  transition: all var(--transition-base);
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Input Base Styles */
input, textarea, select {
  font-family: inherit;
  font-size: 1rem;
}

input:focus, textarea:focus, select:focus {
  outline: none;
  ring: 2px;
  ring-color: var(--color-primary-500);
  ring-offset: 2px;
}

/* Container */
.container {
  width: 100%;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
  padding-left: var(--spacing-md);
  padding-right: var(--spacing-md);
}

@media (min-width: 640px) {
  .container {
    padding-left: var(--spacing-lg);
    padding-right: var(--spacing-lg);
  }
}

@media (min-width: 1024px) {
  .container {
    padding-left: var(--spacing-xl);
    padding-right: var(--spacing-xl);
  }
}
```

---

**다음 문서**: [06-FRONTEND-SRC-CORE.md](./06-FRONTEND-SRC-CORE.md) (contexts, hooks, lib)


