import { useState } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../../context/auth/useAuth';
import useFetchData from '../../hooks/useFetchData';
import urlConfig from '../../utils/urlConfig';
import Loader from '../../components/loader';
import './orders.css';

const STATUS_TABS = [
    { key: 'all', label: 'All Orders' },
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'pending', label: 'Pending' },
    { key: 'failed', label: 'Failed' },
];

const STATUS_BADGE = {
    confirmed: { cls: 'badge-confirmed', text: '✓ Confirmed' },
    pending: { cls: 'badge-pending', text: '⏳ Pending' },
    failed: { cls: 'badge-failed', text: '✗ Failed' },
    success: { cls: 'badge-confirmed', text: '✓ Success' },
};

function formatDate(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

function OrderCard({ order }) {
    const product = order.product || {};
    const image = product.productImages?.[0] || 'https://via.placeholder.com/80?text=No+Image';
    const badge = STATUS_BADGE[order.status] || { cls: 'badge-pending', text: order.status };
    const amount = (order.priceAtThatTime * (order.quantity || 1)).toFixed(2);

    return (
        <div className="order-card">
            <div className="order-card-header">
                <span className="order-id">{order.payment_order_id || order._id}</span>
                <span className={`order-badge ${badge.cls}`}>{badge.text}</span>
            </div>
            <div className="order-card-body">
                <img
                    src={image}
                    alt={product.name || 'Product'}
                    className="order-product-img"
                    onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/80?text=No+Image';
                    }}
                />
                <div className="order-product-info">
                    <p className="order-product-name">{product.name || '—'}</p>
                    <p className="order-product-meta">Qty: {order.quantity || 1}</p>
                    <p className="order-product-meta">Ordered: {formatDate(order.createdAt)}</p>
                </div>
                <div className="order-amount">
                    <p className="order-total">Rs. {amount}</p>
                    <Link
                        to={`/orders/${order._id}`}
                        className="order-view-btn"
                        aria-label={`View details for order ${order._id}`}
                    >
                        View Details →
                    </Link>
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

    const url =
        activeTab === 'all'
            ? urlConfig.MY_ORDERS_URL
            : `${urlConfig.MY_ORDERS_URL}?status=${activeTab}`;

    const { data, isLoading, error } = useFetchData(url, { data: [] });
    const allOrders = data?.data || [];

    // Client-side search by order ID or product name
    const orders = search.trim()
        ? allOrders.filter((o) => {
              const q = search.toLowerCase();
              return (
                  (o.payment_order_id || o._id || '').toLowerCase().includes(q) ||
                  (o.product?.name || '').toLowerCase().includes(q)
              );
          })
        : allOrders;

    if (!user) {
        return (
            <div className="orders-page">
                <div className="orders-empty">
                    <p>
                        Please <Link to="/login">log in</Link> to view your orders.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="orders-page container">
            <div className="orders-page-header">
                <h1 className="orders-heading">My Orders</h1>
                <input
                    type="search"
                    className="orders-search"
                    placeholder="Search by order ID or product name…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
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
                <div className="orders-list">
                    {orders.map((order) => (
                        <OrderCard key={order._id} order={order} />
                    ))}
                </div>
            )}
        </div>
    );
}
