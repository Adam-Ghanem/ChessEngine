import puppeteer from "puppeteer-core";

const baseUrl = process.env.CHESSIQ_TEST_URL ?? "http://127.0.0.1:3000";
const routes = ["/play", "/analyze", "/learn", "/puzzles", "/games", "/progress", "/coach"];
const browser = await puppeteer.launch({ executablePath: "/usr/bin/chromium", headless: true, args: ["--no-sandbox", "--disable-setuid-sandbox"] });

try {
  const keyboardPage = await browser.newPage();
  await keyboardPage.setViewport({ width: 1280, height: 900 });
  const focusReport = [];
  for (const route of routes) {
    await keyboardPage.goto(`${baseUrl}${route}`, { waitUntil: "networkidle0" });
    const firstFocus = [];
    for (let index = 0; index < 5; index += 1) {
      await keyboardPage.keyboard.press("Tab");
      firstFocus.push(await keyboardPage.evaluate(() => {
        const node = document.activeElement;
        return { tag: node?.tagName, label: node?.getAttribute("aria-label") ?? node?.textContent?.trim()?.slice(0, 40), outline: getComputedStyle(node).outlineStyle, outlineWidth: getComputedStyle(node).outlineWidth };
      }));
    }
    if (!firstFocus.some(item => item.tag === "A" || item.tag === "BUTTON")) throw new Error(`No keyboard-reachable control found on ${route}`);
    if (!firstFocus.some(item => item.outline !== "none" && item.outlineWidth !== "0px")) throw new Error(`No visible keyboard focus outline found on ${route}`);
    focusReport.push({ route, firstFocus });
  }

  const motionPage = await browser.newPage();
  await motionPage.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
  await motionPage.goto(`${baseUrl}/puzzles`, { waitUntil: "networkidle0" });
  const motionReport = await motionPage.evaluate(() => ({
    reducedMotionMatches: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    buttonAnimationDuration: getComputedStyle(document.querySelector("button")).animationDuration,
    buttonTransitionDuration: getComputedStyle(document.querySelector("button")).transitionDuration,
  }));
  if (!motionReport.reducedMotionMatches) throw new Error("Reduced-motion media preference was not applied");
  if (!["0.01ms", "0.00001s", "1e-05s"].includes(motionReport.buttonAnimationDuration)) throw new Error(`Reduced-motion animation duration was not suppressed: ${motionReport.buttonAnimationDuration}`);

  console.log(JSON.stringify({ focusReport, motionReport }, null, 2));
} finally {
  await browser.close();
}
