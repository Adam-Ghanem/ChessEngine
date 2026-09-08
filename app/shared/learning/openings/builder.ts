import { normalizeOpeningQuery, searchOpenings } from "../../openings/search";
import type { OpeningNode } from "../../openings/types";
import type { OpeningLesson, OpeningLessonProfile, OpeningLessonStep } from "./types";

const SOFT_WORDS = new Set(["defense", "opening", "game", "variation", "system", "attack", "gambit", "the", "classical"]);

function queryVariants(profile: OpeningLessonProfile) {
  const raw = [profile.canonicalQuery, profile.canonicalFallback, profile.title].filter((value): value is string => Boolean(value?.trim()));
  const relaxed = raw.flatMap(value => {
    const words = normalizeOpeningQuery(value).split(" ").filter(Boolean);
    const meaningful = words.filter(word => !SOFT_WORDS.has(word));
    return [value, meaningful.join(" "), meaningful.slice(0, 2).join(" "), meaningful[0] ?? ""];
  });
  return [...new Set(relaxed.map(value => value.trim()).filter(Boolean))];
}

function pickCandidate(results: OpeningNode[], query: string) {
  const normalizedQuery = normalizeOpeningQuery(query);
  const viable = results.filter(node => node.uci.length >= 6);
  const pool = viable.length ? viable : results.filter(node => node.uci.length >= 4);
  return [...pool].sort((a, b) => {
    const aName = normalizeOpeningQuery(a.name);
    const bName = normalizeOpeningQuery(b.name);
    const aExact = aName === normalizedQuery ? 1 : 0;
    const bExact = bName === normalizedQuery ? 1 : 0;
    if (aExact !== bExact) return bExact - aExact;
    const aContains = aName.includes(normalizedQuery) ? 1 : 0;
    const bContains = bName.includes(normalizedQuery) ? 1 : 0;
    if (aContains !== bContains) return bContains - aContains;
    return b.uci.length - a.uci.length || a.eco.localeCompare(b.eco) || a.name.localeCompare(b.name);
  })[0] ?? null;
}

export function resolveOpeningLessonNode(profile: OpeningLessonProfile) {
  for (const query of queryVariants(profile)) {
    const candidate = pickCandidate(searchOpenings(query, 100), query);
    if (candidate) return candidate;
  }
  throw new Error(`No canonical opening line with enough depth for lesson ${profile.key}`);
}

function safePly(node: OpeningNode, wanted: number) {
  return Math.max(0, Math.min(wanted, Math.max(0, node.uci.length - 1)));
}

function checkpoint(profile: OpeningLessonProfile, node: OpeningNode, id: string, ply: number, title: string, correct: string, incorrect: string): OpeningLessonStep {
  const move = node.uci[ply];
  if (!move) throw new Error(`Missing canonical checkpoint move for ${profile.key} at ply ${ply}`);
  return {
    id,
    kind: "checkpoint",
    openingNodeId: node.id,
    ply,
    title,
    body: `Find the move that keeps ${profile.title} connected to its core plan.`,
    acceptedMoves: [move],
    annotations: [{ kind: "candidate-move", move, label: "Candidate move after reveal" }],
    feedback: { correct, incorrect },
  };
}

export function buildOpeningLesson(profile: OpeningLessonProfile): OpeningLesson {
  const node = resolveOpeningLessonNode(profile);
  const planPly = safePly(node, 2);
  const structurePly = safePly(node, 3);
  const mistakePly = safePly(node, 4);
  const checkpointOnePly = safePly(node, Math.max(1, Math.floor(node.uci.length / 3)));
  const checkpointTwoPly = safePly(node, Math.max(checkpointOnePly + 1, Math.floor((node.uci.length * 2) / 3)));

  return {
    key: profile.key,
    slug: profile.slug,
    title: profile.title,
    summary: profile.summary,
    family: profile.family,
    sideFocus: profile.sideFocus,
    difficulty: profile.difficulty,
    ecoRange: profile.ecoRange,
    tags: profile.tags,
    prerequisites: profile.prerequisites ?? [],
    openingNodeId: node.id,
    openingSlug: node.slug,
    canonicalName: node.name,
    canonicalEco: node.eco,
    chapters: [
      {
        id: "foundation",
        title: "Opening identity",
        objective: `Recognize what makes ${profile.title} strategically distinct.`,
        steps: [
          { id: "identity", kind: "explain", openingNodeId: node.id, ply: 0, title: `What ${profile.title} is trying to achieve`, body: profile.summary },
          { id: "development", kind: "demonstrate", openingNodeId: node.id, ply: safePly(node, 1), title: "Connect the move order to development", body: `The canonical line begins ${node.san.slice(0, 4).join(" ")}. Use those moves to reach the structure without losing sight of development and king safety.` },
          { id: "plan", kind: "explain", openingNodeId: node.id, ply: planPly, title: "Primary strategic plan", body: profile.strategicPlan, learningPoint: "plan", annotations: [{ kind: "key-squares", squares: profile.keySquares, label: `Key squares for ${profile.title}` }] },
        ],
      },
      {
        id: "structure",
        title: "Structure and danger",
        objective: "Read the pawn skeleton, critical squares, and mistakes that change the plan.",
        steps: [
          { id: "structure-idea", kind: "demonstrate", openingNodeId: node.id, ply: structurePly, title: "Pawn structure and key squares", body: profile.structureIdea, learningPoint: "pawn-structure", annotations: [{ kind: "pawn-structure", squares: profile.keySquares, label: "Squares that define the structure" }, { kind: "zone", squares: profile.keySquares, label: "Instructional focus zone" }] },
          { id: "opponent-plan", kind: "explain", openingNodeId: node.id, ply: structurePly, title: "What the opponent wants", body: profile.opponentPlan, learningPoint: "key-square", annotations: [{ kind: "highlight", squares: profile.keySquares, label: "Squares both sides fight over" }] },
          { id: "mistake", kind: "explain", openingNodeId: node.id, ply: mistakePly, title: "Common mistake", body: profile.commonMistake, learningPoint: "mistake" },
          { id: "trap-warning", kind: "explain", openingNodeId: node.id, ply: mistakePly, title: "Tactical warning", body: profile.trapWarning, learningPoint: "trap" },
        ],
      },
      {
        id: "practice",
        title: "Play the ideas",
        objective: "Turn the strategic story into legal move choices.",
        steps: [
          checkpoint(profile, node, "checkpoint-one", checkpointOnePly, "Checkpoint: keep the plan alive", `Correct. That move keeps the position aligned with this plan: ${profile.strategicPlan}`, `That move is legal, but it leaves the course plan. Re-check the priorities: ${profile.strategicPlan}`),
          { id: "thematic-break", kind: "demonstrate", openingNodeId: node.id, ply: checkpointTwoPly, title: "Thematic break", body: profile.thematicBreak, learningPoint: "thematic-break", annotations: [{ kind: "candidate-move", move: node.uci[checkpointTwoPly], label: "Canonical move connected to the thematic break" }] },
          checkpoint(profile, node, "checkpoint-two", checkpointTwoPly, "Checkpoint: choose the continuation", `Correct. You found the continuation that fits the structure: ${profile.thematicBreak}`, `The move is legal, but the course is testing this thematic idea: ${profile.thematicBreak}`),
          { id: "recap", kind: "recap", openingNodeId: node.id, ply: safePly(node, node.uci.length - 1), title: "Course recap", body: `${profile.strategicPlan} Against it, remember: ${profile.opponentPlan}` },
        ],
      },
    ],
  };
}
