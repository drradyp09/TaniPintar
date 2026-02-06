import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import SensorCard from '../components/SensorCard';
import AddSensorModal from '../components/AddSensorModal';
import SensorChart from '../components/SensorChart';
import { AUTH_BASE_URL } from '../apiConfig';

const IoTMonitoring = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const [view, setView] = useState('menu'); // 'menu', 'monitoring'
    const [sensors, setSensors] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedSensorId, setSelectedSensorId] = useState(null);
    const [editingSensor, setEditingSensor] = useState(null);

    const fetchSensors = async () => {
        try {
            const response = await fetch(`${AUTH_BASE_URL}/sensors`, { credentials: 'include' });

            if (response.status === 401) {
                // Session expired, clear local storage and redirect
                localStorage.removeItem('user');
                navigate('/login');
                return;
            }

            if (response.ok) {
                const data = await response.json();
                setSensors(data);

                // Auto-select first sensor ONLY if no sensor is selected yet
                setSelectedSensorId(prev => {
                    if (prev) return prev; // Keep current selection
                    return data.length > 0 ? data[0].id : null;
                });
            }
        } catch (err) {
            console.error('Failed to fetch sensors');
        }
    };

    useEffect(() => {
        if (view === 'monitoring') {
            fetchSensors();
            const interval = setInterval(fetchSensors, 5000);
            return () => clearInterval(interval);
        }
    }, [view]);

    const handleEditSensor = (sensor) => {
        setEditingSensor(sensor);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingSensor(null);
    };

    const handleDeleteSensor = async (sensorId) => {
        try {
            const response = await fetch(`${AUTH_BASE_URL}/sensors/${sensorId}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (response.ok) {
                setSensors(prev => prev.filter(s => s.id !== sensorId));
                if (selectedSensorId === sensorId) {
                    setSelectedSensorId(null);
                }
            } else {
                const errorData = await response.json();
                alert(`Gagal menghapus sensor: ${errorData.error}`);
            }
        } catch (err) {
            console.error('Delete error:', err);
            alert('Terjadi kesalahan koneksi saat mencoba menghapus sensor.');
        }
    };

    const renderMenu = () => (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.8rem',
            marginTop: '2.5rem'
        }}>
            <div
                className="glass-card scale-hover text-center animate-stagger-2"
                onClick={() => {
                    setEditingSensor(null);
                    setShowModal(true);
                }}
                style={{
                    padding: '3.5rem 2rem',
                    cursor: 'pointer',
                    border: '2px dashed var(--color-primary-glow)',
                    background: 'rgba(76, 175, 80, 0.04)',
                    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                }}
            >
                <div style={{
                    fontSize: '4rem',
                    marginBottom: '1.5rem',
                    filter: 'drop-shadow(0 4px 8px rgba(76,175,80,0.2))'
                }}>🍃</div>
                <h3 style={{
                    color: 'var(--color-primary-dark)',
                    marginBottom: '0.8rem',
                    fontWeight: '800',
                    fontSize: '1.4rem'
                }}>Registrasi IoT</h3>
                <p style={{ fontSize: '0.95rem', color: 'var(--color-text-light)', lineHeight: '1.6', fontWeight: '500' }}>
                    Siapkan perangkat datalogger Anda dan hubungkan ke ekosistem pintar kami.
                </p>
            </div>

            <div
                className="glass-card scale-hover text-center animate-stagger-3"
                onClick={() => setView('monitoring')}
                style={{
                    padding: '3.5rem 2rem',
                    cursor: 'pointer',
                    border: '1px solid var(--color-primary-glow)',
                    background: 'rgba(255, 255, 255, 0.8)',
                    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                }}
            >
                <div style={{
                    fontSize: '4rem',
                    marginBottom: '1.5rem',
                    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))'
                }}>📊</div>
                <h3 style={{
                    color: 'var(--color-text)',
                    marginBottom: '0.8rem',
                    fontWeight: '800',
                    fontSize: '1.4rem'
                }}>Pantau & Histori</h3>
                <p style={{ fontSize: '0.95rem', color: 'var(--color-text-light)', lineHeight: '1.6', fontWeight: '500' }}>
                    Akses visualisasi data real-time dan analisis tren histori lahan Anda.
                </p>
            </div>
        </div>
    );

    const renderMonitoring = () => (
        <div className="animate-stagger-2">
            {sensors.length === 0 ? (
                <div className="glass-card text-center" style={{ padding: '4rem 2rem', border: '1.5px dashed var(--color-primary-glow)' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}>🛰️</div>
                    <p style={{ color: 'var(--color-text-light)', fontWeight: '700', fontSize: '1.1rem' }}>Belum ada sensor aktif.</p>
                    <p style={{ fontSize: '0.9rem', color: 'var(--color-text-light)', marginTop: '0.5rem' }}>Daftarkan alat melalui menu Registrasi IoT untuk memulai monitoring.</p>
                    <Button
                        onClick={() => { setEditingSensor(null); setShowModal(true); }}
                        style={{ marginTop: '1.5rem', padding: '0.8rem 2rem' }}
                    >
                        + REGISTRASI SEKARANG
                    </Button>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {sensors.map((sensor, index) => (
                        <div
                            key={sensor.id}
                            className={`animate-stagger-${Math.min(index + 1, 5)}`}
                            style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}
                        >
                            <SensorCard
                                sensor={sensor}
                                onEdit={() => handleEditSensor(sensor)}
                                onDelete={handleDeleteSensor}
                                isSelected={selectedSensorId === sensor.id}
                                onSelect={() => setSelectedSensorId(sensor.id)}
                            />
                            {selectedSensorId === sensor.id && (
                                <SensorChart
                                    sensor={sensor}
                                />
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    return (
        <div className="mobile-container animate-fade-in" style={{ paddingBottom: '90px' }}>
            {/* Header with Back Button */}
            <div className="animate-stagger-1" style={{ marginBottom: '2.5rem' }}>
                <button
                    onClick={() => {
                        if (view === 'menu') {
                            navigate('/dashboard');
                        } else {
                            setView('menu');
                        }
                    }}
                    className="scale-hover"
                    style={{
                        background: 'rgba(255, 255, 255, 0.8)',
                        color: 'var(--color-primary-dark)',
                        padding: '0.7rem 1.4rem',
                        fontSize: '0.85rem',
                        marginBottom: '1.5rem',
                        border: '1.5px solid var(--color-primary-glow)',
                        borderRadius: '14px',
                        cursor: 'pointer',
                        fontWeight: '800',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        boxShadow: 'var(--shadow-soft)',
                        transition: 'all 0.3s ease'
                    }}
                >
                    <span style={{ fontSize: '1.2rem' }}>←</span>
                    {view === 'menu' ? 'KEMBALI KE DASHBOARD' : 'KEMBALI KE MENU IOT'}
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '16px',
                        background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.5rem',
                        boxShadow: 'var(--shadow-glow)'
                    }}>📡</div>
                    <div>
                        <h1 style={{
                            fontSize: '1.8rem',
                            margin: 0,
                            color: 'var(--color-text)',
                            fontWeight: '900',
                            letterSpacing: '-0.8px',
                            lineHeight: '1.1'
                        }}>
                            Layanan IoT
                        </h1>
                        <p style={{
                            color: 'var(--color-text-light)',
                            fontSize: '0.95rem',
                            margin: '4px 0 0 0',
                            fontWeight: '600'
                        }}>
                            {view === 'menu'
                                ? 'Pusat Kendali Perangkat Lapangan'
                                : 'Monitoring Data Lahan Terintegrasi'}
                        </p>
                    </div>
                </div>
            </div>

            <div>
                {view === 'menu' ? renderMenu() : renderMonitoring()}
            </div>

            {showModal && (
                <AddSensorModal
                    onClose={handleCloseModal}
                    sensorToEdit={editingSensor}
                    onAdded={() => {
                        fetchSensors();
                        if (editingSensor) {
                            handleCloseModal();
                        }
                    }}
                />
            )}
        </div>
    );
};

export default IoTMonitoring;
