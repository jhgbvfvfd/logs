
import fs from "fs";
import fsp from "fs/promises";
import path from "path";
import os from "os";
import readline from "readline";
import { fileURLToPath } from "url";

// =============== CONFIG ===============
const SEARCH_DIR = "cmdlo";
const TARGET_PATHS = [
  "/storage/emulated/0/Download",  // Android Download folder
  "/storage/emulated/0/Telegram/Telegram Files/", // Telegram Files folder
  os.homedir() + "/Downloads",     // User Downloads folder
  "/tmp/downloads"                 // Temporary downloads folder
];
const CREDIT_NAME = "CyberScience";
const VERSION = "2.0 ELITE";

// === SPEED SETTINGS ===
const PARALLEL_FILES = Math.max(8, Math.min(os.cpus().length * 3, 24));
const READ_CHUNK_SIZE = 2 * 1024 * 1024;     // 2MB/chunk
const RESULT_DEDUPE = false;                 // Disable dedupe for speed

// === LOGS CONFIGURATION ===
const LOGS_DIR = path.join(os.homedir(), "Downloads", "logs");

// =============== PATH/UTILS ===============
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const searchDirPath = path.join(__dirname, SEARCH_DIR);

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// ANSI colors + special effects
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  italic: '\x1b[3m',
  underline: '\x1b[4m',
  blink: '\x1b[5m',
  reverse: '\x1b[7m',
  strikethrough: '\x1b[9m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bgBlue: '\x1b[44m',
  bgGreen: '\x1b[42m',
  bgRed: '\x1b[41m',
  bgYellow: '\x1b[43m',
  bgMagenta: '\x1b[45m',
  bgCyan: '\x1b[46m',
  bgWhite: '\x1b[47m',
  bgBlack: '\x1b[40m',
  purple: '\x1b[35m',
  orange: '\x1b[38;5;208m',
  // Gradient Colors
  neonCyan: '\x1b[38;5;51m',
  neonGreen: '\x1b[38;5;46m',
  neonPink: '\x1b[38;5;201m',
  neonBlue: '\x1b[38;5;33m',
  gold: '\x1b[38;5;220m',
  silver: '\x1b[38;5;7m',
  hotPink: '\x1b[38;5;198m',
  electricBlue: '\x1b[38;5;27m',
  crimson: '\x1b[38;5;160m'
};

// Function for colored text + special effects
function colorLog(text, color = colors.white) {
  console.log(color + text + colors.reset);
}

// Holographic Effect
function hologramText(text, delay = 100) {
  return new Promise((resolve) => {
    const holoColors = [colors.neonCyan, colors.neonPink, colors.neonGreen, colors.electricBlue, colors.gold];
    let colorIndex = 0;
    const interval = setInterval(() => {
      process.stdout.write('\r' + holoColors[colorIndex] + colors.bright + text + colors.reset);
      colorIndex = (colorIndex + 1) % holoColors.length;
    }, delay);

    setTimeout(() => {
      clearInterval(interval);
      console.log('\r' + colors.neonCyan + colors.bright + text + colors.reset);
      resolve();
    }, delay * holoColors.length * 2);
  });
}

// Glow Effect
function glowEffect(text, color = colors.neonCyan) {
  const glow = color + colors.bright + colors.underline;
  return glow + "░▒▓█ " + text + " █▓▒░" + colors.reset;
}

// Matrix Digital Rain
async function digitalRain(duration = 2000) {
  const chars = "01ABCDEF!@#$%^&*()_+-=[]{}|;':\",./<>?`~ΩΨΔΛΠΣΦΧΩαβγδεζηθικλμνξοπρστυφχψω";
  const width = Math.min(process.stdout.columns || 80, 70);
  const height = 15;
  const drops = Array(width).fill(0);

  const rainInterval = setInterval(() => {
    let output = '';
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (drops[x] === y) {
          const char = chars[Math.floor(Math.random() * chars.length)];
          if (y === 0) output += colors.neonGreen + colors.bright + char + colors.reset;
          else if (y < 3) output += colors.green + colors.bright + char + colors.reset;
          else output += colors.green + colors.dim + char + colors.reset;
        } else {
          output += ' ';
        }
      }
      output += '\n';
    }

    process.stdout.write('\x1b[H\x1b[2J' + output);

    for (let i = 0; i < width; i++) {
      if (drops[i] > height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    }
  }, 100);

  setTimeout(() => {
    clearInterval(rainInterval);
    clearScreen();
  }, duration);
}

// Cyber Wave Effect
function cyberWave(text) {
  const wave = " ▂▃▄▅▆▇█▇▆▅▄▃▂ ";
  return colors.neonCyan + colors.bright + wave + " " + text + " " + wave + colors.reset;
}

// System info function
function getSystemInfo() {
  const platform = os.platform();
  const arch = os.arch();
  const totalRAM = (os.totalmem() / 1024 / 1024 / 1024).toFixed(1);
  const freeRAM = (os.freemem() / 1024 / 1024 / 1024).toFixed(1);
  const cpus = os.cpus();
  const cpuModel = cpus[0]?.model || "Unknown";
  const cpuCores = cpus.length;
  const uptime = os.uptime();
  const loadAvg = os.loadavg();

  return {
    platform,
    arch,
    totalRAM,
    freeRAM,
    cpuModel: cpuModel.slice(0, 30),
    cpuCores,
    uptime,
    loadAvg: loadAvg[0].toFixed(2),
    hostname: os.hostname()
  };
}

// Device detection
function detectDevice() {
  const userAgent = process.env.HTTP_USER_AGENT || "";
  const terminalWidth = process.stdout.columns || 80;

  if (terminalWidth < 100) {
    return { type: "📱 MOBILE/TABLET", icon: "📱" };
  } else if (terminalWidth > 120) {
    return { type: "🖥️ DESKTOP", icon: "🖥️" };
  } else {
    return { type: "💻 LAPTOP", icon: "💻" };
  }
}

// Create logs directory
async function ensureLogsDir() {
  try {
    await fsp.mkdir(LOGS_DIR, { recursive: true });
    return true;
  } catch (e) {
    colorLog(`❗️[ERROR] Failed to create logs directory: ${e.message}`, colors.red);
    return false;
  }
}

// Save search history
async function saveSearchHistory(keyword, resultSummary) {
  await ensureLogsDir();
  const historyFile = path.join(LOGS_DIR, "search_history.json");

  const searchEntry = {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    keyword: keyword,
    totalLines: resultSummary.totalLines,
    filesWithHits: resultSummary.filesWithHits,
    totalFilesScanned: resultSummary.totalFilesScanned,
    elapsedSec: resultSummary.elapsedSec,
    resultFile: resultSummary.resultPath ? path.basename(resultSummary.resultPath) : null
  };

  try {
    let history = [];
    try {
      const data = await fsp.readFile(historyFile, 'utf8');
      history = JSON.parse(data);
    } catch (e) {
      // File doesn't exist or can't read
    }

    history.unshift(searchEntry);
    history = history.slice(0, 50); // Keep only latest 50 entries

    await fsp.writeFile(historyFile, JSON.stringify(history, null, 2));
    return searchEntry.id;
  } catch (e) {
    colorLog(`❗️[ERROR] Failed to save history: ${e.message}`, colors.red);
    return null;
  }
}

// Load search history
async function loadSearchHistory() {
  const historyFile = path.join(LOGS_DIR, "search_history.json");

  try {
    const data = await fsp.readFile(historyFile, 'utf8');
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
}

async function printBanner() {
  clearScreen();
  const sysInfo = getSystemInfo();
  const device = detectDevice();

  // Hacker-style banner
  console.log(createHackerBorder("🔥 CYBER ELITE HACKER CONSOLE 🔥", "▓", colors.neonCyan + colors.bright));
  await new Promise(resolve => setTimeout(resolve, 300));

  console.log();
  await hologramText(`${CREDIT_NAME} v${VERSION} | ELITE HACKER EDITION`, 60);
  console.log();

  console.log(colors.crimson + colors.bright + "⚡ ADVANCED DATA MINING ENGINE ⚡" + colors.reset);
  console.log();

  // Hacker-style system info
  const hackStats = [
    `${device.icon} ${device.type}`,
    `💾 RAM: ${sysInfo.freeRAM}/${sysInfo.totalRAM}GB`,
    `⚙️ CPU: ${sysInfo.cpuCores} CORES • LOAD: ${sysInfo.loadAvg}%`,
    `🔒 ENCRYPTION: AES-256 ENABLED`,
    `🛡️ FIREWALL: MAXIMUM SECURITY`
  ];

  console.log(createHackerBox("💻 SYSTEM STATUS", hackStats, colors.gold));

  // Status indicators
  console.log();
  console.log(colors.neonGreen + "● ONLINE" + colors.reset + " " +
              colors.neonBlue + "● AI ACTIVE" + colors.reset + " " +
              colors.crimson + "● SECURE" + colors.reset + " " +
              colors.gold + "● STEALTH MODE" + colors.reset);
  console.log();
}

async function printMenu() {
  console.log(createHackerBorder("🎯 HACKER COMMAND CENTER", "═", colors.neonCyan + colors.bright));
  await new Promise(resolve => setTimeout(resolve, 200));

  console.log();

  // Hacker-style menu items
  const menuItems = [
    ` 1  🔍 DATA MINING & EXTRACTION`,
    ` 2  📊 SYSTEM DIAGNOSTICS`, 
    ` 3  ⚙️ CONFIGURATION PANEL`,
    ` 4  💡 OPERATION MANUAL`,
    ` 5  🚪 TERMINATE SESSION`,
    ` 6  📋 SEARCH HISTORY LOG`
  ];

  console.log(createHackerBox("🎮 SELECT OPERATION", menuItems, colors.neonCyan));

  console.log();
  console.log(createHackerBorder("⚡ AWAITING COMMAND ⚡", "▒", colors.yellow));
  console.log();
}

if (!fs.existsSync(searchDirPath)) {
  fs.mkdirSync(searchDirPath, { recursive: true });
  colorLog(`✅ [INIT] Created directory '${SEARCH_DIR}' successfully`, colors.green);
}

function looksLikeUrl(s) {
  return /^https?:\/\/|^[\w.-]+\.[a-z]{2,}(?:\/|$)/i.test(s);
}

function extractHostname(input) {
  try {
    let u = input.trim();
    if (!/^https?:\/\//i.test(u)) u = "http://" + u;
    const url = new URL(u);
    return url.hostname.toLowerCase();
  } catch { return ""; }
}

function sanitizeFileName(name) {
  return (name || "file.txt").replace(/[/:*?"<>|]/g, "_").replace(/\s+/g, " ").trim().slice(0, 200);
}

// =============== FILE SEARCH ===============
async function getAllTxtFiles(dirPath) {
  let out = [];
  try {
    const entries = await fsp.readdir(dirPath, { withFileTypes: true });
    for (const e of entries) {
      const full = path.join(dirPath, e.name);
      if (e.isDirectory()) out = out.concat(await getAllTxtFiles(full));
      else if (e.isFile() && e.name.toLowerCase().endsWith(".txt")) out.push(full);
    }
  } catch (e) {
    colorLog(`❗️[ERROR] Cannot read directory: ${dirPath}`, colors.red);
  }
  return out;
}

async function getAllTxtFilesFromTargets() {
  let allFiles = [];

  for (const targetPath of TARGET_PATHS) {
    try {
      await fsp.access(targetPath);
      const files = await getAllTxtFiles(targetPath);
      allFiles = allFiles.concat(files);
      colorLog(`✅ SCANNING: ${targetPath} (Found ${files.length} files)`, colors.green);
    } catch (e) {
      colorLog(`⚠️ ACCESS DENIED: ${targetPath}`, colors.yellow);
    }
  }

  return allFiles;
}

// Real-time data display
function displayFoundData(data, isPassword = false) {
  const displayData = isPassword ? data.replace(/./g, '*') : data;

  // Effects for found data
  const effects = [
    colors.neonGreen + colors.bright + "🔥 MATCH >> ",
    colors.neonCyan + colors.bright + "⚡ FOUND >> ",
    colors.gold + colors.bright + "💎 DATA >> ",
    colors.neonPink + colors.bright + "🎯 HIT >> "
  ];

  const randomEffect = effects[Math.floor(Math.random() * effects.length)];
  console.log(randomEffect + displayData + colors.reset);
}

async function searchInFileStream(filePath, keyword, onBatch) {
  const needle = keyword.toLowerCase();
  const stream = fs.createReadStream(filePath, { encoding: "utf-8", highWaterMark: READ_CHUNK_SIZE });
  const fileRl = readline.createInterface({ input: stream, crlfDelay: Infinity });

  let batch = [];
  let count = 0;
  const flush = () => {
    if (!batch.length) return;
    onBatch(batch);
    count += batch.length;
    batch = [];
  };

  return new Promise((resolve) => {
    fileRl.on("line", (line) => {
      if (line.toLowerCase().includes(needle)) {
        let processedLine = line;
        const parts = line.split(':');
        if (parts.length >= 3) {
          processedLine = parts.slice(-2).join(':');
        }

        // Display data immediately
        displayFoundData(processedLine, /password|pass|pwd|secret|key/i.test(line));

        batch.push(processedLine);
        if (batch.length >= 200) flush();
      }
    });
    fileRl.on("close", () => { flush(); resolve(count); });
    fileRl.on("error", (e) => { colorLog(`❗️[ERROR] Cannot read file: ${filePath}`, colors.red); flush(); resolve(count); });
  });
}

async function mapLimit(items, limit, worker) {
  const ret = new Array(items.length);
  let i = 0;
  async function next() {
    if (i >= items.length) return;
    const idx = i++;
    ret[idx] = await worker(items[idx], idx);
    return next();
  }
  const starters = Array.from({ length: Math.min(limit, items.length) }, () => next());
  await Promise.all(starters);
  return ret;
}

async function performSearch(keyword, explicitOutName = "") {
  const files = await getAllTxtFilesFromTargets();
  const t0 = Date.now();

  console.log(colors.yellow + colors.bright + "🔍 INITIATING DATA EXTRACTION..." + colors.reset);
  console.log(colors.cyan + `📂 SCANNING ${files.length} TARGET FILES` + colors.reset);
  console.log();
  console.log(colors.neonGreen + colors.bright + "🎯 LIVE DATA FEED:" + colors.reset);
  console.log(colors.dim + "═".repeat(50) + colors.reset);

  await ensureLogsDir();
  const baseName = explicitOutName ? sanitizeFileName(explicitOutName) : `hack-${keyword.replace(/[^a-zA-Z0-9]/g, '_')}-${Date.now()}.txt`;
  const outPath = path.join(LOGS_DIR, baseName);
  const ws = fs.createWriteStream(outPath, { encoding: "utf8" });

  // Write header to file
  ws.write(`🔥 CyberScience Elite Extraction Results\n`);
  ws.write(`📅 Timestamp: ${new Date().toLocaleString()}\n`);
  ws.write(`🎯 Target Query: ${keyword}\n`);
  ws.write(`${"═".repeat(50)}\n\n`);

  let totalLines = 0;
  let filesWithHits = 0;
  const seen = RESULT_DEDUPE ? new Set() : null;

  await mapLimit(files, PARALLEL_FILES, async (f) => {
    let localCount = 0;
    await searchInFileStream(f, keyword, (batch) => {
      if (RESULT_DEDUPE) {
        const filtered = [];
        for (const ln of batch) if (!seen.has(ln)) { seen.add(ln); filtered.push(ln); }
        if (filtered.length) {
          ws.write(filtered.join("\n") + "\n");
          localCount += filtered.length;
        }
      } else {
        ws.write(batch.join("\n") + "\n");
        localCount += batch.length;
      }
    });
    if (localCount > 0) filesWithHits++;
    totalLines += localCount;
  });

  console.log();
  console.log(colors.dim + "═".repeat(50) + colors.reset);

  await new Promise((r) => ws.end(r));
  const elapsedSec = (Date.now() - t0) / 1000;

  if (totalLines === 0) {
    await fsp.unlink(outPath).catch(() => {});
    return { resultPath: null, totalLines, filesWithHits: 0, totalFilesScanned: files.length, elapsedSec };
  }
  return { resultPath: outPath, totalLines, filesWithHits, totalFilesScanned: files.length, elapsedSec };
}

// Time conversion function
function hhmmss(totalSec) {
  const s = Math.max(0, Math.floor(totalSec));
  const h = String(Math.floor(s / 3600)).padStart(2, "0");
  const m = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${h}:${m}:${ss}`;
}

// =============== HACKER UI FUNCTIONS ===============
function getHackerWidth() {
  return Math.min(process.stdout.columns || 80, 60);
}

function createHackerBorder(text, borderChar = "─", color = colors.cyan) {
  const width = getHackerWidth();
  const padding = Math.max(0, Math.floor((width - text.length) / 2));
  const border = borderChar.repeat(width);
  const centeredText = " ".repeat(padding) + text + " ".repeat(padding);
  return color + border + "\n" + centeredText.slice(0, width) + "\n" + border + colors.reset;
}

function createHackerBox(title, content, color = colors.cyan) {
  const width = getHackerWidth();
  const topBorder = "╭" + "─".repeat(width - 2) + "╮";
  const bottomBorder = "╰" + "─".repeat(width - 2) + "╯";
  const titleLine = "│" + title.slice(0, width - 4).padEnd(width - 2) + "│";

  let result = color + topBorder + "\n" + titleLine + "\n";

  if (Array.isArray(content)) {
    content.forEach(line => {
      const displayLine = "│ " + line.slice(0, width - 4).padEnd(width - 3) + "│";
      result += displayLine + "\n";
    });
  } else {
    const displayLine = "│ " + content.slice(0, width - 4).padEnd(width - 3) + "│";
    result += displayLine + "\n";
  }

  result += bottomBorder + colors.reset;
  return result;
}

// =============== MENU FUNCTIONS ===============
async function searchMenu() {
  clearScreen();

  console.log(createHackerBorder("🔍 DATA MINING INTERFACE", "═", colors.magenta + colors.bright));
  console.log();

  console.log(colors.yellow + colors.bright + "💡 SEARCH EXAMPLES:" + colors.reset);
  console.log(colors.cyan + "  🌐 example.com" + colors.reset);
  console.log(colors.cyan + "  📧 admin@email.com" + colors.reset);
  console.log(colors.cyan + "  🔑 password123" + colors.reset);
  console.log();

  const query = await new Promise((resolve) => {
    rl.question(colors.cyan + colors.bright + "🔑 ENTER TARGET QUERY: " + colors.reset, resolve);
  });

  if (!query.trim()) {
    console.log(colors.red + colors.bright + "❌ INVALID INPUT! QUERY REQUIRED!" + colors.reset);
    return;
  }

  const raw = query.trim();
  const isUrl = looksLikeUrl(raw);
  const host = isUrl ? extractHostname(raw) : "";
  const keyword = isUrl && host ? host : raw;

  clearScreen();
  console.log(createHackerBorder("🎯 CYBER EXTRACTION ACTIVE", "▓", colors.neonGreen + colors.bright));
  console.log();

  const { resultPath, totalLines, filesWithHits, totalFilesScanned, elapsedSec } =
    await performSearch(keyword, isUrl ? host : keyword);

  // Save history
  const historyId = await saveSearchHistory(keyword, { resultPath, totalLines, filesWithHits, totalFilesScanned, elapsedSec });

  // Display results
  console.log();
  console.log(createHackerBorder("📊 EXTRACTION RESULTS", "▓", colors.green + colors.bright));
  console.log();

  const resultData = [
    `🎯 EXTRACTED: ${colors.yellow}${totalLines.toLocaleString()}${colors.reset} RECORDS`,
    `📁 SCANNED: ${colors.cyan}${totalFilesScanned}${colors.reset} FILES`,
    `📄 HITS IN: ${colors.magenta}${filesWithHits}${colors.reset} FILES`,
    `⏱️ ELAPSED: ${colors.blue}${hhmmss(elapsedSec)}${colors.reset}`,
    `💾 SAVED TO: ${colors.orange}logs/${colors.reset}`
  ];

  if (resultPath) {
    resultData.push(`📋 FILE: ${colors.purple}${path.basename(resultPath)}${colors.reset}`);
  }

  console.log(createHackerBox("🎯 MISSION REPORT", resultData, colors.green));

  // Success effect
  if (totalLines > 0) {
    console.log();
    await hologramText("🎉 EXTRACTION SUCCESSFUL!", 100);
    console.log(colors.neonCyan + "💎 Data archived in Downloads/logs directory" + colors.reset);
  } else {
    console.log();
    console.log(colors.red + colors.bright + "💭 NO DATA MATCHES FOUND" + colors.reset);
  }
}

async function statsMenu() {
  clearScreen();
  const sysInfo = getSystemInfo();
  const device = detectDevice();

  console.log(createHackerBorder("📊 SYSTEM DIAGNOSTICS", "═", colors.blue + colors.bright));
  console.log();

  console.log(colors.yellow + "🔄 ANALYZING SYSTEM..." + colors.reset);
  await new Promise(resolve => setTimeout(resolve, 800));

  const files = await getAllTxtFilesFromTargets();
  let totalSize = 0;

  for (const file of files) {
    try {
      const stats = await fsp.stat(file);
      totalSize += stats.size;
    } catch (e) {
      // Skip unreadable files
    }
  }

  clearScreen();
  console.log(createHackerBorder("📈 SYSTEM REPORT", "▓", colors.cyan + colors.bright));
  console.log();

  const systemData = [
    `${device.icon} ${device.type}`,
    `🖥️ HOST: ${sysInfo.hostname.slice(0,15)}`,
    `💾 RAM: ${sysInfo.freeRAM}/${sysInfo.totalRAM}GB`,
    `⚙️ CPU: ${sysInfo.cpuCores} CORES`,
    `🏗️ PLATFORM: ${sysInfo.platform}/${sysInfo.arch}`,
    `📊 LOAD: ${sysInfo.loadAvg}%`,
    `⏰ UPTIME: ${hhmmss(sysInfo.uptime)}`
  ];

  console.log(createHackerBox("💻 HARDWARE", systemData, colors.cyan));
  console.log();

  const dataStats = [
    `🗂️ TARGET DIR: ${SEARCH_DIR}`,
    `📄 FILES: ${files.length.toLocaleString()}`,
    `💾 SIZE: ${(totalSize / 1024 / 1024).toFixed(2)} MB`,
    `🔧 PARALLEL: ${PARALLEL_FILES}`,
    `⚡ CHUNK SIZE: ${(READ_CHUNK_SIZE / 1024 / 1024).toFixed(1)}MB`,
    `📋 LOGS: ${colors.gold}Downloads/logs${colors.reset}`
  ];

  console.log(createHackerBox("📊 DATABASE", dataStats, colors.green));
}

async function settingsMenu() {
  clearScreen();

  console.log(createHackerBorder("⚙️ CONFIGURATION PANEL", "═", colors.yellow + colors.bright));
  console.log();

  const configData = [
    `🗂️ SEARCH PATHS: ${colors.cyan}${TARGET_PATHS.length} CONFIGURED${colors.reset}`,
    `📱 ANDROID: ${colors.orange}/storage/emulated/0/Download${colors.reset}`,
    `💬 TELEGRAM: ${colors.green}/storage/.../Telegram Files${colors.reset}`,
    `👤 DEVELOPER: ${colors.magenta}${CREDIT_NAME}${colors.reset}`,
    `🔧 PARALLEL PROC: ${colors.green}${PARALLEL_FILES}${colors.reset}`,
    `⚡ CHUNK SIZE: ${colors.yellow}${(READ_CHUNK_SIZE / 1024 / 1024).toFixed(1)}MB${colors.reset}`,
    `🔄 DEDUPLICATION: ${colors.blue}${RESULT_DEDUPE ? 'ENABLED' : 'DISABLED'}${colors.reset}`,
    `📋 LOG DIR: ${colors.purple}${LOGS_DIR}${colors.reset}`
  ];

  console.log(createHackerBox("📋 CURRENT CONFIG", configData, colors.yellow));
  console.log();
  console.log(colors.dim + "💡 Edit index.js to modify configuration" + colors.reset);
}

async function helpMenu() {
  clearScreen();

  console.log(createHackerBorder("💡 OPERATION MANUAL", "═", colors.green + colors.bright));
  console.log();

  console.log(colors.yellow + colors.bright + "📖 HACKER GUIDE:" + colors.reset);
  console.log();

  console.log(colors.cyan + "1️⃣ DATA MINING:" + colors.reset);
  console.log("  • Enter target search query");
  console.log("  • Supports URLs and emails");
  console.log("  • Real-time data extraction");
  console.log("  • Auto-save to logs directory");
  console.log();

  console.log(colors.cyan + "2️⃣ EXAMPLES:" + colors.reset);
  console.log("  🌐 example.com");
  console.log("  📧 admin@email.com");
  console.log("  🔑 password123");
  console.log();

  console.log(colors.cyan + "3️⃣ HISTORY ACCESS:" + colors.reset);
  console.log("  • Select menu option 6");
  console.log("  • Choose desired record");
  console.log("  • View extracted data");
  console.log();

  console.log(colors.cyan + "4️⃣ DATA PREPARATION:" + colors.reset);
  console.log("  • Place .txt files in cmdlo");
  console.log("  • Supports subdirectories");
  console.log("  • Auto-scan enabled");
  console.log();

  console.log(colors.purple + colors.bright + `💝 ${CREDIT_NAME} Elite Hacker Team` + colors.reset);
}

async function viewSearchHistoryMenu() {
  clearScreen();

  console.log(createHackerBorder("📋 SEARCH HISTORY LOG", "═", colors.purple + colors.bright));
  console.log();

  const history = await loadSearchHistory();

  if (history.length === 0) {
    console.log(colors.yellow + "📝 NO SEARCH HISTORY FOUND" + colors.reset);
    console.log(colors.dim + "💡 Perform a search in menu 1 first" + colors.reset);
    return;
  }

  console.log(colors.neonCyan + colors.bright + "🎯 SELECT RECORD TO VIEW:" + colors.reset);
  console.log();

  // Display history records
  for (let i = 0; i < Math.min(history.length, 20); i++) {
    const item = history[i];
    const date = new Date(item.timestamp).toLocaleString();
    const resultText = item.totalLines > 0 ?
      `${colors.green}✓ ${item.totalLines} RECORDS${colors.reset}` :
      `${colors.red}✗ NO DATA${colors.reset}`;

    console.log(`${colors.cyan}${(i + 1).toString().padStart(2, '0')}${colors.reset}. ${colors.yellow}${item.keyword}${colors.reset}`);
    console.log(`    📅 ${colors.dim}${date}${colors.reset} • ${resultText}`);
    console.log();
  }

  const choice = await new Promise((resolve) => {
    rl.question(colors.purple + colors.bright + "🔢 SELECT NUMBER (or 0 to return): " + colors.reset, resolve);
  });

  const selectedIndex = parseInt(choice) - 1;

  if (choice === '0') {
    return;
  }

  if (selectedIndex >= 0 && selectedIndex < history.length) {
    const selectedItem = history[selectedIndex];
    await displaySearchResult(selectedItem);
  } else {
    console.log(colors.red + "❌ INVALID SELECTION!" + colors.reset);
  }
}

async function displaySearchResult(historyItem) {
  clearScreen();

  console.log(createHackerBorder("📋 EXTRACTION RECORD", "▓", colors.gold + colors.bright));
  console.log();

  const resultInfo = [
    `🎯 QUERY: ${colors.yellow}${historyItem.keyword}${colors.reset}`,
    `📅 DATE: ${colors.cyan}${new Date(historyItem.timestamp).toLocaleString()}${colors.reset}`,
    `📊 EXTRACTED: ${colors.green}${historyItem.totalLines.toLocaleString()}${colors.reset} RECORDS`,
    `📁 FILES SCANNED: ${colors.blue}${historyItem.totalFilesScanned}${colors.reset}`,
    `📄 FILES WITH HITS: ${colors.magenta}${historyItem.filesWithHits}${colors.reset}`,
    `⏱️ ELAPSED TIME: ${colors.orange}${hhmmss(historyItem.elapsedSec)}${colors.reset}`
  ];

  console.log(createHackerBox("📊 RECORD DETAILS", resultInfo, colors.gold));

  if (historyItem.resultFile && historyItem.totalLines > 0) {
    console.log();
    console.log(colors.neonGreen + colors.bright + "🔍 DISPLAYING EXTRACTED DATA..." + colors.reset);

    // Read and display result file
    const filePath = path.join(LOGS_DIR, historyItem.resultFile);

    try {
      const data = await fsp.readFile(filePath, 'utf8');
      const lines = data.split('\n');

      console.log();
      console.log(colors.dim + "═".repeat(50) + colors.reset);
      console.log(colors.neonCyan + colors.bright + "🎯 EXTRACTED DATA:" + colors.reset);
      console.log(colors.dim + "═".repeat(50) + colors.reset);

      // Display only result data (skip header)
      let startIndex = 0;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('═'.repeat(50))) {
          startIndex = i + 2;
          break;
        }
      }

      const dataLines = lines.slice(startIndex).filter(line => line.trim());
      const displayLines = dataLines.slice(0, 50); // Display first 50 lines

      for (const line of displayLines) {
        if (line.trim()) {
          displayFoundData(line, /password|pass|pwd|secret|key/i.test(line));
        }
      }

      if (dataLines.length > 50) {
        console.log();
        console.log(colors.yellow + `... and ${dataLines.length - 50} more records` + colors.reset);
      }

      console.log();
      console.log(colors.dim + "═".repeat(50) + colors.reset);
      console.log(colors.purple + `💾 FULL FILE: ${filePath}` + colors.reset);

    } catch (e) {
      console.log();
      console.log(colors.red + "❗️ CANNOT ACCESS RESULT FILE" + colors.reset);
      console.log(colors.yellow + `💾 FILE: ${filePath}` + colors.reset);
    }
  } else {
    console.log();
    console.log(colors.red + "📝 NO DATA FOUND IN THIS SEARCH" + colors.reset);
  }
}

// =============== MAIN LOOP ===============
async function mainLoop() {
  while (true) {
    await printBanner();
    await printMenu();

    const choice = await new Promise((resolve) => {
      rl.question(colors.bright + colors.cyan + "🎯 ENTER COMMAND (1-6): " + colors.reset, resolve);
    });

    console.log();

    switch (choice.trim()) {
      case '1':
        await searchMenu();
        break;
      case '2':
        await statsMenu();
        break;
      case '3':
        await settingsMenu();
        break;
      case '4':
        await helpMenu();
        break;
      case '5':
        colorLog("╭─────────────────────────────────────────────────────────────────────────╮", colors.green + colors.bright);
        colorLog("│                        👋 TERMINATING SESSION!                         │", colors.green + colors.bright);
        colorLog("│                                                                         │", colors.green);
        colorLog(`│  💝 ${CREDIT_NAME} Elite - Advanced Hacker Data Mining System           │`, colors.green);
        colorLog("│                                                                         │", colors.green);
        colorLog("╰─────────────────────────────────────────────────────────────────────────╯", colors.green + colors.bright);
        rl.close();
        process.exit(0);
        break;
      case '6':
        await viewSearchHistoryMenu();
        break;
      default:
        colorLog("❌ INVALID COMMAND! SELECT 1-6 ONLY!", colors.red + colors.bright);
    }

    console.log();
    await new Promise((resolve) => {
      rl.question(colors.dim + "Press Enter to return to main menu..." + colors.reset, resolve);
    });
  }
}

// =============== ULTIMATE HACKER STARTUP ANIMATION ===============
async function showStartupAnimation() {
  clearScreen();

  // Phase 1: Hacker Boot Sequence (2.5s)
  console.log(cyberWave("INITIATING ELITE HACKER PROTOCOL"));
  await new Promise(resolve => setTimeout(resolve, 500));

  const initFrames = [
    "⠋ Connecting to Dark Web...",
    "⠙ Loading Exploit Modules...",
    "⠹ Activating Stealth Mode...",
    "⠸ Bypassing Security...",
    "⠼ Scanning Target Network...",
    "⠴ Injecting Payload...",
    "⠦ Establishing Backdoor...",
    "⠧ System Compromised!"
  ];

  for (let i = 0; i < initFrames.length; i++) {
    const holoColor = [colors.neonCyan, colors.neonPink, colors.neonGreen, colors.electricBlue][i % 4];
    process.stdout.write("\r" + holoColor + colors.bright + "🔥 " + initFrames[i] + " " + "░▒▓█".repeat(i + 1) + colors.reset);
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  console.log("\n");

  // Phase 2: Epic Hacker ASCII Art (3s)
  await hologramText("CONSTRUCTING HACKER INTERFACE", 100);
  console.log();

  const asciiLines = [
    "",
    "   ██╗  ██╗ █████╗  ██████╗██╗  ██╗███████╗██████╗     ███████╗██╗     ██║████████╗███████╗",
    "   ██║  ██║██╔══██╗██╔════╝██║ ██╔╝██╔════╝██╔══██╗    ██╔════╝██║     ██║╚══██╔══╝██╔════╝",
    "   ███████║███████║██║     █████╔╝ █████╗  ██████╔╝    █████╗  ██║     ██║   ██║   █████╗  ",
    "   ██╔══██║██╔══██║██║     ██╔═██╗ ██╔══╝  ██╔══██╗    ██╔══╝  ██║     ██║   ██║   ██╔══╝  ",
    "   ██║  ██║██║  ██║╚██████╗██║  ██╗███████╗██║  ██║    ███████╗███████╗██║   ██║   ███████╗",
    "   ╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝    ╚══════╝╚══════╝╚═╝   ╚═╝   ╚══════╝",
    "",
    "        🔥💀 CYBER SCIENCE ELITE 💀🔥",
    "     ⚡🌌 Advanced Hacker Data Mining v2.0 🌌⚡",
    ""
  ];

  for (let i = 0; i < asciiLines.length; i++) {
    const line = asciiLines[i];
    const colors_array = [colors.neonCyan, colors.neonPink, colors.gold, colors.neonGreen, colors.electricBlue];
    const color = colors_array[i % colors_array.length];
    console.log(color + colors.bright + line + colors.reset);
    await new Promise(resolve => setTimeout(resolve, 180));
  }

  // Phase 3: Enhanced Matrix Rain Effect (2.5s)
  console.log(glowEffect("🌊 MATRIX HACKER RAIN ACTIVATED"));
  await digitalRain(2500);

  // Phase 4: Hacker System Analysis (1.5s)
  console.log(cyberWave("PERFORMING PENETRATION TEST"));

  const statusChecks = [
    { text: "FIREWALL", status: "BYPASSED", color: colors.neonGreen },
    { text: "ENCRYPTION", status: "CRACKED", color: colors.neonBlue },
    { text: "DATABASE", status: "ACCESSED", color: colors.neonPink },
    { text: "ROOT ACCESS", status: "GRANTED", color: colors.gold },
    { text: "STEALTH MODE", status: "ACTIVE", color: colors.crimson }
  ];

  for (const check of statusChecks) {
    console.log(`${check.color}${colors.bright}▓▒░ ${check.text}: ${colors.blink}${check.status}${colors.reset} ${check.color}░▒▓${colors.reset}`);
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  // Phase 5: Hacker Countdown (2s)
  console.log("\n" + glowEffect("🎯 ENTERING HACKER DIMENSION"));
  const countdown = ["▓▓▓", "▓▓░", "▓░░", "💥 HACKED!"];

  for (const count of countdown) {
    process.stdout.write("\r" + colors.hotPink + colors.bright + colors.blink + "   ◢◤ " + count + " ◥◣   " + colors.reset);
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log("\n");

  // Phase 6: Ultimate Hacker Activation (1s)
  const flashMessages = [
    "⚡ HACKER SYSTEMS ONLINE ⚡",
    "💫 ELITE INTERFACE READY 💫",
    "🚀 CYBER OPERATIONS ACTIVE 🚀"
  ];

  for (let i = 0; i < 5; i++) {
    const msg = flashMessages[i % flashMessages.length];
    console.log(colors.bgWhite + colors.bright + colors.blink + "                    " + msg + "                    " + colors.reset);
    await new Promise(resolve => setTimeout(resolve, 150));
    process.stdout.write("\r" + " ".repeat(80) + "\r");
    await new Promise(resolve => setTimeout(resolve, 150));
  }

  // Final Hacker Welcome
  await hologramText("🎉 WELCOME TO THE ELITE HACKER DIMENSION! 🎉", 100);
  console.log();
  console.log(cyberWave("READY FOR CYBER OPERATIONS"));
  console.log("");
}

// Function to clear the screen
function clearScreen() {
  process.stdout.write('\x1b[2J\x1b[H');
}

// Start the program
(async () => {
  await showStartupAnimation();
  mainLoop().catch(console.error);
})();
