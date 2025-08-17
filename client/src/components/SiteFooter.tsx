import React from 'react';
import './SiteFooter.css';

const SiteFooter: React.FC = () => {
    return (
        <footer className="site-footer">
            <div className="site-footer__links">
                <a href="/about">About Us</a>
                <a href="/contact">Contact</a>
                <a href="/privacy">Privacy Policy</a>
            </div>
            <div className="site-footer__copy">&copy; {new Date().getFullYear()} FreeLoader. All rights reserved.</div>
        </footer>
    );
};

export default SiteFooter;
