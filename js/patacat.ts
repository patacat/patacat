class Actions {
    up: boolean = false;
    down: boolean = false;
    left: boolean = false;
    right: boolean = false;
    patting: boolean = false;

    reset() {
        this.up = false;
        this.down = false;
        this.left = false;
        this.right = false;
    }
}

type PlayerConfig = {
    tag: string
    x: number
    y: number
    width: number
    height: number
    keyUp: string,
    keyLeft: string,
    keyRight: string,
    keyDown: string,
    keyPat: string
}


const MAX_V = 20;
const ACCEL = 1;

class Player {

    constructor(configs: PlayerConfig) {
        this.configs = configs;
        this.x = configs.x;
        this.y = configs.y;
    }

    configs: PlayerConfig;
    x: number;
    y: number;
    v: number = 0;
    dir: number = 0;
    damaged: boolean = false;
    patting: boolean = false;
    actions: Actions = new Actions();

    update(): void {
        if (this.actions.up && !this.actions.left && !this.actions.right && !this.actions.down) {
            this.v = Math.min(this.v + ACCEL, MAX_V);
            this.dir = 90 * Math.PI / 180;
        } else if (this.actions.up && this.actions.left && !this.actions.right && !this.actions.down) {
            this.v = Math.min(this.v + ACCEL, MAX_V);
            this.dir = 135 * Math.PI / 180;
        } else if (this.actions.up && !this.actions.left && this.actions.right && !this.actions.down) {
            this.v = Math.min(this.v + ACCEL, MAX_V);
            this.dir = 45 * Math.PI / 180;
        } else if (!this.actions.up && !this.actions.left && !this.actions.right && this.actions.down) {
            this.v = Math.min(this.v + ACCEL, MAX_V);
            this.dir = 270 * Math.PI / 180;
        } else if (!this.actions.up && this.actions.left && !this.actions.right && this.actions.down) {
            this.v = Math.min(this.v + ACCEL, MAX_V);
            this.dir = 225 * Math.PI / 180;
        } else if (!this.actions.up && !this.actions.left && this.actions.right && this.actions.down) {
            this.v = Math.min(this.v + ACCEL, MAX_V);
            this.dir = 315 * Math.PI / 180;
        } else if (!this.actions.up && !this.actions.left && this.actions.right && !this.actions.down) {
            this.v = Math.min(this.v + ACCEL, MAX_V);
            this.dir = 0;
        } else if (!this.actions.up && this.actions.left && !this.actions.right && !this.actions.down) {
            this.v = Math.min(this.v + ACCEL, MAX_V);
            this.dir = 180 * Math.PI / 180;
        } else {
            if (this.v < 0.01) this.v = 0;
            else this.v *= 0.8;
        }
        // Update patting
        if (!this.patting && this.actions.patting) {
            this.patting = true;
        } else if (this.patting && !this.actions.patting) {
            this.patting = false;
        }

        // Update positions
        this.x += Math.cos(this.dir) * this.v;
        this.y -= Math.sin(this.dir) * this.v;

        if (this.x < 100 || this.y < 100 || this.x > this.configs.width - 100 || this.y > this.configs.height - 100) {
            this.actions.reset();
            this.dir = this.dir - Math.PI;
        }

        this.fitWithinBounds(100);
    }

    fitWithinBounds(padding: number) {
        if (this.x < padding) this.x = padding;
        if (this.y < padding) this.y = padding;
        if (this.x > this.configs.width - padding) this.x = this.configs.width - 100;
        if (this.y > this.configs.height - padding) this.y = this.configs.height - 100;
    }

    onKeyDown(key: string): void {
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
    }

    onKeyUp(key: string): void {
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
    }

    draw(ctx: CanvasRenderingContext2D, assets: any): void {
        if (this.patting) {
            ctx.drawImage(assets[`player${this.configs.tag}` + (this.damaged ? "-damaged" : "")]["img"],
                player1.x - 85, player1.y - 85, 170, 170);
        } else {
            ctx.drawImage(assets[`player${this.configs.tag}` + (this.damaged ? "-damaged" : "")]["img"],
                this.x - 100, this.y - 100, 200, 200);
        }

        ctx.drawImage(assets["fire1" + (this.damaged ? "-damaged" : "")]["img"],
            this.x - 60, this.y - 80, 20, 20);
    }
}
