import React, { forwardRef } from 'react';

interface FormFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  icon?: React.ReactNode;
  rightButton?: {
    icon: React.ReactNode;
    onClick: () => void;
    tooltip?: string;
  };
}

const FormField = forwardRef<HTMLInputElement, FormFieldProps>(({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  required = false,
  icon,
  rightButton,
}, ref) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === 'Tab') {
      // Let the parent handle auto-progression
      e.currentTarget.blur();
    }
  };

  return (
    <div>
      <label className="block text-sm font-sf-semibold text-gray-800 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          type={type}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          required={required}
          className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm font-sf-medium bg-white hover:border-gray-400 text-gray-900 placeholder-gray-500 min-h-[48px] ${
            icon ? 'pl-11' : ''
          } ${rightButton ? 'pr-11' : ''}`}
        />
        {rightButton && (
          <button
            type="button"
            onClick={rightButton.onClick}
            title={rightButton.tooltip}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors duration-200 p-1 rounded-lg hover:bg-blue-50 ring-2 ring-green-400 ring-opacity-50 shadow-lg shadow-green-400/30 hover:ring-green-500 hover:ring-opacity-70 hover:shadow-green-500/40"
          >
            {rightButton.icon}
          </button>
        )}
      </div>
    </div>
  );
});

FormField.displayName = 'FormField';

export default FormField;