import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './login.css';
import urlConfig from '../../utils/urlConfig.js';
import axios from 'axios';
import useAuth from '../../context/auth/useAuth.js';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [serverErr, setServerErr] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();
    const { setAuth } = useAuth();

    const from = location.state?.from?.pathname || '/';

    // Capture once on mount — read initial state before it can be cleared
    const [successMsg] = useState(() => location.state?.message || null);

    // Clear the route state so the banner doesn't reappear on back-navigation
    useEffect(() => {
        if (!successMsg) return;
        const remaining = { ...(location.state || {}) };
        delete remaining.message;
        navigate(location.pathname, {
            replace: true,
            state: Object.keys(remaining).length ? remaining : null,
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const validate = () => {
        const newErrors = {};
        if (!email.trim()) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Enter a valid email';
        if (!password) newErrors.password = 'Password is required';
        else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        setErrors({});
        setServerErr('');
        try {
            setLoading(true);
            const resp = await axios.post(
                urlConfig.LOGIN_URL,
                { email, password },
                { withCredentials: true }
            );
            const data = resp.data;
            if (data.status === 'success') {
                if (data.token) {
                    sessionStorage.setItem('auth_token', data.token);
                }
                setAuth(data);
                navigate(from, { replace: true });
            }
        } catch (err) {
            // 403 unverified — redirect to verify-email page
            if (err.response?.data?.status === 'unverified' && err.response?.data?.userId) {
                navigate(`/verify-email/${err.response.data.userId}`);
                return;
            }
            const msg =
                err.response?.data?.message || 'Login failed. Please check your credentials.';
            setServerErr(msg);
        } finally {
            setLoading(false);
        }
    };

    if (loading)
        return (
            <div className="auth-loading">
                <p>Signing you in...</p>
            </div>
        );

    return (
        <div className="signinscreen">
            <div className="container">
                <div className="innerContainer">
                    <p>Login</p>

                    {successMsg && (
                        <div
                            className="successContainer"
                            role="status"
                            style={{
                                background: '#e6f4ea',
                                color: '#2d7a3a',
                                padding: '1rem 1.4rem',
                                borderRadius: '8px',
                                marginBottom: '1.2rem',
                                fontSize: '1.3rem',
                                fontWeight: 600,
                            }}
                        >
                            {successMsg}
                        </div>
                    )}

                    {serverErr && (
                        <div className="errContainer" role="alert">
                            {serverErr}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} noValidate>
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            placeholder="Your email.."
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                setErrors((p) => ({ ...p, email: '' }));
                            }}
                            aria-describedby="email-error"
                        />
                        {errors.email && (
                            <span className="field-error" id="email-error" role="alert">
                                {errors.email}
                            </span>
                        )}

                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            placeholder="Your Password.."
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                setErrors((p) => ({ ...p, password: '' }));
                            }}
                            aria-describedby="password-error"
                        />
                        {errors.password && (
                            <span className="field-error" id="password-error" role="alert">
                                {errors.password}
                            </span>
                        )}

                        <div className="auth-links">
                            <Link to="/signup" className="link">
                                Create a new account?
                            </Link>
                            <Link to="/forgot-password" className="link forgot-link">
                                Forgot password?
                            </Link>
                        </div>
                        <br />
                        <input type="submit" value="Login" />
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Login;
