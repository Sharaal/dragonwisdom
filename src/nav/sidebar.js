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

function updateSidebarHeight(sidebar) {
  document.documentElement.style.setProperty("--sidebar-height", `${sidebar.offsetHeight}px`);
}

function getSidebarInset() {
  return Number.parseFloat(getComputedStyle(document.documentElement).fontSize) * 1.5;
}

function getSidebarBottomTop(sidebar) {
  const inset = getSidebarInset();

  return Math.min(inset, window.innerHeight - sidebar.offsetHeight - inset);
}

function trackSidebarScrollDirection(sidebar) {
  let lastScrollY = window.scrollY;
  let isScrollQueued = false;
  let stickyTop = getSidebarBottomTop(sidebar);

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
}

export function enhanceSidebarNavigation() {
  const sidebar = document.querySelector("nav.sidebar");
  const links = Array.from(sidebar?.querySelectorAll('a[href^="#"]') ?? []);
  const sections = getLinkedSections(links);

  if (!links.length || !sections.length) {
    return;
  }

  document.documentElement.classList.add("has-sidebar-navigation");
  trackSidebarScrollDirection(sidebar);
  updateSidebarHeight(sidebar);

  if ("ResizeObserver" in window) {
    new ResizeObserver(() => updateSidebarHeight(sidebar)).observe(sidebar);
  } else {
    window.addEventListener("resize", () => updateSidebarHeight(sidebar));
  }

  const fallbackId = sections[0].id;
  const getActiveId = () => {
    const hashId = decodeHash(window.location.hash);
    return sections.some((section) => section.id === hashId) ? hashId : fallbackId;
  };

  const activateCurrentHash = () => showSection(links, sections, getActiveId());
  const scrollToSection = (sectionId) => {
    document.getElementById(sectionId)?.scrollIntoView();
  };
  const activateAndScroll = (sectionId) => {
    showSection(links, sections, sectionId);
    scrollToSection(sectionId);
  };

  links.forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetId = decodeHash(link.hash);

      if (!sections.some((section) => section.id === targetId)) {
        return;
      }

      event.preventDefault();

      if (window.location.hash === link.hash) {
        activateAndScroll(targetId);
      } else {
        window.location.hash = link.hash;
        activateAndScroll(targetId);
      }
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
