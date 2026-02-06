import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../apiConfig';

const DiseaseDetection = () => {
    const navigate = useNavigate();
    const [image, setImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [mode, setMode] = useState('disease'); // 'disease' or 'chlorophyll'
    const fileInputRef = useRef(null);

    const handleBack = () => {
        navigate('/dashboard');
    };

    const handleCameraClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreviewUrl(URL.createObjectURL(file));
            setResult(null);
        }
    };

    const handleAnalyze = async () => {
        if (!image) return;

        setLoading(true);
        const formData = new FormData();
        formData.append('image', image);
        formData.append('type', mode);

        try {
            const response = await fetch(`${API_BASE_URL}/auth/disease-detection/analyze`, {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                setResult(data.result);

                // Update preview with masked image if available
                if (data.segmentation && data.segmentation.masked_image) {
                    setPreviewUrl(`data:image/jpeg;base64,${data.segmentation.masked_image}`);
                }
            } else {
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.error || errorData.message || 'Gagal menganalisis gambar.';
                alert(`Error (${response.status}): ${errorMessage}`);
            }
        } catch (error) {
            console.error('Error analyzing image:', error);
            alert('Terjadi kesalahan koneksi.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(to bottom, #f8f9fa 0%, #e9ecef 100%)',
            padding: '1rem'
        }}>
            {/* Mobile Container */}
            <div style={{
                maxWidth: '480px',
                margin: '0 auto'
            }}>
                {/* Header */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    marginBottom: '1rem',
                    background: 'white',
                    padding: '1rem',
                    borderRadius: '16px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                }}>
                    <button
                        onClick={handleBack}
                        style={{
                            background: '#f1f5f9',
                            border: 'none',
                            borderRadius: '50%',
                            width: '40px',
                            height: '40px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            fontSize: '1.2rem'
                        }}
                    >
                        ⬅️
                    </button>
                    <h1 style={{
                        fontSize: '1.25rem',
                        margin: 0,
                        color: '#2d3748',
                        fontWeight: '700'
                    }}>
                        Plant Detection
                    </h1>
                </div>

                {/* Mode Selector */}
                <div style={{
                    display: 'flex',
                    background: '#e2e8f0',
                    padding: '4px',
                    borderRadius: '12px',
                    marginBottom: '1.5rem'
                }}>
                    <button
                        onClick={() => { setMode('disease'); setResult(null); }}
                        style={{
                            flex: 1,
                            padding: '0.75rem',
                            border: 'none',
                            borderRadius: '10px',
                            background: mode === 'disease' ? 'white' : 'transparent',
                            color: mode === 'disease' ? '#2e7d32' : '#718096',
                            fontWeight: '700',
                            fontSize: '0.9rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            boxShadow: mode === 'disease' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none'
                        }}
                    >
                        🔍 Deteksi Penyakit
                    </button>
                    <button
                        onClick={() => { setMode('chlorophyll'); setResult(null); }}
                        style={{
                            flex: 1,
                            padding: '0.75rem',
                            border: 'none',
                            borderRadius: '10px',
                            background: mode === 'chlorophyll' ? 'white' : 'transparent',
                            color: mode === 'chlorophyll' ? '#2e7d32' : '#718096',
                            fontWeight: '700',
                            fontSize: '0.9rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            boxShadow: mode === 'chlorophyll' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none'
                        }}
                    >
                        🌿 Kadar Klorofil
                    </button>
                </div>

                {/* Main Content */}
                <div style={{
                    background: 'white',
                    borderRadius: '20px',
                    padding: '1.5rem',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    textAlign: 'center'
                }}>
                    {!previewUrl ? (
                        <div
                            onClick={handleCameraClick}
                            style={{
                                height: '240px',
                                border: '2px dashed #cbd5e0',
                                borderRadius: '16px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '1rem',
                                color: '#718096',
                                cursor: 'pointer',
                                background: '#f8fafc'
                            }}
                        >
                            <div style={{ fontSize: '3rem' }}>📸</div>
                            <p style={{ margin: 0, fontWeight: '600' }}>
                                {mode === 'disease' ? 'Foto Daun Bergejala' : 'Foto Daun Untuk Klorofil'}
                            </p>
                            <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.7 }}>
                                Gunakan kamera untuk hasil terbaik
                            </p>
                        </div>
                    ) : (
                        <div style={{ position: 'relative' }}>
                            <img
                                src={previewUrl}
                                alt="Preview"
                                style={{
                                    width: '100%',
                                    borderRadius: '16px',
                                    maxHeight: '400px',
                                    objectFit: 'cover',
                                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                                }}
                            />
                            <button
                                onClick={() => {
                                    setPreviewUrl(null);
                                    setImage(null);
                                    setResult(null);
                                    if (fileInputRef.current) fileInputRef.current.value = '';
                                }}
                                style={{
                                    position: 'absolute',
                                    top: '10px',
                                    right: '10px',
                                    background: 'rgba(255,255,255,0.9)',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: '32px',
                                    height: '32px',
                                    cursor: 'pointer',
                                    fontSize: '1rem',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                }}
                            >
                                ✕
                            </button>
                        </div>
                    )}

                    <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                    />

                    {previewUrl && !result && (
                        <button
                            onClick={handleAnalyze}
                            disabled={loading}
                            style={{
                                marginTop: '1.5rem',
                                width: '100%',
                                padding: '1rem',
                                borderRadius: '12px',
                                border: 'none',
                                background: 'linear-gradient(135deg, #2e7d32 0%, #66bb6a 100%)',
                                color: 'white',
                                fontWeight: '700',
                                fontSize: '1rem',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                boxShadow: '0 4px 10px rgba(46, 125, 50, 0.3)',
                                opacity: loading ? 0.7 : 1
                            }}
                        >
                            {loading ? 'Menganalisis...' : 'Analisis Sekarang'}
                        </button>
                    )}

                    {result && (
                        <div style={{
                            marginTop: '2rem',
                            textAlign: 'left',
                            padding: '1.25rem',
                            borderRadius: '16px',
                            background: '#f0fff4',
                            border: '1px solid #c6f6d5'
                        }}>
                            <h3 style={{
                                color: '#276749',
                                margin: '0 0 0.5rem 0',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}>
                                📋 Hasil {mode === 'disease' ? 'Analisis' : 'Pengukuran'}
                            </h3>

                            {mode === 'disease' ? (
                                <>
                                    <div style={{ marginBottom: '1rem' }}>
                                        <div style={{ fontSize: '0.85rem', color: '#4a5568' }}>Penyakit Terdeteksi:</div>
                                        <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#2d3748' }}>
                                            {result.name}
                                        </div>
                                    </div>

                                    <div style={{ marginBottom: '1rem' }}>
                                        <div style={{ fontSize: '0.85rem', color: '#4a5568' }}>Keyakinan Model:</div>
                                        <div style={{
                                            width: '100%',
                                            height: '8px',
                                            background: '#e2e8f0',
                                            borderRadius: '4px',
                                            marginTop: '4px',
                                            overflow: 'hidden'
                                        }}>
                                            <div style={{
                                                width: `${result.confidence * 100}%`,
                                                height: '100%',
                                                background: '#38a169',
                                                borderRadius: '4px'
                                            }}></div>
                                        </div>
                                        <div style={{ textAlign: 'right', fontSize: '0.75rem', marginTop: '2px', color: '#718096' }}>
                                            {(result.confidence * 100).toFixed(1)}%
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    padding: '1rem 0',
                                    background: 'white',
                                    borderRadius: '12px',
                                    marginBottom: '1rem',
                                    border: '1px solid #e2e8f0'
                                }}>
                                    <div style={{ fontSize: '0.9rem', color: '#718096' }}>Estimasi Kadar Klorofil</div>
                                    <div style={{ fontSize: '3rem', fontWeight: '900', color: '#2e7d32' }}>
                                        {result.value}
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: '#4a5568', fontWeight: '600' }}>
                                        {result.unit}
                                    </div>
                                    <div style={{
                                        marginTop: '0.5rem',
                                        padding: '4px 12px',
                                        borderRadius: '20px',
                                        background: result.status === 'Normal' ? '#c6f6d5' : '#fed7d7',
                                        color: result.status === 'Normal' ? '#22543d' : '#822727',
                                        fontSize: '0.75rem',
                                        fontWeight: '700'
                                    }}>
                                        Status: {result.status}
                                    </div>
                                </div>
                            )}

                            <div style={{
                                background: 'white',
                                padding: '1rem',
                                borderRadius: '12px',
                                marginTop: '1rem',
                                borderLeft: '4px solid #38a169'
                            }}>
                                <div style={{ fontWeight: '700', fontSize: '0.9rem', color: '#2d3748', marginBottom: '0.25rem' }}>
                                    💡 Rekomendasi:
                                </div>
                                <p style={{ margin: 0, fontSize: '0.85rem', color: '#4a5568', lineHeight: '1.4' }}>
                                    {result.recommendation}
                                </p>
                            </div>

                            <div style={{
                                marginTop: '1rem',
                                fontSize: '0.7rem',
                                color: '#a0aec0',
                                textAlign: 'center',
                                fontStyle: 'italic'
                            }}>
                                Model: {result.model_info} (v1.0)
                            </div>
                        </div>
                    )}
                </div>

                {/* Info Section */}
                {!result && (
                    <div style={{
                        marginTop: '1.5rem',
                        padding: '1rem',
                        borderRadius: '16px',
                        background: 'rgba(255,255,255,0.6)',
                        border: '1px solid rgba(255,255,255,0.8)'
                    }}>
                        <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#4a5568' }}>
                            Tips Pengambilan Gambar:
                        </h4>
                        <ul style={{
                            margin: 0,
                            paddingLeft: '1.2rem',
                            fontSize: '0.80rem',
                            color: '#718096',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.4rem',
                            textAlign: 'left'
                        }}>
                            <li>Pastikan cahaya terang dan merata.</li>
                            <li>Ambil foto daun secara tegak lurus (bird's eye view).</li>
                            <li>{mode === 'disease' ? 'Pastikan bagian yang sakit terlihat jelas.' : 'Pilih daun yang paling sehat/representatif.'}</li>
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DiseaseDetection;
