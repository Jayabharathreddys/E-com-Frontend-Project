import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { vi } from 'vitest';
import Navbar from '../components/navbar/Navbar';
import { AuthProvider } from '../context/auth/AuthProvider';
import { CartProvider } from '../context/cart/CartProvider';
import axios from 'axios';

vi.mock('axios');

// Wrapper that lets us control auth state via sessionStorage
const NavbarWrapper = ({ categories = ['Electronics', 'Clothing'] }) => (
    <AuthProvider>
        <CartProvider>
            <MemoryRouter initialEntries={['/']}>
                <Routes>
                    <Route
                        path="*"
                        element={<Navbar categories={categories} isLoading={false} />}
                    />
                    <Route path="/login" element={<div>Login Page</div>} />
                </Routes>
            </MemoryRouter>
        </CartProvider>
    </AuthProvider>
);

describe('Navbar - unauthenticated', () => {
    beforeEach(() => sessionStorage.clear());

    it('shows Login link when user is not authenticated', () => {
        render(<NavbarWrapper user={null} />);
        expect(screen.getByText('Login')).toBeInTheDocument();
    });

    it('does not show Logout button when unauthenticated', () => {
        render(<NavbarWrapper user={null} />);
        expect(screen.queryByText('Logout')).not.toBeInTheDocument();
    });

    it('renders category links', () => {
        render(<NavbarWrapper />);
        expect(screen.getByText('Electronics')).toBeInTheDocument();
        expect(screen.getByText('Clothing')).toBeInTheDocument();
    });

    it('renders cart icon link', () => {
        render(<NavbarWrapper />);
        const cartLink = document.querySelector('.cart-icon-container');
        expect(cartLink).toBeInTheDocument();
    });

    // Fix #12: category name used as key — duplicate names would crash
    it('renders each category once (no duplicate keys)', () => {
        render(<NavbarWrapper categories={['Electronics', 'Clothing', 'Jewelery']} />);
        const lis = document.querySelectorAll('.nav-item');
        expect(lis).toHaveLength(3);
    });
});

describe('Navbar - authenticated', () => {
    beforeEach(() => {
        sessionStorage.setItem('auth_user', JSON.stringify({ name: 'Alice' }));
    });
    afterEach(() => sessionStorage.clear());

    // Logout is inside the dropdown — must open it first by clicking the account button
    const openDropdown = () => fireEvent.click(screen.getByLabelText('Account menu'));

    it('shows Logout button when sessionStorage has user', () => {
        render(<NavbarWrapper />);
        openDropdown();
        expect(screen.getByText(/Logout/i)).toBeInTheDocument();
    });

    it('does not show Login link when authenticated', () => {
        render(<NavbarWrapper />);
        expect(screen.queryByText('Login')).not.toBeInTheDocument();
    });

    // Fix #7: logout uses LOGOUT_URL not fragile string.replace
    it('calls LOGOUT_URL on logout click', async () => {
        axios.post.mockResolvedValueOnce({});
        render(<NavbarWrapper />);

        openDropdown();
        fireEvent.click(screen.getByText(/Logout/i));

        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledWith(
                expect.stringContaining('/api/auth/logout'),
                expect.anything(),
                expect.anything()
            );
        });
    });

    it('clears sessionStorage after logout', async () => {
        axios.post.mockResolvedValueOnce({});
        render(<NavbarWrapper />);

        openDropdown();
        fireEvent.click(screen.getByText(/Logout/i));

        await waitFor(() => {
            expect(sessionStorage.getItem('auth_user')).toBeNull();
        });
    });
});
