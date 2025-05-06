const { contextBridge, ipcRenderer } = require("electron/renderer");

contextBridge.exposeInMainWorld("electronAPI", {
	login: (info) => ipcRenderer.send("auth", { type: "login", info }),
	register: (info) => ipcRenderer.send("auth", { type: "register", info }),
	onError: (cb) => ipcRenderer.on("error", cb)
});
