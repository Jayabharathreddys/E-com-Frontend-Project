import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from '../components/header/Header';
import Loader from '../components/loader';
import RequireAuth from '../components/requireAuth/RequireAuth';
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
const ForgotPassword = lazy(() => import('../pages/forgotPassword/ForgotPassword'));
const ResetPassword = lazy(() => import('../pages/resetPassword/ResetPassword'));
const Unauthorized = lazy(() => import('../pages/unauthorized/Unauthorized'));
const NotFound = lazy(() => import('../pages/notFound/NotFound'));

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
                    <Route path="/unauthorized" element={<Unauthorized />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password/:userId" element={<ResetPassword />} />
                    <Route path="/signin" element={<Navigate to="/login" replace />} />

                    <Route element={<RequireAuth />}>
                        <Route path="/cart" element={<CartItems />} />
                        <Route path="/orders" element={<Orders />} />
                        <Route path="/orders/:orderId" element={<OrderDetail />} />
                    </Route>

                    <Route path="*" element={<NotFound />} />
                </Routes>
            </Suspense>
        </Router>
    );
};

export default AppRoutes;
