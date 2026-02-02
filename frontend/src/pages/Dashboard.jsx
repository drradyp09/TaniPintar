import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AUTH_BASE_URL } from '../apiConfig';

const Dashboard = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const [activeTab, setActiveTab] = useState('home');

    const handleLogout = async () => {
        await fetch(`${AUTH_BASE_URL}/logout`, { method: 'POST', credentials: 'include' });
        localStorage.removeItem('user');
        navigate('/login');
    };

    const menuItems = [
        {
            id: 'home',
            title: 'Home',
            icon: '🏠',
            available: true
        },
        {
            id: 'iot',
            title: 'IoT',
            icon: '📡',
            route: '/iot-monitoring',
            available: true
        },
        {
            id: 'disease-detection',
            title: 'Plant Detection',
            icon: '🌿',
            route: '/disease-detection',
            available: true
        },
        {
            id: 'fertilizer',
            title: 'Water & Fertilizer',
            icon: '🧪',
            route: '/fertilizer',
            available: false
        },
        {
            id: 'chatbot',
            title: 'Chat TaniPintar',
            icon: '💬',
            route: '/chatbot',
            available: false
        }
    ];

    const handleMenuClick = (item) => {
        if (!item.available) {
            alert('Fitur ini akan segera hadir!');
            return;
        }

        if (item.id === 'home') {
            setActiveTab('home');
        } else {
            navigate(item.route);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(to bottom, #f8f9fa 0%, #e9ecef 100%)',
            paddingBottom: '80px' // Space for bottom nav
        }}>
            {/* Mobile-optimized container */}
            <div style={{
                maxWidth: '480px',
                margin: '0 auto',
                padding: '1rem'
            }}>
                {/* Header */}
                <div style={{
                    background: 'white',
                    borderRadius: '16px',
                    padding: '1.25rem',
                    marginBottom: '1.5rem',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '0.5rem'
                    }}>
                        <h1 style={{
                            fontSize: '1.5rem',
                            margin: 0,
                            background: 'linear-gradient(135deg, #2e7d32 0%, #66bb6a 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            fontWeight: '700'
                        }}>
                            Halo, {user.username}! 👋
                        </h1>
                        <button
                            onClick={handleLogout}
                            style={{
                                background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)',
                                border: 'none',
                                color: 'white',
                                cursor: 'pointer',
                                fontWeight: '600',
                                fontSize: '0.85rem',
                                padding: '0.5rem 1rem',
                                borderRadius: '8px',
                                boxShadow: '0 2px 6px rgba(238, 90, 111, 0.3)'
                            }}
                        >
                            Keluar
                        </button>
                    </div>
                    <p style={{
                        color: '#718096',
                        fontSize: '0.85rem',
                        margin: 0
                    }}>
                        Technology for Smart Farming
                    </p>
                </div>

                {/* Main Content Area */}
                <div style={{ marginBottom: '1rem' }}>
                    <h2 style={{
                        fontSize: '1.25rem',
                        fontWeight: '700',
                        color: '#2d3748',
                        marginBottom: '1rem'
                    }}>
                        Selamat Datang di TaniPintar
                    </h2>

                    {/* Info Cards */}
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        <div className="card" style={{
                            padding: '1.5rem',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            border: 'none'
                        }}>
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'white' }}>
                                📊 Status Sistem
                            </h3>
                            <p style={{ fontSize: '0.9rem', margin: 0, opacity: 0.9 }}>
                                Semua sistem berjalan normal. Pilih menu di bawah untuk mengakses fitur.
                            </p>
                        </div>

                        <div className="card" style={{ padding: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: '#2d3748' }}>
                                🎯 Fitur Tersedia
                            </h3>
                            <ul style={{
                                margin: '0.5rem 0 0 0',
                                paddingLeft: '1.5rem',
                                fontSize: '0.9rem',
                                color: '#718096'
                            }}>
                                <li>Monitoring IoT - Pantau sensor real-time</li>
                                <li style={{ opacity: 0.5 }}>Plant Detection - Segera hadir</li>
                                <li style={{ opacity: 0.5 }}>Water & Fertilizer - Segera hadir</li>
                                <li style={{ opacity: 0.5 }}>Chat TaniPintar - Segera hadir</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Navigation Bar */}
            <div style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                background: 'white',
                borderTop: '1px solid #e2e8f0',
                boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
                zIndex: 1000
            }}>
                <div style={{
                    maxWidth: '480px',
                    margin: '0 auto',
                    display: 'flex',
                    justifyContent: 'space-around',
                    padding: '0.5rem 0'
                }}>
                    {menuItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => handleMenuClick(item)}
                            style={{
                                flex: 1,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '0.25rem',
                                padding: '0.5rem',
                                background: 'none',
                                border: 'none',
                                cursor: item.available ? 'pointer' : 'not-allowed',
                                opacity: item.available ? 1 : 0.4,
                                transition: 'all 0.2s ease',
                                position: 'relative'
                            }}
                        >
                            {/* Icon */}
                            <div style={{
                                fontSize: '1.5rem',
                                filter: activeTab === item.id ? 'none' : 'grayscale(100%)',
                                transform: activeTab === item.id ? 'scale(1.1)' : 'scale(1)',
                                transition: 'all 0.2s ease'
                            }}>
                                {item.icon}
                            </div>

                            {/* Label */}
                            <span style={{
                                fontSize: '0.7rem',
                                fontWeight: activeTab === item.id ? '700' : '500',
                                color: activeTab === item.id ? '#2e7d32' : '#718096',
                                transition: 'all 0.2s ease'
                            }}>
                                {item.title}
                            </span>

                            {/* Active Indicator */}
                            {activeTab === item.id && (
                                <div style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    width: '40px',
                                    height: '3px',
                                    background: 'linear-gradient(135deg, #2e7d32 0%, #66bb6a 100%)',
                                    borderRadius: '0 0 3px 3px'
                                }}></div>
                            )}

                            {/* Coming Soon Badge */}
                            {!item.available && (
                                <div style={{
                                    position: 'absolute',
                                    top: '4px',
                                    right: '8px',
                                    background: '#f59e0b',
                                    color: 'white',
                                    fontSize: '0.5rem',
                                    padding: '2px 4px',
                                    borderRadius: '6px',
                                    fontWeight: '700'
                                }}>
                                    SOON
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
