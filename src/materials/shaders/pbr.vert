precision highp float;
precision highp int;
attribute vec3 position;

#ifdef UV
    attribute vec2 uv;
#else
    const vec2 uv = vec2(0);
#endif
attribute vec3 normal;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat4 modelMatrix;
uniform mat3 normalMatrix;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vMPos;
varying vec4 vMVPos;

void main() {
    vec4 pos = vec4(position, 1);
    vec3 nml = normalMatrix * normal;
    vUv = uv;
    vNormal = normalize(nml);
    vec4 mPos = modelMatrix * pos;
    vMPos = mPos.xyz / mPos.w;
    vMVPos = modelViewMatrix * pos;
    gl_Position = projectionMatrix * vMVPos;
}
