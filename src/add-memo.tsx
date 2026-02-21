import { Form, ActionPanel, Action, showToast, Toast, getPreferenceValues, closeMainWindow, popToRoot } from "@raycast/api";
import * as fs from "fs";
import { useState, useEffect } from "react";
import {
  getDailyNotePath,
  createDailyNote,
  appendMemo,
  formatMemo,
  getCurrentTimestamp,
  collectTags,
} from "./utils";

interface Preferences {
  vaultPath: string;
  dailyNoteFolder: string;
  templatePath: string;
}

interface FormValues {
  memo: string;
  tags: string[];
}

export default function AddMemoCommand() {
  const [tags, setTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);

  useEffect(() => {
    const prefs = getPreferenceValues<Preferences>();
    const collected = collectTags(prefs.vaultPath);
    setAvailableTags(collected);
  }, []);

  async function handleSubmit(values: FormValues) {
    const memo = values.memo.trim();
    if (!memo) {
      await showToast({ style: Toast.Style.Failure, title: "メモが空です" });
      return;
    }

    const prefs = getPreferenceValues<Preferences>();
    const vaultPath = prefs.vaultPath;
    const dailyNoteFolder = prefs.dailyNoteFolder || "00_Journals/01_Daily";
    const templatePath = prefs.templatePath || "99_Templates/01_DailyNote";

    const today = new Date();
    const filePath = getDailyNotePath(vaultPath, dailyNoteFolder, today);

    try {
      // デイリーノートが存在しなければテンプレートから生成
      if (!fs.existsSync(filePath)) {
        await showToast({ style: Toast.Style.Animated, title: "デイリーノートを作成中..." });
        createDailyNote(filePath, vaultPath, templatePath, today);
      }

      const timestamp = getCurrentTimestamp();
      const memoText = formatMemo(memo, timestamp, values.tags);

      appendMemo(filePath, memoText);

      await showToast({
        style: Toast.Style.Success,
        title: "メモを追加しました",
        message: `${timestamp} ${memo.split("\n")[0]}`,
      });

      await closeMainWindow();
      await popToRoot();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      await showToast({ style: Toast.Style.Failure, title: "エラー", message });
    }
  }

  return (
    <Form
      navigationTitle="Add Thino Memo"
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Add Memo" onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.Description text="📝 Obsidian デイリーノートに Thino メモを追記します" />
      <Form.TextArea
        id="memo"
        title="Memo"
        placeholder={"メモを入力... (Cmd+Enter で送信)"}
        autoFocus
      />
      <Form.TagPicker id="tags" title="Tags" value={tags} onChange={setTags}>
        {availableTags.map((tag) => (
          <Form.TagPicker.Item key={tag} value={tag} title={tag} />
        ))}
      </Form.TagPicker>
    </Form>
  );
}
