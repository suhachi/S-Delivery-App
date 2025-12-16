# 프로젝트 마스터 스냅샷 v1.0.0 - 프론트엔드 Components (Common & Admin)

**생성일**: 2025-12-10  
**목적**: 프론트엔드 공통 및 관리자 컴포넌트 원본 보관

---

## 1. Common Components

### src/components/common/TopBar.tsx

```typescript
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, LogOut, User, Store, Menu, X, Bell, Gift, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useStore } from '../../contexts/StoreContext';

export default function TopBar() {
  const navigate = useNavigate();
  const { user, isAdmin, logout } = useAuth();
  const { store } = useStore();
  const { getTotalItems } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const cartItemsCount = getTotalItems();

  const handleLogout = async () => {
    await logout();
    toast.success('로그아웃되었습니다');
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            {store?.logoUrl ? (
              <img
                src={store.logoUrl}
                alt={store.name}
                className="w-10 h-10 rounded-xl object-cover border border-gray-100 shadow-sm transform group-hover:scale-105 transition-transform"
              />
            ) : (
              <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center transform group-hover:scale-105 transition-transform">
                <span className="text-white text-xl">🍜</span>
              </div>
            )}
            <span className="text-lg font-bold text-primary-600 max-w-[160px] leading-tight text-left line-clamp-2">
              {store?.name || '배달앱'}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <NavLink to="/menu" icon={null}>메뉴</NavLink>
            <NavLink to="/events" icon={<Gift className="w-4 h-4" />}>이벤트</NavLink>
            <NavLink to="/reviews" icon={<MessageSquare className="w-4 h-4" />}>리뷰 게시판</NavLink>
            <NavLink to="/notices" icon={<Bell className="w-4 h-4" />}>공지사항</NavLink>
            <NavLink to="/orders" icon={null}>내 주문</NavLink>
            <NavLink to="/cart" icon={<ShoppingCart className="w-4 h-4" />} badge={cartItemsCount}>
              장바구니
            </NavLink>
            <NavLink to="/mypage" icon={<User className="w-4 h-4" />}>마이페이지</NavLink>
            {isAdmin && (
              <NavLink to="/admin" icon={<Store className="w-4 h-4" />}>
                관리자
              </NavLink>
            )}
          </div>

          {/* User Actions */}
          <div className="hidden md:flex items-center space-x-3">
            <div className="flex items-center space-x-2 px-3 py-1.5 bg-gray-100 rounded-full">
              <User className="w-4 h-4 text-gray-600" />
              <span className="text-sm text-gray-700">{user?.displayName || user?.email}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm">로그아웃</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-2 border-t border-gray-200 animate-slide-up">
            <MobileNavLink to="/menu" onClick={() => setMobileMenuOpen(false)}>
              메뉴
            </MobileNavLink>
            <MobileNavLink to="/events" onClick={() => setMobileMenuOpen(false)}>
              이벤트
            </MobileNavLink>
            <MobileNavLink to="/reviews" onClick={() => setMobileMenuOpen(false)}>
              리뷰 게시판
            </MobileNavLink>
            <MobileNavLink to="/notices" onClick={() => setMobileMenuOpen(false)}>
              공지사항
            </MobileNavLink>
            <MobileNavLink to="/orders" onClick={() => setMobileMenuOpen(false)}>
              내 주문
            </MobileNavLink>
            <MobileNavLink to="/cart" onClick={() => setMobileMenuOpen(false)} badge={cartItemsCount}>
              장바구니
            </MobileNavLink>
            <MobileNavLink to="/mypage" onClick={() => setMobileMenuOpen(false)}>
              마이페이지
            </MobileNavLink>
            {isAdmin && (
              <MobileNavLink to="/admin" onClick={() => setMobileMenuOpen(false)}>
                관리자
              </MobileNavLink>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

function NavLink({ to, icon, badge, children }: { to: string; icon?: React.ReactNode; badge?: number; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="relative flex items-center space-x-1 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors whitespace-nowrap"
    >
      {icon}
      <span>{children}</span>
      {badge !== undefined && badge > 0 && (
        <span className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 text-[10px] text-white gradient-primary rounded-full">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </Link>
  );
}

function MobileNavLink({ to, badge, onClick, children }: { to: string; badge?: number; onClick: () => void; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="relative flex items-center justify-between px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
    >
      <span>{children}</span>
      {badge !== undefined && badge > 0 && (
        <span className="flex items-center justify-center min-w-[24px] h-6 px-2 text-xs text-white gradient-primary rounded-full">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </Link>
  );
}
```

### src/components/common/Badge.tsx

```typescript
import { HTMLAttributes, ReactNode } from 'react';

export type BadgeVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'gray';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: 'sm' | 'md' | 'lg';
  children?: ReactNode;
}

export default function Badge({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: BadgeProps) {
  const variantClasses = {
    primary: 'bg-blue-100 text-blue-700',
    secondary: 'bg-orange-100 text-orange-700',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-yellow-100 text-yellow-700',
    danger: 'bg-red-100 text-red-700',
    gray: 'bg-gray-100 text-gray-700',
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };

  return (
    <span
      className={`
        inline-flex items-center font-medium rounded-full
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
      {...props}
    >
      {children}
    </span>
  );
}
```

### src/components/common/Button.tsx

```typescript
import React, { ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  fullWidth?: boolean;
  children?: ReactNode;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  fullWidth = false,
  className = '',
  children,
  disabled,
  ...props
}: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed';

  const variantClasses = {
    primary: 'gradient-primary text-white hover:shadow-lg hover:scale-[1.02] focus:ring-primary-500',
    secondary: 'gradient-secondary text-white hover:shadow-lg hover:scale-[1.02] focus:ring-orange-500',
    outline: 'border-2 border-primary-500 text-primary-600 hover:bg-primary-50 focus:ring-primary-500',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
    danger: 'bg-red-500 text-white hover:bg-red-600 hover:shadow-lg focus:ring-red-500',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          처리중...
        </>
      ) : (
        children
      )}
    </button>
  );
}
```

### src/components/common/Card.tsx

```typescript
import { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children?: ReactNode;
}

export default function Card({
  hover = false,
  padding = 'md',
  className = '',
  children,
  ...props
}: CardProps) {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      className={`
        bg-white rounded-xl border border-gray-200 shadow-sm
        ${hover ? 'card-hover cursor-pointer' : ''}
        ${paddingClasses[padding]}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}
```

### src/components/common/Input.tsx

```typescript
import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={`
              w-full px-4 py-2.5 
              ${icon ? 'pl-10' : ''} 
              text-gray-900 bg-white 
              border rounded-lg 
              ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'} 
              focus:ring-2 focus:border-transparent 
              transition-all duration-200 
              placeholder:text-gray-400
              disabled:bg-gray-100 disabled:cursor-not-allowed
              ${className}
            `}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1.5 text-sm text-red-600 animate-fade-in">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
```

### src/components/common/ImageUpload.tsx

```typescript
import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { uploadMenuImage, validateImageFile } from '../../services/storageService';
import { toast } from 'sonner';

interface ImageUploadProps {
  label?: string;
  currentImageUrl?: string;
  onImageUploaded: (url: string) => void;
  // Optional specific props
  menuId?: string;
  onUpload?: (file: File, onProgress: (progress: number) => void) => Promise<string>;
  aspectRatio?: 'square' | 'wide' | 'standard'; // square=1:1, wide=16:9, standard=4:3
  circle?: boolean; // For profile/logo images
  defaultImage?: string; // Fallback or initial image
}

export default function ImageUpload({
  label = '이미지',
  currentImageUrl,
  onImageUploaded,
  menuId,
  onUpload,
  aspectRatio = 'standard',
  circle = false,
  defaultImage
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(currentImageUrl || defaultImage);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getAspectRatioClass = () => {
    if (circle) return 'aspect-square rounded-full';
    switch (aspectRatio) {
      case 'square': return 'aspect-square rounded-lg';
      case 'wide': return 'aspect-[16/9] rounded-lg';
      case 'standard': default: return 'aspect-[4/3] rounded-lg';
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 파일 유효성 검사
    const validation = validateImageFile(file);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    // 미리보기 생성
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    // 업로드 실행
    setUploading(true);
    try {
      let downloadURL = '';

      if (onUpload) {
        // 커스텀 업로드 함수 사용
        downloadURL = await onUpload(file, (p) => setProgress(p));
      } else if (menuId) {
        // 기존 메뉴 이미지 업로드 (하위 호환)
        downloadURL = await uploadMenuImage(file, menuId, (p) => setProgress(p));
      } else {
        throw new Error('Upload handler is missing');
      }

      onImageUploaded(downloadURL);
      toast.success('이미지가 업로드되었습니다');
    } catch (error) {
      console.error('이미지 업로드 실패:', error);
      toast.error('이미지 업로드에 실패했습니다');
      setPreviewUrl(currentImageUrl || defaultImage);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl(undefined);
    onImageUploaded('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}

      <div className="relative w-full">
        {previewUrl ? (
          <div className={`relative overflow-hidden bg-gray-100 border-2 border-gray-200 ${getAspectRatioClass()}`}>
            <img
              src={previewUrl}
              alt="미리보기"
              className="w-full h-full object-cover"
            />
            {uploading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="text-white text-center">
                  <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p>{Math.round(progress)}%</p>
                </div>
              </div>
            )}
            {!uploading && (
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-md transform hover:scale-105"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className={`w-full border-2 border-dashed border-gray-300 hover:border-blue-500 transition-colors flex flex-col items-center justify-center text-gray-500 hover:text-blue-600 bg-gray-50 hover:bg-blue-50 ${getAspectRatioClass()}`}
          >
            <ImageIcon className="w-10 h-10 mb-2 opacity-50" />
            <p className="text-sm font-medium">이미지 업로드</p>
            <p className="text-xs mt-1 text-gray-400">JPG, PNG, WebP (최대 5MB)</p>
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}
```

### src/components/common/AddressSearchModal.tsx

```typescript
import DaumPostcodeEmbed from 'react-daum-postcode';
import { X } from 'lucide-react';

interface AddressSearchModalProps {
    onComplete: (address: string) => void;
    onClose: () => void;
}

export default function AddressSearchModal({ onComplete, onClose }: AddressSearchModalProps) {
    const handleComplete = (data: any) => {
        let fullAddress = data.address;
        let extraAddress = '';

        if (data.addressType === 'R') {
            if (data.bname !== '') {
                extraAddress += data.bname;
            }
            if (data.buildingName !== '') {
                extraAddress += (extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName);
            }
            fullAddress += (extraAddress !== '' ? ` (${extraAddress})` : '');
        }

        onComplete(fullAddress);
        onClose();
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden animate-slide-up"
                onClick={(e) => e.stopPropagation()}
                style={{ height: '550px', display: 'flex', flexDirection: 'column' }}
            >
                <div className="flex justify-between items-center p-4 border-b bg-gray-50 flex-shrink-0">
                    <h3 className="text-lg font-bold text-gray-900">주소 검색</h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>
                <div className="flex-1 w-full relative">
                    <DaumPostcodeEmbed
                        onComplete={handleComplete}
                        style={{ width: '100%', height: '100%' }}
                        autoClose={false}
                    />
                </div>
            </div>
        </div>
    );
}
```

### src/components/common/NotificationGuide.tsx

```typescript
import { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import Button from './Button';

const STORAGE_KEY = 'notification_guide_dismissed';

export default function NotificationGuide() {
  const [show, setShow] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    // 브라우저가 알림을 지원하지 않으면 표시하지 않음
    if (!('Notification' in window)) {
      return;
    }

    // 이미 dismiss 했으면 표시하지 않음
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (dismissed === 'true') {
      return;
    }

    // 현재 권한 상태 확인
    setPermission(Notification.permission);

    // 권한이 default일 때만 배너 표시
    if (Notification.permission === 'default') {
      setShow(true);
    }
  }, []);

  const handleRequestPermission = async () => {
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === 'granted') {
        setShow(false);
        localStorage.setItem(STORAGE_KEY, 'true');
      } else if (result === 'denied') {
        setShow(false);
        localStorage.setItem(STORAGE_KEY, 'true');
      }
    } catch (error) {
      console.error('알림 권한 요청 실패:', error);
    }
  };

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem(STORAGE_KEY, 'true');
  };

  if (!show) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg animate-slide-down">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold">주문 알림을 받으시겠습니까?</p>
              <p className="text-sm text-blue-100">주문 상태가 변경되면 실시간으로 알려드립니다</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              onClick={handleRequestPermission}
              variant="outline"
              size="sm"
              className="bg-white text-blue-600 hover:bg-blue-50 border-0"
            >
              허용
            </Button>
            <button
              onClick={handleDismiss}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              aria-label="닫기"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### src/components/figma/ImageWithFallback.tsx

```typescript
import React, { useState } from 'react'

const ERROR_IMG_SRC =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg=='

export function ImageWithFallback(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  const [didError, setDidError] = useState(false)

  const handleError = () => {
    setDidError(true)
  }

  const { src, alt, style, className, ...rest } = props

  return didError ? (
    <div
      className={`inline-block bg-gray-100 text-center align-middle ${className ?? ''}`}
      style={style}
    >
      <div className="flex items-center justify-center w-full h-full">
        <img src={ERROR_IMG_SRC} alt="Error loading image" {...rest} data-original-url={src} />
      </div>
    </div>
  ) : (
    <img src={src} alt={alt} className={className} style={style} {...rest} onError={handleError} />
  )
}
```

---

## 2. Admin Components

### src/components/admin/AdminSidebar.tsx

```typescript
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, UtensilsCrossed, Package, Ticket, Star, Bell, Calendar, Settings, Home } from 'lucide-react';
import { useStore } from '../../contexts/StoreContext';

interface AdminSidebarProps {
  className?: string;
}

export default function AdminSidebar({ className = '' }: AdminSidebarProps) {
  const location = useLocation();
  const { store } = useStore();

  const menuItems = [
    { path: '/admin', icon: <LayoutDashboard className="w-5 h-5" />, label: '대시보드', exact: true },
    { path: '/admin/orders', icon: <Package className="w-5 h-5" />, label: '주문 관리' },
    { path: '/admin/menus', icon: <UtensilsCrossed className="w-5 h-5" />, label: '메뉴 관리' },
    { path: '/admin/coupons', icon: <Ticket className="w-5 h-5" />, label: '쿠폰 관리' },
    { path: '/admin/reviews', icon: <Star className="w-5 h-5" />, label: '리뷰 관리' },
    { path: '/admin/notices', icon: <Bell className="w-5 h-5" />, label: '공지사항 관리' },
    { path: '/admin/events', icon: <Calendar className="w-5 h-5" />, label: '이벤트 관리' },
    { path: '/admin/store-settings', icon: <Settings className="w-5 h-5" />, label: '상점 설정' },
  ];

  const isActive = (path: string, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <aside className={`w-52 bg-white border-r border-gray-200 min-h-screen flex-shrink-0 ${className}`}>
      <div className="p-4">
        <nav className="space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex items-center space-x-2 px-3 py-2.5 rounded-lg transition-all
                ${isActive(item.path, item.exact)
                  ? 'gradient-primary text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-100'
                }
              `}
            >
              {item.icon}
              <span className="font-medium text-sm">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <Link
            to="/"
            className="flex items-center space-x-2 px-3 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
          >
            <Home className="w-5 h-5" />
            <span className="font-medium text-sm">사용자 페이지</span>
          </Link>
        </div>
      </div>
    </aside>
  );
}
```

### src/components/admin/AdminOrderAlert.tsx

```typescript
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../contexts/StoreContext';
import { useAuth } from '../../contexts/AuthContext';
import { useFirestoreCollection } from '../../hooks/useFirestoreCollection';
import { getAllOrdersQuery } from '../../services/orderService';
import { Order } from '../../types/order';
import { toast } from 'sonner';

export default function AdminOrderAlert() {
    const { store } = useStore();
    const { isAdmin } = useAuth();
    const navigate = useNavigate();
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [lastOrderCount, setLastOrderCount] = useState<number>(0);

    // 전체 주문을 구독하여 새 주문 감지
    // 관리자가 아니거나 상점이 없으면 query는 null이 되어 구독하지 않음
    const { data: orders } = useFirestoreCollection<Order>(
        (isAdmin && store?.id) ? getAllOrdersQuery(store.id) : null
    );

    useEffect(() => {
        // Initialize audio with custom file source
        audioRef.current = new Audio('/notification.mp3');
        // Preload to ensure readiness
        audioRef.current.load();
    }, []);

    useEffect(() => {
        if (!orders || !isAdmin) return;

        // 초기 로딩 시에는 알림 울리지 않음
        if (lastOrderCount === 0 && orders.length > 0) {
            setLastOrderCount(orders.length);
            return;
        }

        // 새 주문이 추가된 경우
        if (orders.length > lastOrderCount) {
            const newOrdersCount = orders.length - lastOrderCount;
            const latestOrder = orders[0]; // 정렬이 최신순이라면

            // 알림음 재생 시도
            // 알림음 반복 재생 설정
            if (audioRef.current) {
                audioRef.current.loop = true; // 반복 재생
                audioRef.current.currentTime = 0;

                const playPromise = audioRef.current.play();
                if (playPromise !== undefined) {
                    playPromise.catch(error => {
                        console.error('Audio playback failed:', error);
                    });
                }
            }

            // 지속적인 팝업 (확인 버튼 누를 때까지 유지)
            toast.message('새로운 주문이 도착했습니다! 🔔', {
                description: `${latestOrder.items[0].name} 외 ${latestOrder.items.length - 1}건 (${latestOrder.totalPrice.toLocaleString()}원)`,
                duration: Infinity, // 무한 지속
                action: {
                    label: '확인',
                    onClick: () => {
                        // 확인 버튼 클릭 시 소리 끄기 및 페이지 이동
                        if (audioRef.current) {
                            audioRef.current.pause();
                            audioRef.current.currentTime = 0;
                        }
                        navigate('/admin/orders');
                    }
                },
                // 닫기 버튼 등으로 닫혔을 때 소리 끄기 (Sonner API에 따라 동작 다를 수 있음. 안전장치)
                onDismiss: () => {
                    if (audioRef.current) {
                        audioRef.current.pause();
                        audioRef.current.currentTime = 0;
                    }
                },
                onAutoClose: () => { // 혹시나 자동 닫힘 발생 시
                    if (audioRef.current) {
                        audioRef.current.pause();
                        audioRef.current.currentTime = 0;
                    }
                }
            });
        }
        setLastOrderCount(orders.length); // Update count
    }, [orders, lastOrderCount, isAdmin, navigate]);

    if (!isAdmin) return null;

    return null; // UI 없음
}
```

### src/components/admin/Receipt.tsx

```typescript
import { Order } from '../../types/order';
import { Store } from '../../types/store';

interface ReceiptProps {
    order: Order | null;
    store: Store | null;
}

export default function Receipt({ order, store }: ReceiptProps) {
    if (!order) return null;

    // 1. 날짜 포맷팅 (YYYY. MM. DD. 오후 h:mm)
    const formatDate = (date: any) => {
        const d = date?.toDate ? date.toDate() : new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hour = d.getHours();
        const minute = String(d.getMinutes()).padStart(2, '0');
        const ampm = hour >= 12 ? '오후' : '오전';
        const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;

        return `${year}.${month}.${day}. ${ampm} ${displayHour}:${minute}`;
    };

    // 2. 결제방식 매핑
    const getPaymentText = (type: string, isPickup: boolean) => {
        if (type === '만나서카드') return '만나서 카드';
        if (type === '만나서현금') return '만나서 현금';
        if (type === '방문시결제') return '방문 시 결제';
        return '앱 결제';
    };

    // 계산 로직
    const itemsPrice = order.items.reduce((total, item) => {
        const optionsPrice = item.options?.reduce((optSum, opt) => optSum + (opt.price * (opt.quantity || 1)), 0) || 0;
        return total + ((item.price + optionsPrice) * item.quantity);
    }, 0);

    const discountAmount = order.discountAmount || 0;
    const deliveryFee = order.totalPrice - itemsPrice + discountAmount;

    return (
        <div id="receipt-container">
            <div className="w-[280px] mx-auto bg-white text-black font-mono text-[12px] leading-snug p-2 pb-8">

                {/* 상점 정보 */}
                <div className="text-center mb-4">
                    <h1 className="text-xl font-bold mb-1">{store?.name || '상점'}</h1>
                    <p className="mb-0.5">{store?.address || ''}</p>
                    <p>Tel: {store?.phone || ''}</p>
                </div>

                {/* 주문 타입 배지 */}
                <div className="text-center mb-2">
                    <span className="inline-block border border-black px-2 py-0.5 font-bold text-sm">
                        [{order.orderType}]
                    </span>
                </div>

                {/* 주문 번호 */}
                <div className="text-center mb-2">
                    <p className="font-bold text-sm">주문번호: {order.id.slice(0, 4).toUpperCase()}</p>
                </div>

                {/* 주문 기본 정보 */}
                <div className="mb-2 space-y-0.5">
                    <div className="flex justify-between">
                        <span>일시</span>
                        <span>{formatDate(order.createdAt)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>결제</span>
                        <span>{getPaymentText(order.paymentType, order.orderType === '포장주문')}</span>
                    </div>
                </div>

                {/* 고객 정보 */}
                <div className="mb-2 mt-4">
                    <p className="font-bold mb-1">고객 정보</p>
                    {order.orderType === '배달주문' && (
                        <p className="mb-1 break-words">{order.address}</p>
                    )}
                    <p className="mb-1">{order.phone}</p>
                </div>

                {/* 요청 사항 */}
                {order.memo && (
                    <div className="mb-2">
                        <p className="font-bold mb-1">요청사항:</p>
                        <p className="break-words">{order.memo}</p>
                    </div>
                )}

                <div className="border-b border-black my-2"></div>

                {/* 메뉴 헤더 */}
                <div className="flex mb-1 font-bold">
                    <span className="flex-1">메뉴명</span>
                    <span className="w-8 text-center">수량</span>
                    <span className="w-16 text-right">금액</span>
                </div>

                <div className="border-b border-black mb-2"></div>

                {/* 메뉴 리스트 */}
                <div className="mb-2">
                    {order.items.map((item, index) => {
                        const optionsPrice = item.options?.reduce((sum, opt) => sum + (opt.price * (opt.quantity || 1)), 0) || 0;
                        const itemTotal = (item.price + optionsPrice) * item.quantity;

                        return (
                            <div key={index} className="mb-2">
                                {/* 메인 메뉴 */}
                                <div className="flex items-start mb-0.5">
                                    <span className="flex-1 break-words pr-1">{item.name}</span>
                                    <span className="w-8 text-center">{item.quantity}</span>
                                    <span className="w-16 text-right">{item.price.toLocaleString()}</span>
                                </div>

                                {/* 옵션 리스트 */}
                                {item.options && item.options.map((opt, optIdx) => (
                                    <div key={optIdx} className="flex text-gray-800 mb-0.5">
                                        <span className="flex-1 break-words pl-2 text-[11px]">- {opt.name}</span>
                                        <span className="w-8 text-center text-[11px]"></span>
                                        <span className="w-16 text-right text-[11px]">+{(opt.price * (opt.quantity || 1)).toLocaleString()}</span>
                                    </div>
                                ))}

                                {/* 항목 소계 */}
                                <div className="text-right font-bold mt-1">
                                    {itemTotal.toLocaleString()}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="border-b border-black my-2"></div>

                {/* 금액 집계 */}
                <div className="space-y-1 mb-2">
                    <div className="flex justify-between">
                        <span>주문금액</span>
                        <span>{itemsPrice.toLocaleString()}</span>
                    </div>
                    {deliveryFee > 0 && (
                        <div className="flex justify-between">
                            <span>배달팁</span>
                            <span>+{deliveryFee.toLocaleString()}</span>
                        </div>
                    )}
                    {discountAmount > 0 && (
                        <div className="flex justify-between">
                            <span>할인금액</span>
                            <span>-{discountAmount.toLocaleString()}</span>
                        </div>
                    )}
                </div>

                <div className="border-b border-black my-2"></div>

                {/* 최종 합계 */}
                <div className="flex justify-between text-lg font-bold mb-4">
                    <span>합계</span>
                    <span>{order.totalPrice.toLocaleString()}원</span>
                </div>

                <div className="border-b border-black my-4"></div>

                {/* 푸터 */}
                <div className="text-center">
                    <p className="mb-1 font-bold">* 이용해 주셔서 감사합니다 *</p>
                    <p className="text-[10px]">Powered by CusCom</p>
                </div>

            </div>
        </div>
    );
}
```

---

**다음 문서**: 
- `10-FRONTEND-SRC-COMPONENTS-MENU-NOTICE-EVENT-REVIEW.md`: Menu, Notice, Event, Review 컴포넌트
- `11-FRONTEND-SRC-PAGES.md`: Pages (전체)


