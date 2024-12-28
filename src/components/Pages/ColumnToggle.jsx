import React from 'react';
import { MultiSelect } from 'primereact/multiselect';
export const ColumnToggle = ({ schema, selectedColumns, setSelectedColumns }) => {
    const onColumnToggle = (e) => {
        const selectedNames = e.value.map(selected => selected.name);
        const sortedColumns = schema.filter(col => selectedNames.includes(col.name));
        setSelectedColumns(sortedColumns);
    };
    if (!schema) return <div>Loading Columns...</div>;
    return (
        <MultiSelect
            value={selectedColumns}
            options={schema}
            optionLabel="name"
            onChange={onColumnToggle}
            placeholder="Toggle Columns"
            style={{ width: '13em', height: '2.5rem' }}
            display="chip"
            selectedItemTemplate={() => (
                <span style={{ color: 'gray' }}>Hide/Show Columns</span>
            )} // Always show the placeholder
        />
    );
};
