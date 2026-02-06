import React from 'react';
import { useNavigate } from 'react-router-dom';

const WaterFertilizer = () => {
    const navigate = useNavigate();

    const modules = [
        {
            title: "Perhitungan Kebutuhan Air Tanaman",
            description: "Kalkulasi presisi ETc menggunakan standar FAO-56 Penman-Monteith untuk irigasi harian dan musiman.",
            icon: "💧",
            route: "/irrigation",
            color: "var(--color-primary)"
        },
        {
            title: "Perhitungan Kebutuhan Pupuk Tanaman",
            description: "Rekomendasi dosis pupuk N-P-K (Urea, SP-36, KCl) berdasarkan luas lahan dan jenis komoditas.",
            icon: "💊",
            route: "/fertilizer",
            color: "#1e88e5"
        }
    ];

    return (
        <div className="mobile-container animate-fade-in" style={{ paddingBottom: '4rem' }}>
            <button
                onClick={() => navigate('/dashboard')}
                className="scale-hover"
                style={{
                    background: 'rgba(255, 255, 255, 0.8)',
                    color: 'var(--color-primary-dark)',
                    padding: '0.6rem 1.2rem',
                    fontSize: '0.8rem',
                    marginBottom: '1.5rem',
                    border: '1.5px solid var(--color-primary-glow)',
                    borderRadius: '14px',
                    fontWeight: '800',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    boxShadow: 'var(--shadow-soft)'
                }}
            >
                <span>←</span> KEMBALI
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
                <div style={{
                    width: '50px', height: '50px', borderRadius: '16px',
                    background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', boxShadow: 'var(--shadow-glow)'
                }}>🧪</div>
                <div>
                    <h1 style={{ fontSize: '1.8rem', margin: 0, fontWeight: '900', letterSpacing: '-0.8px' }}>Water & Fertilizer</h1>
                    <p style={{ color: 'var(--color-text-light)', fontSize: '0.9rem', margin: '2px 0 0 0', fontWeight: '600' }}>Smart Agriculture Hub</p>
                </div>
            </div>

            <div style={{ display: 'grid', gap: '1.5rem' }}>
                {modules.map((mod, idx) => (
                    <div
                        key={idx}
                        onClick={() => navigate(mod.route)}
                        className="glass-card scale-hover animate-stagger-1"
                        style={{
                            padding: '1.8rem',
                            cursor: 'pointer',
                            border: `1.5px solid ${mod.color}20`,
                            background: 'rgba(255, 255, 255, 0.8)',
                            position: 'relative',
                            overflow: 'hidden',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.8rem'
                        }}
                    >
                        <div style={{
                            fontSize: '2.5rem',
                            marginBottom: '0.5rem',
                            filter: `drop-shadow(0 4px 10px ${mod.color}40)`
                        }}>
                            {mod.icon}
                        </div>
                        <h3 style={{
                            fontSize: '1.25rem',
                            margin: 0,
                            fontWeight: '900',
                            color: 'var(--color-text)',
                            letterSpacing: '-0.5px',
                            lineHeight: '1.2'
                        }}>
                            {mod.title}
                        </h3>
                        <p style={{
                            fontSize: '0.85rem',
                            margin: 0,
                            color: 'var(--color-text-light)',
                            lineHeight: '1.6',
                            fontWeight: '600'
                        }}>
                            {mod.description}
                        </p>

                        <div style={{
                            marginTop: '0.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            color: mod.color,
                            fontWeight: '800',
                            fontSize: '0.8rem'
                        }}>
                            BUKA MODUL <span>→</span>
                        </div>

                        {/* Decorative background element */}
                        <div style={{
                            position: 'absolute',
                            right: '-10px',
                            bottom: '-10px',
                            fontSize: '5rem',
                            opacity: 0.03,
                            transform: 'rotate(-15deg)',
                            pointerEvents: 'none'
                        }}>{mod.icon}</div>
                    </div>
                ))}
            </div>

            <div className="glass-card" style={{
                marginTop: '3rem',
                padding: '1.5rem',
                textAlign: 'center',
                background: 'rgba(255, 255, 255, 0.6)',
                border: '1px solid var(--color-primary-glow)'
            }}>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-light)', fontWeight: '600' }}>
                    Sistem Rekomendasi Pintar TaniPintar v2.0
                </p>
            </div>
        </div>
    );
};

export default WaterFertilizer;
