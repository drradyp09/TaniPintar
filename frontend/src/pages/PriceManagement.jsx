import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AUTH_BASE_URL } from '../apiConfig';
import Button from '../components/Button';
import Input from '../components/Input';

const PriceManagement = () => {
    const navigate = useNavigate();
    const [prices, setPrices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [editingFert, setEditingFert] = useState(null);
    const [updateForm, setUpdateForm] = useState({
        price_per_kg: '',
        notes: ''
    });

    useEffect(() => {
        fetchPrices();
    }, []);

    const fetchPrices = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${AUTH_BASE_URL}/agriculture/fertilizer-prices`, { credentials: 'include' });
            if (response.ok) {
                const data = await response.json();
                setPrices(data);
            } else {
                setError('Gagal mengambil data harga');
            }
        } catch (err) {
            setError('Kesalahan koneksi');
        } finally {
            setLoading(false);
        }
    };

    const handleSync = async () => {
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            const response = await fetch(`${AUTH_BASE_URL}/agriculture/fertilizer-prices/sync`, {
                method: 'POST',
                credentials: 'include'
            });
            if (response.ok || response.status === 501) {
                const data = await response.json();
                if (response.status === 501) {
                    setError('Fitur Sinkronisasi Otomatis belum tersedia (Placeholder)');
                } else {
                    setSuccess('Sinkronisasi berhasil!');
                    fetchPrices();
                }
            } else {
                setError('Gagal melakukan sinkronisasi');
            }
        } catch (err) {
            setError('Kesalahan koneksi saat sinkronisasi');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (fert) => {
        setEditingFert(fert);
        setUpdateForm({
            price_per_kg: fert.current_price,
            notes: `Update berkala - ${new Date().toLocaleDateString('id-ID')}`
        });
        setError('');
        setSuccess('');
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const response = await fetch(`${AUTH_BASE_URL}/agriculture/fertilizer-prices`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fertilizer_type: editingFert.type,
                    price_per_kg: parseFloat(updateForm.price_per_kg),
                    source: 'manual',
                    notes: updateForm.notes
                }),
                credentials: 'include'
            });

            if (response.ok) {
                setSuccess(`Harga ${editingFert.name} berhasil diperbarui!`);
                setEditingFert(null);
                fetchPrices();
            } else {
                const data = await response.json();
                setError(data.error || 'Gagal memperbarui harga');
            }
        } catch (err) {
            setError('Kesalahan koneksi');
        }
    };

    return (
        <div className="mobile-container animate-fade-in" style={{ paddingBottom: '4rem' }}>
            <button
                onClick={() => navigate('/fertilizer')}
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

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                        width: '45px', height: '45px', borderRadius: '14px',
                        background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', boxShadow: 'var(--shadow-glow)'
                    }}>⚙️</div>
                    <div>
                        <h1 style={{ fontSize: '1.6rem', margin: 0, fontWeight: '900', letterSpacing: '-0.8px' }}>Kelola Harga Pupuk</h1>
                        <p style={{ color: 'var(--color-text-light)', fontSize: '0.85rem', margin: '2px 0 0 0', fontWeight: '600' }}>Admin Dashboard</p>
                    </div>
                </div>
                <button
                    onClick={handleSync}
                    disabled={loading}
                    className="scale-hover"
                    style={{
                        padding: '0.6rem 1rem',
                        background: 'white',
                        border: '1.5px solid #FF9800',
                        color: '#FF9800',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: '800',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        opacity: loading ? 0.6 : 1
                    }}
                >
                    🔄 SYNC
                </button>
            </div>

            {error && <div style={{ padding: '1rem', color: '#f44336', background: 'rgba(244,67,54,0.1)', borderRadius: '12px', marginBottom: '1rem', fontSize: '0.85rem' }}>{error}</div>}
            {success && <div style={{ padding: '1rem', color: '#4caf50', background: 'rgba(76,175,80,0.1)', borderRadius: '12px', marginBottom: '1rem', fontSize: '0.85rem' }}>{success}</div>}

            {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-light)' }}>Memuat data harga...</div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {prices.map((fert) => (
                        <div key={fert.type} className="glass-card" style={{ padding: '1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '800', textTransform: 'uppercase' }}>{fert.name}</h3>
                                <p style={{ margin: '0.2rem 0 0 0', fontSize: '1.1rem', fontWeight: '900', color: 'var(--color-primary)' }}>
                                    Rp {fert.current_price.toLocaleString('id-ID')}/kg
                                </p>
                            </div>
                            <button
                                onClick={() => handleEdit(fert)}
                                style={{
                                    padding: '0.6rem 1rem',
                                    borderRadius: '10px',
                                    border: 'none',
                                    background: 'var(--color-primary)',
                                    color: 'white',
                                    fontWeight: '700',
                                    fontSize: '0.8rem',
                                    cursor: 'pointer'
                                }}
                            >
                                UBAH
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Edit Modal / Overlay */}
            {editingFert && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 1000, padding: '1.5rem'
                }}>
                    <div className="glass-card animate-scale-in" style={{ padding: '2rem', width: '100%', maxWidth: '400px', background: 'white' }}>
                        <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '1.3rem', fontWeight: '900' }}>Update Harga {editingFert.name}</h2>

                        <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem', fontWeight: '700' }}>HARGA PER KG (RP)</label>
                                <Input
                                    type="number"
                                    value={updateForm.price_per_kg}
                                    onChange={(e) => setUpdateForm({ ...updateForm, price_per_kg: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem', fontWeight: '700' }}>CATATAN / SUMBER</label>
                                <Input
                                    type="text"
                                    value={updateForm.notes}
                                    onChange={(e) => setUpdateForm({ ...updateForm, notes: e.target.value })}
                                    placeholder="Contoh: Harga pasar lokal"
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <Button
                                    type="button"
                                    onClick={() => setEditingFert(null)}
                                    style={{ flex: 1, background: '#f5f5f5', color: '#666', border: '1px solid #ddd' }}
                                >
                                    BATAL
                                </Button>
                                <Button type="submit" style={{ flex: 1 }}>
                                    SIMPAN
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PriceManagement;
