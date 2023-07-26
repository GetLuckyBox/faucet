import {contextBridge, ipcRenderer} from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  sendMessage: (message: string) => ipcRenderer.send('message', message),
  loadPipeJsonContent: () => ipcRenderer.invoke('loadPipeJsonContent'),
  addPipe: (row: any) => ipcRenderer.invoke('addPipe', row),
  editPipe: (row: any) => ipcRenderer.invoke('editPipe', row),
  delPipe: (row: any) => ipcRenderer.invoke('delPipe', row),
  startPipe: (row) => ipcRenderer.invoke('startPipe', row),
  closePipe: (row) => ipcRenderer.invoke('closePipe', row),
})
