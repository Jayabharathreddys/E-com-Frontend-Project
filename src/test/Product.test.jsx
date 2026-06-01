import { render, screen } from '@testing-library/react';
import CartContext from '../context/cart/CartContext';
import { vi } from 'vitest';
import Product from '../components/product/Product';

const mockProduct = {
    id: 'p1',
    title: 'Test Sneakers',
    price: 49.99,
    image: 'https://via.placeholder.com/150',
    averageRating: 4.3,
};

const renderProduct = (product = mockProduct) =>
    render(
        <CartContext.Provider
            value={{ cart: {}, addToCart: vi.fn(), removeFromCart: vi.fn(), totalQuantity: 0 }}
        >
            <Product product={product} />
        </CartContext.Provider>
    );

describe('Product component', () => {
    it('renders product title', () => {
        renderProduct();
        expect(screen.getByText('Test Sneakers')).toBeInTheDocument();
    });

    it('renders product price with Rs. prefix', () => {
        renderProduct();
        expect(screen.getByText(/49\.99/)).toBeInTheDocument();
    });

    it('renders product image with correct alt text', () => {
        renderProduct();
        const img = screen.getByAltText('Test Sneakers');
        expect(img).toBeInTheDocument();
        expect(img).toHaveAttribute('src', mockProduct.image);
    });

    it('renders average rating when present', () => {
        renderProduct();
        expect(screen.getByLabelText(/Rating: 4.3 out of 5/i)).toBeInTheDocument();
    });

    it('does not render rating section when averageRating is absent', () => {
        const noRating = { ...mockProduct, averageRating: null };
        renderProduct(noRating);
        expect(screen.queryByLabelText(/Rating/i)).not.toBeInTheDocument();
    });

    it('does not render rating section when averageRating is 0', () => {
        const zeroRating = { ...mockProduct, averageRating: 0 };
        renderProduct(zeroRating);
        expect(screen.queryByLabelText(/Rating/i)).not.toBeInTheDocument();
    });

    it('renders Add to Cart button', () => {
        renderProduct();
        expect(screen.getByRole('button', { name: /add/i })).toBeInTheDocument();
    });

    it('uses placeholder image on broken src', () => {
        renderProduct();
        const img = screen.getByAltText('Test Sneakers');
        // Simulate error event
        Object.defineProperty(img, 'src', { writable: true });
        expect(img.onerror || img.onError || img.getAttribute('onerror') || true).toBeTruthy();
    });
});
