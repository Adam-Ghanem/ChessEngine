import { describe, expect, it } from "vitest";
import { PLAY_TIME_CONTROLS, getPlayTimeControl } from "./playTimeControl";

describe("Play time controls", () => {
  it("defaults invalid persisted values to the 10 minute rapid preset", () => {
    expect(getPlayTimeControl(null)).toMatchObject({ id: "10", minutes: 10, seconds: 600, incrementSeconds: 0 });
    expect(getPlayTimeControl("broken")).toMatchObject({ id: "10", minutes: 10, seconds: 600, incrementSeconds: 0 });
  });

  it("exposes tournament-style base plus increment presets", () => {
    expect(PLAY_TIME_CONTROLS.map(control => control.id)).toEqual(["3+2", "5+3", "10", "15+10"]);
    expect(getPlayTimeControl("3+2")).toMatchObject({ minutes: 3, seconds: 180, incrementSeconds: 2, label: "3 + 2" });
    expect(getPlayTimeControl("5+3")).toMatchObject({ minutes: 5, seconds: 300, incrementSeconds: 3, label: "5 + 3" });
    expect(getPlayTimeControl("10")).toMatchObject({ minutes: 10, seconds: 600, incrementSeconds: 0, label: "10 min" });
    expect(getPlayTimeControl("15+10")).toMatchObject({ minutes: 15, seconds: 900, incrementSeconds: 10, label: "15 + 10" });
  });
});
