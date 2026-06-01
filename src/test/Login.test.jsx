import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { vi } from 'vitest';
import Login from '../pages/login/Login';
import { AuthProvider } from '../context/auth/AuthProvider';
import axios from 'axios';

vi.mock('axios');

const renderLogin = (locationState = {}) => {
    return render(
        <AuthProvider>
            <MemoryRouter initialEntries={[{ pathname: '/login', state: locationState }]}>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/" element={<div>Home Page</div>} />
                    <Route path="/products" element={<div>Products Page</div>} />
                </Routes>
            </MemoryRouter>
        </AuthProvider>
    );
};

describe('Login - field validation', () => {
    it('shows error when email is empty', async () => {
        renderLogin();
        fireEvent.click(screen.getByDisplayValue('Login'));
        expect(await screen.findByText('Email is required')).toBeInTheDocument();
    });

    it('shows error for invalid email format', async () => {
        renderLogin();
        fireEvent.change(screen.getByPlaceholderText('Your email..'), {
            target: { value: 'notanemail' },
        });
        fireEvent.click(screen.getByDisplayValue('Login'));
        expect(await screen.findByText('Enter a valid email')).toBeInTheDocument();
    });

    it('shows error when password is empty', async () => {
        renderLogin();
        fireEvent.change(screen.getByPlaceholderText('Your email..'), {
            target: { value: 'user@test.com' },
        });
        fireEvent.click(screen.getByDisplayValue('Login'));
        expect(await screen.findByText('Password is required')).toBeInTheDocument();
    });

    it('shows error when password is too short', async () => {
        renderLogin();
        fireEvent.change(screen.getByPlaceholderText('Your email..'), {
            target: { value: 'user@test.com' },
        });
        fireEvent.change(screen.getByPlaceholderText('Your Password..'), {
            target: { value: '123' },
        });
        fireEvent.click(screen.getByDisplayValue('Login'));
        expect(
            await screen.findByText('Password must be at least 6 characters')
        ).toBeInTheDocument();
    });

    it('clears field error when user starts typing', async () => {
        renderLogin();
        fireEvent.click(screen.getByDisplayValue('Login'));
        expect(await screen.findByText('Email is required')).toBeInTheDocument();
        fireEvent.change(screen.getByPlaceholderText('Your email..'), { target: { value: 'a' } });
        expect(screen.queryByText('Email is required')).not.toBeInTheDocument();
    });
});

describe('Login - server interaction', () => {
    it('shows server error on failed login', async () => {
        axios.post.mockRejectedValueOnce({
            response: { data: { message: 'Invalid credentials' } },
        });
        renderLogin();
        fireEvent.change(screen.getByPlaceholderText('Your email..'), {
            target: { value: 'user@test.com' },
        });
        fireEvent.change(screen.getByPlaceholderText('Your Password..'), {
            target: { value: 'password123' },
        });
        fireEvent.click(screen.getByDisplayValue('Login'));
        expect(await screen.findByText('Invalid credentials')).toBeInTheDocument();
    });

    it('redirects to home on successful login', async () => {
        axios.post.mockResolvedValueOnce({
            data: { status: 'success', token: 'abc', user: { name: 'Test' } },
        });
        renderLogin();
        fireEvent.change(screen.getByPlaceholderText('Your email..'), {
            target: { value: 'user@test.com' },
        });
        fireEvent.change(screen.getByPlaceholderText('Your Password..'), {
            target: { value: 'password123' },
        });
        fireEvent.click(screen.getByDisplayValue('Login'));
        expect(await screen.findByText('Home Page')).toBeInTheDocument();
    });

    it('redirects to original page after login', async () => {
        axios.post.mockResolvedValueOnce({
            data: { status: 'success', token: 'abc', user: { name: 'Test' } },
        });
        renderLogin({ from: { pathname: '/products' } });
        fireEvent.change(screen.getByPlaceholderText('Your email..'), {
            target: { value: 'user@test.com' },
        });
        fireEvent.change(screen.getByPlaceholderText('Your Password..'), {
            target: { value: 'password123' },
        });
        fireEvent.click(screen.getByDisplayValue('Login'));
        expect(await screen.findByText('Products Page')).toBeInTheDocument();
    });
});
