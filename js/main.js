"use strict";
// Globals
var songs = [];
for (var i = 1; i <= 24; i++) {
    songs.push("assets/songs/" + i + ".mp3");
}
var currentSong = 0;
var canvas;
var ctx;
var assets = {};
var cats = [];
var fireTime = 0;
var fire = 1;
var SLOTS = [
    { x: 450, y: 760, angle: 0, occupied: false },
    { x: 590, y: 880, angle: 73, occupied: false },
    { x: 780, y: 480, angle: 0, occupied: false },
    { x: 1820, y: 835, angle: 0, occupied: false },
    { x: 2030, y: 835, angle: 0, occupied: false },
    { x: 2240, y: 835, angle: 0, occupied: false },
    { x: 2210, y: 580, angle: -68, occupied: false },
];
var width = 2560; // TODO
var height = 1350; // TODO
// Helpers
// Players
var globalConfigs = {
    currentCats: [],
    width: width,
    height: height
};
var player1 = new Player({
    tag: '1',
    x: 0.25 * width + 50,
    y: 0.3 * height,
    keyUp: 'w',
    keyLeft: 'a',
    keyRight: 'd',
    keyDown: 's',
    keyPat: 'e',
}, globalConfigs);
var player2 = new Player({
    tag: '2',
    x: 0.75 * width - 50,
    y: 0.3 * height,
    keyUp: 'i',
    keyLeft: 'j',
    keyRight: 'l',
    keyDown: 'k',
    keyPat: 'o',
}, globalConfigs);
// Test
var player3 = new Player({
    tag: '1',
    x: 0.5 * width + 50,
    y: 0.3 * height,
    keyUp: 't',
    keyLeft: 'f',
    keyRight: 'g',
    keyDown: 'h',
    keyPat: 'y',
}, globalConfigs);
var CAT_INTERVAL = 1000;
var lastCat = 0;
var CAT_LENGTH = 2000;
var PAT_FRAME_LENGTH = 100;
var players = [player1, player2];
var Cat = /** @class */ (function () {
    function Cat(time) {
        this.entering = true;
        this.leaving = false;
        this.patted = false;
        this.level = 0;
        this.pattedTime = 0;
        this.pattedFrame = 0;
        this.cat = cats[Math.floor(Math.random() * cats.length)];
        this.initialTime = time;
        var slot = Math.floor(Math.random() * SLOTS.length);
        while (SLOTS[slot].occupied) {
            slot = Math.floor(Math.random() * SLOTS.length);
        }
        this.slot = SLOTS[slot];
        this.slot.occupied = true;
        globalConfigs.currentCats.push(this);
    }
    ;
    Cat.prototype.update = function (time) {
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
            }
            else if (time - this.pattedTime > PAT_FRAME_LENGTH && this.pattedFrame <= 4) {
                this.pattedTime = time;
                this.pattedFrame += 1;
            }
            else if (time - this.pattedTime > PAT_FRAME_LENGTH && this.pattedFrame === 5) {
                for (var c in globalConfigs.currentCats) {
                    if (!globalConfigs.currentCats.hasOwnProperty(c))
                        continue;
                    if (globalConfigs.currentCats[c] === this) {
                        this.slot.occupied = false;
                        // @ts-ignore
                        globalConfigs.currentCats.splice(c, 1);
                    }
                }
            }
        }
        if (this.leaving && !this.patted) {
            this.level = Math.max(this.level - 0.1, 0.0);
            if (this.level <= 0.001) {
                // TODO: DELETE
                for (var c in globalConfigs.currentCats) {
                    if (!globalConfigs.currentCats.hasOwnProperty(c))
                        continue;
                    if (globalConfigs.currentCats[c] === this) {
                        this.slot.occupied = false;
                        // @ts-ignore
                        globalConfigs.currentCats.splice(c, 1);
                    }
                }
            }
        }
    };
    Cat.prototype.draw = function () {
        drawCatInSlot(this.cat, this.slot, this.level, this.pattedFrame);
    };
    return Cat;
}());
var update = function (time) {
    globalConfigs.currentCats.forEach(function (c) { return c.update(time); });
    if (time - lastCat >= CAT_INTERVAL && globalConfigs.currentCats.length < 3) {
        new Cat(time);
        console.log('Create new cat');
        lastCat = time;
    }
    players.forEach(function (p) { return p.update(); });
    if (time - fireTime > 250) {
        fireTime = time;
        // noinspection UnnecessaryLocalVariableJS
        var oldFire = fire;
        while (fire === oldFire)
            fire = Math.round(1 + Math.random() * 3);
    }
};
var drawCatInSlot = function (cat, slot, fraction, pattedFrame) {
    ctx.translate(slot.x, slot.y);
    ctx.rotate(slot.angle * Math.PI / 180);
    if (pattedFrame === 0) {
        ctx.drawImage(cat.asset["img"], -100, -cat.draw_height + (cat.draw_height * (1 - fraction)), 200, cat.draw_height);
    }
    else if (pattedFrame < 5) {
        ctx.drawImage(assets["poof" + pattedFrame.toString()]["img"], -80, -100 + (80 * (1 - fraction)), 160, 160);
    }
    // ctx.drawImage(assets["couch"]["img"], 0, -cat.draw_height + (cat.draw_height * (1 - fraction)), 200, cat.draw_height);
    ctx.rotate(-slot.angle * Math.PI / 180);
    ctx.translate(-slot.x, -slot.y);
};
var getCatPat = function (slot, fraction) {
};
var draw = function (time) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(assets["wallpaper"]["img"], 0, 0, 2883, 1350);
    ctx.drawImage(assets["floor"]["img"], -30, height - 340, 3101, 400);
    ctx.drawImage(assets["fireplace"]["img"], 630, -20, 832, 1160);
    ctx.drawImage(assets["lamp"]["img"], 2090, 300, 270, 900);
    // Draw Cats
    globalConfigs.currentCats.forEach(function (c) { return c.draw(); });
    // Draw Fore-Background
    ctx.drawImage(assets["boombox"]["img"], 930, 478, 250, 164);
    ctx.drawImage(assets["fire" + fire.toString()]["img"], 920, 890, 240, 244);
    ctx.drawImage(assets["pot"]["img"], 1200, 468, 202, 150);
    ctx.drawImage(assets["other-pot"]["img"], 680, 395, 240, 222);
    ctx.drawImage(assets["lamp"]["img"], 2090, 300, 270, 900);
    ctx.drawImage(assets["plant"]["img"], 20, 680, 245, 500);
    ctx.drawImage(assets["couch"]["img"], 200, 730, 508, 450);
    ctx.drawImage(assets["large-couch"]["img"], 1400, 820, 1000, 366);
    players.forEach(function (p) { return p.draw(ctx, assets); });
};
var gameLoop = function () {
    var time = (new Date).getTime();
    update(time);
    draw(time);
    window.requestAnimationFrame(gameLoop);
};
var changeSound = function () {
    // let randSong = Math.floor(Math.random() * songs.length);
    // while (randSong === currentSong) {
    //     randSong = Math.floor(Math.random() * songs.length);
    // }
    //
    // document.getElementById("beats").src = songs[randSong];
};
// Initialize!
document.addEventListener("DOMContentLoaded", function () {
    canvas = document.getElementById("main-canvas");
    ctx = canvas.getContext("2d");
    document.querySelectorAll("div#assets img").forEach(function (el) {
        var img = el;
        assets[img.id] = {};
        assets[img.id]["img"] = img;
        assets[img.id]["w"] = img.width;
        assets[img.id]["h"] = img.height;
    });
    for (var k in assets) {
        if (!assets.hasOwnProperty(k))
            continue;
        if (k.substr(0, 4) === "cat-") {
            cats.push({
                asset: assets[k],
                draw_height: 200 * (assets[k]["h"] / assets[k]["w"])
            });
        }
    }
    window.addEventListener("keyup", function (e) {
        players.forEach(function (p) { return p.onKeyUp(e.key); });
    });
    window.addEventListener("keydown", function (e) {
        players.forEach(function (p) { return p.onKeyDown(e.key); });
    });
    document.getElementById("beats").addEventListener("ended", changeSound);
    changeSound();
    gameLoop();
});
