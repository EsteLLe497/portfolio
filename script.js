const links = document.querySelectorAll('a[href^="#"]');
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

document.body.classList.add("page-ready");
links[0]?.classList.add("is-active");

for (const link of links) {
  link.addEventListener("click", (event) => {
    const target = document.querySelector(link.getAttribute("href"));
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

const revealTargets = document.querySelectorAll([
  ".panel:not(.hero)",
  ".section-title",
  ".story-text",
  ".life-chart",
  ".spec-lead",
  ".spec-table div",
  ".contact-layout",
  ".contact-list div",
  ".character-portrait",
  ".character-copy",
  ".hobby-card",
  ".gallery-grid figure",
  ".work-card",
  ".chart-points li",
].join(","));

revealTargets.forEach((target, index) => {
  target.classList.add("reveal");
  target.style.setProperty("--reveal-delay", `${Math.min(index % 6, 5) * 70}ms`);
});

const revealObserver = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    entry.target.classList.add("is-visible");
    revealObserver.unobserve(entry.target);
  }
}, {
  rootMargin: "-8% 0px -12%",
  threshold: 0.12,
});

for (const target of revealTargets) {
  revealObserver.observe(target);
}

const sectionObserver = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    const activeLink = document.querySelector(`.global-nav a[href="#${entry.target.id}"]`);
    if (!activeLink) continue;
    links.forEach((link) => link.classList.toggle("is-active", link === activeLink));
  }
}, {
  rootMargin: "-42% 0px -48%",
  threshold: 0,
});

for (const section of document.querySelectorAll("main > section[id]")) {
  sectionObserver.observe(section);
}

let ticking = false;

const updateScrollMotion = () => {
  document.documentElement.style.setProperty("--scroll-shift", `${Math.min(window.scrollY, 760)}px`);
  ticking = false;
};

window.addEventListener("scroll", () => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(updateScrollMotion);
}, { passive: true });

updateScrollMotion();

const createRipple = (x, y, options = {}) => {
  const ripple = document.createElement("span");
  const size = options.size ?? Math.floor(90 + Math.random() * 110);
  ripple.className = `ripple-effect${options.random ? " is-random" : ""}`;
  ripple.style.setProperty("--ripple-x", `${x}px`);
  ripple.style.setProperty("--ripple-y", `${y}px`);
  ripple.style.setProperty("--ripple-size", `${size}px`);
  ripple.addEventListener("animationend", () => ripple.remove(), { once: true });
  document.body.append(ripple);
};

document.addEventListener("pointerdown", (event) => {
  if (event.button !== 0) return;
  createRipple(event.clientX, event.clientY, {
    size: Math.floor(86 + Math.random() * 96),
  });
}, { passive: true });

const scheduleRandomRipple = () => {
  if (reduceMotion || document.hidden) {
    window.setTimeout(scheduleRandomRipple, 2400);
    return;
  }

  createRipple(Math.random() * window.innerWidth, Math.random() * window.innerHeight, {
    random: true,
    size: Math.floor(360 + Math.random() * 520),
  });
  window.setTimeout(scheduleRandomRipple, 700 + Math.random() * 1100);
};

window.setTimeout(scheduleRandomRipple, 500);

const characterCarousel = document.querySelector(".character-carousel");

if (characterCarousel) {
  // Character profile carousel. Keep this local so modal sliders stay independent.
  const characterSlides = [...characterCarousel.querySelectorAll(".character-slide")];
  const prevButton = characterCarousel.querySelector("[data-character-prev]");
  const nextButton = characterCarousel.querySelector("[data-character-next]");
  let currentCharacterSlide = 0;

  const showCharacterSlide = (index) => {
    currentCharacterSlide = (index + characterSlides.length) % characterSlides.length;
    characterSlides.forEach((slide, slideIndex) => {
      slide.classList.toggle("is-active", slideIndex === currentCharacterSlide);
    });
  };

  prevButton?.addEventListener("click", () => showCharacterSlide(currentCharacterSlide - 1));
  nextButton?.addEventListener("click", () => showCharacterSlide(currentCharacterSlide + 1));

  characterCarousel.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") showCharacterSlide(currentCharacterSlide - 1);
    if (event.key === "ArrowRight") showCharacterSlide(currentCharacterSlide + 1);
  });
}

const hobbyOpenButtons = document.querySelectorAll("[data-hobby-open]");
const hobbyModals = [...document.querySelectorAll("#fishing-modal, #nazotoki-modal, #travel-modal, #sports-modal")];

const closeHobbyModals = () => {
  for (const modal of hobbyModals) {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
  }
  document.body.classList.remove("modal-open");
};

for (const button of hobbyOpenButtons) {
  button.addEventListener("click", () => {
    const modal = document.querySelector(`#${button.dataset.hobbyOpen}-modal`);
    if (!modal) return;
    closeHobbyModals();
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
  });
}

for (const button of document.querySelectorAll("[data-hobby-close]")) {
  button.addEventListener("click", closeHobbyModals);
}

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  if (!hobbyModals.some((modal) => modal.classList.contains("is-open"))) return;
  closeHobbyModals();
});

const workOpenButtons = document.querySelectorAll("[data-work-open]");
const workModals = [...document.querySelectorAll(".work-modal[id$='-modal']")].filter((modal) => {
  return modal.querySelector(".work-slide");
});

const setupWorkModal = (workModal) => {
  const workKey = workModal.id.replace("-modal", "");
  const openButtons = [...workOpenButtons].filter((button) => button.dataset.workOpen === workKey);
  const slides = [...workModal.querySelectorAll(".work-slide")];
  const closeButtons = workModal.querySelectorAll("[data-work-close]");
  const prevButton = workModal.querySelector("[data-slide-prev]");
  const nextButton = workModal.querySelector("[data-slide-next]");
  const jumpButtons = workModal.querySelectorAll("[data-slide-jump]");
  const imageLightbox = workModal.querySelector(".image-lightbox");
  const imageLightboxImage = imageLightbox?.querySelector("img");
  let currentSlide = 0;

  const stopVideos = () => {
    for (const video of workModal.querySelectorAll("video")) {
      video.pause();
    }
  };

  const showSlide = (index) => {
    currentSlide = (index + slides.length) % slides.length;
    stopVideos();
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("is-active", slideIndex === currentSlide);
    });
  };

  const openImageLightbox = (image) => {
    if (!imageLightbox || !imageLightboxImage || !image) return;
    imageLightboxImage.src = image.currentSrc || image.src;
    imageLightboxImage.alt = image.alt;
    imageLightbox.classList.add("is-open");
    imageLightbox.setAttribute("aria-hidden", "false");
  };

  const closeImageLightbox = () => {
    if (!imageLightbox || !imageLightboxImage) return;
    imageLightbox.classList.remove("is-open");
    imageLightbox.setAttribute("aria-hidden", "true");
    imageLightboxImage.removeAttribute("src");
    imageLightboxImage.alt = "";
  };

  const openModal = () => {
    workModal.classList.add("is-open");
    workModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    showSlide(0);
  };

  const closeModal = () => {
    workModal.classList.remove("is-open");
    workModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    closeImageLightbox();
    stopVideos();
  };

  for (const button of openButtons) {
    button.addEventListener("click", openModal);
  }

  for (const button of closeButtons) {
    button.addEventListener("click", closeModal);
  }

  prevButton?.addEventListener("click", () => showSlide(currentSlide - 1));
  nextButton?.addEventListener("click", () => showSlide(currentSlide + 1));
  for (const slide of slides) {
    if (!(slide instanceof HTMLImageElement)) continue;
    slide.addEventListener("click", () => openImageLightbox(slide));
  }
  for (const button of jumpButtons) {
    button.addEventListener("click", () => {
      const targetSlide = Number(button.dataset.slideJump);
      showSlide(targetSlide);
      if (slides[targetSlide] instanceof HTMLImageElement) {
        openImageLightbox(slides[targetSlide]);
      }
    });
  }
  for (const button of workModal.querySelectorAll("[data-lightbox-close]")) {
    button.addEventListener("click", closeImageLightbox);
  }

  document.addEventListener("keydown", (event) => {
    if (!workModal.classList.contains("is-open")) return;
    if (event.key === "Escape" && imageLightbox?.classList.contains("is-open")) {
      closeImageLightbox();
      return;
    }
    if (event.key === "Escape") closeModal();
    if (event.key === "ArrowLeft") showSlide(currentSlide - 1);
    if (event.key === "ArrowRight") showSlide(currentSlide + 1);
  });
};

for (const workModal of workModals) {
  setupWorkModal(workModal);
}
