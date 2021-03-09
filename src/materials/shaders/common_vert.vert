attribute vec2 uv;
attribute vec3 position;

varying vec2 vUv;
uniform mat4 projectionMatrix;

void main() {
    vUv = uv;
    gl_Position = projectionMatrix * vec4(position, 1.0);
}