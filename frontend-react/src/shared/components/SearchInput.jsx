/**
 * SearchInput.jsx — Reusable search input component
 */
import { Search } from 'react-bootstrap-icons';

export default function SearchInput({ value, onChange, placeholder, wrapClass, iconClass, inputClass, id }) {
  return (
    <div className={wrapClass}>
      <span className={iconClass}>
        <Search size={14} />
      </span>
      <input
        id={id}
        type="text"
        placeholder={placeholder}
        className={inputClass}
        value={value}
        onChange={onChange}
      />
    </div>
  );
}
