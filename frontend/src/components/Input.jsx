import React, { useState } from 'react';

const Input = ({ label, type = 'text', value, onChange, placeholder, required = false, name, error = '' }) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPasswordField = type === 'password';
    const inputType = isPasswordField && showPassword ? 'text' : type;

    // SVG Icons for password toggle
    const EyeIcon = () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
        </svg>
    );

    const EyeOffIcon = () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
            <line x1="1" y1="1" x2="23" y2="23"></line>
        </svg>
    );

    return (
        <div className="form-group">
            {label && <label className="form-label" htmlFor={name}>{label}</label>}
            <div style={{ position: 'relative' }}>
                <input
                    id={name}
                    name={name}
                    type={inputType}
                    className="form-input"
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    required={required}
                    style={{ paddingRight: isPasswordField ? '45px' : '12px' }}
                />
                {isPasswordField && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                            position: 'absolute',
                            right: '12px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#666',
                            padding: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            lineHeight: 1,
                            transition: 'color 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#2e7d32'}
                        onMouseLeave={(e) => e.currentTarget.style.color = '#666'}
                        aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                        title={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                    >
                        {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                )}
            </div>
            {error && <div style={{ color: '#d32f2f', fontSize: '0.85rem', marginTop: '0.25rem' }}>{error}</div>}
        </div>
    );
};

export default Input;

