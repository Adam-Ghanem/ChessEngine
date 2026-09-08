const appRoot = document.getElementById("root");

if (appRoot) {
  let activeList: HTMLElement | null = null;
  let lastMoveSignature = "";

  function keepLatestMoveVisible() {
    const list = document.querySelector<HTMLElement>(".play-move-list");
    if (!list) {
      activeList = null;
      lastMoveSignature = "";
      return;
    }

    if (list !== activeList) {
      activeList = list;
      lastMoveSignature = "";
    }

    const moveRows = list.querySelectorAll(".play-move-row").length;
    if (!moveRows) {
      lastMoveSignature = "";
      return;
    }

    const moveSignature = list.textContent ?? "";
    if (moveSignature === lastMoveSignature) return;
    lastMoveSignature = moveSignature;

    window.requestAnimationFrame(() => {
      if (!list.isConnected) return;
      const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
      list.scrollTo({
        top: list.scrollHeight,
        behavior: reduceMotion ? "auto" : "smooth",
      });
    });
  }

  const observer = new MutationObserver(keepLatestMoveVisible);
  observer.observe(appRoot, { childList: true, subtree: true, characterData: true });
  keepLatestMoveVisible();
}
