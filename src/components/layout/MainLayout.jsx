import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import './MainLayout.css';

const MainLayout = () => {
    const location = useLocation();

    const hideSidebarRoutes = ['/', '/login', '/register', '/user'];

    const shouldShowSidebar = !hideSidebarRoutes.includes(location.pathname);

    return (
        <div className="main-layout-container">
            <Header />
            <div className="main-content-wrapper">
                {shouldShowSidebar && <Sidebar />}

                <main className="main-content-area">
                    {/* The specific page content*/}
                    <Outlet />
                </main>
            </div>
            <Footer />
        </div>
    );
};

export default MainLayout;