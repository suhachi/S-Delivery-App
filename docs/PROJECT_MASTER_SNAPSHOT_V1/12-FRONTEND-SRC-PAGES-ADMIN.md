# Frontend Source - Admin Pages

이 문서는 관리자 페이지들의 전체 코드를 포함합니다.

## 파일 목록

- `src/pages/admin/AdminDashboard.tsx`
- `src/pages/admin/AdminOrderManagement.tsx`
- `src/pages/admin/AdminMenuManagement.tsx`
- `src/pages/admin/AdminCouponManagement.tsx`
- `src/pages/admin/AdminReviewManagement.tsx`
- `src/pages/admin/AdminNoticeManagement.tsx`
- `src/pages/admin/AdminEventManagement.tsx`
- `src/pages/admin/AdminStoreSettings.tsx`

---

## src/pages/admin/AdminDashboard.tsx

```typescript
import { Package, DollarSign, Clock, CheckCircle2 } from 'lucide-react';
import { useStore } from '../../contexts/StoreContext';
import { useFirestoreCollection } from '../../hooks/useFirestoreCollection';
import { getAllOrdersQuery } from '../../services/orderService';
import { getAllMenusQuery } from '../../services/menuService';
import { Order, ORDER_STATUS_LABELS } from '../../types/order';
import { Menu } from '../../types/menu';

import AdminSidebar from '../../components/admin/AdminSidebar';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';

export default function AdminDashboard() {
  const { store } = useStore();

  const { data: orders, loading: ordersLoading } = useFirestoreCollection<Order>(
    store?.id ? getAllOrdersQuery(store.id) : null
  );

  const { data: menus, loading: menusLoading } = useFirestoreCollection<Menu>(
    store?.id ? getAllMenusQuery(store.id) : null
  );

  const isLoading = ordersLoading || menusLoading;

  // Calculate statistics based on real data
  const totalOrders = orders?.length || 0;
  const activeOrders = orders?.filter(o => ['접수', '조리중', '배달중'].includes(o.status)).length || 0;
  const completedOrders = orders?.filter(o => o.status === '완료').length || 0;
  const cancelledOrders = orders?.filter(o => o.status === '취소').length || 0;

  const totalRevenue = orders
    ?.filter(o => o.status === '완료')
    .reduce((sum, o) => sum + o.totalPrice, 0) || 0;

  const todayOrders = orders?.filter(o => {
    const today = new Date();
    const orderDate = new Date(o.createdAt);
    return orderDate.toDateString() === today.toDateString();
  }).length || 0;

  const stats = [
    {
      label: '오늘 주문',
      value: todayOrders,
      icon: <Package className="w-6 h-6" />,
      color: 'blue',
      suffix: '건',
    },
    {
      label: '총 매출',
      value: totalRevenue.toLocaleString(),
      icon: <DollarSign className="w-6 h-6" />,
      color: 'green',
      suffix: '원',
    },
    {
      label: '진행중 주문',
      value: activeOrders,
      icon: <Clock className="w-6 h-6" />,
      color: 'orange',
      suffix: '건',
    },
    {
      label: '완료 주문',
      value: completedOrders,
      icon: <CheckCircle2 className="w-6 h-6" />,
      color: 'purple',
      suffix: '건',
    },
  ];

  const recentOrders = orders?.slice(0, 5) || [];
  const registeredMenusCount = menus?.length || 0;
  const soldoutMenusCount = menus?.filter(m => m.soldout).length || 0;

  // Calculate average order value (avoid division by zero)
  const avgOrderValue = completedOrders > 0
    ? Math.round(totalRevenue / completedOrders)
    : 0;

  // Calculate cancellation rate
  const cancelRate = totalOrders > 0
    ? ((cancelledOrders / totalOrders) * 100).toFixed(1)
    : '0';

  if (!store && !isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar />
        <main className="flex-1 p-8 flex items-center justify-center">
          <p className="text-gray-500">상점 정보를 불러오는 중...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />

      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl mb-2">
              <span className="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
                대시보드
              </span>
            </h1>
            <p className="text-gray-600">매장 현황을 한눈에 확인하세요</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, idx) => (
              <StatCard key={idx} {...stat} loading={isLoading} />
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Recent Orders */}
            <Card className="lg:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">최근 주문</h2>
                <Badge variant="primary">{totalOrders}건</Badge>
              </div>

              {isLoading ? (
                <div className="py-8 text-center text-gray-500">로딩 중...</div>
              ) : recentOrders.length > 0 ? (
                <div className="space-y-3">
                  {recentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 mb-1">주문 #{order.id.slice(0, 8)}</p>
                        <p className="text-sm text-gray-600">
                          {order.items.length}개 상품 · {order.totalPrice.toLocaleString()}원
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(order.createdAt).toLocaleString('ko-KR')}
                        </p>
                      </div>
                      <Badge
                        variant={
                          order.status === '완료' ? 'success' :
                            order.status === '취소' ? 'danger' :
                              order.status === '배달중' ? 'secondary' :
                                'primary'
                        }
                      >
                        {ORDER_STATUS_LABELS[order.status]}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-gray-500">최근 주문 내역이 없습니다.</div>
              )}
            </Card>

            {/* Quick Stats */}
            <Card>
              <h2 className="text-xl font-bold text-gray-900 mb-6">빠른 통계</h2>
              <div className="space-y-4">
                <QuickStat
                  label="등록된 메뉴"
                  value={isLoading ? '-' : registeredMenusCount}
                  suffix="개"
                  color="blue"
                />
                <QuickStat
                  label="품절 메뉴"
                  value={isLoading ? '-' : soldoutMenusCount}
                  suffix="개"
                  color="red"
                />
                <QuickStat
                  label="평균 주문 금액"
                  value={isLoading ? '-' : avgOrderValue.toLocaleString()}
                  suffix="원"
                  color="green"
                />
                <QuickStat
                  label="취소율"
                  value={isLoading ? '-' : cancelRate}
                  suffix="%"
                  color="orange"
                />
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

import { StatCardProps, QuickStatProps } from '../../types/dashboard';

// ... (existing imports)

// ... (existing AdminDashboard component)

function StatCard({ label, value, icon, color, suffix, loading }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    orange: 'bg-orange-500',
    purple: 'bg-purple-500',
  }[color];

  return (
    <Card className="relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-2">{label}</p>
          <p className="text-3xl font-bold text-gray-900">
            {loading ? '-' : value}
            {!loading && suffix && <span className="text-lg text-gray-600 ml-1">{suffix}</span>}
          </p>
        </div>
        <div className={`w-12 h-12 ${colorClasses} rounded-xl flex items-center justify-center text-white`}>
          {icon}
        </div>
      </div>
      <div className={`absolute bottom-0 left-0 right-0 h-1 ${colorClasses}`} />
    </Card>
  );
}

function QuickStat({ label, value, suffix, color }: QuickStatProps) {
  const colorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    red: 'text-red-600',
    orange: 'text-orange-600',
    purple: 'text-purple-600',
  }[color];

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <span className="text-sm text-gray-700">{label}</span>
      <span className={`font-bold ${colorClasses}`}>
        {value}{suffix}
      </span>
    </div>
  );
}
```

---

## src/pages/admin/AdminOrderManagement.tsx

```typescript
import { useState, useEffect } from 'react';
import { Package, MapPin, Phone, CreditCard, ChevronDown } from 'lucide-react';
import { Order, OrderStatus, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, PAYMENT_TYPE_LABELS } from '../../types/order';
import { toast } from 'sonner';
import AdminSidebar from '../../components/admin/AdminSidebar';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { useStore } from '../../contexts/StoreContext';
import { useFirestoreCollection } from '../../hooks/useFirestoreCollection';
import { updateOrderStatus, deleteOrder, getAllOrdersQuery } from '../../services/orderService';
import AdminOrderAlert from '../../components/admin/AdminOrderAlert';
import { getNextStatus } from '../../utils/orderUtils';

// 헬퍼 함수: Firestore Timestamp 처리를 위한 toDate
function toDate(date: any): Date {
  if (date?.toDate) return date.toDate();
  if (date instanceof Date) return date;
  if (typeof date === 'string') return new Date(date);
  return new Date();
}

import Receipt from '../../components/admin/Receipt';

export default function AdminOrderManagement() {
  const { store } = useStore();
  const [filter, setFilter] = useState<OrderStatus | '전체'>('전체');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [printOrder, setPrintOrder] = useState<Order | null>(null);

  // Firestore에서 주문 조회 (삭제되지 않은 주문만)
  const { data: allOrders } = useFirestoreCollection<Order>(
    store?.id ? getAllOrdersQuery(store.id) : null
  );

  const filteredOrders = filter === '전체'
    ? (allOrders || []).filter(order => order.status !== '결제대기')
    : (allOrders || []).filter(order => order.status === filter);

  // 필터 순서 업데이트 (조리완료, 포장완료 추가)
  const filters: (OrderStatus | '전체')[] = ['전체', '접수', '접수완료', '조리중', '조리완료', '배달중', '포장완료', '완료', '취소'];

  // 인쇄를 위한 Effect Hooks (상태 변경 감지 후 실행)
  useEffect(() => {
    if (printOrder) {
      // 1. 현재 타이틀 저장
      const originalTitle = document.title;

      // 2. 파일명 생성을 위한 날짜 포맷팅 (YYYYMMDD_HHmm_OrderID)
      // Firestore Timestamp vs Date 객체 호환 처리
      const createdAt = printOrder.createdAt as any;
      let d = createdAt?.toDate ? createdAt.toDate() : new Date(createdAt);

      // Date 객체가 유효하지 않은 경우 현재 시간으로 대체
      if (isNaN(d.getTime())) {
        d = new Date();
      }

      const dateStr = d.getFullYear() +
        String(d.getMonth() + 1).padStart(2, '0') +
        String(d.getDate()).padStart(2, '0') + '_' +
        String(d.getHours()).padStart(2, '0') +
        String(d.getMinutes()).padStart(2, '0');

      // 안전한 파일명 생성 (특수문자 제거)
      const safeId = (printOrder.id || 'unknown').slice(0, 8).replace(/[^a-zA-Z0-9]/g, '');
      const newTitle = `${dateStr}_${safeId}`;

      document.title = newTitle;
      console.log('Printing with title:', newTitle); // 디버깅용

      // 3. 인쇄 실행
      // 브라우저 인쇄가 끝나면(취소 혹은 출력) 실행될 핸들러
      const handleAfterPrint = () => {
        document.title = originalTitle;
        setPrintOrder(null); // 상태 초기화
        window.removeEventListener('afterprint', handleAfterPrint);
      };

      window.addEventListener('afterprint', handleAfterPrint);

      // 렌더링 확보를 위한 짧은 지연 후 인쇄
      const printTimer = setTimeout(() => {
        window.print();
      }, 500);

      // 컴포넌트 언마운트 시 안전장치
      return () => {
        clearTimeout(printTimer);
        window.removeEventListener('afterprint', handleAfterPrint);
        document.title = originalTitle; // 혹시 모를 상황 대비 복구
      };
    }
  }, [printOrder]);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    if (!store?.id) return;
    try {
      await updateOrderStatus(store.id, orderId, newStatus);
      toast.success(`주문 상태가 '${ORDER_STATUS_LABELS[newStatus]}'(으)로 변경되었습니다`);

      // 주문 접수(확인) 시 영수증 자동 출력
      // 2024-12-10: 사용자 요청으로 자동 출력 기능 다시 활성화
      if (newStatus === '접수완료') {
        const targetOrder = allOrders?.find(o => o.id === orderId);
        if (targetOrder) {
          // 인쇄용 상태 업데이트 -> useEffect 트리거
          setPrintOrder(targetOrder);
        }
      }

    } catch (error: any) {
      console.error(error);
      if (error?.code === 'permission-denied') {
        toast.error('주문 상태를 변경할 권한이 없습니다.');
      } else {
        toast.error('주문 상태 변경에 실패했습니다');
      }
    }
  };

  const handleDelete = async (orderId: string) => {
    if (!store?.id) return;
    if (!window.confirm('정말로 이 주문을 삭제하시겠습니까? \n삭제된 주문은 복구할 수 없으며, 고객의 주문 내역에서도 사라집니다.')) return;

    try {
      await deleteOrder(store.id, orderId);
      toast.success('주문이 삭제되었습니다');
    } catch (error) {
      console.error(error);
      toast.error('주문 삭제에 실패했습니다');
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar className="print:hidden" />

      {/* 영수증 컴포넌트 (평소엔 숨김, 인쇄 시에만 등장) */}
      <Receipt order={printOrder} store={store} />

      <main className="flex-1 p-8 print:hidden">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl mb-2">
              <span className="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
                주문 관리
              </span>
            </h1>
            <p className="text-gray-600">총 {filteredOrders.length}개의 주문</p>
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
                {status === '전체' ? '전체' : ORDER_STATUS_LABELS[status]}
                <span className="ml-2 text-xs opacity-75">
                  ({(allOrders || []).filter(o => status === '전체' || o.status === status).length})
                </span>
              </button>
            ))}
          </div>

          {/* Orders List */}
          <div className="space-y-4">
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  isExpanded={expandedOrder === order.id}
                  onToggleExpand={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                  onStatusChange={handleStatusChange}
                  onDelete={handleDelete}
                  onPrint={() => setPrintOrder(order)}
                />
              ))
            ) : (
              <Card className="text-center py-16">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-xl text-gray-600">주문이 없습니다</p>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

interface OrderCardProps {
  order: Order;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onStatusChange: (orderId: string, newStatus: OrderStatus) => void;
  onDelete: (orderId: string) => void;
  onPrint: () => void;
}

function OrderCard({ order, isExpanded, onToggleExpand, onStatusChange, onDelete, onPrint }: OrderCardProps) {
  const statusColor = ORDER_STATUS_COLORS[order.status as OrderStatus];
  // getNextStatus 업데이트 (order 객체 전달)
  const nextStatus = getNextStatus(order);
  const [Printer] = useState(() => import('lucide-react').then(mod => mod.Printer)); // Dynamic import or just use lucide-react if already imported

  return (
    <Card padding="none" className="overflow-hidden">
      {/* Header */}
      <div
        className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={onToggleExpand}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4 flex-1">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${statusColor.bg} flex-shrink-0`}>
              <Package className={`w-7 h-7 ${statusColor.text}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="font-bold text-gray-900">주문 #{order.id.slice(0, 8)}</h3>
                <Badge
                  variant={
                    order.status === '완료' ? 'success' :
                      order.status === '취소' ? 'danger' :
                        order.status === '배달중' ? 'secondary' :
                          'primary'
                  }
                >
                  {ORDER_STATUS_LABELS[order.status as OrderStatus]}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mb-1">
                {order.items.length}개 상품 · {order.totalPrice.toLocaleString()}원
              </p>
              <p className="text-xs text-gray-500">
                {toDate(order.createdAt).toLocaleString('ko-KR')}
              </p>
            </div>
          </div>
          <ChevronDown
            className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          />
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="px-6 pb-6 pt-0 border-t border-gray-200 space-y-4 animate-fade-in">
          {/* Order Items */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">주문 상품</h4>
            <div className="space-y-2">
              {order.items.map((item, idx) => {
                const optionsPrice = item.options?.reduce((sum, opt) => sum + (opt.price * (opt.quantity || 1)), 0) || 0;
                return (
                  <div key={idx} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-start space-x-3 flex-1">
                      {item.imageUrl && (
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-900">{item.name}</p>
                        {item.options && item.options.length > 0 && (
                          <p className="text-xs text-gray-600">
                            {item.options.map(opt => `${opt.name}${(opt.quantity || 1) > 1 ? ` x${opt.quantity}` : ''} (+${(opt.price * (opt.quantity || 1)).toLocaleString()}원)`).join(', ')}
                          </p>
                        )}
                        <p className="text-sm text-gray-600 mt-1">수량: {item.quantity}개</p>
                      </div>
                    </div>
                    <p className="font-semibold text-gray-900 flex-shrink-0 ml-4">
                      {((item.price + optionsPrice) * item.quantity).toLocaleString()}원
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Delivery Info */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">배달 정보</h4>
              <div className="space-y-2">
                <div className="flex items-start space-x-2 text-sm">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{order.address}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-700">{order.phone}</span>
                </div>
                {order.memo && (
                  <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-gray-700">
                    💬 {order.memo}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">결제 정보</h4>
              <div className="flex items-center space-x-2 text-sm">
                <CreditCard className="w-4 h-4 text-gray-400" />
                <span className="text-gray-700">{PAYMENT_TYPE_LABELS[order.paymentType]}</span>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">총 결제 금액</p>
                <p className="text-2xl font-bold text-blue-600">{order.totalPrice.toLocaleString()}원</p>
              </div>
            </div>
          </div>

          {/* Status Actions */}
          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                {order.status !== '완료' && order.status !== '취소' && order.status !== '포장완료' && (
                  <>
                    <h4 className="font-semibold text-gray-900 mb-3">주문 상태 변경</h4>
                    <div className="flex gap-2">
                      {nextStatus && (
                        <Button
                          onClick={() => onStatusChange(order.id, nextStatus)}
                        >
                          다음 단계로 ({ORDER_STATUS_LABELS[nextStatus]})
                        </Button>
                      )}

                      <Button
                        variant="danger"
                        onClick={() => {
                          if (window.confirm('주문을 취소하시겠습니까?')) {
                            onStatusChange(order.id, '취소');
                          }
                        }}
                      >
                        취소
                      </Button>
                    </div>
                  </>
                )}
              </div>

              {/* 영수증 인쇄 버튼 (항상 표시 or 특정 상태에서만? 사용자는 그냥 '추가'라고 함) */}
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPrint();
                  }}
                  className="flex items-center gap-2"
                >
                  {/* 아이콘은 상단 import 사용 */}
                  <span>🖨️ 영수증 인쇄</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Delete Button for Completed/Cancelled Orders */}
          {(order.status === '완료' || order.status === '취소' || order.status === '포장완료') && (
            <div className="pt-4 border-t border-gray-200 text-right">
              <Button
                variant="outline"
                onClick={() => onDelete(order.id)}
                className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
              >
                주문 내역 삭제
              </Button>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
```

---

## src/pages/admin/AdminMenuManagement.tsx

```typescript
import { useState } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { Menu, MenuOption, CATEGORIES } from '../../types/menu';
import { toast } from 'sonner';
import AdminSidebar from '../../components/admin/AdminSidebar';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Badge from '../../components/common/Badge';
import ImageUpload from '../../components/common/ImageUpload';
import { useStore } from '../../contexts/StoreContext';
import { useFirestoreCollection } from '../../hooks/useFirestoreCollection';
import { createMenu, updateMenu, deleteMenu, toggleMenuSoldout, getAllMenusQuery } from '../../services/menuService';

export default function AdminMenuManagement() {
  const { store, loading: storeLoading } = useStore();

  // storeId가 있을 때만 쿼리 생성
  const { data: menus, loading, error } = useFirestoreCollection<Menu>(
    store?.id ? getAllMenusQuery(store.id) : null
  );

  if (storeLoading) return null;
  if (!store || !store.id) return <StoreNotFound />;

  if (error) {
    toast.error(`데이터 로드 실패: ${error.message}`);
    console.error(error);
  }

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null);

  if (storeLoading) return null;


  function StoreNotFound() {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar />
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center py-16">
              <p className="text-lg text-gray-600">상점을 찾을 수 없습니다</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const handleAddMenu = () => {
    setEditingMenu(null);
    setIsModalOpen(true);
  };

  const handleEditMenu = (menu: Menu) => {
    setEditingMenu(menu);
    setIsModalOpen(true);
  };

  const handleDeleteMenu = async (menuId: string) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      try {
        await deleteMenu(store.id, menuId);
        toast.success('메뉴가 삭제되었습니다');
      } catch (error) {
        toast.error('메뉴 삭제에 실패했습니다');
      }
    }
  };

  const handleToggleSoldout = async (menuId: string, currentSoldout: boolean) => {
    try {
      await toggleMenuSoldout(store.id, menuId, !currentSoldout);
      toast.success('품절 상태가 변경되었습니다');
    } catch (error) {
      toast.error('품절 상태 변경에 실패했습니다');
    }
  };

  const handleSaveMenu = async (menuData: Omit<Menu, 'id' | 'createdAt'>) => {
    try {
      if (editingMenu) {
        await updateMenu(store.id, editingMenu.id, menuData);
        toast.success('메뉴가 수정되었습니다');
      } else {
        await createMenu(store.id, menuData);
        toast.success('메뉴가 추가되었습니다');
      }
      setIsModalOpen(false);
    } catch (error) {
      toast.error('메뉴 저장에 실패했습니다');
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />

      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl mb-2">
                <span className="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
                  메뉴 관리
                </span>
              </h1>
              <p className="text-gray-600">총 {menus?.length || 0}개의 메뉴</p>
            </div>
            <Button onClick={handleAddMenu}>
              <Plus className="w-5 h-5 mr-2" />
              메뉴 추가
            </Button>
          </div>

          {/* Menu List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menus?.map((menu) => (
              <Card key={menu.id} padding="none" className="overflow-hidden">
                {/* Image */}
                <div className="relative aspect-[4/3] bg-gray-100">
                  {menu.imageUrl ? (
                    <img
                      src={menu.imageUrl}
                      alt={menu.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <span className="text-5xl">🍜</span>
                    </div>
                  )}
                  {menu.soldout && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Badge variant="danger" size="lg">품절</Badge>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {menu.category.slice(0, 2).map((cat) => (
                      <Badge key={cat} variant="primary" size="sm">
                        {cat}
                      </Badge>
                    ))}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{menu.name}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{menu.description}</p>
                  <p className="text-xl font-bold text-blue-600 mb-4">
                    {menu.price.toLocaleString()}원
                  </p>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      fullWidth
                      onClick={() => handleEditMenu(menu)}
                    >
                      <Edit2 className="w-4 h-4 mr-1.5" />
                      수정
                    </Button>
                    <Button
                      variant={menu.soldout ? 'secondary' : 'ghost'}
                      size="sm"
                      fullWidth
                      onClick={() => handleToggleSoldout(menu.id, menu.soldout)}
                    >
                      {menu.soldout ? '판매 재개' : '품절'}
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteMenu(menu.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </main>

      {/* Menu Form Modal */}
      {isModalOpen && (
        <MenuFormModal
          menu={editingMenu}
          onSave={handleSaveMenu}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}

interface MenuFormModalProps {
  menu: Menu | null;
  onSave: (menu: Omit<Menu, 'id' | 'createdAt'>) => void;
  onClose: () => void;
}

function MenuFormModal({ menu, onSave, onClose }: MenuFormModalProps) {
  const [formData, setFormData] = useState<Partial<Menu>>(
    menu || {
      name: '',
      price: 0,
      category: [],
      description: '',
      imageUrl: '',
      options: [],
      soldout: false,
    }
  );

  // 옵션 타입 선택 (옵션1: 수량 있음, 옵션2: 수량 없음)
  const [optionType, setOptionType] = useState<'type1' | 'type2'>('type1');
  const [newOption, setNewOption] = useState<Partial<MenuOption>>({
    name: '',
    price: 0,
    quantity: 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.price || formData.category?.length === 0) {
      toast.error('필수 항목을 모두 입력해주세요');
      return;
    }

    onSave(formData as Omit<Menu, 'id' | 'createdAt'>);
  };

  const toggleCategory = (cat: string) => {
    const categories = formData.category || [];
    if (categories.includes(cat)) {
      setFormData({ ...formData, category: categories.filter(c => c !== cat) });
    } else {
      setFormData({ ...formData, category: [...categories, cat] });
    }
  };

  const addOption = () => {
    if (!newOption.name || !newOption.price) {
      toast.error('옵션명과 가격을 입력해주세요');
      return;
    }

    if (optionType === 'type1' && (!newOption.quantity || newOption.quantity <= 0)) {
      toast.error('옵션 수량을 입력해주세요');
      return;
    }

    const option: MenuOption = {
      id: `option-${Date.now()}`,
      name: newOption.name,
      price: newOption.price,
      ...(optionType === 'type1' ? { quantity: newOption.quantity } : {}),
    };

    setFormData({
      ...formData,
      options: [...(formData.options || []), option],
    });

    setNewOption({ name: '', price: 0, quantity: 0 });
    toast.success('옵션이 추가되었습니다');
  };

  const removeOption = (optionId: string) => {
    setFormData({
      ...formData,
      options: (formData.options || []).filter(opt => opt.id !== optionId),
    });
    toast.success('옵션이 삭제되었습니다');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {menu ? '메뉴 수정' : '메뉴 추가'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="메뉴명"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <Input
            label="가격"
            type="number"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              카테고리 (최소 1개 선택)
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => toggleCategory(cat)}
                  className={`
                    px-4 py-2 rounded-lg border-2 transition-all
                    ${formData.category?.includes(cat)
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }
                  `}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              설명
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2.5 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
              rows={3}
              required
            />
          </div>

          <div className="mb-4">
            <ImageUpload
              menuId={menu ? menu.id : 'new'}
              currentImageUrl={formData.imageUrl}
              onImageUploaded={(url) => setFormData({ ...formData, imageUrl: url })}
            />
          </div>

          <div className="border-t border-gray-200 pt-5 mt-5">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              옵션 관리 (선택)
            </label>

            {/* 옵션 타입 선택 */}
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">옵션 타입</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setOptionType('type1')}
                  className={`
                    flex-1 px-4 py-2 rounded-lg border-2 transition-all text-sm
                    ${optionType === 'type1'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }
                  `}
                >
                  옵션1 (수량 포함)
                </button>
                <button
                  type="button"
                  onClick={() => setOptionType('type2')}
                  className={`
                    flex-1 px-4 py-2 rounded-lg border-2 transition-all text-sm
                    ${optionType === 'type2'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }
                  `}
                >
                  옵션2 (수량 없음)
                </button>
              </div>
            </div>

            {/* 옵션 추가 폼 */}
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="grid gap-3">
                <Input
                  label="옵션명"
                  value={newOption.name || ''}
                  onChange={(e) => setNewOption({ ...newOption, name: e.target.value })}
                  placeholder="예: 곱빼기, 사리 추가, 매운맛 등"
                />

                <div className={`grid gap-3 ${optionType === 'type1' ? 'grid-cols-2' : 'grid-cols-1'}`}>
                  <Input
                    label="가격"
                    type="number"
                    value={newOption.price || 0}
                    onChange={(e) => setNewOption({ ...newOption, price: Number(e.target.value) })}
                    placeholder="0"
                  />

                  {optionType === 'type1' && (
                    <Input
                      label="수량"
                      type="number"
                      value={newOption.quantity || 0}
                      onChange={(e) => setNewOption({ ...newOption, quantity: Number(e.target.value) })}
                      placeholder="0"
                    />
                  )}
                </div>

                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={addOption}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  옵션 추가
                </Button>
              </div>
            </div>

            {/* 옵션 목록 */}
            {formData.options && formData.options.length > 0 && (
              <div>
                <p className="text-sm text-gray-600 mb-2">등록된 옵션 ({formData.options.length}개)</p>
                <div className="space-y-2">
                  {formData.options.map((opt) => (
                    <div
                      key={opt.id}
                      className="bg-white border border-gray-200 rounded-lg px-4 py-3 flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{opt.name}</p>
                        <p className="text-sm text-gray-600">
                          +{opt.price.toLocaleString()}원
                          {opt.quantity !== undefined && ` · 수량: ${opt.quantity}개`}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeOption(opt.id)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" fullWidth onClick={onClose}>
              취소
            </Button>
            <Button type="submit" fullWidth>
              {menu ? '수정' : '추가'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
```

---

## 나머지 Admin 페이지들

다음 파일들은 파일 크기로 인해 별도 파일로 분리되었습니다:

- **Part 2**: `12-FRONTEND-SRC-PAGES-ADMIN-PART2.md`
  - `src/pages/admin/AdminCouponManagement.tsx`
  - `src/pages/admin/AdminReviewManagement.tsx`
  - `src/pages/admin/AdminNoticeManagement.tsx`

- **Part 3**: `12-FRONTEND-SRC-PAGES-ADMIN-PART3.md`
  - `src/pages/admin/AdminEventManagement.tsx`
  - `src/pages/admin/AdminStoreSettings.tsx`

