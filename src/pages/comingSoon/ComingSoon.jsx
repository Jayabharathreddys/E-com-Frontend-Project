import { Link, useLocation } from 'react-router-dom';
import './comingSoon.css';

// Per-route flavour so each page feels intentional rather than generic
const FEATURE_META = {
    '/wishlist': {
        icon: '❤️',
        title: 'Wishlist',
        teaser: [
            'Save your favourite products',
            'Get price-drop alerts',
            'Move items to cart in one click',
            'Share your wishlist with friends',
        ],
    },
    '/dashboard': {
        icon: '🏠',
        title: 'Dashboard',
        teaser: [
            'Overview of all your activity',
            'Quick access to recent orders',
            'Personalised recommendations',
            'Account health summary',
        ],
    },
    '/addresses': {
        icon: '📍',
        title: 'Saved Addresses',
        teaser: [
            'Store multiple delivery addresses',
            'Set a default shipping address',
            'Edit or remove addresses anytime',
            'Faster checkout experience',
        ],
    },
    '/profile': {
        icon: '⚙️',
        title: 'Profile Settings',
        teaser: [
            'Update your name and email',
            'Change your password securely',
            'Manage notification preferences',
            'Control privacy settings',
        ],
    },
};

const DEFAULT_META = {
    icon: '🚀',
    title: 'Feature Coming Soon',
    teaser: [
        'Our team is building this module',
        'Expected in an upcoming release',
        'Thank you for your patience',
    ],
};

export default function ComingSoon() {
    const { pathname } = useLocation();
    const meta = FEATURE_META[pathname] || DEFAULT_META;

    return (
        <div className="cs-page">
            <div className="cs-card">
                <div className="cs-icon">{meta.icon}</div>
                <h1 className="cs-title">{meta.title}</h1>
                <p className="cs-subtitle">This feature is currently under development.</p>

                <ul className="cs-teaser">
                    {meta.teaser.map((item) => (
                        <li key={item}>
                            <span className="cs-check">✓</span> {item}
                        </li>
                    ))}
                </ul>

                <p className="cs-badge">Coming in Version 2.0</p>

                <div className="cs-actions">
                    <Link to="/" className="cs-btn primary">
                        Continue Shopping
                    </Link>
                    <Link to="/orders" className="cs-btn secondary">
                        My Orders
                    </Link>
                </div>
            </div>
        </div>
    );
}
