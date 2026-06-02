import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import urlConfig from '../../utils/urlConfig';
import './verifyEmail.css';

export default function VerifyEmail() {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleVerify = async (e) => {
        e.preventDefault();
        if (!otp.trim()) {
            setError('Please enter the OTP from your email.');
            return;
        }
        setError('');
        setLoading(true);
        try {
            await axios.post(`${urlConfig.VERIFY_EMAIL_URL}/${userId}`, { otp: otp.trim() });
            setSuccess('Email verified! Redirecting to login…');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Verification failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setResending(true);
        setError('');
        setSuccess('');
        try {
            await axios.post(`${urlConfig.RESEND_OTP_URL}/${userId}`);
            setSuccess('A new OTP has been sent to your email.');
        } catch (err) {
            setError(err.response?.data?.message || 'Could not resend OTP.');
        } finally {
            setResending(false);
        }
    };

    return (
        <div className="verify-page">
            <div className="verify-card">
                <div className="verify-icon">📧</div>
                <h1 className="verify-title">Verify Your Email</h1>
                <p className="verify-subtitle">
                    We sent a 6-digit OTP to your registered email.
                    <br />
                    Enter it below to activate your account.
                </p>

                {success && (
                    <p className="verify-success" role="alert">
                        {success}
                    </p>
                )}
                {error && (
                    <p className="verify-error" role="alert">
                        {error}
                    </p>
                )}

                <form onSubmit={handleVerify} className="verify-form">
                    <input
                        type="text"
                        inputMode="numeric"
                        maxLength={10}
                        className="verify-otp-input"
                        placeholder="Enter OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        aria-label="Email verification OTP"
                        autoFocus
                    />
                    <button type="submit" className="verify-btn" disabled={loading}>
                        {loading ? 'Verifying…' : 'Verify Email'}
                    </button>
                </form>

                <p className="verify-resend">
                    Didn&apos;t receive it?{' '}
                    <button
                        className="verify-resend-btn"
                        onClick={handleResend}
                        disabled={resending}
                    >
                        {resending ? 'Sending…' : 'Resend OTP'}
                    </button>
                </p>

                <Link to="/login" className="verify-back">
                    ← Back to Login
                </Link>
            </div>
        </div>
    );
}
