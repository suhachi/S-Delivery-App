import { useState } from 'react';
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
// mockUsers는 우선 주석 처리하거나 dummy 데이터 사용 필요 (UserType 정의 없음)
// 여기서는 UserType을 간단히 정의하고 mockUsers 대신 빈 배열 사용
interface UserType {
  id: string;
  name: string;
  phone: string;
}
const mockUsers: UserType[] = [];

export default function AdminCouponManagement() {
  const { store } = useStore();
  const { data: coupons, loading } = useFirestoreCollection<Coupon>(
    getAllCouponsQuery()
  );
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
    if (window.confirm('정말 삭제하시겠습니까?')) {
      try {
        await deleteCoupon(couponId);
        toast.success('쿠폰이 삭제되었습니다');
      } catch (error) {
        toast.error('쿠폰 삭제에 실패했습니다');
      }
    }
  };

  const handleToggleActive = async (couponId: string, currentActive: boolean) => {
    try {
      await toggleCouponActive(couponId, !currentActive);
      toast.success('쿠폰 상태가 변경되었습니다');
    } catch (error) {
      toast.error('쿠폰 상태 변경에 실패했습니다');
    }
  };

  const handleSaveCoupon = async (couponData: Omit<Coupon, 'id' | 'createdAt' | 'usedCount'>) => {
    try {
      if (editingCoupon) {
        await updateCoupon(editingCoupon.id, couponData);
        toast.success('쿠폰이 수정되었습니다');
      } else {
        await createCoupon(couponData);
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
  const [selectedUser, setSelectedUser] = useState<UserType | null>(
    coupon?.assignedUserId
      ? mockUsers.find(u => u.id === coupon.assignedUserId) || null
      : null
  );

  // 회원 검색 (전화번호 또는 이름)
  const filteredUsers = searchQuery
    ? mockUsers.filter(user =>
      user.phone.includes(searchQuery) ||
      user.name.includes(searchQuery)
    )
    : [];

  const handleUserSelect = (user: UserType) => {
    setSelectedUser(user);
    setFormData({
      ...formData,
      assignedUserId: user.id,
      assignedUserName: user.name,
      assignedUserPhone: user.phone,
    });
    setSearchQuery('');
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