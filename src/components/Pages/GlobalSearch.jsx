import React from 'react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import 'primeicons/primeicons.css'; // Import PrimeIcons CSS for icons

export const GlobalSearch = ({ globalFilter, setGlobalFilter, filterData }) => {
    return (
        <div style={{ position: 'relative', display: 'inline-block' }}>
            {/* Search Icon */}
            <i
                className="pi pi-search"
                style={{
                    position: 'absolute',
                    top: '50%',
                    left: '10px',
                    transform: 'translateY(-50%)',
                    color: '#999',
                    pointerEvents: 'none', // Ensure icon doesn't block input clicks
                }}
            ></i>
            {/* Input Field */}
            <InputText
                value={globalFilter}
                onChange={(e) => {
                    setGlobalFilter(e.target.value);
                    filterData(e.target.value);
                }}
                placeholder="Global Search"
                style={{
                    paddingLeft: '2rem', // Space for the search icon
                    width: '20em',
                }}
            />
            {/* delete Filters Button */}
            {globalFilter && (
                <Button
                    icon="pi pi-times"
                    className="p-button-text p-button-rounded p-button-sm"
                    onClick={() => {
                        setGlobalFilter('');
                        filterData(''); // Optional: You can clear the filtered data as well
                    }}
                    style={{
                        position: 'absolute',
                        top: '50%',
                        right: '10px',
                        transform: 'translateY(-50%)',
                    }}
                />
            )}
        </div>
    );
};
