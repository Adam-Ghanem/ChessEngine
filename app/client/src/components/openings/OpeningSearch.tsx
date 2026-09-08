import { Search, X } from "lucide-react";

export function OpeningSearch({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <label className="opening-search">
      <Search size={15} aria-hidden="true" />
      <span className="sr-only">Search openings</span>
      <input
        value={value}
        onChange={event => onChange(event.target.value)}
        placeholder="Name, ECO, or moves…"
        autoComplete="off"
        spellCheck={false}
      />
      {value ? (
        <button type="button" aria-label="Clear opening search" onClick={() => onChange("")}>
          <X size={14} />
        </button>
      ) : null}
    </label>
  );
}
