import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

export const useTransactions = (initialFilters = {}) => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        pages: 0
    });
    const [filters, setFilters] = useState(initialFilters);

    const fetchTransactions = useCallback(async () => {
        setLoading(true);
        setError(null);
        
        try {
            const params = {
                page: pagination.page,
                limit: pagination.limit,
                ...filters
            };
            
            const response = await api.get('/transactions', { params });
            setTransactions(response.data.transactions);
            setPagination(prev => ({ ...prev, ...response.data.pagination }));
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to fetch transactions');
        } finally {
            setLoading(false);
        }
    }, [pagination.page, pagination.limit, filters]);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    const createTransaction = useCallback(async (data) => {
        try {
            const response = await api.post('/transactions', data);
            setTransactions(prev => [response.data, ...prev]);
            return { success: true, data: response.data };
        } catch (err) {
            return { 
                success: false, 
                error: err.response?.data?.error || 'Failed to create transaction' 
            };
        }
    }, []);

    const updateTransaction = useCallback(async (id, data) => {
        try {
            const response = await api.put(`/transactions/${id}`, data);
            setTransactions(prev => 
                prev.map(t => t.id === id ? response.data : t)
            );
            return { success: true, data: response.data };
        } catch (err) {
            return { 
                success: false, 
                error: err.response?.data?.error || 'Failed to update transaction' 
            };
        }
    }, []);

    const deleteTransaction = useCallback(async (id) => {
        try {
            await api.delete(`/transactions/${id}`);
            setTransactions(prev => prev.filter(t => t.id !== id));
            return { success: true };
        } catch (err) {
            return { 
                success: false, 
                error: err.response?.data?.error || 'Failed to delete transaction' 
            };
        }
    }, []);

    const updateFilters = useCallback((newFilters) => {
        setFilters(newFilters);
        setPagination(prev => ({ ...prev, page: 1 }));
    }, []);

    const changePage = useCallback((newPage) => {
        setPagination(prev => ({ ...prev, page: newPage }));
    }, []);

    const refresh = useCallback(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    return {
        transactions,
        loading,
        error,
        pagination,
        filters,
        createTransaction,
        updateTransaction,
        deleteTransaction,
        updateFilters,
        changePage,
        refresh
    };
};