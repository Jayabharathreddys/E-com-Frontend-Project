import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import CartItems from '../pages/cartItems/CartItems';
import axios from 'axios';
import AuthContext from '../context/auth/AuthContext';
import CartContext from '../context/cart/CartContext';

vi.mock('axios');

// Mock generateReceipt module — downloadReceipt dynamically imports jsPDF
// which isn't available in jsdom; mock the whole utility.
vi.mock('../utils/generateReceipt', () => ({
    downloadReceipt: vi.fn().mockResolvedValue(undefined),
    generateReceipt: vi.fn(),
}));

// Mock Razorpay globally
const mockRazorpayOpen = vi.fn();
const mockRazorpayOn = vi.fn();
global.Razorpay = vi.fn(() => ({
    open: mockRazorpayOpen,
    on: mockRazorpayOn,
}));

// ── Shared mock data ──────────────────────────────────────────────────────────
const mockUser = { name: 'Alice', email: 'alice@test.com' };
const mockClearCart = vi.fn();
const mockAddToCart = vi.fn();
const mockRemoveFromCart = vi.fn();

const singleItemCart = {
    prod1: {
        _id: 'prod1',
        id: 'prod1',
        title: 'Test Item',
        name: 'Test Item',
        price: '100',
        quantity: 1,
    },
};

const multiItemCart = {
    prod1: { _id: 'prod1', id: 'prod1', title: 'Test Item', price: '100', quantity: 1 },
    prod2: { _id: 'prod2', id: 'prod2', title: 'Second Item', price: '200', quantity: 2 },
};

// ── Render helpers ────────────────────────────────────────────────────────────
const renderCart = (cart = singleItemCart, user = mockUser) =>
    render(
        <AuthContext.Provider value={{ user }}>
            <CartContext.Provider
                value={{
                    cart,
                    addToCart: mockAddToCart,
                    removeFromCart: mockRemoveFromCart,
                    clearCart: mockClearCart,
                }}
            >
                <MemoryRouter>
                    <CartItems />
                </MemoryRouter>
            </CartContext.Provider>
        </AuthContext.Provider>
    );

describe('CartItems — authenticated with items', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Stub razorpay script as already loaded
        Object.defineProperty(document, 'querySelector', {
            writable: true,
            value: () => ({ src: 'razorpay' }),
        });
    });

    it('renders cart items', () => {
        renderCart();
        expect(screen.getByText(/Test Item/i)).toBeInTheDocument();
    });

    it('shows Net Total with Rs.', () => {
        renderCart();
        expect(screen.getByText(/Net Total/i)).toBeInTheDocument();
        expect(screen.getAllByText(/Rs\./i).length).toBeGreaterThan(0);
    });

    it('renders Pay Now button', () => {
        renderCart();
        expect(screen.getByText('Pay Now')).toBeInTheDocument();
    });

    it('Pay Now button is enabled when cart has items', () => {
        renderCart();
        expect(screen.getByText('Pay Now')).not.toBeDisabled();
    });

    it('shows Processing... and disables button while payment loads', async () => {
        axios.post.mockResolvedValueOnce({
            data: { id: 'order_123', currency: 'INR', amount: 10000, bookingId: 'b1' },
        });
        mockRazorpayOpen.mockImplementation(() => {}); // stays open
        renderCart();
        fireEvent.click(screen.getByText('Pay Now'));
        expect(await screen.findByText('Processing...')).toBeInTheDocument();
        expect(screen.getByText('Processing...')).toBeDisabled();
    });

    it('shows error when booking API fails', async () => {
        axios.post.mockRejectedValueOnce({
            response: { data: { message: 'Razorpay not configured' } },
        });
        renderCart();
        fireEvent.click(screen.getByText('Pay Now'));
        expect(await screen.findByText('Razorpay not configured')).toBeInTheDocument();
    });

    it('calls booking API with priceAtThatTime and correct productId', async () => {
        axios.post.mockResolvedValueOnce({
            data: { id: 'order_123', currency: 'INR', amount: 10000, bookingId: 'b1' },
        });
        renderCart();
        fireEvent.click(screen.getByText('Pay Now'));
        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledWith(
                expect.stringContaining('/api/booking/prod1'),
                expect.objectContaining({ priceAtThatTime: 100 }),
                expect.any(Object)
            );
        });
    });

    // ── Fix #1: Multi-item checkout ────────────────────────────────────────────
    it('creates one booking per cart item (multi-item checkout)', async () => {
        // prod1 booking
        axios.post.mockResolvedValueOnce({
            data: { id: 'order_1', currency: 'INR', amount: 10000, bookingId: 'b1' },
        });
        // prod2 booking
        axios.post.mockResolvedValueOnce({
            data: { id: 'order_2', currency: 'INR', amount: 40000, bookingId: 'b2' },
        });
        mockRazorpayOpen.mockImplementation(() => {});

        renderCart(multiItemCart);
        fireEvent.click(screen.getByText('Pay Now'));

        await waitFor(() => {
            // Two booking calls — one per item
            const bookingCalls = axios.post.mock.calls.filter(([url]) =>
                url.includes('/api/booking/prod')
            );
            expect(bookingCalls).toHaveLength(2);
            expect(bookingCalls[0][0]).toContain('/api/booking/prod1');
            expect(bookingCalls[1][0]).toContain('/api/booking/prod2');
        });
    });

    it('sends all bookingIds to verify endpoint after multi-item checkout', async () => {
        axios.post
            .mockResolvedValueOnce({
                data: { id: 'o1', currency: 'INR', amount: 10000, bookingId: 'b1' },
            })
            .mockResolvedValueOnce({
                data: { id: 'o2', currency: 'INR', amount: 40000, bookingId: 'b2' },
            });

        // Simulate Razorpay calling the handler with a payment response
        global.Razorpay = vi.fn(({ handler }) => ({
            open: () =>
                handler({
                    razorpay_order_id: 'pay_order_id',
                    razorpay_payment_id: 'pay_id',
                    razorpay_signature: 'sig',
                }),
            on: vi.fn(),
        }));
        // Verify call
        axios.post.mockResolvedValueOnce({ data: { success: true } });

        renderCart(multiItemCart);
        fireEvent.click(screen.getByText('Pay Now'));

        await waitFor(() => {
            const verifyCalls = axios.post.mock.calls.filter(([url]) => url.includes('/verify'));
            expect(verifyCalls).toHaveLength(1);
            expect(verifyCalls[0][1]).toMatchObject({
                bookingIds: expect.arrayContaining(['b1', 'b2']),
            });
        });
    });
});

// ── PDF Receipt download ────────────────────────────────────────────────────
describe('CartItems — PDF receipt after payment', () => {
    beforeEach(() => vi.clearAllMocks());

    const triggerSuccessfulPayment = async () => {
        // Booking API response
        axios.post.mockResolvedValueOnce({
            data: { id: 'order_123', currency: 'INR', amount: 10000, bookingId: 'b1' },
        });

        // Simulate Razorpay calling handler then verify succeeding
        global.Razorpay = vi.fn(({ handler }) => ({
            open: () =>
                handler({
                    razorpay_order_id: 'order_123',
                    razorpay_payment_id: 'pay_456',
                    razorpay_signature: 'sig_abc',
                }),
            on: vi.fn(),
        }));

        // Verify API response
        axios.post.mockResolvedValueOnce({ data: { success: true } });

        const { downloadReceipt } = await import('../utils/generateReceipt');
        downloadReceipt.mockResolvedValue(undefined);

        render(
            <AuthContext.Provider value={{ user: { name: 'Alice', email: 'alice@test.com' } }}>
                <CartContext.Provider
                    value={{
                        cart: singleItemCart,
                        addToCart: mockAddToCart,
                        removeFromCart: mockRemoveFromCart,
                        clearCart: mockClearCart,
                    }}
                >
                    <MemoryRouter>
                        <CartItems />
                    </MemoryRouter>
                </CartContext.Provider>
            </AuthContext.Provider>
        );

        fireEvent.click(screen.getByText('Pay Now'));

        // Wait for success screen
        await waitFor(() => {
            expect(screen.getByText(/Payment Successful/i)).toBeInTheDocument();
        });
    };

    it('shows Download Receipt button after successful payment', async () => {
        await triggerSuccessfulPayment();
        expect(
            screen.getByRole('button', { name: /download payment receipt/i })
        ).toBeInTheDocument();
    });

    it('Download Receipt button has correct aria-label', async () => {
        await triggerSuccessfulPayment();
        expect(screen.getByLabelText(/download payment receipt as pdf/i)).toBeInTheDocument();
    });

    it('calls downloadReceipt with correct data shape when button clicked', async () => {
        await triggerSuccessfulPayment();
        const { downloadReceipt } = await import('../utils/generateReceipt');

        fireEvent.click(screen.getByRole('button', { name: /download payment receipt/i }));

        await waitFor(() => {
            expect(downloadReceipt).toHaveBeenCalledWith(
                expect.objectContaining({
                    orderId: 'order_123',
                    paymentId: 'pay_456',
                    customerName: expect.any(String),
                    customerEmail: expect.any(String),
                    items: expect.arrayContaining([
                        expect.objectContaining({ title: 'Test Item' }),
                    ]),
                    totalAmount: expect.any(Number),
                    date: expect.any(String),
                })
            );
        });
    });

    it('shows "Generating PDF…" while download is in progress', async () => {
        await triggerSuccessfulPayment();
        const { downloadReceipt } = await import('../utils/generateReceipt');

        // Make download hang
        let resolveDl;
        downloadReceipt.mockReturnValueOnce(
            new Promise((r) => {
                resolveDl = r;
            })
        );

        fireEvent.click(screen.getByRole('button', { name: /download payment receipt/i }));

        expect(await screen.findByText(/generating pdf/i)).toBeInTheDocument();

        resolveDl();
    });
});

// ── Fix #19: Unauthenticated — use context directly, not vi.doMock ─────────────
describe('CartItems — unauthenticated', () => {
    it('shows login prompt when user is null', () => {
        render(
            <AuthContext.Provider value={{ user: null }}>
                <CartContext.Provider
                    value={{
                        cart: {},
                        addToCart: vi.fn(),
                        removeFromCart: vi.fn(),
                        clearCart: vi.fn(),
                    }}
                >
                    <MemoryRouter>
                        <CartItems />
                    </MemoryRouter>
                </CartContext.Provider>
            </AuthContext.Provider>
        );
        expect(screen.getByText(/log in/i)).toBeInTheDocument();
    });
});
