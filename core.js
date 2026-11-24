/* Social — shared helpers (used by the app and the admin page) */
(function () {
  const TYPES = {
    drinks: { label: "Drinks", emoji: "🍹" },
    happyhour: { label: "Happy Hour", emoji: "⏰" },
    nocover: { label: "No Cover", emoji: "🎟️" },
    events: { label: "Events", emoji: "🎉" },
    food: { label: "Food", emoji: "🍔" }
  };
  const KINDS = {
    beer: { label: "Beer", emoji: "🍺" }, wells: { label: "Well drinks", emoji: "🥃" },
    cocktails: { label: "Cocktails", emoji: "🍸" }, shots: { label: "Shots", emoji: "💥" },
    wine: { label: "Wine", emoji: "🍷" }, mimosas: { label: "Mimosas", emoji: "🥂" },
    trivia: { label: "Trivia", emoji: "🧠" }, karaoke: { label: "Karaoke", emoji: "🎤" },
    music: { label: "Live music", emoji: "🎸" }, dj: { label: "DJ nights", emoji: "🎧" },
    dance: { label: "Dancing", emoji: "🤠" }, games: { label: "Games", emoji: "🎱" },
    food: { label: "Food", emoji: "🍔" }, wings: { label: "Wings", emoji: "🍗" },
    tacos: { label: "Tacos", emoji: "🌮" }, cover: { label: "Cover deals", emoji: "🎟️" }
  };
  const DAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const NIGHT_ROLLOVER_HOUR = 4; // before 4am still counts as "tonight"

  const store = {
    get(k, d) { try { const v = localStorage.getItem("social." + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem("social." + k, JSON.stringify(v)); } catch (e) {} },
    del(k) { try { localStorage.removeItem("social." + k); } catch (e) {} }
  };

  function cityIds() { return Object.keys(window.SOCIAL_CITIES || {}); }
  // Admin edits are saved on the device and override the bundled file.
  function loadCity(id) {
    const base = (window.SOCIAL_CITIES || {})[id];
    const override = store.get("data." + id, null);
    return override && override.bars ? override : base;
  }

  const hm = (s) => { const [h, m] = String(s).split(":").map(Number); return (h || 0) * 60 + (m || 0); };

  function fmtTime(mins) {
    mins = ((mins % 1440) + 1440) % 1440;
    const h = Math.floor(mins / 60), m = mins % 60;
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return { t: h12 + (m ? ":" + String(m).padStart(2, "0") : ""), ap: h < 12 ? "am" : "pm" };
  }
  function fmtRange(start, end) {
    const a = fmtTime(hm(start)), b = fmtTime(hm(end));
    return a.ap === b.ap && hm(end) > hm(start) ? `${a.t}–${b.t}${b.ap}` : `${a.t}${a.ap}–${b.t}${b.ap}`;
  }
  function fmtDays(days) {
    const order = [1, 2, 3, 4, 5, 6, 0];
    const set = new Set(days);
    if (set.size === 7) return "Daily";
    if (set.size === 0) return "—";
    const idx = order.filter((d) => set.has(d)).map((d) => order.indexOf(d));
    const runs = []; let s = idx[0], p = idx[0];
    for (let i = 1; i <= idx.length; i++) {
      if (idx[i] === p + 1) { p = idx[i]; continue; }
      runs.push(s === p ? DAY_SHORT[order[s]] : p === s + 1 ? `${DAY_SHORT[order[s]]}, ${DAY_SHORT[order[p]]}` : `${DAY_SHORT[order[s]]}–${DAY_SHORT[order[p]]}`);
      s = p = idx[i];
    }
    return runs.join(", ");
  }

  // Near-duplicate detection: "$3 wells" == "$3 well drinks", "$1 off any drink" == "$1 off drinks"
  const FILLER = new Set(["any", "all", "the", "a", "our", "every", "of", "on", "for", "and", "&"]);
  function dealKey(deal) {
    const t = String(deal.title).toLowerCase()
      .replace(/\b\d{1,2}(:\d\d)?\s*(am|pm)?\s*(–|-|to)\s*\d{1,2}(:\d\d)?\s*(am|pm)?\b/g, " ")   // "10–11pm"
      .replace(/\b(until|til|till|before|after|from|starting)\s+\d{1,2}(:\d\d)?\s*(am|pm)?\b/g, " "); // "until 11"
    let words = t.replace(/[^a-z0-9$%¢. ]/g, " ").split(/\s+/).filter(Boolean)
      .filter((w) => !FILLER.has(w))
      .map((w) => (w.length > 3 && w.endsWith("s") && !w.endsWith("ss") ? w.slice(0, -1) : w));
    const core = words.filter((w) => w !== "drink");
    if (core.length) words = core;
    return deal.type + "|" + Array.from(new Set(words)).sort().join(" ");
  }

  // Merge near-duplicate deals of one bar into one deal with several schedules.
  function mergedDeals(bar) {
    const map = new Map();
    for (const d of bar.deals || []) {
      const k = dealKey(d);
      const sched = { days: d.days || [], start: d.start, end: d.end };
      if (!map.has(k)) map.set(k, Object.assign({}, d, { key: k, schedules: [sched] }));
      else {
        const m = map.get(k);
        const same = m.schedules.find((s) => s.start === sched.start && s.end === sched.end);
        if (same) same.days = Array.from(new Set(same.days.concat(sched.days)));
        else m.schedules.push(sched);
        m.score = Math.max(m.score || 0, d.score || 0);
        if (!m.finePrint && d.finePrint) m.finePrint = d.finePrint;
      }
    }
    return Array.from(map.values());
  }

  function nightBase(now) {
    const d = new Date(now.getTime() - NIGHT_ROLLOVER_HOUR * 3600e3);
    d.setHours(0, 0, 0, 0);
    return d;
  }
  function addDays(d, n) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }

  // Expand recurring weekly schedules into concrete time windows on the given dates.
  function occurrences(bar, dates) {
    const out = [];
    for (const deal of mergedDeals(bar)) {
      for (const s of deal.schedules) {
        const sm = hm(s.start); let em = hm(s.end); if (em <= sm) em += 1440;
        for (const date of dates) {
          if (!s.days.includes(date.getDay())) continue;
          const start = new Date(date); start.setHours(0, sm, 0, 0);
          const end = new Date(date); end.setHours(0, em, 0, 0);
          out.push({ bar, deal, sched: s, date, start, end });
        }
      }
    }
    return out;
  }

  function miles(a, b) {
    const R = 3958.8, r = Math.PI / 180;
    const dLat = (b.lat - a.lat) * r, dLng = (b.lng - a.lng) * r;
    const x = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(x));
  }

  function slug(s) { return String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "item"; }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }

  window.Social = { TYPES, KINDS, DAY_SHORT, store, cityIds, loadCity, hm, fmtTime, fmtRange, fmtDays, dealKey, mergedDeals, nightBase, addDays, occurrences, miles, slug, esc };
})();
