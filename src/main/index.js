var serverContainer = document.getElementById("serverContainer");
var exploreContainer = document.getElementById("exploreContainer");
var channelContainer = document.getElementById("channelContainer");
var serverid;
var channelid;

var menu = document.querySelector(".menu");

document.getElementById("shadow").addEventListener("click", () => document.querySelector("#centerMenu > .active").className = "");

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
	serverContainer.appendChild(div);
	document.getElementById("createServer").className = "";
	visibility = "";
});

document.getElementById("submitChannel").addEventListener("click", async function () {
	var name = document.getElementById("channelName").value;
	var category = document.querySelector("#createChannel #typeSelector span.active").innerText.toLowerCase();
	var { success, data } = await window.electronAPI.createChannel({ serverid, name, category });
	if (!success) return alert(data);
	var div = document.createElement("div");
	div.className = "channel";
	div.id = `channel${data}`;
	var img = document.createElement("img");
	img.className = "icon";
	img.src = `../assets/icons/${category == "text" ? "message_bubbles" : "pencil" }.svg`;
	var span = document.createElement("span");
	span.className = "name";
	span.innerText = name;
	div.appendChild(img);
	div.appendChild(span);
	div.addEventListener("click", () => setChannel(data));
	channelContainer.appendChild(div);
	document.getElementById("createChannel").className = "";
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
		exploreContainer.appendChild(div);
	}
}));

document.addEventListener("click", () => menu.style.display = "none");

document.addEventListener("contextmenu", function (e) {
	e.preventDefault();
});

document.getElementById("serverContainer").addEventListener("contextmenu", function(e){
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
		serverContainer.appendChild(div);
	};
});

async function setServer(sid){
	serverid = sid;
	document.querySelectorAll(".server").forEach(e => e.className = "server");
	document.querySelectorAll(`#server${sid}`).forEach(e => e.className = "server active");
	let response = await fetch(`https://gourd.madum.cc/channels/${sid}`, { method: "POST" });
	if (!response.ok) return;
	let channels = await response.json();
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
		channelContainer.appendChild(div);
	}
	setChannel(channels[0]?._id);
}

async function setChannel(cid){
	if(!cid){
		channelid = undefined;
		data = false;
		channelType = false;
		return document.querySelectorAll("#content > *").forEach(e => e.className = "");
	}
	channelid = cid;
	document.querySelectorAll(".channel").forEach(e => e.className = "channel");
	document.getElementById(`channel${cid}`).className = "channel active";
	let response = await fetch(`https://gourd.madum.cc/channel/${cid}`, { method: "POST" });
	if (!response.ok) return;
	let channel = await response.json();
	document.querySelectorAll("#content > *").forEach(e => e.className = "");
	document.querySelector(`#content > #${channel.category}`).className = "active";
	window.electronAPI.listenTo(channel.cid);
}

function showMenu(e){
	menu.style.display = "block";
	menu.style.top = e.clientY + "px";
	menu.style.left = e.clientX + "px";
}

document.querySelectorAll("#typeSelector span").forEach(e => e.addEventListener("click", function(){
	document.querySelectorAll("#typeSelector span").forEach(i => i.className = "");
	e.className = "active";
}))
