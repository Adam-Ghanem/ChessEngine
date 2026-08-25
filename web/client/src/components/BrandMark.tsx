/**
 * ChessIQ Intelligence in Motion: abstract calculation glyph with an IQ Pulse wordmark underline.
 */
interface BrandMarkProps { compact?: boolean; }

export function BrandMark({ compact = false }: BrandMarkProps) {
  return (
    <div className="brand-lockup" aria-label="ChessIQ">
      <span className="brand-mark brand-mark-glyph" aria-hidden="true"><i /><b /></span>
      {!compact && <span className="brand-wordmark">CHESS<span>IQ</span><i aria-hidden="true" /></span>}
    </div>
  );
}
