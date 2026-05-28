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

function scrollToSection(section) {
  if (!section) {
    return;
  }

  section.scrollIntoView();
}

export function enhanceNavNavigation() {
  const nav = document.querySelector("body > nav");
  const menuButton = nav?.querySelector('button[aria-controls="main-navigation"]');
  const links = Array.from(nav?.querySelectorAll('a[href^="#"]') ?? []);
  const sections = getLinkedSections(links);

  if (!links.length || !sections.length) {
    return;
  }

  document.documentElement.classList.add("has-nav-navigation");

  const fallbackId = sections[0].id;
  const getActiveId = () => {
    const hashId = decodeHash(window.location.hash);
    return sections.some((section) => section.id === hashId) ? hashId : fallbackId;
  };

  const activateCurrentHash = () => showSection(links, sections, getActiveId());
  const activateSection = (sectionId) => showSection(links, sections, sectionId);
  const setMenuExpanded = (expanded) => {
    menuButton?.setAttribute("aria-expanded", String(expanded));
    menuButton?.setAttribute("aria-label", expanded ? "Menü schließen" : "Menü öffnen");
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
