import { ECO_CATALOG } from "./ecoCatalog";
import type { OpeningNode } from "./types";

function stripMoveNumbers(value: string) {
  return value.replace(/\b\d+\.(?:\.\.)?/g, " ");
}

export function normalizeOpeningQuery(value: string) {
  return stripMoveNumbers(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[+#=,:()'’.-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function searchableText(node: OpeningNode) {
  return normalizeOpeningQuery([
    node.eco,
    node.name,
    ...node.aliases,
    node.pgn,
    node.san.join(" "),
    node.uci.join(" "),
  ].join(" "));
}

function score(node: OpeningNode, query: string) {
  const normalizedName = normalizeOpeningQuery(node.name);
  const aliases = node.aliases.map(normalizeOpeningQuery);
  const eco = node.eco.toLowerCase();
  const haystack = searchableText(node);
  if (normalizedName === query || aliases.includes(query) || eco === query) return 1000 - node.depth;
  if (normalizedName.startsWith(query) || aliases.some(alias => alias.startsWith(query))) return 800 - node.depth;
  if (eco.startsWith(query)) return 700 - node.depth;
  if (haystack.includes(query)) return 500 - node.depth;
  const terms = query.split(" ").filter(Boolean);
  if (terms.length && terms.every(term => haystack.includes(term))) return 250 - node.depth;
  return -1;
}

export function searchOpenings(query: string, limit = 80) {
  const needle = normalizeOpeningQuery(query);
  if (!needle) {
    return [...ECO_CATALOG]
      .sort((a, b) => a.depth - b.depth || a.eco.localeCompare(b.eco) || a.name.localeCompare(b.name))
      .slice(0, limit);
  }

  return ECO_CATALOG
    .map(node => ({ node, score: score(node, needle) }))
    .filter(entry => entry.score >= 0)
    .sort((a, b) => b.score - a.score || a.node.depth - b.node.depth || a.node.name.localeCompare(b.node.name))
    .slice(0, limit)
    .map(entry => entry.node);
}
