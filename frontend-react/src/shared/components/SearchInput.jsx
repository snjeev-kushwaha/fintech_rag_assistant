/**
 * SearchInput.jsx — Reusable search input component
 */
export default function SearchInput({ value, onChange, placeholder, wrapClass, iconClass, inputClass, id }) {
  return (
    <div className={wrapClass}>
      <span className={iconClass}>🔍</span>
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
