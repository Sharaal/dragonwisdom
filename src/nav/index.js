import { translate } from "../i18n/index.js";

const onePageMode = "one-page";
const multiPageMode = "multi-page";

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

function markCurrentLink(links, activeId) {
  links.forEach((link) => {
    const isCurrent = decodeHash(link.hash) === activeId;

    if (isCurrent) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

function showSection(links, sections, activeId) {
  sections.forEach((section) => {
    section.hidden = section.id !== activeId;
  });

  markCurrentLink(links, activeId);
}

function showAllSections(sections) {
  sections.forEach((section) => {
    section.hidden = false;
  });
}

function scrollToSection(section) {
  if (!section) {
    return;
  }

  section.scrollIntoView();
}

function createModeButton(nav) {
  const button = nav.querySelector("button[data-nav-mode-button]") ?? document.createElement("button");

  button.type = "button";
  button.classList.add("secondary");
  button.dataset.navModeButton = "";

  if (!button.parentElement) {
    nav.prepend(button);
  }

  return button;
}

export function enhanceNavNavigation() {
  const nav = document.querySelector("body > nav");
  const menuButton = nav?.querySelector('button[aria-controls="main-navigation"]');
  const links = Array.from(nav?.querySelectorAll('a[href^="#"]') ?? []);
  const sections = getLinkedSections(links);
  const isPageable = document.body.classList.contains("pageable");

  if (!links.length || !sections.length) {
    return;
  }

  document.documentElement.classList.add("has-nav-navigation");

  const modeButton = isPageable ? createModeButton(nav) : null;
  const fallbackId = sections[0].id;
  let mode = multiPageMode;
  let observer = null;
  let scheduledMarkFrame = 0;
  let isTrackingScroll = false;

  const getActiveId = () => {
    const hashId = decodeHash(window.location.hash);
    return sections.some((section) => section.id === hashId) ? hashId : fallbackId;
  };
  const getCurrentLinkId = () => {
    const currentLink = links.find((link) => link.getAttribute("aria-current") === "page");

    return currentLink ? decodeHash(currentLink.hash) : "";
  };
  const getFocusOffset = (section = sections[0]) => {
    if (!section) {
      return 0;
    }

    const scrollMarginTop = Number.parseFloat(getComputedStyle(section).scrollMarginTop);

    return Number.isFinite(scrollMarginTop) ? scrollMarginTop : 0;
  };
  const getClosestVisibleSectionId = () => {
    const firstSection = sections[0];
    const focusedSection = sections.findLast((section) => section.getBoundingClientRect().top <= getFocusOffset(section));

    if (focusedSection) {
      return focusedSection.id;
    }

    if (firstSection && firstSection.getBoundingClientRect().top > getFocusOffset(firstSection)) {
      return firstSection.id;
    }

    return getActiveId();
  };
  const markClosestVisibleSection = () => {
    markCurrentLink(links, getClosestVisibleSectionId());
  };
  const scheduleMarkClosestVisibleSection = () => {
    if (scheduledMarkFrame) {
      return;
    }

    scheduledMarkFrame = window.requestAnimationFrame(() => {
      scheduledMarkFrame = 0;
      markClosestVisibleSection();
    });
  };
  const addScrollTracking = () => {
    if (isTrackingScroll) {
      return;
    }

    isTrackingScroll = true;
    window.addEventListener("scroll", scheduleMarkClosestVisibleSection, { passive: true });
    window.addEventListener("resize", scheduleMarkClosestVisibleSection);
  };
  const removeScrollTracking = () => {
    if (!isTrackingScroll) {
      return;
    }

    isTrackingScroll = false;
    window.removeEventListener("scroll", scheduleMarkClosestVisibleSection);
    window.removeEventListener("resize", scheduleMarkClosestVisibleSection);

    if (scheduledMarkFrame) {
      window.cancelAnimationFrame(scheduledMarkFrame);
      scheduledMarkFrame = 0;
    }
  };
  const updateModeButton = () => {
    if (!modeButton) {
      return;
    }

    modeButton.textContent = translate(mode === onePageMode ? "nav.mode.onePage" : "nav.mode.multiPage");
    modeButton.setAttribute("aria-pressed", String(mode === multiPageMode));
  };
  const updateHash = (hash) => {
    if (window.location.hash !== hash) {
      window.history.pushState(null, "", hash);
    }
  };
  const disconnectObserver = () => {
    observer?.disconnect();
    observer = null;
    removeScrollTracking();
  };
  const observeSections = () => {
    disconnectObserver();
    addScrollTracking();

    if (!("IntersectionObserver" in window)) {
      markClosestVisibleSection();
      return;
    }

    observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        scheduleMarkClosestVisibleSection();
      }
    }, {
      rootMargin: `-${getFocusOffset()}px 0px -70% 0px`,
      threshold: 0
    });

    sections.forEach((section) => observer.observe(section));
    scheduleMarkClosestVisibleSection();
  };

  const activateCurrentHash = () => {
    if (mode === onePageMode) {
      showSection(links, sections, getActiveId());
    } else {
      showAllSections(sections);
      markCurrentLink(links, getActiveId());
      observeSections();
    }
  };
  const activateSection = (sectionId) => {
    if (mode === onePageMode) {
      showSection(links, sections, sectionId);
    } else {
      showAllSections(sections);
      markCurrentLink(links, sectionId);
    }
  };
  const setMode = (nextMode) => {
    mode = nextMode;
    updateModeButton();

    if (mode === onePageMode) {
      disconnectObserver();
      showSection(links, sections, getCurrentLinkId() || getActiveId());
    } else {
      showAllSections(sections);
      markCurrentLink(links, getClosestVisibleSectionId());
      observeSections();
    }
  };
  const setMenuExpanded = (expanded) => {
    menuButton?.setAttribute("aria-expanded", String(expanded));
    menuButton?.setAttribute("aria-label", translate(expanded ? "nav.closeMenu" : "nav.openMenu"));
  };
  const closeMenu = () => {
    if (window.matchMedia("(max-width: 47.999rem)").matches) {
      setMenuExpanded(false);
    }
  };
  const toggleMenu = (event) => {
    if (!window.matchMedia("(max-width: 47.999rem)").matches) {
      return;
    }

    const scrollX = window.scrollX;
    const scrollY = window.scrollY;

    event.preventDefault();
    setMenuExpanded(menuButton?.getAttribute("aria-expanded") !== "true");
    window.scrollTo(scrollX, scrollY);
  };

  menuButton?.addEventListener("click", toggleMenu);
  setMenuExpanded(menuButton?.getAttribute("aria-expanded") === "true");
  updateModeButton();

  modeButton?.addEventListener("click", () => {
    setMode(mode === onePageMode ? multiPageMode : onePageMode);
  });

  links.forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetId = decodeHash(link.hash);

      if (!sections.some((section) => section.id === targetId)) {
        return;
      }

      event.preventDefault();

      updateHash(link.hash);
      activateSection(targetId);
      scrollToSection(document.getElementById(targetId));

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
  document.addEventListener("DOMContentLoaded", enhanceNavNavigation, { once: true });
} else {
  enhanceNavNavigation();
}
