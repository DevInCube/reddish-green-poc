import { Random } from "./utils/Random";

let canvas = document.getElementById("canvas") as HTMLCanvasElement;
canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;
let ctx = canvas.getContext("2d")!;

let width = canvas.width / 2;

let mousePressed = false;


class PaletteCell 
{
    static size = 50;

    color: string
    position: {x:number, y: number}

    constructor(x: number, y: number, c: string) {
        this.color = c;
        this.position = {x, y};
    }

    isHover(x: number, y: number) {
        return (x >= this.position.x && x <= this.position.x + PaletteCell.size
            && y >= this.position.y && y <= this.position.y + PaletteCell.size);
    }

    draw(context: CanvasRenderingContext2D, side: number) {
        context.fillStyle = this.color;
        context.strokeStyle = "black";
        let x = this.position.x + (!side ? 0 : width);
        context.fillRect(x, this.position.y, PaletteCell.size, PaletteCell.size); 
        context.strokeRect(x, this.position.y, PaletteCell.size, PaletteCell.size);
    }
}

const padding = 10;

let colors = ["yellow", "red", "cyan", "lightgreen", "green", "lightsteelblue", "blue", "black", "white"];

let cells = colors.map((c, i) => new PaletteCell(padding + i * (PaletteCell.size + 10), padding, c));

for (let c of cells) {
    c.draw(ctx, 0);
    c.draw(ctx, 1);
}

let leftColor = 'green';
let rightColor = leftColor;

let lastX = 0;
let lastY = 0;
canvas.addEventListener("mousedown", e => {

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
});

canvas.addEventListener("mousemove", e => {
    if (mousePressed) {
        let x = e.offsetX;
        let y = e.offsetY;
        drawLine(lastX, lastY, x, y);
        lastX = x;
        lastY = y;
    }
});

canvas.addEventListener("mouseup", e => {
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
})

function drawLine(x1: number, y1: number, x2: number, y2: number) {
    _drawLine(x1 % width, y1, x2 % width, y2, leftColor);
    _drawLine(x1 % width + width, y1, x2 % width + width, y2, rightColor);
}

function _drawLine(x1: number, y1: number, x2: number, y2: number, color: string) {
    ctx.strokeStyle = color;
    ctx.lineJoin = "round";
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.closePath();
    ctx.stroke();
}

    

