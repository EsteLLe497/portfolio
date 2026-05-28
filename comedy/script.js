const reactionText = document.querySelector("#reaction-text");
const reactionMessages = {
  idea: "アイデアを形にし、遊びとして伝わるところまで粘ります。",
  code: "読みやすさと処理の軽さを意識して、チームで扱いやすい実装を目指します。",
  team: "進捗、課題、空気感を見ながら、メンバーが動きやすい状態を作ります。",
};

for (const button of document.querySelectorAll("[data-reaction]")) {
  button.addEventListener("click", () => {
    reactionText.textContent = reactionMessages[button.dataset.reaction] ?? reactionMessages.idea;
  });
}

const revealTargets = document.querySelectorAll(".section-heading, .spot-card, .work-panel, .reaction-board, .episode-grid article");
const revealObserver = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    entry.target.classList.add("is-visible");
    revealObserver.unobserve(entry.target);
  }
}, { threshold: 0.18 });

for (const target of revealTargets) {
  target.classList.add("reveal");
  revealObserver.observe(target);
}

// The spotlight is a cheap CSS variable update, so it keeps the stage feeling alive without heavy animation.
window.addEventListener("pointermove", (event) => {
  document.documentElement.style.setProperty("--spot-x", `${event.clientX}px`);
  document.documentElement.style.setProperty("--spot-y", `${event.clientY}px`);
}, { passive: true });
