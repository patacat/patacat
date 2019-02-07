"use strict";
var Player = /** @class */ (function () {
    function Player(props) {
        this.damaged = false;
        this.damagedTime = 0;
        this.damagedX = 0;
        this.damagedY = 0;
        this.patting = false;
        this.v = 0;
        this.dir = 0;
        this.score = 0;
        this.assets = props.assets;
        this.x = props.x;
        this.y = props.y;
        this.controls = props.controls;
        this._offsetX = props.point.offsetX;
        this._offsetY = props.point.offsetY;
        this.scoreElement = props.element;
        this.index = Player.players.length;
        Player.players.push(this);
    }
    Player.prototype.pointX = function () {
        return this.x + this._offsetX;
    };
    Player.prototype.pointY = function () {
        return this.y + this._offsetY;
    };
    Player.prototype._hitOtherPlayer = function (p) {
        return Math.pow(this.pointX() - p.pointX(), 2) + Math.pow(this.y - p.y, 2) <= 8000;
    };
    Player.prototype._addScore = function (s) {
        this.score += s;
        this.scoreElement.innerHTML = this.score.toFixed();
    };
    Player.prototype.update = function (time, width, height, keys) {
        // Controls
        var _this = this;
        if (keys[this.controls.up] && !keys[this.controls.left] && !keys[this.controls.right]
            && !keys[this.controls.down]) {
            this.v = Math.min(this.v + ACCEL, MAX_V);
            this.dir = 90 * Math.PI / 180;
        }
        else if (keys[this.controls.up] && keys[this.controls.left] && !keys[this.controls.right]
            && !keys[this.controls.down]) {
            this.v = Math.min(this.v + ACCEL, MAX_V);
            this.dir = 135 * Math.PI / 180;
        }
        else if (keys[this.controls.up] && !keys[this.controls.left] && keys[this.controls.right]
            && !keys[this.controls.down]) {
            this.v = Math.min(this.v + ACCEL, MAX_V);
            this.dir = 45 * Math.PI / 180;
        }
        else if (!keys[this.controls.up] && !keys[this.controls.left] && !keys[this.controls.right]
            && keys[this.controls.down]) {
            this.v = Math.min(this.v + ACCEL, MAX_V);
            this.dir = 270 * Math.PI / 180;
        }
        else if (!keys[this.controls.up] && keys[this.controls.left] && !keys[this.controls.right]
            && keys[this.controls.down]) {
            this.v = Math.min(this.v + ACCEL, MAX_V);
            this.dir = 225 * Math.PI / 180;
        }
        else if (!keys[this.controls.up] && !keys[this.controls.left] && keys[this.controls.right]
            && keys[this.controls.down]) {
            this.v = Math.min(this.v + ACCEL, MAX_V);
            this.dir = 315 * Math.PI / 180;
        }
        else if (!keys[this.controls.up] && !keys[this.controls.left] && keys[this.controls.right]
            && !keys[this.controls.down]) {
            this.v = Math.min(this.v + ACCEL, MAX_V);
            this.dir = 0;
        }
        else if (!keys[this.controls.up] && keys[this.controls.left] && !keys[this.controls.right]
            && !keys[this.controls.down]) {
            this.v = Math.min(this.v + ACCEL, MAX_V);
            this.dir = 180 * Math.PI / 180;
        }
        else {
            if (this.v < 0.01)
                this.v = 0;
            else
                this.v *= 0.8;
        }
        // Patting
        if (!this.patting && keys[this.controls.pat]) {
            this.patting = true;
            if (this.pointX() >= 930 && this.pointX() <= 930 + 250
                && this.pointY() >= 478 && this.pointY() <= 478 + 164) {
                // Boombox
                playNewSong();
            }
            else {
                var hitSomething_1 = false;
                Player.players.filter(function (p, i) { return i !== _this.index && _this._hitOtherPlayer(p); })
                    .forEach(function (p) {
                    hitSomething_1 = true;
                    p.damaged = true;
                    p.damagedTime = time;
                    p.damagedX = p.x;
                    p.damagedY = p.y;
                });
                if (!hitSomething_1) {
                    Cat.currentCats.forEach(function (c) {
                        if (Math.pow(c.slot.x - _this.pointX(), 2)
                            + Math.pow(c.slot.y - _this.pointY(), 2) > 40000)
                            return;
                        if (c.patted)
                            return;
                        c.patted = true;
                        if (c.cat.name === "fake") {
                            _this._addScore(-30);
                        }
                        else if (c.cat.name === "fire-cat") {
                            _this._addScore(30);
                        }
                        else {
                            _this._addScore(10);
                        }
                    });
                }
            }
        }
        else if (this.patting && !keys[this.controls.pat]) {
            this.patting = false;
        }
        // Movement
        this.x += Math.cos(this.dir) * this.v;
        this.y -= Math.sin(this.dir) * this.v;
        // Modified Damage Movement
        if (this.damaged) {
            if (this.x < this.damagedX) {
                this.x += Math.abs(this.x - this.damagedX) * 0.2;
            }
            else if (this.x > this.damagedX) {
                this.x -= Math.abs(this.x - this.damagedX) * 0.2;
            }
            if (this.y < this.damagedY) {
                this.y += Math.abs(this.y - this.damagedY) * 0.2;
            }
            else if (this.y > this.damagedY) {
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
            for (var k in this.controls) {
                if (!this.controls.hasOwnProperty(k))
                    continue;
                keys[this.controls[k]] = false;
            }
            this.dir = this.dir - Math.PI;
            if (this.x < 100)
                this.x = 100;
            if (this.y < 100)
                this.y = 100;
            if (this.x > width - 100)
                this.x = width - 100;
            if (this.y > height - 100)
                this.y = height - 100;
        }
    };
    Player.prototype.draw = function (ctx, gs) {
        if (this.patting) {
            ctx.drawImage((this.damaged ? this.assets.damaged : this.assets.normal)["img"], gs * (this.x - 85), gs * (this.y - 85), gs * 170, gs * 170);
            return;
        }
        ctx.drawImage((this.damaged ? this.assets.damaged : this.assets.normal)["img"], gs * (this.x - 100), gs * (this.y - 100), gs * 200, gs * 200);
    };
    Player.players = [];
    return Player;
}());
