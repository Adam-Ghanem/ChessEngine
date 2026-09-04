import type { StoredGame } from "@/lib/gameHistory";

export type ComputerGameOutcomeSummary = {
  completed: number;
  wins: number;
  draws: number;
  losses: number;
};

export type ComputerGameFormResult = "win" | "draw" | "loss";

function playerComputerResult(game: StoredGame): ComputerGameFormResult | null {
  if (game.mode !== "computer" || !game.playerSide || !game.result) return null;
  if (game.result === "draw") return "draw";

  const playerWon = (game.playerSide === "white" && game.result === "white-win")
    || (game.playerSide === "black" && game.result === "black-win");
  return playerWon ? "win" : "loss";
}

export function summarizeComputerGameOutcomes(games: readonly StoredGame[]): ComputerGameOutcomeSummary {
  return games.reduce<ComputerGameOutcomeSummary>((summary, game) => {
    const result = playerComputerResult(game);
    if (!result) return summary;

    summary.completed += 1;
    if (result === "win") summary.wins += 1;
    else if (result === "draw") summary.draws += 1;
    else summary.losses += 1;
    return summary;
  }, { completed: 0, wins: 0, draws: 0, losses: 0 });
}

export function summarizeRecentComputerForm(games: readonly StoredGame[], limit = 5): ComputerGameFormResult[] {
  const safeLimit = Number.isFinite(limit) ? Math.max(0, Math.floor(limit)) : 5;
  if (safeLimit === 0) return [];

  const results: ComputerGameFormResult[] = [];
  for (const game of games) {
    const result = playerComputerResult(game);
    if (!result) continue;
    results.push(result);
    if (results.length >= safeLimit) break;
  }
  return results;
}
