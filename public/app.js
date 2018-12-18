// https://en.wikipedia.org/wiki/Lehmer_random_number_generator
System.register("utils/Random", [], function (exports_1, context_1) {
    var MAX_INT32, MINSTD, Random;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [],
        execute: function () {// https://en.wikipedia.org/wiki/Lehmer_random_number_generator
            MAX_INT32 = 2147483647;
            MINSTD = 16807;
            Random = class Random {
                constructor(seed) {
                    if (!Number.isInteger(seed)) {
                        throw new TypeError("Expected `seed` to be a `integer`");
                    }
                    this.seed = seed % MAX_INT32;
                    if (this.seed <= 0) {
                        this.seed += (MAX_INT32 - 1);
                    }
                }
                next() {
                    return this.seed = this.seed * MINSTD % MAX_INT32;
                }
                nextFloat() {
                    return (this.next() - 1) / (MAX_INT32 - 1);
                }
            };
            exports_1("Random", Random);
        }
    };
});
System.register("utils/remoteController", [], function (exports_2, context_2) {
    var RemoteController;
    var __moduleName = context_2 && context_2.id;
    return {
        setters: [],
        execute: function () {
            RemoteController = class RemoteController {
                constructor(id, options) {
                    this.eventListeners = {};
                    //
                    options = Object.assign({}, options, { iceServers: [
                            { urls: 'stun:stun1.l.google.com:19302' },
                            {
                                "urls": [
                                    "turn:13.250.13.83:3478?transport=udp"
                                ],
                                "username": "YzYNCouZM1mhqhmseWk6",
                                "credential": "YzYNCouZM1mhqhmseWk6"
                            },
                        ] });
                    const peer = new Peer(randomId(), options);
                    const conn = peer.connect(id);
                    conn.on('open', () => {
                        this.__emit(`open`, {});
                        //
                        conn.on('data', (data) => {
                            // console.log('Received', data);
                            if (data.event) {
                                this.__emit(data.event, data.data);
                            }
                        });
                    });
                    setInterval(() => conn.send("ping"), 3000);
                    function randomId() {
                        return Math.random().toString(36).substring(14);
                    }
                }
                addEventListener(eventType, handler) {
                    this.__ensureListeners(eventType);
                    this.eventListeners[eventType].push(handler);
                }
                __emit(eventType, data) {
                    this.__ensureListeners(eventType);
                    for (const handler of this.eventListeners[eventType]) {
                        handler(Object.assign({ preventDefault() { } }, data));
                    }
                }
                __ensureListeners(eventType) {
                    if (!this.eventListeners[eventType]) {
                        this.eventListeners[eventType] = [];
                    }
                }
            };
            exports_2("default", RemoteController);
        }
    };
});
System.register("main", ["utils/remoteController"], function (exports_3, context_3) {
    var remoteController_1, url, remoteControllerId, cursor, cursorCtx, controls, controlsCtx, canvas, ctx, width, mousePressed, PaletteCell, padding, colors, cells, size, leftColor, rightColor, lastX, lastY;
    var __moduleName = context_3 && context_3.id;
    function drawExtraLines(ctx) {
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
    function onPointerDown(e) {
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
    function onPointerUp(e) {
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
    function onPointerMove(e) {
        const x = e.offsetX;
        const y = e.offsetY;
        drawCursor(x, y);
        if (mousePressed) {
            drawLine(lastX, lastY, x, y);
            lastX = x;
            lastY = y;
        }
    }
    function onWheel(e) {
        size -= Math.sign(e.deltaY);
        if (size < 1)
            size = 1;
        else if (size > 50)
            size = 50;
        drawCursor(e.offsetX, e.offsetY);
        e.preventDefault();
    }
    function drawLine(x1, y1, x2, y2) {
        _drawLine(x1 % width, y1, x2 % width, y2, leftColor);
        _drawLine(x1 % width + width, y1, x2 % width + width, y2, rightColor);
    }
    function _drawLine(x1, y1, x2, y2, color) {
        ctx.strokeStyle = color;
        ctx.lineWidth = size;
        ctx.lineJoin = "round";
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.closePath();
        ctx.stroke();
    }
    function drawCursor(x1, y1) {
        cursorCtx.clearRect(0, 0, cursor.width, cursor.height);
        _drawCursor(x1 % width, y1, leftColor);
        _drawCursor(x1 % width + width, y1, rightColor);
        function _drawCursor(x, y, color) {
            cursorCtx.strokeStyle = color;
            cursorCtx.lineWidth = 2;
            cursorCtx.beginPath();
            cursorCtx.ellipse(x, y, size / 2, size / 2, 0, 0, 2 * Math.PI);
            cursorCtx.stroke();
            cursorCtx.closePath();
        }
    }
    return {
        setters: [
            function (remoteController_1_1) {
                remoteController_1 = remoteController_1_1;
            }
        ],
        execute: function () {
            url = new URL(window.location.href);
            remoteControllerId = url.searchParams.get("remote-controller");
            if (remoteControllerId) {
                console.log(`Remote controlling mode`);
                const connectOptions = {}; // { host: 'localhost', port: 9000 }
                const controller = new remoteController_1.default(remoteControllerId, connectOptions);
                controller.addEventListener(`open`, () => {
                    console.log(`Connected to the remote controller (${remoteControllerId})`);
                    controller.addEventListener(`pointermove`, onPointerMove);
                    controller.addEventListener(`pointerdown`, onPointerDown);
                    controller.addEventListener(`pointerup`, onPointerUp);
                    controller.addEventListener(`wheel`, onWheel);
                });
            }
            cursor = document.getElementById("cursor");
            cursor.width = cursor.clientWidth;
            cursor.height = cursor.clientHeight;
            cursorCtx = cursor.getContext("2d");
            controls = document.getElementById("controls");
            controls.width = controls.clientWidth;
            controls.height = controls.clientHeight;
            controlsCtx = controls.getContext("2d");
            canvas = document.getElementById("canvas");
            canvas.width = canvas.clientWidth;
            canvas.height = canvas.clientHeight;
            ctx = canvas.getContext("2d");
            width = canvas.width / 2;
            mousePressed = false;
            PaletteCell = class PaletteCell {
                constructor(x, y, c) {
                    this.color = c;
                    this.position = { x, y };
                }
                isHover(mx, my) {
                    let isHoverSide = (side) => {
                        let x = this.position.x + (!side ? 0 : width);
                        return (mx >= x && mx <= x + PaletteCell.size
                            && my >= this.position.y && my <= this.position.y + PaletteCell.height);
                    };
                    return isHoverSide(0) || isHoverSide(1);
                }
                draw(context) {
                    context.fillStyle = this.color;
                    context.strokeStyle = "black";
                    drawSide(this, 0);
                    drawSide(this, 1);
                    function drawSide(athis, side) {
                        let x = athis.position.x + (!side ? 0 : width);
                        context.fillRect(x, athis.position.y, PaletteCell.size, PaletteCell.height);
                    }
                }
            };
            PaletteCell.size = 1;
            PaletteCell.height = 5;
            padding = 10;
            colors = [];
            for (let lightness = 0; lightness <= 100; lightness += 10) {
                for (let hue = 0; hue < 360; hue += 1) {
                    colors.push(`hsl(${hue}, 100%, ${lightness}%)`);
                }
            }
            cells = colors.map((c, i) => new PaletteCell(padding + ((i % 360) * PaletteCell.size), padding + (Math.floor(i / 360) * PaletteCell.height), c));
            for (let c of cells) {
                controlsCtx.globalAlpha = 1;
                c.draw(controlsCtx);
            }
            drawExtraLines(controlsCtx);
            size = 10;
            leftColor = 'green';
            rightColor = leftColor;
            lastX = 0;
            lastY = 0;
            canvas.addEventListener("pointerdown", onPointerDown);
            canvas.addEventListener("pointermove", onPointerMove);
            canvas.addEventListener("pointerup", onPointerUp);
            canvas.addEventListener("wheel", onWheel);
        }
    };
});
System.register("utils/imageData", [], function (exports_4, context_4) {
    var almost256;
    var __moduleName = context_4 && context_4.id;
    function setPixelI(imageData, i, r, g, b, a = 1) {
        // tslint:disable-next-line:no-bitwise
        const offset = i << 2;
        imageData.data[offset + 0] = r;
        imageData.data[offset + 1] = g;
        imageData.data[offset + 2] = b;
        imageData.data[offset + 3] = a;
    }
    exports_4("setPixelI", setPixelI);
    function scaleNorm(v) {
        return Math.floor(v * almost256);
    }
    function setPixelNormI(imageData, i, r, g, b, a = 1) {
        setPixelI(imageData, i, scaleNorm(r), scaleNorm(g), scaleNorm(b), scaleNorm(a));
    }
    exports_4("setPixelNormI", setPixelNormI);
    function setPixelXY(imageData, x, y, r, g, b, a = 255) {
        setPixelI(imageData, y * imageData.width + x, r, g, b, a);
    }
    exports_4("setPixelXY", setPixelXY);
    function setPixelNormXY(imageData, x, y, r, g, b, a = 1) {
        setPixelNormI(imageData, y * imageData.width + x, r, g, b, a);
    }
    exports_4("setPixelNormXY", setPixelNormXY);
    return {
        setters: [],
        execute: function () {
            almost256 = 256 - Number.MIN_VALUE;
        }
    };
});
System.register("utils/misc", [], function (exports_5, context_5) {
    var __moduleName = context_5 && context_5.id;
    function isVisible(elt) {
        const style = window.getComputedStyle(elt);
        return (style.width !== null && +style.width !== 0)
            && (style.height !== null && +style.height !== 0)
            && (style.opacity !== null && +style.opacity !== 0)
            && style.display !== "none"
            && style.visibility !== "hidden";
    }
    exports_5("isVisible", isVisible);
    function adjust(x, ...applyAdjustmentList) {
        for (const applyAdjustment of applyAdjustmentList) {
            applyAdjustment(x);
        }
        return x;
    }
    exports_5("adjust", adjust);
    function getRandomElement(array) {
        return array[Math.floor(Math.random() * array.length)];
    }
    exports_5("getRandomElement", getRandomElement);
    return {
        setters: [],
        execute: function () {
        }
    };
});
//# sourceMappingURL=app.js.map