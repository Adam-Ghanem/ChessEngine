export type PlaySidePreference = "white" | "black" | "random";
export type PlayerSide = "white" | "black";

export const PLAY_SIDE_STORAGE_KEY = "chessiq-play-side";

export const PLAY_SIDE_OPTIONS: readonly { id: PlaySidePreference; label: string; detail: string }[] = [
  { id: "white", label: "White", detail: "You move first" },
  { id: "black", label: "Black", detail: "ChessIQ opens" },
  { id: "random", label: "Random", detail: "Choose each game" },
];

export function getPlaySide(value: unknown): PlaySidePreference {
  return value === "black" || value === "random" ? value : "white";
}

export function resolvePlayerSide(preference: PlaySidePreference, random: () => number = Math.random): PlayerSide {
  if (preference === "white" || preference === "black") return preference;
  return random() < 0.5 ? "white" : "black";
}

export function oppositeSide(side: PlayerSide): PlayerSide {
  return side === "white" ? "black" : "white";
}
