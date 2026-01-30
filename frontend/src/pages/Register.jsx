import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../components/Input';
import Button from '../components/Button';

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
            const response = await fetch('http://localhost:5000/api/auth/register', {
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
        <div className="card">
            <h2 className="text-center mb-4">Daftar Akun Baru</h2>
            {errors.general && (
                <div style={{
                    color: '#d32f2f',
                    marginBottom: '1rem',
                    padding: '0.75rem',
                    background: '#ffebee',
                    borderRadius: '4px',
                    textAlign: 'center'
                }}>
                    {errors.general}
                </div>
            )}
            <form onSubmit={handleSubmit}>
                <Input
                    label="Username"
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
                    label="Password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    error={errors.password}
                />
                <Input
                    label="Konfirmasi Password"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    error={errors.confirmPassword}
                />
                <div className="mt-4">
                    <Button type="submit">DAFTAR</Button>
                </div>
            </form>
            <div className="text-center mt-4" style={{ fontSize: '0.9rem' }}>
                Sudah punya akun? <Link to="/login">Login disini</Link>
            </div>
        </div>
    );
};

export default Register;
