// ==UserScript==
// @name         Mini Browser — Universal Roleplay HUD
// @namespace    mini-browser.chat-rpg
// @version      0.5.0
// @description  Mini Library: game shelves, customized trackers and personal themes.
// @updateURL    https://github.com/denOden3/mini-browser/raw/main/mini-browser.user.js
// @downloadURL  https://github.com/denOden3/mini-browser/raw/main/mini-browser.user.js
// @match        https://chatgpt.com/*
// @match        https://chat.openai.com/*
// @match        https://denoden3.github.io/mini-browser/*
// @grant        GM_addValueChangeListener
// @grant        GM_getValue
// @grant        GM_setValue
// @run-at       document-idle
// ==/UserScript==

(() => {
  "use strict";
  if (document.getElementById("mini-browser-root")) return;
  const KEY = "mini-browser-state-v1";
  const BRIDGE_KEY = "mini-library-bridge-v1";
  const LIBRARY_KEY = "mini-library-v1";
  // The companion script runs on the public Mini Library page as well.
  // It copies browser-local saves to Tampermonkey storage in this browser.
  // No story content is sent to a third-party server.
  if (location.hostname === "denoden3.github.io" &&
      location.pathname.startsWith("/mini-browser/")) {
    let lastSent = "";
    function copyLibraryToMini() {
      try {
        const raw = localStorage.getItem(LIBRARY_KEY);
        if(!raw || raw === lastSent || raw.length > 3000000) return;
        const data = JSON.parse(raw);
        if(!data || data.schema !== 1 || !Array.isArray(data.games)) return;
        GM_setValue(BRIDGE_KEY,raw);
        lastSent = raw;
      } catch(_) {}
    }
    document.addEventListener("mini-library:changed",copyLibraryToMini);
    window.addEventListener("storage",event=>{
      if(event.key===LIBRARY_KEY) copyLibraryToMini();
    });
    document.addEventListener("DOMContentLoaded",copyLibraryToMini,{once:true});
    copyLibraryToMini();
    return;
  }
  const MINI_HOME = "https://denoden3.github.io/mini-browser/";
  const HEARTH_FULL = MINI_HOME + "?game=the-last-hearth";
  const HEARTH_COMPACT = MINI_HOME + "?game=the-last-hearth&view=compact";
  const defaults = {mode:"open",miniSelected:false,view:"site",
    selected:"hearth",homeUrl:MINI_HOME,compactHeight:185,
    sites:[{id:"hearth",name:"The Last Hearth",url:HEARTH_FULL,compactUrl:HEARTH_COMPACT}],
    windowSize:{width:328,height:490}};
  function read() {
    try {
      const v=GM_getValue(KEY,"");
      const parsed=v?JSON.parse(v):{};
      const sites=Array.isArray(parsed.sites)?parsed.sites:defaults.sites;
      return {...defaults,...parsed,sites:sites.map(s=>({...s,compactUrl:s.compactUrl||""})),
        windowSize:{...defaults.windowSize,...parsed.windowSize}};
    }catch(_){return {...defaults};}
  }
  let state=read();
  // Start the redesigned library in its shelf view without erasing older saves.
  if(!state.miniLibraryV5){state.view="library";state.miniLibraryV5=true;}
  state.theme=["parchment","forest","rose","midnight","lilac"].includes(state.theme)?state.theme:"parchment";
  // Migrate existing installations non-destructively: fill missing Mini/Last Hearth
  // links, but leave custom game links and other saved preferences intact.
  if (!state.homeUrl) state.homeUrl=MINI_HOME;
  state.sites=state.sites.map(game=>{
    if(game.id!=="hearth"&&game.name!=="The Last Hearth")return game;
    return {...game,url:game.url||HEARTH_FULL,
      compactUrl:game.compactUrl||HEARTH_COMPACT};
  });
  const save=()=>GM_setValue(KEY,JSON.stringify(state));
  const el=(tag,cls,text)=>{
    const e=document.createElement(tag);
    if(cls)e.className=cls;
    if(text!==undefined)e.textContent=text;
    return e;
  };
  const valid=value=>{
    try {const u=new URL(value);
      return u.protocol==="https:"||(u.protocol==="http:"&&["localhost","127.0.0.1"].includes(u.hostname));
    }catch(_){return false;}
  };
  const site=()=>state.sites.find(s=>s.id===state.selected);
  const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
  const css=String.raw;
  const styles=[
    "#mini-browser-root,#mini-browser-root *{box-sizing:border-box}",
    "#mini-browser-root{position:fixed;left:12px;bottom:16px;right:auto;top:auto;z-index:2147483400;width:328px;height:490px;min-width:260px;max-width:calc(100vw - 24px);min-height:150px;max-height:calc(100dvh - 32px);font:13px/1.4 system-ui,sans-serif;color:#2e2924;background:#faf7f0;border:1px solid #a69a87;border-radius:12px;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 10px 28px #14100a44}",
    "#mini-browser-root.mb-compact{min-height:140px}",
    "#mini-browser-root button,#mini-browser-root input{font:inherit}",
    "#mini-browser-root button{cursor:pointer}",
    "#mini-browser-root .mb-head{display:flex;align-items:center;gap:3px;background:#e9dfcf;height:45px;min-height:45px;padding:4px 6px;border-bottom:1px solid #c7b8a4}",
    "#mini-browser-root .mb-title{border:0;background:transparent;color:inherit;font-weight:750;flex:1 1 auto;min-width:0;text-align:left;padding:5px 3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",
    "#mini-browser-root .mb-icon{border:0;background:transparent;color:inherit;flex:none;width:30px;height:32px;padding:4px;border-radius:5px;display:flex;align-items:center;justify-content:center;font-size:19px;line-height:1}",
    "#mini-browser-root .mb-icon:hover,#mini-browser-root .mb-icon:focus-visible{background:#d7cbb8}",
    "#mini-browser-root .mb-icon svg{width:20px;height:20px;stroke:currentColor;fill:none;stroke-width:1.8}",
    "#mini-browser-root .mb-icon[aria-pressed=true]{background:#d7cbb8;box-shadow:inset 0 -2px #6c5940}",
    "#mini-browser-root .mb-content{flex:1;min-height:0;overflow:auto;background:white}",
    "#mini-browser-root iframe{display:block;width:100%;height:100%;border:0}",
    "#mini-browser-root .mb-empty{height:100%;min-height:125px;padding:16px;display:flex;flex-direction:column;justify-content:center;align-items:center;gap:10px;text-align:center;color:#625648}",
    "#mini-browser-root .mb-empty button,#mini-browser-root .mb-settings button,#mini-browser-root .mb-library button{border:1px solid #a18e77;border-radius:6px;background:#594a39;color:white;padding:8px 10px}",
    "#mini-browser-root .mb-library{padding:16px;display:flex;flex-direction:column;gap:9px;background:#faf7f0;min-height:100%}",
    "#mini-browser-root .mb-library h2{font-size:16px;margin:0}",
    "#mini-browser-root .mb-library p{font-size:12px;color:#776b5d;margin:0 0 6px}",
    "#mini-browser-root .mb-library button{text-align:left;padding:11px 12px}",
    "#mini-browser-root .mb-native{padding:12px;display:flex;flex-direction:column;gap:10px;background:#faf7f0;min-height:100%;color:#342c24}",
    "#mini-browser-root .mb-native h2{font-family:Georgia,serif;font-size:18px;margin:0}",
    "#mini-browser-root .mb-native p{margin:3px 0;color:#756859;font-size:12px;line-height:1.5;white-space:pre-wrap}",
    "#mini-browser-root .mb-native .mb-game{display:flex;gap:9px;align-items:center;width:100%;text-align:left;padding:12px;background:#fffdfa;color:#3d3027;border:1px solid #ded3c4;border-radius:9px}",
    "#mini-browser-root .mb-native .mb-game:focus-visible,#mini-browser-root .mb-native .mb-game:hover{background:#efe6d8}",
    "#mini-browser-root .mb-native .mb-game-icon{font-size:24px;min-width:28px}",
    "#mini-browser-root .mb-native .mb-game b,#mini-browser-root .mb-native .mb-game small{display:block}",
    "#mini-browser-root .mb-native .mb-game small{font-size:10px;color:#867766;margin-top:4px}",
    "#mini-browser-root .mb-native .mb-nav{display:flex;gap:5px;max-width:100%;overflow-x:auto;padding-bottom:5px;scrollbar-width:thin}",
    "#mini-browser-root .mb-native .mb-nav button{white-space:nowrap;border:1px solid #c6b9a6;border-radius:8px;background:#fffcf7;color:#4e4032;padding:8px 10px;min-height:32px;font-weight:600}",
    "#mini-browser-root .mb-native .mb-nav button[aria-selected=true]{background:#5c4c3a;color:white;border-color:#5c4c3a}",
    "#mini-browser-root .mb-native .mb-widget{background:#fffdf9;border:1px solid #e1d9cb;border-radius:10px;padding:11px;min-width:0}",
    "#mini-browser-root .mb-native .mb-widget h3{font-size:12px;margin:0 0 7px;color:#55432e}",
    "#mini-browser-root .mb-native .mb-widget .mb-body{font-size:12px;line-height:1.55;white-space:pre-wrap;overflow-wrap:anywhere}",
    "#mini-browser-root .mb-native .mb-stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(85px,1fr));gap:6px}",
    "#mini-browser-root .mb-native .mb-stat{padding:9px;border-radius:8px;background:#eee8dc;min-width:0}",
    "#mini-browser-root .mb-native .mb-stat b,#mini-browser-root .mb-native .mb-stat small{display:block;overflow-wrap:anywhere}",
    "#mini-browser-root .mb-native .mb-stat b{font-size:15px}",
    "#mini-browser-root .mb-native .mb-stat small{font-size:10px;color:#766859}",
    "#mini-browser-root .mb-native .mb-item{padding:7px 0;border-bottom:1px solid #eee8df;font-size:12px;line-height:1.5;white-space:pre-wrap;overflow-wrap:anywhere}",
    "#mini-browser-root .mb-native .mb-item:last-child{border:0}",
    "#mini-browser-root .mb-native .mb-muted{font-size:10px;color:#857765}",
    "#mini-browser-root .mb-native .mb-link{border:1px solid #b3a184;background:#f3e8d8;color:#493928;border-radius:7px;padding:9px 10px;font-size:12px;font-weight:600;text-align:center}",
    "#mini-browser-root .mb-native .mb-subhead{font-size:10px;color:#8f7c60;text-transform:uppercase;letter-spacing:.07em}",
    "#mini-browser-root .mb-settings{display:none;flex:1;overflow:auto;padding:12px;background:#faf7f0;flex-direction:column;gap:9px}",
    "#mini-browser-root .mb-settings label{display:flex;flex-direction:column;gap:4px;font-weight:650}",
    "#mini-browser-root .mb-settings input{min-width:0;padding:8px;border:1px solid #b7a994;border-radius:6px;background:white;color:inherit}",
    "#mini-browser-root .mb-settings .mb-actions{display:flex;flex-wrap:wrap;gap:7px}",
    "#mini-browser-root .mb-note{font-size:11px;color:#776b5d;margin:0}",
    "#mini-browser-root .mb-resize-width,#mini-browser-root .mb-resize-height,#mini-browser-root .mb-resize-bottom{position:absolute;z-index:8;touch-action:none;user-select:none;-webkit-user-select:none;background:transparent}",
    "#mini-browser-root .mb-resize-width{right:0;top:47px;bottom:0;width:14px;cursor:ew-resize}",
    "#mini-browser-root .mb-resize-width::after{content:'';position:absolute;top:50%;right:4px;height:45px;width:3px;transform:translateY(-50%);border-radius:4px;background:#a9977e}",
    "#mini-browser-root .mb-resize-height{top:0;left:32px;right:32px;height:8px;cursor:ns-resize}",
    "#mini-browser-root .mb-resize-height::after{content:'';position:absolute;top:3px;left:50%;width:40px;height:3px;transform:translateX(-50%);border-radius:4px;background:#a9977e}",
    "#mini-browser-root .mb-resize-bottom{display:none;bottom:0;left:30px;right:30px;height:15px;cursor:ns-resize}",
    "#mini-browser-root .mb-resize-bottom::after{content:'';display:block;position:absolute;bottom:5px;left:50%;transform:translateX(-50%);width:44px;height:3px;border-radius:5px;background:#a9977e}",
    "#mini-browser-root.mb-compact .mb-resize-height,#mini-browser-root.mb-compact .mb-resize-bottom{display:none!important}",
    "#mini-browser-root.mb-resizing iframe{pointer-events:none}",
    "@media(max-width:600px){#mini-browser-root{left:50%;right:auto;top:max(8px,env(safe-area-inset-top,0px));bottom:auto;transform:translateX(-50%);width:calc(100vw - 16px);height:min(460px,72dvh);max-width:calc(100vw - 16px);max-height:calc(100dvh - 16px);min-width:0;min-height:150px}#mini-browser-root .mb-resize-height{display:none!important}#mini-browser-root .mb-resize-bottom{display:block}#mini-browser-root .mb-resize-width{width:17px}#mini-browser-root .mb-resize-width::after{right:6px}#mini-browser-root .mb-head{padding:3px 4px;gap:2px}#mini-browser-root .mb-title{font-size:12px}}",
    "html:not(.mb-mini-selected) #mini-browser-root,html.mb-mini-selected #mini-browser-root.mb-bar{display:none!important}",
    "html.mb-mini-selected #paths-monkey-root,html.mb-mini-selected #mizuhana-hud,html.mb-mini-selected #mizu-hud-switcher,html.mb-mini-selected #mizuhana-launcher{display:none!important}",
    "#mb-shared-launcher{position:fixed;top:max(8px,env(safe-area-inset-top,0px));left:50%;transform:translateX(-50%);z-index:2147483500;display:none;align-items:center;max-width:calc(100vw - 24px);font:14px/1.35 system-ui,sans-serif}",
    "#mb-shared-launcher .mb-pill{cursor:pointer;appearance:none;border:1px solid #b2787d;background:#281d27;color:#fff3e6;border-radius:999px;padding:10px 17px;min-height:43px;font:800 14px/1.35 system-ui,sans-serif;box-shadow:0 7px 22px #0008;max-width:calc(100vw - 24px);white-space:nowrap;touch-action:pan-y}",
    "#mb-shared-launcher .mb-menu{position:absolute;top:calc(100% + 7px);left:50%;transform:translateX(-50%);min-width:min(285px,calc(100vw - 24px));padding:7px;border:1px solid #ad8085;border-radius:13px;background:#302431;box-shadow:0 8px 25px #000b;display:grid;gap:5px}",
    "#mb-shared-launcher .mb-menu[hidden]{display:none!important}",
    "#mb-shared-launcher .mb-menu button{width:100%;padding:11px 12px;border:1px solid #81616c;border-radius:9px;background:#40313e;color:#fff3e6;text-align:left;font:700 16px/1.35 system-ui,sans-serif;cursor:pointer}",
    "#mb-shared-launcher .mb-menu button:disabled{opacity:.5;cursor:not-allowed}",

    "#mini-browser-root .mb-setting-section{padding:12px;background:var(--mb-surface,#fffdfa);border:1px solid var(--mb-border,#ded3c4);border-radius:10px}",
    "#mini-browser-root .mb-setting-section h3{margin:0 0 10px;font-size:14px}",
    "#mini-browser-root .mb-setting-row{display:flex;align-items:center;gap:8px;justify-content:space-between}",
    "#mini-browser-root .mb-setting-row button{border:0;background:transparent;color:inherit;font-weight:700;padding:7px 4px}",
    "#mini-browser-root .mb-setting-row .mb-setting-open{border:1px solid var(--mb-border,#bbb);border-radius:7px;background:var(--mb-accent,#594a39);color:var(--mb-onaccent,#fff);padding:7px 12px;white-space:nowrap}",
    "#mini-browser-root .mb-setting-body[hidden]{display:none!important}",
    "#mini-browser-root .mb-setting-body{padding-top:8px}",
    "#mini-browser-root .mb-setting-small{border:1px solid var(--mb-border,#bbb);border-radius:7px;background:var(--mb-accent,#594a39);color:var(--mb-onaccent,#fff);padding:8px 10px}",
    "#mini-browser-root .mb-settings select{width:100%;min-width:0;padding:9px;border:1px solid var(--mb-border,#b7a994);border-radius:7px;background:var(--mb-surface,#fff);color:var(--mb-text,#29241f)}",
    "#mini-browser-root .mb-settings h2{font:700 19px Georgia,serif;margin:0}",
    "#mini-browser-root .mb-settings .mb-actions button{flex:1;min-width:66px}",
    "#mini-browser-root .mb-theme-swatches{display:flex;gap:11px;flex-wrap:wrap;margin:12px 0}",
    "#mini-browser-root .mb-theme-swatch{width:39px;height:39px;border-radius:999px;border:2px solid #ffffff99;box-shadow:0 0 0 1px #756d62;position:relative;display:grid;place-items:center}",
    "#mini-browser-root .mb-theme-swatch[aria-pressed=true]{box-shadow:0 0 0 3px var(--mb-accent,#594a39)}",
    "#mini-browser-root .mb-theme-swatch[aria-pressed=true]::after{content:'✓';font-size:17px;color:var(--mb-accent,#594a39);text-shadow:0 1px white;font-weight:900}",
    "#mini-browser-root{--mb-bg:#faf7f0;--mb-head:#e9dfcf;--mb-surface:#fffdfa;--mb-text:#302a24;--mb-muted:#756859;--mb-accent:#594a39;--mb-onaccent:#fff;--mb-border:#d5c7b3}",
    "#mini-browser-root.mb-theme-forest{--mb-bg:#f1f8f0;--mb-head:#cee2d1;--mb-surface:#fff;--mb-text:#273c30;--mb-muted:#58715d;--mb-accent:#315a40;--mb-border:#aec9b4}",
    "#mini-browser-root.mb-theme-rose{--mb-bg:#fff8f8;--mb-head:#efd4da;--mb-surface:#fffdfd;--mb-text:#512f40;--mb-muted:#876075;--mb-accent:#85526b;--mb-border:#e4c1ca}",
    "#mini-browser-root.mb-theme-midnight{--mb-bg:#1f2632;--mb-head:#303c50;--mb-surface:#293243;--mb-text:#f4f0e9;--mb-muted:#c1c9d2;--mb-accent:#667ca1;--mb-border:#546276}",
    "#mini-browser-root.mb-theme-lilac{--mb-bg:#faf7ff;--mb-head:#e3d9f2;--mb-surface:#fff;--mb-text:#3d3152;--mb-muted:#776587;--mb-accent:#675180;--mb-border:#d1c1e0}",
    "#mini-browser-root[class*=mb-theme-]{background:var(--mb-bg);color:var(--mb-text);border-color:var(--mb-border)}",
    "#mini-browser-root[class*=mb-theme-] .mb-head{background:var(--mb-head);border-color:var(--mb-border);color:var(--mb-text)}",
    "#mini-browser-root[class*=mb-theme-] .mb-native,#mini-browser-root[class*=mb-theme-] .mb-settings{background:var(--mb-bg);color:var(--mb-text)}",
    "#mini-browser-root[class*=mb-theme-] .mb-native p,#mini-browser-root[class*=mb-theme-] .mb-note,#mini-browser-root[class*=mb-theme-] .mb-native .mb-muted{color:var(--mb-muted)}",
    "#mini-browser-root[class*=mb-theme-] .mb-native .mb-game,#mini-browser-root[class*=mb-theme-] .mb-native .mb-widget,#mini-browser-root[class*=mb-theme-] .mb-setting-section{background:var(--mb-surface);border-color:var(--mb-border);color:var(--mb-text)}",
    "#mini-browser-root[class*=mb-theme-] .mb-settings input,#mini-browser-root[class*=mb-theme-] .mb-settings select{background:var(--mb-surface);color:var(--mb-text);border-color:var(--mb-border)}",
    "#mini-browser-root[class*=mb-theme-] .mb-native .mb-nav button{background:var(--mb-surface);color:var(--mb-text);border-color:var(--mb-border)}",
    "#mini-browser-root[class*=mb-theme-] .mb-native .mb-nav button[aria-selected=true],#mini-browser-root[class*=mb-theme-] .mb-settings .mb-actions button{background:var(--mb-accent);color:var(--mb-onaccent);border-color:var(--mb-accent)}",
    "#mini-browser-root[class*=mb-theme-] .mb-native .mb-stat{background:var(--mb-head)}",
    "#mini-browser-root[class*=mb-theme-] .mb-native .mb-stat b,#mini-browser-root[class*=mb-theme-] .mb-native h2,#mini-browser-root[class*=mb-theme-] .mb-native .mb-widget h3{color:var(--mb-text)}",
    "#mini-browser-root[class*=mb-theme-] .mb-native .mb-link{background:var(--mb-accent);color:var(--mb-onaccent);border-color:var(--mb-accent)}"
  ];
  document.head.append(Object.assign(el("style"),{textContent:styles.join("\n")}));

  const root=el("section");root.id="mini-browser-root";
  root.setAttribute("aria-label","Mini Library HUD");
  const head=el("div","mb-head");
  const title=el("button","mb-title","Mini Library");
  title.title="Minimize to the shared HUD button";
  const libraryBtn=el("button","mb-icon");
  libraryBtn.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>';
  libraryBtn.title="Mini game library";libraryBtn.setAttribute("aria-label","Open Mini game library");
  const openBtn=el("button","mb-icon","↗");
  openBtn.title="Open current website in another browser tab";
  const compactBtn=el("button","mb-icon","▭");
  compactBtn.title="Show compact game tracker";
  const fullBtn=el("button","mb-icon","□");
  fullBtn.title="Show expanded resizable window";
  const settingsBtn=el("button","mb-icon","☼");
  settingsBtn.title="Mini settings";
  head.append(title,libraryBtn,openBtn,compactBtn,fullBtn,settingsBtn);
  const content=el("div","mb-content");
  const settings=el("div","mb-settings");
  const settingsTitle=el("h2","","Mini Library Settings");
  const settingsHome=el("section","mb-setting-section");
  const homeHead=el("div","mb-setting-row");
  const homeToggle=el("button","mb-setting-toggle","▸ Mini Homepage");
  homeToggle.type="button";homeToggle.setAttribute("aria-expanded","false");
  const homeOpen=el("button","mb-setting-open","↗ Open");
  homeOpen.type="button";homeOpen.title="Open the Mini Library homepage in a new tab";
  homeHead.append(homeToggle,homeOpen);
  const homeBody=el("div","mb-setting-body");homeBody.hidden=true;
  const homeLabel=el("label","","Homepage website URL");
  const homeField=el("input");homeField.type="url";
  homeField.placeholder="https://denoden3.github.io/mini-browser/";
  homeLabel.append(homeField);
  const homeSave=el("button","mb-setting-small","Save homepage link");
  homeSave.type="button";
  homeBody.append(homeLabel,homeSave,
    el("p","mb-note","Used by the ↗ arrow when you are viewing the game library."));
  settingsHome.append(homeHead,homeBody);
  let homeExpanded=false;
  function setHomeExpanded(value){
    homeExpanded=!!value;homeBody.hidden=!homeExpanded;
    homeToggle.textContent=(homeExpanded?"▾ ":"▸ ")+"Mini Homepage";
    homeToggle.setAttribute("aria-expanded",String(homeExpanded));
  }
  homeToggle.onclick=()=>setHomeExpanded(!homeExpanded);
  homeOpen.onclick=()=>window.open(valid(homeField.value.trim())?homeField.value.trim():MINI_HOME,
    "_blank","noopener,noreferrer");
  homeSave.onclick=()=>{
    const value=homeField.value.trim();
    if(!valid(value)){alert("Please enter a valid HTTPS homepage URL.");return;}
    state.homeUrl=value;save();homeSave.textContent="✓ Saved";
    setTimeout(()=>homeSave.textContent="Save homepage link",1200);
  };

  const manager=el("section","mb-setting-section");
  manager.append(el("h3","","Game Manager"));
  const managerLabel=el("label","","Choose a saved game");
  const managerSelect=el("select","mb-manager-select");
  managerSelect.setAttribute("aria-label","Select a saved Mini Library game");
  managerLabel.append(managerSelect);
  const managerActions=el("div","mb-actions");
  const managerAdd=el("button","","Add");
  const managerEdit=el("button","","Edit");
  const managerRemove=el("button","","Remove");
  managerActions.append(managerAdd,managerEdit,managerRemove);
  manager.append(managerLabel,managerActions,el("p","mb-note",
    "Game saves and custom tracker menus live on the Mini website. These buttons open the corresponding website manager; Mini displays your changes after they are saved and synced."));
  function managerLink(action,id){
    return MINI_HOME+"?action="+encodeURIComponent(action)+
      (id?"&game="+encodeURIComponent(id):"");
  }
  const launchManager=(action,id)=>window.open(managerLink(action,id),"_blank","noopener,noreferrer");
  managerAdd.onclick=()=>launchManager("new");
  managerEdit.onclick=()=>{if(managerSelect.value)launchManager("edit",managerSelect.value);};
  managerRemove.onclick=()=>{if(managerSelect.value)launchManager("remove",managerSelect.value);};
  managerSelect.onchange=()=>{
    managerEdit.disabled=!managerSelect.value;
    managerRemove.disabled=!managerSelect.value;
  };
  function refreshManager(){
    const previous=managerSelect.value||selectedGame()?.id;
    managerSelect.replaceChildren();
    for(const game of games()){
      const item=el("option","",safeText(game.title)||"Unnamed game");
      item.value=game.id;managerSelect.append(item);
    }
    managerSelect.value=games().some(g=>g.id===previous)?previous:(games()[0]?.id||"");
    managerEdit.disabled=!managerSelect.value;managerRemove.disabled=!managerSelect.value;
    if(!games().length){
      const option=el("option","","No synced games yet");
      option.value="";managerSelect.append(option);
      managerSelect.value="";
    }
  }

  const appearance=el("section","mb-setting-section");
  appearance.append(el("h3","","Mini HUD Themes"));
  const swatches=el("div","mb-theme-swatches");
  const themes=[
    ["parchment","Parchment","#eadfcf"],
    ["forest","Forest","#c9decd"],
    ["rose","Rose","#edccd4"],
    ["midnight","Midnight","#283143"],
    ["lilac","Lilac","#ddd0ed"]
  ];
  const swatchButtons=[];
  for(const [id,label,color] of themes){
    const choice=el("button","mb-theme-swatch");
    choice.type="button";choice.title=label;
    choice.setAttribute("aria-label","Use "+label+" theme");
    choice.style.background=color;
    choice.onclick=()=>{state.theme=id;save();render();};
    swatches.append(choice);swatchButtons.push([id,choice]);
  }
  appearance.append(swatches);
  const heightLabel=el("label","","Compact tracker height");
  const heightField=el("input");heightField.type="range";heightField.min="140";
  heightField.max="320";heightField.step="10";
  heightField.value=String(clamp(state.compactHeight||185,140,320));
  const heightPreview=el("span","mb-note",heightField.value+" px");
  heightField.addEventListener("input",()=>{
    heightPreview.textContent=heightField.value+" px";
    state.compactHeight=Number(heightField.value);save();
    if(state.mode==="compact")sizeWindow();
  });
  heightLabel.append(heightField,heightPreview);
  appearance.append(el("p","mb-note","Choose the look of Mini's window, then adjust how tall its compact tracker appears."),heightLabel);
  settings.append(settingsTitle,settingsHome,manager,appearance);
  const widthHandle=el("div","mb-resize-width");
  const heightHandle=el("div","mb-resize-height");
  const bottomHandle=el("div","mb-resize-bottom");
  for(const [handle,name,orientation] of [
    [widthHandle,"width","vertical"],[heightHandle,"height","horizontal"],
    [bottomHandle,"mobile height","horizontal"]]){
    handle.setAttribute("role","separator");
    handle.setAttribute("aria-orientation",orientation);
    handle.setAttribute("aria-label","Resize Mini "+name);
    handle.tabIndex=0;
  }
  root.append(head,content,settings,widthHandle,heightHandle,bottomHandle);
  document.body.append(root);

  const bounds=()=>({
    width:window.innerWidth<=600?Math.max(220,window.innerWidth-16):Math.max(260,Math.min(900,window.innerWidth-24)),
    height:window.innerWidth<=600?Math.max(150,window.innerHeight-76):Math.max(210,window.innerHeight-32)
  });
  function sizeWindow(){
    const b=bounds(),mobile=window.innerWidth<=600;
    root.style.width=clamp(state.windowSize.width,mobile?Math.min(240,b.width):260,b.width)+"px";
    root.style.height=(state.mode==="compact"
      ?clamp(state.compactHeight||185,140,Math.max(140,b.height))
      :clamp(state.windowSize.height,150,b.height))+"px";
  }
  let dragging=null;
  for(const [handle,dimension] of [[widthHandle,"width"],[heightHandle,"height"],[bottomHandle,"bottom"]]){
    handle.addEventListener("pointerdown",event=>{
      if(event.button!==0||state.mode!=="open")return;
      if(window.innerWidth<=600&&dimension==="height")return;
      if(window.innerWidth>600&&dimension==="bottom")return;
      event.preventDefault();
      dragging={handle,pointerId:event.pointerId,dimension,x:event.clientX,y:event.clientY,
        width:root.getBoundingClientRect().width,height:root.getBoundingClientRect().height};
      root.classList.add("mb-resizing");
      handle.setPointerCapture(event.pointerId);
    });
    handle.addEventListener("pointermove",event=>{
      if(!dragging||dragging.handle!==handle||dragging.pointerId!==event.pointerId)return;
      const b=bounds(),mobile=window.innerWidth<=600;
      if(dimension==="width"){
        state.windowSize.width=clamp(
          Math.round(dragging.width+(event.clientX-dragging.x)*(mobile?2:1)),
          mobile?Math.min(240,b.width):260,b.width);
        root.style.width=state.windowSize.width+"px";
      }else{
        const change=event.clientY-dragging.y;
        state.windowSize.height=clamp(
          Math.round(dragging.height+(mobile?change:-change)),150,b.height);
        root.style.height=state.windowSize.height+"px";
      }
    });
    function finish(event){
      if(!dragging||dragging.handle!==handle||dragging.pointerId!==event.pointerId)return;
      dragging=null;root.classList.remove("mb-resizing");save();
    }
    handle.addEventListener("pointerup",finish);
    handle.addEventListener("pointercancel",finish);
    handle.addEventListener("lostpointercapture",finish);
  }
  window.addEventListener("resize",sizeWindow);

  // GitHub Pages may load in a normal tab but be blocked as an iframe by
  // ChatGPT or browser security settings. Owned pages send a harmless
  // readiness signal; if none arrives, never leave the panel blank.
  let embedCheck=null;
  const failedEmbeds=new Set();
  const isMiniSite=url=>{
    try{const u=new URL(url);return u.origin==="https://denoden3.github.io"&&
      u.pathname.startsWith("/mini-browser/");}catch(_){return false;}
  };
  function miniFallback(url,library=false){
    const panel=el("div","mb-empty");
    if(library){
      panel.classList.add("mb-library");
      panel.append(el("strong","","✦ Mini Library"),
        el("div","","The website could not be displayed inside ChatGPT. Your saved game shortcuts still work here."));
      for(const g of state.sites){
        const entry=el("button","",g.name);
        entry.type="button";
        entry.onclick=()=>{state.selected=g.id;state.view="site";save();render();};
        panel.append(entry);
      }
    }else{
      panel.append(el("strong","","Webpage couldn't display here"),
        el("div","","The website may be blocked from loading inside ChatGPT. You can still open it in a normal browser tab."));
    }
    const openPage=el("button","","↗ Open website in a tab");
    openPage.type="button";openPage.onclick=()=>window.open(url,"_blank","noopener,noreferrer");
    const retry=el("button","","↻ Retry inside Mini");
    retry.type="button";retry.onclick=()=>{failedEmbeds.delete(url);showSite();};
    panel.append(openPage,retry);
    if(!library){
      const back=el("button","","▦ Saved games");
      back.type="button";back.onclick=()=>{
        state.view="library";save();render();
      };
      panel.append(back);
    }
    content.replaceChildren(panel);
  }
  window.addEventListener("message",event=>{
    if(event.origin!=="https://denoden3.github.io"||
      !event.data||event.data.type!=="mini-browser:page-ready")return;
    if(!embedCheck||event.source!==embedCheck.frame.contentWindow)return;
    embedCheck.ready=true;
  });
  let settingsVisible=false;

  // Each game owns its own HUD menu configuration, edited on the Mini website.
  // Mini only knows generic rendering primitives. Nothing here is inn-specific.
  const FIELD_NAMES=new Set([
    "quickStats","checkpoint","scene","protagonist","world","cast",
    "inventory","finances","quests","rules","summary","events","custom"
  ]);
  const TYPES=new Set(["stats","text","list","pairs","events"]);
  const nativeState={data:null,error:"",lastRaw:""};
  const readSaves=()=>{
    try{
      const raw=GM_getValue(BRIDGE_KEY,"");
      if(!raw||raw===nativeState.lastRaw)return !!nativeState.data;
      const parsed=JSON.parse(raw);
      if(parsed.schema!==1||!Array.isArray(parsed.games))return false;
      nativeState.lastRaw=raw;
      nativeState.data=parsed;
      return true;
    }catch(_){return false;}
  };
  readSaves();
  function games(){return nativeState.data?.games||[];}
  function selectedGame(){
    return games().find(g=>g.id===state.selected||
      (state.selected==="hearth"&&g.id==="the-last-hearth"))||games()[0]||null;
  }
  function savedGameURL(g){
    return MINI_HOME+"?game="+encodeURIComponent(g.id);
  }
  const safeText=value=>typeof value==="string"?value.slice(0,22000):"";
  function gameMenus(g){
    const menus=Array.isArray(g.hudMenus)?g.hudMenus.slice(0,20):[];
    if(menus.length)return menus.filter(m=>m&&typeof m.label==="string").map(m=>({
      id:String(m.id||m.label).slice(0,100),
      label:m.label.slice(0,60),
      widgets:Array.isArray(m.widgets)?m.widgets.slice(0,30):[]
    }));
    return [{id:"overview",label:"Overview",widgets:[
      {type:"stats",source:"quickStats",title:"Quick status"},
      {type:"text",source:"scene",title:"Current scene"}]}];
  }
  function nativeHeader(container,headline,subtitle){
    container.append(el("h2","",headline));
    if(subtitle)container.append(el("p","",subtitle));
  }
  function nativeLink(label,url){
    const b=el("button","mb-link",label);
    b.type="button";
    b.onclick=()=>window.open(url,"_blank","noopener,noreferrer");
    return b;
  }
  function renderWidget(parent,game,widget){
    if(!widget||!TYPES.has(widget.type)||!FIELD_NAMES.has(widget.source))return;
    const box=el("section","mb-widget");
    if(widget.title)box.append(el("h3","",safeText(widget.title).slice(0,80)));
    const source=widget.source;
    const value=source==="custom"?safeText(widget.body):
      source==="events"?"":safeText(game[source]);
    if(widget.type==="events"){
      const events=Array.isArray(game.events)?game.events.slice(-12).reverse():[];
      for(const event of events){
        const entry=el("div","mb-item");
        entry.append(el("small","mb-muted",safeText(event.at)));
        entry.append(el("div","mb-body",safeText(event.text)));
        box.append(entry);
      }
      if(!events.length)box.append(el("p","","No journal entries yet."));
    }else if(widget.type==="stats"){
      const grid=el("div","mb-stats");
      value.split(/\r?\n/).filter(Boolean).slice(0,12).forEach(line=>{
        const at=line.indexOf("|");
        const label=at<0?"Stat":line.slice(0,at).trim();
        const val=at<0?line.trim():line.slice(at+1).trim();
        const item=el("div","mb-stat");
        item.append(el("b","",val),el("small","",label));
        grid.append(item);
      });
      box.append(grid);
    }else if(widget.type==="list"){
      value.split(/\r?\n/).filter(Boolean).slice(0,45).forEach(line=>{
        box.append(el("div","mb-item",line.replace(/^[•*\\-]\s*/,"")));
      });
    }else if(widget.type==="pairs"){
      value.split(/\r?\n/).filter(Boolean).slice(0,40).forEach(line=>{
        const at=line.includes("|")?line.indexOf("|"):line.indexOf(":");
        const row=el("div","mb-item");
        if(at===-1)row.textContent=line;
        else{
          row.append(el("b","",line.slice(0,at).trim()+": "));
          row.append(el("span","",line.slice(at+1).trim()));
        }
        box.append(row);
      });
    }else{
      box.append(el("div","mb-body",value||"No details recorded yet."));
    }
    parent.append(box);
  }
  function nativeLibrary(){
    const page=el("div","mb-native");
    nativeHeader(page,"✦ Mini Library","Choose a saved adventure. Every game can have its own menus.");
    games().forEach(g=>{
      const button=el("button","mb-game");
      const info=el("span");
      info.append(el("b","",safeText(g.title)||"Unnamed adventure"),
        el("small","",safeText(g.checkpoint)||"New adventure"));
      button.append(el("span","mb-game-icon",safeText(g.icon)||"📖"),info);
      button.onclick=()=>{
        state.selected=g.id;
        state.view="site";
        save();render();
      };
      page.append(button);
    });
    page.append(nativeLink("↗ Edit games, menus & story saves on website",MINI_HOME));
    page.append(el("span","mb-muted","Local browser sync · Not a cloud database yet."));
    content.replaceChildren(page);
  }
  function nativeGame(){
    const g=selectedGame();
    if(!g){nativeLibrary();return;}
    const menus=gameMenus(g);
    const page=el("div","mb-native");
    const meta=safeText(g.checkpoint)||"Saved adventure";
    if(state.mode==="compact"){
      const menu=menus.find(m=>m.id===g.hudCompactMenuId)||menus[0];
      nativeHeader(page,(g.icon||"📖")+" "+safeText(g.title),meta);
      (menu?.widgets||[]).forEach(w=>renderWidget(page,g,w));
    }else{
      nativeHeader(page,(g.icon||"📖")+" "+safeText(g.title),meta);
      const nav=el("nav","mb-nav");
      const savedTabs=state.nativeTabs||{};
      const activeId=menus.some(m=>m.id===savedTabs[g.id])?savedTabs[g.id]:menus[0]?.id;
      menus.forEach(m=>{
        const tab=el("button","",m.label);
        tab.type="button";
        tab.setAttribute("aria-selected",String(m.id===activeId));
        tab.onclick=()=>{
          state.nativeTabs={...savedTabs,[g.id]:m.id};
          save();render();
        };
        nav.append(tab);
      });
      page.append(nav);
      const activeMenu=menus.find(m=>m.id===activeId)||menus[0];
      (activeMenu?.widgets||[]).forEach(w=>renderWidget(page,g,w));
      page.append(nativeLink("↗ Edit this game / Generate prompt",savedGameURL(g)));
    }
    content.replaceChildren(page);
  }
  function nativeNoSync(){
    const page=el("div","mb-native");
    nativeHeader(page,"Mini Library","Your games will appear here after Mini receives their saved data.");
    page.append(el("p","",
      "Open the Mini Library website in this same browser once. The companion userscript will copy the saved games locally, so Mini can display their individual menus without embedding webpages."));
    page.append(nativeLink("↗ Open Mini Library",MINI_HOME));
    page.append(el("span","mb-muted","Requires the updated Mini userscript to run on both ChatGPT and Mini Library. Changes made in a different browser or device will not sync yet."));
    content.replaceChildren(page);
  }
  function showNative(){
    readSaves();
    if(!games().length){nativeNoSync();return;}
    if(state.view==="library")nativeLibrary();
    else nativeGame();
  }
  if(typeof GM_addValueChangeListener==="function"){
    GM_addValueChangeListener(BRIDGE_KEY,()=>{
      nativeState.lastRaw="";
      readSaves();
      if(state.miniSelected&&!settingsVisible)render();
    });
  }
  document.addEventListener("visibilitychange",()=>{
    if(document.visibilityState==="visible"){
      nativeState.lastRaw="";
      readSaves();
      if(state.miniSelected&&!settingsVisible)render();
    }
  });

  function activeUrl(){
    if(state.view==="library")return valid(state.homeUrl)?state.homeUrl:"";
    const g=selectedGame();
    if(g) return savedGameURL(g);
    const s=site();
    const url=state.mode==="compact"&&valid(s?.compactUrl)?s.compactUrl:s?.url;
    return valid(url)?url:"";
  }
  function frame(url,label){
    if(failedEmbeds.has(url)){miniFallback(url,state.view==="library");return;}
    const existing=content.querySelector("iframe");
    if(existing&&existing.getAttribute("src")===url)return;
    const iframe=el("iframe");iframe.title=label;iframe.src=url;
    iframe.loading="eager";iframe.referrerPolicy="strict-origin-when-cross-origin";
    content.replaceChildren(iframe);
    if(isMiniSite(url)){
      const check={frame:iframe,ready:false};
      embedCheck=check;
      setTimeout(()=>{
        if(embedCheck!==check||check.ready||!iframe.isConnected)return;
        failedEmbeds.add(url);
        miniFallback(url,state.view==="library");
      },6500);
    }else{
      embedCheck=null;
    }
  }
  function showSite(){
    showNative();
    return;
    if(state.view==="library"){
      if(valid(state.homeUrl)){frame(state.homeUrl,"Mini game-library website");return;}
      const page=el("div","mb-library");
      page.append(el("h2","","▦ Mini Browser Library"),
        el("p","","Our homepage website isn't built yet. You can already open your saved games below."));
      if(!state.sites.length)page.append(el("p","","No games saved. Add one in ☼ Settings."));
      for(const game of state.sites){
        const button=el("button","",game.name);button.type="button";
        button.onclick=()=>{state.selected=game.id;state.view="site";save();render();};
        page.append(button);
      }
      content.replaceChildren(page);return;
    }
    const url=activeUrl();
    if(url){frame(url,(site()?.name||"Game")+" webpage");return;}
    const empty=el("div","mb-empty");
    empty.append(el("strong","",site()?.name||"Mini Browser"),
      el("div","","Add this game's website to display its tracker here."));
    const button=el("button","","Set website URL");
    button.onclick=()=>showSettings(true);
    empty.append(button);content.replaceChildren(empty);
  }
  function render(){
    state.mode=["open","compact","bar"].includes(state.mode)?state.mode:"open";
    root.className=state.mode==="bar"?"mb-bar":state.mode==="compact"?"mb-compact":"mb-open";
    sizeWindow();
    libraryBtn.setAttribute("aria-pressed",String(state.view==="library"));
    compactBtn.setAttribute("aria-pressed",String(state.mode==="compact"));
    fullBtn.setAttribute("aria-pressed",String(state.mode==="open"));
    openBtn.disabled=!activeUrl();openBtn.style.opacity=openBtn.disabled?".4":"1";
    if(!settingsVisible)showSite();
    syncIntegration();
  }
  function showSettings(visible){
    settingsVisible=visible;
    settings.style.display=visible?"flex":"none";
    content.style.display=visible?"none":"block";
    if(visible){
      editing=state.selected;
      homeField.value=state.homeUrl;
      nameField.value=site()?.name||"";
      urlField.value=site()?.url||"";
      compactField.value=site()?.compactUrl||"";
      heightField.value=String(clamp(state.compactHeight||185,140,320));
      heightPreview.textContent=heightField.value+" px";
      if(state.mode==="bar")state.mode="open";
    }
    render();
  }
  title.onclick=()=>{
    if(settingsVisible)showSettings(false);
    state.mode="bar";save();render();
  };
  libraryBtn.onclick=()=>{showSettings(false);state.view="library";save();render();};
  compactBtn.onclick=()=>{showSettings(false);state.mode="compact";save();render();};
  fullBtn.onclick=()=>{showSettings(false);state.mode="open";save();render();};
  openBtn.onclick=()=>{const url=activeUrl();if(url)window.open(url,"_blank","noopener,noreferrer");};
  settingsBtn.onclick=()=>showSettings(!settingsVisible);
  add.onclick=()=>{editing=null;nameField.value="";urlField.value="";compactField.value="";nameField.focus();};
  store.onclick=()=>{
    const name=nameField.value.trim(),url=urlField.value.trim(),
      compactUrl=compactField.value.trim(),homeUrl=homeField.value.trim();
    if(!name||[url,compactUrl,homeUrl].some(v=>v&&!valid(v))){
      alert("Enter a game name and valid HTTPS URLs (or localhost).");return;
    }
    state.homeUrl=homeUrl;
    state.compactHeight=Number(heightField.value);
    if(editing&&state.sites.some(s=>s.id===editing)){
      state.sites=state.sites.map(s=>s.id===editing?{...s,name,url,compactUrl}:s);
      state.selected=editing;
    }else{
      const id="site-"+Date.now();state.sites.push({id,name,url,compactUrl});state.selected=id;
    }
    state.view="library";
    save();showSettings(false);
  };
  remove.onclick=()=>{
    if(!editing||!confirm("Remove this saved game?"))return;
    state.sites=state.sites.filter(s=>s.id!==editing);
    state.selected=state.sites[0]?.id||null;
    save();showSettings(false);
  };

  // Shared selector: add Mini to existing HUD menus, without editing PTI or Mizuhana.
  const switcher=el("div");switcher.id="mb-shared-launcher";
  const pill=el("button","mb-pill","◈ Mini Browser");
  pill.setAttribute("aria-haspopup","menu");pill.setAttribute("aria-expanded","false");
  pill.title="Click to open Mini; long-press to choose a HUD";
  const menu=el("div","mb-menu");menu.hidden=true;menu.setAttribute("role","menu");
  switcher.append(pill,menu);document.body.append(switcher);
  function hideMenu(){menu.hidden=true;pill.setAttribute("aria-expanded","false");}
  function activateMini(){
    if(document.getElementById("paths-monkey-root")?.classList.contains("pm-expanded"))
      document.getElementById("pm-collapse-title")?.click();
    document.getElementById("mizu-brand-collapse")?.click();
    state.miniSelected=true;state.mode="open";hideMenu();save();render();
  }
  function switchHud(id){
    hideMenu();state.miniSelected=false;state.mode="bar";save();syncIntegration();
    if(id==="paths")document.getElementById("pm-select-paths")?.click();
    else{
      const btn=document.getElementById("pm-select-mizuhana");
      if(btn&&document.querySelector("#mizuhana-hud,#mizuhana-launcher,#mizu-hud-switcher"))btn.click();
      else document.querySelector("#mizuhana-launcher,#mizu-hud-pill")?.click();
    }
    syncIntegration();
  }
  function showMenu(){
    menu.replaceChildren();
    for(const [label,action,enabled] of [
      ["◈ Mini Browser",activateMini,true],
      ["☯ Paths of Immortality",()=>switchHud("paths"),!!document.getElementById("pm-select-paths")],
      ["🌺 Mizuhana",()=>switchHud("mizuhana"),
        !!document.querySelector("#mizuhana-hud,#mizuhana-launcher,#mizu-hud-switcher")]
    ]){
      const b=el("button","",label);b.type="button";b.disabled=!enabled;
      b.setAttribute("role","menuitem");b.onclick=()=>{hideMenu();action();};menu.append(b);
    }
    menu.hidden=false;pill.setAttribute("aria-expanded","true");
  }
  let hold=null,suppress=false;
  pill.addEventListener("pointerdown",e=>{
    if(e.button!==0)return;
    suppress=false;clearTimeout(hold);
    hold=setTimeout(()=>{hold=null;suppress=true;showMenu();},480);
  });
  for(const type of ["pointerup","pointerleave","pointercancel"])
    pill.addEventListener(type,()=>{clearTimeout(hold);hold=null;});
  pill.onclick=e=>{
    if(suppress){suppress=false;e.preventDefault();return;}
    if(!menu.hidden){hideMenu();return;}activateMini();
  };
  pill.oncontextmenu=e=>{e.preventDefault();showMenu();};
  pill.onkeydown=e=>{
    if(e.key==="ArrowDown"){e.preventDefault();showMenu();menu.querySelector("button")?.focus();}
    if(e.key==="Escape")hideMenu();
  };
  document.addEventListener("pointerdown",e=>{if(!switcher.contains(e.target))hideMenu();});
  function inject(menuId,className){
    const target=document.getElementById(menuId);
    if(!target||target.querySelector("[data-mini-browser-option]"))return;
    const btn=el("button",className,"◈ Mini Browser");
    btn.type="button";btn.setAttribute("role","menuitem");
    btn.setAttribute("data-mini-browser-option","true");
    btn.onclick=e=>{e.preventDefault();e.stopPropagation();activateMini();};
    target.append(btn);
  }
  function existingHudPresent(){
    return !!document.querySelector("#pm-picker:not(.pm-hide),#paths-monkey-root.pm-expanded,#mizu-hud-switcher,#mizuhana-hud,#mizuhana-launcher");
  }
  function syncIntegration(){
    document.documentElement.classList.toggle("mb-mini-selected",state.miniSelected);
    switcher.style.display=(state.miniSelected?state.mode==="bar":!existingHudPresent())?"flex":"none";
    if(switcher.style.display==="none")hideMenu();
  }
  function syncMenus(){inject("pm-picker-menu","pm-picker-option");inject("mizu-hud-menu","");}
  syncMenus();
  const observer=new MutationObserver(()=>{syncMenus();syncIntegration();});
  observer.observe(document.body,{childList:true,subtree:true});
  window.addEventListener("pagehide",()=>observer.disconnect(),{once:true});
  render();
})();