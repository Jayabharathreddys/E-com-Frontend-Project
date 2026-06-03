import { useState } from 'react';
import AuthContext from './AuthContext';

const TOKEN_TTL_SESSION = 24 * 60 * 60 * 1000; // 1 day  (session-only)
const TOKEN_TTL_PERSIST = 30 * 24 * 60 * 60 * 1000; // 30 days (remember me)

/**
 * Read auth state from storage on mount.
 * Checks localStorage first (remember-me), then sessionStorage (tab-only).
 * Clears and returns null if the stored token has expired.
 */
const loadUser = () => {
    try {
        for (const storage of [localStorage, sessionStorage]) {
            const stored = storage.getItem('auth_user');
            if (!stored) continue;
            const parsed = JSON.parse(stored);
            if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
                storage.removeItem('auth_user');
                storage.removeItem('auth_token');
                continue;
            }
            return parsed;
        }
        return null;
    } catch {
        return null;
    }
};

// AuthProvider is the named export used throughout the app.
// AuthContext is the default export for useAuth to import directly.
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(loadUser);

    /**
     * Persist auth data after a successful login.
     * @param {object} userData  - full API login response
     * @param {boolean} rememberMe - true → localStorage (persists across sessions),
     *                               false → sessionStorage (cleared when tab closes)
     */
    const setAuth = (userData, rememberMe = false) => {
        if (userData) {
            const ttl = rememberMe ? TOKEN_TTL_PERSIST : TOKEN_TTL_SESSION;
            const dataWithExpiry = { ...userData, expiresAt: Date.now() + ttl };
            const target = rememberMe ? localStorage : sessionStorage;
            const other = rememberMe ? sessionStorage : localStorage;
            other.removeItem('auth_user');
            target.setItem('auth_user', JSON.stringify(dataWithExpiry));
        } else {
            localStorage.removeItem('auth_user');
            sessionStorage.removeItem('auth_user');
        }
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('auth_user');
        localStorage.removeItem('auth_token');
        sessionStorage.removeItem('auth_user');
        sessionStorage.removeItem('auth_token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, setAuth, logout }}>{children}</AuthContext.Provider>
    );
};

export default AuthContext;
