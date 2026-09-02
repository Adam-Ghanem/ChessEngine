export type Lesson = {
  key: string;
  title: string;
  summary: string;
  difficulty: string;
  minutes: number;
  checkpoints: string[];
};

export const LEARN_STORAGE_KEY = "chessiq.learn.progress";

export const LESSONS: readonly Lesson[] = [
  {
    key: "checks-captures-threats",
    title: "Checks, captures, threats",
    summary: "Build the move-order habit that catches forcing tactics before you calculate quieter ideas.",
    difficulty: "Foundation",
    minutes: 7,
    checkpoints: [
      "Scan every legal check before choosing a candidate move.",
      "Compare forcing captures by material, king safety, and recapture sequence.",
      "Only then calculate direct threats and improving moves.",
    ],
  },
  {
    key: "piece-activity",
    title: "Improve your worst piece",
    summary: "Turn passive positions into plans by finding the piece contributing least to your position.",
    difficulty: "Intermediate",
    minutes: 9,
    checkpoints: [
      "Identify the least active piece and the squares it wants.",
      "Check whether a pawn break can open a useful file or diagonal.",
      "Recalculate forcing moves before committing to the positional plan.",
    ],
  },
  {
    key: "blunder-check",
    title: "The 10-second blunder check",
    summary: "Use a repeatable safety pass before every move to cut one-move mistakes from your games.",
    difficulty: "Essential",
    minutes: 5,
    checkpoints: [
      "After choosing a move, imagine it already played on the board.",
      "Ask what checks, captures, and threats your opponent gains immediately.",
      "If the move survives, compare it once more with your strongest alternative.",
    ],
  },
] as const;

export const LEARN_TOTAL_CHECKPOINTS = LESSONS.reduce((total, lesson) => total + lesson.checkpoints.length, 0);
export const LESSON_KEYS = new Set(LESSONS.map((lesson) => lesson.key));
