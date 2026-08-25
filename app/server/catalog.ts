export const lessonCatalog = [
  { key: "opening-principles", title: "Opening principles", summary: "Develop pieces, control the center, and safeguard the king.", steps: 3, difficulty: "Foundation" },
  { key: "tactical-motifs", title: "Tactical motifs", summary: "Spot forks, pins, skewers, and overloaded defenders.", steps: 4, difficulty: "Intermediate" },
  { key: "endgame-activity", title: "Endgame activity", summary: "Activate the king and create passed-pawn chances.", steps: 3, difficulty: "Advanced" },
] as const;

export const puzzleCatalog = [
  { key: "rook-lift", title: "Rook lift", fen: "r1bq1rk1/ppp2ppp/2n1pn2/8/2B5/2N1PN2/PPPQ1PPP/2RR2K1 w - - 0 1", solution: ["c3b5"], themes: ["development", "pressure"], difficulty: "Foundation" },
  { key: "central-break", title: "Central break", fen: "r1bq1rk1/ppp2ppp/2n1pn2/8/2B5/2N1PN2/PPPQ1PPP/2RR2K1 w - - 0 1", solution: ["e3e4"], themes: ["center", "initiative"], difficulty: "Intermediate" },
] as const;
