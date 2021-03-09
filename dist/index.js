(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["ogl"] = factory();
	else
		root["ogl"] = factory();
})(self, function() {
return /******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/materials/shaders/pbr.frag":
/*!****************************************!*\
  !*** ./src/materials/shaders/pbr.frag ***!
  \****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ("precision highp float;\nprecision highp int;\nuniform mat4 viewMatrix;\nuniform mat3 normalMatrix;\nuniform vec3 cameraPosition;\nuniform vec4 uBaseColorFactor;\nuniform sampler2D tBaseColor;\nuniform sampler2D tRM;\nuniform float uRoughness;\nuniform float uMetallic;\nuniform sampler2D tNormal;\nuniform float uNormalScale;\nuniform sampler2D tEmissive;\nuniform vec3 uEmissive;\nuniform sampler2D tOcclusion;\nuniform sampler2D tLUT;\nuniform sampler2D tEnvDiffuse;\nuniform sampler2D tEnvSpecular;\nuniform float uEnvDiffuse;\nuniform float uEnvSpecular;\nuniform float uEnvMapIntensity;\nuniform float uAlpha;\nuniform float uAlphaCutoff;\nvarying vec2 vUv;\nvarying vec3 vNormal;\nvarying vec3 vMPos;\nvarying vec4 vMVPos;\n\nconst float PI = 3.14159265359;\nconst float RECIPROCAL_PI = 0.31830988618;\nconst float RECIPROCAL_PI2 = 0.15915494;\nconst float LN2 = 0.6931472;\nconst float ENV_LODS = 6.0;\nvec4 SRGBtoLinear(vec4 srgb) {\n  vec3 linOut = pow(srgb.xyz, vec3(2.2));\n  return vec4(linOut, srgb.w);;\n}\nvec4 RGBMToLinear(in vec4 value) {\n  float maxRange = 6.0;\n  return vec4(value.xyz * value.w * maxRange, 1.0);\n}\nvec3 linearToSRGB(vec3 color) {\n  return pow(color, vec3(1.0 / 2.2));\n}\nvec3 getNormal() {\n  #ifdef NORMAL_MAP  \n    vec3 pos_dx = dFdx(vMPos.xyz);\n    vec3 pos_dy = dFdy(vMPos.xyz);\n    vec2 tex_dx = dFdx(vUv);\n    vec2 tex_dy = dFdy(vUv);\n    // Tangent, Bitangent\n    vec3 t = normalize(pos_dx * tex_dy.t - pos_dy * tex_dx.t);\n    vec3 b = normalize(-pos_dx * tex_dy.s + pos_dy * tex_dx.s);\n    mat3 tbn = mat3(t, b, normalize(vNormal));\n    vec3 n = texture2D(tNormal, vUv).rgb * 2.0 - 1.0;\n    n.xy *= uNormalScale;\n    vec3 normal = normalize(tbn * n);\n    // Get world normal from view normal (normalMatrix * normal)\n    // return normalize((vec4(normal, 0.0) * viewMatrix).xyz);\n    return normalize(normal);\n  #else\n    return normalize(vNormal);\n  #endif\n}\n\nvec2 cartesianToPolar(vec3 n) {\n  vec2 uv;\n  uv.x = atan(n.z, n.x) * RECIPROCAL_PI2 + 0.5;\n  uv.y = asin(n.y) * RECIPROCAL_PI + 0.5;\n  return uv;\n}\n\nvoid getIBLContribution(inout vec3 diffuse, inout vec3 specular, float NdV, float roughness, vec3 n, vec3 reflection, vec3 diffuseColor, vec3 specularColor) {\n  vec3 brdf = SRGBtoLinear(texture2D(tLUT, vec2(NdV, roughness))).rgb;\n  vec3 diffuseLight = RGBMToLinear(texture2D(tEnvDiffuse, cartesianToPolar(n))).rgb;\n  diffuseLight = mix(vec3(1), diffuseLight, uEnvDiffuse);\n  // Sample 2 levels and mix between to get smoother degradation\n  float blend = roughness * ENV_LODS;\n  float level0 = floor(blend);\n  float level1 = min(ENV_LODS, level0 + 1.0);\n  blend -= level0;\n  \n  // Sample the specular env map atlas depending on the roughness value\n  vec2 uvSpec = cartesianToPolar(reflection);\n  uvSpec.y /= 2.0;\n  vec2 uv0 = uvSpec;\n  vec2 uv1 = uvSpec;\n  uv0 /= pow(2.0, level0);\n  uv0.y += 1.0 - exp(-LN2 * level0);\n  uv1 /= pow(2.0, level1);\n  uv1.y += 1.0 - exp(-LN2 * level1);\n  vec3 specular0 = RGBMToLinear(texture2D(tEnvSpecular, uv0)).rgb;\n  vec3 specular1 = RGBMToLinear(texture2D(tEnvSpecular, uv1)).rgb;\n  vec3 specularLight = mix(specular0, specular1, blend);\n  diffuse = diffuseLight * diffuseColor;\n  \n  // Bit of extra reflection for smooth materials\n  float reflectivity = pow((1.0 - roughness), 2.0) * 0.05;\n  specular = specularLight * (specularColor * brdf.x + brdf.y + reflectivity);\n  specular *= uEnvSpecular;\n}\n\nvoid main() {\n  vec4 baseColor = uBaseColorFactor;\n  #ifdef COLOR_MAP\n    baseColor *= SRGBtoLinear(texture2D(tBaseColor, vUv));\n  #endif\n  // Get base alpha\n  float alpha = baseColor.a;\n  #ifdef ALPHA_MASK\n    if (alpha < uAlphaCutoff) discard;\n  #endif\n  // RM map packed as gb = [nothing, roughness, metallic, nothing]\n  vec4 rmSample = vec4(1);\n  #ifdef RM_MAP\n    rmSample *= texture2D(tRM, vUv);\n  #endif\n  float roughness = clamp(rmSample.g * uRoughness, 0.04, 1.0);\n  float metallic = clamp(rmSample.b * uMetallic, 0.04, 1.0);\n  vec3 f0 = vec3(0.04);\n  vec3 diffuseColor = baseColor.rgb * (vec3(1.0) - f0) * (1.0 - metallic);\n  vec3 specularColor = mix(f0, baseColor.rgb, metallic);\n  vec3 specularEnvR0 = specularColor;\n  vec3 specularEnvR90 = vec3(clamp(max(max(specularColor.r, specularColor.g), specularColor.b) * 25.0, 0.0, 1.0));\n  vec3 N = getNormal();\n  vec3 V = normalize(cameraPosition - vMPos);\n  vec3 reflection = normalize(reflect(-V, N));\n  float NdV = clamp(abs(dot(N, V)), 0.001, 1.0);\n  // Shading based off IBL lighting\n  vec3 color = vec3(0.);\n  vec3 diffuseIBL;\n  vec3 specularIBL;\n  getIBLContribution(diffuseIBL, specularIBL, NdV, roughness, N, reflection, diffuseColor, specularColor);\n  // Add IBL on top of color\n  color += (diffuseIBL + specularIBL) * uEnvMapIntensity;\n  // Add IBL spec to alpha for reflections on transparent surfaces (glass)\n  alpha = max(alpha, max(max(specularIBL.r, specularIBL.g), specularIBL.b));\n  #ifdef OCC_MAP  \n    // TODO: figure out how to apply occlusion\n    // color *= SRGBtoLinear(texture2D(tOcclusion, vUv)).rgb;\n  #endif\n  color += uEmissive;\n  #ifdef EMISSIVE_MAP  \n    vec3 emissive = SRGBtoLinear(texture2D(tEmissive, vUv)).rgb;\n    color = emissive;\n  #endif\n  // Convert to sRGB to display\n  gl_FragColor.rgb = linearToSRGB(color);\n  \n  // Apply uAlpha uniform at the end to overwrite any specular additions on transparent surfaces\n  gl_FragColor.a = alpha * uAlpha;\n}");

/***/ }),

/***/ "./src/materials/shaders/pbr.vert":
/*!****************************************!*\
  !*** ./src/materials/shaders/pbr.vert ***!
  \****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ("precision highp float;\nprecision highp int;\nattribute vec3 position;\n\n#ifdef UV\n    attribute vec2 uv;\n#else\n    const vec2 uv = vec2(0);\n#endif\nattribute vec3 normal;\n\nuniform mat4 modelViewMatrix;\nuniform mat4 projectionMatrix;\nuniform mat4 modelMatrix;\nuniform mat3 normalMatrix;\n\nvarying vec2 vUv;\nvarying vec3 vNormal;\nvarying vec3 vMPos;\nvarying vec4 vMVPos;\n\nvoid main() {\n    vec4 pos = vec4(position, 1);\n    vec3 nml = normal;\n    vUv = uv;\n    vNormal = normalize(nml);\n    vec4 mPos = modelMatrix * pos;\n    vMPos = mPos.xyz / mPos.w;\n    vMVPos = modelViewMatrix * pos;\n    gl_Position = projectionMatrix * vMVPos;\n}");

/***/ }),

/***/ "./src/core/Camera.js":
/*!****************************!*\
  !*** ./src/core/Camera.js ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Camera": () => (/* binding */ Camera)
/* harmony export */ });
/* harmony import */ var _Transform_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Transform.js */ "./src/core/Transform.js");
/* harmony import */ var _math_Mat4_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../math/Mat4.js */ "./src/math/Mat4.js");
/* harmony import */ var _math_Vec3_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../math/Vec3.js */ "./src/math/Vec3.js");




const tempMat4 = new _math_Mat4_js__WEBPACK_IMPORTED_MODULE_0__.Mat4();
const tempVec3a = new _math_Vec3_js__WEBPACK_IMPORTED_MODULE_1__.Vec3();
const tempVec3b = new _math_Vec3_js__WEBPACK_IMPORTED_MODULE_1__.Vec3();

class Camera extends _Transform_js__WEBPACK_IMPORTED_MODULE_2__.Transform {
    constructor(gl, { near = 0.1, far = 100, fov = 45, aspect = 1, left, right, bottom, top, zoom = 1 } = {}) {
        super();

        Object.assign(this, { near, far, fov, aspect, left, right, bottom, top, zoom });

        this.projectionMatrix = new _math_Mat4_js__WEBPACK_IMPORTED_MODULE_0__.Mat4();
        this.viewMatrix = new _math_Mat4_js__WEBPACK_IMPORTED_MODULE_0__.Mat4();
        this.projectionViewMatrix = new _math_Mat4_js__WEBPACK_IMPORTED_MODULE_0__.Mat4();
        this.worldPosition = new _math_Vec3_js__WEBPACK_IMPORTED_MODULE_1__.Vec3();

        // Use orthographic if left/right set, else default to perspective camera
        this.type = left || right ? 'orthographic' : 'perspective';

        if (this.type === 'orthographic') this.orthographic();
        else this.perspective();
    }

    setViewOffset(x, y, width, height) {
        if(!this.view) {
            this.view = {
                offsetX: x,
                offsetY: y,
                width: width,
                height: height
            }
        }
        this.view.offsetX = x;
        this.view.offsetY = y;
        this.view.width = width;
        this.view.height = height;
        if(this.type === 'perspective') {
            this.perspective();
        }
    }

    clearViewOffset() {
        this.view = null;
        if(this.type === 'perspective') {
            this.perspective();
        }
    }

    perspective({ near = this.near, far = this.far, fov = this.fov, aspect = this.aspect } = {}) {
        Object.assign(this, { near, far, fov, aspect });
        let top = near * Math.tan( Math.PI/180 * 0.5 * fov ),
        height = 2 * top,
        width = aspect * height,
        left = - 0.5 * width;
        
        if(this.view) {
            left += this.view.offsetX * width / this.view.width;
			top -= this.view.offsetY * height / this.view.height;
        }
        let right = left + width;
        let bottom = top - height;

        this.projectionMatrix.fromPerspectiveFrustrum({ left, right, top, bottom, near, far });
        this.type = 'perspective';
        return this;
    }

    orthographic({
        near = this.near,
        far = this.far,
        left = this.left,
        right = this.right,
        bottom = this.bottom,
        top = this.top,
        zoom = this.zoom,
    } = {}) {
        Object.assign(this, { near, far, left, right, bottom, top, zoom });
        left /= zoom;
        right /= zoom;
        bottom /= zoom;
        top /= zoom;
        this.projectionMatrix.fromOrthogonal({ left, right, bottom, top, near, far });
        this.type = 'orthographic';
        return this;
    }

    updateMatrixWorld() {
        super.updateMatrixWorld();
        this.viewMatrix.inverse(this.worldMatrix);
        this.worldMatrix.getTranslation(this.worldPosition);

        // used for sorting
        this.projectionViewMatrix.multiply(this.projectionMatrix, this.viewMatrix);
        return this;
    }

    lookAt(target) {
        super.lookAt(target, true);
        return this;
    }

    // Project 3D coordinate to 2D point
    project(v) {
        v.applyMatrix4(this.viewMatrix);
        v.applyMatrix4(this.projectionMatrix);
        return this;
    }

    // Unproject 2D point to 3D coordinate
    unproject(v) {
        v.applyMatrix4(tempMat4.inverse(this.projectionMatrix));
        v.applyMatrix4(this.worldMatrix);
        return this;
    }

    updateFrustum() {
        if (!this.frustum) {
            this.frustum = [new _math_Vec3_js__WEBPACK_IMPORTED_MODULE_1__.Vec3(), new _math_Vec3_js__WEBPACK_IMPORTED_MODULE_1__.Vec3(), new _math_Vec3_js__WEBPACK_IMPORTED_MODULE_1__.Vec3(), new _math_Vec3_js__WEBPACK_IMPORTED_MODULE_1__.Vec3(), new _math_Vec3_js__WEBPACK_IMPORTED_MODULE_1__.Vec3(), new _math_Vec3_js__WEBPACK_IMPORTED_MODULE_1__.Vec3()];
        }

        const m = this.projectionViewMatrix;
        this.frustum[0].set(m[3] - m[0], m[7] - m[4], m[11] - m[8]).constant = m[15] - m[12]; // -x
        this.frustum[1].set(m[3] + m[0], m[7] + m[4], m[11] + m[8]).constant = m[15] + m[12]; // +x
        this.frustum[2].set(m[3] + m[1], m[7] + m[5], m[11] + m[9]).constant = m[15] + m[13]; // +y
        this.frustum[3].set(m[3] - m[1], m[7] - m[5], m[11] - m[9]).constant = m[15] - m[13]; // -y
        this.frustum[4].set(m[3] - m[2], m[7] - m[6], m[11] - m[10]).constant = m[15] - m[14]; // +z (far)
        this.frustum[5].set(m[3] + m[2], m[7] + m[6], m[11] + m[10]).constant = m[15] + m[14]; // -z (near)

        for (let i = 0; i < 6; i++) {
            const invLen = 1.0 / this.frustum[i].distance();
            this.frustum[i].multiply(invLen);
            this.frustum[i].constant *= invLen;
        }
    }

    frustumIntersectsMesh(node) {
        // If no position attribute, treat as frustumCulled false
        if (!node.geometry.attributes.position) return true;

        if (!node.geometry.bounds || node.geometry.bounds.radius === Infinity) node.geometry.computeBoundingSphere();

        if (!node.geometry.bounds) return true;

        const center = tempVec3a;
        center.copy(node.geometry.bounds.center);
        center.applyMatrix4(node.worldMatrix);

        const radius = node.geometry.bounds.radius * node.worldMatrix.getMaxScaleOnAxis();

        return this.frustumIntersectsSphere(center, radius);
    }

    frustumIntersectsSphere(center, radius) {
        const normal = tempVec3b;

        for (let i = 0; i < 6; i++) {
            const plane = this.frustum[i];
            const distance = normal.copy(plane).dot(center) + plane.constant;
            if (distance < -radius) return false;
        }
        return true;
    }
}


/***/ }),

/***/ "./src/core/Geometry.js":
/*!******************************!*\
  !*** ./src/core/Geometry.js ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Geometry": () => (/* binding */ Geometry)
/* harmony export */ });
/* harmony import */ var _math_Vec3_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../math/Vec3.js */ "./src/math/Vec3.js");
// attribute params
// {
//     data - typed array eg UInt16Array for indices, Float32Array
//     size - int default 1
//     instanced - default null. Pass divisor amount
//     type - gl enum default gl.UNSIGNED_SHORT for 'index', gl.FLOAT for others
//     normalized - boolean default false

//     buffer - gl buffer, if buffer exists, don't need to provide data
//     stride - default 0 - for when passing in buffer
//     offset - default 0 - for when passing in buffer
//     count - default null - for when passing in buffer
//     min - array - for when passing in buffer
//     max - array - for when passing in buffer
// }

// TODO: fit in transform feedback
// TODO: when would I disableVertexAttribArray ?
// TODO: use offset/stride if exists



const tempVec3 = new _math_Vec3_js__WEBPACK_IMPORTED_MODULE_0__.Vec3();

let ID = 1;
let ATTR_ID = 1;

// To stop inifinite warnings
let isBoundsWarned = false;

class Geometry {
    constructor(gl, attributes = {}) {
        if (!gl.canvas) console.error('gl not passed as first argument to Geometry');
        this.gl = gl;
        this.attributes = attributes;
        this.id = ID++;

        // Store one VAO per program attribute locations order
        this.VAOs = {};

        this.drawRange = { start: 0, count: 0 };
        this.instancedCount = 0;

        // Unbind current VAO so that new buffers don't get added to active mesh
        this.gl.renderer.bindVertexArray(null);
        this.gl.renderer.currentGeometry = null;

        // Alias for state store to avoid redundant calls for global state
        this.glState = this.gl.renderer.state;

        // create the buffers
        for (let key in attributes) {
            this.addAttribute(key, attributes[key]);
        }
    }

    addAttribute(key, attr) {
        this.attributes[key] = attr;

        // Set options
        attr.id = ATTR_ID++; // TODO: currently unused, remove?
        attr.size = attr.size || 1;
        attr.type =
            attr.type ||
            (attr.data.constructor === Float32Array
                ? this.gl.FLOAT
                : attr.data.constructor === Uint16Array
                ? this.gl.UNSIGNED_SHORT
                : this.gl.UNSIGNED_INT); // Uint32Array
        attr.target = key === 'index' ? this.gl.ELEMENT_ARRAY_BUFFER : this.gl.ARRAY_BUFFER;
        attr.normalized = attr.normalized || false;
        attr.stride = attr.stride || 0;
        attr.offset = attr.offset || 0;
        attr.count = attr.count || (attr.stride ? attr.data.byteLength / attr.stride : attr.data.length / attr.size);
        attr.divisor = attr.instanced || 0;
        attr.needsUpdate = false;

        if (!attr.buffer) {
            attr.buffer = this.gl.createBuffer();

            // Push data to buffer
            this.updateAttribute(attr);
        }

        // Update geometry counts. If indexed, ignore regular attributes
        if (attr.divisor) {
            this.isInstanced = true;
            if (this.instancedCount && this.instancedCount !== attr.count * attr.divisor) {
                console.warn('geometry has multiple instanced buffers of different length');
                return (this.instancedCount = Math.min(this.instancedCount, attr.count * attr.divisor));
            }
            this.instancedCount = attr.count * attr.divisor;
        } else if (key === 'index') {
            this.drawRange.count = attr.count;
        } else if (!this.attributes.index) {
            this.drawRange.count = Math.max(this.drawRange.count, attr.count);
        }
    }

    updateAttribute(attr) {
        if (this.glState.boundBuffer !== attr.buffer) {
            this.gl.bindBuffer(attr.target, attr.buffer);
            this.glState.boundBuffer = attr.buffer;
        }
        this.gl.bufferData(attr.target, attr.data, this.gl.STATIC_DRAW);
        attr.needsUpdate = false;
    }

    setIndex(value) {
        this.addAttribute('index', value);
    }

    setDrawRange(start, count) {
        this.drawRange.start = start;
        this.drawRange.count = count;
    }

    setInstancedCount(value) {
        this.instancedCount = value;
    }

    createVAO(program) {
        this.VAOs[program.attributeOrder] = this.gl.renderer.createVertexArray();
        this.gl.renderer.bindVertexArray(this.VAOs[program.attributeOrder]);
        this.bindAttributes(program);
    }

    bindAttributes(program) {
        // Link all attributes to program using gl.vertexAttribPointer
        program.attributeLocations.forEach((location, { name, type }) => {
            // If geometry missing a required shader attribute
            if (!this.attributes[name]) {
                console.warn(`active attribute ${name} not being supplied`);
                return;
            }

            const attr = this.attributes[name];

            this.gl.bindBuffer(attr.target, attr.buffer);
            this.glState.boundBuffer = attr.buffer;

            // For matrix attributes, buffer needs to be defined per column
            let numLoc = 1;
            if (type === 35674) numLoc = 2; // mat2
            if (type === 35675) numLoc = 3; // mat3
            if (type === 35676) numLoc = 4; // mat4

            const size = attr.size / numLoc;
            const stride = numLoc === 1 ? 0 : numLoc * numLoc * numLoc;
            const offset = numLoc === 1 ? 0 : numLoc * numLoc;

            for (let i = 0; i < numLoc; i++) {
                this.gl.vertexAttribPointer(location + i, size, attr.type, attr.normalized, attr.stride + stride, attr.offset + i * offset);
                this.gl.enableVertexAttribArray(location + i);

                // For instanced attributes, divisor needs to be set.
                // For firefox, need to set back to 0 if non-instanced drawn after instanced. Else won't render
                this.gl.renderer.vertexAttribDivisor(location + i, attr.divisor);
            }
        });

        // Bind indices if geometry indexed
        if (this.attributes.index) this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.attributes.index.buffer);
    }

    draw({ program, mode = this.gl.TRIANGLES }) {
        if (this.gl.renderer.currentGeometry !== `${this.id}_${program.attributeOrder}`) {
            if (!this.VAOs[program.attributeOrder]) this.createVAO(program);
            this.gl.renderer.bindVertexArray(this.VAOs[program.attributeOrder]);
            this.gl.renderer.currentGeometry = `${this.id}_${program.attributeOrder}`;
        }

        // Check if any attributes need updating
        program.attributeLocations.forEach((location, { name }) => {
            const attr = this.attributes[name];
            if (attr.needsUpdate) this.updateAttribute(attr);
        });

        if (this.isInstanced) {
            if (this.attributes.index) {
                this.gl.renderer.drawElementsInstanced(
                    mode,
                    this.drawRange.count,
                    this.attributes.index.type,
                    this.attributes.index.offset + this.drawRange.start * 2,
                    this.instancedCount
                );
            } else {
                this.gl.renderer.drawArraysInstanced(mode, this.drawRange.start, this.drawRange.count, this.instancedCount);
            }
        } else {
            if (this.attributes.index) {
                this.gl.drawElements(mode, this.drawRange.count, this.attributes.index.type, this.attributes.index.offset + this.drawRange.start * 2);
            } else {
                this.gl.drawArrays(mode, this.drawRange.start, this.drawRange.count);
            }
        }
    }

    getPositionArray() {
        // Use position buffer, or min/max if available
        const attr = this.attributes.position;
        // if (attr.min) return [...attr.min, ...attr.max];
        if (attr.data) return attr.data;
        if (isBoundsWarned) return;
        console.warn('No position buffer data found to compute bounds');
        return (isBoundsWarned = true);
    }

    computeBoundingBox(array) {
        if (!array) array = this.getPositionArray();

        if (!this.bounds) {
            this.bounds = {
                min: new _math_Vec3_js__WEBPACK_IMPORTED_MODULE_0__.Vec3(),
                max: new _math_Vec3_js__WEBPACK_IMPORTED_MODULE_0__.Vec3(),
                center: new _math_Vec3_js__WEBPACK_IMPORTED_MODULE_0__.Vec3(),
                scale: new _math_Vec3_js__WEBPACK_IMPORTED_MODULE_0__.Vec3(),
                radius: Infinity,
            };
        }

        const min = this.bounds.min;
        const max = this.bounds.max;
        const center = this.bounds.center;
        const scale = this.bounds.scale;

        min.set(+Infinity);
        max.set(-Infinity);

        // TODO: use offset/stride if exists
        // TODO: check size of position (eg triangle with Vec2)
        for (let i = 0, l = array.length; i < l; i += 3) {
            const x = array[i];
            const y = array[i + 1];
            const z = array[i + 2];

            min.x = Math.min(x, min.x);
            min.y = Math.min(y, min.y);
            min.z = Math.min(z, min.z);

            max.x = Math.max(x, max.x);
            max.y = Math.max(y, max.y);
            max.z = Math.max(z, max.z);
        }

        scale.sub(max, min);
        center.add(min, max).divide(2);
    }

    computeBoundingSphere(array) {
        if (!array) array = this.getPositionArray();
        if (!this.bounds) this.computeBoundingBox(array);

        let maxRadiusSq = 0;
        for (let i = 0, l = array.length; i < l; i += 3) {
            tempVec3.fromArray(array, i);
            maxRadiusSq = Math.max(maxRadiusSq, this.bounds.center.squaredDistance(tempVec3));
        }

        this.bounds.radius = Math.sqrt(maxRadiusSq);
    }

    remove() {
        if (this.vao) this.gl.renderer.deleteVertexArray(this.vao);
        for (let key in this.attributes) {
            this.gl.deleteBuffer(this.attributes[key].buffer);
            delete this.attributes[key];
        }
    }
}


/***/ }),

/***/ "./src/core/Mesh.js":
/*!**************************!*\
  !*** ./src/core/Mesh.js ***!
  \**************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Mesh": () => (/* binding */ Mesh)
/* harmony export */ });
/* harmony import */ var _Transform_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Transform.js */ "./src/core/Transform.js");
/* harmony import */ var _math_Mat3_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../math/Mat3.js */ "./src/math/Mat3.js");
/* harmony import */ var _math_Mat4_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../math/Mat4.js */ "./src/math/Mat4.js");




let ID = 0;

class Mesh extends _Transform_js__WEBPACK_IMPORTED_MODULE_0__.Transform {
    constructor(gl, { geometry, program, mode = gl.TRIANGLES, frustumCulled = true, renderOrder = 0 } = {}) {
        super();
        if (!gl.canvas) console.error('gl not passed as first argument to Mesh');
        this.gl = gl;
        this.id = ID++;
        this.geometry = geometry;
        this.program = program;
        this.mode = mode;

        // Used to skip frustum culling
        this.frustumCulled = frustumCulled;

        // Override sorting to force an order
        this.renderOrder = renderOrder;
        this.modelViewMatrix = new _math_Mat4_js__WEBPACK_IMPORTED_MODULE_1__.Mat4();
        this.normalMatrix = new _math_Mat3_js__WEBPACK_IMPORTED_MODULE_2__.Mat3();
        this.beforeRenderCallbacks = [];
        this.afterRenderCallbacks = [];
    }

    onBeforeRender(f) {
        this.beforeRenderCallbacks.push(f);
        return this;
    }

    onAfterRender(f) {
        this.afterRenderCallbacks.push(f);
        return this;
    }

    draw({ camera, overrideProgram } = {}) {
        this.beforeRenderCallbacks.forEach((f) => f && f({ mesh: this, camera }));
        const usedProgram = overrideProgram || this.program;
        if (camera) {
            // Add empty matrix uniforms to program if unset
            if (!usedProgram.uniforms.modelMatrix) {
                Object.assign(usedProgram.uniforms, {
                    modelMatrix: { value: null },
                    viewMatrix: { value: null },
                    modelViewMatrix: { value: null },
                    normalMatrix: { value: null },
                    projectionMatrix: { value: null },
                    cameraPosition: { value: null },
                });
            }

            // Set the matrix uniforms
            usedProgram.uniforms.projectionMatrix.value = camera.projectionMatrix;
            usedProgram.uniforms.cameraPosition.value = camera.worldPosition;
            usedProgram.uniforms.viewMatrix.value = camera.viewMatrix;
            this.modelViewMatrix.multiply(camera.viewMatrix, this.worldMatrix);
            this.normalMatrix.getNormalMatrix(this.modelViewMatrix);
            usedProgram.uniforms.modelMatrix.value = this.worldMatrix;
            usedProgram.uniforms.modelViewMatrix.value = this.modelViewMatrix;
            usedProgram.uniforms.normalMatrix.value = this.normalMatrix;
        }

        // determine if faces need to be flipped - when mesh scaled negatively
        let flipFaces = usedProgram.cullFace && this.worldMatrix.determinant() < 0;
        usedProgram.use({ flipFaces });
        this.geometry.draw({ mode: this.mode, program: usedProgram });
        this.afterRenderCallbacks.forEach((f) => f && f({ mesh: this, camera }));
    }
}


/***/ }),

/***/ "./src/core/Program.js":
/*!*****************************!*\
  !*** ./src/core/Program.js ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Program": () => (/* binding */ Program)
/* harmony export */ });
// TODO: upload empty texture if null ? maybe not
// TODO: upload identity matrix if null ?
// TODO: sampler Cube

let ID = 1;

// cache of typed arrays used to flatten uniform arrays
const arrayCacheF32 = {};

class Program {
    constructor(
        gl,
        {
            vertex,
            fragment,
            uniforms = {},

            transparent = false,
            cullFace = gl.BACK,
            frontFace = gl.CCW,
            depthTest = true,
            depthWrite = true,
            depthFunc = gl.LESS,
        } = {}
    ) {
        if (!gl.canvas) console.error('gl not passed as fist argument to Program');
        this.gl = gl;
        this.uniforms = uniforms;
        this.id = ID++;

        if (!vertex) console.warn('vertex shader not supplied');
        if (!fragment) console.warn('fragment shader not supplied');

        // Store program state
        this.transparent = transparent;
        this.cullFace = cullFace;
        this.frontFace = frontFace;
        this.depthTest = depthTest;
        this.depthWrite = depthWrite;
        this.depthFunc = depthFunc;
        this.blendFunc = {};
        this.blendEquation = {};
        this.uniformLocations = new Map();

        // set default blendFunc if transparent flagged
        if (this.transparent && !this.blendFunc.src) {
            if (this.gl.renderer.premultipliedAlpha) this.setBlendFunc(this.gl.ONE, this.gl.ONE_MINUS_SRC_ALPHA);
            else this.setBlendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
        }

        // compile vertex shader and log errors
        const vertexShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vertexShader, vertex);
        gl.compileShader(vertexShader);
        if (gl.getShaderInfoLog(vertexShader) !== '') {
            console.warn(`${gl.getShaderInfoLog(vertexShader)}\nVertex Shader\n${addLineNumbers(vertex)}`);
        }

        // compile fragment shader and log errors
        const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragmentShader, fragment);
        gl.compileShader(fragmentShader);
        if (gl.getShaderInfoLog(fragmentShader) !== '') {
            console.warn(`${gl.getShaderInfoLog(fragmentShader)}\nFragment Shader\n${addLineNumbers(fragment)}`);
        }

        // compile program and log errors
        this.program = gl.createProgram();
        gl.attachShader(this.program, vertexShader);
        gl.attachShader(this.program, fragmentShader);
        gl.linkProgram(this.program);
        if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
            return console.warn(gl.getProgramInfoLog(this.program));
        }

        // Remove shader once linked
        gl.deleteShader(vertexShader);
        gl.deleteShader(fragmentShader);

        // Get active uniform locations
        let numUniforms = gl.getProgramParameter(this.program, gl.ACTIVE_UNIFORMS);
        for (let uIndex = 0; uIndex < numUniforms; uIndex++) {
            let uniform = gl.getActiveUniform(this.program, uIndex);
            this.uniformLocations.set(uniform, gl.getUniformLocation(this.program, uniform.name));

            // split uniforms' names to separate array and struct declarations
            const split = uniform.name.match(/(\w+)/g);

            uniform.uniformName = split[0];

            if (split.length === 3) {
                uniform.isStructArray = true;
                uniform.structIndex = Number(split[1]);
                uniform.structProperty = split[2];
            } else if (split.length === 2 && isNaN(Number(split[1]))) {
                uniform.isStruct = true;
                uniform.structProperty = split[1];
            }
        }

        // Get active attribute locations
        this.attributeLocations = new Map();
        const locations = [];
        const numAttribs = gl.getProgramParameter(this.program, gl.ACTIVE_ATTRIBUTES);
        for (let aIndex = 0; aIndex < numAttribs; aIndex++) {
            const attribute = gl.getActiveAttrib(this.program, aIndex);
            const location = gl.getAttribLocation(this.program, attribute.name);
            locations[location] = attribute.name;
            this.attributeLocations.set(attribute, location);
        }
        this.attributeOrder = locations.join('');
    }

    setBlendFunc(src, dst, srcAlpha, dstAlpha) {
        this.blendFunc.src = src;
        this.blendFunc.dst = dst;
        this.blendFunc.srcAlpha = srcAlpha;
        this.blendFunc.dstAlpha = dstAlpha;
        if (src) this.transparent = true;
    }

    setBlendEquation(modeRGB, modeAlpha) {
        this.blendEquation.modeRGB = modeRGB;
        this.blendEquation.modeAlpha = modeAlpha;
    }

    applyState() {
        if (this.depthTest) this.gl.renderer.enable(this.gl.DEPTH_TEST);
        else this.gl.renderer.disable(this.gl.DEPTH_TEST);

        if (this.cullFace) this.gl.renderer.enable(this.gl.CULL_FACE);
        else this.gl.renderer.disable(this.gl.CULL_FACE);

        if (this.blendFunc.src) this.gl.renderer.enable(this.gl.BLEND);
        else this.gl.renderer.disable(this.gl.BLEND);

        if (this.cullFace) this.gl.renderer.setCullFace(this.cullFace);
        this.gl.renderer.setFrontFace(this.frontFace);
        this.gl.renderer.setDepthMask(this.depthWrite);
        this.gl.renderer.setDepthFunc(this.depthFunc);
        if (this.blendFunc.src)
            this.gl.renderer.setBlendFunc(this.blendFunc.src, this.blendFunc.dst, this.blendFunc.srcAlpha, this.blendFunc.dstAlpha);
        this.gl.renderer.setBlendEquation(this.blendEquation.modeRGB, this.blendEquation.modeAlpha);
    }

    use({ flipFaces = false } = {}) {
        let textureUnit = -1;
        const programActive = this.gl.renderer.currentProgram === this.id;

        // Avoid gl call if program already in use
        if (!programActive) {
            this.gl.useProgram(this.program);
            this.gl.renderer.currentProgram = this.id;
        }

        // Set only the active uniforms found in the shader
        this.uniformLocations.forEach((location, activeUniform) => {
            let name = activeUniform.uniformName;

            // get supplied uniform
            let uniform = this.uniforms[name];

            // For structs, get the specific property instead of the entire object
            if (activeUniform.isStruct) {
                uniform = uniform[activeUniform.structProperty];
                name += `.${activeUniform.structProperty}`;
            }
            if (activeUniform.isStructArray) {
                uniform = uniform[activeUniform.structIndex][activeUniform.structProperty];
                name += `[${activeUniform.structIndex}].${activeUniform.structProperty}`;
            }

            if (!uniform) {
                return warn(`Active uniform ${name} has not been supplied`);
            }

            if (uniform && uniform.value === undefined) {
                return warn(`${name} uniform is missing a value parameter`);
            }

            if (uniform.value.texture) {
                textureUnit = textureUnit + 1;

                // Check if texture needs to be updated
                uniform.value.update(textureUnit);
                return setUniform(this.gl, activeUniform.type, location, textureUnit);
            }

            // For texture arrays, set uniform as an array of texture units instead of just one
            if (uniform.value.length && uniform.value[0].texture) {
                const textureUnits = [];
                uniform.value.forEach((value) => {
                    textureUnit = textureUnit + 1;
                    value.update(textureUnit);
                    textureUnits.push(textureUnit);
                });

                return setUniform(this.gl, activeUniform.type, location, textureUnits);
            }

            setUniform(this.gl, activeUniform.type, location, uniform.value);
        });

        this.applyState();
        if (flipFaces) this.gl.renderer.setFrontFace(this.frontFace === this.gl.CCW ? this.gl.CW : this.gl.CCW);
    }

    remove() {
        this.gl.deleteProgram(this.program);
    }
}

function setUniform(gl, type, location, value) {
    value = value.length ? flatten(value) : value;
    const setValue = gl.renderer.state.uniformLocations.get(location);

    // Avoid redundant uniform commands
    if (value.length) {
        if (setValue === undefined || setValue.length !== value.length) {
            // clone array to store as cache
            gl.renderer.state.uniformLocations.set(location, value.slice(0));
        } else {
            if (arraysEqual(setValue, value)) return;

            // Update cached array values
            setValue.set ? setValue.set(value) : setArray(setValue, value);
            gl.renderer.state.uniformLocations.set(location, setValue);
        }
    } else {
        if (setValue === value) return;
        gl.renderer.state.uniformLocations.set(location, value);
    }

    switch (type) {
        case 5126:
            return value.length ? gl.uniform1fv(location, value) : gl.uniform1f(location, value); // FLOAT
        case 35664:
            return gl.uniform2fv(location, value); // FLOAT_VEC2
        case 35665:
            return gl.uniform3fv(location, value); // FLOAT_VEC3
        case 35666:
            return gl.uniform4fv(location, value); // FLOAT_VEC4
        case 35670: // BOOL
        case 5124: // INT
        case 35678: // SAMPLER_2D
        case 35680:
            return value.length ? gl.uniform1iv(location, value) : gl.uniform1i(location, value); // SAMPLER_CUBE
        case 35671: // BOOL_VEC2
        case 35667:
            return gl.uniform2iv(location, value); // INT_VEC2
        case 35672: // BOOL_VEC3
        case 35668:
            return gl.uniform3iv(location, value); // INT_VEC3
        case 35673: // BOOL_VEC4
        case 35669:
            return gl.uniform4iv(location, value); // INT_VEC4
        case 35674:
            return gl.uniformMatrix2fv(location, false, value); // FLOAT_MAT2
        case 35675:
            return gl.uniformMatrix3fv(location, false, value); // FLOAT_MAT3
        case 35676:
            return gl.uniformMatrix4fv(location, false, value); // FLOAT_MAT4
    }
}

function addLineNumbers(string) {
    let lines = string.split('\n');
    for (let i = 0; i < lines.length; i++) {
        lines[i] = i + 1 + ': ' + lines[i];
    }
    return lines.join('\n');
}

function flatten(a) {
    const arrayLen = a.length;
    const valueLen = a[0].length;
    if (valueLen === undefined) return a;
    const length = arrayLen * valueLen;
    let value = arrayCacheF32[length];
    if (!value) arrayCacheF32[length] = value = new Float32Array(length);
    for (let i = 0; i < arrayLen; i++) value.set(a[i], i * valueLen);
    return value;
}

function arraysEqual(a, b) {
    if (a.length !== b.length) return false;
    for (let i = 0, l = a.length; i < l; i++) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}

function setArray(a, b) {
    for (let i = 0, l = a.length; i < l; i++) {
        a[i] = b[i];
    }
}

let warnCount = 0;
function warn(message) {
    if (warnCount > 100) return;
    console.warn(message);
    warnCount++;
    if (warnCount > 100) console.warn('More than 100 program warnings - stopping logs.');
}


/***/ }),

/***/ "./src/core/RenderTarget.js":
/*!**********************************!*\
  !*** ./src/core/RenderTarget.js ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "RenderTarget": () => (/* binding */ RenderTarget)
/* harmony export */ });
/* harmony import */ var _Texture_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Texture.js */ "./src/core/Texture.js");
// TODO: multi target rendering
// TODO: test stencil and depth
// TODO: destroy
// TODO: blit on resize?


class RenderTarget {
    constructor(
        gl,
        {
            width = gl.canvas.width,
            height = gl.canvas.height,
            target = gl.FRAMEBUFFER,
            color = 1, // number of color attachments
            depth = true,
            stencil = false,
            depthTexture = false, // note - stencil breaks
            wrapS = gl.CLAMP_TO_EDGE,
            wrapT = gl.CLAMP_TO_EDGE,
            minFilter = gl.LINEAR,
            magFilter = minFilter,
            type = gl.UNSIGNED_BYTE,
            format = gl.RGBA,
            internalFormat = format,
            unpackAlignment,
            premultiplyAlpha,
        } = {}
    ) {
        this.gl = gl;
        this.width = width;
        this.height = height;
        this.depth = depth;
        this.buffer = this.gl.createFramebuffer();
        this.target = target;
        this.gl.bindFramebuffer(this.target, this.buffer);

        this.textures = [];
        const drawBuffers = [];

        // create and attach required num of color textures
        for (let i = 0; i < color; i++) {
            this.textures.push(
                new _Texture_js__WEBPACK_IMPORTED_MODULE_0__.Texture(gl, {
                    width,
                    height,
                    wrapS,
                    wrapT,
                    minFilter,
                    magFilter,
                    type,
                    format,
                    internalFormat,
                    unpackAlignment,
                    premultiplyAlpha,
                    flipY: false,
                    generateMipmaps: false,
                })
            );
            this.textures[i].update();
            this.gl.framebufferTexture2D(this.target, this.gl.COLOR_ATTACHMENT0 + i, this.gl.TEXTURE_2D, this.textures[i].texture, 0 /* level */);
            drawBuffers.push(this.gl.COLOR_ATTACHMENT0 + i);
        }

        // For multi-render targets shader access
        if (drawBuffers.length > 1) this.gl.renderer.drawBuffers(drawBuffers);

        // alias for majority of use cases
        this.texture = this.textures[0];

        // note depth textures break stencil - so can't use together
        if (depthTexture && (this.gl.renderer.isWebgl2 || this.gl.renderer.getExtension('WEBGL_depth_texture'))) {
            this.depthTexture = new _Texture_js__WEBPACK_IMPORTED_MODULE_0__.Texture(gl, {
                width,
                height,
                minFilter: this.gl.NEAREST,
                magFilter: this.gl.NEAREST,
                format: this.gl.DEPTH_COMPONENT,
                internalFormat: gl.renderer.isWebgl2 ? this.gl.DEPTH_COMPONENT16 : this.gl.DEPTH_COMPONENT,
                type: this.gl.UNSIGNED_INT,
            });
            this.depthTexture.update();
            this.gl.framebufferTexture2D(this.target, this.gl.DEPTH_ATTACHMENT, this.gl.TEXTURE_2D, this.depthTexture.texture, 0 /* level */);
        } else {
            // Render buffers
            if (depth && !stencil) {
                this.depthBuffer = this.gl.createRenderbuffer();
                this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, this.depthBuffer);
                this.gl.renderbufferStorage(this.gl.RENDERBUFFER, this.gl.DEPTH_COMPONENT16, width, height);
                this.gl.framebufferRenderbuffer(this.target, this.gl.DEPTH_ATTACHMENT, this.gl.RENDERBUFFER, this.depthBuffer);
            }

            if (stencil && !depth) {
                this.stencilBuffer = this.gl.createRenderbuffer();
                this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, this.stencilBuffer);
                this.gl.renderbufferStorage(this.gl.RENDERBUFFER, this.gl.STENCIL_INDEX8, width, height);
                this.gl.framebufferRenderbuffer(this.target, this.gl.STENCIL_ATTACHMENT, this.gl.RENDERBUFFER, this.stencilBuffer);
            }

            if (depth && stencil) {
                this.depthStencilBuffer = this.gl.createRenderbuffer();
                this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, this.depthStencilBuffer);
                this.gl.renderbufferStorage(this.gl.RENDERBUFFER, this.gl.DEPTH_STENCIL, width, height);
                this.gl.framebufferRenderbuffer(this.target, this.gl.DEPTH_STENCIL_ATTACHMENT, this.gl.RENDERBUFFER, this.depthStencilBuffer);
            }
        }

        this.gl.bindFramebuffer(this.target, null);
    }

    dispose() {
        this.textures.forEach( (texture) => {
            texture.dispose();
        })
        this.gl.deleteFramebuffer(this.buffer);
    }
}


/***/ }),

/***/ "./src/core/Renderer.js":
/*!******************************!*\
  !*** ./src/core/Renderer.js ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Renderer": () => (/* binding */ Renderer)
/* harmony export */ });
/* harmony import */ var _math_Vec3_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../math/Vec3.js */ "./src/math/Vec3.js");


// TODO: Handle context loss https://www.khronos.org/webgl/wiki/HandlingContextLost

// Not automatic - devs to use these methods manually
// gl.colorMask( colorMask, colorMask, colorMask, colorMask );
// gl.clearColor( r, g, b, a );
// gl.stencilMask( stencilMask );
// gl.stencilFunc( stencilFunc, stencilRef, stencilMask );
// gl.stencilOp( stencilFail, stencilZFail, stencilZPass );
// gl.clearStencil( stencil );

const tempVec3 = new _math_Vec3_js__WEBPACK_IMPORTED_MODULE_0__.Vec3();
let ID = 1;

class Renderer {
    constructor({
        canvas = document.createElement('canvas'),
        width = 300,
        height = 150,
        dpr = 1,
        alpha = false,
        depth = true,
        stencil = false,
        antialias = false,
        premultipliedAlpha = false,
        preserveDrawingBuffer = false,
        powerPreference = 'default',
        autoClear = true,
        webgl = 2,
    } = {}) {
        const attributes = { alpha, depth, stencil, antialias, premultipliedAlpha, preserveDrawingBuffer, powerPreference };
        this.dpr = dpr;
        this.alpha = alpha;
        this.color = true;
        this.depth = depth;
        this.stencil = stencil;
        this.premultipliedAlpha = premultipliedAlpha;
        this.autoClear = autoClear;
        this.id = ID++;

        // Attempt WebGL2 unless forced to 1, if not supported fallback to WebGL1
        if (webgl === 2) this.gl = canvas.getContext('webgl2', attributes);
        this.isWebgl2 = !!this.gl;
        if (!this.gl) {
            this.gl = canvas.getContext('webgl', attributes) || canvas.getContext('experimental-webgl', attributes);
        }
        if (!this.gl) console.error('unable to create webgl context');

        // Attach renderer to gl so that all classes have access to internal state functions
        this.gl.renderer = this;

        // initialise size values
        this.setSize(width, height);

        // gl state stores to avoid redundant calls on methods used internally
        this.state = {};
        this.state.blendFunc = { src: this.gl.ONE, dst: this.gl.ZERO };
        this.state.blendEquation = { modeRGB: this.gl.FUNC_ADD };
        this.state.cullFace = null;
        this.state.frontFace = this.gl.CCW;
        this.state.depthMask = true;
        this.state.depthFunc = this.gl.LESS;
        this.state.premultiplyAlpha = false;
        this.state.flipY = false;
        this.state.unpackAlignment = 4;
        this.state.framebuffer = null;
        this.state.viewport = { width: null, height: null };
        this.state.textureUnits = [];
        this.state.activeTextureUnit = 0;
        this.state.boundBuffer = null;
        this.state.uniformLocations = new Map();

        // store requested extensions
        this.extensions = {};

        // Initialise extra format types
        if (this.isWebgl2) {
            this.getExtension('EXT_color_buffer_float');
            this.getExtension('OES_texture_float_linear');
        } else {
            this.getExtension('OES_texture_float');
            this.getExtension('OES_texture_float_linear');
            this.getExtension('OES_texture_half_float');
            this.getExtension('OES_texture_half_float_linear');
            this.getExtension('OES_element_index_uint');
            this.getExtension('OES_standard_derivatives');
            this.getExtension('EXT_sRGB');
            this.getExtension('WEBGL_depth_texture');
            this.getExtension('WEBGL_draw_buffers');
        }

        // Create method aliases using extension (WebGL1) or native if available (WebGL2)
        this.vertexAttribDivisor = this.getExtension('ANGLE_instanced_arrays', 'vertexAttribDivisor', 'vertexAttribDivisorANGLE');
        this.drawArraysInstanced = this.getExtension('ANGLE_instanced_arrays', 'drawArraysInstanced', 'drawArraysInstancedANGLE');
        this.drawElementsInstanced = this.getExtension('ANGLE_instanced_arrays', 'drawElementsInstanced', 'drawElementsInstancedANGLE');
        this.createVertexArray = this.getExtension('OES_vertex_array_object', 'createVertexArray', 'createVertexArrayOES');
        this.bindVertexArray = this.getExtension('OES_vertex_array_object', 'bindVertexArray', 'bindVertexArrayOES');
        this.deleteVertexArray = this.getExtension('OES_vertex_array_object', 'deleteVertexArray', 'deleteVertexArrayOES');
        this.drawBuffers = this.getExtension('WEBGL_draw_buffers', 'drawBuffers', 'drawBuffersWEBGL');

        // Store device parameters
        this.parameters = {};
        this.parameters.maxTextureUnits = this.gl.getParameter(this.gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS);
        this.parameters.maxAnisotropy = this.getExtension('EXT_texture_filter_anisotropic')
            ? this.gl.getParameter(this.getExtension('EXT_texture_filter_anisotropic').MAX_TEXTURE_MAX_ANISOTROPY_EXT)
            : 0;
    }

    setSize(width, height) {
        this.width = width;
        this.height = height;

        this.gl.canvas.width = width * this.dpr;
        this.gl.canvas.height = height * this.dpr;

        Object.assign(this.gl.canvas.style, {
            width: width + 'px',
            height: height + 'px',
        });
    }

    setViewport(width, height) {
        if (this.state.viewport.width === width && this.state.viewport.height === height) return;
        this.state.viewport.width = width;
        this.state.viewport.height = height;
        this.gl.viewport(0, 0, width, height);
    }

    enable(id) {
        if (this.state[id] === true) return;
        this.gl.enable(id);
        this.state[id] = true;
    }

    disable(id) {
        if (this.state[id] === false) return;
        this.gl.disable(id);
        this.state[id] = false;
    }

    setBlendFunc(src, dst, srcAlpha, dstAlpha) {
        if (
            this.state.blendFunc.src === src &&
            this.state.blendFunc.dst === dst &&
            this.state.blendFunc.srcAlpha === srcAlpha &&
            this.state.blendFunc.dstAlpha === dstAlpha
        )
            return;
        this.state.blendFunc.src = src;
        this.state.blendFunc.dst = dst;
        this.state.blendFunc.srcAlpha = srcAlpha;
        this.state.blendFunc.dstAlpha = dstAlpha;
        if (srcAlpha !== undefined) this.gl.blendFuncSeparate(src, dst, srcAlpha, dstAlpha);
        else this.gl.blendFunc(src, dst);
    }

    setBlendEquation(modeRGB, modeAlpha) {
        modeRGB = modeRGB || this.gl.FUNC_ADD;
        if (this.state.blendEquation.modeRGB === modeRGB && this.state.blendEquation.modeAlpha === modeAlpha) return;
        this.state.blendEquation.modeRGB = modeRGB;
        this.state.blendEquation.modeAlpha = modeAlpha;
        if (modeAlpha !== undefined) this.gl.blendEquationSeparate(modeRGB, modeAlpha);
        else this.gl.blendEquation(modeRGB);
    }

    setCullFace(value) {
        if (this.state.cullFace === value) return;
        this.state.cullFace = value;
        this.gl.cullFace(value);
    }

    setFrontFace(value) {
        if (this.state.frontFace === value) return;
        this.state.frontFace = value;
        this.gl.frontFace(value);
    }

    setDepthMask(value) {
        if (this.state.depthMask === value) return;
        this.state.depthMask = value;
        this.gl.depthMask(value);
    }

    setDepthFunc(value) {
        if (this.state.depthFunc === value) return;
        this.state.depthFunc = value;
        this.gl.depthFunc(value);
    }

    activeTexture(value) {
        if (this.state.activeTextureUnit === value) return;
        this.state.activeTextureUnit = value;
        this.gl.activeTexture(this.gl.TEXTURE0 + value);
    }

    bindFramebuffer({ target = this.gl.FRAMEBUFFER, buffer = null } = {}) {
        if (this.state.framebuffer === buffer) return;
        this.state.framebuffer = buffer;
        this.gl.bindFramebuffer(target, buffer);
    }

    getExtension(extension, webgl2Func, extFunc) {
        // if webgl2 function supported, return func bound to gl context
        if (webgl2Func && this.gl[webgl2Func]) return this.gl[webgl2Func].bind(this.gl);

        // fetch extension once only
        if (!this.extensions[extension]) {
            this.extensions[extension] = this.gl.getExtension(extension);
        }

        // return extension if no function requested
        if (!webgl2Func) return this.extensions[extension];

        // Return null if extension not supported
        if (!this.extensions[extension]) return null;

        // return extension function, bound to extension
        return this.extensions[extension][extFunc].bind(this.extensions[extension]);
    }

    sortOpaque(a, b) {
        if (a.renderOrder !== b.renderOrder) {
            return a.renderOrder - b.renderOrder;
        } else if (a.program.id !== b.program.id) {
            return a.program.id - b.program.id;
        } else if (a.zDepth !== b.zDepth) {
            return a.zDepth - b.zDepth;
        } else {
            return b.id - a.id;
        }
    }

    sortTransparent(a, b) {
        if (a.renderOrder !== b.renderOrder) {
            return a.renderOrder - b.renderOrder;
        }
        if (a.zDepth !== b.zDepth) {
            return b.zDepth - a.zDepth;
        } else {
            return b.id - a.id;
        }
    }

    sortUI(a, b) {
        if (a.renderOrder !== b.renderOrder) {
            return a.renderOrder - b.renderOrder;
        } else if (a.program.id !== b.program.id) {
            return a.program.id - b.program.id;
        } else {
            return b.id - a.id;
        }
    }

    getRenderList({ scene, camera, frustumCull, sort, overrideProgram }) {
        let renderList = [];
        if (camera && frustumCull) camera.updateFrustum();

        // Get visible
        scene.traverse((node) => {
            if (!node.visible) return true;
            if (!node.draw) return;

            if (frustumCull && node.frustumCulled && camera) {
                if (!camera.frustumIntersectsMesh(node)) return;
            }

            renderList.push(node);
        });

        if (sort) {
            const opaque = [];
            const transparent = []; // depthTest true
            const ui = []; // depthTest false

            renderList.forEach((node) => {
                // Split into the 3 render groups
                if (!node.program.transparent) {
                    opaque.push(node);
                } else if (node.program.depthTest) {
                    transparent.push(node);
                } else {
                    ui.push(node);
                }

                node.zDepth = 0;

                // Only calculate z-depth if renderOrder unset and depthTest is true
                if (node.renderOrder !== 0 || !node.program.depthTest || !camera) return;

                // update z-depth
                node.worldMatrix.getTranslation(tempVec3);
                tempVec3.applyMatrix4(camera.projectionViewMatrix);
                node.zDepth = tempVec3.z;
            });

            opaque.sort(this.sortOpaque);
            transparent.sort(this.sortTransparent);
            ui.sort(this.sortUI);

            renderList = opaque.concat(transparent, ui);
        }

        return renderList;
    }

    render({ scene, camera, target = null, update = true, sort = true, frustumCull = true, clear, overrideProgram }) {
        if (target === null) {
            // make sure no render target bound so draws to canvas
            this.bindFramebuffer();
            this.setViewport(this.width * this.dpr, this.height * this.dpr);
        } else {
            // bind supplied render target and update viewport
            this.bindFramebuffer(target);
            this.setViewport(target.width, target.height);
        }

        if (clear || (this.autoClear && clear !== false)) {
            // Ensure depth buffer writing is enabled so it can be cleared
            if (this.depth && (!target || target.depth)) {
                this.enable(this.gl.DEPTH_TEST);
                this.setDepthMask(true);
            }
            this.gl.clear(
                (this.color ? this.gl.COLOR_BUFFER_BIT : 0) |
                    (this.depth ? this.gl.DEPTH_BUFFER_BIT : 0) |
                    (this.stencil ? this.gl.STENCIL_BUFFER_BIT : 0)
            );
        }

        // updates all scene graph matrices
        if (update) scene.updateMatrixWorld();

        // Update camera separately, in case not in scene graph
        if (camera) camera.updateMatrixWorld();

        // Get render list - entails culling and sorting
        const renderList = this.getRenderList({ scene, camera, frustumCull, sort, overrideProgram });

        renderList.forEach((node) => {
            node.draw({ camera, overrideProgram });
        });
    }
}


/***/ }),

/***/ "./src/core/Texture.js":
/*!*****************************!*\
  !*** ./src/core/Texture.js ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Texture": () => (/* binding */ Texture)
/* harmony export */ });
// TODO: delete texture
// TODO: use texSubImage2D for updates (video or when loaded)
// TODO: need? encoding = linearEncoding
// TODO: support non-compressed mipmaps uploads

const emptyPixel = new Uint8Array(4);

function isPowerOf2(value) {
    return (value & (value - 1)) === 0;
}

let ID = 1;

class Texture {
    constructor(
        gl,
        {
            image,
            target = gl.TEXTURE_2D,
            type = gl.UNSIGNED_BYTE,
            format = gl.RGBA,
            internalFormat = format,
            wrapS = gl.CLAMP_TO_EDGE,
            wrapT = gl.CLAMP_TO_EDGE,
            generateMipmaps = true,
            minFilter = generateMipmaps ? gl.NEAREST_MIPMAP_LINEAR : gl.LINEAR,
            magFilter = gl.LINEAR,
            premultiplyAlpha = false,
            unpackAlignment = 4,
            flipY = target == gl.TEXTURE_2D ? true : false,
            anisotropy = 0,
            level = 0,
            width, // used for RenderTargets or Data Textures
            height = width,
        } = {}
    ) {
        this.gl = gl;
        this.id = ID++;

        this.image = image;
        this.target = target;
        this.type = type;
        this.format = format;
        this.internalFormat = internalFormat;
        this.minFilter = minFilter;
        this.magFilter = magFilter;
        this.wrapS = wrapS;
        this.wrapT = wrapT;
        this.generateMipmaps = generateMipmaps;
        this.premultiplyAlpha = premultiplyAlpha;
        this.unpackAlignment = unpackAlignment;
        this.flipY = flipY;
        this.anisotropy = Math.min(anisotropy, this.gl.renderer.parameters.maxAnisotropy);
        this.level = level;
        this.width = width;
        this.height = height;
        this.texture = this.gl.createTexture();

        this.store = {
            image: null,
        };

        // Alias for state store to avoid redundant calls for global state
        this.glState = this.gl.renderer.state;

        // State store to avoid redundant calls for per-texture state
        this.state = {};
        this.state.minFilter = this.gl.NEAREST_MIPMAP_LINEAR;
        this.state.magFilter = this.gl.LINEAR;
        this.state.wrapS = this.gl.REPEAT;
        this.state.wrapT = this.gl.REPEAT;
        this.state.anisotropy = 0;
    }

    bind() {
        // Already bound to active texture unit
        if (this.glState.textureUnits[this.glState.activeTextureUnit] === this.id) return;
        this.gl.bindTexture(this.target, this.texture);
        this.glState.textureUnits[this.glState.activeTextureUnit] = this.id;
    }

    update(textureUnit = 0) {
        const needsUpdate = !(this.image === this.store.image && !this.needsUpdate);

        // Make sure that texture is bound to its texture unit
        if (needsUpdate || this.glState.textureUnits[textureUnit] !== this.id) {
            // set active texture unit to perform texture functions
            this.gl.renderer.activeTexture(textureUnit);
            this.bind();
        }

        if (!needsUpdate) return;
        this.needsUpdate = false;

        if (this.flipY !== this.glState.flipY) {
            this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, this.flipY);
            this.glState.flipY = this.flipY;
        }

        if (this.premultiplyAlpha !== this.glState.premultiplyAlpha) {
            this.gl.pixelStorei(this.gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, this.premultiplyAlpha);
            this.glState.premultiplyAlpha = this.premultiplyAlpha;
        }

        if (this.unpackAlignment !== this.glState.unpackAlignment) {
            this.gl.pixelStorei(this.gl.UNPACK_ALIGNMENT, this.unpackAlignment);
            this.glState.unpackAlignment = this.unpackAlignment;
        }

        if (this.minFilter !== this.state.minFilter) {
            this.gl.texParameteri(this.target, this.gl.TEXTURE_MIN_FILTER, this.minFilter);
            this.state.minFilter = this.minFilter;
        }

        if (this.magFilter !== this.state.magFilter) {
            this.gl.texParameteri(this.target, this.gl.TEXTURE_MAG_FILTER, this.magFilter);
            this.state.magFilter = this.magFilter;
        }

        if (this.wrapS !== this.state.wrapS) {
            this.gl.texParameteri(this.target, this.gl.TEXTURE_WRAP_S, this.wrapS);
            this.state.wrapS = this.wrapS;
        }

        if (this.wrapT !== this.state.wrapT) {
            this.gl.texParameteri(this.target, this.gl.TEXTURE_WRAP_T, this.wrapT);
            this.state.wrapT = this.wrapT;
        }

        if (this.anisotropy && this.anisotropy !== this.state.anisotropy) {
            this.gl.texParameterf(
                this.target,
                this.gl.renderer.getExtension('EXT_texture_filter_anisotropic').TEXTURE_MAX_ANISOTROPY_EXT,
                this.anisotropy
            );
            this.state.anisotropy = this.anisotropy;
        }

        if (this.image) {
            if (this.image.width) {
                this.width = this.image.width;
                this.height = this.image.height;
            }

            if (this.target === this.gl.TEXTURE_CUBE_MAP) {
                // For cube maps
                for (let i = 0; i < 6; i++) {
                    this.gl.texImage2D(
                        this.gl.TEXTURE_CUBE_MAP_POSITIVE_X + i,
                        this.level,
                        this.internalFormat,
                        this.format,
                        this.type,
                        this.image[i]
                    );
                }
            } else if (ArrayBuffer.isView(this.image)) {
                // Data texture
                this.gl.texImage2D(this.target, this.level, this.internalFormat, this.width, this.height, 0, this.format, this.type, this.image);
            } else if (this.image.isCompressedTexture) {
                // Compressed texture
                for (let level = 0; level < this.image.length; level++) {
                    this.gl.compressedTexImage2D(
                        this.target,
                        level,
                        this.internalFormat,
                        this.image[level].width,
                        this.image[level].height,
                        0,
                        this.image[level].data
                    );
                }
            } else {
                // Regular texture
                this.gl.texImage2D(this.target, this.level, this.internalFormat, this.format, this.type, this.image);
            }

            if (this.generateMipmaps) {
                // For WebGL1, if not a power of 2, turn off mips, set wrapping to clamp to edge and minFilter to linear
                if (!this.gl.renderer.isWebgl2 && (!isPowerOf2(this.image.width) || !isPowerOf2(this.image.height))) {
                    this.generateMipmaps = false;
                    this.wrapS = this.wrapT = this.gl.CLAMP_TO_EDGE;
                    this.minFilter = this.gl.LINEAR;
                } else {
                    this.gl.generateMipmap(this.target);
                }
            }

            // Callback for when data is pushed to GPU
            this.onUpdate && this.onUpdate();
        } else {
            if (this.target === this.gl.TEXTURE_CUBE_MAP) {
                // Upload empty pixel for each side while no image to avoid errors while image or video loading
                for (let i = 0; i < 6; i++) {
                    this.gl.texImage2D(
                        this.gl.TEXTURE_CUBE_MAP_POSITIVE_X + i,
                        0,
                        this.gl.RGBA,
                        1,
                        1,
                        0,
                        this.gl.RGBA,
                        this.gl.UNSIGNED_BYTE,
                        emptyPixel
                    );
                }
            } else if (this.width) {
                // image intentionally left null for RenderTarget
                this.gl.texImage2D(this.target, this.level, this.internalFormat, this.width, this.height, 0, this.format, this.type, null);
            } else {
                // Upload empty pixel if no image to avoid errors while image or video loading
                this.gl.texImage2D(this.target, 0, this.gl.RGBA, 1, 1, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, emptyPixel);
            }
        }
        this.store.image = this.image;
    }

    dispose() {
        this.gl.deleteTexture(this.texture);
        this.texture = null;
    }
}


/***/ }),

/***/ "./src/core/Transform.js":
/*!*******************************!*\
  !*** ./src/core/Transform.js ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Transform": () => (/* binding */ Transform)
/* harmony export */ });
/* harmony import */ var _math_Vec3_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../math/Vec3.js */ "./src/math/Vec3.js");
/* harmony import */ var _math_Quat_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../math/Quat.js */ "./src/math/Quat.js");
/* harmony import */ var _math_Mat4_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../math/Mat4.js */ "./src/math/Mat4.js");
/* harmony import */ var _math_Euler_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../math/Euler.js */ "./src/math/Euler.js");





class Transform {
    constructor() {
        this.parent = null;
        this.children = [];
        this.visible = true;

        this.matrix = new _math_Mat4_js__WEBPACK_IMPORTED_MODULE_0__.Mat4();
        this.worldMatrix = new _math_Mat4_js__WEBPACK_IMPORTED_MODULE_0__.Mat4();
        this.matrixAutoUpdate = true;

        this.position = new _math_Vec3_js__WEBPACK_IMPORTED_MODULE_1__.Vec3();
        this.quaternion = new _math_Quat_js__WEBPACK_IMPORTED_MODULE_2__.Quat();
        this.scale = new _math_Vec3_js__WEBPACK_IMPORTED_MODULE_1__.Vec3(1);
        this.rotation = new _math_Euler_js__WEBPACK_IMPORTED_MODULE_3__.Euler();
        this.up = new _math_Vec3_js__WEBPACK_IMPORTED_MODULE_1__.Vec3(0, 1, 0);

        this.rotation.onChange = () => this.quaternion.fromEuler(this.rotation);
        this.quaternion.onChange = () => this.rotation.fromQuaternion(this.quaternion);
    }

    setParent(parent, notifyParent = true) {
        if (this.parent && parent !== this.parent) this.parent.removeChild(this, false);
        this.parent = parent;
        if (notifyParent && parent) parent.addChild(this, false);
    }

    addChild(child, notifyChild = true) {
        if (!~this.children.indexOf(child)) this.children.push(child);
        if (notifyChild) child.setParent(this, false);
    }

    removeChild(child, notifyChild = true) {
        if (!!~this.children.indexOf(child)) this.children.splice(this.children.indexOf(child), 1);
        if (notifyChild) child.setParent(null, false);
    }

    updateMatrixWorld(force) {
        if (this.matrixAutoUpdate) this.updateMatrix();
        if (this.worldMatrixNeedsUpdate || force) {
            if (this.parent === null) this.worldMatrix.copy(this.matrix);
            else this.worldMatrix.multiply(this.parent.worldMatrix, this.matrix);
            this.worldMatrixNeedsUpdate = false;
            force = true;
        }

        for (let i = 0, l = this.children.length; i < l; i++) {
            this.children[i].updateMatrixWorld(force);
        }
    }

    updateMatrix() {
        this.matrix.compose(this.quaternion, this.position, this.scale);
        this.worldMatrixNeedsUpdate = true;
    }

    traverse(callback) {
        // Return true in callback to stop traversing children
        if (callback(this)) return;
        for (let i = 0, l = this.children.length; i < l; i++) {
            this.children[i].traverse(callback);
        }
    }

    decompose() {
        this.matrix.getTranslation(this.position);
        this.matrix.getRotation(this.quaternion);
        this.matrix.getScaling(this.scale);
        this.rotation.fromQuaternion(this.quaternion);
    }

    lookAt(target, invert = false) {
        if (invert) this.matrix.lookAt(this.position, target, this.up);
        else this.matrix.lookAt(target, this.position, this.up);
        this.matrix.getRotation(this.quaternion);
        this.rotation.fromQuaternion(this.quaternion);
    }
}


/***/ }),

/***/ "./src/extras/Animation.js":
/*!*********************************!*\
  !*** ./src/extras/Animation.js ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Animation": () => (/* binding */ Animation)
/* harmony export */ });
/* harmony import */ var _math_Vec3_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../math/Vec3.js */ "./src/math/Vec3.js");
/* harmony import */ var _math_Quat_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../math/Quat.js */ "./src/math/Quat.js");



const prevPos = new _math_Vec3_js__WEBPACK_IMPORTED_MODULE_0__.Vec3();
const prevRot = new _math_Quat_js__WEBPACK_IMPORTED_MODULE_1__.Quat();
const prevScl = new _math_Vec3_js__WEBPACK_IMPORTED_MODULE_0__.Vec3();

const nextPos = new _math_Vec3_js__WEBPACK_IMPORTED_MODULE_0__.Vec3();
const nextRot = new _math_Quat_js__WEBPACK_IMPORTED_MODULE_1__.Quat();
const nextScl = new _math_Vec3_js__WEBPACK_IMPORTED_MODULE_0__.Vec3();

class Animation {
    constructor({ objects, data }) {
        this.objects = objects;
        this.data = data;
        this.elapsed = 0;
        this.weight = 1;
        this.duration = data.frames.length - 1;
    }

    update(totalWeight = 1, isSet) {
        const weight = isSet ? 1 : this.weight / totalWeight;
        const elapsed = this.elapsed % this.duration;

        const floorFrame = Math.floor(elapsed);
        const blend = elapsed - floorFrame;
        const prevKey = this.data.frames[floorFrame];
        const nextKey = this.data.frames[(floorFrame + 1) % this.duration];

        this.objects.forEach((object, i) => {
            prevPos.fromArray(prevKey.position, i * 3);
            prevRot.fromArray(prevKey.quaternion, i * 4);
            prevScl.fromArray(prevKey.scale, i * 3);

            nextPos.fromArray(nextKey.position, i * 3);
            nextRot.fromArray(nextKey.quaternion, i * 4);
            nextScl.fromArray(nextKey.scale, i * 3);

            prevPos.lerp(nextPos, blend);
            prevRot.slerp(nextRot, blend);
            prevScl.lerp(nextScl, blend);

            object.position.lerp(prevPos, weight);
            object.quaternion.slerp(prevRot, weight);
            object.scale.lerp(prevScl, weight);
        });
    }
}


/***/ }),

/***/ "./src/extras/Box.js":
/*!***************************!*\
  !*** ./src/extras/Box.js ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Box": () => (/* binding */ Box)
/* harmony export */ });
/* harmony import */ var _core_Geometry_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../core/Geometry.js */ "./src/core/Geometry.js");
/* harmony import */ var _Plane_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Plane.js */ "./src/extras/Plane.js");



class Box extends _core_Geometry_js__WEBPACK_IMPORTED_MODULE_0__.Geometry {
    constructor(gl, { width = 1, height = 1, depth = 1, widthSegments = 1, heightSegments = 1, depthSegments = 1, attributes = {} } = {}) {
        const wSegs = widthSegments;
        const hSegs = heightSegments;
        const dSegs = depthSegments;

        const num = (wSegs + 1) * (hSegs + 1) * 2 + (wSegs + 1) * (dSegs + 1) * 2 + (hSegs + 1) * (dSegs + 1) * 2;
        const numIndices = (wSegs * hSegs * 2 + wSegs * dSegs * 2 + hSegs * dSegs * 2) * 6;

        const position = new Float32Array(num * 3);
        const normal = new Float32Array(num * 3);
        const uv = new Float32Array(num * 2);
        const index = num > 65536 ? new Uint32Array(numIndices) : new Uint16Array(numIndices);

        let i = 0;
        let ii = 0;

        // left, right
        _Plane_js__WEBPACK_IMPORTED_MODULE_1__.Plane.buildPlane(position, normal, uv, index, depth, height, width, dSegs, hSegs, 2, 1, 0, -1, -1, i, ii);
        _Plane_js__WEBPACK_IMPORTED_MODULE_1__.Plane.buildPlane(
            position,
            normal,
            uv,
            index,
            depth,
            height,
            -width,
            dSegs,
            hSegs,
            2,
            1,
            0,
            1,
            -1,
            (i += (dSegs + 1) * (hSegs + 1)),
            (ii += dSegs * hSegs)
        );

        // top, bottom
        _Plane_js__WEBPACK_IMPORTED_MODULE_1__.Plane.buildPlane(
            position,
            normal,
            uv,
            index,
            width,
            depth,
            height,
            dSegs,
            hSegs,
            0,
            2,
            1,
            1,
            1,
            (i += (dSegs + 1) * (hSegs + 1)),
            (ii += dSegs * hSegs)
        );
        _Plane_js__WEBPACK_IMPORTED_MODULE_1__.Plane.buildPlane(
            position,
            normal,
            uv,
            index,
            width,
            depth,
            -height,
            dSegs,
            hSegs,
            0,
            2,
            1,
            1,
            -1,
            (i += (wSegs + 1) * (dSegs + 1)),
            (ii += wSegs * dSegs)
        );

        // front, back
        _Plane_js__WEBPACK_IMPORTED_MODULE_1__.Plane.buildPlane(
            position,
            normal,
            uv,
            index,
            width,
            height,
            -depth,
            wSegs,
            hSegs,
            0,
            1,
            2,
            -1,
            -1,
            (i += (wSegs + 1) * (dSegs + 1)),
            (ii += wSegs * dSegs)
        );
        _Plane_js__WEBPACK_IMPORTED_MODULE_1__.Plane.buildPlane(
            position,
            normal,
            uv,
            index,
            width,
            height,
            depth,
            wSegs,
            hSegs,
            0,
            1,
            2,
            1,
            -1,
            (i += (wSegs + 1) * (hSegs + 1)),
            (ii += wSegs * hSegs)
        );

        Object.assign(attributes, {
            position: { size: 3, data: position },
            normal: { size: 3, data: normal },
            uv: { size: 2, data: uv },
            index: { data: index },
        });

        super(gl, attributes);
    }
}


/***/ }),

/***/ "./src/extras/Curve.js":
/*!*****************************!*\
  !*** ./src/extras/Curve.js ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Curve": () => (/* binding */ Curve)
/* harmony export */ });
/* harmony import */ var _math_Vec3_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../math/Vec3.js */ "./src/math/Vec3.js");


const CATMULLROM = 'catmullrom';
const CUBICBEZIER = 'cubicbezier';
const QUADRATICBEZIER = 'quadraticbezier';

// temp
const _a0 = new _math_Vec3_js__WEBPACK_IMPORTED_MODULE_0__.Vec3(),
    _a1 = new _math_Vec3_js__WEBPACK_IMPORTED_MODULE_0__.Vec3(),
    _a2 = new _math_Vec3_js__WEBPACK_IMPORTED_MODULE_0__.Vec3(),
    _a3 = new _math_Vec3_js__WEBPACK_IMPORTED_MODULE_0__.Vec3();

/**
 * Get the control points of cubic bezier curve.
 * @param {*} i
 * @param {*} a
 * @param {*} b
 */
function getCtrlPoint(points, i, a = 0.168, b = 0.168) {
    if (i < 1) {
        _a0.sub(points[1], points[0]).scale(a).add(points[0]);
    } else {
        _a0.sub(points[i + 1], points[i - 1])
            .scale(a)
            .add(points[i]);
    }
    if (i > points.length - 3) {
        const last = points.length - 1;
        _a1.sub(points[last - 1], points[last])
            .scale(b)
            .add(points[last]);
    } else {
        _a1.sub(points[i], points[i + 2])
            .scale(b)
            .add(points[i + 1]);
    }
    return [_a0.clone(), _a1.clone()];
}

function getQuadraticBezierPoint(t, p0, c0, p1) {
    const k = 1 - t;
    _a0.copy(p0).scale(k ** 2);
    _a1.copy(c0).scale(2 * k * t);
    _a2.copy(p1).scale(t ** 2);
    const ret = new _math_Vec3_js__WEBPACK_IMPORTED_MODULE_0__.Vec3();
    ret.add(_a0, _a1).add(_a2);
    return ret;
}

function getCubicBezierPoint(t, p0, c0, c1, p1) {
    const k = 1 - t;
    _a0.copy(p0).scale(k ** 3);
    _a1.copy(c0).scale(3 * k ** 2 * t);
    _a2.copy(c1).scale(3 * k * t ** 2);
    _a3.copy(p1).scale(t ** 3);
    const ret = new _math_Vec3_js__WEBPACK_IMPORTED_MODULE_0__.Vec3();
    ret.add(_a0, _a1).add(_a2).add(_a3);
    return ret;
}

class Curve {
    constructor({ points = [new _math_Vec3_js__WEBPACK_IMPORTED_MODULE_0__.Vec3(0, 0, 0), new _math_Vec3_js__WEBPACK_IMPORTED_MODULE_0__.Vec3(0, 1, 0), new _math_Vec3_js__WEBPACK_IMPORTED_MODULE_0__.Vec3(1, 1, 0), new _math_Vec3_js__WEBPACK_IMPORTED_MODULE_0__.Vec3(1, 0, 0)], divisions = 12, type = CATMULLROM } = {}) {
        this.points = points;
        this.divisions = divisions;
        this.type = type;
    }

    _getQuadraticBezierPoints(divisions = this.divisions) {
        const points = [];
        const count = this.points.length;

        if (count < 3) {
            console.warn('Not enough points provided.');
            return [];
        }

        const p0 = this.points[0];
        let c0 = this.points[1],
            p1 = this.points[2];

        for (let i = 0; i <= divisions; i++) {
            const p = getQuadraticBezierPoint(i / divisions, p0, c0, p1);
            points.push(p);
        }

        let offset = 3;
        while (count - offset > 0) {
            p0.copy(p1);
            c0 = p1.scale(2).sub(c0);
            p1 = this.points[offset];
            for (let i = 1; i <= divisions; i++) {
                const p = getQuadraticBezierPoint(i / divisions, p0, c0, p1);
                points.push(p);
            }
            offset++;
        }

        return points;
    }

    _getCubicBezierPoints(divisions = this.divisions) {
        const points = [];
        const count = this.points.length;

        if (count < 4) {
            console.warn('Not enough points provided.');
            return [];
        }

        let p0 = this.points[0],
            c0 = this.points[1],
            c1 = this.points[2],
            p1 = this.points[3];

        for (let i = 0; i <= divisions; i++) {
            const p = getCubicBezierPoint(i / divisions, p0, c0, c1, p1);
            points.push(p);
        }

        let offset = 4;
        while (count - offset > 1) {
            p0.copy(p1);
            c0 = p1.scale(2).sub(c1);
            c1 = this.points[offset];
            p1 = this.points[offset + 1];
            for (let i = 1; i <= divisions; i++) {
                const p = getCubicBezierPoint(i / divisions, p0, c0, c1, p1);
                points.push(p);
            }
            offset += 2;
        }

        return points;
    }

    _getCatmullRomPoints(divisions = this.divisions, a = 0.168, b = 0.168) {
        const points = [];
        const count = this.points.length;

        if (count <= 2) {
            return this.points;
        }

        let p0;
        this.points.forEach((p, i) => {
            if (i === 0) {
                p0 = p;
            } else {
                const [c0, c1] = getCtrlPoint(this.points, i - 1, a, b);
                const c = new Curve({
                    points: [p0, c0, c1, p],
                    type: CUBICBEZIER,
                });
                points.pop();
                points.push(...c.getPoints(divisions));
                p0 = p;
            }
        });

        return points;
    }

    getPoints(divisions = this.divisions, a = 0.168, b = 0.168) {
        const type = this.type;

        if (type === QUADRATICBEZIER) {
            return this._getQuadraticBezierPoints(divisions);
        }

        if (type === CUBICBEZIER) {
            return this._getCubicBezierPoints(divisions);
        }

        if (type === CATMULLROM) {
            return this._getCatmullRomPoints(divisions, a, b);
        }

        return this.points;
    }
}

Curve.CATMULLROM = CATMULLROM;
Curve.CUBICBEZIER = CUBICBEZIER;
Curve.QUADRATICBEZIER = QUADRATICBEZIER;


/***/ }),

/***/ "./src/extras/Cylinder.js":
/*!********************************!*\
  !*** ./src/extras/Cylinder.js ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Cylinder": () => (/* binding */ Cylinder)
/* harmony export */ });
/* harmony import */ var _core_Geometry_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../core/Geometry.js */ "./src/core/Geometry.js");
/* harmony import */ var _math_Vec3_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../math/Vec3.js */ "./src/math/Vec3.js");



class Cylinder extends _core_Geometry_js__WEBPACK_IMPORTED_MODULE_0__.Geometry {
    constructor(
        gl,
        {
            radiusTop = 0.5,
            radiusBottom = 0.5,
            height = 1,
            radialSegments = 8,
            heightSegments = 1,
            openEnded = false,
            thetaStart = 0,
            thetaLength = Math.PI * 2,
            attributes = {},
        } = {}
    ) {
        const rSegs = radialSegments;
        const hSegs = heightSegments;
        const tStart = thetaStart;
        const tLength = thetaLength;

        const numCaps = openEnded ? 0 : radiusBottom && radiusTop ? 2 : 1;
        const num = (rSegs + 1) * (hSegs + 1 + numCaps) + numCaps;
        const numIndices = rSegs * hSegs * 6 + numCaps * rSegs * 3;

        const position = new Float32Array(num * 3);
        const normal = new Float32Array(num * 3);
        const uv = new Float32Array(num * 2);
        const index = num > 65536 ? new Uint32Array(numIndices) : new Uint16Array(numIndices);

        let i = 0;
        let ii = 0;
        const indexArray = [];

        addHeight();
        if (!openEnded) {
            if (radiusTop) addCap(true);
            if (radiusBottom) addCap(false);
        }

        function addHeight() {
            let x, y;
            const n = new _math_Vec3_js__WEBPACK_IMPORTED_MODULE_1__.Vec3();
            const slope = (radiusBottom - radiusTop) / height;

            for (y = 0; y <= hSegs; y++) {
                const indexRow = [];
                const v = y / hSegs;

                const r = v * (radiusBottom - radiusTop) + radiusTop;
                for (x = 0; x <= rSegs; x++) {
                    const u = x / rSegs;
                    const theta = u * tLength + tStart;
                    const sinTheta = Math.sin(theta);
                    const cosTheta = Math.cos(theta);

                    position.set([r * sinTheta, (0.5 - v) * height, r * cosTheta], i * 3);
                    n.set(sinTheta, slope, cosTheta).normalize();
                    normal.set([n.x, n.y, n.z], i * 3);
                    uv.set([u, 1 - v], i * 2);
                    indexRow.push(i++);
                }
                indexArray.push(indexRow);
            }

            for (x = 0; x < rSegs; x++) {
                for (y = 0; y < hSegs; y++) {
                    const a = indexArray[y][x];
                    const b = indexArray[y + 1][x];
                    const c = indexArray[y + 1][x + 1];
                    const d = indexArray[y][x + 1];

                    index.set([a, b, d, b, c, d], ii * 3);
                    ii += 2;
                }
            }
        }

        function addCap(isTop) {
            let x;
            const r = isTop === true ? radiusTop : radiusBottom;
            const sign = isTop === true ? 1 : -1;

            const centerIndex = i;
            position.set([0, 0.5 * height * sign, 0], i * 3);
            normal.set([0, sign, 0], i * 3);
            uv.set([0.5, 0.5], i * 2);
            i++;

            for (x = 0; x <= rSegs; x++) {
                const u = x / rSegs;
                const theta = u * tLength + tStart;
                const cosTheta = Math.cos(theta);
                const sinTheta = Math.sin(theta);

                position.set([r * sinTheta, 0.5 * height * sign, r * cosTheta], i * 3);
                normal.set([0, sign, 0], i * 3);
                uv.set([cosTheta * 0.5 + 0.5, sinTheta * 0.5 * sign + 0.5], i * 2);
                i++;
            }

            for (x = 0; x < rSegs; x++) {
                const j = centerIndex + x + 1;
                if (isTop) {
                    index.set([j, j + 1, centerIndex], ii * 3);
                } else {
                    index.set([j + 1, j, centerIndex], ii * 3);
                }
                ii++;
            }
        }

        Object.assign(attributes, {
            position: { size: 3, data: position },
            normal: { size: 3, data: normal },
            uv: { size: 2, data: uv },
            index: { data: index },
        });

        super(gl, attributes);
    }
}


/***/ }),

/***/ "./src/extras/Flowmap.js":
/*!*******************************!*\
  !*** ./src/extras/Flowmap.js ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Flowmap": () => (/* binding */ Flowmap)
/* harmony export */ });
/* harmony import */ var _core_RenderTarget_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../core/RenderTarget.js */ "./src/core/RenderTarget.js");
/* harmony import */ var _core_Program_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../core/Program.js */ "./src/core/Program.js");
/* harmony import */ var _core_Mesh_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../core/Mesh.js */ "./src/core/Mesh.js");
/* harmony import */ var _math_Vec2_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../math/Vec2.js */ "./src/math/Vec2.js");
/* harmony import */ var _Triangle_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./Triangle.js */ "./src/extras/Triangle.js");






class Flowmap {
    constructor(
        gl,
        {
            size = 128, // default size of the render targets
            falloff = 0.3, // size of the stamp, percentage of the size
            alpha = 1, // opacity of the stamp
            dissipation = 0.98, // affects the speed that the stamp fades. Closer to 1 is slower
            type, // Pass in gl.FLOAT to force it, defaults to gl.HALF_FLOAT
        } = {}
    ) {
        const _this = this;
        this.gl = gl;

        // output uniform containing render target textures
        this.uniform = { value: null };

        this.mask = {
            read: null,
            write: null,

            // Helper function to ping pong the render targets and update the uniform
            swap: () => {
                let temp = _this.mask.read;
                _this.mask.read = _this.mask.write;
                _this.mask.write = temp;
                _this.uniform.value = _this.mask.read.texture;
            },
        };

        {
            createFBOs();

            this.aspect = 1;
            this.mouse = new _math_Vec2_js__WEBPACK_IMPORTED_MODULE_0__.Vec2();
            this.velocity = new _math_Vec2_js__WEBPACK_IMPORTED_MODULE_0__.Vec2();

            this.mesh = initProgram();
        }

        function createFBOs() {
            // Requested type not supported, fall back to half float
            if (!type) type = gl.HALF_FLOAT || gl.renderer.extensions['OES_texture_half_float'].HALF_FLOAT_OES;

            let minFilter = (() => {
                if (gl.renderer.isWebgl2) return gl.LINEAR;
                if (gl.renderer.extensions[`OES_texture_${type === gl.FLOAT ? '' : 'half_'}float_linear`]) return gl.LINEAR;
                return gl.NEAREST;
            })();

            const options = {
                width: size,
                height: size,
                type,
                format: gl.RGBA,
                internalFormat: gl.renderer.isWebgl2 ? (type === gl.FLOAT ? gl.RGBA32F : gl.RGBA16F) : gl.RGBA,
                minFilter,
                depth: false,
            };

            _this.mask.read = new _core_RenderTarget_js__WEBPACK_IMPORTED_MODULE_1__.RenderTarget(gl, options);
            _this.mask.write = new _core_RenderTarget_js__WEBPACK_IMPORTED_MODULE_1__.RenderTarget(gl, options);
            _this.mask.swap();
        }

        function initProgram() {
            return new _core_Mesh_js__WEBPACK_IMPORTED_MODULE_2__.Mesh(gl, {
                // Triangle that includes -1 to 1 range for 'position', and 0 to 1 range for 'uv'.
                geometry: new _Triangle_js__WEBPACK_IMPORTED_MODULE_3__.Triangle(gl),

                program: new _core_Program_js__WEBPACK_IMPORTED_MODULE_4__.Program(gl, {
                    vertex,
                    fragment,
                    uniforms: {
                        tMap: _this.uniform,

                        uFalloff: { value: falloff * 0.5 },
                        uAlpha: { value: alpha },
                        uDissipation: { value: dissipation },

                        // User needs to update these
                        uAspect: { value: 1 },
                        uMouse: { value: _this.mouse },
                        uVelocity: { value: _this.velocity },
                    },
                    depthTest: false,
                }),
            });
        }
    }

    update() {
        this.mesh.program.uniforms.uAspect.value = this.aspect;

        this.gl.renderer.render({
            scene: this.mesh,
            target: this.mask.write,
            clear: false,
        });
        this.mask.swap();
    }
}

const vertex = /* glsl */ `
    attribute vec2 uv;
    attribute vec2 position;

    varying vec2 vUv;

    void main() {
        vUv = uv;
        gl_Position = vec4(position, 0, 1);
    }
`;

const fragment = /* glsl */ `
    precision highp float;

    uniform sampler2D tMap;

    uniform float uFalloff;
    uniform float uAlpha;
    uniform float uDissipation;
    
    uniform float uAspect;
    uniform vec2 uMouse;
    uniform vec2 uVelocity;

    varying vec2 vUv;

    void main() {
        vec4 color = texture2D(tMap, vUv) * uDissipation;

        vec2 cursor = vUv - uMouse;
        cursor.x *= uAspect;

        vec3 stamp = vec3(uVelocity * vec2(1, -1), 1.0 - pow(1.0 - min(1.0, length(uVelocity)), 3.0));
        float falloff = smoothstep(uFalloff, 0.0, length(cursor)) * uAlpha;

        color.rgb = mix(color.rgb, stamp, vec3(falloff));

        gl_FragColor = color;
    }
`;


/***/ }),

/***/ "./src/extras/GLTFAnimation.js":
/*!*************************************!*\
  !*** ./src/extras/GLTFAnimation.js ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "GLTFAnimation": () => (/* binding */ GLTFAnimation)
/* harmony export */ });
/* harmony import */ var _math_Vec3_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../math/Vec3.js */ "./src/math/Vec3.js");
/* harmony import */ var _math_Quat_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../math/Quat.js */ "./src/math/Quat.js");



const tmpVec3A = new _math_Vec3_js__WEBPACK_IMPORTED_MODULE_0__.Vec3();
const tmpVec3B = new _math_Vec3_js__WEBPACK_IMPORTED_MODULE_0__.Vec3();
const tmpVec3C = new _math_Vec3_js__WEBPACK_IMPORTED_MODULE_0__.Vec3();
const tmpVec3D = new _math_Vec3_js__WEBPACK_IMPORTED_MODULE_0__.Vec3();

const tmpQuatA = new _math_Quat_js__WEBPACK_IMPORTED_MODULE_1__.Quat();
const tmpQuatB = new _math_Quat_js__WEBPACK_IMPORTED_MODULE_1__.Quat();
const tmpQuatC = new _math_Quat_js__WEBPACK_IMPORTED_MODULE_1__.Quat();
const tmpQuatD = new _math_Quat_js__WEBPACK_IMPORTED_MODULE_1__.Quat();

class GLTFAnimation {
    constructor(data, weight = 1) {
        this.data = data;
        this.elapsed = 0;
        this.weight = weight;

        // Set to false to not apply modulo to elapsed against duration
        this.loop = true;

        // Find starting time as exports from blender (perhaps others too) don't always start from 0
        this.startTime = data.reduce((a, { times }) => Math.min(a, times[0]), Infinity);
        // Get largest final time in all channels to calculate duration
        this.endTime = data.reduce((a, { times }) => Math.max(a, times[times.length - 1]), 0);
        this.duration = this.endTime - this.startTime;
    }

    update(totalWeight = 1, isSet) {
        const weight = isSet ? 1 : this.weight / totalWeight;
        const elapsed = (this.loop ? this.elapsed % this.duration : Math.min(this.elapsed, this.duration - 0.001)) + this.startTime;

        this.data.forEach(({ node, transform, interpolation, times, values }) => {
            // Get index of two time values elapsed is between
            const prevIndex =
                Math.max(
                    1,
                    times.findIndex((t) => t > elapsed)
                ) - 1;
            const nextIndex = prevIndex + 1;

            // Get linear blend/alpha between the two
            let alpha = (elapsed - times[prevIndex]) / (times[nextIndex] - times[prevIndex]);
            if (interpolation === 'STEP') alpha = 0;

            let prevVal = tmpVec3A;
            let prevTan = tmpVec3B;
            let nextTan = tmpVec3C;
            let nextVal = tmpVec3D;
            let size = 3;

            if (transform === 'quaternion') {
                prevVal = tmpQuatA;
                prevTan = tmpQuatB;
                nextTan = tmpQuatC;
                nextVal = tmpQuatD;
                size = 4;
            }

            if (interpolation === 'CUBICSPLINE') {
                // Get the prev and next values from the indices
                prevVal.fromArray(values, prevIndex * size * 3 + size * 1);
                prevTan.fromArray(values, prevIndex * size * 3 + size * 2);
                nextTan.fromArray(values, nextIndex * size * 3 + size * 0);
                nextVal.fromArray(values, nextIndex * size * 3 + size * 1);

                // interpolate for final value
                prevVal = this.cubicSplineInterpolate(alpha, prevVal, prevTan, nextTan, nextVal);
                if (size === 4) prevVal.normalize();
            } else {
                // Get the prev and next values from the indices
                prevVal.fromArray(values, prevIndex * size);
                nextVal.fromArray(values, nextIndex * size);

                // interpolate for final value
                if (size === 4) prevVal.slerp(nextVal, alpha);
                else prevVal.lerp(nextVal, alpha);
            }

            // interpolate between multiple possible animations
            if (size === 4) node[transform].slerp(prevVal, weight);
            else node[transform].lerp(prevVal, weight);
        });
    }

    cubicSplineInterpolate(t, prevVal, prevTan, nextTan, nextVal) {
        const t2 = t * t;
        const t3 = t2 * t;

        const s2 = 3 * t2 - 2 * t3;
        const s3 = t3 - t2;
        const s0 = 1 - s2;
        const s1 = s3 - t2 + t;

        for (let i = 0; i < prevVal.length; i++) {
            prevVal[i] = s0 * prevVal[i] + s1 * (1 - t) * prevTan[i] + s2 * nextVal[i] + s3 * t * nextTan[i];
        }

        return prevVal;
    }
}


/***/ }),

/***/ "./src/extras/GLTFLoader.js":
/*!**********************************!*\
  !*** ./src/extras/GLTFLoader.js ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "GLTFLoader": () => (/* binding */ GLTFLoader)
/* harmony export */ });
/* harmony import */ var _core_Geometry_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../core/Geometry.js */ "./src/core/Geometry.js");
/* harmony import */ var _core_Transform_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../core/Transform.js */ "./src/core/Transform.js");
/* harmony import */ var _core_Texture_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../core/Texture.js */ "./src/core/Texture.js");
/* harmony import */ var _core_Mesh_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../core/Mesh.js */ "./src/core/Mesh.js");
/* harmony import */ var _GLTFAnimation_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./GLTFAnimation.js */ "./src/extras/GLTFAnimation.js");
/* harmony import */ var _GLTFSkin_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./GLTFSkin.js */ "./src/extras/GLTFSkin.js");
/* harmony import */ var _math_Mat4_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../math/Mat4.js */ "./src/math/Mat4.js");
/* harmony import */ var _NormalProgram_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./NormalProgram.js */ "./src/extras/NormalProgram.js");









// Supports
// [x] Geometry
// [ ] Sparse support
// [x] Nodes and Hierarchy
// [x] Instancing
// [ ] Morph Targets
// [x] Skins
// [ ] Materials
// [x] Textures
// [x] Animation
// [ ] Cameras
// [ ] Extensions
// [x] GLB support

// TODO: Sparse accessor packing? For morph targets basically
// TODO: init accessor missing bufferView with 0s
// TODO: morph target animations
// TODO: what to do if multiple instances are in different groups? Only uses local matrices
// TODO: what if instancing isn't wanted? Eg collision maps
// TODO: ie11 fallback for TextDecoder?

const TYPE_ARRAY = {
    5121: Uint8Array,
    5122: Int16Array,
    5123: Uint16Array,
    5125: Uint32Array,
    5126: Float32Array,
    'image/jpeg': Uint8Array,
    'image/png': Uint8Array,
};

const TYPE_SIZE = {
    SCALAR: 1,
    VEC2: 2,
    VEC3: 3,
    VEC4: 4,
    MAT2: 4,
    MAT3: 9,
    MAT4: 16,
};

const ATTRIBUTES = {
    POSITION: 'position',
    NORMAL: 'normal',
    TANGENT: 'tangent',
    TEXCOORD_0: 'uv',
    TEXCOORD_1: 'uv2',
    COLOR_0: 'color',
    WEIGHTS_0: 'skinWeight',
    JOINTS_0: 'skinIndex',
};

const TRANSFORMS = {
    translation: 'position',
    rotation: 'quaternion',
    scale: 'scale',
};

class GLTFLoader {
    static async load(gl, src) {
        const dir = src.split('/').slice(0, -1).join('/') + '/';

        // load main description json
        const desc = await this.parseDesc(src);

        return await this.parse(gl, desc, dir);
    }

    static async parse(gl, desc, dir) {
        if (desc.asset === undefined || desc.asset.version[0] < 2) console.warn('Only GLTF >=2.0 supported. Attempting to parse.');

        // Load buffers async
        const buffers = await this.loadBuffers(desc, dir);

        // Unbind current VAO so that new buffers don't get added to active mesh
        gl.renderer.bindVertexArray(null);

        // Create gl buffers from bufferViews
        const bufferViews = this.parseBufferViews(gl, desc, buffers);

        // Create images from either bufferViews or separate image files
        const images = this.parseImages(gl, desc, dir, bufferViews);

        const textures = this.parseTextures(gl, desc, images);

        // Just pass through material data for now
        const materials = this.parseMaterials(gl, desc, textures);

        // Fetch the inverse bind matrices for skeleton joints
        const skins = this.parseSkins(gl, desc, bufferViews);

        // Create geometries for each mesh primitive
        const meshes = this.parseMeshes(gl, desc, bufferViews, materials, skins);

        // Create transforms, meshes and hierarchy
        const nodes = this.parseNodes(gl, desc, meshes, skins);

        // Place nodes in skeletons
        this.populateSkins(skins, nodes);

        // Create animation handlers
        const animations = this.parseAnimations(gl, desc, nodes, bufferViews);

        // Get top level nodes for each scene
        const scenes = this.parseScenes(desc, nodes);
        const scene = scenes[desc.scene];

        // Remove null nodes (instanced transforms)
        for (let i = nodes.length; i >= 0; i--) if (!nodes[i]) nodes.splice(i, 1);

        return {
            json: desc,
            buffers,
            bufferViews,
            images,
            textures,
            materials,
            meshes,
            nodes,
            animations,
            scenes,
            scene,
        };
    }

    static async parseDesc(src) {
        if (!src.match(/\.glb$/)) {
            return await fetch(src).then((res) => res.json());
        } else {
            return await fetch(src)
                .then((res) => res.arrayBuffer())
                .then((glb) => this.unpackGLB(glb));
        }
    }

    // From https://github.com/donmccurdy/glTF-Transform/blob/e4108cc/packages/core/src/io/io.ts#L32
    static unpackGLB(glb) {
        // Decode and verify GLB header.
        const header = new Uint32Array(glb, 0, 3);
        if (header[0] !== 0x46546c67) {
            throw new Error('Invalid glTF asset.');
        } else if (header[1] !== 2) {
            throw new Error(`Unsupported glTF binary version, "${header[1]}".`);
        }
        // Decode and verify chunk headers.
        const jsonChunkHeader = new Uint32Array(glb, 12, 2);
        const jsonByteOffset = 20;
        const jsonByteLength = jsonChunkHeader[0];
        if (jsonChunkHeader[1] !== 0x4e4f534a) {
            throw new Error('Unexpected GLB layout.');
        }

        // Decode JSON.
        const jsonText = new TextDecoder().decode(glb.slice(jsonByteOffset, jsonByteOffset + jsonByteLength));
        const json = JSON.parse(jsonText);
        // JSON only
        if (jsonByteOffset + jsonByteLength === glb.byteLength) return json;

        const binaryChunkHeader = new Uint32Array(glb, jsonByteOffset + jsonByteLength, 2);
        if (binaryChunkHeader[1] !== 0x004e4942) {
            throw new Error('Unexpected GLB layout.');
        }
        // Decode content.
        const binaryByteOffset = jsonByteOffset + jsonByteLength + 8;
        const binaryByteLength = binaryChunkHeader[0];
        const binary = glb.slice(binaryByteOffset, binaryByteOffset + binaryByteLength);
        // Attach binary to buffer
        json.buffers[0].binary = binary;
        return json;
    }

    // Threejs GLTF Loader https://github.com/mrdoob/three.js/blob/master/examples/js/loaders/GLTFLoader.js#L1085
    static resolveURI(uri, dir) {
        // Invalid URI
        if (typeof uri !== 'string' || uri === '') return '';

        // Host Relative URI
        if (/^https?:\/\//i.test(dir) && /^\//.test(uri)) {
            dir = dir.replace(/(^https?:\/\/[^\/]+).*/i, '$1');
        }

        // Absolute URI http://, https://, //
        if (/^(https?:)?\/\//i.test(uri)) return uri;

        // Data URI
        if (/^data:.*,.*$/i.test(uri)) return uri;

        // Blob URI
        if (/^blob:.*$/i.test(uri)) return uri;

        // Relative URI
        return dir + uri;
    }

    static async loadBuffers(desc, dir) {
        if (!desc.buffers) return null;
        return await Promise.all(
            desc.buffers.map((buffer) => {
                // For GLB, binary buffer ready to go
                if (buffer.binary) return buffer.binary;
                const uri = this.resolveURI(buffer.uri, dir);
                return fetch(uri).then((res) => res.arrayBuffer());
            })
        );
    }

    static parseBufferViews(gl, desc, buffers) {
        if (!desc.bufferViews) return null;
        // Clone to leave description pure
        const bufferViews = desc.bufferViews.map((o) => Object.assign({}, o));

        desc.meshes &&
            desc.meshes.forEach(({ primitives }) => {
                primitives.forEach(({ attributes, indices }) => {
                    // Flag bufferView as an attribute, so it knows to create a gl buffer
                    for (let attr in attributes) bufferViews[desc.accessors[attributes[attr]].bufferView].isAttribute = true;

                    if (indices === undefined) return;
                    bufferViews[desc.accessors[indices].bufferView].isAttribute = true;

                    // Make sure indices bufferView have a target property for gl buffer binding
                    bufferViews[desc.accessors[indices].bufferView].target = gl.ELEMENT_ARRAY_BUFFER;
                });
            });

        // Get componentType of each bufferView from the accessors
        desc.accessors.forEach(({ bufferView: i, componentType }) => {
            bufferViews[i].componentType = componentType;
        });

        // Get mimetype of bufferView from images
        desc.images &&
            desc.images.forEach(({ uri, bufferView: i, mimeType }) => {
                if (i === undefined) return;
                bufferViews[i].mimeType = mimeType;
            });

        // Push each bufferView to the GPU as a separate buffer
        bufferViews.forEach(
            (
                {
                    buffer: bufferIndex, // required
                    byteOffset = 0, // optional
                    byteLength, // required
                    byteStride, // optional
                    target = gl.ARRAY_BUFFER, // optional, added above for elements
                    name, // optional
                    extensions, // optional
                    extras, // optional

                    componentType, // optional, added from accessor above
                    mimeType, // optional, added from images above
                    isAttribute,
                },
                i
            ) => {
                const TypeArray = TYPE_ARRAY[componentType || mimeType];
                const elementBytes = TypeArray.BYTES_PER_ELEMENT;

                const data = new TypeArray(buffers[bufferIndex], byteOffset, byteLength / elementBytes);
                bufferViews[i].data = data;
                bufferViews[i].originalBuffer = buffers[bufferIndex];

                if (!isAttribute) return;
                // Create gl buffers for the bufferView, pushing it to the GPU
                const buffer = gl.createBuffer();
                gl.bindBuffer(target, buffer);
                gl.renderer.state.boundBuffer = buffer;
                gl.bufferData(target, data, gl.STATIC_DRAW);
                bufferViews[i].buffer = buffer;
            }
        );

        return bufferViews;
    }

    static parseImages(gl, desc, dir, bufferViews) {
        if (!desc.images) return null;
        return desc.images.map(({ uri, bufferView: bufferViewIndex, mimeType, name }) => {
            const image = new Image();
            image.name = name;
            if (uri) {
                image.src = this.resolveURI(uri, dir);
            } else if (bufferViewIndex !== undefined) {
                const { data } = bufferViews[bufferViewIndex];
                const blob = new Blob([data], { type: mimeType });
                image.src = URL.createObjectURL(blob);
            }
            image.ready = new Promise((res) => {
                image.onload = () => res();
            });
            return image;
        });
    }

    static parseTextures(gl, desc, images) {
        if (!desc.textures) return null;
        return desc.textures.map(({ sampler: samplerIndex, source: sourceIndex, name, extensions, extras }) => {
            const options = {
                flipY: false,
                wrapS: gl.REPEAT, // Repeat by default, opposed to OGL's clamp by default
                wrapT: gl.REPEAT,
            };
            const sampler = samplerIndex !== undefined ? desc.samplers[samplerIndex] : null;
            if (sampler) {
                ['magFilter', 'minFilter', 'wrapS', 'wrapT'].forEach((prop) => {
                    if (sampler[prop]) options[prop] = sampler[prop];
                });
            }
            const texture = new _core_Texture_js__WEBPACK_IMPORTED_MODULE_0__.Texture(gl, options);
            texture.name = name;
            const image = images[sourceIndex];
            image.ready.then(() => (texture.image = image));

            return texture;
        });
    }

    static parseMaterials(gl, desc, textures) {
        if (!desc.materials) return null;
        return desc.materials.map(
            ({
                name,
                extensions,
                extras,
                pbrMetallicRoughness = {},
                normalTexture,
                occlusionTexture,
                emissiveTexture,
                emissiveFactor = [0, 0, 0],
                alphaMode = 'OPAQUE',
                alphaCutoff = 0.5,
                doubleSided = false,
            }) => {
                const {
                    baseColorFactor = [1, 1, 1, 1],
                    baseColorTexture,
                    metallicFactor = 1,
                    roughnessFactor = 1,
                    metallicRoughnessTexture,
                    //   extensions,
                    //   extras,
                } = pbrMetallicRoughness;

                if (baseColorTexture) {
                    baseColorTexture.texture = textures[baseColorTexture.index];
                    // texCoord
                }
                if (normalTexture) {
                    normalTexture.texture = textures[normalTexture.index];
                    // scale: 1
                    // texCoord
                }
                if (metallicRoughnessTexture) {
                    metallicRoughnessTexture.texture = textures[metallicRoughnessTexture.index];
                    // texCoord
                }
                if (occlusionTexture) {
                    occlusionTexture.texture = textures[occlusionTexture.index];
                    // strength 1
                    // texCoord
                }
                if (emissiveTexture) {
                    emissiveTexture.texture = textures[emissiveTexture.index];
                    // texCoord
                }

                return {
                    name,
                    baseColorFactor,
                    baseColorTexture,
                    metallicFactor,
                    roughnessFactor,
                    metallicRoughnessTexture,
                    normalTexture,
                    occlusionTexture,
                    emissiveTexture,
                    emissiveFactor,
                    alphaMode,
                    alphaCutoff,
                    doubleSided,
                };
            }
        );
    }

    static parseSkins(gl, desc, bufferViews) {
        if (!desc.skins) return null;
        return desc.skins.map(
            ({
                inverseBindMatrices, // optional
                skeleton, // optional
                joints, // required
                // name,
                // extensions,
                // extras,
            }) => {
                return {
                    inverseBindMatrices: this.parseAccessor(inverseBindMatrices, desc, bufferViews),
                    skeleton,
                    joints,
                };
            }
        );
    }

    static parseMeshes(gl, desc, bufferViews, materials, skins) {
        if (!desc.meshes) return null;
        return desc.meshes.map(
            (
                {
                    primitives, // required
                    weights, // optional
                    name, // optional
                    extensions, // optional
                    extras, // optional
                },
                meshIndex
            ) => {
                // TODO: weights stuff ?
                // Parse through nodes to see how many instances there are
                // and if there is a skin attached
                let numInstances = 0;
                let skinIndex = false;
                desc.nodes &&
                    desc.nodes.forEach(({ mesh, skin }) => {
                        if (mesh === meshIndex) {
                            numInstances++;
                            if (skin !== undefined) skinIndex = skin;
                        }
                    });

                primitives = this.parsePrimitives(gl, primitives, desc, bufferViews, materials, numInstances).map(({ geometry, program, mode }) => {
                    // Create either skinned mesh or regular mesh
                    const mesh =
                        typeof skinIndex === 'number'
                            ? new _GLTFSkin_js__WEBPACK_IMPORTED_MODULE_1__.GLTFSkin(gl, { skeleton: skins[skinIndex], geometry, program, mode })
                            : new _core_Mesh_js__WEBPACK_IMPORTED_MODULE_2__.Mesh(gl, { geometry, program, mode });
                    mesh.name = name;
                    if (mesh.geometry.isInstanced) {
                        // Tag mesh so that nodes can add their transforms to the instance attribute
                        mesh.numInstances = numInstances;
                        // Avoid incorrect culling for instances
                        mesh.frustumCulled = false;
                    }
                    return mesh;
                });

                return {
                    primitives,
                    weights,
                    name,
                };
            }
        );
    }

    static parsePrimitives(gl, primitives, desc, bufferViews, materials, numInstances) {
        return primitives.map(
            ({
                attributes, // required
                indices, // optional
                material: materialIndex, // optional
                mode = 4, // optional
                targets, // optional
                extensions, // optional
                extras, // optional
            }) => {
                const geometry = new _core_Geometry_js__WEBPACK_IMPORTED_MODULE_3__.Geometry(gl);

                // Add each attribute found in primitive
                for (let attr in attributes) {
                    geometry.addAttribute(ATTRIBUTES[attr], this.parseAccessor(attributes[attr], desc, bufferViews));
                }

                // Add index attribute if found
                if (indices !== undefined) {
                    geometry.addAttribute('index', this.parseAccessor(indices, desc, bufferViews));
                }

                // Add instanced transform attribute if multiple instances
                if (numInstances > 1) {
                    geometry.addAttribute('instanceMatrix', {
                        instanced: 1,
                        size: 16,
                        data: new Float32Array(numInstances * 16),
                    });
                }

                // TODO: materials
                const program = new _NormalProgram_js__WEBPACK_IMPORTED_MODULE_4__.NormalProgram(gl);
                if (materialIndex !== undefined) {
                    program.gltfMaterial = materials[materialIndex];
                }

                return {
                    geometry,
                    program,
                    mode,
                };
            }
        );
    }

    static parseAccessor(index, desc, bufferViews) {
        // TODO: init missing bufferView with 0s
        // TODO: support sparse

        const {
            bufferView: bufferViewIndex, // optional
            byteOffset = 0, // optional
            componentType, // required
            normalized = false, // optional
            count, // required
            type, // required
            min, // optional
            max, // optional
            sparse, // optional
            // name, // optional
            // extensions, // optional
            // extras, // optional
        } = desc.accessors[index];

        const {
            data, // attached in parseBufferViews
            originalBuffer, // attached in parseBufferViews
            buffer, // replaced to be the actual GL buffer
            byteOffset: bufferByteOffset = 0,
            // byteLength, // applied in parseBufferViews
            byteStride = 0,
            target,
            // name,
            // extensions,
            // extras,
        } = bufferViews[bufferViewIndex];

        const size = TYPE_SIZE[type];

        // Parse data from joined buffers
        const TypeArray = TYPE_ARRAY[componentType];
        const elementBytes = data.BYTES_PER_ELEMENT;
        const componentOffset = byteOffset / elementBytes;
        const componentStride = byteStride / elementBytes;
        const isInterleaved = !!byteStride && componentStride !== size;

        // TODO: interleaved
        const newData = isInterleaved ? data : new TypeArray(originalBuffer, byteOffset + bufferByteOffset, count * size);

        // Return attribute data
        return {
            data: newData,
            size,
            type: componentType,
            normalized,
            buffer,
            stride: byteStride,
            offset: byteOffset,
            count,
            min,
            max,
        };
    }

    static parseNodes(gl, desc, meshes, skins) {
        if (!desc.nodes) return null;
        const nodes = desc.nodes.map(
            ({
                camera, // optional
                children, // optional
                skin: skinIndex, // optional
                matrix, // optional
                mesh: meshIndex, // optional
                rotation, // optional
                scale, // optional
                translation, // optional
                weights, // optional
                name, // optional
                extensions, // optional
                extras, // optional
            }) => {
                const node = new _core_Transform_js__WEBPACK_IMPORTED_MODULE_5__.Transform();
                if (name) node.name = name;

                // Apply transformations
                if (matrix) {
                    node.matrix.copy(matrix);
                    node.decompose();
                } else {
                    if (rotation) node.quaternion.copy(rotation);
                    if (scale) node.scale.copy(scale);
                    if (translation) node.position.copy(translation);
                    node.updateMatrix();
                }

                // Flags for avoiding duplicate transforms and removing unused instance nodes
                let isInstanced = false;
                let isFirstInstance = true;

                // add mesh if included
                if (meshIndex !== undefined) {
                    meshes[meshIndex].primitives.forEach((mesh) => {
                        if (mesh.geometry.isInstanced) {
                            isInstanced = true;
                            if (!mesh.instanceCount) {
                                mesh.instanceCount = 0;
                            } else {
                                isFirstInstance = false;
                            }
                            node.matrix.toArray(mesh.geometry.attributes.instanceMatrix.data, mesh.instanceCount * 16);
                            mesh.instanceCount++;

                            if (mesh.instanceCount === mesh.numInstances) {
                                // Remove properties once all instances added
                                delete mesh.numInstances;
                                delete mesh.instanceCount;
                                // Flag attribute as dirty
                                mesh.geometry.attributes.instanceMatrix.needsUpdate = true;
                            }
                        }

                        // For instances, only the first node will actually have the mesh
                        if (isInstanced) {
                            if (isFirstInstance) mesh.setParent(node);
                        } else {
                            mesh.setParent(node);
                        }
                    });
                }

                // Reset node if instanced to not duplicate transforms
                if (isInstanced) {
                    // Remove unused nodes just providing an instance transform
                    if (!isFirstInstance) return null;
                    // Avoid duplicate transform for node containing the instanced mesh
                    node.matrix.identity();
                    node.decompose();
                }

                return node;
            }
        );

        desc.nodes.forEach(({ children = [] }, i) => {
            // Set hierarchy now all nodes created
            children.forEach((childIndex) => {
                if (!nodes[childIndex]) return;
                nodes[childIndex].setParent(nodes[i]);
            });
        });

        return nodes;
    }

    static populateSkins(skins, nodes) {
        if (!skins) return;
        skins.forEach((skin) => {
            skin.joints = skin.joints.map((i, index) => {
                const joint = nodes[i];
                joint.bindInverse = new _math_Mat4_js__WEBPACK_IMPORTED_MODULE_6__.Mat4(...skin.inverseBindMatrices.data.slice(index * 16, (index + 1) * 16));
                return joint;
            });
            if (skin.skeleton) skin.skeleton = nodes[skin.skeleton];
        });
    }

    static parseAnimations(gl, desc, nodes, bufferViews) {
        if (!desc.animations) return null;
        return desc.animations.map(
            ({
                channels, // required
                samplers, // required
                name, // optional
                // extensions, // optional
                // extras,  // optional
            }) => {
                const data = channels.map(
                    ({
                        sampler: samplerIndex, // required
                        target, // required
                        // extensions, // optional
                        // extras, // optional
                    }) => {
                        const {
                            input: inputIndex, // required
                            interpolation = 'LINEAR',
                            output: outputIndex, // required
                            // extensions, // optional
                            // extras, // optional
                        } = samplers[samplerIndex];

                        const {
                            node: nodeIndex, // optional - TODO: when is it not included?
                            path, // required
                            // extensions, // optional
                            // extras, // optional
                        } = target;

                        const node = nodes[nodeIndex];
                        const transform = TRANSFORMS[path];
                        const times = this.parseAccessor(inputIndex, desc, bufferViews).data;
                        const values = this.parseAccessor(outputIndex, desc, bufferViews).data;

                        return {
                            node,
                            transform,
                            interpolation,
                            times,
                            values,
                        };
                    }
                );

                return {
                    name,
                    animation: new _GLTFAnimation_js__WEBPACK_IMPORTED_MODULE_7__.GLTFAnimation(data),
                };
            }
        );
    }

    static parseScenes(desc, nodes) {
        if (!desc.scenes) return null;
        return desc.scenes.map(
            ({
                nodes: nodesIndices = [],
                name, // optional
                extensions,
                extras,
            }) => {
                return nodesIndices.reduce((map, i) => {
                    // Don't add null nodes (instanced transforms)
                    if (nodes[i]) map.push(nodes[i]);
                    return map;
                }, []);
            }
        );
    }
}


/***/ }),

/***/ "./src/extras/GLTFSkin.js":
/*!********************************!*\
  !*** ./src/extras/GLTFSkin.js ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "GLTFSkin": () => (/* binding */ GLTFSkin)
/* harmony export */ });
/* harmony import */ var _core_Mesh_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../core/Mesh.js */ "./src/core/Mesh.js");
/* harmony import */ var _math_Mat4_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../math/Mat4.js */ "./src/math/Mat4.js");
/* harmony import */ var _core_Texture_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../core/Texture.js */ "./src/core/Texture.js");




const tempMat4 = new _math_Mat4_js__WEBPACK_IMPORTED_MODULE_0__.Mat4();
const identity = new _math_Mat4_js__WEBPACK_IMPORTED_MODULE_0__.Mat4();

class GLTFSkin extends _core_Mesh_js__WEBPACK_IMPORTED_MODULE_1__.Mesh {
    constructor(gl, { skeleton, geometry, program, mode = gl.TRIANGLES } = {}) {
        super(gl, { geometry, program, mode });
        this.skeleton = skeleton;
        this.program = program;
        this.createBoneTexture();
        this.animations = [];
    }

    createBoneTexture() {
        if (!this.skeleton.joints.length) return;
        const size = Math.max(4, Math.pow(2, Math.ceil(Math.log(Math.sqrt(this.skeleton.joints.length * 4)) / Math.LN2)));
        this.boneMatrices = new Float32Array(size * size * 4);
        this.boneTextureSize = size;
        this.boneTexture = new _core_Texture_js__WEBPACK_IMPORTED_MODULE_2__.Texture(this.gl, {
            image: this.boneMatrices,
            generateMipmaps: false,
            type: this.gl.FLOAT,
            internalFormat: this.gl.renderer.isWebgl2 ? this.gl.RGBA32F : this.gl.RGBA,
            minFilter: this.gl.NEAREST,
            magFilter: this.gl.NEAREST,
            flipY: false,
            width: size,
        });
    }

    // addAnimation(data) {
    //     const animation = new Animation({ objects: this.bones, data });
    //     this.animations.push(animation);
    //     return animation;
    // }

    // updateAnimations() {
    //     // Calculate combined animation weight
    //     let total = 0;
    //     this.animations.forEach((animation) => (total += animation.weight));

    //     this.animations.forEach((animation, i) => {
    //         // force first animation to set in order to reset frame
    //         animation.update(total, i === 0);
    //     });
    // }

    updateUniforms() {
        // Update bone texture
        this.skeleton.joints.forEach((bone, i) => {
            // Find difference between current and bind pose
            tempMat4.multiply(bone.worldMatrix, bone.bindInverse);
            this.boneMatrices.set(tempMat4, i * 16);
        });
        if (this.boneTexture) this.boneTexture.needsUpdate = true;
    }

    draw({ camera } = {}) {
        if (!this.program.uniforms.boneTexture) {
            Object.assign(this.program.uniforms, {
                boneTexture: { value: this.boneTexture },
                boneTextureSize: { value: this.boneTextureSize },
            });
        }

        this.updateUniforms();

        // Switch the world matrix with identity to ignore any transforms
        // on the mesh itself - only use skeleton's transforms
        const _worldMatrix = this.worldMatrix;
        this.worldMatrix = identity;

        super.draw({ camera });

        // Switch back to leave identity untouched
        this.worldMatrix = _worldMatrix;
    }
}


/***/ }),

/***/ "./src/extras/GPGPU.js":
/*!*****************************!*\
  !*** ./src/extras/GPGPU.js ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "GPGPU": () => (/* binding */ GPGPU)
/* harmony export */ });
/* harmony import */ var _core_Program_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../core/Program.js */ "./src/core/Program.js");
/* harmony import */ var _core_Mesh_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../core/Mesh.js */ "./src/core/Mesh.js");
/* harmony import */ var _core_Texture_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../core/Texture.js */ "./src/core/Texture.js");
/* harmony import */ var _core_RenderTarget_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../core/RenderTarget.js */ "./src/core/RenderTarget.js");
/* harmony import */ var _Triangle_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Triangle.js */ "./src/extras/Triangle.js");






class GPGPU {
    constructor(
        gl,
        {
            // Always pass in array of vec4s (RGBA values within texture)
            data = new Float32Array(16),
            geometry = new _Triangle_js__WEBPACK_IMPORTED_MODULE_0__.Triangle(gl),
            type, // Pass in gl.FLOAT to force it, defaults to gl.HALF_FLOAT
        }
    ) {
        this.gl = gl;
        const initialData = data;
        this.passes = [];
        this.geometry = geometry;
        this.dataLength = initialData.length / 4;

        // Windows and iOS only like power of 2 textures
        // Find smallest PO2 that fits data
        this.size = Math.pow(2, Math.ceil(Math.log(Math.ceil(Math.sqrt(this.dataLength))) / Math.LN2));

        // Create coords for output texture
        this.coords = new Float32Array(this.dataLength * 2);
        for (let i = 0; i < this.dataLength; i++) {
            const x = (i % this.size) / this.size; // to add 0.5 to be center pixel ?
            const y = Math.floor(i / this.size) / this.size;
            this.coords.set([x, y], i * 2);
        }

        // Use original data if already correct length of PO2 texture, else copy to new array of correct length
        const floatArray = (() => {
            if (initialData.length === this.size * this.size * 4) {
                return initialData;
            } else {
                const a = new Float32Array(this.size * this.size * 4);
                a.set(initialData);
                return a;
            }
        })();

        // Create output texture uniform using input float texture with initial data
        this.uniform = {
            value: new _core_Texture_js__WEBPACK_IMPORTED_MODULE_1__.Texture(gl, {
                image: floatArray,
                target: gl.TEXTURE_2D,
                type: gl.FLOAT,
                format: gl.RGBA,
                internalFormat: gl.renderer.isWebgl2 ? gl.RGBA32F : gl.RGBA,
                wrapS: gl.CLAMP_TO_EDGE,
                wrapT: gl.CLAMP_TO_EDGE,
                generateMipmaps: false,
                minFilter: gl.NEAREST,
                magFilter: gl.NEAREST,
                width: this.size,
                flipY: false,
            }),
        };

        // Create FBOs
        const options = {
            width: this.size,
            height: this.size,
            type: type || gl.HALF_FLOAT || gl.renderer.extensions['OES_texture_half_float'].HALF_FLOAT_OES,
            format: gl.RGBA,
            internalFormat: gl.renderer.isWebgl2 ? (type === gl.FLOAT ? gl.RGBA32F : gl.RGBA16F) : gl.RGBA,
            minFilter: gl.NEAREST,
            depth: false,
            unpackAlignment: 1,
        };

        this.fbo = {
            read: new _core_RenderTarget_js__WEBPACK_IMPORTED_MODULE_2__.RenderTarget(gl, options),
            write: new _core_RenderTarget_js__WEBPACK_IMPORTED_MODULE_2__.RenderTarget(gl, options),
            swap: () => {
                let temp = this.fbo.read;
                this.fbo.read = this.fbo.write;
                this.fbo.write = temp;
                this.uniform.value = this.fbo.read.texture;
            },
        };
    }

    addPass({ vertex = defaultVertex, fragment = defaultFragment, uniforms = {}, textureUniform = 'tMap', enabled = true } = {}) {
        uniforms[textureUniform] = this.uniform;
        const program = new _core_Program_js__WEBPACK_IMPORTED_MODULE_3__.Program(this.gl, { vertex, fragment, uniforms });
        const mesh = new _core_Mesh_js__WEBPACK_IMPORTED_MODULE_4__.Mesh(this.gl, { geometry: this.geometry, program });

        const pass = {
            mesh,
            program,
            uniforms,
            enabled,
            textureUniform,
        };

        this.passes.push(pass);
        return pass;
    }

    render() {
        const enabledPasses = this.passes.filter((pass) => pass.enabled);

        enabledPasses.forEach((pass, i) => {
            this.gl.renderer.render({
                scene: pass.mesh,
                target: this.fbo.write,
                clear: false,
            });
            this.fbo.swap();
        });
    }
}

const defaultVertex = /* glsl */ `
    attribute vec2 uv;
    attribute vec2 position;

    varying vec2 vUv;

    void main() {
        vUv = uv;
        gl_Position = vec4(position, 0, 1);
    }
`;

const defaultFragment = /* glsl */ `
    precision highp float;

    uniform sampler2D tMap;
    varying vec2 vUv;

    void main() {
        gl_FragColor = texture2D(tMap, vUv);
    }
`;


/***/ }),

/***/ "./src/extras/KTXTexture.js":
/*!**********************************!*\
  !*** ./src/extras/KTXTexture.js ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "KTXTexture": () => (/* binding */ KTXTexture)
/* harmony export */ });
/* harmony import */ var _core_Texture_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../core/Texture.js */ "./src/core/Texture.js");


// TODO: Support cubemaps
// Generate textures using https://github.com/TimvanScherpenzeel/texture-compressor

class KTXTexture extends _core_Texture_js__WEBPACK_IMPORTED_MODULE_0__.Texture {
    constructor(gl, { buffer, wrapS = gl.CLAMP_TO_EDGE, wrapT = gl.CLAMP_TO_EDGE, anisotropy = 0, minFilter, magFilter } = {}) {
        super(gl, {
            generateMipmaps: false,
            wrapS,
            wrapT,
            anisotropy,
            minFilter,
            magFilter,
        });

        if (buffer) return this.parseBuffer(buffer);
    }

    parseBuffer(buffer) {
        const ktx = new KhronosTextureContainer(buffer);
        ktx.mipmaps.isCompressedTexture = true;

        // Update texture
        this.image = ktx.mipmaps;
        this.internalFormat = ktx.glInternalFormat;
        if (ktx.numberOfMipmapLevels > 1) {
            if (this.minFilter === this.gl.LINEAR) this.minFilter = this.gl.NEAREST_MIPMAP_LINEAR;
        } else {
            if (this.minFilter === this.gl.NEAREST_MIPMAP_LINEAR) this.minFilter = this.gl.LINEAR;
        }

        // TODO: support cube maps
        // ktx.numberOfFaces
    }
}

function KhronosTextureContainer(buffer) {
    const idCheck = [0xab, 0x4b, 0x54, 0x58, 0x20, 0x31, 0x31, 0xbb, 0x0d, 0x0a, 0x1a, 0x0a];
    const id = new Uint8Array(buffer, 0, 12);
    for (let i = 0; i < id.length; i++) if (id[i] !== idCheck[i]) return console.error('File missing KTX identifier');

    // TODO: Is this always 4? Tested: [android, macos]
    const size = Uint32Array.BYTES_PER_ELEMENT;
    const head = new DataView(buffer, 12, 13 * size);
    const littleEndian = head.getUint32(0, true) === 0x04030201;
    const glType = head.getUint32(1 * size, littleEndian);
    if (glType !== 0) return console.warn('only compressed formats currently supported');
    this.glInternalFormat = head.getUint32(4 * size, littleEndian);
    let width = head.getUint32(6 * size, littleEndian);
    let height = head.getUint32(7 * size, littleEndian);
    this.numberOfFaces = head.getUint32(10 * size, littleEndian);
    this.numberOfMipmapLevels = Math.max(1, head.getUint32(11 * size, littleEndian));
    const bytesOfKeyValueData = head.getUint32(12 * size, littleEndian);

    this.mipmaps = [];
    let offset = 12 + 13 * 4 + bytesOfKeyValueData;
    for (let level = 0; level < this.numberOfMipmapLevels; level++) {
        const levelSize = new Int32Array(buffer, offset, 1)[0]; // size per face, since not supporting array cubemaps
        offset += 4; // levelSize field
        for (let face = 0; face < this.numberOfFaces; face++) {
            const data = new Uint8Array(buffer, offset, levelSize);
            this.mipmaps.push({ data, width, height });
            offset += levelSize;
            offset += 3 - ((levelSize + 3) % 4); // add padding for odd sized image
        }
        width = width >> 1;
        height = height >> 1;
    }
}


/***/ }),

/***/ "./src/extras/NormalProgram.js":
/*!*************************************!*\
  !*** ./src/extras/NormalProgram.js ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "NormalProgram": () => (/* binding */ NormalProgram)
/* harmony export */ });
/* harmony import */ var _core_Program_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../core/Program.js */ "./src/core/Program.js");


const vertex = /* glsl */ `
    precision highp float;
    precision highp int;

    attribute vec3 position;
    attribute vec3 normal;

    uniform mat3 normalMatrix;
    uniform mat4 modelViewMatrix;
    uniform mat4 projectionMatrix;

    varying vec3 vNormal;

    void main() {
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

const fragment = /* glsl */ `
    precision highp float;
    precision highp int;

    varying vec3 vNormal;

    void main() {
        gl_FragColor.rgb = normalize(vNormal);
        gl_FragColor.a = 1.0;
    }
`;

function NormalProgram(gl) {
    return new _core_Program_js__WEBPACK_IMPORTED_MODULE_0__.Program(gl, {
        vertex: vertex,
        fragment: fragment,
        cullFace: null,
    });
}


/***/ }),

/***/ "./src/extras/Orbit.js":
/*!*****************************!*\
  !*** ./src/extras/Orbit.js ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Orbit": () => (/* binding */ Orbit)
/* harmony export */ });
/* harmony import */ var _math_Vec3_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../math/Vec3.js */ "./src/math/Vec3.js");
/* harmony import */ var _math_Vec2_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../math/Vec2.js */ "./src/math/Vec2.js");
// Based from ThreeJS' OrbitControls class, rewritten using es6 with some additions and subtractions.
// TODO: abstract event handlers so can be fed from other sources
// TODO: make scroll zoom more accurate than just >/< zero
// TODO: be able to pass in new camera position




const STATE = { NONE: -1, ROTATE: 0, DOLLY: 1, PAN: 2, DOLLY_PAN: 3 };
const tempVec3 = new _math_Vec3_js__WEBPACK_IMPORTED_MODULE_0__.Vec3();
const tempVec2a = new _math_Vec2_js__WEBPACK_IMPORTED_MODULE_1__.Vec2();
const tempVec2b = new _math_Vec2_js__WEBPACK_IMPORTED_MODULE_1__.Vec2();

function Orbit(
    object,
    {
        element = document,
        enabled = true,
        target = new _math_Vec3_js__WEBPACK_IMPORTED_MODULE_0__.Vec3(),
        ease = 0.25,
        inertia = 0.85,
        enableRotate = true,
        rotateSpeed = 0.1,
        autoRotate = false,
        autoRotateSpeed = 1.0,
        enableZoom = true,
        zoomSpeed = 1,
        enablePan = true,
        panSpeed = 0.1,
        minPolarAngle = 0,
        maxPolarAngle = Math.PI,
        minAzimuthAngle = -Infinity,
        maxAzimuthAngle = Infinity,
        minDistance = 0,
        maxDistance = Infinity,
    } = {}
) {
    this.enabled = enabled;
    this.target = target;
    this.rotateSpeed = rotateSpeed;
    this.panSpeed = panSpeed;
    // Catch attempts to disable - set to 1 so has no effect
    ease = ease || 1;
    inertia = inertia || 0;

    this.minDistance = minDistance;
    this.maxDistance = maxDistance;

    // current position in sphericalTarget coordinates
    const sphericalDelta = { radius: 1, phi: 0, theta: 0 };
    const sphericalTarget = { radius: 1, phi: 0, theta: 0 };
    const spherical = { radius: 1, phi: 0, theta: 0 };
    const panDelta = new _math_Vec3_js__WEBPACK_IMPORTED_MODULE_0__.Vec3();

    // Grab initial position values
    const offset = new _math_Vec3_js__WEBPACK_IMPORTED_MODULE_0__.Vec3();
    offset.copy(object.position).sub(this.target);
    spherical.radius = sphericalTarget.radius = offset.distance();
    spherical.theta = sphericalTarget.theta = Math.atan2(offset.x, offset.z);
    spherical.phi = sphericalTarget.phi = Math.acos(Math.min(Math.max(offset.y / sphericalTarget.radius, -1), 1));

    this.offset = offset;

    this.update = () => {
        if (autoRotate) {
            handleAutoRotate();
        }

        // apply delta
        sphericalTarget.radius *= sphericalDelta.radius;
        sphericalTarget.theta += sphericalDelta.theta;
        sphericalTarget.phi += sphericalDelta.phi;

        // apply boundaries
        sphericalTarget.theta = Math.max(minAzimuthAngle, Math.min(maxAzimuthAngle, sphericalTarget.theta));
        sphericalTarget.phi = Math.max(minPolarAngle, Math.min(maxPolarAngle, sphericalTarget.phi));
        sphericalTarget.radius = Math.max(this.minDistance, Math.min(this.maxDistance, sphericalTarget.radius));

        // ease values
        spherical.phi += (sphericalTarget.phi - spherical.phi) * ease;
        spherical.theta += (sphericalTarget.theta - spherical.theta) * ease;
        spherical.radius += (sphericalTarget.radius - spherical.radius) * ease;

        // apply pan to target. As offset is relative to target, it also shifts
        this.target.add(panDelta);

        // apply rotation to offset
        let sinPhiRadius = spherical.radius * Math.sin(Math.max(0.000001, spherical.phi));
        offset.x = sinPhiRadius * Math.sin(spherical.theta);
        offset.y = spherical.radius * Math.cos(spherical.phi);
        offset.z = sinPhiRadius * Math.cos(spherical.theta);

        // Apply updated values to object
        object.position.copy(this.target).add(offset);
        object.lookAt(this.target);

        // Apply inertia to values
        sphericalDelta.theta *= inertia;
        sphericalDelta.phi *= inertia;
        panDelta.multiply(inertia);

        // Reset scale every frame to avoid applying scale multiple times
        sphericalDelta.radius = 1;
    };

    // Updates internals with new position
    this.forcePosition = () => {
        offset.copy(object.position).sub(this.target);
        spherical.radius = sphericalTarget.radius = offset.distance();
        spherical.theta = sphericalTarget.theta = Math.atan2(offset.x, offset.z);
        spherical.phi = sphericalTarget.phi = Math.acos(Math.min(Math.max(offset.y / sphericalTarget.radius, -1), 1));
        object.lookAt(this.target);
    };

    // Everything below here just updates panDelta and sphericalDelta
    // Using those two objects' values, the orbit is calculated

    const rotateStart = new _math_Vec2_js__WEBPACK_IMPORTED_MODULE_1__.Vec2();
    const panStart = new _math_Vec2_js__WEBPACK_IMPORTED_MODULE_1__.Vec2();
    const dollyStart = new _math_Vec2_js__WEBPACK_IMPORTED_MODULE_1__.Vec2();

    let state = STATE.NONE;
    this.mouseButtons = { ORBIT: 0, ZOOM: 1, PAN: 2 };

    function getZoomScale() {
        return Math.pow(0.95, zoomSpeed);
    }

    function panLeft(distance, m) {
        tempVec3.set(m[0], m[1], m[2]);
        tempVec3.multiply(-distance);
        panDelta.add(tempVec3);
    }

    function panUp(distance, m) {
        tempVec3.set(m[4], m[5], m[6]);
        tempVec3.multiply(distance);
        panDelta.add(tempVec3);
    }

    const pan = (deltaX, deltaY) => {
        let el = element === document ? document.body : element;
        tempVec3.copy(object.position).sub(this.target);
        let targetDistance = tempVec3.distance();
        targetDistance *= Math.tan((((object.fov || 45) / 2) * Math.PI) / 180.0);
        panLeft((2 * deltaX * targetDistance) / el.clientHeight, object.matrix);
        panUp((2 * deltaY * targetDistance) / el.clientHeight, object.matrix);
    };

    function dolly(dollyScale) {
        sphericalDelta.radius /= dollyScale;
    }

    function handleAutoRotate() {
        const angle = ((2 * Math.PI) / 60 / 60) * autoRotateSpeed;
        sphericalDelta.theta -= angle;
    }

    let handleMoveRotate = (x, y) => {
        tempVec2a.set(x, y);
        tempVec2b.sub(tempVec2a, rotateStart).multiply(this.rotateSpeed);
        let el = element === document ? document.body : element;
        sphericalDelta.theta -= (2 * Math.PI * tempVec2b.x) / el.clientHeight;
        sphericalDelta.phi -= (2 * Math.PI * tempVec2b.y) / el.clientHeight;
        rotateStart.copy(tempVec2a);
    }

    function handleMouseMoveDolly(e) {
        tempVec2a.set(e.clientX, e.clientY);
        tempVec2b.sub(tempVec2a, dollyStart);
        if (tempVec2b.y > 0) {
            dolly(getZoomScale());
        } else if (tempVec2b.y < 0) {
            dolly(1 / getZoomScale());
        }
        dollyStart.copy(tempVec2a);
    }

    let handleMovePan = (x, y) => {
        tempVec2a.set(x, y);
        tempVec2b.sub(tempVec2a, panStart).multiply(this.panSpeed);
        pan(tempVec2b.x, tempVec2b.y);
        panStart.copy(tempVec2a);
    }

    function handleTouchStartDollyPan(e) {
        if (enableZoom) {
            let dx = e.touches[0].pageX - e.touches[1].pageX;
            let dy = e.touches[0].pageY - e.touches[1].pageY;
            let distance = Math.sqrt(dx * dx + dy * dy);
            dollyStart.set(0, distance);
        }

        if (enablePan) {
            let x = 0.5 * (e.touches[0].pageX + e.touches[1].pageX);
            let y = 0.5 * (e.touches[0].pageY + e.touches[1].pageY);
            panStart.set(x, y);
        }
    }

    function handleTouchMoveDollyPan(e) {
        if (enableZoom) {
            let dx = e.touches[0].pageX - e.touches[1].pageX;
            let dy = e.touches[0].pageY - e.touches[1].pageY;
            let distance = Math.sqrt(dx * dx + dy * dy);
            tempVec2a.set(0, distance);
            tempVec2b.set(0, Math.pow(tempVec2a.y / dollyStart.y, zoomSpeed));
            dolly(tempVec2b.y);
            dollyStart.copy(tempVec2a);
        }

        if (enablePan) {
            let x = 0.5 * (e.touches[0].pageX + e.touches[1].pageX);
            let y = 0.5 * (e.touches[0].pageY + e.touches[1].pageY);
            handleMovePan(x, y);
        }
    }

    const onMouseDown = (e) => {
        if (!this.enabled) return;

        switch (e.button) {
            case this.mouseButtons.ORBIT:
                if (enableRotate === false) return;
                rotateStart.set(e.clientX, e.clientY);
                state = STATE.ROTATE;
                break;
            case this.mouseButtons.ZOOM:
                if (enableZoom === false) return;
                dollyStart.set(e.clientX, e.clientY);
                state = STATE.DOLLY;
                break;
            case this.mouseButtons.PAN:
                if (enablePan === false) return;
                panStart.set(e.clientX, e.clientY);
                state = STATE.PAN;
                break;
        }

        if (state !== STATE.NONE) {
            window.addEventListener('mousemove', onMouseMove, false);
            window.addEventListener('mouseup', onMouseUp, false);
        }
    };

    const onMouseMove = (e) => {
        if (!this.enabled) return;

        switch (state) {
            case STATE.ROTATE:
                if (enableRotate === false) return;
                handleMoveRotate(e.clientX, e.clientY);
                break;
            case STATE.DOLLY:
                if (enableZoom === false) return;
                handleMouseMoveDolly(e);
                break;
            case STATE.PAN:
                if (enablePan === false) return;
                handleMovePan(e.clientX, e.clientY);
                break;
        }
    };

    const onMouseUp = () => {
        window.removeEventListener('mousemove', onMouseMove, false);
        window.removeEventListener('mouseup', onMouseUp, false);
        state = STATE.NONE;
    };

    const onMouseWheel = (e) => {
        if (!this.enabled || !enableZoom || (state !== STATE.NONE && state !== STATE.ROTATE)) return;
        e.stopPropagation();
        e.preventDefault();

        if (e.deltaY < 0) {
            dolly(1 / getZoomScale());
        } else if (e.deltaY > 0) {
            dolly(getZoomScale());
        }
    };

    const onTouchStart = (e) => {
        if (!this.enabled) return;
        e.preventDefault();

        switch (e.touches.length) {
            case 1:
                if (enableRotate === false) return;
                rotateStart.set(e.touches[0].pageX, e.touches[0].pageY);
                state = STATE.ROTATE;
                break;
            case 2:
                if (enableZoom === false && enablePan === false) return;
                handleTouchStartDollyPan(e);
                state = STATE.DOLLY_PAN;
                break;
            default:
                state = STATE.NONE;
        }
    };

    const onTouchMove = (e) => {
        if (!this.enabled) return;
        e.preventDefault();
        e.stopPropagation();

        switch (e.touches.length) {
            case 1:
                if (enableRotate === false) return;
                handleMoveRotate(e.touches[0].pageX, e.touches[0].pageY);
                break;
            case 2:
                if (enableZoom === false && enablePan === false) return;
                handleTouchMoveDollyPan(e);
                break;
            default:
                state = STATE.NONE;
        }
    };

    const onTouchEnd = () => {
        if (!this.enabled) return;
        state = STATE.NONE;
    };

    const onContextMenu = (e) => {
        if (!this.enabled) return;
        e.preventDefault();
    };

    function addHandlers() {
        element.addEventListener('contextmenu', onContextMenu, false);
        element.addEventListener('mousedown', onMouseDown, false);
        element.addEventListener('wheel', onMouseWheel, { passive: false });
        element.addEventListener('touchstart', onTouchStart, { passive: false });
        element.addEventListener('touchend', onTouchEnd, false);
        element.addEventListener('touchmove', onTouchMove, { passive: false });
    }

    this.remove = function () {
        element.removeEventListener('contextmenu', onContextMenu);
        element.removeEventListener('mousedown', onMouseDown);
        element.removeEventListener('wheel', onMouseWheel);
        element.removeEventListener('touchstart', onTouchStart);
        element.removeEventListener('touchend', onTouchEnd);
        element.removeEventListener('touchmove', onTouchMove);
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
    };

    addHandlers();
}


/***/ }),

/***/ "./src/extras/Plane.js":
/*!*****************************!*\
  !*** ./src/extras/Plane.js ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Plane": () => (/* binding */ Plane)
/* harmony export */ });
/* harmony import */ var _core_Geometry_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../core/Geometry.js */ "./src/core/Geometry.js");


class Plane extends _core_Geometry_js__WEBPACK_IMPORTED_MODULE_0__.Geometry {
    constructor(gl, { width = 1, height = 1, widthSegments = 1, heightSegments = 1, attributes = {} } = {}) {
        const wSegs = widthSegments;
        const hSegs = heightSegments;

        // Determine length of arrays
        const num = (wSegs + 1) * (hSegs + 1);
        const numIndices = wSegs * hSegs * 6;

        // Generate empty arrays once
        const position = new Float32Array(num * 3);
        const normal = new Float32Array(num * 3);
        const uv = new Float32Array(num * 2);
        const index = num > 65536 ? new Uint32Array(numIndices) : new Uint16Array(numIndices);

        Plane.buildPlane(position, normal, uv, index, width, height, 0, wSegs, hSegs);

        Object.assign(attributes, {
            position: { size: 3, data: position },
            normal: { size: 3, data: normal },
            uv: { size: 2, data: uv },
            index: { data: index },
        });

        super(gl, attributes);
    }

    static buildPlane(position, normal, uv, index, width, height, depth, wSegs, hSegs, u = 0, v = 1, w = 2, uDir = 1, vDir = -1, i = 0, ii = 0) {
        const io = i;
        const segW = width / wSegs;
        const segH = height / hSegs;

        for (let iy = 0; iy <= hSegs; iy++) {
            let y = iy * segH - height / 2;
            for (let ix = 0; ix <= wSegs; ix++, i++) {
                let x = ix * segW - width / 2;

                position[i * 3 + u] = x * uDir;
                position[i * 3 + v] = y * vDir;
                position[i * 3 + w] = depth / 2;

                normal[i * 3 + u] = 0;
                normal[i * 3 + v] = 0;
                normal[i * 3 + w] = depth >= 0 ? 1 : -1;

                uv[i * 2] = ix / wSegs;
                uv[i * 2 + 1] = 1 - iy / hSegs;

                if (iy === hSegs || ix === wSegs) continue;
                let a = io + ix + iy * (wSegs + 1);
                let b = io + ix + (iy + 1) * (wSegs + 1);
                let c = io + ix + (iy + 1) * (wSegs + 1) + 1;
                let d = io + ix + iy * (wSegs + 1) + 1;

                index[ii * 6] = a;
                index[ii * 6 + 1] = b;
                index[ii * 6 + 2] = d;
                index[ii * 6 + 3] = b;
                index[ii * 6 + 4] = c;
                index[ii * 6 + 5] = d;
                ii++;
            }
        }
    }
}


/***/ }),

/***/ "./src/extras/Polyline.js":
/*!********************************!*\
  !*** ./src/extras/Polyline.js ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Polyline": () => (/* binding */ Polyline)
/* harmony export */ });
/* harmony import */ var _core_Geometry_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../core/Geometry.js */ "./src/core/Geometry.js");
/* harmony import */ var _core_Program_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../core/Program.js */ "./src/core/Program.js");
/* harmony import */ var _core_Mesh_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../core/Mesh.js */ "./src/core/Mesh.js");
/* harmony import */ var _math_Vec2_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../math/Vec2.js */ "./src/math/Vec2.js");
/* harmony import */ var _math_Vec3_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../math/Vec3.js */ "./src/math/Vec3.js");
/* harmony import */ var _math_Color_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../math/Color.js */ "./src/math/Color.js");







const tmp = new _math_Vec3_js__WEBPACK_IMPORTED_MODULE_0__.Vec3();

class Polyline {
    constructor(
        gl,
        {
            points, // Array of Vec3s
            vertex = defaultVertex,
            fragment = defaultFragment,
            uniforms = {},
            attributes = {}, // For passing in custom attribs
        }
    ) {
        this.gl = gl;
        this.points = points;
        this.count = points.length;

        // Create buffers
        this.position = new Float32Array(this.count * 3 * 2);
        this.prev = new Float32Array(this.count * 3 * 2);
        this.next = new Float32Array(this.count * 3 * 2);
        const side = new Float32Array(this.count * 1 * 2);
        const uv = new Float32Array(this.count * 2 * 2);
        const index = new Uint16Array((this.count - 1) * 3 * 2);

        // Set static buffers
        for (let i = 0; i < this.count; i++) {
            side.set([-1, 1], i * 2);
            const v = i / (this.count - 1);
            uv.set([0, v, 1, v], i * 4);

            if (i === this.count - 1) continue;
            const ind = i * 2;
            index.set([ind + 0, ind + 1, ind + 2], (ind + 0) * 3);
            index.set([ind + 2, ind + 1, ind + 3], (ind + 1) * 3);
        }

        const geometry = (this.geometry = new _core_Geometry_js__WEBPACK_IMPORTED_MODULE_1__.Geometry(
            gl,
            Object.assign(attributes, {
                position: { size: 3, data: this.position },
                prev: { size: 3, data: this.prev },
                next: { size: 3, data: this.next },
                side: { size: 1, data: side },
                uv: { size: 2, data: uv },
                index: { size: 1, data: index },
            })
        ));

        // Populate dynamic buffers
        this.updateGeometry();

        if (!uniforms.uResolution) this.resolution = uniforms.uResolution = { value: new _math_Vec2_js__WEBPACK_IMPORTED_MODULE_2__.Vec2() };
        if (!uniforms.uDPR) this.dpr = uniforms.uDPR = { value: 1 };
        if (!uniforms.uThickness) this.thickness = uniforms.uThickness = { value: 1 };
        if (!uniforms.uColor) this.color = uniforms.uColor = { value: new _math_Color_js__WEBPACK_IMPORTED_MODULE_3__.Color('#000') };
        if (!uniforms.uMiter) this.miter = uniforms.uMiter = { value: 1 };

        // Set size uniforms' values
        this.resize();

        const program = (this.program = new _core_Program_js__WEBPACK_IMPORTED_MODULE_4__.Program(gl, {
            vertex,
            fragment,
            uniforms,
        }));

        this.mesh = new _core_Mesh_js__WEBPACK_IMPORTED_MODULE_5__.Mesh(gl, { geometry, program });
    }

    updateGeometry() {
        this.points.forEach((p, i) => {
            p.toArray(this.position, i * 3 * 2);
            p.toArray(this.position, i * 3 * 2 + 3);

            if (!i) {
                // If first point, calculate prev using the distance to 2nd point
                tmp.copy(p)
                    .sub(this.points[i + 1])
                    .add(p);
                tmp.toArray(this.prev, i * 3 * 2);
                tmp.toArray(this.prev, i * 3 * 2 + 3);
            } else {
                p.toArray(this.next, (i - 1) * 3 * 2);
                p.toArray(this.next, (i - 1) * 3 * 2 + 3);
            }

            if (i === this.points.length - 1) {
                // If last point, calculate next using distance to 2nd last point
                tmp.copy(p)
                    .sub(this.points[i - 1])
                    .add(p);
                tmp.toArray(this.next, i * 3 * 2);
                tmp.toArray(this.next, i * 3 * 2 + 3);
            } else {
                p.toArray(this.prev, (i + 1) * 3 * 2);
                p.toArray(this.prev, (i + 1) * 3 * 2 + 3);
            }
        });

        this.geometry.attributes.position.needsUpdate = true;
        this.geometry.attributes.prev.needsUpdate = true;
        this.geometry.attributes.next.needsUpdate = true;
    }

    // Only need to call if not handling resolution uniforms manually
    resize() {
        // Update automatic uniforms if not overridden
        if (this.resolution) this.resolution.value.set(this.gl.canvas.width, this.gl.canvas.height);
        if (this.dpr) this.dpr.value = this.gl.renderer.dpr;
    }
}

const defaultVertex = /* glsl */ `
    precision highp float;

    attribute vec3 position;
    attribute vec3 next;
    attribute vec3 prev;
    attribute vec2 uv;
    attribute float side;

    uniform mat4 modelViewMatrix;
    uniform mat4 projectionMatrix;
    uniform vec2 uResolution;
    uniform float uDPR;
    uniform float uThickness;
    uniform float uMiter;

    varying vec2 vUv;

    vec4 getPosition() {
        mat4 mvp = projectionMatrix * modelViewMatrix;
        vec4 current = mvp * vec4(position, 1);
        vec4 nextPos = mvp * vec4(next, 1);
        vec4 prevPos = mvp * vec4(prev, 1);

        vec2 aspect = vec2(uResolution.x / uResolution.y, 1);    
        vec2 currentScreen = current.xy / current.w * aspect;
        vec2 nextScreen = nextPos.xy / nextPos.w * aspect;
        vec2 prevScreen = prevPos.xy / prevPos.w * aspect;
    
        vec2 dir1 = normalize(currentScreen - prevScreen);
        vec2 dir2 = normalize(nextScreen - currentScreen);
        vec2 dir = normalize(dir1 + dir2);
    
        vec2 normal = vec2(-dir.y, dir.x);
        normal /= mix(1.0, max(0.3, dot(normal, vec2(-dir1.y, dir1.x))), uMiter);
        normal /= aspect;

        float pixelWidthRatio = 1.0 / (uResolution.y / uDPR);
        float pixelWidth = current.w * pixelWidthRatio;
        normal *= pixelWidth * uThickness;
        current.xy -= normal * side;
    
        return current;
    }

    void main() {
        vUv = uv;
        gl_Position = getPosition();
    }
`;

const defaultFragment = /* glsl */ `
    precision highp float;

    uniform vec3 uColor;
    
    varying vec2 vUv;

    void main() {
        gl_FragColor.rgb = uColor;
        gl_FragColor.a = 1.0;
    }
`;


/***/ }),

/***/ "./src/extras/Post.js":
/*!****************************!*\
  !*** ./src/extras/Post.js ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Post": () => (/* binding */ Post)
/* harmony export */ });
/* harmony import */ var _core_Program_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../core/Program.js */ "./src/core/Program.js");
/* harmony import */ var _core_Mesh_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../core/Mesh.js */ "./src/core/Mesh.js");
/* harmony import */ var _core_RenderTarget_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../core/RenderTarget.js */ "./src/core/RenderTarget.js");
/* harmony import */ var _Triangle_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Triangle.js */ "./src/extras/Triangle.js");
// TODO: Destroy render targets if size changed and exists






class Post {
    constructor(
        gl,
        {
            width,
            height,
            dpr,
            wrapS = gl.CLAMP_TO_EDGE,
            wrapT = gl.CLAMP_TO_EDGE,
            minFilter = gl.LINEAR,
            magFilter = gl.LINEAR,
            geometry = new _Triangle_js__WEBPACK_IMPORTED_MODULE_0__.Triangle(gl),
            targetOnly = null,
        } = {}
    ) {
        this.gl = gl;

        this.options = { wrapS, wrapT, minFilter, magFilter };

        this.passes = [];

        this.geometry = geometry;

        this.uniform = { value: null };
        this.targetOnly = targetOnly;

        const fbo = (this.fbo = {
            read: null,
            write: null,
            swap: () => {
                let temp = fbo.read;
                fbo.read = fbo.write;
                fbo.write = temp;
            },
        });

        this.resize({ width, height, dpr });
    }

    addPass({ vertex = defaultVertex, fragment = defaultFragment, uniforms = {}, textureUniform = 'tMap', enabled = true } = {}) {
        uniforms[textureUniform] = { value: this.fbo.read.texture };

        const program = new _core_Program_js__WEBPACK_IMPORTED_MODULE_1__.Program(this.gl, { vertex, fragment, uniforms });
        const mesh = new _core_Mesh_js__WEBPACK_IMPORTED_MODULE_2__.Mesh(this.gl, { geometry: this.geometry, program });

        const pass = {
            mesh,
            program,
            uniforms,
            enabled,
            textureUniform,
        };

        this.passes.push(pass);
        return pass;
    }

    resize({ width, height, dpr } = {}) {
        if (dpr) this.dpr = dpr;
        if (width) {
            this.width = width;
            this.height = height || width;
        }

        dpr = this.dpr || this.gl.renderer.dpr;
        width = (this.width || this.gl.renderer.width) * dpr;
        height = (this.height || this.gl.renderer.height) * dpr;

        this.options.width = width;
        this.options.height = height;

        this.fbo.read = new _core_RenderTarget_js__WEBPACK_IMPORTED_MODULE_3__.RenderTarget(this.gl, this.options);
        this.fbo.write = new _core_RenderTarget_js__WEBPACK_IMPORTED_MODULE_3__.RenderTarget(this.gl, this.options);
    }

    // Uses same arguments as renderer.render
    render({ scene, camera, target = null, update = true, sort = true, frustumCull = true }) {
        const enabledPasses = this.passes.filter((pass) => pass.enabled);

        this.gl.renderer.render({
            scene,
            camera,
            target: enabledPasses.length || (!target && this.targetOnly) ? this.fbo.write : target,
            update,
            sort,
            frustumCull,
        });
        this.fbo.swap();

        enabledPasses.forEach((pass, i) => {
            pass.mesh.program.uniforms[pass.textureUniform].value = this.fbo.read.texture;
            this.gl.renderer.render({
                scene: pass.mesh,
                target: i === enabledPasses.length - 1 && (target || !this.targetOnly) ? target : this.fbo.write,
                clear: true,
            });
            this.fbo.swap();
        });

        this.uniform.value = this.fbo.read.texture;
    }
}

const defaultVertex = /* glsl */ `
    attribute vec2 uv;
    attribute vec2 position;

    varying vec2 vUv;

    void main() {
        vUv = uv;
        gl_Position = vec4(position, 0, 1);
    }
`;

const defaultFragment = /* glsl */ `
    precision highp float;

    uniform sampler2D tMap;
    varying vec2 vUv;

    void main() {
        gl_FragColor = texture2D(tMap, vUv);
    }
`;


/***/ }),

/***/ "./src/extras/Raycast.js":
/*!*******************************!*\
  !*** ./src/extras/Raycast.js ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Raycast": () => (/* binding */ Raycast)
/* harmony export */ });
/* harmony import */ var _math_Vec2_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../math/Vec2.js */ "./src/math/Vec2.js");
/* harmony import */ var _math_Vec3_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../math/Vec3.js */ "./src/math/Vec3.js");
/* harmony import */ var _math_Mat4_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../math/Mat4.js */ "./src/math/Mat4.js");
// TODO: barycentric code shouldn't be here, but where?
// TODO: SphereCast?





const tempVec2a = new _math_Vec2_js__WEBPACK_IMPORTED_MODULE_0__.Vec2();
const tempVec2b = new _math_Vec2_js__WEBPACK_IMPORTED_MODULE_0__.Vec2();
const tempVec2c = new _math_Vec2_js__WEBPACK_IMPORTED_MODULE_0__.Vec2();

const tempVec3a = new _math_Vec3_js__WEBPACK_IMPORTED_MODULE_1__.Vec3();
const tempVec3b = new _math_Vec3_js__WEBPACK_IMPORTED_MODULE_1__.Vec3();
const tempVec3c = new _math_Vec3_js__WEBPACK_IMPORTED_MODULE_1__.Vec3();
const tempVec3d = new _math_Vec3_js__WEBPACK_IMPORTED_MODULE_1__.Vec3();
const tempVec3e = new _math_Vec3_js__WEBPACK_IMPORTED_MODULE_1__.Vec3();
const tempVec3f = new _math_Vec3_js__WEBPACK_IMPORTED_MODULE_1__.Vec3();
const tempVec3g = new _math_Vec3_js__WEBPACK_IMPORTED_MODULE_1__.Vec3();
const tempVec3h = new _math_Vec3_js__WEBPACK_IMPORTED_MODULE_1__.Vec3();
const tempVec3i = new _math_Vec3_js__WEBPACK_IMPORTED_MODULE_1__.Vec3();
const tempVec3j = new _math_Vec3_js__WEBPACK_IMPORTED_MODULE_1__.Vec3();
const tempVec3k = new _math_Vec3_js__WEBPACK_IMPORTED_MODULE_1__.Vec3();

const tempMat4 = new _math_Mat4_js__WEBPACK_IMPORTED_MODULE_2__.Mat4();

class Raycast {
    constructor() {
        this.origin = new _math_Vec3_js__WEBPACK_IMPORTED_MODULE_1__.Vec3();
        this.direction = new _math_Vec3_js__WEBPACK_IMPORTED_MODULE_1__.Vec3();
    }

    // Set ray from mouse unprojection
    castMouse(camera, mouse = [0, 0]) {
        if (camera.type === 'orthographic') {
            // Set origin
            // Since camera is orthographic, origin is not the camera position
            const { left, right, bottom, top, zoom } = camera;
            const x = left / zoom + ((right - left) / zoom) * (mouse[0] * 0.5 + 0.5);
            const y = bottom / zoom + ((top - bottom) / zoom) * (mouse[1] * 0.5 + 0.5);
            this.origin.set(x, y, 0);
            this.origin.applyMatrix4(camera.worldMatrix);

            // Set direction
            // https://community.khronos.org/t/get-direction-from-transformation-matrix-or-quat/65502/2
            this.direction.x = -camera.worldMatrix[8];
            this.direction.y = -camera.worldMatrix[9];
            this.direction.z = -camera.worldMatrix[10];
        } else {
            // Set origin
            camera.worldMatrix.getTranslation(this.origin);

            // Set direction
            this.direction.set(mouse[0], mouse[1], 0.5);
            camera.unproject(this.direction);
            this.direction.sub(this.origin).normalize();
        }
    }

    intersectBounds(meshes, { maxDistance, output = [] } = {}) {
        if (!Array.isArray(meshes)) meshes = [meshes];

        const invWorldMat4 = tempMat4;
        const origin = tempVec3a;
        const direction = tempVec3b;

        const hits = output;
        hits.length = 0;

        meshes.forEach((mesh) => {
            // Create bounds
            if (!mesh.geometry.bounds || mesh.geometry.bounds.radius === Infinity) mesh.geometry.computeBoundingSphere();
            const bounds = mesh.geometry.bounds;
            invWorldMat4.inverse(mesh.worldMatrix);

            // Get max distance locally
            let localMaxDistance;
            if (maxDistance) {
                direction.copy(this.direction).scaleRotateMatrix4(invWorldMat4);
                localMaxDistance = maxDistance * direction.len();
            }

            // Take world space ray and make it object space to align with bounding box
            origin.copy(this.origin).applyMatrix4(invWorldMat4);
            direction.copy(this.direction).transformDirection(invWorldMat4);

            // Break out early if bounds too far away from origin
            if (maxDistance) {
                if (origin.distance(bounds.center) - bounds.radius > localMaxDistance) return;
            }

            let localDistance = 0;

            // Check origin isn't inside bounds before testing intersection
            if (mesh.geometry.raycast === 'sphere') {
                if (origin.distance(bounds.center) > bounds.radius) {
                    localDistance = this.intersectSphere(bounds, origin, direction);
                    if (!localDistance) return;
                }
            } else {
                if (
                    origin.x < bounds.min.x ||
                    origin.x > bounds.max.x ||
                    origin.y < bounds.min.y ||
                    origin.y > bounds.max.y ||
                    origin.z < bounds.min.z ||
                    origin.z > bounds.max.z
                ) {
                    localDistance = this.intersectBox(bounds, origin, direction);
                    if (!localDistance) return;
                }
            }

            if (maxDistance && localDistance > localMaxDistance) return;

            // Create object on mesh to avoid generating lots of objects
            if (!mesh.hit) mesh.hit = { localPoint: new _math_Vec3_js__WEBPACK_IMPORTED_MODULE_1__.Vec3(), point: new _math_Vec3_js__WEBPACK_IMPORTED_MODULE_1__.Vec3() };

            mesh.hit.localPoint.copy(direction).multiply(localDistance).add(origin);
            mesh.hit.point.copy(mesh.hit.localPoint).applyMatrix4(mesh.worldMatrix);
            mesh.hit.distance = mesh.hit.point.distance(this.origin);

            hits.push(mesh);
        });

        hits.sort((a, b) => a.hit.distance - b.hit.distance);
        return hits;
    }

    intersectMeshes(meshes, { cullFace = true, maxDistance, includeUV = true, includeNormal = true, output = [] } = {}) {
        // Test bounds first before testing geometry
        const hits = this.intersectBounds(meshes, { maxDistance, output });
        if (!hits.length) return hits;

        const invWorldMat4 = tempMat4;
        const origin = tempVec3a;
        const direction = tempVec3b;
        const a = tempVec3c;
        const b = tempVec3d;
        const c = tempVec3e;
        const closestFaceNormal = tempVec3f;
        const faceNormal = tempVec3g;
        const barycoord = tempVec3h;
        const uvA = tempVec2a;
        const uvB = tempVec2b;
        const uvC = tempVec2c;

        for (let i = hits.length - 1; i >= 0; i--) {
            const mesh = hits[i];
            invWorldMat4.inverse(mesh.worldMatrix);

            // Get max distance locally
            let localMaxDistance;
            if (maxDistance) {
                direction.copy(this.direction).scaleRotateMatrix4(invWorldMat4);
                localMaxDistance = maxDistance * direction.len();
            }

            // Take world space ray and make it object space to align with bounding box
            origin.copy(this.origin).applyMatrix4(invWorldMat4);
            direction.copy(this.direction).transformDirection(invWorldMat4);

            let localDistance = 0;
            let closestA, closestB, closestC;

            const geometry = mesh.geometry;
            const attributes = geometry.attributes;
            const index = attributes.index;

            const start = Math.max(0, geometry.drawRange.start);
            const end = Math.min(index ? index.count : attributes.position.count, geometry.drawRange.start + geometry.drawRange.count);

            for (let j = start; j < end; j += 3) {
                // Position attribute indices for each triangle
                const ai = index ? index.data[j] : j;
                const bi = index ? index.data[j + 1] : j + 1;
                const ci = index ? index.data[j + 2] : j + 2;

                a.fromArray(attributes.position.data, ai * 3);
                b.fromArray(attributes.position.data, bi * 3);
                c.fromArray(attributes.position.data, ci * 3);

                const distance = this.intersectTriangle(a, b, c, cullFace, origin, direction, faceNormal);
                if (!distance) continue;

                // Too far away
                if (maxDistance && distance > localMaxDistance) continue;

                if (!localDistance || distance < localDistance) {
                    localDistance = distance;
                    closestA = ai;
                    closestB = bi;
                    closestC = ci;
                    closestFaceNormal.copy(faceNormal);
                }
            }

            if (!localDistance) hits.splice(i, 1);

            // Update hit values from bounds-test
            mesh.hit.localPoint.copy(direction).multiply(localDistance).add(origin);
            mesh.hit.point.copy(mesh.hit.localPoint).applyMatrix4(mesh.worldMatrix);
            mesh.hit.distance = mesh.hit.point.distance(this.origin);

            // Add unique hit objects on mesh to avoid generating lots of objects
            if (!mesh.hit.faceNormal) {
                mesh.hit.localFaceNormal = new _math_Vec3_js__WEBPACK_IMPORTED_MODULE_1__.Vec3();
                mesh.hit.faceNormal = new _math_Vec3_js__WEBPACK_IMPORTED_MODULE_1__.Vec3();
                mesh.hit.uv = new _math_Vec2_js__WEBPACK_IMPORTED_MODULE_0__.Vec2();
                mesh.hit.localNormal = new _math_Vec3_js__WEBPACK_IMPORTED_MODULE_1__.Vec3();
                mesh.hit.normal = new _math_Vec3_js__WEBPACK_IMPORTED_MODULE_1__.Vec3();
            }

            // Add face normal data which is already computed
            mesh.hit.localFaceNormal.copy(closestFaceNormal);
            mesh.hit.faceNormal.copy(mesh.hit.localFaceNormal).transformDirection(mesh.worldMatrix);

            // Optional data, opt out to optimise a bit if necessary
            if (includeUV || includeNormal) {
                // Calculate barycoords to find uv values at hit point
                a.fromArray(attributes.position.data, closestA * 3);
                b.fromArray(attributes.position.data, closestB * 3);
                c.fromArray(attributes.position.data, closestC * 3);
                this.getBarycoord(mesh.hit.localPoint, a, b, c, barycoord);
            }

            if (includeUV && attributes.uv) {
                uvA.fromArray(attributes.uv.data, closestA * 2);
                uvB.fromArray(attributes.uv.data, closestB * 2);
                uvC.fromArray(attributes.uv.data, closestC * 2);
                mesh.hit.uv.set(
                    uvA.x * barycoord.x + uvB.x * barycoord.y + uvC.x * barycoord.z,
                    uvA.y * barycoord.x + uvB.y * barycoord.y + uvC.y * barycoord.z
                );
            }

            if (includeNormal && attributes.normal) {
                a.fromArray(attributes.normal.data, closestA * 3);
                b.fromArray(attributes.normal.data, closestB * 3);
                c.fromArray(attributes.normal.data, closestC * 3);
                mesh.hit.localNormal.set(
                    a.x * barycoord.x + b.x * barycoord.y + c.x * barycoord.z,
                    a.y * barycoord.x + b.y * barycoord.y + c.y * barycoord.z,
                    a.z * barycoord.x + b.z * barycoord.y + c.z * barycoord.z
                );

                mesh.hit.normal.copy(mesh.hit.localNormal).transformDirection(mesh.worldMatrix);
            }
        }

        hits.sort((a, b) => a.hit.distance - b.hit.distance);
        return hits;
    }

    intersectSphere(sphere, origin = this.origin, direction = this.direction) {
        const ray = tempVec3c;
        ray.sub(sphere.center, origin);
        const tca = ray.dot(direction);
        const d2 = ray.dot(ray) - tca * tca;
        const radius2 = sphere.radius * sphere.radius;
        if (d2 > radius2) return 0;
        const thc = Math.sqrt(radius2 - d2);
        const t0 = tca - thc;
        const t1 = tca + thc;
        if (t0 < 0 && t1 < 0) return 0;
        if (t0 < 0) return t1;
        return t0;
    }

    // Ray AABB - Ray Axis aligned bounding box testing
    intersectBox(box, origin = this.origin, direction = this.direction) {
        let tmin, tmax, tYmin, tYmax, tZmin, tZmax;
        const invdirx = 1 / direction.x;
        const invdiry = 1 / direction.y;
        const invdirz = 1 / direction.z;
        const min = box.min;
        const max = box.max;
        tmin = ((invdirx >= 0 ? min.x : max.x) - origin.x) * invdirx;
        tmax = ((invdirx >= 0 ? max.x : min.x) - origin.x) * invdirx;
        tYmin = ((invdiry >= 0 ? min.y : max.y) - origin.y) * invdiry;
        tYmax = ((invdiry >= 0 ? max.y : min.y) - origin.y) * invdiry;
        if (tmin > tYmax || tYmin > tmax) return 0;
        if (tYmin > tmin) tmin = tYmin;
        if (tYmax < tmax) tmax = tYmax;
        tZmin = ((invdirz >= 0 ? min.z : max.z) - origin.z) * invdirz;
        tZmax = ((invdirz >= 0 ? max.z : min.z) - origin.z) * invdirz;
        if (tmin > tZmax || tZmin > tmax) return 0;
        if (tZmin > tmin) tmin = tZmin;
        if (tZmax < tmax) tmax = tZmax;
        if (tmax < 0) return 0;
        return tmin >= 0 ? tmin : tmax;
    }

    intersectTriangle(a, b, c, backfaceCulling = true, origin = this.origin, direction = this.direction, normal = tempVec3g) {
        // from https://github.com/mrdoob/three.js/blob/master/src/math/Ray.js
        // which is from http://www.geometrictools.com/GTEngine/Include/Mathematics/GteIntrRay3Triangle3.h
        const edge1 = tempVec3h;
        const edge2 = tempVec3i;
        const diff = tempVec3j;
        edge1.sub(b, a);
        edge2.sub(c, a);
        normal.cross(edge1, edge2);
        let DdN = direction.dot(normal);
        if (!DdN) return 0;
        let sign;
        if (DdN > 0) {
            if (backfaceCulling) return 0;
            sign = 1;
        } else {
            sign = -1;
            DdN = -DdN;
        }
        diff.sub(origin, a);
        let DdQxE2 = sign * direction.dot(edge2.cross(diff, edge2));
        if (DdQxE2 < 0) return 0;
        let DdE1xQ = sign * direction.dot(edge1.cross(diff));
        if (DdE1xQ < 0) return 0;
        if (DdQxE2 + DdE1xQ > DdN) return 0;
        let QdN = -sign * diff.dot(normal);
        if (QdN < 0) return 0;
        return QdN / DdN;
    }

    getBarycoord(point, a, b, c, target = tempVec3h) {
        // From https://github.com/mrdoob/three.js/blob/master/src/math/Triangle.js
        // static/instance method to calculate barycentric coordinates
        // based on: http://www.blackpawn.com/texts/pointinpoly/default.html
        const v0 = tempVec3i;
        const v1 = tempVec3j;
        const v2 = tempVec3k;
        v0.sub(c, a);
        v1.sub(b, a);
        v2.sub(point, a);
        const dot00 = v0.dot(v0);
        const dot01 = v0.dot(v1);
        const dot02 = v0.dot(v2);
        const dot11 = v1.dot(v1);
        const dot12 = v1.dot(v2);
        const denom = dot00 * dot11 - dot01 * dot01;
        if (denom === 0) return target.set(-2, -1, -1);
        const invDenom = 1 / denom;
        const u = (dot11 * dot02 - dot01 * dot12) * invDenom;
        const v = (dot00 * dot12 - dot01 * dot02) * invDenom;
        return target.set(1 - u - v, v, u);
    }
}


/***/ }),

/***/ "./src/extras/Shadow.js":
/*!******************************!*\
  !*** ./src/extras/Shadow.js ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Shadow": () => (/* binding */ Shadow)
/* harmony export */ });
/* harmony import */ var _core_Camera_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../core/Camera.js */ "./src/core/Camera.js");
/* harmony import */ var _core_Program_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../core/Program.js */ "./src/core/Program.js");
/* harmony import */ var _core_RenderTarget_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../core/RenderTarget.js */ "./src/core/RenderTarget.js");




class Shadow {
    constructor(gl, { light = new _core_Camera_js__WEBPACK_IMPORTED_MODULE_0__.Camera(gl), width = 1024, height = width }) {
        this.gl = gl;

        this.light = light;

        this.target = new _core_RenderTarget_js__WEBPACK_IMPORTED_MODULE_1__.RenderTarget(gl, { width, height });

        this.depthProgram = new _core_Program_js__WEBPACK_IMPORTED_MODULE_2__.Program(gl, {
            vertex: defaultVertex,
            fragment: defaultFragment,
            cullFace: null,
        });

        this.castMeshes = [];
    }

    add({
        mesh,
        receive = true,
        cast = true,
        vertex = defaultVertex,
        fragment = defaultFragment,
        uniformProjection = 'shadowProjectionMatrix',
        uniformView = 'shadowViewMatrix',
        uniformTexture = 'tShadow',
    }) {
        // Add uniforms to existing program
        if (receive && !mesh.program.uniforms[uniformProjection]) {
            mesh.program.uniforms[uniformProjection] = { value: this.light.projectionMatrix };
            mesh.program.uniforms[uniformView] = { value: this.light.viewMatrix };
            mesh.program.uniforms[uniformTexture] = { value: this.target.texture };
        }

        if (!cast) return;
        this.castMeshes.push(mesh);

        // Store program for when switching between depth override
        mesh.colorProgram = mesh.program;

        // Check if depth program already attached
        if (mesh.depthProgram) return;

        // Use global depth override if nothing custom passed in
        if (vertex === defaultVertex && fragment === defaultFragment) {
            mesh.depthProgram = this.depthProgram;
            return;
        }

        // Create custom override program
        mesh.depthProgram = new _core_Program_js__WEBPACK_IMPORTED_MODULE_2__.Program(this.gl, {
            vertex,
            fragment,
            cullFace: null,
        });
    }

    render({ scene }) {
        // For depth render, replace program with depth override.
        // Hide meshes not casting shadows.
        scene.traverse((node) => {
            if (!node.draw) return;
            if (!!~this.castMeshes.indexOf(node)) {
                node.program = node.depthProgram;
            } else {
                node.isForceVisibility = node.visible;
                node.visible = false;
            }
        });

        // Render the depth shadow map using the light as the camera
        this.gl.renderer.render({
            scene,
            camera: this.light,
            target: this.target,
        });

        // Then switch the program back to the normal one
        scene.traverse((node) => {
            if (!node.draw) return;
            if (!!~this.castMeshes.indexOf(node)) {
                node.program = node.colorProgram;
            } else {
                node.visible = node.isForceVisibility;
            }
        });
    }
}

const defaultVertex = /* glsl */ `
    attribute vec3 position;
    attribute vec2 uv;

    uniform mat4 modelViewMatrix;
    uniform mat4 projectionMatrix;

    void main() {
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

const defaultFragment = /* glsl */ `
    precision highp float;

    vec4 packRGBA (float v) {
        vec4 pack = fract(vec4(1.0, 255.0, 65025.0, 16581375.0) * v);
        pack -= pack.yzww * vec2(1.0 / 255.0, 0.0).xxxy;
        return pack;
    }

    void main() {
        gl_FragColor = packRGBA(gl_FragCoord.z);
    }
`;


/***/ }),

/***/ "./src/extras/Skin.js":
/*!****************************!*\
  !*** ./src/extras/Skin.js ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Skin": () => (/* binding */ Skin)
/* harmony export */ });
/* harmony import */ var _core_Mesh_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../core/Mesh.js */ "./src/core/Mesh.js");
/* harmony import */ var _core_Transform_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../core/Transform.js */ "./src/core/Transform.js");
/* harmony import */ var _math_Mat4_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../math/Mat4.js */ "./src/math/Mat4.js");
/* harmony import */ var _core_Texture_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../core/Texture.js */ "./src/core/Texture.js");
/* harmony import */ var _Animation_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./Animation.js */ "./src/extras/Animation.js");






const tempMat4 = new _math_Mat4_js__WEBPACK_IMPORTED_MODULE_0__.Mat4();

class Skin extends _core_Mesh_js__WEBPACK_IMPORTED_MODULE_1__.Mesh {
    constructor(gl, { rig, geometry, program, mode = gl.TRIANGLES } = {}) {
        super(gl, { geometry, program, mode });

        this.createBones(rig);
        this.createBoneTexture();
        this.animations = [];

        Object.assign(this.program.uniforms, {
            boneTexture: { value: this.boneTexture },
            boneTextureSize: { value: this.boneTextureSize },
        });
    }

    createBones(rig) {
        // Create root so that can simply update world matrix of whole skeleton
        this.root = new _core_Transform_js__WEBPACK_IMPORTED_MODULE_2__.Transform();

        // Create bones
        this.bones = [];
        if (!rig.bones || !rig.bones.length) return;
        for (let i = 0; i < rig.bones.length; i++) {
            const bone = new _core_Transform_js__WEBPACK_IMPORTED_MODULE_2__.Transform();

            // Set initial values (bind pose)
            bone.position.fromArray(rig.bindPose.position, i * 3);
            bone.quaternion.fromArray(rig.bindPose.quaternion, i * 4);
            bone.scale.fromArray(rig.bindPose.scale, i * 3);

            this.bones.push(bone);
        }

        // Once created, set the hierarchy
        rig.bones.forEach((data, i) => {
            this.bones[i].name = data.name;
            if (data.parent === -1) return this.bones[i].setParent(this.root);
            this.bones[i].setParent(this.bones[data.parent]);
        });

        // Then update to calculate world matrices
        this.root.updateMatrixWorld(true);

        // Store inverse of bind pose to calculate differences
        this.bones.forEach((bone) => {
            bone.bindInverse = new _math_Mat4_js__WEBPACK_IMPORTED_MODULE_0__.Mat4(...bone.worldMatrix).inverse();
        });
    }

    createBoneTexture() {
        if (!this.bones.length) return;
        const size = Math.max(4, Math.pow(2, Math.ceil(Math.log(Math.sqrt(this.bones.length * 4)) / Math.LN2)));
        this.boneMatrices = new Float32Array(size * size * 4);
        this.boneTextureSize = size;
        this.boneTexture = new _core_Texture_js__WEBPACK_IMPORTED_MODULE_3__.Texture(this.gl, {
            image: this.boneMatrices,
            generateMipmaps: false,
            type: this.gl.FLOAT,
            internalFormat: this.gl.renderer.isWebgl2 ? this.gl.RGBA32F : this.gl.RGBA,
            minFilter: this.gl.NEAREST,
            magFilter: this.gl.NEAREST,
            flipY: false,
            width: size,
        });
    }

    addAnimation(data) {
        const animation = new _Animation_js__WEBPACK_IMPORTED_MODULE_4__.Animation({ objects: this.bones, data });
        this.animations.push(animation);
        return animation;
    }

    update() {
        // Calculate combined animation weight
        let total = 0;
        this.animations.forEach((animation) => (total += animation.weight));

        this.animations.forEach((animation, i) => {
            // force first animation to set in order to reset frame
            animation.update(total, i === 0);
        });
    }

    draw({ camera } = {}) {
        // Update world matrices manually, as not part of scene graph
        this.root.updateMatrixWorld(true);

        // Update bone texture
        this.bones.forEach((bone, i) => {
            // Find difference between current and bind pose
            tempMat4.multiply(bone.worldMatrix, bone.bindInverse);
            this.boneMatrices.set(tempMat4, i * 16);
        });
        if (this.boneTexture) this.boneTexture.needsUpdate = true;

        super.draw({ camera });
    }
}


/***/ }),

/***/ "./src/extras/Sphere.js":
/*!******************************!*\
  !*** ./src/extras/Sphere.js ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Sphere": () => (/* binding */ Sphere)
/* harmony export */ });
/* harmony import */ var _core_Geometry_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../core/Geometry.js */ "./src/core/Geometry.js");
/* harmony import */ var _math_Vec3_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../math/Vec3.js */ "./src/math/Vec3.js");



class Sphere extends _core_Geometry_js__WEBPACK_IMPORTED_MODULE_0__.Geometry {
    constructor(
        gl,
        {
            radius = 0.5,
            widthSegments = 16,
            heightSegments = Math.ceil(widthSegments * 0.5),
            phiStart = 0,
            phiLength = Math.PI * 2,
            thetaStart = 0,
            thetaLength = Math.PI,
            attributes = {},
        } = {}
    ) {
        const wSegs = widthSegments;
        const hSegs = heightSegments;
        const pStart = phiStart;
        const pLength = phiLength;
        const tStart = thetaStart;
        const tLength = thetaLength;

        const num = (wSegs + 1) * (hSegs + 1);
        const numIndices = wSegs * hSegs * 6;

        const position = new Float32Array(num * 3);
        const normal = new Float32Array(num * 3);
        const uv = new Float32Array(num * 2);
        const index = num > 65536 ? new Uint32Array(numIndices) : new Uint16Array(numIndices);

        let i = 0;
        let iv = 0;
        let ii = 0;
        let te = tStart + tLength;
        const grid = [];

        let n = new _math_Vec3_js__WEBPACK_IMPORTED_MODULE_1__.Vec3();

        for (let iy = 0; iy <= hSegs; iy++) {
            let vRow = [];
            let v = iy / hSegs;
            for (let ix = 0; ix <= wSegs; ix++, i++) {
                let u = ix / wSegs;
                let x = -radius * Math.cos(pStart + u * pLength) * Math.sin(tStart + v * tLength);
                let y = radius * Math.cos(tStart + v * tLength);
                let z = radius * Math.sin(pStart + u * pLength) * Math.sin(tStart + v * tLength);

                position[i * 3] = x;
                position[i * 3 + 1] = y;
                position[i * 3 + 2] = z;

                n.set(x, y, z).normalize();
                normal[i * 3] = n.x;
                normal[i * 3 + 1] = n.y;
                normal[i * 3 + 2] = n.z;

                uv[i * 2] = u;
                uv[i * 2 + 1] = 1 - v;

                vRow.push(iv++);
            }

            grid.push(vRow);
        }

        for (let iy = 0; iy < hSegs; iy++) {
            for (let ix = 0; ix < wSegs; ix++) {
                let a = grid[iy][ix + 1];
                let b = grid[iy][ix];
                let c = grid[iy + 1][ix];
                let d = grid[iy + 1][ix + 1];

                if (iy !== 0 || tStart > 0) {
                    index[ii * 3] = a;
                    index[ii * 3 + 1] = b;
                    index[ii * 3 + 2] = d;
                    ii++;
                }
                if (iy !== hSegs - 1 || te < Math.PI) {
                    index[ii * 3] = b;
                    index[ii * 3 + 1] = c;
                    index[ii * 3 + 2] = d;
                    ii++;
                }
            }
        }

        Object.assign(attributes, {
            position: { size: 3, data: position },
            normal: { size: 3, data: normal },
            uv: { size: 2, data: uv },
            index: { data: index },
        });

        super(gl, attributes);
    }
}


/***/ }),

/***/ "./src/extras/Text.js":
/*!****************************!*\
  !*** ./src/extras/Text.js ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Text": () => (/* binding */ Text)
/* harmony export */ });
function Text({
    font,
    text,
    width = Infinity,
    align = 'left',
    size = 1,
    letterSpacing = 0,
    lineHeight = 1.4,
    wordSpacing = 0,
    wordBreak = false,
}) {
    const _this = this;
    let glyphs, buffers;
    let fontHeight, baseline, scale;

    const newline = /\n/;
    const whitespace = /\s/;

    {
        parseFont();
        createGeometry();
    }

    function parseFont() {
        glyphs = {};
        font.chars.forEach((d) => (glyphs[d.char] = d));
    }

    function createGeometry() {
        fontHeight = font.common.lineHeight;
        baseline = font.common.base;

        // Use baseline so that actual text height is as close to 'size' value as possible
        scale = size / baseline;

        // Strip spaces and newlines to get actual character length for buffers
        let chars = text.replace(/[ \n]/g, '');
        let numChars = chars.length;

        // Create output buffers
        buffers = {
            position: new Float32Array(numChars * 4 * 3),
            uv: new Float32Array(numChars * 4 * 2),
            id: new Float32Array(numChars * 4),
            index: new Uint16Array(numChars * 6),
        };

        // Set values for buffers that don't require calculation
        for (let i = 0; i < numChars; i++) {
            buffers.id[i] = i;
            buffers.index.set([i * 4, i * 4 + 2, i * 4 + 1, i * 4 + 1, i * 4 + 2, i * 4 + 3], i * 6);
        }

        layout();
    }

    function layout() {
        const lines = [];

        let cursor = 0;

        let wordCursor = 0;
        let wordWidth = 0;
        let line = newLine();

        function newLine() {
            const line = {
                width: 0,
                glyphs: [],
            };
            lines.push(line);
            wordCursor = cursor;
            wordWidth = 0;
            return line;
        }

        let maxTimes = 100;
        let count = 0;
        while (cursor < text.length && count < maxTimes) {
            count++;

            const char = text[cursor];

            // Skip whitespace at start of line
            if (!line.width && whitespace.test(char)) {
                cursor++;
                wordCursor = cursor;
                wordWidth = 0;
                continue;
            }

            // If newline char, skip to next line
            if (newline.test(char)) {
                cursor++;
                line = newLine();
                continue;
            }

            const glyph = glyphs[char] || glyphs[' '];

            // Find any applicable kern pairs
            if (line.glyphs.length) {
                const prevGlyph = line.glyphs[line.glyphs.length - 1][0];
                let kern = getKernPairOffset(glyph.id, prevGlyph.id) * scale;
                line.width += kern;
                wordWidth += kern;
            }

            // add char to line
            line.glyphs.push([glyph, line.width]);

            // calculate advance for next glyph
            let advance = 0;

            // If whitespace, update location of current word for line breaks
            if (whitespace.test(char)) {
                wordCursor = cursor;
                wordWidth = 0;

                // Add wordspacing
                advance += wordSpacing * size;
            } else {
                // Add letterspacing
                advance += letterSpacing * size;
            }

            advance += glyph.xadvance * scale;

            line.width += advance;
            wordWidth += advance;

            // If width defined
            if (line.width > width) {
                // If can break words, undo latest glyph if line not empty and create new line
                if (wordBreak && line.glyphs.length > 1) {
                    line.width -= advance;
                    line.glyphs.pop();
                    line = newLine();
                    continue;

                    // If not first word, undo current word and cursor and create new line
                } else if (!wordBreak && wordWidth !== line.width) {
                    let numGlyphs = cursor - wordCursor + 1;
                    line.glyphs.splice(-numGlyphs, numGlyphs);
                    cursor = wordCursor;
                    line.width -= wordWidth;
                    line = newLine();
                    continue;
                }
            }

            cursor++;
        }

        // Remove last line if empty
        if (!line.width) lines.pop();

        populateBuffers(lines);
    }

    function populateBuffers(lines) {
        const texW = font.common.scaleW;
        const texH = font.common.scaleH;

        // For all fonts tested, a little offset was needed to be right on the baseline, hence 0.07.
        let y = 0.07 * size;
        let j = 0;

        for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
            let line = lines[lineIndex];

            for (let i = 0; i < line.glyphs.length; i++) {
                const glyph = line.glyphs[i][0];
                let x = line.glyphs[i][1];

                if (align === 'center') {
                    x -= line.width * 0.5;
                } else if (align === 'right') {
                    x -= line.width;
                }

                // If space, don't add to geometry
                if (whitespace.test(glyph.char)) continue;

                // Apply char sprite offsets
                x += glyph.xoffset * scale;
                y -= glyph.yoffset * scale;

                // each letter is a quad. axis bottom left
                let w = glyph.width * scale;
                let h = glyph.height * scale;
                buffers.position.set([x, y - h, 0, x, y, 0, x + w, y - h, 0, x + w, y, 0], j * 4 * 3);

                let u = glyph.x / texW;
                let uw = glyph.width / texW;
                let v = 1.0 - glyph.y / texH;
                let vh = glyph.height / texH;
                buffers.uv.set([u, v - vh, u, v, u + uw, v - vh, u + uw, v], j * 4 * 2);

                // Reset cursor to baseline
                y += glyph.yoffset * scale;

                j++;
            }

            y -= size * lineHeight;
        }

        _this.buffers = buffers;
        _this.numLines = lines.length;
        _this.height = _this.numLines * size * lineHeight;
    }

    function getKernPairOffset(id1, id2) {
        for (let i = 0; i < font.kernings.length; i++) {
            let k = font.kernings[i];
            if (k.first < id1) continue;
            if (k.second < id2) continue;
            if (k.first > id1) return 0;
            if (k.first === id1 && k.second > id2) return 0;
            return k.amount;
        }
        return 0;
    }

    // Update buffers to layout with new layout
    this.resize = function (options) {
        ({ width } = options);
        layout();
    };

    // Completely change text (like creating new Text)
    this.update = function (options) {
        ({ text } = options);
        createGeometry();
    };
}


/***/ }),

/***/ "./src/extras/TextureLoader.js":
/*!*************************************!*\
  !*** ./src/extras/TextureLoader.js ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "TextureLoader": () => (/* binding */ TextureLoader)
/* harmony export */ });
/* harmony import */ var _core_Texture_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../core/Texture.js */ "./src/core/Texture.js");
/* harmony import */ var _KTXTexture_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./KTXTexture.js */ "./src/extras/KTXTexture.js");



// For compressed textures, generate using https://github.com/TimvanScherpenzeel/texture-compressor

let cache = {};
const supportedExtensions = [];

class TextureLoader {
    static load(
        gl,
        {
            src, // string or object of extension:src key-values
            // {
            //     pvrtc: '...ktx',
            //     s3tc: '...ktx',
            //     etc: '...ktx',
            //     etc1: '...ktx',
            //     astc: '...ktx',
            //     webp: '...webp',
            //     jpg: '...jpg',
            //     png: '...png',
            // }

            // Only props relevant to KTXTexture
            wrapS = gl.CLAMP_TO_EDGE,
            wrapT = gl.CLAMP_TO_EDGE,
            anisotropy = 0,

            // For regular images
            format = gl.RGBA,
            internalFormat = format,
            generateMipmaps = true,
            minFilter = generateMipmaps ? gl.NEAREST_MIPMAP_LINEAR : gl.LINEAR,
            magFilter = gl.LINEAR,
            premultiplyAlpha = false,
            unpackAlignment = 4,
            flipY = true,
        } = {}
    ) {
        const support = this.getSupportedExtensions(gl);
        let ext = 'none';

        // If src is string, determine which format from the extension
        if (typeof src === 'string') {
            ext = src.split('.').pop().split('?')[0].toLowerCase();
        }

        // If src is object, use supported extensions and provided list to choose best option
        // Get first supported match, so put in order of preference
        if (typeof src === 'object') {
            for (const prop in src) {
                if (support.includes(prop.toLowerCase())) {
                    ext = prop.toLowerCase();
                    src = src[prop];
                    break;
                }
            }
        }

        // Stringify props
        const cacheID =
            src +
            wrapS +
            wrapT +
            anisotropy +
            format +
            internalFormat +
            generateMipmaps +
            minFilter +
            magFilter +
            premultiplyAlpha +
            unpackAlignment +
            flipY +
            gl.renderer.id;

        // Check cache for existing texture
        if (cache[cacheID]) return cache[cacheID];

        let texture;
        switch (ext) {
            case 'ktx':
            case 'pvrtc':
            case 's3tc':
            case 'etc':
            case 'etc1':
            case 'astc':
                // Load compressed texture using KTX format
                texture = new _KTXTexture_js__WEBPACK_IMPORTED_MODULE_0__.KTXTexture(gl, {
                    src,
                    wrapS,
                    wrapT,
                    anisotropy,
                    minFilter,
                    magFilter,
                });
                texture.loaded = this.loadKTX(src, texture);
                break;
            case 'webp':
            case 'jpg':
            case 'jpeg':
            case 'png':
                texture = new _core_Texture_js__WEBPACK_IMPORTED_MODULE_1__.Texture(gl, {
                    wrapS,
                    wrapT,
                    anisotropy,
                    format,
                    internalFormat,
                    generateMipmaps,
                    minFilter,
                    magFilter,
                    premultiplyAlpha,
                    unpackAlignment,
                    flipY,
                });
                texture.loaded = this.loadImage(gl, src, texture);
                break;
            default:
                console.warn('No supported format supplied');
                texture = new _core_Texture_js__WEBPACK_IMPORTED_MODULE_1__.Texture(gl);
        }

        texture.ext = ext;
        cache[cacheID] = texture;
        return texture;
    }

    static getSupportedExtensions(gl) {
        if (supportedExtensions.length) return supportedExtensions;

        const extensions = {
            pvrtc: gl.renderer.getExtension('WEBGL_compressed_texture_pvrtc') || gl.renderer.getExtension('WEBKIT_WEBGL_compressed_texture_pvrtc'),
            s3tc:
                gl.renderer.getExtension('WEBGL_compressed_texture_s3tc') ||
                gl.renderer.getExtension('MOZ_WEBGL_compressed_texture_s3tc') ||
                gl.renderer.getExtension('WEBKIT_WEBGL_compressed_texture_s3tc'),
            etc: gl.renderer.getExtension('WEBGL_compressed_texture_etc'),
            etc1: gl.renderer.getExtension('WEBGL_compressed_texture_etc1'),
            astc: gl.renderer.getExtension('WEBGL_compressed_texture_astc'),
        };

        for (const ext in extensions) if (extensions[ext]) supportedExtensions.push(ext);

        // Check for WebP support
        if (detectWebP) supportedExtensions.push('webp');

        // Formats supported by all
        supportedExtensions.push('png', 'jpg');

        return supportedExtensions;
    }

    static loadKTX(src, texture) {
        return fetch(src)
            .then((res) => res.arrayBuffer())
            .then((buffer) => texture.parseBuffer(buffer));
    }

    static loadImage(gl, src, texture) {
        return decodeImage(src).then((imgBmp) => {
            // Catch non POT textures and update params to avoid errors
            if (!powerOfTwo(imgBmp.width) || !powerOfTwo(imgBmp.height)) {
                if (texture.generateMipmaps) texture.generateMipmaps = false;
                if (texture.minFilter === gl.NEAREST_MIPMAP_LINEAR) texture.minFilter = gl.LINEAR;
                if (texture.wrapS === gl.REPEAT) texture.wrapS = texture.wrapT = gl.CLAMP_TO_EDGE;
            }

            texture.image = imgBmp;

            // For createImageBitmap, close once uploaded
            texture.onUpdate = () => {
                if (imgBmp.close) imgBmp.close();
                texture.onUpdate = null;
            };

            return imgBmp;
        });
    }

    static clearCache() {
        cache = {};
    }
}

function detectWebP() {
    return document.createElement('canvas').toDataURL('image/webp').indexOf('data:image/webp') == 0;
}

function powerOfTwo(value) {
    return Math.log2(value) % 1 === 0;
}

function decodeImage(src) {
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = '';
        img.src = src;

        // Only chrome's implementation of createImageBitmap is fully supported
        const isChrome = navigator.userAgent.toLowerCase().includes('chrome');
        if (!!window.createImageBitmap && isChrome) {
            img.onload = () => {
                createImageBitmap(img, {
                    imageOrientation: 'flipY',
                    premultiplyAlpha: 'none',
                }).then((imgBmp) => {
                    resolve(imgBmp);
                });
            };
        } else {
            img.onload = () => resolve(img);
        }
    });
}


/***/ }),

/***/ "./src/extras/Torus.js":
/*!*****************************!*\
  !*** ./src/extras/Torus.js ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Torus": () => (/* binding */ Torus)
/* harmony export */ });
/* harmony import */ var _core_Geometry_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../core/Geometry.js */ "./src/core/Geometry.js");
/* harmony import */ var _math_Vec3_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../math/Vec3.js */ "./src/math/Vec3.js");
// https://github.com/mrdoob/three.js/blob/master/src/geometries/TorusGeometry.js




class Torus extends _core_Geometry_js__WEBPACK_IMPORTED_MODULE_0__.Geometry {
    constructor(gl, { radius = 0.5, tube = 0.2, radialSegments = 8, tubularSegments = 6, arc = Math.PI * 2, attributes = {} } = {}) {
        const num = (radialSegments + 1) * (tubularSegments + 1);
        const numIndices = radialSegments * tubularSegments * 6;

        const vertices = new Float32Array(num * 3);
        const normals = new Float32Array(num * 3);
        const uvs = new Float32Array(num * 2);
        const indices = num > 65536 ? new Uint32Array(numIndices) : new Uint16Array(numIndices);

        const center = new _math_Vec3_js__WEBPACK_IMPORTED_MODULE_1__.Vec3();
        const vertex = new _math_Vec3_js__WEBPACK_IMPORTED_MODULE_1__.Vec3();
        const normal = new _math_Vec3_js__WEBPACK_IMPORTED_MODULE_1__.Vec3();

        // generate vertices, normals and uvs
        let idx = 0;
        for (let j = 0; j <= radialSegments; j++) {
            for (let i = 0; i <= tubularSegments; i++, idx++) {
                const u = (i / tubularSegments) * arc;
                const v = (j / radialSegments) * Math.PI * 2;

                // vertex
                vertex.x = (radius + tube * Math.cos(v)) * Math.cos(u);
                vertex.y = (radius + tube * Math.cos(v)) * Math.sin(u);
                vertex.z = tube * Math.sin(v);

                vertices.set([vertex.x, vertex.y, vertex.z], idx * 3);

                // normal
                center.x = radius * Math.cos(u);
                center.y = radius * Math.sin(u);
                normal.sub(vertex, center).normalize();

                normals.set([normal.x, normal.y, normal.z], idx * 3);

                // uv
                uvs.set([i / tubularSegments, j / radialSegments], idx * 2);
            }
        }

        // generate indices
        idx = 0;
        for (let j = 1; j <= radialSegments; j++) {
            for (let i = 1; i <= tubularSegments; i++, idx++) {
                // indices
                const a = (tubularSegments + 1) * j + i - 1;
                const b = (tubularSegments + 1) * (j - 1) + i - 1;
                const c = (tubularSegments + 1) * (j - 1) + i;
                const d = (tubularSegments + 1) * j + i;

                // faces
                indices.set([a, b, d, b, c, d], idx * 6);
            }
        }

        Object.assign(attributes, {
            position: { size: 3, data: vertices },
            normal: { size: 3, data: normals },
            uv: { size: 2, data: uvs },
            index: { data: indices },
        });

        super(gl, attributes);
    }
}


/***/ }),

/***/ "./src/extras/Triangle.js":
/*!********************************!*\
  !*** ./src/extras/Triangle.js ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Triangle": () => (/* binding */ Triangle)
/* harmony export */ });
/* harmony import */ var _core_Geometry_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../core/Geometry.js */ "./src/core/Geometry.js");


class Triangle extends _core_Geometry_js__WEBPACK_IMPORTED_MODULE_0__.Geometry {
    constructor(gl, { attributes = {} } = {}) {
        Object.assign(attributes, {
            position: { size: 2, data: new Float32Array([-1, -1, 3, -1, -1, 3]) },
            uv: { size: 2, data: new Float32Array([0, 0, 2, 0, 0, 2]) },
        });

        super(gl, attributes);
    }
}


/***/ }),

/***/ "./src/math/Color.js":
/*!***************************!*\
  !*** ./src/math/Color.js ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Color": () => (/* binding */ Color)
/* harmony export */ });
/* harmony import */ var _functions_ColorFunc_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./functions/ColorFunc.js */ "./src/math/functions/ColorFunc.js");


// Color stored as an array of RGB decimal values (between 0 > 1)
// Constructor and set method accept following formats:
// new Color() - Empty (defaults to black)
// new Color([0.2, 0.4, 1.0]) - Decimal Array (or another Color instance)
// new Color(0.7, 0.0, 0.1) - Decimal RGB values
// new Color('#ff0000') - Hex string
// new Color('#ccc') - Short-hand Hex string
// new Color(0x4f27e8) - Number
// new Color('red') - Color name string (short list in ColorFunc.js)

class Color extends Array {
    constructor(color) {
        if (Array.isArray(color)) return super(...color);
        return super(..._functions_ColorFunc_js__WEBPACK_IMPORTED_MODULE_0__.parseColor(...arguments));
    }

    get r() {
        return this[0];
    }

    get g() {
        return this[1];
    }

    get b() {
        return this[2];
    }

    set r(v) {
        this[0] = v;
    }

    set g(v) {
        this[1] = v;
    }

    set b(v) {
        this[2] = v;
    }

    set(color) {
        if (Array.isArray(color)) return this.copy(color);
        return this.copy(_functions_ColorFunc_js__WEBPACK_IMPORTED_MODULE_0__.parseColor(...arguments));
    }

    copy(v) {
        this[0] = v[0];
        this[1] = v[1];
        this[2] = v[2];
        return this;
    }
}


/***/ }),

/***/ "./src/math/Euler.js":
/*!***************************!*\
  !*** ./src/math/Euler.js ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Euler": () => (/* binding */ Euler)
/* harmony export */ });
/* harmony import */ var _functions_EulerFunc_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./functions/EulerFunc.js */ "./src/math/functions/EulerFunc.js");
/* harmony import */ var _Mat4_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Mat4.js */ "./src/math/Mat4.js");



const tmpMat4 = new _Mat4_js__WEBPACK_IMPORTED_MODULE_0__.Mat4();

class Euler extends Array {
    constructor(x = 0, y = x, z = x, order = 'YXZ') {
        super(x, y, z);
        this.order = order;
        this.onChange = () => {};
        return this;
    }

    get x() {
        return this[0];
    }

    get y() {
        return this[1];
    }

    get z() {
        return this[2];
    }

    set x(v) {
        this[0] = v;
        this.onChange();
    }

    set y(v) {
        this[1] = v;
        this.onChange();
    }

    set z(v) {
        this[2] = v;
        this.onChange();
    }

    set(x, y = x, z = x) {
        if (x.length) return this.copy(x);
        this[0] = x;
        this[1] = y;
        this[2] = z;
        this.onChange();
        return this;
    }

    copy(v) {
        this[0] = v[0];
        this[1] = v[1];
        this[2] = v[2];
        this.onChange();
        return this;
    }

    reorder(order) {
        this.order = order;
        this.onChange();
        return this;
    }

    fromRotationMatrix(m, order = this.order) {
        _functions_EulerFunc_js__WEBPACK_IMPORTED_MODULE_1__.fromRotationMatrix(this, m, order);
        return this;
    }

    fromQuaternion(q, order = this.order) {
        tmpMat4.fromQuaternion(q);
        return this.fromRotationMatrix(tmpMat4, order);
    }

    toArray(a = [], o = 0) {
        a[o] = this[0];
        a[o + 1] = this[1];
        a[o + 2] = this[2];
        return a;
    }
}


/***/ }),

/***/ "./src/math/Mat3.js":
/*!**************************!*\
  !*** ./src/math/Mat3.js ***!
  \**************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Mat3": () => (/* binding */ Mat3)
/* harmony export */ });
/* harmony import */ var _functions_Mat3Func_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./functions/Mat3Func.js */ "./src/math/functions/Mat3Func.js");


class Mat3 extends Array {
    constructor(m00 = 1, m01 = 0, m02 = 0, m10 = 0, m11 = 1, m12 = 0, m20 = 0, m21 = 0, m22 = 1) {
        super(m00, m01, m02, m10, m11, m12, m20, m21, m22);
        return this;
    }

    set(m00, m01, m02, m10, m11, m12, m20, m21, m22) {
        if (m00.length) return this.copy(m00);
        _functions_Mat3Func_js__WEBPACK_IMPORTED_MODULE_0__.set(this, m00, m01, m02, m10, m11, m12, m20, m21, m22);
        return this;
    }

    translate(v, m = this) {
        _functions_Mat3Func_js__WEBPACK_IMPORTED_MODULE_0__.translate(this, m, v);
        return this;
    }

    rotate(v, m = this) {
        _functions_Mat3Func_js__WEBPACK_IMPORTED_MODULE_0__.rotate(this, m, v);
        return this;
    }

    scale(v, m = this) {
        _functions_Mat3Func_js__WEBPACK_IMPORTED_MODULE_0__.scale(this, m, v);
        return this;
    }

    multiply(ma, mb) {
        if (mb) {
            _functions_Mat3Func_js__WEBPACK_IMPORTED_MODULE_0__.multiply(this, ma, mb);
        } else {
            _functions_Mat3Func_js__WEBPACK_IMPORTED_MODULE_0__.multiply(this, this, ma);
        }
        return this;
    }

    identity() {
        _functions_Mat3Func_js__WEBPACK_IMPORTED_MODULE_0__.identity(this);
        return this;
    }

    copy(m) {
        _functions_Mat3Func_js__WEBPACK_IMPORTED_MODULE_0__.copy(this, m);
        return this;
    }

    fromMatrix4(m) {
        _functions_Mat3Func_js__WEBPACK_IMPORTED_MODULE_0__.fromMat4(this, m);
        return this;
    }

    fromQuaternion(q) {
        _functions_Mat3Func_js__WEBPACK_IMPORTED_MODULE_0__.fromQuat(this, q);
        return this;
    }

    fromBasis(vec3a, vec3b, vec3c) {
        this.set(vec3a[0], vec3a[1], vec3a[2], vec3b[0], vec3b[1], vec3b[2], vec3c[0], vec3c[1], vec3c[2]);
        return this;
    }

    inverse(m = this) {
        _functions_Mat3Func_js__WEBPACK_IMPORTED_MODULE_0__.invert(this, m);
        return this;
    }

    getNormalMatrix(m) {
        _functions_Mat3Func_js__WEBPACK_IMPORTED_MODULE_0__.normalFromMat4(this, m);
        return this;
    }
}


/***/ }),

/***/ "./src/math/Mat4.js":
/*!**************************!*\
  !*** ./src/math/Mat4.js ***!
  \**************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Mat4": () => (/* binding */ Mat4)
/* harmony export */ });
/* harmony import */ var _functions_Mat4Func_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./functions/Mat4Func.js */ "./src/math/functions/Mat4Func.js");


class Mat4 extends Array {
    constructor(
        m00 = 1,
        m01 = 0,
        m02 = 0,
        m03 = 0,
        m10 = 0,
        m11 = 1,
        m12 = 0,
        m13 = 0,
        m20 = 0,
        m21 = 0,
        m22 = 1,
        m23 = 0,
        m30 = 0,
        m31 = 0,
        m32 = 0,
        m33 = 1
    ) {
        super(m00, m01, m02, m03, m10, m11, m12, m13, m20, m21, m22, m23, m30, m31, m32, m33);
        return this;
    }

    get x() {
        return this[12];
    }

    get y() {
        return this[13];
    }

    get z() {
        return this[14];
    }

    get w() {
        return this[15];
    }

    set x(v) {
        this[12] = v;
    }

    set y(v) {
        this[13] = v;
    }

    set z(v) {
        this[14] = v;
    }

    set w(v) {
        this[15] = v;
    }

    set(m00, m01, m02, m03, m10, m11, m12, m13, m20, m21, m22, m23, m30, m31, m32, m33) {
        if (m00.length) return this.copy(m00);
        _functions_Mat4Func_js__WEBPACK_IMPORTED_MODULE_0__.set(this, m00, m01, m02, m03, m10, m11, m12, m13, m20, m21, m22, m23, m30, m31, m32, m33);
        return this;
    }

    translate(v, m = this) {
        _functions_Mat4Func_js__WEBPACK_IMPORTED_MODULE_0__.translate(this, m, v);
        return this;
    }

    rotate(v, axis, m = this) {
        _functions_Mat4Func_js__WEBPACK_IMPORTED_MODULE_0__.rotate(this, m, v, axis);
        return this;
    }

    scale(v, m = this) {
        _functions_Mat4Func_js__WEBPACK_IMPORTED_MODULE_0__.scale(this, m, typeof v === 'number' ? [v, v, v] : v);
        return this;
    }

    multiply(ma, mb) {
        if (mb) {
            _functions_Mat4Func_js__WEBPACK_IMPORTED_MODULE_0__.multiply(this, ma, mb);
        } else {
            _functions_Mat4Func_js__WEBPACK_IMPORTED_MODULE_0__.multiply(this, this, ma);
        }
        return this;
    }

    identity() {
        _functions_Mat4Func_js__WEBPACK_IMPORTED_MODULE_0__.identity(this);
        return this;
    }

    copy(m) {
        _functions_Mat4Func_js__WEBPACK_IMPORTED_MODULE_0__.copy(this, m);
        return this;
    }

    fromPerspectiveFrustrum({ left, right, bottom, top, near, far }) {
        _functions_Mat4Func_js__WEBPACK_IMPORTED_MODULE_0__.perspectiveFrustrum(this, left, right, top, bottom, near, far);
        return this;
    }

    fromPerspective({ fov, aspect, near, far } = {}) {
        _functions_Mat4Func_js__WEBPACK_IMPORTED_MODULE_0__.perspective(this, fov, aspect, near, far);
        return this;
    }

    fromOrthogonal({ left, right, bottom, top, near, far }) {
        _functions_Mat4Func_js__WEBPACK_IMPORTED_MODULE_0__.ortho(this, left, right, bottom, top, near, far);
        return this;
    }

    fromQuaternion(q) {
        _functions_Mat4Func_js__WEBPACK_IMPORTED_MODULE_0__.fromQuat(this, q);
        return this;
    }

    setPosition(v) {
        this.x = v[0];
        this.y = v[1];
        this.z = v[2];
        return this;
    }

    inverse(m = this) {
        _functions_Mat4Func_js__WEBPACK_IMPORTED_MODULE_0__.invert(this, m);
        return this;
    }

    compose(q, pos, scale) {
        _functions_Mat4Func_js__WEBPACK_IMPORTED_MODULE_0__.fromRotationTranslationScale(this, q, pos, scale);
        return this;
    }

    getRotation(q) {
        _functions_Mat4Func_js__WEBPACK_IMPORTED_MODULE_0__.getRotation(q, this);
        return this;
    }

    getTranslation(pos) {
        _functions_Mat4Func_js__WEBPACK_IMPORTED_MODULE_0__.getTranslation(pos, this);
        return this;
    }

    getScaling(scale) {
        _functions_Mat4Func_js__WEBPACK_IMPORTED_MODULE_0__.getScaling(scale, this);
        return this;
    }

    getMaxScaleOnAxis() {
        return _functions_Mat4Func_js__WEBPACK_IMPORTED_MODULE_0__.getMaxScaleOnAxis(this);
    }

    lookAt(eye, target, up) {
        _functions_Mat4Func_js__WEBPACK_IMPORTED_MODULE_0__.targetTo(this, eye, target, up);
        return this;
    }

    determinant() {
        return _functions_Mat4Func_js__WEBPACK_IMPORTED_MODULE_0__.determinant(this);
    }

    fromArray(a, o = 0) {
        this[0] = a[o];
        this[1] = a[o + 1];
        this[2] = a[o + 2];
        this[3] = a[o + 3];
        this[4] = a[o + 4];
        this[5] = a[o + 5];
        this[6] = a[o + 6];
        this[7] = a[o + 7];
        this[8] = a[o + 8];
        this[9] = a[o + 9];
        this[10] = a[o + 10];
        this[11] = a[o + 11];
        this[12] = a[o + 12];
        this[13] = a[o + 13];
        this[14] = a[o + 14];
        this[15] = a[o + 15];
        return this;
    }

    toArray(a = [], o = 0) {
        a[o] = this[0];
        a[o + 1] = this[1];
        a[o + 2] = this[2];
        a[o + 3] = this[3];
        a[o + 4] = this[4];
        a[o + 5] = this[5];
        a[o + 6] = this[6];
        a[o + 7] = this[7];
        a[o + 8] = this[8];
        a[o + 9] = this[9];
        a[o + 10] = this[10];
        a[o + 11] = this[11];
        a[o + 12] = this[12];
        a[o + 13] = this[13];
        a[o + 14] = this[14];
        a[o + 15] = this[15];
        return a;
    }
}


/***/ }),

/***/ "./src/math/Quat.js":
/*!**************************!*\
  !*** ./src/math/Quat.js ***!
  \**************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Quat": () => (/* binding */ Quat)
/* harmony export */ });
/* harmony import */ var _functions_QuatFunc_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./functions/QuatFunc.js */ "./src/math/functions/QuatFunc.js");


class Quat extends Array {
    constructor(x = 0, y = 0, z = 0, w = 1) {
        super(x, y, z, w);
        this.onChange = () => {};
        return this;
    }

    get x() {
        return this[0];
    }

    get y() {
        return this[1];
    }

    get z() {
        return this[2];
    }

    get w() {
        return this[3];
    }

    set x(v) {
        this[0] = v;
        this.onChange();
    }

    set y(v) {
        this[1] = v;
        this.onChange();
    }

    set z(v) {
        this[2] = v;
        this.onChange();
    }

    set w(v) {
        this[3] = v;
        this.onChange();
    }

    identity() {
        _functions_QuatFunc_js__WEBPACK_IMPORTED_MODULE_0__.identity(this);
        this.onChange();
        return this;
    }

    set(x, y, z, w) {
        if (x.length) return this.copy(x);
        _functions_QuatFunc_js__WEBPACK_IMPORTED_MODULE_0__.set(this, x, y, z, w);
        this.onChange();
        return this;
    }

    rotateX(a) {
        _functions_QuatFunc_js__WEBPACK_IMPORTED_MODULE_0__.rotateX(this, this, a);
        this.onChange();
        return this;
    }

    rotateY(a) {
        _functions_QuatFunc_js__WEBPACK_IMPORTED_MODULE_0__.rotateY(this, this, a);
        this.onChange();
        return this;
    }

    rotateZ(a) {
        _functions_QuatFunc_js__WEBPACK_IMPORTED_MODULE_0__.rotateZ(this, this, a);
        this.onChange();
        return this;
    }

    inverse(q = this) {
        _functions_QuatFunc_js__WEBPACK_IMPORTED_MODULE_0__.invert(this, q);
        this.onChange();
        return this;
    }

    conjugate(q = this) {
        _functions_QuatFunc_js__WEBPACK_IMPORTED_MODULE_0__.conjugate(this, q);
        this.onChange();
        return this;
    }

    copy(q) {
        _functions_QuatFunc_js__WEBPACK_IMPORTED_MODULE_0__.copy(this, q);
        this.onChange();
        return this;
    }

    normalize(q = this) {
        _functions_QuatFunc_js__WEBPACK_IMPORTED_MODULE_0__.normalize(this, q);
        this.onChange();
        return this;
    }

    multiply(qA, qB) {
        if (qB) {
            _functions_QuatFunc_js__WEBPACK_IMPORTED_MODULE_0__.multiply(this, qA, qB);
        } else {
            _functions_QuatFunc_js__WEBPACK_IMPORTED_MODULE_0__.multiply(this, this, qA);
        }
        this.onChange();
        return this;
    }

    dot(v) {
        return _functions_QuatFunc_js__WEBPACK_IMPORTED_MODULE_0__.dot(this, v);
    }

    fromMatrix3(matrix3) {
        _functions_QuatFunc_js__WEBPACK_IMPORTED_MODULE_0__.fromMat3(this, matrix3);
        this.onChange();
        return this;
    }

    fromEuler(euler) {
        _functions_QuatFunc_js__WEBPACK_IMPORTED_MODULE_0__.fromEuler(this, euler, euler.order);
        return this;
    }

    fromAxisAngle(axis, a) {
        _functions_QuatFunc_js__WEBPACK_IMPORTED_MODULE_0__.setAxisAngle(this, axis, a);
        return this;
    }

    slerp(q, t) {
        _functions_QuatFunc_js__WEBPACK_IMPORTED_MODULE_0__.slerp(this, this, q, t);
        return this;
    }

    fromArray(a, o = 0) {
        this[0] = a[o];
        this[1] = a[o + 1];
        this[2] = a[o + 2];
        this[3] = a[o + 3];
        return this;
    }

    toArray(a = [], o = 0) {
        a[o] = this[0];
        a[o + 1] = this[1];
        a[o + 2] = this[2];
        a[o + 3] = this[3];
        return a;
    }
}


/***/ }),

/***/ "./src/math/Vec2.js":
/*!**************************!*\
  !*** ./src/math/Vec2.js ***!
  \**************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Vec2": () => (/* binding */ Vec2)
/* harmony export */ });
/* harmony import */ var _functions_Vec2Func_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./functions/Vec2Func.js */ "./src/math/functions/Vec2Func.js");


class Vec2 extends Array {
    constructor(x = 0, y = x) {
        super(x, y);
        return this;
    }

    get x() {
        return this[0];
    }

    get y() {
        return this[1];
    }

    set x(v) {
        this[0] = v;
    }

    set y(v) {
        this[1] = v;
    }

    set(x, y = x) {
        if (x.length) return this.copy(x);
        _functions_Vec2Func_js__WEBPACK_IMPORTED_MODULE_0__.set(this, x, y);
        return this;
    }

    copy(v) {
        _functions_Vec2Func_js__WEBPACK_IMPORTED_MODULE_0__.copy(this, v);
        return this;
    }

    add(va, vb) {
        if (vb) _functions_Vec2Func_js__WEBPACK_IMPORTED_MODULE_0__.add(this, va, vb);
        else _functions_Vec2Func_js__WEBPACK_IMPORTED_MODULE_0__.add(this, this, va);
        return this;
    }

    sub(va, vb) {
        if (vb) _functions_Vec2Func_js__WEBPACK_IMPORTED_MODULE_0__.subtract(this, va, vb);
        else _functions_Vec2Func_js__WEBPACK_IMPORTED_MODULE_0__.subtract(this, this, va);
        return this;
    }

    multiply(v) {
        if (v.length) _functions_Vec2Func_js__WEBPACK_IMPORTED_MODULE_0__.multiply(this, this, v);
        else _functions_Vec2Func_js__WEBPACK_IMPORTED_MODULE_0__.scale(this, this, v);
        return this;
    }

    divide(v) {
        if (v.length) _functions_Vec2Func_js__WEBPACK_IMPORTED_MODULE_0__.divide(this, this, v);
        else _functions_Vec2Func_js__WEBPACK_IMPORTED_MODULE_0__.scale(this, this, 1 / v);
        return this;
    }

    inverse(v = this) {
        _functions_Vec2Func_js__WEBPACK_IMPORTED_MODULE_0__.inverse(this, v);
        return this;
    }

    // Can't use 'length' as Array.prototype uses it
    len() {
        return _functions_Vec2Func_js__WEBPACK_IMPORTED_MODULE_0__.length(this);
    }

    distance(v) {
        if (v) return _functions_Vec2Func_js__WEBPACK_IMPORTED_MODULE_0__.distance(this, v);
        else return _functions_Vec2Func_js__WEBPACK_IMPORTED_MODULE_0__.length(this);
    }

    squaredLen() {
        return this.squaredDistance();
    }

    squaredDistance(v) {
        if (v) return _functions_Vec2Func_js__WEBPACK_IMPORTED_MODULE_0__.squaredDistance(this, v);
        else return _functions_Vec2Func_js__WEBPACK_IMPORTED_MODULE_0__.squaredLength(this);
    }

    negate(v = this) {
        _functions_Vec2Func_js__WEBPACK_IMPORTED_MODULE_0__.negate(this, v);
        return this;
    }

    cross(va, vb) {
        if (vb) return _functions_Vec2Func_js__WEBPACK_IMPORTED_MODULE_0__.cross(va, vb);
        return _functions_Vec2Func_js__WEBPACK_IMPORTED_MODULE_0__.cross(this, va);
    }

    scale(v) {
        _functions_Vec2Func_js__WEBPACK_IMPORTED_MODULE_0__.scale(this, this, v);
        return this;
    }

    normalize() {
        _functions_Vec2Func_js__WEBPACK_IMPORTED_MODULE_0__.normalize(this, this);
        return this;
    }

    dot(v) {
        return _functions_Vec2Func_js__WEBPACK_IMPORTED_MODULE_0__.dot(this, v);
    }

    equals(v) {
        return _functions_Vec2Func_js__WEBPACK_IMPORTED_MODULE_0__.exactEquals(this, v);
    }

    applyMatrix3(mat3) {
        _functions_Vec2Func_js__WEBPACK_IMPORTED_MODULE_0__.transformMat3(this, this, mat3);
        return this;
    }

    applyMatrix4(mat4) {
        _functions_Vec2Func_js__WEBPACK_IMPORTED_MODULE_0__.transformMat4(this, this, mat4);
        return this;
    }

    lerp(v, a) {
        _functions_Vec2Func_js__WEBPACK_IMPORTED_MODULE_0__.lerp(this, this, v, a);
    }

    clone() {
        return new Vec2(this[0], this[1]);
    }

    fromArray(a, o = 0) {
        this[0] = a[o];
        this[1] = a[o + 1];
        return this;
    }

    toArray(a = [], o = 0) {
        a[o] = this[0];
        a[o + 1] = this[1];
        return a;
    }
}


/***/ }),

/***/ "./src/math/Vec3.js":
/*!**************************!*\
  !*** ./src/math/Vec3.js ***!
  \**************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Vec3": () => (/* binding */ Vec3)
/* harmony export */ });
/* harmony import */ var _functions_Vec3Func_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./functions/Vec3Func.js */ "./src/math/functions/Vec3Func.js");


class Vec3 extends Array {
    constructor(x = 0, y = x, z = x) {
        super(x, y, z);
        return this;
    }

    get x() {
        return this[0];
    }

    get y() {
        return this[1];
    }

    get z() {
        return this[2];
    }

    set x(v) {
        this[0] = v;
    }

    set y(v) {
        this[1] = v;
    }

    set z(v) {
        this[2] = v;
    }

    set(x, y = x, z = x) {
        if (x.length) return this.copy(x);
        _functions_Vec3Func_js__WEBPACK_IMPORTED_MODULE_0__.set(this, x, y, z);
        return this;
    }

    copy(v) {
        _functions_Vec3Func_js__WEBPACK_IMPORTED_MODULE_0__.copy(this, v);
        return this;
    }

    add(va, vb) {
        if (vb) _functions_Vec3Func_js__WEBPACK_IMPORTED_MODULE_0__.add(this, va, vb);
        else _functions_Vec3Func_js__WEBPACK_IMPORTED_MODULE_0__.add(this, this, va);
        return this;
    }

    sub(va, vb) {
        if (vb) _functions_Vec3Func_js__WEBPACK_IMPORTED_MODULE_0__.subtract(this, va, vb);
        else _functions_Vec3Func_js__WEBPACK_IMPORTED_MODULE_0__.subtract(this, this, va);
        return this;
    }

    multiply(v) {
        if (v.length) _functions_Vec3Func_js__WEBPACK_IMPORTED_MODULE_0__.multiply(this, this, v);
        else _functions_Vec3Func_js__WEBPACK_IMPORTED_MODULE_0__.scale(this, this, v);
        return this;
    }

    divide(v) {
        if (v.length) _functions_Vec3Func_js__WEBPACK_IMPORTED_MODULE_0__.divide(this, this, v);
        else _functions_Vec3Func_js__WEBPACK_IMPORTED_MODULE_0__.scale(this, this, 1 / v);
        return this;
    }

    inverse(v = this) {
        _functions_Vec3Func_js__WEBPACK_IMPORTED_MODULE_0__.inverse(this, v);
        return this;
    }

    // Can't use 'length' as Array.prototype uses it
    len() {
        return _functions_Vec3Func_js__WEBPACK_IMPORTED_MODULE_0__.length(this);
    }

    distance(v) {
        if (v) return _functions_Vec3Func_js__WEBPACK_IMPORTED_MODULE_0__.distance(this, v);
        else return _functions_Vec3Func_js__WEBPACK_IMPORTED_MODULE_0__.length(this);
    }

    squaredLen() {
        return _functions_Vec3Func_js__WEBPACK_IMPORTED_MODULE_0__.squaredLength(this);
    }

    squaredDistance(v) {
        if (v) return _functions_Vec3Func_js__WEBPACK_IMPORTED_MODULE_0__.squaredDistance(this, v);
        else return _functions_Vec3Func_js__WEBPACK_IMPORTED_MODULE_0__.squaredLength(this);
    }

    negate(v = this) {
        _functions_Vec3Func_js__WEBPACK_IMPORTED_MODULE_0__.negate(this, v);
        return this;
    }

    cross(va, vb) {
        if (vb) _functions_Vec3Func_js__WEBPACK_IMPORTED_MODULE_0__.cross(this, va, vb);
        else _functions_Vec3Func_js__WEBPACK_IMPORTED_MODULE_0__.cross(this, this, va);
        return this;
    }

    scale(v) {
        _functions_Vec3Func_js__WEBPACK_IMPORTED_MODULE_0__.scale(this, this, v);
        return this;
    }

    normalize() {
        _functions_Vec3Func_js__WEBPACK_IMPORTED_MODULE_0__.normalize(this, this);
        return this;
    }

    dot(v) {
        return _functions_Vec3Func_js__WEBPACK_IMPORTED_MODULE_0__.dot(this, v);
    }

    equals(v) {
        return _functions_Vec3Func_js__WEBPACK_IMPORTED_MODULE_0__.exactEquals(this, v);
    }

    applyMatrix4(mat4) {
        _functions_Vec3Func_js__WEBPACK_IMPORTED_MODULE_0__.transformMat4(this, this, mat4);
        return this;
    }

    scaleRotateMatrix4(mat4) {
        _functions_Vec3Func_js__WEBPACK_IMPORTED_MODULE_0__.scaleRotateMat4(this, this, mat4);
        return this;
    }

    applyQuaternion(q) {
        _functions_Vec3Func_js__WEBPACK_IMPORTED_MODULE_0__.transformQuat(this, this, q);
        return this;
    }

    angle(v) {
        return _functions_Vec3Func_js__WEBPACK_IMPORTED_MODULE_0__.angle(this, v);
    }

    lerp(v, t) {
        _functions_Vec3Func_js__WEBPACK_IMPORTED_MODULE_0__.lerp(this, this, v, t);
        return this;
    }

    clone() {
        return new Vec3(this[0], this[1], this[2]);
    }

    fromArray(a, o = 0) {
        this[0] = a[o];
        this[1] = a[o + 1];
        this[2] = a[o + 2];
        return this;
    }

    toArray(a = [], o = 0) {
        a[o] = this[0];
        a[o + 1] = this[1];
        a[o + 2] = this[2];
        return a;
    }

    transformDirection(mat4) {
        const x = this[0];
        const y = this[1];
        const z = this[2];

        this[0] = mat4[0] * x + mat4[4] * y + mat4[8] * z;
        this[1] = mat4[1] * x + mat4[5] * y + mat4[9] * z;
        this[2] = mat4[2] * x + mat4[6] * y + mat4[10] * z;

        return this.normalize();
    }
}


/***/ }),

/***/ "./src/math/Vec4.js":
/*!**************************!*\
  !*** ./src/math/Vec4.js ***!
  \**************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Vec4": () => (/* binding */ Vec4)
/* harmony export */ });
/* harmony import */ var _functions_Vec4Func_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./functions/Vec4Func.js */ "./src/math/functions/Vec4Func.js");


class Vec4 extends Array {
    constructor(x = 0, y = x, z = x, w = x) {
        super(x, y, z, w);
        return this;
    }

    get x() {
        return this[0];
    }

    get y() {
        return this[1];
    }

    get z() {
        return this[2];
    }

    get w() {
        return this[3];
    }

    set x(v) {
        this[0] = v;
    }

    set y(v) {
        this[1] = v;
    }

    set z(v) {
        this[2] = v;
    }

    set w(v) {
        this[3] = v;
    }

    set(x, y, z, w) {
        if (x.length) return this.copy(x);
        _functions_Vec4Func_js__WEBPACK_IMPORTED_MODULE_0__.set(this, x, y, z, w);
        return this;
    }

    copy(v) {
        _functions_Vec4Func_js__WEBPACK_IMPORTED_MODULE_0__.copy(this, v);
        return this;
    }

    normalize() {
        _functions_Vec4Func_js__WEBPACK_IMPORTED_MODULE_0__.normalize(this, this);
        return this;
    }

    fromArray(a, o = 0) {
        this[0] = a[o];
        this[1] = a[o + 1];
        this[2] = a[o + 2];
        this[3] = a[o + 3];
        return this;
    }

    toArray(a = [], o = 0) {
        a[o] = this[0];
        a[o + 1] = this[1];
        a[o + 2] = this[2];
        a[o + 3] = this[3];
        return a;
    }
}


/***/ }),

/***/ "./src/math/functions/ColorFunc.js":
/*!*****************************************!*\
  !*** ./src/math/functions/ColorFunc.js ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "hexToRGB": () => (/* binding */ hexToRGB),
/* harmony export */   "numberToRGB": () => (/* binding */ numberToRGB),
/* harmony export */   "parseColor": () => (/* binding */ parseColor)
/* harmony export */ });
const NAMES = {
    black: '#000000',
    white: '#ffffff',
    red: '#ff0000',
    green: '#00ff00',
    blue: '#0000ff',
    fuchsia: '#ff00ff',
    cyan: '#00ffff',
    yellow: '#ffff00',
    orange: '#ff8000',
};

function hexToRGB(hex) {
    if (hex.length === 4) hex = hex[0] + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
    const rgb = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!rgb) console.warn(`Unable to convert hex string ${hex} to rgb values`);
    return [parseInt(rgb[1], 16) / 255, parseInt(rgb[2], 16) / 255, parseInt(rgb[3], 16) / 255];
}

function numberToRGB(num) {
    num = parseInt(num);
    return [((num >> 16) & 255) / 255, ((num >> 8) & 255) / 255, (num & 255) / 255];
}

function parseColor(color) {
    // Empty
    if (color === undefined) return [0, 0, 0];

    // Decimal
    if (arguments.length === 3) return arguments;

    // Number
    if (!isNaN(color)) return numberToRGB(color);

    // Hex
    if (color[0] === '#') return hexToRGB(color);

    // Names
    if (NAMES[color.toLowerCase()]) return hexToRGB(NAMES[color.toLowerCase()]);

    console.warn('Color format not recognised');
    return [0, 0, 0];
}


/***/ }),

/***/ "./src/math/functions/EulerFunc.js":
/*!*****************************************!*\
  !*** ./src/math/functions/EulerFunc.js ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "fromRotationMatrix": () => (/* binding */ fromRotationMatrix)
/* harmony export */ });
// assumes the upper 3x3 of m is a pure rotation matrix (i.e, unscaled)
function fromRotationMatrix(out, m, order = 'YXZ') {
    if (order === 'XYZ') {
        out[1] = Math.asin(Math.min(Math.max(m[8], -1), 1));
        if (Math.abs(m[8]) < 0.99999) {
            out[0] = Math.atan2(-m[9], m[10]);
            out[2] = Math.atan2(-m[4], m[0]);
        } else {
            out[0] = Math.atan2(m[6], m[5]);
            out[2] = 0;
        }
    } else if (order === 'YXZ') {
        out[0] = Math.asin(-Math.min(Math.max(m[9], -1), 1));
        if (Math.abs(m[9]) < 0.99999) {
            out[1] = Math.atan2(m[8], m[10]);
            out[2] = Math.atan2(m[1], m[5]);
        } else {
            out[1] = Math.atan2(-m[2], m[0]);
            out[2] = 0;
        }
    } else if (order === 'ZXY') {
        out[0] = Math.asin(Math.min(Math.max(m[6], -1), 1));
        if (Math.abs(m[6]) < 0.99999) {
            out[1] = Math.atan2(-m[2], m[10]);
            out[2] = Math.atan2(-m[4], m[5]);
        } else {
            out[1] = 0;
            out[2] = Math.atan2(m[1], m[0]);
        }
    } else if (order === 'ZYX') {
        out[1] = Math.asin(-Math.min(Math.max(m[2], -1), 1));
        if (Math.abs(m[2]) < 0.99999) {
            out[0] = Math.atan2(m[6], m[10]);
            out[2] = Math.atan2(m[1], m[0]);
        } else {
            out[0] = 0;
            out[2] = Math.atan2(-m[4], m[5]);
        }
    } else if (order === 'YZX') {
        out[2] = Math.asin(Math.min(Math.max(m[1], -1), 1));
        if (Math.abs(m[1]) < 0.99999) {
            out[0] = Math.atan2(-m[9], m[5]);
            out[1] = Math.atan2(-m[2], m[0]);
        } else {
            out[0] = 0;
            out[1] = Math.atan2(m[8], m[10]);
        }
    } else if (order === 'XZY') {
        out[2] = Math.asin(-Math.min(Math.max(m[4], -1), 1));
        if (Math.abs(m[4]) < 0.99999) {
            out[0] = Math.atan2(m[6], m[5]);
            out[1] = Math.atan2(m[8], m[0]);
        } else {
            out[0] = Math.atan2(-m[9], m[10]);
            out[1] = 0;
        }
    }

    return out;
}


/***/ }),

/***/ "./src/math/functions/Mat3Func.js":
/*!****************************************!*\
  !*** ./src/math/functions/Mat3Func.js ***!
  \****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "fromMat4": () => (/* binding */ fromMat4),
/* harmony export */   "fromQuat": () => (/* binding */ fromQuat),
/* harmony export */   "copy": () => (/* binding */ copy),
/* harmony export */   "set": () => (/* binding */ set),
/* harmony export */   "identity": () => (/* binding */ identity),
/* harmony export */   "transpose": () => (/* binding */ transpose),
/* harmony export */   "invert": () => (/* binding */ invert),
/* harmony export */   "determinant": () => (/* binding */ determinant),
/* harmony export */   "multiply": () => (/* binding */ multiply),
/* harmony export */   "translate": () => (/* binding */ translate),
/* harmony export */   "rotate": () => (/* binding */ rotate),
/* harmony export */   "scale": () => (/* binding */ scale),
/* harmony export */   "normalFromMat4": () => (/* binding */ normalFromMat4),
/* harmony export */   "projection": () => (/* binding */ projection),
/* harmony export */   "add": () => (/* binding */ add),
/* harmony export */   "subtract": () => (/* binding */ subtract),
/* harmony export */   "multiplyScalar": () => (/* binding */ multiplyScalar)
/* harmony export */ });
const EPSILON = 0.000001;

/**
 * Copies the upper-left 3x3 values into the given mat3.
 *
 * @param {mat3} out the receiving 3x3 matrix
 * @param {mat4} a   the source 4x4 matrix
 * @returns {mat3} out
 */
function fromMat4(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[4];
    out[4] = a[5];
    out[5] = a[6];
    out[6] = a[8];
    out[7] = a[9];
    out[8] = a[10];
    return out;
}

/**
 * Calculates a 3x3 matrix from the given quaternion
 *
 * @param {mat3} out mat3 receiving operation result
 * @param {quat} q Quaternion to create matrix from
 *
 * @returns {mat3} out
 */
function fromQuat(out, q) {
    let x = q[0],
        y = q[1],
        z = q[2],
        w = q[3];
    let x2 = x + x;
    let y2 = y + y;
    let z2 = z + z;

    let xx = x * x2;
    let yx = y * x2;
    let yy = y * y2;
    let zx = z * x2;
    let zy = z * y2;
    let zz = z * z2;
    let wx = w * x2;
    let wy = w * y2;
    let wz = w * z2;

    out[0] = 1 - yy - zz;
    out[3] = yx - wz;
    out[6] = zx + wy;

    out[1] = yx + wz;
    out[4] = 1 - xx - zz;
    out[7] = zy - wx;

    out[2] = zx - wy;
    out[5] = zy + wx;
    out[8] = 1 - xx - yy;

    return out;
}

/**
 * Copy the values from one mat3 to another
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the source matrix
 * @returns {mat3} out
 */
function copy(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    out[4] = a[4];
    out[5] = a[5];
    out[6] = a[6];
    out[7] = a[7];
    out[8] = a[8];
    return out;
}

/**
 * Set the components of a mat3 to the given values
 *
 * @param {mat3} out the receiving matrix
 * @returns {mat3} out
 */
function set(out, m00, m01, m02, m10, m11, m12, m20, m21, m22) {
    out[0] = m00;
    out[1] = m01;
    out[2] = m02;
    out[3] = m10;
    out[4] = m11;
    out[5] = m12;
    out[6] = m20;
    out[7] = m21;
    out[8] = m22;
    return out;
}

/**
 * Set a mat3 to the identity matrix
 *
 * @param {mat3} out the receiving matrix
 * @returns {mat3} out
 */
function identity(out) {
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 1;
    out[5] = 0;
    out[6] = 0;
    out[7] = 0;
    out[8] = 1;
    return out;
}

/**
 * Transpose the values of a mat3
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the source matrix
 * @returns {mat3} out
 */
function transpose(out, a) {
    // If we are transposing ourselves we can skip a few steps but have to cache some values
    if (out === a) {
        let a01 = a[1],
            a02 = a[2],
            a12 = a[5];
        out[1] = a[3];
        out[2] = a[6];
        out[3] = a01;
        out[5] = a[7];
        out[6] = a02;
        out[7] = a12;
    } else {
        out[0] = a[0];
        out[1] = a[3];
        out[2] = a[6];
        out[3] = a[1];
        out[4] = a[4];
        out[5] = a[7];
        out[6] = a[2];
        out[7] = a[5];
        out[8] = a[8];
    }

    return out;
}

/**
 * Inverts a mat3
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the source matrix
 * @returns {mat3} out
 */
function invert(out, a) {
    let a00 = a[0],
        a01 = a[1],
        a02 = a[2];
    let a10 = a[3],
        a11 = a[4],
        a12 = a[5];
    let a20 = a[6],
        a21 = a[7],
        a22 = a[8];

    let b01 = a22 * a11 - a12 * a21;
    let b11 = -a22 * a10 + a12 * a20;
    let b21 = a21 * a10 - a11 * a20;

    // Calculate the determinant
    let det = a00 * b01 + a01 * b11 + a02 * b21;

    if (!det) {
        return null;
    }
    det = 1.0 / det;

    out[0] = b01 * det;
    out[1] = (-a22 * a01 + a02 * a21) * det;
    out[2] = (a12 * a01 - a02 * a11) * det;
    out[3] = b11 * det;
    out[4] = (a22 * a00 - a02 * a20) * det;
    out[5] = (-a12 * a00 + a02 * a10) * det;
    out[6] = b21 * det;
    out[7] = (-a21 * a00 + a01 * a20) * det;
    out[8] = (a11 * a00 - a01 * a10) * det;
    return out;
}

/**
 * Calculates the determinant of a mat3
 *
 * @param {mat3} a the source matrix
 * @returns {Number} determinant of a
 */
function determinant(a) {
    let a00 = a[0],
        a01 = a[1],
        a02 = a[2];
    let a10 = a[3],
        a11 = a[4],
        a12 = a[5];
    let a20 = a[6],
        a21 = a[7],
        a22 = a[8];

    return a00 * (a22 * a11 - a12 * a21) + a01 * (-a22 * a10 + a12 * a20) + a02 * (a21 * a10 - a11 * a20);
}

/**
 * Multiplies two mat3's
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the first operand
 * @param {mat3} b the second operand
 * @returns {mat3} out
 */
function multiply(out, a, b) {
    let a00 = a[0],
        a01 = a[1],
        a02 = a[2];
    let a10 = a[3],
        a11 = a[4],
        a12 = a[5];
    let a20 = a[6],
        a21 = a[7],
        a22 = a[8];

    let b00 = b[0],
        b01 = b[1],
        b02 = b[2];
    let b10 = b[3],
        b11 = b[4],
        b12 = b[5];
    let b20 = b[6],
        b21 = b[7],
        b22 = b[8];

    out[0] = b00 * a00 + b01 * a10 + b02 * a20;
    out[1] = b00 * a01 + b01 * a11 + b02 * a21;
    out[2] = b00 * a02 + b01 * a12 + b02 * a22;

    out[3] = b10 * a00 + b11 * a10 + b12 * a20;
    out[4] = b10 * a01 + b11 * a11 + b12 * a21;
    out[5] = b10 * a02 + b11 * a12 + b12 * a22;

    out[6] = b20 * a00 + b21 * a10 + b22 * a20;
    out[7] = b20 * a01 + b21 * a11 + b22 * a21;
    out[8] = b20 * a02 + b21 * a12 + b22 * a22;
    return out;
}

/**
 * Translate a mat3 by the given vector
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the matrix to translate
 * @param {vec2} v vector to translate by
 * @returns {mat3} out
 */
function translate(out, a, v) {
    let a00 = a[0],
        a01 = a[1],
        a02 = a[2],
        a10 = a[3],
        a11 = a[4],
        a12 = a[5],
        a20 = a[6],
        a21 = a[7],
        a22 = a[8],
        x = v[0],
        y = v[1];

    out[0] = a00;
    out[1] = a01;
    out[2] = a02;

    out[3] = a10;
    out[4] = a11;
    out[5] = a12;

    out[6] = x * a00 + y * a10 + a20;
    out[7] = x * a01 + y * a11 + a21;
    out[8] = x * a02 + y * a12 + a22;
    return out;
}

/**
 * Rotates a mat3 by the given angle
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat3} out
 */
function rotate(out, a, rad) {
    let a00 = a[0],
        a01 = a[1],
        a02 = a[2],
        a10 = a[3],
        a11 = a[4],
        a12 = a[5],
        a20 = a[6],
        a21 = a[7],
        a22 = a[8],
        s = Math.sin(rad),
        c = Math.cos(rad);

    out[0] = c * a00 + s * a10;
    out[1] = c * a01 + s * a11;
    out[2] = c * a02 + s * a12;

    out[3] = c * a10 - s * a00;
    out[4] = c * a11 - s * a01;
    out[5] = c * a12 - s * a02;

    out[6] = a20;
    out[7] = a21;
    out[8] = a22;
    return out;
}

/**
 * Scales the mat3 by the dimensions in the given vec2
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the matrix to rotate
 * @param {vec2} v the vec2 to scale the matrix by
 * @returns {mat3} out
 **/
function scale(out, a, v) {
    let x = v[0],
        y = v[1];

    out[0] = x * a[0];
    out[1] = x * a[1];
    out[2] = x * a[2];

    out[3] = y * a[3];
    out[4] = y * a[4];
    out[5] = y * a[5];

    out[6] = a[6];
    out[7] = a[7];
    out[8] = a[8];
    return out;
}

/**
 * Calculates a 3x3 normal matrix (transpose inverse) from the 4x4 matrix
 *
 * @param {mat3} out mat3 receiving operation result
 * @param {mat4} a Mat4 to derive the normal matrix from
 *
 * @returns {mat3} out
 */
function normalFromMat4(out, a) {
    let a00 = a[0],
        a01 = a[1],
        a02 = a[2],
        a03 = a[3];
    let a10 = a[4],
        a11 = a[5],
        a12 = a[6],
        a13 = a[7];
    let a20 = a[8],
        a21 = a[9],
        a22 = a[10],
        a23 = a[11];
    let a30 = a[12],
        a31 = a[13],
        a32 = a[14],
        a33 = a[15];

    let b00 = a00 * a11 - a01 * a10;
    let b01 = a00 * a12 - a02 * a10;
    let b02 = a00 * a13 - a03 * a10;
    let b03 = a01 * a12 - a02 * a11;
    let b04 = a01 * a13 - a03 * a11;
    let b05 = a02 * a13 - a03 * a12;
    let b06 = a20 * a31 - a21 * a30;
    let b07 = a20 * a32 - a22 * a30;
    let b08 = a20 * a33 - a23 * a30;
    let b09 = a21 * a32 - a22 * a31;
    let b10 = a21 * a33 - a23 * a31;
    let b11 = a22 * a33 - a23 * a32;

    // Calculate the determinant
    let det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

    if (!det) {
        return null;
    }
    det = 1.0 / det;

    out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
    out[1] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
    out[2] = (a10 * b10 - a11 * b08 + a13 * b06) * det;

    out[3] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
    out[4] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
    out[5] = (a01 * b08 - a00 * b10 - a03 * b06) * det;

    out[6] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
    out[7] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
    out[8] = (a30 * b04 - a31 * b02 + a33 * b00) * det;

    return out;
}

/**
 * Generates a 2D projection matrix with the given bounds
 *
 * @param {mat3} out mat3 frustum matrix will be written into
 * @param {number} width Width of your gl context
 * @param {number} height Height of gl context
 * @returns {mat3} out
 */
function projection(out, width, height) {
    out[0] = 2 / width;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = -2 / height;
    out[5] = 0;
    out[6] = -1;
    out[7] = 1;
    out[8] = 1;
    return out;
}

/**
 * Adds two mat3's
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the first operand
 * @param {mat3} b the second operand
 * @returns {mat3} out
 */
function add(out, a, b) {
    out[0] = a[0] + b[0];
    out[1] = a[1] + b[1];
    out[2] = a[2] + b[2];
    out[3] = a[3] + b[3];
    out[4] = a[4] + b[4];
    out[5] = a[5] + b[5];
    out[6] = a[6] + b[6];
    out[7] = a[7] + b[7];
    out[8] = a[8] + b[8];
    return out;
}

/**
 * Subtracts matrix b from matrix a
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the first operand
 * @param {mat3} b the second operand
 * @returns {mat3} out
 */
function subtract(out, a, b) {
    out[0] = a[0] - b[0];
    out[1] = a[1] - b[1];
    out[2] = a[2] - b[2];
    out[3] = a[3] - b[3];
    out[4] = a[4] - b[4];
    out[5] = a[5] - b[5];
    out[6] = a[6] - b[6];
    out[7] = a[7] - b[7];
    out[8] = a[8] - b[8];
    return out;
}

/**
 * Multiply each element of the matrix by a scalar.
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the matrix to scale
 * @param {Number} b amount to scale the matrix's elements by
 * @returns {mat3} out
 */
function multiplyScalar(out, a, b) {
    out[0] = a[0] * b;
    out[1] = a[1] * b;
    out[2] = a[2] * b;
    out[3] = a[3] * b;
    out[4] = a[4] * b;
    out[5] = a[5] * b;
    out[6] = a[6] * b;
    out[7] = a[7] * b;
    out[8] = a[8] * b;
    return out;
}


/***/ }),

/***/ "./src/math/functions/Mat4Func.js":
/*!****************************************!*\
  !*** ./src/math/functions/Mat4Func.js ***!
  \****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "copy": () => (/* binding */ copy),
/* harmony export */   "set": () => (/* binding */ set),
/* harmony export */   "identity": () => (/* binding */ identity),
/* harmony export */   "transpose": () => (/* binding */ transpose),
/* harmony export */   "invert": () => (/* binding */ invert),
/* harmony export */   "determinant": () => (/* binding */ determinant),
/* harmony export */   "multiply": () => (/* binding */ multiply),
/* harmony export */   "translate": () => (/* binding */ translate),
/* harmony export */   "scale": () => (/* binding */ scale),
/* harmony export */   "rotate": () => (/* binding */ rotate),
/* harmony export */   "getTranslation": () => (/* binding */ getTranslation),
/* harmony export */   "getScaling": () => (/* binding */ getScaling),
/* harmony export */   "getMaxScaleOnAxis": () => (/* binding */ getMaxScaleOnAxis),
/* harmony export */   "getRotation": () => (/* binding */ getRotation),
/* harmony export */   "fromRotationTranslationScale": () => (/* binding */ fromRotationTranslationScale),
/* harmony export */   "fromQuat": () => (/* binding */ fromQuat),
/* harmony export */   "perspectiveFrustrum": () => (/* binding */ perspectiveFrustrum),
/* harmony export */   "perspective": () => (/* binding */ perspective),
/* harmony export */   "ortho": () => (/* binding */ ortho),
/* harmony export */   "targetTo": () => (/* binding */ targetTo),
/* harmony export */   "add": () => (/* binding */ add),
/* harmony export */   "subtract": () => (/* binding */ subtract),
/* harmony export */   "multiplyScalar": () => (/* binding */ multiplyScalar)
/* harmony export */ });
const EPSILON = 0.000001;

/**
 * Copy the values from one mat4 to another
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the source matrix
 * @returns {mat4} out
 */
function copy(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    out[4] = a[4];
    out[5] = a[5];
    out[6] = a[6];
    out[7] = a[7];
    out[8] = a[8];
    out[9] = a[9];
    out[10] = a[10];
    out[11] = a[11];
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
    return out;
}

/**
 * Set the components of a mat4 to the given values
 *
 * @param {mat4} out the receiving matrix
 * @returns {mat4} out
 */
function set(out, m00, m01, m02, m03, m10, m11, m12, m13, m20, m21, m22, m23, m30, m31, m32, m33) {
    out[0] = m00;
    out[1] = m01;
    out[2] = m02;
    out[3] = m03;
    out[4] = m10;
    out[5] = m11;
    out[6] = m12;
    out[7] = m13;
    out[8] = m20;
    out[9] = m21;
    out[10] = m22;
    out[11] = m23;
    out[12] = m30;
    out[13] = m31;
    out[14] = m32;
    out[15] = m33;
    return out;
}

/**
 * Set a mat4 to the identity matrix
 *
 * @param {mat4} out the receiving matrix
 * @returns {mat4} out
 */
function identity(out) {
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = 1;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = 1;
    out[11] = 0;
    out[12] = 0;
    out[13] = 0;
    out[14] = 0;
    out[15] = 1;
    return out;
}

/**
 * Transpose the values of a mat4
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the source matrix
 * @returns {mat4} out
 */
function transpose(out, a) {
    // If we are transposing ourselves we can skip a few steps but have to cache some values
    if (out === a) {
        let a01 = a[1],
            a02 = a[2],
            a03 = a[3];
        let a12 = a[6],
            a13 = a[7];
        let a23 = a[11];

        out[1] = a[4];
        out[2] = a[8];
        out[3] = a[12];
        out[4] = a01;
        out[6] = a[9];
        out[7] = a[13];
        out[8] = a02;
        out[9] = a12;
        out[11] = a[14];
        out[12] = a03;
        out[13] = a13;
        out[14] = a23;
    } else {
        out[0] = a[0];
        out[1] = a[4];
        out[2] = a[8];
        out[3] = a[12];
        out[4] = a[1];
        out[5] = a[5];
        out[6] = a[9];
        out[7] = a[13];
        out[8] = a[2];
        out[9] = a[6];
        out[10] = a[10];
        out[11] = a[14];
        out[12] = a[3];
        out[13] = a[7];
        out[14] = a[11];
        out[15] = a[15];
    }

    return out;
}

/**
 * Inverts a mat4
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the source matrix
 * @returns {mat4} out
 */
function invert(out, a) {
    let a00 = a[0],
        a01 = a[1],
        a02 = a[2],
        a03 = a[3];
    let a10 = a[4],
        a11 = a[5],
        a12 = a[6],
        a13 = a[7];
    let a20 = a[8],
        a21 = a[9],
        a22 = a[10],
        a23 = a[11];
    let a30 = a[12],
        a31 = a[13],
        a32 = a[14],
        a33 = a[15];

    let b00 = a00 * a11 - a01 * a10;
    let b01 = a00 * a12 - a02 * a10;
    let b02 = a00 * a13 - a03 * a10;
    let b03 = a01 * a12 - a02 * a11;
    let b04 = a01 * a13 - a03 * a11;
    let b05 = a02 * a13 - a03 * a12;
    let b06 = a20 * a31 - a21 * a30;
    let b07 = a20 * a32 - a22 * a30;
    let b08 = a20 * a33 - a23 * a30;
    let b09 = a21 * a32 - a22 * a31;
    let b10 = a21 * a33 - a23 * a31;
    let b11 = a22 * a33 - a23 * a32;

    // Calculate the determinant
    let det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

    if (!det) {
        return null;
    }
    det = 1.0 / det;

    out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
    out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
    out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
    out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
    out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
    out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
    out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
    out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
    out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
    out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
    out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
    out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
    out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
    out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
    out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
    out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;

    return out;
}

/**
 * Calculates the determinant of a mat4
 *
 * @param {mat4} a the source matrix
 * @returns {Number} determinant of a
 */
function determinant(a) {
    let a00 = a[0],
        a01 = a[1],
        a02 = a[2],
        a03 = a[3];
    let a10 = a[4],
        a11 = a[5],
        a12 = a[6],
        a13 = a[7];
    let a20 = a[8],
        a21 = a[9],
        a22 = a[10],
        a23 = a[11];
    let a30 = a[12],
        a31 = a[13],
        a32 = a[14],
        a33 = a[15];

    let b00 = a00 * a11 - a01 * a10;
    let b01 = a00 * a12 - a02 * a10;
    let b02 = a00 * a13 - a03 * a10;
    let b03 = a01 * a12 - a02 * a11;
    let b04 = a01 * a13 - a03 * a11;
    let b05 = a02 * a13 - a03 * a12;
    let b06 = a20 * a31 - a21 * a30;
    let b07 = a20 * a32 - a22 * a30;
    let b08 = a20 * a33 - a23 * a30;
    let b09 = a21 * a32 - a22 * a31;
    let b10 = a21 * a33 - a23 * a31;
    let b11 = a22 * a33 - a23 * a32;

    // Calculate the determinant
    return b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
}

/**
 * Multiplies two mat4s
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the first operand
 * @param {mat4} b the second operand
 * @returns {mat4} out
 */
function multiply(out, a, b) {
    let a00 = a[0],
        a01 = a[1],
        a02 = a[2],
        a03 = a[3];
    let a10 = a[4],
        a11 = a[5],
        a12 = a[6],
        a13 = a[7];
    let a20 = a[8],
        a21 = a[9],
        a22 = a[10],
        a23 = a[11];
    let a30 = a[12],
        a31 = a[13],
        a32 = a[14],
        a33 = a[15];

    // Cache only the current line of the second matrix
    let b0 = b[0],
        b1 = b[1],
        b2 = b[2],
        b3 = b[3];
    out[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    out[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    out[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    out[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

    b0 = b[4];
    b1 = b[5];
    b2 = b[6];
    b3 = b[7];
    out[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    out[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    out[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    out[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

    b0 = b[8];
    b1 = b[9];
    b2 = b[10];
    b3 = b[11];
    out[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    out[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    out[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    out[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

    b0 = b[12];
    b1 = b[13];
    b2 = b[14];
    b3 = b[15];
    out[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    out[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    out[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    out[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
    return out;
}

/**
 * Translate a mat4 by the given vector
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to translate
 * @param {vec3} v vector to translate by
 * @returns {mat4} out
 */
function translate(out, a, v) {
    let x = v[0],
        y = v[1],
        z = v[2];
    let a00, a01, a02, a03;
    let a10, a11, a12, a13;
    let a20, a21, a22, a23;

    if (a === out) {
        out[12] = a[0] * x + a[4] * y + a[8] * z + a[12];
        out[13] = a[1] * x + a[5] * y + a[9] * z + a[13];
        out[14] = a[2] * x + a[6] * y + a[10] * z + a[14];
        out[15] = a[3] * x + a[7] * y + a[11] * z + a[15];
    } else {
        a00 = a[0];
        a01 = a[1];
        a02 = a[2];
        a03 = a[3];
        a10 = a[4];
        a11 = a[5];
        a12 = a[6];
        a13 = a[7];
        a20 = a[8];
        a21 = a[9];
        a22 = a[10];
        a23 = a[11];

        out[0] = a00;
        out[1] = a01;
        out[2] = a02;
        out[3] = a03;
        out[4] = a10;
        out[5] = a11;
        out[6] = a12;
        out[7] = a13;
        out[8] = a20;
        out[9] = a21;
        out[10] = a22;
        out[11] = a23;

        out[12] = a00 * x + a10 * y + a20 * z + a[12];
        out[13] = a01 * x + a11 * y + a21 * z + a[13];
        out[14] = a02 * x + a12 * y + a22 * z + a[14];
        out[15] = a03 * x + a13 * y + a23 * z + a[15];
    }

    return out;
}

/**
 * Scales the mat4 by the dimensions in the given vec3 not using vectorization
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to scale
 * @param {vec3} v the vec3 to scale the matrix by
 * @returns {mat4} out
 **/
function scale(out, a, v) {
    let x = v[0],
        y = v[1],
        z = v[2];

    out[0] = a[0] * x;
    out[1] = a[1] * x;
    out[2] = a[2] * x;
    out[3] = a[3] * x;
    out[4] = a[4] * y;
    out[5] = a[5] * y;
    out[6] = a[6] * y;
    out[7] = a[7] * y;
    out[8] = a[8] * z;
    out[9] = a[9] * z;
    out[10] = a[10] * z;
    out[11] = a[11] * z;
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
    return out;
}

/**
 * Rotates a mat4 by the given angle around the given axis
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @param {vec3} axis the axis to rotate around
 * @returns {mat4} out
 */
function rotate(out, a, rad, axis) {
    let x = axis[0],
        y = axis[1],
        z = axis[2];
    let len = Math.hypot(x, y, z);
    let s, c, t;
    let a00, a01, a02, a03;
    let a10, a11, a12, a13;
    let a20, a21, a22, a23;
    let b00, b01, b02;
    let b10, b11, b12;
    let b20, b21, b22;

    if (Math.abs(len) < EPSILON) {
        return null;
    }

    len = 1 / len;
    x *= len;
    y *= len;
    z *= len;

    s = Math.sin(rad);
    c = Math.cos(rad);
    t = 1 - c;

    a00 = a[0];
    a01 = a[1];
    a02 = a[2];
    a03 = a[3];
    a10 = a[4];
    a11 = a[5];
    a12 = a[6];
    a13 = a[7];
    a20 = a[8];
    a21 = a[9];
    a22 = a[10];
    a23 = a[11];

    // Construct the elements of the rotation matrix
    b00 = x * x * t + c;
    b01 = y * x * t + z * s;
    b02 = z * x * t - y * s;
    b10 = x * y * t - z * s;
    b11 = y * y * t + c;
    b12 = z * y * t + x * s;
    b20 = x * z * t + y * s;
    b21 = y * z * t - x * s;
    b22 = z * z * t + c;

    // Perform rotation-specific matrix multiplication
    out[0] = a00 * b00 + a10 * b01 + a20 * b02;
    out[1] = a01 * b00 + a11 * b01 + a21 * b02;
    out[2] = a02 * b00 + a12 * b01 + a22 * b02;
    out[3] = a03 * b00 + a13 * b01 + a23 * b02;
    out[4] = a00 * b10 + a10 * b11 + a20 * b12;
    out[5] = a01 * b10 + a11 * b11 + a21 * b12;
    out[6] = a02 * b10 + a12 * b11 + a22 * b12;
    out[7] = a03 * b10 + a13 * b11 + a23 * b12;
    out[8] = a00 * b20 + a10 * b21 + a20 * b22;
    out[9] = a01 * b20 + a11 * b21 + a21 * b22;
    out[10] = a02 * b20 + a12 * b21 + a22 * b22;
    out[11] = a03 * b20 + a13 * b21 + a23 * b22;

    if (a !== out) {
        // If the source and destination differ, copy the unchanged last row
        out[12] = a[12];
        out[13] = a[13];
        out[14] = a[14];
        out[15] = a[15];
    }
    return out;
}

/**
 * Returns the translation vector component of a transformation
 *  matrix. If a matrix is built with fromRotationTranslation,
 *  the returned vector will be the same as the translation vector
 *  originally supplied.
 * @param  {vec3} out Vector to receive translation component
 * @param  {mat4} mat Matrix to be decomposed (input)
 * @return {vec3} out
 */
function getTranslation(out, mat) {
    out[0] = mat[12];
    out[1] = mat[13];
    out[2] = mat[14];

    return out;
}

/**
 * Returns the scaling factor component of a transformation
 *  matrix. If a matrix is built with fromRotationTranslationScale
 *  with a normalized Quaternion paramter, the returned vector will be
 *  the same as the scaling vector
 *  originally supplied.
 * @param  {vec3} out Vector to receive scaling factor component
 * @param  {mat4} mat Matrix to be decomposed (input)
 * @return {vec3} out
 */
function getScaling(out, mat) {
    let m11 = mat[0];
    let m12 = mat[1];
    let m13 = mat[2];
    let m21 = mat[4];
    let m22 = mat[5];
    let m23 = mat[6];
    let m31 = mat[8];
    let m32 = mat[9];
    let m33 = mat[10];

    out[0] = Math.hypot(m11, m12, m13);
    out[1] = Math.hypot(m21, m22, m23);
    out[2] = Math.hypot(m31, m32, m33);

    return out;
}

function getMaxScaleOnAxis(mat) {
    let m11 = mat[0];
    let m12 = mat[1];
    let m13 = mat[2];
    let m21 = mat[4];
    let m22 = mat[5];
    let m23 = mat[6];
    let m31 = mat[8];
    let m32 = mat[9];
    let m33 = mat[10];

    const x = m11 * m11 + m12 * m12 + m13 * m13;
    const y = m21 * m21 + m22 * m22 + m23 * m23;
    const z = m31 * m31 + m32 * m32 + m33 * m33;

    return Math.sqrt(Math.max(x, y, z));
}

/**
 * Returns a quaternion representing the rotational component
 *  of a transformation matrix. If a matrix is built with
 *  fromRotationTranslation, the returned quaternion will be the
 *  same as the quaternion originally supplied.
 * @param {quat} out Quaternion to receive the rotation component
 * @param {mat4} mat Matrix to be decomposed (input)
 * @return {quat} out
 */
const getRotation = (function () {
    const temp = [0, 0, 0];

    return function (out, mat) {
        let scaling = temp;
        getScaling(scaling, mat);

        let is1 = 1 / scaling[0];
        let is2 = 1 / scaling[1];
        let is3 = 1 / scaling[2];

        let sm11 = mat[0] * is1;
        let sm12 = mat[1] * is2;
        let sm13 = mat[2] * is3;
        let sm21 = mat[4] * is1;
        let sm22 = mat[5] * is2;
        let sm23 = mat[6] * is3;
        let sm31 = mat[8] * is1;
        let sm32 = mat[9] * is2;
        let sm33 = mat[10] * is3;

        let trace = sm11 + sm22 + sm33;
        let S = 0;

        if (trace > 0) {
            S = Math.sqrt(trace + 1.0) * 2;
            out[3] = 0.25 * S;
            out[0] = (sm23 - sm32) / S;
            out[1] = (sm31 - sm13) / S;
            out[2] = (sm12 - sm21) / S;
        } else if (sm11 > sm22 && sm11 > sm33) {
            S = Math.sqrt(1.0 + sm11 - sm22 - sm33) * 2;
            out[3] = (sm23 - sm32) / S;
            out[0] = 0.25 * S;
            out[1] = (sm12 + sm21) / S;
            out[2] = (sm31 + sm13) / S;
        } else if (sm22 > sm33) {
            S = Math.sqrt(1.0 + sm22 - sm11 - sm33) * 2;
            out[3] = (sm31 - sm13) / S;
            out[0] = (sm12 + sm21) / S;
            out[1] = 0.25 * S;
            out[2] = (sm23 + sm32) / S;
        } else {
            S = Math.sqrt(1.0 + sm33 - sm11 - sm22) * 2;
            out[3] = (sm12 - sm21) / S;
            out[0] = (sm31 + sm13) / S;
            out[1] = (sm23 + sm32) / S;
            out[2] = 0.25 * S;
        }

        return out;
    };
})();

/**
 * Creates a matrix from a quaternion rotation, vector translation and vector scale
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.translate(dest, vec);
 *     let quatMat = mat4.create();
 *     quat4.toMat4(quat, quatMat);
 *     mat4.multiply(dest, quatMat);
 *     mat4.scale(dest, scale)
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {quat4} q Rotation quaternion
 * @param {vec3} v Translation vector
 * @param {vec3} s Scaling vector
 * @returns {mat4} out
 */
function fromRotationTranslationScale(out, q, v, s) {
    // Quaternion math
    let x = q[0],
        y = q[1],
        z = q[2],
        w = q[3];
    let x2 = x + x;
    let y2 = y + y;
    let z2 = z + z;

    let xx = x * x2;
    let xy = x * y2;
    let xz = x * z2;
    let yy = y * y2;
    let yz = y * z2;
    let zz = z * z2;
    let wx = w * x2;
    let wy = w * y2;
    let wz = w * z2;
    let sx = s[0];
    let sy = s[1];
    let sz = s[2];

    out[0] = (1 - (yy + zz)) * sx;
    out[1] = (xy + wz) * sx;
    out[2] = (xz - wy) * sx;
    out[3] = 0;
    out[4] = (xy - wz) * sy;
    out[5] = (1 - (xx + zz)) * sy;
    out[6] = (yz + wx) * sy;
    out[7] = 0;
    out[8] = (xz + wy) * sz;
    out[9] = (yz - wx) * sz;
    out[10] = (1 - (xx + yy)) * sz;
    out[11] = 0;
    out[12] = v[0];
    out[13] = v[1];
    out[14] = v[2];
    out[15] = 1;

    return out;
}

/**
 * Calculates a 4x4 matrix from the given quaternion
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {quat} q Quaternion to create matrix from
 *
 * @returns {mat4} out
 */
function fromQuat(out, q) {
    let x = q[0],
        y = q[1],
        z = q[2],
        w = q[3];
    let x2 = x + x;
    let y2 = y + y;
    let z2 = z + z;

    let xx = x * x2;
    let yx = y * x2;
    let yy = y * y2;
    let zx = z * x2;
    let zy = z * y2;
    let zz = z * z2;
    let wx = w * x2;
    let wy = w * y2;
    let wz = w * z2;

    out[0] = 1 - yy - zz;
    out[1] = yx + wz;
    out[2] = zx - wy;
    out[3] = 0;

    out[4] = yx - wz;
    out[5] = 1 - xx - zz;
    out[6] = zy + wx;
    out[7] = 0;

    out[8] = zx + wy;
    out[9] = zy - wx;
    out[10] = 1 - xx - yy;
    out[11] = 0;

    out[12] = 0;
    out[13] = 0;
    out[14] = 0;
    out[15] = 1;

    return out;
}

/**
 * Generates a perspective projection matrix with the given bounds
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {number} left Vertical field of view in radians
 * @param {number} right Aspect ratio. typically viewport width/height
 * @param {number} top Vertical field of view in radians
 * @param {number} bottom Aspect ratio. typically viewport width/height
 * @param {number} near Near bound of the frustum
 * @param {number} far Far bound of the frustum
 * @returns {mat4} out
 */
function perspectiveFrustrum(out, left, right, top, bottom, near, far) {
    var x = 2 * near / ( right - left );
    var y = 2 * near / ( top - bottom );

    var a = ( right + left ) / ( right - left );
    var b = ( top + bottom ) / ( top - bottom );
    var c = - ( far + near ) / ( far - near );
    var d = - 2 * far * near / ( far - near );

    out[ 0 ] = x;	out[ 4 ] = 0;	out[ 8 ] = a;	out[ 12 ] = 0;
    out[ 1 ] = 0;	out[ 5 ] = y;	out[ 9 ] = b;	out[ 13 ] = 0;
    out[ 2 ] = 0;	out[ 6 ] = 0;	out[ 10 ] = c;	out[ 14 ] = d;
    out[ 3 ] = 0;	out[ 7 ] = 0;	out[ 11 ] = - 1;	out[ 15 ] = 0;

    return out;
}

/**
 * Generates a perspective projection matrix with the given bounds
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {number} fovy Vertical field of view in radians
 * @param {number} aspect Aspect ratio. typically viewport width/height
 * @param {number} near Near bound of the frustum
 * @param {number} far Far bound of the frustum
 * @returns {mat4} out
 */
function perspective(out, fovy, aspect, near, far) {
    let f = 1.0 / Math.tan(fovy / 2);
    let nf = 1 / (near - far);
    out[0] = f / aspect;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = f;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = (far + near) * nf;
    out[11] = -1;
    out[12] = 0;
    out[13] = 0;
    out[14] = 2 * far * near * nf;
    out[15] = 0;
    return out;
}

/**
 * Generates a orthogonal projection matrix with the given bounds
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {number} left Left bound of the frustum
 * @param {number} right Right bound of the frustum
 * @param {number} bottom Bottom bound of the frustum
 * @param {number} top Top bound of the frustum
 * @param {number} near Near bound of the frustum
 * @param {number} far Far bound of the frustum
 * @returns {mat4} out
 */
function ortho(out, left, right, bottom, top, near, far) {
    let lr = 1 / (left - right);
    let bt = 1 / (bottom - top);
    let nf = 1 / (near - far);
    out[0] = -2 * lr;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = -2 * bt;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = 2 * nf;
    out[11] = 0;
    out[12] = (left + right) * lr;
    out[13] = (top + bottom) * bt;
    out[14] = (far + near) * nf;
    out[15] = 1;
    return out;
}

/**
 * Generates a matrix that makes something look at something else.
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {vec3} eye Position of the viewer
 * @param {vec3} target Point the viewer is looking at
 * @param {vec3} up vec3 pointing up
 * @returns {mat4} out
 */
function targetTo(out, eye, target, up) {
    let eyex = eye[0],
        eyey = eye[1],
        eyez = eye[2],
        upx = up[0],
        upy = up[1],
        upz = up[2];

    let z0 = eyex - target[0],
        z1 = eyey - target[1],
        z2 = eyez - target[2];

    let len = z0 * z0 + z1 * z1 + z2 * z2;
    if (len === 0) {
        // eye and target are in the same position
        z2 = 1;
    } else {
        len = 1 / Math.sqrt(len);
        z0 *= len;
        z1 *= len;
        z2 *= len;
    }

    let x0 = upy * z2 - upz * z1,
        x1 = upz * z0 - upx * z2,
        x2 = upx * z1 - upy * z0;

    len = x0 * x0 + x1 * x1 + x2 * x2;
    if (len === 0) {
        // up and z are parallel
        if (upz) {
            upx += 1e-6;
        } else if (upy) {
            upz += 1e-6;
        } else {
            upy += 1e-6;
        }
        (x0 = upy * z2 - upz * z1), (x1 = upz * z0 - upx * z2), (x2 = upx * z1 - upy * z0);

        len = x0 * x0 + x1 * x1 + x2 * x2;
    }

    len = 1 / Math.sqrt(len);
    x0 *= len;
    x1 *= len;
    x2 *= len;

    out[0] = x0;
    out[1] = x1;
    out[2] = x2;
    out[3] = 0;
    out[4] = z1 * x2 - z2 * x1;
    out[5] = z2 * x0 - z0 * x2;
    out[6] = z0 * x1 - z1 * x0;
    out[7] = 0;
    out[8] = z0;
    out[9] = z1;
    out[10] = z2;
    out[11] = 0;
    out[12] = eyex;
    out[13] = eyey;
    out[14] = eyez;
    out[15] = 1;
    return out;
}

/**
 * Adds two mat4's
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the first operand
 * @param {mat4} b the second operand
 * @returns {mat4} out
 */
function add(out, a, b) {
    out[0] = a[0] + b[0];
    out[1] = a[1] + b[1];
    out[2] = a[2] + b[2];
    out[3] = a[3] + b[3];
    out[4] = a[4] + b[4];
    out[5] = a[5] + b[5];
    out[6] = a[6] + b[6];
    out[7] = a[7] + b[7];
    out[8] = a[8] + b[8];
    out[9] = a[9] + b[9];
    out[10] = a[10] + b[10];
    out[11] = a[11] + b[11];
    out[12] = a[12] + b[12];
    out[13] = a[13] + b[13];
    out[14] = a[14] + b[14];
    out[15] = a[15] + b[15];
    return out;
}

/**
 * Subtracts matrix b from matrix a
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the first operand
 * @param {mat4} b the second operand
 * @returns {mat4} out
 */
function subtract(out, a, b) {
    out[0] = a[0] - b[0];
    out[1] = a[1] - b[1];
    out[2] = a[2] - b[2];
    out[3] = a[3] - b[3];
    out[4] = a[4] - b[4];
    out[5] = a[5] - b[5];
    out[6] = a[6] - b[6];
    out[7] = a[7] - b[7];
    out[8] = a[8] - b[8];
    out[9] = a[9] - b[9];
    out[10] = a[10] - b[10];
    out[11] = a[11] - b[11];
    out[12] = a[12] - b[12];
    out[13] = a[13] - b[13];
    out[14] = a[14] - b[14];
    out[15] = a[15] - b[15];
    return out;
}

/**
 * Multiply each element of the matrix by a scalar.
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to scale
 * @param {Number} b amount to scale the matrix's elements by
 * @returns {mat4} out
 */
function multiplyScalar(out, a, b) {
    out[0] = a[0] * b;
    out[1] = a[1] * b;
    out[2] = a[2] * b;
    out[3] = a[3] * b;
    out[4] = a[4] * b;
    out[5] = a[5] * b;
    out[6] = a[6] * b;
    out[7] = a[7] * b;
    out[8] = a[8] * b;
    out[9] = a[9] * b;
    out[10] = a[10] * b;
    out[11] = a[11] * b;
    out[12] = a[12] * b;
    out[13] = a[13] * b;
    out[14] = a[14] * b;
    out[15] = a[15] * b;
    return out;
}


/***/ }),

/***/ "./src/math/functions/QuatFunc.js":
/*!****************************************!*\
  !*** ./src/math/functions/QuatFunc.js ***!
  \****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "identity": () => (/* binding */ identity),
/* harmony export */   "setAxisAngle": () => (/* binding */ setAxisAngle),
/* harmony export */   "multiply": () => (/* binding */ multiply),
/* harmony export */   "rotateX": () => (/* binding */ rotateX),
/* harmony export */   "rotateY": () => (/* binding */ rotateY),
/* harmony export */   "rotateZ": () => (/* binding */ rotateZ),
/* harmony export */   "slerp": () => (/* binding */ slerp),
/* harmony export */   "invert": () => (/* binding */ invert),
/* harmony export */   "conjugate": () => (/* binding */ conjugate),
/* harmony export */   "fromMat3": () => (/* binding */ fromMat3),
/* harmony export */   "fromEuler": () => (/* binding */ fromEuler),
/* harmony export */   "copy": () => (/* binding */ copy),
/* harmony export */   "set": () => (/* binding */ set),
/* harmony export */   "add": () => (/* binding */ add),
/* harmony export */   "scale": () => (/* binding */ scale),
/* harmony export */   "dot": () => (/* binding */ dot),
/* harmony export */   "lerp": () => (/* binding */ lerp),
/* harmony export */   "length": () => (/* binding */ length),
/* harmony export */   "normalize": () => (/* binding */ normalize)
/* harmony export */ });
/* harmony import */ var _Vec4Func_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Vec4Func.js */ "./src/math/functions/Vec4Func.js");


/**
 * Set a quat to the identity quaternion
 *
 * @param {quat} out the receiving quaternion
 * @returns {quat} out
 */
function identity(out) {
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
    out[3] = 1;
    return out;
}

/**
 * Sets a quat from the given angle and rotation axis,
 * then returns it.
 *
 * @param {quat} out the receiving quaternion
 * @param {vec3} axis the axis around which to rotate
 * @param {Number} rad the angle in radians
 * @returns {quat} out
 **/
function setAxisAngle(out, axis, rad) {
    rad = rad * 0.5;
    let s = Math.sin(rad);
    out[0] = s * axis[0];
    out[1] = s * axis[1];
    out[2] = s * axis[2];
    out[3] = Math.cos(rad);
    return out;
}

/**
 * Multiplies two quats
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a the first operand
 * @param {quat} b the second operand
 * @returns {quat} out
 */
function multiply(out, a, b) {
    let ax = a[0],
        ay = a[1],
        az = a[2],
        aw = a[3];
    let bx = b[0],
        by = b[1],
        bz = b[2],
        bw = b[3];

    out[0] = ax * bw + aw * bx + ay * bz - az * by;
    out[1] = ay * bw + aw * by + az * bx - ax * bz;
    out[2] = az * bw + aw * bz + ax * by - ay * bx;
    out[3] = aw * bw - ax * bx - ay * by - az * bz;
    return out;
}

/**
 * Rotates a quaternion by the given angle about the X axis
 *
 * @param {quat} out quat receiving operation result
 * @param {quat} a quat to rotate
 * @param {number} rad angle (in radians) to rotate
 * @returns {quat} out
 */
function rotateX(out, a, rad) {
    rad *= 0.5;

    let ax = a[0],
        ay = a[1],
        az = a[2],
        aw = a[3];
    let bx = Math.sin(rad),
        bw = Math.cos(rad);

    out[0] = ax * bw + aw * bx;
    out[1] = ay * bw + az * bx;
    out[2] = az * bw - ay * bx;
    out[3] = aw * bw - ax * bx;
    return out;
}

/**
 * Rotates a quaternion by the given angle about the Y axis
 *
 * @param {quat} out quat receiving operation result
 * @param {quat} a quat to rotate
 * @param {number} rad angle (in radians) to rotate
 * @returns {quat} out
 */
function rotateY(out, a, rad) {
    rad *= 0.5;

    let ax = a[0],
        ay = a[1],
        az = a[2],
        aw = a[3];
    let by = Math.sin(rad),
        bw = Math.cos(rad);

    out[0] = ax * bw - az * by;
    out[1] = ay * bw + aw * by;
    out[2] = az * bw + ax * by;
    out[3] = aw * bw - ay * by;
    return out;
}

/**
 * Rotates a quaternion by the given angle about the Z axis
 *
 * @param {quat} out quat receiving operation result
 * @param {quat} a quat to rotate
 * @param {number} rad angle (in radians) to rotate
 * @returns {quat} out
 */
function rotateZ(out, a, rad) {
    rad *= 0.5;

    let ax = a[0],
        ay = a[1],
        az = a[2],
        aw = a[3];
    let bz = Math.sin(rad),
        bw = Math.cos(rad);

    out[0] = ax * bw + ay * bz;
    out[1] = ay * bw - ax * bz;
    out[2] = az * bw + aw * bz;
    out[3] = aw * bw - az * bz;
    return out;
}

/**
 * Performs a spherical linear interpolation between two quat
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a the first operand
 * @param {quat} b the second operand
 * @param {Number} t interpolation amount between the two inputs
 * @returns {quat} out
 */
function slerp(out, a, b, t) {
    // benchmarks:
    //    http://jsperf.com/quaternion-slerp-implementations
    let ax = a[0],
        ay = a[1],
        az = a[2],
        aw = a[3];
    let bx = b[0],
        by = b[1],
        bz = b[2],
        bw = b[3];

    let omega, cosom, sinom, scale0, scale1;

    // calc cosine
    cosom = ax * bx + ay * by + az * bz + aw * bw;
    // adjust signs (if necessary)
    if (cosom < 0.0) {
        cosom = -cosom;
        bx = -bx;
        by = -by;
        bz = -bz;
        bw = -bw;
    }
    // calculate coefficients
    if (1.0 - cosom > 0.000001) {
        // standard case (slerp)
        omega = Math.acos(cosom);
        sinom = Math.sin(omega);
        scale0 = Math.sin((1.0 - t) * omega) / sinom;
        scale1 = Math.sin(t * omega) / sinom;
    } else {
        // "from" and "to" quaternions are very close
        //  ... so we can do a linear interpolation
        scale0 = 1.0 - t;
        scale1 = t;
    }
    // calculate final values
    out[0] = scale0 * ax + scale1 * bx;
    out[1] = scale0 * ay + scale1 * by;
    out[2] = scale0 * az + scale1 * bz;
    out[3] = scale0 * aw + scale1 * bw;

    return out;
}

/**
 * Calculates the inverse of a quat
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a quat to calculate inverse of
 * @returns {quat} out
 */
function invert(out, a) {
    let a0 = a[0],
        a1 = a[1],
        a2 = a[2],
        a3 = a[3];
    let dot = a0 * a0 + a1 * a1 + a2 * a2 + a3 * a3;
    let invDot = dot ? 1.0 / dot : 0;

    // TODO: Would be faster to return [0,0,0,0] immediately if dot == 0

    out[0] = -a0 * invDot;
    out[1] = -a1 * invDot;
    out[2] = -a2 * invDot;
    out[3] = a3 * invDot;
    return out;
}

/**
 * Calculates the conjugate of a quat
 * If the quaternion is normalized, this function is faster than quat.inverse and produces the same result.
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a quat to calculate conjugate of
 * @returns {quat} out
 */
function conjugate(out, a) {
    out[0] = -a[0];
    out[1] = -a[1];
    out[2] = -a[2];
    out[3] = a[3];
    return out;
}

/**
 * Creates a quaternion from the given 3x3 rotation matrix.
 *
 * NOTE: The resultant quaternion is not normalized, so you should be sure
 * to renormalize the quaternion yourself where necessary.
 *
 * @param {quat} out the receiving quaternion
 * @param {mat3} m rotation matrix
 * @returns {quat} out
 * @function
 */
function fromMat3(out, m) {
    // Algorithm in Ken Shoemake's article in 1987 SIGGRAPH course notes
    // article "Quaternion Calculus and Fast Animation".
    let fTrace = m[0] + m[4] + m[8];
    let fRoot;

    if (fTrace > 0.0) {
        // |w| > 1/2, may as well choose w > 1/2
        fRoot = Math.sqrt(fTrace + 1.0); // 2w
        out[3] = 0.5 * fRoot;
        fRoot = 0.5 / fRoot; // 1/(4w)
        out[0] = (m[5] - m[7]) * fRoot;
        out[1] = (m[6] - m[2]) * fRoot;
        out[2] = (m[1] - m[3]) * fRoot;
    } else {
        // |w| <= 1/2
        let i = 0;
        if (m[4] > m[0]) i = 1;
        if (m[8] > m[i * 3 + i]) i = 2;
        let j = (i + 1) % 3;
        let k = (i + 2) % 3;

        fRoot = Math.sqrt(m[i * 3 + i] - m[j * 3 + j] - m[k * 3 + k] + 1.0);
        out[i] = 0.5 * fRoot;
        fRoot = 0.5 / fRoot;
        out[3] = (m[j * 3 + k] - m[k * 3 + j]) * fRoot;
        out[j] = (m[j * 3 + i] + m[i * 3 + j]) * fRoot;
        out[k] = (m[k * 3 + i] + m[i * 3 + k]) * fRoot;
    }

    return out;
}

/**
 * Creates a quaternion from the given euler angle x, y, z.
 *
 * @param {quat} out the receiving quaternion
 * @param {vec3} euler Angles to rotate around each axis in degrees.
 * @param {String} order detailing order of operations. Default 'XYZ'.
 * @returns {quat} out
 * @function
 */
function fromEuler(out, euler, order = 'YXZ') {
    let sx = Math.sin(euler[0] * 0.5);
    let cx = Math.cos(euler[0] * 0.5);
    let sy = Math.sin(euler[1] * 0.5);
    let cy = Math.cos(euler[1] * 0.5);
    let sz = Math.sin(euler[2] * 0.5);
    let cz = Math.cos(euler[2] * 0.5);

    if (order === 'XYZ') {
        out[0] = sx * cy * cz + cx * sy * sz;
        out[1] = cx * sy * cz - sx * cy * sz;
        out[2] = cx * cy * sz + sx * sy * cz;
        out[3] = cx * cy * cz - sx * sy * sz;
    } else if (order === 'YXZ') {
        out[0] = sx * cy * cz + cx * sy * sz;
        out[1] = cx * sy * cz - sx * cy * sz;
        out[2] = cx * cy * sz - sx * sy * cz;
        out[3] = cx * cy * cz + sx * sy * sz;
    } else if (order === 'ZXY') {
        out[0] = sx * cy * cz - cx * sy * sz;
        out[1] = cx * sy * cz + sx * cy * sz;
        out[2] = cx * cy * sz + sx * sy * cz;
        out[3] = cx * cy * cz - sx * sy * sz;
    } else if (order === 'ZYX') {
        out[0] = sx * cy * cz - cx * sy * sz;
        out[1] = cx * sy * cz + sx * cy * sz;
        out[2] = cx * cy * sz - sx * sy * cz;
        out[3] = cx * cy * cz + sx * sy * sz;
    } else if (order === 'YZX') {
        out[0] = sx * cy * cz + cx * sy * sz;
        out[1] = cx * sy * cz + sx * cy * sz;
        out[2] = cx * cy * sz - sx * sy * cz;
        out[3] = cx * cy * cz - sx * sy * sz;
    } else if (order === 'XZY') {
        out[0] = sx * cy * cz - cx * sy * sz;
        out[1] = cx * sy * cz - sx * cy * sz;
        out[2] = cx * cy * sz + sx * sy * cz;
        out[3] = cx * cy * cz + sx * sy * sz;
    }

    return out;
}

/**
 * Copy the values from one quat to another
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a the source quaternion
 * @returns {quat} out
 * @function
 */
const copy = _Vec4Func_js__WEBPACK_IMPORTED_MODULE_0__.copy;

/**
 * Set the components of a quat to the given values
 *
 * @param {quat} out the receiving quaternion
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @param {Number} w W component
 * @returns {quat} out
 * @function
 */
const set = _Vec4Func_js__WEBPACK_IMPORTED_MODULE_0__.set;

/**
 * Adds two quat's
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a the first operand
 * @param {quat} b the second operand
 * @returns {quat} out
 * @function
 */
const add = _Vec4Func_js__WEBPACK_IMPORTED_MODULE_0__.add;

/**
 * Scales a quat by a scalar number
 *
 * @param {quat} out the receiving vector
 * @param {quat} a the vector to scale
 * @param {Number} b amount to scale the vector by
 * @returns {quat} out
 * @function
 */
const scale = _Vec4Func_js__WEBPACK_IMPORTED_MODULE_0__.scale;

/**
 * Calculates the dot product of two quat's
 *
 * @param {quat} a the first operand
 * @param {quat} b the second operand
 * @returns {Number} dot product of a and b
 * @function
 */
const dot = _Vec4Func_js__WEBPACK_IMPORTED_MODULE_0__.dot;

/**
 * Performs a linear interpolation between two quat's
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a the first operand
 * @param {quat} b the second operand
 * @param {Number} t interpolation amount between the two inputs
 * @returns {quat} out
 * @function
 */
const lerp = _Vec4Func_js__WEBPACK_IMPORTED_MODULE_0__.lerp;

/**
 * Calculates the length of a quat
 *
 * @param {quat} a vector to calculate length of
 * @returns {Number} length of a
 */
const length = _Vec4Func_js__WEBPACK_IMPORTED_MODULE_0__.length;

/**
 * Normalize a quat
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a quaternion to normalize
 * @returns {quat} out
 * @function
 */
const normalize = _Vec4Func_js__WEBPACK_IMPORTED_MODULE_0__.normalize;


/***/ }),

/***/ "./src/math/functions/Vec2Func.js":
/*!****************************************!*\
  !*** ./src/math/functions/Vec2Func.js ***!
  \****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "copy": () => (/* binding */ copy),
/* harmony export */   "set": () => (/* binding */ set),
/* harmony export */   "add": () => (/* binding */ add),
/* harmony export */   "subtract": () => (/* binding */ subtract),
/* harmony export */   "multiply": () => (/* binding */ multiply),
/* harmony export */   "divide": () => (/* binding */ divide),
/* harmony export */   "scale": () => (/* binding */ scale),
/* harmony export */   "distance": () => (/* binding */ distance),
/* harmony export */   "squaredDistance": () => (/* binding */ squaredDistance),
/* harmony export */   "length": () => (/* binding */ length),
/* harmony export */   "squaredLength": () => (/* binding */ squaredLength),
/* harmony export */   "negate": () => (/* binding */ negate),
/* harmony export */   "inverse": () => (/* binding */ inverse),
/* harmony export */   "normalize": () => (/* binding */ normalize),
/* harmony export */   "dot": () => (/* binding */ dot),
/* harmony export */   "cross": () => (/* binding */ cross),
/* harmony export */   "lerp": () => (/* binding */ lerp),
/* harmony export */   "transformMat2": () => (/* binding */ transformMat2),
/* harmony export */   "transformMat2d": () => (/* binding */ transformMat2d),
/* harmony export */   "transformMat3": () => (/* binding */ transformMat3),
/* harmony export */   "transformMat4": () => (/* binding */ transformMat4),
/* harmony export */   "exactEquals": () => (/* binding */ exactEquals)
/* harmony export */ });
const EPSILON = 0.000001;

/**
 * Copy the values from one vec2 to another
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the source vector
 * @returns {vec2} out
 */
function copy(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    return out;
}

/**
 * Set the components of a vec2 to the given values
 *
 * @param {vec2} out the receiving vector
 * @param {Number} x X component
 * @param {Number} y Y component
 * @returns {vec2} out
 */
function set(out, x, y) {
    out[0] = x;
    out[1] = y;
    return out;
}

/**
 * Adds two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */
function add(out, a, b) {
    out[0] = a[0] + b[0];
    out[1] = a[1] + b[1];
    return out;
}

/**
 * Subtracts vector b from vector a
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */
function subtract(out, a, b) {
    out[0] = a[0] - b[0];
    out[1] = a[1] - b[1];
    return out;
}

/**
 * Multiplies two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */
function multiply(out, a, b) {
    out[0] = a[0] * b[0];
    out[1] = a[1] * b[1];
    return out;
}

/**
 * Divides two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */
function divide(out, a, b) {
    out[0] = a[0] / b[0];
    out[1] = a[1] / b[1];
    return out;
}

/**
 * Scales a vec2 by a scalar number
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the vector to scale
 * @param {Number} b amount to scale the vector by
 * @returns {vec2} out
 */
function scale(out, a, b) {
    out[0] = a[0] * b;
    out[1] = a[1] * b;
    return out;
}

/**
 * Calculates the euclidian distance between two vec2's
 *
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {Number} distance between a and b
 */
function distance(a, b) {
    var x = b[0] - a[0],
        y = b[1] - a[1];
    return Math.sqrt(x * x + y * y);
}

/**
 * Calculates the squared euclidian distance between two vec2's
 *
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {Number} squared distance between a and b
 */
function squaredDistance(a, b) {
    var x = b[0] - a[0],
        y = b[1] - a[1];
    return x * x + y * y;
}

/**
 * Calculates the length of a vec2
 *
 * @param {vec2} a vector to calculate length of
 * @returns {Number} length of a
 */
function length(a) {
    var x = a[0],
        y = a[1];
    return Math.sqrt(x * x + y * y);
}

/**
 * Calculates the squared length of a vec2
 *
 * @param {vec2} a vector to calculate squared length of
 * @returns {Number} squared length of a
 */
function squaredLength(a) {
    var x = a[0],
        y = a[1];
    return x * x + y * y;
}

/**
 * Negates the components of a vec2
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a vector to negate
 * @returns {vec2} out
 */
function negate(out, a) {
    out[0] = -a[0];
    out[1] = -a[1];
    return out;
}

/**
 * Returns the inverse of the components of a vec2
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a vector to invert
 * @returns {vec2} out
 */
function inverse(out, a) {
    out[0] = 1.0 / a[0];
    out[1] = 1.0 / a[1];
    return out;
}

/**
 * Normalize a vec2
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a vector to normalize
 * @returns {vec2} out
 */
function normalize(out, a) {
    var x = a[0],
        y = a[1];
    var len = x * x + y * y;
    if (len > 0) {
        //TODO: evaluate use of glm_invsqrt here?
        len = 1 / Math.sqrt(len);
    }
    out[0] = a[0] * len;
    out[1] = a[1] * len;
    return out;
}

/**
 * Calculates the dot product of two vec2's
 *
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {Number} dot product of a and b
 */
function dot(a, b) {
    return a[0] * b[0] + a[1] * b[1];
}

/**
 * Computes the cross product of two vec2's
 * Note that the cross product returns a scalar
 *
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {Number} cross product of a and b
 */
function cross(a, b) {
    return a[0] * b[1] - a[1] * b[0];
}

/**
 * Performs a linear interpolation between two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @param {Number} t interpolation amount between the two inputs
 * @returns {vec2} out
 */
function lerp(out, a, b, t) {
    var ax = a[0],
        ay = a[1];
    out[0] = ax + t * (b[0] - ax);
    out[1] = ay + t * (b[1] - ay);
    return out;
}

/**
 * Transforms the vec2 with a mat2
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the vector to transform
 * @param {mat2} m matrix to transform with
 * @returns {vec2} out
 */
function transformMat2(out, a, m) {
    var x = a[0],
        y = a[1];
    out[0] = m[0] * x + m[2] * y;
    out[1] = m[1] * x + m[3] * y;
    return out;
}

/**
 * Transforms the vec2 with a mat2d
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the vector to transform
 * @param {mat2d} m matrix to transform with
 * @returns {vec2} out
 */
function transformMat2d(out, a, m) {
    var x = a[0],
        y = a[1];
    out[0] = m[0] * x + m[2] * y + m[4];
    out[1] = m[1] * x + m[3] * y + m[5];
    return out;
}

/**
 * Transforms the vec2 with a mat3
 * 3rd vector component is implicitly '1'
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the vector to transform
 * @param {mat3} m matrix to transform with
 * @returns {vec2} out
 */
function transformMat3(out, a, m) {
    var x = a[0],
        y = a[1];
    out[0] = m[0] * x + m[3] * y + m[6];
    out[1] = m[1] * x + m[4] * y + m[7];
    return out;
}

/**
 * Transforms the vec2 with a mat4
 * 3rd vector component is implicitly '0'
 * 4th vector component is implicitly '1'
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the vector to transform
 * @param {mat4} m matrix to transform with
 * @returns {vec2} out
 */
function transformMat4(out, a, m) {
    let x = a[0];
    let y = a[1];
    out[0] = m[0] * x + m[4] * y + m[12];
    out[1] = m[1] * x + m[5] * y + m[13];
    return out;
}

/**
 * Returns whether or not the vectors exactly have the same elements in the same position (when compared with ===)
 *
 * @param {vec2} a The first vector.
 * @param {vec2} b The second vector.
 * @returns {Boolean} True if the vectors are equal, false otherwise.
 */
function exactEquals(a, b) {
    return a[0] === b[0] && a[1] === b[1];
}


/***/ }),

/***/ "./src/math/functions/Vec3Func.js":
/*!****************************************!*\
  !*** ./src/math/functions/Vec3Func.js ***!
  \****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "length": () => (/* binding */ length),
/* harmony export */   "copy": () => (/* binding */ copy),
/* harmony export */   "set": () => (/* binding */ set),
/* harmony export */   "add": () => (/* binding */ add),
/* harmony export */   "subtract": () => (/* binding */ subtract),
/* harmony export */   "multiply": () => (/* binding */ multiply),
/* harmony export */   "divide": () => (/* binding */ divide),
/* harmony export */   "scale": () => (/* binding */ scale),
/* harmony export */   "distance": () => (/* binding */ distance),
/* harmony export */   "squaredDistance": () => (/* binding */ squaredDistance),
/* harmony export */   "squaredLength": () => (/* binding */ squaredLength),
/* harmony export */   "negate": () => (/* binding */ negate),
/* harmony export */   "inverse": () => (/* binding */ inverse),
/* harmony export */   "normalize": () => (/* binding */ normalize),
/* harmony export */   "dot": () => (/* binding */ dot),
/* harmony export */   "cross": () => (/* binding */ cross),
/* harmony export */   "lerp": () => (/* binding */ lerp),
/* harmony export */   "transformMat4": () => (/* binding */ transformMat4),
/* harmony export */   "scaleRotateMat4": () => (/* binding */ scaleRotateMat4),
/* harmony export */   "transformMat3": () => (/* binding */ transformMat3),
/* harmony export */   "transformQuat": () => (/* binding */ transformQuat),
/* harmony export */   "angle": () => (/* binding */ angle),
/* harmony export */   "exactEquals": () => (/* binding */ exactEquals)
/* harmony export */ });
const EPSILON = 0.000001;

/**
 * Calculates the length of a vec3
 *
 * @param {vec3} a vector to calculate length of
 * @returns {Number} length of a
 */
function length(a) {
    let x = a[0];
    let y = a[1];
    let z = a[2];
    return Math.sqrt(x * x + y * y + z * z);
}

/**
 * Copy the values from one vec3 to another
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the source vector
 * @returns {vec3} out
 */
function copy(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    return out;
}

/**
 * Set the components of a vec3 to the given values
 *
 * @param {vec3} out the receiving vector
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @returns {vec3} out
 */
function set(out, x, y, z) {
    out[0] = x;
    out[1] = y;
    out[2] = z;
    return out;
}

/**
 * Adds two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
function add(out, a, b) {
    out[0] = a[0] + b[0];
    out[1] = a[1] + b[1];
    out[2] = a[2] + b[2];
    return out;
}

/**
 * Subtracts vector b from vector a
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
function subtract(out, a, b) {
    out[0] = a[0] - b[0];
    out[1] = a[1] - b[1];
    out[2] = a[2] - b[2];
    return out;
}

/**
 * Multiplies two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
function multiply(out, a, b) {
    out[0] = a[0] * b[0];
    out[1] = a[1] * b[1];
    out[2] = a[2] * b[2];
    return out;
}

/**
 * Divides two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
function divide(out, a, b) {
    out[0] = a[0] / b[0];
    out[1] = a[1] / b[1];
    out[2] = a[2] / b[2];
    return out;
}

/**
 * Scales a vec3 by a scalar number
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the vector to scale
 * @param {Number} b amount to scale the vector by
 * @returns {vec3} out
 */
function scale(out, a, b) {
    out[0] = a[0] * b;
    out[1] = a[1] * b;
    out[2] = a[2] * b;
    return out;
}

/**
 * Calculates the euclidian distance between two vec3's
 *
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {Number} distance between a and b
 */
function distance(a, b) {
    let x = b[0] - a[0];
    let y = b[1] - a[1];
    let z = b[2] - a[2];
    return Math.sqrt(x * x + y * y + z * z);
}

/**
 * Calculates the squared euclidian distance between two vec3's
 *
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {Number} squared distance between a and b
 */
function squaredDistance(a, b) {
    let x = b[0] - a[0];
    let y = b[1] - a[1];
    let z = b[2] - a[2];
    return x * x + y * y + z * z;
}

/**
 * Calculates the squared length of a vec3
 *
 * @param {vec3} a vector to calculate squared length of
 * @returns {Number} squared length of a
 */
function squaredLength(a) {
    let x = a[0];
    let y = a[1];
    let z = a[2];
    return x * x + y * y + z * z;
}

/**
 * Negates the components of a vec3
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a vector to negate
 * @returns {vec3} out
 */
function negate(out, a) {
    out[0] = -a[0];
    out[1] = -a[1];
    out[2] = -a[2];
    return out;
}

/**
 * Returns the inverse of the components of a vec3
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a vector to invert
 * @returns {vec3} out
 */
function inverse(out, a) {
    out[0] = 1.0 / a[0];
    out[1] = 1.0 / a[1];
    out[2] = 1.0 / a[2];
    return out;
}

/**
 * Normalize a vec3
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a vector to normalize
 * @returns {vec3} out
 */
function normalize(out, a) {
    let x = a[0];
    let y = a[1];
    let z = a[2];
    let len = x * x + y * y + z * z;
    if (len > 0) {
        //TODO: evaluate use of glm_invsqrt here?
        len = 1 / Math.sqrt(len);
    }
    out[0] = a[0] * len;
    out[1] = a[1] * len;
    out[2] = a[2] * len;
    return out;
}

/**
 * Calculates the dot product of two vec3's
 *
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {Number} dot product of a and b
 */
function dot(a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

/**
 * Computes the cross product of two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
function cross(out, a, b) {
    let ax = a[0],
        ay = a[1],
        az = a[2];
    let bx = b[0],
        by = b[1],
        bz = b[2];

    out[0] = ay * bz - az * by;
    out[1] = az * bx - ax * bz;
    out[2] = ax * by - ay * bx;
    return out;
}

/**
 * Performs a linear interpolation between two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @param {Number} t interpolation amount between the two inputs
 * @returns {vec3} out
 */
function lerp(out, a, b, t) {
    let ax = a[0];
    let ay = a[1];
    let az = a[2];
    out[0] = ax + t * (b[0] - ax);
    out[1] = ay + t * (b[1] - ay);
    out[2] = az + t * (b[2] - az);
    return out;
}

/**
 * Transforms the vec3 with a mat4.
 * 4th vector component is implicitly '1'
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the vector to transform
 * @param {mat4} m matrix to transform with
 * @returns {vec3} out
 */
function transformMat4(out, a, m) {
    let x = a[0],
        y = a[1],
        z = a[2];
    let w = m[3] * x + m[7] * y + m[11] * z + m[15];
    w = w || 1.0;
    out[0] = (m[0] * x + m[4] * y + m[8] * z + m[12]) / w;
    out[1] = (m[1] * x + m[5] * y + m[9] * z + m[13]) / w;
    out[2] = (m[2] * x + m[6] * y + m[10] * z + m[14]) / w;
    return out;
}

/**
 * Same as above but doesn't apply translation.
 * Useful for rays.
 */
function scaleRotateMat4(out, a, m) {
    let x = a[0],
        y = a[1],
        z = a[2];
    let w = m[3] * x + m[7] * y + m[11] * z + m[15];
    w = w || 1.0;
    out[0] = (m[0] * x + m[4] * y + m[8] * z) / w;
    out[1] = (m[1] * x + m[5] * y + m[9] * z) / w;
    out[2] = (m[2] * x + m[6] * y + m[10] * z) / w;
    return out;
}

/**
 * Transforms the vec3 with a mat3.
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the vector to transform
 * @param {mat3} m the 3x3 matrix to transform with
 * @returns {vec3} out
 */
function transformMat3(out, a, m) {
    let x = a[0],
        y = a[1],
        z = a[2];
    out[0] = x * m[0] + y * m[3] + z * m[6];
    out[1] = x * m[1] + y * m[4] + z * m[7];
    out[2] = x * m[2] + y * m[5] + z * m[8];
    return out;
}

/**
 * Transforms the vec3 with a quat
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the vector to transform
 * @param {quat} q quaternion to transform with
 * @returns {vec3} out
 */
function transformQuat(out, a, q) {
    // benchmarks: https://jsperf.com/quaternion-transform-vec3-implementations-fixed

    let x = a[0],
        y = a[1],
        z = a[2];
    let qx = q[0],
        qy = q[1],
        qz = q[2],
        qw = q[3];

    let uvx = qy * z - qz * y;
    let uvy = qz * x - qx * z;
    let uvz = qx * y - qy * x;

    let uuvx = qy * uvz - qz * uvy;
    let uuvy = qz * uvx - qx * uvz;
    let uuvz = qx * uvy - qy * uvx;

    let w2 = qw * 2;
    uvx *= w2;
    uvy *= w2;
    uvz *= w2;

    uuvx *= 2;
    uuvy *= 2;
    uuvz *= 2;

    out[0] = x + uvx + uuvx;
    out[1] = y + uvy + uuvy;
    out[2] = z + uvz + uuvz;
    return out;
}

/**
 * Get the angle between two 3D vectors
 * @param {vec3} a The first operand
 * @param {vec3} b The second operand
 * @returns {Number} The angle in radians
 */
const angle = (function () {
    const tempA = [0, 0, 0];
    const tempB = [0, 0, 0];

    return function (a, b) {
        copy(tempA, a);
        copy(tempB, b);

        normalize(tempA, tempA);
        normalize(tempB, tempB);

        let cosine = dot(tempA, tempB);

        if (cosine > 1.0) {
            return 0;
        } else if (cosine < -1.0) {
            return Math.PI;
        } else {
            return Math.acos(cosine);
        }
    };
})();

/**
 * Returns whether or not the vectors have exactly the same elements in the same position (when compared with ===)
 *
 * @param {vec3} a The first vector.
 * @param {vec3} b The second vector.
 * @returns {Boolean} True if the vectors are equal, false otherwise.
 */
function exactEquals(a, b) {
    return a[0] === b[0] && a[1] === b[1] && a[2] === b[2];
}


/***/ }),

/***/ "./src/math/functions/Vec4Func.js":
/*!****************************************!*\
  !*** ./src/math/functions/Vec4Func.js ***!
  \****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "copy": () => (/* binding */ copy),
/* harmony export */   "set": () => (/* binding */ set),
/* harmony export */   "add": () => (/* binding */ add),
/* harmony export */   "scale": () => (/* binding */ scale),
/* harmony export */   "length": () => (/* binding */ length),
/* harmony export */   "normalize": () => (/* binding */ normalize),
/* harmony export */   "dot": () => (/* binding */ dot),
/* harmony export */   "lerp": () => (/* binding */ lerp)
/* harmony export */ });
const EPSILON = 0.000001;

/**
 * Copy the values from one vec4 to another
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the source vector
 * @returns {vec4} out
 */
function copy(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    return out;
}

/**
 * Set the components of a vec4 to the given values
 *
 * @param {vec4} out the receiving vector
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @param {Number} w W component
 * @returns {vec4} out
 */
function set(out, x, y, z, w) {
    out[0] = x;
    out[1] = y;
    out[2] = z;
    out[3] = w;
    return out;
}

/**
 * Adds two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {vec4} out
 */
function add(out, a, b) {
    out[0] = a[0] + b[0];
    out[1] = a[1] + b[1];
    out[2] = a[2] + b[2];
    out[3] = a[3] + b[3];
    return out;
}

/**
 * Scales a vec4 by a scalar number
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the vector to scale
 * @param {Number} b amount to scale the vector by
 * @returns {vec4} out
 */
function scale(out, a, b) {
    out[0] = a[0] * b;
    out[1] = a[1] * b;
    out[2] = a[2] * b;
    out[3] = a[3] * b;
    return out;
}

/**
 * Calculates the length of a vec4
 *
 * @param {vec4} a vector to calculate length of
 * @returns {Number} length of a
 */
function length(a) {
    let x = a[0];
    let y = a[1];
    let z = a[2];
    let w = a[3];
    return Math.sqrt(x * x + y * y + z * z + w * w);
}

/**
 * Normalize a vec4
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a vector to normalize
 * @returns {vec4} out
 */
function normalize(out, a) {
    let x = a[0];
    let y = a[1];
    let z = a[2];
    let w = a[3];
    let len = x * x + y * y + z * z + w * w;
    if (len > 0) {
        len = 1 / Math.sqrt(len);
    }
    out[0] = x * len;
    out[1] = y * len;
    out[2] = z * len;
    out[3] = w * len;
    return out;
}

/**
 * Calculates the dot product of two vec4's
 *
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {Number} dot product of a and b
 */
function dot(a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
}

/**
 * Performs a linear interpolation between two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @param {Number} t interpolation amount between the two inputs
 * @returns {vec4} out
 */
function lerp(out, a, b, t) {
    let ax = a[0];
    let ay = a[1];
    let az = a[2];
    let aw = a[3];
    out[0] = ax + t * (b[0] - ax);
    out[1] = ay + t * (b[1] - ay);
    out[2] = az + t * (b[2] - az);
    out[3] = aw + t * (b[3] - aw);
    return out;
}


/***/ }),

/***/ "./src/ogl.js":
/*!********************!*\
  !*** ./src/ogl.js ***!
  \********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Geometry": () => (/* reexport safe */ _core_Geometry_js__WEBPACK_IMPORTED_MODULE_0__.Geometry),
/* harmony export */   "Program": () => (/* reexport safe */ _core_Program_js__WEBPACK_IMPORTED_MODULE_1__.Program),
/* harmony export */   "Renderer": () => (/* reexport safe */ _core_Renderer_js__WEBPACK_IMPORTED_MODULE_2__.Renderer),
/* harmony export */   "Camera": () => (/* reexport safe */ _core_Camera_js__WEBPACK_IMPORTED_MODULE_3__.Camera),
/* harmony export */   "Transform": () => (/* reexport safe */ _core_Transform_js__WEBPACK_IMPORTED_MODULE_4__.Transform),
/* harmony export */   "Mesh": () => (/* reexport safe */ _core_Mesh_js__WEBPACK_IMPORTED_MODULE_5__.Mesh),
/* harmony export */   "Texture": () => (/* reexport safe */ _core_Texture_js__WEBPACK_IMPORTED_MODULE_6__.Texture),
/* harmony export */   "RenderTarget": () => (/* reexport safe */ _core_RenderTarget_js__WEBPACK_IMPORTED_MODULE_7__.RenderTarget),
/* harmony export */   "Color": () => (/* reexport safe */ _math_Color_js__WEBPACK_IMPORTED_MODULE_8__.Color),
/* harmony export */   "Euler": () => (/* reexport safe */ _math_Euler_js__WEBPACK_IMPORTED_MODULE_9__.Euler),
/* harmony export */   "Mat3": () => (/* reexport safe */ _math_Mat3_js__WEBPACK_IMPORTED_MODULE_10__.Mat3),
/* harmony export */   "Mat4": () => (/* reexport safe */ _math_Mat4_js__WEBPACK_IMPORTED_MODULE_11__.Mat4),
/* harmony export */   "Quat": () => (/* reexport safe */ _math_Quat_js__WEBPACK_IMPORTED_MODULE_12__.Quat),
/* harmony export */   "Vec2": () => (/* reexport safe */ _math_Vec2_js__WEBPACK_IMPORTED_MODULE_13__.Vec2),
/* harmony export */   "Vec3": () => (/* reexport safe */ _math_Vec3_js__WEBPACK_IMPORTED_MODULE_14__.Vec3),
/* harmony export */   "Vec4": () => (/* reexport safe */ _math_Vec4_js__WEBPACK_IMPORTED_MODULE_15__.Vec4),
/* harmony export */   "Plane": () => (/* reexport safe */ _extras_Plane_js__WEBPACK_IMPORTED_MODULE_16__.Plane),
/* harmony export */   "Box": () => (/* reexport safe */ _extras_Box_js__WEBPACK_IMPORTED_MODULE_17__.Box),
/* harmony export */   "Sphere": () => (/* reexport safe */ _extras_Sphere_js__WEBPACK_IMPORTED_MODULE_18__.Sphere),
/* harmony export */   "Cylinder": () => (/* reexport safe */ _extras_Cylinder_js__WEBPACK_IMPORTED_MODULE_19__.Cylinder),
/* harmony export */   "Triangle": () => (/* reexport safe */ _extras_Triangle_js__WEBPACK_IMPORTED_MODULE_20__.Triangle),
/* harmony export */   "Torus": () => (/* reexport safe */ _extras_Torus_js__WEBPACK_IMPORTED_MODULE_21__.Torus),
/* harmony export */   "Orbit": () => (/* reexport safe */ _extras_Orbit_js__WEBPACK_IMPORTED_MODULE_22__.Orbit),
/* harmony export */   "Raycast": () => (/* reexport safe */ _extras_Raycast_js__WEBPACK_IMPORTED_MODULE_23__.Raycast),
/* harmony export */   "Curve": () => (/* reexport safe */ _extras_Curve_js__WEBPACK_IMPORTED_MODULE_24__.Curve),
/* harmony export */   "Post": () => (/* reexport safe */ _extras_Post_js__WEBPACK_IMPORTED_MODULE_25__.Post),
/* harmony export */   "Skin": () => (/* reexport safe */ _extras_Skin_js__WEBPACK_IMPORTED_MODULE_26__.Skin),
/* harmony export */   "Animation": () => (/* reexport safe */ _extras_Animation_js__WEBPACK_IMPORTED_MODULE_27__.Animation),
/* harmony export */   "Text": () => (/* reexport safe */ _extras_Text_js__WEBPACK_IMPORTED_MODULE_28__.Text),
/* harmony export */   "NormalProgram": () => (/* reexport safe */ _extras_NormalProgram_js__WEBPACK_IMPORTED_MODULE_29__.NormalProgram),
/* harmony export */   "Flowmap": () => (/* reexport safe */ _extras_Flowmap_js__WEBPACK_IMPORTED_MODULE_30__.Flowmap),
/* harmony export */   "GPGPU": () => (/* reexport safe */ _extras_GPGPU_js__WEBPACK_IMPORTED_MODULE_31__.GPGPU),
/* harmony export */   "Polyline": () => (/* reexport safe */ _extras_Polyline_js__WEBPACK_IMPORTED_MODULE_32__.Polyline),
/* harmony export */   "Shadow": () => (/* reexport safe */ _extras_Shadow_js__WEBPACK_IMPORTED_MODULE_33__.Shadow),
/* harmony export */   "KTXTexture": () => (/* reexport safe */ _extras_KTXTexture_js__WEBPACK_IMPORTED_MODULE_34__.KTXTexture),
/* harmony export */   "TextureLoader": () => (/* reexport safe */ _extras_TextureLoader_js__WEBPACK_IMPORTED_MODULE_35__.TextureLoader),
/* harmony export */   "GLTFLoader": () => (/* reexport safe */ _extras_GLTFLoader_js__WEBPACK_IMPORTED_MODULE_36__.GLTFLoader),
/* harmony export */   "GLTFSkin": () => (/* reexport safe */ _extras_GLTFSkin_js__WEBPACK_IMPORTED_MODULE_37__.GLTFSkin)
/* harmony export */ });
/* harmony import */ var _core_Geometry_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./core/Geometry.js */ "./src/core/Geometry.js");
/* harmony import */ var _core_Program_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./core/Program.js */ "./src/core/Program.js");
/* harmony import */ var _core_Renderer_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./core/Renderer.js */ "./src/core/Renderer.js");
/* harmony import */ var _core_Camera_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./core/Camera.js */ "./src/core/Camera.js");
/* harmony import */ var _core_Transform_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./core/Transform.js */ "./src/core/Transform.js");
/* harmony import */ var _core_Mesh_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./core/Mesh.js */ "./src/core/Mesh.js");
/* harmony import */ var _core_Texture_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./core/Texture.js */ "./src/core/Texture.js");
/* harmony import */ var _core_RenderTarget_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./core/RenderTarget.js */ "./src/core/RenderTarget.js");
/* harmony import */ var _math_Color_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./math/Color.js */ "./src/math/Color.js");
/* harmony import */ var _math_Euler_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./math/Euler.js */ "./src/math/Euler.js");
/* harmony import */ var _math_Mat3_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./math/Mat3.js */ "./src/math/Mat3.js");
/* harmony import */ var _math_Mat4_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./math/Mat4.js */ "./src/math/Mat4.js");
/* harmony import */ var _math_Quat_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./math/Quat.js */ "./src/math/Quat.js");
/* harmony import */ var _math_Vec2_js__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ./math/Vec2.js */ "./src/math/Vec2.js");
/* harmony import */ var _math_Vec3_js__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ./math/Vec3.js */ "./src/math/Vec3.js");
/* harmony import */ var _math_Vec4_js__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ./math/Vec4.js */ "./src/math/Vec4.js");
/* harmony import */ var _extras_Plane_js__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ./extras/Plane.js */ "./src/extras/Plane.js");
/* harmony import */ var _extras_Box_js__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! ./extras/Box.js */ "./src/extras/Box.js");
/* harmony import */ var _extras_Sphere_js__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! ./extras/Sphere.js */ "./src/extras/Sphere.js");
/* harmony import */ var _extras_Cylinder_js__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! ./extras/Cylinder.js */ "./src/extras/Cylinder.js");
/* harmony import */ var _extras_Triangle_js__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! ./extras/Triangle.js */ "./src/extras/Triangle.js");
/* harmony import */ var _extras_Torus_js__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(/*! ./extras/Torus.js */ "./src/extras/Torus.js");
/* harmony import */ var _extras_Orbit_js__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(/*! ./extras/Orbit.js */ "./src/extras/Orbit.js");
/* harmony import */ var _extras_Raycast_js__WEBPACK_IMPORTED_MODULE_23__ = __webpack_require__(/*! ./extras/Raycast.js */ "./src/extras/Raycast.js");
/* harmony import */ var _extras_Curve_js__WEBPACK_IMPORTED_MODULE_24__ = __webpack_require__(/*! ./extras/Curve.js */ "./src/extras/Curve.js");
/* harmony import */ var _extras_Post_js__WEBPACK_IMPORTED_MODULE_25__ = __webpack_require__(/*! ./extras/Post.js */ "./src/extras/Post.js");
/* harmony import */ var _extras_Skin_js__WEBPACK_IMPORTED_MODULE_26__ = __webpack_require__(/*! ./extras/Skin.js */ "./src/extras/Skin.js");
/* harmony import */ var _extras_Animation_js__WEBPACK_IMPORTED_MODULE_27__ = __webpack_require__(/*! ./extras/Animation.js */ "./src/extras/Animation.js");
/* harmony import */ var _extras_Text_js__WEBPACK_IMPORTED_MODULE_28__ = __webpack_require__(/*! ./extras/Text.js */ "./src/extras/Text.js");
/* harmony import */ var _extras_NormalProgram_js__WEBPACK_IMPORTED_MODULE_29__ = __webpack_require__(/*! ./extras/NormalProgram.js */ "./src/extras/NormalProgram.js");
/* harmony import */ var _extras_Flowmap_js__WEBPACK_IMPORTED_MODULE_30__ = __webpack_require__(/*! ./extras/Flowmap.js */ "./src/extras/Flowmap.js");
/* harmony import */ var _extras_GPGPU_js__WEBPACK_IMPORTED_MODULE_31__ = __webpack_require__(/*! ./extras/GPGPU.js */ "./src/extras/GPGPU.js");
/* harmony import */ var _extras_Polyline_js__WEBPACK_IMPORTED_MODULE_32__ = __webpack_require__(/*! ./extras/Polyline.js */ "./src/extras/Polyline.js");
/* harmony import */ var _extras_Shadow_js__WEBPACK_IMPORTED_MODULE_33__ = __webpack_require__(/*! ./extras/Shadow.js */ "./src/extras/Shadow.js");
/* harmony import */ var _extras_KTXTexture_js__WEBPACK_IMPORTED_MODULE_34__ = __webpack_require__(/*! ./extras/KTXTexture.js */ "./src/extras/KTXTexture.js");
/* harmony import */ var _extras_TextureLoader_js__WEBPACK_IMPORTED_MODULE_35__ = __webpack_require__(/*! ./extras/TextureLoader.js */ "./src/extras/TextureLoader.js");
/* harmony import */ var _extras_GLTFLoader_js__WEBPACK_IMPORTED_MODULE_36__ = __webpack_require__(/*! ./extras/GLTFLoader.js */ "./src/extras/GLTFLoader.js");
/* harmony import */ var _extras_GLTFSkin_js__WEBPACK_IMPORTED_MODULE_37__ = __webpack_require__(/*! ./extras/GLTFSkin.js */ "./src/extras/GLTFSkin.js");
// Core









// Maths









// Extras

























/***/ }),

/***/ "./src/extras/CustomPost.ts":
/*!**********************************!*\
  !*** ./src/extras/CustomPost.ts ***!
  \**********************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CustomPost = exports.RenderPass = exports.Pass = void 0;
const ogl_1 = __webpack_require__(/*! ../ogl */ "./src/ogl.js");
class Pass {
    constructor() {
        this.enabled = true;
        this.renderToScreen = false;
        this.needsSwap = true;
    }
    render(renderer, writeBuffer, readBuffer) {
        console.error('Not implemented');
    }
    resize({ width, height, dpr }) {
        console.error('Not implemented');
    }
}
exports.Pass = Pass;
class RenderPass extends Pass {
    constructor(scene, camera) {
        super();
        this.scene = scene;
        this.camera = camera;
    }
    render(renderer, writeBuffer, readBuffer) {
        renderer.render({ scene: this.scene, camera: this.camera, target: readBuffer });
    }
}
exports.RenderPass = RenderPass;
class CustomPost extends ogl_1.Post {
    constructor(gl, options = {}) {
        super(gl, options);
        this.passes = [];
    }
    addPass(pass) {
        this.passes.push(pass);
        return pass;
    }
    render({ target = undefined, update = true, sort = true, frustumCull = true }) {
        const enabledPasses = this.passes.filter((pass) => pass.enabled);
        enabledPasses.forEach((pass, i) => {
            pass.render(this.gl.renderer, this.fbo.write, this.fbo.read);
            pass.needsSwap && this.fbo.swap();
        });
    }
    resize({ width, height, dpr }) {
        this.fbo.read && this.fbo.read.dispose();
        this.fbo.write && this.fbo.write.dispose();
        super.resize({ width: width, height: height, dpr: dpr });
        this.passes.forEach((pass) => {
            pass.resize({ width, height, dpr });
        });
    }
}
exports.CustomPost = CustomPost;


/***/ }),

/***/ "./src/index.ts":
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__webpack_require__(/*! ./ogl */ "./src/ogl.js"), exports);
__exportStar(__webpack_require__(/*! ./materials/pbrmaterial */ "./src/materials/pbrmaterial.ts"), exports);
__exportStar(__webpack_require__(/*! ./utils/uniformUtils */ "./src/utils/uniformUtils.ts"), exports);
__exportStar(__webpack_require__(/*! ./utils/pbrhelper */ "./src/utils/pbrhelper.ts"), exports);
__exportStar(__webpack_require__(/*! ./utils/util */ "./src/utils/util.ts"), exports);
__exportStar(__webpack_require__(/*! ./utils/eventdispatcher */ "./src/utils/eventdispatcher.ts"), exports);
__exportStar(__webpack_require__(/*! ./extras/CustomPost */ "./src/extras/CustomPost.ts"), exports);


/***/ }),

/***/ "./src/materials/pbrmaterial.ts":
/*!**************************************!*\
  !*** ./src/materials/pbrmaterial.ts ***!
  \**************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PBRMaterial = void 0;
// @ts-ignore
const pbr_vert_1 = __importDefault(__webpack_require__(/*! ./shaders/pbr.vert */ "./src/materials/shaders/pbr.vert"));
// @ts-ignore
const pbr_frag_1 = __importDefault(__webpack_require__(/*! ./shaders/pbr.frag */ "./src/materials/shaders/pbr.frag"));
const programcache_1 = __webpack_require__(/*! ../utils/programcache */ "./src/utils/programcache.ts");
const ogl_1 = __webpack_require__(/*! ../ogl */ "./src/ogl.js");
class PBRMaterial {
    constructor(gl, pbrparams, defines, uniforms, shaders) {
        var _a, _b;
        this.color_ = new ogl_1.Vec4(1, 1, 1, 1);
        this.roughness_ = 0;
        this.metalness_ = 0;
        this.envMapIntensity_ = 1;
        this.gl_ = gl;
        if (!PBRMaterial.lutTextureMap.get(gl.canvas.id)) {
            PBRMaterial.lutTextureMap.set(gl.canvas.id, ogl_1.TextureLoader.load(gl, {
                src: 'https://assets.jewlr.com/j3d/lut.png',
            }));
        }
        let pbrVert = (_a = shaders === null || shaders === void 0 ? void 0 : shaders.vert) !== null && _a !== void 0 ? _a : pbr_vert_1.default;
        let pbrFrag = (_b = shaders === null || shaders === void 0 ? void 0 : shaders.frag) !== null && _b !== void 0 ? _b : pbr_frag_1.default;
        this.color_ = (pbrparams === null || pbrparams === void 0 ? void 0 : pbrparams.baseColorFactor) !== undefined ? new ogl_1.Vec4().copy(pbrparams.baseColorFactor) : new ogl_1.Vec4(1, 1, 1, 1);
        this.roughness = (pbrparams === null || pbrparams === void 0 ? void 0 : pbrparams.roughness) !== undefined ? pbrparams.roughness : 0;
        this.metalness = (pbrparams === null || pbrparams === void 0 ? void 0 : pbrparams.metalness) !== undefined ? pbrparams.metalness : 0;
        this.envMapIntensity = (pbrparams === null || pbrparams === void 0 ? void 0 : pbrparams.envMapIntensity) !== undefined ? pbrparams === null || pbrparams === void 0 ? void 0 : pbrparams.envMapIntensity : 1;
        this.uniforms_ = Object.assign({ uBaseColorFactor: { value: new ogl_1.Vec4().copy(this.color_) }, tBaseColor: { value: (pbrparams === null || pbrparams === void 0 ? void 0 : pbrparams.baseColorTexture) ? pbrparams === null || pbrparams === void 0 ? void 0 : pbrparams.baseColorTexture.texture : null }, uRoughness: { value: (pbrparams === null || pbrparams === void 0 ? void 0 : pbrparams.roughness) !== undefined ? pbrparams === null || pbrparams === void 0 ? void 0 : pbrparams.roughness : 1 }, uMetallic: { value: (pbrparams === null || pbrparams === void 0 ? void 0 : pbrparams.metalness) !== undefined ? pbrparams === null || pbrparams === void 0 ? void 0 : pbrparams.metalness : 1 }, tNormal: { value: { texture: null } }, uNormalScale: { value: (pbrparams === null || pbrparams === void 0 ? void 0 : pbrparams.normalScale) || 1 }, tOcclusion: { value: { texture: null } }, tEmissive: { value: { texture: null } }, uEmissive: { value: (pbrparams === null || pbrparams === void 0 ? void 0 : pbrparams.emissive) || [0, 0, 0] }, tLUT: { value: PBRMaterial.lutTextureMap.get(gl.canvas.id) }, tEnvDiffuse: { value: { texture: null } }, tEnvSpecular: { value: { texture: null } }, uEnvDiffuse: { value: 0.5 }, uEnvSpecular: { value: 0.5 }, uEnvMapIntensity: { value: 1 }, uAlpha: { value: pbrparams === null || pbrparams === void 0 ? void 0 : pbrparams.alpha }, uAlphaCutoff: { value: pbrparams === null || pbrparams === void 0 ? void 0 : pbrparams.alphaCutoff } }, (uniforms !== null && uniforms !== void 0 ? uniforms : {}));
        defines = defines ? defines : ``;
        this.program_ = this.createProgram_(defines, pbrVert, pbrFrag);
    }
    get isPBRMaterial() {
        return true;
    }
    get program() {
        return this.program_;
    }
    set color(color) {
        this.color_.copy(color);
    }
    get color() {
        return this.color_;
    }
    set emissive(color) {
        let color_ = this.uniforms_.uEmissive.value;
        color_.copy(color);
    }
    get emissive() {
        return this.uniforms_.uEmissive.value;
    }
    set roughness(roughness) {
        this.roughness_ = roughness;
    }
    get roughness() {
        return this.roughness_;
    }
    set metalness(metalness) {
        this.metalness_ = metalness;
    }
    get metalness() {
        return this.metalness_;
    }
    set normalScale(normalScale) {
        this.uniforms_.uNormalScale.value = normalScale;
    }
    get normalScale() {
        return this.uniforms_.uNormalScale.value;
    }
    set envMapSpecular(envMapSpecular) {
        this.envMapSpecular_ = envMapSpecular;
    }
    get envMapSpecular() {
        return this.envMapSpecular_;
    }
    set envMapDiffuse(envMapDiffuse) {
        this.envMapDiffuse_ = envMapDiffuse;
    }
    get envMapDiffuse() {
        return this.envMapDiffuse_;
    }
    set envMapIntensity(envMapIntensity) {
        this.envMapIntensity_ = envMapIntensity;
    }
    get envMapIntensity() {
        return this.envMapIntensity_;
    }
    serialize() {
        return {
            baseColor: new ogl_1.Vec4(1, 1, 1, 1),
            baseColorFactor: this.color_.copy(new ogl_1.Vec4()),
            roughness: this.roughness_,
            metalness: this.metalness_,
            envMapIntensity: this.envMapIntensity
            // normalScale: this.normalScale
        };
    }
    load(params) {
        if (params) {
            if (params.baseColorFactor) {
                this.color_.x = params.baseColorFactor[0] !== undefined ? params.baseColorFactor[0] : params.baseColorFactor.x;
                this.color_.y = params.baseColorFactor[1] !== undefined ? params.baseColorFactor[1] : params.baseColorFactor.y;
                this.color_.z = params.baseColorFactor[2] !== undefined ? params.baseColorFactor[2] : params.baseColorFactor.z;
                this.color_.w = params.baseColorFactor[3] !== undefined ? params.baseColorFactor[3] : params.baseColorFactor.w;
            }
            if (params.emissive) {
                this.emissive.x = params.emissive.x;
                this.emissive.y = params.emissive.y;
                this.emissive.z = params.emissive.z;
            }
            if (params.roughness !== undefined) {
                this.roughness = params.roughness;
            }
            if (params.metalness !== undefined) {
                this.metalness = params.metalness;
            }
            if (params.envMapIntensity !== undefined) {
                this.envMapIntensity = params.envMapIntensity;
            }
        }
    }
    createProgram_(defines, vertex, fragment) {
        vertex = vertex !== null && vertex !== void 0 ? vertex : PBRMaterial.defaultVertex;
        fragment = fragment !== null && fragment !== void 0 ? fragment : PBRMaterial.defaultFragment;
        vertex = defines + vertex;
        fragment = defines + fragment;
        let program = programcache_1.ProgramCache.getInstance().createProgram(this.gl_, vertex, fragment, this.uniforms_);
        // const program = new Program(this.gl_, {
        //     vertex,
        //     fragment,
        //     uniforms: this.uniforms_,
        //     // transparent: pbrparams.alphaMode === 'BLEND',
        //     cullFace: pbrparams.side ? null : this.gl_.BACK,
        // });
        return program;
    }
}
exports.PBRMaterial = PBRMaterial;
PBRMaterial.defaultVertex = pbr_vert_1.default;
PBRMaterial.defaultFragment = pbr_frag_1.default;
PBRMaterial.lutTextureMap = new Map();


/***/ }),

/***/ "./src/utils/eventdispatcher.ts":
/*!**************************************!*\
  !*** ./src/utils/eventdispatcher.ts ***!
  \**************************************/
/***/ ((__unused_webpack_module, exports) => {


/**
 * ported from https://github.com/mrdoob/eventdispatcher.js/
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.EventDispatcher = void 0;
class EventDispatcher {
    addEventListener(type, listener) {
        if (this._listeners === undefined)
            this._listeners = {};
        var listeners = this._listeners;
        if (listeners[type] === undefined) {
            listeners[type] = [];
        }
        if (listeners[type].indexOf(listener) === -1) {
            listeners[type].push(listener);
        }
    }
    hasEventListener(type, listener) {
        if (this._listeners === undefined)
            return false;
        var listeners = this._listeners;
        return listeners[type] !== undefined && listeners[type].indexOf(listener) !== -1;
    }
    removeEventListener(type, listener) {
        if (this._listeners === undefined)
            return;
        var listeners = this._listeners;
        var listenerArray = listeners[type];
        if (listenerArray !== undefined) {
            var index = listenerArray.indexOf(listener);
            if (index !== -1) {
                listenerArray.splice(index, 1);
            }
        }
    }
    dispatchEvent(event) {
        if (this._listeners === undefined)
            return;
        var listeners = this._listeners;
        var listenerArray = listeners[event.type];
        if (listenerArray !== undefined) {
            event.target = this;
            // Make a copy, in case listeners are removed while iterating.
            var array = listenerArray.slice(0);
            for (var i = 0, l = array.length; i < l; i++) {
                array[i].call(this, event);
            }
        }
    }
}
exports.EventDispatcher = EventDispatcher;


/***/ }),

/***/ "./src/utils/pbrhelper.ts":
/*!********************************!*\
  !*** ./src/utils/pbrhelper.ts ***!
  \********************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.assignPBRMaterials = void 0;
const pbrmaterial_1 = __webpack_require__(/*! ../materials/pbrmaterial */ "./src/materials/pbrmaterial.ts");
const ogl_1 = __webpack_require__(/*! ../ogl */ "./src/ogl.js");
function getPBRParams(gltfMaterial) {
    let pbrparams = {
        baseColor: gltfMaterial.baseColor ? new ogl_1.Vec4().fromArray(gltfMaterial.baseColor) : new ogl_1.Vec4(1, 1, 1),
        baseColorFactor: gltfMaterial.baseColorFactor ? new ogl_1.Vec4().fromArray(gltfMaterial.baseColorFactor) : new ogl_1.Vec4(1, 1, 1),
        roughness: gltfMaterial.roughnessFactor !== undefined ? gltfMaterial.roughnessFactor : 0.5,
        metalness: gltfMaterial.metallicFactor !== undefined ? gltfMaterial.metallicFactor : 0.5,
        alpha: 1,
        alphaCutoff: gltfMaterial.alphaCutoff,
        side: gltfMaterial.doubleSided !== undefined ? gltfMaterial.doubleSided : false,
        transparent: gltfMaterial.alphaMode !== undefined ? gltfMaterial.alphaMode === 'BLEND' : false
    };
    return pbrparams;
}
function updateUniforms_(material) {
    if (material && material instanceof pbrmaterial_1.PBRMaterial) {
        let program = material.program;
        program.uniforms['uBaseColorFactor'].value.copy(material.color);
        program.uniforms['uRoughness'].value = material.roughness;
        program.uniforms['uMetallic'].value = material.metalness;
        program.uniforms['uEnvMapIntensity'].value = material.envMapIntensity;
        program.uniforms['tEnvDiffuse'].value = material.envMapDiffuse;
        program.uniforms['tEnvSpecular'].value = material.envMapSpecular;
    }
}
function assignPBRMaterials(gl, root, materialCtor) {
    root.traverse((node) => {
        if (node instanceof ogl_1.Mesh && node.program && !node.isDiamondMaterial && node.program.gltfMaterial) { //todo: isDiamondMaterial on node??
            let defines = `${node.geometry.attributes.uv ? `#define UV\n` : ``}`;
            let material = materialCtor ?
                materialCtor(gl, getPBRParams(node.program.gltfMaterial), defines) :
                new pbrmaterial_1.PBRMaterial(gl, getPBRParams(node.program.gltfMaterial), defines);
            node.material = material;
            node.program = material.program;
            node.onBeforeRender((value) => {
                updateUniforms_(node.material);
            });
        }
    });
}
exports.assignPBRMaterials = assignPBRMaterials;


/***/ }),

/***/ "./src/utils/programcache.ts":
/*!***********************************!*\
  !*** ./src/utils/programcache.ts ***!
  \***********************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ProgramCache = void 0;
const ogl_1 = __webpack_require__(/*! ../ogl */ "./src/ogl.js");
class ProgramCache {
    constructor() {
        this.programMap_ = new Map();
    }
    static getInstance() {
        if (!this.instance_) {
            this.instance_ = new ProgramCache();
        }
        return this.instance_;
    }
    createProgram(gl, vertex, fragment, uniforms) {
        let key = vertex + fragment + gl.canvas.id;
        let cachedProgram = this.programMap_.get(key);
        if (cachedProgram) {
            return cachedProgram;
        }
        const program = new ogl_1.Program(gl, {
            vertex,
            fragment,
            uniforms: uniforms,
        });
        this.programMap_.set(key, program);
        return program;
    }
}
exports.ProgramCache = ProgramCache;


/***/ }),

/***/ "./src/utils/uniformUtils.ts":
/*!***********************************!*\
  !*** ./src/utils/uniformUtils.ts ***!
  \***********************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.mergeUniforms = exports.cloneUniforms = void 0;
function cloneUniforms(src) {
    const dst = {};
    for (let u in src) {
        dst[u] = {};
        for (let p in src[u]) {
            const property = src[u][p];
            if (property && (typeof property.clone === 'function')) {
                dst[u][p] = property.clone();
            }
            else if (Array.isArray(property)) {
                dst[u][p] = property.slice();
            }
            else {
                dst[u][p] = property;
            }
        }
    }
    return dst;
}
exports.cloneUniforms = cloneUniforms;
function mergeUniforms(uniforms) {
    const merged = {};
    for (let u = 0; u < uniforms.length; u++) {
        const tmp = cloneUniforms(uniforms[u]);
        for (let p in tmp) {
            merged[p] = tmp[p];
        }
    }
    return merged;
}
exports.mergeUniforms = mergeUniforms;


/***/ }),

/***/ "./src/utils/util.ts":
/*!***************************!*\
  !*** ./src/utils/util.ts ***!
  \***************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.traverseMeshes = exports.traverse = exports.computeBoundingBox = exports.getAllMeshes = exports.getPointerPosition = exports.getSnapshot = exports.getSnapshotData = void 0;
const ogl_1 = __webpack_require__(/*! ../ogl */ "./src/ogl.js");
function getSnapshotData(renderer, mimeType) {
    mimeType = mimeType !== null && mimeType !== void 0 ? mimeType : "image/png";
    return renderer.gl.canvas.toDataURL(mimeType);
}
exports.getSnapshotData = getSnapshotData;
function getSnapshot(renderer, options) {
    var _a, _b;
    let imgUrl = getSnapshotData(renderer, options.mimeType);
    let context = (_a = options.context) !== null && _a !== void 0 ? _a : (_b = options.canvas) === null || _b === void 0 ? void 0 : _b.getContext("2d");
    if (!context)
        return Promise.resolve(imgUrl);
    return new Promise((resolve, reject) => {
        let img = new Image();
        img.onload = () => {
            context === null || context === void 0 ? void 0 : context.drawImage(img, 0, 0, context.canvas.width, context.canvas.height);
            resolve(imgUrl);
        };
        img.src = imgUrl;
    });
}
exports.getSnapshot = getSnapshot;
function getPointerPosition(position, canvas) {
    const canvasBounds = canvas.getBoundingClientRect();
    let x = ((position.x - canvasBounds.left) / (canvasBounds.right - canvasBounds.left)) * 2 - 1;
    let y = -((position.y - canvasBounds.top) / (canvasBounds.bottom - canvasBounds.top)) * 2 + 1;
    return { x: x, y: y };
}
exports.getPointerPosition = getPointerPosition;
function getAllMeshes(root) {
    let meshes = [];
    root.traverse((group) => {
        var _a;
        if ((_a = group) === null || _a === void 0 ? void 0 : _a.geometry) {
            if (!group.parent)
                return; // Skip unattached
            meshes.push(group);
        }
    });
    return meshes;
}
exports.getAllMeshes = getAllMeshes;
function computeBoundingBox(root) {
    const min = new ogl_1.Vec3(+Infinity);
    const max = new ogl_1.Vec3(-Infinity);
    const boundsMin = new ogl_1.Vec3();
    const boundsMax = new ogl_1.Vec3();
    const boundsCenter = new ogl_1.Vec3();
    const boundsScale = new ogl_1.Vec3();
    root.traverse((group) => {
        var _a;
        let geometry = (_a = group) === null || _a === void 0 ? void 0 : _a.geometry;
        if (geometry) {
            if (!group.parent)
                return; // Skip unattached
            if (!geometry.bounds)
                geometry.computeBoundingSphere();
            boundsCenter.copy(geometry.bounds.center).applyMatrix4(group.worldMatrix);
            // Get max world scale axis
            group.worldMatrix.getScaling(boundsScale);
            const radiusScale = Math.max(Math.max(boundsScale[0], boundsScale[1]), boundsScale[2]);
            const radius = geometry.bounds.radius * radiusScale;
            boundsMin.set(-radius).add(boundsCenter);
            boundsMax.set(+radius).add(boundsCenter);
            // Apply world matrix to bounds
            for (let i = 0; i < 3; i++) {
                min[i] = Math.min(min[i], boundsMin[i]);
                max[i] = Math.max(max[i], boundsMax[i]);
            }
        }
    });
    return { min: min, max: max };
}
exports.computeBoundingBox = computeBoundingBox;
function traverse(root, callBack, filter) {
    root.traverse((group) => {
        if (filter) {
            if (filter(group)) {
                callBack(group);
            }
        }
        else {
            callBack(group);
        }
    });
}
exports.traverse = traverse;
function traverseMeshes(root, callBack) {
    traverse(root, callBack, (group) => { return group.geometry != null; });
}
exports.traverseMeshes = traverseMeshes;


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		if(__webpack_module_cache__[moduleId]) {
/******/ 			return __webpack_module_cache__[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__("./src/index.ts");
/******/ 	
/******/ 	return __webpack_exports__;
/******/ })()
;
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9vZ2wvd2VicGFjay91bml2ZXJzYWxNb2R1bGVEZWZpbml0aW9uIiwid2VicGFjazovL29nbC8uL3NyYy9tYXRlcmlhbHMvc2hhZGVycy9wYnIuZnJhZyIsIndlYnBhY2s6Ly9vZ2wvLi9zcmMvbWF0ZXJpYWxzL3NoYWRlcnMvcGJyLnZlcnQiLCJ3ZWJwYWNrOi8vb2dsLy4vc3JjL2NvcmUvQ2FtZXJhLmpzIiwid2VicGFjazovL29nbC8uL3NyYy9jb3JlL0dlb21ldHJ5LmpzIiwid2VicGFjazovL29nbC8uL3NyYy9jb3JlL01lc2guanMiLCJ3ZWJwYWNrOi8vb2dsLy4vc3JjL2NvcmUvUHJvZ3JhbS5qcyIsIndlYnBhY2s6Ly9vZ2wvLi9zcmMvY29yZS9SZW5kZXJUYXJnZXQuanMiLCJ3ZWJwYWNrOi8vb2dsLy4vc3JjL2NvcmUvUmVuZGVyZXIuanMiLCJ3ZWJwYWNrOi8vb2dsLy4vc3JjL2NvcmUvVGV4dHVyZS5qcyIsIndlYnBhY2s6Ly9vZ2wvLi9zcmMvY29yZS9UcmFuc2Zvcm0uanMiLCJ3ZWJwYWNrOi8vb2dsLy4vc3JjL2V4dHJhcy9BbmltYXRpb24uanMiLCJ3ZWJwYWNrOi8vb2dsLy4vc3JjL2V4dHJhcy9Cb3guanMiLCJ3ZWJwYWNrOi8vb2dsLy4vc3JjL2V4dHJhcy9DdXJ2ZS5qcyIsIndlYnBhY2s6Ly9vZ2wvLi9zcmMvZXh0cmFzL0N5bGluZGVyLmpzIiwid2VicGFjazovL29nbC8uL3NyYy9leHRyYXMvRmxvd21hcC5qcyIsIndlYnBhY2s6Ly9vZ2wvLi9zcmMvZXh0cmFzL0dMVEZBbmltYXRpb24uanMiLCJ3ZWJwYWNrOi8vb2dsLy4vc3JjL2V4dHJhcy9HTFRGTG9hZGVyLmpzIiwid2VicGFjazovL29nbC8uL3NyYy9leHRyYXMvR0xURlNraW4uanMiLCJ3ZWJwYWNrOi8vb2dsLy4vc3JjL2V4dHJhcy9HUEdQVS5qcyIsIndlYnBhY2s6Ly9vZ2wvLi9zcmMvZXh0cmFzL0tUWFRleHR1cmUuanMiLCJ3ZWJwYWNrOi8vb2dsLy4vc3JjL2V4dHJhcy9Ob3JtYWxQcm9ncmFtLmpzIiwid2VicGFjazovL29nbC8uL3NyYy9leHRyYXMvT3JiaXQuanMiLCJ3ZWJwYWNrOi8vb2dsLy4vc3JjL2V4dHJhcy9QbGFuZS5qcyIsIndlYnBhY2s6Ly9vZ2wvLi9zcmMvZXh0cmFzL1BvbHlsaW5lLmpzIiwid2VicGFjazovL29nbC8uL3NyYy9leHRyYXMvUG9zdC5qcyIsIndlYnBhY2s6Ly9vZ2wvLi9zcmMvZXh0cmFzL1JheWNhc3QuanMiLCJ3ZWJwYWNrOi8vb2dsLy4vc3JjL2V4dHJhcy9TaGFkb3cuanMiLCJ3ZWJwYWNrOi8vb2dsLy4vc3JjL2V4dHJhcy9Ta2luLmpzIiwid2VicGFjazovL29nbC8uL3NyYy9leHRyYXMvU3BoZXJlLmpzIiwid2VicGFjazovL29nbC8uL3NyYy9leHRyYXMvVGV4dC5qcyIsIndlYnBhY2s6Ly9vZ2wvLi9zcmMvZXh0cmFzL1RleHR1cmVMb2FkZXIuanMiLCJ3ZWJwYWNrOi8vb2dsLy4vc3JjL2V4dHJhcy9Ub3J1cy5qcyIsIndlYnBhY2s6Ly9vZ2wvLi9zcmMvZXh0cmFzL1RyaWFuZ2xlLmpzIiwid2VicGFjazovL29nbC8uL3NyYy9tYXRoL0NvbG9yLmpzIiwid2VicGFjazovL29nbC8uL3NyYy9tYXRoL0V1bGVyLmpzIiwid2VicGFjazovL29nbC8uL3NyYy9tYXRoL01hdDMuanMiLCJ3ZWJwYWNrOi8vb2dsLy4vc3JjL21hdGgvTWF0NC5qcyIsIndlYnBhY2s6Ly9vZ2wvLi9zcmMvbWF0aC9RdWF0LmpzIiwid2VicGFjazovL29nbC8uL3NyYy9tYXRoL1ZlYzIuanMiLCJ3ZWJwYWNrOi8vb2dsLy4vc3JjL21hdGgvVmVjMy5qcyIsIndlYnBhY2s6Ly9vZ2wvLi9zcmMvbWF0aC9WZWM0LmpzIiwid2VicGFjazovL29nbC8uL3NyYy9tYXRoL2Z1bmN0aW9ucy9Db2xvckZ1bmMuanMiLCJ3ZWJwYWNrOi8vb2dsLy4vc3JjL21hdGgvZnVuY3Rpb25zL0V1bGVyRnVuYy5qcyIsIndlYnBhY2s6Ly9vZ2wvLi9zcmMvbWF0aC9mdW5jdGlvbnMvTWF0M0Z1bmMuanMiLCJ3ZWJwYWNrOi8vb2dsLy4vc3JjL21hdGgvZnVuY3Rpb25zL01hdDRGdW5jLmpzIiwid2VicGFjazovL29nbC8uL3NyYy9tYXRoL2Z1bmN0aW9ucy9RdWF0RnVuYy5qcyIsIndlYnBhY2s6Ly9vZ2wvLi9zcmMvbWF0aC9mdW5jdGlvbnMvVmVjMkZ1bmMuanMiLCJ3ZWJwYWNrOi8vb2dsLy4vc3JjL21hdGgvZnVuY3Rpb25zL1ZlYzNGdW5jLmpzIiwid2VicGFjazovL29nbC8uL3NyYy9tYXRoL2Z1bmN0aW9ucy9WZWM0RnVuYy5qcyIsIndlYnBhY2s6Ly9vZ2wvLi9zcmMvb2dsLmpzIiwid2VicGFjazovL29nbC8uL3NyYy9leHRyYXMvQ3VzdG9tUG9zdC50cyIsIndlYnBhY2s6Ly9vZ2wvLi9zcmMvaW5kZXgudHMiLCJ3ZWJwYWNrOi8vb2dsLy4vc3JjL21hdGVyaWFscy9wYnJtYXRlcmlhbC50cyIsIndlYnBhY2s6Ly9vZ2wvLi9zcmMvdXRpbHMvZXZlbnRkaXNwYXRjaGVyLnRzIiwid2VicGFjazovL29nbC8uL3NyYy91dGlscy9wYnJoZWxwZXIudHMiLCJ3ZWJwYWNrOi8vb2dsLy4vc3JjL3V0aWxzL3Byb2dyYW1jYWNoZS50cyIsIndlYnBhY2s6Ly9vZ2wvLi9zcmMvdXRpbHMvdW5pZm9ybVV0aWxzLnRzIiwid2VicGFjazovL29nbC8uL3NyYy91dGlscy91dGlsLnRzIiwid2VicGFjazovL29nbC93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9vZ2wvd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL29nbC93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovL29nbC93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL29nbC93ZWJwYWNrL3N0YXJ0dXAiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6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QVM7QUFDVDs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsdUJBQXVCLG9CQUFvQjtBQUMzQztBQUNBOztBQUVBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNyRytDO0FBQ0U7QUFDSjtBQUNOO0FBQ1k7QUFDVjtBQUNGO0FBQ1k7O0FBRW5EO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRU87QUFDUDtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0Esa0NBQWtDLFFBQVE7O0FBRTFDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNULGlFQUFpRSxVQUFVO0FBQzNFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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QUU3QztBQUNQO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLFFBQVEsdURBQVk7QUFDcEI7QUFDQTs7QUFFQTtBQUNBLFFBQVEsd0RBQWE7QUFDckI7QUFDQTs7QUFFQTtBQUNBLFFBQVEsNkRBQWtCO0FBQzFCO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7Ozs7Ozs7QUN2RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFTztBQUNQO0FBQ0EsNkJBQTZCLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRTtBQUN2RCwyREFBMkQsSUFBSTtBQUMvRDtBQUNBOztBQUVPO0FBQ1A7QUFDQTtBQUNBOztBQUVPO0FBQ1A7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7Ozs7O0FDMUNBO0FBQ087QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQzNEQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLEtBQUs7QUFDaEIsV0FBVyxLQUFLO0FBQ2hCLGFBQWEsS0FBSztBQUNsQjtBQUNPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLEtBQUs7QUFDaEIsV0FBVyxLQUFLO0FBQ2hCO0FBQ0EsYUFBYSxLQUFLO0FBQ2xCO0FBQ087QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLEtBQUs7QUFDaEIsV0FBVyxLQUFLO0FBQ2hCLGFBQWEsS0FBSztBQUNsQjtBQUNPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLEtBQUs7QUFDaEIsYUFBYSxLQUFLO0FBQ2xCO0FBQ087QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsS0FBSztBQUNoQixhQUFhLEtBQUs7QUFDbEI7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsV0FBVyxLQUFLO0FBQ2hCLFdBQVcsS0FBSztBQUNoQixhQUFhLEtBQUs7QUFDbEI7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7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O0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWSxLQUFLO0FBQ2pCLFlBQVksS0FBSztBQUNqQixZQUFZLEtBQUs7QUFDakI7QUFDTztBQUNQO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVksS0FBSztBQUNqQixZQUFZLEtBQUs7QUFDakIsWUFBWSxLQUFLO0FBQ2pCO0FBQ087QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsS0FBSztBQUNoQixXQUFXLEtBQUs7QUFDaEIsWUFBWSxLQUFLO0FBQ2pCO0FBQ087QUFDUDs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtB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QUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsS0FBSztBQUNoQixXQUFXLEtBQUs7QUFDaEIsV0FBVyxLQUFLO0FBQ2hCLGFBQWEsS0FBSztBQUNsQjtBQUNPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsS0FBSztBQUNoQixXQUFXLEtBQUs7QUFDaEIsV0FBVyxLQUFLO0FBQ2hCLGFBQWEsS0FBSztBQUNsQjtBQUNPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsS0FBSztBQUNoQixXQUFXLEtBQUs7QUFDaEIsV0FBVyxPQUFPO0FBQ2xCLGFBQWEsS0FBSztBQUNsQjtBQUNPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDcjhCc0M7O0FBRXRDO0FBQ0E7QUFDQTtBQUNBLFdBQVcsS0FBSztBQUNoQixhQUFhLEtBQUs7QUFDbEI7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsS0FBSztBQUNoQixXQUFXLEtBQUs7QUFDaEIsV0FBVyxPQUFPO0FBQ2xCLGFBQWEsS0FBSztBQUNsQjtBQUNPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLEtBQUs7QUFDaEIsV0FBVyxLQUFLO0FBQ2hCLFdBQVcsS0FBSztBQUNoQixhQUFhLEtB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LFVBQVMsYUFBVCxTQUFTLHVCQUFULFNBQVMsQ0FBRSxTQUFTLE1BQUssU0FBUyxDQUFDLENBQUMsQ0FBQyxTQUFTLGFBQVQsU0FBUyx1QkFBVCxTQUFTLENBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFDcEYsU0FBUyxFQUFFLEVBQUUsS0FBSyxFQUFFLFVBQVMsYUFBVCxTQUFTLHVCQUFULFNBQVMsQ0FBRSxTQUFTLE1BQUssU0FBUyxDQUFDLENBQUMsQ0FBQyxTQUFTLGFBQVQsU0FBUyx1QkFBVCxTQUFTLENBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFFbkYsT0FBTyxFQUFFLEVBQUUsS0FBSyxFQUFFLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBQyxFQUFFLEVBQ3BDLFlBQVksRUFBRSxFQUFFLEtBQUssRUFBRSxVQUFTLGFBQVQsU0FBUyx1QkFBVCxTQUFTLENBQUUsV0FBVyxLQUFJLENBQUMsRUFBRSxFQUVwRCxVQUFVLEVBQUUsRUFBRSxLQUFLLEVBQUUsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFDLEVBQUUsRUFFdkMsU0FBUyxFQUFFLEVBQUUsS0FBSyxFQUFFLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBQyxFQUFFLEVBQ3RDLFNBQVMsRUFBRSxFQUFFLEtBQUssRUFBRSxVQUFTLGFBQVQsU0FBUyx1QkFBVCxTQUFTLENBQUUsUUFBUSxLQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUV0RCxJQUFJLEVBQUUsRUFBRSxLQUFLLEVBQUUsV0FBVyxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUM1RCxXQUFXLEVBQUUsRUFBRSxLQUFLLEVBQUUsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFDLEVBQUUsRUFDeEMsWUFBWSxFQUFFLEVBQUUsS0FBSyxFQUFFLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBQyxFQUFFLEVBQ3pDLFdBQVcsRUFBRSxFQUFFLEtBQUssRUFB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QyxDQUFDO2FBQ25CO1NBQ0o7YUFBTTtZQUNILFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUNuQjtJQUNMLENBQUMsQ0FBQyxDQUFDO0FBQ1AsQ0FBQztBQVZELDRCQVVDO0FBRUQsU0FBZ0IsY0FBYyxDQUFDLElBQWUsRUFBRSxRQUFhO0lBQ3pELFFBQVEsQ0FBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLENBQUMsS0FBZ0IsRUFBQyxFQUFFLEdBQUUsT0FBUSxLQUFjLENBQUMsUUFBUSxJQUFJLElBQUksR0FBQyxDQUFDLENBQUM7QUFDN0YsQ0FBQztBQUZELHdDQUVDOzs7Ozs7O1VDNUZEO1VBQ0E7O1VBRUE7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBOztVQUVBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBOzs7OztXQ3JCQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLHdDQUF3Qyx5Q0FBeUM7V0FDakY7V0FDQTtXQUNBLEU7Ozs7O1dDUEEsd0Y7Ozs7O1dDQUE7V0FDQTtXQUNBO1dBQ0Esc0RBQXNELGtCQUFrQjtXQUN4RTtXQUNBLCtDQUErQyxjQUFjO1dBQzdELEU7Ozs7O1VDTkE7VUFDQTtVQUNBO1VBQ0EiLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gd2VicGFja1VuaXZlcnNhbE1vZHVsZURlZmluaXRpb24ocm9vdCwgZmFjdG9yeSkge1xuXHRpZih0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcpXG5cdFx0bW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCk7XG5cdGVsc2UgaWYodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKVxuXHRcdGRlZmluZShbXSwgZmFjdG9yeSk7XG5cdGVsc2UgaWYodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKVxuXHRcdGV4cG9ydHNbXCJvZ2xcIl0gPSBmYWN0b3J5KCk7XG5cdGVsc2Vcblx0XHRyb290W1wib2dsXCJdID0gZmFjdG9yeSgpO1xufSkoc2VsZiwgZnVuY3Rpb24oKSB7XG5yZXR1cm4gIiwiZXhwb3J0IGRlZmF1bHQgXCJwcmVjaXNpb24gaGlnaHAgZmxvYXQ7XFxucHJlY2lzaW9uIGhpZ2hwIGludDtcXG51bmlmb3JtIG1hdDQgdmlld01hdHJpeDtcXG51bmlmb3JtIG1hdDMgbm9ybWFsTWF0cml4O1xcbnVuaWZvcm0gdmVjMyBjYW1lcmFQb3NpdGlvbjtcXG51bmlmb3JtIHZlYzQgdUJhc2VDb2xvckZhY3RvcjtcXG51bmlmb3JtIHNhbXBsZXIyRCB0QmFzZUNvbG9yO1xcbnVuaWZvcm0gc2FtcGxlcjJEIHRSTTtcXG51bmlmb3JtIGZsb2F0IHVSb3VnaG5lc3M7XFxudW5pZm9ybSBmbG9hdCB1TWV0YWxsaWM7XFxudW5pZm9ybSBzYW1wbGVyMkQgdE5vcm1hbDtcXG51bmlmb3JtIGZsb2F0IHVOb3JtYWxTY2FsZTtcXG51bmlmb3JtIHNhbXBsZXIyRCB0RW1pc3NpdmU7XFxudW5pZm9ybSB2ZWMzIHVFbWlzc2l2ZTtcXG51bmlmb3JtIHNhbXBsZXIyRCB0T2NjbHVzaW9uO1xcbnVuaWZvcm0gc2FtcGxlcjJEIHRMVVQ7XFxudW5pZm9ybSBzYW1wbGVyMkQgdEVudkRpZmZ1c2U7XFxudW5pZm9ybSBzYW1wbGVyMkQgdEVudlNwZWN1bGFyO1xcbnVuaWZvcm0gZmxvYXQgdUVudkRpZmZ1c2U7XFxudW5pZm9ybSBmbG9hdCB1RW52U3BlY3VsYXI7XFxudW5pZm9ybSBmbG9hdCB1RW52TWFwSW50ZW5zaXR5O1xcbnVuaWZvcm0gZmxvYXQgdUFscGhhO1xcbnVuaWZvcm0gZmxvYXQgdUFscGhhQ3V0b2ZmO1xcbnZhcnlpbmcgdmVjMiB2VXY7XFxudmFyeWluZyB2ZWMzIHZOb3JtYWw7XFxudmFyeWluZyB2ZWMzIHZNUG9zO1xcbnZhcnlpbmcgdmVjNCB2TVZQb3M7XFxuXFxuY29uc3QgZmxvYXQgUEkgPSAzLjE0MTU5MjY1MzU5O1xcbmNvbnN0IGZsb2F0IFJFQ0lQUk9DQUxfUEkgPSAwLjMxODMwOTg4NjE4O1xcbmNvbnN0IGZsb2F0IFJFQ0lQUk9DQUxfUEkyID0gMC4xNTkxNTQ5NDtcXG5jb25zdCBmbG9hdCBMTjIgPSAwLjY5MzE0NzI7XFxuY29uc3QgZmxvYXQgRU5WX0xPRFMgPSA2LjA7XFxudmVjNCBTUkdCdG9MaW5lYXIodmVjNCBzcmdiKSB7XFxuICB2ZWMzIGxpbk91dCA9IHBvdyhzcmdiLnh5eiwgdmVjMygyLjIpKTtcXG4gIHJldHVybiB2ZWM0KGxpbk91dCwgc3JnYi53KTs7XFxufVxcbnZlYzQgUkdCTVRvTGluZWFyKGluIHZlYzQgdmFsdWUpIHtcXG4gIGZsb2F0IG1heFJhbmdlID0gNi4wO1xcbiAgcmV0dXJuIHZlYzQodmFsdWUueHl6ICogdmFsdWUudyAqIG1heFJhbmdlLCAxLjApO1xcbn1cXG52ZWMzIGxpbmVhclRvU1JHQih2ZWMzIGNvbG9yKSB7XFxuICByZXR1cm4gcG93KGNvbG9yLCB2ZWMzKDEuMCAvIDIuMikpO1xcbn1cXG52ZWMzIGdldE5vcm1hbCgpIHtcXG4gICNpZmRlZiBOT1JNQUxfTUFQICBcXG4gICAgdmVjMyBwb3NfZHggPSBkRmR4KHZNUG9zLnh5eik7XFxuICAgIHZlYzMgcG9zX2R5ID0gZEZkeSh2TVBvcy54eXopO1xcbiAgICB2ZWMyIHRleF9keCA9IGRGZHgodlV2KTtcXG4gICAgdmVjMiB0ZXhfZHkgPSBkRmR5KHZVdik7XFxuICAgIC8vIFRhbmdlbnQsIEJpdGFuZ2VudFxcbiAgICB2ZWMzIHQgPSBub3JtYWxpemUocG9zX2R4ICogdGV4X2R5LnQgLSBwb3NfZHkgKiB0ZXhfZHgudCk7XFxuICAgIHZlYzMgYiA9IG5vcm1hbGl6ZSgtcG9zX2R4ICogdGV4X2R5LnMgKyBwb3NfZHkgKiB0ZXhfZHgucyk7XFxuICAgIG1hdDMgdGJuID0gbWF0Myh0LCBiLCBub3JtYWxpemUodk5vcm1hbCkpO1xcbiAgICB2ZWMzIG4gPSB0ZXh0dXJlMkQodE5vcm1hbCwgdlV2KS5yZ2IgKiAyLjAgLSAxLjA7XFxuICAgIG4ueHkgKj0gdU5vcm1hbFNjYWxlO1xcbiAgICB2ZWMzIG5vcm1hbCA9IG5vcm1hbGl6ZSh0Ym4gKiBuKTtcXG4gICAgLy8gR2V0IHdvcmxkIG5vcm1hbCBmcm9tIHZpZXcgbm9ybWFsIChub3JtYWxNYXRyaXggKiBub3JtYWwpXFxuICAgIC8vIHJldHVybiBub3JtYWxpemUoKHZlYzQobm9ybWFsLCAwLjApICogdmlld01hdHJpeCkueHl6KTtcXG4gICAgcmV0dXJuIG5vcm1hbGl6ZShub3JtYWwpO1xcbiAgI2Vsc2VcXG4gICAgcmV0dXJuIG5vcm1hbGl6ZSh2Tm9ybWFsKTtcXG4gICNlbmRpZlxcbn1cXG5cXG52ZWMyIGNhcnRlc2lhblRvUG9sYXIodmVjMyBuKSB7XFxuICB2ZWMyIHV2O1xcbiAgdXYueCA9IGF0YW4obi56LCBuLngpICogUkVDSVBST0NBTF9QSTIgKyAwLjU7XFxuICB1di55ID0gYXNpbihuLnkpICogUkVDSVBST0NBTF9QSSArIDAuNTtcXG4gIHJldHVybiB1djtcXG59XFxuXFxudm9pZCBnZXRJQkxDb250cmlidXRpb24oaW5vdXQgdmVjMyBkaWZmdXNlLCBpbm91dCB2ZWMzIHNwZWN1bGFyLCBmbG9hdCBOZFYsIGZsb2F0IHJvdWdobmVzcywgdmVjMyBuLCB2ZWMzIHJlZmxlY3Rpb24sIHZlYzMgZGlmZnVzZUNvbG9yLCB2ZWMzIHNwZWN1bGFyQ29sb3IpIHtcXG4gIHZlYzMgYnJkZiA9IFNSR0J0b0xpbmVhcih0ZXh0dXJlMkQodExVVCwgdmVjMihOZFYsIHJvdWdobmVzcykpKS5yZ2I7XFxuICB2ZWMzIGRpZmZ1c2VMaWdodCA9IFJHQk1Ub0xpbmVhcih0ZXh0dXJlMkQodEVudkRpZmZ1c2UsIGNhcnRlc2lhblRvUG9sYXIobikpKS5yZ2I7XFxuICBkaWZmdXNlTGlnaHQgPSBtaXgodmVjMygxKSwgZGlmZnVzZUxpZ2h0LCB1RW52RGlmZnVzZSk7XFxuICAvLyBTYW1wbGUgMiBsZXZlbHMgYW5kIG1peCBiZXR3ZWVuIHRvIGdldCBzbW9vdGhlciBkZWdyYWRhdGlvblxcbiAgZmxvYXQgYmxlbmQgPSByb3VnaG5lc3MgKiBFTlZfTE9EUztcXG4gIGZsb2F0IGxldmVsMCA9IGZsb29yKGJsZW5kKTtcXG4gIGZsb2F0IGxldmVsMSA9IG1pbihFTlZfTE9EUywgbGV2ZWwwICsgMS4wKTtcXG4gIGJsZW5kIC09IGxldmVsMDtcXG4gIFxcbiAgLy8gU2FtcGxlIHRoZSBzcGVjdWxhciBlbnYgbWFwIGF0bGFzIGRlcGVuZGluZyBvbiB0aGUgcm91Z2huZXNzIHZhbHVlXFxuICB2ZWMyIHV2U3BlYyA9IGNhcnRlc2lhblRvUG9sYXIocmVmbGVjdGlvbik7XFxuICB1dlNwZWMueSAvPSAyLjA7XFxuICB2ZWMyIHV2MCA9IHV2U3BlYztcXG4gIHZlYzIgdXYxID0gdXZTcGVjO1xcbiAgdXYwIC89IHBvdygyLjAsIGxldmVsMCk7XFxuICB1djAueSArPSAxLjAgLSBleHAoLUxOMiAqIGxldmVsMCk7XFxuICB1djEgLz0gcG93KDIuMCwgbGV2ZWwxKTtcXG4gIHV2MS55ICs9IDEuMCAtIGV4cCgtTE4yICogbGV2ZWwxKTtcXG4gIHZlYzMgc3BlY3VsYXIwID0gUkdCTVRvTGluZWFyKHRleHR1cmUyRCh0RW52U3BlY3VsYXIsIHV2MCkpLnJnYjtcXG4gIHZlYzMgc3BlY3VsYXIxID0gUkdCTVRvTGluZWFyKHRleHR1cmUyRCh0RW52U3BlY3VsYXIsIHV2MSkpLnJnYjtcXG4gIHZlYzMgc3BlY3VsYXJMaWdodCA9IG1peChzcGVjdWxhcjAsIHNwZWN1bGFyMSwgYmxlbmQpO1xcbiAgZGlmZnVzZSA9IGRpZmZ1c2VMaWdodCAqIGRpZmZ1c2VDb2xvcjtcXG4gIFxcbiAgLy8gQml0IG9mIGV4dHJhIHJlZmxlY3Rpb24gZm9yIHNtb290aCBtYXRlcmlhbHNcXG4gIGZsb2F0IHJlZmxlY3Rpdml0eSA9IHBvdygoMS4wIC0gcm91Z2huZXNzKSwgMi4wKSAqIDAuMDU7XFxuICBzcGVjdWxhciA9IHNwZWN1bGFyTGlnaHQgKiAoc3BlY3VsYXJDb2xvciAqIGJyZGYueCArIGJyZGYueSArIHJlZmxlY3Rpdml0eSk7XFxuICBzcGVjdWxhciAqPSB1RW52U3BlY3VsYXI7XFxufVxcblxcbnZvaWQgbWFpbigpIHtcXG4gIHZlYzQgYmFzZUNvbG9yID0gdUJhc2VDb2xvckZhY3RvcjtcXG4gICNpZmRlZiBDT0xPUl9NQVBcXG4gICAgYmFzZUNvbG9yICo9IFNSR0J0b0xpbmVhcih0ZXh0dXJlMkQodEJhc2VDb2xvciwgdlV2KSk7XFxuICAjZW5kaWZcXG4gIC8vIEdldCBiYXNlIGFscGhhXFxuICBmbG9hdCBhbHBoYSA9IGJhc2VDb2xvci5hO1xcbiAgI2lmZGVmIEFMUEhBX01BU0tcXG4gICAgaWYgKGFscGhhIDwgdUFscGhhQ3V0b2ZmKSBkaXNjYXJkO1xcbiAgI2VuZGlmXFxuICAvLyBSTSBtYXAgcGFja2VkIGFzIGdiID0gW25vdGhpbmcsIHJvdWdobmVzcywgbWV0YWxsaWMsIG5vdGhpbmddXFxuICB2ZWM0IHJtU2FtcGxlID0gdmVjNCgxKTtcXG4gICNpZmRlZiBSTV9NQVBcXG4gICAgcm1TYW1wbGUgKj0gdGV4dHVyZTJEKHRSTSwgdlV2KTtcXG4gICNlbmRpZlxcbiAgZmxvYXQgcm91Z2huZXNzID0gY2xhbXAocm1TYW1wbGUuZyAqIHVSb3VnaG5lc3MsIDAuMDQsIDEuMCk7XFxuICBmbG9hdCBtZXRhbGxpYyA9IGNsYW1wKHJtU2FtcGxlLmIgKiB1TWV0YWxsaWMsIDAuMDQsIDEuMCk7XFxuICB2ZWMzIGYwID0gdmVjMygwLjA0KTtcXG4gIHZlYzMgZGlmZnVzZUNvbG9yID0gYmFzZUNvbG9yLnJnYiAqICh2ZWMzKDEuMCkgLSBmMCkgKiAoMS4wIC0gbWV0YWxsaWMpO1xcbiAgdmVjMyBzcGVjdWxhckNvbG9yID0gbWl4KGYwLCBiYXNlQ29sb3IucmdiLCBtZXRhbGxpYyk7XFxuICB2ZWMzIHNwZWN1bGFyRW52UjAgPSBzcGVjdWxhckNvbG9yO1xcbiAgdmVjMyBzcGVjdWxhckVudlI5MCA9IHZlYzMoY2xhbXAobWF4KG1heChzcGVjdWxhckNvbG9yLnIsIHNwZWN1bGFyQ29sb3IuZyksIHNwZWN1bGFyQ29sb3IuYikgKiAyNS4wLCAwLjAsIDEuMCkpO1xcbiAgdmVjMyBOID0gZ2V0Tm9ybWFsKCk7XFxuICB2ZWMzIFYgPSBub3JtYWxpemUoY2FtZXJhUG9zaXRpb24gLSB2TVBvcyk7XFxuICB2ZWMzIHJlZmxlY3Rpb24gPSBub3JtYWxpemUocmVmbGVjdCgtViwgTikpO1xcbiAgZmxvYXQgTmRWID0gY2xhbXAoYWJzKGRvdChOLCBWKSksIDAuMDAxLCAxLjApO1xcbiAgLy8gU2hhZGluZyBiYXNlZCBvZmYgSUJMIGxpZ2h0aW5nXFxuICB2ZWMzIGNvbG9yID0gdmVjMygwLik7XFxuICB2ZWMzIGRpZmZ1c2VJQkw7XFxuICB2ZWMzIHNwZWN1bGFySUJMO1xcbiAgZ2V0SUJMQ29udHJpYnV0aW9uKGRpZmZ1c2VJQkwsIHNwZWN1bGFySUJMLCBOZFYsIHJvdWdobmVzcywgTiwgcmVmbGVjdGlvbiwgZGlmZnVzZUNvbG9yLCBzcGVjdWxhckNvbG9yKTtcXG4gIC8vIEFkZCBJQkwgb24gdG9wIG9mIGNvbG9yXFxuICBjb2xvciArPSAoZGlmZnVzZUlCTCArIHNwZWN1bGFySUJMKSAqIHVFbnZNYXBJbnRlbnNpdHk7XFxuICAvLyBBZGQgSUJMIHNwZWMgdG8gYWxwaGEgZm9yIHJlZmxlY3Rpb25zIG9uIHRyYW5zcGFyZW50IHN1cmZhY2VzIChnbGFzcylcXG4gIGFscGhhID0gbWF4KGFscGhhLCBtYXgobWF4KHNwZWN1bGFySUJMLnIsIHNwZWN1bGFySUJMLmcpLCBzcGVjdWxhcklCTC5iKSk7XFxuICAjaWZkZWYgT0NDX01BUCAgXFxuICAgIC8vIFRPRE86IGZpZ3VyZSBvdXQgaG93IHRvIGFwcGx5IG9jY2x1c2lvblxcbiAgICAvLyBjb2xvciAqPSBTUkdCdG9MaW5lYXIodGV4dHVyZTJEKHRPY2NsdXNpb24sIHZVdikpLnJnYjtcXG4gICNlbmRpZlxcbiAgY29sb3IgKz0gdUVtaXNzaXZlO1xcbiAgI2lmZGVmIEVNSVNTSVZFX01BUCAgXFxuICAgIHZlYzMgZW1pc3NpdmUgPSBTUkdCdG9MaW5lYXIodGV4dHVyZTJEKHRFbWlzc2l2ZSwgdlV2KSkucmdiO1xcbiAgICBjb2xvciA9IGVtaXNzaXZlO1xcbiAgI2VuZGlmXFxuICAvLyBDb252ZXJ0IHRvIHNSR0IgdG8gZGlzcGxheVxcbiAgZ2xfRnJhZ0NvbG9yLnJnYiA9IGxpbmVhclRvU1JHQihjb2xvcik7XFxuICBcXG4gIC8vIEFwcGx5IHVBbHBoYSB1bmlmb3JtIGF0IHRoZSBlbmQgdG8gb3ZlcndyaXRlIGFueSBzcGVjdWxhciBhZGRpdGlvbnMgb24gdHJhbnNwYXJlbnQgc3VyZmFjZXNcXG4gIGdsX0ZyYWdDb2xvci5hID0gYWxwaGEgKiB1QWxwaGE7XFxufVwiOyIsImV4cG9ydCBkZWZhdWx0IFwicHJlY2lzaW9uIGhpZ2hwIGZsb2F0O1xcbnByZWNpc2lvbiBoaWdocCBpbnQ7XFxuYXR0cmlidXRlIHZlYzMgcG9zaXRpb247XFxuXFxuI2lmZGVmIFVWXFxuICAgIGF0dHJpYnV0ZSB2ZWMyIHV2O1xcbiNlbHNlXFxuICAgIGNvbnN0IHZlYzIgdXYgPSB2ZWMyKDApO1xcbiNlbmRpZlxcbmF0dHJpYnV0ZSB2ZWMzIG5vcm1hbDtcXG5cXG51bmlmb3JtIG1hdDQgbW9kZWxWaWV3TWF0cml4O1xcbnVuaWZvcm0gbWF0NCBwcm9qZWN0aW9uTWF0cml4O1xcbnVuaWZvcm0gbWF0NCBtb2RlbE1hdHJpeDtcXG51bmlmb3JtIG1hdDMgbm9ybWFsTWF0cml4O1xcblxcbnZhcnlpbmcgdmVjMiB2VXY7XFxudmFyeWluZyB2ZWMzIHZOb3JtYWw7XFxudmFyeWluZyB2ZWMzIHZNUG9zO1xcbnZhcnlpbmcgdmVjNCB2TVZQb3M7XFxuXFxudm9pZCBtYWluKCkge1xcbiAgICB2ZWM0IHBvcyA9IHZlYzQocG9zaXRpb24sIDEpO1xcbiAgICB2ZWMzIG5tbCA9IG5vcm1hbDtcXG4gICAgdlV2ID0gdXY7XFxuICAgIHZOb3JtYWwgPSBub3JtYWxpemUobm1sKTtcXG4gICAgdmVjNCBtUG9zID0gbW9kZWxNYXRyaXggKiBwb3M7XFxuICAgIHZNUG9zID0gbVBvcy54eXogLyBtUG9zLnc7XFxuICAgIHZNVlBvcyA9IG1vZGVsVmlld01hdHJpeCAqIHBvcztcXG4gICAgZ2xfUG9zaXRpb24gPSBwcm9qZWN0aW9uTWF0cml4ICogdk1WUG9zO1xcbn1cIjsiLCJpbXBvcnQgeyBUcmFuc2Zvcm0gfSBmcm9tICcuL1RyYW5zZm9ybS5qcyc7XG5pbXBvcnQgeyBNYXQ0IH0gZnJvbSAnLi4vbWF0aC9NYXQ0LmpzJztcbmltcG9ydCB7IFZlYzMgfSBmcm9tICcuLi9tYXRoL1ZlYzMuanMnO1xuXG5jb25zdCB0ZW1wTWF0NCA9IG5ldyBNYXQ0KCk7XG5jb25zdCB0ZW1wVmVjM2EgPSBuZXcgVmVjMygpO1xuY29uc3QgdGVtcFZlYzNiID0gbmV3IFZlYzMoKTtcblxuZXhwb3J0IGNsYXNzIENhbWVyYSBleHRlbmRzIFRyYW5zZm9ybSB7XG4gICAgY29uc3RydWN0b3IoZ2wsIHsgbmVhciA9IDAuMSwgZmFyID0gMTAwLCBmb3YgPSA0NSwgYXNwZWN0ID0gMSwgbGVmdCwgcmlnaHQsIGJvdHRvbSwgdG9wLCB6b29tID0gMSB9ID0ge30pIHtcbiAgICAgICAgc3VwZXIoKTtcblxuICAgICAgICBPYmplY3QuYXNzaWduKHRoaXMsIHsgbmVhciwgZmFyLCBmb3YsIGFzcGVjdCwgbGVmdCwgcmlnaHQsIGJvdHRvbSwgdG9wLCB6b29tIH0pO1xuXG4gICAgICAgIHRoaXMucHJvamVjdGlvbk1hdHJpeCA9IG5ldyBNYXQ0KCk7XG4gICAgICAgIHRoaXMudmlld01hdHJpeCA9IG5ldyBNYXQ0KCk7XG4gICAgICAgIHRoaXMucHJvamVjdGlvblZpZXdNYXRyaXggPSBuZXcgTWF0NCgpO1xuICAgICAgICB0aGlzLndvcmxkUG9zaXRpb24gPSBuZXcgVmVjMygpO1xuXG4gICAgICAgIC8vIFVzZSBvcnRob2dyYXBoaWMgaWYgbGVmdC9yaWdodCBzZXQsIGVsc2UgZGVmYXVsdCB0byBwZXJzcGVjdGl2ZSBjYW1lcmFcbiAgICAgICAgdGhpcy50eXBlID0gbGVmdCB8fCByaWdodCA/ICdvcnRob2dyYXBoaWMnIDogJ3BlcnNwZWN0aXZlJztcblxuICAgICAgICBpZiAodGhpcy50eXBlID09PSAnb3J0aG9ncmFwaGljJykgdGhpcy5vcnRob2dyYXBoaWMoKTtcbiAgICAgICAgZWxzZSB0aGlzLnBlcnNwZWN0aXZlKCk7XG4gICAgfVxuXG4gICAgc2V0Vmlld09mZnNldCh4LCB5LCB3aWR0aCwgaGVpZ2h0KSB7XG4gICAgICAgIGlmKCF0aGlzLnZpZXcpIHtcbiAgICAgICAgICAgIHRoaXMudmlldyA9IHtcbiAgICAgICAgICAgICAgICBvZmZzZXRYOiB4LFxuICAgICAgICAgICAgICAgIG9mZnNldFk6IHksXG4gICAgICAgICAgICAgICAgd2lkdGg6IHdpZHRoLFxuICAgICAgICAgICAgICAgIGhlaWdodDogaGVpZ2h0XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy52aWV3Lm9mZnNldFggPSB4O1xuICAgICAgICB0aGlzLnZpZXcub2Zmc2V0WSA9IHk7XG4gICAgICAgIHRoaXMudmlldy53aWR0aCA9IHdpZHRoO1xuICAgICAgICB0aGlzLnZpZXcuaGVpZ2h0ID0gaGVpZ2h0O1xuICAgICAgICBpZih0aGlzLnR5cGUgPT09ICdwZXJzcGVjdGl2ZScpIHtcbiAgICAgICAgICAgIHRoaXMucGVyc3BlY3RpdmUoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNsZWFyVmlld09mZnNldCgpIHtcbiAgICAgICAgdGhpcy52aWV3ID0gbnVsbDtcbiAgICAgICAgaWYodGhpcy50eXBlID09PSAncGVyc3BlY3RpdmUnKSB7XG4gICAgICAgICAgICB0aGlzLnBlcnNwZWN0aXZlKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwZXJzcGVjdGl2ZSh7IG5lYXIgPSB0aGlzLm5lYXIsIGZhciA9IHRoaXMuZmFyLCBmb3YgPSB0aGlzLmZvdiwgYXNwZWN0ID0gdGhpcy5hc3BlY3QgfSA9IHt9KSB7XG4gICAgICAgIE9iamVjdC5hc3NpZ24odGhpcywgeyBuZWFyLCBmYXIsIGZvdiwgYXNwZWN0IH0pO1xuICAgICAgICBsZXQgdG9wID0gbmVhciAqIE1hdGgudGFuKCBNYXRoLlBJLzE4MCAqIDAuNSAqIGZvdiApLFxuICAgICAgICBoZWlnaHQgPSAyICogdG9wLFxuICAgICAgICB3aWR0aCA9IGFzcGVjdCAqIGhlaWdodCxcbiAgICAgICAgbGVmdCA9IC0gMC41ICogd2lkdGg7XG4gICAgICAgIFxuICAgICAgICBpZih0aGlzLnZpZXcpIHtcbiAgICAgICAgICAgIGxlZnQgKz0gdGhpcy52aWV3Lm9mZnNldFggKiB3aWR0aCAvIHRoaXMudmlldy53aWR0aDtcblx0XHRcdHRvcCAtPSB0aGlzLnZpZXcub2Zmc2V0WSAqIGhlaWdodCAvIHRoaXMudmlldy5oZWlnaHQ7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IHJpZ2h0ID0gbGVmdCArIHdpZHRoO1xuICAgICAgICBsZXQgYm90dG9tID0gdG9wIC0gaGVpZ2h0O1xuXG4gICAgICAgIHRoaXMucHJvamVjdGlvbk1hdHJpeC5mcm9tUGVyc3BlY3RpdmVGcnVzdHJ1bSh7IGxlZnQsIHJpZ2h0LCB0b3AsIGJvdHRvbSwgbmVhciwgZmFyIH0pO1xuICAgICAgICB0aGlzLnR5cGUgPSAncGVyc3BlY3RpdmUnO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBvcnRob2dyYXBoaWMoe1xuICAgICAgICBuZWFyID0gdGhpcy5uZWFyLFxuICAgICAgICBmYXIgPSB0aGlzLmZhcixcbiAgICAgICAgbGVmdCA9IHRoaXMubGVmdCxcbiAgICAgICAgcmlnaHQgPSB0aGlzLnJpZ2h0LFxuICAgICAgICBib3R0b20gPSB0aGlzLmJvdHRvbSxcbiAgICAgICAgdG9wID0gdGhpcy50b3AsXG4gICAgICAgIHpvb20gPSB0aGlzLnpvb20sXG4gICAgfSA9IHt9KSB7XG4gICAgICAgIE9iamVjdC5hc3NpZ24odGhpcywgeyBuZWFyLCBmYXIsIGxlZnQsIHJpZ2h0LCBib3R0b20sIHRvcCwgem9vbSB9KTtcbiAgICAgICAgbGVmdCAvPSB6b29tO1xuICAgICAgICByaWdodCAvPSB6b29tO1xuICAgICAgICBib3R0b20gLz0gem9vbTtcbiAgICAgICAgdG9wIC89IHpvb207XG4gICAgICAgIHRoaXMucHJvamVjdGlvbk1hdHJpeC5mcm9tT3J0aG9nb25hbCh7IGxlZnQsIHJpZ2h0LCBib3R0b20sIHRvcCwgbmVhciwgZmFyIH0pO1xuICAgICAgICB0aGlzLnR5cGUgPSAnb3J0aG9ncmFwaGljJztcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgdXBkYXRlTWF0cml4V29ybGQoKSB7XG4gICAgICAgIHN1cGVyLnVwZGF0ZU1hdHJpeFdvcmxkKCk7XG4gICAgICAgIHRoaXMudmlld01hdHJpeC5pbnZlcnNlKHRoaXMud29ybGRNYXRyaXgpO1xuICAgICAgICB0aGlzLndvcmxkTWF0cml4LmdldFRyYW5zbGF0aW9uKHRoaXMud29ybGRQb3NpdGlvbik7XG5cbiAgICAgICAgLy8gdXNlZCBmb3Igc29ydGluZ1xuICAgICAgICB0aGlzLnByb2plY3Rpb25WaWV3TWF0cml4Lm11bHRpcGx5KHRoaXMucHJvamVjdGlvbk1hdHJpeCwgdGhpcy52aWV3TWF0cml4KTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgbG9va0F0KHRhcmdldCkge1xuICAgICAgICBzdXBlci5sb29rQXQodGFyZ2V0LCB0cnVlKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLy8gUHJvamVjdCAzRCBjb29yZGluYXRlIHRvIDJEIHBvaW50XG4gICAgcHJvamVjdCh2KSB7XG4gICAgICAgIHYuYXBwbHlNYXRyaXg0KHRoaXMudmlld01hdHJpeCk7XG4gICAgICAgIHYuYXBwbHlNYXRyaXg0KHRoaXMucHJvamVjdGlvbk1hdHJpeCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8vIFVucHJvamVjdCAyRCBwb2ludCB0byAzRCBjb29yZGluYXRlXG4gICAgdW5wcm9qZWN0KHYpIHtcbiAgICAgICAgdi5hcHBseU1hdHJpeDQodGVtcE1hdDQuaW52ZXJzZSh0aGlzLnByb2plY3Rpb25NYXRyaXgpKTtcbiAgICAgICAgdi5hcHBseU1hdHJpeDQodGhpcy53b3JsZE1hdHJpeCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHVwZGF0ZUZydXN0dW0oKSB7XG4gICAgICAgIGlmICghdGhpcy5mcnVzdHVtKSB7XG4gICAgICAgICAgICB0aGlzLmZydXN0dW0gPSBbbmV3IFZlYzMoKSwgbmV3IFZlYzMoKSwgbmV3IFZlYzMoKSwgbmV3IFZlYzMoKSwgbmV3IFZlYzMoKSwgbmV3IFZlYzMoKV07XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBtID0gdGhpcy5wcm9qZWN0aW9uVmlld01hdHJpeDtcbiAgICAgICAgdGhpcy5mcnVzdHVtWzBdLnNldChtWzNdIC0gbVswXSwgbVs3XSAtIG1bNF0sIG1bMTFdIC0gbVs4XSkuY29uc3RhbnQgPSBtWzE1XSAtIG1bMTJdOyAvLyAteFxuICAgICAgICB0aGlzLmZydXN0dW1bMV0uc2V0KG1bM10gKyBtWzBdLCBtWzddICsgbVs0XSwgbVsxMV0gKyBtWzhdKS5jb25zdGFudCA9IG1bMTVdICsgbVsxMl07IC8vICt4XG4gICAgICAgIHRoaXMuZnJ1c3R1bVsyXS5zZXQobVszXSArIG1bMV0sIG1bN10gKyBtWzVdLCBtWzExXSArIG1bOV0pLmNvbnN0YW50ID0gbVsxNV0gKyBtWzEzXTsgLy8gK3lcbiAgICAgICAgdGhpcy5mcnVzdHVtWzNdLnNldChtWzNdIC0gbVsxXSwgbVs3XSAtIG1bNV0sIG1bMTFdIC0gbVs5XSkuY29uc3RhbnQgPSBtWzE1XSAtIG1bMTNdOyAvLyAteVxuICAgICAgICB0aGlzLmZydXN0dW1bNF0uc2V0KG1bM10gLSBtWzJdLCBtWzddIC0gbVs2XSwgbVsxMV0gLSBtWzEwXSkuY29uc3RhbnQgPSBtWzE1XSAtIG1bMTRdOyAvLyAreiAoZmFyKVxuICAgICAgICB0aGlzLmZydXN0dW1bNV0uc2V0KG1bM10gKyBtWzJdLCBtWzddICsgbVs2XSwgbVsxMV0gKyBtWzEwXSkuY29uc3RhbnQgPSBtWzE1XSArIG1bMTRdOyAvLyAteiAobmVhcilcblxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDY7IGkrKykge1xuICAgICAgICAgICAgY29uc3QgaW52TGVuID0gMS4wIC8gdGhpcy5mcnVzdHVtW2ldLmRpc3RhbmNlKCk7XG4gICAgICAgICAgICB0aGlzLmZydXN0dW1baV0ubXVsdGlwbHkoaW52TGVuKTtcbiAgICAgICAgICAgIHRoaXMuZnJ1c3R1bVtpXS5jb25zdGFudCAqPSBpbnZMZW47XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmcnVzdHVtSW50ZXJzZWN0c01lc2gobm9kZSkge1xuICAgICAgICAvLyBJZiBubyBwb3NpdGlvbiBhdHRyaWJ1dGUsIHRyZWF0IGFzIGZydXN0dW1DdWxsZWQgZmFsc2VcbiAgICAgICAgaWYgKCFub2RlLmdlb21ldHJ5LmF0dHJpYnV0ZXMucG9zaXRpb24pIHJldHVybiB0cnVlO1xuXG4gICAgICAgIGlmICghbm9kZS5nZW9tZXRyeS5ib3VuZHMgfHwgbm9kZS5nZW9tZXRyeS5ib3VuZHMucmFkaXVzID09PSBJbmZpbml0eSkgbm9kZS5nZW9tZXRyeS5jb21wdXRlQm91bmRpbmdTcGhlcmUoKTtcblxuICAgICAgICBpZiAoIW5vZGUuZ2VvbWV0cnkuYm91bmRzKSByZXR1cm4gdHJ1ZTtcblxuICAgICAgICBjb25zdCBjZW50ZXIgPSB0ZW1wVmVjM2E7XG4gICAgICAgIGNlbnRlci5jb3B5KG5vZGUuZ2VvbWV0cnkuYm91bmRzLmNlbnRlcik7XG4gICAgICAgIGNlbnRlci5hcHBseU1hdHJpeDQobm9kZS53b3JsZE1hdHJpeCk7XG5cbiAgICAgICAgY29uc3QgcmFkaXVzID0gbm9kZS5nZW9tZXRyeS5ib3VuZHMucmFkaXVzICogbm9kZS53b3JsZE1hdHJpeC5nZXRNYXhTY2FsZU9uQXhpcygpO1xuXG4gICAgICAgIHJldHVybiB0aGlzLmZydXN0dW1JbnRlcnNlY3RzU3BoZXJlKGNlbnRlciwgcmFkaXVzKTtcbiAgICB9XG5cbiAgICBmcnVzdHVtSW50ZXJzZWN0c1NwaGVyZShjZW50ZXIsIHJhZGl1cykge1xuICAgICAgICBjb25zdCBub3JtYWwgPSB0ZW1wVmVjM2I7XG5cbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCA2OyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IHBsYW5lID0gdGhpcy5mcnVzdHVtW2ldO1xuICAgICAgICAgICAgY29uc3QgZGlzdGFuY2UgPSBub3JtYWwuY29weShwbGFuZSkuZG90KGNlbnRlcikgKyBwbGFuZS5jb25zdGFudDtcbiAgICAgICAgICAgIGlmIChkaXN0YW5jZSA8IC1yYWRpdXMpIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG59XG4iLCIvLyBhdHRyaWJ1dGUgcGFyYW1zXG4vLyB7XG4vLyAgICAgZGF0YSAtIHR5cGVkIGFycmF5IGVnIFVJbnQxNkFycmF5IGZvciBpbmRpY2VzLCBGbG9hdDMyQXJyYXlcbi8vICAgICBzaXplIC0gaW50IGRlZmF1bHQgMVxuLy8gICAgIGluc3RhbmNlZCAtIGRlZmF1bHQgbnVsbC4gUGFzcyBkaXZpc29yIGFtb3VudFxuLy8gICAgIHR5cGUgLSBnbCBlbnVtIGRlZmF1bHQgZ2wuVU5TSUdORURfU0hPUlQgZm9yICdpbmRleCcsIGdsLkZMT0FUIGZvciBvdGhlcnNcbi8vICAgICBub3JtYWxpemVkIC0gYm9vbGVhbiBkZWZhdWx0IGZhbHNlXG5cbi8vICAgICBidWZmZXIgLSBnbCBidWZmZXIsIGlmIGJ1ZmZlciBleGlzdHMsIGRvbid0IG5lZWQgdG8gcHJvdmlkZSBkYXRhXG4vLyAgICAgc3RyaWRlIC0gZGVmYXVsdCAwIC0gZm9yIHdoZW4gcGFzc2luZyBpbiBidWZmZXJcbi8vICAgICBvZmZzZXQgLSBkZWZhdWx0IDAgLSBmb3Igd2hlbiBwYXNzaW5nIGluIGJ1ZmZlclxuLy8gICAgIGNvdW50IC0gZGVmYXVsdCBudWxsIC0gZm9yIHdoZW4gcGFzc2luZyBpbiBidWZmZXJcbi8vICAgICBtaW4gLSBhcnJheSAtIGZvciB3aGVuIHBhc3NpbmcgaW4gYnVmZmVyXG4vLyAgICAgbWF4IC0gYXJyYXkgLSBmb3Igd2hlbiBwYXNzaW5nIGluIGJ1ZmZlclxuLy8gfVxuXG4vLyBUT0RPOiBmaXQgaW4gdHJhbnNmb3JtIGZlZWRiYWNrXG4vLyBUT0RPOiB3aGVuIHdvdWxkIEkgZGlzYWJsZVZlcnRleEF0dHJpYkFycmF5ID9cbi8vIFRPRE86IHVzZSBvZmZzZXQvc3RyaWRlIGlmIGV4aXN0c1xuXG5pbXBvcnQgeyBWZWMzIH0gZnJvbSAnLi4vbWF0aC9WZWMzLmpzJztcblxuY29uc3QgdGVtcFZlYzMgPSBuZXcgVmVjMygpO1xuXG5sZXQgSUQgPSAxO1xubGV0IEFUVFJfSUQgPSAxO1xuXG4vLyBUbyBzdG9wIGluaWZpbml0ZSB3YXJuaW5nc1xubGV0IGlzQm91bmRzV2FybmVkID0gZmFsc2U7XG5cbmV4cG9ydCBjbGFzcyBHZW9tZXRyeSB7XG4gICAgY29uc3RydWN0b3IoZ2wsIGF0dHJpYnV0ZXMgPSB7fSkge1xuICAgICAgICBpZiAoIWdsLmNhbnZhcykgY29uc29sZS5lcnJvcignZ2wgbm90IHBhc3NlZCBhcyBmaXJzdCBhcmd1bWVudCB0byBHZW9tZXRyeScpO1xuICAgICAgICB0aGlzLmdsID0gZ2w7XG4gICAgICAgIHRoaXMuYXR0cmlidXRlcyA9IGF0dHJpYnV0ZXM7XG4gICAgICAgIHRoaXMuaWQgPSBJRCsrO1xuXG4gICAgICAgIC8vIFN0b3JlIG9uZSBWQU8gcGVyIHByb2dyYW0gYXR0cmlidXRlIGxvY2F0aW9ucyBvcmRlclxuICAgICAgICB0aGlzLlZBT3MgPSB7fTtcblxuICAgICAgICB0aGlzLmRyYXdSYW5nZSA9IHsgc3RhcnQ6IDAsIGNvdW50OiAwIH07XG4gICAgICAgIHRoaXMuaW5zdGFuY2VkQ291bnQgPSAwO1xuXG4gICAgICAgIC8vIFVuYmluZCBjdXJyZW50IFZBTyBzbyB0aGF0IG5ldyBidWZmZXJzIGRvbid0IGdldCBhZGRlZCB0byBhY3RpdmUgbWVzaFxuICAgICAgICB0aGlzLmdsLnJlbmRlcmVyLmJpbmRWZXJ0ZXhBcnJheShudWxsKTtcbiAgICAgICAgdGhpcy5nbC5yZW5kZXJlci5jdXJyZW50R2VvbWV0cnkgPSBudWxsO1xuXG4gICAgICAgIC8vIEFsaWFzIGZvciBzdGF0ZSBzdG9yZSB0byBhdm9pZCByZWR1bmRhbnQgY2FsbHMgZm9yIGdsb2JhbCBzdGF0ZVxuICAgICAgICB0aGlzLmdsU3RhdGUgPSB0aGlzLmdsLnJlbmRlcmVyLnN0YXRlO1xuXG4gICAgICAgIC8vIGNyZWF0ZSB0aGUgYnVmZmVyc1xuICAgICAgICBmb3IgKGxldCBrZXkgaW4gYXR0cmlidXRlcykge1xuICAgICAgICAgICAgdGhpcy5hZGRBdHRyaWJ1dGUoa2V5LCBhdHRyaWJ1dGVzW2tleV0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgYWRkQXR0cmlidXRlKGtleSwgYXR0cikge1xuICAgICAgICB0aGlzLmF0dHJpYnV0ZXNba2V5XSA9IGF0dHI7XG5cbiAgICAgICAgLy8gU2V0IG9wdGlvbnNcbiAgICAgICAgYXR0ci5pZCA9IEFUVFJfSUQrKzsgLy8gVE9ETzogY3VycmVudGx5IHVudXNlZCwgcmVtb3ZlP1xuICAgICAgICBhdHRyLnNpemUgPSBhdHRyLnNpemUgfHwgMTtcbiAgICAgICAgYXR0ci50eXBlID1cbiAgICAgICAgICAgIGF0dHIudHlwZSB8fFxuICAgICAgICAgICAgKGF0dHIuZGF0YS5jb25zdHJ1Y3RvciA9PT0gRmxvYXQzMkFycmF5XG4gICAgICAgICAgICAgICAgPyB0aGlzLmdsLkZMT0FUXG4gICAgICAgICAgICAgICAgOiBhdHRyLmRhdGEuY29uc3RydWN0b3IgPT09IFVpbnQxNkFycmF5XG4gICAgICAgICAgICAgICAgPyB0aGlzLmdsLlVOU0lHTkVEX1NIT1JUXG4gICAgICAgICAgICAgICAgOiB0aGlzLmdsLlVOU0lHTkVEX0lOVCk7IC8vIFVpbnQzMkFycmF5XG4gICAgICAgIGF0dHIudGFyZ2V0ID0ga2V5ID09PSAnaW5kZXgnID8gdGhpcy5nbC5FTEVNRU5UX0FSUkFZX0JVRkZFUiA6IHRoaXMuZ2wuQVJSQVlfQlVGRkVSO1xuICAgICAgICBhdHRyLm5vcm1hbGl6ZWQgPSBhdHRyLm5vcm1hbGl6ZWQgfHwgZmFsc2U7XG4gICAgICAgIGF0dHIuc3RyaWRlID0gYXR0ci5zdHJpZGUgfHwgMDtcbiAgICAgICAgYXR0ci5vZmZzZXQgPSBhdHRyLm9mZnNldCB8fCAwO1xuICAgICAgICBhdHRyLmNvdW50ID0gYXR0ci5jb3VudCB8fCAoYXR0ci5zdHJpZGUgPyBhdHRyLmRhdGEuYnl0ZUxlbmd0aCAvIGF0dHIuc3RyaWRlIDogYXR0ci5kYXRhLmxlbmd0aCAvIGF0dHIuc2l6ZSk7XG4gICAgICAgIGF0dHIuZGl2aXNvciA9IGF0dHIuaW5zdGFuY2VkIHx8IDA7XG4gICAgICAgIGF0dHIubmVlZHNVcGRhdGUgPSBmYWxzZTtcblxuICAgICAgICBpZiAoIWF0dHIuYnVmZmVyKSB7XG4gICAgICAgICAgICBhdHRyLmJ1ZmZlciA9IHRoaXMuZ2wuY3JlYXRlQnVmZmVyKCk7XG5cbiAgICAgICAgICAgIC8vIFB1c2ggZGF0YSB0byBidWZmZXJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlQXR0cmlidXRlKGF0dHIpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gVXBkYXRlIGdlb21ldHJ5IGNvdW50cy4gSWYgaW5kZXhlZCwgaWdub3JlIHJlZ3VsYXIgYXR0cmlidXRlc1xuICAgICAgICBpZiAoYXR0ci5kaXZpc29yKSB7XG4gICAgICAgICAgICB0aGlzLmlzSW5zdGFuY2VkID0gdHJ1ZTtcbiAgICAgICAgICAgIGlmICh0aGlzLmluc3RhbmNlZENvdW50ICYmIHRoaXMuaW5zdGFuY2VkQ291bnQgIT09IGF0dHIuY291bnQgKiBhdHRyLmRpdmlzb3IpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ2dlb21ldHJ5IGhhcyBtdWx0aXBsZSBpbnN0YW5jZWQgYnVmZmVycyBvZiBkaWZmZXJlbnQgbGVuZ3RoJyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuICh0aGlzLmluc3RhbmNlZENvdW50ID0gTWF0aC5taW4odGhpcy5pbnN0YW5jZWRDb3VudCwgYXR0ci5jb3VudCAqIGF0dHIuZGl2aXNvcikpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5pbnN0YW5jZWRDb3VudCA9IGF0dHIuY291bnQgKiBhdHRyLmRpdmlzb3I7XG4gICAgICAgIH0gZWxzZSBpZiAoa2V5ID09PSAnaW5kZXgnKSB7XG4gICAgICAgICAgICB0aGlzLmRyYXdSYW5nZS5jb3VudCA9IGF0dHIuY291bnQ7XG4gICAgICAgIH0gZWxzZSBpZiAoIXRoaXMuYXR0cmlidXRlcy5pbmRleCkge1xuICAgICAgICAgICAgdGhpcy5kcmF3UmFuZ2UuY291bnQgPSBNYXRoLm1heCh0aGlzLmRyYXdSYW5nZS5jb3VudCwgYXR0ci5jb3VudCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB1cGRhdGVBdHRyaWJ1dGUoYXR0cikge1xuICAgICAgICBpZiAodGhpcy5nbFN0YXRlLmJvdW5kQnVmZmVyICE9PSBhdHRyLmJ1ZmZlcikge1xuICAgICAgICAgICAgdGhpcy5nbC5iaW5kQnVmZmVyKGF0dHIudGFyZ2V0LCBhdHRyLmJ1ZmZlcik7XG4gICAgICAgICAgICB0aGlzLmdsU3RhdGUuYm91bmRCdWZmZXIgPSBhdHRyLmJ1ZmZlcjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmdsLmJ1ZmZlckRhdGEoYXR0ci50YXJnZXQsIGF0dHIuZGF0YSwgdGhpcy5nbC5TVEFUSUNfRFJBVyk7XG4gICAgICAgIGF0dHIubmVlZHNVcGRhdGUgPSBmYWxzZTtcbiAgICB9XG5cbiAgICBzZXRJbmRleCh2YWx1ZSkge1xuICAgICAgICB0aGlzLmFkZEF0dHJpYnV0ZSgnaW5kZXgnLCB2YWx1ZSk7XG4gICAgfVxuXG4gICAgc2V0RHJhd1JhbmdlKHN0YXJ0LCBjb3VudCkge1xuICAgICAgICB0aGlzLmRyYXdSYW5nZS5zdGFydCA9IHN0YXJ0O1xuICAgICAgICB0aGlzLmRyYXdSYW5nZS5jb3VudCA9IGNvdW50O1xuICAgIH1cblxuICAgIHNldEluc3RhbmNlZENvdW50KHZhbHVlKSB7XG4gICAgICAgIHRoaXMuaW5zdGFuY2VkQ291bnQgPSB2YWx1ZTtcbiAgICB9XG5cbiAgICBjcmVhdGVWQU8ocHJvZ3JhbSkge1xuICAgICAgICB0aGlzLlZBT3NbcHJvZ3JhbS5hdHRyaWJ1dGVPcmRlcl0gPSB0aGlzLmdsLnJlbmRlcmVyLmNyZWF0ZVZlcnRleEFycmF5KCk7XG4gICAgICAgIHRoaXMuZ2wucmVuZGVyZXIuYmluZFZlcnRleEFycmF5KHRoaXMuVkFPc1twcm9ncmFtLmF0dHJpYnV0ZU9yZGVyXSk7XG4gICAgICAgIHRoaXMuYmluZEF0dHJpYnV0ZXMocHJvZ3JhbSk7XG4gICAgfVxuXG4gICAgYmluZEF0dHJpYnV0ZXMocHJvZ3JhbSkge1xuICAgICAgICAvLyBMaW5rIGFsbCBhdHRyaWJ1dGVzIHRvIHByb2dyYW0gdXNpbmcgZ2wudmVydGV4QXR0cmliUG9pbnRlclxuICAgICAgICBwcm9ncmFtLmF0dHJpYnV0ZUxvY2F0aW9ucy5mb3JFYWNoKChsb2NhdGlvbiwgeyBuYW1lLCB0eXBlIH0pID0+IHtcbiAgICAgICAgICAgIC8vIElmIGdlb21ldHJ5IG1pc3NpbmcgYSByZXF1aXJlZCBzaGFkZXIgYXR0cmlidXRlXG4gICAgICAgICAgICBpZiAoIXRoaXMuYXR0cmlidXRlc1tuYW1lXSkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihgYWN0aXZlIGF0dHJpYnV0ZSAke25hbWV9IG5vdCBiZWluZyBzdXBwbGllZGApO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3QgYXR0ciA9IHRoaXMuYXR0cmlidXRlc1tuYW1lXTtcblxuICAgICAgICAgICAgdGhpcy5nbC5iaW5kQnVmZmVyKGF0dHIudGFyZ2V0LCBhdHRyLmJ1ZmZlcik7XG4gICAgICAgICAgICB0aGlzLmdsU3RhdGUuYm91bmRCdWZmZXIgPSBhdHRyLmJ1ZmZlcjtcblxuICAgICAgICAgICAgLy8gRm9yIG1hdHJpeCBhdHRyaWJ1dGVzLCBidWZmZXIgbmVlZHMgdG8gYmUgZGVmaW5lZCBwZXIgY29sdW1uXG4gICAgICAgICAgICBsZXQgbnVtTG9jID0gMTtcbiAgICAgICAgICAgIGlmICh0eXBlID09PSAzNTY3NCkgbnVtTG9jID0gMjsgLy8gbWF0MlxuICAgICAgICAgICAgaWYgKHR5cGUgPT09IDM1Njc1KSBudW1Mb2MgPSAzOyAvLyBtYXQzXG4gICAgICAgICAgICBpZiAodHlwZSA9PT0gMzU2NzYpIG51bUxvYyA9IDQ7IC8vIG1hdDRcblxuICAgICAgICAgICAgY29uc3Qgc2l6ZSA9IGF0dHIuc2l6ZSAvIG51bUxvYztcbiAgICAgICAgICAgIGNvbnN0IHN0cmlkZSA9IG51bUxvYyA9PT0gMSA/IDAgOiBudW1Mb2MgKiBudW1Mb2MgKiBudW1Mb2M7XG4gICAgICAgICAgICBjb25zdCBvZmZzZXQgPSBudW1Mb2MgPT09IDEgPyAwIDogbnVtTG9jICogbnVtTG9jO1xuXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG51bUxvYzsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5nbC52ZXJ0ZXhBdHRyaWJQb2ludGVyKGxvY2F0aW9uICsgaSwgc2l6ZSwgYXR0ci50eXBlLCBhdHRyLm5vcm1hbGl6ZWQsIGF0dHIuc3RyaWRlICsgc3RyaWRlLCBhdHRyLm9mZnNldCArIGkgKiBvZmZzZXQpO1xuICAgICAgICAgICAgICAgIHRoaXMuZ2wuZW5hYmxlVmVydGV4QXR0cmliQXJyYXkobG9jYXRpb24gKyBpKTtcblxuICAgICAgICAgICAgICAgIC8vIEZvciBpbnN0YW5jZWQgYXR0cmlidXRlcywgZGl2aXNvciBuZWVkcyB0byBiZSBzZXQuXG4gICAgICAgICAgICAgICAgLy8gRm9yIGZpcmVmb3gsIG5lZWQgdG8gc2V0IGJhY2sgdG8gMCBpZiBub24taW5zdGFuY2VkIGRyYXduIGFmdGVyIGluc3RhbmNlZC4gRWxzZSB3b24ndCByZW5kZXJcbiAgICAgICAgICAgICAgICB0aGlzLmdsLnJlbmRlcmVyLnZlcnRleEF0dHJpYkRpdmlzb3IobG9jYXRpb24gKyBpLCBhdHRyLmRpdmlzb3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBCaW5kIGluZGljZXMgaWYgZ2VvbWV0cnkgaW5kZXhlZFxuICAgICAgICBpZiAodGhpcy5hdHRyaWJ1dGVzLmluZGV4KSB0aGlzLmdsLmJpbmRCdWZmZXIodGhpcy5nbC5FTEVNRU5UX0FSUkFZX0JVRkZFUiwgdGhpcy5hdHRyaWJ1dGVzLmluZGV4LmJ1ZmZlcik7XG4gICAgfVxuXG4gICAgZHJhdyh7IHByb2dyYW0sIG1vZGUgPSB0aGlzLmdsLlRSSUFOR0xFUyB9KSB7XG4gICAgICAgIGlmICh0aGlzLmdsLnJlbmRlcmVyLmN1cnJlbnRHZW9tZXRyeSAhPT0gYCR7dGhpcy5pZH1fJHtwcm9ncmFtLmF0dHJpYnV0ZU9yZGVyfWApIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5WQU9zW3Byb2dyYW0uYXR0cmlidXRlT3JkZXJdKSB0aGlzLmNyZWF0ZVZBTyhwcm9ncmFtKTtcbiAgICAgICAgICAgIHRoaXMuZ2wucmVuZGVyZXIuYmluZFZlcnRleEFycmF5KHRoaXMuVkFPc1twcm9ncmFtLmF0dHJpYnV0ZU9yZGVyXSk7XG4gICAgICAgICAgICB0aGlzLmdsLnJlbmRlcmVyLmN1cnJlbnRHZW9tZXRyeSA9IGAke3RoaXMuaWR9XyR7cHJvZ3JhbS5hdHRyaWJ1dGVPcmRlcn1gO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ2hlY2sgaWYgYW55IGF0dHJpYnV0ZXMgbmVlZCB1cGRhdGluZ1xuICAgICAgICBwcm9ncmFtLmF0dHJpYnV0ZUxvY2F0aW9ucy5mb3JFYWNoKChsb2NhdGlvbiwgeyBuYW1lIH0pID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGF0dHIgPSB0aGlzLmF0dHJpYnV0ZXNbbmFtZV07XG4gICAgICAgICAgICBpZiAoYXR0ci5uZWVkc1VwZGF0ZSkgdGhpcy51cGRhdGVBdHRyaWJ1dGUoYXR0cik7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmICh0aGlzLmlzSW5zdGFuY2VkKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5hdHRyaWJ1dGVzLmluZGV4KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5nbC5yZW5kZXJlci5kcmF3RWxlbWVudHNJbnN0YW5jZWQoXG4gICAgICAgICAgICAgICAgICAgIG1vZGUsXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhd1JhbmdlLmNvdW50LFxuICAgICAgICAgICAgICAgICAgICB0aGlzLmF0dHJpYnV0ZXMuaW5kZXgudHlwZSxcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hdHRyaWJ1dGVzLmluZGV4Lm9mZnNldCArIHRoaXMuZHJhd1JhbmdlLnN0YXJ0ICogMixcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbnN0YW5jZWRDb3VudFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuZ2wucmVuZGVyZXIuZHJhd0FycmF5c0luc3RhbmNlZChtb2RlLCB0aGlzLmRyYXdSYW5nZS5zdGFydCwgdGhpcy5kcmF3UmFuZ2UuY291bnQsIHRoaXMuaW5zdGFuY2VkQ291bnQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKHRoaXMuYXR0cmlidXRlcy5pbmRleCkge1xuICAgICAgICAgICAgICAgIHRoaXMuZ2wuZHJhd0VsZW1lbnRzKG1vZGUsIHRoaXMuZHJhd1JhbmdlLmNvdW50LCB0aGlzLmF0dHJpYnV0ZXMuaW5kZXgudHlwZSwgdGhpcy5hdHRyaWJ1dGVzLmluZGV4Lm9mZnNldCArIHRoaXMuZHJhd1JhbmdlLnN0YXJ0ICogMik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuZ2wuZHJhd0FycmF5cyhtb2RlLCB0aGlzLmRyYXdSYW5nZS5zdGFydCwgdGhpcy5kcmF3UmFuZ2UuY291bnQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgZ2V0UG9zaXRpb25BcnJheSgpIHtcbiAgICAgICAgLy8gVXNlIHBvc2l0aW9uIGJ1ZmZlciwgb3IgbWluL21heCBpZiBhdmFpbGFibGVcbiAgICAgICAgY29uc3QgYXR0ciA9IHRoaXMuYXR0cmlidXRlcy5wb3NpdGlvbjtcbiAgICAgICAgLy8gaWYgKGF0dHIubWluKSByZXR1cm4gWy4uLmF0dHIubWluLCAuLi5hdHRyLm1heF07XG4gICAgICAgIGlmIChhdHRyLmRhdGEpIHJldHVybiBhdHRyLmRhdGE7XG4gICAgICAgIGlmIChpc0JvdW5kc1dhcm5lZCkgcmV0dXJuO1xuICAgICAgICBjb25zb2xlLndhcm4oJ05vIHBvc2l0aW9uIGJ1ZmZlciBkYXRhIGZvdW5kIHRvIGNvbXB1dGUgYm91bmRzJyk7XG4gICAgICAgIHJldHVybiAoaXNCb3VuZHNXYXJuZWQgPSB0cnVlKTtcbiAgICB9XG5cbiAgICBjb21wdXRlQm91bmRpbmdCb3goYXJyYXkpIHtcbiAgICAgICAgaWYgKCFhcnJheSkgYXJyYXkgPSB0aGlzLmdldFBvc2l0aW9uQXJyYXkoKTtcblxuICAgICAgICBpZiAoIXRoaXMuYm91bmRzKSB7XG4gICAgICAgICAgICB0aGlzLmJvdW5kcyA9IHtcbiAgICAgICAgICAgICAgICBtaW46IG5ldyBWZWMzKCksXG4gICAgICAgICAgICAgICAgbWF4OiBuZXcgVmVjMygpLFxuICAgICAgICAgICAgICAgIGNlbnRlcjogbmV3IFZlYzMoKSxcbiAgICAgICAgICAgICAgICBzY2FsZTogbmV3IFZlYzMoKSxcbiAgICAgICAgICAgICAgICByYWRpdXM6IEluZmluaXR5LFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IG1pbiA9IHRoaXMuYm91bmRzLm1pbjtcbiAgICAgICAgY29uc3QgbWF4ID0gdGhpcy5ib3VuZHMubWF4O1xuICAgICAgICBjb25zdCBjZW50ZXIgPSB0aGlzLmJvdW5kcy5jZW50ZXI7XG4gICAgICAgIGNvbnN0IHNjYWxlID0gdGhpcy5ib3VuZHMuc2NhbGU7XG5cbiAgICAgICAgbWluLnNldCgrSW5maW5pdHkpO1xuICAgICAgICBtYXguc2V0KC1JbmZpbml0eSk7XG5cbiAgICAgICAgLy8gVE9ETzogdXNlIG9mZnNldC9zdHJpZGUgaWYgZXhpc3RzXG4gICAgICAgIC8vIFRPRE86IGNoZWNrIHNpemUgb2YgcG9zaXRpb24gKGVnIHRyaWFuZ2xlIHdpdGggVmVjMilcbiAgICAgICAgZm9yIChsZXQgaSA9IDAsIGwgPSBhcnJheS5sZW5ndGg7IGkgPCBsOyBpICs9IDMpIHtcbiAgICAgICAgICAgIGNvbnN0IHggPSBhcnJheVtpXTtcbiAgICAgICAgICAgIGNvbnN0IHkgPSBhcnJheVtpICsgMV07XG4gICAgICAgICAgICBjb25zdCB6ID0gYXJyYXlbaSArIDJdO1xuXG4gICAgICAgICAgICBtaW4ueCA9IE1hdGgubWluKHgsIG1pbi54KTtcbiAgICAgICAgICAgIG1pbi55ID0gTWF0aC5taW4oeSwgbWluLnkpO1xuICAgICAgICAgICAgbWluLnogPSBNYXRoLm1pbih6LCBtaW4ueik7XG5cbiAgICAgICAgICAgIG1heC54ID0gTWF0aC5tYXgoeCwgbWF4LngpO1xuICAgICAgICAgICAgbWF4LnkgPSBNYXRoLm1heCh5LCBtYXgueSk7XG4gICAgICAgICAgICBtYXgueiA9IE1hdGgubWF4KHosIG1heC56KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHNjYWxlLnN1YihtYXgsIG1pbik7XG4gICAgICAgIGNlbnRlci5hZGQobWluLCBtYXgpLmRpdmlkZSgyKTtcbiAgICB9XG5cbiAgICBjb21wdXRlQm91bmRpbmdTcGhlcmUoYXJyYXkpIHtcbiAgICAgICAgaWYgKCFhcnJheSkgYXJyYXkgPSB0aGlzLmdldFBvc2l0aW9uQXJyYXkoKTtcbiAgICAgICAgaWYgKCF0aGlzLmJvdW5kcykgdGhpcy5jb21wdXRlQm91bmRpbmdCb3goYXJyYXkpO1xuXG4gICAgICAgIGxldCBtYXhSYWRpdXNTcSA9IDA7XG4gICAgICAgIGZvciAobGV0IGkgPSAwLCBsID0gYXJyYXkubGVuZ3RoOyBpIDwgbDsgaSArPSAzKSB7XG4gICAgICAgICAgICB0ZW1wVmVjMy5mcm9tQXJyYXkoYXJyYXksIGkpO1xuICAgICAgICAgICAgbWF4UmFkaXVzU3EgPSBNYXRoLm1heChtYXhSYWRpdXNTcSwgdGhpcy5ib3VuZHMuY2VudGVyLnNxdWFyZWREaXN0YW5jZSh0ZW1wVmVjMykpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5ib3VuZHMucmFkaXVzID0gTWF0aC5zcXJ0KG1heFJhZGl1c1NxKTtcbiAgICB9XG5cbiAgICByZW1vdmUoKSB7XG4gICAgICAgIGlmICh0aGlzLnZhbykgdGhpcy5nbC5yZW5kZXJlci5kZWxldGVWZXJ0ZXhBcnJheSh0aGlzLnZhbyk7XG4gICAgICAgIGZvciAobGV0IGtleSBpbiB0aGlzLmF0dHJpYnV0ZXMpIHtcbiAgICAgICAgICAgIHRoaXMuZ2wuZGVsZXRlQnVmZmVyKHRoaXMuYXR0cmlidXRlc1trZXldLmJ1ZmZlcik7XG4gICAgICAgICAgICBkZWxldGUgdGhpcy5hdHRyaWJ1dGVzW2tleV07XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCJpbXBvcnQgeyBUcmFuc2Zvcm0gfSBmcm9tICcuL1RyYW5zZm9ybS5qcyc7XG5pbXBvcnQgeyBNYXQzIH0gZnJvbSAnLi4vbWF0aC9NYXQzLmpzJztcbmltcG9ydCB7IE1hdDQgfSBmcm9tICcuLi9tYXRoL01hdDQuanMnO1xuXG5sZXQgSUQgPSAwO1xuXG5leHBvcnQgY2xhc3MgTWVzaCBleHRlbmRzIFRyYW5zZm9ybSB7XG4gICAgY29uc3RydWN0b3IoZ2wsIHsgZ2VvbWV0cnksIHByb2dyYW0sIG1vZGUgPSBnbC5UUklBTkdMRVMsIGZydXN0dW1DdWxsZWQgPSB0cnVlLCByZW5kZXJPcmRlciA9IDAgfSA9IHt9KSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIGlmICghZ2wuY2FudmFzKSBjb25zb2xlLmVycm9yKCdnbCBub3QgcGFzc2VkIGFzIGZpcnN0IGFyZ3VtZW50IHRvIE1lc2gnKTtcbiAgICAgICAgdGhpcy5nbCA9IGdsO1xuICAgICAgICB0aGlzLmlkID0gSUQrKztcbiAgICAgICAgdGhpcy5nZW9tZXRyeSA9IGdlb21ldHJ5O1xuICAgICAgICB0aGlzLnByb2dyYW0gPSBwcm9ncmFtO1xuICAgICAgICB0aGlzLm1vZGUgPSBtb2RlO1xuXG4gICAgICAgIC8vIFVzZWQgdG8gc2tpcCBmcnVzdHVtIGN1bGxpbmdcbiAgICAgICAgdGhpcy5mcnVzdHVtQ3VsbGVkID0gZnJ1c3R1bUN1bGxlZDtcblxuICAgICAgICAvLyBPdmVycmlkZSBzb3J0aW5nIHRvIGZvcmNlIGFuIG9yZGVyXG4gICAgICAgIHRoaXMucmVuZGVyT3JkZXIgPSByZW5kZXJPcmRlcjtcbiAgICAgICAgdGhpcy5tb2RlbFZpZXdNYXRyaXggPSBuZXcgTWF0NCgpO1xuICAgICAgICB0aGlzLm5vcm1hbE1hdHJpeCA9IG5ldyBNYXQzKCk7XG4gICAgICAgIHRoaXMuYmVmb3JlUmVuZGVyQ2FsbGJhY2tzID0gW107XG4gICAgICAgIHRoaXMuYWZ0ZXJSZW5kZXJDYWxsYmFja3MgPSBbXTtcbiAgICB9XG5cbiAgICBvbkJlZm9yZVJlbmRlcihmKSB7XG4gICAgICAgIHRoaXMuYmVmb3JlUmVuZGVyQ2FsbGJhY2tzLnB1c2goZik7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIG9uQWZ0ZXJSZW5kZXIoZikge1xuICAgICAgICB0aGlzLmFmdGVyUmVuZGVyQ2FsbGJhY2tzLnB1c2goZik7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGRyYXcoeyBjYW1lcmEsIG92ZXJyaWRlUHJvZ3JhbSB9ID0ge30pIHtcbiAgICAgICAgdGhpcy5iZWZvcmVSZW5kZXJDYWxsYmFja3MuZm9yRWFjaCgoZikgPT4gZiAmJiBmKHsgbWVzaDogdGhpcywgY2FtZXJhIH0pKTtcbiAgICAgICAgY29uc3QgdXNlZFByb2dyYW0gPSBvdmVycmlkZVByb2dyYW0gfHwgdGhpcy5wcm9ncmFtO1xuICAgICAgICBpZiAoY2FtZXJhKSB7XG4gICAgICAgICAgICAvLyBBZGQgZW1wdHkgbWF0cml4IHVuaWZvcm1zIHRvIHByb2dyYW0gaWYgdW5zZXRcbiAgICAgICAgICAgIGlmICghdXNlZFByb2dyYW0udW5pZm9ybXMubW9kZWxNYXRyaXgpIHtcbiAgICAgICAgICAgICAgICBPYmplY3QuYXNzaWduKHVzZWRQcm9ncmFtLnVuaWZvcm1zLCB7XG4gICAgICAgICAgICAgICAgICAgIG1vZGVsTWF0cml4OiB7IHZhbHVlOiBudWxsIH0sXG4gICAgICAgICAgICAgICAgICAgIHZpZXdNYXRyaXg6IHsgdmFsdWU6IG51bGwgfSxcbiAgICAgICAgICAgICAgICAgICAgbW9kZWxWaWV3TWF0cml4OiB7IHZhbHVlOiBudWxsIH0sXG4gICAgICAgICAgICAgICAgICAgIG5vcm1hbE1hdHJpeDogeyB2YWx1ZTogbnVsbCB9LFxuICAgICAgICAgICAgICAgICAgICBwcm9qZWN0aW9uTWF0cml4OiB7IHZhbHVlOiBudWxsIH0sXG4gICAgICAgICAgICAgICAgICAgIGNhbWVyYVBvc2l0aW9uOiB7IHZhbHVlOiBudWxsIH0sXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFNldCB0aGUgbWF0cml4IHVuaWZvcm1zXG4gICAgICAgICAgICB1c2VkUHJvZ3JhbS51bmlmb3Jtcy5wcm9qZWN0aW9uTWF0cml4LnZhbHVlID0gY2FtZXJhLnByb2plY3Rpb25NYXRyaXg7XG4gICAgICAgICAgICB1c2VkUHJvZ3JhbS51bmlmb3Jtcy5jYW1lcmFQb3NpdGlvbi52YWx1ZSA9IGNhbWVyYS53b3JsZFBvc2l0aW9uO1xuICAgICAgICAgICAgdXNlZFByb2dyYW0udW5pZm9ybXMudmlld01hdHJpeC52YWx1ZSA9IGNhbWVyYS52aWV3TWF0cml4O1xuICAgICAgICAgICAgdGhpcy5tb2RlbFZpZXdNYXRyaXgubXVsdGlwbHkoY2FtZXJhLnZpZXdNYXRyaXgsIHRoaXMud29ybGRNYXRyaXgpO1xuICAgICAgICAgICAgdGhpcy5ub3JtYWxNYXRyaXguZ2V0Tm9ybWFsTWF0cml4KHRoaXMubW9kZWxWaWV3TWF0cml4KTtcbiAgICAgICAgICAgIHVzZWRQcm9ncmFtLnVuaWZvcm1zLm1vZGVsTWF0cml4LnZhbHVlID0gdGhpcy53b3JsZE1hdHJpeDtcbiAgICAgICAgICAgIHVzZWRQcm9ncmFtLnVuaWZvcm1zLm1vZGVsVmlld01hdHJpeC52YWx1ZSA9IHRoaXMubW9kZWxWaWV3TWF0cml4O1xuICAgICAgICAgICAgdXNlZFByb2dyYW0udW5pZm9ybXMubm9ybWFsTWF0cml4LnZhbHVlID0gdGhpcy5ub3JtYWxNYXRyaXg7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBkZXRlcm1pbmUgaWYgZmFjZXMgbmVlZCB0byBiZSBmbGlwcGVkIC0gd2hlbiBtZXNoIHNjYWxlZCBuZWdhdGl2ZWx5XG4gICAgICAgIGxldCBmbGlwRmFjZXMgPSB1c2VkUHJvZ3JhbS5jdWxsRmFjZSAmJiB0aGlzLndvcmxkTWF0cml4LmRldGVybWluYW50KCkgPCAwO1xuICAgICAgICB1c2VkUHJvZ3JhbS51c2UoeyBmbGlwRmFjZXMgfSk7XG4gICAgICAgIHRoaXMuZ2VvbWV0cnkuZHJhdyh7IG1vZGU6IHRoaXMubW9kZSwgcHJvZ3JhbTogdXNlZFByb2dyYW0gfSk7XG4gICAgICAgIHRoaXMuYWZ0ZXJSZW5kZXJDYWxsYmFja3MuZm9yRWFjaCgoZikgPT4gZiAmJiBmKHsgbWVzaDogdGhpcywgY2FtZXJhIH0pKTtcbiAgICB9XG59XG4iLCIvLyBUT0RPOiB1cGxvYWQgZW1wdHkgdGV4dHVyZSBpZiBudWxsID8gbWF5YmUgbm90XG4vLyBUT0RPOiB1cGxvYWQgaWRlbnRpdHkgbWF0cml4IGlmIG51bGwgP1xuLy8gVE9ETzogc2FtcGxlciBDdWJlXG5cbmxldCBJRCA9IDE7XG5cbi8vIGNhY2hlIG9mIHR5cGVkIGFycmF5cyB1c2VkIHRvIGZsYXR0ZW4gdW5pZm9ybSBhcnJheXNcbmNvbnN0IGFycmF5Q2FjaGVGMzIgPSB7fTtcblxuZXhwb3J0IGNsYXNzIFByb2dyYW0ge1xuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICBnbCxcbiAgICAgICAge1xuICAgICAgICAgICAgdmVydGV4LFxuICAgICAgICAgICAgZnJhZ21lbnQsXG4gICAgICAgICAgICB1bmlmb3JtcyA9IHt9LFxuXG4gICAgICAgICAgICB0cmFuc3BhcmVudCA9IGZhbHNlLFxuICAgICAgICAgICAgY3VsbEZhY2UgPSBnbC5CQUNLLFxuICAgICAgICAgICAgZnJvbnRGYWNlID0gZ2wuQ0NXLFxuICAgICAgICAgICAgZGVwdGhUZXN0ID0gdHJ1ZSxcbiAgICAgICAgICAgIGRlcHRoV3JpdGUgPSB0cnVlLFxuICAgICAgICAgICAgZGVwdGhGdW5jID0gZ2wuTEVTUyxcbiAgICAgICAgfSA9IHt9XG4gICAgKSB7XG4gICAgICAgIGlmICghZ2wuY2FudmFzKSBjb25zb2xlLmVycm9yKCdnbCBub3QgcGFzc2VkIGFzIGZpc3QgYXJndW1lbnQgdG8gUHJvZ3JhbScpO1xuICAgICAgICB0aGlzLmdsID0gZ2w7XG4gICAgICAgIHRoaXMudW5pZm9ybXMgPSB1bmlmb3JtcztcbiAgICAgICAgdGhpcy5pZCA9IElEKys7XG5cbiAgICAgICAgaWYgKCF2ZXJ0ZXgpIGNvbnNvbGUud2FybigndmVydGV4IHNoYWRlciBub3Qgc3VwcGxpZWQnKTtcbiAgICAgICAgaWYgKCFmcmFnbWVudCkgY29uc29sZS53YXJuKCdmcmFnbWVudCBzaGFkZXIgbm90IHN1cHBsaWVkJyk7XG5cbiAgICAgICAgLy8gU3RvcmUgcHJvZ3JhbSBzdGF0ZVxuICAgICAgICB0aGlzLnRyYW5zcGFyZW50ID0gdHJhbnNwYXJlbnQ7XG4gICAgICAgIHRoaXMuY3VsbEZhY2UgPSBjdWxsRmFjZTtcbiAgICAgICAgdGhpcy5mcm9udEZhY2UgPSBmcm9udEZhY2U7XG4gICAgICAgIHRoaXMuZGVwdGhUZXN0ID0gZGVwdGhUZXN0O1xuICAgICAgICB0aGlzLmRlcHRoV3JpdGUgPSBkZXB0aFdyaXRlO1xuICAgICAgICB0aGlzLmRlcHRoRnVuYyA9IGRlcHRoRnVuYztcbiAgICAgICAgdGhpcy5ibGVuZEZ1bmMgPSB7fTtcbiAgICAgICAgdGhpcy5ibGVuZEVxdWF0aW9uID0ge307XG4gICAgICAgIHRoaXMudW5pZm9ybUxvY2F0aW9ucyA9IG5ldyBNYXAoKTtcblxuICAgICAgICAvLyBzZXQgZGVmYXVsdCBibGVuZEZ1bmMgaWYgdHJhbnNwYXJlbnQgZmxhZ2dlZFxuICAgICAgICBpZiAodGhpcy50cmFuc3BhcmVudCAmJiAhdGhpcy5ibGVuZEZ1bmMuc3JjKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5nbC5yZW5kZXJlci5wcmVtdWx0aXBsaWVkQWxwaGEpIHRoaXMuc2V0QmxlbmRGdW5jKHRoaXMuZ2wuT05FLCB0aGlzLmdsLk9ORV9NSU5VU19TUkNfQUxQSEEpO1xuICAgICAgICAgICAgZWxzZSB0aGlzLnNldEJsZW5kRnVuYyh0aGlzLmdsLlNSQ19BTFBIQSwgdGhpcy5nbC5PTkVfTUlOVVNfU1JDX0FMUEhBKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGNvbXBpbGUgdmVydGV4IHNoYWRlciBhbmQgbG9nIGVycm9yc1xuICAgICAgICBjb25zdCB2ZXJ0ZXhTaGFkZXIgPSBnbC5jcmVhdGVTaGFkZXIoZ2wuVkVSVEVYX1NIQURFUik7XG4gICAgICAgIGdsLnNoYWRlclNvdXJjZSh2ZXJ0ZXhTaGFkZXIsIHZlcnRleCk7XG4gICAgICAgIGdsLmNvbXBpbGVTaGFkZXIodmVydGV4U2hhZGVyKTtcbiAgICAgICAgaWYgKGdsLmdldFNoYWRlckluZm9Mb2codmVydGV4U2hhZGVyKSAhPT0gJycpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgJHtnbC5nZXRTaGFkZXJJbmZvTG9nKHZlcnRleFNoYWRlcil9XFxuVmVydGV4IFNoYWRlclxcbiR7YWRkTGluZU51bWJlcnModmVydGV4KX1gKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGNvbXBpbGUgZnJhZ21lbnQgc2hhZGVyIGFuZCBsb2cgZXJyb3JzXG4gICAgICAgIGNvbnN0IGZyYWdtZW50U2hhZGVyID0gZ2wuY3JlYXRlU2hhZGVyKGdsLkZSQUdNRU5UX1NIQURFUik7XG4gICAgICAgIGdsLnNoYWRlclNvdXJjZShmcmFnbWVudFNoYWRlciwgZnJhZ21lbnQpO1xuICAgICAgICBnbC5jb21waWxlU2hhZGVyKGZyYWdtZW50U2hhZGVyKTtcbiAgICAgICAgaWYgKGdsLmdldFNoYWRlckluZm9Mb2coZnJhZ21lbnRTaGFkZXIpICE9PSAnJykge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGAke2dsLmdldFNoYWRlckluZm9Mb2coZnJhZ21lbnRTaGFkZXIpfVxcbkZyYWdtZW50IFNoYWRlclxcbiR7YWRkTGluZU51bWJlcnMoZnJhZ21lbnQpfWApO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gY29tcGlsZSBwcm9ncmFtIGFuZCBsb2cgZXJyb3JzXG4gICAgICAgIHRoaXMucHJvZ3JhbSA9IGdsLmNyZWF0ZVByb2dyYW0oKTtcbiAgICAgICAgZ2wuYXR0YWNoU2hhZGVyKHRoaXMucHJvZ3JhbSwgdmVydGV4U2hhZGVyKTtcbiAgICAgICAgZ2wuYXR0YWNoU2hhZGVyKHRoaXMucHJvZ3JhbSwgZnJhZ21lbnRTaGFkZXIpO1xuICAgICAgICBnbC5saW5rUHJvZ3JhbSh0aGlzLnByb2dyYW0pO1xuICAgICAgICBpZiAoIWdsLmdldFByb2dyYW1QYXJhbWV0ZXIodGhpcy5wcm9ncmFtLCBnbC5MSU5LX1NUQVRVUykpIHtcbiAgICAgICAgICAgIHJldHVybiBjb25zb2xlLndhcm4oZ2wuZ2V0UHJvZ3JhbUluZm9Mb2codGhpcy5wcm9ncmFtKSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBSZW1vdmUgc2hhZGVyIG9uY2UgbGlua2VkXG4gICAgICAgIGdsLmRlbGV0ZVNoYWRlcih2ZXJ0ZXhTaGFkZXIpO1xuICAgICAgICBnbC5kZWxldGVTaGFkZXIoZnJhZ21lbnRTaGFkZXIpO1xuXG4gICAgICAgIC8vIEdldCBhY3RpdmUgdW5pZm9ybSBsb2NhdGlvbnNcbiAgICAgICAgbGV0IG51bVVuaWZvcm1zID0gZ2wuZ2V0UHJvZ3JhbVBhcmFtZXRlcih0aGlzLnByb2dyYW0sIGdsLkFDVElWRV9VTklGT1JNUyk7XG4gICAgICAgIGZvciAobGV0IHVJbmRleCA9IDA7IHVJbmRleCA8IG51bVVuaWZvcm1zOyB1SW5kZXgrKykge1xuICAgICAgICAgICAgbGV0IHVuaWZvcm0gPSBnbC5nZXRBY3RpdmVVbmlmb3JtKHRoaXMucHJvZ3JhbSwgdUluZGV4KTtcbiAgICAgICAgICAgIHRoaXMudW5pZm9ybUxvY2F0aW9ucy5zZXQodW5pZm9ybSwgZ2wuZ2V0VW5pZm9ybUxvY2F0aW9uKHRoaXMucHJvZ3JhbSwgdW5pZm9ybS5uYW1lKSk7XG5cbiAgICAgICAgICAgIC8vIHNwbGl0IHVuaWZvcm1zJyBuYW1lcyB0byBzZXBhcmF0ZSBhcnJheSBhbmQgc3RydWN0IGRlY2xhcmF0aW9uc1xuICAgICAgICAgICAgY29uc3Qgc3BsaXQgPSB1bmlmb3JtLm5hbWUubWF0Y2goLyhcXHcrKS9nKTtcblxuICAgICAgICAgICAgdW5pZm9ybS51bmlmb3JtTmFtZSA9IHNwbGl0WzBdO1xuXG4gICAgICAgICAgICBpZiAoc3BsaXQubGVuZ3RoID09PSAzKSB7XG4gICAgICAgICAgICAgICAgdW5pZm9ybS5pc1N0cnVjdEFycmF5ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB1bmlmb3JtLnN0cnVjdEluZGV4ID0gTnVtYmVyKHNwbGl0WzFdKTtcbiAgICAgICAgICAgICAgICB1bmlmb3JtLnN0cnVjdFByb3BlcnR5ID0gc3BsaXRbMl07XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHNwbGl0Lmxlbmd0aCA9PT0gMiAmJiBpc05hTihOdW1iZXIoc3BsaXRbMV0pKSkge1xuICAgICAgICAgICAgICAgIHVuaWZvcm0uaXNTdHJ1Y3QgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHVuaWZvcm0uc3RydWN0UHJvcGVydHkgPSBzcGxpdFsxXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEdldCBhY3RpdmUgYXR0cmlidXRlIGxvY2F0aW9uc1xuICAgICAgICB0aGlzLmF0dHJpYnV0ZUxvY2F0aW9ucyA9IG5ldyBNYXAoKTtcbiAgICAgICAgY29uc3QgbG9jYXRpb25zID0gW107XG4gICAgICAgIGNvbnN0IG51bUF0dHJpYnMgPSBnbC5nZXRQcm9ncmFtUGFyYW1ldGVyKHRoaXMucHJvZ3JhbSwgZ2wuQUNUSVZFX0FUVFJJQlVURVMpO1xuICAgICAgICBmb3IgKGxldCBhSW5kZXggPSAwOyBhSW5kZXggPCBudW1BdHRyaWJzOyBhSW5kZXgrKykge1xuICAgICAgICAgICAgY29uc3QgYXR0cmlidXRlID0gZ2wuZ2V0QWN0aXZlQXR0cmliKHRoaXMucHJvZ3JhbSwgYUluZGV4KTtcbiAgICAgICAgICAgIGNvbnN0IGxvY2F0aW9uID0gZ2wuZ2V0QXR0cmliTG9jYXRpb24odGhpcy5wcm9ncmFtLCBhdHRyaWJ1dGUubmFtZSk7XG4gICAgICAgICAgICBsb2NhdGlvbnNbbG9jYXRpb25dID0gYXR0cmlidXRlLm5hbWU7XG4gICAgICAgICAgICB0aGlzLmF0dHJpYnV0ZUxvY2F0aW9ucy5zZXQoYXR0cmlidXRlLCBsb2NhdGlvbik7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5hdHRyaWJ1dGVPcmRlciA9IGxvY2F0aW9ucy5qb2luKCcnKTtcbiAgICB9XG5cbiAgICBzZXRCbGVuZEZ1bmMoc3JjLCBkc3QsIHNyY0FscGhhLCBkc3RBbHBoYSkge1xuICAgICAgICB0aGlzLmJsZW5kRnVuYy5zcmMgPSBzcmM7XG4gICAgICAgIHRoaXMuYmxlbmRGdW5jLmRzdCA9IGRzdDtcbiAgICAgICAgdGhpcy5ibGVuZEZ1bmMuc3JjQWxwaGEgPSBzcmNBbHBoYTtcbiAgICAgICAgdGhpcy5ibGVuZEZ1bmMuZHN0QWxwaGEgPSBkc3RBbHBoYTtcbiAgICAgICAgaWYgKHNyYykgdGhpcy50cmFuc3BhcmVudCA9IHRydWU7XG4gICAgfVxuXG4gICAgc2V0QmxlbmRFcXVhdGlvbihtb2RlUkdCLCBtb2RlQWxwaGEpIHtcbiAgICAgICAgdGhpcy5ibGVuZEVxdWF0aW9uLm1vZGVSR0IgPSBtb2RlUkdCO1xuICAgICAgICB0aGlzLmJsZW5kRXF1YXRpb24ubW9kZUFscGhhID0gbW9kZUFscGhhO1xuICAgIH1cblxuICAgIGFwcGx5U3RhdGUoKSB7XG4gICAgICAgIGlmICh0aGlzLmRlcHRoVGVzdCkgdGhpcy5nbC5yZW5kZXJlci5lbmFibGUodGhpcy5nbC5ERVBUSF9URVNUKTtcbiAgICAgICAgZWxzZSB0aGlzLmdsLnJlbmRlcmVyLmRpc2FibGUodGhpcy5nbC5ERVBUSF9URVNUKTtcblxuICAgICAgICBpZiAodGhpcy5jdWxsRmFjZSkgdGhpcy5nbC5yZW5kZXJlci5lbmFibGUodGhpcy5nbC5DVUxMX0ZBQ0UpO1xuICAgICAgICBlbHNlIHRoaXMuZ2wucmVuZGVyZXIuZGlzYWJsZSh0aGlzLmdsLkNVTExfRkFDRSk7XG5cbiAgICAgICAgaWYgKHRoaXMuYmxlbmRGdW5jLnNyYykgdGhpcy5nbC5yZW5kZXJlci5lbmFibGUodGhpcy5nbC5CTEVORCk7XG4gICAgICAgIGVsc2UgdGhpcy5nbC5yZW5kZXJlci5kaXNhYmxlKHRoaXMuZ2wuQkxFTkQpO1xuXG4gICAgICAgIGlmICh0aGlzLmN1bGxGYWNlKSB0aGlzLmdsLnJlbmRlcmVyLnNldEN1bGxGYWNlKHRoaXMuY3VsbEZhY2UpO1xuICAgICAgICB0aGlzLmdsLnJlbmRlcmVyLnNldEZyb250RmFjZSh0aGlzLmZyb250RmFjZSk7XG4gICAgICAgIHRoaXMuZ2wucmVuZGVyZXIuc2V0RGVwdGhNYXNrKHRoaXMuZGVwdGhXcml0ZSk7XG4gICAgICAgIHRoaXMuZ2wucmVuZGVyZXIuc2V0RGVwdGhGdW5jKHRoaXMuZGVwdGhGdW5jKTtcbiAgICAgICAgaWYgKHRoaXMuYmxlbmRGdW5jLnNyYylcbiAgICAgICAgICAgIHRoaXMuZ2wucmVuZGVyZXIuc2V0QmxlbmRGdW5jKHRoaXMuYmxlbmRGdW5jLnNyYywgdGhpcy5ibGVuZEZ1bmMuZHN0LCB0aGlzLmJsZW5kRnVuYy5zcmNBbHBoYSwgdGhpcy5ibGVuZEZ1bmMuZHN0QWxwaGEpO1xuICAgICAgICB0aGlzLmdsLnJlbmRlcmVyLnNldEJsZW5kRXF1YXRpb24odGhpcy5ibGVuZEVxdWF0aW9uLm1vZGVSR0IsIHRoaXMuYmxlbmRFcXVhdGlvbi5tb2RlQWxwaGEpO1xuICAgIH1cblxuICAgIHVzZSh7IGZsaXBGYWNlcyA9IGZhbHNlIH0gPSB7fSkge1xuICAgICAgICBsZXQgdGV4dHVyZVVuaXQgPSAtMTtcbiAgICAgICAgY29uc3QgcHJvZ3JhbUFjdGl2ZSA9IHRoaXMuZ2wucmVuZGVyZXIuY3VycmVudFByb2dyYW0gPT09IHRoaXMuaWQ7XG5cbiAgICAgICAgLy8gQXZvaWQgZ2wgY2FsbCBpZiBwcm9ncmFtIGFscmVhZHkgaW4gdXNlXG4gICAgICAgIGlmICghcHJvZ3JhbUFjdGl2ZSkge1xuICAgICAgICAgICAgdGhpcy5nbC51c2VQcm9ncmFtKHRoaXMucHJvZ3JhbSk7XG4gICAgICAgICAgICB0aGlzLmdsLnJlbmRlcmVyLmN1cnJlbnRQcm9ncmFtID0gdGhpcy5pZDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFNldCBvbmx5IHRoZSBhY3RpdmUgdW5pZm9ybXMgZm91bmQgaW4gdGhlIHNoYWRlclxuICAgICAgICB0aGlzLnVuaWZvcm1Mb2NhdGlvbnMuZm9yRWFjaCgobG9jYXRpb24sIGFjdGl2ZVVuaWZvcm0pID0+IHtcbiAgICAgICAgICAgIGxldCBuYW1lID0gYWN0aXZlVW5pZm9ybS51bmlmb3JtTmFtZTtcblxuICAgICAgICAgICAgLy8gZ2V0IHN1cHBsaWVkIHVuaWZvcm1cbiAgICAgICAgICAgIGxldCB1bmlmb3JtID0gdGhpcy51bmlmb3Jtc1tuYW1lXTtcblxuICAgICAgICAgICAgLy8gRm9yIHN0cnVjdHMsIGdldCB0aGUgc3BlY2lmaWMgcHJvcGVydHkgaW5zdGVhZCBvZiB0aGUgZW50aXJlIG9iamVjdFxuICAgICAgICAgICAgaWYgKGFjdGl2ZVVuaWZvcm0uaXNTdHJ1Y3QpIHtcbiAgICAgICAgICAgICAgICB1bmlmb3JtID0gdW5pZm9ybVthY3RpdmVVbmlmb3JtLnN0cnVjdFByb3BlcnR5XTtcbiAgICAgICAgICAgICAgICBuYW1lICs9IGAuJHthY3RpdmVVbmlmb3JtLnN0cnVjdFByb3BlcnR5fWA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoYWN0aXZlVW5pZm9ybS5pc1N0cnVjdEFycmF5KSB7XG4gICAgICAgICAgICAgICAgdW5pZm9ybSA9IHVuaWZvcm1bYWN0aXZlVW5pZm9ybS5zdHJ1Y3RJbmRleF1bYWN0aXZlVW5pZm9ybS5zdHJ1Y3RQcm9wZXJ0eV07XG4gICAgICAgICAgICAgICAgbmFtZSArPSBgWyR7YWN0aXZlVW5pZm9ybS5zdHJ1Y3RJbmRleH1dLiR7YWN0aXZlVW5pZm9ybS5zdHJ1Y3RQcm9wZXJ0eX1gO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIXVuaWZvcm0pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gd2FybihgQWN0aXZlIHVuaWZvcm0gJHtuYW1lfSBoYXMgbm90IGJlZW4gc3VwcGxpZWRgKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHVuaWZvcm0gJiYgdW5pZm9ybS52YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHdhcm4oYCR7bmFtZX0gdW5pZm9ybSBpcyBtaXNzaW5nIGEgdmFsdWUgcGFyYW1ldGVyYCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh1bmlmb3JtLnZhbHVlLnRleHR1cmUpIHtcbiAgICAgICAgICAgICAgICB0ZXh0dXJlVW5pdCA9IHRleHR1cmVVbml0ICsgMTtcblxuICAgICAgICAgICAgICAgIC8vIENoZWNrIGlmIHRleHR1cmUgbmVlZHMgdG8gYmUgdXBkYXRlZFxuICAgICAgICAgICAgICAgIHVuaWZvcm0udmFsdWUudXBkYXRlKHRleHR1cmVVbml0KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gc2V0VW5pZm9ybSh0aGlzLmdsLCBhY3RpdmVVbmlmb3JtLnR5cGUsIGxvY2F0aW9uLCB0ZXh0dXJlVW5pdCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIEZvciB0ZXh0dXJlIGFycmF5cywgc2V0IHVuaWZvcm0gYXMgYW4gYXJyYXkgb2YgdGV4dHVyZSB1bml0cyBpbnN0ZWFkIG9mIGp1c3Qgb25lXG4gICAgICAgICAgICBpZiAodW5pZm9ybS52YWx1ZS5sZW5ndGggJiYgdW5pZm9ybS52YWx1ZVswXS50ZXh0dXJlKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgdGV4dHVyZVVuaXRzID0gW107XG4gICAgICAgICAgICAgICAgdW5pZm9ybS52YWx1ZS5mb3JFYWNoKCh2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0ZXh0dXJlVW5pdCA9IHRleHR1cmVVbml0ICsgMTtcbiAgICAgICAgICAgICAgICAgICAgdmFsdWUudXBkYXRlKHRleHR1cmVVbml0KTtcbiAgICAgICAgICAgICAgICAgICAgdGV4dHVyZVVuaXRzLnB1c2godGV4dHVyZVVuaXQpO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHNldFVuaWZvcm0odGhpcy5nbCwgYWN0aXZlVW5pZm9ybS50eXBlLCBsb2NhdGlvbiwgdGV4dHVyZVVuaXRzKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgc2V0VW5pZm9ybSh0aGlzLmdsLCBhY3RpdmVVbmlmb3JtLnR5cGUsIGxvY2F0aW9uLCB1bmlmb3JtLnZhbHVlKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5hcHBseVN0YXRlKCk7XG4gICAgICAgIGlmIChmbGlwRmFjZXMpIHRoaXMuZ2wucmVuZGVyZXIuc2V0RnJvbnRGYWNlKHRoaXMuZnJvbnRGYWNlID09PSB0aGlzLmdsLkNDVyA/IHRoaXMuZ2wuQ1cgOiB0aGlzLmdsLkNDVyk7XG4gICAgfVxuXG4gICAgcmVtb3ZlKCkge1xuICAgICAgICB0aGlzLmdsLmRlbGV0ZVByb2dyYW0odGhpcy5wcm9ncmFtKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIHNldFVuaWZvcm0oZ2wsIHR5cGUsIGxvY2F0aW9uLCB2YWx1ZSkge1xuICAgIHZhbHVlID0gdmFsdWUubGVuZ3RoID8gZmxhdHRlbih2YWx1ZSkgOiB2YWx1ZTtcbiAgICBjb25zdCBzZXRWYWx1ZSA9IGdsLnJlbmRlcmVyLnN0YXRlLnVuaWZvcm1Mb2NhdGlvbnMuZ2V0KGxvY2F0aW9uKTtcblxuICAgIC8vIEF2b2lkIHJlZHVuZGFudCB1bmlmb3JtIGNvbW1hbmRzXG4gICAgaWYgKHZhbHVlLmxlbmd0aCkge1xuICAgICAgICBpZiAoc2V0VmFsdWUgPT09IHVuZGVmaW5lZCB8fCBzZXRWYWx1ZS5sZW5ndGggIT09IHZhbHVlLmxlbmd0aCkge1xuICAgICAgICAgICAgLy8gY2xvbmUgYXJyYXkgdG8gc3RvcmUgYXMgY2FjaGVcbiAgICAgICAgICAgIGdsLnJlbmRlcmVyLnN0YXRlLnVuaWZvcm1Mb2NhdGlvbnMuc2V0KGxvY2F0aW9uLCB2YWx1ZS5zbGljZSgwKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAoYXJyYXlzRXF1YWwoc2V0VmFsdWUsIHZhbHVlKSkgcmV0dXJuO1xuXG4gICAgICAgICAgICAvLyBVcGRhdGUgY2FjaGVkIGFycmF5IHZhbHVlc1xuICAgICAgICAgICAgc2V0VmFsdWUuc2V0ID8gc2V0VmFsdWUuc2V0KHZhbHVlKSA6IHNldEFycmF5KHNldFZhbHVlLCB2YWx1ZSk7XG4gICAgICAgICAgICBnbC5yZW5kZXJlci5zdGF0ZS51bmlmb3JtTG9jYXRpb25zLnNldChsb2NhdGlvbiwgc2V0VmFsdWUpO1xuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKHNldFZhbHVlID09PSB2YWx1ZSkgcmV0dXJuO1xuICAgICAgICBnbC5yZW5kZXJlci5zdGF0ZS51bmlmb3JtTG9jYXRpb25zLnNldChsb2NhdGlvbiwgdmFsdWUpO1xuICAgIH1cblxuICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgICBjYXNlIDUxMjY6XG4gICAgICAgICAgICByZXR1cm4gdmFsdWUubGVuZ3RoID8gZ2wudW5pZm9ybTFmdihsb2NhdGlvbiwgdmFsdWUpIDogZ2wudW5pZm9ybTFmKGxvY2F0aW9uLCB2YWx1ZSk7IC8vIEZMT0FUXG4gICAgICAgIGNhc2UgMzU2NjQ6XG4gICAgICAgICAgICByZXR1cm4gZ2wudW5pZm9ybTJmdihsb2NhdGlvbiwgdmFsdWUpOyAvLyBGTE9BVF9WRUMyXG4gICAgICAgIGNhc2UgMzU2NjU6XG4gICAgICAgICAgICByZXR1cm4gZ2wudW5pZm9ybTNmdihsb2NhdGlvbiwgdmFsdWUpOyAvLyBGTE9BVF9WRUMzXG4gICAgICAgIGNhc2UgMzU2NjY6XG4gICAgICAgICAgICByZXR1cm4gZ2wudW5pZm9ybTRmdihsb2NhdGlvbiwgdmFsdWUpOyAvLyBGTE9BVF9WRUM0XG4gICAgICAgIGNhc2UgMzU2NzA6IC8vIEJPT0xcbiAgICAgICAgY2FzZSA1MTI0OiAvLyBJTlRcbiAgICAgICAgY2FzZSAzNTY3ODogLy8gU0FNUExFUl8yRFxuICAgICAgICBjYXNlIDM1NjgwOlxuICAgICAgICAgICAgcmV0dXJuIHZhbHVlLmxlbmd0aCA/IGdsLnVuaWZvcm0xaXYobG9jYXRpb24sIHZhbHVlKSA6IGdsLnVuaWZvcm0xaShsb2NhdGlvbiwgdmFsdWUpOyAvLyBTQU1QTEVSX0NVQkVcbiAgICAgICAgY2FzZSAzNTY3MTogLy8gQk9PTF9WRUMyXG4gICAgICAgIGNhc2UgMzU2Njc6XG4gICAgICAgICAgICByZXR1cm4gZ2wudW5pZm9ybTJpdihsb2NhdGlvbiwgdmFsdWUpOyAvLyBJTlRfVkVDMlxuICAgICAgICBjYXNlIDM1NjcyOiAvLyBCT09MX1ZFQzNcbiAgICAgICAgY2FzZSAzNTY2ODpcbiAgICAgICAgICAgIHJldHVybiBnbC51bmlmb3JtM2l2KGxvY2F0aW9uLCB2YWx1ZSk7IC8vIElOVF9WRUMzXG4gICAgICAgIGNhc2UgMzU2NzM6IC8vIEJPT0xfVkVDNFxuICAgICAgICBjYXNlIDM1NjY5OlxuICAgICAgICAgICAgcmV0dXJuIGdsLnVuaWZvcm00aXYobG9jYXRpb24sIHZhbHVlKTsgLy8gSU5UX1ZFQzRcbiAgICAgICAgY2FzZSAzNTY3NDpcbiAgICAgICAgICAgIHJldHVybiBnbC51bmlmb3JtTWF0cml4MmZ2KGxvY2F0aW9uLCBmYWxzZSwgdmFsdWUpOyAvLyBGTE9BVF9NQVQyXG4gICAgICAgIGNhc2UgMzU2NzU6XG4gICAgICAgICAgICByZXR1cm4gZ2wudW5pZm9ybU1hdHJpeDNmdihsb2NhdGlvbiwgZmFsc2UsIHZhbHVlKTsgLy8gRkxPQVRfTUFUM1xuICAgICAgICBjYXNlIDM1Njc2OlxuICAgICAgICAgICAgcmV0dXJuIGdsLnVuaWZvcm1NYXRyaXg0ZnYobG9jYXRpb24sIGZhbHNlLCB2YWx1ZSk7IC8vIEZMT0FUX01BVDRcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGFkZExpbmVOdW1iZXJzKHN0cmluZykge1xuICAgIGxldCBsaW5lcyA9IHN0cmluZy5zcGxpdCgnXFxuJyk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsaW5lcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBsaW5lc1tpXSA9IGkgKyAxICsgJzogJyArIGxpbmVzW2ldO1xuICAgIH1cbiAgICByZXR1cm4gbGluZXMuam9pbignXFxuJyk7XG59XG5cbmZ1bmN0aW9uIGZsYXR0ZW4oYSkge1xuICAgIGNvbnN0IGFycmF5TGVuID0gYS5sZW5ndGg7XG4gICAgY29uc3QgdmFsdWVMZW4gPSBhWzBdLmxlbmd0aDtcbiAgICBpZiAodmFsdWVMZW4gPT09IHVuZGVmaW5lZCkgcmV0dXJuIGE7XG4gICAgY29uc3QgbGVuZ3RoID0gYXJyYXlMZW4gKiB2YWx1ZUxlbjtcbiAgICBsZXQgdmFsdWUgPSBhcnJheUNhY2hlRjMyW2xlbmd0aF07XG4gICAgaWYgKCF2YWx1ZSkgYXJyYXlDYWNoZUYzMltsZW5ndGhdID0gdmFsdWUgPSBuZXcgRmxvYXQzMkFycmF5KGxlbmd0aCk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhcnJheUxlbjsgaSsrKSB2YWx1ZS5zZXQoYVtpXSwgaSAqIHZhbHVlTGVuKTtcbiAgICByZXR1cm4gdmFsdWU7XG59XG5cbmZ1bmN0aW9uIGFycmF5c0VxdWFsKGEsIGIpIHtcbiAgICBpZiAoYS5sZW5ndGggIT09IGIubGVuZ3RoKSByZXR1cm4gZmFsc2U7XG4gICAgZm9yIChsZXQgaSA9IDAsIGwgPSBhLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICBpZiAoYVtpXSAhPT0gYltpXSkgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbn1cblxuZnVuY3Rpb24gc2V0QXJyYXkoYSwgYikge1xuICAgIGZvciAobGV0IGkgPSAwLCBsID0gYS5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgYVtpXSA9IGJbaV07XG4gICAgfVxufVxuXG5sZXQgd2FybkNvdW50ID0gMDtcbmZ1bmN0aW9uIHdhcm4obWVzc2FnZSkge1xuICAgIGlmICh3YXJuQ291bnQgPiAxMDApIHJldHVybjtcbiAgICBjb25zb2xlLndhcm4obWVzc2FnZSk7XG4gICAgd2FybkNvdW50Kys7XG4gICAgaWYgKHdhcm5Db3VudCA+IDEwMCkgY29uc29sZS53YXJuKCdNb3JlIHRoYW4gMTAwIHByb2dyYW0gd2FybmluZ3MgLSBzdG9wcGluZyBsb2dzLicpO1xufVxuIiwiLy8gVE9ETzogbXVsdGkgdGFyZ2V0IHJlbmRlcmluZ1xuLy8gVE9ETzogdGVzdCBzdGVuY2lsIGFuZCBkZXB0aFxuLy8gVE9ETzogZGVzdHJveVxuLy8gVE9ETzogYmxpdCBvbiByZXNpemU/XG5pbXBvcnQgeyBUZXh0dXJlIH0gZnJvbSAnLi9UZXh0dXJlLmpzJztcblxuZXhwb3J0IGNsYXNzIFJlbmRlclRhcmdldCB7XG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIGdsLFxuICAgICAgICB7XG4gICAgICAgICAgICB3aWR0aCA9IGdsLmNhbnZhcy53aWR0aCxcbiAgICAgICAgICAgIGhlaWdodCA9IGdsLmNhbnZhcy5oZWlnaHQsXG4gICAgICAgICAgICB0YXJnZXQgPSBnbC5GUkFNRUJVRkZFUixcbiAgICAgICAgICAgIGNvbG9yID0gMSwgLy8gbnVtYmVyIG9mIGNvbG9yIGF0dGFjaG1lbnRzXG4gICAgICAgICAgICBkZXB0aCA9IHRydWUsXG4gICAgICAgICAgICBzdGVuY2lsID0gZmFsc2UsXG4gICAgICAgICAgICBkZXB0aFRleHR1cmUgPSBmYWxzZSwgLy8gbm90ZSAtIHN0ZW5jaWwgYnJlYWtzXG4gICAgICAgICAgICB3cmFwUyA9IGdsLkNMQU1QX1RPX0VER0UsXG4gICAgICAgICAgICB3cmFwVCA9IGdsLkNMQU1QX1RPX0VER0UsXG4gICAgICAgICAgICBtaW5GaWx0ZXIgPSBnbC5MSU5FQVIsXG4gICAgICAgICAgICBtYWdGaWx0ZXIgPSBtaW5GaWx0ZXIsXG4gICAgICAgICAgICB0eXBlID0gZ2wuVU5TSUdORURfQllURSxcbiAgICAgICAgICAgIGZvcm1hdCA9IGdsLlJHQkEsXG4gICAgICAgICAgICBpbnRlcm5hbEZvcm1hdCA9IGZvcm1hdCxcbiAgICAgICAgICAgIHVucGFja0FsaWdubWVudCxcbiAgICAgICAgICAgIHByZW11bHRpcGx5QWxwaGEsXG4gICAgICAgIH0gPSB7fVxuICAgICkge1xuICAgICAgICB0aGlzLmdsID0gZ2w7XG4gICAgICAgIHRoaXMud2lkdGggPSB3aWR0aDtcbiAgICAgICAgdGhpcy5oZWlnaHQgPSBoZWlnaHQ7XG4gICAgICAgIHRoaXMuZGVwdGggPSBkZXB0aDtcbiAgICAgICAgdGhpcy5idWZmZXIgPSB0aGlzLmdsLmNyZWF0ZUZyYW1lYnVmZmVyKCk7XG4gICAgICAgIHRoaXMudGFyZ2V0ID0gdGFyZ2V0O1xuICAgICAgICB0aGlzLmdsLmJpbmRGcmFtZWJ1ZmZlcih0aGlzLnRhcmdldCwgdGhpcy5idWZmZXIpO1xuXG4gICAgICAgIHRoaXMudGV4dHVyZXMgPSBbXTtcbiAgICAgICAgY29uc3QgZHJhd0J1ZmZlcnMgPSBbXTtcblxuICAgICAgICAvLyBjcmVhdGUgYW5kIGF0dGFjaCByZXF1aXJlZCBudW0gb2YgY29sb3IgdGV4dHVyZXNcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb2xvcjsgaSsrKSB7XG4gICAgICAgICAgICB0aGlzLnRleHR1cmVzLnB1c2goXG4gICAgICAgICAgICAgICAgbmV3IFRleHR1cmUoZ2wsIHtcbiAgICAgICAgICAgICAgICAgICAgd2lkdGgsXG4gICAgICAgICAgICAgICAgICAgIGhlaWdodCxcbiAgICAgICAgICAgICAgICAgICAgd3JhcFMsXG4gICAgICAgICAgICAgICAgICAgIHdyYXBULFxuICAgICAgICAgICAgICAgICAgICBtaW5GaWx0ZXIsXG4gICAgICAgICAgICAgICAgICAgIG1hZ0ZpbHRlcixcbiAgICAgICAgICAgICAgICAgICAgdHlwZSxcbiAgICAgICAgICAgICAgICAgICAgZm9ybWF0LFxuICAgICAgICAgICAgICAgICAgICBpbnRlcm5hbEZvcm1hdCxcbiAgICAgICAgICAgICAgICAgICAgdW5wYWNrQWxpZ25tZW50LFxuICAgICAgICAgICAgICAgICAgICBwcmVtdWx0aXBseUFscGhhLFxuICAgICAgICAgICAgICAgICAgICBmbGlwWTogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIGdlbmVyYXRlTWlwbWFwczogZmFsc2UsXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICB0aGlzLnRleHR1cmVzW2ldLnVwZGF0ZSgpO1xuICAgICAgICAgICAgdGhpcy5nbC5mcmFtZWJ1ZmZlclRleHR1cmUyRCh0aGlzLnRhcmdldCwgdGhpcy5nbC5DT0xPUl9BVFRBQ0hNRU5UMCArIGksIHRoaXMuZ2wuVEVYVFVSRV8yRCwgdGhpcy50ZXh0dXJlc1tpXS50ZXh0dXJlLCAwIC8qIGxldmVsICovKTtcbiAgICAgICAgICAgIGRyYXdCdWZmZXJzLnB1c2godGhpcy5nbC5DT0xPUl9BVFRBQ0hNRU5UMCArIGkpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gRm9yIG11bHRpLXJlbmRlciB0YXJnZXRzIHNoYWRlciBhY2Nlc3NcbiAgICAgICAgaWYgKGRyYXdCdWZmZXJzLmxlbmd0aCA+IDEpIHRoaXMuZ2wucmVuZGVyZXIuZHJhd0J1ZmZlcnMoZHJhd0J1ZmZlcnMpO1xuXG4gICAgICAgIC8vIGFsaWFzIGZvciBtYWpvcml0eSBvZiB1c2UgY2FzZXNcbiAgICAgICAgdGhpcy50ZXh0dXJlID0gdGhpcy50ZXh0dXJlc1swXTtcblxuICAgICAgICAvLyBub3RlIGRlcHRoIHRleHR1cmVzIGJyZWFrIHN0ZW5jaWwgLSBzbyBjYW4ndCB1c2UgdG9nZXRoZXJcbiAgICAgICAgaWYgKGRlcHRoVGV4dHVyZSAmJiAodGhpcy5nbC5yZW5kZXJlci5pc1dlYmdsMiB8fCB0aGlzLmdsLnJlbmRlcmVyLmdldEV4dGVuc2lvbignV0VCR0xfZGVwdGhfdGV4dHVyZScpKSkge1xuICAgICAgICAgICAgdGhpcy5kZXB0aFRleHR1cmUgPSBuZXcgVGV4dHVyZShnbCwge1xuICAgICAgICAgICAgICAgIHdpZHRoLFxuICAgICAgICAgICAgICAgIGhlaWdodCxcbiAgICAgICAgICAgICAgICBtaW5GaWx0ZXI6IHRoaXMuZ2wuTkVBUkVTVCxcbiAgICAgICAgICAgICAgICBtYWdGaWx0ZXI6IHRoaXMuZ2wuTkVBUkVTVCxcbiAgICAgICAgICAgICAgICBmb3JtYXQ6IHRoaXMuZ2wuREVQVEhfQ09NUE9ORU5ULFxuICAgICAgICAgICAgICAgIGludGVybmFsRm9ybWF0OiBnbC5yZW5kZXJlci5pc1dlYmdsMiA/IHRoaXMuZ2wuREVQVEhfQ09NUE9ORU5UMTYgOiB0aGlzLmdsLkRFUFRIX0NPTVBPTkVOVCxcbiAgICAgICAgICAgICAgICB0eXBlOiB0aGlzLmdsLlVOU0lHTkVEX0lOVCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy5kZXB0aFRleHR1cmUudXBkYXRlKCk7XG4gICAgICAgICAgICB0aGlzLmdsLmZyYW1lYnVmZmVyVGV4dHVyZTJEKHRoaXMudGFyZ2V0LCB0aGlzLmdsLkRFUFRIX0FUVEFDSE1FTlQsIHRoaXMuZ2wuVEVYVFVSRV8yRCwgdGhpcy5kZXB0aFRleHR1cmUudGV4dHVyZSwgMCAvKiBsZXZlbCAqLyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBSZW5kZXIgYnVmZmVyc1xuICAgICAgICAgICAgaWYgKGRlcHRoICYmICFzdGVuY2lsKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kZXB0aEJ1ZmZlciA9IHRoaXMuZ2wuY3JlYXRlUmVuZGVyYnVmZmVyKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5nbC5iaW5kUmVuZGVyYnVmZmVyKHRoaXMuZ2wuUkVOREVSQlVGRkVSLCB0aGlzLmRlcHRoQnVmZmVyKTtcbiAgICAgICAgICAgICAgICB0aGlzLmdsLnJlbmRlcmJ1ZmZlclN0b3JhZ2UodGhpcy5nbC5SRU5ERVJCVUZGRVIsIHRoaXMuZ2wuREVQVEhfQ09NUE9ORU5UMTYsIHdpZHRoLCBoZWlnaHQpO1xuICAgICAgICAgICAgICAgIHRoaXMuZ2wuZnJhbWVidWZmZXJSZW5kZXJidWZmZXIodGhpcy50YXJnZXQsIHRoaXMuZ2wuREVQVEhfQVRUQUNITUVOVCwgdGhpcy5nbC5SRU5ERVJCVUZGRVIsIHRoaXMuZGVwdGhCdWZmZXIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoc3RlbmNpbCAmJiAhZGVwdGgpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnN0ZW5jaWxCdWZmZXIgPSB0aGlzLmdsLmNyZWF0ZVJlbmRlcmJ1ZmZlcigpO1xuICAgICAgICAgICAgICAgIHRoaXMuZ2wuYmluZFJlbmRlcmJ1ZmZlcih0aGlzLmdsLlJFTkRFUkJVRkZFUiwgdGhpcy5zdGVuY2lsQnVmZmVyKTtcbiAgICAgICAgICAgICAgICB0aGlzLmdsLnJlbmRlcmJ1ZmZlclN0b3JhZ2UodGhpcy5nbC5SRU5ERVJCVUZGRVIsIHRoaXMuZ2wuU1RFTkNJTF9JTkRFWDgsIHdpZHRoLCBoZWlnaHQpO1xuICAgICAgICAgICAgICAgIHRoaXMuZ2wuZnJhbWVidWZmZXJSZW5kZXJidWZmZXIodGhpcy50YXJnZXQsIHRoaXMuZ2wuU1RFTkNJTF9BVFRBQ0hNRU5ULCB0aGlzLmdsLlJFTkRFUkJVRkZFUiwgdGhpcy5zdGVuY2lsQnVmZmVyKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGRlcHRoICYmIHN0ZW5jaWwpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRlcHRoU3RlbmNpbEJ1ZmZlciA9IHRoaXMuZ2wuY3JlYXRlUmVuZGVyYnVmZmVyKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5nbC5iaW5kUmVuZGVyYnVmZmVyKHRoaXMuZ2wuUkVOREVSQlVGRkVSLCB0aGlzLmRlcHRoU3RlbmNpbEJ1ZmZlcik7XG4gICAgICAgICAgICAgICAgdGhpcy5nbC5yZW5kZXJidWZmZXJTdG9yYWdlKHRoaXMuZ2wuUkVOREVSQlVGRkVSLCB0aGlzLmdsLkRFUFRIX1NURU5DSUwsIHdpZHRoLCBoZWlnaHQpO1xuICAgICAgICAgICAgICAgIHRoaXMuZ2wuZnJhbWVidWZmZXJSZW5kZXJidWZmZXIodGhpcy50YXJnZXQsIHRoaXMuZ2wuREVQVEhfU1RFTkNJTF9BVFRBQ0hNRU5ULCB0aGlzLmdsLlJFTkRFUkJVRkZFUiwgdGhpcy5kZXB0aFN0ZW5jaWxCdWZmZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5nbC5iaW5kRnJhbWVidWZmZXIodGhpcy50YXJnZXQsIG51bGwpO1xuICAgIH1cblxuICAgIGRpc3Bvc2UoKSB7XG4gICAgICAgIHRoaXMudGV4dHVyZXMuZm9yRWFjaCggKHRleHR1cmUpID0+IHtcbiAgICAgICAgICAgIHRleHR1cmUuZGlzcG9zZSgpO1xuICAgICAgICB9KVxuICAgICAgICB0aGlzLmdsLmRlbGV0ZUZyYW1lYnVmZmVyKHRoaXMuYnVmZmVyKTtcbiAgICB9XG59XG4iLCJpbXBvcnQgeyBWZWMzIH0gZnJvbSAnLi4vbWF0aC9WZWMzLmpzJztcblxuLy8gVE9ETzogSGFuZGxlIGNvbnRleHQgbG9zcyBodHRwczovL3d3dy5raHJvbm9zLm9yZy93ZWJnbC93aWtpL0hhbmRsaW5nQ29udGV4dExvc3RcblxuLy8gTm90IGF1dG9tYXRpYyAtIGRldnMgdG8gdXNlIHRoZXNlIG1ldGhvZHMgbWFudWFsbHlcbi8vIGdsLmNvbG9yTWFzayggY29sb3JNYXNrLCBjb2xvck1hc2ssIGNvbG9yTWFzaywgY29sb3JNYXNrICk7XG4vLyBnbC5jbGVhckNvbG9yKCByLCBnLCBiLCBhICk7XG4vLyBnbC5zdGVuY2lsTWFzayggc3RlbmNpbE1hc2sgKTtcbi8vIGdsLnN0ZW5jaWxGdW5jKCBzdGVuY2lsRnVuYywgc3RlbmNpbFJlZiwgc3RlbmNpbE1hc2sgKTtcbi8vIGdsLnN0ZW5jaWxPcCggc3RlbmNpbEZhaWwsIHN0ZW5jaWxaRmFpbCwgc3RlbmNpbFpQYXNzICk7XG4vLyBnbC5jbGVhclN0ZW5jaWwoIHN0ZW5jaWwgKTtcblxuY29uc3QgdGVtcFZlYzMgPSBuZXcgVmVjMygpO1xubGV0IElEID0gMTtcblxuZXhwb3J0IGNsYXNzIFJlbmRlcmVyIHtcbiAgICBjb25zdHJ1Y3Rvcih7XG4gICAgICAgIGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpLFxuICAgICAgICB3aWR0aCA9IDMwMCxcbiAgICAgICAgaGVpZ2h0ID0gMTUwLFxuICAgICAgICBkcHIgPSAxLFxuICAgICAgICBhbHBoYSA9IGZhbHNlLFxuICAgICAgICBkZXB0aCA9IHRydWUsXG4gICAgICAgIHN0ZW5jaWwgPSBmYWxzZSxcbiAgICAgICAgYW50aWFsaWFzID0gZmFsc2UsXG4gICAgICAgIHByZW11bHRpcGxpZWRBbHBoYSA9IGZhbHNlLFxuICAgICAgICBwcmVzZXJ2ZURyYXdpbmdCdWZmZXIgPSBmYWxzZSxcbiAgICAgICAgcG93ZXJQcmVmZXJlbmNlID0gJ2RlZmF1bHQnLFxuICAgICAgICBhdXRvQ2xlYXIgPSB0cnVlLFxuICAgICAgICB3ZWJnbCA9IDIsXG4gICAgfSA9IHt9KSB7XG4gICAgICAgIGNvbnN0IGF0dHJpYnV0ZXMgPSB7IGFscGhhLCBkZXB0aCwgc3RlbmNpbCwgYW50aWFsaWFzLCBwcmVtdWx0aXBsaWVkQWxwaGEsIHByZXNlcnZlRHJhd2luZ0J1ZmZlciwgcG93ZXJQcmVmZXJlbmNlIH07XG4gICAgICAgIHRoaXMuZHByID0gZHByO1xuICAgICAgICB0aGlzLmFscGhhID0gYWxwaGE7XG4gICAgICAgIHRoaXMuY29sb3IgPSB0cnVlO1xuICAgICAgICB0aGlzLmRlcHRoID0gZGVwdGg7XG4gICAgICAgIHRoaXMuc3RlbmNpbCA9IHN0ZW5jaWw7XG4gICAgICAgIHRoaXMucHJlbXVsdGlwbGllZEFscGhhID0gcHJlbXVsdGlwbGllZEFscGhhO1xuICAgICAgICB0aGlzLmF1dG9DbGVhciA9IGF1dG9DbGVhcjtcbiAgICAgICAgdGhpcy5pZCA9IElEKys7XG5cbiAgICAgICAgLy8gQXR0ZW1wdCBXZWJHTDIgdW5sZXNzIGZvcmNlZCB0byAxLCBpZiBub3Qgc3VwcG9ydGVkIGZhbGxiYWNrIHRvIFdlYkdMMVxuICAgICAgICBpZiAod2ViZ2wgPT09IDIpIHRoaXMuZ2wgPSBjYW52YXMuZ2V0Q29udGV4dCgnd2ViZ2wyJywgYXR0cmlidXRlcyk7XG4gICAgICAgIHRoaXMuaXNXZWJnbDIgPSAhIXRoaXMuZ2w7XG4gICAgICAgIGlmICghdGhpcy5nbCkge1xuICAgICAgICAgICAgdGhpcy5nbCA9IGNhbnZhcy5nZXRDb250ZXh0KCd3ZWJnbCcsIGF0dHJpYnV0ZXMpIHx8IGNhbnZhcy5nZXRDb250ZXh0KCdleHBlcmltZW50YWwtd2ViZ2wnLCBhdHRyaWJ1dGVzKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXRoaXMuZ2wpIGNvbnNvbGUuZXJyb3IoJ3VuYWJsZSB0byBjcmVhdGUgd2ViZ2wgY29udGV4dCcpO1xuXG4gICAgICAgIC8vIEF0dGFjaCByZW5kZXJlciB0byBnbCBzbyB0aGF0IGFsbCBjbGFzc2VzIGhhdmUgYWNjZXNzIHRvIGludGVybmFsIHN0YXRlIGZ1bmN0aW9uc1xuICAgICAgICB0aGlzLmdsLnJlbmRlcmVyID0gdGhpcztcblxuICAgICAgICAvLyBpbml0aWFsaXNlIHNpemUgdmFsdWVzXG4gICAgICAgIHRoaXMuc2V0U2l6ZSh3aWR0aCwgaGVpZ2h0KTtcblxuICAgICAgICAvLyBnbCBzdGF0ZSBzdG9yZXMgdG8gYXZvaWQgcmVkdW5kYW50IGNhbGxzIG9uIG1ldGhvZHMgdXNlZCBpbnRlcm5hbGx5XG4gICAgICAgIHRoaXMuc3RhdGUgPSB7fTtcbiAgICAgICAgdGhpcy5zdGF0ZS5ibGVuZEZ1bmMgPSB7IHNyYzogdGhpcy5nbC5PTkUsIGRzdDogdGhpcy5nbC5aRVJPIH07XG4gICAgICAgIHRoaXMuc3RhdGUuYmxlbmRFcXVhdGlvbiA9IHsgbW9kZVJHQjogdGhpcy5nbC5GVU5DX0FERCB9O1xuICAgICAgICB0aGlzLnN0YXRlLmN1bGxGYWNlID0gbnVsbDtcbiAgICAgICAgdGhpcy5zdGF0ZS5mcm9udEZhY2UgPSB0aGlzLmdsLkNDVztcbiAgICAgICAgdGhpcy5zdGF0ZS5kZXB0aE1hc2sgPSB0cnVlO1xuICAgICAgICB0aGlzLnN0YXRlLmRlcHRoRnVuYyA9IHRoaXMuZ2wuTEVTUztcbiAgICAgICAgdGhpcy5zdGF0ZS5wcmVtdWx0aXBseUFscGhhID0gZmFsc2U7XG4gICAgICAgIHRoaXMuc3RhdGUuZmxpcFkgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5zdGF0ZS51bnBhY2tBbGlnbm1lbnQgPSA0O1xuICAgICAgICB0aGlzLnN0YXRlLmZyYW1lYnVmZmVyID0gbnVsbDtcbiAgICAgICAgdGhpcy5zdGF0ZS52aWV3cG9ydCA9IHsgd2lkdGg6IG51bGwsIGhlaWdodDogbnVsbCB9O1xuICAgICAgICB0aGlzLnN0YXRlLnRleHR1cmVVbml0cyA9IFtdO1xuICAgICAgICB0aGlzLnN0YXRlLmFjdGl2ZVRleHR1cmVVbml0ID0gMDtcbiAgICAgICAgdGhpcy5zdGF0ZS5ib3VuZEJ1ZmZlciA9IG51bGw7XG4gICAgICAgIHRoaXMuc3RhdGUudW5pZm9ybUxvY2F0aW9ucyA9IG5ldyBNYXAoKTtcblxuICAgICAgICAvLyBzdG9yZSByZXF1ZXN0ZWQgZXh0ZW5zaW9uc1xuICAgICAgICB0aGlzLmV4dGVuc2lvbnMgPSB7fTtcblxuICAgICAgICAvLyBJbml0aWFsaXNlIGV4dHJhIGZvcm1hdCB0eXBlc1xuICAgICAgICBpZiAodGhpcy5pc1dlYmdsMikge1xuICAgICAgICAgICAgdGhpcy5nZXRFeHRlbnNpb24oJ0VYVF9jb2xvcl9idWZmZXJfZmxvYXQnKTtcbiAgICAgICAgICAgIHRoaXMuZ2V0RXh0ZW5zaW9uKCdPRVNfdGV4dHVyZV9mbG9hdF9saW5lYXInKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuZ2V0RXh0ZW5zaW9uKCdPRVNfdGV4dHVyZV9mbG9hdCcpO1xuICAgICAgICAgICAgdGhpcy5nZXRFeHRlbnNpb24oJ09FU190ZXh0dXJlX2Zsb2F0X2xpbmVhcicpO1xuICAgICAgICAgICAgdGhpcy5nZXRFeHRlbnNpb24oJ09FU190ZXh0dXJlX2hhbGZfZmxvYXQnKTtcbiAgICAgICAgICAgIHRoaXMuZ2V0RXh0ZW5zaW9uKCdPRVNfdGV4dHVyZV9oYWxmX2Zsb2F0X2xpbmVhcicpO1xuICAgICAgICAgICAgdGhpcy5nZXRFeHRlbnNpb24oJ09FU19lbGVtZW50X2luZGV4X3VpbnQnKTtcbiAgICAgICAgICAgIHRoaXMuZ2V0RXh0ZW5zaW9uKCdPRVNfc3RhbmRhcmRfZGVyaXZhdGl2ZXMnKTtcbiAgICAgICAgICAgIHRoaXMuZ2V0RXh0ZW5zaW9uKCdFWFRfc1JHQicpO1xuICAgICAgICAgICAgdGhpcy5nZXRFeHRlbnNpb24oJ1dFQkdMX2RlcHRoX3RleHR1cmUnKTtcbiAgICAgICAgICAgIHRoaXMuZ2V0RXh0ZW5zaW9uKCdXRUJHTF9kcmF3X2J1ZmZlcnMnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENyZWF0ZSBtZXRob2QgYWxpYXNlcyB1c2luZyBleHRlbnNpb24gKFdlYkdMMSkgb3IgbmF0aXZlIGlmIGF2YWlsYWJsZSAoV2ViR0wyKVxuICAgICAgICB0aGlzLnZlcnRleEF0dHJpYkRpdmlzb3IgPSB0aGlzLmdldEV4dGVuc2lvbignQU5HTEVfaW5zdGFuY2VkX2FycmF5cycsICd2ZXJ0ZXhBdHRyaWJEaXZpc29yJywgJ3ZlcnRleEF0dHJpYkRpdmlzb3JBTkdMRScpO1xuICAgICAgICB0aGlzLmRyYXdBcnJheXNJbnN0YW5jZWQgPSB0aGlzLmdldEV4dGVuc2lvbignQU5HTEVfaW5zdGFuY2VkX2FycmF5cycsICdkcmF3QXJyYXlzSW5zdGFuY2VkJywgJ2RyYXdBcnJheXNJbnN0YW5jZWRBTkdMRScpO1xuICAgICAgICB0aGlzLmRyYXdFbGVtZW50c0luc3RhbmNlZCA9IHRoaXMuZ2V0RXh0ZW5zaW9uKCdBTkdMRV9pbnN0YW5jZWRfYXJyYXlzJywgJ2RyYXdFbGVtZW50c0luc3RhbmNlZCcsICdkcmF3RWxlbWVudHNJbnN0YW5jZWRBTkdMRScpO1xuICAgICAgICB0aGlzLmNyZWF0ZVZlcnRleEFycmF5ID0gdGhpcy5nZXRFeHRlbnNpb24oJ09FU192ZXJ0ZXhfYXJyYXlfb2JqZWN0JywgJ2NyZWF0ZVZlcnRleEFycmF5JywgJ2NyZWF0ZVZlcnRleEFycmF5T0VTJyk7XG4gICAgICAgIHRoaXMuYmluZFZlcnRleEFycmF5ID0gdGhpcy5nZXRFeHRlbnNpb24oJ09FU192ZXJ0ZXhfYXJyYXlfb2JqZWN0JywgJ2JpbmRWZXJ0ZXhBcnJheScsICdiaW5kVmVydGV4QXJyYXlPRVMnKTtcbiAgICAgICAgdGhpcy5kZWxldGVWZXJ0ZXhBcnJheSA9IHRoaXMuZ2V0RXh0ZW5zaW9uKCdPRVNfdmVydGV4X2FycmF5X29iamVjdCcsICdkZWxldGVWZXJ0ZXhBcnJheScsICdkZWxldGVWZXJ0ZXhBcnJheU9FUycpO1xuICAgICAgICB0aGlzLmRyYXdCdWZmZXJzID0gdGhpcy5nZXRFeHRlbnNpb24oJ1dFQkdMX2RyYXdfYnVmZmVycycsICdkcmF3QnVmZmVycycsICdkcmF3QnVmZmVyc1dFQkdMJyk7XG5cbiAgICAgICAgLy8gU3RvcmUgZGV2aWNlIHBhcmFtZXRlcnNcbiAgICAgICAgdGhpcy5wYXJhbWV0ZXJzID0ge307XG4gICAgICAgIHRoaXMucGFyYW1ldGVycy5tYXhUZXh0dXJlVW5pdHMgPSB0aGlzLmdsLmdldFBhcmFtZXRlcih0aGlzLmdsLk1BWF9DT01CSU5FRF9URVhUVVJFX0lNQUdFX1VOSVRTKTtcbiAgICAgICAgdGhpcy5wYXJhbWV0ZXJzLm1heEFuaXNvdHJvcHkgPSB0aGlzLmdldEV4dGVuc2lvbignRVhUX3RleHR1cmVfZmlsdGVyX2FuaXNvdHJvcGljJylcbiAgICAgICAgICAgID8gdGhpcy5nbC5nZXRQYXJhbWV0ZXIodGhpcy5nZXRFeHRlbnNpb24oJ0VYVF90ZXh0dXJlX2ZpbHRlcl9hbmlzb3Ryb3BpYycpLk1BWF9URVhUVVJFX01BWF9BTklTT1RST1BZX0VYVClcbiAgICAgICAgICAgIDogMDtcbiAgICB9XG5cbiAgICBzZXRTaXplKHdpZHRoLCBoZWlnaHQpIHtcbiAgICAgICAgdGhpcy53aWR0aCA9IHdpZHRoO1xuICAgICAgICB0aGlzLmhlaWdodCA9IGhlaWdodDtcblxuICAgICAgICB0aGlzLmdsLmNhbnZhcy53aWR0aCA9IHdpZHRoICogdGhpcy5kcHI7XG4gICAgICAgIHRoaXMuZ2wuY2FudmFzLmhlaWdodCA9IGhlaWdodCAqIHRoaXMuZHByO1xuXG4gICAgICAgIE9iamVjdC5hc3NpZ24odGhpcy5nbC5jYW52YXMuc3R5bGUsIHtcbiAgICAgICAgICAgIHdpZHRoOiB3aWR0aCArICdweCcsXG4gICAgICAgICAgICBoZWlnaHQ6IGhlaWdodCArICdweCcsXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHNldFZpZXdwb3J0KHdpZHRoLCBoZWlnaHQpIHtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUudmlld3BvcnQud2lkdGggPT09IHdpZHRoICYmIHRoaXMuc3RhdGUudmlld3BvcnQuaGVpZ2h0ID09PSBoZWlnaHQpIHJldHVybjtcbiAgICAgICAgdGhpcy5zdGF0ZS52aWV3cG9ydC53aWR0aCA9IHdpZHRoO1xuICAgICAgICB0aGlzLnN0YXRlLnZpZXdwb3J0LmhlaWdodCA9IGhlaWdodDtcbiAgICAgICAgdGhpcy5nbC52aWV3cG9ydCgwLCAwLCB3aWR0aCwgaGVpZ2h0KTtcbiAgICB9XG5cbiAgICBlbmFibGUoaWQpIHtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGVbaWRdID09PSB0cnVlKSByZXR1cm47XG4gICAgICAgIHRoaXMuZ2wuZW5hYmxlKGlkKTtcbiAgICAgICAgdGhpcy5zdGF0ZVtpZF0gPSB0cnVlO1xuICAgIH1cblxuICAgIGRpc2FibGUoaWQpIHtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGVbaWRdID09PSBmYWxzZSkgcmV0dXJuO1xuICAgICAgICB0aGlzLmdsLmRpc2FibGUoaWQpO1xuICAgICAgICB0aGlzLnN0YXRlW2lkXSA9IGZhbHNlO1xuICAgIH1cblxuICAgIHNldEJsZW5kRnVuYyhzcmMsIGRzdCwgc3JjQWxwaGEsIGRzdEFscGhhKSB7XG4gICAgICAgIGlmIChcbiAgICAgICAgICAgIHRoaXMuc3RhdGUuYmxlbmRGdW5jLnNyYyA9PT0gc3JjICYmXG4gICAgICAgICAgICB0aGlzLnN0YXRlLmJsZW5kRnVuYy5kc3QgPT09IGRzdCAmJlxuICAgICAgICAgICAgdGhpcy5zdGF0ZS5ibGVuZEZ1bmMuc3JjQWxwaGEgPT09IHNyY0FscGhhICYmXG4gICAgICAgICAgICB0aGlzLnN0YXRlLmJsZW5kRnVuYy5kc3RBbHBoYSA9PT0gZHN0QWxwaGFcbiAgICAgICAgKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB0aGlzLnN0YXRlLmJsZW5kRnVuYy5zcmMgPSBzcmM7XG4gICAgICAgIHRoaXMuc3RhdGUuYmxlbmRGdW5jLmRzdCA9IGRzdDtcbiAgICAgICAgdGhpcy5zdGF0ZS5ibGVuZEZ1bmMuc3JjQWxwaGEgPSBzcmNBbHBoYTtcbiAgICAgICAgdGhpcy5zdGF0ZS5ibGVuZEZ1bmMuZHN0QWxwaGEgPSBkc3RBbHBoYTtcbiAgICAgICAgaWYgKHNyY0FscGhhICE9PSB1bmRlZmluZWQpIHRoaXMuZ2wuYmxlbmRGdW5jU2VwYXJhdGUoc3JjLCBkc3QsIHNyY0FscGhhLCBkc3RBbHBoYSk7XG4gICAgICAgIGVsc2UgdGhpcy5nbC5ibGVuZEZ1bmMoc3JjLCBkc3QpO1xuICAgIH1cblxuICAgIHNldEJsZW5kRXF1YXRpb24obW9kZVJHQiwgbW9kZUFscGhhKSB7XG4gICAgICAgIG1vZGVSR0IgPSBtb2RlUkdCIHx8IHRoaXMuZ2wuRlVOQ19BREQ7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLmJsZW5kRXF1YXRpb24ubW9kZVJHQiA9PT0gbW9kZVJHQiAmJiB0aGlzLnN0YXRlLmJsZW5kRXF1YXRpb24ubW9kZUFscGhhID09PSBtb2RlQWxwaGEpIHJldHVybjtcbiAgICAgICAgdGhpcy5zdGF0ZS5ibGVuZEVxdWF0aW9uLm1vZGVSR0IgPSBtb2RlUkdCO1xuICAgICAgICB0aGlzLnN0YXRlLmJsZW5kRXF1YXRpb24ubW9kZUFscGhhID0gbW9kZUFscGhhO1xuICAgICAgICBpZiAobW9kZUFscGhhICE9PSB1bmRlZmluZWQpIHRoaXMuZ2wuYmxlbmRFcXVhdGlvblNlcGFyYXRlKG1vZGVSR0IsIG1vZGVBbHBoYSk7XG4gICAgICAgIGVsc2UgdGhpcy5nbC5ibGVuZEVxdWF0aW9uKG1vZGVSR0IpO1xuICAgIH1cblxuICAgIHNldEN1bGxGYWNlKHZhbHVlKSB7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLmN1bGxGYWNlID09PSB2YWx1ZSkgcmV0dXJuO1xuICAgICAgICB0aGlzLnN0YXRlLmN1bGxGYWNlID0gdmFsdWU7XG4gICAgICAgIHRoaXMuZ2wuY3VsbEZhY2UodmFsdWUpO1xuICAgIH1cblxuICAgIHNldEZyb250RmFjZSh2YWx1ZSkge1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5mcm9udEZhY2UgPT09IHZhbHVlKSByZXR1cm47XG4gICAgICAgIHRoaXMuc3RhdGUuZnJvbnRGYWNlID0gdmFsdWU7XG4gICAgICAgIHRoaXMuZ2wuZnJvbnRGYWNlKHZhbHVlKTtcbiAgICB9XG5cbiAgICBzZXREZXB0aE1hc2sodmFsdWUpIHtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuZGVwdGhNYXNrID09PSB2YWx1ZSkgcmV0dXJuO1xuICAgICAgICB0aGlzLnN0YXRlLmRlcHRoTWFzayA9IHZhbHVlO1xuICAgICAgICB0aGlzLmdsLmRlcHRoTWFzayh2YWx1ZSk7XG4gICAgfVxuXG4gICAgc2V0RGVwdGhGdW5jKHZhbHVlKSB7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLmRlcHRoRnVuYyA9PT0gdmFsdWUpIHJldHVybjtcbiAgICAgICAgdGhpcy5zdGF0ZS5kZXB0aEZ1bmMgPSB2YWx1ZTtcbiAgICAgICAgdGhpcy5nbC5kZXB0aEZ1bmModmFsdWUpO1xuICAgIH1cblxuICAgIGFjdGl2ZVRleHR1cmUodmFsdWUpIHtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuYWN0aXZlVGV4dHVyZVVuaXQgPT09IHZhbHVlKSByZXR1cm47XG4gICAgICAgIHRoaXMuc3RhdGUuYWN0aXZlVGV4dHVyZVVuaXQgPSB2YWx1ZTtcbiAgICAgICAgdGhpcy5nbC5hY3RpdmVUZXh0dXJlKHRoaXMuZ2wuVEVYVFVSRTAgKyB2YWx1ZSk7XG4gICAgfVxuXG4gICAgYmluZEZyYW1lYnVmZmVyKHsgdGFyZ2V0ID0gdGhpcy5nbC5GUkFNRUJVRkZFUiwgYnVmZmVyID0gbnVsbCB9ID0ge30pIHtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuZnJhbWVidWZmZXIgPT09IGJ1ZmZlcikgcmV0dXJuO1xuICAgICAgICB0aGlzLnN0YXRlLmZyYW1lYnVmZmVyID0gYnVmZmVyO1xuICAgICAgICB0aGlzLmdsLmJpbmRGcmFtZWJ1ZmZlcih0YXJnZXQsIGJ1ZmZlcik7XG4gICAgfVxuXG4gICAgZ2V0RXh0ZW5zaW9uKGV4dGVuc2lvbiwgd2ViZ2wyRnVuYywgZXh0RnVuYykge1xuICAgICAgICAvLyBpZiB3ZWJnbDIgZnVuY3Rpb24gc3VwcG9ydGVkLCByZXR1cm4gZnVuYyBib3VuZCB0byBnbCBjb250ZXh0XG4gICAgICAgIGlmICh3ZWJnbDJGdW5jICYmIHRoaXMuZ2xbd2ViZ2wyRnVuY10pIHJldHVybiB0aGlzLmdsW3dlYmdsMkZ1bmNdLmJpbmQodGhpcy5nbCk7XG5cbiAgICAgICAgLy8gZmV0Y2ggZXh0ZW5zaW9uIG9uY2Ugb25seVxuICAgICAgICBpZiAoIXRoaXMuZXh0ZW5zaW9uc1tleHRlbnNpb25dKSB7XG4gICAgICAgICAgICB0aGlzLmV4dGVuc2lvbnNbZXh0ZW5zaW9uXSA9IHRoaXMuZ2wuZ2V0RXh0ZW5zaW9uKGV4dGVuc2lvbik7XG4gICAgICAgIH1cblxuICAgICAgICAvLyByZXR1cm4gZXh0ZW5zaW9uIGlmIG5vIGZ1bmN0aW9uIHJlcXVlc3RlZFxuICAgICAgICBpZiAoIXdlYmdsMkZ1bmMpIHJldHVybiB0aGlzLmV4dGVuc2lvbnNbZXh0ZW5zaW9uXTtcblxuICAgICAgICAvLyBSZXR1cm4gbnVsbCBpZiBleHRlbnNpb24gbm90IHN1cHBvcnRlZFxuICAgICAgICBpZiAoIXRoaXMuZXh0ZW5zaW9uc1tleHRlbnNpb25dKSByZXR1cm4gbnVsbDtcblxuICAgICAgICAvLyByZXR1cm4gZXh0ZW5zaW9uIGZ1bmN0aW9uLCBib3VuZCB0byBleHRlbnNpb25cbiAgICAgICAgcmV0dXJuIHRoaXMuZXh0ZW5zaW9uc1tleHRlbnNpb25dW2V4dEZ1bmNdLmJpbmQodGhpcy5leHRlbnNpb25zW2V4dGVuc2lvbl0pO1xuICAgIH1cblxuICAgIHNvcnRPcGFxdWUoYSwgYikge1xuICAgICAgICBpZiAoYS5yZW5kZXJPcmRlciAhPT0gYi5yZW5kZXJPcmRlcikge1xuICAgICAgICAgICAgcmV0dXJuIGEucmVuZGVyT3JkZXIgLSBiLnJlbmRlck9yZGVyO1xuICAgICAgICB9IGVsc2UgaWYgKGEucHJvZ3JhbS5pZCAhPT0gYi5wcm9ncmFtLmlkKSB7XG4gICAgICAgICAgICByZXR1cm4gYS5wcm9ncmFtLmlkIC0gYi5wcm9ncmFtLmlkO1xuICAgICAgICB9IGVsc2UgaWYgKGEuekRlcHRoICE9PSBiLnpEZXB0aCkge1xuICAgICAgICAgICAgcmV0dXJuIGEuekRlcHRoIC0gYi56RGVwdGg7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gYi5pZCAtIGEuaWQ7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzb3J0VHJhbnNwYXJlbnQoYSwgYikge1xuICAgICAgICBpZiAoYS5yZW5kZXJPcmRlciAhPT0gYi5yZW5kZXJPcmRlcikge1xuICAgICAgICAgICAgcmV0dXJuIGEucmVuZGVyT3JkZXIgLSBiLnJlbmRlck9yZGVyO1xuICAgICAgICB9XG4gICAgICAgIGlmIChhLnpEZXB0aCAhPT0gYi56RGVwdGgpIHtcbiAgICAgICAgICAgIHJldHVybiBiLnpEZXB0aCAtIGEuekRlcHRoO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGIuaWQgLSBhLmlkO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc29ydFVJKGEsIGIpIHtcbiAgICAgICAgaWYgKGEucmVuZGVyT3JkZXIgIT09IGIucmVuZGVyT3JkZXIpIHtcbiAgICAgICAgICAgIHJldHVybiBhLnJlbmRlck9yZGVyIC0gYi5yZW5kZXJPcmRlcjtcbiAgICAgICAgfSBlbHNlIGlmIChhLnByb2dyYW0uaWQgIT09IGIucHJvZ3JhbS5pZCkge1xuICAgICAgICAgICAgcmV0dXJuIGEucHJvZ3JhbS5pZCAtIGIucHJvZ3JhbS5pZDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBiLmlkIC0gYS5pZDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGdldFJlbmRlckxpc3QoeyBzY2VuZSwgY2FtZXJhLCBmcnVzdHVtQ3VsbCwgc29ydCwgb3ZlcnJpZGVQcm9ncmFtIH0pIHtcbiAgICAgICAgbGV0IHJlbmRlckxpc3QgPSBbXTtcbiAgICAgICAgaWYgKGNhbWVyYSAmJiBmcnVzdHVtQ3VsbCkgY2FtZXJhLnVwZGF0ZUZydXN0dW0oKTtcblxuICAgICAgICAvLyBHZXQgdmlzaWJsZVxuICAgICAgICBzY2VuZS50cmF2ZXJzZSgobm9kZSkgPT4ge1xuICAgICAgICAgICAgaWYgKCFub2RlLnZpc2libGUpIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgaWYgKCFub2RlLmRyYXcpIHJldHVybjtcblxuICAgICAgICAgICAgaWYgKGZydXN0dW1DdWxsICYmIG5vZGUuZnJ1c3R1bUN1bGxlZCAmJiBjYW1lcmEpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWNhbWVyYS5mcnVzdHVtSW50ZXJzZWN0c01lc2gobm9kZSkpIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmVuZGVyTGlzdC5wdXNoKG5vZGUpO1xuICAgICAgICB9KTtcblxuICAgICAgICBpZiAoc29ydCkge1xuICAgICAgICAgICAgY29uc3Qgb3BhcXVlID0gW107XG4gICAgICAgICAgICBjb25zdCB0cmFuc3BhcmVudCA9IFtdOyAvLyBkZXB0aFRlc3QgdHJ1ZVxuICAgICAgICAgICAgY29uc3QgdWkgPSBbXTsgLy8gZGVwdGhUZXN0IGZhbHNlXG5cbiAgICAgICAgICAgIHJlbmRlckxpc3QuZm9yRWFjaCgobm9kZSkgPT4ge1xuICAgICAgICAgICAgICAgIC8vIFNwbGl0IGludG8gdGhlIDMgcmVuZGVyIGdyb3Vwc1xuICAgICAgICAgICAgICAgIGlmICghbm9kZS5wcm9ncmFtLnRyYW5zcGFyZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIG9wYXF1ZS5wdXNoKG5vZGUpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAobm9kZS5wcm9ncmFtLmRlcHRoVGVzdCkge1xuICAgICAgICAgICAgICAgICAgICB0cmFuc3BhcmVudC5wdXNoKG5vZGUpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHVpLnB1c2gobm9kZSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgbm9kZS56RGVwdGggPSAwO1xuXG4gICAgICAgICAgICAgICAgLy8gT25seSBjYWxjdWxhdGUgei1kZXB0aCBpZiByZW5kZXJPcmRlciB1bnNldCBhbmQgZGVwdGhUZXN0IGlzIHRydWVcbiAgICAgICAgICAgICAgICBpZiAobm9kZS5yZW5kZXJPcmRlciAhPT0gMCB8fCAhbm9kZS5wcm9ncmFtLmRlcHRoVGVzdCB8fCAhY2FtZXJhKSByZXR1cm47XG5cbiAgICAgICAgICAgICAgICAvLyB1cGRhdGUgei1kZXB0aFxuICAgICAgICAgICAgICAgIG5vZGUud29ybGRNYXRyaXguZ2V0VHJhbnNsYXRpb24odGVtcFZlYzMpO1xuICAgICAgICAgICAgICAgIHRlbXBWZWMzLmFwcGx5TWF0cml4NChjYW1lcmEucHJvamVjdGlvblZpZXdNYXRyaXgpO1xuICAgICAgICAgICAgICAgIG5vZGUuekRlcHRoID0gdGVtcFZlYzMuejtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBvcGFxdWUuc29ydCh0aGlzLnNvcnRPcGFxdWUpO1xuICAgICAgICAgICAgdHJhbnNwYXJlbnQuc29ydCh0aGlzLnNvcnRUcmFuc3BhcmVudCk7XG4gICAgICAgICAgICB1aS5zb3J0KHRoaXMuc29ydFVJKTtcblxuICAgICAgICAgICAgcmVuZGVyTGlzdCA9IG9wYXF1ZS5jb25jYXQodHJhbnNwYXJlbnQsIHVpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByZW5kZXJMaXN0O1xuICAgIH1cblxuICAgIHJlbmRlcih7IHNjZW5lLCBjYW1lcmEsIHRhcmdldCA9IG51bGwsIHVwZGF0ZSA9IHRydWUsIHNvcnQgPSB0cnVlLCBmcnVzdHVtQ3VsbCA9IHRydWUsIGNsZWFyLCBvdmVycmlkZVByb2dyYW0gfSkge1xuICAgICAgICBpZiAodGFyZ2V0ID09PSBudWxsKSB7XG4gICAgICAgICAgICAvLyBtYWtlIHN1cmUgbm8gcmVuZGVyIHRhcmdldCBib3VuZCBzbyBkcmF3cyB0byBjYW52YXNcbiAgICAgICAgICAgIHRoaXMuYmluZEZyYW1lYnVmZmVyKCk7XG4gICAgICAgICAgICB0aGlzLnNldFZpZXdwb3J0KHRoaXMud2lkdGggKiB0aGlzLmRwciwgdGhpcy5oZWlnaHQgKiB0aGlzLmRwcik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBiaW5kIHN1cHBsaWVkIHJlbmRlciB0YXJnZXQgYW5kIHVwZGF0ZSB2aWV3cG9ydFxuICAgICAgICAgICAgdGhpcy5iaW5kRnJhbWVidWZmZXIodGFyZ2V0KTtcbiAgICAgICAgICAgIHRoaXMuc2V0Vmlld3BvcnQodGFyZ2V0LndpZHRoLCB0YXJnZXQuaGVpZ2h0KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChjbGVhciB8fCAodGhpcy5hdXRvQ2xlYXIgJiYgY2xlYXIgIT09IGZhbHNlKSkge1xuICAgICAgICAgICAgLy8gRW5zdXJlIGRlcHRoIGJ1ZmZlciB3cml0aW5nIGlzIGVuYWJsZWQgc28gaXQgY2FuIGJlIGNsZWFyZWRcbiAgICAgICAgICAgIGlmICh0aGlzLmRlcHRoICYmICghdGFyZ2V0IHx8IHRhcmdldC5kZXB0aCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmVuYWJsZSh0aGlzLmdsLkRFUFRIX1RFU1QpO1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0RGVwdGhNYXNrKHRydWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5nbC5jbGVhcihcbiAgICAgICAgICAgICAgICAodGhpcy5jb2xvciA/IHRoaXMuZ2wuQ09MT1JfQlVGRkVSX0JJVCA6IDApIHxcbiAgICAgICAgICAgICAgICAgICAgKHRoaXMuZGVwdGggPyB0aGlzLmdsLkRFUFRIX0JVRkZFUl9CSVQgOiAwKSB8XG4gICAgICAgICAgICAgICAgICAgICh0aGlzLnN0ZW5jaWwgPyB0aGlzLmdsLlNURU5DSUxfQlVGRkVSX0JJVCA6IDApXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gdXBkYXRlcyBhbGwgc2NlbmUgZ3JhcGggbWF0cmljZXNcbiAgICAgICAgaWYgKHVwZGF0ZSkgc2NlbmUudXBkYXRlTWF0cml4V29ybGQoKTtcblxuICAgICAgICAvLyBVcGRhdGUgY2FtZXJhIHNlcGFyYXRlbHksIGluIGNhc2Ugbm90IGluIHNjZW5lIGdyYXBoXG4gICAgICAgIGlmIChjYW1lcmEpIGNhbWVyYS51cGRhdGVNYXRyaXhXb3JsZCgpO1xuXG4gICAgICAgIC8vIEdldCByZW5kZXIgbGlzdCAtIGVudGFpbHMgY3VsbGluZyBhbmQgc29ydGluZ1xuICAgICAgICBjb25zdCByZW5kZXJMaXN0ID0gdGhpcy5nZXRSZW5kZXJMaXN0KHsgc2NlbmUsIGNhbWVyYSwgZnJ1c3R1bUN1bGwsIHNvcnQsIG92ZXJyaWRlUHJvZ3JhbSB9KTtcblxuICAgICAgICByZW5kZXJMaXN0LmZvckVhY2goKG5vZGUpID0+IHtcbiAgICAgICAgICAgIG5vZGUuZHJhdyh7IGNhbWVyYSwgb3ZlcnJpZGVQcm9ncmFtIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG59XG4iLCIvLyBUT0RPOiBkZWxldGUgdGV4dHVyZVxuLy8gVE9ETzogdXNlIHRleFN1YkltYWdlMkQgZm9yIHVwZGF0ZXMgKHZpZGVvIG9yIHdoZW4gbG9hZGVkKVxuLy8gVE9ETzogbmVlZD8gZW5jb2RpbmcgPSBsaW5lYXJFbmNvZGluZ1xuLy8gVE9ETzogc3VwcG9ydCBub24tY29tcHJlc3NlZCBtaXBtYXBzIHVwbG9hZHNcblxuY29uc3QgZW1wdHlQaXhlbCA9IG5ldyBVaW50OEFycmF5KDQpO1xuXG5mdW5jdGlvbiBpc1Bvd2VyT2YyKHZhbHVlKSB7XG4gICAgcmV0dXJuICh2YWx1ZSAmICh2YWx1ZSAtIDEpKSA9PT0gMDtcbn1cblxubGV0IElEID0gMTtcblxuZXhwb3J0IGNsYXNzIFRleHR1cmUge1xuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICBnbCxcbiAgICAgICAge1xuICAgICAgICAgICAgaW1hZ2UsXG4gICAgICAgICAgICB0YXJnZXQgPSBnbC5URVhUVVJFXzJELFxuICAgICAgICAgICAgdHlwZSA9IGdsLlVOU0lHTkVEX0JZVEUsXG4gICAgICAgICAgICBmb3JtYXQgPSBnbC5SR0JBLFxuICAgICAgICAgICAgaW50ZXJuYWxGb3JtYXQgPSBmb3JtYXQsXG4gICAgICAgICAgICB3cmFwUyA9IGdsLkNMQU1QX1RPX0VER0UsXG4gICAgICAgICAgICB3cmFwVCA9IGdsLkNMQU1QX1RPX0VER0UsXG4gICAgICAgICAgICBnZW5lcmF0ZU1pcG1hcHMgPSB0cnVlLFxuICAgICAgICAgICAgbWluRmlsdGVyID0gZ2VuZXJhdGVNaXBtYXBzID8gZ2wuTkVBUkVTVF9NSVBNQVBfTElORUFSIDogZ2wuTElORUFSLFxuICAgICAgICAgICAgbWFnRmlsdGVyID0gZ2wuTElORUFSLFxuICAgICAgICAgICAgcHJlbXVsdGlwbHlBbHBoYSA9IGZhbHNlLFxuICAgICAgICAgICAgdW5wYWNrQWxpZ25tZW50ID0gNCxcbiAgICAgICAgICAgIGZsaXBZID0gdGFyZ2V0ID09IGdsLlRFWFRVUkVfMkQgPyB0cnVlIDogZmFsc2UsXG4gICAgICAgICAgICBhbmlzb3Ryb3B5ID0gMCxcbiAgICAgICAgICAgIGxldmVsID0gMCxcbiAgICAgICAgICAgIHdpZHRoLCAvLyB1c2VkIGZvciBSZW5kZXJUYXJnZXRzIG9yIERhdGEgVGV4dHVyZXNcbiAgICAgICAgICAgIGhlaWdodCA9IHdpZHRoLFxuICAgICAgICB9ID0ge31cbiAgICApIHtcbiAgICAgICAgdGhpcy5nbCA9IGdsO1xuICAgICAgICB0aGlzLmlkID0gSUQrKztcblxuICAgICAgICB0aGlzLmltYWdlID0gaW1hZ2U7XG4gICAgICAgIHRoaXMudGFyZ2V0ID0gdGFyZ2V0O1xuICAgICAgICB0aGlzLnR5cGUgPSB0eXBlO1xuICAgICAgICB0aGlzLmZvcm1hdCA9IGZvcm1hdDtcbiAgICAgICAgdGhpcy5pbnRlcm5hbEZvcm1hdCA9IGludGVybmFsRm9ybWF0O1xuICAgICAgICB0aGlzLm1pbkZpbHRlciA9IG1pbkZpbHRlcjtcbiAgICAgICAgdGhpcy5tYWdGaWx0ZXIgPSBtYWdGaWx0ZXI7XG4gICAgICAgIHRoaXMud3JhcFMgPSB3cmFwUztcbiAgICAgICAgdGhpcy53cmFwVCA9IHdyYXBUO1xuICAgICAgICB0aGlzLmdlbmVyYXRlTWlwbWFwcyA9IGdlbmVyYXRlTWlwbWFwcztcbiAgICAgICAgdGhpcy5wcmVtdWx0aXBseUFscGhhID0gcHJlbXVsdGlwbHlBbHBoYTtcbiAgICAgICAgdGhpcy51bnBhY2tBbGlnbm1lbnQgPSB1bnBhY2tBbGlnbm1lbnQ7XG4gICAgICAgIHRoaXMuZmxpcFkgPSBmbGlwWTtcbiAgICAgICAgdGhpcy5hbmlzb3Ryb3B5ID0gTWF0aC5taW4oYW5pc290cm9weSwgdGhpcy5nbC5yZW5kZXJlci5wYXJhbWV0ZXJzLm1heEFuaXNvdHJvcHkpO1xuICAgICAgICB0aGlzLmxldmVsID0gbGV2ZWw7XG4gICAgICAgIHRoaXMud2lkdGggPSB3aWR0aDtcbiAgICAgICAgdGhpcy5oZWlnaHQgPSBoZWlnaHQ7XG4gICAgICAgIHRoaXMudGV4dHVyZSA9IHRoaXMuZ2wuY3JlYXRlVGV4dHVyZSgpO1xuXG4gICAgICAgIHRoaXMuc3RvcmUgPSB7XG4gICAgICAgICAgICBpbWFnZTogbnVsbCxcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBBbGlhcyBmb3Igc3RhdGUgc3RvcmUgdG8gYXZvaWQgcmVkdW5kYW50IGNhbGxzIGZvciBnbG9iYWwgc3RhdGVcbiAgICAgICAgdGhpcy5nbFN0YXRlID0gdGhpcy5nbC5yZW5kZXJlci5zdGF0ZTtcblxuICAgICAgICAvLyBTdGF0ZSBzdG9yZSB0byBhdm9pZCByZWR1bmRhbnQgY2FsbHMgZm9yIHBlci10ZXh0dXJlIHN0YXRlXG4gICAgICAgIHRoaXMuc3RhdGUgPSB7fTtcbiAgICAgICAgdGhpcy5zdGF0ZS5taW5GaWx0ZXIgPSB0aGlzLmdsLk5FQVJFU1RfTUlQTUFQX0xJTkVBUjtcbiAgICAgICAgdGhpcy5zdGF0ZS5tYWdGaWx0ZXIgPSB0aGlzLmdsLkxJTkVBUjtcbiAgICAgICAgdGhpcy5zdGF0ZS53cmFwUyA9IHRoaXMuZ2wuUkVQRUFUO1xuICAgICAgICB0aGlzLnN0YXRlLndyYXBUID0gdGhpcy5nbC5SRVBFQVQ7XG4gICAgICAgIHRoaXMuc3RhdGUuYW5pc290cm9weSA9IDA7XG4gICAgfVxuXG4gICAgYmluZCgpIHtcbiAgICAgICAgLy8gQWxyZWFkeSBib3VuZCB0byBhY3RpdmUgdGV4dHVyZSB1bml0XG4gICAgICAgIGlmICh0aGlzLmdsU3RhdGUudGV4dHVyZVVuaXRzW3RoaXMuZ2xTdGF0ZS5hY3RpdmVUZXh0dXJlVW5pdF0gPT09IHRoaXMuaWQpIHJldHVybjtcbiAgICAgICAgdGhpcy5nbC5iaW5kVGV4dHVyZSh0aGlzLnRhcmdldCwgdGhpcy50ZXh0dXJlKTtcbiAgICAgICAgdGhpcy5nbFN0YXRlLnRleHR1cmVVbml0c1t0aGlzLmdsU3RhdGUuYWN0aXZlVGV4dHVyZVVuaXRdID0gdGhpcy5pZDtcbiAgICB9XG5cbiAgICB1cGRhdGUodGV4dHVyZVVuaXQgPSAwKSB7XG4gICAgICAgIGNvbnN0IG5lZWRzVXBkYXRlID0gISh0aGlzLmltYWdlID09PSB0aGlzLnN0b3JlLmltYWdlICYmICF0aGlzLm5lZWRzVXBkYXRlKTtcblxuICAgICAgICAvLyBNYWtlIHN1cmUgdGhhdCB0ZXh0dXJlIGlzIGJvdW5kIHRvIGl0cyB0ZXh0dXJlIHVuaXRcbiAgICAgICAgaWYgKG5lZWRzVXBkYXRlIHx8IHRoaXMuZ2xTdGF0ZS50ZXh0dXJlVW5pdHNbdGV4dHVyZVVuaXRdICE9PSB0aGlzLmlkKSB7XG4gICAgICAgICAgICAvLyBzZXQgYWN0aXZlIHRleHR1cmUgdW5pdCB0byBwZXJmb3JtIHRleHR1cmUgZnVuY3Rpb25zXG4gICAgICAgICAgICB0aGlzLmdsLnJlbmRlcmVyLmFjdGl2ZVRleHR1cmUodGV4dHVyZVVuaXQpO1xuICAgICAgICAgICAgdGhpcy5iaW5kKCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIW5lZWRzVXBkYXRlKSByZXR1cm47XG4gICAgICAgIHRoaXMubmVlZHNVcGRhdGUgPSBmYWxzZTtcblxuICAgICAgICBpZiAodGhpcy5mbGlwWSAhPT0gdGhpcy5nbFN0YXRlLmZsaXBZKSB7XG4gICAgICAgICAgICB0aGlzLmdsLnBpeGVsU3RvcmVpKHRoaXMuZ2wuVU5QQUNLX0ZMSVBfWV9XRUJHTCwgdGhpcy5mbGlwWSk7XG4gICAgICAgICAgICB0aGlzLmdsU3RhdGUuZmxpcFkgPSB0aGlzLmZsaXBZO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMucHJlbXVsdGlwbHlBbHBoYSAhPT0gdGhpcy5nbFN0YXRlLnByZW11bHRpcGx5QWxwaGEpIHtcbiAgICAgICAgICAgIHRoaXMuZ2wucGl4ZWxTdG9yZWkodGhpcy5nbC5VTlBBQ0tfUFJFTVVMVElQTFlfQUxQSEFfV0VCR0wsIHRoaXMucHJlbXVsdGlwbHlBbHBoYSk7XG4gICAgICAgICAgICB0aGlzLmdsU3RhdGUucHJlbXVsdGlwbHlBbHBoYSA9IHRoaXMucHJlbXVsdGlwbHlBbHBoYTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLnVucGFja0FsaWdubWVudCAhPT0gdGhpcy5nbFN0YXRlLnVucGFja0FsaWdubWVudCkge1xuICAgICAgICAgICAgdGhpcy5nbC5waXhlbFN0b3JlaSh0aGlzLmdsLlVOUEFDS19BTElHTk1FTlQsIHRoaXMudW5wYWNrQWxpZ25tZW50KTtcbiAgICAgICAgICAgIHRoaXMuZ2xTdGF0ZS51bnBhY2tBbGlnbm1lbnQgPSB0aGlzLnVucGFja0FsaWdubWVudDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLm1pbkZpbHRlciAhPT0gdGhpcy5zdGF0ZS5taW5GaWx0ZXIpIHtcbiAgICAgICAgICAgIHRoaXMuZ2wudGV4UGFyYW1ldGVyaSh0aGlzLnRhcmdldCwgdGhpcy5nbC5URVhUVVJFX01JTl9GSUxURVIsIHRoaXMubWluRmlsdGVyKTtcbiAgICAgICAgICAgIHRoaXMuc3RhdGUubWluRmlsdGVyID0gdGhpcy5taW5GaWx0ZXI7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5tYWdGaWx0ZXIgIT09IHRoaXMuc3RhdGUubWFnRmlsdGVyKSB7XG4gICAgICAgICAgICB0aGlzLmdsLnRleFBhcmFtZXRlcmkodGhpcy50YXJnZXQsIHRoaXMuZ2wuVEVYVFVSRV9NQUdfRklMVEVSLCB0aGlzLm1hZ0ZpbHRlcik7XG4gICAgICAgICAgICB0aGlzLnN0YXRlLm1hZ0ZpbHRlciA9IHRoaXMubWFnRmlsdGVyO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMud3JhcFMgIT09IHRoaXMuc3RhdGUud3JhcFMpIHtcbiAgICAgICAgICAgIHRoaXMuZ2wudGV4UGFyYW1ldGVyaSh0aGlzLnRhcmdldCwgdGhpcy5nbC5URVhUVVJFX1dSQVBfUywgdGhpcy53cmFwUyk7XG4gICAgICAgICAgICB0aGlzLnN0YXRlLndyYXBTID0gdGhpcy53cmFwUztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLndyYXBUICE9PSB0aGlzLnN0YXRlLndyYXBUKSB7XG4gICAgICAgICAgICB0aGlzLmdsLnRleFBhcmFtZXRlcmkodGhpcy50YXJnZXQsIHRoaXMuZ2wuVEVYVFVSRV9XUkFQX1QsIHRoaXMud3JhcFQpO1xuICAgICAgICAgICAgdGhpcy5zdGF0ZS53cmFwVCA9IHRoaXMud3JhcFQ7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5hbmlzb3Ryb3B5ICYmIHRoaXMuYW5pc290cm9weSAhPT0gdGhpcy5zdGF0ZS5hbmlzb3Ryb3B5KSB7XG4gICAgICAgICAgICB0aGlzLmdsLnRleFBhcmFtZXRlcmYoXG4gICAgICAgICAgICAgICAgdGhpcy50YXJnZXQsXG4gICAgICAgICAgICAgICAgdGhpcy5nbC5yZW5kZXJlci5nZXRFeHRlbnNpb24oJ0VYVF90ZXh0dXJlX2ZpbHRlcl9hbmlzb3Ryb3BpYycpLlRFWFRVUkVfTUFYX0FOSVNPVFJPUFlfRVhULFxuICAgICAgICAgICAgICAgIHRoaXMuYW5pc290cm9weVxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIHRoaXMuc3RhdGUuYW5pc290cm9weSA9IHRoaXMuYW5pc290cm9weTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLmltYWdlKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5pbWFnZS53aWR0aCkge1xuICAgICAgICAgICAgICAgIHRoaXMud2lkdGggPSB0aGlzLmltYWdlLndpZHRoO1xuICAgICAgICAgICAgICAgIHRoaXMuaGVpZ2h0ID0gdGhpcy5pbWFnZS5oZWlnaHQ7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0aGlzLnRhcmdldCA9PT0gdGhpcy5nbC5URVhUVVJFX0NVQkVfTUFQKSB7XG4gICAgICAgICAgICAgICAgLy8gRm9yIGN1YmUgbWFwc1xuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgNjsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZ2wudGV4SW1hZ2UyRChcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZ2wuVEVYVFVSRV9DVUJFX01BUF9QT1NJVElWRV9YICsgaSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubGV2ZWwsXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmludGVybmFsRm9ybWF0LFxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5mb3JtYXQsXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnR5cGUsXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmltYWdlW2ldXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmIChBcnJheUJ1ZmZlci5pc1ZpZXcodGhpcy5pbWFnZSkpIHtcbiAgICAgICAgICAgICAgICAvLyBEYXRhIHRleHR1cmVcbiAgICAgICAgICAgICAgICB0aGlzLmdsLnRleEltYWdlMkQodGhpcy50YXJnZXQsIHRoaXMubGV2ZWwsIHRoaXMuaW50ZXJuYWxGb3JtYXQsIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0LCAwLCB0aGlzLmZvcm1hdCwgdGhpcy50eXBlLCB0aGlzLmltYWdlKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5pbWFnZS5pc0NvbXByZXNzZWRUZXh0dXJlKSB7XG4gICAgICAgICAgICAgICAgLy8gQ29tcHJlc3NlZCB0ZXh0dXJlXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgbGV2ZWwgPSAwOyBsZXZlbCA8IHRoaXMuaW1hZ2UubGVuZ3RoOyBsZXZlbCsrKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZ2wuY29tcHJlc3NlZFRleEltYWdlMkQoXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnRhcmdldCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldmVsLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbnRlcm5hbEZvcm1hdCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaW1hZ2VbbGV2ZWxdLndpZHRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbWFnZVtsZXZlbF0uaGVpZ2h0LFxuICAgICAgICAgICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaW1hZ2VbbGV2ZWxdLmRhdGFcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIFJlZ3VsYXIgdGV4dHVyZVxuICAgICAgICAgICAgICAgIHRoaXMuZ2wudGV4SW1hZ2UyRCh0aGlzLnRhcmdldCwgdGhpcy5sZXZlbCwgdGhpcy5pbnRlcm5hbEZvcm1hdCwgdGhpcy5mb3JtYXQsIHRoaXMudHlwZSwgdGhpcy5pbWFnZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0aGlzLmdlbmVyYXRlTWlwbWFwcykge1xuICAgICAgICAgICAgICAgIC8vIEZvciBXZWJHTDEsIGlmIG5vdCBhIHBvd2VyIG9mIDIsIHR1cm4gb2ZmIG1pcHMsIHNldCB3cmFwcGluZyB0byBjbGFtcCB0byBlZGdlIGFuZCBtaW5GaWx0ZXIgdG8gbGluZWFyXG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLmdsLnJlbmRlcmVyLmlzV2ViZ2wyICYmICghaXNQb3dlck9mMih0aGlzLmltYWdlLndpZHRoKSB8fCAhaXNQb3dlck9mMih0aGlzLmltYWdlLmhlaWdodCkpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZ2VuZXJhdGVNaXBtYXBzID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMud3JhcFMgPSB0aGlzLndyYXBUID0gdGhpcy5nbC5DTEFNUF9UT19FREdFO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm1pbkZpbHRlciA9IHRoaXMuZ2wuTElORUFSO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZ2wuZ2VuZXJhdGVNaXBtYXAodGhpcy50YXJnZXQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gQ2FsbGJhY2sgZm9yIHdoZW4gZGF0YSBpcyBwdXNoZWQgdG8gR1BVXG4gICAgICAgICAgICB0aGlzLm9uVXBkYXRlICYmIHRoaXMub25VcGRhdGUoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnRhcmdldCA9PT0gdGhpcy5nbC5URVhUVVJFX0NVQkVfTUFQKSB7XG4gICAgICAgICAgICAgICAgLy8gVXBsb2FkIGVtcHR5IHBpeGVsIGZvciBlYWNoIHNpZGUgd2hpbGUgbm8gaW1hZ2UgdG8gYXZvaWQgZXJyb3JzIHdoaWxlIGltYWdlIG9yIHZpZGVvIGxvYWRpbmdcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDY7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmdsLnRleEltYWdlMkQoXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmdsLlRFWFRVUkVfQ1VCRV9NQVBfUE9TSVRJVkVfWCArIGksXG4gICAgICAgICAgICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5nbC5SR0JBLFxuICAgICAgICAgICAgICAgICAgICAgICAgMSxcbiAgICAgICAgICAgICAgICAgICAgICAgIDEsXG4gICAgICAgICAgICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5nbC5SR0JBLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5nbC5VTlNJR05FRF9CWVRFLFxuICAgICAgICAgICAgICAgICAgICAgICAgZW1wdHlQaXhlbFxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy53aWR0aCkge1xuICAgICAgICAgICAgICAgIC8vIGltYWdlIGludGVudGlvbmFsbHkgbGVmdCBudWxsIGZvciBSZW5kZXJUYXJnZXRcbiAgICAgICAgICAgICAgICB0aGlzLmdsLnRleEltYWdlMkQodGhpcy50YXJnZXQsIHRoaXMubGV2ZWwsIHRoaXMuaW50ZXJuYWxGb3JtYXQsIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0LCAwLCB0aGlzLmZvcm1hdCwgdGhpcy50eXBlLCBudWxsKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gVXBsb2FkIGVtcHR5IHBpeGVsIGlmIG5vIGltYWdlIHRvIGF2b2lkIGVycm9ycyB3aGlsZSBpbWFnZSBvciB2aWRlbyBsb2FkaW5nXG4gICAgICAgICAgICAgICAgdGhpcy5nbC50ZXhJbWFnZTJEKHRoaXMudGFyZ2V0LCAwLCB0aGlzLmdsLlJHQkEsIDEsIDEsIDAsIHRoaXMuZ2wuUkdCQSwgdGhpcy5nbC5VTlNJR05FRF9CWVRFLCBlbXB0eVBpeGVsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aGlzLnN0b3JlLmltYWdlID0gdGhpcy5pbWFnZTtcbiAgICB9XG5cbiAgICBkaXNwb3NlKCkge1xuICAgICAgICB0aGlzLmdsLmRlbGV0ZVRleHR1cmUodGhpcy50ZXh0dXJlKTtcbiAgICAgICAgdGhpcy50ZXh0dXJlID0gbnVsbDtcbiAgICB9XG59XG4iLCJpbXBvcnQgeyBWZWMzIH0gZnJvbSAnLi4vbWF0aC9WZWMzLmpzJztcbmltcG9ydCB7IFF1YXQgfSBmcm9tICcuLi9tYXRoL1F1YXQuanMnO1xuaW1wb3J0IHsgTWF0NCB9IGZyb20gJy4uL21hdGgvTWF0NC5qcyc7XG5pbXBvcnQgeyBFdWxlciB9IGZyb20gJy4uL21hdGgvRXVsZXIuanMnO1xuXG5leHBvcnQgY2xhc3MgVHJhbnNmb3JtIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5wYXJlbnQgPSBudWxsO1xuICAgICAgICB0aGlzLmNoaWxkcmVuID0gW107XG4gICAgICAgIHRoaXMudmlzaWJsZSA9IHRydWU7XG5cbiAgICAgICAgdGhpcy5tYXRyaXggPSBuZXcgTWF0NCgpO1xuICAgICAgICB0aGlzLndvcmxkTWF0cml4ID0gbmV3IE1hdDQoKTtcbiAgICAgICAgdGhpcy5tYXRyaXhBdXRvVXBkYXRlID0gdHJ1ZTtcblxuICAgICAgICB0aGlzLnBvc2l0aW9uID0gbmV3IFZlYzMoKTtcbiAgICAgICAgdGhpcy5xdWF0ZXJuaW9uID0gbmV3IFF1YXQoKTtcbiAgICAgICAgdGhpcy5zY2FsZSA9IG5ldyBWZWMzKDEpO1xuICAgICAgICB0aGlzLnJvdGF0aW9uID0gbmV3IEV1bGVyKCk7XG4gICAgICAgIHRoaXMudXAgPSBuZXcgVmVjMygwLCAxLCAwKTtcblxuICAgICAgICB0aGlzLnJvdGF0aW9uLm9uQ2hhbmdlID0gKCkgPT4gdGhpcy5xdWF0ZXJuaW9uLmZyb21FdWxlcih0aGlzLnJvdGF0aW9uKTtcbiAgICAgICAgdGhpcy5xdWF0ZXJuaW9uLm9uQ2hhbmdlID0gKCkgPT4gdGhpcy5yb3RhdGlvbi5mcm9tUXVhdGVybmlvbih0aGlzLnF1YXRlcm5pb24pO1xuICAgIH1cblxuICAgIHNldFBhcmVudChwYXJlbnQsIG5vdGlmeVBhcmVudCA9IHRydWUpIHtcbiAgICAgICAgaWYgKHRoaXMucGFyZW50ICYmIHBhcmVudCAhPT0gdGhpcy5wYXJlbnQpIHRoaXMucGFyZW50LnJlbW92ZUNoaWxkKHRoaXMsIGZhbHNlKTtcbiAgICAgICAgdGhpcy5wYXJlbnQgPSBwYXJlbnQ7XG4gICAgICAgIGlmIChub3RpZnlQYXJlbnQgJiYgcGFyZW50KSBwYXJlbnQuYWRkQ2hpbGQodGhpcywgZmFsc2UpO1xuICAgIH1cblxuICAgIGFkZENoaWxkKGNoaWxkLCBub3RpZnlDaGlsZCA9IHRydWUpIHtcbiAgICAgICAgaWYgKCF+dGhpcy5jaGlsZHJlbi5pbmRleE9mKGNoaWxkKSkgdGhpcy5jaGlsZHJlbi5wdXNoKGNoaWxkKTtcbiAgICAgICAgaWYgKG5vdGlmeUNoaWxkKSBjaGlsZC5zZXRQYXJlbnQodGhpcywgZmFsc2UpO1xuICAgIH1cblxuICAgIHJlbW92ZUNoaWxkKGNoaWxkLCBub3RpZnlDaGlsZCA9IHRydWUpIHtcbiAgICAgICAgaWYgKCEhfnRoaXMuY2hpbGRyZW4uaW5kZXhPZihjaGlsZCkpIHRoaXMuY2hpbGRyZW4uc3BsaWNlKHRoaXMuY2hpbGRyZW4uaW5kZXhPZihjaGlsZCksIDEpO1xuICAgICAgICBpZiAobm90aWZ5Q2hpbGQpIGNoaWxkLnNldFBhcmVudChudWxsLCBmYWxzZSk7XG4gICAgfVxuXG4gICAgdXBkYXRlTWF0cml4V29ybGQoZm9yY2UpIHtcbiAgICAgICAgaWYgKHRoaXMubWF0cml4QXV0b1VwZGF0ZSkgdGhpcy51cGRhdGVNYXRyaXgoKTtcbiAgICAgICAgaWYgKHRoaXMud29ybGRNYXRyaXhOZWVkc1VwZGF0ZSB8fCBmb3JjZSkge1xuICAgICAgICAgICAgaWYgKHRoaXMucGFyZW50ID09PSBudWxsKSB0aGlzLndvcmxkTWF0cml4LmNvcHkodGhpcy5tYXRyaXgpO1xuICAgICAgICAgICAgZWxzZSB0aGlzLndvcmxkTWF0cml4Lm11bHRpcGx5KHRoaXMucGFyZW50LndvcmxkTWF0cml4LCB0aGlzLm1hdHJpeCk7XG4gICAgICAgICAgICB0aGlzLndvcmxkTWF0cml4TmVlZHNVcGRhdGUgPSBmYWxzZTtcbiAgICAgICAgICAgIGZvcmNlID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAobGV0IGkgPSAwLCBsID0gdGhpcy5jaGlsZHJlbi5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgICAgIHRoaXMuY2hpbGRyZW5baV0udXBkYXRlTWF0cml4V29ybGQoZm9yY2UpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgdXBkYXRlTWF0cml4KCkge1xuICAgICAgICB0aGlzLm1hdHJpeC5jb21wb3NlKHRoaXMucXVhdGVybmlvbiwgdGhpcy5wb3NpdGlvbiwgdGhpcy5zY2FsZSk7XG4gICAgICAgIHRoaXMud29ybGRNYXRyaXhOZWVkc1VwZGF0ZSA9IHRydWU7XG4gICAgfVxuXG4gICAgdHJhdmVyc2UoY2FsbGJhY2spIHtcbiAgICAgICAgLy8gUmV0dXJuIHRydWUgaW4gY2FsbGJhY2sgdG8gc3RvcCB0cmF2ZXJzaW5nIGNoaWxkcmVuXG4gICAgICAgIGlmIChjYWxsYmFjayh0aGlzKSkgcmV0dXJuO1xuICAgICAgICBmb3IgKGxldCBpID0gMCwgbCA9IHRoaXMuY2hpbGRyZW4ubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgICAgICB0aGlzLmNoaWxkcmVuW2ldLnRyYXZlcnNlKGNhbGxiYWNrKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGRlY29tcG9zZSgpIHtcbiAgICAgICAgdGhpcy5tYXRyaXguZ2V0VHJhbnNsYXRpb24odGhpcy5wb3NpdGlvbik7XG4gICAgICAgIHRoaXMubWF0cml4LmdldFJvdGF0aW9uKHRoaXMucXVhdGVybmlvbik7XG4gICAgICAgIHRoaXMubWF0cml4LmdldFNjYWxpbmcodGhpcy5zY2FsZSk7XG4gICAgICAgIHRoaXMucm90YXRpb24uZnJvbVF1YXRlcm5pb24odGhpcy5xdWF0ZXJuaW9uKTtcbiAgICB9XG5cbiAgICBsb29rQXQodGFyZ2V0LCBpbnZlcnQgPSBmYWxzZSkge1xuICAgICAgICBpZiAoaW52ZXJ0KSB0aGlzLm1hdHJpeC5sb29rQXQodGhpcy5wb3NpdGlvbiwgdGFyZ2V0LCB0aGlzLnVwKTtcbiAgICAgICAgZWxzZSB0aGlzLm1hdHJpeC5sb29rQXQodGFyZ2V0LCB0aGlzLnBvc2l0aW9uLCB0aGlzLnVwKTtcbiAgICAgICAgdGhpcy5tYXRyaXguZ2V0Um90YXRpb24odGhpcy5xdWF0ZXJuaW9uKTtcbiAgICAgICAgdGhpcy5yb3RhdGlvbi5mcm9tUXVhdGVybmlvbih0aGlzLnF1YXRlcm5pb24pO1xuICAgIH1cbn1cbiIsImltcG9ydCB7IFZlYzMgfSBmcm9tICcuLi9tYXRoL1ZlYzMuanMnO1xuaW1wb3J0IHsgUXVhdCB9IGZyb20gJy4uL21hdGgvUXVhdC5qcyc7XG5cbmNvbnN0IHByZXZQb3MgPSBuZXcgVmVjMygpO1xuY29uc3QgcHJldlJvdCA9IG5ldyBRdWF0KCk7XG5jb25zdCBwcmV2U2NsID0gbmV3IFZlYzMoKTtcblxuY29uc3QgbmV4dFBvcyA9IG5ldyBWZWMzKCk7XG5jb25zdCBuZXh0Um90ID0gbmV3IFF1YXQoKTtcbmNvbnN0IG5leHRTY2wgPSBuZXcgVmVjMygpO1xuXG5leHBvcnQgY2xhc3MgQW5pbWF0aW9uIHtcbiAgICBjb25zdHJ1Y3Rvcih7IG9iamVjdHMsIGRhdGEgfSkge1xuICAgICAgICB0aGlzLm9iamVjdHMgPSBvYmplY3RzO1xuICAgICAgICB0aGlzLmRhdGEgPSBkYXRhO1xuICAgICAgICB0aGlzLmVsYXBzZWQgPSAwO1xuICAgICAgICB0aGlzLndlaWdodCA9IDE7XG4gICAgICAgIHRoaXMuZHVyYXRpb24gPSBkYXRhLmZyYW1lcy5sZW5ndGggLSAxO1xuICAgIH1cblxuICAgIHVwZGF0ZSh0b3RhbFdlaWdodCA9IDEsIGlzU2V0KSB7XG4gICAgICAgIGNvbnN0IHdlaWdodCA9IGlzU2V0ID8gMSA6IHRoaXMud2VpZ2h0IC8gdG90YWxXZWlnaHQ7XG4gICAgICAgIGNvbnN0IGVsYXBzZWQgPSB0aGlzLmVsYXBzZWQgJSB0aGlzLmR1cmF0aW9uO1xuXG4gICAgICAgIGNvbnN0IGZsb29yRnJhbWUgPSBNYXRoLmZsb29yKGVsYXBzZWQpO1xuICAgICAgICBjb25zdCBibGVuZCA9IGVsYXBzZWQgLSBmbG9vckZyYW1lO1xuICAgICAgICBjb25zdCBwcmV2S2V5ID0gdGhpcy5kYXRhLmZyYW1lc1tmbG9vckZyYW1lXTtcbiAgICAgICAgY29uc3QgbmV4dEtleSA9IHRoaXMuZGF0YS5mcmFtZXNbKGZsb29yRnJhbWUgKyAxKSAlIHRoaXMuZHVyYXRpb25dO1xuXG4gICAgICAgIHRoaXMub2JqZWN0cy5mb3JFYWNoKChvYmplY3QsIGkpID0+IHtcbiAgICAgICAgICAgIHByZXZQb3MuZnJvbUFycmF5KHByZXZLZXkucG9zaXRpb24sIGkgKiAzKTtcbiAgICAgICAgICAgIHByZXZSb3QuZnJvbUFycmF5KHByZXZLZXkucXVhdGVybmlvbiwgaSAqIDQpO1xuICAgICAgICAgICAgcHJldlNjbC5mcm9tQXJyYXkocHJldktleS5zY2FsZSwgaSAqIDMpO1xuXG4gICAgICAgICAgICBuZXh0UG9zLmZyb21BcnJheShuZXh0S2V5LnBvc2l0aW9uLCBpICogMyk7XG4gICAgICAgICAgICBuZXh0Um90LmZyb21BcnJheShuZXh0S2V5LnF1YXRlcm5pb24sIGkgKiA0KTtcbiAgICAgICAgICAgIG5leHRTY2wuZnJvbUFycmF5KG5leHRLZXkuc2NhbGUsIGkgKiAzKTtcblxuICAgICAgICAgICAgcHJldlBvcy5sZXJwKG5leHRQb3MsIGJsZW5kKTtcbiAgICAgICAgICAgIHByZXZSb3Quc2xlcnAobmV4dFJvdCwgYmxlbmQpO1xuICAgICAgICAgICAgcHJldlNjbC5sZXJwKG5leHRTY2wsIGJsZW5kKTtcblxuICAgICAgICAgICAgb2JqZWN0LnBvc2l0aW9uLmxlcnAocHJldlBvcywgd2VpZ2h0KTtcbiAgICAgICAgICAgIG9iamVjdC5xdWF0ZXJuaW9uLnNsZXJwKHByZXZSb3QsIHdlaWdodCk7XG4gICAgICAgICAgICBvYmplY3Quc2NhbGUubGVycChwcmV2U2NsLCB3ZWlnaHQpO1xuICAgICAgICB9KTtcbiAgICB9XG59XG4iLCJpbXBvcnQgeyBHZW9tZXRyeSB9IGZyb20gJy4uL2NvcmUvR2VvbWV0cnkuanMnO1xuaW1wb3J0IHsgUGxhbmUgfSBmcm9tICcuL1BsYW5lLmpzJztcblxuZXhwb3J0IGNsYXNzIEJveCBleHRlbmRzIEdlb21ldHJ5IHtcbiAgICBjb25zdHJ1Y3RvcihnbCwgeyB3aWR0aCA9IDEsIGhlaWdodCA9IDEsIGRlcHRoID0gMSwgd2lkdGhTZWdtZW50cyA9IDEsIGhlaWdodFNlZ21lbnRzID0gMSwgZGVwdGhTZWdtZW50cyA9IDEsIGF0dHJpYnV0ZXMgPSB7fSB9ID0ge30pIHtcbiAgICAgICAgY29uc3Qgd1NlZ3MgPSB3aWR0aFNlZ21lbnRzO1xuICAgICAgICBjb25zdCBoU2VncyA9IGhlaWdodFNlZ21lbnRzO1xuICAgICAgICBjb25zdCBkU2VncyA9IGRlcHRoU2VnbWVudHM7XG5cbiAgICAgICAgY29uc3QgbnVtID0gKHdTZWdzICsgMSkgKiAoaFNlZ3MgKyAxKSAqIDIgKyAod1NlZ3MgKyAxKSAqIChkU2VncyArIDEpICogMiArIChoU2VncyArIDEpICogKGRTZWdzICsgMSkgKiAyO1xuICAgICAgICBjb25zdCBudW1JbmRpY2VzID0gKHdTZWdzICogaFNlZ3MgKiAyICsgd1NlZ3MgKiBkU2VncyAqIDIgKyBoU2VncyAqIGRTZWdzICogMikgKiA2O1xuXG4gICAgICAgIGNvbnN0IHBvc2l0aW9uID0gbmV3IEZsb2F0MzJBcnJheShudW0gKiAzKTtcbiAgICAgICAgY29uc3Qgbm9ybWFsID0gbmV3IEZsb2F0MzJBcnJheShudW0gKiAzKTtcbiAgICAgICAgY29uc3QgdXYgPSBuZXcgRmxvYXQzMkFycmF5KG51bSAqIDIpO1xuICAgICAgICBjb25zdCBpbmRleCA9IG51bSA+IDY1NTM2ID8gbmV3IFVpbnQzMkFycmF5KG51bUluZGljZXMpIDogbmV3IFVpbnQxNkFycmF5KG51bUluZGljZXMpO1xuXG4gICAgICAgIGxldCBpID0gMDtcbiAgICAgICAgbGV0IGlpID0gMDtcblxuICAgICAgICAvLyBsZWZ0LCByaWdodFxuICAgICAgICBQbGFuZS5idWlsZFBsYW5lKHBvc2l0aW9uLCBub3JtYWwsIHV2LCBpbmRleCwgZGVwdGgsIGhlaWdodCwgd2lkdGgsIGRTZWdzLCBoU2VncywgMiwgMSwgMCwgLTEsIC0xLCBpLCBpaSk7XG4gICAgICAgIFBsYW5lLmJ1aWxkUGxhbmUoXG4gICAgICAgICAgICBwb3NpdGlvbixcbiAgICAgICAgICAgIG5vcm1hbCxcbiAgICAgICAgICAgIHV2LFxuICAgICAgICAgICAgaW5kZXgsXG4gICAgICAgICAgICBkZXB0aCxcbiAgICAgICAgICAgIGhlaWdodCxcbiAgICAgICAgICAgIC13aWR0aCxcbiAgICAgICAgICAgIGRTZWdzLFxuICAgICAgICAgICAgaFNlZ3MsXG4gICAgICAgICAgICAyLFxuICAgICAgICAgICAgMSxcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAxLFxuICAgICAgICAgICAgLTEsXG4gICAgICAgICAgICAoaSArPSAoZFNlZ3MgKyAxKSAqIChoU2VncyArIDEpKSxcbiAgICAgICAgICAgIChpaSArPSBkU2VncyAqIGhTZWdzKVxuICAgICAgICApO1xuXG4gICAgICAgIC8vIHRvcCwgYm90dG9tXG4gICAgICAgIFBsYW5lLmJ1aWxkUGxhbmUoXG4gICAgICAgICAgICBwb3NpdGlvbixcbiAgICAgICAgICAgIG5vcm1hbCxcbiAgICAgICAgICAgIHV2LFxuICAgICAgICAgICAgaW5kZXgsXG4gICAgICAgICAgICB3aWR0aCxcbiAgICAgICAgICAgIGRlcHRoLFxuICAgICAgICAgICAgaGVpZ2h0LFxuICAgICAgICAgICAgZFNlZ3MsXG4gICAgICAgICAgICBoU2VncyxcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAyLFxuICAgICAgICAgICAgMSxcbiAgICAgICAgICAgIDEsXG4gICAgICAgICAgICAxLFxuICAgICAgICAgICAgKGkgKz0gKGRTZWdzICsgMSkgKiAoaFNlZ3MgKyAxKSksXG4gICAgICAgICAgICAoaWkgKz0gZFNlZ3MgKiBoU2VncylcbiAgICAgICAgKTtcbiAgICAgICAgUGxhbmUuYnVpbGRQbGFuZShcbiAgICAgICAgICAgIHBvc2l0aW9uLFxuICAgICAgICAgICAgbm9ybWFsLFxuICAgICAgICAgICAgdXYsXG4gICAgICAgICAgICBpbmRleCxcbiAgICAgICAgICAgIHdpZHRoLFxuICAgICAgICAgICAgZGVwdGgsXG4gICAgICAgICAgICAtaGVpZ2h0LFxuICAgICAgICAgICAgZFNlZ3MsXG4gICAgICAgICAgICBoU2VncyxcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAyLFxuICAgICAgICAgICAgMSxcbiAgICAgICAgICAgIDEsXG4gICAgICAgICAgICAtMSxcbiAgICAgICAgICAgIChpICs9ICh3U2VncyArIDEpICogKGRTZWdzICsgMSkpLFxuICAgICAgICAgICAgKGlpICs9IHdTZWdzICogZFNlZ3MpXG4gICAgICAgICk7XG5cbiAgICAgICAgLy8gZnJvbnQsIGJhY2tcbiAgICAgICAgUGxhbmUuYnVpbGRQbGFuZShcbiAgICAgICAgICAgIHBvc2l0aW9uLFxuICAgICAgICAgICAgbm9ybWFsLFxuICAgICAgICAgICAgdXYsXG4gICAgICAgICAgICBpbmRleCxcbiAgICAgICAgICAgIHdpZHRoLFxuICAgICAgICAgICAgaGVpZ2h0LFxuICAgICAgICAgICAgLWRlcHRoLFxuICAgICAgICAgICAgd1NlZ3MsXG4gICAgICAgICAgICBoU2VncyxcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAxLFxuICAgICAgICAgICAgMixcbiAgICAgICAgICAgIC0xLFxuICAgICAgICAgICAgLTEsXG4gICAgICAgICAgICAoaSArPSAod1NlZ3MgKyAxKSAqIChkU2VncyArIDEpKSxcbiAgICAgICAgICAgIChpaSArPSB3U2VncyAqIGRTZWdzKVxuICAgICAgICApO1xuICAgICAgICBQbGFuZS5idWlsZFBsYW5lKFxuICAgICAgICAgICAgcG9zaXRpb24sXG4gICAgICAgICAgICBub3JtYWwsXG4gICAgICAgICAgICB1dixcbiAgICAgICAgICAgIGluZGV4LFxuICAgICAgICAgICAgd2lkdGgsXG4gICAgICAgICAgICBoZWlnaHQsXG4gICAgICAgICAgICBkZXB0aCxcbiAgICAgICAgICAgIHdTZWdzLFxuICAgICAgICAgICAgaFNlZ3MsXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgMSxcbiAgICAgICAgICAgIDIsXG4gICAgICAgICAgICAxLFxuICAgICAgICAgICAgLTEsXG4gICAgICAgICAgICAoaSArPSAod1NlZ3MgKyAxKSAqIChoU2VncyArIDEpKSxcbiAgICAgICAgICAgIChpaSArPSB3U2VncyAqIGhTZWdzKVxuICAgICAgICApO1xuXG4gICAgICAgIE9iamVjdC5hc3NpZ24oYXR0cmlidXRlcywge1xuICAgICAgICAgICAgcG9zaXRpb246IHsgc2l6ZTogMywgZGF0YTogcG9zaXRpb24gfSxcbiAgICAgICAgICAgIG5vcm1hbDogeyBzaXplOiAzLCBkYXRhOiBub3JtYWwgfSxcbiAgICAgICAgICAgIHV2OiB7IHNpemU6IDIsIGRhdGE6IHV2IH0sXG4gICAgICAgICAgICBpbmRleDogeyBkYXRhOiBpbmRleCB9LFxuICAgICAgICB9KTtcblxuICAgICAgICBzdXBlcihnbCwgYXR0cmlidXRlcyk7XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgVmVjMyB9IGZyb20gJy4uL21hdGgvVmVjMy5qcyc7XG5cbmNvbnN0IENBVE1VTExST00gPSAnY2F0bXVsbHJvbSc7XG5jb25zdCBDVUJJQ0JFWklFUiA9ICdjdWJpY2Jlemllcic7XG5jb25zdCBRVUFEUkFUSUNCRVpJRVIgPSAncXVhZHJhdGljYmV6aWVyJztcblxuLy8gdGVtcFxuY29uc3QgX2EwID0gbmV3IFZlYzMoKSxcbiAgICBfYTEgPSBuZXcgVmVjMygpLFxuICAgIF9hMiA9IG5ldyBWZWMzKCksXG4gICAgX2EzID0gbmV3IFZlYzMoKTtcblxuLyoqXG4gKiBHZXQgdGhlIGNvbnRyb2wgcG9pbnRzIG9mIGN1YmljIGJlemllciBjdXJ2ZS5cbiAqIEBwYXJhbSB7Kn0gaVxuICogQHBhcmFtIHsqfSBhXG4gKiBAcGFyYW0geyp9IGJcbiAqL1xuZnVuY3Rpb24gZ2V0Q3RybFBvaW50KHBvaW50cywgaSwgYSA9IDAuMTY4LCBiID0gMC4xNjgpIHtcbiAgICBpZiAoaSA8IDEpIHtcbiAgICAgICAgX2EwLnN1Yihwb2ludHNbMV0sIHBvaW50c1swXSkuc2NhbGUoYSkuYWRkKHBvaW50c1swXSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgX2EwLnN1Yihwb2ludHNbaSArIDFdLCBwb2ludHNbaSAtIDFdKVxuICAgICAgICAgICAgLnNjYWxlKGEpXG4gICAgICAgICAgICAuYWRkKHBvaW50c1tpXSk7XG4gICAgfVxuICAgIGlmIChpID4gcG9pbnRzLmxlbmd0aCAtIDMpIHtcbiAgICAgICAgY29uc3QgbGFzdCA9IHBvaW50cy5sZW5ndGggLSAxO1xuICAgICAgICBfYTEuc3ViKHBvaW50c1tsYXN0IC0gMV0sIHBvaW50c1tsYXN0XSlcbiAgICAgICAgICAgIC5zY2FsZShiKVxuICAgICAgICAgICAgLmFkZChwb2ludHNbbGFzdF0pO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIF9hMS5zdWIocG9pbnRzW2ldLCBwb2ludHNbaSArIDJdKVxuICAgICAgICAgICAgLnNjYWxlKGIpXG4gICAgICAgICAgICAuYWRkKHBvaW50c1tpICsgMV0pO1xuICAgIH1cbiAgICByZXR1cm4gW19hMC5jbG9uZSgpLCBfYTEuY2xvbmUoKV07XG59XG5cbmZ1bmN0aW9uIGdldFF1YWRyYXRpY0JlemllclBvaW50KHQsIHAwLCBjMCwgcDEpIHtcbiAgICBjb25zdCBrID0gMSAtIHQ7XG4gICAgX2EwLmNvcHkocDApLnNjYWxlKGsgKiogMik7XG4gICAgX2ExLmNvcHkoYzApLnNjYWxlKDIgKiBrICogdCk7XG4gICAgX2EyLmNvcHkocDEpLnNjYWxlKHQgKiogMik7XG4gICAgY29uc3QgcmV0ID0gbmV3IFZlYzMoKTtcbiAgICByZXQuYWRkKF9hMCwgX2ExKS5hZGQoX2EyKTtcbiAgICByZXR1cm4gcmV0O1xufVxuXG5mdW5jdGlvbiBnZXRDdWJpY0JlemllclBvaW50KHQsIHAwLCBjMCwgYzEsIHAxKSB7XG4gICAgY29uc3QgayA9IDEgLSB0O1xuICAgIF9hMC5jb3B5KHAwKS5zY2FsZShrICoqIDMpO1xuICAgIF9hMS5jb3B5KGMwKS5zY2FsZSgzICogayAqKiAyICogdCk7XG4gICAgX2EyLmNvcHkoYzEpLnNjYWxlKDMgKiBrICogdCAqKiAyKTtcbiAgICBfYTMuY29weShwMSkuc2NhbGUodCAqKiAzKTtcbiAgICBjb25zdCByZXQgPSBuZXcgVmVjMygpO1xuICAgIHJldC5hZGQoX2EwLCBfYTEpLmFkZChfYTIpLmFkZChfYTMpO1xuICAgIHJldHVybiByZXQ7XG59XG5cbmV4cG9ydCBjbGFzcyBDdXJ2ZSB7XG4gICAgY29uc3RydWN0b3IoeyBwb2ludHMgPSBbbmV3IFZlYzMoMCwgMCwgMCksIG5ldyBWZWMzKDAsIDEsIDApLCBuZXcgVmVjMygxLCAxLCAwKSwgbmV3IFZlYzMoMSwgMCwgMCldLCBkaXZpc2lvbnMgPSAxMiwgdHlwZSA9IENBVE1VTExST00gfSA9IHt9KSB7XG4gICAgICAgIHRoaXMucG9pbnRzID0gcG9pbnRzO1xuICAgICAgICB0aGlzLmRpdmlzaW9ucyA9IGRpdmlzaW9ucztcbiAgICAgICAgdGhpcy50eXBlID0gdHlwZTtcbiAgICB9XG5cbiAgICBfZ2V0UXVhZHJhdGljQmV6aWVyUG9pbnRzKGRpdmlzaW9ucyA9IHRoaXMuZGl2aXNpb25zKSB7XG4gICAgICAgIGNvbnN0IHBvaW50cyA9IFtdO1xuICAgICAgICBjb25zdCBjb3VudCA9IHRoaXMucG9pbnRzLmxlbmd0aDtcblxuICAgICAgICBpZiAoY291bnQgPCAzKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oJ05vdCBlbm91Z2ggcG9pbnRzIHByb3ZpZGVkLicpO1xuICAgICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgcDAgPSB0aGlzLnBvaW50c1swXTtcbiAgICAgICAgbGV0IGMwID0gdGhpcy5wb2ludHNbMV0sXG4gICAgICAgICAgICBwMSA9IHRoaXMucG9pbnRzWzJdO1xuXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDw9IGRpdmlzaW9uczsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBwID0gZ2V0UXVhZHJhdGljQmV6aWVyUG9pbnQoaSAvIGRpdmlzaW9ucywgcDAsIGMwLCBwMSk7XG4gICAgICAgICAgICBwb2ludHMucHVzaChwKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBvZmZzZXQgPSAzO1xuICAgICAgICB3aGlsZSAoY291bnQgLSBvZmZzZXQgPiAwKSB7XG4gICAgICAgICAgICBwMC5jb3B5KHAxKTtcbiAgICAgICAgICAgIGMwID0gcDEuc2NhbGUoMikuc3ViKGMwKTtcbiAgICAgICAgICAgIHAxID0gdGhpcy5wb2ludHNbb2Zmc2V0XTtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAxOyBpIDw9IGRpdmlzaW9uczsgaSsrKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcCA9IGdldFF1YWRyYXRpY0JlemllclBvaW50KGkgLyBkaXZpc2lvbnMsIHAwLCBjMCwgcDEpO1xuICAgICAgICAgICAgICAgIHBvaW50cy5wdXNoKHApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgb2Zmc2V0Kys7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcG9pbnRzO1xuICAgIH1cblxuICAgIF9nZXRDdWJpY0JlemllclBvaW50cyhkaXZpc2lvbnMgPSB0aGlzLmRpdmlzaW9ucykge1xuICAgICAgICBjb25zdCBwb2ludHMgPSBbXTtcbiAgICAgICAgY29uc3QgY291bnQgPSB0aGlzLnBvaW50cy5sZW5ndGg7XG5cbiAgICAgICAgaWYgKGNvdW50IDwgNCkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKCdOb3QgZW5vdWdoIHBvaW50cyBwcm92aWRlZC4nKTtcbiAgICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBwMCA9IHRoaXMucG9pbnRzWzBdLFxuICAgICAgICAgICAgYzAgPSB0aGlzLnBvaW50c1sxXSxcbiAgICAgICAgICAgIGMxID0gdGhpcy5wb2ludHNbMl0sXG4gICAgICAgICAgICBwMSA9IHRoaXMucG9pbnRzWzNdO1xuXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDw9IGRpdmlzaW9uczsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBwID0gZ2V0Q3ViaWNCZXppZXJQb2ludChpIC8gZGl2aXNpb25zLCBwMCwgYzAsIGMxLCBwMSk7XG4gICAgICAgICAgICBwb2ludHMucHVzaChwKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBvZmZzZXQgPSA0O1xuICAgICAgICB3aGlsZSAoY291bnQgLSBvZmZzZXQgPiAxKSB7XG4gICAgICAgICAgICBwMC5jb3B5KHAxKTtcbiAgICAgICAgICAgIGMwID0gcDEuc2NhbGUoMikuc3ViKGMxKTtcbiAgICAgICAgICAgIGMxID0gdGhpcy5wb2ludHNbb2Zmc2V0XTtcbiAgICAgICAgICAgIHAxID0gdGhpcy5wb2ludHNbb2Zmc2V0ICsgMV07XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMTsgaSA8PSBkaXZpc2lvbnM7IGkrKykge1xuICAgICAgICAgICAgICAgIGNvbnN0IHAgPSBnZXRDdWJpY0JlemllclBvaW50KGkgLyBkaXZpc2lvbnMsIHAwLCBjMCwgYzEsIHAxKTtcbiAgICAgICAgICAgICAgICBwb2ludHMucHVzaChwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG9mZnNldCArPSAyO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHBvaW50cztcbiAgICB9XG5cbiAgICBfZ2V0Q2F0bXVsbFJvbVBvaW50cyhkaXZpc2lvbnMgPSB0aGlzLmRpdmlzaW9ucywgYSA9IDAuMTY4LCBiID0gMC4xNjgpIHtcbiAgICAgICAgY29uc3QgcG9pbnRzID0gW107XG4gICAgICAgIGNvbnN0IGNvdW50ID0gdGhpcy5wb2ludHMubGVuZ3RoO1xuXG4gICAgICAgIGlmIChjb3VudCA8PSAyKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5wb2ludHM7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgcDA7XG4gICAgICAgIHRoaXMucG9pbnRzLmZvckVhY2goKHAsIGkpID0+IHtcbiAgICAgICAgICAgIGlmIChpID09PSAwKSB7XG4gICAgICAgICAgICAgICAgcDAgPSBwO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zdCBbYzAsIGMxXSA9IGdldEN0cmxQb2ludCh0aGlzLnBvaW50cywgaSAtIDEsIGEsIGIpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGMgPSBuZXcgQ3VydmUoe1xuICAgICAgICAgICAgICAgICAgICBwb2ludHM6IFtwMCwgYzAsIGMxLCBwXSxcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogQ1VCSUNCRVpJRVIsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgcG9pbnRzLnBvcCgpO1xuICAgICAgICAgICAgICAgIHBvaW50cy5wdXNoKC4uLmMuZ2V0UG9pbnRzKGRpdmlzaW9ucykpO1xuICAgICAgICAgICAgICAgIHAwID0gcDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHBvaW50cztcbiAgICB9XG5cbiAgICBnZXRQb2ludHMoZGl2aXNpb25zID0gdGhpcy5kaXZpc2lvbnMsIGEgPSAwLjE2OCwgYiA9IDAuMTY4KSB7XG4gICAgICAgIGNvbnN0IHR5cGUgPSB0aGlzLnR5cGU7XG5cbiAgICAgICAgaWYgKHR5cGUgPT09IFFVQURSQVRJQ0JFWklFUikge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2dldFF1YWRyYXRpY0JlemllclBvaW50cyhkaXZpc2lvbnMpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHR5cGUgPT09IENVQklDQkVaSUVSKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fZ2V0Q3ViaWNCZXppZXJQb2ludHMoZGl2aXNpb25zKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0eXBlID09PSBDQVRNVUxMUk9NKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fZ2V0Q2F0bXVsbFJvbVBvaW50cyhkaXZpc2lvbnMsIGEsIGIpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXMucG9pbnRzO1xuICAgIH1cbn1cblxuQ3VydmUuQ0FUTVVMTFJPTSA9IENBVE1VTExST007XG5DdXJ2ZS5DVUJJQ0JFWklFUiA9IENVQklDQkVaSUVSO1xuQ3VydmUuUVVBRFJBVElDQkVaSUVSID0gUVVBRFJBVElDQkVaSUVSO1xuIiwiaW1wb3J0IHsgR2VvbWV0cnkgfSBmcm9tICcuLi9jb3JlL0dlb21ldHJ5LmpzJztcbmltcG9ydCB7IFZlYzMgfSBmcm9tICcuLi9tYXRoL1ZlYzMuanMnO1xuXG5leHBvcnQgY2xhc3MgQ3lsaW5kZXIgZXh0ZW5kcyBHZW9tZXRyeSB7XG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIGdsLFxuICAgICAgICB7XG4gICAgICAgICAgICByYWRpdXNUb3AgPSAwLjUsXG4gICAgICAgICAgICByYWRpdXNCb3R0b20gPSAwLjUsXG4gICAgICAgICAgICBoZWlnaHQgPSAxLFxuICAgICAgICAgICAgcmFkaWFsU2VnbWVudHMgPSA4LFxuICAgICAgICAgICAgaGVpZ2h0U2VnbWVudHMgPSAxLFxuICAgICAgICAgICAgb3BlbkVuZGVkID0gZmFsc2UsXG4gICAgICAgICAgICB0aGV0YVN0YXJ0ID0gMCxcbiAgICAgICAgICAgIHRoZXRhTGVuZ3RoID0gTWF0aC5QSSAqIDIsXG4gICAgICAgICAgICBhdHRyaWJ1dGVzID0ge30sXG4gICAgICAgIH0gPSB7fVxuICAgICkge1xuICAgICAgICBjb25zdCByU2VncyA9IHJhZGlhbFNlZ21lbnRzO1xuICAgICAgICBjb25zdCBoU2VncyA9IGhlaWdodFNlZ21lbnRzO1xuICAgICAgICBjb25zdCB0U3RhcnQgPSB0aGV0YVN0YXJ0O1xuICAgICAgICBjb25zdCB0TGVuZ3RoID0gdGhldGFMZW5ndGg7XG5cbiAgICAgICAgY29uc3QgbnVtQ2FwcyA9IG9wZW5FbmRlZCA/IDAgOiByYWRpdXNCb3R0b20gJiYgcmFkaXVzVG9wID8gMiA6IDE7XG4gICAgICAgIGNvbnN0IG51bSA9IChyU2VncyArIDEpICogKGhTZWdzICsgMSArIG51bUNhcHMpICsgbnVtQ2FwcztcbiAgICAgICAgY29uc3QgbnVtSW5kaWNlcyA9IHJTZWdzICogaFNlZ3MgKiA2ICsgbnVtQ2FwcyAqIHJTZWdzICogMztcblxuICAgICAgICBjb25zdCBwb3NpdGlvbiA9IG5ldyBGbG9hdDMyQXJyYXkobnVtICogMyk7XG4gICAgICAgIGNvbnN0IG5vcm1hbCA9IG5ldyBGbG9hdDMyQXJyYXkobnVtICogMyk7XG4gICAgICAgIGNvbnN0IHV2ID0gbmV3IEZsb2F0MzJBcnJheShudW0gKiAyKTtcbiAgICAgICAgY29uc3QgaW5kZXggPSBudW0gPiA2NTUzNiA/IG5ldyBVaW50MzJBcnJheShudW1JbmRpY2VzKSA6IG5ldyBVaW50MTZBcnJheShudW1JbmRpY2VzKTtcblxuICAgICAgICBsZXQgaSA9IDA7XG4gICAgICAgIGxldCBpaSA9IDA7XG4gICAgICAgIGNvbnN0IGluZGV4QXJyYXkgPSBbXTtcblxuICAgICAgICBhZGRIZWlnaHQoKTtcbiAgICAgICAgaWYgKCFvcGVuRW5kZWQpIHtcbiAgICAgICAgICAgIGlmIChyYWRpdXNUb3ApIGFkZENhcCh0cnVlKTtcbiAgICAgICAgICAgIGlmIChyYWRpdXNCb3R0b20pIGFkZENhcChmYWxzZSk7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBhZGRIZWlnaHQoKSB7XG4gICAgICAgICAgICBsZXQgeCwgeTtcbiAgICAgICAgICAgIGNvbnN0IG4gPSBuZXcgVmVjMygpO1xuICAgICAgICAgICAgY29uc3Qgc2xvcGUgPSAocmFkaXVzQm90dG9tIC0gcmFkaXVzVG9wKSAvIGhlaWdodDtcblxuICAgICAgICAgICAgZm9yICh5ID0gMDsgeSA8PSBoU2VnczsgeSsrKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgaW5kZXhSb3cgPSBbXTtcbiAgICAgICAgICAgICAgICBjb25zdCB2ID0geSAvIGhTZWdzO1xuXG4gICAgICAgICAgICAgICAgY29uc3QgciA9IHYgKiAocmFkaXVzQm90dG9tIC0gcmFkaXVzVG9wKSArIHJhZGl1c1RvcDtcbiAgICAgICAgICAgICAgICBmb3IgKHggPSAwOyB4IDw9IHJTZWdzOyB4KyspIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdSA9IHggLyByU2VncztcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdGhldGEgPSB1ICogdExlbmd0aCArIHRTdGFydDtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc2luVGhldGEgPSBNYXRoLnNpbih0aGV0YSk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvc1RoZXRhID0gTWF0aC5jb3ModGhldGEpO1xuXG4gICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uLnNldChbciAqIHNpblRoZXRhLCAoMC41IC0gdikgKiBoZWlnaHQsIHIgKiBjb3NUaGV0YV0sIGkgKiAzKTtcbiAgICAgICAgICAgICAgICAgICAgbi5zZXQoc2luVGhldGEsIHNsb3BlLCBjb3NUaGV0YSkubm9ybWFsaXplKCk7XG4gICAgICAgICAgICAgICAgICAgIG5vcm1hbC5zZXQoW24ueCwgbi55LCBuLnpdLCBpICogMyk7XG4gICAgICAgICAgICAgICAgICAgIHV2LnNldChbdSwgMSAtIHZdLCBpICogMik7XG4gICAgICAgICAgICAgICAgICAgIGluZGV4Um93LnB1c2goaSsrKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaW5kZXhBcnJheS5wdXNoKGluZGV4Um93KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZm9yICh4ID0gMDsgeCA8IHJTZWdzOyB4KyspIHtcbiAgICAgICAgICAgICAgICBmb3IgKHkgPSAwOyB5IDwgaFNlZ3M7IHkrKykge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBhID0gaW5kZXhBcnJheVt5XVt4XTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgYiA9IGluZGV4QXJyYXlbeSArIDFdW3hdO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBjID0gaW5kZXhBcnJheVt5ICsgMV1beCArIDFdO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBkID0gaW5kZXhBcnJheVt5XVt4ICsgMV07XG5cbiAgICAgICAgICAgICAgICAgICAgaW5kZXguc2V0KFthLCBiLCBkLCBiLCBjLCBkXSwgaWkgKiAzKTtcbiAgICAgICAgICAgICAgICAgICAgaWkgKz0gMjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBhZGRDYXAoaXNUb3ApIHtcbiAgICAgICAgICAgIGxldCB4O1xuICAgICAgICAgICAgY29uc3QgciA9IGlzVG9wID09PSB0cnVlID8gcmFkaXVzVG9wIDogcmFkaXVzQm90dG9tO1xuICAgICAgICAgICAgY29uc3Qgc2lnbiA9IGlzVG9wID09PSB0cnVlID8gMSA6IC0xO1xuXG4gICAgICAgICAgICBjb25zdCBjZW50ZXJJbmRleCA9IGk7XG4gICAgICAgICAgICBwb3NpdGlvbi5zZXQoWzAsIDAuNSAqIGhlaWdodCAqIHNpZ24sIDBdLCBpICogMyk7XG4gICAgICAgICAgICBub3JtYWwuc2V0KFswLCBzaWduLCAwXSwgaSAqIDMpO1xuICAgICAgICAgICAgdXYuc2V0KFswLjUsIDAuNV0sIGkgKiAyKTtcbiAgICAgICAgICAgIGkrKztcblxuICAgICAgICAgICAgZm9yICh4ID0gMDsgeCA8PSByU2VnczsgeCsrKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgdSA9IHggLyByU2VncztcbiAgICAgICAgICAgICAgICBjb25zdCB0aGV0YSA9IHUgKiB0TGVuZ3RoICsgdFN0YXJ0O1xuICAgICAgICAgICAgICAgIGNvbnN0IGNvc1RoZXRhID0gTWF0aC5jb3ModGhldGEpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHNpblRoZXRhID0gTWF0aC5zaW4odGhldGEpO1xuXG4gICAgICAgICAgICAgICAgcG9zaXRpb24uc2V0KFtyICogc2luVGhldGEsIDAuNSAqIGhlaWdodCAqIHNpZ24sIHIgKiBjb3NUaGV0YV0sIGkgKiAzKTtcbiAgICAgICAgICAgICAgICBub3JtYWwuc2V0KFswLCBzaWduLCAwXSwgaSAqIDMpO1xuICAgICAgICAgICAgICAgIHV2LnNldChbY29zVGhldGEgKiAwLjUgKyAwLjUsIHNpblRoZXRhICogMC41ICogc2lnbiArIDAuNV0sIGkgKiAyKTtcbiAgICAgICAgICAgICAgICBpKys7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZvciAoeCA9IDA7IHggPCByU2VnczsgeCsrKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgaiA9IGNlbnRlckluZGV4ICsgeCArIDE7XG4gICAgICAgICAgICAgICAgaWYgKGlzVG9wKSB7XG4gICAgICAgICAgICAgICAgICAgIGluZGV4LnNldChbaiwgaiArIDEsIGNlbnRlckluZGV4XSwgaWkgKiAzKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBpbmRleC5zZXQoW2ogKyAxLCBqLCBjZW50ZXJJbmRleF0sIGlpICogMyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlpKys7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBPYmplY3QuYXNzaWduKGF0dHJpYnV0ZXMsIHtcbiAgICAgICAgICAgIHBvc2l0aW9uOiB7IHNpemU6IDMsIGRhdGE6IHBvc2l0aW9uIH0sXG4gICAgICAgICAgICBub3JtYWw6IHsgc2l6ZTogMywgZGF0YTogbm9ybWFsIH0sXG4gICAgICAgICAgICB1djogeyBzaXplOiAyLCBkYXRhOiB1diB9LFxuICAgICAgICAgICAgaW5kZXg6IHsgZGF0YTogaW5kZXggfSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgc3VwZXIoZ2wsIGF0dHJpYnV0ZXMpO1xuICAgIH1cbn1cbiIsImltcG9ydCB7IFJlbmRlclRhcmdldCB9IGZyb20gJy4uL2NvcmUvUmVuZGVyVGFyZ2V0LmpzJztcbmltcG9ydCB7IFByb2dyYW0gfSBmcm9tICcuLi9jb3JlL1Byb2dyYW0uanMnO1xuaW1wb3J0IHsgTWVzaCB9IGZyb20gJy4uL2NvcmUvTWVzaC5qcyc7XG5pbXBvcnQgeyBWZWMyIH0gZnJvbSAnLi4vbWF0aC9WZWMyLmpzJztcbmltcG9ydCB7IFRyaWFuZ2xlIH0gZnJvbSAnLi9UcmlhbmdsZS5qcyc7XG5cbmV4cG9ydCBjbGFzcyBGbG93bWFwIHtcbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgZ2wsXG4gICAgICAgIHtcbiAgICAgICAgICAgIHNpemUgPSAxMjgsIC8vIGRlZmF1bHQgc2l6ZSBvZiB0aGUgcmVuZGVyIHRhcmdldHNcbiAgICAgICAgICAgIGZhbGxvZmYgPSAwLjMsIC8vIHNpemUgb2YgdGhlIHN0YW1wLCBwZXJjZW50YWdlIG9mIHRoZSBzaXplXG4gICAgICAgICAgICBhbHBoYSA9IDEsIC8vIG9wYWNpdHkgb2YgdGhlIHN0YW1wXG4gICAgICAgICAgICBkaXNzaXBhdGlvbiA9IDAuOTgsIC8vIGFmZmVjdHMgdGhlIHNwZWVkIHRoYXQgdGhlIHN0YW1wIGZhZGVzLiBDbG9zZXIgdG8gMSBpcyBzbG93ZXJcbiAgICAgICAgICAgIHR5cGUsIC8vIFBhc3MgaW4gZ2wuRkxPQVQgdG8gZm9yY2UgaXQsIGRlZmF1bHRzIHRvIGdsLkhBTEZfRkxPQVRcbiAgICAgICAgfSA9IHt9XG4gICAgKSB7XG4gICAgICAgIGNvbnN0IF90aGlzID0gdGhpcztcbiAgICAgICAgdGhpcy5nbCA9IGdsO1xuXG4gICAgICAgIC8vIG91dHB1dCB1bmlmb3JtIGNvbnRhaW5pbmcgcmVuZGVyIHRhcmdldCB0ZXh0dXJlc1xuICAgICAgICB0aGlzLnVuaWZvcm0gPSB7IHZhbHVlOiBudWxsIH07XG5cbiAgICAgICAgdGhpcy5tYXNrID0ge1xuICAgICAgICAgICAgcmVhZDogbnVsbCxcbiAgICAgICAgICAgIHdyaXRlOiBudWxsLFxuXG4gICAgICAgICAgICAvLyBIZWxwZXIgZnVuY3Rpb24gdG8gcGluZyBwb25nIHRoZSByZW5kZXIgdGFyZ2V0cyBhbmQgdXBkYXRlIHRoZSB1bmlmb3JtXG4gICAgICAgICAgICBzd2FwOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IHRlbXAgPSBfdGhpcy5tYXNrLnJlYWQ7XG4gICAgICAgICAgICAgICAgX3RoaXMubWFzay5yZWFkID0gX3RoaXMubWFzay53cml0ZTtcbiAgICAgICAgICAgICAgICBfdGhpcy5tYXNrLndyaXRlID0gdGVtcDtcbiAgICAgICAgICAgICAgICBfdGhpcy51bmlmb3JtLnZhbHVlID0gX3RoaXMubWFzay5yZWFkLnRleHR1cmU7XG4gICAgICAgICAgICB9LFxuICAgICAgICB9O1xuXG4gICAgICAgIHtcbiAgICAgICAgICAgIGNyZWF0ZUZCT3MoKTtcblxuICAgICAgICAgICAgdGhpcy5hc3BlY3QgPSAxO1xuICAgICAgICAgICAgdGhpcy5tb3VzZSA9IG5ldyBWZWMyKCk7XG4gICAgICAgICAgICB0aGlzLnZlbG9jaXR5ID0gbmV3IFZlYzIoKTtcblxuICAgICAgICAgICAgdGhpcy5tZXNoID0gaW5pdFByb2dyYW0oKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIGNyZWF0ZUZCT3MoKSB7XG4gICAgICAgICAgICAvLyBSZXF1ZXN0ZWQgdHlwZSBub3Qgc3VwcG9ydGVkLCBmYWxsIGJhY2sgdG8gaGFsZiBmbG9hdFxuICAgICAgICAgICAgaWYgKCF0eXBlKSB0eXBlID0gZ2wuSEFMRl9GTE9BVCB8fCBnbC5yZW5kZXJlci5leHRlbnNpb25zWydPRVNfdGV4dHVyZV9oYWxmX2Zsb2F0J10uSEFMRl9GTE9BVF9PRVM7XG5cbiAgICAgICAgICAgIGxldCBtaW5GaWx0ZXIgPSAoKCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChnbC5yZW5kZXJlci5pc1dlYmdsMikgcmV0dXJuIGdsLkxJTkVBUjtcbiAgICAgICAgICAgICAgICBpZiAoZ2wucmVuZGVyZXIuZXh0ZW5zaW9uc1tgT0VTX3RleHR1cmVfJHt0eXBlID09PSBnbC5GTE9BVCA/ICcnIDogJ2hhbGZfJ31mbG9hdF9saW5lYXJgXSkgcmV0dXJuIGdsLkxJTkVBUjtcbiAgICAgICAgICAgICAgICByZXR1cm4gZ2wuTkVBUkVTVDtcbiAgICAgICAgICAgIH0pKCk7XG5cbiAgICAgICAgICAgIGNvbnN0IG9wdGlvbnMgPSB7XG4gICAgICAgICAgICAgICAgd2lkdGg6IHNpemUsXG4gICAgICAgICAgICAgICAgaGVpZ2h0OiBzaXplLFxuICAgICAgICAgICAgICAgIHR5cGUsXG4gICAgICAgICAgICAgICAgZm9ybWF0OiBnbC5SR0JBLFxuICAgICAgICAgICAgICAgIGludGVybmFsRm9ybWF0OiBnbC5yZW5kZXJlci5pc1dlYmdsMiA/ICh0eXBlID09PSBnbC5GTE9BVCA/IGdsLlJHQkEzMkYgOiBnbC5SR0JBMTZGKSA6IGdsLlJHQkEsXG4gICAgICAgICAgICAgICAgbWluRmlsdGVyLFxuICAgICAgICAgICAgICAgIGRlcHRoOiBmYWxzZSxcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIF90aGlzLm1hc2sucmVhZCA9IG5ldyBSZW5kZXJUYXJnZXQoZ2wsIG9wdGlvbnMpO1xuICAgICAgICAgICAgX3RoaXMubWFzay53cml0ZSA9IG5ldyBSZW5kZXJUYXJnZXQoZ2wsIG9wdGlvbnMpO1xuICAgICAgICAgICAgX3RoaXMubWFzay5zd2FwKCk7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBpbml0UHJvZ3JhbSgpIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgTWVzaChnbCwge1xuICAgICAgICAgICAgICAgIC8vIFRyaWFuZ2xlIHRoYXQgaW5jbHVkZXMgLTEgdG8gMSByYW5nZSBmb3IgJ3Bvc2l0aW9uJywgYW5kIDAgdG8gMSByYW5nZSBmb3IgJ3V2Jy5cbiAgICAgICAgICAgICAgICBnZW9tZXRyeTogbmV3IFRyaWFuZ2xlKGdsKSxcblxuICAgICAgICAgICAgICAgIHByb2dyYW06IG5ldyBQcm9ncmFtKGdsLCB7XG4gICAgICAgICAgICAgICAgICAgIHZlcnRleCxcbiAgICAgICAgICAgICAgICAgICAgZnJhZ21lbnQsXG4gICAgICAgICAgICAgICAgICAgIHVuaWZvcm1zOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0TWFwOiBfdGhpcy51bmlmb3JtLFxuXG4gICAgICAgICAgICAgICAgICAgICAgICB1RmFsbG9mZjogeyB2YWx1ZTogZmFsbG9mZiAqIDAuNSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgdUFscGhhOiB7IHZhbHVlOiBhbHBoYSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgdURpc3NpcGF0aW9uOiB7IHZhbHVlOiBkaXNzaXBhdGlvbiB9LFxuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBVc2VyIG5lZWRzIHRvIHVwZGF0ZSB0aGVzZVxuICAgICAgICAgICAgICAgICAgICAgICAgdUFzcGVjdDogeyB2YWx1ZTogMSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgdU1vdXNlOiB7IHZhbHVlOiBfdGhpcy5tb3VzZSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgdVZlbG9jaXR5OiB7IHZhbHVlOiBfdGhpcy52ZWxvY2l0eSB9LFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBkZXB0aFRlc3Q6IGZhbHNlLFxuICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB1cGRhdGUoKSB7XG4gICAgICAgIHRoaXMubWVzaC5wcm9ncmFtLnVuaWZvcm1zLnVBc3BlY3QudmFsdWUgPSB0aGlzLmFzcGVjdDtcblxuICAgICAgICB0aGlzLmdsLnJlbmRlcmVyLnJlbmRlcih7XG4gICAgICAgICAgICBzY2VuZTogdGhpcy5tZXNoLFxuICAgICAgICAgICAgdGFyZ2V0OiB0aGlzLm1hc2sud3JpdGUsXG4gICAgICAgICAgICBjbGVhcjogZmFsc2UsXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLm1hc2suc3dhcCgpO1xuICAgIH1cbn1cblxuY29uc3QgdmVydGV4ID0gLyogZ2xzbCAqLyBgXG4gICAgYXR0cmlidXRlIHZlYzIgdXY7XG4gICAgYXR0cmlidXRlIHZlYzIgcG9zaXRpb247XG5cbiAgICB2YXJ5aW5nIHZlYzIgdlV2O1xuXG4gICAgdm9pZCBtYWluKCkge1xuICAgICAgICB2VXYgPSB1djtcbiAgICAgICAgZ2xfUG9zaXRpb24gPSB2ZWM0KHBvc2l0aW9uLCAwLCAxKTtcbiAgICB9XG5gO1xuXG5jb25zdCBmcmFnbWVudCA9IC8qIGdsc2wgKi8gYFxuICAgIHByZWNpc2lvbiBoaWdocCBmbG9hdDtcblxuICAgIHVuaWZvcm0gc2FtcGxlcjJEIHRNYXA7XG5cbiAgICB1bmlmb3JtIGZsb2F0IHVGYWxsb2ZmO1xuICAgIHVuaWZvcm0gZmxvYXQgdUFscGhhO1xuICAgIHVuaWZvcm0gZmxvYXQgdURpc3NpcGF0aW9uO1xuICAgIFxuICAgIHVuaWZvcm0gZmxvYXQgdUFzcGVjdDtcbiAgICB1bmlmb3JtIHZlYzIgdU1vdXNlO1xuICAgIHVuaWZvcm0gdmVjMiB1VmVsb2NpdHk7XG5cbiAgICB2YXJ5aW5nIHZlYzIgdlV2O1xuXG4gICAgdm9pZCBtYWluKCkge1xuICAgICAgICB2ZWM0IGNvbG9yID0gdGV4dHVyZTJEKHRNYXAsIHZVdikgKiB1RGlzc2lwYXRpb247XG5cbiAgICAgICAgdmVjMiBjdXJzb3IgPSB2VXYgLSB1TW91c2U7XG4gICAgICAgIGN1cnNvci54ICo9IHVBc3BlY3Q7XG5cbiAgICAgICAgdmVjMyBzdGFtcCA9IHZlYzModVZlbG9jaXR5ICogdmVjMigxLCAtMSksIDEuMCAtIHBvdygxLjAgLSBtaW4oMS4wLCBsZW5ndGgodVZlbG9jaXR5KSksIDMuMCkpO1xuICAgICAgICBmbG9hdCBmYWxsb2ZmID0gc21vb3Roc3RlcCh1RmFsbG9mZiwgMC4wLCBsZW5ndGgoY3Vyc29yKSkgKiB1QWxwaGE7XG5cbiAgICAgICAgY29sb3IucmdiID0gbWl4KGNvbG9yLnJnYiwgc3RhbXAsIHZlYzMoZmFsbG9mZikpO1xuXG4gICAgICAgIGdsX0ZyYWdDb2xvciA9IGNvbG9yO1xuICAgIH1cbmA7XG4iLCJpbXBvcnQgeyBWZWMzIH0gZnJvbSAnLi4vbWF0aC9WZWMzLmpzJztcbmltcG9ydCB7IFF1YXQgfSBmcm9tICcuLi9tYXRoL1F1YXQuanMnO1xuXG5jb25zdCB0bXBWZWMzQSA9IG5ldyBWZWMzKCk7XG5jb25zdCB0bXBWZWMzQiA9IG5ldyBWZWMzKCk7XG5jb25zdCB0bXBWZWMzQyA9IG5ldyBWZWMzKCk7XG5jb25zdCB0bXBWZWMzRCA9IG5ldyBWZWMzKCk7XG5cbmNvbnN0IHRtcFF1YXRBID0gbmV3IFF1YXQoKTtcbmNvbnN0IHRtcFF1YXRCID0gbmV3IFF1YXQoKTtcbmNvbnN0IHRtcFF1YXRDID0gbmV3IFF1YXQoKTtcbmNvbnN0IHRtcFF1YXREID0gbmV3IFF1YXQoKTtcblxuZXhwb3J0IGNsYXNzIEdMVEZBbmltYXRpb24ge1xuICAgIGNvbnN0cnVjdG9yKGRhdGEsIHdlaWdodCA9IDEpIHtcbiAgICAgICAgdGhpcy5kYXRhID0gZGF0YTtcbiAgICAgICAgdGhpcy5lbGFwc2VkID0gMDtcbiAgICAgICAgdGhpcy53ZWlnaHQgPSB3ZWlnaHQ7XG5cbiAgICAgICAgLy8gU2V0IHRvIGZhbHNlIHRvIG5vdCBhcHBseSBtb2R1bG8gdG8gZWxhcHNlZCBhZ2FpbnN0IGR1cmF0aW9uXG4gICAgICAgIHRoaXMubG9vcCA9IHRydWU7XG5cbiAgICAgICAgLy8gRmluZCBzdGFydGluZyB0aW1lIGFzIGV4cG9ydHMgZnJvbSBibGVuZGVyIChwZXJoYXBzIG90aGVycyB0b28pIGRvbid0IGFsd2F5cyBzdGFydCBmcm9tIDBcbiAgICAgICAgdGhpcy5zdGFydFRpbWUgPSBkYXRhLnJlZHVjZSgoYSwgeyB0aW1lcyB9KSA9PiBNYXRoLm1pbihhLCB0aW1lc1swXSksIEluZmluaXR5KTtcbiAgICAgICAgLy8gR2V0IGxhcmdlc3QgZmluYWwgdGltZSBpbiBhbGwgY2hhbm5lbHMgdG8gY2FsY3VsYXRlIGR1cmF0aW9uXG4gICAgICAgIHRoaXMuZW5kVGltZSA9IGRhdGEucmVkdWNlKChhLCB7IHRpbWVzIH0pID0+IE1hdGgubWF4KGEsIHRpbWVzW3RpbWVzLmxlbmd0aCAtIDFdKSwgMCk7XG4gICAgICAgIHRoaXMuZHVyYXRpb24gPSB0aGlzLmVuZFRpbWUgLSB0aGlzLnN0YXJ0VGltZTtcbiAgICB9XG5cbiAgICB1cGRhdGUodG90YWxXZWlnaHQgPSAxLCBpc1NldCkge1xuICAgICAgICBjb25zdCB3ZWlnaHQgPSBpc1NldCA/IDEgOiB0aGlzLndlaWdodCAvIHRvdGFsV2VpZ2h0O1xuICAgICAgICBjb25zdCBlbGFwc2VkID0gKHRoaXMubG9vcCA/IHRoaXMuZWxhcHNlZCAlIHRoaXMuZHVyYXRpb24gOiBNYXRoLm1pbih0aGlzLmVsYXBzZWQsIHRoaXMuZHVyYXRpb24gLSAwLjAwMSkpICsgdGhpcy5zdGFydFRpbWU7XG5cbiAgICAgICAgdGhpcy5kYXRhLmZvckVhY2goKHsgbm9kZSwgdHJhbnNmb3JtLCBpbnRlcnBvbGF0aW9uLCB0aW1lcywgdmFsdWVzIH0pID0+IHtcbiAgICAgICAgICAgIC8vIEdldCBpbmRleCBvZiB0d28gdGltZSB2YWx1ZXMgZWxhcHNlZCBpcyBiZXR3ZWVuXG4gICAgICAgICAgICBjb25zdCBwcmV2SW5kZXggPVxuICAgICAgICAgICAgICAgIE1hdGgubWF4KFxuICAgICAgICAgICAgICAgICAgICAxLFxuICAgICAgICAgICAgICAgICAgICB0aW1lcy5maW5kSW5kZXgoKHQpID0+IHQgPiBlbGFwc2VkKVxuICAgICAgICAgICAgICAgICkgLSAxO1xuICAgICAgICAgICAgY29uc3QgbmV4dEluZGV4ID0gcHJldkluZGV4ICsgMTtcblxuICAgICAgICAgICAgLy8gR2V0IGxpbmVhciBibGVuZC9hbHBoYSBiZXR3ZWVuIHRoZSB0d29cbiAgICAgICAgICAgIGxldCBhbHBoYSA9IChlbGFwc2VkIC0gdGltZXNbcHJldkluZGV4XSkgLyAodGltZXNbbmV4dEluZGV4XSAtIHRpbWVzW3ByZXZJbmRleF0pO1xuICAgICAgICAgICAgaWYgKGludGVycG9sYXRpb24gPT09ICdTVEVQJykgYWxwaGEgPSAwO1xuXG4gICAgICAgICAgICBsZXQgcHJldlZhbCA9IHRtcFZlYzNBO1xuICAgICAgICAgICAgbGV0IHByZXZUYW4gPSB0bXBWZWMzQjtcbiAgICAgICAgICAgIGxldCBuZXh0VGFuID0gdG1wVmVjM0M7XG4gICAgICAgICAgICBsZXQgbmV4dFZhbCA9IHRtcFZlYzNEO1xuICAgICAgICAgICAgbGV0IHNpemUgPSAzO1xuXG4gICAgICAgICAgICBpZiAodHJhbnNmb3JtID09PSAncXVhdGVybmlvbicpIHtcbiAgICAgICAgICAgICAgICBwcmV2VmFsID0gdG1wUXVhdEE7XG4gICAgICAgICAgICAgICAgcHJldlRhbiA9IHRtcFF1YXRCO1xuICAgICAgICAgICAgICAgIG5leHRUYW4gPSB0bXBRdWF0QztcbiAgICAgICAgICAgICAgICBuZXh0VmFsID0gdG1wUXVhdEQ7XG4gICAgICAgICAgICAgICAgc2l6ZSA9IDQ7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChpbnRlcnBvbGF0aW9uID09PSAnQ1VCSUNTUExJTkUnKSB7XG4gICAgICAgICAgICAgICAgLy8gR2V0IHRoZSBwcmV2IGFuZCBuZXh0IHZhbHVlcyBmcm9tIHRoZSBpbmRpY2VzXG4gICAgICAgICAgICAgICAgcHJldlZhbC5mcm9tQXJyYXkodmFsdWVzLCBwcmV2SW5kZXggKiBzaXplICogMyArIHNpemUgKiAxKTtcbiAgICAgICAgICAgICAgICBwcmV2VGFuLmZyb21BcnJheSh2YWx1ZXMsIHByZXZJbmRleCAqIHNpemUgKiAzICsgc2l6ZSAqIDIpO1xuICAgICAgICAgICAgICAgIG5leHRUYW4uZnJvbUFycmF5KHZhbHVlcywgbmV4dEluZGV4ICogc2l6ZSAqIDMgKyBzaXplICogMCk7XG4gICAgICAgICAgICAgICAgbmV4dFZhbC5mcm9tQXJyYXkodmFsdWVzLCBuZXh0SW5kZXggKiBzaXplICogMyArIHNpemUgKiAxKTtcblxuICAgICAgICAgICAgICAgIC8vIGludGVycG9sYXRlIGZvciBmaW5hbCB2YWx1ZVxuICAgICAgICAgICAgICAgIHByZXZWYWwgPSB0aGlzLmN1YmljU3BsaW5lSW50ZXJwb2xhdGUoYWxwaGEsIHByZXZWYWwsIHByZXZUYW4sIG5leHRUYW4sIG5leHRWYWwpO1xuICAgICAgICAgICAgICAgIGlmIChzaXplID09PSA0KSBwcmV2VmFsLm5vcm1hbGl6ZSgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBHZXQgdGhlIHByZXYgYW5kIG5leHQgdmFsdWVzIGZyb20gdGhlIGluZGljZXNcbiAgICAgICAgICAgICAgICBwcmV2VmFsLmZyb21BcnJheSh2YWx1ZXMsIHByZXZJbmRleCAqIHNpemUpO1xuICAgICAgICAgICAgICAgIG5leHRWYWwuZnJvbUFycmF5KHZhbHVlcywgbmV4dEluZGV4ICogc2l6ZSk7XG5cbiAgICAgICAgICAgICAgICAvLyBpbnRlcnBvbGF0ZSBmb3IgZmluYWwgdmFsdWVcbiAgICAgICAgICAgICAgICBpZiAoc2l6ZSA9PT0gNCkgcHJldlZhbC5zbGVycChuZXh0VmFsLCBhbHBoYSk7XG4gICAgICAgICAgICAgICAgZWxzZSBwcmV2VmFsLmxlcnAobmV4dFZhbCwgYWxwaGEpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBpbnRlcnBvbGF0ZSBiZXR3ZWVuIG11bHRpcGxlIHBvc3NpYmxlIGFuaW1hdGlvbnNcbiAgICAgICAgICAgIGlmIChzaXplID09PSA0KSBub2RlW3RyYW5zZm9ybV0uc2xlcnAocHJldlZhbCwgd2VpZ2h0KTtcbiAgICAgICAgICAgIGVsc2Ugbm9kZVt0cmFuc2Zvcm1dLmxlcnAocHJldlZhbCwgd2VpZ2h0KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgY3ViaWNTcGxpbmVJbnRlcnBvbGF0ZSh0LCBwcmV2VmFsLCBwcmV2VGFuLCBuZXh0VGFuLCBuZXh0VmFsKSB7XG4gICAgICAgIGNvbnN0IHQyID0gdCAqIHQ7XG4gICAgICAgIGNvbnN0IHQzID0gdDIgKiB0O1xuXG4gICAgICAgIGNvbnN0IHMyID0gMyAqIHQyIC0gMiAqIHQzO1xuICAgICAgICBjb25zdCBzMyA9IHQzIC0gdDI7XG4gICAgICAgIGNvbnN0IHMwID0gMSAtIHMyO1xuICAgICAgICBjb25zdCBzMSA9IHMzIC0gdDIgKyB0O1xuXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcHJldlZhbC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgcHJldlZhbFtpXSA9IHMwICogcHJldlZhbFtpXSArIHMxICogKDEgLSB0KSAqIHByZXZUYW5baV0gKyBzMiAqIG5leHRWYWxbaV0gKyBzMyAqIHQgKiBuZXh0VGFuW2ldO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHByZXZWYWw7XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgR2VvbWV0cnkgfSBmcm9tICcuLi9jb3JlL0dlb21ldHJ5LmpzJztcbmltcG9ydCB7IFRyYW5zZm9ybSB9IGZyb20gJy4uL2NvcmUvVHJhbnNmb3JtLmpzJztcbmltcG9ydCB7IFRleHR1cmUgfSBmcm9tICcuLi9jb3JlL1RleHR1cmUuanMnO1xuaW1wb3J0IHsgTWVzaCB9IGZyb20gJy4uL2NvcmUvTWVzaC5qcyc7XG5pbXBvcnQgeyBHTFRGQW5pbWF0aW9uIH0gZnJvbSAnLi9HTFRGQW5pbWF0aW9uLmpzJztcbmltcG9ydCB7IEdMVEZTa2luIH0gZnJvbSAnLi9HTFRGU2tpbi5qcyc7XG5pbXBvcnQgeyBNYXQ0IH0gZnJvbSAnLi4vbWF0aC9NYXQ0LmpzJztcbmltcG9ydCB7IE5vcm1hbFByb2dyYW0gfSBmcm9tICcuL05vcm1hbFByb2dyYW0uanMnO1xuXG4vLyBTdXBwb3J0c1xuLy8gW3hdIEdlb21ldHJ5XG4vLyBbIF0gU3BhcnNlIHN1cHBvcnRcbi8vIFt4XSBOb2RlcyBhbmQgSGllcmFyY2h5XG4vLyBbeF0gSW5zdGFuY2luZ1xuLy8gWyBdIE1vcnBoIFRhcmdldHNcbi8vIFt4XSBTa2luc1xuLy8gWyBdIE1hdGVyaWFsc1xuLy8gW3hdIFRleHR1cmVzXG4vLyBbeF0gQW5pbWF0aW9uXG4vLyBbIF0gQ2FtZXJhc1xuLy8gWyBdIEV4dGVuc2lvbnNcbi8vIFt4XSBHTEIgc3VwcG9ydFxuXG4vLyBUT0RPOiBTcGFyc2UgYWNjZXNzb3IgcGFja2luZz8gRm9yIG1vcnBoIHRhcmdldHMgYmFzaWNhbGx5XG4vLyBUT0RPOiBpbml0IGFjY2Vzc29yIG1pc3NpbmcgYnVmZmVyVmlldyB3aXRoIDBzXG4vLyBUT0RPOiBtb3JwaCB0YXJnZXQgYW5pbWF0aW9uc1xuLy8gVE9ETzogd2hhdCB0byBkbyBpZiBtdWx0aXBsZSBpbnN0YW5jZXMgYXJlIGluIGRpZmZlcmVudCBncm91cHM/IE9ubHkgdXNlcyBsb2NhbCBtYXRyaWNlc1xuLy8gVE9ETzogd2hhdCBpZiBpbnN0YW5jaW5nIGlzbid0IHdhbnRlZD8gRWcgY29sbGlzaW9uIG1hcHNcbi8vIFRPRE86IGllMTEgZmFsbGJhY2sgZm9yIFRleHREZWNvZGVyP1xuXG5jb25zdCBUWVBFX0FSUkFZID0ge1xuICAgIDUxMjE6IFVpbnQ4QXJyYXksXG4gICAgNTEyMjogSW50MTZBcnJheSxcbiAgICA1MTIzOiBVaW50MTZBcnJheSxcbiAgICA1MTI1OiBVaW50MzJBcnJheSxcbiAgICA1MTI2OiBGbG9hdDMyQXJyYXksXG4gICAgJ2ltYWdlL2pwZWcnOiBVaW50OEFycmF5LFxuICAgICdpbWFnZS9wbmcnOiBVaW50OEFycmF5LFxufTtcblxuY29uc3QgVFlQRV9TSVpFID0ge1xuICAgIFNDQUxBUjogMSxcbiAgICBWRUMyOiAyLFxuICAgIFZFQzM6IDMsXG4gICAgVkVDNDogNCxcbiAgICBNQVQyOiA0LFxuICAgIE1BVDM6IDksXG4gICAgTUFUNDogMTYsXG59O1xuXG5jb25zdCBBVFRSSUJVVEVTID0ge1xuICAgIFBPU0lUSU9OOiAncG9zaXRpb24nLFxuICAgIE5PUk1BTDogJ25vcm1hbCcsXG4gICAgVEFOR0VOVDogJ3RhbmdlbnQnLFxuICAgIFRFWENPT1JEXzA6ICd1dicsXG4gICAgVEVYQ09PUkRfMTogJ3V2MicsXG4gICAgQ09MT1JfMDogJ2NvbG9yJyxcbiAgICBXRUlHSFRTXzA6ICdza2luV2VpZ2h0JyxcbiAgICBKT0lOVFNfMDogJ3NraW5JbmRleCcsXG59O1xuXG5jb25zdCBUUkFOU0ZPUk1TID0ge1xuICAgIHRyYW5zbGF0aW9uOiAncG9zaXRpb24nLFxuICAgIHJvdGF0aW9uOiAncXVhdGVybmlvbicsXG4gICAgc2NhbGU6ICdzY2FsZScsXG59O1xuXG5leHBvcnQgY2xhc3MgR0xURkxvYWRlciB7XG4gICAgc3RhdGljIGFzeW5jIGxvYWQoZ2wsIHNyYykge1xuICAgICAgICBjb25zdCBkaXIgPSBzcmMuc3BsaXQoJy8nKS5zbGljZSgwLCAtMSkuam9pbignLycpICsgJy8nO1xuXG4gICAgICAgIC8vIGxvYWQgbWFpbiBkZXNjcmlwdGlvbiBqc29uXG4gICAgICAgIGNvbnN0IGRlc2MgPSBhd2FpdCB0aGlzLnBhcnNlRGVzYyhzcmMpO1xuXG4gICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnBhcnNlKGdsLCBkZXNjLCBkaXIpO1xuICAgIH1cblxuICAgIHN0YXRpYyBhc3luYyBwYXJzZShnbCwgZGVzYywgZGlyKSB7XG4gICAgICAgIGlmIChkZXNjLmFzc2V0ID09PSB1bmRlZmluZWQgfHwgZGVzYy5hc3NldC52ZXJzaW9uWzBdIDwgMikgY29uc29sZS53YXJuKCdPbmx5IEdMVEYgPj0yLjAgc3VwcG9ydGVkLiBBdHRlbXB0aW5nIHRvIHBhcnNlLicpO1xuXG4gICAgICAgIC8vIExvYWQgYnVmZmVycyBhc3luY1xuICAgICAgICBjb25zdCBidWZmZXJzID0gYXdhaXQgdGhpcy5sb2FkQnVmZmVycyhkZXNjLCBkaXIpO1xuXG4gICAgICAgIC8vIFVuYmluZCBjdXJyZW50IFZBTyBzbyB0aGF0IG5ldyBidWZmZXJzIGRvbid0IGdldCBhZGRlZCB0byBhY3RpdmUgbWVzaFxuICAgICAgICBnbC5yZW5kZXJlci5iaW5kVmVydGV4QXJyYXkobnVsbCk7XG5cbiAgICAgICAgLy8gQ3JlYXRlIGdsIGJ1ZmZlcnMgZnJvbSBidWZmZXJWaWV3c1xuICAgICAgICBjb25zdCBidWZmZXJWaWV3cyA9IHRoaXMucGFyc2VCdWZmZXJWaWV3cyhnbCwgZGVzYywgYnVmZmVycyk7XG5cbiAgICAgICAgLy8gQ3JlYXRlIGltYWdlcyBmcm9tIGVpdGhlciBidWZmZXJWaWV3cyBvciBzZXBhcmF0ZSBpbWFnZSBmaWxlc1xuICAgICAgICBjb25zdCBpbWFnZXMgPSB0aGlzLnBhcnNlSW1hZ2VzKGdsLCBkZXNjLCBkaXIsIGJ1ZmZlclZpZXdzKTtcblxuICAgICAgICBjb25zdCB0ZXh0dXJlcyA9IHRoaXMucGFyc2VUZXh0dXJlcyhnbCwgZGVzYywgaW1hZ2VzKTtcblxuICAgICAgICAvLyBKdXN0IHBhc3MgdGhyb3VnaCBtYXRlcmlhbCBkYXRhIGZvciBub3dcbiAgICAgICAgY29uc3QgbWF0ZXJpYWxzID0gdGhpcy5wYXJzZU1hdGVyaWFscyhnbCwgZGVzYywgdGV4dHVyZXMpO1xuXG4gICAgICAgIC8vIEZldGNoIHRoZSBpbnZlcnNlIGJpbmQgbWF0cmljZXMgZm9yIHNrZWxldG9uIGpvaW50c1xuICAgICAgICBjb25zdCBza2lucyA9IHRoaXMucGFyc2VTa2lucyhnbCwgZGVzYywgYnVmZmVyVmlld3MpO1xuXG4gICAgICAgIC8vIENyZWF0ZSBnZW9tZXRyaWVzIGZvciBlYWNoIG1lc2ggcHJpbWl0aXZlXG4gICAgICAgIGNvbnN0IG1lc2hlcyA9IHRoaXMucGFyc2VNZXNoZXMoZ2wsIGRlc2MsIGJ1ZmZlclZpZXdzLCBtYXRlcmlhbHMsIHNraW5zKTtcblxuICAgICAgICAvLyBDcmVhdGUgdHJhbnNmb3JtcywgbWVzaGVzIGFuZCBoaWVyYXJjaHlcbiAgICAgICAgY29uc3Qgbm9kZXMgPSB0aGlzLnBhcnNlTm9kZXMoZ2wsIGRlc2MsIG1lc2hlcywgc2tpbnMpO1xuXG4gICAgICAgIC8vIFBsYWNlIG5vZGVzIGluIHNrZWxldG9uc1xuICAgICAgICB0aGlzLnBvcHVsYXRlU2tpbnMoc2tpbnMsIG5vZGVzKTtcblxuICAgICAgICAvLyBDcmVhdGUgYW5pbWF0aW9uIGhhbmRsZXJzXG4gICAgICAgIGNvbnN0IGFuaW1hdGlvbnMgPSB0aGlzLnBhcnNlQW5pbWF0aW9ucyhnbCwgZGVzYywgbm9kZXMsIGJ1ZmZlclZpZXdzKTtcblxuICAgICAgICAvLyBHZXQgdG9wIGxldmVsIG5vZGVzIGZvciBlYWNoIHNjZW5lXG4gICAgICAgIGNvbnN0IHNjZW5lcyA9IHRoaXMucGFyc2VTY2VuZXMoZGVzYywgbm9kZXMpO1xuICAgICAgICBjb25zdCBzY2VuZSA9IHNjZW5lc1tkZXNjLnNjZW5lXTtcblxuICAgICAgICAvLyBSZW1vdmUgbnVsbCBub2RlcyAoaW5zdGFuY2VkIHRyYW5zZm9ybXMpXG4gICAgICAgIGZvciAobGV0IGkgPSBub2Rlcy5sZW5ndGg7IGkgPj0gMDsgaS0tKSBpZiAoIW5vZGVzW2ldKSBub2Rlcy5zcGxpY2UoaSwgMSk7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGpzb246IGRlc2MsXG4gICAgICAgICAgICBidWZmZXJzLFxuICAgICAgICAgICAgYnVmZmVyVmlld3MsXG4gICAgICAgICAgICBpbWFnZXMsXG4gICAgICAgICAgICB0ZXh0dXJlcyxcbiAgICAgICAgICAgIG1hdGVyaWFscyxcbiAgICAgICAgICAgIG1lc2hlcyxcbiAgICAgICAgICAgIG5vZGVzLFxuICAgICAgICAgICAgYW5pbWF0aW9ucyxcbiAgICAgICAgICAgIHNjZW5lcyxcbiAgICAgICAgICAgIHNjZW5lLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIHN0YXRpYyBhc3luYyBwYXJzZURlc2Moc3JjKSB7XG4gICAgICAgIGlmICghc3JjLm1hdGNoKC9cXC5nbGIkLykpIHtcbiAgICAgICAgICAgIHJldHVybiBhd2FpdCBmZXRjaChzcmMpLnRoZW4oKHJlcykgPT4gcmVzLmpzb24oKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gYXdhaXQgZmV0Y2goc3JjKVxuICAgICAgICAgICAgICAgIC50aGVuKChyZXMpID0+IHJlcy5hcnJheUJ1ZmZlcigpKVxuICAgICAgICAgICAgICAgIC50aGVuKChnbGIpID0+IHRoaXMudW5wYWNrR0xCKGdsYikpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gRnJvbSBodHRwczovL2dpdGh1Yi5jb20vZG9ubWNjdXJkeS9nbFRGLVRyYW5zZm9ybS9ibG9iL2U0MTA4Y2MvcGFja2FnZXMvY29yZS9zcmMvaW8vaW8udHMjTDMyXG4gICAgc3RhdGljIHVucGFja0dMQihnbGIpIHtcbiAgICAgICAgLy8gRGVjb2RlIGFuZCB2ZXJpZnkgR0xCIGhlYWRlci5cbiAgICAgICAgY29uc3QgaGVhZGVyID0gbmV3IFVpbnQzMkFycmF5KGdsYiwgMCwgMyk7XG4gICAgICAgIGlmIChoZWFkZXJbMF0gIT09IDB4NDY1NDZjNjcpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBnbFRGIGFzc2V0LicpO1xuICAgICAgICB9IGVsc2UgaWYgKGhlYWRlclsxXSAhPT0gMikge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbnN1cHBvcnRlZCBnbFRGIGJpbmFyeSB2ZXJzaW9uLCBcIiR7aGVhZGVyWzFdfVwiLmApO1xuICAgICAgICB9XG4gICAgICAgIC8vIERlY29kZSBhbmQgdmVyaWZ5IGNodW5rIGhlYWRlcnMuXG4gICAgICAgIGNvbnN0IGpzb25DaHVua0hlYWRlciA9IG5ldyBVaW50MzJBcnJheShnbGIsIDEyLCAyKTtcbiAgICAgICAgY29uc3QganNvbkJ5dGVPZmZzZXQgPSAyMDtcbiAgICAgICAgY29uc3QganNvbkJ5dGVMZW5ndGggPSBqc29uQ2h1bmtIZWFkZXJbMF07XG4gICAgICAgIGlmIChqc29uQ2h1bmtIZWFkZXJbMV0gIT09IDB4NGU0ZjUzNGEpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVW5leHBlY3RlZCBHTEIgbGF5b3V0LicpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gRGVjb2RlIEpTT04uXG4gICAgICAgIGNvbnN0IGpzb25UZXh0ID0gbmV3IFRleHREZWNvZGVyKCkuZGVjb2RlKGdsYi5zbGljZShqc29uQnl0ZU9mZnNldCwganNvbkJ5dGVPZmZzZXQgKyBqc29uQnl0ZUxlbmd0aCkpO1xuICAgICAgICBjb25zdCBqc29uID0gSlNPTi5wYXJzZShqc29uVGV4dCk7XG4gICAgICAgIC8vIEpTT04gb25seVxuICAgICAgICBpZiAoanNvbkJ5dGVPZmZzZXQgKyBqc29uQnl0ZUxlbmd0aCA9PT0gZ2xiLmJ5dGVMZW5ndGgpIHJldHVybiBqc29uO1xuXG4gICAgICAgIGNvbnN0IGJpbmFyeUNodW5rSGVhZGVyID0gbmV3IFVpbnQzMkFycmF5KGdsYiwganNvbkJ5dGVPZmZzZXQgKyBqc29uQnl0ZUxlbmd0aCwgMik7XG4gICAgICAgIGlmIChiaW5hcnlDaHVua0hlYWRlclsxXSAhPT0gMHgwMDRlNDk0Mikge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmV4cGVjdGVkIEdMQiBsYXlvdXQuJyk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gRGVjb2RlIGNvbnRlbnQuXG4gICAgICAgIGNvbnN0IGJpbmFyeUJ5dGVPZmZzZXQgPSBqc29uQnl0ZU9mZnNldCArIGpzb25CeXRlTGVuZ3RoICsgODtcbiAgICAgICAgY29uc3QgYmluYXJ5Qnl0ZUxlbmd0aCA9IGJpbmFyeUNodW5rSGVhZGVyWzBdO1xuICAgICAgICBjb25zdCBiaW5hcnkgPSBnbGIuc2xpY2UoYmluYXJ5Qnl0ZU9mZnNldCwgYmluYXJ5Qnl0ZU9mZnNldCArIGJpbmFyeUJ5dGVMZW5ndGgpO1xuICAgICAgICAvLyBBdHRhY2ggYmluYXJ5IHRvIGJ1ZmZlclxuICAgICAgICBqc29uLmJ1ZmZlcnNbMF0uYmluYXJ5ID0gYmluYXJ5O1xuICAgICAgICByZXR1cm4ganNvbjtcbiAgICB9XG5cbiAgICAvLyBUaHJlZWpzIEdMVEYgTG9hZGVyIGh0dHBzOi8vZ2l0aHViLmNvbS9tcmRvb2IvdGhyZWUuanMvYmxvYi9tYXN0ZXIvZXhhbXBsZXMvanMvbG9hZGVycy9HTFRGTG9hZGVyLmpzI0wxMDg1XG4gICAgc3RhdGljIHJlc29sdmVVUkkodXJpLCBkaXIpIHtcbiAgICAgICAgLy8gSW52YWxpZCBVUklcbiAgICAgICAgaWYgKHR5cGVvZiB1cmkgIT09ICdzdHJpbmcnIHx8IHVyaSA9PT0gJycpIHJldHVybiAnJztcblxuICAgICAgICAvLyBIb3N0IFJlbGF0aXZlIFVSSVxuICAgICAgICBpZiAoL15odHRwcz86XFwvXFwvL2kudGVzdChkaXIpICYmIC9eXFwvLy50ZXN0KHVyaSkpIHtcbiAgICAgICAgICAgIGRpciA9IGRpci5yZXBsYWNlKC8oXmh0dHBzPzpcXC9cXC9bXlxcL10rKS4qL2ksICckMScpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQWJzb2x1dGUgVVJJIGh0dHA6Ly8sIGh0dHBzOi8vLCAvL1xuICAgICAgICBpZiAoL14oaHR0cHM/Oik/XFwvXFwvL2kudGVzdCh1cmkpKSByZXR1cm4gdXJpO1xuXG4gICAgICAgIC8vIERhdGEgVVJJXG4gICAgICAgIGlmICgvXmRhdGE6LiosLiokL2kudGVzdCh1cmkpKSByZXR1cm4gdXJpO1xuXG4gICAgICAgIC8vIEJsb2IgVVJJXG4gICAgICAgIGlmICgvXmJsb2I6LiokL2kudGVzdCh1cmkpKSByZXR1cm4gdXJpO1xuXG4gICAgICAgIC8vIFJlbGF0aXZlIFVSSVxuICAgICAgICByZXR1cm4gZGlyICsgdXJpO1xuICAgIH1cblxuICAgIHN0YXRpYyBhc3luYyBsb2FkQnVmZmVycyhkZXNjLCBkaXIpIHtcbiAgICAgICAgaWYgKCFkZXNjLmJ1ZmZlcnMpIHJldHVybiBudWxsO1xuICAgICAgICByZXR1cm4gYXdhaXQgUHJvbWlzZS5hbGwoXG4gICAgICAgICAgICBkZXNjLmJ1ZmZlcnMubWFwKChidWZmZXIpID0+IHtcbiAgICAgICAgICAgICAgICAvLyBGb3IgR0xCLCBiaW5hcnkgYnVmZmVyIHJlYWR5IHRvIGdvXG4gICAgICAgICAgICAgICAgaWYgKGJ1ZmZlci5iaW5hcnkpIHJldHVybiBidWZmZXIuYmluYXJ5O1xuICAgICAgICAgICAgICAgIGNvbnN0IHVyaSA9IHRoaXMucmVzb2x2ZVVSSShidWZmZXIudXJpLCBkaXIpO1xuICAgICAgICAgICAgICAgIHJldHVybiBmZXRjaCh1cmkpLnRoZW4oKHJlcykgPT4gcmVzLmFycmF5QnVmZmVyKCkpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgcGFyc2VCdWZmZXJWaWV3cyhnbCwgZGVzYywgYnVmZmVycykge1xuICAgICAgICBpZiAoIWRlc2MuYnVmZmVyVmlld3MpIHJldHVybiBudWxsO1xuICAgICAgICAvLyBDbG9uZSB0byBsZWF2ZSBkZXNjcmlwdGlvbiBwdXJlXG4gICAgICAgIGNvbnN0IGJ1ZmZlclZpZXdzID0gZGVzYy5idWZmZXJWaWV3cy5tYXAoKG8pID0+IE9iamVjdC5hc3NpZ24oe30sIG8pKTtcblxuICAgICAgICBkZXNjLm1lc2hlcyAmJlxuICAgICAgICAgICAgZGVzYy5tZXNoZXMuZm9yRWFjaCgoeyBwcmltaXRpdmVzIH0pID0+IHtcbiAgICAgICAgICAgICAgICBwcmltaXRpdmVzLmZvckVhY2goKHsgYXR0cmlidXRlcywgaW5kaWNlcyB9KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIC8vIEZsYWcgYnVmZmVyVmlldyBhcyBhbiBhdHRyaWJ1dGUsIHNvIGl0IGtub3dzIHRvIGNyZWF0ZSBhIGdsIGJ1ZmZlclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBhdHRyIGluIGF0dHJpYnV0ZXMpIGJ1ZmZlclZpZXdzW2Rlc2MuYWNjZXNzb3JzW2F0dHJpYnV0ZXNbYXR0cl1dLmJ1ZmZlclZpZXddLmlzQXR0cmlidXRlID0gdHJ1ZTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoaW5kaWNlcyA9PT0gdW5kZWZpbmVkKSByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIGJ1ZmZlclZpZXdzW2Rlc2MuYWNjZXNzb3JzW2luZGljZXNdLmJ1ZmZlclZpZXddLmlzQXR0cmlidXRlID0gdHJ1ZTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBNYWtlIHN1cmUgaW5kaWNlcyBidWZmZXJWaWV3IGhhdmUgYSB0YXJnZXQgcHJvcGVydHkgZm9yIGdsIGJ1ZmZlciBiaW5kaW5nXG4gICAgICAgICAgICAgICAgICAgIGJ1ZmZlclZpZXdzW2Rlc2MuYWNjZXNzb3JzW2luZGljZXNdLmJ1ZmZlclZpZXddLnRhcmdldCA9IGdsLkVMRU1FTlRfQVJSQVlfQlVGRkVSO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gR2V0IGNvbXBvbmVudFR5cGUgb2YgZWFjaCBidWZmZXJWaWV3IGZyb20gdGhlIGFjY2Vzc29yc1xuICAgICAgICBkZXNjLmFjY2Vzc29ycy5mb3JFYWNoKCh7IGJ1ZmZlclZpZXc6IGksIGNvbXBvbmVudFR5cGUgfSkgPT4ge1xuICAgICAgICAgICAgYnVmZmVyVmlld3NbaV0uY29tcG9uZW50VHlwZSA9IGNvbXBvbmVudFR5cGU7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIEdldCBtaW1ldHlwZSBvZiBidWZmZXJWaWV3IGZyb20gaW1hZ2VzXG4gICAgICAgIGRlc2MuaW1hZ2VzICYmXG4gICAgICAgICAgICBkZXNjLmltYWdlcy5mb3JFYWNoKCh7IHVyaSwgYnVmZmVyVmlldzogaSwgbWltZVR5cGUgfSkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChpID09PSB1bmRlZmluZWQpIHJldHVybjtcbiAgICAgICAgICAgICAgICBidWZmZXJWaWV3c1tpXS5taW1lVHlwZSA9IG1pbWVUeXBlO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gUHVzaCBlYWNoIGJ1ZmZlclZpZXcgdG8gdGhlIEdQVSBhcyBhIHNlcGFyYXRlIGJ1ZmZlclxuICAgICAgICBidWZmZXJWaWV3cy5mb3JFYWNoKFxuICAgICAgICAgICAgKFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgYnVmZmVyOiBidWZmZXJJbmRleCwgLy8gcmVxdWlyZWRcbiAgICAgICAgICAgICAgICAgICAgYnl0ZU9mZnNldCA9IDAsIC8vIG9wdGlvbmFsXG4gICAgICAgICAgICAgICAgICAgIGJ5dGVMZW5ndGgsIC8vIHJlcXVpcmVkXG4gICAgICAgICAgICAgICAgICAgIGJ5dGVTdHJpZGUsIC8vIG9wdGlvbmFsXG4gICAgICAgICAgICAgICAgICAgIHRhcmdldCA9IGdsLkFSUkFZX0JVRkZFUiwgLy8gb3B0aW9uYWwsIGFkZGVkIGFib3ZlIGZvciBlbGVtZW50c1xuICAgICAgICAgICAgICAgICAgICBuYW1lLCAvLyBvcHRpb25hbFxuICAgICAgICAgICAgICAgICAgICBleHRlbnNpb25zLCAvLyBvcHRpb25hbFxuICAgICAgICAgICAgICAgICAgICBleHRyYXMsIC8vIG9wdGlvbmFsXG5cbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50VHlwZSwgLy8gb3B0aW9uYWwsIGFkZGVkIGZyb20gYWNjZXNzb3IgYWJvdmVcbiAgICAgICAgICAgICAgICAgICAgbWltZVR5cGUsIC8vIG9wdGlvbmFsLCBhZGRlZCBmcm9tIGltYWdlcyBhYm92ZVxuICAgICAgICAgICAgICAgICAgICBpc0F0dHJpYnV0ZSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGlcbiAgICAgICAgICAgICkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IFR5cGVBcnJheSA9IFRZUEVfQVJSQVlbY29tcG9uZW50VHlwZSB8fCBtaW1lVHlwZV07XG4gICAgICAgICAgICAgICAgY29uc3QgZWxlbWVudEJ5dGVzID0gVHlwZUFycmF5LkJZVEVTX1BFUl9FTEVNRU5UO1xuXG4gICAgICAgICAgICAgICAgY29uc3QgZGF0YSA9IG5ldyBUeXBlQXJyYXkoYnVmZmVyc1tidWZmZXJJbmRleF0sIGJ5dGVPZmZzZXQsIGJ5dGVMZW5ndGggLyBlbGVtZW50Qnl0ZXMpO1xuICAgICAgICAgICAgICAgIGJ1ZmZlclZpZXdzW2ldLmRhdGEgPSBkYXRhO1xuICAgICAgICAgICAgICAgIGJ1ZmZlclZpZXdzW2ldLm9yaWdpbmFsQnVmZmVyID0gYnVmZmVyc1tidWZmZXJJbmRleF07XG5cbiAgICAgICAgICAgICAgICBpZiAoIWlzQXR0cmlidXRlKSByZXR1cm47XG4gICAgICAgICAgICAgICAgLy8gQ3JlYXRlIGdsIGJ1ZmZlcnMgZm9yIHRoZSBidWZmZXJWaWV3LCBwdXNoaW5nIGl0IHRvIHRoZSBHUFVcbiAgICAgICAgICAgICAgICBjb25zdCBidWZmZXIgPSBnbC5jcmVhdGVCdWZmZXIoKTtcbiAgICAgICAgICAgICAgICBnbC5iaW5kQnVmZmVyKHRhcmdldCwgYnVmZmVyKTtcbiAgICAgICAgICAgICAgICBnbC5yZW5kZXJlci5zdGF0ZS5ib3VuZEJ1ZmZlciA9IGJ1ZmZlcjtcbiAgICAgICAgICAgICAgICBnbC5idWZmZXJEYXRhKHRhcmdldCwgZGF0YSwgZ2wuU1RBVElDX0RSQVcpO1xuICAgICAgICAgICAgICAgIGJ1ZmZlclZpZXdzW2ldLmJ1ZmZlciA9IGJ1ZmZlcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgKTtcblxuICAgICAgICByZXR1cm4gYnVmZmVyVmlld3M7XG4gICAgfVxuXG4gICAgc3RhdGljIHBhcnNlSW1hZ2VzKGdsLCBkZXNjLCBkaXIsIGJ1ZmZlclZpZXdzKSB7XG4gICAgICAgIGlmICghZGVzYy5pbWFnZXMpIHJldHVybiBudWxsO1xuICAgICAgICByZXR1cm4gZGVzYy5pbWFnZXMubWFwKCh7IHVyaSwgYnVmZmVyVmlldzogYnVmZmVyVmlld0luZGV4LCBtaW1lVHlwZSwgbmFtZSB9KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBpbWFnZSA9IG5ldyBJbWFnZSgpO1xuICAgICAgICAgICAgaW1hZ2UubmFtZSA9IG5hbWU7XG4gICAgICAgICAgICBpZiAodXJpKSB7XG4gICAgICAgICAgICAgICAgaW1hZ2Uuc3JjID0gdGhpcy5yZXNvbHZlVVJJKHVyaSwgZGlyKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoYnVmZmVyVmlld0luZGV4ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBjb25zdCB7IGRhdGEgfSA9IGJ1ZmZlclZpZXdzW2J1ZmZlclZpZXdJbmRleF07XG4gICAgICAgICAgICAgICAgY29uc3QgYmxvYiA9IG5ldyBCbG9iKFtkYXRhXSwgeyB0eXBlOiBtaW1lVHlwZSB9KTtcbiAgICAgICAgICAgICAgICBpbWFnZS5zcmMgPSBVUkwuY3JlYXRlT2JqZWN0VVJMKGJsb2IpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaW1hZ2UucmVhZHkgPSBuZXcgUHJvbWlzZSgocmVzKSA9PiB7XG4gICAgICAgICAgICAgICAgaW1hZ2Uub25sb2FkID0gKCkgPT4gcmVzKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBpbWFnZTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgc3RhdGljIHBhcnNlVGV4dHVyZXMoZ2wsIGRlc2MsIGltYWdlcykge1xuICAgICAgICBpZiAoIWRlc2MudGV4dHVyZXMpIHJldHVybiBudWxsO1xuICAgICAgICByZXR1cm4gZGVzYy50ZXh0dXJlcy5tYXAoKHsgc2FtcGxlcjogc2FtcGxlckluZGV4LCBzb3VyY2U6IHNvdXJjZUluZGV4LCBuYW1lLCBleHRlbnNpb25zLCBleHRyYXMgfSkgPT4ge1xuICAgICAgICAgICAgY29uc3Qgb3B0aW9ucyA9IHtcbiAgICAgICAgICAgICAgICBmbGlwWTogZmFsc2UsXG4gICAgICAgICAgICAgICAgd3JhcFM6IGdsLlJFUEVBVCwgLy8gUmVwZWF0IGJ5IGRlZmF1bHQsIG9wcG9zZWQgdG8gT0dMJ3MgY2xhbXAgYnkgZGVmYXVsdFxuICAgICAgICAgICAgICAgIHdyYXBUOiBnbC5SRVBFQVQsXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgY29uc3Qgc2FtcGxlciA9IHNhbXBsZXJJbmRleCAhPT0gdW5kZWZpbmVkID8gZGVzYy5zYW1wbGVyc1tzYW1wbGVySW5kZXhdIDogbnVsbDtcbiAgICAgICAgICAgIGlmIChzYW1wbGVyKSB7XG4gICAgICAgICAgICAgICAgWydtYWdGaWx0ZXInLCAnbWluRmlsdGVyJywgJ3dyYXBTJywgJ3dyYXBUJ10uZm9yRWFjaCgocHJvcCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoc2FtcGxlcltwcm9wXSkgb3B0aW9uc1twcm9wXSA9IHNhbXBsZXJbcHJvcF07XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCB0ZXh0dXJlID0gbmV3IFRleHR1cmUoZ2wsIG9wdGlvbnMpO1xuICAgICAgICAgICAgdGV4dHVyZS5uYW1lID0gbmFtZTtcbiAgICAgICAgICAgIGNvbnN0IGltYWdlID0gaW1hZ2VzW3NvdXJjZUluZGV4XTtcbiAgICAgICAgICAgIGltYWdlLnJlYWR5LnRoZW4oKCkgPT4gKHRleHR1cmUuaW1hZ2UgPSBpbWFnZSkpO1xuXG4gICAgICAgICAgICByZXR1cm4gdGV4dHVyZTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgc3RhdGljIHBhcnNlTWF0ZXJpYWxzKGdsLCBkZXNjLCB0ZXh0dXJlcykge1xuICAgICAgICBpZiAoIWRlc2MubWF0ZXJpYWxzKSByZXR1cm4gbnVsbDtcbiAgICAgICAgcmV0dXJuIGRlc2MubWF0ZXJpYWxzLm1hcChcbiAgICAgICAgICAgICh7XG4gICAgICAgICAgICAgICAgbmFtZSxcbiAgICAgICAgICAgICAgICBleHRlbnNpb25zLFxuICAgICAgICAgICAgICAgIGV4dHJhcyxcbiAgICAgICAgICAgICAgICBwYnJNZXRhbGxpY1JvdWdobmVzcyA9IHt9LFxuICAgICAgICAgICAgICAgIG5vcm1hbFRleHR1cmUsXG4gICAgICAgICAgICAgICAgb2NjbHVzaW9uVGV4dHVyZSxcbiAgICAgICAgICAgICAgICBlbWlzc2l2ZVRleHR1cmUsXG4gICAgICAgICAgICAgICAgZW1pc3NpdmVGYWN0b3IgPSBbMCwgMCwgMF0sXG4gICAgICAgICAgICAgICAgYWxwaGFNb2RlID0gJ09QQVFVRScsXG4gICAgICAgICAgICAgICAgYWxwaGFDdXRvZmYgPSAwLjUsXG4gICAgICAgICAgICAgICAgZG91YmxlU2lkZWQgPSBmYWxzZSxcbiAgICAgICAgICAgIH0pID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCB7XG4gICAgICAgICAgICAgICAgICAgIGJhc2VDb2xvckZhY3RvciA9IFsxLCAxLCAxLCAxXSxcbiAgICAgICAgICAgICAgICAgICAgYmFzZUNvbG9yVGV4dHVyZSxcbiAgICAgICAgICAgICAgICAgICAgbWV0YWxsaWNGYWN0b3IgPSAxLFxuICAgICAgICAgICAgICAgICAgICByb3VnaG5lc3NGYWN0b3IgPSAxLFxuICAgICAgICAgICAgICAgICAgICBtZXRhbGxpY1JvdWdobmVzc1RleHR1cmUsXG4gICAgICAgICAgICAgICAgICAgIC8vICAgZXh0ZW5zaW9ucyxcbiAgICAgICAgICAgICAgICAgICAgLy8gICBleHRyYXMsXG4gICAgICAgICAgICAgICAgfSA9IHBick1ldGFsbGljUm91Z2huZXNzO1xuXG4gICAgICAgICAgICAgICAgaWYgKGJhc2VDb2xvclRleHR1cmUpIHtcbiAgICAgICAgICAgICAgICAgICAgYmFzZUNvbG9yVGV4dHVyZS50ZXh0dXJlID0gdGV4dHVyZXNbYmFzZUNvbG9yVGV4dHVyZS5pbmRleF07XG4gICAgICAgICAgICAgICAgICAgIC8vIHRleENvb3JkXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChub3JtYWxUZXh0dXJlKSB7XG4gICAgICAgICAgICAgICAgICAgIG5vcm1hbFRleHR1cmUudGV4dHVyZSA9IHRleHR1cmVzW25vcm1hbFRleHR1cmUuaW5kZXhdO1xuICAgICAgICAgICAgICAgICAgICAvLyBzY2FsZTogMVxuICAgICAgICAgICAgICAgICAgICAvLyB0ZXhDb29yZFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAobWV0YWxsaWNSb3VnaG5lc3NUZXh0dXJlKSB7XG4gICAgICAgICAgICAgICAgICAgIG1ldGFsbGljUm91Z2huZXNzVGV4dHVyZS50ZXh0dXJlID0gdGV4dHVyZXNbbWV0YWxsaWNSb3VnaG5lc3NUZXh0dXJlLmluZGV4XTtcbiAgICAgICAgICAgICAgICAgICAgLy8gdGV4Q29vcmRcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKG9jY2x1c2lvblRleHR1cmUpIHtcbiAgICAgICAgICAgICAgICAgICAgb2NjbHVzaW9uVGV4dHVyZS50ZXh0dXJlID0gdGV4dHVyZXNbb2NjbHVzaW9uVGV4dHVyZS5pbmRleF07XG4gICAgICAgICAgICAgICAgICAgIC8vIHN0cmVuZ3RoIDFcbiAgICAgICAgICAgICAgICAgICAgLy8gdGV4Q29vcmRcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGVtaXNzaXZlVGV4dHVyZSkge1xuICAgICAgICAgICAgICAgICAgICBlbWlzc2l2ZVRleHR1cmUudGV4dHVyZSA9IHRleHR1cmVzW2VtaXNzaXZlVGV4dHVyZS5pbmRleF07XG4gICAgICAgICAgICAgICAgICAgIC8vIHRleENvb3JkXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgbmFtZSxcbiAgICAgICAgICAgICAgICAgICAgYmFzZUNvbG9yRmFjdG9yLFxuICAgICAgICAgICAgICAgICAgICBiYXNlQ29sb3JUZXh0dXJlLFxuICAgICAgICAgICAgICAgICAgICBtZXRhbGxpY0ZhY3RvcixcbiAgICAgICAgICAgICAgICAgICAgcm91Z2huZXNzRmFjdG9yLFxuICAgICAgICAgICAgICAgICAgICBtZXRhbGxpY1JvdWdobmVzc1RleHR1cmUsXG4gICAgICAgICAgICAgICAgICAgIG5vcm1hbFRleHR1cmUsXG4gICAgICAgICAgICAgICAgICAgIG9jY2x1c2lvblRleHR1cmUsXG4gICAgICAgICAgICAgICAgICAgIGVtaXNzaXZlVGV4dHVyZSxcbiAgICAgICAgICAgICAgICAgICAgZW1pc3NpdmVGYWN0b3IsXG4gICAgICAgICAgICAgICAgICAgIGFscGhhTW9kZSxcbiAgICAgICAgICAgICAgICAgICAgYWxwaGFDdXRvZmYsXG4gICAgICAgICAgICAgICAgICAgIGRvdWJsZVNpZGVkLFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgc3RhdGljIHBhcnNlU2tpbnMoZ2wsIGRlc2MsIGJ1ZmZlclZpZXdzKSB7XG4gICAgICAgIGlmICghZGVzYy5za2lucykgcmV0dXJuIG51bGw7XG4gICAgICAgIHJldHVybiBkZXNjLnNraW5zLm1hcChcbiAgICAgICAgICAgICh7XG4gICAgICAgICAgICAgICAgaW52ZXJzZUJpbmRNYXRyaWNlcywgLy8gb3B0aW9uYWxcbiAgICAgICAgICAgICAgICBza2VsZXRvbiwgLy8gb3B0aW9uYWxcbiAgICAgICAgICAgICAgICBqb2ludHMsIC8vIHJlcXVpcmVkXG4gICAgICAgICAgICAgICAgLy8gbmFtZSxcbiAgICAgICAgICAgICAgICAvLyBleHRlbnNpb25zLFxuICAgICAgICAgICAgICAgIC8vIGV4dHJhcyxcbiAgICAgICAgICAgIH0pID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBpbnZlcnNlQmluZE1hdHJpY2VzOiB0aGlzLnBhcnNlQWNjZXNzb3IoaW52ZXJzZUJpbmRNYXRyaWNlcywgZGVzYywgYnVmZmVyVmlld3MpLFxuICAgICAgICAgICAgICAgICAgICBza2VsZXRvbixcbiAgICAgICAgICAgICAgICAgICAgam9pbnRzLFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgc3RhdGljIHBhcnNlTWVzaGVzKGdsLCBkZXNjLCBidWZmZXJWaWV3cywgbWF0ZXJpYWxzLCBza2lucykge1xuICAgICAgICBpZiAoIWRlc2MubWVzaGVzKSByZXR1cm4gbnVsbDtcbiAgICAgICAgcmV0dXJuIGRlc2MubWVzaGVzLm1hcChcbiAgICAgICAgICAgIChcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHByaW1pdGl2ZXMsIC8vIHJlcXVpcmVkXG4gICAgICAgICAgICAgICAgICAgIHdlaWdodHMsIC8vIG9wdGlvbmFsXG4gICAgICAgICAgICAgICAgICAgIG5hbWUsIC8vIG9wdGlvbmFsXG4gICAgICAgICAgICAgICAgICAgIGV4dGVuc2lvbnMsIC8vIG9wdGlvbmFsXG4gICAgICAgICAgICAgICAgICAgIGV4dHJhcywgLy8gb3B0aW9uYWxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIG1lc2hJbmRleFxuICAgICAgICAgICAgKSA9PiB7XG4gICAgICAgICAgICAgICAgLy8gVE9ETzogd2VpZ2h0cyBzdHVmZiA/XG4gICAgICAgICAgICAgICAgLy8gUGFyc2UgdGhyb3VnaCBub2RlcyB0byBzZWUgaG93IG1hbnkgaW5zdGFuY2VzIHRoZXJlIGFyZVxuICAgICAgICAgICAgICAgIC8vIGFuZCBpZiB0aGVyZSBpcyBhIHNraW4gYXR0YWNoZWRcbiAgICAgICAgICAgICAgICBsZXQgbnVtSW5zdGFuY2VzID0gMDtcbiAgICAgICAgICAgICAgICBsZXQgc2tpbkluZGV4ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgZGVzYy5ub2RlcyAmJlxuICAgICAgICAgICAgICAgICAgICBkZXNjLm5vZGVzLmZvckVhY2goKHsgbWVzaCwgc2tpbiB9KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobWVzaCA9PT0gbWVzaEluZGV4KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbnVtSW5zdGFuY2VzKys7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHNraW4gIT09IHVuZGVmaW5lZCkgc2tpbkluZGV4ID0gc2tpbjtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBwcmltaXRpdmVzID0gdGhpcy5wYXJzZVByaW1pdGl2ZXMoZ2wsIHByaW1pdGl2ZXMsIGRlc2MsIGJ1ZmZlclZpZXdzLCBtYXRlcmlhbHMsIG51bUluc3RhbmNlcykubWFwKCh7IGdlb21ldHJ5LCBwcm9ncmFtLCBtb2RlIH0pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgLy8gQ3JlYXRlIGVpdGhlciBza2lubmVkIG1lc2ggb3IgcmVndWxhciBtZXNoXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG1lc2ggPVxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZW9mIHNraW5JbmRleCA9PT0gJ251bWJlcidcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA/IG5ldyBHTFRGU2tpbihnbCwgeyBza2VsZXRvbjogc2tpbnNbc2tpbkluZGV4XSwgZ2VvbWV0cnksIHByb2dyYW0sIG1vZGUgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IG5ldyBNZXNoKGdsLCB7IGdlb21ldHJ5LCBwcm9ncmFtLCBtb2RlIH0pO1xuICAgICAgICAgICAgICAgICAgICBtZXNoLm5hbWUgPSBuYW1lO1xuICAgICAgICAgICAgICAgICAgICBpZiAobWVzaC5nZW9tZXRyeS5pc0luc3RhbmNlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gVGFnIG1lc2ggc28gdGhhdCBub2RlcyBjYW4gYWRkIHRoZWlyIHRyYW5zZm9ybXMgdG8gdGhlIGluc3RhbmNlIGF0dHJpYnV0ZVxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzaC5udW1JbnN0YW5jZXMgPSBudW1JbnN0YW5jZXM7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBBdm9pZCBpbmNvcnJlY3QgY3VsbGluZyBmb3IgaW5zdGFuY2VzXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNoLmZydXN0dW1DdWxsZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbWVzaDtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHByaW1pdGl2ZXMsXG4gICAgICAgICAgICAgICAgICAgIHdlaWdodHMsXG4gICAgICAgICAgICAgICAgICAgIG5hbWUsXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgcGFyc2VQcmltaXRpdmVzKGdsLCBwcmltaXRpdmVzLCBkZXNjLCBidWZmZXJWaWV3cywgbWF0ZXJpYWxzLCBudW1JbnN0YW5jZXMpIHtcbiAgICAgICAgcmV0dXJuIHByaW1pdGl2ZXMubWFwKFxuICAgICAgICAgICAgKHtcbiAgICAgICAgICAgICAgICBhdHRyaWJ1dGVzLCAvLyByZXF1aXJlZFxuICAgICAgICAgICAgICAgIGluZGljZXMsIC8vIG9wdGlvbmFsXG4gICAgICAgICAgICAgICAgbWF0ZXJpYWw6IG1hdGVyaWFsSW5kZXgsIC8vIG9wdGlvbmFsXG4gICAgICAgICAgICAgICAgbW9kZSA9IDQsIC8vIG9wdGlvbmFsXG4gICAgICAgICAgICAgICAgdGFyZ2V0cywgLy8gb3B0aW9uYWxcbiAgICAgICAgICAgICAgICBleHRlbnNpb25zLCAvLyBvcHRpb25hbFxuICAgICAgICAgICAgICAgIGV4dHJhcywgLy8gb3B0aW9uYWxcbiAgICAgICAgICAgIH0pID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBnZW9tZXRyeSA9IG5ldyBHZW9tZXRyeShnbCk7XG5cbiAgICAgICAgICAgICAgICAvLyBBZGQgZWFjaCBhdHRyaWJ1dGUgZm91bmQgaW4gcHJpbWl0aXZlXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgYXR0ciBpbiBhdHRyaWJ1dGVzKSB7XG4gICAgICAgICAgICAgICAgICAgIGdlb21ldHJ5LmFkZEF0dHJpYnV0ZShBVFRSSUJVVEVTW2F0dHJdLCB0aGlzLnBhcnNlQWNjZXNzb3IoYXR0cmlidXRlc1thdHRyXSwgZGVzYywgYnVmZmVyVmlld3MpKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBBZGQgaW5kZXggYXR0cmlidXRlIGlmIGZvdW5kXG4gICAgICAgICAgICAgICAgaWYgKGluZGljZXMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICBnZW9tZXRyeS5hZGRBdHRyaWJ1dGUoJ2luZGV4JywgdGhpcy5wYXJzZUFjY2Vzc29yKGluZGljZXMsIGRlc2MsIGJ1ZmZlclZpZXdzKSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gQWRkIGluc3RhbmNlZCB0cmFuc2Zvcm0gYXR0cmlidXRlIGlmIG11bHRpcGxlIGluc3RhbmNlc1xuICAgICAgICAgICAgICAgIGlmIChudW1JbnN0YW5jZXMgPiAxKSB7XG4gICAgICAgICAgICAgICAgICAgIGdlb21ldHJ5LmFkZEF0dHJpYnV0ZSgnaW5zdGFuY2VNYXRyaXgnLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbnN0YW5jZWQ6IDEsXG4gICAgICAgICAgICAgICAgICAgICAgICBzaXplOiAxNixcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IG5ldyBGbG9hdDMyQXJyYXkobnVtSW5zdGFuY2VzICogMTYpLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBUT0RPOiBtYXRlcmlhbHNcbiAgICAgICAgICAgICAgICBjb25zdCBwcm9ncmFtID0gbmV3IE5vcm1hbFByb2dyYW0oZ2wpO1xuICAgICAgICAgICAgICAgIGlmIChtYXRlcmlhbEluZGV4ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgcHJvZ3JhbS5nbHRmTWF0ZXJpYWwgPSBtYXRlcmlhbHNbbWF0ZXJpYWxJbmRleF07XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgZ2VvbWV0cnksXG4gICAgICAgICAgICAgICAgICAgIHByb2dyYW0sXG4gICAgICAgICAgICAgICAgICAgIG1vZGUsXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgcGFyc2VBY2Nlc3NvcihpbmRleCwgZGVzYywgYnVmZmVyVmlld3MpIHtcbiAgICAgICAgLy8gVE9ETzogaW5pdCBtaXNzaW5nIGJ1ZmZlclZpZXcgd2l0aCAwc1xuICAgICAgICAvLyBUT0RPOiBzdXBwb3J0IHNwYXJzZVxuXG4gICAgICAgIGNvbnN0IHtcbiAgICAgICAgICAgIGJ1ZmZlclZpZXc6IGJ1ZmZlclZpZXdJbmRleCwgLy8gb3B0aW9uYWxcbiAgICAgICAgICAgIGJ5dGVPZmZzZXQgPSAwLCAvLyBvcHRpb25hbFxuICAgICAgICAgICAgY29tcG9uZW50VHlwZSwgLy8gcmVxdWlyZWRcbiAgICAgICAgICAgIG5vcm1hbGl6ZWQgPSBmYWxzZSwgLy8gb3B0aW9uYWxcbiAgICAgICAgICAgIGNvdW50LCAvLyByZXF1aXJlZFxuICAgICAgICAgICAgdHlwZSwgLy8gcmVxdWlyZWRcbiAgICAgICAgICAgIG1pbiwgLy8gb3B0aW9uYWxcbiAgICAgICAgICAgIG1heCwgLy8gb3B0aW9uYWxcbiAgICAgICAgICAgIHNwYXJzZSwgLy8gb3B0aW9uYWxcbiAgICAgICAgICAgIC8vIG5hbWUsIC8vIG9wdGlvbmFsXG4gICAgICAgICAgICAvLyBleHRlbnNpb25zLCAvLyBvcHRpb25hbFxuICAgICAgICAgICAgLy8gZXh0cmFzLCAvLyBvcHRpb25hbFxuICAgICAgICB9ID0gZGVzYy5hY2Nlc3NvcnNbaW5kZXhdO1xuXG4gICAgICAgIGNvbnN0IHtcbiAgICAgICAgICAgIGRhdGEsIC8vIGF0dGFjaGVkIGluIHBhcnNlQnVmZmVyVmlld3NcbiAgICAgICAgICAgIG9yaWdpbmFsQnVmZmVyLCAvLyBhdHRhY2hlZCBpbiBwYXJzZUJ1ZmZlclZpZXdzXG4gICAgICAgICAgICBidWZmZXIsIC8vIHJlcGxhY2VkIHRvIGJlIHRoZSBhY3R1YWwgR0wgYnVmZmVyXG4gICAgICAgICAgICBieXRlT2Zmc2V0OiBidWZmZXJCeXRlT2Zmc2V0ID0gMCxcbiAgICAgICAgICAgIC8vIGJ5dGVMZW5ndGgsIC8vIGFwcGxpZWQgaW4gcGFyc2VCdWZmZXJWaWV3c1xuICAgICAgICAgICAgYnl0ZVN0cmlkZSA9IDAsXG4gICAgICAgICAgICB0YXJnZXQsXG4gICAgICAgICAgICAvLyBuYW1lLFxuICAgICAgICAgICAgLy8gZXh0ZW5zaW9ucyxcbiAgICAgICAgICAgIC8vIGV4dHJhcyxcbiAgICAgICAgfSA9IGJ1ZmZlclZpZXdzW2J1ZmZlclZpZXdJbmRleF07XG5cbiAgICAgICAgY29uc3Qgc2l6ZSA9IFRZUEVfU0laRVt0eXBlXTtcblxuICAgICAgICAvLyBQYXJzZSBkYXRhIGZyb20gam9pbmVkIGJ1ZmZlcnNcbiAgICAgICAgY29uc3QgVHlwZUFycmF5ID0gVFlQRV9BUlJBWVtjb21wb25lbnRUeXBlXTtcbiAgICAgICAgY29uc3QgZWxlbWVudEJ5dGVzID0gZGF0YS5CWVRFU19QRVJfRUxFTUVOVDtcbiAgICAgICAgY29uc3QgY29tcG9uZW50T2Zmc2V0ID0gYnl0ZU9mZnNldCAvIGVsZW1lbnRCeXRlcztcbiAgICAgICAgY29uc3QgY29tcG9uZW50U3RyaWRlID0gYnl0ZVN0cmlkZSAvIGVsZW1lbnRCeXRlcztcbiAgICAgICAgY29uc3QgaXNJbnRlcmxlYXZlZCA9ICEhYnl0ZVN0cmlkZSAmJiBjb21wb25lbnRTdHJpZGUgIT09IHNpemU7XG5cbiAgICAgICAgLy8gVE9ETzogaW50ZXJsZWF2ZWRcbiAgICAgICAgY29uc3QgbmV3RGF0YSA9IGlzSW50ZXJsZWF2ZWQgPyBkYXRhIDogbmV3IFR5cGVBcnJheShvcmlnaW5hbEJ1ZmZlciwgYnl0ZU9mZnNldCArIGJ1ZmZlckJ5dGVPZmZzZXQsIGNvdW50ICogc2l6ZSk7XG5cbiAgICAgICAgLy8gUmV0dXJuIGF0dHJpYnV0ZSBkYXRhXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBkYXRhOiBuZXdEYXRhLFxuICAgICAgICAgICAgc2l6ZSxcbiAgICAgICAgICAgIHR5cGU6IGNvbXBvbmVudFR5cGUsXG4gICAgICAgICAgICBub3JtYWxpemVkLFxuICAgICAgICAgICAgYnVmZmVyLFxuICAgICAgICAgICAgc3RyaWRlOiBieXRlU3RyaWRlLFxuICAgICAgICAgICAgb2Zmc2V0OiBieXRlT2Zmc2V0LFxuICAgICAgICAgICAgY291bnQsXG4gICAgICAgICAgICBtaW4sXG4gICAgICAgICAgICBtYXgsXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgc3RhdGljIHBhcnNlTm9kZXMoZ2wsIGRlc2MsIG1lc2hlcywgc2tpbnMpIHtcbiAgICAgICAgaWYgKCFkZXNjLm5vZGVzKSByZXR1cm4gbnVsbDtcbiAgICAgICAgY29uc3Qgbm9kZXMgPSBkZXNjLm5vZGVzLm1hcChcbiAgICAgICAgICAgICh7XG4gICAgICAgICAgICAgICAgY2FtZXJhLCAvLyBvcHRpb25hbFxuICAgICAgICAgICAgICAgIGNoaWxkcmVuLCAvLyBvcHRpb25hbFxuICAgICAgICAgICAgICAgIHNraW46IHNraW5JbmRleCwgLy8gb3B0aW9uYWxcbiAgICAgICAgICAgICAgICBtYXRyaXgsIC8vIG9wdGlvbmFsXG4gICAgICAgICAgICAgICAgbWVzaDogbWVzaEluZGV4LCAvLyBvcHRpb25hbFxuICAgICAgICAgICAgICAgIHJvdGF0aW9uLCAvLyBvcHRpb25hbFxuICAgICAgICAgICAgICAgIHNjYWxlLCAvLyBvcHRpb25hbFxuICAgICAgICAgICAgICAgIHRyYW5zbGF0aW9uLCAvLyBvcHRpb25hbFxuICAgICAgICAgICAgICAgIHdlaWdodHMsIC8vIG9wdGlvbmFsXG4gICAgICAgICAgICAgICAgbmFtZSwgLy8gb3B0aW9uYWxcbiAgICAgICAgICAgICAgICBleHRlbnNpb25zLCAvLyBvcHRpb25hbFxuICAgICAgICAgICAgICAgIGV4dHJhcywgLy8gb3B0aW9uYWxcbiAgICAgICAgICAgIH0pID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBub2RlID0gbmV3IFRyYW5zZm9ybSgpO1xuICAgICAgICAgICAgICAgIGlmIChuYW1lKSBub2RlLm5hbWUgPSBuYW1lO1xuXG4gICAgICAgICAgICAgICAgLy8gQXBwbHkgdHJhbnNmb3JtYXRpb25zXG4gICAgICAgICAgICAgICAgaWYgKG1hdHJpeCkge1xuICAgICAgICAgICAgICAgICAgICBub2RlLm1hdHJpeC5jb3B5KG1hdHJpeCk7XG4gICAgICAgICAgICAgICAgICAgIG5vZGUuZGVjb21wb3NlKCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJvdGF0aW9uKSBub2RlLnF1YXRlcm5pb24uY29weShyb3RhdGlvbik7XG4gICAgICAgICAgICAgICAgICAgIGlmIChzY2FsZSkgbm9kZS5zY2FsZS5jb3B5KHNjYWxlKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRyYW5zbGF0aW9uKSBub2RlLnBvc2l0aW9uLmNvcHkodHJhbnNsYXRpb24pO1xuICAgICAgICAgICAgICAgICAgICBub2RlLnVwZGF0ZU1hdHJpeCgpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIEZsYWdzIGZvciBhdm9pZGluZyBkdXBsaWNhdGUgdHJhbnNmb3JtcyBhbmQgcmVtb3ZpbmcgdW51c2VkIGluc3RhbmNlIG5vZGVzXG4gICAgICAgICAgICAgICAgbGV0IGlzSW5zdGFuY2VkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgbGV0IGlzRmlyc3RJbnN0YW5jZSA9IHRydWU7XG5cbiAgICAgICAgICAgICAgICAvLyBhZGQgbWVzaCBpZiBpbmNsdWRlZFxuICAgICAgICAgICAgICAgIGlmIChtZXNoSW5kZXggIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICBtZXNoZXNbbWVzaEluZGV4XS5wcmltaXRpdmVzLmZvckVhY2goKG1lc2gpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChtZXNoLmdlb21ldHJ5LmlzSW5zdGFuY2VkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNJbnN0YW5jZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghbWVzaC5pbnN0YW5jZUNvdW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lc2guaW5zdGFuY2VDb3VudCA9IDA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNGaXJzdEluc3RhbmNlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vZGUubWF0cml4LnRvQXJyYXkobWVzaC5nZW9tZXRyeS5hdHRyaWJ1dGVzLmluc3RhbmNlTWF0cml4LmRhdGEsIG1lc2guaW5zdGFuY2VDb3VudCAqIDE2KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXNoLmluc3RhbmNlQ291bnQrKztcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChtZXNoLmluc3RhbmNlQ291bnQgPT09IG1lc2gubnVtSW5zdGFuY2VzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFJlbW92ZSBwcm9wZXJ0aWVzIG9uY2UgYWxsIGluc3RhbmNlcyBhZGRlZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWxldGUgbWVzaC5udW1JbnN0YW5jZXM7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBtZXNoLmluc3RhbmNlQ291bnQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEZsYWcgYXR0cmlidXRlIGFzIGRpcnR5XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lc2guZ2VvbWV0cnkuYXR0cmlidXRlcy5pbnN0YW5jZU1hdHJpeC5uZWVkc1VwZGF0ZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBGb3IgaW5zdGFuY2VzLCBvbmx5IHRoZSBmaXJzdCBub2RlIHdpbGwgYWN0dWFsbHkgaGF2ZSB0aGUgbWVzaFxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGlzSW5zdGFuY2VkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGlzRmlyc3RJbnN0YW5jZSkgbWVzaC5zZXRQYXJlbnQobm9kZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lc2guc2V0UGFyZW50KG5vZGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBSZXNldCBub2RlIGlmIGluc3RhbmNlZCB0byBub3QgZHVwbGljYXRlIHRyYW5zZm9ybXNcbiAgICAgICAgICAgICAgICBpZiAoaXNJbnN0YW5jZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gUmVtb3ZlIHVudXNlZCBub2RlcyBqdXN0IHByb3ZpZGluZyBhbiBpbnN0YW5jZSB0cmFuc2Zvcm1cbiAgICAgICAgICAgICAgICAgICAgaWYgKCFpc0ZpcnN0SW5zdGFuY2UpIHJldHVybiBudWxsO1xuICAgICAgICAgICAgICAgICAgICAvLyBBdm9pZCBkdXBsaWNhdGUgdHJhbnNmb3JtIGZvciBub2RlIGNvbnRhaW5pbmcgdGhlIGluc3RhbmNlZCBtZXNoXG4gICAgICAgICAgICAgICAgICAgIG5vZGUubWF0cml4LmlkZW50aXR5KCk7XG4gICAgICAgICAgICAgICAgICAgIG5vZGUuZGVjb21wb3NlKCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIG5vZGU7XG4gICAgICAgICAgICB9XG4gICAgICAgICk7XG5cbiAgICAgICAgZGVzYy5ub2Rlcy5mb3JFYWNoKCh7IGNoaWxkcmVuID0gW10gfSwgaSkgPT4ge1xuICAgICAgICAgICAgLy8gU2V0IGhpZXJhcmNoeSBub3cgYWxsIG5vZGVzIGNyZWF0ZWRcbiAgICAgICAgICAgIGNoaWxkcmVuLmZvckVhY2goKGNoaWxkSW5kZXgpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoIW5vZGVzW2NoaWxkSW5kZXhdKSByZXR1cm47XG4gICAgICAgICAgICAgICAgbm9kZXNbY2hpbGRJbmRleF0uc2V0UGFyZW50KG5vZGVzW2ldKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gbm9kZXM7XG4gICAgfVxuXG4gICAgc3RhdGljIHBvcHVsYXRlU2tpbnMoc2tpbnMsIG5vZGVzKSB7XG4gICAgICAgIGlmICghc2tpbnMpIHJldHVybjtcbiAgICAgICAgc2tpbnMuZm9yRWFjaCgoc2tpbikgPT4ge1xuICAgICAgICAgICAgc2tpbi5qb2ludHMgPSBza2luLmpvaW50cy5tYXAoKGksIGluZGV4KSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3Qgam9pbnQgPSBub2Rlc1tpXTtcbiAgICAgICAgICAgICAgICBqb2ludC5iaW5kSW52ZXJzZSA9IG5ldyBNYXQ0KC4uLnNraW4uaW52ZXJzZUJpbmRNYXRyaWNlcy5kYXRhLnNsaWNlKGluZGV4ICogMTYsIChpbmRleCArIDEpICogMTYpKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gam9pbnQ7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlmIChza2luLnNrZWxldG9uKSBza2luLnNrZWxldG9uID0gbm9kZXNbc2tpbi5za2VsZXRvbl07XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHN0YXRpYyBwYXJzZUFuaW1hdGlvbnMoZ2wsIGRlc2MsIG5vZGVzLCBidWZmZXJWaWV3cykge1xuICAgICAgICBpZiAoIWRlc2MuYW5pbWF0aW9ucykgcmV0dXJuIG51bGw7XG4gICAgICAgIHJldHVybiBkZXNjLmFuaW1hdGlvbnMubWFwKFxuICAgICAgICAgICAgKHtcbiAgICAgICAgICAgICAgICBjaGFubmVscywgLy8gcmVxdWlyZWRcbiAgICAgICAgICAgICAgICBzYW1wbGVycywgLy8gcmVxdWlyZWRcbiAgICAgICAgICAgICAgICBuYW1lLCAvLyBvcHRpb25hbFxuICAgICAgICAgICAgICAgIC8vIGV4dGVuc2lvbnMsIC8vIG9wdGlvbmFsXG4gICAgICAgICAgICAgICAgLy8gZXh0cmFzLCAgLy8gb3B0aW9uYWxcbiAgICAgICAgICAgIH0pID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBkYXRhID0gY2hhbm5lbHMubWFwKFxuICAgICAgICAgICAgICAgICAgICAoe1xuICAgICAgICAgICAgICAgICAgICAgICAgc2FtcGxlcjogc2FtcGxlckluZGV4LCAvLyByZXF1aXJlZFxuICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0LCAvLyByZXF1aXJlZFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gZXh0ZW5zaW9ucywgLy8gb3B0aW9uYWxcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGV4dHJhcywgLy8gb3B0aW9uYWxcbiAgICAgICAgICAgICAgICAgICAgfSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlucHV0OiBpbnB1dEluZGV4LCAvLyByZXF1aXJlZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGludGVycG9sYXRpb24gPSAnTElORUFSJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvdXRwdXQ6IG91dHB1dEluZGV4LCAvLyByZXF1aXJlZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGV4dGVuc2lvbnMsIC8vIG9wdGlvbmFsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gZXh0cmFzLCAvLyBvcHRpb25hbFxuICAgICAgICAgICAgICAgICAgICAgICAgfSA9IHNhbXBsZXJzW3NhbXBsZXJJbmRleF07XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBub2RlOiBub2RlSW5kZXgsIC8vIG9wdGlvbmFsIC0gVE9ETzogd2hlbiBpcyBpdCBub3QgaW5jbHVkZWQ/XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGF0aCwgLy8gcmVxdWlyZWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBleHRlbnNpb25zLCAvLyBvcHRpb25hbFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGV4dHJhcywgLy8gb3B0aW9uYWxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gPSB0YXJnZXQ7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG5vZGUgPSBub2Rlc1tub2RlSW5kZXhdO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdHJhbnNmb3JtID0gVFJBTlNGT1JNU1twYXRoXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHRpbWVzID0gdGhpcy5wYXJzZUFjY2Vzc29yKGlucHV0SW5kZXgsIGRlc2MsIGJ1ZmZlclZpZXdzKS5kYXRhO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdmFsdWVzID0gdGhpcy5wYXJzZUFjY2Vzc29yKG91dHB1dEluZGV4LCBkZXNjLCBidWZmZXJWaWV3cykuZGF0YTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBub2RlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRyYW5zZm9ybSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnRlcnBvbGF0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpbWVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlcyxcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICApO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgbmFtZSxcbiAgICAgICAgICAgICAgICAgICAgYW5pbWF0aW9uOiBuZXcgR0xURkFuaW1hdGlvbihkYXRhKSxcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICApO1xuICAgIH1cblxuICAgIHN0YXRpYyBwYXJzZVNjZW5lcyhkZXNjLCBub2Rlcykge1xuICAgICAgICBpZiAoIWRlc2Muc2NlbmVzKSByZXR1cm4gbnVsbDtcbiAgICAgICAgcmV0dXJuIGRlc2Muc2NlbmVzLm1hcChcbiAgICAgICAgICAgICh7XG4gICAgICAgICAgICAgICAgbm9kZXM6IG5vZGVzSW5kaWNlcyA9IFtdLFxuICAgICAgICAgICAgICAgIG5hbWUsIC8vIG9wdGlvbmFsXG4gICAgICAgICAgICAgICAgZXh0ZW5zaW9ucyxcbiAgICAgICAgICAgICAgICBleHRyYXMsXG4gICAgICAgICAgICB9KSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5vZGVzSW5kaWNlcy5yZWR1Y2UoKG1hcCwgaSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAvLyBEb24ndCBhZGQgbnVsbCBub2RlcyAoaW5zdGFuY2VkIHRyYW5zZm9ybXMpXG4gICAgICAgICAgICAgICAgICAgIGlmIChub2Rlc1tpXSkgbWFwLnB1c2gobm9kZXNbaV0pO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbWFwO1xuICAgICAgICAgICAgICAgIH0sIFtdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgKTtcbiAgICB9XG59XG4iLCJpbXBvcnQgeyBNZXNoIH0gZnJvbSAnLi4vY29yZS9NZXNoLmpzJztcbmltcG9ydCB7IE1hdDQgfSBmcm9tICcuLi9tYXRoL01hdDQuanMnO1xuaW1wb3J0IHsgVGV4dHVyZSB9IGZyb20gJy4uL2NvcmUvVGV4dHVyZS5qcyc7XG5cbmNvbnN0IHRlbXBNYXQ0ID0gbmV3IE1hdDQoKTtcbmNvbnN0IGlkZW50aXR5ID0gbmV3IE1hdDQoKTtcblxuZXhwb3J0IGNsYXNzIEdMVEZTa2luIGV4dGVuZHMgTWVzaCB7XG4gICAgY29uc3RydWN0b3IoZ2wsIHsgc2tlbGV0b24sIGdlb21ldHJ5LCBwcm9ncmFtLCBtb2RlID0gZ2wuVFJJQU5HTEVTIH0gPSB7fSkge1xuICAgICAgICBzdXBlcihnbCwgeyBnZW9tZXRyeSwgcHJvZ3JhbSwgbW9kZSB9KTtcbiAgICAgICAgdGhpcy5za2VsZXRvbiA9IHNrZWxldG9uO1xuICAgICAgICB0aGlzLnByb2dyYW0gPSBwcm9ncmFtO1xuICAgICAgICB0aGlzLmNyZWF0ZUJvbmVUZXh0dXJlKCk7XG4gICAgICAgIHRoaXMuYW5pbWF0aW9ucyA9IFtdO1xuICAgIH1cblxuICAgIGNyZWF0ZUJvbmVUZXh0dXJlKCkge1xuICAgICAgICBpZiAoIXRoaXMuc2tlbGV0b24uam9pbnRzLmxlbmd0aCkgcmV0dXJuO1xuICAgICAgICBjb25zdCBzaXplID0gTWF0aC5tYXgoNCwgTWF0aC5wb3coMiwgTWF0aC5jZWlsKE1hdGgubG9nKE1hdGguc3FydCh0aGlzLnNrZWxldG9uLmpvaW50cy5sZW5ndGggKiA0KSkgLyBNYXRoLkxOMikpKTtcbiAgICAgICAgdGhpcy5ib25lTWF0cmljZXMgPSBuZXcgRmxvYXQzMkFycmF5KHNpemUgKiBzaXplICogNCk7XG4gICAgICAgIHRoaXMuYm9uZVRleHR1cmVTaXplID0gc2l6ZTtcbiAgICAgICAgdGhpcy5ib25lVGV4dHVyZSA9IG5ldyBUZXh0dXJlKHRoaXMuZ2wsIHtcbiAgICAgICAgICAgIGltYWdlOiB0aGlzLmJvbmVNYXRyaWNlcyxcbiAgICAgICAgICAgIGdlbmVyYXRlTWlwbWFwczogZmFsc2UsXG4gICAgICAgICAgICB0eXBlOiB0aGlzLmdsLkZMT0FULFxuICAgICAgICAgICAgaW50ZXJuYWxGb3JtYXQ6IHRoaXMuZ2wucmVuZGVyZXIuaXNXZWJnbDIgPyB0aGlzLmdsLlJHQkEzMkYgOiB0aGlzLmdsLlJHQkEsXG4gICAgICAgICAgICBtaW5GaWx0ZXI6IHRoaXMuZ2wuTkVBUkVTVCxcbiAgICAgICAgICAgIG1hZ0ZpbHRlcjogdGhpcy5nbC5ORUFSRVNULFxuICAgICAgICAgICAgZmxpcFk6IGZhbHNlLFxuICAgICAgICAgICAgd2lkdGg6IHNpemUsXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIGFkZEFuaW1hdGlvbihkYXRhKSB7XG4gICAgLy8gICAgIGNvbnN0IGFuaW1hdGlvbiA9IG5ldyBBbmltYXRpb24oeyBvYmplY3RzOiB0aGlzLmJvbmVzLCBkYXRhIH0pO1xuICAgIC8vICAgICB0aGlzLmFuaW1hdGlvbnMucHVzaChhbmltYXRpb24pO1xuICAgIC8vICAgICByZXR1cm4gYW5pbWF0aW9uO1xuICAgIC8vIH1cblxuICAgIC8vIHVwZGF0ZUFuaW1hdGlvbnMoKSB7XG4gICAgLy8gICAgIC8vIENhbGN1bGF0ZSBjb21iaW5lZCBhbmltYXRpb24gd2VpZ2h0XG4gICAgLy8gICAgIGxldCB0b3RhbCA9IDA7XG4gICAgLy8gICAgIHRoaXMuYW5pbWF0aW9ucy5mb3JFYWNoKChhbmltYXRpb24pID0+ICh0b3RhbCArPSBhbmltYXRpb24ud2VpZ2h0KSk7XG5cbiAgICAvLyAgICAgdGhpcy5hbmltYXRpb25zLmZvckVhY2goKGFuaW1hdGlvbiwgaSkgPT4ge1xuICAgIC8vICAgICAgICAgLy8gZm9yY2UgZmlyc3QgYW5pbWF0aW9uIHRvIHNldCBpbiBvcmRlciB0byByZXNldCBmcmFtZVxuICAgIC8vICAgICAgICAgYW5pbWF0aW9uLnVwZGF0ZSh0b3RhbCwgaSA9PT0gMCk7XG4gICAgLy8gICAgIH0pO1xuICAgIC8vIH1cblxuICAgIHVwZGF0ZVVuaWZvcm1zKCkge1xuICAgICAgICAvLyBVcGRhdGUgYm9uZSB0ZXh0dXJlXG4gICAgICAgIHRoaXMuc2tlbGV0b24uam9pbnRzLmZvckVhY2goKGJvbmUsIGkpID0+IHtcbiAgICAgICAgICAgIC8vIEZpbmQgZGlmZmVyZW5jZSBiZXR3ZWVuIGN1cnJlbnQgYW5kIGJpbmQgcG9zZVxuICAgICAgICAgICAgdGVtcE1hdDQubXVsdGlwbHkoYm9uZS53b3JsZE1hdHJpeCwgYm9uZS5iaW5kSW52ZXJzZSk7XG4gICAgICAgICAgICB0aGlzLmJvbmVNYXRyaWNlcy5zZXQodGVtcE1hdDQsIGkgKiAxNik7XG4gICAgICAgIH0pO1xuICAgICAgICBpZiAodGhpcy5ib25lVGV4dHVyZSkgdGhpcy5ib25lVGV4dHVyZS5uZWVkc1VwZGF0ZSA9IHRydWU7XG4gICAgfVxuXG4gICAgZHJhdyh7IGNhbWVyYSB9ID0ge30pIHtcbiAgICAgICAgaWYgKCF0aGlzLnByb2dyYW0udW5pZm9ybXMuYm9uZVRleHR1cmUpIHtcbiAgICAgICAgICAgIE9iamVjdC5hc3NpZ24odGhpcy5wcm9ncmFtLnVuaWZvcm1zLCB7XG4gICAgICAgICAgICAgICAgYm9uZVRleHR1cmU6IHsgdmFsdWU6IHRoaXMuYm9uZVRleHR1cmUgfSxcbiAgICAgICAgICAgICAgICBib25lVGV4dHVyZVNpemU6IHsgdmFsdWU6IHRoaXMuYm9uZVRleHR1cmVTaXplIH0sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMudXBkYXRlVW5pZm9ybXMoKTtcblxuICAgICAgICAvLyBTd2l0Y2ggdGhlIHdvcmxkIG1hdHJpeCB3aXRoIGlkZW50aXR5IHRvIGlnbm9yZSBhbnkgdHJhbnNmb3Jtc1xuICAgICAgICAvLyBvbiB0aGUgbWVzaCBpdHNlbGYgLSBvbmx5IHVzZSBza2VsZXRvbidzIHRyYW5zZm9ybXNcbiAgICAgICAgY29uc3QgX3dvcmxkTWF0cml4ID0gdGhpcy53b3JsZE1hdHJpeDtcbiAgICAgICAgdGhpcy53b3JsZE1hdHJpeCA9IGlkZW50aXR5O1xuXG4gICAgICAgIHN1cGVyLmRyYXcoeyBjYW1lcmEgfSk7XG5cbiAgICAgICAgLy8gU3dpdGNoIGJhY2sgdG8gbGVhdmUgaWRlbnRpdHkgdW50b3VjaGVkXG4gICAgICAgIHRoaXMud29ybGRNYXRyaXggPSBfd29ybGRNYXRyaXg7XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgUHJvZ3JhbSB9IGZyb20gJy4uL2NvcmUvUHJvZ3JhbS5qcyc7XG5pbXBvcnQgeyBNZXNoIH0gZnJvbSAnLi4vY29yZS9NZXNoLmpzJztcbmltcG9ydCB7IFRleHR1cmUgfSBmcm9tICcuLi9jb3JlL1RleHR1cmUuanMnO1xuaW1wb3J0IHsgUmVuZGVyVGFyZ2V0IH0gZnJvbSAnLi4vY29yZS9SZW5kZXJUYXJnZXQuanMnO1xuaW1wb3J0IHsgVHJpYW5nbGUgfSBmcm9tICcuL1RyaWFuZ2xlLmpzJztcblxuZXhwb3J0IGNsYXNzIEdQR1BVIHtcbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgZ2wsXG4gICAgICAgIHtcbiAgICAgICAgICAgIC8vIEFsd2F5cyBwYXNzIGluIGFycmF5IG9mIHZlYzRzIChSR0JBIHZhbHVlcyB3aXRoaW4gdGV4dHVyZSlcbiAgICAgICAgICAgIGRhdGEgPSBuZXcgRmxvYXQzMkFycmF5KDE2KSxcbiAgICAgICAgICAgIGdlb21ldHJ5ID0gbmV3IFRyaWFuZ2xlKGdsKSxcbiAgICAgICAgICAgIHR5cGUsIC8vIFBhc3MgaW4gZ2wuRkxPQVQgdG8gZm9yY2UgaXQsIGRlZmF1bHRzIHRvIGdsLkhBTEZfRkxPQVRcbiAgICAgICAgfVxuICAgICkge1xuICAgICAgICB0aGlzLmdsID0gZ2w7XG4gICAgICAgIGNvbnN0IGluaXRpYWxEYXRhID0gZGF0YTtcbiAgICAgICAgdGhpcy5wYXNzZXMgPSBbXTtcbiAgICAgICAgdGhpcy5nZW9tZXRyeSA9IGdlb21ldHJ5O1xuICAgICAgICB0aGlzLmRhdGFMZW5ndGggPSBpbml0aWFsRGF0YS5sZW5ndGggLyA0O1xuXG4gICAgICAgIC8vIFdpbmRvd3MgYW5kIGlPUyBvbmx5IGxpa2UgcG93ZXIgb2YgMiB0ZXh0dXJlc1xuICAgICAgICAvLyBGaW5kIHNtYWxsZXN0IFBPMiB0aGF0IGZpdHMgZGF0YVxuICAgICAgICB0aGlzLnNpemUgPSBNYXRoLnBvdygyLCBNYXRoLmNlaWwoTWF0aC5sb2coTWF0aC5jZWlsKE1hdGguc3FydCh0aGlzLmRhdGFMZW5ndGgpKSkgLyBNYXRoLkxOMikpO1xuXG4gICAgICAgIC8vIENyZWF0ZSBjb29yZHMgZm9yIG91dHB1dCB0ZXh0dXJlXG4gICAgICAgIHRoaXMuY29vcmRzID0gbmV3IEZsb2F0MzJBcnJheSh0aGlzLmRhdGFMZW5ndGggKiAyKTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmRhdGFMZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgY29uc3QgeCA9IChpICUgdGhpcy5zaXplKSAvIHRoaXMuc2l6ZTsgLy8gdG8gYWRkIDAuNSB0byBiZSBjZW50ZXIgcGl4ZWwgP1xuICAgICAgICAgICAgY29uc3QgeSA9IE1hdGguZmxvb3IoaSAvIHRoaXMuc2l6ZSkgLyB0aGlzLnNpemU7XG4gICAgICAgICAgICB0aGlzLmNvb3Jkcy5zZXQoW3gsIHldLCBpICogMik7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBVc2Ugb3JpZ2luYWwgZGF0YSBpZiBhbHJlYWR5IGNvcnJlY3QgbGVuZ3RoIG9mIFBPMiB0ZXh0dXJlLCBlbHNlIGNvcHkgdG8gbmV3IGFycmF5IG9mIGNvcnJlY3QgbGVuZ3RoXG4gICAgICAgIGNvbnN0IGZsb2F0QXJyYXkgPSAoKCkgPT4ge1xuICAgICAgICAgICAgaWYgKGluaXRpYWxEYXRhLmxlbmd0aCA9PT0gdGhpcy5zaXplICogdGhpcy5zaXplICogNCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBpbml0aWFsRGF0YTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc3QgYSA9IG5ldyBGbG9hdDMyQXJyYXkodGhpcy5zaXplICogdGhpcy5zaXplICogNCk7XG4gICAgICAgICAgICAgICAgYS5zZXQoaW5pdGlhbERhdGEpO1xuICAgICAgICAgICAgICAgIHJldHVybiBhO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KSgpO1xuXG4gICAgICAgIC8vIENyZWF0ZSBvdXRwdXQgdGV4dHVyZSB1bmlmb3JtIHVzaW5nIGlucHV0IGZsb2F0IHRleHR1cmUgd2l0aCBpbml0aWFsIGRhdGFcbiAgICAgICAgdGhpcy51bmlmb3JtID0ge1xuICAgICAgICAgICAgdmFsdWU6IG5ldyBUZXh0dXJlKGdsLCB7XG4gICAgICAgICAgICAgICAgaW1hZ2U6IGZsb2F0QXJyYXksXG4gICAgICAgICAgICAgICAgdGFyZ2V0OiBnbC5URVhUVVJFXzJELFxuICAgICAgICAgICAgICAgIHR5cGU6IGdsLkZMT0FULFxuICAgICAgICAgICAgICAgIGZvcm1hdDogZ2wuUkdCQSxcbiAgICAgICAgICAgICAgICBpbnRlcm5hbEZvcm1hdDogZ2wucmVuZGVyZXIuaXNXZWJnbDIgPyBnbC5SR0JBMzJGIDogZ2wuUkdCQSxcbiAgICAgICAgICAgICAgICB3cmFwUzogZ2wuQ0xBTVBfVE9fRURHRSxcbiAgICAgICAgICAgICAgICB3cmFwVDogZ2wuQ0xBTVBfVE9fRURHRSxcbiAgICAgICAgICAgICAgICBnZW5lcmF0ZU1pcG1hcHM6IGZhbHNlLFxuICAgICAgICAgICAgICAgIG1pbkZpbHRlcjogZ2wuTkVBUkVTVCxcbiAgICAgICAgICAgICAgICBtYWdGaWx0ZXI6IGdsLk5FQVJFU1QsXG4gICAgICAgICAgICAgICAgd2lkdGg6IHRoaXMuc2l6ZSxcbiAgICAgICAgICAgICAgICBmbGlwWTogZmFsc2UsXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBDcmVhdGUgRkJPc1xuICAgICAgICBjb25zdCBvcHRpb25zID0ge1xuICAgICAgICAgICAgd2lkdGg6IHRoaXMuc2l6ZSxcbiAgICAgICAgICAgIGhlaWdodDogdGhpcy5zaXplLFxuICAgICAgICAgICAgdHlwZTogdHlwZSB8fCBnbC5IQUxGX0ZMT0FUIHx8IGdsLnJlbmRlcmVyLmV4dGVuc2lvbnNbJ09FU190ZXh0dXJlX2hhbGZfZmxvYXQnXS5IQUxGX0ZMT0FUX09FUyxcbiAgICAgICAgICAgIGZvcm1hdDogZ2wuUkdCQSxcbiAgICAgICAgICAgIGludGVybmFsRm9ybWF0OiBnbC5yZW5kZXJlci5pc1dlYmdsMiA/ICh0eXBlID09PSBnbC5GTE9BVCA/IGdsLlJHQkEzMkYgOiBnbC5SR0JBMTZGKSA6IGdsLlJHQkEsXG4gICAgICAgICAgICBtaW5GaWx0ZXI6IGdsLk5FQVJFU1QsXG4gICAgICAgICAgICBkZXB0aDogZmFsc2UsXG4gICAgICAgICAgICB1bnBhY2tBbGlnbm1lbnQ6IDEsXG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5mYm8gPSB7XG4gICAgICAgICAgICByZWFkOiBuZXcgUmVuZGVyVGFyZ2V0KGdsLCBvcHRpb25zKSxcbiAgICAgICAgICAgIHdyaXRlOiBuZXcgUmVuZGVyVGFyZ2V0KGdsLCBvcHRpb25zKSxcbiAgICAgICAgICAgIHN3YXA6ICgpID0+IHtcbiAgICAgICAgICAgICAgICBsZXQgdGVtcCA9IHRoaXMuZmJvLnJlYWQ7XG4gICAgICAgICAgICAgICAgdGhpcy5mYm8ucmVhZCA9IHRoaXMuZmJvLndyaXRlO1xuICAgICAgICAgICAgICAgIHRoaXMuZmJvLndyaXRlID0gdGVtcDtcbiAgICAgICAgICAgICAgICB0aGlzLnVuaWZvcm0udmFsdWUgPSB0aGlzLmZiby5yZWFkLnRleHR1cmU7XG4gICAgICAgICAgICB9LFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIGFkZFBhc3MoeyB2ZXJ0ZXggPSBkZWZhdWx0VmVydGV4LCBmcmFnbWVudCA9IGRlZmF1bHRGcmFnbWVudCwgdW5pZm9ybXMgPSB7fSwgdGV4dHVyZVVuaWZvcm0gPSAndE1hcCcsIGVuYWJsZWQgPSB0cnVlIH0gPSB7fSkge1xuICAgICAgICB1bmlmb3Jtc1t0ZXh0dXJlVW5pZm9ybV0gPSB0aGlzLnVuaWZvcm07XG4gICAgICAgIGNvbnN0IHByb2dyYW0gPSBuZXcgUHJvZ3JhbSh0aGlzLmdsLCB7IHZlcnRleCwgZnJhZ21lbnQsIHVuaWZvcm1zIH0pO1xuICAgICAgICBjb25zdCBtZXNoID0gbmV3IE1lc2godGhpcy5nbCwgeyBnZW9tZXRyeTogdGhpcy5nZW9tZXRyeSwgcHJvZ3JhbSB9KTtcblxuICAgICAgICBjb25zdCBwYXNzID0ge1xuICAgICAgICAgICAgbWVzaCxcbiAgICAgICAgICAgIHByb2dyYW0sXG4gICAgICAgICAgICB1bmlmb3JtcyxcbiAgICAgICAgICAgIGVuYWJsZWQsXG4gICAgICAgICAgICB0ZXh0dXJlVW5pZm9ybSxcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLnBhc3Nlcy5wdXNoKHBhc3MpO1xuICAgICAgICByZXR1cm4gcGFzcztcbiAgICB9XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGNvbnN0IGVuYWJsZWRQYXNzZXMgPSB0aGlzLnBhc3Nlcy5maWx0ZXIoKHBhc3MpID0+IHBhc3MuZW5hYmxlZCk7XG5cbiAgICAgICAgZW5hYmxlZFBhc3Nlcy5mb3JFYWNoKChwYXNzLCBpKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmdsLnJlbmRlcmVyLnJlbmRlcih7XG4gICAgICAgICAgICAgICAgc2NlbmU6IHBhc3MubWVzaCxcbiAgICAgICAgICAgICAgICB0YXJnZXQ6IHRoaXMuZmJvLndyaXRlLFxuICAgICAgICAgICAgICAgIGNsZWFyOiBmYWxzZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy5mYm8uc3dhcCgpO1xuICAgICAgICB9KTtcbiAgICB9XG59XG5cbmNvbnN0IGRlZmF1bHRWZXJ0ZXggPSAvKiBnbHNsICovIGBcbiAgICBhdHRyaWJ1dGUgdmVjMiB1djtcbiAgICBhdHRyaWJ1dGUgdmVjMiBwb3NpdGlvbjtcblxuICAgIHZhcnlpbmcgdmVjMiB2VXY7XG5cbiAgICB2b2lkIG1haW4oKSB7XG4gICAgICAgIHZVdiA9IHV2O1xuICAgICAgICBnbF9Qb3NpdGlvbiA9IHZlYzQocG9zaXRpb24sIDAsIDEpO1xuICAgIH1cbmA7XG5cbmNvbnN0IGRlZmF1bHRGcmFnbWVudCA9IC8qIGdsc2wgKi8gYFxuICAgIHByZWNpc2lvbiBoaWdocCBmbG9hdDtcblxuICAgIHVuaWZvcm0gc2FtcGxlcjJEIHRNYXA7XG4gICAgdmFyeWluZyB2ZWMyIHZVdjtcblxuICAgIHZvaWQgbWFpbigpIHtcbiAgICAgICAgZ2xfRnJhZ0NvbG9yID0gdGV4dHVyZTJEKHRNYXAsIHZVdik7XG4gICAgfVxuYDtcbiIsImltcG9ydCB7IFRleHR1cmUgfSBmcm9tICcuLi9jb3JlL1RleHR1cmUuanMnO1xuXG4vLyBUT0RPOiBTdXBwb3J0IGN1YmVtYXBzXG4vLyBHZW5lcmF0ZSB0ZXh0dXJlcyB1c2luZyBodHRwczovL2dpdGh1Yi5jb20vVGltdmFuU2NoZXJwZW56ZWVsL3RleHR1cmUtY29tcHJlc3NvclxuXG5leHBvcnQgY2xhc3MgS1RYVGV4dHVyZSBleHRlbmRzIFRleHR1cmUge1xuICAgIGNvbnN0cnVjdG9yKGdsLCB7IGJ1ZmZlciwgd3JhcFMgPSBnbC5DTEFNUF9UT19FREdFLCB3cmFwVCA9IGdsLkNMQU1QX1RPX0VER0UsIGFuaXNvdHJvcHkgPSAwLCBtaW5GaWx0ZXIsIG1hZ0ZpbHRlciB9ID0ge30pIHtcbiAgICAgICAgc3VwZXIoZ2wsIHtcbiAgICAgICAgICAgIGdlbmVyYXRlTWlwbWFwczogZmFsc2UsXG4gICAgICAgICAgICB3cmFwUyxcbiAgICAgICAgICAgIHdyYXBULFxuICAgICAgICAgICAgYW5pc290cm9weSxcbiAgICAgICAgICAgIG1pbkZpbHRlcixcbiAgICAgICAgICAgIG1hZ0ZpbHRlcixcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKGJ1ZmZlcikgcmV0dXJuIHRoaXMucGFyc2VCdWZmZXIoYnVmZmVyKTtcbiAgICB9XG5cbiAgICBwYXJzZUJ1ZmZlcihidWZmZXIpIHtcbiAgICAgICAgY29uc3Qga3R4ID0gbmV3IEtocm9ub3NUZXh0dXJlQ29udGFpbmVyKGJ1ZmZlcik7XG4gICAgICAgIGt0eC5taXBtYXBzLmlzQ29tcHJlc3NlZFRleHR1cmUgPSB0cnVlO1xuXG4gICAgICAgIC8vIFVwZGF0ZSB0ZXh0dXJlXG4gICAgICAgIHRoaXMuaW1hZ2UgPSBrdHgubWlwbWFwcztcbiAgICAgICAgdGhpcy5pbnRlcm5hbEZvcm1hdCA9IGt0eC5nbEludGVybmFsRm9ybWF0O1xuICAgICAgICBpZiAoa3R4Lm51bWJlck9mTWlwbWFwTGV2ZWxzID4gMSkge1xuICAgICAgICAgICAgaWYgKHRoaXMubWluRmlsdGVyID09PSB0aGlzLmdsLkxJTkVBUikgdGhpcy5taW5GaWx0ZXIgPSB0aGlzLmdsLk5FQVJFU1RfTUlQTUFQX0xJTkVBUjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmICh0aGlzLm1pbkZpbHRlciA9PT0gdGhpcy5nbC5ORUFSRVNUX01JUE1BUF9MSU5FQVIpIHRoaXMubWluRmlsdGVyID0gdGhpcy5nbC5MSU5FQVI7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBUT0RPOiBzdXBwb3J0IGN1YmUgbWFwc1xuICAgICAgICAvLyBrdHgubnVtYmVyT2ZGYWNlc1xuICAgIH1cbn1cblxuZnVuY3Rpb24gS2hyb25vc1RleHR1cmVDb250YWluZXIoYnVmZmVyKSB7XG4gICAgY29uc3QgaWRDaGVjayA9IFsweGFiLCAweDRiLCAweDU0LCAweDU4LCAweDIwLCAweDMxLCAweDMxLCAweGJiLCAweDBkLCAweDBhLCAweDFhLCAweDBhXTtcbiAgICBjb25zdCBpZCA9IG5ldyBVaW50OEFycmF5KGJ1ZmZlciwgMCwgMTIpO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaWQubGVuZ3RoOyBpKyspIGlmIChpZFtpXSAhPT0gaWRDaGVja1tpXSkgcmV0dXJuIGNvbnNvbGUuZXJyb3IoJ0ZpbGUgbWlzc2luZyBLVFggaWRlbnRpZmllcicpO1xuXG4gICAgLy8gVE9ETzogSXMgdGhpcyBhbHdheXMgND8gVGVzdGVkOiBbYW5kcm9pZCwgbWFjb3NdXG4gICAgY29uc3Qgc2l6ZSA9IFVpbnQzMkFycmF5LkJZVEVTX1BFUl9FTEVNRU5UO1xuICAgIGNvbnN0IGhlYWQgPSBuZXcgRGF0YVZpZXcoYnVmZmVyLCAxMiwgMTMgKiBzaXplKTtcbiAgICBjb25zdCBsaXR0bGVFbmRpYW4gPSBoZWFkLmdldFVpbnQzMigwLCB0cnVlKSA9PT0gMHgwNDAzMDIwMTtcbiAgICBjb25zdCBnbFR5cGUgPSBoZWFkLmdldFVpbnQzMigxICogc2l6ZSwgbGl0dGxlRW5kaWFuKTtcbiAgICBpZiAoZ2xUeXBlICE9PSAwKSByZXR1cm4gY29uc29sZS53YXJuKCdvbmx5IGNvbXByZXNzZWQgZm9ybWF0cyBjdXJyZW50bHkgc3VwcG9ydGVkJyk7XG4gICAgdGhpcy5nbEludGVybmFsRm9ybWF0ID0gaGVhZC5nZXRVaW50MzIoNCAqIHNpemUsIGxpdHRsZUVuZGlhbik7XG4gICAgbGV0IHdpZHRoID0gaGVhZC5nZXRVaW50MzIoNiAqIHNpemUsIGxpdHRsZUVuZGlhbik7XG4gICAgbGV0IGhlaWdodCA9IGhlYWQuZ2V0VWludDMyKDcgKiBzaXplLCBsaXR0bGVFbmRpYW4pO1xuICAgIHRoaXMubnVtYmVyT2ZGYWNlcyA9IGhlYWQuZ2V0VWludDMyKDEwICogc2l6ZSwgbGl0dGxlRW5kaWFuKTtcbiAgICB0aGlzLm51bWJlck9mTWlwbWFwTGV2ZWxzID0gTWF0aC5tYXgoMSwgaGVhZC5nZXRVaW50MzIoMTEgKiBzaXplLCBsaXR0bGVFbmRpYW4pKTtcbiAgICBjb25zdCBieXRlc09mS2V5VmFsdWVEYXRhID0gaGVhZC5nZXRVaW50MzIoMTIgKiBzaXplLCBsaXR0bGVFbmRpYW4pO1xuXG4gICAgdGhpcy5taXBtYXBzID0gW107XG4gICAgbGV0IG9mZnNldCA9IDEyICsgMTMgKiA0ICsgYnl0ZXNPZktleVZhbHVlRGF0YTtcbiAgICBmb3IgKGxldCBsZXZlbCA9IDA7IGxldmVsIDwgdGhpcy5udW1iZXJPZk1pcG1hcExldmVsczsgbGV2ZWwrKykge1xuICAgICAgICBjb25zdCBsZXZlbFNpemUgPSBuZXcgSW50MzJBcnJheShidWZmZXIsIG9mZnNldCwgMSlbMF07IC8vIHNpemUgcGVyIGZhY2UsIHNpbmNlIG5vdCBzdXBwb3J0aW5nIGFycmF5IGN1YmVtYXBzXG4gICAgICAgIG9mZnNldCArPSA0OyAvLyBsZXZlbFNpemUgZmllbGRcbiAgICAgICAgZm9yIChsZXQgZmFjZSA9IDA7IGZhY2UgPCB0aGlzLm51bWJlck9mRmFjZXM7IGZhY2UrKykge1xuICAgICAgICAgICAgY29uc3QgZGF0YSA9IG5ldyBVaW50OEFycmF5KGJ1ZmZlciwgb2Zmc2V0LCBsZXZlbFNpemUpO1xuICAgICAgICAgICAgdGhpcy5taXBtYXBzLnB1c2goeyBkYXRhLCB3aWR0aCwgaGVpZ2h0IH0pO1xuICAgICAgICAgICAgb2Zmc2V0ICs9IGxldmVsU2l6ZTtcbiAgICAgICAgICAgIG9mZnNldCArPSAzIC0gKChsZXZlbFNpemUgKyAzKSAlIDQpOyAvLyBhZGQgcGFkZGluZyBmb3Igb2RkIHNpemVkIGltYWdlXG4gICAgICAgIH1cbiAgICAgICAgd2lkdGggPSB3aWR0aCA+PiAxO1xuICAgICAgICBoZWlnaHQgPSBoZWlnaHQgPj4gMTtcbiAgICB9XG59XG4iLCJpbXBvcnQgeyBQcm9ncmFtIH0gZnJvbSAnLi4vY29yZS9Qcm9ncmFtLmpzJztcblxuY29uc3QgdmVydGV4ID0gLyogZ2xzbCAqLyBgXG4gICAgcHJlY2lzaW9uIGhpZ2hwIGZsb2F0O1xuICAgIHByZWNpc2lvbiBoaWdocCBpbnQ7XG5cbiAgICBhdHRyaWJ1dGUgdmVjMyBwb3NpdGlvbjtcbiAgICBhdHRyaWJ1dGUgdmVjMyBub3JtYWw7XG5cbiAgICB1bmlmb3JtIG1hdDMgbm9ybWFsTWF0cml4O1xuICAgIHVuaWZvcm0gbWF0NCBtb2RlbFZpZXdNYXRyaXg7XG4gICAgdW5pZm9ybSBtYXQ0IHByb2plY3Rpb25NYXRyaXg7XG5cbiAgICB2YXJ5aW5nIHZlYzMgdk5vcm1hbDtcblxuICAgIHZvaWQgbWFpbigpIHtcbiAgICAgICAgdk5vcm1hbCA9IG5vcm1hbGl6ZShub3JtYWxNYXRyaXggKiBub3JtYWwpO1xuICAgICAgICBnbF9Qb3NpdGlvbiA9IHByb2plY3Rpb25NYXRyaXggKiBtb2RlbFZpZXdNYXRyaXggKiB2ZWM0KHBvc2l0aW9uLCAxLjApO1xuICAgIH1cbmA7XG5cbmNvbnN0IGZyYWdtZW50ID0gLyogZ2xzbCAqLyBgXG4gICAgcHJlY2lzaW9uIGhpZ2hwIGZsb2F0O1xuICAgIHByZWNpc2lvbiBoaWdocCBpbnQ7XG5cbiAgICB2YXJ5aW5nIHZlYzMgdk5vcm1hbDtcblxuICAgIHZvaWQgbWFpbigpIHtcbiAgICAgICAgZ2xfRnJhZ0NvbG9yLnJnYiA9IG5vcm1hbGl6ZSh2Tm9ybWFsKTtcbiAgICAgICAgZ2xfRnJhZ0NvbG9yLmEgPSAxLjA7XG4gICAgfVxuYDtcblxuZXhwb3J0IGZ1bmN0aW9uIE5vcm1hbFByb2dyYW0oZ2wpIHtcbiAgICByZXR1cm4gbmV3IFByb2dyYW0oZ2wsIHtcbiAgICAgICAgdmVydGV4OiB2ZXJ0ZXgsXG4gICAgICAgIGZyYWdtZW50OiBmcmFnbWVudCxcbiAgICAgICAgY3VsbEZhY2U6IG51bGwsXG4gICAgfSk7XG59XG4iLCIvLyBCYXNlZCBmcm9tIFRocmVlSlMnIE9yYml0Q29udHJvbHMgY2xhc3MsIHJld3JpdHRlbiB1c2luZyBlczYgd2l0aCBzb21lIGFkZGl0aW9ucyBhbmQgc3VidHJhY3Rpb25zLlxuLy8gVE9ETzogYWJzdHJhY3QgZXZlbnQgaGFuZGxlcnMgc28gY2FuIGJlIGZlZCBmcm9tIG90aGVyIHNvdXJjZXNcbi8vIFRPRE86IG1ha2Ugc2Nyb2xsIHpvb20gbW9yZSBhY2N1cmF0ZSB0aGFuIGp1c3QgPi88IHplcm9cbi8vIFRPRE86IGJlIGFibGUgdG8gcGFzcyBpbiBuZXcgY2FtZXJhIHBvc2l0aW9uXG5cbmltcG9ydCB7IFZlYzMgfSBmcm9tICcuLi9tYXRoL1ZlYzMuanMnO1xuaW1wb3J0IHsgVmVjMiB9IGZyb20gJy4uL21hdGgvVmVjMi5qcyc7XG5cbmNvbnN0IFNUQVRFID0geyBOT05FOiAtMSwgUk9UQVRFOiAwLCBET0xMWTogMSwgUEFOOiAyLCBET0xMWV9QQU46IDMgfTtcbmNvbnN0IHRlbXBWZWMzID0gbmV3IFZlYzMoKTtcbmNvbnN0IHRlbXBWZWMyYSA9IG5ldyBWZWMyKCk7XG5jb25zdCB0ZW1wVmVjMmIgPSBuZXcgVmVjMigpO1xuXG5leHBvcnQgZnVuY3Rpb24gT3JiaXQoXG4gICAgb2JqZWN0LFxuICAgIHtcbiAgICAgICAgZWxlbWVudCA9IGRvY3VtZW50LFxuICAgICAgICBlbmFibGVkID0gdHJ1ZSxcbiAgICAgICAgdGFyZ2V0ID0gbmV3IFZlYzMoKSxcbiAgICAgICAgZWFzZSA9IDAuMjUsXG4gICAgICAgIGluZXJ0aWEgPSAwLjg1LFxuICAgICAgICBlbmFibGVSb3RhdGUgPSB0cnVlLFxuICAgICAgICByb3RhdGVTcGVlZCA9IDAuMSxcbiAgICAgICAgYXV0b1JvdGF0ZSA9IGZhbHNlLFxuICAgICAgICBhdXRvUm90YXRlU3BlZWQgPSAxLjAsXG4gICAgICAgIGVuYWJsZVpvb20gPSB0cnVlLFxuICAgICAgICB6b29tU3BlZWQgPSAxLFxuICAgICAgICBlbmFibGVQYW4gPSB0cnVlLFxuICAgICAgICBwYW5TcGVlZCA9IDAuMSxcbiAgICAgICAgbWluUG9sYXJBbmdsZSA9IDAsXG4gICAgICAgIG1heFBvbGFyQW5nbGUgPSBNYXRoLlBJLFxuICAgICAgICBtaW5BemltdXRoQW5nbGUgPSAtSW5maW5pdHksXG4gICAgICAgIG1heEF6aW11dGhBbmdsZSA9IEluZmluaXR5LFxuICAgICAgICBtaW5EaXN0YW5jZSA9IDAsXG4gICAgICAgIG1heERpc3RhbmNlID0gSW5maW5pdHksXG4gICAgfSA9IHt9XG4pIHtcbiAgICB0aGlzLmVuYWJsZWQgPSBlbmFibGVkO1xuICAgIHRoaXMudGFyZ2V0ID0gdGFyZ2V0O1xuICAgIHRoaXMucm90YXRlU3BlZWQgPSByb3RhdGVTcGVlZDtcbiAgICB0aGlzLnBhblNwZWVkID0gcGFuU3BlZWQ7XG4gICAgLy8gQ2F0Y2ggYXR0ZW1wdHMgdG8gZGlzYWJsZSAtIHNldCB0byAxIHNvIGhhcyBubyBlZmZlY3RcbiAgICBlYXNlID0gZWFzZSB8fCAxO1xuICAgIGluZXJ0aWEgPSBpbmVydGlhIHx8IDA7XG5cbiAgICB0aGlzLm1pbkRpc3RhbmNlID0gbWluRGlzdGFuY2U7XG4gICAgdGhpcy5tYXhEaXN0YW5jZSA9IG1heERpc3RhbmNlO1xuXG4gICAgLy8gY3VycmVudCBwb3NpdGlvbiBpbiBzcGhlcmljYWxUYXJnZXQgY29vcmRpbmF0ZXNcbiAgICBjb25zdCBzcGhlcmljYWxEZWx0YSA9IHsgcmFkaXVzOiAxLCBwaGk6IDAsIHRoZXRhOiAwIH07XG4gICAgY29uc3Qgc3BoZXJpY2FsVGFyZ2V0ID0geyByYWRpdXM6IDEsIHBoaTogMCwgdGhldGE6IDAgfTtcbiAgICBjb25zdCBzcGhlcmljYWwgPSB7IHJhZGl1czogMSwgcGhpOiAwLCB0aGV0YTogMCB9O1xuICAgIGNvbnN0IHBhbkRlbHRhID0gbmV3IFZlYzMoKTtcblxuICAgIC8vIEdyYWIgaW5pdGlhbCBwb3NpdGlvbiB2YWx1ZXNcbiAgICBjb25zdCBvZmZzZXQgPSBuZXcgVmVjMygpO1xuICAgIG9mZnNldC5jb3B5KG9iamVjdC5wb3NpdGlvbikuc3ViKHRoaXMudGFyZ2V0KTtcbiAgICBzcGhlcmljYWwucmFkaXVzID0gc3BoZXJpY2FsVGFyZ2V0LnJhZGl1cyA9IG9mZnNldC5kaXN0YW5jZSgpO1xuICAgIHNwaGVyaWNhbC50aGV0YSA9IHNwaGVyaWNhbFRhcmdldC50aGV0YSA9IE1hdGguYXRhbjIob2Zmc2V0LngsIG9mZnNldC56KTtcbiAgICBzcGhlcmljYWwucGhpID0gc3BoZXJpY2FsVGFyZ2V0LnBoaSA9IE1hdGguYWNvcyhNYXRoLm1pbihNYXRoLm1heChvZmZzZXQueSAvIHNwaGVyaWNhbFRhcmdldC5yYWRpdXMsIC0xKSwgMSkpO1xuXG4gICAgdGhpcy5vZmZzZXQgPSBvZmZzZXQ7XG5cbiAgICB0aGlzLnVwZGF0ZSA9ICgpID0+IHtcbiAgICAgICAgaWYgKGF1dG9Sb3RhdGUpIHtcbiAgICAgICAgICAgIGhhbmRsZUF1dG9Sb3RhdGUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGFwcGx5IGRlbHRhXG4gICAgICAgIHNwaGVyaWNhbFRhcmdldC5yYWRpdXMgKj0gc3BoZXJpY2FsRGVsdGEucmFkaXVzO1xuICAgICAgICBzcGhlcmljYWxUYXJnZXQudGhldGEgKz0gc3BoZXJpY2FsRGVsdGEudGhldGE7XG4gICAgICAgIHNwaGVyaWNhbFRhcmdldC5waGkgKz0gc3BoZXJpY2FsRGVsdGEucGhpO1xuXG4gICAgICAgIC8vIGFwcGx5IGJvdW5kYXJpZXNcbiAgICAgICAgc3BoZXJpY2FsVGFyZ2V0LnRoZXRhID0gTWF0aC5tYXgobWluQXppbXV0aEFuZ2xlLCBNYXRoLm1pbihtYXhBemltdXRoQW5nbGUsIHNwaGVyaWNhbFRhcmdldC50aGV0YSkpO1xuICAgICAgICBzcGhlcmljYWxUYXJnZXQucGhpID0gTWF0aC5tYXgobWluUG9sYXJBbmdsZSwgTWF0aC5taW4obWF4UG9sYXJBbmdsZSwgc3BoZXJpY2FsVGFyZ2V0LnBoaSkpO1xuICAgICAgICBzcGhlcmljYWxUYXJnZXQucmFkaXVzID0gTWF0aC5tYXgodGhpcy5taW5EaXN0YW5jZSwgTWF0aC5taW4odGhpcy5tYXhEaXN0YW5jZSwgc3BoZXJpY2FsVGFyZ2V0LnJhZGl1cykpO1xuXG4gICAgICAgIC8vIGVhc2UgdmFsdWVzXG4gICAgICAgIHNwaGVyaWNhbC5waGkgKz0gKHNwaGVyaWNhbFRhcmdldC5waGkgLSBzcGhlcmljYWwucGhpKSAqIGVhc2U7XG4gICAgICAgIHNwaGVyaWNhbC50aGV0YSArPSAoc3BoZXJpY2FsVGFyZ2V0LnRoZXRhIC0gc3BoZXJpY2FsLnRoZXRhKSAqIGVhc2U7XG4gICAgICAgIHNwaGVyaWNhbC5yYWRpdXMgKz0gKHNwaGVyaWNhbFRhcmdldC5yYWRpdXMgLSBzcGhlcmljYWwucmFkaXVzKSAqIGVhc2U7XG5cbiAgICAgICAgLy8gYXBwbHkgcGFuIHRvIHRhcmdldC4gQXMgb2Zmc2V0IGlzIHJlbGF0aXZlIHRvIHRhcmdldCwgaXQgYWxzbyBzaGlmdHNcbiAgICAgICAgdGhpcy50YXJnZXQuYWRkKHBhbkRlbHRhKTtcblxuICAgICAgICAvLyBhcHBseSByb3RhdGlvbiB0byBvZmZzZXRcbiAgICAgICAgbGV0IHNpblBoaVJhZGl1cyA9IHNwaGVyaWNhbC5yYWRpdXMgKiBNYXRoLnNpbihNYXRoLm1heCgwLjAwMDAwMSwgc3BoZXJpY2FsLnBoaSkpO1xuICAgICAgICBvZmZzZXQueCA9IHNpblBoaVJhZGl1cyAqIE1hdGguc2luKHNwaGVyaWNhbC50aGV0YSk7XG4gICAgICAgIG9mZnNldC55ID0gc3BoZXJpY2FsLnJhZGl1cyAqIE1hdGguY29zKHNwaGVyaWNhbC5waGkpO1xuICAgICAgICBvZmZzZXQueiA9IHNpblBoaVJhZGl1cyAqIE1hdGguY29zKHNwaGVyaWNhbC50aGV0YSk7XG5cbiAgICAgICAgLy8gQXBwbHkgdXBkYXRlZCB2YWx1ZXMgdG8gb2JqZWN0XG4gICAgICAgIG9iamVjdC5wb3NpdGlvbi5jb3B5KHRoaXMudGFyZ2V0KS5hZGQob2Zmc2V0KTtcbiAgICAgICAgb2JqZWN0Lmxvb2tBdCh0aGlzLnRhcmdldCk7XG5cbiAgICAgICAgLy8gQXBwbHkgaW5lcnRpYSB0byB2YWx1ZXNcbiAgICAgICAgc3BoZXJpY2FsRGVsdGEudGhldGEgKj0gaW5lcnRpYTtcbiAgICAgICAgc3BoZXJpY2FsRGVsdGEucGhpICo9IGluZXJ0aWE7XG4gICAgICAgIHBhbkRlbHRhLm11bHRpcGx5KGluZXJ0aWEpO1xuXG4gICAgICAgIC8vIFJlc2V0IHNjYWxlIGV2ZXJ5IGZyYW1lIHRvIGF2b2lkIGFwcGx5aW5nIHNjYWxlIG11bHRpcGxlIHRpbWVzXG4gICAgICAgIHNwaGVyaWNhbERlbHRhLnJhZGl1cyA9IDE7XG4gICAgfTtcblxuICAgIC8vIFVwZGF0ZXMgaW50ZXJuYWxzIHdpdGggbmV3IHBvc2l0aW9uXG4gICAgdGhpcy5mb3JjZVBvc2l0aW9uID0gKCkgPT4ge1xuICAgICAgICBvZmZzZXQuY29weShvYmplY3QucG9zaXRpb24pLnN1Yih0aGlzLnRhcmdldCk7XG4gICAgICAgIHNwaGVyaWNhbC5yYWRpdXMgPSBzcGhlcmljYWxUYXJnZXQucmFkaXVzID0gb2Zmc2V0LmRpc3RhbmNlKCk7XG4gICAgICAgIHNwaGVyaWNhbC50aGV0YSA9IHNwaGVyaWNhbFRhcmdldC50aGV0YSA9IE1hdGguYXRhbjIob2Zmc2V0LngsIG9mZnNldC56KTtcbiAgICAgICAgc3BoZXJpY2FsLnBoaSA9IHNwaGVyaWNhbFRhcmdldC5waGkgPSBNYXRoLmFjb3MoTWF0aC5taW4oTWF0aC5tYXgob2Zmc2V0LnkgLyBzcGhlcmljYWxUYXJnZXQucmFkaXVzLCAtMSksIDEpKTtcbiAgICAgICAgb2JqZWN0Lmxvb2tBdCh0aGlzLnRhcmdldCk7XG4gICAgfTtcblxuICAgIC8vIEV2ZXJ5dGhpbmcgYmVsb3cgaGVyZSBqdXN0IHVwZGF0ZXMgcGFuRGVsdGEgYW5kIHNwaGVyaWNhbERlbHRhXG4gICAgLy8gVXNpbmcgdGhvc2UgdHdvIG9iamVjdHMnIHZhbHVlcywgdGhlIG9yYml0IGlzIGNhbGN1bGF0ZWRcblxuICAgIGNvbnN0IHJvdGF0ZVN0YXJ0ID0gbmV3IFZlYzIoKTtcbiAgICBjb25zdCBwYW5TdGFydCA9IG5ldyBWZWMyKCk7XG4gICAgY29uc3QgZG9sbHlTdGFydCA9IG5ldyBWZWMyKCk7XG5cbiAgICBsZXQgc3RhdGUgPSBTVEFURS5OT05FO1xuICAgIHRoaXMubW91c2VCdXR0b25zID0geyBPUkJJVDogMCwgWk9PTTogMSwgUEFOOiAyIH07XG5cbiAgICBmdW5jdGlvbiBnZXRab29tU2NhbGUoKSB7XG4gICAgICAgIHJldHVybiBNYXRoLnBvdygwLjk1LCB6b29tU3BlZWQpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHBhbkxlZnQoZGlzdGFuY2UsIG0pIHtcbiAgICAgICAgdGVtcFZlYzMuc2V0KG1bMF0sIG1bMV0sIG1bMl0pO1xuICAgICAgICB0ZW1wVmVjMy5tdWx0aXBseSgtZGlzdGFuY2UpO1xuICAgICAgICBwYW5EZWx0YS5hZGQodGVtcFZlYzMpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHBhblVwKGRpc3RhbmNlLCBtKSB7XG4gICAgICAgIHRlbXBWZWMzLnNldChtWzRdLCBtWzVdLCBtWzZdKTtcbiAgICAgICAgdGVtcFZlYzMubXVsdGlwbHkoZGlzdGFuY2UpO1xuICAgICAgICBwYW5EZWx0YS5hZGQodGVtcFZlYzMpO1xuICAgIH1cblxuICAgIGNvbnN0IHBhbiA9IChkZWx0YVgsIGRlbHRhWSkgPT4ge1xuICAgICAgICBsZXQgZWwgPSBlbGVtZW50ID09PSBkb2N1bWVudCA/IGRvY3VtZW50LmJvZHkgOiBlbGVtZW50O1xuICAgICAgICB0ZW1wVmVjMy5jb3B5KG9iamVjdC5wb3NpdGlvbikuc3ViKHRoaXMudGFyZ2V0KTtcbiAgICAgICAgbGV0IHRhcmdldERpc3RhbmNlID0gdGVtcFZlYzMuZGlzdGFuY2UoKTtcbiAgICAgICAgdGFyZ2V0RGlzdGFuY2UgKj0gTWF0aC50YW4oKCgob2JqZWN0LmZvdiB8fCA0NSkgLyAyKSAqIE1hdGguUEkpIC8gMTgwLjApO1xuICAgICAgICBwYW5MZWZ0KCgyICogZGVsdGFYICogdGFyZ2V0RGlzdGFuY2UpIC8gZWwuY2xpZW50SGVpZ2h0LCBvYmplY3QubWF0cml4KTtcbiAgICAgICAgcGFuVXAoKDIgKiBkZWx0YVkgKiB0YXJnZXREaXN0YW5jZSkgLyBlbC5jbGllbnRIZWlnaHQsIG9iamVjdC5tYXRyaXgpO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBkb2xseShkb2xseVNjYWxlKSB7XG4gICAgICAgIHNwaGVyaWNhbERlbHRhLnJhZGl1cyAvPSBkb2xseVNjYWxlO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGhhbmRsZUF1dG9Sb3RhdGUoKSB7XG4gICAgICAgIGNvbnN0IGFuZ2xlID0gKCgyICogTWF0aC5QSSkgLyA2MCAvIDYwKSAqIGF1dG9Sb3RhdGVTcGVlZDtcbiAgICAgICAgc3BoZXJpY2FsRGVsdGEudGhldGEgLT0gYW5nbGU7XG4gICAgfVxuXG4gICAgbGV0IGhhbmRsZU1vdmVSb3RhdGUgPSAoeCwgeSkgPT4ge1xuICAgICAgICB0ZW1wVmVjMmEuc2V0KHgsIHkpO1xuICAgICAgICB0ZW1wVmVjMmIuc3ViKHRlbXBWZWMyYSwgcm90YXRlU3RhcnQpLm11bHRpcGx5KHRoaXMucm90YXRlU3BlZWQpO1xuICAgICAgICBsZXQgZWwgPSBlbGVtZW50ID09PSBkb2N1bWVudCA/IGRvY3VtZW50LmJvZHkgOiBlbGVtZW50O1xuICAgICAgICBzcGhlcmljYWxEZWx0YS50aGV0YSAtPSAoMiAqIE1hdGguUEkgKiB0ZW1wVmVjMmIueCkgLyBlbC5jbGllbnRIZWlnaHQ7XG4gICAgICAgIHNwaGVyaWNhbERlbHRhLnBoaSAtPSAoMiAqIE1hdGguUEkgKiB0ZW1wVmVjMmIueSkgLyBlbC5jbGllbnRIZWlnaHQ7XG4gICAgICAgIHJvdGF0ZVN0YXJ0LmNvcHkodGVtcFZlYzJhKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBoYW5kbGVNb3VzZU1vdmVEb2xseShlKSB7XG4gICAgICAgIHRlbXBWZWMyYS5zZXQoZS5jbGllbnRYLCBlLmNsaWVudFkpO1xuICAgICAgICB0ZW1wVmVjMmIuc3ViKHRlbXBWZWMyYSwgZG9sbHlTdGFydCk7XG4gICAgICAgIGlmICh0ZW1wVmVjMmIueSA+IDApIHtcbiAgICAgICAgICAgIGRvbGx5KGdldFpvb21TY2FsZSgpKTtcbiAgICAgICAgfSBlbHNlIGlmICh0ZW1wVmVjMmIueSA8IDApIHtcbiAgICAgICAgICAgIGRvbGx5KDEgLyBnZXRab29tU2NhbGUoKSk7XG4gICAgICAgIH1cbiAgICAgICAgZG9sbHlTdGFydC5jb3B5KHRlbXBWZWMyYSk7XG4gICAgfVxuXG4gICAgbGV0IGhhbmRsZU1vdmVQYW4gPSAoeCwgeSkgPT4ge1xuICAgICAgICB0ZW1wVmVjMmEuc2V0KHgsIHkpO1xuICAgICAgICB0ZW1wVmVjMmIuc3ViKHRlbXBWZWMyYSwgcGFuU3RhcnQpLm11bHRpcGx5KHRoaXMucGFuU3BlZWQpO1xuICAgICAgICBwYW4odGVtcFZlYzJiLngsIHRlbXBWZWMyYi55KTtcbiAgICAgICAgcGFuU3RhcnQuY29weSh0ZW1wVmVjMmEpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGhhbmRsZVRvdWNoU3RhcnREb2xseVBhbihlKSB7XG4gICAgICAgIGlmIChlbmFibGVab29tKSB7XG4gICAgICAgICAgICBsZXQgZHggPSBlLnRvdWNoZXNbMF0ucGFnZVggLSBlLnRvdWNoZXNbMV0ucGFnZVg7XG4gICAgICAgICAgICBsZXQgZHkgPSBlLnRvdWNoZXNbMF0ucGFnZVkgLSBlLnRvdWNoZXNbMV0ucGFnZVk7XG4gICAgICAgICAgICBsZXQgZGlzdGFuY2UgPSBNYXRoLnNxcnQoZHggKiBkeCArIGR5ICogZHkpO1xuICAgICAgICAgICAgZG9sbHlTdGFydC5zZXQoMCwgZGlzdGFuY2UpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGVuYWJsZVBhbikge1xuICAgICAgICAgICAgbGV0IHggPSAwLjUgKiAoZS50b3VjaGVzWzBdLnBhZ2VYICsgZS50b3VjaGVzWzFdLnBhZ2VYKTtcbiAgICAgICAgICAgIGxldCB5ID0gMC41ICogKGUudG91Y2hlc1swXS5wYWdlWSArIGUudG91Y2hlc1sxXS5wYWdlWSk7XG4gICAgICAgICAgICBwYW5TdGFydC5zZXQoeCwgeSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBoYW5kbGVUb3VjaE1vdmVEb2xseVBhbihlKSB7XG4gICAgICAgIGlmIChlbmFibGVab29tKSB7XG4gICAgICAgICAgICBsZXQgZHggPSBlLnRvdWNoZXNbMF0ucGFnZVggLSBlLnRvdWNoZXNbMV0ucGFnZVg7XG4gICAgICAgICAgICBsZXQgZHkgPSBlLnRvdWNoZXNbMF0ucGFnZVkgLSBlLnRvdWNoZXNbMV0ucGFnZVk7XG4gICAgICAgICAgICBsZXQgZGlzdGFuY2UgPSBNYXRoLnNxcnQoZHggKiBkeCArIGR5ICogZHkpO1xuICAgICAgICAgICAgdGVtcFZlYzJhLnNldCgwLCBkaXN0YW5jZSk7XG4gICAgICAgICAgICB0ZW1wVmVjMmIuc2V0KDAsIE1hdGgucG93KHRlbXBWZWMyYS55IC8gZG9sbHlTdGFydC55LCB6b29tU3BlZWQpKTtcbiAgICAgICAgICAgIGRvbGx5KHRlbXBWZWMyYi55KTtcbiAgICAgICAgICAgIGRvbGx5U3RhcnQuY29weSh0ZW1wVmVjMmEpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGVuYWJsZVBhbikge1xuICAgICAgICAgICAgbGV0IHggPSAwLjUgKiAoZS50b3VjaGVzWzBdLnBhZ2VYICsgZS50b3VjaGVzWzFdLnBhZ2VYKTtcbiAgICAgICAgICAgIGxldCB5ID0gMC41ICogKGUudG91Y2hlc1swXS5wYWdlWSArIGUudG91Y2hlc1sxXS5wYWdlWSk7XG4gICAgICAgICAgICBoYW5kbGVNb3ZlUGFuKHgsIHkpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY29uc3Qgb25Nb3VzZURvd24gPSAoZSkgPT4ge1xuICAgICAgICBpZiAoIXRoaXMuZW5hYmxlZCkgcmV0dXJuO1xuXG4gICAgICAgIHN3aXRjaCAoZS5idXR0b24pIHtcbiAgICAgICAgICAgIGNhc2UgdGhpcy5tb3VzZUJ1dHRvbnMuT1JCSVQ6XG4gICAgICAgICAgICAgICAgaWYgKGVuYWJsZVJvdGF0ZSA9PT0gZmFsc2UpIHJldHVybjtcbiAgICAgICAgICAgICAgICByb3RhdGVTdGFydC5zZXQoZS5jbGllbnRYLCBlLmNsaWVudFkpO1xuICAgICAgICAgICAgICAgIHN0YXRlID0gU1RBVEUuUk9UQVRFO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSB0aGlzLm1vdXNlQnV0dG9ucy5aT09NOlxuICAgICAgICAgICAgICAgIGlmIChlbmFibGVab29tID09PSBmYWxzZSkgcmV0dXJuO1xuICAgICAgICAgICAgICAgIGRvbGx5U3RhcnQuc2V0KGUuY2xpZW50WCwgZS5jbGllbnRZKTtcbiAgICAgICAgICAgICAgICBzdGF0ZSA9IFNUQVRFLkRPTExZO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSB0aGlzLm1vdXNlQnV0dG9ucy5QQU46XG4gICAgICAgICAgICAgICAgaWYgKGVuYWJsZVBhbiA9PT0gZmFsc2UpIHJldHVybjtcbiAgICAgICAgICAgICAgICBwYW5TdGFydC5zZXQoZS5jbGllbnRYLCBlLmNsaWVudFkpO1xuICAgICAgICAgICAgICAgIHN0YXRlID0gU1RBVEUuUEFOO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHN0YXRlICE9PSBTVEFURS5OT05FKSB7XG4gICAgICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgb25Nb3VzZU1vdmUsIGZhbHNlKTtcbiAgICAgICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgb25Nb3VzZVVwLCBmYWxzZSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgY29uc3Qgb25Nb3VzZU1vdmUgPSAoZSkgPT4ge1xuICAgICAgICBpZiAoIXRoaXMuZW5hYmxlZCkgcmV0dXJuO1xuXG4gICAgICAgIHN3aXRjaCAoc3RhdGUpIHtcbiAgICAgICAgICAgIGNhc2UgU1RBVEUuUk9UQVRFOlxuICAgICAgICAgICAgICAgIGlmIChlbmFibGVSb3RhdGUgPT09IGZhbHNlKSByZXR1cm47XG4gICAgICAgICAgICAgICAgaGFuZGxlTW92ZVJvdGF0ZShlLmNsaWVudFgsIGUuY2xpZW50WSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFNUQVRFLkRPTExZOlxuICAgICAgICAgICAgICAgIGlmIChlbmFibGVab29tID09PSBmYWxzZSkgcmV0dXJuO1xuICAgICAgICAgICAgICAgIGhhbmRsZU1vdXNlTW92ZURvbGx5KGUpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBTVEFURS5QQU46XG4gICAgICAgICAgICAgICAgaWYgKGVuYWJsZVBhbiA9PT0gZmFsc2UpIHJldHVybjtcbiAgICAgICAgICAgICAgICBoYW5kbGVNb3ZlUGFuKGUuY2xpZW50WCwgZS5jbGllbnRZKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBjb25zdCBvbk1vdXNlVXAgPSAoKSA9PiB7XG4gICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCBvbk1vdXNlTW92ZSwgZmFsc2UpO1xuICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIG9uTW91c2VVcCwgZmFsc2UpO1xuICAgICAgICBzdGF0ZSA9IFNUQVRFLk5PTkU7XG4gICAgfTtcblxuICAgIGNvbnN0IG9uTW91c2VXaGVlbCA9IChlKSA9PiB7XG4gICAgICAgIGlmICghdGhpcy5lbmFibGVkIHx8ICFlbmFibGVab29tIHx8IChzdGF0ZSAhPT0gU1RBVEUuTk9ORSAmJiBzdGF0ZSAhPT0gU1RBVEUuUk9UQVRFKSkgcmV0dXJuO1xuICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgaWYgKGUuZGVsdGFZIDwgMCkge1xuICAgICAgICAgICAgZG9sbHkoMSAvIGdldFpvb21TY2FsZSgpKTtcbiAgICAgICAgfSBlbHNlIGlmIChlLmRlbHRhWSA+IDApIHtcbiAgICAgICAgICAgIGRvbGx5KGdldFpvb21TY2FsZSgpKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBjb25zdCBvblRvdWNoU3RhcnQgPSAoZSkgPT4ge1xuICAgICAgICBpZiAoIXRoaXMuZW5hYmxlZCkgcmV0dXJuO1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgc3dpdGNoIChlLnRvdWNoZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICAgICAgaWYgKGVuYWJsZVJvdGF0ZSA9PT0gZmFsc2UpIHJldHVybjtcbiAgICAgICAgICAgICAgICByb3RhdGVTdGFydC5zZXQoZS50b3VjaGVzWzBdLnBhZ2VYLCBlLnRvdWNoZXNbMF0ucGFnZVkpO1xuICAgICAgICAgICAgICAgIHN0YXRlID0gU1RBVEUuUk9UQVRFO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgICAgIGlmIChlbmFibGVab29tID09PSBmYWxzZSAmJiBlbmFibGVQYW4gPT09IGZhbHNlKSByZXR1cm47XG4gICAgICAgICAgICAgICAgaGFuZGxlVG91Y2hTdGFydERvbGx5UGFuKGUpO1xuICAgICAgICAgICAgICAgIHN0YXRlID0gU1RBVEUuRE9MTFlfUEFOO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICBzdGF0ZSA9IFNUQVRFLk5PTkU7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgY29uc3Qgb25Ub3VjaE1vdmUgPSAoZSkgPT4ge1xuICAgICAgICBpZiAoIXRoaXMuZW5hYmxlZCkgcmV0dXJuO1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG5cbiAgICAgICAgc3dpdGNoIChlLnRvdWNoZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICAgICAgaWYgKGVuYWJsZVJvdGF0ZSA9PT0gZmFsc2UpIHJldHVybjtcbiAgICAgICAgICAgICAgICBoYW5kbGVNb3ZlUm90YXRlKGUudG91Y2hlc1swXS5wYWdlWCwgZS50b3VjaGVzWzBdLnBhZ2VZKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgICAgICBpZiAoZW5hYmxlWm9vbSA9PT0gZmFsc2UgJiYgZW5hYmxlUGFuID09PSBmYWxzZSkgcmV0dXJuO1xuICAgICAgICAgICAgICAgIGhhbmRsZVRvdWNoTW92ZURvbGx5UGFuKGUpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICBzdGF0ZSA9IFNUQVRFLk5PTkU7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgY29uc3Qgb25Ub3VjaEVuZCA9ICgpID0+IHtcbiAgICAgICAgaWYgKCF0aGlzLmVuYWJsZWQpIHJldHVybjtcbiAgICAgICAgc3RhdGUgPSBTVEFURS5OT05FO1xuICAgIH07XG5cbiAgICBjb25zdCBvbkNvbnRleHRNZW51ID0gKGUpID0+IHtcbiAgICAgICAgaWYgKCF0aGlzLmVuYWJsZWQpIHJldHVybjtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBhZGRIYW5kbGVycygpIHtcbiAgICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdjb250ZXh0bWVudScsIG9uQ29udGV4dE1lbnUsIGZhbHNlKTtcbiAgICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCBvbk1vdXNlRG93biwgZmFsc2UpO1xuICAgICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3doZWVsJywgb25Nb3VzZVdoZWVsLCB7IHBhc3NpdmU6IGZhbHNlIH0pO1xuICAgICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCBvblRvdWNoU3RhcnQsIHsgcGFzc2l2ZTogZmFsc2UgfSk7XG4gICAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCBvblRvdWNoRW5kLCBmYWxzZSk7XG4gICAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgb25Ub3VjaE1vdmUsIHsgcGFzc2l2ZTogZmFsc2UgfSk7XG4gICAgfVxuXG4gICAgdGhpcy5yZW1vdmUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignY29udGV4dG1lbnUnLCBvbkNvbnRleHRNZW51KTtcbiAgICAgICAgZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCBvbk1vdXNlRG93bik7XG4gICAgICAgIGVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignd2hlZWwnLCBvbk1vdXNlV2hlZWwpO1xuICAgICAgICBlbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCBvblRvdWNoU3RhcnQpO1xuICAgICAgICBlbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgb25Ub3VjaEVuZCk7XG4gICAgICAgIGVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgb25Ub3VjaE1vdmUpO1xuICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgb25Nb3VzZU1vdmUpO1xuICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIG9uTW91c2VVcCk7XG4gICAgfTtcblxuICAgIGFkZEhhbmRsZXJzKCk7XG59XG4iLCJpbXBvcnQgeyBHZW9tZXRyeSB9IGZyb20gJy4uL2NvcmUvR2VvbWV0cnkuanMnO1xuXG5leHBvcnQgY2xhc3MgUGxhbmUgZXh0ZW5kcyBHZW9tZXRyeSB7XG4gICAgY29uc3RydWN0b3IoZ2wsIHsgd2lkdGggPSAxLCBoZWlnaHQgPSAxLCB3aWR0aFNlZ21lbnRzID0gMSwgaGVpZ2h0U2VnbWVudHMgPSAxLCBhdHRyaWJ1dGVzID0ge30gfSA9IHt9KSB7XG4gICAgICAgIGNvbnN0IHdTZWdzID0gd2lkdGhTZWdtZW50cztcbiAgICAgICAgY29uc3QgaFNlZ3MgPSBoZWlnaHRTZWdtZW50cztcblxuICAgICAgICAvLyBEZXRlcm1pbmUgbGVuZ3RoIG9mIGFycmF5c1xuICAgICAgICBjb25zdCBudW0gPSAod1NlZ3MgKyAxKSAqIChoU2VncyArIDEpO1xuICAgICAgICBjb25zdCBudW1JbmRpY2VzID0gd1NlZ3MgKiBoU2VncyAqIDY7XG5cbiAgICAgICAgLy8gR2VuZXJhdGUgZW1wdHkgYXJyYXlzIG9uY2VcbiAgICAgICAgY29uc3QgcG9zaXRpb24gPSBuZXcgRmxvYXQzMkFycmF5KG51bSAqIDMpO1xuICAgICAgICBjb25zdCBub3JtYWwgPSBuZXcgRmxvYXQzMkFycmF5KG51bSAqIDMpO1xuICAgICAgICBjb25zdCB1diA9IG5ldyBGbG9hdDMyQXJyYXkobnVtICogMik7XG4gICAgICAgIGNvbnN0IGluZGV4ID0gbnVtID4gNjU1MzYgPyBuZXcgVWludDMyQXJyYXkobnVtSW5kaWNlcykgOiBuZXcgVWludDE2QXJyYXkobnVtSW5kaWNlcyk7XG5cbiAgICAgICAgUGxhbmUuYnVpbGRQbGFuZShwb3NpdGlvbiwgbm9ybWFsLCB1diwgaW5kZXgsIHdpZHRoLCBoZWlnaHQsIDAsIHdTZWdzLCBoU2Vncyk7XG5cbiAgICAgICAgT2JqZWN0LmFzc2lnbihhdHRyaWJ1dGVzLCB7XG4gICAgICAgICAgICBwb3NpdGlvbjogeyBzaXplOiAzLCBkYXRhOiBwb3NpdGlvbiB9LFxuICAgICAgICAgICAgbm9ybWFsOiB7IHNpemU6IDMsIGRhdGE6IG5vcm1hbCB9LFxuICAgICAgICAgICAgdXY6IHsgc2l6ZTogMiwgZGF0YTogdXYgfSxcbiAgICAgICAgICAgIGluZGV4OiB7IGRhdGE6IGluZGV4IH0sXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHN1cGVyKGdsLCBhdHRyaWJ1dGVzKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgYnVpbGRQbGFuZShwb3NpdGlvbiwgbm9ybWFsLCB1diwgaW5kZXgsIHdpZHRoLCBoZWlnaHQsIGRlcHRoLCB3U2VncywgaFNlZ3MsIHUgPSAwLCB2ID0gMSwgdyA9IDIsIHVEaXIgPSAxLCB2RGlyID0gLTEsIGkgPSAwLCBpaSA9IDApIHtcbiAgICAgICAgY29uc3QgaW8gPSBpO1xuICAgICAgICBjb25zdCBzZWdXID0gd2lkdGggLyB3U2VncztcbiAgICAgICAgY29uc3Qgc2VnSCA9IGhlaWdodCAvIGhTZWdzO1xuXG4gICAgICAgIGZvciAobGV0IGl5ID0gMDsgaXkgPD0gaFNlZ3M7IGl5KyspIHtcbiAgICAgICAgICAgIGxldCB5ID0gaXkgKiBzZWdIIC0gaGVpZ2h0IC8gMjtcbiAgICAgICAgICAgIGZvciAobGV0IGl4ID0gMDsgaXggPD0gd1NlZ3M7IGl4KyssIGkrKykge1xuICAgICAgICAgICAgICAgIGxldCB4ID0gaXggKiBzZWdXIC0gd2lkdGggLyAyO1xuXG4gICAgICAgICAgICAgICAgcG9zaXRpb25baSAqIDMgKyB1XSA9IHggKiB1RGlyO1xuICAgICAgICAgICAgICAgIHBvc2l0aW9uW2kgKiAzICsgdl0gPSB5ICogdkRpcjtcbiAgICAgICAgICAgICAgICBwb3NpdGlvbltpICogMyArIHddID0gZGVwdGggLyAyO1xuXG4gICAgICAgICAgICAgICAgbm9ybWFsW2kgKiAzICsgdV0gPSAwO1xuICAgICAgICAgICAgICAgIG5vcm1hbFtpICogMyArIHZdID0gMDtcbiAgICAgICAgICAgICAgICBub3JtYWxbaSAqIDMgKyB3XSA9IGRlcHRoID49IDAgPyAxIDogLTE7XG5cbiAgICAgICAgICAgICAgICB1dltpICogMl0gPSBpeCAvIHdTZWdzO1xuICAgICAgICAgICAgICAgIHV2W2kgKiAyICsgMV0gPSAxIC0gaXkgLyBoU2VncztcblxuICAgICAgICAgICAgICAgIGlmIChpeSA9PT0gaFNlZ3MgfHwgaXggPT09IHdTZWdzKSBjb250aW51ZTtcbiAgICAgICAgICAgICAgICBsZXQgYSA9IGlvICsgaXggKyBpeSAqICh3U2VncyArIDEpO1xuICAgICAgICAgICAgICAgIGxldCBiID0gaW8gKyBpeCArIChpeSArIDEpICogKHdTZWdzICsgMSk7XG4gICAgICAgICAgICAgICAgbGV0IGMgPSBpbyArIGl4ICsgKGl5ICsgMSkgKiAod1NlZ3MgKyAxKSArIDE7XG4gICAgICAgICAgICAgICAgbGV0IGQgPSBpbyArIGl4ICsgaXkgKiAod1NlZ3MgKyAxKSArIDE7XG5cbiAgICAgICAgICAgICAgICBpbmRleFtpaSAqIDZdID0gYTtcbiAgICAgICAgICAgICAgICBpbmRleFtpaSAqIDYgKyAxXSA9IGI7XG4gICAgICAgICAgICAgICAgaW5kZXhbaWkgKiA2ICsgMl0gPSBkO1xuICAgICAgICAgICAgICAgIGluZGV4W2lpICogNiArIDNdID0gYjtcbiAgICAgICAgICAgICAgICBpbmRleFtpaSAqIDYgKyA0XSA9IGM7XG4gICAgICAgICAgICAgICAgaW5kZXhbaWkgKiA2ICsgNV0gPSBkO1xuICAgICAgICAgICAgICAgIGlpKys7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCJpbXBvcnQgeyBHZW9tZXRyeSB9IGZyb20gJy4uL2NvcmUvR2VvbWV0cnkuanMnO1xuaW1wb3J0IHsgUHJvZ3JhbSB9IGZyb20gJy4uL2NvcmUvUHJvZ3JhbS5qcyc7XG5pbXBvcnQgeyBNZXNoIH0gZnJvbSAnLi4vY29yZS9NZXNoLmpzJztcbmltcG9ydCB7IFZlYzIgfSBmcm9tICcuLi9tYXRoL1ZlYzIuanMnO1xuaW1wb3J0IHsgVmVjMyB9IGZyb20gJy4uL21hdGgvVmVjMy5qcyc7XG5pbXBvcnQgeyBDb2xvciB9IGZyb20gJy4uL21hdGgvQ29sb3IuanMnO1xuXG5jb25zdCB0bXAgPSBuZXcgVmVjMygpO1xuXG5leHBvcnQgY2xhc3MgUG9seWxpbmUge1xuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICBnbCxcbiAgICAgICAge1xuICAgICAgICAgICAgcG9pbnRzLCAvLyBBcnJheSBvZiBWZWMzc1xuICAgICAgICAgICAgdmVydGV4ID0gZGVmYXVsdFZlcnRleCxcbiAgICAgICAgICAgIGZyYWdtZW50ID0gZGVmYXVsdEZyYWdtZW50LFxuICAgICAgICAgICAgdW5pZm9ybXMgPSB7fSxcbiAgICAgICAgICAgIGF0dHJpYnV0ZXMgPSB7fSwgLy8gRm9yIHBhc3NpbmcgaW4gY3VzdG9tIGF0dHJpYnNcbiAgICAgICAgfVxuICAgICkge1xuICAgICAgICB0aGlzLmdsID0gZ2w7XG4gICAgICAgIHRoaXMucG9pbnRzID0gcG9pbnRzO1xuICAgICAgICB0aGlzLmNvdW50ID0gcG9pbnRzLmxlbmd0aDtcblxuICAgICAgICAvLyBDcmVhdGUgYnVmZmVyc1xuICAgICAgICB0aGlzLnBvc2l0aW9uID0gbmV3IEZsb2F0MzJBcnJheSh0aGlzLmNvdW50ICogMyAqIDIpO1xuICAgICAgICB0aGlzLnByZXYgPSBuZXcgRmxvYXQzMkFycmF5KHRoaXMuY291bnQgKiAzICogMik7XG4gICAgICAgIHRoaXMubmV4dCA9IG5ldyBGbG9hdDMyQXJyYXkodGhpcy5jb3VudCAqIDMgKiAyKTtcbiAgICAgICAgY29uc3Qgc2lkZSA9IG5ldyBGbG9hdDMyQXJyYXkodGhpcy5jb3VudCAqIDEgKiAyKTtcbiAgICAgICAgY29uc3QgdXYgPSBuZXcgRmxvYXQzMkFycmF5KHRoaXMuY291bnQgKiAyICogMik7XG4gICAgICAgIGNvbnN0IGluZGV4ID0gbmV3IFVpbnQxNkFycmF5KCh0aGlzLmNvdW50IC0gMSkgKiAzICogMik7XG5cbiAgICAgICAgLy8gU2V0IHN0YXRpYyBidWZmZXJzXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5jb3VudDsgaSsrKSB7XG4gICAgICAgICAgICBzaWRlLnNldChbLTEsIDFdLCBpICogMik7XG4gICAgICAgICAgICBjb25zdCB2ID0gaSAvICh0aGlzLmNvdW50IC0gMSk7XG4gICAgICAgICAgICB1di5zZXQoWzAsIHYsIDEsIHZdLCBpICogNCk7XG5cbiAgICAgICAgICAgIGlmIChpID09PSB0aGlzLmNvdW50IC0gMSkgY29udGludWU7XG4gICAgICAgICAgICBjb25zdCBpbmQgPSBpICogMjtcbiAgICAgICAgICAgIGluZGV4LnNldChbaW5kICsgMCwgaW5kICsgMSwgaW5kICsgMl0sIChpbmQgKyAwKSAqIDMpO1xuICAgICAgICAgICAgaW5kZXguc2V0KFtpbmQgKyAyLCBpbmQgKyAxLCBpbmQgKyAzXSwgKGluZCArIDEpICogMyk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBnZW9tZXRyeSA9ICh0aGlzLmdlb21ldHJ5ID0gbmV3IEdlb21ldHJ5KFxuICAgICAgICAgICAgZ2wsXG4gICAgICAgICAgICBPYmplY3QuYXNzaWduKGF0dHJpYnV0ZXMsIHtcbiAgICAgICAgICAgICAgICBwb3NpdGlvbjogeyBzaXplOiAzLCBkYXRhOiB0aGlzLnBvc2l0aW9uIH0sXG4gICAgICAgICAgICAgICAgcHJldjogeyBzaXplOiAzLCBkYXRhOiB0aGlzLnByZXYgfSxcbiAgICAgICAgICAgICAgICBuZXh0OiB7IHNpemU6IDMsIGRhdGE6IHRoaXMubmV4dCB9LFxuICAgICAgICAgICAgICAgIHNpZGU6IHsgc2l6ZTogMSwgZGF0YTogc2lkZSB9LFxuICAgICAgICAgICAgICAgIHV2OiB7IHNpemU6IDIsIGRhdGE6IHV2IH0sXG4gICAgICAgICAgICAgICAgaW5kZXg6IHsgc2l6ZTogMSwgZGF0YTogaW5kZXggfSxcbiAgICAgICAgICAgIH0pXG4gICAgICAgICkpO1xuXG4gICAgICAgIC8vIFBvcHVsYXRlIGR5bmFtaWMgYnVmZmVyc1xuICAgICAgICB0aGlzLnVwZGF0ZUdlb21ldHJ5KCk7XG5cbiAgICAgICAgaWYgKCF1bmlmb3Jtcy51UmVzb2x1dGlvbikgdGhpcy5yZXNvbHV0aW9uID0gdW5pZm9ybXMudVJlc29sdXRpb24gPSB7IHZhbHVlOiBuZXcgVmVjMigpIH07XG4gICAgICAgIGlmICghdW5pZm9ybXMudURQUikgdGhpcy5kcHIgPSB1bmlmb3Jtcy51RFBSID0geyB2YWx1ZTogMSB9O1xuICAgICAgICBpZiAoIXVuaWZvcm1zLnVUaGlja25lc3MpIHRoaXMudGhpY2tuZXNzID0gdW5pZm9ybXMudVRoaWNrbmVzcyA9IHsgdmFsdWU6IDEgfTtcbiAgICAgICAgaWYgKCF1bmlmb3Jtcy51Q29sb3IpIHRoaXMuY29sb3IgPSB1bmlmb3Jtcy51Q29sb3IgPSB7IHZhbHVlOiBuZXcgQ29sb3IoJyMwMDAnKSB9O1xuICAgICAgICBpZiAoIXVuaWZvcm1zLnVNaXRlcikgdGhpcy5taXRlciA9IHVuaWZvcm1zLnVNaXRlciA9IHsgdmFsdWU6IDEgfTtcblxuICAgICAgICAvLyBTZXQgc2l6ZSB1bmlmb3JtcycgdmFsdWVzXG4gICAgICAgIHRoaXMucmVzaXplKCk7XG5cbiAgICAgICAgY29uc3QgcHJvZ3JhbSA9ICh0aGlzLnByb2dyYW0gPSBuZXcgUHJvZ3JhbShnbCwge1xuICAgICAgICAgICAgdmVydGV4LFxuICAgICAgICAgICAgZnJhZ21lbnQsXG4gICAgICAgICAgICB1bmlmb3JtcyxcbiAgICAgICAgfSkpO1xuXG4gICAgICAgIHRoaXMubWVzaCA9IG5ldyBNZXNoKGdsLCB7IGdlb21ldHJ5LCBwcm9ncmFtIH0pO1xuICAgIH1cblxuICAgIHVwZGF0ZUdlb21ldHJ5KCkge1xuICAgICAgICB0aGlzLnBvaW50cy5mb3JFYWNoKChwLCBpKSA9PiB7XG4gICAgICAgICAgICBwLnRvQXJyYXkodGhpcy5wb3NpdGlvbiwgaSAqIDMgKiAyKTtcbiAgICAgICAgICAgIHAudG9BcnJheSh0aGlzLnBvc2l0aW9uLCBpICogMyAqIDIgKyAzKTtcblxuICAgICAgICAgICAgaWYgKCFpKSB7XG4gICAgICAgICAgICAgICAgLy8gSWYgZmlyc3QgcG9pbnQsIGNhbGN1bGF0ZSBwcmV2IHVzaW5nIHRoZSBkaXN0YW5jZSB0byAybmQgcG9pbnRcbiAgICAgICAgICAgICAgICB0bXAuY29weShwKVxuICAgICAgICAgICAgICAgICAgICAuc3ViKHRoaXMucG9pbnRzW2kgKyAxXSlcbiAgICAgICAgICAgICAgICAgICAgLmFkZChwKTtcbiAgICAgICAgICAgICAgICB0bXAudG9BcnJheSh0aGlzLnByZXYsIGkgKiAzICogMik7XG4gICAgICAgICAgICAgICAgdG1wLnRvQXJyYXkodGhpcy5wcmV2LCBpICogMyAqIDIgKyAzKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcC50b0FycmF5KHRoaXMubmV4dCwgKGkgLSAxKSAqIDMgKiAyKTtcbiAgICAgICAgICAgICAgICBwLnRvQXJyYXkodGhpcy5uZXh0LCAoaSAtIDEpICogMyAqIDIgKyAzKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGkgPT09IHRoaXMucG9pbnRzLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgICAgICAgICAvLyBJZiBsYXN0IHBvaW50LCBjYWxjdWxhdGUgbmV4dCB1c2luZyBkaXN0YW5jZSB0byAybmQgbGFzdCBwb2ludFxuICAgICAgICAgICAgICAgIHRtcC5jb3B5KHApXG4gICAgICAgICAgICAgICAgICAgIC5zdWIodGhpcy5wb2ludHNbaSAtIDFdKVxuICAgICAgICAgICAgICAgICAgICAuYWRkKHApO1xuICAgICAgICAgICAgICAgIHRtcC50b0FycmF5KHRoaXMubmV4dCwgaSAqIDMgKiAyKTtcbiAgICAgICAgICAgICAgICB0bXAudG9BcnJheSh0aGlzLm5leHQsIGkgKiAzICogMiArIDMpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBwLnRvQXJyYXkodGhpcy5wcmV2LCAoaSArIDEpICogMyAqIDIpO1xuICAgICAgICAgICAgICAgIHAudG9BcnJheSh0aGlzLnByZXYsIChpICsgMSkgKiAzICogMiArIDMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLmdlb21ldHJ5LmF0dHJpYnV0ZXMucG9zaXRpb24ubmVlZHNVcGRhdGUgPSB0cnVlO1xuICAgICAgICB0aGlzLmdlb21ldHJ5LmF0dHJpYnV0ZXMucHJldi5uZWVkc1VwZGF0ZSA9IHRydWU7XG4gICAgICAgIHRoaXMuZ2VvbWV0cnkuYXR0cmlidXRlcy5uZXh0Lm5lZWRzVXBkYXRlID0gdHJ1ZTtcbiAgICB9XG5cbiAgICAvLyBPbmx5IG5lZWQgdG8gY2FsbCBpZiBub3QgaGFuZGxpbmcgcmVzb2x1dGlvbiB1bmlmb3JtcyBtYW51YWxseVxuICAgIHJlc2l6ZSgpIHtcbiAgICAgICAgLy8gVXBkYXRlIGF1dG9tYXRpYyB1bmlmb3JtcyBpZiBub3Qgb3ZlcnJpZGRlblxuICAgICAgICBpZiAodGhpcy5yZXNvbHV0aW9uKSB0aGlzLnJlc29sdXRpb24udmFsdWUuc2V0KHRoaXMuZ2wuY2FudmFzLndpZHRoLCB0aGlzLmdsLmNhbnZhcy5oZWlnaHQpO1xuICAgICAgICBpZiAodGhpcy5kcHIpIHRoaXMuZHByLnZhbHVlID0gdGhpcy5nbC5yZW5kZXJlci5kcHI7XG4gICAgfVxufVxuXG5jb25zdCBkZWZhdWx0VmVydGV4ID0gLyogZ2xzbCAqLyBgXG4gICAgcHJlY2lzaW9uIGhpZ2hwIGZsb2F0O1xuXG4gICAgYXR0cmlidXRlIHZlYzMgcG9zaXRpb247XG4gICAgYXR0cmlidXRlIHZlYzMgbmV4dDtcbiAgICBhdHRyaWJ1dGUgdmVjMyBwcmV2O1xuICAgIGF0dHJpYnV0ZSB2ZWMyIHV2O1xuICAgIGF0dHJpYnV0ZSBmbG9hdCBzaWRlO1xuXG4gICAgdW5pZm9ybSBtYXQ0IG1vZGVsVmlld01hdHJpeDtcbiAgICB1bmlmb3JtIG1hdDQgcHJvamVjdGlvbk1hdHJpeDtcbiAgICB1bmlmb3JtIHZlYzIgdVJlc29sdXRpb247XG4gICAgdW5pZm9ybSBmbG9hdCB1RFBSO1xuICAgIHVuaWZvcm0gZmxvYXQgdVRoaWNrbmVzcztcbiAgICB1bmlmb3JtIGZsb2F0IHVNaXRlcjtcblxuICAgIHZhcnlpbmcgdmVjMiB2VXY7XG5cbiAgICB2ZWM0IGdldFBvc2l0aW9uKCkge1xuICAgICAgICBtYXQ0IG12cCA9IHByb2plY3Rpb25NYXRyaXggKiBtb2RlbFZpZXdNYXRyaXg7XG4gICAgICAgIHZlYzQgY3VycmVudCA9IG12cCAqIHZlYzQocG9zaXRpb24sIDEpO1xuICAgICAgICB2ZWM0IG5leHRQb3MgPSBtdnAgKiB2ZWM0KG5leHQsIDEpO1xuICAgICAgICB2ZWM0IHByZXZQb3MgPSBtdnAgKiB2ZWM0KHByZXYsIDEpO1xuXG4gICAgICAgIHZlYzIgYXNwZWN0ID0gdmVjMih1UmVzb2x1dGlvbi54IC8gdVJlc29sdXRpb24ueSwgMSk7ICAgIFxuICAgICAgICB2ZWMyIGN1cnJlbnRTY3JlZW4gPSBjdXJyZW50Lnh5IC8gY3VycmVudC53ICogYXNwZWN0O1xuICAgICAgICB2ZWMyIG5leHRTY3JlZW4gPSBuZXh0UG9zLnh5IC8gbmV4dFBvcy53ICogYXNwZWN0O1xuICAgICAgICB2ZWMyIHByZXZTY3JlZW4gPSBwcmV2UG9zLnh5IC8gcHJldlBvcy53ICogYXNwZWN0O1xuICAgIFxuICAgICAgICB2ZWMyIGRpcjEgPSBub3JtYWxpemUoY3VycmVudFNjcmVlbiAtIHByZXZTY3JlZW4pO1xuICAgICAgICB2ZWMyIGRpcjIgPSBub3JtYWxpemUobmV4dFNjcmVlbiAtIGN1cnJlbnRTY3JlZW4pO1xuICAgICAgICB2ZWMyIGRpciA9IG5vcm1hbGl6ZShkaXIxICsgZGlyMik7XG4gICAgXG4gICAgICAgIHZlYzIgbm9ybWFsID0gdmVjMigtZGlyLnksIGRpci54KTtcbiAgICAgICAgbm9ybWFsIC89IG1peCgxLjAsIG1heCgwLjMsIGRvdChub3JtYWwsIHZlYzIoLWRpcjEueSwgZGlyMS54KSkpLCB1TWl0ZXIpO1xuICAgICAgICBub3JtYWwgLz0gYXNwZWN0O1xuXG4gICAgICAgIGZsb2F0IHBpeGVsV2lkdGhSYXRpbyA9IDEuMCAvICh1UmVzb2x1dGlvbi55IC8gdURQUik7XG4gICAgICAgIGZsb2F0IHBpeGVsV2lkdGggPSBjdXJyZW50LncgKiBwaXhlbFdpZHRoUmF0aW87XG4gICAgICAgIG5vcm1hbCAqPSBwaXhlbFdpZHRoICogdVRoaWNrbmVzcztcbiAgICAgICAgY3VycmVudC54eSAtPSBub3JtYWwgKiBzaWRlO1xuICAgIFxuICAgICAgICByZXR1cm4gY3VycmVudDtcbiAgICB9XG5cbiAgICB2b2lkIG1haW4oKSB7XG4gICAgICAgIHZVdiA9IHV2O1xuICAgICAgICBnbF9Qb3NpdGlvbiA9IGdldFBvc2l0aW9uKCk7XG4gICAgfVxuYDtcblxuY29uc3QgZGVmYXVsdEZyYWdtZW50ID0gLyogZ2xzbCAqLyBgXG4gICAgcHJlY2lzaW9uIGhpZ2hwIGZsb2F0O1xuXG4gICAgdW5pZm9ybSB2ZWMzIHVDb2xvcjtcbiAgICBcbiAgICB2YXJ5aW5nIHZlYzIgdlV2O1xuXG4gICAgdm9pZCBtYWluKCkge1xuICAgICAgICBnbF9GcmFnQ29sb3IucmdiID0gdUNvbG9yO1xuICAgICAgICBnbF9GcmFnQ29sb3IuYSA9IDEuMDtcbiAgICB9XG5gO1xuIiwiLy8gVE9ETzogRGVzdHJveSByZW5kZXIgdGFyZ2V0cyBpZiBzaXplIGNoYW5nZWQgYW5kIGV4aXN0c1xuXG5pbXBvcnQgeyBQcm9ncmFtIH0gZnJvbSAnLi4vY29yZS9Qcm9ncmFtLmpzJztcbmltcG9ydCB7IE1lc2ggfSBmcm9tICcuLi9jb3JlL01lc2guanMnO1xuaW1wb3J0IHsgUmVuZGVyVGFyZ2V0IH0gZnJvbSAnLi4vY29yZS9SZW5kZXJUYXJnZXQuanMnO1xuaW1wb3J0IHsgVHJpYW5nbGUgfSBmcm9tICcuL1RyaWFuZ2xlLmpzJztcblxuZXhwb3J0IGNsYXNzIFBvc3Qge1xuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICBnbCxcbiAgICAgICAge1xuICAgICAgICAgICAgd2lkdGgsXG4gICAgICAgICAgICBoZWlnaHQsXG4gICAgICAgICAgICBkcHIsXG4gICAgICAgICAgICB3cmFwUyA9IGdsLkNMQU1QX1RPX0VER0UsXG4gICAgICAgICAgICB3cmFwVCA9IGdsLkNMQU1QX1RPX0VER0UsXG4gICAgICAgICAgICBtaW5GaWx0ZXIgPSBnbC5MSU5FQVIsXG4gICAgICAgICAgICBtYWdGaWx0ZXIgPSBnbC5MSU5FQVIsXG4gICAgICAgICAgICBnZW9tZXRyeSA9IG5ldyBUcmlhbmdsZShnbCksXG4gICAgICAgICAgICB0YXJnZXRPbmx5ID0gbnVsbCxcbiAgICAgICAgfSA9IHt9XG4gICAgKSB7XG4gICAgICAgIHRoaXMuZ2wgPSBnbDtcblxuICAgICAgICB0aGlzLm9wdGlvbnMgPSB7IHdyYXBTLCB3cmFwVCwgbWluRmlsdGVyLCBtYWdGaWx0ZXIgfTtcblxuICAgICAgICB0aGlzLnBhc3NlcyA9IFtdO1xuXG4gICAgICAgIHRoaXMuZ2VvbWV0cnkgPSBnZW9tZXRyeTtcblxuICAgICAgICB0aGlzLnVuaWZvcm0gPSB7IHZhbHVlOiBudWxsIH07XG4gICAgICAgIHRoaXMudGFyZ2V0T25seSA9IHRhcmdldE9ubHk7XG5cbiAgICAgICAgY29uc3QgZmJvID0gKHRoaXMuZmJvID0ge1xuICAgICAgICAgICAgcmVhZDogbnVsbCxcbiAgICAgICAgICAgIHdyaXRlOiBudWxsLFxuICAgICAgICAgICAgc3dhcDogKCkgPT4ge1xuICAgICAgICAgICAgICAgIGxldCB0ZW1wID0gZmJvLnJlYWQ7XG4gICAgICAgICAgICAgICAgZmJvLnJlYWQgPSBmYm8ud3JpdGU7XG4gICAgICAgICAgICAgICAgZmJvLndyaXRlID0gdGVtcDtcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMucmVzaXplKHsgd2lkdGgsIGhlaWdodCwgZHByIH0pO1xuICAgIH1cblxuICAgIGFkZFBhc3MoeyB2ZXJ0ZXggPSBkZWZhdWx0VmVydGV4LCBmcmFnbWVudCA9IGRlZmF1bHRGcmFnbWVudCwgdW5pZm9ybXMgPSB7fSwgdGV4dHVyZVVuaWZvcm0gPSAndE1hcCcsIGVuYWJsZWQgPSB0cnVlIH0gPSB7fSkge1xuICAgICAgICB1bmlmb3Jtc1t0ZXh0dXJlVW5pZm9ybV0gPSB7IHZhbHVlOiB0aGlzLmZiby5yZWFkLnRleHR1cmUgfTtcblxuICAgICAgICBjb25zdCBwcm9ncmFtID0gbmV3IFByb2dyYW0odGhpcy5nbCwgeyB2ZXJ0ZXgsIGZyYWdtZW50LCB1bmlmb3JtcyB9KTtcbiAgICAgICAgY29uc3QgbWVzaCA9IG5ldyBNZXNoKHRoaXMuZ2wsIHsgZ2VvbWV0cnk6IHRoaXMuZ2VvbWV0cnksIHByb2dyYW0gfSk7XG5cbiAgICAgICAgY29uc3QgcGFzcyA9IHtcbiAgICAgICAgICAgIG1lc2gsXG4gICAgICAgICAgICBwcm9ncmFtLFxuICAgICAgICAgICAgdW5pZm9ybXMsXG4gICAgICAgICAgICBlbmFibGVkLFxuICAgICAgICAgICAgdGV4dHVyZVVuaWZvcm0sXG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5wYXNzZXMucHVzaChwYXNzKTtcbiAgICAgICAgcmV0dXJuIHBhc3M7XG4gICAgfVxuXG4gICAgcmVzaXplKHsgd2lkdGgsIGhlaWdodCwgZHByIH0gPSB7fSkge1xuICAgICAgICBpZiAoZHByKSB0aGlzLmRwciA9IGRwcjtcbiAgICAgICAgaWYgKHdpZHRoKSB7XG4gICAgICAgICAgICB0aGlzLndpZHRoID0gd2lkdGg7XG4gICAgICAgICAgICB0aGlzLmhlaWdodCA9IGhlaWdodCB8fCB3aWR0aDtcbiAgICAgICAgfVxuXG4gICAgICAgIGRwciA9IHRoaXMuZHByIHx8IHRoaXMuZ2wucmVuZGVyZXIuZHByO1xuICAgICAgICB3aWR0aCA9ICh0aGlzLndpZHRoIHx8IHRoaXMuZ2wucmVuZGVyZXIud2lkdGgpICogZHByO1xuICAgICAgICBoZWlnaHQgPSAodGhpcy5oZWlnaHQgfHwgdGhpcy5nbC5yZW5kZXJlci5oZWlnaHQpICogZHByO1xuXG4gICAgICAgIHRoaXMub3B0aW9ucy53aWR0aCA9IHdpZHRoO1xuICAgICAgICB0aGlzLm9wdGlvbnMuaGVpZ2h0ID0gaGVpZ2h0O1xuXG4gICAgICAgIHRoaXMuZmJvLnJlYWQgPSBuZXcgUmVuZGVyVGFyZ2V0KHRoaXMuZ2wsIHRoaXMub3B0aW9ucyk7XG4gICAgICAgIHRoaXMuZmJvLndyaXRlID0gbmV3IFJlbmRlclRhcmdldCh0aGlzLmdsLCB0aGlzLm9wdGlvbnMpO1xuICAgIH1cblxuICAgIC8vIFVzZXMgc2FtZSBhcmd1bWVudHMgYXMgcmVuZGVyZXIucmVuZGVyXG4gICAgcmVuZGVyKHsgc2NlbmUsIGNhbWVyYSwgdGFyZ2V0ID0gbnVsbCwgdXBkYXRlID0gdHJ1ZSwgc29ydCA9IHRydWUsIGZydXN0dW1DdWxsID0gdHJ1ZSB9KSB7XG4gICAgICAgIGNvbnN0IGVuYWJsZWRQYXNzZXMgPSB0aGlzLnBhc3Nlcy5maWx0ZXIoKHBhc3MpID0+IHBhc3MuZW5hYmxlZCk7XG5cbiAgICAgICAgdGhpcy5nbC5yZW5kZXJlci5yZW5kZXIoe1xuICAgICAgICAgICAgc2NlbmUsXG4gICAgICAgICAgICBjYW1lcmEsXG4gICAgICAgICAgICB0YXJnZXQ6IGVuYWJsZWRQYXNzZXMubGVuZ3RoIHx8ICghdGFyZ2V0ICYmIHRoaXMudGFyZ2V0T25seSkgPyB0aGlzLmZiby53cml0ZSA6IHRhcmdldCxcbiAgICAgICAgICAgIHVwZGF0ZSxcbiAgICAgICAgICAgIHNvcnQsXG4gICAgICAgICAgICBmcnVzdHVtQ3VsbCxcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuZmJvLnN3YXAoKTtcblxuICAgICAgICBlbmFibGVkUGFzc2VzLmZvckVhY2goKHBhc3MsIGkpID0+IHtcbiAgICAgICAgICAgIHBhc3MubWVzaC5wcm9ncmFtLnVuaWZvcm1zW3Bhc3MudGV4dHVyZVVuaWZvcm1dLnZhbHVlID0gdGhpcy5mYm8ucmVhZC50ZXh0dXJlO1xuICAgICAgICAgICAgdGhpcy5nbC5yZW5kZXJlci5yZW5kZXIoe1xuICAgICAgICAgICAgICAgIHNjZW5lOiBwYXNzLm1lc2gsXG4gICAgICAgICAgICAgICAgdGFyZ2V0OiBpID09PSBlbmFibGVkUGFzc2VzLmxlbmd0aCAtIDEgJiYgKHRhcmdldCB8fCAhdGhpcy50YXJnZXRPbmx5KSA/IHRhcmdldCA6IHRoaXMuZmJvLndyaXRlLFxuICAgICAgICAgICAgICAgIGNsZWFyOiB0cnVlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLmZiby5zd2FwKCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMudW5pZm9ybS52YWx1ZSA9IHRoaXMuZmJvLnJlYWQudGV4dHVyZTtcbiAgICB9XG59XG5cbmNvbnN0IGRlZmF1bHRWZXJ0ZXggPSAvKiBnbHNsICovIGBcbiAgICBhdHRyaWJ1dGUgdmVjMiB1djtcbiAgICBhdHRyaWJ1dGUgdmVjMiBwb3NpdGlvbjtcblxuICAgIHZhcnlpbmcgdmVjMiB2VXY7XG5cbiAgICB2b2lkIG1haW4oKSB7XG4gICAgICAgIHZVdiA9IHV2O1xuICAgICAgICBnbF9Qb3NpdGlvbiA9IHZlYzQocG9zaXRpb24sIDAsIDEpO1xuICAgIH1cbmA7XG5cbmNvbnN0IGRlZmF1bHRGcmFnbWVudCA9IC8qIGdsc2wgKi8gYFxuICAgIHByZWNpc2lvbiBoaWdocCBmbG9hdDtcblxuICAgIHVuaWZvcm0gc2FtcGxlcjJEIHRNYXA7XG4gICAgdmFyeWluZyB2ZWMyIHZVdjtcblxuICAgIHZvaWQgbWFpbigpIHtcbiAgICAgICAgZ2xfRnJhZ0NvbG9yID0gdGV4dHVyZTJEKHRNYXAsIHZVdik7XG4gICAgfVxuYDtcbiIsIi8vIFRPRE86IGJhcnljZW50cmljIGNvZGUgc2hvdWxkbid0IGJlIGhlcmUsIGJ1dCB3aGVyZT9cbi8vIFRPRE86IFNwaGVyZUNhc3Q/XG5cbmltcG9ydCB7IFZlYzIgfSBmcm9tICcuLi9tYXRoL1ZlYzIuanMnO1xuaW1wb3J0IHsgVmVjMyB9IGZyb20gJy4uL21hdGgvVmVjMy5qcyc7XG5pbXBvcnQgeyBNYXQ0IH0gZnJvbSAnLi4vbWF0aC9NYXQ0LmpzJztcblxuY29uc3QgdGVtcFZlYzJhID0gbmV3IFZlYzIoKTtcbmNvbnN0IHRlbXBWZWMyYiA9IG5ldyBWZWMyKCk7XG5jb25zdCB0ZW1wVmVjMmMgPSBuZXcgVmVjMigpO1xuXG5jb25zdCB0ZW1wVmVjM2EgPSBuZXcgVmVjMygpO1xuY29uc3QgdGVtcFZlYzNiID0gbmV3IFZlYzMoKTtcbmNvbnN0IHRlbXBWZWMzYyA9IG5ldyBWZWMzKCk7XG5jb25zdCB0ZW1wVmVjM2QgPSBuZXcgVmVjMygpO1xuY29uc3QgdGVtcFZlYzNlID0gbmV3IFZlYzMoKTtcbmNvbnN0IHRlbXBWZWMzZiA9IG5ldyBWZWMzKCk7XG5jb25zdCB0ZW1wVmVjM2cgPSBuZXcgVmVjMygpO1xuY29uc3QgdGVtcFZlYzNoID0gbmV3IFZlYzMoKTtcbmNvbnN0IHRlbXBWZWMzaSA9IG5ldyBWZWMzKCk7XG5jb25zdCB0ZW1wVmVjM2ogPSBuZXcgVmVjMygpO1xuY29uc3QgdGVtcFZlYzNrID0gbmV3IFZlYzMoKTtcblxuY29uc3QgdGVtcE1hdDQgPSBuZXcgTWF0NCgpO1xuXG5leHBvcnQgY2xhc3MgUmF5Y2FzdCB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMub3JpZ2luID0gbmV3IFZlYzMoKTtcbiAgICAgICAgdGhpcy5kaXJlY3Rpb24gPSBuZXcgVmVjMygpO1xuICAgIH1cblxuICAgIC8vIFNldCByYXkgZnJvbSBtb3VzZSB1bnByb2plY3Rpb25cbiAgICBjYXN0TW91c2UoY2FtZXJhLCBtb3VzZSA9IFswLCAwXSkge1xuICAgICAgICBpZiAoY2FtZXJhLnR5cGUgPT09ICdvcnRob2dyYXBoaWMnKSB7XG4gICAgICAgICAgICAvLyBTZXQgb3JpZ2luXG4gICAgICAgICAgICAvLyBTaW5jZSBjYW1lcmEgaXMgb3J0aG9ncmFwaGljLCBvcmlnaW4gaXMgbm90IHRoZSBjYW1lcmEgcG9zaXRpb25cbiAgICAgICAgICAgIGNvbnN0IHsgbGVmdCwgcmlnaHQsIGJvdHRvbSwgdG9wLCB6b29tIH0gPSBjYW1lcmE7XG4gICAgICAgICAgICBjb25zdCB4ID0gbGVmdCAvIHpvb20gKyAoKHJpZ2h0IC0gbGVmdCkgLyB6b29tKSAqIChtb3VzZVswXSAqIDAuNSArIDAuNSk7XG4gICAgICAgICAgICBjb25zdCB5ID0gYm90dG9tIC8gem9vbSArICgodG9wIC0gYm90dG9tKSAvIHpvb20pICogKG1vdXNlWzFdICogMC41ICsgMC41KTtcbiAgICAgICAgICAgIHRoaXMub3JpZ2luLnNldCh4LCB5LCAwKTtcbiAgICAgICAgICAgIHRoaXMub3JpZ2luLmFwcGx5TWF0cml4NChjYW1lcmEud29ybGRNYXRyaXgpO1xuXG4gICAgICAgICAgICAvLyBTZXQgZGlyZWN0aW9uXG4gICAgICAgICAgICAvLyBodHRwczovL2NvbW11bml0eS5raHJvbm9zLm9yZy90L2dldC1kaXJlY3Rpb24tZnJvbS10cmFuc2Zvcm1hdGlvbi1tYXRyaXgtb3ItcXVhdC82NTUwMi8yXG4gICAgICAgICAgICB0aGlzLmRpcmVjdGlvbi54ID0gLWNhbWVyYS53b3JsZE1hdHJpeFs4XTtcbiAgICAgICAgICAgIHRoaXMuZGlyZWN0aW9uLnkgPSAtY2FtZXJhLndvcmxkTWF0cml4WzldO1xuICAgICAgICAgICAgdGhpcy5kaXJlY3Rpb24ueiA9IC1jYW1lcmEud29ybGRNYXRyaXhbMTBdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gU2V0IG9yaWdpblxuICAgICAgICAgICAgY2FtZXJhLndvcmxkTWF0cml4LmdldFRyYW5zbGF0aW9uKHRoaXMub3JpZ2luKTtcblxuICAgICAgICAgICAgLy8gU2V0IGRpcmVjdGlvblxuICAgICAgICAgICAgdGhpcy5kaXJlY3Rpb24uc2V0KG1vdXNlWzBdLCBtb3VzZVsxXSwgMC41KTtcbiAgICAgICAgICAgIGNhbWVyYS51bnByb2plY3QodGhpcy5kaXJlY3Rpb24pO1xuICAgICAgICAgICAgdGhpcy5kaXJlY3Rpb24uc3ViKHRoaXMub3JpZ2luKS5ub3JtYWxpemUoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGludGVyc2VjdEJvdW5kcyhtZXNoZXMsIHsgbWF4RGlzdGFuY2UsIG91dHB1dCA9IFtdIH0gPSB7fSkge1xuICAgICAgICBpZiAoIUFycmF5LmlzQXJyYXkobWVzaGVzKSkgbWVzaGVzID0gW21lc2hlc107XG5cbiAgICAgICAgY29uc3QgaW52V29ybGRNYXQ0ID0gdGVtcE1hdDQ7XG4gICAgICAgIGNvbnN0IG9yaWdpbiA9IHRlbXBWZWMzYTtcbiAgICAgICAgY29uc3QgZGlyZWN0aW9uID0gdGVtcFZlYzNiO1xuXG4gICAgICAgIGNvbnN0IGhpdHMgPSBvdXRwdXQ7XG4gICAgICAgIGhpdHMubGVuZ3RoID0gMDtcblxuICAgICAgICBtZXNoZXMuZm9yRWFjaCgobWVzaCkgPT4ge1xuICAgICAgICAgICAgLy8gQ3JlYXRlIGJvdW5kc1xuICAgICAgICAgICAgaWYgKCFtZXNoLmdlb21ldHJ5LmJvdW5kcyB8fCBtZXNoLmdlb21ldHJ5LmJvdW5kcy5yYWRpdXMgPT09IEluZmluaXR5KSBtZXNoLmdlb21ldHJ5LmNvbXB1dGVCb3VuZGluZ1NwaGVyZSgpO1xuICAgICAgICAgICAgY29uc3QgYm91bmRzID0gbWVzaC5nZW9tZXRyeS5ib3VuZHM7XG4gICAgICAgICAgICBpbnZXb3JsZE1hdDQuaW52ZXJzZShtZXNoLndvcmxkTWF0cml4KTtcblxuICAgICAgICAgICAgLy8gR2V0IG1heCBkaXN0YW5jZSBsb2NhbGx5XG4gICAgICAgICAgICBsZXQgbG9jYWxNYXhEaXN0YW5jZTtcbiAgICAgICAgICAgIGlmIChtYXhEaXN0YW5jZSkge1xuICAgICAgICAgICAgICAgIGRpcmVjdGlvbi5jb3B5KHRoaXMuZGlyZWN0aW9uKS5zY2FsZVJvdGF0ZU1hdHJpeDQoaW52V29ybGRNYXQ0KTtcbiAgICAgICAgICAgICAgICBsb2NhbE1heERpc3RhbmNlID0gbWF4RGlzdGFuY2UgKiBkaXJlY3Rpb24ubGVuKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFRha2Ugd29ybGQgc3BhY2UgcmF5IGFuZCBtYWtlIGl0IG9iamVjdCBzcGFjZSB0byBhbGlnbiB3aXRoIGJvdW5kaW5nIGJveFxuICAgICAgICAgICAgb3JpZ2luLmNvcHkodGhpcy5vcmlnaW4pLmFwcGx5TWF0cml4NChpbnZXb3JsZE1hdDQpO1xuICAgICAgICAgICAgZGlyZWN0aW9uLmNvcHkodGhpcy5kaXJlY3Rpb24pLnRyYW5zZm9ybURpcmVjdGlvbihpbnZXb3JsZE1hdDQpO1xuXG4gICAgICAgICAgICAvLyBCcmVhayBvdXQgZWFybHkgaWYgYm91bmRzIHRvbyBmYXIgYXdheSBmcm9tIG9yaWdpblxuICAgICAgICAgICAgaWYgKG1heERpc3RhbmNlKSB7XG4gICAgICAgICAgICAgICAgaWYgKG9yaWdpbi5kaXN0YW5jZShib3VuZHMuY2VudGVyKSAtIGJvdW5kcy5yYWRpdXMgPiBsb2NhbE1heERpc3RhbmNlKSByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGxldCBsb2NhbERpc3RhbmNlID0gMDtcblxuICAgICAgICAgICAgLy8gQ2hlY2sgb3JpZ2luIGlzbid0IGluc2lkZSBib3VuZHMgYmVmb3JlIHRlc3RpbmcgaW50ZXJzZWN0aW9uXG4gICAgICAgICAgICBpZiAobWVzaC5nZW9tZXRyeS5yYXljYXN0ID09PSAnc3BoZXJlJykge1xuICAgICAgICAgICAgICAgIGlmIChvcmlnaW4uZGlzdGFuY2UoYm91bmRzLmNlbnRlcikgPiBib3VuZHMucmFkaXVzKSB7XG4gICAgICAgICAgICAgICAgICAgIGxvY2FsRGlzdGFuY2UgPSB0aGlzLmludGVyc2VjdFNwaGVyZShib3VuZHMsIG9yaWdpbiwgZGlyZWN0aW9uKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFsb2NhbERpc3RhbmNlKSByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgICAgIG9yaWdpbi54IDwgYm91bmRzLm1pbi54IHx8XG4gICAgICAgICAgICAgICAgICAgIG9yaWdpbi54ID4gYm91bmRzLm1heC54IHx8XG4gICAgICAgICAgICAgICAgICAgIG9yaWdpbi55IDwgYm91bmRzLm1pbi55IHx8XG4gICAgICAgICAgICAgICAgICAgIG9yaWdpbi55ID4gYm91bmRzLm1heC55IHx8XG4gICAgICAgICAgICAgICAgICAgIG9yaWdpbi56IDwgYm91bmRzLm1pbi56IHx8XG4gICAgICAgICAgICAgICAgICAgIG9yaWdpbi56ID4gYm91bmRzLm1heC56XG4gICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgIGxvY2FsRGlzdGFuY2UgPSB0aGlzLmludGVyc2VjdEJveChib3VuZHMsIG9yaWdpbiwgZGlyZWN0aW9uKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFsb2NhbERpc3RhbmNlKSByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAobWF4RGlzdGFuY2UgJiYgbG9jYWxEaXN0YW5jZSA+IGxvY2FsTWF4RGlzdGFuY2UpIHJldHVybjtcblxuICAgICAgICAgICAgLy8gQ3JlYXRlIG9iamVjdCBvbiBtZXNoIHRvIGF2b2lkIGdlbmVyYXRpbmcgbG90cyBvZiBvYmplY3RzXG4gICAgICAgICAgICBpZiAoIW1lc2guaGl0KSBtZXNoLmhpdCA9IHsgbG9jYWxQb2ludDogbmV3IFZlYzMoKSwgcG9pbnQ6IG5ldyBWZWMzKCkgfTtcblxuICAgICAgICAgICAgbWVzaC5oaXQubG9jYWxQb2ludC5jb3B5KGRpcmVjdGlvbikubXVsdGlwbHkobG9jYWxEaXN0YW5jZSkuYWRkKG9yaWdpbik7XG4gICAgICAgICAgICBtZXNoLmhpdC5wb2ludC5jb3B5KG1lc2guaGl0LmxvY2FsUG9pbnQpLmFwcGx5TWF0cml4NChtZXNoLndvcmxkTWF0cml4KTtcbiAgICAgICAgICAgIG1lc2guaGl0LmRpc3RhbmNlID0gbWVzaC5oaXQucG9pbnQuZGlzdGFuY2UodGhpcy5vcmlnaW4pO1xuXG4gICAgICAgICAgICBoaXRzLnB1c2gobWVzaCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGhpdHMuc29ydCgoYSwgYikgPT4gYS5oaXQuZGlzdGFuY2UgLSBiLmhpdC5kaXN0YW5jZSk7XG4gICAgICAgIHJldHVybiBoaXRzO1xuICAgIH1cblxuICAgIGludGVyc2VjdE1lc2hlcyhtZXNoZXMsIHsgY3VsbEZhY2UgPSB0cnVlLCBtYXhEaXN0YW5jZSwgaW5jbHVkZVVWID0gdHJ1ZSwgaW5jbHVkZU5vcm1hbCA9IHRydWUsIG91dHB1dCA9IFtdIH0gPSB7fSkge1xuICAgICAgICAvLyBUZXN0IGJvdW5kcyBmaXJzdCBiZWZvcmUgdGVzdGluZyBnZW9tZXRyeVxuICAgICAgICBjb25zdCBoaXRzID0gdGhpcy5pbnRlcnNlY3RCb3VuZHMobWVzaGVzLCB7IG1heERpc3RhbmNlLCBvdXRwdXQgfSk7XG4gICAgICAgIGlmICghaGl0cy5sZW5ndGgpIHJldHVybiBoaXRzO1xuXG4gICAgICAgIGNvbnN0IGludldvcmxkTWF0NCA9IHRlbXBNYXQ0O1xuICAgICAgICBjb25zdCBvcmlnaW4gPSB0ZW1wVmVjM2E7XG4gICAgICAgIGNvbnN0IGRpcmVjdGlvbiA9IHRlbXBWZWMzYjtcbiAgICAgICAgY29uc3QgYSA9IHRlbXBWZWMzYztcbiAgICAgICAgY29uc3QgYiA9IHRlbXBWZWMzZDtcbiAgICAgICAgY29uc3QgYyA9IHRlbXBWZWMzZTtcbiAgICAgICAgY29uc3QgY2xvc2VzdEZhY2VOb3JtYWwgPSB0ZW1wVmVjM2Y7XG4gICAgICAgIGNvbnN0IGZhY2VOb3JtYWwgPSB0ZW1wVmVjM2c7XG4gICAgICAgIGNvbnN0IGJhcnljb29yZCA9IHRlbXBWZWMzaDtcbiAgICAgICAgY29uc3QgdXZBID0gdGVtcFZlYzJhO1xuICAgICAgICBjb25zdCB1dkIgPSB0ZW1wVmVjMmI7XG4gICAgICAgIGNvbnN0IHV2QyA9IHRlbXBWZWMyYztcblxuICAgICAgICBmb3IgKGxldCBpID0gaGl0cy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICAgICAgY29uc3QgbWVzaCA9IGhpdHNbaV07XG4gICAgICAgICAgICBpbnZXb3JsZE1hdDQuaW52ZXJzZShtZXNoLndvcmxkTWF0cml4KTtcblxuICAgICAgICAgICAgLy8gR2V0IG1heCBkaXN0YW5jZSBsb2NhbGx5XG4gICAgICAgICAgICBsZXQgbG9jYWxNYXhEaXN0YW5jZTtcbiAgICAgICAgICAgIGlmIChtYXhEaXN0YW5jZSkge1xuICAgICAgICAgICAgICAgIGRpcmVjdGlvbi5jb3B5KHRoaXMuZGlyZWN0aW9uKS5zY2FsZVJvdGF0ZU1hdHJpeDQoaW52V29ybGRNYXQ0KTtcbiAgICAgICAgICAgICAgICBsb2NhbE1heERpc3RhbmNlID0gbWF4RGlzdGFuY2UgKiBkaXJlY3Rpb24ubGVuKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFRha2Ugd29ybGQgc3BhY2UgcmF5IGFuZCBtYWtlIGl0IG9iamVjdCBzcGFjZSB0byBhbGlnbiB3aXRoIGJvdW5kaW5nIGJveFxuICAgICAgICAgICAgb3JpZ2luLmNvcHkodGhpcy5vcmlnaW4pLmFwcGx5TWF0cml4NChpbnZXb3JsZE1hdDQpO1xuICAgICAgICAgICAgZGlyZWN0aW9uLmNvcHkodGhpcy5kaXJlY3Rpb24pLnRyYW5zZm9ybURpcmVjdGlvbihpbnZXb3JsZE1hdDQpO1xuXG4gICAgICAgICAgICBsZXQgbG9jYWxEaXN0YW5jZSA9IDA7XG4gICAgICAgICAgICBsZXQgY2xvc2VzdEEsIGNsb3Nlc3RCLCBjbG9zZXN0QztcblxuICAgICAgICAgICAgY29uc3QgZ2VvbWV0cnkgPSBtZXNoLmdlb21ldHJ5O1xuICAgICAgICAgICAgY29uc3QgYXR0cmlidXRlcyA9IGdlb21ldHJ5LmF0dHJpYnV0ZXM7XG4gICAgICAgICAgICBjb25zdCBpbmRleCA9IGF0dHJpYnV0ZXMuaW5kZXg7XG5cbiAgICAgICAgICAgIGNvbnN0IHN0YXJ0ID0gTWF0aC5tYXgoMCwgZ2VvbWV0cnkuZHJhd1JhbmdlLnN0YXJ0KTtcbiAgICAgICAgICAgIGNvbnN0IGVuZCA9IE1hdGgubWluKGluZGV4ID8gaW5kZXguY291bnQgOiBhdHRyaWJ1dGVzLnBvc2l0aW9uLmNvdW50LCBnZW9tZXRyeS5kcmF3UmFuZ2Uuc3RhcnQgKyBnZW9tZXRyeS5kcmF3UmFuZ2UuY291bnQpO1xuXG4gICAgICAgICAgICBmb3IgKGxldCBqID0gc3RhcnQ7IGogPCBlbmQ7IGogKz0gMykge1xuICAgICAgICAgICAgICAgIC8vIFBvc2l0aW9uIGF0dHJpYnV0ZSBpbmRpY2VzIGZvciBlYWNoIHRyaWFuZ2xlXG4gICAgICAgICAgICAgICAgY29uc3QgYWkgPSBpbmRleCA/IGluZGV4LmRhdGFbal0gOiBqO1xuICAgICAgICAgICAgICAgIGNvbnN0IGJpID0gaW5kZXggPyBpbmRleC5kYXRhW2ogKyAxXSA6IGogKyAxO1xuICAgICAgICAgICAgICAgIGNvbnN0IGNpID0gaW5kZXggPyBpbmRleC5kYXRhW2ogKyAyXSA6IGogKyAyO1xuXG4gICAgICAgICAgICAgICAgYS5mcm9tQXJyYXkoYXR0cmlidXRlcy5wb3NpdGlvbi5kYXRhLCBhaSAqIDMpO1xuICAgICAgICAgICAgICAgIGIuZnJvbUFycmF5KGF0dHJpYnV0ZXMucG9zaXRpb24uZGF0YSwgYmkgKiAzKTtcbiAgICAgICAgICAgICAgICBjLmZyb21BcnJheShhdHRyaWJ1dGVzLnBvc2l0aW9uLmRhdGEsIGNpICogMyk7XG5cbiAgICAgICAgICAgICAgICBjb25zdCBkaXN0YW5jZSA9IHRoaXMuaW50ZXJzZWN0VHJpYW5nbGUoYSwgYiwgYywgY3VsbEZhY2UsIG9yaWdpbiwgZGlyZWN0aW9uLCBmYWNlTm9ybWFsKTtcbiAgICAgICAgICAgICAgICBpZiAoIWRpc3RhbmNlKSBjb250aW51ZTtcblxuICAgICAgICAgICAgICAgIC8vIFRvbyBmYXIgYXdheVxuICAgICAgICAgICAgICAgIGlmIChtYXhEaXN0YW5jZSAmJiBkaXN0YW5jZSA+IGxvY2FsTWF4RGlzdGFuY2UpIGNvbnRpbnVlO1xuXG4gICAgICAgICAgICAgICAgaWYgKCFsb2NhbERpc3RhbmNlIHx8IGRpc3RhbmNlIDwgbG9jYWxEaXN0YW5jZSkge1xuICAgICAgICAgICAgICAgICAgICBsb2NhbERpc3RhbmNlID0gZGlzdGFuY2U7XG4gICAgICAgICAgICAgICAgICAgIGNsb3Nlc3RBID0gYWk7XG4gICAgICAgICAgICAgICAgICAgIGNsb3Nlc3RCID0gYmk7XG4gICAgICAgICAgICAgICAgICAgIGNsb3Nlc3RDID0gY2k7XG4gICAgICAgICAgICAgICAgICAgIGNsb3Nlc3RGYWNlTm9ybWFsLmNvcHkoZmFjZU5vcm1hbCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIWxvY2FsRGlzdGFuY2UpIGhpdHMuc3BsaWNlKGksIDEpO1xuXG4gICAgICAgICAgICAvLyBVcGRhdGUgaGl0IHZhbHVlcyBmcm9tIGJvdW5kcy10ZXN0XG4gICAgICAgICAgICBtZXNoLmhpdC5sb2NhbFBvaW50LmNvcHkoZGlyZWN0aW9uKS5tdWx0aXBseShsb2NhbERpc3RhbmNlKS5hZGQob3JpZ2luKTtcbiAgICAgICAgICAgIG1lc2guaGl0LnBvaW50LmNvcHkobWVzaC5oaXQubG9jYWxQb2ludCkuYXBwbHlNYXRyaXg0KG1lc2gud29ybGRNYXRyaXgpO1xuICAgICAgICAgICAgbWVzaC5oaXQuZGlzdGFuY2UgPSBtZXNoLmhpdC5wb2ludC5kaXN0YW5jZSh0aGlzLm9yaWdpbik7XG5cbiAgICAgICAgICAgIC8vIEFkZCB1bmlxdWUgaGl0IG9iamVjdHMgb24gbWVzaCB0byBhdm9pZCBnZW5lcmF0aW5nIGxvdHMgb2Ygb2JqZWN0c1xuICAgICAgICAgICAgaWYgKCFtZXNoLmhpdC5mYWNlTm9ybWFsKSB7XG4gICAgICAgICAgICAgICAgbWVzaC5oaXQubG9jYWxGYWNlTm9ybWFsID0gbmV3IFZlYzMoKTtcbiAgICAgICAgICAgICAgICBtZXNoLmhpdC5mYWNlTm9ybWFsID0gbmV3IFZlYzMoKTtcbiAgICAgICAgICAgICAgICBtZXNoLmhpdC51diA9IG5ldyBWZWMyKCk7XG4gICAgICAgICAgICAgICAgbWVzaC5oaXQubG9jYWxOb3JtYWwgPSBuZXcgVmVjMygpO1xuICAgICAgICAgICAgICAgIG1lc2guaGl0Lm5vcm1hbCA9IG5ldyBWZWMzKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIEFkZCBmYWNlIG5vcm1hbCBkYXRhIHdoaWNoIGlzIGFscmVhZHkgY29tcHV0ZWRcbiAgICAgICAgICAgIG1lc2guaGl0LmxvY2FsRmFjZU5vcm1hbC5jb3B5KGNsb3Nlc3RGYWNlTm9ybWFsKTtcbiAgICAgICAgICAgIG1lc2guaGl0LmZhY2VOb3JtYWwuY29weShtZXNoLmhpdC5sb2NhbEZhY2VOb3JtYWwpLnRyYW5zZm9ybURpcmVjdGlvbihtZXNoLndvcmxkTWF0cml4KTtcblxuICAgICAgICAgICAgLy8gT3B0aW9uYWwgZGF0YSwgb3B0IG91dCB0byBvcHRpbWlzZSBhIGJpdCBpZiBuZWNlc3NhcnlcbiAgICAgICAgICAgIGlmIChpbmNsdWRlVVYgfHwgaW5jbHVkZU5vcm1hbCkge1xuICAgICAgICAgICAgICAgIC8vIENhbGN1bGF0ZSBiYXJ5Y29vcmRzIHRvIGZpbmQgdXYgdmFsdWVzIGF0IGhpdCBwb2ludFxuICAgICAgICAgICAgICAgIGEuZnJvbUFycmF5KGF0dHJpYnV0ZXMucG9zaXRpb24uZGF0YSwgY2xvc2VzdEEgKiAzKTtcbiAgICAgICAgICAgICAgICBiLmZyb21BcnJheShhdHRyaWJ1dGVzLnBvc2l0aW9uLmRhdGEsIGNsb3Nlc3RCICogMyk7XG4gICAgICAgICAgICAgICAgYy5mcm9tQXJyYXkoYXR0cmlidXRlcy5wb3NpdGlvbi5kYXRhLCBjbG9zZXN0QyAqIDMpO1xuICAgICAgICAgICAgICAgIHRoaXMuZ2V0QmFyeWNvb3JkKG1lc2guaGl0LmxvY2FsUG9pbnQsIGEsIGIsIGMsIGJhcnljb29yZCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChpbmNsdWRlVVYgJiYgYXR0cmlidXRlcy51dikge1xuICAgICAgICAgICAgICAgIHV2QS5mcm9tQXJyYXkoYXR0cmlidXRlcy51di5kYXRhLCBjbG9zZXN0QSAqIDIpO1xuICAgICAgICAgICAgICAgIHV2Qi5mcm9tQXJyYXkoYXR0cmlidXRlcy51di5kYXRhLCBjbG9zZXN0QiAqIDIpO1xuICAgICAgICAgICAgICAgIHV2Qy5mcm9tQXJyYXkoYXR0cmlidXRlcy51di5kYXRhLCBjbG9zZXN0QyAqIDIpO1xuICAgICAgICAgICAgICAgIG1lc2guaGl0LnV2LnNldChcbiAgICAgICAgICAgICAgICAgICAgdXZBLnggKiBiYXJ5Y29vcmQueCArIHV2Qi54ICogYmFyeWNvb3JkLnkgKyB1dkMueCAqIGJhcnljb29yZC56LFxuICAgICAgICAgICAgICAgICAgICB1dkEueSAqIGJhcnljb29yZC54ICsgdXZCLnkgKiBiYXJ5Y29vcmQueSArIHV2Qy55ICogYmFyeWNvb3JkLnpcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoaW5jbHVkZU5vcm1hbCAmJiBhdHRyaWJ1dGVzLm5vcm1hbCkge1xuICAgICAgICAgICAgICAgIGEuZnJvbUFycmF5KGF0dHJpYnV0ZXMubm9ybWFsLmRhdGEsIGNsb3Nlc3RBICogMyk7XG4gICAgICAgICAgICAgICAgYi5mcm9tQXJyYXkoYXR0cmlidXRlcy5ub3JtYWwuZGF0YSwgY2xvc2VzdEIgKiAzKTtcbiAgICAgICAgICAgICAgICBjLmZyb21BcnJheShhdHRyaWJ1dGVzLm5vcm1hbC5kYXRhLCBjbG9zZXN0QyAqIDMpO1xuICAgICAgICAgICAgICAgIG1lc2guaGl0LmxvY2FsTm9ybWFsLnNldChcbiAgICAgICAgICAgICAgICAgICAgYS54ICogYmFyeWNvb3JkLnggKyBiLnggKiBiYXJ5Y29vcmQueSArIGMueCAqIGJhcnljb29yZC56LFxuICAgICAgICAgICAgICAgICAgICBhLnkgKiBiYXJ5Y29vcmQueCArIGIueSAqIGJhcnljb29yZC55ICsgYy55ICogYmFyeWNvb3JkLnosXG4gICAgICAgICAgICAgICAgICAgIGEueiAqIGJhcnljb29yZC54ICsgYi56ICogYmFyeWNvb3JkLnkgKyBjLnogKiBiYXJ5Y29vcmQuelxuICAgICAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgICAgICBtZXNoLmhpdC5ub3JtYWwuY29weShtZXNoLmhpdC5sb2NhbE5vcm1hbCkudHJhbnNmb3JtRGlyZWN0aW9uKG1lc2gud29ybGRNYXRyaXgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaGl0cy5zb3J0KChhLCBiKSA9PiBhLmhpdC5kaXN0YW5jZSAtIGIuaGl0LmRpc3RhbmNlKTtcbiAgICAgICAgcmV0dXJuIGhpdHM7XG4gICAgfVxuXG4gICAgaW50ZXJzZWN0U3BoZXJlKHNwaGVyZSwgb3JpZ2luID0gdGhpcy5vcmlnaW4sIGRpcmVjdGlvbiA9IHRoaXMuZGlyZWN0aW9uKSB7XG4gICAgICAgIGNvbnN0IHJheSA9IHRlbXBWZWMzYztcbiAgICAgICAgcmF5LnN1YihzcGhlcmUuY2VudGVyLCBvcmlnaW4pO1xuICAgICAgICBjb25zdCB0Y2EgPSByYXkuZG90KGRpcmVjdGlvbik7XG4gICAgICAgIGNvbnN0IGQyID0gcmF5LmRvdChyYXkpIC0gdGNhICogdGNhO1xuICAgICAgICBjb25zdCByYWRpdXMyID0gc3BoZXJlLnJhZGl1cyAqIHNwaGVyZS5yYWRpdXM7XG4gICAgICAgIGlmIChkMiA+IHJhZGl1czIpIHJldHVybiAwO1xuICAgICAgICBjb25zdCB0aGMgPSBNYXRoLnNxcnQocmFkaXVzMiAtIGQyKTtcbiAgICAgICAgY29uc3QgdDAgPSB0Y2EgLSB0aGM7XG4gICAgICAgIGNvbnN0IHQxID0gdGNhICsgdGhjO1xuICAgICAgICBpZiAodDAgPCAwICYmIHQxIDwgMCkgcmV0dXJuIDA7XG4gICAgICAgIGlmICh0MCA8IDApIHJldHVybiB0MTtcbiAgICAgICAgcmV0dXJuIHQwO1xuICAgIH1cblxuICAgIC8vIFJheSBBQUJCIC0gUmF5IEF4aXMgYWxpZ25lZCBib3VuZGluZyBib3ggdGVzdGluZ1xuICAgIGludGVyc2VjdEJveChib3gsIG9yaWdpbiA9IHRoaXMub3JpZ2luLCBkaXJlY3Rpb24gPSB0aGlzLmRpcmVjdGlvbikge1xuICAgICAgICBsZXQgdG1pbiwgdG1heCwgdFltaW4sIHRZbWF4LCB0Wm1pbiwgdFptYXg7XG4gICAgICAgIGNvbnN0IGludmRpcnggPSAxIC8gZGlyZWN0aW9uLng7XG4gICAgICAgIGNvbnN0IGludmRpcnkgPSAxIC8gZGlyZWN0aW9uLnk7XG4gICAgICAgIGNvbnN0IGludmRpcnogPSAxIC8gZGlyZWN0aW9uLno7XG4gICAgICAgIGNvbnN0IG1pbiA9IGJveC5taW47XG4gICAgICAgIGNvbnN0IG1heCA9IGJveC5tYXg7XG4gICAgICAgIHRtaW4gPSAoKGludmRpcnggPj0gMCA/IG1pbi54IDogbWF4LngpIC0gb3JpZ2luLngpICogaW52ZGlyeDtcbiAgICAgICAgdG1heCA9ICgoaW52ZGlyeCA+PSAwID8gbWF4LnggOiBtaW4ueCkgLSBvcmlnaW4ueCkgKiBpbnZkaXJ4O1xuICAgICAgICB0WW1pbiA9ICgoaW52ZGlyeSA+PSAwID8gbWluLnkgOiBtYXgueSkgLSBvcmlnaW4ueSkgKiBpbnZkaXJ5O1xuICAgICAgICB0WW1heCA9ICgoaW52ZGlyeSA+PSAwID8gbWF4LnkgOiBtaW4ueSkgLSBvcmlnaW4ueSkgKiBpbnZkaXJ5O1xuICAgICAgICBpZiAodG1pbiA+IHRZbWF4IHx8IHRZbWluID4gdG1heCkgcmV0dXJuIDA7XG4gICAgICAgIGlmICh0WW1pbiA+IHRtaW4pIHRtaW4gPSB0WW1pbjtcbiAgICAgICAgaWYgKHRZbWF4IDwgdG1heCkgdG1heCA9IHRZbWF4O1xuICAgICAgICB0Wm1pbiA9ICgoaW52ZGlyeiA+PSAwID8gbWluLnogOiBtYXgueikgLSBvcmlnaW4ueikgKiBpbnZkaXJ6O1xuICAgICAgICB0Wm1heCA9ICgoaW52ZGlyeiA+PSAwID8gbWF4LnogOiBtaW4ueikgLSBvcmlnaW4ueikgKiBpbnZkaXJ6O1xuICAgICAgICBpZiAodG1pbiA+IHRabWF4IHx8IHRabWluID4gdG1heCkgcmV0dXJuIDA7XG4gICAgICAgIGlmICh0Wm1pbiA+IHRtaW4pIHRtaW4gPSB0Wm1pbjtcbiAgICAgICAgaWYgKHRabWF4IDwgdG1heCkgdG1heCA9IHRabWF4O1xuICAgICAgICBpZiAodG1heCA8IDApIHJldHVybiAwO1xuICAgICAgICByZXR1cm4gdG1pbiA+PSAwID8gdG1pbiA6IHRtYXg7XG4gICAgfVxuXG4gICAgaW50ZXJzZWN0VHJpYW5nbGUoYSwgYiwgYywgYmFja2ZhY2VDdWxsaW5nID0gdHJ1ZSwgb3JpZ2luID0gdGhpcy5vcmlnaW4sIGRpcmVjdGlvbiA9IHRoaXMuZGlyZWN0aW9uLCBub3JtYWwgPSB0ZW1wVmVjM2cpIHtcbiAgICAgICAgLy8gZnJvbSBodHRwczovL2dpdGh1Yi5jb20vbXJkb29iL3RocmVlLmpzL2Jsb2IvbWFzdGVyL3NyYy9tYXRoL1JheS5qc1xuICAgICAgICAvLyB3aGljaCBpcyBmcm9tIGh0dHA6Ly93d3cuZ2VvbWV0cmljdG9vbHMuY29tL0dURW5naW5lL0luY2x1ZGUvTWF0aGVtYXRpY3MvR3RlSW50clJheTNUcmlhbmdsZTMuaFxuICAgICAgICBjb25zdCBlZGdlMSA9IHRlbXBWZWMzaDtcbiAgICAgICAgY29uc3QgZWRnZTIgPSB0ZW1wVmVjM2k7XG4gICAgICAgIGNvbnN0IGRpZmYgPSB0ZW1wVmVjM2o7XG4gICAgICAgIGVkZ2UxLnN1YihiLCBhKTtcbiAgICAgICAgZWRnZTIuc3ViKGMsIGEpO1xuICAgICAgICBub3JtYWwuY3Jvc3MoZWRnZTEsIGVkZ2UyKTtcbiAgICAgICAgbGV0IERkTiA9IGRpcmVjdGlvbi5kb3Qobm9ybWFsKTtcbiAgICAgICAgaWYgKCFEZE4pIHJldHVybiAwO1xuICAgICAgICBsZXQgc2lnbjtcbiAgICAgICAgaWYgKERkTiA+IDApIHtcbiAgICAgICAgICAgIGlmIChiYWNrZmFjZUN1bGxpbmcpIHJldHVybiAwO1xuICAgICAgICAgICAgc2lnbiA9IDE7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzaWduID0gLTE7XG4gICAgICAgICAgICBEZE4gPSAtRGROO1xuICAgICAgICB9XG4gICAgICAgIGRpZmYuc3ViKG9yaWdpbiwgYSk7XG4gICAgICAgIGxldCBEZFF4RTIgPSBzaWduICogZGlyZWN0aW9uLmRvdChlZGdlMi5jcm9zcyhkaWZmLCBlZGdlMikpO1xuICAgICAgICBpZiAoRGRReEUyIDwgMCkgcmV0dXJuIDA7XG4gICAgICAgIGxldCBEZEUxeFEgPSBzaWduICogZGlyZWN0aW9uLmRvdChlZGdlMS5jcm9zcyhkaWZmKSk7XG4gICAgICAgIGlmIChEZEUxeFEgPCAwKSByZXR1cm4gMDtcbiAgICAgICAgaWYgKERkUXhFMiArIERkRTF4USA+IERkTikgcmV0dXJuIDA7XG4gICAgICAgIGxldCBRZE4gPSAtc2lnbiAqIGRpZmYuZG90KG5vcm1hbCk7XG4gICAgICAgIGlmIChRZE4gPCAwKSByZXR1cm4gMDtcbiAgICAgICAgcmV0dXJuIFFkTiAvIERkTjtcbiAgICB9XG5cbiAgICBnZXRCYXJ5Y29vcmQocG9pbnQsIGEsIGIsIGMsIHRhcmdldCA9IHRlbXBWZWMzaCkge1xuICAgICAgICAvLyBGcm9tIGh0dHBzOi8vZ2l0aHViLmNvbS9tcmRvb2IvdGhyZWUuanMvYmxvYi9tYXN0ZXIvc3JjL21hdGgvVHJpYW5nbGUuanNcbiAgICAgICAgLy8gc3RhdGljL2luc3RhbmNlIG1ldGhvZCB0byBjYWxjdWxhdGUgYmFyeWNlbnRyaWMgY29vcmRpbmF0ZXNcbiAgICAgICAgLy8gYmFzZWQgb246IGh0dHA6Ly93d3cuYmxhY2twYXduLmNvbS90ZXh0cy9wb2ludGlucG9seS9kZWZhdWx0Lmh0bWxcbiAgICAgICAgY29uc3QgdjAgPSB0ZW1wVmVjM2k7XG4gICAgICAgIGNvbnN0IHYxID0gdGVtcFZlYzNqO1xuICAgICAgICBjb25zdCB2MiA9IHRlbXBWZWMzaztcbiAgICAgICAgdjAuc3ViKGMsIGEpO1xuICAgICAgICB2MS5zdWIoYiwgYSk7XG4gICAgICAgIHYyLnN1Yihwb2ludCwgYSk7XG4gICAgICAgIGNvbnN0IGRvdDAwID0gdjAuZG90KHYwKTtcbiAgICAgICAgY29uc3QgZG90MDEgPSB2MC5kb3QodjEpO1xuICAgICAgICBjb25zdCBkb3QwMiA9IHYwLmRvdCh2Mik7XG4gICAgICAgIGNvbnN0IGRvdDExID0gdjEuZG90KHYxKTtcbiAgICAgICAgY29uc3QgZG90MTIgPSB2MS5kb3QodjIpO1xuICAgICAgICBjb25zdCBkZW5vbSA9IGRvdDAwICogZG90MTEgLSBkb3QwMSAqIGRvdDAxO1xuICAgICAgICBpZiAoZGVub20gPT09IDApIHJldHVybiB0YXJnZXQuc2V0KC0yLCAtMSwgLTEpO1xuICAgICAgICBjb25zdCBpbnZEZW5vbSA9IDEgLyBkZW5vbTtcbiAgICAgICAgY29uc3QgdSA9IChkb3QxMSAqIGRvdDAyIC0gZG90MDEgKiBkb3QxMikgKiBpbnZEZW5vbTtcbiAgICAgICAgY29uc3QgdiA9IChkb3QwMCAqIGRvdDEyIC0gZG90MDEgKiBkb3QwMikgKiBpbnZEZW5vbTtcbiAgICAgICAgcmV0dXJuIHRhcmdldC5zZXQoMSAtIHUgLSB2LCB2LCB1KTtcbiAgICB9XG59XG4iLCJpbXBvcnQgeyBDYW1lcmEgfSBmcm9tICcuLi9jb3JlL0NhbWVyYS5qcyc7XG5pbXBvcnQgeyBQcm9ncmFtIH0gZnJvbSAnLi4vY29yZS9Qcm9ncmFtLmpzJztcbmltcG9ydCB7IFJlbmRlclRhcmdldCB9IGZyb20gJy4uL2NvcmUvUmVuZGVyVGFyZ2V0LmpzJztcblxuZXhwb3J0IGNsYXNzIFNoYWRvdyB7XG4gICAgY29uc3RydWN0b3IoZ2wsIHsgbGlnaHQgPSBuZXcgQ2FtZXJhKGdsKSwgd2lkdGggPSAxMDI0LCBoZWlnaHQgPSB3aWR0aCB9KSB7XG4gICAgICAgIHRoaXMuZ2wgPSBnbDtcblxuICAgICAgICB0aGlzLmxpZ2h0ID0gbGlnaHQ7XG5cbiAgICAgICAgdGhpcy50YXJnZXQgPSBuZXcgUmVuZGVyVGFyZ2V0KGdsLCB7IHdpZHRoLCBoZWlnaHQgfSk7XG5cbiAgICAgICAgdGhpcy5kZXB0aFByb2dyYW0gPSBuZXcgUHJvZ3JhbShnbCwge1xuICAgICAgICAgICAgdmVydGV4OiBkZWZhdWx0VmVydGV4LFxuICAgICAgICAgICAgZnJhZ21lbnQ6IGRlZmF1bHRGcmFnbWVudCxcbiAgICAgICAgICAgIGN1bGxGYWNlOiBudWxsLFxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLmNhc3RNZXNoZXMgPSBbXTtcbiAgICB9XG5cbiAgICBhZGQoe1xuICAgICAgICBtZXNoLFxuICAgICAgICByZWNlaXZlID0gdHJ1ZSxcbiAgICAgICAgY2FzdCA9IHRydWUsXG4gICAgICAgIHZlcnRleCA9IGRlZmF1bHRWZXJ0ZXgsXG4gICAgICAgIGZyYWdtZW50ID0gZGVmYXVsdEZyYWdtZW50LFxuICAgICAgICB1bmlmb3JtUHJvamVjdGlvbiA9ICdzaGFkb3dQcm9qZWN0aW9uTWF0cml4JyxcbiAgICAgICAgdW5pZm9ybVZpZXcgPSAnc2hhZG93Vmlld01hdHJpeCcsXG4gICAgICAgIHVuaWZvcm1UZXh0dXJlID0gJ3RTaGFkb3cnLFxuICAgIH0pIHtcbiAgICAgICAgLy8gQWRkIHVuaWZvcm1zIHRvIGV4aXN0aW5nIHByb2dyYW1cbiAgICAgICAgaWYgKHJlY2VpdmUgJiYgIW1lc2gucHJvZ3JhbS51bmlmb3Jtc1t1bmlmb3JtUHJvamVjdGlvbl0pIHtcbiAgICAgICAgICAgIG1lc2gucHJvZ3JhbS51bmlmb3Jtc1t1bmlmb3JtUHJvamVjdGlvbl0gPSB7IHZhbHVlOiB0aGlzLmxpZ2h0LnByb2plY3Rpb25NYXRyaXggfTtcbiAgICAgICAgICAgIG1lc2gucHJvZ3JhbS51bmlmb3Jtc1t1bmlmb3JtVmlld10gPSB7IHZhbHVlOiB0aGlzLmxpZ2h0LnZpZXdNYXRyaXggfTtcbiAgICAgICAgICAgIG1lc2gucHJvZ3JhbS51bmlmb3Jtc1t1bmlmb3JtVGV4dHVyZV0gPSB7IHZhbHVlOiB0aGlzLnRhcmdldC50ZXh0dXJlIH07XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIWNhc3QpIHJldHVybjtcbiAgICAgICAgdGhpcy5jYXN0TWVzaGVzLnB1c2gobWVzaCk7XG5cbiAgICAgICAgLy8gU3RvcmUgcHJvZ3JhbSBmb3Igd2hlbiBzd2l0Y2hpbmcgYmV0d2VlbiBkZXB0aCBvdmVycmlkZVxuICAgICAgICBtZXNoLmNvbG9yUHJvZ3JhbSA9IG1lc2gucHJvZ3JhbTtcblxuICAgICAgICAvLyBDaGVjayBpZiBkZXB0aCBwcm9ncmFtIGFscmVhZHkgYXR0YWNoZWRcbiAgICAgICAgaWYgKG1lc2guZGVwdGhQcm9ncmFtKSByZXR1cm47XG5cbiAgICAgICAgLy8gVXNlIGdsb2JhbCBkZXB0aCBvdmVycmlkZSBpZiBub3RoaW5nIGN1c3RvbSBwYXNzZWQgaW5cbiAgICAgICAgaWYgKHZlcnRleCA9PT0gZGVmYXVsdFZlcnRleCAmJiBmcmFnbWVudCA9PT0gZGVmYXVsdEZyYWdtZW50KSB7XG4gICAgICAgICAgICBtZXNoLmRlcHRoUHJvZ3JhbSA9IHRoaXMuZGVwdGhQcm9ncmFtO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ3JlYXRlIGN1c3RvbSBvdmVycmlkZSBwcm9ncmFtXG4gICAgICAgIG1lc2guZGVwdGhQcm9ncmFtID0gbmV3IFByb2dyYW0odGhpcy5nbCwge1xuICAgICAgICAgICAgdmVydGV4LFxuICAgICAgICAgICAgZnJhZ21lbnQsXG4gICAgICAgICAgICBjdWxsRmFjZTogbnVsbCxcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmVuZGVyKHsgc2NlbmUgfSkge1xuICAgICAgICAvLyBGb3IgZGVwdGggcmVuZGVyLCByZXBsYWNlIHByb2dyYW0gd2l0aCBkZXB0aCBvdmVycmlkZS5cbiAgICAgICAgLy8gSGlkZSBtZXNoZXMgbm90IGNhc3Rpbmcgc2hhZG93cy5cbiAgICAgICAgc2NlbmUudHJhdmVyc2UoKG5vZGUpID0+IHtcbiAgICAgICAgICAgIGlmICghbm9kZS5kcmF3KSByZXR1cm47XG4gICAgICAgICAgICBpZiAoISF+dGhpcy5jYXN0TWVzaGVzLmluZGV4T2Yobm9kZSkpIHtcbiAgICAgICAgICAgICAgICBub2RlLnByb2dyYW0gPSBub2RlLmRlcHRoUHJvZ3JhbTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbm9kZS5pc0ZvcmNlVmlzaWJpbGl0eSA9IG5vZGUudmlzaWJsZTtcbiAgICAgICAgICAgICAgICBub2RlLnZpc2libGUgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gUmVuZGVyIHRoZSBkZXB0aCBzaGFkb3cgbWFwIHVzaW5nIHRoZSBsaWdodCBhcyB0aGUgY2FtZXJhXG4gICAgICAgIHRoaXMuZ2wucmVuZGVyZXIucmVuZGVyKHtcbiAgICAgICAgICAgIHNjZW5lLFxuICAgICAgICAgICAgY2FtZXJhOiB0aGlzLmxpZ2h0LFxuICAgICAgICAgICAgdGFyZ2V0OiB0aGlzLnRhcmdldCxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gVGhlbiBzd2l0Y2ggdGhlIHByb2dyYW0gYmFjayB0byB0aGUgbm9ybWFsIG9uZVxuICAgICAgICBzY2VuZS50cmF2ZXJzZSgobm9kZSkgPT4ge1xuICAgICAgICAgICAgaWYgKCFub2RlLmRyYXcpIHJldHVybjtcbiAgICAgICAgICAgIGlmICghIX50aGlzLmNhc3RNZXNoZXMuaW5kZXhPZihub2RlKSkge1xuICAgICAgICAgICAgICAgIG5vZGUucHJvZ3JhbSA9IG5vZGUuY29sb3JQcm9ncmFtO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBub2RlLnZpc2libGUgPSBub2RlLmlzRm9yY2VWaXNpYmlsaXR5O1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG59XG5cbmNvbnN0IGRlZmF1bHRWZXJ0ZXggPSAvKiBnbHNsICovIGBcbiAgICBhdHRyaWJ1dGUgdmVjMyBwb3NpdGlvbjtcbiAgICBhdHRyaWJ1dGUgdmVjMiB1djtcblxuICAgIHVuaWZvcm0gbWF0NCBtb2RlbFZpZXdNYXRyaXg7XG4gICAgdW5pZm9ybSBtYXQ0IHByb2plY3Rpb25NYXRyaXg7XG5cbiAgICB2b2lkIG1haW4oKSB7XG4gICAgICAgIGdsX1Bvc2l0aW9uID0gcHJvamVjdGlvbk1hdHJpeCAqIG1vZGVsVmlld01hdHJpeCAqIHZlYzQocG9zaXRpb24sIDEuMCk7XG4gICAgfVxuYDtcblxuY29uc3QgZGVmYXVsdEZyYWdtZW50ID0gLyogZ2xzbCAqLyBgXG4gICAgcHJlY2lzaW9uIGhpZ2hwIGZsb2F0O1xuXG4gICAgdmVjNCBwYWNrUkdCQSAoZmxvYXQgdikge1xuICAgICAgICB2ZWM0IHBhY2sgPSBmcmFjdCh2ZWM0KDEuMCwgMjU1LjAsIDY1MDI1LjAsIDE2NTgxMzc1LjApICogdik7XG4gICAgICAgIHBhY2sgLT0gcGFjay55end3ICogdmVjMigxLjAgLyAyNTUuMCwgMC4wKS54eHh5O1xuICAgICAgICByZXR1cm4gcGFjaztcbiAgICB9XG5cbiAgICB2b2lkIG1haW4oKSB7XG4gICAgICAgIGdsX0ZyYWdDb2xvciA9IHBhY2tSR0JBKGdsX0ZyYWdDb29yZC56KTtcbiAgICB9XG5gO1xuIiwiaW1wb3J0IHsgTWVzaCB9IGZyb20gJy4uL2NvcmUvTWVzaC5qcyc7XG5pbXBvcnQgeyBUcmFuc2Zvcm0gfSBmcm9tICcuLi9jb3JlL1RyYW5zZm9ybS5qcyc7XG5pbXBvcnQgeyBNYXQ0IH0gZnJvbSAnLi4vbWF0aC9NYXQ0LmpzJztcbmltcG9ydCB7IFRleHR1cmUgfSBmcm9tICcuLi9jb3JlL1RleHR1cmUuanMnO1xuaW1wb3J0IHsgQW5pbWF0aW9uIH0gZnJvbSAnLi9BbmltYXRpb24uanMnO1xuXG5jb25zdCB0ZW1wTWF0NCA9IG5ldyBNYXQ0KCk7XG5cbmV4cG9ydCBjbGFzcyBTa2luIGV4dGVuZHMgTWVzaCB7XG4gICAgY29uc3RydWN0b3IoZ2wsIHsgcmlnLCBnZW9tZXRyeSwgcHJvZ3JhbSwgbW9kZSA9IGdsLlRSSUFOR0xFUyB9ID0ge30pIHtcbiAgICAgICAgc3VwZXIoZ2wsIHsgZ2VvbWV0cnksIHByb2dyYW0sIG1vZGUgfSk7XG5cbiAgICAgICAgdGhpcy5jcmVhdGVCb25lcyhyaWcpO1xuICAgICAgICB0aGlzLmNyZWF0ZUJvbmVUZXh0dXJlKCk7XG4gICAgICAgIHRoaXMuYW5pbWF0aW9ucyA9IFtdO1xuXG4gICAgICAgIE9iamVjdC5hc3NpZ24odGhpcy5wcm9ncmFtLnVuaWZvcm1zLCB7XG4gICAgICAgICAgICBib25lVGV4dHVyZTogeyB2YWx1ZTogdGhpcy5ib25lVGV4dHVyZSB9LFxuICAgICAgICAgICAgYm9uZVRleHR1cmVTaXplOiB7IHZhbHVlOiB0aGlzLmJvbmVUZXh0dXJlU2l6ZSB9LFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBjcmVhdGVCb25lcyhyaWcpIHtcbiAgICAgICAgLy8gQ3JlYXRlIHJvb3Qgc28gdGhhdCBjYW4gc2ltcGx5IHVwZGF0ZSB3b3JsZCBtYXRyaXggb2Ygd2hvbGUgc2tlbGV0b25cbiAgICAgICAgdGhpcy5yb290ID0gbmV3IFRyYW5zZm9ybSgpO1xuXG4gICAgICAgIC8vIENyZWF0ZSBib25lc1xuICAgICAgICB0aGlzLmJvbmVzID0gW107XG4gICAgICAgIGlmICghcmlnLmJvbmVzIHx8ICFyaWcuYm9uZXMubGVuZ3RoKSByZXR1cm47XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcmlnLmJvbmVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBib25lID0gbmV3IFRyYW5zZm9ybSgpO1xuXG4gICAgICAgICAgICAvLyBTZXQgaW5pdGlhbCB2YWx1ZXMgKGJpbmQgcG9zZSlcbiAgICAgICAgICAgIGJvbmUucG9zaXRpb24uZnJvbUFycmF5KHJpZy5iaW5kUG9zZS5wb3NpdGlvbiwgaSAqIDMpO1xuICAgICAgICAgICAgYm9uZS5xdWF0ZXJuaW9uLmZyb21BcnJheShyaWcuYmluZFBvc2UucXVhdGVybmlvbiwgaSAqIDQpO1xuICAgICAgICAgICAgYm9uZS5zY2FsZS5mcm9tQXJyYXkocmlnLmJpbmRQb3NlLnNjYWxlLCBpICogMyk7XG5cbiAgICAgICAgICAgIHRoaXMuYm9uZXMucHVzaChib25lKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIE9uY2UgY3JlYXRlZCwgc2V0IHRoZSBoaWVyYXJjaHlcbiAgICAgICAgcmlnLmJvbmVzLmZvckVhY2goKGRhdGEsIGkpID0+IHtcbiAgICAgICAgICAgIHRoaXMuYm9uZXNbaV0ubmFtZSA9IGRhdGEubmFtZTtcbiAgICAgICAgICAgIGlmIChkYXRhLnBhcmVudCA9PT0gLTEpIHJldHVybiB0aGlzLmJvbmVzW2ldLnNldFBhcmVudCh0aGlzLnJvb3QpO1xuICAgICAgICAgICAgdGhpcy5ib25lc1tpXS5zZXRQYXJlbnQodGhpcy5ib25lc1tkYXRhLnBhcmVudF0pO1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyBUaGVuIHVwZGF0ZSB0byBjYWxjdWxhdGUgd29ybGQgbWF0cmljZXNcbiAgICAgICAgdGhpcy5yb290LnVwZGF0ZU1hdHJpeFdvcmxkKHRydWUpO1xuXG4gICAgICAgIC8vIFN0b3JlIGludmVyc2Ugb2YgYmluZCBwb3NlIHRvIGNhbGN1bGF0ZSBkaWZmZXJlbmNlc1xuICAgICAgICB0aGlzLmJvbmVzLmZvckVhY2goKGJvbmUpID0+IHtcbiAgICAgICAgICAgIGJvbmUuYmluZEludmVyc2UgPSBuZXcgTWF0NCguLi5ib25lLndvcmxkTWF0cml4KS5pbnZlcnNlKCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGNyZWF0ZUJvbmVUZXh0dXJlKCkge1xuICAgICAgICBpZiAoIXRoaXMuYm9uZXMubGVuZ3RoKSByZXR1cm47XG4gICAgICAgIGNvbnN0IHNpemUgPSBNYXRoLm1heCg0LCBNYXRoLnBvdygyLCBNYXRoLmNlaWwoTWF0aC5sb2coTWF0aC5zcXJ0KHRoaXMuYm9uZXMubGVuZ3RoICogNCkpIC8gTWF0aC5MTjIpKSk7XG4gICAgICAgIHRoaXMuYm9uZU1hdHJpY2VzID0gbmV3IEZsb2F0MzJBcnJheShzaXplICogc2l6ZSAqIDQpO1xuICAgICAgICB0aGlzLmJvbmVUZXh0dXJlU2l6ZSA9IHNpemU7XG4gICAgICAgIHRoaXMuYm9uZVRleHR1cmUgPSBuZXcgVGV4dHVyZSh0aGlzLmdsLCB7XG4gICAgICAgICAgICBpbWFnZTogdGhpcy5ib25lTWF0cmljZXMsXG4gICAgICAgICAgICBnZW5lcmF0ZU1pcG1hcHM6IGZhbHNlLFxuICAgICAgICAgICAgdHlwZTogdGhpcy5nbC5GTE9BVCxcbiAgICAgICAgICAgIGludGVybmFsRm9ybWF0OiB0aGlzLmdsLnJlbmRlcmVyLmlzV2ViZ2wyID8gdGhpcy5nbC5SR0JBMzJGIDogdGhpcy5nbC5SR0JBLFxuICAgICAgICAgICAgbWluRmlsdGVyOiB0aGlzLmdsLk5FQVJFU1QsXG4gICAgICAgICAgICBtYWdGaWx0ZXI6IHRoaXMuZ2wuTkVBUkVTVCxcbiAgICAgICAgICAgIGZsaXBZOiBmYWxzZSxcbiAgICAgICAgICAgIHdpZHRoOiBzaXplLFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBhZGRBbmltYXRpb24oZGF0YSkge1xuICAgICAgICBjb25zdCBhbmltYXRpb24gPSBuZXcgQW5pbWF0aW9uKHsgb2JqZWN0czogdGhpcy5ib25lcywgZGF0YSB9KTtcbiAgICAgICAgdGhpcy5hbmltYXRpb25zLnB1c2goYW5pbWF0aW9uKTtcbiAgICAgICAgcmV0dXJuIGFuaW1hdGlvbjtcbiAgICB9XG5cbiAgICB1cGRhdGUoKSB7XG4gICAgICAgIC8vIENhbGN1bGF0ZSBjb21iaW5lZCBhbmltYXRpb24gd2VpZ2h0XG4gICAgICAgIGxldCB0b3RhbCA9IDA7XG4gICAgICAgIHRoaXMuYW5pbWF0aW9ucy5mb3JFYWNoKChhbmltYXRpb24pID0+ICh0b3RhbCArPSBhbmltYXRpb24ud2VpZ2h0KSk7XG5cbiAgICAgICAgdGhpcy5hbmltYXRpb25zLmZvckVhY2goKGFuaW1hdGlvbiwgaSkgPT4ge1xuICAgICAgICAgICAgLy8gZm9yY2UgZmlyc3QgYW5pbWF0aW9uIHRvIHNldCBpbiBvcmRlciB0byByZXNldCBmcmFtZVxuICAgICAgICAgICAgYW5pbWF0aW9uLnVwZGF0ZSh0b3RhbCwgaSA9PT0gMCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGRyYXcoeyBjYW1lcmEgfSA9IHt9KSB7XG4gICAgICAgIC8vIFVwZGF0ZSB3b3JsZCBtYXRyaWNlcyBtYW51YWxseSwgYXMgbm90IHBhcnQgb2Ygc2NlbmUgZ3JhcGhcbiAgICAgICAgdGhpcy5yb290LnVwZGF0ZU1hdHJpeFdvcmxkKHRydWUpO1xuXG4gICAgICAgIC8vIFVwZGF0ZSBib25lIHRleHR1cmVcbiAgICAgICAgdGhpcy5ib25lcy5mb3JFYWNoKChib25lLCBpKSA9PiB7XG4gICAgICAgICAgICAvLyBGaW5kIGRpZmZlcmVuY2UgYmV0d2VlbiBjdXJyZW50IGFuZCBiaW5kIHBvc2VcbiAgICAgICAgICAgIHRlbXBNYXQ0Lm11bHRpcGx5KGJvbmUud29ybGRNYXRyaXgsIGJvbmUuYmluZEludmVyc2UpO1xuICAgICAgICAgICAgdGhpcy5ib25lTWF0cmljZXMuc2V0KHRlbXBNYXQ0LCBpICogMTYpO1xuICAgICAgICB9KTtcbiAgICAgICAgaWYgKHRoaXMuYm9uZVRleHR1cmUpIHRoaXMuYm9uZVRleHR1cmUubmVlZHNVcGRhdGUgPSB0cnVlO1xuXG4gICAgICAgIHN1cGVyLmRyYXcoeyBjYW1lcmEgfSk7XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgR2VvbWV0cnkgfSBmcm9tICcuLi9jb3JlL0dlb21ldHJ5LmpzJztcbmltcG9ydCB7IFZlYzMgfSBmcm9tICcuLi9tYXRoL1ZlYzMuanMnO1xuXG5leHBvcnQgY2xhc3MgU3BoZXJlIGV4dGVuZHMgR2VvbWV0cnkge1xuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICBnbCxcbiAgICAgICAge1xuICAgICAgICAgICAgcmFkaXVzID0gMC41LFxuICAgICAgICAgICAgd2lkdGhTZWdtZW50cyA9IDE2LFxuICAgICAgICAgICAgaGVpZ2h0U2VnbWVudHMgPSBNYXRoLmNlaWwod2lkdGhTZWdtZW50cyAqIDAuNSksXG4gICAgICAgICAgICBwaGlTdGFydCA9IDAsXG4gICAgICAgICAgICBwaGlMZW5ndGggPSBNYXRoLlBJICogMixcbiAgICAgICAgICAgIHRoZXRhU3RhcnQgPSAwLFxuICAgICAgICAgICAgdGhldGFMZW5ndGggPSBNYXRoLlBJLFxuICAgICAgICAgICAgYXR0cmlidXRlcyA9IHt9LFxuICAgICAgICB9ID0ge31cbiAgICApIHtcbiAgICAgICAgY29uc3Qgd1NlZ3MgPSB3aWR0aFNlZ21lbnRzO1xuICAgICAgICBjb25zdCBoU2VncyA9IGhlaWdodFNlZ21lbnRzO1xuICAgICAgICBjb25zdCBwU3RhcnQgPSBwaGlTdGFydDtcbiAgICAgICAgY29uc3QgcExlbmd0aCA9IHBoaUxlbmd0aDtcbiAgICAgICAgY29uc3QgdFN0YXJ0ID0gdGhldGFTdGFydDtcbiAgICAgICAgY29uc3QgdExlbmd0aCA9IHRoZXRhTGVuZ3RoO1xuXG4gICAgICAgIGNvbnN0IG51bSA9ICh3U2VncyArIDEpICogKGhTZWdzICsgMSk7XG4gICAgICAgIGNvbnN0IG51bUluZGljZXMgPSB3U2VncyAqIGhTZWdzICogNjtcblxuICAgICAgICBjb25zdCBwb3NpdGlvbiA9IG5ldyBGbG9hdDMyQXJyYXkobnVtICogMyk7XG4gICAgICAgIGNvbnN0IG5vcm1hbCA9IG5ldyBGbG9hdDMyQXJyYXkobnVtICogMyk7XG4gICAgICAgIGNvbnN0IHV2ID0gbmV3IEZsb2F0MzJBcnJheShudW0gKiAyKTtcbiAgICAgICAgY29uc3QgaW5kZXggPSBudW0gPiA2NTUzNiA/IG5ldyBVaW50MzJBcnJheShudW1JbmRpY2VzKSA6IG5ldyBVaW50MTZBcnJheShudW1JbmRpY2VzKTtcblxuICAgICAgICBsZXQgaSA9IDA7XG4gICAgICAgIGxldCBpdiA9IDA7XG4gICAgICAgIGxldCBpaSA9IDA7XG4gICAgICAgIGxldCB0ZSA9IHRTdGFydCArIHRMZW5ndGg7XG4gICAgICAgIGNvbnN0IGdyaWQgPSBbXTtcblxuICAgICAgICBsZXQgbiA9IG5ldyBWZWMzKCk7XG5cbiAgICAgICAgZm9yIChsZXQgaXkgPSAwOyBpeSA8PSBoU2VnczsgaXkrKykge1xuICAgICAgICAgICAgbGV0IHZSb3cgPSBbXTtcbiAgICAgICAgICAgIGxldCB2ID0gaXkgLyBoU2VncztcbiAgICAgICAgICAgIGZvciAobGV0IGl4ID0gMDsgaXggPD0gd1NlZ3M7IGl4KyssIGkrKykge1xuICAgICAgICAgICAgICAgIGxldCB1ID0gaXggLyB3U2VncztcbiAgICAgICAgICAgICAgICBsZXQgeCA9IC1yYWRpdXMgKiBNYXRoLmNvcyhwU3RhcnQgKyB1ICogcExlbmd0aCkgKiBNYXRoLnNpbih0U3RhcnQgKyB2ICogdExlbmd0aCk7XG4gICAgICAgICAgICAgICAgbGV0IHkgPSByYWRpdXMgKiBNYXRoLmNvcyh0U3RhcnQgKyB2ICogdExlbmd0aCk7XG4gICAgICAgICAgICAgICAgbGV0IHogPSByYWRpdXMgKiBNYXRoLnNpbihwU3RhcnQgKyB1ICogcExlbmd0aCkgKiBNYXRoLnNpbih0U3RhcnQgKyB2ICogdExlbmd0aCk7XG5cbiAgICAgICAgICAgICAgICBwb3NpdGlvbltpICogM10gPSB4O1xuICAgICAgICAgICAgICAgIHBvc2l0aW9uW2kgKiAzICsgMV0gPSB5O1xuICAgICAgICAgICAgICAgIHBvc2l0aW9uW2kgKiAzICsgMl0gPSB6O1xuXG4gICAgICAgICAgICAgICAgbi5zZXQoeCwgeSwgeikubm9ybWFsaXplKCk7XG4gICAgICAgICAgICAgICAgbm9ybWFsW2kgKiAzXSA9IG4ueDtcbiAgICAgICAgICAgICAgICBub3JtYWxbaSAqIDMgKyAxXSA9IG4ueTtcbiAgICAgICAgICAgICAgICBub3JtYWxbaSAqIDMgKyAyXSA9IG4uejtcblxuICAgICAgICAgICAgICAgIHV2W2kgKiAyXSA9IHU7XG4gICAgICAgICAgICAgICAgdXZbaSAqIDIgKyAxXSA9IDEgLSB2O1xuXG4gICAgICAgICAgICAgICAgdlJvdy5wdXNoKGl2KyspO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBncmlkLnB1c2godlJvdyk7XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKGxldCBpeSA9IDA7IGl5IDwgaFNlZ3M7IGl5KyspIHtcbiAgICAgICAgICAgIGZvciAobGV0IGl4ID0gMDsgaXggPCB3U2VnczsgaXgrKykge1xuICAgICAgICAgICAgICAgIGxldCBhID0gZ3JpZFtpeV1baXggKyAxXTtcbiAgICAgICAgICAgICAgICBsZXQgYiA9IGdyaWRbaXldW2l4XTtcbiAgICAgICAgICAgICAgICBsZXQgYyA9IGdyaWRbaXkgKyAxXVtpeF07XG4gICAgICAgICAgICAgICAgbGV0IGQgPSBncmlkW2l5ICsgMV1baXggKyAxXTtcblxuICAgICAgICAgICAgICAgIGlmIChpeSAhPT0gMCB8fCB0U3RhcnQgPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGluZGV4W2lpICogM10gPSBhO1xuICAgICAgICAgICAgICAgICAgICBpbmRleFtpaSAqIDMgKyAxXSA9IGI7XG4gICAgICAgICAgICAgICAgICAgIGluZGV4W2lpICogMyArIDJdID0gZDtcbiAgICAgICAgICAgICAgICAgICAgaWkrKztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGl5ICE9PSBoU2VncyAtIDEgfHwgdGUgPCBNYXRoLlBJKSB7XG4gICAgICAgICAgICAgICAgICAgIGluZGV4W2lpICogM10gPSBiO1xuICAgICAgICAgICAgICAgICAgICBpbmRleFtpaSAqIDMgKyAxXSA9IGM7XG4gICAgICAgICAgICAgICAgICAgIGluZGV4W2lpICogMyArIDJdID0gZDtcbiAgICAgICAgICAgICAgICAgICAgaWkrKztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBPYmplY3QuYXNzaWduKGF0dHJpYnV0ZXMsIHtcbiAgICAgICAgICAgIHBvc2l0aW9uOiB7IHNpemU6IDMsIGRhdGE6IHBvc2l0aW9uIH0sXG4gICAgICAgICAgICBub3JtYWw6IHsgc2l6ZTogMywgZGF0YTogbm9ybWFsIH0sXG4gICAgICAgICAgICB1djogeyBzaXplOiAyLCBkYXRhOiB1diB9LFxuICAgICAgICAgICAgaW5kZXg6IHsgZGF0YTogaW5kZXggfSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgc3VwZXIoZ2wsIGF0dHJpYnV0ZXMpO1xuICAgIH1cbn1cbiIsImV4cG9ydCBmdW5jdGlvbiBUZXh0KHtcbiAgICBmb250LFxuICAgIHRleHQsXG4gICAgd2lkdGggPSBJbmZpbml0eSxcbiAgICBhbGlnbiA9ICdsZWZ0JyxcbiAgICBzaXplID0gMSxcbiAgICBsZXR0ZXJTcGFjaW5nID0gMCxcbiAgICBsaW5lSGVpZ2h0ID0gMS40LFxuICAgIHdvcmRTcGFjaW5nID0gMCxcbiAgICB3b3JkQnJlYWsgPSBmYWxzZSxcbn0pIHtcbiAgICBjb25zdCBfdGhpcyA9IHRoaXM7XG4gICAgbGV0IGdseXBocywgYnVmZmVycztcbiAgICBsZXQgZm9udEhlaWdodCwgYmFzZWxpbmUsIHNjYWxlO1xuXG4gICAgY29uc3QgbmV3bGluZSA9IC9cXG4vO1xuICAgIGNvbnN0IHdoaXRlc3BhY2UgPSAvXFxzLztcblxuICAgIHtcbiAgICAgICAgcGFyc2VGb250KCk7XG4gICAgICAgIGNyZWF0ZUdlb21ldHJ5KCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcGFyc2VGb250KCkge1xuICAgICAgICBnbHlwaHMgPSB7fTtcbiAgICAgICAgZm9udC5jaGFycy5mb3JFYWNoKChkKSA9PiAoZ2x5cGhzW2QuY2hhcl0gPSBkKSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY3JlYXRlR2VvbWV0cnkoKSB7XG4gICAgICAgIGZvbnRIZWlnaHQgPSBmb250LmNvbW1vbi5saW5lSGVpZ2h0O1xuICAgICAgICBiYXNlbGluZSA9IGZvbnQuY29tbW9uLmJhc2U7XG5cbiAgICAgICAgLy8gVXNlIGJhc2VsaW5lIHNvIHRoYXQgYWN0dWFsIHRleHQgaGVpZ2h0IGlzIGFzIGNsb3NlIHRvICdzaXplJyB2YWx1ZSBhcyBwb3NzaWJsZVxuICAgICAgICBzY2FsZSA9IHNpemUgLyBiYXNlbGluZTtcblxuICAgICAgICAvLyBTdHJpcCBzcGFjZXMgYW5kIG5ld2xpbmVzIHRvIGdldCBhY3R1YWwgY2hhcmFjdGVyIGxlbmd0aCBmb3IgYnVmZmVyc1xuICAgICAgICBsZXQgY2hhcnMgPSB0ZXh0LnJlcGxhY2UoL1sgXFxuXS9nLCAnJyk7XG4gICAgICAgIGxldCBudW1DaGFycyA9IGNoYXJzLmxlbmd0aDtcblxuICAgICAgICAvLyBDcmVhdGUgb3V0cHV0IGJ1ZmZlcnNcbiAgICAgICAgYnVmZmVycyA9IHtcbiAgICAgICAgICAgIHBvc2l0aW9uOiBuZXcgRmxvYXQzMkFycmF5KG51bUNoYXJzICogNCAqIDMpLFxuICAgICAgICAgICAgdXY6IG5ldyBGbG9hdDMyQXJyYXkobnVtQ2hhcnMgKiA0ICogMiksXG4gICAgICAgICAgICBpZDogbmV3IEZsb2F0MzJBcnJheShudW1DaGFycyAqIDQpLFxuICAgICAgICAgICAgaW5kZXg6IG5ldyBVaW50MTZBcnJheShudW1DaGFycyAqIDYpLFxuICAgICAgICB9O1xuXG4gICAgICAgIC8vIFNldCB2YWx1ZXMgZm9yIGJ1ZmZlcnMgdGhhdCBkb24ndCByZXF1aXJlIGNhbGN1bGF0aW9uXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbnVtQ2hhcnM7IGkrKykge1xuICAgICAgICAgICAgYnVmZmVycy5pZFtpXSA9IGk7XG4gICAgICAgICAgICBidWZmZXJzLmluZGV4LnNldChbaSAqIDQsIGkgKiA0ICsgMiwgaSAqIDQgKyAxLCBpICogNCArIDEsIGkgKiA0ICsgMiwgaSAqIDQgKyAzXSwgaSAqIDYpO1xuICAgICAgICB9XG5cbiAgICAgICAgbGF5b3V0KCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbGF5b3V0KCkge1xuICAgICAgICBjb25zdCBsaW5lcyA9IFtdO1xuXG4gICAgICAgIGxldCBjdXJzb3IgPSAwO1xuXG4gICAgICAgIGxldCB3b3JkQ3Vyc29yID0gMDtcbiAgICAgICAgbGV0IHdvcmRXaWR0aCA9IDA7XG4gICAgICAgIGxldCBsaW5lID0gbmV3TGluZSgpO1xuXG4gICAgICAgIGZ1bmN0aW9uIG5ld0xpbmUoKSB7XG4gICAgICAgICAgICBjb25zdCBsaW5lID0ge1xuICAgICAgICAgICAgICAgIHdpZHRoOiAwLFxuICAgICAgICAgICAgICAgIGdseXBoczogW10sXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgbGluZXMucHVzaChsaW5lKTtcbiAgICAgICAgICAgIHdvcmRDdXJzb3IgPSBjdXJzb3I7XG4gICAgICAgICAgICB3b3JkV2lkdGggPSAwO1xuICAgICAgICAgICAgcmV0dXJuIGxpbmU7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgbWF4VGltZXMgPSAxMDA7XG4gICAgICAgIGxldCBjb3VudCA9IDA7XG4gICAgICAgIHdoaWxlIChjdXJzb3IgPCB0ZXh0Lmxlbmd0aCAmJiBjb3VudCA8IG1heFRpbWVzKSB7XG4gICAgICAgICAgICBjb3VudCsrO1xuXG4gICAgICAgICAgICBjb25zdCBjaGFyID0gdGV4dFtjdXJzb3JdO1xuXG4gICAgICAgICAgICAvLyBTa2lwIHdoaXRlc3BhY2UgYXQgc3RhcnQgb2YgbGluZVxuICAgICAgICAgICAgaWYgKCFsaW5lLndpZHRoICYmIHdoaXRlc3BhY2UudGVzdChjaGFyKSkge1xuICAgICAgICAgICAgICAgIGN1cnNvcisrO1xuICAgICAgICAgICAgICAgIHdvcmRDdXJzb3IgPSBjdXJzb3I7XG4gICAgICAgICAgICAgICAgd29yZFdpZHRoID0gMDtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gSWYgbmV3bGluZSBjaGFyLCBza2lwIHRvIG5leHQgbGluZVxuICAgICAgICAgICAgaWYgKG5ld2xpbmUudGVzdChjaGFyKSkge1xuICAgICAgICAgICAgICAgIGN1cnNvcisrO1xuICAgICAgICAgICAgICAgIGxpbmUgPSBuZXdMaW5lKCk7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IGdseXBoID0gZ2x5cGhzW2NoYXJdIHx8IGdseXBoc1snICddO1xuXG4gICAgICAgICAgICAvLyBGaW5kIGFueSBhcHBsaWNhYmxlIGtlcm4gcGFpcnNcbiAgICAgICAgICAgIGlmIChsaW5lLmdseXBocy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBwcmV2R2x5cGggPSBsaW5lLmdseXBoc1tsaW5lLmdseXBocy5sZW5ndGggLSAxXVswXTtcbiAgICAgICAgICAgICAgICBsZXQga2VybiA9IGdldEtlcm5QYWlyT2Zmc2V0KGdseXBoLmlkLCBwcmV2R2x5cGguaWQpICogc2NhbGU7XG4gICAgICAgICAgICAgICAgbGluZS53aWR0aCArPSBrZXJuO1xuICAgICAgICAgICAgICAgIHdvcmRXaWR0aCArPSBrZXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBhZGQgY2hhciB0byBsaW5lXG4gICAgICAgICAgICBsaW5lLmdseXBocy5wdXNoKFtnbHlwaCwgbGluZS53aWR0aF0pO1xuXG4gICAgICAgICAgICAvLyBjYWxjdWxhdGUgYWR2YW5jZSBmb3IgbmV4dCBnbHlwaFxuICAgICAgICAgICAgbGV0IGFkdmFuY2UgPSAwO1xuXG4gICAgICAgICAgICAvLyBJZiB3aGl0ZXNwYWNlLCB1cGRhdGUgbG9jYXRpb24gb2YgY3VycmVudCB3b3JkIGZvciBsaW5lIGJyZWFrc1xuICAgICAgICAgICAgaWYgKHdoaXRlc3BhY2UudGVzdChjaGFyKSkge1xuICAgICAgICAgICAgICAgIHdvcmRDdXJzb3IgPSBjdXJzb3I7XG4gICAgICAgICAgICAgICAgd29yZFdpZHRoID0gMDtcblxuICAgICAgICAgICAgICAgIC8vIEFkZCB3b3Jkc3BhY2luZ1xuICAgICAgICAgICAgICAgIGFkdmFuY2UgKz0gd29yZFNwYWNpbmcgKiBzaXplO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBBZGQgbGV0dGVyc3BhY2luZ1xuICAgICAgICAgICAgICAgIGFkdmFuY2UgKz0gbGV0dGVyU3BhY2luZyAqIHNpemU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGFkdmFuY2UgKz0gZ2x5cGgueGFkdmFuY2UgKiBzY2FsZTtcblxuICAgICAgICAgICAgbGluZS53aWR0aCArPSBhZHZhbmNlO1xuICAgICAgICAgICAgd29yZFdpZHRoICs9IGFkdmFuY2U7XG5cbiAgICAgICAgICAgIC8vIElmIHdpZHRoIGRlZmluZWRcbiAgICAgICAgICAgIGlmIChsaW5lLndpZHRoID4gd2lkdGgpIHtcbiAgICAgICAgICAgICAgICAvLyBJZiBjYW4gYnJlYWsgd29yZHMsIHVuZG8gbGF0ZXN0IGdseXBoIGlmIGxpbmUgbm90IGVtcHR5IGFuZCBjcmVhdGUgbmV3IGxpbmVcbiAgICAgICAgICAgICAgICBpZiAod29yZEJyZWFrICYmIGxpbmUuZ2x5cGhzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgbGluZS53aWR0aCAtPSBhZHZhbmNlO1xuICAgICAgICAgICAgICAgICAgICBsaW5lLmdseXBocy5wb3AoKTtcbiAgICAgICAgICAgICAgICAgICAgbGluZSA9IG5ld0xpbmUoKTtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gSWYgbm90IGZpcnN0IHdvcmQsIHVuZG8gY3VycmVudCB3b3JkIGFuZCBjdXJzb3IgYW5kIGNyZWF0ZSBuZXcgbGluZVxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoIXdvcmRCcmVhayAmJiB3b3JkV2lkdGggIT09IGxpbmUud2lkdGgpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IG51bUdseXBocyA9IGN1cnNvciAtIHdvcmRDdXJzb3IgKyAxO1xuICAgICAgICAgICAgICAgICAgICBsaW5lLmdseXBocy5zcGxpY2UoLW51bUdseXBocywgbnVtR2x5cGhzKTtcbiAgICAgICAgICAgICAgICAgICAgY3Vyc29yID0gd29yZEN1cnNvcjtcbiAgICAgICAgICAgICAgICAgICAgbGluZS53aWR0aCAtPSB3b3JkV2lkdGg7XG4gICAgICAgICAgICAgICAgICAgIGxpbmUgPSBuZXdMaW5lKCk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY3Vyc29yKys7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBSZW1vdmUgbGFzdCBsaW5lIGlmIGVtcHR5XG4gICAgICAgIGlmICghbGluZS53aWR0aCkgbGluZXMucG9wKCk7XG5cbiAgICAgICAgcG9wdWxhdGVCdWZmZXJzKGxpbmVzKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwb3B1bGF0ZUJ1ZmZlcnMobGluZXMpIHtcbiAgICAgICAgY29uc3QgdGV4VyA9IGZvbnQuY29tbW9uLnNjYWxlVztcbiAgICAgICAgY29uc3QgdGV4SCA9IGZvbnQuY29tbW9uLnNjYWxlSDtcblxuICAgICAgICAvLyBGb3IgYWxsIGZvbnRzIHRlc3RlZCwgYSBsaXR0bGUgb2Zmc2V0IHdhcyBuZWVkZWQgdG8gYmUgcmlnaHQgb24gdGhlIGJhc2VsaW5lLCBoZW5jZSAwLjA3LlxuICAgICAgICBsZXQgeSA9IDAuMDcgKiBzaXplO1xuICAgICAgICBsZXQgaiA9IDA7XG5cbiAgICAgICAgZm9yIChsZXQgbGluZUluZGV4ID0gMDsgbGluZUluZGV4IDwgbGluZXMubGVuZ3RoOyBsaW5lSW5kZXgrKykge1xuICAgICAgICAgICAgbGV0IGxpbmUgPSBsaW5lc1tsaW5lSW5kZXhdO1xuXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxpbmUuZ2x5cGhzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZ2x5cGggPSBsaW5lLmdseXBoc1tpXVswXTtcbiAgICAgICAgICAgICAgICBsZXQgeCA9IGxpbmUuZ2x5cGhzW2ldWzFdO1xuXG4gICAgICAgICAgICAgICAgaWYgKGFsaWduID09PSAnY2VudGVyJykge1xuICAgICAgICAgICAgICAgICAgICB4IC09IGxpbmUud2lkdGggKiAwLjU7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChhbGlnbiA9PT0gJ3JpZ2h0Jykge1xuICAgICAgICAgICAgICAgICAgICB4IC09IGxpbmUud2lkdGg7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gSWYgc3BhY2UsIGRvbid0IGFkZCB0byBnZW9tZXRyeVxuICAgICAgICAgICAgICAgIGlmICh3aGl0ZXNwYWNlLnRlc3QoZ2x5cGguY2hhcikpIGNvbnRpbnVlO1xuXG4gICAgICAgICAgICAgICAgLy8gQXBwbHkgY2hhciBzcHJpdGUgb2Zmc2V0c1xuICAgICAgICAgICAgICAgIHggKz0gZ2x5cGgueG9mZnNldCAqIHNjYWxlO1xuICAgICAgICAgICAgICAgIHkgLT0gZ2x5cGgueW9mZnNldCAqIHNjYWxlO1xuXG4gICAgICAgICAgICAgICAgLy8gZWFjaCBsZXR0ZXIgaXMgYSBxdWFkLiBheGlzIGJvdHRvbSBsZWZ0XG4gICAgICAgICAgICAgICAgbGV0IHcgPSBnbHlwaC53aWR0aCAqIHNjYWxlO1xuICAgICAgICAgICAgICAgIGxldCBoID0gZ2x5cGguaGVpZ2h0ICogc2NhbGU7XG4gICAgICAgICAgICAgICAgYnVmZmVycy5wb3NpdGlvbi5zZXQoW3gsIHkgLSBoLCAwLCB4LCB5LCAwLCB4ICsgdywgeSAtIGgsIDAsIHggKyB3LCB5LCAwXSwgaiAqIDQgKiAzKTtcblxuICAgICAgICAgICAgICAgIGxldCB1ID0gZ2x5cGgueCAvIHRleFc7XG4gICAgICAgICAgICAgICAgbGV0IHV3ID0gZ2x5cGgud2lkdGggLyB0ZXhXO1xuICAgICAgICAgICAgICAgIGxldCB2ID0gMS4wIC0gZ2x5cGgueSAvIHRleEg7XG4gICAgICAgICAgICAgICAgbGV0IHZoID0gZ2x5cGguaGVpZ2h0IC8gdGV4SDtcbiAgICAgICAgICAgICAgICBidWZmZXJzLnV2LnNldChbdSwgdiAtIHZoLCB1LCB2LCB1ICsgdXcsIHYgLSB2aCwgdSArIHV3LCB2XSwgaiAqIDQgKiAyKTtcblxuICAgICAgICAgICAgICAgIC8vIFJlc2V0IGN1cnNvciB0byBiYXNlbGluZVxuICAgICAgICAgICAgICAgIHkgKz0gZ2x5cGgueW9mZnNldCAqIHNjYWxlO1xuXG4gICAgICAgICAgICAgICAgaisrO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB5IC09IHNpemUgKiBsaW5lSGVpZ2h0O1xuICAgICAgICB9XG5cbiAgICAgICAgX3RoaXMuYnVmZmVycyA9IGJ1ZmZlcnM7XG4gICAgICAgIF90aGlzLm51bUxpbmVzID0gbGluZXMubGVuZ3RoO1xuICAgICAgICBfdGhpcy5oZWlnaHQgPSBfdGhpcy5udW1MaW5lcyAqIHNpemUgKiBsaW5lSGVpZ2h0O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdldEtlcm5QYWlyT2Zmc2V0KGlkMSwgaWQyKSB7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZm9udC5rZXJuaW5ncy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgbGV0IGsgPSBmb250Lmtlcm5pbmdzW2ldO1xuICAgICAgICAgICAgaWYgKGsuZmlyc3QgPCBpZDEpIGNvbnRpbnVlO1xuICAgICAgICAgICAgaWYgKGsuc2Vjb25kIDwgaWQyKSBjb250aW51ZTtcbiAgICAgICAgICAgIGlmIChrLmZpcnN0ID4gaWQxKSByZXR1cm4gMDtcbiAgICAgICAgICAgIGlmIChrLmZpcnN0ID09PSBpZDEgJiYgay5zZWNvbmQgPiBpZDIpIHJldHVybiAwO1xuICAgICAgICAgICAgcmV0dXJuIGsuYW1vdW50O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAwO1xuICAgIH1cblxuICAgIC8vIFVwZGF0ZSBidWZmZXJzIHRvIGxheW91dCB3aXRoIG5ldyBsYXlvdXRcbiAgICB0aGlzLnJlc2l6ZSA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gICAgICAgICh7IHdpZHRoIH0gPSBvcHRpb25zKTtcbiAgICAgICAgbGF5b3V0KCk7XG4gICAgfTtcblxuICAgIC8vIENvbXBsZXRlbHkgY2hhbmdlIHRleHQgKGxpa2UgY3JlYXRpbmcgbmV3IFRleHQpXG4gICAgdGhpcy51cGRhdGUgPSBmdW5jdGlvbiAob3B0aW9ucykge1xuICAgICAgICAoeyB0ZXh0IH0gPSBvcHRpb25zKTtcbiAgICAgICAgY3JlYXRlR2VvbWV0cnkoKTtcbiAgICB9O1xufVxuIiwiaW1wb3J0IHsgVGV4dHVyZSB9IGZyb20gJy4uL2NvcmUvVGV4dHVyZS5qcyc7XG5pbXBvcnQgeyBLVFhUZXh0dXJlIH0gZnJvbSAnLi9LVFhUZXh0dXJlLmpzJztcblxuLy8gRm9yIGNvbXByZXNzZWQgdGV4dHVyZXMsIGdlbmVyYXRlIHVzaW5nIGh0dHBzOi8vZ2l0aHViLmNvbS9UaW12YW5TY2hlcnBlbnplZWwvdGV4dHVyZS1jb21wcmVzc29yXG5cbmxldCBjYWNoZSA9IHt9O1xuY29uc3Qgc3VwcG9ydGVkRXh0ZW5zaW9ucyA9IFtdO1xuXG5leHBvcnQgY2xhc3MgVGV4dHVyZUxvYWRlciB7XG4gICAgc3RhdGljIGxvYWQoXG4gICAgICAgIGdsLFxuICAgICAgICB7XG4gICAgICAgICAgICBzcmMsIC8vIHN0cmluZyBvciBvYmplY3Qgb2YgZXh0ZW5zaW9uOnNyYyBrZXktdmFsdWVzXG4gICAgICAgICAgICAvLyB7XG4gICAgICAgICAgICAvLyAgICAgcHZydGM6ICcuLi5rdHgnLFxuICAgICAgICAgICAgLy8gICAgIHMzdGM6ICcuLi5rdHgnLFxuICAgICAgICAgICAgLy8gICAgIGV0YzogJy4uLmt0eCcsXG4gICAgICAgICAgICAvLyAgICAgZXRjMTogJy4uLmt0eCcsXG4gICAgICAgICAgICAvLyAgICAgYXN0YzogJy4uLmt0eCcsXG4gICAgICAgICAgICAvLyAgICAgd2VicDogJy4uLndlYnAnLFxuICAgICAgICAgICAgLy8gICAgIGpwZzogJy4uLmpwZycsXG4gICAgICAgICAgICAvLyAgICAgcG5nOiAnLi4ucG5nJyxcbiAgICAgICAgICAgIC8vIH1cblxuICAgICAgICAgICAgLy8gT25seSBwcm9wcyByZWxldmFudCB0byBLVFhUZXh0dXJlXG4gICAgICAgICAgICB3cmFwUyA9IGdsLkNMQU1QX1RPX0VER0UsXG4gICAgICAgICAgICB3cmFwVCA9IGdsLkNMQU1QX1RPX0VER0UsXG4gICAgICAgICAgICBhbmlzb3Ryb3B5ID0gMCxcblxuICAgICAgICAgICAgLy8gRm9yIHJlZ3VsYXIgaW1hZ2VzXG4gICAgICAgICAgICBmb3JtYXQgPSBnbC5SR0JBLFxuICAgICAgICAgICAgaW50ZXJuYWxGb3JtYXQgPSBmb3JtYXQsXG4gICAgICAgICAgICBnZW5lcmF0ZU1pcG1hcHMgPSB0cnVlLFxuICAgICAgICAgICAgbWluRmlsdGVyID0gZ2VuZXJhdGVNaXBtYXBzID8gZ2wuTkVBUkVTVF9NSVBNQVBfTElORUFSIDogZ2wuTElORUFSLFxuICAgICAgICAgICAgbWFnRmlsdGVyID0gZ2wuTElORUFSLFxuICAgICAgICAgICAgcHJlbXVsdGlwbHlBbHBoYSA9IGZhbHNlLFxuICAgICAgICAgICAgdW5wYWNrQWxpZ25tZW50ID0gNCxcbiAgICAgICAgICAgIGZsaXBZID0gdHJ1ZSxcbiAgICAgICAgfSA9IHt9XG4gICAgKSB7XG4gICAgICAgIGNvbnN0IHN1cHBvcnQgPSB0aGlzLmdldFN1cHBvcnRlZEV4dGVuc2lvbnMoZ2wpO1xuICAgICAgICBsZXQgZXh0ID0gJ25vbmUnO1xuXG4gICAgICAgIC8vIElmIHNyYyBpcyBzdHJpbmcsIGRldGVybWluZSB3aGljaCBmb3JtYXQgZnJvbSB0aGUgZXh0ZW5zaW9uXG4gICAgICAgIGlmICh0eXBlb2Ygc3JjID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgZXh0ID0gc3JjLnNwbGl0KCcuJykucG9wKCkuc3BsaXQoJz8nKVswXS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gSWYgc3JjIGlzIG9iamVjdCwgdXNlIHN1cHBvcnRlZCBleHRlbnNpb25zIGFuZCBwcm92aWRlZCBsaXN0IHRvIGNob29zZSBiZXN0IG9wdGlvblxuICAgICAgICAvLyBHZXQgZmlyc3Qgc3VwcG9ydGVkIG1hdGNoLCBzbyBwdXQgaW4gb3JkZXIgb2YgcHJlZmVyZW5jZVxuICAgICAgICBpZiAodHlwZW9mIHNyYyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgIGZvciAoY29uc3QgcHJvcCBpbiBzcmMpIHtcbiAgICAgICAgICAgICAgICBpZiAoc3VwcG9ydC5pbmNsdWRlcyhwcm9wLnRvTG93ZXJDYXNlKCkpKSB7XG4gICAgICAgICAgICAgICAgICAgIGV4dCA9IHByb3AudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgICAgICAgICAgICAgc3JjID0gc3JjW3Byb3BdO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBTdHJpbmdpZnkgcHJvcHNcbiAgICAgICAgY29uc3QgY2FjaGVJRCA9XG4gICAgICAgICAgICBzcmMgK1xuICAgICAgICAgICAgd3JhcFMgK1xuICAgICAgICAgICAgd3JhcFQgK1xuICAgICAgICAgICAgYW5pc290cm9weSArXG4gICAgICAgICAgICBmb3JtYXQgK1xuICAgICAgICAgICAgaW50ZXJuYWxGb3JtYXQgK1xuICAgICAgICAgICAgZ2VuZXJhdGVNaXBtYXBzICtcbiAgICAgICAgICAgIG1pbkZpbHRlciArXG4gICAgICAgICAgICBtYWdGaWx0ZXIgK1xuICAgICAgICAgICAgcHJlbXVsdGlwbHlBbHBoYSArXG4gICAgICAgICAgICB1bnBhY2tBbGlnbm1lbnQgK1xuICAgICAgICAgICAgZmxpcFkgK1xuICAgICAgICAgICAgZ2wucmVuZGVyZXIuaWQ7XG5cbiAgICAgICAgLy8gQ2hlY2sgY2FjaGUgZm9yIGV4aXN0aW5nIHRleHR1cmVcbiAgICAgICAgaWYgKGNhY2hlW2NhY2hlSURdKSByZXR1cm4gY2FjaGVbY2FjaGVJRF07XG5cbiAgICAgICAgbGV0IHRleHR1cmU7XG4gICAgICAgIHN3aXRjaCAoZXh0KSB7XG4gICAgICAgICAgICBjYXNlICdrdHgnOlxuICAgICAgICAgICAgY2FzZSAncHZydGMnOlxuICAgICAgICAgICAgY2FzZSAnczN0Yyc6XG4gICAgICAgICAgICBjYXNlICdldGMnOlxuICAgICAgICAgICAgY2FzZSAnZXRjMSc6XG4gICAgICAgICAgICBjYXNlICdhc3RjJzpcbiAgICAgICAgICAgICAgICAvLyBMb2FkIGNvbXByZXNzZWQgdGV4dHVyZSB1c2luZyBLVFggZm9ybWF0XG4gICAgICAgICAgICAgICAgdGV4dHVyZSA9IG5ldyBLVFhUZXh0dXJlKGdsLCB7XG4gICAgICAgICAgICAgICAgICAgIHNyYyxcbiAgICAgICAgICAgICAgICAgICAgd3JhcFMsXG4gICAgICAgICAgICAgICAgICAgIHdyYXBULFxuICAgICAgICAgICAgICAgICAgICBhbmlzb3Ryb3B5LFxuICAgICAgICAgICAgICAgICAgICBtaW5GaWx0ZXIsXG4gICAgICAgICAgICAgICAgICAgIG1hZ0ZpbHRlcixcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB0ZXh0dXJlLmxvYWRlZCA9IHRoaXMubG9hZEtUWChzcmMsIHRleHR1cmUpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnd2VicCc6XG4gICAgICAgICAgICBjYXNlICdqcGcnOlxuICAgICAgICAgICAgY2FzZSAnanBlZyc6XG4gICAgICAgICAgICBjYXNlICdwbmcnOlxuICAgICAgICAgICAgICAgIHRleHR1cmUgPSBuZXcgVGV4dHVyZShnbCwge1xuICAgICAgICAgICAgICAgICAgICB3cmFwUyxcbiAgICAgICAgICAgICAgICAgICAgd3JhcFQsXG4gICAgICAgICAgICAgICAgICAgIGFuaXNvdHJvcHksXG4gICAgICAgICAgICAgICAgICAgIGZvcm1hdCxcbiAgICAgICAgICAgICAgICAgICAgaW50ZXJuYWxGb3JtYXQsXG4gICAgICAgICAgICAgICAgICAgIGdlbmVyYXRlTWlwbWFwcyxcbiAgICAgICAgICAgICAgICAgICAgbWluRmlsdGVyLFxuICAgICAgICAgICAgICAgICAgICBtYWdGaWx0ZXIsXG4gICAgICAgICAgICAgICAgICAgIHByZW11bHRpcGx5QWxwaGEsXG4gICAgICAgICAgICAgICAgICAgIHVucGFja0FsaWdubWVudCxcbiAgICAgICAgICAgICAgICAgICAgZmxpcFksXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgdGV4dHVyZS5sb2FkZWQgPSB0aGlzLmxvYWRJbWFnZShnbCwgc3JjLCB0ZXh0dXJlKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdObyBzdXBwb3J0ZWQgZm9ybWF0IHN1cHBsaWVkJyk7XG4gICAgICAgICAgICAgICAgdGV4dHVyZSA9IG5ldyBUZXh0dXJlKGdsKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRleHR1cmUuZXh0ID0gZXh0O1xuICAgICAgICBjYWNoZVtjYWNoZUlEXSA9IHRleHR1cmU7XG4gICAgICAgIHJldHVybiB0ZXh0dXJlO1xuICAgIH1cblxuICAgIHN0YXRpYyBnZXRTdXBwb3J0ZWRFeHRlbnNpb25zKGdsKSB7XG4gICAgICAgIGlmIChzdXBwb3J0ZWRFeHRlbnNpb25zLmxlbmd0aCkgcmV0dXJuIHN1cHBvcnRlZEV4dGVuc2lvbnM7XG5cbiAgICAgICAgY29uc3QgZXh0ZW5zaW9ucyA9IHtcbiAgICAgICAgICAgIHB2cnRjOiBnbC5yZW5kZXJlci5nZXRFeHRlbnNpb24oJ1dFQkdMX2NvbXByZXNzZWRfdGV4dHVyZV9wdnJ0YycpIHx8IGdsLnJlbmRlcmVyLmdldEV4dGVuc2lvbignV0VCS0lUX1dFQkdMX2NvbXByZXNzZWRfdGV4dHVyZV9wdnJ0YycpLFxuICAgICAgICAgICAgczN0YzpcbiAgICAgICAgICAgICAgICBnbC5yZW5kZXJlci5nZXRFeHRlbnNpb24oJ1dFQkdMX2NvbXByZXNzZWRfdGV4dHVyZV9zM3RjJykgfHxcbiAgICAgICAgICAgICAgICBnbC5yZW5kZXJlci5nZXRFeHRlbnNpb24oJ01PWl9XRUJHTF9jb21wcmVzc2VkX3RleHR1cmVfczN0YycpIHx8XG4gICAgICAgICAgICAgICAgZ2wucmVuZGVyZXIuZ2V0RXh0ZW5zaW9uKCdXRUJLSVRfV0VCR0xfY29tcHJlc3NlZF90ZXh0dXJlX3MzdGMnKSxcbiAgICAgICAgICAgIGV0YzogZ2wucmVuZGVyZXIuZ2V0RXh0ZW5zaW9uKCdXRUJHTF9jb21wcmVzc2VkX3RleHR1cmVfZXRjJyksXG4gICAgICAgICAgICBldGMxOiBnbC5yZW5kZXJlci5nZXRFeHRlbnNpb24oJ1dFQkdMX2NvbXByZXNzZWRfdGV4dHVyZV9ldGMxJyksXG4gICAgICAgICAgICBhc3RjOiBnbC5yZW5kZXJlci5nZXRFeHRlbnNpb24oJ1dFQkdMX2NvbXByZXNzZWRfdGV4dHVyZV9hc3RjJyksXG4gICAgICAgIH07XG5cbiAgICAgICAgZm9yIChjb25zdCBleHQgaW4gZXh0ZW5zaW9ucykgaWYgKGV4dGVuc2lvbnNbZXh0XSkgc3VwcG9ydGVkRXh0ZW5zaW9ucy5wdXNoKGV4dCk7XG5cbiAgICAgICAgLy8gQ2hlY2sgZm9yIFdlYlAgc3VwcG9ydFxuICAgICAgICBpZiAoZGV0ZWN0V2ViUCkgc3VwcG9ydGVkRXh0ZW5zaW9ucy5wdXNoKCd3ZWJwJyk7XG5cbiAgICAgICAgLy8gRm9ybWF0cyBzdXBwb3J0ZWQgYnkgYWxsXG4gICAgICAgIHN1cHBvcnRlZEV4dGVuc2lvbnMucHVzaCgncG5nJywgJ2pwZycpO1xuXG4gICAgICAgIHJldHVybiBzdXBwb3J0ZWRFeHRlbnNpb25zO1xuICAgIH1cblxuICAgIHN0YXRpYyBsb2FkS1RYKHNyYywgdGV4dHVyZSkge1xuICAgICAgICByZXR1cm4gZmV0Y2goc3JjKVxuICAgICAgICAgICAgLnRoZW4oKHJlcykgPT4gcmVzLmFycmF5QnVmZmVyKCkpXG4gICAgICAgICAgICAudGhlbigoYnVmZmVyKSA9PiB0ZXh0dXJlLnBhcnNlQnVmZmVyKGJ1ZmZlcikpO1xuICAgIH1cblxuICAgIHN0YXRpYyBsb2FkSW1hZ2UoZ2wsIHNyYywgdGV4dHVyZSkge1xuICAgICAgICByZXR1cm4gZGVjb2RlSW1hZ2Uoc3JjKS50aGVuKChpbWdCbXApID0+IHtcbiAgICAgICAgICAgIC8vIENhdGNoIG5vbiBQT1QgdGV4dHVyZXMgYW5kIHVwZGF0ZSBwYXJhbXMgdG8gYXZvaWQgZXJyb3JzXG4gICAgICAgICAgICBpZiAoIXBvd2VyT2ZUd28oaW1nQm1wLndpZHRoKSB8fCAhcG93ZXJPZlR3byhpbWdCbXAuaGVpZ2h0KSkge1xuICAgICAgICAgICAgICAgIGlmICh0ZXh0dXJlLmdlbmVyYXRlTWlwbWFwcykgdGV4dHVyZS5nZW5lcmF0ZU1pcG1hcHMgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBpZiAodGV4dHVyZS5taW5GaWx0ZXIgPT09IGdsLk5FQVJFU1RfTUlQTUFQX0xJTkVBUikgdGV4dHVyZS5taW5GaWx0ZXIgPSBnbC5MSU5FQVI7XG4gICAgICAgICAgICAgICAgaWYgKHRleHR1cmUud3JhcFMgPT09IGdsLlJFUEVBVCkgdGV4dHVyZS53cmFwUyA9IHRleHR1cmUud3JhcFQgPSBnbC5DTEFNUF9UT19FREdFO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0ZXh0dXJlLmltYWdlID0gaW1nQm1wO1xuXG4gICAgICAgICAgICAvLyBGb3IgY3JlYXRlSW1hZ2VCaXRtYXAsIGNsb3NlIG9uY2UgdXBsb2FkZWRcbiAgICAgICAgICAgIHRleHR1cmUub25VcGRhdGUgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGltZ0JtcC5jbG9zZSkgaW1nQm1wLmNsb3NlKCk7XG4gICAgICAgICAgICAgICAgdGV4dHVyZS5vblVwZGF0ZSA9IG51bGw7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICByZXR1cm4gaW1nQm1wO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBzdGF0aWMgY2xlYXJDYWNoZSgpIHtcbiAgICAgICAgY2FjaGUgPSB7fTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGRldGVjdFdlYlAoKSB7XG4gICAgcmV0dXJuIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpLnRvRGF0YVVSTCgnaW1hZ2Uvd2VicCcpLmluZGV4T2YoJ2RhdGE6aW1hZ2Uvd2VicCcpID09IDA7XG59XG5cbmZ1bmN0aW9uIHBvd2VyT2ZUd28odmFsdWUpIHtcbiAgICByZXR1cm4gTWF0aC5sb2cyKHZhbHVlKSAlIDEgPT09IDA7XG59XG5cbmZ1bmN0aW9uIGRlY29kZUltYWdlKHNyYykge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICBjb25zdCBpbWcgPSBuZXcgSW1hZ2UoKTtcbiAgICAgICAgaW1nLmNyb3NzT3JpZ2luID0gJyc7XG4gICAgICAgIGltZy5zcmMgPSBzcmM7XG5cbiAgICAgICAgLy8gT25seSBjaHJvbWUncyBpbXBsZW1lbnRhdGlvbiBvZiBjcmVhdGVJbWFnZUJpdG1hcCBpcyBmdWxseSBzdXBwb3J0ZWRcbiAgICAgICAgY29uc3QgaXNDaHJvbWUgPSBuYXZpZ2F0b3IudXNlckFnZW50LnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoJ2Nocm9tZScpO1xuICAgICAgICBpZiAoISF3aW5kb3cuY3JlYXRlSW1hZ2VCaXRtYXAgJiYgaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIGltZy5vbmxvYWQgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgY3JlYXRlSW1hZ2VCaXRtYXAoaW1nLCB7XG4gICAgICAgICAgICAgICAgICAgIGltYWdlT3JpZW50YXRpb246ICdmbGlwWScsXG4gICAgICAgICAgICAgICAgICAgIHByZW11bHRpcGx5QWxwaGE6ICdub25lJyxcbiAgICAgICAgICAgICAgICB9KS50aGVuKChpbWdCbXApID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShpbWdCbXApO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGltZy5vbmxvYWQgPSAoKSA9PiByZXNvbHZlKGltZyk7XG4gICAgICAgIH1cbiAgICB9KTtcbn1cbiIsIi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9tcmRvb2IvdGhyZWUuanMvYmxvYi9tYXN0ZXIvc3JjL2dlb21ldHJpZXMvVG9ydXNHZW9tZXRyeS5qc1xuXG5pbXBvcnQgeyBHZW9tZXRyeSB9IGZyb20gJy4uL2NvcmUvR2VvbWV0cnkuanMnO1xuaW1wb3J0IHsgVmVjMyB9IGZyb20gJy4uL21hdGgvVmVjMy5qcyc7XG5cbmV4cG9ydCBjbGFzcyBUb3J1cyBleHRlbmRzIEdlb21ldHJ5IHtcbiAgICBjb25zdHJ1Y3RvcihnbCwgeyByYWRpdXMgPSAwLjUsIHR1YmUgPSAwLjIsIHJhZGlhbFNlZ21lbnRzID0gOCwgdHVidWxhclNlZ21lbnRzID0gNiwgYXJjID0gTWF0aC5QSSAqIDIsIGF0dHJpYnV0ZXMgPSB7fSB9ID0ge30pIHtcbiAgICAgICAgY29uc3QgbnVtID0gKHJhZGlhbFNlZ21lbnRzICsgMSkgKiAodHVidWxhclNlZ21lbnRzICsgMSk7XG4gICAgICAgIGNvbnN0IG51bUluZGljZXMgPSByYWRpYWxTZWdtZW50cyAqIHR1YnVsYXJTZWdtZW50cyAqIDY7XG5cbiAgICAgICAgY29uc3QgdmVydGljZXMgPSBuZXcgRmxvYXQzMkFycmF5KG51bSAqIDMpO1xuICAgICAgICBjb25zdCBub3JtYWxzID0gbmV3IEZsb2F0MzJBcnJheShudW0gKiAzKTtcbiAgICAgICAgY29uc3QgdXZzID0gbmV3IEZsb2F0MzJBcnJheShudW0gKiAyKTtcbiAgICAgICAgY29uc3QgaW5kaWNlcyA9IG51bSA+IDY1NTM2ID8gbmV3IFVpbnQzMkFycmF5KG51bUluZGljZXMpIDogbmV3IFVpbnQxNkFycmF5KG51bUluZGljZXMpO1xuXG4gICAgICAgIGNvbnN0IGNlbnRlciA9IG5ldyBWZWMzKCk7XG4gICAgICAgIGNvbnN0IHZlcnRleCA9IG5ldyBWZWMzKCk7XG4gICAgICAgIGNvbnN0IG5vcm1hbCA9IG5ldyBWZWMzKCk7XG5cbiAgICAgICAgLy8gZ2VuZXJhdGUgdmVydGljZXMsIG5vcm1hbHMgYW5kIHV2c1xuICAgICAgICBsZXQgaWR4ID0gMDtcbiAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPD0gcmFkaWFsU2VnbWVudHM7IGorKykge1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPD0gdHVidWxhclNlZ21lbnRzOyBpKyssIGlkeCsrKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgdSA9IChpIC8gdHVidWxhclNlZ21lbnRzKSAqIGFyYztcbiAgICAgICAgICAgICAgICBjb25zdCB2ID0gKGogLyByYWRpYWxTZWdtZW50cykgKiBNYXRoLlBJICogMjtcblxuICAgICAgICAgICAgICAgIC8vIHZlcnRleFxuICAgICAgICAgICAgICAgIHZlcnRleC54ID0gKHJhZGl1cyArIHR1YmUgKiBNYXRoLmNvcyh2KSkgKiBNYXRoLmNvcyh1KTtcbiAgICAgICAgICAgICAgICB2ZXJ0ZXgueSA9IChyYWRpdXMgKyB0dWJlICogTWF0aC5jb3ModikpICogTWF0aC5zaW4odSk7XG4gICAgICAgICAgICAgICAgdmVydGV4LnogPSB0dWJlICogTWF0aC5zaW4odik7XG5cbiAgICAgICAgICAgICAgICB2ZXJ0aWNlcy5zZXQoW3ZlcnRleC54LCB2ZXJ0ZXgueSwgdmVydGV4LnpdLCBpZHggKiAzKTtcblxuICAgICAgICAgICAgICAgIC8vIG5vcm1hbFxuICAgICAgICAgICAgICAgIGNlbnRlci54ID0gcmFkaXVzICogTWF0aC5jb3ModSk7XG4gICAgICAgICAgICAgICAgY2VudGVyLnkgPSByYWRpdXMgKiBNYXRoLnNpbih1KTtcbiAgICAgICAgICAgICAgICBub3JtYWwuc3ViKHZlcnRleCwgY2VudGVyKS5ub3JtYWxpemUoKTtcblxuICAgICAgICAgICAgICAgIG5vcm1hbHMuc2V0KFtub3JtYWwueCwgbm9ybWFsLnksIG5vcm1hbC56XSwgaWR4ICogMyk7XG5cbiAgICAgICAgICAgICAgICAvLyB1dlxuICAgICAgICAgICAgICAgIHV2cy5zZXQoW2kgLyB0dWJ1bGFyU2VnbWVudHMsIGogLyByYWRpYWxTZWdtZW50c10sIGlkeCAqIDIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gZ2VuZXJhdGUgaW5kaWNlc1xuICAgICAgICBpZHggPSAwO1xuICAgICAgICBmb3IgKGxldCBqID0gMTsgaiA8PSByYWRpYWxTZWdtZW50czsgaisrKSB7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMTsgaSA8PSB0dWJ1bGFyU2VnbWVudHM7IGkrKywgaWR4KyspIHtcbiAgICAgICAgICAgICAgICAvLyBpbmRpY2VzXG4gICAgICAgICAgICAgICAgY29uc3QgYSA9ICh0dWJ1bGFyU2VnbWVudHMgKyAxKSAqIGogKyBpIC0gMTtcbiAgICAgICAgICAgICAgICBjb25zdCBiID0gKHR1YnVsYXJTZWdtZW50cyArIDEpICogKGogLSAxKSArIGkgLSAxO1xuICAgICAgICAgICAgICAgIGNvbnN0IGMgPSAodHVidWxhclNlZ21lbnRzICsgMSkgKiAoaiAtIDEpICsgaTtcbiAgICAgICAgICAgICAgICBjb25zdCBkID0gKHR1YnVsYXJTZWdtZW50cyArIDEpICogaiArIGk7XG5cbiAgICAgICAgICAgICAgICAvLyBmYWNlc1xuICAgICAgICAgICAgICAgIGluZGljZXMuc2V0KFthLCBiLCBkLCBiLCBjLCBkXSwgaWR4ICogNik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBPYmplY3QuYXNzaWduKGF0dHJpYnV0ZXMsIHtcbiAgICAgICAgICAgIHBvc2l0aW9uOiB7IHNpemU6IDMsIGRhdGE6IHZlcnRpY2VzIH0sXG4gICAgICAgICAgICBub3JtYWw6IHsgc2l6ZTogMywgZGF0YTogbm9ybWFscyB9LFxuICAgICAgICAgICAgdXY6IHsgc2l6ZTogMiwgZGF0YTogdXZzIH0sXG4gICAgICAgICAgICBpbmRleDogeyBkYXRhOiBpbmRpY2VzIH0sXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHN1cGVyKGdsLCBhdHRyaWJ1dGVzKTtcbiAgICB9XG59XG4iLCJpbXBvcnQgeyBHZW9tZXRyeSB9IGZyb20gJy4uL2NvcmUvR2VvbWV0cnkuanMnO1xuXG5leHBvcnQgY2xhc3MgVHJpYW5nbGUgZXh0ZW5kcyBHZW9tZXRyeSB7XG4gICAgY29uc3RydWN0b3IoZ2wsIHsgYXR0cmlidXRlcyA9IHt9IH0gPSB7fSkge1xuICAgICAgICBPYmplY3QuYXNzaWduKGF0dHJpYnV0ZXMsIHtcbiAgICAgICAgICAgIHBvc2l0aW9uOiB7IHNpemU6IDIsIGRhdGE6IG5ldyBGbG9hdDMyQXJyYXkoWy0xLCAtMSwgMywgLTEsIC0xLCAzXSkgfSxcbiAgICAgICAgICAgIHV2OiB7IHNpemU6IDIsIGRhdGE6IG5ldyBGbG9hdDMyQXJyYXkoWzAsIDAsIDIsIDAsIDAsIDJdKSB9LFxuICAgICAgICB9KTtcblxuICAgICAgICBzdXBlcihnbCwgYXR0cmlidXRlcyk7XG4gICAgfVxufVxuIiwiaW1wb3J0ICogYXMgQ29sb3JGdW5jIGZyb20gJy4vZnVuY3Rpb25zL0NvbG9yRnVuYy5qcyc7XG5cbi8vIENvbG9yIHN0b3JlZCBhcyBhbiBhcnJheSBvZiBSR0IgZGVjaW1hbCB2YWx1ZXMgKGJldHdlZW4gMCA+IDEpXG4vLyBDb25zdHJ1Y3RvciBhbmQgc2V0IG1ldGhvZCBhY2NlcHQgZm9sbG93aW5nIGZvcm1hdHM6XG4vLyBuZXcgQ29sb3IoKSAtIEVtcHR5IChkZWZhdWx0cyB0byBibGFjaylcbi8vIG5ldyBDb2xvcihbMC4yLCAwLjQsIDEuMF0pIC0gRGVjaW1hbCBBcnJheSAob3IgYW5vdGhlciBDb2xvciBpbnN0YW5jZSlcbi8vIG5ldyBDb2xvcigwLjcsIDAuMCwgMC4xKSAtIERlY2ltYWwgUkdCIHZhbHVlc1xuLy8gbmV3IENvbG9yKCcjZmYwMDAwJykgLSBIZXggc3RyaW5nXG4vLyBuZXcgQ29sb3IoJyNjY2MnKSAtIFNob3J0LWhhbmQgSGV4IHN0cmluZ1xuLy8gbmV3IENvbG9yKDB4NGYyN2U4KSAtIE51bWJlclxuLy8gbmV3IENvbG9yKCdyZWQnKSAtIENvbG9yIG5hbWUgc3RyaW5nIChzaG9ydCBsaXN0IGluIENvbG9yRnVuYy5qcylcblxuZXhwb3J0IGNsYXNzIENvbG9yIGV4dGVuZHMgQXJyYXkge1xuICAgIGNvbnN0cnVjdG9yKGNvbG9yKSB7XG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KGNvbG9yKSkgcmV0dXJuIHN1cGVyKC4uLmNvbG9yKTtcbiAgICAgICAgcmV0dXJuIHN1cGVyKC4uLkNvbG9yRnVuYy5wYXJzZUNvbG9yKC4uLmFyZ3VtZW50cykpO1xuICAgIH1cblxuICAgIGdldCByKCkge1xuICAgICAgICByZXR1cm4gdGhpc1swXTtcbiAgICB9XG5cbiAgICBnZXQgZygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXNbMV07XG4gICAgfVxuXG4gICAgZ2V0IGIoKSB7XG4gICAgICAgIHJldHVybiB0aGlzWzJdO1xuICAgIH1cblxuICAgIHNldCByKHYpIHtcbiAgICAgICAgdGhpc1swXSA9IHY7XG4gICAgfVxuXG4gICAgc2V0IGcodikge1xuICAgICAgICB0aGlzWzFdID0gdjtcbiAgICB9XG5cbiAgICBzZXQgYih2KSB7XG4gICAgICAgIHRoaXNbMl0gPSB2O1xuICAgIH1cblxuICAgIHNldChjb2xvcikge1xuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShjb2xvcikpIHJldHVybiB0aGlzLmNvcHkoY29sb3IpO1xuICAgICAgICByZXR1cm4gdGhpcy5jb3B5KENvbG9yRnVuYy5wYXJzZUNvbG9yKC4uLmFyZ3VtZW50cykpO1xuICAgIH1cblxuICAgIGNvcHkodikge1xuICAgICAgICB0aGlzWzBdID0gdlswXTtcbiAgICAgICAgdGhpc1sxXSA9IHZbMV07XG4gICAgICAgIHRoaXNbMl0gPSB2WzJdO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG59XG4iLCJpbXBvcnQgKiBhcyBFdWxlckZ1bmMgZnJvbSAnLi9mdW5jdGlvbnMvRXVsZXJGdW5jLmpzJztcbmltcG9ydCB7IE1hdDQgfSBmcm9tICcuL01hdDQuanMnO1xuXG5jb25zdCB0bXBNYXQ0ID0gbmV3IE1hdDQoKTtcblxuZXhwb3J0IGNsYXNzIEV1bGVyIGV4dGVuZHMgQXJyYXkge1xuICAgIGNvbnN0cnVjdG9yKHggPSAwLCB5ID0geCwgeiA9IHgsIG9yZGVyID0gJ1lYWicpIHtcbiAgICAgICAgc3VwZXIoeCwgeSwgeik7XG4gICAgICAgIHRoaXMub3JkZXIgPSBvcmRlcjtcbiAgICAgICAgdGhpcy5vbkNoYW5nZSA9ICgpID0+IHt9O1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBnZXQgeCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXNbMF07XG4gICAgfVxuXG4gICAgZ2V0IHkoKSB7XG4gICAgICAgIHJldHVybiB0aGlzWzFdO1xuICAgIH1cblxuICAgIGdldCB6KCkge1xuICAgICAgICByZXR1cm4gdGhpc1syXTtcbiAgICB9XG5cbiAgICBzZXQgeCh2KSB7XG4gICAgICAgIHRoaXNbMF0gPSB2O1xuICAgICAgICB0aGlzLm9uQ2hhbmdlKCk7XG4gICAgfVxuXG4gICAgc2V0IHkodikge1xuICAgICAgICB0aGlzWzFdID0gdjtcbiAgICAgICAgdGhpcy5vbkNoYW5nZSgpO1xuICAgIH1cblxuICAgIHNldCB6KHYpIHtcbiAgICAgICAgdGhpc1syXSA9IHY7XG4gICAgICAgIHRoaXMub25DaGFuZ2UoKTtcbiAgICB9XG5cbiAgICBzZXQoeCwgeSA9IHgsIHogPSB4KSB7XG4gICAgICAgIGlmICh4Lmxlbmd0aCkgcmV0dXJuIHRoaXMuY29weSh4KTtcbiAgICAgICAgdGhpc1swXSA9IHg7XG4gICAgICAgIHRoaXNbMV0gPSB5O1xuICAgICAgICB0aGlzWzJdID0gejtcbiAgICAgICAgdGhpcy5vbkNoYW5nZSgpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBjb3B5KHYpIHtcbiAgICAgICAgdGhpc1swXSA9IHZbMF07XG4gICAgICAgIHRoaXNbMV0gPSB2WzFdO1xuICAgICAgICB0aGlzWzJdID0gdlsyXTtcbiAgICAgICAgdGhpcy5vbkNoYW5nZSgpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICByZW9yZGVyKG9yZGVyKSB7XG4gICAgICAgIHRoaXMub3JkZXIgPSBvcmRlcjtcbiAgICAgICAgdGhpcy5vbkNoYW5nZSgpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBmcm9tUm90YXRpb25NYXRyaXgobSwgb3JkZXIgPSB0aGlzLm9yZGVyKSB7XG4gICAgICAgIEV1bGVyRnVuYy5mcm9tUm90YXRpb25NYXRyaXgodGhpcywgbSwgb3JkZXIpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBmcm9tUXVhdGVybmlvbihxLCBvcmRlciA9IHRoaXMub3JkZXIpIHtcbiAgICAgICAgdG1wTWF0NC5mcm9tUXVhdGVybmlvbihxKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuZnJvbVJvdGF0aW9uTWF0cml4KHRtcE1hdDQsIG9yZGVyKTtcbiAgICB9XG5cbiAgICB0b0FycmF5KGEgPSBbXSwgbyA9IDApIHtcbiAgICAgICAgYVtvXSA9IHRoaXNbMF07XG4gICAgICAgIGFbbyArIDFdID0gdGhpc1sxXTtcbiAgICAgICAgYVtvICsgMl0gPSB0aGlzWzJdO1xuICAgICAgICByZXR1cm4gYTtcbiAgICB9XG59XG4iLCJpbXBvcnQgKiBhcyBNYXQzRnVuYyBmcm9tICcuL2Z1bmN0aW9ucy9NYXQzRnVuYy5qcyc7XG5cbmV4cG9ydCBjbGFzcyBNYXQzIGV4dGVuZHMgQXJyYXkge1xuICAgIGNvbnN0cnVjdG9yKG0wMCA9IDEsIG0wMSA9IDAsIG0wMiA9IDAsIG0xMCA9IDAsIG0xMSA9IDEsIG0xMiA9IDAsIG0yMCA9IDAsIG0yMSA9IDAsIG0yMiA9IDEpIHtcbiAgICAgICAgc3VwZXIobTAwLCBtMDEsIG0wMiwgbTEwLCBtMTEsIG0xMiwgbTIwLCBtMjEsIG0yMik7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHNldChtMDAsIG0wMSwgbTAyLCBtMTAsIG0xMSwgbTEyLCBtMjAsIG0yMSwgbTIyKSB7XG4gICAgICAgIGlmIChtMDAubGVuZ3RoKSByZXR1cm4gdGhpcy5jb3B5KG0wMCk7XG4gICAgICAgIE1hdDNGdW5jLnNldCh0aGlzLCBtMDAsIG0wMSwgbTAyLCBtMTAsIG0xMSwgbTEyLCBtMjAsIG0yMSwgbTIyKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgdHJhbnNsYXRlKHYsIG0gPSB0aGlzKSB7XG4gICAgICAgIE1hdDNGdW5jLnRyYW5zbGF0ZSh0aGlzLCBtLCB2KTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgcm90YXRlKHYsIG0gPSB0aGlzKSB7XG4gICAgICAgIE1hdDNGdW5jLnJvdGF0ZSh0aGlzLCBtLCB2KTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgc2NhbGUodiwgbSA9IHRoaXMpIHtcbiAgICAgICAgTWF0M0Z1bmMuc2NhbGUodGhpcywgbSwgdik7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIG11bHRpcGx5KG1hLCBtYikge1xuICAgICAgICBpZiAobWIpIHtcbiAgICAgICAgICAgIE1hdDNGdW5jLm11bHRpcGx5KHRoaXMsIG1hLCBtYik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBNYXQzRnVuYy5tdWx0aXBseSh0aGlzLCB0aGlzLCBtYSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgaWRlbnRpdHkoKSB7XG4gICAgICAgIE1hdDNGdW5jLmlkZW50aXR5KHRoaXMpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBjb3B5KG0pIHtcbiAgICAgICAgTWF0M0Z1bmMuY29weSh0aGlzLCBtKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgZnJvbU1hdHJpeDQobSkge1xuICAgICAgICBNYXQzRnVuYy5mcm9tTWF0NCh0aGlzLCBtKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgZnJvbVF1YXRlcm5pb24ocSkge1xuICAgICAgICBNYXQzRnVuYy5mcm9tUXVhdCh0aGlzLCBxKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgZnJvbUJhc2lzKHZlYzNhLCB2ZWMzYiwgdmVjM2MpIHtcbiAgICAgICAgdGhpcy5zZXQodmVjM2FbMF0sIHZlYzNhWzFdLCB2ZWMzYVsyXSwgdmVjM2JbMF0sIHZlYzNiWzFdLCB2ZWMzYlsyXSwgdmVjM2NbMF0sIHZlYzNjWzFdLCB2ZWMzY1syXSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGludmVyc2UobSA9IHRoaXMpIHtcbiAgICAgICAgTWF0M0Z1bmMuaW52ZXJ0KHRoaXMsIG0pO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBnZXROb3JtYWxNYXRyaXgobSkge1xuICAgICAgICBNYXQzRnVuYy5ub3JtYWxGcm9tTWF0NCh0aGlzLCBtKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxufVxuIiwiaW1wb3J0ICogYXMgTWF0NEZ1bmMgZnJvbSAnLi9mdW5jdGlvbnMvTWF0NEZ1bmMuanMnO1xuXG5leHBvcnQgY2xhc3MgTWF0NCBleHRlbmRzIEFycmF5IHtcbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgbTAwID0gMSxcbiAgICAgICAgbTAxID0gMCxcbiAgICAgICAgbTAyID0gMCxcbiAgICAgICAgbTAzID0gMCxcbiAgICAgICAgbTEwID0gMCxcbiAgICAgICAgbTExID0gMSxcbiAgICAgICAgbTEyID0gMCxcbiAgICAgICAgbTEzID0gMCxcbiAgICAgICAgbTIwID0gMCxcbiAgICAgICAgbTIxID0gMCxcbiAgICAgICAgbTIyID0gMSxcbiAgICAgICAgbTIzID0gMCxcbiAgICAgICAgbTMwID0gMCxcbiAgICAgICAgbTMxID0gMCxcbiAgICAgICAgbTMyID0gMCxcbiAgICAgICAgbTMzID0gMVxuICAgICkge1xuICAgICAgICBzdXBlcihtMDAsIG0wMSwgbTAyLCBtMDMsIG0xMCwgbTExLCBtMTIsIG0xMywgbTIwLCBtMjEsIG0yMiwgbTIzLCBtMzAsIG0zMSwgbTMyLCBtMzMpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBnZXQgeCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXNbMTJdO1xuICAgIH1cblxuICAgIGdldCB5KCkge1xuICAgICAgICByZXR1cm4gdGhpc1sxM107XG4gICAgfVxuXG4gICAgZ2V0IHooKSB7XG4gICAgICAgIHJldHVybiB0aGlzWzE0XTtcbiAgICB9XG5cbiAgICBnZXQgdygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXNbMTVdO1xuICAgIH1cblxuICAgIHNldCB4KHYpIHtcbiAgICAgICAgdGhpc1sxMl0gPSB2O1xuICAgIH1cblxuICAgIHNldCB5KHYpIHtcbiAgICAgICAgdGhpc1sxM10gPSB2O1xuICAgIH1cblxuICAgIHNldCB6KHYpIHtcbiAgICAgICAgdGhpc1sxNF0gPSB2O1xuICAgIH1cblxuICAgIHNldCB3KHYpIHtcbiAgICAgICAgdGhpc1sxNV0gPSB2O1xuICAgIH1cblxuICAgIHNldChtMDAsIG0wMSwgbTAyLCBtMDMsIG0xMCwgbTExLCBtMTIsIG0xMywgbTIwLCBtMjEsIG0yMiwgbTIzLCBtMzAsIG0zMSwgbTMyLCBtMzMpIHtcbiAgICAgICAgaWYgKG0wMC5sZW5ndGgpIHJldHVybiB0aGlzLmNvcHkobTAwKTtcbiAgICAgICAgTWF0NEZ1bmMuc2V0KHRoaXMsIG0wMCwgbTAxLCBtMDIsIG0wMywgbTEwLCBtMTEsIG0xMiwgbTEzLCBtMjAsIG0yMSwgbTIyLCBtMjMsIG0zMCwgbTMxLCBtMzIsIG0zMyk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHRyYW5zbGF0ZSh2LCBtID0gdGhpcykge1xuICAgICAgICBNYXQ0RnVuYy50cmFuc2xhdGUodGhpcywgbSwgdik7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHJvdGF0ZSh2LCBheGlzLCBtID0gdGhpcykge1xuICAgICAgICBNYXQ0RnVuYy5yb3RhdGUodGhpcywgbSwgdiwgYXhpcyk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHNjYWxlKHYsIG0gPSB0aGlzKSB7XG4gICAgICAgIE1hdDRGdW5jLnNjYWxlKHRoaXMsIG0sIHR5cGVvZiB2ID09PSAnbnVtYmVyJyA/IFt2LCB2LCB2XSA6IHYpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBtdWx0aXBseShtYSwgbWIpIHtcbiAgICAgICAgaWYgKG1iKSB7XG4gICAgICAgICAgICBNYXQ0RnVuYy5tdWx0aXBseSh0aGlzLCBtYSwgbWIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgTWF0NEZ1bmMubXVsdGlwbHkodGhpcywgdGhpcywgbWEpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGlkZW50aXR5KCkge1xuICAgICAgICBNYXQ0RnVuYy5pZGVudGl0eSh0aGlzKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgY29weShtKSB7XG4gICAgICAgIE1hdDRGdW5jLmNvcHkodGhpcywgbSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGZyb21QZXJzcGVjdGl2ZUZydXN0cnVtKHsgbGVmdCwgcmlnaHQsIGJvdHRvbSwgdG9wLCBuZWFyLCBmYXIgfSkge1xuICAgICAgICBNYXQ0RnVuYy5wZXJzcGVjdGl2ZUZydXN0cnVtKHRoaXMsIGxlZnQsIHJpZ2h0LCB0b3AsIGJvdHRvbSwgbmVhciwgZmFyKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgZnJvbVBlcnNwZWN0aXZlKHsgZm92LCBhc3BlY3QsIG5lYXIsIGZhciB9ID0ge30pIHtcbiAgICAgICAgTWF0NEZ1bmMucGVyc3BlY3RpdmUodGhpcywgZm92LCBhc3BlY3QsIG5lYXIsIGZhcik7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGZyb21PcnRob2dvbmFsKHsgbGVmdCwgcmlnaHQsIGJvdHRvbSwgdG9wLCBuZWFyLCBmYXIgfSkge1xuICAgICAgICBNYXQ0RnVuYy5vcnRobyh0aGlzLCBsZWZ0LCByaWdodCwgYm90dG9tLCB0b3AsIG5lYXIsIGZhcik7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGZyb21RdWF0ZXJuaW9uKHEpIHtcbiAgICAgICAgTWF0NEZ1bmMuZnJvbVF1YXQodGhpcywgcSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHNldFBvc2l0aW9uKHYpIHtcbiAgICAgICAgdGhpcy54ID0gdlswXTtcbiAgICAgICAgdGhpcy55ID0gdlsxXTtcbiAgICAgICAgdGhpcy56ID0gdlsyXTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgaW52ZXJzZShtID0gdGhpcykge1xuICAgICAgICBNYXQ0RnVuYy5pbnZlcnQodGhpcywgbSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGNvbXBvc2UocSwgcG9zLCBzY2FsZSkge1xuICAgICAgICBNYXQ0RnVuYy5mcm9tUm90YXRpb25UcmFuc2xhdGlvblNjYWxlKHRoaXMsIHEsIHBvcywgc2NhbGUpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBnZXRSb3RhdGlvbihxKSB7XG4gICAgICAgIE1hdDRGdW5jLmdldFJvdGF0aW9uKHEsIHRoaXMpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBnZXRUcmFuc2xhdGlvbihwb3MpIHtcbiAgICAgICAgTWF0NEZ1bmMuZ2V0VHJhbnNsYXRpb24ocG9zLCB0aGlzKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgZ2V0U2NhbGluZyhzY2FsZSkge1xuICAgICAgICBNYXQ0RnVuYy5nZXRTY2FsaW5nKHNjYWxlLCB0aGlzKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgZ2V0TWF4U2NhbGVPbkF4aXMoKSB7XG4gICAgICAgIHJldHVybiBNYXQ0RnVuYy5nZXRNYXhTY2FsZU9uQXhpcyh0aGlzKTtcbiAgICB9XG5cbiAgICBsb29rQXQoZXllLCB0YXJnZXQsIHVwKSB7XG4gICAgICAgIE1hdDRGdW5jLnRhcmdldFRvKHRoaXMsIGV5ZSwgdGFyZ2V0LCB1cCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGRldGVybWluYW50KCkge1xuICAgICAgICByZXR1cm4gTWF0NEZ1bmMuZGV0ZXJtaW5hbnQodGhpcyk7XG4gICAgfVxuXG4gICAgZnJvbUFycmF5KGEsIG8gPSAwKSB7XG4gICAgICAgIHRoaXNbMF0gPSBhW29dO1xuICAgICAgICB0aGlzWzFdID0gYVtvICsgMV07XG4gICAgICAgIHRoaXNbMl0gPSBhW28gKyAyXTtcbiAgICAgICAgdGhpc1szXSA9IGFbbyArIDNdO1xuICAgICAgICB0aGlzWzRdID0gYVtvICsgNF07XG4gICAgICAgIHRoaXNbNV0gPSBhW28gKyA1XTtcbiAgICAgICAgdGhpc1s2XSA9IGFbbyArIDZdO1xuICAgICAgICB0aGlzWzddID0gYVtvICsgN107XG4gICAgICAgIHRoaXNbOF0gPSBhW28gKyA4XTtcbiAgICAgICAgdGhpc1s5XSA9IGFbbyArIDldO1xuICAgICAgICB0aGlzWzEwXSA9IGFbbyArIDEwXTtcbiAgICAgICAgdGhpc1sxMV0gPSBhW28gKyAxMV07XG4gICAgICAgIHRoaXNbMTJdID0gYVtvICsgMTJdO1xuICAgICAgICB0aGlzWzEzXSA9IGFbbyArIDEzXTtcbiAgICAgICAgdGhpc1sxNF0gPSBhW28gKyAxNF07XG4gICAgICAgIHRoaXNbMTVdID0gYVtvICsgMTVdO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICB0b0FycmF5KGEgPSBbXSwgbyA9IDApIHtcbiAgICAgICAgYVtvXSA9IHRoaXNbMF07XG4gICAgICAgIGFbbyArIDFdID0gdGhpc1sxXTtcbiAgICAgICAgYVtvICsgMl0gPSB0aGlzWzJdO1xuICAgICAgICBhW28gKyAzXSA9IHRoaXNbM107XG4gICAgICAgIGFbbyArIDRdID0gdGhpc1s0XTtcbiAgICAgICAgYVtvICsgNV0gPSB0aGlzWzVdO1xuICAgICAgICBhW28gKyA2XSA9IHRoaXNbNl07XG4gICAgICAgIGFbbyArIDddID0gdGhpc1s3XTtcbiAgICAgICAgYVtvICsgOF0gPSB0aGlzWzhdO1xuICAgICAgICBhW28gKyA5XSA9IHRoaXNbOV07XG4gICAgICAgIGFbbyArIDEwXSA9IHRoaXNbMTBdO1xuICAgICAgICBhW28gKyAxMV0gPSB0aGlzWzExXTtcbiAgICAgICAgYVtvICsgMTJdID0gdGhpc1sxMl07XG4gICAgICAgIGFbbyArIDEzXSA9IHRoaXNbMTNdO1xuICAgICAgICBhW28gKyAxNF0gPSB0aGlzWzE0XTtcbiAgICAgICAgYVtvICsgMTVdID0gdGhpc1sxNV07XG4gICAgICAgIHJldHVybiBhO1xuICAgIH1cbn1cbiIsImltcG9ydCAqIGFzIFF1YXRGdW5jIGZyb20gJy4vZnVuY3Rpb25zL1F1YXRGdW5jLmpzJztcblxuZXhwb3J0IGNsYXNzIFF1YXQgZXh0ZW5kcyBBcnJheSB7XG4gICAgY29uc3RydWN0b3IoeCA9IDAsIHkgPSAwLCB6ID0gMCwgdyA9IDEpIHtcbiAgICAgICAgc3VwZXIoeCwgeSwgeiwgdyk7XG4gICAgICAgIHRoaXMub25DaGFuZ2UgPSAoKSA9PiB7fTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgZ2V0IHgoKSB7XG4gICAgICAgIHJldHVybiB0aGlzWzBdO1xuICAgIH1cblxuICAgIGdldCB5KCkge1xuICAgICAgICByZXR1cm4gdGhpc1sxXTtcbiAgICB9XG5cbiAgICBnZXQgeigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXNbMl07XG4gICAgfVxuXG4gICAgZ2V0IHcoKSB7XG4gICAgICAgIHJldHVybiB0aGlzWzNdO1xuICAgIH1cblxuICAgIHNldCB4KHYpIHtcbiAgICAgICAgdGhpc1swXSA9IHY7XG4gICAgICAgIHRoaXMub25DaGFuZ2UoKTtcbiAgICB9XG5cbiAgICBzZXQgeSh2KSB7XG4gICAgICAgIHRoaXNbMV0gPSB2O1xuICAgICAgICB0aGlzLm9uQ2hhbmdlKCk7XG4gICAgfVxuXG4gICAgc2V0IHoodikge1xuICAgICAgICB0aGlzWzJdID0gdjtcbiAgICAgICAgdGhpcy5vbkNoYW5nZSgpO1xuICAgIH1cblxuICAgIHNldCB3KHYpIHtcbiAgICAgICAgdGhpc1szXSA9IHY7XG4gICAgICAgIHRoaXMub25DaGFuZ2UoKTtcbiAgICB9XG5cbiAgICBpZGVudGl0eSgpIHtcbiAgICAgICAgUXVhdEZ1bmMuaWRlbnRpdHkodGhpcyk7XG4gICAgICAgIHRoaXMub25DaGFuZ2UoKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgc2V0KHgsIHksIHosIHcpIHtcbiAgICAgICAgaWYgKHgubGVuZ3RoKSByZXR1cm4gdGhpcy5jb3B5KHgpO1xuICAgICAgICBRdWF0RnVuYy5zZXQodGhpcywgeCwgeSwgeiwgdyk7XG4gICAgICAgIHRoaXMub25DaGFuZ2UoKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgcm90YXRlWChhKSB7XG4gICAgICAgIFF1YXRGdW5jLnJvdGF0ZVgodGhpcywgdGhpcywgYSk7XG4gICAgICAgIHRoaXMub25DaGFuZ2UoKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgcm90YXRlWShhKSB7XG4gICAgICAgIFF1YXRGdW5jLnJvdGF0ZVkodGhpcywgdGhpcywgYSk7XG4gICAgICAgIHRoaXMub25DaGFuZ2UoKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgcm90YXRlWihhKSB7XG4gICAgICAgIFF1YXRGdW5jLnJvdGF0ZVoodGhpcywgdGhpcywgYSk7XG4gICAgICAgIHRoaXMub25DaGFuZ2UoKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgaW52ZXJzZShxID0gdGhpcykge1xuICAgICAgICBRdWF0RnVuYy5pbnZlcnQodGhpcywgcSk7XG4gICAgICAgIHRoaXMub25DaGFuZ2UoKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgY29uanVnYXRlKHEgPSB0aGlzKSB7XG4gICAgICAgIFF1YXRGdW5jLmNvbmp1Z2F0ZSh0aGlzLCBxKTtcbiAgICAgICAgdGhpcy5vbkNoYW5nZSgpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBjb3B5KHEpIHtcbiAgICAgICAgUXVhdEZ1bmMuY29weSh0aGlzLCBxKTtcbiAgICAgICAgdGhpcy5vbkNoYW5nZSgpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBub3JtYWxpemUocSA9IHRoaXMpIHtcbiAgICAgICAgUXVhdEZ1bmMubm9ybWFsaXplKHRoaXMsIHEpO1xuICAgICAgICB0aGlzLm9uQ2hhbmdlKCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIG11bHRpcGx5KHFBLCBxQikge1xuICAgICAgICBpZiAocUIpIHtcbiAgICAgICAgICAgIFF1YXRGdW5jLm11bHRpcGx5KHRoaXMsIHFBLCBxQik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBRdWF0RnVuYy5tdWx0aXBseSh0aGlzLCB0aGlzLCBxQSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5vbkNoYW5nZSgpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBkb3Qodikge1xuICAgICAgICByZXR1cm4gUXVhdEZ1bmMuZG90KHRoaXMsIHYpO1xuICAgIH1cblxuICAgIGZyb21NYXRyaXgzKG1hdHJpeDMpIHtcbiAgICAgICAgUXVhdEZ1bmMuZnJvbU1hdDModGhpcywgbWF0cml4Myk7XG4gICAgICAgIHRoaXMub25DaGFuZ2UoKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgZnJvbUV1bGVyKGV1bGVyKSB7XG4gICAgICAgIFF1YXRGdW5jLmZyb21FdWxlcih0aGlzLCBldWxlciwgZXVsZXIub3JkZXIpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBmcm9tQXhpc0FuZ2xlKGF4aXMsIGEpIHtcbiAgICAgICAgUXVhdEZ1bmMuc2V0QXhpc0FuZ2xlKHRoaXMsIGF4aXMsIGEpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBzbGVycChxLCB0KSB7XG4gICAgICAgIFF1YXRGdW5jLnNsZXJwKHRoaXMsIHRoaXMsIHEsIHQpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBmcm9tQXJyYXkoYSwgbyA9IDApIHtcbiAgICAgICAgdGhpc1swXSA9IGFbb107XG4gICAgICAgIHRoaXNbMV0gPSBhW28gKyAxXTtcbiAgICAgICAgdGhpc1syXSA9IGFbbyArIDJdO1xuICAgICAgICB0aGlzWzNdID0gYVtvICsgM107XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHRvQXJyYXkoYSA9IFtdLCBvID0gMCkge1xuICAgICAgICBhW29dID0gdGhpc1swXTtcbiAgICAgICAgYVtvICsgMV0gPSB0aGlzWzFdO1xuICAgICAgICBhW28gKyAyXSA9IHRoaXNbMl07XG4gICAgICAgIGFbbyArIDNdID0gdGhpc1szXTtcbiAgICAgICAgcmV0dXJuIGE7XG4gICAgfVxufVxuIiwiaW1wb3J0ICogYXMgVmVjMkZ1bmMgZnJvbSAnLi9mdW5jdGlvbnMvVmVjMkZ1bmMuanMnO1xuXG5leHBvcnQgY2xhc3MgVmVjMiBleHRlbmRzIEFycmF5IHtcbiAgICBjb25zdHJ1Y3Rvcih4ID0gMCwgeSA9IHgpIHtcbiAgICAgICAgc3VwZXIoeCwgeSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGdldCB4KCkge1xuICAgICAgICByZXR1cm4gdGhpc1swXTtcbiAgICB9XG5cbiAgICBnZXQgeSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXNbMV07XG4gICAgfVxuXG4gICAgc2V0IHgodikge1xuICAgICAgICB0aGlzWzBdID0gdjtcbiAgICB9XG5cbiAgICBzZXQgeSh2KSB7XG4gICAgICAgIHRoaXNbMV0gPSB2O1xuICAgIH1cblxuICAgIHNldCh4LCB5ID0geCkge1xuICAgICAgICBpZiAoeC5sZW5ndGgpIHJldHVybiB0aGlzLmNvcHkoeCk7XG4gICAgICAgIFZlYzJGdW5jLnNldCh0aGlzLCB4LCB5KTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgY29weSh2KSB7XG4gICAgICAgIFZlYzJGdW5jLmNvcHkodGhpcywgdik7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGFkZCh2YSwgdmIpIHtcbiAgICAgICAgaWYgKHZiKSBWZWMyRnVuYy5hZGQodGhpcywgdmEsIHZiKTtcbiAgICAgICAgZWxzZSBWZWMyRnVuYy5hZGQodGhpcywgdGhpcywgdmEpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBzdWIodmEsIHZiKSB7XG4gICAgICAgIGlmICh2YikgVmVjMkZ1bmMuc3VidHJhY3QodGhpcywgdmEsIHZiKTtcbiAgICAgICAgZWxzZSBWZWMyRnVuYy5zdWJ0cmFjdCh0aGlzLCB0aGlzLCB2YSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIG11bHRpcGx5KHYpIHtcbiAgICAgICAgaWYgKHYubGVuZ3RoKSBWZWMyRnVuYy5tdWx0aXBseSh0aGlzLCB0aGlzLCB2KTtcbiAgICAgICAgZWxzZSBWZWMyRnVuYy5zY2FsZSh0aGlzLCB0aGlzLCB2KTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgZGl2aWRlKHYpIHtcbiAgICAgICAgaWYgKHYubGVuZ3RoKSBWZWMyRnVuYy5kaXZpZGUodGhpcywgdGhpcywgdik7XG4gICAgICAgIGVsc2UgVmVjMkZ1bmMuc2NhbGUodGhpcywgdGhpcywgMSAvIHYpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBpbnZlcnNlKHYgPSB0aGlzKSB7XG4gICAgICAgIFZlYzJGdW5jLmludmVyc2UodGhpcywgdik7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8vIENhbid0IHVzZSAnbGVuZ3RoJyBhcyBBcnJheS5wcm90b3R5cGUgdXNlcyBpdFxuICAgIGxlbigpIHtcbiAgICAgICAgcmV0dXJuIFZlYzJGdW5jLmxlbmd0aCh0aGlzKTtcbiAgICB9XG5cbiAgICBkaXN0YW5jZSh2KSB7XG4gICAgICAgIGlmICh2KSByZXR1cm4gVmVjMkZ1bmMuZGlzdGFuY2UodGhpcywgdik7XG4gICAgICAgIGVsc2UgcmV0dXJuIFZlYzJGdW5jLmxlbmd0aCh0aGlzKTtcbiAgICB9XG5cbiAgICBzcXVhcmVkTGVuKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zcXVhcmVkRGlzdGFuY2UoKTtcbiAgICB9XG5cbiAgICBzcXVhcmVkRGlzdGFuY2Uodikge1xuICAgICAgICBpZiAodikgcmV0dXJuIFZlYzJGdW5jLnNxdWFyZWREaXN0YW5jZSh0aGlzLCB2KTtcbiAgICAgICAgZWxzZSByZXR1cm4gVmVjMkZ1bmMuc3F1YXJlZExlbmd0aCh0aGlzKTtcbiAgICB9XG5cbiAgICBuZWdhdGUodiA9IHRoaXMpIHtcbiAgICAgICAgVmVjMkZ1bmMubmVnYXRlKHRoaXMsIHYpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBjcm9zcyh2YSwgdmIpIHtcbiAgICAgICAgaWYgKHZiKSByZXR1cm4gVmVjMkZ1bmMuY3Jvc3ModmEsIHZiKTtcbiAgICAgICAgcmV0dXJuIFZlYzJGdW5jLmNyb3NzKHRoaXMsIHZhKTtcbiAgICB9XG5cbiAgICBzY2FsZSh2KSB7XG4gICAgICAgIFZlYzJGdW5jLnNjYWxlKHRoaXMsIHRoaXMsIHYpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBub3JtYWxpemUoKSB7XG4gICAgICAgIFZlYzJGdW5jLm5vcm1hbGl6ZSh0aGlzLCB0aGlzKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgZG90KHYpIHtcbiAgICAgICAgcmV0dXJuIFZlYzJGdW5jLmRvdCh0aGlzLCB2KTtcbiAgICB9XG5cbiAgICBlcXVhbHModikge1xuICAgICAgICByZXR1cm4gVmVjMkZ1bmMuZXhhY3RFcXVhbHModGhpcywgdik7XG4gICAgfVxuXG4gICAgYXBwbHlNYXRyaXgzKG1hdDMpIHtcbiAgICAgICAgVmVjMkZ1bmMudHJhbnNmb3JtTWF0Myh0aGlzLCB0aGlzLCBtYXQzKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgYXBwbHlNYXRyaXg0KG1hdDQpIHtcbiAgICAgICAgVmVjMkZ1bmMudHJhbnNmb3JtTWF0NCh0aGlzLCB0aGlzLCBtYXQ0KTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgbGVycCh2LCBhKSB7XG4gICAgICAgIFZlYzJGdW5jLmxlcnAodGhpcywgdGhpcywgdiwgYSk7XG4gICAgfVxuXG4gICAgY2xvbmUoKSB7XG4gICAgICAgIHJldHVybiBuZXcgVmVjMih0aGlzWzBdLCB0aGlzWzFdKTtcbiAgICB9XG5cbiAgICBmcm9tQXJyYXkoYSwgbyA9IDApIHtcbiAgICAgICAgdGhpc1swXSA9IGFbb107XG4gICAgICAgIHRoaXNbMV0gPSBhW28gKyAxXTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgdG9BcnJheShhID0gW10sIG8gPSAwKSB7XG4gICAgICAgIGFbb10gPSB0aGlzWzBdO1xuICAgICAgICBhW28gKyAxXSA9IHRoaXNbMV07XG4gICAgICAgIHJldHVybiBhO1xuICAgIH1cbn1cbiIsImltcG9ydCAqIGFzIFZlYzNGdW5jIGZyb20gJy4vZnVuY3Rpb25zL1ZlYzNGdW5jLmpzJztcblxuZXhwb3J0IGNsYXNzIFZlYzMgZXh0ZW5kcyBBcnJheSB7XG4gICAgY29uc3RydWN0b3IoeCA9IDAsIHkgPSB4LCB6ID0geCkge1xuICAgICAgICBzdXBlcih4LCB5LCB6KTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgZ2V0IHgoKSB7XG4gICAgICAgIHJldHVybiB0aGlzWzBdO1xuICAgIH1cblxuICAgIGdldCB5KCkge1xuICAgICAgICByZXR1cm4gdGhpc1sxXTtcbiAgICB9XG5cbiAgICBnZXQgeigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXNbMl07XG4gICAgfVxuXG4gICAgc2V0IHgodikge1xuICAgICAgICB0aGlzWzBdID0gdjtcbiAgICB9XG5cbiAgICBzZXQgeSh2KSB7XG4gICAgICAgIHRoaXNbMV0gPSB2O1xuICAgIH1cblxuICAgIHNldCB6KHYpIHtcbiAgICAgICAgdGhpc1syXSA9IHY7XG4gICAgfVxuXG4gICAgc2V0KHgsIHkgPSB4LCB6ID0geCkge1xuICAgICAgICBpZiAoeC5sZW5ndGgpIHJldHVybiB0aGlzLmNvcHkoeCk7XG4gICAgICAgIFZlYzNGdW5jLnNldCh0aGlzLCB4LCB5LCB6KTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgY29weSh2KSB7XG4gICAgICAgIFZlYzNGdW5jLmNvcHkodGhpcywgdik7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGFkZCh2YSwgdmIpIHtcbiAgICAgICAgaWYgKHZiKSBWZWMzRnVuYy5hZGQodGhpcywgdmEsIHZiKTtcbiAgICAgICAgZWxzZSBWZWMzRnVuYy5hZGQodGhpcywgdGhpcywgdmEpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBzdWIodmEsIHZiKSB7XG4gICAgICAgIGlmICh2YikgVmVjM0Z1bmMuc3VidHJhY3QodGhpcywgdmEsIHZiKTtcbiAgICAgICAgZWxzZSBWZWMzRnVuYy5zdWJ0cmFjdCh0aGlzLCB0aGlzLCB2YSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIG11bHRpcGx5KHYpIHtcbiAgICAgICAgaWYgKHYubGVuZ3RoKSBWZWMzRnVuYy5tdWx0aXBseSh0aGlzLCB0aGlzLCB2KTtcbiAgICAgICAgZWxzZSBWZWMzRnVuYy5zY2FsZSh0aGlzLCB0aGlzLCB2KTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgZGl2aWRlKHYpIHtcbiAgICAgICAgaWYgKHYubGVuZ3RoKSBWZWMzRnVuYy5kaXZpZGUodGhpcywgdGhpcywgdik7XG4gICAgICAgIGVsc2UgVmVjM0Z1bmMuc2NhbGUodGhpcywgdGhpcywgMSAvIHYpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBpbnZlcnNlKHYgPSB0aGlzKSB7XG4gICAgICAgIFZlYzNGdW5jLmludmVyc2UodGhpcywgdik7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8vIENhbid0IHVzZSAnbGVuZ3RoJyBhcyBBcnJheS5wcm90b3R5cGUgdXNlcyBpdFxuICAgIGxlbigpIHtcbiAgICAgICAgcmV0dXJuIFZlYzNGdW5jLmxlbmd0aCh0aGlzKTtcbiAgICB9XG5cbiAgICBkaXN0YW5jZSh2KSB7XG4gICAgICAgIGlmICh2KSByZXR1cm4gVmVjM0Z1bmMuZGlzdGFuY2UodGhpcywgdik7XG4gICAgICAgIGVsc2UgcmV0dXJuIFZlYzNGdW5jLmxlbmd0aCh0aGlzKTtcbiAgICB9XG5cbiAgICBzcXVhcmVkTGVuKCkge1xuICAgICAgICByZXR1cm4gVmVjM0Z1bmMuc3F1YXJlZExlbmd0aCh0aGlzKTtcbiAgICB9XG5cbiAgICBzcXVhcmVkRGlzdGFuY2Uodikge1xuICAgICAgICBpZiAodikgcmV0dXJuIFZlYzNGdW5jLnNxdWFyZWREaXN0YW5jZSh0aGlzLCB2KTtcbiAgICAgICAgZWxzZSByZXR1cm4gVmVjM0Z1bmMuc3F1YXJlZExlbmd0aCh0aGlzKTtcbiAgICB9XG5cbiAgICBuZWdhdGUodiA9IHRoaXMpIHtcbiAgICAgICAgVmVjM0Z1bmMubmVnYXRlKHRoaXMsIHYpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBjcm9zcyh2YSwgdmIpIHtcbiAgICAgICAgaWYgKHZiKSBWZWMzRnVuYy5jcm9zcyh0aGlzLCB2YSwgdmIpO1xuICAgICAgICBlbHNlIFZlYzNGdW5jLmNyb3NzKHRoaXMsIHRoaXMsIHZhKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgc2NhbGUodikge1xuICAgICAgICBWZWMzRnVuYy5zY2FsZSh0aGlzLCB0aGlzLCB2KTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgbm9ybWFsaXplKCkge1xuICAgICAgICBWZWMzRnVuYy5ub3JtYWxpemUodGhpcywgdGhpcyk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGRvdCh2KSB7XG4gICAgICAgIHJldHVybiBWZWMzRnVuYy5kb3QodGhpcywgdik7XG4gICAgfVxuXG4gICAgZXF1YWxzKHYpIHtcbiAgICAgICAgcmV0dXJuIFZlYzNGdW5jLmV4YWN0RXF1YWxzKHRoaXMsIHYpO1xuICAgIH1cblxuICAgIGFwcGx5TWF0cml4NChtYXQ0KSB7XG4gICAgICAgIFZlYzNGdW5jLnRyYW5zZm9ybU1hdDQodGhpcywgdGhpcywgbWF0NCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHNjYWxlUm90YXRlTWF0cml4NChtYXQ0KSB7XG4gICAgICAgIFZlYzNGdW5jLnNjYWxlUm90YXRlTWF0NCh0aGlzLCB0aGlzLCBtYXQ0KTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgYXBwbHlRdWF0ZXJuaW9uKHEpIHtcbiAgICAgICAgVmVjM0Z1bmMudHJhbnNmb3JtUXVhdCh0aGlzLCB0aGlzLCBxKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgYW5nbGUodikge1xuICAgICAgICByZXR1cm4gVmVjM0Z1bmMuYW5nbGUodGhpcywgdik7XG4gICAgfVxuXG4gICAgbGVycCh2LCB0KSB7XG4gICAgICAgIFZlYzNGdW5jLmxlcnAodGhpcywgdGhpcywgdiwgdCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGNsb25lKCkge1xuICAgICAgICByZXR1cm4gbmV3IFZlYzModGhpc1swXSwgdGhpc1sxXSwgdGhpc1syXSk7XG4gICAgfVxuXG4gICAgZnJvbUFycmF5KGEsIG8gPSAwKSB7XG4gICAgICAgIHRoaXNbMF0gPSBhW29dO1xuICAgICAgICB0aGlzWzFdID0gYVtvICsgMV07XG4gICAgICAgIHRoaXNbMl0gPSBhW28gKyAyXTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgdG9BcnJheShhID0gW10sIG8gPSAwKSB7XG4gICAgICAgIGFbb10gPSB0aGlzWzBdO1xuICAgICAgICBhW28gKyAxXSA9IHRoaXNbMV07XG4gICAgICAgIGFbbyArIDJdID0gdGhpc1syXTtcbiAgICAgICAgcmV0dXJuIGE7XG4gICAgfVxuXG4gICAgdHJhbnNmb3JtRGlyZWN0aW9uKG1hdDQpIHtcbiAgICAgICAgY29uc3QgeCA9IHRoaXNbMF07XG4gICAgICAgIGNvbnN0IHkgPSB0aGlzWzFdO1xuICAgICAgICBjb25zdCB6ID0gdGhpc1syXTtcblxuICAgICAgICB0aGlzWzBdID0gbWF0NFswXSAqIHggKyBtYXQ0WzRdICogeSArIG1hdDRbOF0gKiB6O1xuICAgICAgICB0aGlzWzFdID0gbWF0NFsxXSAqIHggKyBtYXQ0WzVdICogeSArIG1hdDRbOV0gKiB6O1xuICAgICAgICB0aGlzWzJdID0gbWF0NFsyXSAqIHggKyBtYXQ0WzZdICogeSArIG1hdDRbMTBdICogejtcblxuICAgICAgICByZXR1cm4gdGhpcy5ub3JtYWxpemUoKTtcbiAgICB9XG59XG4iLCJpbXBvcnQgKiBhcyBWZWM0RnVuYyBmcm9tICcuL2Z1bmN0aW9ucy9WZWM0RnVuYy5qcyc7XG5cbmV4cG9ydCBjbGFzcyBWZWM0IGV4dGVuZHMgQXJyYXkge1xuICAgIGNvbnN0cnVjdG9yKHggPSAwLCB5ID0geCwgeiA9IHgsIHcgPSB4KSB7XG4gICAgICAgIHN1cGVyKHgsIHksIHosIHcpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBnZXQgeCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXNbMF07XG4gICAgfVxuXG4gICAgZ2V0IHkoKSB7XG4gICAgICAgIHJldHVybiB0aGlzWzFdO1xuICAgIH1cblxuICAgIGdldCB6KCkge1xuICAgICAgICByZXR1cm4gdGhpc1syXTtcbiAgICB9XG5cbiAgICBnZXQgdygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXNbM107XG4gICAgfVxuXG4gICAgc2V0IHgodikge1xuICAgICAgICB0aGlzWzBdID0gdjtcbiAgICB9XG5cbiAgICBzZXQgeSh2KSB7XG4gICAgICAgIHRoaXNbMV0gPSB2O1xuICAgIH1cblxuICAgIHNldCB6KHYpIHtcbiAgICAgICAgdGhpc1syXSA9IHY7XG4gICAgfVxuXG4gICAgc2V0IHcodikge1xuICAgICAgICB0aGlzWzNdID0gdjtcbiAgICB9XG5cbiAgICBzZXQoeCwgeSwgeiwgdykge1xuICAgICAgICBpZiAoeC5sZW5ndGgpIHJldHVybiB0aGlzLmNvcHkoeCk7XG4gICAgICAgIFZlYzRGdW5jLnNldCh0aGlzLCB4LCB5LCB6LCB3KTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgY29weSh2KSB7XG4gICAgICAgIFZlYzRGdW5jLmNvcHkodGhpcywgdik7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIG5vcm1hbGl6ZSgpIHtcbiAgICAgICAgVmVjNEZ1bmMubm9ybWFsaXplKHRoaXMsIHRoaXMpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBmcm9tQXJyYXkoYSwgbyA9IDApIHtcbiAgICAgICAgdGhpc1swXSA9IGFbb107XG4gICAgICAgIHRoaXNbMV0gPSBhW28gKyAxXTtcbiAgICAgICAgdGhpc1syXSA9IGFbbyArIDJdO1xuICAgICAgICB0aGlzWzNdID0gYVtvICsgM107XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHRvQXJyYXkoYSA9IFtdLCBvID0gMCkge1xuICAgICAgICBhW29dID0gdGhpc1swXTtcbiAgICAgICAgYVtvICsgMV0gPSB0aGlzWzFdO1xuICAgICAgICBhW28gKyAyXSA9IHRoaXNbMl07XG4gICAgICAgIGFbbyArIDNdID0gdGhpc1szXTtcbiAgICAgICAgcmV0dXJuIGE7XG4gICAgfVxufVxuIiwiY29uc3QgTkFNRVMgPSB7XG4gICAgYmxhY2s6ICcjMDAwMDAwJyxcbiAgICB3aGl0ZTogJyNmZmZmZmYnLFxuICAgIHJlZDogJyNmZjAwMDAnLFxuICAgIGdyZWVuOiAnIzAwZmYwMCcsXG4gICAgYmx1ZTogJyMwMDAwZmYnLFxuICAgIGZ1Y2hzaWE6ICcjZmYwMGZmJyxcbiAgICBjeWFuOiAnIzAwZmZmZicsXG4gICAgeWVsbG93OiAnI2ZmZmYwMCcsXG4gICAgb3JhbmdlOiAnI2ZmODAwMCcsXG59O1xuXG5leHBvcnQgZnVuY3Rpb24gaGV4VG9SR0IoaGV4KSB7XG4gICAgaWYgKGhleC5sZW5ndGggPT09IDQpIGhleCA9IGhleFswXSArIGhleFsxXSArIGhleFsxXSArIGhleFsyXSArIGhleFsyXSArIGhleFszXSArIGhleFszXTtcbiAgICBjb25zdCByZ2IgPSAvXiM/KFthLWZcXGRdezJ9KShbYS1mXFxkXXsyfSkoW2EtZlxcZF17Mn0pJC9pLmV4ZWMoaGV4KTtcbiAgICBpZiAoIXJnYikgY29uc29sZS53YXJuKGBVbmFibGUgdG8gY29udmVydCBoZXggc3RyaW5nICR7aGV4fSB0byByZ2IgdmFsdWVzYCk7XG4gICAgcmV0dXJuIFtwYXJzZUludChyZ2JbMV0sIDE2KSAvIDI1NSwgcGFyc2VJbnQocmdiWzJdLCAxNikgLyAyNTUsIHBhcnNlSW50KHJnYlszXSwgMTYpIC8gMjU1XTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG51bWJlclRvUkdCKG51bSkge1xuICAgIG51bSA9IHBhcnNlSW50KG51bSk7XG4gICAgcmV0dXJuIFsoKG51bSA+PiAxNikgJiAyNTUpIC8gMjU1LCAoKG51bSA+PiA4KSAmIDI1NSkgLyAyNTUsIChudW0gJiAyNTUpIC8gMjU1XTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlQ29sb3IoY29sb3IpIHtcbiAgICAvLyBFbXB0eVxuICAgIGlmIChjb2xvciA9PT0gdW5kZWZpbmVkKSByZXR1cm4gWzAsIDAsIDBdO1xuXG4gICAgLy8gRGVjaW1hbFxuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAzKSByZXR1cm4gYXJndW1lbnRzO1xuXG4gICAgLy8gTnVtYmVyXG4gICAgaWYgKCFpc05hTihjb2xvcikpIHJldHVybiBudW1iZXJUb1JHQihjb2xvcik7XG5cbiAgICAvLyBIZXhcbiAgICBpZiAoY29sb3JbMF0gPT09ICcjJykgcmV0dXJuIGhleFRvUkdCKGNvbG9yKTtcblxuICAgIC8vIE5hbWVzXG4gICAgaWYgKE5BTUVTW2NvbG9yLnRvTG93ZXJDYXNlKCldKSByZXR1cm4gaGV4VG9SR0IoTkFNRVNbY29sb3IudG9Mb3dlckNhc2UoKV0pO1xuXG4gICAgY29uc29sZS53YXJuKCdDb2xvciBmb3JtYXQgbm90IHJlY29nbmlzZWQnKTtcbiAgICByZXR1cm4gWzAsIDAsIDBdO1xufVxuIiwiLy8gYXNzdW1lcyB0aGUgdXBwZXIgM3gzIG9mIG0gaXMgYSBwdXJlIHJvdGF0aW9uIG1hdHJpeCAoaS5lLCB1bnNjYWxlZClcbmV4cG9ydCBmdW5jdGlvbiBmcm9tUm90YXRpb25NYXRyaXgob3V0LCBtLCBvcmRlciA9ICdZWFonKSB7XG4gICAgaWYgKG9yZGVyID09PSAnWFlaJykge1xuICAgICAgICBvdXRbMV0gPSBNYXRoLmFzaW4oTWF0aC5taW4oTWF0aC5tYXgobVs4XSwgLTEpLCAxKSk7XG4gICAgICAgIGlmIChNYXRoLmFicyhtWzhdKSA8IDAuOTk5OTkpIHtcbiAgICAgICAgICAgIG91dFswXSA9IE1hdGguYXRhbjIoLW1bOV0sIG1bMTBdKTtcbiAgICAgICAgICAgIG91dFsyXSA9IE1hdGguYXRhbjIoLW1bNF0sIG1bMF0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgb3V0WzBdID0gTWF0aC5hdGFuMihtWzZdLCBtWzVdKTtcbiAgICAgICAgICAgIG91dFsyXSA9IDA7XG4gICAgICAgIH1cbiAgICB9IGVsc2UgaWYgKG9yZGVyID09PSAnWVhaJykge1xuICAgICAgICBvdXRbMF0gPSBNYXRoLmFzaW4oLU1hdGgubWluKE1hdGgubWF4KG1bOV0sIC0xKSwgMSkpO1xuICAgICAgICBpZiAoTWF0aC5hYnMobVs5XSkgPCAwLjk5OTk5KSB7XG4gICAgICAgICAgICBvdXRbMV0gPSBNYXRoLmF0YW4yKG1bOF0sIG1bMTBdKTtcbiAgICAgICAgICAgIG91dFsyXSA9IE1hdGguYXRhbjIobVsxXSwgbVs1XSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBvdXRbMV0gPSBNYXRoLmF0YW4yKC1tWzJdLCBtWzBdKTtcbiAgICAgICAgICAgIG91dFsyXSA9IDA7XG4gICAgICAgIH1cbiAgICB9IGVsc2UgaWYgKG9yZGVyID09PSAnWlhZJykge1xuICAgICAgICBvdXRbMF0gPSBNYXRoLmFzaW4oTWF0aC5taW4oTWF0aC5tYXgobVs2XSwgLTEpLCAxKSk7XG4gICAgICAgIGlmIChNYXRoLmFicyhtWzZdKSA8IDAuOTk5OTkpIHtcbiAgICAgICAgICAgIG91dFsxXSA9IE1hdGguYXRhbjIoLW1bMl0sIG1bMTBdKTtcbiAgICAgICAgICAgIG91dFsyXSA9IE1hdGguYXRhbjIoLW1bNF0sIG1bNV0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgb3V0WzFdID0gMDtcbiAgICAgICAgICAgIG91dFsyXSA9IE1hdGguYXRhbjIobVsxXSwgbVswXSk7XG4gICAgICAgIH1cbiAgICB9IGVsc2UgaWYgKG9yZGVyID09PSAnWllYJykge1xuICAgICAgICBvdXRbMV0gPSBNYXRoLmFzaW4oLU1hdGgubWluKE1hdGgubWF4KG1bMl0sIC0xKSwgMSkpO1xuICAgICAgICBpZiAoTWF0aC5hYnMobVsyXSkgPCAwLjk5OTk5KSB7XG4gICAgICAgICAgICBvdXRbMF0gPSBNYXRoLmF0YW4yKG1bNl0sIG1bMTBdKTtcbiAgICAgICAgICAgIG91dFsyXSA9IE1hdGguYXRhbjIobVsxXSwgbVswXSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBvdXRbMF0gPSAwO1xuICAgICAgICAgICAgb3V0WzJdID0gTWF0aC5hdGFuMigtbVs0XSwgbVs1XSk7XG4gICAgICAgIH1cbiAgICB9IGVsc2UgaWYgKG9yZGVyID09PSAnWVpYJykge1xuICAgICAgICBvdXRbMl0gPSBNYXRoLmFzaW4oTWF0aC5taW4oTWF0aC5tYXgobVsxXSwgLTEpLCAxKSk7XG4gICAgICAgIGlmIChNYXRoLmFicyhtWzFdKSA8IDAuOTk5OTkpIHtcbiAgICAgICAgICAgIG91dFswXSA9IE1hdGguYXRhbjIoLW1bOV0sIG1bNV0pO1xuICAgICAgICAgICAgb3V0WzFdID0gTWF0aC5hdGFuMigtbVsyXSwgbVswXSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBvdXRbMF0gPSAwO1xuICAgICAgICAgICAgb3V0WzFdID0gTWF0aC5hdGFuMihtWzhdLCBtWzEwXSk7XG4gICAgICAgIH1cbiAgICB9IGVsc2UgaWYgKG9yZGVyID09PSAnWFpZJykge1xuICAgICAgICBvdXRbMl0gPSBNYXRoLmFzaW4oLU1hdGgubWluKE1hdGgubWF4KG1bNF0sIC0xKSwgMSkpO1xuICAgICAgICBpZiAoTWF0aC5hYnMobVs0XSkgPCAwLjk5OTk5KSB7XG4gICAgICAgICAgICBvdXRbMF0gPSBNYXRoLmF0YW4yKG1bNl0sIG1bNV0pO1xuICAgICAgICAgICAgb3V0WzFdID0gTWF0aC5hdGFuMihtWzhdLCBtWzBdKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG91dFswXSA9IE1hdGguYXRhbjIoLW1bOV0sIG1bMTBdKTtcbiAgICAgICAgICAgIG91dFsxXSA9IDA7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gb3V0O1xufVxuIiwiY29uc3QgRVBTSUxPTiA9IDAuMDAwMDAxO1xuXG4vKipcbiAqIENvcGllcyB0aGUgdXBwZXItbGVmdCAzeDMgdmFsdWVzIGludG8gdGhlIGdpdmVuIG1hdDMuXG4gKlxuICogQHBhcmFtIHttYXQzfSBvdXQgdGhlIHJlY2VpdmluZyAzeDMgbWF0cml4XG4gKiBAcGFyYW0ge21hdDR9IGEgICB0aGUgc291cmNlIDR4NCBtYXRyaXhcbiAqIEByZXR1cm5zIHttYXQzfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZyb21NYXQ0KG91dCwgYSkge1xuICAgIG91dFswXSA9IGFbMF07XG4gICAgb3V0WzFdID0gYVsxXTtcbiAgICBvdXRbMl0gPSBhWzJdO1xuICAgIG91dFszXSA9IGFbNF07XG4gICAgb3V0WzRdID0gYVs1XTtcbiAgICBvdXRbNV0gPSBhWzZdO1xuICAgIG91dFs2XSA9IGFbOF07XG4gICAgb3V0WzddID0gYVs5XTtcbiAgICBvdXRbOF0gPSBhWzEwXTtcbiAgICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIENhbGN1bGF0ZXMgYSAzeDMgbWF0cml4IGZyb20gdGhlIGdpdmVuIHF1YXRlcm5pb25cbiAqXG4gKiBAcGFyYW0ge21hdDN9IG91dCBtYXQzIHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XG4gKiBAcGFyYW0ge3F1YXR9IHEgUXVhdGVybmlvbiB0byBjcmVhdGUgbWF0cml4IGZyb21cbiAqXG4gKiBAcmV0dXJucyB7bWF0M30gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmcm9tUXVhdChvdXQsIHEpIHtcbiAgICBsZXQgeCA9IHFbMF0sXG4gICAgICAgIHkgPSBxWzFdLFxuICAgICAgICB6ID0gcVsyXSxcbiAgICAgICAgdyA9IHFbM107XG4gICAgbGV0IHgyID0geCArIHg7XG4gICAgbGV0IHkyID0geSArIHk7XG4gICAgbGV0IHoyID0geiArIHo7XG5cbiAgICBsZXQgeHggPSB4ICogeDI7XG4gICAgbGV0IHl4ID0geSAqIHgyO1xuICAgIGxldCB5eSA9IHkgKiB5MjtcbiAgICBsZXQgenggPSB6ICogeDI7XG4gICAgbGV0IHp5ID0geiAqIHkyO1xuICAgIGxldCB6eiA9IHogKiB6MjtcbiAgICBsZXQgd3ggPSB3ICogeDI7XG4gICAgbGV0IHd5ID0gdyAqIHkyO1xuICAgIGxldCB3eiA9IHcgKiB6MjtcblxuICAgIG91dFswXSA9IDEgLSB5eSAtIHp6O1xuICAgIG91dFszXSA9IHl4IC0gd3o7XG4gICAgb3V0WzZdID0genggKyB3eTtcblxuICAgIG91dFsxXSA9IHl4ICsgd3o7XG4gICAgb3V0WzRdID0gMSAtIHh4IC0geno7XG4gICAgb3V0WzddID0genkgLSB3eDtcblxuICAgIG91dFsyXSA9IHp4IC0gd3k7XG4gICAgb3V0WzVdID0genkgKyB3eDtcbiAgICBvdXRbOF0gPSAxIC0geHggLSB5eTtcblxuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogQ29weSB0aGUgdmFsdWVzIGZyb20gb25lIG1hdDMgdG8gYW5vdGhlclxuICpcbiAqIEBwYXJhbSB7bWF0M30gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDN9IGEgdGhlIHNvdXJjZSBtYXRyaXhcbiAqIEByZXR1cm5zIHttYXQzfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvcHkob3V0LCBhKSB7XG4gICAgb3V0WzBdID0gYVswXTtcbiAgICBvdXRbMV0gPSBhWzFdO1xuICAgIG91dFsyXSA9IGFbMl07XG4gICAgb3V0WzNdID0gYVszXTtcbiAgICBvdXRbNF0gPSBhWzRdO1xuICAgIG91dFs1XSA9IGFbNV07XG4gICAgb3V0WzZdID0gYVs2XTtcbiAgICBvdXRbN10gPSBhWzddO1xuICAgIG91dFs4XSA9IGFbOF07XG4gICAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBTZXQgdGhlIGNvbXBvbmVudHMgb2YgYSBtYXQzIHRvIHRoZSBnaXZlbiB2YWx1ZXNcbiAqXG4gKiBAcGFyYW0ge21hdDN9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHJldHVybnMge21hdDN9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gc2V0KG91dCwgbTAwLCBtMDEsIG0wMiwgbTEwLCBtMTEsIG0xMiwgbTIwLCBtMjEsIG0yMikge1xuICAgIG91dFswXSA9IG0wMDtcbiAgICBvdXRbMV0gPSBtMDE7XG4gICAgb3V0WzJdID0gbTAyO1xuICAgIG91dFszXSA9IG0xMDtcbiAgICBvdXRbNF0gPSBtMTE7XG4gICAgb3V0WzVdID0gbTEyO1xuICAgIG91dFs2XSA9IG0yMDtcbiAgICBvdXRbN10gPSBtMjE7XG4gICAgb3V0WzhdID0gbTIyO1xuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogU2V0IGEgbWF0MyB0byB0aGUgaWRlbnRpdHkgbWF0cml4XG4gKlxuICogQHBhcmFtIHttYXQzfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEByZXR1cm5zIHttYXQzfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlkZW50aXR5KG91dCkge1xuICAgIG91dFswXSA9IDE7XG4gICAgb3V0WzFdID0gMDtcbiAgICBvdXRbMl0gPSAwO1xuICAgIG91dFszXSA9IDA7XG4gICAgb3V0WzRdID0gMTtcbiAgICBvdXRbNV0gPSAwO1xuICAgIG91dFs2XSA9IDA7XG4gICAgb3V0WzddID0gMDtcbiAgICBvdXRbOF0gPSAxO1xuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogVHJhbnNwb3NlIHRoZSB2YWx1ZXMgb2YgYSBtYXQzXG4gKlxuICogQHBhcmFtIHttYXQzfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0M30gYSB0aGUgc291cmNlIG1hdHJpeFxuICogQHJldHVybnMge21hdDN9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gdHJhbnNwb3NlKG91dCwgYSkge1xuICAgIC8vIElmIHdlIGFyZSB0cmFuc3Bvc2luZyBvdXJzZWx2ZXMgd2UgY2FuIHNraXAgYSBmZXcgc3RlcHMgYnV0IGhhdmUgdG8gY2FjaGUgc29tZSB2YWx1ZXNcbiAgICBpZiAob3V0ID09PSBhKSB7XG4gICAgICAgIGxldCBhMDEgPSBhWzFdLFxuICAgICAgICAgICAgYTAyID0gYVsyXSxcbiAgICAgICAgICAgIGExMiA9IGFbNV07XG4gICAgICAgIG91dFsxXSA9IGFbM107XG4gICAgICAgIG91dFsyXSA9IGFbNl07XG4gICAgICAgIG91dFszXSA9IGEwMTtcbiAgICAgICAgb3V0WzVdID0gYVs3XTtcbiAgICAgICAgb3V0WzZdID0gYTAyO1xuICAgICAgICBvdXRbN10gPSBhMTI7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgb3V0WzBdID0gYVswXTtcbiAgICAgICAgb3V0WzFdID0gYVszXTtcbiAgICAgICAgb3V0WzJdID0gYVs2XTtcbiAgICAgICAgb3V0WzNdID0gYVsxXTtcbiAgICAgICAgb3V0WzRdID0gYVs0XTtcbiAgICAgICAgb3V0WzVdID0gYVs3XTtcbiAgICAgICAgb3V0WzZdID0gYVsyXTtcbiAgICAgICAgb3V0WzddID0gYVs1XTtcbiAgICAgICAgb3V0WzhdID0gYVs4XTtcbiAgICB9XG5cbiAgICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIEludmVydHMgYSBtYXQzXG4gKlxuICogQHBhcmFtIHttYXQzfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0M30gYSB0aGUgc291cmNlIG1hdHJpeFxuICogQHJldHVybnMge21hdDN9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gaW52ZXJ0KG91dCwgYSkge1xuICAgIGxldCBhMDAgPSBhWzBdLFxuICAgICAgICBhMDEgPSBhWzFdLFxuICAgICAgICBhMDIgPSBhWzJdO1xuICAgIGxldCBhMTAgPSBhWzNdLFxuICAgICAgICBhMTEgPSBhWzRdLFxuICAgICAgICBhMTIgPSBhWzVdO1xuICAgIGxldCBhMjAgPSBhWzZdLFxuICAgICAgICBhMjEgPSBhWzddLFxuICAgICAgICBhMjIgPSBhWzhdO1xuXG4gICAgbGV0IGIwMSA9IGEyMiAqIGExMSAtIGExMiAqIGEyMTtcbiAgICBsZXQgYjExID0gLWEyMiAqIGExMCArIGExMiAqIGEyMDtcbiAgICBsZXQgYjIxID0gYTIxICogYTEwIC0gYTExICogYTIwO1xuXG4gICAgLy8gQ2FsY3VsYXRlIHRoZSBkZXRlcm1pbmFudFxuICAgIGxldCBkZXQgPSBhMDAgKiBiMDEgKyBhMDEgKiBiMTEgKyBhMDIgKiBiMjE7XG5cbiAgICBpZiAoIWRldCkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgZGV0ID0gMS4wIC8gZGV0O1xuXG4gICAgb3V0WzBdID0gYjAxICogZGV0O1xuICAgIG91dFsxXSA9ICgtYTIyICogYTAxICsgYTAyICogYTIxKSAqIGRldDtcbiAgICBvdXRbMl0gPSAoYTEyICogYTAxIC0gYTAyICogYTExKSAqIGRldDtcbiAgICBvdXRbM10gPSBiMTEgKiBkZXQ7XG4gICAgb3V0WzRdID0gKGEyMiAqIGEwMCAtIGEwMiAqIGEyMCkgKiBkZXQ7XG4gICAgb3V0WzVdID0gKC1hMTIgKiBhMDAgKyBhMDIgKiBhMTApICogZGV0O1xuICAgIG91dFs2XSA9IGIyMSAqIGRldDtcbiAgICBvdXRbN10gPSAoLWEyMSAqIGEwMCArIGEwMSAqIGEyMCkgKiBkZXQ7XG4gICAgb3V0WzhdID0gKGExMSAqIGEwMCAtIGEwMSAqIGExMCkgKiBkZXQ7XG4gICAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBkZXRlcm1pbmFudCBvZiBhIG1hdDNcbiAqXG4gKiBAcGFyYW0ge21hdDN9IGEgdGhlIHNvdXJjZSBtYXRyaXhcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IGRldGVybWluYW50IG9mIGFcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRldGVybWluYW50KGEpIHtcbiAgICBsZXQgYTAwID0gYVswXSxcbiAgICAgICAgYTAxID0gYVsxXSxcbiAgICAgICAgYTAyID0gYVsyXTtcbiAgICBsZXQgYTEwID0gYVszXSxcbiAgICAgICAgYTExID0gYVs0XSxcbiAgICAgICAgYTEyID0gYVs1XTtcbiAgICBsZXQgYTIwID0gYVs2XSxcbiAgICAgICAgYTIxID0gYVs3XSxcbiAgICAgICAgYTIyID0gYVs4XTtcblxuICAgIHJldHVybiBhMDAgKiAoYTIyICogYTExIC0gYTEyICogYTIxKSArIGEwMSAqICgtYTIyICogYTEwICsgYTEyICogYTIwKSArIGEwMiAqIChhMjEgKiBhMTAgLSBhMTEgKiBhMjApO1xufVxuXG4vKipcbiAqIE11bHRpcGxpZXMgdHdvIG1hdDMnc1xuICpcbiAqIEBwYXJhbSB7bWF0M30gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7bWF0M30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHttYXQzfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG11bHRpcGx5KG91dCwgYSwgYikge1xuICAgIGxldCBhMDAgPSBhWzBdLFxuICAgICAgICBhMDEgPSBhWzFdLFxuICAgICAgICBhMDIgPSBhWzJdO1xuICAgIGxldCBhMTAgPSBhWzNdLFxuICAgICAgICBhMTEgPSBhWzRdLFxuICAgICAgICBhMTIgPSBhWzVdO1xuICAgIGxldCBhMjAgPSBhWzZdLFxuICAgICAgICBhMjEgPSBhWzddLFxuICAgICAgICBhMjIgPSBhWzhdO1xuXG4gICAgbGV0IGIwMCA9IGJbMF0sXG4gICAgICAgIGIwMSA9IGJbMV0sXG4gICAgICAgIGIwMiA9IGJbMl07XG4gICAgbGV0IGIxMCA9IGJbM10sXG4gICAgICAgIGIxMSA9IGJbNF0sXG4gICAgICAgIGIxMiA9IGJbNV07XG4gICAgbGV0IGIyMCA9IGJbNl0sXG4gICAgICAgIGIyMSA9IGJbN10sXG4gICAgICAgIGIyMiA9IGJbOF07XG5cbiAgICBvdXRbMF0gPSBiMDAgKiBhMDAgKyBiMDEgKiBhMTAgKyBiMDIgKiBhMjA7XG4gICAgb3V0WzFdID0gYjAwICogYTAxICsgYjAxICogYTExICsgYjAyICogYTIxO1xuICAgIG91dFsyXSA9IGIwMCAqIGEwMiArIGIwMSAqIGExMiArIGIwMiAqIGEyMjtcblxuICAgIG91dFszXSA9IGIxMCAqIGEwMCArIGIxMSAqIGExMCArIGIxMiAqIGEyMDtcbiAgICBvdXRbNF0gPSBiMTAgKiBhMDEgKyBiMTEgKiBhMTEgKyBiMTIgKiBhMjE7XG4gICAgb3V0WzVdID0gYjEwICogYTAyICsgYjExICogYTEyICsgYjEyICogYTIyO1xuXG4gICAgb3V0WzZdID0gYjIwICogYTAwICsgYjIxICogYTEwICsgYjIyICogYTIwO1xuICAgIG91dFs3XSA9IGIyMCAqIGEwMSArIGIyMSAqIGExMSArIGIyMiAqIGEyMTtcbiAgICBvdXRbOF0gPSBiMjAgKiBhMDIgKyBiMjEgKiBhMTIgKyBiMjIgKiBhMjI7XG4gICAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBUcmFuc2xhdGUgYSBtYXQzIGJ5IHRoZSBnaXZlbiB2ZWN0b3JcbiAqXG4gKiBAcGFyYW0ge21hdDN9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQzfSBhIHRoZSBtYXRyaXggdG8gdHJhbnNsYXRlXG4gKiBAcGFyYW0ge3ZlYzJ9IHYgdmVjdG9yIHRvIHRyYW5zbGF0ZSBieVxuICogQHJldHVybnMge21hdDN9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gdHJhbnNsYXRlKG91dCwgYSwgdikge1xuICAgIGxldCBhMDAgPSBhWzBdLFxuICAgICAgICBhMDEgPSBhWzFdLFxuICAgICAgICBhMDIgPSBhWzJdLFxuICAgICAgICBhMTAgPSBhWzNdLFxuICAgICAgICBhMTEgPSBhWzRdLFxuICAgICAgICBhMTIgPSBhWzVdLFxuICAgICAgICBhMjAgPSBhWzZdLFxuICAgICAgICBhMjEgPSBhWzddLFxuICAgICAgICBhMjIgPSBhWzhdLFxuICAgICAgICB4ID0gdlswXSxcbiAgICAgICAgeSA9IHZbMV07XG5cbiAgICBvdXRbMF0gPSBhMDA7XG4gICAgb3V0WzFdID0gYTAxO1xuICAgIG91dFsyXSA9IGEwMjtcblxuICAgIG91dFszXSA9IGExMDtcbiAgICBvdXRbNF0gPSBhMTE7XG4gICAgb3V0WzVdID0gYTEyO1xuXG4gICAgb3V0WzZdID0geCAqIGEwMCArIHkgKiBhMTAgKyBhMjA7XG4gICAgb3V0WzddID0geCAqIGEwMSArIHkgKiBhMTEgKyBhMjE7XG4gICAgb3V0WzhdID0geCAqIGEwMiArIHkgKiBhMTIgKyBhMjI7XG4gICAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBSb3RhdGVzIGEgbWF0MyBieSB0aGUgZ2l2ZW4gYW5nbGVcbiAqXG4gKiBAcGFyYW0ge21hdDN9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQzfSBhIHRoZSBtYXRyaXggdG8gcm90YXRlXG4gKiBAcGFyYW0ge051bWJlcn0gcmFkIHRoZSBhbmdsZSB0byByb3RhdGUgdGhlIG1hdHJpeCBieVxuICogQHJldHVybnMge21hdDN9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gcm90YXRlKG91dCwgYSwgcmFkKSB7XG4gICAgbGV0IGEwMCA9IGFbMF0sXG4gICAgICAgIGEwMSA9IGFbMV0sXG4gICAgICAgIGEwMiA9IGFbMl0sXG4gICAgICAgIGExMCA9IGFbM10sXG4gICAgICAgIGExMSA9IGFbNF0sXG4gICAgICAgIGExMiA9IGFbNV0sXG4gICAgICAgIGEyMCA9IGFbNl0sXG4gICAgICAgIGEyMSA9IGFbN10sXG4gICAgICAgIGEyMiA9IGFbOF0sXG4gICAgICAgIHMgPSBNYXRoLnNpbihyYWQpLFxuICAgICAgICBjID0gTWF0aC5jb3MocmFkKTtcblxuICAgIG91dFswXSA9IGMgKiBhMDAgKyBzICogYTEwO1xuICAgIG91dFsxXSA9IGMgKiBhMDEgKyBzICogYTExO1xuICAgIG91dFsyXSA9IGMgKiBhMDIgKyBzICogYTEyO1xuXG4gICAgb3V0WzNdID0gYyAqIGExMCAtIHMgKiBhMDA7XG4gICAgb3V0WzRdID0gYyAqIGExMSAtIHMgKiBhMDE7XG4gICAgb3V0WzVdID0gYyAqIGExMiAtIHMgKiBhMDI7XG5cbiAgICBvdXRbNl0gPSBhMjA7XG4gICAgb3V0WzddID0gYTIxO1xuICAgIG91dFs4XSA9IGEyMjtcbiAgICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFNjYWxlcyB0aGUgbWF0MyBieSB0aGUgZGltZW5zaW9ucyBpbiB0aGUgZ2l2ZW4gdmVjMlxuICpcbiAqIEBwYXJhbSB7bWF0M30gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDN9IGEgdGhlIG1hdHJpeCB0byByb3RhdGVcbiAqIEBwYXJhbSB7dmVjMn0gdiB0aGUgdmVjMiB0byBzY2FsZSB0aGUgbWF0cml4IGJ5XG4gKiBAcmV0dXJucyB7bWF0M30gb3V0XG4gKiovXG5leHBvcnQgZnVuY3Rpb24gc2NhbGUob3V0LCBhLCB2KSB7XG4gICAgbGV0IHggPSB2WzBdLFxuICAgICAgICB5ID0gdlsxXTtcblxuICAgIG91dFswXSA9IHggKiBhWzBdO1xuICAgIG91dFsxXSA9IHggKiBhWzFdO1xuICAgIG91dFsyXSA9IHggKiBhWzJdO1xuXG4gICAgb3V0WzNdID0geSAqIGFbM107XG4gICAgb3V0WzRdID0geSAqIGFbNF07XG4gICAgb3V0WzVdID0geSAqIGFbNV07XG5cbiAgICBvdXRbNl0gPSBhWzZdO1xuICAgIG91dFs3XSA9IGFbN107XG4gICAgb3V0WzhdID0gYVs4XTtcbiAgICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIENhbGN1bGF0ZXMgYSAzeDMgbm9ybWFsIG1hdHJpeCAodHJhbnNwb3NlIGludmVyc2UpIGZyb20gdGhlIDR4NCBtYXRyaXhcbiAqXG4gKiBAcGFyYW0ge21hdDN9IG91dCBtYXQzIHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XG4gKiBAcGFyYW0ge21hdDR9IGEgTWF0NCB0byBkZXJpdmUgdGhlIG5vcm1hbCBtYXRyaXggZnJvbVxuICpcbiAqIEByZXR1cm5zIHttYXQzfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG5vcm1hbEZyb21NYXQ0KG91dCwgYSkge1xuICAgIGxldCBhMDAgPSBhWzBdLFxuICAgICAgICBhMDEgPSBhWzFdLFxuICAgICAgICBhMDIgPSBhWzJdLFxuICAgICAgICBhMDMgPSBhWzNdO1xuICAgIGxldCBhMTAgPSBhWzRdLFxuICAgICAgICBhMTEgPSBhWzVdLFxuICAgICAgICBhMTIgPSBhWzZdLFxuICAgICAgICBhMTMgPSBhWzddO1xuICAgIGxldCBhMjAgPSBhWzhdLFxuICAgICAgICBhMjEgPSBhWzldLFxuICAgICAgICBhMjIgPSBhWzEwXSxcbiAgICAgICAgYTIzID0gYVsxMV07XG4gICAgbGV0IGEzMCA9IGFbMTJdLFxuICAgICAgICBhMzEgPSBhWzEzXSxcbiAgICAgICAgYTMyID0gYVsxNF0sXG4gICAgICAgIGEzMyA9IGFbMTVdO1xuXG4gICAgbGV0IGIwMCA9IGEwMCAqIGExMSAtIGEwMSAqIGExMDtcbiAgICBsZXQgYjAxID0gYTAwICogYTEyIC0gYTAyICogYTEwO1xuICAgIGxldCBiMDIgPSBhMDAgKiBhMTMgLSBhMDMgKiBhMTA7XG4gICAgbGV0IGIwMyA9IGEwMSAqIGExMiAtIGEwMiAqIGExMTtcbiAgICBsZXQgYjA0ID0gYTAxICogYTEzIC0gYTAzICogYTExO1xuICAgIGxldCBiMDUgPSBhMDIgKiBhMTMgLSBhMDMgKiBhMTI7XG4gICAgbGV0IGIwNiA9IGEyMCAqIGEzMSAtIGEyMSAqIGEzMDtcbiAgICBsZXQgYjA3ID0gYTIwICogYTMyIC0gYTIyICogYTMwO1xuICAgIGxldCBiMDggPSBhMjAgKiBhMzMgLSBhMjMgKiBhMzA7XG4gICAgbGV0IGIwOSA9IGEyMSAqIGEzMiAtIGEyMiAqIGEzMTtcbiAgICBsZXQgYjEwID0gYTIxICogYTMzIC0gYTIzICogYTMxO1xuICAgIGxldCBiMTEgPSBhMjIgKiBhMzMgLSBhMjMgKiBhMzI7XG5cbiAgICAvLyBDYWxjdWxhdGUgdGhlIGRldGVybWluYW50XG4gICAgbGV0IGRldCA9IGIwMCAqIGIxMSAtIGIwMSAqIGIxMCArIGIwMiAqIGIwOSArIGIwMyAqIGIwOCAtIGIwNCAqIGIwNyArIGIwNSAqIGIwNjtcblxuICAgIGlmICghZGV0KSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBkZXQgPSAxLjAgLyBkZXQ7XG5cbiAgICBvdXRbMF0gPSAoYTExICogYjExIC0gYTEyICogYjEwICsgYTEzICogYjA5KSAqIGRldDtcbiAgICBvdXRbMV0gPSAoYTEyICogYjA4IC0gYTEwICogYjExIC0gYTEzICogYjA3KSAqIGRldDtcbiAgICBvdXRbMl0gPSAoYTEwICogYjEwIC0gYTExICogYjA4ICsgYTEzICogYjA2KSAqIGRldDtcblxuICAgIG91dFszXSA9IChhMDIgKiBiMTAgLSBhMDEgKiBiMTEgLSBhMDMgKiBiMDkpICogZGV0O1xuICAgIG91dFs0XSA9IChhMDAgKiBiMTEgLSBhMDIgKiBiMDggKyBhMDMgKiBiMDcpICogZGV0O1xuICAgIG91dFs1XSA9IChhMDEgKiBiMDggLSBhMDAgKiBiMTAgLSBhMDMgKiBiMDYpICogZGV0O1xuXG4gICAgb3V0WzZdID0gKGEzMSAqIGIwNSAtIGEzMiAqIGIwNCArIGEzMyAqIGIwMykgKiBkZXQ7XG4gICAgb3V0WzddID0gKGEzMiAqIGIwMiAtIGEzMCAqIGIwNSAtIGEzMyAqIGIwMSkgKiBkZXQ7XG4gICAgb3V0WzhdID0gKGEzMCAqIGIwNCAtIGEzMSAqIGIwMiArIGEzMyAqIGIwMCkgKiBkZXQ7XG5cbiAgICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIEdlbmVyYXRlcyBhIDJEIHByb2plY3Rpb24gbWF0cml4IHdpdGggdGhlIGdpdmVuIGJvdW5kc1xuICpcbiAqIEBwYXJhbSB7bWF0M30gb3V0IG1hdDMgZnJ1c3R1bSBtYXRyaXggd2lsbCBiZSB3cml0dGVuIGludG9cbiAqIEBwYXJhbSB7bnVtYmVyfSB3aWR0aCBXaWR0aCBvZiB5b3VyIGdsIGNvbnRleHRcbiAqIEBwYXJhbSB7bnVtYmVyfSBoZWlnaHQgSGVpZ2h0IG9mIGdsIGNvbnRleHRcbiAqIEByZXR1cm5zIHttYXQzfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHByb2plY3Rpb24ob3V0LCB3aWR0aCwgaGVpZ2h0KSB7XG4gICAgb3V0WzBdID0gMiAvIHdpZHRoO1xuICAgIG91dFsxXSA9IDA7XG4gICAgb3V0WzJdID0gMDtcbiAgICBvdXRbM10gPSAwO1xuICAgIG91dFs0XSA9IC0yIC8gaGVpZ2h0O1xuICAgIG91dFs1XSA9IDA7XG4gICAgb3V0WzZdID0gLTE7XG4gICAgb3V0WzddID0gMTtcbiAgICBvdXRbOF0gPSAxO1xuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogQWRkcyB0d28gbWF0MydzXG4gKlxuICogQHBhcmFtIHttYXQzfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0M30gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHttYXQzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge21hdDN9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gYWRkKG91dCwgYSwgYikge1xuICAgIG91dFswXSA9IGFbMF0gKyBiWzBdO1xuICAgIG91dFsxXSA9IGFbMV0gKyBiWzFdO1xuICAgIG91dFsyXSA9IGFbMl0gKyBiWzJdO1xuICAgIG91dFszXSA9IGFbM10gKyBiWzNdO1xuICAgIG91dFs0XSA9IGFbNF0gKyBiWzRdO1xuICAgIG91dFs1XSA9IGFbNV0gKyBiWzVdO1xuICAgIG91dFs2XSA9IGFbNl0gKyBiWzZdO1xuICAgIG91dFs3XSA9IGFbN10gKyBiWzddO1xuICAgIG91dFs4XSA9IGFbOF0gKyBiWzhdO1xuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogU3VidHJhY3RzIG1hdHJpeCBiIGZyb20gbWF0cml4IGFcbiAqXG4gKiBAcGFyYW0ge21hdDN9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge21hdDN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7bWF0M30gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzdWJ0cmFjdChvdXQsIGEsIGIpIHtcbiAgICBvdXRbMF0gPSBhWzBdIC0gYlswXTtcbiAgICBvdXRbMV0gPSBhWzFdIC0gYlsxXTtcbiAgICBvdXRbMl0gPSBhWzJdIC0gYlsyXTtcbiAgICBvdXRbM10gPSBhWzNdIC0gYlszXTtcbiAgICBvdXRbNF0gPSBhWzRdIC0gYls0XTtcbiAgICBvdXRbNV0gPSBhWzVdIC0gYls1XTtcbiAgICBvdXRbNl0gPSBhWzZdIC0gYls2XTtcbiAgICBvdXRbN10gPSBhWzddIC0gYls3XTtcbiAgICBvdXRbOF0gPSBhWzhdIC0gYls4XTtcbiAgICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIE11bHRpcGx5IGVhY2ggZWxlbWVudCBvZiB0aGUgbWF0cml4IGJ5IGEgc2NhbGFyLlxuICpcbiAqIEBwYXJhbSB7bWF0M30gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDN9IGEgdGhlIG1hdHJpeCB0byBzY2FsZVxuICogQHBhcmFtIHtOdW1iZXJ9IGIgYW1vdW50IHRvIHNjYWxlIHRoZSBtYXRyaXgncyBlbGVtZW50cyBieVxuICogQHJldHVybnMge21hdDN9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gbXVsdGlwbHlTY2FsYXIob3V0LCBhLCBiKSB7XG4gICAgb3V0WzBdID0gYVswXSAqIGI7XG4gICAgb3V0WzFdID0gYVsxXSAqIGI7XG4gICAgb3V0WzJdID0gYVsyXSAqIGI7XG4gICAgb3V0WzNdID0gYVszXSAqIGI7XG4gICAgb3V0WzRdID0gYVs0XSAqIGI7XG4gICAgb3V0WzVdID0gYVs1XSAqIGI7XG4gICAgb3V0WzZdID0gYVs2XSAqIGI7XG4gICAgb3V0WzddID0gYVs3XSAqIGI7XG4gICAgb3V0WzhdID0gYVs4XSAqIGI7XG4gICAgcmV0dXJuIG91dDtcbn1cbiIsImNvbnN0IEVQU0lMT04gPSAwLjAwMDAwMTtcblxuLyoqXG4gKiBDb3B5IHRoZSB2YWx1ZXMgZnJvbSBvbmUgbWF0NCB0byBhbm90aGVyXG4gKlxuICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0NH0gYSB0aGUgc291cmNlIG1hdHJpeFxuICogQHJldHVybnMge21hdDR9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gY29weShvdXQsIGEpIHtcbiAgICBvdXRbMF0gPSBhWzBdO1xuICAgIG91dFsxXSA9IGFbMV07XG4gICAgb3V0WzJdID0gYVsyXTtcbiAgICBvdXRbM10gPSBhWzNdO1xuICAgIG91dFs0XSA9IGFbNF07XG4gICAgb3V0WzVdID0gYVs1XTtcbiAgICBvdXRbNl0gPSBhWzZdO1xuICAgIG91dFs3XSA9IGFbN107XG4gICAgb3V0WzhdID0gYVs4XTtcbiAgICBvdXRbOV0gPSBhWzldO1xuICAgIG91dFsxMF0gPSBhWzEwXTtcbiAgICBvdXRbMTFdID0gYVsxMV07XG4gICAgb3V0WzEyXSA9IGFbMTJdO1xuICAgIG91dFsxM10gPSBhWzEzXTtcbiAgICBvdXRbMTRdID0gYVsxNF07XG4gICAgb3V0WzE1XSA9IGFbMTVdO1xuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogU2V0IHRoZSBjb21wb25lbnRzIG9mIGEgbWF0NCB0byB0aGUgZ2l2ZW4gdmFsdWVzXG4gKlxuICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNldChvdXQsIG0wMCwgbTAxLCBtMDIsIG0wMywgbTEwLCBtMTEsIG0xMiwgbTEzLCBtMjAsIG0yMSwgbTIyLCBtMjMsIG0zMCwgbTMxLCBtMzIsIG0zMykge1xuICAgIG91dFswXSA9IG0wMDtcbiAgICBvdXRbMV0gPSBtMDE7XG4gICAgb3V0WzJdID0gbTAyO1xuICAgIG91dFszXSA9IG0wMztcbiAgICBvdXRbNF0gPSBtMTA7XG4gICAgb3V0WzVdID0gbTExO1xuICAgIG91dFs2XSA9IG0xMjtcbiAgICBvdXRbN10gPSBtMTM7XG4gICAgb3V0WzhdID0gbTIwO1xuICAgIG91dFs5XSA9IG0yMTtcbiAgICBvdXRbMTBdID0gbTIyO1xuICAgIG91dFsxMV0gPSBtMjM7XG4gICAgb3V0WzEyXSA9IG0zMDtcbiAgICBvdXRbMTNdID0gbTMxO1xuICAgIG91dFsxNF0gPSBtMzI7XG4gICAgb3V0WzE1XSA9IG0zMztcbiAgICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFNldCBhIG1hdDQgdG8gdGhlIGlkZW50aXR5IG1hdHJpeFxuICpcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpZGVudGl0eShvdXQpIHtcbiAgICBvdXRbMF0gPSAxO1xuICAgIG91dFsxXSA9IDA7XG4gICAgb3V0WzJdID0gMDtcbiAgICBvdXRbM10gPSAwO1xuICAgIG91dFs0XSA9IDA7XG4gICAgb3V0WzVdID0gMTtcbiAgICBvdXRbNl0gPSAwO1xuICAgIG91dFs3XSA9IDA7XG4gICAgb3V0WzhdID0gMDtcbiAgICBvdXRbOV0gPSAwO1xuICAgIG91dFsxMF0gPSAxO1xuICAgIG91dFsxMV0gPSAwO1xuICAgIG91dFsxMl0gPSAwO1xuICAgIG91dFsxM10gPSAwO1xuICAgIG91dFsxNF0gPSAwO1xuICAgIG91dFsxNV0gPSAxO1xuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogVHJhbnNwb3NlIHRoZSB2YWx1ZXMgb2YgYSBtYXQ0XG4gKlxuICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0NH0gYSB0aGUgc291cmNlIG1hdHJpeFxuICogQHJldHVybnMge21hdDR9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gdHJhbnNwb3NlKG91dCwgYSkge1xuICAgIC8vIElmIHdlIGFyZSB0cmFuc3Bvc2luZyBvdXJzZWx2ZXMgd2UgY2FuIHNraXAgYSBmZXcgc3RlcHMgYnV0IGhhdmUgdG8gY2FjaGUgc29tZSB2YWx1ZXNcbiAgICBpZiAob3V0ID09PSBhKSB7XG4gICAgICAgIGxldCBhMDEgPSBhWzFdLFxuICAgICAgICAgICAgYTAyID0gYVsyXSxcbiAgICAgICAgICAgIGEwMyA9IGFbM107XG4gICAgICAgIGxldCBhMTIgPSBhWzZdLFxuICAgICAgICAgICAgYTEzID0gYVs3XTtcbiAgICAgICAgbGV0IGEyMyA9IGFbMTFdO1xuXG4gICAgICAgIG91dFsxXSA9IGFbNF07XG4gICAgICAgIG91dFsyXSA9IGFbOF07XG4gICAgICAgIG91dFszXSA9IGFbMTJdO1xuICAgICAgICBvdXRbNF0gPSBhMDE7XG4gICAgICAgIG91dFs2XSA9IGFbOV07XG4gICAgICAgIG91dFs3XSA9IGFbMTNdO1xuICAgICAgICBvdXRbOF0gPSBhMDI7XG4gICAgICAgIG91dFs5XSA9IGExMjtcbiAgICAgICAgb3V0WzExXSA9IGFbMTRdO1xuICAgICAgICBvdXRbMTJdID0gYTAzO1xuICAgICAgICBvdXRbMTNdID0gYTEzO1xuICAgICAgICBvdXRbMTRdID0gYTIzO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIG91dFswXSA9IGFbMF07XG4gICAgICAgIG91dFsxXSA9IGFbNF07XG4gICAgICAgIG91dFsyXSA9IGFbOF07XG4gICAgICAgIG91dFszXSA9IGFbMTJdO1xuICAgICAgICBvdXRbNF0gPSBhWzFdO1xuICAgICAgICBvdXRbNV0gPSBhWzVdO1xuICAgICAgICBvdXRbNl0gPSBhWzldO1xuICAgICAgICBvdXRbN10gPSBhWzEzXTtcbiAgICAgICAgb3V0WzhdID0gYVsyXTtcbiAgICAgICAgb3V0WzldID0gYVs2XTtcbiAgICAgICAgb3V0WzEwXSA9IGFbMTBdO1xuICAgICAgICBvdXRbMTFdID0gYVsxNF07XG4gICAgICAgIG91dFsxMl0gPSBhWzNdO1xuICAgICAgICBvdXRbMTNdID0gYVs3XTtcbiAgICAgICAgb3V0WzE0XSA9IGFbMTFdO1xuICAgICAgICBvdXRbMTVdID0gYVsxNV07XG4gICAgfVxuXG4gICAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBJbnZlcnRzIGEgbWF0NFxuICpcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDR9IGEgdGhlIHNvdXJjZSBtYXRyaXhcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGludmVydChvdXQsIGEpIHtcbiAgICBsZXQgYTAwID0gYVswXSxcbiAgICAgICAgYTAxID0gYVsxXSxcbiAgICAgICAgYTAyID0gYVsyXSxcbiAgICAgICAgYTAzID0gYVszXTtcbiAgICBsZXQgYTEwID0gYVs0XSxcbiAgICAgICAgYTExID0gYVs1XSxcbiAgICAgICAgYTEyID0gYVs2XSxcbiAgICAgICAgYTEzID0gYVs3XTtcbiAgICBsZXQgYTIwID0gYVs4XSxcbiAgICAgICAgYTIxID0gYVs5XSxcbiAgICAgICAgYTIyID0gYVsxMF0sXG4gICAgICAgIGEyMyA9IGFbMTFdO1xuICAgIGxldCBhMzAgPSBhWzEyXSxcbiAgICAgICAgYTMxID0gYVsxM10sXG4gICAgICAgIGEzMiA9IGFbMTRdLFxuICAgICAgICBhMzMgPSBhWzE1XTtcblxuICAgIGxldCBiMDAgPSBhMDAgKiBhMTEgLSBhMDEgKiBhMTA7XG4gICAgbGV0IGIwMSA9IGEwMCAqIGExMiAtIGEwMiAqIGExMDtcbiAgICBsZXQgYjAyID0gYTAwICogYTEzIC0gYTAzICogYTEwO1xuICAgIGxldCBiMDMgPSBhMDEgKiBhMTIgLSBhMDIgKiBhMTE7XG4gICAgbGV0IGIwNCA9IGEwMSAqIGExMyAtIGEwMyAqIGExMTtcbiAgICBsZXQgYjA1ID0gYTAyICogYTEzIC0gYTAzICogYTEyO1xuICAgIGxldCBiMDYgPSBhMjAgKiBhMzEgLSBhMjEgKiBhMzA7XG4gICAgbGV0IGIwNyA9IGEyMCAqIGEzMiAtIGEyMiAqIGEzMDtcbiAgICBsZXQgYjA4ID0gYTIwICogYTMzIC0gYTIzICogYTMwO1xuICAgIGxldCBiMDkgPSBhMjEgKiBhMzIgLSBhMjIgKiBhMzE7XG4gICAgbGV0IGIxMCA9IGEyMSAqIGEzMyAtIGEyMyAqIGEzMTtcbiAgICBsZXQgYjExID0gYTIyICogYTMzIC0gYTIzICogYTMyO1xuXG4gICAgLy8gQ2FsY3VsYXRlIHRoZSBkZXRlcm1pbmFudFxuICAgIGxldCBkZXQgPSBiMDAgKiBiMTEgLSBiMDEgKiBiMTAgKyBiMDIgKiBiMDkgKyBiMDMgKiBiMDggLSBiMDQgKiBiMDcgKyBiMDUgKiBiMDY7XG5cbiAgICBpZiAoIWRldCkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgZGV0ID0gMS4wIC8gZGV0O1xuXG4gICAgb3V0WzBdID0gKGExMSAqIGIxMSAtIGExMiAqIGIxMCArIGExMyAqIGIwOSkgKiBkZXQ7XG4gICAgb3V0WzFdID0gKGEwMiAqIGIxMCAtIGEwMSAqIGIxMSAtIGEwMyAqIGIwOSkgKiBkZXQ7XG4gICAgb3V0WzJdID0gKGEzMSAqIGIwNSAtIGEzMiAqIGIwNCArIGEzMyAqIGIwMykgKiBkZXQ7XG4gICAgb3V0WzNdID0gKGEyMiAqIGIwNCAtIGEyMSAqIGIwNSAtIGEyMyAqIGIwMykgKiBkZXQ7XG4gICAgb3V0WzRdID0gKGExMiAqIGIwOCAtIGExMCAqIGIxMSAtIGExMyAqIGIwNykgKiBkZXQ7XG4gICAgb3V0WzVdID0gKGEwMCAqIGIxMSAtIGEwMiAqIGIwOCArIGEwMyAqIGIwNykgKiBkZXQ7XG4gICAgb3V0WzZdID0gKGEzMiAqIGIwMiAtIGEzMCAqIGIwNSAtIGEzMyAqIGIwMSkgKiBkZXQ7XG4gICAgb3V0WzddID0gKGEyMCAqIGIwNSAtIGEyMiAqIGIwMiArIGEyMyAqIGIwMSkgKiBkZXQ7XG4gICAgb3V0WzhdID0gKGExMCAqIGIxMCAtIGExMSAqIGIwOCArIGExMyAqIGIwNikgKiBkZXQ7XG4gICAgb3V0WzldID0gKGEwMSAqIGIwOCAtIGEwMCAqIGIxMCAtIGEwMyAqIGIwNikgKiBkZXQ7XG4gICAgb3V0WzEwXSA9IChhMzAgKiBiMDQgLSBhMzEgKiBiMDIgKyBhMzMgKiBiMDApICogZGV0O1xuICAgIG91dFsxMV0gPSAoYTIxICogYjAyIC0gYTIwICogYjA0IC0gYTIzICogYjAwKSAqIGRldDtcbiAgICBvdXRbMTJdID0gKGExMSAqIGIwNyAtIGExMCAqIGIwOSAtIGExMiAqIGIwNikgKiBkZXQ7XG4gICAgb3V0WzEzXSA9IChhMDAgKiBiMDkgLSBhMDEgKiBiMDcgKyBhMDIgKiBiMDYpICogZGV0O1xuICAgIG91dFsxNF0gPSAoYTMxICogYjAxIC0gYTMwICogYjAzIC0gYTMyICogYjAwKSAqIGRldDtcbiAgICBvdXRbMTVdID0gKGEyMCAqIGIwMyAtIGEyMSAqIGIwMSArIGEyMiAqIGIwMCkgKiBkZXQ7XG5cbiAgICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGRldGVybWluYW50IG9mIGEgbWF0NFxuICpcbiAqIEBwYXJhbSB7bWF0NH0gYSB0aGUgc291cmNlIG1hdHJpeFxuICogQHJldHVybnMge051bWJlcn0gZGV0ZXJtaW5hbnQgb2YgYVxuICovXG5leHBvcnQgZnVuY3Rpb24gZGV0ZXJtaW5hbnQoYSkge1xuICAgIGxldCBhMDAgPSBhWzBdLFxuICAgICAgICBhMDEgPSBhWzFdLFxuICAgICAgICBhMDIgPSBhWzJdLFxuICAgICAgICBhMDMgPSBhWzNdO1xuICAgIGxldCBhMTAgPSBhWzRdLFxuICAgICAgICBhMTEgPSBhWzVdLFxuICAgICAgICBhMTIgPSBhWzZdLFxuICAgICAgICBhMTMgPSBhWzddO1xuICAgIGxldCBhMjAgPSBhWzhdLFxuICAgICAgICBhMjEgPSBhWzldLFxuICAgICAgICBhMjIgPSBhWzEwXSxcbiAgICAgICAgYTIzID0gYVsxMV07XG4gICAgbGV0IGEzMCA9IGFbMTJdLFxuICAgICAgICBhMzEgPSBhWzEzXSxcbiAgICAgICAgYTMyID0gYVsxNF0sXG4gICAgICAgIGEzMyA9IGFbMTVdO1xuXG4gICAgbGV0IGIwMCA9IGEwMCAqIGExMSAtIGEwMSAqIGExMDtcbiAgICBsZXQgYjAxID0gYTAwICogYTEyIC0gYTAyICogYTEwO1xuICAgIGxldCBiMDIgPSBhMDAgKiBhMTMgLSBhMDMgKiBhMTA7XG4gICAgbGV0IGIwMyA9IGEwMSAqIGExMiAtIGEwMiAqIGExMTtcbiAgICBsZXQgYjA0ID0gYTAxICogYTEzIC0gYTAzICogYTExO1xuICAgIGxldCBiMDUgPSBhMDIgKiBhMTMgLSBhMDMgKiBhMTI7XG4gICAgbGV0IGIwNiA9IGEyMCAqIGEzMSAtIGEyMSAqIGEzMDtcbiAgICBsZXQgYjA3ID0gYTIwICogYTMyIC0gYTIyICogYTMwO1xuICAgIGxldCBiMDggPSBhMjAgKiBhMzMgLSBhMjMgKiBhMzA7XG4gICAgbGV0IGIwOSA9IGEyMSAqIGEzMiAtIGEyMiAqIGEzMTtcbiAgICBsZXQgYjEwID0gYTIxICogYTMzIC0gYTIzICogYTMxO1xuICAgIGxldCBiMTEgPSBhMjIgKiBhMzMgLSBhMjMgKiBhMzI7XG5cbiAgICAvLyBDYWxjdWxhdGUgdGhlIGRldGVybWluYW50XG4gICAgcmV0dXJuIGIwMCAqIGIxMSAtIGIwMSAqIGIxMCArIGIwMiAqIGIwOSArIGIwMyAqIGIwOCAtIGIwNCAqIGIwNyArIGIwNSAqIGIwNjtcbn1cblxuLyoqXG4gKiBNdWx0aXBsaWVzIHR3byBtYXQ0c1xuICpcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7bWF0NH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG11bHRpcGx5KG91dCwgYSwgYikge1xuICAgIGxldCBhMDAgPSBhWzBdLFxuICAgICAgICBhMDEgPSBhWzFdLFxuICAgICAgICBhMDIgPSBhWzJdLFxuICAgICAgICBhMDMgPSBhWzNdO1xuICAgIGxldCBhMTAgPSBhWzRdLFxuICAgICAgICBhMTEgPSBhWzVdLFxuICAgICAgICBhMTIgPSBhWzZdLFxuICAgICAgICBhMTMgPSBhWzddO1xuICAgIGxldCBhMjAgPSBhWzhdLFxuICAgICAgICBhMjEgPSBhWzldLFxuICAgICAgICBhMjIgPSBhWzEwXSxcbiAgICAgICAgYTIzID0gYVsxMV07XG4gICAgbGV0IGEzMCA9IGFbMTJdLFxuICAgICAgICBhMzEgPSBhWzEzXSxcbiAgICAgICAgYTMyID0gYVsxNF0sXG4gICAgICAgIGEzMyA9IGFbMTVdO1xuXG4gICAgLy8gQ2FjaGUgb25seSB0aGUgY3VycmVudCBsaW5lIG9mIHRoZSBzZWNvbmQgbWF0cml4XG4gICAgbGV0IGIwID0gYlswXSxcbiAgICAgICAgYjEgPSBiWzFdLFxuICAgICAgICBiMiA9IGJbMl0sXG4gICAgICAgIGIzID0gYlszXTtcbiAgICBvdXRbMF0gPSBiMCAqIGEwMCArIGIxICogYTEwICsgYjIgKiBhMjAgKyBiMyAqIGEzMDtcbiAgICBvdXRbMV0gPSBiMCAqIGEwMSArIGIxICogYTExICsgYjIgKiBhMjEgKyBiMyAqIGEzMTtcbiAgICBvdXRbMl0gPSBiMCAqIGEwMiArIGIxICogYTEyICsgYjIgKiBhMjIgKyBiMyAqIGEzMjtcbiAgICBvdXRbM10gPSBiMCAqIGEwMyArIGIxICogYTEzICsgYjIgKiBhMjMgKyBiMyAqIGEzMztcblxuICAgIGIwID0gYls0XTtcbiAgICBiMSA9IGJbNV07XG4gICAgYjIgPSBiWzZdO1xuICAgIGIzID0gYls3XTtcbiAgICBvdXRbNF0gPSBiMCAqIGEwMCArIGIxICogYTEwICsgYjIgKiBhMjAgKyBiMyAqIGEzMDtcbiAgICBvdXRbNV0gPSBiMCAqIGEwMSArIGIxICogYTExICsgYjIgKiBhMjEgKyBiMyAqIGEzMTtcbiAgICBvdXRbNl0gPSBiMCAqIGEwMiArIGIxICogYTEyICsgYjIgKiBhMjIgKyBiMyAqIGEzMjtcbiAgICBvdXRbN10gPSBiMCAqIGEwMyArIGIxICogYTEzICsgYjIgKiBhMjMgKyBiMyAqIGEzMztcblxuICAgIGIwID0gYls4XTtcbiAgICBiMSA9IGJbOV07XG4gICAgYjIgPSBiWzEwXTtcbiAgICBiMyA9IGJbMTFdO1xuICAgIG91dFs4XSA9IGIwICogYTAwICsgYjEgKiBhMTAgKyBiMiAqIGEyMCArIGIzICogYTMwO1xuICAgIG91dFs5XSA9IGIwICogYTAxICsgYjEgKiBhMTEgKyBiMiAqIGEyMSArIGIzICogYTMxO1xuICAgIG91dFsxMF0gPSBiMCAqIGEwMiArIGIxICogYTEyICsgYjIgKiBhMjIgKyBiMyAqIGEzMjtcbiAgICBvdXRbMTFdID0gYjAgKiBhMDMgKyBiMSAqIGExMyArIGIyICogYTIzICsgYjMgKiBhMzM7XG5cbiAgICBiMCA9IGJbMTJdO1xuICAgIGIxID0gYlsxM107XG4gICAgYjIgPSBiWzE0XTtcbiAgICBiMyA9IGJbMTVdO1xuICAgIG91dFsxMl0gPSBiMCAqIGEwMCArIGIxICogYTEwICsgYjIgKiBhMjAgKyBiMyAqIGEzMDtcbiAgICBvdXRbMTNdID0gYjAgKiBhMDEgKyBiMSAqIGExMSArIGIyICogYTIxICsgYjMgKiBhMzE7XG4gICAgb3V0WzE0XSA9IGIwICogYTAyICsgYjEgKiBhMTIgKyBiMiAqIGEyMiArIGIzICogYTMyO1xuICAgIG91dFsxNV0gPSBiMCAqIGEwMyArIGIxICogYTEzICsgYjIgKiBhMjMgKyBiMyAqIGEzMztcbiAgICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFRyYW5zbGF0ZSBhIG1hdDQgYnkgdGhlIGdpdmVuIHZlY3RvclxuICpcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDR9IGEgdGhlIG1hdHJpeCB0byB0cmFuc2xhdGVcbiAqIEBwYXJhbSB7dmVjM30gdiB2ZWN0b3IgdG8gdHJhbnNsYXRlIGJ5XG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0cmFuc2xhdGUob3V0LCBhLCB2KSB7XG4gICAgbGV0IHggPSB2WzBdLFxuICAgICAgICB5ID0gdlsxXSxcbiAgICAgICAgeiA9IHZbMl07XG4gICAgbGV0IGEwMCwgYTAxLCBhMDIsIGEwMztcbiAgICBsZXQgYTEwLCBhMTEsIGExMiwgYTEzO1xuICAgIGxldCBhMjAsIGEyMSwgYTIyLCBhMjM7XG5cbiAgICBpZiAoYSA9PT0gb3V0KSB7XG4gICAgICAgIG91dFsxMl0gPSBhWzBdICogeCArIGFbNF0gKiB5ICsgYVs4XSAqIHogKyBhWzEyXTtcbiAgICAgICAgb3V0WzEzXSA9IGFbMV0gKiB4ICsgYVs1XSAqIHkgKyBhWzldICogeiArIGFbMTNdO1xuICAgICAgICBvdXRbMTRdID0gYVsyXSAqIHggKyBhWzZdICogeSArIGFbMTBdICogeiArIGFbMTRdO1xuICAgICAgICBvdXRbMTVdID0gYVszXSAqIHggKyBhWzddICogeSArIGFbMTFdICogeiArIGFbMTVdO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGEwMCA9IGFbMF07XG4gICAgICAgIGEwMSA9IGFbMV07XG4gICAgICAgIGEwMiA9IGFbMl07XG4gICAgICAgIGEwMyA9IGFbM107XG4gICAgICAgIGExMCA9IGFbNF07XG4gICAgICAgIGExMSA9IGFbNV07XG4gICAgICAgIGExMiA9IGFbNl07XG4gICAgICAgIGExMyA9IGFbN107XG4gICAgICAgIGEyMCA9IGFbOF07XG4gICAgICAgIGEyMSA9IGFbOV07XG4gICAgICAgIGEyMiA9IGFbMTBdO1xuICAgICAgICBhMjMgPSBhWzExXTtcblxuICAgICAgICBvdXRbMF0gPSBhMDA7XG4gICAgICAgIG91dFsxXSA9IGEwMTtcbiAgICAgICAgb3V0WzJdID0gYTAyO1xuICAgICAgICBvdXRbM10gPSBhMDM7XG4gICAgICAgIG91dFs0XSA9IGExMDtcbiAgICAgICAgb3V0WzVdID0gYTExO1xuICAgICAgICBvdXRbNl0gPSBhMTI7XG4gICAgICAgIG91dFs3XSA9IGExMztcbiAgICAgICAgb3V0WzhdID0gYTIwO1xuICAgICAgICBvdXRbOV0gPSBhMjE7XG4gICAgICAgIG91dFsxMF0gPSBhMjI7XG4gICAgICAgIG91dFsxMV0gPSBhMjM7XG5cbiAgICAgICAgb3V0WzEyXSA9IGEwMCAqIHggKyBhMTAgKiB5ICsgYTIwICogeiArIGFbMTJdO1xuICAgICAgICBvdXRbMTNdID0gYTAxICogeCArIGExMSAqIHkgKyBhMjEgKiB6ICsgYVsxM107XG4gICAgICAgIG91dFsxNF0gPSBhMDIgKiB4ICsgYTEyICogeSArIGEyMiAqIHogKyBhWzE0XTtcbiAgICAgICAgb3V0WzE1XSA9IGEwMyAqIHggKyBhMTMgKiB5ICsgYTIzICogeiArIGFbMTVdO1xuICAgIH1cblxuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogU2NhbGVzIHRoZSBtYXQ0IGJ5IHRoZSBkaW1lbnNpb25zIGluIHRoZSBnaXZlbiB2ZWMzIG5vdCB1c2luZyB2ZWN0b3JpemF0aW9uXG4gKlxuICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0NH0gYSB0aGUgbWF0cml4IHRvIHNjYWxlXG4gKiBAcGFyYW0ge3ZlYzN9IHYgdGhlIHZlYzMgdG8gc2NhbGUgdGhlIG1hdHJpeCBieVxuICogQHJldHVybnMge21hdDR9IG91dFxuICoqL1xuZXhwb3J0IGZ1bmN0aW9uIHNjYWxlKG91dCwgYSwgdikge1xuICAgIGxldCB4ID0gdlswXSxcbiAgICAgICAgeSA9IHZbMV0sXG4gICAgICAgIHogPSB2WzJdO1xuXG4gICAgb3V0WzBdID0gYVswXSAqIHg7XG4gICAgb3V0WzFdID0gYVsxXSAqIHg7XG4gICAgb3V0WzJdID0gYVsyXSAqIHg7XG4gICAgb3V0WzNdID0gYVszXSAqIHg7XG4gICAgb3V0WzRdID0gYVs0XSAqIHk7XG4gICAgb3V0WzVdID0gYVs1XSAqIHk7XG4gICAgb3V0WzZdID0gYVs2XSAqIHk7XG4gICAgb3V0WzddID0gYVs3XSAqIHk7XG4gICAgb3V0WzhdID0gYVs4XSAqIHo7XG4gICAgb3V0WzldID0gYVs5XSAqIHo7XG4gICAgb3V0WzEwXSA9IGFbMTBdICogejtcbiAgICBvdXRbMTFdID0gYVsxMV0gKiB6O1xuICAgIG91dFsxMl0gPSBhWzEyXTtcbiAgICBvdXRbMTNdID0gYVsxM107XG4gICAgb3V0WzE0XSA9IGFbMTRdO1xuICAgIG91dFsxNV0gPSBhWzE1XTtcbiAgICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFJvdGF0ZXMgYSBtYXQ0IGJ5IHRoZSBnaXZlbiBhbmdsZSBhcm91bmQgdGhlIGdpdmVuIGF4aXNcbiAqXG4gKiBAcGFyYW0ge21hdDR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQ0fSBhIHRoZSBtYXRyaXggdG8gcm90YXRlXG4gKiBAcGFyYW0ge051bWJlcn0gcmFkIHRoZSBhbmdsZSB0byByb3RhdGUgdGhlIG1hdHJpeCBieVxuICogQHBhcmFtIHt2ZWMzfSBheGlzIHRoZSBheGlzIHRvIHJvdGF0ZSBhcm91bmRcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJvdGF0ZShvdXQsIGEsIHJhZCwgYXhpcykge1xuICAgIGxldCB4ID0gYXhpc1swXSxcbiAgICAgICAgeSA9IGF4aXNbMV0sXG4gICAgICAgIHogPSBheGlzWzJdO1xuICAgIGxldCBsZW4gPSBNYXRoLmh5cG90KHgsIHksIHopO1xuICAgIGxldCBzLCBjLCB0O1xuICAgIGxldCBhMDAsIGEwMSwgYTAyLCBhMDM7XG4gICAgbGV0IGExMCwgYTExLCBhMTIsIGExMztcbiAgICBsZXQgYTIwLCBhMjEsIGEyMiwgYTIzO1xuICAgIGxldCBiMDAsIGIwMSwgYjAyO1xuICAgIGxldCBiMTAsIGIxMSwgYjEyO1xuICAgIGxldCBiMjAsIGIyMSwgYjIyO1xuXG4gICAgaWYgKE1hdGguYWJzKGxlbikgPCBFUFNJTE9OKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGxlbiA9IDEgLyBsZW47XG4gICAgeCAqPSBsZW47XG4gICAgeSAqPSBsZW47XG4gICAgeiAqPSBsZW47XG5cbiAgICBzID0gTWF0aC5zaW4ocmFkKTtcbiAgICBjID0gTWF0aC5jb3MocmFkKTtcbiAgICB0ID0gMSAtIGM7XG5cbiAgICBhMDAgPSBhWzBdO1xuICAgIGEwMSA9IGFbMV07XG4gICAgYTAyID0gYVsyXTtcbiAgICBhMDMgPSBhWzNdO1xuICAgIGExMCA9IGFbNF07XG4gICAgYTExID0gYVs1XTtcbiAgICBhMTIgPSBhWzZdO1xuICAgIGExMyA9IGFbN107XG4gICAgYTIwID0gYVs4XTtcbiAgICBhMjEgPSBhWzldO1xuICAgIGEyMiA9IGFbMTBdO1xuICAgIGEyMyA9IGFbMTFdO1xuXG4gICAgLy8gQ29uc3RydWN0IHRoZSBlbGVtZW50cyBvZiB0aGUgcm90YXRpb24gbWF0cml4XG4gICAgYjAwID0geCAqIHggKiB0ICsgYztcbiAgICBiMDEgPSB5ICogeCAqIHQgKyB6ICogcztcbiAgICBiMDIgPSB6ICogeCAqIHQgLSB5ICogcztcbiAgICBiMTAgPSB4ICogeSAqIHQgLSB6ICogcztcbiAgICBiMTEgPSB5ICogeSAqIHQgKyBjO1xuICAgIGIxMiA9IHogKiB5ICogdCArIHggKiBzO1xuICAgIGIyMCA9IHggKiB6ICogdCArIHkgKiBzO1xuICAgIGIyMSA9IHkgKiB6ICogdCAtIHggKiBzO1xuICAgIGIyMiA9IHogKiB6ICogdCArIGM7XG5cbiAgICAvLyBQZXJmb3JtIHJvdGF0aW9uLXNwZWNpZmljIG1hdHJpeCBtdWx0aXBsaWNhdGlvblxuICAgIG91dFswXSA9IGEwMCAqIGIwMCArIGExMCAqIGIwMSArIGEyMCAqIGIwMjtcbiAgICBvdXRbMV0gPSBhMDEgKiBiMDAgKyBhMTEgKiBiMDEgKyBhMjEgKiBiMDI7XG4gICAgb3V0WzJdID0gYTAyICogYjAwICsgYTEyICogYjAxICsgYTIyICogYjAyO1xuICAgIG91dFszXSA9IGEwMyAqIGIwMCArIGExMyAqIGIwMSArIGEyMyAqIGIwMjtcbiAgICBvdXRbNF0gPSBhMDAgKiBiMTAgKyBhMTAgKiBiMTEgKyBhMjAgKiBiMTI7XG4gICAgb3V0WzVdID0gYTAxICogYjEwICsgYTExICogYjExICsgYTIxICogYjEyO1xuICAgIG91dFs2XSA9IGEwMiAqIGIxMCArIGExMiAqIGIxMSArIGEyMiAqIGIxMjtcbiAgICBvdXRbN10gPSBhMDMgKiBiMTAgKyBhMTMgKiBiMTEgKyBhMjMgKiBiMTI7XG4gICAgb3V0WzhdID0gYTAwICogYjIwICsgYTEwICogYjIxICsgYTIwICogYjIyO1xuICAgIG91dFs5XSA9IGEwMSAqIGIyMCArIGExMSAqIGIyMSArIGEyMSAqIGIyMjtcbiAgICBvdXRbMTBdID0gYTAyICogYjIwICsgYTEyICogYjIxICsgYTIyICogYjIyO1xuICAgIG91dFsxMV0gPSBhMDMgKiBiMjAgKyBhMTMgKiBiMjEgKyBhMjMgKiBiMjI7XG5cbiAgICBpZiAoYSAhPT0gb3V0KSB7XG4gICAgICAgIC8vIElmIHRoZSBzb3VyY2UgYW5kIGRlc3RpbmF0aW9uIGRpZmZlciwgY29weSB0aGUgdW5jaGFuZ2VkIGxhc3Qgcm93XG4gICAgICAgIG91dFsxMl0gPSBhWzEyXTtcbiAgICAgICAgb3V0WzEzXSA9IGFbMTNdO1xuICAgICAgICBvdXRbMTRdID0gYVsxNF07XG4gICAgICAgIG91dFsxNV0gPSBhWzE1XTtcbiAgICB9XG4gICAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSB0cmFuc2xhdGlvbiB2ZWN0b3IgY29tcG9uZW50IG9mIGEgdHJhbnNmb3JtYXRpb25cbiAqICBtYXRyaXguIElmIGEgbWF0cml4IGlzIGJ1aWx0IHdpdGggZnJvbVJvdGF0aW9uVHJhbnNsYXRpb24sXG4gKiAgdGhlIHJldHVybmVkIHZlY3RvciB3aWxsIGJlIHRoZSBzYW1lIGFzIHRoZSB0cmFuc2xhdGlvbiB2ZWN0b3JcbiAqICBvcmlnaW5hbGx5IHN1cHBsaWVkLlxuICogQHBhcmFtICB7dmVjM30gb3V0IFZlY3RvciB0byByZWNlaXZlIHRyYW5zbGF0aW9uIGNvbXBvbmVudFxuICogQHBhcmFtICB7bWF0NH0gbWF0IE1hdHJpeCB0byBiZSBkZWNvbXBvc2VkIChpbnB1dClcbiAqIEByZXR1cm4ge3ZlYzN9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0VHJhbnNsYXRpb24ob3V0LCBtYXQpIHtcbiAgICBvdXRbMF0gPSBtYXRbMTJdO1xuICAgIG91dFsxXSA9IG1hdFsxM107XG4gICAgb3V0WzJdID0gbWF0WzE0XTtcblxuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgc2NhbGluZyBmYWN0b3IgY29tcG9uZW50IG9mIGEgdHJhbnNmb3JtYXRpb25cbiAqICBtYXRyaXguIElmIGEgbWF0cml4IGlzIGJ1aWx0IHdpdGggZnJvbVJvdGF0aW9uVHJhbnNsYXRpb25TY2FsZVxuICogIHdpdGggYSBub3JtYWxpemVkIFF1YXRlcm5pb24gcGFyYW10ZXIsIHRoZSByZXR1cm5lZCB2ZWN0b3Igd2lsbCBiZVxuICogIHRoZSBzYW1lIGFzIHRoZSBzY2FsaW5nIHZlY3RvclxuICogIG9yaWdpbmFsbHkgc3VwcGxpZWQuXG4gKiBAcGFyYW0gIHt2ZWMzfSBvdXQgVmVjdG9yIHRvIHJlY2VpdmUgc2NhbGluZyBmYWN0b3IgY29tcG9uZW50XG4gKiBAcGFyYW0gIHttYXQ0fSBtYXQgTWF0cml4IHRvIGJlIGRlY29tcG9zZWQgKGlucHV0KVxuICogQHJldHVybiB7dmVjM30gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRTY2FsaW5nKG91dCwgbWF0KSB7XG4gICAgbGV0IG0xMSA9IG1hdFswXTtcbiAgICBsZXQgbTEyID0gbWF0WzFdO1xuICAgIGxldCBtMTMgPSBtYXRbMl07XG4gICAgbGV0IG0yMSA9IG1hdFs0XTtcbiAgICBsZXQgbTIyID0gbWF0WzVdO1xuICAgIGxldCBtMjMgPSBtYXRbNl07XG4gICAgbGV0IG0zMSA9IG1hdFs4XTtcbiAgICBsZXQgbTMyID0gbWF0WzldO1xuICAgIGxldCBtMzMgPSBtYXRbMTBdO1xuXG4gICAgb3V0WzBdID0gTWF0aC5oeXBvdChtMTEsIG0xMiwgbTEzKTtcbiAgICBvdXRbMV0gPSBNYXRoLmh5cG90KG0yMSwgbTIyLCBtMjMpO1xuICAgIG91dFsyXSA9IE1hdGguaHlwb3QobTMxLCBtMzIsIG0zMyk7XG5cbiAgICByZXR1cm4gb3V0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0TWF4U2NhbGVPbkF4aXMobWF0KSB7XG4gICAgbGV0IG0xMSA9IG1hdFswXTtcbiAgICBsZXQgbTEyID0gbWF0WzFdO1xuICAgIGxldCBtMTMgPSBtYXRbMl07XG4gICAgbGV0IG0yMSA9IG1hdFs0XTtcbiAgICBsZXQgbTIyID0gbWF0WzVdO1xuICAgIGxldCBtMjMgPSBtYXRbNl07XG4gICAgbGV0IG0zMSA9IG1hdFs4XTtcbiAgICBsZXQgbTMyID0gbWF0WzldO1xuICAgIGxldCBtMzMgPSBtYXRbMTBdO1xuXG4gICAgY29uc3QgeCA9IG0xMSAqIG0xMSArIG0xMiAqIG0xMiArIG0xMyAqIG0xMztcbiAgICBjb25zdCB5ID0gbTIxICogbTIxICsgbTIyICogbTIyICsgbTIzICogbTIzO1xuICAgIGNvbnN0IHogPSBtMzEgKiBtMzEgKyBtMzIgKiBtMzIgKyBtMzMgKiBtMzM7XG5cbiAgICByZXR1cm4gTWF0aC5zcXJ0KE1hdGgubWF4KHgsIHksIHopKTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIGEgcXVhdGVybmlvbiByZXByZXNlbnRpbmcgdGhlIHJvdGF0aW9uYWwgY29tcG9uZW50XG4gKiAgb2YgYSB0cmFuc2Zvcm1hdGlvbiBtYXRyaXguIElmIGEgbWF0cml4IGlzIGJ1aWx0IHdpdGhcbiAqICBmcm9tUm90YXRpb25UcmFuc2xhdGlvbiwgdGhlIHJldHVybmVkIHF1YXRlcm5pb24gd2lsbCBiZSB0aGVcbiAqICBzYW1lIGFzIHRoZSBxdWF0ZXJuaW9uIG9yaWdpbmFsbHkgc3VwcGxpZWQuXG4gKiBAcGFyYW0ge3F1YXR9IG91dCBRdWF0ZXJuaW9uIHRvIHJlY2VpdmUgdGhlIHJvdGF0aW9uIGNvbXBvbmVudFxuICogQHBhcmFtIHttYXQ0fSBtYXQgTWF0cml4IHRvIGJlIGRlY29tcG9zZWQgKGlucHV0KVxuICogQHJldHVybiB7cXVhdH0gb3V0XG4gKi9cbmV4cG9ydCBjb25zdCBnZXRSb3RhdGlvbiA9IChmdW5jdGlvbiAoKSB7XG4gICAgY29uc3QgdGVtcCA9IFswLCAwLCAwXTtcblxuICAgIHJldHVybiBmdW5jdGlvbiAob3V0LCBtYXQpIHtcbiAgICAgICAgbGV0IHNjYWxpbmcgPSB0ZW1wO1xuICAgICAgICBnZXRTY2FsaW5nKHNjYWxpbmcsIG1hdCk7XG5cbiAgICAgICAgbGV0IGlzMSA9IDEgLyBzY2FsaW5nWzBdO1xuICAgICAgICBsZXQgaXMyID0gMSAvIHNjYWxpbmdbMV07XG4gICAgICAgIGxldCBpczMgPSAxIC8gc2NhbGluZ1syXTtcblxuICAgICAgICBsZXQgc20xMSA9IG1hdFswXSAqIGlzMTtcbiAgICAgICAgbGV0IHNtMTIgPSBtYXRbMV0gKiBpczI7XG4gICAgICAgIGxldCBzbTEzID0gbWF0WzJdICogaXMzO1xuICAgICAgICBsZXQgc20yMSA9IG1hdFs0XSAqIGlzMTtcbiAgICAgICAgbGV0IHNtMjIgPSBtYXRbNV0gKiBpczI7XG4gICAgICAgIGxldCBzbTIzID0gbWF0WzZdICogaXMzO1xuICAgICAgICBsZXQgc20zMSA9IG1hdFs4XSAqIGlzMTtcbiAgICAgICAgbGV0IHNtMzIgPSBtYXRbOV0gKiBpczI7XG4gICAgICAgIGxldCBzbTMzID0gbWF0WzEwXSAqIGlzMztcblxuICAgICAgICBsZXQgdHJhY2UgPSBzbTExICsgc20yMiArIHNtMzM7XG4gICAgICAgIGxldCBTID0gMDtcblxuICAgICAgICBpZiAodHJhY2UgPiAwKSB7XG4gICAgICAgICAgICBTID0gTWF0aC5zcXJ0KHRyYWNlICsgMS4wKSAqIDI7XG4gICAgICAgICAgICBvdXRbM10gPSAwLjI1ICogUztcbiAgICAgICAgICAgIG91dFswXSA9IChzbTIzIC0gc20zMikgLyBTO1xuICAgICAgICAgICAgb3V0WzFdID0gKHNtMzEgLSBzbTEzKSAvIFM7XG4gICAgICAgICAgICBvdXRbMl0gPSAoc20xMiAtIHNtMjEpIC8gUztcbiAgICAgICAgfSBlbHNlIGlmIChzbTExID4gc20yMiAmJiBzbTExID4gc20zMykge1xuICAgICAgICAgICAgUyA9IE1hdGguc3FydCgxLjAgKyBzbTExIC0gc20yMiAtIHNtMzMpICogMjtcbiAgICAgICAgICAgIG91dFszXSA9IChzbTIzIC0gc20zMikgLyBTO1xuICAgICAgICAgICAgb3V0WzBdID0gMC4yNSAqIFM7XG4gICAgICAgICAgICBvdXRbMV0gPSAoc20xMiArIHNtMjEpIC8gUztcbiAgICAgICAgICAgIG91dFsyXSA9IChzbTMxICsgc20xMykgLyBTO1xuICAgICAgICB9IGVsc2UgaWYgKHNtMjIgPiBzbTMzKSB7XG4gICAgICAgICAgICBTID0gTWF0aC5zcXJ0KDEuMCArIHNtMjIgLSBzbTExIC0gc20zMykgKiAyO1xuICAgICAgICAgICAgb3V0WzNdID0gKHNtMzEgLSBzbTEzKSAvIFM7XG4gICAgICAgICAgICBvdXRbMF0gPSAoc20xMiArIHNtMjEpIC8gUztcbiAgICAgICAgICAgIG91dFsxXSA9IDAuMjUgKiBTO1xuICAgICAgICAgICAgb3V0WzJdID0gKHNtMjMgKyBzbTMyKSAvIFM7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBTID0gTWF0aC5zcXJ0KDEuMCArIHNtMzMgLSBzbTExIC0gc20yMikgKiAyO1xuICAgICAgICAgICAgb3V0WzNdID0gKHNtMTIgLSBzbTIxKSAvIFM7XG4gICAgICAgICAgICBvdXRbMF0gPSAoc20zMSArIHNtMTMpIC8gUztcbiAgICAgICAgICAgIG91dFsxXSA9IChzbTIzICsgc20zMikgLyBTO1xuICAgICAgICAgICAgb3V0WzJdID0gMC4yNSAqIFM7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gb3V0O1xuICAgIH07XG59KSgpO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBtYXRyaXggZnJvbSBhIHF1YXRlcm5pb24gcm90YXRpb24sIHZlY3RvciB0cmFuc2xhdGlvbiBhbmQgdmVjdG9yIHNjYWxlXG4gKiBUaGlzIGlzIGVxdWl2YWxlbnQgdG8gKGJ1dCBtdWNoIGZhc3RlciB0aGFuKTpcbiAqXG4gKiAgICAgbWF0NC5pZGVudGl0eShkZXN0KTtcbiAqICAgICBtYXQ0LnRyYW5zbGF0ZShkZXN0LCB2ZWMpO1xuICogICAgIGxldCBxdWF0TWF0ID0gbWF0NC5jcmVhdGUoKTtcbiAqICAgICBxdWF0NC50b01hdDQocXVhdCwgcXVhdE1hdCk7XG4gKiAgICAgbWF0NC5tdWx0aXBseShkZXN0LCBxdWF0TWF0KTtcbiAqICAgICBtYXQ0LnNjYWxlKGRlc3QsIHNjYWxlKVxuICpcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IG1hdDQgcmVjZWl2aW5nIG9wZXJhdGlvbiByZXN1bHRcbiAqIEBwYXJhbSB7cXVhdDR9IHEgUm90YXRpb24gcXVhdGVybmlvblxuICogQHBhcmFtIHt2ZWMzfSB2IFRyYW5zbGF0aW9uIHZlY3RvclxuICogQHBhcmFtIHt2ZWMzfSBzIFNjYWxpbmcgdmVjdG9yXG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmcm9tUm90YXRpb25UcmFuc2xhdGlvblNjYWxlKG91dCwgcSwgdiwgcykge1xuICAgIC8vIFF1YXRlcm5pb24gbWF0aFxuICAgIGxldCB4ID0gcVswXSxcbiAgICAgICAgeSA9IHFbMV0sXG4gICAgICAgIHogPSBxWzJdLFxuICAgICAgICB3ID0gcVszXTtcbiAgICBsZXQgeDIgPSB4ICsgeDtcbiAgICBsZXQgeTIgPSB5ICsgeTtcbiAgICBsZXQgejIgPSB6ICsgejtcblxuICAgIGxldCB4eCA9IHggKiB4MjtcbiAgICBsZXQgeHkgPSB4ICogeTI7XG4gICAgbGV0IHh6ID0geCAqIHoyO1xuICAgIGxldCB5eSA9IHkgKiB5MjtcbiAgICBsZXQgeXogPSB5ICogejI7XG4gICAgbGV0IHp6ID0geiAqIHoyO1xuICAgIGxldCB3eCA9IHcgKiB4MjtcbiAgICBsZXQgd3kgPSB3ICogeTI7XG4gICAgbGV0IHd6ID0gdyAqIHoyO1xuICAgIGxldCBzeCA9IHNbMF07XG4gICAgbGV0IHN5ID0gc1sxXTtcbiAgICBsZXQgc3ogPSBzWzJdO1xuXG4gICAgb3V0WzBdID0gKDEgLSAoeXkgKyB6eikpICogc3g7XG4gICAgb3V0WzFdID0gKHh5ICsgd3opICogc3g7XG4gICAgb3V0WzJdID0gKHh6IC0gd3kpICogc3g7XG4gICAgb3V0WzNdID0gMDtcbiAgICBvdXRbNF0gPSAoeHkgLSB3eikgKiBzeTtcbiAgICBvdXRbNV0gPSAoMSAtICh4eCArIHp6KSkgKiBzeTtcbiAgICBvdXRbNl0gPSAoeXogKyB3eCkgKiBzeTtcbiAgICBvdXRbN10gPSAwO1xuICAgIG91dFs4XSA9ICh4eiArIHd5KSAqIHN6O1xuICAgIG91dFs5XSA9ICh5eiAtIHd4KSAqIHN6O1xuICAgIG91dFsxMF0gPSAoMSAtICh4eCArIHl5KSkgKiBzejtcbiAgICBvdXRbMTFdID0gMDtcbiAgICBvdXRbMTJdID0gdlswXTtcbiAgICBvdXRbMTNdID0gdlsxXTtcbiAgICBvdXRbMTRdID0gdlsyXTtcbiAgICBvdXRbMTVdID0gMTtcblxuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogQ2FsY3VsYXRlcyBhIDR4NCBtYXRyaXggZnJvbSB0aGUgZ2l2ZW4gcXVhdGVybmlvblxuICpcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IG1hdDQgcmVjZWl2aW5nIG9wZXJhdGlvbiByZXN1bHRcbiAqIEBwYXJhbSB7cXVhdH0gcSBRdWF0ZXJuaW9uIHRvIGNyZWF0ZSBtYXRyaXggZnJvbVxuICpcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZyb21RdWF0KG91dCwgcSkge1xuICAgIGxldCB4ID0gcVswXSxcbiAgICAgICAgeSA9IHFbMV0sXG4gICAgICAgIHogPSBxWzJdLFxuICAgICAgICB3ID0gcVszXTtcbiAgICBsZXQgeDIgPSB4ICsgeDtcbiAgICBsZXQgeTIgPSB5ICsgeTtcbiAgICBsZXQgejIgPSB6ICsgejtcblxuICAgIGxldCB4eCA9IHggKiB4MjtcbiAgICBsZXQgeXggPSB5ICogeDI7XG4gICAgbGV0IHl5ID0geSAqIHkyO1xuICAgIGxldCB6eCA9IHogKiB4MjtcbiAgICBsZXQgenkgPSB6ICogeTI7XG4gICAgbGV0IHp6ID0geiAqIHoyO1xuICAgIGxldCB3eCA9IHcgKiB4MjtcbiAgICBsZXQgd3kgPSB3ICogeTI7XG4gICAgbGV0IHd6ID0gdyAqIHoyO1xuXG4gICAgb3V0WzBdID0gMSAtIHl5IC0geno7XG4gICAgb3V0WzFdID0geXggKyB3ejtcbiAgICBvdXRbMl0gPSB6eCAtIHd5O1xuICAgIG91dFszXSA9IDA7XG5cbiAgICBvdXRbNF0gPSB5eCAtIHd6O1xuICAgIG91dFs1XSA9IDEgLSB4eCAtIHp6O1xuICAgIG91dFs2XSA9IHp5ICsgd3g7XG4gICAgb3V0WzddID0gMDtcblxuICAgIG91dFs4XSA9IHp4ICsgd3k7XG4gICAgb3V0WzldID0genkgLSB3eDtcbiAgICBvdXRbMTBdID0gMSAtIHh4IC0geXk7XG4gICAgb3V0WzExXSA9IDA7XG5cbiAgICBvdXRbMTJdID0gMDtcbiAgICBvdXRbMTNdID0gMDtcbiAgICBvdXRbMTRdID0gMDtcbiAgICBvdXRbMTVdID0gMTtcblxuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogR2VuZXJhdGVzIGEgcGVyc3BlY3RpdmUgcHJvamVjdGlvbiBtYXRyaXggd2l0aCB0aGUgZ2l2ZW4gYm91bmRzXG4gKlxuICogQHBhcmFtIHttYXQ0fSBvdXQgbWF0NCBmcnVzdHVtIG1hdHJpeCB3aWxsIGJlIHdyaXR0ZW4gaW50b1xuICogQHBhcmFtIHtudW1iZXJ9IGxlZnQgVmVydGljYWwgZmllbGQgb2YgdmlldyBpbiByYWRpYW5zXG4gKiBAcGFyYW0ge251bWJlcn0gcmlnaHQgQXNwZWN0IHJhdGlvLiB0eXBpY2FsbHkgdmlld3BvcnQgd2lkdGgvaGVpZ2h0XG4gKiBAcGFyYW0ge251bWJlcn0gdG9wIFZlcnRpY2FsIGZpZWxkIG9mIHZpZXcgaW4gcmFkaWFuc1xuICogQHBhcmFtIHtudW1iZXJ9IGJvdHRvbSBBc3BlY3QgcmF0aW8uIHR5cGljYWxseSB2aWV3cG9ydCB3aWR0aC9oZWlnaHRcbiAqIEBwYXJhbSB7bnVtYmVyfSBuZWFyIE5lYXIgYm91bmQgb2YgdGhlIGZydXN0dW1cbiAqIEBwYXJhbSB7bnVtYmVyfSBmYXIgRmFyIGJvdW5kIG9mIHRoZSBmcnVzdHVtXG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwZXJzcGVjdGl2ZUZydXN0cnVtKG91dCwgbGVmdCwgcmlnaHQsIHRvcCwgYm90dG9tLCBuZWFyLCBmYXIpIHtcbiAgICB2YXIgeCA9IDIgKiBuZWFyIC8gKCByaWdodCAtIGxlZnQgKTtcbiAgICB2YXIgeSA9IDIgKiBuZWFyIC8gKCB0b3AgLSBib3R0b20gKTtcblxuICAgIHZhciBhID0gKCByaWdodCArIGxlZnQgKSAvICggcmlnaHQgLSBsZWZ0ICk7XG4gICAgdmFyIGIgPSAoIHRvcCArIGJvdHRvbSApIC8gKCB0b3AgLSBib3R0b20gKTtcbiAgICB2YXIgYyA9IC0gKCBmYXIgKyBuZWFyICkgLyAoIGZhciAtIG5lYXIgKTtcbiAgICB2YXIgZCA9IC0gMiAqIGZhciAqIG5lYXIgLyAoIGZhciAtIG5lYXIgKTtcblxuICAgIG91dFsgMCBdID0geDtcdG91dFsgNCBdID0gMDtcdG91dFsgOCBdID0gYTtcdG91dFsgMTIgXSA9IDA7XG4gICAgb3V0WyAxIF0gPSAwO1x0b3V0WyA1IF0gPSB5O1x0b3V0WyA5IF0gPSBiO1x0b3V0WyAxMyBdID0gMDtcbiAgICBvdXRbIDIgXSA9IDA7XHRvdXRbIDYgXSA9IDA7XHRvdXRbIDEwIF0gPSBjO1x0b3V0WyAxNCBdID0gZDtcbiAgICBvdXRbIDMgXSA9IDA7XHRvdXRbIDcgXSA9IDA7XHRvdXRbIDExIF0gPSAtIDE7XHRvdXRbIDE1IF0gPSAwO1xuXG4gICAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBHZW5lcmF0ZXMgYSBwZXJzcGVjdGl2ZSBwcm9qZWN0aW9uIG1hdHJpeCB3aXRoIHRoZSBnaXZlbiBib3VuZHNcbiAqXG4gKiBAcGFyYW0ge21hdDR9IG91dCBtYXQ0IGZydXN0dW0gbWF0cml4IHdpbGwgYmUgd3JpdHRlbiBpbnRvXG4gKiBAcGFyYW0ge251bWJlcn0gZm92eSBWZXJ0aWNhbCBmaWVsZCBvZiB2aWV3IGluIHJhZGlhbnNcbiAqIEBwYXJhbSB7bnVtYmVyfSBhc3BlY3QgQXNwZWN0IHJhdGlvLiB0eXBpY2FsbHkgdmlld3BvcnQgd2lkdGgvaGVpZ2h0XG4gKiBAcGFyYW0ge251bWJlcn0gbmVhciBOZWFyIGJvdW5kIG9mIHRoZSBmcnVzdHVtXG4gKiBAcGFyYW0ge251bWJlcn0gZmFyIEZhciBib3VuZCBvZiB0aGUgZnJ1c3R1bVxuICogQHJldHVybnMge21hdDR9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gcGVyc3BlY3RpdmUob3V0LCBmb3Z5LCBhc3BlY3QsIG5lYXIsIGZhcikge1xuICAgIGxldCBmID0gMS4wIC8gTWF0aC50YW4oZm92eSAvIDIpO1xuICAgIGxldCBuZiA9IDEgLyAobmVhciAtIGZhcik7XG4gICAgb3V0WzBdID0gZiAvIGFzcGVjdDtcbiAgICBvdXRbMV0gPSAwO1xuICAgIG91dFsyXSA9IDA7XG4gICAgb3V0WzNdID0gMDtcbiAgICBvdXRbNF0gPSAwO1xuICAgIG91dFs1XSA9IGY7XG4gICAgb3V0WzZdID0gMDtcbiAgICBvdXRbN10gPSAwO1xuICAgIG91dFs4XSA9IDA7XG4gICAgb3V0WzldID0gMDtcbiAgICBvdXRbMTBdID0gKGZhciArIG5lYXIpICogbmY7XG4gICAgb3V0WzExXSA9IC0xO1xuICAgIG91dFsxMl0gPSAwO1xuICAgIG91dFsxM10gPSAwO1xuICAgIG91dFsxNF0gPSAyICogZmFyICogbmVhciAqIG5mO1xuICAgIG91dFsxNV0gPSAwO1xuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogR2VuZXJhdGVzIGEgb3J0aG9nb25hbCBwcm9qZWN0aW9uIG1hdHJpeCB3aXRoIHRoZSBnaXZlbiBib3VuZHNcbiAqXG4gKiBAcGFyYW0ge21hdDR9IG91dCBtYXQ0IGZydXN0dW0gbWF0cml4IHdpbGwgYmUgd3JpdHRlbiBpbnRvXG4gKiBAcGFyYW0ge251bWJlcn0gbGVmdCBMZWZ0IGJvdW5kIG9mIHRoZSBmcnVzdHVtXG4gKiBAcGFyYW0ge251bWJlcn0gcmlnaHQgUmlnaHQgYm91bmQgb2YgdGhlIGZydXN0dW1cbiAqIEBwYXJhbSB7bnVtYmVyfSBib3R0b20gQm90dG9tIGJvdW5kIG9mIHRoZSBmcnVzdHVtXG4gKiBAcGFyYW0ge251bWJlcn0gdG9wIFRvcCBib3VuZCBvZiB0aGUgZnJ1c3R1bVxuICogQHBhcmFtIHtudW1iZXJ9IG5lYXIgTmVhciBib3VuZCBvZiB0aGUgZnJ1c3R1bVxuICogQHBhcmFtIHtudW1iZXJ9IGZhciBGYXIgYm91bmQgb2YgdGhlIGZydXN0dW1cbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG9ydGhvKG91dCwgbGVmdCwgcmlnaHQsIGJvdHRvbSwgdG9wLCBuZWFyLCBmYXIpIHtcbiAgICBsZXQgbHIgPSAxIC8gKGxlZnQgLSByaWdodCk7XG4gICAgbGV0IGJ0ID0gMSAvIChib3R0b20gLSB0b3ApO1xuICAgIGxldCBuZiA9IDEgLyAobmVhciAtIGZhcik7XG4gICAgb3V0WzBdID0gLTIgKiBscjtcbiAgICBvdXRbMV0gPSAwO1xuICAgIG91dFsyXSA9IDA7XG4gICAgb3V0WzNdID0gMDtcbiAgICBvdXRbNF0gPSAwO1xuICAgIG91dFs1XSA9IC0yICogYnQ7XG4gICAgb3V0WzZdID0gMDtcbiAgICBvdXRbN10gPSAwO1xuICAgIG91dFs4XSA9IDA7XG4gICAgb3V0WzldID0gMDtcbiAgICBvdXRbMTBdID0gMiAqIG5mO1xuICAgIG91dFsxMV0gPSAwO1xuICAgIG91dFsxMl0gPSAobGVmdCArIHJpZ2h0KSAqIGxyO1xuICAgIG91dFsxM10gPSAodG9wICsgYm90dG9tKSAqIGJ0O1xuICAgIG91dFsxNF0gPSAoZmFyICsgbmVhcikgKiBuZjtcbiAgICBvdXRbMTVdID0gMTtcbiAgICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIEdlbmVyYXRlcyBhIG1hdHJpeCB0aGF0IG1ha2VzIHNvbWV0aGluZyBsb29rIGF0IHNvbWV0aGluZyBlbHNlLlxuICpcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IG1hdDQgZnJ1c3R1bSBtYXRyaXggd2lsbCBiZSB3cml0dGVuIGludG9cbiAqIEBwYXJhbSB7dmVjM30gZXllIFBvc2l0aW9uIG9mIHRoZSB2aWV3ZXJcbiAqIEBwYXJhbSB7dmVjM30gdGFyZ2V0IFBvaW50IHRoZSB2aWV3ZXIgaXMgbG9va2luZyBhdFxuICogQHBhcmFtIHt2ZWMzfSB1cCB2ZWMzIHBvaW50aW5nIHVwXG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0YXJnZXRUbyhvdXQsIGV5ZSwgdGFyZ2V0LCB1cCkge1xuICAgIGxldCBleWV4ID0gZXllWzBdLFxuICAgICAgICBleWV5ID0gZXllWzFdLFxuICAgICAgICBleWV6ID0gZXllWzJdLFxuICAgICAgICB1cHggPSB1cFswXSxcbiAgICAgICAgdXB5ID0gdXBbMV0sXG4gICAgICAgIHVweiA9IHVwWzJdO1xuXG4gICAgbGV0IHowID0gZXlleCAtIHRhcmdldFswXSxcbiAgICAgICAgejEgPSBleWV5IC0gdGFyZ2V0WzFdLFxuICAgICAgICB6MiA9IGV5ZXogLSB0YXJnZXRbMl07XG5cbiAgICBsZXQgbGVuID0gejAgKiB6MCArIHoxICogejEgKyB6MiAqIHoyO1xuICAgIGlmIChsZW4gPT09IDApIHtcbiAgICAgICAgLy8gZXllIGFuZCB0YXJnZXQgYXJlIGluIHRoZSBzYW1lIHBvc2l0aW9uXG4gICAgICAgIHoyID0gMTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBsZW4gPSAxIC8gTWF0aC5zcXJ0KGxlbik7XG4gICAgICAgIHowICo9IGxlbjtcbiAgICAgICAgejEgKj0gbGVuO1xuICAgICAgICB6MiAqPSBsZW47XG4gICAgfVxuXG4gICAgbGV0IHgwID0gdXB5ICogejIgLSB1cHogKiB6MSxcbiAgICAgICAgeDEgPSB1cHogKiB6MCAtIHVweCAqIHoyLFxuICAgICAgICB4MiA9IHVweCAqIHoxIC0gdXB5ICogejA7XG5cbiAgICBsZW4gPSB4MCAqIHgwICsgeDEgKiB4MSArIHgyICogeDI7XG4gICAgaWYgKGxlbiA9PT0gMCkge1xuICAgICAgICAvLyB1cCBhbmQgeiBhcmUgcGFyYWxsZWxcbiAgICAgICAgaWYgKHVweikge1xuICAgICAgICAgICAgdXB4ICs9IDFlLTY7XG4gICAgICAgIH0gZWxzZSBpZiAodXB5KSB7XG4gICAgICAgICAgICB1cHogKz0gMWUtNjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHVweSArPSAxZS02O1xuICAgICAgICB9XG4gICAgICAgICh4MCA9IHVweSAqIHoyIC0gdXB6ICogejEpLCAoeDEgPSB1cHogKiB6MCAtIHVweCAqIHoyKSwgKHgyID0gdXB4ICogejEgLSB1cHkgKiB6MCk7XG5cbiAgICAgICAgbGVuID0geDAgKiB4MCArIHgxICogeDEgKyB4MiAqIHgyO1xuICAgIH1cblxuICAgIGxlbiA9IDEgLyBNYXRoLnNxcnQobGVuKTtcbiAgICB4MCAqPSBsZW47XG4gICAgeDEgKj0gbGVuO1xuICAgIHgyICo9IGxlbjtcblxuICAgIG91dFswXSA9IHgwO1xuICAgIG91dFsxXSA9IHgxO1xuICAgIG91dFsyXSA9IHgyO1xuICAgIG91dFszXSA9IDA7XG4gICAgb3V0WzRdID0gejEgKiB4MiAtIHoyICogeDE7XG4gICAgb3V0WzVdID0gejIgKiB4MCAtIHowICogeDI7XG4gICAgb3V0WzZdID0gejAgKiB4MSAtIHoxICogeDA7XG4gICAgb3V0WzddID0gMDtcbiAgICBvdXRbOF0gPSB6MDtcbiAgICBvdXRbOV0gPSB6MTtcbiAgICBvdXRbMTBdID0gejI7XG4gICAgb3V0WzExXSA9IDA7XG4gICAgb3V0WzEyXSA9IGV5ZXg7XG4gICAgb3V0WzEzXSA9IGV5ZXk7XG4gICAgb3V0WzE0XSA9IGV5ZXo7XG4gICAgb3V0WzE1XSA9IDE7XG4gICAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBBZGRzIHR3byBtYXQ0J3NcbiAqXG4gKiBAcGFyYW0ge21hdDR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQ0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge21hdDR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhZGQob3V0LCBhLCBiKSB7XG4gICAgb3V0WzBdID0gYVswXSArIGJbMF07XG4gICAgb3V0WzFdID0gYVsxXSArIGJbMV07XG4gICAgb3V0WzJdID0gYVsyXSArIGJbMl07XG4gICAgb3V0WzNdID0gYVszXSArIGJbM107XG4gICAgb3V0WzRdID0gYVs0XSArIGJbNF07XG4gICAgb3V0WzVdID0gYVs1XSArIGJbNV07XG4gICAgb3V0WzZdID0gYVs2XSArIGJbNl07XG4gICAgb3V0WzddID0gYVs3XSArIGJbN107XG4gICAgb3V0WzhdID0gYVs4XSArIGJbOF07XG4gICAgb3V0WzldID0gYVs5XSArIGJbOV07XG4gICAgb3V0WzEwXSA9IGFbMTBdICsgYlsxMF07XG4gICAgb3V0WzExXSA9IGFbMTFdICsgYlsxMV07XG4gICAgb3V0WzEyXSA9IGFbMTJdICsgYlsxMl07XG4gICAgb3V0WzEzXSA9IGFbMTNdICsgYlsxM107XG4gICAgb3V0WzE0XSA9IGFbMTRdICsgYlsxNF07XG4gICAgb3V0WzE1XSA9IGFbMTVdICsgYlsxNV07XG4gICAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBTdWJ0cmFjdHMgbWF0cml4IGIgZnJvbSBtYXRyaXggYVxuICpcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7bWF0NH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHN1YnRyYWN0KG91dCwgYSwgYikge1xuICAgIG91dFswXSA9IGFbMF0gLSBiWzBdO1xuICAgIG91dFsxXSA9IGFbMV0gLSBiWzFdO1xuICAgIG91dFsyXSA9IGFbMl0gLSBiWzJdO1xuICAgIG91dFszXSA9IGFbM10gLSBiWzNdO1xuICAgIG91dFs0XSA9IGFbNF0gLSBiWzRdO1xuICAgIG91dFs1XSA9IGFbNV0gLSBiWzVdO1xuICAgIG91dFs2XSA9IGFbNl0gLSBiWzZdO1xuICAgIG91dFs3XSA9IGFbN10gLSBiWzddO1xuICAgIG91dFs4XSA9IGFbOF0gLSBiWzhdO1xuICAgIG91dFs5XSA9IGFbOV0gLSBiWzldO1xuICAgIG91dFsxMF0gPSBhWzEwXSAtIGJbMTBdO1xuICAgIG91dFsxMV0gPSBhWzExXSAtIGJbMTFdO1xuICAgIG91dFsxMl0gPSBhWzEyXSAtIGJbMTJdO1xuICAgIG91dFsxM10gPSBhWzEzXSAtIGJbMTNdO1xuICAgIG91dFsxNF0gPSBhWzE0XSAtIGJbMTRdO1xuICAgIG91dFsxNV0gPSBhWzE1XSAtIGJbMTVdO1xuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogTXVsdGlwbHkgZWFjaCBlbGVtZW50IG9mIHRoZSBtYXRyaXggYnkgYSBzY2FsYXIuXG4gKlxuICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0NH0gYSB0aGUgbWF0cml4IHRvIHNjYWxlXG4gKiBAcGFyYW0ge051bWJlcn0gYiBhbW91bnQgdG8gc2NhbGUgdGhlIG1hdHJpeCdzIGVsZW1lbnRzIGJ5XG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtdWx0aXBseVNjYWxhcihvdXQsIGEsIGIpIHtcbiAgICBvdXRbMF0gPSBhWzBdICogYjtcbiAgICBvdXRbMV0gPSBhWzFdICogYjtcbiAgICBvdXRbMl0gPSBhWzJdICogYjtcbiAgICBvdXRbM10gPSBhWzNdICogYjtcbiAgICBvdXRbNF0gPSBhWzRdICogYjtcbiAgICBvdXRbNV0gPSBhWzVdICogYjtcbiAgICBvdXRbNl0gPSBhWzZdICogYjtcbiAgICBvdXRbN10gPSBhWzddICogYjtcbiAgICBvdXRbOF0gPSBhWzhdICogYjtcbiAgICBvdXRbOV0gPSBhWzldICogYjtcbiAgICBvdXRbMTBdID0gYVsxMF0gKiBiO1xuICAgIG91dFsxMV0gPSBhWzExXSAqIGI7XG4gICAgb3V0WzEyXSA9IGFbMTJdICogYjtcbiAgICBvdXRbMTNdID0gYVsxM10gKiBiO1xuICAgIG91dFsxNF0gPSBhWzE0XSAqIGI7XG4gICAgb3V0WzE1XSA9IGFbMTVdICogYjtcbiAgICByZXR1cm4gb3V0O1xufVxuIiwiaW1wb3J0ICogYXMgdmVjNCBmcm9tICcuL1ZlYzRGdW5jLmpzJztcblxuLyoqXG4gKiBTZXQgYSBxdWF0IHRvIHRoZSBpZGVudGl0eSBxdWF0ZXJuaW9uXG4gKlxuICogQHBhcmFtIHtxdWF0fSBvdXQgdGhlIHJlY2VpdmluZyBxdWF0ZXJuaW9uXG4gKiBAcmV0dXJucyB7cXVhdH0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpZGVudGl0eShvdXQpIHtcbiAgICBvdXRbMF0gPSAwO1xuICAgIG91dFsxXSA9IDA7XG4gICAgb3V0WzJdID0gMDtcbiAgICBvdXRbM10gPSAxO1xuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogU2V0cyBhIHF1YXQgZnJvbSB0aGUgZ2l2ZW4gYW5nbGUgYW5kIHJvdGF0aW9uIGF4aXMsXG4gKiB0aGVuIHJldHVybnMgaXQuXG4gKlxuICogQHBhcmFtIHtxdWF0fSBvdXQgdGhlIHJlY2VpdmluZyBxdWF0ZXJuaW9uXG4gKiBAcGFyYW0ge3ZlYzN9IGF4aXMgdGhlIGF4aXMgYXJvdW5kIHdoaWNoIHRvIHJvdGF0ZVxuICogQHBhcmFtIHtOdW1iZXJ9IHJhZCB0aGUgYW5nbGUgaW4gcmFkaWFuc1xuICogQHJldHVybnMge3F1YXR9IG91dFxuICoqL1xuZXhwb3J0IGZ1bmN0aW9uIHNldEF4aXNBbmdsZShvdXQsIGF4aXMsIHJhZCkge1xuICAgIHJhZCA9IHJhZCAqIDAuNTtcbiAgICBsZXQgcyA9IE1hdGguc2luKHJhZCk7XG4gICAgb3V0WzBdID0gcyAqIGF4aXNbMF07XG4gICAgb3V0WzFdID0gcyAqIGF4aXNbMV07XG4gICAgb3V0WzJdID0gcyAqIGF4aXNbMl07XG4gICAgb3V0WzNdID0gTWF0aC5jb3MocmFkKTtcbiAgICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIE11bHRpcGxpZXMgdHdvIHF1YXRzXG4gKlxuICogQHBhcmFtIHtxdWF0fSBvdXQgdGhlIHJlY2VpdmluZyBxdWF0ZXJuaW9uXG4gKiBAcGFyYW0ge3F1YXR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7cXVhdH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHtxdWF0fSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG11bHRpcGx5KG91dCwgYSwgYikge1xuICAgIGxldCBheCA9IGFbMF0sXG4gICAgICAgIGF5ID0gYVsxXSxcbiAgICAgICAgYXogPSBhWzJdLFxuICAgICAgICBhdyA9IGFbM107XG4gICAgbGV0IGJ4ID0gYlswXSxcbiAgICAgICAgYnkgPSBiWzFdLFxuICAgICAgICBieiA9IGJbMl0sXG4gICAgICAgIGJ3ID0gYlszXTtcblxuICAgIG91dFswXSA9IGF4ICogYncgKyBhdyAqIGJ4ICsgYXkgKiBieiAtIGF6ICogYnk7XG4gICAgb3V0WzFdID0gYXkgKiBidyArIGF3ICogYnkgKyBheiAqIGJ4IC0gYXggKiBiejtcbiAgICBvdXRbMl0gPSBheiAqIGJ3ICsgYXcgKiBieiArIGF4ICogYnkgLSBheSAqIGJ4O1xuICAgIG91dFszXSA9IGF3ICogYncgLSBheCAqIGJ4IC0gYXkgKiBieSAtIGF6ICogYno7XG4gICAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBSb3RhdGVzIGEgcXVhdGVybmlvbiBieSB0aGUgZ2l2ZW4gYW5nbGUgYWJvdXQgdGhlIFggYXhpc1xuICpcbiAqIEBwYXJhbSB7cXVhdH0gb3V0IHF1YXQgcmVjZWl2aW5nIG9wZXJhdGlvbiByZXN1bHRcbiAqIEBwYXJhbSB7cXVhdH0gYSBxdWF0IHRvIHJvdGF0ZVxuICogQHBhcmFtIHtudW1iZXJ9IHJhZCBhbmdsZSAoaW4gcmFkaWFucykgdG8gcm90YXRlXG4gKiBAcmV0dXJucyB7cXVhdH0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByb3RhdGVYKG91dCwgYSwgcmFkKSB7XG4gICAgcmFkICo9IDAuNTtcblxuICAgIGxldCBheCA9IGFbMF0sXG4gICAgICAgIGF5ID0gYVsxXSxcbiAgICAgICAgYXogPSBhWzJdLFxuICAgICAgICBhdyA9IGFbM107XG4gICAgbGV0IGJ4ID0gTWF0aC5zaW4ocmFkKSxcbiAgICAgICAgYncgPSBNYXRoLmNvcyhyYWQpO1xuXG4gICAgb3V0WzBdID0gYXggKiBidyArIGF3ICogYng7XG4gICAgb3V0WzFdID0gYXkgKiBidyArIGF6ICogYng7XG4gICAgb3V0WzJdID0gYXogKiBidyAtIGF5ICogYng7XG4gICAgb3V0WzNdID0gYXcgKiBidyAtIGF4ICogYng7XG4gICAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBSb3RhdGVzIGEgcXVhdGVybmlvbiBieSB0aGUgZ2l2ZW4gYW5nbGUgYWJvdXQgdGhlIFkgYXhpc1xuICpcbiAqIEBwYXJhbSB7cXVhdH0gb3V0IHF1YXQgcmVjZWl2aW5nIG9wZXJhdGlvbiByZXN1bHRcbiAqIEBwYXJhbSB7cXVhdH0gYSBxdWF0IHRvIHJvdGF0ZVxuICogQHBhcmFtIHtudW1iZXJ9IHJhZCBhbmdsZSAoaW4gcmFkaWFucykgdG8gcm90YXRlXG4gKiBAcmV0dXJucyB7cXVhdH0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByb3RhdGVZKG91dCwgYSwgcmFkKSB7XG4gICAgcmFkICo9IDAuNTtcblxuICAgIGxldCBheCA9IGFbMF0sXG4gICAgICAgIGF5ID0gYVsxXSxcbiAgICAgICAgYXogPSBhWzJdLFxuICAgICAgICBhdyA9IGFbM107XG4gICAgbGV0IGJ5ID0gTWF0aC5zaW4ocmFkKSxcbiAgICAgICAgYncgPSBNYXRoLmNvcyhyYWQpO1xuXG4gICAgb3V0WzBdID0gYXggKiBidyAtIGF6ICogYnk7XG4gICAgb3V0WzFdID0gYXkgKiBidyArIGF3ICogYnk7XG4gICAgb3V0WzJdID0gYXogKiBidyArIGF4ICogYnk7XG4gICAgb3V0WzNdID0gYXcgKiBidyAtIGF5ICogYnk7XG4gICAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBSb3RhdGVzIGEgcXVhdGVybmlvbiBieSB0aGUgZ2l2ZW4gYW5nbGUgYWJvdXQgdGhlIFogYXhpc1xuICpcbiAqIEBwYXJhbSB7cXVhdH0gb3V0IHF1YXQgcmVjZWl2aW5nIG9wZXJhdGlvbiByZXN1bHRcbiAqIEBwYXJhbSB7cXVhdH0gYSBxdWF0IHRvIHJvdGF0ZVxuICogQHBhcmFtIHtudW1iZXJ9IHJhZCBhbmdsZSAoaW4gcmFkaWFucykgdG8gcm90YXRlXG4gKiBAcmV0dXJucyB7cXVhdH0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByb3RhdGVaKG91dCwgYSwgcmFkKSB7XG4gICAgcmFkICo9IDAuNTtcblxuICAgIGxldCBheCA9IGFbMF0sXG4gICAgICAgIGF5ID0gYVsxXSxcbiAgICAgICAgYXogPSBhWzJdLFxuICAgICAgICBhdyA9IGFbM107XG4gICAgbGV0IGJ6ID0gTWF0aC5zaW4ocmFkKSxcbiAgICAgICAgYncgPSBNYXRoLmNvcyhyYWQpO1xuXG4gICAgb3V0WzBdID0gYXggKiBidyArIGF5ICogYno7XG4gICAgb3V0WzFdID0gYXkgKiBidyAtIGF4ICogYno7XG4gICAgb3V0WzJdID0gYXogKiBidyArIGF3ICogYno7XG4gICAgb3V0WzNdID0gYXcgKiBidyAtIGF6ICogYno7XG4gICAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBQZXJmb3JtcyBhIHNwaGVyaWNhbCBsaW5lYXIgaW50ZXJwb2xhdGlvbiBiZXR3ZWVuIHR3byBxdWF0XG4gKlxuICogQHBhcmFtIHtxdWF0fSBvdXQgdGhlIHJlY2VpdmluZyBxdWF0ZXJuaW9uXG4gKiBAcGFyYW0ge3F1YXR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7cXVhdH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEBwYXJhbSB7TnVtYmVyfSB0IGludGVycG9sYXRpb24gYW1vdW50IGJldHdlZW4gdGhlIHR3byBpbnB1dHNcbiAqIEByZXR1cm5zIHtxdWF0fSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNsZXJwKG91dCwgYSwgYiwgdCkge1xuICAgIC8vIGJlbmNobWFya3M6XG4gICAgLy8gICAgaHR0cDovL2pzcGVyZi5jb20vcXVhdGVybmlvbi1zbGVycC1pbXBsZW1lbnRhdGlvbnNcbiAgICBsZXQgYXggPSBhWzBdLFxuICAgICAgICBheSA9IGFbMV0sXG4gICAgICAgIGF6ID0gYVsyXSxcbiAgICAgICAgYXcgPSBhWzNdO1xuICAgIGxldCBieCA9IGJbMF0sXG4gICAgICAgIGJ5ID0gYlsxXSxcbiAgICAgICAgYnogPSBiWzJdLFxuICAgICAgICBidyA9IGJbM107XG5cbiAgICBsZXQgb21lZ2EsIGNvc29tLCBzaW5vbSwgc2NhbGUwLCBzY2FsZTE7XG5cbiAgICAvLyBjYWxjIGNvc2luZVxuICAgIGNvc29tID0gYXggKiBieCArIGF5ICogYnkgKyBheiAqIGJ6ICsgYXcgKiBidztcbiAgICAvLyBhZGp1c3Qgc2lnbnMgKGlmIG5lY2Vzc2FyeSlcbiAgICBpZiAoY29zb20gPCAwLjApIHtcbiAgICAgICAgY29zb20gPSAtY29zb207XG4gICAgICAgIGJ4ID0gLWJ4O1xuICAgICAgICBieSA9IC1ieTtcbiAgICAgICAgYnogPSAtYno7XG4gICAgICAgIGJ3ID0gLWJ3O1xuICAgIH1cbiAgICAvLyBjYWxjdWxhdGUgY29lZmZpY2llbnRzXG4gICAgaWYgKDEuMCAtIGNvc29tID4gMC4wMDAwMDEpIHtcbiAgICAgICAgLy8gc3RhbmRhcmQgY2FzZSAoc2xlcnApXG4gICAgICAgIG9tZWdhID0gTWF0aC5hY29zKGNvc29tKTtcbiAgICAgICAgc2lub20gPSBNYXRoLnNpbihvbWVnYSk7XG4gICAgICAgIHNjYWxlMCA9IE1hdGguc2luKCgxLjAgLSB0KSAqIG9tZWdhKSAvIHNpbm9tO1xuICAgICAgICBzY2FsZTEgPSBNYXRoLnNpbih0ICogb21lZ2EpIC8gc2lub207XG4gICAgfSBlbHNlIHtcbiAgICAgICAgLy8gXCJmcm9tXCIgYW5kIFwidG9cIiBxdWF0ZXJuaW9ucyBhcmUgdmVyeSBjbG9zZVxuICAgICAgICAvLyAgLi4uIHNvIHdlIGNhbiBkbyBhIGxpbmVhciBpbnRlcnBvbGF0aW9uXG4gICAgICAgIHNjYWxlMCA9IDEuMCAtIHQ7XG4gICAgICAgIHNjYWxlMSA9IHQ7XG4gICAgfVxuICAgIC8vIGNhbGN1bGF0ZSBmaW5hbCB2YWx1ZXNcbiAgICBvdXRbMF0gPSBzY2FsZTAgKiBheCArIHNjYWxlMSAqIGJ4O1xuICAgIG91dFsxXSA9IHNjYWxlMCAqIGF5ICsgc2NhbGUxICogYnk7XG4gICAgb3V0WzJdID0gc2NhbGUwICogYXogKyBzY2FsZTEgKiBiejtcbiAgICBvdXRbM10gPSBzY2FsZTAgKiBhdyArIHNjYWxlMSAqIGJ3O1xuXG4gICAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBpbnZlcnNlIG9mIGEgcXVhdFxuICpcbiAqIEBwYXJhbSB7cXVhdH0gb3V0IHRoZSByZWNlaXZpbmcgcXVhdGVybmlvblxuICogQHBhcmFtIHtxdWF0fSBhIHF1YXQgdG8gY2FsY3VsYXRlIGludmVyc2Ugb2ZcbiAqIEByZXR1cm5zIHtxdWF0fSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGludmVydChvdXQsIGEpIHtcbiAgICBsZXQgYTAgPSBhWzBdLFxuICAgICAgICBhMSA9IGFbMV0sXG4gICAgICAgIGEyID0gYVsyXSxcbiAgICAgICAgYTMgPSBhWzNdO1xuICAgIGxldCBkb3QgPSBhMCAqIGEwICsgYTEgKiBhMSArIGEyICogYTIgKyBhMyAqIGEzO1xuICAgIGxldCBpbnZEb3QgPSBkb3QgPyAxLjAgLyBkb3QgOiAwO1xuXG4gICAgLy8gVE9ETzogV291bGQgYmUgZmFzdGVyIHRvIHJldHVybiBbMCwwLDAsMF0gaW1tZWRpYXRlbHkgaWYgZG90ID09IDBcblxuICAgIG91dFswXSA9IC1hMCAqIGludkRvdDtcbiAgICBvdXRbMV0gPSAtYTEgKiBpbnZEb3Q7XG4gICAgb3V0WzJdID0gLWEyICogaW52RG90O1xuICAgIG91dFszXSA9IGEzICogaW52RG90O1xuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgY29uanVnYXRlIG9mIGEgcXVhdFxuICogSWYgdGhlIHF1YXRlcm5pb24gaXMgbm9ybWFsaXplZCwgdGhpcyBmdW5jdGlvbiBpcyBmYXN0ZXIgdGhhbiBxdWF0LmludmVyc2UgYW5kIHByb2R1Y2VzIHRoZSBzYW1lIHJlc3VsdC5cbiAqXG4gKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cbiAqIEBwYXJhbSB7cXVhdH0gYSBxdWF0IHRvIGNhbGN1bGF0ZSBjb25qdWdhdGUgb2ZcbiAqIEByZXR1cm5zIHtxdWF0fSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvbmp1Z2F0ZShvdXQsIGEpIHtcbiAgICBvdXRbMF0gPSAtYVswXTtcbiAgICBvdXRbMV0gPSAtYVsxXTtcbiAgICBvdXRbMl0gPSAtYVsyXTtcbiAgICBvdXRbM10gPSBhWzNdO1xuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIHF1YXRlcm5pb24gZnJvbSB0aGUgZ2l2ZW4gM3gzIHJvdGF0aW9uIG1hdHJpeC5cbiAqXG4gKiBOT1RFOiBUaGUgcmVzdWx0YW50IHF1YXRlcm5pb24gaXMgbm90IG5vcm1hbGl6ZWQsIHNvIHlvdSBzaG91bGQgYmUgc3VyZVxuICogdG8gcmVub3JtYWxpemUgdGhlIHF1YXRlcm5pb24geW91cnNlbGYgd2hlcmUgbmVjZXNzYXJ5LlxuICpcbiAqIEBwYXJhbSB7cXVhdH0gb3V0IHRoZSByZWNlaXZpbmcgcXVhdGVybmlvblxuICogQHBhcmFtIHttYXQzfSBtIHJvdGF0aW9uIG1hdHJpeFxuICogQHJldHVybnMge3F1YXR9IG91dFxuICogQGZ1bmN0aW9uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmcm9tTWF0MyhvdXQsIG0pIHtcbiAgICAvLyBBbGdvcml0aG0gaW4gS2VuIFNob2VtYWtlJ3MgYXJ0aWNsZSBpbiAxOTg3IFNJR0dSQVBIIGNvdXJzZSBub3Rlc1xuICAgIC8vIGFydGljbGUgXCJRdWF0ZXJuaW9uIENhbGN1bHVzIGFuZCBGYXN0IEFuaW1hdGlvblwiLlxuICAgIGxldCBmVHJhY2UgPSBtWzBdICsgbVs0XSArIG1bOF07XG4gICAgbGV0IGZSb290O1xuXG4gICAgaWYgKGZUcmFjZSA+IDAuMCkge1xuICAgICAgICAvLyB8d3wgPiAxLzIsIG1heSBhcyB3ZWxsIGNob29zZSB3ID4gMS8yXG4gICAgICAgIGZSb290ID0gTWF0aC5zcXJ0KGZUcmFjZSArIDEuMCk7IC8vIDJ3XG4gICAgICAgIG91dFszXSA9IDAuNSAqIGZSb290O1xuICAgICAgICBmUm9vdCA9IDAuNSAvIGZSb290OyAvLyAxLyg0dylcbiAgICAgICAgb3V0WzBdID0gKG1bNV0gLSBtWzddKSAqIGZSb290O1xuICAgICAgICBvdXRbMV0gPSAobVs2XSAtIG1bMl0pICogZlJvb3Q7XG4gICAgICAgIG91dFsyXSA9IChtWzFdIC0gbVszXSkgKiBmUm9vdDtcbiAgICB9IGVsc2Uge1xuICAgICAgICAvLyB8d3wgPD0gMS8yXG4gICAgICAgIGxldCBpID0gMDtcbiAgICAgICAgaWYgKG1bNF0gPiBtWzBdKSBpID0gMTtcbiAgICAgICAgaWYgKG1bOF0gPiBtW2kgKiAzICsgaV0pIGkgPSAyO1xuICAgICAgICBsZXQgaiA9IChpICsgMSkgJSAzO1xuICAgICAgICBsZXQgayA9IChpICsgMikgJSAzO1xuXG4gICAgICAgIGZSb290ID0gTWF0aC5zcXJ0KG1baSAqIDMgKyBpXSAtIG1baiAqIDMgKyBqXSAtIG1bayAqIDMgKyBrXSArIDEuMCk7XG4gICAgICAgIG91dFtpXSA9IDAuNSAqIGZSb290O1xuICAgICAgICBmUm9vdCA9IDAuNSAvIGZSb290O1xuICAgICAgICBvdXRbM10gPSAobVtqICogMyArIGtdIC0gbVtrICogMyArIGpdKSAqIGZSb290O1xuICAgICAgICBvdXRbal0gPSAobVtqICogMyArIGldICsgbVtpICogMyArIGpdKSAqIGZSb290O1xuICAgICAgICBvdXRba10gPSAobVtrICogMyArIGldICsgbVtpICogMyArIGtdKSAqIGZSb290O1xuICAgIH1cblxuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIHF1YXRlcm5pb24gZnJvbSB0aGUgZ2l2ZW4gZXVsZXIgYW5nbGUgeCwgeSwgei5cbiAqXG4gKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cbiAqIEBwYXJhbSB7dmVjM30gZXVsZXIgQW5nbGVzIHRvIHJvdGF0ZSBhcm91bmQgZWFjaCBheGlzIGluIGRlZ3JlZXMuXG4gKiBAcGFyYW0ge1N0cmluZ30gb3JkZXIgZGV0YWlsaW5nIG9yZGVyIG9mIG9wZXJhdGlvbnMuIERlZmF1bHQgJ1hZWicuXG4gKiBAcmV0dXJucyB7cXVhdH0gb3V0XG4gKiBAZnVuY3Rpb25cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZyb21FdWxlcihvdXQsIGV1bGVyLCBvcmRlciA9ICdZWFonKSB7XG4gICAgbGV0IHN4ID0gTWF0aC5zaW4oZXVsZXJbMF0gKiAwLjUpO1xuICAgIGxldCBjeCA9IE1hdGguY29zKGV1bGVyWzBdICogMC41KTtcbiAgICBsZXQgc3kgPSBNYXRoLnNpbihldWxlclsxXSAqIDAuNSk7XG4gICAgbGV0IGN5ID0gTWF0aC5jb3MoZXVsZXJbMV0gKiAwLjUpO1xuICAgIGxldCBzeiA9IE1hdGguc2luKGV1bGVyWzJdICogMC41KTtcbiAgICBsZXQgY3ogPSBNYXRoLmNvcyhldWxlclsyXSAqIDAuNSk7XG5cbiAgICBpZiAob3JkZXIgPT09ICdYWVonKSB7XG4gICAgICAgIG91dFswXSA9IHN4ICogY3kgKiBjeiArIGN4ICogc3kgKiBzejtcbiAgICAgICAgb3V0WzFdID0gY3ggKiBzeSAqIGN6IC0gc3ggKiBjeSAqIHN6O1xuICAgICAgICBvdXRbMl0gPSBjeCAqIGN5ICogc3ogKyBzeCAqIHN5ICogY3o7XG4gICAgICAgIG91dFszXSA9IGN4ICogY3kgKiBjeiAtIHN4ICogc3kgKiBzejtcbiAgICB9IGVsc2UgaWYgKG9yZGVyID09PSAnWVhaJykge1xuICAgICAgICBvdXRbMF0gPSBzeCAqIGN5ICogY3ogKyBjeCAqIHN5ICogc3o7XG4gICAgICAgIG91dFsxXSA9IGN4ICogc3kgKiBjeiAtIHN4ICogY3kgKiBzejtcbiAgICAgICAgb3V0WzJdID0gY3ggKiBjeSAqIHN6IC0gc3ggKiBzeSAqIGN6O1xuICAgICAgICBvdXRbM10gPSBjeCAqIGN5ICogY3ogKyBzeCAqIHN5ICogc3o7XG4gICAgfSBlbHNlIGlmIChvcmRlciA9PT0gJ1pYWScpIHtcbiAgICAgICAgb3V0WzBdID0gc3ggKiBjeSAqIGN6IC0gY3ggKiBzeSAqIHN6O1xuICAgICAgICBvdXRbMV0gPSBjeCAqIHN5ICogY3ogKyBzeCAqIGN5ICogc3o7XG4gICAgICAgIG91dFsyXSA9IGN4ICogY3kgKiBzeiArIHN4ICogc3kgKiBjejtcbiAgICAgICAgb3V0WzNdID0gY3ggKiBjeSAqIGN6IC0gc3ggKiBzeSAqIHN6O1xuICAgIH0gZWxzZSBpZiAob3JkZXIgPT09ICdaWVgnKSB7XG4gICAgICAgIG91dFswXSA9IHN4ICogY3kgKiBjeiAtIGN4ICogc3kgKiBzejtcbiAgICAgICAgb3V0WzFdID0gY3ggKiBzeSAqIGN6ICsgc3ggKiBjeSAqIHN6O1xuICAgICAgICBvdXRbMl0gPSBjeCAqIGN5ICogc3ogLSBzeCAqIHN5ICogY3o7XG4gICAgICAgIG91dFszXSA9IGN4ICogY3kgKiBjeiArIHN4ICogc3kgKiBzejtcbiAgICB9IGVsc2UgaWYgKG9yZGVyID09PSAnWVpYJykge1xuICAgICAgICBvdXRbMF0gPSBzeCAqIGN5ICogY3ogKyBjeCAqIHN5ICogc3o7XG4gICAgICAgIG91dFsxXSA9IGN4ICogc3kgKiBjeiArIHN4ICogY3kgKiBzejtcbiAgICAgICAgb3V0WzJdID0gY3ggKiBjeSAqIHN6IC0gc3ggKiBzeSAqIGN6O1xuICAgICAgICBvdXRbM10gPSBjeCAqIGN5ICogY3ogLSBzeCAqIHN5ICogc3o7XG4gICAgfSBlbHNlIGlmIChvcmRlciA9PT0gJ1haWScpIHtcbiAgICAgICAgb3V0WzBdID0gc3ggKiBjeSAqIGN6IC0gY3ggKiBzeSAqIHN6O1xuICAgICAgICBvdXRbMV0gPSBjeCAqIHN5ICogY3ogLSBzeCAqIGN5ICogc3o7XG4gICAgICAgIG91dFsyXSA9IGN4ICogY3kgKiBzeiArIHN4ICogc3kgKiBjejtcbiAgICAgICAgb3V0WzNdID0gY3ggKiBjeSAqIGN6ICsgc3ggKiBzeSAqIHN6O1xuICAgIH1cblxuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogQ29weSB0aGUgdmFsdWVzIGZyb20gb25lIHF1YXQgdG8gYW5vdGhlclxuICpcbiAqIEBwYXJhbSB7cXVhdH0gb3V0IHRoZSByZWNlaXZpbmcgcXVhdGVybmlvblxuICogQHBhcmFtIHtxdWF0fSBhIHRoZSBzb3VyY2UgcXVhdGVybmlvblxuICogQHJldHVybnMge3F1YXR9IG91dFxuICogQGZ1bmN0aW9uXG4gKi9cbmV4cG9ydCBjb25zdCBjb3B5ID0gdmVjNC5jb3B5O1xuXG4vKipcbiAqIFNldCB0aGUgY29tcG9uZW50cyBvZiBhIHF1YXQgdG8gdGhlIGdpdmVuIHZhbHVlc1xuICpcbiAqIEBwYXJhbSB7cXVhdH0gb3V0IHRoZSByZWNlaXZpbmcgcXVhdGVybmlvblxuICogQHBhcmFtIHtOdW1iZXJ9IHggWCBjb21wb25lbnRcbiAqIEBwYXJhbSB7TnVtYmVyfSB5IFkgY29tcG9uZW50XG4gKiBAcGFyYW0ge051bWJlcn0geiBaIGNvbXBvbmVudFxuICogQHBhcmFtIHtOdW1iZXJ9IHcgVyBjb21wb25lbnRcbiAqIEByZXR1cm5zIHtxdWF0fSBvdXRcbiAqIEBmdW5jdGlvblxuICovXG5leHBvcnQgY29uc3Qgc2V0ID0gdmVjNC5zZXQ7XG5cbi8qKlxuICogQWRkcyB0d28gcXVhdCdzXG4gKlxuICogQHBhcmFtIHtxdWF0fSBvdXQgdGhlIHJlY2VpdmluZyBxdWF0ZXJuaW9uXG4gKiBAcGFyYW0ge3F1YXR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7cXVhdH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHtxdWF0fSBvdXRcbiAqIEBmdW5jdGlvblxuICovXG5leHBvcnQgY29uc3QgYWRkID0gdmVjNC5hZGQ7XG5cbi8qKlxuICogU2NhbGVzIGEgcXVhdCBieSBhIHNjYWxhciBudW1iZXJcbiAqXG4gKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHtxdWF0fSBhIHRoZSB2ZWN0b3IgdG8gc2NhbGVcbiAqIEBwYXJhbSB7TnVtYmVyfSBiIGFtb3VudCB0byBzY2FsZSB0aGUgdmVjdG9yIGJ5XG4gKiBAcmV0dXJucyB7cXVhdH0gb3V0XG4gKiBAZnVuY3Rpb25cbiAqL1xuZXhwb3J0IGNvbnN0IHNjYWxlID0gdmVjNC5zY2FsZTtcblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBkb3QgcHJvZHVjdCBvZiB0d28gcXVhdCdzXG4gKlxuICogQHBhcmFtIHtxdWF0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3F1YXR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBkb3QgcHJvZHVjdCBvZiBhIGFuZCBiXG4gKiBAZnVuY3Rpb25cbiAqL1xuZXhwb3J0IGNvbnN0IGRvdCA9IHZlYzQuZG90O1xuXG4vKipcbiAqIFBlcmZvcm1zIGEgbGluZWFyIGludGVycG9sYXRpb24gYmV0d2VlbiB0d28gcXVhdCdzXG4gKlxuICogQHBhcmFtIHtxdWF0fSBvdXQgdGhlIHJlY2VpdmluZyBxdWF0ZXJuaW9uXG4gKiBAcGFyYW0ge3F1YXR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7cXVhdH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEBwYXJhbSB7TnVtYmVyfSB0IGludGVycG9sYXRpb24gYW1vdW50IGJldHdlZW4gdGhlIHR3byBpbnB1dHNcbiAqIEByZXR1cm5zIHtxdWF0fSBvdXRcbiAqIEBmdW5jdGlvblxuICovXG5leHBvcnQgY29uc3QgbGVycCA9IHZlYzQubGVycDtcblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBsZW5ndGggb2YgYSBxdWF0XG4gKlxuICogQHBhcmFtIHtxdWF0fSBhIHZlY3RvciB0byBjYWxjdWxhdGUgbGVuZ3RoIG9mXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBsZW5ndGggb2YgYVxuICovXG5leHBvcnQgY29uc3QgbGVuZ3RoID0gdmVjNC5sZW5ndGg7XG5cbi8qKlxuICogTm9ybWFsaXplIGEgcXVhdFxuICpcbiAqIEBwYXJhbSB7cXVhdH0gb3V0IHRoZSByZWNlaXZpbmcgcXVhdGVybmlvblxuICogQHBhcmFtIHtxdWF0fSBhIHF1YXRlcm5pb24gdG8gbm9ybWFsaXplXG4gKiBAcmV0dXJucyB7cXVhdH0gb3V0XG4gKiBAZnVuY3Rpb25cbiAqL1xuZXhwb3J0IGNvbnN0IG5vcm1hbGl6ZSA9IHZlYzQubm9ybWFsaXplO1xuIiwiY29uc3QgRVBTSUxPTiA9IDAuMDAwMDAxO1xuXG4vKipcbiAqIENvcHkgdGhlIHZhbHVlcyBmcm9tIG9uZSB2ZWMyIHRvIGFub3RoZXJcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMyfSBhIHRoZSBzb3VyY2UgdmVjdG9yXG4gKiBAcmV0dXJucyB7dmVjMn0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb3B5KG91dCwgYSkge1xuICAgIG91dFswXSA9IGFbMF07XG4gICAgb3V0WzFdID0gYVsxXTtcbiAgICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFNldCB0aGUgY29tcG9uZW50cyBvZiBhIHZlYzIgdG8gdGhlIGdpdmVuIHZhbHVlc1xuICpcbiAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge051bWJlcn0geCBYIGNvbXBvbmVudFxuICogQHBhcmFtIHtOdW1iZXJ9IHkgWSBjb21wb25lbnRcbiAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNldChvdXQsIHgsIHkpIHtcbiAgICBvdXRbMF0gPSB4O1xuICAgIG91dFsxXSA9IHk7XG4gICAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBBZGRzIHR3byB2ZWMyJ3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMyfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzJ9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7dmVjMn0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhZGQob3V0LCBhLCBiKSB7XG4gICAgb3V0WzBdID0gYVswXSArIGJbMF07XG4gICAgb3V0WzFdID0gYVsxXSArIGJbMV07XG4gICAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBTdWJ0cmFjdHMgdmVjdG9yIGIgZnJvbSB2ZWN0b3IgYVxuICpcbiAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjMn0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHN1YnRyYWN0KG91dCwgYSwgYikge1xuICAgIG91dFswXSA9IGFbMF0gLSBiWzBdO1xuICAgIG91dFsxXSA9IGFbMV0gLSBiWzFdO1xuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogTXVsdGlwbGllcyB0d28gdmVjMidzXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMyfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge3ZlYzJ9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gbXVsdGlwbHkob3V0LCBhLCBiKSB7XG4gICAgb3V0WzBdID0gYVswXSAqIGJbMF07XG4gICAgb3V0WzFdID0gYVsxXSAqIGJbMV07XG4gICAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBEaXZpZGVzIHR3byB2ZWMyJ3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMyfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzJ9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7dmVjMn0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkaXZpZGUob3V0LCBhLCBiKSB7XG4gICAgb3V0WzBdID0gYVswXSAvIGJbMF07XG4gICAgb3V0WzFdID0gYVsxXSAvIGJbMV07XG4gICAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBTY2FsZXMgYSB2ZWMyIGJ5IGEgc2NhbGFyIG51bWJlclxuICpcbiAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIHZlY3RvciB0byBzY2FsZVxuICogQHBhcmFtIHtOdW1iZXJ9IGIgYW1vdW50IHRvIHNjYWxlIHRoZSB2ZWN0b3IgYnlcbiAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNjYWxlKG91dCwgYSwgYikge1xuICAgIG91dFswXSA9IGFbMF0gKiBiO1xuICAgIG91dFsxXSA9IGFbMV0gKiBiO1xuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgZXVjbGlkaWFuIGRpc3RhbmNlIGJldHdlZW4gdHdvIHZlYzInc1xuICpcbiAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMyfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge051bWJlcn0gZGlzdGFuY2UgYmV0d2VlbiBhIGFuZCBiXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkaXN0YW5jZShhLCBiKSB7XG4gICAgdmFyIHggPSBiWzBdIC0gYVswXSxcbiAgICAgICAgeSA9IGJbMV0gLSBhWzFdO1xuICAgIHJldHVybiBNYXRoLnNxcnQoeCAqIHggKyB5ICogeSk7XG59XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgc3F1YXJlZCBldWNsaWRpYW4gZGlzdGFuY2UgYmV0d2VlbiB0d28gdmVjMidzXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzJ9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBzcXVhcmVkIGRpc3RhbmNlIGJldHdlZW4gYSBhbmQgYlxuICovXG5leHBvcnQgZnVuY3Rpb24gc3F1YXJlZERpc3RhbmNlKGEsIGIpIHtcbiAgICB2YXIgeCA9IGJbMF0gLSBhWzBdLFxuICAgICAgICB5ID0gYlsxXSAtIGFbMV07XG4gICAgcmV0dXJuIHggKiB4ICsgeSAqIHk7XG59XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgbGVuZ3RoIG9mIGEgdmVjMlxuICpcbiAqIEBwYXJhbSB7dmVjMn0gYSB2ZWN0b3IgdG8gY2FsY3VsYXRlIGxlbmd0aCBvZlxuICogQHJldHVybnMge051bWJlcn0gbGVuZ3RoIG9mIGFcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxlbmd0aChhKSB7XG4gICAgdmFyIHggPSBhWzBdLFxuICAgICAgICB5ID0gYVsxXTtcbiAgICByZXR1cm4gTWF0aC5zcXJ0KHggKiB4ICsgeSAqIHkpO1xufVxuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIHNxdWFyZWQgbGVuZ3RoIG9mIGEgdmVjMlxuICpcbiAqIEBwYXJhbSB7dmVjMn0gYSB2ZWN0b3IgdG8gY2FsY3VsYXRlIHNxdWFyZWQgbGVuZ3RoIG9mXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBzcXVhcmVkIGxlbmd0aCBvZiBhXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzcXVhcmVkTGVuZ3RoKGEpIHtcbiAgICB2YXIgeCA9IGFbMF0sXG4gICAgICAgIHkgPSBhWzFdO1xuICAgIHJldHVybiB4ICogeCArIHkgKiB5O1xufVxuXG4vKipcbiAqIE5lZ2F0ZXMgdGhlIGNvbXBvbmVudHMgb2YgYSB2ZWMyXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjMn0gYSB2ZWN0b3IgdG8gbmVnYXRlXG4gKiBAcmV0dXJucyB7dmVjMn0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBuZWdhdGUob3V0LCBhKSB7XG4gICAgb3V0WzBdID0gLWFbMF07XG4gICAgb3V0WzFdID0gLWFbMV07XG4gICAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBpbnZlcnNlIG9mIHRoZSBjb21wb25lbnRzIG9mIGEgdmVjMlxuICpcbiAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdmVjdG9yIHRvIGludmVydFxuICogQHJldHVybnMge3ZlYzJ9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gaW52ZXJzZShvdXQsIGEpIHtcbiAgICBvdXRbMF0gPSAxLjAgLyBhWzBdO1xuICAgIG91dFsxXSA9IDEuMCAvIGFbMV07XG4gICAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBOb3JtYWxpemUgYSB2ZWMyXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjMn0gYSB2ZWN0b3IgdG8gbm9ybWFsaXplXG4gKiBAcmV0dXJucyB7dmVjMn0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBub3JtYWxpemUob3V0LCBhKSB7XG4gICAgdmFyIHggPSBhWzBdLFxuICAgICAgICB5ID0gYVsxXTtcbiAgICB2YXIgbGVuID0geCAqIHggKyB5ICogeTtcbiAgICBpZiAobGVuID4gMCkge1xuICAgICAgICAvL1RPRE86IGV2YWx1YXRlIHVzZSBvZiBnbG1faW52c3FydCBoZXJlP1xuICAgICAgICBsZW4gPSAxIC8gTWF0aC5zcXJ0KGxlbik7XG4gICAgfVxuICAgIG91dFswXSA9IGFbMF0gKiBsZW47XG4gICAgb3V0WzFdID0gYVsxXSAqIGxlbjtcbiAgICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGRvdCBwcm9kdWN0IG9mIHR3byB2ZWMyJ3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjMn0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IGRvdCBwcm9kdWN0IG9mIGEgYW5kIGJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRvdChhLCBiKSB7XG4gICAgcmV0dXJuIGFbMF0gKiBiWzBdICsgYVsxXSAqIGJbMV07XG59XG5cbi8qKlxuICogQ29tcHV0ZXMgdGhlIGNyb3NzIHByb2R1Y3Qgb2YgdHdvIHZlYzInc1xuICogTm90ZSB0aGF0IHRoZSBjcm9zcyBwcm9kdWN0IHJldHVybnMgYSBzY2FsYXJcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjMn0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IGNyb3NzIHByb2R1Y3Qgb2YgYSBhbmQgYlxuICovXG5leHBvcnQgZnVuY3Rpb24gY3Jvc3MoYSwgYikge1xuICAgIHJldHVybiBhWzBdICogYlsxXSAtIGFbMV0gKiBiWzBdO1xufVxuXG4vKipcbiAqIFBlcmZvcm1zIGEgbGluZWFyIGludGVycG9sYXRpb24gYmV0d2VlbiB0d28gdmVjMidzXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMyfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHBhcmFtIHtOdW1iZXJ9IHQgaW50ZXJwb2xhdGlvbiBhbW91bnQgYmV0d2VlbiB0aGUgdHdvIGlucHV0c1xuICogQHJldHVybnMge3ZlYzJ9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gbGVycChvdXQsIGEsIGIsIHQpIHtcbiAgICB2YXIgYXggPSBhWzBdLFxuICAgICAgICBheSA9IGFbMV07XG4gICAgb3V0WzBdID0gYXggKyB0ICogKGJbMF0gLSBheCk7XG4gICAgb3V0WzFdID0gYXkgKyB0ICogKGJbMV0gLSBheSk7XG4gICAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBUcmFuc2Zvcm1zIHRoZSB2ZWMyIHdpdGggYSBtYXQyXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgdmVjdG9yIHRvIHRyYW5zZm9ybVxuICogQHBhcmFtIHttYXQyfSBtIG1hdHJpeCB0byB0cmFuc2Zvcm0gd2l0aFxuICogQHJldHVybnMge3ZlYzJ9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gdHJhbnNmb3JtTWF0MihvdXQsIGEsIG0pIHtcbiAgICB2YXIgeCA9IGFbMF0sXG4gICAgICAgIHkgPSBhWzFdO1xuICAgIG91dFswXSA9IG1bMF0gKiB4ICsgbVsyXSAqIHk7XG4gICAgb3V0WzFdID0gbVsxXSAqIHggKyBtWzNdICogeTtcbiAgICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFRyYW5zZm9ybXMgdGhlIHZlYzIgd2l0aCBhIG1hdDJkXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgdmVjdG9yIHRvIHRyYW5zZm9ybVxuICogQHBhcmFtIHttYXQyZH0gbSBtYXRyaXggdG8gdHJhbnNmb3JtIHdpdGhcbiAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRyYW5zZm9ybU1hdDJkKG91dCwgYSwgbSkge1xuICAgIHZhciB4ID0gYVswXSxcbiAgICAgICAgeSA9IGFbMV07XG4gICAgb3V0WzBdID0gbVswXSAqIHggKyBtWzJdICogeSArIG1bNF07XG4gICAgb3V0WzFdID0gbVsxXSAqIHggKyBtWzNdICogeSArIG1bNV07XG4gICAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBUcmFuc2Zvcm1zIHRoZSB2ZWMyIHdpdGggYSBtYXQzXG4gKiAzcmQgdmVjdG9yIGNvbXBvbmVudCBpcyBpbXBsaWNpdGx5ICcxJ1xuICpcbiAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIHZlY3RvciB0byB0cmFuc2Zvcm1cbiAqIEBwYXJhbSB7bWF0M30gbSBtYXRyaXggdG8gdHJhbnNmb3JtIHdpdGhcbiAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRyYW5zZm9ybU1hdDMob3V0LCBhLCBtKSB7XG4gICAgdmFyIHggPSBhWzBdLFxuICAgICAgICB5ID0gYVsxXTtcbiAgICBvdXRbMF0gPSBtWzBdICogeCArIG1bM10gKiB5ICsgbVs2XTtcbiAgICBvdXRbMV0gPSBtWzFdICogeCArIG1bNF0gKiB5ICsgbVs3XTtcbiAgICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFRyYW5zZm9ybXMgdGhlIHZlYzIgd2l0aCBhIG1hdDRcbiAqIDNyZCB2ZWN0b3IgY29tcG9uZW50IGlzIGltcGxpY2l0bHkgJzAnXG4gKiA0dGggdmVjdG9yIGNvbXBvbmVudCBpcyBpbXBsaWNpdGx5ICcxJ1xuICpcbiAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIHZlY3RvciB0byB0cmFuc2Zvcm1cbiAqIEBwYXJhbSB7bWF0NH0gbSBtYXRyaXggdG8gdHJhbnNmb3JtIHdpdGhcbiAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRyYW5zZm9ybU1hdDQob3V0LCBhLCBtKSB7XG4gICAgbGV0IHggPSBhWzBdO1xuICAgIGxldCB5ID0gYVsxXTtcbiAgICBvdXRbMF0gPSBtWzBdICogeCArIG1bNF0gKiB5ICsgbVsxMl07XG4gICAgb3V0WzFdID0gbVsxXSAqIHggKyBtWzVdICogeSArIG1bMTNdO1xuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogUmV0dXJucyB3aGV0aGVyIG9yIG5vdCB0aGUgdmVjdG9ycyBleGFjdGx5IGhhdmUgdGhlIHNhbWUgZWxlbWVudHMgaW4gdGhlIHNhbWUgcG9zaXRpb24gKHdoZW4gY29tcGFyZWQgd2l0aCA9PT0pXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBhIFRoZSBmaXJzdCB2ZWN0b3IuXG4gKiBAcGFyYW0ge3ZlYzJ9IGIgVGhlIHNlY29uZCB2ZWN0b3IuXG4gKiBAcmV0dXJucyB7Qm9vbGVhbn0gVHJ1ZSBpZiB0aGUgdmVjdG9ycyBhcmUgZXF1YWwsIGZhbHNlIG90aGVyd2lzZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGV4YWN0RXF1YWxzKGEsIGIpIHtcbiAgICByZXR1cm4gYVswXSA9PT0gYlswXSAmJiBhWzFdID09PSBiWzFdO1xufVxuIiwiY29uc3QgRVBTSUxPTiA9IDAuMDAwMDAxO1xuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGxlbmd0aCBvZiBhIHZlYzNcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdmVjdG9yIHRvIGNhbGN1bGF0ZSBsZW5ndGggb2ZcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IGxlbmd0aCBvZiBhXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBsZW5ndGgoYSkge1xuICAgIGxldCB4ID0gYVswXTtcbiAgICBsZXQgeSA9IGFbMV07XG4gICAgbGV0IHogPSBhWzJdO1xuICAgIHJldHVybiBNYXRoLnNxcnQoeCAqIHggKyB5ICogeSArIHogKiB6KTtcbn1cblxuLyoqXG4gKiBDb3B5IHRoZSB2YWx1ZXMgZnJvbSBvbmUgdmVjMyB0byBhbm90aGVyXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjM30gYSB0aGUgc291cmNlIHZlY3RvclxuICogQHJldHVybnMge3ZlYzN9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gY29weShvdXQsIGEpIHtcbiAgICBvdXRbMF0gPSBhWzBdO1xuICAgIG91dFsxXSA9IGFbMV07XG4gICAgb3V0WzJdID0gYVsyXTtcbiAgICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFNldCB0aGUgY29tcG9uZW50cyBvZiBhIHZlYzMgdG8gdGhlIGdpdmVuIHZhbHVlc1xuICpcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge051bWJlcn0geCBYIGNvbXBvbmVudFxuICogQHBhcmFtIHtOdW1iZXJ9IHkgWSBjb21wb25lbnRcbiAqIEBwYXJhbSB7TnVtYmVyfSB6IFogY29tcG9uZW50XG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZXQob3V0LCB4LCB5LCB6KSB7XG4gICAgb3V0WzBdID0geDtcbiAgICBvdXRbMV0gPSB5O1xuICAgIG91dFsyXSA9IHo7XG4gICAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBBZGRzIHR3byB2ZWMzJ3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhZGQob3V0LCBhLCBiKSB7XG4gICAgb3V0WzBdID0gYVswXSArIGJbMF07XG4gICAgb3V0WzFdID0gYVsxXSArIGJbMV07XG4gICAgb3V0WzJdID0gYVsyXSArIGJbMl07XG4gICAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBTdWJ0cmFjdHMgdmVjdG9yIGIgZnJvbSB2ZWN0b3IgYVxuICpcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjM30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHN1YnRyYWN0KG91dCwgYSwgYikge1xuICAgIG91dFswXSA9IGFbMF0gLSBiWzBdO1xuICAgIG91dFsxXSA9IGFbMV0gLSBiWzFdO1xuICAgIG91dFsyXSA9IGFbMl0gLSBiWzJdO1xuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogTXVsdGlwbGllcyB0d28gdmVjMydzXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjM30gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge3ZlYzN9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gbXVsdGlwbHkob3V0LCBhLCBiKSB7XG4gICAgb3V0WzBdID0gYVswXSAqIGJbMF07XG4gICAgb3V0WzFdID0gYVsxXSAqIGJbMV07XG4gICAgb3V0WzJdID0gYVsyXSAqIGJbMl07XG4gICAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBEaXZpZGVzIHR3byB2ZWMzJ3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkaXZpZGUob3V0LCBhLCBiKSB7XG4gICAgb3V0WzBdID0gYVswXSAvIGJbMF07XG4gICAgb3V0WzFdID0gYVsxXSAvIGJbMV07XG4gICAgb3V0WzJdID0gYVsyXSAvIGJbMl07XG4gICAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBTY2FsZXMgYSB2ZWMzIGJ5IGEgc2NhbGFyIG51bWJlclxuICpcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIHZlY3RvciB0byBzY2FsZVxuICogQHBhcmFtIHtOdW1iZXJ9IGIgYW1vdW50IHRvIHNjYWxlIHRoZSB2ZWN0b3IgYnlcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNjYWxlKG91dCwgYSwgYikge1xuICAgIG91dFswXSA9IGFbMF0gKiBiO1xuICAgIG91dFsxXSA9IGFbMV0gKiBiO1xuICAgIG91dFsyXSA9IGFbMl0gKiBiO1xuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgZXVjbGlkaWFuIGRpc3RhbmNlIGJldHdlZW4gdHdvIHZlYzMnc1xuICpcbiAqIEBwYXJhbSB7dmVjM30gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge051bWJlcn0gZGlzdGFuY2UgYmV0d2VlbiBhIGFuZCBiXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkaXN0YW5jZShhLCBiKSB7XG4gICAgbGV0IHggPSBiWzBdIC0gYVswXTtcbiAgICBsZXQgeSA9IGJbMV0gLSBhWzFdO1xuICAgIGxldCB6ID0gYlsyXSAtIGFbMl07XG4gICAgcmV0dXJuIE1hdGguc3FydCh4ICogeCArIHkgKiB5ICsgeiAqIHopO1xufVxuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIHNxdWFyZWQgZXVjbGlkaWFuIGRpc3RhbmNlIGJldHdlZW4gdHdvIHZlYzMnc1xuICpcbiAqIEBwYXJhbSB7dmVjM30gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge051bWJlcn0gc3F1YXJlZCBkaXN0YW5jZSBiZXR3ZWVuIGEgYW5kIGJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNxdWFyZWREaXN0YW5jZShhLCBiKSB7XG4gICAgbGV0IHggPSBiWzBdIC0gYVswXTtcbiAgICBsZXQgeSA9IGJbMV0gLSBhWzFdO1xuICAgIGxldCB6ID0gYlsyXSAtIGFbMl07XG4gICAgcmV0dXJuIHggKiB4ICsgeSAqIHkgKyB6ICogejtcbn1cblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBzcXVhcmVkIGxlbmd0aCBvZiBhIHZlYzNcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdmVjdG9yIHRvIGNhbGN1bGF0ZSBzcXVhcmVkIGxlbmd0aCBvZlxuICogQHJldHVybnMge051bWJlcn0gc3F1YXJlZCBsZW5ndGggb2YgYVxuICovXG5leHBvcnQgZnVuY3Rpb24gc3F1YXJlZExlbmd0aChhKSB7XG4gICAgbGV0IHggPSBhWzBdO1xuICAgIGxldCB5ID0gYVsxXTtcbiAgICBsZXQgeiA9IGFbMl07XG4gICAgcmV0dXJuIHggKiB4ICsgeSAqIHkgKyB6ICogejtcbn1cblxuLyoqXG4gKiBOZWdhdGVzIHRoZSBjb21wb25lbnRzIG9mIGEgdmVjM1xuICpcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdmVjdG9yIHRvIG5lZ2F0ZVxuICogQHJldHVybnMge3ZlYzN9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gbmVnYXRlKG91dCwgYSkge1xuICAgIG91dFswXSA9IC1hWzBdO1xuICAgIG91dFsxXSA9IC1hWzFdO1xuICAgIG91dFsyXSA9IC1hWzJdO1xuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgaW52ZXJzZSBvZiB0aGUgY29tcG9uZW50cyBvZiBhIHZlYzNcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMzfSBhIHZlY3RvciB0byBpbnZlcnRcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGludmVyc2Uob3V0LCBhKSB7XG4gICAgb3V0WzBdID0gMS4wIC8gYVswXTtcbiAgICBvdXRbMV0gPSAxLjAgLyBhWzFdO1xuICAgIG91dFsyXSA9IDEuMCAvIGFbMl07XG4gICAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBOb3JtYWxpemUgYSB2ZWMzXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjM30gYSB2ZWN0b3IgdG8gbm9ybWFsaXplXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBub3JtYWxpemUob3V0LCBhKSB7XG4gICAgbGV0IHggPSBhWzBdO1xuICAgIGxldCB5ID0gYVsxXTtcbiAgICBsZXQgeiA9IGFbMl07XG4gICAgbGV0IGxlbiA9IHggKiB4ICsgeSAqIHkgKyB6ICogejtcbiAgICBpZiAobGVuID4gMCkge1xuICAgICAgICAvL1RPRE86IGV2YWx1YXRlIHVzZSBvZiBnbG1faW52c3FydCBoZXJlP1xuICAgICAgICBsZW4gPSAxIC8gTWF0aC5zcXJ0KGxlbik7XG4gICAgfVxuICAgIG91dFswXSA9IGFbMF0gKiBsZW47XG4gICAgb3V0WzFdID0gYVsxXSAqIGxlbjtcbiAgICBvdXRbMl0gPSBhWzJdICogbGVuO1xuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgZG90IHByb2R1Y3Qgb2YgdHdvIHZlYzMnc1xuICpcbiAqIEBwYXJhbSB7dmVjM30gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge051bWJlcn0gZG90IHByb2R1Y3Qgb2YgYSBhbmQgYlxuICovXG5leHBvcnQgZnVuY3Rpb24gZG90KGEsIGIpIHtcbiAgICByZXR1cm4gYVswXSAqIGJbMF0gKyBhWzFdICogYlsxXSArIGFbMl0gKiBiWzJdO1xufVxuXG4vKipcbiAqIENvbXB1dGVzIHRoZSBjcm9zcyBwcm9kdWN0IG9mIHR3byB2ZWMzJ3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcm9zcyhvdXQsIGEsIGIpIHtcbiAgICBsZXQgYXggPSBhWzBdLFxuICAgICAgICBheSA9IGFbMV0sXG4gICAgICAgIGF6ID0gYVsyXTtcbiAgICBsZXQgYnggPSBiWzBdLFxuICAgICAgICBieSA9IGJbMV0sXG4gICAgICAgIGJ6ID0gYlsyXTtcblxuICAgIG91dFswXSA9IGF5ICogYnogLSBheiAqIGJ5O1xuICAgIG91dFsxXSA9IGF6ICogYnggLSBheCAqIGJ6O1xuICAgIG91dFsyXSA9IGF4ICogYnkgLSBheSAqIGJ4O1xuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogUGVyZm9ybXMgYSBsaW5lYXIgaW50ZXJwb2xhdGlvbiBiZXR3ZWVuIHR3byB2ZWMzJ3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcGFyYW0ge051bWJlcn0gdCBpbnRlcnBvbGF0aW9uIGFtb3VudCBiZXR3ZWVuIHRoZSB0d28gaW5wdXRzXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBsZXJwKG91dCwgYSwgYiwgdCkge1xuICAgIGxldCBheCA9IGFbMF07XG4gICAgbGV0IGF5ID0gYVsxXTtcbiAgICBsZXQgYXogPSBhWzJdO1xuICAgIG91dFswXSA9IGF4ICsgdCAqIChiWzBdIC0gYXgpO1xuICAgIG91dFsxXSA9IGF5ICsgdCAqIChiWzFdIC0gYXkpO1xuICAgIG91dFsyXSA9IGF6ICsgdCAqIChiWzJdIC0gYXopO1xuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogVHJhbnNmb3JtcyB0aGUgdmVjMyB3aXRoIGEgbWF0NC5cbiAqIDR0aCB2ZWN0b3IgY29tcG9uZW50IGlzIGltcGxpY2l0bHkgJzEnXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjM30gYSB0aGUgdmVjdG9yIHRvIHRyYW5zZm9ybVxuICogQHBhcmFtIHttYXQ0fSBtIG1hdHJpeCB0byB0cmFuc2Zvcm0gd2l0aFxuICogQHJldHVybnMge3ZlYzN9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gdHJhbnNmb3JtTWF0NChvdXQsIGEsIG0pIHtcbiAgICBsZXQgeCA9IGFbMF0sXG4gICAgICAgIHkgPSBhWzFdLFxuICAgICAgICB6ID0gYVsyXTtcbiAgICBsZXQgdyA9IG1bM10gKiB4ICsgbVs3XSAqIHkgKyBtWzExXSAqIHogKyBtWzE1XTtcbiAgICB3ID0gdyB8fCAxLjA7XG4gICAgb3V0WzBdID0gKG1bMF0gKiB4ICsgbVs0XSAqIHkgKyBtWzhdICogeiArIG1bMTJdKSAvIHc7XG4gICAgb3V0WzFdID0gKG1bMV0gKiB4ICsgbVs1XSAqIHkgKyBtWzldICogeiArIG1bMTNdKSAvIHc7XG4gICAgb3V0WzJdID0gKG1bMl0gKiB4ICsgbVs2XSAqIHkgKyBtWzEwXSAqIHogKyBtWzE0XSkgLyB3O1xuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogU2FtZSBhcyBhYm92ZSBidXQgZG9lc24ndCBhcHBseSB0cmFuc2xhdGlvbi5cbiAqIFVzZWZ1bCBmb3IgcmF5cy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNjYWxlUm90YXRlTWF0NChvdXQsIGEsIG0pIHtcbiAgICBsZXQgeCA9IGFbMF0sXG4gICAgICAgIHkgPSBhWzFdLFxuICAgICAgICB6ID0gYVsyXTtcbiAgICBsZXQgdyA9IG1bM10gKiB4ICsgbVs3XSAqIHkgKyBtWzExXSAqIHogKyBtWzE1XTtcbiAgICB3ID0gdyB8fCAxLjA7XG4gICAgb3V0WzBdID0gKG1bMF0gKiB4ICsgbVs0XSAqIHkgKyBtWzhdICogeikgLyB3O1xuICAgIG91dFsxXSA9IChtWzFdICogeCArIG1bNV0gKiB5ICsgbVs5XSAqIHopIC8gdztcbiAgICBvdXRbMl0gPSAobVsyXSAqIHggKyBtWzZdICogeSArIG1bMTBdICogeikgLyB3O1xuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogVHJhbnNmb3JtcyB0aGUgdmVjMyB3aXRoIGEgbWF0My5cbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMzfSBhIHRoZSB2ZWN0b3IgdG8gdHJhbnNmb3JtXG4gKiBAcGFyYW0ge21hdDN9IG0gdGhlIDN4MyBtYXRyaXggdG8gdHJhbnNmb3JtIHdpdGhcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRyYW5zZm9ybU1hdDMob3V0LCBhLCBtKSB7XG4gICAgbGV0IHggPSBhWzBdLFxuICAgICAgICB5ID0gYVsxXSxcbiAgICAgICAgeiA9IGFbMl07XG4gICAgb3V0WzBdID0geCAqIG1bMF0gKyB5ICogbVszXSArIHogKiBtWzZdO1xuICAgIG91dFsxXSA9IHggKiBtWzFdICsgeSAqIG1bNF0gKyB6ICogbVs3XTtcbiAgICBvdXRbMl0gPSB4ICogbVsyXSArIHkgKiBtWzVdICsgeiAqIG1bOF07XG4gICAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBUcmFuc2Zvcm1zIHRoZSB2ZWMzIHdpdGggYSBxdWF0XG4gKlxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjM30gYSB0aGUgdmVjdG9yIHRvIHRyYW5zZm9ybVxuICogQHBhcmFtIHtxdWF0fSBxIHF1YXRlcm5pb24gdG8gdHJhbnNmb3JtIHdpdGhcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRyYW5zZm9ybVF1YXQob3V0LCBhLCBxKSB7XG4gICAgLy8gYmVuY2htYXJrczogaHR0cHM6Ly9qc3BlcmYuY29tL3F1YXRlcm5pb24tdHJhbnNmb3JtLXZlYzMtaW1wbGVtZW50YXRpb25zLWZpeGVkXG5cbiAgICBsZXQgeCA9IGFbMF0sXG4gICAgICAgIHkgPSBhWzFdLFxuICAgICAgICB6ID0gYVsyXTtcbiAgICBsZXQgcXggPSBxWzBdLFxuICAgICAgICBxeSA9IHFbMV0sXG4gICAgICAgIHF6ID0gcVsyXSxcbiAgICAgICAgcXcgPSBxWzNdO1xuXG4gICAgbGV0IHV2eCA9IHF5ICogeiAtIHF6ICogeTtcbiAgICBsZXQgdXZ5ID0gcXogKiB4IC0gcXggKiB6O1xuICAgIGxldCB1dnogPSBxeCAqIHkgLSBxeSAqIHg7XG5cbiAgICBsZXQgdXV2eCA9IHF5ICogdXZ6IC0gcXogKiB1dnk7XG4gICAgbGV0IHV1dnkgPSBxeiAqIHV2eCAtIHF4ICogdXZ6O1xuICAgIGxldCB1dXZ6ID0gcXggKiB1dnkgLSBxeSAqIHV2eDtcblxuICAgIGxldCB3MiA9IHF3ICogMjtcbiAgICB1dnggKj0gdzI7XG4gICAgdXZ5ICo9IHcyO1xuICAgIHV2eiAqPSB3MjtcblxuICAgIHV1dnggKj0gMjtcbiAgICB1dXZ5ICo9IDI7XG4gICAgdXV2eiAqPSAyO1xuXG4gICAgb3V0WzBdID0geCArIHV2eCArIHV1dng7XG4gICAgb3V0WzFdID0geSArIHV2eSArIHV1dnk7XG4gICAgb3V0WzJdID0geiArIHV2eiArIHV1dno7XG4gICAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBHZXQgdGhlIGFuZ2xlIGJldHdlZW4gdHdvIDNEIHZlY3RvcnNcbiAqIEBwYXJhbSB7dmVjM30gYSBUaGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMzfSBiIFRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge051bWJlcn0gVGhlIGFuZ2xlIGluIHJhZGlhbnNcbiAqL1xuZXhwb3J0IGNvbnN0IGFuZ2xlID0gKGZ1bmN0aW9uICgpIHtcbiAgICBjb25zdCB0ZW1wQSA9IFswLCAwLCAwXTtcbiAgICBjb25zdCB0ZW1wQiA9IFswLCAwLCAwXTtcblxuICAgIHJldHVybiBmdW5jdGlvbiAoYSwgYikge1xuICAgICAgICBjb3B5KHRlbXBBLCBhKTtcbiAgICAgICAgY29weSh0ZW1wQiwgYik7XG5cbiAgICAgICAgbm9ybWFsaXplKHRlbXBBLCB0ZW1wQSk7XG4gICAgICAgIG5vcm1hbGl6ZSh0ZW1wQiwgdGVtcEIpO1xuXG4gICAgICAgIGxldCBjb3NpbmUgPSBkb3QodGVtcEEsIHRlbXBCKTtcblxuICAgICAgICBpZiAoY29zaW5lID4gMS4wKSB7XG4gICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgfSBlbHNlIGlmIChjb3NpbmUgPCAtMS4wKSB7XG4gICAgICAgICAgICByZXR1cm4gTWF0aC5QSTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBNYXRoLmFjb3MoY29zaW5lKTtcbiAgICAgICAgfVxuICAgIH07XG59KSgpO1xuXG4vKipcbiAqIFJldHVybnMgd2hldGhlciBvciBub3QgdGhlIHZlY3RvcnMgaGF2ZSBleGFjdGx5IHRoZSBzYW1lIGVsZW1lbnRzIGluIHRoZSBzYW1lIHBvc2l0aW9uICh3aGVuIGNvbXBhcmVkIHdpdGggPT09KVxuICpcbiAqIEBwYXJhbSB7dmVjM30gYSBUaGUgZmlyc3QgdmVjdG9yLlxuICogQHBhcmFtIHt2ZWMzfSBiIFRoZSBzZWNvbmQgdmVjdG9yLlxuICogQHJldHVybnMge0Jvb2xlYW59IFRydWUgaWYgdGhlIHZlY3RvcnMgYXJlIGVxdWFsLCBmYWxzZSBvdGhlcndpc2UuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBleGFjdEVxdWFscyhhLCBiKSB7XG4gICAgcmV0dXJuIGFbMF0gPT09IGJbMF0gJiYgYVsxXSA9PT0gYlsxXSAmJiBhWzJdID09PSBiWzJdO1xufVxuIiwiY29uc3QgRVBTSUxPTiA9IDAuMDAwMDAxO1xuXG4vKipcbiAqIENvcHkgdGhlIHZhbHVlcyBmcm9tIG9uZSB2ZWM0IHRvIGFub3RoZXJcbiAqXG4gKiBAcGFyYW0ge3ZlYzR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWM0fSBhIHRoZSBzb3VyY2UgdmVjdG9yXG4gKiBAcmV0dXJucyB7dmVjNH0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb3B5KG91dCwgYSkge1xuICAgIG91dFswXSA9IGFbMF07XG4gICAgb3V0WzFdID0gYVsxXTtcbiAgICBvdXRbMl0gPSBhWzJdO1xuICAgIG91dFszXSA9IGFbM107XG4gICAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBTZXQgdGhlIGNvbXBvbmVudHMgb2YgYSB2ZWM0IHRvIHRoZSBnaXZlbiB2YWx1ZXNcbiAqXG4gKiBAcGFyYW0ge3ZlYzR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHtOdW1iZXJ9IHggWCBjb21wb25lbnRcbiAqIEBwYXJhbSB7TnVtYmVyfSB5IFkgY29tcG9uZW50XG4gKiBAcGFyYW0ge051bWJlcn0geiBaIGNvbXBvbmVudFxuICogQHBhcmFtIHtOdW1iZXJ9IHcgVyBjb21wb25lbnRcbiAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNldChvdXQsIHgsIHksIHosIHcpIHtcbiAgICBvdXRbMF0gPSB4O1xuICAgIG91dFsxXSA9IHk7XG4gICAgb3V0WzJdID0gejtcbiAgICBvdXRbM10gPSB3O1xuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogQWRkcyB0d28gdmVjNCdzXG4gKlxuICogQHBhcmFtIHt2ZWM0fSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjNH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWM0fSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge3ZlYzR9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gYWRkKG91dCwgYSwgYikge1xuICAgIG91dFswXSA9IGFbMF0gKyBiWzBdO1xuICAgIG91dFsxXSA9IGFbMV0gKyBiWzFdO1xuICAgIG91dFsyXSA9IGFbMl0gKyBiWzJdO1xuICAgIG91dFszXSA9IGFbM10gKyBiWzNdO1xuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogU2NhbGVzIGEgdmVjNCBieSBhIHNjYWxhciBudW1iZXJcbiAqXG4gKiBAcGFyYW0ge3ZlYzR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWM0fSBhIHRoZSB2ZWN0b3IgdG8gc2NhbGVcbiAqIEBwYXJhbSB7TnVtYmVyfSBiIGFtb3VudCB0byBzY2FsZSB0aGUgdmVjdG9yIGJ5XG4gKiBAcmV0dXJucyB7dmVjNH0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzY2FsZShvdXQsIGEsIGIpIHtcbiAgICBvdXRbMF0gPSBhWzBdICogYjtcbiAgICBvdXRbMV0gPSBhWzFdICogYjtcbiAgICBvdXRbMl0gPSBhWzJdICogYjtcbiAgICBvdXRbM10gPSBhWzNdICogYjtcbiAgICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGxlbmd0aCBvZiBhIHZlYzRcbiAqXG4gKiBAcGFyYW0ge3ZlYzR9IGEgdmVjdG9yIHRvIGNhbGN1bGF0ZSBsZW5ndGggb2ZcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IGxlbmd0aCBvZiBhXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBsZW5ndGgoYSkge1xuICAgIGxldCB4ID0gYVswXTtcbiAgICBsZXQgeSA9IGFbMV07XG4gICAgbGV0IHogPSBhWzJdO1xuICAgIGxldCB3ID0gYVszXTtcbiAgICByZXR1cm4gTWF0aC5zcXJ0KHggKiB4ICsgeSAqIHkgKyB6ICogeiArIHcgKiB3KTtcbn1cblxuLyoqXG4gKiBOb3JtYWxpemUgYSB2ZWM0XG4gKlxuICogQHBhcmFtIHt2ZWM0fSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjNH0gYSB2ZWN0b3IgdG8gbm9ybWFsaXplXG4gKiBAcmV0dXJucyB7dmVjNH0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBub3JtYWxpemUob3V0LCBhKSB7XG4gICAgbGV0IHggPSBhWzBdO1xuICAgIGxldCB5ID0gYVsxXTtcbiAgICBsZXQgeiA9IGFbMl07XG4gICAgbGV0IHcgPSBhWzNdO1xuICAgIGxldCBsZW4gPSB4ICogeCArIHkgKiB5ICsgeiAqIHogKyB3ICogdztcbiAgICBpZiAobGVuID4gMCkge1xuICAgICAgICBsZW4gPSAxIC8gTWF0aC5zcXJ0KGxlbik7XG4gICAgfVxuICAgIG91dFswXSA9IHggKiBsZW47XG4gICAgb3V0WzFdID0geSAqIGxlbjtcbiAgICBvdXRbMl0gPSB6ICogbGVuO1xuICAgIG91dFszXSA9IHcgKiBsZW47XG4gICAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBkb3QgcHJvZHVjdCBvZiB0d28gdmVjNCdzXG4gKlxuICogQHBhcmFtIHt2ZWM0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBkb3QgcHJvZHVjdCBvZiBhIGFuZCBiXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkb3QoYSwgYikge1xuICAgIHJldHVybiBhWzBdICogYlswXSArIGFbMV0gKiBiWzFdICsgYVsyXSAqIGJbMl0gKyBhWzNdICogYlszXTtcbn1cblxuLyoqXG4gKiBQZXJmb3JtcyBhIGxpbmVhciBpbnRlcnBvbGF0aW9uIGJldHdlZW4gdHdvIHZlYzQnc1xuICpcbiAqIEBwYXJhbSB7dmVjNH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjNH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEBwYXJhbSB7TnVtYmVyfSB0IGludGVycG9sYXRpb24gYW1vdW50IGJldHdlZW4gdGhlIHR3byBpbnB1dHNcbiAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxlcnAob3V0LCBhLCBiLCB0KSB7XG4gICAgbGV0IGF4ID0gYVswXTtcbiAgICBsZXQgYXkgPSBhWzFdO1xuICAgIGxldCBheiA9IGFbMl07XG4gICAgbGV0IGF3ID0gYVszXTtcbiAgICBvdXRbMF0gPSBheCArIHQgKiAoYlswXSAtIGF4KTtcbiAgICBvdXRbMV0gPSBheSArIHQgKiAoYlsxXSAtIGF5KTtcbiAgICBvdXRbMl0gPSBheiArIHQgKiAoYlsyXSAtIGF6KTtcbiAgICBvdXRbM10gPSBhdyArIHQgKiAoYlszXSAtIGF3KTtcbiAgICByZXR1cm4gb3V0O1xufVxuIiwiLy8gQ29yZVxuZXhwb3J0IHsgR2VvbWV0cnkgfSBmcm9tICcuL2NvcmUvR2VvbWV0cnkuanMnO1xuZXhwb3J0IHsgUHJvZ3JhbSB9IGZyb20gJy4vY29yZS9Qcm9ncmFtLmpzJztcbmV4cG9ydCB7IFJlbmRlcmVyIH0gZnJvbSAnLi9jb3JlL1JlbmRlcmVyLmpzJztcbmV4cG9ydCB7IENhbWVyYSB9IGZyb20gJy4vY29yZS9DYW1lcmEuanMnO1xuZXhwb3J0IHsgVHJhbnNmb3JtIH0gZnJvbSAnLi9jb3JlL1RyYW5zZm9ybS5qcyc7XG5leHBvcnQgeyBNZXNoIH0gZnJvbSAnLi9jb3JlL01lc2guanMnO1xuZXhwb3J0IHsgVGV4dHVyZSB9IGZyb20gJy4vY29yZS9UZXh0dXJlLmpzJztcbmV4cG9ydCB7IFJlbmRlclRhcmdldCB9IGZyb20gJy4vY29yZS9SZW5kZXJUYXJnZXQuanMnO1xuXG4vLyBNYXRoc1xuZXhwb3J0IHsgQ29sb3IgfSBmcm9tICcuL21hdGgvQ29sb3IuanMnO1xuZXhwb3J0IHsgRXVsZXIgfSBmcm9tICcuL21hdGgvRXVsZXIuanMnO1xuZXhwb3J0IHsgTWF0MyB9IGZyb20gJy4vbWF0aC9NYXQzLmpzJztcbmV4cG9ydCB7IE1hdDQgfSBmcm9tICcuL21hdGgvTWF0NC5qcyc7XG5leHBvcnQgeyBRdWF0IH0gZnJvbSAnLi9tYXRoL1F1YXQuanMnO1xuZXhwb3J0IHsgVmVjMiB9IGZyb20gJy4vbWF0aC9WZWMyLmpzJztcbmV4cG9ydCB7IFZlYzMgfSBmcm9tICcuL21hdGgvVmVjMy5qcyc7XG5leHBvcnQgeyBWZWM0IH0gZnJvbSAnLi9tYXRoL1ZlYzQuanMnO1xuXG4vLyBFeHRyYXNcbmV4cG9ydCB7IFBsYW5lIH0gZnJvbSAnLi9leHRyYXMvUGxhbmUuanMnO1xuZXhwb3J0IHsgQm94IH0gZnJvbSAnLi9leHRyYXMvQm94LmpzJztcbmV4cG9ydCB7IFNwaGVyZSB9IGZyb20gJy4vZXh0cmFzL1NwaGVyZS5qcyc7XG5leHBvcnQgeyBDeWxpbmRlciB9IGZyb20gJy4vZXh0cmFzL0N5bGluZGVyLmpzJztcbmV4cG9ydCB7IFRyaWFuZ2xlIH0gZnJvbSAnLi9leHRyYXMvVHJpYW5nbGUuanMnO1xuZXhwb3J0IHsgVG9ydXMgfSBmcm9tICcuL2V4dHJhcy9Ub3J1cy5qcyc7XG5leHBvcnQgeyBPcmJpdCB9IGZyb20gJy4vZXh0cmFzL09yYml0LmpzJztcbmV4cG9ydCB7IFJheWNhc3QgfSBmcm9tICcuL2V4dHJhcy9SYXljYXN0LmpzJztcbmV4cG9ydCB7IEN1cnZlIH0gZnJvbSAnLi9leHRyYXMvQ3VydmUuanMnO1xuZXhwb3J0IHsgUG9zdCB9IGZyb20gJy4vZXh0cmFzL1Bvc3QuanMnO1xuZXhwb3J0IHsgU2tpbiB9IGZyb20gJy4vZXh0cmFzL1NraW4uanMnO1xuZXhwb3J0IHsgQW5pbWF0aW9uIH0gZnJvbSAnLi9leHRyYXMvQW5pbWF0aW9uLmpzJztcbmV4cG9ydCB7IFRleHQgfSBmcm9tICcuL2V4dHJhcy9UZXh0LmpzJztcbmV4cG9ydCB7IE5vcm1hbFByb2dyYW0gfSBmcm9tICcuL2V4dHJhcy9Ob3JtYWxQcm9ncmFtLmpzJztcbmV4cG9ydCB7IEZsb3dtYXAgfSBmcm9tICcuL2V4dHJhcy9GbG93bWFwLmpzJztcbmV4cG9ydCB7IEdQR1BVIH0gZnJvbSAnLi9leHRyYXMvR1BHUFUuanMnO1xuZXhwb3J0IHsgUG9seWxpbmUgfSBmcm9tICcuL2V4dHJhcy9Qb2x5bGluZS5qcyc7XG5leHBvcnQgeyBTaGFkb3cgfSBmcm9tICcuL2V4dHJhcy9TaGFkb3cuanMnO1xuZXhwb3J0IHsgS1RYVGV4dHVyZSB9IGZyb20gJy4vZXh0cmFzL0tUWFRleHR1cmUuanMnO1xuZXhwb3J0IHsgVGV4dHVyZUxvYWRlciB9IGZyb20gJy4vZXh0cmFzL1RleHR1cmVMb2FkZXIuanMnO1xuZXhwb3J0IHsgR0xURkxvYWRlciB9IGZyb20gJy4vZXh0cmFzL0dMVEZMb2FkZXIuanMnO1xuZXhwb3J0IHsgR0xURlNraW4gfSBmcm9tICcuL2V4dHJhcy9HTFRGU2tpbi5qcyc7XG5cbiIsImltcG9ydCB7Q2FtZXJhLCBPR0xSZW5kZXJpbmdDb250ZXh0LCBQb3N0LCBQb3N0T3B0aW9ucywgUmVuZGVyZXIsIFJlbmRlclRhcmdldCwgVHJhbnNmb3JtfSBmcm9tIFwiLi4vb2dsXCI7XG5cbmV4cG9ydCBjbGFzcyBQYXNzIHtcbiAgICBlbmFibGVkOiBib29sZWFuO1xuICAgIHJlbmRlclRvU2NyZWVuOiBib29sZWFuO1xuICAgIG5lZWRzU3dhcDogYm9vbGVhbjtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5lbmFibGVkID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5yZW5kZXJUb1NjcmVlbiA9IGZhbHNlO1xuICAgICAgICB0aGlzLm5lZWRzU3dhcCA9IHRydWU7XG4gICAgfVxuXG4gICAgcmVuZGVyKHJlbmRlcmVyOiBSZW5kZXJlciwgd3JpdGVCdWZmZXI6IFJlbmRlclRhcmdldHx1bmRlZmluZWQsIHJlYWRCdWZmZXI6IFJlbmRlclRhcmdldCkge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdOb3QgaW1wbGVtZW50ZWQnKTtcbiAgICB9XG4gICAgcmVzaXplKHsgd2lkdGgsIGhlaWdodCwgZHByIH06IFBhcnRpYWw8e1xuICAgICAgICB3aWR0aDogbnVtYmVyO1xuICAgICAgICBoZWlnaHQ6IG51bWJlcjtcbiAgICAgICAgZHByOiBudW1iZXI7XG4gICAgfT4pOiB2b2lke1xuICAgICAgICBjb25zb2xlLmVycm9yKCdOb3QgaW1wbGVtZW50ZWQnKTtcbiAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBSZW5kZXJQYXNzIGV4dGVuZHMgUGFzcyB7XG4gICAgcHJpdmF0ZSBzY2VuZTogVHJhbnNmb3JtO1xuICAgIHByaXZhdGUgY2FtZXJhOiBDYW1lcmE7XG4gICAgY29uc3RydWN0b3Ioc2NlbmU6IFRyYW5zZm9ybSwgY2FtZXJhOiBDYW1lcmEpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgdGhpcy5zY2VuZSA9IHNjZW5lO1xuICAgICAgICB0aGlzLmNhbWVyYSA9IGNhbWVyYTtcbiAgICB9XG4gICAgXG4gICAgcmVuZGVyKHJlbmRlcmVyOiBSZW5kZXJlciwgd3JpdGVCdWZmZXI6IFJlbmRlclRhcmdldHx1bmRlZmluZWQsIHJlYWRCdWZmZXI6IFJlbmRlclRhcmdldCkge1xuICAgICAgICByZW5kZXJlci5yZW5kZXIoe3NjZW5lOiB0aGlzLnNjZW5lLCBjYW1lcmE6IHRoaXMuY2FtZXJhLCB0YXJnZXQ6IHJlYWRCdWZmZXJ9KTtcbiAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBDdXN0b21Qb3N0IGV4dGVuZHMgUG9zdCB7XG4gICAgcGFzc2VzOiBQYXNzW10gPSBbXTtcblxuICAgIGNvbnN0cnVjdG9yKGdsOiBPR0xSZW5kZXJpbmdDb250ZXh0LCBvcHRpb25zOlBhcnRpYWw8UG9zdE9wdGlvbnM+ID0ge30pIHtcbiAgICAgICAgc3VwZXIoZ2wsIG9wdGlvbnMpO1xuICAgIH1cblxuICAgIGFkZFBhc3MocGFzczogUGFzcykge1xuICAgICAgICB0aGlzLnBhc3Nlcy5wdXNoKHBhc3MpO1xuICAgICAgICByZXR1cm4gcGFzcztcbiAgICB9XG5cbiAgICByZW5kZXIoeyB0YXJnZXQ9IHVuZGVmaW5lZCwgdXBkYXRlID0gdHJ1ZSwgc29ydCA9IHRydWUsIGZydXN0dW1DdWxsID0gdHJ1ZSB9KSB7XG4gICAgICAgIGNvbnN0IGVuYWJsZWRQYXNzZXMgPSB0aGlzLnBhc3Nlcy5maWx0ZXIoKHBhc3MpID0+IHBhc3MuZW5hYmxlZCk7XG4gICAgICAgIGVuYWJsZWRQYXNzZXMuZm9yRWFjaCgocGFzcywgaSkgPT4ge1xuICAgICAgICAgICAgcGFzcy5yZW5kZXIodGhpcy5nbC5yZW5kZXJlciwgdGhpcy5mYm8ud3JpdGUsIHRoaXMuZmJvLnJlYWQpO1xuICAgICAgICAgICAgcGFzcy5uZWVkc1N3YXAgJiYgdGhpcy5mYm8uc3dhcCgpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICByZXNpemUoeyB3aWR0aCwgaGVpZ2h0LCBkcHIgfTogUGFydGlhbDx7XG4gICAgICAgIHdpZHRoOiBudW1iZXI7XG4gICAgICAgIGhlaWdodDogbnVtYmVyO1xuICAgICAgICBkcHI6IG51bWJlcjtcbiAgICB9Pik6IHZvaWR7XG4gICAgICAgIHRoaXMuZmJvLnJlYWQgJiYgdGhpcy5mYm8ucmVhZC5kaXNwb3NlKCk7XG4gICAgICAgIHRoaXMuZmJvLndyaXRlICYmIHRoaXMuZmJvLndyaXRlLmRpc3Bvc2UoKTtcbiAgICAgICAgc3VwZXIucmVzaXplKHt3aWR0aDogd2lkdGgsIGhlaWdodDogaGVpZ2h0LCBkcHI6IGRwcn0pO1xuICAgICAgICB0aGlzLnBhc3Nlcy5mb3JFYWNoKCAocGFzcykgPT4ge1xuICAgICAgICAgICAgcGFzcy5yZXNpemUoe3dpZHRoLCBoZWlnaHQsIGRwcn0pO1xuICAgICAgICB9KVxuICAgIH1cbn0iLCJleHBvcnQgKiBmcm9tIFwiLi9vZ2xcIlxuXG5leHBvcnQgKiBmcm9tICcuL21hdGVyaWFscy9wYnJtYXRlcmlhbCc7XG5leHBvcnQgKiBmcm9tIFwiLi91dGlscy91bmlmb3JtVXRpbHNcIjtcbmV4cG9ydCAqIGZyb20gXCIuL3V0aWxzL3BicmhlbHBlclwiO1xuZXhwb3J0ICogZnJvbSBcIi4vdXRpbHMvdXRpbFwiO1xuZXhwb3J0ICogZnJvbSBcIi4vdXRpbHMvZXZlbnRkaXNwYXRjaGVyXCI7XG5leHBvcnQgKiBmcm9tIFwiLi9leHRyYXMvQ3VzdG9tUG9zdFwiO1xuIiwiLy8gQHRzLWlnbm9yZVxuaW1wb3J0IHBicnZlcnQgZnJvbSAnLi9zaGFkZXJzL3Bici52ZXJ0Jztcbi8vIEB0cy1pZ25vcmVcbmltcG9ydCBwYnJmcmFnIGZyb20gJy4vc2hhZGVycy9wYnIuZnJhZyc7XG5pbXBvcnQge1Byb2dyYW1DYWNoZX0gZnJvbSAnLi4vdXRpbHMvcHJvZ3JhbWNhY2hlJztcbmltcG9ydCB7UHJvZ3JhbSwgVGV4dHVyZSwgVGV4dHVyZUxvYWRlciwgVmVjMywgVmVjNH0gZnJvbSBcIi4uL29nbFwiO1xuXG5leHBvcnQgdHlwZSBUVW5pZm9ybXMgPSBSZWNvcmQ8c3RyaW5nLCB7IHZhbHVlPzogYW55IH0+XG5cbmV4cG9ydCBjbGFzcyBQQlJNYXRlcmlhbCB7XG4gICAgcHJvdGVjdGVkIHN0YXRpYyByZWFkb25seSBkZWZhdWx0VmVydGV4OiBzdHJpbmcgPSBwYnJ2ZXJ0O1xuICAgIHByb3RlY3RlZCBzdGF0aWMgcmVhZG9ubHkgZGVmYXVsdEZyYWdtZW50OiBzdHJpbmcgPSBwYnJmcmFnO1xuXG4gICAgcHJpdmF0ZSBnbF86IGFueTtcbiAgICBwcml2YXRlIHByb2dyYW1fOiBQcm9ncmFtO1xuICAgIHByaXZhdGUgdW5pZm9ybXNfOiBhbnk7XG4gICAgcHJpdmF0ZSBzdGF0aWMgbHV0VGV4dHVyZU1hcDogTWFwPHN0cmluZywgVGV4dHVyZT4gPSBuZXcgTWFwPHN0cmluZywgVGV4dHVyZT4oKTtcbiAgICBwcml2YXRlIGVudk1hcFNwZWN1bGFyXz86IFRleHR1cmU7XG4gICAgcHJpdmF0ZSBlbnZNYXBEaWZmdXNlXz86IFRleHR1cmU7XG5cbiAgICBwcml2YXRlIGNvbG9yXzogVmVjNCA9IG5ldyBWZWM0KDEsIDEsIDEsIDEpO1xuICAgIHByaXZhdGUgcm91Z2huZXNzXzogbnVtYmVyID0gMDtcbiAgICBwcml2YXRlIG1ldGFsbmVzc186IG51bWJlciA9IDA7XG4gICAgcHJpdmF0ZSBlbnZNYXBJbnRlbnNpdHlfOiBudW1iZXIgPSAxO1xuXG4gICAgY29uc3RydWN0b3IoZ2w6IGFueSwgcGJycGFyYW1zPzogUEJSTWF0ZXJpYWxQYXJhbXMsIGRlZmluZXM/IDogc3RyaW5nLCB1bmlmb3Jtcz86IFRVbmlmb3Jtcywgc2hhZGVycz86IHtmcmFnPzogc3RyaW5nLCB2ZXJ0Pzogc3RyaW5nfSkge1xuICAgICAgICB0aGlzLmdsXyA9IGdsO1xuXG4gICAgICAgIGlmKCFQQlJNYXRlcmlhbC5sdXRUZXh0dXJlTWFwLmdldChnbC5jYW52YXMuaWQpKSB7XG4gICAgICAgICAgICBQQlJNYXRlcmlhbC5sdXRUZXh0dXJlTWFwLnNldChnbC5jYW52YXMuaWQsIFRleHR1cmVMb2FkZXIubG9hZChnbCwge1xuICAgICAgICAgICAgICBzcmM6ICdodHRwczovL2Fzc2V0cy5qZXdsci5jb20vajNkL2x1dC5wbmcnLFxuICAgICAgICAgICAgfSkpO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHBiclZlcnQgPSBzaGFkZXJzPy52ZXJ0ID8/IHBicnZlcnQ7XG4gICAgICAgIGxldCBwYnJGcmFnID0gc2hhZGVycz8uZnJhZyA/PyBwYnJmcmFnO1xuXG4gICAgICAgIHRoaXMuY29sb3JfID0gcGJycGFyYW1zPy5iYXNlQ29sb3JGYWN0b3IgIT09IHVuZGVmaW5lZCA/IG5ldyBWZWM0KCkuY29weShwYnJwYXJhbXMuYmFzZUNvbG9yRmFjdG9yKSA6IG5ldyBWZWM0KDEsIDEsIDEsIDEpO1xuICAgICAgICB0aGlzLnJvdWdobmVzcyA9IHBicnBhcmFtcz8ucm91Z2huZXNzICE9PSB1bmRlZmluZWQgPyBwYnJwYXJhbXMucm91Z2huZXNzIDogMDtcbiAgICAgICAgdGhpcy5tZXRhbG5lc3MgPSBwYnJwYXJhbXM/Lm1ldGFsbmVzcyAhPT0gdW5kZWZpbmVkID8gcGJycGFyYW1zLm1ldGFsbmVzcyA6IDA7XG4gICAgICAgIHRoaXMuZW52TWFwSW50ZW5zaXR5ID0gcGJycGFyYW1zPy5lbnZNYXBJbnRlbnNpdHkgIT09IHVuZGVmaW5lZCA/IHBicnBhcmFtcz8uZW52TWFwSW50ZW5zaXR5IDogMTtcblxuICAgICAgICB0aGlzLnVuaWZvcm1zXyA9IHtcbiAgICAgICAgICAgIHVCYXNlQ29sb3JGYWN0b3I6IHsgdmFsdWU6IG5ldyBWZWM0KCkuY29weSh0aGlzLmNvbG9yXykgfSxcbiAgICAgICAgICAgIHRCYXNlQ29sb3I6IHsgdmFsdWU6IHBicnBhcmFtcz8uYmFzZUNvbG9yVGV4dHVyZSA/IHBicnBhcmFtcz8uYmFzZUNvbG9yVGV4dHVyZS50ZXh0dXJlIDogbnVsbCB9LFxuXG4gICAgICAgICAgICB1Um91Z2huZXNzOiB7IHZhbHVlOiBwYnJwYXJhbXM/LnJvdWdobmVzcyAhPT0gdW5kZWZpbmVkID8gcGJycGFyYW1zPy5yb3VnaG5lc3MgOiAxIH0sXG4gICAgICAgICAgICB1TWV0YWxsaWM6IHsgdmFsdWU6IHBicnBhcmFtcz8ubWV0YWxuZXNzICE9PSB1bmRlZmluZWQgPyBwYnJwYXJhbXM/Lm1ldGFsbmVzcyA6IDEgfSxcblxuICAgICAgICAgICAgdE5vcm1hbDogeyB2YWx1ZTogeyB0ZXh0dXJlOiBudWxsfSB9LFxuICAgICAgICAgICAgdU5vcm1hbFNjYWxlOiB7IHZhbHVlOiBwYnJwYXJhbXM/Lm5vcm1hbFNjYWxlIHx8IDEgfSxcblxuICAgICAgICAgICAgdE9jY2x1c2lvbjogeyB2YWx1ZTogeyB0ZXh0dXJlOiBudWxsfSB9LFxuXG4gICAgICAgICAgICB0RW1pc3NpdmU6IHsgdmFsdWU6IHsgdGV4dHVyZTogbnVsbH0gfSxcbiAgICAgICAgICAgIHVFbWlzc2l2ZTogeyB2YWx1ZTogcGJycGFyYW1zPy5lbWlzc2l2ZSB8fCBbMCwgMCwgMF0gfSxcblxuICAgICAgICAgICAgdExVVDogeyB2YWx1ZTogUEJSTWF0ZXJpYWwubHV0VGV4dHVyZU1hcC5nZXQoZ2wuY2FudmFzLmlkKSB9LFxuICAgICAgICAgICAgdEVudkRpZmZ1c2U6IHsgdmFsdWU6IHsgdGV4dHVyZTogbnVsbH0gfSxcbiAgICAgICAgICAgIHRFbnZTcGVjdWxhcjogeyB2YWx1ZTogeyB0ZXh0dXJlOiBudWxsfSB9LFxuICAgICAgICAgICAgdUVudkRpZmZ1c2U6IHsgdmFsdWU6IDAuNSB9LFxuICAgICAgICAgICAgdUVudlNwZWN1bGFyOiB7IHZhbHVlOiAwLjUgfSxcbiAgICAgICAgICAgIHVFbnZNYXBJbnRlbnNpdHk6IHsgdmFsdWU6IDEgfSxcblxuICAgICAgICAgICAgdUFscGhhOiB7IHZhbHVlOiBwYnJwYXJhbXM/LmFscGhhIH0sXG4gICAgICAgICAgICB1QWxwaGFDdXRvZmY6IHsgdmFsdWU6IHBicnBhcmFtcz8uYWxwaGFDdXRvZmYgfSxcblxuICAgICAgICAgICAgLi4uKHVuaWZvcm1zPz97fSksXG4gICAgICAgIH1cbiAgICAgICAgZGVmaW5lcyA9IGRlZmluZXMgPyBkZWZpbmVzIDogYGA7XG4gICAgICAgIHRoaXMucHJvZ3JhbV8gPSB0aGlzLmNyZWF0ZVByb2dyYW1fKGRlZmluZXMsIHBiclZlcnQsIHBickZyYWcpO1xuICAgIH1cblxuICAgIGdldCBpc1BCUk1hdGVyaWFsKCkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBnZXQgcHJvZ3JhbSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJvZ3JhbV87XG4gICAgfVxuXG4gICAgc2V0IGNvbG9yKGNvbG9yOiBWZWM0KSB7XG4gICAgICAgIHRoaXMuY29sb3JfLmNvcHkoY29sb3IpO1xuICAgIH1cblxuICAgIGdldCBjb2xvcigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29sb3JfO1xuICAgIH1cblxuICAgIHNldCBlbWlzc2l2ZShjb2xvcjogVmVjMykge1xuICAgICAgICBsZXQgY29sb3JfID0gdGhpcy51bmlmb3Jtc18udUVtaXNzaXZlLnZhbHVlO1xuICAgICAgICBjb2xvcl8uY29weShjb2xvcik7XG4gICAgfVxuXG4gICAgZ2V0IGVtaXNzaXZlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy51bmlmb3Jtc18udUVtaXNzaXZlLnZhbHVlO1xuICAgIH1cblxuICAgIHNldCByb3VnaG5lc3Mocm91Z2huZXNzOiBudW1iZXIpIHtcbiAgICAgICAgdGhpcy5yb3VnaG5lc3NfID0gcm91Z2huZXNzO1xuICAgIH1cblxuICAgIGdldCByb3VnaG5lc3MoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnJvdWdobmVzc187XG4gICAgfVxuXG4gICAgc2V0IG1ldGFsbmVzcyhtZXRhbG5lc3M6IG51bWJlcikge1xuICAgICAgICB0aGlzLm1ldGFsbmVzc18gPSBtZXRhbG5lc3M7XG4gICAgfVxuXG4gICAgZ2V0IG1ldGFsbmVzcygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubWV0YWxuZXNzXztcbiAgICB9XG5cbiAgICBzZXQgbm9ybWFsU2NhbGUobm9ybWFsU2NhbGU6IG51bWJlcikge1xuICAgICAgICB0aGlzLnVuaWZvcm1zXy51Tm9ybWFsU2NhbGUudmFsdWUgPSBub3JtYWxTY2FsZTtcbiAgICB9XG5cbiAgICBnZXQgbm9ybWFsU2NhbGUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnVuaWZvcm1zXy51Tm9ybWFsU2NhbGUudmFsdWU7XG4gICAgfVxuXG4gICAgc2V0IGVudk1hcFNwZWN1bGFyKGVudk1hcFNwZWN1bGFyOiBhbnkpIHtcbiAgICAgICAgdGhpcy5lbnZNYXBTcGVjdWxhcl8gPSBlbnZNYXBTcGVjdWxhcjtcbiAgICB9XG5cbiAgICBnZXQgZW52TWFwU3BlY3VsYXIoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmVudk1hcFNwZWN1bGFyXztcbiAgICB9XG5cbiAgICBzZXQgZW52TWFwRGlmZnVzZShlbnZNYXBEaWZmdXNlOiBhbnkpIHtcbiAgICAgICAgdGhpcy5lbnZNYXBEaWZmdXNlXyA9IGVudk1hcERpZmZ1c2U7XG4gICAgfVxuXG4gICAgZ2V0IGVudk1hcERpZmZ1c2UoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmVudk1hcERpZmZ1c2VfO1xuICAgIH1cblxuICAgIHNldCBlbnZNYXBJbnRlbnNpdHkoZW52TWFwSW50ZW5zaXR5OiBhbnkpIHtcbiAgICAgICAgdGhpcy5lbnZNYXBJbnRlbnNpdHlfID0gZW52TWFwSW50ZW5zaXR5O1xuICAgIH1cblxuICAgIGdldCBlbnZNYXBJbnRlbnNpdHkoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmVudk1hcEludGVuc2l0eV87XG4gICAgfVxuXG4gICAgcHVibGljIHNlcmlhbGl6ZSgpIDogUEJSTWF0ZXJpYWxQYXJhbXMge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgYmFzZUNvbG9yOiBuZXcgVmVjNCgxLCAxLCAxLCAxKSxcbiAgICAgICAgICAgIGJhc2VDb2xvckZhY3RvcjogdGhpcy5jb2xvcl8uY29weShuZXcgVmVjNCgpKSxcbiAgICAgICAgICAgIHJvdWdobmVzczogdGhpcy5yb3VnaG5lc3NfLFxuICAgICAgICAgICAgbWV0YWxuZXNzOiB0aGlzLm1ldGFsbmVzc18sXG4gICAgICAgICAgICBlbnZNYXBJbnRlbnNpdHk6IHRoaXMuZW52TWFwSW50ZW5zaXR5XG4gICAgICAgICAgICAvLyBub3JtYWxTY2FsZTogdGhpcy5ub3JtYWxTY2FsZVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIGxvYWQocGFyYW1zOiBQQlJNYXRlcmlhbFBhcmFtcykge1xuICAgICAgICBpZihwYXJhbXMpIHtcbiAgICAgICAgICAgIGlmKHBhcmFtcy5iYXNlQ29sb3JGYWN0b3IpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbG9yXy54ID0gcGFyYW1zLmJhc2VDb2xvckZhY3RvclswXSAhPT0gdW5kZWZpbmVkID8gcGFyYW1zLmJhc2VDb2xvckZhY3RvclswXSA6IHBhcmFtcy5iYXNlQ29sb3JGYWN0b3IueDtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbG9yXy55ID0gcGFyYW1zLmJhc2VDb2xvckZhY3RvclsxXSAhPT0gdW5kZWZpbmVkID8gcGFyYW1zLmJhc2VDb2xvckZhY3RvclsxXSA6IHBhcmFtcy5iYXNlQ29sb3JGYWN0b3IueTtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbG9yXy56ID0gcGFyYW1zLmJhc2VDb2xvckZhY3RvclsyXSAhPT0gdW5kZWZpbmVkID8gcGFyYW1zLmJhc2VDb2xvckZhY3RvclsyXSA6IHBhcmFtcy5iYXNlQ29sb3JGYWN0b3IuejtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbG9yXy53ID0gcGFyYW1zLmJhc2VDb2xvckZhY3RvclszXSAhPT0gdW5kZWZpbmVkID8gcGFyYW1zLmJhc2VDb2xvckZhY3RvclszXSA6IHBhcmFtcy5iYXNlQ29sb3JGYWN0b3IudztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmKHBhcmFtcy5lbWlzc2l2ZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuZW1pc3NpdmUueCA9IHBhcmFtcy5lbWlzc2l2ZS54O1xuICAgICAgICAgICAgICAgIHRoaXMuZW1pc3NpdmUueSA9IHBhcmFtcy5lbWlzc2l2ZS55O1xuICAgICAgICAgICAgICAgIHRoaXMuZW1pc3NpdmUueiA9IHBhcmFtcy5lbWlzc2l2ZS56O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYocGFyYW1zLnJvdWdobmVzcyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5yb3VnaG5lc3MgPSBwYXJhbXMucm91Z2huZXNzO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYocGFyYW1zLm1ldGFsbmVzcyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tZXRhbG5lc3MgPSBwYXJhbXMubWV0YWxuZXNzO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYocGFyYW1zLmVudk1hcEludGVuc2l0eSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5lbnZNYXBJbnRlbnNpdHkgPSBwYXJhbXMuZW52TWFwSW50ZW5zaXR5O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICB9XG5cbiAgICBwcml2YXRlIGNyZWF0ZVByb2dyYW1fKGRlZmluZXM6IHN0cmluZywgdmVydGV4Pzogc3RyaW5nLCBmcmFnbWVudD86IHN0cmluZykge1xuICAgICAgICB2ZXJ0ZXggPSB2ZXJ0ZXggPz8gUEJSTWF0ZXJpYWwuZGVmYXVsdFZlcnRleFxuICAgICAgICBmcmFnbWVudCA9IGZyYWdtZW50ID8/IFBCUk1hdGVyaWFsLmRlZmF1bHRGcmFnbWVudDtcblxuICAgICAgICB2ZXJ0ZXggPSBkZWZpbmVzICsgdmVydGV4O1xuICAgICAgICBmcmFnbWVudCA9IGRlZmluZXMgKyBmcmFnbWVudDtcblxuICAgICAgICBsZXQgcHJvZ3JhbSA9IFByb2dyYW1DYWNoZS5nZXRJbnN0YW5jZSgpLmNyZWF0ZVByb2dyYW0odGhpcy5nbF8sIHZlcnRleCwgZnJhZ21lbnQsIHRoaXMudW5pZm9ybXNfKTtcbiAgICAgICAgLy8gY29uc3QgcHJvZ3JhbSA9IG5ldyBQcm9ncmFtKHRoaXMuZ2xfLCB7XG4gICAgICAgIC8vICAgICB2ZXJ0ZXgsXG4gICAgICAgIC8vICAgICBmcmFnbWVudCxcbiAgICAgICAgLy8gICAgIHVuaWZvcm1zOiB0aGlzLnVuaWZvcm1zXyxcbiAgICAgICAgLy8gICAgIC8vIHRyYW5zcGFyZW50OiBwYnJwYXJhbXMuYWxwaGFNb2RlID09PSAnQkxFTkQnLFxuICAgICAgICAvLyAgICAgY3VsbEZhY2U6IHBicnBhcmFtcy5zaWRlID8gbnVsbCA6IHRoaXMuZ2xfLkJBQ0ssXG4gICAgICAgIC8vIH0pO1xuXG4gICAgICAgIHJldHVybiBwcm9ncmFtO1xuICAgIH1cbn1cblxuZXhwb3J0IGludGVyZmFjZSBQQlJNYXRlcmlhbFBhcmFtcyB7XG4gICAgYmFzZUNvbG9yPzogVmVjNCxcbiAgICBiYXNlQ29sb3JGYWN0b3I/OiBWZWM0LFxuICAgIGJhc2VDb2xvclRleHR1cmU/OiBUZXh0dXJlLFxuICAgIHRSTT86IFRleHR1cmUsXG4gICAgcm91Z2huZXNzPzogbnVtYmVyLFxuICAgIG1ldGFsbmVzcz86IG51bWJlcixcbiAgICBub3JtYWxNYXA/OiBUZXh0dXJlLFxuICAgIG5vcm1hbFNjYWxlPzogbnVtYmVyLFxuICAgIGFvTWFwPzogYW55LFxuXG4gICAgZW1pc3NpdmVNYXA/OiBUZXh0dXJlLFxuICAgIGVtaXNzaXZlSW50ZW5zaXR5PzogYW55LFxuICAgIGVtaXNzaXZlPzogVmVjMyxcblxuICAgIHRFbnZEaWZmdXNlPzogVGV4dHVyZSxcbiAgICB0RW52U3BlY3VsYXI/OiBUZXh0dXJlLFxuICAgIHVFbnZEaWZmdXNlPzogbnVtYmVyLFxuICAgIHVFbnZTcGVjdWxhcj86IG51bWJlcixcbiAgICB1RW52SW50ZW5zaXR5PzogbnVtYmVyLFxuXG4gICAgYWxwaGE/OiBudW1iZXIsXG4gICAgYWxwaGFDdXRvZmY/OiBudW1iZXIsXG4gICAgc2lkZT86IG51bWJlcixcbiAgICB0cmFuc3BhcmVudD86IGJvb2xlYW4sXG4gICAgZW52TWFwSW50ZW5zaXR5PzogbnVtYmVyXG59XG4iLCIvKipcbiAqIHBvcnRlZCBmcm9tIGh0dHBzOi8vZ2l0aHViLmNvbS9tcmRvb2IvZXZlbnRkaXNwYXRjaGVyLmpzL1xuICovXG5cbmV4cG9ydCBjbGFzcyBFdmVudERpc3BhdGNoZXIge1xuICAgIHByaXZhdGUgX2xpc3RlbmVyczogYW55O1xuICAgIFxuXHRhZGRFdmVudExpc3RlbmVyICggdHlwZTogc3RyaW5nLCBsaXN0ZW5lciA6IGFueSApIHtcblxuXHRcdGlmICggdGhpcy5fbGlzdGVuZXJzID09PSB1bmRlZmluZWQgKSB0aGlzLl9saXN0ZW5lcnMgPSB7fTtcblxuXHRcdHZhciBsaXN0ZW5lcnMgPSB0aGlzLl9saXN0ZW5lcnM7XG5cblx0XHRpZiAoIGxpc3RlbmVyc1sgdHlwZSBdID09PSB1bmRlZmluZWQgKSB7XG5cblx0XHRcdGxpc3RlbmVyc1sgdHlwZSBdID0gW107XG5cblx0XHR9XG5cblx0XHRpZiAoIGxpc3RlbmVyc1sgdHlwZSBdLmluZGV4T2YoIGxpc3RlbmVyICkgPT09IC0gMSApIHtcblxuXHRcdFx0bGlzdGVuZXJzWyB0eXBlIF0ucHVzaCggbGlzdGVuZXIgKTtcblxuXHRcdH1cblxuXHR9XG5cblx0aGFzRXZlbnRMaXN0ZW5lciggdHlwZTogc3RyaW5nLCBsaXN0ZW5lciA6IGFueSkge1xuXG5cdFx0aWYgKCB0aGlzLl9saXN0ZW5lcnMgPT09IHVuZGVmaW5lZCApIHJldHVybiBmYWxzZTtcblxuXHRcdHZhciBsaXN0ZW5lcnMgPSB0aGlzLl9saXN0ZW5lcnM7XG5cblx0XHRyZXR1cm4gbGlzdGVuZXJzWyB0eXBlIF0gIT09IHVuZGVmaW5lZCAmJiBsaXN0ZW5lcnNbIHR5cGUgXS5pbmRleE9mKCBsaXN0ZW5lciApICE9PSAtIDE7XG5cblx0fVxuXG5cdHJlbW92ZUV2ZW50TGlzdGVuZXIoIHR5cGUgOiBzdHJpbmcsIGxpc3RlbmVyIDogYW55KSB7XG5cblx0XHRpZiAoIHRoaXMuX2xpc3RlbmVycyA9PT0gdW5kZWZpbmVkICkgcmV0dXJuO1xuXG5cdFx0dmFyIGxpc3RlbmVycyA9IHRoaXMuX2xpc3RlbmVycztcblx0XHR2YXIgbGlzdGVuZXJBcnJheSA9IGxpc3RlbmVyc1sgdHlwZSBdO1xuXG5cdFx0aWYgKCBsaXN0ZW5lckFycmF5ICE9PSB1bmRlZmluZWQgKSB7XG5cblx0XHRcdHZhciBpbmRleCA9IGxpc3RlbmVyQXJyYXkuaW5kZXhPZiggbGlzdGVuZXIgKTtcblxuXHRcdFx0aWYgKCBpbmRleCAhPT0gLSAxICkge1xuXG5cdFx0XHRcdGxpc3RlbmVyQXJyYXkuc3BsaWNlKCBpbmRleCwgMSApO1xuXG5cdFx0XHR9XG5cblx0XHR9XG5cblx0fVxuXG5cdGRpc3BhdGNoRXZlbnQoIGV2ZW50IDogYW55ICkge1xuXG5cdFx0aWYgKCB0aGlzLl9saXN0ZW5lcnMgPT09IHVuZGVmaW5lZCApIHJldHVybjtcblxuXHRcdHZhciBsaXN0ZW5lcnMgPSB0aGlzLl9saXN0ZW5lcnM7XG5cdFx0dmFyIGxpc3RlbmVyQXJyYXkgPSBsaXN0ZW5lcnNbIGV2ZW50LnR5cGUgXTtcblxuXHRcdGlmICggbGlzdGVuZXJBcnJheSAhPT0gdW5kZWZpbmVkICkge1xuXG5cdFx0XHRldmVudC50YXJnZXQgPSB0aGlzO1xuXG5cdFx0XHQvLyBNYWtlIGEgY29weSwgaW4gY2FzZSBsaXN0ZW5lcnMgYXJlIHJlbW92ZWQgd2hpbGUgaXRlcmF0aW5nLlxuXHRcdFx0dmFyIGFycmF5ID0gbGlzdGVuZXJBcnJheS5zbGljZSggMCApO1xuXG5cdFx0XHRmb3IgKCB2YXIgaSA9IDAsIGwgPSBhcnJheS5sZW5ndGg7IGkgPCBsOyBpICsrICkge1xuXG5cdFx0XHRcdGFycmF5WyBpIF0uY2FsbCggdGhpcywgZXZlbnQgKTtcblxuXHRcdFx0fVxuXG5cdFx0fVxuXG5cdH1cbn0iLCJpbXBvcnQge1BCUk1hdGVyaWFsLCBQQlJNYXRlcmlhbFBhcmFtc30gZnJvbSBcIi4uL21hdGVyaWFscy9wYnJtYXRlcmlhbFwiO1xuaW1wb3J0IHtNZXNoLCBPR0xSZW5kZXJpbmdDb250ZXh0LCBUcmFuc2Zvcm0sIFZlYzR9IGZyb20gXCIuLi9vZ2xcIjtcblxuXG5mdW5jdGlvbiBnZXRQQlJQYXJhbXMoZ2x0Zk1hdGVyaWFsOiBhbnkpIHtcbiAgICBsZXQgcGJycGFyYW1zOiBQQlJNYXRlcmlhbFBhcmFtcyA9IHtcbiAgICAgICAgYmFzZUNvbG9yOiBnbHRmTWF0ZXJpYWwuYmFzZUNvbG9yID8gbmV3IFZlYzQoKS5mcm9tQXJyYXkoZ2x0Zk1hdGVyaWFsLmJhc2VDb2xvcikgOiBuZXcgVmVjNCgxLCAxLCAxKSxcbiAgICAgICAgYmFzZUNvbG9yRmFjdG9yOiBnbHRmTWF0ZXJpYWwuYmFzZUNvbG9yRmFjdG9yID8gbmV3IFZlYzQoKS5mcm9tQXJyYXkoZ2x0Zk1hdGVyaWFsLmJhc2VDb2xvckZhY3RvcikgOiBuZXcgVmVjNCgxLCAxLCAxKSxcbiAgICAgICAgcm91Z2huZXNzOiBnbHRmTWF0ZXJpYWwucm91Z2huZXNzRmFjdG9yICE9PSB1bmRlZmluZWQgPyBnbHRmTWF0ZXJpYWwucm91Z2huZXNzRmFjdG9yIDogMC41LFxuICAgICAgICBtZXRhbG5lc3M6IGdsdGZNYXRlcmlhbC5tZXRhbGxpY0ZhY3RvciAhPT0gdW5kZWZpbmVkID8gZ2x0Zk1hdGVyaWFsLm1ldGFsbGljRmFjdG9yIDogMC41LFxuICAgICAgICBhbHBoYTogMSxcbiAgICAgICAgYWxwaGFDdXRvZmY6IGdsdGZNYXRlcmlhbC5hbHBoYUN1dG9mZixcbiAgICAgICAgc2lkZTogZ2x0Zk1hdGVyaWFsLmRvdWJsZVNpZGVkICE9PSB1bmRlZmluZWQgPyBnbHRmTWF0ZXJpYWwuZG91YmxlU2lkZWQgOiBmYWxzZSxcbiAgICAgICAgdHJhbnNwYXJlbnQ6IGdsdGZNYXRlcmlhbC5hbHBoYU1vZGUgIT09IHVuZGVmaW5lZCA/IGdsdGZNYXRlcmlhbC5hbHBoYU1vZGUgPT09ICdCTEVORCcgOiBmYWxzZVxuICAgIH1cbiAgICByZXR1cm4gcGJycGFyYW1zO1xufVxuXG5mdW5jdGlvbiB1cGRhdGVVbmlmb3Jtc18obWF0ZXJpYWw/OiBQQlJNYXRlcmlhbCkge1xuICAgIGlmKG1hdGVyaWFsICYmIG1hdGVyaWFsIGluc3RhbmNlb2YgUEJSTWF0ZXJpYWwpIHtcbiAgICAgICAgbGV0IHByb2dyYW0gPSBtYXRlcmlhbC5wcm9ncmFtO1xuICAgICAgICBwcm9ncmFtLnVuaWZvcm1zWyd1QmFzZUNvbG9yRmFjdG9yJ10udmFsdWUuY29weShtYXRlcmlhbC5jb2xvcik7XG4gICAgICAgIHByb2dyYW0udW5pZm9ybXNbJ3VSb3VnaG5lc3MnXS52YWx1ZSA9IG1hdGVyaWFsLnJvdWdobmVzcztcbiAgICAgICAgcHJvZ3JhbS51bmlmb3Jtc1sndU1ldGFsbGljJ10udmFsdWUgPSBtYXRlcmlhbC5tZXRhbG5lc3M7XG4gICAgICAgIHByb2dyYW0udW5pZm9ybXNbJ3VFbnZNYXBJbnRlbnNpdHknXS52YWx1ZSA9IG1hdGVyaWFsLmVudk1hcEludGVuc2l0eTtcbiAgICAgICAgcHJvZ3JhbS51bmlmb3Jtc1sndEVudkRpZmZ1c2UnXS52YWx1ZSA9IG1hdGVyaWFsLmVudk1hcERpZmZ1c2U7XG4gICAgICAgIHByb2dyYW0udW5pZm9ybXNbJ3RFbnZTcGVjdWxhciddLnZhbHVlID0gbWF0ZXJpYWwuZW52TWFwU3BlY3VsYXI7XG4gICAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gYXNzaWduUEJSTWF0ZXJpYWxzKGdsOiBPR0xSZW5kZXJpbmdDb250ZXh0LCByb290OiBUcmFuc2Zvcm0sIG1hdGVyaWFsQ3Rvcj86IChnbDogT0dMUmVuZGVyaW5nQ29udGV4dCwgcDogUEJSTWF0ZXJpYWxQYXJhbXMsIGRlZmluZXM6IHN0cmluZyk9PlBCUk1hdGVyaWFsKSB7XG4gICAgcm9vdC50cmF2ZXJzZSgobm9kZSkgPT4ge1xuICAgICAgICBpZiAobm9kZSBpbnN0YW5jZW9mIE1lc2ggJiYgbm9kZS5wcm9ncmFtICYmICEobm9kZSBhcyBhbnkpLmlzRGlhbW9uZE1hdGVyaWFsICYmIG5vZGUucHJvZ3JhbS5nbHRmTWF0ZXJpYWwpIHsgLy90b2RvOiBpc0RpYW1vbmRNYXRlcmlhbCBvbiBub2RlPz9cbiAgICAgICAgICAgIGxldCBkZWZpbmVzID0gYCR7bm9kZS5nZW9tZXRyeS5hdHRyaWJ1dGVzLnV2ID8gYCNkZWZpbmUgVVZcXG5gIDogYGB9YDtcbiAgICAgICAgICAgIGxldCBtYXRlcmlhbCA9IG1hdGVyaWFsQ3RvciA/XG4gICAgICAgICAgICAgICAgbWF0ZXJpYWxDdG9yKGdsLCBnZXRQQlJQYXJhbXMobm9kZS5wcm9ncmFtLmdsdGZNYXRlcmlhbCksIGRlZmluZXMpIDpcbiAgICAgICAgICAgICAgICBuZXcgUEJSTWF0ZXJpYWwoZ2wsIGdldFBCUlBhcmFtcyhub2RlLnByb2dyYW0uZ2x0Zk1hdGVyaWFsKSwgZGVmaW5lcyk7XG4gICAgICAgICAgICBub2RlLm1hdGVyaWFsID0gbWF0ZXJpYWw7XG4gICAgICAgICAgICBub2RlLnByb2dyYW0gPSBtYXRlcmlhbC5wcm9ncmFtO1xuXG4gICAgICAgICAgICBub2RlLm9uQmVmb3JlUmVuZGVyKCAodmFsdWU6IGFueSkgPT4ge1xuICAgICAgICAgICAgICAgIHVwZGF0ZVVuaWZvcm1zXyhub2RlLm1hdGVyaWFsKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSk7XG59XG4iLCJpbXBvcnQge1Byb2dyYW19IGZyb20gJy4uL29nbCdcblxuZXhwb3J0IGNsYXNzIFByb2dyYW1DYWNoZSB7XG5cbiAgICBwcml2YXRlIHByb2dyYW1NYXBfOiBNYXA8c3RyaW5nLCBQcm9ncmFtPiA9IG5ldyBNYXA8c3RyaW5nLCBQcm9ncmFtPigpO1xuICAgIHByaXZhdGUgc3RhdGljIGluc3RhbmNlXzogUHJvZ3JhbUNhY2hlO1xuXG4gICAgcHJpdmF0ZSBjb25zdHJ1Y3RvcigpIHtcbiAgICB9XG5cbiAgICBzdGF0aWMgZ2V0SW5zdGFuY2UoKSB7XG4gICAgICAgIGlmKCF0aGlzLmluc3RhbmNlXykge1xuICAgICAgICAgICAgdGhpcy5pbnN0YW5jZV8gPSBuZXcgUHJvZ3JhbUNhY2hlKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuaW5zdGFuY2VfO1xuICAgIH1cblxuICAgIGNyZWF0ZVByb2dyYW0oZ2w6IGFueSwgdmVydGV4OiBzdHJpbmcsIGZyYWdtZW50OiBzdHJpbmcsIHVuaWZvcm1zOiBhbnkpIHtcbiAgICAgICAgbGV0IGtleSA9IHZlcnRleCArIGZyYWdtZW50ICsgZ2wuY2FudmFzLmlkO1xuICAgICAgICBsZXQgY2FjaGVkUHJvZ3JhbSA9IHRoaXMucHJvZ3JhbU1hcF8uZ2V0KGtleSk7XG4gICAgICAgIGlmKGNhY2hlZFByb2dyYW0pIHtcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRQcm9ncmFtO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHByb2dyYW0gPSBuZXcgUHJvZ3JhbShnbCwge1xuICAgICAgICAgICAgdmVydGV4LFxuICAgICAgICAgICAgZnJhZ21lbnQsXG4gICAgICAgICAgICB1bmlmb3JtczogdW5pZm9ybXMsXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLnByb2dyYW1NYXBfLnNldChrZXksIHByb2dyYW0pO1xuICAgICAgICByZXR1cm4gcHJvZ3JhbTtcbiAgICB9XG59XG4iLCIvKipcbiAqIFVuaWZvcm0gVXRpbGl0aWVzLFxuICovXG5pbXBvcnQge1RVbmlmb3Jtc30gZnJvbSBcIi4uL21hdGVyaWFscy9wYnJtYXRlcmlhbFwiO1xuXG5leHBvcnQgZnVuY3Rpb24gY2xvbmVVbmlmb3Jtcyggc3JjOiBUVW5pZm9ybXMgKSB7XG4gICAgY29uc3QgZHN0OiBhbnkgPSB7fTtcbiAgICBmb3IgKGxldCB1IGluIHNyYyApIHtcbiAgICAgICAgZHN0WyB1IF0gPSB7fTtcbiAgICAgICAgZm9yIChsZXQgcCBpbiBzcmNbIHUgXSApIHtcbiAgICAgICAgICAgIGNvbnN0IHByb3BlcnR5ID0gKHNyYyBhcyBhbnkpW3VdW3BdO1xuICAgICAgICAgICAgaWYgKCBwcm9wZXJ0eSAmJiAodHlwZW9mIHByb3BlcnR5LmNsb25lID09PSAnZnVuY3Rpb24nICkgKSB7XG4gICAgICAgICAgICAgICAgZHN0WyB1IF1bIHAgXSA9IHByb3BlcnR5LmNsb25lKCk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKCBBcnJheS5pc0FycmF5KCBwcm9wZXJ0eSApICkge1xuICAgICAgICAgICAgICAgIGRzdFsgdSBdWyBwIF0gPSBwcm9wZXJ0eS5zbGljZSgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBkc3RbIHUgXVsgcCBdID0gcHJvcGVydHk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGRzdDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1lcmdlVW5pZm9ybXMoIHVuaWZvcm1zOiBUVW5pZm9ybXMgKSB7XG4gICAgY29uc3QgbWVyZ2VkOiBhbnkgPSB7fTtcbiAgICBmb3IgKGxldCB1ID0gMDsgdSA8IHVuaWZvcm1zLmxlbmd0aDsgdSArKyApIHtcbiAgICAgICAgY29uc3QgdG1wID0gY2xvbmVVbmlmb3Jtcyh1bmlmb3Jtc1t1XSk7XG4gICAgICAgIGZvciAobGV0IHAgaW4gdG1wICkge1xuICAgICAgICAgICAgbWVyZ2VkWyBwIF0gPSB0bXBbIHAgXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbWVyZ2VkO1xufSIsImltcG9ydCB7TWVzaCwgUmVuZGVyZXIsIFRyYW5zZm9ybSwgVmVjM30gZnJvbSBcIi4uL29nbFwiO1xuXG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRTbmFwc2hvdERhdGEocmVuZGVyZXI6IFJlbmRlcmVyLCBtaW1lVHlwZT86IHN0cmluZyk6IHN0cmluZyB7XG4gICAgbWltZVR5cGUgPSBtaW1lVHlwZSA/PyBcImltYWdlL3BuZ1wiO1xuICAgIHJldHVybiByZW5kZXJlci5nbC5jYW52YXMudG9EYXRhVVJMKG1pbWVUeXBlKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFNuYXBzaG90KHJlbmRlcmVyOiBSZW5kZXJlciwgb3B0aW9uczogeyBtaW1lVHlwZT86IHN0cmluZywgY29udGV4dD86IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCwgY2FudmFzPzogSFRNTENhbnZhc0VsZW1lbnQgfSk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgbGV0IGltZ1VybCA9IGdldFNuYXBzaG90RGF0YShyZW5kZXJlciwgb3B0aW9ucy5taW1lVHlwZSk7XG4gICAgbGV0IGNvbnRleHQgPSBvcHRpb25zLmNvbnRleHQgPz8gb3B0aW9ucy5jYW52YXM/LmdldENvbnRleHQoXCIyZFwiKTtcbiAgICBpZiAoIWNvbnRleHQpXG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoaW1nVXJsKTtcbiAgICByZXR1cm4gbmV3IFByb21pc2U8c3RyaW5nPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgIGxldCBpbWcgPSBuZXcgSW1hZ2UoKTtcbiAgICAgICAgaW1nLm9ubG9hZCA9ICgpID0+IHtcbiAgICAgICAgICAgIGNvbnRleHQ/LmRyYXdJbWFnZShpbWcsIDAsIDAsIGNvbnRleHQhLmNhbnZhcy53aWR0aCwgY29udGV4dCEuY2FudmFzLmhlaWdodCk7XG4gICAgICAgICAgICByZXNvbHZlKGltZ1VybCk7XG4gICAgICAgIH07XG4gICAgICAgIGltZy5zcmMgPSBpbWdVcmw7XG4gICAgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRQb2ludGVyUG9zaXRpb24ocG9zaXRpb246IHt4OiBudW1iZXIsIHk6IG51bWJlcn0sIGNhbnZhczogSFRNTENhbnZhc0VsZW1lbnQpIHtcbiAgICBjb25zdCBjYW52YXNCb3VuZHMgPSBjYW52YXMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgbGV0IHggPSAoKHBvc2l0aW9uLnggLSBjYW52YXNCb3VuZHMubGVmdCkgLyAoY2FudmFzQm91bmRzLnJpZ2h0IC0gY2FudmFzQm91bmRzLmxlZnQpKSAqIDIgLSAxO1xuICAgIGxldCB5ID0gLSgocG9zaXRpb24ueSAtIGNhbnZhc0JvdW5kcy50b3ApIC8gKGNhbnZhc0JvdW5kcy5ib3R0b20gLSBjYW52YXNCb3VuZHMudG9wKSkgKiAyICsgMTtcbiAgICByZXR1cm57IHg6IHgsIHk6IHl9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0QWxsTWVzaGVzKHJvb3Q6IFRyYW5zZm9ybSkge1xuICAgIGxldCBtZXNoZXMgOiBhbnkgPSBbXTtcbiAgICByb290LnRyYXZlcnNlKChncm91cCkgPT4ge1xuICAgICAgICBpZigoZ3JvdXAgYXMgTWVzaCk/Lmdlb21ldHJ5KSB7XG4gICAgICAgICAgICBpZiAoIWdyb3VwLnBhcmVudCkgcmV0dXJuOyAvLyBTa2lwIHVuYXR0YWNoZWRcbiAgICAgICAgICAgIG1lc2hlcy5wdXNoKGdyb3VwKTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBtZXNoZXM7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjb21wdXRlQm91bmRpbmdCb3gocm9vdDogVHJhbnNmb3JtKSB7XG4gICAgY29uc3QgbWluID0gbmV3IFZlYzMoK0luZmluaXR5KTtcbiAgICBjb25zdCBtYXggPSBuZXcgVmVjMygtSW5maW5pdHkpO1xuICAgIFxuICAgIGNvbnN0IGJvdW5kc01pbiA9IG5ldyBWZWMzKCk7XG4gICAgY29uc3QgYm91bmRzTWF4ID0gbmV3IFZlYzMoKTtcbiAgICBjb25zdCBib3VuZHNDZW50ZXIgPSBuZXcgVmVjMygpO1xuICAgIGNvbnN0IGJvdW5kc1NjYWxlID0gbmV3IFZlYzMoKTtcbiAgICBcbiAgICByb290LnRyYXZlcnNlKChncm91cCkgPT4ge1xuICAgICAgICBsZXQgZ2VvbWV0cnkgPSAoZ3JvdXAgYXMgTWVzaCk/Lmdlb21ldHJ5O1xuICAgICAgICBpZihnZW9tZXRyeSkge1xuICAgICAgICAgICAgaWYgKCFncm91cC5wYXJlbnQpIHJldHVybjsgLy8gU2tpcCB1bmF0dGFjaGVkXG5cbiAgICAgICAgICAgIGlmICghZ2VvbWV0cnkuYm91bmRzKSBnZW9tZXRyeS5jb21wdXRlQm91bmRpbmdTcGhlcmUoKTtcblxuICAgICAgICAgICAgYm91bmRzQ2VudGVyLmNvcHkoZ2VvbWV0cnkuYm91bmRzLmNlbnRlcikuYXBwbHlNYXRyaXg0KGdyb3VwLndvcmxkTWF0cml4KTtcblxuICAgICAgICAgICAgLy8gR2V0IG1heCB3b3JsZCBzY2FsZSBheGlzXG4gICAgICAgICAgICBncm91cC53b3JsZE1hdHJpeC5nZXRTY2FsaW5nKGJvdW5kc1NjYWxlKTtcbiAgICAgICAgICAgIGNvbnN0IHJhZGl1c1NjYWxlID0gTWF0aC5tYXgoTWF0aC5tYXgoYm91bmRzU2NhbGVbMF0sIGJvdW5kc1NjYWxlWzFdKSwgYm91bmRzU2NhbGVbMl0pO1xuICAgICAgICAgICAgY29uc3QgcmFkaXVzID0gZ2VvbWV0cnkuYm91bmRzLnJhZGl1cyAqIHJhZGl1c1NjYWxlO1xuXG4gICAgICAgICAgICBib3VuZHNNaW4uc2V0KC1yYWRpdXMpLmFkZChib3VuZHNDZW50ZXIpO1xuICAgICAgICAgICAgYm91bmRzTWF4LnNldCgrcmFkaXVzKS5hZGQoYm91bmRzQ2VudGVyKTtcblxuICAgICAgICAgICAgLy8gQXBwbHkgd29ybGQgbWF0cml4IHRvIGJvdW5kc1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCAzOyBpKyspIHtcbiAgICAgICAgICAgICAgICBtaW5baV0gPSBNYXRoLm1pbihtaW5baV0sIGJvdW5kc01pbltpXSk7XG4gICAgICAgICAgICAgICAgbWF4W2ldID0gTWF0aC5tYXgobWF4W2ldLCBib3VuZHNNYXhbaV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4ge21pbjogbWluLCBtYXg6IG1heH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0cmF2ZXJzZShyb290OiBUcmFuc2Zvcm0sIGNhbGxCYWNrOiBhbnksIGZpbHRlcj86IGFueSkge1xuICAgIHJvb3QudHJhdmVyc2UoKGdyb3VwOiBUcmFuc2Zvcm0pID0+IHtcbiAgICAgICAgaWYoZmlsdGVyKSB7XG4gICAgICAgICAgICBpZihmaWx0ZXIoZ3JvdXApKSB7XG4gICAgICAgICAgICAgICAgY2FsbEJhY2soZ3JvdXApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2FsbEJhY2soZ3JvdXApO1xuICAgICAgICB9XG4gICAgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0cmF2ZXJzZU1lc2hlcyhyb290OiBUcmFuc2Zvcm0sIGNhbGxCYWNrOiBhbnkpIHtcbiAgICB0cmF2ZXJzZShyb290LCBjYWxsQmFjaywgKGdyb3VwOiBUcmFuc2Zvcm0pPT4ge3JldHVybiAoZ3JvdXAgYXMgTWVzaCkuZ2VvbWV0cnkgIT0gbnVsbH0pO1xufVxuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0aWYoX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSkge1xuXHRcdHJldHVybiBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiLy8gc3RhcnR1cFxuLy8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4vLyBUaGlzIGVudHJ5IG1vZHVsZSBpcyByZWZlcmVuY2VkIGJ5IG90aGVyIG1vZHVsZXMgc28gaXQgY2FuJ3QgYmUgaW5saW5lZFxudmFyIF9fd2VicGFja19leHBvcnRzX18gPSBfX3dlYnBhY2tfcmVxdWlyZV9fKFwiLi9zcmMvaW5kZXgudHNcIik7XG4iXSwic291cmNlUm9vdCI6IiJ9