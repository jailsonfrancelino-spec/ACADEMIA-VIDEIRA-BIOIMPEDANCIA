import React from 'react';

interface InputGroupProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
  step?: string;
  // Fix: Add optional disabled prop to allow disabling the input.
  disabled?: boolean;
}

const InputGroup: React.FC<InputGroupProps> = ({
  label,
  name,
  value,
  onChange,
  type = 'text',
  required = false,
  placeholder = '',
  step,
  disabled = false,
}) => {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-300 mb-2">
        {label}
      </label>
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        step={step}
        disabled={disabled}
        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200 disabled:bg-gray-800 disabled:text-gray-400 disabled:cursor-not-allowed"
      />
    </div>
  );
};

export default InputGroup;