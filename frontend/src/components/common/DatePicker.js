import React from 'react';

/**

 * @author EK
 * Code von anderen Teammitgliedern oder Quellen wird durch einzelne Kommentare deklariert
 * @version 1.0
 */

const DatePicker = ({
                        label,
                        value,
                        onChange,
                        min,
                        max,
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
                type="date"
                className={`form-input ${error ? 'error' : ''}`}
                value={value}
                onChange={onChange}
                min={min}
                max={max}
                required={required}
                {...props}
            />
            {error && <span className="error-text">{error}</span>}
        </div>
    );
};

export default DatePicker;
