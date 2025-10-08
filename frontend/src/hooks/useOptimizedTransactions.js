import { useState, useMemo, useCallback } from 'react';

export const useOptimizedTransactions = (transactions) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredTransactions = useMemo(() => {
    return transactions?.filter(transaction => {
      const matchesSearch = transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           transaction.category?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !categoryFilter || transaction.category === categoryFilter;
      return matchesSearch && matchesCategory;
    }) || [];
  }, [transactions, searchTerm, categoryFilter]);

  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredTransactions.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredTransactions, currentPage, itemsPerPage]);

  const totalPages = useMemo(() => 
    Math.ceil(filteredTransactions.length / itemsPerPage)
  , [filteredTransactions.length, itemsPerPage]);

  const categories = useMemo(() => 
    [...new Set(transactions?.map(t => t.category) || [])]
  , [transactions]);

  const handleSearch = useCallback((term) => {
    setSearchTerm(term);
    setCurrentPage(1);
  }, []);

  const handleCategoryFilter = useCallback((category) => {
    setCategoryFilter(category);
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  return {
    paginatedTransactions,
    totalPages,
    currentPage,
    categories,
    searchTerm,
    categoryFilter,
    handleSearch,
    handleCategoryFilter,
    handlePageChange
  };
};