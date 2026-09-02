export type PuzzleDifficulty = "Starter" | "Intermediate" | "Advanced";

export type PuzzleDefinition = {
  id: string;
  title: string;
  theme: string;
  difficulty: PuzzleDifficulty;
  fen: string;
  prompt: string;
  solution: string[];
  explanation: string;
};

export const PUZZLE_STORAGE_KEY = "chessiq-puzzles-solved-v1";

export const PUZZLES: readonly PuzzleDefinition[] = [
  {
    id: "back-rank",
    title: "Back-rank finish",
    theme: "Mate in one",
    difficulty: "Starter",
    fen: "6k1/5ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1",
    prompt: "White to move. Find the forcing finish on the board.",
    solution: ["d1d8"],
    explanation: "Rd8# seals the eighth rank. Black has no flight square and no piece can interpose.",
  },
  {
    id: "fork",
    title: "Knight fork",
    theme: "Double attack",
    difficulty: "Intermediate",
    fen: "4k3/8/8/3q4/4N3/8/8/4K3 w - - 0 1",
    prompt: "White to move. Find the knight jump that checks the king and attacks the queen.",
    solution: ["e4f6"],
    explanation: "Nf6+ attacks the king and queen at the same time, forcing the king to respond before the queen can move.",
  },
  {
    id: "remove-defender",
    title: "Remove the defender",
    theme: "Tactical conversion",
    difficulty: "Advanced",
    fen: "4r1k1/5ppp/8/8/2B5/8/5PPP/4R1K1 w - - 0 1",
    prompt: "White to move. Win the exchange with the cleanest forcing move.",
    solution: ["e1e8"],
    explanation: "Rxe8+ removes the rook with tempo. The check forces the reply and converts the tactical advantage immediately.",
  },
  {
    id: "rook-lift-mate",
    title: "Rook lift mate",
    theme: "Back-rank geometry",
    difficulty: "Starter",
    fen: "7k/6pp/8/8/8/8/6PP/5RK1 w - - 0 1",
    prompt: "White to move. Use the open f-file to finish the game immediately.",
    solution: ["f1f8"],
    explanation: "Rf8# attacks the trapped king along the eighth rank while Black's own pawns remove every escape square.",
  },
  {
    id: "queen-net",
    title: "Queen net",
    theme: "Mate in one",
    difficulty: "Intermediate",
    fen: "6k1/5ppp/7Q/8/8/8/8/6RK w - - 0 1",
    prompt: "White to move. Find the queen capture that is protected all the way from the first rank.",
    solution: ["h6g7"],
    explanation: "Qxg7# is protected by the rook on g1. The queen covers the remaining flight squares and the king cannot capture it.",
  },
  {
    id: "protected-skewer",
    title: "Protected skewer",
    theme: "Win the queen",
    difficulty: "Advanced",
    fen: "4k3/4q3/8/8/1B6/8/8/4R1K1 w - - 0 1",
    prompt: "White to move. Capture the queen with check without allowing the king to win the rook back.",
    solution: ["e1e7"],
    explanation: "Rxe7+ wins the queen. The bishop on b4 protects e7, so the king cannot simply capture the rook.",
  },
  {
    id: "promotion-tempo",
    title: "Promotion with tempo",
    theme: "Endgame conversion",
    difficulty: "Starter",
    fen: "k7/6P1/4K3/8/8/8/8/8 w - - 0 1",
    prompt: "White to move. Promote in the most forcing way.",
    solution: ["g7g8q"],
    explanation: "g8=Q+ promotes with check across the eighth rank, gaining a tempo and making the winning conversion straightforward.",
  },
  {
    id: "loose-queen",
    title: "Loose queen",
    theme: "Hanging piece",
    difficulty: "Starter",
    fen: "4k3/8/8/3q4/8/2N5/8/4K3 w - - 0 1",
    prompt: "White to move. Spot the undefended queen before calculating anything deeper.",
    solution: ["c3d5"],
    explanation: "Nxd5 simply takes the loose queen. Strong calculation starts by checking forcing captures before searching for complications.",
  },
  {
    id: "rook-pickup",
    title: "Rook pickup",
    theme: "Forcing capture",
    difficulty: "Intermediate",
    fen: "4k3/8/8/8/8/8/4R2r/4K3 w - - 0 1",
    prompt: "White to move. Remove the invading rook immediately.",
    solution: ["e2h2"],
    explanation: "Rxh2 removes the loose rook on h2 along the second rank while keeping the position simple and controlled.",
  },
] as const;

export const PUZZLE_TOTAL = PUZZLES.length;
export const PUZZLE_IDS = new Set(PUZZLES.map((puzzle) => puzzle.id));
