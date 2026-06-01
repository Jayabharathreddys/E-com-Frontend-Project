import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import CartProvider from '../context/cart/CartProvider';
import { useCart } from '../context/cart/useCart';

// Helper component to interact with cart context
const CartConsumer = () => {
    const { cart, totalQuantity, addToCart, removeFromCart, clearCart } = useCart();
    const product = { id: 'p1', title: 'Test Product', price: 100, image: '' };

    return (
        <div>
            <div data-testid="total-qty">{totalQuantity}</div>
            <div data-testid="cart-size">{Object.keys(cart).length}</div>
            <div data-testid="item-qty">{cart['p1']?.quantity || 0}</div>
            <button onClick={() => addToCart(product)}>Add</button>
            <button onClick={() => removeFromCart('p1')}>Remove</button>
            <button onClick={() => removeFromCart('nonexistent')}>Remove Unknown</button>
            <button onClick={() => clearCart()}>Clear</button>
        </div>
    );
};

const renderWithCart = () =>
    render(
        <CartProvider>
            <CartConsumer />
        </CartProvider>
    );

describe('CartProvider', () => {
    it('starts with empty cart and zero quantity', () => {
        renderWithCart();
        expect(screen.getByTestId('total-qty').textContent).toBe('0');
        expect(screen.getByTestId('cart-size').textContent).toBe('0');
    });

    it('addToCart adds a new product', () => {
        renderWithCart();
        fireEvent.click(screen.getByText('Add'));
        expect(screen.getByTestId('total-qty').textContent).toBe('1');
        expect(screen.getByTestId('cart-size').textContent).toBe('1');
        expect(screen.getByTestId('item-qty').textContent).toBe('1');
    });

    it('addToCart increments quantity for existing product', () => {
        renderWithCart();
        fireEvent.click(screen.getByText('Add'));
        fireEvent.click(screen.getByText('Add'));
        expect(screen.getByTestId('total-qty').textContent).toBe('2');
        expect(screen.getByTestId('item-qty').textContent).toBe('2');
        expect(screen.getByTestId('cart-size').textContent).toBe('1'); // still 1 unique item
    });

    it('removeFromCart decrements quantity', () => {
        renderWithCart();
        fireEvent.click(screen.getByText('Add'));
        fireEvent.click(screen.getByText('Add'));
        fireEvent.click(screen.getByText('Remove'));
        expect(screen.getByTestId('item-qty').textContent).toBe('1');
        expect(screen.getByTestId('total-qty').textContent).toBe('1');
    });

    it('removeFromCart deletes item when quantity reaches 0', () => {
        renderWithCart();
        fireEvent.click(screen.getByText('Add'));
        fireEvent.click(screen.getByText('Remove'));
        expect(screen.getByTestId('cart-size').textContent).toBe('0');
        expect(screen.getByTestId('total-qty').textContent).toBe('0');
    });

    // ── Fix #3: removeFromCart crash guard ────────────────────────────────────
    it('removeFromCart with unknown productId does NOT crash', () => {
        renderWithCart();
        // Should not throw
        expect(() => fireEvent.click(screen.getByText('Remove Unknown'))).not.toThrow();
        // State must remain unchanged
        expect(screen.getByTestId('total-qty').textContent).toBe('0');
        expect(screen.getByTestId('cart-size').textContent).toBe('0');
    });

    it('clearCart resets cart to empty and totalQuantity to 0', () => {
        renderWithCart();
        fireEvent.click(screen.getByText('Add'));
        fireEvent.click(screen.getByText('Add'));
        expect(screen.getByTestId('total-qty').textContent).toBe('2');

        fireEvent.click(screen.getByText('Clear'));

        expect(screen.getByTestId('total-qty').textContent).toBe('0');
        expect(screen.getByTestId('cart-size').textContent).toBe('0');
    });

    // ── Fix #4: stale closure — functional updates ────────────────────────────
    it('rapid double-click increments quantity by 2 (no stale closure)', async () => {
        renderWithCart();
        // Fire two add clicks in the same event-loop tick via act
        await act(async () => {
            fireEvent.click(screen.getByText('Add'));
            fireEvent.click(screen.getByText('Add'));
        });
        // Both clicks must be reflected — stale closure would give qty=1
        expect(screen.getByTestId('total-qty').textContent).toBe('2');
        expect(screen.getByTestId('item-qty').textContent).toBe('2');
    });
});
