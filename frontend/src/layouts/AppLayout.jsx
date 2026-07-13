import React from 'react';
import { Outlet } from 'react-router-dom';
import BottomNav from '../components/BottomNav';

// Layout for authenticated pages: renders the routed page plus the shared
// bottom navigation. The paddingBottom keeps page content clear of the fixed nav.
const AppLayout = () => {
    return (
        <>
            <div style={{ paddingBottom: '90px' }}>
                <Outlet />
            </div>
            <BottomNav />
        </>
    );
};

export default AppLayout;
