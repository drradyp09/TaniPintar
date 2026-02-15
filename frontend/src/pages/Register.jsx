import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../components/Input';
import Button from '../components/Button';
import { AUTH_BASE_URL } from '../apiConfig';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });

        // Clear error for this field when user starts typing
        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: ''
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = {};

        // Validate email format
        if (!validateEmail(formData.email)) {
            newErrors.email = 'Format email tidak valid';
        }

        // Validate password length
        if (formData.password.length < 6) {
            newErrors.password = 'Password minimal 6 karakter';
        }

        // Validate password match
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Password tidak cocok';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            const response = await fetch(`${AUTH_BASE_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: formData.username,
                    email: formData.email,
                    password: formData.password
                }),
                credentials: 'include'
            });

            const data = await response.json();

            if (response.ok) {
                alert('Registrasi berhasil! Silakan login.');
                navigate('/login');
            } else {
                setErrors({ general: data.error || 'Registrasi gagal' });
            }
        } catch (err) {
            setErrors({ general: 'Terjadi kesalahan jaringan' });
        }
    };

    return (
        <div className="glass-card animate-fade-in" style={{
            padding: '2.5rem 2rem',
            width: '100%',
            maxWidth: '430px',
            margin: '0 auto'
        }}>
            <div className="text-center mb-5">
                <h1 style={{
                    fontSize: '2.2rem',
                    fontWeight: '800',
                    color: 'var(--color-primary)',
                    margin: '0 0 0.5rem 0',
                    letterSpacing: '-1px'
                }}>
                    TaniPintar
                </h1>
                <p style={{
                    color: 'var(--color-text-light)',
                    fontSize: '0.95rem',
                    fontWeight: '500',
                    margin: 0
                }}>
                    Pendaftaran Anggota Baru
                </p>
            </div>

            {errors.general && (
                <div className="animate-fade-in" style={{
                    color: 'var(--color-error)',
                    marginBottom: '1.2rem',
                    padding: '0.75rem',
                    background: 'rgba(211, 47, 47, 0.05)',
                    borderRadius: '8px',
                    textAlign: 'center',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    border: '1px solid rgba(211, 47, 47, 0.1)'
                }}>
                    ⚠️ {errors.general}
                </div>
            )}

            <form onSubmit={handleSubmit} className="animate-stagger-1">
                <Input
                    label="Nama Pengguna"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    error={errors.username}
                />
                <Input
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    error={errors.email}
                />
                <Input
                    label="Kata Sandi"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    error={errors.password}
                />
                <Input
                    label="Konfirmasi Kata Sandi"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    error={errors.confirmPassword}
                />
                <div className="mt-5">
                    <Button type="submit" className="btn" style={{ width: '100%', fontSize: '1rem', padding: '0.9rem' }}>
                        DAFTAR SEKARANG
                    </Button>
                </div>
            </form>

            <div className="text-center mt-5 animate-stagger-2" style={{ fontSize: '0.9rem', color: 'var(--color-text-light)', fontWeight: '500' }}>
                Sudah punya akun? <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: '700', textDecoration: 'none' }}>Login disini</Link>
            </div>
        </div>
    );
};

export default Register;
