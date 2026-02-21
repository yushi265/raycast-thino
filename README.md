# raycast-thino

Raycast extension to add [Thino](https://github.com/Quorafind/Obsidian-Thino)-compatible timestamped memos to Obsidian daily notes.

## Features

- Add a memo with an auto-generated `HH:mm` timestamp to today's daily note
- Multi-line memo support
- Tag picker (auto-collected from your vault)
- Auto-creates today's daily note from a Templater template if it doesn't exist

## Installation

1. Clone or download this repository
2. Install dependencies: `pnpm install`
3. Build: `pnpm build`
4. Import in Raycast: **Extensions → Add Script Directory**

## Preferences

| Preference | Description | Required | Default |
|---|---|---|---|
| `Vault Path` | Full path to your Obsidian vault | ✅ | — |
| `Daily Note Folder` | Relative path to the daily note folder | — | `00_Journals/01_Daily` |
| `Daily Note Template Path` | Relative path to the template (without `.md`) | — | `99_Templates/01_DailyNote` |

## Memo Format

Follows the Thino memo format written to the daily note:

```markdown
# Thino
- 09:30 Single-line memo #tag
- 14:00
	Multi-line memo
	second line
```

## Requirements

- [Raycast](https://www.raycast.com/)
- [Obsidian](https://obsidian.md/) with the [Thino](https://github.com/Quorafind/Obsidian-Thino) plugin

## License

MIT
