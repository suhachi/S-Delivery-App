# 08-Page-Admin

Generated: 2025-12-10 14:27:34

---

## File: src\pages\admin\AdminCouponManagement.tsx

```typescript
import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Ticket, TrendingUp, Search, User } from 'lucide-react';
import { Coupon, DISCOUNT_TYPE_LABELS } from '../../types/coupon';
import { toast } from 'sonner';
import AdminSidebar from '../../components/admin/AdminSidebar';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Badge from '../../components/common/Badge';
import { useStore } from '../../contexts/StoreContext';
import { useFirestoreCollection } from '../../hooks/useFirestoreCollection';
import { createCoupon, updateCoupon, deleteCoupon, toggleCouponActive, getAllCouponsQuery } from '../../services/couponService';
import { searchUsers, UserProfile } from '../../services/userService';

export default function AdminCouponManagement() {
  const { store } = useStore();
  const { data: coupons, loading } = useFirestoreCollection<Coupon>(
    store?.id ? getAllCouponsQuery(store.id) : null
  );

  if (!store || !store.id) return null;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  const handleAddCoupon = () => {
    setEditingCoupon(null);
    setIsModalOpen(true);
  };

  const handleEditCoupon = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setIsModalOpen(true);
  };

  const handleDeleteCoupon = async (couponId: string) => {
    if (!store?.id) return;
    if (window.confirm('정말 삭제하시겠습니까?')) {
      try {
        await deleteCoupon(store.id, couponId);
        toast.success('쿠폰이 삭제되었습니다');
      } catch (error) {
        toast.error('쿠폰 삭제에 실패했습니다');
      }
    }
  };

  const handleToggleActive = async (couponId: string, currentActive: boolean) => {
    if (!store?.id) return;
    try {
      await toggleCouponActive(store.id, couponId, !currentActive);
      toast.success('쿠폰 상태가 변경되었습니다');
    } catch (error) {
      toast.error('쿠폰 상태 변경에 실패했습니다');
    }
  };

  const handleSaveCoupon = async (couponData: Omit<Coupon, 'id' | 'createdAt' | 'usedCount'>) => {
    if (!store?.id) return;
    try {
      if (editingCoupon) {
        await updateCoupon(store.id, editingCoupon.id, couponData);
        toast.success('쿠폰이 수정되었습니다');
      } else {
        await createCoupon(store.id, couponData);
        toast.success('쿠폰이 추가되었습니다');
      }
      setIsModalOpen(false);
    } catch (error) {
      toast.error('쿠폰 저장에 실패했습니다');
    }
  };

  const activeCoupons = (coupons || []).filter(c => c.isActive).length;
  const totalCoupons = (coupons || []).length;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />

      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl mb-2">
                <span className="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
                  쿠폰 관리
                </span>
              </h1>
              <p className="text-gray-600">총 {totalCoupons}개의 쿠폰</p>
            </div>
            <Button onClick={handleAddCoupon}>
              <Plus className="w-5 h-5 mr-2" />
              쿠폰 추가
            </Button>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">전체 쿠폰</p>
                  <p className="text-3xl font-bold text-gray-900">{totalCoupons}</p>
                </div>
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                  <Ticket className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">활성 쿠폰</p>
                  <p className="text-3xl font-bold text-green-600">{activeCoupons}</p>
                </div>
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                  <Ticket className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>
          </div>

          {/* Coupons List */}
          <div className="space-y-4">
            {coupons && coupons.map((coupon) => (
              <CouponCard
                key={coupon.id}
                coupon={coupon}
                onEdit={handleEditCoupon}
                onDelete={handleDeleteCoupon}
                onToggleActive={handleToggleActive}
              />
            ))}
          </div>
        </div>
      </main>

      {/* Coupon Form Modal */}
      {isModalOpen && (
        <CouponFormModal
          coupon={editingCoupon}
          onSave={handleSaveCoupon}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}

interface CouponCardProps {
  coupon: Coupon;
  onEdit: (coupon: Coupon) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, currentActive: boolean) => void;
}

function CouponCard({ coupon, onEdit, onDelete, onToggleActive }: CouponCardProps) {
  const isExpired = new Date() > new Date(coupon.validUntil);

  return (
    <Card className={coupon.isActive && !isExpired ? '' : 'opacity-60'}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4 flex-1">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${coupon.isActive && !isExpired ? 'gradient-primary' : 'bg-gray-300'
            }`}>
            <Ticket className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="text-xl font-bold text-gray-900">{coupon.name}</h3>
              <Badge variant={coupon.isActive && !isExpired ? 'success' : 'gray'}>
                {isExpired ? '만료됨' : coupon.isActive ? '활성' : '비활성'}
              </Badge>
            </div>

            <div className="grid md:grid-cols-2 gap-x-8 gap-y-2 mb-3">
              <div>
                <p className="text-sm text-gray-600">쿠폰 코드</p>
                <p className="font-mono font-semibold text-blue-600">{coupon.code}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">할인</p>
                <p className="font-semibold text-gray-900">
                  {coupon.discountType === 'percentage'
                    ? `${coupon.discountValue}%`
                    : `${coupon.discountValue.toLocaleString()}원`
                  }
                  {coupon.maxDiscountAmount && ` (최대 ${coupon.maxDiscountAmount.toLocaleString()}원)`}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">최소 주문 금액</p>
                <p className="font-semibold text-gray-900">{coupon.minOrderAmount.toLocaleString()}원</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">유효 기간</p>
                <p className="text-sm text-gray-900">
                  {new Date(coupon.validFrom).toLocaleDateString()} ~ {new Date(coupon.validUntil).toLocaleDateString()}
                </p>
              </div>
              {coupon.assignedUserId && (
                <>
                  <div>
                    <p className="text-sm text-gray-600">발급 대상</p>
                    <p className="font-semibold text-gray-900">{coupon.assignedUserName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">전화번호</p>
                    <p className="font-semibold text-gray-900">{coupon.assignedUserPhone}</p>
                  </div>
                </>
              )}
            </div>

            {/* 사용 상태 */}
            <div className="flex items-center gap-2">
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${coupon.isUsed
                ? 'bg-gray-100 text-gray-600'
                : 'bg-green-100 text-green-700'
                }`}>
                {coupon.isUsed ? '1회 사용 완료' : '사용 가능 (1회)'}
              </div>
              {coupon.isUsed && coupon.usedAt && (
                <span className="text-xs text-gray-500">
                  {new Date(coupon.usedAt).toLocaleDateString()} 사용
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 ml-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(coupon)}
            disabled={coupon.isUsed}
          >
            <Edit2 className="w-4 h-4 mr-1.5" />
            수정
          </Button>
          <Button
            variant={coupon.isActive ? 'ghost' : 'secondary'}
            size="sm"
            onClick={() => onToggleActive(coupon.id, coupon.isActive)}
            disabled={isExpired || coupon.isUsed}
          >
            {coupon.isActive ? '비활성화' : '활성화'}
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => onDelete(coupon.id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

interface CouponFormModalProps {
  coupon: Coupon | null;
  onSave: (coupon: Omit<Coupon, 'id' | 'createdAt' | 'usedCount'>) => void;
  onClose: () => void;
}

function CouponFormModal({ coupon, onSave, onClose }: CouponFormModalProps) {
  const [formData, setFormData] = useState<Partial<Coupon>>(
    coupon || {
      code: '',
      name: '',
      discountType: 'fixed',
      discountValue: 0,
      minOrderAmount: 0,
      maxDiscountAmount: undefined,
      validFrom: new Date(),
      validUntil: new Date(),
      isActive: true,
    }
  );

  const [customNameMode, setCustomNameMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(
    coupon?.assignedUserId && coupon.assignedUserName
      ? {
        id: coupon.assignedUserId,
        name: coupon.assignedUserName,
        phone: coupon.assignedUserPhone || '',
        email: '',
        createdAt: null
      }
      : null
  );

  // 회원 검색 (Debounce 적용 없이 간단히 Enter 키나 버튼으로 트리거해도 되지만, 여기선 useEffect로 처리)
  useEffect(() => {
    const search = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const results = await searchUsers(searchQuery);
        setSearchResults(results);
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setIsSearching(false);
      }
    };

    const timer = setTimeout(search, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleUserSelect = (user: UserProfile) => {
    setSelectedUser(user);
    setFormData({
      ...formData,
      assignedUserId: user.id,
      assignedUserName: user.name,
      assignedUserPhone: user.phone,
    });
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleUserRemove = () => {
    setSelectedUser(null);
    setFormData({
      ...formData,
      assignedUserId: undefined,
      assignedUserName: undefined,
      assignedUserPhone: undefined,
    });
  };

  // 쿠폰 코드 자동 생성 함수
  const generateCouponCode = () => {
    const prefix = formData.name === '회원가입축하쿠폰' ? 'WELCOME' :
      formData.name === '이벤트쿠폰' ? 'EVENT' :
        formData.name === '감사쿠폰' ? 'THANKS' : 'COUPON';
    const randomNum = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}${randomNum}`;
  };

  // 쿠폰명 선택 시 자동으로 코드 생성
  const handleNameSelect = (name: string) => {
    setFormData({
      ...formData,
      name,
      code: generateCouponCode()
    });
    setCustomNameMode(false);
  };

  // 직접 입력 모드
  const handleCustomName = () => {
    setCustomNameMode(true);
    setFormData({ ...formData, name: '', code: '' });
  };

  // 직접 입력 시에도 코드 자동 생성
  const handleCustomNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      code: name ? generateCouponCode() : ''
    });
  };

  const predefinedNames = [
    { value: '회원가입축하쿠폰', label: '회원가입축하쿠폰', emoji: '🎉' },
    { value: '이벤트쿠폰', label: '이벤트쿠폰', emoji: '🎁' },
    { value: '감사쿠폰', label: '감사쿠폰', emoji: '💝' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.code || !formData.name || !formData.discountValue) {
      toast.error('필수 항목을 모두 입력해주세요');
      return;
    }

    onSave(formData as Omit<Coupon, 'id' | 'createdAt' | 'usedCount'>);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {coupon ? '쿠폰 수정' : '쿠폰 추가'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 쿠폰명 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              쿠폰명 *
            </label>

            {!customNameMode ? (
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  {predefinedNames.map(name => (
                    <button
                      key={name.value}
                      type="button"
                      onClick={() => handleNameSelect(name.value)}
                      className={`
                        p-4 rounded-lg border-2 transition-all text-center
                        ${formData.name === name.value
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                        }
                      `}
                    >
                      <div className="text-2xl mb-1">{name.emoji}</div>
                      <div className="text-sm font-medium">{name.label}</div>
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={handleCustomName}
                  className="w-full px-4 py-2.5 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  ✏️ 직접 입력하기
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <Input
                  placeholder="쿠폰명을 입력하세요"
                  value={formData.name}
                  onChange={(e) => handleCustomNameChange(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => {
                    setCustomNameMode(false);
                    setFormData({ ...formData, name: '', code: '' });
                  }}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  ← 기본 쿠폰명으로 돌아가기
                </button>
              </div>
            )}
          </div>

          {/* 쿠폰 코드 (자동 생성) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              쿠폰 코드 (자동 생성)
            </label>
            <div className="flex items-center gap-2">
              <Input
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="자동으로 생성됩니다"
                required
                disabled={!formData.name}
              />
              {formData.name && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setFormData({ ...formData, code: generateCouponCode() })}
                >
                  재생성
                </Button>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              쿠폰명을 선택하면 자동으로 생성됩니다
            </p>
          </div>

          {/* 발급 대상 지정 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              발급 대상 (선택)
            </label>

            {selectedUser ? (
              <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{selectedUser.name}</p>
                    <p className="text-sm text-gray-600">{selectedUser.phone}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleUserRemove}
                  className="p-2 hover:bg-white rounded-full transition-colors text-gray-500 hover:text-red-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="이름 또는 전화번호로 회원 검색"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>

                {/* 검색 결과 */}
                {searchQuery && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {isSearching ? (
                      <div className="p-4 text-center text-gray-500 text-sm">
                        검색 중...
                      </div>
                    ) : searchResults.length > 0 ? (
                      <ul>
                        {searchResults.map(user => (
                          <li key={user.id}>
                            <button
                              type="button"
                              onClick={() => handleUserSelect(user)}
                              className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
                            >
                              <p className="font-medium text-gray-900">{user.name}</p>
                              <p className="text-sm text-gray-600">{user.phone}</p>
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="p-4 text-center text-gray-500 text-sm">
                        검색 결과가 없습니다
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              할인 유형
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, discountType: 'fixed' })}
                className={`
                  p-4 rounded-lg border-2 transition-all
                  ${formData.discountType === 'fixed'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }
                `}
              >
                금액 할인
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, discountType: 'percentage' })}
                className={`
                  p-4 rounded-lg border-2 transition-all
                  ${formData.discountType === 'percentage'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }
                `}
              >
                퍼센트 할인
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label={formData.discountType === 'percentage' ? '할인율 (%)' : '할인 금액 (원)'}
              type="number"
              value={formData.discountValue}
              onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
              required
            />
            {formData.discountType === 'percentage' && (
              <Input
                label="최대 할인 금액 (원, 선택)"
                type="number"
                value={formData.maxDiscountAmount || ''}
                onChange={(e) => setFormData({ ...formData, maxDiscountAmount: Number(e.target.value) || undefined })}
              />
            )}
          </div>

          <Input
            label="최소 주문 금액 (원)"
            type="number"
            value={formData.minOrderAmount}
            onChange={(e) => setFormData({ ...formData, minOrderAmount: Number(e.target.value) })}
            required
          />

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                시작일
              </label>
              <input
                type="date"
                value={formData.validFrom ? new Date(formData.validFrom).toISOString().split('T')[0] : ''}
                onChange={(e) => setFormData({ ...formData, validFrom: new Date(e.target.value) })}
                className="w-full px-4 py-2.5 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                종료일
              </label>
              <input
                type="date"
                value={formData.validUntil ? new Date(formData.validUntil).toISOString().split('T')[0] : ''}
                onChange={(e) => setFormData({ ...formData, validUntil: new Date(e.target.value) })}
                className="w-full px-4 py-2.5 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900 font-medium">💡 쿠폰 사용 규칙</p>
            <p className="text-xs text-blue-700 mt-1">
              모든 쿠폰은 1회만 사용 가능합니다
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" fullWidth onClick={onClose}>
              취소
            </Button>
            <Button type="submit" fullWidth>
              {coupon ? '수정' : '추가'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
```

---

## File: src\pages\admin\AdminDashboard.tsx

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

## File: src\pages\admin\AdminEventManagement.tsx

```typescript
import { useState } from 'react';
import { Plus, Edit2, Trash2, X, Eye, EyeOff } from 'lucide-react';
import { Event } from '../../types/event';
import { toast } from 'sonner';
import AdminSidebar from '../../components/admin/AdminSidebar';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Badge from '../../components/common/Badge';
import { formatDateShort } from '../../utils/formatDate';
import { useStore } from '../../contexts/StoreContext';
import { useFirestoreCollection } from '../../hooks/useFirestoreCollection';
import { createEvent, updateEvent, deleteEvent, toggleEventActive, getAllEventsQuery } from '../../services/eventService';
import { uploadEventImage } from '../../services/storageService';
import ImageUpload from '../../components/common/ImageUpload';

export default function AdminEventManagement() {
  const { store } = useStore();
  const { data: events, loading } = useFirestoreCollection<Event>(
    store?.id ? getAllEventsQuery(store.id) : null
  );

  if (!store || !store.id) return null;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  const handleAddEvent = () => {
    setEditingEvent(null);
    setIsModalOpen(true);
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setIsModalOpen(true);
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      try {
        await deleteEvent(store.id, eventId);
        toast.success('이벤트가 삭제되었습니다');
      } catch (error) {
        toast.error('이벤트 삭제에 실패했습니다');
      }
    }
  };

  const handleToggleActive = async (eventId: string, currentActive: boolean) => {
    try {
      await toggleEventActive(store.id, eventId, !currentActive);
      toast.success('활성화 상태가 변경되었습니다');
    } catch (error) {
      toast.error('활성화 상태 변경에 실패했습니다');
    }
  };

  const handleSaveEvent = async (eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (editingEvent) {
        await updateEvent(store.id, editingEvent.id, eventData);
        toast.success('이벤트가 수정되었습니다');
      } else {
        await createEvent(store.id, eventData);
        toast.success('이벤트가 추가되었습니다');
      }
      setIsModalOpen(false);
    } catch (error) {
      toast.error('이벤트 저장에 실패했습니다');
    }
  };

  const formatDateForInput = (date: any) => {
    if (!date) return '';
    try {
      // date가 이미 Date 객체가 아닐 수 있음 (Firestore Timestamp)
      const d = date.toDate ? date.toDate() : new Date(date);
      return d.toISOString().split('T')[0];
    } catch (e) {
      return '';
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />

      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl mb-2">
                <span className="bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
                  이벤트 배너 관리
                </span>
              </h1>
              <p className="text-gray-600">총 {events?.length || 0}개의 이벤트</p>
            </div>
            <Button onClick={handleAddEvent}>
              <Plus className="w-5 h-5 mr-2" />
              이벤트 추가
            </Button>
          </div>

          {/* Event Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events?.map((event) => (
              <Card key={event.id} padding="none" className="overflow-hidden">
                {/* Preview Image */}
                <div className="relative aspect-[16/9] bg-gray-100">
                  <img
                    src={event.imageUrl}
                    alt={event.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x450?text=Image+Load+Failed';
                    }}
                  />
                  {!event.active && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Badge variant="danger" size="lg">비활성</Badge>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={event.active ? 'success' : 'gray'} size="sm">
                      {event.active ? '활성' : '비활성'}
                    </Badge>
                    <h3 className="font-semibold text-gray-900 line-clamp-1">
                      {event.title}
                    </h3>
                  </div>

                  <p className="text-sm text-gray-600 mb-2 line-clamp-1">
                    {event.link || '링크 없음'}
                  </p>

                  <p className="text-xs text-gray-500 mb-4">
                    {formatDateShort(event.startDate)} ~ {formatDateShort(event.endDate)}
                  </p>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant={event.active ? 'secondary' : 'outline'}
                      size="sm"
                      fullWidth
                      onClick={() => handleToggleActive(event.id, event.active)}
                    >
                      {event.active ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
                      {event.active ? '비활성' : '활성화'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditEvent(event)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteEvent(event.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}

            {(!events || events.length === 0) && (
              <div className="col-span-full text-center py-10 text-gray-500 bg-white rounded-lg shadow-sm border border-gray-100">
                등록된 이벤트가 없습니다.
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Event Form Modal */}
      {isModalOpen && (
        <EventFormModal
          event={editingEvent}
          onSave={handleSaveEvent}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}

interface EventFormModalProps {
  event: Event | null;
  onSave: (event: Omit<Event, 'id' | 'createdAt'>) => void;
  onClose: () => void;
}

function EventFormModal({ event, onSave, onClose }: EventFormModalProps) {
  const [formData, setFormData] = useState<Partial<Event>>(
    event || {
      title: '',
      imageUrl: '',
      link: '',
      active: true,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30일 후
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.imageUrl) {
      toast.error('필수 항목을 모두 입력해주세요');
      return;
    }

    onSave(formData as Omit<Event, 'id' | 'createdAt'>);
  };

  const formatDateForInput = (date: any) => {
    if (!date) return '';
    try {
      // date가 Firestore Timestamp일 수도 있고 Date 객체일 수도 있음
      const d = date.toDate ? date.toDate() : new Date(date);
      // 유효한 날짜인지 확인
      if (isNaN(d.getTime())) return '';
      return d.toISOString().split('T')[0];
    } catch (e) {
      return '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {event ? '이벤트 수정' : '이벤트 추가'}
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
            label="이벤트 제목"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />

          <div className="mb-4">
            <ImageUpload
              label="이벤트 배너 이미지"
              currentImageUrl={formData.imageUrl}
              onImageUploaded={(url) => setFormData({ ...formData, imageUrl: url })}
              onUpload={(file) => uploadEventImage(file)}
              aspectRatio="wide"
            />
          </div>

          <Input
            label="링크 URL (선택)"
            value={formData.link}
            onChange={(e) => setFormData({ ...formData, link: e.target.value })}
            placeholder="/menu 또는 https://example.com"
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                시작일
              </label>
              <input
                type="date"
                value={formatDateForInput(formData.startDate)}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val) setFormData({ ...formData, startDate: new Date(val) });
                }}
                className="w-full px-4 py-2.5 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                종료일
              </label>
              <input
                type="date"
                value={formatDateForInput(formData.endDate)}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val) setFormData({ ...formData, endDate: new Date(val) });
                }}
                className="w-full px-4 py-2.5 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                required
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="active"
              checked={formData.active}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="active" className="ml-2 text-sm text-gray-700">
              활성화
            </label>
          </div>

          {/* 미리보기 */}
          {formData.imageUrl && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                미리보기
              </label>
              <div className="relative aspect-[16/9] rounded-lg overflow-hidden">
                <img
                  src={formData.imageUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x450?text=Invalid+URL';
                  }}
                />
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" fullWidth onClick={onClose}>
              취소
            </Button>
            <Button type="submit" fullWidth>
              {event ? '수정' : '추가'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
```

---

## File: src\pages\admin\AdminMenuManagement.tsx

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

## File: src\pages\admin\AdminNoticeManagement.tsx

```typescript
import { useState } from 'react';
import { Plus, Edit2, Trash2, X, Pin } from 'lucide-react';
import { Notice, NOTICE_CATEGORIES } from '../../types/notice';
import { toast } from 'sonner';
import AdminSidebar from '../../components/admin/AdminSidebar';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Badge from '../../components/common/Badge';
import { formatDateShort } from '../../utils/formatDate';
import { useStore } from '../../contexts/StoreContext';
import { useFirestoreCollection } from '../../hooks/useFirestoreCollection';
import { createNotice, updateNotice, deleteNotice, toggleNoticePinned, getAllNoticesQuery } from '../../services/noticeService';

export default function AdminNoticeManagement() {
  const { store } = useStore();
  if (!store?.id) return null;

  const { data: notices, loading } = useFirestoreCollection<Notice>(
    getAllNoticesQuery(store.id)
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);

  const handleAddNotice = () => {
    setEditingNotice(null);
    setIsModalOpen(true);
  };

  const handleEditNotice = (notice: Notice) => {
    setEditingNotice(notice);
    setIsModalOpen(true);
  };

  const handleDeleteNotice = async (noticeId: string) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      try {
        await deleteNotice(store.id, noticeId);
        toast.success('공지사항이 삭제되었습니다');
      } catch (error) {
        toast.error('공지사항 삭제에 실패했습니다');
      }
    }
  };

  const handleTogglePin = async (noticeId: string, currentPinned: boolean) => {
    try {
      await toggleNoticePinned(store.id, noticeId, !currentPinned);
      toast.success('고정 상태가 변경되었습니다');
    } catch (error) {
      toast.error('고정 상태 변경에 실패했습니다');
    }
  };

  const handleSaveNotice = async (noticeData: Omit<Notice, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (editingNotice) {
        await updateNotice(store.id, editingNotice.id, noticeData);
        toast.success('공지사항이 수정되었습니다');
      } else {
        await createNotice(store.id, noticeData);
        toast.success('공지사항이 추가되었습니다');
      }
      setIsModalOpen(false);
    } catch (error) {
      toast.error('공지사항 저장에 실패했습니다');
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case '공지': return 'primary';
      case '이벤트': return 'secondary';
      case '점검': return 'danger';
      case '할인': return 'success';
      default: return 'default';
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />

      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl mb-2">
                <span className="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
                  공지사항 관리
                </span>
              </h1>
              <p className="text-gray-600">총 {notices?.length || 0}개의 공지사항</p>
            </div>
            <Button onClick={handleAddNotice}>
              <Plus className="w-5 h-5 mr-2" />
              공지사항 추가
            </Button>
          </div>

          {/* Notice List */}
          <div className="space-y-4">
            {notices?.map((notice) => (
              <Card key={notice.id}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {notice.pinned && (
                        <Pin className="w-4 h-4 text-blue-600" />
                      )}
                      <Badge
                        variant={getCategoryColor(notice.category) as any}
                        size="sm"
                      >
                        {notice.category}
                      </Badge>
                      <h3 className="font-semibold text-gray-900">
                        {notice.title}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {notice.content}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDateShort(notice.createdAt)}
                    </p>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button
                      variant={notice.pinned ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => handleTogglePin(notice.id, notice.pinned)}
                    >
                      <Pin className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditNotice(notice)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteNotice(notice.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}

            {(!notices || notices.length === 0) && (
              <div className="text-center py-10 text-gray-500 bg-white rounded-lg shadow-sm border border-gray-100">
                등록된 공지사항이 없습니다.
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Notice Form Modal */}
      {isModalOpen && (
        <NoticeFormModal
          notice={editingNotice}
          onSave={handleSaveNotice}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}

interface NoticeFormModalProps {
  notice: Notice | null;
  onSave: (notice: Omit<Notice, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onClose: () => void;
}

function NoticeFormModal({ notice, onSave, onClose }: NoticeFormModalProps) {
  const [formData, setFormData] = useState<Partial<Notice>>(
    notice || {
      title: '',
      content: '',
      category: '공지',
      pinned: false,
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.content) {
      toast.error('필수 항목을 모두 입력해주세요');
      return;
    }

    onSave(formData as Omit<Notice, 'id' | 'createdAt' | 'updatedAt'>);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {notice ? '공지사항 수정' : '공지사항 추가'}
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
            label="제목"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              카테고리
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
              className="w-full px-4 py-2.5 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              required
            >
              {NOTICE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              내용
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full px-4 py-2.5 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
              rows={8}
              required
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="pinned"
              checked={formData.pinned}
              onChange={(e) => setFormData({ ...formData, pinned: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="pinned" className="ml-2 text-sm text-gray-700">
              상단 고정
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" fullWidth onClick={onClose}>
              취소
            </Button>
            <Button type="submit" fullWidth>
              {notice ? '수정' : '추가'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
```

---

## File: src\pages\admin\AdminOrderManagement.tsx

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

// 헬퍼 함수: Firestore Timestamp 처리를 위한 toDate
function toDate(date: any): Date {
  if (date?.toDate) return date.toDate();
  if (date instanceof Date) return date;
  if (typeof date === 'string') return new Date(date);
  return new Date();
}

// 헬퍼 함수: 다음 주문 상태 계산
function getNextStatus(order: Order): OrderStatus | null {
  const currentStatus = order.status;
  const isPickup = order.orderType === '포장주문';

  // 상태 흐름 정의
  const deliveryFlow: OrderStatus[] = ['접수', '접수완료', '조리중', '배달중', '완료'];
  const pickupFlow: OrderStatus[] = ['접수', '접수완료', '조리중', '조리완료', '포장완료'];

  const statusFlow = isPickup ? pickupFlow : deliveryFlow;
  const currentIndex = statusFlow.indexOf(currentStatus);

  if (currentIndex >= 0 && currentIndex < statusFlow.length - 1) {
    return statusFlow[currentIndex + 1];
  }
  return null;
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

## File: src\pages\admin\AdminReviewManagement.tsx

```typescript
import { useState } from 'react';
import { Star, Trash2, CheckCircle, AlertCircle, MessageSquare } from 'lucide-react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import TopBar from '../../components/common/TopBar';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import { toast } from 'sonner';
import { Review } from '../../types/review';
import { useStore } from '../../contexts/StoreContext';
import { useFirestoreCollection } from '../../hooks/useFirestoreCollection';
import { getAllReviewsQuery, updateReview, deleteReview } from '../../services/reviewService';

export default function AdminReviewManagement() {
  const { store } = useStore();
  if (!store?.id) return null;

  const { data: reviews, loading } = useFirestoreCollection<Review>(
    getAllReviewsQuery(store.id)
  );

  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [replyText, setReplyText] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  const filteredReviews = (reviews || []).filter((review) => {
    if (filterStatus === 'all') return true;
    return review.status === filterStatus;
  });

  const handleApprove = async (reviewId: string) => {
    try {
      await updateReview(store.id, reviewId, { status: 'approved' });
      toast.success('리뷰가 승인되었습니다');
    } catch (error) {
      toast.error('리뷰 승인 실패');
    }
  };

  const handleReject = async (reviewId: string) => {
    try {
      await updateReview(store.id, reviewId, { status: 'rejected' });
      toast.success('리뷰가 거부되었습니다');
    } catch (error) {
      toast.error('리뷰 거부 실패');
    }
  };

  const handleDelete = async (reviewId: string, orderId: string) => {
    if (confirm('정말 이 리뷰를 삭제하시겠습니까?')) {
      try {
        await deleteReview(store.id, reviewId, orderId);
        toast.success('리뷰가 삭제되었습니다');
      } catch (error) {
        toast.error('리뷰 삭제 실패');
      }
    }
  };

  const handleReply = async (reviewId: string) => {
    if (!replyText.trim()) {
      toast.error('답글을 입력해주세요');
      return;
    }

    try {
      await updateReview(store.id, reviewId, {
        adminReply: replyText,
        status: 'approved'
      });
      setReplyText('');
      setSelectedReview(null);
      toast.success('답글이 등록되었습니다');
    } catch (error) {
      toast.error('답글 등록 실패');
    }
  };

  const getStatusBadge = (status: Review['status']) => {
    switch (status) {
      case 'approved':
        return <Badge variant="success">승인됨</Badge>;
      case 'pending':
        return <Badge variant="warning">대기중</Badge>;
      case 'rejected':
        return <Badge variant="error">거부됨</Badge>;
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
              }`}
          />
        ))}
      </div>
    );
  };

  const averageRating = (reviews || []).length > 0
    ? ((reviews || []).reduce((sum, r) => sum + r.rating, 0) / (reviews || []).length).toFixed(1)
    : '0.0';

  const totalReviews = (reviews || []).length;
  const pendingReviews = (reviews || []).filter(r => r.status === 'pending').length;
  const approvedReviews = (reviews || []).filter(r => r.status === 'approved').length;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />

      <div className="flex-1">


        <div className="p-6 max-w-7xl mx-auto">
          {/* 통계 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">전체 리뷰</p>
                  <p className="text-3xl mt-2">{totalReviews}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">대기중</p>
                  <p className="text-3xl mt-2">{pendingReviews}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">승인됨</p>
                  <p className="text-3xl mt-2">{approvedReviews}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">평균 평점</p>
                  <p className="text-3xl mt-2">{averageRating}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <Star className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </Card>
          </div>

          {/* 필터 */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-lg transition-colors ${filterStatus === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
            >
              전체
            </button>
            <button
              onClick={() => setFilterStatus('pending')}
              className={`px-4 py-2 rounded-lg transition-colors ${filterStatus === 'pending'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
            >
              대기중 ({pendingReviews})
            </button>
            <button
              onClick={() => setFilterStatus('approved')}
              className={`px-4 py-2 rounded-lg transition-colors ${filterStatus === 'approved'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
            >
              승인됨 ({approvedReviews})
            </button>
          </div>

          {/* 리뷰 목록 */}
          <div className="space-y-4">
            {filteredReviews.map((review) => (
              <Card key={review.id} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium text-gray-900">{review.userName}</h3>
                      {renderStars(review.rating)}
                      {getStatusBadge(review.status)}
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{review.menuName}</p>
                    <p className="text-xs text-gray-500">
                      {review.createdAt instanceof Date ? review.createdAt.toLocaleDateString() : new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {review.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleApprove(review.id)}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          승인
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleReject(review.id)}
                        >
                          거부
                        </Button>
                      </>
                    )}
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleDelete(review.id, review.orderId)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <p className="text-gray-700 mb-4">{review.comment}</p>

                {/* 관리자 답글 */}
                {review.adminReply ? (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                    <p className="text-sm text-blue-900 mb-1 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      관리자 답글
                    </p>
                    <p className="text-gray-700">{review.adminReply}</p>
                  </div>
                ) : (
                  <div className="mt-4">
                    {selectedReview?.id === review.id ? (
                      <div className="space-y-2">
                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="답글을 입력하세요..."
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows={3}
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleReply(review.id)}
                          >
                            답글 등록
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => {
                              setSelectedReview(null);
                              setReplyText('');
                            }}
                          >
                            취소
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setSelectedReview(review)}
                      >
                        <MessageSquare className="w-4 h-4 mr-1" />
                        답글 작성
                      </Button>
                    )}
                  </div>
                )}
              </Card>
            ))}

            {filteredReviews.length === 0 && (
              <Card className="p-12 text-center">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">표시할 리뷰가 없습니다</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

```

---

## File: src\pages\admin\AdminStoreSettings.tsx

```typescript
/**
 * 관리자 상점 설정 페이지
 * 상점 정보 수정, 브랜딩, 운영 시간 등 설정
 */

import { useState, useEffect } from 'react';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useStore } from '../../contexts/StoreContext';
import { UpdateStoreFormData } from '../../types/store';
import { toast } from 'sonner@2.0.3';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/admin/AdminSidebar';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import ImageUpload from '../../components/common/ImageUpload';
import { uploadStoreImage } from '../../services/storageService';
import { Store, Save, Plus } from 'lucide-react';

export default function AdminStoreSettings() {
  const navigate = useNavigate();
  const { store, loading } = useStore();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<UpdateStoreFormData>({
    name: '',
    description: '',
    phone: '',
    email: '',
    address: '',
    deliveryFee: 0,
    minOrderAmount: 0,
    logoUrl: '',
    bannerUrl: '',
    primaryColor: '#3b82f6',
  });

  useEffect(() => {
    if (store) {
      setFormData({
        name: store.name,
        description: store.description,
        phone: store.phone,
        email: store.email,
        address: store.address,
        deliveryFee: store.deliveryFee,
        minOrderAmount: store.minOrderAmount,
        logoUrl: store.logoUrl || '',
        bannerUrl: store.bannerUrl || '',
        primaryColor: store.primaryColor || '#3b82f6',
      });
    }
  }, [store]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!store) {
      toast.error('상점 정보를 불러올 수 없습니다');
      return;
    }

    setSaving(true);

    try {
      const storeRef = doc(db, 'stores', 'default');
      await updateDoc(storeRef, {
        ...formData,
        updatedAt: serverTimestamp(),
      });

      toast.success('상점 정보가 업데이트되었습니다');
    } catch (error) {
      console.error('Failed to update store:', error);
      toast.error('상점 정보 업데이트에 실패했습니다');
    } finally {
      setSaving(false);
    }
  };

  if (!store) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar />
        <main className="flex-1 p-8">
          <div className="max-w-2xl mx-auto text-center py-16">
            {loading ? (
              // 로딩 중
              <div className="space-y-4">
                <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center mx-auto animate-pulse">
                  <Store className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">상점 정보 로딩 중...</h2>
                <p className="text-gray-600">잠시만 기다려주세요</p>
              </div>
            ) : (
              // 상점이 없을 때
              <div className="space-y-6">
                <div className="w-16 h-16 bg-gray-200 rounded-2xl flex items-center justify-center mx-auto">
                  <Store className="w-8 h-8 text-gray-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">상점이 없습니다</h2>
                  <p className="text-gray-600 mb-6">
                    현재 운영 중인 상점이 없습니다.<br />
                    상점을 생성하여 배달 앱 운영을 시작하세요.
                  </p>
                  <Button
                    onClick={() => navigate('/store-setup')}
                    size="lg"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    새 상점 생성하기
                  </Button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />

      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 gradient-primary rounded-2xl flex items-center justify-center">
                <Store className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl">
                <span className="bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
                  상점 설정
                </span>
              </h1>
            </div>
            <p className="text-gray-600">
              상점 정보와 설정을 관리합니다
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 기본 정보 */}
            <Card>
              <h2 className="text-xl font-bold text-gray-900 mb-6">기본 정보</h2>

              <div className="space-y-5">
                <Input
                  label="상점 이름"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    상점 설명
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2.5 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 resize-none"
                    rows={4}
                  />
                </div>
              </div>
            </Card>

            {/* 연락처 정보 */}
            <Card>
              <h2 className="text-xl font-bold text-gray-900 mb-6">연락처 정보</h2>

              <div className="space-y-5">
                <Input
                  label="전화번호"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />

                <Input
                  label="이메일"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />

                <Input
                  label="주소"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                />
              </div>
            </Card>

            {/* 배달 설정 */}
            <Card>
              <h2 className="text-xl font-bold text-gray-900 mb-6">배달 설정</h2>

              <div className="space-y-5">
                <Input
                  label="배달비 (원)"
                  type="number"
                  value={formData.deliveryFee}
                  onChange={(e) => setFormData({ ...formData, deliveryFee: parseInt(e.target.value) || 0 })}
                  required
                />

                <Input
                  label="최소 주문 금액 (원)"
                  type="number"
                  value={formData.minOrderAmount}
                  onChange={(e) => setFormData({ ...formData, minOrderAmount: parseInt(e.target.value) || 0 })}
                  required
                />
              </div>
            </Card>

            {/* 브랜딩 */}
            <Card>
              <h2 className="text-xl font-bold text-gray-900 mb-6">브랜딩</h2>

              <div className="space-y-5">
                <ImageUpload
                  label="상점 로고 (선택)"
                  currentImageUrl={formData.logoUrl}
                  onImageUploaded={(url) => {
                    setFormData(prev => ({ ...prev, logoUrl: url }));
                  }}
                  onUpload={(file) => uploadStoreImage(file, 'logo')}
                  aspectRatio="square"
                  circle
                />

                <ImageUpload
                  label="배너 이미지 (선택)"
                  currentImageUrl={formData.bannerUrl}
                  onImageUploaded={(url) => {
                    setFormData(prev => ({ ...prev, bannerUrl: url }));
                  }}
                  onUpload={(file) => uploadStoreImage(file, 'banner')}
                  aspectRatio="wide"
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    메인 테마 색상
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={formData.primaryColor}
                      onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                      className="w-16 h-10 border border-gray-300 rounded cursor-pointer"
                    />
                    <Input
                      value={formData.primaryColor}
                      onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                      placeholder="#3b82f6"
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-end gap-4">
              <Button
                type="submit"
                disabled={saving}
                size="lg"
              >
                <Save className="w-5 h-5 mr-2" />
                {saving ? '저장 중...' : '변경사항 저장'}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
```

---

