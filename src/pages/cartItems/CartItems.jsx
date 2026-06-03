import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/cart/useCart';
import useAuth from '../../context/auth/useAuth';
import CartItem from '../../components/cartItem';
import './cartItems.css';
import urlConfig from '../../utils/urlConfig';
import axios from 'axios';
import { downloadReceipt } from '../../utils/generateReceipt';

const loadRazorpayScript = () =>
    new Promise((resolve) => {
        if (document.querySelector('script[src*="razorpay"]')) return resolve(true);
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });

/**
 * Render the shopping cart interface, handle the Razorpay checkout flow, and provide a receipt download after successful payment.
 *
 * Displays a login prompt when no user is present, lists cart items with a net total and a "Pay Now" action when items exist, and shows a payment success view with a PDF receipt download button after a successful transaction. Initiates backend booking creation and payment verification, clears the cart on verified payment, and stores receipt data for download.
 *
 * @returns {JSX.Element} The cart page UI component.
 */
function CartItems() {
    const { cart, clearCart } = useCart();
    const { user } = useAuth();
    const [paymentErr, setPaymentErr] = useState('');
    const [processing, setProcessing] = useState(false);
    const [success, setSuccess] = useState(false);
    const [receiptData, setReceiptData] = useState(null);
    const [downloading, setDownloading] = useState(false);
    const [downloadErr, setDownloadErr] = useState('');

    const cartItems = Object.values(cart || {});
    const totalPrice = cartItems.reduce(
        (sum, item) => sum + (parseFloat(item.price) || 0) * (item.quantity || 1),
        0
    );

    if (!user) {
        return (
            <div className="cart-auth-msg">
                <p>
                    Please <Link to="/login">log in</Link> to view your cart and checkout.
                </p>
            </div>
        );
    }

    if (success) {
        const handleDownload = async () => {
            if (!receiptData) return;
            setDownloadErr('');
            setDownloading(true);
            try {
                await downloadReceipt(receiptData);
            } catch {
                // Fix CR#1: surface errors to the user instead of swallowing them
                setDownloadErr('Could not generate the receipt. Please try again.');
            } finally {
                setDownloading(false);
            }
        };

        return (
            <div className="cart-success">
                <div className="cart-success-icon">✓</div>
                <h2>Payment Successful!</h2>
                <p className="cart-success-sub">
                    Thank you for your order. A confirmation email has been sent to you.
                </p>
                {receiptData?.orderId && (
                    <p className="cart-success-orderid">
                        Order ID: <span>{receiptData.orderId}</span>
                    </p>
                )}
                <div className="cart-success-actions">
                    {receiptData && (
                        <button
                            className="receipt-download-btn"
                            onClick={handleDownload}
                            disabled={downloading}
                            aria-label="Download payment receipt as PDF"
                        >
                            {downloading ? 'Generating PDF…' : '⬇ Download Receipt (PDF)'}
                        </button>
                    )}
                    <Link to="/orders" className="cart-success-btn-orders">
                        📦 View My Orders
                    </Link>
                    <Link to="/" className="cart-success-btn-shop">
                        Continue Shopping
                    </Link>
                </div>
                {downloadErr && (
                    <p className="cart-err" role="alert">
                        {downloadErr}
                    </p>
                )}
            </div>
        );
    }

    const getAuthHeaders = () => {
        const token = sessionStorage.getItem('auth_token');
        return token ? { Authorization: `Bearer ${token}` } : {};
    };

    const handlePayment = async () => {
        if (!cartItems.length) return;
        setPaymentErr('');
        setProcessing(true);

        try {
            const loaded = await loadRazorpayScript();
            if (!loaded) throw new Error('Razorpay SDK failed to load. Check your connection.');

            const authOpts = { withCredentials: true, headers: getAuthHeaders() };

            // Step 1: Single checkout call — creates all bookings AND one combined
            // Razorpay order so the payment modal shows the correct total.
            const checkoutResp = await axios.post(
                `${urlConfig.ORDER_URL}/checkout`,
                {
                    items: cartItems.map((item) => ({
                        productId: item._id || item.id,
                        priceAtThatTime: parseFloat(item.price) || 0,
                        quantity: item.quantity || 1,
                    })),
                },
                authOpts
            );

            const {
                id: order_id,
                currency,
                amount: combinedAmount,
                bookingIds,
            } = checkoutResp.data;

            // Snapshot cart items BEFORE clearing (needed for receipt)
            const itemsSnapshot = cartItems.map((item) => ({ ...item }));

            // Step 2: Open Razorpay checkout
            await new Promise((resolve, reject) => {
                const options = {
                    key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                    amount: combinedAmount,
                    currency,
                    name: 'JBE Commerce',
                    description: `Order Payment (${cartItems.length} item${cartItems.length > 1 ? 's' : ''})`,
                    order_id,
                    handler: async (paymentResponse) => {
                        try {
                            // Step 3: Verify payment for all bookings
                            await axios.post(
                                `${urlConfig.ORDER_URL}/verify`,
                                {
                                    razorpay_order_id: paymentResponse.razorpay_order_id,
                                    razorpay_payment_id: paymentResponse.razorpay_payment_id,
                                    razorpay_signature: paymentResponse.razorpay_signature,
                                    bookingIds,
                                },
                                authOpts
                            );

                            // Build receipt data BEFORE clearing cart
                            const receipt = {
                                orderId: paymentResponse.razorpay_order_id,
                                paymentId: paymentResponse.razorpay_payment_id,
                                customerName: user?.user?.name || user?.name || 'Customer',
                                // Fix CR#2: mirror the same nested fallback used by customerName
                                customerEmail: user?.user?.email || user?.email || '',
                                items: itemsSnapshot,
                                totalAmount: combinedAmount / 100, // paise → rupees
                                date: new Date().toISOString(),
                            };

                            clearCart();
                            setReceiptData(receipt);
                            setSuccess(true);
                            resolve();
                        } catch (verifyErr) {
                            reject(
                                new Error(
                                    verifyErr.response?.data?.message ||
                                        'Payment verification failed'
                                )
                            );
                        }
                    },
                    modal: {
                        ondismiss: () => reject(new Error('__CANCELLED__')),
                    },
                    prefill: {
                        name: user?.name || '',
                        email: user?.email || '',
                    },
                    theme: { color: '#3d5a99' },
                };
                const rzp = new window.Razorpay(options);
                rzp.on('payment.failed', (failResp) => {
                    const reason = failResp?.error?.reason || '';
                    const isCancelled =
                        reason === 'payment_cancelled' ||
                        (failResp?.error?.description || '').toLowerCase().includes('cancel');
                    reject(
                        new Error(
                            isCancelled
                                ? '__CANCELLED__'
                                : failResp?.error?.description || 'Payment failed'
                        )
                    );
                });
                rzp.open();
            });
        } catch (err) {
            if (err.message !== '__CANCELLED__') {
                const msg =
                    err.response?.data?.message ||
                    err.message ||
                    'Payment failed. Please try again.';
                setPaymentErr(msg);
            }
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="cart-page">
            {cartItems.length === 0 ? (
                <div className="cart-empty">
                    <p>Your cart is empty.</p>
                </div>
            ) : (
                <>
                    <div className="cart-items-list">
                        {cartItems.map((item) => (
                            <CartItem key={item._id || item.id} cartData={item} />
                        ))}
                    </div>
                    <div className="cart-summary">
                        <p className="cart-total">
                            Net Total: <strong>Rs. {totalPrice.toFixed(2)}</strong>
                        </p>
                        {paymentErr && (
                            <p className="cart-err" role="alert">
                                {paymentErr}
                            </p>
                        )}
                        <button
                            className="cart-pay-btn"
                            onClick={handlePayment}
                            disabled={processing}
                        >
                            {processing ? 'Processing...' : 'Pay Now'}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

export default CartItems;
