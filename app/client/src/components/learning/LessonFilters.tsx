import { Search, SlidersHorizontal, X } from "lucide-react";

export type LessonFilterState = {
  query: string;
  family: string;
  sideFocus: string;
  difficulty: string;
};

type LessonFiltersProps = LessonFilterState & {
  resultCount: number;
  onQueryChange: (value: string) => void;
  onFamilyChange: (value: string) => void;
  onSideFocusChange: (value: string) => void;
  onDifficultyChange: (value: string) => void;
  onClear: () => void;
};

const FAMILY_OPTIONS = [
  ["all", "All families"],
  ["e4", "1.e4 open & semi-open"],
  ["sicilian-defenses", "Sicilian defenses"],
  ["d4", "1.d4 structures"],
  ["indian-defenses", "Indian defenses"],
  ["flank-and-systems", "Flank & systems"],
] as const;

export function LessonFilters({
  query,
  family,
  sideFocus,
  difficulty,
  resultCount,
  onQueryChange,
  onFamilyChange,
  onSideFocusChange,
  onDifficultyChange,
  onClear,
}: LessonFiltersProps) {
  const hasFilters = Boolean(query.trim()) || family !== "all" || sideFocus !== "all" || difficulty !== "all";

  return (
    <section className="lesson-filters" aria-label="Opening course filters">
      <label className="lesson-search-field">
        <Search size={16} aria-hidden="true" />
        <span className="sr-only">Search opening courses</span>
        <input
          aria-label="Search opening courses"
          value={query}
          onChange={event => onQueryChange(event.target.value)}
          placeholder="Search Italian, Sicilian, QGD, King's Indian..."
          type="search"
        />
      </label>

      <div className="lesson-filter-row">
        <SlidersHorizontal size={15} aria-hidden="true" />
        <label>
          <span>Family</span>
          <select value={family} onChange={event => onFamilyChange(event.target.value)}>
            {FAMILY_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
        <label>
          <span>Side</span>
          <select value={sideFocus} onChange={event => onSideFocusChange(event.target.value)}>
            <option value="all">Either side</option>
            <option value="white">White focus</option>
            <option value="black">Black focus</option>
            <option value="both">Both sides</option>
          </select>
        </label>
        <label>
          <span>Difficulty</span>
          <select value={difficulty} onChange={event => onDifficultyChange(event.target.value)}>
            <option value="all">All levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </label>
        <span className="lesson-result-count" aria-live="polite">{resultCount} courses</span>
        {hasFilters ? (
          <button type="button" className="lesson-clear-filters" onClick={onClear}>
            <X size={14} aria-hidden="true" /> Clear
          </button>
        ) : null}
      </div>
    </section>
  );
}
