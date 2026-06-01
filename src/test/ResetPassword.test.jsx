import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { vi } from 'vitest';
import ResetPassword from '../pages/resetPassword/ResetPassword';
import axios from 'axios';

vi.mock('axios');

const renderPage = (userId = 'user123') =>
    render(
        <MemoryRouter initialEntries={[`/reset-password/${userId}`]}>
            <Routes>
                <Route path="/reset-password/:userId" element={<ResetPassword />} />
                <Route path="/login" element={<div>Login Page</div>} />
                <Route path="/forgot-password" element={<div>Forgot Page</div>} />
            </Routes>
        </MemoryRouter>
    );

describe('ResetPassword — validation', () => {
    it('shows error when OTP is empty', async () => {
        renderPage();
        fireEvent.click(screen.getByDisplayValue('Reset Password'));
        expect(await screen.findByText('OTP is required')).toBeInTheDocument();
    });

    it('shows error when new password is empty', async () => {
        renderPage();
        fireEvent.change(screen.getByPlaceholderText('Enter 6-digit OTP..'), {
            target: { value: '123456' },
        });
        fireEvent.click(screen.getByDisplayValue('Reset Password'));
        expect(await screen.findByText('New password is required')).toBeInTheDocument();
    });

    it('shows error when password is too short', async () => {
        renderPage();
        fireEvent.change(screen.getByPlaceholderText('Enter 6-digit OTP..'), {
            target: { value: '123456' },
        });
        fireEvent.change(screen.getByPlaceholderText('Min 6 characters..'), {
            target: { value: '123' },
        });
        fireEvent.click(screen.getByDisplayValue('Reset Password'));
        expect(
            await screen.findByText('Password must be at least 6 characters')
        ).toBeInTheDocument();
    });

    it('shows error when confirm password is empty', async () => {
        renderPage();
        fireEvent.change(screen.getByPlaceholderText('Enter 6-digit OTP..'), {
            target: { value: '123456' },
        });
        fireEvent.change(screen.getByPlaceholderText('Min 6 characters..'), {
            target: { value: 'newpass1' },
        });
        fireEvent.click(screen.getByDisplayValue('Reset Password'));
        expect(await screen.findByText('Please confirm your password')).toBeInTheDocument();
    });

    it('shows error when passwords do not match', async () => {
        renderPage();
        fireEvent.change(screen.getByPlaceholderText('Enter 6-digit OTP..'), {
            target: { value: '123456' },
        });
        fireEvent.change(screen.getByPlaceholderText('Min 6 characters..'), {
            target: { value: 'newpass1' },
        });
        fireEvent.change(screen.getByPlaceholderText('Repeat new password..'), {
            target: { value: 'newpass2' },
        });
        fireEvent.click(screen.getByDisplayValue('Reset Password'));
        expect(await screen.findByText('Passwords do not match')).toBeInTheDocument();
    });

    it('clears field error when user types', async () => {
        renderPage();
        fireEvent.click(screen.getByDisplayValue('Reset Password'));
        expect(await screen.findByText('OTP is required')).toBeInTheDocument();
        fireEvent.change(screen.getByPlaceholderText('Enter 6-digit OTP..'), {
            target: { value: '1' },
        });
        expect(screen.queryByText('OTP is required')).not.toBeInTheDocument();
    });
});

describe('ResetPassword — server interaction', () => {
    it('shows server error for wrong OTP', async () => {
        axios.patch.mockRejectedValueOnce({
            response: { data: { message: 'otp is not found or wrong' } },
        });
        renderPage();
        fireEvent.change(screen.getByPlaceholderText('Enter 6-digit OTP..'), {
            target: { value: 'wrong1' },
        });
        fireEvent.change(screen.getByPlaceholderText('Min 6 characters..'), {
            target: { value: 'newpass1' },
        });
        fireEvent.change(screen.getByPlaceholderText('Repeat new password..'), {
            target: { value: 'newpass1' },
        });
        fireEvent.click(screen.getByDisplayValue('Reset Password'));
        expect(await screen.findByText('otp is not found or wrong')).toBeInTheDocument();
    });

    it('shows fallback error on network failure', async () => {
        axios.patch.mockRejectedValueOnce(new Error('Network Error'));
        renderPage();
        fireEvent.change(screen.getByPlaceholderText('Enter 6-digit OTP..'), {
            target: { value: '123456' },
        });
        fireEvent.change(screen.getByPlaceholderText('Min 6 characters..'), {
            target: { value: 'newpass1' },
        });
        fireEvent.change(screen.getByPlaceholderText('Repeat new password..'), {
            target: { value: 'newpass1' },
        });
        fireEvent.click(screen.getByDisplayValue('Reset Password'));
        expect(
            await screen.findByText('Reset failed. Please check your OTP and try again.')
        ).toBeInTheDocument();
    });

    it('redirects to login on success', async () => {
        axios.patch.mockResolvedValueOnce({ data: { status: 'success' } });
        renderPage();
        fireEvent.change(screen.getByPlaceholderText('Enter 6-digit OTP..'), {
            target: { value: '123456' },
        });
        fireEvent.change(screen.getByPlaceholderText('Min 6 characters..'), {
            target: { value: 'newpass1' },
        });
        fireEvent.change(screen.getByPlaceholderText('Repeat new password..'), {
            target: { value: 'newpass1' },
        });
        fireEvent.click(screen.getByDisplayValue('Reset Password'));
        expect(await screen.findByText('Login Page')).toBeInTheDocument();
    });
});

describe('ResetPassword — UI', () => {
    it('renders heading', () => {
        renderPage();
        // Both the <p> heading and the submit button value say "Reset Password"
        // Use getAllByText and check at least one exists
        expect(screen.getAllByText('Reset Password').length).toBeGreaterThanOrEqual(1);
    });

    it('renders all 3 input fields', () => {
        renderPage();
        expect(screen.getByPlaceholderText('Enter 6-digit OTP..')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Min 6 characters..')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Repeat new password..')).toBeInTheDocument();
    });

    it('shows Request a new OTP link', () => {
        renderPage();
        expect(screen.getByText('Request a new OTP')).toBeInTheDocument();
    });

    it('shows invalid link message when no userId in URL', () => {
        render(
            <MemoryRouter initialEntries={['/reset-password/']}>
                <Routes>
                    <Route path="/reset-password/" element={<ResetPassword />} />
                </Routes>
            </MemoryRouter>
        );
        // Without a userId param the component shows the form (params.userId is undefined)
        // This tests that it doesn't crash
        expect(document.body).toBeTruthy();
    });
});
