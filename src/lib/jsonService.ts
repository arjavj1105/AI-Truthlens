import fs from "fs/promises";
import path from "path";
import { ComparisonRecord } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const HISTORY_FILE = path.join(DATA_DIR, "history.json");

/**
 * Ensures the data directory and history file exist.
 */
async function initializeStorage() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    try {
      await fs.access(HISTORY_FILE);
    } catch {
      await fs.writeFile(HISTORY_FILE, JSON.stringify([]));
    }
  } catch (error) {
    console.error("Failed to initialize storage:", error);
  }
}

/**
 * Reads all records from the history JSON file.
 */
export async function getHistory(): Promise<ComparisonRecord[]> {
  await initializeStorage();
  try {
    const data = await fs.readFile(HISTORY_FILE, "utf-8");
    return JSON.parse(data) as ComparisonRecord[];
  } catch (error) {
    console.error("Failed to read history:", error);
    return [];
  }
}

/**
 * Gets a specific record by ID.
 */
export async function getRecordById(id: string): Promise<ComparisonRecord | null> {
  const history = await getHistory();
  return history.find(record => record.id === id) || null;
}

/**
 * Appends a new comparison record to the history JSON.
 */
export async function addRecord(record: ComparisonRecord): Promise<void> {
  await initializeStorage();
  try {
    // Read existing
    const history = await getHistory();
    // Prepend new record to keep newest first
    const updatedHistory = [record, ...history];
    // Write back
    await fs.writeFile(HISTORY_FILE, JSON.stringify(updatedHistory, null, 2));
  } catch (error) {
    console.error("Failed to write to history:", error);
    throw new Error("Could not save comparison record.");
  }
}
