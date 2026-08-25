/**
 * Calculated Fieldwork design system: classification is conveyed with semantic text, symbol, and restrained color.
 */
import { classificationMeta, type MoveClassification } from "@/types/analysis";

interface ClassificationBadgeProps {
  classification: MoveClassification;
  compact?: boolean;
}

export function ClassificationBadge({ classification, compact = false }: ClassificationBadgeProps) {
  const meta = classificationMeta[classification];

  return (
    <span className={`classification-badge tone-${meta.tone} ${compact ? "is-compact" : ""}`}>
      <span aria-hidden="true">{meta.symbol}</span>
      <span>{compact ? meta.shortLabel : meta.label}</span>
    </span>
  );
}
