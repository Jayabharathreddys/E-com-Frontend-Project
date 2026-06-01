import { useParams, Link, useNavigate } from 'react-router-dom';
import useFetchData from '../../hooks/useFetchData';
import urlConfig from '../../utils/urlConfig';
import { useCart } from '../../context/cart/useCart';
import { downloadReceipt } from '../../utils/generateReceipt';
import useAuth from '../../context/auth/useAuth';
import Loader from '../../components/loader';
import { useState } from 'react';
import './orderDetail.css';

// Status timeline — steps visible for every order
const TIMELINE_STEPS = [
    { key: 'placed', label: 'Order Placed' },
    { key: 'payment', label: 'Payment Confirmed' },
    { key: 'packed', label: 'Packed' },
    { key: 'shipped', label: 'Shipped' },
    { key: 'delivered', label: 'Delivered' },
];

// Map booking status → how far along the timeline we are
const STATUS_PROGRESS = {
    pending: 1,
    confirmed: 2,
    success: 2,
    failed: 0,
};

const STATUS_BADGE = {
    confirmed: { cls: 'badge-confirmed', text: '✓ Confirmed' },
    pending: { cls: 'badge-pending', text: '⏳ Pending' },
    failed: { cls: 'badge-failed', text: '✗ Failed' },
    success: { cls: 'badge-confirmed', text: '✓ Success' },
};

function formatDate(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export default function OrderDetail() {
    const { orderId } = useParams();
    const { user } = useAuth();
    const { addToCart } = useCart();
    const navigate = useNavigate();
    const [downloading, setDownloading] = useState(false);
    const [downloadErr, setDownloadErr] = useState('');
    const [buyAgainMsg, setBuyAgainMsg] = useState('');

    const { data, isLoading, error } = useFetchData(`${urlConfig.ORDER_DETAIL_URL}/${orderId}`, {
        data: null,
    });
    const order = data?.data;

    const handleBuyAgain = () => {
        if (!order?.product) return;
        addToCart({
            id: order.product._id,
            _id: order.product._id,
            title: order.product.name,
            name: order.product.name,
            price: order.priceAtThatTime,
            image: order.product.productImages?.[0] || '',
        });
        setBuyAgainMsg('Added to cart!');
        setTimeout(() => setBuyAgainMsg(''), 2000);
    };

    const handleDownload = async () => {
        if (!order) return;
        setDownloadErr('');
        setDownloading(true);
        try {
            await downloadReceipt({
                orderId: order.payment_order_id || order._id,
                paymentId: order.payment_id || '',
                customerName: user?.user?.name || user?.name || 'Customer',
                customerEmail: user?.user?.email || user?.email || '',
                items: [
                    {
                        title: order.product?.name || 'Product',
                        price: order.priceAtThatTime,
                        quantity: order.quantity || 1,
                    },
                ],
                totalAmount: order.priceAtThatTime * (order.quantity || 1),
                date: order.createdAt || new Date().toISOString(),
            });
        } catch {
            setDownloadErr('Could not generate receipt. Please try again.');
        } finally {
            setDownloading(false);
        }
    };

    if (isLoading)
        return (
            <div className="order-detail-page container">
                <Loader />
            </div>
        );

    if (error || !order) {
        return (
            <div className="order-detail-page container">
                <div className="order-detail-error">
                    <p>Order not found or you don&apos;t have access to it.</p>
                    <Link to="/orders" className="order-back-link">
                        ← Back to My Orders
                    </Link>
                </div>
            </div>
        );
    }

    const badge = STATUS_BADGE[order.status] || { cls: 'badge-pending', text: order.status };
    const progress = STATUS_PROGRESS[order.status] ?? 0;
    const product = order.product || {};
    const image = product.productImages?.[0] || 'https://via.placeholder.com/120?text=No+Image';
    const amount = (order.priceAtThatTime * (order.quantity || 1)).toFixed(2);

    return (
        <div className="order-detail-page container">
            <Link to="/orders" className="order-back-link">
                ← Back to My Orders
            </Link>

            <div className="order-detail-card">
                {/* Header */}
                <div className="order-detail-header">
                    <div>
                        <h1 className="order-detail-title">Order Details</h1>
                        <p className="order-detail-id">{order.payment_order_id || order._id}</p>
                        <p className="order-detail-date">Placed on {formatDate(order.createdAt)}</p>
                    </div>
                    <span className={`order-badge ${badge.cls}`}>{badge.text}</span>
                </div>

                {/* Status timeline (only for non-failed orders) */}
                {order.status !== 'failed' && (
                    <div className="order-timeline">
                        {TIMELINE_STEPS.map((step, idx) => {
                            const done = idx < progress;
                            const current = idx === progress - 1;
                            return (
                                <div
                                    key={step.key}
                                    className={`timeline-step ${done ? 'done' : ''} ${current ? 'current' : ''}`}
                                >
                                    <div className="timeline-dot">{done ? '✓' : idx + 1}</div>
                                    <p className="timeline-label">{step.label}</p>
                                    {idx < TIMELINE_STEPS.length - 1 && (
                                        <div
                                            className={`timeline-connector ${done ? 'done' : ''}`}
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Failed banner */}
                {order.status === 'failed' && (
                    <div className="order-failed-banner">
                        ✗ Payment failed. Please retry or contact support.
                    </div>
                )}

                {/* Product details */}
                <div className="order-product-section">
                    <h2 className="order-section-title">Item Ordered</h2>
                    <div className="order-product-row">
                        <img
                            src={image}
                            alt={product.name}
                            className="order-product-img-lg"
                            onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/120?text=No+Image';
                            }}
                        />
                        <div className="order-product-details">
                            <p className="order-product-name-lg">{product.name || '—'}</p>
                            <p className="order-product-qty">Quantity: {order.quantity || 1}</p>
                            <p className="order-product-price">
                                Unit price: Rs. {Number(order.priceAtThatTime).toFixed(2)}
                            </p>
                        </div>
                        <div className="order-product-total-col">
                            <p className="order-product-total-lg">Rs. {amount}</p>
                        </div>
                    </div>
                </div>

                {/* Payment summary */}
                <div className="order-summary-section">
                    <h2 className="order-section-title">Payment Summary</h2>
                    <div className="order-summary-row">
                        <span>Subtotal</span>
                        <span>Rs. {amount}</span>
                    </div>
                    <div className="order-summary-row">
                        <span>Shipping</span>
                        <span className="order-free">Free</span>
                    </div>
                    <div className="order-summary-row order-summary-total">
                        <span>Total</span>
                        <span>Rs. {amount}</span>
                    </div>
                    {order.payment_id && (
                        <p className="order-payment-id">
                            Payment ID: <span>{order.payment_id}</span>
                        </p>
                    )}
                </div>

                {/* Actions */}
                <div className="order-detail-actions">
                    {order.status === 'confirmed' || order.status === 'success' ? (
                        <>
                            <button
                                className="order-action-btn primary"
                                onClick={handleDownload}
                                disabled={downloading}
                            >
                                {downloading ? 'Generating…' : '⬇ Download Invoice'}
                            </button>
                            <button className="order-action-btn secondary" onClick={handleBuyAgain}>
                                {buyAgainMsg || '🔄 Buy Again'}
                            </button>
                        </>
                    ) : order.status === 'failed' || order.status === 'pending' ? (
                        <button
                            className="order-action-btn danger"
                            onClick={() => navigate('/cart')}
                        >
                            🔁 Retry Payment
                        </button>
                    ) : null}
                    <Link to="/" className="order-action-btn outline">
                        Continue Shopping
                    </Link>
                </div>
                {downloadErr && <p className="order-detail-err">{downloadErr}</p>}
            </div>
        </div>
    );
}
