const { contextBridge, ipcRenderer } = require("electron/renderer");

contextBridge.exposeInMainWorld("electronAPI", {
	onUser: (cb) => ipcRenderer.on("user", cb),
	onMessage: (cb) => ipcRenderer.on("message", cb),
	onNewChannel: (cb) => ipcRenderer.on("newChannel", cb),
	onDeletedChannel: (cb) => ipcRenderer.on("deletedChannel", cb),
	onDeletedServer: (cb) => ipcRenderer.on("deletedServer", cb),
	createServer: (data) => ipcRenderer.invoke("createServer", data),
	createChannel: (data) => ipcRenderer.invoke("createChannel", data),
	deleteChannel: (data) => ipcRenderer.invoke("deleteChannel", data),
	deleteServer: (data) => ipcRenderer.invoke("deleteServer", data),
	inviteUser: (data) => ipcRenderer.invoke("inviteUser", data),
	listenToChannel: (channel) => ipcRenderer.send("listenToChannel", channel),
	listenToServer: (server) => ipcRenderer.send("listenToServer", server),
	sendMessage: (data) => ipcRenderer.send("sendMessage", data),
});
