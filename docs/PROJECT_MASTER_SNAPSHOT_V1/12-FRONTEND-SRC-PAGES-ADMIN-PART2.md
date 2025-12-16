# Frontend Source - Admin Pages (Part 2)

이 문서는 관리자 페이지들의 전체 코드를 포함합니다 (Part 2).

## 파일 목록

- `src/pages/admin/AdminCouponManagement.tsx`
- `src/pages/admin/AdminReviewManagement.tsx`
- `src/pages/admin/AdminNoticeManagement.tsx`

---

## src/pages/admin/AdminCouponManagement.tsx

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

## src/pages/admin/AdminReviewManagement.tsx

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

## src/pages/admin/AdminNoticeManagement.tsx

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


