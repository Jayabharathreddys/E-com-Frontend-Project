import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import CartItem from '../components/cartItem/CartItem';

const mockCartData = {
    id: 'abc123',
    title: 'Test Backpack',
    price: 109.99,
    quantity: 2,
    image: 'https://via.placeholder.com/150',
};

describe('CartItem', () => {
    it('renders product title', () => {
        render(<CartItem cartData={mockCartData} />);
        expect(screen.getByText('Test Backpack')).toBeInTheDocument();
    });

    it('renders unit price correctly', () => {
        render(<CartItem cartData={mockCartData} />);
        expect(screen.getByText('$109.99')).toBeInTheDocument();
    });

    it('renders total price (price × quantity)', () => {
        render(<CartItem cartData={mockCartData} />);
        expect(screen.getByText('$219.98')).toBeInTheDocument();
    });

    it('renders quantity', () => {
        render(<CartItem cartData={mockCartData} />);
        expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('renders product image with correct src', () => {
        render(<CartItem cartData={mockCartData} />);
        const img = screen.getByRole('img');
        expect(img).toHaveAttribute('src', mockCartData.image);
        expect(img).toHaveAttribute('alt', mockCartData.title);
    });
});
