import { useEffect, useRef, useState } from 'react';
import { useStore } from '../../contexts/StoreContext';
import { useFirestoreCollection } from '../../hooks/useFirestoreCollection';
import { getOrdersByStatusQuery, getAllOrdersQuery } from '../../services/orderService';
import { Order } from '../../types/order';
import { toast } from 'sonner';
import { Bell } from 'lucide-react';

export default function AdminOrderAlert() {
    const { store } = useStore();
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [lastOrderCount, setLastOrderCount] = useState<number>(0);

    // 전체 주문을 구독하여 새 주문 감지
    const { data: orders } = useFirestoreCollection<Order>(
        store?.id ? getAllOrdersQuery(store.id) : null
    );

    useEffect(() => {
        // 오디오 객체 초기화 (public 폴더에 notification.mp3가 있다고 가정하거나 기본 효과음 사용)
        // 여기서는 브라우저 기본 기능보다는 실제 파일을 사용하는 것이 좋으나, 
        // 파일이 없으므로 일단 visual feedback + toast만 강력하게 처리
        // 필요 시 오디오 파일 추가 필요
        audioRef.current = new Audio('/notification.mp3'); // 예시 경로
    }, []);

    useEffect(() => {
        if (!orders) return;

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
            try {
                // 브라우저 정책상 사용자 인터랙션 없이는 재생 안 될 수 있음
                const audioData = "data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU..."; // 짧은 비프음 Base64 (생략)
                // 대신 Web Audio API나 간단한 Beep 사용 가능하면 좋음. 
                // 여기서는 일단 console.log와 toast로 대체하거나 가상의 파일 경로 사용

                // 실제 구현: 알림음 재생
                if (audioRef.current) {
                    audioRef.current.play().catch(e => console.log('Audio play failed:', e));
                }
            } catch (e) {
                console.error(e);
            }

            toast.message('새로운 주문이 도착했습니다! 🔔', {
                description: `${latestOrder.items[0].name} 외 ${latestOrder.items.length - 1}건 (${latestOrder.totalPrice.toLocaleString()}원)`,
                duration: 5000,
                action: {
                    label: '확인',
                    onClick: () => window.location.href = '/admin/orders'
                }
            });
        }

        setLastOrderCount(orders.length);
    }, [orders, lastOrderCount]);

    return null; // UI 없음
}
