import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AUTH_BASE_URL } from '../apiConfig';
import Button from '../components/Button';
import Input from '../components/Input';

const FertilizerPlanner = () => {
    const navigate = useNavigate();
    const [crops, setCrops] = useState({});
    const [loading, setLoading] = useState(true);

    // Form States
    const [formData, setFormData] = useState({
        crop_type: '',
        area_m2: 1000
    });

    const [fertilizerResult, setFertilizerResult] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchCrops();
    }, []);

    const fetchCrops = async () => {
        try {
            const response = await fetch(`${AUTH_BASE_URL}/agriculture/crops`, { credentials: 'include' });
            if (response.ok) {
                const data = await response.json();
                setCrops(data);
                if (Object.keys(data).length > 0) {
                    setFormData(prev => ({ ...prev, crop_type: Object.keys(data)[0] }));
                }
            }
        } catch (err) {
            console.error('Failed to fetch crops');
        } finally {
            setLoading(false);
        }
    };

    const handleCalculateFertilizer = async (e) => {
        if (e) e.preventDefault();
        setError('');
        setFertilizerResult(null);

        try {
            const response = await fetch(`${AUTH_BASE_URL}/agriculture/calculate-fertilizer`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                setFertilizerResult(data);
            } else {
                const errData = await response.json();
                setError(errData.error || 'Gagal menghitung dosis pupuk');
            }
        } catch (err) {
            setError('Kesalahan koneksi');
        }
    };

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

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{
                    width: '45px', height: '45px', borderRadius: '14px',
                    background: 'linear-gradient(135deg, #1e88e5 0%, #1565c0 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', boxShadow: 'var(--shadow-glow)'
                }}>💊</div>
                <div>
                    <h1 style={{ fontSize: '1.6rem', margin: 0, fontWeight: '900', letterSpacing: '-0.8px' }}>Kebutuhan Pupuk Tanaman</h1>
                    <p style={{ color: 'var(--color-text-light)', fontSize: '0.85rem', margin: '2px 0 0 0', fontWeight: '600' }}>Program Pemupukan Cerdas</p>
                </div>
            </div>

            <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
                <form onSubmit={handleCalculateFertilizer} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.6rem', fontSize: '0.8rem', fontWeight: '800', color: '#1565c0' }}>JENIS KOMODITAS</label>
                        <select
                            value={formData.crop_type}
                            onChange={(e) => setFormData({ ...formData, crop_type: e.target.value })}
                            style={{
                                width: '100%', padding: '0.9rem', borderRadius: '16px', border: '2px solid rgba(30,136,229,0.2)',
                                background: 'white', fontSize: '1rem', fontWeight: '700', outline: 'none'
                            }}
                        >
                            {Object.keys(crops).map(key => (
                                <option key={key} value={key}>{crops[key].name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: '700', color: '#1565c0' }}>Luas Lahan (m²)</label>
                        <Input
                            type="number"
                            value={formData.area_m2}
                            onChange={(e) => setFormData({ ...formData, area_m2: e.target.value })}
                            placeholder="Contoh: 1000"
                            required
                        />
                    </div>

                    <Button type="submit" style={{ width: '100%', marginTop: '0.5rem', background: 'linear-gradient(135deg, #1e88e5 0%, #1565c0 100%)' }}>
                        REKOMENDASI DOSIS PUPUK
                    </Button>
                </form>
            </div>

            {error && <div className="animate-fade-in" style={{ padding: '1rem', color: 'var(--color-error)', background: 'rgba(229,57,53,0.05)', borderRadius: '12px', marginBottom: '1.5rem', fontSize: '0.8rem', textAlign: 'center', fontWeight: '700' }}>{error}</div>}

            {fertilizerResult && (
                <div className="glass-card animate-stagger-1" style={{
                    padding: '1.5rem',
                    background: 'rgba(255,255,255,0.9)',
                    border: '2px solid rgba(30,136,229,0.2)',
                    textAlign: 'center'
                }}>
                    <h3 style={{ margin: '0 0 1.2rem 0', color: '#1565c0', fontWeight: '800', fontSize: '1rem' }}>Estimasi Pupuk Dasar</h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        {[
                            { name: 'Urea', sub: 'Nitrogen (N)', val: fertilizerResult.urea, color: '#1565c0' },
                            { name: 'SP-36', sub: 'Fosfat (P)', val: fertilizerResult.sp36, color: '#1565c0' },
                            { name: 'KCl', sub: 'Kalium (K)', val: fertilizerResult.kcl, color: '#1565c0' }
                        ].map((item, idx) => (
                            <div key={idx} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '1rem',
                                background: 'white',
                                borderRadius: '16px',
                                border: '1px solid rgba(30,136,229,0.1)'
                            }}>
                                <div style={{ textAlign: 'left' }}>
                                    <p style={{ margin: 0, fontSize: '1rem', fontWeight: '800', color: item.color }}>{item.name}</p>
                                    <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--color-text-light)', fontWeight: '600' }}>{item.sub}</p>
                                </div>
                                <h3 style={{ margin: 0, fontWeight: '900' }}>{item.val} <span style={{ fontSize: '0.7rem' }}>kg</span></h3>
                            </div>
                        ))}
                    </div>

                    <div style={{ marginTop: '1.5rem', padding: '1rem', borderRadius: '12px', background: 'rgba(30,136,229,0.05)', border: '1px solid rgba(30,136,229,0.1)' }}>
                        <p style={{ margin: 0, fontSize: '0.75rem', lineHeight: '1.4', color: 'var(--color-text-light)', textAlign: 'left' }}>
                            *Dosis ini adalah panduan umum pemupukan dasar. Sesuaikan dengan kondisi kesuburan tanah setempat dan rekomendasi penyuluh pertanian.
                        </p>
                    </div>
                </div>
            )}

        </div>
    );
};

export default FertilizerPlanner;
