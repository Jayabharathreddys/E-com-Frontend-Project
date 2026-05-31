import {useState} from 'react';
import CartContext from './CartContext';
const ContextProvider = ({children}) => {

    const [cartState, setCartState ] = useState({});

    const [totalQuantity, setTotalQuantity] = useState(0);

    const addToCart = (product) => {
        setCartState(prev => {
            const updatedCart = { ...prev };
            if (updatedCart[product.id]) {
                updatedCart[product.id] = {
                    ...updatedCart[product.id],
                    quantity: updatedCart[product.id].quantity + 1,
                };
            } else {
                updatedCart[product.id] = { ...product, quantity: 1 };
            }
            return updatedCart;
        });
        // Use functional update to avoid stale-closure bug on rapid clicks
        setTotalQuantity(prev => prev + 1);
    }

    const removeFromCart = (productId) => {
        // Guard: do nothing if product is not in cart
        if (!cartState[productId]) return;

        setCartState(prev => {
            if (!prev[productId]) return prev;         // double guard for async safety
            const updatedCart = { ...prev };
            const newQty = updatedCart[productId].quantity - 1;
            if (newQty <= 0) {
                delete updatedCart[productId];
            } else {
                updatedCart[productId] = { ...updatedCart[productId], quantity: newQty };
            }
            return updatedCart;
        });
        // Use functional update to avoid stale-closure bug on rapid clicks
        setTotalQuantity(prev => prev - 1);
    }

    const clearCart = () => {
        setCartState({});
        setTotalQuantity(0);
    };

    const cartContextValue = {
        cart: cartState,
        totalQuantity,
        addToCart,
        removeFromCart,
        clearCart
    };

    return (


        <CartContext.Provider value={cartContextValue}>
            {children}
        </CartContext.Provider>

    )
}

export { ContextProvider as CartProvider };   // named export for tests
export default ContextProvider;