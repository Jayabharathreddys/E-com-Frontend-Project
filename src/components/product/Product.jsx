import { Link } from 'react-router-dom';
import AddToCart from '../addToCart/AddToCart';
import './product.css';

const StarRating = ({ rating }) => {
    if (!rating) return null;
    const full = Math.floor(rating);
    const half = rating - full >= 0.5;
    const empty = 5 - full - (half ? 1 : 0);
    return (
        <div className="product-stars" aria-label={`Rating: ${rating.toFixed(1)} out of 5`}>
            {'\u2605'.repeat(full)}
            {half ? '\u00BD' : ''}
            {'\u2606'.repeat(empty)}
            <span className="product-rating-number"> {rating.toFixed(1)}</span>
        </div>
    );
};

const Product = ({ product }) => (
    <div className="product-item">
        <Link to={`/product/${product.id || product._id}`} className="product-image-link">
            <img
                className="product-image"
                src={product.image}
                alt={product.title}
                onError={(e) => {
                    e.target.src = 'https://placehold.co/150x150?text=No+Image';
                }}
            />
        </Link>
        <div className="product-details">
            <Link
                to={`/product/${product.id || product._id}`}
                className="product-title"
                title={product.title}
            >
                {product.title}
            </Link>
            <StarRating rating={product.averageRating} />
            <div className="buy-item">
                <div className="product-price">Rs. {Number(product.price).toFixed(2)}</div>
                <AddToCart product={product} />
            </div>
            <Link
                to={`/product/${product.id || product._id}`}
                className="product-view-btn"
                aria-label={`View details for ${product.title}`}
            >
                View Details →
            </Link>
        </div>
    </div>
);

export default Product;
