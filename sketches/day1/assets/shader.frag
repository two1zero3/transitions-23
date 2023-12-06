#version 300 es

precision highp float;

out vec4 outColor;

uniform sampler2D u_tex0;
uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 nbOfSquares;
uniform vec2 offset;

// function that makes broken mirror effect, takes in st, time, and nbOfSquares as parameters
vec4 brokenMirror(vec2 st, vec2 offset, vec2 nbOfSquares) {
    
    // Calculate the grid position (0 to nbOfSquares) of the current fragment
    //will result in integer values stairsteping from 0 to 1 to 2 to 3 etc...
    vec2 gridPosition = floor(st * nbOfSquares);
    
    // Map the fragment coordinates to the range [0, 1] within the grid cell
    // will result in sawtooth that goes from 0 to 1 and repeats GRID_SIZE_X / Y times
    vec2 cellCoords = fract(st * nbOfSquares);

    // Repeat the image within each grid cell
    // for x : cellCoords.x * offset + st.x - offset/2.
    // for y : cellCoords.y * offset + st.y - offset/2.
    return texture(u_tex0, cellCoords*offset + st - offset/2.);


}

void main() {
    // converts pixel coordinates of canvas to 0.0 - 1.0 range
    vec2 st = gl_FragCoord.xy / u_resolution.xy;

    // invert shader
    st.x = 1.0 - st.x;
    st.y = 1.0 - st.y;

    //only take square part of 4:3 tex
    // st.x *= 0.75;
    // st.x += 0.125;
    
    vec4 color = brokenMirror(st, offset, nbOfSquares);

    // //correct for frame moving by offset amount in x and y
    // st.x -= offset;
    // st.y -= offset;
    

    //add scanlines
    // color *= 1.0 - (sin(st.y * 100.0) * 0.1);
    // color *= 1.0 - (sin(st.y * 100.0) * 0.1 + 0.1 * sin(st.x * 100.0));

    //for loop
    // for (int i = 0; i < 100; i++) {
    //     // use i to make scanlines
    //     color *= 1. - (sin(st.y * 10.0 + 10.0) * 0.1);

    //     // star pattern in center
    //     // make it look like a tv


    //     // add scanlines
    //     color *= 1.0 - (sin(st.y * 100.0) * 0.1);
    // }


    //dither colors
    // color.r = floor(color.r * 4.0) / 4.0;
    // color.g = floor(color.g * 4.0) / 4.0;
    // color.b = floor(color.b * 4.0) / 4.0;
    
    

    //karel martens style color palette and mess up colors
    // color.r = fract(color.r * 2.5);
    // color.g = fract(color.g * 1.5);
    // color.b = fract(color.b * 1.5);

    outColor = color;
}

