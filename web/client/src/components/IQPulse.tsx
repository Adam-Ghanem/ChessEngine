/**
 * ChessIQ Intelligence in Motion: a small animated engine signal used to reveal analytical state changes.
 */
interface IQPulseProps { active?: boolean; compact?: boolean; label?: string; }

export function IQPulse({ active = false, compact = false, label = "Engine signal" }: IQPulseProps) {
  return (
    <div className={`iq-pulse ${active ? "is-active" : ""} ${compact ? "is-compact" : ""}`} aria-label={label}>
      <svg viewBox="0 0 120 20" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 12 H20 L28 12 L34 5 L40 16 L48 9 L56 12 H78 L86 12 L92 7 L98 14 L105 11 H120" />
      </svg>
      <span className="iq-pulse-dot" />
    </div>
  );
}
