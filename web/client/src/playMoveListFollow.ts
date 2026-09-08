const appRoot = document.getElementById("root");

if (appRoot) {
  let activeList: HTMLElement | null = null;
  let lastMoveSignature = "";
  let moveListObserver: MutationObserver | null = null;

  const keepLatestMoveVisible = () => {
    const list = activeList;
    if (!list) return;

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
  };

  const connectMoveList = () => {
    const list = document.querySelector<HTMLElement>(".play-move-list");
    if (list === activeList) return;

    moveListObserver?.disconnect();
    moveListObserver = null;
    activeList = list;
    lastMoveSignature = "";

    if (!list) return;
    moveListObserver = new MutationObserver(keepLatestMoveVisible);
    moveListObserver.observe(list, { childList: true, subtree: true, characterData: true });
    keepLatestMoveVisible();
  };

  const rootObserver = new MutationObserver(connectMoveList);
  rootObserver.observe(appRoot, { childList: true, subtree: true });
  connectMoveList();
}
