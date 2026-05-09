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

Adjust the slider and click **Save**. Changes apply after refreshing YouTube.

---

## Adding keywords and channels

Edit `data/keywords.json` to add or adjust weights:

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

Positive weights keep matching videos visible; negative weights hide them. After editing, run `npm run build` and reload the extension.

---

## Build

```sh
npm install
npm run build
```

Build output goes to `dist/`. Load the extension in Chrome via `chrome://extensions` (Developer mode → Load unpacked) or in Firefox via `about:debugging`.

