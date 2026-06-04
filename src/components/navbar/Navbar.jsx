import { memo, useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { FaOpencart, FaUserCircle, FaChevronDown } from 'react-icons/fa';
import './navbar.css';
import Loader from '../loader';
import { useCart } from '../../context/cart/useCart';
import useAuth from '../../context/auth/useAuth';
import axios from 'axios';
import urlConfig from '../../utils/urlConfig';

const Navbar = ({ categories, isLoading }) => {
    const { totalQuantity, clearCart } = useCart();
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const displayName = user?.user?.name || user?.name || null;

    // Close dropdown when clicking outside or pressing Escape
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') setDropdownOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    const handleLogout = async () => {
        setDropdownOpen(false);
        try {
            await axios.post(urlConfig.LOGOUT_URL, {}, { withCredentials: true });
        } catch (_) {
            /* ignore */
        }
        clearCart();
        logout();
        navigate('/login');
    };

    return (
        <nav className="nav">
            <div className="nav-left">
                <ul className="nav-items">
                    {isLoading && <Loader />}
                    {categories && categories.length > 0 ? (
                        categories.map((item) => (
                            <li className="nav-item" key={item}>
                                <NavLink to={`/products/${item}`} className="nav-link">
                                    {item}
                                </NavLink>
                            </li>
                        ))
                    ) : (
                        <></>
                    )}
                </ul>
            </div>

            <div className="nav-right">
                {user ? (
                    <div className="nav-account" ref={dropdownRef}>
                        <button
                            className="nav-account-btn"
                            onClick={() => setDropdownOpen((prev) => !prev)}
                            aria-haspopup="true"
                            aria-expanded={dropdownOpen}
                            aria-label={
                                displayName
                                    ? `Hi, ${displayName.split(' ')[0]}! Account menu`
                                    : 'Account menu'
                            }
                        >
                            <FaUserCircle className="nav-account-icon" />
                            <span className="nav-account-name">
                                {displayName ? `Hi, ${displayName.split(' ')[0]}!` : 'My Account'}
                            </span>
                            <FaChevronDown
                                className={`nav-chevron ${dropdownOpen ? 'open' : ''}`}
                            />
                        </button>

                        {dropdownOpen && (
                            <ul className="nav-dropdown" role="menu">
                                {(user?.user?.role === 'admin' || user?.role === 'admin') && (
                                    <li role="none">
                                        <Link
                                            to="/admin"
                                            role="menuitem"
                                            className="nav-dropdown-item"
                                            style={{ color: '#6a0dad', fontWeight: 700 }}
                                            onClick={() => setDropdownOpen(false)}
                                        >
                                            <span className="nav-dropdown-icon">⚡</span> Admin
                                            Panel
                                        </Link>
                                    </li>
                                )}
                                <li role="none">
                                    <Link
                                        to="/dashboard"
                                        role="menuitem"
                                        className="nav-dropdown-item"
                                        onClick={() => setDropdownOpen(false)}
                                    >
                                        <span className="nav-dropdown-icon">🏠</span> Dashboard
                                    </Link>
                                </li>
                                <li role="none">
                                    <Link
                                        to="/orders"
                                        role="menuitem"
                                        className="nav-dropdown-item"
                                        onClick={() => setDropdownOpen(false)}
                                    >
                                        <span className="nav-dropdown-icon">📦</span> My Orders
                                    </Link>
                                </li>
                                <li role="none">
                                    <Link
                                        to="/wishlist"
                                        role="menuitem"
                                        className="nav-dropdown-item"
                                        onClick={() => setDropdownOpen(false)}
                                    >
                                        <span className="nav-dropdown-icon">❤️</span> Wishlist
                                    </Link>
                                </li>
                                <li role="none">
                                    <Link
                                        to="/addresses"
                                        role="menuitem"
                                        className="nav-dropdown-item"
                                        onClick={() => setDropdownOpen(false)}
                                    >
                                        <span className="nav-dropdown-icon">📍</span> Addresses
                                    </Link>
                                </li>
                                <li role="none">
                                    <Link
                                        to="/profile"
                                        role="menuitem"
                                        className="nav-dropdown-item"
                                        onClick={() => setDropdownOpen(false)}
                                    >
                                        <span className="nav-dropdown-icon">⚙️</span> Profile
                                        Settings
                                    </Link>
                                </li>
                                <li role="none">
                                    <button
                                        role="menuitem"
                                        className="nav-dropdown-item nav-dropdown-logout"
                                        onClick={handleLogout}
                                    >
                                        <span className="nav-dropdown-icon">🚪</span> Logout
                                    </button>
                                </li>
                            </ul>
                        )}
                    </div>
                ) : (
                    <Link to="/login" className="nav-link nav-login-link">
                        Login
                    </Link>
                )}

                <Link
                    to="/cart"
                    className="cart-icon-container"
                    aria-label={`Cart, ${totalQuantity} items`}
                >
                    <FaOpencart className="cart-icon" />
                    <span className="cart-label">Cart</span>
                    {totalQuantity > 0 && <div className="cart-badge">{totalQuantity}</div>}
                </Link>
            </div>
        </nav>
    );
};

const NavbarMemo = memo(Navbar);
NavbarMemo.displayName = 'Navbar';
export default NavbarMemo;
