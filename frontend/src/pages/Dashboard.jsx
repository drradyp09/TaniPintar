import React, { useState, useEffect } from 'react';
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

    // Statistics data
    const stats = [
        { icon: '📡', value: '12', label: 'Active Sensors', trend: '+2', color: '#4CAF50' },
        { icon: '🌱', value: '48', label: 'Plants Monitored', trend: '+5', color: '#2196F3' },
        { icon: '💚', value: '94%', label: 'Health Score', trend: '+3%', color: '#FF9800' },
        { icon: '💧', value: '2.4k', label: 'Water (L/week)', trend: '-8%', color: '#00BCD4' }
    ];

    // Quick actions
    const quickActions = [
        { icon: '📸', title: 'Scan Plant', subtitle: 'Detect diseases instantly', route: '/disease-detection', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
        { icon: '💧', title: 'Check Irrigation', subtitle: 'Plan water schedule', route: '/water-fertilizer', gradient: 'linear-gradient(135deg, #00b4db 0%, #0083b0 100%)' },
        { icon: '🌱', title: 'Fertilizer Plan', subtitle: 'Optimize nutrients', route: '/water-fertilizer', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
        { icon: '📊', title: 'View Sensors', subtitle: 'Monitor IoT data', route: '/iot-monitoring', gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }
    ];

    // Recent activities
    const [activities] = useState([
        { icon: '✅', title: 'Plant scan completed', detail: 'Tomato - Healthy', time: '2 hours ago', status: 'success' },
        { icon: '💧', title: 'Irrigation scheduled', detail: 'Zone A - Tomorrow 6 AM', time: '5 hours ago', status: 'info' },
        { icon: '⚠️', title: 'Sensor alert', detail: 'Soil moisture low - Sensor #3', time: '1 day ago', status: 'warning' },
        { icon: '🌿', title: 'Disease detected', detail: 'Pepper - Early Blight', time: '2 days ago', status: 'error' },
        { icon: '📈', title: 'Weekly report ready', detail: 'Health score improved', time: '3 days ago', status: 'success' }
    ]);

    const menuItems = [
        { id: 'home', title: 'Home', icon: '🏠', available: true },
        { id: 'iot', title: 'IoT', icon: '📡', route: '/iot-monitoring', available: true },
        { id: 'disease-detection', title: 'Plant Detection', icon: '🌿', route: '/disease-detection', available: true },
        { id: 'water-fertilizer', title: 'Water & Fertilizer', icon: '🧪', route: '/water-fertilizer', available: true },
        { id: 'chatbot', title: 'Chat TaniPintar', icon: '💬', route: '/chatbot', available: false }
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

    const getStatusColor = (status) => {
        const colors = {
            success: '#4CAF50',
            info: '#2196F3',
            warning: '#FF9800',
            error: '#f44336'
        };
        return colors[status] || '#757575';
    };

    return (
        <>
        <div className="animate-fade-in" style={{
            minHeight: '100vh',
            paddingBottom: '90px',
            background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.05) 0%, rgba(33, 150, 243, 0.03) 100%)'
        }}>
            <div className="mobile-container">
                {/* Header */}
                <div className="glass-card animate-stagger-1" style={{
                    padding: '1.8rem',
                    marginBottom: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    border: '1px solid var(--color-primary-glow)',
                    background: 'rgba(255, 255, 255, 0.9)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
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

                {/* Statistics Cards */}
                <div className="animate-stagger-2" style={{ marginBottom: '1.5rem' }}>
                    <h2 style={{
                        fontSize: '1.2rem',
                        fontWeight: '800',
                        color: 'var(--color-text)',
                        margin: '0 0 1rem 0',
                        letterSpacing: '-0.3px'
                    }}>
                        📊 Statistik Hari Ini
                    </h2>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: '1rem'
                    }}>
                        {stats.map((stat, index) => (
                            <div
                                key={index}
                                className="glass-card scale-hover"
                                style={{
                                    padding: '1.2rem',
                                    background: 'rgba(255, 255, 255, 0.9)',
                                    border: `1px solid ${stat.color}20`,
                                    borderRadius: '16px',
                                    boxShadow: '0 4px 15px rgba(0,0,0,0.06)',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                <div style={{
                                    position: 'absolute',
                                    top: '-10px',
                                    right: '-10px',
                                    fontSize: '3rem',
                                    opacity: 0.1
                                }}>
                                    {stat.icon}
                                </div>
                                <div style={{ position: 'relative', zIndex: 1 }}>
                                    <div style={{
                                        fontSize: '1.5rem',
                                        marginBottom: '0.3rem'
                                    }}>
                                        {stat.icon}
                                    </div>
                                    <div style={{
                                        fontSize: '1.8rem',
                                        fontWeight: '900',
                                        color: stat.color,
                                        marginBottom: '0.2rem',
                                        letterSpacing: '-0.5px'
                                    }}>
                                        {stat.value}
                                    </div>
                                    <div style={{
                                        fontSize: '0.75rem',
                                        color: 'var(--color-text-light)',
                                        fontWeight: '700',
                                        marginBottom: '0.4rem'
                                    }}>
                                        {stat.label}
                                    </div>
                                    <div style={{
                                        fontSize: '0.7rem',
                                        color: stat.trend.startsWith('+') ? '#4CAF50' : '#f44336',
                                        fontWeight: '800',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.2rem'
                                    }}>
                                        <span>{stat.trend.startsWith('+') ? '↑' : '↓'}</span>
                                        {stat.trend}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="animate-stagger-3" style={{ marginBottom: '1.5rem' }}>
                    <h2 style={{
                        fontSize: '1.2rem',
                        fontWeight: '800',
                        color: 'var(--color-text)',
                        margin: '0 0 1rem 0',
                        letterSpacing: '-0.3px'
                    }}>
                        ⚡ Aksi Cepat
                    </h2>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: '1rem'
                    }}>
                        {quickActions.map((action, index) => (
                            <div
                                key={index}
                                className="scale-hover"
                                onClick={() => navigate(action.route)}
                                style={{
                                    padding: '1.3rem',
                                    background: action.gradient,
                                    borderRadius: '16px',
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
                                    transition: 'all 0.3s ease',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                            >
                                <div style={{
                                    position: 'absolute',
                                    top: '-15px',
                                    right: '-15px',
                                    fontSize: '4rem',
                                    opacity: 0.2,
                                    transform: 'rotate(-15deg)'
                                }}>
                                    {action.icon}
                                </div>
                                <div style={{ position: 'relative', zIndex: 1 }}>
                                    <div style={{
                                        fontSize: '2rem',
                                        marginBottom: '0.5rem'
                                    }}>
                                        {action.icon}
                                    </div>
                                    <div style={{
                                        fontSize: '0.95rem',
                                        fontWeight: '800',
                                        color: 'white',
                                        marginBottom: '0.2rem',
                                        letterSpacing: '-0.2px'
                                    }}>
                                        {action.title}
                                    </div>
                                    <div style={{
                                        fontSize: '0.7rem',
                                        color: 'rgba(255,255,255,0.9)',
                                        fontWeight: '600'
                                    }}>
                                        {action.subtitle}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="animate-stagger-4" style={{ marginBottom: '1.5rem' }}>
                    <h2 style={{
                        fontSize: '1.2rem',
                        fontWeight: '800',
                        color: 'var(--color-text)',
                        margin: '0 0 1rem 0',
                        letterSpacing: '-0.3px'
                    }}>
                        🕐 Aktivitas Terkini
                    </h2>
                    <div className="glass-card" style={{
                        padding: '1rem',
                        background: 'rgba(255, 255, 255, 0.9)',
                        border: '1px solid var(--color-primary-glow)',
                        borderRadius: '16px',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.06)'
                    }}>
                        {activities.map((activity, index) => (
                            <div
                                key={index}
                                style={{
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: '1rem',
                                    padding: '1rem',
                                    borderBottom: index < activities.length - 1 ? '1px solid rgba(0,0,0,0.05)' : 'none',
                                    transition: 'all 0.2s ease',
                                    cursor: 'pointer',
                                    borderRadius: '8px'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(76, 175, 80, 0.05)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '12px',
                                    background: `${getStatusColor(activity.status)}15`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1.3rem',
                                    flexShrink: 0
                                }}>
                                    {activity.icon}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{
                                        fontSize: '0.9rem',
                                        fontWeight: '700',
                                        color: 'var(--color-text)',
                                        marginBottom: '0.2rem'
                                    }}>
                                        {activity.title}
                                    </div>
                                    <div style={{
                                        fontSize: '0.75rem',
                                        color: 'var(--color-text-light)',
                                        marginBottom: '0.3rem'
                                    }}>
                                        {activity.detail}
                                    </div>
                                    <div style={{
                                        fontSize: '0.7rem',
                                        color: getStatusColor(activity.status),
                                        fontWeight: '600'
                                    }}>
                                        {activity.time}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>

            {/* Bottom Navigation Bar (sibling of the transformed root so `fixed` anchors to the viewport) */}
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
                            <div style={{
                                fontSize: '1.6rem',
                                filter: activeTab === item.id ? 'drop-shadow(0 0 8px var(--color-primary-glow))' : 'grayscale(100%)',
                                transform: activeTab === item.id ? 'translateY(-5px) scale(1.15)' : 'translateY(0) scale(1)',
                                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                            }}>
                                {item.icon}
                            </div>
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
        </>
    );
};

export default Dashboard;
