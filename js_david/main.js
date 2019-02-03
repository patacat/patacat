// Globals

const songs = [];
for (let i = 1; i <= 24; i++) {
	songs.push(`assets/songs/${i}.mp3`);
}

let currentSong = 0;

let canvas;
let ctx;
let assets = {};
let cats = [];
let keys = {};

let fireTime = 0;
let fire = 1;

let currentCats = [];

const SLOTS = [
	{x: 450, y: 760, angle: 0, occupied: false},
	{x: 590, y: 880, angle: 73, occupied: false},

	{x: 780, y: 480, angle: 0, occupied: false},

	{x: 1820, y: 835, angle: 0, occupied: false},
	{x: 2030, y: 835, angle: 0, occupied: false},
	{x: 2240, y: 835, angle: 0, occupied: false},

	{x: 2210, y: 580, angle: -68, occupied: false},
];

let width = 2560; // TODO
let height = 1350; // TODO


const CAT_LENGTH = 2000;


const PAT_FRAME_LENGTH = 100;


class Cat {
	constructor(time) {
		this.entering = true;
		this.leaving = false;
		this.patted = false;
		this.level = 0;
		this.cat = cats[Math.floor(Math.random() * cats.length)];

		this.initialTime = time;

		this.pattedTime = 0;
		this.pattedFrame = 0;

		let slot = Math.floor(Math.random() * SLOTS.length);
		while (SLOTS[slot].occupied) {
			slot = Math.floor(Math.random() * SLOTS.length);
		}
		this.slot = SLOTS[slot];
		this.slot.occupied = true;

		currentCats.push(this);
	};

	update(time) {
		if (this.entering && !this.patted) {
			this.level = Math.min(this.level + 0.1, 1.0);
			if (this.level >= 0.999) {
				this.entering = false;
			}
		}

		if (time - this.initialTime > CAT_LENGTH && !this.patted) {
			this.leaving = true;
		}

		if (this.patted) {
			if (this.pattedTime === 0) {
				this.pattedTime = time;
				this.pattedFrame = 1;
			} else if (time - this.pattedTime > PAT_FRAME_LENGTH && this.pattedFrame <= 4) {
				this.pattedTime = time;
				this.pattedFrame += 1
			} else if (time - this.pattedTime > PAT_FRAME_LENGTH && this.pattedFrame === 5) {
				for (let c in currentCats) {
					if (!currentCats.hasOwnProperty(c)) continue;
					if (currentCats[c] === this) {
						this.slot.occupied = false;
						currentCats.splice(c, 1);
					}
				}
			}
		}

		if (this.leaving && !this.patted) {
			this.level = Math.max(this.level - 0.1, 0.0);
			if (this.level <= 0.001) {
				// TODO: DELETE
				for (let c in currentCats) {
					if (!currentCats.hasOwnProperty(c)) continue;
					if (currentCats[c] === this) {
						this.slot.occupied = false;
						currentCats.splice(c, 1);
					}
				}
			}
		}
	}

	draw() {
		drawCatInSlot(this.cat, this.slot, this.level, this.pattedFrame);
	}
}


// Players

const player1 = {
	x: 0.25 * width + 50,
	y: 0.3 * height,

	damaged: false,
	patting: false,

	v: 0,
	dir: 0
};

const player2 = {
	x: 0.75 * width - 50,
	y: 0.3 * height,

	damaged: false,
	patting: false,

	v: 0,
	dir: 0
};


const MAX_V = 20;
const ACCEL = 1;


const CAT_INTERVAL = 1000;


let lastCat = 0;


const update = (time) => {
	// Cats

	currentCats.forEach(c => c.update(time));

	if (time - lastCat >= CAT_INTERVAL && currentCats.length < 3) {
		new Cat(time);
		lastCat = time;
	}


	// Controls

	if (keys["i"] && !keys["j"] && !keys["l"] && !keys["k"]) {
		player2.v = Math.min(player2.v + ACCEL, MAX_V);
		player2.dir = 90 * Math.PI / 180;
	} else if (keys["i"] && keys["j"] && !keys["l"] && !keys["k"]) {
		player2.v = Math.min(player2.v + ACCEL, MAX_V);
		player2.dir = 135 * Math.PI / 180;
	} else if (keys["i"] && !keys["j"] && keys["l"] && !keys["k"]) {
		player2.v = Math.min(player2.v + ACCEL, MAX_V);
		player2.dir = 45 * Math.PI / 180;
	} else if (!keys["i"] && !keys["j"] && !keys["l"] && keys["k"]) {
		player2.v = Math.min(player2.v + ACCEL, MAX_V);
		player2.dir = 270 * Math.PI / 180;
	} else if (!keys["i"] && keys["j"] && !keys["l"] && keys["k"]) {
		player2.v = Math.min(player2.v + ACCEL, MAX_V);
		player2.dir = 225 * Math.PI / 180;
	} else if (!keys["i"] && !keys["j"] && keys["l"] && keys["k"]) {
		player2.v = Math.min(player2.v + ACCEL, MAX_V);
		player2.dir = 315 * Math.PI / 180;
	} else if (!keys["i"] && !keys["j"] && keys["l"] && !keys["k"]) {
		player2.v = Math.min(player2.v + ACCEL, MAX_V);
		player2.dir = 0;
	} else if (!keys["i"] && keys["j"] && !keys["l"] && !keys["k"]) {
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


	// Patting

	if (!player1.patting && keys["e"]) {
		player1.patting = true;
		if (player1.x + 30 >= 930 && player1.x + 30 <= 930 + 250
			&& player1.y - 80 >= 478 && player1.y - 80 <= 478 + 164) {
			changeSound();
		} else {
			currentCats.forEach(c => {
				if (Math.pow(c.slot.x - (player1.x + 30), 2)
					+ Math.pow(c.slot.y - (player1.y - 80), 2) <= 40000) {
					if (!c.patted) {
						c.patted = true;
						c.pattedTime = time;
						console.log("pat", c);
					}
				}
			});
		}

	} else if (player1.patting && !keys["e"]) {
		player1.patting = false;
	}

	if (!player2.patting && keys["o"]) {
		player2.patting = true;
	} else if (player2.patting && !keys["o"]) {
		player2.patting = false;
	}


	// Update positions

	player1.x += Math.cos(player1.dir) * player1.v;
	player1.y -= Math.sin(player1.dir) * player1.v;

	player2.x += Math.cos(player2.dir) * player2.v;
	player2.y -= Math.sin(player2.dir) * player2.v;

	if (player1.x < 100 || player1.y < 100 || player1.x > width - 100 || player1.y > height - 100
		|| player2.x < 100 || player2.y < 100 || player2.x > width - 100 || player2.y > height - 100) {
		for (let k in keys) {
			if (!keys.hasOwnProperty(k)) continue;
			keys[k] = false;
		}
	}

	if (player1.x < 100 || player1.y < 100 || player1.x > width - 100 || player1.y > height - 100) {
		player1.dir = player1.dir - Math.PI;
	}

	if (player2.x < 100 || player2.y < 100 || player2.x > width - 100 || player2.y > height - 100) {
		player2.dir = player2.dir - Math.PI;
	}

	if (player1.x < 100) player1.x = 100;
	if (player1.y < 100) player1.y = 100;
	if (player1.x > width - 100) player1.x = width - 100;
	if (player1.y > height - 100) player1.y = height - 100;

	if (player2.x < 100) player2.x = 100;
	if (player2.y < 100) player2.y = 100;
	if (player2.x > width - 100) player2.x = width - 100;
	if (player2.y > height - 100) player2.y = height - 100;

	if (time - fireTime > 250) {
		fireTime = time;
		// noinspection UnnecessaryLocalVariableJS
		const oldFire = fire;
		while (fire === oldFire) fire = Math.round(1 + Math.random() * 3);
	}
};

const drawCatInSlot = (cat, slot, fraction, pattedFrame) => {
	ctx.translate(slot.x, slot.y);
	ctx.rotate(slot.angle * Math.PI / 180);
	if (pattedFrame === 0) {
		ctx.drawImage(cat.asset["img"], -100, -cat.draw_height + (cat.draw_height * (1 - fraction)), 200, cat.draw_height);
	} else if (pattedFrame < 5) {
		ctx.drawImage(assets["poof" + pattedFrame.toString()]["img"], -80, -100 + (80 * (1 - fraction)), 160, 160);
	}
	// ctx.drawImage(assets["couch"]["img"], 0, -cat.draw_height + (cat.draw_height * (1 - fraction)), 200, cat.draw_height);
	ctx.rotate(-slot.angle * Math.PI / 180);
	ctx.translate(-slot.x, -slot.y);
};

const getCatPat = (slot, fraction) => {
	// TODO
};

const draw = () => {
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	ctx.drawImage(assets["wallpaper"]["img"], 0, 0, 2883, 1350);
	ctx.drawImage(assets["floor"]["img"], -30, height - 340, 3101, 400);

	ctx.drawImage(assets["fireplace"]["img"], 630, -20, 832, 1160);

	ctx.drawImage(assets["frame"]["img"], 1630, 170, 600, 524);


	// Draw Cats

	currentCats.forEach(c => c.draw());


	// Draw Fore-Background

	ctx.drawImage(assets["boombox"]["img"], 930, 478, 250, 164);

	ctx.drawImage(assets["fire" + fire.toString()]["img"], 920, 890, 240, 244);

	ctx.drawImage(assets["pot"]["img"], 1200, 468, 202, 150);
	ctx.drawImage(assets["other-pot"]["img"], 680, 395, 240, 222);

	ctx.drawImage(assets["lamp"]["img"], 2090, 300, 270, 900);

	ctx.drawImage(assets["plant"]["img"], 20, 680, 245, 500);

	ctx.drawImage(assets["couch"]["img"], 200, 730, 508, 450);
	ctx.drawImage(assets["large-couch"]["img"], 1400, 820, 1000, 366);


	// Player 1

	if (player1.patting) {
		ctx.drawImage(assets["player1" + (player1.damaged ? "-damaged" : "")]["img"],
			player1.x - 85, player1.y - 85, 170, 170);
	} else {
		ctx.drawImage(assets["player1" + (player1.damaged ? "-damaged" : "")]["img"],
			player1.x - 100, player1.y - 100, 200, 200);
	}

	ctx.drawImage(assets["fire1" + (player1.damaged ? "-damaged" : "")]["img"],
		player1.x + 30, player1.y - 80, 20, 20);

	// Player 2

	if (player2.patting) {
		ctx.drawImage(assets["player2" + (player2.damaged ? "-damaged" : "")]["img"],
			player2.x - 85, player2.y - 85, 170, 170);
	} else {
		ctx.drawImage(assets["player2" + (player2.damaged ? "-damaged" : "")]["img"],
			player2.x - 100, player2.y - 100, 200, 200);
	}

	ctx.drawImage(assets["fire1" + (player2.damaged ? "-damaged" : "")]["img"],
		player2.x - 60, player2.y - 80, 20, 20);
};


const gameLoop = () => {
	const time = (new Date).getTime();

	update(time);
	draw(time);

	window.requestAnimationFrame(gameLoop);
};


const changeSound = () => {
	let randSong = Math.floor(Math.random() * songs.length);
	while (randSong === currentSong) {
		randSong = Math.floor(Math.random() * songs.length);
	}

	document.getElementById("beats").src = songs[randSong];
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

	for (let k in assets) {
		if (!assets.hasOwnProperty(k)) continue;
		if (k.substr(0, 4) === "cat-") {
			cats.push({
				asset: assets[k],
				draw_height: 200 * (assets[k]["h"] / assets[k]["w"])
			});
		}
	}

	window.addEventListener("keyup", e => {
		keys[e.key] = false;
	});
	window.addEventListener("keydown", e => {
		keys[e.key] = true;
	});

	document.getElementById("beats").addEventListener("ended", changeSound);

	changeSound();

	gameLoop();
});
