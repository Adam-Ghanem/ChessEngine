export type PlayTimeControlId = "3+2" | "5+3" | "10" | "15+10";

export type PlayTimeControl = {
  id: PlayTimeControlId;
  label: string;
  minutes: number;
  seconds: number;
  incrementSeconds: number;
  detail: string;
};

export const PLAY_TIME_CONTROL_STORAGE_KEY = "chessiq.play.time-control";

export const PLAY_TIME_CONTROLS = [
  { id: "3+2", label: "3 + 2", minutes: 3, seconds: 3 * 60, incrementSeconds: 2, detail: "Blitz" },
  { id: "5+3", label: "5 + 3", minutes: 5, seconds: 5 * 60, incrementSeconds: 3, detail: "Blitz" },
  { id: "10", label: "10 min", minutes: 10, seconds: 10 * 60, incrementSeconds: 0, detail: "Rapid" },
  { id: "15+10", label: "15 + 10", minutes: 15, seconds: 15 * 60, incrementSeconds: 10, detail: "Rapid" },
] as const satisfies readonly PlayTimeControl[];

export function getPlayTimeControl(value: string | null | undefined): PlayTimeControl {
  return PLAY_TIME_CONTROLS.find(control => control.id === value) ?? PLAY_TIME_CONTROLS[2];
}

export function addClockIncrement(seconds: number, incrementSeconds: number) {
  return Math.max(0, Math.floor(seconds)) + Math.max(0, Math.floor(incrementSeconds));
}
