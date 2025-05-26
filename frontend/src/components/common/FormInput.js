import React from 'react';

/**

 * @author EK
 * Code von anderen Teammitgliedern oder Quellen wird durch einzelne Kommentare deklariert
 * @version 1.0
 */

const FormInput = ({
                       label,
                       type = 'text',
                       value,
                       onChange,
                       placeholder,
                       required = false,
                       error,
                       ...props
                   }) => {
    return (
        <div className="form-group">
            {label && (
                <label className={`form-label ${required ? 'required' : ''}`}>
                    {label}
                </label>
            )}
            <input
                type={type}
                className={`form-input ${error ? 'error' : ''}`}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                {...props}
            />
            {error && <span className="error-text">{error}</span>}
        </div>
    );
};

export default FormInput;