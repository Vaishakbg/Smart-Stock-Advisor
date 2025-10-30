type WatchlistEntry = {
  symbol: string;
  addedAt: string;
};

export type SheetsBackupConfig = {
  enabled: boolean;
  webhookUrl?: string;
  /** Optional API token or secret understood by your webhook handler */
  authToken?: string;
};

const STORAGE_KEY = "smart-stock-advisor.watchlist";
const DEFAULT_CONFIG: SheetsBackupConfig = { enabled: false };

let backupConfig: SheetsBackupConfig = { ...DEFAULT_CONFIG };
let fallbackStore: WatchlistEntry[] = [];

const isBrowser = () => typeof window !== "undefined" && typeof window.localStorage !== "undefined";

function readEntries(): WatchlistEntry[] {
  if (!isBrowser()) {
    return [...fallbackStore];
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as WatchlistEntry[];
    if (Array.isArray(parsed)) {
      return parsed
        .filter((item) => typeof item?.symbol === "string")
        .map((item) => ({
          symbol: item.symbol.toUpperCase(),
          addedAt: item.addedAt ?? new Date().toISOString()
        }));
    }
  } catch (error) {
    console.warn("Failed to parse watchlist store, resetting", error);
  }

  return [];
}

function persist(entries: WatchlistEntry[]) {
  if (isBrowser()) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } else {
    fallbackStore = [...entries];
  }
}

async function sendBackup(entry: WatchlistEntry) {
  if (!backupConfig.enabled || !backupConfig.webhookUrl) {
    return;
  }

  try {
    await fetch(backupConfig.webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(backupConfig.authToken ? { Authorization: `Bearer ${backupConfig.authToken}` } : {})
      },
      body: JSON.stringify({
        symbol: entry.symbol,
        addedAt: entry.addedAt
      })
    });
  } catch (error) {
    console.warn("Watchlist backup webhook failed", error);
  }
}

function dedupe(entries: WatchlistEntry[]): WatchlistEntry[] {
  const map = new Map<string, WatchlistEntry>();
  entries.forEach((entry) => {
    map.set(entry.symbol.toUpperCase(), entry);
  });
  return Array.from(map.values());
}

export async function add(symbol: string) {
  const trimmed = symbol?.trim().toUpperCase();
  if (!trimmed) {
    throw new Error("Symbol is required");
  }

  const entries = dedupe([
    { symbol: trimmed, addedAt: new Date().toISOString() },
    ...readEntries().filter((entry) => entry.symbol !== trimmed)
  ]);

  persist(entries);
  await sendBackup(entries[0]);
  return entries;
}

export async function remove(symbol: string) {
  const trimmed = symbol?.trim().toUpperCase();
  if (!trimmed) {
    throw new Error("Symbol is required");
  }

  const entries = readEntries().filter((entry) => entry.symbol !== trimmed);
  persist(entries);
  return entries;
}

export function list(): WatchlistEntry[] {
  return readEntries();
}

export function exportToCsv(): string {
  const entries = readEntries();
  const header = "Symbol,AddedAt";
  const rows = entries.map((entry) => `${entry.symbol},${entry.addedAt}`);
  return [header, ...rows].join("\n");
}

export function configureSheetsBackup(config: SheetsBackupConfig) {
  backupConfig = {
    ...DEFAULT_CONFIG,
    ...config,
    enabled: Boolean(config.enabled && config.webhookUrl)
  };
}

/**
 * Google Sheets webhook setup guide:
 * 1. Open https://script.google.com, create a new Apps Script project linked to your target sheet.
 * 2. Paste a simple handler such as:
 *    function doPost(e) {
 *      const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Watchlist');
 *      const payload = JSON.parse(e.postData.contents);
 *      sheet.appendRow([payload.symbol, new Date(payload.addedAt || Date.now())]);
 *      return ContentService.createTextOutput('OK');
 *    }
 * 3. Deploy > New deployment > Type: Web app, execute as "Me", allow access to "Anyone with the link".
 * 4. Copy the deployment URL and provide it as webhookUrl in configureSheetsBackup.
 * 5. Optionally secure the webhook by checking Authorization headers in your script when authToken is set.
 */
export const WatchlistService = {
  add,
  remove,
  list,
  exportToCsv,
  configureSheetsBackup
};

export type { WatchlistEntry };
