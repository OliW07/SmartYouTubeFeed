const STORAGE_KEY = "settings";

interface ExtensionSettings {
  filterThreshold: number;
  customKeywords: Record<string, number>;
  customChannels: Record<string, number>;
}

const DEFAULTS: ExtensionSettings = {
  filterThreshold: 0,
  customKeywords: {},
  customChannels: {},
};

function getThresholdDescription(value: number): string {
  if (value <= -8) return "Very lenient — only the most unwanted videos are removed";
  if (value <= -4) return "Lenient — only clearly unwanted content is filtered";
  if (value <= -1) return "Light — removes moderately negative content";
  if (value === 0)  return "Balanced — default filtering behavior";
  if (value <= 3)   return "Moderate — also removes borderline content";
  if (value <= 7)   return "Aggressive — removes many videos, including mildly relevant ones";
  return "Maximum — almost everything gets filtered out";
}

function renderEntries(
  container: HTMLElement,
  entries: Record<string, number>,
  onRemove: (key: string) => void,
): void {
  container.innerHTML = "";
  const keys = Object.keys(entries);
  if (keys.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-msg";
    empty.textContent = "None added";
    container.appendChild(empty);
    return;
  }
  for (const [name, weight] of Object.entries(entries)) {
    const row = document.createElement("div");
    row.className = "entry";

    const nameSpan = document.createElement("span");
    nameSpan.className = "entry-name";
    nameSpan.textContent = name;

    const weightSpan = document.createElement("span");
    weightSpan.className = "entry-weight " + (weight > 0 ? "pos" : "neg");
    weightSpan.textContent = (weight > 0 ? "+" : "") + weight;

    const labelSpan = document.createElement("span");
    const isPos = weight > 0;
    labelSpan.className = "entry-label " + (isPos ? "pos" : "neg");
    labelSpan.textContent = isPos ? "keep" : "remove";

    const removeBtn = document.createElement("button");
    removeBtn.className = "remove-btn";
    removeBtn.textContent = "✕";
    removeBtn.addEventListener("click", () => onRemove(name));

    row.appendChild(nameSpan);
    row.appendChild(weightSpan);
    row.appendChild(labelSpan);
    row.appendChild(removeBtn);
    container.appendChild(row);
  }
}

function setupAddButton(
  inputId: string,
  signId: string,
  weightId: string,
  listId: string,
  entries: Record<string, number>,
  render: () => void,
  onAdd?: () => void,
): void {
  const input = document.getElementById(inputId) as HTMLInputElement;
  const signBtn = document.getElementById(signId) as HTMLButtonElement;
  const weight = document.getElementById(weightId) as HTMLInputElement;

  signBtn.addEventListener("click", () => {
    const isNeg = signBtn.classList.contains("neg");
    signBtn.classList.toggle("neg", !isNeg);
    signBtn.classList.toggle("pos", isNeg);
    signBtn.textContent = isNeg ? "+" : "−";
  });

  const add = () => {
    const text = input.value.trim().toLowerCase();
    if (!text) return;
    const sign = signBtn.classList.contains("neg") ? -1 : 1;
    const val = parseInt(weight.value, 10) || 1;
    entries[text] = sign * val;
    input.value = "";
    weight.value = "1";
    if (signBtn.classList.contains("neg")) {
      signBtn.classList.remove("neg");
      signBtn.classList.add("pos");
      signBtn.textContent = "+";
    }
    render();
    if (onAdd) onAdd();
    input.focus();
  };

  document.getElementById(inputId.replace("Input", "Add"))!.addEventListener("click", add);
  input.addEventListener("keydown", (e) => { if (e.key === "Enter") add(); });
}

document.addEventListener("DOMContentLoaded", async () => {
  const slider = document.getElementById("filterThreshold") as HTMLInputElement;
  const valueDisplay = document.getElementById("thresholdValue") as HTMLSpanElement;
  const description = document.getElementById("thresholdDescription") as HTMLParagraphElement;
  const saveBtn = document.getElementById("save") as HTMLButtonElement;
  const statusEl = document.getElementById("status") as HTMLParagraphElement;
  const presetBtns = document.querySelectorAll<HTMLButtonElement>(".presets button");

  const result = await chrome.storage.sync.get(STORAGE_KEY);
  const settings: ExtensionSettings = result[STORAGE_KEY] || DEFAULTS;
  settings.customKeywords ??= {};
  settings.customChannels ??= {};

  const keywordList = document.getElementById("keywordList")!;
  const channelList = document.getElementById("channelList")!;

  async function persistCustomEntries() {
    try {
      const stored = (await chrome.storage.sync.get(STORAGE_KEY))[STORAGE_KEY] as Partial<ExtensionSettings> | undefined;
      await chrome.storage.sync.set({
        [STORAGE_KEY]: {
          ...(stored || {}),
          customKeywords: settings.customKeywords,
          customChannels: settings.customChannels,
        },
      });
    } catch {}
  }

  function renderKeywords() {
    renderEntries(keywordList, settings.customKeywords, (key) => {
      delete settings.customKeywords[key];
      persistCustomEntries();
      renderKeywords();
    });
  }
  function renderChannels() {
    renderEntries(channelList, settings.customChannels, (key) => {
      delete settings.customChannels[key];
      persistCustomEntries();
      renderChannels();
    });
  }

  function updateDisplay(val: number) {
    slider.value = String(val);
    valueDisplay.textContent = String(val);
    description.textContent = getThresholdDescription(val);
    presetBtns.forEach((btn) => {
      btn.classList.toggle("active", parseInt(btn.dataset.value!, 10) === val);
    });
  }

  updateDisplay(settings.filterThreshold);
  renderKeywords();
  renderChannels();

  setupAddButton("keywordInput", "keywordSign", "keywordWeight", "keywordList", settings.customKeywords, renderKeywords, persistCustomEntries);
  setupAddButton("channelInput", "channelSign", "channelWeight", "channelList", settings.customChannels, renderChannels, persistCustomEntries);

  slider.addEventListener("input", () => {
    updateDisplay(parseInt(slider.value, 10));
  });

  presetBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      updateDisplay(parseInt(btn.dataset.value!, 10));
    });
  });

  saveBtn.addEventListener("click", async () => {
    const val = parseInt(slider.value, 10);
    await chrome.storage.sync.set({
      [STORAGE_KEY]: {
        filterThreshold: val,
        customKeywords: settings.customKeywords,
        customChannels: settings.customChannels,
      },
    });
    statusEl.textContent = "Settings saved!";
    setTimeout(() => { statusEl.textContent = ""; }, 2000);
  });
});
