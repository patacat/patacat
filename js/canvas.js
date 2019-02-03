"use strict";
var ctx;
var Asset = /** @class */ (function () {
    function Asset(img) {
        this.key = img.id;
        this.img = img;
        this.width = img.width;
        this.height = img.height;
    }
    return Asset;
}());
var RelativeCoord = /** @class */ (function () {
    function RelativeCoord() {
        this.relativeTo = '_canvas';
        this.relativeX = 0;
        this.relativeY = 0;
        this.relativeScale = 1;
        this.preferMax = false;
    }
    RelativeCoord.relativeMax = function (x, y, scale) {
        var c = new RelativeCoord();
        c.relativeX = x;
        c.relativeY = y;
        c.preferMax = true;
        c.relativeScale = scale;
        return c;
    };
    RelativeCoord.relativeMin = function (x, y, scale) {
        var c = new RelativeCoord();
        c.relativeX = x;
        c.relativeY = y;
        c.preferMax = false;
        c.relativeScale = scale;
        return c;
    };
    RelativeCoord.relativeAsset = function (key, x, y, scale) {
        var c = new RelativeCoord();
        c.relativeTo = key;
        c.relativeX = x;
        c.relativeY = y;
        c.preferMax = false;
        c.relativeScale = scale;
        return c;
    };
    RelativeCoord.prototype.computeCoords = function (canvas) {
    };
    return RelativeCoord;
}());
var CanvasAsset = /** @class */ (function () {
    function CanvasAsset(asset, coord) {
        this.asset = asset;
        this.coord = coord;
    }
    CanvasAsset.prototype.draw = function (ctx) {
        ctx.drawImage(this.asset.img, this.coord.dx, this.coord.dy, this.coord.dw, this.coord.dh);
    };
    return CanvasAsset;
}());
/**
 * TODO change to dict and apply topological sorting
 */
var bindings = [
    {
        key: 'wallpaper',
        relativeCoord: RelativeCoord.relativeMax(0, 0, 1)
    },
    {
        key: 'floor',
        relativeCoord: RelativeCoord.relativeMax(0, 0.7, 1)
    },
    {
        key: 'fireplace',
        relativeCoord: RelativeCoord.relativeMin(0.5, 0.8, 0.3)
    }
];
// for (let i = 0; i < 5; i++) {
//     bindings[`fire${i}`] = {}
// }
var canvasAssets;
/**
 * Load assets and their positions; call after document is loaded
 */
function getCanvasAssets(canvas) {
    var assets = {};
    var canvasAssets = {};
    document.querySelectorAll("div#assets img").forEach(function (el) {
        var asset = new Asset(el);
        assets[asset.key] = asset;
    });
    for (var _i = 0, bindings_1 = bindings; _i < bindings_1.length; _i++) {
        var b = bindings_1[_i];
        if (b.key in assets) {
            console.log("Missing asset " + b.key);
            continue;
        }
        canvasAssets[b.key] = new CanvasAsset(assets[b.key], b.relativeCoord.computeCoords(canvas));
    }
    return canvasAssets;
}
function drawAssets(ctx) {
    var keys = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        keys[_i - 1] = arguments[_i];
    }
    for (var k in keys) {
        if (k in canvasAssets) {
            canvasAssets[k].draw(ctx);
        }
    }
}
