import React, { useState, useEffect, useRef } from 'react';
import { getPageSchema } from '../services/apiService';
import { GlobalSearch } from './Pages/GlobalSearch';
import { ClearFiltersButton } from './Pages/ClearFiltersButton';
import { ColumnToggle } from './Pages/ColumnToggle';
import { DataTableComponent } from './Pages/DataTableComponent';
import { Toast } from 'primereact/toast'; // Import Toast component
import { v4 as uuidv4 } from 'uuid'; // Import UUID to generate unique IDs for rows
import { validateField } from './Pages/Validations';
import { getPageData } from '../services/dataService';
import { saveToLocalStorage, loadFromLocalStorage } from '../services/localStorage.js'
import 'react-toastify/dist/ReactToastify.css';
import PageSchemas from './Pages/PageSchemas.jsx';
import { useLocation, useParams } from 'react-router';
import './dynamicTableUI.css';
import { RowsPerPage } from './Pages/RowsPerPage.jsx';
import LogOut from './LogOut.jsx';
const DynamicTablesUI = ({ tenantName }) => {
    const [schema, setSchema] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [data, setData] = useState([]);
    const [selectedColumns, setSelectedColumns] = useState([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [rows, setRows] = useState(10);
    const [filteredData, setFilteredData] = useState();
    const [selectedRows, setSelectedRows] = useState([]);
    const [sortField, setSortField] = useState(null);
    const [sortOrder, setSortOrder] = useState(null);
    const [dateRangeFilter, setDateRangeFilter] = useState(null); // For range calendar filter
    const [isHamburgerMenuOpen, setIsHamburgerMenuOpen] = useState(false); // Manage hamburger menu visibility
    const [rowsPerPage, setRowsPerPage] = useState(10); // Default to 10 rows per page
    const toast = useRef(null); // Create a toast reference
    const { pageTitle } = useParams();  // Destructure pageTitle from URL params
    const location = useLocation();  // Track location changes
    console.log('Page Title:', pageTitle);  // Check if pageTitle is correctly received

    const handleEdit = async (newValue, colName, rowId) => {
        console.log('Editing:', { newValue, colName, rowId });

        // Find the index of the row being edited
        const rowIndex = filteredData.findIndex(row => row.id === rowId);
        if (rowIndex === -1) {
            console.error(`Row with id ${rowId} not found.`);
            return;
        }

        const oldRow = filteredData[rowIndex];
        const oldValue = oldRow[colName];

        // Check if value actually changed
        if (newValue !== oldValue) {
            const validationResult = validateField(newValue, colName, schema);
            if (validationResult !== true) {
                toast.current.show({
                    severity: 'error',
                    summary: 'Validation Error',
                    detail: validationResult,
                    life: 3000,
                });
                return; // Exit if validation fails
            }
            // Handle status column update
            if (colName === 'status') {
                // Check if the old value is 'Rejected' and prevent updates to 'Approved' or 'Pending'
                if (oldValue === 'Rejected') {
                    if (newValue === 'Approved') {
                        // Prevent the update to 'Approved' if the current value is 'Rejected'
                        toast.current.show({
                            severity: 'error',
                            summary: 'Invalid Status Change',
                            detail: 'Rejected items cannot be approved.',
                            life: 3000,
                        });
                        return; // Exit if the change is not allowed
                    }
                    if (newValue === 'Pending') {
                        // Prevent the update to 'Pending' if the current value is 'Rejected'
                        toast.current.show({
                            severity: 'error',
                            summary: 'Invalid Status Change',
                            detail: 'Rejected items cannot be set to Pending.',
                            life: 3000,
                        });
                        return; // Exit if the change is not allowed
                    }
                }

                // Update status values properly
                if (newValue === 'Approved') {
                    newValue = 'Approved';
                } else if (newValue === 'Rejected') {
                    newValue = 'Rejected';
                } else {
                    newValue = 'Pending'; // Default to Pending
                }
            }
            const updatedRow = { ...oldRow, [colName]: newValue };
            delete updatedRow.id; // Exclude the 'id' field from the request body

            try {
                const apiUrl = `http://localhost:8081/api/v1/page-data/${pageTitle}/info`;

                // Call the PUT API to update the row
                const response = await fetch(apiUrl, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(updatedRow),
                });

                const responseData = await response.json();

                if (response.ok && responseData.success) {
                    // Optimistically update the specific row while preserving order
                    const updatedData = filteredData.map((row, index) =>
                        index === rowIndex ? updatedRow : row
                    );

                    // Save to localStorage and update state
                    saveToLocalStorage('tableData', updatedData);
                    setFilteredData(updatedData);
                    setData(updatedData);

                    toast.current.show({
                        severity: 'success',
                        summary: 'Data Updated',
                        detail: `${colName} updated to ${newValue}. ${responseData.message}`,
                        life: 3000,
                    });
                } else {
                    console.error('API Error:', responseData.message);
                    toast.current.show({
                        severity: 'error',
                        summary: 'Update Failed',
                        detail: responseData.message,
                        life: 3000,
                    });
                }
            } catch (error) {
                console.error('Network or Server Error:', error);
                toast.current.show({
                    severity: 'error',
                    summary: 'Update Failed',
                    detail: 'An error occurred while updating the data.',
                    life: 3000,
                });
            }
        }
    };

    // Toggle function for hamburger menu
    const toggleHamburgerMenu = () => {
        setIsHamburgerMenuOpen((prevState) => !prevState);
    };
    // Close hamburger menu on page change
    useEffect(() => {
        setIsHamburgerMenuOpen(false); // Close the hamburger menu when page changes
    }, [location]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);  // Start loading before fetching data

            try {
                // Fetch schema
                const schemaResponse = await getPageSchema(pageTitle);
                const { columns: schemaColumns } = schemaResponse.data || {}; // Ensure schemaData is not null or undefined

                // Check if schemaColumns is valid
                if (!schemaColumns || !Array.isArray(schemaColumns.columns)) {
                    throw new Error('Invalid schema data: columns are missing or malformed');
                }

                setSchema(schemaColumns.columns); // Set schema columns
                setSelectedColumns(schemaColumns.columns); // Set default selected columns

                // Load table data from localStorage (if available)
                loadFromLocalStorage('tableData'); // Assuming this loads into local state or context

                // Fetch KYC data
                const kycResponse = await getPageData(pageTitle);
                const kycData = kycResponse.data;
                // console.log(JSON.stringify(kycData));

                if (Array.isArray(kycData.data)) {
                    const parsedData = kycData.data
                        .map(row => {
                            const parsedRow = { id: uuidv4() }; // Assign a unique ID to each row
                            let isValidRow = true; // Flag to track if row is valid

                            // Process row data according to schema
                            schemaColumns.columns.forEach(col => { // Ensure this is accessing columns correctly
                                if (row.hasOwnProperty(col.name)) {
                                    // Handle date columns
                                    if (col.type === 'date' && row[col.name]) {
                                        parsedRow[col.name] = new Date(row[col.name]);
                                    } else {
                                        // Handle status column mapping
                                        if (col.name === 'status') {
                                            parsedRow[col.name] =
                                                row[col.name] === 'approve' ? 'Approved' :
                                                    row[col.name] === 'reject' ? 'Rejected' :
                                                        row[col.name];
                                        } else {
                                            parsedRow[col.name] = row[col.name]; // Handle other fields
                                        }
                                    }
                                } else {
                                    isValidRow = false; // Mark row as invalid if column data is missing
                                }
                            });

                            return isValidRow ? parsedRow : null; // Only return valid rows
                        })
                        .filter(row => row !== null); // Remove invalid rows

                    // Save the parsed data to localStorage
                    saveToLocalStorage('tableData', parsedData);

                    // Set parsed data to state
                    setData(parsedData);
                    setFilteredData(parsedData); // Set initial filtered data
                } else {
                    console.error('Sample Data is not in the expected array format:', kycData);
                    setError(new Error('Sample Data is not in the expected format'));
                }

            } catch (error) {
                console.error('Error fetching or parsing data:', error);
                setError(error); // Handle error state
            } finally {
                setLoading(false); // End loading regardless of success or failure
            }
        };

        fetchData();
    }, [pageTitle, tenantName]);

    const filterData = (filterValue) => {
        const lowercasedFilter = filterValue.toLowerCase();
        const filtered = data.filter(row => {
            return Object.values(row).some(value =>
                String(value).toLowerCase().includes(lowercasedFilter)
            );
        });
        setFilteredData(filtered);
    };
    useEffect(() => {
        if (globalFilter) {
            filterData(globalFilter); // Apply global filter if it exists
        } else {
            setFilteredData(data); // Reset to original data if no filter
        }
    }, [data, globalFilter]);

    const resetSorting = () => {
        setSortField(null);
        setSortOrder(null);
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;

    return (
        <div className="container">
            <Toast ref={toast} /> {/* Add Toast component */}
            <div className="header">
                <div className="hamburger-icon">
                    {/* Hamburger Icon */}
                    <button className="hamburger-button" onClick={toggleHamburgerMenu}>☰</button>
                    <h1 className="page-name">{pageTitle}</h1> {/* Centered page name */}
                </div>
                <div className="toolbar-right">
                    <RowsPerPage rowsPerPage={rowsPerPage} setRowsPerPage={setRowsPerPage} filteredData={filteredData} />
                    <ColumnToggle
                        schema={schema}
                        selectedColumns={selectedColumns}
                        setSelectedColumns={setSelectedColumns}
                    />
                    <GlobalSearch
                        globalFilter={globalFilter}
                        setGlobalFilter={setGlobalFilter}
                        filterData={filterData}
                    />
                    <ClearFiltersButton
                        setGlobalFilter={setGlobalFilter}
                        setFilteredData={setFilteredData}
                        data={data}
                        schema={schema}
                        setSelectedRows={setSelectedRows}
                        resetSorting={resetSorting}
                        setDateRangeFilter={setDateRangeFilter}
                    />
                    <LogOut />
                </div>
            </div>
            <div className="layout">
                {isHamburgerMenuOpen && (
                    <div className="hamburger-menu">
                        <PageSchemas tenantName={tenantName} /> {/* Display schemas here */}
                    </div>
                )}
                <div className="content">
                    <div className="data-table-wrapper">
                        <DataTableComponent
                            data={data}
                            filteredData={filteredData}
                            setFilteredData={setFilteredData}
                            rows={rows}
                            globalFilter={globalFilter}
                            selectedColumns={selectedColumns}
                            handleEdit={handleEdit}
                            toast={toast}
                            schema={schema}
                            selectedRows={selectedRows}
                            setSelectedRows={setSelectedRows}
                            sortField={sortField}
                            setSortField={setSortField}
                            sortOrder={sortOrder}
                            setSortOrder={setSortOrder}
                            setData={setData}
                            dateRangeFilter={dateRangeFilter}
                            setDateRangeFilter={setDateRangeFilter}
                            setRows={setRows}
                            pageTitle={pageTitle}
                            rowsPerPage={rowsPerPage}
                            setRowsPerPage={setRowsPerPage}
                        />
                    </div>
                </div>
            </div>
        </div >
    );
};
export default DynamicTablesUI;