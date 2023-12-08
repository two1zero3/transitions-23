
class Squares {
    constructor(index, x1, y1, size) {
        this.x1 = x1;
        this.y1 = y1;
        this.size = size;
        this.index = index;
        this.center = createVector(this.x1 + this.size / 2, this.y1 + this.size / 2);
        this.state = 0;
        this.currentScale = 0;
        this.targetScale = 0;
        this.currentRotation = 0;
        this.targetRotation = 0;
        this.currentLineLength = 0;
        this.targetLineLength = 0;
        this.currentVertexPositionX = this.size / 2;
        this.targetVertexPositionX = this.size / 2;
        //random rotation in 90 degree increment
        this.randomRotation = floor(random(4)) * 90;
        this.triggerSound = false;
    }
    draw() {
        pg.push();
        pg.fill(0);
        pg.noStroke();
        pg.translate(-width / 2, -height / 2); //WEBGL
        pg.translate(this.center.x, this.center.y);
        pg.rotate(radians(this.randomRotation));
        pg.scale(this.currentScale);
        pg.beginShape(TESS);
        pg.vertex(-this.size / 2, -this.size / 2);
        pg.vertex(this.size / 2, -this.size / 2);
        pg.vertex(this.size / 2, this.size / 2);
        pg.vertex(this.currentVertexPositionX, this.size / 2);
        pg.endShape(CLOSE);
        pg.pop();
        //----------------------------------------------
        pg.push();
        pg.translate(-width / 2, -height / 2); //WEBGL
        //draw vertical lines on each side of square
        pg.line(this.x1, this.y1, this.x1, this.y1 + this.currentLineLength);
        pg.line(this.x1 + this.size, this.y1, this.x1 + this.size, this.y1 + this.currentLineLength);
        //draw horizontal lines on each side of square
        pg.line(this.x1, this.y1, this.x1 + this.currentLineLength, this.y1);
        pg.line(this.x1, this.y1 + this.size, this.x1 + this.currentLineLength, this.y1 + this.size);
        pg.pop();
    }
    update() {
        if (this.state == 1) {
            this.targetLineLength = this.size;
            this.currentLineLength = lerp(this.currentLineLength, this.targetLineLength, 0.03);
        }
        //if mouse hovers over square, scale up
        if (this.state == 2) {
            this.targetScale = 1;
            this.currentScale = lerp(this.currentScale, this.targetScale, 0.1);
            if (!this.triggerSound) {
                mySound2.play();
                this.triggerSound = true;
            }
        }
        //if all triangles drawn, fill them in after
        if (this.state == 3) {
            this.targetVertexPositionX = -this.size / 2;
            this.currentVertexPositionX = lerp(this.currentVertexPositionX, this.targetVertexPositionX, 0.1);
        }
        if (abs(this.targetVertexPositionX - this.currentVertexPositionX) < 0.1 && this.state == 3) {
            this.state = 4;
        }
    }
    isInside(x, y) {
        const d = dist(x, y, this.center.x, this.center.y);
        return d < this.size / 2;
    }
}

let canvas;
let squares = [];
let pg;
let gridPoints = [];
let currentPointsScale = 1;
let targetPointsScale = 0;
let mySound1;
let mySound2;

window.preload = function () {
    mySound1 = loadSound('1.mp3');
    mySound2 = loadSound('2.wav');
}
window.setup = function () {

    canvas = createCanvas(windowWidth, windowHeight);
    pg = createGraphics(windowWidth, windowHeight, WEBGL);
    createSquares();
    //after delay of 2 seconds set all of the squares state to 1
    setTimeout(() => {
        mySound1.play();
        squares.forEach((square) => {
            square.state = 1;
        });
    }, 1000);
}

window.windowResized = function () {
    resizeCanvas(windowWidth, windowHeight);
}

window.mouseMoved = function () {
    squares.forEach((square) => {
        if (square.isInside(mouseX, mouseY) && abs(square.currentLineLength - square.targetLineLength) < 1 && square.state == 1) {
            square.state = 2;
        }
        else if (square.isInside(mouseX, mouseY) && square.state == 3) {
            square.state = 4;
        }
    });


}

function allSquaresTriangles() {
    let result = true;
    squares.forEach((square) => {
        if (square.state == 1 || square.state == 0 || square.currentScale < 0.999) {
            result = false;
        }
    });
    return result;
}

function allSquaresState4() {
    let result = true;
    squares.forEach((square) => {
        if (square.state == 1 || square.state == 0 || square.state == 2 || square.state == 3) {
            result = false;
        }
    });
    return result;
}

window.draw = function () {


    background(255);
    image(pg, 0, 0);
    pg.background(255);
    squares.forEach((square) => {
        if (allSquaresTriangles()) {
            square.state = 3;
        }
        square.update();
        square.draw();
    });
    if (allSquaresState4()) {
        currentPointsScale = lerp(currentPointsScale, targetPointsScale, 0.1);
    }
    //draw grid points
    gridPoints.forEach((point) => {
        push();
        noStroke();
        fill(0);
        translate(point.x, point.y);
        scale(currentPointsScale);
        circle(0, 0, 20);
        pop();
    });
    if (abs(currentPointsScale - targetPointsScale) < 0.001) {
        noLoop();
        console.log("done");
    }

}

function drawRect(ctx) {
    const sceneSize = min(ctx.width, ctx.height);
    const centerX = ctx.width / 2;
    const centerY = ctx.height / 2;
    const objSize = sceneSize / 2;
    const halfWidth = objSize / tan(60);
    const strokeW = 20;
    ctx.clear();
    ctx.fill(0);
    ctx.noStroke();
    ctx.rectMode(CENTER);
    ctx.strokeWeight(strokeW);
    ctx.stroke(0);
    ctx.rect(centerX, centerY, objSize, objSize);
}
function createSquares() {
    const sceneSize = min(width, height);
    const centerX = width / 2;
    const centerY = height / 2;
    const objSize = sceneSize / 2;
    const strokeW = 20;
    const gridCount = 5;
    const pointSize = strokeW;
    //calculate all grid points
    for (let x = 0; x < gridCount; x++) {
        for (let y = 0; y < gridCount; y++) {
            const xPos = map(x, 0, gridCount - 1, centerX - objSize / 2, centerX + objSize / 2, x);
            const yPos = map(y, 0, gridCount - 1, centerY - objSize / 2, centerY + objSize / 2, y);
            circle(xPos, yPos, pointSize);
            gridPoints.push(createVector(xPos, yPos));
        }
    }
    //create squares that are not on the right or bottom edge
    for (let i = 0; i < gridPoints.length - 5; i++) {
        if (i % gridCount != gridCount - 1) {
            squares.push(new Squares(i, gridPoints[i].x, gridPoints[i].y, objSize / 4));
        }
    }
    //assign neighbours to each square bla bla 
    squares.forEach((square) => {
        //
    });
}