import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from '../components/header/Header';
import Loader from '../components/loader';
import RequireAuth from '../components/requireAuth/RequireAuth';
import AdminRoute from '../components/adminRoute/AdminRoute';
import useFetchData from '../hooks/useFetchData';
import urlConfig from '../utils/urlConfig';

// Eagerly load critical above-the-fold pages
import ProductListing from '../pages/productListing/ProductListing';
import Login from '../pages/login/Login';
import Signup from '../pages/signup/Signup';

// Lazy-load the rest — reduces initial bundle size
const CartItems = lazy(() => import('../pages/cartItems/CartItems'));
const Orders = lazy(() => import('../pages/orders/Orders'));
const OrderDetail = lazy(() => import('../pages/orderDetail/OrderDetail'));
const ProductDetail = lazy(() => import('../pages/productDetail/ProductDetail'));
const VerifyEmail = lazy(() => import('../pages/verifyEmail/VerifyEmail'));
const ForgotPassword = lazy(() => import('../pages/forgotPassword/ForgotPassword'));
const ResetPassword = lazy(() => import('../pages/resetPassword/ResetPassword'));
const Unauthorized = lazy(() => import('../pages/unauthorized/Unauthorized'));
const NotFound = lazy(() => import('../pages/notFound/NotFound'));
const ComingSoon = lazy(() => import('../pages/comingSoon/ComingSoon'));
// Admin pages
const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard'));
const AdminOrders = lazy(() => import('../pages/admin/AdminOrders'));
const AdminProducts = lazy(() => import('../pages/admin/AdminProducts'));
const AdminUsers = lazy(() => import('../pages/admin/AdminUsers'));
const AdminReviews = lazy(() => import('../pages/admin/AdminReviews'));

const AppRoutes = () => {
    const { data: categories, isLoading } = useFetchData(urlConfig.CATEGORIES_URL, []);

    return (
        <Router>
            <Header categories={categories?.data || categories || []} isLoading={isLoading} />
            <Suspense fallback={<Loader />}>
                <Routes>
                    <Route path="/" element={<ProductListing />} />
                    <Route path="/products/:categoryName" element={<ProductListing />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/verify-email/:userId" element={<VerifyEmail />} />
                    <Route path="/unauthorized" element={<Unauthorized />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password/:userId" element={<ResetPassword />} />
                    <Route path="/products/:categoryName/:productId" element={<ProductDetail />} />
                    <Route path="/product/:productId" element={<ProductDetail />} />
                    <Route path="/signin" element={<Navigate to="/login" replace />} />

                    <Route element={<RequireAuth />}>
                        <Route path="/cart" element={<CartItems />} />
                        <Route path="/orders" element={<Orders />} />
                        <Route path="/orders/:orderId" element={<OrderDetail />} />
                        {/* Stub routes for features under development */}
                        <Route path="/wishlist" element={<ComingSoon />} />
                        <Route path="/dashboard" element={<ComingSoon />} />
                        <Route path="/addresses" element={<ComingSoon />} />
                        <Route path="/profile" element={<ComingSoon />} />
                    </Route>

                    {/* Admin-only routes */}
                    <Route element={<AdminRoute />}>
                        <Route path="/admin" element={<AdminDashboard />} />
                        <Route path="/admin/orders" element={<AdminOrders />} />
                        <Route path="/admin/products" element={<AdminProducts />} />
                        <Route path="/admin/users" element={<AdminUsers />} />
                        <Route path="/admin/reviews" element={<AdminReviews />} />
                    </Route>

                    <Route path="*" element={<NotFound />} />
                </Routes>
            </Suspense>
        </Router>
    );
};

export default AppRoutes;
