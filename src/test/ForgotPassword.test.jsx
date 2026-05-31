import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { vi } from 'vitest';
import ForgotPassword from '../pages/forgotPassword/ForgotPassword';
import axios from 'axios';

vi.mock('axios');

const renderPage = () => render(
    <MemoryRouter initialEntries={['/forgot-password']}>
        <Routes>
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/login" element={<div>Login Page</div>} />
            <Route path="/reset-password/:userId" element={<div>Reset Page</div>} />
        </Routes>
    </MemoryRouter>
);

describe('ForgotPassword — validation', () => {
    it('shows error when email is empty', async () => {
        renderPage();
        fireEvent.click(screen.getByDisplayValue('Send OTP'));
        expect(await screen.findByText('Email is required')).toBeInTheDocument();
    });

    it('shows error for invalid email format', async () => {
        renderPage();
        fireEvent.change(screen.getByPlaceholderText('Your email..'), { target: { value: 'notanemail' } });
        fireEvent.click(screen.getByDisplayValue('Send OTP'));
        expect(await screen.findByText('Enter a valid email')).toBeInTheDocument();
    });

    it('clears email error when user starts typing', async () => {
        renderPage();
        fireEvent.click(screen.getByDisplayValue('Send OTP'));
        expect(await screen.findByText('Email is required')).toBeInTheDocument();
        fireEvent.change(screen.getByPlaceholderText('Your email..'), { target: { value: 'a' } });
        expect(screen.queryByText('Email is required')).not.toBeInTheDocument();
    });
});

describe('ForgotPassword — server interaction', () => {
    it('shows server error when email not found', async () => {
        axios.patch.mockRejectedValueOnce({
            response: { data: { message: 'no user with this email id found' } }
        });
        renderPage();
        fireEvent.change(screen.getByPlaceholderText('Your email..'), { target: { value: 'unknown@test.com' } });
        fireEvent.click(screen.getByDisplayValue('Send OTP'));
        expect(await screen.findByText('no user with this email id found')).toBeInTheDocument();
    });

    it('shows fallback error on network failure', async () => {
        axios.patch.mockRejectedValueOnce(new Error('Network Error'));
        renderPage();
        fireEvent.change(screen.getByPlaceholderText('Your email..'), { target: { value: 'user@test.com' } });
        fireEvent.click(screen.getByDisplayValue('Send OTP'));
        expect(await screen.findByText('Failed to send OTP. Please try again.')).toBeInTheDocument();
    });

    it('shows OTP sent confirmation on success', async () => {
        axios.patch.mockResolvedValueOnce({ data: { status: 'success', userId: 'user123' } });
        renderPage();
        fireEvent.change(screen.getByPlaceholderText('Your email..'), { target: { value: 'user@test.com' } });
        fireEvent.click(screen.getByDisplayValue('Send OTP'));
        expect(await screen.findByText('Check Your Email')).toBeInTheDocument();
        expect(screen.getByText(/We sent a 6-digit OTP/)).toBeInTheDocument();
    });

    it('shows the email address on success screen', async () => {
        axios.patch.mockResolvedValueOnce({ data: { status: 'success', userId: 'user123' } });
        renderPage();
        fireEvent.change(screen.getByPlaceholderText('Your email..'), { target: { value: 'jay@test.com' } });
        fireEvent.click(screen.getByDisplayValue('Send OTP'));
        expect(await screen.findByText('jay@test.com')).toBeInTheDocument();
    });

    it('shows Enter OTP button on success', async () => {
        axios.patch.mockResolvedValueOnce({ data: { status: 'success', userId: 'user123' } });
        renderPage();
        fireEvent.change(screen.getByPlaceholderText('Your email..'), { target: { value: 'user@test.com' } });
        fireEvent.click(screen.getByDisplayValue('Send OTP'));
        expect(await screen.findByText(/Enter OTP/)).toBeInTheDocument();
    });
});

describe('ForgotPassword — navigation', () => {
    it('shows Back to Sign In link', () => {
        renderPage();
        expect(screen.getByText('Back to Sign In')).toBeInTheDocument();
    });

    it('shows Forgot Password heading', () => {
        renderPage();
        expect(screen.getByText('Forgot Password')).toBeInTheDocument();
    });
});
