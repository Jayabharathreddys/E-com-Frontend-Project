import { useState } from 'react';
import AuthContext from './AuthContext';

// AuthProvider is the named export used throughout the app.
// AuthContext is the default export for useAuth to import directly.
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        try {
            const stored = sessionStorage.getItem('auth_user');
            return stored ? JSON.parse(stored) : null;
        } catch {
            return null;
        }
    });

    const setAuth = (userData) => {
        if (userData) sessionStorage.setItem('auth_user', JSON.stringify(userData));
        else sessionStorage.removeItem('auth_user');
        setUser(userData);
    };

    const logout = () => {
        sessionStorage.removeItem('auth_user');
        sessionStorage.removeItem('auth_token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, setAuth, logout }}>{children}</AuthContext.Provider>
    );
};

export default AuthContext;
