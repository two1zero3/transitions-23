import { sendSequenceNextSignal } from "../../shared/sequenceRunner";

function shortestAngleDist(a, b) {
    let diff = b - a;
    while (diff < -Math.PI)
        diff += 2 * Math.PI;
    while (diff > Math.PI)
        diff -= 2 * Math.PI;
    return diff;
}
function shortestSquaredAngleDist(a, b) {
    let diff1 = b - a;
    let diff2 = shortestAngleDist(a + (1 / 2) * Math.PI, b);
    let diff3 = shortestAngleDist(a + (2 / 2) * Math.PI, b);
    let diff4 = shortestAngleDist(a + (3 / 2) * Math.PI, b);
    // console.log(diff1, diff2, diff3, diff4);
    return differenceClosestToZero([diff1, diff2, diff3, diff4]);
}
function differenceClosestToZero(a) {
    return a.reduce((acc, curr) => Math.abs(acc) < Math.abs(curr) ? acc : curr);
}
class Square {
    constructor(x, y, angle, size) {
        this.miniSquares = [];
        this.state = 0;
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.speed = angle;
        this.size = size;
        this.delta = 0;
        this.snapToAngle = false;
        //generate the 4 mini squares
        for (let i = 0; i < 4; i++) {
            let x1 = this.x + (i % 2) * this.size / 2;
            let y1 = this.y + (i > 1 ? 1 : 0) * this.size / 2;
            x1 = x1 - this.size / 4;
            y1 = y1 - this.size / 4;
            this.miniSquares.push(new miniSquares(x1, y1, size / 2, i));
        }
    }
    update() {
        if (mouseIsPressed) {
            this.delta = shortestAngleDist(this.angle, targetRotation);
        }
        currentRotation = lerp(this.angle, this.angle + this.delta, 0.1);
        //slow it down gradually for spin effect
        this.delta *= 0.95;
        this.angle = currentRotation;
        //snap to angle if mouse is pressed -> remove lerp effect
        if (this.snapToAngle) {
            this.delta = 0;
            this.angle = targetRotation;
        }
        this.snapToAngle = false;
        //if the delta is over a certain threshold, set the state of the first mini square to 1 and notify the other mini squares
        if (abs(this.delta) > 2 && this.state == 0) {
            this.miniSquares[0].state = 1;
            this.state++;
        }
        // console.log(this.delta, this.state);
        if (this.state == 1 && abs(this.delta) < 0.1) {
            console.log("state 1");
            this.state++;
        }
        if (abs(this.delta) > 2 && this.miniSquares[0].state == 1 && this.state == 2) {
            console.log("state 3");
            this.miniSquares[1].state = 1;
            this.state++;
        }
        if (this.state == 3 && abs(this.delta) < 0.1) {
            this.state++;
        }
        if (abs(this.delta) > 2 && this.miniSquares[1].state == 1 && this.state == 4) {
            this.miniSquares[2].state = 1;
            this.state++;
        }
        if (this.state == 5 && abs(this.delta) < 0.1) {
            this.state++;
        }
        if (abs(this.delta) > 2 && this.miniSquares[2].state == 1 && this.state == 6) {
            this.miniSquares[3].state = 1;
            this.state++;
        }
        if (this.state == 7 && abs(this.delta) < 0.1) {
            this.state++;
        }
        if (this.state == 8) {
            noLoop();
            sendSequenceNextSignal();
        }
    }
    draw() {
        //draw the cross that has the same size as the square
        push();
        stroke(0);
        strokeWeight(20);
        translate(this.x, this.y);
        rotate(this.angle);
        line(-this.size / 2 + 20 / 2, 0, this.size / 2 - 20 / 2, 0);
        line(0, -this.size / 2 + 20 / 2, 0, this.size / 2 - 20 / 2);
        pop();
        //draw the 4 mini squares
        push();
        this.miniSquares.forEach((sqr) => {
            sqr.update(this.angle);
            sqr.draw();
        });
        pop();
    }
}
let canvas;
let mouseDelta = { x: 0, y: 0 };
let sqr;
let currentRotation = 0;
let mySound;
let targetRotation = 0;

window.preload = function () {
    mySound = loadSound("sound.wav");
}
window.setup = function () {

    canvas = createCanvas(windowWidth, windowHeight);
    sqr = new Square(width / 2, height / 2, 0, min(width, height) / 2);
    mySound.loop();
}

window.windowResized = function () {
    resizeCanvas(windowWidth, windowHeight);
}

window.draw = function () {
    background(255);
    mySound.rate(map(sqr.delta, 0, 2, 0.1, 5));
    targetRotation = getMouseRotation();
    //update the square and draw it
    sqr.update();
    sqr.draw();
}
function getMouseRotation() {
    //calculate angle between mouse and center of screen -> use vector math
    const mousePos = createVector(mouseX, mouseY);
    const center = createVector(width / 2, height / 2);
    return mousePos.sub(center).heading(); // -> radians
}
window.mousePressed = function () {
    sqr.snapToAngle = true;
    if (!mySound.isPlaying()) {
        mySound.play();
    }
}
window.mouseMoved = function (e) {
    mouseDelta.x = e.movementX;
    mouseDelta.y = e.movementY;
}
window.mouseDragged = function (e) {
    mouseDelta.x = e.movementX;
    mouseDelta.y = e.movementY;
}
window.mousePressed =  function () {
    //active sound permissions
    userStartAudio();
}
class miniSquares {
    constructor(x, y, size, index) {
        this.state = 0;
        this.mainSquareAngle = 0;
        this.x = x;
        this.y = y;
        this.index = index;
        this.size = size;
        this.corner = this.calcCornerFromIndex();
        this.currentRotation = 0;
        this.targetRotation = 0;
        this.currentScale = 1;
        this.targetScale = 1;
    }
    draw() {
        push();
        translate(width / 2, height / 2);
        rotate(this.mainSquareAngle);
        translate(-width / 2, -height / 2);
        rectMode(CENTER);
        fill(0);
        //center it and render the 4 squares next to each other
        translate(this.x, this.y);
        if (this.state == 1) {
            scale(this.currentScale);
            rotate(this.currentRotation);
        }
        // translate(-this.size/2,-this.size/2);
        rect(0, 0, this.size, this.size);
        pop();
    }
    update(angle) {
        if (this.state == 1) {
            this.targetRotation = 20;
            this.targetScale = 0;
        }
        this.currentScale = lerp(this.currentScale, this.targetScale, 0.1);
        this.currentRotation = lerp(this.currentRotation, this.targetRotation, 0.1);
        this.mainSquareAngle = angle;
    }
    calcCornerFromIndex() {
        let corner = createVector(0, 0);
        switch (this.index) {
            case 0:
                corner = createVector(0, 0);
                break;
            case 1:
                corner = createVector(width + this.size, 0);
                break;
            case 2:
                corner = createVector(width + this.size, height + this.size);
                break;
            case 3:
                corner = createVector(0, height + this.size);
                break;
        }
        return corner;
    }
}