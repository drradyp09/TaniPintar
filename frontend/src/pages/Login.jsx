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
        <div className="card">
            <h2 className="text-center mb-4">Masuk</h2>
            {error && <div style={{ color: 'red', textAlign: 'center', marginBottom: '1rem' }}>{error}</div>}
            <form onSubmit={handleSubmit}>
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
                    marginTop: '0.5rem',
                    marginBottom: '1rem'
                }}>
                    <input
                        type="checkbox"
                        id="rememberMe"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        style={{
                            width: '18px',
                            height: '18px',
                            marginRight: '8px',
                            cursor: 'pointer',
                            accentColor: 'var(--color-primary)'
                        }}
                    />
                    <label
                        htmlFor="rememberMe"
                        style={{
                            fontSize: '0.9rem',
                            color: '#666',
                            cursor: 'pointer',
                            userSelect: 'none'
                        }}
                    >
                        Remember Me
                    </label>
                </div>

                <div className="mt-4">
                    <Button type="submit">LOGIN</Button>
                </div>
            </form>
            <div className="text-center mt-4" style={{ fontSize: '0.9rem' }}>
                Belum punya akun? <Link to="/register">Daftar disini</Link>
            </div>
        </div>
    );
};

export default Login;
