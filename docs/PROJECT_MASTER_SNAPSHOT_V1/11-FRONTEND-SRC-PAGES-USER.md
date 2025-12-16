# 프로젝트 마스터 스냅샷 v1.0.0 - 프론트엔드 Pages (사용자 페이지)

**생성일**: 2025-12-10  
**목적**: 프론트엔드 사용자 페이지 원본 보관

---

## 1. 사용자 페이지

### src/pages/WelcomePage.tsx

```typescript
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../contexts/StoreContext';

/**
 * 인트로 페이지 (Intro / Splash Screen)
 * 앱 실행 시 잠시 로고와 상점 이름을 보여주고 메인 페이지로 이동
 */
export default function WelcomePage() {
  const navigate = useNavigate();
  const { store } = useStore();

  useEffect(() => {
    // 2초 후 메뉴 페이지로 자동 이동
    const timer = setTimeout(() => {
      navigate('/menu');
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4 animate-fade-in">
      {store?.logoUrl ? (
        <img
          src={store.logoUrl}
          alt={store.name}
          className="w-48 h-48 md:w-64 md:h-64 mb-8 rounded-3xl object-cover shadow-lg transform hover:scale-105 transition-transform duration-500"
        />
      ) : (
        <div className="w-48 h-48 md:w-64 md:h-64 mb-8 rounded-3xl gradient-primary flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-500">
          <span className="text-8xl md:text-9xl">🍜</span>
        </div>
      )}

      <h1 className="text-4xl md:text-5xl font-bold text-primary-600 text-center mb-2">
        {store?.name || 'Simple Delivery'}
      </h1>

      <div className="mt-8 flex gap-2">
        <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
}
```

### src/pages/MenuPage.tsx

```typescript
import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import CategoryBar from '../components/menu/CategoryBar';
import MenuCard from '../components/menu/MenuCard';
import Input from '../components/common/Input';
import { useStore } from '../contexts/StoreContext';
import { useFirestoreCollection } from '../hooks/useFirestoreCollection';
import { getAllMenusQuery } from '../services/menuService';
import { Menu } from '../types/menu';
import ReviewPreview from '../components/review/ReviewPreview';

export default function MenuPage() {
  const { store } = useStore();
  const storeId = store?.id;
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: menus, loading } = useFirestoreCollection<Menu>(
    storeId ? getAllMenusQuery(storeId) : null
  );

  const filteredMenus = useMemo(() => {
    if (!menus) return [];

    let filtered = menus;

    if (selectedCategory !== '전체') {
      filtered = filtered.filter(menu => menu.category.includes(selectedCategory));
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(menu =>
        menu.name.toLowerCase().includes(query) ||
        menu.description.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [menus, selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <CategoryBar selected={selectedCategory} onSelect={setSelectedCategory} />

      <div className="py-6">
        <div className="container mx-auto px-4 mb-6">
          <h1 className="text-2xl sm:text-3xl mb-2">
            <span className="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
              메뉴
            </span>
          </h1>
          <p className="text-sm sm:text-base text-gray-600">신선하고 맛있는 메뉴를 만나보세요</p>
        </div>

        <div className="container mx-auto px-4 mb-6">
          <Input
            type="text"
            placeholder="메뉴를 검색해보세요"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search className="w-5 h-5" />}
          />
        </div>

        <div className="container mx-auto px-4 mb-4">
          <p className="text-sm text-gray-600">
            총 <span className="font-semibold text-blue-600">{filteredMenus.length}</span>개의 메뉴
          </p>
        </div>

        {filteredMenus.length > 0 ? (
          <>
            <div className="md:hidden">
              <div className="flex gap-4 overflow-x-auto hide-scrollbar px-4 snap-x snap-mandatory">
                {filteredMenus.map((menu) => (
                  <div key={menu.id} className="flex-shrink-0 w-[280px] snap-start">
                    <MenuCard menu={menu} />
                  </div>
                ))}
              </div>
            </div>

            <div className="hidden md:block container mx-auto px-4">
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMenus.map((menu) => (
                  <MenuCard key={menu.id} menu={menu} />
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="container mx-auto px-4">
            <div className="text-center py-16">
              <div className="text-5xl sm:text-6xl mb-4">🔍</div>
              <p className="text-lg sm:text-xl text-gray-600 mb-2">검색 결과가 없습니다</p>
              <p className="text-sm sm:text-base text-gray-500">다른 검색어를 시도해보세요</p>
            </div>
          </div>
        )}
      </div>

      <ReviewPreview />
    </div>
  );
}
```

### src/pages/CartPage.tsx

```typescript
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, AlertCircle } from 'lucide-react';
import { useCart, CartItem as CartItemType } from '../contexts/CartContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { toast } from 'sonner';

export default function CartPage() {
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity, getTotalPrice, clearCart } = useCart();

  const handleCheckout = () => {
    if (items.length === 0) {
      toast.error('장바구니가 비어 있습니다');
      return;
    }
    navigate('/checkout');
  };

  const handleClearCart = () => {
    if (window.confirm('장바구니를 비우시겠습니까?')) {
      clearCart();
      toast.success('장바구니가 비워졌습니다');
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-6 gradient-primary rounded-full flex items-center justify-center">
            <ShoppingCart className="w-12 h-12 sm:w-16 sm:h-16 text-white" />
          </div>
          <h2 className="text-xl sm:text-2xl mb-3">
            장바구니가 비어 있습니다
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mb-8">
            맛있는 메뉴를 장바구니에 담아보세요
          </p>
          <Button size="lg" onClick={() => navigate('/menu')} className="w-full sm:w-auto">
            메뉴 둘러보기
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-8">
      <div className="container mx-auto px-4">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl mb-2">
              <span className="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
                장바구니
              </span>
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              총 {items.length}개의 상품
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearCart}
            className="text-red-600 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">전체 삭제</span>
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                onRemove={removeItem}
                onUpdateQuantity={updateQuantity}
              />
            ))}
          </div>

          <div className="lg:col-span-1">
            <Card className="hidden lg:block sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-4">주문 요약</h2>

              <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                <div className="flex items-center justify-between text-gray-600">
                  <span>상품 금액</span>
                  <span>{getTotalPrice().toLocaleString()}원</span>
                </div>
                <div className="flex items-center justify-between text-gray-600">
                  <span>배달비</span>
                  <span>3,000원</span>
                </div>
              </div>

              <div className="flex items-center justify-between mb-6 text-xl font-bold">
                <span>총 결제 금액</span>
                <span className="text-blue-600">
                  {(getTotalPrice() + 3000).toLocaleString()}원
                </span>
              </div>

              <Button
                fullWidth
                size="lg"
                onClick={handleCheckout}
                className="group"
              >
                주문하기
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>

              <div className="mt-4 p-3 bg-blue-50 rounded-lg flex items-start space-x-2">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-900">
                  최소 주문 금액은 10,000원입니다
                </p>
              </div>
            </Card>

            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-40">
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-600">총 결제 금액</span>
                <span className="text-xl text-blue-600">
                  {(getTotalPrice() + 3000).toLocaleString()}원
                </span>
              </div>
              <Button
                fullWidth
                size="lg"
                onClick={handleCheckout}
                className="group"
              >
                주문하기
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>

            <div className="lg:hidden h-32"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface CartItemProps {
  item: CartItemType;
  onRemove: (id: string) => void;
  onUpdateQuantity: (id: string, quantity: number) => void;
}

function CartItem({ item, onRemove, onUpdateQuantity }: CartItemProps) {
  const optionsPrice = item.options?.reduce((sum, opt) => sum + (opt.price * (opt.quantity || 1)), 0) || 0;
  const itemTotal = (item.price + optionsPrice) * item.quantity;

  return (
    <Card padding="none" className="overflow-hidden">
      <div className="flex flex-col sm:flex-row">
        <div className="w-full sm:w-32 h-48 sm:h-32 flex-shrink-0 bg-gray-100">
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <span className="text-5xl sm:text-3xl">🍜</span>
            </div>
          )}
        </div>

        <div className="flex-1 p-4 flex flex-col">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 pr-2">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">{item.name}</h3>
              {item.options && item.options.length > 0 && (
                <div className="space-y-0.5">
                  {item.options.map((opt, idx) => (
                    <p key={idx} className="text-xs sm:text-sm text-gray-600">
                      + {opt.name} {(opt.quantity || 1) > 1 ? `x${opt.quantity}` : ''} (+{(opt.price * (opt.quantity || 1)).toLocaleString()}원)
                    </p>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={() => onRemove(item.id)}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
            >
              <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          <div className="mt-auto flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <button
                onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center border border-gray-300 rounded-lg hover:border-blue-500 hover:text-blue-600 transition-colors"
              >
                <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
              <span className="text-base sm:text-lg font-semibold text-gray-900 min-w-[2rem] text-center">
                {item.quantity}
              </span>
              <button
                onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center border border-gray-300 rounded-lg hover:border-blue-500 hover:text-blue-600 transition-colors"
              >
                <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
            </div>

            <div className="text-right">
              <p className="text-lg sm:text-xl text-blue-600">
                {itemTotal.toLocaleString()}원
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
```

### src/pages/CheckoutPage.tsx

**참고**: CheckoutPage.tsx는 매우 큽니다 (약 609줄).  
전체 내용은 별도 파일로 저장되어 있습니다:
- `checkout-page-full.txt` - CheckoutPage.tsx 전체 원본

**주요 기능**:
- 주문 타입 선택 (배달주문/포장주문)
- 배달 정보 입력 (주소 검색)
- 결제 방법 선택
- 쿠폰 적용
- NICEPAY 결제 연동
- 주문 생성 및 상태 관리

### src/pages/OrdersPage.tsx

```typescript
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Clock, CheckCircle2, XCircle, ChevronRight, Star } from 'lucide-react';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, OrderStatus } from '../types/order';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import ReviewModal from '../components/review/ReviewModal';
import { useAuth } from '../contexts/AuthContext';
import { useStore } from '../contexts/StoreContext';
import { useFirestoreCollection } from '../hooks/useFirestoreCollection';
import { getUserOrdersQuery } from '../services/orderService';
import { Order } from '../types/order';

const toDate = (date: any): Date => {
  if (date?.toDate) return date.toDate();
  if (date instanceof Date) return date;
  if (typeof date === 'string') return new Date(date);
  return new Date();
};

export default function OrdersPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { store } = useStore();
  const [filter, setFilter] = useState<OrderStatus | '전체'>('전체');

  const ordersQuery = (store?.id && user?.id)
    ? getUserOrdersQuery(store.id, user.id)
    : null;

  const { data: allOrders, loading } = useFirestoreCollection<Order>(ordersQuery);

  const filteredOrders = filter === '전체'
    ? (allOrders || []).filter(order => order.status !== '결제대기')
    : (allOrders || []).filter(order => order.status === filter);

  const getDisplayStatus = (status: OrderStatus) => {
    switch (status) {
      case '접수': return '접수중';
      case '접수완료': return '접수확인';
      default: return ORDER_STATUS_LABELS[status];
    }
  };

  const filters: (OrderStatus | '전체')[] = ['전체', '접수', '접수완료', '조리중', '배달중', '완료', '취소'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">주문 내역을 불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-3xl mb-2">
            <span className="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
              내 주문
            </span>
          </h1>
          <p className="text-gray-600">주문 내역을 확인하고 관리하세요</p>
        </div>

        <div className="mb-6 flex space-x-2 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {filters.map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`
                px-4 py-2 rounded-lg whitespace-nowrap transition-all flex-shrink-0
                ${filter === status
                  ? 'gradient-primary text-white shadow-md'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-blue-500'
                }
              `}
            >
              {status === '전체' ? '전체' : getDisplayStatus(status)}
            </button>
          ))}
        </div>

        {filteredOrders.length > 0 ? (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <OrderCard key={order.id} order={order} onClick={() => navigate(`/orders/${order.id}`)} getDisplayStatus={getDisplayStatus} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-32 h-32 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <Package className="w-16 h-16 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              주문 내역이 없습니다
            </h2>
            <p className="text-gray-600 mb-8">
              맛있는 메뉴를 주문해보세요
            </p>
            <Button onClick={() => navigate('/menu')}>
              메뉴 둘러보기
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function OrderCard({ order, onClick, getDisplayStatus }: { order: Order; onClick: () => void; getDisplayStatus: (s: OrderStatus) => string }) {
  const [showReviewModal, setShowReviewModal] = useState(false);
  const statusColor = ORDER_STATUS_COLORS[order.status as OrderStatus];

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case '접수':
      case '접수완료':
      case '조리중':
        return <Clock className="w-5 h-5" />;
      case '배달중':
        return <Package className="w-5 h-5" />;
      case '완료':
        return <CheckCircle2 className="w-5 h-5" />;
      case '취소':
        return <XCircle className="w-5 h-5" />;
    }
  };

  const canReview = order.status === '완료';

  return (
    <>
      <Card>
        <div onClick={onClick} className="cursor-pointer hover:bg-gray-50 transition-colors p-1 -m-1 rounded-lg">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${statusColor.bg}`}>
                <div className={statusColor.text}>
                  {getStatusIcon(order.status)}
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600">
                  {toDate(order.createdAt).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
                <p className="text-xs text-gray-500">주문번호: {order.id.slice(0, 8)}</p>
              </div>
            </div>
            <Badge variant={
              order.status === '완료' ? 'success' :
                order.status === '취소' ? 'danger' :
                  order.status === '배달중' ? 'secondary' :
                    'primary'
            }>
              {getDisplayStatus(order.status)}
            </Badge>
          </div>

          <div className="space-y-2 mb-4 pb-4 border-b border-gray-200">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {item.imageUrl && (
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-600">수량: {item.quantity}개</p>
                  </div>
                </div>
                <p className="text-sm font-semibold text-gray-900">
                  {((item.price + (item.options?.reduce((sum: number, opt) => sum + (opt.price * (opt.quantity || 1)), 0) || 0)) * item.quantity).toLocaleString()}원
                </p>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">총 결제 금액</p>
              <p className="text-2xl font-bold text-blue-600">
                {order.totalPrice.toLocaleString()}원
              </p>
            </div>
            <ChevronRight className="w-6 h-6 text-gray-400" />
          </div>
        </div>

        {canReview && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            {order.reviewed ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span>리뷰 작성 완료 ({order.reviewRating || 0}점)</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowReviewModal(true);
                  }}
                >
                  리뷰 수정
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                fullWidth
                onClick={(e) => {
                  e.stopPropagation();
                  setShowReviewModal(true);
                }}
              >
                <Star className="w-4 h-4 mr-2" />
                리뷰 작성하기
              </Button>
            )}
          </div>
        )}
      </Card>

      {showReviewModal && (
        <ReviewModal
          orderId={order.id}
          onClose={() => setShowReviewModal(false)}
          onSuccess={() => {
            window.location.reload();
          }}
        />
      )}
    </>
  );
}
```

### src/pages/OrderDetailPage.tsx

**참고**: OrderDetailPage.tsx는 매우 큽니다 (약 288줄).  
전체 내용은 별도 파일로 저장되어 있습니다:
- `order-detail-page-full.txt` - OrderDetailPage.tsx 전체 원본

**주요 기능**:
- 주문 상세 정보 표시
- 주문 상태 진행 상황 표시
- 리뷰 작성 기능
- 재주문 기능

### src/pages/LoginPage.tsx

```typescript
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = '이메일을 입력해주세요';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = '올바른 이메일 형식이 아닙니다';
    }

    if (!password) {
      newErrors.password = '비밀번호를 입력해주세요';
    } else if (password.length < 6) {
      newErrors.password = '비밀번호는 최소 6자 이상이어야 합니다';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsLoading(true);

    try {
      await login(email, password);
      toast.success('로그인 성공!');
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || '로그인에 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 animate-fade-in">
          <Link to="/" className="inline-flex items-center justify-center w-20 h-20 gradient-primary rounded-3xl mb-4 shadow-lg hover:scale-105 transition-transform">
            <span className="text-4xl">🍜</span>
          </Link>
          <h1 className="text-3xl mb-2">
            <span className="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
              로그인
            </span>
          </h1>
          <p className="text-gray-600">커스컴배달앱에 오신 것을 환영합니다</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 animate-scale-in">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="이메일"
              type="email"
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              icon={<Mail className="w-5 h-5" />}
              autoComplete="email"
            />

            <Input
              label="비밀번호"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              icon={<Lock className="w-5 h-5" />}
              autoComplete="current-password"
            />

            <Button
              type="submit"
              fullWidth
              size="lg"
              isLoading={isLoading}
              className="group"
            >
              {!isLoading && (
                <>
                  로그인
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              계정이 없으신가요?{' '}
              <Link
                to="/signup"
                className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
              >
                회원가입
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link
            to="/"
            className="text-gray-600 hover:text-gray-900 text-sm inline-flex items-center"
          >
            ← 홈으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}
```

### src/pages/SignupPage.tsx

```typescript
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User as UserIcon, ArrowRight, CheckCircle2, Phone } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

export default function SignupPage() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
    phone: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = '이메일을 입력해주세요';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '올바른 이메일 형식이 아닙니다';
    }

    if (!formData.displayName) {
      newErrors.displayName = '이름을 입력해주세요';
    } else if (formData.displayName.length < 2) {
      newErrors.displayName = '이름은 최소 2자 이상이어야 합니다';
    }

    if (!formData.phone) {
      newErrors.phone = '전화번호를 입력해주세요';
    } else if (!/^[0-9-]+$/.test(formData.phone)) {
      newErrors.phone = '숫자와 하이픈(-)만 입력 가능합니다';
    } else if (formData.phone.length < 10) {
      newErrors.phone = '올바른 전화번호 형식이 아닙니다';
    }

    if (!formData.password) {
      newErrors.password = '비밀번호를 입력해주세요';
    } else if (formData.password.length < 6) {
      newErrors.password = '비밀번호는 최소 6자 이상이어야 합니다';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호를 다시 입력해주세요';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호가 일치하지 않습니다';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsLoading(true);

    try {
      await signup(formData.email, formData.password, formData.displayName, formData.phone);
      toast.success('회원가입이 완료되었습니다!');
      navigate('/menu');
    } catch (error: any) {
      toast.error(error.message || '회원가입에 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 animate-fade-in">
          <Link to="/" className="inline-flex items-center justify-center w-20 h-20 gradient-primary rounded-3xl mb-4 shadow-lg hover:scale-105 transition-transform">
            <span className="text-4xl">🍜</span>
          </Link>
          <h1 className="text-3xl mb-2">
            <span className="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
              회원가입
            </span>
          </h1>
          <p className="text-gray-600">새로운 계정을 만들어보세요</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 animate-scale-in">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="이름"
              type="text"
              placeholder="홍길동"
              value={formData.displayName}
              onChange={(e) => updateField('displayName', e.target.value)}
              error={errors.displayName}
              icon={<UserIcon className="w-5 h-5" />}
              autoComplete="name"
            />

            <Input
              label="전화번호"
              type="tel"
              placeholder="010-1234-5678"
              value={formData.phone}
              onChange={(e) => updateField('phone', e.target.value)}
              error={errors.phone}
              icon={<Phone className="w-5 h-5" />}
              autoComplete="tel"
            />

            <Input
              label="이메일"
              type="email"
              placeholder="example@email.com"
              value={formData.email}
              onChange={(e) => updateField('email', e.target.value)}
              error={errors.email}
              icon={<Mail className="w-5 h-5" />}
              autoComplete="email"
            />

            <Input
              label="비밀번호"
              type="password"
              placeholder="최소 6자 이상"
              value={formData.password}
              onChange={(e) => updateField('password', e.target.value)}
              error={errors.password}
              icon={<Lock className="w-5 h-5" />}
              autoComplete="new-password"
            />

            <Input
              label="비밀번호 확인"
              type="password"
              placeholder="비밀번호를 다시 입력하세요"
              value={formData.confirmPassword}
              onChange={(e) => updateField('confirmPassword', e.target.value)}
              error={errors.confirmPassword}
              icon={<Lock className="w-5 h-5" />}
              autoComplete="new-password"
            />

            <Button
              type="submit"
              fullWidth
              size="lg"
              isLoading={isLoading}
              className="group"
            >
              {!isLoading && (
                <>
                  가입하기
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-gradient-to-br from-blue-50 to-orange-50 rounded-xl">
            <p className="text-sm font-medium text-gray-900 mb-3">회원 혜택</p>
            <ul className="space-y-2">
              <BenefitItem text="신규 가입 쿠폰 즉시 지급" />
              <BenefitItem text="주문 내역 관리 및 재주문" />
              <BenefitItem text="맞춤 추천 메뉴 제공" />
            </ul>
          </div>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              이미 계정이 있으신가요?{' '}
              <Link
                to="/login"
                className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
              >
                로그인
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link
            to="/"
            className="text-gray-600 hover:text-gray-900 text-sm inline-flex items-center"
          >
            ← 홈으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}

function BenefitItem({ text }: { text: string }) {
  return (
    <li className="flex items-center text-sm text-gray-700">
      <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
      {text}
    </li>
  );
}
```

### src/pages/MyPage.tsx

**참고**: MyPage.tsx는 매우 큽니다 (약 290줄).  
전체 내용은 별도 파일로 저장되어 있습니다:
- `my-page-full.txt` - MyPage.tsx 전체 원본

**주요 기능**:
- 사용자 프로필 표시
- 최근 주문 내역
- 쿠폰함
- 알림 설정
- 상점 정보 표시

### src/pages/NoticePage.tsx

```typescript
import { Bell } from 'lucide-react';
import NoticeList from '../components/notice/NoticeList';

export default function NoticePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 gradient-primary rounded-2xl flex items-center justify-center">
              <Bell className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl">
              <span className="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
                공지사항
              </span>
            </h1>
          </div>
          <p className="text-gray-600">
            중요한 소식과 이벤트를 확인하세요
          </p>
        </div>

        <NoticeList />
      </div>
    </div>
  );
}
```

### src/pages/EventsPage.tsx

```typescript
import { Gift } from 'lucide-react';
import EventList from '../components/event/EventList';

export default function EventsPage() {
    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 gradient-primary rounded-2xl flex items-center justify-center">
                            <Gift className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-3xl">
                            <span className="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
                                이벤트
                            </span>
                        </h1>
                    </div>
                    <p className="text-gray-600">
                        놓치지 마세요! 현재 진행 중인 다양한 혜택
                    </p>
                </div>

                <EventList />
            </div>
        </div>
    );
}
```

### src/pages/ReviewBoardPage.tsx

```typescript
import { MessageSquare } from 'lucide-react';
import ReviewList from '../components/review/ReviewList';

export default function ReviewBoardPage() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <MessageSquare className="w-8 h-8 text-primary-600" />
                    <span>고객 후기</span>
                </h1>
                <p className="text-gray-600">
                    우리 가게를 이용해주신 고객님들의 솔직한 후기를 만나보세요.
                </p>
            </div>

            <ReviewList />
        </div>
    );
}
```

### src/pages/NicepayReturnPage.tsx

```typescript
/// <reference types="vite/client" />
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { useStore } from '../contexts/StoreContext';

const FUNCTIONS_URL = import.meta.env.VITE_FUNCTIONS_URL || 'https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/nicepayConfirm';

interface NicepayConfirmResponse {
    success: boolean;
    data?: any;
    error?: string;
    code?: string;
}

export default function NicepayReturnPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { store } = useStore();

    const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
    const [message, setMessage] = useState('결제 결과를 확인하고 있습니다...');

    useEffect(() => {
        const verifyPayment = async () => {
            const orderId = searchParams.get('orderId');
            const tid = searchParams.get('tid') || searchParams.get('TxTid');
            const authToken = searchParams.get('authToken') || searchParams.get('AuthToken');
            const resultCode = searchParams.get('resultCode') || searchParams.get('ResultCode');
            const resultMsg = searchParams.get('resultMsg') || searchParams.get('ResultMsg');
            const amount = searchParams.get('amt') || searchParams.get('Amt');

            console.log('NICEPAY Return Params:', { orderId, tid, resultCode, resultMsg });

            if (resultCode !== '0000') {
                setStatus('failed');
                setMessage(resultMsg || '결제가 취소되었거나 승인되지 않았습니다.');
                return;
            }

            if (!orderId || !tid || !authToken) {
                setStatus('failed');
                setMessage('필수 결제 정보가 누락되었습니다.');
                return;
            }

            try {
                const response = await fetch('/nicepayConfirm', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        tid,
                        authToken,
                        orderId,
                        storeId: store?.id,
                        amount: Number(amount)
                    })
                });

                const result: NicepayConfirmResponse = await response.json();

                if (result.success) {
                    setStatus('success');
                    setMessage('결제가 정상적으로 완료되었습니다.');
                } else {
                    setStatus('failed');
                    setMessage(result.error || '결제 승인 중 오류가 발생했습니다.');
                }
            } catch (error) {
                console.error('Payment Confirmation Error:', error);
                setStatus('failed');
                setMessage('서버 통신 중 오류가 발생했습니다.');
            }
        };

        if (store?.id) {
            verifyPayment();
        }
    }, [searchParams, store]);

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <Card className="max-w-md w-full text-center py-10 px-6">
                {status === 'loading' && (
                    <div className="flex flex-col items-center">
                        <Loader2 className="w-16 h-16 text-blue-600 animate-spin mb-6" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">결제 승인 중...</h2>
                        <p className="text-gray-600 animate-pulse">{message}</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="flex flex-col items-center">
                        <CheckCircle2 className="w-16 h-16 text-green-500 mb-6" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">결제 성공!</h2>
                        <p className="text-gray-600 mb-8">{message}</p>
                        <Button
                            fullWidth
                            size="lg"
                            onClick={() => navigate('/orders')}
                        >
                            주문 내역 보기
                        </Button>
                    </div>
                )}

                {status === 'failed' && (
                    <div className="flex flex-col items-center">
                        <XCircle className="w-16 h-16 text-red-500 mb-6" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">결제 실패</h2>
                        <p className="text-gray-600 mb-8">{message}</p>
                        <div className="flex gap-3 w-full">
                            <Button
                                variant="outline"
                                fullWidth
                                onClick={() => navigate('/')}
                            >
                                홈으로
                            </Button>
                            <Button
                                fullWidth
                                onClick={() => navigate('/checkout')}
                            >
                                다시 시도
                            </Button>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
}
```

### src/pages/StoreSetupWizard.tsx

**참고**: StoreSetupWizard.tsx는 매우 큽니다 (약 396줄).  
전체 내용은 별도 파일로 저장되어 있습니다:
- `store-setup-wizard-full.txt` - StoreSetupWizard.tsx 전체 원본

**주요 기능**:
- 단계별 상점 설정 마법사
- 기본 정보 입력
- 연락처 정보 입력
- 배달 설정
- 상점 생성 및 권한 부여

---

**다음 문서**: 
- `12-FRONTEND-SRC-PAGES-ADMIN.md`: Admin Pages (전체)
- `13-FRONTEND-SRC-UI-COMPONENTS.md`: UI Components (shadcn/ui)


