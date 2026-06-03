import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuth from '../../context/auth/useAuth';

/**
 * AdminRoute — allows access only to users whose role is 'admin'.
 * Unauthenticated users → /login (with `from` state so login can redirect back)
 * Authenticated non-admins → /unauthorized
 */
export default function AdminRoute() {
    const { user } = useAuth();
    const location = useLocation();

    if (!user) return <Navigate to="/login" state={{ from: location }} replace />;

    const role = user?.user?.role || user?.role;
    if (role !== 'admin') return <Navigate to="/unauthorized" replace />;

    return <Outlet />;
}
