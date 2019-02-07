class Cat {
	constructor(time, fc) {
		this.entering = true;
		this.leaving = false;
		this.patted = false;

		this._deleted = false;

		this.level = 0;

		/**
		 * @type {CatType}
		 */
		this.cat = fc ? fireCat : CatType.allTypes[Math.floor(Math.random() * CatType.allTypes.length)];

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
		Cat.currentCats.push(this);
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
				meow.play().catch(err => {
					console.log(`Could not play meow (Error: ${err})`);
				});
			} else if (time - this.pattedTime > PAT_FRAME_LENGTH && this.pattedFrame <= 4) {
				this.pattedTime = time;
				this.pattedFrame += 1
			} else if (time - this.pattedTime > PAT_FRAME_LENGTH && this.pattedFrame === 5) {
				Cat.currentCats = Cat.currentCats.filter(c => c !== this);
				this._deleted = true;
				this.slot.occupied = false;
			}

			return;
		}

		if (this.leaving && !this.patted) {
			this.level = Math.max(this.level - 0.1, 0.0);
			if (this.level > 0.001) return;

			Cat.currentCats = Cat.currentCats.filter(c => c !== this);
			this._deleted = true;
			this.slot.occupied = false;
		}
	}

	draw(ctx, gs) {
		if (this._deleted) return;

		ctx.translate(gs * this.slot.x, gs * this.slot.y);
		ctx.rotate(this.slot.angle * Math.PI / 180);

		if (this.pattedFrame === 0) {
			// ctx.fillRect(gs * -100, gs * (-cat.draw_height + (cat.draw_height * (1 - fraction))), gs * 200,
			//     gs * cat.draw_height);
			ctx.drawImage(
				this.cat.asset["img"],

				0, 0,
				this.cat.sourceW,
				Math.max(this.cat.sourceH * this.level, 1),

				gs * -100,
				gs * (-this.cat.drawHeight + (this.cat.drawHeight * (1 - this.level))),
				gs * 200,
				gs * this.cat.drawHeight * this.level
			);
		} else if (this.pattedFrame < 5) {
			ctx.drawImage(
				assets["poof" + this.pattedFrame.toString()]["img"],
				gs * -80,
				gs * (-100 - (10 * this.pattedFrame) + (80 * (1 - this.level))),
				gs * 160,
				gs * 160
			);
		}
		// ctx.drawImage(assets["couch"]["img"], 0, -cat.draw_height + (cat.draw_height * (1 - fraction)), 200,
		//     cat.draw_height);
		ctx.rotate(-this.slot.angle * Math.PI / 180);
		ctx.translate(gs * -this.slot.x, gs * -this.slot.y);
	}
}

/**
 * @type {Cat[]}
 */
Cat.currentCats = [];
