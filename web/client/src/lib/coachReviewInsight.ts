import type { MoveReviewClassification } from "./gameReview";
import { replayMoveContext, type StoredGame } from "./gameHistory";
import type { GameReviewCache } from "./gameReviewCache";

export type CoachReviewWeakness = {
  ply: number;
  playedMove: string;
  positionBeforeFen: string;
  label: "Inaccuracy" | "Mistake" | "Blunder";
  centipawnLoss: number;
};

type WeaknessLabel = CoachReviewWeakness["label"];

function isWeaknessLabel(label: MoveReviewClassification["label"]): label is WeaknessLabel {
  return label === "Inaccuracy" || label === "Mistake" || label === "Blunder";
}

function isPlayerPly(game: StoredGame, ply: number) {
  if (game.playerSide === "white") return ply % 2 === 1;
  if (game.playerSide === "black") return ply % 2 === 0;
  return false;
}

export function biggestReviewedWeakness(game: StoredGame, reviews: GameReviewCache): CoachReviewWeakness | null {
  let biggest: CoachReviewWeakness | null = null;

  for (const review of Object.values(reviews)) {
    const classification = review.classification;
    if (!classification || !isWeaknessLabel(classification.label) || !isPlayerPly(game, review.ply)) continue;

    const context = replayMoveContext(game, review.ply);
    if (!context) continue;

    if (!biggest || classification.centipawnLoss > biggest.centipawnLoss) {
      biggest = {
        ply: context.ply,
        playedMove: context.playedMove,
        positionBeforeFen: context.positionBeforeFen,
        label: classification.label,
        centipawnLoss: classification.centipawnLoss,
      };
    }
  }

  return biggest;
}
