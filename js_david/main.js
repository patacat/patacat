// Globals

let canvas;
let ctx;
let assets = {};
let keys = {};

let width = 2560; // TODO
let height = 1350; // TODO


// Helpers


// Players

const player1 = {
	x: 0.25 * width,
	y: 0.5 * height,

	damaged: false,

	v: 0,
	dir: 0
};

const player2 = {
	x: 0.75 * width,
	y: 0.5 * height,

	damaged: false,

	v: 0,
	dir: 0
};


const MAX_V = 20;
const ACCEL = 1;


const update = () => {
	if (keys["ArrowUp"] && !keys["ArrowLeft"] && !keys["ArrowRight"] && !keys["ArrowDown"]) {
		player2.v = Math.min(player2.v + ACCEL, MAX_V);
		player2.dir = 90 * Math.PI / 180;
	} else if (keys["ArrowUp"] && keys["ArrowLeft"] && !keys["ArrowRight"] && !keys["ArrowDown"]) {
		player2.v = Math.min(player2.v + ACCEL, MAX_V);
		player2.dir = 135 * Math.PI / 180;
	} else if (keys["ArrowUp"] && !keys["ArrowLeft"] && keys["ArrowRight"] && !keys["ArrowDown"]) {
		player2.v = Math.min(player2.v + ACCEL, MAX_V);
		player2.dir = 45 * Math.PI / 180;
	} else if (!keys["ArrowUp"] && !keys["ArrowLeft"] && !keys["ArrowRight"] && keys["ArrowDown"]) {
		player2.v = Math.min(player2.v + ACCEL, MAX_V);
		player2.dir = 270 * Math.PI / 180;
	} else if (!keys["ArrowUp"] && keys["ArrowLeft"] && !keys["ArrowRight"] && keys["ArrowDown"]) {
		player2.v = Math.min(player2.v + ACCEL, MAX_V);
		player2.dir = 225 * Math.PI / 180;
	} else if (!keys["ArrowUp"] && !keys["ArrowLeft"] && keys["ArrowRight"] && keys["ArrowDown"]) {
		player2.v = Math.min(player2.v + ACCEL, MAX_V);
		player2.dir = 315 * Math.PI / 180;
	} else if (!keys["ArrowUp"] && !keys["ArrowLeft"] && keys["ArrowRight"] && !keys["ArrowDown"]) {
		player2.v = Math.min(player2.v + ACCEL, MAX_V);
		player2.dir = 0;
	} else if (!keys["ArrowUp"] && keys["ArrowLeft"] && !keys["ArrowRight"] && !keys["ArrowDown"]) {
		player2.v = Math.min(player2.v + ACCEL, MAX_V);
		player2.dir = 180 * Math.PI / 180;
	} else {
		if (player2.v < 0.01) player2.v = 0;
		else player2.v *= 0.8;
	}

	if (keys["w"] && !keys["a"] && !keys["d"] && !keys["s"]) {
		player1.v = Math.min(player1.v + ACCEL, MAX_V);
		player1.dir = 90 * Math.PI / 180;
	} else if (keys["w"] && keys["a"] && !keys["d"] && !keys["s"]) {
		player1.v = Math.min(player1.v + ACCEL, MAX_V);
		player1.dir = 135 * Math.PI / 180;
	} else if (keys["w"] && !keys["a"] && keys["d"] && !keys["s"]) {
		player1.v = Math.min(player1.v + ACCEL, MAX_V);
		player1.dir = 45 * Math.PI / 180;
	} else if (!keys["w"] && !keys["a"] && !keys["d"] && keys["s"]) {
		player1.v = Math.min(player1.v + ACCEL, MAX_V);
		player1.dir = 270 * Math.PI / 180;
	} else if (!keys["w"] && keys["a"] && !keys["d"] && keys["s"]) {
		player1.v = Math.min(player1.v + ACCEL, MAX_V);
		player1.dir = 225 * Math.PI / 180;
	} else if (!keys["w"] && !keys["a"] && keys["d"] && keys["s"]) {
		player1.v = Math.min(player1.v + ACCEL, MAX_V);
		player1.dir = 315 * Math.PI / 180;
	} else if (!keys["w"] && !keys["a"] && keys["d"] && !keys["s"]) {
		player1.v = Math.min(player1.v + ACCEL, MAX_V);
		player1.dir = 0;
	} else if (!keys["w"] && keys["a"] && !keys["d"] && !keys["s"]) {
		player1.v = Math.min(player1.v + ACCEL, MAX_V);
		player1.dir = 180 * Math.PI / 180;
	} else {
		if (player1.v < 0.01) player1.v = 0;
		else player1.v *= 0.8;
	}

	// Update positions

	player1.x += Math.cos(player1.dir) * player1.v;
	player1.y -= Math.sin(player1.dir) * player1.v;

	player2.x += Math.cos(player2.dir) * player2.v;
	player2.y -= Math.sin(player2.dir) * player2.v;
};

const draw = () => {
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	// Draw Background
	ctx.drawImage(assets["plant"]["img"], 20, 680, 245, 500);

	ctx.drawImage(assets["couch"]["img"], 200, 730, 508, 450);
	ctx.drawImage(assets["large-couch"]["img"], 1400, 800, 1000, 366);

	// Player 1
	ctx.drawImage(assets["player1" + (player1.damaged ? "-damaged" : "")]["img"],
		player1.x - 100, player1.y - 100, 200, 200);

	// Player 2
	ctx.drawImage(assets["player2" + (player2.damaged ? "-damaged" : "")]["img"],
		player2.x - 100, player2.y - 100, 200, 200);
};


const gameLoop = () => {
	update();
	draw();

	window.requestAnimationFrame(gameLoop);
};


// Initialize!

document.addEventListener("DOMContentLoaded", () => {
	canvas = document.getElementById("main-canvas");
	ctx = canvas.getContext("2d");
	for (let img of document.querySelectorAll("div#assets img")) {
		assets[img.id] = {};
		assets[img.id]["img"] = img;
		assets[img.id]["w"] = img.width;
		assets[img.id]["h"] = img.height;
	}

	window.addEventListener("keyup", e => {
		keys[e.key] = false;
	});
	window.addEventListener("keydown", e => {
		keys[e.key] = true;
	});

	gameLoop();
});
