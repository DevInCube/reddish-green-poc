import { Random } from "./utils/Random";

import RemoteController from './utils/remoteController';

const url = new URL(window.location.href);
const remoteControllerId = url.searchParams.get("remote-controller");

if (remoteControllerId) {
    console.log(`Remote controlling mode`);
    const connectOptions = { }; // { host: 'localhost', port: 9000 }
    const controller = new RemoteController(remoteControllerId, connectOptions);
    controller.addEventListener(`open`, () => {
        console.log(`Connected to the remote controller (${remoteControllerId})`);
        controller.addEventListener(`pointermove`, onPointerMove);
        controller.addEventListener(`pointerdown`, onPointerDown);
        controller.addEventListener(`pointerup`, onPointerUp);
        controller.addEventListener(`wheel`, onWheel);
    });
}

const cursor = document.getElementById("cursor") as HTMLCanvasElement;
cursor.width = cursor.clientWidth;
cursor.height = cursor.clientHeight;
const cursorCtx = cursor.getContext("2d")!;

const controls = document.getElementById("controls") as HTMLCanvasElement;
controls.width = controls.clientWidth;
controls.height = controls.clientHeight;
const controlsCtx = controls.getContext("2d")!;

let canvas = document.getElementById("canvas") as HTMLCanvasElement;
canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;
let ctx = canvas.getContext("2d")!;

let width = canvas.width / 2;

let mousePressed = false;

class PaletteCell {
    static size = 1;
    static height = 5;

    color: string
    position: { x: number, y: number }

    constructor(x: number, y: number, c: string) {
        this.color = c;
        this.position = { x, y };
    }

    isHover(mx: number, my: number) {
        let isHoverSide = (side: number) => {
            let x = this.position.x + (!side ? 0 : width);
            return (mx >= x && mx <= x + PaletteCell.size
                && my >= this.position.y && my <= this.position.y + PaletteCell.height);
        }

        return isHoverSide(0) || isHoverSide(1);
    }

    draw(context: CanvasRenderingContext2D) {
        context.fillStyle = this.color;
        context.strokeStyle = "black";

        drawSide(this, 0);
        drawSide(this, 1);

        function drawSide(athis: PaletteCell, side: number) {
            let x = athis.position.x + (!side ? 0 : width);
            context.fillRect(x, athis.position.y, PaletteCell.size, PaletteCell.height);
        }
    }
}

const padding = 10;

const colors = [];
for (let lightness = 0; lightness <= 100; lightness += 10) {
    for (let hue = 0; hue < 360; hue += 1) {
        colors.push(`hsl(${hue}, 100%, ${lightness}%)`);
    }
}

let cells = colors.map((c, i) => new PaletteCell(
    padding + ((i % 360) * PaletteCell.size),
    padding + (Math.floor(i / 360) * PaletteCell.height), c));

for (let c of cells) {
    controlsCtx.globalAlpha = 1;
    c.draw(controlsCtx);
}

drawExtraLines(controlsCtx);

function drawExtraLines(ctx: CanvasRenderingContext2D) {
    ctx.strokeStyle = "#bbb";
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.7;
    // palette borders
    ctx.strokeRect(padding, padding, 360 * PaletteCell.size, Math.floor((cells.length / 360) * PaletteCell.height));
    ctx.strokeRect(width + padding, padding, 360 * PaletteCell.size, Math.floor((cells.length / 360) * PaletteCell.height));

    // left cross
    ctx.beginPath();
    ctx.moveTo(width / 2 - 100, canvas.height / 2);
    ctx.lineTo(width / 2 + 100, canvas.height / 2);
    ctx.closePath();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(width / 2, canvas.height / 2 - 100);
    ctx.lineTo(width / 2, canvas.height / 2 + 100);
    ctx.closePath();
    ctx.stroke();
    ctx.strokeRect(width / 2 - 100 - 20, canvas.height / 2 - 20, 40, 40);
    ctx.strokeRect(width / 2 + 100 - 20, canvas.height / 2 - 20, 40, 40);

    // right cross
    ctx.beginPath();
    ctx.moveTo(width + width / 2 - 100, canvas.height / 2);
    ctx.lineTo(width + width / 2 + 100, canvas.height / 2);
    ctx.closePath();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(width + width / 2, canvas.height / 2 - 100);
    ctx.lineTo(width + width / 2, canvas.height / 2 + 100);
    ctx.closePath();
    ctx.stroke();
    ctx.strokeRect(width + width / 2 - 100 - 20, canvas.height / 2 - 20, 40, 40);
    ctx.strokeRect(width + width / 2 + 100 - 20, canvas.height / 2 - 20, 40, 40);
}

let size = 10;
let leftColor = 'green';
let rightColor = leftColor;

let lastX = 0;
let lastY = 0;

function onPointerDown(e: MouseEvent) {
    let x = e.offsetX;
    let y = e.offsetY;

    let cell = cells.find(c => c.isHover(x, y));
    if (cell) {
        if (e.button === 0) {
            leftColor = cell.color;
        }
        return;
    }

    mousePressed = true;

    drawLine(x, y, x + 1, y + 1);
    lastX = x;
    lastY = y;
}

function onPointerUp(e: MouseEvent) {
    let x = e.offsetX;
    let y = e.offsetY;
    let cell = cells.find(c => c.isHover(x, y));
    if (cell) {
        if (e.button === 0) {
            rightColor = cell.color;
        }
        return;
    }

    mousePressed = false;
}

function onPointerMove(e: MouseEvent) {
    const x = e.offsetX;
    const y = e.offsetY;
    drawCursor(x, y);
    if (mousePressed) {
        drawLine(lastX, lastY, x, y);
        lastX = x;
        lastY = y;
    }
}

function onWheel(e: MouseWheelEvent) {
    size -= Math.sign(e.deltaY);
    if (size < 1) size = 1;
    else if (size > 50) size = 50;
    drawCursor(e.offsetX, e.offsetY);
    e.preventDefault();
}

canvas.addEventListener("pointerdown", onPointerDown);
canvas.addEventListener("pointermove", onPointerMove);
canvas.addEventListener("pointerup", onPointerUp);
canvas.addEventListener("wheel", onWheel);

function drawLine(x1: number, y1: number, x2: number, y2: number) {
    _drawLine(x1 % width, y1, x2 % width, y2, leftColor);
    _drawLine(x1 % width + width, y1, x2 % width + width, y2, rightColor);
}

function _drawLine(x1: number, y1: number, x2: number, y2: number, color: string) {
    ctx.strokeStyle = color;
    ctx.lineWidth = size;
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.closePath();
    ctx.stroke();
}

function drawCursor(x1: number, y1: number) {
    cursorCtx.clearRect(0, 0, cursor.width, cursor.height);
    _drawCursor(x1 % width, y1, leftColor);
    _drawCursor(x1 % width + width, y1, rightColor);
    function _drawCursor(x: number, y: number, color: string) {
        cursorCtx.strokeStyle = color;
        cursorCtx.lineWidth = 2;
        cursorCtx.beginPath();
        cursorCtx.ellipse(x, y, size / 2, size / 2, 0, 0, 2 * Math.PI);
        cursorCtx.stroke();
        cursorCtx.closePath();
    }
}



