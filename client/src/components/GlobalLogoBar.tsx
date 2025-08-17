import React from 'react';
import { useLocation, Link } from 'react-router-dom';

const GlobalLogoBar: React.FC = () => {
    const location = useLocation();
    if (location.pathname === '/') return null;
    return (
        <div className="app-logo-bar">
            <Link to="/" className="logo">FreeLoader</Link>
        </div>
    );
};

export default GlobalLogoBar;
