import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from '../components/header/Header';
import NotFound from '../pages/notFound/NotFound';
import Unauthorized from '../pages/unauthorized/Unauthorized';
import useFetchData from '../hooks/useFetchData';
import ProductListing from '../pages/productListing/ProductListing';
import CartItems from '../pages/cartItems/CartItems';
import Signup from '../pages/signup/Signup';
import Login from '../pages/login/Login';
import RequireAuth from '../components/requireAuth/RequireAuth';
import ForgotPassword from '../pages/forgotPassword/ForgotPassword';
import ResetPassword from '../pages/resetPassword/ResetPassword';
import urlConfig from '../utils/urlConfig';

const AppRoutes = () => {
    const { data: categories, isLoading } = useFetchData(urlConfig.CATEGORIES_URL, []);

    return (
        <Router>
            <Header categories={categories?.data || categories || []} isLoading={isLoading} />
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
                </Route>

                <Route path="*" element={<NotFound />} />
            </Routes>
        </Router>
    );
};

export default AppRoutes;
