import React from 'react';
import { useContexts } from '../providers/AppProvider';

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
  const { isNightMode } = useContexts();

  const selectStyle: React.CSSProperties = {
    width: '100%',
    padding: 10,
    border: 'none',
    borderRadius: 3,
    backgroundColor: isNightMode ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.1)',
    color: isNightMode ? '#ffffff' : '#000000',
    height: '35px',
  };

  const optionStyle: React.CSSProperties = {
    padding: '15px 20px',
    backgroundColor: isNightMode ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.1)',
    color: isNightMode ? '#ffffff' : '#000000',
  };

  return (
    <div>
      <select
        style={selectStyle}
        value={selectedValue}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((option: Option) => (
          <option style={optionStyle} key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Dropdown;
