import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import RequireAuth from '../components/requireAuth/RequireAuth';
import AuthContext from '../context/auth/AuthContext';

const renderWithAuth = (user) =>
    render(
        <AuthContext.Provider value={{ user, setAuth: () => {} }}>
            <MemoryRouter initialEntries={['/protected']}>
                <Routes>
                    <Route element={<RequireAuth />}>
                        <Route path="/protected" element={<div>Protected Content</div>} />
                    </Route>
                    <Route path="/login" element={<div>Login Page</div>} />
                </Routes>
            </MemoryRouter>
        </AuthContext.Provider>
    );

describe('RequireAuth', () => {
    it('renders protected content when user is logged in', () => {
        renderWithAuth({ name: 'Deepthi', email: 'test@test.com' });
        expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('redirects to /login when user is null', () => {
        renderWithAuth(null);
        expect(screen.getByText('Login Page')).toBeInTheDocument();
        expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('allows access when user is a non-null object', () => {
        renderWithAuth({});
        expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });
});
