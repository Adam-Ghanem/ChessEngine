export type BoardOrientation = "white" | "black";

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"] as const;
const MIN_RANK = 1;
const MAX_RANK = 8;

function parseSquare(square: string) {
  if (!/^[a-h][1-8]$/.test(square)) return null;
  return { fileIndex: FILES.indexOf(square[0] as (typeof FILES)[number]), rank: Number(square[1]) };
}

function squareAt(fileIndex: number, rank: number) {
  if (fileIndex < 0 || fileIndex >= FILES.length || rank < MIN_RANK || rank > MAX_RANK) return null;
  return `${FILES[fileIndex]}${rank}`;
}

export function nextBoardFocusSquare(square: string, key: string, orientation: BoardOrientation): string | null {
  const parsed = parseSquare(square);
  if (!parsed) return null;

  const { fileIndex, rank } = parsed;
  const horizontalDirection = orientation === "white" ? 1 : -1;
  const verticalDirection = orientation === "white" ? 1 : -1;

  let nextSquare: string | null = null;
  switch (key) {
    case "ArrowLeft":
      nextSquare = squareAt(fileIndex - horizontalDirection, rank);
      break;
    case "ArrowRight":
      nextSquare = squareAt(fileIndex + horizontalDirection, rank);
      break;
    case "ArrowUp":
      nextSquare = squareAt(fileIndex, rank + verticalDirection);
      break;
    case "ArrowDown":
      nextSquare = squareAt(fileIndex, rank - verticalDirection);
      break;
    case "Home":
      nextSquare = squareAt(orientation === "white" ? 0 : FILES.length - 1, rank);
      break;
    case "End":
      nextSquare = squareAt(orientation === "white" ? FILES.length - 1 : 0, rank);
      break;
    default:
      return null;
  }

  return nextSquare ?? square;
}
