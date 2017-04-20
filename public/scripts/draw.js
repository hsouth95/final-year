var drawingFrame = {};

drawingFrame.containerId = "drawing-frame";
drawingFrame.canvasId = "drawing-canvas";
drawingFrame.saveButtonId = "drawing-save";
drawingFrame.clearButtonId = "drawing-clear";

drawingFrame.cache = {};

drawingFrame.cache.successCallback = null;

drawingFrame.setImage = function (imageUrl, success) {
    drawingFrame.cache.imageUrl = imageUrl;
    drawingFrame.cache.successCallback = success;

    var canvas = document.getElementById(drawingFrame.canvasId),
        ctx;

    if (canvas.getContext("2d")) {
        ctx = canvas.getContext("2d");

        var img = new Image();

        img.onload = function () {
            /// set size proportional to image
            canvas.height = canvas.width * (img.height / img.width);

            /// step 1 - resize to 50%
            var oc = document.createElement('canvas'),
                octx = oc.getContext('2d');

            oc.width = img.width * 0.5;
            oc.height = img.height * 0.5;
            octx.drawImage(img, 0, 0, oc.width, oc.height);

            /// step 2 - resize 50% of step 1
            octx.drawImage(oc, 0, 0, oc.width * 0.5, oc.height * 0.5);

            /// step 3, resize to final size
            ctx.drawImage(oc, 0, 0, oc.width * 0.5, oc.height * 0.5,
                0, 0, canvas.width, canvas.height);
        }

        img.src = imageUrl;
    }
}

drawingFrame.renderCanvas = function () {
    if (drawing) {
        ctx.moveTo(lastPos.x, lastPos.y);
        ctx.lineTo(mousePos.x, mousePos.y);
        ctx.stroke();
        lastPos = mousePos;
    }
}

drawingFrame.clearFrame = function () {
    drawingFrame.setImage(drawingFrame.cache.imageUrl);
}

var canvas = document.getElementById(drawingFrame.canvasId),
    ctx = canvas.getContext("2d"),
    drawing = false,
    mousePos = { x: 0, y: 0 },
    lastPos = mousePos;

ctx.strokeStyle = "#222222";
ctx.lineWidth = 2;

canvas.addEventListener("mousedown", function (e) {
    drawing = true;
    lastPos = getMousePos(canvas, e);
}, false);

canvas.addEventListener("mouseup", function (e) {
    drawing = false;
}, false);

canvas.addEventListener("mousemove", function (e) {
    mousePos = getMousePos(canvas, e);
});

canvas.addEventListener("touchstart", function (e) {
    mousePos = getTouchPos(canvas, e);
    var touch = e.touches[0],
        mouseEvent = new MouseEvent("mousedown", {
            clientX: touch.clientX,
            clientY: touch.clientY
        });

    canvas.dispatchEvent(mouseEvent);
}, false);

canvas.addEventListener("touchend", function (e) {
    var mouseEvent = new MouseEvent("mouseup", {});
    canvas.dispatchEvent(mouseEvent);
}, false);

canvas.addEventListener("touchmove", function (e) {
    var touch = e.touches[0],
        mouseEvent = new MouseEvent("mousemove", {
            clientX: touch.clientX,
            clientY: touch.clientY
        });

    canvas.dispatchEvent(mouseEvent);
}, false);

function getTouchPos(canvasDom, touchEvent) {
    var rect = canvasDom.getBoundingClientRect();
    return {
        x: touchEvent.touches[0].clientX - rect.left,
        y: touchEvent.touches[0].clientY - rect.top,
    };
}


function getMousePos(canvasDom, mouseEvent) {
    var rect = canvasDom.getBoundingClientRect();
    return {
        x: mouseEvent.clientX - rect.left,
        y: mouseEvent.clientY - rect.top
    };
}

window.requestAnimFrame = (function (callback) {
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimaitonFrame ||
        function (callback) {
            window.setTimeout(callback, 1000 / 60);
        };
})();


(function drawLoop() {
    requestAnimFrame(drawLoop);
    drawingFrame.renderCanvas();
})();

document.body.addEventListener("touchstart", function (e) {
    if (e.target == canvas) {
        e.preventDefault();
    }
}, false);

document.body.addEventListener("touchend", function (e) {
    if (e.target == canvas) {
        e.preventDefault();
    }
}, false);

document.body.addEventListener("touchmove", function (e) {
    if (e.target == canvas) {
        e.preventDefault();
    }
}, false);

document.getElementById("drawing-clear").addEventListener("click", function (e) {
    drawingFrame.clearFrame();
});

document.getElementById("drawing-save").addEventListener("click", function (e) {
    var dataURL = canvas.toDataURL("image/jpeg", 0.1);

    if (drawingFrame.cache.successCallback) {
        drawingFrame.cache.successCallback(dataURL);
        document.getElementById(drawingFrame.containerId).className += " hidden";
    }
});