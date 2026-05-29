import AddToCart from "../addToCart/AddToCart";
import './product.css';

const StarRating = ({ rating }) => {
    if (!rating) return null;
    const full  = Math.floor(rating);
    const half  = rating - full >= 0.5;
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
        <img
            className="product-image"
            src={product.image}
            alt={product.title}
            onError={e => { e.target.src = 'https://via.placeholder.com/150?text=No+Image'; }}
        />
        <div className="product-details">
            <div className="product-title" title={product.title}>{product.title}</div>
            <StarRating rating={product.averageRating} />
            <div className="buy-item">
                <div className="product-price">Rs. {Number(product.price).toFixed(2)}</div>
                <AddToCart product={product} />
            </div>
        </div>
    </div>
);

export default Product;
