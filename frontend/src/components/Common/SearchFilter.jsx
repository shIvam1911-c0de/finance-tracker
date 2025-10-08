import { useCallback } from 'react';

export const SearchFilter = ({ 
  searchTerm, 
  onSearch, 
  categories, 
  selectedCategory, 
  onCategoryChange 
}) => {
  const handleSearchChange = useCallback((e) => {
    onSearch(e.target.value);
  }, [onSearch]);

  const handleCategoryChange = useCallback((e) => {
    onCategoryChange(e.target.value);
  }, [onCategoryChange]);

  return (
    <div className="flex gap-4 mb-4">
      <input
        type="text"
        placeholder="Search transactions..."
        value={searchTerm}
        onChange={handleSearchChange}
        className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      
      <select
        value={selectedCategory}
        onChange={handleCategoryChange}
        className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">All Categories</option>
        {categories.map(category => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>
    </div>
  );
};