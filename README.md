# Clipboard history

A DeepSeek Harness Web plugin that keeps a searchable history of text copied inside the DSH Web app.

## What it does

- Adds a **Clipboard history** button beside **Settings** at the sidebar foot (icon only when the sidebar is collapsed).
- Records text copied with the normal copy/cut actions and with in-app copy buttons.
- Opens a panel where you can search the history, click an entry to copy it again, pin an entry, delete a single entry, or clear everything (the clear action asks for confirmation).
- Keeps up to 200 entries and 20 000 characters per entry. Pinning protects an entry from being pushed out while new copies arrive, but the history never holds more than 200 entries. Copying the same text again moves that entry to the top instead of duplicating it.

## Data and limits

- History lives only in the Web app's `localStorage`, under the key `dsh.clipboard-history.v1`. It stays on this machine and is never sent to the Host or a server.
- Entries are kept as plain text until you clear them, so treat the panel like a log: use **Clear all** to wipe the history (browser site data can be cleared too).
- Only copies made inside the DSH Web app are captured. Copies made in other applications do not appear in the history.
- Clearing browser site data for the DSH Web app also clears the history.

## Install

Install the package directory as a bundle (for example with the plugin manager's `install_bundle` action and this directory as the target). The bundle registers one Host row, `@local/clipboard-history`, from `cordis.patch.yml`, and the client half loads with the Web app.

## Development

- `index.js` — Host half; it only exists so the bundle can register the client module.
- `client.js` — the Web client module: capture, storage, sidebar footer action, and overlay panel.
- `locale/en.json`, `locale/zh.json` — display metadata shown in the plugin manager.

The icon at `icon.svg` is original artwork created for this plugin (clipboard glyph, blue gradient body, light clip and page lines). It is sampled from the same blue as the DSH brand accent.
