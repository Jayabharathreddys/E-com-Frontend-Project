const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:3001';

const urlConfig = {
    // Categories come directly from fakestoreapi (plain array response)
    // Using own backend /api/product/categories caused failures in production
    CATEGORIES_URL: 'https://fakestoreapi.com/products/categories',
    LOGIN_URL:      BASE_URL + '/api/auth/login',
    SIGNUP_URL:     BASE_URL + '/api/auth/signup',
    ALL_PRODUCT_URL: BASE_URL + '/api/product',
    ORDR_URL:       BASE_URL + '/api/booking',
};

export default urlConfig;
