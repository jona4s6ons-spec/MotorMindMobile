// File: Motor Mind Auto/assets/js/main.js

/**
 * Motor Mind Auto landing page interactions:
 * - Mobile nav open/close + focus management
 * - Active nav link highlighting via IntersectionObserver
 * - Testimonials carousel (buttons + auto-advance)
 * - Current year in footer
 */

(function () {
  const header = document.querySelector("[data-header]");
  const menuToggle = document.querySelector("[data-menu-toggle]");
  const menu = document.querySelector("[data-menu]");
  const navLinks = Array.from(document.querySelectorAll("[data-nav-link]"));
  const year = document.querySelector("[data-year]");

  if (year) year.textContent = String(new Date().getFullYear());

  const state = {
    menuOpen: false,
    carouselIndex: 0,
    carouselTimer: null,
  };

  function setMenu(open) {
    state.menuOpen = open;

    if (!menuToggle || !menu) return;

    menu.classList.toggle("is-open", open);
    menuToggle.setAttribute("aria-expanded", String(open));

    if (open) {
      const firstLink = menu.querySelector("a, button");
      if (firstLink) firstLink.focus();
    } else {
      menuToggle.focus();
    }
  }

  function onDocumentClick(e) {
    if (!state.menuOpen) return;
    if (!menu || !menuToggle) return;

    const target = e.target;
    const clickedInside = menu.contains(target) || menuToggle.contains(target);
    if (!clickedInside) setMenu(false);
  }

  function onKeyDown(e) {
    if (!state.menuOpen) return;
    if (e.key === "Escape") setMenu(false);
  }

  if (menuToggle) {
    menuToggle.addEventListener("click", () => setMenu(!state.menuOpen));
    document.addEventListener("click", onDocumentClick);
    document.addEventListener("keydown", onKeyDown);
  }

  navLinks.forEach((link) => {
    link.addEventListener("click", () => setMenu(false));
  });

  // Active section highlight
  const sectionIds = ["services", "how", "reviews", "about", "pricing", "contact"];
  const sections = sectionIds
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  const linkByHash = new Map(
    navLinks
      .map((a) => [a.getAttribute("href"), a])
      .filter(([href]) => href && href.startsWith("#"))
  );

  function setActive(hash) {
    navLinks.forEach((a) => a.classList.remove("is-active"));
    const link = linkByHash.get(hash);
    if (link) link.classList.add("is-active");
  }

  if ("IntersectionObserver" in window && sections.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (b.intersectionRatio || 0) - (a.intersectionRatio || 0))[0];

        if (!visible || !visible.target?.id) return;
        setActive(`#${visible.target.id}`);
      },
      {
        root: null,
        rootMargin: `-${Math.round((header?.offsetHeight || 72) + 20)}px 0px -60% 0px`,
        threshold: [0.12, 0.25, 0.4],
      }
    );

    sections.forEach((s) => observer.observe(s));
  }

  // Testimonials carousel
  const carousel = document.querySelector("[data-carousel]");
  const track = document.querySelector("[data-track]");
  const prevBtn = document.querySelector("[data-prev]");
  const nextBtn = document.querySelector("[data-next]");

  function getSlideCount() {
    if (!track) return 0;
    return track.children.length;
  }

  function clampIndex(idx) {
    const count = getSlideCount();
    if (count === 0) return 0;
    return ((idx % count) + count) % count;
  }

  function renderCarousel() {
    if (!track) return;
    const idx = clampIndex(state.carouselIndex);
    state.carouselIndex = idx;
    track.style.transform = `translateX(-${idx * 100}%)`;
  }

  function nextCarousel() {
    state.carouselIndex += 1;
    renderCarousel();
  }

  function prevCarousel() {
    state.carouselIndex -= 1;
    renderCarousel();
  }

  function startCarouselAuto() {
    stopCarouselAuto();
    state.carouselTimer = window.setInterval(nextCarousel, 6500);
  }

  function stopCarouselAuto() {
    if (state.carouselTimer) {
      window.clearInterval(state.carouselTimer);
      state.carouselTimer = null;
    }
  }

  if (carousel && track) {
    renderCarousel();
    startCarouselAuto();

    if (nextBtn) nextBtn.addEventListener("click", () => (stopCarouselAuto(), nextCarousel(), startCarouselAuto()));
    if (prevBtn) prevBtn.addEventListener("click", () => (stopCarouselAuto(), prevCarousel(), startCarouselAuto()));

    carousel.addEventListener("mouseenter", stopCarouselAuto);
    carousel.addEventListener("mouseleave", startCarouselAuto);
    carousel.addEventListener("focusin", stopCarouselAuto);
    carousel.addEventListener("focusout", startCarouselAuto);

    window.addEventListener("resize", renderCarousel);
  }
})();