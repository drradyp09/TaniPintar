import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AUTH_BASE_URL } from '../apiConfig';
import Button from '../components/Button';
import Input from '../components/Input';

const IrrigationPlanner = () => {
    const navigate = useNavigate();
    const [crops, setCrops] = useState({});
    const [soilTextures, setSoilTextures] = useState({});
    const [loading, setLoading] = useState(true);
    const [metadataError, setMetadataError] = useState(false);

    // Form States
    const [formData, setFormData] = useState({
        crop_type: '',
        soil_type: '',
        age_days: 30,
        area_m2: 1000,
        t_mean: 27.0,
        humidity: 75,
        wind_speed: 1.5,
        pressure: 101.3,
        solar_rad: 15.0
    });

    const [waterResult, setWaterResult] = useState(null);
    const [seasonalResult, setSeasonalResult] = useState(null);
    const [calcError, setCalcError] = useState('');

    useEffect(() => {
        fetchMetadata();
    }, []);

    const fetchMetadata = async () => {
        setLoading(true);
        setMetadataError(false);
        try {
            console.log('Fetching agriculture metadata...');
            const [cropRes, soilRes] = await Promise.all([
                fetch(`${AUTH_BASE_URL}/agriculture/crops`, { credentials: 'include' }),
                fetch(`${AUTH_BASE_URL}/agriculture/soil-textures`, { credentials: 'include' })
            ]);

            if (cropRes.ok && soilRes.ok) {
                const cropData = await cropRes.json();
                const soilData = await soilRes.json();

                console.log('Metadata loaded:', { crops: Object.keys(cropData).length, soils: Object.keys(soilData).length });

                setCrops(cropData);
                setSoilTextures(soilData);

                // Validation & Defaulting
                setFormData(prev => {
                    const next = { ...prev };
                    if (Object.keys(cropData).length > 0) {
                        if (!prev.crop_type || !cropData[prev.crop_type]) {
                            next.crop_type = Object.keys(cropData)[0];
                        }
                    }
                    if (Object.keys(soilData).length > 0) {
                        if (!prev.soil_type || !soilData[prev.soil_type]) {
                            next.soil_type = Object.keys(soilData)[0];
                        }
                    }
                    return next;
                });
            } else {
                console.error('Metadata fetch failed with status:', cropRes.status, soilRes.status);
                setMetadataError(true);
            }
        } catch (err) {
            console.error('Failed to fetch agriculture metadata:', err);
            setMetadataError(true);
        } finally {
            setLoading(false);
        }
    };

    const handleCalculateWater = async (e) => {
        if (e) e.preventDefault();
        setCalcError('');
        setWaterResult(null);
        setSeasonalResult(null);

        try {
            // Fetch daily calculation
            const response = await fetch(`${AUTH_BASE_URL}/agriculture/calculate-water`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                setWaterResult(data);

                // Also fetch seasonal demand
                const seasonalPayload = {
                    crop_type: formData.crop_type,
                    area_m2: formData.area_m2,
                    eto_avg: data.eto || 4.0  // Use calculated ETo as average
                };

                const seasonalResponse = await fetch(`${AUTH_BASE_URL}/agriculture/seasonal-water-demand`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(seasonalPayload),
                    credentials: 'include'
                });

                if (seasonalResponse.ok) {
                    const seasonalData = await seasonalResponse.json();
                    setSeasonalResult(seasonalData);
                }
            } else {
                const errData = await response.json();
                setCalcError(errData.error || 'Gagal menghitung kebutuhan air');
            }
        } catch (err) {
            setCalcError('Kesalahan koneksi saat menghitung');
        }
    };

    // Memoized selection checks for safer rendering
    const selectedCrop = useMemo(() => {
        if (!formData.crop_type || !crops) return null;
        return crops[formData.crop_type] || null;
    }, [formData.crop_type, crops]);

    const selectedSoil = useMemo(() => {
        if (!formData.soil_type || !soilTextures) return null;
        return soilTextures[formData.soil_type] || null;
    }, [formData.soil_type, soilTextures]);

    // Safety Return: if critical data structure is missing
    if (metadataError) {
        return (
            <div className="mobile-container animate-fade-in" style={{ padding: '2rem', textAlign: 'center' }}>
                <div className="glass-card" style={{ padding: '2rem', border: '2px solid var(--color-error)' }}>
                    <h2 style={{ color: 'var(--color-error)' }}>⚠️ Gangguan Data</h2>
                    <p style={{ fontSize: '0.9rem', color: 'var(--color-text-light)' }}>
                        Gagal memuat parameter perhitungan dari server.
                    </p>
                    <Button onClick={fetchMetadata} style={{ marginTop: '1rem' }}>COBA LAGI</Button>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="mobile-container animate-fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
                <div style={{ textAlign: 'center' }}>
                    <div className="spinner-primary" style={{ marginBottom: '1rem' }}></div>
                    <p style={{ fontWeight: '800', color: 'var(--color-primary)' }}>Sinkronisasi Data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="mobile-container animate-fade-in" style={{ paddingBottom: '4rem' }}>
            <button
                onClick={() => navigate('/water-fertilizer')}
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

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{
                    width: '45px', height: '45px', borderRadius: '14px',
                    background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', boxShadow: 'var(--shadow-glow)'
                }}>💧</div>
                <div>
                    <h1 style={{ fontSize: '1.6rem', margin: 0, fontWeight: '900', letterSpacing: '-0.8px' }}>Kebutuhan Air Tanaman</h1>
                    <p style={{ color: 'var(--color-text-light)', fontSize: '0.85rem', margin: '2px 0 0 0', fontWeight: '600' }}>FAO-56 Penman-Monteith</p>
                </div>
            </div>

            {/* 1. Crop Selection */}
            <div className="glass-card" style={{ padding: '1.2rem', marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.6rem', fontSize: '0.8rem', fontWeight: '800', color: 'var(--color-primary-dark)' }}>PILIH KOMODITAS</label>
                <select
                    value={formData.crop_type}
                    onChange={(e) => setFormData(p => ({ ...p, crop_type: e.target.value }))}
                    style={{
                        width: '100%', padding: '0.9rem', borderRadius: '16px', border: '2px solid var(--color-primary-glow)',
                        background: 'white', fontSize: '1rem', fontWeight: '700', outline: 'none'
                    }}
                >
                    {Object.keys(crops).map(key => (
                        <option key={key} value={key}>{crops[key]?.name || key}</option>
                    ))}
                </select>
            </div>

            {/* 2. Crop Characteristics */}
            {selectedCrop && (
                <div className="animate-fade-in glass-card" style={{ padding: '1.2rem', marginBottom: '1.5rem', background: 'rgba(255, 255, 255, 0.6)', border: '1px dashed var(--color-primary)' }}>
                    <h3 style={{ fontSize: '0.9rem', margin: '0 0 1rem 0', fontWeight: '900', color: 'var(--color-primary-dark)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        📑 KARAKTERISTIK TANAMAN ({selectedCrop.name?.toUpperCase()})
                    </h3>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', marginBottom: '1.2rem' }}>
                        <div style={{ background: 'white', padding: '0.8rem', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.05)' }}>
                            <p style={{ margin: 0, fontSize: '0.65rem', fontWeight: '700', color: 'var(--color-text-light)' }}>KEDALAMAN AKAR</p>
                            <p style={{ margin: '2px 0 0 0', fontSize: '1rem', fontWeight: '900' }}>
                                {selectedCrop.root_depth?.[0]} - {selectedCrop.root_depth?.[1]} <span style={{ fontSize: '0.7rem' }}>m</span>
                            </p>
                        </div>
                        <div style={{ background: 'white', padding: '0.8rem', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.05)' }}>
                            <p style={{ margin: 0, fontSize: '0.65rem', fontWeight: '700', color: 'var(--color-text-light)' }}>FRAKSI AIR (p)</p>
                            <p style={{ margin: '2px 0 0 0', fontSize: '1rem', fontWeight: '900' }}>{selectedCrop.p_fraction ?? '-'}</p>
                        </div>
                    </div>

                    <div style={{ overflowX: 'auto', background: 'white', borderRadius: '14px', border: '1px solid rgba(0,0,0,0.05)', padding: '0.5rem' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.7rem', textAlign: 'center' }}>
                            <thead>
                                <tr style={{ background: 'rgba(0,0,0,0.02)' }}>
                                    <th style={{ padding: '0.6rem', borderBottom: '1px solid #eee' }}>FASE</th>
                                    <th style={{ padding: '0.6rem', borderBottom: '1px solid #eee' }}>HARI</th>
                                    <th style={{ padding: '0.6rem', borderBottom: '1px solid #eee' }}>Kc</th>
                                </tr>
                            </thead>
                            <tbody>
                                {['Inisial', 'Vegetatif', 'Pembungaan', 'Pemasakan'].map((label, idx) => (
                                    <tr key={idx}>
                                        <td style={{ padding: '0.6rem', fontWeight: '700' }}>{label}</td>
                                        <td style={{ padding: '0.6rem' }}>{selectedCrop.stages?.[idx] ?? 0}</td>
                                        <td style={{ padding: '0.6rem', fontWeight: '900', color: 'var(--color-primary)' }}>{selectedCrop.kc?.[idx] ?? 0}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* 3. Soil Selection */}
            <div className="glass-card" style={{ padding: '1.2rem', marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.6rem', fontSize: '0.8rem', fontWeight: '800', color: 'var(--color-primary-dark)' }}>TEKSTUR TANAH</label>
                <select
                    value={formData.soil_type}
                    onChange={(e) => setFormData(p => ({ ...p, soil_type: e.target.value }))}
                    style={{
                        width: '100%', padding: '0.9rem', borderRadius: '16px', border: '2px solid var(--color-primary-glow)',
                        background: 'white', fontSize: '1rem', fontWeight: '700', outline: 'none'
                    }}
                >
                    {Object.keys(soilTextures).map(key => (
                        <option key={key} value={key}>{soilTextures[key]?.name || key}</option>
                    ))}
                </select>
            </div>

            {/* 4. Soil Characteristics */}
            {selectedSoil && (
                <div className="animate-fade-in glass-card" style={{ padding: '1.2rem', marginBottom: '2rem', background: 'rgba(232, 245, 233, 0.4)', border: '1px dashed #66bb6a' }}>
                    <h3 style={{ fontSize: '0.9rem', margin: '0 0 1rem 0', fontWeight: '900', color: '#1b5e20', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        🟫 KARAKTERISTIK MEDIA TANAM
                    </h3>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                        <div style={{ background: 'white', padding: '0.8rem', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.05)', textAlign: 'center' }}>
                            <p style={{ margin: 0, fontSize: '0.6rem', fontWeight: '700', color: 'var(--color-text-light)' }}>Kapasitas Lapang</p>
                            <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', fontWeight: '900' }}>
                                {selectedSoil.fc?.[0]}-{selectedSoil.fc?.[1]}
                            </p>
                            <span style={{ fontSize: '0.6rem', color: '#888' }}>m³/m³</span>
                        </div>
                        <div style={{ background: 'white', padding: '0.8rem', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.05)', textAlign: 'center' }}>
                            <p style={{ margin: 0, fontSize: '0.6rem', fontWeight: '700', color: 'var(--color-text-light)' }}>Titik Layu Tetap</p>
                            <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', fontWeight: '900' }}>
                                {selectedSoil.wp?.[0]}-{selectedSoil.wp?.[1]}
                            </p>
                            <span style={{ fontSize: '0.6rem', color: '#888' }}>m³/m³</span>
                        </div>
                        <div style={{ background: 'white', padding: '0.8rem', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.05)', textAlign: 'center' }}>
                            <p style={{ margin: 0, fontSize: '0.6rem', fontWeight: '700', color: 'var(--color-text-light)' }}>TAW Avail.</p>
                            <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', fontWeight: '900' }}>
                                {selectedSoil.taw?.[0]}-{selectedSoil.taw?.[1]}
                            </p>
                            <span style={{ fontSize: '0.6rem', color: '#888' }}>m³/m³</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Input Form */}
            <form onSubmit={handleCalculateWater} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem', fontWeight: '700', color: 'var(--color-primary-dark)' }}>Usia Tanaman (Hari)</label>
                        <Input
                            type="number"
                            value={formData.age_days}
                            onChange={(e) => setFormData(p => ({ ...p, age_days: e.target.value }))}
                            required
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem', fontWeight: '700', color: 'var(--color-primary-dark)' }}>Luas Lahan (m²)</label>
                        <Input
                            type="number"
                            value={formData.area_m2}
                            onChange={(e) => setFormData(p => ({ ...p, area_m2: e.target.value }))}
                            required
                        />
                    </div>
                </div>

                <div className="glass-card" style={{ padding: '1.2rem', background: 'rgba(255,255,255,0.4)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <h3 style={{ fontSize: '0.85rem', margin: '0 0 0.5rem 0', fontWeight: '800', color: 'var(--color-primary-dark)', borderBottom: '1px solid var(--color-primary-glow)', paddingBottom: '0.5rem' }}>PARAMETER KOREKSI (ENV)</h3>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: '700', color: 'var(--color-text)' }}>Suhu Rerata (°C)</label>
                            <Input
                                type="number"
                                step="0.1"
                                value={formData.t_mean}
                                onChange={(e) => setFormData(p => ({ ...p, t_mean: e.target.value }))}
                                required
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: '700', color: 'var(--color-text)' }}>Tekanan Udara (hPa)</label>
                            <Input
                                type="number"
                                step="0.1"
                                value={formData.pressure}
                                onChange={(e) => setFormData(p => ({ ...p, pressure: e.target.value }))}
                                required
                            />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: '700', color: 'var(--color-text)' }}>Kec. Angin (m/s)</label>
                            <Input
                                type="number"
                                step="0.1"
                                value={formData.wind_speed}
                                onChange={(e) => setFormData(p => ({ ...p, wind_speed: e.target.value }))}
                                required
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: '700', color: 'var(--color-text)' }}>Radiasi Matahari (Rs)</label>
                            <Input
                                type="number"
                                step="0.1"
                                value={formData.solar_rad}
                                onChange={(e) => setFormData(p => ({ ...p, solar_rad: e.target.value }))}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: '700', color: 'var(--color-text)' }}>Kelembapan Udara (%)</label>
                        <Input
                            type="number"
                            value={formData.humidity}
                            onChange={(e) => setFormData(p => ({ ...p, humidity: e.target.value }))}
                            required
                        />
                    </div>
                </div>

                {calcError && <div style={{ color: 'var(--color-error)', fontSize: '0.8rem', textAlign: 'center', fontWeight: '700' }}>{calcError}</div>}

                <Button type="submit" style={{ width: '100%', marginTop: '0.5rem' }} disabled={!formData.crop_type || !formData.soil_type}>
                    HITUNG KEBUTUHAN AIR
                </Button>
            </form>

            {waterResult && (
                <div className="glass-card animate-stagger-1" style={{
                    marginTop: '2rem', padding: '1.5rem', background: 'rgba(255,255,255,0.9)',
                    border: '2px solid var(--color-primary-glow)', textAlign: 'center'
                }}>
                    <h3 style={{ margin: '0 0 1rem 0', color: 'var(--color-primary)', fontWeight: '800', fontSize: '0.9rem' }}>Metode: Penman-Monteith (Corrected)</h3>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.8rem', marginBottom: '1.5rem' }}>
                        <div style={{ padding: '0.8rem', background: 'rgba(76,175,80,0.05)', borderRadius: '12px' }}>
                            <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--color-text-light)', fontWeight: '700' }}>ETo</p>
                            <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: '900' }}>{waterResult.eto ?? '0.0'}</p>
                            <span style={{ fontSize: '0.6rem' }}>mm/day</span>
                        </div>
                        <div style={{ padding: '0.8rem', background: 'rgba(76,175,80,0.05)', borderRadius: '12px' }}>
                            <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--color-text-light)', fontWeight: '700' }}>Kc</p>
                            <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: '900' }}>{waterResult.kc ?? '0.0'}</p>
                            <span style={{ fontSize: '0.6rem' }}>Coeff</span>
                        </div>
                        <div style={{ padding: '0.8rem', background: 'rgba(76,175,80,0.05)', borderRadius: '12px' }}>
                            <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--color-text-light)', fontWeight: '700' }}>ETc</p>
                            <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: '900' }}>{waterResult.etc ?? '0.0'}</p>
                            <span style={{ fontSize: '0.6rem' }}>mm/day</span>
                        </div>
                    </div>

                    <div style={{
                        padding: '1.5rem', background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)',
                        color: 'white', borderRadius: '20px', boxShadow: 'var(--shadow-glow)'
                    }}>
                        <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', fontWeight: '600', opacity: 0.9 }}>DEBIT AIR YANG DIBUTUHKAN</p>
                        <h2 style={{ margin: 0, fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-1px' }}>
                            {Math.round(waterResult.water_liters ?? 0).toLocaleString()} <span style={{ fontSize: '1.2rem' }}>Liter/Hari</span>
                        </h2>
                    </div>
                </div>
            )}

            {/* Seasonal Water Demand */}
            {seasonalResult && (
                <div className="glass-card animate-stagger-2" style={{
                    marginTop: '1.5rem', padding: '1.5rem', background: 'linear-gradient(135deg, rgba(76,175,80,0.1) 0%, rgba(139,195,74,0.1) 100%)',
                    border: '2px solid #66bb6a'
                }}>
                    <h3 style={{ margin: '0 0 1rem 0', color: '#1b5e20', fontWeight: '900', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        🌾 ESTIMASI TOTAL KEBUTUHAN AIR (1 MUSIM TANAM)
                    </h3>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div style={{ padding: '1rem', background: 'white', borderRadius: '16px', textAlign: 'center', boxShadow: 'var(--shadow-soft)' }}>
                            <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--color-text-light)', fontWeight: '700' }}>TOTAL AIR</p>
                            <p style={{ margin: '4px 0 0 0', fontSize: '1.8rem', fontWeight: '900', color: '#1b5e20' }}>
                                {Math.round(seasonalResult.total_water_liters).toLocaleString()}
                            </p>
                            <span style={{ fontSize: '0.7rem', color: '#666' }}>Liter</span>
                            <p style={{ margin: '8px 0 0 0', fontSize: '0.9rem', fontWeight: '700', color: '#388e3c' }}>
                                ≈ {seasonalResult.total_water_m3} m³
                            </p>
                        </div>
                        <div style={{ padding: '1rem', background: 'white', borderRadius: '16px', textAlign: 'center', boxShadow: 'var(--shadow-soft)' }}>
                            <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--color-text-light)', fontWeight: '700' }}>DURASI TANAM</p>
                            <p style={{ margin: '4px 0 0 0', fontSize: '1.8rem', fontWeight: '900', color: '#1b5e20' }}>
                                {seasonalResult.total_days}
                            </p>
                            <span style={{ fontSize: '0.7rem', color: '#666' }}>Hari</span>
                            <p style={{ margin: '8px 0 0 0', fontSize: '0.9rem', fontWeight: '700', color: '#388e3c' }}>
                                Rata-rata: {seasonalResult.avg_daily_liters} L/hari
                            </p>
                        </div>
                    </div>

                    <div style={{ background: 'white', borderRadius: '16px', padding: '1rem', boxShadow: 'var(--shadow-soft)' }}>
                        <h4 style={{ margin: '0 0 0.8rem 0', fontSize: '0.8rem', fontWeight: '800', color: '#1b5e20' }}>BREAKDOWN PER FASE PERTUMBUHAN</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                            {seasonalResult.phase_breakdown?.map((phase, idx) => (
                                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.8rem', background: 'rgba(76,175,80,0.05)', borderRadius: '12px', border: '1px solid rgba(76,175,80,0.2)' }}>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: '800', color: '#1b5e20' }}>{phase.phase}</p>
                                        <p style={{ margin: '2px 0 0 0', fontSize: '0.65rem', color: '#666' }}>{phase.days} hari • Kc: {phase.kc}</p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: '900', color: '#388e3c' }}>
                                            {Math.round(phase.total_liters).toLocaleString()}
                                        </p>
                                        <span style={{ fontSize: '0.6rem', color: '#888' }}>Liter</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default IrrigationPlanner;
