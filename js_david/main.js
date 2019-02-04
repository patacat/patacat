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

/**
 * @type {Cat[]}
 */
let cats = [];

let keys = {};

let fireTime = 0;
let fire = 1;
let back = 1;

let fireCat = null;
let fireCatSlot = {x: 1050, y: 865, angle: 180, occupied: false, time: 0};

const RANDOM_ART = 1 + Math.floor(Math.random() * 4);

/**
 * @type {Cat[]}
 */
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

        this._deleted = false;

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
        if (this._deleted) return;

        if (this.entering && !this.patted) {
            this.level = Math.min(this.level + 0.1, 1.0);
            if (this.level >= 0.999) {
                this.entering = false;
            }

            return;
        }

        if (time - this.initialTime > CAT_LENGTH && !this.patted) {
            this.leaving = true;
        }

        if (this.patted) {
            if (this.pattedTime === 0) {
                this.pattedTime = time;
                this.pattedFrame = 1;
                let meow = new Audio(meowRetriever.retrieve());
                meow.play().then(() => {});
            } else if (time - this.pattedTime > PAT_FRAME_LENGTH && this.pattedFrame <= 4) {
                this.pattedTime = time;
                this.pattedFrame += 1
            } else if (time - this.pattedTime > PAT_FRAME_LENGTH && this.pattedFrame === 5) {
                for (let c in currentCats) {
                    if (!currentCats.hasOwnProperty(c)) continue;
                    if (currentCats[c] !== this) continue;

                    this._deleted = true;
                    this.slot.occupied = false;
                    currentCats.splice(c, 1);
                }
            }

            return;
        }

        if (this.leaving && !this.patted) {
            this.level = Math.max(this.level - 0.1, 0.0);
            if (this.level <= 0.001) {
                // TODO: DELETE
                for (let c in currentCats) {
                    if (!currentCats.hasOwnProperty(c)) continue;
                    if (currentCats[c] !== this) continue;

                    this._deleted = true;
                    this.slot.occupied = false;
                    currentCats.splice(c, 1);
                }
            }
        }
    }

    draw() {
        if (this._deleted) return;

        ctx.translate(gs * this.slot.x, gs * this.slot.y);
        ctx.rotate(this.slot.angle * Math.PI / 180);
        if (this.pattedFrame === 0) {
            // ctx.fillRect(gs * -100, gs * (-cat.draw_height + (cat.draw_height * (1 - fraction))), gs * 200, gs * cat.draw_height);
            ctx.drawImage(this.cat.asset["img"], gs * -100, gs * (-this.cat.draw_height + (this.cat.draw_height * (1 - this.level))), gs * 200, gs * this.cat.draw_height);
        } else if (this.pattedFrame < 5) {
            ctx.drawImage(assets["poof" + this.pattedFrame.toString()]["img"], gs * -80, gs * (-100 - (10 * this.pattedFrame) + (80 * (1 - this.level))), gs * 160, gs * 160);
        }
        // ctx.drawImage(assets["couch"]["img"], 0, -cat.draw_height + (cat.draw_height * (1 - fraction)), 200, cat.draw_height);
        ctx.rotate(-this.slot.angle * Math.PI / 180);
        ctx.translate(gs * -this.slot.x, gs * -this.slot.y);
    }
}


// Players

/**
 * @type {Player[]}
 */
const players = [];

class Player {
    constructor(props) {
        this.assets = props.assets;

        this.x = props.x;
        this.y = props.y;

        this.controls = props.controls;
        this._offsetX = props.point.offsetX;
        this._offsetY = props.point.offsetY;

        this.damaged = false;
        this.damagedTime = 0;
        this.damagedX = 0;
        this.damagedY = 0;

        this.patting = false;

        this.v = 0;
        this.dir = 0;

        this.score = 0;
        this.scoreElement = props.element;

        this.index = players.length;
        players.push(this);
    }

    pointX() {
        return this.x + this._offsetX;
    }

    pointY() {
        return this.y + this._offsetY;
    }

    _hitOtherPlayer(p) {
        return Math.pow(this.pointX() - p.pointX(), 2) + Math.pow(this.y - p.y, 2) <= 8000;
    }

    addScore(s) {
        this.score += s;
        this.scoreElement.innerHTML = this.score.toFixed();
    }

    update(time) {
        // Controls

        if (keys[this.controls.up] && !keys[this.controls.left] && !keys[this.controls.right]
                && !keys[this.controls.down]) {
            this.v = Math.min(this.v + ACCEL, MAX_V);
            this.dir = 90 * Math.PI / 180;
        } else if (keys[this.controls.up] && keys[this.controls.left] && !keys[this.controls.right]
                && !keys[this.controls.down]) {
            this.v = Math.min(this.v + ACCEL, MAX_V);
            this.dir = 135 * Math.PI / 180;
        } else if (keys[this.controls.up] && !keys[this.controls.left] && keys[this.controls.right]
                && !keys[this.controls.down]) {
            this.v = Math.min(this.v + ACCEL, MAX_V);
            this.dir = 45 * Math.PI / 180;
        } else if (!keys[this.controls.up] && !keys[this.controls.left] && !keys[this.controls.right]
                && keys[this.controls.down]) {
            this.v = Math.min(this.v + ACCEL, MAX_V);
            this.dir = 270 * Math.PI / 180;
        } else if (!keys[this.controls.up] && keys[this.controls.left] && !keys[this.controls.right]
                && keys[this.controls.down]) {
            this.v = Math.min(this.v + ACCEL, MAX_V);
            this.dir = 225 * Math.PI / 180;
        } else if (!keys[this.controls.up] && !keys[this.controls.left] && keys[this.controls.right]
                && keys[this.controls.down]) {
            this.v = Math.min(this.v + ACCEL, MAX_V);
            this.dir = 315 * Math.PI / 180;
        } else if (!keys[this.controls.up] && !keys[this.controls.left] && keys[this.controls.right]
                && !keys[this.controls.down]) {
            this.v = Math.min(this.v + ACCEL, MAX_V);
            this.dir = 0;
        } else if (!keys[this.controls.up] && keys[this.controls.left] && !keys[this.controls.right]
                && !keys[this.controls.down]) {
            this.v = Math.min(this.v + ACCEL, MAX_V);
            this.dir = 180 * Math.PI / 180;
        } else {
            if (this.v < 0.01) this.v = 0;
            else this.v *= 0.8;
        }


        // Patting

        if (!this.patting && keys[this.controls.pat]) {
            this.patting = true;
            if (this.pointX() >= 930 && this.pointX() <= 930 + 250
                    && this.pointY() >= 478 && this.pointY() <= 478 + 164) {
                // Boombox
                changeSound();
            } else {
                let hitSomething = false;
                players.filter((p, i) => i !== this.index && this._hitOtherPlayer(p))
                    .forEach(p => {
                        hitSomething = true;

                        p.damaged = true;
                        p.damagedTime = time;
                        p.damagedX = p.x;
                        p.damagedY = p.y;
                    });

                if (!hitSomething) {
                    currentCats.forEach(c => {
                        if (Math.pow(c.slot.x - this.pointX(), 2)
                            + Math.pow(c.slot.y - this.pointY(), 2) <= 40000) {
                            if (!c.patted) {
                                c.patted = true;
                                if (c.cat.name === "fake") {
                                    this.addScore(-30);
                                } else if(c.cat.name === "fire-cat") {
                                    this.addScore(30);
                                } else {
                                    this.addScore(10);
                                }
                            }
                        }
                    });
                }
            }
        } else if (this.patting && !keys[this.controls.pat]) {
            this.patting = false;
        }


        // Movement

        this.x += Math.cos(this.dir) * this.v;
        this.y -= Math.sin(this.dir) * this.v;


        // Modified Damage Movement

        if (this.damaged) {
            if (this.x < this.damagedX) {
                this.x += Math.abs(this.x - this.damagedX) * 0.2;
            } else if (this.x > this.damagedX) {
                this.x -= Math.abs(this.x - this.damagedX) * 0.2;
            }

            if (this.y < this.damagedY) {
                this.y += Math.abs(this.y - this.damagedY) * 0.2;
            } else if (this.y > this.damagedY) {
                this.y -= Math.abs(this.y - this.damagedY) * 0.2;
            }


            // Update Damage Status

            if (time - this.damagedTime > DAMAGED_LENGTH) {
                this.damaged = false;
                this.damagedTime = 0;
            }
        }


        // Bounds Checking

        if (this.x < 100 || this.y < 100 || this.x > width - 100 || this.y > height - 100) {
            for (let k in this.controls) {
                if (!this.controls.hasOwnProperty(k)) continue;
                keys[this.controls[k]] = false;
            }

            this.dir = this.dir - Math.PI;

            if (this.x < 100) this.x = 100;
            if (this.y < 100) this.y = 100;
            if (this.x > width - 100) this.x = width - 100;
            if (this.y > height - 100) this.y = height - 100;
        }
    }

    draw() {
        if (this.patting) {
            ctx.drawImage((this.damaged ? this.assets.damaged : this.assets.normal)["img"],
                gs * (this.x - 85), gs * (this.y - 85), gs * 170, gs * 170);
            return;
        }

        ctx.drawImage((this.damaged ? this.assets.damaged : this.assets.normal)["img"],
            gs * (this.x - 100), gs * (this.y - 100), gs * 200, gs * 200);
    }
}

/**
 * @type Player
 */
let player1;

/**
 * @type Player
 */
let player2;


const MAX_V = 25;
const ACCEL = 1;


const CAT_INTERVAL = 1000;


let lastCat = 0;

const MAX_CATS = 4;

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


    // Player Updates

    players.forEach(p => p.update(time));


    // Fire Updates
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


    // Players

    players.forEach(p => p.draw());


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

    player1 = new Player({
        assets: {
            normal: assets["player1"],
            damaged: assets["player1-damaged"]
        },

        x: 0.25 * width + 50,
        y: 0.3 * height,
        element: player1ScoreEl,

        controls: {
            up: "w",
            down: "s",
            left: "a",
            right: "d",

            pat: "e"
        },

        point: {
            offsetX: 30,
            offsetY: -80
        }
    });

    player2 = new Player({
        assets: {
            normal: assets["player2"],
            damaged: assets["player2-damaged"]
        },

        x: 0.75 * width - 50,
        y: 0.3 * height,
        element: player2ScoreEl,

        controls: {
            up: "i",
            down: "k",
            left: "j",
            right: "l",

            pat: "o"
        },

        point: {
            offsetX: -60,
            offsetY: -80
        }
    });

    window.addEventListener("keyup", e => keys[e.key] = false);
    window.addEventListener("keydown", e => keys[e.key] = true);

    window.addEventListener("resize", computeScale);

    document.getElementById("beats").addEventListener("ended", changeSound);

    changeSound();

    gameLoop();
});
