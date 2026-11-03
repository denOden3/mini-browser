// ==UserScript==
// @name         Mini Browser — Universal Roleplay HUD
// @namespace    mini-browser.chat-rpg
// @version      0.2.1
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
  // v0.2: the game browser participates in the existing top HUD switchers.
  // The original Paths/Mizuhana scripts remain unchanged.
  state.miniSelected = state.miniSelected === true;
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
    #mini-browser-root { position:fixed; bottom:16px; left:12px; right:auto; z-index:2147483000;
      width:min(328px,calc(100vw - 24px)); height:490px; min-width:260px; max-height:75dvh;
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
    @media(max-width:600px) {#mini-browser-root {left:8px;right:auto;bottom:8px;
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
    syncMiniIntegration();
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

  // Shared launcher integration: contribute a Mini option to Paths and Mizuhana
  // without editing either userscript. No separate bottom-right launcher.
  const integrationCSS = String.raw`
    html:not(.mb-mini-selected) #mini-browser-root,
    html.mb-mini-selected #mini-browser-root.mb-bar { display:none !important; }
    html.mb-mini-selected #paths-monkey-root,
    html.mb-mini-selected #mizuhana-hud,
    html.mb-mini-selected #mizu-hud-switcher,
    html.mb-mini-selected #mizuhana-launcher { display:none !important; }

    #mb-shared-launcher {
      position:fixed;top:max(8px,env(safe-area-inset-top,0px));left:50%;
      transform:translateX(-50%);z-index:2147483500;
      display:none;align-items:center;justify-content:center;
      max-width:calc(100vw - 24px);font:14px/1.35 system-ui,sans-serif;
    }
    #mb-shared-launcher .mb-shared-pill {
      cursor:pointer;appearance:none;border:1px solid #b2787d;
      background:#281d27;color:#fff3e6;border-radius:999px;
      padding:10px 17px;min-height:43px;font:800 14px/1.35 system-ui,sans-serif;
      box-shadow:0 7px 22px #0008;max-width:calc(100vw - 24px);
      overflow:hidden;text-overflow:ellipsis;white-space:nowrap;touch-action:pan-y;
    }
    #mb-shared-launcher .mb-shared-menu {
      position:absolute;top:calc(100% + 7px);left:50%;transform:translateX(-50%);
      min-width:min(285px,calc(100vw - 24px));padding:7px;
      border:1px solid #ad8085;border-radius:13px;
      background:#302431;box-shadow:0 8px 25px #000b;
      display:grid;gap:5px;
    }
    #mb-shared-launcher .mb-shared-menu[hidden] {display:none!important;}
    #mb-shared-launcher .mb-shared-menu button {
      display:block;width:100%;padding:11px 12px;
      border:1px solid #81616c;border-radius:9px;
      background:#40313e;color:#fff3e6;text-align:left;
      font:700 16px/1.35 system-ui,sans-serif;cursor:pointer;
    }
    #mb-shared-launcher .mb-shared-menu button:disabled {opacity:.5;cursor:not-allowed;}
    html.mb-mini-selected #mini-browser-root {z-index:2147483400;}
  `;
  document.head.append(Object.assign(make("style"), {textContent:integrationCSS}));

  const sharedLauncher=make("div");
  sharedLauncher.id="mb-shared-launcher";
  const sharedPill=make("button","mb-shared-pill","◈ Mini Browser");
  sharedPill.type="button";
  sharedPill.title="Click to open Mini; long-press or right-click to switch HUDs";
  sharedPill.setAttribute("aria-haspopup","menu");
  sharedPill.setAttribute("aria-expanded","false");
  const sharedMenu=make("div","mb-shared-menu");
  sharedMenu.hidden=true;
  sharedMenu.setAttribute("role","menu");
  const menuActions=[
    ["◈ Mini Browser",()=>activateMini(),()=>true],
    ["☯ Paths of Immortality",()=>switchExisting("paths"),()=>!!document.getElementById("pm-select-paths")],
    ["🌺 Mizuhana",()=>switchExisting("mizuhana"),()=>!!document.querySelector("#mizuhana-hud, #mizuhana-launcher, #mizu-hud-switcher")]
  ];
  function hideSharedMenu(){
    sharedMenu.hidden=true;
    sharedPill.setAttribute("aria-expanded","false");
  }
  function showSharedMenu(){
    sharedMenu.replaceChildren();
    for (const [label,action,available] of menuActions) {
      const b=make("button","",label);
      b.type="button";b.setAttribute("role","menuitem");
      b.disabled=!available();
      b.onclick=()=>{hideSharedMenu();action();};
      sharedMenu.append(b);
    }
    sharedMenu.hidden=false;
    sharedPill.setAttribute("aria-expanded","true");
  }
  sharedLauncher.append(sharedPill,sharedMenu);
  document.body.append(sharedLauncher);
  let holdTimer=null, suppressNextClick=false;
  sharedPill.addEventListener("pointerdown",event=>{
    if(event.button!==0)return;
    suppressNextClick=false;
    clearTimeout(holdTimer);
    holdTimer=setTimeout(()=>{
      holdTimer=null;suppressNextClick=true;showSharedMenu();
    },480);
  });
  for(const event of ["pointerup","pointercancel","pointerleave"]){
    sharedPill.addEventListener(event,()=>{clearTimeout(holdTimer);holdTimer=null;});
  }
  sharedPill.onclick=event=>{
    if(suppressNextClick){suppressNextClick=false;event.preventDefault();return;}
    if(!sharedMenu.hidden){hideSharedMenu();return;}
    activateMini();
  };
  sharedPill.oncontextmenu=event=>{event.preventDefault();showSharedMenu();};
  sharedPill.onkeydown=event=>{
    if(event.key==="ArrowDown"){event.preventDefault();showSharedMenu();sharedMenu.querySelector("button")?.focus();}
    if(event.key==="Escape")hideSharedMenu();
  };
  document.addEventListener("pointerdown",event=>{
    if(!sharedLauncher.contains(event.target))hideSharedMenu();
  });
  document.addEventListener("keydown",event=>{
    if(event.key==="Escape"&&!sharedMenu.hidden)hideSharedMenu();
  });

  function activateMini(){
    // Ask the existing HUDs to collapse using their public UI controls.
    const pathsCollapse=document.getElementById("pm-collapse-title");
    if(document.getElementById("paths-monkey-root")?.classList.contains("pm-expanded")) {
      pathsCollapse?.click();
    }
    document.getElementById("mizu-brand-collapse")?.click();
    state.miniSelected=true;
    state.mode="open";
    hideSharedMenu();
    save();
    render();
  }
  function switchExisting(id){
    hideSharedMenu();
    state.miniSelected=false;
    state.mode="bar";
    save();
    syncMiniIntegration();
    if(id==="paths"){
      const button=document.getElementById("pm-select-paths");
      button?.click(); // Native Paths picker owns its own state.
    }else if(id==="mizuhana"){
      // Prefer Paths' switcher; it also handles visibility and activation.
      const button=document.getElementById("pm-select-mizuhana");
      if(button && document.querySelector("#mizuhana-hud, #mizuhana-launcher, #mizu-hud-switcher")) {
        button.click();
      }else{
        document.querySelector("#mizuhana-launcher, #mizu-hud-pill")?.click();
      }
    }
    syncMiniIntegration();
  }
  function injectMiniOption(menuId,marker,styleClass){
    const menu=document.getElementById(menuId);
    if(!menu||menu.querySelector("["+marker+"]"))return;
    const option=make("button",styleClass,"◈ Mini Browser");
    option.type="button";
    option.setAttribute("role","menuitem");
    option.setAttribute(marker,"true");
    option.addEventListener("click",event=>{
      event.preventDefault();event.stopPropagation();activateMini();
    });
    menu.append(option);
  }
  function syncMenus(){
    injectMiniOption("pm-picker-menu","data-mini-browser-option","pm-picker-option");
    injectMiniOption("mizu-hud-menu","data-mini-browser-option","");
  }
  function externalHudPresent(){
    // A Paths/Mizuhana launcher or expanded HUD means their shared button
    // is already in charge; do not add another visible capsule.
    return !!document.querySelector(
      "#pm-picker:not(.pm-hide), #paths-monkey-root.pm-expanded, " +
      "#mizu-hud-switcher, #mizuhana-hud, #mizuhana-launcher"
    );
  }
  function syncMiniIntegration(){
    document.documentElement.classList.toggle("mb-mini-selected",state.miniSelected);
    const visible=state.miniSelected ? state.mode==="bar" : !externalHudPresent();
    sharedLauncher.style.display=visible?"flex":"none";
    if(!visible)hideSharedMenu();
  }
  syncMenus();
  const integrationObserver=new MutationObserver(()=>{
    syncMenus();
    syncMiniIntegration();
  });
  integrationObserver.observe(document.body,{childList:true,subtree:true});
  window.addEventListener("pagehide",()=>integrationObserver.disconnect(),{once:true});

  render();
  syncMiniIntegration();
})();
