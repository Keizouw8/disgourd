window.electronAPI.onError((_, error) => alert(error));

document.getElementById("login").addEventListener("click", function(){
	window.electronAPI.login({
		username: document.getElementById("username").value,
		password: document.getElementById("password").value,
	});
});

document.getElementById("register").addEventListener("click", function(){
	window.electronAPI.register({
		username: document.getElementById("username").value,
		password: document.getElementById("password").value,
	});
});
