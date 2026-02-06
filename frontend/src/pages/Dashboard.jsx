import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AUTH_BASE_URL } from '../apiConfig';

const Dashboard = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const [activeTab, setActiveTab] = useState('home');

    const handleLogout = async () => {
        try {
            await fetch(`${AUTH_BASE_URL}/logout`, { method: 'POST', credentials: 'include' });
        } catch (error) {
            console.error('Logout failed:', error);
        } finally {
            localStorage.removeItem('user');
            navigate('/login');
        }
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
            id: 'water-fertilizer',
            title: 'Water & Fertilizer',
            icon: '🧪',
            route: '/water-fertilizer',
            available: true
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
        <div className="animate-fade-in" style={{
            minHeight: '100vh',
            paddingBottom: '90px',
            background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.03) 0%, rgba(255, 255, 255, 0) 100%)'
        }}>
            <div className="mobile-container">
                {/* Header */}
                <div className="glass-card animate-stagger-1" style={{
                    padding: '1.8rem',
                    marginBottom: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    border: '1px solid var(--color-primary-glow)',
                    background: 'rgba(255, 255, 255, 0.8)'
                }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '0.6rem'
                    }}>
                        <div>
                            <p style={{ color: 'var(--color-primary)', fontSize: '0.85rem', margin: '0 0 4px 0', fontWeight: '800', letterSpacing: '1px' }}>SELAMAT DATANG</p>
                            <h1 style={{
                                fontSize: '1.8rem',
                                margin: 0,
                                color: 'var(--color-text)',
                                fontWeight: '900',
                                letterSpacing: '-0.8px'
                            }}>
                                {user.username}!
                            </h1>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="scale-hover"
                            style={{
                                padding: '0.6rem 1.2rem',
                                fontSize: '0.8rem',
                                background: 'rgba(211, 47, 47, 0.1)',
                                border: '1.5px solid rgba(211, 47, 47, 0.2)',
                                borderRadius: '12px',
                                color: 'var(--color-error)',
                                fontWeight: '800',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            Log Out
                        </button>
                    </div>
                    <div style={{
                        height: '1px',
                        background: 'var(--color-primary-glow)',
                        margin: '1rem 0'
                    }}></div>
                    <p style={{
                        color: 'var(--color-text-light)',
                        fontSize: '0.95rem',
                        margin: 0,
                        fontWeight: '600',
                        fontStyle: 'italic'
                    }}>
                        "Modernizing Agriculture through Intelligence"
                    </p>
                </div>

                {/* Main Content Area */}
                <div className="animate-stagger-2">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
                        <h2 style={{
                            fontSize: '1.3rem',
                            fontWeight: '800',
                            color: 'var(--color-text)',
                            margin: 0,
                            letterSpacing: '-0.3px'
                        }}>
                            Eksplorasi Fitur
                        </h2>
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-primary)', fontWeight: '700', padding: '4px 12px', background: 'rgba(76,175,80,0.1)', borderRadius: '20px' }}>
                            PRO VERSION
                        </div>
                    </div>

                    {/* Info Cards */}
                    <div style={{ display: 'grid', gap: '1.2rem' }}>
                        <div className="glass-card scale-hover" style={{
                            padding: '1.8rem',
                            background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)',
                            color: 'white',
                            border: 'none',
                            boxShadow: 'var(--shadow-glow)',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            <div style={{ position: 'relative', zIndex: 1 }}>
                                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.8rem', color: 'white', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span>📊</span> Ringkasan Lahan
                                </h3>
                                <p style={{ fontSize: '0.95rem', margin: 0, opacity: 0.9, lineHeight: '1.6', fontWeight: '500' }}>
                                    Kondisi ekosistem pertanian Anda saat ini terpantau stabil. Lakukan pengecekan berkala pada sensor IoT.
                                </p>
                            </div>
                            <div style={{
                                position: 'absolute',
                                right: '-20px',
                                bottom: '-20px',
                                fontSize: '6rem',
                                opacity: 0.1,
                                transform: 'rotate(-15deg)'
                            }}>📈</div>
                        </div>

                        <div className="glass-card" style={{ padding: '1.5rem', border: '1px solid var(--color-primary-glow)' }}>
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--color-text)', fontWeight: '800' }}>
                                🛡️ Smart Health Check
                            </h3>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem' }}>
                                <div className="animate-pulse-glow" style={{
                                    background: 'rgba(76, 175, 80, 0.1)',
                                    color: 'var(--color-primary)',
                                    padding: '10px 18px',
                                    borderRadius: '14px',
                                    fontSize: '0.85rem',
                                    fontWeight: '800',
                                    border: '1px solid var(--color-primary-glow)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-primary)' }}></div>
                                    IoT Online
                                </div>
                                <div style={{
                                    background: 'rgba(33, 150, 243, 0.1)',
                                    color: '#1e88e5',
                                    padding: '10px 18px',
                                    borderRadius: '14px',
                                    fontSize: '0.85rem',
                                    fontWeight: '800',
                                    border: '1px solid rgba(33, 150, 243, 0.2)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#1e88e5' }}></div>
                                    Vision AI Ready
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Navigation Bar */}
            <div style={{
                position: 'fixed',
                bottom: '15px',
                left: '15px',
                right: '15px',
                background: 'rgba(255, 255, 255, 0.85)',
                backdropFilter: 'blur(15px)',
                borderRadius: '24px',
                border: '1px solid var(--color-primary-glow)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                zIndex: 1000,
                maxWidth: '450px',
                margin: '0 auto'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-around',
                    padding: '0.6rem 0.4rem'
                }}>
                    {menuItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => handleMenuClick(item)}
                            className={item.available ? "scale-hover" : ""}
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
                            {/* Icon with Active Highlight */}
                            <div style={{
                                fontSize: '1.6rem',
                                filter: activeTab === item.id ? 'drop-shadow(0 0 8px var(--color-primary-glow))' : 'grayscale(100%)',
                                transform: activeTab === item.id ? 'translateY(-5px) scale(1.15)' : 'translateY(0) scale(1)',
                                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                            }}>
                                {item.icon}
                            </div>

                            {/* Label */}
                            <span style={{
                                fontSize: '0.65rem',
                                fontWeight: '800',
                                color: activeTab === item.id ? 'var(--color-primary-dark)' : 'var(--color-text-light)',
                                letterSpacing: '0.2px',
                                textTransform: 'uppercase',
                                textAlign: 'center',
                                width: '100%',
                                display: 'block'
                            }}>
                                {item.title}
                            </span>

                            {/* Active Dot */}
                            {activeTab === item.id && (
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

                            {/* Coming Soon Indicator */}
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
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
