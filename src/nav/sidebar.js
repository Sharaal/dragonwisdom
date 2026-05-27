function decodeHash(hash) {
  try {
    return decodeURIComponent(hash.slice(1));
  } catch {
    return hash.slice(1);
  }
}

function getLinkedSections(links) {
  return links
    .map((link) => document.getElementById(decodeHash(link.hash)))
    .filter(Boolean);
}

function showSection(links, sections, activeId) {
  sections.forEach((section) => {
    section.hidden = section.id !== activeId;
  });

  links.forEach((link) => {
    const isCurrent = decodeHash(link.hash) === activeId;

    if (isCurrent) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

function scrollToMain() {
  const main = document.querySelector("main");

  if (!main) {
    return;
  }

  const headerHeight = document.querySelector("body > header")?.offsetHeight ?? 0;
  const scrollTop = main.getBoundingClientRect().top + window.scrollY - headerHeight;

  if (window.scrollY > scrollTop) {
    window.scrollTo(window.scrollX, scrollTop);
  }
}

function updateSidebarHeight(sidebar) {
  document.documentElement.style.setProperty("--sidebar-height", `${sidebar.offsetHeight}px`);
}

function getSidebarInset() {
  return Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-height")) || 0;
}

function getSidebarBottomTop(sidebar) {
  const inset = getSidebarInset();

  return Math.min(inset, window.innerHeight - sidebar.offsetHeight);
}

function trackSidebarScrollDirection(sidebar) {
  let lastScrollY = window.scrollY;
  let isScrollQueued = false;
  let stickyTop = getSidebarInset();

  const setStickyTop = () => {
    const inset = getSidebarInset();
    const bottomTop = getSidebarBottomTop(sidebar);

    stickyTop = Math.max(bottomTop, Math.min(inset, stickyTop));
    document.documentElement.style.setProperty("--sidebar-sticky-top", `${stickyTop}px`);
  };

  const updateScrollDirection = () => {
    const currentScrollY = window.scrollY;
    const scrollDistance = currentScrollY - lastScrollY;

    if (scrollDistance < 0) {
      document.documentElement.classList.add("sidebar-scroll-up");
      stickyTop -= scrollDistance;
    } else if (scrollDistance > 0) {
      document.documentElement.classList.remove("sidebar-scroll-up");
      stickyTop -= scrollDistance;
    }

    setStickyTop();
    lastScrollY = currentScrollY;
    isScrollQueued = false;
  };

  const handleScroll = () => {
    if (isScrollQueued) {
      return;
    }

    isScrollQueued = true;
    requestAnimationFrame(updateScrollDirection);
  };

  window.addEventListener("scroll", handleScroll, { passive: true });
  window.addEventListener("resize", setStickyTop);
  setStickyTop();

  return setStickyTop;
}

export function enhanceSidebarNavigation() {
  const sidebar = document.querySelector("nav.sidebar");
  const menu = sidebar?.querySelector(".sidebar-toggle");
  const menuLabel = sidebar?.querySelector("label");
  const links = Array.from(sidebar?.querySelectorAll('a[href^="#"]') ?? []);
  const sections = getLinkedSections(links);

  if (!links.length || !sections.length) {
    return;
  }

  document.documentElement.classList.add("has-sidebar-navigation");
  const updateSidebarPosition = trackSidebarScrollDirection(sidebar);
  updateSidebarHeight(sidebar);

  if ("ResizeObserver" in window) {
    new ResizeObserver(() => updateSidebarHeight(sidebar)).observe(sidebar);
  } else {
    window.addEventListener("resize", updateSidebarPosition);
    window.addEventListener("resize", () => updateSidebarHeight(sidebar));
  }

  const fallbackId = sections[0].id;
  const getActiveId = () => {
    const hashId = decodeHash(window.location.hash);
    return sections.some((section) => section.id === hashId) ? hashId : fallbackId;
  };

  const activateCurrentHash = () => showSection(links, sections, getActiveId());
  const activateSection = (sectionId) => showSection(links, sections, sectionId);
  const closeMenu = () => {
    if (window.matchMedia("(max-width: 47.999rem)").matches) {
      menu.checked = false;
    }
  };
  const toggleMenu = (event) => {
    if (!window.matchMedia("(max-width: 47.999rem)").matches) {
      return;
    }

    const scrollX = window.scrollX;
    const scrollY = window.scrollY;

    event.preventDefault();
    menu.checked = !menu.checked;
    window.scrollTo(scrollX, scrollY);
    updateSidebarHeight(sidebar);
  };

  menuLabel?.addEventListener("pointerdown", toggleMenu);
  menuLabel?.addEventListener("click", (event) => {
    if (window.matchMedia("(max-width: 47.999rem)").matches) {
      event.preventDefault();
    }
  });

  links.forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetId = decodeHash(link.hash);

      if (!sections.some((section) => section.id === targetId)) {
        return;
      }

      event.preventDefault();

      if (window.location.hash !== link.hash) {
        window.history.pushState(null, "", link.hash);
      }

      activateSection(targetId);
      scrollToMain();

      closeMenu();
    });
  });

  if (!window.location.hash) {
    window.history.replaceState(null, "", `#${fallbackId}`);
  }

  window.addEventListener("hashchange", activateCurrentHash);
  activateCurrentHash();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", enhanceSidebarNavigation, { once: true });
} else {
  enhanceSidebarNavigation();
}
