import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import Orders from '../pages/orders/Orders';
import AuthContext from '../context/auth/AuthContext';
import axios from 'axios';

vi.mock('axios');

const mockUser = { name: 'Alice', email: 'alice@test.com' };

const mockOrders = [
    {
        _id: 'ord1',
        payment_order_id: 'pay_order_abc',
        status: 'confirmed',
        priceAtThatTime: 99.99,
        quantity: 1,
        createdAt: '2025-01-15T10:00:00.000Z',
        product: {
            name: 'Test Sneakers',
            price: 99.99,
            productImages: ['https://placehold.co/80x80'],
        },
    },
    {
        _id: 'ord2',
        payment_order_id: 'pay_order_xyz',
        status: 'pending',
        priceAtThatTime: 49.99,
        quantity: 2,
        createdAt: '2025-01-10T08:00:00.000Z',
        product: {
            name: 'Test Backpack',
            price: 49.99,
            productImages: [],
        },
    },
];

const renderOrders = (user = mockUser) =>
    render(
        <AuthContext.Provider value={{ user }}>
            <MemoryRouter>
                <Orders />
            </MemoryRouter>
        </AuthContext.Provider>
    );

describe('Orders page', () => {
    beforeEach(() => vi.clearAllMocks());

    it('shows login prompt when user is not authenticated', () => {
        renderOrders(null);
        expect(screen.getByText(/log in/i)).toBeInTheDocument();
    });

    it('renders "My Orders" heading', async () => {
        axios.get.mockResolvedValueOnce({ data: { status: 'success', data: [] } });
        renderOrders();
        expect(screen.getByText('My Orders')).toBeInTheDocument();
    });

    it('renders all 4 status tabs', async () => {
        axios.get.mockResolvedValueOnce({ data: { status: 'success', data: [] } });
        renderOrders();
        expect(screen.getByRole('tab', { name: /all orders/i })).toBeInTheDocument();
        expect(screen.getByRole('tab', { name: /confirmed/i })).toBeInTheDocument();
        expect(screen.getByRole('tab', { name: /pending/i })).toBeInTheDocument();
        expect(screen.getByRole('tab', { name: /failed/i })).toBeInTheDocument();
    });

    it('shows empty state when there are no orders', async () => {
        axios.get.mockResolvedValueOnce({ data: { status: 'success', data: [] } });
        renderOrders();
        await waitFor(() => {
            expect(screen.getByText(/No orders yet/i)).toBeInTheDocument();
        });
    });

    it('shows Browse Products link in empty state', async () => {
        axios.get.mockResolvedValueOnce({ data: { status: 'success', data: [] } });
        renderOrders();
        await waitFor(() => {
            expect(screen.getByText('Browse Products')).toBeInTheDocument();
        });
    });

    it('renders order cards when orders exist', async () => {
        axios.get.mockResolvedValueOnce({ data: { status: 'success', data: mockOrders } });
        renderOrders();
        await waitFor(() => {
            expect(screen.getByText('Test Sneakers')).toBeInTheDocument();
            expect(screen.getByText('Test Backpack')).toBeInTheDocument();
        });
    });

    it('shows confirmed badge for confirmed orders', async () => {
        axios.get.mockResolvedValueOnce({ data: { status: 'success', data: mockOrders } });
        renderOrders();
        await waitFor(() => {
            expect(screen.getByText('✓ Confirmed')).toBeInTheDocument();
        });
    });

    it('shows pending badge for pending orders', async () => {
        axios.get.mockResolvedValueOnce({ data: { status: 'success', data: mockOrders } });
        renderOrders();
        await waitFor(() => {
            expect(screen.getByText('⏳ Pending')).toBeInTheDocument();
        });
    });

    it('renders order amount correctly', async () => {
        axios.get.mockResolvedValueOnce({ data: { status: 'success', data: mockOrders } });
        renderOrders();
        await waitFor(() => {
            expect(screen.getByText('Rs. 99.99')).toBeInTheDocument();
            expect(screen.getByText('Rs. 99.98')).toBeInTheDocument(); // 49.99 × 2
        });
    });

    it('clicking a tab re-fetches with ?status= filter', async () => {
        axios.get
            .mockResolvedValueOnce({ data: { status: 'success', data: mockOrders } }) // initial
            .mockResolvedValueOnce({ data: { status: 'success', data: [mockOrders[0]] } }); // confirmed tab

        renderOrders();
        await waitFor(() => screen.getByText('Test Sneakers'));

        fireEvent.click(screen.getByRole('tab', { name: /confirmed/i }));

        await waitFor(() => {
            // useFetchData calls axios.get(url) with one argument only
            expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('status=confirmed'));
        });
    });

    it('shows error state when API fails', async () => {
        axios.get.mockRejectedValueOnce(new Error('Network Error'));
        renderOrders();
        await waitFor(() => {
            expect(screen.getByText(/Failed to load orders/i)).toBeInTheDocument();
        });
    });

    it('"All Orders" tab is active by default', async () => {
        axios.get.mockResolvedValueOnce({ data: { status: 'success', data: [] } });
        renderOrders();
        const allTab = screen.getByRole('tab', { name: /all orders/i });
        expect(allTab).toHaveAttribute('aria-selected', 'true');
    });

    it('search input filters orders by product name', async () => {
        axios.get.mockResolvedValueOnce({ data: { status: 'success', data: mockOrders } });
        renderOrders();
        await waitFor(() => screen.getByText('Test Sneakers'));

        fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'Sneakers' } });

        expect(screen.getByText('Test Sneakers')).toBeInTheDocument();
        expect(screen.queryByText('Test Backpack')).not.toBeInTheDocument();
    });

    it('search shows "No orders matching" message when no results', async () => {
        axios.get.mockResolvedValueOnce({ data: { status: 'success', data: mockOrders } });
        renderOrders();
        await waitFor(() => screen.getByText('Test Sneakers'));

        fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'zzznomatch' } });

        expect(screen.getByText(/No orders matching/i)).toBeInTheDocument();
    });

    it('View Details link has correct href', async () => {
        axios.get.mockResolvedValueOnce({ data: { status: 'success', data: mockOrders } });
        renderOrders();
        await waitFor(() => screen.getByText('Test Sneakers'));

        const viewLinks = screen.getAllByText(/View Details/i);
        expect(viewLinks[0].closest('a')).toHaveAttribute('href', '/orders/ord1');
    });
});
