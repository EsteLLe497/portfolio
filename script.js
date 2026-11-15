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

// Use one scrollable photo viewer for both sections.
const photoDialog = document.querySelector("#photo-viewer");
const photoTrack = photoDialog.querySelector(".photo-track");
const photoPrev = photoDialog.querySelector("[data-photo-prev]");
const photoNext = photoDialog.querySelector("[data-photo-next]");

const updatePhotoControls = () => {
  photoPrev.disabled = photoTrack.scrollLeft < 2;
  photoNext.disabled = photoTrack.scrollWidth - photoTrack.clientWidth - photoTrack.scrollLeft < 2;
};
const movePhoto = (direction) => {
  const index = Math.round(photoTrack.scrollLeft / photoTrack.clientWidth);
  photoTrack.scrollTo({ left: (index + direction) * photoTrack.clientWidth });
};
photoPrev.addEventListener("click", () => movePhoto(-1));
photoNext.addEventListener("click", () => movePhoto(1));
photoTrack.addEventListener("scroll", updatePhotoControls, { passive: true });
new ResizeObserver(updatePhotoControls).observe(photoTrack);
photoDialog.addEventListener("keydown", (event) => {
  if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
  event.preventDefault();
  movePhoto(event.key === "ArrowLeft" ? -1 : 1);
});
photoDialog.addEventListener("close", () => photoTrack.replaceChildren());

const openPhotoViewer = (selected, images) => {
  // Preserve the gallery order and only insert the selected cover if it is missing.
  const orderedPhotos = [...new Map(images.map((image) => [image.src, image])).values()];
  if (!orderedPhotos.some((image) => image.src === selected.src)) orderedPhotos.unshift(selected);
  photoTrack.replaceChildren(...orderedPhotos.map((image) => {
    const frame = document.createElement("div");
    const photo = new Image();
    photo.src = image.src;
    photo.alt = image.alt;
    frame.append(photo);
    return frame;
  }));
  photoDialog.showModal();
  const index = orderedPhotos.findIndex((image) => image.src === selected.src);
  photoTrack.scrollTo({ left: index * photoTrack.clientWidth, behavior: "instant" });
  updatePhotoControls();
};

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
    const grid = modal.querySelector(".hobby-photo-grid");
    if (grid && !grid.querySelector(".hobby-cover-photo")) {
      const cover = document.createElement("figure");
      cover.className = "hobby-cover-photo";
      cover.append(button.querySelector("img").cloneNode());
      grid.prepend(cover);
      const images = [...grid.querySelectorAll("img")];
      for (const image of images) {
        const photoButton = document.createElement("button");
        photoButton.type = "button";
        photoButton.className = "hobby-photo-button";
        photoButton.setAttribute("aria-label", image.alt + "を拡大");
        image.replaceWith(photoButton);
        photoButton.append(image);
        photoButton.addEventListener("click", () => openPhotoViewer(image, images));
      }
    }
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
  if (event.key !== "Escape" || photoDialog.open) return;
  if (!hobbyModals.some((modal) => modal.classList.contains("is-open"))) return;
  closeHobbyModals();
});

// Scroll each year independently without intercepting native touch gestures.
for (const year of document.querySelectorAll(".work-year")) {
  const track = year.querySelector(".work-year-grid");
  if (!track) continue;

  const controls = document.createElement("div");
  controls.className = "work-row-controls";
  for (const [direction, label, icon] of [[-1, "前の作品", "‹"], [1, "次の作品", "›"]]) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = icon;
    button.title = label;
    button.setAttribute("aria-label", label);
    const update = () => {
      const remaining = track.scrollWidth - track.clientWidth - track.scrollLeft;
      button.disabled = direction < 0 ? track.scrollLeft <= 1 : remaining <= 1;
    };
    button.addEventListener("click", () => {
      const first = track.children[0];
      const next = track.children[1];
      if (first && next) {
        track.scrollBy({ left: direction * (next.offsetLeft - first.offsetLeft) });
      }
    });
    track.addEventListener("scroll", update, { passive: true });
    new ResizeObserver(update).observe(track);
    controls.append(button);
    update();
  }
  year.querySelector(".work-year-head")?.append(controls);
}

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
  const photos = slides.filter((slide) => slide instanceof HTMLImageElement);
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

  const openImageLightbox = (image) => openPhotoViewer(image, photos);

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
    stopVideos();
  };

  for (const button of openButtons) {
    button.addEventListener("click", (event) => {
      openModal();
      const image = event.target;
      if (!(image instanceof HTMLImageElement)) return;
      const index = slides.findIndex((slide) => slide instanceof HTMLImageElement && slide.src === image.src);
      if (index >= 0) showSlide(index);
      else openImageLightbox(image);
    });
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
      const image = button.querySelector("img");
      const imageIndex = slides.findIndex((slide) => slide instanceof HTMLImageElement && slide.src === image?.src);
      const targetSlide = imageIndex >= 0 ? imageIndex : Number(button.dataset.slideJump);
      showSlide(targetSlide);
      const selectedImage = image ?? slides[targetSlide];
      if (selectedImage instanceof HTMLImageElement) openImageLightbox(selectedImage);
    });
  }
  document.addEventListener("keydown", (event) => {
    if (photoDialog.open || !workModal.classList.contains("is-open")) return;
    if (event.key === "Escape") closeModal();
    if (event.key === "ArrowLeft") showSlide(currentSlide - 1);
    if (event.key === "ArrowRight") showSlide(currentSlide + 1);
  });
};

for (const workModal of workModals) {
  setupWorkModal(workModal);
}
