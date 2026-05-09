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

## Build

```sh
npm install
npm run build
```

Build output goes to `dist/`. Load the extension in Chrome via `chrome://extensions` (Developer mode → Load unpacked) or in Firefox via `about:debugging`.
