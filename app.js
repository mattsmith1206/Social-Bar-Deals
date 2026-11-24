/* Social — main feed */
(function () {
  const S = window.Social;
  const { TYPES, KINDS, store, esc } = S;
  const $ = (id) => document.getElementById(id);

  const FAR_MILES = 25; // farther than this from town → use campus as the reference point
  const state = {
    cityId: store.get("city", "athens"),
    view: "tonight",
    filter: null,          // a TYPES key or "saved"
    loc: null,
    locStatus: store.get("locStatus", null), // granted | denied | dismissed
    saved: new Set(store.get("saved", [])),
    hiddenBars: new Set(store.get("hiddenBars", [])),
    hiddenKinds: new Set(store.get("hiddenKinds", [])),
    lastRemoved: null
  };
  if (!S.cityIds().includes(state.cityId)) state.cityId = S.cityIds()[0];
  let city = S.loadCity(state.cityId);

  /* ---------- theme ---------- */
  function applyTheme() { document.documentElement.classList.toggle("light", store.get("theme", "dark") === "light"); }
  applyTheme();

  /* ---------- feed building ---------- */
  function refPoint() {
    if (state.loc && S.miles(state.loc, city.center) <= FAR_MILES) return { pt: state.loc, mine: true };
    return { pt: city.center, mine: false };
  }
  function distanceOf(bar) { return S.miles(refPoint().pt, bar); }

  function datesForView(now) {
    const base = S.nightBase(now);
    if (state.view === "tonight") return [base];
    if (state.view === "tomorrow") return [S.addDays(base, 1)];
    return Array.from({ length: 7 }, (_, i) => S.addDays(base, i));
  }

  function eligible(o) {
    if (state.hiddenKinds.has(o.deal.kind)) return false;
    if (state.filter && state.filter !== "saved" && o.deal.type !== state.filter) return false;
    return true;
  }

  // Best occurrence for one bar: live first, then soonest, then best score.
  function pickBest(occs, now) {
    return occs.slice().sort((a, b) => {
      const la = a.start <= now, lb = b.start <= now;
      if (la !== lb) return la ? -1 : 1;
      if (+a.start !== +b.start) return a.start - b.start;
      return (b.deal.score || 0) - (a.deal.score || 0);
    })[0];
  }

  // Keep order mostly intact, but never put the same kind (or same type) back-to-back if avoidable.
  function spaceOut(items) {
    const pool = items.slice(), out = [];
    const WINDOW = 6;
    while (pool.length) {
      const prev = out[out.length - 1], prev2 = out[out.length - 2];
      let idx = 0;
      if (prev) {
        const ok = (o) => o.deal.kind !== prev.deal.kind && !(prev2 && o.deal.type === prev.deal.type && o.deal.type === prev2.deal.type);
        const okLoose = (o) => o.deal.kind !== prev.deal.kind;
        let found = pool.slice(0, WINDOW).findIndex(ok);
        if (found < 0) found = pool.slice(0, WINDOW).findIndex(okLoose);
        if (found >= 0) idx = found;
      }
      out.push(pool.splice(idx, 1)[0]);
    }
    return out;
  }

  function buildFeed() {
    const now = new Date();
    const dates = datesForView(now);
    const useDist = !!(state.loc && refPoint().mine);
    const items = [];
    for (const bar of city.bars) {
      if (state.hiddenBars.has(bar.id)) continue;
      if (state.filter === "saved" && !state.saved.has(bar.id)) continue;
      const occs = S.occurrences(bar, dates).filter((o) => o.end > now).filter(eligible);  // expired deals drop out here
      if (!occs.length) continue;
      const best = pickBest(occs, now);
      best.live = best.start <= now && now < best.end;
      best.dist = distanceOf(bar);
      best.others = S.mergedDeals(bar).length - 1;
      items.push(best);
    }
    const rank = (a, b) => (useDist ? a.dist - b.dist : (b.bar.popularity || 0) - (a.bar.popularity || 0));
    const live = items.filter((i) => i.live).sort(rank);
    const later = items.filter((i) => !i.live).sort((a, b) => {
      // group by day, then by hour slot, then by distance/popularity
      if (+a.date !== +b.date) return a.date - b.date;
      const ha = Math.floor(a.start / 36e5), hb = Math.floor(b.start / 36e5);
      return ha !== hb ? ha - hb : rank(a, b);
    });
    // Space out similar deals within each day (never reorder across days).
    const groups = [];
    for (const o of later) {
      const g = groups[groups.length - 1];
      if (g && +g.date === +o.date) g.items.push(o); else groups.push({ date: o.date, items: [o] });
    }
    groups.forEach((g) => (g.items = spaceOut(g.items)));
    return { live: spaceOut(live), groups, useDist, now };
  }

  /* ---------- formatting ---------- */
  function windowLabel(o, now) {
    const base = S.nightBase(now);
    const dayDiff = Math.round((o.date - base) / 864e5);
    const range = S.fmtRange(o.sched.start, o.sched.end);
    if (o.live) {
      const left = Math.round((o.end - now) / 6e4);
      const endT = S.fmtTime(S.hm(o.sched.end));
      return left <= 60 ? `Ends in ${left} min` : `Now until ${endT.t}${endT.ap}`;
    }
    const startH = S.hm(o.sched.start) / 60;
    if (dayDiff === 0) return `${startH < 17 ? "Today" : "Tonight"} ${range}`;
    if (dayDiff === 1) return `Tomorrow ${range}`;
    return `${S.DAY_SHORT[o.date.getDay()]} ${range}`;
  }
  const fmtMi = (m) => (m < 0.1 ? "< 0.1 mi" : m.toFixed(1) + " mi");
  const emojiFor = (deal) => (KINDS[deal.kind] || TYPES[deal.type] || { emoji: "🍻" }).emoji;
  const ageShort = (age) => (/18\+/.test(age) ? "18+" : /all ages/i.test(age) ? "All ages" : "21+");

  /* ---------- rendering ---------- */
  function renderChips() {
    const chips = Object.entries(TYPES).map(([k, t]) => `<button class="chip ${state.filter === k ? "on" : ""}" data-filter="${k}">${t.emoji} ${t.label}</button>`);
    chips.push(`<button class="chip ${state.filter === "saved" ? "on" : ""}" data-filter="saved">♥ Saved</button>`);
    $("chips").innerHTML = chips.join("");
  }

  function card(o, now) {
    const saved = state.saved.has(o.bar.id);
    const distTxt = fmtMi(o.dist) + (refPoint().mine ? "" : ` from ${city.center.label}`);
    return `<article class="card ${o.live ? "is-live" : ""}" data-bar="${esc(o.bar.id)}" tabindex="0">
      <div class="card-top">
        <div class="emoji" aria-hidden="true">${emojiFor(o.deal)}</div>
        <div class="meta">
          <p class="bar-name">${esc(o.bar.name)}</p>
          <p class="deal">${esc(o.deal.title)}</p>
        </div>
        <button class="heart ${saved ? "on" : ""}" data-save="${esc(o.bar.id)}" aria-label="${saved ? "Unsave" : "Save"} ${esc(o.bar.name)}">${saved ? "♥" : "♡"}</button>
      </div>
      <div class="card-bottom">
        ${o.live ? '<span class="pill live">LIVE NOW</span>' : ""}
        <span>${esc(windowLabel(o, now))}</span><span class="sep">•</span>
        <span>${distTxt}</span>
        <span class="pill age">${ageShort(o.bar.age)}</span>
        ${o.others > 0 ? `<span class="extra">+${o.others} more</span>` : ""}
        <button class="more-btn" data-more="${esc(o.bar.id)}" data-kind="${esc(o.deal.kind)}" aria-label="Not interested options">⋯</button>
      </div>
    </article>`;
  }

  function render() {
    renderChips();
    $("cityName").textContent = city.name;
    document.querySelectorAll("#daySeg button").forEach((b) => b.classList.toggle("on", b.dataset.view === state.view));
    const { live, groups, now } = buildFeed();
    let html = "";
    if (!state.locStatus && navigator.geolocation) {
      html += `<div class="banner" id="locBanner">
        <p>📍 <b>Want the closest spots first?</b><br>Share your location and we'll sort bars by distance. It stays on your phone.</p>
        <div class="row"><button class="btn primary" id="locYes">Use my location</button><button class="btn ghost" id="locNo">Not now</button></div>
      </div>`;
    }
    if (live.length) html += `<div class="section-label"><span class="pill live">LIVE</span> Happening now</div>` + live.map((o) => card(o, now)).join("");
    const base = S.nightBase(now);
    for (const g of groups) {
      const diff = Math.round((g.date - base) / 864e5);
      const lbl = diff === 0 ? (live.length ? "Later tonight" : "Coming up tonight") : diff === 1 ? "Tomorrow" : g.date.toLocaleDateString(undefined, { weekday: "long" });
      html += `<div class="section-label">${lbl}</div>` + g.items.map((o) => card(o, now)).join("");
    }
    if (!live.length && !groups.length) {
      html += `<div class="empty"><div class="big">🌙</div><p>${state.filter === "saved" ? "No saved bars with deals here yet. Tap ♡ on a card to save a bar." : "Nothing matches right now."}</p>
        ${state.filter ? '<button class="btn" id="clearFilter">Clear filter</button>' : '<button class="btn" data-view-jump="week">See this week</button>'}</div>`;
    }
    const sortNote = state.loc && refPoint().mine ? "Sorted by distance from you" : state.loc ? `You're outside ${esc(city.name)} — distances are from ${esc(city.center.label)}` : "Sorted by popularity";
    html += `<p class="notice">${sortNote}</p>`;
    if (city.placeholder) html += `<p class="notice"><b>Sample data:</b> these bars and deals are fictional placeholders. Always check with the bar.</p>`;
    $("feed").innerHTML = html;
  }

  /* ---------- sheets ---------- */
  let openSheetId = null;
  function openSheet(id, html) {
    const wasOpen = !!openSheetId;
    closeSheets(false);
    $(id).innerHTML = html; $(id).hidden = false; $("scrim").hidden = false; openSheetId = id;
    document.body.style.overflow = "hidden";
    if (!wasOpen) history.pushState({ sheet: id }, ""); // phone back button closes the sheet
  }
  function closeSheets(pop = true) {
    if (!openSheetId) return;
    ["detail", "actions", "menu"].forEach((s) => ($(s).hidden = true));
    $("scrim").hidden = true; document.body.style.overflow = "";
    openSheetId = null;
    if (pop && history.state && history.state.sheet) history.back();
  }
  window.addEventListener("popstate", () => { if (openSheetId) closeSheets(false); });

  function openDetail(barId) {
    const bar = city.bars.find((b) => b.id === barId); if (!bar) return;
    const now = new Date();
    const deals = S.mergedDeals(bar).filter((d) => !state.hiddenKinds.has(d.kind));
    const todayOccs = S.occurrences(bar, [S.nightBase(now)]);
    const liveKeys = new Set(todayOccs.filter((o) => o.start <= now && now < o.end).map((o) => o.deal.key));
    const saved = state.saved.has(bar.id);
    const mapUrl = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(`${bar.name} ${bar.address}`);
    const dist = distanceOf(bar);
    openSheet("detail", `
      <div class="sheet-head">
        <div>
          ${bar.sample ? '<span class="pill sample">SAMPLE · FICTIONAL BAR</span>' : ""}
          <h2>${esc(bar.name)}</h2>
          <div class="fine">${fmtMi(dist)}${refPoint().mine ? " away" : " from " + esc(city.center.label)}</div>
        </div>
        <button class="close" data-close aria-label="Close">✕</button>
      </div>
      <h3>Deals</h3>
      ${deals.map((d) => `<div class="deal-row">
          <div class="t">${emojiFor(d)} ${esc(d.title)} ${liveKeys.has(d.key) ? '<span class="pill live">LIVE</span>' : ""}</div>
          <div class="w">${d.schedules.map((s) => `${S.fmtDays(s.days)} · ${S.fmtRange(s.start, s.end)}`).join("<br>")}</div>
          ${d.finePrint ? `<div class="fp">${esc(d.finePrint)}</div>` : ""}
        </div>`).join("") || '<p class="fine">No deals listed.</p>'}
      <h3>Info</h3>
      <div class="facts">
        <a class="fact" href="${mapUrl}" target="_blank" rel="noopener" style="text-decoration:none;color:inherit"><span class="ic">📍</span><div><div class="k">Address · open in Maps</div><div class="v">${esc(bar.address)}</div></div></a>
        <div class="fact"><span class="ic">🕒</span><div><div class="k">Hours</div><div class="v">${esc(bar.hours || "—")}</div></div></div>
        <div class="fact"><span class="ic">🎟️</span><div><div class="k">Cover</div><div class="v">${esc(bar.cover || "—")}</div></div></div>
        <div class="fact"><span class="ic">🪪</span><div><div class="k">Age</div><div class="v">${esc(bar.age || "21+")} · bring a valid ID</div></div></div>
      </div>
      <p class="fine">Deals can change — confirm with the bar before you go.</p>
      <div class="sheet-actions">
        <button class="btn big ${saved ? "primary" : ""}" data-save="${esc(bar.id)}">${saved ? "♥ Saved" : "♡ Save bar"}</button>
        <a class="btn big" href="${mapUrl}" target="_blank" rel="noopener" style="display:grid;place-items:center;text-decoration:none;color:inherit">Directions</a>
      </div>
      <button class="btn ghost big" style="margin-top:8px" data-hide-bar="${esc(bar.id)}">Not interested in this bar</button>
    `);
  }

  function openActions(barId, kind) {
    const bar = city.bars.find((b) => b.id === barId);
    const k = KINDS[kind] || { label: kind, emoji: "🍻" };
    openSheet("actions", `
      <h2 style="font-size:20px">Not interested?</h2>
      <p class="fine">Hidden items can be restored from the menu.</p>
      <button class="list-btn" data-hide-bar="${esc(barId)}"><span class="ic">🚫</span><span>Hide ${esc(bar.name)}<small>Never show this bar in the feed</small></span></button>
      <button class="list-btn" data-hide-kind="${esc(kind)}"><span class="ic">${k.emoji}</span><span>Hide ${esc(k.label.toLowerCase())} deals<small>From every bar</small></span></button>
      <button class="btn ghost big" data-close>Cancel</button>`);
  }

  function openMenu() {
    const hiddenCount = state.hiddenBars.size + state.hiddenKinds.size;
    const ids = S.cityIds();
    openSheet("menu", `
      <div class="sheet-head"><h2>Menu</h2><button class="close" data-close aria-label="Close">✕</button></div>
      <h3>City</h3>
      ${ids.map((id) => { const c = S.loadCity(id); return `<button class="list-btn" data-city="${id}"><span class="ic">${id === state.cityId ? "✅" : "🏙️"}</span><span>${esc(c.name)}<small>${esc(c.school || "")}</small></span></button>`; }).join("")}
      <p class="fine">More college towns coming soon.</p>
      <h3>Night out</h3>
      <button class="list-btn" id="safeBtn"><span class="ic">🏠</span><span>Get home safe<small>Rides & transit</small></span></button>
      <button class="list-btn" id="locBtn"><span class="ic">📍</span><span>${state.loc ? "Location on" : "Use my location"}<small>${state.loc ? "Sorting by distance" : "Sort bars by distance"}</small></span></button>
      <h3>Settings</h3>
      <button class="list-btn" id="themeBtn"><span class="ic">${store.get("theme", "dark") === "light" ? "🌙" : "☀️"}</span><span>${store.get("theme", "dark") === "light" ? "Dark mode" : "Light mode"}</span></button>
      <button class="list-btn" id="unhideBtn" ${hiddenCount ? "" : "disabled style='opacity:.5'"}><span class="ic">👀</span><span>Show hidden items<small>${hiddenCount} hidden</small></span></button>
      <a class="list-btn" href="admin.html"><span class="ic">🛠️</span><span>Admin: add & edit bars<small>Manage weekly specials</small></span></a>
      ${city.placeholder ? `<p class="fine">⚠️ ${esc(city.name)} currently shows <b>sample, fictional</b> bars and deals for demo purposes.</p>` : ""}
    `);
  }

  function openSafe() {
    openSheet("menu", `
      <div class="sheet-head"><h2>Get home safe 🏠</h2><button class="close" data-close aria-label="Close">✕</button></div>
      <p class="fine">Plan your ride before the night starts. Look out for your friends.</p>
      <a class="list-btn" href="https://m.uber.com/ul/" target="_blank" rel="noopener"><span class="ic">🚗</span><span>Uber<small>Open the app to request a ride</small></span></a>
      <a class="list-btn" href="https://www.lyft.com/" target="_blank" rel="noopener"><span class="ic">🚙</span><span>Lyft<small>Open the app to request a ride</small></span></a>
      <a class="list-btn" href="https://www.accgov.com/transit" target="_blank" rel="noopener"><span class="ic">🚌</span><span>Athens Transit<small>Routes & schedules (Athens-Clarke County)</small></span></a>
      <a class="list-btn" href="https://tps.uga.edu/" target="_blank" rel="noopener"><span class="ic">🎓</span><span>UGA Transportation & Parking<small>Campus buses & night service</small></span></a>
      <a class="list-btn" href="tel:911"><span class="ic">🚨</span><span>Emergency: 911</span></a>
      <p class="fine">Schedules change — check the latest hours before you head out.</p>
    `);
  }

  /* ---------- actions ---------- */
  let toastTimer;
  function toast(msg, undo) {
    const t = $("toast");
    t.innerHTML = `<span>${esc(msg)}</span>${undo ? '<button id="undoBtn">Undo</button>' : ""}`;
    t.hidden = false;
    clearTimeout(toastTimer); toastTimer = setTimeout(() => (t.hidden = true), 3500);
    if (undo) $("undoBtn").onclick = () => { undo(); t.hidden = true; };
  }
  function persist() {
    store.set("saved", [...state.saved]); store.set("hiddenBars", [...state.hiddenBars]); store.set("hiddenKinds", [...state.hiddenKinds]);
  }
  function toggleSave(id) {
    state.saved.has(id) ? state.saved.delete(id) : state.saved.add(id);
    persist(); render();
    if (openSheetId === "detail") openDetail(id);
  }
  function hideBar(id) {
    state.hiddenBars.add(id); persist(); closeSheets(); render();
    const name = (city.bars.find((b) => b.id === id) || {}).name;
    toast(`Hid ${name}`, () => { state.hiddenBars.delete(id); persist(); render(); });
  }
  function hideKind(kind) {
    state.hiddenKinds.add(kind); persist(); closeSheets(); render();
    toast(`Hiding ${(KINDS[kind] || { label: kind }).label.toLowerCase()} deals`, () => { state.hiddenKinds.delete(kind); persist(); render(); });
  }

  function requestLocation(silent) {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (p) => {
        state.loc = { lat: p.coords.latitude, lng: p.coords.longitude };
        state.locStatus = "granted"; store.set("locStatus", "granted"); render();
        if (!silent) toast(refPoint().mine ? "Sorted by distance 📍" : `You're not in ${city.name} — showing distance from ${city.center.label}`);
      },
      () => {
        state.locStatus = "denied"; store.set("locStatus", "denied"); render();
        if (!silent) toast("No problem — sorting by popularity");
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  }

  document.addEventListener("click", (e) => {
    const t = e.target.closest("button, a, article, .scrim");
    if (!t) return;
    const d = t.dataset;
    if (t.id === "scrim" || d.close !== undefined) return closeSheets();
    if (d.save) { e.stopPropagation(); return toggleSave(d.save); }
    if (d.more) { e.stopPropagation(); return openActions(d.more, d.kind); }
    if (d.hideBar) return hideBar(d.hideBar);
    if (d.hideKind) return hideKind(d.hideKind);
    if (d.filter) { state.filter = state.filter === d.filter ? null : d.filter; return render(); }
    if (d.view || d.viewJump) { state.view = d.view || d.viewJump; window.scrollTo(0, 0); return render(); }
    if (d.city) { state.cityId = d.city; store.set("city", d.city); city = S.loadCity(d.city); closeSheets(); return render(); }
    if (d.bar && t.tagName === "ARTICLE") return openDetail(d.bar);
    switch (t.id) {
      case "menuBtn": case "cityBtn": return openMenu();
      case "locYes": return requestLocation(false);
      case "locNo": state.locStatus = "dismissed"; store.set("locStatus", "dismissed"); return render();
      case "locBtn": closeSheets(); return requestLocation(false);
      case "clearFilter": state.filter = null; return render();
      case "safeBtn": return openSafe();
      case "themeBtn": store.set("theme", store.get("theme", "dark") === "light" ? "dark" : "light"); applyTheme(); return openMenu();
      case "unhideBtn": state.hiddenBars.clear(); state.hiddenKinds.clear(); persist(); render(); return openMenu();
    }
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeSheets();
    if (e.key === "Enter" && e.target.matches("article.card")) openDetail(e.target.dataset.bar);
  });

  /* ---------- age gate ---------- */
  if (!store.get("age21", false)) {
    $("ageGate").hidden = false;
    $("ageYes").onclick = () => { store.set("age21", true); $("ageGate").hidden = true; };
    $("ageNo").onclick = () => { $("ageNoMsg").hidden = false; };
  }

  /* ---------- boot ---------- */
  render();
  if (state.locStatus === "granted") requestLocation(true);
  setInterval(render, 60 * 1000); // keep "Live now" and expiry fresh
})();
