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

    // Notification Sound (Base64 MP3 - 'Ding')
    const NOTIFICATION_SOUND = "data:audio/mpeg;base64,//uQxAAAAAAAAAAAAEluZm8AAAAPAAAABAAAACwAAAAAAABPAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABMYXZjNTguMjAuMTAwAAAAAAAAAAAA//uQwAAAAAAAD8AAAAAAAALAAAAAAAAAAAAAADH/y3/8v/y//L/8v/y//L/8v/y//L/8v/y//L/8v/y//L/8v/y//L/8v/y//L/8v/y//L/8v/y//L/8v/y//L/8v/y//L/8v/y//L/8v/y//L/8v/y//L/8v/y//L/8v/y//L/8v/y//L/8v/y//L/8v/y//L/8v/y//L/8v/y//L/8v/y//L/8v/y//L/8v/y//L/8v/y//L/8v/y//uQwCAAAAB/wAAAAAAAACwAAAAAAAAAAAAAAIAAABAAAAAAAAAAAAAAABAAAAAAAAAAAAAAABAAAAAAAAAAAAAAABAAAAAAAAAAAAAAABAAAAAAAAAAAAAAABAAAAAAAAAAAAAAABAAAAAAAAAAAAAAABAAAAAAAAAAAAAAABAAAAAAAAAAAAAAABAAAAAAAAAAAAAAABAAAAAAAAAAAAAAABAAAAAAAA//uQwCAAAAB/wAAAAAAAACwAAAAAAAAAAAAAAIAAABAAAAAAAAAAAAAAABAAAAAAAAAAAAAAABAAAAAAAAAAAAAAABAAAAAAAAAAAAAAABAAAAAAAAAAAAAAABAAAAAAAAAAAAAAABAAAAAAAAAAAAAAABAAAAAAAAAAAAAAABAAAAAAAAAAAAAAABAAAAAAAAAAAAAAABAAAAAAAAAAAAAAABAAAAAAAA//uQwCAAAAB/wAAAAAAAACwAAAAAAAAAAAAAAIAAABAAAAAAAAAAAAAAABAAAAAAAAAAAAAAABAAAAAAAAAAAAAAABAAAAAAAAAAAAAAABAAAAAAAAAAAAAAABAAAAAAAAAAAAAAABAAAAAAAAAAAAAAABAAAAAAAAAAAAAAABAAAAAAAAAAAAAAABAAAAAAAAAAAAAAABAAAAAAAAAAAAAAABAAAAAAAA";

    useEffect(() => {
        // Initialize audio with Base64 source
        audioRef.current = new Audio(NOTIFICATION_SOUND);
        // Preload to ensure readiness
        audioRef.current.load();
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
                    onClick: () => window.location.href = '/admin/orders'
                }
            });
        }
        setLastOrderCount(orders.length); // Update count
    }, [orders, lastOrderCount]);



    return null; // UI 없음
}
