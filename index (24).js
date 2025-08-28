
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
const VERSION = "2.0 Elite";

// === ค้นหาเร็ว ===
const PARALLEL_FILES = Math.max(8, Math.min(os.cpus().length * 3, 24));
const READ_CHUNK_SIZE = 2 * 1024 * 1024;     // 2MB/ชังก์
const RESULT_DEDUPE = false;                 // ปิด dedupe เพื่อความไว

// =============== PATH/UTILS ===============
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const searchDirPath = path.join(__dirname, SEARCH_DIR);

// สร้างอินเทอร์เฟซ readline
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// สี ANSI สำหรับความสวยงาม + เอฟเฟกต์พิเศษ
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

// ฟังก์ชันสำหรับพิมพ์ข้อความสี + เอฟเฟกต์พิเศษ
function colorLog(text, color = colors.white) {
  console.log(color + text + colors.reset);
}

// ฟังก์ชัน Holographic Effect
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

// ฟังก์ชัน Glow Effect
function glowEffect(text, color = colors.neonCyan) {
  const glow = color + colors.bright + colors.underline;
  return glow + "░▒▓█ " + text + " █▓▒░" + colors.reset;
}

// ฟังก์ชัน Matrix Digital Rain
async function digitalRain(duration = 2000) {
  const chars = "01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン※∀∅∆∇∈∉∋∌∎∏∑√∞∫≈≠≤≥";
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
    
    console.log('\x1b[H\x1b[2J' + output); // Clear screen and move cursor to top
    
    for (let i = 0; i < width; i++) {
      if (drops[i] > height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    }
  }, 100);
  
  setTimeout(() => {
    clearInterval(rainInterval);
    console.clear();
  }, duration);
}

// ฟังก์ชัน Cyber Wave Effect
function cyberWave(text) {
  const wave = "▁▂▃▄▅▆▇█▇▆▅▄▃▂▁";
  return colors.neonCyan + colors.bright + wave + " " + text + " " + wave + colors.reset;
}

// ฟังก์ชันแสดงข้อมูลระบบ
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

// ฟังก์ชันตรวจสอบประเภทอุปกรณ์
function detectDevice() {
  const userAgent = process.env.HTTP_USER_AGENT || "";
  const terminalWidth = process.stdout.columns || 80;
  
  // ตรวจสอบจาก terminal width และ environment
  if (terminalWidth < 100) {
    return { type: "📱 Mobile/Tablet", icon: "📱" };
  } else if (terminalWidth > 120) {
    return { type: "🖥️ Desktop", icon: "🖥️" };
  } else {
    return { type: "💻 Laptop", icon: "💻" };
  }
}

async function printBanner() {
  console.clear();
  const sysInfo = getSystemInfo();
  const device = detectDevice();
  
  // Mobile-optimized banner
  console.log(createMobileBorder("🚀 CYBER ELITE", "▓", colors.neonCyan + colors.bright));
  await new Promise(resolve => setTimeout(resolve, 300));
  
  console.log();
  await hologramText(`${CREDIT_NAME} v${VERSION}`, 60);
  console.log();
  
  console.log(colors.neonCyan + colors.bright + "⚡ Search Engine Elite ⚡" + colors.reset);
  console.log();
  
  // Compact system info for mobile
  const quickStats = [
    `${device.icon} ${device.type}`,
    `💾 ${sysInfo.freeRAM}/${sysInfo.totalRAM}GB`,
    `⚙️ ${sysInfo.cpuCores} cores • 📊 ${sysInfo.loadAvg}%`
  ];
  
  console.log(createMobileBox("💻 ระบบ", quickStats, colors.gold));
  
  // Compact status indicators
  console.log();
  console.log(colors.neonGreen + "● ONLINE" + colors.reset + " " + 
              colors.neonBlue + "● AI ACTIVE" + colors.reset + " " + 
              colors.gold + "● SECURE" + colors.reset);
  console.log();
}

async function printMenu() {
  console.log(createMobileBorder("🎯 เมนู ELITE", "═", colors.neonCyan + colors.bright));
  await new Promise(resolve => setTimeout(resolve, 200));
  
  console.log();
  
  // Mobile-friendly menu items
  const menuItems = [
    `${colors.bgGreen + colors.white} 1 ${colors.reset} 🔍 ค้นหาข้อมูล`,
    `${colors.bgBlue + colors.white} 2 ${colors.reset} 📊 สถิติระบบ`,
    `${colors.bgMagenta + colors.white} 3 ${colors.reset} ⚙️ การตั้งค่า`,
    `${colors.bgYellow + colors.white} 4 ${colors.reset} 💡 วิธีใช้งาน`,
    `${colors.bgRed + colors.white} 5 ${colors.reset} 🚪 ออกจากระบบ`
  ];
  
  console.log(createMobileBox("🎮 เลือกเมนู", menuItems, colors.neonCyan));
  
  console.log();
  console.log(createMobileBorder("⚡ SELECT ⚡", "▒", colors.yellow));
  console.log();
}

if (!fs.existsSync(searchDirPath)) {
  fs.mkdirSync(searchDirPath, { recursive: true });
  colorLog(`✅ [INIT] สร้างโฟลเดอร์ '${SEARCH_DIR}' เรียบร้อย`, colors.green);
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

// =============== ค้นหาในไฟล์ ===============
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
    colorLog(`❗️[ERR] อ่านโฟลเดอร์ไม่ได้: ${dirPath}`, colors.red);
  }
  return out;
}

async function getAllTxtFilesFromTargets() {
  let allFiles = [];
  
  for (const targetPath of TARGET_PATHS) {
    try {
      // Check if path exists
      await fsp.access(targetPath);
      const files = await getAllTxtFiles(targetPath);
      allFiles = allFiles.concat(files);
      colorLog(`✅ สแกนโฟลเดอร์: ${targetPath} (พบ ${files.length} ไฟล์)`, colors.green);
    } catch (e) {
      colorLog(`⚠️ ไม่สามารถเข้าถึง: ${targetPath}`, colors.yellow);
    }
  }
  
  return allFiles;
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
        batch.push(processedLine);
        if (batch.length >= 200) flush();
      }
    });
    fileRl.on("close", () => { flush(); resolve(count); });
    fileRl.on("error", (e) => { colorLog(`❗️[ERR] อ่านไฟล์ไม่ได้: ${filePath}`, colors.red); flush(); resolve(count); });
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

  // Progress Bar Animation
  const progressChars = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  let progressIndex = 0;
  const progressInterval = setInterval(() => {
    process.stdout.write(`\r${colors.yellow}${progressChars[progressIndex]} กำลังสแกนไฟล์... ${colors.cyan}[${files.length} files]${colors.reset}`);
    progressIndex = (progressIndex + 1) % progressChars.length;
  }, 100);

  const baseName = explicitOutName ? sanitizeFileName(explicitOutName) : `results-${Date.now()}.txt`;
  const outPath = path.join(os.tmpdir(), baseName);
  const ws = fs.createWriteStream(outPath, { encoding: "utf8" });

  let totalLines = 0;
  let filesWithHits = 0;
  const seen = RESULT_DEDUPE ? new Set() : null;

  await mapLimit(files, PARALLEL_FILES, async (f) => {
    let localCount = 0;
    await searchInFileStream(f, keyword, (batch) => {
      if (RESULT_DEDUPE) {
        const filtered = [];
        for (const ln of batch) if (!seen.has(ln)) { seen.add(ln); filtered.push(ln); }
        if (filtered.length) { ws.write(filtered.join("\n") + "\n"); localCount += filtered.length; }
      } else {
        ws.write(batch.join("\n") + "\n");
        localCount += batch.length;
      }
    });
    if (localCount > 0) filesWithHits++;
    totalLines += localCount;
  });

  clearInterval(progressInterval);
  process.stdout.write("\r" + " ".repeat(50) + "\r");
  
  await new Promise((r) => ws.end(r));
  const elapsedSec = (Date.now() - t0) / 1000;

  if (totalLines === 0) {
    await fsp.unlink(outPath).catch(() => {});
    return { resultPath: null, totalLines, filesWithHits: 0, totalFilesScanned: files.length, elapsedSec };
  }
  return { resultPath: outPath, totalLines, filesWithHits, totalFilesScanned: files.length, elapsedSec };
}

// ฟังก์ชันแปลงเวลา
function hhmmss(totalSec) {
  const s = Math.max(0, Math.floor(totalSec));
  const h = String(Math.floor(s / 3600)).padStart(2, "0");
  const m = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${h}:${m}:${ss}`;
}

// =============== MOBILE-OPTIMIZED UI FUNCTIONS ===============
function getMobileWidth() {
  return Math.min(process.stdout.columns || 80, 50); // สำหรับมือถือ
}

function createMobileBorder(text, borderChar = "─", color = colors.cyan) {
  const width = getMobileWidth();
  const padding = Math.max(0, Math.floor((width - text.length) / 2));
  const border = borderChar.repeat(width);
  const centeredText = " ".repeat(padding) + text + " ".repeat(padding);
  return color + border + "\n" + centeredText.slice(0, width) + "\n" + border + colors.reset;
}

function createMobileBox(title, content, color = colors.cyan) {
  const width = getMobileWidth();
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

async function mobileSearchAnimation() {
  console.clear();
  
  // Mobile-friendly search animation
  const searchFrames = [
    "🔍 เริ่มการค้นหา...",
    "📡 สแกนข้อมูล...", 
    "⚡ ประมวลผล...",
    "🎯 กำลังหาข้อมูล...",
    "💫 เกือบเสร็จแล้ว...",
    "✨ เสร็จสิ้น!"
  ];
  
  for (let i = 0; i < searchFrames.length; i++) {
    console.clear();
    console.log(createMobileBorder("🚀 CYBER SEARCH", "▓", colors.neonCyan));
    console.log();
    
    const progressBar = "█".repeat(Math.floor((i + 1) / searchFrames.length * 20));
    const emptyBar = "░".repeat(20 - progressBar.length);
    
    console.log(colors.yellow + colors.bright + "  " + searchFrames[i] + colors.reset);
    console.log(colors.cyan + "  [" + progressBar + emptyBar + "] " + Math.floor((i + 1) / searchFrames.length * 100) + "%" + colors.reset);
    
    await new Promise(resolve => setTimeout(resolve, 300));
  }
}

// =============== MENU FUNCTIONS ===============
async function searchMenu() {
  console.clear();
  
  console.log(createMobileBorder("🔍 SEARCH ENGINE", "═", colors.magenta + colors.bright));
  console.log();

  console.log(colors.yellow + colors.bright + "💡 ตัวอย่าง:" + colors.reset);
  console.log(colors.cyan + "  🌐 example.com" + colors.reset);
  console.log(colors.cyan + "  📧 admin@email.com" + colors.reset);
  console.log(colors.cyan + "  🔑 password123" + colors.reset);
  console.log();

  const query = await new Promise((resolve) => {
    rl.question(colors.cyan + colors.bright + "🔑 คำค้นหา: " + colors.reset, resolve);
  });

  if (!query.trim()) {
    console.log(colors.red + colors.bright + "❌ กรุณาใส่คำค้นหา!" + colors.reset);
    return;
  }

  const raw = query.trim();
  const isUrl = looksLikeUrl(raw);
  const host = isUrl ? extractHostname(raw) : "";
  const keyword = isUrl && host ? host : raw;

  // แสดงแอนิเมชั่นค้นหาสำหรับมือถือ
  await mobileSearchAnimation();

  const { resultPath, totalLines, filesWithHits, totalFilesScanned, elapsedSec } = 
    await performSearch(keyword);

  // ล้างหน้าจอแล้วแสดงผลลัพธ์
  console.clear();
  
  // แสดงผลลัพธ์แบบมือถือ
  console.log(createMobileBorder("📊 ผลการค้นหา", "▓", colors.green + colors.bright));
  console.log();
  
  const resultData = [
    `🎯 พบ: ${colors.yellow}${totalLines.toLocaleString()}${colors.reset} รายการ`,
    `📁 สแกน: ${colors.cyan}${totalFilesScanned}${colors.reset} ไฟล์`,
    `📄 เจอใน: ${colors.magenta}${filesWithHits}${colors.reset} ไฟล์`,
    `⏱️ เวลา: ${colors.blue}${hhmmss(elapsedSec)}${colors.reset}`,
    `🏷️ โดย: ${colors.purple}${CREDIT_NAME}${colors.reset}`
  ];
  
  if (resultPath) {
    resultData.push(`💾 ไฟล์: ${colors.orange}${path.basename(resultPath)}${colors.reset}`);
  }
  
  console.log(createMobileBox("🎯 สรุปผลลัพธ์", resultData, colors.green));
  
  // เอฟเฟกต์ความสำเร็จ
  if (totalLines > 0) {
    console.log();
    await hologramText("🎉 ค้นหาสำเร็จ!", 100);
  } else {
    console.log();
    console.log(colors.red + colors.bright + "💭 ไม่พบข้อมูลที่ค้นหา" + colors.reset);
  }
}

async function statsMenu() {
  console.clear();
  const sysInfo = getSystemInfo();
  const device = detectDevice();
  
  console.log(createMobileBorder("📊 สถิติระบบ", "═", colors.blue + colors.bright));
  console.log();

  console.log(colors.yellow + "🔄 วิเคราะห์ระบบ..." + colors.reset);
  await new Promise(resolve => setTimeout(resolve, 800));

  const files = await getAllTxtFilesFromTargets();
  let totalSize = 0;

  for (const file of files) {
    try {
      const stats = await fsp.stat(file);
      totalSize += stats.size;
    } catch (e) {
      // ข้ามไฟล์ที่อ่านไม่ได้
    }
  }

  console.clear();
  console.log(createMobileBorder("📈 รายงานระบบ", "▓", colors.cyan + colors.bright));
  console.log();
  
  const systemData = [
    `${device.icon} ${device.type}`,
    `🖥️ ${sysInfo.hostname.slice(0,15)}`,
    `💾 ${sysInfo.freeRAM}/${sysInfo.totalRAM}GB`,
    `⚙️ ${sysInfo.cpuCores} cores`,
    `🏗️ ${sysInfo.platform}/${sysInfo.arch}`,
    `📊 Load: ${sysInfo.loadAvg}%`,
    `⏰ ${hhmmss(sysInfo.uptime)}`
  ];
  
  console.log(createMobileBox("💻 ระบบ", systemData, colors.cyan));
  console.log();
  
  const dataStats = [
    `📁 ${SEARCH_DIR}`,
    `📄 ${files.length.toLocaleString()} ไฟล์`,
    `💾 ${(totalSize / 1024 / 1024).toFixed(2)} MB`,
    `🔧 ${PARALLEL_FILES} parallel`,
    `⚡ ${(READ_CHUNK_SIZE / 1024 / 1024).toFixed(1)}MB chunks`
  ];
  
  console.log(createMobileBox("📊 ข้อมูล", dataStats, colors.green));
}

async function settingsMenu() {
  console.clear();
  
  console.log(createMobileBorder("⚙️ การตั้งค่า", "═", colors.yellow + colors.bright));
  console.log();

  const configData = [
    `🗂️ เส้นทางค้นหา: ${colors.cyan}${TARGET_PATHS.length} paths${colors.reset}`,
    `📱 Android: ${colors.orange}/storage/emulated/0/Download${colors.reset}`,
    `👤 ผู้พัฒนา: ${colors.magenta}${CREDIT_NAME}${colors.reset}`,
    `🔧 Parallel: ${colors.green}${PARALLEL_FILES}${colors.reset}`,
    `⚡ Chunk: ${colors.yellow}${(READ_CHUNK_SIZE / 1024 / 1024).toFixed(1)}MB${colors.reset}`,
    `🔄 Dedupe: ${colors.blue}${RESULT_DEDUPE ? 'เปิด' : 'ปิด'}${colors.reset}`
  ];
  
  console.log(createMobileBox("📋 การตั้งค่า", configData, colors.yellow));
  console.log();
  console.log(colors.dim + "💡 แก้ไขได้ในไฟล์ index.js" + colors.reset);
}

async function helpMenu() {
  console.clear();
  
  console.log(createMobileBorder("💡 คู่มือใช้งาน", "═", colors.green + colors.bright));
  console.log();

  console.log(colors.yellow + colors.bright + "📖 วิธีใช้:" + colors.reset);
  console.log();
  
  console.log(colors.cyan + "1️⃣ การค้นหา:" + colors.reset);
  console.log("  • ใส่คำที่ต้องการค้นหา");
  console.log("  • รองรับ URL และอีเมล");
  console.log("  • ค้นหาแบบ real-time");
  console.log();
  
  console.log(colors.cyan + "2️⃣ ตัวอย่าง:" + colors.reset);
  console.log("  🌐 example.com");
  console.log("  📧 admin@email.com");
  console.log("  🔑 password123");
  console.log();
  
  console.log(colors.cyan + "3️⃣ การเตรียมข้อมูล:" + colors.reset);
  console.log("  • วางไฟล์ .txt ใน cmdlo");
  console.log("  • รองรับโฟลเดอร์ย่อย");
  console.log("  • สแกนอัตโนมัติ");
  console.log();
  
  console.log(colors.purple + colors.bright + `💝 ${CREDIT_NAME} Elite Team` + colors.reset);
}

// =============== MAIN LOOP ===============
async function mainLoop() {
  while (true) {
    await printBanner();
    await printMenu();

    const choice = await new Promise((resolve) => {
      rl.question(colors.bright + colors.cyan + "🎯 เลือกเมนู (1-5): " + colors.reset, resolve);
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
        colorLog("│                        👋 ขอบคุณที่ใช้งาน!                             │", colors.green + colors.bright);
        colorLog("│                                                                         │", colors.green);
        colorLog(`│  💝 ${CREDIT_NAME} Elite - ระบบค้นหาข้อมูลอัจฉริยะระดับสูง            │`, colors.green);
        colorLog("│                                                                         │", colors.green);
        colorLog("╰─────────────────────────────────────────────────────────────────────────╯", colors.green + colors.bright);
        rl.close();
        process.exit(0);
        break;
      default:
        colorLog("❌ กรุณาเลือกเมนู 1-5 เท่านั้น!", colors.red + colors.bright);
    }

    console.log();
    await new Promise((resolve) => {
      rl.question(colors.dim + "กด Enter เพื่อกลับไปเมนูหลัก..." + colors.reset, resolve);
    });
  }
}

// =============== ULTIMATE STARTUP ANIMATION ===============
async function showStartupAnimation() {
  console.clear();
  
  // Phase 1: Holographic Boot Sequence (2.5s)
  console.log(cyberWave("INITIATING QUANTUM BOOT SEQUENCE"));
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const initFrames = [
    "⠋ กำลังเชื่อมต่อควอนตัม...",
    "⠙ โหลด Neural Networks...", 
    "⠹ เปิดใช้งาน AI Core...",
    "⠸ สร้าง Cyber Defense...",
    "⠼ สแกน Matrix Database...",
    "⠴ ตั้งค่า Hologram Engine...",
    "⠦ เชื่อมต่อ Cyber Space...",
    "⠧ ระบบพร้อมทำงาน!"
  ];
  
  for (let i = 0; i < initFrames.length; i++) {
    const holoColor = [colors.neonCyan, colors.neonPink, colors.neonGreen, colors.electricBlue][i % 4];
    process.stdout.write("\r" + holoColor + colors.bright + "🚀 " + initFrames[i] + " " + "░▒▓█".repeat(i + 1) + colors.reset);
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  
  console.log("\n");
  
  // Phase 2: Epic ASCII Art with Holographic Effect (3s)
  await hologramText("CONSTRUCTING DIGITAL REALITY", 100);
  console.log();
  
  const asciiLines = [
    "",
    "   ██████╗██╗   ██╗██████╗ ███████╗██████╗     ███████╗██╗     ██╗████████╗███████╗",
    "  ██╔════╝╚██╗ ██╔╝██╔══██╗██╔════╝██╔══██╗    ██╔════╝██║     ██║╚══██╔══╝██╔════╝",
    "  ██║      ╚████╔╝ ██████╔╝█████╗  ██████╔╝    █████╗  ██║     ██║   ██║   █████╗  ",
    "  ██║       ╚██╔╝  ██╔══██╗██╔══╝  ██╔══██╗    ██╔══╝  ██║     ██║   ██║   ██╔══╝  ",
    "  ╚██████╗   ██║   ██████╔╝███████╗██║  ██║    ███████╗███████╗██║   ██║   ███████╗",
    "   ╚═════╝   ╚═╝   ╚═════╝ ╚══════╝╚═╝  ╚═╝    ╚══════╝╚══════╝╚═╝   ╚═╝   ╚══════╝",
    "",
    "        🔥💀 CYBER SCIENCE ELITE 💀🔥",
    "     ⚡🌌 Advanced Search Engine v2.0 🌌⚡",
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
  console.log(glowEffect("🌊 MATRIX DIGITAL RAIN ACTIVATED"));
  await digitalRain(2500);
  
  // Phase 4: System Analysis with Holographic Status (1.5s)
  console.log(cyberWave("PERFORMING DEEP SYSTEM ANALYSIS"));
  
  const statusChecks = [
    { text: "QUANTUM CPU", status: "ONLINE", color: colors.neonGreen },
    { text: "NEURAL RAM", status: "OPTIMIZED", color: colors.neonBlue },
    { text: "CRYPTO STORAGE", status: "ENCRYPTED", color: colors.neonPink },
    { text: "CYBER NETWORK", status: "SECURED", color: colors.gold },
    { text: "AI DEFENSE", status: "MAXIMUM", color: colors.crimson }
  ];
  
  for (const check of statusChecks) {
    console.log(`${check.color}${colors.bright}▓▒░ ${check.text}: ${colors.blink}${check.status}${colors.reset} ${check.color}░▒▓${colors.reset}`);
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  
  // Phase 5: Epic Countdown with Holographic Effects (2s)
  console.log("\n" + glowEffect("🎯 ENTERING CYBER DIMENSION"));
  const countdown = ["▓▓▓", "▓▓░", "▓░░", "💥 LAUNCH!"];
  
  for (const count of countdown) {
    process.stdout.write("\r" + colors.hotPink + colors.bright + colors.blink + "   ◢◤ " + count + " ◥◣   " + colors.reset);
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log("\n");
  
  // Phase 6: Ultimate Activation Flash (1s)
  const flashMessages = [
    "⚡ QUANTUM SYSTEMS ACTIVATED ⚡",
    "💫 HOLOGRAPHIC INTERFACE READY 💫", 
    "🚀 CYBER ELITE ENGINE ONLINE 🚀"
  ];
  
  for (let i = 0; i < 5; i++) {
    const msg = flashMessages[i % flashMessages.length];
    console.log(colors.bgWhite + colors.bright + colors.blink + "                    " + msg + "                    " + colors.reset);
    await new Promise(resolve => setTimeout(resolve, 150));
    process.stdout.write("\r" + " ".repeat(80) + "\r");
    await new Promise(resolve => setTimeout(resolve, 150));
  }
  
  // Final Welcome with Ultimate Style
  await hologramText("🎉 ยินดีต้อนรับสู่ CyberScience Elite Dimension! 🎉", 100);
  console.log();
  console.log(cyberWave("READY FOR QUANTUM OPERATIONS"));
  console.log("");
}

// เริ่มต้นโปรแกรม
(async () => {
  await showStartupAnimation();
  mainLoop().catch(console.error);
})();
