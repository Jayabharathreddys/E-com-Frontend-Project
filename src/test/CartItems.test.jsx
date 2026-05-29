import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CartItems from '../pages/cartItems/CartItems';
import CartContext from '../context/cart/CartContext';
import AuthContext from '../context/auth/AuthContext';
import axios from 'axios';

vi.mock('axios');

// ── helpers ──────────────────────────────────────────────────────────────────

const mockCart = {
    prod1: { id: 'prod1', title: 'Test T-Shirt', price: 22, quantity: 1, image: '' },
    prod2: { id: 'prod2', title: 'Test Jacket',  price: 55, quantity: 2, image: '' },
};

const loggedInUser = { status: 'success', name: 'Deepthi', email: 'test@test.com' };

const renderCartItems = ({ cart = {}, user = null } = {}) =>
    render(
        <AuthContext.Provider value={{ user, setAuth: vi.fn() }}>
            <CartContext.Provider value={{ cart, totalQuantity: Object.values(cart).reduce((s, i) => s + i.quantity, 0), addToCart: vi.fn(), removeFromCart: vi.fn() }}>
                <MemoryRouter>
                    <CartItems />
                </MemoryRouter>
            </CartContext.Provider>
        </AuthContext.Provider>
    );

// ── tests ─────────────────────────────────────────────────────────────────────

describe('CartItems — empty cart', () => {
    it('shows empty cart message when cart is empty', () => {
        renderCartItems({ cart: {} });
        expect(screen.getByText(/your cart is empty/i)).toBeInTheDocument();
    });

    it('does not render Pay Now button when cart is empty', () => {
        renderCartItems({ cart: {} });
        expect(screen.queryByText(/pay now/i)).not.toBeInTheDocument();
    });
});

describe('CartItems — with items', () => {
    it('renders all cart items', () => {
        renderCartItems({ cart: mockCart });
        expect(screen.getByText('Test T-Shirt')).toBeInTheDocument();
        expect(screen.getByText('Test Jacket')).toBeInTheDocument();
    });

    it('shows correct net total', () => {
        renderCartItems({ cart: mockCart });
        // 22*1 + 55*2 = 132
        expect(screen.getByText('$132.00')).toBeInTheDocument();
    });

    it('renders Pay Now button with correct amount', () => {
        renderCartItems({ cart: mockCart, user: loggedInUser });
        expect(screen.getByText(/pay now ₹132/i)).toBeInTheDocument();
    });
});

describe('CartItems — payment flow', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Mock Razorpay global
        window.Razorpay = vi.fn().mockImplementation(() => ({
            open: vi.fn(),
            on: vi.fn(),
        }));
    });

    it('shows error message if user is not logged in and clicks Pay Now', async () => {
        renderCartItems({ cart: mockCart, user: null });
        fireEvent.click(screen.getByText(/pay now/i));
        await waitFor(() =>
            expect(screen.getByText(/please login/i)).toBeInTheDocument()
        );
    });

    it('calls booking API and opens Razorpay modal on Pay Now click', async () => {
        axios.post.mockResolvedValueOnce({
            data: {
                status: 'success',
                data: { id: 'order_test123', currency: 'INR', amount: 13200 }
            }
        });

        // Mock loadScript — pretend checkout.js is already loaded
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        document.body.appendChild(script);

        renderCartItems({ cart: mockCart, user: loggedInUser });
        fireEvent.click(screen.getByText(/pay now/i));

        await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));

        // Verify it called the booking endpoint with the right price
        expect(axios.post).toHaveBeenCalledWith(
            expect.stringContaining('/api/booking/'),
            { priceAtThatTime: 132 },
            { withCredentials: true }
        );

        // Razorpay constructor should have been called
        await waitFor(() => expect(window.Razorpay).toHaveBeenCalledTimes(1));
        const rzpOptions = window.Razorpay.mock.calls[0][0];
        expect(rzpOptions.order_id).toBe('order_test123');
        expect(rzpOptions.currency).toBe('INR');
    });

    it('shows error message when booking API fails', async () => {
        axios.post.mockRejectedValueOnce({
            response: { data: { message: 'Booking failed' } }
        });

        renderCartItems({ cart: mockCart, user: loggedInUser });
        fireEvent.click(screen.getByText(/pay now/i));

        await waitFor(() =>
            expect(screen.getByText(/booking failed/i)).toBeInTheDocument()
        );
    });

    it('shows Processing... text while payment is loading', async () => {
        // Never resolves — keeps loading state
        axios.post.mockReturnValueOnce(new Promise(() => {}));

        renderCartItems({ cart: mockCart, user: loggedInUser });
        fireEvent.click(screen.getByText(/pay now/i));

        await waitFor(() =>
            expect(screen.getByText(/processing/i)).toBeInTheDocument()
        );
    });

    it('Pay Now button is disabled while processing', async () => {
        axios.post.mockReturnValueOnce(new Promise(() => {}));

        renderCartItems({ cart: mockCart, user: loggedInUser });
        const btn = screen.getByText(/pay now/i);
        fireEvent.click(btn);

        await waitFor(() =>
            expect(screen.getByText(/processing/i).closest('button')).toBeDisabled()
        );
    });
});
