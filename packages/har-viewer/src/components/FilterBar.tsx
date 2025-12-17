import React, { useState } from 'react';

interface FilterBarProps {
  onFiltersChange: (filters: { method?: string; url?: string }) => void;
  availableMethods: string[];
}

const FilterBar: React.FC<FilterBarProps> = ({ onFiltersChange, availableMethods }) => {
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [urlFilter, setUrlFilter] = useState<string>('');

  const handleMethodChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const method = event.target.value;
    setSelectedMethod(method);
    onFiltersChange({ method: method === '' ? undefined : method, url: urlFilter === '' ? undefined : urlFilter });
  };

  const handleUrlFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const url = event.target.value;
    setUrlFilter(url);
    onFiltersChange({ method: selectedMethod === '' ? undefined : selectedMethod, url: url === '' ? undefined : url });
  };

  return (
    <div>
      <select onChange={handleMethodChange} value={selectedMethod}>
        <option value="">All Methods</option>
        {availableMethods.map(method => (
          <option key={method} value={method}>{method}</option>
        ))}
      </select>
      <input
        type="text"
        placeholder="Filter by URL..."
        value={urlFilter}
        onChange={handleUrlFilterChange}
      />
    </div>
  );
};

export default FilterBar;
