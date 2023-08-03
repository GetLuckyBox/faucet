import {app, BrowserWindow, ipcMain, session} from 'electron';
import {join} from 'path';
import * as fs from 'fs';
import { execSync,exec } from 'child_process';
import os from 'os';
import log from 'electron-log';
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
const pipeFileGlobalPath = join(faucetConfigDir, 'global.json');
const pipeFileInlandPath = join(faucetConfigDir, 'inland.json');
log.transports.file.resolvePath = () => join(faucetConfigDir, 'pipe.log')
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
  } else {
    const content = JSON.parse(fs.readFileSync(pipeFilePath, 'utf8'));
    if (! fs.existsSync(pipeFileGlobalPath)) {
      let global: object[] = [];
      (content as object[]).forEach((item: any) => {
        if ('global' == item.area) {
          global.push(item)
        }
      })
      fs.writeFileSync(pipeFileGlobalPath, JSON.stringify(global), 'utf8');
    }
    if (! fs.existsSync(pipeFileInlandPath)) {
      let inland: object[] = [];
      (content as object[]).forEach((item: any) => {
        if ('inland' == item.area) {
          inland.push(item)
        }
      })
      fs.writeFileSync(pipeFileInlandPath, JSON.stringify(inland), 'utf8');
    }
  }
  let globalConfigList = JSON.parse(fs.readFileSync(pipeFileGlobalPath, 'utf8'));
  console.log('load config')

  const inlandConfigList = JSON.parse(fs.readFileSync(pipeFileInlandPath, 'utf8'));
  for (const key in inlandConfigList) {
    globalConfigList.push(inlandConfigList[key])
  }
  return globalConfigList;
})

ipcMain.handle('addPipe', (event, item) => {
  let configFile = '';
  if (item.area == 'inland') {
    configFile = pipeFileInlandPath;
  } else {
    configFile = pipeFileGlobalPath;
  }
  let content = JSON.parse(fs.readFileSync(configFile, 'utf8'));
  (content as object[]).push(JSON.parse(item));
  fs.writeFileSync(configFile, JSON.stringify(content), 'utf8');
  return true;
})

ipcMain.handle('editPipe', (event, item) => {
  let globalContent = JSON.parse(fs.readFileSync(pipeFileGlobalPath, 'utf8'));
  let inlandContent = JSON.parse(fs.readFileSync(pipeFileInlandPath, 'utf8'));

  const editDate = JSON.parse(item);
  (globalContent as object[]).forEach((globalItem: any, globalKey) => {
    if (editDate.row.localPort === globalItem.localPort && editDate.row.area !== globalItem.area) {
      (globalContent as object[]).splice(globalKey, 1);
      (inlandContent as object[]).push(editDate.row)
    }
    if (editDate.row.localPort == globalItem.localPort && editDate.row.area == globalItem.area) {
      (globalContent as object[])[editDate.index] = editDate.row;
    }
  });

  (inlandContent as object[]).forEach((inlandItem: any, inlandKey) => {
    if (editDate.row.localPort == inlandItem.localPort && editDate.row.area != inlandItem.area) {
      (inlandContent as object[]).splice(inlandKey, 1);
      (globalContent as object[]).push(editDate.row)
    }
    if (editDate.row.localPort == inlandItem.localPort && editDate.row.area == inlandItem.area) {
      (inlandContent as object[])[editDate.index] = editDate.row;
    }

  });
  fs.writeFileSync(pipeFileGlobalPath, JSON.stringify(globalContent), 'utf8');
  fs.writeFileSync(pipeFileInlandPath, JSON.stringify(inlandContent), 'utf8');

  return true;
})

ipcMain.handle('delPipe', (event, item:any) => {
  item = JSON.parse(item);
  let configFile = '';
  console.log(item)
  if (item.area == 'inland') {
    configFile = pipeFileInlandPath;
  } else {
    configFile = pipeFileGlobalPath;
  }
  let content = JSON.parse(fs.readFileSync(configFile, 'utf8'));
  (content as object[]).splice(item.index, 1);
  console.log('del config')
  fs.writeFileSync(configFile, JSON.stringify(content), 'utf8');
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
  let cmd = '';
  if (os.platform() !== 'win32') {
    cmd = `ssh -o ProxyCommand="nc -x ${socket5} %h %p" -vNL ${localPort}:${remoteAddress} ${jumpAddress}`;
  } else {
    cmd = `ssh -o ProxyCommand="ncat --proxy-type socks5 --proxy ${socket5} %h %p" -vNL ${localPort}:${remoteAddress} ${jumpAddress}`;
  }
  const child = exec(cmd, (error, stdout, stderr) => {
    if (error) {
      log.error(error)
      return;
    }
  });
  if (os.platform() === 'win32') {
    try {
      const res = execSync(`tasklist | findstr ${child.pid} | findstr cmd` )
      // log.info(res.toString())
    } catch (e) {
      log.error(e)
      return false
    }
  }
  const pipePidFilePath = join(faucetConfigDir, String(pipeConfig.localPort));
  try {
    fs.writeFileSync(pipePidFilePath, String(child.pid), 'utf8');
  } catch (err) {
    log.error('创建文件时出错：', err);
  }
  return true;
})

ipcMain.handle('closePipe', (event, item) => {
  const pipeConfig = JSON.parse(item);
  const pipePidFilePath = join(faucetConfigDir, String(pipeConfig.localPort));
  if (fs.existsSync(pipePidFilePath)) {
    const pid = fs.readFileSync(pipePidFilePath, 'utf8')
    log.info(pid)
    if (parseInt(pid) > 0) {
      // todo 需要判断进程的cmd是否满足删除条件
      log.info('kill ',pid)
      process.kill(parseInt(pid))
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

