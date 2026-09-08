export type OpeningLessonFamily =
  | "e4"
  | "sicilian-defenses"
  | "d4"
  | "indian-defenses"
  | "flank-and-systems";

export type OpeningLessonSideFocus = "white" | "black" | "both";
export type OpeningLessonDifficulty = "beginner" | "intermediate" | "advanced";
export type OpeningLessonKind = "explain" | "demonstrate" | "checkpoint" | "recap";
export type OpeningLearningPoint =
  | "plan"
  | "mistake"
  | "trap"
  | "pawn-structure"
  | "key-square"
  | "thematic-break";

export type BoardAnnotation =
  | { kind: "arrow"; from: string; to: string; label: string }
  | { kind: "highlight" | "key-squares" | "pawn-structure" | "zone"; squares: string[]; label: string }
  | { kind: "candidate-move"; move: string; label: string };

export type OpeningLessonProfile = {
  key: string;
  slug: string;
  title: string;
  family: OpeningLessonFamily;
  sideFocus: OpeningLessonSideFocus;
  difficulty: OpeningLessonDifficulty;
  ecoRange: string;
  canonicalQuery: string;
  canonicalFallback?: string;
  summary: string;
  strategicPlan: string;
  opponentPlan: string;
  commonMistake: string;
  trapWarning: string;
  structureIdea: string;
  thematicBreak: string;
  keySquares: string[];
  tags: string[];
  prerequisites?: string[];
};

export type OpeningLessonStep = {
  id: string;
  kind: OpeningLessonKind;
  openingNodeId: string;
  ply: number;
  title: string;
  body: string;
  learningPoint?: OpeningLearningPoint;
  annotations?: BoardAnnotation[];
  acceptedMoves?: string[];
  feedback?: { correct: string; incorrect: string };
};

export type OpeningLessonChapter = {
  id: string;
  title: string;
  objective: string;
  steps: OpeningLessonStep[];
};

export type OpeningLesson = {
  key: string;
  slug: string;
  title: string;
  summary: string;
  family: OpeningLessonFamily;
  sideFocus: OpeningLessonSideFocus;
  difficulty: OpeningLessonDifficulty;
  ecoRange: string;
  tags: string[];
  prerequisites: string[];
  openingNodeId: string;
  openingSlug: string;
  canonicalName: string;
  canonicalEco: string;
  chapters: OpeningLessonChapter[];
};
