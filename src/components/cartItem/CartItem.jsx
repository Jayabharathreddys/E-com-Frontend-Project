import './cartItem.css';

const CartItem = ({ cartData }) => {
    const { id, title, price, quantity, image } = cartData;
    const totalPrice = price * quantity;

    return (
        <div className="cart-item">
            <div className="cart-item-details">
                <div className="cart-item-image">
                    <img
                        src={image}
                        alt={title}
                        onError={e => { e.target.src = 'https://via.placeholder.com/80?text=No+Image'; }}
                    />
                </div>
                <div className="cart-item-info">
                    <h3 className="cart-item-name">{title}</h3>
                    <p className="cart-item-price">Rs. {price.toFixed(2)}</p>
                </div>
            </div>
            <span className="cart-item-quantity">{quantity}</span>
            <div className="cart-item-total">
                <p className="cart-item-total-price">Rs. {totalPrice.toFixed(2)}</p>
            </div>
        </div>
    );
};

export default CartItem;
