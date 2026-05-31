import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import urlConfig from '../../utils/urlConfig';
import '../login/login.css';

function ResetPassword() {
    const { userId } = useParams();
    const navigate   = useNavigate();

    const [otp, setOtp]                     = useState('');
    const [password, setPassword]           = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors]               = useState({});
    const [serverErr, setServerErr]         = useState('');
    const [loading, setLoading]             = useState(false);

    const validate = () => {
        const errs = {};
        if (!otp.trim())               errs.otp             = 'OTP is required';
        if (!password)                 errs.password        = 'New password is required';
        else if (password.length < 6)  errs.password        = 'Password must be at least 6 characters';
        if (!confirmPassword)          errs.confirmPassword = 'Please confirm your password';
        else if (password !== confirmPassword) errs.confirmPassword = 'Passwords do not match';
        return errs;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }
        setErrors({});
        setServerErr('');
        setLoading(true);
        try {
            await axios.patch(
                `${urlConfig.RESET_PASSWORD_URL}/${userId}`,
                { otp, password, confirmPasword: confirmPassword }  // note backend typo
            );
            navigate('/login', { state: { message: 'Password reset! Please sign in with your new password.' } });
        } catch (err) {
            setServerErr(err.response?.data?.message || 'Reset failed. Please check your OTP and try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!userId) {
        return (
            <div className="signinscreen">
                <div className="container">
                    <div className="innerContainer">
                        <p>Invalid Link</p>
                        <p>This reset link is invalid. <Link to="/forgot-password" className="link">Request a new OTP</Link>.</p>
                    </div>
                </div>
            </div>
        );
    }

    if (loading) return <div className="auth-loading"><p>Resetting password...</p></div>;

    return (
        <div className="signinscreen">
            <div className="container">
                <div className="innerContainer">
                    <p>Reset Password</p>
                    <p className="auth-subtitle">Enter the OTP from your email and choose a new password.</p>

                    {serverErr && <div className="errContainer" role="alert">{serverErr}</div>}

                    <form onSubmit={handleSubmit} noValidate>
                        <label htmlFor="otp">OTP (from email)</label>
                        <input
                            type="text"
                            id="otp"
                            name="otp"
                            placeholder="Enter 6-digit OTP.."
                            value={otp}
                            maxLength={10}
                            onChange={e => { setOtp(e.target.value); setErrors(p => ({...p, otp: ''})); }}
                            aria-describedby="otp-error"
                        />
                        {errors.otp && <span className="field-error" id="otp-error" role="alert">{errors.otp}</span>}

                        <label htmlFor="password">New Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            placeholder="Min 6 characters.."
                            value={password}
                            onChange={e => { setPassword(e.target.value); setErrors(p => ({...p, password: ''})); }}
                            aria-describedby="password-error"
                        />
                        {errors.password && <span className="field-error" id="password-error" role="alert">{errors.password}</span>}

                        <label htmlFor="confirmPassword">Confirm New Password</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            placeholder="Repeat new password.."
                            value={confirmPassword}
                            onChange={e => { setConfirmPassword(e.target.value); setErrors(p => ({...p, confirmPassword: ''})); }}
                            aria-describedby="confirm-error"
                        />
                        {errors.confirmPassword && <span className="field-error" id="confirm-error" role="alert">{errors.confirmPassword}</span>}

                        <input type="submit" value="Reset Password" />
                    </form>
                    <br />
                    <Link to="/forgot-password" className="link">Request a new OTP</Link>
                </div>
            </div>
        </div>
    );
}

export default ResetPassword;
