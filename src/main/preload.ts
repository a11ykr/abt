import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  onUpdateAbtList: (callback: (data: any) => void) => {
    const listener = (_event: any, value: any) => callback(value);
    ipcRenderer.on('update-abt-list', listener);
    return () => {
      ipcRenderer.removeListener('update-abt-list', listener);
    };
  },
  sendAbtData: (data: any) => ipcRenderer.send('abt-data-received', data),
});
