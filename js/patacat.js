"use strict";
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
        this.configs = configs;
        this.x = configs.x;
        this.y = configs.y;
    }
    Player.prototype.update = function (time) {
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
        }
        else if (this.patting && !this.actions.patting) {
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
    };
    Player.prototype.fitWithinBounds = function (padding) {
        if (this.x < padding)
            this.x = padding;
        if (this.y < padding)
            this.y = padding;
        if (this.x > this.configs.width - padding)
            this.x = this.configs.width - 100;
        if (this.y > this.configs.height - padding)
            this.y = this.configs.height - 100;
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
            }
        }
    };
    Player.prototype.draw = function (ctx, assets) {
        if (this.patting) {
            ctx.drawImage(assets["player" + this.configs.tag + (this.damaged ? "-damaged" : "")]["img"], this.x - 100, this.y - 100, 200, 200);
        }
        else {
            ctx.drawImage(assets["player" + this.configs.tag + (this.damaged ? "-damaged" : "")]["img"], this.x - 100, this.y - 100, 200, 200);
        }
        ctx.drawImage(assets["fire1" + (this.damaged ? "-damaged" : "")]["img"], this.x - 60, this.y - 80, 20, 20);
    };
    return Player;
}());
