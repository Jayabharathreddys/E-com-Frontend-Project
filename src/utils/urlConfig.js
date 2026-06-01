const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:3001';

const urlConfig = {
    // Categories come directly from fakestoreapi (plain array response)
    // Using own backend /api/product/categories caused failures in production
    CATEGORIES_URL: 'https://fakestoreapi.com/products/categories',
    LOGIN_URL: BASE_URL + '/api/auth/login',
    LOGOUT_URL: BASE_URL + '/api/auth/logout',
    SIGNUP_URL: BASE_URL + '/api/auth/signup',
    ALL_PRODUCT_URL: BASE_URL + '/api/product',
    ORDER_URL: BASE_URL + '/api/booking',
    FORGOT_PASSWORD_URL: BASE_URL + '/api/auth/forgetpassword',
    RESET_PASSWORD_URL: BASE_URL + '/api/auth/resetPassword',
};

export default urlConfig;
