export function readNumberProgress(storage: Storage, key: string): Record<string, number> {
  try {
    const parsed: unknown = JSON.parse(storage.getItem(key) ?? "{}");
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};

    return Object.fromEntries(
      Object.entries(parsed)
        .filter((entry): entry is [string, number] => typeof entry[1] === "number" && Number.isFinite(entry[1]) && entry[1] >= 0)
        .map(([entryKey, value]) => [entryKey, Math.trunc(value)]),
    );
  } catch {
    return {};
  }
}

export function writeNumberProgress(storage: Storage, key: string, value: Record<string, number>): void {
  storage.setItem(key, JSON.stringify(value));
}
