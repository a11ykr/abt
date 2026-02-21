import { app, BrowserWindow } from 'electron';
import * as path from 'path';
const WebSocket = require('ws');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const startUrl = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:5173' 
    : `file://${path.join(__dirname, '../renderer/index.html')}`;

  mainWindow.loadURL(startUrl);
}

function startWebSocketServer() {
  console.log('--- STARTING ABT DATA SERVER ---');
  try {
    const wss = new WebSocket.Server({ port: 8888 });

    wss.on('listening', () => {
      console.log('✅✅✅ ABT WebSocket Server is LIVE at ws://localhost:8888');
    });

    wss.on('connection', (ws) => {
      console.log('🤝 BROWSER CONNECTED');
      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message.toString());
          const windows = BrowserWindow.getAllWindows();
          if (windows.length > 0) {
            windows[0].webContents.send('update-abt-list', data);
          }
        } catch (e) {
          console.error('❌ Data parsing error');
        }
      });
    });

    wss.on('error', (err) => {
      console.error('❌ WS SERVER ERROR:', err.message);
    });
  } catch (e) {
    console.error('❌ CRITICAL WS INIT ERROR');
  }
}

// 먼저 서버를 띄움
startWebSocketServer();

app.whenReady().then(() => {
  console.log('App is ready, creating window...');
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
