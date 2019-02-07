"use strict";
// Globals
var gs = 1.0;
var scale = window.devicePixelRatio;
function randomRetriever(count, creator) {
    var options = [];
    for (var i = 0; i < count; i++) {
        options.push(creator(i));
    }
    var current = 0;
    return {
        retrieve: function () {
            current = (current + 1 + Math.floor(Math.random() * (options.length - 1))) % options.length;
            return options[current];
        }
    };
}
var songRetriever = randomRetriever(23, function (i) { return "assets/songs/" + (i + 1) + ".mp3"; });
var meowRetriever = randomRetriever(83, function (i) { return "assets/meows/" + (i + 1) + ".m4a"; });
var currentSong = null;
var canvas;
var ctx;
var backgroundCanvas;
var backgroundContext;
var hudCanvas;
var hudContext;
var assets = {};
var keys = {};
var fireTime = 0;
var fire = 1;
var back = 1;
var fireCat = null;
var fireCatSlot = { x: 1050, y: 865, angle: 180, occupied: false, time: 0 };
var RANDOM_ART = 1 + Math.floor(Math.random() * 4);
var SLOTS = [
    { x: 450, y: 760, angle: 0, occupied: false },
    { x: 600, y: 880, angle: 73, occupied: false },
    { x: 800, y: 500, angle: 0, occupied: false },
    { x: 1820, y: 835, angle: 0, occupied: false },
    { x: 2030, y: 835, angle: 0, occupied: false },
    { x: 2240, y: 835, angle: 0, occupied: false },
    { x: 2150, y: 490, angle: -68, occupied: false },
];
var width = 2560; // TODO
var height = 1350; // TODO
var lastCat = 0;
var lastFireCat = 0;
var update = function (time) {
    // Cats
    Cat.currentCats.forEach(function (c) { return c.update(time); });
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
    Player.players.forEach(function (p) { return p.update(time, width, height, keys); });
    // Fire Updates
    if (time - fireTime > FIRE_FRAME_LENGTH) {
        fireTime = time;
        // noinspection UnnecessaryLocalVariableJS
        var oldFire = fire;
        while (fire === oldFire)
            fire = Math.round(1 + Math.random() * 3);
        // noinspection UnnecessaryLocalVariableJS
        var oldBack = back;
        while (back === oldBack)
            back = Math.round(1 + Math.random() * 3);
    }
};
var draw = function (time) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(assets["back" + back.toString()].img, gs * 883, gs * 866, gs * 330, gs * 263);
    Cat.currentCats.filter(function (c) { return c.fireCat; }).forEach(function (c) { return c.draw(ctx, gs); });
    ctx.drawImage(assets["fireplace"].img, gs * 630, gs * -20, gs * 832, gs * 1160);
    ctx.drawImage(assets["art" + RANDOM_ART.toString()].img, gs * 1690, gs * 260, gs * 480, gs * 337);
    ctx.drawImage(assets["frame"].img, gs * 1630, gs * 170, gs * 600, gs * 524);
    // Draw Cats
    Cat.currentCats.filter(function (c) { return !c.fireCat; }).forEach(function (c) { return c.draw(ctx, gs); });
    // Draw Fore-Background
    ctx.drawImage(assets["boombox"].img, gs * 930, gs * 478, gs * 250, gs * 164);
    ctx.drawImage(assets["fire" + fire.toString()].img, gs * 920, gs * 880, gs * 240, gs * 244);
    ctx.drawImage(assets["pot"].img, gs * 1200, gs * 468, gs * 202, gs * 150);
    ctx.drawImage(assets["other-pot"].img, gs * 680, gs * 395, gs * 240, gs * 222);
    ctx.drawImage(assets["lamp"].img, gs * 2090, gs * 300, gs * 270, gs * 900);
    ctx.drawImage(assets["plant"].img, gs * 20, gs * 680, gs * 245, gs * 500);
    ctx.drawImage(assets["couch"].img, gs * 200, gs * 730, gs * 508, gs * 450);
    ctx.drawImage(assets["large-couch"].img, gs * 1400, gs * 820, gs * 1000, gs * 366);
    // Players
    Player.players.forEach(function (p) { return p.draw(ctx, gs); });
};
var gameLoop = function () {
    var time = (new Date).getTime();
    update(time);
    draw(time);
    window.requestAnimationFrame(gameLoop);
};
var getViewportWidth = function () { return Math.max(document.documentElement.clientWidth, window.innerWidth || 0); };
var getViewportHeight = function () { return Math.max(document.documentElement.clientHeight, window.innerHeight || 0); };
var drawBackground = function () {
    backgroundContext.clearRect(0, 0, backgroundCanvas.width, backgroundCanvas.height);
    for (var i = 0; i < Math.ceil(getViewportWidth() / (backgroundCanvas.width * gs / scale)); i++) {
        backgroundContext.drawImage(assets["wallpaper"].img, i * 2883 * gs, 0, gs * 2883, gs * 1350);
    }
    backgroundContext.drawImage(assets["floor"].img, gs * -30, gs * (height - 340), gs * 3101, gs * 400);
    backgroundContext.drawImage(assets["fireback"].img, gs * 877, gs * 866, gs * 340, gs * 272);
};
var drawHUD = function () {
    hudContext.clearRect(0, 0, hudCanvas.width, hudCanvas.height);
    // Scoring
    hudContext.drawImage(assets["coin"].img, gs * (width - 950), gs * 50, gs * 100, gs * 100);
    hudContext.drawImage(assets["coin"].img, gs * (width - 500), gs * 50, gs * 100, gs * 100);
};
var playNewSong = function () {
    var newSong = songRetriever.retrieve();
    console.log("Changing song to " + newSong);
    if (currentSong !== null && !currentSong.ended)
        currentSong.pause();
    currentSong = new Audio(newSong);
    currentSong.play().catch(function (err) {
        console.log("Could not start song (Error: " + err + ")");
        var workaround = function () {
            new Audio(songRetriever.retrieve()).play()
                .then(function () { return document.removeEventListener('keydown', workaround); })
                .catch(function (err) {
                console.error("Tried again, still can't start song (Error: " + err + ")");
            });
        };
        document.addEventListener('keydown', workaround);
    });
    currentSong.addEventListener("ended", playNewSong);
};
var computeScale = function () {
    var w = getViewportWidth();
    var h = getViewportHeight();
    gs = Math.min(w / width, h / height) * scale;
    if (gs === 0) {
        gs = scale;
    }
    console.log("Global scaler " + gs + ", w " + w + " h " + h);
    // Background Canvas
    backgroundCanvas.width = w * scale;
    backgroundCanvas.height = height * gs;
    backgroundCanvas.style.width = w + "px";
    backgroundCanvas.style.height = height * gs / scale + "px";
    // Main Game Canvas
    canvas.width = width * gs;
    canvas.height = height * gs;
    canvas.style.width = width * gs / scale + "px";
    canvas.style.height = height * gs / scale + "px";
    // HUD Canvas
    hudCanvas.width = w * scale;
    hudCanvas.height = height * gs;
    hudCanvas.style.width = w + "px";
    hudCanvas.style.height = height * gs / scale + "px";
    // Reposition scores
    var score1 = document.getElementById('player1-score');
    score1.style.left = gs / scale * (width - 950 + 120) + "px";
    score1.style.top = gs / scale * 50 + score1.offsetHeight * gs / scale + "px";
    var score2 = document.getElementById('player2-score');
    score2.style.left = gs / scale * (width - 500 + 120) + "px";
    score2.style.top = gs / scale * 50 + score1.offsetHeight * gs / scale + "px";
};
var updateWindowSize = function () {
    computeScale();
    drawBackground();
    drawHUD();
};
// Initialize!
document.addEventListener("DOMContentLoaded", function () {
    backgroundCanvas = document.getElementById("background-canvas");
    backgroundContext = backgroundCanvas.getContext("2d", { alpha: false });
    canvas = document.getElementById("main-canvas");
    ctx = canvas.getContext("2d");
    hudCanvas = document.getElementById("hud-canvas");
    hudContext = hudCanvas.getContext("2d");
    computeScale();
    document.querySelectorAll("div#assets img").forEach(function (el) {
        var img = el;
        assets[img.id] = {
            img: img,
            w: img.width,
            h: img.height
        };
    });
    for (var k in assets) {
        if (!assets.hasOwnProperty(k))
            continue;
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
    window.addEventListener("keyup", function (e) { return keys[e.key] = false; });
    window.addEventListener("keydown", function (e) { return keys[e.key] = true; });
    window.addEventListener("resize", updateWindowSize);
    assets["wallpaper"].img.addEventListener("load", drawBackground);
    assets["floor"].img.addEventListener("load", drawBackground);
    assets["coin"].img.addEventListener("load", drawHUD);
    playNewSong();
    drawBackground();
    drawHUD();
    gameLoop();
});
assets: {
    normal: assets["player1"],
        damaged;
    assets["player1-damaged"];
}
x: 0.25 * width + 50,
    y;
0.3 * height,
    element;
document.getElementById("player1-score-value"),
    controls;
{
    up: "w",
        down;
    "s",
        left;
    "a",
        right;
    "d",
        pat;
    "e";
}
point: {
    offsetX: 30,
        offsetY;
    -80;
}
;
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
window.addEventListener("keyup", function (e) { return keys[e.key] = false; });
window.addEventListener("keydown", function (e) { return keys[e.key] = true; });
window.addEventListener("resize", updateWindowSize);
assets["wallpaper"].img.addEventListener("load", drawBackground);
assets["floor"].img.addEventListener("load", drawBackground);
assets["coin"].img.addEventListener("load", drawHUD);
playNewSong();
drawBackground();
drawHUD();
gameLoop();
;
