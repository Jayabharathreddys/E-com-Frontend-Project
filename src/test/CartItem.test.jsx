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

const mockCartDataStringPrice = {
    ...mockCartData,
    price: '109.99',   // price as string (from API/context)
};

describe('CartItem', () => {
    it('renders product title', () => {
        render(<CartItem cartData={mockCartData} />);
        expect(screen.getByText('Test Backpack')).toBeInTheDocument();
    });

    it('renders unit price with Rs. currency', () => {
        render(<CartItem cartData={mockCartData} />);
        // Both unit price and total show Rs. — check unit price by its specific number
        expect(screen.getByText(/109\.99/)).toBeInTheDocument();
        // Rs. appears in both price elements — just confirm at least one exists
        expect(screen.getAllByText(/Rs\./i).length).toBeGreaterThanOrEqual(2);
    });

    it('renders total price (price × quantity)', () => {
        render(<CartItem cartData={mockCartData} />);
        expect(screen.getByText(/219\.98/)).toBeInTheDocument();
    });

    it('renders quantity', () => {
        render(<CartItem cartData={mockCartData} />);
        expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('renders product image with correct src and alt', () => {
        render(<CartItem cartData={mockCartData} />);
        const img = screen.getByRole('img');
        expect(img).toHaveAttribute('src', mockCartData.image);
        expect(img).toHaveAttribute('alt', mockCartData.title);
    });

    it('handles string price without crashing (price.toFixed guard)', () => {
        // price arriving as string must not throw
        render(<CartItem cartData={mockCartDataStringPrice} />);
        expect(screen.getByText(/109\.99/)).toBeInTheDocument();
    });

    it('handles missing price gracefully (defaults to 0)', () => {
        render(<CartItem cartData={{ ...mockCartData, price: undefined }} />);
        // Both unit price (0.00) and total (0.00 × qty) show 0.00 — check at least one
        expect(screen.getAllByText(/0\.00/).length).toBeGreaterThanOrEqual(1);
    });
});
