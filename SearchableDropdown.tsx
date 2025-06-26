import React, { useState, useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import { ChevronDown, Search, X, Check } from 'lucide-react';

interface SearchableDropdownProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  required?: boolean;
  searchPlaceholder?: string;
  isAirport?: boolean;
  tabIndex?: number;
}

export interface SearchableDropdownRef {
  openDropdown: () => void;
  focus: () => void;
}

const SearchableDropdown = forwardRef<SearchableDropdownRef, SearchableDropdownProps>(({
  label,
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  required = false,
  searchPlaceholder = 'Search...',
  isAirport = false,
  tabIndex
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    openDropdown: () => {
      setIsOpen(true);
    },
    focus: () => {
      if (dropdownRef.current) {
        const button = dropdownRef.current.querySelector('button');
        if (button) {
          button.focus();
        }
      }
    }
  }));

  // Memoize filtered options to prevent unnecessary recalculations
  const filteredOptions = React.useMemo(() => {
    if (!searchTerm.trim()) return options;
    return options.filter(option =>
      option.toLowerCase().includes(searchTerm.toLowerCase().trim())
    );
  }, [options, searchTerm]);

  // Memoized handlers to prevent unnecessary re-renders
  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setIsOpen(false);
      setSearchTerm('');
      setHighlightedIndex(-1);
    }
  }, []);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!isOpen) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        event.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        );
        break;
      case 'Enter':
        event.preventDefault();
        if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
          handleSelect(filteredOptions[highlightedIndex]);
        }
        break;
      case 'Escape':
        event.preventDefault();
        setIsOpen(false);
        setSearchTerm('');
        setHighlightedIndex(-1);
        break;
    }
  }, [isOpen, highlightedIndex, filteredOptions]);

  const handleSelect = useCallback((option: string) => {
    onChange(option);
    setIsOpen(false);
    setSearchTerm('');
    setHighlightedIndex(-1);
  }, [onChange]);

  const handleToggle = useCallback(() => {
    setIsOpen(prev => {
      if (!prev) {
        // Opening dropdown
        setSearchTerm('');
        setHighlightedIndex(-1);
      }
      return !prev;
    });
  }, []);

  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setHighlightedIndex(-1);
    // Use setTimeout to ensure the input is focused after state update
    setTimeout(() => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, 0);
  }, []);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setHighlightedIndex(-1);
  }, []);

  // Handle click outside to close dropdown
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, handleClickOutside]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      // Use setTimeout to ensure the input is rendered and focusable
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, 0);
    }
  }, [isOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  // Scroll highlighted option into view
  useEffect(() => {
    if (highlightedIndex >= 0 && optionsRef.current && isOpen) {
      const highlightedElement = optionsRef.current.children[highlightedIndex] as HTMLElement;
      if (highlightedElement) {
        highlightedElement.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth'
        });
      }
    }
  }, [highlightedIndex, isOpen]);

  // Reset highlighted index when filtered options change
  useEffect(() => {
    if (highlightedIndex >= filteredOptions.length) {
      setHighlightedIndex(-1);
    }
  }, [filteredOptions.length, highlightedIndex]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Ensure all event listeners are cleaned up
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleClickOutside, handleKeyDown]);

  return (
    <div ref={dropdownRef} className="relative">
      <label className="block text-sm font-sf-semibold text-gray-800 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      {/* Selected Value Display */}
      <button
        type="button"
        onClick={handleToggle}
        tabIndex={tabIndex}
        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-sf-medium bg-white transition-all duration-200 hover:border-gray-400 text-left text-gray-900 min-h-[48px] flex items-center justify-between"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={`${label}${required ? ' (required)' : ''}`}
      >
        {isAirport && value ? (
          <div className="flex items-center justify-between flex-1 mr-2">
            <span className="font-sf-bold text-blue-700 text-sm">
              {value.split(' - ')[0]}
            </span>
            <span className="text-gray-700 text-sm font-sf-medium">
              {value.split(' - ')[1]}
            </span>
          </div>
        ) : (
          <span className={value ? 'text-gray-900' : 'text-gray-500 truncate'}>
            {value || placeholder}
          </span>
        )}
        <ChevronDown 
          size={18} 
          className={`text-gray-400 transition-transform duration-200 flex-shrink-0 ml-2 ${
            isOpen ? 'transform rotate-180' : ''
          }`} 
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl z-[9999] max-h-96 flex flex-col">
          {/* Search Header */}
          <div className="p-4 border-b border-gray-100 bg-gray-50 rounded-t-xl">
            <div className="relative">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                <Search size={16} />
              </div>
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder={searchPlaceholder}
                className="w-full pl-11 pr-11 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-sf-medium bg-white transition-all duration-200 text-gray-900 placeholder-gray-500"
                autoComplete="off"
                spellCheck="false"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
                  aria-label="Clear search"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            

          </div>

          {/* Recent Searches Header */}
          {!searchTerm && isAirport && (
            <div className="px-5 py-3 bg-white border-b border-gray-100">
              <h3 className="text-xs font-sf-bold text-gray-400 uppercase tracking-wider">RECENT SEARCHES</h3>
            </div>
          )}

          {/* Options List */}
          <div 
            ref={optionsRef} 
            className="flex-1 overflow-y-auto"
            role="listbox"
            aria-label={`${label} options`}
          >
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleSelect(option)}
                  className={`w-full px-5 py-4 text-left hover:bg-blue-50 transition-colors text-sm font-sf-medium border-b border-gray-50 last:border-b-0 flex items-center justify-between ${
                    index === highlightedIndex 
                      ? 'bg-blue-50 text-blue-700' 
                      : value === option
                      ? 'bg-blue-100 text-blue-800'
                      : 'text-gray-900'
                  }`}
                  role="option"
                  aria-selected={value === option}
                  aria-label={option}
                >
                  {isAirport ? (
                    <div className="flex-1 flex flex-col pr-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-900 text-sm font-sf-medium">
                          {(() => {
                            const code = option.split(' - ')[0];
                            const city = option.split(' - ')[1];
                            // Determine country based on travel mode context
                            const isDomestic = ['BOM', 'DEL', 'BLR', 'MAA', 'CCU', 'HYD', 'PNQ', 'AMD', 'JAI', 'LKO', 'NAG', 'IDR', 'BHO', 'VTZ', 'PAT', 'BDQ', 'LUH', 'AGR', 'ISK', 'IXA', 'RAJ', 'VNS', 'SXR', 'JDH', 'ATQ', 'RPR', 'IXD', 'CJB', 'JBP', 'GWL', 'VGA', 'IXM', 'GAU', 'IXC', 'HBX', 'RNC'].includes(code);
                            
                            if (isDomestic) {
                              return `${city}, India`;
                            }
                            
                            // International airports
                            const countryMap: Record<string, string> = {
                              'JFK': 'USA', 'LHR': 'UK', 'CDG': 'France', 'NRT': 'Japan', 'DXB': 'UAE',
                              'SIN': 'Singapore', 'HKG': 'Hong Kong', 'SYD': 'Australia', 'YYZ': 'Canada',
                              'LAX': 'USA', 'FRA': 'Germany', 'AMS': 'Netherlands', 'BKK': 'Thailand',
                              'KUL': 'Malaysia', 'ICN': 'South Korea', 'PEK': 'China', 'PVG': 'China',
                              'FCO': 'Italy', 'BCN': 'Spain', 'TXL': 'Germany', 'VIE': 'Austria',
                              'ZUR': 'Switzerland', 'ARN': 'Sweden', 'CPH': 'Denmark', 'OSL': 'Norway',
                              'HEL': 'Finland', 'BRU': 'Belgium', 'PRG': 'Czech Republic', 'BUD': 'Hungary',
                              'WAW': 'Poland', 'IST': 'Turkey', 'CAI': 'Egypt', 'JNB': 'South Africa',
                              'CPT': 'South Africa', 'GRU': 'Brazil', 'GIG': 'Brazil', 'EZE': 'Argentina',
                              'MEX': 'Mexico', 'YVR': 'Canada', 'YUL': 'Canada', 'MEL': 'Australia',
                              'PER': 'Australia', 'AKL': 'New Zealand', 'WLG': 'New Zealand',
                              'MNL': 'Philippines', 'CGK': 'Indonesia', 'SGN': 'Vietnam', 'HAN': 'Vietnam',
                              'CMB': 'Sri Lanka', 'DAC': 'Bangladesh'
                            };
                            
                            return `${city}, ${countryMap[code] || 'International'}`;
                          })()}
                        </span>
                        <span className="font-sf-bold text-gray-600 text-sm">
                          {option.split(' - ')[0]}
                        </span>
                      </div>
                      <span className="text-gray-500 text-xs font-sf-regular mt-1">
                        {(() => {
                          const code = option.split(' - ')[0];
                          const airportNames: Record<string, string> = {
                            'BOM': 'Chhatrapati Shivaji Maharaj International Airport',
                            'DEL': 'Indira Gandhi International Airport',
                            'BLR': 'Kempegowda International Airport',
                            'MAA': 'Chennai International Airport',
                            'CCU': 'Netaji Subhas Chandra Bose International Airport',
                            'HYD': 'Rajiv Gandhi International Airport',
                            'JFK': 'John F. Kennedy International Airport',
                            'LHR': 'Heathrow Airport',
                            'CDG': 'Charles de Gaulle Airport',
                            'DXB': 'Dubai International Airport',
                            'SIN': 'Singapore Changi Airport',
                            'HKG': 'Hong Kong International Airport',
                            'IXM': 'Madurai Airport'
                          };
                          return airportNames[code] || `${option.split(' - ')[1]} Airport`;
                        })()}
                      </span>
                    </div>
                  ) : (
                    <span className="flex-1 truncate pr-3">{option}</span>
                  )}
                  {value === option && (
                    <Check size={16} className="text-blue-600 flex-shrink-0" />
                  )}
                </button>
              ))
            ) : (
              <div className="px-5 py-12 text-center text-gray-500">
                <Search size={32} className="mx-auto mb-3 text-gray-300" />
                <p className="text-sm font-sf-medium">No options found</p>
                {searchTerm && (
                  <p className="text-xs font-sf-regular mt-2 text-gray-400">
                    Try adjusting your search term
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Footer with selection info */}
          {filteredOptions.length > 0 && (
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 rounded-b-xl">
              <p className="text-xs font-sf-medium text-gray-600">
                Use ↑↓ arrow keys to navigate, Enter to select, Esc to close
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

SearchableDropdown.displayName = 'SearchableDropdown';

export default SearchableDropdown;