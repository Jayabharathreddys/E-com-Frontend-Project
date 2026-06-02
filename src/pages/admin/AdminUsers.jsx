import { useState } from 'react';
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

export default function AdminUsers() {
    const [search, setSearch] = useState('');
    const [refresh, setRefresh] = useState(0);
    const [updatingId, setUpdatingId] = useState(null);
    const [deletingId, setDeletingId] = useState(null);

    const { data, isLoading, error } = useFetchData(`${urlConfig.ADMIN_USERS_URL}?_r=${refresh}`, {
        data: [],
    });
    const users = data?.data || [];

    const filtered = search
        ? users.filter(
              (u) =>
                  (u.name || '').toLowerCase().includes(search.toLowerCase()) ||
                  (u.email || '').toLowerCase().includes(search.toLowerCase())
          )
        : users;

    const token = sessionStorage.getItem('auth_token');
    const authOpts = {
        withCredentials: true,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
    };

    const handleRoleChange = async (userId, newRole) => {
        setUpdatingId(userId);
        try {
            await axios.patch(
                `${urlConfig.ADMIN_USERS_URL}/${userId}/role`,
                { role: newRole },
                authOpts
            );
            setRefresh((r) => r + 1);
        } catch (e) {
            alert(e.response?.data?.message || 'Role update failed');
        } finally {
            setUpdatingId(null);
        }
    };

    const handleDelete = async (userId, name) => {
        if (!window.confirm(`Delete user "${name}"? This cannot be undone.`)) return;
        setDeletingId(userId);
        try {
            await axios.delete(`${urlConfig.ADMIN_USERS_URL}/${userId}`, authOpts);
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
                    <h1 className="admin-title">Users</h1>
                    <p className="admin-subtitle">{filtered.length} accounts</p>
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
                        placeholder="Search by name or email…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        aria-label="Search users"
                    />
                </div>

                {isLoading && <Loader />}
                {error && <div className="admin-error">Failed to load users.</div>}

                {!isLoading && !error && (
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Verified</th>
                                <th>Joined</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="admin-empty">
                                        No users found.
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((u) => (
                                    <tr key={u._id}>
                                        <td style={{ fontWeight: 600 }}>{u.name}</td>
                                        <td>{u.email}</td>
                                        <td>
                                            <select
                                                className="role-select"
                                                value={u.role}
                                                disabled={updatingId === u._id}
                                                onChange={(e) =>
                                                    handleRoleChange(u._id, e.target.value)
                                                }
                                                aria-label={`Change role for ${u.name}`}
                                            >
                                                <option value="user">user</option>
                                                <option value="seller">seller</option>
                                                <option value="admin">admin</option>
                                            </select>
                                        </td>
                                        <td>
                                            {u.isEmailVerified === false ? (
                                                <span className="badge badge-failed">
                                                    Unverified
                                                </span>
                                            ) : (
                                                <span className="badge badge-confirmed">
                                                    Verified
                                                </span>
                                            )}
                                        </td>
                                        <td>
                                            {u.createdAt
                                                ? new Date(u.createdAt).toLocaleDateString()
                                                : '—'}
                                        </td>
                                        <td>
                                            <button
                                                className="admin-btn admin-btn-danger admin-btn-sm"
                                                disabled={deletingId === u._id}
                                                onClick={() => handleDelete(u._id, u.name)}
                                            >
                                                {deletingId === u._id ? '…' : 'Delete'}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
