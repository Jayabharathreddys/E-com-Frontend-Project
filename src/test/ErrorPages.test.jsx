import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import NotFound from '../pages/notFound/NotFound';
import Unauthorized from '../pages/unauthorized/Unauthorized';

const renderPage = (Component) => render(
    <MemoryRouter initialEntries={['/error']}>
        <Routes>
            <Route path="/error" element={<Component />} />
            <Route path="/login" element={<div>Login Page</div>} />
            <Route path="/" element={<div>Home Page</div>} />
        </Routes>
    </MemoryRouter>
);

describe('NotFound (404) page', () => {
    it('shows 404 code', () => {
        renderPage(NotFound);
        expect(screen.getByText('404')).toBeInTheDocument();
    });

    it('shows Page Not Found heading', () => {
        renderPage(NotFound);
        expect(screen.getByText('Page Not Found')).toBeInTheDocument();
    });

    it('shows Go Home link', () => {
        renderPage(NotFound);
        expect(screen.getByText('Go Home')).toBeInTheDocument();
    });

    it('Go Home link points to /', () => {
        renderPage(NotFound);
        const link = screen.getByText('Go Home').closest('a');
        expect(link).toHaveAttribute('href', '/');
    });
});

describe('Unauthorized (401) page', () => {
    it('shows 401 code', () => {
        renderPage(Unauthorized);
        expect(screen.getByText('401')).toBeInTheDocument();
    });

    it('shows Unauthorized heading', () => {
        renderPage(Unauthorized);
        expect(screen.getByText('Unauthorized')).toBeInTheDocument();
    });

    it('shows Sign In link', () => {
        renderPage(Unauthorized);
        expect(screen.getByText('Sign In')).toBeInTheDocument();
    });

    it('shows Go Home link', () => {
        renderPage(Unauthorized);
        expect(screen.getAllByText('Go Home')[0]).toBeInTheDocument();
    });

    it('Sign In link points to /login', () => {
        renderPage(Unauthorized);
        const link = screen.getByText('Sign In').closest('a');
        expect(link).toHaveAttribute('href', '/login');
    });
});
