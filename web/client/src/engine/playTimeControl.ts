export type PlayTimeControlId = "3" | "5" | "10" | "15";

export type PlayTimeControl = {
  id: PlayTimeControlId;
  label: string;
  minutes: number;
  seconds: number;
  detail: string;
};

export const PLAY_TIME_CONTROL_STORAGE_KEY = "chessiq.play.time-control";

export const PLAY_TIME_CONTROLS = [
  { id: "3", label: "3 min", minutes: 3, seconds: 3 * 60, detail: "Fast" },
  { id: "5", label: "5 min", minutes: 5, seconds: 5 * 60, detail: "Quick" },
  { id: "10", label: "10 min", minutes: 10, seconds: 10 * 60, detail: "Rapid" },
  { id: "15", label: "15 min", minutes: 15, seconds: 15 * 60, detail: "Deep" },
] as const satisfies readonly PlayTimeControl[];

export function getPlayTimeControl(value: string | null | undefined): PlayTimeControl {
  return PLAY_TIME_CONTROLS.find(control => control.id === value) ?? PLAY_TIME_CONTROLS[2];
}
