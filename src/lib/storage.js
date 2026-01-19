/**
 * Local storage utility functions
 * Handles data persistence for the POS system
 */
import posItems from '../data/pos_item.json';

const STORAGE_KEY = 'pos_transactions';

export const getProducts = () => {
    return posItems;
};

export const getTransactions = () => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
};

export const addTransaction = (transaction) => {
    const current = getTransactions();
    const newTransaction = {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        ...transaction
    };
    const updated = [newTransaction, ...current];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return newTransaction;
};

export const clearTransactions = () => {
    localStorage.removeItem(STORAGE_KEY);
};
// Helper functions
