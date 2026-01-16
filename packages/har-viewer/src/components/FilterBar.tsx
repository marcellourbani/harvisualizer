import React, { useState } from 'react';
import '@vscode-elements/elements/dist/vscode-single-select';
import '@vscode-elements/elements/dist/vscode-option';
import '@vscode-elements/elements/dist/vscode-textfield';

interface FilterBarProps {
  onFiltersChange: (filters: { method?: string; url?: string }) => void;
  availableMethods: string[];
}

const FilterBar: React.FC<FilterBarProps> = ({ onFiltersChange, availableMethods }) => {
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [urlFilter, setUrlFilter] = useState<string>('');

  const handleMethodChange = (event: Event) => {
    const target = event.target as HTMLSelectElement;
    const method = target.value;
    setSelectedMethod(method);
    onFiltersChange({ method: method === '' ? undefined : method, url: urlFilter === '' ? undefined : urlFilter });
  };

  const handleUrlFilterChange = (event: Event) => {
    const target = event.target as any;
    const url = target.value;
    setUrlFilter(url);
    onFiltersChange({ method: selectedMethod === '' ? undefined : selectedMethod, url: url === '' ? undefined : url });
  };

  return (
    <div>
      <vscode-single-select onChange={handleMethodChange as any} value={selectedMethod}>
        <vscode-option value="">All Methods</vscode-option>
        {availableMethods.map(method => (
          <vscode-option key={method} value={method}>{method}</vscode-option>
        ))}
      </vscode-single-select>
      <vscode-textfield
        placeholder="Filter by URL..."
        value={urlFilter}
        onInput={handleUrlFilterChange as any}
      />
    </div>
  );
};

export default FilterBar;
