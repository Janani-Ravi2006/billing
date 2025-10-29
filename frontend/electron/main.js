import { app, BrowserWindow } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import { spawn } from "child_process";
import fetch from "node-fetch";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let win;
let backendProcess;
const BACKEND_PORT = 5000;

// 🔹 Start backend server
function startBackend() {
  const isDev = !!process.env.VITE_DEV_SERVER_URL;
  let backendPath;

  if (isDev) {
    // During development, run from project folder
    backendPath = path.join(__dirname, "..", "..", "backend", "server.js");
  } else {
    // ✅ In production, run from unpacked resources folder
    backendPath = path.join(
      process.resourcesPath,
      "app.asar.unpacked",
      "backend",
      "server.js"
    );
  }

  console.log("🚀 Starting backend at:", backendPath);

  try {
    backendProcess = spawn(
      process.execPath, // Node executable bundled with Electron
      [backendPath],
      { stdio: "inherit", shell: true }
    );

    backendProcess.on("error", (err) => {
      console.error("❌ Backend failed to start:", err);
    });

    backendProcess.on("exit", (code, signal) => {
      console.log(`⚠️ Backend exited with code ${code}, signal ${signal}`);
    });
  } catch (err) {
    console.error("❌ Error starting backend:", err);
  }
}

// 🔹 Wait for backend to be ready
async function waitForBackend(url, retries = 50, delay = 200) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        console.log("✅ Backend is ready!");
        return true;
      }
    } catch (err) {
      console.log(`⏳ Attempt ${i + 1}/${retries}: Backend not ready...`);
    }
    await new Promise((r) => setTimeout(r, delay));
  }
  console.error("❌ Backend did not start in time");
  return false;
}

// 🔹 Create Electron window
async function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"), // Optional IPC preload
    },
  });

  const isDev = !!process.env.VITE_DEV_SERVER_URL;

  try {
    if (isDev) {
      const url = process.env.VITE_DEV_SERVER_URL || "http://localhost:5173";
      await waitForBackend(`http://localhost:${BACKEND_PORT}/health`);
      await win.loadURL(url);
      win.webContents.openDevTools();
    } else {
      const indexHtml = path.join(__dirname, "..", "dist", "index.html");
      await waitForBackend(`http://localhost:${BACKEND_PORT}/health`);
      await win.loadFile(indexHtml);
    }
  } catch (err) {
    console.error("❌ Error loading window:", err);
    win.loadURL(
      `data:text/html,<h1>Error loading app</h1><p>${err.message}</p>`
    );
  }

  win.on("closed", () => {
    win = null;
  });
}

// 🔹 Start app
app.whenReady().then(async () => {
  startBackend();
  await createWindow();
});

// 🔹 Quit app & kill backend
app.on("window-all-closed", () => {
  if (backendProcess) {
    console.log("🛑 Killing backend process...");
    backendProcess.kill();
  }
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// 🔹 Catch uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("💥 Uncaught Exception:", err);
});
