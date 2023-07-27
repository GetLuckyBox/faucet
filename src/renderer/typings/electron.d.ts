/**
 * Should match main/preload.ts for typescript support in renderer
 */
export default interface ElectronApi {
  sendMessage: (message: string) => void
  loadPipeJsonContent: () => object
  addPipe: (row: any) => boolean
  editPipe: (row: any) => boolean
  delPipe: (row: any) => boolean
  startPipe: (row: any) => boolean
  closePipe: (row: any) => boolean
  loadEnvJsonContent: () => object
}

declare global {
  interface Window {
    electronAPI: ElectronApi,
  }
}
