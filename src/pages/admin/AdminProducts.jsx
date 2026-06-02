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

const EMPTY_FORM = {
    name: '',
    brand: '',
    price: '',
    categories: '',
    description: '',
    stock_quantity: '',
    productImages: '',
};

function ProductModal({ product, onClose, onSaved }) {
    const isEdit = !!product?._id;
    const [form, setForm] = useState(
        isEdit
            ? {
                  ...product,
                  categories: (product.categories || []).join(', '),
                  productImages: (product.productImages || []).join(', '),
              }
            : EMPTY_FORM
    );
    const [saving, setSaving] = useState(false);
    const [err, setErr] = useState('');

    const token = sessionStorage.getItem('auth_token');
    const authOpts = {
        withCredentials: true,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setErr('');
        const payload = {
            ...form,
            price: form.price,
            categories: form.categories
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean),
            productImages: form.productImages
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean),
            stock_quantity: form.stock_quantity,
        };
        try {
            if (isEdit) {
                await axios.patch(`${urlConfig.ALL_PRODUCT_URL}/${product._id}`, payload, authOpts);
            } else {
                await axios.post(urlConfig.ALL_PRODUCT_URL, payload, authOpts);
            }
            onSaved();
            onClose();
        } catch (e) {
            setErr(e.response?.data?.message || 'Save failed');
        } finally {
            setSaving(false);
        }
    };

    const f = (field) => ({
        value: form[field],
        onChange: (e) => setForm((p) => ({ ...p, [field]: e.target.value })),
    });

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                <h2 className="modal-title">{isEdit ? 'Edit Product' : 'Add Product'}</h2>
                <form onSubmit={handleSubmit}>
                    {[
                        { label: 'Name *', field: 'name', required: true },
                        { label: 'Brand *', field: 'brand', required: true },
                        { label: 'Price *', field: 'price', required: true, type: 'number' },
                        {
                            label: 'Categories (comma-separated) *',
                            field: 'categories',
                            required: true,
                        },
                        {
                            label: 'Stock Quantity *',
                            field: 'stock_quantity',
                            required: true,
                            type: 'number',
                        },
                        { label: 'Image URLs (comma-separated)', field: 'productImages' },
                    ].map(({ label, field, required, type = 'text' }) => (
                        <div className="form-group" key={field}>
                            <label>{label}</label>
                            <input
                                className="form-input"
                                type={type}
                                required={required}
                                {...f(field)}
                            />
                        </div>
                    ))}
                    <div className="form-group">
                        <label>Description *</label>
                        <textarea
                            className="form-input"
                            rows={3}
                            required
                            {...f('description')}
                            style={{ resize: 'vertical' }}
                        />
                    </div>
                    {err && (
                        <p style={{ color: '#cc0000', fontSize: '1.3rem', marginBottom: '1rem' }}>
                            {err}
                        </p>
                    )}
                    <div className="modal-actions">
                        <button
                            type="button"
                            className="admin-btn admin-btn-outline"
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="admin-btn admin-btn-primary"
                            disabled={saving}
                        >
                            {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Product'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function AdminProducts() {
    const [search, setSearch] = useState('');
    const [modal, setModal] = useState(null); // null | 'create' | product object
    const [deletingId, setDeletingId] = useState(null);
    const [refresh, setRefresh] = useState(0);

    const { data, isLoading, error } = useFetchData(`${urlConfig.ALL_PRODUCT_URL}?_r=${refresh}`, {
        message: [],
    });
    const products = data?.message || [];

    const filtered = search
        ? products.filter(
              (p) =>
                  (p.name || '').toLowerCase().includes(search.toLowerCase()) ||
                  (p.brand || '').toLowerCase().includes(search.toLowerCase())
          )
        : products;

    const token = sessionStorage.getItem('auth_token');
    const authOpts = {
        withCredentials: true,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Delete "${name}"?`)) return;
        setDeletingId(id);
        try {
            await axios.delete(`${urlConfig.ALL_PRODUCT_URL}/${id}`, authOpts);
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
                    <h1 className="admin-title">Products</h1>
                    <p className="admin-subtitle">{filtered.length} products</p>
                </div>
                <button className="admin-btn admin-btn-primary" onClick={() => setModal('create')}>
                    + Add Product
                </button>
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
                        placeholder="Search products…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        aria-label="Search products"
                    />
                </div>

                {isLoading && <Loader />}
                {error && <div className="admin-error">Failed to load products.</div>}

                {!isLoading && !error && (
                    <table>
                        <thead>
                            <tr>
                                <th>Image</th>
                                <th>Name</th>
                                <th>Brand</th>
                                <th>Price</th>
                                <th>Stock</th>
                                <th>Avg Rating</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="admin-empty">
                                        No products.
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((p) => (
                                    <tr key={p._id}>
                                        <td>
                                            <img
                                                src={
                                                    p.productImages?.[0] ||
                                                    'https://placehold.co/48x48?text=?'
                                                }
                                                alt={p.name}
                                                style={{
                                                    width: 48,
                                                    height: 48,
                                                    objectFit: 'contain',
                                                    borderRadius: 6,
                                                    border: '1px solid #eee',
                                                }}
                                                onError={(e) => {
                                                    e.target.src =
                                                        'https://placehold.co/48x48?text=?';
                                                }}
                                            />
                                        </td>
                                        <td style={{ fontWeight: 600 }}>{p.name}</td>
                                        <td>{p.brand || '—'}</td>
                                        <td>₹{p.price}</td>
                                        <td>{p.stock_quantity ?? '—'}</td>
                                        <td>
                                            {p.averageRating
                                                ? `${Number(p.averageRating).toFixed(1)} ★`
                                                : '—'}
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.6rem' }}>
                                                <button
                                                    className="admin-btn admin-btn-outline admin-btn-sm"
                                                    onClick={() => setModal(p)}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    className="admin-btn admin-btn-danger admin-btn-sm"
                                                    disabled={deletingId === p._id}
                                                    onClick={() => handleDelete(p._id, p.name)}
                                                >
                                                    {deletingId === p._id ? '…' : 'Delete'}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {modal && (
                <ProductModal
                    product={modal === 'create' ? null : modal}
                    onClose={() => setModal(null)}
                    onSaved={() => setRefresh((r) => r + 1)}
                />
            )}
        </div>
    );
}
