import React from 'react';
import './Dropdown.scss';

interface Option {
  value: string;
  label: string;
}

interface DropdownProps {
  options: Option[];
  selectedValue: string;
  onChange: (value: string) => void;
}

const Dropdown: React.FC<DropdownProps> = ({
  options,
  selectedValue,
  onChange,
}) => {
  return (
    <div className="language_options">
      <select value={selectedValue} onChange={(e) => onChange(e.target.value)}>
        {options.map((option: Option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Dropdown;
