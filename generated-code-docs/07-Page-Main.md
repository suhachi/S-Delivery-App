# 07-Page-Main

Generated: 2025-12-10 14:27:34

---

## File: src\pages\CartPage.tsx

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
        {/* Header - 모바일 최적화 */}
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
          {/* Cart Items */}
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

          {/* Order Summary - 모바일에서는 하단 고정 */}
          <div className="lg:col-span-1">
            {/* 데스크톱: sticky 카드 */}
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

            {/* 모바일: 하단 고정 바 */}
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

            {/* 모바일: 하단 여백 추가 (고정 바 공간 확보) */}
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
        {/* Image */}
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

        {/* Content */}
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
            {/* Quantity Controls */}
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

            {/* Price */}
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

---

## File: src\pages\CheckoutPage.tsx

```typescript
/// <reference types="vite/client" />
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Phone, CreditCard, Wallet, DollarSign, ArrowLeft, CheckCircle2, ShoppingBag, Package, Ticket, X, Search } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useStore } from '../contexts/StoreContext';
import { toast } from 'sonner';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import AddressSearchModal from '../components/common/AddressSearchModal';
import { Coupon } from '../types/coupon';
import { createOrder } from '../services/orderService';
import { useCoupon } from '../services/couponService';
import { OrderStatus } from '../types/order';
import { useFirestoreCollection } from '../hooks/useFirestoreCollection';
import { getCouponsPath } from '../lib/firestorePaths';
import { collection } from 'firebase/firestore';
import { db } from '../lib/firebase';

type OrderType = '배달주문' | '포장주문';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, getTotalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const { store } = useStore();
  const storeId = store?.id;

  // Firestore에서 쿠폰 조회
  const { data: coupons } = useFirestoreCollection<Coupon>(
    storeId ? collection(db, getCouponsPath(storeId)) : null
  );

  const [orderType, setOrderType] = useState<OrderType>('배달주문');
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [isAddressSearchOpen, setIsAddressSearchOpen] = useState(false);
  const [formData, setFormData] = useState({
    address: '',
    detailAddress: '',
    phone: '',
    memo: '',
    paymentType: '앱결제' as '앱결제' | '만나서카드' | '만나서현금' | '방문시결제',
  });

  // 사용자 정보(전화번호) 자동 입력
  useEffect(() => {
    if (user?.phone && !formData.phone) {
      setFormData(prev => ({ ...prev, phone: user.phone! }));
    }
  }, [user]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // 주문 타입에 따른 배달비 계산
  const deliveryFee = orderType === '배달주문' ? 3000 : 0;

  // 사용 가능한 쿠폰 필터링
  // Firestore Timestamp 처리를 위한 헬퍼 함수
  const toDate = (date: any): Date => {
    if (date?.toDate) return date.toDate(); // Firestore Timestamp
    if (date instanceof Date) return date;
    if (typeof date === 'string') return new Date(date);
    return new Date(); // Fallback
  };

  // 사용 가능한 쿠폰 필터링
  const availableCoupons = (coupons || []).filter(coupon => {
    const now = new Date();
    const itemsTotal = getTotalPrice();
    const validFrom = toDate(coupon.validFrom);
    const validUntil = toDate(coupon.validUntil);
    const minOrderAmount = Number(coupon.minOrderAmount) || 0;

    // 만료일의 경우 해당 날짜의 23:59:59까지 유효하도록 설정 (선택사항, 필요시)
    // 여기서는 단순 시간 비교

    const isValidPeriod = validFrom <= now && validUntil >= now;
    const isValidAmount = itemsTotal >= minOrderAmount;
    const isNotUsed = !coupon.usedByUserIds?.includes(user?.id || '');
    // 발급 대상 확인: 지정된 사용자가 없거나(전체 발급), 해당 사용자에게 지정된 경우
    const isAssignedToUser = !coupon.assignedUserId || coupon.assignedUserId === user?.id;

    // 디버깅을 위해 로그 추가 (필요시 제거)
    // console.log(`Coupon ${coupon.name}: Active=${coupon.isActive}, Period=${isValidPeriod}, Amount=${isValidAmount}, Assigned=${isAssignedToUser}`);

    return coupon.isActive && isValidPeriod && isValidAmount && isNotUsed && isAssignedToUser;
  });

  // 쿠폰 할인 금액 계산
  const calculateDiscount = (coupon: Coupon | null): number => {
    if (!coupon) return 0;

    const itemsTotal = getTotalPrice();

    if (coupon.discountType === 'percentage') {
      const discount = Math.floor(itemsTotal * (coupon.discountValue / 100));
      return coupon.maxDiscountAmount
        ? Math.min(discount, coupon.maxDiscountAmount)
        : discount;
    } else {
      return coupon.discountValue;
    }
  };

  const discountAmount = calculateDiscount(selectedCoupon);
  const finalTotal = getTotalPrice() + deliveryFee - discountAmount;

  // 주문 타입에 따른 결제 방법
  const paymentTypes = orderType === '배달주문'
    ? [
      { value: '앱결제', label: '앱 결제', icon: <CreditCard className="w-5 h-5" /> },
      { value: '만나서카드', label: '만나서 카드', icon: <CreditCard className="w-5 h-5" /> },
      { value: '만나서현금', label: '만나서 현금', icon: <Wallet className="w-5 h-5" /> },
    ]
    : [
      { value: '앱결제', label: '앱 결제', icon: <CreditCard className="w-5 h-5" /> },
      { value: '방문시결제', label: '방문시 결제', icon: <DollarSign className="w-5 h-5" /> },
    ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!storeId) {
      toast.error('상점 정보를 찾을 수 없습니다');
      return;
    }

    if (!user) {
      toast.error('로그인이 필요합니다');
      navigate('/login');
      return;
    }

    // 배달주문 검증
    if (orderType === '배달주문' && (!formData.address || !formData.phone)) {
      toast.error('배달 주소와 연락처를 입력해주세요');
      return;
    }

    // 포장주문 검증
    if (orderType === '포장주문' && !formData.phone) {
      toast.error('연락처를 입력해주세요');
      return;
    }

    if (getTotalPrice() < 10000) {
      toast.error('최소 주문 금액은 10,000원입니다');
      return;
    }

    setIsSubmitting(true);

    try {
      // 결제 타입에 따른 초기 상태 설정
      // 앱결제: '결제대기' -> PG 결제 후 '접수'로 변경 (서버)
      // 그 외(만나서 결제 등): 바로 '접수' 상태로 생성
      const initialStatus: OrderStatus = formData.paymentType === '앱결제' ? '결제대기' : '접수';

      const pendingOrderData = {
        userId: user.id,
        userDisplayName: user.displayName || '사용자',
        items,
        orderType,
        itemsPrice: getTotalPrice(),
        deliveryFee,
        discountAmount,
        totalPrice: finalTotal,
        address: `${formData.address} ${formData.detailAddress}`.trim(),
        phone: formData.phone,
        memo: formData.memo,
        paymentType: formData.paymentType,
        couponId: selectedCoupon?.id || undefined,
        couponName: selectedCoupon?.name || undefined,
        adminDeleted: false,
        reviewed: false,
        paymentStatus: '결제대기' as const, // 결제 완료 여부와 별개
      };

      // 1. 주문 생성 (초기 상태 포함)
      const orderId = await createOrder(storeId, {
        ...pendingOrderData,
        status: initialStatus
      });

      // 2. 쿠폰 사용 처리 (주문 생성 성공 시)
      if (selectedCoupon && storeId && user?.id) {
        try {
          await useCoupon(storeId, selectedCoupon.id, user.id);
        } catch (couponError) {
          console.error('Failed to use coupon, rolling back order:', couponError);
          // 쿠폰 처리 실패 시 주문 삭제 (롤백)
          // 임시로 deleteDoc을 직접 사용하거나 cancelOrder로 대체 가능하지만, 아예 삭제하는 것이 맞음.
          // 여기서는 에러를 던져서 아래 catch 블록으로 이동시키되, 그 전에 삭제 로직 필요.
          // createOrder가 성공했으므로 orderId가 존재함.

          // 동적 import로 deleteDoc 등 가져와서 처리하기 보다는, 일단은 에러 메시지 명확히 하고
          // 사용자에게 '주문 실패 (쿠폰 오류)' 알림. 
          // 하지만 중복 주문 방지를 위해 여기서 삭제 api 호출이 이상적임.
          // 간단히는: 에러를 throw하고, 사용자가 다시 시도하게 함. 
          // 하지만 이미 생성된 주문이 남는게 문제.

          // 해결책: 주문 생성 후 쿠폰 사용이 아니라, 트랜잭션으로 묶는게 베스트지만 
          // Firestore 클라이언트 SDK에서 서로 다른 컬렉션(주문/쿠폰) 트랜잭션은 가능.
          // 하지만 지금 구조상 복잡하므로, 롤백 코드를 추가.

          const { doc, deleteDoc } = await import('firebase/firestore');
          const { db } = await import('../lib/firebase');
          await deleteDoc(doc(db, 'stores', storeId, 'orders', orderId));

          throw new Error('쿠폰 적용에 실패하여 주문이 취소되었습니다.');
        }
      }

      // 3. 결제 수단이 '앱결제'인 경우 NICEPAY 호출
      if (formData.paymentType === '앱결제') {
        const clientId = import.meta.env.VITE_NICEPAY_CLIENT_ID;
        if (!clientId) {
          toast.error('결제 시스템이 아직 설정되지 않았습니다. 관리자에게 문의하세요.');
          setIsSubmitting(false);
          return;
        }

        const { requestNicepayPayment } = await import('../lib/nicepayClient');

        await requestNicepayPayment({
          clientId: import.meta.env.VITE_NICEPAY_CLIENT_ID,
          method: 'card',
          orderId: orderId,
          amount: finalTotal,
          goodsName: items.length > 1 ? `${items[0].name} 외 ${items.length - 1}건` : items[0].name,
          buyerName: user.displayName || '고객',
          buyerEmail: user.email || '',
          buyerTel: formData.phone,
          returnUrl: import.meta.env.VITE_NICEPAY_RETURN_URL || `${window.location.origin}/nicepay/return`,
        });

      } else {
        // 만나서 결제인 경우: 이미 '접수' 상태로 생성되었으므로 추가 업데이트 불필요
        clearCart();
        toast.success('주문이 접수되었습니다! 🎉');
        navigate('/orders');
      }
    } catch (error) {
      console.error('Order creation error:', error);
      toast.error('주문 처리 중 오류가 발생했습니다');
      setIsSubmitting(false);
    }
    // finally: 앱결제 시에는 리다이렉트하므로 finally에서 submitting을 false로 돌리면 안될 수도 있음.
    // 하지만 에러 발생 시에는 꺼야 함. isSubmitting 상태 관리가 중요.
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/cart')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            장바구니로 돌아가기
          </button>
          <h1 className="text-3xl mb-2">
            <span className="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
              주문하기
            </span>
          </h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Order Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* 주문 타입 선택 */}
              <Card>
                <h2 className="text-xl font-bold text-gray-900 mb-4">주문 방법</h2>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setOrderType('배달주문');
                      setFormData({ ...formData, paymentType: '앱결제' });
                    }}
                    className={`
                      flex flex-col items-center justify-center p-6 rounded-lg border-2 transition-all
                      ${orderType === '배달주문'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }
                    `}
                  >
                    <ShoppingBag className="w-8 h-8 mb-2" />
                    <span className="font-bold">배달주문</span>
                    <span className="text-xs mt-1">배달비 3,000원</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setOrderType('포장주문');
                      setFormData({ ...formData, paymentType: '앱결제', address: '' });
                    }}
                    className={`
                      flex flex-col items-center justify-center p-6 rounded-lg border-2 transition-all
                      ${orderType === '포장주문'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }
                    `}
                  >
                    <Package className="w-8 h-8 mb-2" />
                    <span className="font-bold">포장주문</span>
                    <span className="text-xs mt-1">배달비 없음</span>
                  </button>
                </div>
              </Card>

              {/* 주문 정보 입력 */}
              <Card>
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  {orderType === '배달주문' ? (
                    <>
                      <MapPin className="w-6 h-6 mr-2 text-blue-600" />
                      배달 정보
                    </>
                  ) : (
                    <>
                      <Phone className="w-6 h-6 mr-2 text-blue-600" />
                      포장 정보
                    </>
                  )}
                </h2>
                <div className="space-y-4">
                  {orderType === '배달주문' && (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <Input
                            label="배달 주소"
                            placeholder="주소 검색을 클릭해주세요"
                            value={formData.address}
                            readOnly
                            onClick={() => setIsAddressSearchOpen(true)}
                            className="cursor-pointer bg-gray-50"
                            required
                          />
                        </div>
                        <div className="mt-8">
                          <Button
                            type="button"
                            onClick={() => setIsAddressSearchOpen(true)}
                            variant="outline"
                            className="whitespace-nowrap h-[42px]"
                          >
                            <Search className="w-4 h-4 mr-1" />
                            주소 검색
                          </Button>
                        </div>
                      </div>
                      {formData.address && (
                        <div className="animate-fade-in">
                          <Input
                            placeholder="상세 주소를 입력해주세요 (예: 101동 101호)"
                            value={formData.detailAddress}
                            onChange={(e) => setFormData({ ...formData, detailAddress: e.target.value })}
                            required
                          />
                        </div>
                      )}
                    </div>
                  )}
                  <Input
                    label="연락처"
                    type="tel"
                    placeholder="010-1234-5678"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    icon={<Phone className="w-5 h-5" />}
                    required
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      요청사항 (선택)
                    </label>
                    <textarea
                      placeholder={orderType === '배달주문' ? '배달 시 요청사항을 입력해주세요' : '포장 시 요청사항을 입력해주세요'}
                      value={formData.memo}
                      onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
                      className="w-full px-4 py-2.5 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder:text-gray-400 resize-none"
                      rows={3}
                    />
                  </div>
                </div>
              </Card>

              {/* 결제 방법 선택 */}
              <Card>
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <CreditCard className="w-6 h-6 mr-2 text-blue-600" />
                  결제 방법
                </h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {paymentTypes.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, paymentType: type.value as any })}
                      className={`
                        flex items-center justify-center space-x-2 p-4 rounded-lg border-2 transition-all
                        ${formData.paymentType === type.value
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                        }
                      `}
                    >
                      {type.icon}
                      <span className="font-medium">{type.label}</span>
                    </button>
                  ))}
                </div>
              </Card>

              {/* 쿠폰 적용 */}
              <Card>
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <Ticket className="w-6 h-6 mr-2 text-orange-600" />
                    쿠폰 적용
                  </div>
                  {selectedCoupon && (
                    <button
                      type="button"
                      onClick={() => setSelectedCoupon(null)}
                      className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
                    >
                      <X className="w-4 h-4" />
                      쿠폰 취소
                    </button>
                  )}
                </h2>

                {selectedCoupon && (
                  <div className="mb-4 p-4 bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-300 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-orange-900">{selectedCoupon.name}</p>
                        <p className="text-sm text-orange-700">
                          {selectedCoupon.discountType === 'percentage'
                            ? `${selectedCoupon.discountValue}% 할인`
                            : `${selectedCoupon.discountValue.toLocaleString()}원 할인`}
                        </p>
                      </div>
                      <p className="text-xl font-bold text-orange-600">
                        -{discountAmount.toLocaleString()}원
                      </p>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  {availableCoupons.length > 0 ? (
                    <>
                      {availableCoupons.map(coupon => (
                        <button
                          key={coupon.id}
                          type="button"
                          onClick={() => setSelectedCoupon(coupon)}
                          className={`
                            w-full p-4 rounded-lg border-2 transition-all text-left
                            ${selectedCoupon?.id === coupon.id
                              ? 'border-orange-500 bg-orange-50'
                              : 'border-gray-200 hover:border-orange-300 bg-white hover:bg-orange-50/50'
                            }
                          `}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Ticket className={`w-5 h-5 ${selectedCoupon?.id === coupon.id ? 'text-orange-600' : 'text-gray-400'}`} />
                              <div>
                                <p className={`font-bold ${selectedCoupon?.id === coupon.id ? 'text-orange-900' : 'text-gray-900'}`}>
                                  {coupon.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  최소 주문 {coupon.minOrderAmount.toLocaleString()}원 · {' '}
                                  {toDate(coupon.validUntil).toLocaleDateString('ko-KR')}까지
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className={`font-bold ${selectedCoupon?.id === coupon.id ? 'text-orange-600' : 'text-gray-900'}`}>
                                {coupon.discountType === 'percentage'
                                  ? `${coupon.discountValue}%`
                                  : `${coupon.discountValue.toLocaleString()}원`}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </>
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      <Ticket className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">사용 가능한 쿠폰이 없습니다</p>
                      <p className="text-xs text-gray-400 mt-1">
                        최소 주문 금액을 확인해주세요
                      </p>
                    </div>
                  )}
                </div>
              </Card>

              {/* 주문 상품 요약 */}
              <Card>
                <h2 className="text-xl font-bold text-gray-900 mb-4">주문 상품</h2>
                <div className="space-y-3">
                  {items.map((item) => {
                    const optionsPrice = item.options?.reduce((sum, opt) => sum + (opt.price * (opt.quantity || 1)), 0) || 0;
                    return (
                      <div key={item.id} className="flex justify-between items-start py-2 border-b border-gray-100 last:border-0">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{item.name}</p>
                          {item.options && item.options.length > 0 && (
                            <p className="text-sm text-gray-600">
                              {item.options.map(opt => `${opt.name}${(opt.quantity || 1) > 1 ? ` x${opt.quantity}` : ''}`).join(', ')}
                            </p>
                          )}
                          <p className="text-sm text-gray-600">수량: {item.quantity}개</p>
                        </div>
                        <p className="font-semibold text-gray-900">
                          {((item.price + optionsPrice) * item.quantity).toLocaleString()}원
                        </p>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>

            {/* 주문 요약 */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <h2 className="text-xl font-bold text-gray-900 mb-4">결제 금액</h2>

                <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                  <div className="flex items-center justify-between text-gray-600">
                    <span>상품 금액</span>
                    <span>{getTotalPrice().toLocaleString()}원</span>
                  </div>
                  <div className="flex items-center justify-between text-gray-600">
                    <span>배달비</span>
                    <span className={deliveryFee === 0 ? 'text-green-600 font-medium' : ''}>
                      {deliveryFee === 0 ? '무료' : `${deliveryFee.toLocaleString()}원`}
                    </span>
                  </div>
                  {selectedCoupon && (
                    <div className="flex items-center justify-between text-gray-600">
                      <span>할인 금액</span>
                      <span className="text-red-600 font-medium">
                        {discountAmount.toLocaleString()}원
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between mb-6 text-xl font-bold">
                  <span>총 결제 금액</span>
                  <span className="text-blue-600">
                    {finalTotal.toLocaleString()}원
                  </span>
                </div>

                <Button
                  type="submit"
                  fullWidth
                  size="lg"
                  isLoading={isSubmitting}
                  disabled={
                    (orderType === '배달주문' && (!formData.address || !formData.phone)) ||
                    (orderType === '포장주문' && !formData.phone)
                  }
                  className="group"
                >
                  {!isSubmitting && (
                    <>
                      <CheckCircle2 className="w-5 h-5 mr-2" />
                      {orderType === '배달주문' ? '배달 주문하기' : '포장 주문하기'}
                    </>
                  )}
                </Button>
              </Card>
            </div>
          </div>
        </form>
      </div>
      {isAddressSearchOpen && (
        <AddressSearchModal
          onClose={() => setIsAddressSearchOpen(false)}
          onComplete={(address) => {
            setFormData(prev => ({ ...prev, address }));
            // 상세 주소 입력창으로 포커스를 이동하면 좋겠지만, 
            // 여기서는 상태 업데이트만 처리
          }}
        />
      )}
    </div>
  );
}
```

---

## File: src\pages\LoginPage.tsx

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

  // Demo account info
  const fillDemoAccount = () => {
    setEmail('user@demo.com');
    setPassword('demo123');
  };

  const fillAdminAccount = () => {
    setEmail('admin@demo.com');
    setPassword('admin123');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
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

        {/* Login Form */}
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

          {/* Demo Accounts */}
          <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <p className="text-sm text-blue-900 mb-3 flex items-center">
              <span className="mr-2">💡</span>
              데모 계정으로 빠르게 체험하기
            </p>
            <div className="flex gap-2">
              <button
                onClick={fillDemoAccount}
                className="flex-1 px-3 py-2 text-sm bg-white border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
              >
                일반 사용자
              </button>
              <button
                onClick={fillAdminAccount}
                className="flex-1 px-3 py-2 text-sm bg-white border border-orange-200 text-orange-600 rounded-lg hover:bg-orange-50 transition-colors"
              >
                관리자
              </button>
            </div>
          </div>

          {/* Sign Up Link */}
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

        {/* Back to Home */}
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

---

## File: src\pages\MenuPage.tsx

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

  // Firestore에서 메뉴 조회
  const { data: menus, loading } = useFirestoreCollection<Menu>(
    storeId ? getAllMenusQuery(storeId) : null
  );

  const filteredMenus = useMemo(() => {
    if (!menus) return [];

    let filtered = menus;

    // Category filter
    if (selectedCategory !== '전체') {
      filtered = filtered.filter(menu => menu.category.includes(selectedCategory));
    }

    // Search filter
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
        {/* Header - 모바일 최적화 */}
        <div className="container mx-auto px-4 mb-6">
          <h1 className="text-2xl sm:text-3xl mb-2">
            <span className="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
              메뉴
            </span>
          </h1>
          <p className="text-sm sm:text-base text-gray-600">신선하고 맛있는 메뉴를 만나보세요</p>
        </div>

        {/* Search - 모바일 최적화 */}
        <div className="container mx-auto px-4 mb-6">
          <Input
            type="text"
            placeholder="메뉴를 검색해보세요"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search className="w-5 h-5" />}
          />
        </div>

        {/* Results Info */}
        <div className="container mx-auto px-4 mb-4">
          <p className="text-sm text-gray-600">
            총 <span className="font-semibold text-blue-600">{filteredMenus.length}</span>개의 메뉴
          </p>
        </div>

        {/* Menu List - 모바일 가로 스크롤, 데스크톱 그리드 */}
        {filteredMenus.length > 0 ? (
          <>
            {/* 모바일: 가로 스크롤 */}
            <div className="md:hidden">
              <div className="flex gap-4 overflow-x-auto hide-scrollbar px-4 snap-x snap-mandatory">
                {filteredMenus.map((menu) => (
                  <div key={menu.id} className="flex-shrink-0 w-[280px] snap-start">
                    <MenuCard menu={menu} />
                  </div>
                ))}
              </div>
            </div>

            {/* 데스크톱: 그리드 */}
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

      {/* Review Preview Section */}
      <ReviewPreview />
    </div>
  );
}
```

---

## File: src\pages\MyPage.tsx

```typescript
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useStore } from '../contexts/StoreContext';
import { User, ShoppingBag, Ticket, Bell, Store, ChevronRight, LogOut, Package } from 'lucide-react';
import Card from '../components/common/Card';
import { Order } from '../types/order';
import { Coupon } from '../types/coupon';
import { useFirestoreCollection } from '../hooks/useFirestoreCollection';
import { getUserOrdersQuery } from '../services/orderService';
import { getActiveCouponsQuery } from '../services/couponService';
import { toast } from 'sonner';

export default function MyPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { store } = useStore();
  const [notificationEnabled, setNotificationEnabled] = useState(false);

  // 상점 정보 (store가 로딩 중이거나 없으면 안전하게 처리)
  const storeInfo = store || {
    id: 'demo-store',
    name: '상점 정보 로딩 중...',
    phone: '',
    address: '',
    businessHours: undefined,
  };

  // 1. 최근 주문 조회 (실데이터)
  // user와 store가 있을 때만 쿼리 생성
  const ordersQuery = (store?.id && user?.id)
    ? getUserOrdersQuery(store.id, user.id)
    : null;

  const { data: allOrders, loading: ordersLoading } = useFirestoreCollection<Order>(ordersQuery);

  // 헬퍼 함수: Firestore Timestamp 처리를 위한 toDate
  const toDate = (date: any): Date => {
    if (date?.toDate) return date.toDate();
    if (date instanceof Date) return date;
    if (typeof date === 'string') return new Date(date);
    return new Date();
  };

  // 최근 3개만 잘라서 표시 (결제대기 상태는 제외 - 미결제 주문 건)
  const recentOrders = allOrders
    ? allOrders.filter(o => o.status !== '결제대기').slice(0, 3)
    : [];

  // 2. 사용 가능한 쿠폰 조회 (실데이터)
  const couponsQuery = store?.id ? getActiveCouponsQuery(store.id) : null;
  const { data: availableCoupons, loading: couponsLoading } = useFirestoreCollection<Coupon>(couponsQuery);

  // 사용한 쿠폰 필터링 (사용자 요청: 사용한 쿠폰은 숨김 처리)
  const myCoupons = availableCoupons?.filter(coupon =>
    !coupon.usedByUserIds?.includes(user?.id || '')
  ) || [];

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
      toast.success('로그아웃되었습니다');
    } catch (error) {
      toast.error('로그아웃 실패');
    }
  };

  const handleNotificationToggle = () => {
    setNotificationEnabled(!notificationEnabled);
    toast.success(`알림이 ${!notificationEnabled ? '켜졌습니다' : '꺼졌습니다'}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 mb-20">
        {/* 프로필 섹션 */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-gray-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {user?.displayName || '고객'}님
            </h1>
            <p className="text-gray-500">{user?.email}</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* 최근 주문 내역 */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg">최근 주문 내역</h2>
              </div>
              <button
                onClick={() => navigate('/orders')}
                className="text-sm text-gray-500 hover:text-gray-700 flex items-center"
              >
                전체보기 <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>

            {ordersLoading ? (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">로딩 중...</p>
              </div>
            ) : recentOrders.length > 0 ? (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => navigate(`/orders/${order.id}`)}
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {order.items[0]?.name} {order.items.length > 1 ? `외 ${order.items.length - 1}개` : ''}
                      </p>
                      <p className="text-xs text-gray-500">
                        {toDate(order.createdAt).toLocaleDateString('ko-KR')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">{order.totalPrice.toLocaleString()}원</p>
                      <p className="text-xs text-blue-600">{order.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Package className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">주문 내역이 없습니다</p>
              </div>
            )}
          </Card>

          {/* 쿠폰함 */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Ticket className="w-5 h-5 text-orange-600" />
              <h2 className="text-lg">쿠폰함</h2>
              <span className="text-sm text-gray-500">
                ({myCoupons.length}장)
              </span>
            </div>

            {couponsLoading ? (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">로딩 중...</p>
              </div>
            ) : (myCoupons.length > 0) ? (
              <div className="space-y-2">
                {myCoupons.map((coupon) => (
                  <div
                    key={coupon.id}
                    className="flex justify-between items-center p-3 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{coupon.name}</p>
                      <p className="text-xs text-gray-500">
                        {coupon.validUntil ? toDate(coupon.validUntil).toLocaleDateString('ko-KR') + '까지' : '유효기간 없음'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-orange-600 font-bold">
                        {coupon.discountType === 'percentage'
                          ? `${coupon.discountValue}%`
                          : `${coupon.discountValue.toLocaleString()}원`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">사용 가능한 쿠폰이 없습니다</p>
              </div>
            )}
          </Card>

          {/* 알림 설정 */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-green-600" />
                <div>
                  <h2 className="text-lg">알림 설정</h2>
                  <p className="text-sm text-gray-500">주문 상태 변경 시 알림을 받습니다</p>
                </div>
              </div>
              <button
                onClick={handleNotificationToggle}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notificationEnabled ? 'bg-blue-600' : 'bg-gray-300'}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notificationEnabled ? 'translate-x-6' : 'translate-x-1'}`}
                />
              </button>
            </div>
          </Card>

          {/* 가게 정보 */}
          {storeInfo && (
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Store className="w-5 h-5 text-purple-600" />
                <h2 className="text-lg">가게 정보</h2>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">상점명</p>
                  <p className="font-medium">{storeInfo.name}</p>
                </div>

                {storeInfo.phone && (
                  <div>
                    <p className="text-sm text-gray-500">전화번호</p>
                    <p className="font-medium">{storeInfo.phone}</p>
                  </div>
                )}

                {storeInfo.address && (
                  <div>
                    <p className="text-sm text-gray-500">주소</p>
                    <p className="font-medium">{storeInfo.address}</p>
                  </div>
                )}

                {storeInfo.businessHours && (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">영업시간</p>
                    <div className="space-y-1 text-sm">
                      {Object.entries(storeInfo.businessHours).map(([day, hours]) => {
                        if (!hours) return null;
                        const dayLabel: Record<string, string> = {
                          monday: '월',
                          tuesday: '화',
                          wednesday: '수',
                          thursday: '목',
                          friday: '금',
                          saturday: '토',
                          sunday: '일',
                        };
                        return (
                          <div key={day} className="flex justify-between">
                            <span className="text-gray-600">{dayLabel[day]}</span>
                            <span>
                              {hours.closed ? '휴무' : `${hours.open} - ${hours.close}`}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* 로그아웃 */}
          <Card className="p-6 mt-4">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 text-red-600 hover:text-red-700 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>로그아웃</span>
            </button>
          </Card>

          {/* 개발사 정보 */}
          <div className="mt-8 mb-4 text-center">
            <p className="text-xs text-gray-400 font-medium">Powered by KS Company</p>
            <div className="flex items-center justify-center gap-2 mt-1 text-[10px] text-gray-400">
              <span>개발사: KS컴퍼니</span>
              <span className="w-px h-2 bg-gray-300"></span>
              <span>대표: 석경선, 배종수</span>
            </div>
            <p className="text-[10px] text-gray-300 mt-1">© 2024 Simple Delivery App Template. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## File: src\pages\NoticePage.tsx

```typescript
import { Bell } from 'lucide-react';
import NoticeList from '../components/notice/NoticeList';

export default function NoticePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
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

        {/* Notice List */}
        <NoticeList />
      </div>
    </div>
  );
}
```

---

## File: src\pages\OrderDetailPage.tsx

```typescript
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, CreditCard, Clock, Package, CheckCircle2, MessageSquare, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, PAYMENT_TYPE_LABELS, OrderStatus, Order } from '../types/order';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import ReviewModal from '../components/review/ReviewModal';
import { toast } from 'sonner';
import { useStore } from '../contexts/StoreContext';
import { useFirestoreDocument } from '../hooks/useFirestoreDocument';

export default function OrderDetailPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { store } = useStore();
  const [showReviewModal, setShowReviewModal] = useState(false);

  // Fetch real order data
  // Path: stores/{storeId}/orders/{orderId}
  // useFirestoreDocument는 이제 서브컬렉션 경로 배열을 지원함
  const collectionPath = store?.id && orderId
    ? ['stores', store.id, 'orders']
    : null;
  const { data: order, loading, error } = useFirestoreDocument<Order>(
    collectionPath,
    orderId || null
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">주문 정보를 불러오는 중...</div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-xl text-gray-600 mb-4">
            {error ? '주문 정보를 불러오는데 실패했습니다' : '주문을 찾을 수 없습니다'}
          </p>
          <Button onClick={() => navigate('/orders')}>주문 목록으로</Button>
        </div>
      </div>
    );
  }

  // 헬퍼 함수: Firestore Timestamp 처리를 위한 toDate
  const toDate = (date: any): Date => {
    if (date?.toDate) return date.toDate();
    if (date instanceof Date) return date;
    if (typeof date === 'string') return new Date(date);
    return new Date();
  };

  // 헬퍼 함수: 사용자용 상태 라벨 변환
  const getDisplayStatus = (status: OrderStatus) => {
    switch (status) {
      case '접수': return '접수중';
      case '접수완료': return '접수확인';
      case '조리완료': return '조리 완료';
      case '포장완료': return '포장 완료';
      default: return ORDER_STATUS_LABELS[status];
    }
  };

  const statusColor = ORDER_STATUS_COLORS[order.status as OrderStatus] || ORDER_STATUS_COLORS['접수'];

  const handleReorder = () => {
    // TODO: 장바구니에 담기 로직 구현 필요 (여기서는 메시지만 표시)
    toast.success('이 기능은 준비 중입니다 (재주문)');
    // navigate('/cart');
  };

  const deliverySteps: OrderStatus[] = ['접수', '접수완료', '조리중', '배달중', '완료'];
  const pickupSteps: OrderStatus[] = ['접수', '접수완료', '조리중', '조리완료', '포장완료'];

  const isPickup = order.orderType === '포장주문';
  const statusSteps = isPickup ? pickupSteps : deliverySteps;

  const currentStepIndex = statusSteps.indexOf(order.status as OrderStatus);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/orders')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            주문 목록으로
          </button>
          <h1 className="text-3xl mb-2">
            <span className="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
              주문 상세
            </span>
          </h1>
          <p className="text-gray-600">주문번호: {order.id.slice(0, 8)}</p>
        </div>

        <div className="space-y-6">
          {/* Order Status */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${statusColor.bg}`}>
                  <Package className={`w-8 h-8 ${statusColor.text}`} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {getDisplayStatus(order.status as OrderStatus)}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {toDate(order.createdAt).toLocaleString('ko-KR')}
                  </p>
                </div>
              </div>
              <Badge
                variant={
                  order.status === '완료' || order.status === '포장완료' ? 'success' :
                    order.status === '취소' ? 'danger' :
                      order.status === '배달중' || order.status === '조리완료' ? 'secondary' :
                        'primary'
                }
                size="lg"
              >
                {getDisplayStatus(order.status as OrderStatus)}
              </Badge>
            </div>

            {/* Status Progress */}
            {order.status !== '취소' && (
              <div className="mb-6">
                <div className="flex items-center justify-between">
                  {statusSteps.map((step, idx) => (
                    <div key={step} className="flex-1 flex flex-col items-center relative">
                      <div className={`
                        w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center mb-2 transition-all relative z-10 shadow-sm
                        ${idx <= currentStepIndex ? 'gradient-primary text-white ring-2 ring-white' : 'bg-gray-100 text-gray-300'}
                      `}>
                        {idx <= currentStepIndex ? (
                          <CheckCircle2 className="w-4 h-4 sm:w-6 sm:h-6" />
                        ) : (
                          <Clock className="w-4 h-4 sm:w-6 sm:h-6" />
                        )}
                      </div>
                      <p className={`text-[10px] sm:text-xs text-center font-medium whitespace-nowrap ${idx <= currentStepIndex ? 'text-gray-900' : 'text-gray-400'}`}>
                        {getDisplayStatus(step)}
                      </p>
                      {idx < statusSteps.length - 1 && (
                        <div className={`absolute h-[2px] w-full top-4 sm:top-5 left-1/2 -z-0 ${idx < currentStepIndex ? 'bg-primary-500' : 'bg-gray-100'}`} />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Order Items */}
          <Card>
            <h3 className="text-xl font-bold text-gray-900 mb-4">주문 상품</h3>
            <div className="space-y-4">
              {order.items.map((item, idx) => {
                const optionsPrice = item.options?.reduce((sum, opt) => sum + opt.price, 0) || 0;
                return (
                  <div key={idx} className="flex items-start space-x-4 pb-4 border-b border-gray-200 last:border-0 last:pb-0">
                    {item.imageUrl && (
                      <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">{item.name}</h4>
                      {item.options && item.options.length > 0 && (
                        <div className="space-y-0.5 mb-2">
                          {item.options.map((opt, optIdx) => (
                            <p key={optIdx} className="text-sm text-gray-600">
                              + {opt.name} (+{opt.price.toLocaleString()}원)
                            </p>
                          ))}
                        </div>
                      )}
                      <p className="text-sm text-gray-600">수량: {item.quantity}개</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">
                        {((item.price + optionsPrice) * item.quantity).toLocaleString()}원
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Delivery Info */}
          <Card>
            <h3 className="text-xl font-bold text-gray-900 mb-4">배달 정보</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-600 mb-1">배달 주소</p>
                  <p className="font-medium text-gray-900">{order.address}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Phone className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-600 mb-1">연락처</p>
                  <p className="font-medium text-gray-900">{order.phone}</p>
                </div>
              </div>
              {order.requestMessage && (
                <div className="flex items-start space-x-3">
                  <MessageSquare className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-600 mb-1">요청사항</p>
                    <p className="font-medium text-gray-900">{order.requestMessage}</p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Payment Info */}
          <Card>
            <h3 className="text-xl font-bold text-gray-900 mb-4">결제 정보</h3>
            <div className="space-y-3 mb-4 pb-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <CreditCard className="w-5 h-5 text-gray-400" />
                <p className="font-medium text-gray-900">
                  {order.paymentType ? PAYMENT_TYPE_LABELS[order.paymentType] : '결제 정보 없음'}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-gray-600">
                <span>상품 금액</span>
                <span>{(order.totalPrice - 3000).toLocaleString()}원</span>
              </div>
              <div className="flex items-center justify-between text-gray-600">
                <span>배달비</span>
                <span>3,000원</span>
              </div>
              <div className="flex items-center justify-between text-xl font-bold pt-3 border-t border-gray-200">
                <span>총 결제 금액</span>
                <span className="text-blue-600">{order.totalPrice.toLocaleString()}원</span>
              </div>
            </div>
          </Card>

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="outline" fullWidth onClick={handleReorder}>
              재주문하기
            </Button>
            {(order.status === '완료' || order.status === '포장완료') && (
              <Button fullWidth onClick={() => setShowReviewModal(true)}>
                리뷰 작성하기
              </Button>
            )}
          </div>
        </div>
      </div>

      {showReviewModal && (
        <ReviewModal
          orderId={order.id}
          onClose={() => setShowReviewModal(false)}
          onSubmit={async (review) => {
            console.log('Review submitted:', review);
            toast.success('리뷰가 등록되었습니다!');
            // 실제 저장은 ReviewModal 내부에서 처리하거나 여기서 handler를 연결해야 함
            // ReviewModal 구현을 확인해봐야 함.
          }}
        />
      )}
    </div>
  );
}
```

---

## File: src\pages\OrdersPage.tsx

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

// 헬퍼 함수: Firestore Timestamp 처리를 위한 toDate
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

  // Firestore에서 현재 사용자의 주문 조회
  const ordersQuery = (store?.id && user?.id)
    ? getUserOrdersQuery(store.id, user.id)
    : null;

  const { data: allOrders, loading } = useFirestoreCollection<Order>(ordersQuery);

  const filteredOrders = filter === '전체'
    ? (allOrders || []).filter(order => order.status !== '결제대기')
    : (allOrders || []).filter(order => order.status === filter);

  // 헬퍼 함수: 사용자용 상태 라벨 변환
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
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl mb-2">
            <span className="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
              내 주문
            </span>
          </h1>
          <p className="text-gray-600">주문 내역을 확인하고 관리하세요</p>
        </div>

        {/* Status Filter */}
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

        {/* Orders List */}
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

  // 리뷰 작성 가능 여부 (완료 상태만)
  const canReview = order.status === '완료';

  return (
    <>
      <Card>
        {/* 클릭 가능한 메인 영역 */}
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

        {/* 리뷰 작성 버튼 (완료된 주문만) */}
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

      {/* 리뷰 모달 */}
      {showReviewModal && (
        <ReviewModal
          orderId={order.id}
          onClose={() => setShowReviewModal(false)}
          onSuccess={() => {
            // 주문 목록 새로고침
            window.location.reload();
          }}
        />
      )}
    </>
  );
}
```

---

## File: src\pages\SignupPage.tsx

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
    // Clear error when user starts typing
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
        {/* Logo */}
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

        {/* Signup Form */}
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

          {/* Benefits */}
          <div className="mt-6 p-4 bg-gradient-to-br from-blue-50 to-orange-50 rounded-xl">
            <p className="text-sm font-medium text-gray-900 mb-3">회원 혜택</p>
            <ul className="space-y-2">
              <BenefitItem text="신규 가입 쿠폰 즉시 지급" />
              <BenefitItem text="주문 내역 관리 및 재주문" />
              <BenefitItem text="맞춤 추천 메뉴 제공" />
            </ul>
          </div>

          {/* Login Link */}
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

        {/* Back to Home */}
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

---

## File: src\pages\StoreSetupWizard.tsx

```typescript
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useStore } from '../contexts/StoreContext';
import { StoreFormData } from '../types/store';
import { toast } from 'sonner';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Card from '../components/common/Card';
import { Store as StoreIcon, ChevronRight, ChevronLeft, Check } from 'lucide-react';

// 현재 버전에서는 '단일 상점' 아키텍처를 따르므로 고정된 ID를 사용합니다.
// 향후 멀티 스토어 플랫폼으로 확장 시, 이 값을 동적으로 생성하거나 사용자 입력을 받도록 수정해야 합니다.
const DEFAULT_STORE_ID = 'default';

const STEPS = [
  { id: 1, name: '기본 정보', description: '상점 이름과 설명' },
  { id: 2, name: '연락처', description: '전화번호, 이메일, 주소' },
  { id: 3, name: '배달 설정', description: '배달비, 최소 주문 금액' },
  { id: 4, name: '완료', description: '설정 확인 및 생성' },
];

export default function StoreSetupWizard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { store, loading: storeLoading } = useStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // 이미 상점이 설정되어 있다면 관리자 페이지로 이동
  useEffect(() => {
    if (!storeLoading && store) {
      toast.info('이미 상점이 설정되어 있습니다.');
      navigate('/admin');
    }
  }, [store, storeLoading, navigate]);

  const [formData, setFormData] = useState<StoreFormData>({
    name: '',
    description: '',
    phone: '',
    email: user?.email || '',
    address: '',
    deliveryFee: 3000,
    minOrderAmount: 15000,
  });

  if (storeLoading) return null;

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.name) {
          toast.error('상점 이름을 입력해주세요');
          return false;
        }
        if (formData.name.length < 2) {
          toast.error('상점 이름은 최소 2자 이상이어야 합니다');
          return false;
        }
        return true;
      case 2:
        if (!formData.phone || !formData.email || !formData.address) {
          toast.error('모든 연락처 정보를 입력해주세요');
          return false;
        }
        return true;
      case 3:
        if (formData.deliveryFee < 0 || formData.minOrderAmount < 0) {
          toast.error('금액은 0 이상이어야 합니다');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error('로그인이 필요합니다');
      return;
    }

    setLoading(true);

    try {
      // 1. 상점 데이터 문서 생성 (store/default)
      const storeData = {
        ...formData,
        id: DEFAULT_STORE_ID,
        logoUrl: '',
        bannerUrl: '',
        primaryColor: '#3b82f6',
        businessHours: {},
        settings: {
          autoAcceptOrders: false,
          estimatedDeliveryTime: 30,
          paymentMethods: ['앱결제', '만나서카드', '만나서현금'],
          enableReviews: true,
          enableCoupons: true,
          enableNotices: true,
          enableEvents: true,
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      // 1. 상점 문서 생성 (단일 상점 모드: 'default' ID 사용)
      await setDoc(doc(db, 'stores', DEFAULT_STORE_ID), storeData);

      // 2. 관리자-상점 매핑 생성 (권한 부여용)
      // 이 매핑이 있어야 firestore.rules의 isStoreOwner()가 true를 반환하여 수정 권한을 가짐
      if (user?.id) {
        const adminStoreId = `${user.id}_${DEFAULT_STORE_ID}`;
        await setDoc(doc(db, 'adminStores', adminStoreId), {
          adminUid: user.id,
          storeId: DEFAULT_STORE_ID,
          role: 'owner',
          createdAt: serverTimestamp(),
        });

        // 3. 사용자 문서에 role 업데이트 (선택 사항, 클라이언트 편의용)
        // await updateDoc(doc(db, 'users', user.id), { role: 'admin' }); 
      }



      // 성공 메시지 및 이동
      toast.success('상점이 성공적으로 생성되었습니다!');

      // 스토어 컨텍스트 갱신을 위해 잠시 대기
      setTimeout(() => {
        refreshStore();
        navigate('/admin');
        window.location.reload(); // StoreContext 새로고침
      }, 1000);
    } catch (error) {
      console.error('Failed to create store:', error);
      toast.error('상점 생성에 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 gradient-primary rounded-3xl mb-4">
            <Store className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl mb-2">
            <span className="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
              상점 만들기
            </span>
          </h1>
          <p className="text-gray-600">나만의 배달 앱을 만들어보세요</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${currentStep > step.id
                      ? 'bg-green-500 text-white'
                      : currentStep === step.id
                        ? 'gradient-primary text-white'
                        : 'bg-gray-200 text-gray-500'
                      }`}
                  >
                    {currentStep > step.id ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <span>{step.id}</span>
                    )}
                  </div>
                  <div className="mt-2 text-center">
                    <p className="text-sm font-medium text-gray-900">{step.name}</p>
                    <p className="text-xs text-gray-500 hidden sm:block">{step.description}</p>
                  </div>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`h-1 flex-1 mx-2 ${currentStep > step.id ? 'bg-green-500' : 'bg-gray-200'
                      }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <Card className="p-8">
          {/* Step 1: 기본 정보 */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">기본 정보</h2>

              <Input
                label="상점 이름"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="예: 맛있는 포집"
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  상점 설명
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                  rows={4}
                  placeholder="상점을 소개하는 짧은 설명을 작성해주세요"
                />
              </div>
            </div>
          )}

          {/* Step 2: 연락처 */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">연락처 정보</h2>

              <Input
                label="전화번호"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="010-1234-5678"
                required
              />

              <Input
                label="이메일"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="contact@example.com"
                required
              />

              <Input
                label="주소"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="서울시 강남구 테헤란로 123"
                required
              />
            </div>
          )}

          {/* Step 3: 배달 설정 */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">배달 설정</h2>

              <Input
                label="배달비 (원)"
                type="number"
                value={formData.deliveryFee}
                onChange={(e) => setFormData({ ...formData, deliveryFee: parseInt(e.target.value) || 0 })}
                placeholder="3000"
                required
              />

              <Input
                label="최소 주문 금액 (원)"
                type="number"
                value={formData.minOrderAmount}
                onChange={(e) => setFormData({ ...formData, minOrderAmount: parseInt(e.target.value) || 0 })}
                placeholder="15000"
                required
              />

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  💡 <strong>팁:</strong> 배달비와 최소 주문 금액은 나중에 상점 설정에서 변경할 수 있습니다.
                </p>
              </div>
            </div>
          )}

          {/* Step 4: 완료 */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">설정 확인</h2>

              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">상점 정보</h3>
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-gray-600">상점 이름:</dt>
                      <dd className="font-medium text-gray-900">{formData.name}</dd>
                    </div>
                  </dl>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">연락처</h3>
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-gray-600">전화:</dt>
                      <dd className="font-medium text-gray-900">{formData.phone}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">이메일:</dt>
                      <dd className="font-medium text-gray-900">{formData.email}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">주소:</dt>
                      <dd className="font-medium text-gray-900">{formData.address}</dd>
                    </div>
                  </dl>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">배달 설정</h3>
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-gray-600">배달비:</dt>
                      <dd className="font-medium text-gray-900">{formData.deliveryFee.toLocaleString()}원</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">최소 주문:</dt>
                      <dd className="font-medium text-gray-900">{formData.minOrderAmount.toLocaleString()}원</dd>
                    </div>
                  </dl>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800">
                  ✅ 모든 설정이 완료되었습니다! 상점을 생성하시겠습니까?
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-4 mt-8">
            {currentStep > 1 && (
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={loading}
              >
                <ChevronLeft className="w-5 h-5 mr-2" />
                이전
              </Button>
            )}

            {currentStep < 4 ? (
              <Button
                onClick={handleNext}
                fullWidth={currentStep === 1}
              >
                다음
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={loading}
                fullWidth
              >
                {loading ? '생성 중...' : '상점 만들기 🎉'}
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
```

---

## File: src\pages\WelcomePage.tsx

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
      {/* 로고 또는 대표 이미지 */}
      {/* 로고 또는 대표 이미지 */}
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

      {/* 상점 이름 */}
      <h1 className="text-4xl md:text-5xl font-bold text-primary-600 text-center mb-2">
        {store?.name || 'Simple Delivery'}
      </h1>

      {/* 로딩 인디케이터 (선택) */}
      <div className="mt-8 flex gap-2">
        <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
}
```

---

