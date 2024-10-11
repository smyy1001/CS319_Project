import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Link, Tooltip } from '@mui/material';
import Navigation from '../Navigation/Navigation';
import './AppBarComponent.css';

const AppBarComponent = () => {
    const location = useLocation();
    const navigate = useNavigate();

    return (
        <AppBar position="fixed" className="app-bar">
            <Toolbar className="styled-toolbar">
                {(location.pathname === '/home' || location.pathname === '/login' || location.pathname.startsWith('/register')) ? (
                    <div className="search-bar-search-logo2">
                        Meet<span className='bilkent-header-style'>Bilkent</span>
                    </div>
                ) : (
                    <Tooltip title="Home Page">
                        <Link underline="none" onClick={() => navigate('/home')}>
                            <div className="search-bar-search-logo">
                                Meet<span className='bilkent-header-style'>Bilkent</span>
                            </div>
                        </Link>
                    </Tooltip>
                )}
                {!location.pathname.startsWith('/register') && location.pathname !== '/login' &&
                    <Toolbar className="styled-right-toolbar">
                        <Navigation />
                    </Toolbar>
                }
            </Toolbar>
        </AppBar>
    );
};

export default AppBarComponent;
