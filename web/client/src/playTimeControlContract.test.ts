import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Play time controls", () => {
  it("lets the production web Play surface choose and persist a clock preset", () => {
    const play = readFileSync(new URL("./pages/Play.tsx", import.meta.url), "utf8");

    expect(play).toContain("PLAY_TIME_CONTROLS");
    expect(play).toContain("PLAY_TIME_CONTROL_STORAGE_KEY");
    expect(play).toContain("selectTimeControl");
    expect(play).toContain('aria-label="Game time control"');
    expect(play).not.toContain("const INITIAL_CLOCK_SECONDS = 10 * 60");
    expect(play).not.toContain("Time control: 10 minutes");
  });

  it("awards the selected increment after every completed move", () => {
    const play = readFileSync(new URL("./pages/Play.tsx", import.meta.url), "utf8");

    expect(play).toContain("addClockIncrement");
    expect(play).toContain("timeControl.incrementSeconds");
    expect(play).toContain("awardMoveIncrement");
  });
});
