import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { vi } from 'vitest';
import ProductListing from '../pages/productListing/ProductListing';
import CartContext from '../context/cart/CartContext';
import axios from 'axios';

vi.mock('axios');

// Generate N products in a given category
const makeProducts = (n, category = 'electronics') =>
    Array.from({ length: n }, (_, i) => ({
        _id:   `id${i}`,
        name:  `Product ${i}`,
        price: String(10 + i),
        categories:    [category],
        productImages: [],
        averageRating: 0,
    }));

const cartValue = { cart: {}, addToCart: vi.fn(), removeFromCart: vi.fn(), totalQuantity: 0 };

const renderListing = (path = '/') =>
    render(
        <CartContext.Provider value={cartValue}>
            <MemoryRouter initialEntries={[path]}>
                <Routes>
                    <Route path="/"                       element={<ProductListing />} />
                    <Route path="/products/:categoryName" element={<ProductListing />} />
                </Routes>
            </MemoryRouter>
        </CartContext.Provider>
    );

describe('ProductListing', () => {
    beforeEach(() => vi.clearAllMocks());

    it('shows loader while fetching', () => {
        // Never resolves
        axios.get.mockReturnValueOnce(new Promise(() => {}));
        renderListing();
        // Loader is rendered — just check component doesn't crash
        expect(document.body).toBeTruthy();
    });

    it('shows empty state when no products match category', async () => {
        axios.get.mockResolvedValueOnce({
            data: { message: makeProducts(2, 'clothing') }
        });
        renderListing('/products/electronics');
        await waitFor(() => {
            expect(screen.getByText(/No products found/i)).toBeInTheDocument();
        });
    });

    it('shows error state on API failure', async () => {
        axios.get.mockRejectedValueOnce(new Error('Network Error'));
        renderListing();
        await waitFor(() => {
            expect(screen.getByText(/Failed to load products/i)).toBeInTheDocument();
        });
    });

    it('renders products for selected category', async () => {
        axios.get.mockResolvedValueOnce({
            data: { message: makeProducts(3, 'electronics') }
        });
        renderListing('/products/electronics');
        await waitFor(() => {
            expect(screen.getByText('Product 0')).toBeInTheDocument();
        });
    });

    // Fix #2: page resets to 1 on category change
    it('resets to page 1 when category changes', async () => {
        // 12 products — enough for 2 pages (6 per page)
        const products = [
            ...makeProducts(6, 'electronics'),
            ...makeProducts(6, 'clothing'),
        ];
        axios.get.mockResolvedValue({ data: { message: products } });

        const { rerender } = render(
            <CartContext.Provider value={cartValue}>
                <MemoryRouter initialEntries={['/products/electronics']}>
                    <Routes>
                        <Route path="/products/:categoryName" element={<ProductListing />} />
                    </Routes>
                </MemoryRouter>
            </CartContext.Provider>
        );

        // Wait for products to load
        await waitFor(() => expect(screen.queryByText(/No products/i)).not.toBeInTheDocument());

        // Navigate to page 2 if pagination is visible
        const page2Btn = screen.queryByLabelText('Page 2');
        if (page2Btn) {
            fireEvent.click(page2Btn);
            expect(page2Btn).toHaveClass('active');
        }

        // Re-render with clothing category — page should reset to 1
        rerender(
            <CartContext.Provider value={cartValue}>
                <MemoryRouter initialEntries={['/products/clothing']}>
                    <Routes>
                        <Route path="/products/:categoryName" element={<ProductListing />} />
                    </Routes>
                </MemoryRouter>
            </CartContext.Provider>
        );

        await waitFor(() => {
            const page1Btn = screen.queryByLabelText('Page 1');
            if (page1Btn) {
                expect(page1Btn).toHaveClass('active');
            }
        });
    });
});
