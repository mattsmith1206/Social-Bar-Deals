# Social 🍻 — bar deals near UGA

A mobile-first web app that answers **"Where should we go tonight?"** for Athens, GA.
No build step and no dependencies. Open `index.html` in a browser, or host the folder on any static host (GitHub Pages, Netlify, Vercel).

> ⚠️ **All bars and deals in `data/athens.js` are fictional placeholder data.** The street names are real downtown Athens streets. Everything else is made up.

## Files
| File | What it is |
|---|---|
| `index.html`, `app.js`, `styles.css` | The app (feed, filters, detail sheet, age gate, Get home safe) |
| `core.js` | Shared logic: weekly schedules → time windows, duplicate merging, storage |
| `data/athens.js` | Athens bars + weekly specials (one file per city) |
| `admin.html`, `admin.js` | Admin form to add and edit bars and their weekly deals |

## How the feed works
- **Day switcher:** Tonight / Tomorrow / This Week. "Tonight" lasts until 4am.
- **One deal per bar:** a live deal comes first, then the soonest one, then the highest `score`. The bar's other deals are on its detail page.
- **Near-duplicate merging:** within a bar, titles are compared after removing time phrases, filler words and plurals. So `$3 wells until 11` and `$3 well drinks` become one deal with combined days.
- **Variety:** the same `kind` never appears twice in a row, and the same `type` never three times in a row, when there's another option.
- **Expired deals** disappear automatically. The feed refreshes every minute.
- **Not interested (⋯):** hides a bar, or a kind of deal (e.g. all karaoke). You can undo it from the menu.
- **Sorting:** live deals come first, then distance (if location is allowed), otherwise popularity.

## Adding real bars and weekly specials
1. Open **Menu → Admin** (`admin.html`), then **+ Add bar** or **Edit**.
2. Fill in the name, address, coordinates (long-press the pin in Google Maps, or "Use my current location" while standing at the bar), age rule, cover and hours.
3. Add each weekly deal **once**: a short title, type, kind, the days it runs, and its start and end times. A deal that ends after midnight works fine (9:00 PM → 2:00 AM).
4. **Save.** Changes show up right away, but only on that device.
5. To publish for everyone: **Download data file** → replace `data/athens.js` with it → commit/deploy.
   (Use **Export JSON** / **Import JSON** to pass data between devices or to/from a spreadsheet-to-JSON tool.)

Deal fields: `title`, `type` (drinks | happyhour | nocover | events | food), `kind` (beer, wells, cocktails, shots, wine, trivia, karaoke, music, dj, …), `days` (0 = Sun … 6 = Sat), `start`/`end` ("HH:MM", 24h), `score` (1–5), `finePrint`.

## Adding another college town
Copy `data/athens.js` to e.g. `data/clemson.js`. Change the last key to `window.SOCIAL_CITIES.clemson`, and set `id`, `name`, `school` and `center`. Then add a `<script src="data/clemson.js">` line to `index.html` and `admin.html`. The city will show up in the menu.
