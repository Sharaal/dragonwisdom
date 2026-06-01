function getPanelHeading(panel) {
  return panel.querySelector("h1, h2, h3, h4, h5, h6");
}

function getTabsId(tabs, index, suffix) {
  if (!tabs.id) {
    tabs.id = `tabs-${index + 1}`;
  }

  return `${tabs.id}-${suffix}`;
}

function setActiveTab(tab, tabsList, panels) {
  tabsList.forEach((item) => {
    const isActive = item === tab;

    item.setAttribute("aria-selected", String(isActive));
    item.tabIndex = isActive ? 0 : -1;
  });

  panels.forEach((panel) => {
    const isActive = panel.id === tab.getAttribute("aria-controls");

    panel.hidden = !isActive;
    panel.tabIndex = isActive ? 0 : -1;
  });
}

function moveTabFocus(tabsList, panels, currentIndex, nextIndex) {
  const tab = tabsList.at(nextIndex);

  if (!tab) {
    return;
  }

  tab.focus();
  setActiveTab(tab, tabsList, panels);
}

export function enhanceTabs(tabs, index = 0) {
  const panels = Array.from(tabs.querySelectorAll(":scope > section"));
  const headings = panels.map(getPanelHeading);

  if (panels.length < 2 || headings.some((heading) => !heading?.textContent?.trim()) || tabs.querySelector(':scope > [role="tablist"]')) {
    return;
  }

  const tablist = document.createElement("div");
  const tabsList = panels.map((panel, panelIndex) => {
    const heading = headings[panelIndex];
    const label = heading.textContent.trim();
    const tabId = panel.id ? `${panel.id}-tab` : getTabsId(tabs, index, `tab-${panelIndex + 1}`);
    const panelId = panel.id || getTabsId(tabs, index, `panel-${panelIndex + 1}`);
    const tab = document.createElement("button");

    tab.type = "button";
    tab.id = tabId;
    tab.textContent = label;
    tab.setAttribute("role", "tab");
    tab.setAttribute("aria-controls", panelId);

    panel.id = panelId;
    panel.setAttribute("role", "tabpanel");
    panel.setAttribute("aria-labelledby", tabId);
    heading.hidden = true;

    tablist.append(tab);

    return tab;
  });

  tablist.setAttribute("role", "tablist");
  tabs.prepend(tablist);

  tabsList.forEach((tab, tabIndex) => {
    tab.addEventListener("click", () => setActiveTab(tab, tabsList, panels));
    tab.addEventListener("focus", () => setActiveTab(tab, tabsList, panels));
    tab.addEventListener("keydown", (event) => {
      const currentIndex = tabsList.indexOf(tab);

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        moveTabFocus(tabsList, panels, currentIndex, currentIndex === 0 ? tabsList.length - 1 : currentIndex - 1);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        moveTabFocus(tabsList, panels, currentIndex, currentIndex === tabsList.length - 1 ? 0 : currentIndex + 1);
      } else if (event.key === "Home") {
        event.preventDefault();
        moveTabFocus(tabsList, panels, currentIndex, 0);
      } else if (event.key === "End") {
        event.preventDefault();
        moveTabFocus(tabsList, panels, currentIndex, tabsList.length - 1);
      } else if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        setActiveTab(tab, tabsList, panels);
      }
    });

    tab.setAttribute("aria-selected", "false");
    tab.tabIndex = tabIndex === 0 ? 0 : -1;
  });

  setActiveTab(tabsList[0], tabsList, panels);
}

export function enhanceAllTabs() {
  document.querySelectorAll("section.tabs").forEach(enhanceTabs);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", enhanceAllTabs, { once: true });
} else {
  enhanceAllTabs();
}
