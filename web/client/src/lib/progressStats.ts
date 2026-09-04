import type { StoredGame } from "@/lib/gameHistory";

export type ComputerGameOutcomeSummary = {
  completed: number;
  wins: number;
  draws: number;
  losses: number;
};

export function summarizeComputerGameOutcomes(games: readonly StoredGame[]): ComputerGameOutcomeSummary {
  return games.reduce<ComputerGameOutcomeSummary>((summary, game) => {
    if (game.mode !== "computer" || !game.playerSide || !game.result) return summary;

    summary.completed += 1;
    if (game.result === "draw") {
      summary.draws += 1;
      return summary;
    }

    const playerWon = (game.playerSide === "white" && game.result === "white-win")
      || (game.playerSide === "black" && game.result === "black-win");

    if (playerWon) summary.wins += 1;
    else summary.losses += 1;
    return summary;
  }, { completed: 0, wins: 0, draws: 0, losses: 0 });
}
