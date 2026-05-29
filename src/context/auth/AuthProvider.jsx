import { useState } from "react";
import AuthContext from "./AuthContext";

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        try {
            const stored = sessionStorage.getItem('auth_user');
            return stored ? JSON.parse(stored) : null;
        } catch { return null; }
    });

    const setAuth = (userData) => {
        if (userData) sessionStorage.setItem('auth_user', JSON.stringify(userData));
        else sessionStorage.removeItem('auth_user');
        setUser(userData);
    };

    const logout = () => {
        sessionStorage.removeItem('auth_user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, setAuth, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
