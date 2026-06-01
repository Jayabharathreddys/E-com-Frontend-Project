import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import urlConfig from '../../utils/urlConfig';
import '../login/login.css';

function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [emailErr, setEmailErr] = useState('');
    const [serverErr, setServerErr] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [userId, setUserId] = useState('');
    const navigate = useNavigate();

    const validate = () => {
        if (!email.trim()) return 'Email is required';
        if (!/\S+@\S+\.\S+/.test(email)) return 'Enter a valid email';
        return '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const err = validate();
        if (err) {
            setEmailErr(err);
            return;
        }
        setEmailErr('');
        setServerErr('');
        setLoading(true);
        try {
            const resp = await axios.patch(urlConfig.FORGOT_PASSWORD_URL, { email });
            const { userId: uid } = resp.data;
            setUserId(uid);
            setSent(true);
        } catch (err) {
            setServerErr(err.response?.data?.message || 'Failed to send OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (loading)
        return (
            <div className="auth-loading">
                <p>Sending OTP...</p>
            </div>
        );

    if (sent) {
        return (
            <div className="signinscreen">
                <div className="container">
                    <div className="innerContainer">
                        <p>Check Your Email</p>
                        <div className="otp-sent-msg">
                            <p>
                                We sent a 6-digit OTP to <strong>{email}</strong>.
                            </p>
                            <p>
                                It expires in <strong>5 minutes</strong>.
                            </p>
                        </div>
                        <button
                            className="auth-action-btn"
                            onClick={() => navigate(`/reset-password/${userId}`)}
                        >
                            Enter OTP &amp; Reset Password
                        </button>
                        <br />
                        <Link to="/login" className="link">
                            Back to Sign In
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="signinscreen">
            <div className="container">
                <div className="innerContainer">
                    <p>Forgot Password</p>
                    <p className="auth-subtitle">Enter your registered email to receive an OTP.</p>

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
                                setEmailErr('');
                            }}
                            aria-describedby="email-error"
                        />
                        {emailErr && (
                            <span className="field-error" id="email-error" role="alert">
                                {emailErr}
                            </span>
                        )}

                        <input type="submit" value="Send OTP" />
                    </form>
                    <br />
                    <Link to="/login" className="link">
                        Back to Sign In
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default ForgotPassword;
