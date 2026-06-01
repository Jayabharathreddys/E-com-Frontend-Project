import './signup.css';
import { useState } from 'react';
import axios from 'axios';
import urlConfig from '../../utils/urlConfig.js';
import { Link, useNavigate } from 'react-router-dom';

function Signup() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [serverErr, setServerErr] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const validate = () => {
        const newErrors = {};
        if (!name.trim()) newErrors.name = 'Name is required';
        if (!email.trim()) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Enter a valid email';
        if (!password) newErrors.password = 'Password is required';
        else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
        if (!confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
        else if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
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
            const resp = await axios.post(urlConfig.SIGNUP_URL, {
                name,
                email,
                password,
                confirmPassword,
            });
            if (resp.data) {
                navigate('/login', { state: { message: 'Account created! Please sign in.' } });
            }
        } catch (err) {
            const msg = err.response?.data?.message || 'Registration failed. Please try again.';
            setServerErr(msg);
        } finally {
            setLoading(false);
        }
    };

    if (loading)
        return (
            <div className="auth-loading">
                <p>Creating your account...</p>
            </div>
        );

    return (
        <div className="signupscreen">
            <div className="container">
                <div className="innerContainer">
                    <p>Sign Up</p>

                    {serverErr && (
                        <div className="errContainer" role="alert">
                            {serverErr}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} noValidate>
                        <label htmlFor="name">Name</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            placeholder="Your name.."
                            value={name}
                            onChange={(e) => {
                                setName(e.target.value);
                                setErrors((p) => ({ ...p, name: '' }));
                            }}
                        />
                        {errors.name && (
                            <span className="field-error" role="alert">
                                {errors.name}
                            </span>
                        )}

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
                        />
                        {errors.email && (
                            <span className="field-error" role="alert">
                                {errors.email}
                            </span>
                        )}

                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            placeholder="Min 6 characters.."
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                setErrors((p) => ({ ...p, password: '' }));
                            }}
                        />
                        {errors.password && (
                            <span className="field-error" role="alert">
                                {errors.password}
                            </span>
                        )}

                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            placeholder="Repeat password.."
                            value={confirmPassword}
                            onChange={(e) => {
                                setConfirmPassword(e.target.value);
                                setErrors((p) => ({ ...p, confirmPassword: '' }));
                            }}
                        />
                        {errors.confirmPassword && (
                            <span className="field-error" role="alert">
                                {errors.confirmPassword}
                            </span>
                        )}

                        <Link to="/login" className="link">
                            <span>Already have an account?</span>
                        </Link>
                        <br />
                        <input type="submit" value="Sign Up" />
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Signup;
