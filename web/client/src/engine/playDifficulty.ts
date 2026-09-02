export type PlayDifficultyId = "easy" | "medium" | "hard";

export type PlayDifficulty = {
  id: PlayDifficultyId;
  label: string;
  depth: number;
  detail: string;
};

export const PLAY_DIFFICULTIES: readonly PlayDifficulty[] = [
  { id: "easy", label: "Easy", depth: 3, detail: "Faster, lighter calculation" },
  { id: "medium", label: "Medium", depth: 5, detail: "Balanced ChessIQ strength" },
  { id: "hard", label: "Hard", depth: 7, detail: "Deeper first-party search" },
] as const;

export const PLAY_DIFFICULTY_STORAGE_KEY = "chessiq.play.difficulty";

export function getPlayDifficulty(value: unknown): PlayDifficulty {
  return PLAY_DIFFICULTIES.find(level => level.id === value) ?? PLAY_DIFFICULTIES[1];
}
