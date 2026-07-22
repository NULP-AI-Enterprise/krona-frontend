import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Header.css';

const Header = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);

    const goTo = (path) => {
        navigate(path);
    };

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_full_name');
        localStorage.removeItem('user_email');
        localStorage.removeItem('user_role');

        localStorage.removeItem('concordance_selected_collection');

        setShowDropdown(false);
        window.location.href = '/';
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const isHomePage = location.pathname === '/';
    const isAuthPage = ['/login', '/register'].includes(location.pathname);
    const isLoggedIn = !!localStorage.getItem('access_token');

    return (
        <header className={`header-container ${isAuthPage ? 'header-auth-mode' : ''}`}>
            {/* Left side: Logo */}
            <button className="image-button header-logo-btn" onClick={() => goTo('')} >
                <img src="/src/assets/images/header/logo.png" alt="Logo" width={91} height={91} />
            </button>

            <div style={{ display: 'flex', justifyContent: 'flex-start', alignContent: 'left'}}>
                <Link to="/" className="header-title-link">
                    KRONA
                </Link>
            </div>

            {/* Right side: Actions */}
            <div className="header-right-side">
                {/* <button className="header-nav-btn">Документація</button>
                <button className="header-nav-btn">Підтримка</button> */}

                {isLoggedIn ? (
                     !isAuthPage && (
                        <div style={{ position: 'relative' }} ref={dropdownRef}>
                            <button 
                                className="image-button header-account-btn" 
                                onClick={() => setShowDropdown(!showDropdown)}
                            >
                                <img src={'/src/assets/images/header/account_icon.png'} alt="Account icon" width={86} height={69}/>
                            </button>
                            
                            {showDropdown && (
                                <div className="dropdown-menu">
                                    <button onClick={handleLogout} className="dropdown-item">
                                        Вийти
                                    </button>
                                </div>
                            )}
                        </div>
                     )
                ) : (
                    !isAuthPage && (
                        <>
                            <Link to="/login" className="header-login-btn">
                                Увійти
                            </Link>

                            <Link to="/register" className="header-register-btn">
                                Зареєструватись
                            </Link>
                        </>
                    )
                )}
            </div>
        </header>
    );
};

export default Header;