import { Eye, RotateCcw, Target } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { ProductHeader } from "@/components/ProductHeader";
import { OpeningBoardWorkspace } from "@/components/openings/OpeningBoardWorkspace";
import { TrainerFeedback, type TrainerRating } from "@/components/openings/TrainerFeedback";
import { TrainerSessionRail } from "@/components/openings/TrainerSessionRail";
import { evaluateTrainerMove, trainerOrientation, type TrainerMoveResult } from "@/lib/openings/trainer";
import { trpc } from "@/lib/trpc";

const modeValues = ["learn", "recall", "mixed"] as const;
type TrainerMode = (typeof modeValues)[number];

function initialParams() {
  if (typeof window === "undefined") return { slug: "", side: "white" as const, mode: "mixed" as TrainerMode };
  const params = new URLSearchParams(window.location.search);
  const requestedSide = params.get("side");
  const requestedMode = params.get("mode");
  return {
    slug: params.get("slug") ?? "",
    side: requestedSide === "black" ? "black" as const : "white" as const,
    mode: modeValues.includes(requestedMode as TrainerMode) ? requestedMode as TrainerMode : "mixed" as TrainerMode,
  };
}

export default function OpeningTrainerPage() {
  const requested = useMemo(initialParams, []);
  const { isAuthenticated } = useAuth();
  const [side, setSide] = useState<"white" | "black">(requested.side);
  const [mode, setMode] = useState<TrainerMode>(requested.mode);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [feedback, setFeedback] = useState<TrainerMoveResult | null>(null);
  const [lastPlayedMove, setLastPlayedMove] = useState<string | null>(null);
  const [usedHint, setUsedHint] = useState(false);
  const [syncState, setSyncState] = useState<"idle" | "saving" | "synced" | "not-synced">("idle");
  const [localAnswers, setLocalAnswers] = useState(0);
  const startedAt = useRef(Date.now());

  const queue = trpc.openings.queue.useQuery({ limit: 20 }, { enabled: isAuthenticated && !requested.slug });
  const activeSlug = requested.slug || queue.data?.[0]?.opening.slug || "";

  useEffect(() => {
    if (!requested.slug && queue.data?.[0]?.side) setSide(queue.data[0].side);
  }, [queue.data, requested.slug]);

  const line = trpc.openings.trainingLine.useQuery(
    { slug: activeSlug || "opening-not-selected", side },
    { enabled: Boolean(activeSlug) }
  );
  const recordAttempt = trpc.openings.recordAttempt.useMutation();
  const questions = line.data?.questions ?? [];
  const current = questions[questionIndex];
  const finished = Boolean(line.data && questions.length > 0 && questionIndex >= questions.length);

  useEffect(() => {
    setQuestionIndex(0);
    setFeedback(null);
    setLastPlayedMove(null);
    setUsedHint(false);
    setSyncState("idle");
    startedAt.current = Date.now();
  }, [activeSlug, side]);

  useEffect(() => {
    startedAt.current = Date.now();
  }, [questionIndex]);

  const onBoardMove = (uci: string) => {
    if (!current || (feedback && feedback.kind !== "illegal")) return;
    const result = evaluateTrainerMove(current, uci);
    setLastPlayedMove(uci);
    setFeedback(result);
    if (result.kind !== "illegal") setLocalAnswers(value => value + 1);
  };

  const advance = () => {
    setQuestionIndex(value => value + 1);
    setFeedback(null);
    setLastPlayedMove(null);
    setUsedHint(false);
    setSyncState(state => state === "not-synced" ? state : "idle");
  };

  const onRate = async (rating: TrainerRating) => {
    if (!current || !lastPlayedMove || !feedback || feedback.kind === "illegal") return;
    if (!isAuthenticated) {
      advance();
      return;
    }
    setSyncState("saving");
    try {
      await recordAttempt.mutateAsync({
        openingNodeId: current.openingNodeId,
        ply: current.ply,
        side,
        moveUci: lastPlayedMove,
        responseMs: Math.max(0, Date.now() - startedAt.current),
        usedHint,
        rating,
      });
      setSyncState("synced");
    } catch {
      setSyncState("not-synced");
    } finally {
      advance();
    }
  };

  return (
    <main className="app-shell chessiq-shell openings-shell">
      <ProductHeader />
      <section className="trainer-page-head">
        <div>
          <p className="eyebrow">ChessIQ repertoire recall</p>
          <h1>Opening Trainer</h1>
          <p>Correctness comes from the local canonical repertoire and chess legality. Live popularity never decides whether your move is right.</p>
        </div>
        <div className="trainer-setup-switches">
          <div className="trainer-segmented" aria-label="Trainer mode">{modeValues.map(value => <button type="button" key={value} className={mode === value ? "is-active" : ""} onClick={() => setMode(value)}>{value}</button>)}</div>
          <div className="trainer-segmented" aria-label="Repertoire side"><button type="button" className={side === "white" ? "is-active" : ""} onClick={() => setSide("white")}>White</button><button type="button" className={side === "black" ? "is-active" : ""} onClick={() => setSide("black")}>Black</button></div>
        </div>
      </section>

      {!activeSlug ? (
        <section className="trainer-empty opening-panel">
          <Target size={28}/><h2>{queue.isLoading ? "Loading your review queue…" : "Choose a repertoire line"}</h2><p>{isAuthenticated ? "You have no saved review line yet. Start from an opening and ChessIQ will build your spaced-repetition queue." : "Guests can train any opening locally without signing in."}</p><Link className="opening-primary-action" href="/openings">Browse openings</Link>
        </section>
      ) : line.isLoading ? <section className="trainer-empty opening-panel" aria-busy="true">Loading canonical training positions…</section> : line.error ? <section className="trainer-empty opening-panel"><h2>Training line unavailable</h2><p>{line.error.message}</p><Link href="/openings" className="opening-secondary-action">Back to Explorer</Link></section> : finished ? (
        <section className="trainer-complete opening-panel"><Target size={34}/><p className="eyebrow">Session complete</p><h2>{localAnswers} positions reviewed</h2><p>{syncState === "not-synced" ? "Some answers were not synced, but your local session completed safely." : isAuthenticated ? "Your completed answers were scheduled into your opening review history." : "This guest session stayed local. Sign in later if you want persistent SRS history."}</p><button type="button" className="opening-primary-action" onClick={() => { setQuestionIndex(0); setLocalAnswers(0); setSyncState("idle"); }}><RotateCcw size={15}/> Repeat line</button><Link className="opening-secondary-action" href="/openings">Explore another line</Link></section>
      ) : current && line.data ? (
        <section className="trainer-workspace">
          <div className="trainer-board-stage">
            <header className="trainer-question-head"><div><span className="opening-eco-badge">{line.data.opening.eco}</span><h2>{line.data.opening.name}</h2><p>{mode === "learn" ? current.explanation : mode === "recall" ? "Recall the repertoire move without guidance." : "Recall first; use a hint only if you need it."}</p></div><button type="button" className="opening-secondary-action" onClick={() => setUsedHint(true)} disabled={usedHint || Boolean(feedback && feedback.kind !== "illegal")}><Eye size={15}/> Hint</button></header>
            <OpeningBoardWorkspace fen={current.fen} orientation={trainerOrientation(side)} interactive={!feedback || feedback.kind === "illegal"} onMove={onBoardMove} activeMove={lastPlayedMove} expectedMove={usedHint || (feedback && feedback.kind !== "illegal") ? current.canonicalMove : null} />
            {current.sanPlayed.length ? <div className="trainer-position-context"><span>Line so far</span><code>{current.sanPlayed.join(" ")}</code></div> : null}
            <TrainerFeedback result={feedback} explanation={feedback && feedback.kind !== "illegal" ? current.explanation : undefined} canonicalMove={feedback && feedback.kind !== "illegal" ? current.canonicalMove : undefined} syncState={syncState} onRate={onRate} disabled={recordAttempt.isPending} />
          </div>
          <TrainerSessionRail openingName={line.data.opening.name} eco={line.data.opening.eco} side={side} mode={mode} index={questionIndex} total={questions.length} queueCount={queue.data?.length} />
        </section>
      ) : <section className="trainer-empty opening-panel"><h2>No {side} recall positions in this line.</h2><p>Switch repertoire side or choose a deeper variation.</p><Link href="/openings" className="opening-secondary-action">Browse openings</Link></section>}
    </main>
  );
}
