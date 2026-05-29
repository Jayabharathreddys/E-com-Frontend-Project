import { Link } from 'react-router-dom';
import '../unauthorized/unauthorized.css';

const NotFound = () => {
    return (
        <div className="error-page">
            <div className="error-card">
                <h1 className="error-code" style={{ color: '#718096' }}>404</h1>
                <h2 className="error-title">Page Not Found</h2>
                <p className="error-message">The page you are looking for does not exist.</p>
                <div className="error-actions">
                    <Link to="/" className="error-btn primary">Go Home</Link>
                </div>
            </div>
        </div>
    );
};

export default NotFound;
