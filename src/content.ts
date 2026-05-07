import { score } from "./score";

// YouTube Homepage Video Filter — Content Script

function logRemoval(title: string, channel: string): void {
  console.groupCollapsed(
    `%c[YT Filter] Removed%c "${title}"`,
    "color: #ff4444; font-weight: bold;",
    "color: inherit; font-weight: normal;",
  );
  console.log("  Title:    ", title);
  console.log("  Channel:  ", channel);
  console.log("  Time:     ", new Date().toLocaleTimeString());
  console.groupEnd();
}

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
  const t = title.toLowerCase();
  const c = channel.toLowerCase();

  const videoScore: number = score(title, channel);
  if (videoScore <= 0) {
    console.log(
      `%c[YT Filter] ${title} was removed this pass`,
      "color: #ff9900;",
    );
    return true;
  }

  return false;
}

function removeFromDOM(el: Element): void {
  if (el.hasAttribute("data-filtered")) return;
  el.setAttribute("data-filtered", "true");
  el.style.setProperty("display", "none", "important");
}

let filterPass = 0;

function applyFilters(): void {
  filterPass++;
  let count = 0;
  const items = document.querySelectorAll(
    "ytd-rich-item-renderer:not([data-filtered]):not([data-processed])",
  );

  if (items.length === 0 && filterPass < 15) {
    console.log(
      `[YT Filter] No items yet, will retry filter pass ${filterPass + 1}...`,
    );
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
      count++;
    });

  document
    .querySelectorAll("ytd-rich-section-renderer:not([data-filtered]):not([data-processed])")
    .forEach((section) => {
      section.setAttribute("data-processed", "true");
      if (section.getBoundingClientRect().height === 0) {
        removeFromDOM(section);
      }
    });

  if (count > 0) {
    console.log(
      `%c[YT Filter] ${count} video(s) removed this pass`,
      "color: #ff9900;",
    );
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
      console.log(
        `[YT Filter] #contents not found, retrying (${retries + 1}/20)...`,
      );
      setTimeout(() => attachObserver(retries + 1), 300);
    } else {
      console.warn("[YT Filter] Could not find #contents after 20 retries.");
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
  console.log("%c[YT Filter] Observer attached to #contents.", "color: #888;");
}

// Init

console.log(
  "%c[YT Filter] Starting — waiting for YouTube DOM...",
  "color: #ff9900; font-weight: bold;",
);

setTimeout(applyFilters, 500);
attachObserver();

console.log(
  "%c[YT Filter] Ready — check console for removed videos.",
  "color: #ff9900; font-weight: bold;",
);
