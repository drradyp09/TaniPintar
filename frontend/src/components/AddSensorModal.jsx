import React, { useState, useEffect } from 'react';
import Input from './Input';
import Button from './Button';
import MapPicker from './MapPicker';
import { AUTH_BASE_URL } from '../apiConfig';

const AddSensorModal = ({ onClose, onAdded, sensorToEdit = null }) => {
    const [formData, setFormData] = useState({
        device_id: '',
        name: '',
        sensor_config: {},
        latitude: null,
        longitude: null
    });
    const [token, setToken] = useState('');
    const [error, setError] = useState('');
    const [showMap, setShowMap] = useState(false);

    // Initialize form data if editing
    useEffect(() => {
        if (sensorToEdit) {
            setFormData({
                device_id: sensorToEdit.device_id,
                name: sensorToEdit.name,
                sensor_config: sensorToEdit.sensor_config || {},
                latitude: sensorToEdit.latitude,
                longitude: sensorToEdit.longitude
            });
            // If editing and location exists, we could show map, but let's keep it clean
            // Users can click "Pilih di Peta" to update location
        }
    }, [sensorToEdit]);

    // Available sensor parameters with units
    const availableSensors = [
        { key: 'temperature', label: 'Suhu', units: ['°C', '°F', 'K'] },
        { key: 'humidity', label: 'Kelembaban', units: ['%', 'g/m³'] },
        { key: 'soil_ph', label: 'pH Tanah', units: ['pH'] },
        { key: 'soil_moisture', label: 'Kelembaban Tanah', units: ['%', 'kPa'] },
        { key: 'light_intensity', label: 'Intensitas Cahaya', units: ['lux', 'W/m²'] },
        { key: 'rainfall', label: 'Curah Hujan', units: ['mm', 'inch'] },
        { key: 'wind_speed', label: 'Kecepatan Angin', units: ['m/s', 'km/h', 'mph'] },
        { key: 'pressure', label: 'Tekanan Udara', units: ['hPa', 'mmHg', 'atm'] }
    ];

    const handleLocationSelect = (lat, lng) => {
        setFormData({
            ...formData,
            latitude: lat,
            longitude: lng
        });
    };

    const handleGetCurrentLocation = () => {
        if (!navigator.geolocation) {
            setError('Browser Anda tidak mendukung Geolocation');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setFormData({
                    ...formData,
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                });
                setShowMap(true);
            },
            (error) => {
                setError('Tidak dapat mengambil lokasi. Silakan pilih manual di peta.');
                setShowMap(true);
            }
        );
    };

    const handleSensorToggle = (sensorKey) => {
        const newConfig = { ...formData.sensor_config };
        if (newConfig[sensorKey]) {
            delete newConfig[sensorKey];
        } else {
            const sensor = availableSensors.find(s => s.key === sensorKey);
            newConfig[sensorKey] = {
                enabled: true,
                unit: sensor.units[0]
            };
        }
        setFormData({ ...formData, sensor_config: newConfig });
    };

    const handleUnitChange = (sensorKey, unit) => {
        const newConfig = { ...formData.sensor_config };
        if (newConfig[sensorKey]) {
            newConfig[sensorKey].unit = unit;
        }
        setFormData({ ...formData, sensor_config: newConfig });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (Object.keys(formData.sensor_config).length === 0) {
            setError('Pilih minimal satu parameter sensor');
            return;
        }

        const url = sensorToEdit
            ? `${AUTH_BASE_URL}/sensors/${sensorToEdit.id}`
            : `${AUTH_BASE_URL}/sensors/register`;

        const method = sensorToEdit ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
                credentials: 'include'
            });

            const data = await response.json();

            if (response.ok) {
                if (!sensorToEdit) {
                    setToken(data.token);
                } else {
                    onAdded(); // Just refresh/close for edit
                }

                // If editing, usually we don't show token again, so we can just close
                if (sensorToEdit) {
                    onAdded();
                }
            } else {
                setError(data.error || 'Failed to save sensor');
            }
        } catch (err) {
            setError('Network error');
        }
    };

    return (
        <div className="animate-fade-in" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            padding: '1.5rem',
            overflowY: 'auto'
        }}>
            <div className="glass-card" style={{
                width: '100%',
                maxWidth: '520px',
                maxHeight: '90vh',
                overflowY: 'auto',
                margin: 'auto',
                padding: '2.5rem',
                background: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid var(--color-primary-glow)',
                boxShadow: 'var(--shadow-glow)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h3 style={{
                        fontSize: '1.6rem',
                        fontWeight: '800',
                        color: 'var(--color-primary-dark)',
                        margin: 0,
                        letterSpacing: '-0.5px'
                    }}>
                        {sensorToEdit ? '🔧 Perbarui Perangkat' : '🚀 Registrasi IoT Baru'}
                    </h3>
                    <p style={{ color: 'var(--color-text-light)', fontSize: '0.9rem', marginTop: '0.5rem', fontWeight: '500' }}>
                        Konfigurasikan detail perangkat datalogger Anda
                    </p>
                </div>

                {!token ? (
                    <form onSubmit={handleSubmit} className="animate-stagger-1">
                        {error && (
                            <div className="animate-fade-in" style={{
                                color: 'var(--color-error)',
                                marginBottom: '1.5rem',
                                padding: '0.8rem',
                                background: 'rgba(211, 47, 47, 0.05)',
                                borderRadius: '10px',
                                fontSize: '0.85rem',
                                fontWeight: '700',
                                border: '1px solid rgba(211, 47, 47, 0.1)',
                                textAlign: 'center'
                            }}>
                                ⚠️ {error}
                            </div>
                        )}

                        <Input
                            label="Device ID / Serial Number"
                            name="device_id"
                            placeholder="Contoh: SN-2024-XX"
                            value={formData.device_id}
                            onChange={(e) => setFormData({ ...formData, device_id: e.target.value })}
                            required
                            disabled={!!sensorToEdit}
                        />
                        <Input
                            label="Nama Lokasi / Label Alat"
                            name="name"
                            placeholder="Contoh: Lahan Bawang Selatan"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />

                        {/* GPS Location with Map Picker */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '0.6rem',
                                fontWeight: '800',
                                color: 'var(--color-text)',
                                fontSize: '0.9rem'
                            }}>
                                LOKASI GEOGRAFIS (OPSIONAL)
                            </label>

                            {!showMap ? (
                                <div style={{
                                    border: '1.5px dashed var(--color-primary-glow)',
                                    borderRadius: '14px',
                                    padding: '1.2rem',
                                    background: 'rgba(248, 250, 252, 0.5)',
                                    textAlign: 'center'
                                }}>
                                    {formData.latitude ? (
                                        <div style={{ marginBottom: '1rem' }}>
                                            <div style={{ fontSize: '0.9rem', color: 'var(--color-primary-dark)', fontWeight: '800' }}>
                                                📍 {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
                                            </div>
                                            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-light)', margin: '4px 0 0 0' }}>Lokasi saat ini telah terkunci</p>
                                        </div>
                                    ) : (
                                        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', margin: '0 0 1rem 0', fontWeight: '500' }}>
                                            Tentukan titik pemasangan alat untuk visualisasi peta.
                                        </p>
                                    )}
                                    <div style={{ display: 'flex', gap: '0.8rem', flexDirection: 'column' }}>
                                        <button
                                            type="button"
                                            onClick={() => setShowMap(true)}
                                            className="btn"
                                            style={{
                                                padding: '0.75rem',
                                                fontSize: '0.85rem'
                                            }}
                                        >
                                            🗺️ {formData.latitude ? 'UBAH POSISI DI PETA' : 'PILIH POSISI DI PETA'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleGetCurrentLocation}
                                            className="scale-hover"
                                            style={{
                                                padding: '0.75rem',
                                                background: 'var(--color-white)',
                                                border: '2px solid var(--color-primary)',
                                                borderRadius: '10px',
                                                color: 'var(--color-primary)',
                                                fontSize: '0.85rem',
                                                cursor: 'pointer',
                                                fontWeight: '800'
                                            }}
                                        >
                                            📍 GUNAKAN LOKASI SAYA
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="animate-fade-in">
                                    <div style={{ borderRadius: '14px', overflow: 'hidden', border: '2px solid var(--color-primary-glow)', boxShadow: 'var(--shadow-soft)' }}>
                                        <MapPicker
                                            latitude={formData.latitude}
                                            longitude={formData.longitude}
                                            onLocationSelect={handleLocationSelect}
                                        />
                                    </div>
                                    <p style={{
                                        fontSize: '0.8rem',
                                        color: 'var(--color-primary-dark)',
                                        marginTop: '0.8rem',
                                        fontWeight: '700',
                                        textAlign: 'center'
                                    }}>
                                        💡 Klik/Tap pada peta untuk memindahkan titik.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Sensor Parameter Selection */}
                        <div style={{ marginTop: '2rem', marginBottom: '2rem' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '0.8rem',
                                fontWeight: '800',
                                color: 'var(--color-text)',
                                fontSize: '0.9rem'
                            }}>
                                KONFIGURASI PARAMETER SENSOR:
                            </label>

                            <div style={{
                                border: '1px solid var(--color-primary-glow)',
                                borderRadius: '16px',
                                padding: '1rem',
                                background: 'rgba(248, 250, 252, 0.3)',
                                maxHeight: '280px',
                                overflowY: 'auto',
                                display: 'grid',
                                gridTemplateColumns: '1fr',
                                gap: '0.6rem'
                            }}>
                                {availableSensors.map(sensor => (
                                    <div key={sensor.key} className="scale-hover" style={{
                                        padding: '0.8rem 1rem',
                                        background: formData.sensor_config[sensor.key] ? 'rgba(76, 175, 80, 0.08)' : 'var(--color-white)',
                                        borderRadius: '12px',
                                        border: formData.sensor_config[sensor.key] ? '2.5px solid var(--color-primary)' : '1px solid rgba(0,0,0,0.05)',
                                        transition: 'all 0.3s ease',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.8rem'
                                    }}>
                                        <input
                                            type="checkbox"
                                            id={sensor.key}
                                            checked={!!formData.sensor_config[sensor.key]}
                                            onChange={() => handleSensorToggle(sensor.key)}
                                            style={{
                                                width: '22px',
                                                height: '22px',
                                                cursor: 'pointer',
                                                accentColor: 'var(--color-primary)'
                                            }}
                                        />
                                        <label
                                            htmlFor={sensor.key}
                                            style={{
                                                flex: 1,
                                                cursor: 'pointer',
                                                fontWeight: '800',
                                                color: formData.sensor_config[sensor.key] ? 'var(--color-primary-dark)' : 'var(--color-text)',
                                                fontSize: '0.9rem'
                                            }}
                                        >
                                            {sensor.label}
                                        </label>

                                        {formData.sensor_config[sensor.key] && (
                                            <select
                                                value={formData.sensor_config[sensor.key].unit}
                                                onChange={(e) => handleUnitChange(sensor.key, e.target.value)}
                                                style={{
                                                    padding: '0.4rem 0.6rem',
                                                    borderRadius: '8px',
                                                    border: '1px solid var(--color-primary-glow)',
                                                    fontSize: '0.85rem',
                                                    background: 'var(--color-white)',
                                                    cursor: 'pointer',
                                                    fontWeight: '700',
                                                    color: 'var(--color-primary-dark)'
                                                }}
                                            >
                                                {sensor.units.map(unit => (
                                                    <option key={unit} value={unit}>{unit}</option>
                                                ))}
                                            </select>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '2.5rem' }}>
                            <Button type="button" onClick={onClose} style={{ background: 'rgba(226, 232, 240, 0.8)', color: 'var(--color-text)', fontWeight: '700' }}>BATAL</Button>
                            <Button type="submit" style={{ fontWeight: '900' }}>SIMPAN PERANGKAT</Button>
                        </div>
                    </form>
                ) : (
                    <div className="animate-fade-in" style={{ textAlign: 'center' }}>
                        <div style={{
                            background: 'rgba(76, 175, 80, 0.05)',
                            padding: '2rem',
                            borderRadius: '20px',
                            marginBottom: '2rem',
                            border: '1.5px solid var(--color-primary-glow)'
                        }}>
                            <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>✅</div>
                            <h4 style={{ margin: 0, color: 'var(--color-primary-dark)', fontWeight: '900', fontSize: '1.4rem' }}>Registrasi Berhasil!</h4>
                            <p style={{ fontSize: '0.95rem', marginTop: '1rem', color: 'var(--color-text-light)', fontWeight: '500', lineHeight: '1.5' }}>
                                Gunakan <b>API Token</b> di bawah ini untuk menghubungkan perangkat datalogger Anda ke platform TaniPintar:
                            </p>

                            <div style={{ position: 'relative', marginTop: '1.5rem' }}>
                                <code style={{
                                    display: 'block',
                                    wordBreak: 'break-all',
                                    background: 'var(--color-white)',
                                    padding: '1.2rem',
                                    border: '2px solid var(--color-primary)',
                                    borderRadius: '12px',
                                    fontFamily: 'monospace',
                                    fontSize: '0.9rem',
                                    fontWeight: '700',
                                    color: 'var(--color-primary-dark)',
                                    textAlign: 'left',
                                    boxShadow: 'var(--shadow-glow)'
                                }}>
                                    {token}
                                </code>
                                <div style={{
                                    marginTop: '1rem',
                                    padding: '8px',
                                    borderRadius: '8px',
                                    background: 'rgba(255, 152, 0, 0.1)',
                                    color: '#e65100',
                                    fontSize: '0.75rem',
                                    fontWeight: '800'
                                }}>
                                    ⚠️ PENTING: Salin dan simpan token ini sekarang.
                                </div>
                            </div>
                        </div>
                        <Button onClick={onClose} style={{ width: '100%', padding: '1rem', fontWeight: '900' }}>LANJUT KE DASHBOARD</Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AddSensorModal;
