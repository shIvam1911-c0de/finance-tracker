import { useTransactions } from '../../hooks/useTransactions';
import { useOptimizedTransactions } from '../../hooks/useOptimizedTransactions';
import { SearchFilter } from '../Common/SearchFilter';
import { Pagination } from '../Common/Pagination';
import { useAuth } from '../../contexts/AuthContext';
import { useCallback, useState } from 'react';
import { AddTransactionForm } from './AddTransactionForm';

export const OptimizedTransactionList = () => {
  const { transactions, loading, deleteTransaction } = useTransactions();
  const { 
    canCreateTransaction, 
    canDeleteTransaction, 
    isReadOnly, 
    getRoleDisplayName
  } = useAuth();
  
  const [showAddForm, setShowAddForm] = useState(false);
  
  const {
    paginatedTransactions,
    totalPages,
    currentPage,
    categories,
    searchTerm,
    categoryFilter,
    handleSearch,
    handleCategoryFilter,
    handlePageChange
  } = useOptimizedTransactions(transactions);

  const handleDelete = useCallback(async (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      await deleteTransaction(id);
    }
  }, [deleteTransaction]);

  const handleEdit = useCallback((id) => {
    // TODO: Implement edit functionality
    console.log('Edit transaction:', id);
  }, []);

  if (loading) return <div>Loading transactions...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Transactions</h1>
          <p className="text-gray-600 mt-1">
            Role: <span className="font-medium">{getRoleDisplayName()}</span>
            {isReadOnly() && <span className="text-orange-600 ml-2">(View Only)</span>}
          </p>
        </div>
        
        {canCreateTransaction() && (
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Add Transaction
          </button>
        )}
      </div>
      
      <SearchFilter
        searchTerm={searchTerm}
        onSearch={handleSearch}
        categories={categories}
        selectedCategory={categoryFilter}
        onCategoryChange={handleCategoryFilter}
      />

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
              {canDeleteTransaction() && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginatedTransactions.map((transaction) => (
              <tr key={transaction.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(transaction.date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    transaction.type === 'income' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {transaction.type}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {transaction.category}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {transaction.description}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <span className={transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                    ₹{transaction.amount}
                  </span>
                </td>
                {canDeleteTransaction() && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleEdit(transaction.id)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(transaction.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
      
      {showAddForm && (
        <AddTransactionForm
          onClose={() => setShowAddForm(false)}
          onSuccess={() => setShowAddForm(false)}
        />
      )}
    </div>
  );
};