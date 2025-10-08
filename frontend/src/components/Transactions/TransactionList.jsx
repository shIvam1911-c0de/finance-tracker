import { useState, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTransactions } from '../../hooks/useTransactions';
import TransactionForm from './TransactionForm';
import TransactionFilter from './TransactionFilter';

const TransactionList = () => {
    const { canModify } = useAuth();
    const {
        transactions,
        loading,
        pagination,
        filters,
        updateFilters,
        changePage,
        createTransaction,
        updateTransaction,
        deleteTransaction,
        refresh
    } = useTransactions();

    const [showForm, setShowForm] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState(null);

    const handleCreate = useCallback(async (data) => {
        const result = await createTransaction(data);
        if (result.success) {
            setShowForm(false);
            refresh();
        }
        return result;
    }, [createTransaction, refresh]);

    const handleUpdate = useCallback(async (id, data) => {
        const result = await updateTransaction(id, data);
        if (result.success) {
            setEditingTransaction(null);
            refresh();
        }
        return result;
    }, [updateTransaction, refresh]);

    const handleDelete = useCallback(async (id) => {
        if (window.confirm('Are you sure you want to delete this transaction?')) {
            await deleteTransaction(id);
            refresh();
        }
    }, [deleteTransaction, refresh]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Transactions
                </h1>
                {canModify() && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        + Add Transaction
                    </button>
                )}
            </div>

            {/* Filters */}
            <TransactionFilter filters={filters} onFilterChange={updateFilters} />

            {/* Transaction Form Modal */}
            {(showForm || editingTransaction) && canModify() && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full">
                        <TransactionForm
                            transaction={editingTransaction}
                            onSubmit={editingTransaction ? 
                                (data) => handleUpdate(editingTransaction.id, data) : 
                                handleCreate
                            }
                            onCancel={() => {
                                setShowForm(false);
                                setEditingTransaction(null);
                            }}
                        />
                    </div>
                </div>
            )}

            {/* Transactions Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-600 dark:text-gray-400">
                        Loading transactions...
                    </div>
                ) : transactions.length === 0 ? (
                    <div className="p-8 text-center text-gray-600 dark:text-gray-400">
                        No transactions found. {canModify() && 'Add your first transaction!'}
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Category
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Description
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Type
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Amount
                                        </th>
                                        {canModify() && (
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {transactions.map((transaction) => (
                                        <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                {new Date(transaction.date).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                                    {transaction.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                                                {transaction.description || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    transaction.type === 'income'
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                                }`}>
                                                    {transaction.type}
                                                </span>
                                            </td>
                                            <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                                                transaction.type === 'income'
                                                    ? 'text-green-600 dark:text-green-400'
                                                    : 'text-red-600 dark:text-red-400'
                                            }`}>
                                                {transaction.type === 'income' ? '+' : '-'}$
                                                {parseFloat(transaction.amount).toFixed(2)}
                                            </td>
                                            {canModify() && (
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                                    <button
                                                        onClick={() => setEditingTransaction(transaction)}
                                                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(transaction.id)}
                                                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
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

                        {/* Pagination */}
                        {pagination.pages > 1 && (
                            <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 flex items-center justify-between">
                                <div className="text-sm text-gray-700 dark:text-gray-300">
                                    Showing page {pagination.page} of {pagination.pages} ({pagination.total} total)
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => changePage(pagination.page - 1)}
                                        disabled={pagination.page === 1}
                                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Previous
                                    </button>
                                    <button
                                        onClick={() => changePage(pagination.page + 1)}
                                        disabled={pagination.page === pagination.pages}
                                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default TransactionList;