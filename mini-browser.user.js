// ==UserScript==
// @name         Mini Browser — Universal Roleplay HUD
// @namespace    mini-browser.chat-rpg
// @version      0.3.3
// @description  Universal mini game tracker with shared HUD picker and resizable website panel.
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
  const KEY = "mini-browser-state-v1";
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
    "#mb-shared-launcher .mb-menu button:disabled{opacity:.5;cursor:not-allowed}"
  ];
  document.head.append(Object.assign(el("style"),{textContent:styles.join("\n")}));

  const root=el("section");root.id="mini-browser-root";
  root.setAttribute("aria-label","Mini Browser HUD");
  const head=el("div","mb-head");
  const title=el("button","mb-title","Mini Browser");
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
  function inputField(text,placeholder){
    const label=el("label","",text);
    const input=el("input");input.type="url";input.placeholder=placeholder;
    label.append(input);settings.append(label);return input;
  }
  const homeField=inputField("Mini homepage URL (future website)","https://mini-home.example");
  const nameLabel=el("label","","Game name");
  const nameField=el("input");nameField.placeholder="The Last Hearth";
  nameLabel.append(nameField);settings.append(nameLabel);
  const urlField=inputField("Full webpage URL","https://your-game.example");
  const compactField=inputField("Compact tracker URL (optional)","https://your-game.example/compact");
  const heightLabel=el("label","","Compact tracker height");
  const heightField=el("input");heightField.type="range";heightField.min="140";
  heightField.max="320";heightField.step="10";
  heightField.value=String(clamp(state.compactHeight||185,140,320));
  const heightPreview=el("span","mb-note",heightField.value+" px");
  heightField.addEventListener("input",()=>heightPreview.textContent=heightField.value+" px");
  heightLabel.append(heightField,heightPreview);settings.append(heightLabel);
  const actions=el("div","mb-actions");
  const add=el("button","","New game");
  const store=el("button","","Save & open library");
  const remove=el("button","","Remove");
  actions.append(add,store,remove);
  settings.append(actions,el("p","mb-note",
    "☼ Settings stores game links, optional per-game compact tracker pages, compact height, and the future homepage URL. If no compact URL is set, Mini shows the game page in a shorter window. Saved locally in Tampermonkey."));
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

  let settingsVisible=false,editing=state.selected;
  function activeUrl(){
    if(state.view==="library")return valid(state.homeUrl)?state.homeUrl:"";
    const s=site();
    const url=state.mode==="compact"&&valid(s?.compactUrl)?s.compactUrl:s?.url;
    return valid(url)?url:"";
  }
  function frame(url,label){
    const existing=content.querySelector("iframe");
    if(existing&&existing.getAttribute("src")===url)return;
    const iframe=el("iframe");iframe.title=label;iframe.src=url;
    iframe.loading="lazy";iframe.referrerPolicy="strict-origin-when-cross-origin";
    content.replaceChildren(iframe);
  }
  function showSite(){
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