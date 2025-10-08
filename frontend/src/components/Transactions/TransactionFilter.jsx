import { useState, useCallback } from 'react';

const TransactionFilter = ({ filters, onFilterChange }) => {
    const [localFilters, setLocalFilters] = useState(filters);

    const handleChange = useCallback((e) => {
        setLocalFilters({
            ...localFilters,
            [e.target.name]: e.target.value
        });
    }, [localFilters]);

    const handleApply = useCallback(() => {
        onFilterChange(localFilters);
    }, [localFilters, onFilterChange]);

    const handleReset = useCallback(() => {
        const emptyFilters = {
            type: '',
            category: '',
            search: '',
            startDate: '',
            endDate: ''
        };
        setLocalFilters(emptyFilters);
        onFilterChange(emptyFilters);
    }, [onFilterChange]);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Filters
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Type
                    </label>
                    <select
                        name="type"
                        value={localFilters.type || ''}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                        <option value="">All</option>
                        <option value="income">Income</option>
                        <option value="expense">Expense</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Search
                    </label>
                    <input
                        type="text"
                        name="search"
                        value={localFilters.search || ''}
                        onChange={handleChange}
                        placeholder="Search..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Start Date
                    </label>
                    <input
                        type="date"
                        name="startDate"
                        value={localFilters.startDate || ''}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        End Date
                    </label>
                    <input
                        type="date"
                        name="endDate"
                        value={localFilters.endDate || ''}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                </div>

                <div className="flex items-end space-x-2">
                    <button
                        onClick={handleApply}
                        className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Apply
                    </button>
                    <button
                        onClick={handleReset}
                        className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                    >
                        Reset
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TransactionFilter;