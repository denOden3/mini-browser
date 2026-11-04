# Mini Browser 🎲

A universal, lightweight website HUD for chat-first roleplaying games. Mini displays each game's own website and does not replace the specialized Mizuhana or Paths to Immortality HUDs.

## v0.3.2 — sketch-based UI

**Header controls (left → right):**
- **Mini Browser title** — minimize the panel into the shared top-center HUD capsule. Use the shared capsule to switch between Mini, Paths and Mizuhana.
- **Four-square grid** — open the Mini game library. Until we build its website, Mini displays a built-in list of saved games. Later the Library button can open a configured homepage URL.
- **↗ External arrow** — open the currently displayed website in a separate browser tab; disabled when no website URL exists.
- **▭ Compact** — show a short game tracker. Each game can provide its own compact tracker URL; if not configured, Mini shows the regular site in the shorter frame.
- **□ Expanded** — show a resizable website panel.
- **☼ Settings** — edit the future Mini homepage URL, add/rename/remove game shortcuts, set each game's full/compact webpage URLs, and adjust the compact tracker height (140–320 pixels).

**Positioning and resizing:**
- On **desktop**, Mini floats over the left ChatGPT sidebar, away from the composer. Drag its **right edge** for width, or **top edge** for expanded height. The dimensions are saved.
- On **mobile**, Mini appears **top-center immediately below the browser toolbar, overlaying ChatGPT's native menu row**, like Mizuhana. Click the Mini Browser title to minimize into the shared HUD capsule whenever you want to access ChatGPT menus. In expanded mode, drag the **right edge** for width or the **bottom edge** for height. Its center stays aligned while resizing.
- Compact mode has an adjustable short height in Settings. The full/expanded mode supports edge dragging.
- The title minimizes directly to the shared capsule, rather than cycling through display sizes.

## Install / update

1. Install **Tampermonkey** and enable it for ChatGPT.
2. Open [the latest userscript](https://github.com/denOden3/mini-browser/raw/main/mini-browser.user.js) and approve Tampermonkey's Install/Update screen.
3. Reload ChatGPT, open the shared top-center HUD menu (long-press/right-click), and choose **◈ Mini Browser**.
4. Use the **four-square grid** to browse saved games or **☼** to configure website links and compact tracker height.

With this **private GitHub repository**, Tampermonkey's automatic update checks may not always authenticate. The link above remains the preferred one-click update route when your browser recognizes the userscript.

## Mini Library homepage (initial version)

The repository root now contains **`index.html`**, the first Mini Library homepage. It's a standalone, responsive, offline-first website:

- Saved games list, with **The Last Hearth** preloaded as a draft save;
- Editable roleplay contract, world canon, characters/NPCs, checkpoint, scene, inventory, finances, and quests;
- Event journal and local save points;
- Generate and copy a continuation prompt for a new ChatGPT conversation;
- JSON import/export for portable backups;
- A compact three-stat tracker via `?view=compact`.

**Storage scope:** This version stores state in the **browser's local storage**, not in GitHub, ChatGPT, or Supabase. It won't automatically sync between devices or update after each narration. In an embedded iframe, browser third-party storage restrictions can prevent or partition saves; keep JSON backups until we implement authenticated cloud storage. Treat the preloaded Last Hearth facts as an editable draft rather than an automatically verified current game state.

**Hosting:** This source file is committed, but an accessible hosted homepage URL must be established before Mini's iframe can display it. The repository is private, so do not assume that GitHub Pages is available or enabled. When hosted, configure Mini Settings → Mini homepage URL to that verified HTTPS address. For a specific game's compact tracker, use the same origin with `?view=compact&game=the-last-hearth`.

## Files

- `mini-browser.user.js` — universal Tampermonkey HUD
- `index.html` — Mini Library homepage and continuation save prototype
- `examples/last-hearth/index.html` — older **static** Last Hearth tracker demo, not a live database

## Planned connections

Mini will eventually open a hosted library website and each game's tracker. The Last Hearth is our first integration; **Mizuhana and Paths to Immortality are untouched**. Database updates from narration are not yet automatic. Each game needs an authorized game-state writer, an event history, and a way for its webpage to read live data.

## Safety and compatibility

Some webpages block iframe embedding, and some logins don't function inside frames. Use ↗ for those sites. Mini stores its shortcuts locally in Tampermonkey and doesn't read roleplay narration. Keep database service-role keys and other private credentials outside browser scripts.
