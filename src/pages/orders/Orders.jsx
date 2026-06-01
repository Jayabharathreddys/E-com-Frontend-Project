import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import useAuth from '../../context/auth/useAuth';
import { useCart } from '../../context/cart/useCart';
import useFetchData from '../../hooks/useFetchData';
import urlConfig from '../../utils/urlConfig';
import { STATUS_BADGE, formatDate } from '../../utils/orderUtils';
import Loader from '../../components/loader';
import axios from 'axios';
import './orders.css';

const STATUS_TABS = [
    { key: 'all', label: 'All Orders' },
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'pending', label: 'Pending' },
    { key: 'failed', label: 'Failed' },
];

const ITEMS_PER_PAGE = 5;

function AccountSidebar() {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const { clearCart } = useCart();

    return (
        <aside className="account-sidebar">
            <h3 className="account-sidebar-title">My Account</h3>
            <nav className="account-sidebar-nav">
                <NavLink to="/dashboard" className="sidebar-link">
                    <span>🏠</span> Dashboard
                </NavLink>
                <NavLink to="/orders" className="sidebar-link" end>
                    <span>📦</span> My Orders
                </NavLink>
                <NavLink to="/wishlist" className="sidebar-link">
                    <span>❤️</span> Wishlist
                </NavLink>
                <NavLink to="/addresses" className="sidebar-link">
                    <span>📍</span> Addresses
                </NavLink>
                <NavLink to="/profile" className="sidebar-link">
                    <span>⚙️</span> Profile Settings
                </NavLink>
                <button
                    className="sidebar-link sidebar-logout"
                    onClick={async () => {
                        try {
                            await axios.post(urlConfig.LOGOUT_URL, {}, { withCredentials: true });
                        } catch (_) {
                            /* ignore */
                        }
                        clearCart();
                        logout();
                        navigate('/login');
                    }}
                >
                    <span>🚪</span> Logout
                </button>
            </nav>
        </aside>
    );
}

function StatusBadge({ status }) {
    const badge = STATUS_BADGE[status] || { cls: 'badge-pending', text: status };
    return <span className={`order-badge ${badge.cls}`}>{badge.text}</span>;
}

function OrderCard({ order }) {
    const product = order.product || {};
    const image = product.productImages?.[0] || 'https://placehold.co/80x80?text=No+Image';
    const amount = ((order.priceAtThatTime || 0) * (order.quantity || 1)).toFixed(2);
    const orderId = order.payment_order_id || order._id || '—';
    const isConfirmed = order.status === 'confirmed' || order.status === 'success';
    const isFailed = order.status === 'failed';

    return (
        <div className="order-card">
            <div className="order-card-header">
                <div className="order-card-id-block">
                    <span className="order-id-label">ORDER ID</span>
                    <span className="order-id-value">{orderId}</span>
                </div>
                <div className="order-card-meta">
                    <span className="order-date">{formatDate(order.createdAt, 'datetime')}</span>
                    <span className="order-items-count">
                        {order.quantity || 1} Item{(order.quantity || 1) > 1 ? 's' : ''}
                    </span>
                </div>
            </div>

            <div className="order-card-body">
                <img
                    src={image}
                    alt={product.name || 'Product'}
                    className="order-product-img"
                    onError={(e) => {
                        e.target.src = 'https://placehold.co/80x80?text=No+Image';
                    }}
                />
                <div className="order-product-info">
                    <p className="order-product-name">{product.name || '—'}</p>
                    <p className="order-product-meta">Qty: {order.quantity || 1}</p>
                </div>

                <div className="order-amount-col">
                    <div className="order-amount-block">
                        <span className="order-amount-label">Total Amount</span>
                        <span className="order-total">Rs. {amount}</span>
                    </div>
                    <div className="order-payment-method">
                        <span className="order-amount-label">Payment Method</span>
                        <span className="order-payment-value">Razorpay</span>
                    </div>
                </div>

                <div className="order-status-col">
                    <StatusBadge status={order.status} />
                    <div className="order-card-actions">
                        <Link
                            to={`/orders/${order._id}`}
                            className="order-btn order-btn-outline"
                            aria-label={`View details for order ${order._id}`}
                        >
                            View Details
                        </Link>
                        {isConfirmed && (
                            <Link
                                to={`/orders/${order._id}`}
                                className="order-btn order-btn-secondary"
                            >
                                🧾 View Invoice
                            </Link>
                        )}
                        {isFailed && (
                            <Link to="/cart" className="order-btn order-btn-danger">
                                Retry Payment
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function EmptyOrders({ tab, search }) {
    return (
        <div className="orders-empty">
            <div className="orders-empty-icon">📦</div>
            <h3>
                {search
                    ? `No orders matching "${search}"`
                    : `No ${tab === 'all' ? '' : tab} orders yet`}
            </h3>
            <p>Start shopping and your orders will appear here.</p>
            <Link to="/" className="orders-shop-btn">
                Browse Products
            </Link>
        </div>
    );
}

export default function Orders() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('all');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);

    const url =
        activeTab === 'all'
            ? urlConfig.MY_ORDERS_URL
            : `${urlConfig.MY_ORDERS_URL}?status=${activeTab}`;

    const { data, isLoading, error } = useFetchData(url, { data: [] });
    const allOrders = data?.data || [];

    const filtered = search.trim()
        ? allOrders.filter((o) => {
              const q = search.toLowerCase();
              return (
                  (o.payment_order_id || o._id || '').toLowerCase().includes(q) ||
                  (o.product?.name || '').toLowerCase().includes(q)
              );
          })
        : allOrders;

    const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
    const safePage = Math.min(page, totalPages);
    const orders = filtered.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

    if (!user) {
        return (
            <div className="orders-layout">
                <div className="orders-empty">
                    <p>
                        Please <Link to="/login">log in</Link> to view your orders.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="orders-layout container">
            <AccountSidebar />

            <main className="orders-main">
                <div className="orders-page-header">
                    <div>
                        <h1 className="orders-heading">My Orders</h1>
                        <p className="orders-subheading">Track, view and manage all your orders</p>
                    </div>
                    <input
                        type="search"
                        className="orders-search"
                        placeholder="Search by order ID or product name…"
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                        aria-label="Search orders"
                    />
                </div>

                <div className="orders-tabs" role="tablist">
                    {STATUS_TABS.map((tab) => (
                        <button
                            key={tab.key}
                            role="tab"
                            aria-selected={activeTab === tab.key}
                            className={`orders-tab ${activeTab === tab.key ? 'active' : ''}`}
                            onClick={() => {
                                setActiveTab(tab.key);
                                setSearch('');
                                setPage(1);
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {isLoading && <Loader />}

                {error && (
                    <div className="orders-error">
                        <p>Failed to load orders. Please try again.</p>
                    </div>
                )}

                {!isLoading && !error && orders.length === 0 && (
                    <EmptyOrders tab={activeTab} search={search} />
                )}

                {!isLoading && !error && orders.length > 0 && (
                    <>
                        <div className="orders-list">
                            {orders.map((order) => (
                                <OrderCard key={order._id} order={order} />
                            ))}
                        </div>

                        {totalPages > 1 && (
                            <div className="orders-pagination">
                                <button
                                    className="page-btn"
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    aria-label="Previous page"
                                >
                                    ‹
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                    <button
                                        key={p}
                                        className={`page-btn ${page === p ? 'active' : ''}`}
                                        onClick={() => setPage(p)}
                                        aria-label={`Page ${p}`}
                                        aria-current={page === p ? 'page' : undefined}
                                    >
                                        {p}
                                    </button>
                                ))}
                                <button
                                    className="page-btn"
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    aria-label="Next page"
                                >
                                    ›
                                </button>
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}
