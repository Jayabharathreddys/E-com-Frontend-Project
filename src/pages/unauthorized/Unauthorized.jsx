import { Link } from 'react-router-dom';
import './unauthorized.css';

const Unauthorized = () => {
    return (
        <div className="error-page">
            <div className="error-card">
                <h1 className="error-code">401</h1>
                <h2 className="error-title">Unauthorized</h2>
                <p className="error-message">You need to be logged in to access this page.</p>
                <div className="error-actions">
                    <Link to="/login" className="error-btn primary">Sign In</Link>
                    <Link to="/" className="error-btn secondary">Go Home</Link>
                </div>
            </div>
        </div>
    );
};

export default Unauthorized;
