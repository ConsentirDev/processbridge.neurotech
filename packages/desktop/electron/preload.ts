import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  getClipboardText: () => ipcRenderer.invoke('get-clipboard-text'),
  setClipboardText: (text: string) => ipcRenderer.invoke('set-clipboard-text', text),
  hideOverlay: () => ipcRenderer.send('hide-overlay'),
  showOverlay: () => ipcRenderer.send('show-overlay'),
});

declare global {
  interface Window {
    electronAPI: {
      getClipboardText: () => Promise<string>;
      setClipboardText: (text: string) => Promise<void>;
      hideOverlay: () => void;
      showOverlay: () => void;
    };
  }
}
