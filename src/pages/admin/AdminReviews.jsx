import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import axios from 'axios';
import useFetchData from '../../hooks/useFetchData';
import urlConfig from '../../utils/urlConfig';
import Loader from '../../components/loader';
import './admin.css';

const NAV = [
    { to: '/admin', icon: '🏠', label: 'Dashboard' },
    { to: '/admin/orders', icon: '📦', label: 'Orders' },
    { to: '/admin/products', icon: '🛒', label: 'Products' },
    { to: '/admin/users', icon: '👥', label: 'Users' },
    { to: '/admin/reviews', icon: '⭐', label: 'Reviews' },
];

function Stars({ rating }) {
    return (
        <span aria-label={`${rating} out of 5 stars`}>
            {[1, 2, 3, 4, 5].map((s) => (
                <span
                    key={s}
                    style={{ color: s <= rating ? '#f59e0b' : '#ddd', fontSize: '1.4rem' }}
                >
                    ★
                </span>
            ))}
        </span>
    );
}

export default function AdminReviews() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [deletingId, setDeletingId] = useState(null);
    const [refresh, setRefresh] = useState(0);

    const { data, isLoading, error } = useFetchData(
        `${urlConfig.ADMIN_REVIEWS_URL}?page=${page}&limit=20&_r=${refresh}`,
        { data: [], total: 0, totalPages: 1 }
    );
    const reviews = data?.data || [];
    const totalPages = data?.totalPages || 1;
    const total = data?.total || 0;

    // Clamp page when totalPages shrinks (e.g. after deleting the last row on a page)
    useEffect(() => {
        setPage((p) => Math.min(p, totalPages));
    }, [totalPages]);

    const filtered = search
        ? reviews.filter(
              (r) =>
                  (r.review || '').toLowerCase().includes(search.toLowerCase()) ||
                  (r.user?.name || '').toLowerCase().includes(search.toLowerCase()) ||
                  (r.product?.name || '').toLowerCase().includes(search.toLowerCase())
          )
        : reviews;

    const token = sessionStorage.getItem('auth_token');
    const authOpts = {
        withCredentials: true,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
    };

    const handleDelete = async (reviewId) => {
        if (!window.confirm('Delete this review?')) return;
        setDeletingId(reviewId);
        try {
            await axios.delete(`${urlConfig.ADMIN_REVIEWS_URL}/${reviewId}`, authOpts);
            setRefresh((r) => r + 1);
        } catch (e) {
            alert(e.response?.data?.message || 'Delete failed');
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="admin-page">
            <div className="admin-header">
                <div>
                    <h1 className="admin-title">Reviews</h1>
                    <p className="admin-subtitle">{total} total reviews</p>
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
                        placeholder="Search reviews, users, products…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        aria-label="Search reviews"
                    />
                </div>

                {isLoading && <Loader />}
                {error && <div className="admin-error">Failed to load reviews.</div>}

                {!isLoading && !error && (
                    <>
                        <table>
                            <thead>
                                <tr>
                                    <th>Reviewer</th>
                                    <th>Product</th>
                                    <th>Rating</th>
                                    <th>Review</th>
                                    <th>Date</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="admin-empty">
                                            No reviews found.
                                        </td>
                                    </tr>
                                ) : (
                                    filtered.map((r) => (
                                        <tr key={r._id}>
                                            <td>
                                                <div style={{ fontWeight: 600 }}>
                                                    {r.user?.name || '—'}
                                                </div>
                                                <div style={{ fontSize: '1.1rem', color: '#888' }}>
                                                    {r.user?.email}
                                                </div>
                                            </td>
                                            <td
                                                style={{
                                                    maxWidth: '14rem',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                }}
                                            >
                                                {r.product?.name || '—'}
                                            </td>
                                            <td>
                                                <Stars rating={r.rating} />
                                            </td>
                                            <td
                                                style={{
                                                    maxWidth: '24rem',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                }}
                                            >
                                                {r.review}
                                            </td>
                                            <td>
                                                {r.createdAt
                                                    ? new Date(r.createdAt).toLocaleDateString()
                                                    : '—'}
                                            </td>
                                            <td>
                                                <button
                                                    className="admin-btn admin-btn-danger admin-btn-sm"
                                                    disabled={deletingId === r._id}
                                                    onClick={() => handleDelete(r._id)}
                                                >
                                                    {deletingId === r._id ? '…' : 'Delete'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>

                        {totalPages > 1 && (
                            <div className="admin-pagination">
                                <button
                                    className="admin-page-btn"
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                >
                                    ‹
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                    <button
                                        key={p}
                                        className={`admin-page-btn ${page === p ? 'active' : ''}`}
                                        onClick={() => setPage(p)}
                                    >
                                        {p}
                                    </button>
                                ))}
                                <button
                                    className="admin-page-btn"
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
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
