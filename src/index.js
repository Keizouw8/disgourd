const { app, BrowserWindow, ipcMain } = require("electron");
const settings = require("electron-settings");
const { io } = require("socket.io-client");
const path = require("node:path");

if (require("electron-squirrel-startup")) app.quit();

var token = settings.getSync("userToken");
var socket;
var user;

app.whenReady().then(async function(){
	const loadingWindow = new BrowserWindow({
		width: 300,
		height: 300,
		resizable: false,
		frame: false
	});
	loadingWindow.loadFile(path.join(__dirname, "loading/index.html"));
	await setup();
	loadingWindow.close();
	app.on("activate", () => !BrowserWindow.getAllWindows().length && createMainWindow());
});

app.on("window-all-closed", () => !token && app.quit());

ipcMain.on("listenTo", async function(_, channel){
	socket.emit("listenTo", channel);
});

ipcMain.on("auth", async function(event, auth){
	const response = await fetch(`https://gourd.madum.cc/${auth.type}`, {
		method: "POST",
		headers: { "content-type": "application/json" },
		body: JSON.stringify(auth.info)
	});

	if(!response.ok) return event.sender.send("error", await response.text());
	const value = await response.json();
	token = value.token;
	settings.setSync("userToken", token);
	user = await getInfo();
	createSocket(token);
	BrowserWindow.fromWebContents(event.sender).close();
	createMainWindow();
});

ipcMain.handle("createServer", async function(_, info){
	const response = await fetch(`https://gourd.madum.cc/api/createServer`, {
		method: "POST",
		headers: {
			"content-type": "application/json",
			"Authorization": `Bearer ${token}`
		},
		body: JSON.stringify(info)
	});
	if(!response.ok) return { success: false, data: await response.text() };
	const { token: data } = await response.json();
	return { success: true, data };
});

ipcMain.handle("createChannel", async function(_, info){
	const response = await fetch(`https://gourd.madum.cc/api/createChannel`, {
		method: "POST",
		headers: {
			"content-type": "application/json",
			"Authorization": `Bearer ${token}`
		},
		body: JSON.stringify(info)
	});
	if(!response.ok) return { success: false, data: await response.text() };
	const { token: data } = await response.json();
	return { success: true, data };
});

function createSocket(token){
	socket = io("https://gourd.madum.cc", { auth: { token } });
	socket.on("invalidUser", app.quit);
}

async function setup(){
	try {
		user = await getInfo();
	} catch {
		return await (new Promise((resolve) => setTimeout(async () => resolve(await setup()), 1000)));
	}
	if(!user) return createAuthWindow();
	createSocket(token);
	createMainWindow();
}

function createMainWindow(){
	const mainWindow = new BrowserWindow({
		width: 800,
		height: 600,
		minWidth: 400,
		minHeight: 400,
		webPreferences: {
			preload: path.join(__dirname, "main/preload.js")
		}
	});
	mainWindow.loadFile(path.join(__dirname, "main/index.html"));
	mainWindow.webContents.on("did-finish-load", async function(){
		mainWindow.webContents.send("user", user);
		try{
			user = await getInfo();
		}catch{
			console.log("Can't connect to server :(");
		}
		if(!user) app.quit();
		mainWindow.webContents.send("user", user);
	});
};

function createAuthWindow(){
	const authWindow = new BrowserWindow({
		width: 800,
		height: 600,
		minWidth: 400,
		minHeight: 400,
		webPreferences: {
			preload: path.join(__dirname, "auth/preload.js")
		}
	});
	authWindow.loadFile(path.join(__dirname, "auth/index.html"));
}

async function getInfo(){
	if(!token) return false;
	var response = await fetch(`https://gourd.madum.cc/api/me`, {
		method: "POST",
		headers: { "Authorization": `Bearer ${token}` }
	});
	if(response.ok) return await response.json();
	token = undefined;
	return false;
}
