import { NavLink } from 'react-router-dom';
import useFetchData from '../../hooks/useFetchData';
import urlConfig from '../../utils/urlConfig';
import Loader from '../../components/loader';
import './admin.css';

const NAV = [
    { to: '/admin/orders', icon: '📦', label: 'Orders' },
    { to: '/admin/products', icon: '🛒', label: 'Products' },
    { to: '/admin/users', icon: '👥', label: 'Users' },
    { to: '/admin/reviews', icon: '⭐', label: 'Reviews' },
];

export default function AdminDashboard() {
    const { data: ordersData, isLoading: oL } = useFetchData(urlConfig.ADMIN_ORDERS_URL, {
        data: { allBookings: [] },
    });
    const { data: productsData, isLoading: pL } = useFetchData(urlConfig.ALL_PRODUCT_URL, {
        message: [],
    });
    const { data: usersData, isLoading: uL } = useFetchData(urlConfig.ADMIN_USERS_URL, {
        data: [],
    });
    const { data: reviewsData, isLoading: rL } = useFetchData(
        `${urlConfig.ADMIN_REVIEWS_URL}?limit=1`,
        { total: 0 }
    );

    const orderCount = ordersData?.data?.allBookings?.length ?? 0;
    const productCount = productsData?.message?.length ?? 0;
    const userCount = usersData?.data?.length ?? 0;
    const reviewTotal = reviewsData?.total ?? 0;

    const isLoading = oL || pL || uL || rL;

    return (
        <div className="admin-page">
            <div className="admin-header">
                <div>
                    <h1 className="admin-title">Admin Dashboard</h1>
                    <p className="admin-subtitle">JBE Commerce management console</p>
                </div>
            </div>

            <nav className="admin-nav">
                {NAV.map((n) => (
                    <NavLink
                        key={n.to}
                        to={n.to}
                        className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
                    >
                        {n.icon} {n.label}
                    </NavLink>
                ))}
            </nav>

            {isLoading ? (
                <Loader />
            ) : (
                <div className="admin-stats">
                    <div className="stat-card">
                        <div className="stat-card-icon">📦</div>
                        <div className="stat-card-value">{orderCount}</div>
                        <div className="stat-card-label">Total Orders</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-card-icon">🛒</div>
                        <div className="stat-card-value">{productCount}</div>
                        <div className="stat-card-label">Products</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-card-icon">👥</div>
                        <div className="stat-card-value">{userCount}</div>
                        <div className="stat-card-label">Users</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-card-icon">⭐</div>
                        <div className="stat-card-value">{reviewTotal}</div>
                        <div className="stat-card-label">Reviews</div>
                    </div>
                </div>
            )}
        </div>
    );
}
