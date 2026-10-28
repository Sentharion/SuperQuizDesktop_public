import { app, BrowserWindow } from "electron";
import path from "path";
import { fileURLToPath } from "url";

function createWindow() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, "preload.js")
        },
        icon: path.join(__dirname, "../build/icon.ico"),
    });

    if (!app.isPackaged) {
        win.setMenuBarVisibility(false);
        win.loadURL("http://localhost:5173");
        win.webContents.openDevTools();
    } else {
        win.setMenuBarVisibility(false);
        win.loadFile(path.join(__dirname, "../dist/index.html"));
    }
}

app.whenReady().then(createWindow);