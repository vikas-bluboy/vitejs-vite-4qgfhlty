export const validateField = (value, colName, schema) => {
    // Find the column schema for the given column name
    const column = schema.find(col => col.name === colName);

    // Check if column is defined
    if (!column) return 'Column schema not found';

    // Validation for strings with minimum and maximum length
    if (column.type === 'string') {
        // Check if value is empty or invalid for strings
        if (typeof value !== 'string' || value.trim() === '') {
            return `${colName} must be a non-empty string`;
        }

        // Check if the string meets the minimum length requirement (e.g., 2 characters)
        if (value.length < 2) {
            return `${colName} must be at least 2 characters long`;
        }

        // Check if the string exceeds the maximum length requirement (e.g., 10 characters)
        if (value.length > 20) {
            return `${colName} must be no longer than 20 characters`;
        }
    }

    // Validation for numbers
    if (column.type === 'integer') {
        // Check if value is empty
        if (value.trim() === '') {
            return `${colName} cannot be empty`;
        }

        // Check if value is a valid number
        if (isNaN(value)) {
            return `${colName} must be a valid number`;
        }
        // Check if the number is positive (greater than 0)
        const numValue = Number(value);
        if (numValue <= 0) {
            return `${colName} must be a positive number`;
        }

        // Check if the number has at least 1 digit and at most 10 digits
        if (value.length < 1 || value.length > 10) {
            return `${colName} must have between 1 and 10 digits`;
        }
    }


    // Validation for float numbers
    if (column.type === 'float') {
        if (value.trim() === '') {
            return `${colName} cannot be empty`;
        }
        if (isNaN(value)) {
            return `${colName} must be a valid number`;
        }
        const floatValue = parseFloat(value);
        if (floatValue <= 0) {
            return `${colName} must be a positive number`;
        }

        // Check for reasonable decimal places (for example, up to 2 decimal places)
        if (!/^\d+(\.\d{1,2})?$/.test(value)) {
            return `${colName} must be a valid float with up to two decimal places`;
        }
    }

    // Validation for date format (DD-MM-YYYY)
    if (column.type === 'Date') {
        if (!value) {
            return `${colName} cannot be empty`;
        }

        const dateRegex = /^(\d{2})-(\d{2})-(\d{4})$/;
        const match = value.match(dateRegex);

        if (match) {
            const [_, day, month, year] = match;

            // Ensure that formattedDate is constructed in the proper order (DD-MM-YYYY)
            const formattedDate = `${year}-${month}-${day}`; // Convert to YYYY-MM-DD for creating a `Date` object

            const parsedDate = new Date(formattedDate);
            if (isNaN(parsedDate)) {
                return 'The date format is incorrect. Please enter a valid date.';
            }
        } else {
            return 'Please enter the date in DD-MM-YYYY format.';
        }
    }

    // If all validations pass, return true
    return true;
};
