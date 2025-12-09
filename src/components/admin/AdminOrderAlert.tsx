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
            if (audioRef.current) {
                audioRef.current.currentTime = 0; // Rewind to start
                const playPromise = audioRef.current.play();

                if (playPromise !== undefined) {
                    playPromise.catch(error => {
                        console.error('Audio playback failed (Autoplay blocked?):', error);
                        // Fallback: Could show a persistent visual alert here if needed
                    });
                }
            }

            toast.message('새로운 주문이 도착했습니다! 🔔', {
                description: `${latestOrder.items[0].name} 외 ${latestOrder.items.length - 1}건 (${latestOrder.totalPrice.toLocaleString()}원)`,
                duration: 5000,
                action: {
                    label: '확인',
                    onClick: () => navigate('/admin/orders')
                }
            });
        }
        setLastOrderCount(orders.length); // Update count
    }, [orders, lastOrderCount, isAdmin, navigate]);

    if (!isAdmin) return null;

    return null; // UI 없음
}
