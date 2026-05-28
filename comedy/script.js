const navLinks = document.querySelectorAll('.site-nav a[href^="#"]');
const dialogueText = document.querySelector("#dialogueText");
const dialogueLines = [
  "チームを前に進めるためなら、進行表もコードも空気づくりも全部やります。",
  "明るさは武器ですが、最後に見せたいのは成果物です。",
  "読みやすく、直しやすく、チームで扱いやすい実装を目指しています。",
];
let currentLine = 0;

document.querySelector("[data-next-line]")?.addEventListener("click", () => {
  currentLine = (currentLine + 1) % dialogueLines.length;
  dialogueText.animate([
    { opacity: 0, transform: "translateY(6px)" },
    { opacity: 1, transform: "translateY(0)" },
  ], { duration: 260, easing: "ease-out" });
  dialogueText.textContent = dialogueLines[currentLine];
});

for (const link of navLinks) {
  link.addEventListener("click", (event) => {
    const target = document.querySelector(link.getAttribute("href"));
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

const revealObserver = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    entry.target.classList.add("is-visible");
    revealObserver.unobserve(entry.target);
  }
}, { rootMargin: "-8% 0px -10%", threshold: 0.12 });

document.querySelectorAll(".reveal").forEach((target, index) => {
  target.style.setProperty("--delay", `${Math.min(index % 5, 4) * 70}ms`);
  revealObserver.observe(target);
});

const sectionObserver = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    navLinks.forEach((link) => {
      link.classList.toggle("is-active", link.getAttribute("href") === `#${entry.target.id}`);
    });
  }
}, { rootMargin: "-42% 0px -50%", threshold: 0 });

document.querySelectorAll("main > section[id]").forEach((section) => {
  sectionObserver.observe(section);
});

document.querySelectorAll("[data-profile-tab]").forEach((button) => {
  button.addEventListener("click", () => {
    const target = button.dataset.profileTab;
    document.querySelectorAll("[data-profile-tab]").forEach((tab) => {
      tab.classList.toggle("is-active", tab === button);
    });
    document.querySelectorAll("[data-profile-page]").forEach((page) => {
      page.classList.toggle("is-active", page.dataset.profilePage === target);
    });
  });
});

const storyData = [
  {
    label: "Childhood",
    title: "ゲーム体験の原点",
    body: "3DSやWiiを通じてゲームの面白さに触れ、友人や家族と遊ぶ時間の中で、ゲームが人とのつながりを生むものだと感じました。",
  },
  {
    label: "Junior High",
    title: "チーム経験と責任感",
    body: "野球のクラブチームで副キャプテンを務め、継続力、責任感、周囲と協力して目標に向かう姿勢を身につけました。",
  },
  {
    label: "High School",
    title: "制作への興味と効率化",
    body: "PCを購入し、フリーゲームに触れたことをきっかけに自分でも制作を開始。生徒会では資料作成やマクロによる効率化も経験しました。",
  },
  {
    label: "Now",
    title: "読みやすく、改善しやすい実装へ",
    body: "インターンシップやチーム制作で得た経験を活かし、可読性、処理の最適化、チームで扱いやすい設計を意識して制作しています。",
  },
];

const storyLabel = document.querySelector("#storyLabel");
const storyTitle = document.querySelector("#storyTitle");
const storyBody = document.querySelector("#storyBody");
const storyWindow = document.querySelector(".story-window");

document.querySelectorAll("[data-story]").forEach((button) => {
  button.addEventListener("click", () => {
    const nextStory = storyData[Number(button.dataset.story)];
    if (!nextStory) return;
    document.querySelectorAll("[data-story]").forEach((chapter) => {
      chapter.classList.toggle("is-active", chapter === button);
    });
    storyWindow.animate([
      { opacity: 0, transform: "translateY(10px)" },
      { opacity: 1, transform: "translateY(0)" },
    ], { duration: 320, easing: "ease-out" });
    storyLabel.textContent = nextStory.label;
    storyTitle.textContent = nextStory.title;
    storyBody.textContent = nextStory.body;
  });
});

const workModal = document.querySelector("#workModal");

document.querySelector("[data-open-work]")?.addEventListener("click", () => {
  workModal?.showModal();
});

document.querySelector("[data-close-work]")?.addEventListener("click", () => {
  workModal?.close();
});

window.addEventListener("scroll", () => {
  document.documentElement.style.setProperty("--scroll-y", `${Math.min(window.scrollY, 900)}px`);
}, { passive: true });
