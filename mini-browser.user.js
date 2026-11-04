// ==UserScript==
// @name         Mini Browser — Universal Roleplay HUD
// @namespace    mini-browser.chat-rpg
// @version      0.3.0
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
  state.view = state.view === 'library' ? 'library' : (state.view === 'game' ? 'game' : 'library');
  state.homeUrl = typeof state.homeUrl === 'string' ? state.homeUrl : '';
  state.compactHeight = Number.isFinite(state.compactHeight) ? state.compactHeight : 190;
  state.sites = state.sites.map(s => ({...s, compactUrl: typeof s.compactUrl === 'string' ? s.compactUrl : ''}));
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
  const css = "\n  #mini-browser-root, #mini-browser-root * {box-sizing:border-box}\n  #mini-browser-root {\n    position:fixed;z-index:2147483400;left:12px;right:auto;bottom:16px;top:auto;\n    transform:none;width:328px;height:490px;max-width:calc(100vw - 16px);\n    min-width:235px;min-height:150px;display:flex;flex-direction:column;\n    border:1px solid #a89b87;border-radius:12px;overflow:hidden;\n    background:#faf7f0;color:#29241f;\n    box-shadow:0 12px 29px #17110b44;\n    font:13px/1.4 system-ui,-apple-system,sans-serif;\n  }\n  #mini-browser-root button, #mini-browser-root input {font:inherit}\n  #mini-browser-root button {cursor:pointer}\n  #mini-browser-root button:focus-visible, #mini-browser-root input:focus-visible,\n  #mini-browser-root .mb-edge:focus-visible {outline:2px solid #9b5835;outline-offset:-2px}\n  #mini-browser-root .mb-head {\n    flex:0 0 48px;min-width:0;display:flex;align-items:center;\n    gap:2px;padding:5px 7px;background:#e9dfcf;border-bottom:1px solid #c5b8a4;\n  }\n  #mini-browser-root .mb-title {\n    flex:1 1 auto;min-width:0;border:0;background:none;color:inherit;\n    font-weight:800;text-align:left;overflow:hidden;text-overflow:ellipsis;\n    white-space:nowrap;font-size:12px;padding:8px 4px;\n  }\n  #mini-browser-root .mb-icon {\n    flex:0 0 32px;display:grid;place-items:center;\n    width:32px;height:34px;padding:4px;border:0;border-radius:6px;\n    color:#493e34;background:transparent;\n  }\n  #mini-browser-root .mb-icon svg {width:20px;height:20px;stroke:currentColor;fill:none;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}\n  #mini-browser-root .mb-icon:hover {background:#d7c9b5}\n  #mini-browser-root .mb-icon.mb-active {background:#cbb79a;color:#382d20}\n  #mini-browser-root .mb-icon:disabled {opacity:.35;cursor:default}\n  #mini-browser-root .mb-content {flex:1;min-height:0;background:#fff;overflow:auto}\n  #mini-browser-root .mb-content iframe {border:0;width:100%;height:100%;display:block;background:white}\n  #mini-browser-root .mb-settings {flex:1;min-height:0;display:none;overflow:auto;padding:14px;background:#faf7f0}\n  #mini-browser-root .mb-settings h2 {margin:0 0 12px;font-size:15px}\n  #mini-browser-root .mb-settings h3 {font-size:12px;margin:14px 0 8px}\n  #mini-browser-root .mb-settings label {display:block;margin:10px 0;font-weight:650;font-size:12px}\n  #mini-browser-root .mb-settings input[type=url],\n  #mini-browser-root .mb-settings input[type=text] {\n    display:block;margin-top:5px;width:100%;min-width:0;padding:9px 10px;\n    border:1px solid #b6a58c;border-radius:7px;background:white;color:#29241f;\n  }\n  #mini-browser-root .mb-settings input[type=range] {display:block;width:100%;margin:12px 0 5px;accent-color:#66503c}\n  #mini-browser-root .mb-settings .mb-actions {display:flex;gap:6px;flex-wrap:wrap;margin-top:12px}\n  #mini-browser-root .mb-settings .mb-actions button,\n  #mini-browser-root .mb-main-action {\n    border:1px solid #5c4c3a;background:#5c4c3a;color:#fff;\n    padding:8px 11px;border-radius:7px;font-size:12px;font-weight:650;\n  }\n  #mini-browser-root .mb-settings .mb-actions button.mb-light {background:transparent;color:#5c4c3a}\n  #mini-browser-root .mb-hint {font-size:11px;color:#786d60;margin:6px 0 0;line-height:1.5}\n  #mini-browser-root .mb-library {padding:14px;min-height:100%}\n  #mini-browser-root .mb-library h2 {margin:0;font-family:Georgia,serif;font-size:20px}\n  #mini-browser-root .mb-library p {color:#776c5e;font-size:12px;margin:6px 0 14px}\n  #mini-browser-root .mb-library-card {\n    display:flex;align-items:center;justify-content:space-between;\n    gap:9px;width:100%;border:1px solid #dfd3c3;border-radius:9px;\n    background:#faf7f1;text-align:left;margin:0 0 9px;padding:13px;\n    color:#382c20;\n  }\n  #mini-browser-root .mb-library-card:hover {background:#f0e6d7}\n  #mini-browser-root .mb-library-card b {display:block;font-size:13px}\n  #mini-browser-root .mb-library-card small {display:block;margin-top:3px;font-size:11px;color:#796e61}\n  #mini-browser-root .mb-empty {\n    min-height:100%;padding:22px;display:flex;align-items:center;\n    justify-content:center;flex-direction:column;gap:11px;text-align:center;\n    color:#68594b;\n  }\n  #mini-browser-root .mb-empty strong {font:700 18px Georgia,serif;color:#443629}\n  #mini-browser-root .mb-empty p {font-size:12px;max-width:230px;margin:0}\n  #mini-browser-root .mb-edge {\n    position:absolute;z-index:9;touch-action:none;user-select:none;\n    -webkit-user-select:none;background:transparent;\n  }\n  #mini-browser-root .mb-edge-right {right:0;top:49px;bottom:11px;width:12px;cursor:ew-resize}\n  #mini-browser-root .mb-edge-left {left:0;top:49px;bottom:11px;width:10px;cursor:ew-resize}\n  #mini-browser-root .mb-edge-top {top:0;left:25%;right:25%;height:8px;cursor:ns-resize}\n  #mini-browser-root .mb-edge-bottom {bottom:0;left:25%;right:25%;height:12px;cursor:ns-resize}\n  #mini-browser-root .mb-edge-right::after,#mini-browser-root .mb-edge-top::after {\n    content:\"\";position:absolute;background:#a9977e;border-radius:5px;opacity:.8;\n  }\n  #mini-browser-root .mb-edge-right::after {width:3px;height:38px;top:50%;right:3px;transform:translateY(-50%)}\n  #mini-browser-root .mb-edge-top::after {width:42px;height:3px;left:50%;top:2px;transform:translateX(-50%)}\n  #mini-browser-root.mb-compact .mb-edge,\n  #mini-browser-root.mb-bar .mb-edge {display:none!important}\n  #mini-browser-root.mb-resizing iframe {pointer-events:none}\n  @media(max-width:600px) {\n    #mini-browser-root {\n      position:fixed;left:50%;right:auto;top:max(56px,env(safe-area-inset-top,0px) + 52px);\n      bottom:auto;transform:translateX(-50%);\n      width:calc(100vw - 16px);max-width:calc(100vw - 12px);\n      height:min(500px,calc(100dvh - 72px));\n      border-radius:11px;\n    }\n    #mini-browser-root .mb-head {gap:1px;padding:5px 4px}\n    #mini-browser-root .mb-title {font-size:11px;padding:6px 2px}\n    #mini-browser-root .mb-icon {flex-basis:31px;width:31px}\n    #mini-browser-root .mb-edge-right,#mini-browser-root .mb-edge-left {width:14px}\n  }\n  @media(max-width:350px) {\n    #mini-browser-root .mb-icon {flex-basis:28px;width:28px}\n    #mini-browser-root .mb-icon svg {width:18px;height:18px}\n  }";
  document.head.append(Object.assign(make('style'),{textContent:css}));

  const root=make("section");
  root.id="mini-browser-root";
  root.setAttribute("aria-label","Mini Browser HUD");
  const header=make("div","mb-head");
  const title=make("button","mb-title","Mini Browser");
  title.type="button";
  title.title="Minimize Mini into the shared HUD button";
  const icons={
    library:'<svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>',
    external:'<svg viewBox="0 0 24 24"><path d="M5 19 19 5M10 5h9v9"/></svg>',
    compact:'<svg viewBox="0 0 24 24"><rect x="3" y="9" width="18" height="7" rx="1"/></svg>',
    expand:'<svg viewBox="0 0 24 24"><rect x="4" y="3" width="16" height="18" rx="2"/></svg>',
    settings:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3.1"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41m0-14.14-1.41 1.41M6.34 17.66l-1.41 1.41"/></svg>'
  };
  function iconButton(symbol,label){
    const button=make("button","mb-icon");
    button.type="button";button.innerHTML=icons[symbol];
    button.setAttribute("aria-label",label);
    button.title=label;
    return button;
  }
  const libraryButton=iconButton("library","Mini Library · Saved games and homepage");
  const externalButton=iconButton("external","Open current webpage in a new browser tab");
  const compactButton=iconButton("compact","Show compact tracker");
  const expandButton=iconButton("expand","Expanded view · Drag edges to resize");
  const settingsButton=iconButton("settings","Mini settings");
  header.append(title,libraryButton,externalButton,compactButton,expandButton,settingsButton);

  const content=make("div","mb-content");
  const settingsPanel=make("div","mb-settings");
  const settingsHeading=make("h2","","Mini settings");
  const gameHeading=make("h3","","Selected game shortcut");
  const nameLabel=make("label","","Game name");
  const nameInput=make("input");nameInput.type="text";nameInput.placeholder="The Last Hearth";
  nameLabel.append(nameInput);
  const urlLabel=make("label","","Game webpage URL");
  const urlInput=make("input");urlInput.type="url";urlInput.placeholder="https://your-game.example";
  urlLabel.append(urlInput);
  const compactLabel=make("label","","Compact tracker URL · optional");
  const compactInput=make("input");compactInput.type="url";compactInput.placeholder="https://your-game.example/compact";
  compactLabel.append(compactInput);
  const compactHint=make("p","mb-hint","Leave blank to use the game's regular website in the shorter compact window.");
  const addActions=make("div","mb-actions");
  const newButton=make("button","mb-light","＋ New game");
  const saveButton=make("button","","Save changes");
  const removeButton=make("button","mb-light","Remove game");
  addActions.append(newButton,saveButton,removeButton);
  const personalHeading=make("h3","","Mini-wide preferences");
  const homeLabel=make("label","","Hosted Mini homepage URL · optional");
  const homeInput=make("input");homeInput.type="url";homeInput.placeholder="https://mini.example";
  homeLabel.append(homeInput);
  const homeHint=make("p","mb-hint","Until we publish Mini's homepage, the four-square button opens your built-in game library.");
  const heightLabel=make("label","","Compact tracker height");
  const compactRange=make("input");
  compactRange.type="range";compactRange.min="140";compactRange.max="320";compactRange.step="10";
  const heightValue=make("span","","190px");
  heightLabel.append(heightValue,compactRange);
  const globalActions=make("div","mb-actions");
  const savePreferences=make("button","","Save preferences");
  const closeSettings=make("button","mb-light","Back to browser");
  globalActions.append(savePreferences,closeSettings);
  const dataHint=make("p","mb-hint","Mini stores links and layout preferences locally. It does not read chat narration or automatically update game databases. Only open websites you trust.");
  settingsPanel.append(settingsHeading,gameHeading,nameLabel,urlLabel,compactLabel,compactHint,
    addActions,personalHeading,homeLabel,homeHint,heightLabel,globalActions,dataHint);

  const edges={};
  for(const edge of ["left","right","top","bottom"]){
    const handle=make("div","mb-edge mb-edge-"+edge);
    handle.setAttribute("role","separator");
    handle.setAttribute("aria-label","Resize Mini from "+edge+" edge");
    handle.title="Drag to resize";
    handle.tabIndex=0;
    edges[edge]=handle;
  }
  root.append(header,content,settingsPanel,...Object.values(edges));
  document.body.append(root);

  // Upgrade v0.2 saved geometry without resetting browser shortcuts.
  const oldSize=state.windowSize && typeof state.windowSize==="object" ? state.windowSize : {};
  state.windowSize={
    width: Number.isFinite(oldSize.width) ? oldSize.width : 328,
    height: Number.isFinite(oldSize.height) ? oldSize.height : 490,
    left: Number.isFinite(oldSize.left) ? oldSize.left : 12,
    bottom: Number.isFinite(oldSize.bottom) ? oldSize.bottom : 16
  };
  const mobileSize=state.mobileSize && typeof state.mobileSize==="object" ? state.mobileSize : {};
  state.mobileSize={
    width:Number.isFinite(mobileSize.width)?mobileSize.width:Math.min(420,innerWidth-16),
    height:Number.isFinite(mobileSize.height)?mobileSize.height:Math.min(500,innerHeight-100),
    top:Number.isFinite(mobileSize.top)?mobileSize.top:56
  };
  let settingsVisible=false, editing=state.selected;
  let displayedKey=null;
  const clamp=(value,min,max)=>Math.min(max,Math.max(min,value));
  const isMobile=()=>window.innerWidth<=600;
  const readHeight=()=>clamp(state.compactHeight,140,320);
  function applyWindowSize(){
    const mobile=isMobile();
    const stateSize=mobile?state.mobileSize:state.windowSize;
    const maxWidth=Math.max(210,window.innerWidth-16);
    const minWidth=Math.min(235,maxWidth);
    const width=clamp(stateSize.width,minWidth,Math.min(900,maxWidth));
    root.style.width=width+"px";
    if(mobile){
      const top=clamp(stateSize.top,52,Math.max(52,window.innerHeight-160));
      root.style.top=top+"px";
      root.style.bottom="auto";
      root.style.left="50%";
      root.style.transform="translateX(-50%)";
      const height=state.mode==="compact"?readHeight():clamp(stateSize.height,150,Math.max(150,window.innerHeight-top-8));
      root.style.height=height+"px";
    }else{
      const left=clamp(stateSize.left,4,Math.max(4,window.innerWidth-minWidth-4));
      const bottom=clamp(stateSize.bottom,4,Math.max(4,window.innerHeight-170));
      root.style.left=left+"px";
      root.style.right="auto";
      root.style.top="auto";
      root.style.bottom=bottom+"px";
      root.style.transform="none";
      root.style.width=clamp(width,minWidth,window.innerWidth-left-4)+"px";
      const height=state.mode==="compact"?readHeight():clamp(stateSize.height,150,Math.max(150,window.innerHeight-bottom-8));
      root.style.height=height+"px";
    }
  }
  let resizeSession=null;
  function startResize(event,edge){
    if(event.button!==0||state.mode!=="open")return;
    const bounds=root.getBoundingClientRect();
    event.preventDefault();
    event.stopPropagation();
    resizeSession={edge,id:event.pointerId,
      x:event.clientX,y:event.clientY,
      width:bounds.width,height:bounds.height,
      left:state.windowSize.left,bottom:state.windowSize.bottom,top:state.mobileSize.top};
    root.classList.add("mb-resizing");
    event.currentTarget.setPointerCapture(event.pointerId);
  }
  function moveResize(event){
    if(!resizeSession||event.pointerId!==resizeSession.id)return;
    const d=resizeSession,mobile=isMobile();
    const dx=event.clientX-d.x,dy=event.clientY-d.y;
    const target=mobile?state.mobileSize:state.windowSize;
    const widthLimit=Math.min(900,Math.max(235,innerWidth-16));
    if(d.edge==="right"||d.edge==="left"){
      if(mobile){
        const movement=(d.edge==="right"?dx:-dx)*2;
        target.width=clamp(Math.round(d.width+movement),235,widthLimit);
      }else if(d.edge==="right"){
        target.width=clamp(Math.round(d.width+dx),235,Math.max(235,innerWidth-target.left-4));
      }else{
        const rightBoundary=d.left+d.width;
        const proposedLeft=clamp(Math.round(d.left+dx),4,rightBoundary-235);
        target.left=proposedLeft;
        target.width=clamp(rightBoundary-proposedLeft,235,widthLimit);
      }
    }else if(d.edge==="top"){
      if(mobile){
        const newTop=clamp(Math.round(d.top+dy),52,d.top+d.height-150);
        target.top=newTop;
        target.height=clamp(Math.round(d.height-(newTop-d.top)),150,innerHeight-newTop-8);
      }else{
        target.height=clamp(Math.round(d.height-dy),150,Math.max(150,innerHeight-target.bottom-8));
      }
    }else if(d.edge==="bottom"){
      if(mobile){
        target.height=clamp(Math.round(d.height+dy),150,Math.max(150,innerHeight-target.top-8));
      }else{
        const topBoundary=innerHeight-(d.bottom+d.height);
        const newBottom=clamp(Math.round(d.bottom-dy),4,innerHeight-topBoundary-150);
        target.bottom=newBottom;
        target.height=clamp(innerHeight-topBoundary-newBottom,150,innerHeight-newBottom-8);
      }
    }
    applyWindowSize();
  }
  function endResize(event){
    if(!resizeSession||event.pointerId!==resizeSession.id)return;
    resizeSession=null;root.classList.remove("mb-resizing");save();
  }
  for(const [edge,handle] of Object.entries(edges)){
    handle.onpointerdown=event=>startResize(event,edge);
    handle.onpointermove=moveResize;
    handle.onpointerup=endResize;
    handle.onpointercancel=endResize;
    handle.onlostpointercapture=endResize;
    handle.onkeydown=event=>{
      const direction=(edge==="left"||edge==="right")
        ?(event.key==="ArrowRight"?1:event.key==="ArrowLeft"?-1:0)
        :(event.key==="ArrowDown"?1:event.key==="ArrowUp"?-1:0);
      if(!direction||state.mode!=="open")return;
      event.preventDefault();
      const size=isMobile()?state.mobileSize:state.windowSize;
      const mobile=isMobile(),unit=20;
      if(edge==="right")size.width+=direction*unit*(mobile?2:1);
      if(edge==="left")size.width-=direction*unit*(mobile?2:1);
      if(edge==="bottom")size.height+=direction*unit;
      if(edge==="top")size.height-=direction*unit;
      applyWindowSize();save();
    };
  }
  window.addEventListener("resize",applyWindowSize);

  function showMessage(label,message){
    const empty=make("div","mb-empty");
    empty.append(make("strong","",label),make("p","",message));
    const button=make("button","mb-main-action","Configure game");
    button.onclick=()=>openSettings();
    empty.append(button);
    content.replaceChildren(empty);
  }
  function makeLibrary(){
    const list=make("section","mb-library");
    list.append(make("h2","","✦ Mini Library"),
      make("p","","Your games, one tiny window. Choose a game to open its tracker."));
    if(!state.sites.length){
      list.append(make("p","","No games saved yet. Add one from Settings."));
    }
    for(const site of state.sites){
      const card=make("button","mb-library-card");
      card.type="button";
      const left=make("span");
      left.append(make("b","",site.name),make("small","",validUrl(site.url)?"Open tracker":"Awaiting game website"));
      card.append(left,make("span","","›"));
      card.onclick=()=>{state.selected=site.id;state.view="game";save();render();};
      list.append(card);
    }
    const addGame=make("button","mb-main-action","＋ Add game");
    addGame.onclick=()=>{openSettings();startNewGame();};
    list.append(addGame,make("p","mb-hint","The hosted Mini homepage is planned. This built-in library works in the meantime."));
    content.replaceChildren(list);
  }
  function iframeFor(url,label){
    const key="iframe|"+url;
    if(displayedKey===key&&content.querySelector("iframe"))return;
    const iframe=make("iframe");
    iframe.title=label;
    iframe.src=url;
    iframe.loading="lazy";
    iframe.referrerPolicy="strict-origin-when-cross-origin";
    content.replaceChildren(iframe);
    displayedKey=key;
  }
  function renderContent(){
    if(state.view==="library"){
      if(validUrl(state.homeUrl))iframeFor(state.homeUrl,"Mini Library homepage");
      else {makeLibrary();displayedKey="library";}
      return;
    }
    const site=currentSite();
    if(!site){state.view="library";makeLibrary();displayedKey="library";return;}
    const url=state.mode==="compact"&&validUrl(site.compactUrl)?site.compactUrl:site.url;
    if(validUrl(url)) iframeFor(url,site.name+" tracker");
    else{
      if(displayedKey!=="empty|"+site.id){
        showMessage(site.name,"This game doesn't have a website yet. Add its address in Settings.");
        displayedKey="empty|"+site.id;
      }
    }
  }
  function activeURL(){
    if(state.view==="library")return validUrl(state.homeUrl)?state.homeUrl:"";
    const site=currentSite();
    const url=state.mode==="compact"&&validUrl(site?.compactUrl)?site.compactUrl:site?.url;
    return validUrl(url)?url:"";
  }
  function render(){
    state.mode=["open","compact","bar"].includes(state.mode)?state.mode:"open";
    root.classList.toggle("mb-compact",state.mode==="compact");
    root.classList.toggle("mb-bar",state.mode==="bar");
    applyWindowSize();
    libraryButton.classList.toggle("mb-active",state.view==="library"&&!settingsVisible);
    compactButton.classList.toggle("mb-active",state.mode==="compact");
    expandButton.classList.toggle("mb-active",state.mode==="open");
    settingsButton.classList.toggle("mb-active",settingsVisible);
    const site=currentSite();
    title.textContent="Mini Browser";
    externalButton.disabled=!activeURL();
    externalButton.title=externalButton.disabled?"No hosted webpage to open yet":"Open current webpage in a new tab";
    settingsPanel.style.display=settingsVisible?"block":"none";
    content.style.display=settingsVisible?"none":"block";
    if(!settingsVisible)renderContent();
    syncMiniIntegration();
  }
  function openSettings(){
    settingsVisible=true;
    editing=state.selected;
    const site=currentSite();
    nameInput.value=site?.name||"";
    urlInput.value=site?.url||"";
    compactInput.value=site?.compactUrl||"";
    homeInput.value=state.homeUrl;
    compactRange.value=String(readHeight());
    heightValue.textContent=readHeight()+"px";
    if(state.mode==="bar")state.mode="open";
    render();
  }
  function startNewGame(){
    editing=null;
    nameInput.value="";
    urlInput.value="";
    compactInput.value="";
    nameInput.focus();
  }
  function closePanel(){
    settingsVisible=false;
    render();
  }
  function validateURL(value){
    return !value||validUrl(value);
  }
  function saveGame(){
    const name=nameInput.value.trim();
    const url=urlInput.value.trim(),compactUrl=compactInput.value.trim();
    if(!name){alert("Please give this game a name.");return;}
    if(!validateURL(url)||!validateURL(compactUrl)){
      alert("Use an HTTPS webpage address (or localhost for development).");return;
    }
    if(editing&&state.sites.some(s=>s.id===editing)){
      state.sites=state.sites.map(s=>s.id===editing?{...s,name,url,compactUrl}:s);
      state.selected=editing;
    }else{
      const id="game-"+Date.now();
      state.sites.push({id,name,url,compactUrl});
      state.selected=id;
    }
    state.view="game";
    save();closePanel();
  }
  function removeGame(){
    if(!editing||!state.sites.some(s=>s.id===editing))return;
    if(!confirm("Remove this game shortcut? Game data and websites are not deleted."))return;
    state.sites=state.sites.filter(s=>s.id!==editing);
    state.selected=state.sites[0]?.id||null;
    state.view="library";
    save();closePanel();
  }
  function saveGlobal(){
    const value=homeInput.value.trim();
    if(!validateURL(value)){alert("Use an HTTPS Mini homepage address.");return;}
    state.homeUrl=value;
    state.compactHeight=Number(compactRange.value);
    save();closePanel();
  }
  title.onclick=()=>{settingsVisible=false;state.mode="bar";save();render();};
  libraryButton.onclick=()=>{
    settingsVisible=false;
    state.view="library";
    save();render();
  };
  externalButton.onclick=()=>{
    const url=activeURL();
    if(url)window.open(url,"_blank","noopener,noreferrer");
  };
  compactButton.onclick=()=>{
    settingsVisible=false;
    state.mode="compact";
    save();render();
  };
  expandButton.onclick=()=>{
    settingsVisible=false;
    state.mode="open";
    save();render();
  };
  settingsButton.onclick=()=>settingsVisible?closePanel():openSettings();
  newButton.onclick=startNewGame;
  saveButton.onclick=saveGame;
  removeButton.onclick=removeGame;
  closeSettings.onclick=closePanel;
  savePreferences.onclick=saveGlobal;
  compactRange.oninput=()=>{heightValue.textContent=compactRange.value+"px";};

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
