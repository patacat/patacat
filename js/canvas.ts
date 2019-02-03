let ctx: CanvasRenderingContext2D;

type Slot = {
    relativeTo: AssetKey
    relativeX: number
    relativeY: number
    angle: number
}

type Canvas = {
    canvas: HTMLCanvasElement,

}

type AssetKey = string

class Asset {

    constructor(img: HTMLCanvasElement) {
        this.key = img.id;
        this.img = img;
        this.width = img.width;
        this.height = img.height;
    }

    key: AssetKey;
    img: HTMLCanvasElement;
    width: number;
    height: number;
}

class RelativeCoord {
    relativeTo: AssetKey = '_canvas';
    relativeX: number = 0;
    relativeY: number = 0;
    relativeScale: number = 1;
    preferMax: boolean = false;

    static relativeMax(x: number, y: number, scale: number): RelativeCoord {
        const c = new RelativeCoord();
        c.relativeX = x;
        c.relativeY = y;
        c.preferMax = true;
        c.relativeScale = scale;
        return c;
    }

    static relativeMin(x: number, y: number, scale: number): RelativeCoord {
        const c = new RelativeCoord();
        c.relativeX = x;
        c.relativeY = y;
        c.preferMax = false;
        c.relativeScale = scale;
        return c;
    }

    static relativeAsset(key: AssetKey, x: number, y: number, scale: number): RelativeCoord {
        const c = new RelativeCoord();
        c.relativeTo = key;
        c.relativeX = x;
        c.relativeY = y;
        c.preferMax = false;
        c.relativeScale = scale;
        return c;
    }

    computeCoords(canvas: Canvas): CanvasCoordinate {

    }
}

type CanvasCoordinate = {
    dx: number
    dy: number
    dw: number
    dh: number
}

class CanvasAsset {
    constructor(asset: Asset, coord: CanvasCoordinate) {
        this.asset = asset;
        this.coord = coord;
    }

    asset: Asset;
    coord: CanvasCoordinate;

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.drawImage(this.asset.img,
            this.coord.dx,
            this.coord.dy,
            this.coord.dw,
            this.coord.dh);
    }
}

type Binding = {
    key: AssetKey
    relativeCoord: RelativeCoord
}

/**
 * TODO change to dict and apply topological sorting
 */
const bindings: Binding[] = [
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

let canvasAssets: Record<AssetKey, CanvasAsset>;

/**
 * Load assets and their positions; call after document is loaded
 */
function getCanvasAssets(canvas: Canvas): Record<AssetKey, CanvasAsset> {
    const assets: Record<AssetKey, Asset> = {};
    const canvasAssets: Record<AssetKey, CanvasAsset> = {};
    document.querySelectorAll("div#assets img").forEach(el => {
        const asset = new Asset(<HTMLCanvasElement>el);
        assets[asset.key] = asset;
    });
    for (let b of bindings) {
        if (b.key ! in assets) {
            console.log(`Missing asset ${b.key}`);
            continue
        }
        canvasAssets[b.key] = new CanvasAsset(assets[b.key], b.relativeCoord.computeCoords(canvas));
    }
    return canvasAssets;
}

function drawAssets(ctx: CanvasRenderingContext2D, ...keys: AssetKey[]): void {
    for (const k in keys) {
        if (k in canvasAssets) {
            canvasAssets[k].draw(ctx);
        }
    }
}
