import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PersonIcon from '@mui/icons-material/Person';
import './Header.css';

const Header = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const dropdownRef = useRef(null);
    const userRole = localStorage.getItem('user_role');
    const isAdmin = ['SUPER_ADMIN', 'ADMIN'].includes(userRole);
    const [showDropdown, setShowDropdown] = useState(false);

    const goTo = (path) => {
        navigate(path);
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
                {isLoggedIn ? (
                     !isAuthPage && (
                        <div style={{ position: 'relative'}} ref={dropdownRef}>
                            {isAdmin && (
                                <button className="header-adminpanel-btn" onClick={() => goTo('/admin')}>
                                    <AdminPanelSettingsIcon sx={{ fontSize: 50, color: 'var(--color-bg-light, #F0ECE1)' }} />
                                </button>
                            )}
                            <button 
                                className="header-account-btn" 
                                onClick={() => goTo('user')}
                            >
                                <PersonIcon sx={{ fontSize: 70, color: 'var(--color-bg-light, #F0ECE1)' }} />
                            </button>
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