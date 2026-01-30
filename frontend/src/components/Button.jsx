import React from 'react';

const Button = ({ children, onClick, type = 'button', disabled = false }) => {
    return (
        <button
            type={type}
            className="btn"
            onClick={onClick}
            disabled={disabled}
        >
            {children}
        </button>
    );
};

export default Button;
