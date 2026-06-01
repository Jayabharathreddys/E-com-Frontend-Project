import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { vi } from 'vitest';
import OrderDetail from '../pages/orderDetail/OrderDetail';
import AuthContext from '../context/auth/AuthContext';
import CartContext from '../context/cart/CartContext';
import axios from 'axios';

vi.mock('axios');
vi.mock('../utils/generateReceipt', () => ({
    downloadReceipt: vi.fn().mockResolvedValue(undefined),
    generateReceipt: vi.fn(),
}));

const mockUser = { name: 'Alice', email: 'alice@test.com' };
const mockAddToCart = vi.fn();

const confirmedOrder = {
    _id: 'ord123',
    payment_order_id: 'order_pay_abc',
    payment_id: 'pay_xyz123',
    status: 'confirmed',
    priceAtThatTime: 99.99,
    quantity: 2,
    createdAt: '2025-01-15T10:00:00.000Z',
    product: {
        _id: 'prod1',
        name: 'Test Sneakers',
        price: 99.99,
        productImages: ['https://placehold.co/120x120'],
    },
};

const failedOrder = { ...confirmedOrder, _id: 'ord456', status: 'failed', payment_id: null };

const renderDetail = (orderId = 'ord123', user = mockUser) =>
    render(
        <AuthContext.Provider value={{ user }}>
            <CartContext.Provider
                value={{
                    cart: {},
                    addToCart: mockAddToCart,
                    removeFromCart: vi.fn(),
                    clearCart: vi.fn(),
                }}
            >
                <MemoryRouter initialEntries={[`/orders/${orderId}`]}>
                    <Routes>
                        <Route path="/orders/:orderId" element={<OrderDetail />} />
                        <Route path="/orders" element={<div>Orders Page</div>} />
                        <Route path="/cart" element={<div>Cart Page</div>} />
                        <Route path="/" element={<div>Home</div>} />
                    </Routes>
                </MemoryRouter>
            </CartContext.Provider>
        </AuthContext.Provider>
    );

describe('OrderDetail — confirmed order', () => {
    beforeEach(() => vi.clearAllMocks());

    it('renders order details heading', async () => {
        axios.get.mockResolvedValueOnce({ data: { status: 'success', data: confirmedOrder } });
        renderDetail();
        await waitFor(() => expect(screen.getByText('Order Details')).toBeInTheDocument());
    });

    it('renders product name', async () => {
        axios.get.mockResolvedValueOnce({ data: { status: 'success', data: confirmedOrder } });
        renderDetail();
        await waitFor(() => expect(screen.getByText('Test Sneakers')).toBeInTheDocument());
    });

    it('renders confirmed status badge', async () => {
        axios.get.mockResolvedValueOnce({ data: { status: 'success', data: confirmedOrder } });
        renderDetail();
        await waitFor(() => expect(screen.getByText('✓ Confirmed')).toBeInTheDocument());
    });

    it('renders order total amount', async () => {
        axios.get.mockResolvedValueOnce({ data: { status: 'success', data: confirmedOrder } });
        renderDetail();
        await waitFor(() => {
            // 99.99 × 2 = 199.98
            expect(screen.getAllByText('Rs. 199.98').length).toBeGreaterThan(0);
        });
    });

    it('renders status timeline for confirmed order', async () => {
        axios.get.mockResolvedValueOnce({ data: { status: 'success', data: confirmedOrder } });
        renderDetail();
        await waitFor(() => {
            expect(screen.getByText('Order Placed')).toBeInTheDocument();
            expect(screen.getByText('Payment Confirmed')).toBeInTheDocument();
        });
    });

    it('renders Download Invoice button for confirmed order', async () => {
        axios.get.mockResolvedValueOnce({ data: { status: 'success', data: confirmedOrder } });
        renderDetail();
        await waitFor(() => {
            expect(screen.getByText(/Download Invoice/i)).toBeInTheDocument();
        });
    });

    it('renders Buy Again button for confirmed order', async () => {
        axios.get.mockResolvedValueOnce({ data: { status: 'success', data: confirmedOrder } });
        renderDetail();
        await waitFor(() => expect(screen.getByText(/Buy Again/i)).toBeInTheDocument());
    });

    it('Buy Again calls addToCart with correct product', async () => {
        axios.get.mockResolvedValueOnce({ data: { status: 'success', data: confirmedOrder } });
        renderDetail();
        await waitFor(() => screen.getByText(/Buy Again/i));
        fireEvent.click(screen.getByText(/Buy Again/i));
        expect(mockAddToCart).toHaveBeenCalledWith(
            expect.objectContaining({ title: 'Test Sneakers', price: 99.99 })
        );
    });

    it('renders back link to /orders', async () => {
        axios.get.mockResolvedValueOnce({ data: { status: 'success', data: confirmedOrder } });
        renderDetail();
        await waitFor(() => {
            expect(screen.getByText('← Back to My Orders')).toBeInTheDocument();
        });
    });

    it('renders payment ID when present', async () => {
        axios.get.mockResolvedValueOnce({ data: { status: 'success', data: confirmedOrder } });
        renderDetail();
        await waitFor(() => {
            expect(screen.getByText('pay_xyz123')).toBeInTheDocument();
        });
    });
});

describe('OrderDetail — failed order', () => {
    beforeEach(() => vi.clearAllMocks());

    it('renders failed status badge', async () => {
        axios.get.mockResolvedValueOnce({ data: { status: 'success', data: failedOrder } });
        renderDetail('ord456');
        await waitFor(() => expect(screen.getByText('✗ Failed')).toBeInTheDocument());
    });

    it('renders failed banner message', async () => {
        axios.get.mockResolvedValueOnce({ data: { status: 'success', data: failedOrder } });
        renderDetail('ord456');
        await waitFor(() => expect(screen.getByText(/Payment failed/i)).toBeInTheDocument());
    });

    it('renders Retry Payment button for failed order', async () => {
        axios.get.mockResolvedValueOnce({ data: { status: 'success', data: failedOrder } });
        renderDetail('ord456');
        await waitFor(() => expect(screen.getByText(/Retry Payment/i)).toBeInTheDocument());
    });

    it('does NOT render timeline for failed order', async () => {
        axios.get.mockResolvedValueOnce({ data: { status: 'success', data: failedOrder } });
        renderDetail('ord456');
        // Wait for a failed-order-specific element before asserting absence of timeline
        await waitFor(() => expect(screen.getByText('✗ Failed')).toBeInTheDocument());
        expect(screen.queryByText('Order Placed')).not.toBeInTheDocument();
    });
});

describe('OrderDetail — error state', () => {
    it('shows not found message when API returns 404', async () => {
        axios.get.mockRejectedValueOnce({ response: { status: 404 } });
        renderDetail('nonexistent');
        await waitFor(() => {
            expect(screen.getByText(/Order not found/i)).toBeInTheDocument();
        });
    });
});
