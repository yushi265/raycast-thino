/// <reference types="@raycast/api">

/* 🚧 🚧 🚧
 * This file is auto-generated from the extension's manifest.
 * Do not modify manually. Instead, update the `package.json` file.
 * 🚧 🚧 🚧 */

/* eslint-disable @typescript-eslint/ban-types */

type ExtensionPreferences = {
  /** Vault Path - Obsidian vault のフルパス */
  "vaultPath": string,
  /** Daily Note Folder - vault 内のデイリーノートフォルダの相対パス */
  "dailyNoteFolder": string,
  /** Daily Note Template Path - vault 内のデイリーノートテンプレートの相対パス（拡張子なし） */
  "templatePath": string
}

/** Preferences accessible in all the extension's commands */
declare type Preferences = ExtensionPreferences

declare namespace Preferences {
  /** Preferences accessible in the `add-memo` command */
  export type AddMemo = ExtensionPreferences & {}
}

declare namespace Arguments {
  /** Arguments passed to the `add-memo` command */
  export type AddMemo = {}
}

