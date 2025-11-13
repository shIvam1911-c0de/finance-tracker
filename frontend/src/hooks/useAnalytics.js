import { useState, useEffect, useCallback, useMemo } from 'react';
import { api } from '../services/api';

export const useAnalytics = (period = 'monthly') => {
    const [analytics, setAnalytics] = useState(null);
    const [dashboardStats, setDashboardStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchAnalytics = useCallback(async () => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await api.get('/analytics', { params: { period } });
            setAnalytics(response.data);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to fetch analytics');
        } finally {
            setLoading(false);
        }
    }, [period]);

    const fetchDashboardStats = useCallback(async () => {
        try {
            const response = await api.get('/analytics/dashboard');
            setDashboardStats(response.data);
        } catch (err) {
            console.error('Failed to fetch dashboard stats:', err);
        }
    }, []);

    useEffect(() => {
        fetchAnalytics();
        fetchDashboardStats();
    }, [fetchAnalytics, fetchDashboardStats]);

    const categoryChartData = useMemo(() => {
        if (!analytics?.categoryBreakdown) return [];
        
        return analytics.categoryBreakdown
            .filter(item => parseFloat(item.expense) > 0)
            .map(item => ({
                name: item.category,
                value: parseFloat(item.expense),
                income: parseFloat(item.income)
            }));
    }, [analytics]);

    const monthlyTrendData = useMemo(() => {
        if (!analytics?.monthlyTrends) return [];
        
        return analytics.monthlyTrends.map(item => ({
            month: item.month,
            income: parseFloat(item.income),
            expense: parseFloat(item.expense),
            profit: parseFloat(item.income) - parseFloat(item.expense)
        }));
    }, [analytics]);

    const yearlyOverviewData = useMemo(() => {
        if (!analytics?.yearlyOverview) return [];
        
        return analytics.yearlyOverview.map(item => ({
            year: item.year.toString(),
            income: parseFloat(item.income),
            expense: parseFloat(item.expense)
        }));
    }, [analytics]);

    return {
        analytics,
        dashboardStats,
        loading,
        error,
        categoryChartData,
        monthlyTrendData,
        yearlyOverviewData,
        refresh: fetchAnalytics
    };
};