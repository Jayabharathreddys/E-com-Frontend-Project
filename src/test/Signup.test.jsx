import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { vi } from 'vitest';
import Signup from '../pages/signup/Signup';
import axios from 'axios';

vi.mock('axios');

const renderSignup = () => render(
    <MemoryRouter initialEntries={['/signup']}>
        <Routes>
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
    </MemoryRouter>
);

describe('Signup - field validation', () => {
    it('shows error when name is empty', async () => {
        renderSignup();
        fireEvent.click(screen.getByDisplayValue('Sign Up'));
        expect(await screen.findByText('Name is required')).toBeInTheDocument();
    });

    it('shows error for invalid email', async () => {
        renderSignup();
        fireEvent.change(screen.getByPlaceholderText('Your name..'), { target: { value: 'Alice' } });
        fireEvent.change(screen.getByPlaceholderText('Your email..'), { target: { value: 'bademail' } });
        fireEvent.click(screen.getByDisplayValue('Sign Up'));
        expect(await screen.findByText('Enter a valid email')).toBeInTheDocument();
    });

    it('shows error when password is too short', async () => {
        renderSignup();
        fireEvent.change(screen.getByPlaceholderText('Your name..'), { target: { value: 'Alice' } });
        fireEvent.change(screen.getByPlaceholderText('Your email..'), { target: { value: 'alice@test.com' } });
        fireEvent.change(screen.getByPlaceholderText('Min 6 characters..'), { target: { value: '123' } });
        fireEvent.click(screen.getByDisplayValue('Sign Up'));
        expect(await screen.findByText('Password must be at least 6 characters')).toBeInTheDocument();
    });

    it('shows error when passwords do not match', async () => {
        renderSignup();
        fireEvent.change(screen.getByPlaceholderText('Your name..'), { target: { value: 'Alice' } });
        fireEvent.change(screen.getByPlaceholderText('Your email..'), { target: { value: 'alice@test.com' } });
        fireEvent.change(screen.getByPlaceholderText('Min 6 characters..'), { target: { value: 'password1' } });
        fireEvent.change(screen.getByPlaceholderText('Repeat password..'), { target: { value: 'password2' } });
        fireEvent.click(screen.getByDisplayValue('Sign Up'));
        expect(await screen.findByText('Passwords do not match')).toBeInTheDocument();
    });

    it('shows error when confirm password is empty', async () => {
        renderSignup();
        fireEvent.change(screen.getByPlaceholderText('Your name..'), { target: { value: 'Alice' } });
        fireEvent.change(screen.getByPlaceholderText('Your email..'), { target: { value: 'alice@test.com' } });
        fireEvent.change(screen.getByPlaceholderText('Min 6 characters..'), { target: { value: 'password1' } });
        fireEvent.click(screen.getByDisplayValue('Sign Up'));
        expect(await screen.findByText('Please confirm your password')).toBeInTheDocument();
    });
});

describe('Signup - server interaction', () => {
    it('shows server error on failed signup', async () => {
        axios.post.mockRejectedValueOnce({
            response: { data: { message: 'Email already registered' } }
        });
        renderSignup();
        fireEvent.change(screen.getByPlaceholderText('Your name..'), { target: { value: 'Alice' } });
        fireEvent.change(screen.getByPlaceholderText('Your email..'), { target: { value: 'alice@test.com' } });
        fireEvent.change(screen.getByPlaceholderText('Min 6 characters..'), { target: { value: 'password1' } });
        fireEvent.change(screen.getByPlaceholderText('Repeat password..'), { target: { value: 'password1' } });
        fireEvent.click(screen.getByDisplayValue('Sign Up'));
        expect(await screen.findByText('Email already registered')).toBeInTheDocument();
    });

    it('redirects to login on successful signup', async () => {
        axios.post.mockResolvedValueOnce({ data: { status: 'success' } });
        renderSignup();
        fireEvent.change(screen.getByPlaceholderText('Your name..'), { target: { value: 'Alice' } });
        fireEvent.change(screen.getByPlaceholderText('Your email..'), { target: { value: 'alice@test.com' } });
        fireEvent.change(screen.getByPlaceholderText('Min 6 characters..'), { target: { value: 'password1' } });
        fireEvent.change(screen.getByPlaceholderText('Repeat password..'), { target: { value: 'password1' } });
        fireEvent.click(screen.getByDisplayValue('Sign Up'));
        expect(await screen.findByText('Login Page')).toBeInTheDocument();
    });
});
