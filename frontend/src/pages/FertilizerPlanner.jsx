import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AUTH_BASE_URL } from '../apiConfig';
import Button from '../components/Button';
import Input from '../components/Input';
import FertilizerOptionCard from '../components/FertilizerOptionCard';

const FertilizerPlanner = () => {
    const navigate = useNavigate();
    const [crops, setCrops] = useState({});
    const [loading, setLoading] = useState(true);
    const [showAdvanced, setShowAdvanced] = useState(false);

    // Form States
    const [formData, setFormData] = useState({
        crop_type: '',
        area_m2: 1000,
        target_yield: '',
        soil_n: '',
        soil_p: '',
        soil_k: '',
        soil_ph: 6.5,
        organic_matter: 2.0
    });

    const [fertilizerResult, setFertilizerResult] = useState(null);
    const [error, setError] = useState('');
    const [showMultiOption, setShowMultiOption] = useState(false);
    const [expandedOptions, setExpandedOptions] = useState([0]); // Only first option expanded by default

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
            // Prepare payload - only include soil data if provided
            const payload = {
                crop_type: formData.crop_type,
                area_m2: parseFloat(formData.area_m2)
            };

            if (formData.target_yield) payload.target_yield = parseFloat(formData.target_yield);
            if (formData.soil_n) payload.soil_n = parseFloat(formData.soil_n);
            if (formData.soil_p) payload.soil_p = parseFloat(formData.soil_p);
            if (formData.soil_k) payload.soil_k = parseFloat(formData.soil_k);
            if (formData.soil_ph) payload.soil_ph = parseFloat(formData.soil_ph);
            if (formData.organic_matter) payload.organic_matter = parseFloat(formData.organic_matter);

            // Choose endpoint based on multi-option toggle
            const endpoint = showMultiOption ?
                `${AUTH_BASE_URL}/agriculture/calculate-fertilizer-multi` :
                `${AUTH_BASE_URL}/agriculture/calculate-fertilizer`;

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                setFertilizerResult(data);
                setExpandedOptions([0]); // Reset to only first option expanded
            } else {
                const errData = await response.json();
                setError(errData.error || 'Gagal menghitung dosis pupuk');
            }
        } catch (err) {
            setError('Kesalahan koneksi');
        }
    };

    const isScientificResult = fertilizerResult && fertilizerResult.method;

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
                    <h1 style={{ fontSize: '1.6rem', margin: 0, fontWeight: '900', letterSpacing: '-0.8px' }}>Rekomendasi Pupuk</h1>
                    <p style={{ color: 'var(--color-text-light)', fontSize: '0.85rem', margin: '2px 0 0 0', fontWeight: '600' }}>Berbasis Analisis Tanah</p>
                </div>
            </div>

            <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
                <form onSubmit={handleCalculateFertilizer} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                    {/* Basic Inputs */}
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

                    {/* Advanced Options Toggle */}
                    <div style={{
                        padding: '1rem',
                        background: 'rgba(30,136,229,0.05)',
                        borderRadius: '12px',
                        border: '1px dashed rgba(30,136,229,0.3)'
                    }}>
                        <button
                            type="button"
                            onClick={() => setShowAdvanced(!showAdvanced)}
                            style={{
                                width: '100%',
                                background: 'transparent',
                                border: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                cursor: 'pointer',
                                padding: 0,
                                fontWeight: '700',
                                color: '#1565c0',
                                fontSize: '0.9rem'
                            }}
                        >
                            <span>🔬 Analisis Tanah & Target Hasil (Opsional)</span>
                            <span style={{ fontSize: '1.2rem' }}>{showAdvanced ? '▼' : '▶'}</span>
                        </button>

                        {showAdvanced && (
                            <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: '700', color: 'var(--color-text)' }}>
                                        Target Hasil (ton/ha) <span style={{ color: '#999', fontWeight: '500' }}>- Kosongkan untuk nilai tipikal</span>
                                    </label>
                                    <Input
                                        type="number"
                                        step="0.1"
                                        value={formData.target_yield}
                                        onChange={(e) => setFormData({ ...formData, target_yield: e.target.value })}
                                        placeholder="Contoh: 6.0"
                                    />
                                </div>

                                <div style={{
                                    padding: '0.8rem',
                                    background: 'rgba(255,255,255,0.7)',
                                    borderRadius: '10px',
                                    border: '1px solid rgba(30,136,229,0.1)'
                                }}>
                                    <p style={{ margin: '0 0 0.8rem 0', fontSize: '0.75rem', fontWeight: '700', color: '#1565c0' }}>
                                        📊 Data Analisis Tanah
                                    </p>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.7rem', fontWeight: '600', color: 'var(--color-text)' }}>
                                                N-Total (%)
                                            </label>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                value={formData.soil_n}
                                                onChange={(e) => setFormData({ ...formData, soil_n: e.target.value })}
                                                placeholder="0.15"
                                                style={{ fontSize: '0.85rem', padding: '0.6rem' }}
                                            />
                                        </div>

                                        <div>
                                            <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.7rem', fontWeight: '600', color: 'var(--color-text)' }}>
                                                P-Tersedia (ppm)
                                            </label>
                                            <Input
                                                type="number"
                                                step="1"
                                                value={formData.soil_p}
                                                onChange={(e) => setFormData({ ...formData, soil_p: e.target.value })}
                                                placeholder="12"
                                                style={{ fontSize: '0.85rem', padding: '0.6rem' }}
                                            />
                                        </div>

                                        <div>
                                            <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.7rem', fontWeight: '600', color: 'var(--color-text)' }}>
                                                K-dd (me/100g)
                                            </label>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                value={formData.soil_k}
                                                onChange={(e) => setFormData({ ...formData, soil_k: e.target.value })}
                                                placeholder="0.30"
                                                style={{ fontSize: '0.85rem', padding: '0.6rem' }}
                                            />
                                        </div>

                                        <div>
                                            <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.7rem', fontWeight: '600', color: 'var(--color-text)' }}>
                                                pH Tanah
                                            </label>
                                            <Input
                                                type="number"
                                                step="0.1"
                                                value={formData.soil_ph}
                                                onChange={(e) => setFormData({ ...formData, soil_ph: e.target.value })}
                                                placeholder="6.5"
                                                style={{ fontSize: '0.85rem', padding: '0.6rem' }}
                                            />
                                        </div>
                                    </div>

                                    <div style={{ marginTop: '0.8rem' }}>
                                        <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.7rem', fontWeight: '600', color: 'var(--color-text)' }}>
                                            Bahan Organik (%)
                                        </label>
                                        <Input
                                            type="number"
                                            step="0.1"
                                            value={formData.organic_matter}
                                            onChange={(e) => setFormData({ ...formData, organic_matter: e.target.value })}
                                            placeholder="2.0"
                                            style={{ fontSize: '0.85rem', padding: '0.6rem' }}
                                        />
                                    </div>
                                </div>

                                <div style={{
                                    fontSize: '0.7rem',
                                    color: 'var(--color-text-light)',
                                    lineHeight: '1.4',
                                    padding: '0.6rem',
                                    background: 'rgba(255,255,255,0.5)',
                                    borderRadius: '8px'
                                }}>
                                    💡 <strong>Tips:</strong> Isi data analisis tanah untuk rekomendasi yang lebih akurat. Jika tidak ada data, sistem akan menggunakan asumsi konservatif.
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Multi-Option Toggle */}
                    <div style={{
                        padding: '1rem',
                        background: 'rgba(76,175,80,0.05)',
                        borderRadius: '12px',
                        border: '1px solid rgba(76,175,80,0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}>
                        <div>
                            <p style={{ margin: 0, fontWeight: '700', fontSize: '0.85rem', color: '#388e3c' }}>
                                🔄 Bandingkan Berbagai Opsi Pupuk
                            </p>
                            <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.7rem', color: 'var(--color-text-light)' }}>
                                Dapatkan 5 alternatif kombinasi pupuk dengan ranking
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowMultiOption(!showMultiOption)}
                            style={{
                                padding: '0.5rem 1rem',
                                borderRadius: '20px',
                                border: showMultiOption ? '2px solid #4caf50' : '2px solid #ddd',
                                background: showMultiOption ? '#4caf50' : 'white',
                                color: showMultiOption ? 'white' : '#666',
                                fontWeight: '700',
                                fontSize: '0.75rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            {showMultiOption ? '✓ ON' : 'OFF'}
                        </button>
                    </div>

                    <Button type="submit" style={{ width: '100%', marginTop: '0.5rem', background: 'linear-gradient(135deg, #1e88e5 0%, #1565c0 100%)' }}>
                        🧪 HITUNG REKOMENDASI PUPUK
                    </Button>
                </form>
            </div>

            {error && <div className="animate-fade-in" style={{ padding: '1rem', color: 'var(--color-error)', background: 'rgba(229,57,53,0.05)', borderRadius: '12px', marginBottom: '1.5rem', fontSize: '0.8rem', textAlign: 'center', fontWeight: '700' }}>{error}</div>}

            {fertilizerResult && (
                <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* Method Badge */}
                    {fertilizerResult.method && (
                        <div style={{
                            padding: '0.8rem 1rem',
                            background: fertilizerResult.method.includes('Multi') ?
                                'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)' :
                                'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)',
                            borderRadius: '12px',
                            color: 'white',
                            fontSize: '0.75rem',
                            fontWeight: '700',
                            textAlign: 'center',
                            boxShadow: '0 4px 12px rgba(76,175,80,0.3)'
                        }}>
                            ✓ Metode: {fertilizerResult.method}
                        </div>
                    )}

                    {/* Multi-Option Results */}
                    {fertilizerResult.options ? (
                        <>
                            {/* Summary */}
                            <div className="glass-card" style={{ padding: '1.5rem' }}>
                                <h3 style={{ margin: '0 0 1rem 0', color: '#ff9800', fontWeight: '800', fontSize: '1rem' }}>
                                    📊 {fertilizerResult.options.length} Opsi Kombinasi Pupuk
                                </h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', fontSize: '0.8rem' }}>
                                    <div style={{ padding: '0.8rem', background: 'rgba(255,152,0,0.05)', borderRadius: '10px' }}>
                                        <p style={{ margin: 0, color: 'var(--color-text-light)', fontSize: '0.7rem', fontWeight: '600' }}>Target Hasil</p>
                                        <p style={{ margin: '0.2rem 0 0 0', fontWeight: '800', color: '#ff9800', fontSize: '1.1rem' }}>
                                            {fertilizerResult.target_yield_ton_ha} ton/ha
                                        </p>
                                    </div>
                                    <div style={{ padding: '0.8rem', background: 'rgba(255,152,0,0.05)', borderRadius: '10px' }}>
                                        <p style={{ margin: 0, color: 'var(--color-text-light)', fontSize: '0.7rem', fontWeight: '600' }}>Luas</p>
                                        <p style={{ margin: '0.2rem 0 0 0', fontWeight: '800', color: '#ff9800', fontSize: '1.1rem' }}>
                                            {fertilizerResult.area_ha} ha
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Ranked Options - Compact Accordion */}
                            {fertilizerResult.options.map((option, idx) => {
                                const isExpanded = expandedOptions.includes(idx);
                                const toggleExpand = () => {
                                    setExpandedOptions(prev =>
                                        prev.includes(idx)
                                            ? prev.filter(i => i !== idx)
                                            : [...prev, idx]
                                    );
                                };

                                return (
                                    <FertilizerOptionCard
                                        key={idx}
                                        option={option}
                                        idx={idx}
                                        isExpanded={isExpanded}
                                        onToggle={toggleExpand}
                                    />
                                );
                            })}
                        </>
                    ) : (
                        /* Single Result (existing code) */
                        isScientificResult ? (
                            <>
                                {/* Summary Card */}
                                <div className="glass-card" style={{ padding: '1.5rem' }}>
                                    <h3 style={{ margin: '0 0 1rem 0', color: '#1565c0', fontWeight: '800', fontSize: '1rem' }}>
                                        📋 Ringkasan Kebutuhan
                                    </h3>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', fontSize: '0.8rem' }}>
                                        <div style={{ padding: '0.8rem', background: 'rgba(30,136,229,0.05)', borderRadius: '10px' }}>
                                            <p style={{ margin: 0, color: 'var(--color-text-light)', fontSize: '0.7rem', fontWeight: '600' }}>Target Hasil</p>
                                            <p style={{ margin: '0.2rem 0 0 0', fontWeight: '800', color: '#1565c0', fontSize: '1.1rem' }}>
                                                {fertilizerResult.target_yield_ton_ha} ton/ha
                                            </p>
                                        </div>
                                        <div style={{ padding: '0.8rem', background: 'rgba(30,136,229,0.05)', borderRadius: '10px' }}>
                                            <p style={{ margin: 0, color: 'var(--color-text-light)', fontSize: '0.7rem', fontWeight: '600' }}>Luas</p>
                                            <p style={{ margin: '0.2rem 0 0 0', fontWeight: '800', color: '#1565c0', fontSize: '1.1rem' }}>
                                                {fertilizerResult.area_ha} ha
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Nutrient Balance */}
                                <div className="glass-card" style={{ padding: '1.5rem' }}>
                                    <h3 style={{ margin: '0 0 1rem 0', color: '#1565c0', fontWeight: '800', fontSize: '1rem' }}>
                                        ⚖️ Neraca Hara (kg/ha)
                                    </h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                        {['N', 'P2O5', 'K2O'].map(nutrient => (
                                            <div key={nutrient} style={{
                                                padding: '1rem',
                                                background: 'white',
                                                borderRadius: '12px',
                                                border: '1px solid rgba(30,136,229,0.1)'
                                            }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                                    <span style={{ fontWeight: '800', color: '#1565c0', fontSize: '0.9rem' }}>{nutrient}</span>
                                                </div>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', fontSize: '0.7rem', textAlign: 'center' }}>
                                                    <div>
                                                        <p style={{ margin: 0, color: 'var(--color-text-light)', fontWeight: '600' }}>Kebutuhan</p>
                                                        <p style={{ margin: '0.2rem 0 0 0', fontWeight: '800', color: '#333' }}>
                                                            {fertilizerResult.nutrient_requirement[nutrient]}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p style={{ margin: 0, color: 'var(--color-text-light)', fontWeight: '600' }}>Tanah</p>
                                                        <p style={{ margin: '0.2rem 0 0 0', fontWeight: '800', color: '#4caf50' }}>
                                                            {fertilizerResult.soil_supply[nutrient]}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p style={{ margin: 0, color: 'var(--color-text-light)', fontWeight: '600' }}>Perlu</p>
                                                        <p style={{ margin: '0.2rem 0 0 0', fontWeight: '800', color: '#e53935' }}>
                                                            {fertilizerResult.net_need[nutrient]}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Fertilizer Recommendation */}
                                <div className="glass-card" style={{ padding: '1.5rem' }}>
                                    <h3 style={{ margin: '0 0 1rem 0', color: '#1565c0', fontWeight: '800', fontSize: '1rem' }}>
                                        💊 Dosis Pupuk Total
                                    </h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                        {[
                                            { name: 'Urea', sub: 'Nitrogen (N)', val: fertilizerResult.fertilizer_total_kg.urea, color: '#1565c0' },
                                            { name: 'SP-36', sub: 'Fosfat (P)', val: fertilizerResult.fertilizer_total_kg.sp36, color: '#1565c0' },
                                            { name: 'KCl', sub: 'Kalium (K)', val: fertilizerResult.fertilizer_total_kg.kcl, color: '#1565c0' }
                                        ].map((item, idx) => (
                                            <div key={idx} style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                padding: '1rem',
                                                background: 'white',
                                                borderRadius: '16px',
                                                border: '2px solid rgba(30,136,229,0.2)'
                                            }}>
                                                <div style={{ textAlign: 'left' }}>
                                                    <p style={{ margin: 0, fontSize: '1rem', fontWeight: '800', color: item.color }}>{item.name}</p>
                                                    <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--color-text-light)', fontWeight: '600' }}>{item.sub}</p>
                                                </div>
                                                <h3 style={{ margin: 0, fontWeight: '900', fontSize: '1.3rem' }}>
                                                    {item.val} <span style={{ fontSize: '0.7rem' }}>kg</span>
                                                </h3>
                                            </div>
                                        ))}
                                    </div>

                                    <div style={{
                                        marginTop: '1rem',
                                        padding: '1rem',
                                        background: 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)',
                                        borderRadius: '12px',
                                        color: 'white',
                                        textAlign: 'center'
                                    }}>
                                        <p style={{ margin: 0, fontSize: '0.7rem', fontWeight: '600', opacity: 0.9 }}>Estimasi Biaya Total</p>
                                        <p style={{ margin: '0.3rem 0 0 0', fontSize: '1.5rem', fontWeight: '900' }}>
                                            Rp {fertilizerResult.total_cost_idr.toLocaleString('id-ID')}
                                        </p>
                                    </div>
                                </div>

                                {/* Application Schedule */}
                                {fertilizerResult.application_schedule && (
                                    <div className="glass-card" style={{ padding: '1.5rem' }}>
                                        <h3 style={{ margin: '0 0 1rem 0', color: '#1565c0', fontWeight: '800', fontSize: '1rem' }}>
                                            📅 Jadwal Aplikasi
                                        </h3>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                            {fertilizerResult.application_schedule.map((phase, idx) => (
                                                <div key={idx} style={{
                                                    padding: '1rem',
                                                    background: 'white',
                                                    borderRadius: '12px',
                                                    border: '2px solid rgba(30,136,229,0.2)'
                                                }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                                                        <span style={{ fontWeight: '800', color: '#1565c0', fontSize: '0.9rem' }}>
                                                            {phase.phase}
                                                        </span>
                                                        <span style={{
                                                            padding: '0.3rem 0.8rem',
                                                            background: 'rgba(30,136,229,0.1)',
                                                            borderRadius: '20px',
                                                            fontSize: '0.7rem',
                                                            fontWeight: '700',
                                                            color: '#1565c0'
                                                        }}>
                                                            Hari {phase.day}
                                                        </span>
                                                    </div>
                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', fontSize: '0.75rem' }}>
                                                        <div style={{ textAlign: 'center', padding: '0.5rem', background: 'rgba(30,136,229,0.05)', borderRadius: '8px' }}>
                                                            <p style={{ margin: 0, color: 'var(--color-text-light)', fontWeight: '600' }}>Urea</p>
                                                            <p style={{ margin: '0.2rem 0 0 0', fontWeight: '800' }}>{phase.urea_kg} kg</p>
                                                        </div>
                                                        <div style={{ textAlign: 'center', padding: '0.5rem', background: 'rgba(30,136,229,0.05)', borderRadius: '8px' }}>
                                                            <p style={{ margin: 0, color: 'var(--color-text-light)', fontWeight: '600' }}>SP-36</p>
                                                            <p style={{ margin: '0.2rem 0 0 0', fontWeight: '800' }}>{phase.sp36_kg} kg</p>
                                                        </div>
                                                        <div style={{ textAlign: 'center', padding: '0.5rem', background: 'rgba(30,136,229,0.05)', borderRadius: '8px' }}>
                                                            <p style={{ margin: 0, color: 'var(--color-text-light)', fontWeight: '600' }}>KCl</p>
                                                            <p style={{ margin: '0.2rem 0 0 0', fontWeight: '800' }}>{phase.kcl_kg} kg</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            /* Simple Results (Fallback) */
                            <div className="glass-card" style={{
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
                        )
                    )}

                    {/* Info Footer */}
                    <div style={{
                        padding: '1rem',
                        background: 'rgba(255,255,255,0.8)',
                        borderRadius: '12px',
                        border: '1px solid rgba(30,136,229,0.1)',
                        fontSize: '0.75rem',
                        lineHeight: '1.5',
                        color: 'var(--color-text-light)'
                    }}>
                        <p style={{ margin: 0, fontWeight: '700', color: '#1565c0', marginBottom: '0.5rem' }}>📌 Catatan Penting:</p>
                        <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
                            <li>Rekomendasi ini berdasarkan metode neraca hara FAO/IRRI</li>
                            <li>Aplikasikan pupuk sesuai jadwal untuk hasil optimal</li>
                            <li>Semua pupuk P (SP-36) diberikan saat tanam</li>
                            <li>Konsultasikan dengan penyuluh pertanian setempat</li>
                        </ul>
                    </div>
                </div>
            )}

        </div>
    );
};

export default FertilizerPlanner;
