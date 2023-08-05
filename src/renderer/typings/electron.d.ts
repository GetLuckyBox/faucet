/**
 * Should match main/preload.ts for typescript support in renderer
 */
export default interface ElectronApi {
  sendMessage: (message: string) => void
  loadPipeJsonContent: () => object
  addPipe: (row: string) => boolean
  editPipe: (row: string) => boolean
  delPipe: (row: string) => boolean
  startPipe: (row: string) => boolean
  closePipe: (row: string) => boolean
  isPortReachable: (row: string) => boolean
  loadEnvJsonContent: () => object
}

declare global {
  interface Window {
    electronAPI: ElectronApi,
  }
}
