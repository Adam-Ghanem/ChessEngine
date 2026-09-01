interface BrandMarkProps { compact?: boolean; }

export function BrandMark({ compact = false }: BrandMarkProps) {
  return (
    <div className="brand-lockup" aria-label="ChessIQ">
      <svg className="brand-mark brand-logo-svg" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
        <circle className="brand-logo-q" cx="32" cy="32" r="24" />
        <path className="brand-logo-q" d="M46.5 46.5 55 55" />
        <path
          className="brand-logo-knight"
          d="M18 49h30l3 7H14c0-3 1-5 4-7Zm8-4c-2-6 1-13 7-18l-8-4 5-3 3-10 6 8c9 2 14 8 14 16 0 6-4 10-10 10h-7c-4 0-6 0-10 1Zm10-17c2 0 4 1 5 3l-6 3-3-3 4-3Z"
        />
        <circle className="brand-logo-eye" cx="38" cy="26.5" r="1.5" />
      </svg>
      {!compact && <span className="brand-wordmark">Chess<span>IQ</span></span>}
    </div>
  );
}
