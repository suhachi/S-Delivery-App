import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, CreditCard, Clock, Package, CheckCircle2, MessageSquare } from 'lucide-react';
import { useState } from 'react';
import { mockOrders } from '../data/mockOrders';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, PAYMENT_TYPE_LABELS, OrderStatus } from '../types/order';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import ReviewModal from '../components/review/ReviewModal';
import { toast } from 'sonner';

export default function OrderDetailPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [showReviewModal, setShowReviewModal] = useState(false);
  
  const order = mockOrders.find(o => o.id === orderId);

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">주문을 찾을 수 없습니다</p>
          <Button onClick={() => navigate('/orders')}>주문 목록으로</Button>
        </div>
      </div>
    );
  }

  const statusColor = ORDER_STATUS_COLORS[order.status as OrderStatus];

  const handleReorder = () => {
    toast.success('장바구니에 담았습���다');
    navigate('/cart');
  };

  const statusSteps: OrderStatus[] = ['접수', '조리중', '배달중', '완료'];
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
          <p className="text-gray-600">주문번호: {order.id}</p>
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
                    {ORDER_STATUS_LABELS[order.status as OrderStatus]}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {new Date(order.createdAt).toLocaleString('ko-KR')}
                  </p>
                </div>
              </div>
              <Badge
                variant={
                  order.status === '완료' ? 'success' :
                  order.status === '취소' ? 'danger' :
                  order.status === '배달중' ? 'secondary' :
                  'primary'
                }
                size="lg"
              >
                {ORDER_STATUS_LABELS[order.status as OrderStatus]}
              </Badge>
            </div>

            {/* Status Progress */}
            {order.status !== '취소' && (
              <div className="mb-6">
                <div className="flex items-center justify-between">
                  {statusSteps.map((step, idx) => (
                    <div key={step} className="flex-1 flex flex-col items-center">
                      <div className={`
                        w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all
                        ${idx <= currentStepIndex ? 'gradient-primary text-white' : 'bg-gray-200 text-gray-400'}
                      `}>
                        {idx <= currentStepIndex ? (
                          <CheckCircle2 className="w-6 h-6" />
                        ) : (
                          <Clock className="w-6 h-6" />
                        )}
                      </div>
                      <p className={`text-xs text-center ${idx <= currentStepIndex ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>
                        {ORDER_STATUS_LABELS[step]}
                      </p>
                      {idx < statusSteps.length - 1 && (
                        <div className={`absolute h-1 w-full top-5 left-1/2 -z-10 ${idx < currentStepIndex ? 'bg-blue-500' : 'bg-gray-200'}`} />
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
              {order.memo && (
                <div className="flex items-start space-x-3">
                  <MessageSquare className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-600 mb-1">요청사항</p>
                    <p className="font-medium text-gray-900">{order.memo}</p>
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
                <p className="font-medium text-gray-900">{PAYMENT_TYPE_LABELS[order.paymentType]}</p>
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
            {order.status === '완료' && (
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
          onSubmit={(review) => {
            console.log('Review submitted:', review);
            // TODO: Firebase에 리뷰 저장
          }}
        />
      )}
    </div>
  );
}