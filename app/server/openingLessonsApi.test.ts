import { describe, expect, it } from "vitest";
import { OPENING_LESSONS } from "../shared/learning/openings";
import type { TrpcContext } from "./_core/context";
import { appRouter } from "./routers";

function publicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

function authContext(): TrpcContext {
  return {
    user: {
      id: 42,
      openId: "opening-learner",
      email: "learner@example.com",
      name: "Opening Learner",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

function stepCount(lesson: (typeof OPENING_LESSONS)[number]) {
  return lesson.chapters.reduce((total, chapter) => total + chapter.steps.length, 0);
}

describe("learn opening lessons API", () => {
  it("adds exactly 100 compact opening cards while preserving foundation lessons", async () => {
    const caller = appRouter.createCaller(publicContext());
    const catalog = await caller.learn.catalog();
    const openingCards = catalog.filter(item => item.kind === "opening");
    const foundationCards = catalog.filter(item => item.kind === "foundation");

    expect(openingCards).toHaveLength(100);
    expect(foundationCards).toHaveLength(3);
    expect(openingCards[0]).toMatchObject({
      kind: "opening",
      key: expect.any(String),
      slug: expect.any(String),
      title: expect.any(String),
      family: expect.any(String),
      sideFocus: expect.any(String),
      difficulty: expect.any(String),
      ecoRange: expect.any(String),
      steps: expect.any(Number),
    });
    expect(openingCards[0]).not.toHaveProperty("chapters");
  });

  it("returns the complete opening lesson by slug", async () => {
    const caller = appRouter.createCaller(publicContext());
    const lesson = OPENING_LESSONS[0];
    const result = await caller.learn.openingLesson({ slug: lesson.slug });

    expect(result.key).toBe(lesson.key);
    expect(result.slug).toBe(lesson.slug);
    expect(result.chapters).toHaveLength(lesson.chapters.length);
  });

  it("rejects unknown opening lesson slugs", async () => {
    const caller = appRouter.createCaller(publicContext());
    await expect(caller.learn.openingLesson({ slug: "definitely-not-a-course" })).rejects.toThrow(/opening lesson not found/i);
  });

  it("rejects fabricated progress keys before persistence", async () => {
    const caller = appRouter.createCaller(authContext());
    await expect(caller.learn.saveProgress({
      lessonKey: "fabricated-opening-course",
      status: "in_progress",
      completedSteps: 1,
    })).rejects.toThrow(/lesson/i);
  });

  it("rejects completed steps beyond the actual opening lesson length", async () => {
    const caller = appRouter.createCaller(authContext());
    const lesson = OPENING_LESSONS[0];
    await expect(caller.learn.saveProgress({
      lessonKey: lesson.key,
      status: "in_progress",
      completedSteps: stepCount(lesson) + 1,
    })).rejects.toThrow(/completed steps/i);
  });
});
