type Controls = {
	up: string;
	left: string;
	down: string;
	right: string;
	pat: string;
}

type PlayerProps = {
	x: number;
	y: number;
	assets: any;
	element: HTMLElement
	controls: Controls
	point: Point
}

class Player {

	assets: any;
	x: number;
	y: number;
	controls: Controls;
	_offsetX: number;
	_offsetY: number;
	damaged = false;
	damagedTime = 0;
	damagedX = 0;
	damagedY = 0;
	patting = false;
	v = 0;
	dir = 0;
	score = 0;
	scoreElement: HTMLElement;
	index: number;

	static players: Player[] = [];

	constructor(props: PlayerProps) {
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

	pointX(): number {
		return this.x + this._offsetX;
	}

	pointY(): number {
		return this.y + this._offsetY;
	}

	_hitOtherPlayer(p): boolean {
		return Math.pow(this.pointX() - p.pointX(), 2) + Math.pow(this.y - p.y, 2) <= 8000;
	}

	_addScore(s): void {
		this.score += s;
		this.scoreElement.innerHTML = this.score.toFixed();
	}

	update(time: number, width: number, height: number, keys: any): void {
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
				playNewSong();
			} else {
				let hitSomething = false;
				Player.players.filter((p, i) => i !== this.index && this._hitOtherPlayer(p))
					.forEach(p => {
						hitSomething = true;

						p.damaged = true;
						p.damagedTime = time;
						p.damagedX = p.x;
						p.damagedY = p.y;
					});

				if (!hitSomething) {
					Cat.currentCats.forEach(c => {
						if (Math.pow(c.slot.x - this.pointX(), 2)
							+ Math.pow(c.slot.y - this.pointY(), 2) > 40000) return;

						if (c.patted) return;

						c.patted = true;
						if (c.cat.name === "fake") {
							this._addScore(-30);
						} else if(c.cat.name === "fire-cat") {
							this._addScore(30);
						} else {
							this._addScore(10);
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

	draw(ctx: CanvasRenderingContext2D, gs: number): void {
		if (this.patting) {
			ctx.drawImage((this.damaged ? this.assets.damaged : this.assets.normal)["img"],
				gs * (this.x - 85), gs * (this.y - 85), gs * 170, gs * 170);
			return;
		}

		ctx.drawImage((this.damaged ? this.assets.damaged : this.assets.normal)["img"],
			gs * (this.x - 100), gs * (this.y - 100), gs * 200, gs * 200);
	}
}
