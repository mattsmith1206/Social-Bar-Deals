/* Social — admin: add/edit bars and their weekly specials */
(function () {
  const S = window.Social, { TYPES, KINDS, store, esc } = S;
  const $ = (id) => document.getElementById(id);
  if (store.get("theme", "dark") === "light") document.documentElement.classList.add("light");

  let cityId = store.get("city", "athens");
  if (!S.cityIds().includes(cityId)) cityId = S.cityIds()[0];
  let city = JSON.parse(JSON.stringify(S.loadCity(cityId)));

  function save() { store.set("data." + cityId, city); }
  function toast(m) { const t = $("toast"); t.textContent = m; t.hidden = false; setTimeout(() => (t.hidden = true), 2500); }

  function renderCities() {
    $("citySel").innerHTML = S.cityIds().map((id) => `<option value="${id}" ${id === cityId ? "selected" : ""}>${esc(S.loadCity(id).name)}</option>`).join("");
  }

  function renderList() {
    const bars = city.bars.slice().sort((a, b) => a.name.localeCompare(b.name));
    $("list").innerHTML = `<h3 style="color:var(--muted);font-size:13px;text-transform:uppercase;letter-spacing:.08em">${bars.length} bars in ${esc(city.name)}</h3>` +
      bars.map((b) => `<div class="bar-item"><div class="n">${esc(b.name)} ${b.sample ? '<span class="pill sample">SAMPLE</span>' : ""}<small>${(b.deals || []).length} deals · ${esc(b.address)}</small></div>
        <button class="btn" data-edit="${esc(b.id)}">Edit</button></div>`).join("");
  }

  const opt = (obj, sel) => Object.entries(obj).map(([k, v]) => `<option value="${k}" ${k === sel ? "selected" : ""}>${v.emoji} ${v.label}</option>`).join("");

  function dealEditor(d, i) {
    return `<div class="deal-ed" data-i="${i}">
      <label>Deal (short, one line)</label><input name="title" value="${esc(d.title)}" placeholder="$3 wells until 11" required maxlength="60">
      <div class="grid2">
        <div><label>Type (filter chip)</label><select name="type">${opt(TYPES, d.type)}</select></div>
        <div><label>Kind</label><select name="kind">${opt(KINDS, d.kind)}</select></div>
      </div>
      <label>Days</label>
      <div class="days">${[1, 2, 3, 4, 5, 6, 0].map((n) => `<label><input type="checkbox" name="day" value="${n}" ${(d.days || []).includes(n) ? "checked" : ""}>${S.DAY_SHORT[n]}</label>`).join("")}</div>
      <div class="grid3">
        <div><label>Starts</label><input type="time" name="start" value="${esc(d.start || "21:00")}" required></div>
        <div><label>Ends</label><input type="time" name="end" value="${esc(d.end || "23:00")}" required></div>
        <div><label>Score 1–5</label><input type="number" name="score" min="1" max="5" value="${d.score || 3}"></div>
      </div>
      <div class="hint">If it ends after midnight, just pick the end time (e.g. 9:00 PM → 2:00 AM).</div>
      <label>Fine print</label><input name="finePrint" value="${esc(d.finePrint || "")}" placeholder="Optional">
      <div class="row-end"><span></span><button type="button" class="btn danger" data-rm-deal="${i}">Remove deal</button></div>
    </div>`;
  }

  let editing = null; // working copy of a bar
  function openEditor(bar) {
    editing = JSON.parse(JSON.stringify(bar));
    const b = editing;
    $("editor").innerHTML = `<form id="barForm">
      <h2 style="margin:0">${b._new ? "New bar" : "Edit " + esc(b.name)}</h2>
      <label>Bar name</label><input name="name" value="${esc(b.name)}" required>
      <label>Address</label><input name="address" value="${esc(b.address)}" required>
      <div class="grid2">
        <div><label>Latitude</label><input name="lat" type="number" step="any" value="${b.lat ?? ""}" required></div>
        <div><label>Longitude</label><input name="lng" type="number" step="any" value="${b.lng ?? ""}" required></div>
      </div>
      <div class="hint">In Google Maps, right-click (or long-press) the bar's pin to copy its coordinates. <button type="button" class="btn" id="hereBtn" style="min-height:32px;padding:0 10px;margin-top:4px">Use my current location</button></div>
      <div class="grid2">
        <div><label>Age rule</label><select name="age">${["21+", "18+ to enter · 21+ to drink", "All ages before 9pm · 21+ after"].concat(b.age && !["21+", "18+ to enter · 21+ to drink", "All ages before 9pm · 21+ after"].includes(b.age) ? [b.age] : []).map((a) => `<option ${a === b.age ? "selected" : ""}>${esc(a)}</option>`).join("")}</select></div>
        <div><label>Popularity 1–100</label><input name="popularity" type="number" min="1" max="100" value="${b.popularity || 50}"></div>
      </div>
      <label>Cover charge</label><input name="cover" value="${esc(b.cover || "No cover")}">
      <label>Hours</label><input name="hours" value="${esc(b.hours || "")}" placeholder="Mon–Sat 4pm–2am · Sun 4pm–12am">
      <label style="margin-top:20px">Weekly deals</label>
      <div id="deals">${(b.deals || []).map(dealEditor).join("")}</div>
      <button type="button" class="btn" id="addDeal" style="margin-top:12px">+ Add deal</button>
      <div class="row-end">
        <div style="display:flex;gap:8px"><button class="btn primary" type="submit">Save bar</button><button type="button" class="btn" id="cancelEd">Cancel</button></div>
        ${b._new ? "" : '<button type="button" class="btn danger" id="delBar">Delete bar</button>'}
      </div>
    </form>`;
    $("editor").scrollIntoView({ behavior: "smooth" });
  }

  function readForm() {
    const f = $("barForm");
    const v = (n) => f.elements[n].value.trim();
    Object.assign(editing, { name: v("name"), address: v("address"), lat: parseFloat(v("lat")), lng: parseFloat(v("lng")), age: v("age"), popularity: parseInt(v("popularity"), 10) || 50, cover: v("cover"), hours: v("hours") });
    editing.deals = [...f.querySelectorAll(".deal-ed")].map((el, i) => {
      const q = (n) => el.querySelector(`[name="${n}"]`).value.trim();
      const prev = editing.deals[+el.dataset.i] || {};
      return { id: prev.id || S.slug(editing.name).slice(0, 12) + "-" + Date.now().toString(36) + i, title: q("title"), type: q("type"), kind: q("kind"),
        days: [...el.querySelectorAll('[name="day"]:checked')].map((c) => +c.value), start: q("start"), end: q("end"),
        score: Math.min(5, Math.max(1, parseInt(q("score"), 10) || 3)), finePrint: q("finePrint") };
    });
  }

  document.addEventListener("click", (e) => {
    const t = e.target.closest("button"); if (!t) return;
    if (t.dataset.edit) return openEditor(city.bars.find((b) => b.id === t.dataset.edit));
    if (t.dataset.rmDeal !== undefined) { readForm(); editing.deals.splice(+t.dataset.rmDeal, 1); return openEditor(editing); }
    switch (t.id) {
      case "addBar": return openEditor({ _new: true, name: "", address: "", lat: city.center.lat, lng: city.center.lng, age: "21+", cover: "No cover", hours: "", popularity: 50, deals: [] });
      case "addDeal": readForm(); editing.deals.push({ title: "", type: "drinks", kind: "beer", days: [], start: "21:00", end: "23:00", score: 3 }); openEditor(editing);
        return $("deals").lastElementChild.querySelector("input").focus();
      case "cancelEd": editing = null; $("editor").innerHTML = ""; return;
      case "delBar": if (!confirm(`Delete ${editing.name}?`)) return;
        city.bars = city.bars.filter((b) => b.id !== editing.id); save(); $("editor").innerHTML = ""; renderList(); return toast("Bar deleted");
      case "hereBtn": navigator.geolocation && navigator.geolocation.getCurrentPosition((p) => {
          $("barForm").elements.lat.value = p.coords.latitude.toFixed(5); $("barForm").elements.lng.value = p.coords.longitude.toFixed(5);
        }, () => toast("Couldn't get location")); return;
      case "dlJs": return download(`${cityId}.js`, "/* Social city data — generated by admin.html. See data shape notes in README.md */\nwindow.SOCIAL_CITIES = window.SOCIAL_CITIES || {};\nwindow.SOCIAL_CITIES." + cityId + " = " + JSON.stringify(city, null, 2) + ";\n", "text/javascript");
      case "dlJson": return download(`${cityId}.json`, JSON.stringify(city, null, 2), "application/json");
      case "reset": if (!confirm("Discard all edits on this device and go back to the bundled data file?")) return;
        store.del("data." + cityId); city = JSON.parse(JSON.stringify(S.loadCity(cityId))); $("editor").innerHTML = ""; renderList(); return toast("Reset");
    }
  });

  document.addEventListener("submit", (e) => {
    e.preventDefault(); readForm();
    const bad = editing.deals.find((d) => !d.title || !d.days.length);
    if (bad) return toast("Each deal needs a title and at least one day");
    if (isNaN(editing.lat) || isNaN(editing.lng)) return toast("Add latitude and longitude");
    const isNew = editing._new; delete editing._new;
    if (isNew) {
      let id = S.slug(editing.name); while (city.bars.some((b) => b.id === id)) id += "-2";
      editing.id = id; editing.sample = false; city.bars.push(editing);
    } else {
      editing.sample = false; // edited by a human → no longer placeholder
      city.bars = city.bars.map((b) => (b.id === editing.id ? editing : b));
    }
    if (!city.bars.some((b) => b.sample)) city.placeholder = false;
    save(); toast("Saved ✓"); editing = null; $("editor").innerHTML = ""; renderList();
  });

  $("citySel").onchange = (e) => { cityId = e.target.value; city = JSON.parse(JSON.stringify(S.loadCity(cityId))); $("editor").innerHTML = ""; renderList(); };
  $("importFile").onchange = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      if (!Array.isArray(data.bars)) throw new Error("missing bars");
      city = Object.assign({ id: cityId, name: city.name, center: city.center }, data); save(); renderList(); toast("Imported ✓");
    } catch (err) { toast("That file doesn't look like Social data"); }
    e.target.value = "";
  };

  function download(name, text, type) {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([text], { type })); a.download = name; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  renderCities(); renderList();
})();
