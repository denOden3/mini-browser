// ==UserScript==
// @name         Mini Browser — Universal Roleplay HUD
// @namespace    mini-browser.chat-rpg
// @version      0.1.1
// @description  A reusable mini browser for chat-first RPG tracker websites.
// @updateURL    https://github.com/denOden3/mini-browser/raw/main/mini-browser.user.js
// @downloadURL  https://github.com/denOden3/mini-browser/raw/main/mini-browser.user.js
// @match        https://chatgpt.com/*
// @match        https://chat.openai.com/*
// @grant        GM_getValue
// @grant        GM_setValue
// @run-at       document-idle
// ==/UserScript==

(() => {
  "use strict";
  if (document.getElementById("mini-browser-root")) return;

  const STORAGE_KEY = "mini-browser-state-v1";
  const defaults = {
    mode: "open",
    selected: "hearth",
    sites: [{ id: "hearth", name: "The Last Hearth", url: "" }]
  };
  function load() {
    try {
      const raw = GM_getValue(STORAGE_KEY, "");
      const parsed = raw ? JSON.parse(raw) : null;
      if (parsed && Array.isArray(parsed.sites)) return parsed;
    } catch (_) {}
    return structuredClone(defaults);
  }
  let state = load();
  const save = () => GM_setValue(STORAGE_KEY, JSON.stringify(state));
  const make = (tag, cls, text) => {
    const el = document.createElement(tag);
    if (cls) el.className = cls;
    if (text !== undefined) el.textContent = text;
    return el;
  };
  function validUrl(input) {
    try {
      const url = new URL(input);
      return url.protocol === "https:" ||
        (url.protocol === "http:" && ["localhost", "127.0.0.1"].includes(url.hostname));
    } catch (_) { return false; }
  }
  const currentSite = () => state.sites.find(s => s.id === state.selected);
  const css = String.raw`
    #mini-browser-root, #mini-browser-root * { box-sizing:border-box; }
    #mini-browser-root { position:fixed; bottom:16px; right:16px; z-index:2147483000;
      width:min(380px,calc(100vw - 24px)); height:490px; min-width:260px; max-height:75dvh;
      font:13px/1.4 system-ui,sans-serif; color:#2e2924; background:#faf7f0;
      border:1px solid #a69a87; border-radius:12px; overflow:hidden; display:flex;
      flex-direction:column; box-shadow:0 10px 28px #14100a44; resize:both; }
    #mini-browser-root.mb-compact {height:185px!important;resize:none;}
    #mini-browser-root.mb-bar {height:44px!important;resize:none;}
    #mini-browser-root button, #mini-browser-root input, #mini-browser-root select {font:inherit;}
    #mini-browser-root button {cursor:pointer;}
    #mini-browser-root .mb-head {display:flex;align-items:center;gap:5px;background:#e9dfcf;
      height:43px;min-height:43px;padding:5px;border-bottom:1px solid #c7b8a4;}
    #mini-browser-root .mb-title {border:0;background:transparent;color:inherit;font-weight:750;
      flex:0 0 auto;padding:6px;white-space:nowrap;}
    #mini-browser-root select {background:#fff;color:inherit;min-width:60px;max-width:125px;
      flex:1;padding:5px;border:1px solid #baac99;border-radius:5px;}
    #mini-browser-root .mb-icon {border:0;background:transparent;color:inherit;padding:5px;
      border-radius:5px;min-width:27px;}
    #mini-browser-root .mb-icon:hover {background:#d7cbb8;}
    #mini-browser-root .mb-content {flex:1;min-height:0;background:white;}
    #mini-browser-root iframe {display:block;width:100%;height:100%;border:0;}
    #mini-browser-root .mb-empty {height:100%;padding:18px;display:flex;flex-direction:column;
      justify-content:center;align-items:center;gap:10px;text-align:center;color:#625648;}
    #mini-browser-root .mb-empty button, #mini-browser-root .mb-settings button {border:0;
      border-radius:6px;background:#594a39;color:white;padding:8px 12px;}
    #mini-browser-root .mb-settings {display:none;flex:1;overflow:auto;padding:12px;
      background:#faf7f0;flex-direction:column;gap:9px;}
    #mini-browser-root .mb-settings label {display:flex;flex-direction:column;gap:4px;font-weight:650;}
    #mini-browser-root .mb-settings input {min-width:0;padding:8px;border:1px solid #b7a994;
      border-radius:6px;background:white;color:inherit;}
    #mini-browser-root .mb-settings .mb-actions {display:flex;flex-wrap:wrap;gap:7px;}
    #mini-browser-root .mb-note {font-size:11px;color:#776b5d;}
    #mini-browser-root.mb-bar .mb-content, #mini-browser-root.mb-bar .mb-settings,
    #mini-browser-root.mb-bar select, #mini-browser-root.mb-bar .mb-open,
    #mini-browser-root.mb-bar .mb-settings-button {display:none!important;}
    #mini-browser-root.mb-bar .mb-title {flex:1;text-align:left;}
    @media(max-width:600px) {#mini-browser-root {right:8px;bottom:8px;
      width:calc(100vw - 16px);height:min(460px,70dvh);min-width:240px;}
      #mini-browser-root select {max-width:90px;}}
  `;
  document.head.append(Object.assign(make("style"), { textContent: css }));

  const root = make("section");
  root.id = "mini-browser-root";
  root.setAttribute("aria-label", "Mini Browser HUD");
  const header = make("div", "mb-head");
  const title = make("button", "mb-title", "▾ MINI BROWSER");
  title.type = "button";
  title.title = "Cycle full, compact, and title-only modes";
  const selector = make("select");
  selector.title = "Choose a game website";
  const compact = make("button", "mb-icon", "▤");
  compact.title = "Toggle compact tracker";
  const open = make("button", "mb-icon mb-open", "↗");
  open.title = "Open game website in a new tab";
  const settingsBtn = make("button", "mb-icon mb-settings-button", "⚙");
  settingsBtn.title = "Manage game websites";
  header.append(title, selector, compact, open, settingsBtn);

  const content = make("div", "mb-content");
  const settings = make("div", "mb-settings");
  const nameLabel = make("label", "", "Game name");
  const nameField = make("input");
  nameField.placeholder = "The Last Hearth";
  nameLabel.append(nameField);
  const urlLabel = make("label", "", "Tracker webpage URL");
  const urlField = make("input");
  urlField.type = "url";
  urlField.placeholder = "https://example.com/my-game";
  urlLabel.append(urlField);
  const actions = make("div", "mb-actions");
  const add = make("button", "", "New shortcut");
  const store = make("button", "", "Save");
  const remove = make("button", "", "Remove");
  actions.append(add, store, remove);
  settings.append(nameLabel, urlLabel, actions,
    make("p", "mb-note", "Choose an HTTPS website you trust. Some websites block embedding; ↗ opens them directly. Shortcuts are stored locally in Tampermonkey. No narration or game-state data is collected by Mini."));
  root.append(header, content, settings);
  document.body.append(root);

  let editing = null;
  let settingsVisible = false;
  function renderSite() {
    const site = currentSite();
    const url = site && validUrl(site.url) ? site.url : "";
    if (url) {
      const existing = content.querySelector("iframe");
      if (existing && existing.getAttribute("src") === url) return;
      const frame = make("iframe");
      frame.title = (site.name || "Game") + " website";
      frame.src = url;
      frame.loading = "lazy";
      frame.referrerPolicy = "strict-origin-when-cross-origin";
      content.replaceChildren(frame);
    } else {
      const empty = make("div", "mb-empty");
      empty.append(make("strong", "", site?.name || "Mini Browser"),
        make("div", "", "Add this game's website to display its tracker here."));
      const button = make("button", "", "Set website URL");
      button.onclick = () => showSettings(true);
      empty.append(button);
      content.replaceChildren(empty);
    }
  }
  function render() {
    state.mode = ["open", "compact", "bar"].includes(state.mode) ? state.mode : "open";
    root.className = state.mode === "open" ? "" : "mb-" + state.mode;
    title.textContent = (state.mode === "open" ? "▾" : "▸") + " MINI BROWSER";
    compact.textContent = state.mode === "compact" ? "□" : "▤";
    selector.replaceChildren();
    for (const site of state.sites) {
      const option = make("option", "", site.name);
      option.value = site.id;
      selector.append(option);
    }
    if (!currentSite()) state.selected = state.sites[0]?.id || null;
    selector.value = state.selected || "";
    open.disabled = !validUrl(currentSite()?.url);
    open.style.opacity = open.disabled ? ".4" : "1";
    if (!settingsVisible) renderSite();
  }
  function showSettings(visible) {
    settingsVisible = visible;
    settings.style.display = visible ? "flex" : "none";
    content.style.display = visible ? "none" : "block";
    if (visible) {
      editing = state.selected;
      nameField.value = currentSite()?.name || "";
      urlField.value = currentSite()?.url || "";
      if (state.mode === "bar") state.mode = "open";
    }
    render();
  }
  title.onclick = () => {
    state.mode = state.mode === "open" ? "compact" : state.mode === "compact" ? "bar" : "open";
    save(); render();
  };
  compact.onclick = () => {
    state.mode = state.mode === "compact" ? "open" : "compact";
    save(); render();
  };
  selector.onchange = () => {
    state.selected = selector.value; save(); showSettings(false);
  };
  open.onclick = () => {
    const url = currentSite()?.url;
    if (validUrl(url)) window.open(url, "_blank", "noopener,noreferrer");
  };
  settingsBtn.onclick = () => showSettings(!settingsVisible);
  add.onclick = () => { editing = null; nameField.value = ""; urlField.value = ""; nameField.focus(); };
  store.onclick = () => {
    const name = nameField.value.trim();
    const url = urlField.value.trim();
    if (!name || (url && !validUrl(url))) {
      alert("Enter a game name and a valid HTTPS URL (or localhost)."); return;
    }
    if (editing && state.sites.some(s => s.id === editing)) {
      state.sites = state.sites.map(s => s.id === editing ? {...s, name, url} : s);
      state.selected = editing;
    } else {
      const id = "site-" + Date.now();
      state.sites.push({id, name, url});
      state.selected = id;
    }
    save(); showSettings(false);
  };
  remove.onclick = () => {
    if (!editing || !confirm("Remove this game shortcut?")) return;
    state.sites = state.sites.filter(s => s.id !== editing);
    state.selected = state.sites[0]?.id || null;
    save(); showSettings(false);
  };
  render();
})();
