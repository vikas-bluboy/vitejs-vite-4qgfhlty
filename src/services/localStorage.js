// Function to get data from local storage
export const getKycDataStore = () => {
    const storedData = localStorage.getItem('kycData');
    return storedData ? JSON.parse(storedData) : null;
};

// Function to set data in local storage
export const setKycDataStore = (data) => {
    localStorage.setItem('kycData', JSON.stringify(data));
};

// Local Storage Utility Functions
export const saveToLocalStorage = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
};

export const loadFromLocalStorage = (key) => {
    const savedValue = localStorage.getItem(key);
    return savedValue ? JSON.parse(savedValue) : null;
};
