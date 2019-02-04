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

const songRetriever = randomRetriever(23, i => `assets/songs/${i + 1}.mp3`);
const meowRetriever = randomRetriever(83, i => `assets/meows/${i + 1}.m4a`);

let canvas;
let ctx;
let assets = {};

let keys = {};

let fireTime = 0;
let fire = 1;
let back = 1;

let fireCat = null;
let fireCatSlot = {x: 1050, y: 865, angle: 180, occupied: false, time: 0};

const RANDOM_ART = 1 + Math.floor(Math.random() * 4);

const SLOTS = [
    {x: 450, y: 760, angle: 0, occupied: false},
    {x: 600, y: 880, angle: 73, occupied: false},

    {x: 800, y: 500, angle: 0, occupied: false},

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


const MAX_V = 25;
const ACCEL = 1;


const CAT_INTERVAL = 1000;


let lastCat = 0;

const MAX_CATS = 4;

let lastFireCat = 0;
const FIRE_CAT_INTERVAL = 12000;

const FIRE_FRAME_LENGTH = 250;


const update = (time) => {
    // Cats

    Cat.currentCats.forEach(c => c.update(time));

    if (time - lastCat >= CAT_INTERVAL && Cat.currentCats.length < MAX_CATS) {
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
        Cat.currentCats.push(new Cat(time, true));
    }


    // Player Updates

    Player.players.forEach(p => p.update(time, width, height, keys));


    // Fire Updates
    if (time - fireTime > FIRE_FRAME_LENGTH) {
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

    Cat.currentCats.filter(c => c.fireCat).forEach(c => c.draw(ctx, gs));

    ctx.drawImage(assets["fireplace"]["img"], gs * 630, gs * -20, gs * 832, gs * 1160);

    ctx.drawImage(assets[`art${RANDOM_ART.toString()}`]["img"], gs * 1690, gs * 260, gs * 480, gs * 337);
    ctx.drawImage(assets["frame"]["img"], gs * 1630, gs * 170, gs * 600, gs * 524);


    // Draw Cats

    Cat.currentCats.filter(c => !c.fireCat).forEach(c => c.draw(ctx, gs));


    // Draw Fore-Background

    ctx.drawImage(assets["boombox"]["img"], gs * 930, gs * 478, gs * 250, gs * 164);

    ctx.drawImage(assets[`fire${fire.toString()}`]["img"], gs * 920, gs * 880, gs * 240, gs * 244);

    ctx.drawImage(assets["pot"]["img"], gs * 1200, gs * 468, gs * 202, gs * 150);
    ctx.drawImage(assets["other-pot"]["img"], gs * 680, gs * 395, gs * 240, gs * 222);

    ctx.drawImage(assets["lamp"]["img"], gs * 2090, gs * 300, gs * 270, gs * 900);

    ctx.drawImage(assets["plant"]["img"], gs * 20, gs * 680, gs * 245, gs * 500);

    ctx.drawImage(assets["couch"]["img"], gs * 200, gs * 730, gs * 508, gs * 450);
    ctx.drawImage(assets["large-couch"]["img"], gs * 1400, gs * 820, gs * 1000, gs * 366);


    // Players

    Player.players.forEach(p => p.draw(ctx, gs));


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

    document.querySelectorAll("div#assets img").forEach(img => {
        assets[img.id] = {};
        assets[img.id]["img"] = img;
        assets[img.id]["w"] = img.width;
        assets[img.id]["h"] = img.height;
    });

    for (let k in assets) {
        if (!assets.hasOwnProperty(k)) continue;
        if (k.substr(0, 4) === "cat-") {
            CatType.allTypes.push(new CatType({
                asset: assets[k],
                name: k.substr(4)
            }));
        }

        if (k === "fire-cat") {
            fireCat = new CatType({
                asset: assets[k],
                name: k
            });
        }
    }

    // Player 1
    new Player({
        assets: {
            normal: assets["player1"],
            damaged: assets["player1-damaged"]
        },

        x: 0.25 * width + 50,
        y: 0.3 * height,
        element: document.getElementById("player1-score-value"),

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

    // Player 2
    new Player({
        assets: {
            normal: assets["player2"],
            damaged: assets["player2-damaged"]
        },

        x: 0.75 * width - 50,
        y: 0.3 * height,
        element: document.getElementById("player2-score-value"),

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
