import { score } from "./score";

const STORAGE_KEY = "settings";

interface ExtensionSettings {
  filterThreshold: number;
  customKeywords?: Record<string, number>;
  customChannels?: Record<string, number>;
}

const DEFAULT_SETTINGS: ExtensionSettings = {
  filterThreshold: 0,
};

async function loadSettings(): Promise<ExtensionSettings> {
  try {
    const result = await chrome.storage.sync.get(STORAGE_KEY);
    return (result[STORAGE_KEY] as ExtensionSettings) || DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

let settings: ExtensionSettings = DEFAULT_SETTINGS;

function getItemText(item: Element): { title: string; channel: string } {
  const title =
    item
      .querySelector("a.ytLockupMetadataViewModelTitle span")
      ?.textContent?.trim() ?? "";
  const channel =
    item.querySelector("a.ytAttributedStringLink")?.textContent?.trim() ?? "";
  return { title, channel };
}

// Filter logic

function getMatch(title: string, channel: string): boolean {
  const videoScore: number = score(
    title,
    channel,
    settings.customKeywords,
    settings.customChannels,
  );
  return videoScore <= settings.filterThreshold;
}

function removeFromDOM(el: Element): void {
  if (el.hasAttribute("data-filtered")) return;
  el.setAttribute("data-filtered", "true");
  el.style.setProperty("display", "none", "important");
}

let filterPass = 0;

function applyFilters(): void {
  filterPass++;
  const removed: { title: string; channel: string }[] = [];

  const items = document.querySelectorAll(
    "ytd-rich-item-renderer:not([data-filtered]):not([data-processed])",
  );

  if (items.length === 0 && filterPass < 15) {
    setTimeout(applyFilters, 400);
  }

  document
    .querySelectorAll("ytd-rich-item-renderer:not([data-filtered]):not([data-processed])")
    .forEach((item) => {
      if (item.querySelector("ytd-ad-slot-renderer")) return;

      item.setAttribute("data-processed", "true");
      const { title, channel } = getItemText(item);
      if (!title && !channel) return;

      const match: boolean = getMatch(title, channel);
      if (!match) return;

      removeFromDOM(item);
      removed.push({ title, channel });
    });

  document
    .querySelectorAll("ytd-rich-section-renderer:not([data-filtered]):not([data-processed])")
    .forEach((section) => {
      section.setAttribute("data-processed", "true");
      if (section.getBoundingClientRect().height === 0) {
        removeFromDOM(section);
      }
    });

  if (removed.length > 0) {
    console.groupCollapsed(
      `%c[YT Filter] ${removed.length} video(s) removed`,
      "color: #ff9900; font-weight: bold;",
    );
    for (const { title, channel } of removed) {
      console.log(`${title} — ${channel}`);
    }
    console.groupEnd();
  }
}

// Scroll anchoring

function findAnchorItem(): { el: Element; top: number } | null {
  const items = document.querySelectorAll(
    "ytd-rich-item-renderer[data-processed]",
  );
  if (items.length === 0) return null;
  let best: Element | null = null;
  let bestDist = Infinity;
  for (const item of items) {
    const rect = item.getBoundingClientRect();
    const dist = Math.abs(rect.top);
    if (dist < bestDist) {
      bestDist = dist;
      best = item;
    }
  }
  return { el: best!, top: best!.getBoundingClientRect().top };
}

// Infinite scroll observer

let observerAttached = false;

function attachObserver(retries = 0): void {
  const contents = document.querySelector("ytd-rich-grid-renderer #contents");

  if (!contents) {
    if (retries < 20) {
      setTimeout(() => attachObserver(retries + 1), 300);
    }
    return;
  }

  if (observerAttached) return;
  observerAttached = true;

  let debounceTimer: ReturnType<typeof setTimeout>;

  const observer = new MutationObserver((mutations) => {
    const hasNewItems = mutations.some((m) =>
      [...m.addedNodes].some(
        (n) =>
          (n as Element).nodeName === "YTD-RICH-ITEM-RENDERER" ||
          (n as Element).nodeName === "YTD-RICH-SECTION-RENDERER",
      ),
    );

    if (!hasNewItems) return;

    clearTimeout(debounceTimer);
    const anchor = findAnchorItem();
    const savedScrollY = window.scrollY;
    debounceTimer = setTimeout(() => {
      applyFilters();
      requestAnimationFrame(() => {
        if (anchor && document.contains(anchor.el)) {
          window.scrollBy(0, anchor.el.getBoundingClientRect().top - anchor.top);
        } else {
          window.scrollTo(window.scrollX, savedScrollY);
        }
      });
    }, 150);
  });

  observer.observe(contents, { childList: true });
}

// Init

async function init(): Promise<void> {
  settings = await loadSettings();
  console.log(
    "%c[YT Filter] Active — threshold: " + settings.filterThreshold,
    "color: #ff9900; font-weight: bold;",
  );
  setTimeout(applyFilters, 500);
  attachObserver();
}

init();
