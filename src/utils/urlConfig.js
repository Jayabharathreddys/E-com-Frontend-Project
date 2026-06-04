const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:3001';

const urlConfig = {
    // Categories come directly from fakestoreapi (plain array response)
    CATEGORIES_URL: 'https://fakestoreapi.com/products/categories',
    // Auth
    LOGIN_URL: BASE_URL + '/api/auth/login',
    LOGOUT_URL: BASE_URL + '/api/auth/logout',
    SIGNUP_URL: BASE_URL + '/api/auth/signup',
    VERIFY_EMAIL_URL: BASE_URL + '/api/auth/verify-email',
    RESEND_OTP_URL: BASE_URL + '/api/auth/resend-otp',
    FORGOT_PASSWORD_URL: BASE_URL + '/api/auth/forgetpassword',
    RESET_PASSWORD_URL: BASE_URL + '/api/auth/resetPassword',
    // Products
    ALL_PRODUCT_URL: BASE_URL + '/api/product',
    // Bookings
    ORDER_URL: BASE_URL + '/api/booking',
    MY_ORDERS_URL: BASE_URL + '/api/booking/my-orders',
    ORDER_DETAIL_URL: BASE_URL + '/api/booking/detail',
    ORDER_BY_PAYMENT_ORDER_URL: BASE_URL + '/api/booking/by-payment-order',
    // Reviews
    REVIEW_URL: BASE_URL + '/api/review',
    // Admin
    ADMIN_ORDERS_URL: BASE_URL + '/api/booking',
    ADMIN_USERS_URL: BASE_URL + '/api/user',
    ADMIN_REVIEWS_URL: BASE_URL + '/api/review',
};

export default urlConfig;
