"use strict";
// Globals
/*
 * Player data
 */
var Actions = /** @class */ (function () {
    function Actions() {
        this.up = false;
        this.down = false;
        this.left = false;
        this.right = false;
        this.patting = false;
    }
    Actions.prototype.reset = function () {
        this.up = false;
        this.down = false;
        this.left = false;
        this.right = false;
    };
    return Actions;
}());
var MAX_V = 20;
var ACCEL = 1;
var Player = /** @class */ (function () {
    function Player(configs) {
        this.v = 0;
        this.dir = 0;
        this.damaged = false;
        this.patting = false;
        this.actions = new Actions();
        this.score = 0;
        this.scoreElement = null;
        this.configs = configs;
        this.x = configs.x;
        this.y = configs.y;
    }
    Player.prototype.update = function () {
        var _this = this;
        if (this.actions.up && !this.actions.left && !this.actions.right && !this.actions.down) {
            this.v = Math.min(this.v + ACCEL, MAX_V);
            this.dir = 90 * Math.PI / 180;
        }
        else if (this.actions.up && this.actions.left && !this.actions.right && !this.actions.down) {
            this.v = Math.min(this.v + ACCEL, MAX_V);
            this.dir = 135 * Math.PI / 180;
        }
        else if (this.actions.up && !this.actions.left && this.actions.right && !this.actions.down) {
            this.v = Math.min(this.v + ACCEL, MAX_V);
            this.dir = 45 * Math.PI / 180;
        }
        else if (!this.actions.up && !this.actions.left && !this.actions.right && this.actions.down) {
            this.v = Math.min(this.v + ACCEL, MAX_V);
            this.dir = 270 * Math.PI / 180;
        }
        else if (!this.actions.up && this.actions.left && !this.actions.right && this.actions.down) {
            this.v = Math.min(this.v + ACCEL, MAX_V);
            this.dir = 225 * Math.PI / 180;
        }
        else if (!this.actions.up && !this.actions.left && this.actions.right && this.actions.down) {
            this.v = Math.min(this.v + ACCEL, MAX_V);
            this.dir = 315 * Math.PI / 180;
        }
        else if (!this.actions.up && !this.actions.left && this.actions.right && !this.actions.down) {
            this.v = Math.min(this.v + ACCEL, MAX_V);
            this.dir = 0;
        }
        else if (!this.actions.up && this.actions.left && !this.actions.right && !this.actions.down) {
            this.v = Math.min(this.v + ACCEL, MAX_V);
            this.dir = 180 * Math.PI / 180;
        }
        else {
            if (this.v < 0.01)
                this.v = 0;
            else
                this.v *= 0.8;
        }
        // Update patting
        if (!this.patting && this.actions.patting) {
            this.patting = true;
            if (this.x + 30 >= 930 && this.x + 30 <= 930 + 250
                && this.y - 80 >= 478 && this.y - 80 <= 478 + 164) {
                changeSong();
            }
            else {
                SLOTS.forEach(function (s) {
                    if (s.cat) {
                        if (Math.pow(s.x - (player1.x + 30), 2)
                            + Math.pow(s.y - (player1.y - 80), 2) <= 40000) {
                            if (!s.cat.patted) {
                                s.cat.patted = true;
                                _this.addScore(10);
                            }
                        }
                    }
                });
                // currentCats.forEach(c => {
                //     if (Math.pow(c.slot.x - (player1.x + 30), 2)
                //         + Math.pow(c.slot.y - (player1.y - 80), 2) <= 40000) {
                //         if (!c.patted) {
                //             c.patted = true;
                //             this.addScore(10);
                //         }
                //     }
                // });
            }
        }
        else if (this.patting && !this.actions.patting) {
            this.patting = false;
        }
        // Update positions
        this.x += Math.cos(this.dir) * this.v;
        this.y -= Math.sin(this.dir) * this.v;
        if (this.x < 100 || this.y < 100 || this.x > width - 100 || this.y > height - 100) {
            this.actions.reset();
            this.dir = this.dir - Math.PI;
        }
        this.fitWithinBounds(100);
    };
    Player.prototype.addScore = function (score) {
        this.score += score;
        if (this.scoreElement) {
            this.scoreElement.innerHTML = this.score.toFixed();
        }
    };
    Player.prototype.bindDocument = function () {
        this.scoreElement = document.getElementById("player" + this.configs.tag + "-score-value");
    };
    Player.prototype.fitWithinBounds = function (padding) {
        if (this.x < padding)
            this.x = padding;
        if (this.y < padding)
            this.y = padding;
        if (this.x > width - padding)
            this.x = width - 100;
        if (this.y > height - padding)
            this.y = height - 100;
    };
    Player.prototype.onKeyDown = function (key) {
        switch (key) {
            case this.configs.keyUp: {
                this.actions.up = true;
                break;
            }
            case this.configs.keyLeft: {
                this.actions.left = true;
                break;
            }
            case this.configs.keyRight: {
                this.actions.right = true;
                break;
            }
            case this.configs.keyDown: {
                this.actions.down = true;
                break;
            }
            case this.configs.keyPat: {
                this.actions.patting = true;
                break;
            }
        }
    };
    Player.prototype.onKeyUp = function (key) {
        switch (key) {
            case this.configs.keyUp: {
                this.actions.up = false;
                break;
            }
            case this.configs.keyLeft: {
                this.actions.left = false;
                break;
            }
            case this.configs.keyRight: {
                this.actions.right = false;
                break;
            }
            case this.configs.keyDown: {
                this.actions.down = false;
                break;
            }
            case this.configs.keyPat: {
                this.actions.patting = false;
                break;
            }
        }
    };
    Player.prototype.draw = function (ctx, assets) {
        if (this.patting) {
            ctx.drawImage(assets["player" + this.configs.tag + (this.damaged ? "-damaged" : "")]["img"], player1.x - 85, player1.y - 85, 170, 170);
        }
        else {
            ctx.drawImage(assets["player" + this.configs.tag + (this.damaged ? "-damaged" : "")]["img"], this.x - 100, this.y - 100, 200, 200);
        }
        ctx.drawImage(assets["fire1" + (this.damaged ? "-damaged" : "")]["img"], this.x - 60, this.y - 80, 20, 20);
    };
    return Player;
}());
function randomRetriever(count, creator) {
    var options = [];
    for (var i = 0; i < count; i++) {
        options.push(creator(i));
    }
    var current = 0;
    return {
        retrieve: function () {
            current = (current + 1 + Math.floor(Math.random() * (options.length - 1)));
            return options[current];
        }
    };
}
var songRetriever = randomRetriever(24, function (i) { return "assets/songs/" + (i + 1) + ".mp3"; });
var meowRetriever = randomRetriever(83, function (i) { return "assets/meows/" + (i + 1) + ".m4a"; });
var canvas;
var ctx;
var assets = {};
var cats = [];
var fireTime = 0;
var fire = 1;
var back = 1;
var RANDOM_ART = 1 + Math.floor(Math.random() * 4);
var SLOTS = [
    { x: 450, y: 760, angle: 0, cat: null },
    { x: 600, y: 880, angle: 73, cat: null },
    { x: 800, y: 480, angle: 0, cat: null },
    { x: 1820, y: 835, angle: 0, cat: null },
    { x: 2030, y: 835, angle: 0, cat: null },
    { x: 2240, y: 835, angle: 0, cat: null },
    { x: 2150, y: 490, angle: -68, cat: null },
];
var width = 2560; // TODO
var height = 1350; // TODO
var MAX_CAT_COUNT = 1;
// Players
var player1 = new Player({
    tag: '1',
    x: 0.25 * width + 50,
    y: 0.3 * height,
    keyUp: 'w',
    keyLeft: 'a',
    keyRight: 'd',
    keyDown: 's',
    keyPat: 'e',
});
var player2 = new Player({
    tag: '2',
    x: 0.75 * width - 50,
    y: 0.3 * height,
    keyUp: 'i',
    keyLeft: 'j',
    keyRight: 'l',
    keyDown: 'k',
    keyPat: 'o',
});
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
});
var CAT_INTERVAL = 1000;
var lastCat = 0;
var CAT_LENGTH = 2200;
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
    }
    ;
    Cat.prototype.update = function (time, slot) {
        console.log('Update cat');
        if (this.entering && !this.patted) {
            this.level = Math.min(this.level + 0.1, 1.0);
            if (this.level >= 0.999) {
                this.entering = false;
            }
        }
        if (time - this.initialTime > CAT_LENGTH && !this.patted) {
            this.leaving = true;
            console.log("Leaving " + time + " " + this.initialTime);
        }
        if (this.patted) {
            if (this.pattedTime === 0) {
                this.pattedTime = time;
                this.pattedFrame = 1;
                var meow = new Audio(meowRetriever.retrieve());
                meow.play();
                console.log("meow");
            }
            else if (time - this.pattedTime > PAT_FRAME_LENGTH && this.pattedFrame <= 4) {
                this.pattedTime = time;
                this.pattedFrame += 1;
            }
            else if (time - this.pattedTime > PAT_FRAME_LENGTH && this.pattedFrame === 5) {
                slot.cat = null;
                console.log('Remove patted cat');
                // for (let c in currentCats) {
                //     if (!currentCats.hasOwnProperty(c)) continue;
                //     if (currentCats[c] === this) {
                //         this.slot.occupied = false;
                //         // @ts-ignore
                //         currentCats.splice(c, 1);
                //     }
                // }
            }
        }
        if (this.leaving && !this.patted) {
            this.level = Math.max(this.level - 0.1, 0.0);
            if (this.level <= 0.001) {
                slot.cat = null;
                // TODO: DELETE
                console.log('Remove leaving cat');
                // for (let c in currentCats) {
                //     if (!currentCats.hasOwnProperty(c)) continue;
                //     if (currentCats[c] === this) {
                //         this.slot.occupied = false;
                //         // @ts-ignore
                //         currentCats.splice(c, 1);
                //     }
                // }
            }
        }
    };
    Cat.prototype.draw = function (slot) {
        drawCatInSlot(this.cat, slot, this.level, this.pattedFrame);
    };
    return Cat;
}());
var update = function (time) {
    var catCount = 0;
    SLOTS.forEach(function (s) {
        if (s.cat) {
            s.cat.update(time, s);
            catCount++;
        }
    });
    // SLOTS.map(s => s.cat).filter(c => c != null).forEach(c => c.up)
    // currentCats.forEach(c => c.update(time));
    if (time - lastCat >= CAT_INTERVAL && catCount < MAX_CAT_COUNT) {
        var validSlots = SLOTS.filter(function (s) { return s.cat == null; });
        if (validSlots.length > 0) {
            var slot = validSlots[Math.floor(Math.random() * validSlots.length)];
            slot.cat = new Cat(time);
            console.log('Create new cat');
            lastCat = time;
        }
        // const slot = validSlots[Math.floor(Math.random() * validSlots.length)];
        // new Cat(time, slot);
        // console.log('Create new cat ' + currentCats.length);
        // lastCat = time;
    }
    players.forEach(function (p) { return p.update(); });
    if (time - fireTime > 250) {
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
var drawCatInSlot = function (cat, slot, fraction, pattedFrame) {
    ctx.translate(slot.x, slot.y);
    ctx.rotate(slot.angle * Math.PI / 180);
    if (pattedFrame === 0) {
        ctx.drawImage(cat.asset["img"], -100, -cat.draw_height + (cat.draw_height * (1 - fraction)), 200, cat.draw_height);
    }
    else if (pattedFrame < 5) {
        ctx.drawImage(assets["poof" + pattedFrame.toString()]["img"], -80, -100 - (10 * pattedFrame) + (80 * (1 - fraction)), 160, 160);
    }
    // ctx.drawImage(assets["couch"]["img"], 0, -cat.draw_height + (cat.draw_height * (1 - fraction)), 200, cat.draw_height);
    ctx.rotate(-slot.angle * Math.PI / 180);
    ctx.translate(-slot.x, -slot.y);
};
var draw = function (time) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(assets["wallpaper"]["img"], 0, 0, 2883, 1350);
    ctx.drawImage(assets["floor"]["img"], -30, height - 340, 3101, 400);
    ctx.drawImage(assets["fireback"]["img"], 877, 866, 340, 272);
    ctx.drawImage(assets["back" + back.toString()]["img"], 883, 866, 330, 263);
    ctx.drawImage(assets["fireplace"]["img"], 630, -20, 832, 1160);
    ctx.drawImage(assets["art" + RANDOM_ART.toString()]["img"], 1690, 260, 480, 337);
    ctx.drawImage(assets["frame"]["img"], 1630, 170, 600, 524);
    // Draw Cats
    SLOTS.forEach(function (s) {
        if (s.cat) {
            s.cat.draw(s);
        }
    });
    // currentCats.forEach(c => c.draw());
    // Draw Fore-Background
    ctx.drawImage(assets["boombox"]["img"], 930, 478, 250, 164);
    ctx.drawImage(assets["fire" + fire.toString()]["img"], 920, 880, 240, 244);
    ctx.drawImage(assets["pot"]["img"], 1200, 468, 202, 150);
    ctx.drawImage(assets["other-pot"]["img"], 680, 395, 240, 222);
    ctx.drawImage(assets["lamp"]["img"], 2090, 300, 270, 900);
    ctx.drawImage(assets["plant"]["img"], 20, 680, 245, 500);
    ctx.drawImage(assets["couch"]["img"], 200, 730, 508, 450);
    ctx.drawImage(assets["large-couch"]["img"], 1400, 820, 1000, 366);
    players.forEach(function (p) { return p.draw(ctx, assets); });
    // Scoring
    ctx.drawImage(assets["coin"]["img"], width - 950, 50, 100, 100);
    ctx.drawImage(assets["coin"]["img"], width - 500, 50, 100, 100);
};
var gameLoop = function () {
    var time = (new Date).getTime();
    update(time);
    draw(time);
    window.requestAnimationFrame(gameLoop);
};
var changeSong = function () {
    var element = document.getElementById('beats');
    element.src = songRetriever.retrieve();
    console.log("Changed song to " + element.src);
    // (<HTMLMediaElement>document.getElementById('audio')).load();
    // element.load();
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
    players.forEach(function (p) { return p.bindDocument(); });
    window.addEventListener("keyup", function (e) {
        players.forEach(function (p) { return p.onKeyUp(e.key); });
        // if (e.key == 'm') {
        //     changeSong();
        // }
    });
    window.addEventListener("keydown", function (e) {
        players.forEach(function (p) { return p.onKeyDown(e.key); });
    });
    document.getElementById("beats").addEventListener("ended", changeSong);
    changeSong();
    gameLoop();
});
