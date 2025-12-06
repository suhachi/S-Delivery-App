import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner@2.0.3';
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
import { CartProvider } from './contexts/CartContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { StoreProvider } from './contexts/StoreContext';
import TopBar from './components/common/TopBar';
import './styles/globals.css';

// Protected Route Component
function RequireAuth({ children, requireAdmin = false }: { children: React.ReactNode; requireAdmin?: boolean }) {
  const { user, isAdmin, loading } = useAuth();
  
  if (loading) {
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
  
  return <>{children}</>;
}

function AppContent() {
  const { user } = useAuth();
  
  return (
    <CartProvider>
      <div className="min-h-screen bg-gray-50">
        {user && <TopBar />}
        <Routes>
          <Route path="/" element={<WelcomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/menu" element={<RequireAuth><MenuPage /></RequireAuth>} />
          <Route path="/cart" element={<RequireAuth><CartPage /></RequireAuth>} />
          <Route path="/orders" element={<RequireAuth><OrdersPage /></RequireAuth>} />
          <Route path="/orders/:orderId" element={<RequireAuth><OrderDetailPage /></RequireAuth>} />
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
      <Toaster position="top-center" richColors />
    </CartProvider>
  );
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