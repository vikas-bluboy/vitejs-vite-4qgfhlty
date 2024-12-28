import React from 'react';

export const RowsPerPage = ({ rowsPerPage, setRowsPerPage, filteredData }) => {
    // Generate options from 1 to filteredData.length
    const options = Array.from({ length: filteredData.length }, (_, i) => i + 1);

    return (
        <div className="rows-per-page">
            <span>Rows per page: </span>
            <select
                value={rowsPerPage}
                onChange={(e) => {
                    const newRowsPerPage = parseInt(e.target.value, 10);
                    setRowsPerPage(newRowsPerPage);
                    // Save the new rows per page to localStorage
                    const currentState = JSON.parse(localStorage.getItem('paginationState') || '{}');
                    localStorage.setItem('paginationState', JSON.stringify({
                        ...currentState,
                        rowsPerPage: newRowsPerPage
                    }));
                }}
            >
                {options.map(option => (
                    <option key={option} value={option}>
                        {option}
                    </option>
                ))}
            </select>
        </div>
    );
};
