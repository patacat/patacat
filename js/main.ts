// Globals

let canvas;
let ctx: CanvasRenderingContext2D;
let cats: any[] = [];

let fireTime = 0;
let fire = 1;

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


// Helpers


// Players

const globalConfigs = {
    currentCats: [],
    width: width,
    height: height
};

const player1 = new Player({
    tag: '1',
    x: 0.25 * width + 50,
    y: 0.3 * height,

    keyUp: 'w',
    keyLeft: 'a',
    keyRight: 'd',
    keyDown: 's',
    keyPat: 'e',

}, globalConfigs);

const player2 = new Player({
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
const player3 = new Player({
    tag: '1',
    x: 0.5 * width + 50,
    y: 0.3 * height,

    keyUp: 't',
    keyLeft: 'f',
    keyRight: 'g',
    keyDown: 'h',
    keyPat: 'y',

}, globalConfigs);

const CAT_INTERVAL = 1000;

let lastCat = 0;


const CAT_LENGTH = 2000;

const PAT_FRAME_LENGTH = 100;

const players = [player1, player2];

class Cat {
    constructor(time) {
        this.cat = cats[Math.floor(Math.random() * cats.length)];

        this.initialTime = time;

        let slot = Math.floor(Math.random() * SLOTS.length);
        while (SLOTS[slot].occupied) {
            slot = Math.floor(Math.random() * SLOTS.length);
        }
        this.slot = SLOTS[slot];
        this.slot.occupied = true;

        globalConfigs.currentCats.push(this);
    };

    cat: any;
    entering = true;
    leaving = false;
    patted = false;
    level = 0;
    pattedTime = 0;
    pattedFrame = 0;
    initialTime: number;
    slot: any;

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
                for (let c in globalConfigs.currentCats) {
                    if (!globalConfigs.currentCats.hasOwnProperty(c)) continue;
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
                for (let c in globalConfigs.currentCats) {
                    if (!globalConfigs.currentCats.hasOwnProperty(c)) continue;
                    if (globalConfigs.currentCats[c] === this) {
                        this.slot.occupied = false;
                        // @ts-ignore
                        globalConfigs.currentCats.splice(c, 1);
                    }
                }
            }
        }
    }

    draw() {
        drawCatInSlot(this.cat, this.slot, this.level, this.pattedFrame);
    }
}

const update = (time: number) => {

    globalConfigs.currentCats.forEach(c => c.update(time));

    if (time - lastCat >= CAT_INTERVAL && globalConfigs.currentCats.length < 3) {
        new Cat(time);
        console.log('Create new cat');
        lastCat = time;
    }

    players.forEach(p => p.update());
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

};

const draw = (time) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawAssets(ctx, 'wallpaper', 'floor', 'fireplace', `fire1`);

    // ctx.drawImage(assets["wallpaper"]["img"], 0, 0, 2883, 1350);
    // ctx.drawImage(assets["floor"]["img"], -30, height - 340, 3101, 400);
    //
    // ctx.drawImage(assets["fireplace"]["img"], 630, -20, 832, 1160);
    //
    // ctx.drawImage(assets["lamp"]["img"], 2090, 300, 270, 900);
    //
    //
    // // Draw Cats
    //
    // globalConfigs.currentCats.forEach(c => c.draw());
    //
    // // Draw Fore-Background
    //
    // ctx.drawImage(assets["boombox"]["img"], 930, 478, 250, 164);
    //
    // ctx.drawImage(assets["fire" + fire.toString()]["img"], 920, 890, 240, 244);
    //
    // ctx.drawImage(assets["pot"]["img"], 1200, 468, 202, 150);
    // ctx.drawImage(assets["other-pot"]["img"], 680, 395, 240, 222);
    //
    // ctx.drawImage(assets["lamp"]["img"], 2090, 300, 270, 900);
    //
    // ctx.drawImage(assets["plant"]["img"], 20, 680, 245, 500);
    //
    // ctx.drawImage(assets["couch"]["img"], 200, 730, 508, 450);
    // ctx.drawImage(assets["large-couch"]["img"], 1400, 820, 1000, 366);


    players.forEach(p => p.draw(ctx, canvasAssets));
};


const gameLoop = () => {
    const time = (new Date).getTime();

    update(time);
    draw(time);

    window.requestAnimationFrame(gameLoop);
};

// Initialize!

document.addEventListener("DOMContentLoaded", () => {
    canvas = document.getElementById("main-canvas");
    ctx = canvas.getContext("2d");
    canvasAssets = getCanvasAssets(canvas);
    // for (let k in assets) {
    //     if (!assets.hasOwnProperty(k)) continue;
    //     if (k.substr(0, 4) === "cat-") {
    //         cats.push({
    //             asset: assets[k],
    //             draw_height: 200 * (assets[k]["h"] / assets[k]["w"])
    //         });
    //     }
    // }

    window.addEventListener("keyup", e => {
        players.forEach(p => p.onKeyUp(e.key));
    });
    window.addEventListener("keydown", e => {
        players.forEach(p => p.onKeyDown(e.key));
    });

    document.getElementById("beats")!.addEventListener("ended", changeSound);

    changeSound();

    gameLoop();
});
