# Mini Browser 🎲

A lightweight, reusable mini-browser HUD for chat-first roleplaying games.

**Design principle:** Mini displays game websites. It does **not** duplicate the game's inventory, finances, or other source-of-truth data, and it does **not** read ChatGPT narration automatically.

## Current prototype (v0.2)

- `mini-browser.user.js` — Tampermonkey userscript that overlays ChatGPT.
- `examples/last-hearth/index.html` — independent, static Last Hearth tracker demo.
- Three viewing modes: **Full** (embedded website), **Compact** (short game-summary viewport), and **Title only**.
- The Mini Browser option is injected into the **existing Paths/Mizuhana top HUD switcher menus**. Inactive Mini adds no floating panel. When minimized, Mini uses a single top capsule in the same position as the other HUDs. No changes are made to the Paths or Mizuhana userscripts.
- Add, rename, remove, and select game-website shortcuts.
- Website shortcuts persist locally in Tampermonkey.
- External-link action opens the game website in its own browser tab.

The Last Hearth is the **first test case**. Mizuhana and Paths to Immortality are intentionally not modified or integrated.

## Install the HUD

1. Install and enable the **Tampermonkey** browser extension.
2. Open the raw `mini-browser.user.js` file on GitHub, copy its contents, and create a new Tampermonkey userscript by pasting that code.
3. Save the userscript and open or reload `https://chatgpt.com/`.
4. With the other HUDs installed, first locate their **top-center HUD capsule**. Mini stays hidden until you choose it, so it won't clutter the screen.
5. Collapse Paths/Mizuhana to their top capsule (if necessary), then **long-press or right-click the capsule** and select **◈ Mini Browser**. If no other HUD is loaded, Mini provides its own top capsule.
6. When Mini opens, click **⚙** to set the HTTPS address of a **hosted** tracker website.
7. Click the Mini title to cycle between Full → Compact → Title only. The **▤** control toggles Compact view directly. In title-only mode, **Mini Browser** appears as a top capsule; long-press/right-click that capsule to switch back to Paths or Mizuhana.

> Opening the demo HTML directly from your computer is suitable for previewing the example page, but the Mini HUD accepts HTTPS websites (or local development servers), not `file://` paths. We'll deploy a hosted tracker later.

## Updating an existing installation

Tampermonkey must install the new version before changes appear locally. With this **private** GitHub repository, automatic `@updateURL` checks may fail due to authentication. If the version does not update automatically, open `mini-browser.user.js` on GitHub, copy its full contents, replace the script body in Tampermonkey's editor, save, then reload ChatGPT. Do not create a second installed copy of the same script.

## How this is meant to evolve

```text
Our roleplay in ChatGPT
        ↓
Verified game-state event (unique ID; confirmed values only)
        ↓
Game-specific database (planned: Supabase)
        ↓
Game-specific tracker webpage
        ↓
Mini Browser embedded frame
```

The game tracker webpage owns the visual menus and compact-mode design. The HUD merely displays it. This lets different games have different panels while using a single universal browser.

**Database synchronization is not implemented yet.** A narration turn does not automatically create a record in Supabase. This requires an authorized write integration or a separately built bridge, with duplicate prevention, event history and error reporting.

## Security and limitations

- Add only websites you trust to the Mini HUD.
- Some websites prevent iframe embedding through `X-Frame-Options` or CSP `frame-ancestors`; use **↗** to open those sites directly.
- Embedded login may be blocked by browser third-party-cookie restrictions.
- Do not put service-role keys or other private database credentials in a public website or userscript.
- The example tracker contains static demonstration data and does not update on its own.
- Project remains private while we experiment.

## Next milestone

Build and host the actual Last Hearth tracker website, then design a separate game database and a safe narration-to-database update path.
