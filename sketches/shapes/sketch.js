
let shapeId = 0

window.setup = function () {

    createCanvas(windowWidth, windowHeight);

    angleMode(DEGREES)
}

window.windowResized = function () {
    resizeCanvas(windowWidth, windowHeight);
}

window.mouseClicked = function () {
    shapeId++
    shapeId %= 4
}

window.draw = function () {


    background(255);


    const sceneSize = min(width, height)

    const centerX = width / 2
    const centerY = height / 2
    const objSize = sceneSize / 2
    const halfWidth = objSize / tan(60)
    const strokeW = 20

    switch (shapeId) {
        case 0:
            fill(0)
            noStroke()
            rectMode(CENTER)
            rect(centerX, centerY, objSize, objSize)
            break;

        case 1:
            fill(0)
            noStroke()
            circle(centerX, centerY, objSize)
            break;

        case 2:

            fill(0)
            noStroke()
            const gridCount = 5
            const pointSize = strokeW

            for (let x = 0; x < gridCount; x++) {
                for (let y = 0; y < gridCount; y++) {
                    const xPos = map(x, 0, gridCount - 1, centerX - objSize / 2, centerX + objSize / 2, x)
                    const yPos = map(y, 0, gridCount - 1, centerY - objSize / 2, centerY + objSize / 2, y)
                    circle(xPos, yPos, pointSize)
                }
            }
            break

        case 3:

            fill(0)
            noStroke()
            rectMode(CENTER)
            strokeWeight(strokeW)
            stroke(0)
            line(centerX - objSize / 2, centerY, centerX + objSize / 2, centerY)
            line(centerX, centerY - objSize / 2, centerX, centerY + objSize / 2)
            break;
    }

}