import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdminCouponManagement from './AdminCouponManagement';
import { useStore } from '../../contexts/StoreContext';
import { useFirestoreCollection } from '../../hooks/useFirestoreCollection';
import { createCoupon } from '../../services/couponService';
import { searchUsers } from '../../services/userService';

// Mocks
vi.mock('../../contexts/StoreContext', () => ({
    useStore: vi.fn(),
}));

vi.mock('../../hooks/useFirestoreCollection', () => ({
    useFirestoreCollection: vi.fn(),
}));

vi.mock('../../services/couponService', () => ({
    createCoupon: vi.fn(),
    updateCoupon: vi.fn(),
    deleteCoupon: vi.fn(),
    toggleCouponActive: vi.fn(),
    getAllCouponsQuery: vi.fn(),
}));

vi.mock('../../services/userService', () => ({
    searchUsers: vi.fn(),
}));

vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

vi.mock('../../components/admin/AdminSidebar', () => ({
    default: () => <div data-testid="sidebar">Sidebar</div>,
}));

// Mock Lucide
vi.mock('lucide-react', () => ({
    Plus: () => <span>Plus</span>,
    Edit2: () => <span>Edit</span>,
    Trash2: () => <span>Trash</span>,
    X: () => <span>X</span>,
    Ticket: () => <span>Ticket</span>,
    TrendingUp: () => <span>Trending</span>,
    Search: () => <span>Search</span>,
    User: () => <span>User</span>,
}));

describe('AdminCouponManagement Integration', () => {
    const mockStore = { id: 'store_1' };

    beforeEach(() => {
        vi.clearAllMocks();
        (useStore as any).mockReturnValue({ store: mockStore });
        (useFirestoreCollection as any).mockReturnValue({ data: [], loading: false });
    });

    it('should render coupon list and open add modal', async () => {
        render(<AdminCouponManagement />);
        expect(screen.getByText('쿠폰 관리')).toBeInTheDocument();

        const addBtn = screen.getByText('쿠폰 추가').closest('button');
        fireEvent.click(addBtn!);

        expect(screen.getByText('쿠폰 추가')).toBeInTheDocument(); // Modal title
    });

    it('should integrate user search in modal', async () => {
        const user = userEvent.setup();
        render(<AdminCouponManagement />);

        // Open Modal
        await user.click(screen.getByText('쿠폰 추가'));

        // Mock Search Result
        const mockUsers = [{ id: 'u1', name: 'Hong', phone: '01012345678' }];
        (searchUsers as any).mockResolvedValue(mockUsers);

        // Enter search query
        const searchInput = screen.getByPlaceholderText('이름 또는 전화번호로 회원 검색');
        await user.type(searchInput, 'Hong');

        // Wait for search debounce (500ms in component)
        await waitFor(() => {
            expect(searchUsers).toHaveBeenCalledWith('Hong');
        }, { timeout: 1000 });

        // Verify result display
        expect(await screen.findByText('Hong')).toBeInTheDocument();
        expect(screen.getByText('01012345678')).toBeInTheDocument();
    });

    it('should create a coupon', async () => {
        const user = userEvent.setup();
        render(<AdminCouponManagement />);

        await user.click(screen.getByText('쿠폰 추가'));

        // Fill Form (Name, Amount, MinOrder, Dates)
        // Select Predefined Name "이벤트쿠폰"
        await user.click(screen.getByText('이벤트쿠폰'));

        // Discount Amount
        const amountInput = screen.getByLabelText('할인 금액 (원)');
        await user.type(amountInput, '5000');

        // Min Order
        const minOrderInput = screen.getByLabelText('최소 주문 금액 (원)');
        await user.type(minOrderInput, '20000');

        // Dates (default is today, just ensuring inputs exist)
        // We can just submit as defaults are set in state usually, but let's check

        // Submit
        const submitBtn = screen.getByRole('button', { name: '추가' });
        await user.click(submitBtn);

        await waitFor(() => {
            expect(createCoupon).toHaveBeenCalled();
        });

        // Verify call arguments (partial check)
        const callArgs = (createCoupon as any).mock.calls[0];
        expect(callArgs[0]).toBe('store_1');
        expect(callArgs[1].name).toBe('이벤트쿠폰');
        expect(callArgs[1].discountValue).toBe(5000);
    });
});
