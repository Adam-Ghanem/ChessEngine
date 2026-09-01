interface BrandMarkProps { compact?: boolean; }

export function BrandMark({ compact = false }: BrandMarkProps) {
  return (
    <div className="brand-lockup" aria-label="ChessIQ">
      <img
        className="brand-mark brand-logo-image"
        src="/chessiq-approved-emblem.webp"
        alt=""
        aria-hidden="true"
        draggable={false}
      />
      {!compact && <span className="brand-wordmark">Chess<span>IQ</span></span>}
    </div>
  );
}
