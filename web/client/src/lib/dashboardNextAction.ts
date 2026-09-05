import { analysisHrefForGame } from "./analysisRoute";
import type { StoredGame } from "./gameHistory";
import type { GameReviewProgress } from "./gameReviewCache";

type CompletedGameSummary = Pick<StoredGame, "id" | "fen" | "moves">;

export type DashboardNextAction = {
  href: string;
  label: string;
  copy: string;
  kind: "play" | "analyze" | "games" | "coach";
};

type DashboardNextActionInput = {
  resumeGameId: string | null;
  gamesCount: number;
  latestCompletedGame: CompletedGameSummary | null;
  latestReviewProgress: GameReviewProgress | null;
};

export function dashboardNextAction({
  resumeGameId,
  gamesCount,
  latestCompletedGame,
  latestReviewProgress,
}: DashboardNextActionInput): DashboardNextAction {
  if (resumeGameId) {
    return {
      href: `/play?resume=${encodeURIComponent(resumeGameId)}`,
      label: "Resume game",
      copy: "Continue your unfinished game exactly where you left it, with the saved board, clocks, side, and ChessIQ strength.",
      kind: "play",
    };
  }

  if (latestCompletedGame) {
    const reviewComplete = Boolean(
      latestReviewProgress
      && latestReviewProgress.total > 0
      && latestReviewProgress.reviewed >= latestReviewProgress.total,
    );
    const reviewStarted = Boolean(latestReviewProgress && latestReviewProgress.reviewed > 0);

    if (reviewComplete) {
      return {
        href: "/coach",
        label: "Open Coach",
        copy: "Your latest ChessIQ game is fully reviewed. Turn the verified decisions from that game into focused coaching and weakness training.",
        kind: "coach",
      };
    }

    return {
      href: analysisHrefForGame(latestCompletedGame.fen, latestCompletedGame.id),
      label: reviewStarted ? "Continue review" : "Review latest game",
      copy: reviewStarted
        ? `Continue the verified first-party Game Review from ${latestReviewProgress!.reviewed} of ${latestReviewProgress!.total} plies.`
        : "Review your latest completed ChessIQ game move by move with first-party engine evaluation and saved-game context.",
      kind: "analyze",
    };
  }

  if (gamesCount === 0) {
    return {
      href: "/play",
      label: "Start a game",
      copy: "Play your first game so ChessIQ can start connecting training with real board activity.",
      kind: "play",
    };
  }

  return {
    href: "/games",
    label: "Open games",
    copy: "Open Games to revisit a saved position, then carry it straight into Analyze.",
    kind: "games",
  };
}
