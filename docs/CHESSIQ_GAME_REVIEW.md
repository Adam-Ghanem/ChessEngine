# ChessIQ Game Review Moment

The ChessIQ Game Review card is triggered by the **Analyze position** command and by selecting a classified move (Brilliant, Great, Best, Mistake, or Blunder). It presents a move label, classification icon, current evaluation, plain-language explanation, Share insight action, and Next move action. It uses its own ChessIQ violet, teal, gold, warning, and danger signal tones rather than copying the source app’s branding.

## Responsive validation

At desktop width, the card overlays the upper-right of the board without obscuring the evaluation spine or the analysis rail. At 390px, it becomes a full-width review card above the board, keeping the board priority and transport controls intact. The entry motion uses opacity and transform only, and it disables under reduced-motion preferences.
