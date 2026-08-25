# ChessIQ Design System

## Intent

ChessIQ’s system is designed around **Intelligence in Motion**. Tokens are semantic rather than component-specific so live engine, PGN, and persisted analysis integrations can reuse the same presentation vocabulary without introducing visual drift.

| Token family | Dark mode role | Light mode role | Product meaning |
| --- | --- | --- | --- |
| `--iq-page` | Near-black graphite | Soft editorial stone | Stable application field. |
| `--iq-surface` | Elevated graphite | Warm paper surface | Dense working area. |
| `--iq-text` | Warm white | Charcoal | High-priority chess content. |
| `--iq-violet` | Electric violet | Deep violet | Active calculation and selected intelligence. |
| `--iq-teal` | Cool teal | Deep teal | Engine readiness, continuity, and informational progress. |
| `--iq-gold` | Muted gold | Burnished gold | Brilliant chess insight. |
| `--iq-warning` / `--iq-danger` | Amber / red | Amber / red | Inaccuracy, mistake, and blunder without ambiguity. |

## Typography

| Role | Family | Usage |
| --- | --- | --- |
| Display and headings | Space Grotesk | Page title, analysis section title, major state. |
| Body and controls | Inter | Product copy, explanatory text, navigation, action labels. |
| Technical detail | JetBrains Mono | SAN, evaluation, depth, nodes, engine line, calibration labels. |

## Spacing, shape, and elevation

The system follows a four-point spatial scale: `--space-1` through `--space-9`. `--radius-1` is used for compact controls, `--radius-2` for panels, and `--radius-3` only for major overlays. The visual system favors precise lines and inset depth over rounded card clusters. Elevation is limited to `--shadow-1`, `--shadow-2`, and `--shadow-3`.

## Motion

| Token | Duration | Primary use |
| --- | --- | --- |
| `--motion-micro` | 120ms | Press feedback, badges, focus state. |
| `--motion-fast` | 180ms | Tab, list, and move selection. |
| `--motion-normal` | 280ms | Graph cursor, engine panels, board-adjacent state. |
| `--motion-major` | 420ms | Try Again sheet, major explanation reveal. |

`--ease-iq-out` provides responsive entrances, `--ease-iq-move` handles board and graph movement, and all nonessential motion obeys `prefers-reduced-motion`.

## Responsive system

Desktop uses the analysis corridor. Tablet retains the board’s scale and collapses technical density. Mobile follows the board-first order: board, evaluation, move transport, engine insight, explanation, graph. A bottom sheet is reserved for multi-PV, advanced statistics, and other secondary analysis detail.
