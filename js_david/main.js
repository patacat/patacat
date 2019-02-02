// Helpers

const coordToPixel = () => {};


// Players

const player1 = {
	x: 0.25,
	y: 0.5
};

const player2 = {
	x: 0.75,
	y: 0.5
};


// Initialize!

document.addEventListener("load", () => {
	console.log("hello");
	const canvas = document.getElementById("main-canvas");
	const assets = {};
	for (let img in document.querySelectorAll("div#assets img")) {
		assets[img.id] = img;
	}
	console.log(assets);
});
