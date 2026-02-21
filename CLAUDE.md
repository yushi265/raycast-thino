# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Overview

A Raycast extension (TypeScript/React) that appends Thino-compatible memos to an Obsidian daily note file.

## Key Commands

```bash
pnpm install     # install dependencies
pnpm dev         # develop (hot reload in Raycast)
pnpm build       # production build
pnpm lint        # lint
pnpm fix-lint    # lint --fix
```

> Node.js is required. Use `nix-shell -p nodejs` if not installed.

## File Structure

```
src/
  add-memo.tsx   # Raycast command (Form UI)
  utils.ts       # Pure logic: path resolution, template rendering, memo formatting, tag collection
assets/
  extension-icon.png
```

## Thino Memo Format

Single-line:
```
- HH:mm content #tag \n
```

Multi-line (timestamp alone on first line, content tab-indented):
```
- HH:mm \n\tcontent line1 \n\tcontent line2 \n
```

Trailing space after each content line is intentional (Thino requirement).

## Templater Syntax

`utils.ts` resolves Templater syntax manually (no Obsidian runtime available). Supported patterns are in `resolveTemplaterSyntax()`. If new template variables are needed, add them there.

## Preferences

Defined in `package.json` under `preferences`:
- `vaultPath` — full path to Obsidian vault
- `dailyNoteFolder` — relative path inside vault (default: `00_Journals/01_Daily`)
- `templatePath` — relative path to template without `.md` (default: `99_Templates/01_DailyNote`)

## Notes

- Do not add a `default` value with a local path to `vaultPath` in `package.json`
- Keep `@raycast/api` version in sync with the installed version in `pnpm-lock.yaml`
