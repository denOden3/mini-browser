# Mini Browser 🎲

A universal, lightweight companion for chat-first roleplaying games. Mini now renders game-configured native panels rather than relying on iframe embedding. The separate Mini Library website is the game-save editor. The specialized Mizuhana and Paths to Immortality HUDs remain independent.

## v0.4.0 — Native, game-defined HUD menus

**No external iframe is needed for game data.** The Mini Library website is the editor and local save, while Mini renders safe, native game panels using the saved menu configuration.

- From the **website's Game Save** page, open **Mini HUD · Customize your game menus**. Add/remove/rename menus and add widgets within each menu. A widget can read any saved game field, such as current scene, relationships, cash, inventory, journal, or custom notes. Supported formats: text, stat tiles, list, label-value rows, and journal events.
- Choose which menu appears in **compact tracker** mode.
- On the **same browser where Tampermonkey is installed**, open or refresh `https://denoden3.github.io/mini-browser/` at least once **after installing Mini v0.4.0**. The userscript now also runs on the Mini website and copies the locally saved game library into Tampermonkey storage.
- Return to ChatGPT. Use Mini's **four-square icon** for the game list. Choose a game, then select its own menu tabs; compact mode uses its chosen compact menu. Changes saved on the website can sync to Mini through a Tampermonkey storage listener, or by returning to the chat tab and reopening Mini.
- The **↗** arrow opens the full website to edit your game or generate a continuation prompt.

**Important:** This is **same-browser local synchronization**, not internet/cloud synchronization. If you edit a save on another device, another browser or a different browser profile, Mini cannot see it until the save is imported there. Website localStorage and Tampermonkey extension storage can both be lost when browser data is cleared. Keep JSON backups. Supabase authentication, cloud saves, event-level auto-updates from narration and cross-device support are future milestones.

Mini's native renderer accepts only an allowlist of widget types and game fields, creating DOM text nodes rather than evaluating arbitrary HTML or scripts. Existing PTI and Mizuhana HUD code was not modified.

## v0.3.4 — diagnose blocked website embedding

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

Mini now includes default links to the hosted GitHub Pages homepage:
- Library: `https://denoden3.github.io/mini-browser/`
- The Last Hearth full save: `https://denoden3.github.io/mini-browser/?game=the-last-hearth`
- The Last Hearth compact tracker: `https://denoden3.github.io/mini-browser/?game=the-last-hearth&view=compact`

On an existing Tampermonkey installation, missing URLs are filled automatically without overwriting existing custom links. **Save & open library** saves the settings then displays the homepage, rather than silently returning to the game view. The four-square button opens the library at any time.

**Data warning:** The current Mini Library still stores story saves in local browser storage, not yet Supabase. The same site's data may not be shared between a standalone tab and a ChatGPT-embedded iframe in browsers that partition third-party storage. Use the backup/export feature and do not rely on it as a cloud-synced record.

## Troubleshooting a blank Mini webpage

Mini displays external game websites through an iframe. ChatGPT's framing policy, the destination website's frame headers, or browser restrictions can prevent an iframe from rendering, even when the same URL works in a normal tab.

Mini v0.3.4 includes a light readiness handshake for its own GitHub Pages homepage. If the hosted Mini page has not signaled readiness within 6.5 seconds, Mini stops showing an empty white iframe and displays its **built-in game library**, including an **Open website in a tab** and **Retry inside Mini** option. This is a fallback, not a bypass for browser security settings.

To diagnose: first open `https://denoden3.github.io/mini-browser/` directly. If it works in a regular tab but not Mini, embedded framing or third-party browser restrictions are the likely cause. Never disable ChatGPT security headers to work around it. Future Mini panels can render Supabase-backed data natively in the userscript rather than requiring cross-origin iframe embedding.

## Mini homepage and game saves (first prototype)

The repository now has **`index.html`**: a responsive, standalone Mini Library homepage. It includes:

- A game library, starting with **The Last Hearth** seeded from the current Day 6 checkpoint.
- Editable story canon, player/character rules, ongoing scene, NPCs, inventory, treasury and quests.
- A journal for important story events, plus manually created save points.
- **Generate Continuation**: build and copy a new-chat prompt from the current saved fields and recent journal entries.
- Export/import JSON backups to carry saves between devices or browsers.
- A compact tracker view at **`?view=compact`** for the HUD, with a normal full view at the site root.

**Important limitations:** The prototype stores saves in the site's browser `localStorage`, not Supabase. Clearing site data, using another browser, or having different embedded storage partitions can leave saves inaccessible until a JSON backup is imported. The home page must be deployed to an HTTPS URL before Mini can embed it; opening `index.html` on GitHub shows source, not the live site. Narration does not sync to the website automatically. If hosting publicly, assume the shipped HTML and its seeded story recap are public, even if the GitHub repository is private.

Once the site is hosted, set Mini **Settings → Mini homepage URL** to its HTTPS address, and The Last Hearth's full/compact URLs to the hosted root and `?game=the-last-hearth&view=compact`. An authenticated cloud-save and verified narration event writer are future steps.

## Files

- `mini-browser.user.js` — universal Tampermonkey HUD
- `index.html` — Mini Library homepage, local game saves, prompt generator and JSON backups
- `index.html` — Mini Library homepage and continuation save prototype
- `examples/last-hearth/index.html` — older **static** Last Hearth tracker demo, not a live database

## Planned connections

Mini will eventually open a hosted library website and each game's tracker. The Last Hearth is our first integration; **Mizuhana and Paths to Immortality are untouched**. Database updates from narration are not yet automatic. Each game needs an authorized game-state writer, an event history, and a way for its webpage to read live data.

## Safety and compatibility

Some webpages block iframe embedding, and some logins don't function inside frames. Use ↗ for those sites. Mini stores its shortcuts locally in Tampermonkey and doesn't read roleplay narration. Keep database service-role keys and other private credentials outside browser scripts.
