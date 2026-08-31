import { describe, expect, it } from "vitest";
import { parseEngineResponse } from "./wasmEngine";

describe("parseEngineResponse", () => {
  it("parses a successful first-party engine payload", () => {
    expect(
      parseEngineResponse(
        '{"ok":true,"bestMove":"e2e4","score":34,"depth":6,"nodes":12345,"pv":"e2e4 e7e5"}',
      ),
    ).toEqual({
      bestMove: "e2e4",
      score: 34,
      depth: 6,
      nodes: 12345,
      pv: "e2e4 e7e5",
    });
  });

  it("surfaces engine errors instead of pretending analysis succeeded", () => {
    expect(() =>
      parseEngineResponse('{"ok":false,"error":"invalid FEN"}'),
    ).toThrow("invalid FEN");
  });
});
