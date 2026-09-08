import { describe, expect, it } from "vitest";
import { getTableConfig } from "drizzle-orm/mysql-core";
import { openingAttempts, openingReviewItems } from "../drizzle/schema";
import {
  createOpeningAttempt,
  getOpeningReviewItemForUser,
  listOpeningAttemptsForUser,
  listOpeningReviewItemsForUser,
  upsertOpeningReviewItem,
} from "./db";

describe("opening learning persistence", () => {
  it("defines dedicated review and attempt tables", () => {
    const review = getTableConfig(openingReviewItems);
    const attempts = getTableConfig(openingAttempts);
    expect(review.name).toBe("openingReviewItems");
    expect(attempts.name).toBe("openingAttempts");
    expect(review.columns.map(column => column.name)).toEqual(expect.arrayContaining([
      "userId", "openingNodeId", "side", "ease", "intervalDays", "dueAt", "streak", "lapses", "lastResult", "lastReviewedAt",
    ]));
    expect(attempts.columns.map(column => column.name)).toEqual(expect.arrayContaining([
      "userId", "openingNodeId", "side", "result", "responseMs", "usedHint", "rating", "createdAt",
    ]));
  });

  it("exposes only explicitly user-scoped database helpers", () => {
    expect(typeof getOpeningReviewItemForUser).toBe("function");
    expect(typeof listOpeningReviewItemsForUser).toBe("function");
    expect(typeof upsertOpeningReviewItem).toBe("function");
    expect(typeof createOpeningAttempt).toBe("function");
    expect(typeof listOpeningAttemptsForUser).toBe("function");
  });
});
