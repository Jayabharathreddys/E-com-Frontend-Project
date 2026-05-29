import { memo } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { FaOpencart } from "react-icons/fa";
import './navbar.css'
import Loader from '../loader';
import { useCart } from '../../context/cart/useCart';
import useAuth from '../../context/auth/useAuth';
import axios from 'axios';
import urlConfig from '../../utils/urlConfig';

const Navbar = ({categories, isLoading}) => {
    const { totalQuantity } = useCart();
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await axios.post(`${urlConfig.ORDR_URL.replace('/api/booking', '')}/api/auth/logout`, {}, { withCredentials: true });
        } catch (_) { /* ignore */ }
        logout();
        navigate('/login');
    };

    return(
        <nav className='nav'>
            <div className='nav-left'>
                <ul className='nav-items'>
                    {isLoading && <Loader />}
                    {categories && categories.length > 0 ? categories.map((item, idx) => (
                        <li className='nav-item' key={idx + 1}>
                            <NavLink to={`/products/${item}`} className="nav-link">{item}</NavLink>
                        </li>
                    )) : <></>}
                </ul>
            </div>
            <div className='nav-right'>
                {user
                    ? <button className="nav-logout-btn" onClick={handleLogout}>Logout</button>
                    : <Link to="/login" className="nav-link nav-login-link">Login</Link>
                }
                <Link to="/cart" className="cart-icon-container">
                    <FaOpencart className="cart-icon" />
                    {totalQuantity ? <div className='cart-badge'>{totalQuantity}</div> : <></>}
                </Link>
            </div>
        </nav>
    );
};

export default memo(Navbar);
