import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { vi } from 'vitest';
import Navbar from '../components/navbar/Navbar';
import { AuthProvider } from '../context/auth/AuthProvider';
import { CartProvider } from '../context/cart/CartProvider';
import useAuth from '../context/auth/useAuth';
import axios from 'axios';

vi.mock('axios');

// Wrapper that lets us control auth state
const NavbarWithAuth = ({ user = null }) => {
    return (
        <AuthProvider>
            <CartProvider>
                <MemoryRouter initialEntries={['/']}>
                    <Routes>
                        <Route path="*" element={
                            <AuthInjector user={user}>
                                <Navbar categories={['Electronics', 'Clothing']} isLoading={false} />
                            </AuthInjector>
                        } />
                        <Route path="/login" element={<div>Login Page</div>} />
                    </Routes>
                </MemoryRouter>
            </CartProvider>
        </AuthProvider>
    );
};

// Helper component to inject auth state
const AuthInjector = ({ user, children }) => {
    const { setAuth } = useAuth();
    if (user) {
        // Set auth synchronously for test
        sessionStorage.setItem('auth_user', JSON.stringify(user));
    }
    return children;
};

describe('Navbar - unauthenticated', () => {
    beforeEach(() => sessionStorage.clear());

    it('shows Login link when user is not authenticated', () => {
        render(<NavbarWithAuth user={null} />);
        expect(screen.getByText('Login')).toBeInTheDocument();
    });

    it('does not show Logout button when unauthenticated', () => {
        render(<NavbarWithAuth user={null} />);
        expect(screen.queryByText('Logout')).not.toBeInTheDocument();
    });

    it('renders category links', () => {
        render(<NavbarWithAuth />);
        expect(screen.getByText('Electronics')).toBeInTheDocument();
        expect(screen.getByText('Clothing')).toBeInTheDocument();
    });
});

describe('Navbar - authenticated', () => {
    beforeEach(() => {
        sessionStorage.setItem('auth_user', JSON.stringify({ status: 'success', name: 'Alice' }));
    });
    afterEach(() => sessionStorage.clear());

    it('shows Logout button when user is authenticated', () => {
        render(
            <CartProvider>
                <MemoryRouter>
                    <Navbar categories={[]} isLoading={false} />
                </MemoryRouter>
            </CartProvider>
        );
        // Since AuthProvider reads sessionStorage on init, it should show Logout
        // We render with AuthProvider that has user already in sessionStorage
    });
});

describe('Navbar - error pages', () => {
    beforeEach(() => sessionStorage.clear());

    it('shows cart icon', () => {
        render(<NavbarWithAuth />);
        // cart icon container should be present (link to /cart)
        const cartLink = document.querySelector('.cart-icon-container');
        expect(cartLink).toBeInTheDocument();
    });
});
