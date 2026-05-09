const STORAGE_KEY = "settings";

interface ExtensionSettings {
  filterThreshold: number;
}

const DEFAULTS: ExtensionSettings = {
  filterThreshold: 0,
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

document.addEventListener("DOMContentLoaded", async () => {
  const slider = document.getElementById("filterThreshold") as HTMLInputElement;
  const valueDisplay = document.getElementById("thresholdValue") as HTMLSpanElement;
  const description = document.getElementById("thresholdDescription") as HTMLParagraphElement;
  const saveBtn = document.getElementById("save") as HTMLButtonElement;
  const statusEl = document.getElementById("status") as HTMLParagraphElement;
  const presetBtns = document.querySelectorAll<HTMLButtonElement>(".presets button");

  const result = await chrome.storage.sync.get(STORAGE_KEY);
  const settings: ExtensionSettings = result[STORAGE_KEY] || DEFAULTS;

  function updateDisplay(val: number) {
    slider.value = String(val);
    valueDisplay.textContent = String(val);
    description.textContent = getThresholdDescription(val);
    presetBtns.forEach((btn) => {
      btn.classList.toggle("active", parseInt(btn.dataset.value!, 10) === val);
    });
  }

  updateDisplay(settings.filterThreshold);

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
      [STORAGE_KEY]: { filterThreshold: val },
    });
    statusEl.textContent = "Settings saved!";
    setTimeout(() => { statusEl.textContent = ""; }, 2000);
  });
});
