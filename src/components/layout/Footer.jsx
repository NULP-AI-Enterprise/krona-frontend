import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer-container">
            <span className="footer-copyright">
                &copy;
            </span>

            <img 
                src="src/assets/images/footer/team_logo.png" 
                alt='Team logo' 
                className="footer-logo"
            />
            
            {/* Footer Links */}
            <a href="#" className="footer-link">Умови</a>
            <a href="#" className="footer-link">Контакти</a>
            <a href="#" className="footer-link">Про нас</a>
        </footer>
    );
};

export default Footer;