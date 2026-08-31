export type FenValidation =
  | { ok: true; fen: string }
  | { ok: false; error: string };

export function validateFenShape(value: string): FenValidation {
  const fen = value.trim();
  if (!fen) return { ok: false, error: "Enter a FEN position first." };
  if (fen.length > 180 || /[\r\n]/.test(fen)) {
    return { ok: false, error: "FEN must be a single line." };
  }
  const fields = fen.split(/\s+/);
  if (fields.length !== 6) {
    return { ok: false, error: "FEN must contain all six standard fields." };
  }
  if (fields[0].split("/").length !== 8 || !/^[wb]$/.test(fields[1])) {
    return { ok: false, error: "FEN board or side-to-move field is invalid." };
  }
  return { ok: true, fen };
}
