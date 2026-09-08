export type RepertoireSide = "white" | "black";

export type OpeningNode = {
  id: string;
  slug: string;
  eco: string;
  name: string;
  aliases: string[];
  pgn: string;
  san: string[];
  uci: string[];
  epd: string;
  parentId: string | null;
  depth: number;
  summary?: string;
  ideasWhite?: string[];
  ideasBlack?: string[];
  pawnStructure?: string;
  keySquares?: string[];
  typicalPlans?: string[];
  traps?: string[];
  modelGames?: string[];
  trainable: boolean;
  acceptableContinuations: string[];
};

export type OpeningCatalog = readonly OpeningNode[];

export type OpeningSearchResult = Pick<
  OpeningNode,
  "id" | "slug" | "eco" | "name" | "aliases" | "pgn" | "depth" | "summary" | "trainable"
>;
