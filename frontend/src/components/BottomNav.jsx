import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const menuItems = [
    { id: 'home', title: 'Home', icon: '🏠', route: '/dashboard', available: true },
    { id: 'iot', title: 'IoT', icon: '📡', route: '/iot-monitoring', available: true },
    { id: 'disease-detection', title: 'Plant Detection', icon: '🌿', route: '/disease-detection', available: true },
    { id: 'water-fertilizer', title: 'Water & Fertilizer', icon: '🧪', route: '/water-fertilizer', available: true },
    { id: 'chatbot', title: 'Chat TaniPintar', icon: '💬', route: '/chatbot', available: false }
];

// Fixed bottom navigation shared across all authenticated pages. Rendered by
// AppLayout as a sibling of the routed page so `position: fixed` anchors to the
// viewport regardless of any transformed page root.
const BottomNav = () => {
    const navigate = useNavigate();
    const { pathname } = useLocation();

    const isActive = (item) => pathname === item.route || pathname.startsWith(`${item.route}/`);

    const handleMenuClick = (item) => {
        if (!item.available) {
            alert('Fitur ini akan segera hadir!');
            return;
        }
        navigate(item.route);
    };

    return (
        <div style={{
            position: 'fixed',
            bottom: '15px',
            left: '15px',
            right: '15px',
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            border: '1px solid var(--color-primary-glow)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
            zIndex: 1000,
            maxWidth: '450px',
            margin: '0 auto'
        }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-around',
                padding: '0.6rem 0.4rem'
            }}>
                {menuItems.map(item => {
                    const active = isActive(item);
                    return (
                        <button
                            key={item.id}
                            onClick={() => handleMenuClick(item)}
                            className={item.available ? 'scale-hover' : ''}
                            style={{
                                flex: 1,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '0.3rem',
                                padding: '0.6rem 0',
                                background: 'none',
                                border: 'none',
                                cursor: item.available ? 'pointer' : 'not-allowed',
                                opacity: item.available ? 1 : 0.4,
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                position: 'relative'
                            }}
                        >
                            <div style={{
                                fontSize: '1.6rem',
                                filter: active ? 'drop-shadow(0 0 8px var(--color-primary-glow))' : 'grayscale(100%)',
                                transform: active ? 'translateY(-5px) scale(1.15)' : 'translateY(0) scale(1)',
                                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                            }}>
                                {item.icon}
                            </div>
                            <span style={{
                                fontSize: '0.65rem',
                                fontWeight: '800',
                                color: active ? 'var(--color-primary-dark)' : 'var(--color-text-light)',
                                letterSpacing: '0.2px',
                                textTransform: 'uppercase',
                                textAlign: 'center',
                                width: '100%',
                                display: 'block'
                            }}>
                                {item.title}
                            </span>
                            {active && (
                                <div style={{
                                    position: 'absolute',
                                    bottom: '0',
                                    width: '5px',
                                    height: '5px',
                                    background: 'var(--color-primary)',
                                    borderRadius: '50%',
                                    boxShadow: '0 0 10px var(--color-primary)'
                                }}></div>
                            )}
                            {!item.available && (
                                <div style={{
                                    position: 'absolute',
                                    top: '4px',
                                    right: '4px',
                                    width: '6px',
                                    height: '6px',
                                    background: '#f59e0b',
                                    borderRadius: '50%'
                                }}></div>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default BottomNav;
