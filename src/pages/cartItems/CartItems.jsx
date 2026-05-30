import React, { useState } from 'react';
import { useCart } from '../../context/cart/useCart';
import useAuth from '../../context/auth/useAuth';
import CartItem from '../../components/cartItem';
import './cartItems.css';
import urlConfig from '../../utils/urlConfig';
import axios from 'axios';

const loadRazorpayScript = () =>
    new Promise((resolve) => {
        if (document.querySelector('script[src*="razorpay"]')) return resolve(true);
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload  = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });

function CartItems() {
    const { cart, addToCart, removeFromCart } = useCart();
    const { user } = useAuth();
    const [paymentErr, setPaymentErr] = useState('');
    const [processing,  setProcessing]  = useState(false);
    const [success,     setSuccess]     = useState(false);

    const cartItems  = Object.values(cart || {});
    const totalPrice = cartItems.reduce(
        (sum, item) => sum + (parseFloat(item.price) || 0) * (item.quantity || 1), 0
    );

    if (!user) {
        return (
            <div className="cart-auth-msg">
                <p>Please <a href="/login">log in</a> to view your cart and checkout.</p>
            </div>
        );
    }

    if (success) {
        return (
            <div className="cart-success">
                <h2>&#10003; Payment Successful!</h2>
                <p>Thank you for your order. A confirmation email has been sent to you.</p>
            </div>
        );
    }

    const handlePayment = async () => {
        if (!cartItems.length) return;
        setPaymentErr('');
        setProcessing(true);

        try {
            const loaded = await loadRazorpayScript();
            if (!loaded) throw new Error('Razorpay SDK failed to load. Check your connection.');

            const firstItem = cartItems[0];
            const productId = firstItem._id || firstItem.id;
            const priceAtThatTime = parseFloat(firstItem.price) || 0;

            // Step 1: Create order on backend
            const resp = await axios.post(
                `${urlConfig.ORDR_URL}/${productId}`,
                { priceAtThatTime, quantity: firstItem.quantity || 1 },
                { withCredentials: true }
            );
            const { amount, currency, id: order_id, bookingId } = resp.data;

            // Step 2: Open Razorpay checkout
            await new Promise((resolve, reject) => {
                const options = {
                    key:         import.meta.env.VITE_RAZORPAY_KEY_ID,
                    amount,
                    currency,
                    name:        'JBE Commerce',
                    description: 'Order Payment',
                    order_id,
                    handler: async (paymentResponse) => {
                        try {
                            // Step 3: Verify payment with backend (sends email receipt too)
                            await axios.post(
                                `${urlConfig.ORDR_URL}/verify`,
                                {
                                    razorpay_order_id:   paymentResponse.razorpay_order_id,
                                    razorpay_payment_id: paymentResponse.razorpay_payment_id,
                                    razorpay_signature:  paymentResponse.razorpay_signature,
                                    bookingId,
                                },
                                { withCredentials: true }
                            );
                            setSuccess(true);
                            resolve();
                        } catch (verifyErr) {
                            reject(new Error(verifyErr.response?.data?.message || 'Payment verification failed'));
                        }
                    },
                    modal: {
                        ondismiss: () => reject(new Error('Payment cancelled')),
                    },
                    prefill: {
                        name:  user?.name  || '',
                        email: user?.email || '',
                    },
                    theme: { color: '#3d5a99' },
                };
                const rzp = new window.Razorpay(options);
                rzp.on('payment.failed', (resp) =>
                    reject(new Error(resp.error?.description || 'Payment failed'))
                );
                rzp.open();
            });
        } catch (err) {
            if (err.message !== 'Payment cancelled') {
                const msg = err.response?.data?.message || err.message || 'Payment failed. Please try again.';
                setPaymentErr(msg);
            }
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="cart-page">
            {cartItems.length === 0 ? (
                <div className="cart-empty"><p>Your cart is empty.</p></div>
            ) : (
                <>
                    <div className="cart-items-list">
                        {cartItems.map(item => (
                            <CartItem key={item._id || item.id} cartData={item} />
                        ))}
                    </div>
                    <div className="cart-summary">
                        <p className="cart-total">Net Total: <strong>Rs. {totalPrice.toFixed(2)}</strong></p>
                        {paymentErr && <p className="cart-err" role="alert">{paymentErr}</p>}
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
