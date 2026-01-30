import React, { useState } from 'react';
import { API_BASE_URL } from '../apiConfig';

const SensorCard = ({ sensor, onEdit, onDelete, isSelected, onSelect }) => {
    const [showToken, setShowToken] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleCopyToken = () => {
        navigator.clipboard.writeText(sensor.token || 'Token not available');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDelete = (e) => {
        e.stopPropagation();
        if (window.confirm(`Apakah Anda yakin ingin menghapus sensor "${sensor.name}"? Semua data riwayat akan ikut terhapus secara permanen.`)) {
            onDelete(sensor.id);
        }
    };

    return (
        <div
            onClick={onSelect}
            style={{
                background: 'white',
                borderRadius: '12px',
                padding: '1.25rem',
                marginBottom: '1rem',
                border: isSelected ? '2px solid #4caf50' : '2px solid #e2e8f0',
                borderLeft: '4px solid #4caf50',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: isSelected ? '0 4px 12px rgba(76, 175, 80, 0.15)' : 'none',
                transform: isSelected ? 'translateY(-2px)' : 'none'
            }}
        >
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '1rem'
            }}>
                <div style={{ flex: 1 }}>
                    <h3 style={{
                        fontSize: '1.1rem',
                        fontWeight: '700',
                        color: '#2d3748',
                        margin: '0 0 0.25rem 0'
                    }}>
                        {sensor.name}
                    </h3>
                    <p style={{
                        fontSize: '0.85rem',
                        color: '#718096',
                        margin: 0,
                        fontFamily: 'monospace'
                    }}>
                        ID: {sensor.device_id}
                    </p>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                        onClick={(e) => { e.stopPropagation(); onEdit(); }}
                        style={{
                            padding: '0.5rem',
                            background: '#edf2f7',
                            border: '1px solid #cbd5e0',
                            borderRadius: '8px',
                            color: '#4a5568',
                            fontSize: '0.8rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s ease'
                        }}
                        title="Edit Sensor"
                    >
                        ✏️
                    </button>
                    <button
                        onClick={handleDelete}
                        style={{
                            padding: '0.5rem',
                            background: '#fff5f5',
                            border: '1px solid #feb2b2',
                            borderRadius: '8px',
                            color: '#c53030',
                            fontSize: '0.8rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s ease'
                        }}
                        title="Hapus Sensor"
                    >
                        🗑️
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); setShowToken(!showToken); }}
                        style={{
                            padding: '0.5rem 1rem',
                            background: showToken ? '#f7fafc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            border: showToken ? '2px solid #667eea' : 'none',
                            borderRadius: '8px',
                            color: showToken ? '#667eea' : 'white',
                            fontSize: '0.8rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        {showToken ? '🔒' : '🔑 Lihat Token'}
                    </button>
                </div>
            </div>

            {/* IoT Connectivity Guide */}
            {showToken && (
                <div style={{
                    background: '#f8fafc',
                    border: '2px solid #667eea',
                    borderRadius: '12px',
                    padding: '1.25rem',
                    marginBottom: '1rem',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h4 style={{ margin: 0, color: '#2d3748', fontSize: '1rem', fontWeight: '800' }}>🚀 Panduan Konektivitas IoT</h4>
                        <button
                            onClick={() => setShowToken(false)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}
                        >✕</button>
                    </div>

                    {/* 1. API Token */}
                    <div style={{ marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#4a5568' }}>🔑 API Token (X-Sensor-Token)</span>
                            <button
                                onClick={handleCopyToken}
                                style={{
                                    padding: '0.2rem 0.6rem',
                                    background: copied ? '#4caf50' : '#ebf4ff',
                                    border: '1px solid #667eea',
                                    borderRadius: '6px',
                                    color: copied ? 'white' : '#667eea',
                                    fontSize: '0.7rem',
                                    fontWeight: '700',
                                    cursor: 'pointer'
                                }}
                            >
                                {copied ? '✓ Copied' : '📋 Copy'}
                            </button>
                        </div>
                        <code style={{ display: 'block', wordBreak: 'break-all', background: '#ffffff', padding: '0.6rem', borderRadius: '6px', fontSize: '0.75rem', border: '1px solid #e2e8f0', color: '#2d3748', fontFamily: 'monospace' }}>
                            {sensor.token}
                        </code>
                    </div>

                    {/* 2. Endpoint & Payload */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                        <div>
                            <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#4a5568', display: 'block', marginBottom: '0.4rem' }}>🌐 API Endpoint</span>
                            <code style={{ display: 'block', background: '#ffffff', padding: '0.6rem', borderRadius: '6px', fontSize: '0.75rem', border: '1px solid #e2e8f0', color: '#2d3748' }}>
                                POST /api/auth/v1/telemetry
                            </code>
                        </div>
                        <div>
                            <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#4a5568', display: 'block', marginBottom: '0.4rem' }}>📦 Payload JSON</span>
                            <code style={{ display: 'block', background: '#ffffff', padding: '0.6rem', borderRadius: '6px', fontSize: '0.7rem', border: '1px solid #e2e8f0', color: '#2d3748', whiteSpace: 'pre-wrap' }}>
                                {(() => {
                                    const config = sensor.sensor_config || { temperature: { enabled: true }, humidity: { enabled: true } };
                                    const payload = {};
                                    Object.keys(config).forEach(k => { if (config[k].enabled) payload[k] = 0.0; });
                                    payload["timestamp"] = "ISO-8601";
                                    return JSON.stringify(payload, null, 2);
                                })()}
                            </code>
                        </div>
                    </div>

                    {/* 3. Example Command */}
                    <div>
                        <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#4a5568', display: 'block', marginBottom: '0.4rem' }}>💻 Contoh Perintah (PowerShell)</span>
                        <div style={{ position: 'relative' }}>
                            <pre style={{
                                margin: 0,
                                background: '#2d3748',
                                color: '#a0aec0',
                                padding: '1rem',
                                borderRadius: '8px',
                                fontSize: '0.7rem',
                                overflowX: 'auto',
                                border: '1px solid #1a202c',
                                fontFamily: 'monospace',
                                lineHeight: '1.4'
                            }}>
                                {`Invoke-RestMethod -Uri "${API_BASE_URL}/v1/telemetry" \`
-Method Post \`
-Headers @{"X-Sensor-Token"="${sensor.token}"} \`
-ContentType "application/json" \`
-Body '${(() => {
                                        const config = sensor.sensor_config || { temperature: { enabled: true }, humidity: { enabled: true } };
                                        const payload = {};
                                        Object.keys(config).forEach(k => { if (config[k].enabled) payload[k] = 25.0; });
                                        return JSON.stringify(payload);
                                    })()}'`}
                            </pre>
                            <button
                                onClick={() => {
                                    const config = sensor.sensor_config || { temperature: { enabled: true }, humidity: { enabled: true } };
                                    const p = {}; Object.keys(config).forEach(k => { if (config[k].enabled) p[k] = 25.0; });
                                    const cmd = `Invoke-RestMethod -Uri "${API_BASE_URL}/v1/telemetry" \`-Method Post \`-Headers @{"X-Sensor-Token"="${sensor.token}"} \`-ContentType "application/json" \`-Body '${JSON.stringify(p)}'`;
                                    navigator.clipboard.writeText(cmd.replace(/`/g, '`\n'));
                                }}
                                style={{
                                    position: 'absolute',
                                    top: '0.5rem',
                                    right: '0.5rem',
                                    padding: '0.3rem 0.5rem',
                                    background: 'rgba(255,255,255,0.1)',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    borderRadius: '4px',
                                    color: 'white',
                                    fontSize: '0.65rem',
                                    cursor: 'pointer'
                                }}
                            >Salin Perintah</button>
                        </div>
                        <p style={{ fontSize: '0.7rem', color: '#718096', marginTop: '0.75rem', fontStyle: 'italic' }}>
                            💡 Gunakan panduan ini untuk mengintegrasikan alat (ESP32, Arduino, dll) Anda dengan platform TaniPintar.
                        </p>
                    </div>
                </div>
            )}

            {/* Sensor Data */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                gap: '0.75rem',
                marginBottom: '0.75rem'
            }}>
                {sensor.latest_data ? (
                    (() => {
                        const paramMetadata = {
                            temperature: { label: 'Suhu', unit: '°C', bg: '#fff3e0', text: '#e65100', border: '#ffe0b2' },
                            humidity: { label: 'Kelembaban', unit: '%', bg: '#e3f2fd', text: '#0277bd', border: '#bbdefb' },
                            soil_ph: { label: 'pH Tanah', unit: '', bg: '#f3e5f5', text: '#6a1b9a', border: '#e1bee7' },
                            rainfall: { label: 'Curah Hujan', unit: 'mm', bg: '#e0f7fa', text: '#006064', border: '#b2ebf2' },
                            wind_speed: { label: 'Kecepatan Angin', unit: 'm/s', bg: '#f1f8e9', text: '#33691e', border: '#dcedc8' },
                            soil_moisture: { label: 'Kelembaban Tanah', unit: '%', bg: '#e8eaf6', text: '#1a237e', border: '#c5cae9' },
                            light_intensity: { label: 'Intensitas Cahaya', unit: 'lux', bg: '#fffde7', text: '#f57f17', border: '#fff9c4' },
                            pressure: { label: 'Tekanan Udara', unit: 'hPa', bg: '#efebe9', text: '#3e2723', border: '#d7ccc8' }
                        };

                        // Define which keys to show based on config OR data availability
                        const config = sensor.sensor_config || {};
                        const hasConfig = Object.keys(config).length > 0;

                        // If has config, show key if enabled. If no config (old), show if data exists.
                        const keys = Object.keys(paramMetadata);
                        const dataToShow = keys.filter(key => {
                            if (hasConfig) {
                                return config[key] && config[key].enabled;
                            }
                            return sensor.latest_data[key] !== null && sensor.latest_data[key] !== undefined;
                        });

                        if (dataToShow.length === 0) {
                            return <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '1rem', color: '#718096', fontSize: '0.85rem', fontStyle: 'italic' }}>Belum ada data parameter</div>;
                        }

                        return dataToShow.map(key => {
                            const meta = paramMetadata[key];
                            const value = sensor.latest_data[key];
                            return (
                                <div key={key} style={{
                                    background: meta.bg,
                                    padding: '0.75rem',
                                    borderRadius: '8px',
                                    border: `1px solid ${meta.border}`
                                }}>
                                    <div style={{ fontSize: '0.75rem', color: meta.text, marginBottom: '0.25rem' }}>{meta.label}</div>
                                    <div style={{ fontSize: '1.25rem', fontWeight: '700', color: meta.text }}>
                                        {typeof value === 'number' ? value.toFixed(1) : value}{meta.unit}
                                    </div>
                                </div>
                            );
                        });
                    })()
                ) : (
                    <div style={{
                        gridColumn: '1 / -1',
                        textAlign: 'center',
                        padding: '1rem',
                        color: '#718096',
                        fontSize: '0.85rem',
                        fontStyle: 'italic'
                    }}>
                        Belum ada data
                    </div>
                )}
            </div>

            {/* GPS Location */}
            {(sensor.latitude && sensor.longitude) && (
                <div style={{
                    background: '#e8f5e9',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    color: '#2e7d32',
                    marginTop: '0.75rem'
                }}>
                    📍 Lokasi: {sensor.latitude.toFixed(6)}, {sensor.longitude.toFixed(6)}
                </div>
            )}

            {/* Last Update */}
            {sensor.latest_data && (
                <div style={{
                    fontSize: '0.75rem',
                    color: '#a0aec0',
                    marginTop: '0.75rem',
                    fontStyle: 'italic'
                }}>
                    Last Update: {sensor.latest_data.timestamp ? new Date(sensor.latest_data.timestamp).toLocaleString('id-ID') : 'Belum ada data'}
                </div>
            )}
        </div>
    );
};

export default SensorCard;
