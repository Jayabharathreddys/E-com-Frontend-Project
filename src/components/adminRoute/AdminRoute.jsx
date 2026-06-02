import { Navigate, Outlet } from 'react-router-dom';
import useAuth from '../../context/auth/useAuth';

/**
 * AdminRoute — allows access only to users whose role is 'admin'.
 * Unauthenticated users → /login
 * Authenticated non-admins → /unauthorized
 */
export default function AdminRoute() {
    const { user } = useAuth();

    if (!user) return <Navigate to="/login" replace />;

    const role = user?.user?.role || user?.role;
    if (role !== 'admin') return <Navigate to="/unauthorized" replace />;

    return <Outlet />;
}
