import React from 'react';

/**

 * @author EK
 * Code von anderen Teammitgliedern oder Quellen wird durch einzelne Kommentare deklariert
 * @version 1.0
 */

const Button = ({
                    children,
                    onClick,
                    type = 'button',
                    variant = 'primary',
                    size = 'medium',
                    loading = false,
                    disabled = false,
                    ...props
                }) => {
    const baseClasses = 'btn';
    const variantClasses = {
        primary: 'btn-primary',
        secondary: 'btn-secondary',
        danger: 'btn-danger',
        success: 'btn-success'
    };
    const sizeClasses = {
        small: 'btn-small',
        medium: 'btn-medium',
        large: 'btn-large'
    };

    const className = [
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        loading && 'btn-loading',
        disabled && 'btn-disabled'
    ].filter(Boolean).join(' ');

    return (
        <button
            type={type}
            className={className}
            onClick={onClick}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? (
                <>
                    <span className="spinner"></span>
                    Lädt...
                </>
            ) : (
                children
            )}
        </button>
    );
};

export default Button;
