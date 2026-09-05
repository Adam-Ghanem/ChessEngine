import { describe, expect, it } from "vitest";
import { dashboardNextAction } from "./dashboardNextAction";

const completedGame = {
  id: "game-42",
  fen: "8/8/8/8/8/8/8/K6k w - - 0 1",
  moves: ["e2e4", "e7e5", "g1f3", "b8c6"],
};

describe("dashboardNextAction", () => {
  it("prioritizes an unfinished game over review work", () => {
    expect(dashboardNextAction({
      resumeGameId: "game-live",
      gamesCount: 3,
      latestCompletedGame: completedGame,
      latestReviewProgress: { reviewed: 4, total: 4, depth: 12 },
    })).toMatchObject({
      href: "/play?resume=game-live",
      label: "Resume game",
      kind: "play",
    });
  });

  it("continues a partial verified Game Review", () => {
    expect(dashboardNextAction({
      resumeGameId: null,
      gamesCount: 2,
      latestCompletedGame: completedGame,
      latestReviewProgress: { reviewed: 2, total: 4, depth: 12 },
    })).toMatchObject({
      label: "Continue review",
      kind: "analyze",
    });
  });

  it("moves a fully reviewed game into Coach instead of looping back to Analyze", () => {
    expect(dashboardNextAction({
      resumeGameId: null,
      gamesCount: 2,
      latestCompletedGame: completedGame,
      latestReviewProgress: { reviewed: 4, total: 4, depth: 12 },
    })).toMatchObject({
      href: "/coach",
      label: "Open Coach",
      kind: "coach",
    });
  });

  it("starts review when a completed game has no persisted review yet", () => {
    expect(dashboardNextAction({
      resumeGameId: null,
      gamesCount: 1,
      latestCompletedGame: completedGame,
      latestReviewProgress: null,
    })).toMatchObject({
      label: "Review latest game",
      kind: "analyze",
    });
  });
});
