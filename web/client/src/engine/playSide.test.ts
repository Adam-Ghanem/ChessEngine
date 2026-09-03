import { describe, expect, it } from "vitest";
import { PLAY_SIDE_OPTIONS, getPlaySide, resolvePlayerSide } from "./playSide";

describe("play side selection", () => {
  it("offers white, black, and random choices", () => {
    expect(PLAY_SIDE_OPTIONS.map(option => option.id)).toEqual(["white", "black", "random"]);
  });

  it("falls back to white for invalid stored values", () => {
    expect(getPlaySide("black")).toBe("black");
    expect(getPlaySide("random")).toBe("random");
    expect(getPlaySide("invalid")).toBe("white");
    expect(getPlaySide(null)).toBe("white");
  });

  it("resolves deterministic sides and random choice", () => {
    expect(resolvePlayerSide("white", () => 0.99)).toBe("white");
    expect(resolvePlayerSide("black", () => 0)).toBe("black");
    expect(resolvePlayerSide("random", () => 0.49)).toBe("white");
    expect(resolvePlayerSide("random", () => 0.5)).toBe("black");
  });
});
