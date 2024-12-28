import { Button } from 'primereact/button';
import React from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { saveToLocalStorage } from '../../services/localStorage';

const ActionButtons = ({ selectedRows, setSelectedRows, filteredData, setFilteredData, setData, pageTitle }) => {
    // Function to update the status of selected rows
    const updateStatus = async (status) => {
        // Validate the status
        const validStatuses = ['Pending', 'Approved', 'Rejected']; // Capitalized status values
        const formattedStatus = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase(); // Capitalize first letter

        if (!validStatuses.includes(formattedStatus)) {
            toast.error('Invalid status.');
            return;
        }

        let statusChanged = false;
        let allSuccess = true; // Track if all updates are successful

        // Filter out rows that are selected for update
        const rowsToUpdate = filteredData.filter(dataRow => selectedRows.includes(dataRow.id));

        // Map through selected rows and prepare API requests
        const apiRequests = rowsToUpdate.map(dataRow => {
            if (dataRow.status === 'Rejected' && formattedStatus === 'Approved') {
                toast.warning('Rejected items cannot be approved.');
                allSuccess = false; // Mark as failure if any row is skipped
                setSelectedRows([]); // Clear selected rows
                return null; // Skip this row
            }
            if (dataRow.status !== formattedStatus) {
                statusChanged = true;

                // Create a copy of the row and remove the 'id' field
                const { id, ...rowWithoutId } = dataRow;

                return {
                    ...rowWithoutId,
                    status: formattedStatus, // Update the status with formatted value
                };
            }
            return null; // No changes to status
        }).filter(Boolean); // Remove null entries

        if (apiRequests.length === 0) {
            toast.info('No changes to update.');
            setSelectedRows([]); // Clear selected rows
            return;
        }

        // Optimistic UI Update: Immediately update the status in the frontend
        const updatedData = filteredData.map(dataRow =>
            selectedRows.includes(dataRow.id)
                ? { ...dataRow, status: formattedStatus }
                : dataRow
        );

        // Update filteredData and Data state immediately to reflect the changes
        setFilteredData(updatedData);
        setData(updatedData);
        saveToLocalStorage('tableData', updatedData);
        console.log(`updatedData: ${JSON.stringify(updatedData, null, 2)}`);
        // Now make the API requests
        try {
            const apiResponses = await Promise.all(
                apiRequests.map(async (updatedRow) => {
                    const response = await fetch(`http://localhost:8081/api/v1/page-data/${pageTitle}/info`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(updatedRow),
                    });

                    const res = await response.json();

                    if (!response.ok) {
                        toast.error(`Failed to update row with ID: ${updatedRow.id}`);
                        allSuccess = false; // Mark as failure if any row fails
                        return null; // Skip this row
                    }

                    return res;
                })
            );

            console.log('API Responses:', apiResponses); // Debug responses

            // Filter successful responses
            const successfulUpdates = apiResponses.filter(res => res && res.success);

            if (successfulUpdates.length > 0) {
                // Create a map for fast lookup of updated rows by ID
                const successfulUpdatesMap = new Map(successfulUpdates.map(res => [res.data.id, res.data]));

                // Update filteredData with the successful responses
                const finalUpdatedData = updatedData.map(dataRow =>
                    successfulUpdatesMap.has(dataRow.id) ? successfulUpdatesMap.get(dataRow.id) : dataRow
                );

                // Update the state and localStorage
                setData(finalUpdatedData);
                setFilteredData(finalUpdatedData);
                saveToLocalStorage('tableData', finalUpdatedData);
                setSelectedRows([]); // Clear selected rows

                // Show toast based on the success or failure of the updates
                if (statusChanged) {
                    if (allSuccess) {
                        if (formattedStatus === 'Approved') {
                            toast.success('Approved successfully!');
                        } else if (formattedStatus === 'Rejected') {
                            toast.error('Rejected successfully!');
                        }
                    } else {
                        toast.error('Some updates failed. Please try again.');
                    }
                }
            } else {
                toast.error('Failed to update some items. Please try again.');
            }
        } catch (error) {
            console.error('Network or Server Error:', error);
            toast.error('An error occurred while updating the data.');
            setSelectedRows([]); // Clear selected rows
        }
    };

    // Handle approval action
    const handleApprove = () => updateStatus('approved');

    // Handle rejection action
    const handleReject = () => updateStatus('rejected');

    return (
        <div style={{ marginBottom: '1rem' }}>
            {selectedRows.length > 0 && (
                <>
                    <Button
                        label="Approve"
                        icon="pi pi-check"
                        className="p-button-success mr-2"
                        onClick={handleApprove}
                    />
                    <Button
                        label="Reject"
                        icon="pi pi-times"
                        className="p-button-danger"
                        onClick={handleReject}
                    />
                </>
            )}
        </div>
    );
};

export default ActionButtons;
