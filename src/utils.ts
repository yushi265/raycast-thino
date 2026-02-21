import * as fs from "fs";
import * as path from "path";

// ────────────────────────────────────────────────
// 日付ユーティリティ
// ────────────────────────────────────────────────

export function getISOWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7; // 日曜=7 に正規化
  d.setUTCDate(d.getUTCDate() + 4 - dayNum); // 当週の木曜日
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

export function getJapaneseDayName(date: Date): string {
  const days = ["日曜日", "月曜日", "火曜日", "水曜日", "木曜日", "金曜日", "土曜日"];
  return days[date.getDay()];
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function formatDate(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

function addDays(date: Date, delta: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + delta);
  return d;
}

// ────────────────────────────────────────────────
// デイリーノートパス解決
// ────────────────────────────────────────────────

export function getDailyNotePath(vaultPath: string, dailyNoteFolder: string, date?: Date): string {
  const d = date ?? new Date();
  const filename = `${formatDate(d)}.md`;
  return path.join(vaultPath, dailyNoteFolder, filename);
}

// ────────────────────────────────────────────────
// Templater 構文の手動解決
// ────────────────────────────────────────────────

function resolveTemplaterSyntax(template: string, date: Date): string {
  const yyyy = String(date.getFullYear());
  const mm = pad2(date.getMonth() + 1);
  const dd = pad2(date.getDate());
  const week = pad2(getISOWeekNumber(date));
  const jaDay = getJapaneseDayName(date);
  const yesterday = formatDate(addDays(date, -1));
  const tomorrow = formatDate(addDays(date, 1));

  return template
    // 前日リンク: tp.date.now("YYYY-MM-DD", -1, ...)
    .replace(/<% tp\.date\.now\("YYYY-MM-DD",\s*-1[^%]*%>/g, yesterday)
    // 翌日リンク: tp.date.now("YYYY-MM-DD", 1, ...)
    .replace(/<% tp\.date\.now\("YYYY-MM-DD",\s*1[^%]*%>/g, tomorrow)
    // 週番号: tp.date.now("YYYY-MM-[W]ww")
    .replace(/<% tp\.date\.now\("YYYY-MM-\[W\]ww"\) %>/g, `${yyyy}-${mm}-W${week}`)
    // 年月: tp.date.now("YYYY-MM")
    .replace(/<% tp\.date\.now\("YYYY-MM"\) %>/g, `${yyyy}-${mm}`)
    // 年: tp.date.now("YYYY")
    .replace(/<% tp\.date\.now\("YYYY"\) %>/g, yyyy)
    // 日本語日付: tp.date.now("YYYY年MM月DD日")
    .replace(/<% tp\.date\.now\("YYYY年MM月DD日"\) %>/g, `${yyyy}年${mm}月${dd}日`)
    // 曜日: tp.date.now("dddd")
    .replace(/<% tp\.date\.now\("dddd"\) %>/g, jaDay)
    // デフォルト: tp.date.now() → YYYY-MM-DD
    .replace(/<% tp\.date\.now\(\) %>/g, `${yyyy}-${mm}-${dd}`);
}

// ────────────────────────────────────────────────
// デイリーノート新規作成
// ────────────────────────────────────────────────

export function createDailyNote(filePath: string, vaultPath: string, templateRelPath: string, date: Date): void {
  const templatePath = path.join(vaultPath, `${templateRelPath}.md`);

  let content: string;
  if (fs.existsSync(templatePath)) {
    const raw = fs.readFileSync(templatePath, "utf-8");
    content = resolveTemplaterSyntax(raw, date);
  } else {
    // フォールバック: テンプレートがない場合の最小構成
    const yyyy = String(date.getFullYear());
    const mm = pad2(date.getMonth() + 1);
    const dd = pad2(date.getDate());
    const week = pad2(getISOWeekNumber(date));
    const jaDay = getJapaneseDayName(date);
    const yesterday = formatDate(addDays(date, -1));
    const tomorrow = formatDate(addDays(date, 1));

    content = [
      "---",
      `created: ${yyyy}-${mm}-${dd}`,
      "tags:",
      '  - "#Daily"',
      "---",
      "---",
      `← [[${yesterday}]] | [[${tomorrow}]] →`,
      `週: [[${yyyy}-${mm}-W${week}]]`,
      `月: [[${yyyy}-${mm}]]`,
      `年: [[${yyyy}]]`,
      "",
      "---",
      `# 📅 ${yyyy}年${mm}月${dd}日 (${jaDay})`,
      `#${yyyy}-${mm}`,
      "",
      "# トレーニング",
      "なし",
      "",
      "# Thino",
      "",
    ].join("\n");
  }

  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, "utf-8");
}

// ────────────────────────────────────────────────
// メモ整形
// ────────────────────────────────────────────────

export function formatMemo(content: string, timestamp: string, tags?: string[]): string {
  const lines = content.split("\n");
  const nonEmpty = lines.filter((l) => l.trim() !== "");

  if (nonEmpty.length === 0) return "";

  const tagSuffix = tags && tags.length > 0 ? tags.join(" ") : "";

  if (nonEmpty.length === 1) {
    // 単一行: "- HH:mm 内容 #tag1 #tag2 \n"
    const line = tagSuffix ? `${nonEmpty[0]} ${tagSuffix}` : nonEmpty[0];
    return `- ${timestamp} ${line} \n`;
  }

  // 複数行: 1行目はタイムスタンプのみ、2行目以降タブインデント
  const indented = nonEmpty.map((l) => `\t${l} `).join("\n");
  if (tagSuffix) {
    return `- ${timestamp} \n${indented}\n\t${tagSuffix} \n`;
  }
  return `- ${timestamp} \n${indented}\n`;
}

// ────────────────────────────────────────────────
// タグ収集
// ────────────────────────────────────────────────

export function collectTags(vaultPath: string): string[] {
  const tagPattern = /#([a-zA-Z\u3040-\u9FFF][\w\u3040-\u9FFF-]*)/g;
  const excludePattern = /^(Daily|Weekly|Monthly|\d{4}-\d{2})$/;
  const tagSet = new Set<string>();

  function scanDir(dirPath: string): void {
    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(dirPath, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        if (!entry.name.startsWith(".")) scanDir(fullPath);
      } else if (entry.isFile() && entry.name.endsWith(".md")) {
        try {
          const content = fs.readFileSync(fullPath, "utf-8");
          tagPattern.lastIndex = 0;
          let match: RegExpExecArray | null;
          while ((match = tagPattern.exec(content)) !== null) {
            const tag = match[1];
            if (!excludePattern.test(tag)) {
              tagSet.add(`#${tag}`);
            }
          }
        } catch {
          // 読み取れないファイルはスキップ
        }
      }
    }
  }

  scanDir(vaultPath);
  return Array.from(tagSet).sort();
}

// ────────────────────────────────────────────────
// ファイル末尾への追記
// ────────────────────────────────────────────────

export function appendMemo(filePath: string, memoText: string): void {
  const existing = fs.readFileSync(filePath, "utf-8");

  // 末尾に改行がなければ補完
  const prefix = existing.endsWith("\n") ? "" : "\n";
  fs.appendFileSync(filePath, prefix + memoText, "utf-8");
}

// ────────────────────────────────────────────────
// タイムスタンプ生成 (HH:mm)
// ────────────────────────────────────────────────

export function getCurrentTimestamp(): string {
  const now = new Date();
  return `${pad2(now.getHours())}:${pad2(now.getMinutes())}`;
}
