
/**
 * A wrapper for localStorage that handles cases where it's unavailable
 * (e.g., in private browsing mode or sandboxed environments).
 */
const checkLocalStorageAvailability = (): boolean => {
    try {
        const testKey = '__flagr_storage_test__';
        window.localStorage.setItem(testKey, testKey);
        window.localStorage.removeItem(testKey);
        return true;
    } catch (e) {
        console.warn("localStorage is not available. App state will not be persisted across sessions.");
        return false;
    }
};

const isAvailable = checkLocalStorageAvailability();

export const storageService = {
    setItem: (key: string, value: string): void => {
        if (!isAvailable) return;
        try {
            window.localStorage.setItem(key, value);
        } catch (e) {
            // This might happen if storage quota is exceeded.
            console.error(`Error writing to localStorage:`, e);
        }
    },
    getItem: (key: string): string | null => {
        if (!isAvailable) return null;
        try {
            return window.localStorage.getItem(key);
        } catch (e) {
            console.error(`Error reading from localStorage:`, e);
            return null;
        }
    },
    removeItem: (key: string): void => {
        if (!isAvailable) return;
        try {
            window.localStorage.removeItem(key);
        } catch (e) {
            console.error(`Error removing from localStorage:`, e);
        }
    },
};
