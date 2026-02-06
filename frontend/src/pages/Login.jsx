import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../components/Input';
import Button from '../components/Button';
import { AUTH_BASE_URL } from '../apiConfig';

const Login = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Load saved credentials on mount
    useEffect(() => {
        const savedUsername = localStorage.getItem('rememberedUsername');
        const savedPassword = localStorage.getItem('rememberedPassword');
        if (savedUsername && savedPassword) {
            setFormData({
                username: savedUsername,
                password: savedPassword
            });
            setRememberMe(true);
        }
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            // In development processing via vite proxy or direct if CORS enabled
            const response = await fetch(`${AUTH_BASE_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
                credentials: 'include'
            });

            const data = await response.json();

            if (response.ok) {
                // Save user info
                localStorage.setItem('user', JSON.stringify(data.user));

                // Handle Remember Me
                if (rememberMe) {
                    localStorage.setItem('rememberedUsername', formData.username);
                    localStorage.setItem('rememberedPassword', formData.password);
                } else {
                    localStorage.removeItem('rememberedUsername');
                    localStorage.removeItem('rememberedPassword');
                }

                navigate('/dashboard');
            } else {
                setError(data.error || 'Login failed');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        }
    };

    return (
        <div className="glass-card animate-fade-in" style={{
            padding: '2.5rem 2rem',
            width: '100%',
            maxWidth: '400px',
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
                    Smart Technology for Agriculture
                </p>
            </div>

            <h2 className="animate-stagger-1" style={{
                fontSize: '1.4rem',
                fontWeight: '700',
                color: 'var(--color-text)',
                marginBottom: '1.5rem',
                textAlign: 'center'
            }}>
                Masuk ke Akun Anda
            </h2>

            {error && (
                <div className="animate-fade-in" style={{
                    color: 'var(--color-error)',
                    textAlign: 'center',
                    marginBottom: '1.2rem',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    padding: '0.6rem',
                    background: 'rgba(211, 47, 47, 0.05)',
                    borderRadius: '8px',
                    border: '1px solid rgba(211, 47, 47, 0.1)'
                }}>
                    ⚠️ {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="animate-stagger-2">
                <Input
                    label="Username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                />
                <Input
                    label="Password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                />

                {/* Remember Me Checkbox */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginTop: '0.8rem',
                    marginBottom: '1.5rem'
                }}>
                    <input
                        type="checkbox"
                        id="rememberMe"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        style={{
                            width: '20px',
                            height: '20px',
                            marginRight: '10px',
                            cursor: 'pointer',
                            accentColor: 'var(--color-primary)',
                            borderRadius: '4px'
                        }}
                    />
                    <label
                        htmlFor="rememberMe"
                        style={{
                            fontSize: '0.9rem',
                            color: 'var(--color-text-light)',
                            cursor: 'pointer',
                            userSelect: 'none',
                            fontWeight: '600'
                        }}
                    >
                        Ingat Saya
                    </label>
                </div>

                <div className="mt-4">
                    <Button type="submit" className="btn" style={{ width: '100%', fontSize: '1rem', padding: '0.8rem' }}>
                        MASUK SEKARANG
                    </Button>
                </div>
            </form>

            <div className="text-center mt-5 animate-stagger-3" style={{ fontSize: '0.9rem', color: 'var(--color-text-light)', fontWeight: '500' }}>
                Belum punya akun? <Link to="/register" style={{ color: 'var(--color-primary)', fontWeight: '700', textDecoration: 'none' }}>Daftar disini</Link>
            </div>
        </div>
    );
};

export default Login;
