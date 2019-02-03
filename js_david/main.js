// Globals
let gs = 1.0;
const scale = window.devicePixelRatio;

function randomRetriever(count, creator) {
    const options = [];
    for (let i = 0; i < count; i++) {
        options.push(creator(i));
    }
    let current = 0;
    return {
        retrieve: function () {
            current = (current + 1 + Math.floor(Math.random() * (options.length - 1))) % options.length;
            return options[current];
        }
    };
}

const songRetriever = randomRetriever(24, (i) => {
    return `assets/songs/${i + 1}.mp3`;
});
const meowRetriever = randomRetriever(83, (i) => {
    return `assets/meows/${i + 1}.m4a`;
});

let canvas;
let ctx;
let assets = {};
let cats = [];
let keys = {};

let fireTime = 0;
let fire = 1;
let back = 1;

let fireCat = null;
let fireCatSlot = {x: 1050, y: 865, angle: 180, occupied: false, time: 0};

const RANDOM_ART = 1 + Math.floor(Math.random() * 4);

let currentCats = [];

let player1ScoreEl;
let player2ScoreEl;

const SLOTS = [
    {x: 450, y: 760, angle: 0, occupied: false},
    {x: 600, y: 880, angle: 73, occupied: false},

    {x: 800, y: 480, angle: 0, occupied: false},

    {x: 1820, y: 835, angle: 0, occupied: false},
    {x: 2030, y: 835, angle: 0, occupied: false},
    {x: 2240, y: 835, angle: 0, occupied: false},

    {x: 2150, y: 490, angle: -68, occupied: false},
];

let width = 2560; // TODO
let height = 1350; // TODO


const CAT_LENGTH = 2200;


const PAT_FRAME_LENGTH = 100;


const DAMAGED_LENGTH = 1500;


class Cat {
    constructor(time, fc) {
        this.entering = true;
        this.leaving = false;
        this.patted = false;
        this.level = 0;
        this.cat = fc ? fireCat : cats[Math.floor(Math.random() * cats.length)];
        this.fireCat = fc;

        this.initialTime = time;

        this.pattedTime = 0;
        this.pattedFrame = 0;

        let slot;

        if (fc) {
            this.slot = fireCatSlot;
        } else {
            slot = Math.floor(Math.random() * SLOTS.length);
            while (SLOTS[slot].occupied) {
                slot = Math.floor(Math.random() * SLOTS.length);
            }
            this.slot = SLOTS[slot];
        }

        this.slot.occupied = true;
        currentCats.push(this);
        console.log(`Create cat`);
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
                let meow = new Audio(meowRetriever.retrieve());
                meow.play();
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
    damagedTime: 0,
    damagedX: 0,
    damagedY: 0,

    patting: false,

    v: 0,
    dir: 0,

    score: 0,

    addScore: function (s) {
        this.score += s;
        player1ScoreEl.innerHTML = this.score.toFixed();
    }
};

const player2 = {
    x: 0.75 * width - 50,
    y: 0.3 * height,

    damaged: false,
    damagedTime: 0,
    damagedX: 0,
    damagedY: 0,

    patting: false,

    v: 0,
    dir: 0,

    score: 0,

    addScore: function (s) {
        this.score += s;
        player2ScoreEl.innerHTML = this.score.toFixed();
    }
};


const MAX_V = 25;
const ACCEL = 1;


const CAT_INTERVAL = 1000;


let lastCat = 0;

const MAX_CATS = 3;

let lastFireCat = 0;
const FIRE_CAT_INTERVAL = 12000;


const update = (time) => {
    // Cats

    currentCats.forEach(c => c.update(time));

    if (time - lastCat >= CAT_INTERVAL && currentCats.length < MAX_CATS) {
        new Cat(time, false);
        console.log('Create new cat');
        lastCat = time;
    }


    // Fire Cat

    if (time - lastFireCat >= FIRE_CAT_INTERVAL + (-1000 + Math.random() * 2000) && !fireCatSlot.occupied) {
        lastFireCat = time;
        console.log("Create a fire cat");
        fireCatSlot.occupied = true;
        fireCatSlot.time = time;
        currentCats.push(new Cat(time, true));
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
        } else if (Math.pow(player1.x + 30 - (player2.x - 60), 2)
                + Math.pow(player1.y - player2.y, 2) <= 8000) {
            player2.damaged = true;
            player2.damagedTime = time;
            player2.damagedX = player1.x;
            player2.damagedY = player1.y;
        } else {
            currentCats.forEach(c => {
                if (Math.pow(c.slot.x - (player1.x + 30), 2)
                    + Math.pow(c.slot.y - (player1.y - 80), 2) <= 40000) {
                    if (!c.patted) {
                        c.patted = true;
                        if (c.cat.name === "fake") {
                            player1.addScore(-30);
                        } else if(c.cat.name === "fire-cat") {
                            player1.addScore(30);
                        } else {
                            player1.addScore(10);
                        }
                    }
                }
            });
        }
    } else if (player1.patting && !keys["e"]) {
        player1.patting = false;
    }

    if (!player2.patting && keys["o"]) {
        player2.patting = true;
        if (player2.x - 60 >= 930 && player2.x - 60 <= 930 + 250
            && player2.y - 80 >= 478 && player2.y - 80 <= 478 + 164) {
            changeSound();
        } else if (Math.pow(player1.x + 30 - (player2.x - 60), 2)
                + Math.pow(player1.y - player2.y, 2) <= 7000) {
            player1.damaged = true;
            player1.damagedTime = time;
            player1.damagedX = player1.x;
            player1.damagedY = player1.y;
        } else {
            currentCats.forEach(c => {
                if (Math.pow(c.slot.x - (player2.x + 30), 2)
                    + Math.pow(c.slot.y - (player2.y - 80), 2) <= 40000) {
                    if (!c.patted) {
                        c.patted = true;
                        if (c.cat.name === "fake") {
                            player2.addScore(-30);
                        } else if(c.cat.name === "fire-cat") {
                            player1.addScore(30);
                        } else {
                            player2.addScore(10);
                        }
                    }
                }
            });
        }
    } else if (player2.patting && !keys["o"]) {
        player2.patting = false;
    }


    // Update positions

    player1.x += Math.cos(player1.dir) * player1.v;
    player1.y -= Math.sin(player1.dir) * player1.v;

    player2.x += Math.cos(player2.dir) * player2.v;
    player2.y -= Math.sin(player2.dir) * player2.v;


    if (player1.damaged) {
        if (player1.x < player1.damagedX) {
            player1.x += Math.abs(player1.x - player1.damagedX) * 0.2;
        } else if (player1.x > player1.damagedX) {
            player1.x -= Math.abs(player1.x - player1.damagedX) * 0.2;
        }

        if (player1.y < player1.damagedY) {
            player1.y += Math.abs(player1.y - player1.damagedY) * 0.2;
        } else if (player1.y > player1.damagedY) {
            player1.y -= Math.abs(player1.y - player1.damagedY) * 0.2;
        }
    }

    if (player2.damaged) {
        if (player2.x < player2.damagedX) {
            player2.x += Math.abs(player2.x - player2.damagedX) * 0.2;
        } else if (player2.x > player1.damagedX) {
            player2.x -= Math.abs(player2.x - player2.damagedX) * 0.2;
        }

        if (player2.y < player2.damagedY) {
            player2.y += Math.abs(player2.y - player2.damagedY) * 0.2;
        } else if (player2.y > player1.damagedY) {
            player2.y -= Math.abs(player2.y - player2.damagedY) * 0.2;
        }
    }

    if (time - player1.damagedTime > DAMAGED_LENGTH) {
        player1.damaged = false;
        player1.damagedTime = 0;
    }

    if (time - player2.damagedTime > DAMAGED_LENGTH) {
        player2.damaged = false;
        player2.damagedTime = 0;
    }

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

        // noinspection UnnecessaryLocalVariableJS
        const oldBack = back;
        while (back === oldBack) back = Math.round(1 + Math.random() * 3);
    }
};

const drawCatInSlot = (cat, slot, fraction, pattedFrame) => {
    ctx.translate(gs * slot.x, gs * slot.y);
    ctx.rotate(slot.angle * Math.PI / 180);
    if (pattedFrame === 0) {
        // ctx.fillRect(gs * -100, gs * (-cat.draw_height + (cat.draw_height * (1 - fraction))), gs * 200, gs * cat.draw_height);
        ctx.drawImage(cat.asset["img"], gs * -100, gs * (-cat.draw_height + (cat.draw_height * (1 - fraction))), gs * 200, gs * cat.draw_height);
    } else if (pattedFrame < 5) {
        ctx.drawImage(assets["poof" + pattedFrame.toString()]["img"], gs * -80, gs * (-100 - (10 * pattedFrame) + (80 * (1 - fraction))), gs * 160, gs * 160);
    }
    // ctx.drawImage(assets["couch"]["img"], 0, -cat.draw_height + (cat.draw_height * (1 - fraction)), 200, cat.draw_height);
    ctx.rotate(-slot.angle * Math.PI / 180);
    ctx.translate(gs * -slot.x, gs * -slot.y);
};

const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.drawImage(assets["wallpaper"]["img"], 0, 0, gs * 2883, gs * 1350);
    ctx.drawImage(assets["floor"]["img"], gs * -30, gs * (height - 340), gs * 3101, gs * 400);

    ctx.drawImage(assets["fireback"]["img"], gs * 877, gs * 866, gs * 340, gs * 272);
    ctx.drawImage(assets["back" + back.toString()]["img"], gs * 883, gs * 866, gs * 330, gs * 263);

    currentCats.filter(c => c.fireCat).forEach(c => c.draw());

    ctx.drawImage(assets["fireplace"]["img"], gs * 630, gs * -20, gs * 832, gs * 1160);

    ctx.drawImage(assets["art" + RANDOM_ART.toString()]["img"], gs * 1690, gs * 260, gs * 480, gs * 337);
    ctx.drawImage(assets["frame"]["img"], gs * 1630, gs * 170, gs * 600, gs * 524);


    // Draw Cats

    currentCats.filter(c => !c.fireCat).forEach(c => c.draw());


    // Draw Fore-Background

    ctx.drawImage(assets["boombox"]["img"], gs * 930, gs * 478, gs * 250, gs * 164);

    ctx.drawImage(assets["fire" + fire.toString()]["img"], gs * 920, gs * 880, gs * 240, gs * 244);

    ctx.drawImage(assets["pot"]["img"], gs * 1200, gs * 468, gs * 202, gs * 150);
    ctx.drawImage(assets["other-pot"]["img"], gs * 680, gs * 395, gs * 240, gs * 222);

    ctx.drawImage(assets["lamp"]["img"], gs * 2090, gs * 300, gs * 270, gs * 900);

    ctx.drawImage(assets["plant"]["img"], gs * 20, gs * 680, gs * 245, gs * 500);

    ctx.drawImage(assets["couch"]["img"], gs * 200, gs * 730, gs * 508, gs * 450);
    ctx.drawImage(assets["large-couch"]["img"], gs * 1400, gs * 820, gs * 1000, gs * 366);


    // Player 1

    if (player1.patting) {
        ctx.drawImage(assets["player1" + (player1.damaged ? "-damaged" : "")]["img"],
            gs * (player1.x - 85), gs * (player1.y - 85), gs * 170, gs * 170);
    } else {
        ctx.drawImage(assets["player1" + (player1.damaged ? "-damaged" : "")]["img"],
            gs * (player1.x - 100), gs * (player1.y - 100), gs * 200, gs * 200);
    }

    // ctx.drawImage(assets["fire1" + (player1.damaged ? "-damaged" : "")]["img"],
    // 	player1.x + 30, player1.y - 80, 20, 20);

    // Player 2

    if (player2.patting) {
        ctx.drawImage(assets["player2" + (player2.damaged ? "-damaged" : "")]["img"],
            gs * (player2.x - 85), gs * (player2.y - 85), gs * 170, gs * 170);
    } else {
        ctx.drawImage(assets["player2" + (player2.damaged ? "-damaged" : "")]["img"],
            gs * (player2.x - 100), gs * (player2.y - 100), gs * 200, gs * 200);
    }

    // ctx.drawImage(assets["fire1" + (player2.damaged ? "-damaged" : "")]["img"],
    // 	player2.x - 60, player2.y - 80, 20, 20);


    // Scoring

    ctx.drawImage(assets["coin"]["img"], gs * (width - 950), gs * 50, gs * 100, gs * 100);
    ctx.drawImage(assets["coin"]["img"], gs * (width - 500), gs * 50, gs * 100, gs * 100);
};


const gameLoop = () => {
    const time = (new Date).getTime();

    update(time);
    draw(time);

    window.requestAnimationFrame(gameLoop);
};


const changeSound = () => {
    const newSong = songRetriever.retrieve();
    console.log(`Changing song to ${newSong}`);
    document.getElementById("beats").src = newSong;
};

const computeScale = () => {
    const w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    const h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

    gs = Math.min(w / width, h / height) * scale;
    if (gs === 0) {
        gs = scale;
    }
    console.log(`Global scaler ${gs}, w ${w} h ${h}`);

    canvas.width = width * gs;
    canvas.height = height * gs;

    canvas.style.width = `${width * gs / scale}px`;
    canvas.style.height = `${height * gs / scale}px`;

    // Reposition scores
    const score1 = document.getElementById('player1-score');
    score1.style.left = `${gs / scale * (width - 950 + 120)}px`;
    score1.style.top = `${gs / scale * 50 + score1.offsetHeight * gs / scale}px`;
    const score2 = document.getElementById('player2-score');
    score2.style.left = `${gs / scale * (width - 500 + 120)}px`;
    score2.style.top = `${gs / scale * 50 + score1.offsetHeight * gs / scale}px`;
};


// Initialize!

document.addEventListener("DOMContentLoaded", () => {
    canvas = document.getElementById("main-canvas");
    ctx = canvas.getContext("2d");

    computeScale();

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
                name: k.substr(4),
                draw_height: 200 * (assets[k]["h"] / assets[k]["w"])
            });
        }

        if (k === "fire-cat") {
            fireCat = {
                asset: assets[k],
                name: k,
                draw_height: 200 * (assets[k]["h"] / assets[k]["w"])
            };
        }
    }

    player1ScoreEl = document.getElementById("player1-score-value");
    player2ScoreEl = document.getElementById("player2-score-value");

    window.addEventListener("keyup", e => {
        keys[e.key] = false;
    });
    window.addEventListener("keydown", e => {
        keys[e.key] = true;
    });

    window.addEventListener("resize", computeScale);

    document.getElementById("beats").addEventListener("ended", changeSound);

    changeSound();

    gameLoop();
});
