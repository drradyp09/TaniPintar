import React from 'react';
import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--color-bg-gradient)',
            padding: '1.5rem'
        }}>
            <div style={{ width: '100%', maxWidth: '450px' }}>
                <Outlet />
            </div>
        </div>
    );
};

export default AuthLayout;
