import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CartProvider from '../context/cart/CartProvider';
import AddToCart from '../components/addToCart/AddToCart';

const mockProduct = {
    id: 'prod1',
    title: 'Test Product',
    price: 49.99,
    image: '',
};

const renderAddToCart = (product = mockProduct) =>
    render(
        <CartProvider>
            <AddToCart product={product} />
        </CartProvider>
    );

describe('AddToCart', () => {
    it('renders "Add to Cart" button when item not in cart', () => {
        renderAddToCart();
        expect(screen.getByText('Add to Cart')).toBeInTheDocument();
    });

    it('shows quantity controls after clicking Add to Cart', () => {
        renderAddToCart();
        fireEvent.click(screen.getByText('Add to Cart'));
        expect(screen.getByText('1')).toBeInTheDocument();
        expect(screen.getByText('+')).toBeInTheDocument();
        expect(screen.getByText('-')).toBeInTheDocument();
    });

    it('increments quantity on + click', () => {
        renderAddToCart();
        fireEvent.click(screen.getByText('Add to Cart'));
        fireEvent.click(screen.getByText('+'));
        expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('decrements quantity on - click and shows Add to Cart again at 0', () => {
        renderAddToCart();
        fireEvent.click(screen.getByText('Add to Cart'));
        fireEvent.click(screen.getByText('-'));
        expect(screen.getByText('Add to Cart')).toBeInTheDocument();
    });
});
