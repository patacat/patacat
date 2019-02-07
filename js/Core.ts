/**
 * Todo change
 * I believe all canvas items should have a unified interface, and that update & draw
 * should take in a list of items and map all the operations.
 * Right now the calls differ per item
 */
interface CanvasItem {
    /**
     * Called per frame with the current update time
     * @param time current time in millis
     */
    update(time: number);

    /**
     * Called after update
     * @param ctx canvas
     * @param gs global scale
     */
    draw(ctx: CanvasRenderingContext2D, gs: number);
}

type Point = {
    offsetX: number;
    offsetY: number;
}

type AssetImg = {
    img: HTMLCanvasElement
    w: number
    h: number
}

type Slot = {
    x: number
    y: number
    angle: number
    occupied: boolean
}

// TODO not a big fan of this. Slots should be the same regardless of cat type
type FireSlot = Slot & {
    time: number
}

const MAX_V = 25;
const ACCEL = 1;

const DAMAGED_LENGTH = 1500;


const MAX_CATS = 4;

const CAT_LENGTH = 2200;
const CAT_INTERVAL = 1000;

const PAT_FRAME_LENGTH = 100;


const FIRE_CAT_INTERVAL = 12000;
const FIRE_FRAME_LENGTH = 250;
