export interface OrderItem {
  menuId: string;
  name: string;
  price: number;
  quantity: number;
  options?: { name: string; price: number }[];
  imageUrl?: string;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  totalPrice: number;
  status: OrderStatus;
  address: string;
  phone: string;
  memo?: string;
  paymentType: PaymentType;
  // 결제 관련 필드 추가
  paymentStatus?: '결제대기' | '결제완료' | '결제실패';
  payment?: {
    pg: string;
    tid?: string;
    amount?: number;
    paidAt?: any;
    error?: string;
    code?: string;
  };
  createdAt: Date;
  updatedAt?: Date;
  reviewed?: boolean;
  reviewRating?: number;
}

export type OrderStatus = '결제대기' | '결제실패' | '접수' | '조리중' | '배달중' | '완료' | '취소';
export type PaymentType = '앱결제' | '만나서카드' | '만나서현금' | '방문시결제';

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  '결제대기': '결제 대기',
  '결제실패': '결제 실패',
  '접수': '주문 접수',
  '조리중': '조리 중',
  '배달중': '배달 중',
  '완료': '배달 완료',
  '취소': '주문 취소',
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, { bg: string; text: string }> = {
  '결제대기': { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  '결제실패': { bg: 'bg-red-100', text: 'text-red-700' },
  '접수': { bg: 'bg-blue-100', text: 'text-blue-700' },
  '조리중': { bg: 'bg-orange-100', text: 'text-orange-700' },
  '배달중': { bg: 'bg-purple-100', text: 'text-purple-700' },
  '완료': { bg: 'bg-green-100', text: 'text-green-700' },
  '취소': { bg: 'bg-gray-100', text: 'text-gray-700' },
};

export const PAYMENT_TYPE_LABELS: Record<PaymentType, string> = {
  '앱결제': '앱 결제',
  '만나서카드': '만나서 카드 결제',
  '만나서현금': '만나서 현금 결제',
  '방문시결제': '방문 시 결제',
};
