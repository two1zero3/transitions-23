#version 300 es

in vec2 aPosition;

void main() {
  gl_Position = vec4(2.0 * aPosition.xy - 1.0, 0.0, 1.0);
}