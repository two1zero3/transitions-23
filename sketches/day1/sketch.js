let sliderGridX;
let sliderGridY;
let sliderOffsetX;
let sliderOffsetY;
let sliderWidth = 200;
let minOffset = 0;
let maxOffset = 4;
let defaultOffset = 3;
let offsetStep = 0.01;
let minGridSize = 0;
let maxGridSize = 8;

let canvas;
let pg;
let dc;
let gridSizeX = 5;
let gridSizeY = 5;
let gridX = 0;
let gridY = 0;
let offsetX = 0;
let offsetY = 0;
let circleSize = 0;
let myShader;
let startTransition = false;
let startPlayTransition = false;
let mouseMovedAmount = 0;


let mouseDistanceToCenter;

import { SpringNumber } from "../../shared/spring.js";
import { sendSequenceNextSignal } from "../../shared/sequenceRunner.js"


let springPlayX = new SpringNumber({
    position: 0, // start position
    frequency: 2, // oscillations per second (approximate)
    halfLife: 0.2, // time until amplitude is halved
});
let springPlayY = new SpringNumber({
    position: 0, // start position
    frequency: 2, // oscillations per second (approximate)
    halfLife: 0.2, // time until amplitude is halved
});
let springOffsetX = new SpringNumber({
    position: 0, // start position
    frequency: 0.2, // oscillations per second (approximate)
    halfLife: 1, // time until amplitude is halved
});
let springOffsetY = new SpringNumber({
    position: 0, // start position
    frequency: 0.2, // oscillations per second (approximate)
    halfLife: 1, // time until amplitude is halved
});

window.preload = function () {
    myShader = loadShader("assets/shader.vert", "assets/shader.frag");
};

window.setup = function () {
    canvas = createCanvas(windowWidth, windowHeight);
    pg = createGraphics(
        min(windowWidth, windowHeight),
        min(windowWidth, windowHeight),
        WEBGL
    );
    dc = createGraphics(
        min(windowWidth, windowHeight),
        min(windowWidth, windowHeight)
    );
    pixelDensity(2);
    pg.pixelDensity(1);
    dc.pixelDensity(1);
    createUI();

    mouseDistanceToCenter = createVector(0, 0);
};

window.windowResized = function () {
    //resize main canvas
    resizeCanvas(windowWidth, windowHeight);
    // //resize graphics -> find way to resize graphics without creating new one?
    // pg = createGraphics(windowWidth, windowHeight, WEBGL);
    // //recompute drawing canvas
    // dc = createGraphics(windowWidth, windowHeight);
};

window.draw = function () {
    background(255);

    // get the distance to the center of the screen compared to the mouse position
    mouseDistanceToCenter.set(mouseX - width / 2, mouseY - height / 2);

    // drawUI();

    //if mouse distance is less than 100 to center of screen, start transition
    // if (mouseDistanceToCenter.mag() < 100 && mouseIsPressed) {
    //     startTransition = true;
    // }
    if (mouseDistanceToCenter.mag() < 100 ) {
        startPlayTransition = true;
    }
    if ( abs(offsetX) > 2.8 && abs(offsetX) > 2.8) {
        console.log("stop transition");
        springOffsetX.target = 3;
        springOffsetY.target = 3;
        startTransition = false;
        startPlayTransition = false;
        offsetX = lerp(offsetX, 3, 0.1);
        offsetY = lerp(offsetY, 3, 0.1);

        if (abs(offsetX - 3) < 0.01 && abs(offsetY - 3) < 0.01) {
            sendSequenceNextSignal(); // finish sketch
            console.log("finish sketch");
		    noLoop();
        }
    }

    springOffsetX.target = float(sliderOffsetX.value().toString());
    springOffsetY.target = float(sliderOffsetY.value().toString());

    gridX = 5;
    gridY = 5;
        // gridY = int(map(mouseY, 0, height, 4, 10));
        // gridX = int(map(mouseX, 0, width, 4, 10));

    if (startTransition) {
        console.log("start transition");

        springOffsetX.position = offsetX;
        springOffsetY.position = offsetY; 

        //do the lerp first
        springOffsetX.step(deltaTime / 1000);
        offsetX = springOffsetX.position;

        // console.log(offsetY, springOffsetY.target-0.05);
        
        //then wait till the X value is near to do the Y
        if (offsetY > springOffsetY.target-0.05) {
            springOffsetY.target = 3;
            springOffsetY.step(deltaTime / 1000);
            offsetY = springOffsetY.position;
        } else {
            springOffsetY.target = map(mouseY, height, 0, 0, 3);
            springOffsetY.step(deltaTime / 1000);
            offsetY = springOffsetY.position;
        }
    } else if (startPlayTransition) {
        let x = mouseDistanceToCenter.x;
        let y = mouseDistanceToCenter.y;

        //map the mouse distance to the center to the spring target to offset the grid
        let maximumMvmt = map( pow( map(mouseMovedAmount, 0, 20000, 0, 1,true),3),0,1,0.2,3);
        springPlayX.target = map(x, -width / 2, width / 2, -maximumMvmt, maximumMvmt);
        springPlayY.target = map(y, -height / 2, height / 2, -maximumMvmt, maximumMvmt);

        springPlayX.step(deltaTime / 1000);
        springPlayY.step(deltaTime / 1000);

        offsetX = springPlayX.position;
        offsetY = springPlayY.position;
    }

    // if (abs(springOffsetX.velocity) < 0.001) {
    //     startTransition = false;
    // }

    drawCircle(dc);

    useSingleShader(pg, dc, [gridX, gridY], [offsetX, offsetY]);

    const sceneSize = min(width, height);
    const centerX = width / 2;
    const centerY = height / 2;
    const objSize = sceneSize / 2;
    const halfWidth = objSize / tan(60);
    const strokeW = 20;

    push();
    imageMode(CENTER);
    translate(centerX, centerY);
    image(pg, 0, 0, sceneSize / 1.5, sceneSize / 1.5);
    pop();

    // if (mouseIsPressed) drawDots(window);
};

function createUI() {
    sliderGridX = createSlider(minGridSize, maxGridSize, 5, 1);
    sliderGridY = createSlider(0, 8, 5, 1);
    sliderOffsetX = createSlider(
        minOffset,
        maxOffset,
        defaultOffset,
        offsetStep
    );
    sliderOffsetY = createSlider(
        minOffset,
        maxOffset,
        defaultOffset,
        offsetStep
    );

    sliderGridX.position(10, 10);
    sliderGridY.position(10, 30);
    sliderOffsetX.position(10, 50);
    sliderOffsetY.position(10, 70);

    sliderGridX.style("width", sliderWidth + "px");
    sliderGridY.style("width", sliderWidth + "px");
    sliderOffsetX.style("width", sliderWidth + "px");
    sliderOffsetY.style("width", sliderWidth + "px");

    //hide them all
    sliderGridX.hide();
    sliderGridY.hide();
    sliderOffsetX.hide();
    sliderOffsetY.hide();
}

function drawUI() {
    push();
    textSize(12);
    textAlign(LEFT, TOP);
    strokeWeight(2);
    stroke(255);
    // times 2 on the position and width to scale up for the shader canvas ? no idea why this works
    text(
        `Grid size X: ${sliderGridX.value()}`,
        sliderGridX.position().x * 1 + sliderWidth * 1,
        sliderGridX.position().y * 1
    );
    text(
        `Grid size Y: ${sliderGridY.value()}`,
        sliderGridY.position().x * 1 + sliderWidth * 1,
        sliderGridY.position().y * 1
    );
    text(
        `Offset X: ${sliderOffsetX.value()}`,
        sliderOffsetX.position().x * 1 + sliderWidth * 1,
        sliderOffsetX.position().y * 1
    );
    text(
        `Offset Y: ${sliderOffsetY.value()}`,
        sliderOffsetY.position().x * 1 + sliderWidth * 1,
        sliderOffsetY.position().y * 1
    );
    pop();
}

function drawCircle(ctx) {
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
    ctx.circle(centerX, centerY, objSize);
}
function useSingleShader(ctx, shaderCtx, nbOfSquares, offset) {
    ctx.push();
    ctx.clear();

    // Pass the buffer as a texture to the shader
    myShader.setUniform("u_tex0", shaderCtx);
    myShader.setUniform("u_resolution", [shaderCtx.width, shaderCtx.height]);
    myShader.setUniform("u_time", millis() / 1000.0);
    myShader.setUniform("nbOfSquares", [nbOfSquares[0], nbOfSquares[1]]);
    myShader.setUniform("offset", [offset[0], offset[1]]);

    // Apply the shader -> maybe use filter() instead?
    ctx.shader(myShader);
    ctx.noStroke();
    ctx.rect(-height / 2, -width / 2, width, height);
    ctx.pop();
}
function drawDots(ctx) {
    const sceneSize = min(width, height);
    const centerX = width / 2;
    const centerY = height / 2;
    const objSize = sceneSize / 2;
    const halfWidth = objSize / tan(60);
    const strokeW = 20 * (sceneSize / 1000);
    fill("red");
    noStroke();
    const gridCount = 5;
    const pointSize = strokeW;
    for (let x = 0; x < gridCount; x++) {
        for (let y = 0; y < gridCount; y++) {
            const xPos = map(
                x,
                0,
                gridCount - 1,
                centerX - objSize / 2,
                centerX + objSize / 2,
                x
            );
            const yPos = map(
                y,
                0,
                gridCount - 1,
                centerY - objSize / 2,
                centerY + objSize / 2,
                y
            );
            ctx.circle(xPos, yPos, pointSize);
        }
    }
}
//if I press the T key on the keyboard, consolelog the current values of the sliders
window.keyPressed = function () {
    if (key === "t" || key === "T") {
        startTransition = true;
    }
};

window.mouseMoved = function () {

    // console.log(mouseMovedAmount);
    if (startPlayTransition) {
        //get distance moved
        let distance = dist(pmouseX, pmouseY, mouseX, mouseY);
        mouseMovedAmount += distance;
    }
    
}
