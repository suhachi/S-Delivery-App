/// <reference types="vite/client" />
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Phone, CreditCard, Wallet, DollarSign, ArrowLeft, CheckCircle2, ShoppingBag, Package, Ticket, X } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useStore } from '../contexts/StoreContext';
import { toast } from 'sonner';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { Coupon } from '../types/coupon';
import { createOrder } from '../services/orderService';
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
  const [formData, setFormData] = useState({
    address: '',
    phone: '',
    memo: '',
    paymentType: '앱결제' as '앱결제' | '만나서카드' | '만나서현금' | '방문시결제',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // 주문 타입에 따른 배달비 계산
  const deliveryFee = orderType === '배달주문' ? 3000 : 0;

  // 사용 가능한 쿠폰 필터링
  const availableCoupons = (coupons || []).filter(coupon => {
    const now = new Date();
    const itemsTotal = getTotalPrice();
    return (
      coupon.isActive &&
      coupon.validFrom <= now &&
      coupon.validUntil >= now &&
      itemsTotal >= coupon.minOrderAmount
    );
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
      const pendingOrderData = {
        userId: user.id,
        userDisplayName: user.displayName || '사용자',
        items,
        orderType,
        itemsPrice: getTotalPrice(),
        deliveryFee,
        discountAmount,
        totalPrice: finalTotal,
        address: formData.address,
        phone: formData.phone,
        memo: formData.memo,
        paymentType: formData.paymentType,
        couponId: selectedCoupon?.id || null,
        couponName: selectedCoupon?.name || null,
        adminDeleted: false,
        reviewed: false,
        paymentStatus: '결제대기' as const, // 초기 상태
      };

      // 1. 주문을 먼저 '결제대기' 상태로 생성 (createOrder 내부에서 status: '결제대기' 처리 필요하거나 여기서 명시)
      // orderService의 createOrder가 status를 덮어쓰지 않도록 수정 필요.
      // 일단 createOrder 호출 시 status 필드를 포함해서 보냅니다.
      const orderId = await createOrder(storeId, {
        ...pendingOrderData,
        status: '결제대기' as OrderStatus
      });

      // 2. 결제 수단이 '앱결제'인 경우 NICEPAY 호출
      if (formData.paymentType === '앱결제') {
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

        // NICEPAY 호출 후에는 여기서 리다이렉트되므로 추가 로직 불필요
      } else {
        // 만나서 결제인 경우 (기존 로직 유지)
        // 단, 상태는 '접수'로 바로 넘어가야 함 -> createOrder 수정 필요하거나 update 필요
        // 여기서는 간단히 '접수'로 다시 업데이트해줌
        const { updateOrderStatus } = await import('../services/orderService');
        await updateOrderStatus(storeId, orderId, '접수');

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
                    <Input
                      label="배달 주소"
                      placeholder="예: 서울시 강남구 테헤란로 123"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      required
                    />
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
                                  {new Date(coupon.validUntil).toLocaleDateString('ko-KR')}까지
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
                    const optionsPrice = item.options?.reduce((sum, opt) => sum + opt.price, 0) || 0;
                    return (
                      <div key={item.id} className="flex justify-between items-start py-2 border-b border-gray-100 last:border-0">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{item.name}</p>
                          {item.options && item.options.length > 0 && (
                            <p className="text-sm text-gray-600">
                              {item.options.map(opt => opt.name).join(', ')}
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
    </div>
  );
}