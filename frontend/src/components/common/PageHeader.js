import React from 'react';

/**

 * @author EK
 * Code von anderen Teammitgliedern oder Quellen wird durch einzelne Kommentare deklariert
 * @version 1.0
 */

const PageHeader = ({ title, subtitle, actions, breadcrumbs }) => {
    return (
        <div className="page-header">
            {breadcrumbs && (
                <nav className="breadcrumbs">
                    {breadcrumbs.map((crumb, index) => (
                        <React.Fragment key={index}>
                            {index > 0 && <span className="breadcrumb-separator">/</span>}
                            {crumb.href ? (
                                <a href={crumb.href} className="breadcrumb-link">
                                    {crumb.label}
                                </a>
                            ) : (
                                <span className="breadcrumb-current">{crumb.label}</span>
                            )}
                        </React.Fragment>
                    ))}
                </nav>
            )}

            <div className="page-header-content">
                <div className="page-header-text">
                    <h1 className="page-title">{title}</h1>
                    {subtitle && <p className="page-subtitle">{subtitle}</p>}
                </div>

                {actions && (
                    <div className="page-header-actions">
                        {actions}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PageHeader;
