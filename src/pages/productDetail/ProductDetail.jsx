import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import useFetchData from '../../hooks/useFetchData';
import urlConfig from '../../utils/urlConfig';
import { useCart } from '../../context/cart/useCart';
import useAuth from '../../context/auth/useAuth';
import Loader from '../../components/loader';
import './productDetail.css';

function StarRating({ value, interactive = false, onChange }) {
    const [hover, setHover] = useState(0);
    return (
        <span
            className="star-row"
            aria-label={interactive ? 'Choose a rating' : `${value} out of 5 stars`}
        >
            {[1, 2, 3, 4, 5].map((s) => (
                <span
                    key={s}
                    className={`star ${s <= (interactive ? hover || value : value) ? 'filled' : ''} ${interactive ? 'interactive' : ''}`}
                    onMouseEnter={() => interactive && setHover(s)}
                    onMouseLeave={() => interactive && setHover(0)}
                    onClick={() => interactive && onChange && onChange(s)}
                    role={interactive ? 'button' : undefined}
                    tabIndex={interactive ? 0 : undefined}
                    onKeyDown={(e) => interactive && e.key === 'Enter' && onChange && onChange(s)}
                    aria-label={interactive ? `${s} star${s > 1 ? 's' : ''}` : undefined}
                >
                    ★
                </span>
            ))}
        </span>
    );
}

function ReviewForm({ productId, onPosted }) {
    const [rating, setRating] = useState(0);
    const [review, setReview] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [err, setErr] = useState('');

    const token = sessionStorage.getItem('auth_token');
    const authOpts = {
        withCredentials: true,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!rating) {
            setErr('Please select a star rating.');
            return;
        }
        if (!review.trim()) {
            setErr('Please write a review.');
            return;
        }
        setErr('');
        setSubmitting(true);
        try {
            await axios.post(`${urlConfig.REVIEW_URL}/${productId}`, { rating, review }, authOpts);
            setRating(0);
            setReview('');
            onPosted();
        } catch (e) {
            setErr(e.response?.data?.message || 'Could not submit review.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form className="review-form" onSubmit={handleSubmit}>
            <h3 className="review-form-title">Write a Review</h3>
            <div className="review-form-rating">
                <span>Your rating:</span>
                <StarRating value={rating} interactive onChange={setRating} />
                {rating > 0 && (
                    <span className="rating-label">
                        {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
                    </span>
                )}
            </div>
            <textarea
                className="review-textarea"
                placeholder="Share your experience with this product…"
                value={review}
                onChange={(e) => setReview(e.target.value)}
                rows={4}
                maxLength={1000}
                aria-label="Review text"
            />
            {err && (
                <p className="review-err" role="alert">
                    {err}
                </p>
            )}
            <button type="submit" className="review-submit-btn" disabled={submitting}>
                {submitting ? 'Submitting…' : 'Submit Review'}
            </button>
        </form>
    );
}

export default function ProductDetail() {
    const { productId } = useParams();
    const { user } = useAuth();
    const { addToCart } = useCart();
    const [reviewPage, setReviewPage] = useState(1);
    const [reviewRefresh, setReviewRefresh] = useState(0);
    const [addedMsg, setAddedMsg] = useState('');

    const {
        data: productData,
        isLoading: pLoading,
        error: pError,
    } = useFetchData(`${urlConfig.ALL_PRODUCT_URL}/${productId}`, { data: null });
    const { data: reviewData, isLoading: rLoading } = useFetchData(
        `${urlConfig.REVIEW_URL}/${productId}?page=${reviewPage}&limit=5&_r=${reviewRefresh}`,
        { data: [], total: 0, totalPages: 1 }
    );

    const product = productData?.data || productData?.message;
    const reviews = reviewData?.data || [];
    const totalPages = reviewData?.totalPages || 1;
    const totalReviews = reviewData?.total || 0;

    const handleAddToCart = () => {
        if (!product) return;
        addToCart({
            _id: product._id,
            id: product._id,
            title: product.name,
            name: product.name,
            price: product.price,
            image: product.productImages?.[0] || '',
        });
        setAddedMsg('Added to cart!');
        setTimeout(() => setAddedMsg(''), 2000);
    };

    if (pLoading)
        return (
            <div className="pd-page container">
                <Loader />
            </div>
        );
    if (pError || !product)
        return (
            <div className="pd-page container">
                <div className="pd-error">
                    <p>Product not found.</p>
                    <Link to="/" className="pd-back">
                        ← Browse Products
                    </Link>
                </div>
            </div>
        );

    const image = product.productImages?.[0] || 'https://placehold.co/400x400?text=No+Image';

    return (
        <div className="pd-page container">
            <Link to="/" className="pd-back">
                ← Back to Products
            </Link>

            <div className="pd-main">
                {/* Product info */}
                <div className="pd-image-col">
                    <img
                        src={image}
                        alt={product.name}
                        className="pd-image"
                        onError={(e) => {
                            e.target.src = 'https://placehold.co/400x400?text=No+Image';
                        }}
                    />
                    {product.productImages?.length > 1 && (
                        <div className="pd-thumbnails">
                            {product.productImages.map((img, i) => (
                                <img
                                    key={i}
                                    src={img}
                                    alt={`${product.name} view ${i + 1}`}
                                    className="pd-thumb"
                                    onError={(e) => {
                                        e.target.src = 'https://placehold.co/64x64?text=?';
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </div>

                <div className="pd-info-col">
                    <h1 className="pd-name">{product.name}</h1>
                    <p className="pd-brand">{product.brand}</p>

                    {product.averageRating > 0 && (
                        <div className="pd-rating-row">
                            <StarRating value={Math.round(product.averageRating)} />
                            <span className="pd-rating-num">
                                {Number(product.averageRating).toFixed(1)}
                            </span>
                            <span className="pd-review-count">
                                ({totalReviews} review{totalReviews !== 1 ? 's' : ''})
                            </span>
                        </div>
                    )}

                    <p className="pd-price">₹{product.price}</p>
                    {product.discount > 0 && <p className="pd-discount">{product.discount}% off</p>}

                    <p className="pd-stock">
                        {Number(product.stock_quantity) > 0 ? (
                            <span className="in-stock">
                                In Stock ({product.stock_quantity} left)
                            </span>
                        ) : (
                            <span className="out-stock">Out of Stock</span>
                        )}
                    </p>

                    <p className="pd-description">{product.description}</p>

                    {addedMsg && (
                        <p className="pd-added-msg" role="status">
                            {addedMsg}
                        </p>
                    )}

                    <button
                        className="pd-add-btn"
                        onClick={handleAddToCart}
                        disabled={Number(product.stock_quantity) <= 0}
                    >
                        🛒 Add to Cart
                    </button>
                </div>
            </div>

            {/* Reviews section */}
            <section className="pd-reviews">
                <h2 className="pd-reviews-title">Customer Reviews ({totalReviews})</h2>

                {user ? (
                    <ReviewForm
                        productId={productId}
                        onPosted={() => {
                            setReviewRefresh((r) => r + 1);
                            setReviewPage(1);
                        }}
                    />
                ) : (
                    <p className="review-login-prompt">
                        <Link to="/login">Log in</Link> to write a review.
                    </p>
                )}

                {rLoading ? (
                    <Loader />
                ) : (
                    <>
                        {reviews.length === 0 ? (
                            <p className="no-reviews">
                                No reviews yet. Be the first to review this product!
                            </p>
                        ) : (
                            <div className="review-list">
                                {reviews.map((r) => (
                                    <div key={r._id} className="review-card">
                                        <div className="review-header">
                                            <span className="review-author">
                                                {r.user?.name || 'Anonymous'}
                                            </span>
                                            <StarRating value={r.rating} />
                                            <span className="review-date">
                                                {new Date(r.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="review-text">{r.review}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {totalPages > 1 && (
                            <div className="review-pagination">
                                <button
                                    onClick={() => setReviewPage((p) => Math.max(1, p - 1))}
                                    disabled={reviewPage === 1}
                                    className="rev-page-btn"
                                >
                                    ‹
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                    <button
                                        key={p}
                                        className={`rev-page-btn ${reviewPage === p ? 'active' : ''}`}
                                        onClick={() => setReviewPage(p)}
                                    >
                                        {p}
                                    </button>
                                ))}
                                <button
                                    onClick={() =>
                                        setReviewPage((p) => Math.min(totalPages, p + 1))
                                    }
                                    disabled={reviewPage === totalPages}
                                    className="rev-page-btn"
                                >
                                    ›
                                </button>
                            </div>
                        )}
                    </>
                )}
            </section>
        </div>
    );
}
