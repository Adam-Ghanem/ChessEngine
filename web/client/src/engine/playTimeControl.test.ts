import { describe, expect, it } from "vitest";
import { PLAY_TIME_CONTROLS, getPlayTimeControl } from "./playTimeControl";

describe("Play time controls", () => {
  it("defaults invalid persisted values to the 10 minute rapid preset", () => {
    expect(getPlayTimeControl(null)).toMatchObject({ id: "10", minutes: 10, seconds: 600 });
    expect(getPlayTimeControl("broken")).toMatchObject({ id: "10", minutes: 10, seconds: 600 });
  });

  it("exposes fast through deep clock presets", () => {
    expect(PLAY_TIME_CONTROLS.map(control => control.minutes)).toEqual([3, 5, 10, 15]);
    expect(getPlayTimeControl("3").seconds).toBe(180);
    expect(getPlayTimeControl("15").seconds).toBe(900);
  });
});
