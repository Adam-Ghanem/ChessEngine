import { Chess } from "chess.js";
import { RAW_OPENINGS_A } from "./generated/a.generated";
import { RAW_OPENINGS_B } from "./generated/b.generated";
import { RAW_OPENINGS_C } from "./generated/c.generated";
import { RAW_OPENINGS_D } from "./generated/d.generated";
import { RAW_OPENINGS_E } from "./generated/e.generated";
import type { OpeningCatalog, OpeningNode } from "./types";

type RawOpeningRow = { eco: string; name: string; pgn: string };
type PreparedOpening = Omit<OpeningNode, "parentId" | "trainable" | "acceptableContinuations">;

const RAW_OPENINGS: RawOpeningRow[] = ([] as RawOpeningRow[]).concat(
  RAW_OPENINGS_A as unknown as RawOpeningRow[],
  RAW_OPENINGS_B as unknown as RawOpeningRow[],
  RAW_OPENINGS_C as unknown as RawOpeningRow[],
  RAW_OPENINGS_D as unknown as RawOpeningRow[],
  RAW_OPENINGS_E as unknown as RawOpeningRow[],
);

const FAMILY_ALIASES: Record<string, string[]> = {
  "Ruy Lopez": ["Spanish Opening", "Spanish Game"],
  "Sicilian Defense": ["Sicilian"],
  "Caro-Kann Defense": ["Caro Kann", "Caro-Kann"],
  "King's Indian Defense": ["KID", "Kings Indian"],
  "Queen's Indian Defense": ["QID"],
  "Nimzo-Indian Defense": ["Nimzo", "Nimzo Indian"],
  "Queen's Gambit": ["Queens Gambit"],
  "Queen's Gambit Declined": ["QGD"],
  "Queen's Gambit Accepted": ["QGA"],
  "English Opening": ["English"],
  "French Defense": ["French"],
  "Italian Game": ["Italian Opening"],
  "Grünfeld Defense": ["Grunfeld Defense", "Grunfeld"],
};

const FAMILY_GUIDES: Record<string, { summary: string; ideasWhite: string[]; ideasBlack: string[] }> = {
  "Ruy Lopez": {
    summary: "A long-term fight over e5 built around pressure, development, and carefully timed central breaks.",
    ideasWhite: ["Pressure e5", "Prepare d4", "Preserve flexible central tension"],
    ideasBlack: ["Challenge the bishop", "Complete development", "Prepare ...d5 counterplay"],
  },
  "Sicilian Defense": {
    summary: "Black creates an asymmetrical structure immediately and trades symmetry for active counterplay.",
    ideasWhite: ["Develop quickly", "Control d5", "Use the space advantage before Black's counterplay arrives"],
    ideasBlack: ["Pressure d4", "Use the c-file", "Create queenside and central counterplay"],
  },
  "Caro-Kann Defense": {
    summary: "A resilient answer to 1.e4 that challenges the center while keeping the light-squared bishop flexible.",
    ideasWhite: ["Use space to keep the initiative", "Develop before committing the center"],
    ideasBlack: ["Finish development safely", "Challenge White's center with timely breaks"],
  },
  "Queen's Gambit": {
    summary: "A classical challenge to Black's d5 pawn that leads to rich central and queenside structures.",
    ideasWhite: ["Pressure d5", "Develop smoothly", "Use c-file and queenside space"],
    ideasBlack: ["Manage central tension", "Activate the light-squared bishop", "Choose the right ...c5 or ...e5 break"],
  },
  "King's Indian Defense": {
    summary: "Black concedes central space in return for dynamic pawn breaks and attacking chances.",
    ideasWhite: ["Use central and queenside space", "Watch the kingside attack"],
    ideasBlack: ["Prepare ...e5 or ...c5", "Attack the base of White's center", "Build kingside pressure"],
  },
  "English Opening": {
    summary: "A flexible flank opening that controls d5 and can transpose into many queen-pawn structures.",
    ideasWhite: ["Stay flexible", "Use queenside space", "Time central breaks carefully"],
    ideasBlack: ["Choose symmetry or central occupation", "Contest d4 and d5", "Avoid passive copying"],
  },
};

function familyName(name: string) {
  return name.split(":", 1)[0]?.trim() || name;
}

function aliasesFor(name: string) {
  return FAMILY_ALIASES[familyName(name)] ?? [];
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function stableHash(value: string) {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

function normalizeEpd(fen: string) {
  return fen.split(" ").slice(0, 4).join(" ");
}

function parseLine(row: RawOpeningRow) {
  const chess = new Chess();
  chess.loadPgn(row.pgn);
  const history = chess.history({ verbose: true });
  return {
    san: history.map(move => move.san),
    uci: history.map(move => `${move.from}${move.to}${move.promotion ?? ""}`),
    epd: normalizeEpd(chess.fen()),
  };
}

function guideFor(name: string) {
  const family = familyName(name);
  return FAMILY_GUIDES[family] ?? {
    summary: `${name} is an ECO-classified opening line. Learn the move order first, then connect it to the recurring pawn breaks, piece placements, and tactical ideas in the position.`,
    ideasWhite: ["Develop with purpose", "Track central pawn breaks", "Keep the king safe"],
    ideasBlack: ["Contest the center", "Complete development", "Look for the thematic counterbreak"],
  };
}

function prepareRows(rows: RawOpeningRow[]): PreparedOpening[] {
  const parsed = rows.flatMap(row => {
    try {
      const line = parseLine(row);
      return [{ row, ...line }];
    } catch {
      return [];
    }
  });

  const shortestByName = new Map<string, number>();
  for (const item of parsed) {
    const current = shortestByName.get(item.row.name);
    if (current === undefined || item.uci.length < current) shortestByName.set(item.row.name, item.uci.length);
  }

  const seenPlainSlugs = new Set<string>();
  return parsed.map(item => {
    const baseSlug = slugify(item.row.name) || `opening-${item.row.eco.toLowerCase()}`;
    const canUsePlain = item.uci.length === shortestByName.get(item.row.name) && !seenPlainSlugs.has(baseSlug);
    const slug = canUsePlain ? baseSlug : `${baseSlug}--${item.row.eco.toLowerCase()}--${stableHash(item.row.pgn)}`;
    if (canUsePlain) seenPlainSlugs.add(baseSlug);
    const guide = guideFor(item.row.name);
    return {
      id: `${item.row.eco}:${slug}`,
      slug,
      eco: item.row.eco,
      name: item.row.name,
      aliases: aliasesFor(item.row.name),
      pgn: item.row.pgn,
      san: item.san,
      uci: item.uci,
      epd: item.epd,
      depth: item.uci.length,
      summary: guide.summary,
      ideasWhite: guide.ideasWhite,
      ideasBlack: guide.ideasBlack,
    };
  });
}

function buildCatalog(rows: RawOpeningRow[]): OpeningNode[] {
  const prepared = prepareRows(rows);
  const bySequence = new Map<string, PreparedOpening>();
  const nextMoves = new Map<string, Set<string>>();

  for (const node of prepared) {
    const key = node.uci.join(" ");
    const existing = bySequence.get(key);
    if (!existing || node.name.length < existing.name.length) bySequence.set(key, node);

    for (let length = 0; length < node.uci.length; length++) {
      const prefix = node.uci.slice(0, length).join(" ");
      const next = nextMoves.get(prefix) ?? new Set<string>();
      next.add(node.uci[length]);
      nextMoves.set(prefix, next);
    }
  }

  return prepared.map(node => {
    let parentId: string | null = null;
    for (let length = node.uci.length - 1; length > 0; length--) {
      const parent = bySequence.get(node.uci.slice(0, length).join(" "));
      if (parent && parent.id !== node.id) {
        parentId = parent.id;
        break;
      }
    }
    const continuations = Array.from(nextMoves.get(node.uci.join(" ")) ?? new Set<string>()).sort();
    return {
      ...node,
      parentId,
      trainable: continuations.length > 0,
      acceptableContinuations: continuations,
    };
  });
}

export const ECO_CATALOG: OpeningCatalog = buildCatalog(RAW_OPENINGS);

const BY_SLUG = new Map(ECO_CATALOG.map(node => [node.slug, node]));
const BY_ID = new Map(ECO_CATALOG.map(node => [node.id, node]));

export function getOpeningBySlug(slug: string) {
  return BY_SLUG.get(slug) ?? null;
}

export function getOpeningById(id: string) {
  return BY_ID.get(id) ?? null;
}

export function getOpeningsByEco(eco: string) {
  return ECO_CATALOG.filter(node => node.eco === eco.toUpperCase());
}

export function getOpeningChildren(id: string) {
  return ECO_CATALOG.filter(node => node.parentId === id);
}

export function getOpeningAncestors(id: string) {
  const ancestors: OpeningNode[] = [];
  let current = getOpeningById(id);
  const visited = new Set<string>();
  while (current?.parentId && !visited.has(current.parentId)) {
    visited.add(current.parentId);
    const parent = getOpeningById(current.parentId);
    if (!parent) break;
    ancestors.unshift(parent);
    current = parent;
  }
  return ancestors;
}
