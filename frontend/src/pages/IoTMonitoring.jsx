import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import SensorCard from '../components/SensorCard';
import AddSensorModal from '../components/AddSensorModal';
import SensorChart from '../components/SensorChart';

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
            const response = await fetch('http://localhost:5000/api/auth/sensors', { credentials: 'include' });

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
            const response = await fetch(`http://localhost:5000/api/auth/sensors/${sensorId}`, {
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
            gap: '1.5rem',
            marginTop: '2rem'
        }}>
            <div
                className="card text-center"
                onClick={() => {
                    setEditingSensor(null);
                    setShowModal(true);
                }}
                style={{
                    padding: '3rem 2rem',
                    cursor: 'pointer',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    border: '2px dashed #2e7d32',
                    background: '#f1f8e9'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                    e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
                }}
            >
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>➕</div>
                <h3 style={{ color: '#2e7d32', marginBottom: '0.5rem' }}>Tambah Perangkat IoT</h3>
                <p style={{ fontSize: '0.9rem', color: '#666' }}>
                    Daftarkan perangkat datalogger baru untuk mulai memantau lahan Anda.
                </p>
            </div>

            <div
                className="card text-center"
                onClick={() => setView('monitoring')}
                style={{
                    padding: '3rem 2rem',
                    cursor: 'pointer',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    border: '1px solid #e2e8f0',
                    background: 'white'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                    e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
                }}
            >
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
                <h3 style={{ color: '#2d3748', marginBottom: '0.5rem' }}>Monitoring & Histori</h3>
                <p style={{ fontSize: '0.9rem', color: '#666' }}>
                    Lihat data real-time dan riwayat sensor yang telah terpasang di lapangan.
                </p>
            </div>
        </div>
    );

    const renderMonitoring = () => (
        <>
            {sensors.length === 0 ? (
                <div className="card text-center" style={{ padding: '3rem 1rem' }}>
                    <p style={{ color: '#888' }}>Belum ada sensor yang terhubung.</p>
                    <p style={{ fontSize: '0.9rem' }}>Klik tombol Tambah Perangkat untuk mendaftarkan alat.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {sensors.map(sensor => (
                        <div key={sensor.id} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
        </>
    );

    return (
        <div className="container" style={{ marginTop: '2rem', paddingBottom: '4rem' }}>
            {/* Header with Back Button */}
            <div style={{ marginBottom: '2rem' }}>
                <button
                    onClick={() => {
                        if (view === 'menu') {
                            navigate('/dashboard');
                        } else {
                            setView('menu');
                        }
                    }}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: '#2e7d32',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 0',
                        marginBottom: '1rem'
                    }}
                >
                    ← Kembali {view === 'menu' ? 'ke Dashboard' : 'ke Menu IoT'}
                </button>
                <h1 style={{ fontSize: '1.5rem', margin: 0 }}>📊 Monitoring & Histori</h1>
                <p style={{ color: '#666', fontSize: '0.9rem', margin: '0.5rem 0 0 0' }}>
                    {view === 'menu'
                        ? 'Pilih layanan IoT TaniPintar'
                        : 'Pantau sensor dan data lahan secara real-time'}
                </p>
            </div>

            {view === 'menu' ? renderMenu() : renderMonitoring()}

            {showModal && (
                <AddSensorModal
                    onClose={handleCloseModal}
                    sensorToEdit={editingSensor}
                    onAdded={() => {
                        fetchSensors();
                        if (editingSensor) {
                            handleCloseModal(); // Close immediately if editing
                        }
                        // If adding, stay open for token (handled inside modal content usually, but logic in modal was to show token)
                    }}
                />
            )}
        </div>
    );
};

export default IoTMonitoring;
