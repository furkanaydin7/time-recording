import React from 'react';

/**

 * @author EK
 * Code von anderen Teammitgliedern oder Quellen wird durch einzelne Kommentare deklariert
 * @version 1.0
 */

const Card = ({
                  children,
                  title,
                  subtitle,
                  actions,
                  variant = 'default',
                  ...props
              }) => {
    return (
        <div className={`card card-${variant}`} {...props}>
            {(title || subtitle || actions) && (
                <div className="card-header">
                    <div className="card-title-section">
                        {title && <h3 className="card-title">{title}</h3>}
                        {subtitle && <p className="card-subtitle">{subtitle}</p>}
                    </div>
                    {actions && <div className="card-actions">{actions}</div>}
                </div>
            )}
            <div className="card-content">
                {children}
            </div>
        </div>
    );
};

export default Card;
