import React from 'react';
import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="container">
                <div className="auth-header">
                    <div className="logo-text">🌱 TaniPintar</div>
                    <p style={{ color: '#666' }}>Technology for Smart Farming</p>
                </div>
                <Outlet />
            </div>
        </div>
    );
};

export default AuthLayout;
