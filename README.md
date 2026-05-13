<p align="center">
  <img src="icons/title.png" width="400" alt="Smart YouTube Feed" />
</p>
<h1 align="center" style="margin-top: -65px;">SmartYouTubeFeed</h1>

<p align="center">
  <b>Browser extension that surfaces educational, high-signal YouTube content by filtering out low-value recommendations.</b>
</p>

<p align="center">
  <a href="https://addons.mozilla.org/en-US/firefox/addon/smart-youtube-feed/">
    <img src="https://img.shields.io/badge/Firefox-Addon-ff7139?logo=firefox" alt="Firefox Addon" />
  </a>
  <a href="#">
    <img src="https://img.shields.io/badge/Chrome-Under%20Review-4285F4?logo=googlechrome" alt="Chrome Under Review" />
  </a>
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


### Build

```sh
npm install
npm run build
```

Output goes to `dist/`. Load the unpacked extension:

- **Chrome:** `chrome://extensions` → Developer mode → Load unpacked → select this folder
- **Firefox:** `about:debugging` → This Firefox → Temporary Extensions → Load Temporary Add-on → select `manifest.json`

---

## Release process

Releases are done via npm's built-in versioning, which bumps the version in both `package.json` and `manifest.json`, creates a git tag, and pushes to GitHub. A CI workflow then builds and attaches the extension zip to a GitHub Release.

