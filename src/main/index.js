var serverContainer = document.getElementById("serverContainer");
var exploreContainer = document.getElementById("exploreContainer");
var channelContainer = document.getElementById("channelContainer");
var serverid;
var channelid;

var menu = document.querySelector(".menu");

document.getElementById("shadow").addEventListener("click", () => document.querySelector("#centerMenu > .active").className = "");

document.getElementById("send").addEventListener("click", sendMessage);
document.getElementById("message").addEventListener("keydown", (e) => e.keyCode == 13 && sendMessage());

document.getElementById("submitServer").addEventListener("click", async function () {
	var name = document.getElementById("serverName").value;
	var visibility = document.getElementById("serverVisibility").checked;
	var { success, data } = await window.electronAPI.createServer({ name, visibility });
	if (!success) return alert(data);
	var div = document.createElement("div");
	div.className = "server";
	div.id = `server${data}`;
	var img = document.createElement("img");
	img.className = "icon";
	img.src = `https://gourd.madum.cc/icon/${data}`;
	var span = document.createElement("span");
	span.className = "name";
	span.innerText = name;
	div.appendChild(img);
	div.appendChild(span);
	div.addEventListener("click", () => setServer(data));
	div.addEventListener("contextmenu", function (e) {
		menu.innerHTML = "";
		var invite = document.createElement("span");
		invite.innerText = "Invite user";
		invite.addEventListener("click", function(){
			document.getElementById("invitedUsername").value = "";
			document.getElementById("inviteUser").className = "active";
		});
		menu.appendChild(invite);
		var span = document.createElement("span");
		span.innerText = "Delete server";
		span.addEventListener("click", async function () {
			let { success, reason } = await window.electronAPI.deleteServer({ id: data });
			if (!success) return alert(reason);
		});
		menu.appendChild(span);
		showMenu(e);
	});
	serverContainer.appendChild(div);
	document.getElementById("createServer").className = "";
});

document.getElementById("submitChannel").addEventListener("click", async function () {
	var name = document.getElementById("channelName").value;
	var category = document.querySelector("#createChannel #typeSelector span.active").innerText.toLowerCase();
	var { success, data } = await window.electronAPI.createChannel({ serverid, name, category });
	if (!success) return alert(data);
	document.getElementById("createChannel").className = "";
});

document.getElementById("submitUser").addEventListener("click", async function () {
	var username = document.getElementById("invitedUsername").value;
	var { success, reason } = await window.electronAPI.inviteUser({ serverid, username });
	alert(success ? `Invited ${username}` : reason);
	if(success) document.getElementById("inviteUser").className = "";
});

document.querySelectorAll(".sidebar-selector").forEach(selector => selector.addEventListener("click", async function(){
	document.querySelectorAll(".drawer > div").forEach(e => e.className = "container");
	document.getElementById(selector.dataset.target).className = "container active";
	if (selector.dataset.target != "exploreContainer") return;
	let response = await fetch("https://gourd.madum.cc/servers", {
		method: "POST"
	});
	if (!response.ok) return;
	let servers = await response.json();
	exploreContainer.innerHTML = "";
	for(let server of servers){
		var div = document.createElement("div");
		div.className = "server";
		if(server._id == serverid) div.className += " active";
		div.id = `server${server._id}`;
		var img = document.createElement("img");
		img.className = "icon";
		img.src = `https://gourd.madum.cc/icon/${server._id}`;
		var span = document.createElement("span");
		span.className = "name";
		span.innerText = server.name;
		div.appendChild(img);
		div.appendChild(span);
		div.addEventListener("click", () => setServer(server._id));
		div.addEventListener("contextmenu", function(e){
			menu.innerHTML = "";
			var invite = document.createElement("span");
			invite.innerText = "Invite user";
			invite.addEventListener("click", function(){
				document.getElementById("invitedUsername").value = "";
				document.getElementById("inviteUser").className = "active";
			});
			menu.appendChild(invite);
			var span = document.createElement("span");
			span.innerText = "Delete server";
			span.addEventListener("click", async function () {
				let { success, reason } = await window.electronAPI.deleteServer({ id: server._id });
				if (!success) return alert(reason);
			});
			menu.appendChild(span);
			showMenu(e);
		});
		exploreContainer.appendChild(div);
	}
}));

document.addEventListener("click", () => menu.style.display = "none");

document.addEventListener("contextmenu", function (e) {
	e.preventDefault();
});

document.getElementById("serverContainer").addEventListener("contextmenu", function(e){
	if (e.target != document.getElementById("serverContainer")) return;
	menu.innerHTML = "";
	var span = document.createElement("span");
	span.innerText = "Create server";
	span.addEventListener("click", function(){
		document.getElementById("serverName").value = "";
		document.getElementById("serverVisibility").checked = false;
		document.getElementById("createServer").className = "active";
	});
	menu.appendChild(span);
	showMenu(e);
});

document.getElementById("channelContainer").addEventListener("contextmenu", function(e){
	if (e.target != document.getElementById("channelContainer")) return;
	menu.innerHTML = "";
	var span = document.createElement("span");
	span.innerText = "Create channel";
	span.addEventListener("click", function(){
		document.getElementById("channelName").value = "";
		document.querySelector("#createChannel #typeSelector span.active").className = "";
		document.querySelector("#createChannel #typeSelector span").className = "active";
		document.getElementById("createChannel").className = "active";
	});
	menu.appendChild(span);
	showMenu(e);
});

window.electronAPI.onUser(function(_, user){
	// document.getElementById("username").innerText = user.username;
	document.getElementById("user-pfp").src = `https://gourd.madum.cc/pfp/${user._id}`;
	serverContainer.innerHTML = "";
	for(let server of user.servers){
		var div = document.createElement("div");
		div.className = "server";
		if(server._id == serverid) div.className += " active";
		div.id = `server${server._id}`;
		var img = document.createElement("img");
		img.className = "icon";
		img.src = `https://gourd.madum.cc/icon/${server._id}`;
		var span = document.createElement("span");
		span.className = "name";
		span.innerText = server.name;
		div.appendChild(img);
		div.appendChild(span);
		div.addEventListener("click", () => setServer(server._id));
		div.addEventListener("contextmenu", function (e) {
			menu.innerHTML = "";
			var invite = document.createElement("span");
			invite.innerText = "Invite user";
			invite.addEventListener("click", function(){
				document.getElementById("invitedUsername").value = "";
				document.getElementById("inviteUser").className = "active";
			});
			menu.appendChild(invite);
			var span = document.createElement("span");
			span.innerText = "Delete server";
			span.addEventListener("click", async function () {
				let { success, reason } = await window.electronAPI.deleteServer({ id: server._id });
				if (!success) return alert(reason);
			});
			menu.appendChild(span);
			showMenu(e);
		});
		serverContainer.appendChild(div);
	};
});

window.electronAPI.onMessage(function (_, { user, username, message }) {
	var div = document.createElement("div");
	div.className = "message";
	var img = document.createElement("img");
	img.src = `https://gourd.madum.cc/pfp/${user}`;
	var section = document.createElement("span");
	section.className = "vertical";
	var name = document.createElement("span");
	name.className = "name";
	name.innerText = username;
	var content = document.createElement("span");
	content.className = "content";
	content.innerText = message;
	section.append(name, content);
	div.append(img, section);
	document.getElementById("messageContainer").appendChild(div);
});

window.electronAPI.onDeletedChannel(function(_, id){
	document.getElementById(`channel${id}`).remove();
	if(id == channelid) setChannel(document.querySelector(".channel")?.id?.replace("channel", ""));
});
window.electronAPI.onDeletedServer(function(_, id){
	document.querySelectorAll(`#server${id}`).forEach(e => e.remove());
	if(id == serverid) setServer(document.querySelector(".server")?.id?.replace("server", ""))
});

window.electronAPI.onNewChannel(function(_, { id, name, category }){
	var div = document.createElement("div");
	div.className = "channel";
	div.id = `channel${id}`;
	var img = document.createElement("img");
	img.className = "icon";
	img.src = `../assets/icons/${category == "text" ? "message_bubbles" : "pencil" }.svg`;
	var span = document.createElement("span");
	span.className = "name";
	span.innerText = name;
	div.appendChild(img);
	div.appendChild(span);
	div.addEventListener("click", () => setChannel(id));
	div.addEventListener("contextmenu", function (e) {
		menu.innerHTML = "";
		var span = document.createElement("span");
		span.innerText = "Delete channel";
		span.addEventListener("click", async function () {
			let { success, reason } = await window.electronAPI.deleteChannel({ channelid: id });
			if (!success) return alert(reason);
		});
		menu.appendChild(span);
		showMenu(e);
	});
	channelContainer.appendChild(div);
});

async function setServer(sid){
	document.querySelectorAll(".server").forEach(e => e.className = "server");
	serverid = sid;
	if(!sid){
		channelContainer.innerHTML = "";
		setChannel(false);
	}
	document.querySelectorAll(".server").forEach(e => e.className = "server");
	document.querySelectorAll(`#server${sid}`).forEach(e => e.className = "server active");
	let response = await fetch(`https://gourd.madum.cc/channels/${sid}`, { method: "POST" });
	if (!response.ok) return;
	let channels = await response.json();
	window.electronAPI.listenToServer(sid);
	channelContainer.innerHTML = "";
	for(let channel of channels){
		var div = document.createElement("div");
		div.className = "channel";
		if(channel._id == channel) div.className += " active";
		div.id = `channel${channel._id}`;
		var img = document.createElement("img");
		img.className = "icon";
		img.src = `../assets/icons/${channel.category == "text" ? "message_bubbles" : "pencil" }.svg`;
		var span = document.createElement("span");
		span.className = "name";
		span.innerText = channel.name;
		div.appendChild(img);
		div.appendChild(span);
		div.addEventListener("click", () => setChannel(channel._id));
		div.addEventListener("contextmenu", function (e) {
			menu.innerHTML = "";
			var span = document.createElement("span");
			span.innerText = "Delete channel";
			span.addEventListener("click", async function () {
				let { success, reason } = await window.electronAPI.deleteChannel({ channelid: channel._id });
				if (!success) return alert(reason);
			});
			menu.appendChild(span);
			showMenu(e);
		});
		channelContainer.appendChild(div);
	}
	setChannel(channels[0]?._id);
	document.querySelectorAll(".drawer > div").forEach(e => e.className = "container");
	document.getElementById("channelContainer").className = "container active";
}

async function setChannel(cid){
	document.querySelectorAll(".channel").forEach(e => e.className = "channel");
	channelid = cid;
	if(!cid){
		data = false;
		channelType = false;
		return document.querySelectorAll("#content > *").forEach(e => e.className = "");
	}
	document.getElementById(`channel${cid}`).className = "channel active";
	let response = await fetch(`https://gourd.madum.cc/channel/${cid}`, { method: "POST" });
	if (!response.ok) return;
	let channel = await response.json();
	window.electronAPI.listenToChannel(cid);
	document.getElementById("messageContainer").innerHTML = "";
	document.getElementById("message").value = "";
	if(channel.category == "text"){
		for(let { message, user, username } of channel.data){
			var div = document.createElement("div");
			div.className = "message";
			var img = document.createElement("img");
			img.src = `https://gourd.madum.cc/pfp/${user}`;
			var section = document.createElement("span");
			section.className = "vertical";
			var name = document.createElement("span");
			name.className = "name";
			name.innerText = username;
			var content = document.createElement("span");
			content.className = "content";
			content.innerText = message;
			section.append(name, content);
			div.append(img, section);
			document.getElementById("messageContainer").appendChild(div);
		}
	}
	document.querySelectorAll("#content > *").forEach(e => e.className = "");
	document.querySelector(`#content > #${channel.category}`).className = "active";
}

function showMenu(e){
	menu.style.display = "block";
	menu.style.top = e.clientY + "px";
	menu.style.left = e.clientX + "px";
}

document.querySelectorAll("#typeSelector span").forEach(e => e.addEventListener("click", function () {
	document.querySelectorAll("#typeSelector span").forEach(i => i.className = "");
	e.className = "active";
}));

let canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

let drawing = false;
let previousPosition = [0,0];
let points = [];

canvas.addEventListener("mousedown", function (e){
	console.log("mouse down started", ctx);
	drawing = true;

	let rect = canvas.getBoundingClientRect();

	let x = e.clientX - rect.left;
	let y = e.clientY - rect.top;
	previousPosition = [x, y];
});
canvas.addEventListener("mouseup", function (e){
	drawing = false;

	points = [];
});
canvas.addEventListener("mousemove", function (e){
	if (!drawing) return;
	let rect = canvas.getBoundingClientRect();

	let x = e.clientX - rect.left;
	let y = e.clientY - rect.top;

	ctx.beginPath();
	ctx.moveTo(...previousPosition);
	ctx.lineTo(x, y);
	ctx.stroke();

	previousPosition = [x, y];
});

function sendMessage(){
	window.electronAPI.sendMessage({ channelid, message: document.getElementById("message").value });
	document.getElementById("message").value = "";
}

document.querySelector(".settings .color input").addEventListener("change", function (e) {
	console.log("change occured", e.target.value);
	document.querySelector(".settings .color").style.background = e.target.value;
	ctx.strokeStyle = e.target.value;
});
