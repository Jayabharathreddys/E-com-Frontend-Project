import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import useFetchData from '../../hooks/useFetchData';
import urlConfig from '../../utils/urlConfig';
import { STATUS_BADGE, formatDate } from '../../utils/orderUtils';
import Loader from '../../components/loader';
import './admin.css';

const PAGE_SIZE = 15;

const NAV = [
    { to: '/admin', icon: '🏠', label: 'Dashboard' },
    { to: '/admin/orders', icon: '📦', label: 'Orders' },
    { to: '/admin/products', icon: '🛒', label: 'Products' },
    { to: '/admin/users', icon: '👥', label: 'Users' },
    { to: '/admin/reviews', icon: '⭐', label: 'Reviews' },
];

export default function AdminOrders() {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [page, setPage] = useState(1);

    const { data, isLoading, error } = useFetchData(urlConfig.ADMIN_ORDERS_URL, {
        data: { allBookings: [] },
    });
    const allOrders = data?.data?.allBookings || [];

    const filtered = allOrders.filter((o) => {
        const matchStatus = statusFilter === 'all' || o.status === statusFilter;
        const q = search.toLowerCase();
        const matchSearch =
            !q ||
            (o._id || '').toLowerCase().includes(q) ||
            (o.payment_order_id || '').toLowerCase().includes(q) ||
            (o.user?.name || '').toLowerCase().includes(q) ||
            (o.user?.email || '').toLowerCase().includes(q) ||
            (o.product?.name || '').toLowerCase().includes(q);
        return matchStatus && matchSearch;
    });

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const safePage = Math.min(page, totalPages);
    const rows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

    return (
        <div className="admin-page">
            <div className="admin-header">
                <div>
                    <h1 className="admin-title">All Orders</h1>
                    <p className="admin-subtitle">{filtered.length} orders</p>
                </div>
            </div>

            <nav className="admin-nav">
                {NAV.map((n) => (
                    <NavLink
                        key={n.to}
                        to={n.to}
                        end={n.to === '/admin'}
                        className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
                    >
                        {n.icon} {n.label}
                    </NavLink>
                ))}
            </nav>

            <div className="admin-table-wrap">
                <div className="admin-table-toolbar">
                    <input
                        type="search"
                        className="admin-search"
                        placeholder="Search by order ID, user, product…"
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                        aria-label="Search orders"
                    />
                    <select
                        className="role-select"
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setPage(1);
                        }}
                    >
                        <option value="all">All statuses</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="pending">Pending</option>
                        <option value="failed">Failed</option>
                    </select>
                </div>

                {isLoading && <Loader />}
                {error && <div className="admin-error">Failed to load orders.</div>}

                {!isLoading && !error && (
                    <>
                        <table>
                            <thead>
                                <tr>
                                    <th>Order ID</th>
                                    <th>User</th>
                                    <th>Product</th>
                                    <th>Qty</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="admin-empty">
                                            No orders found.
                                        </td>
                                    </tr>
                                ) : (
                                    rows.map((o) => {
                                        const badge = STATUS_BADGE[o.status] || {
                                            cls: 'badge-pending',
                                            text: o.status,
                                        };
                                        const amount = (
                                            (o.priceAtThatTime || 0) * (o.quantity || 1)
                                        ).toFixed(2);
                                        return (
                                            <tr key={o._id}>
                                                <td>
                                                    <code style={{ fontSize: '1.1rem' }}>
                                                        {o.payment_order_id || o._id?.slice(-8)}
                                                    </code>
                                                </td>
                                                <td>
                                                    <div style={{ fontWeight: 600 }}>
                                                        {o.user?.name || '—'}
                                                    </div>
                                                    <div
                                                        style={{
                                                            fontSize: '1.1rem',
                                                            color: '#888',
                                                        }}
                                                    >
                                                        {o.user?.email}
                                                    </div>
                                                </td>
                                                <td>{o.product?.name || '—'}</td>
                                                <td>{o.quantity || 1}</td>
                                                <td style={{ fontWeight: 600 }}>₹{amount}</td>
                                                <td>
                                                    <span className={`badge badge-${o.status}`}>
                                                        {badge.text}
                                                    </span>
                                                </td>
                                                <td>{formatDate(o.createdAt)}</td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>

                        {totalPages > 1 && (
                            <div className="admin-pagination">
                                <button
                                    className="admin-page-btn"
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={safePage === 1}
                                >
                                    ‹
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                    <button
                                        key={p}
                                        className={`admin-page-btn ${safePage === p ? 'active' : ''}`}
                                        onClick={() => setPage(p)}
                                    >
                                        {p}
                                    </button>
                                ))}
                                <button
                                    className="admin-page-btn"
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={safePage === totalPages}
                                >
                                    ›
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
