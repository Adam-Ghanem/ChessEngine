import { describe, expect, it } from "vitest";
import { documentTitleForPath } from "@/lib/routeDocumentTitle";

describe("documentTitleForPath", () => {
  it("returns distinct ChessIQ titles for core product workspaces", () => {
    expect(documentTitleForPath("/")).toBe("ChessIQ — Home");
    expect(documentTitleForPath("/play")).toBe("ChessIQ — Play");
    expect(documentTitleForPath("/analyze?game=abc")).toBe("ChessIQ — Analyze");
    expect(documentTitleForPath("/review?game=abc")).toBe("ChessIQ — Game Review");
    expect(documentTitleForPath("/learn/openings/sicilian-defense")).toBe("ChessIQ — Openings");
    expect(documentTitleForPath("/progress")).toBe("ChessIQ — Progress");
  });

  it("uses a safe fallback for unknown routes", () => {
    expect(documentTitleForPath("/missing-route")).toBe("ChessIQ — Page Not Found");
  });
});
