import React, { useState } from 'react';
import Button from './Button';
/**

 * @author EK
 * Code von anderen Teammitgliedern oder Quellen wird durch einzelne Kommentare deklariert
 * @version 1.0
 */

const DataTable = ({
                       data = [],
                       columns = [],
                       loading = false,
                       emptyMessage = 'Keine Daten vorhanden',
                       onRowClick,
                       selectable = false,
                       onSelectionChange
                   }) => {
    const [selectedRows, setSelectedRows] = useState(new Set());
    const [sortColumn, setSortColumn] = useState(null);
    const [sortDirection, setSortDirection] = useState('asc');

    const handleSort = (columnKey) => {
        if (sortColumn === columnKey) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(columnKey);
            setSortDirection('asc');
        }
    };

    const handleRowSelect = (rowId) => {
        const newSelection = new Set(selectedRows);
        if (newSelection.has(rowId)) {
            newSelection.delete(rowId);
        } else {
            newSelection.add(rowId);
        }
        setSelectedRows(newSelection);
        onSelectionChange?.(Array.from(newSelection));
    };

    const handleSelectAll = () => {
        if (selectedRows.size === data.length) {
            setSelectedRows(new Set());
            onSelectionChange?.([]);
        } else {
            const allIds = new Set(data.map(row => row.id));
            setSelectedRows(allIds);
            onSelectionChange?.(Array.from(allIds));
        }
    };

    const sortedData = React.useMemo(() => {
        if (!sortColumn) return data;

        return [...data].sort((a, b) => {
            const aValue = a[sortColumn];
            const bValue = b[sortColumn];

            if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }, [data, sortColumn, sortDirection]);

    if (loading) {
        return (
            <div className="data-table-loading">
                <div className="spinner"></div>
                <p>Lädt Daten...</p>
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="data-table-empty">
                <p>{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className="data-table-container">
            <table className="data-table">
                <thead>
                <tr>
                    {selectable && (
                        <th className="data-table-select-column">
                            <input
                                type="checkbox"
                                checked={selectedRows.size === data.length && data.length > 0}
                                onChange={handleSelectAll}
                            />
                        </th>
                    )}
                    {columns.map(column => (
                        <th
                            key={column.key}
                            className={`data-table-header ${column.sortable ? 'sortable' : ''}`}
                            onClick={column.sortable ? () => handleSort(column.key) : undefined}
                        >
                            {column.label}
                            {column.sortable && sortColumn === column.key && (
                                <span className={`sort-indicator ${sortDirection}`}>
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </span>
                            )}
                        </th>
                    ))}
                </tr>
                </thead>
                <tbody>
                {sortedData.map(row => (
                    <tr
                        key={row.id}
                        className={`data-table-row ${selectedRows.has(row.id) ? 'selected' : ''}`}
                        onClick={() => onRowClick?.(row)}
                    >
                        {selectable && (
                            <td className="data-table-select-column">
                                <input
                                    type="checkbox"
                                    checked={selectedRows.has(row.id)}
                                    onChange={() => handleRowSelect(row.id)}
                                    onClick={(e) => e.stopPropagation()}
                                />
                            </td>
                        )}
                        {columns.map(column => (
                            <td key={column.key} className="data-table-cell">
                                {column.render ? column.render(row[column.key], row) : row[column.key]}
                            </td>
                        ))}
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default DataTable;