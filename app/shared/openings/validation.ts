import { Chess } from "chess.js";
import type { OpeningCatalog, OpeningNode } from "./types";

function isPrefix(parent: readonly string[], child: readonly string[]) {
  return parent.length < child.length && parent.every((move, index) => child[index] === move);
}

function applyUci(chess: Chess, uci: string) {
  return chess.move({
    from: uci.slice(0, 2),
    to: uci.slice(2, 4),
    promotion: uci[4] as "q" | "r" | "b" | "n" | undefined,
  });
}

function validateNodeLine(node: OpeningNode) {
  const errors: string[] = [];
  const chess = new Chess();
  for (const uci of node.uci) {
    try {
      if (!applyUci(chess, uci)) errors.push(`${node.id}: illegal move ${uci}`);
    } catch {
      errors.push(`${node.id}: illegal move ${uci}`);
      break;
    }
  }

  if (errors.length === 0) {
    const epd = chess.fen().split(" ").slice(0, 4).join(" ");
    if (epd !== node.epd) errors.push(`${node.id}: EPD does not match replayed line`);

    for (const continuation of node.acceptableContinuations) {
      const continuationPosition = new Chess(chess.fen());
      try {
        if (!applyUci(continuationPosition, continuation)) {
          errors.push(`${node.id}: illegal continuation ${continuation}`);
        }
      } catch {
        errors.push(`${node.id}: illegal continuation ${continuation}`);
      }
    }
  }
  return errors;
}

export function validateOpeningCatalog(catalog: OpeningCatalog) {
  const errors: string[] = [];
  const ids = new Set<string>();
  const slugs = new Set<string>();
  const byId = new Map(catalog.map(node => [node.id, node]));

  for (const node of catalog) {
    if (!/^[A-E](?:0\d|[1-9]\d)$/.test(node.eco)) errors.push(`${node.id}: invalid ECO ${node.eco}`);
    if (ids.has(node.id)) errors.push(`${node.id}: duplicate id`);
    if (slugs.has(node.slug)) errors.push(`${node.id}: duplicate slug ${node.slug}`);
    ids.add(node.id);
    slugs.add(node.slug);

    if (node.depth !== node.uci.length || node.depth !== node.san.length) {
      errors.push(`${node.id}: depth mismatch`);
    }

    if (node.parentId) {
      const parent = byId.get(node.parentId);
      if (!parent) errors.push(`${node.id}: missing parent ${node.parentId}`);
      else if (!isPrefix(parent.uci, node.uci)) errors.push(`${node.id}: parent line is not a strict prefix`);
    }

    if (node.trainable !== (node.acceptableContinuations.length > 0)) {
      errors.push(`${node.id}: trainable flag does not match continuations`);
    }

    errors.push(...validateNodeLine(node));
  }

  return errors;
}
