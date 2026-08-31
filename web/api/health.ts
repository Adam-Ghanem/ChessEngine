export default function handler(_request: unknown, response: any) {
  response.status(200).json({ ok: true, service: "chessiq", runtime: "vercel-function" });
}
