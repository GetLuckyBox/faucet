import {app, BrowserWindow, ipcMain, session} from 'electron';
import {join} from 'path';
import * as fs from 'fs';
import {exec} from 'child_process';
import os from 'os';
function createWindow () {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    }
  });

  if (process.env.NODE_ENV === 'development') {
    const rendererPort = process.argv[2];
    mainWindow.loadURL(`http://localhost:${rendererPort}`);
  }
  else {
    mainWindow.loadFile(join(app.getAppPath(), 'renderer', 'index.html'));
  }
}

app.whenReady().then(() => {
  createWindow();

  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': ['script-src \'self\'']
      }
    })
  })

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
});

ipcMain.on('message', (event, message) => {
  console.log(message);
})
const faucetConfigDir = join(os.homedir(), 'faucet');
const pipeFilePath = join(faucetConfigDir, 'pipe.json');
ipcMain.handle('loadPipeJsonContent', () => {
// 检查目录是否存在，如果不存在，则创建目录
  if (!fs.existsSync(faucetConfigDir)) {
    try {
      fs.mkdirSync(faucetConfigDir, { recursive: true });
      console.log('目录创建成功');
    } catch (error) {
      console.log(error);
    }
  }

  if (! fs.existsSync(pipeFilePath)) {
    try {
      fs.writeFileSync(pipeFilePath, '[]', 'utf8');
    } catch (err) {
      console.error('创建文件时出错：', err);
    }
  }
  return JSON.parse(fs.readFileSync(pipeFilePath, 'utf8'));
})

ipcMain.handle('addPipe', (event, item) => {
  let content = JSON.parse(fs.readFileSync(pipeFilePath, 'utf8'));
  (content as object[]).push(JSON.parse(item));
  fs.writeFileSync(pipeFilePath, JSON.stringify(content), 'utf8');
  return true;
})

ipcMain.handle('editPipe', (event, item) => {
  let content = JSON.parse(fs.readFileSync(pipeFilePath, 'utf8'));
  const editDate = JSON.parse(item);
  (content as object[])[editDate.index] = editDate.row;
  fs.writeFileSync(pipeFilePath, JSON.stringify(content), 'utf8');
  return true;
})

ipcMain.handle('delPipe', (event, item) => {
  let content = JSON.parse(fs.readFileSync(pipeFilePath, 'utf8'));
  (content as object[]).splice(item, 1);
  fs.writeFileSync(pipeFilePath, JSON.stringify(content), 'utf8');
  return true
})

ipcMain.handle('startPipe', (event, item) => {
  const envList = JSON.parse(fs.readFileSync(envFilePath, 'utf8'));
  const pipeConfig = JSON.parse(item);
  let socket5 = '';
  for (const key in envList) {
    const item = envList[key];
    if (item.name == pipeConfig.area) {
      socket5 = item.socks5Address;
    }
  }
  if (socket5 == '') {
    return false
  }
  const localPort = pipeConfig.localPort;
  const remoteAddress = pipeConfig.remoteAddress;
  const jumpAddress = pipeConfig.jumpAddress;
  const cmd = `ssh -o ProxyCommand="nc -x ${socket5} %h %p" -vNL ${localPort}:${remoteAddress} ${jumpAddress}`;
  console.log(cmd)
  const child = exec(cmd, (error, stdout, stderr) => {
    if (error) {
      return;
    }
  });
  console.log( 'pid:' +child.pid);
  const pipePidFilePath = join(faucetConfigDir, String(pipeConfig.localPort));
  try {
    fs.writeFileSync(pipePidFilePath, String(child.pid), 'utf8');
  } catch (err) {
    console.error('创建文件时出错：', err);
  }
  return true;
})

ipcMain.handle('closePipe', (event, item) => {
  const pipeConfig = JSON.parse(item);
  const pipePidFilePath = join(faucetConfigDir, String(pipeConfig.localPort));
  if (fs.existsSync(pipePidFilePath)) {
    const pid = fs.readFileSync(pipePidFilePath, 'utf8')
    console.log(pid)
    if (parseInt(pid) > 0) {
      // todo 需要判断进程的cmd是否满足删除条件
      process.kill(parseInt(pid));
      fs.writeFileSync(pipePidFilePath, String(0), 'utf8');
    }
  }
  return true;
})

const envFilePath = join(faucetConfigDir, 'env.json');
ipcMain.handle('loadEnvJsonContent', () => {
  if (! fs.existsSync(envFilePath)) {
    try {
      const init = '[{"socks5Address":"127.0.0.1:10801","name":"global"},{"socks5Address":"127.0.0.1:10800","name":"inland"}]';
      fs.writeFileSync(envFilePath, init, 'utf8');
    } catch (err) {
      console.error('创建文件时出错：', err);
    }
  }
  return JSON.parse(fs.readFileSync(envFilePath, 'utf8'));
})

