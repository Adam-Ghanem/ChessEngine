/**
 * ChessIQ Intelligence in Motion: abstract calculation glyph with an IQ Pulse wordmark underline.
 */
interface BrandMarkProps { compact?: boolean; }

export function BrandMark({ compact = false }: BrandMarkProps) {
  return (
    <div className="brand-lockup" aria-label="ChessIQ">
      <img className="brand-mark" src="/manus-storage/chessiq-mark_9f1c1596.png" alt="" />
      {!compact && <span className="brand-wordmark">CHESS<span>IQ</span><i aria-hidden="true" /></span>}
    </div>
  );
}
