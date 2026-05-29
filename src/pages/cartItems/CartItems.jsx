import { useState } from "react";
import CartItem from "../../components/cartItem/CartItem";
import { useCart } from "../../context/cart/useCart";
import axios from "axios";
import urlConfig from "../../utils/urlConfig";
import useAuth from "../../context/auth/useAuth";

import './cartItems.css';

// Load Razorpay checkout.js script dynamically
const loadRazorpayScript = () => {
    return new Promise((resolve, reject) => {
        if (document.querySelector('script[src*="checkout.razorpay.com"]')) {
            resolve(); // already loaded
            return;
        }
        const script = document.createElement('script');
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = resolve;
        script.onerror = reject;
        document.body.appendChild(script);
    });
};

const CartItems = () => {
    const { cart, totalQuantity } = useCart();
    const { user } = useAuth();
    const [paymentStatus, setPaymentStatus] = useState(''); // '', 'loading', 'success', 'error'
    const [errorMsg, setErrorMsg] = useState('');

    const netTotalPrice = Object.values(cart).reduce(
        (total, item) => total + item.price * item.quantity,
        0
    );

    const handlePayment = async () => {
        if (!user || !user.status) {
            setErrorMsg('Please login to proceed with payment');
            setTimeout(() => setErrorMsg(''), 3000);
            return;
        }

        if (Object.keys(cart).length === 0) {
            setErrorMsg('Your cart is empty');
            return;
        }

        try {
            setPaymentStatus('loading');

            // Load Razorpay script
            await loadRazorpayScript();

            // Create booking for the first item to get a Razorpay order
            // (In a full implementation, you'd create a single order for the whole cart total)
            const firstItem = Object.values(cart)[0];

            const resp = await axios.post(
                `${urlConfig.ORDR_URL}/${firstItem.id}`,
                { priceAtThatTime: Math.round(netTotalPrice) },
                { withCredentials: true }
            );

            const { id, currency, amount } = resp.data.data;

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: amount.toString(),
                currency: currency,
                name: "JB E-Commerce",
                description: `Order for ${Object.keys(cart).length} item(s)`,
                image: "https://via.placeholder.com/150",
                order_id: id,
                handler: function (response) {
                    console.log('Payment success:', response);
                    setPaymentStatus('success');
                },
                prefill: {
                    name: user?.name || '',
                    email: user?.email || '',
                },
                theme: {
                    color: "#2320CC"
                },
                modal: {
                    ondismiss: function () {
                        setPaymentStatus('');
                    }
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response) {
                console.error('Payment failed:', response.error);
                setPaymentStatus('error');
                setErrorMsg(`Payment failed: ${response.error.description}`);
            });
            rzp.open();
            setPaymentStatus('');

        } catch (err) {
            console.error('Payment error:', err);
            setPaymentStatus('error');
            setErrorMsg(err.response?.data?.message || 'Payment initiation failed. Please try again.');
            setTimeout(() => { setPaymentStatus(''); setErrorMsg(''); }, 4000);
        }
    };

    if (paymentStatus === 'success') {
        return (
            <div className="payment-success">
                <h2>🎉 Payment Successful!</h2>
                <p>Your order has been placed successfully.</p>
            </div>
        );
    }

    return (
        <>
            <h2 className="cart-items-heading">Your Cart Items</h2>

            {Object.keys(cart).length === 0 ? (
                <p className="empty-cart">Your cart is empty.</p>
            ) : (
                <>
                    <ul className="cart-items">
                        {Object.values(cart).map((item, index) => (
                            <CartItem key={`cart-item-${index}`} cartData={item} />
                        ))}
                    </ul>

                    <div className="cart-net-total">
                        <p className="cart-net-total-label">Net Total</p>
                        <p className="cart-net-total-price">${netTotalPrice.toFixed(2)}</p>
                    </div>

                    {errorMsg && (
                        <div className="payment-error-msg">{errorMsg}</div>
                    )}

                    <div className="pay-now-container">
                        <button
                            className="pay-now-btn"
                            onClick={handlePayment}
                            disabled={paymentStatus === 'loading'}
                        >
                            {paymentStatus === 'loading' ? 'Processing...' : `Pay Now ₹${Math.round(netTotalPrice)}`}
                        </button>
                    </div>
                </>
            )}
        </>
    );
};

export default CartItems;
