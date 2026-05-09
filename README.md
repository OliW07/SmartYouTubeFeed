<p align="center">
  <img src="icons/title.png" width="400" alt="Smart YouTube Feed" />
</p>
<h1 align="center" style="margin-top: -85px;">SmartYouTubeFeed</h1>

<p align="center">
  <b>Browser extension that surfaces educational, high-signal YouTube content by filtering out low-value recommendations.</b>
</p>

---

## How it works

Every video on your YouTube feed is scored against a weighted keyword and channel list. Videos with a score below the configured threshold are hidden from view.

The scoring is simple additive matching: each keyword or channel name found in a video's title or channel name contributes its weight to the total score. Positive weights keep videos visible, negative weights remove them.

---

## Configuration

Click the extension icon in your browser toolbar to open the popup.

| Setting | Description |
|---|---|
| **Filter threshold** | Controls how aggressive the filtering is. Lower values are more lenient; higher values remove more videos. Default: `0` (balanced). |
| **Custom keywords / channels** | Add your own terms and weights directly in the popup. Saved instantly to your browser storage. Entries apply on top of the built-in keyword list and persist across sessions. |

---

## Custom entries from the popup

Open the popup and scroll to the **Custom Keywords** and **Custom Channels** sections.

1. Type a word or channel name
2. Toggle the **+ / −** button for positive (keep) or negative (remove) weighting
3. Set the weight magnitude (1–10)
4. Click **Add** or press **Enter**

Added entries appear below with a ✕ button to remove them. Click **Save** at the top and refresh YouTube to apply.

---

## Advanced: editing the built-in keyword list

The bundled keyword list lives in `data/keywords.json`. Edit it directly to add or adjust weights:

```json
{
  "keywords": {
    "machine learning": 5,
    "reality tv": -5
  },
  "channels": {
    "3Blue1Brown": 5,
    "low effort vlog": -3
  }
}
```

After editing, run `npm run build` and reload the extension.

---

## Development

### Prerequisites

- Node.js 20+
- npm

### Setup

```sh
npm install
```

### Build

```sh
npm run build
```

Output goes to `dist/`. Load the unpacked extension:

- **Chrome:** `chrome://extensions` → Developer mode → Load unpacked → select this folder
- **Firefox:** `about:debugging` → This Firefox → Temporary Extensions → Load Temporary Add-on → select `manifest.json`

---

## Release process

Releases are done via npm's built-in versioning, which bumps the version in both `package.json` and `manifest.json`, creates a git tag, and pushes to GitHub. A CI workflow then builds and attaches the extension zip to a GitHub Release.

### Create a release

```sh
# Ensure you're on main with no uncommitted changes
git checkout main
git pull

# Bump the version (patch = bug fix, minor = new feature, major = breaking)
npm version patch

# Push the commit and tag to GitHub
git push --follow-tags
```

`npm version patch` increments `1.0.0` → `1.0.1`.  
Use `npm version minor` for `1.0.0` → `1.1.0`, or `npm version major` for `1.0.0` → `2.0.0`.

### What happens automatically

1. `npm version` bumps the version in `package.json` and `manifest.json`, creates a commit and a `vX.Y.Z` tag
2. Pushing the tag triggers the **Release** GitHub Action (`.github/workflows/release.yml`)
3. The Action runs `npm ci`, `npm run pack` (build + zip), and creates a **GitHub Release** with `smart-youtube-feed.zip` attached

### Upload to the Chrome Web Store

1. Go to the [Releases page](https://github.com/OliW07/SmartYouTubeFeed/releases) on GitHub
2. Download `smart-youtube-feed.zip` from the latest release
3. Go to the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
4. Upload the zip as a new package or new version

---

## Project structure

```
├── .github/workflows/release.yml    CI workflow for building releases
├── icons/                            Extension icons (16/32/48/128)
├── data/keywords.json                Built-in keyword and channel weights
├── dist/                             Build output (gitignored)
├── src/
│   ├── content.ts                    Content script injected on YouTube
│   ├── score.ts                      Keyword/channel scoring logic
│   ├── options.html                  Extension popup HTML
│   └── options.ts                    Extension popup logic
├── manifest.json                     Extension manifest (MV3)
└── package.json                      npm scripts and dependencies
```
