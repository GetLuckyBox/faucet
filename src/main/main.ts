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
const documentsDir = join(os.homedir(), 'faucet');
const pipeFilePath = join(documentsDir, 'pipe.json');
ipcMain.handle('loadPipeJsonContent', () => {


// 检查目录是否存在，如果不存在，则创建目录
  if (!fs.existsSync(documentsDir)) {
    try {
      fs.mkdirSync(documentsDir, { recursive: true });
      console.log('目录创建成功');
    } catch (error) {
      console.log(error);
    }
  }

  if (! fs.existsSync(pipeFilePath)) {
    try {
      fs.writeFileSync(pipeFilePath, '[]', 'utf8');
      console.log('文本文件创建成功！');
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
  const pipeConfig = JSON.parse(item);
  // const sshConfigFilePath = join(__dirname, 'config')
  // ssh -vNL 27030:172.31.3.163:27017 root@18.138.243.238
  // ssh -o ProxyCommand="nc -x 127.0.0.1:3000 %h %p"
  const cmd = 'ssh -o ProxyCommand="nc -x 127.0.0.1:10801 %h %p" -vNL '  + pipeConfig.localPort + ':' + pipeConfig.remoteAddress + ' ' + pipeConfig.jumpAddress;
  // const pipeShellFilePath = join(__dirname, pipeConfig.localPort +'.sh')
  // fs.writeFileSync(pipeShellFilePath, cmd, 'utf8');

  exec("echo $USER", (error, stdout, stderr) => {
    if (error) {
      console.error(`执行脚本时出错3: ${error.message}`);
      return;
    }
    console.log(`脚本执行成功，输出3: ${stdout}`);
  });



  return true;
})

ipcMain.handle('closePipe', (event, item) => {
  const pipeConfig = JSON.parse(item);
  return true;
})
