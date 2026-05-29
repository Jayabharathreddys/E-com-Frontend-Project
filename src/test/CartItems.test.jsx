import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CartItems from '../pages/cartItems/CartItems';
import CartContext from '../context/cart/CartContext';
import AuthContext from '../context/auth/AuthContext';
import axios from 'axios';

vi.mock('axios');

const mockCart = {
    prod1: { id: 'prod1', title: 'Test T-Shirt', price: 22, quantity: 1, image: '' },
    prod2: { id: 'prod2', title: 'Test Jacket',  price: 55, quantity: 2, image: '' },
};
// total: 22*1 + 55*2 = 132

const loggedInUser = { status: 'success', name: 'Deepthi', email: 'test@test.com' };

const renderCartItems = ({ cart = {}, user = null } = {}) =>
    render(
        <AuthContext.Provider value={{ user, setAuth: vi.fn(), logout: vi.fn() }}>
            <CartContext.Provider value={{
                cart,
                totalQuantity: Object.values(cart).reduce((s, i) => s + i.quantity, 0),
                addToCart: vi.fn(),
                removeFromCart: vi.fn(),
            }}>
                <MemoryRouter>
                    <CartItems />
                </MemoryRouter>
            </CartContext.Provider>
        </AuthContext.Provider>
    );

describe('CartItems — unauthenticated', () => {
    it('shows login prompt when user is not authenticated', () => {
        renderCartItems({ cart: mockCart, user: null });
        expect(screen.getByText(/log in/i)).toBeInTheDocument();
    });

    it('does not show cart items when unauthenticated', () => {
        renderCartItems({ cart: mockCart, user: null });
        expect(screen.queryByText('Test T-Shirt')).not.toBeInTheDocument();
    });
});

describe('CartItems — empty cart', () => {
    it('shows empty cart message', () => {
        renderCartItems({ cart: {}, user: loggedInUser });
        expect(screen.getByText(/your cart is empty/i)).toBeInTheDocument();
    });

    it('does not show Pay Now button when cart is empty', () => {
        renderCartItems({ cart: {}, user: loggedInUser });
        expect(screen.queryByText(/pay now/i)).not.toBeInTheDocument();
    });
});

describe('CartItems — with items', () => {
    it('renders all cart items', () => {
        renderCartItems({ cart: mockCart, user: loggedInUser });
        expect(screen.getByText('Test T-Shirt')).toBeInTheDocument();
        expect(screen.getByText('Test Jacket')).toBeInTheDocument();
    });

    it('shows correct net total (Rs.)', () => {
        renderCartItems({ cart: mockCart, user: loggedInUser });
        expect(screen.getByText(/132\.00/)).toBeInTheDocument();
    });

    it('renders Pay Now button', () => {
        renderCartItems({ cart: mockCart, user: loggedInUser });
        expect(screen.getByText(/pay now/i)).toBeInTheDocument();
    });
});

describe('CartItems — payment flow', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        window.Razorpay = vi.fn().mockImplementation(() => ({
            open: vi.fn(),
            on: vi.fn(),
        }));
    });

    it('calls booking API and opens Razorpay on Pay Now click', async () => {
        axios.post.mockResolvedValueOnce({
            data: { id: 'order_test123', currency: 'INR', amount: 13200 }
        });
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        document.body.appendChild(script);

        renderCartItems({ cart: mockCart, user: loggedInUser });
        fireEvent.click(screen.getByText(/pay now/i));

        await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));
        expect(axios.post).toHaveBeenCalledWith(
            expect.stringContaining('/api/booking/'),
            expect.any(Object),
            { withCredentials: true }
        );
        await waitFor(() => expect(window.Razorpay).toHaveBeenCalledTimes(1));
        const opts = window.Razorpay.mock.calls[0][0];
        expect(opts.order_id).toBe('order_test123');
        expect(opts.currency).toBe('INR');
    });

    it('shows error when booking API fails', async () => {
        axios.post.mockRejectedValueOnce({
            response: { data: { message: 'Booking failed' } }
        });
        renderCartItems({ cart: mockCart, user: loggedInUser });
        fireEvent.click(screen.getByText(/pay now/i));
        await waitFor(() =>
            expect(screen.getByText(/booking failed/i)).toBeInTheDocument()
        );
    });

    it('shows Processing... while payment loads', async () => {
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
        fireEvent.click(screen.getByText(/pay now/i));
        await waitFor(() =>
            expect(screen.getByText(/processing/i).closest('button')).toBeDisabled()
        );
    });
});
