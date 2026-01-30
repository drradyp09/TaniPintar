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
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            padding: '1rem',
            overflowY: 'auto'
        }}>
            <div className="card" style={{
                width: '100%',
                maxWidth: '500px',
                maxHeight: '95vh',
                overflowY: 'auto',
                margin: '1rem 0'
            }}>
                <h3 className="mb-4">{sensorToEdit ? 'Edit Sensor' : 'Tambah Sensor Baru'}</h3>

                {!token ? (
                    <form onSubmit={handleSubmit}>
                        {error && <div style={{ color: '#d32f2f', marginBottom: '1rem', padding: '0.75rem', background: '#ffebee', borderRadius: '8px', fontSize: '0.85rem' }}>{error}</div>}

                        <Input
                            label="Device ID (Serial Number)"
                            name="device_id"
                            value={formData.device_id}
                            onChange={(e) => setFormData({ ...formData, device_id: e.target.value })}
                            required
                            disabled={!!sensorToEdit} // Disable Device ID when editing
                        />
                        <Input
                            label="Nama Lokasi (Label)"
                            name="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />

                        {/* GPS Location with Map */}
                        <div style={{ marginBottom: '1.25rem' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '0.5rem',
                                fontWeight: '600',
                                color: '#2d3748',
                                fontSize: '0.9rem'
                            }}>
                                Lokasi GPS (Opsional)
                            </label>

                            {!showMap ? (
                                <div style={{
                                    border: '2px solid #e2e8f0',
                                    borderRadius: '12px',
                                    padding: '1rem',
                                    background: '#f7fafc'
                                }}>
                                    <p style={{ fontSize: '0.85rem', color: '#718096', margin: '0 0 0.75rem 0' }}>
                                        {formData.latitude ? 'Lokasi terpilih: ' + formData.latitude.toFixed(6) + ', ' + formData.longitude.toFixed(6) : 'Pilih lokasi sensor pada peta'}
                                    </p>
                                    <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
                                        <button
                                            type="button"
                                            onClick={() => setShowMap(true)}
                                            style={{
                                                padding: '0.75rem 1rem',
                                                background: 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)',
                                                border: 'none',
                                                borderRadius: '8px',
                                                color: 'white',
                                                fontSize: '0.9rem',
                                                cursor: 'pointer',
                                                fontWeight: '600',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '0.5rem'
                                            }}
                                        >
                                            🗺️ {formData.latitude ? 'Ubah Lokasi' : 'Pilih di Peta'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleGetCurrentLocation}
                                            style={{
                                                padding: '0.75rem 1rem',
                                                background: 'white',
                                                border: '2px solid #4caf50',
                                                borderRadius: '8px',
                                                color: '#2e7d32',
                                                fontSize: '0.9rem',
                                                cursor: 'pointer',
                                                fontWeight: '600',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '0.5rem'
                                            }}
                                        >
                                            📍 Gunakan Lokasi Saya
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <MapPicker
                                        latitude={formData.latitude}
                                        longitude={formData.longitude}
                                        onLocationSelect={handleLocationSelect}
                                    />
                                    {formData.latitude && formData.longitude && (
                                        <div style={{
                                            marginTop: '0.75rem',
                                            padding: '0.75rem',
                                            background: '#e8f5e9',
                                            borderRadius: '8px',
                                            fontSize: '0.85rem'
                                        }}>
                                            <div style={{ fontWeight: '600', color: '#2e7d32', marginBottom: '0.25rem' }}>
                                                📍 Lokasi Terpilih:
                                            </div>
                                            <div style={{ fontFamily: 'monospace', color: '#2d3748' }}>
                                                Lat: {formData.latitude.toFixed(6)}<br />
                                                Lng: {formData.longitude.toFixed(6)}
                                            </div>
                                        </div>
                                    )}
                                    <p style={{
                                        fontSize: '0.8rem',
                                        color: '#718096',
                                        marginTop: '0.5rem',
                                        fontStyle: 'italic'
                                    }}>
                                        💡 Klik pada peta untuk memilih lokasi sensor
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Sensor Parameter Selection */}
                        <div style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '0.75rem',
                                fontWeight: '600',
                                color: '#2d3748'
                            }}>
                                Parameter Sensor yang Tersedia:
                            </label>

                            <div style={{
                                border: '2px solid #e2e8f0',
                                borderRadius: '12px',
                                padding: '1rem',
                                background: '#f7fafc',
                                maxHeight: '250px',
                                overflowY: 'auto'
                            }}>
                                {availableSensors.map(sensor => (
                                    <div key={sensor.key} style={{
                                        marginBottom: '0.75rem',
                                        padding: '0.75rem',
                                        background: formData.sensor_config[sensor.key] ? '#e8f5e9' : 'white',
                                        borderRadius: '8px',
                                        border: formData.sensor_config[sensor.key] ? '2px solid #4caf50' : '1px solid #e2e8f0',
                                        transition: 'all 0.2s ease'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <input
                                                type="checkbox"
                                                id={sensor.key}
                                                checked={!!formData.sensor_config[sensor.key]}
                                                onChange={() => handleSensorToggle(sensor.key)}
                                                style={{
                                                    width: '18px',
                                                    height: '18px',
                                                    cursor: 'pointer',
                                                    accentColor: '#4caf50'
                                                }}
                                            />
                                            <label
                                                htmlFor={sensor.key}
                                                style={{
                                                    flex: 1,
                                                    cursor: 'pointer',
                                                    fontWeight: formData.sensor_config[sensor.key] ? '600' : '500',
                                                    color: '#2d3748',
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
                                                        padding: '0.25rem 0.5rem',
                                                        borderRadius: '6px',
                                                        border: '1px solid #cbd5e0',
                                                        fontSize: '0.85rem',
                                                        background: 'white',
                                                        cursor: 'pointer',
                                                        fontWeight: '500'
                                                    }}
                                                >
                                                    {sensor.units.map(unit => (
                                                        <option key={unit} value={unit}>{unit}</option>
                                                    ))}
                                                </select>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <p style={{
                                fontSize: '0.8rem',
                                color: '#718096',
                                marginTop: '0.5rem',
                                fontStyle: 'italic'
                            }}>
                                Pilih parameter yang tersedia pada datalogger Anda
                            </p>
                        </div>

                        <div className="mt-4" style={{ display: 'flex', gap: '10px' }}>
                            <Button type="button" onClick={onClose} style={{ background: '#cbd5e0', color: '#2d3748' }}>Batal</Button>
                            <Button type="submit">Simpan</Button>
                        </div>
                    </form>
                ) : (
                    <div>
                        <div style={{ background: '#e8f5e9', padding: '1rem', borderRadius: '12px', marginBottom: '1rem' }}>
                            <p style={{ margin: 0, color: '#2e7d32', fontWeight: 'bold', fontSize: '1.1rem' }}>✅ Registrasi Berhasil!</p>
                            <p style={{ fontSize: '0.9rem', marginTop: '0.75rem', color: '#2d3748' }}>Simpan Token ini di datalogger Anda:</p>
                            <code style={{
                                display: 'block',
                                wordBreak: 'break-all',
                                background: '#fff',
                                padding: '0.75rem',
                                border: '2px solid #4caf50',
                                borderRadius: '8px',
                                marginTop: '0.5rem',
                                fontFamily: 'monospace',
                                fontSize: '0.85rem'
                            }}>
                                {token}
                            </code>
                        </div>
                        <Button onClick={onClose}>Tutup</Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AddSensorModal;
