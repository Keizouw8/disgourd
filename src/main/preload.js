const { contextBridge, ipcRenderer } = require("electron/renderer");

contextBridge.exposeInMainWorld("electronAPI", {
	onUser: (cb) => ipcRenderer.on("user", cb),
	createServer: (data) => ipcRenderer.invoke("createServer", data),
	createChannel: (data) => ipcRenderer.invoke("createChannel", data),
	listenTo: (channel) => ipcRenderer.send("listenTo", channel)
});
