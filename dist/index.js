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
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ("uniform mat4 viewMatrix;\nuniform mat3 normalMatrix;\nuniform vec3 cameraPosition;\nuniform vec4 uBaseColorFactor;\nuniform sampler2D tBaseColor;\nuniform sampler2D tRM;\nuniform float uRoughness;\nuniform float uMetallic;\nuniform sampler2D tNormal;\nuniform float uNormalScale;\nuniform sampler2D tEmissive;\nuniform vec3 uEmissive;\nuniform sampler2D tOcclusion;\nuniform sampler2D tLUT;\nuniform sampler2D tEnvDiffuse;\nuniform sampler2D tEnvSpecular;\nuniform float uEnvDiffuse;\nuniform float uEnvSpecular;\nuniform float uEnvMapIntensity;\nuniform float uAlpha;\nuniform float uAlphaCutoff;\nuniform bool uTransparent;\nvarying vec2 vUv;\nvarying vec3 vNormal;\nvarying vec3 vMPos;\nvarying vec4 vMVPos;\n\nconst float PI = 3.14159265359;\nconst float RECIPROCAL_PI = 0.31830988618;\nconst float RECIPROCAL_PI2 = 0.15915494;\nconst float LN2 = 0.6931472;\nconst float ENV_LODS = 6.0;\nvec4 SRGBtoLinear(vec4 srgb) {\n  vec3 linOut = pow(srgb.xyz, vec3(2.2));\n  return vec4(linOut, srgb.w);;\n}\nvec4 RGBMToLinear(in vec4 value) {\n  float maxRange = 6.0;\n  return vec4(value.xyz * value.w * maxRange, 1.0);\n}\nvec3 linearToSRGB(vec3 color) {\n  return pow(color, vec3(1.0 / 2.2));\n}\nvec3 getNormal() {\n  #ifdef NORMAL_MAP  \n    vec3 pos_dx = dFdx(vMPos.xyz);\n    vec3 pos_dy = dFdy(vMPos.xyz);\n    vec2 tex_dx = dFdx(vUv);\n    vec2 tex_dy = dFdy(vUv);\n    // Tangent, Bitangent\n    vec3 t = normalize(pos_dx * tex_dy.t - pos_dy * tex_dx.t);\n    vec3 b = normalize(-pos_dx * tex_dy.s + pos_dy * tex_dx.s);\n    mat3 tbn = mat3(t, b, normalize(vNormal));\n    vec3 n = texture2D(tNormal, vUv).rgb * 2.0 - 1.0;\n    n.xy *= uNormalScale;\n    vec3 normal = normalize(tbn * n);\n    // Get world normal from view normal (normalMatrix * normal)\n    // return normalize((vec4(normal, 0.0) * viewMatrix).xyz);\n    return normalize(normal);\n  #else\n    return normalize(vNormal);\n  #endif\n}\n\nvec2 cartesianToPolar(vec3 n) {\n  vec2 uv;\n  uv.x = atan(n.z, n.x) * RECIPROCAL_PI2 + 0.5;\n  uv.y = asin(n.y) * RECIPROCAL_PI + 0.5;\n  return uv;\n}\n\nvoid getIBLContribution(inout vec3 diffuse, inout vec3 specular, float NdV, float roughness, vec3 n, vec3 reflection, vec3 diffuseColor, vec3 specularColor) {\n  vec3 brdf = SRGBtoLinear(texture2D(tLUT, vec2(NdV, roughness))).rgb;\n  vec3 diffuseLight = RGBMToLinear(texture2D(tEnvDiffuse, cartesianToPolar(n))).rgb;\n  diffuseLight = mix(vec3(1), diffuseLight, uEnvDiffuse);\n  // Sample 2 levels and mix between to get smoother degradation\n  float blend = roughness * ENV_LODS;\n  float level0 = floor(blend);\n  float level1 = min(ENV_LODS, level0 + 1.0);\n  blend -= level0;\n  \n  // Sample the specular env map atlas depending on the roughness value\n  vec2 uvSpec = cartesianToPolar(reflection);\n  uvSpec.y /= 2.0;\n  vec2 uv0 = uvSpec;\n  vec2 uv1 = uvSpec;\n  uv0 /= pow(2.0, level0);\n  uv0.y += 1.0 - exp(-LN2 * level0);\n  uv1 /= pow(2.0, level1);\n  uv1.y += 1.0 - exp(-LN2 * level1);\n  vec3 specular0 = RGBMToLinear(texture2D(tEnvSpecular, uv0)).rgb;\n  vec3 specular1 = RGBMToLinear(texture2D(tEnvSpecular, uv1)).rgb;\n  vec3 specularLight = mix(specular0, specular1, blend);\n  diffuse = diffuseLight * diffuseColor;\n  \n  // Bit of extra reflection for smooth materials\n  float reflectivity = pow((1.0 - roughness), 2.0) * 0.05;\n  specular = specularLight * (specularColor * brdf.x + brdf.y + reflectivity);\n  specular *= uEnvSpecular;\n}\n\nvoid main() {\n  vec4 baseColor = uBaseColorFactor;\n  #ifdef COLOR_MAP\n    baseColor *= SRGBtoLinear(texture2D(tBaseColor, vUv));\n  #endif\n  // Get base alpha\n  float alpha = baseColor.a;\n  #ifdef ALPHA_MASK\n    if (alpha < uAlphaCutoff) discard;\n  #endif\n  // RM map packed as gb = [nothing, roughness, metallic, nothing]\n  vec4 rmSample = vec4(1);\n  #ifdef RM_MAP\n    rmSample *= texture2D(tRM, vUv);\n  #endif\n  float roughness = clamp(rmSample.g * uRoughness, 0.04, 1.0);\n  float metallic = clamp(rmSample.b * uMetallic, 0.04, 1.0);\n  vec3 f0 = vec3(0.04);\n  vec3 diffuseColor = baseColor.rgb * (vec3(1.0) - f0) * (1.0 - metallic);\n  vec3 specularColor = mix(f0, baseColor.rgb, metallic);\n  vec3 specularEnvR0 = specularColor;\n  vec3 specularEnvR90 = vec3(clamp(max(max(specularColor.r, specularColor.g), specularColor.b) * 25.0, 0.0, 1.0));\n  vec3 N = getNormal();\n  vec3 V = normalize(cameraPosition - vMPos);\n  vec3 reflection = normalize(reflect(-V, N));\n  float NdV = clamp(abs(dot(N, V)), 0.001, 1.0);\n  // Shading based off IBL lighting\n  vec3 color = vec3(0.);\n  vec3 diffuseIBL;\n  vec3 specularIBL;\n  getIBLContribution(diffuseIBL, specularIBL, NdV, roughness, N, reflection, diffuseColor, specularColor);\n  // Add IBL on top of color\n  color += (diffuseIBL + specularIBL) * uEnvMapIntensity;\n  // Add IBL spec to alpha for reflections on transparent surfaces (glass)\n  alpha = max(alpha, max(max(specularIBL.r, specularIBL.g), specularIBL.b));\n  #ifdef OCC_MAP  \n    // TODO: figure out how to apply occlusion\n    // color *= SRGBtoLinear(texture2D(tOcclusion, vUv)).rgb;\n  #endif\n  color += uEmissive;\n  #ifdef EMISSIVE_MAP  \n    vec3 emissive = SRGBtoLinear(texture2D(tEmissive, vUv)).rgb;\n    color = emissive;\n  #endif\n  // Apply uAlpha uniform at the end to overwrite any specular additions on transparent surfaces\n//  gl_FragColor.rgb = linearToSRGB(color);\n  if(uTransparent){\n    gl_FragColor = (vec4(color, alpha * uAlpha));\n  }else {\n    gl_FragColor = linearToOutputTexel(vec4(color * alpha * uAlpha, 1.));\n  }\n}");

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

/***/ "./src/shaders/encoding_par.glsl":
/*!***************************************!*\
  !*** ./src/shaders/encoding_par.glsl ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ("// Taken from threejs.\n// For a discussion of what this is, please read this: http://lousodrome.net/blog/light/2013/05/26/gamma-correct-and-hdr-rendering-in-a-32-bits-buffer/\nvec4 LinearToLinear( in vec4 value ) {\n    return value;\n}\n\nvec4 GammaToLinear( in vec4 value, in float gammaFactor ) {\n    return vec4( pow( value.rgb, vec3( gammaFactor ) ), value.a );\n}\n\nvec4 LinearToGamma( in vec4 value, in float gammaFactor ) {\n    return vec4( pow( value.rgb, vec3( 1.0 / gammaFactor ) ), value.a );\n}\n\nvec4 sRGBToLinear( in vec4 value ) {\n    return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );\n}\n\nvec4 LinearTosRGB( in vec4 value ) {\n    return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );\n}\n\nvec4 RGBEToLinear( in vec4 value ) {\n    return vec4( value.rgb * exp2( value.a * 255.0 - 128.0 ), 1.0 );\n}\n\nvec4 LinearToRGBE( in vec4 value ) {\n    float maxComponent = max( max( value.r, value.g ), value.b );\n    float fExp = clamp( ceil( log2( maxComponent ) ), -128.0, 127.0 );\n    return vec4( value.rgb / exp2( fExp ), ( fExp + 128.0 ) / 255.0 );\n    // return vec4( value.brg, ( 3.0 + 128.0 ) / 256.0 );\n}\n\n// reference: http://iwasbeingirony.blogspot.ca/2010/06/difference-between-rgbm-and-rgbd.html\nvec4 RGBMToLinear( in vec4 value, in float maxRange ) {\n    return vec4( value.rgb * value.a * maxRange, 1.0 );\n}\n\nvec4 LinearToRGBM( in vec4 value, in float maxRange ) {\n    float maxRGB = max( value.r, max( value.g, value.b ) );\n    float M = clamp( maxRGB / maxRange, 0.0, 1.0 );\n    M = ceil( M * 255.0 ) / 255.0;\n    return vec4( value.rgb / ( M * maxRange ), M );\n}\n\n// reference: http://iwasbeingirony.blogspot.ca/2010/06/difference-between-rgbm-and-rgbd.html\nvec4 RGBDToLinear( in vec4 value, in float maxRange ) {\n    return vec4( value.rgb * ( ( maxRange / 255.0 ) / value.a ), 1.0 );\n}\n\nvec4 LinearToRGBD( in vec4 value, in float maxRange ) {\n    float maxRGB = max( value.r, max( value.g, value.b ) );\n    float D = max( maxRange / maxRGB, 1.0 );\n    // NOTE: The implementation with min causes the shader to not compile on\n    // a common Alcatel A502DL in Chrome 78/Android 8.1. Some research suggests\n    // that the chipset is Mediatek MT6739 w/ IMG PowerVR GE8100 GPU.\n    // D = min( floor( D ) / 255.0, 1.0 );\n    D = clamp( floor( D ) / 255.0, 0.0, 1.0 );\n    return vec4( value.rgb * ( D * ( 255.0 / maxRange ) ), D );\n}\n\n// LogLuv reference: http://graphicrants.blogspot.ca/2009/04/rgbm-color-encoding.html\n\n// M matrix, for encoding\nconst mat3 cLogLuvM = mat3( 0.2209, 0.3390, 0.4184, 0.1138, 0.6780, 0.7319, 0.0102, 0.1130, 0.2969 );\nvec4 LinearToLogLuv( in vec4 value ) {\n    vec3 Xp_Y_XYZp = cLogLuvM * value.rgb;\n    Xp_Y_XYZp = max( Xp_Y_XYZp, vec3( 1e-6, 1e-6, 1e-6 ) );\n    vec4 vResult;\n    vResult.xy = Xp_Y_XYZp.xy / Xp_Y_XYZp.z;\n    float Le = 2.0 * log2(Xp_Y_XYZp.y) + 127.0;\n    vResult.w = fract( Le );\n    vResult.z = ( Le - ( floor( vResult.w * 255.0 ) ) / 255.0 ) / 255.0;\n    return vResult;\n}\n\n// Inverse M matrix, for decoding\nconst mat3 cLogLuvInverseM = mat3( 6.0014, -2.7008, -1.7996, -1.3320, 3.1029, -5.7721, 0.3008, -1.0882, 5.6268 );\nvec4 LogLuvToLinear( in vec4 value ) {\n    float Le = value.z * 255.0 + value.w;\n    vec3 Xp_Y_XYZp;\n    Xp_Y_XYZp.y = exp2( ( Le - 127.0 ) / 2.0 );\n    Xp_Y_XYZp.z = Xp_Y_XYZp.y / value.y;\n    Xp_Y_XYZp.x = value.x * Xp_Y_XYZp.z;\n    vec3 vRGB = cLogLuvInverseM * Xp_Y_XYZp.rgb;\n    return vec4( max( vRGB, 0.0 ), 1.0 );\n}\n\n\nvec4 inputTexelToLinear( vec4 value ) {\n    if ( inputEncoding == 0 ) {\n        return value;\n    } else if ( inputEncoding == 1 ) {\n        return sRGBToLinear( value );\n    } else if ( inputEncoding == 2 ) {\n        return RGBEToLinear( value );\n    } else if ( inputEncoding == 3 ) {\n        return RGBMToLinear( value, 7.0 );\n    } else if ( inputEncoding == 4 ) {\n        return RGBMToLinear( value, 16.0 );\n    } else if ( inputEncoding == 5 ) {\n        return RGBDToLinear( value, 256.0 );\n    } else {\n        return GammaToLinear( value, 2.2 );\n    }\n}\nvec4 linearToOutputTexel( vec4 value ) {\n    if ( outputEncoding == 0 ) {\n        return value;\n    } else if ( outputEncoding == 1 ) {\n        return LinearTosRGB( value );\n    } else if ( outputEncoding == 2 ) {\n        return LinearToRGBE( value );\n    } else if ( outputEncoding == 3 ) {\n        return LinearToRGBM( value, 7.0 );\n    } else if ( outputEncoding == 4 ) {\n        return LinearToRGBM( value, 16.0 );\n    } else if ( outputEncoding == 5 ) {\n        return LinearToRGBD( value, 256.0 );\n    } else {\n        return LinearToGamma( value, 2.2 );\n    }\n}\n\n\n");

/***/ }),

/***/ "./src/shaders/tonemapping_par.glsl":
/*!******************************************!*\
  !*** ./src/shaders/tonemapping_par.glsl ***!
  \******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ("uniform float toneMappingExposure;\n\n// exposure only\nvec3 LinearToneMapping( vec3 color ) {\n\n    return toneMappingExposure * color;\n\n}\n\n// source: https://www.cs.utah.edu/~reinhard/cdrom/\nvec3 ReinhardToneMapping( vec3 color ) {\n\n    color *= toneMappingExposure;\n    return clamp ( color / ( vec3( 1.0 ) + color ), 0., 1.);\n\n}\n\n// source: http://filmicworlds.com/blog/filmic-tonemapping-operators/\nvec3 OptimizedCineonToneMapping( vec3 color ) {\n\n    // optimized filmic operator by Jim Hejl and Richard Burgess-Dawson\n    color *= toneMappingExposure;\n    color = max( vec3( 0.0 ), color - 0.004 );\n    return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );\n\n}\n\n// source: https://github.com/selfshadow/ltc_code/blob/master/webgl/shaders/ltc/ltc_blit.fs\nvec3 RRTAndODTFit( vec3 v ) {\n\n    vec3 a = v * ( v + 0.0245786 ) - 0.000090537;\n    vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;\n    return a / b;\n\n}\n\n// this implementation of ACES is modified to accommodate a brighter viewing environment.\n// the scale factor of 1/0.6 is subjective. see discussion in #19621.\n\nvec3 ACESFilmicToneMapping( vec3 color ) {\n\n    // sRGB => XYZ => D65_2_D60 => AP1 => RRT_SAT\n    const mat3 ACESInputMat = mat3(\n    vec3( 0.59719, 0.07600, 0.02840 ), // transposed from source\n    vec3( 0.35458, 0.90834, 0.13383 ),\n    vec3( 0.04823, 0.01566, 0.83777 )\n    );\n\n    // ODT_SAT => XYZ => D60_2_D65 => sRGB\n    const mat3 ACESOutputMat = mat3(\n    vec3(  1.60475, -0.10208, -0.00327 ), // transposed from source\n    vec3( -0.53108,  1.10813, -0.07276 ),\n    vec3( -0.07367, -0.00605,  1.07602 )\n    );\n\n    color *= toneMappingExposure / 0.6;\n\n    color = ACESInputMat * color;\n\n    // Apply RRT and ODT\n    color = RRTAndODTFit( color );\n\n    color = ACESOutputMat * color;\n\n    // Clamp to [0, 1]\n    return clamp( color, 0., 1. );\n\n}\n\nvec3 CustomToneMapping( vec3 color ) { return color; }\n\nvec3 toneMapColor(vec3 value){\n    if ( tonemappingMode == 0 ) {\n        return LinearToneMapping ( value );\n    } else if ( tonemappingMode == 1 ) {\n        return ReinhardToneMapping ( value );\n    } else if ( tonemappingMode == 2 ) {\n        return OptimizedCineonToneMapping ( value );\n    } else if ( tonemappingMode == 3 ) {\n        return ACESFilmicToneMapping ( value );\n    } else {\n        return value;\n    }\n}\n\n");

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
        this.attributeLocations = new Map();

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
        this.depthTexture && this.depthTexture.dispose();
        this.depthBuffer && this.gl.deleteRenderbuffer(this.depthBuffer);
        this.stencilBuffer && this.gl.deleteRenderbuffer(this.stencilBuffer);
        this.depthStencilBuffer && this.gl.deleteRenderbuffer(this.depthStencilBuffer);
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
        this.isWebgl2 = !!this.gl;
        if (!this.gl) {
            /**
             * @type {OGLRenderingContext}
             */
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
            this.getExtension('WEBGL_color_buffer_float');
            this.getExtension('EXT_color_buffer_half_float');
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

    getRenderList({ scene, camera, frustumCull, sort }) {
        let renderList = Array.isArray(scene) ? [...scene] : this.sceneToRenderList(scene, frustumCull, camera);
        if (sort) renderList = this.sortRenderList(renderList, camera);
        return renderList;
    }

    sceneToRenderList(scene, frustumCull, camera) {
        if (camera && frustumCull) camera.updateFrustum();
        let renderList = [];
        // Get visible
        scene.traverse((node) => {
            if (!node.visible) return true;
            if (!node.draw) return;

            if (frustumCull && node.frustumCulled && camera) {
                if (!camera.frustumIntersectsMesh(node)) return;
            }

            renderList.push(node);
        });
        return renderList;
    }

    sortRenderList(renderList, camera, split = false) {
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

        return split ? {opaque, transparent, ui} : opaque.concat(transparent, ui);
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
        if (update && !Array.isArray(scene)) scene.updateMatrixWorld();

        // Update camera separately, in case not in scene graph
        if (camera) camera.updateMatrixWorld();

        // Get render list - entails culling and sorting
        const renderList = this.getRenderList({ scene, camera, frustumCull, sort, overrideProgram });

        renderList.forEach((node) => {
            this.renderNode(node, camera, overrideProgram);
        });
    }

    renderNode(node, camera, overrideProgram) {
        node.draw({camera, overrideProgram});
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






// Note: Use CustomPost, not this.
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
        } = {},
        fbo = null,
    ) {
        this.gl = gl;

        this.options = { wrapS, wrapT, minFilter, magFilter };

        this.passes = [];

        this.geometry = geometry;

        this.uniform = { value: null };
        this.targetOnly = targetOnly;

        this.fbo = fbo || {
            read: undefined,
            write: undefined,
            swap: () => {
                let temp = this.fbo.read;
                this.fbo.read = this.fbo.write;
                this.fbo.write = temp;
            },
        };

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
        this.disposeFbo();
        this.initFbo();
    }

    disposeFbo() {
        this.fbo.read && this.fbo.read.dispose();
        this.fbo.write && this.fbo.write.dispose();
        this.fbo.read = undefined;
        this.fbo.write = undefined;
    }
    initFbo() {
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
    renderWithFBO(renderer, fbo) {
        fbo.read && this.render(renderer, fbo.write, fbo.read);
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
    constructor(gl, options = {}, fbo) {
        super(gl, options, fbo);
        this.passes = [];
    }
    addPass(pass) {
        this.passes.push(pass);
        return pass;
    }
    render({ target = undefined, update = true, sort = true, frustumCull = true }) {
        const enabledPasses = this.passes.filter((pass) => pass.enabled);
        enabledPasses.forEach((pass, i) => {
            this._renderPass(pass);
            pass.needsSwap && this.fbo.swap();
        });
    }
    _renderPass(pass) {
        pass.renderWithFBO(this.gl.renderer, this.fbo);
    }
    resize({ width, height, dpr }) {
        super.resize({ width: width, height: height, dpr: dpr });
        this.passes.forEach((pass) => {
            pass.resize({ width, height, dpr });
        });
    }
}
exports.CustomPost = CustomPost;


/***/ }),

/***/ "./src/extras/RenderUtils.ts":
/*!***********************************!*\
  !*** ./src/extras/RenderUtils.ts ***!
  \***********************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Utils = void 0;
const ogl_1 = __webpack_require__(/*! ../ogl */ "./src/ogl.js");
class Utils {
    constructor(gl) {
        this.orthoScene_ = new ogl_1.Transform();
        this.gl = gl;
        this.copyprogram_ = new ogl_1.Program(gl, {
            vertex: Utils.copyVertex,
            fragment: Utils.copyFragment,
            uniforms: { tMap: { value: { texture: null } } },
            depthTest: false,
            depthWrite: false,
        });
        this.orthoCamera_ = new ogl_1.Camera(gl);
        this.orthoCamera_.orthographic({ near: 0, far: 10, left: -1, right: 1, bottom: -1, top: 1 });
        let plane = new ogl_1.Plane(gl, { width: 2, height: 2 });
        this.mesh_ = new ogl_1.Mesh(gl, { geometry: plane });
        this.mesh_.setParent(this.orthoScene_);
    }
    static getInstance(gl) {
        let ins = Utils.instanceMap_.get(gl.canvas.id);
        if (!ins)
            Utils.instanceMap_.set(gl.canvas.id, (ins = new Utils(gl)));
        return ins;
    }
    renderPass(renderer, program, target, clear) {
        this.mesh_.program = program;
        renderer.render({ scene: this.orthoScene_, camera: this.orthoCamera_, target, clear });
    }
    blit(renderer, source, target, clear) {
        this.copyprogram_.uniforms['tMap'].value = source.texture ? source.texture : source;
        this.renderPass(renderer, this.copyprogram_, target, clear);
        this.mesh_.program = this.copyprogram_;
    }
}
exports.Utils = Utils;
Utils.copyVertex = `
    attribute vec2 uv;
    attribute vec3 position;
    varying vec2 vUv;
    uniform mat4 modelMatrix;
    uniform mat4 projectionMatrix;

    void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelMatrix * vec4(position, 1);
    }
`;
Utils.copyFragment = `
    precision highp float;
    uniform sampler2D tMap;
    varying vec2 vUv;
    void main() {
        gl_FragColor = texture2D(tMap, vUv);
    }
`;
Utils.instanceMap_ = new Map();


/***/ }),

/***/ "./src/hdr/HDRComposer.ts":
/*!********************************!*\
  !*** ./src/hdr/HDRComposer.ts ***!
  \********************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.HDRComposer = exports.HDRFrame = exports.HDRHelper = exports.HDRToneMapPass = exports.HDRRenderPass = void 0;
const ogl_1 = __webpack_require__(/*! ../ogl */ "./src/ogl.js");
const RenderUtils_1 = __webpack_require__(/*! ../extras/RenderUtils */ "./src/extras/RenderUtils.ts");
const CustomPost_1 = __webpack_require__(/*! ../extras/CustomPost */ "./src/extras/CustomPost.ts");
const util_1 = __webpack_require__(/*! ../utils/util */ "./src/utils/util.ts");
class HDRRenderPass extends CustomPost_1.Pass {
    constructor(gl, scene, camera) {
        super();
        this.gl = gl;
        this._scene = scene;
        this._camera = camera;
        this.needsSwap = true;
        this.blendProgram = new ogl_1.Program(gl, { vertex: RenderUtils_1.Utils.copyVertex, fragment: `
            precision highp float;
            #define inputEncoding ${util_1.EncodingHelper.RGBM16}
            #define outputEncoding ${util_1.EncodingHelper.RGBM16}
            ${util_1.EncodingHelper.shaderChunk}
            uniform sampler2D tOpaque;
            uniform sampler2D tTransparent;
            varying vec2 vUv;
            void main() {
                vec3 opaque = inputTexelToLinear(texture2D(tOpaque, vUv)).rgb;
                vec4 transparent = texture2D(tTransparent, vUv);
                gl_FragColor = linearToOutputTexel(vec4(opaque * (1. - transparent.a) + transparent.rgb * transparent.a, 1.));
                // gl_FragColor = linearToOutputTexel(vec4(opaque, 1.));
            }
        `, uniforms: {
                tOpaque: { value: { texture: null } },
                tTransparent: { value: { texture: null } }
            },
            depthTest: false,
            depthWrite: false
        });
        this.blackProgram = new ogl_1.Program(gl, { vertex: RenderUtils_1.Utils.copyVertex, fragment: `
            precision highp float;
            varying vec2 vUv;
            void main() {
                gl_FragColor = vec4(0,0,0,0);
            }
        `, uniforms: {
                tOpaque: { value: { texture: null } },
                tTransparent: { value: { texture: null } }
            },
            depthTest: false,
            depthWrite: false
        });
    }
    get camera() {
        return this._camera;
    }
    get scene() {
        return this._scene;
    }
    renderWithFBO(renderer, fbo) {
        this._scene.updateMatrixWorld();
        renderer.gl.clearColor(0, 0, 0, 0);
        if (fbo.transparent && fbo.read) {
            if (!(fbo.transparent && fbo.read)) {
                return;
            }
            let renderList = renderer.sortRenderList(renderer.sceneToRenderList(this._scene, true, this._camera), this._camera, true);
            renderer.render({
                scene: renderList.opaque,
                camera: this._camera,
                target: fbo.read,
                sort: false,
                clear: false
            });
            this.gl.bindFramebuffer(fbo.transparent.target, fbo.transparent.buffer);
            if (fbo.read.depth && !fbo.read.stencil) {
                this.gl.framebufferRenderbuffer(fbo.transparent.target, this.gl.DEPTH_ATTACHMENT, this.gl.RENDERBUFFER, fbo.read.depthBuffer);
            }
            else if (fbo.read.stencil && !fbo.read.depth) {
                this.gl.framebufferRenderbuffer(fbo.transparent.target, this.gl.STENCIL_ATTACHMENT, this.gl.RENDERBUFFER, fbo.read.stencilBuffer);
            }
            else if (fbo.read.depth && fbo.read.stencil) {
                this.gl.framebufferRenderbuffer(fbo.transparent.target, this.gl.DEPTH_STENCIL_ATTACHMENT, this.gl.RENDERBUFFER, fbo.read.depthStencilBuffer);
            }
            fbo.transparent.depth = true;
            let oldClearColor = renderer.color;
            let oldClearDepth = renderer.depth;
            renderer.color = true;
            renderer.depth = false;
            //todo: check stencil
            renderer.render({
                scene: [...renderList.transparent, ...renderList.ui],
                camera: this._camera,
                target: fbo.transparent,
                sort: false,
                clear: true
            });
            this.blendProgram.uniforms.tOpaque.value = fbo.read.texture;
            this.blendProgram.uniforms.tTransparent.value = fbo.transparent.texture;
            RenderUtils_1.Utils.getInstance(renderer.gl).renderPass(renderer, this.blendProgram, fbo.write, true);
            renderer.color = oldClearColor;
            renderer.depth = oldClearDepth;
        }
        else {
            renderer.render({ scene: this._scene, camera: this._camera, target: fbo.read });
        }
    }
}
exports.HDRRenderPass = HDRRenderPass;
class HDRToneMapPass extends CustomPost_1.Pass {
    constructor(gl, hdr = true) {
        super();
        this.gl = gl;
        this.needsSwap = false;
        this.toneMapProgram = new ogl_1.Program(gl, { vertex: RenderUtils_1.Utils.copyVertex, fragment: `
            precision highp float;
            #define inputEncoding ${hdr ? util_1.EncodingHelper.RGBM16 : util_1.EncodingHelper.Linear}
            #define outputEncoding ${util_1.EncodingHelper.sRGB}
            #define tonemappingMode ${util_1.ToneMappingHelper.Linear}
            ${util_1.EncodingHelper.shaderChunk}
            ${util_1.ToneMappingHelper.shaderChunk}
            uniform sampler2D tMap;
            varying vec2 vUv;
            void main() {
                vec4 color = inputTexelToLinear(texture2D(tMap, vUv));
                color.rgb = toneMapColor(color.rgb);
                gl_FragColor = linearToOutputTexel(color);
            }
        `, uniforms: Object.assign({ tMap: { value: { texture: null } } }, util_1.ToneMappingHelper.uniforms //todo: uniform utils clone.
            ), depthTest: false,
            depthWrite: false });
    }
    renderWithFBO(renderer, fbo) {
        var _a;
        this.toneMapProgram.uniforms['tMap'].value = (_a = fbo.read) === null || _a === void 0 ? void 0 : _a.texture;
        RenderUtils_1.Utils.getInstance(renderer.gl).renderPass(renderer, this.toneMapProgram, this.renderToScreen ? undefined : fbo.write, true);
    }
    resize({ width, height, dpr }) {
    }
}
exports.HDRToneMapPass = HDRToneMapPass;
class HDRHelper {
    constructor(gl) {
        this.floatingSupportExt = {
            texture: 'OES_texture_float',
            linear: 'OES_texture_float_linear',
            color: 'WEBGL_color_buffer_float',
            h_texture: 'OES_texture_half_float',
            h_linear: 'OES_texture_half_float_linear',
            h_color: 'EXT_color_buffer_half_float',
        };
        this._floatingSupport = {
            texture: false,
            linear: false,
            color: false,
            h_texture: false,
            h_linear: false,
            h_color: false,
        };
        this.gl = gl;
        this.initFloatSupport();
    }
    get halfFloatType() {
        return this.floatingSupport.h_color ? this.floatingSupport.h_texture.HALF_FLOAT_OES : this.floatType;
    }
    ;
    get floatType() {
        return (this.floatingSupport.color ? this.gl.FLOAT : this.gl.UNSIGNED_BYTE);
    }
    ;
    get intType() {
        return this.gl.UNSIGNED_BYTE;
    }
    ;
    get canFloatDraw() {
        return this.floatingSupport.h_color || this.floatingSupport.color;
    }
    ;
    initFloatSupport() {
        let ext = this.gl.getExtension(this.floatingSupportExt.texture);
        if (ext) {
            this._floatingSupport.texture = true;
            this._floatingSupport.color = this.gl.getExtension(this.floatingSupportExt.color); // todo check by drawing
            this._floatingSupport.linear = this.gl.getExtension(this.floatingSupportExt.linear);
        }
        ext = this.gl.getExtension(this.floatingSupportExt.h_texture);
        if (ext) {
            this._floatingSupport.h_texture = ext;
            this._floatingSupport.h_color = this.gl.getExtension(this.floatingSupportExt.h_color);
            this._floatingSupport.h_linear = this.gl.getExtension(this.floatingSupportExt.h_linear);
        }
    }
    get floatingSupport() {
        return Object.assign({}, this._floatingSupport);
    }
}
exports.HDRHelper = HDRHelper;
class HDRFrame {
    constructor(gl, helper) {
        this.gl = gl;
        this.helper = helper;
    }
    swap() {
        let t = this.read;
        this.read = this.write;
        this.write = t;
    }
    create(options) {
        this.read = new ogl_1.RenderTarget(this.gl, options);
        this.write = new ogl_1.RenderTarget(this.gl, options);
        this.transparent = new ogl_1.RenderTarget(this.gl, Object.assign(Object.assign({}, options), { type: this.helper.halfFloatType, format: this.gl.RGBA, depth: false, internalFormat: (this.helper.canFloatDraw && this.gl.renderer.isWebgl2) ? this.gl.RGBA32F : this.gl.RGBA }));
    }
    dispose() {
        this.read && this.read.dispose();
        this.write && this.write.dispose();
        this.transparent && this.transparent.dispose();
        this.read = undefined;
        this.write = undefined;
        this.transparent = undefined;
    }
}
exports.HDRFrame = HDRFrame;
class HDRComposer extends CustomPost_1.CustomPost {
    constructor(gl, options) {
        super(gl, options, new HDRFrame(gl, new HDRHelper(gl)));
    }
    disposeFbo() {
        this.fbo.dispose();
    }
    initFbo() {
        this.fbo.create(this.options);
    }
}
exports.HDRComposer = HDRComposer;


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
__exportStar(__webpack_require__(/*! ./extras/RenderUtils */ "./src/extras/RenderUtils.ts"), exports);
__exportStar(__webpack_require__(/*! ./hdr/HDRComposer */ "./src/hdr/HDRComposer.ts"), exports);


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
const pbr_vert_1 = __importDefault(__webpack_require__(/*! ./shaders/pbr.vert */ "./src/materials/shaders/pbr.vert"));
const pbr_frag_1 = __importDefault(__webpack_require__(/*! ./shaders/pbr.frag */ "./src/materials/shaders/pbr.frag"));
const programcache_1 = __webpack_require__(/*! ../utils/programcache */ "./src/utils/programcache.ts");
const ogl_1 = __webpack_require__(/*! ../ogl */ "./src/ogl.js");
const util_1 = __webpack_require__(/*! ../utils/util */ "./src/utils/util.ts");
class PBRMaterial {
    constructor(gl, pbrparams, defines, uniforms, shaders, hdr = true) {
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
        let pbrVert = (_a = shaders === null || shaders === void 0 ? void 0 : shaders.vert) !== null && _a !== void 0 ? _a : PBRMaterial.defaultVertex;
        let pbrFrag = (_b = shaders === null || shaders === void 0 ? void 0 : shaders.frag) !== null && _b !== void 0 ? _b : PBRMaterial.defaultFragment;
        this.color_ = (pbrparams === null || pbrparams === void 0 ? void 0 : pbrparams.baseColorFactor) !== undefined ? new ogl_1.Vec4().copy(pbrparams.baseColorFactor) : new ogl_1.Vec4(1, 1, 1, 1);
        this.roughness = (pbrparams === null || pbrparams === void 0 ? void 0 : pbrparams.roughness) !== undefined ? pbrparams.roughness : 0;
        this.metalness = (pbrparams === null || pbrparams === void 0 ? void 0 : pbrparams.metalness) !== undefined ? pbrparams.metalness : 0;
        this.envMapIntensity = (pbrparams === null || pbrparams === void 0 ? void 0 : pbrparams.envMapIntensity) !== undefined ? pbrparams === null || pbrparams === void 0 ? void 0 : pbrparams.envMapIntensity : 1;
        this.uniforms_ = Object.assign({ uBaseColorFactor: { value: new ogl_1.Vec4().copy(this.color_) }, tBaseColor: { value: (pbrparams === null || pbrparams === void 0 ? void 0 : pbrparams.baseColorTexture) ? pbrparams === null || pbrparams === void 0 ? void 0 : pbrparams.baseColorTexture.texture : null }, uRoughness: { value: (pbrparams === null || pbrparams === void 0 ? void 0 : pbrparams.roughness) !== undefined ? pbrparams === null || pbrparams === void 0 ? void 0 : pbrparams.roughness : 1 }, uMetallic: { value: (pbrparams === null || pbrparams === void 0 ? void 0 : pbrparams.metalness) !== undefined ? pbrparams === null || pbrparams === void 0 ? void 0 : pbrparams.metalness : 1 }, tNormal: { value: { texture: null } }, uNormalScale: { value: (pbrparams === null || pbrparams === void 0 ? void 0 : pbrparams.normalScale) || 1 }, tOcclusion: { value: { texture: null } }, tEmissive: { value: { texture: null } }, uEmissive: { value: (pbrparams === null || pbrparams === void 0 ? void 0 : pbrparams.emissive) || [0, 0, 0] }, tLUT: { value: PBRMaterial.lutTextureMap.get(gl.canvas.id) }, tEnvDiffuse: { value: { texture: null } }, tEnvSpecular: { value: { texture: null } }, uEnvDiffuse: { value: 0.5 }, uEnvSpecular: { value: 0.5 }, uEnvMapIntensity: { value: 1 }, uAlpha: { value: pbrparams === null || pbrparams === void 0 ? void 0 : pbrparams.alpha }, uAlphaCutoff: { value: pbrparams === null || pbrparams === void 0 ? void 0 : pbrparams.alphaCutoff }, uTransparent: { value: pbrparams === null || pbrparams === void 0 ? void 0 : pbrparams.transparent } }, (uniforms !== null && uniforms !== void 0 ? uniforms : {}));
        defines = defines ? defines : ``;
        this.program_ = this.createProgram_(defines, pbrVert, pbrFrag, hdr);
    }
    makeFragmentShader(frag, hdr = true) {
        return `
precision highp float;
precision highp int;
#define inputEncoding ${hdr ? util_1.EncodingHelper.RGBM16 : util_1.EncodingHelper.Linear}
#define outputEncoding ${hdr ? util_1.EncodingHelper.RGBM16 : util_1.EncodingHelper.Linear}
${util_1.EncodingHelper.shaderChunk}
${frag}
`;
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
    createProgram_(defines, vertex, fragment, hdr = true) {
        vertex = vertex !== null && vertex !== void 0 ? vertex : PBRMaterial.defaultVertex;
        fragment = this.makeFragmentShader(fragment !== null && fragment !== void 0 ? fragment : PBRMaterial.defaultFragment, hdr);
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
PBRMaterial.defaultFragment = `${pbr_frag_1.default}`;
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
function assignPBRMaterials(gl, root, materialCtor, hdr = true) {
    root.traverse((node) => {
        var _a, _b, _c, _d;
        if (node instanceof ogl_1.Mesh && node.program && !((_b = (_a = node) === null || _a === void 0 ? void 0 : _a.material) === null || _b === void 0 ? void 0 : _b.isDiamondMaterial) && node.program.gltfMaterial) { //todo: isDiamondMaterial on node??
            let defines = `${node.geometry.attributes.uv ? `#define UV\n` : ``}`;
            let material = materialCtor ?
                materialCtor(gl, getPBRParams(node.program.gltfMaterial), defines) :
                new pbrmaterial_1.PBRMaterial(gl, getPBRParams(node.program.gltfMaterial), defines, undefined, undefined, hdr);
            node.material = material;
            node.program = material.program;
            node.onBeforeRender((value) => {
                updateUniforms_(node.material);
            });
        }
        if ((_d = (_c = node) === null || _c === void 0 ? void 0 : _c.material) === null || _d === void 0 ? void 0 : _d.isDiamondMaterial) {
            node.program.transparent = true;
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
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ToneMappingHelper = exports.EncodingHelper = exports.traverseMeshes = exports.traverse = exports.computeBoundingBox = exports.getAllMeshes = exports.getPointerPosition = exports.getSnapshot = exports.getSnapshotData = void 0;
const ogl_1 = __webpack_require__(/*! ../ogl */ "./src/ogl.js");
const encoding_par_glsl_1 = __importDefault(__webpack_require__(/*! ../shaders/encoding_par.glsl */ "./src/shaders/encoding_par.glsl"));
const tonemapping_par_glsl_1 = __importDefault(__webpack_require__(/*! ../shaders/tonemapping_par.glsl */ "./src/shaders/tonemapping_par.glsl"));
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
exports.EncodingHelper = {
    Linear: 0,
    sRGB: 1,
    RGBE: 2,
    RGBM7: 3,
    RGBM16: 4,
    RGBD: 5,
    Gamma: 6,
    shaderChunk: encoding_par_glsl_1.default
};
exports.ToneMappingHelper = {
    Linear: 0,
    Reinhard: 1,
    Cineon: 2,
    ACESFilmic: 3,
    uniforms: {
        toneMappingExposure: { value: 1. }
    },
    shaderChunk: tonemapping_par_glsl_1.default
};


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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9vZ2wvd2VicGFjay91bml2ZXJzYWxNb2R1bGVEZWZpbml0aW9uIiwid2VicGFjazovL29nbC8uL3NyYy9tYXRlcmlhbHMvc2hhZGVycy9wYnIuZnJhZyIsIndlYnBhY2s6Ly9vZ2wvLi9zcmMvbWF0ZXJpYWxzL3NoYWRlcnMvcGJyLnZlcnQiLCJ3ZWJwYWNrOi8vb2dsLy4vc3JjL3NoYWRlcnMvZW5jb2RpbmdfcGFyLmdsc2wiLCJ3ZWJwYWNrOi8vb2dsLy4vc3JjL3NoYWRlcnMvdG9uZW1hcHBpbmdfcGFyLmdsc2wiLCJ3ZWJwYWNrOi8vb2dsLy4vc3JjL2NvcmUvQ2FtZXJhLmpzIiwid2VicGFjazovL29nbC8uL3NyYy9jb3JlL0dlb21ldHJ5LmpzIiwid2VicGFjazovL29nbC8uL3NyYy9jb3JlL01lc2guanMiLCJ3ZWJwYWNrOi8vb2dsLy4vc3JjL2NvcmUvUHJvZ3JhbS5qcyIsIndlYnBhY2s6Ly9vZ2wvLi9zcmMvY29yZS9SZW5kZXJUYXJnZXQuanMiLCJ3ZWJwYWNrOi8vb2dsLy4vc3JjL2NvcmUvUmVuZGVyZXIuanMiLCJ3ZWJwYWNrOi8vb2dsLy4vc3JjL2NvcmUvVGV4dHVyZS5qcyIsIndlYnBhY2s6Ly9vZ2wvLi9zcmMvY29yZS9UcmFuc2Zvcm0uanMiLCJ3ZWJwYWNrOi8vb2dsLy4vc3JjL2V4dHJhcy9BbmltYXRpb24uanMiLCJ3ZWJwYWNrOi8vb2dsLy4vc3JjL2V4dHJhcy9Cb3guanMiLCJ3ZWJwYWNrOi8vb2dsLy4vc3JjL2V4dHJhcy9DdXJ2ZS5qcyIsIndlYnBhY2s6Ly9vZ2wvLi9zcmMvZXh0cmFzL0N5bGluZGVyLmpzIiwid2VicGFjazovL29nbC8uL3NyYy9leHRyYXMvRmxvd21hcC5qcyIsIndlYnBhY2s6Ly9vZ2wvLi9zcmMvZXh0cmFzL0dMVEZBbmltYXRpb24uanMiLCJ3ZWJwYWNrOi8vb2dsLy4vc3JjL2V4dHJhcy9HTFRGTG9hZGVyLmpzIiwid2VicGFjazovL29nbC8uL3NyYy9leHRyYXMvR0xURlNraW4uanMiLCJ3ZWJwYWNrOi8vb2dsLy4vc3JjL2V4dHJhcy9HUEdQVS5qcyIsIndlYnBhY2s6Ly9vZ2wvLi9zcmMvZXh0cmFzL0tUWFRleHR1cmUuanMiLCJ3ZWJwYWNrOi8vb2dsLy4vc3JjL2V4dHJhcy9Ob3JtYWxQcm9ncmFtLmpzIiwid2VicGFjazovL29nbC8uL3NyYy9leHRyYXMvT3JiaXQuanMiLCJ3ZWJwYWNrOi8vb2dsLy4vc3JjL2V4dHJhcy9QbGFuZS5qcyIsIndlYnBhY2s6Ly9vZ2wvLi9zcmMvZXh0cmFzL1BvbHlsaW5lLmpzIiwid2VicGFjazovL29nbC8uL3NyYy9leHRyYXMvUG9zdC5qcyIsIndlYnBhY2s6Ly9vZ2wvLi9zcmMvZXh0cmFzL1JheWNhc3QuanMiLCJ3ZWJwYWNrOi8vb2dsLy4vc3JjL2V4dHJhcy9TaGFkb3cuanMiLCJ3ZWJwYWNrOi8vb2dsLy4vc3JjL2V4dHJhcy9Ta2luLmpzIiwid2VicGFjazovL29nbC8uL3NyYy9leHRyYXMvU3BoZXJlLmpzIiwid2VicGFjazovL29nbC8uL3NyYy9leHRyYXMvVGV4dC5qcyIsIndlYnBhY2s6Ly9vZ2wvLi9zcmMvZXh0cmFzL1RleHR1cmVMb2FkZXIuanMiLCJ3ZWJwYWNrOi8vb2dsLy4vc3JjL2V4dHJhcy9Ub3J1cy5qcyIsIndlYnBhY2s6Ly9vZ2wvLi9zcmMvZXh0cmFzL1RyaWFuZ2xlLmpzIiwid2VicGFjazovL29nbC8uL3NyYy9tYXRoL0NvbG9yLmpzIiwid2VicGFjazovL29nbC8uL3NyYy9tYXRoL0V1bGVyLmpzIiwid2VicGFjazovL29nbC8uL3NyYy9tYXRoL01hdDMuanMiLCJ3ZWJwYWNrOi8vb2dsLy4vc3JjL21hdGgvTWF0NC5qcyIsIndlYnBhY2s6Ly9vZ2wvLi9zcmMvbWF0aC9RdWF0LmpzIiwid2VicGFjazovL29nbC8uL3NyYy9tYXRoL1ZlYzIuanMiLCJ3ZWJwYWNrOi8vb2dsLy4vc3JjL21hdGgvVmVjMy5qcyIsIndlYnBhY2s6Ly9vZ2wvLi9zcmMvbWF0aC9WZWM0LmpzIiwid2VicGFjazovL29nbC8uL3NyYy9tYXRoL2Z1bmN0aW9ucy9Db2xvckZ1bmMuanMiLCJ3ZWJwYWNrOi8vb2dsLy4vc3JjL21hdGgvZnVuY3Rpb25zL0V1bGVyRnVuYy5qcyIsIndlYnBhY2s6Ly9vZ2wvLi9zcmMvbWF0aC9mdW5jdGlvbnMvTWF0M0Z1bmMuanMiLCJ3ZWJwYWNrOi8vb2dsLy4vc3JjL21hdGgvZnVuY3Rpb25zL01hdDRGdW5jLmpzIiwid2VicGFjazovL29nbC8uL3NyYy9tYXRoL2Z1bmN0aW9ucy9RdWF0RnVuYy5qcyIsIndlYnBhY2s6Ly9vZ2wvLi9zcmMvbWF0aC9mdW5jdGlvbnMvVmVjMkZ1bmMuanMiLCJ3ZWJwYWNrOi8vb2dsLy4vc3JjL21hdGgvZnVuY3Rpb25zL1ZlYzNGdW5jLmpzIiwid2VicGFjazovL29nbC8uL3NyYy9tYXRoL2Z1bmN0aW9ucy9WZWM0RnVuYy5qcyIsIndlYnBhY2s6Ly9vZ2wvLi9zcmMvb2dsLmpzIiwid2VicGFjazovL29nbC8uL3NyYy9leHRyYXMvQ3VzdG9tUG9zdC50cyIsIndlYnBhY2s6Ly9vZ2wvLi9zcmMvZXh0cmFzL1JlbmRlclV0aWxzLnRzIiwid2VicGFjazovL29nbC8uL3NyYy9oZHIvSERSQ29tcG9zZXIudHMiLCJ3ZWJwYWNrOi8vb2dsLy4vc3JjL2luZGV4LnRzIiwid2VicGFjazovL29nbC8uL3NyYy9tYXRlcmlhbHMvcGJybWF0ZXJpYWwudHMiLCJ3ZWJwYWNrOi8vb2dsLy4vc3JjL3V0aWxzL2V2ZW50ZGlzcGF0Y2hlci50cyIsIndlYnBhY2s6Ly9vZ2wvLi9zcmMvdXRpbHMvcGJyaGVscGVyLnRzIiwid2VicGFjazovL29nbC8uL3NyYy91dGlscy9wcm9ncmFtY2FjaGUudHMiLCJ3ZWJwYWNrOi8vb2dsLy4vc3JjL3V0aWxzL3VuaWZvcm1VdGlscy50cyIsIndlYnBhY2s6Ly9vZ2wvLi9zcmMvdXRpbHMvdXRpbC50cyIsIndlYnBhY2s6Ly9vZ2wvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vb2dsL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly9vZ2wvd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly9vZ2wvd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly9vZ2wvd2VicGFjay9zdGFydHVwIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUM7QUFDRCxPOzs7Ozs7Ozs7Ozs7OztBQ1ZBLGlFQUFlLHlCQUF5Qiw0QkFBNEIsOEJBQThCLGdDQUFnQywrQkFBK0Isd0JBQXdCLDJCQUEyQiwwQkFBMEIsNEJBQTRCLDZCQUE2Qiw4QkFBOEIseUJBQXlCLCtCQUErQix5QkFBeUIsZ0NBQWdDLGlDQUFpQyw0QkFBNEIsNkJBQTZCLGlDQUFpQyx1QkFBdUIsNkJBQTZCLDRCQUE0QixtQkFBbUIsdUJBQXVCLHFCQUFxQixzQkFBc0IsbUNBQW1DLDRDQUE0QywwQ0FBMEMsOEJBQThCLDZCQUE2QixnQ0FBZ0MsMkNBQTJDLGlDQUFpQyxHQUFHLG9DQUFvQyx5QkFBeUIscURBQXFELEdBQUcsaUNBQWlDLHVDQUF1QyxHQUFHLG9CQUFvQiwyREFBMkQsb0NBQW9DLDhCQUE4Qiw4QkFBOEIsMkZBQTJGLGlFQUFpRSxnREFBZ0QsdURBQXVELDJCQUEyQix1Q0FBdUMsa0lBQWtJLCtCQUErQix5Q0FBeUMsYUFBYSxtQ0FBbUMsWUFBWSxpREFBaUQsMkNBQTJDLGNBQWMsR0FBRyxrS0FBa0ssd0VBQXdFLHNGQUFzRiwyREFBMkQseUdBQXlHLGdDQUFnQywrQ0FBK0Msb0JBQW9CLDRIQUE0SCxvQkFBb0Isc0JBQXNCLHNCQUFzQiw0QkFBNEIsc0NBQXNDLDRCQUE0QixzQ0FBc0Msb0VBQW9FLG9FQUFvRSwwREFBMEQsMENBQTBDLG1IQUFtSCxnRkFBZ0YsNkJBQTZCLEdBQUcsaUJBQWlCLHNDQUFzQyxnRkFBZ0YsNkRBQTZELDZEQUE2RCww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QUs7QUFDViw0QkFBNEI7QUFDNUI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHNCQUFzQjtBQUN0QjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLGdDQUFnQztBQUNoQyxvQ0FBb0M7QUFDcEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLCtCQUErQjtBQUMvQjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxxQkFBcUIsOENBQThDLEtBQUs7QUFDeEU7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FB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QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQSw0QkFBNEIsK0NBQUk7QUFDaEMseUJBQXlCLCtDQUFJO0FBQzdCLDJCQUEyQiwrQ0FBSTs7QUFFL0I7QUFDQSx5QkFBeUI7O0FBRXpCO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFD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QUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsS0FBSztBQUNoQixhQUFhLE9BQU87QUFDcEI7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsV0FBVyxLQUFLO0FBQ2hCLFdBQVcsS0FBSztBQUNoQixXQUFXLEtBQUs7QUFDaEIsYUFBYSxLQUFLO0FBQ2xCO0FBQ087QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsS0FBSztBQUNoQixXQUFXLEtBQUs7QUFDaEIsV0FBVyxLQUFLO0FBQ2hCLGFBQWEsS0FBSztBQUNsQjtBQUNPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsV0FBVyxLQUFLO0FBQ2hCLFdBQVcsS0FBSztBQUNoQixXQUFXLEtBQUs7QUFDaEIsYUFBYSxLQUFLO0FBQ2xCO0FBQ087QUFDUDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsS0FBSztBQUNoQixXQUFXLEtBQUs7QUFDaEIsV0FBVyxPQUFPO0FBQ2xCLFdBQVcsS0FBSztBQUNoQixhQUFhLEtBQUs7QUFDbEI7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZLEtBQUs7QUFDakIsWUFBWSxLQUFLO0FBQ2pCLFlBQVksS0FBSztBQUNqQjtBQUNPO0FBQ1A7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWSxLQUFLO0FBQ2pCLFlBQVksS0FBSztBQUNqQixZQUFZLEtBQUs7QUFDakI7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVyxLQUFLO0FBQ2hCLFdBQVcsS0FBSztBQUNoQixZQUFZLEtBQUs7QUFDakI7QUFDTztBQUNQOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLENBQUM7O0FBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsS0FBSztBQUNoQixXQUFXLE1BQU07QUFDakIsV0FBVyxLQUFLO0FBQ2hCLFdBQVcsS0FBSztBQUNoQixhQUFhLEtBQUs7QUFDbEI7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFD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QTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLEtBQUs7QUFDaEIsV0FBVyxLQUFLO0FBQ2hCLFdBQVcsT0FBTztBQUNsQixhQUFhLEtBQUs7QUFDbEI7QUFDTztBQUNQOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsV0FBVyxLQUFLO0FBQ2hCLFdBQVcsS0FBSztBQUNoQixXQUFXLEtBQUs7QUFDaEIsV0FBVyxPQUFPO0FBQ2xCLGFBQWEsS0FBSztBQUNsQjtBQUNPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsS0FBSztBQUNoQixXQUFXLEtBQUs7QUFDaEIsYUFBYSxLQUFLO0FBQ2xCO0FBQ087QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVyxLQUFLO0FBQ2hCLFdBQVcsS0FBSztBQUNoQixhQUFhLEtBQUs7QUFDbEI7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLEtBQUs7QUFDaEIsV0FBVyxLQUFLO0FBQ2hCLGFBQWEsS0FBSztBQUNsQjtBQUNBO0FBQ087QUFDUDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0Esd0NBQXdD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QUNBO1VBQ0E7VUFDQSIsImZpbGUiOiJpbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiB3ZWJwYWNrVW5pdmVyc2FsTW9kdWxlRGVmaW5pdGlvbihyb290LCBmYWN0b3J5KSB7XG5cdGlmKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlID09PSAnb2JqZWN0Jylcblx0XHRtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKTtcblx0ZWxzZSBpZih0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpXG5cdFx0ZGVmaW5lKFtdLCBmYWN0b3J5KTtcblx0ZWxzZSBpZih0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpXG5cdFx0ZXhwb3J0c1tcIm9nbFwiXSA9IGZhY3RvcnkoKTtcblx0ZWxzZVxuXHRcdHJvb3RbXCJvZ2xcIl0gPSBmYWN0b3J5KCk7XG59KShzZWxmLCBmdW5jdGlvbigpIHtcbnJldHVybiAiLCJleHBvcnQgZGVmYXVsdCBcInVuaWZvcm0gbWF0NCB2aWV3TWF0cml4O1xcbnVuaWZvcm0gbWF0MyBub3JtYWxNYXRyaXg7XFxudW5pZm9ybSB2ZWMzIGNhbWVyYVBvc2l0aW9uO1xcbnVuaWZvcm0gdmVjNCB1QmFzZUNvbG9yRmFjdG9yO1xcbnVuaWZvcm0gc2FtcGxlcjJEIHRCYXNlQ29sb3I7XFxudW5pZm9ybSBzYW1wbGVyMkQgdFJNO1xcbnVuaWZvcm0gZmxvYXQgdVJvdWdobmVzcztcXG51bmlmb3JtIGZsb2F0IHVNZXRhbGxpYztcXG51bmlmb3JtIHNhbXBsZXIyRCB0Tm9ybWFsO1xcbnVuaWZvcm0gZmxvYXQgdU5vcm1hbFNjYWxlO1xcbnVuaWZvcm0gc2FtcGxlcjJEIHRFbWlzc2l2ZTtcXG51bmlmb3JtIHZlYzMgdUVtaXNzaXZlO1xcbnVuaWZvcm0gc2FtcGxlcjJEIHRPY2NsdXNpb247XFxudW5pZm9ybSBzYW1wbGVyMkQgdExVVDtcXG51bmlmb3JtIHNhbXBsZXIyRCB0RW52RGlmZnVzZTtcXG51bmlmb3JtIHNhbXBsZXIyRCB0RW52U3BlY3VsYXI7XFxudW5pZm9ybSBmbG9hdCB1RW52RGlmZnVzZTtcXG51bmlmb3JtIGZsb2F0IHVFbnZTcGVjdWxhcjtcXG51bmlmb3JtIGZsb2F0IHVFbnZNYXBJbnRlbnNpdHk7XFxudW5pZm9ybSBmbG9hdCB1QWxwaGE7XFxudW5pZm9ybSBmbG9hdCB1QWxwaGFDdXRvZmY7XFxudW5pZm9ybSBib29sIHVUcmFuc3BhcmVudDtcXG52YXJ5aW5nIHZlYzIgdlV2O1xcbnZhcnlpbmcgdmVjMyB2Tm9ybWFsO1xcbnZhcnlpbmcgdmVjMyB2TVBvcztcXG52YXJ5aW5nIHZlYzQgdk1WUG9zO1xcblxcbmNvbnN0IGZsb2F0IFBJID0gMy4xNDE1OTI2NTM1OTtcXG5jb25zdCBmbG9hdCBSRUNJUFJPQ0FMX1BJID0gMC4zMTgzMDk4ODYxODtcXG5jb25zdCBmbG9hdCBSRUNJUFJPQ0FMX1BJMiA9IDAuMTU5MTU0OTQ7XFxuY29uc3QgZmxvYXQgTE4yID0gMC42OTMxNDcyO1xcbmNvbnN0IGZsb2F0IEVOVl9MT0RTID0gNi4wO1xcbnZlYzQgU1JHQnRvTGluZWFyKHZlYzQgc3JnYikge1xcbiAgdmVjMyBsaW5PdXQgPSBwb3coc3JnYi54eXosIHZlYzMoMi4yKSk7XFxuICByZXR1cm4gdmVjNChsaW5PdXQsIHNyZ2Iudyk7O1xcbn1cXG52ZWM0IFJHQk1Ub0xpbmVhcihpbiB2ZWM0IHZhbHVlKSB7XFxuICBmbG9hdCBtYXhSYW5nZSA9IDYuMDtcXG4gIHJldHVybiB2ZWM0KHZhbHVlLnh5eiAqIHZhbHVlLncgKiBtYXhSYW5nZSwgMS4wKTtcXG59XFxudmVjMyBsaW5lYXJUb1NSR0IodmVjMyBjb2xvcikge1xcbiAgcmV0dXJuIHBvdyhjb2xvciwgdmVjMygxLjAgLyAyLjIpKTtcXG59XFxudmVjMyBnZXROb3JtYWwoKSB7XFxuICAjaWZkZWYgTk9STUFMX01BUCAgXFxuICAgIHZlYzMgcG9zX2R4ID0gZEZkeCh2TVBvcy54eXopO1xcbiAgICB2ZWMzIHBvc19keSA9IGRGZHkodk1Qb3MueHl6KTtcXG4gICAgdmVjMiB0ZXhfZHggPSBkRmR4KHZVdik7XFxuICAgIHZlYzIgdGV4X2R5ID0gZEZkeSh2VXYpO1xcbiAgICAvLyBUYW5nZW50LCBCaXRhbmdlbnRcXG4gICAgdmVjMyB0ID0gbm9ybWFsaXplKHBvc19keCAqIHRleF9keS50IC0gcG9zX2R5ICogdGV4X2R4LnQpO1xcbiAgICB2ZWMzIGIgPSBub3JtYWxpemUoLXBvc19keCAqIHRleF9keS5zICsgcG9zX2R5ICogdGV4X2R4LnMpO1xcbiAgICBtYXQzIHRibiA9IG1hdDModCwgYiwgbm9ybWFsaXplKHZOb3JtYWwpKTtcXG4gICAgdmVjMyBuID0gdGV4dHVyZTJEKHROb3JtYWwsIHZVdikucmdiICogMi4wIC0gMS4wO1xcbiAgICBuLnh5ICo9IHVOb3JtYWxTY2FsZTtcXG4gICAgdmVjMyBub3JtYWwgPSBub3JtYWxpemUodGJuICogbik7XFxuICAgIC8vIEdldCB3b3JsZCBub3JtYWwgZnJvbSB2aWV3IG5vcm1hbCAobm9ybWFsTWF0cml4ICogbm9ybWFsKVxcbiAgICAvLyByZXR1cm4gbm9ybWFsaXplKCh2ZWM0KG5vcm1hbCwgMC4wKSAqIHZpZXdNYXRyaXgpLnh5eik7XFxuICAgIHJldHVybiBub3JtYWxpemUobm9ybWFsKTtcXG4gICNlbHNlXFxuICAgIHJldHVybiBub3JtYWxpemUodk5vcm1hbCk7XFxuICAjZW5kaWZcXG59XFxuXFxudmVjMiBjYXJ0ZXNpYW5Ub1BvbGFyKHZlYzMgbikge1xcbiAgdmVjMiB1djtcXG4gIHV2LnggPSBhdGFuKG4ueiwgbi54KSAqIFJFQ0lQUk9DQUxfUEkyICsgMC41O1xcbiAgdXYueSA9IGFzaW4obi55KSAqIFJFQ0lQUk9DQUxfUEkgKyAwLjU7XFxuICByZXR1cm4gdXY7XFxufVxcblxcbnZvaWQgZ2V0SUJMQ29udHJpYnV0aW9uKGlub3V0IHZlYzMgZGlmZnVzZSwgaW5vdXQgdmVjMyBzcGVjdWxhciwgZmxvYXQgTmRWLCBmbG9hdCByb3VnaG5lc3MsIHZlYzMgbiwgdmVjMyByZWZsZWN0aW9uLCB2ZWMzIGRpZmZ1c2VDb2xvciwgdmVjMyBzcGVjdWxhckNvbG9yKSB7XFxuICB2ZWMzIGJyZGYgPSBTUkdCdG9MaW5lYXIodGV4dHVyZTJEKHRMVVQsIHZlYzIoTmRWLCByb3VnaG5lc3MpKSkucmdiO1xcbiAgdmVjMyBkaWZmdXNlTGlnaHQgPSBSR0JNVG9MaW5lYXIodGV4dHVyZTJEKHRFbnZEaWZmdXNlLCBjYXJ0ZXNpYW5Ub1BvbGFyKG4pKSkucmdiO1xcbiAgZGlmZnVzZUxpZ2h0ID0gbWl4KHZlYzMoMSksIGRpZmZ1c2VMaWdodCwgdUVudkRpZmZ1c2UpO1xcbiAgLy8gU2FtcGxlIDIgbGV2ZWxzIGFuZCBtaXggYmV0d2VlbiB0byBnZXQgc21vb3RoZXIgZGVncmFkYXRpb25cXG4gIGZsb2F0IGJsZW5kID0gcm91Z2huZXNzICogRU5WX0xPRFM7XFxuICBmbG9hdCBsZXZlbDAgPSBmbG9vcihibGVuZCk7XFxuICBmbG9hdCBsZXZlbDEgPSBtaW4oRU5WX0xPRFMsIGxldmVsMCArIDEuMCk7XFxuICBibGVuZCAtPSBsZXZlbDA7XFxuICBcXG4gIC8vIFNhbXBsZSB0aGUgc3BlY3VsYXIgZW52IG1hcCBhdGxhcyBkZXBlbmRpbmcgb24gdGhlIHJvdWdobmVzcyB2YWx1ZVxcbiAgdmVjMiB1dlNwZWMgPSBjYXJ0ZXNpYW5Ub1BvbGFyKHJlZmxlY3Rpb24pO1xcbiAgdXZTcGVjLnkgLz0gMi4wO1xcbiAgdmVjMiB1djAgPSB1dlNwZWM7XFxuICB2ZWMyIHV2MSA9IHV2U3BlYztcXG4gIHV2MCAvPSBwb3coMi4wLCBsZXZlbDApO1xcbiAgdXYwLnkgKz0gMS4wIC0gZXhwKC1MTjIgKiBsZXZlbDApO1xcbiAgdXYxIC89IHBvdygyLjAsIGxldmVsMSk7XFxuICB1djEueSArPSAxLjAgLSBleHAoLUxOMiAqIGxldmVsMSk7XFxuICB2ZWMzIHNwZWN1bGFyMCA9IFJHQk1Ub0xpbmVhcih0ZXh0dXJlMkQodEVudlNwZWN1bGFyLCB1djApKS5yZ2I7XFxuICB2ZWMzIHNwZWN1bGFyMSA9IFJHQk1Ub0xpbmVhcih0ZXh0dXJlMkQodEVudlNwZWN1bGFyLCB1djEpKS5yZ2I7XFxuICB2ZWMzIHNwZWN1bGFyTGlnaHQgPSBtaXgoc3BlY3VsYXIwLCBzcGVjdWxhcjEsIGJsZW5kKTtcXG4gIGRpZmZ1c2UgPSBkaWZmdXNlTGlnaHQgKiBkaWZmdXNlQ29sb3I7XFxuICBcXG4gIC8vIEJpdCBvZiBleHRyYSByZWZsZWN0aW9uIGZvciBzbW9vdGggbWF0ZXJpYWxzXFxuICBmbG9hdCByZWZsZWN0aXZpdHkgPSBwb3coKDEuMCAtIHJvdWdobmVzcyksIDIuMCkgKiAwLjA1O1xcbiAgc3BlY3VsYXIgPSBzcGVjdWxhckxpZ2h0ICogKHNwZWN1bGFyQ29sb3IgKiBicmRmLnggKyBicmRmLnkgKyByZWZsZWN0aXZpdHkpO1xcbiAgc3BlY3VsYXIgKj0gdUVudlNwZWN1bGFyO1xcbn1cXG5cXG52b2lkIG1haW4oKSB7XFxuICB2ZWM0IGJhc2VDb2xvciA9IHVCYXNlQ29sb3JGYWN0b3I7XFxuICAjaWZkZWYgQ09MT1JfTUFQXFxuICAgIGJhc2VDb2xvciAqPSBTUkdCdG9MaW5lYXIodGV4dHVyZTJEKHRCYXNlQ29sb3IsIHZVdikpO1xcbiAgI2VuZGlmXFxuICAvLyBHZXQgYmFzZSBhbHBoYVxcbiAgZmxvYXQgYWxwaGEgPSBiYXNlQ29sb3IuYTtcXG4gICNpZmRlZiBBTFBIQV9NQVNLXFxuICAgIGlmIChhbHBoYSA8IHVBbHBoYUN1dG9mZikgZGlzY2FyZDtcXG4gICNlbmRpZlxcbiAgLy8gUk0gbWFwIHBhY2tlZCBhcyBnYiA9IFtub3RoaW5nLCByb3VnaG5lc3MsIG1ldGFsbGljLCBub3RoaW5nXVxcbiAgdmVjNCBybVNhbXBsZSA9IHZlYzQoMSk7XFxuICAjaWZkZWYgUk1fTUFQXFxuICAgIHJtU2FtcGxlICo9IHRleHR1cmUyRCh0Uk0sIHZVdik7XFxuICAjZW5kaWZcXG4gIGZsb2F0IHJvdWdobmVzcyA9IGNsYW1wKHJtU2FtcGxlLmcgKiB1Um91Z2huZXNzLCAwLjA0LCAxLjApO1xcbiAgZmxvYXQgbWV0YWxsaWMgPSBjbGFtcChybVNhbXBsZS5iICogdU1ldGFsbGljLCAwLjA0LCAxLjApO1xcbiAgdmVjMyBmMCA9IHZlYzMoMC4wNCk7XFxuICB2ZWMzIGRpZmZ1c2VDb2xvciA9IGJhc2VDb2xvci5yZ2IgKiAodmVjMygxLjApIC0gZjApICogKDEuMCAtIG1ldGFsbGljKTtcXG4gIHZlYzMgc3BlY3VsYXJDb2xvciA9IG1peChmMCwgYmFzZUNvbG9yLnJnYiwgbWV0YWxsaWMpO1xcbiAgdmVjMyBzcGVjdWxhckVudlIwID0gc3BlY3VsYXJDb2xvcjtcXG4gIHZlYzMgc3BlY3VsYXJFbnZSOTAgPSB2ZWMzKGNsYW1wKG1heChtYXgoc3BlY3VsYXJDb2xvci5yLCBzcGVjdWxhckNvbG9yLmcpLCBzcGVjdWxhckNvbG9yLmIpICogMjUuMCwgMC4wLCAxLjApKTtcXG4gIHZlYzMgTiA9IGdldE5vcm1hbCgpO1xcbiAgdmVjMyBWID0gbm9ybWFsaXplKGNhbWVyYVBvc2l0aW9uIC0gdk1Qb3MpO1xcbiAgdmVjMyByZWZsZWN0aW9uID0gbm9ybWFsaXplKHJlZmxlY3QoLVYsIE4pKTtcXG4gIGZsb2F0IE5kViA9IGNsYW1wKGFicyhkb3QoTiwgVikpLCAwLjAwMSwgMS4wKTtcXG4gIC8vIFNoYWRpbmcgYmFzZWQgb2ZmIElCTCBsaWdodGluZ1xcbiAgdmVjMyBjb2xvciA9IHZlYzMoMC4pO1xcbiAgdmVjMyBkaWZmdXNlSUJMO1xcbiAgdmVjMyBzcGVjdWxhcklCTDtcXG4gIGdldElCTENvbnRyaWJ1dGlvbihkaWZmdXNlSUJMLCBzcGVjdWxhcklCTCwgTmRWLCByb3VnaG5lc3MsIE4sIHJlZmxlY3Rpb24sIGRpZmZ1c2VDb2xvciwgc3BlY3VsYXJDb2xvcik7XFxuICAvLyBBZGQgSUJMIG9uIHRvcCBvZiBjb2xvclxcbiAgY29sb3IgKz0gKGRpZmZ1c2VJQkwgKyBzcGVjdWxhcklCTCkgKiB1RW52TWFwSW50ZW5zaXR5O1xcbiAgLy8gQWRkIElCTCBzcGVjIHRvIGFscGhhIGZvciByZWZsZWN0aW9ucyBvbiB0cmFuc3BhcmVudCBzdXJmYWNlcyAoZ2xhc3MpXFxuICBhbHBoYSA9IG1heChhbHBoYSwgbWF4KG1heChzcGVjdWxhcklCTC5yLCBzcGVjdWxhcklCTC5nKSwgc3BlY3VsYXJJQkwuYikpO1xcbiAgI2lmZGVmIE9DQ19NQVAgIFxcbiAgICAvLyBUT0RPOiBmaWd1cmUgb3V0IGhvdyB0byBhcHBseSBvY2NsdXNpb25cXG4gICAgLy8gY29sb3IgKj0gU1JHQnRvTGluZWFyKHRleHR1cmUyRCh0T2NjbHVzaW9uLCB2VXYpKS5yZ2I7XFxuICAjZW5kaWZcXG4gIGNvbG9yICs9IHVFbWlzc2l2ZTtcXG4gICNpZmRlZiBFTUlTU0lWRV9NQVAgIFxcbiAgICB2ZWMzIGVtaXNzaXZlID0gU1JHQnRvTGluZWFyKHRleHR1cmUyRCh0RW1pc3NpdmUsIHZVdikpLnJnYjtcXG4gICAgY29sb3IgPSBlbWlzc2l2ZTtcXG4gICNlbmRpZlxcbiAgLy8gQXBwbHkgdUFscGhhIHVuaWZvcm0gYXQgdGhlIGVuZCB0byBvdmVyd3JpdGUgYW55IHNwZWN1bGFyIGFkZGl0aW9ucyBvbiB0cmFuc3BhcmVudCBzdXJmYWNlc1xcbi8vICBnbF9GcmFnQ29sb3IucmdiID0gbGluZWFyVG9TUkdCKGNvbG9yKTtcXG4gIGlmKHVUcmFuc3BhcmVudCl7XFxuICAgIGdsX0ZyYWdDb2xvciA9ICh2ZWM0KGNvbG9yLCBhbHBoYSAqIHVBbHBoYSkpO1xcbiAgfWVsc2Uge1xcbiAgICBnbF9GcmFnQ29sb3IgPSBsaW5lYXJUb091dHB1dFRleGVsKHZlYzQoY29sb3IgKiBhbHBoYSAqIHVBbHBoYSwgMS4pKTtcXG4gIH1cXG59XCI7IiwiZXhwb3J0IGRlZmF1bHQgXCJwcmVjaXNpb24gaGlnaHAgZmxvYXQ7XFxucHJlY2lzaW9uIGhpZ2hwIGludDtcXG5hdHRyaWJ1dGUgdmVjMyBwb3NpdGlvbjtcXG5cXG4jaWZkZWYgVVZcXG4gICAgYXR0cmlidXRlIHZlYzIgdXY7XFxuI2Vsc2VcXG4gICAgY29uc3QgdmVjMiB1diA9IHZlYzIoMCk7XFxuI2VuZGlmXFxuYXR0cmlidXRlIHZlYzMgbm9ybWFsO1xcblxcbnVuaWZvcm0gbWF0NCBtb2RlbFZpZXdNYXRyaXg7XFxudW5pZm9ybSBtYXQ0IHByb2plY3Rpb25NYXRyaXg7XFxudW5pZm9ybSBtYXQ0IG1vZGVsTWF0cml4O1xcbnVuaWZvcm0gbWF0MyBub3JtYWxNYXRyaXg7XFxuXFxudmFyeWluZyB2ZWMyIHZVdjtcXG52YXJ5aW5nIHZlYzMgdk5vcm1hbDtcXG52YXJ5aW5nIHZlYzMgdk1Qb3M7XFxudmFyeWluZyB2ZWM0IHZNVlBvcztcXG5cXG52b2lkIG1haW4oKSB7XFxuICAgIHZlYzQgcG9zID0gdmVjNChwb3NpdGlvbiwgMSk7XFxuICAgIHZlYzMgbm1sID0gbm9ybWFsO1xcbiAgICB2VXYgPSB1djtcXG4gICAgdk5vcm1hbCA9IG5vcm1hbGl6ZShubWwpO1xcbiAgICB2ZWM0IG1Qb3MgPSBtb2RlbE1hdHJpeCAqIHBvcztcXG4gICAgdk1Qb3MgPSBtUG9zLnh5eiAvIG1Qb3MudztcXG4gICAgdk1WUG9zID0gbW9kZWxWaWV3TWF0cml4ICogcG9zO1xcbiAgICBnbF9Qb3NpdGlvbiA9IHByb2plY3Rpb25NYXRyaXggKiB2TVZQb3M7XFxufVwiOyIsImV4cG9ydCBkZWZhdWx0IFwiLy8gVGFrZW4gZnJvbSB0aHJlZWpzLlxcbi8vIEZvciBhIGRpc2N1c3Npb24gb2Ygd2hhdCB0aGlzIGlzLCBwbGVhc2UgcmVhZCB0aGlzOiBodHRwOi8vbG91c29kcm9tZS5uZXQvYmxvZy9saWdodC8yMDEzLzA1LzI2L2dhbW1hLWNvcnJlY3QtYW5kLWhkci1yZW5kZXJpbmctaW4tYS0zMi1iaXRzLWJ1ZmZlci9cXG52ZWM0IExpbmVhclRvTGluZWFyKCBpbiB2ZWM0IHZhbHVlICkge1xcbiAgICByZXR1cm4gdmFsdWU7XFxufVxcblxcbnZlYzQgR2FtbWFUb0xpbmVhciggaW4gdmVjNCB2YWx1ZSwgaW4gZmxvYXQgZ2FtbWFGYWN0b3IgKSB7XFxuICAgIHJldHVybiB2ZWM0KCBwb3coIHZhbHVlLnJnYiwgdmVjMyggZ2FtbWFGYWN0b3IgKSApLCB2YWx1ZS5hICk7XFxufVxcblxcbnZlYzQgTGluZWFyVG9HYW1tYSggaW4gdmVjNCB2YWx1ZSwgaW4gZmxvYXQgZ2FtbWFGYWN0b3IgKSB7XFxuICAgIHJldHVybiB2ZWM0KCBwb3coIHZhbHVlLnJnYiwgdmVjMyggMS4wIC8gZ2FtbWFGYWN0b3IgKSApLCB2YWx1ZS5hICk7XFxufVxcblxcbnZlYzQgc1JHQlRvTGluZWFyKCBpbiB2ZWM0IHZhbHVlICkge1xcbiAgICByZXR1cm4gdmVjNCggbWl4KCBwb3coIHZhbHVlLnJnYiAqIDAuOTQ3ODY3Mjk4NiArIHZlYzMoIDAuMDUyMTMyNzAxNCApLCB2ZWMzKCAyLjQgKSApLCB2YWx1ZS5yZ2IgKiAwLjA3NzM5OTM4MDgsIHZlYzMoIGxlc3NUaGFuRXF1YWwoIHZhbHVlLnJnYiwgdmVjMyggMC4wNDA0NSApICkgKSApLCB2YWx1ZS5hICk7XFxufVxcblxcbnZlYzQgTGluZWFyVG9zUkdCKCBpbiB2ZWM0IHZhbHVlICkge1xcbiAgICByZXR1cm4gdmVjNCggbWl4KCBwb3coIHZhbHVlLnJnYiwgdmVjMyggMC40MTY2NiApICkgKiAxLjA1NSAtIHZlYzMoIDAuMDU1ICksIHZhbHVlLnJnYiAqIDEyLjkyLCB2ZWMzKCBsZXNzVGhhbkVxdWFsKCB2YWx1ZS5yZ2IsIHZlYzMoIDAuMDAzMTMwOCApICkgKSApLCB2YWx1ZS5hICk7XFxufVxcblxcbnZlYzQgUkdCRVRvTGluZWFyKCBpbiB2ZWM0IHZhbHVlICkge1xcbiAgICByZXR1cm4gdmVjNCggdmFsdWUucmdiICogZXhwMiggdmFsdWUuYSAqIDI1NS4wIC0gMTI4LjAgKSwgMS4wICk7XFxufVxcblxcbnZlYzQgTGluZWFyVG9SR0JFKCBpbiB2ZWM0IHZhbHVlICkge1xcbiAgICBmbG9hdCBtYXhDb21wb25lbnQgPSBtYXgoIG1heCggdmFsdWUuciwgdmFsdWUuZyApLCB2YWx1ZS5iICk7XFxuICAgIGZsb2F0IGZFeHAgPSBjbGFtcCggY2VpbCggbG9nMiggbWF4Q29tcG9uZW50ICkgKSwgLTEyOC4wLCAxMjcuMCApO1xcbiAgICByZXR1cm4gdmVjNCggdmFsdWUucmdiIC8gZXhwMiggZkV4cCApLCAoIGZFeHAgKyAxMjguMCApIC8gMjU1LjAgKTtcXG4gICAgLy8gcmV0dXJuIHZlYzQoIHZhbHVlLmJyZywgKCAzLjAgKyAxMjguMCApIC8gMjU2LjAgKTtcXG59XFxuXFxuLy8gcmVmZXJlbmNlOiBodHRwOi8vaXdhc2JlaW5naXJvbnkuYmxvZ3Nwb3QuY2EvMjAxMC8wNi9kaWZmZXJlbmNlLWJldHdlZW4tcmdibS1hbmQtcmdiZC5odG1sXFxudmVjNCBSR0JNVG9MaW5lYXIoIGluIHZlYzQgdmFsdWUsIGluIGZsb2F0IG1heFJhbmdlICkge1xcbiAgICByZXR1cm4gdmVjNCggdmFsdWUucmdiICogdmFsdWUuYSAqIG1heFJhbmdlLCAxLjAgKTtcXG59XFxuXFxudmVjNCBMaW5lYXJUb1JHQk0oIGluIHZlYzQgdmFsdWUsIGluIGZsb2F0IG1heFJhbmdlICkge1xcbiAgICBmbG9hdCBtYXhSR0IgPSBtYXgoIHZhbHVlLnIsIG1heCggdmFsdWUuZywgdmFsdWUuYiApICk7XFxuICAgIGZsb2F0IE0gPSBjbGFtcCggbWF4UkdCIC8gbWF4UmFuZ2UsIDAuMCwgMS4wICk7XFxuICAgIE0gPSBjZWlsKCBNICogMjU1LjAgKSAvIDI1NS4wO1xcbiAgICByZXR1cm4gdmVjNCggdmFsdWUucmdiIC8gKCBNICogbWF4UmFuZ2UgKSwgTSApO1xcbn1cXG5cXG4vLyByZWZlcmVuY2U6IGh0dHA6Ly9pd2FzYmVpbmdpcm9ueS5ibG9nc3BvdC5jYS8yMDEwLzA2L2RpZmZlcmVuY2UtYmV0d2Vlbi1yZ2JtLWFuZC1yZ2JkLmh0bWxcXG52ZWM0IFJHQkRUb0xpbmVhciggaW4gdmVjNCB2YWx1ZSwgaW4gZmxvYXQgbWF4UmFuZ2UgKSB7XFxuICAgIHJldHVybiB2ZWM0KCB2YWx1ZS5yZ2IgKiAoICggbWF4UmFuZ2UgLyAyNTUuMCApIC8gdmFsdWUuYSApLCAxLjAgKTtcXG59XFxuXFxudmVjNCBMaW5lYXJUb1JHQkQoIGluIHZlYzQgdmFsdWUsIGluIGZsb2F0IG1heFJhbmdlICkge1xcbiAgICBmbG9hdCBtYXhSR0IgPSBtYXgoIHZhbHVlLnIsIG1heCggdmFsdWUuZywgdmFsdWUuYiApICk7XFxuICAgIGZsb2F0IEQgPSBtYXgoIG1heFJhbmdlIC8gbWF4UkdCLCAxLjAgKTtcXG4gICAgLy8gTk9URTogVGhlIGltcGxlbWVudGF0aW9uIHdpdGggbWluIGNhdXNlcyB0aGUgc2hhZGVyIHRvIG5vdCBjb21waWxlIG9uXFxuICAgIC8vIGEgY29tbW9uIEFsY2F0ZWwgQTUwMkRMIGluIENocm9tZSA3OC9BbmRyb2lkIDguMS4gU29tZSByZXNlYXJjaCBzdWdnZXN0c1xcbiAgICAvLyB0aGF0IHRoZSBjaGlwc2V0IGlzIE1lZGlhdGVrIE1UNjczOSB3LyBJTUcgUG93ZXJWUiBHRTgxMDAgR1BVLlxcbiAgICAvLyBEID0gbWluKCBmbG9vciggRCApIC8gMjU1LjAsIDEuMCApO1xcbiAgICBEID0gY2xhbXAoIGZsb29yKCBEICkgLyAyNTUuMCwgMC4wLCAxLjAgKTtcXG4gICAgcmV0dXJuIHZlYzQoIHZhbHVlLnJnYiAqICggRCAqICggMjU1LjAgLyBtYXhSYW5nZSApICksIEQgKTtcXG59XFxuXFxuLy8gTG9nTHV2IHJlZmVyZW5jZTogaHR0cDovL2dyYXBoaWNyYW50cy5ibG9nc3BvdC5jYS8yMDA5LzA0L3JnYm0tY29sb3ItZW5jb2RpbmcuaHRtbFxcblxcbi8vIE0gbWF0cml4LCBmb3IgZW5jb2RpbmdcXG5jb25zdCBtYXQzIGNMb2dMdXZNID0gbWF0MyggMC4yMjA5LCAwLjMzOTAsIDAuNDE4NCwgMC4xMTM4LCAwLjY3ODAsIDAuNzMxOSwgMC4wMTAyLCAwLjExMzAsIDAuMjk2OSApO1xcbnZlYzQgTGluZWFyVG9Mb2dMdXYoIGluIHZlYzQgdmFsdWUgKSB7XFxuICAgIHZlYzMgWHBfWV9YWVpwID0gY0xvZ0x1dk0gKiB2YWx1ZS5yZ2I7XFxuICAgIFhwX1lfWFlacCA9IG1heCggWHBfWV9YWVpwLCB2ZWMzKCAxZS02LCAxZS02LCAxZS02ICkgKTtcXG4gICAgdmVjNCB2UmVzdWx0O1xcbiAgICB2UmVzdWx0Lnh5ID0gWHBfWV9YWVpwLnh5IC8gWHBfWV9YWVpwLno7XFxuICAgIGZsb2F0IExlID0gMi4wICogbG9nMihYcF9ZX1hZWnAueSkgKyAxMjcuMDtcXG4gICAgdlJlc3VsdC53ID0gZnJhY3QoIExlICk7XFxuICAgIHZSZXN1bHQueiA9ICggTGUgLSAoIGZsb29yKCB2UmVzdWx0LncgKiAyNTUuMCApICkgLyAyNTUuMCApIC8gMjU1LjA7XFxuICAgIHJldHVybiB2UmVzdWx0O1xcbn1cXG5cXG4vLyBJbnZlcnNlIE0gbWF0cml4LCBmb3IgZGVjb2RpbmdcXG5jb25zdCBtYXQzIGNMb2dMdXZJbnZlcnNlTSA9IG1hdDMoIDYuMDAxNCwgLTIuNzAwOCwgLTEuNzk5NiwgLTEuMzMyMCwgMy4xMDI5LCAtNS43NzIxLCAwLjMwMDgsIC0xLjA4ODIsIDUuNjI2OCApO1xcbnZlYzQgTG9nTHV2VG9MaW5lYXIoIGluIHZlYzQgdmFsdWUgKSB7XFxuICAgIGZsb2F0IExlID0gdmFsdWUueiAqIDI1NS4wICsgdmFsdWUudztcXG4gICAgdmVjMyBYcF9ZX1hZWnA7XFxuICAgIFhwX1lfWFlacC55ID0gZXhwMiggKCBMZSAtIDEyNy4wICkgLyAyLjAgKTtcXG4gICAgWHBfWV9YWVpwLnogPSBYcF9ZX1hZWnAueSAvIHZhbHVlLnk7XFxuICAgIFhwX1lfWFlacC54ID0gdmFsdWUueCAqIFhwX1lfWFlacC56O1xcbiAgICB2ZWMzIHZSR0IgPSBjTG9nTHV2SW52ZXJzZU0gKiBYcF9ZX1hZWnAucmdiO1xcbiAgICByZXR1cm4gdmVjNCggbWF4KCB2UkdCLCAwLjAgKSwgMS4wICk7XFxufVxcblxcblxcbnZlYzQgaW5wdXRUZXhlbFRvTGluZWFyKCB2ZWM0IHZhbHVlICkge1xcbiAgICBpZiAoIGlucHV0RW5jb2RpbmcgPT0gMCApIHtcXG4gICAgICAgIHJldHVybiB2YWx1ZTtcXG4gICAgfSBlbHNlIGlmICggaW5wdXRFbmNvZGluZyA9PSAxICkge1xcbiAgICAgICAgcmV0dXJuIHNSR0JUb0xpbmVhciggdmFsdWUgKTtcXG4gICAgfSBlbHNlIGlmICggaW5wdXRFbmNvZGluZyA9PSAyICkge1xcbiAgICAgICAgcmV0dXJuIFJHQkVUb0xpbmVhciggdmFsdWUgKTtcXG4gICAgfSBlbHNlIGlmICggaW5wdXRFbmNvZGluZyA9PSAzICkge1xcbiAgICAgICAgcmV0dXJuIFJHQk1Ub0xpbmVhciggdmFsdWUsIDcuMCApO1xcbiAgICB9IGVsc2UgaWYgKCBpbnB1dEVuY29kaW5nID09IDQgKSB7XFxuICAgICAgICByZXR1cm4gUkdCTVRvTGluZWFyKCB2YWx1ZSwgMTYuMCApO1xcbiAgICB9IGVsc2UgaWYgKCBpbnB1dEVuY29kaW5nID09IDUgKSB7XFxuICAgICAgICByZXR1cm4gUkdCRFRvTGluZWFyKCB2YWx1ZSwgMjU2LjAgKTtcXG4gICAgfSBlbHNlIHtcXG4gICAgICAgIHJldHVybiBHYW1tYVRvTGluZWFyKCB2YWx1ZSwgMi4yICk7XFxuICAgIH1cXG59XFxudmVjNCBsaW5lYXJUb091dHB1dFRleGVsKCB2ZWM0IHZhbHVlICkge1xcbiAgICBpZiAoIG91dHB1dEVuY29kaW5nID09IDAgKSB7XFxuICAgICAgICByZXR1cm4gdmFsdWU7XFxuICAgIH0gZWxzZSBpZiAoIG91dHB1dEVuY29kaW5nID09IDEgKSB7XFxuICAgICAgICByZXR1cm4gTGluZWFyVG9zUkdCKCB2YWx1ZSApO1xcbiAgICB9IGVsc2UgaWYgKCBvdXRwdXRFbmNvZGluZyA9PSAyICkge1xcbiAgICAgICAgcmV0dXJuIExpbmVhclRvUkdCRSggdmFsdWUgKTtcXG4gICAgfSBlbHNlIGlmICggb3V0cHV0RW5jb2RpbmcgPT0gMyApIHtcXG4gICAgICAgIHJldHVybiBMaW5lYXJUb1JHQk0oIHZhbHVlLCA3LjAgKTtcXG4gICAgfSBlbHNlIGlmICggb3V0cHV0RW5jb2RpbmcgPT0gNCApIHtcXG4gICAgICAgIHJldHVybiBMaW5lYXJUb1JHQk0oIHZhbHVlLCAxNi4wICk7XFxuICAgIH0gZWxzZSBpZiAoIG91dHB1dEVuY29kaW5nID09IDUgKSB7XFxuICAgICAgICByZXR1cm4gTGluZWFyVG9SR0JEKCB2YWx1ZSwgMjU2LjAgKTtcXG4gICAgfSBlbHNlIHtcXG4gICAgICAgIHJldHVybiBMaW5lYXJUb0dhbW1hKCB2YWx1ZSwgMi4yICk7XFxuICAgIH1cXG59XFxuXFxuXFxuXCI7IiwiZXhwb3J0IGRlZmF1bHQgXCJ1bmlmb3JtIGZsb2F0IHRvbmVNYXBwaW5nRXhwb3N1cmU7XFxuXFxuLy8gZXhwb3N1cmUgb25seVxcbnZlYzMgTGluZWFyVG9uZU1hcHBpbmcoIHZlYzMgY29sb3IgKSB7XFxuXFxuICAgIHJldHVybiB0b25lTWFwcGluZ0V4cG9zdXJlICogY29sb3I7XFxuXFxufVxcblxcbi8vIHNvdXJjZTogaHR0cHM6Ly93d3cuY3MudXRhaC5lZHUvfnJlaW5oYXJkL2Nkcm9tL1xcbnZlYzMgUmVpbmhhcmRUb25lTWFwcGluZyggdmVjMyBjb2xvciApIHtcXG5cXG4gICAgY29sb3IgKj0gdG9uZU1hcHBpbmdFeHBvc3VyZTtcXG4gICAgcmV0dXJuIGNsYW1wICggY29sb3IgLyAoIHZlYzMoIDEuMCApICsgY29sb3IgKSwgMC4sIDEuKTtcXG5cXG59XFxuXFxuLy8gc291cmNlOiBodHRwOi8vZmlsbWljd29ybGRzLmNvbS9ibG9nL2ZpbG1pYy10b25lbWFwcGluZy1vcGVyYXRvcnMvXFxudmVjMyBPcHRpbWl6ZWRDaW5lb25Ub25lTWFwcGluZyggdmVjMyBjb2xvciApIHtcXG5cXG4gICAgLy8gb3B0aW1pemVkIGZpbG1pYyBvcGVyYXRvciBieSBKaW0gSGVqbCBhbmQgUmljaGFyZCBCdXJnZXNzLURhd3NvblxcbiAgICBjb2xvciAqPSB0b25lTWFwcGluZ0V4cG9zdXJlO1xcbiAgICBjb2xvciA9IG1heCggdmVjMyggMC4wICksIGNvbG9yIC0gMC4wMDQgKTtcXG4gICAgcmV0dXJuIHBvdyggKCBjb2xvciAqICggNi4yICogY29sb3IgKyAwLjUgKSApIC8gKCBjb2xvciAqICggNi4yICogY29sb3IgKyAxLjcgKSArIDAuMDYgKSwgdmVjMyggMi4yICkgKTtcXG5cXG59XFxuXFxuLy8gc291cmNlOiBodHRwczovL2dpdGh1Yi5jb20vc2VsZnNoYWRvdy9sdGNfY29kZS9ibG9iL21hc3Rlci93ZWJnbC9zaGFkZXJzL2x0Yy9sdGNfYmxpdC5mc1xcbnZlYzMgUlJUQW5kT0RURml0KCB2ZWMzIHYgKSB7XFxuXFxuICAgIHZlYzMgYSA9IHYgKiAoIHYgKyAwLjAyNDU3ODYgKSAtIDAuMDAwMDkwNTM3O1xcbiAgICB2ZWMzIGIgPSB2ICogKCAwLjk4MzcyOSAqIHYgKyAwLjQzMjk1MTAgKSArIDAuMjM4MDgxO1xcbiAgICByZXR1cm4gYSAvIGI7XFxuXFxufVxcblxcbi8vIHRoaXMgaW1wbGVtZW50YXRpb24gb2YgQUNFUyBpcyBtb2RpZmllZCB0byBhY2NvbW1vZGF0ZSBhIGJyaWdodGVyIHZpZXdpbmcgZW52aXJvbm1lbnQuXFxuLy8gdGhlIHNjYWxlIGZhY3RvciBvZiAxLzAuNiBpcyBzdWJqZWN0aXZlLiBzZWUgZGlzY3Vzc2lvbiBpbiAjMTk2MjEuXFxuXFxudmVjMyBBQ0VTRmlsbWljVG9uZU1hcHBpbmcoIHZlYzMgY29sb3IgKSB7XFxuXFxuICAgIC8vIHNSR0IgPT4gWFlaID0+IEQ2NV8yX0Q2MCA9PiBBUDEgPT4gUlJUX1NBVFxcbiAgICBjb25zdCBtYXQzIEFDRVNJbnB1dE1hdCA9IG1hdDMoXFxuICAgIHZlYzMoIDAuNTk3MTksIDAuMDc2MDAsIDAuMDI4NDAgKSwgLy8gdHJhbnNwb3NlZCBmcm9tIHNvdXJjZVxcbiAgICB2ZWMzKCAwLjM1NDU4LCAwLjkwODM0LCAwLjEzMzgzICksXFxuICAgIHZlYzMoIDAuMDQ4MjMsIDAuMDE1NjYsIDAuODM3NzcgKVxcbiAgICApO1xcblxcbiAgICAvLyBPRFRfU0FUID0+IFhZWiA9PiBENjBfMl9ENjUgPT4gc1JHQlxcbiAgICBjb25zdCBtYXQzIEFDRVNPdXRwdXRNYXQgPSBtYXQzKFxcbiAgICB2ZWMzKCAgMS42MDQ3NSwgLTAuMTAyMDgsIC0wLjAwMzI3ICksIC8vIHRyYW5zcG9zZWQgZnJvbSBzb3VyY2VcXG4gICAgdmVjMyggLTAuNTMxMDgsICAxLjEwODEzLCAtMC4wNzI3NiApLFxcbiAgICB2ZWMzKCAtMC4wNzM2NywgLTAuMDA2MDUsICAxLjA3NjAyIClcXG4gICAgKTtcXG5cXG4gICAgY29sb3IgKj0gdG9uZU1hcHBpbmdFeHBvc3VyZSAvIDAuNjtcXG5cXG4gICAgY29sb3IgPSBBQ0VTSW5wdXRNYXQgKiBjb2xvcjtcXG5cXG4gICAgLy8gQXBwbHkgUlJUIGFuZCBPRFRcXG4gICAgY29sb3IgPSBSUlRBbmRPRFRGaXQoIGNvbG9yICk7XFxuXFxuICAgIGNvbG9yID0gQUNFU091dHB1dE1hdCAqIGNvbG9yO1xcblxcbiAgICAvLyBDbGFtcCB0byBbMCwgMV1cXG4gICAgcmV0dXJuIGNsYW1wKCBjb2xvciwgMC4sIDEuICk7XFxuXFxufVxcblxcbnZlYzMgQ3VzdG9tVG9uZU1hcHBpbmcoIHZlYzMgY29sb3IgKSB7IHJldHVybiBjb2xvcjsgfVxcblxcbnZlYzMgdG9uZU1hcENvbG9yKHZlYzMgdmFsdWUpe1xcbiAgICBpZiAoIHRvbmVtYXBwaW5nTW9kZSA9PSAwICkge1xcbiAgICAgICAgcmV0dXJuIExpbmVhclRvbmVNYXBwaW5nICggdmFsdWUgKTtcXG4gICAgfSBlbHNlIGlmICggdG9uZW1hcHBpbmdNb2RlID09IDEgKSB7XFxuICAgICAgICByZXR1cm4gUmVpbmhhcmRUb25lTWFwcGluZyAoIHZhbHVlICk7XFxuICAgIH0gZWxzZSBpZiAoIHRvbmVtYXBwaW5nTW9kZSA9PSAyICkge1xcbiAgICAgICAgcmV0dXJuIE9wdGltaXplZENpbmVvblRvbmVNYXBwaW5nICggdmFsdWUgKTtcXG4gICAgfSBlbHNlIGlmICggdG9uZW1hcHBpbmdNb2RlID09IDMgKSB7XFxuICAgICAgICByZXR1cm4gQUNFU0ZpbG1pY1RvbmVNYXBwaW5nICggdmFsdWUgKTtcXG4gICAgfSBlbHNlIHtcXG4gICAgICAgIHJldHVybiB2YWx1ZTtcXG4gICAgfVxcbn1cXG5cXG5cIjsiLCJpbXBvcnQgeyBUcmFuc2Zvcm0gfSBmcm9tICcuL1RyYW5zZm9ybS5qcyc7XG5pbXBvcnQgeyBNYXQ0IH0gZnJvbSAnLi4vbWF0aC9NYXQ0LmpzJztcbmltcG9ydCB7IFZlYzMgfSBmcm9tICcuLi9tYXRoL1ZlYzMuanMnO1xuXG5jb25zdCB0ZW1wTWF0NCA9IG5ldyBNYXQ0KCk7XG5jb25zdCB0ZW1wVmVjM2EgPSBuZXcgVmVjMygpO1xuY29uc3QgdGVtcFZlYzNiID0gbmV3IFZlYzMoKTtcblxuZXhwb3J0IGNsYXNzIENhbWVyYSBleHRlbmRzIFRyYW5zZm9ybSB7XG4gICAgY29uc3RydWN0b3IoZ2wsIHsgbmVhciA9IDAuMSwgZmFyID0gMTAwLCBmb3YgPSA0NSwgYXNwZWN0ID0gMSwgbGVmdCwgcmlnaHQsIGJvdHRvbSwgdG9wLCB6b29tID0gMSB9ID0ge30pIHtcbiAgICAgICAgc3VwZXIoKTtcblxuICAgICAgICBPYmplY3QuYXNzaWduKHRoaXMsIHsgbmVhciwgZmFyLCBmb3YsIGFzcGVjdCwgbGVmdCwgcmlnaHQsIGJvdHRvbSwgdG9wLCB6b29tIH0pO1xuXG4gICAgICAgIHRoaXMucHJvamVjdGlvbk1hdHJpeCA9IG5ldyBNYXQ0KCk7XG4gICAgICAgIHRoaXMudmlld01hdHJpeCA9IG5ldyBNYXQ0KCk7XG4gICAgICAgIHRoaXMucHJvamVjdGlvblZpZXdNYXRyaXggPSBuZXcgTWF0NCgpO1xuICAgICAgICB0aGlzLndvcmxkUG9zaXRpb24gPSBuZXcgVmVjMygpO1xuXG4gICAgICAgIC8vIFVzZSBvcnRob2dyYXBoaWMgaWYgbGVmdC9yaWdodCBzZXQsIGVsc2UgZGVmYXVsdCB0byBwZXJzcGVjdGl2ZSBjYW1lcmFcbiAgICAgICAgdGhpcy50eXBlID0gbGVmdCB8fCByaWdodCA/ICdvcnRob2dyYXBoaWMnIDogJ3BlcnNwZWN0aXZlJztcblxuICAgICAgICBpZiAodGhpcy50eXBlID09PSAnb3J0aG9ncmFwaGljJykgdGhpcy5vcnRob2dyYXBoaWMoKTtcbiAgICAgICAgZWxzZSB0aGlzLnBlcnNwZWN0aXZlKCk7XG4gICAgfVxuXG4gICAgc2V0Vmlld09mZnNldCh4LCB5LCB3aWR0aCwgaGVpZ2h0KSB7XG4gICAgICAgIGlmKCF0aGlzLnZpZXcpIHtcbiAgICAgICAgICAgIHRoaXMudmlldyA9IHtcbiAgICAgICAgICAgICAgICBvZmZzZXRYOiB4LFxuICAgICAgICAgICAgICAgIG9mZnNldFk6IHksXG4gICAgICAgICAgICAgICAgd2lkdGg6IHdpZHRoLFxuICAgICAgICAgICAgICAgIGhlaWdodDogaGVpZ2h0XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy52aWV3Lm9mZnNldFggPSB4O1xuICAgICAgICB0aGlzLnZpZXcub2Zmc2V0WSA9IHk7XG4gICAgICAgIHRoaXMudmlldy53aWR0aCA9IHdpZHRoO1xuICAgICAgICB0aGlzLnZpZXcuaGVpZ2h0ID0gaGVpZ2h0O1xuICAgICAgICBpZih0aGlzLnR5cGUgPT09ICdwZXJzcGVjdGl2ZScpIHtcbiAgICAgICAgICAgIHRoaXMucGVyc3BlY3RpdmUoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNsZWFyVmlld09mZnNldCgpIHtcbiAgICAgICAgdGhpcy52aWV3ID0gbnVsbDtcbiAgICAgICAgaWYodGhpcy50eXBlID09PSAncGVyc3BlY3RpdmUnKSB7XG4gICAgICAgICAgICB0aGlzLnBlcnNwZWN0aXZlKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwZXJzcGVjdGl2ZSh7IG5lYXIgPSB0aGlzLm5lYXIsIGZhciA9IHRoaXMuZmFyLCBmb3YgPSB0aGlzLmZvdiwgYXNwZWN0ID0gdGhpcy5hc3BlY3QgfSA9IHt9KSB7XG4gICAgICAgIE9iamVjdC5hc3NpZ24odGhpcywgeyBuZWFyLCBmYXIsIGZvdiwgYXNwZWN0IH0pO1xuICAgICAgICBsZXQgdG9wID0gbmVhciAqIE1hdGgudGFuKCBNYXRoLlBJLzE4MCAqIDAuNSAqIGZvdiApLFxuICAgICAgICBoZWlnaHQgPSAyICogdG9wLFxuICAgICAgICB3aWR0aCA9IGFzcGVjdCAqIGhlaWdodCxcbiAgICAgICAgbGVmdCA9IC0gMC41ICogd2lkdGg7XG4gICAgICAgIFxuICAgICAgICBpZih0aGlzLnZpZXcpIHtcbiAgICAgICAgICAgIGxlZnQgKz0gdGhpcy52aWV3Lm9mZnNldFggKiB3aWR0aCAvIHRoaXMudmlldy53aWR0aDtcblx0XHRcdHRvcCAtPSB0aGlzLnZpZXcub2Zmc2V0WSAqIGhlaWdodCAvIHRoaXMudmlldy5oZWlnaHQ7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IHJpZ2h0ID0gbGVmdCArIHdpZHRoO1xuICAgICAgICBsZXQgYm90dG9tID0gdG9wIC0gaGVpZ2h0O1xuXG4gICAgICAgIHRoaXMucHJvamVjdGlvbk1hdHJpeC5mcm9tUGVyc3BlY3RpdmVGcnVzdHJ1bSh7IGxlZnQsIHJpZ2h0LCB0b3AsIGJvdHRvbSwgbmVhciwgZmFyIH0pO1xuICAgICAgICB0aGlzLnR5cGUgPSAncGVyc3BlY3RpdmUnO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBvcnRob2dyYXBoaWMoe1xuICAgICAgICBuZWFyID0gdGhpcy5uZWFyLFxuICAgICAgICBmYXIgPSB0aGlzLmZhcixcbiAgICAgICAgbGVmdCA9IHRoaXMubGVmdCxcbiAgICAgICAgcmlnaHQgPSB0aGlzLnJpZ2h0LFxuICAgICAgICBib3R0b20gPSB0aGlzLmJvdHRvbSxcbiAgICAgICAgdG9wID0gdGhpcy50b3AsXG4gICAgICAgIHpvb20gPSB0aGlzLnpvb20sXG4gICAgfSA9IHt9KSB7XG4gICAgICAgIE9iamVjdC5hc3NpZ24odGhpcywgeyBuZWFyLCBmYXIsIGxlZnQsIHJpZ2h0LCBib3R0b20sIHRvcCwgem9vbSB9KTtcbiAgICAgICAgbGVmdCAvPSB6b29tO1xuICAgICAgICByaWdodCAvPSB6b29tO1xuICAgICAgICBib3R0b20gLz0gem9vbTtcbiAgICAgICAgdG9wIC89IHpvb207XG4gICAgICAgIHRoaXMucHJvamVjdGlvbk1hdHJpeC5mcm9tT3J0aG9nb25hbCh7IGxlZnQsIHJpZ2h0LCBib3R0b20sIHRvcCwgbmVhciwgZmFyIH0pO1xuICAgICAgICB0aGlzLnR5cGUgPSAnb3J0aG9ncmFwaGljJztcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgdXBkYXRlTWF0cml4V29ybGQoKSB7XG4gICAgICAgIHN1cGVyLnVwZGF0ZU1hdHJpeFdvcmxkKCk7XG4gICAgICAgIHRoaXMudmlld01hdHJpeC5pbnZlcnNlKHRoaXMud29ybGRNYXRyaXgpO1xuICAgICAgICB0aGlzLndvcmxkTWF0cml4LmdldFRyYW5zbGF0aW9uKHRoaXMud29ybGRQb3NpdGlvbik7XG5cbiAgICAgICAgLy8gdXNlZCBmb3Igc29ydGluZ1xuICAgICAgICB0aGlzLnByb2plY3Rpb25WaWV3TWF0cml4Lm11bHRpcGx5KHRoaXMucHJvamVjdGlvbk1hdHJpeCwgdGhpcy52aWV3TWF0cml4KTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgbG9va0F0KHRhcmdldCkge1xuICAgICAgICBzdXBlci5sb29rQXQodGFyZ2V0LCB0cnVlKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLy8gUHJvamVjdCAzRCBjb29yZGluYXRlIHRvIDJEIHBvaW50XG4gICAgcHJvamVjdCh2KSB7XG4gICAgICAgIHYuYXBwbHlNYXRyaXg0KHRoaXMudmlld01hdHJpeCk7XG4gICAgICAgIHYuYXBwbHlNYXRyaXg0KHRoaXMucHJvamVjdGlvbk1hdHJpeCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8vIFVucHJvamVjdCAyRCBwb2ludCB0byAzRCBjb29yZGluYXRlXG4gICAgdW5wcm9qZWN0KHYpIHtcbiAgICAgICAgdi5hcHBseU1hdHJpeDQodGVtcE1hdDQuaW52ZXJzZSh0aGlzLnByb2plY3Rpb25NYXRyaXgpKTtcbiAgICAgICAgdi5hcHBseU1hdHJpeDQodGhpcy53b3JsZE1hdHJpeCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHVwZGF0ZUZydXN0dW0oKSB7XG4gICAgICAgIGlmICghdGhpcy5mcnVzdHVtKSB7XG4gICAgICAgICAgICB0aGlzLmZydXN0dW0gPSBbbmV3IFZlYzMoKSwgbmV3IFZlYzMoKSwgbmV3IFZlYzMoKSwgbmV3IFZlYzMoKSwgbmV3IFZlYzMoKSwgbmV3IFZlYzMoKV07XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBtID0gdGhpcy5wcm9qZWN0aW9uVmlld01hdHJpeDtcbiAgICAgICAgdGhpcy5mcnVzdHVtWzBdLnNldChtWzNdIC0gbVswXSwgbVs3XSAtIG1bNF0sIG1bMTFdIC0gbVs4XSkuY29uc3RhbnQgPSBtWzE1XSAtIG1bMTJdOyAvLyAteFxuICAgICAgICB0aGlzLmZydXN0dW1bMV0uc2V0KG1bM10gKyBtWzBdLCBtWzddICsgbVs0XSwgbVsxMV0gKyBtWzhdKS5jb25zdGFudCA9IG1bMTVdICsgbVsxMl07IC8vICt4XG4gICAgICAgIHRoaXMuZnJ1c3R1bVsyXS5zZXQobVszXSArIG1bMV0sIG1bN10gKyBtWzVdLCBtWzExXSArIG1bOV0pLmNvbnN0YW50ID0gbVsxNV0gKyBtWzEzXTsgLy8gK3lcbiAgICAgICAgdGhpcy5mcnVzdHVtWzNdLnNldChtWzNdIC0gbVsxXSwgbVs3XSAtIG1bNV0sIG1bMTFdIC0gbVs5XSkuY29uc3RhbnQgPSBtWzE1XSAtIG1bMTNdOyAvLyAteVxuICAgICAgICB0aGlzLmZydXN0dW1bNF0uc2V0KG1bM10gLSBtWzJdLCBtWzddIC0gbVs2XSwgbVsxMV0gLSBtWzEwXSkuY29uc3RhbnQgPSBtWzE1XSAtIG1bMTRdOyAvLyAreiAoZmFyKVxuICAgICAgICB0aGlzLmZydXN0dW1bNV0uc2V0KG1bM10gKyBtWzJdLCBtWzddICsgbVs2XSwgbVsxMV0gKyBtWzEwXSkuY29uc3RhbnQgPSBtWzE1XSArIG1bMTRdOyAvLyAteiAobmVhcilcblxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDY7IGkrKykge1xuICAgICAgICAgICAgY29uc3QgaW52TGVuID0gMS4wIC8gdGhpcy5mcnVzdHVtW2ldLmRpc3RhbmNlKCk7XG4gICAgICAgICAgICB0aGlzLmZydXN0dW1baV0ubXVsdGlwbHkoaW52TGVuKTtcbiAgICAgICAgICAgIHRoaXMuZnJ1c3R1bVtpXS5jb25zdGFudCAqPSBpbnZMZW47XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmcnVzdHVtSW50ZXJzZWN0c01lc2gobm9kZSkge1xuICAgICAgICAvLyBJZiBubyBwb3NpdGlvbiBhdHRyaWJ1dGUsIHRyZWF0IGFzIGZydXN0dW1DdWxsZWQgZmFsc2VcbiAgICAgICAgaWYgKCFub2RlLmdlb21ldHJ5LmF0dHJpYnV0ZXMucG9zaXRpb24pIHJldHVybiB0cnVlO1xuXG4gICAgICAgIGlmICghbm9kZS5nZW9tZXRyeS5ib3VuZHMgfHwgbm9kZS5nZW9tZXRyeS5ib3VuZHMucmFkaXVzID09PSBJbmZpbml0eSkgbm9kZS5nZW9tZXRyeS5jb21wdXRlQm91bmRpbmdTcGhlcmUoKTtcblxuICAgICAgICBpZiAoIW5vZGUuZ2VvbWV0cnkuYm91bmRzKSByZXR1cm4gdHJ1ZTtcblxuICAgICAgICBjb25zdCBjZW50ZXIgPSB0ZW1wVmVjM2E7XG4gICAgICAgIGNlbnRlci5jb3B5KG5vZGUuZ2VvbWV0cnkuYm91bmRzLmNlbnRlcik7XG4gICAgICAgIGNlbnRlci5hcHBseU1hdHJpeDQobm9kZS53b3JsZE1hdHJpeCk7XG5cbiAgICAgICAgY29uc3QgcmFkaXVzID0gbm9kZS5nZW9tZXRyeS5ib3VuZHMucmFkaXVzICogbm9kZS53b3JsZE1hdHJpeC5nZXRNYXhTY2FsZU9uQXhpcygpO1xuXG4gICAgICAgIHJldHVybiB0aGlzLmZydXN0dW1JbnRlcnNlY3RzU3BoZXJlKGNlbnRlciwgcmFkaXVzKTtcbiAgICB9XG5cbiAgICBmcnVzdHVtSW50ZXJzZWN0c1NwaGVyZShjZW50ZXIsIHJhZGl1cykge1xuICAgICAgICBjb25zdCBub3JtYWwgPSB0ZW1wVmVjM2I7XG5cbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCA2OyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IHBsYW5lID0gdGhpcy5mcnVzdHVtW2ldO1xuICAgICAgICAgICAgY29uc3QgZGlzdGFuY2UgPSBub3JtYWwuY29weShwbGFuZSkuZG90KGNlbnRlcikgKyBwbGFuZS5jb25zdGFudDtcbiAgICAgICAgICAgIGlmIChkaXN0YW5jZSA8IC1yYWRpdXMpIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG59XG4iLCIvLyBhdHRyaWJ1dGUgcGFyYW1zXG4vLyB7XG4vLyAgICAgZGF0YSAtIHR5cGVkIGFycmF5IGVnIFVJbnQxNkFycmF5IGZvciBpbmRpY2VzLCBGbG9hdDMyQXJyYXlcbi8vICAgICBzaXplIC0gaW50IGRlZmF1bHQgMVxuLy8gICAgIGluc3RhbmNlZCAtIGRlZmF1bHQgbnVsbC4gUGFzcyBkaXZpc29yIGFtb3VudFxuLy8gICAgIHR5cGUgLSBnbCBlbnVtIGRlZmF1bHQgZ2wuVU5TSUdORURfU0hPUlQgZm9yICdpbmRleCcsIGdsLkZMT0FUIGZvciBvdGhlcnNcbi8vICAgICBub3JtYWxpemVkIC0gYm9vbGVhbiBkZWZhdWx0IGZhbHNlXG5cbi8vICAgICBidWZmZXIgLSBnbCBidWZmZXIsIGlmIGJ1ZmZlciBleGlzdHMsIGRvbid0IG5lZWQgdG8gcHJvdmlkZSBkYXRhXG4vLyAgICAgc3RyaWRlIC0gZGVmYXVsdCAwIC0gZm9yIHdoZW4gcGFzc2luZyBpbiBidWZmZXJcbi8vICAgICBvZmZzZXQgLSBkZWZhdWx0IDAgLSBmb3Igd2hlbiBwYXNzaW5nIGluIGJ1ZmZlclxuLy8gICAgIGNvdW50IC0gZGVmYXVsdCBudWxsIC0gZm9yIHdoZW4gcGFzc2luZyBpbiBidWZmZXJcbi8vICAgICBtaW4gLSBhcnJheSAtIGZvciB3aGVuIHBhc3NpbmcgaW4gYnVmZmVyXG4vLyAgICAgbWF4IC0gYXJyYXkgLSBmb3Igd2hlbiBwYXNzaW5nIGluIGJ1ZmZlclxuLy8gfVxuXG4vLyBUT0RPOiBmaXQgaW4gdHJhbnNmb3JtIGZlZWRiYWNrXG4vLyBUT0RPOiB3aGVuIHdvdWxkIEkgZGlzYWJsZVZlcnRleEF0dHJpYkFycmF5ID9cbi8vIFRPRE86IHVzZSBvZmZzZXQvc3RyaWRlIGlmIGV4aXN0c1xuXG5pbXBvcnQgeyBWZWMzIH0gZnJvbSAnLi4vbWF0aC9WZWMzLmpzJztcblxuY29uc3QgdGVtcFZlYzMgPSBuZXcgVmVjMygpO1xuXG5sZXQgSUQgPSAxO1xubGV0IEFUVFJfSUQgPSAxO1xuXG4vLyBUbyBzdG9wIGluaWZpbml0ZSB3YXJuaW5nc1xubGV0IGlzQm91bmRzV2FybmVkID0gZmFsc2U7XG5cbmV4cG9ydCBjbGFzcyBHZW9tZXRyeSB7XG4gICAgY29uc3RydWN0b3IoZ2wsIGF0dHJpYnV0ZXMgPSB7fSkge1xuICAgICAgICBpZiAoIWdsLmNhbnZhcykgY29uc29sZS5lcnJvcignZ2wgbm90IHBhc3NlZCBhcyBmaXJzdCBhcmd1bWVudCB0byBHZW9tZXRyeScpO1xuICAgICAgICB0aGlzLmdsID0gZ2w7XG4gICAgICAgIHRoaXMuYXR0cmlidXRlcyA9IGF0dHJpYnV0ZXM7XG4gICAgICAgIHRoaXMuaWQgPSBJRCsrO1xuXG4gICAgICAgIC8vIFN0b3JlIG9uZSBWQU8gcGVyIHByb2dyYW0gYXR0cmlidXRlIGxvY2F0aW9ucyBvcmRlclxuICAgICAgICB0aGlzLlZBT3MgPSB7fTtcblxuICAgICAgICB0aGlzLmRyYXdSYW5nZSA9IHsgc3RhcnQ6IDAsIGNvdW50OiAwIH07XG4gICAgICAgIHRoaXMuaW5zdGFuY2VkQ291bnQgPSAwO1xuXG4gICAgICAgIC8vIFVuYmluZCBjdXJyZW50IFZBTyBzbyB0aGF0IG5ldyBidWZmZXJzIGRvbid0IGdldCBhZGRlZCB0byBhY3RpdmUgbWVzaFxuICAgICAgICB0aGlzLmdsLnJlbmRlcmVyLmJpbmRWZXJ0ZXhBcnJheShudWxsKTtcbiAgICAgICAgdGhpcy5nbC5yZW5kZXJlci5jdXJyZW50R2VvbWV0cnkgPSBudWxsO1xuXG4gICAgICAgIC8vIEFsaWFzIGZvciBzdGF0ZSBzdG9yZSB0byBhdm9pZCByZWR1bmRhbnQgY2FsbHMgZm9yIGdsb2JhbCBzdGF0ZVxuICAgICAgICB0aGlzLmdsU3RhdGUgPSB0aGlzLmdsLnJlbmRlcmVyLnN0YXRlO1xuXG4gICAgICAgIC8vIGNyZWF0ZSB0aGUgYnVmZmVyc1xuICAgICAgICBmb3IgKGxldCBrZXkgaW4gYXR0cmlidXRlcykge1xuICAgICAgICAgICAgdGhpcy5hZGRBdHRyaWJ1dGUoa2V5LCBhdHRyaWJ1dGVzW2tleV0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgYWRkQXR0cmlidXRlKGtleSwgYXR0cikge1xuICAgICAgICB0aGlzLmF0dHJpYnV0ZXNba2V5XSA9IGF0dHI7XG5cbiAgICAgICAgLy8gU2V0IG9wdGlvbnNcbiAgICAgICAgYXR0ci5pZCA9IEFUVFJfSUQrKzsgLy8gVE9ETzogY3VycmVudGx5IHVudXNlZCwgcmVtb3ZlP1xuICAgICAgICBhdHRyLnNpemUgPSBhdHRyLnNpemUgfHwgMTtcbiAgICAgICAgYXR0ci50eXBlID1cbiAgICAgICAgICAgIGF0dHIudHlwZSB8fFxuICAgICAgICAgICAgKGF0dHIuZGF0YS5jb25zdHJ1Y3RvciA9PT0gRmxvYXQzMkFycmF5XG4gICAgICAgICAgICAgICAgPyB0aGlzLmdsLkZMT0FUXG4gICAgICAgICAgICAgICAgOiBhdHRyLmRhdGEuY29uc3RydWN0b3IgPT09IFVpbnQxNkFycmF5XG4gICAgICAgICAgICAgICAgPyB0aGlzLmdsLlVOU0lHTkVEX1NIT1JUXG4gICAgICAgICAgICAgICAgOiB0aGlzLmdsLlVOU0lHTkVEX0lOVCk7IC8vIFVpbnQzMkFycmF5XG4gICAgICAgIGF0dHIudGFyZ2V0ID0ga2V5ID09PSAnaW5kZXgnID8gdGhpcy5nbC5FTEVNRU5UX0FSUkFZX0JVRkZFUiA6IHRoaXMuZ2wuQVJSQVlfQlVGRkVSO1xuICAgICAgICBhdHRyLm5vcm1hbGl6ZWQgPSBhdHRyLm5vcm1hbGl6ZWQgfHwgZmFsc2U7XG4gICAgICAgIGF0dHIuc3RyaWRlID0gYXR0ci5zdHJpZGUgfHwgMDtcbiAgICAgICAgYXR0ci5vZmZzZXQgPSBhdHRyLm9mZnNldCB8fCAwO1xuICAgICAgICBhdHRyLmNvdW50ID0gYXR0ci5jb3VudCB8fCAoYXR0ci5zdHJpZGUgPyBhdHRyLmRhdGEuYnl0ZUxlbmd0aCAvIGF0dHIuc3RyaWRlIDogYXR0ci5kYXRhLmxlbmd0aCAvIGF0dHIuc2l6ZSk7XG4gICAgICAgIGF0dHIuZGl2aXNvciA9IGF0dHIuaW5zdGFuY2VkIHx8IDA7XG4gICAgICAgIGF0dHIubmVlZHNVcGRhdGUgPSBmYWxzZTtcblxuICAgICAgICBpZiAoIWF0dHIuYnVmZmVyKSB7XG4gICAgICAgICAgICBhdHRyLmJ1ZmZlciA9IHRoaXMuZ2wuY3JlYXRlQnVmZmVyKCk7XG5cbiAgICAgICAgICAgIC8vIFB1c2ggZGF0YSB0byBidWZmZXJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlQXR0cmlidXRlKGF0dHIpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gVXBkYXRlIGdlb21ldHJ5IGNvdW50cy4gSWYgaW5kZXhlZCwgaWdub3JlIHJlZ3VsYXIgYXR0cmlidXRlc1xuICAgICAgICBpZiAoYXR0ci5kaXZpc29yKSB7XG4gICAgICAgICAgICB0aGlzLmlzSW5zdGFuY2VkID0gdHJ1ZTtcbiAgICAgICAgICAgIGlmICh0aGlzLmluc3RhbmNlZENvdW50ICYmIHRoaXMuaW5zdGFuY2VkQ291bnQgIT09IGF0dHIuY291bnQgKiBhdHRyLmRpdmlzb3IpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ2dlb21ldHJ5IGhhcyBtdWx0aXBsZSBpbnN0YW5jZWQgYnVmZmVycyBvZiBkaWZmZXJlbnQgbGVuZ3RoJyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuICh0aGlzLmluc3RhbmNlZENvdW50ID0gTWF0aC5taW4odGhpcy5pbnN0YW5jZWRDb3VudCwgYXR0ci5jb3VudCAqIGF0dHIuZGl2aXNvcikpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5pbnN0YW5jZWRDb3VudCA9IGF0dHIuY291bnQgKiBhdHRyLmRpdmlzb3I7XG4gICAgICAgIH0gZWxzZSBpZiAoa2V5ID09PSAnaW5kZXgnKSB7XG4gICAgICAgICAgICB0aGlzLmRyYXdSYW5nZS5jb3VudCA9IGF0dHIuY291bnQ7XG4gICAgICAgIH0gZWxzZSBpZiAoIXRoaXMuYXR0cmlidXRlcy5pbmRleCkge1xuICAgICAgICAgICAgdGhpcy5kcmF3UmFuZ2UuY291bnQgPSBNYXRoLm1heCh0aGlzLmRyYXdSYW5nZS5jb3VudCwgYXR0ci5jb3VudCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB1cGRhdGVBdHRyaWJ1dGUoYXR0cikge1xuICAgICAgICBpZiAodGhpcy5nbFN0YXRlLmJvdW5kQnVmZmVyICE9PSBhdHRyLmJ1ZmZlcikge1xuICAgICAgICAgICAgdGhpcy5nbC5iaW5kQnVmZmVyKGF0dHIudGFyZ2V0LCBhdHRyLmJ1ZmZlcik7XG4gICAgICAgICAgICB0aGlzLmdsU3RhdGUuYm91bmRCdWZmZXIgPSBhdHRyLmJ1ZmZlcjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmdsLmJ1ZmZlckRhdGEoYXR0ci50YXJnZXQsIGF0dHIuZGF0YSwgdGhpcy5nbC5TVEFUSUNfRFJBVyk7XG4gICAgICAgIGF0dHIubmVlZHNVcGRhdGUgPSBmYWxzZTtcbiAgICB9XG5cbiAgICBzZXRJbmRleCh2YWx1ZSkge1xuICAgICAgICB0aGlzLmFkZEF0dHJpYnV0ZSgnaW5kZXgnLCB2YWx1ZSk7XG4gICAgfVxuXG4gICAgc2V0RHJhd1JhbmdlKHN0YXJ0LCBjb3VudCkge1xuICAgICAgICB0aGlzLmRyYXdSYW5nZS5zdGFydCA9IHN0YXJ0O1xuICAgICAgICB0aGlzLmRyYXdSYW5nZS5jb3VudCA9IGNvdW50O1xuICAgIH1cblxuICAgIHNldEluc3RhbmNlZENvdW50KHZhbHVlKSB7XG4gICAgICAgIHRoaXMuaW5zdGFuY2VkQ291bnQgPSB2YWx1ZTtcbiAgICB9XG5cbiAgICBjcmVhdGVWQU8ocHJvZ3JhbSkge1xuICAgICAgICB0aGlzLlZBT3NbcHJvZ3JhbS5hdHRyaWJ1dGVPcmRlcl0gPSB0aGlzLmdsLnJlbmRlcmVyLmNyZWF0ZVZlcnRleEFycmF5KCk7XG4gICAgICAgIHRoaXMuZ2wucmVuZGVyZXIuYmluZFZlcnRleEFycmF5KHRoaXMuVkFPc1twcm9ncmFtLmF0dHJpYnV0ZU9yZGVyXSk7XG4gICAgICAgIHRoaXMuYmluZEF0dHJpYnV0ZXMocHJvZ3JhbSk7XG4gICAgfVxuXG4gICAgYmluZEF0dHJpYnV0ZXMocHJvZ3JhbSkge1xuICAgICAgICAvLyBMaW5rIGFsbCBhdHRyaWJ1dGVzIHRvIHByb2dyYW0gdXNpbmcgZ2wudmVydGV4QXR0cmliUG9pbnRlclxuICAgICAgICBwcm9ncmFtLmF0dHJpYnV0ZUxvY2F0aW9ucy5mb3JFYWNoKChsb2NhdGlvbiwgeyBuYW1lLCB0eXBlIH0pID0+IHtcbiAgICAgICAgICAgIC8vIElmIGdlb21ldHJ5IG1pc3NpbmcgYSByZXF1aXJlZCBzaGFkZXIgYXR0cmlidXRlXG4gICAgICAgICAgICBpZiAoIXRoaXMuYXR0cmlidXRlc1tuYW1lXSkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihgYWN0aXZlIGF0dHJpYnV0ZSAke25hbWV9IG5vdCBiZWluZyBzdXBwbGllZGApO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3QgYXR0ciA9IHRoaXMuYXR0cmlidXRlc1tuYW1lXTtcblxuICAgICAgICAgICAgdGhpcy5nbC5iaW5kQnVmZmVyKGF0dHIudGFyZ2V0LCBhdHRyLmJ1ZmZlcik7XG4gICAgICAgICAgICB0aGlzLmdsU3RhdGUuYm91bmRCdWZmZXIgPSBhdHRyLmJ1ZmZlcjtcblxuICAgICAgICAgICAgLy8gRm9yIG1hdHJpeCBhdHRyaWJ1dGVzLCBidWZmZXIgbmVlZHMgdG8gYmUgZGVmaW5lZCBwZXIgY29sdW1uXG4gICAgICAgICAgICBsZXQgbnVtTG9jID0gMTtcbiAgICAgICAgICAgIGlmICh0eXBlID09PSAzNTY3NCkgbnVtTG9jID0gMjsgLy8gbWF0MlxuICAgICAgICAgICAgaWYgKHR5cGUgPT09IDM1Njc1KSBudW1Mb2MgPSAzOyAvLyBtYXQzXG4gICAgICAgICAgICBpZiAodHlwZSA9PT0gMzU2NzYpIG51bUxvYyA9IDQ7IC8vIG1hdDRcblxuICAgICAgICAgICAgY29uc3Qgc2l6ZSA9IGF0dHIuc2l6ZSAvIG51bUxvYztcbiAgICAgICAgICAgIGNvbnN0IHN0cmlkZSA9IG51bUxvYyA9PT0gMSA/IDAgOiBudW1Mb2MgKiBudW1Mb2MgKiBudW1Mb2M7XG4gICAgICAgICAgICBjb25zdCBvZmZzZXQgPSBudW1Mb2MgPT09IDEgPyAwIDogbnVtTG9jICogbnVtTG9jO1xuXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG51bUxvYzsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5nbC52ZXJ0ZXhBdHRyaWJQb2ludGVyKGxvY2F0aW9uICsgaSwgc2l6ZSwgYXR0ci50eXBlLCBhdHRyLm5vcm1hbGl6ZWQsIGF0dHIuc3RyaWRlICsgc3RyaWRlLCBhdHRyLm9mZnNldCArIGkgKiBvZmZzZXQpO1xuICAgICAgICAgICAgICAgIHRoaXMuZ2wuZW5hYmxlVmVydGV4QXR0cmliQXJyYXkobG9jYXRpb24gKyBpKTtcblxuICAgICAgICAgICAgICAgIC8vIEZvciBpbnN0YW5jZWQgYXR0cmlidXRlcywgZGl2aXNvciBuZWVkcyB0byBiZSBzZXQuXG4gICAgICAgICAgICAgICAgLy8gRm9yIGZpcmVmb3gsIG5lZWQgdG8gc2V0IGJhY2sgdG8gMCBpZiBub24taW5zdGFuY2VkIGRyYXduIGFmdGVyIGluc3RhbmNlZC4gRWxzZSB3b24ndCByZW5kZXJcbiAgICAgICAgICAgICAgICB0aGlzLmdsLnJlbmRlcmVyLnZlcnRleEF0dHJpYkRpdmlzb3IobG9jYXRpb24gKyBpLCBhdHRyLmRpdmlzb3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBCaW5kIGluZGljZXMgaWYgZ2VvbWV0cnkgaW5kZXhlZFxuICAgICAgICBpZiAodGhpcy5hdHRyaWJ1dGVzLmluZGV4KSB0aGlzLmdsLmJpbmRCdWZmZXIodGhpcy5nbC5FTEVNRU5UX0FSUkFZX0JVRkZFUiwgdGhpcy5hdHRyaWJ1dGVzLmluZGV4LmJ1ZmZlcik7XG4gICAgfVxuXG4gICAgZHJhdyh7IHByb2dyYW0sIG1vZGUgPSB0aGlzLmdsLlRSSUFOR0xFUyB9KSB7XG4gICAgICAgIGlmICh0aGlzLmdsLnJlbmRlcmVyLmN1cnJlbnRHZW9tZXRyeSAhPT0gYCR7dGhpcy5pZH1fJHtwcm9ncmFtLmF0dHJpYnV0ZU9yZGVyfWApIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5WQU9zW3Byb2dyYW0uYXR0cmlidXRlT3JkZXJdKSB0aGlzLmNyZWF0ZVZBTyhwcm9ncmFtKTtcbiAgICAgICAgICAgIHRoaXMuZ2wucmVuZGVyZXIuYmluZFZlcnRleEFycmF5KHRoaXMuVkFPc1twcm9ncmFtLmF0dHJpYnV0ZU9yZGVyXSk7XG4gICAgICAgICAgICB0aGlzLmdsLnJlbmRlcmVyLmN1cnJlbnRHZW9tZXRyeSA9IGAke3RoaXMuaWR9XyR7cHJvZ3JhbS5hdHRyaWJ1dGVPcmRlcn1gO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ2hlY2sgaWYgYW55IGF0dHJpYnV0ZXMgbmVlZCB1cGRhdGluZ1xuICAgICAgICBwcm9ncmFtLmF0dHJpYnV0ZUxvY2F0aW9ucy5mb3JFYWNoKChsb2NhdGlvbiwgeyBuYW1lIH0pID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGF0dHIgPSB0aGlzLmF0dHJpYnV0ZXNbbmFtZV07XG4gICAgICAgICAgICBpZiAoYXR0ci5uZWVkc1VwZGF0ZSkgdGhpcy51cGRhdGVBdHRyaWJ1dGUoYXR0cik7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmICh0aGlzLmlzSW5zdGFuY2VkKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5hdHRyaWJ1dGVzLmluZGV4KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5nbC5yZW5kZXJlci5kcmF3RWxlbWVudHNJbnN0YW5jZWQoXG4gICAgICAgICAgICAgICAgICAgIG1vZGUsXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhd1JhbmdlLmNvdW50LFxuICAgICAgICAgICAgICAgICAgICB0aGlzLmF0dHJpYnV0ZXMuaW5kZXgudHlwZSxcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hdHRyaWJ1dGVzLmluZGV4Lm9mZnNldCArIHRoaXMuZHJhd1JhbmdlLnN0YXJ0ICogMixcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbnN0YW5jZWRDb3VudFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuZ2wucmVuZGVyZXIuZHJhd0FycmF5c0luc3RhbmNlZChtb2RlLCB0aGlzLmRyYXdSYW5nZS5zdGFydCwgdGhpcy5kcmF3UmFuZ2UuY291bnQsIHRoaXMuaW5zdGFuY2VkQ291bnQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKHRoaXMuYXR0cmlidXRlcy5pbmRleCkge1xuICAgICAgICAgICAgICAgIHRoaXMuZ2wuZHJhd0VsZW1lbnRzKG1vZGUsIHRoaXMuZHJhd1JhbmdlLmNvdW50LCB0aGlzLmF0dHJpYnV0ZXMuaW5kZXgudHlwZSwgdGhpcy5hdHRyaWJ1dGVzLmluZGV4Lm9mZnNldCArIHRoaXMuZHJhd1JhbmdlLnN0YXJ0ICogMik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuZ2wuZHJhd0FycmF5cyhtb2RlLCB0aGlzLmRyYXdSYW5nZS5zdGFydCwgdGhpcy5kcmF3UmFuZ2UuY291bnQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgZ2V0UG9zaXRpb25BcnJheSgpIHtcbiAgICAgICAgLy8gVXNlIHBvc2l0aW9uIGJ1ZmZlciwgb3IgbWluL21heCBpZiBhdmFpbGFibGVcbiAgICAgICAgY29uc3QgYXR0ciA9IHRoaXMuYXR0cmlidXRlcy5wb3NpdGlvbjtcbiAgICAgICAgLy8gaWYgKGF0dHIubWluKSByZXR1cm4gWy4uLmF0dHIubWluLCAuLi5hdHRyLm1heF07XG4gICAgICAgIGlmIChhdHRyLmRhdGEpIHJldHVybiBhdHRyLmRhdGE7XG4gICAgICAgIGlmIChpc0JvdW5kc1dhcm5lZCkgcmV0dXJuO1xuICAgICAgICBjb25zb2xlLndhcm4oJ05vIHBvc2l0aW9uIGJ1ZmZlciBkYXRhIGZvdW5kIHRvIGNvbXB1dGUgYm91bmRzJyk7XG4gICAgICAgIHJldHVybiAoaXNCb3VuZHNXYXJuZWQgPSB0cnVlKTtcbiAgICB9XG5cbiAgICBjb21wdXRlQm91bmRpbmdCb3goYXJyYXkpIHtcbiAgICAgICAgaWYgKCFhcnJheSkgYXJyYXkgPSB0aGlzLmdldFBvc2l0aW9uQXJyYXkoKTtcblxuICAgICAgICBpZiAoIXRoaXMuYm91bmRzKSB7XG4gICAgICAgICAgICB0aGlzLmJvdW5kcyA9IHtcbiAgICAgICAgICAgICAgICBtaW46IG5ldyBWZWMzKCksXG4gICAgICAgICAgICAgICAgbWF4OiBuZXcgVmVjMygpLFxuICAgICAgICAgICAgICAgIGNlbnRlcjogbmV3IFZlYzMoKSxcbiAgICAgICAgICAgICAgICBzY2FsZTogbmV3IFZlYzMoKSxcbiAgICAgICAgICAgICAgICByYWRpdXM6IEluZmluaXR5LFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IG1pbiA9IHRoaXMuYm91bmRzLm1pbjtcbiAgICAgICAgY29uc3QgbWF4ID0gdGhpcy5ib3VuZHMubWF4O1xuICAgICAgICBjb25zdCBjZW50ZXIgPSB0aGlzLmJvdW5kcy5jZW50ZXI7XG4gICAgICAgIGNvbnN0IHNjYWxlID0gdGhpcy5ib3VuZHMuc2NhbGU7XG5cbiAgICAgICAgbWluLnNldCgrSW5maW5pdHkpO1xuICAgICAgICBtYXguc2V0KC1JbmZpbml0eSk7XG5cbiAgICAgICAgLy8gVE9ETzogdXNlIG9mZnNldC9zdHJpZGUgaWYgZXhpc3RzXG4gICAgICAgIC8vIFRPRE86IGNoZWNrIHNpemUgb2YgcG9zaXRpb24gKGVnIHRyaWFuZ2xlIHdpdGggVmVjMilcbiAgICAgICAgZm9yIChsZXQgaSA9IDAsIGwgPSBhcnJheS5sZW5ndGg7IGkgPCBsOyBpICs9IDMpIHtcbiAgICAgICAgICAgIGNvbnN0IHggPSBhcnJheVtpXTtcbiAgICAgICAgICAgIGNvbnN0IHkgPSBhcnJheVtpICsgMV07XG4gICAgICAgICAgICBjb25zdCB6ID0gYXJyYXlbaSArIDJdO1xuXG4gICAgICAgICAgICBtaW4ueCA9IE1hdGgubWluKHgsIG1pbi54KTtcbiAgICAgICAgICAgIG1pbi55ID0gTWF0aC5taW4oeSwgbWluLnkpO1xuICAgICAgICAgICAgbWluLnogPSBNYXRoLm1pbih6LCBtaW4ueik7XG5cbiAgICAgICAgICAgIG1heC54ID0gTWF0aC5tYXgoeCwgbWF4LngpO1xuICAgICAgICAgICAgbWF4LnkgPSBNYXRoLm1heCh5LCBtYXgueSk7XG4gICAgICAgICAgICBtYXgueiA9IE1hdGgubWF4KHosIG1heC56KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHNjYWxlLnN1YihtYXgsIG1pbik7XG4gICAgICAgIGNlbnRlci5hZGQobWluLCBtYXgpLmRpdmlkZSgyKTtcbiAgICB9XG5cbiAgICBjb21wdXRlQm91bmRpbmdTcGhlcmUoYXJyYXkpIHtcbiAgICAgICAgaWYgKCFhcnJheSkgYXJyYXkgPSB0aGlzLmdldFBvc2l0aW9uQXJyYXkoKTtcbiAgICAgICAgaWYgKCF0aGlzLmJvdW5kcykgdGhpcy5jb21wdXRlQm91bmRpbmdCb3goYXJyYXkpO1xuXG4gICAgICAgIGxldCBtYXhSYWRpdXNTcSA9IDA7XG4gICAgICAgIGZvciAobGV0IGkgPSAwLCBsID0gYXJyYXkubGVuZ3RoOyBpIDwgbDsgaSArPSAzKSB7XG4gICAgICAgICAgICB0ZW1wVmVjMy5mcm9tQXJyYXkoYXJyYXksIGkpO1xuICAgICAgICAgICAgbWF4UmFkaXVzU3EgPSBNYXRoLm1heChtYXhSYWRpdXNTcSwgdGhpcy5ib3VuZHMuY2VudGVyLnNxdWFyZWREaXN0YW5jZSh0ZW1wVmVjMykpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5ib3VuZHMucmFkaXVzID0gTWF0aC5zcXJ0KG1heFJhZGl1c1NxKTtcbiAgICB9XG5cbiAgICByZW1vdmUoKSB7XG4gICAgICAgIGlmICh0aGlzLnZhbykgdGhpcy5nbC5yZW5kZXJlci5kZWxldGVWZXJ0ZXhBcnJheSh0aGlzLnZhbyk7XG4gICAgICAgIGZvciAobGV0IGtleSBpbiB0aGlzLmF0dHJpYnV0ZXMpIHtcbiAgICAgICAgICAgIHRoaXMuZ2wuZGVsZXRlQnVmZmVyKHRoaXMuYXR0cmlidXRlc1trZXldLmJ1ZmZlcik7XG4gICAgICAgICAgICBkZWxldGUgdGhpcy5hdHRyaWJ1dGVzW2tleV07XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCJpbXBvcnQgeyBUcmFuc2Zvcm0gfSBmcm9tICcuL1RyYW5zZm9ybS5qcyc7XG5pbXBvcnQgeyBNYXQzIH0gZnJvbSAnLi4vbWF0aC9NYXQzLmpzJztcbmltcG9ydCB7IE1hdDQgfSBmcm9tICcuLi9tYXRoL01hdDQuanMnO1xuXG5sZXQgSUQgPSAwO1xuXG5leHBvcnQgY2xhc3MgTWVzaCBleHRlbmRzIFRyYW5zZm9ybSB7XG4gICAgY29uc3RydWN0b3IoZ2wsIHsgZ2VvbWV0cnksIHByb2dyYW0sIG1vZGUgPSBnbC5UUklBTkdMRVMsIGZydXN0dW1DdWxsZWQgPSB0cnVlLCByZW5kZXJPcmRlciA9IDAgfSA9IHt9KSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIGlmICghZ2wuY2FudmFzKSBjb25zb2xlLmVycm9yKCdnbCBub3QgcGFzc2VkIGFzIGZpcnN0IGFyZ3VtZW50IHRvIE1lc2gnKTtcbiAgICAgICAgdGhpcy5nbCA9IGdsO1xuICAgICAgICB0aGlzLmlkID0gSUQrKztcbiAgICAgICAgdGhpcy5nZW9tZXRyeSA9IGdlb21ldHJ5O1xuICAgICAgICB0aGlzLnByb2dyYW0gPSBwcm9ncmFtO1xuICAgICAgICB0aGlzLm1vZGUgPSBtb2RlO1xuXG4gICAgICAgIC8vIFVzZWQgdG8gc2tpcCBmcnVzdHVtIGN1bGxpbmdcbiAgICAgICAgdGhpcy5mcnVzdHVtQ3VsbGVkID0gZnJ1c3R1bUN1bGxlZDtcblxuICAgICAgICAvLyBPdmVycmlkZSBzb3J0aW5nIHRvIGZvcmNlIGFuIG9yZGVyXG4gICAgICAgIHRoaXMucmVuZGVyT3JkZXIgPSByZW5kZXJPcmRlcjtcbiAgICAgICAgdGhpcy5tb2RlbFZpZXdNYXRyaXggPSBuZXcgTWF0NCgpO1xuICAgICAgICB0aGlzLm5vcm1hbE1hdHJpeCA9IG5ldyBNYXQzKCk7XG4gICAgICAgIHRoaXMuYmVmb3JlUmVuZGVyQ2FsbGJhY2tzID0gW107XG4gICAgICAgIHRoaXMuYWZ0ZXJSZW5kZXJDYWxsYmFja3MgPSBbXTtcbiAgICB9XG5cbiAgICBvbkJlZm9yZVJlbmRlcihmKSB7XG4gICAgICAgIHRoaXMuYmVmb3JlUmVuZGVyQ2FsbGJhY2tzLnB1c2goZik7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIG9uQWZ0ZXJSZW5kZXIoZikge1xuICAgICAgICB0aGlzLmFmdGVyUmVuZGVyQ2FsbGJhY2tzLnB1c2goZik7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGRyYXcoeyBjYW1lcmEsIG92ZXJyaWRlUHJvZ3JhbSB9ID0ge30pIHtcbiAgICAgICAgdGhpcy5iZWZvcmVSZW5kZXJDYWxsYmFja3MuZm9yRWFjaCgoZikgPT4gZiAmJiBmKHsgbWVzaDogdGhpcywgY2FtZXJhIH0pKTtcbiAgICAgICAgY29uc3QgdXNlZFByb2dyYW0gPSBvdmVycmlkZVByb2dyYW0gfHwgdGhpcy5wcm9ncmFtO1xuICAgICAgICBpZiAoY2FtZXJhKSB7XG4gICAgICAgICAgICAvLyBBZGQgZW1wdHkgbWF0cml4IHVuaWZvcm1zIHRvIHByb2dyYW0gaWYgdW5zZXRcbiAgICAgICAgICAgIGlmICghdXNlZFByb2dyYW0udW5pZm9ybXMubW9kZWxNYXRyaXgpIHtcbiAgICAgICAgICAgICAgICBPYmplY3QuYXNzaWduKHVzZWRQcm9ncmFtLnVuaWZvcm1zLCB7XG4gICAgICAgICAgICAgICAgICAgIG1vZGVsTWF0cml4OiB7IHZhbHVlOiBudWxsIH0sXG4gICAgICAgICAgICAgICAgICAgIHZpZXdNYXRyaXg6IHsgdmFsdWU6IG51bGwgfSxcbiAgICAgICAgICAgICAgICAgICAgbW9kZWxWaWV3TWF0cml4OiB7IHZhbHVlOiBudWxsIH0sXG4gICAgICAgICAgICAgICAgICAgIG5vcm1hbE1hdHJpeDogeyB2YWx1ZTogbnVsbCB9LFxuICAgICAgICAgICAgICAgICAgICBwcm9qZWN0aW9uTWF0cml4OiB7IHZhbHVlOiBudWxsIH0sXG4gICAgICAgICAgICAgICAgICAgIGNhbWVyYVBvc2l0aW9uOiB7IHZhbHVlOiBudWxsIH0sXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFNldCB0aGUgbWF0cml4IHVuaWZvcm1zXG4gICAgICAgICAgICB1c2VkUHJvZ3JhbS51bmlmb3Jtcy5wcm9qZWN0aW9uTWF0cml4LnZhbHVlID0gY2FtZXJhLnByb2plY3Rpb25NYXRyaXg7XG4gICAgICAgICAgICB1c2VkUHJvZ3JhbS51bmlmb3Jtcy5jYW1lcmFQb3NpdGlvbi52YWx1ZSA9IGNhbWVyYS53b3JsZFBvc2l0aW9uO1xuICAgICAgICAgICAgdXNlZFByb2dyYW0udW5pZm9ybXMudmlld01hdHJpeC52YWx1ZSA9IGNhbWVyYS52aWV3TWF0cml4O1xuICAgICAgICAgICAgdGhpcy5tb2RlbFZpZXdNYXRyaXgubXVsdGlwbHkoY2FtZXJhLnZpZXdNYXRyaXgsIHRoaXMud29ybGRNYXRyaXgpO1xuICAgICAgICAgICAgdGhpcy5ub3JtYWxNYXRyaXguZ2V0Tm9ybWFsTWF0cml4KHRoaXMubW9kZWxWaWV3TWF0cml4KTtcbiAgICAgICAgICAgIHVzZWRQcm9ncmFtLnVuaWZvcm1zLm1vZGVsTWF0cml4LnZhbHVlID0gdGhpcy53b3JsZE1hdHJpeDtcbiAgICAgICAgICAgIHVzZWRQcm9ncmFtLnVuaWZvcm1zLm1vZGVsVmlld01hdHJpeC52YWx1ZSA9IHRoaXMubW9kZWxWaWV3TWF0cml4O1xuICAgICAgICAgICAgdXNlZFByb2dyYW0udW5pZm9ybXMubm9ybWFsTWF0cml4LnZhbHVlID0gdGhpcy5ub3JtYWxNYXRyaXg7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBkZXRlcm1pbmUgaWYgZmFjZXMgbmVlZCB0byBiZSBmbGlwcGVkIC0gd2hlbiBtZXNoIHNjYWxlZCBuZWdhdGl2ZWx5XG4gICAgICAgIGxldCBmbGlwRmFjZXMgPSB1c2VkUHJvZ3JhbS5jdWxsRmFjZSAmJiB0aGlzLndvcmxkTWF0cml4LmRldGVybWluYW50KCkgPCAwO1xuICAgICAgICB1c2VkUHJvZ3JhbS51c2UoeyBmbGlwRmFjZXMgfSk7XG4gICAgICAgIHRoaXMuZ2VvbWV0cnkuZHJhdyh7IG1vZGU6IHRoaXMubW9kZSwgcHJvZ3JhbTogdXNlZFByb2dyYW0gfSk7XG4gICAgICAgIHRoaXMuYWZ0ZXJSZW5kZXJDYWxsYmFja3MuZm9yRWFjaCgoZikgPT4gZiAmJiBmKHsgbWVzaDogdGhpcywgY2FtZXJhIH0pKTtcbiAgICB9XG59XG4iLCIvLyBUT0RPOiB1cGxvYWQgZW1wdHkgdGV4dHVyZSBpZiBudWxsID8gbWF5YmUgbm90XG4vLyBUT0RPOiB1cGxvYWQgaWRlbnRpdHkgbWF0cml4IGlmIG51bGwgP1xuLy8gVE9ETzogc2FtcGxlciBDdWJlXG5cbmxldCBJRCA9IDE7XG5cbi8vIGNhY2hlIG9mIHR5cGVkIGFycmF5cyB1c2VkIHRvIGZsYXR0ZW4gdW5pZm9ybSBhcnJheXNcbmNvbnN0IGFycmF5Q2FjaGVGMzIgPSB7fTtcblxuZXhwb3J0IGNsYXNzIFByb2dyYW0ge1xuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICBnbCxcbiAgICAgICAge1xuICAgICAgICAgICAgdmVydGV4LFxuICAgICAgICAgICAgZnJhZ21lbnQsXG4gICAgICAgICAgICB1bmlmb3JtcyA9IHt9LFxuXG4gICAgICAgICAgICB0cmFuc3BhcmVudCA9IGZhbHNlLFxuICAgICAgICAgICAgY3VsbEZhY2UgPSBnbC5CQUNLLFxuICAgICAgICAgICAgZnJvbnRGYWNlID0gZ2wuQ0NXLFxuICAgICAgICAgICAgZGVwdGhUZXN0ID0gdHJ1ZSxcbiAgICAgICAgICAgIGRlcHRoV3JpdGUgPSB0cnVlLFxuICAgICAgICAgICAgZGVwdGhGdW5jID0gZ2wuTEVTUyxcbiAgICAgICAgfSA9IHt9XG4gICAgKSB7XG4gICAgICAgIGlmICghZ2wuY2FudmFzKSBjb25zb2xlLmVycm9yKCdnbCBub3QgcGFzc2VkIGFzIGZpc3QgYXJndW1lbnQgdG8gUHJvZ3JhbScpO1xuICAgICAgICB0aGlzLmdsID0gZ2w7XG4gICAgICAgIHRoaXMudW5pZm9ybXMgPSB1bmlmb3JtcztcbiAgICAgICAgdGhpcy5pZCA9IElEKys7XG5cbiAgICAgICAgaWYgKCF2ZXJ0ZXgpIGNvbnNvbGUud2FybigndmVydGV4IHNoYWRlciBub3Qgc3VwcGxpZWQnKTtcbiAgICAgICAgaWYgKCFmcmFnbWVudCkgY29uc29sZS53YXJuKCdmcmFnbWVudCBzaGFkZXIgbm90IHN1cHBsaWVkJyk7XG5cbiAgICAgICAgLy8gU3RvcmUgcHJvZ3JhbSBzdGF0ZVxuICAgICAgICB0aGlzLnRyYW5zcGFyZW50ID0gdHJhbnNwYXJlbnQ7XG4gICAgICAgIHRoaXMuY3VsbEZhY2UgPSBjdWxsRmFjZTtcbiAgICAgICAgdGhpcy5mcm9udEZhY2UgPSBmcm9udEZhY2U7XG4gICAgICAgIHRoaXMuZGVwdGhUZXN0ID0gZGVwdGhUZXN0O1xuICAgICAgICB0aGlzLmRlcHRoV3JpdGUgPSBkZXB0aFdyaXRlO1xuICAgICAgICB0aGlzLmRlcHRoRnVuYyA9IGRlcHRoRnVuYztcbiAgICAgICAgdGhpcy5ibGVuZEZ1bmMgPSB7fTtcbiAgICAgICAgdGhpcy5ibGVuZEVxdWF0aW9uID0ge307XG4gICAgICAgIHRoaXMudW5pZm9ybUxvY2F0aW9ucyA9IG5ldyBNYXAoKTtcbiAgICAgICAgdGhpcy5hdHRyaWJ1dGVMb2NhdGlvbnMgPSBuZXcgTWFwKCk7XG5cbiAgICAgICAgLy8gc2V0IGRlZmF1bHQgYmxlbmRGdW5jIGlmIHRyYW5zcGFyZW50IGZsYWdnZWRcbiAgICAgICAgaWYgKHRoaXMudHJhbnNwYXJlbnQgJiYgIXRoaXMuYmxlbmRGdW5jLnNyYykge1xuICAgICAgICAgICAgaWYgKHRoaXMuZ2wucmVuZGVyZXIucHJlbXVsdGlwbGllZEFscGhhKSB0aGlzLnNldEJsZW5kRnVuYyh0aGlzLmdsLk9ORSwgdGhpcy5nbC5PTkVfTUlOVVNfU1JDX0FMUEhBKTtcbiAgICAgICAgICAgIGVsc2UgdGhpcy5zZXRCbGVuZEZ1bmModGhpcy5nbC5TUkNfQUxQSEEsIHRoaXMuZ2wuT05FX01JTlVTX1NSQ19BTFBIQSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBjb21waWxlIHZlcnRleCBzaGFkZXIgYW5kIGxvZyBlcnJvcnNcbiAgICAgICAgY29uc3QgdmVydGV4U2hhZGVyID0gZ2wuY3JlYXRlU2hhZGVyKGdsLlZFUlRFWF9TSEFERVIpO1xuICAgICAgICBnbC5zaGFkZXJTb3VyY2UodmVydGV4U2hhZGVyLCB2ZXJ0ZXgpO1xuICAgICAgICBnbC5jb21waWxlU2hhZGVyKHZlcnRleFNoYWRlcik7XG4gICAgICAgIGlmIChnbC5nZXRTaGFkZXJJbmZvTG9nKHZlcnRleFNoYWRlcikgIT09ICcnKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYCR7Z2wuZ2V0U2hhZGVySW5mb0xvZyh2ZXJ0ZXhTaGFkZXIpfVxcblZlcnRleCBTaGFkZXJcXG4ke2FkZExpbmVOdW1iZXJzKHZlcnRleCl9YCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBjb21waWxlIGZyYWdtZW50IHNoYWRlciBhbmQgbG9nIGVycm9yc1xuICAgICAgICBjb25zdCBmcmFnbWVudFNoYWRlciA9IGdsLmNyZWF0ZVNoYWRlcihnbC5GUkFHTUVOVF9TSEFERVIpO1xuICAgICAgICBnbC5zaGFkZXJTb3VyY2UoZnJhZ21lbnRTaGFkZXIsIGZyYWdtZW50KTtcbiAgICAgICAgZ2wuY29tcGlsZVNoYWRlcihmcmFnbWVudFNoYWRlcik7XG4gICAgICAgIGlmIChnbC5nZXRTaGFkZXJJbmZvTG9nKGZyYWdtZW50U2hhZGVyKSAhPT0gJycpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgJHtnbC5nZXRTaGFkZXJJbmZvTG9nKGZyYWdtZW50U2hhZGVyKX1cXG5GcmFnbWVudCBTaGFkZXJcXG4ke2FkZExpbmVOdW1iZXJzKGZyYWdtZW50KX1gKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGNvbXBpbGUgcHJvZ3JhbSBhbmQgbG9nIGVycm9yc1xuICAgICAgICB0aGlzLnByb2dyYW0gPSBnbC5jcmVhdGVQcm9ncmFtKCk7XG4gICAgICAgIGdsLmF0dGFjaFNoYWRlcih0aGlzLnByb2dyYW0sIHZlcnRleFNoYWRlcik7XG4gICAgICAgIGdsLmF0dGFjaFNoYWRlcih0aGlzLnByb2dyYW0sIGZyYWdtZW50U2hhZGVyKTtcbiAgICAgICAgZ2wubGlua1Byb2dyYW0odGhpcy5wcm9ncmFtKTtcbiAgICAgICAgaWYgKCFnbC5nZXRQcm9ncmFtUGFyYW1ldGVyKHRoaXMucHJvZ3JhbSwgZ2wuTElOS19TVEFUVVMpKSB7XG4gICAgICAgICAgICByZXR1cm4gY29uc29sZS53YXJuKGdsLmdldFByb2dyYW1JbmZvTG9nKHRoaXMucHJvZ3JhbSkpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gUmVtb3ZlIHNoYWRlciBvbmNlIGxpbmtlZFxuICAgICAgICBnbC5kZWxldGVTaGFkZXIodmVydGV4U2hhZGVyKTtcbiAgICAgICAgZ2wuZGVsZXRlU2hhZGVyKGZyYWdtZW50U2hhZGVyKTtcblxuICAgICAgICAvLyBHZXQgYWN0aXZlIHVuaWZvcm0gbG9jYXRpb25zXG4gICAgICAgIGxldCBudW1Vbmlmb3JtcyA9IGdsLmdldFByb2dyYW1QYXJhbWV0ZXIodGhpcy5wcm9ncmFtLCBnbC5BQ1RJVkVfVU5JRk9STVMpO1xuICAgICAgICBmb3IgKGxldCB1SW5kZXggPSAwOyB1SW5kZXggPCBudW1Vbmlmb3JtczsgdUluZGV4KyspIHtcbiAgICAgICAgICAgIGxldCB1bmlmb3JtID0gZ2wuZ2V0QWN0aXZlVW5pZm9ybSh0aGlzLnByb2dyYW0sIHVJbmRleCk7XG4gICAgICAgICAgICB0aGlzLnVuaWZvcm1Mb2NhdGlvbnMuc2V0KHVuaWZvcm0sIGdsLmdldFVuaWZvcm1Mb2NhdGlvbih0aGlzLnByb2dyYW0sIHVuaWZvcm0ubmFtZSkpO1xuXG4gICAgICAgICAgICAvLyBzcGxpdCB1bmlmb3JtcycgbmFtZXMgdG8gc2VwYXJhdGUgYXJyYXkgYW5kIHN0cnVjdCBkZWNsYXJhdGlvbnNcbiAgICAgICAgICAgIGNvbnN0IHNwbGl0ID0gdW5pZm9ybS5uYW1lLm1hdGNoKC8oXFx3KykvZyk7XG5cbiAgICAgICAgICAgIHVuaWZvcm0udW5pZm9ybU5hbWUgPSBzcGxpdFswXTtcblxuICAgICAgICAgICAgaWYgKHNwbGl0Lmxlbmd0aCA9PT0gMykge1xuICAgICAgICAgICAgICAgIHVuaWZvcm0uaXNTdHJ1Y3RBcnJheSA9IHRydWU7XG4gICAgICAgICAgICAgICAgdW5pZm9ybS5zdHJ1Y3RJbmRleCA9IE51bWJlcihzcGxpdFsxXSk7XG4gICAgICAgICAgICAgICAgdW5pZm9ybS5zdHJ1Y3RQcm9wZXJ0eSA9IHNwbGl0WzJdO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChzcGxpdC5sZW5ndGggPT09IDIgJiYgaXNOYU4oTnVtYmVyKHNwbGl0WzFdKSkpIHtcbiAgICAgICAgICAgICAgICB1bmlmb3JtLmlzU3RydWN0ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB1bmlmb3JtLnN0cnVjdFByb3BlcnR5ID0gc3BsaXRbMV07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBHZXQgYWN0aXZlIGF0dHJpYnV0ZSBsb2NhdGlvbnNcbiAgICAgICAgY29uc3QgbG9jYXRpb25zID0gW107XG4gICAgICAgIGNvbnN0IG51bUF0dHJpYnMgPSBnbC5nZXRQcm9ncmFtUGFyYW1ldGVyKHRoaXMucHJvZ3JhbSwgZ2wuQUNUSVZFX0FUVFJJQlVURVMpO1xuICAgICAgICBmb3IgKGxldCBhSW5kZXggPSAwOyBhSW5kZXggPCBudW1BdHRyaWJzOyBhSW5kZXgrKykge1xuICAgICAgICAgICAgY29uc3QgYXR0cmlidXRlID0gZ2wuZ2V0QWN0aXZlQXR0cmliKHRoaXMucHJvZ3JhbSwgYUluZGV4KTtcbiAgICAgICAgICAgIGNvbnN0IGxvY2F0aW9uID0gZ2wuZ2V0QXR0cmliTG9jYXRpb24odGhpcy5wcm9ncmFtLCBhdHRyaWJ1dGUubmFtZSk7XG4gICAgICAgICAgICBsb2NhdGlvbnNbbG9jYXRpb25dID0gYXR0cmlidXRlLm5hbWU7XG4gICAgICAgICAgICB0aGlzLmF0dHJpYnV0ZUxvY2F0aW9ucy5zZXQoYXR0cmlidXRlLCBsb2NhdGlvbik7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5hdHRyaWJ1dGVPcmRlciA9IGxvY2F0aW9ucy5qb2luKCcnKTtcbiAgICB9XG5cbiAgICBzZXRCbGVuZEZ1bmMoc3JjLCBkc3QsIHNyY0FscGhhLCBkc3RBbHBoYSkge1xuICAgICAgICB0aGlzLmJsZW5kRnVuYy5zcmMgPSBzcmM7XG4gICAgICAgIHRoaXMuYmxlbmRGdW5jLmRzdCA9IGRzdDtcbiAgICAgICAgdGhpcy5ibGVuZEZ1bmMuc3JjQWxwaGEgPSBzcmNBbHBoYTtcbiAgICAgICAgdGhpcy5ibGVuZEZ1bmMuZHN0QWxwaGEgPSBkc3RBbHBoYTtcbiAgICAgICAgaWYgKHNyYykgdGhpcy50cmFuc3BhcmVudCA9IHRydWU7XG4gICAgfVxuXG4gICAgc2V0QmxlbmRFcXVhdGlvbihtb2RlUkdCLCBtb2RlQWxwaGEpIHtcbiAgICAgICAgdGhpcy5ibGVuZEVxdWF0aW9uLm1vZGVSR0IgPSBtb2RlUkdCO1xuICAgICAgICB0aGlzLmJsZW5kRXF1YXRpb24ubW9kZUFscGhhID0gbW9kZUFscGhhO1xuICAgIH1cblxuICAgIGFwcGx5U3RhdGUoKSB7XG4gICAgICAgIGlmICh0aGlzLmRlcHRoVGVzdCkgdGhpcy5nbC5yZW5kZXJlci5lbmFibGUodGhpcy5nbC5ERVBUSF9URVNUKTtcbiAgICAgICAgZWxzZSB0aGlzLmdsLnJlbmRlcmVyLmRpc2FibGUodGhpcy5nbC5ERVBUSF9URVNUKTtcblxuICAgICAgICBpZiAodGhpcy5jdWxsRmFjZSkgdGhpcy5nbC5yZW5kZXJlci5lbmFibGUodGhpcy5nbC5DVUxMX0ZBQ0UpO1xuICAgICAgICBlbHNlIHRoaXMuZ2wucmVuZGVyZXIuZGlzYWJsZSh0aGlzLmdsLkNVTExfRkFDRSk7XG5cbiAgICAgICAgaWYgKHRoaXMuYmxlbmRGdW5jLnNyYykgdGhpcy5nbC5yZW5kZXJlci5lbmFibGUodGhpcy5nbC5CTEVORCk7XG4gICAgICAgIGVsc2UgdGhpcy5nbC5yZW5kZXJlci5kaXNhYmxlKHRoaXMuZ2wuQkxFTkQpO1xuXG4gICAgICAgIGlmICh0aGlzLmN1bGxGYWNlKSB0aGlzLmdsLnJlbmRlcmVyLnNldEN1bGxGYWNlKHRoaXMuY3VsbEZhY2UpO1xuICAgICAgICB0aGlzLmdsLnJlbmRlcmVyLnNldEZyb250RmFjZSh0aGlzLmZyb250RmFjZSk7XG4gICAgICAgIHRoaXMuZ2wucmVuZGVyZXIuc2V0RGVwdGhNYXNrKHRoaXMuZGVwdGhXcml0ZSk7XG4gICAgICAgIHRoaXMuZ2wucmVuZGVyZXIuc2V0RGVwdGhGdW5jKHRoaXMuZGVwdGhGdW5jKTtcbiAgICAgICAgaWYgKHRoaXMuYmxlbmRGdW5jLnNyYylcbiAgICAgICAgICAgIHRoaXMuZ2wucmVuZGVyZXIuc2V0QmxlbmRGdW5jKHRoaXMuYmxlbmRGdW5jLnNyYywgdGhpcy5ibGVuZEZ1bmMuZHN0LCB0aGlzLmJsZW5kRnVuYy5zcmNBbHBoYSwgdGhpcy5ibGVuZEZ1bmMuZHN0QWxwaGEpO1xuICAgICAgICB0aGlzLmdsLnJlbmRlcmVyLnNldEJsZW5kRXF1YXRpb24odGhpcy5ibGVuZEVxdWF0aW9uLm1vZGVSR0IsIHRoaXMuYmxlbmRFcXVhdGlvbi5tb2RlQWxwaGEpO1xuICAgIH1cblxuICAgIHVzZSh7IGZsaXBGYWNlcyA9IGZhbHNlIH0gPSB7fSkge1xuICAgICAgICBsZXQgdGV4dHVyZVVuaXQgPSAtMTtcbiAgICAgICAgY29uc3QgcHJvZ3JhbUFjdGl2ZSA9IHRoaXMuZ2wucmVuZGVyZXIuY3VycmVudFByb2dyYW0gPT09IHRoaXMuaWQ7XG5cbiAgICAgICAgLy8gQXZvaWQgZ2wgY2FsbCBpZiBwcm9ncmFtIGFscmVhZHkgaW4gdXNlXG4gICAgICAgIGlmICghcHJvZ3JhbUFjdGl2ZSkge1xuICAgICAgICAgICAgdGhpcy5nbC51c2VQcm9ncmFtKHRoaXMucHJvZ3JhbSk7XG4gICAgICAgICAgICB0aGlzLmdsLnJlbmRlcmVyLmN1cnJlbnRQcm9ncmFtID0gdGhpcy5pZDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFNldCBvbmx5IHRoZSBhY3RpdmUgdW5pZm9ybXMgZm91bmQgaW4gdGhlIHNoYWRlclxuICAgICAgICB0aGlzLnVuaWZvcm1Mb2NhdGlvbnMuZm9yRWFjaCgobG9jYXRpb24sIGFjdGl2ZVVuaWZvcm0pID0+IHtcbiAgICAgICAgICAgIGxldCBuYW1lID0gYWN0aXZlVW5pZm9ybS51bmlmb3JtTmFtZTtcblxuICAgICAgICAgICAgLy8gZ2V0IHN1cHBsaWVkIHVuaWZvcm1cbiAgICAgICAgICAgIGxldCB1bmlmb3JtID0gdGhpcy51bmlmb3Jtc1tuYW1lXTtcblxuICAgICAgICAgICAgLy8gRm9yIHN0cnVjdHMsIGdldCB0aGUgc3BlY2lmaWMgcHJvcGVydHkgaW5zdGVhZCBvZiB0aGUgZW50aXJlIG9iamVjdFxuICAgICAgICAgICAgaWYgKGFjdGl2ZVVuaWZvcm0uaXNTdHJ1Y3QpIHtcbiAgICAgICAgICAgICAgICB1bmlmb3JtID0gdW5pZm9ybVthY3RpdmVVbmlmb3JtLnN0cnVjdFByb3BlcnR5XTtcbiAgICAgICAgICAgICAgICBuYW1lICs9IGAuJHthY3RpdmVVbmlmb3JtLnN0cnVjdFByb3BlcnR5fWA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoYWN0aXZlVW5pZm9ybS5pc1N0cnVjdEFycmF5KSB7XG4gICAgICAgICAgICAgICAgdW5pZm9ybSA9IHVuaWZvcm1bYWN0aXZlVW5pZm9ybS5zdHJ1Y3RJbmRleF1bYWN0aXZlVW5pZm9ybS5zdHJ1Y3RQcm9wZXJ0eV07XG4gICAgICAgICAgICAgICAgbmFtZSArPSBgWyR7YWN0aXZlVW5pZm9ybS5zdHJ1Y3RJbmRleH1dLiR7YWN0aXZlVW5pZm9ybS5zdHJ1Y3RQcm9wZXJ0eX1gO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIXVuaWZvcm0pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gd2FybihgQWN0aXZlIHVuaWZvcm0gJHtuYW1lfSBoYXMgbm90IGJlZW4gc3VwcGxpZWRgKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHVuaWZvcm0gJiYgdW5pZm9ybS52YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHdhcm4oYCR7bmFtZX0gdW5pZm9ybSBpcyBtaXNzaW5nIGEgdmFsdWUgcGFyYW1ldGVyYCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh1bmlmb3JtLnZhbHVlLnRleHR1cmUpIHtcbiAgICAgICAgICAgICAgICB0ZXh0dXJlVW5pdCA9IHRleHR1cmVVbml0ICsgMTtcblxuICAgICAgICAgICAgICAgIC8vIENoZWNrIGlmIHRleHR1cmUgbmVlZHMgdG8gYmUgdXBkYXRlZFxuICAgICAgICAgICAgICAgIHVuaWZvcm0udmFsdWUudXBkYXRlKHRleHR1cmVVbml0KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gc2V0VW5pZm9ybSh0aGlzLmdsLCBhY3RpdmVVbmlmb3JtLnR5cGUsIGxvY2F0aW9uLCB0ZXh0dXJlVW5pdCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIEZvciB0ZXh0dXJlIGFycmF5cywgc2V0IHVuaWZvcm0gYXMgYW4gYXJyYXkgb2YgdGV4dHVyZSB1bml0cyBpbnN0ZWFkIG9mIGp1c3Qgb25lXG4gICAgICAgICAgICBpZiAodW5pZm9ybS52YWx1ZS5sZW5ndGggJiYgdW5pZm9ybS52YWx1ZVswXS50ZXh0dXJlKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgdGV4dHVyZVVuaXRzID0gW107XG4gICAgICAgICAgICAgICAgdW5pZm9ybS52YWx1ZS5mb3JFYWNoKCh2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0ZXh0dXJlVW5pdCA9IHRleHR1cmVVbml0ICsgMTtcbiAgICAgICAgICAgICAgICAgICAgdmFsdWUudXBkYXRlKHRleHR1cmVVbml0KTtcbiAgICAgICAgICAgICAgICAgICAgdGV4dHVyZVVuaXRzLnB1c2godGV4dHVyZVVuaXQpO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHNldFVuaWZvcm0odGhpcy5nbCwgYWN0aXZlVW5pZm9ybS50eXBlLCBsb2NhdGlvbiwgdGV4dHVyZVVuaXRzKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgc2V0VW5pZm9ybSh0aGlzLmdsLCBhY3RpdmVVbmlmb3JtLnR5cGUsIGxvY2F0aW9uLCB1bmlmb3JtLnZhbHVlKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5hcHBseVN0YXRlKCk7XG4gICAgICAgIGlmIChmbGlwRmFjZXMpIHRoaXMuZ2wucmVuZGVyZXIuc2V0RnJvbnRGYWNlKHRoaXMuZnJvbnRGYWNlID09PSB0aGlzLmdsLkNDVyA/IHRoaXMuZ2wuQ1cgOiB0aGlzLmdsLkNDVyk7XG4gICAgfVxuXG4gICAgcmVtb3ZlKCkge1xuICAgICAgICB0aGlzLmdsLmRlbGV0ZVByb2dyYW0odGhpcy5wcm9ncmFtKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIHNldFVuaWZvcm0oZ2wsIHR5cGUsIGxvY2F0aW9uLCB2YWx1ZSkge1xuICAgIHZhbHVlID0gdmFsdWUubGVuZ3RoID8gZmxhdHRlbih2YWx1ZSkgOiB2YWx1ZTtcbiAgICBjb25zdCBzZXRWYWx1ZSA9IGdsLnJlbmRlcmVyLnN0YXRlLnVuaWZvcm1Mb2NhdGlvbnMuZ2V0KGxvY2F0aW9uKTtcblxuICAgIC8vIEF2b2lkIHJlZHVuZGFudCB1bmlmb3JtIGNvbW1hbmRzXG4gICAgaWYgKHZhbHVlLmxlbmd0aCkge1xuICAgICAgICBpZiAoc2V0VmFsdWUgPT09IHVuZGVmaW5lZCB8fCBzZXRWYWx1ZS5sZW5ndGggIT09IHZhbHVlLmxlbmd0aCkge1xuICAgICAgICAgICAgLy8gY2xvbmUgYXJyYXkgdG8gc3RvcmUgYXMgY2FjaGVcbiAgICAgICAgICAgIGdsLnJlbmRlcmVyLnN0YXRlLnVuaWZvcm1Mb2NhdGlvbnMuc2V0KGxvY2F0aW9uLCB2YWx1ZS5zbGljZSgwKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAoYXJyYXlzRXF1YWwoc2V0VmFsdWUsIHZhbHVlKSkgcmV0dXJuO1xuXG4gICAgICAgICAgICAvLyBVcGRhdGUgY2FjaGVkIGFycmF5IHZhbHVlc1xuICAgICAgICAgICAgc2V0VmFsdWUuc2V0ID8gc2V0VmFsdWUuc2V0KHZhbHVlKSA6IHNldEFycmF5KHNldFZhbHVlLCB2YWx1ZSk7XG4gICAgICAgICAgICBnbC5yZW5kZXJlci5zdGF0ZS51bmlmb3JtTG9jYXRpb25zLnNldChsb2NhdGlvbiwgc2V0VmFsdWUpO1xuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKHNldFZhbHVlID09PSB2YWx1ZSkgcmV0dXJuO1xuICAgICAgICBnbC5yZW5kZXJlci5zdGF0ZS51bmlmb3JtTG9jYXRpb25zLnNldChsb2NhdGlvbiwgdmFsdWUpO1xuICAgIH1cblxuICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgICBjYXNlIDUxMjY6XG4gICAgICAgICAgICByZXR1cm4gdmFsdWUubGVuZ3RoID8gZ2wudW5pZm9ybTFmdihsb2NhdGlvbiwgdmFsdWUpIDogZ2wudW5pZm9ybTFmKGxvY2F0aW9uLCB2YWx1ZSk7IC8vIEZMT0FUXG4gICAgICAgIGNhc2UgMzU2NjQ6XG4gICAgICAgICAgICByZXR1cm4gZ2wudW5pZm9ybTJmdihsb2NhdGlvbiwgdmFsdWUpOyAvLyBGTE9BVF9WRUMyXG4gICAgICAgIGNhc2UgMzU2NjU6XG4gICAgICAgICAgICByZXR1cm4gZ2wudW5pZm9ybTNmdihsb2NhdGlvbiwgdmFsdWUpOyAvLyBGTE9BVF9WRUMzXG4gICAgICAgIGNhc2UgMzU2NjY6XG4gICAgICAgICAgICByZXR1cm4gZ2wudW5pZm9ybTRmdihsb2NhdGlvbiwgdmFsdWUpOyAvLyBGTE9BVF9WRUM0XG4gICAgICAgIGNhc2UgMzU2NzA6IC8vIEJPT0xcbiAgICAgICAgY2FzZSA1MTI0OiAvLyBJTlRcbiAgICAgICAgY2FzZSAzNTY3ODogLy8gU0FNUExFUl8yRFxuICAgICAgICBjYXNlIDM1NjgwOlxuICAgICAgICAgICAgcmV0dXJuIHZhbHVlLmxlbmd0aCA/IGdsLnVuaWZvcm0xaXYobG9jYXRpb24sIHZhbHVlKSA6IGdsLnVuaWZvcm0xaShsb2NhdGlvbiwgdmFsdWUpOyAvLyBTQU1QTEVSX0NVQkVcbiAgICAgICAgY2FzZSAzNTY3MTogLy8gQk9PTF9WRUMyXG4gICAgICAgIGNhc2UgMzU2Njc6XG4gICAgICAgICAgICByZXR1cm4gZ2wudW5pZm9ybTJpdihsb2NhdGlvbiwgdmFsdWUpOyAvLyBJTlRfVkVDMlxuICAgICAgICBjYXNlIDM1NjcyOiAvLyBCT09MX1ZFQzNcbiAgICAgICAgY2FzZSAzNTY2ODpcbiAgICAgICAgICAgIHJldHVybiBnbC51bmlmb3JtM2l2KGxvY2F0aW9uLCB2YWx1ZSk7IC8vIElOVF9WRUMzXG4gICAgICAgIGNhc2UgMzU2NzM6IC8vIEJPT0xfVkVDNFxuICAgICAgICBjYXNlIDM1NjY5OlxuICAgICAgICAgICAgcmV0dXJuIGdsLnVuaWZvcm00aXYobG9jYXRpb24sIHZhbHVlKTsgLy8gSU5UX1ZFQzRcbiAgICAgICAgY2FzZSAzNTY3NDpcbiAgICAgICAgICAgIHJldHVybiBnbC51bmlmb3JtTWF0cml4MmZ2KGxvY2F0aW9uLCBmYWxzZSwgdmFsdWUpOyAvLyBGTE9BVF9NQVQyXG4gICAgICAgIGNhc2UgMzU2NzU6XG4gICAgICAgICAgICByZXR1cm4gZ2wudW5pZm9ybU1hdHJpeDNmdihsb2NhdGlvbiwgZmFsc2UsIHZhbHVlKTsgLy8gRkxPQVRfTUFUM1xuICAgICAgICBjYXNlIDM1Njc2OlxuICAgICAgICAgICAgcmV0dXJuIGdsLnVuaWZvcm1NYXRyaXg0ZnYobG9jYXRpb24sIGZhbHNlLCB2YWx1ZSk7IC8vIEZMT0FUX01BVDRcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGFkZExpbmVOdW1iZXJzKHN0cmluZykge1xuICAgIGxldCBsaW5lcyA9IHN0cmluZy5zcGxpdCgnXFxuJyk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsaW5lcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBsaW5lc1tpXSA9IGkgKyAxICsgJzogJyArIGxpbmVzW2ldO1xuICAgIH1cbiAgICByZXR1cm4gbGluZXMuam9pbignXFxuJyk7XG59XG5cbmZ1bmN0aW9uIGZsYXR0ZW4oYSkge1xuICAgIGNvbnN0IGFycmF5TGVuID0gYS5sZW5ndGg7XG4gICAgY29uc3QgdmFsdWVMZW4gPSBhWzBdLmxlbmd0aDtcbiAgICBpZiAodmFsdWVMZW4gPT09IHVuZGVmaW5lZCkgcmV0dXJuIGE7XG4gICAgY29uc3QgbGVuZ3RoID0gYXJyYXlMZW4gKiB2YWx1ZUxlbjtcbiAgICBsZXQgdmFsdWUgPSBhcnJheUNhY2hlRjMyW2xlbmd0aF07XG4gICAgaWYgKCF2YWx1ZSkgYXJyYXlDYWNoZUYzMltsZW5ndGhdID0gdmFsdWUgPSBuZXcgRmxvYXQzMkFycmF5KGxlbmd0aCk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhcnJheUxlbjsgaSsrKSB2YWx1ZS5zZXQoYVtpXSwgaSAqIHZhbHVlTGVuKTtcbiAgICByZXR1cm4gdmFsdWU7XG59XG5cbmZ1bmN0aW9uIGFycmF5c0VxdWFsKGEsIGIpIHtcbiAgICBpZiAoYS5sZW5ndGggIT09IGIubGVuZ3RoKSByZXR1cm4gZmFsc2U7XG4gICAgZm9yIChsZXQgaSA9IDAsIGwgPSBhLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICBpZiAoYVtpXSAhPT0gYltpXSkgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbn1cblxuZnVuY3Rpb24gc2V0QXJyYXkoYSwgYikge1xuICAgIGZvciAobGV0IGkgPSAwLCBsID0gYS5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgYVtpXSA9IGJbaV07XG4gICAgfVxufVxuXG5sZXQgd2FybkNvdW50ID0gMDtcbmZ1bmN0aW9uIHdhcm4obWVzc2FnZSkge1xuICAgIGlmICh3YXJuQ291bnQgPiAxMDApIHJldHVybjtcbiAgICBjb25zb2xlLndhcm4obWVzc2FnZSk7XG4gICAgd2FybkNvdW50Kys7XG4gICAgaWYgKHdhcm5Db3VudCA+IDEwMCkgY29uc29sZS53YXJuKCdNb3JlIHRoYW4gMTAwIHByb2dyYW0gd2FybmluZ3MgLSBzdG9wcGluZyBsb2dzLicpO1xufVxuIiwiLy8gVE9ETzogbXVsdGkgdGFyZ2V0IHJlbmRlcmluZ1xuLy8gVE9ETzogdGVzdCBzdGVuY2lsIGFuZCBkZXB0aFxuLy8gVE9ETzogZGVzdHJveVxuLy8gVE9ETzogYmxpdCBvbiByZXNpemU/XG5pbXBvcnQgeyBUZXh0dXJlIH0gZnJvbSAnLi9UZXh0dXJlLmpzJztcblxuZXhwb3J0IGNsYXNzIFJlbmRlclRhcmdldCB7XG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIGdsLFxuICAgICAgICB7XG4gICAgICAgICAgICB3aWR0aCA9IGdsLmNhbnZhcy53aWR0aCxcbiAgICAgICAgICAgIGhlaWdodCA9IGdsLmNhbnZhcy5oZWlnaHQsXG4gICAgICAgICAgICB0YXJnZXQgPSBnbC5GUkFNRUJVRkZFUixcbiAgICAgICAgICAgIGNvbG9yID0gMSwgLy8gbnVtYmVyIG9mIGNvbG9yIGF0dGFjaG1lbnRzXG4gICAgICAgICAgICBkZXB0aCA9IHRydWUsXG4gICAgICAgICAgICBzdGVuY2lsID0gZmFsc2UsXG4gICAgICAgICAgICBkZXB0aFRleHR1cmUgPSBmYWxzZSwgLy8gbm90ZSAtIHN0ZW5jaWwgYnJlYWtzXG4gICAgICAgICAgICB3cmFwUyA9IGdsLkNMQU1QX1RPX0VER0UsXG4gICAgICAgICAgICB3cmFwVCA9IGdsLkNMQU1QX1RPX0VER0UsXG4gICAgICAgICAgICBtaW5GaWx0ZXIgPSBnbC5MSU5FQVIsXG4gICAgICAgICAgICBtYWdGaWx0ZXIgPSBtaW5GaWx0ZXIsXG4gICAgICAgICAgICB0eXBlID0gZ2wuVU5TSUdORURfQllURSxcbiAgICAgICAgICAgIGZvcm1hdCA9IGdsLlJHQkEsXG4gICAgICAgICAgICBpbnRlcm5hbEZvcm1hdCA9IGZvcm1hdCxcbiAgICAgICAgICAgIHVucGFja0FsaWdubWVudCxcbiAgICAgICAgICAgIHByZW11bHRpcGx5QWxwaGEsXG4gICAgICAgIH0gPSB7fVxuICAgICkge1xuICAgICAgICB0aGlzLmdsID0gZ2w7XG4gICAgICAgIHRoaXMud2lkdGggPSB3aWR0aDtcbiAgICAgICAgdGhpcy5oZWlnaHQgPSBoZWlnaHQ7XG4gICAgICAgIHRoaXMuZGVwdGggPSBkZXB0aDtcbiAgICAgICAgdGhpcy5idWZmZXIgPSB0aGlzLmdsLmNyZWF0ZUZyYW1lYnVmZmVyKCk7XG4gICAgICAgIHRoaXMudGFyZ2V0ID0gdGFyZ2V0O1xuICAgICAgICB0aGlzLmdsLmJpbmRGcmFtZWJ1ZmZlcih0aGlzLnRhcmdldCwgdGhpcy5idWZmZXIpO1xuXG4gICAgICAgIHRoaXMudGV4dHVyZXMgPSBbXTtcbiAgICAgICAgY29uc3QgZHJhd0J1ZmZlcnMgPSBbXTtcblxuICAgICAgICAvLyBjcmVhdGUgYW5kIGF0dGFjaCByZXF1aXJlZCBudW0gb2YgY29sb3IgdGV4dHVyZXNcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb2xvcjsgaSsrKSB7XG4gICAgICAgICAgICB0aGlzLnRleHR1cmVzLnB1c2goXG4gICAgICAgICAgICAgICAgbmV3IFRleHR1cmUoZ2wsIHtcbiAgICAgICAgICAgICAgICAgICAgd2lkdGgsXG4gICAgICAgICAgICAgICAgICAgIGhlaWdodCxcbiAgICAgICAgICAgICAgICAgICAgd3JhcFMsXG4gICAgICAgICAgICAgICAgICAgIHdyYXBULFxuICAgICAgICAgICAgICAgICAgICBtaW5GaWx0ZXIsXG4gICAgICAgICAgICAgICAgICAgIG1hZ0ZpbHRlcixcbiAgICAgICAgICAgICAgICAgICAgdHlwZSxcbiAgICAgICAgICAgICAgICAgICAgZm9ybWF0LFxuICAgICAgICAgICAgICAgICAgICBpbnRlcm5hbEZvcm1hdCxcbiAgICAgICAgICAgICAgICAgICAgdW5wYWNrQWxpZ25tZW50LFxuICAgICAgICAgICAgICAgICAgICBwcmVtdWx0aXBseUFscGhhLFxuICAgICAgICAgICAgICAgICAgICBmbGlwWTogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIGdlbmVyYXRlTWlwbWFwczogZmFsc2UsXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICB0aGlzLnRleHR1cmVzW2ldLnVwZGF0ZSgpO1xuICAgICAgICAgICAgdGhpcy5nbC5mcmFtZWJ1ZmZlclRleHR1cmUyRCh0aGlzLnRhcmdldCwgdGhpcy5nbC5DT0xPUl9BVFRBQ0hNRU5UMCArIGksIHRoaXMuZ2wuVEVYVFVSRV8yRCwgdGhpcy50ZXh0dXJlc1tpXS50ZXh0dXJlLCAwIC8qIGxldmVsICovKTtcbiAgICAgICAgICAgIGRyYXdCdWZmZXJzLnB1c2godGhpcy5nbC5DT0xPUl9BVFRBQ0hNRU5UMCArIGkpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gRm9yIG11bHRpLXJlbmRlciB0YXJnZXRzIHNoYWRlciBhY2Nlc3NcbiAgICAgICAgaWYgKGRyYXdCdWZmZXJzLmxlbmd0aCA+IDEpIHRoaXMuZ2wucmVuZGVyZXIuZHJhd0J1ZmZlcnMoZHJhd0J1ZmZlcnMpO1xuXG4gICAgICAgIC8vIGFsaWFzIGZvciBtYWpvcml0eSBvZiB1c2UgY2FzZXNcbiAgICAgICAgdGhpcy50ZXh0dXJlID0gdGhpcy50ZXh0dXJlc1swXTtcblxuICAgICAgICAvLyBub3RlIGRlcHRoIHRleHR1cmVzIGJyZWFrIHN0ZW5jaWwgLSBzbyBjYW4ndCB1c2UgdG9nZXRoZXJcbiAgICAgICAgaWYgKGRlcHRoVGV4dHVyZSAmJiAodGhpcy5nbC5yZW5kZXJlci5pc1dlYmdsMiB8fCB0aGlzLmdsLnJlbmRlcmVyLmdldEV4dGVuc2lvbignV0VCR0xfZGVwdGhfdGV4dHVyZScpKSkge1xuICAgICAgICAgICAgdGhpcy5kZXB0aFRleHR1cmUgPSBuZXcgVGV4dHVyZShnbCwge1xuICAgICAgICAgICAgICAgIHdpZHRoLFxuICAgICAgICAgICAgICAgIGhlaWdodCxcbiAgICAgICAgICAgICAgICBtaW5GaWx0ZXI6IHRoaXMuZ2wuTkVBUkVTVCxcbiAgICAgICAgICAgICAgICBtYWdGaWx0ZXI6IHRoaXMuZ2wuTkVBUkVTVCxcbiAgICAgICAgICAgICAgICBmb3JtYXQ6IHRoaXMuZ2wuREVQVEhfQ09NUE9ORU5ULFxuICAgICAgICAgICAgICAgIGludGVybmFsRm9ybWF0OiBnbC5yZW5kZXJlci5pc1dlYmdsMiA/IHRoaXMuZ2wuREVQVEhfQ09NUE9ORU5UMTYgOiB0aGlzLmdsLkRFUFRIX0NPTVBPTkVOVCxcbiAgICAgICAgICAgICAgICB0eXBlOiB0aGlzLmdsLlVOU0lHTkVEX0lOVCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy5kZXB0aFRleHR1cmUudXBkYXRlKCk7XG4gICAgICAgICAgICB0aGlzLmdsLmZyYW1lYnVmZmVyVGV4dHVyZTJEKHRoaXMudGFyZ2V0LCB0aGlzLmdsLkRFUFRIX0FUVEFDSE1FTlQsIHRoaXMuZ2wuVEVYVFVSRV8yRCwgdGhpcy5kZXB0aFRleHR1cmUudGV4dHVyZSwgMCAvKiBsZXZlbCAqLyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBSZW5kZXIgYnVmZmVyc1xuICAgICAgICAgICAgaWYgKGRlcHRoICYmICFzdGVuY2lsKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kZXB0aEJ1ZmZlciA9IHRoaXMuZ2wuY3JlYXRlUmVuZGVyYnVmZmVyKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5nbC5iaW5kUmVuZGVyYnVmZmVyKHRoaXMuZ2wuUkVOREVSQlVGRkVSLCB0aGlzLmRlcHRoQnVmZmVyKTtcbiAgICAgICAgICAgICAgICB0aGlzLmdsLnJlbmRlcmJ1ZmZlclN0b3JhZ2UodGhpcy5nbC5SRU5ERVJCVUZGRVIsIHRoaXMuZ2wuREVQVEhfQ09NUE9ORU5UMTYsIHdpZHRoLCBoZWlnaHQpO1xuICAgICAgICAgICAgICAgIHRoaXMuZ2wuZnJhbWVidWZmZXJSZW5kZXJidWZmZXIodGhpcy50YXJnZXQsIHRoaXMuZ2wuREVQVEhfQVRUQUNITUVOVCwgdGhpcy5nbC5SRU5ERVJCVUZGRVIsIHRoaXMuZGVwdGhCdWZmZXIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoc3RlbmNpbCAmJiAhZGVwdGgpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnN0ZW5jaWxCdWZmZXIgPSB0aGlzLmdsLmNyZWF0ZVJlbmRlcmJ1ZmZlcigpO1xuICAgICAgICAgICAgICAgIHRoaXMuZ2wuYmluZFJlbmRlcmJ1ZmZlcih0aGlzLmdsLlJFTkRFUkJVRkZFUiwgdGhpcy5zdGVuY2lsQnVmZmVyKTtcbiAgICAgICAgICAgICAgICB0aGlzLmdsLnJlbmRlcmJ1ZmZlclN0b3JhZ2UodGhpcy5nbC5SRU5ERVJCVUZGRVIsIHRoaXMuZ2wuU1RFTkNJTF9JTkRFWDgsIHdpZHRoLCBoZWlnaHQpO1xuICAgICAgICAgICAgICAgIHRoaXMuZ2wuZnJhbWVidWZmZXJSZW5kZXJidWZmZXIodGhpcy50YXJnZXQsIHRoaXMuZ2wuU1RFTkNJTF9BVFRBQ0hNRU5ULCB0aGlzLmdsLlJFTkRFUkJVRkZFUiwgdGhpcy5zdGVuY2lsQnVmZmVyKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGRlcHRoICYmIHN0ZW5jaWwpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRlcHRoU3RlbmNpbEJ1ZmZlciA9IHRoaXMuZ2wuY3JlYXRlUmVuZGVyYnVmZmVyKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5nbC5iaW5kUmVuZGVyYnVmZmVyKHRoaXMuZ2wuUkVOREVSQlVGRkVSLCB0aGlzLmRlcHRoU3RlbmNpbEJ1ZmZlcik7XG4gICAgICAgICAgICAgICAgdGhpcy5nbC5yZW5kZXJidWZmZXJTdG9yYWdlKHRoaXMuZ2wuUkVOREVSQlVGRkVSLCB0aGlzLmdsLkRFUFRIX1NURU5DSUwsIHdpZHRoLCBoZWlnaHQpO1xuICAgICAgICAgICAgICAgIHRoaXMuZ2wuZnJhbWVidWZmZXJSZW5kZXJidWZmZXIodGhpcy50YXJnZXQsIHRoaXMuZ2wuREVQVEhfU1RFTkNJTF9BVFRBQ0hNRU5ULCB0aGlzLmdsLlJFTkRFUkJVRkZFUiwgdGhpcy5kZXB0aFN0ZW5jaWxCdWZmZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5nbC5iaW5kRnJhbWVidWZmZXIodGhpcy50YXJnZXQsIG51bGwpO1xuICAgIH1cblxuICAgIGRpc3Bvc2UoKSB7XG4gICAgICAgIHRoaXMudGV4dHVyZXMuZm9yRWFjaCggKHRleHR1cmUpID0+IHtcbiAgICAgICAgICAgIHRleHR1cmUuZGlzcG9zZSgpO1xuICAgICAgICB9KVxuICAgICAgICB0aGlzLmRlcHRoVGV4dHVyZSAmJiB0aGlzLmRlcHRoVGV4dHVyZS5kaXNwb3NlKCk7XG4gICAgICAgIHRoaXMuZGVwdGhCdWZmZXIgJiYgdGhpcy5nbC5kZWxldGVSZW5kZXJidWZmZXIodGhpcy5kZXB0aEJ1ZmZlcik7XG4gICAgICAgIHRoaXMuc3RlbmNpbEJ1ZmZlciAmJiB0aGlzLmdsLmRlbGV0ZVJlbmRlcmJ1ZmZlcih0aGlzLnN0ZW5jaWxCdWZmZXIpO1xuICAgICAgICB0aGlzLmRlcHRoU3RlbmNpbEJ1ZmZlciAmJiB0aGlzLmdsLmRlbGV0ZVJlbmRlcmJ1ZmZlcih0aGlzLmRlcHRoU3RlbmNpbEJ1ZmZlcik7XG4gICAgICAgIHRoaXMuZ2wuZGVsZXRlRnJhbWVidWZmZXIodGhpcy5idWZmZXIpO1xuICAgIH1cbn1cbiIsImltcG9ydCB7IFZlYzMgfSBmcm9tICcuLi9tYXRoL1ZlYzMuanMnO1xuXG4vLyBUT0RPOiBIYW5kbGUgY29udGV4dCBsb3NzIGh0dHBzOi8vd3d3Lmtocm9ub3Mub3JnL3dlYmdsL3dpa2kvSGFuZGxpbmdDb250ZXh0TG9zdFxuXG4vLyBOb3QgYXV0b21hdGljIC0gZGV2cyB0byB1c2UgdGhlc2UgbWV0aG9kcyBtYW51YWxseVxuLy8gZ2wuY29sb3JNYXNrKCBjb2xvck1hc2ssIGNvbG9yTWFzaywgY29sb3JNYXNrLCBjb2xvck1hc2sgKTtcbi8vIGdsLmNsZWFyQ29sb3IoIHIsIGcsIGIsIGEgKTtcbi8vIGdsLnN0ZW5jaWxNYXNrKCBzdGVuY2lsTWFzayApO1xuLy8gZ2wuc3RlbmNpbEZ1bmMoIHN0ZW5jaWxGdW5jLCBzdGVuY2lsUmVmLCBzdGVuY2lsTWFzayApO1xuLy8gZ2wuc3RlbmNpbE9wKCBzdGVuY2lsRmFpbCwgc3RlbmNpbFpGYWlsLCBzdGVuY2lsWlBhc3MgKTtcbi8vIGdsLmNsZWFyU3RlbmNpbCggc3RlbmNpbCApO1xuXG5jb25zdCB0ZW1wVmVjMyA9IG5ldyBWZWMzKCk7XG5sZXQgSUQgPSAxO1xuXG5leHBvcnQgY2xhc3MgUmVuZGVyZXIge1xuICAgIGNvbnN0cnVjdG9yKHtcbiAgICAgICAgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyksXG4gICAgICAgIHdpZHRoID0gMzAwLFxuICAgICAgICBoZWlnaHQgPSAxNTAsXG4gICAgICAgIGRwciA9IDEsXG4gICAgICAgIGFscGhhID0gZmFsc2UsXG4gICAgICAgIGRlcHRoID0gdHJ1ZSxcbiAgICAgICAgc3RlbmNpbCA9IGZhbHNlLFxuICAgICAgICBhbnRpYWxpYXMgPSBmYWxzZSxcbiAgICAgICAgcHJlbXVsdGlwbGllZEFscGhhID0gZmFsc2UsXG4gICAgICAgIHByZXNlcnZlRHJhd2luZ0J1ZmZlciA9IGZhbHNlLFxuICAgICAgICBwb3dlclByZWZlcmVuY2UgPSAnZGVmYXVsdCcsXG4gICAgICAgIGF1dG9DbGVhciA9IHRydWUsXG4gICAgICAgIHdlYmdsID0gMixcbiAgICB9ID0ge30pIHtcbiAgICAgICAgY29uc3QgYXR0cmlidXRlcyA9IHsgYWxwaGEsIGRlcHRoLCBzdGVuY2lsLCBhbnRpYWxpYXMsIHByZW11bHRpcGxpZWRBbHBoYSwgcHJlc2VydmVEcmF3aW5nQnVmZmVyLCBwb3dlclByZWZlcmVuY2UgfTtcbiAgICAgICAgdGhpcy5kcHIgPSBkcHI7XG4gICAgICAgIHRoaXMuYWxwaGEgPSBhbHBoYTtcbiAgICAgICAgdGhpcy5jb2xvciA9IHRydWU7XG4gICAgICAgIHRoaXMuZGVwdGggPSBkZXB0aDtcbiAgICAgICAgdGhpcy5zdGVuY2lsID0gc3RlbmNpbDtcbiAgICAgICAgdGhpcy5wcmVtdWx0aXBsaWVkQWxwaGEgPSBwcmVtdWx0aXBsaWVkQWxwaGE7XG4gICAgICAgIHRoaXMuYXV0b0NsZWFyID0gYXV0b0NsZWFyO1xuICAgICAgICB0aGlzLmlkID0gSUQrKztcblxuICAgICAgICAvLyBBdHRlbXB0IFdlYkdMMiB1bmxlc3MgZm9yY2VkIHRvIDEsIGlmIG5vdCBzdXBwb3J0ZWQgZmFsbGJhY2sgdG8gV2ViR0wxXG4gICAgICAgIHRoaXMuaXNXZWJnbDIgPSAhIXRoaXMuZ2w7XG4gICAgICAgIGlmICghdGhpcy5nbCkge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBAdHlwZSB7T0dMUmVuZGVyaW5nQ29udGV4dH1cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpcy5nbCA9IGNhbnZhcy5nZXRDb250ZXh0KCd3ZWJnbCcsIGF0dHJpYnV0ZXMpIHx8IGNhbnZhcy5nZXRDb250ZXh0KCdleHBlcmltZW50YWwtd2ViZ2wnLCBhdHRyaWJ1dGVzKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXRoaXMuZ2wpIGNvbnNvbGUuZXJyb3IoJ3VuYWJsZSB0byBjcmVhdGUgd2ViZ2wgY29udGV4dCcpO1xuXG4gICAgICAgIC8vIEF0dGFjaCByZW5kZXJlciB0byBnbCBzbyB0aGF0IGFsbCBjbGFzc2VzIGhhdmUgYWNjZXNzIHRvIGludGVybmFsIHN0YXRlIGZ1bmN0aW9uc1xuICAgICAgICB0aGlzLmdsLnJlbmRlcmVyID0gdGhpcztcblxuICAgICAgICAvLyBpbml0aWFsaXNlIHNpemUgdmFsdWVzXG4gICAgICAgIHRoaXMuc2V0U2l6ZSh3aWR0aCwgaGVpZ2h0KTtcblxuICAgICAgICAvLyBnbCBzdGF0ZSBzdG9yZXMgdG8gYXZvaWQgcmVkdW5kYW50IGNhbGxzIG9uIG1ldGhvZHMgdXNlZCBpbnRlcm5hbGx5XG4gICAgICAgIHRoaXMuc3RhdGUgPSB7fTtcbiAgICAgICAgdGhpcy5zdGF0ZS5ibGVuZEZ1bmMgPSB7IHNyYzogdGhpcy5nbC5PTkUsIGRzdDogdGhpcy5nbC5aRVJPIH07XG4gICAgICAgIHRoaXMuc3RhdGUuYmxlbmRFcXVhdGlvbiA9IHsgbW9kZVJHQjogdGhpcy5nbC5GVU5DX0FERCB9O1xuICAgICAgICB0aGlzLnN0YXRlLmN1bGxGYWNlID0gbnVsbDtcbiAgICAgICAgdGhpcy5zdGF0ZS5mcm9udEZhY2UgPSB0aGlzLmdsLkNDVztcbiAgICAgICAgdGhpcy5zdGF0ZS5kZXB0aE1hc2sgPSB0cnVlO1xuICAgICAgICB0aGlzLnN0YXRlLmRlcHRoRnVuYyA9IHRoaXMuZ2wuTEVTUztcbiAgICAgICAgdGhpcy5zdGF0ZS5wcmVtdWx0aXBseUFscGhhID0gZmFsc2U7XG4gICAgICAgIHRoaXMuc3RhdGUuZmxpcFkgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5zdGF0ZS51bnBhY2tBbGlnbm1lbnQgPSA0O1xuICAgICAgICB0aGlzLnN0YXRlLmZyYW1lYnVmZmVyID0gbnVsbDtcbiAgICAgICAgdGhpcy5zdGF0ZS52aWV3cG9ydCA9IHsgd2lkdGg6IG51bGwsIGhlaWdodDogbnVsbCB9O1xuICAgICAgICB0aGlzLnN0YXRlLnRleHR1cmVVbml0cyA9IFtdO1xuICAgICAgICB0aGlzLnN0YXRlLmFjdGl2ZVRleHR1cmVVbml0ID0gMDtcbiAgICAgICAgdGhpcy5zdGF0ZS5ib3VuZEJ1ZmZlciA9IG51bGw7XG4gICAgICAgIHRoaXMuc3RhdGUudW5pZm9ybUxvY2F0aW9ucyA9IG5ldyBNYXAoKTtcblxuICAgICAgICAvLyBzdG9yZSByZXF1ZXN0ZWQgZXh0ZW5zaW9uc1xuICAgICAgICB0aGlzLmV4dGVuc2lvbnMgPSB7fTtcblxuICAgICAgICAvLyBJbml0aWFsaXNlIGV4dHJhIGZvcm1hdCB0eXBlc1xuICAgICAgICBpZiAodGhpcy5pc1dlYmdsMikge1xuICAgICAgICAgICAgdGhpcy5nZXRFeHRlbnNpb24oJ0VYVF9jb2xvcl9idWZmZXJfZmxvYXQnKTtcbiAgICAgICAgICAgIHRoaXMuZ2V0RXh0ZW5zaW9uKCdPRVNfdGV4dHVyZV9mbG9hdF9saW5lYXInKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuZ2V0RXh0ZW5zaW9uKCdPRVNfdGV4dHVyZV9mbG9hdCcpO1xuICAgICAgICAgICAgdGhpcy5nZXRFeHRlbnNpb24oJ09FU190ZXh0dXJlX2Zsb2F0X2xpbmVhcicpO1xuICAgICAgICAgICAgdGhpcy5nZXRFeHRlbnNpb24oJ09FU190ZXh0dXJlX2hhbGZfZmxvYXQnKTtcbiAgICAgICAgICAgIHRoaXMuZ2V0RXh0ZW5zaW9uKCdPRVNfdGV4dHVyZV9oYWxmX2Zsb2F0X2xpbmVhcicpO1xuICAgICAgICAgICAgdGhpcy5nZXRFeHRlbnNpb24oJ09FU19lbGVtZW50X2luZGV4X3VpbnQnKTtcbiAgICAgICAgICAgIHRoaXMuZ2V0RXh0ZW5zaW9uKCdPRVNfc3RhbmRhcmRfZGVyaXZhdGl2ZXMnKTtcbiAgICAgICAgICAgIHRoaXMuZ2V0RXh0ZW5zaW9uKCdFWFRfc1JHQicpO1xuICAgICAgICAgICAgdGhpcy5nZXRFeHRlbnNpb24oJ1dFQkdMX2RlcHRoX3RleHR1cmUnKTtcbiAgICAgICAgICAgIHRoaXMuZ2V0RXh0ZW5zaW9uKCdXRUJHTF9kcmF3X2J1ZmZlcnMnKTtcbiAgICAgICAgICAgIHRoaXMuZ2V0RXh0ZW5zaW9uKCdXRUJHTF9jb2xvcl9idWZmZXJfZmxvYXQnKTtcbiAgICAgICAgICAgIHRoaXMuZ2V0RXh0ZW5zaW9uKCdFWFRfY29sb3JfYnVmZmVyX2hhbGZfZmxvYXQnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENyZWF0ZSBtZXRob2QgYWxpYXNlcyB1c2luZyBleHRlbnNpb24gKFdlYkdMMSkgb3IgbmF0aXZlIGlmIGF2YWlsYWJsZSAoV2ViR0wyKVxuICAgICAgICB0aGlzLnZlcnRleEF0dHJpYkRpdmlzb3IgPSB0aGlzLmdldEV4dGVuc2lvbignQU5HTEVfaW5zdGFuY2VkX2FycmF5cycsICd2ZXJ0ZXhBdHRyaWJEaXZpc29yJywgJ3ZlcnRleEF0dHJpYkRpdmlzb3JBTkdMRScpO1xuICAgICAgICB0aGlzLmRyYXdBcnJheXNJbnN0YW5jZWQgPSB0aGlzLmdldEV4dGVuc2lvbignQU5HTEVfaW5zdGFuY2VkX2FycmF5cycsICdkcmF3QXJyYXlzSW5zdGFuY2VkJywgJ2RyYXdBcnJheXNJbnN0YW5jZWRBTkdMRScpO1xuICAgICAgICB0aGlzLmRyYXdFbGVtZW50c0luc3RhbmNlZCA9IHRoaXMuZ2V0RXh0ZW5zaW9uKCdBTkdMRV9pbnN0YW5jZWRfYXJyYXlzJywgJ2RyYXdFbGVtZW50c0luc3RhbmNlZCcsICdkcmF3RWxlbWVudHNJbnN0YW5jZWRBTkdMRScpO1xuICAgICAgICB0aGlzLmNyZWF0ZVZlcnRleEFycmF5ID0gdGhpcy5nZXRFeHRlbnNpb24oJ09FU192ZXJ0ZXhfYXJyYXlfb2JqZWN0JywgJ2NyZWF0ZVZlcnRleEFycmF5JywgJ2NyZWF0ZVZlcnRleEFycmF5T0VTJyk7XG4gICAgICAgIHRoaXMuYmluZFZlcnRleEFycmF5ID0gdGhpcy5nZXRFeHRlbnNpb24oJ09FU192ZXJ0ZXhfYXJyYXlfb2JqZWN0JywgJ2JpbmRWZXJ0ZXhBcnJheScsICdiaW5kVmVydGV4QXJyYXlPRVMnKTtcbiAgICAgICAgdGhpcy5kZWxldGVWZXJ0ZXhBcnJheSA9IHRoaXMuZ2V0RXh0ZW5zaW9uKCdPRVNfdmVydGV4X2FycmF5X29iamVjdCcsICdkZWxldGVWZXJ0ZXhBcnJheScsICdkZWxldGVWZXJ0ZXhBcnJheU9FUycpO1xuICAgICAgICB0aGlzLmRyYXdCdWZmZXJzID0gdGhpcy5nZXRFeHRlbnNpb24oJ1dFQkdMX2RyYXdfYnVmZmVycycsICdkcmF3QnVmZmVycycsICdkcmF3QnVmZmVyc1dFQkdMJyk7XG5cbiAgICAgICAgLy8gU3RvcmUgZGV2aWNlIHBhcmFtZXRlcnNcbiAgICAgICAgdGhpcy5wYXJhbWV0ZXJzID0ge307XG4gICAgICAgIHRoaXMucGFyYW1ldGVycy5tYXhUZXh0dXJlVW5pdHMgPSB0aGlzLmdsLmdldFBhcmFtZXRlcih0aGlzLmdsLk1BWF9DT01CSU5FRF9URVhUVVJFX0lNQUdFX1VOSVRTKTtcbiAgICAgICAgdGhpcy5wYXJhbWV0ZXJzLm1heEFuaXNvdHJvcHkgPSB0aGlzLmdldEV4dGVuc2lvbignRVhUX3RleHR1cmVfZmlsdGVyX2FuaXNvdHJvcGljJylcbiAgICAgICAgICAgID8gdGhpcy5nbC5nZXRQYXJhbWV0ZXIodGhpcy5nZXRFeHRlbnNpb24oJ0VYVF90ZXh0dXJlX2ZpbHRlcl9hbmlzb3Ryb3BpYycpLk1BWF9URVhUVVJFX01BWF9BTklTT1RST1BZX0VYVClcbiAgICAgICAgICAgIDogMDtcbiAgICB9XG5cbiAgICBzZXRTaXplKHdpZHRoLCBoZWlnaHQpIHtcbiAgICAgICAgdGhpcy53aWR0aCA9IHdpZHRoO1xuICAgICAgICB0aGlzLmhlaWdodCA9IGhlaWdodDtcblxuICAgICAgICB0aGlzLmdsLmNhbnZhcy53aWR0aCA9IHdpZHRoICogdGhpcy5kcHI7XG4gICAgICAgIHRoaXMuZ2wuY2FudmFzLmhlaWdodCA9IGhlaWdodCAqIHRoaXMuZHByO1xuXG4gICAgICAgIE9iamVjdC5hc3NpZ24odGhpcy5nbC5jYW52YXMuc3R5bGUsIHtcbiAgICAgICAgICAgIHdpZHRoOiB3aWR0aCArICdweCcsXG4gICAgICAgICAgICBoZWlnaHQ6IGhlaWdodCArICdweCcsXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHNldFZpZXdwb3J0KHdpZHRoLCBoZWlnaHQpIHtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUudmlld3BvcnQud2lkdGggPT09IHdpZHRoICYmIHRoaXMuc3RhdGUudmlld3BvcnQuaGVpZ2h0ID09PSBoZWlnaHQpIHJldHVybjtcbiAgICAgICAgdGhpcy5zdGF0ZS52aWV3cG9ydC53aWR0aCA9IHdpZHRoO1xuICAgICAgICB0aGlzLnN0YXRlLnZpZXdwb3J0LmhlaWdodCA9IGhlaWdodDtcbiAgICAgICAgdGhpcy5nbC52aWV3cG9ydCgwLCAwLCB3aWR0aCwgaGVpZ2h0KTtcbiAgICB9XG5cbiAgICBlbmFibGUoaWQpIHtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGVbaWRdID09PSB0cnVlKSByZXR1cm47XG4gICAgICAgIHRoaXMuZ2wuZW5hYmxlKGlkKTtcbiAgICAgICAgdGhpcy5zdGF0ZVtpZF0gPSB0cnVlO1xuICAgIH1cblxuICAgIGRpc2FibGUoaWQpIHtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGVbaWRdID09PSBmYWxzZSkgcmV0dXJuO1xuICAgICAgICB0aGlzLmdsLmRpc2FibGUoaWQpO1xuICAgICAgICB0aGlzLnN0YXRlW2lkXSA9IGZhbHNlO1xuICAgIH1cblxuICAgIHNldEJsZW5kRnVuYyhzcmMsIGRzdCwgc3JjQWxwaGEsIGRzdEFscGhhKSB7XG4gICAgICAgIGlmIChcbiAgICAgICAgICAgIHRoaXMuc3RhdGUuYmxlbmRGdW5jLnNyYyA9PT0gc3JjICYmXG4gICAgICAgICAgICB0aGlzLnN0YXRlLmJsZW5kRnVuYy5kc3QgPT09IGRzdCAmJlxuICAgICAgICAgICAgdGhpcy5zdGF0ZS5ibGVuZEZ1bmMuc3JjQWxwaGEgPT09IHNyY0FscGhhICYmXG4gICAgICAgICAgICB0aGlzLnN0YXRlLmJsZW5kRnVuYy5kc3RBbHBoYSA9PT0gZHN0QWxwaGFcbiAgICAgICAgKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB0aGlzLnN0YXRlLmJsZW5kRnVuYy5zcmMgPSBzcmM7XG4gICAgICAgIHRoaXMuc3RhdGUuYmxlbmRGdW5jLmRzdCA9IGRzdDtcbiAgICAgICAgdGhpcy5zdGF0ZS5ibGVuZEZ1bmMuc3JjQWxwaGEgPSBzcmNBbHBoYTtcbiAgICAgICAgdGhpcy5zdGF0ZS5ibGVuZEZ1bmMuZHN0QWxwaGEgPSBkc3RBbHBoYTtcbiAgICAgICAgaWYgKHNyY0FscGhhICE9PSB1bmRlZmluZWQpIHRoaXMuZ2wuYmxlbmRGdW5jU2VwYXJhdGUoc3JjLCBkc3QsIHNyY0FscGhhLCBkc3RBbHBoYSk7XG4gICAgICAgIGVsc2UgdGhpcy5nbC5ibGVuZEZ1bmMoc3JjLCBkc3QpO1xuICAgIH1cblxuICAgIHNldEJsZW5kRXF1YXRpb24obW9kZVJHQiwgbW9kZUFscGhhKSB7XG4gICAgICAgIG1vZGVSR0IgPSBtb2RlUkdCIHx8IHRoaXMuZ2wuRlVOQ19BREQ7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLmJsZW5kRXF1YXRpb24ubW9kZVJHQiA9PT0gbW9kZVJHQiAmJiB0aGlzLnN0YXRlLmJsZW5kRXF1YXRpb24ubW9kZUFscGhhID09PSBtb2RlQWxwaGEpIHJldHVybjtcbiAgICAgICAgdGhpcy5zdGF0ZS5ibGVuZEVxdWF0aW9uLm1vZGVSR0IgPSBtb2RlUkdCO1xuICAgICAgICB0aGlzLnN0YXRlLmJsZW5kRXF1YXRpb24ubW9kZUFscGhhID0gbW9kZUFscGhhO1xuICAgICAgICBpZiAobW9kZUFscGhhICE9PSB1bmRlZmluZWQpIHRoaXMuZ2wuYmxlbmRFcXVhdGlvblNlcGFyYXRlKG1vZGVSR0IsIG1vZGVBbHBoYSk7XG4gICAgICAgIGVsc2UgdGhpcy5nbC5ibGVuZEVxdWF0aW9uKG1vZGVSR0IpO1xuICAgIH1cblxuICAgIHNldEN1bGxGYWNlKHZhbHVlKSB7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLmN1bGxGYWNlID09PSB2YWx1ZSkgcmV0dXJuO1xuICAgICAgICB0aGlzLnN0YXRlLmN1bGxGYWNlID0gdmFsdWU7XG4gICAgICAgIHRoaXMuZ2wuY3VsbEZhY2UodmFsdWUpO1xuICAgIH1cblxuICAgIHNldEZyb250RmFjZSh2YWx1ZSkge1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5mcm9udEZhY2UgPT09IHZhbHVlKSByZXR1cm47XG4gICAgICAgIHRoaXMuc3RhdGUuZnJvbnRGYWNlID0gdmFsdWU7XG4gICAgICAgIHRoaXMuZ2wuZnJvbnRGYWNlKHZhbHVlKTtcbiAgICB9XG5cbiAgICBzZXREZXB0aE1hc2sodmFsdWUpIHtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuZGVwdGhNYXNrID09PSB2YWx1ZSkgcmV0dXJuO1xuICAgICAgICB0aGlzLnN0YXRlLmRlcHRoTWFzayA9IHZhbHVlO1xuICAgICAgICB0aGlzLmdsLmRlcHRoTWFzayh2YWx1ZSk7XG4gICAgfVxuXG4gICAgc2V0RGVwdGhGdW5jKHZhbHVlKSB7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLmRlcHRoRnVuYyA9PT0gdmFsdWUpIHJldHVybjtcbiAgICAgICAgdGhpcy5zdGF0ZS5kZXB0aEZ1bmMgPSB2YWx1ZTtcbiAgICAgICAgdGhpcy5nbC5kZXB0aEZ1bmModmFsdWUpO1xuICAgIH1cblxuICAgIGFjdGl2ZVRleHR1cmUodmFsdWUpIHtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuYWN0aXZlVGV4dHVyZVVuaXQgPT09IHZhbHVlKSByZXR1cm47XG4gICAgICAgIHRoaXMuc3RhdGUuYWN0aXZlVGV4dHVyZVVuaXQgPSB2YWx1ZTtcbiAgICAgICAgdGhpcy5nbC5hY3RpdmVUZXh0dXJlKHRoaXMuZ2wuVEVYVFVSRTAgKyB2YWx1ZSk7XG4gICAgfVxuXG4gICAgYmluZEZyYW1lYnVmZmVyKHsgdGFyZ2V0ID0gdGhpcy5nbC5GUkFNRUJVRkZFUiwgYnVmZmVyID0gbnVsbCB9ID0ge30pIHtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuZnJhbWVidWZmZXIgPT09IGJ1ZmZlcikgcmV0dXJuO1xuICAgICAgICB0aGlzLnN0YXRlLmZyYW1lYnVmZmVyID0gYnVmZmVyO1xuICAgICAgICB0aGlzLmdsLmJpbmRGcmFtZWJ1ZmZlcih0YXJnZXQsIGJ1ZmZlcik7XG4gICAgfVxuXG4gICAgZ2V0RXh0ZW5zaW9uKGV4dGVuc2lvbiwgd2ViZ2wyRnVuYywgZXh0RnVuYykge1xuICAgICAgICAvLyBpZiB3ZWJnbDIgZnVuY3Rpb24gc3VwcG9ydGVkLCByZXR1cm4gZnVuYyBib3VuZCB0byBnbCBjb250ZXh0XG4gICAgICAgIGlmICh3ZWJnbDJGdW5jICYmIHRoaXMuZ2xbd2ViZ2wyRnVuY10pIHJldHVybiB0aGlzLmdsW3dlYmdsMkZ1bmNdLmJpbmQodGhpcy5nbCk7XG5cbiAgICAgICAgLy8gZmV0Y2ggZXh0ZW5zaW9uIG9uY2Ugb25seVxuICAgICAgICBpZiAoIXRoaXMuZXh0ZW5zaW9uc1tleHRlbnNpb25dKSB7XG4gICAgICAgICAgICB0aGlzLmV4dGVuc2lvbnNbZXh0ZW5zaW9uXSA9IHRoaXMuZ2wuZ2V0RXh0ZW5zaW9uKGV4dGVuc2lvbik7XG4gICAgICAgIH1cblxuICAgICAgICAvLyByZXR1cm4gZXh0ZW5zaW9uIGlmIG5vIGZ1bmN0aW9uIHJlcXVlc3RlZFxuICAgICAgICBpZiAoIXdlYmdsMkZ1bmMpIHJldHVybiB0aGlzLmV4dGVuc2lvbnNbZXh0ZW5zaW9uXTtcblxuICAgICAgICAvLyBSZXR1cm4gbnVsbCBpZiBleHRlbnNpb24gbm90IHN1cHBvcnRlZFxuICAgICAgICBpZiAoIXRoaXMuZXh0ZW5zaW9uc1tleHRlbnNpb25dKSByZXR1cm4gbnVsbDtcblxuICAgICAgICAvLyByZXR1cm4gZXh0ZW5zaW9uIGZ1bmN0aW9uLCBib3VuZCB0byBleHRlbnNpb25cbiAgICAgICAgcmV0dXJuIHRoaXMuZXh0ZW5zaW9uc1tleHRlbnNpb25dW2V4dEZ1bmNdLmJpbmQodGhpcy5leHRlbnNpb25zW2V4dGVuc2lvbl0pO1xuICAgIH1cblxuICAgIHNvcnRPcGFxdWUoYSwgYikge1xuICAgICAgICBpZiAoYS5yZW5kZXJPcmRlciAhPT0gYi5yZW5kZXJPcmRlcikge1xuICAgICAgICAgICAgcmV0dXJuIGEucmVuZGVyT3JkZXIgLSBiLnJlbmRlck9yZGVyO1xuICAgICAgICB9IGVsc2UgaWYgKGEucHJvZ3JhbS5pZCAhPT0gYi5wcm9ncmFtLmlkKSB7XG4gICAgICAgICAgICByZXR1cm4gYS5wcm9ncmFtLmlkIC0gYi5wcm9ncmFtLmlkO1xuICAgICAgICB9IGVsc2UgaWYgKGEuekRlcHRoICE9PSBiLnpEZXB0aCkge1xuICAgICAgICAgICAgcmV0dXJuIGEuekRlcHRoIC0gYi56RGVwdGg7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gYi5pZCAtIGEuaWQ7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzb3J0VHJhbnNwYXJlbnQoYSwgYikge1xuICAgICAgICBpZiAoYS5yZW5kZXJPcmRlciAhPT0gYi5yZW5kZXJPcmRlcikge1xuICAgICAgICAgICAgcmV0dXJuIGEucmVuZGVyT3JkZXIgLSBiLnJlbmRlck9yZGVyO1xuICAgICAgICB9XG4gICAgICAgIGlmIChhLnpEZXB0aCAhPT0gYi56RGVwdGgpIHtcbiAgICAgICAgICAgIHJldHVybiBiLnpEZXB0aCAtIGEuekRlcHRoO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGIuaWQgLSBhLmlkO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc29ydFVJKGEsIGIpIHtcbiAgICAgICAgaWYgKGEucmVuZGVyT3JkZXIgIT09IGIucmVuZGVyT3JkZXIpIHtcbiAgICAgICAgICAgIHJldHVybiBhLnJlbmRlck9yZGVyIC0gYi5yZW5kZXJPcmRlcjtcbiAgICAgICAgfSBlbHNlIGlmIChhLnByb2dyYW0uaWQgIT09IGIucHJvZ3JhbS5pZCkge1xuICAgICAgICAgICAgcmV0dXJuIGEucHJvZ3JhbS5pZCAtIGIucHJvZ3JhbS5pZDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBiLmlkIC0gYS5pZDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGdldFJlbmRlckxpc3QoeyBzY2VuZSwgY2FtZXJhLCBmcnVzdHVtQ3VsbCwgc29ydCB9KSB7XG4gICAgICAgIGxldCByZW5kZXJMaXN0ID0gQXJyYXkuaXNBcnJheShzY2VuZSkgPyBbLi4uc2NlbmVdIDogdGhpcy5zY2VuZVRvUmVuZGVyTGlzdChzY2VuZSwgZnJ1c3R1bUN1bGwsIGNhbWVyYSk7XG4gICAgICAgIGlmIChzb3J0KSByZW5kZXJMaXN0ID0gdGhpcy5zb3J0UmVuZGVyTGlzdChyZW5kZXJMaXN0LCBjYW1lcmEpO1xuICAgICAgICByZXR1cm4gcmVuZGVyTGlzdDtcbiAgICB9XG5cbiAgICBzY2VuZVRvUmVuZGVyTGlzdChzY2VuZSwgZnJ1c3R1bUN1bGwsIGNhbWVyYSkge1xuICAgICAgICBpZiAoY2FtZXJhICYmIGZydXN0dW1DdWxsKSBjYW1lcmEudXBkYXRlRnJ1c3R1bSgpO1xuICAgICAgICBsZXQgcmVuZGVyTGlzdCA9IFtdO1xuICAgICAgICAvLyBHZXQgdmlzaWJsZVxuICAgICAgICBzY2VuZS50cmF2ZXJzZSgobm9kZSkgPT4ge1xuICAgICAgICAgICAgaWYgKCFub2RlLnZpc2libGUpIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgaWYgKCFub2RlLmRyYXcpIHJldHVybjtcblxuICAgICAgICAgICAgaWYgKGZydXN0dW1DdWxsICYmIG5vZGUuZnJ1c3R1bUN1bGxlZCAmJiBjYW1lcmEpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWNhbWVyYS5mcnVzdHVtSW50ZXJzZWN0c01lc2gobm9kZSkpIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmVuZGVyTGlzdC5wdXNoKG5vZGUpO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHJlbmRlckxpc3Q7XG4gICAgfVxuXG4gICAgc29ydFJlbmRlckxpc3QocmVuZGVyTGlzdCwgY2FtZXJhLCBzcGxpdCA9IGZhbHNlKSB7XG4gICAgICAgIGNvbnN0IG9wYXF1ZSA9IFtdO1xuICAgICAgICBjb25zdCB0cmFuc3BhcmVudCA9IFtdOyAvLyBkZXB0aFRlc3QgdHJ1ZVxuICAgICAgICBjb25zdCB1aSA9IFtdOyAvLyBkZXB0aFRlc3QgZmFsc2VcblxuICAgICAgICByZW5kZXJMaXN0LmZvckVhY2goKG5vZGUpID0+IHtcbiAgICAgICAgICAgIC8vIFNwbGl0IGludG8gdGhlIDMgcmVuZGVyIGdyb3Vwc1xuICAgICAgICAgICAgaWYgKCFub2RlLnByb2dyYW0udHJhbnNwYXJlbnQpIHtcbiAgICAgICAgICAgICAgICBvcGFxdWUucHVzaChub2RlKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAobm9kZS5wcm9ncmFtLmRlcHRoVGVzdCkge1xuICAgICAgICAgICAgICAgIHRyYW5zcGFyZW50LnB1c2gobm9kZSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHVpLnB1c2gobm9kZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIG5vZGUuekRlcHRoID0gMDtcblxuICAgICAgICAgICAgLy8gT25seSBjYWxjdWxhdGUgei1kZXB0aCBpZiByZW5kZXJPcmRlciB1bnNldCBhbmQgZGVwdGhUZXN0IGlzIHRydWVcbiAgICAgICAgICAgIGlmIChub2RlLnJlbmRlck9yZGVyICE9PSAwIHx8ICFub2RlLnByb2dyYW0uZGVwdGhUZXN0IHx8ICFjYW1lcmEpIHJldHVybjtcblxuICAgICAgICAgICAgLy8gdXBkYXRlIHotZGVwdGhcbiAgICAgICAgICAgIG5vZGUud29ybGRNYXRyaXguZ2V0VHJhbnNsYXRpb24odGVtcFZlYzMpO1xuICAgICAgICAgICAgdGVtcFZlYzMuYXBwbHlNYXRyaXg0KGNhbWVyYS5wcm9qZWN0aW9uVmlld01hdHJpeCk7XG4gICAgICAgICAgICBub2RlLnpEZXB0aCA9IHRlbXBWZWMzLno7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIG9wYXF1ZS5zb3J0KHRoaXMuc29ydE9wYXF1ZSk7XG4gICAgICAgIHRyYW5zcGFyZW50LnNvcnQodGhpcy5zb3J0VHJhbnNwYXJlbnQpO1xuICAgICAgICB1aS5zb3J0KHRoaXMuc29ydFVJKTtcblxuICAgICAgICByZXR1cm4gc3BsaXQgPyB7b3BhcXVlLCB0cmFuc3BhcmVudCwgdWl9IDogb3BhcXVlLmNvbmNhdCh0cmFuc3BhcmVudCwgdWkpO1xuICAgIH1cblxuICAgIHJlbmRlcih7IHNjZW5lLCBjYW1lcmEsIHRhcmdldCA9IG51bGwsIHVwZGF0ZSA9IHRydWUsIHNvcnQgPSB0cnVlLCBmcnVzdHVtQ3VsbCA9IHRydWUsIGNsZWFyLCBvdmVycmlkZVByb2dyYW0gfSkge1xuICAgICAgICBpZiAodGFyZ2V0ID09PSBudWxsKSB7XG4gICAgICAgICAgICAvLyBtYWtlIHN1cmUgbm8gcmVuZGVyIHRhcmdldCBib3VuZCBzbyBkcmF3cyB0byBjYW52YXNcbiAgICAgICAgICAgIHRoaXMuYmluZEZyYW1lYnVmZmVyKCk7XG4gICAgICAgICAgICB0aGlzLnNldFZpZXdwb3J0KHRoaXMud2lkdGggKiB0aGlzLmRwciwgdGhpcy5oZWlnaHQgKiB0aGlzLmRwcik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBiaW5kIHN1cHBsaWVkIHJlbmRlciB0YXJnZXQgYW5kIHVwZGF0ZSB2aWV3cG9ydFxuICAgICAgICAgICAgdGhpcy5iaW5kRnJhbWVidWZmZXIodGFyZ2V0KTtcbiAgICAgICAgICAgIHRoaXMuc2V0Vmlld3BvcnQodGFyZ2V0LndpZHRoLCB0YXJnZXQuaGVpZ2h0KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChjbGVhciB8fCAodGhpcy5hdXRvQ2xlYXIgJiYgY2xlYXIgIT09IGZhbHNlKSkge1xuICAgICAgICAgICAgLy8gRW5zdXJlIGRlcHRoIGJ1ZmZlciB3cml0aW5nIGlzIGVuYWJsZWQgc28gaXQgY2FuIGJlIGNsZWFyZWRcbiAgICAgICAgICAgIGlmICh0aGlzLmRlcHRoICYmICghdGFyZ2V0IHx8IHRhcmdldC5kZXB0aCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmVuYWJsZSh0aGlzLmdsLkRFUFRIX1RFU1QpO1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0RGVwdGhNYXNrKHRydWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5nbC5jbGVhcihcbiAgICAgICAgICAgICAgICAodGhpcy5jb2xvciA/IHRoaXMuZ2wuQ09MT1JfQlVGRkVSX0JJVCA6IDApIHxcbiAgICAgICAgICAgICAgICAgICAgKHRoaXMuZGVwdGggPyB0aGlzLmdsLkRFUFRIX0JVRkZFUl9CSVQgOiAwKSB8XG4gICAgICAgICAgICAgICAgICAgICh0aGlzLnN0ZW5jaWwgPyB0aGlzLmdsLlNURU5DSUxfQlVGRkVSX0JJVCA6IDApXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gdXBkYXRlcyBhbGwgc2NlbmUgZ3JhcGggbWF0cmljZXNcbiAgICAgICAgaWYgKHVwZGF0ZSAmJiAhQXJyYXkuaXNBcnJheShzY2VuZSkpIHNjZW5lLnVwZGF0ZU1hdHJpeFdvcmxkKCk7XG5cbiAgICAgICAgLy8gVXBkYXRlIGNhbWVyYSBzZXBhcmF0ZWx5LCBpbiBjYXNlIG5vdCBpbiBzY2VuZSBncmFwaFxuICAgICAgICBpZiAoY2FtZXJhKSBjYW1lcmEudXBkYXRlTWF0cml4V29ybGQoKTtcblxuICAgICAgICAvLyBHZXQgcmVuZGVyIGxpc3QgLSBlbnRhaWxzIGN1bGxpbmcgYW5kIHNvcnRpbmdcbiAgICAgICAgY29uc3QgcmVuZGVyTGlzdCA9IHRoaXMuZ2V0UmVuZGVyTGlzdCh7IHNjZW5lLCBjYW1lcmEsIGZydXN0dW1DdWxsLCBzb3J0LCBvdmVycmlkZVByb2dyYW0gfSk7XG5cbiAgICAgICAgcmVuZGVyTGlzdC5mb3JFYWNoKChub2RlKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnJlbmRlck5vZGUobm9kZSwgY2FtZXJhLCBvdmVycmlkZVByb2dyYW0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICByZW5kZXJOb2RlKG5vZGUsIGNhbWVyYSwgb3ZlcnJpZGVQcm9ncmFtKSB7XG4gICAgICAgIG5vZGUuZHJhdyh7Y2FtZXJhLCBvdmVycmlkZVByb2dyYW19KTtcbiAgICB9XG59XG4iLCIvLyBUT0RPOiBkZWxldGUgdGV4dHVyZVxuLy8gVE9ETzogdXNlIHRleFN1YkltYWdlMkQgZm9yIHVwZGF0ZXMgKHZpZGVvIG9yIHdoZW4gbG9hZGVkKVxuLy8gVE9ETzogbmVlZD8gZW5jb2RpbmcgPSBsaW5lYXJFbmNvZGluZ1xuLy8gVE9ETzogc3VwcG9ydCBub24tY29tcHJlc3NlZCBtaXBtYXBzIHVwbG9hZHNcblxuY29uc3QgZW1wdHlQaXhlbCA9IG5ldyBVaW50OEFycmF5KDQpO1xuXG5mdW5jdGlvbiBpc1Bvd2VyT2YyKHZhbHVlKSB7XG4gICAgcmV0dXJuICh2YWx1ZSAmICh2YWx1ZSAtIDEpKSA9PT0gMDtcbn1cblxubGV0IElEID0gMTtcblxuZXhwb3J0IGNsYXNzIFRleHR1cmUge1xuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICBnbCxcbiAgICAgICAge1xuICAgICAgICAgICAgaW1hZ2UsXG4gICAgICAgICAgICB0YXJnZXQgPSBnbC5URVhUVVJFXzJELFxuICAgICAgICAgICAgdHlwZSA9IGdsLlVOU0lHTkVEX0JZVEUsXG4gICAgICAgICAgICBmb3JtYXQgPSBnbC5SR0JBLFxuICAgICAgICAgICAgaW50ZXJuYWxGb3JtYXQgPSBmb3JtYXQsXG4gICAgICAgICAgICB3cmFwUyA9IGdsLkNMQU1QX1RPX0VER0UsXG4gICAgICAgICAgICB3cmFwVCA9IGdsLkNMQU1QX1RPX0VER0UsXG4gICAgICAgICAgICBnZW5lcmF0ZU1pcG1hcHMgPSB0cnVlLFxuICAgICAgICAgICAgbWluRmlsdGVyID0gZ2VuZXJhdGVNaXBtYXBzID8gZ2wuTkVBUkVTVF9NSVBNQVBfTElORUFSIDogZ2wuTElORUFSLFxuICAgICAgICAgICAgbWFnRmlsdGVyID0gZ2wuTElORUFSLFxuICAgICAgICAgICAgcHJlbXVsdGlwbHlBbHBoYSA9IGZhbHNlLFxuICAgICAgICAgICAgdW5wYWNrQWxpZ25tZW50ID0gNCxcbiAgICAgICAgICAgIGZsaXBZID0gdGFyZ2V0ID09IGdsLlRFWFRVUkVfMkQgPyB0cnVlIDogZmFsc2UsXG4gICAgICAgICAgICBhbmlzb3Ryb3B5ID0gMCxcbiAgICAgICAgICAgIGxldmVsID0gMCxcbiAgICAgICAgICAgIHdpZHRoLCAvLyB1c2VkIGZvciBSZW5kZXJUYXJnZXRzIG9yIERhdGEgVGV4dHVyZXNcbiAgICAgICAgICAgIGhlaWdodCA9IHdpZHRoLFxuICAgICAgICB9ID0ge31cbiAgICApIHtcbiAgICAgICAgdGhpcy5nbCA9IGdsO1xuICAgICAgICB0aGlzLmlkID0gSUQrKztcblxuICAgICAgICB0aGlzLmltYWdlID0gaW1hZ2U7XG4gICAgICAgIHRoaXMudGFyZ2V0ID0gdGFyZ2V0O1xuICAgICAgICB0aGlzLnR5cGUgPSB0eXBlO1xuICAgICAgICB0aGlzLmZvcm1hdCA9IGZvcm1hdDtcbiAgICAgICAgdGhpcy5pbnRlcm5hbEZvcm1hdCA9IGludGVybmFsRm9ybWF0O1xuICAgICAgICB0aGlzLm1pbkZpbHRlciA9IG1pbkZpbHRlcjtcbiAgICAgICAgdGhpcy5tYWdGaWx0ZXIgPSBtYWdGaWx0ZXI7XG4gICAgICAgIHRoaXMud3JhcFMgPSB3cmFwUztcbiAgICAgICAgdGhpcy53cmFwVCA9IHdyYXBUO1xuICAgICAgICB0aGlzLmdlbmVyYXRlTWlwbWFwcyA9IGdlbmVyYXRlTWlwbWFwcztcbiAgICAgICAgdGhpcy5wcmVtdWx0aXBseUFscGhhID0gcHJlbXVsdGlwbHlBbHBoYTtcbiAgICAgICAgdGhpcy51bnBhY2tBbGlnbm1lbnQgPSB1bnBhY2tBbGlnbm1lbnQ7XG4gICAgICAgIHRoaXMuZmxpcFkgPSBmbGlwWTtcbiAgICAgICAgdGhpcy5hbmlzb3Ryb3B5ID0gTWF0aC5taW4oYW5pc290cm9weSwgdGhpcy5nbC5yZW5kZXJlci5wYXJhbWV0ZXJzLm1heEFuaXNvdHJvcHkpO1xuICAgICAgICB0aGlzLmxldmVsID0gbGV2ZWw7XG4gICAgICAgIHRoaXMud2lkdGggPSB3aWR0aDtcbiAgICAgICAgdGhpcy5oZWlnaHQgPSBoZWlnaHQ7XG4gICAgICAgIHRoaXMudGV4dHVyZSA9IHRoaXMuZ2wuY3JlYXRlVGV4dHVyZSgpO1xuXG4gICAgICAgIHRoaXMuc3RvcmUgPSB7XG4gICAgICAgICAgICBpbWFnZTogbnVsbCxcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBBbGlhcyBmb3Igc3RhdGUgc3RvcmUgdG8gYXZvaWQgcmVkdW5kYW50IGNhbGxzIGZvciBnbG9iYWwgc3RhdGVcbiAgICAgICAgdGhpcy5nbFN0YXRlID0gdGhpcy5nbC5yZW5kZXJlci5zdGF0ZTtcblxuICAgICAgICAvLyBTdGF0ZSBzdG9yZSB0byBhdm9pZCByZWR1bmRhbnQgY2FsbHMgZm9yIHBlci10ZXh0dXJlIHN0YXRlXG4gICAgICAgIHRoaXMuc3RhdGUgPSB7fTtcbiAgICAgICAgdGhpcy5zdGF0ZS5taW5GaWx0ZXIgPSB0aGlzLmdsLk5FQVJFU1RfTUlQTUFQX0xJTkVBUjtcbiAgICAgICAgdGhpcy5zdGF0ZS5tYWdGaWx0ZXIgPSB0aGlzLmdsLkxJTkVBUjtcbiAgICAgICAgdGhpcy5zdGF0ZS53cmFwUyA9IHRoaXMuZ2wuUkVQRUFUO1xuICAgICAgICB0aGlzLnN0YXRlLndyYXBUID0gdGhpcy5nbC5SRVBFQVQ7XG4gICAgICAgIHRoaXMuc3RhdGUuYW5pc290cm9weSA9IDA7XG4gICAgfVxuXG4gICAgYmluZCgpIHtcbiAgICAgICAgLy8gQWxyZWFkeSBib3VuZCB0byBhY3RpdmUgdGV4dHVyZSB1bml0XG4gICAgICAgIGlmICh0aGlzLmdsU3RhdGUudGV4dHVyZVVuaXRzW3RoaXMuZ2xTdGF0ZS5hY3RpdmVUZXh0dXJlVW5pdF0gPT09IHRoaXMuaWQpIHJldHVybjtcbiAgICAgICAgdGhpcy5nbC5iaW5kVGV4dHVyZSh0aGlzLnRhcmdldCwgdGhpcy50ZXh0dXJlKTtcbiAgICAgICAgdGhpcy5nbFN0YXRlLnRleHR1cmVVbml0c1t0aGlzLmdsU3RhdGUuYWN0aXZlVGV4dHVyZVVuaXRdID0gdGhpcy5pZDtcbiAgICB9XG5cbiAgICB1cGRhdGUodGV4dHVyZVVuaXQgPSAwKSB7XG4gICAgICAgIGNvbnN0IG5lZWRzVXBkYXRlID0gISh0aGlzLmltYWdlID09PSB0aGlzLnN0b3JlLmltYWdlICYmICF0aGlzLm5lZWRzVXBkYXRlKTtcblxuICAgICAgICAvLyBNYWtlIHN1cmUgdGhhdCB0ZXh0dXJlIGlzIGJvdW5kIHRvIGl0cyB0ZXh0dXJlIHVuaXRcbiAgICAgICAgaWYgKG5lZWRzVXBkYXRlIHx8IHRoaXMuZ2xTdGF0ZS50ZXh0dXJlVW5pdHNbdGV4dHVyZVVuaXRdICE9PSB0aGlzLmlkKSB7XG4gICAgICAgICAgICAvLyBzZXQgYWN0aXZlIHRleHR1cmUgdW5pdCB0byBwZXJmb3JtIHRleHR1cmUgZnVuY3Rpb25zXG4gICAgICAgICAgICB0aGlzLmdsLnJlbmRlcmVyLmFjdGl2ZVRleHR1cmUodGV4dHVyZVVuaXQpO1xuICAgICAgICAgICAgdGhpcy5iaW5kKCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIW5lZWRzVXBkYXRlKSByZXR1cm47XG4gICAgICAgIHRoaXMubmVlZHNVcGRhdGUgPSBmYWxzZTtcblxuICAgICAgICBpZiAodGhpcy5mbGlwWSAhPT0gdGhpcy5nbFN0YXRlLmZsaXBZKSB7XG4gICAgICAgICAgICB0aGlzLmdsLnBpeGVsU3RvcmVpKHRoaXMuZ2wuVU5QQUNLX0ZMSVBfWV9XRUJHTCwgdGhpcy5mbGlwWSk7XG4gICAgICAgICAgICB0aGlzLmdsU3RhdGUuZmxpcFkgPSB0aGlzLmZsaXBZO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMucHJlbXVsdGlwbHlBbHBoYSAhPT0gdGhpcy5nbFN0YXRlLnByZW11bHRpcGx5QWxwaGEpIHtcbiAgICAgICAgICAgIHRoaXMuZ2wucGl4ZWxTdG9yZWkodGhpcy5nbC5VTlBBQ0tfUFJFTVVMVElQTFlfQUxQSEFfV0VCR0wsIHRoaXMucHJlbXVsdGlwbHlBbHBoYSk7XG4gICAgICAgICAgICB0aGlzLmdsU3RhdGUucHJlbXVsdGlwbHlBbHBoYSA9IHRoaXMucHJlbXVsdGlwbHlBbHBoYTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLnVucGFja0FsaWdubWVudCAhPT0gdGhpcy5nbFN0YXRlLnVucGFja0FsaWdubWVudCkge1xuICAgICAgICAgICAgdGhpcy5nbC5waXhlbFN0b3JlaSh0aGlzLmdsLlVOUEFDS19BTElHTk1FTlQsIHRoaXMudW5wYWNrQWxpZ25tZW50KTtcbiAgICAgICAgICAgIHRoaXMuZ2xTdGF0ZS51bnBhY2tBbGlnbm1lbnQgPSB0aGlzLnVucGFja0FsaWdubWVudDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLm1pbkZpbHRlciAhPT0gdGhpcy5zdGF0ZS5taW5GaWx0ZXIpIHtcbiAgICAgICAgICAgIHRoaXMuZ2wudGV4UGFyYW1ldGVyaSh0aGlzLnRhcmdldCwgdGhpcy5nbC5URVhUVVJFX01JTl9GSUxURVIsIHRoaXMubWluRmlsdGVyKTtcbiAgICAgICAgICAgIHRoaXMuc3RhdGUubWluRmlsdGVyID0gdGhpcy5taW5GaWx0ZXI7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5tYWdGaWx0ZXIgIT09IHRoaXMuc3RhdGUubWFnRmlsdGVyKSB7XG4gICAgICAgICAgICB0aGlzLmdsLnRleFBhcmFtZXRlcmkodGhpcy50YXJnZXQsIHRoaXMuZ2wuVEVYVFVSRV9NQUdfRklMVEVSLCB0aGlzLm1hZ0ZpbHRlcik7XG4gICAgICAgICAgICB0aGlzLnN0YXRlLm1hZ0ZpbHRlciA9IHRoaXMubWFnRmlsdGVyO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMud3JhcFMgIT09IHRoaXMuc3RhdGUud3JhcFMpIHtcbiAgICAgICAgICAgIHRoaXMuZ2wudGV4UGFyYW1ldGVyaSh0aGlzLnRhcmdldCwgdGhpcy5nbC5URVhUVVJFX1dSQVBfUywgdGhpcy53cmFwUyk7XG4gICAgICAgICAgICB0aGlzLnN0YXRlLndyYXBTID0gdGhpcy53cmFwUztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLndyYXBUICE9PSB0aGlzLnN0YXRlLndyYXBUKSB7XG4gICAgICAgICAgICB0aGlzLmdsLnRleFBhcmFtZXRlcmkodGhpcy50YXJnZXQsIHRoaXMuZ2wuVEVYVFVSRV9XUkFQX1QsIHRoaXMud3JhcFQpO1xuICAgICAgICAgICAgdGhpcy5zdGF0ZS53cmFwVCA9IHRoaXMud3JhcFQ7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5hbmlzb3Ryb3B5ICYmIHRoaXMuYW5pc290cm9weSAhPT0gdGhpcy5zdGF0ZS5hbmlzb3Ryb3B5KSB7XG4gICAgICAgICAgICB0aGlzLmdsLnRleFBhcmFtZXRlcmYoXG4gICAgICAgICAgICAgICAgdGhpcy50YXJnZXQsXG4gICAgICAgICAgICAgICAgdGhpcy5nbC5yZW5kZXJlci5nZXRFeHRlbnNpb24oJ0VYVF90ZXh0dXJlX2ZpbHRlcl9hbmlzb3Ryb3BpYycpLlRFWFRVUkVfTUFYX0FOSVNPVFJPUFlfRVhULFxuICAgICAgICAgICAgICAgIHRoaXMuYW5pc290cm9weVxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIHRoaXMuc3RhdGUuYW5pc290cm9weSA9IHRoaXMuYW5pc290cm9weTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLmltYWdlKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5pbWFnZS53aWR0aCkge1xuICAgICAgICAgICAgICAgIHRoaXMud2lkdGggPSB0aGlzLmltYWdlLndpZHRoO1xuICAgICAgICAgICAgICAgIHRoaXMuaGVpZ2h0ID0gdGhpcy5pbWFnZS5oZWlnaHQ7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0aGlzLnRhcmdldCA9PT0gdGhpcy5nbC5URVhUVVJFX0NVQkVfTUFQKSB7XG4gICAgICAgICAgICAgICAgLy8gRm9yIGN1YmUgbWFwc1xuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgNjsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZ2wudGV4SW1hZ2UyRChcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZ2wuVEVYVFVSRV9DVUJFX01BUF9QT1NJVElWRV9YICsgaSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubGV2ZWwsXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmludGVybmFsRm9ybWF0LFxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5mb3JtYXQsXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnR5cGUsXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmltYWdlW2ldXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmIChBcnJheUJ1ZmZlci5pc1ZpZXcodGhpcy5pbWFnZSkpIHtcbiAgICAgICAgICAgICAgICAvLyBEYXRhIHRleHR1cmVcbiAgICAgICAgICAgICAgICB0aGlzLmdsLnRleEltYWdlMkQodGhpcy50YXJnZXQsIHRoaXMubGV2ZWwsIHRoaXMuaW50ZXJuYWxGb3JtYXQsIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0LCAwLCB0aGlzLmZvcm1hdCwgdGhpcy50eXBlLCB0aGlzLmltYWdlKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5pbWFnZS5pc0NvbXByZXNzZWRUZXh0dXJlKSB7XG4gICAgICAgICAgICAgICAgLy8gQ29tcHJlc3NlZCB0ZXh0dXJlXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgbGV2ZWwgPSAwOyBsZXZlbCA8IHRoaXMuaW1hZ2UubGVuZ3RoOyBsZXZlbCsrKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZ2wuY29tcHJlc3NlZFRleEltYWdlMkQoXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnRhcmdldCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldmVsLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbnRlcm5hbEZvcm1hdCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaW1hZ2VbbGV2ZWxdLndpZHRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbWFnZVtsZXZlbF0uaGVpZ2h0LFxuICAgICAgICAgICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaW1hZ2VbbGV2ZWxdLmRhdGFcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIFJlZ3VsYXIgdGV4dHVyZVxuICAgICAgICAgICAgICAgIHRoaXMuZ2wudGV4SW1hZ2UyRCh0aGlzLnRhcmdldCwgdGhpcy5sZXZlbCwgdGhpcy5pbnRlcm5hbEZvcm1hdCwgdGhpcy5mb3JtYXQsIHRoaXMudHlwZSwgdGhpcy5pbWFnZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0aGlzLmdlbmVyYXRlTWlwbWFwcykge1xuICAgICAgICAgICAgICAgIC8vIEZvciBXZWJHTDEsIGlmIG5vdCBhIHBvd2VyIG9mIDIsIHR1cm4gb2ZmIG1pcHMsIHNldCB3cmFwcGluZyB0byBjbGFtcCB0byBlZGdlIGFuZCBtaW5GaWx0ZXIgdG8gbGluZWFyXG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLmdsLnJlbmRlcmVyLmlzV2ViZ2wyICYmICghaXNQb3dlck9mMih0aGlzLmltYWdlLndpZHRoKSB8fCAhaXNQb3dlck9mMih0aGlzLmltYWdlLmhlaWdodCkpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZ2VuZXJhdGVNaXBtYXBzID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMud3JhcFMgPSB0aGlzLndyYXBUID0gdGhpcy5nbC5DTEFNUF9UT19FREdFO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm1pbkZpbHRlciA9IHRoaXMuZ2wuTElORUFSO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZ2wuZ2VuZXJhdGVNaXBtYXAodGhpcy50YXJnZXQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gQ2FsbGJhY2sgZm9yIHdoZW4gZGF0YSBpcyBwdXNoZWQgdG8gR1BVXG4gICAgICAgICAgICB0aGlzLm9uVXBkYXRlICYmIHRoaXMub25VcGRhdGUoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnRhcmdldCA9PT0gdGhpcy5nbC5URVhUVVJFX0NVQkVfTUFQKSB7XG4gICAgICAgICAgICAgICAgLy8gVXBsb2FkIGVtcHR5IHBpeGVsIGZvciBlYWNoIHNpZGUgd2hpbGUgbm8gaW1hZ2UgdG8gYXZvaWQgZXJyb3JzIHdoaWxlIGltYWdlIG9yIHZpZGVvIGxvYWRpbmdcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDY7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmdsLnRleEltYWdlMkQoXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmdsLlRFWFRVUkVfQ1VCRV9NQVBfUE9TSVRJVkVfWCArIGksXG4gICAgICAgICAgICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5nbC5SR0JBLFxuICAgICAgICAgICAgICAgICAgICAgICAgMSxcbiAgICAgICAgICAgICAgICAgICAgICAgIDEsXG4gICAgICAgICAgICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5nbC5SR0JBLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5nbC5VTlNJR05FRF9CWVRFLFxuICAgICAgICAgICAgICAgICAgICAgICAgZW1wdHlQaXhlbFxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy53aWR0aCkge1xuICAgICAgICAgICAgICAgIC8vIGltYWdlIGludGVudGlvbmFsbHkgbGVmdCBudWxsIGZvciBSZW5kZXJUYXJnZXRcbiAgICAgICAgICAgICAgICB0aGlzLmdsLnRleEltYWdlMkQodGhpcy50YXJnZXQsIHRoaXMubGV2ZWwsIHRoaXMuaW50ZXJuYWxGb3JtYXQsIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0LCAwLCB0aGlzLmZvcm1hdCwgdGhpcy50eXBlLCBudWxsKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gVXBsb2FkIGVtcHR5IHBpeGVsIGlmIG5vIGltYWdlIHRvIGF2b2lkIGVycm9ycyB3aGlsZSBpbWFnZSBvciB2aWRlbyBsb2FkaW5nXG4gICAgICAgICAgICAgICAgdGhpcy5nbC50ZXhJbWFnZTJEKHRoaXMudGFyZ2V0LCAwLCB0aGlzLmdsLlJHQkEsIDEsIDEsIDAsIHRoaXMuZ2wuUkdCQSwgdGhpcy5nbC5VTlNJR05FRF9CWVRFLCBlbXB0eVBpeGVsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aGlzLnN0b3JlLmltYWdlID0gdGhpcy5pbWFnZTtcbiAgICB9XG5cbiAgICBkaXNwb3NlKCkge1xuICAgICAgICB0aGlzLmdsLmRlbGV0ZVRleHR1cmUodGhpcy50ZXh0dXJlKTtcbiAgICAgICAgdGhpcy50ZXh0dXJlID0gbnVsbDtcbiAgICB9XG59XG4iLCJpbXBvcnQgeyBWZWMzIH0gZnJvbSAnLi4vbWF0aC9WZWMzLmpzJztcbmltcG9ydCB7IFF1YXQgfSBmcm9tICcuLi9tYXRoL1F1YXQuanMnO1xuaW1wb3J0IHsgTWF0NCB9IGZyb20gJy4uL21hdGgvTWF0NC5qcyc7XG5pbXBvcnQgeyBFdWxlciB9IGZyb20gJy4uL21hdGgvRXVsZXIuanMnO1xuXG5leHBvcnQgY2xhc3MgVHJhbnNmb3JtIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5wYXJlbnQgPSBudWxsO1xuICAgICAgICB0aGlzLmNoaWxkcmVuID0gW107XG4gICAgICAgIHRoaXMudmlzaWJsZSA9IHRydWU7XG5cbiAgICAgICAgdGhpcy5tYXRyaXggPSBuZXcgTWF0NCgpO1xuICAgICAgICB0aGlzLndvcmxkTWF0cml4ID0gbmV3IE1hdDQoKTtcbiAgICAgICAgdGhpcy5tYXRyaXhBdXRvVXBkYXRlID0gdHJ1ZTtcblxuICAgICAgICB0aGlzLnBvc2l0aW9uID0gbmV3IFZlYzMoKTtcbiAgICAgICAgdGhpcy5xdWF0ZXJuaW9uID0gbmV3IFF1YXQoKTtcbiAgICAgICAgdGhpcy5zY2FsZSA9IG5ldyBWZWMzKDEpO1xuICAgICAgICB0aGlzLnJvdGF0aW9uID0gbmV3IEV1bGVyKCk7XG4gICAgICAgIHRoaXMudXAgPSBuZXcgVmVjMygwLCAxLCAwKTtcblxuICAgICAgICB0aGlzLnJvdGF0aW9uLm9uQ2hhbmdlID0gKCkgPT4gdGhpcy5xdWF0ZXJuaW9uLmZyb21FdWxlcih0aGlzLnJvdGF0aW9uKTtcbiAgICAgICAgdGhpcy5xdWF0ZXJuaW9uLm9uQ2hhbmdlID0gKCkgPT4gdGhpcy5yb3RhdGlvbi5mcm9tUXVhdGVybmlvbih0aGlzLnF1YXRlcm5pb24pO1xuICAgIH1cblxuICAgIHNldFBhcmVudChwYXJlbnQsIG5vdGlmeVBhcmVudCA9IHRydWUpIHtcbiAgICAgICAgaWYgKHRoaXMucGFyZW50ICYmIHBhcmVudCAhPT0gdGhpcy5wYXJlbnQpIHRoaXMucGFyZW50LnJlbW92ZUNoaWxkKHRoaXMsIGZhbHNlKTtcbiAgICAgICAgdGhpcy5wYXJlbnQgPSBwYXJlbnQ7XG4gICAgICAgIGlmIChub3RpZnlQYXJlbnQgJiYgcGFyZW50KSBwYXJlbnQuYWRkQ2hpbGQodGhpcywgZmFsc2UpO1xuICAgIH1cblxuICAgIGFkZENoaWxkKGNoaWxkLCBub3RpZnlDaGlsZCA9IHRydWUpIHtcbiAgICAgICAgaWYgKCF+dGhpcy5jaGlsZHJlbi5pbmRleE9mKGNoaWxkKSkgdGhpcy5jaGlsZHJlbi5wdXNoKGNoaWxkKTtcbiAgICAgICAgaWYgKG5vdGlmeUNoaWxkKSBjaGlsZC5zZXRQYXJlbnQodGhpcywgZmFsc2UpO1xuICAgIH1cblxuICAgIHJlbW92ZUNoaWxkKGNoaWxkLCBub3RpZnlDaGlsZCA9IHRydWUpIHtcbiAgICAgICAgaWYgKCEhfnRoaXMuY2hpbGRyZW4uaW5kZXhPZihjaGlsZCkpIHRoaXMuY2hpbGRyZW4uc3BsaWNlKHRoaXMuY2hpbGRyZW4uaW5kZXhPZihjaGlsZCksIDEpO1xuICAgICAgICBpZiAobm90aWZ5Q2hpbGQpIGNoaWxkLnNldFBhcmVudChudWxsLCBmYWxzZSk7XG4gICAgfVxuXG4gICAgdXBkYXRlTWF0cml4V29ybGQoZm9yY2UpIHtcbiAgICAgICAgaWYgKHRoaXMubWF0cml4QXV0b1VwZGF0ZSkgdGhpcy51cGRhdGVNYXRyaXgoKTtcbiAgICAgICAgaWYgKHRoaXMud29ybGRNYXRyaXhOZWVkc1VwZGF0ZSB8fCBmb3JjZSkge1xuICAgICAgICAgICAgaWYgKHRoaXMucGFyZW50ID09PSBudWxsKSB0aGlzLndvcmxkTWF0cml4LmNvcHkodGhpcy5tYXRyaXgpO1xuICAgICAgICAgICAgZWxzZSB0aGlzLndvcmxkTWF0cml4Lm11bHRpcGx5KHRoaXMucGFyZW50LndvcmxkTWF0cml4LCB0aGlzLm1hdHJpeCk7XG4gICAgICAgICAgICB0aGlzLndvcmxkTWF0cml4TmVlZHNVcGRhdGUgPSBmYWxzZTtcbiAgICAgICAgICAgIGZvcmNlID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAobGV0IGkgPSAwLCBsID0gdGhpcy5jaGlsZHJlbi5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgICAgIHRoaXMuY2hpbGRyZW5baV0udXBkYXRlTWF0cml4V29ybGQoZm9yY2UpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgdXBkYXRlTWF0cml4KCkge1xuICAgICAgICB0aGlzLm1hdHJpeC5jb21wb3NlKHRoaXMucXVhdGVybmlvbiwgdGhpcy5wb3NpdGlvbiwgdGhpcy5zY2FsZSk7XG4gICAgICAgIHRoaXMud29ybGRNYXRyaXhOZWVkc1VwZGF0ZSA9IHRydWU7XG4gICAgfVxuXG4gICAgdHJhdmVyc2UoY2FsbGJhY2spIHtcbiAgICAgICAgLy8gUmV0dXJuIHRydWUgaW4gY2FsbGJhY2sgdG8gc3RvcCB0cmF2ZXJzaW5nIGNoaWxkcmVuXG4gICAgICAgIGlmIChjYWxsYmFjayh0aGlzKSkgcmV0dXJuO1xuICAgICAgICBmb3IgKGxldCBpID0gMCwgbCA9IHRoaXMuY2hpbGRyZW4ubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgICAgICB0aGlzLmNoaWxkcmVuW2ldLnRyYXZlcnNlKGNhbGxiYWNrKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGRlY29tcG9zZSgpIHtcbiAgICAgICAgdGhpcy5tYXRyaXguZ2V0VHJhbnNsYXRpb24odGhpcy5wb3NpdGlvbik7XG4gICAgICAgIHRoaXMubWF0cml4LmdldFJvdGF0aW9uKHRoaXMucXVhdGVybmlvbik7XG4gICAgICAgIHRoaXMubWF0cml4LmdldFNjYWxpbmcodGhpcy5zY2FsZSk7XG4gICAgICAgIHRoaXMucm90YXRpb24uZnJvbVF1YXRlcm5pb24odGhpcy5xdWF0ZXJuaW9uKTtcbiAgICB9XG5cbiAgICBsb29rQXQodGFyZ2V0LCBpbnZlcnQgPSBmYWxzZSkge1xuICAgICAgICBpZiAoaW52ZXJ0KSB0aGlzLm1hdHJpeC5sb29rQXQodGhpcy5wb3NpdGlvbiwgdGFyZ2V0LCB0aGlzLnVwKTtcbiAgICAgICAgZWxzZSB0aGlzLm1hdHJpeC5sb29rQXQodGFyZ2V0LCB0aGlzLnBvc2l0aW9uLCB0aGlzLnVwKTtcbiAgICAgICAgdGhpcy5tYXRyaXguZ2V0Um90YXRpb24odGhpcy5xdWF0ZXJuaW9uKTtcbiAgICAgICAgdGhpcy5yb3RhdGlvbi5mcm9tUXVhdGVybmlvbih0aGlzLnF1YXRlcm5pb24pO1xuICAgIH1cbn1cbiIsImltcG9ydCB7IFZlYzMgfSBmcm9tICcuLi9tYXRoL1ZlYzMuanMnO1xuaW1wb3J0IHsgUXVhdCB9IGZyb20gJy4uL21hdGgvUXVhdC5qcyc7XG5cbmNvbnN0IHByZXZQb3MgPSBuZXcgVmVjMygpO1xuY29uc3QgcHJldlJvdCA9IG5ldyBRdWF0KCk7XG5jb25zdCBwcmV2U2NsID0gbmV3IFZlYzMoKTtcblxuY29uc3QgbmV4dFBvcyA9IG5ldyBWZWMzKCk7XG5jb25zdCBuZXh0Um90ID0gbmV3IFF1YXQoKTtcbmNvbnN0IG5leHRTY2wgPSBuZXcgVmVjMygpO1xuXG5leHBvcnQgY2xhc3MgQW5pbWF0aW9uIHtcbiAgICBjb25zdHJ1Y3Rvcih7IG9iamVjdHMsIGRhdGEgfSkge1xuICAgICAgICB0aGlzLm9iamVjdHMgPSBvYmplY3RzO1xuICAgICAgICB0aGlzLmRhdGEgPSBkYXRhO1xuICAgICAgICB0aGlzLmVsYXBzZWQgPSAwO1xuICAgICAgICB0aGlzLndlaWdodCA9IDE7XG4gICAgICAgIHRoaXMuZHVyYXRpb24gPSBkYXRhLmZyYW1lcy5sZW5ndGggLSAxO1xuICAgIH1cblxuICAgIHVwZGF0ZSh0b3RhbFdlaWdodCA9IDEsIGlzU2V0KSB7XG4gICAgICAgIGNvbnN0IHdlaWdodCA9IGlzU2V0ID8gMSA6IHRoaXMud2VpZ2h0IC8gdG90YWxXZWlnaHQ7XG4gICAgICAgIGNvbnN0IGVsYXBzZWQgPSB0aGlzLmVsYXBzZWQgJSB0aGlzLmR1cmF0aW9uO1xuXG4gICAgICAgIGNvbnN0IGZsb29yRnJhbWUgPSBNYXRoLmZsb29yKGVsYXBzZWQpO1xuICAgICAgICBjb25zdCBibGVuZCA9IGVsYXBzZWQgLSBmbG9vckZyYW1lO1xuICAgICAgICBjb25zdCBwcmV2S2V5ID0gdGhpcy5kYXRhLmZyYW1lc1tmbG9vckZyYW1lXTtcbiAgICAgICAgY29uc3QgbmV4dEtleSA9IHRoaXMuZGF0YS5mcmFtZXNbKGZsb29yRnJhbWUgKyAxKSAlIHRoaXMuZHVyYXRpb25dO1xuXG4gICAgICAgIHRoaXMub2JqZWN0cy5mb3JFYWNoKChvYmplY3QsIGkpID0+IHtcbiAgICAgICAgICAgIHByZXZQb3MuZnJvbUFycmF5KHByZXZLZXkucG9zaXRpb24sIGkgKiAzKTtcbiAgICAgICAgICAgIHByZXZSb3QuZnJvbUFycmF5KHByZXZLZXkucXVhdGVybmlvbiwgaSAqIDQpO1xuICAgICAgICAgICAgcHJldlNjbC5mcm9tQXJyYXkocHJldktleS5zY2FsZSwgaSAqIDMpO1xuXG4gICAgICAgICAgICBuZXh0UG9zLmZyb21BcnJheShuZXh0S2V5LnBvc2l0aW9uLCBpICogMyk7XG4gICAgICAgICAgICBuZXh0Um90LmZyb21BcnJheShuZXh0S2V5LnF1YXRlcm5pb24sIGkgKiA0KTtcbiAgICAgICAgICAgIG5leHRTY2wuZnJvbUFycmF5KG5leHRLZXkuc2NhbGUsIGkgKiAzKTtcblxuICAgICAgICAgICAgcHJldlBvcy5sZXJwKG5leHRQb3MsIGJsZW5kKTtcbiAgICAgICAgICAgIHByZXZSb3Quc2xlcnAobmV4dFJvdCwgYmxlbmQpO1xuICAgICAgICAgICAgcHJldlNjbC5sZXJwKG5leHRTY2wsIGJsZW5kKTtcblxuICAgICAgICAgICAgb2JqZWN0LnBvc2l0aW9uLmxlcnAocHJldlBvcywgd2VpZ2h0KTtcbiAgICAgICAgICAgIG9iamVjdC5xdWF0ZXJuaW9uLnNsZXJwKHByZXZSb3QsIHdlaWdodCk7XG4gICAgICAgICAgICBvYmplY3Quc2NhbGUubGVycChwcmV2U2NsLCB3ZWlnaHQpO1xuICAgICAgICB9KTtcbiAgICB9XG59XG4iLCJpbXBvcnQgeyBHZW9tZXRyeSB9IGZyb20gJy4uL2NvcmUvR2VvbWV0cnkuanMnO1xuaW1wb3J0IHsgUGxhbmUgfSBmcm9tICcuL1BsYW5lLmpzJztcblxuZXhwb3J0IGNsYXNzIEJveCBleHRlbmRzIEdlb21ldHJ5IHtcbiAgICBjb25zdHJ1Y3RvcihnbCwgeyB3aWR0aCA9IDEsIGhlaWdodCA9IDEsIGRlcHRoID0gMSwgd2lkdGhTZWdtZW50cyA9IDEsIGhlaWdodFNlZ21lbnRzID0gMSwgZGVwdGhTZWdtZW50cyA9IDEsIGF0dHJpYnV0ZXMgPSB7fSB9ID0ge30pIHtcbiAgICAgICAgY29uc3Qgd1NlZ3MgPSB3aWR0aFNlZ21lbnRzO1xuICAgICAgICBjb25zdCBoU2VncyA9IGhlaWdodFNlZ21lbnRzO1xuICAgICAgICBjb25zdCBkU2VncyA9IGRlcHRoU2VnbWVudHM7XG5cbiAgICAgICAgY29uc3QgbnVtID0gKHdTZWdzICsgMSkgKiAoaFNlZ3MgKyAxKSAqIDIgKyAod1NlZ3MgKyAxKSAqIChkU2VncyArIDEpICogMiArIChoU2VncyArIDEpICogKGRTZWdzICsgMSkgKiAyO1xuICAgICAgICBjb25zdCBudW1JbmRpY2VzID0gKHdTZWdzICogaFNlZ3MgKiAyICsgd1NlZ3MgKiBkU2VncyAqIDIgKyBoU2VncyAqIGRTZWdzICogMikgKiA2O1xuXG4gICAgICAgIGNvbnN0IHBvc2l0aW9uID0gbmV3IEZsb2F0MzJBcnJheShudW0gKiAzKTtcbiAgICAgICAgY29uc3Qgbm9ybWFsID0gbmV3IEZsb2F0MzJBcnJheShudW0gKiAzKTtcbiAgICAgICAgY29uc3QgdXYgPSBuZXcgRmxvYXQzMkFycmF5KG51bSAqIDIpO1xuICAgICAgICBjb25zdCBpbmRleCA9IG51bSA+IDY1NTM2ID8gbmV3IFVpbnQzMkFycmF5KG51bUluZGljZXMpIDogbmV3IFVpbnQxNkFycmF5KG51bUluZGljZXMpO1xuXG4gICAgICAgIGxldCBpID0gMDtcbiAgICAgICAgbGV0IGlpID0gMDtcblxuICAgICAgICAvLyBsZWZ0LCByaWdodFxuICAgICAgICBQbGFuZS5idWlsZFBsYW5lKHBvc2l0aW9uLCBub3JtYWwsIHV2LCBpbmRleCwgZGVwdGgsIGhlaWdodCwgd2lkdGgsIGRTZWdzLCBoU2VncywgMiwgMSwgMCwgLTEsIC0xLCBpLCBpaSk7XG4gICAgICAgIFBsYW5lLmJ1aWxkUGxhbmUoXG4gICAgICAgICAgICBwb3NpdGlvbixcbiAgICAgICAgICAgIG5vcm1hbCxcbiAgICAgICAgICAgIHV2LFxuICAgICAgICAgICAgaW5kZXgsXG4gICAgICAgICAgICBkZXB0aCxcbiAgICAgICAgICAgIGhlaWdodCxcbiAgICAgICAgICAgIC13aWR0aCxcbiAgICAgICAgICAgIGRTZWdzLFxuICAgICAgICAgICAgaFNlZ3MsXG4gICAgICAgICAgICAyLFxuICAgICAgICAgICAgMSxcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAxLFxuICAgICAgICAgICAgLTEsXG4gICAgICAgICAgICAoaSArPSAoZFNlZ3MgKyAxKSAqIChoU2VncyArIDEpKSxcbiAgICAgICAgICAgIChpaSArPSBkU2VncyAqIGhTZWdzKVxuICAgICAgICApO1xuXG4gICAgICAgIC8vIHRvcCwgYm90dG9tXG4gICAgICAgIFBsYW5lLmJ1aWxkUGxhbmUoXG4gICAgICAgICAgICBwb3NpdGlvbixcbiAgICAgICAgICAgIG5vcm1hbCxcbiAgICAgICAgICAgIHV2LFxuICAgICAgICAgICAgaW5kZXgsXG4gICAgICAgICAgICB3aWR0aCxcbiAgICAgICAgICAgIGRlcHRoLFxuICAgICAgICAgICAgaGVpZ2h0LFxuICAgICAgICAgICAgZFNlZ3MsXG4gICAgICAgICAgICBoU2VncyxcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAyLFxuICAgICAgICAgICAgMSxcbiAgICAgICAgICAgIDEsXG4gICAgICAgICAgICAxLFxuICAgICAgICAgICAgKGkgKz0gKGRTZWdzICsgMSkgKiAoaFNlZ3MgKyAxKSksXG4gICAgICAgICAgICAoaWkgKz0gZFNlZ3MgKiBoU2VncylcbiAgICAgICAgKTtcbiAgICAgICAgUGxhbmUuYnVpbGRQbGFuZShcbiAgICAgICAgICAgIHBvc2l0aW9uLFxuICAgICAgICAgICAgbm9ybWFsLFxuICAgICAgICAgICAgdXYsXG4gICAgICAgICAgICBpbmRleCxcbiAgICAgICAgICAgIHdpZHRoLFxuICAgICAgICAgICAgZGVwdGgsXG4gICAgICAgICAgICAtaGVpZ2h0LFxuICAgICAgICAgICAgZFNlZ3MsXG4gICAgICAgICAgICBoU2VncyxcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAyLFxuICAgICAgICAgICAgMSxcbiAgICAgICAgICAgIDEsXG4gICAgICAgICAgICAtMSxcbiAgICAgICAgICAgIChpICs9ICh3U2VncyArIDEpICogKGRTZWdzICsgMSkpLFxuICAgICAgICAgICAgKGlpICs9IHdTZWdzICogZFNlZ3MpXG4gICAgICAgICk7XG5cbiAgICAgICAgLy8gZnJvbnQsIGJhY2tcbiAgICAgICAgUGxhbmUuYnVpbGRQbGFuZShcbiAgICAgICAgICAgIHBvc2l0aW9uLFxuICAgICAgICAgICAgbm9ybWFsLFxuICAgICAgICAgICAgdXYsXG4gICAgICAgICAgICBpbmRleCxcbiAgICAgICAgICAgIHdpZHRoLFxuICAgICAgICAgICAgaGVpZ2h0LFxuICAgICAgICAgICAgLWRlcHRoLFxuICAgICAgICAgICAgd1NlZ3MsXG4gICAgICAgICAgICBoU2VncyxcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAxLFxuICAgICAgICAgICAgMixcbiAgICAgICAgICAgIC0xLFxuICAgICAgICAgICAgLTEsXG4gICAgICAgICAgICAoaSArPSAod1NlZ3MgKyAxKSAqIChkU2VncyArIDEpKSxcbiAgICAgICAgICAgIChpaSArPSB3U2VncyAqIGRTZWdzKVxuICAgICAgICApO1xuICAgICAgICBQbGFuZS5idWlsZFBsYW5lKFxuICAgICAgICAgICAgcG9zaXRpb24sXG4gICAgICAgICAgICBub3JtYWwsXG4gICAgICAgICAgICB1dixcbiAgICAgICAgICAgIGluZGV4LFxuICAgICAgICAgICAgd2lkdGgsXG4gICAgICAgICAgICBoZWlnaHQsXG4gICAgICAgICAgICBkZXB0aCxcbiAgICAgICAgICAgIHdTZWdzLFxuICAgICAgICAgICAgaFNlZ3MsXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgMSxcbiAgICAgICAgICAgIDIsXG4gICAgICAgICAgICAxLFxuICAgICAgICAgICAgLTEsXG4gICAgICAgICAgICAoaSArPSAod1NlZ3MgKyAxKSAqIChoU2VncyArIDEpKSxcbiAgICAgICAgICAgIChpaSArPSB3U2VncyAqIGhTZWdzKVxuICAgICAgICApO1xuXG4gICAgICAgIE9iamVjdC5hc3NpZ24oYXR0cmlidXRlcywge1xuICAgICAgICAgICAgcG9zaXRpb246IHsgc2l6ZTogMywgZGF0YTogcG9zaXRpb24gfSxcbiAgICAgICAgICAgIG5vcm1hbDogeyBzaXplOiAzLCBkYXRhOiBub3JtYWwgfSxcbiAgICAgICAgICAgIHV2OiB7IHNpemU6IDIsIGRhdGE6IHV2IH0sXG4gICAgICAgICAgICBpbmRleDogeyBkYXRhOiBpbmRleCB9LFxuICAgICAgICB9KTtcblxuICAgICAgICBzdXBlcihnbCwgYXR0cmlidXRlcyk7XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgVmVjMyB9IGZyb20gJy4uL21hdGgvVmVjMy5qcyc7XG5cbmNvbnN0IENBVE1VTExST00gPSAnY2F0bXVsbHJvbSc7XG5jb25zdCBDVUJJQ0JFWklFUiA9ICdjdWJpY2Jlemllcic7XG5jb25zdCBRVUFEUkFUSUNCRVpJRVIgPSAncXVhZHJhdGljYmV6aWVyJztcblxuLy8gdGVtcFxuY29uc3QgX2EwID0gbmV3IFZlYzMoKSxcbiAgICBfYTEgPSBuZXcgVmVjMygpLFxuICAgIF9hMiA9IG5ldyBWZWMzKCksXG4gICAgX2EzID0gbmV3IFZlYzMoKTtcblxuLyoqXG4gKiBHZXQgdGhlIGNvbnRyb2wgcG9pbnRzIG9mIGN1YmljIGJlemllciBjdXJ2ZS5cbiAqIEBwYXJhbSB7Kn0gaVxuICogQHBhcmFtIHsqfSBhXG4gKiBAcGFyYW0geyp9IGJcbiAqL1xuZnVuY3Rpb24gZ2V0Q3RybFBvaW50KHBvaW50cywgaSwgYSA9IDAuMTY4LCBiID0gMC4xNjgpIHtcbiAgICBpZiAoaSA8IDEpIHtcbiAgICAgICAgX2EwLnN1Yihwb2ludHNbMV0sIHBvaW50c1swXSkuc2NhbGUoYSkuYWRkKHBvaW50c1swXSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgX2EwLnN1Yihwb2ludHNbaSArIDFdLCBwb2ludHNbaSAtIDFdKVxuICAgICAgICAgICAgLnNjYWxlKGEpXG4gICAgICAgICAgICAuYWRkKHBvaW50c1tpXSk7XG4gICAgfVxuICAgIGlmIChpID4gcG9pbnRzLmxlbmd0aCAtIDMpIHtcbiAgICAgICAgY29uc3QgbGFzdCA9IHBvaW50cy5sZW5ndGggLSAxO1xuICAgICAgICBfYTEuc3ViKHBvaW50c1tsYXN0IC0gMV0sIHBvaW50c1tsYXN0XSlcbiAgICAgICAgICAgIC5zY2FsZShiKVxuICAgICAgICAgICAgLmFkZChwb2ludHNbbGFzdF0pO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIF9hMS5zdWIocG9pbnRzW2ldLCBwb2ludHNbaSArIDJdKVxuICAgICAgICAgICAgLnNjYWxlKGIpXG4gICAgICAgICAgICAuYWRkKHBvaW50c1tpICsgMV0pO1xuICAgIH1cbiAgICByZXR1cm4gW19hMC5jbG9uZSgpLCBfYTEuY2xvbmUoKV07XG59XG5cbmZ1bmN0aW9uIGdldFF1YWRyYXRpY0JlemllclBvaW50KHQsIHAwLCBjMCwgcDEpIHtcbiAgICBjb25zdCBrID0gMSAtIHQ7XG4gICAgX2EwLmNvcHkocDApLnNjYWxlKGsgKiogMik7XG4gICAgX2ExLmNvcHkoYzApLnNjYWxlKDIgKiBrICogdCk7XG4gICAgX2EyLmNvcHkocDEpLnNjYWxlKHQgKiogMik7XG4gICAgY29uc3QgcmV0ID0gbmV3IFZlYzMoKTtcbiAgICByZXQuYWRkKF9hMCwgX2ExKS5hZGQoX2EyKTtcbiAgICByZXR1cm4gcmV0O1xufVxuXG5mdW5jdGlvbiBnZXRDdWJpY0JlemllclBvaW50KHQsIHAwLCBjMCwgYzEsIHAxKSB7XG4gICAgY29uc3QgayA9IDEgLSB0O1xuICAgIF9hMC5jb3B5KHAwKS5zY2FsZShrICoqIDMpO1xuICAgIF9hMS5jb3B5KGMwKS5zY2FsZSgzICogayAqKiAyICogdCk7XG4gICAgX2EyLmNvcHkoYzEpLnNjYWxlKDMgKiBrICogdCAqKiAyKTtcbiAgICBfYTMuY29weShwMSkuc2NhbGUodCAqKiAzKTtcbiAgICBjb25zdCByZXQgPSBuZXcgVmVjMygpO1xuICAgIHJldC5hZGQoX2EwLCBfYTEpLmFkZChfYTIpLmFkZChfYTMpO1xuICAgIHJldHVybiByZXQ7XG59XG5cbmV4cG9ydCBjbGFzcyBDdXJ2ZSB7XG4gICAgY29uc3RydWN0b3IoeyBwb2ludHMgPSBbbmV3IFZlYzMoMCwgMCwgMCksIG5ldyBWZWMzKDAsIDEsIDApLCBuZXcgVmVjMygxLCAxLCAwKSwgbmV3IFZlYzMoMSwgMCwgMCldLCBkaXZpc2lvbnMgPSAxMiwgdHlwZSA9IENBVE1VTExST00gfSA9IHt9KSB7XG4gICAgICAgIHRoaXMucG9pbnRzID0gcG9pbnRzO1xuICAgICAgICB0aGlzLmRpdmlzaW9ucyA9IGRpdmlzaW9ucztcbiAgICAgICAgdGhpcy50eXBlID0gdHlwZTtcbiAgICB9XG5cbiAgICBfZ2V0UXVhZHJhdGljQmV6aWVyUG9pbnRzKGRpdmlzaW9ucyA9IHRoaXMuZGl2aXNpb25zKSB7XG4gICAgICAgIGNvbnN0IHBvaW50cyA9IFtdO1xuICAgICAgICBjb25zdCBjb3VudCA9IHRoaXMucG9pbnRzLmxlbmd0aDtcblxuICAgICAgICBpZiAoY291bnQgPCAzKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oJ05vdCBlbm91Z2ggcG9pbnRzIHByb3ZpZGVkLicpO1xuICAgICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgcDAgPSB0aGlzLnBvaW50c1swXTtcbiAgICAgICAgbGV0IGMwID0gdGhpcy5wb2ludHNbMV0sXG4gICAgICAgICAgICBwMSA9IHRoaXMucG9pbnRzWzJdO1xuXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDw9IGRpdmlzaW9uczsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBwID0gZ2V0UXVhZHJhdGljQmV6aWVyUG9pbnQoaSAvIGRpdmlzaW9ucywgcDAsIGMwLCBwMSk7XG4gICAgICAgICAgICBwb2ludHMucHVzaChwKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBvZmZzZXQgPSAzO1xuICAgICAgICB3aGlsZSAoY291bnQgLSBvZmZzZXQgPiAwKSB7XG4gICAgICAgICAgICBwMC5jb3B5KHAxKTtcbiAgICAgICAgICAgIGMwID0gcDEuc2NhbGUoMikuc3ViKGMwKTtcbiAgICAgICAgICAgIHAxID0gdGhpcy5wb2ludHNbb2Zmc2V0XTtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAxOyBpIDw9IGRpdmlzaW9uczsgaSsrKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcCA9IGdldFF1YWRyYXRpY0JlemllclBvaW50KGkgLyBkaXZpc2lvbnMsIHAwLCBjMCwgcDEpO1xuICAgICAgICAgICAgICAgIHBvaW50cy5wdXNoKHApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgb2Zmc2V0Kys7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcG9pbnRzO1xuICAgIH1cblxuICAgIF9nZXRDdWJpY0JlemllclBvaW50cyhkaXZpc2lvbnMgPSB0aGlzLmRpdmlzaW9ucykge1xuICAgICAgICBjb25zdCBwb2ludHMgPSBbXTtcbiAgICAgICAgY29uc3QgY291bnQgPSB0aGlzLnBvaW50cy5sZW5ndGg7XG5cbiAgICAgICAgaWYgKGNvdW50IDwgNCkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKCdOb3QgZW5vdWdoIHBvaW50cyBwcm92aWRlZC4nKTtcbiAgICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBwMCA9IHRoaXMucG9pbnRzWzBdLFxuICAgICAgICAgICAgYzAgPSB0aGlzLnBvaW50c1sxXSxcbiAgICAgICAgICAgIGMxID0gdGhpcy5wb2ludHNbMl0sXG4gICAgICAgICAgICBwMSA9IHRoaXMucG9pbnRzWzNdO1xuXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDw9IGRpdmlzaW9uczsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBwID0gZ2V0Q3ViaWNCZXppZXJQb2ludChpIC8gZGl2aXNpb25zLCBwMCwgYzAsIGMxLCBwMSk7XG4gICAgICAgICAgICBwb2ludHMucHVzaChwKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBvZmZzZXQgPSA0O1xuICAgICAgICB3aGlsZSAoY291bnQgLSBvZmZzZXQgPiAxKSB7XG4gICAgICAgICAgICBwMC5jb3B5KHAxKTtcbiAgICAgICAgICAgIGMwID0gcDEuc2NhbGUoMikuc3ViKGMxKTtcbiAgICAgICAgICAgIGMxID0gdGhpcy5wb2ludHNbb2Zmc2V0XTtcbiAgICAgICAgICAgIHAxID0gdGhpcy5wb2ludHNbb2Zmc2V0ICsgMV07XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMTsgaSA8PSBkaXZpc2lvbnM7IGkrKykge1xuICAgICAgICAgICAgICAgIGNvbnN0IHAgPSBnZXRDdWJpY0JlemllclBvaW50KGkgLyBkaXZpc2lvbnMsIHAwLCBjMCwgYzEsIHAxKTtcbiAgICAgICAgICAgICAgICBwb2ludHMucHVzaChwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG9mZnNldCArPSAyO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHBvaW50cztcbiAgICB9XG5cbiAgICBfZ2V0Q2F0bXVsbFJvbVBvaW50cyhkaXZpc2lvbnMgPSB0aGlzLmRpdmlzaW9ucywgYSA9IDAuMTY4LCBiID0gMC4xNjgpIHtcbiAgICAgICAgY29uc3QgcG9pbnRzID0gW107XG4gICAgICAgIGNvbnN0IGNvdW50ID0gdGhpcy5wb2ludHMubGVuZ3RoO1xuXG4gICAgICAgIGlmIChjb3VudCA8PSAyKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5wb2ludHM7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgcDA7XG4gICAgICAgIHRoaXMucG9pbnRzLmZvckVhY2goKHAsIGkpID0+IHtcbiAgICAgICAgICAgIGlmIChpID09PSAwKSB7XG4gICAgICAgICAgICAgICAgcDAgPSBwO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zdCBbYzAsIGMxXSA9IGdldEN0cmxQb2ludCh0aGlzLnBvaW50cywgaSAtIDEsIGEsIGIpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGMgPSBuZXcgQ3VydmUoe1xuICAgICAgICAgICAgICAgICAgICBwb2ludHM6IFtwMCwgYzAsIGMxLCBwXSxcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogQ1VCSUNCRVpJRVIsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgcG9pbnRzLnBvcCgpO1xuICAgICAgICAgICAgICAgIHBvaW50cy5wdXNoKC4uLmMuZ2V0UG9pbnRzKGRpdmlzaW9ucykpO1xuICAgICAgICAgICAgICAgIHAwID0gcDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHBvaW50cztcbiAgICB9XG5cbiAgICBnZXRQb2ludHMoZGl2aXNpb25zID0gdGhpcy5kaXZpc2lvbnMsIGEgPSAwLjE2OCwgYiA9IDAuMTY4KSB7XG4gICAgICAgIGNvbnN0IHR5cGUgPSB0aGlzLnR5cGU7XG5cbiAgICAgICAgaWYgKHR5cGUgPT09IFFVQURSQVRJQ0JFWklFUikge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2dldFF1YWRyYXRpY0JlemllclBvaW50cyhkaXZpc2lvbnMpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHR5cGUgPT09IENVQklDQkVaSUVSKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fZ2V0Q3ViaWNCZXppZXJQb2ludHMoZGl2aXNpb25zKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0eXBlID09PSBDQVRNVUxMUk9NKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fZ2V0Q2F0bXVsbFJvbVBvaW50cyhkaXZpc2lvbnMsIGEsIGIpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXMucG9pbnRzO1xuICAgIH1cbn1cblxuQ3VydmUuQ0FUTVVMTFJPTSA9IENBVE1VTExST007XG5DdXJ2ZS5DVUJJQ0JFWklFUiA9IENVQklDQkVaSUVSO1xuQ3VydmUuUVVBRFJBVElDQkVaSUVSID0gUVVBRFJBVElDQkVaSUVSO1xuIiwiaW1wb3J0IHsgR2VvbWV0cnkgfSBmcm9tICcuLi9jb3JlL0dlb21ldHJ5LmpzJztcbmltcG9ydCB7IFZlYzMgfSBmcm9tICcuLi9tYXRoL1ZlYzMuanMnO1xuXG5leHBvcnQgY2xhc3MgQ3lsaW5kZXIgZXh0ZW5kcyBHZW9tZXRyeSB7XG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIGdsLFxuICAgICAgICB7XG4gICAgICAgICAgICByYWRpdXNUb3AgPSAwLjUsXG4gICAgICAgICAgICByYWRpdXNCb3R0b20gPSAwLjUsXG4gICAgICAgICAgICBoZWlnaHQgPSAxLFxuICAgICAgICAgICAgcmFkaWFsU2VnbWVudHMgPSA4LFxuICAgICAgICAgICAgaGVpZ2h0U2VnbWVudHMgPSAxLFxuICAgICAgICAgICAgb3BlbkVuZGVkID0gZmFsc2UsXG4gICAgICAgICAgICB0aGV0YVN0YXJ0ID0gMCxcbiAgICAgICAgICAgIHRoZXRhTGVuZ3RoID0gTWF0aC5QSSAqIDIsXG4gICAgICAgICAgICBhdHRyaWJ1dGVzID0ge30sXG4gICAgICAgIH0gPSB7fVxuICAgICkge1xuICAgICAgICBjb25zdCByU2VncyA9IHJhZGlhbFNlZ21lbnRzO1xuICAgICAgICBjb25zdCBoU2VncyA9IGhlaWdodFNlZ21lbnRzO1xuICAgICAgICBjb25zdCB0U3RhcnQgPSB0aGV0YVN0YXJ0O1xuICAgICAgICBjb25zdCB0TGVuZ3RoID0gdGhldGFMZW5ndGg7XG5cbiAgICAgICAgY29uc3QgbnVtQ2FwcyA9IG9wZW5FbmRlZCA/IDAgOiByYWRpdXNCb3R0b20gJiYgcmFkaXVzVG9wID8gMiA6IDE7XG4gICAgICAgIGNvbnN0IG51bSA9IChyU2VncyArIDEpICogKGhTZWdzICsgMSArIG51bUNhcHMpICsgbnVtQ2FwcztcbiAgICAgICAgY29uc3QgbnVtSW5kaWNlcyA9IHJTZWdzICogaFNlZ3MgKiA2ICsgbnVtQ2FwcyAqIHJTZWdzICogMztcblxuICAgICAgICBjb25zdCBwb3NpdGlvbiA9IG5ldyBGbG9hdDMyQXJyYXkobnVtICogMyk7XG4gICAgICAgIGNvbnN0IG5vcm1hbCA9IG5ldyBGbG9hdDMyQXJyYXkobnVtICogMyk7XG4gICAgICAgIGNvbnN0IHV2ID0gbmV3IEZsb2F0MzJBcnJheShudW0gKiAyKTtcbiAgICAgICAgY29uc3QgaW5kZXggPSBudW0gPiA2NTUzNiA/IG5ldyBVaW50MzJBcnJheShudW1JbmRpY2VzKSA6IG5ldyBVaW50MTZBcnJheShudW1JbmRpY2VzKTtcblxuICAgICAgICBsZXQgaSA9IDA7XG4gICAgICAgIGxldCBpaSA9IDA7XG4gICAgICAgIGNvbnN0IGluZGV4QXJyYXkgPSBbXTtcblxuICAgICAgICBhZGRIZWlnaHQoKTtcbiAgICAgICAgaWYgKCFvcGVuRW5kZWQpIHtcbiAgICAgICAgICAgIGlmIChyYWRpdXNUb3ApIGFkZENhcCh0cnVlKTtcbiAgICAgICAgICAgIGlmIChyYWRpdXNCb3R0b20pIGFkZENhcChmYWxzZSk7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBhZGRIZWlnaHQoKSB7XG4gICAgICAgICAgICBsZXQgeCwgeTtcbiAgICAgICAgICAgIGNvbnN0IG4gPSBuZXcgVmVjMygpO1xuICAgICAgICAgICAgY29uc3Qgc2xvcGUgPSAocmFkaXVzQm90dG9tIC0gcmFkaXVzVG9wKSAvIGhlaWdodDtcblxuICAgICAgICAgICAgZm9yICh5ID0gMDsgeSA8PSBoU2VnczsgeSsrKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgaW5kZXhSb3cgPSBbXTtcbiAgICAgICAgICAgICAgICBjb25zdCB2ID0geSAvIGhTZWdzO1xuXG4gICAgICAgICAgICAgICAgY29uc3QgciA9IHYgKiAocmFkaXVzQm90dG9tIC0gcmFkaXVzVG9wKSArIHJhZGl1c1RvcDtcbiAgICAgICAgICAgICAgICBmb3IgKHggPSAwOyB4IDw9IHJTZWdzOyB4KyspIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdSA9IHggLyByU2VncztcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdGhldGEgPSB1ICogdExlbmd0aCArIHRTdGFydDtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc2luVGhldGEgPSBNYXRoLnNpbih0aGV0YSk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvc1RoZXRhID0gTWF0aC5jb3ModGhldGEpO1xuXG4gICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uLnNldChbciAqIHNpblRoZXRhLCAoMC41IC0gdikgKiBoZWlnaHQsIHIgKiBjb3NUaGV0YV0sIGkgKiAzKTtcbiAgICAgICAgICAgICAgICAgICAgbi5zZXQoc2luVGhldGEsIHNsb3BlLCBjb3NUaGV0YSkubm9ybWFsaXplKCk7XG4gICAgICAgICAgICAgICAgICAgIG5vcm1hbC5zZXQoW24ueCwgbi55LCBuLnpdLCBpICogMyk7XG4gICAgICAgICAgICAgICAgICAgIHV2LnNldChbdSwgMSAtIHZdLCBpICogMik7XG4gICAgICAgICAgICAgICAgICAgIGluZGV4Um93LnB1c2goaSsrKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaW5kZXhBcnJheS5wdXNoKGluZGV4Um93KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZm9yICh4ID0gMDsgeCA8IHJTZWdzOyB4KyspIHtcbiAgICAgICAgICAgICAgICBmb3IgKHkgPSAwOyB5IDwgaFNlZ3M7IHkrKykge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBhID0gaW5kZXhBcnJheVt5XVt4XTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgYiA9IGluZGV4QXJyYXlbeSArIDFdW3hdO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBjID0gaW5kZXhBcnJheVt5ICsgMV1beCArIDFdO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBkID0gaW5kZXhBcnJheVt5XVt4ICsgMV07XG5cbiAgICAgICAgICAgICAgICAgICAgaW5kZXguc2V0KFthLCBiLCBkLCBiLCBjLCBkXSwgaWkgKiAzKTtcbiAgICAgICAgICAgICAgICAgICAgaWkgKz0gMjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBhZGRDYXAoaXNUb3ApIHtcbiAgICAgICAgICAgIGxldCB4O1xuICAgICAgICAgICAgY29uc3QgciA9IGlzVG9wID09PSB0cnVlID8gcmFkaXVzVG9wIDogcmFkaXVzQm90dG9tO1xuICAgICAgICAgICAgY29uc3Qgc2lnbiA9IGlzVG9wID09PSB0cnVlID8gMSA6IC0xO1xuXG4gICAgICAgICAgICBjb25zdCBjZW50ZXJJbmRleCA9IGk7XG4gICAgICAgICAgICBwb3NpdGlvbi5zZXQoWzAsIDAuNSAqIGhlaWdodCAqIHNpZ24sIDBdLCBpICogMyk7XG4gICAgICAgICAgICBub3JtYWwuc2V0KFswLCBzaWduLCAwXSwgaSAqIDMpO1xuICAgICAgICAgICAgdXYuc2V0KFswLjUsIDAuNV0sIGkgKiAyKTtcbiAgICAgICAgICAgIGkrKztcblxuICAgICAgICAgICAgZm9yICh4ID0gMDsgeCA8PSByU2VnczsgeCsrKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgdSA9IHggLyByU2VncztcbiAgICAgICAgICAgICAgICBjb25zdCB0aGV0YSA9IHUgKiB0TGVuZ3RoICsgdFN0YXJ0O1xuICAgICAgICAgICAgICAgIGNvbnN0IGNvc1RoZXRhID0gTWF0aC5jb3ModGhldGEpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHNpblRoZXRhID0gTWF0aC5zaW4odGhldGEpO1xuXG4gICAgICAgICAgICAgICAgcG9zaXRpb24uc2V0KFtyICogc2luVGhldGEsIDAuNSAqIGhlaWdodCAqIHNpZ24sIHIgKiBjb3NUaGV0YV0sIGkgKiAzKTtcbiAgICAgICAgICAgICAgICBub3JtYWwuc2V0KFswLCBzaWduLCAwXSwgaSAqIDMpO1xuICAgICAgICAgICAgICAgIHV2LnNldChbY29zVGhldGEgKiAwLjUgKyAwLjUsIHNpblRoZXRhICogMC41ICogc2lnbiArIDAuNV0sIGkgKiAyKTtcbiAgICAgICAgICAgICAgICBpKys7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZvciAoeCA9IDA7IHggPCByU2VnczsgeCsrKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgaiA9IGNlbnRlckluZGV4ICsgeCArIDE7XG4gICAgICAgICAgICAgICAgaWYgKGlzVG9wKSB7XG4gICAgICAgICAgICAgICAgICAgIGluZGV4LnNldChbaiwgaiArIDEsIGNlbnRlckluZGV4XSwgaWkgKiAzKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBpbmRleC5zZXQoW2ogKyAxLCBqLCBjZW50ZXJJbmRleF0sIGlpICogMyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlpKys7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBPYmplY3QuYXNzaWduKGF0dHJpYnV0ZXMsIHtcbiAgICAgICAgICAgIHBvc2l0aW9uOiB7IHNpemU6IDMsIGRhdGE6IHBvc2l0aW9uIH0sXG4gICAgICAgICAgICBub3JtYWw6IHsgc2l6ZTogMywgZGF0YTogbm9ybWFsIH0sXG4gICAgICAgICAgICB1djogeyBzaXplOiAyLCBkYXRhOiB1diB9LFxuICAgICAgICAgICAgaW5kZXg6IHsgZGF0YTogaW5kZXggfSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgc3VwZXIoZ2wsIGF0dHJpYnV0ZXMpO1xuICAgIH1cbn1cbiIsImltcG9ydCB7IFJlbmRlclRhcmdldCB9IGZyb20gJy4uL2NvcmUvUmVuZGVyVGFyZ2V0LmpzJztcbmltcG9ydCB7IFByb2dyYW0gfSBmcm9tICcuLi9jb3JlL1Byb2dyYW0uanMnO1xuaW1wb3J0IHsgTWVzaCB9IGZyb20gJy4uL2NvcmUvTWVzaC5qcyc7XG5pbXBvcnQgeyBWZWMyIH0gZnJvbSAnLi4vbWF0aC9WZWMyLmpzJztcbmltcG9ydCB7IFRyaWFuZ2xlIH0gZnJvbSAnLi9UcmlhbmdsZS5qcyc7XG5cbmV4cG9ydCBjbGFzcyBGbG93bWFwIHtcbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgZ2wsXG4gICAgICAgIHtcbiAgICAgICAgICAgIHNpemUgPSAxMjgsIC8vIGRlZmF1bHQgc2l6ZSBvZiB0aGUgcmVuZGVyIHRhcmdldHNcbiAgICAgICAgICAgIGZhbGxvZmYgPSAwLjMsIC8vIHNpemUgb2YgdGhlIHN0YW1wLCBwZXJjZW50YWdlIG9mIHRoZSBzaXplXG4gICAgICAgICAgICBhbHBoYSA9IDEsIC8vIG9wYWNpdHkgb2YgdGhlIHN0YW1wXG4gICAgICAgICAgICBkaXNzaXBhdGlvbiA9IDAuOTgsIC8vIGFmZmVjdHMgdGhlIHNwZWVkIHRoYXQgdGhlIHN0YW1wIGZhZGVzLiBDbG9zZXIgdG8gMSBpcyBzbG93ZXJcbiAgICAgICAgICAgIHR5cGUsIC8vIFBhc3MgaW4gZ2wuRkxPQVQgdG8gZm9yY2UgaXQsIGRlZmF1bHRzIHRvIGdsLkhBTEZfRkxPQVRcbiAgICAgICAgfSA9IHt9XG4gICAgKSB7XG4gICAgICAgIGNvbnN0IF90aGlzID0gdGhpcztcbiAgICAgICAgdGhpcy5nbCA9IGdsO1xuXG4gICAgICAgIC8vIG91dHB1dCB1bmlmb3JtIGNvbnRhaW5pbmcgcmVuZGVyIHRhcmdldCB0ZXh0dXJlc1xuICAgICAgICB0aGlzLnVuaWZvcm0gPSB7IHZhbHVlOiBudWxsIH07XG5cbiAgICAgICAgdGhpcy5tYXNrID0ge1xuICAgICAgICAgICAgcmVhZDogbnVsbCxcbiAgICAgICAgICAgIHdyaXRlOiBudWxsLFxuXG4gICAgICAgICAgICAvLyBIZWxwZXIgZnVuY3Rpb24gdG8gcGluZyBwb25nIHRoZSByZW5kZXIgdGFyZ2V0cyBhbmQgdXBkYXRlIHRoZSB1bmlmb3JtXG4gICAgICAgICAgICBzd2FwOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IHRlbXAgPSBfdGhpcy5tYXNrLnJlYWQ7XG4gICAgICAgICAgICAgICAgX3RoaXMubWFzay5yZWFkID0gX3RoaXMubWFzay53cml0ZTtcbiAgICAgICAgICAgICAgICBfdGhpcy5tYXNrLndyaXRlID0gdGVtcDtcbiAgICAgICAgICAgICAgICBfdGhpcy51bmlmb3JtLnZhbHVlID0gX3RoaXMubWFzay5yZWFkLnRleHR1cmU7XG4gICAgICAgICAgICB9LFxuICAgICAgICB9O1xuXG4gICAgICAgIHtcbiAgICAgICAgICAgIGNyZWF0ZUZCT3MoKTtcblxuICAgICAgICAgICAgdGhpcy5hc3BlY3QgPSAxO1xuICAgICAgICAgICAgdGhpcy5tb3VzZSA9IG5ldyBWZWMyKCk7XG4gICAgICAgICAgICB0aGlzLnZlbG9jaXR5ID0gbmV3IFZlYzIoKTtcblxuICAgICAgICAgICAgdGhpcy5tZXNoID0gaW5pdFByb2dyYW0oKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIGNyZWF0ZUZCT3MoKSB7XG4gICAgICAgICAgICAvLyBSZXF1ZXN0ZWQgdHlwZSBub3Qgc3VwcG9ydGVkLCBmYWxsIGJhY2sgdG8gaGFsZiBmbG9hdFxuICAgICAgICAgICAgaWYgKCF0eXBlKSB0eXBlID0gZ2wuSEFMRl9GTE9BVCB8fCBnbC5yZW5kZXJlci5leHRlbnNpb25zWydPRVNfdGV4dHVyZV9oYWxmX2Zsb2F0J10uSEFMRl9GTE9BVF9PRVM7XG5cbiAgICAgICAgICAgIGxldCBtaW5GaWx0ZXIgPSAoKCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChnbC5yZW5kZXJlci5pc1dlYmdsMikgcmV0dXJuIGdsLkxJTkVBUjtcbiAgICAgICAgICAgICAgICBpZiAoZ2wucmVuZGVyZXIuZXh0ZW5zaW9uc1tgT0VTX3RleHR1cmVfJHt0eXBlID09PSBnbC5GTE9BVCA/ICcnIDogJ2hhbGZfJ31mbG9hdF9saW5lYXJgXSkgcmV0dXJuIGdsLkxJTkVBUjtcbiAgICAgICAgICAgICAgICByZXR1cm4gZ2wuTkVBUkVTVDtcbiAgICAgICAgICAgIH0pKCk7XG5cbiAgICAgICAgICAgIGNvbnN0IG9wdGlvbnMgPSB7XG4gICAgICAgICAgICAgICAgd2lkdGg6IHNpemUsXG4gICAgICAgICAgICAgICAgaGVpZ2h0OiBzaXplLFxuICAgICAgICAgICAgICAgIHR5cGUsXG4gICAgICAgICAgICAgICAgZm9ybWF0OiBnbC5SR0JBLFxuICAgICAgICAgICAgICAgIGludGVybmFsRm9ybWF0OiBnbC5yZW5kZXJlci5pc1dlYmdsMiA/ICh0eXBlID09PSBnbC5GTE9BVCA/IGdsLlJHQkEzMkYgOiBnbC5SR0JBMTZGKSA6IGdsLlJHQkEsXG4gICAgICAgICAgICAgICAgbWluRmlsdGVyLFxuICAgICAgICAgICAgICAgIGRlcHRoOiBmYWxzZSxcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIF90aGlzLm1hc2sucmVhZCA9IG5ldyBSZW5kZXJUYXJnZXQoZ2wsIG9wdGlvbnMpO1xuICAgICAgICAgICAgX3RoaXMubWFzay53cml0ZSA9IG5ldyBSZW5kZXJUYXJnZXQoZ2wsIG9wdGlvbnMpO1xuICAgICAgICAgICAgX3RoaXMubWFzay5zd2FwKCk7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBpbml0UHJvZ3JhbSgpIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgTWVzaChnbCwge1xuICAgICAgICAgICAgICAgIC8vIFRyaWFuZ2xlIHRoYXQgaW5jbHVkZXMgLTEgdG8gMSByYW5nZSBmb3IgJ3Bvc2l0aW9uJywgYW5kIDAgdG8gMSByYW5nZSBmb3IgJ3V2Jy5cbiAgICAgICAgICAgICAgICBnZW9tZXRyeTogbmV3IFRyaWFuZ2xlKGdsKSxcblxuICAgICAgICAgICAgICAgIHByb2dyYW06IG5ldyBQcm9ncmFtKGdsLCB7XG4gICAgICAgICAgICAgICAgICAgIHZlcnRleCxcbiAgICAgICAgICAgICAgICAgICAgZnJhZ21lbnQsXG4gICAgICAgICAgICAgICAgICAgIHVuaWZvcm1zOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0TWFwOiBfdGhpcy51bmlmb3JtLFxuXG4gICAgICAgICAgICAgICAgICAgICAgICB1RmFsbG9mZjogeyB2YWx1ZTogZmFsbG9mZiAqIDAuNSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgdUFscGhhOiB7IHZhbHVlOiBhbHBoYSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgdURpc3NpcGF0aW9uOiB7IHZhbHVlOiBkaXNzaXBhdGlvbiB9LFxuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBVc2VyIG5lZWRzIHRvIHVwZGF0ZSB0aGVzZVxuICAgICAgICAgICAgICAgICAgICAgICAgdUFzcGVjdDogeyB2YWx1ZTogMSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgdU1vdXNlOiB7IHZhbHVlOiBfdGhpcy5tb3VzZSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgdVZlbG9jaXR5OiB7IHZhbHVlOiBfdGhpcy52ZWxvY2l0eSB9LFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBkZXB0aFRlc3Q6IGZhbHNlLFxuICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB1cGRhdGUoKSB7XG4gICAgICAgIHRoaXMubWVzaC5wcm9ncmFtLnVuaWZvcm1zLnVBc3BlY3QudmFsdWUgPSB0aGlzLmFzcGVjdDtcblxuICAgICAgICB0aGlzLmdsLnJlbmRlcmVyLnJlbmRlcih7XG4gICAgICAgICAgICBzY2VuZTogdGhpcy5tZXNoLFxuICAgICAgICAgICAgdGFyZ2V0OiB0aGlzLm1hc2sud3JpdGUsXG4gICAgICAgICAgICBjbGVhcjogZmFsc2UsXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLm1hc2suc3dhcCgpO1xuICAgIH1cbn1cblxuY29uc3QgdmVydGV4ID0gLyogZ2xzbCAqLyBgXG4gICAgYXR0cmlidXRlIHZlYzIgdXY7XG4gICAgYXR0cmlidXRlIHZlYzIgcG9zaXRpb247XG5cbiAgICB2YXJ5aW5nIHZlYzIgdlV2O1xuXG4gICAgdm9pZCBtYWluKCkge1xuICAgICAgICB2VXYgPSB1djtcbiAgICAgICAgZ2xfUG9zaXRpb24gPSB2ZWM0KHBvc2l0aW9uLCAwLCAxKTtcbiAgICB9XG5gO1xuXG5jb25zdCBmcmFnbWVudCA9IC8qIGdsc2wgKi8gYFxuICAgIHByZWNpc2lvbiBoaWdocCBmbG9hdDtcblxuICAgIHVuaWZvcm0gc2FtcGxlcjJEIHRNYXA7XG5cbiAgICB1bmlmb3JtIGZsb2F0IHVGYWxsb2ZmO1xuICAgIHVuaWZvcm0gZmxvYXQgdUFscGhhO1xuICAgIHVuaWZvcm0gZmxvYXQgdURpc3NpcGF0aW9uO1xuICAgIFxuICAgIHVuaWZvcm0gZmxvYXQgdUFzcGVjdDtcbiAgICB1bmlmb3JtIHZlYzIgdU1vdXNlO1xuICAgIHVuaWZvcm0gdmVjMiB1VmVsb2NpdHk7XG5cbiAgICB2YXJ5aW5nIHZlYzIgdlV2O1xuXG4gICAgdm9pZCBtYWluKCkge1xuICAgICAgICB2ZWM0IGNvbG9yID0gdGV4dHVyZTJEKHRNYXAsIHZVdikgKiB1RGlzc2lwYXRpb247XG5cbiAgICAgICAgdmVjMiBjdXJzb3IgPSB2VXYgLSB1TW91c2U7XG4gICAgICAgIGN1cnNvci54ICo9IHVBc3BlY3Q7XG5cbiAgICAgICAgdmVjMyBzdGFtcCA9IHZlYzModVZlbG9jaXR5ICogdmVjMigxLCAtMSksIDEuMCAtIHBvdygxLjAgLSBtaW4oMS4wLCBsZW5ndGgodVZlbG9jaXR5KSksIDMuMCkpO1xuICAgICAgICBmbG9hdCBmYWxsb2ZmID0gc21vb3Roc3RlcCh1RmFsbG9mZiwgMC4wLCBsZW5ndGgoY3Vyc29yKSkgKiB1QWxwaGE7XG5cbiAgICAgICAgY29sb3IucmdiID0gbWl4KGNvbG9yLnJnYiwgc3RhbXAsIHZlYzMoZmFsbG9mZikpO1xuXG4gICAgICAgIGdsX0ZyYWdDb2xvciA9IGNvbG9yO1xuICAgIH1cbmA7XG4iLCJpbXBvcnQgeyBWZWMzIH0gZnJvbSAnLi4vbWF0aC9WZWMzLmpzJztcbmltcG9ydCB7IFF1YXQgfSBmcm9tICcuLi9tYXRoL1F1YXQuanMnO1xuXG5jb25zdCB0bXBWZWMzQSA9IG5ldyBWZWMzKCk7XG5jb25zdCB0bXBWZWMzQiA9IG5ldyBWZWMzKCk7XG5jb25zdCB0bXBWZWMzQyA9IG5ldyBWZWMzKCk7XG5jb25zdCB0bXBWZWMzRCA9IG5ldyBWZWMzKCk7XG5cbmNvbnN0IHRtcFF1YXRBID0gbmV3IFF1YXQoKTtcbmNvbnN0IHRtcFF1YXRCID0gbmV3IFF1YXQoKTtcbmNvbnN0IHRtcFF1YXRDID0gbmV3IFF1YXQoKTtcbmNvbnN0IHRtcFF1YXREID0gbmV3IFF1YXQoKTtcblxuZXhwb3J0IGNsYXNzIEdMVEZBbmltYXRpb24ge1xuICAgIGNvbnN0cnVjdG9yKGRhdGEsIHdlaWdodCA9IDEpIHtcbiAgICAgICAgdGhpcy5kYXRhID0gZGF0YTtcbiAgICAgICAgdGhpcy5lbGFwc2VkID0gMDtcbiAgICAgICAgdGhpcy53ZWlnaHQgPSB3ZWlnaHQ7XG5cbiAgICAgICAgLy8gU2V0IHRvIGZhbHNlIHRvIG5vdCBhcHBseSBtb2R1bG8gdG8gZWxhcHNlZCBhZ2FpbnN0IGR1cmF0aW9uXG4gICAgICAgIHRoaXMubG9vcCA9IHRydWU7XG5cbiAgICAgICAgLy8gRmluZCBzdGFydGluZyB0aW1lIGFzIGV4cG9ydHMgZnJvbSBibGVuZGVyIChwZXJoYXBzIG90aGVycyB0b28pIGRvbid0IGFsd2F5cyBzdGFydCBmcm9tIDBcbiAgICAgICAgdGhpcy5zdGFydFRpbWUgPSBkYXRhLnJlZHVjZSgoYSwgeyB0aW1lcyB9KSA9PiBNYXRoLm1pbihhLCB0aW1lc1swXSksIEluZmluaXR5KTtcbiAgICAgICAgLy8gR2V0IGxhcmdlc3QgZmluYWwgdGltZSBpbiBhbGwgY2hhbm5lbHMgdG8gY2FsY3VsYXRlIGR1cmF0aW9uXG4gICAgICAgIHRoaXMuZW5kVGltZSA9IGRhdGEucmVkdWNlKChhLCB7IHRpbWVzIH0pID0+IE1hdGgubWF4KGEsIHRpbWVzW3RpbWVzLmxlbmd0aCAtIDFdKSwgMCk7XG4gICAgICAgIHRoaXMuZHVyYXRpb24gPSB0aGlzLmVuZFRpbWUgLSB0aGlzLnN0YXJ0VGltZTtcbiAgICB9XG5cbiAgICB1cGRhdGUodG90YWxXZWlnaHQgPSAxLCBpc1NldCkge1xuICAgICAgICBjb25zdCB3ZWlnaHQgPSBpc1NldCA/IDEgOiB0aGlzLndlaWdodCAvIHRvdGFsV2VpZ2h0O1xuICAgICAgICBjb25zdCBlbGFwc2VkID0gKHRoaXMubG9vcCA/IHRoaXMuZWxhcHNlZCAlIHRoaXMuZHVyYXRpb24gOiBNYXRoLm1pbih0aGlzLmVsYXBzZWQsIHRoaXMuZHVyYXRpb24gLSAwLjAwMSkpICsgdGhpcy5zdGFydFRpbWU7XG5cbiAgICAgICAgdGhpcy5kYXRhLmZvckVhY2goKHsgbm9kZSwgdHJhbnNmb3JtLCBpbnRlcnBvbGF0aW9uLCB0aW1lcywgdmFsdWVzIH0pID0+IHtcbiAgICAgICAgICAgIC8vIEdldCBpbmRleCBvZiB0d28gdGltZSB2YWx1ZXMgZWxhcHNlZCBpcyBiZXR3ZWVuXG4gICAgICAgICAgICBjb25zdCBwcmV2SW5kZXggPVxuICAgICAgICAgICAgICAgIE1hdGgubWF4KFxuICAgICAgICAgICAgICAgICAgICAxLFxuICAgICAgICAgICAgICAgICAgICB0aW1lcy5maW5kSW5kZXgoKHQpID0+IHQgPiBlbGFwc2VkKVxuICAgICAgICAgICAgICAgICkgLSAxO1xuICAgICAgICAgICAgY29uc3QgbmV4dEluZGV4ID0gcHJldkluZGV4ICsgMTtcblxuICAgICAgICAgICAgLy8gR2V0IGxpbmVhciBibGVuZC9hbHBoYSBiZXR3ZWVuIHRoZSB0d29cbiAgICAgICAgICAgIGxldCBhbHBoYSA9IChlbGFwc2VkIC0gdGltZXNbcHJldkluZGV4XSkgLyAodGltZXNbbmV4dEluZGV4XSAtIHRpbWVzW3ByZXZJbmRleF0pO1xuICAgICAgICAgICAgaWYgKGludGVycG9sYXRpb24gPT09ICdTVEVQJykgYWxwaGEgPSAwO1xuXG4gICAgICAgICAgICBsZXQgcHJldlZhbCA9IHRtcFZlYzNBO1xuICAgICAgICAgICAgbGV0IHByZXZUYW4gPSB0bXBWZWMzQjtcbiAgICAgICAgICAgIGxldCBuZXh0VGFuID0gdG1wVmVjM0M7XG4gICAgICAgICAgICBsZXQgbmV4dFZhbCA9IHRtcFZlYzNEO1xuICAgICAgICAgICAgbGV0IHNpemUgPSAzO1xuXG4gICAgICAgICAgICBpZiAodHJhbnNmb3JtID09PSAncXVhdGVybmlvbicpIHtcbiAgICAgICAgICAgICAgICBwcmV2VmFsID0gdG1wUXVhdEE7XG4gICAgICAgICAgICAgICAgcHJldlRhbiA9IHRtcFF1YXRCO1xuICAgICAgICAgICAgICAgIG5leHRUYW4gPSB0bXBRdWF0QztcbiAgICAgICAgICAgICAgICBuZXh0VmFsID0gdG1wUXVhdEQ7XG4gICAgICAgICAgICAgICAgc2l6ZSA9IDQ7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChpbnRlcnBvbGF0aW9uID09PSAnQ1VCSUNTUExJTkUnKSB7XG4gICAgICAgICAgICAgICAgLy8gR2V0IHRoZSBwcmV2IGFuZCBuZXh0IHZhbHVlcyBmcm9tIHRoZSBpbmRpY2VzXG4gICAgICAgICAgICAgICAgcHJldlZhbC5mcm9tQXJyYXkodmFsdWVzLCBwcmV2SW5kZXggKiBzaXplICogMyArIHNpemUgKiAxKTtcbiAgICAgICAgICAgICAgICBwcmV2VGFuLmZyb21BcnJheSh2YWx1ZXMsIHByZXZJbmRleCAqIHNpemUgKiAzICsgc2l6ZSAqIDIpO1xuICAgICAgICAgICAgICAgIG5leHRUYW4uZnJvbUFycmF5KHZhbHVlcywgbmV4dEluZGV4ICogc2l6ZSAqIDMgKyBzaXplICogMCk7XG4gICAgICAgICAgICAgICAgbmV4dFZhbC5mcm9tQXJyYXkodmFsdWVzLCBuZXh0SW5kZXggKiBzaXplICogMyArIHNpemUgKiAxKTtcblxuICAgICAgICAgICAgICAgIC8vIGludGVycG9sYXRlIGZvciBmaW5hbCB2YWx1ZVxuICAgICAgICAgICAgICAgIHByZXZWYWwgPSB0aGlzLmN1YmljU3BsaW5lSW50ZXJwb2xhdGUoYWxwaGEsIHByZXZWYWwsIHByZXZUYW4sIG5leHRUYW4sIG5leHRWYWwpO1xuICAgICAgICAgICAgICAgIGlmIChzaXplID09PSA0KSBwcmV2VmFsLm5vcm1hbGl6ZSgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBHZXQgdGhlIHByZXYgYW5kIG5leHQgdmFsdWVzIGZyb20gdGhlIGluZGljZXNcbiAgICAgICAgICAgICAgICBwcmV2VmFsLmZyb21BcnJheSh2YWx1ZXMsIHByZXZJbmRleCAqIHNpemUpO1xuICAgICAgICAgICAgICAgIG5leHRWYWwuZnJvbUFycmF5KHZhbHVlcywgbmV4dEluZGV4ICogc2l6ZSk7XG5cbiAgICAgICAgICAgICAgICAvLyBpbnRlcnBvbGF0ZSBmb3IgZmluYWwgdmFsdWVcbiAgICAgICAgICAgICAgICBpZiAoc2l6ZSA9PT0gNCkgcHJldlZhbC5zbGVycChuZXh0VmFsLCBhbHBoYSk7XG4gICAgICAgICAgICAgICAgZWxzZSBwcmV2VmFsLmxlcnAobmV4dFZhbCwgYWxwaGEpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBpbnRlcnBvbGF0ZSBiZXR3ZWVuIG11bHRpcGxlIHBvc3NpYmxlIGFuaW1hdGlvbnNcbiAgICAgICAgICAgIGlmIChzaXplID09PSA0KSBub2RlW3RyYW5zZm9ybV0uc2xlcnAocHJldlZhbCwgd2VpZ2h0KTtcbiAgICAgICAgICAgIGVsc2Ugbm9kZVt0cmFuc2Zvcm1dLmxlcnAocHJldlZhbCwgd2VpZ2h0KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgY3ViaWNTcGxpbmVJbnRlcnBvbGF0ZSh0LCBwcmV2VmFsLCBwcmV2VGFuLCBuZXh0VGFuLCBuZXh0VmFsKSB7XG4gICAgICAgIGNvbnN0IHQyID0gdCAqIHQ7XG4gICAgICAgIGNvbnN0IHQzID0gdDIgKiB0O1xuXG4gICAgICAgIGNvbnN0IHMyID0gMyAqIHQyIC0gMiAqIHQzO1xuICAgICAgICBjb25zdCBzMyA9IHQzIC0gdDI7XG4gICAgICAgIGNvbnN0IHMwID0gMSAtIHMyO1xuICAgICAgICBjb25zdCBzMSA9IHMzIC0gdDIgKyB0O1xuXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcHJldlZhbC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgcHJldlZhbFtpXSA9IHMwICogcHJldlZhbFtpXSArIHMxICogKDEgLSB0KSAqIHByZXZUYW5baV0gKyBzMiAqIG5leHRWYWxbaV0gKyBzMyAqIHQgKiBuZXh0VGFuW2ldO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHByZXZWYWw7XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgR2VvbWV0cnkgfSBmcm9tICcuLi9jb3JlL0dlb21ldHJ5LmpzJztcbmltcG9ydCB7IFRyYW5zZm9ybSB9IGZyb20gJy4uL2NvcmUvVHJhbnNmb3JtLmpzJztcbmltcG9ydCB7IFRleHR1cmUgfSBmcm9tICcuLi9jb3JlL1RleHR1cmUuanMnO1xuaW1wb3J0IHsgTWVzaCB9IGZyb20gJy4uL2NvcmUvTWVzaC5qcyc7XG5pbXBvcnQgeyBHTFRGQW5pbWF0aW9uIH0gZnJvbSAnLi9HTFRGQW5pbWF0aW9uLmpzJztcbmltcG9ydCB7IEdMVEZTa2luIH0gZnJvbSAnLi9HTFRGU2tpbi5qcyc7XG5pbXBvcnQgeyBNYXQ0IH0gZnJvbSAnLi4vbWF0aC9NYXQ0LmpzJztcbmltcG9ydCB7IE5vcm1hbFByb2dyYW0gfSBmcm9tICcuL05vcm1hbFByb2dyYW0uanMnO1xuXG4vLyBTdXBwb3J0c1xuLy8gW3hdIEdlb21ldHJ5XG4vLyBbIF0gU3BhcnNlIHN1cHBvcnRcbi8vIFt4XSBOb2RlcyBhbmQgSGllcmFyY2h5XG4vLyBbeF0gSW5zdGFuY2luZ1xuLy8gWyBdIE1vcnBoIFRhcmdldHNcbi8vIFt4XSBTa2luc1xuLy8gWyBdIE1hdGVyaWFsc1xuLy8gW3hdIFRleHR1cmVzXG4vLyBbeF0gQW5pbWF0aW9uXG4vLyBbIF0gQ2FtZXJhc1xuLy8gWyBdIEV4dGVuc2lvbnNcbi8vIFt4XSBHTEIgc3VwcG9ydFxuXG4vLyBUT0RPOiBTcGFyc2UgYWNjZXNzb3IgcGFja2luZz8gRm9yIG1vcnBoIHRhcmdldHMgYmFzaWNhbGx5XG4vLyBUT0RPOiBpbml0IGFjY2Vzc29yIG1pc3NpbmcgYnVmZmVyVmlldyB3aXRoIDBzXG4vLyBUT0RPOiBtb3JwaCB0YXJnZXQgYW5pbWF0aW9uc1xuLy8gVE9ETzogd2hhdCB0byBkbyBpZiBtdWx0aXBsZSBpbnN0YW5jZXMgYXJlIGluIGRpZmZlcmVudCBncm91cHM/IE9ubHkgdXNlcyBsb2NhbCBtYXRyaWNlc1xuLy8gVE9ETzogd2hhdCBpZiBpbnN0YW5jaW5nIGlzbid0IHdhbnRlZD8gRWcgY29sbGlzaW9uIG1hcHNcbi8vIFRPRE86IGllMTEgZmFsbGJhY2sgZm9yIFRleHREZWNvZGVyP1xuXG5jb25zdCBUWVBFX0FSUkFZID0ge1xuICAgIDUxMjE6IFVpbnQ4QXJyYXksXG4gICAgNTEyMjogSW50MTZBcnJheSxcbiAgICA1MTIzOiBVaW50MTZBcnJheSxcbiAgICA1MTI1OiBVaW50MzJBcnJheSxcbiAgICA1MTI2OiBGbG9hdDMyQXJyYXksXG4gICAgJ2ltYWdlL2pwZWcnOiBVaW50OEFycmF5LFxuICAgICdpbWFnZS9wbmcnOiBVaW50OEFycmF5LFxufTtcblxuY29uc3QgVFlQRV9TSVpFID0ge1xuICAgIFNDQUxBUjogMSxcbiAgICBWRUMyOiAyLFxuICAgIFZFQzM6IDMsXG4gICAgVkVDNDogNCxcbiAgICBNQVQyOiA0LFxuICAgIE1BVDM6IDksXG4gICAgTUFUNDogMTYsXG59O1xuXG5jb25zdCBBVFRSSUJVVEVTID0ge1xuICAgIFBPU0lUSU9OOiAncG9zaXRpb24nLFxuICAgIE5PUk1BTDogJ25vcm1hbCcsXG4gICAgVEFOR0VOVDogJ3RhbmdlbnQnLFxuICAgIFRFWENPT1JEXzA6ICd1dicsXG4gICAgVEVYQ09PUkRfMTogJ3V2MicsXG4gICAgQ09MT1JfMDogJ2NvbG9yJyxcbiAgICBXRUlHSFRTXzA6ICdza2luV2VpZ2h0JyxcbiAgICBKT0lOVFNfMDogJ3NraW5JbmRleCcsXG59O1xuXG5jb25zdCBUUkFOU0ZPUk1TID0ge1xuICAgIHRyYW5zbGF0aW9uOiAncG9zaXRpb24nLFxuICAgIHJvdGF0aW9uOiAncXVhdGVybmlvbicsXG4gICAgc2NhbGU6ICdzY2FsZScsXG59O1xuXG5leHBvcnQgY2xhc3MgR0xURkxvYWRlciB7XG4gICAgc3RhdGljIGFzeW5jIGxvYWQoZ2wsIHNyYykge1xuICAgICAgICBjb25zdCBkaXIgPSBzcmMuc3BsaXQoJy8nKS5zbGljZSgwLCAtMSkuam9pbignLycpICsgJy8nO1xuXG4gICAgICAgIC8vIGxvYWQgbWFpbiBkZXNjcmlwdGlvbiBqc29uXG4gICAgICAgIGNvbnN0IGRlc2MgPSBhd2FpdCB0aGlzLnBhcnNlRGVzYyhzcmMpO1xuXG4gICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnBhcnNlKGdsLCBkZXNjLCBkaXIpO1xuICAgIH1cblxuICAgIHN0YXRpYyBhc3luYyBwYXJzZShnbCwgZGVzYywgZGlyKSB7XG4gICAgICAgIGlmIChkZXNjLmFzc2V0ID09PSB1bmRlZmluZWQgfHwgZGVzYy5hc3NldC52ZXJzaW9uWzBdIDwgMikgY29uc29sZS53YXJuKCdPbmx5IEdMVEYgPj0yLjAgc3VwcG9ydGVkLiBBdHRlbXB0aW5nIHRvIHBhcnNlLicpO1xuXG4gICAgICAgIC8vIExvYWQgYnVmZmVycyBhc3luY1xuICAgICAgICBjb25zdCBidWZmZXJzID0gYXdhaXQgdGhpcy5sb2FkQnVmZmVycyhkZXNjLCBkaXIpO1xuXG4gICAgICAgIC8vIFVuYmluZCBjdXJyZW50IFZBTyBzbyB0aGF0IG5ldyBidWZmZXJzIGRvbid0IGdldCBhZGRlZCB0byBhY3RpdmUgbWVzaFxuICAgICAgICBnbC5yZW5kZXJlci5iaW5kVmVydGV4QXJyYXkobnVsbCk7XG5cbiAgICAgICAgLy8gQ3JlYXRlIGdsIGJ1ZmZlcnMgZnJvbSBidWZmZXJWaWV3c1xuICAgICAgICBjb25zdCBidWZmZXJWaWV3cyA9IHRoaXMucGFyc2VCdWZmZXJWaWV3cyhnbCwgZGVzYywgYnVmZmVycyk7XG5cbiAgICAgICAgLy8gQ3JlYXRlIGltYWdlcyBmcm9tIGVpdGhlciBidWZmZXJWaWV3cyBvciBzZXBhcmF0ZSBpbWFnZSBmaWxlc1xuICAgICAgICBjb25zdCBpbWFnZXMgPSB0aGlzLnBhcnNlSW1hZ2VzKGdsLCBkZXNjLCBkaXIsIGJ1ZmZlclZpZXdzKTtcblxuICAgICAgICBjb25zdCB0ZXh0dXJlcyA9IHRoaXMucGFyc2VUZXh0dXJlcyhnbCwgZGVzYywgaW1hZ2VzKTtcblxuICAgICAgICAvLyBKdXN0IHBhc3MgdGhyb3VnaCBtYXRlcmlhbCBkYXRhIGZvciBub3dcbiAgICAgICAgY29uc3QgbWF0ZXJpYWxzID0gdGhpcy5wYXJzZU1hdGVyaWFscyhnbCwgZGVzYywgdGV4dHVyZXMpO1xuXG4gICAgICAgIC8vIEZldGNoIHRoZSBpbnZlcnNlIGJpbmQgbWF0cmljZXMgZm9yIHNrZWxldG9uIGpvaW50c1xuICAgICAgICBjb25zdCBza2lucyA9IHRoaXMucGFyc2VTa2lucyhnbCwgZGVzYywgYnVmZmVyVmlld3MpO1xuXG4gICAgICAgIC8vIENyZWF0ZSBnZW9tZXRyaWVzIGZvciBlYWNoIG1lc2ggcHJpbWl0aXZlXG4gICAgICAgIGNvbnN0IG1lc2hlcyA9IHRoaXMucGFyc2VNZXNoZXMoZ2wsIGRlc2MsIGJ1ZmZlclZpZXdzLCBtYXRlcmlhbHMsIHNraW5zKTtcblxuICAgICAgICAvLyBDcmVhdGUgdHJhbnNmb3JtcywgbWVzaGVzIGFuZCBoaWVyYXJjaHlcbiAgICAgICAgY29uc3Qgbm9kZXMgPSB0aGlzLnBhcnNlTm9kZXMoZ2wsIGRlc2MsIG1lc2hlcywgc2tpbnMpO1xuXG4gICAgICAgIC8vIFBsYWNlIG5vZGVzIGluIHNrZWxldG9uc1xuICAgICAgICB0aGlzLnBvcHVsYXRlU2tpbnMoc2tpbnMsIG5vZGVzKTtcblxuICAgICAgICAvLyBDcmVhdGUgYW5pbWF0aW9uIGhhbmRsZXJzXG4gICAgICAgIGNvbnN0IGFuaW1hdGlvbnMgPSB0aGlzLnBhcnNlQW5pbWF0aW9ucyhnbCwgZGVzYywgbm9kZXMsIGJ1ZmZlclZpZXdzKTtcblxuICAgICAgICAvLyBHZXQgdG9wIGxldmVsIG5vZGVzIGZvciBlYWNoIHNjZW5lXG4gICAgICAgIGNvbnN0IHNjZW5lcyA9IHRoaXMucGFyc2VTY2VuZXMoZGVzYywgbm9kZXMpO1xuICAgICAgICBjb25zdCBzY2VuZSA9IHNjZW5lc1tkZXNjLnNjZW5lXTtcblxuICAgICAgICAvLyBSZW1vdmUgbnVsbCBub2RlcyAoaW5zdGFuY2VkIHRyYW5zZm9ybXMpXG4gICAgICAgIGZvciAobGV0IGkgPSBub2Rlcy5sZW5ndGg7IGkgPj0gMDsgaS0tKSBpZiAoIW5vZGVzW2ldKSBub2Rlcy5zcGxpY2UoaSwgMSk7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGpzb246IGRlc2MsXG4gICAgICAgICAgICBidWZmZXJzLFxuICAgICAgICAgICAgYnVmZmVyVmlld3MsXG4gICAgICAgICAgICBpbWFnZXMsXG4gICAgICAgICAgICB0ZXh0dXJlcyxcbiAgICAgICAgICAgIG1hdGVyaWFscyxcbiAgICAgICAgICAgIG1lc2hlcyxcbiAgICAgICAgICAgIG5vZGVzLFxuICAgICAgICAgICAgYW5pbWF0aW9ucyxcbiAgICAgICAgICAgIHNjZW5lcyxcbiAgICAgICAgICAgIHNjZW5lLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIHN0YXRpYyBhc3luYyBwYXJzZURlc2Moc3JjKSB7XG4gICAgICAgIGlmICghc3JjLm1hdGNoKC9cXC5nbGIkLykpIHtcbiAgICAgICAgICAgIHJldHVybiBhd2FpdCBmZXRjaChzcmMpLnRoZW4oKHJlcykgPT4gcmVzLmpzb24oKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gYXdhaXQgZmV0Y2goc3JjKVxuICAgICAgICAgICAgICAgIC50aGVuKChyZXMpID0+IHJlcy5hcnJheUJ1ZmZlcigpKVxuICAgICAgICAgICAgICAgIC50aGVuKChnbGIpID0+IHRoaXMudW5wYWNrR0xCKGdsYikpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gRnJvbSBodHRwczovL2dpdGh1Yi5jb20vZG9ubWNjdXJkeS9nbFRGLVRyYW5zZm9ybS9ibG9iL2U0MTA4Y2MvcGFja2FnZXMvY29yZS9zcmMvaW8vaW8udHMjTDMyXG4gICAgc3RhdGljIHVucGFja0dMQihnbGIpIHtcbiAgICAgICAgLy8gRGVjb2RlIGFuZCB2ZXJpZnkgR0xCIGhlYWRlci5cbiAgICAgICAgY29uc3QgaGVhZGVyID0gbmV3IFVpbnQzMkFycmF5KGdsYiwgMCwgMyk7XG4gICAgICAgIGlmIChoZWFkZXJbMF0gIT09IDB4NDY1NDZjNjcpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBnbFRGIGFzc2V0LicpO1xuICAgICAgICB9IGVsc2UgaWYgKGhlYWRlclsxXSAhPT0gMikge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbnN1cHBvcnRlZCBnbFRGIGJpbmFyeSB2ZXJzaW9uLCBcIiR7aGVhZGVyWzFdfVwiLmApO1xuICAgICAgICB9XG4gICAgICAgIC8vIERlY29kZSBhbmQgdmVyaWZ5IGNodW5rIGhlYWRlcnMuXG4gICAgICAgIGNvbnN0IGpzb25DaHVua0hlYWRlciA9IG5ldyBVaW50MzJBcnJheShnbGIsIDEyLCAyKTtcbiAgICAgICAgY29uc3QganNvbkJ5dGVPZmZzZXQgPSAyMDtcbiAgICAgICAgY29uc3QganNvbkJ5dGVMZW5ndGggPSBqc29uQ2h1bmtIZWFkZXJbMF07XG4gICAgICAgIGlmIChqc29uQ2h1bmtIZWFkZXJbMV0gIT09IDB4NGU0ZjUzNGEpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVW5leHBlY3RlZCBHTEIgbGF5b3V0LicpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gRGVjb2RlIEpTT04uXG4gICAgICAgIGNvbnN0IGpzb25UZXh0ID0gbmV3IFRleHREZWNvZGVyKCkuZGVjb2RlKGdsYi5zbGljZShqc29uQnl0ZU9mZnNldCwganNvbkJ5dGVPZmZzZXQgKyBqc29uQnl0ZUxlbmd0aCkpO1xuICAgICAgICBjb25zdCBqc29uID0gSlNPTi5wYXJzZShqc29uVGV4dCk7XG4gICAgICAgIC8vIEpTT04gb25seVxuICAgICAgICBpZiAoanNvbkJ5dGVPZmZzZXQgKyBqc29uQnl0ZUxlbmd0aCA9PT0gZ2xiLmJ5dGVMZW5ndGgpIHJldHVybiBqc29uO1xuXG4gICAgICAgIGNvbnN0IGJpbmFyeUNodW5rSGVhZGVyID0gbmV3IFVpbnQzMkFycmF5KGdsYiwganNvbkJ5dGVPZmZzZXQgKyBqc29uQnl0ZUxlbmd0aCwgMik7XG4gICAgICAgIGlmIChiaW5hcnlDaHVua0hlYWRlclsxXSAhPT0gMHgwMDRlNDk0Mikge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmV4cGVjdGVkIEdMQiBsYXlvdXQuJyk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gRGVjb2RlIGNvbnRlbnQuXG4gICAgICAgIGNvbnN0IGJpbmFyeUJ5dGVPZmZzZXQgPSBqc29uQnl0ZU9mZnNldCArIGpzb25CeXRlTGVuZ3RoICsgODtcbiAgICAgICAgY29uc3QgYmluYXJ5Qnl0ZUxlbmd0aCA9IGJpbmFyeUNodW5rSGVhZGVyWzBdO1xuICAgICAgICBjb25zdCBiaW5hcnkgPSBnbGIuc2xpY2UoYmluYXJ5Qnl0ZU9mZnNldCwgYmluYXJ5Qnl0ZU9mZnNldCArIGJpbmFyeUJ5dGVMZW5ndGgpO1xuICAgICAgICAvLyBBdHRhY2ggYmluYXJ5IHRvIGJ1ZmZlclxuICAgICAgICBqc29uLmJ1ZmZlcnNbMF0uYmluYXJ5ID0gYmluYXJ5O1xuICAgICAgICByZXR1cm4ganNvbjtcbiAgICB9XG5cbiAgICAvLyBUaHJlZWpzIEdMVEYgTG9hZGVyIGh0dHBzOi8vZ2l0aHViLmNvbS9tcmRvb2IvdGhyZWUuanMvYmxvYi9tYXN0ZXIvZXhhbXBsZXMvanMvbG9hZGVycy9HTFRGTG9hZGVyLmpzI0wxMDg1XG4gICAgc3RhdGljIHJlc29sdmVVUkkodXJpLCBkaXIpIHtcbiAgICAgICAgLy8gSW52YWxpZCBVUklcbiAgICAgICAgaWYgKHR5cGVvZiB1cmkgIT09ICdzdHJpbmcnIHx8IHVyaSA9PT0gJycpIHJldHVybiAnJztcblxuICAgICAgICAvLyBIb3N0IFJlbGF0aXZlIFVSSVxuICAgICAgICBpZiAoL15odHRwcz86XFwvXFwvL2kudGVzdChkaXIpICYmIC9eXFwvLy50ZXN0KHVyaSkpIHtcbiAgICAgICAgICAgIGRpciA9IGRpci5yZXBsYWNlKC8oXmh0dHBzPzpcXC9cXC9bXlxcL10rKS4qL2ksICckMScpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQWJzb2x1dGUgVVJJIGh0dHA6Ly8sIGh0dHBzOi8vLCAvL1xuICAgICAgICBpZiAoL14oaHR0cHM/Oik/XFwvXFwvL2kudGVzdCh1cmkpKSByZXR1cm4gdXJpO1xuXG4gICAgICAgIC8vIERhdGEgVVJJXG4gICAgICAgIGlmICgvXmRhdGE6LiosLiokL2kudGVzdCh1cmkpKSByZXR1cm4gdXJpO1xuXG4gICAgICAgIC8vIEJsb2IgVVJJXG4gICAgICAgIGlmICgvXmJsb2I6LiokL2kudGVzdCh1cmkpKSByZXR1cm4gdXJpO1xuXG4gICAgICAgIC8vIFJlbGF0aXZlIFVSSVxuICAgICAgICByZXR1cm4gZGlyICsgdXJpO1xuICAgIH1cblxuICAgIHN0YXRpYyBhc3luYyBsb2FkQnVmZmVycyhkZXNjLCBkaXIpIHtcbiAgICAgICAgaWYgKCFkZXNjLmJ1ZmZlcnMpIHJldHVybiBudWxsO1xuICAgICAgICByZXR1cm4gYXdhaXQgUHJvbWlzZS5hbGwoXG4gICAgICAgICAgICBkZXNjLmJ1ZmZlcnMubWFwKChidWZmZXIpID0+IHtcbiAgICAgICAgICAgICAgICAvLyBGb3IgR0xCLCBiaW5hcnkgYnVmZmVyIHJlYWR5IHRvIGdvXG4gICAgICAgICAgICAgICAgaWYgKGJ1ZmZlci5iaW5hcnkpIHJldHVybiBidWZmZXIuYmluYXJ5O1xuICAgICAgICAgICAgICAgIGNvbnN0IHVyaSA9IHRoaXMucmVzb2x2ZVVSSShidWZmZXIudXJpLCBkaXIpO1xuICAgICAgICAgICAgICAgIHJldHVybiBmZXRjaCh1cmkpLnRoZW4oKHJlcykgPT4gcmVzLmFycmF5QnVmZmVyKCkpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgcGFyc2VCdWZmZXJWaWV3cyhnbCwgZGVzYywgYnVmZmVycykge1xuICAgICAgICBpZiAoIWRlc2MuYnVmZmVyVmlld3MpIHJldHVybiBudWxsO1xuICAgICAgICAvLyBDbG9uZSB0byBsZWF2ZSBkZXNjcmlwdGlvbiBwdXJlXG4gICAgICAgIGNvbnN0IGJ1ZmZlclZpZXdzID0gZGVzYy5idWZmZXJWaWV3cy5tYXAoKG8pID0+IE9iamVjdC5hc3NpZ24oe30sIG8pKTtcblxuICAgICAgICBkZXNjLm1lc2hlcyAmJlxuICAgICAgICAgICAgZGVzYy5tZXNoZXMuZm9yRWFjaCgoeyBwcmltaXRpdmVzIH0pID0+IHtcbiAgICAgICAgICAgICAgICBwcmltaXRpdmVzLmZvckVhY2goKHsgYXR0cmlidXRlcywgaW5kaWNlcyB9KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIC8vIEZsYWcgYnVmZmVyVmlldyBhcyBhbiBhdHRyaWJ1dGUsIHNvIGl0IGtub3dzIHRvIGNyZWF0ZSBhIGdsIGJ1ZmZlclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBhdHRyIGluIGF0dHJpYnV0ZXMpIGJ1ZmZlclZpZXdzW2Rlc2MuYWNjZXNzb3JzW2F0dHJpYnV0ZXNbYXR0cl1dLmJ1ZmZlclZpZXddLmlzQXR0cmlidXRlID0gdHJ1ZTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoaW5kaWNlcyA9PT0gdW5kZWZpbmVkKSByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIGJ1ZmZlclZpZXdzW2Rlc2MuYWNjZXNzb3JzW2luZGljZXNdLmJ1ZmZlclZpZXddLmlzQXR0cmlidXRlID0gdHJ1ZTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBNYWtlIHN1cmUgaW5kaWNlcyBidWZmZXJWaWV3IGhhdmUgYSB0YXJnZXQgcHJvcGVydHkgZm9yIGdsIGJ1ZmZlciBiaW5kaW5nXG4gICAgICAgICAgICAgICAgICAgIGJ1ZmZlclZpZXdzW2Rlc2MuYWNjZXNzb3JzW2luZGljZXNdLmJ1ZmZlclZpZXddLnRhcmdldCA9IGdsLkVMRU1FTlRfQVJSQVlfQlVGRkVSO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gR2V0IGNvbXBvbmVudFR5cGUgb2YgZWFjaCBidWZmZXJWaWV3IGZyb20gdGhlIGFjY2Vzc29yc1xuICAgICAgICBkZXNjLmFjY2Vzc29ycy5mb3JFYWNoKCh7IGJ1ZmZlclZpZXc6IGksIGNvbXBvbmVudFR5cGUgfSkgPT4ge1xuICAgICAgICAgICAgYnVmZmVyVmlld3NbaV0uY29tcG9uZW50VHlwZSA9IGNvbXBvbmVudFR5cGU7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIEdldCBtaW1ldHlwZSBvZiBidWZmZXJWaWV3IGZyb20gaW1hZ2VzXG4gICAgICAgIGRlc2MuaW1hZ2VzICYmXG4gICAgICAgICAgICBkZXNjLmltYWdlcy5mb3JFYWNoKCh7IHVyaSwgYnVmZmVyVmlldzogaSwgbWltZVR5cGUgfSkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChpID09PSB1bmRlZmluZWQpIHJldHVybjtcbiAgICAgICAgICAgICAgICBidWZmZXJWaWV3c1tpXS5taW1lVHlwZSA9IG1pbWVUeXBlO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gUHVzaCBlYWNoIGJ1ZmZlclZpZXcgdG8gdGhlIEdQVSBhcyBhIHNlcGFyYXRlIGJ1ZmZlclxuICAgICAgICBidWZmZXJWaWV3cy5mb3JFYWNoKFxuICAgICAgICAgICAgKFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgYnVmZmVyOiBidWZmZXJJbmRleCwgLy8gcmVxdWlyZWRcbiAgICAgICAgICAgICAgICAgICAgYnl0ZU9mZnNldCA9IDAsIC8vIG9wdGlvbmFsXG4gICAgICAgICAgICAgICAgICAgIGJ5dGVMZW5ndGgsIC8vIHJlcXVpcmVkXG4gICAgICAgICAgICAgICAgICAgIGJ5dGVTdHJpZGUsIC8vIG9wdGlvbmFsXG4gICAgICAgICAgICAgICAgICAgIHRhcmdldCA9IGdsLkFSUkFZX0JVRkZFUiwgLy8gb3B0aW9uYWwsIGFkZGVkIGFib3ZlIGZvciBlbGVtZW50c1xuICAgICAgICAgICAgICAgICAgICBuYW1lLCAvLyBvcHRpb25hbFxuICAgICAgICAgICAgICAgICAgICBleHRlbnNpb25zLCAvLyBvcHRpb25hbFxuICAgICAgICAgICAgICAgICAgICBleHRyYXMsIC8vIG9wdGlvbmFsXG5cbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50VHlwZSwgLy8gb3B0aW9uYWwsIGFkZGVkIGZyb20gYWNjZXNzb3IgYWJvdmVcbiAgICAgICAgICAgICAgICAgICAgbWltZVR5cGUsIC8vIG9wdGlvbmFsLCBhZGRlZCBmcm9tIGltYWdlcyBhYm92ZVxuICAgICAgICAgICAgICAgICAgICBpc0F0dHJpYnV0ZSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGlcbiAgICAgICAgICAgICkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IFR5cGVBcnJheSA9IFRZUEVfQVJSQVlbY29tcG9uZW50VHlwZSB8fCBtaW1lVHlwZV07XG4gICAgICAgICAgICAgICAgY29uc3QgZWxlbWVudEJ5dGVzID0gVHlwZUFycmF5LkJZVEVTX1BFUl9FTEVNRU5UO1xuXG4gICAgICAgICAgICAgICAgY29uc3QgZGF0YSA9IG5ldyBUeXBlQXJyYXkoYnVmZmVyc1tidWZmZXJJbmRleF0sIGJ5dGVPZmZzZXQsIGJ5dGVMZW5ndGggLyBlbGVtZW50Qnl0ZXMpO1xuICAgICAgICAgICAgICAgIGJ1ZmZlclZpZXdzW2ldLmRhdGEgPSBkYXRhO1xuICAgICAgICAgICAgICAgIGJ1ZmZlclZpZXdzW2ldLm9yaWdpbmFsQnVmZmVyID0gYnVmZmVyc1tidWZmZXJJbmRleF07XG5cbiAgICAgICAgICAgICAgICBpZiAoIWlzQXR0cmlidXRlKSByZXR1cm47XG4gICAgICAgICAgICAgICAgLy8gQ3JlYXRlIGdsIGJ1ZmZlcnMgZm9yIHRoZSBidWZmZXJWaWV3LCBwdXNoaW5nIGl0IHRvIHRoZSBHUFVcbiAgICAgICAgICAgICAgICBjb25zdCBidWZmZXIgPSBnbC5jcmVhdGVCdWZmZXIoKTtcbiAgICAgICAgICAgICAgICBnbC5iaW5kQnVmZmVyKHRhcmdldCwgYnVmZmVyKTtcbiAgICAgICAgICAgICAgICBnbC5yZW5kZXJlci5zdGF0ZS5ib3VuZEJ1ZmZlciA9IGJ1ZmZlcjtcbiAgICAgICAgICAgICAgICBnbC5idWZmZXJEYXRhKHRhcmdldCwgZGF0YSwgZ2wuU1RBVElDX0RSQVcpO1xuICAgICAgICAgICAgICAgIGJ1ZmZlclZpZXdzW2ldLmJ1ZmZlciA9IGJ1ZmZlcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgKTtcblxuICAgICAgICByZXR1cm4gYnVmZmVyVmlld3M7XG4gICAgfVxuXG4gICAgc3RhdGljIHBhcnNlSW1hZ2VzKGdsLCBkZXNjLCBkaXIsIGJ1ZmZlclZpZXdzKSB7XG4gICAgICAgIGlmICghZGVzYy5pbWFnZXMpIHJldHVybiBudWxsO1xuICAgICAgICByZXR1cm4gZGVzYy5pbWFnZXMubWFwKCh7IHVyaSwgYnVmZmVyVmlldzogYnVmZmVyVmlld0luZGV4LCBtaW1lVHlwZSwgbmFtZSB9KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBpbWFnZSA9IG5ldyBJbWFnZSgpO1xuICAgICAgICAgICAgaW1hZ2UubmFtZSA9IG5hbWU7XG4gICAgICAgICAgICBpZiAodXJpKSB7XG4gICAgICAgICAgICAgICAgaW1hZ2Uuc3JjID0gdGhpcy5yZXNvbHZlVVJJKHVyaSwgZGlyKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoYnVmZmVyVmlld0luZGV4ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBjb25zdCB7IGRhdGEgfSA9IGJ1ZmZlclZpZXdzW2J1ZmZlclZpZXdJbmRleF07XG4gICAgICAgICAgICAgICAgY29uc3QgYmxvYiA9IG5ldyBCbG9iKFtkYXRhXSwgeyB0eXBlOiBtaW1lVHlwZSB9KTtcbiAgICAgICAgICAgICAgICBpbWFnZS5zcmMgPSBVUkwuY3JlYXRlT2JqZWN0VVJMKGJsb2IpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaW1hZ2UucmVhZHkgPSBuZXcgUHJvbWlzZSgocmVzKSA9PiB7XG4gICAgICAgICAgICAgICAgaW1hZ2Uub25sb2FkID0gKCkgPT4gcmVzKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBpbWFnZTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgc3RhdGljIHBhcnNlVGV4dHVyZXMoZ2wsIGRlc2MsIGltYWdlcykge1xuICAgICAgICBpZiAoIWRlc2MudGV4dHVyZXMpIHJldHVybiBudWxsO1xuICAgICAgICByZXR1cm4gZGVzYy50ZXh0dXJlcy5tYXAoKHsgc2FtcGxlcjogc2FtcGxlckluZGV4LCBzb3VyY2U6IHNvdXJjZUluZGV4LCBuYW1lLCBleHRlbnNpb25zLCBleHRyYXMgfSkgPT4ge1xuICAgICAgICAgICAgY29uc3Qgb3B0aW9ucyA9IHtcbiAgICAgICAgICAgICAgICBmbGlwWTogZmFsc2UsXG4gICAgICAgICAgICAgICAgd3JhcFM6IGdsLlJFUEVBVCwgLy8gUmVwZWF0IGJ5IGRlZmF1bHQsIG9wcG9zZWQgdG8gT0dMJ3MgY2xhbXAgYnkgZGVmYXVsdFxuICAgICAgICAgICAgICAgIHdyYXBUOiBnbC5SRVBFQVQsXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgY29uc3Qgc2FtcGxlciA9IHNhbXBsZXJJbmRleCAhPT0gdW5kZWZpbmVkID8gZGVzYy5zYW1wbGVyc1tzYW1wbGVySW5kZXhdIDogbnVsbDtcbiAgICAgICAgICAgIGlmIChzYW1wbGVyKSB7XG4gICAgICAgICAgICAgICAgWydtYWdGaWx0ZXInLCAnbWluRmlsdGVyJywgJ3dyYXBTJywgJ3dyYXBUJ10uZm9yRWFjaCgocHJvcCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoc2FtcGxlcltwcm9wXSkgb3B0aW9uc1twcm9wXSA9IHNhbXBsZXJbcHJvcF07XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCB0ZXh0dXJlID0gbmV3IFRleHR1cmUoZ2wsIG9wdGlvbnMpO1xuICAgICAgICAgICAgdGV4dHVyZS5uYW1lID0gbmFtZTtcbiAgICAgICAgICAgIGNvbnN0IGltYWdlID0gaW1hZ2VzW3NvdXJjZUluZGV4XTtcbiAgICAgICAgICAgIGltYWdlLnJlYWR5LnRoZW4oKCkgPT4gKHRleHR1cmUuaW1hZ2UgPSBpbWFnZSkpO1xuXG4gICAgICAgICAgICByZXR1cm4gdGV4dHVyZTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgc3RhdGljIHBhcnNlTWF0ZXJpYWxzKGdsLCBkZXNjLCB0ZXh0dXJlcykge1xuICAgICAgICBpZiAoIWRlc2MubWF0ZXJpYWxzKSByZXR1cm4gbnVsbDtcbiAgICAgICAgcmV0dXJuIGRlc2MubWF0ZXJpYWxzLm1hcChcbiAgICAgICAgICAgICh7XG4gICAgICAgICAgICAgICAgbmFtZSxcbiAgICAgICAgICAgICAgICBleHRlbnNpb25zLFxuICAgICAgICAgICAgICAgIGV4dHJhcyxcbiAgICAgICAgICAgICAgICBwYnJNZXRhbGxpY1JvdWdobmVzcyA9IHt9LFxuICAgICAgICAgICAgICAgIG5vcm1hbFRleHR1cmUsXG4gICAgICAgICAgICAgICAgb2NjbHVzaW9uVGV4dHVyZSxcbiAgICAgICAgICAgICAgICBlbWlzc2l2ZVRleHR1cmUsXG4gICAgICAgICAgICAgICAgZW1pc3NpdmVGYWN0b3IgPSBbMCwgMCwgMF0sXG4gICAgICAgICAgICAgICAgYWxwaGFNb2RlID0gJ09QQVFVRScsXG4gICAgICAgICAgICAgICAgYWxwaGFDdXRvZmYgPSAwLjUsXG4gICAgICAgICAgICAgICAgZG91YmxlU2lkZWQgPSBmYWxzZSxcbiAgICAgICAgICAgIH0pID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCB7XG4gICAgICAgICAgICAgICAgICAgIGJhc2VDb2xvckZhY3RvciA9IFsxLCAxLCAxLCAxXSxcbiAgICAgICAgICAgICAgICAgICAgYmFzZUNvbG9yVGV4dHVyZSxcbiAgICAgICAgICAgICAgICAgICAgbWV0YWxsaWNGYWN0b3IgPSAxLFxuICAgICAgICAgICAgICAgICAgICByb3VnaG5lc3NGYWN0b3IgPSAxLFxuICAgICAgICAgICAgICAgICAgICBtZXRhbGxpY1JvdWdobmVzc1RleHR1cmUsXG4gICAgICAgICAgICAgICAgICAgIC8vICAgZXh0ZW5zaW9ucyxcbiAgICAgICAgICAgICAgICAgICAgLy8gICBleHRyYXMsXG4gICAgICAgICAgICAgICAgfSA9IHBick1ldGFsbGljUm91Z2huZXNzO1xuXG4gICAgICAgICAgICAgICAgaWYgKGJhc2VDb2xvclRleHR1cmUpIHtcbiAgICAgICAgICAgICAgICAgICAgYmFzZUNvbG9yVGV4dHVyZS50ZXh0dXJlID0gdGV4dHVyZXNbYmFzZUNvbG9yVGV4dHVyZS5pbmRleF07XG4gICAgICAgICAgICAgICAgICAgIC8vIHRleENvb3JkXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChub3JtYWxUZXh0dXJlKSB7XG4gICAgICAgICAgICAgICAgICAgIG5vcm1hbFRleHR1cmUudGV4dHVyZSA9IHRleHR1cmVzW25vcm1hbFRleHR1cmUuaW5kZXhdO1xuICAgICAgICAgICAgICAgICAgICAvLyBzY2FsZTogMVxuICAgICAgICAgICAgICAgICAgICAvLyB0ZXhDb29yZFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAobWV0YWxsaWNSb3VnaG5lc3NUZXh0dXJlKSB7XG4gICAgICAgICAgICAgICAgICAgIG1ldGFsbGljUm91Z2huZXNzVGV4dHVyZS50ZXh0dXJlID0gdGV4dHVyZXNbbWV0YWxsaWNSb3VnaG5lc3NUZXh0dXJlLmluZGV4XTtcbiAgICAgICAgICAgICAgICAgICAgLy8gdGV4Q29vcmRcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKG9jY2x1c2lvblRleHR1cmUpIHtcbiAgICAgICAgICAgICAgICAgICAgb2NjbHVzaW9uVGV4dHVyZS50ZXh0dXJlID0gdGV4dHVyZXNbb2NjbHVzaW9uVGV4dHVyZS5pbmRleF07XG4gICAgICAgICAgICAgICAgICAgIC8vIHN0cmVuZ3RoIDFcbiAgICAgICAgICAgICAgICAgICAgLy8gdGV4Q29vcmRcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGVtaXNzaXZlVGV4dHVyZSkge1xuICAgICAgICAgICAgICAgICAgICBlbWlzc2l2ZVRleHR1cmUudGV4dHVyZSA9IHRleHR1cmVzW2VtaXNzaXZlVGV4dHVyZS5pbmRleF07XG4gICAgICAgICAgICAgICAgICAgIC8vIHRleENvb3JkXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgbmFtZSxcbiAgICAgICAgICAgICAgICAgICAgYmFzZUNvbG9yRmFjdG9yLFxuICAgICAgICAgICAgICAgICAgICBiYXNlQ29sb3JUZXh0dXJlLFxuICAgICAgICAgICAgICAgICAgICBtZXRhbGxpY0ZhY3RvcixcbiAgICAgICAgICAgICAgICAgICAgcm91Z2huZXNzRmFjdG9yLFxuICAgICAgICAgICAgICAgICAgICBtZXRhbGxpY1JvdWdobmVzc1RleHR1cmUsXG4gICAgICAgICAgICAgICAgICAgIG5vcm1hbFRleHR1cmUsXG4gICAgICAgICAgICAgICAgICAgIG9jY2x1c2lvblRleHR1cmUsXG4gICAgICAgICAgICAgICAgICAgIGVtaXNzaXZlVGV4dHVyZSxcbiAgICAgICAgICAgICAgICAgICAgZW1pc3NpdmVGYWN0b3IsXG4gICAgICAgICAgICAgICAgICAgIGFscGhhTW9kZSxcbiAgICAgICAgICAgICAgICAgICAgYWxwaGFDdXRvZmYsXG4gICAgICAgICAgICAgICAgICAgIGRvdWJsZVNpZGVkLFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgc3RhdGljIHBhcnNlU2tpbnMoZ2wsIGRlc2MsIGJ1ZmZlclZpZXdzKSB7XG4gICAgICAgIGlmICghZGVzYy5za2lucykgcmV0dXJuIG51bGw7XG4gICAgICAgIHJldHVybiBkZXNjLnNraW5zLm1hcChcbiAgICAgICAgICAgICh7XG4gICAgICAgICAgICAgICAgaW52ZXJzZUJpbmRNYXRyaWNlcywgLy8gb3B0aW9uYWxcbiAgICAgICAgICAgICAgICBza2VsZXRvbiwgLy8gb3B0aW9uYWxcbiAgICAgICAgICAgICAgICBqb2ludHMsIC8vIHJlcXVpcmVkXG4gICAgICAgICAgICAgICAgLy8gbmFtZSxcbiAgICAgICAgICAgICAgICAvLyBleHRlbnNpb25zLFxuICAgICAgICAgICAgICAgIC8vIGV4dHJhcyxcbiAgICAgICAgICAgIH0pID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBpbnZlcnNlQmluZE1hdHJpY2VzOiB0aGlzLnBhcnNlQWNjZXNzb3IoaW52ZXJzZUJpbmRNYXRyaWNlcywgZGVzYywgYnVmZmVyVmlld3MpLFxuICAgICAgICAgICAgICAgICAgICBza2VsZXRvbixcbiAgICAgICAgICAgICAgICAgICAgam9pbnRzLFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgc3RhdGljIHBhcnNlTWVzaGVzKGdsLCBkZXNjLCBidWZmZXJWaWV3cywgbWF0ZXJpYWxzLCBza2lucykge1xuICAgICAgICBpZiAoIWRlc2MubWVzaGVzKSByZXR1cm4gbnVsbDtcbiAgICAgICAgcmV0dXJuIGRlc2MubWVzaGVzLm1hcChcbiAgICAgICAgICAgIChcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHByaW1pdGl2ZXMsIC8vIHJlcXVpcmVkXG4gICAgICAgICAgICAgICAgICAgIHdlaWdodHMsIC8vIG9wdGlvbmFsXG4gICAgICAgICAgICAgICAgICAgIG5hbWUsIC8vIG9wdGlvbmFsXG4gICAgICAgICAgICAgICAgICAgIGV4dGVuc2lvbnMsIC8vIG9wdGlvbmFsXG4gICAgICAgICAgICAgICAgICAgIGV4dHJhcywgLy8gb3B0aW9uYWxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIG1lc2hJbmRleFxuICAgICAgICAgICAgKSA9PiB7XG4gICAgICAgICAgICAgICAgLy8gVE9ETzogd2VpZ2h0cyBzdHVmZiA/XG4gICAgICAgICAgICAgICAgLy8gUGFyc2UgdGhyb3VnaCBub2RlcyB0byBzZWUgaG93IG1hbnkgaW5zdGFuY2VzIHRoZXJlIGFyZVxuICAgICAgICAgICAgICAgIC8vIGFuZCBpZiB0aGVyZSBpcyBhIHNraW4gYXR0YWNoZWRcbiAgICAgICAgICAgICAgICBsZXQgbnVtSW5zdGFuY2VzID0gMDtcbiAgICAgICAgICAgICAgICBsZXQgc2tpbkluZGV4ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgZGVzYy5ub2RlcyAmJlxuICAgICAgICAgICAgICAgICAgICBkZXNjLm5vZGVzLmZvckVhY2goKHsgbWVzaCwgc2tpbiB9KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobWVzaCA9PT0gbWVzaEluZGV4KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbnVtSW5zdGFuY2VzKys7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHNraW4gIT09IHVuZGVmaW5lZCkgc2tpbkluZGV4ID0gc2tpbjtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBwcmltaXRpdmVzID0gdGhpcy5wYXJzZVByaW1pdGl2ZXMoZ2wsIHByaW1pdGl2ZXMsIGRlc2MsIGJ1ZmZlclZpZXdzLCBtYXRlcmlhbHMsIG51bUluc3RhbmNlcykubWFwKCh7IGdlb21ldHJ5LCBwcm9ncmFtLCBtb2RlIH0pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgLy8gQ3JlYXRlIGVpdGhlciBza2lubmVkIG1lc2ggb3IgcmVndWxhciBtZXNoXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG1lc2ggPVxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZW9mIHNraW5JbmRleCA9PT0gJ251bWJlcidcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA/IG5ldyBHTFRGU2tpbihnbCwgeyBza2VsZXRvbjogc2tpbnNbc2tpbkluZGV4XSwgZ2VvbWV0cnksIHByb2dyYW0sIG1vZGUgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IG5ldyBNZXNoKGdsLCB7IGdlb21ldHJ5LCBwcm9ncmFtLCBtb2RlIH0pO1xuICAgICAgICAgICAgICAgICAgICBtZXNoLm5hbWUgPSBuYW1lO1xuICAgICAgICAgICAgICAgICAgICBpZiAobWVzaC5nZW9tZXRyeS5pc0luc3RhbmNlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gVGFnIG1lc2ggc28gdGhhdCBub2RlcyBjYW4gYWRkIHRoZWlyIHRyYW5zZm9ybXMgdG8gdGhlIGluc3RhbmNlIGF0dHJpYnV0ZVxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzaC5udW1JbnN0YW5jZXMgPSBudW1JbnN0YW5jZXM7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBBdm9pZCBpbmNvcnJlY3QgY3VsbGluZyBmb3IgaW5zdGFuY2VzXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNoLmZydXN0dW1DdWxsZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbWVzaDtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHByaW1pdGl2ZXMsXG4gICAgICAgICAgICAgICAgICAgIHdlaWdodHMsXG4gICAgICAgICAgICAgICAgICAgIG5hbWUsXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgcGFyc2VQcmltaXRpdmVzKGdsLCBwcmltaXRpdmVzLCBkZXNjLCBidWZmZXJWaWV3cywgbWF0ZXJpYWxzLCBudW1JbnN0YW5jZXMpIHtcbiAgICAgICAgcmV0dXJuIHByaW1pdGl2ZXMubWFwKFxuICAgICAgICAgICAgKHtcbiAgICAgICAgICAgICAgICBhdHRyaWJ1dGVzLCAvLyByZXF1aXJlZFxuICAgICAgICAgICAgICAgIGluZGljZXMsIC8vIG9wdGlvbmFsXG4gICAgICAgICAgICAgICAgbWF0ZXJpYWw6IG1hdGVyaWFsSW5kZXgsIC8vIG9wdGlvbmFsXG4gICAgICAgICAgICAgICAgbW9kZSA9IDQsIC8vIG9wdGlvbmFsXG4gICAgICAgICAgICAgICAgdGFyZ2V0cywgLy8gb3B0aW9uYWxcbiAgICAgICAgICAgICAgICBleHRlbnNpb25zLCAvLyBvcHRpb25hbFxuICAgICAgICAgICAgICAgIGV4dHJhcywgLy8gb3B0aW9uYWxcbiAgICAgICAgICAgIH0pID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBnZW9tZXRyeSA9IG5ldyBHZW9tZXRyeShnbCk7XG5cbiAgICAgICAgICAgICAgICAvLyBBZGQgZWFjaCBhdHRyaWJ1dGUgZm91bmQgaW4gcHJpbWl0aXZlXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgYXR0ciBpbiBhdHRyaWJ1dGVzKSB7XG4gICAgICAgICAgICAgICAgICAgIGdlb21ldHJ5LmFkZEF0dHJpYnV0ZShBVFRSSUJVVEVTW2F0dHJdLCB0aGlzLnBhcnNlQWNjZXNzb3IoYXR0cmlidXRlc1thdHRyXSwgZGVzYywgYnVmZmVyVmlld3MpKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBBZGQgaW5kZXggYXR0cmlidXRlIGlmIGZvdW5kXG4gICAgICAgICAgICAgICAgaWYgKGluZGljZXMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICBnZW9tZXRyeS5hZGRBdHRyaWJ1dGUoJ2luZGV4JywgdGhpcy5wYXJzZUFjY2Vzc29yKGluZGljZXMsIGRlc2MsIGJ1ZmZlclZpZXdzKSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gQWRkIGluc3RhbmNlZCB0cmFuc2Zvcm0gYXR0cmlidXRlIGlmIG11bHRpcGxlIGluc3RhbmNlc1xuICAgICAgICAgICAgICAgIGlmIChudW1JbnN0YW5jZXMgPiAxKSB7XG4gICAgICAgICAgICAgICAgICAgIGdlb21ldHJ5LmFkZEF0dHJpYnV0ZSgnaW5zdGFuY2VNYXRyaXgnLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbnN0YW5jZWQ6IDEsXG4gICAgICAgICAgICAgICAgICAgICAgICBzaXplOiAxNixcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IG5ldyBGbG9hdDMyQXJyYXkobnVtSW5zdGFuY2VzICogMTYpLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBUT0RPOiBtYXRlcmlhbHNcbiAgICAgICAgICAgICAgICBjb25zdCBwcm9ncmFtID0gbmV3IE5vcm1hbFByb2dyYW0oZ2wpO1xuICAgICAgICAgICAgICAgIGlmIChtYXRlcmlhbEluZGV4ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgcHJvZ3JhbS5nbHRmTWF0ZXJpYWwgPSBtYXRlcmlhbHNbbWF0ZXJpYWxJbmRleF07XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgZ2VvbWV0cnksXG4gICAgICAgICAgICAgICAgICAgIHByb2dyYW0sXG4gICAgICAgICAgICAgICAgICAgIG1vZGUsXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgcGFyc2VBY2Nlc3NvcihpbmRleCwgZGVzYywgYnVmZmVyVmlld3MpIHtcbiAgICAgICAgLy8gVE9ETzogaW5pdCBtaXNzaW5nIGJ1ZmZlclZpZXcgd2l0aCAwc1xuICAgICAgICAvLyBUT0RPOiBzdXBwb3J0IHNwYXJzZVxuXG4gICAgICAgIGNvbnN0IHtcbiAgICAgICAgICAgIGJ1ZmZlclZpZXc6IGJ1ZmZlclZpZXdJbmRleCwgLy8gb3B0aW9uYWxcbiAgICAgICAgICAgIGJ5dGVPZmZzZXQgPSAwLCAvLyBvcHRpb25hbFxuICAgICAgICAgICAgY29tcG9uZW50VHlwZSwgLy8gcmVxdWlyZWRcbiAgICAgICAgICAgIG5vcm1hbGl6ZWQgPSBmYWxzZSwgLy8gb3B0aW9uYWxcbiAgICAgICAgICAgIGNvdW50LCAvLyByZXF1aXJlZFxuICAgICAgICAgICAgdHlwZSwgLy8gcmVxdWlyZWRcbiAgICAgICAgICAgIG1pbiwgLy8gb3B0aW9uYWxcbiAgICAgICAgICAgIG1heCwgLy8gb3B0aW9uYWxcbiAgICAgICAgICAgIHNwYXJzZSwgLy8gb3B0aW9uYWxcbiAgICAgICAgICAgIC8vIG5hbWUsIC8vIG9wdGlvbmFsXG4gICAgICAgICAgICAvLyBleHRlbnNpb25zLCAvLyBvcHRpb25hbFxuICAgICAgICAgICAgLy8gZXh0cmFzLCAvLyBvcHRpb25hbFxuICAgICAgICB9ID0gZGVzYy5hY2Nlc3NvcnNbaW5kZXhdO1xuXG4gICAgICAgIGNvbnN0IHtcbiAgICAgICAgICAgIGRhdGEsIC8vIGF0dGFjaGVkIGluIHBhcnNlQnVmZmVyVmlld3NcbiAgICAgICAgICAgIG9yaWdpbmFsQnVmZmVyLCAvLyBhdHRhY2hlZCBpbiBwYXJzZUJ1ZmZlclZpZXdzXG4gICAgICAgICAgICBidWZmZXIsIC8vIHJlcGxhY2VkIHRvIGJlIHRoZSBhY3R1YWwgR0wgYnVmZmVyXG4gICAgICAgICAgICBieXRlT2Zmc2V0OiBidWZmZXJCeXRlT2Zmc2V0ID0gMCxcbiAgICAgICAgICAgIC8vIGJ5dGVMZW5ndGgsIC8vIGFwcGxpZWQgaW4gcGFyc2VCdWZmZXJWaWV3c1xuICAgICAgICAgICAgYnl0ZVN0cmlkZSA9IDAsXG4gICAgICAgICAgICB0YXJnZXQsXG4gICAgICAgICAgICAvLyBuYW1lLFxuICAgICAgICAgICAgLy8gZXh0ZW5zaW9ucyxcbiAgICAgICAgICAgIC8vIGV4dHJhcyxcbiAgICAgICAgfSA9IGJ1ZmZlclZpZXdzW2J1ZmZlclZpZXdJbmRleF07XG5cbiAgICAgICAgY29uc3Qgc2l6ZSA9IFRZUEVfU0laRVt0eXBlXTtcblxuICAgICAgICAvLyBQYXJzZSBkYXRhIGZyb20gam9pbmVkIGJ1ZmZlcnNcbiAgICAgICAgY29uc3QgVHlwZUFycmF5ID0gVFlQRV9BUlJBWVtjb21wb25lbnRUeXBlXTtcbiAgICAgICAgY29uc3QgZWxlbWVudEJ5dGVzID0gZGF0YS5CWVRFU19QRVJfRUxFTUVOVDtcbiAgICAgICAgY29uc3QgY29tcG9uZW50T2Zmc2V0ID0gYnl0ZU9mZnNldCAvIGVsZW1lbnRCeXRlcztcbiAgICAgICAgY29uc3QgY29tcG9uZW50U3RyaWRlID0gYnl0ZVN0cmlkZSAvIGVsZW1lbnRCeXRlcztcbiAgICAgICAgY29uc3QgaXNJbnRlcmxlYXZlZCA9ICEhYnl0ZVN0cmlkZSAmJiBjb21wb25lbnRTdHJpZGUgIT09IHNpemU7XG5cbiAgICAgICAgLy8gVE9ETzogaW50ZXJsZWF2ZWRcbiAgICAgICAgY29uc3QgbmV3RGF0YSA9IGlzSW50ZXJsZWF2ZWQgPyBkYXRhIDogbmV3IFR5cGVBcnJheShvcmlnaW5hbEJ1ZmZlciwgYnl0ZU9mZnNldCArIGJ1ZmZlckJ5dGVPZmZzZXQsIGNvdW50ICogc2l6ZSk7XG5cbiAgICAgICAgLy8gUmV0dXJuIGF0dHJpYnV0ZSBkYXRhXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBkYXRhOiBuZXdEYXRhLFxuICAgICAgICAgICAgc2l6ZSxcbiAgICAgICAgICAgIHR5cGU6IGNvbXBvbmVudFR5cGUsXG4gICAgICAgICAgICBub3JtYWxpemVkLFxuICAgICAgICAgICAgYnVmZmVyLFxuICAgICAgICAgICAgc3RyaWRlOiBieXRlU3RyaWRlLFxuICAgICAgICAgICAgb2Zmc2V0OiBieXRlT2Zmc2V0LFxuICAgICAgICAgICAgY291bnQsXG4gICAgICAgICAgICBtaW4sXG4gICAgICAgICAgICBtYXgsXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgc3RhdGljIHBhcnNlTm9kZXMoZ2wsIGRlc2MsIG1lc2hlcywgc2tpbnMpIHtcbiAgICAgICAgaWYgKCFkZXNjLm5vZGVzKSByZXR1cm4gbnVsbDtcbiAgICAgICAgY29uc3Qgbm9kZXMgPSBkZXNjLm5vZGVzLm1hcChcbiAgICAgICAgICAgICh7XG4gICAgICAgICAgICAgICAgY2FtZXJhLCAvLyBvcHRpb25hbFxuICAgICAgICAgICAgICAgIGNoaWxkcmVuLCAvLyBvcHRpb25hbFxuICAgICAgICAgICAgICAgIHNraW46IHNraW5JbmRleCwgLy8gb3B0aW9uYWxcbiAgICAgICAgICAgICAgICBtYXRyaXgsIC8vIG9wdGlvbmFsXG4gICAgICAgICAgICAgICAgbWVzaDogbWVzaEluZGV4LCAvLyBvcHRpb25hbFxuICAgICAgICAgICAgICAgIHJvdGF0aW9uLCAvLyBvcHRpb25hbFxuICAgICAgICAgICAgICAgIHNjYWxlLCAvLyBvcHRpb25hbFxuICAgICAgICAgICAgICAgIHRyYW5zbGF0aW9uLCAvLyBvcHRpb25hbFxuICAgICAgICAgICAgICAgIHdlaWdodHMsIC8vIG9wdGlvbmFsXG4gICAgICAgICAgICAgICAgbmFtZSwgLy8gb3B0aW9uYWxcbiAgICAgICAgICAgICAgICBleHRlbnNpb25zLCAvLyBvcHRpb25hbFxuICAgICAgICAgICAgICAgIGV4dHJhcywgLy8gb3B0aW9uYWxcbiAgICAgICAgICAgIH0pID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBub2RlID0gbmV3IFRyYW5zZm9ybSgpO1xuICAgICAgICAgICAgICAgIGlmIChuYW1lKSBub2RlLm5hbWUgPSBuYW1lO1xuXG4gICAgICAgICAgICAgICAgLy8gQXBwbHkgdHJhbnNmb3JtYXRpb25zXG4gICAgICAgICAgICAgICAgaWYgKG1hdHJpeCkge1xuICAgICAgICAgICAgICAgICAgICBub2RlLm1hdHJpeC5jb3B5KG1hdHJpeCk7XG4gICAgICAgICAgICAgICAgICAgIG5vZGUuZGVjb21wb3NlKCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJvdGF0aW9uKSBub2RlLnF1YXRlcm5pb24uY29weShyb3RhdGlvbik7XG4gICAgICAgICAgICAgICAgICAgIGlmIChzY2FsZSkgbm9kZS5zY2FsZS5jb3B5KHNjYWxlKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRyYW5zbGF0aW9uKSBub2RlLnBvc2l0aW9uLmNvcHkodHJhbnNsYXRpb24pO1xuICAgICAgICAgICAgICAgICAgICBub2RlLnVwZGF0ZU1hdHJpeCgpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIEZsYWdzIGZvciBhdm9pZGluZyBkdXBsaWNhdGUgdHJhbnNmb3JtcyBhbmQgcmVtb3ZpbmcgdW51c2VkIGluc3RhbmNlIG5vZGVzXG4gICAgICAgICAgICAgICAgbGV0IGlzSW5zdGFuY2VkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgbGV0IGlzRmlyc3RJbnN0YW5jZSA9IHRydWU7XG5cbiAgICAgICAgICAgICAgICAvLyBhZGQgbWVzaCBpZiBpbmNsdWRlZFxuICAgICAgICAgICAgICAgIGlmIChtZXNoSW5kZXggIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICBtZXNoZXNbbWVzaEluZGV4XS5wcmltaXRpdmVzLmZvckVhY2goKG1lc2gpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChtZXNoLmdlb21ldHJ5LmlzSW5zdGFuY2VkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNJbnN0YW5jZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghbWVzaC5pbnN0YW5jZUNvdW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lc2guaW5zdGFuY2VDb3VudCA9IDA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNGaXJzdEluc3RhbmNlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vZGUubWF0cml4LnRvQXJyYXkobWVzaC5nZW9tZXRyeS5hdHRyaWJ1dGVzLmluc3RhbmNlTWF0cml4LmRhdGEsIG1lc2guaW5zdGFuY2VDb3VudCAqIDE2KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXNoLmluc3RhbmNlQ291bnQrKztcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChtZXNoLmluc3RhbmNlQ291bnQgPT09IG1lc2gubnVtSW5zdGFuY2VzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFJlbW92ZSBwcm9wZXJ0aWVzIG9uY2UgYWxsIGluc3RhbmNlcyBhZGRlZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWxldGUgbWVzaC5udW1JbnN0YW5jZXM7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBtZXNoLmluc3RhbmNlQ291bnQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEZsYWcgYXR0cmlidXRlIGFzIGRpcnR5XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lc2guZ2VvbWV0cnkuYXR0cmlidXRlcy5pbnN0YW5jZU1hdHJpeC5uZWVkc1VwZGF0ZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBGb3IgaW5zdGFuY2VzLCBvbmx5IHRoZSBmaXJzdCBub2RlIHdpbGwgYWN0dWFsbHkgaGF2ZSB0aGUgbWVzaFxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGlzSW5zdGFuY2VkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGlzRmlyc3RJbnN0YW5jZSkgbWVzaC5zZXRQYXJlbnQobm9kZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lc2guc2V0UGFyZW50KG5vZGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBSZXNldCBub2RlIGlmIGluc3RhbmNlZCB0byBub3QgZHVwbGljYXRlIHRyYW5zZm9ybXNcbiAgICAgICAgICAgICAgICBpZiAoaXNJbnN0YW5jZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gUmVtb3ZlIHVudXNlZCBub2RlcyBqdXN0IHByb3ZpZGluZyBhbiBpbnN0YW5jZSB0cmFuc2Zvcm1cbiAgICAgICAgICAgICAgICAgICAgaWYgKCFpc0ZpcnN0SW5zdGFuY2UpIHJldHVybiBudWxsO1xuICAgICAgICAgICAgICAgICAgICAvLyBBdm9pZCBkdXBsaWNhdGUgdHJhbnNmb3JtIGZvciBub2RlIGNvbnRhaW5pbmcgdGhlIGluc3RhbmNlZCBtZXNoXG4gICAgICAgICAgICAgICAgICAgIG5vZGUubWF0cml4LmlkZW50aXR5KCk7XG4gICAgICAgICAgICAgICAgICAgIG5vZGUuZGVjb21wb3NlKCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIG5vZGU7XG4gICAgICAgICAgICB9XG4gICAgICAgICk7XG5cbiAgICAgICAgZGVzYy5ub2Rlcy5mb3JFYWNoKCh7IGNoaWxkcmVuID0gW10gfSwgaSkgPT4ge1xuICAgICAgICAgICAgLy8gU2V0IGhpZXJhcmNoeSBub3cgYWxsIG5vZGVzIGNyZWF0ZWRcbiAgICAgICAgICAgIGNoaWxkcmVuLmZvckVhY2goKGNoaWxkSW5kZXgpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoIW5vZGVzW2NoaWxkSW5kZXhdKSByZXR1cm47XG4gICAgICAgICAgICAgICAgbm9kZXNbY2hpbGRJbmRleF0uc2V0UGFyZW50KG5vZGVzW2ldKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gbm9kZXM7XG4gICAgfVxuXG4gICAgc3RhdGljIHBvcHVsYXRlU2tpbnMoc2tpbnMsIG5vZGVzKSB7XG4gICAgICAgIGlmICghc2tpbnMpIHJldHVybjtcbiAgICAgICAgc2tpbnMuZm9yRWFjaCgoc2tpbikgPT4ge1xuICAgICAgICAgICAgc2tpbi5qb2ludHMgPSBza2luLmpvaW50cy5tYXAoKGksIGluZGV4KSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3Qgam9pbnQgPSBub2Rlc1tpXTtcbiAgICAgICAgICAgICAgICBqb2ludC5iaW5kSW52ZXJzZSA9IG5ldyBNYXQ0KC4uLnNraW4uaW52ZXJzZUJpbmRNYXRyaWNlcy5kYXRhLnNsaWNlKGluZGV4ICogMTYsIChpbmRleCArIDEpICogMTYpKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gam9pbnQ7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlmIChza2luLnNrZWxldG9uKSBza2luLnNrZWxldG9uID0gbm9kZXNbc2tpbi5za2VsZXRvbl07XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHN0YXRpYyBwYXJzZUFuaW1hdGlvbnMoZ2wsIGRlc2MsIG5vZGVzLCBidWZmZXJWaWV3cykge1xuICAgICAgICBpZiAoIWRlc2MuYW5pbWF0aW9ucykgcmV0dXJuIG51bGw7XG4gICAgICAgIHJldHVybiBkZXNjLmFuaW1hdGlvbnMubWFwKFxuICAgICAgICAgICAgKHtcbiAgICAgICAgICAgICAgICBjaGFubmVscywgLy8gcmVxdWlyZWRcbiAgICAgICAgICAgICAgICBzYW1wbGVycywgLy8gcmVxdWlyZWRcbiAgICAgICAgICAgICAgICBuYW1lLCAvLyBvcHRpb25hbFxuICAgICAgICAgICAgICAgIC8vIGV4dGVuc2lvbnMsIC8vIG9wdGlvbmFsXG4gICAgICAgICAgICAgICAgLy8gZXh0cmFzLCAgLy8gb3B0aW9uYWxcbiAgICAgICAgICAgIH0pID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBkYXRhID0gY2hhbm5lbHMubWFwKFxuICAgICAgICAgICAgICAgICAgICAoe1xuICAgICAgICAgICAgICAgICAgICAgICAgc2FtcGxlcjogc2FtcGxlckluZGV4LCAvLyByZXF1aXJlZFxuICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0LCAvLyByZXF1aXJlZFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gZXh0ZW5zaW9ucywgLy8gb3B0aW9uYWxcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGV4dHJhcywgLy8gb3B0aW9uYWxcbiAgICAgICAgICAgICAgICAgICAgfSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlucHV0OiBpbnB1dEluZGV4LCAvLyByZXF1aXJlZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGludGVycG9sYXRpb24gPSAnTElORUFSJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvdXRwdXQ6IG91dHB1dEluZGV4LCAvLyByZXF1aXJlZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGV4dGVuc2lvbnMsIC8vIG9wdGlvbmFsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gZXh0cmFzLCAvLyBvcHRpb25hbFxuICAgICAgICAgICAgICAgICAgICAgICAgfSA9IHNhbXBsZXJzW3NhbXBsZXJJbmRleF07XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBub2RlOiBub2RlSW5kZXgsIC8vIG9wdGlvbmFsIC0gVE9ETzogd2hlbiBpcyBpdCBub3QgaW5jbHVkZWQ/XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGF0aCwgLy8gcmVxdWlyZWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBleHRlbnNpb25zLCAvLyBvcHRpb25hbFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGV4dHJhcywgLy8gb3B0aW9uYWxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gPSB0YXJnZXQ7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG5vZGUgPSBub2Rlc1tub2RlSW5kZXhdO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdHJhbnNmb3JtID0gVFJBTlNGT1JNU1twYXRoXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHRpbWVzID0gdGhpcy5wYXJzZUFjY2Vzc29yKGlucHV0SW5kZXgsIGRlc2MsIGJ1ZmZlclZpZXdzKS5kYXRhO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdmFsdWVzID0gdGhpcy5wYXJzZUFjY2Vzc29yKG91dHB1dEluZGV4LCBkZXNjLCBidWZmZXJWaWV3cykuZGF0YTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBub2RlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRyYW5zZm9ybSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnRlcnBvbGF0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpbWVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlcyxcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICApO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgbmFtZSxcbiAgICAgICAgICAgICAgICAgICAgYW5pbWF0aW9uOiBuZXcgR0xURkFuaW1hdGlvbihkYXRhKSxcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICApO1xuICAgIH1cblxuICAgIHN0YXRpYyBwYXJzZVNjZW5lcyhkZXNjLCBub2Rlcykge1xuICAgICAgICBpZiAoIWRlc2Muc2NlbmVzKSByZXR1cm4gbnVsbDtcbiAgICAgICAgcmV0dXJuIGRlc2Muc2NlbmVzLm1hcChcbiAgICAgICAgICAgICh7XG4gICAgICAgICAgICAgICAgbm9kZXM6IG5vZGVzSW5kaWNlcyA9IFtdLFxuICAgICAgICAgICAgICAgIG5hbWUsIC8vIG9wdGlvbmFsXG4gICAgICAgICAgICAgICAgZXh0ZW5zaW9ucyxcbiAgICAgICAgICAgICAgICBleHRyYXMsXG4gICAgICAgICAgICB9KSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5vZGVzSW5kaWNlcy5yZWR1Y2UoKG1hcCwgaSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAvLyBEb24ndCBhZGQgbnVsbCBub2RlcyAoaW5zdGFuY2VkIHRyYW5zZm9ybXMpXG4gICAgICAgICAgICAgICAgICAgIGlmIChub2Rlc1tpXSkgbWFwLnB1c2gobm9kZXNbaV0pO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbWFwO1xuICAgICAgICAgICAgICAgIH0sIFtdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgKTtcbiAgICB9XG59XG4iLCJpbXBvcnQgeyBNZXNoIH0gZnJvbSAnLi4vY29yZS9NZXNoLmpzJztcbmltcG9ydCB7IE1hdDQgfSBmcm9tICcuLi9tYXRoL01hdDQuanMnO1xuaW1wb3J0IHsgVGV4dHVyZSB9IGZyb20gJy4uL2NvcmUvVGV4dHVyZS5qcyc7XG5cbmNvbnN0IHRlbXBNYXQ0ID0gbmV3IE1hdDQoKTtcbmNvbnN0IGlkZW50aXR5ID0gbmV3IE1hdDQoKTtcblxuZXhwb3J0IGNsYXNzIEdMVEZTa2luIGV4dGVuZHMgTWVzaCB7XG4gICAgY29uc3RydWN0b3IoZ2wsIHsgc2tlbGV0b24sIGdlb21ldHJ5LCBwcm9ncmFtLCBtb2RlID0gZ2wuVFJJQU5HTEVTIH0gPSB7fSkge1xuICAgICAgICBzdXBlcihnbCwgeyBnZW9tZXRyeSwgcHJvZ3JhbSwgbW9kZSB9KTtcbiAgICAgICAgdGhpcy5za2VsZXRvbiA9IHNrZWxldG9uO1xuICAgICAgICB0aGlzLnByb2dyYW0gPSBwcm9ncmFtO1xuICAgICAgICB0aGlzLmNyZWF0ZUJvbmVUZXh0dXJlKCk7XG4gICAgICAgIHRoaXMuYW5pbWF0aW9ucyA9IFtdO1xuICAgIH1cblxuICAgIGNyZWF0ZUJvbmVUZXh0dXJlKCkge1xuICAgICAgICBpZiAoIXRoaXMuc2tlbGV0b24uam9pbnRzLmxlbmd0aCkgcmV0dXJuO1xuICAgICAgICBjb25zdCBzaXplID0gTWF0aC5tYXgoNCwgTWF0aC5wb3coMiwgTWF0aC5jZWlsKE1hdGgubG9nKE1hdGguc3FydCh0aGlzLnNrZWxldG9uLmpvaW50cy5sZW5ndGggKiA0KSkgLyBNYXRoLkxOMikpKTtcbiAgICAgICAgdGhpcy5ib25lTWF0cmljZXMgPSBuZXcgRmxvYXQzMkFycmF5KHNpemUgKiBzaXplICogNCk7XG4gICAgICAgIHRoaXMuYm9uZVRleHR1cmVTaXplID0gc2l6ZTtcbiAgICAgICAgdGhpcy5ib25lVGV4dHVyZSA9IG5ldyBUZXh0dXJlKHRoaXMuZ2wsIHtcbiAgICAgICAgICAgIGltYWdlOiB0aGlzLmJvbmVNYXRyaWNlcyxcbiAgICAgICAgICAgIGdlbmVyYXRlTWlwbWFwczogZmFsc2UsXG4gICAgICAgICAgICB0eXBlOiB0aGlzLmdsLkZMT0FULFxuICAgICAgICAgICAgaW50ZXJuYWxGb3JtYXQ6IHRoaXMuZ2wucmVuZGVyZXIuaXNXZWJnbDIgPyB0aGlzLmdsLlJHQkEzMkYgOiB0aGlzLmdsLlJHQkEsXG4gICAgICAgICAgICBtaW5GaWx0ZXI6IHRoaXMuZ2wuTkVBUkVTVCxcbiAgICAgICAgICAgIG1hZ0ZpbHRlcjogdGhpcy5nbC5ORUFSRVNULFxuICAgICAgICAgICAgZmxpcFk6IGZhbHNlLFxuICAgICAgICAgICAgd2lkdGg6IHNpemUsXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIGFkZEFuaW1hdGlvbihkYXRhKSB7XG4gICAgLy8gICAgIGNvbnN0IGFuaW1hdGlvbiA9IG5ldyBBbmltYXRpb24oeyBvYmplY3RzOiB0aGlzLmJvbmVzLCBkYXRhIH0pO1xuICAgIC8vICAgICB0aGlzLmFuaW1hdGlvbnMucHVzaChhbmltYXRpb24pO1xuICAgIC8vICAgICByZXR1cm4gYW5pbWF0aW9uO1xuICAgIC8vIH1cblxuICAgIC8vIHVwZGF0ZUFuaW1hdGlvbnMoKSB7XG4gICAgLy8gICAgIC8vIENhbGN1bGF0ZSBjb21iaW5lZCBhbmltYXRpb24gd2VpZ2h0XG4gICAgLy8gICAgIGxldCB0b3RhbCA9IDA7XG4gICAgLy8gICAgIHRoaXMuYW5pbWF0aW9ucy5mb3JFYWNoKChhbmltYXRpb24pID0+ICh0b3RhbCArPSBhbmltYXRpb24ud2VpZ2h0KSk7XG5cbiAgICAvLyAgICAgdGhpcy5hbmltYXRpb25zLmZvckVhY2goKGFuaW1hdGlvbiwgaSkgPT4ge1xuICAgIC8vICAgICAgICAgLy8gZm9yY2UgZmlyc3QgYW5pbWF0aW9uIHRvIHNldCBpbiBvcmRlciB0byByZXNldCBmcmFtZVxuICAgIC8vICAgICAgICAgYW5pbWF0aW9uLnVwZGF0ZSh0b3RhbCwgaSA9PT0gMCk7XG4gICAgLy8gICAgIH0pO1xuICAgIC8vIH1cblxuICAgIHVwZGF0ZVVuaWZvcm1zKCkge1xuICAgICAgICAvLyBVcGRhdGUgYm9uZSB0ZXh0dXJlXG4gICAgICAgIHRoaXMuc2tlbGV0b24uam9pbnRzLmZvckVhY2goKGJvbmUsIGkpID0+IHtcbiAgICAgICAgICAgIC8vIEZpbmQgZGlmZmVyZW5jZSBiZXR3ZWVuIGN1cnJlbnQgYW5kIGJpbmQgcG9zZVxuICAgICAgICAgICAgdGVtcE1hdDQubXVsdGlwbHkoYm9uZS53b3JsZE1hdHJpeCwgYm9uZS5iaW5kSW52ZXJzZSk7XG4gICAgICAgICAgICB0aGlzLmJvbmVNYXRyaWNlcy5zZXQodGVtcE1hdDQsIGkgKiAxNik7XG4gICAgICAgIH0pO1xuICAgICAgICBpZiAodGhpcy5ib25lVGV4dHVyZSkgdGhpcy5ib25lVGV4dHVyZS5uZWVkc1VwZGF0ZSA9IHRydWU7XG4gICAgfVxuXG4gICAgZHJhdyh7IGNhbWVyYSB9ID0ge30pIHtcbiAgICAgICAgaWYgKCF0aGlzLnByb2dyYW0udW5pZm9ybXMuYm9uZVRleHR1cmUpIHtcbiAgICAgICAgICAgIE9iamVjdC5hc3NpZ24odGhpcy5wcm9ncmFtLnVuaWZvcm1zLCB7XG4gICAgICAgICAgICAgICAgYm9uZVRleHR1cmU6IHsgdmFsdWU6IHRoaXMuYm9uZVRleHR1cmUgfSxcbiAgICAgICAgICAgICAgICBib25lVGV4dHVyZVNpemU6IHsgdmFsdWU6IHRoaXMuYm9uZVRleHR1cmVTaXplIH0sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMudXBkYXRlVW5pZm9ybXMoKTtcblxuICAgICAgICAvLyBTd2l0Y2ggdGhlIHdvcmxkIG1hdHJpeCB3aXRoIGlkZW50aXR5IHRvIGlnbm9yZSBhbnkgdHJhbnNmb3Jtc1xuICAgICAgICAvLyBvbiB0aGUgbWVzaCBpdHNlbGYgLSBvbmx5IHVzZSBza2VsZXRvbidzIHRyYW5zZm9ybXNcbiAgICAgICAgY29uc3QgX3dvcmxkTWF0cml4ID0gdGhpcy53b3JsZE1hdHJpeDtcbiAgICAgICAgdGhpcy53b3JsZE1hdHJpeCA9IGlkZW50aXR5O1xuXG4gICAgICAgIHN1cGVyLmRyYXcoeyBjYW1lcmEgfSk7XG5cbiAgICAgICAgLy8gU3dpdGNoIGJhY2sgdG8gbGVhdmUgaWRlbnRpdHkgdW50b3VjaGVkXG4gICAgICAgIHRoaXMud29ybGRNYXRyaXggPSBfd29ybGRNYXRyaXg7XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgUHJvZ3JhbSB9IGZyb20gJy4uL2NvcmUvUHJvZ3JhbS5qcyc7XG5pbXBvcnQgeyBNZXNoIH0gZnJvbSAnLi4vY29yZS9NZXNoLmpzJztcbmltcG9ydCB7IFRleHR1cmUgfSBmcm9tICcuLi9jb3JlL1RleHR1cmUuanMnO1xuaW1wb3J0IHsgUmVuZGVyVGFyZ2V0IH0gZnJvbSAnLi4vY29yZS9SZW5kZXJUYXJnZXQuanMnO1xuaW1wb3J0IHsgVHJpYW5nbGUgfSBmcm9tICcuL1RyaWFuZ2xlLmpzJztcblxuZXhwb3J0IGNsYXNzIEdQR1BVIHtcbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgZ2wsXG4gICAgICAgIHtcbiAgICAgICAgICAgIC8vIEFsd2F5cyBwYXNzIGluIGFycmF5IG9mIHZlYzRzIChSR0JBIHZhbHVlcyB3aXRoaW4gdGV4dHVyZSlcbiAgICAgICAgICAgIGRhdGEgPSBuZXcgRmxvYXQzMkFycmF5KDE2KSxcbiAgICAgICAgICAgIGdlb21ldHJ5ID0gbmV3IFRyaWFuZ2xlKGdsKSxcbiAgICAgICAgICAgIHR5cGUsIC8vIFBhc3MgaW4gZ2wuRkxPQVQgdG8gZm9yY2UgaXQsIGRlZmF1bHRzIHRvIGdsLkhBTEZfRkxPQVRcbiAgICAgICAgfVxuICAgICkge1xuICAgICAgICB0aGlzLmdsID0gZ2w7XG4gICAgICAgIGNvbnN0IGluaXRpYWxEYXRhID0gZGF0YTtcbiAgICAgICAgdGhpcy5wYXNzZXMgPSBbXTtcbiAgICAgICAgdGhpcy5nZW9tZXRyeSA9IGdlb21ldHJ5O1xuICAgICAgICB0aGlzLmRhdGFMZW5ndGggPSBpbml0aWFsRGF0YS5sZW5ndGggLyA0O1xuXG4gICAgICAgIC8vIFdpbmRvd3MgYW5kIGlPUyBvbmx5IGxpa2UgcG93ZXIgb2YgMiB0ZXh0dXJlc1xuICAgICAgICAvLyBGaW5kIHNtYWxsZXN0IFBPMiB0aGF0IGZpdHMgZGF0YVxuICAgICAgICB0aGlzLnNpemUgPSBNYXRoLnBvdygyLCBNYXRoLmNlaWwoTWF0aC5sb2coTWF0aC5jZWlsKE1hdGguc3FydCh0aGlzLmRhdGFMZW5ndGgpKSkgLyBNYXRoLkxOMikpO1xuXG4gICAgICAgIC8vIENyZWF0ZSBjb29yZHMgZm9yIG91dHB1dCB0ZXh0dXJlXG4gICAgICAgIHRoaXMuY29vcmRzID0gbmV3IEZsb2F0MzJBcnJheSh0aGlzLmRhdGFMZW5ndGggKiAyKTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmRhdGFMZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgY29uc3QgeCA9IChpICUgdGhpcy5zaXplKSAvIHRoaXMuc2l6ZTsgLy8gdG8gYWRkIDAuNSB0byBiZSBjZW50ZXIgcGl4ZWwgP1xuICAgICAgICAgICAgY29uc3QgeSA9IE1hdGguZmxvb3IoaSAvIHRoaXMuc2l6ZSkgLyB0aGlzLnNpemU7XG4gICAgICAgICAgICB0aGlzLmNvb3Jkcy5zZXQoW3gsIHldLCBpICogMik7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBVc2Ugb3JpZ2luYWwgZGF0YSBpZiBhbHJlYWR5IGNvcnJlY3QgbGVuZ3RoIG9mIFBPMiB0ZXh0dXJlLCBlbHNlIGNvcHkgdG8gbmV3IGFycmF5IG9mIGNvcnJlY3QgbGVuZ3RoXG4gICAgICAgIGNvbnN0IGZsb2F0QXJyYXkgPSAoKCkgPT4ge1xuICAgICAgICAgICAgaWYgKGluaXRpYWxEYXRhLmxlbmd0aCA9PT0gdGhpcy5zaXplICogdGhpcy5zaXplICogNCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBpbml0aWFsRGF0YTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc3QgYSA9IG5ldyBGbG9hdDMyQXJyYXkodGhpcy5zaXplICogdGhpcy5zaXplICogNCk7XG4gICAgICAgICAgICAgICAgYS5zZXQoaW5pdGlhbERhdGEpO1xuICAgICAgICAgICAgICAgIHJldHVybiBhO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KSgpO1xuXG4gICAgICAgIC8vIENyZWF0ZSBvdXRwdXQgdGV4dHVyZSB1bmlmb3JtIHVzaW5nIGlucHV0IGZsb2F0IHRleHR1cmUgd2l0aCBpbml0aWFsIGRhdGFcbiAgICAgICAgdGhpcy51bmlmb3JtID0ge1xuICAgICAgICAgICAgdmFsdWU6IG5ldyBUZXh0dXJlKGdsLCB7XG4gICAgICAgICAgICAgICAgaW1hZ2U6IGZsb2F0QXJyYXksXG4gICAgICAgICAgICAgICAgdGFyZ2V0OiBnbC5URVhUVVJFXzJELFxuICAgICAgICAgICAgICAgIHR5cGU6IGdsLkZMT0FULFxuICAgICAgICAgICAgICAgIGZvcm1hdDogZ2wuUkdCQSxcbiAgICAgICAgICAgICAgICBpbnRlcm5hbEZvcm1hdDogZ2wucmVuZGVyZXIuaXNXZWJnbDIgPyBnbC5SR0JBMzJGIDogZ2wuUkdCQSxcbiAgICAgICAgICAgICAgICB3cmFwUzogZ2wuQ0xBTVBfVE9fRURHRSxcbiAgICAgICAgICAgICAgICB3cmFwVDogZ2wuQ0xBTVBfVE9fRURHRSxcbiAgICAgICAgICAgICAgICBnZW5lcmF0ZU1pcG1hcHM6IGZhbHNlLFxuICAgICAgICAgICAgICAgIG1pbkZpbHRlcjogZ2wuTkVBUkVTVCxcbiAgICAgICAgICAgICAgICBtYWdGaWx0ZXI6IGdsLk5FQVJFU1QsXG4gICAgICAgICAgICAgICAgd2lkdGg6IHRoaXMuc2l6ZSxcbiAgICAgICAgICAgICAgICBmbGlwWTogZmFsc2UsXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBDcmVhdGUgRkJPc1xuICAgICAgICBjb25zdCBvcHRpb25zID0ge1xuICAgICAgICAgICAgd2lkdGg6IHRoaXMuc2l6ZSxcbiAgICAgICAgICAgIGhlaWdodDogdGhpcy5zaXplLFxuICAgICAgICAgICAgdHlwZTogdHlwZSB8fCBnbC5IQUxGX0ZMT0FUIHx8IGdsLnJlbmRlcmVyLmV4dGVuc2lvbnNbJ09FU190ZXh0dXJlX2hhbGZfZmxvYXQnXS5IQUxGX0ZMT0FUX09FUyxcbiAgICAgICAgICAgIGZvcm1hdDogZ2wuUkdCQSxcbiAgICAgICAgICAgIGludGVybmFsRm9ybWF0OiBnbC5yZW5kZXJlci5pc1dlYmdsMiA/ICh0eXBlID09PSBnbC5GTE9BVCA/IGdsLlJHQkEzMkYgOiBnbC5SR0JBMTZGKSA6IGdsLlJHQkEsXG4gICAgICAgICAgICBtaW5GaWx0ZXI6IGdsLk5FQVJFU1QsXG4gICAgICAgICAgICBkZXB0aDogZmFsc2UsXG4gICAgICAgICAgICB1bnBhY2tBbGlnbm1lbnQ6IDEsXG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5mYm8gPSB7XG4gICAgICAgICAgICByZWFkOiBuZXcgUmVuZGVyVGFyZ2V0KGdsLCBvcHRpb25zKSxcbiAgICAgICAgICAgIHdyaXRlOiBuZXcgUmVuZGVyVGFyZ2V0KGdsLCBvcHRpb25zKSxcbiAgICAgICAgICAgIHN3YXA6ICgpID0+IHtcbiAgICAgICAgICAgICAgICBsZXQgdGVtcCA9IHRoaXMuZmJvLnJlYWQ7XG4gICAgICAgICAgICAgICAgdGhpcy5mYm8ucmVhZCA9IHRoaXMuZmJvLndyaXRlO1xuICAgICAgICAgICAgICAgIHRoaXMuZmJvLndyaXRlID0gdGVtcDtcbiAgICAgICAgICAgICAgICB0aGlzLnVuaWZvcm0udmFsdWUgPSB0aGlzLmZiby5yZWFkLnRleHR1cmU7XG4gICAgICAgICAgICB9LFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIGFkZFBhc3MoeyB2ZXJ0ZXggPSBkZWZhdWx0VmVydGV4LCBmcmFnbWVudCA9IGRlZmF1bHRGcmFnbWVudCwgdW5pZm9ybXMgPSB7fSwgdGV4dHVyZVVuaWZvcm0gPSAndE1hcCcsIGVuYWJsZWQgPSB0cnVlIH0gPSB7fSkge1xuICAgICAgICB1bmlmb3Jtc1t0ZXh0dXJlVW5pZm9ybV0gPSB0aGlzLnVuaWZvcm07XG4gICAgICAgIGNvbnN0IHByb2dyYW0gPSBuZXcgUHJvZ3JhbSh0aGlzLmdsLCB7IHZlcnRleCwgZnJhZ21lbnQsIHVuaWZvcm1zIH0pO1xuICAgICAgICBjb25zdCBtZXNoID0gbmV3IE1lc2godGhpcy5nbCwgeyBnZW9tZXRyeTogdGhpcy5nZW9tZXRyeSwgcHJvZ3JhbSB9KTtcblxuICAgICAgICBjb25zdCBwYXNzID0ge1xuICAgICAgICAgICAgbWVzaCxcbiAgICAgICAgICAgIHByb2dyYW0sXG4gICAgICAgICAgICB1bmlmb3JtcyxcbiAgICAgICAgICAgIGVuYWJsZWQsXG4gICAgICAgICAgICB0ZXh0dXJlVW5pZm9ybSxcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLnBhc3Nlcy5wdXNoKHBhc3MpO1xuICAgICAgICByZXR1cm4gcGFzcztcbiAgICB9XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGNvbnN0IGVuYWJsZWRQYXNzZXMgPSB0aGlzLnBhc3Nlcy5maWx0ZXIoKHBhc3MpID0+IHBhc3MuZW5hYmxlZCk7XG5cbiAgICAgICAgZW5hYmxlZFBhc3Nlcy5mb3JFYWNoKChwYXNzLCBpKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmdsLnJlbmRlcmVyLnJlbmRlcih7XG4gICAgICAgICAgICAgICAgc2NlbmU6IHBhc3MubWVzaCxcbiAgICAgICAgICAgICAgICB0YXJnZXQ6IHRoaXMuZmJvLndyaXRlLFxuICAgICAgICAgICAgICAgIGNsZWFyOiBmYWxzZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy5mYm8uc3dhcCgpO1xuICAgICAgICB9KTtcbiAgICB9XG59XG5cbmNvbnN0IGRlZmF1bHRWZXJ0ZXggPSAvKiBnbHNsICovIGBcbiAgICBhdHRyaWJ1dGUgdmVjMiB1djtcbiAgICBhdHRyaWJ1dGUgdmVjMiBwb3NpdGlvbjtcblxuICAgIHZhcnlpbmcgdmVjMiB2VXY7XG5cbiAgICB2b2lkIG1haW4oKSB7XG4gICAgICAgIHZVdiA9IHV2O1xuICAgICAgICBnbF9Qb3NpdGlvbiA9IHZlYzQocG9zaXRpb24sIDAsIDEpO1xuICAgIH1cbmA7XG5cbmNvbnN0IGRlZmF1bHRGcmFnbWVudCA9IC8qIGdsc2wgKi8gYFxuICAgIHByZWNpc2lvbiBoaWdocCBmbG9hdDtcblxuICAgIHVuaWZvcm0gc2FtcGxlcjJEIHRNYXA7XG4gICAgdmFyeWluZyB2ZWMyIHZVdjtcblxuICAgIHZvaWQgbWFpbigpIHtcbiAgICAgICAgZ2xfRnJhZ0NvbG9yID0gdGV4dHVyZTJEKHRNYXAsIHZVdik7XG4gICAgfVxuYDtcbiIsImltcG9ydCB7IFRleHR1cmUgfSBmcm9tICcuLi9jb3JlL1RleHR1cmUuanMnO1xuXG4vLyBUT0RPOiBTdXBwb3J0IGN1YmVtYXBzXG4vLyBHZW5lcmF0ZSB0ZXh0dXJlcyB1c2luZyBodHRwczovL2dpdGh1Yi5jb20vVGltdmFuU2NoZXJwZW56ZWVsL3RleHR1cmUtY29tcHJlc3NvclxuXG5leHBvcnQgY2xhc3MgS1RYVGV4dHVyZSBleHRlbmRzIFRleHR1cmUge1xuICAgIGNvbnN0cnVjdG9yKGdsLCB7IGJ1ZmZlciwgd3JhcFMgPSBnbC5DTEFNUF9UT19FREdFLCB3cmFwVCA9IGdsLkNMQU1QX1RPX0VER0UsIGFuaXNvdHJvcHkgPSAwLCBtaW5GaWx0ZXIsIG1hZ0ZpbHRlciB9ID0ge30pIHtcbiAgICAgICAgc3VwZXIoZ2wsIHtcbiAgICAgICAgICAgIGdlbmVyYXRlTWlwbWFwczogZmFsc2UsXG4gICAgICAgICAgICB3cmFwUyxcbiAgICAgICAgICAgIHdyYXBULFxuICAgICAgICAgICAgYW5pc290cm9weSxcbiAgICAgICAgICAgIG1pbkZpbHRlcixcbiAgICAgICAgICAgIG1hZ0ZpbHRlcixcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKGJ1ZmZlcikgcmV0dXJuIHRoaXMucGFyc2VCdWZmZXIoYnVmZmVyKTtcbiAgICB9XG5cbiAgICBwYXJzZUJ1ZmZlcihidWZmZXIpIHtcbiAgICAgICAgY29uc3Qga3R4ID0gbmV3IEtocm9ub3NUZXh0dXJlQ29udGFpbmVyKGJ1ZmZlcik7XG4gICAgICAgIGt0eC5taXBtYXBzLmlzQ29tcHJlc3NlZFRleHR1cmUgPSB0cnVlO1xuXG4gICAgICAgIC8vIFVwZGF0ZSB0ZXh0dXJlXG4gICAgICAgIHRoaXMuaW1hZ2UgPSBrdHgubWlwbWFwcztcbiAgICAgICAgdGhpcy5pbnRlcm5hbEZvcm1hdCA9IGt0eC5nbEludGVybmFsRm9ybWF0O1xuICAgICAgICBpZiAoa3R4Lm51bWJlck9mTWlwbWFwTGV2ZWxzID4gMSkge1xuICAgICAgICAgICAgaWYgKHRoaXMubWluRmlsdGVyID09PSB0aGlzLmdsLkxJTkVBUikgdGhpcy5taW5GaWx0ZXIgPSB0aGlzLmdsLk5FQVJFU1RfTUlQTUFQX0xJTkVBUjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmICh0aGlzLm1pbkZpbHRlciA9PT0gdGhpcy5nbC5ORUFSRVNUX01JUE1BUF9MSU5FQVIpIHRoaXMubWluRmlsdGVyID0gdGhpcy5nbC5MSU5FQVI7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBUT0RPOiBzdXBwb3J0IGN1YmUgbWFwc1xuICAgICAgICAvLyBrdHgubnVtYmVyT2ZGYWNlc1xuICAgIH1cbn1cblxuZnVuY3Rpb24gS2hyb25vc1RleHR1cmVDb250YWluZXIoYnVmZmVyKSB7XG4gICAgY29uc3QgaWRDaGVjayA9IFsweGFiLCAweDRiLCAweDU0LCAweDU4LCAweDIwLCAweDMxLCAweDMxLCAweGJiLCAweDBkLCAweDBhLCAweDFhLCAweDBhXTtcbiAgICBjb25zdCBpZCA9IG5ldyBVaW50OEFycmF5KGJ1ZmZlciwgMCwgMTIpO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaWQubGVuZ3RoOyBpKyspIGlmIChpZFtpXSAhPT0gaWRDaGVja1tpXSkgcmV0dXJuIGNvbnNvbGUuZXJyb3IoJ0ZpbGUgbWlzc2luZyBLVFggaWRlbnRpZmllcicpO1xuXG4gICAgLy8gVE9ETzogSXMgdGhpcyBhbHdheXMgND8gVGVzdGVkOiBbYW5kcm9pZCwgbWFjb3NdXG4gICAgY29uc3Qgc2l6ZSA9IFVpbnQzMkFycmF5LkJZVEVTX1BFUl9FTEVNRU5UO1xuICAgIGNvbnN0IGhlYWQgPSBuZXcgRGF0YVZpZXcoYnVmZmVyLCAxMiwgMTMgKiBzaXplKTtcbiAgICBjb25zdCBsaXR0bGVFbmRpYW4gPSBoZWFkLmdldFVpbnQzMigwLCB0cnVlKSA9PT0gMHgwNDAzMDIwMTtcbiAgICBjb25zdCBnbFR5cGUgPSBoZWFkLmdldFVpbnQzMigxICogc2l6ZSwgbGl0dGxlRW5kaWFuKTtcbiAgICBpZiAoZ2xUeXBlICE9PSAwKSByZXR1cm4gY29uc29sZS53YXJuKCdvbmx5IGNvbXByZXNzZWQgZm9ybWF0cyBjdXJyZW50bHkgc3VwcG9ydGVkJyk7XG4gICAgdGhpcy5nbEludGVybmFsRm9ybWF0ID0gaGVhZC5nZXRVaW50MzIoNCAqIHNpemUsIGxpdHRsZUVuZGlhbik7XG4gICAgbGV0IHdpZHRoID0gaGVhZC5nZXRVaW50MzIoNiAqIHNpemUsIGxpdHRsZUVuZGlhbik7XG4gICAgbGV0IGhlaWdodCA9IGhlYWQuZ2V0VWludDMyKDcgKiBzaXplLCBsaXR0bGVFbmRpYW4pO1xuICAgIHRoaXMubnVtYmVyT2ZGYWNlcyA9IGhlYWQuZ2V0VWludDMyKDEwICogc2l6ZSwgbGl0dGxlRW5kaWFuKTtcbiAgICB0aGlzLm51bWJlck9mTWlwbWFwTGV2ZWxzID0gTWF0aC5tYXgoMSwgaGVhZC5nZXRVaW50MzIoMTEgKiBzaXplLCBsaXR0bGVFbmRpYW4pKTtcbiAgICBjb25zdCBieXRlc09mS2V5VmFsdWVEYXRhID0gaGVhZC5nZXRVaW50MzIoMTIgKiBzaXplLCBsaXR0bGVFbmRpYW4pO1xuXG4gICAgdGhpcy5taXBtYXBzID0gW107XG4gICAgbGV0IG9mZnNldCA9IDEyICsgMTMgKiA0ICsgYnl0ZXNPZktleVZhbHVlRGF0YTtcbiAgICBmb3IgKGxldCBsZXZlbCA9IDA7IGxldmVsIDwgdGhpcy5udW1iZXJPZk1pcG1hcExldmVsczsgbGV2ZWwrKykge1xuICAgICAgICBjb25zdCBsZXZlbFNpemUgPSBuZXcgSW50MzJBcnJheShidWZmZXIsIG9mZnNldCwgMSlbMF07IC8vIHNpemUgcGVyIGZhY2UsIHNpbmNlIG5vdCBzdXBwb3J0aW5nIGFycmF5IGN1YmVtYXBzXG4gICAgICAgIG9mZnNldCArPSA0OyAvLyBsZXZlbFNpemUgZmllbGRcbiAgICAgICAgZm9yIChsZXQgZmFjZSA9IDA7IGZhY2UgPCB0aGlzLm51bWJlck9mRmFjZXM7IGZhY2UrKykge1xuICAgICAgICAgICAgY29uc3QgZGF0YSA9IG5ldyBVaW50OEFycmF5KGJ1ZmZlciwgb2Zmc2V0LCBsZXZlbFNpemUpO1xuICAgICAgICAgICAgdGhpcy5taXBtYXBzLnB1c2goeyBkYXRhLCB3aWR0aCwgaGVpZ2h0IH0pO1xuICAgICAgICAgICAgb2Zmc2V0ICs9IGxldmVsU2l6ZTtcbiAgICAgICAgICAgIG9mZnNldCArPSAzIC0gKChsZXZlbFNpemUgKyAzKSAlIDQpOyAvLyBhZGQgcGFkZGluZyBmb3Igb2RkIHNpemVkIGltYWdlXG4gICAgICAgIH1cbiAgICAgICAgd2lkdGggPSB3aWR0aCA+PiAxO1xuICAgICAgICBoZWlnaHQgPSBoZWlnaHQgPj4gMTtcbiAgICB9XG59XG4iLCJpbXBvcnQgeyBQcm9ncmFtIH0gZnJvbSAnLi4vY29yZS9Qcm9ncmFtLmpzJztcblxuY29uc3QgdmVydGV4ID0gLyogZ2xzbCAqLyBgXG4gICAgcHJlY2lzaW9uIGhpZ2hwIGZsb2F0O1xuICAgIHByZWNpc2lvbiBoaWdocCBpbnQ7XG5cbiAgICBhdHRyaWJ1dGUgdmVjMyBwb3NpdGlvbjtcbiAgICBhdHRyaWJ1dGUgdmVjMyBub3JtYWw7XG5cbiAgICB1bmlmb3JtIG1hdDMgbm9ybWFsTWF0cml4O1xuICAgIHVuaWZvcm0gbWF0NCBtb2RlbFZpZXdNYXRyaXg7XG4gICAgdW5pZm9ybSBtYXQ0IHByb2plY3Rpb25NYXRyaXg7XG5cbiAgICB2YXJ5aW5nIHZlYzMgdk5vcm1hbDtcblxuICAgIHZvaWQgbWFpbigpIHtcbiAgICAgICAgdk5vcm1hbCA9IG5vcm1hbGl6ZShub3JtYWxNYXRyaXggKiBub3JtYWwpO1xuICAgICAgICBnbF9Qb3NpdGlvbiA9IHByb2plY3Rpb25NYXRyaXggKiBtb2RlbFZpZXdNYXRyaXggKiB2ZWM0KHBvc2l0aW9uLCAxLjApO1xuICAgIH1cbmA7XG5cbmNvbnN0IGZyYWdtZW50ID0gLyogZ2xzbCAqLyBgXG4gICAgcHJlY2lzaW9uIGhpZ2hwIGZsb2F0O1xuICAgIHByZWNpc2lvbiBoaWdocCBpbnQ7XG5cbiAgICB2YXJ5aW5nIHZlYzMgdk5vcm1hbDtcblxuICAgIHZvaWQgbWFpbigpIHtcbiAgICAgICAgZ2xfRnJhZ0NvbG9yLnJnYiA9IG5vcm1hbGl6ZSh2Tm9ybWFsKTtcbiAgICAgICAgZ2xfRnJhZ0NvbG9yLmEgPSAxLjA7XG4gICAgfVxuYDtcblxuZXhwb3J0IGZ1bmN0aW9uIE5vcm1hbFByb2dyYW0oZ2wpIHtcbiAgICByZXR1cm4gbmV3IFByb2dyYW0oZ2wsIHtcbiAgICAgICAgdmVydGV4OiB2ZXJ0ZXgsXG4gICAgICAgIGZyYWdtZW50OiBmcmFnbWVudCxcbiAgICAgICAgY3VsbEZhY2U6IG51bGwsXG4gICAgfSk7XG59XG4iLCIvLyBCYXNlZCBmcm9tIFRocmVlSlMnIE9yYml0Q29udHJvbHMgY2xhc3MsIHJld3JpdHRlbiB1c2luZyBlczYgd2l0aCBzb21lIGFkZGl0aW9ucyBhbmQgc3VidHJhY3Rpb25zLlxuLy8gVE9ETzogYWJzdHJhY3QgZXZlbnQgaGFuZGxlcnMgc28gY2FuIGJlIGZlZCBmcm9tIG90aGVyIHNvdXJjZXNcbi8vIFRPRE86IG1ha2Ugc2Nyb2xsIHpvb20gbW9yZSBhY2N1cmF0ZSB0aGFuIGp1c3QgPi88IHplcm9cbi8vIFRPRE86IGJlIGFibGUgdG8gcGFzcyBpbiBuZXcgY2FtZXJhIHBvc2l0aW9uXG5cbmltcG9ydCB7IFZlYzMgfSBmcm9tICcuLi9tYXRoL1ZlYzMuanMnO1xuaW1wb3J0IHsgVmVjMiB9IGZyb20gJy4uL21hdGgvVmVjMi5qcyc7XG5cbmNvbnN0IFNUQVRFID0geyBOT05FOiAtMSwgUk9UQVRFOiAwLCBET0xMWTogMSwgUEFOOiAyLCBET0xMWV9QQU46IDMgfTtcbmNvbnN0IHRlbXBWZWMzID0gbmV3IFZlYzMoKTtcbmNvbnN0IHRlbXBWZWMyYSA9IG5ldyBWZWMyKCk7XG5jb25zdCB0ZW1wVmVjMmIgPSBuZXcgVmVjMigpO1xuXG5leHBvcnQgZnVuY3Rpb24gT3JiaXQoXG4gICAgb2JqZWN0LFxuICAgIHtcbiAgICAgICAgZWxlbWVudCA9IGRvY3VtZW50LFxuICAgICAgICBlbmFibGVkID0gdHJ1ZSxcbiAgICAgICAgdGFyZ2V0ID0gbmV3IFZlYzMoKSxcbiAgICAgICAgZWFzZSA9IDAuMjUsXG4gICAgICAgIGluZXJ0aWEgPSAwLjg1LFxuICAgICAgICBlbmFibGVSb3RhdGUgPSB0cnVlLFxuICAgICAgICByb3RhdGVTcGVlZCA9IDAuMSxcbiAgICAgICAgYXV0b1JvdGF0ZSA9IGZhbHNlLFxuICAgICAgICBhdXRvUm90YXRlU3BlZWQgPSAxLjAsXG4gICAgICAgIGVuYWJsZVpvb20gPSB0cnVlLFxuICAgICAgICB6b29tU3BlZWQgPSAxLFxuICAgICAgICBlbmFibGVQYW4gPSB0cnVlLFxuICAgICAgICBwYW5TcGVlZCA9IDAuMSxcbiAgICAgICAgbWluUG9sYXJBbmdsZSA9IDAsXG4gICAgICAgIG1heFBvbGFyQW5nbGUgPSBNYXRoLlBJLFxuICAgICAgICBtaW5BemltdXRoQW5nbGUgPSAtSW5maW5pdHksXG4gICAgICAgIG1heEF6aW11dGhBbmdsZSA9IEluZmluaXR5LFxuICAgICAgICBtaW5EaXN0YW5jZSA9IDAsXG4gICAgICAgIG1heERpc3RhbmNlID0gSW5maW5pdHksXG4gICAgfSA9IHt9XG4pIHtcbiAgICB0aGlzLmVuYWJsZWQgPSBlbmFibGVkO1xuICAgIHRoaXMudGFyZ2V0ID0gdGFyZ2V0O1xuICAgIHRoaXMucm90YXRlU3BlZWQgPSByb3RhdGVTcGVlZDtcbiAgICB0aGlzLnBhblNwZWVkID0gcGFuU3BlZWQ7XG4gICAgLy8gQ2F0Y2ggYXR0ZW1wdHMgdG8gZGlzYWJsZSAtIHNldCB0byAxIHNvIGhhcyBubyBlZmZlY3RcbiAgICBlYXNlID0gZWFzZSB8fCAxO1xuICAgIGluZXJ0aWEgPSBpbmVydGlhIHx8IDA7XG5cbiAgICB0aGlzLm1pbkRpc3RhbmNlID0gbWluRGlzdGFuY2U7XG4gICAgdGhpcy5tYXhEaXN0YW5jZSA9IG1heERpc3RhbmNlO1xuXG4gICAgLy8gY3VycmVudCBwb3NpdGlvbiBpbiBzcGhlcmljYWxUYXJnZXQgY29vcmRpbmF0ZXNcbiAgICBjb25zdCBzcGhlcmljYWxEZWx0YSA9IHsgcmFkaXVzOiAxLCBwaGk6IDAsIHRoZXRhOiAwIH07XG4gICAgY29uc3Qgc3BoZXJpY2FsVGFyZ2V0ID0geyByYWRpdXM6IDEsIHBoaTogMCwgdGhldGE6IDAgfTtcbiAgICBjb25zdCBzcGhlcmljYWwgPSB7IHJhZGl1czogMSwgcGhpOiAwLCB0aGV0YTogMCB9O1xuICAgIGNvbnN0IHBhbkRlbHRhID0gbmV3IFZlYzMoKTtcblxuICAgIC8vIEdyYWIgaW5pdGlhbCBwb3NpdGlvbiB2YWx1ZXNcbiAgICBjb25zdCBvZmZzZXQgPSBuZXcgVmVjMygpO1xuICAgIG9mZnNldC5jb3B5KG9iamVjdC5wb3NpdGlvbikuc3ViKHRoaXMudGFyZ2V0KTtcbiAgICBzcGhlcmljYWwucmFkaXVzID0gc3BoZXJpY2FsVGFyZ2V0LnJhZGl1cyA9IG9mZnNldC5kaXN0YW5jZSgpO1xuICAgIHNwaGVyaWNhbC50aGV0YSA9IHNwaGVyaWNhbFRhcmdldC50aGV0YSA9IE1hdGguYXRhbjIob2Zmc2V0LngsIG9mZnNldC56KTtcbiAgICBzcGhlcmljYWwucGhpID0gc3BoZXJpY2FsVGFyZ2V0LnBoaSA9IE1hdGguYWNvcyhNYXRoLm1pbihNYXRoLm1heChvZmZzZXQueSAvIHNwaGVyaWNhbFRhcmdldC5yYWRpdXMsIC0xKSwgMSkpO1xuXG4gICAgdGhpcy5vZmZzZXQgPSBvZmZzZXQ7XG5cbiAgICB0aGlzLnVwZGF0ZSA9ICgpID0+IHtcbiAgICAgICAgaWYgKGF1dG9Sb3RhdGUpIHtcbiAgICAgICAgICAgIGhhbmRsZUF1dG9Sb3RhdGUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGFwcGx5IGRlbHRhXG4gICAgICAgIHNwaGVyaWNhbFRhcmdldC5yYWRpdXMgKj0gc3BoZXJpY2FsRGVsdGEucmFkaXVzO1xuICAgICAgICBzcGhlcmljYWxUYXJnZXQudGhldGEgKz0gc3BoZXJpY2FsRGVsdGEudGhldGE7XG4gICAgICAgIHNwaGVyaWNhbFRhcmdldC5waGkgKz0gc3BoZXJpY2FsRGVsdGEucGhpO1xuXG4gICAgICAgIC8vIGFwcGx5IGJvdW5kYXJpZXNcbiAgICAgICAgc3BoZXJpY2FsVGFyZ2V0LnRoZXRhID0gTWF0aC5tYXgobWluQXppbXV0aEFuZ2xlLCBNYXRoLm1pbihtYXhBemltdXRoQW5nbGUsIHNwaGVyaWNhbFRhcmdldC50aGV0YSkpO1xuICAgICAgICBzcGhlcmljYWxUYXJnZXQucGhpID0gTWF0aC5tYXgobWluUG9sYXJBbmdsZSwgTWF0aC5taW4obWF4UG9sYXJBbmdsZSwgc3BoZXJpY2FsVGFyZ2V0LnBoaSkpO1xuICAgICAgICBzcGhlcmljYWxUYXJnZXQucmFkaXVzID0gTWF0aC5tYXgodGhpcy5taW5EaXN0YW5jZSwgTWF0aC5taW4odGhpcy5tYXhEaXN0YW5jZSwgc3BoZXJpY2FsVGFyZ2V0LnJhZGl1cykpO1xuXG4gICAgICAgIC8vIGVhc2UgdmFsdWVzXG4gICAgICAgIHNwaGVyaWNhbC5waGkgKz0gKHNwaGVyaWNhbFRhcmdldC5waGkgLSBzcGhlcmljYWwucGhpKSAqIGVhc2U7XG4gICAgICAgIHNwaGVyaWNhbC50aGV0YSArPSAoc3BoZXJpY2FsVGFyZ2V0LnRoZXRhIC0gc3BoZXJpY2FsLnRoZXRhKSAqIGVhc2U7XG4gICAgICAgIHNwaGVyaWNhbC5yYWRpdXMgKz0gKHNwaGVyaWNhbFRhcmdldC5yYWRpdXMgLSBzcGhlcmljYWwucmFkaXVzKSAqIGVhc2U7XG5cbiAgICAgICAgLy8gYXBwbHkgcGFuIHRvIHRhcmdldC4gQXMgb2Zmc2V0IGlzIHJlbGF0aXZlIHRvIHRhcmdldCwgaXQgYWxzbyBzaGlmdHNcbiAgICAgICAgdGhpcy50YXJnZXQuYWRkKHBhbkRlbHRhKTtcblxuICAgICAgICAvLyBhcHBseSByb3RhdGlvbiB0byBvZmZzZXRcbiAgICAgICAgbGV0IHNpblBoaVJhZGl1cyA9IHNwaGVyaWNhbC5yYWRpdXMgKiBNYXRoLnNpbihNYXRoLm1heCgwLjAwMDAwMSwgc3BoZXJpY2FsLnBoaSkpO1xuICAgICAgICBvZmZzZXQueCA9IHNpblBoaVJhZGl1cyAqIE1hdGguc2luKHNwaGVyaWNhbC50aGV0YSk7XG4gICAgICAgIG9mZnNldC55ID0gc3BoZXJpY2FsLnJhZGl1cyAqIE1hdGguY29zKHNwaGVyaWNhbC5waGkpO1xuICAgICAgICBvZmZzZXQueiA9IHNpblBoaVJhZGl1cyAqIE1hdGguY29zKHNwaGVyaWNhbC50aGV0YSk7XG5cbiAgICAgICAgLy8gQXBwbHkgdXBkYXRlZCB2YWx1ZXMgdG8gb2JqZWN0XG4gICAgICAgIG9iamVjdC5wb3NpdGlvbi5jb3B5KHRoaXMudGFyZ2V0KS5hZGQob2Zmc2V0KTtcbiAgICAgICAgb2JqZWN0Lmxvb2tBdCh0aGlzLnRhcmdldCk7XG5cbiAgICAgICAgLy8gQXBwbHkgaW5lcnRpYSB0byB2YWx1ZXNcbiAgICAgICAgc3BoZXJpY2FsRGVsdGEudGhldGEgKj0gaW5lcnRpYTtcbiAgICAgICAgc3BoZXJpY2FsRGVsdGEucGhpICo9IGluZXJ0aWE7XG4gICAgICAgIHBhbkRlbHRhLm11bHRpcGx5KGluZXJ0aWEpO1xuXG4gICAgICAgIC8vIFJlc2V0IHNjYWxlIGV2ZXJ5IGZyYW1lIHRvIGF2b2lkIGFwcGx5aW5nIHNjYWxlIG11bHRpcGxlIHRpbWVzXG4gICAgICAgIHNwaGVyaWNhbERlbHRhLnJhZGl1cyA9IDE7XG4gICAgfTtcblxuICAgIC8vIFVwZGF0ZXMgaW50ZXJuYWxzIHdpdGggbmV3IHBvc2l0aW9uXG4gICAgdGhpcy5mb3JjZVBvc2l0aW9uID0gKCkgPT4ge1xuICAgICAgICBvZmZzZXQuY29weShvYmplY3QucG9zaXRpb24pLnN1Yih0aGlzLnRhcmdldCk7XG4gICAgICAgIHNwaGVyaWNhbC5yYWRpdXMgPSBzcGhlcmljYWxUYXJnZXQucmFkaXVzID0gb2Zmc2V0LmRpc3RhbmNlKCk7XG4gICAgICAgIHNwaGVyaWNhbC50aGV0YSA9IHNwaGVyaWNhbFRhcmdldC50aGV0YSA9IE1hdGguYXRhbjIob2Zmc2V0LngsIG9mZnNldC56KTtcbiAgICAgICAgc3BoZXJpY2FsLnBoaSA9IHNwaGVyaWNhbFRhcmdldC5waGkgPSBNYXRoLmFjb3MoTWF0aC5taW4oTWF0aC5tYXgob2Zmc2V0LnkgLyBzcGhlcmljYWxUYXJnZXQucmFkaXVzLCAtMSksIDEpKTtcbiAgICAgICAgb2JqZWN0Lmxvb2tBdCh0aGlzLnRhcmdldCk7XG4gICAgfTtcblxuICAgIC8vIEV2ZXJ5dGhpbmcgYmVsb3cgaGVyZSBqdXN0IHVwZGF0ZXMgcGFuRGVsdGEgYW5kIHNwaGVyaWNhbERlbHRhXG4gICAgLy8gVXNpbmcgdGhvc2UgdHdvIG9iamVjdHMnIHZhbHVlcywgdGhlIG9yYml0IGlzIGNhbGN1bGF0ZWRcblxuICAgIGNvbnN0IHJvdGF0ZVN0YXJ0ID0gbmV3IFZlYzIoKTtcbiAgICBjb25zdCBwYW5TdGFydCA9IG5ldyBWZWMyKCk7XG4gICAgY29uc3QgZG9sbHlTdGFydCA9IG5ldyBWZWMyKCk7XG5cbiAgICBsZXQgc3RhdGUgPSBTVEFURS5OT05FO1xuICAgIHRoaXMubW91c2VCdXR0b25zID0geyBPUkJJVDogMCwgWk9PTTogMSwgUEFOOiAyIH07XG5cbiAgICBmdW5jdGlvbiBnZXRab29tU2NhbGUoKSB7XG4gICAgICAgIHJldHVybiBNYXRoLnBvdygwLjk1LCB6b29tU3BlZWQpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHBhbkxlZnQoZGlzdGFuY2UsIG0pIHtcbiAgICAgICAgdGVtcFZlYzMuc2V0KG1bMF0sIG1bMV0sIG1bMl0pO1xuICAgICAgICB0ZW1wVmVjMy5tdWx0aXBseSgtZGlzdGFuY2UpO1xuICAgICAgICBwYW5EZWx0YS5hZGQodGVtcFZlYzMpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHBhblVwKGRpc3RhbmNlLCBtKSB7XG4gICAgICAgIHRlbXBWZWMzLnNldChtWzRdLCBtWzVdLCBtWzZdKTtcbiAgICAgICAgdGVtcFZlYzMubXVsdGlwbHkoZGlzdGFuY2UpO1xuICAgICAgICBwYW5EZWx0YS5hZGQodGVtcFZlYzMpO1xuICAgIH1cblxuICAgIGNvbnN0IHBhbiA9IChkZWx0YVgsIGRlbHRhWSkgPT4ge1xuICAgICAgICBsZXQgZWwgPSBlbGVtZW50ID09PSBkb2N1bWVudCA/IGRvY3VtZW50LmJvZHkgOiBlbGVtZW50O1xuICAgICAgICB0ZW1wVmVjMy5jb3B5KG9iamVjdC5wb3NpdGlvbikuc3ViKHRoaXMudGFyZ2V0KTtcbiAgICAgICAgbGV0IHRhcmdldERpc3RhbmNlID0gdGVtcFZlYzMuZGlzdGFuY2UoKTtcbiAgICAgICAgdGFyZ2V0RGlzdGFuY2UgKj0gTWF0aC50YW4oKCgob2JqZWN0LmZvdiB8fCA0NSkgLyAyKSAqIE1hdGguUEkpIC8gMTgwLjApO1xuICAgICAgICBwYW5MZWZ0KCgyICogZGVsdGFYICogdGFyZ2V0RGlzdGFuY2UpIC8gZWwuY2xpZW50SGVpZ2h0LCBvYmplY3QubWF0cml4KTtcbiAgICAgICAgcGFuVXAoKDIgKiBkZWx0YVkgKiB0YXJnZXREaXN0YW5jZSkgLyBlbC5jbGllbnRIZWlnaHQsIG9iamVjdC5tYXRyaXgpO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBkb2xseShkb2xseVNjYWxlKSB7XG4gICAgICAgIHNwaGVyaWNhbERlbHRhLnJhZGl1cyAvPSBkb2xseVNjYWxlO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGhhbmRsZUF1dG9Sb3RhdGUoKSB7XG4gICAgICAgIGNvbnN0IGFuZ2xlID0gKCgyICogTWF0aC5QSSkgLyA2MCAvIDYwKSAqIGF1dG9Sb3RhdGVTcGVlZDtcbiAgICAgICAgc3BoZXJpY2FsRGVsdGEudGhldGEgLT0gYW5nbGU7XG4gICAgfVxuXG4gICAgbGV0IGhhbmRsZU1vdmVSb3RhdGUgPSAoeCwgeSkgPT4ge1xuICAgICAgICB0ZW1wVmVjMmEuc2V0KHgsIHkpO1xuICAgICAgICB0ZW1wVmVjMmIuc3ViKHRlbXBWZWMyYSwgcm90YXRlU3RhcnQpLm11bHRpcGx5KHRoaXMucm90YXRlU3BlZWQpO1xuICAgICAgICBsZXQgZWwgPSBlbGVtZW50ID09PSBkb2N1bWVudCA/IGRvY3VtZW50LmJvZHkgOiBlbGVtZW50O1xuICAgICAgICBzcGhlcmljYWxEZWx0YS50aGV0YSAtPSAoMiAqIE1hdGguUEkgKiB0ZW1wVmVjMmIueCkgLyBlbC5jbGllbnRIZWlnaHQ7XG4gICAgICAgIHNwaGVyaWNhbERlbHRhLnBoaSAtPSAoMiAqIE1hdGguUEkgKiB0ZW1wVmVjMmIueSkgLyBlbC5jbGllbnRIZWlnaHQ7XG4gICAgICAgIHJvdGF0ZVN0YXJ0LmNvcHkodGVtcFZlYzJhKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBoYW5kbGVNb3VzZU1vdmVEb2xseShlKSB7XG4gICAgICAgIHRlbXBWZWMyYS5zZXQoZS5jbGllbnRYLCBlLmNsaWVudFkpO1xuICAgICAgICB0ZW1wVmVjMmIuc3ViKHRlbXBWZWMyYSwgZG9sbHlTdGFydCk7XG4gICAgICAgIGlmICh0ZW1wVmVjMmIueSA+IDApIHtcbiAgICAgICAgICAgIGRvbGx5KGdldFpvb21TY2FsZSgpKTtcbiAgICAgICAgfSBlbHNlIGlmICh0ZW1wVmVjMmIueSA8IDApIHtcbiAgICAgICAgICAgIGRvbGx5KDEgLyBnZXRab29tU2NhbGUoKSk7XG4gICAgICAgIH1cbiAgICAgICAgZG9sbHlTdGFydC5jb3B5KHRlbXBWZWMyYSk7XG4gICAgfVxuXG4gICAgbGV0IGhhbmRsZU1vdmVQYW4gPSAoeCwgeSkgPT4ge1xuICAgICAgICB0ZW1wVmVjMmEuc2V0KHgsIHkpO1xuICAgICAgICB0ZW1wVmVjMmIuc3ViKHRlbXBWZWMyYSwgcGFuU3RhcnQpLm11bHRpcGx5KHRoaXMucGFuU3BlZWQpO1xuICAgICAgICBwYW4odGVtcFZlYzJiLngsIHRlbXBWZWMyYi55KTtcbiAgICAgICAgcGFuU3RhcnQuY29weSh0ZW1wVmVjMmEpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGhhbmRsZVRvdWNoU3RhcnREb2xseVBhbihlKSB7XG4gICAgICAgIGlmIChlbmFibGVab29tKSB7XG4gICAgICAgICAgICBsZXQgZHggPSBlLnRvdWNoZXNbMF0ucGFnZVggLSBlLnRvdWNoZXNbMV0ucGFnZVg7XG4gICAgICAgICAgICBsZXQgZHkgPSBlLnRvdWNoZXNbMF0ucGFnZVkgLSBlLnRvdWNoZXNbMV0ucGFnZVk7XG4gICAgICAgICAgICBsZXQgZGlzdGFuY2UgPSBNYXRoLnNxcnQoZHggKiBkeCArIGR5ICogZHkpO1xuICAgICAgICAgICAgZG9sbHlTdGFydC5zZXQoMCwgZGlzdGFuY2UpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGVuYWJsZVBhbikge1xuICAgICAgICAgICAgbGV0IHggPSAwLjUgKiAoZS50b3VjaGVzWzBdLnBhZ2VYICsgZS50b3VjaGVzWzFdLnBhZ2VYKTtcbiAgICAgICAgICAgIGxldCB5ID0gMC41ICogKGUudG91Y2hlc1swXS5wYWdlWSArIGUudG91Y2hlc1sxXS5wYWdlWSk7XG4gICAgICAgICAgICBwYW5TdGFydC5zZXQoeCwgeSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBoYW5kbGVUb3VjaE1vdmVEb2xseVBhbihlKSB7XG4gICAgICAgIGlmIChlbmFibGVab29tKSB7XG4gICAgICAgICAgICBsZXQgZHggPSBlLnRvdWNoZXNbMF0ucGFnZVggLSBlLnRvdWNoZXNbMV0ucGFnZVg7XG4gICAgICAgICAgICBsZXQgZHkgPSBlLnRvdWNoZXNbMF0ucGFnZVkgLSBlLnRvdWNoZXNbMV0ucGFnZVk7XG4gICAgICAgICAgICBsZXQgZGlzdGFuY2UgPSBNYXRoLnNxcnQoZHggKiBkeCArIGR5ICogZHkpO1xuICAgICAgICAgICAgdGVtcFZlYzJhLnNldCgwLCBkaXN0YW5jZSk7XG4gICAgICAgICAgICB0ZW1wVmVjMmIuc2V0KDAsIE1hdGgucG93KHRlbXBWZWMyYS55IC8gZG9sbHlTdGFydC55LCB6b29tU3BlZWQpKTtcbiAgICAgICAgICAgIGRvbGx5KHRlbXBWZWMyYi55KTtcbiAgICAgICAgICAgIGRvbGx5U3RhcnQuY29weSh0ZW1wVmVjMmEpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGVuYWJsZVBhbikge1xuICAgICAgICAgICAgbGV0IHggPSAwLjUgKiAoZS50b3VjaGVzWzBdLnBhZ2VYICsgZS50b3VjaGVzWzFdLnBhZ2VYKTtcbiAgICAgICAgICAgIGxldCB5ID0gMC41ICogKGUudG91Y2hlc1swXS5wYWdlWSArIGUudG91Y2hlc1sxXS5wYWdlWSk7XG4gICAgICAgICAgICBoYW5kbGVNb3ZlUGFuKHgsIHkpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY29uc3Qgb25Nb3VzZURvd24gPSAoZSkgPT4ge1xuICAgICAgICBpZiAoIXRoaXMuZW5hYmxlZCkgcmV0dXJuO1xuXG4gICAgICAgIHN3aXRjaCAoZS5idXR0b24pIHtcbiAgICAgICAgICAgIGNhc2UgdGhpcy5tb3VzZUJ1dHRvbnMuT1JCSVQ6XG4gICAgICAgICAgICAgICAgaWYgKGVuYWJsZVJvdGF0ZSA9PT0gZmFsc2UpIHJldHVybjtcbiAgICAgICAgICAgICAgICByb3RhdGVTdGFydC5zZXQoZS5jbGllbnRYLCBlLmNsaWVudFkpO1xuICAgICAgICAgICAgICAgIHN0YXRlID0gU1RBVEUuUk9UQVRFO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSB0aGlzLm1vdXNlQnV0dG9ucy5aT09NOlxuICAgICAgICAgICAgICAgIGlmIChlbmFibGVab29tID09PSBmYWxzZSkgcmV0dXJuO1xuICAgICAgICAgICAgICAgIGRvbGx5U3RhcnQuc2V0KGUuY2xpZW50WCwgZS5jbGllbnRZKTtcbiAgICAgICAgICAgICAgICBzdGF0ZSA9IFNUQVRFLkRPTExZO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSB0aGlzLm1vdXNlQnV0dG9ucy5QQU46XG4gICAgICAgICAgICAgICAgaWYgKGVuYWJsZVBhbiA9PT0gZmFsc2UpIHJldHVybjtcbiAgICAgICAgICAgICAgICBwYW5TdGFydC5zZXQoZS5jbGllbnRYLCBlLmNsaWVudFkpO1xuICAgICAgICAgICAgICAgIHN0YXRlID0gU1RBVEUuUEFOO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHN0YXRlICE9PSBTVEFURS5OT05FKSB7XG4gICAgICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgb25Nb3VzZU1vdmUsIGZhbHNlKTtcbiAgICAgICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgb25Nb3VzZVVwLCBmYWxzZSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgY29uc3Qgb25Nb3VzZU1vdmUgPSAoZSkgPT4ge1xuICAgICAgICBpZiAoIXRoaXMuZW5hYmxlZCkgcmV0dXJuO1xuXG4gICAgICAgIHN3aXRjaCAoc3RhdGUpIHtcbiAgICAgICAgICAgIGNhc2UgU1RBVEUuUk9UQVRFOlxuICAgICAgICAgICAgICAgIGlmIChlbmFibGVSb3RhdGUgPT09IGZhbHNlKSByZXR1cm47XG4gICAgICAgICAgICAgICAgaGFuZGxlTW92ZVJvdGF0ZShlLmNsaWVudFgsIGUuY2xpZW50WSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFNUQVRFLkRPTExZOlxuICAgICAgICAgICAgICAgIGlmIChlbmFibGVab29tID09PSBmYWxzZSkgcmV0dXJuO1xuICAgICAgICAgICAgICAgIGhhbmRsZU1vdXNlTW92ZURvbGx5KGUpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBTVEFURS5QQU46XG4gICAgICAgICAgICAgICAgaWYgKGVuYWJsZVBhbiA9PT0gZmFsc2UpIHJldHVybjtcbiAgICAgICAgICAgICAgICBoYW5kbGVNb3ZlUGFuKGUuY2xpZW50WCwgZS5jbGllbnRZKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBjb25zdCBvbk1vdXNlVXAgPSAoKSA9PiB7XG4gICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCBvbk1vdXNlTW92ZSwgZmFsc2UpO1xuICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIG9uTW91c2VVcCwgZmFsc2UpO1xuICAgICAgICBzdGF0ZSA9IFNUQVRFLk5PTkU7XG4gICAgfTtcblxuICAgIGNvbnN0IG9uTW91c2VXaGVlbCA9IChlKSA9PiB7XG4gICAgICAgIGlmICghdGhpcy5lbmFibGVkIHx8ICFlbmFibGVab29tIHx8IChzdGF0ZSAhPT0gU1RBVEUuTk9ORSAmJiBzdGF0ZSAhPT0gU1RBVEUuUk9UQVRFKSkgcmV0dXJuO1xuICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgaWYgKGUuZGVsdGFZIDwgMCkge1xuICAgICAgICAgICAgZG9sbHkoMSAvIGdldFpvb21TY2FsZSgpKTtcbiAgICAgICAgfSBlbHNlIGlmIChlLmRlbHRhWSA+IDApIHtcbiAgICAgICAgICAgIGRvbGx5KGdldFpvb21TY2FsZSgpKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBjb25zdCBvblRvdWNoU3RhcnQgPSAoZSkgPT4ge1xuICAgICAgICBpZiAoIXRoaXMuZW5hYmxlZCkgcmV0dXJuO1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgc3dpdGNoIChlLnRvdWNoZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICAgICAgaWYgKGVuYWJsZVJvdGF0ZSA9PT0gZmFsc2UpIHJldHVybjtcbiAgICAgICAgICAgICAgICByb3RhdGVTdGFydC5zZXQoZS50b3VjaGVzWzBdLnBhZ2VYLCBlLnRvdWNoZXNbMF0ucGFnZVkpO1xuICAgICAgICAgICAgICAgIHN0YXRlID0gU1RBVEUuUk9UQVRFO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgICAgIGlmIChlbmFibGVab29tID09PSBmYWxzZSAmJiBlbmFibGVQYW4gPT09IGZhbHNlKSByZXR1cm47XG4gICAgICAgICAgICAgICAgaGFuZGxlVG91Y2hTdGFydERvbGx5UGFuKGUpO1xuICAgICAgICAgICAgICAgIHN0YXRlID0gU1RBVEUuRE9MTFlfUEFOO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICBzdGF0ZSA9IFNUQVRFLk5PTkU7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgY29uc3Qgb25Ub3VjaE1vdmUgPSAoZSkgPT4ge1xuICAgICAgICBpZiAoIXRoaXMuZW5hYmxlZCkgcmV0dXJuO1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG5cbiAgICAgICAgc3dpdGNoIChlLnRvdWNoZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICAgICAgaWYgKGVuYWJsZVJvdGF0ZSA9PT0gZmFsc2UpIHJldHVybjtcbiAgICAgICAgICAgICAgICBoYW5kbGVNb3ZlUm90YXRlKGUudG91Y2hlc1swXS5wYWdlWCwgZS50b3VjaGVzWzBdLnBhZ2VZKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgICAgICBpZiAoZW5hYmxlWm9vbSA9PT0gZmFsc2UgJiYgZW5hYmxlUGFuID09PSBmYWxzZSkgcmV0dXJuO1xuICAgICAgICAgICAgICAgIGhhbmRsZVRvdWNoTW92ZURvbGx5UGFuKGUpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICBzdGF0ZSA9IFNUQVRFLk5PTkU7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgY29uc3Qgb25Ub3VjaEVuZCA9ICgpID0+IHtcbiAgICAgICAgaWYgKCF0aGlzLmVuYWJsZWQpIHJldHVybjtcbiAgICAgICAgc3RhdGUgPSBTVEFURS5OT05FO1xuICAgIH07XG5cbiAgICBjb25zdCBvbkNvbnRleHRNZW51ID0gKGUpID0+IHtcbiAgICAgICAgaWYgKCF0aGlzLmVuYWJsZWQpIHJldHVybjtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBhZGRIYW5kbGVycygpIHtcbiAgICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdjb250ZXh0bWVudScsIG9uQ29udGV4dE1lbnUsIGZhbHNlKTtcbiAgICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCBvbk1vdXNlRG93biwgZmFsc2UpO1xuICAgICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3doZWVsJywgb25Nb3VzZVdoZWVsLCB7IHBhc3NpdmU6IGZhbHNlIH0pO1xuICAgICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCBvblRvdWNoU3RhcnQsIHsgcGFzc2l2ZTogZmFsc2UgfSk7XG4gICAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCBvblRvdWNoRW5kLCBmYWxzZSk7XG4gICAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgb25Ub3VjaE1vdmUsIHsgcGFzc2l2ZTogZmFsc2UgfSk7XG4gICAgfVxuXG4gICAgdGhpcy5yZW1vdmUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignY29udGV4dG1lbnUnLCBvbkNvbnRleHRNZW51KTtcbiAgICAgICAgZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCBvbk1vdXNlRG93bik7XG4gICAgICAgIGVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignd2hlZWwnLCBvbk1vdXNlV2hlZWwpO1xuICAgICAgICBlbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCBvblRvdWNoU3RhcnQpO1xuICAgICAgICBlbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgb25Ub3VjaEVuZCk7XG4gICAgICAgIGVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgb25Ub3VjaE1vdmUpO1xuICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgb25Nb3VzZU1vdmUpO1xuICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIG9uTW91c2VVcCk7XG4gICAgfTtcblxuICAgIGFkZEhhbmRsZXJzKCk7XG59XG4iLCJpbXBvcnQgeyBHZW9tZXRyeSB9IGZyb20gJy4uL2NvcmUvR2VvbWV0cnkuanMnO1xuXG5leHBvcnQgY2xhc3MgUGxhbmUgZXh0ZW5kcyBHZW9tZXRyeSB7XG4gICAgY29uc3RydWN0b3IoZ2wsIHsgd2lkdGggPSAxLCBoZWlnaHQgPSAxLCB3aWR0aFNlZ21lbnRzID0gMSwgaGVpZ2h0U2VnbWVudHMgPSAxLCBhdHRyaWJ1dGVzID0ge30gfSA9IHt9KSB7XG4gICAgICAgIGNvbnN0IHdTZWdzID0gd2lkdGhTZWdtZW50cztcbiAgICAgICAgY29uc3QgaFNlZ3MgPSBoZWlnaHRTZWdtZW50cztcblxuICAgICAgICAvLyBEZXRlcm1pbmUgbGVuZ3RoIG9mIGFycmF5c1xuICAgICAgICBjb25zdCBudW0gPSAod1NlZ3MgKyAxKSAqIChoU2VncyArIDEpO1xuICAgICAgICBjb25zdCBudW1JbmRpY2VzID0gd1NlZ3MgKiBoU2VncyAqIDY7XG5cbiAgICAgICAgLy8gR2VuZXJhdGUgZW1wdHkgYXJyYXlzIG9uY2VcbiAgICAgICAgY29uc3QgcG9zaXRpb24gPSBuZXcgRmxvYXQzMkFycmF5KG51bSAqIDMpO1xuICAgICAgICBjb25zdCBub3JtYWwgPSBuZXcgRmxvYXQzMkFycmF5KG51bSAqIDMpO1xuICAgICAgICBjb25zdCB1diA9IG5ldyBGbG9hdDMyQXJyYXkobnVtICogMik7XG4gICAgICAgIGNvbnN0IGluZGV4ID0gbnVtID4gNjU1MzYgPyBuZXcgVWludDMyQXJyYXkobnVtSW5kaWNlcykgOiBuZXcgVWludDE2QXJyYXkobnVtSW5kaWNlcyk7XG5cbiAgICAgICAgUGxhbmUuYnVpbGRQbGFuZShwb3NpdGlvbiwgbm9ybWFsLCB1diwgaW5kZXgsIHdpZHRoLCBoZWlnaHQsIDAsIHdTZWdzLCBoU2Vncyk7XG5cbiAgICAgICAgT2JqZWN0LmFzc2lnbihhdHRyaWJ1dGVzLCB7XG4gICAgICAgICAgICBwb3NpdGlvbjogeyBzaXplOiAzLCBkYXRhOiBwb3NpdGlvbiB9LFxuICAgICAgICAgICAgbm9ybWFsOiB7IHNpemU6IDMsIGRhdGE6IG5vcm1hbCB9LFxuICAgICAgICAgICAgdXY6IHsgc2l6ZTogMiwgZGF0YTogdXYgfSxcbiAgICAgICAgICAgIGluZGV4OiB7IGRhdGE6IGluZGV4IH0sXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHN1cGVyKGdsLCBhdHRyaWJ1dGVzKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgYnVpbGRQbGFuZShwb3NpdGlvbiwgbm9ybWFsLCB1diwgaW5kZXgsIHdpZHRoLCBoZWlnaHQsIGRlcHRoLCB3U2VncywgaFNlZ3MsIHUgPSAwLCB2ID0gMSwgdyA9IDIsIHVEaXIgPSAxLCB2RGlyID0gLTEsIGkgPSAwLCBpaSA9IDApIHtcbiAgICAgICAgY29uc3QgaW8gPSBpO1xuICAgICAgICBjb25zdCBzZWdXID0gd2lkdGggLyB3U2VncztcbiAgICAgICAgY29uc3Qgc2VnSCA9IGhlaWdodCAvIGhTZWdzO1xuXG4gICAgICAgIGZvciAobGV0IGl5ID0gMDsgaXkgPD0gaFNlZ3M7IGl5KyspIHtcbiAgICAgICAgICAgIGxldCB5ID0gaXkgKiBzZWdIIC0gaGVpZ2h0IC8gMjtcbiAgICAgICAgICAgIGZvciAobGV0IGl4ID0gMDsgaXggPD0gd1NlZ3M7IGl4KyssIGkrKykge1xuICAgICAgICAgICAgICAgIGxldCB4ID0gaXggKiBzZWdXIC0gd2lkdGggLyAyO1xuXG4gICAgICAgICAgICAgICAgcG9zaXRpb25baSAqIDMgKyB1XSA9IHggKiB1RGlyO1xuICAgICAgICAgICAgICAgIHBvc2l0aW9uW2kgKiAzICsgdl0gPSB5ICogdkRpcjtcbiAgICAgICAgICAgICAgICBwb3NpdGlvbltpICogMyArIHddID0gZGVwdGggLyAyO1xuXG4gICAgICAgICAgICAgICAgbm9ybWFsW2kgKiAzICsgdV0gPSAwO1xuICAgICAgICAgICAgICAgIG5vcm1hbFtpICogMyArIHZdID0gMDtcbiAgICAgICAgICAgICAgICBub3JtYWxbaSAqIDMgKyB3XSA9IGRlcHRoID49IDAgPyAxIDogLTE7XG5cbiAgICAgICAgICAgICAgICB1dltpICogMl0gPSBpeCAvIHdTZWdzO1xuICAgICAgICAgICAgICAgIHV2W2kgKiAyICsgMV0gPSAxIC0gaXkgLyBoU2VncztcblxuICAgICAgICAgICAgICAgIGlmIChpeSA9PT0gaFNlZ3MgfHwgaXggPT09IHdTZWdzKSBjb250aW51ZTtcbiAgICAgICAgICAgICAgICBsZXQgYSA9IGlvICsgaXggKyBpeSAqICh3U2VncyArIDEpO1xuICAgICAgICAgICAgICAgIGxldCBiID0gaW8gKyBpeCArIChpeSArIDEpICogKHdTZWdzICsgMSk7XG4gICAgICAgICAgICAgICAgbGV0IGMgPSBpbyArIGl4ICsgKGl5ICsgMSkgKiAod1NlZ3MgKyAxKSArIDE7XG4gICAgICAgICAgICAgICAgbGV0IGQgPSBpbyArIGl4ICsgaXkgKiAod1NlZ3MgKyAxKSArIDE7XG5cbiAgICAgICAgICAgICAgICBpbmRleFtpaSAqIDZdID0gYTtcbiAgICAgICAgICAgICAgICBpbmRleFtpaSAqIDYgKyAxXSA9IGI7XG4gICAgICAgICAgICAgICAgaW5kZXhbaWkgKiA2ICsgMl0gPSBkO1xuICAgICAgICAgICAgICAgIGluZGV4W2lpICogNiArIDNdID0gYjtcbiAgICAgICAgICAgICAgICBpbmRleFtpaSAqIDYgKyA0XSA9IGM7XG4gICAgICAgICAgICAgICAgaW5kZXhbaWkgKiA2ICsgNV0gPSBkO1xuICAgICAgICAgICAgICAgIGlpKys7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCJpbXBvcnQgeyBHZW9tZXRyeSB9IGZyb20gJy4uL2NvcmUvR2VvbWV0cnkuanMnO1xuaW1wb3J0IHsgUHJvZ3JhbSB9IGZyb20gJy4uL2NvcmUvUHJvZ3JhbS5qcyc7XG5pbXBvcnQgeyBNZXNoIH0gZnJvbSAnLi4vY29yZS9NZXNoLmpzJztcbmltcG9ydCB7IFZlYzIgfSBmcm9tICcuLi9tYXRoL1ZlYzIuanMnO1xuaW1wb3J0IHsgVmVjMyB9IGZyb20gJy4uL21hdGgvVmVjMy5qcyc7XG5pbXBvcnQgeyBDb2xvciB9IGZyb20gJy4uL21hdGgvQ29sb3IuanMnO1xuXG5jb25zdCB0bXAgPSBuZXcgVmVjMygpO1xuXG5leHBvcnQgY2xhc3MgUG9seWxpbmUge1xuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICBnbCxcbiAgICAgICAge1xuICAgICAgICAgICAgcG9pbnRzLCAvLyBBcnJheSBvZiBWZWMzc1xuICAgICAgICAgICAgdmVydGV4ID0gZGVmYXVsdFZlcnRleCxcbiAgICAgICAgICAgIGZyYWdtZW50ID0gZGVmYXVsdEZyYWdtZW50LFxuICAgICAgICAgICAgdW5pZm9ybXMgPSB7fSxcbiAgICAgICAgICAgIGF0dHJpYnV0ZXMgPSB7fSwgLy8gRm9yIHBhc3NpbmcgaW4gY3VzdG9tIGF0dHJpYnNcbiAgICAgICAgfVxuICAgICkge1xuICAgICAgICB0aGlzLmdsID0gZ2w7XG4gICAgICAgIHRoaXMucG9pbnRzID0gcG9pbnRzO1xuICAgICAgICB0aGlzLmNvdW50ID0gcG9pbnRzLmxlbmd0aDtcblxuICAgICAgICAvLyBDcmVhdGUgYnVmZmVyc1xuICAgICAgICB0aGlzLnBvc2l0aW9uID0gbmV3IEZsb2F0MzJBcnJheSh0aGlzLmNvdW50ICogMyAqIDIpO1xuICAgICAgICB0aGlzLnByZXYgPSBuZXcgRmxvYXQzMkFycmF5KHRoaXMuY291bnQgKiAzICogMik7XG4gICAgICAgIHRoaXMubmV4dCA9IG5ldyBGbG9hdDMyQXJyYXkodGhpcy5jb3VudCAqIDMgKiAyKTtcbiAgICAgICAgY29uc3Qgc2lkZSA9IG5ldyBGbG9hdDMyQXJyYXkodGhpcy5jb3VudCAqIDEgKiAyKTtcbiAgICAgICAgY29uc3QgdXYgPSBuZXcgRmxvYXQzMkFycmF5KHRoaXMuY291bnQgKiAyICogMik7XG4gICAgICAgIGNvbnN0IGluZGV4ID0gbmV3IFVpbnQxNkFycmF5KCh0aGlzLmNvdW50IC0gMSkgKiAzICogMik7XG5cbiAgICAgICAgLy8gU2V0IHN0YXRpYyBidWZmZXJzXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5jb3VudDsgaSsrKSB7XG4gICAgICAgICAgICBzaWRlLnNldChbLTEsIDFdLCBpICogMik7XG4gICAgICAgICAgICBjb25zdCB2ID0gaSAvICh0aGlzLmNvdW50IC0gMSk7XG4gICAgICAgICAgICB1di5zZXQoWzAsIHYsIDEsIHZdLCBpICogNCk7XG5cbiAgICAgICAgICAgIGlmIChpID09PSB0aGlzLmNvdW50IC0gMSkgY29udGludWU7XG4gICAgICAgICAgICBjb25zdCBpbmQgPSBpICogMjtcbiAgICAgICAgICAgIGluZGV4LnNldChbaW5kICsgMCwgaW5kICsgMSwgaW5kICsgMl0sIChpbmQgKyAwKSAqIDMpO1xuICAgICAgICAgICAgaW5kZXguc2V0KFtpbmQgKyAyLCBpbmQgKyAxLCBpbmQgKyAzXSwgKGluZCArIDEpICogMyk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBnZW9tZXRyeSA9ICh0aGlzLmdlb21ldHJ5ID0gbmV3IEdlb21ldHJ5KFxuICAgICAgICAgICAgZ2wsXG4gICAgICAgICAgICBPYmplY3QuYXNzaWduKGF0dHJpYnV0ZXMsIHtcbiAgICAgICAgICAgICAgICBwb3NpdGlvbjogeyBzaXplOiAzLCBkYXRhOiB0aGlzLnBvc2l0aW9uIH0sXG4gICAgICAgICAgICAgICAgcHJldjogeyBzaXplOiAzLCBkYXRhOiB0aGlzLnByZXYgfSxcbiAgICAgICAgICAgICAgICBuZXh0OiB7IHNpemU6IDMsIGRhdGE6IHRoaXMubmV4dCB9LFxuICAgICAgICAgICAgICAgIHNpZGU6IHsgc2l6ZTogMSwgZGF0YTogc2lkZSB9LFxuICAgICAgICAgICAgICAgIHV2OiB7IHNpemU6IDIsIGRhdGE6IHV2IH0sXG4gICAgICAgICAgICAgICAgaW5kZXg6IHsgc2l6ZTogMSwgZGF0YTogaW5kZXggfSxcbiAgICAgICAgICAgIH0pXG4gICAgICAgICkpO1xuXG4gICAgICAgIC8vIFBvcHVsYXRlIGR5bmFtaWMgYnVmZmVyc1xuICAgICAgICB0aGlzLnVwZGF0ZUdlb21ldHJ5KCk7XG5cbiAgICAgICAgaWYgKCF1bmlmb3Jtcy51UmVzb2x1dGlvbikgdGhpcy5yZXNvbHV0aW9uID0gdW5pZm9ybXMudVJlc29sdXRpb24gPSB7IHZhbHVlOiBuZXcgVmVjMigpIH07XG4gICAgICAgIGlmICghdW5pZm9ybXMudURQUikgdGhpcy5kcHIgPSB1bmlmb3Jtcy51RFBSID0geyB2YWx1ZTogMSB9O1xuICAgICAgICBpZiAoIXVuaWZvcm1zLnVUaGlja25lc3MpIHRoaXMudGhpY2tuZXNzID0gdW5pZm9ybXMudVRoaWNrbmVzcyA9IHsgdmFsdWU6IDEgfTtcbiAgICAgICAgaWYgKCF1bmlmb3Jtcy51Q29sb3IpIHRoaXMuY29sb3IgPSB1bmlmb3Jtcy51Q29sb3IgPSB7IHZhbHVlOiBuZXcgQ29sb3IoJyMwMDAnKSB9O1xuICAgICAgICBpZiAoIXVuaWZvcm1zLnVNaXRlcikgdGhpcy5taXRlciA9IHVuaWZvcm1zLnVNaXRlciA9IHsgdmFsdWU6IDEgfTtcblxuICAgICAgICAvLyBTZXQgc2l6ZSB1bmlmb3JtcycgdmFsdWVzXG4gICAgICAgIHRoaXMucmVzaXplKCk7XG5cbiAgICAgICAgY29uc3QgcHJvZ3JhbSA9ICh0aGlzLnByb2dyYW0gPSBuZXcgUHJvZ3JhbShnbCwge1xuICAgICAgICAgICAgdmVydGV4LFxuICAgICAgICAgICAgZnJhZ21lbnQsXG4gICAgICAgICAgICB1bmlmb3JtcyxcbiAgICAgICAgfSkpO1xuXG4gICAgICAgIHRoaXMubWVzaCA9IG5ldyBNZXNoKGdsLCB7IGdlb21ldHJ5LCBwcm9ncmFtIH0pO1xuICAgIH1cblxuICAgIHVwZGF0ZUdlb21ldHJ5KCkge1xuICAgICAgICB0aGlzLnBvaW50cy5mb3JFYWNoKChwLCBpKSA9PiB7XG4gICAgICAgICAgICBwLnRvQXJyYXkodGhpcy5wb3NpdGlvbiwgaSAqIDMgKiAyKTtcbiAgICAgICAgICAgIHAudG9BcnJheSh0aGlzLnBvc2l0aW9uLCBpICogMyAqIDIgKyAzKTtcblxuICAgICAgICAgICAgaWYgKCFpKSB7XG4gICAgICAgICAgICAgICAgLy8gSWYgZmlyc3QgcG9pbnQsIGNhbGN1bGF0ZSBwcmV2IHVzaW5nIHRoZSBkaXN0YW5jZSB0byAybmQgcG9pbnRcbiAgICAgICAgICAgICAgICB0bXAuY29weShwKVxuICAgICAgICAgICAgICAgICAgICAuc3ViKHRoaXMucG9pbnRzW2kgKyAxXSlcbiAgICAgICAgICAgICAgICAgICAgLmFkZChwKTtcbiAgICAgICAgICAgICAgICB0bXAudG9BcnJheSh0aGlzLnByZXYsIGkgKiAzICogMik7XG4gICAgICAgICAgICAgICAgdG1wLnRvQXJyYXkodGhpcy5wcmV2LCBpICogMyAqIDIgKyAzKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcC50b0FycmF5KHRoaXMubmV4dCwgKGkgLSAxKSAqIDMgKiAyKTtcbiAgICAgICAgICAgICAgICBwLnRvQXJyYXkodGhpcy5uZXh0LCAoaSAtIDEpICogMyAqIDIgKyAzKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGkgPT09IHRoaXMucG9pbnRzLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgICAgICAgICAvLyBJZiBsYXN0IHBvaW50LCBjYWxjdWxhdGUgbmV4dCB1c2luZyBkaXN0YW5jZSB0byAybmQgbGFzdCBwb2ludFxuICAgICAgICAgICAgICAgIHRtcC5jb3B5KHApXG4gICAgICAgICAgICAgICAgICAgIC5zdWIodGhpcy5wb2ludHNbaSAtIDFdKVxuICAgICAgICAgICAgICAgICAgICAuYWRkKHApO1xuICAgICAgICAgICAgICAgIHRtcC50b0FycmF5KHRoaXMubmV4dCwgaSAqIDMgKiAyKTtcbiAgICAgICAgICAgICAgICB0bXAudG9BcnJheSh0aGlzLm5leHQsIGkgKiAzICogMiArIDMpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBwLnRvQXJyYXkodGhpcy5wcmV2LCAoaSArIDEpICogMyAqIDIpO1xuICAgICAgICAgICAgICAgIHAudG9BcnJheSh0aGlzLnByZXYsIChpICsgMSkgKiAzICogMiArIDMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLmdlb21ldHJ5LmF0dHJpYnV0ZXMucG9zaXRpb24ubmVlZHNVcGRhdGUgPSB0cnVlO1xuICAgICAgICB0aGlzLmdlb21ldHJ5LmF0dHJpYnV0ZXMucHJldi5uZWVkc1VwZGF0ZSA9IHRydWU7XG4gICAgICAgIHRoaXMuZ2VvbWV0cnkuYXR0cmlidXRlcy5uZXh0Lm5lZWRzVXBkYXRlID0gdHJ1ZTtcbiAgICB9XG5cbiAgICAvLyBPbmx5IG5lZWQgdG8gY2FsbCBpZiBub3QgaGFuZGxpbmcgcmVzb2x1dGlvbiB1bmlmb3JtcyBtYW51YWxseVxuICAgIHJlc2l6ZSgpIHtcbiAgICAgICAgLy8gVXBkYXRlIGF1dG9tYXRpYyB1bmlmb3JtcyBpZiBub3Qgb3ZlcnJpZGRlblxuICAgICAgICBpZiAodGhpcy5yZXNvbHV0aW9uKSB0aGlzLnJlc29sdXRpb24udmFsdWUuc2V0KHRoaXMuZ2wuY2FudmFzLndpZHRoLCB0aGlzLmdsLmNhbnZhcy5oZWlnaHQpO1xuICAgICAgICBpZiAodGhpcy5kcHIpIHRoaXMuZHByLnZhbHVlID0gdGhpcy5nbC5yZW5kZXJlci5kcHI7XG4gICAgfVxufVxuXG5jb25zdCBkZWZhdWx0VmVydGV4ID0gLyogZ2xzbCAqLyBgXG4gICAgcHJlY2lzaW9uIGhpZ2hwIGZsb2F0O1xuXG4gICAgYXR0cmlidXRlIHZlYzMgcG9zaXRpb247XG4gICAgYXR0cmlidXRlIHZlYzMgbmV4dDtcbiAgICBhdHRyaWJ1dGUgdmVjMyBwcmV2O1xuICAgIGF0dHJpYnV0ZSB2ZWMyIHV2O1xuICAgIGF0dHJpYnV0ZSBmbG9hdCBzaWRlO1xuXG4gICAgdW5pZm9ybSBtYXQ0IG1vZGVsVmlld01hdHJpeDtcbiAgICB1bmlmb3JtIG1hdDQgcHJvamVjdGlvbk1hdHJpeDtcbiAgICB1bmlmb3JtIHZlYzIgdVJlc29sdXRpb247XG4gICAgdW5pZm9ybSBmbG9hdCB1RFBSO1xuICAgIHVuaWZvcm0gZmxvYXQgdVRoaWNrbmVzcztcbiAgICB1bmlmb3JtIGZsb2F0IHVNaXRlcjtcblxuICAgIHZhcnlpbmcgdmVjMiB2VXY7XG5cbiAgICB2ZWM0IGdldFBvc2l0aW9uKCkge1xuICAgICAgICBtYXQ0IG12cCA9IHByb2plY3Rpb25NYXRyaXggKiBtb2RlbFZpZXdNYXRyaXg7XG4gICAgICAgIHZlYzQgY3VycmVudCA9IG12cCAqIHZlYzQocG9zaXRpb24sIDEpO1xuICAgICAgICB2ZWM0IG5leHRQb3MgPSBtdnAgKiB2ZWM0KG5leHQsIDEpO1xuICAgICAgICB2ZWM0IHByZXZQb3MgPSBtdnAgKiB2ZWM0KHByZXYsIDEpO1xuXG4gICAgICAgIHZlYzIgYXNwZWN0ID0gdmVjMih1UmVzb2x1dGlvbi54IC8gdVJlc29sdXRpb24ueSwgMSk7ICAgIFxuICAgICAgICB2ZWMyIGN1cnJlbnRTY3JlZW4gPSBjdXJyZW50Lnh5IC8gY3VycmVudC53ICogYXNwZWN0O1xuICAgICAgICB2ZWMyIG5leHRTY3JlZW4gPSBuZXh0UG9zLnh5IC8gbmV4dFBvcy53ICogYXNwZWN0O1xuICAgICAgICB2ZWMyIHByZXZTY3JlZW4gPSBwcmV2UG9zLnh5IC8gcHJldlBvcy53ICogYXNwZWN0O1xuICAgIFxuICAgICAgICB2ZWMyIGRpcjEgPSBub3JtYWxpemUoY3VycmVudFNjcmVlbiAtIHByZXZTY3JlZW4pO1xuICAgICAgICB2ZWMyIGRpcjIgPSBub3JtYWxpemUobmV4dFNjcmVlbiAtIGN1cnJlbnRTY3JlZW4pO1xuICAgICAgICB2ZWMyIGRpciA9IG5vcm1hbGl6ZShkaXIxICsgZGlyMik7XG4gICAgXG4gICAgICAgIHZlYzIgbm9ybWFsID0gdmVjMigtZGlyLnksIGRpci54KTtcbiAgICAgICAgbm9ybWFsIC89IG1peCgxLjAsIG1heCgwLjMsIGRvdChub3JtYWwsIHZlYzIoLWRpcjEueSwgZGlyMS54KSkpLCB1TWl0ZXIpO1xuICAgICAgICBub3JtYWwgLz0gYXNwZWN0O1xuXG4gICAgICAgIGZsb2F0IHBpeGVsV2lkdGhSYXRpbyA9IDEuMCAvICh1UmVzb2x1dGlvbi55IC8gdURQUik7XG4gICAgICAgIGZsb2F0IHBpeGVsV2lkdGggPSBjdXJyZW50LncgKiBwaXhlbFdpZHRoUmF0aW87XG4gICAgICAgIG5vcm1hbCAqPSBwaXhlbFdpZHRoICogdVRoaWNrbmVzcztcbiAgICAgICAgY3VycmVudC54eSAtPSBub3JtYWwgKiBzaWRlO1xuICAgIFxuICAgICAgICByZXR1cm4gY3VycmVudDtcbiAgICB9XG5cbiAgICB2b2lkIG1haW4oKSB7XG4gICAgICAgIHZVdiA9IHV2O1xuICAgICAgICBnbF9Qb3NpdGlvbiA9IGdldFBvc2l0aW9uKCk7XG4gICAgfVxuYDtcblxuY29uc3QgZGVmYXVsdEZyYWdtZW50ID0gLyogZ2xzbCAqLyBgXG4gICAgcHJlY2lzaW9uIGhpZ2hwIGZsb2F0O1xuXG4gICAgdW5pZm9ybSB2ZWMzIHVDb2xvcjtcbiAgICBcbiAgICB2YXJ5aW5nIHZlYzIgdlV2O1xuXG4gICAgdm9pZCBtYWluKCkge1xuICAgICAgICBnbF9GcmFnQ29sb3IucmdiID0gdUNvbG9yO1xuICAgICAgICBnbF9GcmFnQ29sb3IuYSA9IDEuMDtcbiAgICB9XG5gO1xuIiwiLy8gVE9ETzogRGVzdHJveSByZW5kZXIgdGFyZ2V0cyBpZiBzaXplIGNoYW5nZWQgYW5kIGV4aXN0c1xuXG5pbXBvcnQgeyBQcm9ncmFtIH0gZnJvbSAnLi4vY29yZS9Qcm9ncmFtLmpzJztcbmltcG9ydCB7IE1lc2ggfSBmcm9tICcuLi9jb3JlL01lc2guanMnO1xuaW1wb3J0IHsgUmVuZGVyVGFyZ2V0IH0gZnJvbSAnLi4vY29yZS9SZW5kZXJUYXJnZXQuanMnO1xuaW1wb3J0IHsgVHJpYW5nbGUgfSBmcm9tICcuL1RyaWFuZ2xlLmpzJztcblxuLy8gTm90ZTogVXNlIEN1c3RvbVBvc3QsIG5vdCB0aGlzLlxuZXhwb3J0IGNsYXNzIFBvc3Qge1xuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICBnbCxcbiAgICAgICAge1xuICAgICAgICAgICAgd2lkdGgsXG4gICAgICAgICAgICBoZWlnaHQsXG4gICAgICAgICAgICBkcHIsXG4gICAgICAgICAgICB3cmFwUyA9IGdsLkNMQU1QX1RPX0VER0UsXG4gICAgICAgICAgICB3cmFwVCA9IGdsLkNMQU1QX1RPX0VER0UsXG4gICAgICAgICAgICBtaW5GaWx0ZXIgPSBnbC5MSU5FQVIsXG4gICAgICAgICAgICBtYWdGaWx0ZXIgPSBnbC5MSU5FQVIsXG4gICAgICAgICAgICBnZW9tZXRyeSA9IG5ldyBUcmlhbmdsZShnbCksXG4gICAgICAgICAgICB0YXJnZXRPbmx5ID0gbnVsbCxcbiAgICAgICAgfSA9IHt9LFxuICAgICAgICBmYm8gPSBudWxsLFxuICAgICkge1xuICAgICAgICB0aGlzLmdsID0gZ2w7XG5cbiAgICAgICAgdGhpcy5vcHRpb25zID0geyB3cmFwUywgd3JhcFQsIG1pbkZpbHRlciwgbWFnRmlsdGVyIH07XG5cbiAgICAgICAgdGhpcy5wYXNzZXMgPSBbXTtcblxuICAgICAgICB0aGlzLmdlb21ldHJ5ID0gZ2VvbWV0cnk7XG5cbiAgICAgICAgdGhpcy51bmlmb3JtID0geyB2YWx1ZTogbnVsbCB9O1xuICAgICAgICB0aGlzLnRhcmdldE9ubHkgPSB0YXJnZXRPbmx5O1xuXG4gICAgICAgIHRoaXMuZmJvID0gZmJvIHx8IHtcbiAgICAgICAgICAgIHJlYWQ6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIHdyaXRlOiB1bmRlZmluZWQsXG4gICAgICAgICAgICBzd2FwOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IHRlbXAgPSB0aGlzLmZiby5yZWFkO1xuICAgICAgICAgICAgICAgIHRoaXMuZmJvLnJlYWQgPSB0aGlzLmZiby53cml0ZTtcbiAgICAgICAgICAgICAgICB0aGlzLmZiby53cml0ZSA9IHRlbXA7XG4gICAgICAgICAgICB9LFxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMucmVzaXplKHsgd2lkdGgsIGhlaWdodCwgZHByIH0pO1xuICAgIH1cblxuICAgIGFkZFBhc3MoeyB2ZXJ0ZXggPSBkZWZhdWx0VmVydGV4LCBmcmFnbWVudCA9IGRlZmF1bHRGcmFnbWVudCwgdW5pZm9ybXMgPSB7fSwgdGV4dHVyZVVuaWZvcm0gPSAndE1hcCcsIGVuYWJsZWQgPSB0cnVlIH0gPSB7fSkge1xuICAgICAgICB1bmlmb3Jtc1t0ZXh0dXJlVW5pZm9ybV0gPSB7IHZhbHVlOiB0aGlzLmZiby5yZWFkLnRleHR1cmUgfTtcblxuICAgICAgICBjb25zdCBwcm9ncmFtID0gbmV3IFByb2dyYW0odGhpcy5nbCwgeyB2ZXJ0ZXgsIGZyYWdtZW50LCB1bmlmb3JtcyB9KTtcbiAgICAgICAgY29uc3QgbWVzaCA9IG5ldyBNZXNoKHRoaXMuZ2wsIHsgZ2VvbWV0cnk6IHRoaXMuZ2VvbWV0cnksIHByb2dyYW0gfSk7XG5cbiAgICAgICAgY29uc3QgcGFzcyA9IHtcbiAgICAgICAgICAgIG1lc2gsXG4gICAgICAgICAgICBwcm9ncmFtLFxuICAgICAgICAgICAgdW5pZm9ybXMsXG4gICAgICAgICAgICBlbmFibGVkLFxuICAgICAgICAgICAgdGV4dHVyZVVuaWZvcm0sXG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5wYXNzZXMucHVzaChwYXNzKTtcbiAgICAgICAgcmV0dXJuIHBhc3M7XG4gICAgfVxuXG4gICAgcmVzaXplKHsgd2lkdGgsIGhlaWdodCwgZHByIH0gPSB7fSkge1xuXG4gICAgICAgIGlmIChkcHIpIHRoaXMuZHByID0gZHByO1xuICAgICAgICBpZiAod2lkdGgpIHtcbiAgICAgICAgICAgIHRoaXMud2lkdGggPSB3aWR0aDtcbiAgICAgICAgICAgIHRoaXMuaGVpZ2h0ID0gaGVpZ2h0IHx8IHdpZHRoO1xuICAgICAgICB9XG5cbiAgICAgICAgZHByID0gdGhpcy5kcHIgfHwgdGhpcy5nbC5yZW5kZXJlci5kcHI7XG4gICAgICAgIHdpZHRoID0gKHRoaXMud2lkdGggfHwgdGhpcy5nbC5yZW5kZXJlci53aWR0aCkgKiBkcHI7XG4gICAgICAgIGhlaWdodCA9ICh0aGlzLmhlaWdodCB8fCB0aGlzLmdsLnJlbmRlcmVyLmhlaWdodCkgKiBkcHI7XG5cbiAgICAgICAgdGhpcy5vcHRpb25zLndpZHRoID0gd2lkdGg7XG4gICAgICAgIHRoaXMub3B0aW9ucy5oZWlnaHQgPSBoZWlnaHQ7XG4gICAgICAgIHRoaXMuZGlzcG9zZUZibygpO1xuICAgICAgICB0aGlzLmluaXRGYm8oKTtcbiAgICB9XG5cbiAgICBkaXNwb3NlRmJvKCkge1xuICAgICAgICB0aGlzLmZiby5yZWFkICYmIHRoaXMuZmJvLnJlYWQuZGlzcG9zZSgpO1xuICAgICAgICB0aGlzLmZiby53cml0ZSAmJiB0aGlzLmZiby53cml0ZS5kaXNwb3NlKCk7XG4gICAgICAgIHRoaXMuZmJvLnJlYWQgPSB1bmRlZmluZWQ7XG4gICAgICAgIHRoaXMuZmJvLndyaXRlID0gdW5kZWZpbmVkO1xuICAgIH1cbiAgICBpbml0RmJvKCkge1xuICAgICAgICB0aGlzLmZiby5yZWFkID0gbmV3IFJlbmRlclRhcmdldCh0aGlzLmdsLCB0aGlzLm9wdGlvbnMpO1xuICAgICAgICB0aGlzLmZiby53cml0ZSA9IG5ldyBSZW5kZXJUYXJnZXQodGhpcy5nbCwgdGhpcy5vcHRpb25zKTtcbiAgICB9XG5cbiAgICAvLyBVc2VzIHNhbWUgYXJndW1lbnRzIGFzIHJlbmRlcmVyLnJlbmRlclxuICAgIHJlbmRlcih7IHNjZW5lLCBjYW1lcmEsIHRhcmdldCA9IG51bGwsIHVwZGF0ZSA9IHRydWUsIHNvcnQgPSB0cnVlLCBmcnVzdHVtQ3VsbCA9IHRydWUgfSkge1xuICAgICAgICBjb25zdCBlbmFibGVkUGFzc2VzID0gdGhpcy5wYXNzZXMuZmlsdGVyKChwYXNzKSA9PiBwYXNzLmVuYWJsZWQpO1xuXG4gICAgICAgIHRoaXMuZ2wucmVuZGVyZXIucmVuZGVyKHtcbiAgICAgICAgICAgIHNjZW5lLFxuICAgICAgICAgICAgY2FtZXJhLFxuICAgICAgICAgICAgdGFyZ2V0OiBlbmFibGVkUGFzc2VzLmxlbmd0aCB8fCAoIXRhcmdldCAmJiB0aGlzLnRhcmdldE9ubHkpID8gdGhpcy5mYm8ud3JpdGUgOiB0YXJnZXQsXG4gICAgICAgICAgICB1cGRhdGUsXG4gICAgICAgICAgICBzb3J0LFxuICAgICAgICAgICAgZnJ1c3R1bUN1bGwsXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmZiby5zd2FwKCk7XG5cbiAgICAgICAgZW5hYmxlZFBhc3Nlcy5mb3JFYWNoKChwYXNzLCBpKSA9PiB7XG4gICAgICAgICAgICBwYXNzLm1lc2gucHJvZ3JhbS51bmlmb3Jtc1twYXNzLnRleHR1cmVVbmlmb3JtXS52YWx1ZSA9IHRoaXMuZmJvLnJlYWQudGV4dHVyZTtcbiAgICAgICAgICAgIHRoaXMuZ2wucmVuZGVyZXIucmVuZGVyKHtcbiAgICAgICAgICAgICAgICBzY2VuZTogcGFzcy5tZXNoLFxuICAgICAgICAgICAgICAgIHRhcmdldDogaSA9PT0gZW5hYmxlZFBhc3Nlcy5sZW5ndGggLSAxICYmICh0YXJnZXQgfHwgIXRoaXMudGFyZ2V0T25seSkgPyB0YXJnZXQgOiB0aGlzLmZiby53cml0ZSxcbiAgICAgICAgICAgICAgICBjbGVhcjogdHJ1ZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy5mYm8uc3dhcCgpO1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLnVuaWZvcm0udmFsdWUgPSB0aGlzLmZiby5yZWFkLnRleHR1cmU7XG4gICAgfVxufVxuXG5jb25zdCBkZWZhdWx0VmVydGV4ID0gLyogZ2xzbCAqLyBgXG4gICAgYXR0cmlidXRlIHZlYzIgdXY7XG4gICAgYXR0cmlidXRlIHZlYzIgcG9zaXRpb247XG5cbiAgICB2YXJ5aW5nIHZlYzIgdlV2O1xuXG4gICAgdm9pZCBtYWluKCkge1xuICAgICAgICB2VXYgPSB1djtcbiAgICAgICAgZ2xfUG9zaXRpb24gPSB2ZWM0KHBvc2l0aW9uLCAwLCAxKTtcbiAgICB9XG5gO1xuXG5jb25zdCBkZWZhdWx0RnJhZ21lbnQgPSAvKiBnbHNsICovIGBcbiAgICBwcmVjaXNpb24gaGlnaHAgZmxvYXQ7XG5cbiAgICB1bmlmb3JtIHNhbXBsZXIyRCB0TWFwO1xuICAgIHZhcnlpbmcgdmVjMiB2VXY7XG5cbiAgICB2b2lkIG1haW4oKSB7XG4gICAgICAgIGdsX0ZyYWdDb2xvciA9IHRleHR1cmUyRCh0TWFwLCB2VXYpO1xuICAgIH1cbmA7XG4iLCIvLyBUT0RPOiBiYXJ5Y2VudHJpYyBjb2RlIHNob3VsZG4ndCBiZSBoZXJlLCBidXQgd2hlcmU/XG4vLyBUT0RPOiBTcGhlcmVDYXN0P1xuXG5pbXBvcnQgeyBWZWMyIH0gZnJvbSAnLi4vbWF0aC9WZWMyLmpzJztcbmltcG9ydCB7IFZlYzMgfSBmcm9tICcuLi9tYXRoL1ZlYzMuanMnO1xuaW1wb3J0IHsgTWF0NCB9IGZyb20gJy4uL21hdGgvTWF0NC5qcyc7XG5cbmNvbnN0IHRlbXBWZWMyYSA9IG5ldyBWZWMyKCk7XG5jb25zdCB0ZW1wVmVjMmIgPSBuZXcgVmVjMigpO1xuY29uc3QgdGVtcFZlYzJjID0gbmV3IFZlYzIoKTtcblxuY29uc3QgdGVtcFZlYzNhID0gbmV3IFZlYzMoKTtcbmNvbnN0IHRlbXBWZWMzYiA9IG5ldyBWZWMzKCk7XG5jb25zdCB0ZW1wVmVjM2MgPSBuZXcgVmVjMygpO1xuY29uc3QgdGVtcFZlYzNkID0gbmV3IFZlYzMoKTtcbmNvbnN0IHRlbXBWZWMzZSA9IG5ldyBWZWMzKCk7XG5jb25zdCB0ZW1wVmVjM2YgPSBuZXcgVmVjMygpO1xuY29uc3QgdGVtcFZlYzNnID0gbmV3IFZlYzMoKTtcbmNvbnN0IHRlbXBWZWMzaCA9IG5ldyBWZWMzKCk7XG5jb25zdCB0ZW1wVmVjM2kgPSBuZXcgVmVjMygpO1xuY29uc3QgdGVtcFZlYzNqID0gbmV3IFZlYzMoKTtcbmNvbnN0IHRlbXBWZWMzayA9IG5ldyBWZWMzKCk7XG5cbmNvbnN0IHRlbXBNYXQ0ID0gbmV3IE1hdDQoKTtcblxuZXhwb3J0IGNsYXNzIFJheWNhc3Qge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLm9yaWdpbiA9IG5ldyBWZWMzKCk7XG4gICAgICAgIHRoaXMuZGlyZWN0aW9uID0gbmV3IFZlYzMoKTtcbiAgICB9XG5cbiAgICAvLyBTZXQgcmF5IGZyb20gbW91c2UgdW5wcm9qZWN0aW9uXG4gICAgY2FzdE1vdXNlKGNhbWVyYSwgbW91c2UgPSBbMCwgMF0pIHtcbiAgICAgICAgaWYgKGNhbWVyYS50eXBlID09PSAnb3J0aG9ncmFwaGljJykge1xuICAgICAgICAgICAgLy8gU2V0IG9yaWdpblxuICAgICAgICAgICAgLy8gU2luY2UgY2FtZXJhIGlzIG9ydGhvZ3JhcGhpYywgb3JpZ2luIGlzIG5vdCB0aGUgY2FtZXJhIHBvc2l0aW9uXG4gICAgICAgICAgICBjb25zdCB7IGxlZnQsIHJpZ2h0LCBib3R0b20sIHRvcCwgem9vbSB9ID0gY2FtZXJhO1xuICAgICAgICAgICAgY29uc3QgeCA9IGxlZnQgLyB6b29tICsgKChyaWdodCAtIGxlZnQpIC8gem9vbSkgKiAobW91c2VbMF0gKiAwLjUgKyAwLjUpO1xuICAgICAgICAgICAgY29uc3QgeSA9IGJvdHRvbSAvIHpvb20gKyAoKHRvcCAtIGJvdHRvbSkgLyB6b29tKSAqIChtb3VzZVsxXSAqIDAuNSArIDAuNSk7XG4gICAgICAgICAgICB0aGlzLm9yaWdpbi5zZXQoeCwgeSwgMCk7XG4gICAgICAgICAgICB0aGlzLm9yaWdpbi5hcHBseU1hdHJpeDQoY2FtZXJhLndvcmxkTWF0cml4KTtcblxuICAgICAgICAgICAgLy8gU2V0IGRpcmVjdGlvblxuICAgICAgICAgICAgLy8gaHR0cHM6Ly9jb21tdW5pdHkua2hyb25vcy5vcmcvdC9nZXQtZGlyZWN0aW9uLWZyb20tdHJhbnNmb3JtYXRpb24tbWF0cml4LW9yLXF1YXQvNjU1MDIvMlxuICAgICAgICAgICAgdGhpcy5kaXJlY3Rpb24ueCA9IC1jYW1lcmEud29ybGRNYXRyaXhbOF07XG4gICAgICAgICAgICB0aGlzLmRpcmVjdGlvbi55ID0gLWNhbWVyYS53b3JsZE1hdHJpeFs5XTtcbiAgICAgICAgICAgIHRoaXMuZGlyZWN0aW9uLnogPSAtY2FtZXJhLndvcmxkTWF0cml4WzEwXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIFNldCBvcmlnaW5cbiAgICAgICAgICAgIGNhbWVyYS53b3JsZE1hdHJpeC5nZXRUcmFuc2xhdGlvbih0aGlzLm9yaWdpbik7XG5cbiAgICAgICAgICAgIC8vIFNldCBkaXJlY3Rpb25cbiAgICAgICAgICAgIHRoaXMuZGlyZWN0aW9uLnNldChtb3VzZVswXSwgbW91c2VbMV0sIDAuNSk7XG4gICAgICAgICAgICBjYW1lcmEudW5wcm9qZWN0KHRoaXMuZGlyZWN0aW9uKTtcbiAgICAgICAgICAgIHRoaXMuZGlyZWN0aW9uLnN1Yih0aGlzLm9yaWdpbikubm9ybWFsaXplKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpbnRlcnNlY3RCb3VuZHMobWVzaGVzLCB7IG1heERpc3RhbmNlLCBvdXRwdXQgPSBbXSB9ID0ge30pIHtcbiAgICAgICAgaWYgKCFBcnJheS5pc0FycmF5KG1lc2hlcykpIG1lc2hlcyA9IFttZXNoZXNdO1xuXG4gICAgICAgIGNvbnN0IGludldvcmxkTWF0NCA9IHRlbXBNYXQ0O1xuICAgICAgICBjb25zdCBvcmlnaW4gPSB0ZW1wVmVjM2E7XG4gICAgICAgIGNvbnN0IGRpcmVjdGlvbiA9IHRlbXBWZWMzYjtcblxuICAgICAgICBjb25zdCBoaXRzID0gb3V0cHV0O1xuICAgICAgICBoaXRzLmxlbmd0aCA9IDA7XG5cbiAgICAgICAgbWVzaGVzLmZvckVhY2goKG1lc2gpID0+IHtcbiAgICAgICAgICAgIC8vIENyZWF0ZSBib3VuZHNcbiAgICAgICAgICAgIGlmICghbWVzaC5nZW9tZXRyeS5ib3VuZHMgfHwgbWVzaC5nZW9tZXRyeS5ib3VuZHMucmFkaXVzID09PSBJbmZpbml0eSkgbWVzaC5nZW9tZXRyeS5jb21wdXRlQm91bmRpbmdTcGhlcmUoKTtcbiAgICAgICAgICAgIGNvbnN0IGJvdW5kcyA9IG1lc2guZ2VvbWV0cnkuYm91bmRzO1xuICAgICAgICAgICAgaW52V29ybGRNYXQ0LmludmVyc2UobWVzaC53b3JsZE1hdHJpeCk7XG5cbiAgICAgICAgICAgIC8vIEdldCBtYXggZGlzdGFuY2UgbG9jYWxseVxuICAgICAgICAgICAgbGV0IGxvY2FsTWF4RGlzdGFuY2U7XG4gICAgICAgICAgICBpZiAobWF4RGlzdGFuY2UpIHtcbiAgICAgICAgICAgICAgICBkaXJlY3Rpb24uY29weSh0aGlzLmRpcmVjdGlvbikuc2NhbGVSb3RhdGVNYXRyaXg0KGludldvcmxkTWF0NCk7XG4gICAgICAgICAgICAgICAgbG9jYWxNYXhEaXN0YW5jZSA9IG1heERpc3RhbmNlICogZGlyZWN0aW9uLmxlbigpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBUYWtlIHdvcmxkIHNwYWNlIHJheSBhbmQgbWFrZSBpdCBvYmplY3Qgc3BhY2UgdG8gYWxpZ24gd2l0aCBib3VuZGluZyBib3hcbiAgICAgICAgICAgIG9yaWdpbi5jb3B5KHRoaXMub3JpZ2luKS5hcHBseU1hdHJpeDQoaW52V29ybGRNYXQ0KTtcbiAgICAgICAgICAgIGRpcmVjdGlvbi5jb3B5KHRoaXMuZGlyZWN0aW9uKS50cmFuc2Zvcm1EaXJlY3Rpb24oaW52V29ybGRNYXQ0KTtcblxuICAgICAgICAgICAgLy8gQnJlYWsgb3V0IGVhcmx5IGlmIGJvdW5kcyB0b28gZmFyIGF3YXkgZnJvbSBvcmlnaW5cbiAgICAgICAgICAgIGlmIChtYXhEaXN0YW5jZSkge1xuICAgICAgICAgICAgICAgIGlmIChvcmlnaW4uZGlzdGFuY2UoYm91bmRzLmNlbnRlcikgLSBib3VuZHMucmFkaXVzID4gbG9jYWxNYXhEaXN0YW5jZSkgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBsZXQgbG9jYWxEaXN0YW5jZSA9IDA7XG5cbiAgICAgICAgICAgIC8vIENoZWNrIG9yaWdpbiBpc24ndCBpbnNpZGUgYm91bmRzIGJlZm9yZSB0ZXN0aW5nIGludGVyc2VjdGlvblxuICAgICAgICAgICAgaWYgKG1lc2guZ2VvbWV0cnkucmF5Y2FzdCA9PT0gJ3NwaGVyZScpIHtcbiAgICAgICAgICAgICAgICBpZiAob3JpZ2luLmRpc3RhbmNlKGJvdW5kcy5jZW50ZXIpID4gYm91bmRzLnJhZGl1cykge1xuICAgICAgICAgICAgICAgICAgICBsb2NhbERpc3RhbmNlID0gdGhpcy5pbnRlcnNlY3RTcGhlcmUoYm91bmRzLCBvcmlnaW4sIGRpcmVjdGlvbik7XG4gICAgICAgICAgICAgICAgICAgIGlmICghbG9jYWxEaXN0YW5jZSkgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgICBvcmlnaW4ueCA8IGJvdW5kcy5taW4ueCB8fFxuICAgICAgICAgICAgICAgICAgICBvcmlnaW4ueCA+IGJvdW5kcy5tYXgueCB8fFxuICAgICAgICAgICAgICAgICAgICBvcmlnaW4ueSA8IGJvdW5kcy5taW4ueSB8fFxuICAgICAgICAgICAgICAgICAgICBvcmlnaW4ueSA+IGJvdW5kcy5tYXgueSB8fFxuICAgICAgICAgICAgICAgICAgICBvcmlnaW4ueiA8IGJvdW5kcy5taW4ueiB8fFxuICAgICAgICAgICAgICAgICAgICBvcmlnaW4ueiA+IGJvdW5kcy5tYXguelxuICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICBsb2NhbERpc3RhbmNlID0gdGhpcy5pbnRlcnNlY3RCb3goYm91bmRzLCBvcmlnaW4sIGRpcmVjdGlvbik7XG4gICAgICAgICAgICAgICAgICAgIGlmICghbG9jYWxEaXN0YW5jZSkgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKG1heERpc3RhbmNlICYmIGxvY2FsRGlzdGFuY2UgPiBsb2NhbE1heERpc3RhbmNlKSByZXR1cm47XG5cbiAgICAgICAgICAgIC8vIENyZWF0ZSBvYmplY3Qgb24gbWVzaCB0byBhdm9pZCBnZW5lcmF0aW5nIGxvdHMgb2Ygb2JqZWN0c1xuICAgICAgICAgICAgaWYgKCFtZXNoLmhpdCkgbWVzaC5oaXQgPSB7IGxvY2FsUG9pbnQ6IG5ldyBWZWMzKCksIHBvaW50OiBuZXcgVmVjMygpIH07XG5cbiAgICAgICAgICAgIG1lc2guaGl0LmxvY2FsUG9pbnQuY29weShkaXJlY3Rpb24pLm11bHRpcGx5KGxvY2FsRGlzdGFuY2UpLmFkZChvcmlnaW4pO1xuICAgICAgICAgICAgbWVzaC5oaXQucG9pbnQuY29weShtZXNoLmhpdC5sb2NhbFBvaW50KS5hcHBseU1hdHJpeDQobWVzaC53b3JsZE1hdHJpeCk7XG4gICAgICAgICAgICBtZXNoLmhpdC5kaXN0YW5jZSA9IG1lc2guaGl0LnBvaW50LmRpc3RhbmNlKHRoaXMub3JpZ2luKTtcblxuICAgICAgICAgICAgaGl0cy5wdXNoKG1lc2gpO1xuICAgICAgICB9KTtcblxuICAgICAgICBoaXRzLnNvcnQoKGEsIGIpID0+IGEuaGl0LmRpc3RhbmNlIC0gYi5oaXQuZGlzdGFuY2UpO1xuICAgICAgICByZXR1cm4gaGl0cztcbiAgICB9XG5cbiAgICBpbnRlcnNlY3RNZXNoZXMobWVzaGVzLCB7IGN1bGxGYWNlID0gdHJ1ZSwgbWF4RGlzdGFuY2UsIGluY2x1ZGVVViA9IHRydWUsIGluY2x1ZGVOb3JtYWwgPSB0cnVlLCBvdXRwdXQgPSBbXSB9ID0ge30pIHtcbiAgICAgICAgLy8gVGVzdCBib3VuZHMgZmlyc3QgYmVmb3JlIHRlc3RpbmcgZ2VvbWV0cnlcbiAgICAgICAgY29uc3QgaGl0cyA9IHRoaXMuaW50ZXJzZWN0Qm91bmRzKG1lc2hlcywgeyBtYXhEaXN0YW5jZSwgb3V0cHV0IH0pO1xuICAgICAgICBpZiAoIWhpdHMubGVuZ3RoKSByZXR1cm4gaGl0cztcblxuICAgICAgICBjb25zdCBpbnZXb3JsZE1hdDQgPSB0ZW1wTWF0NDtcbiAgICAgICAgY29uc3Qgb3JpZ2luID0gdGVtcFZlYzNhO1xuICAgICAgICBjb25zdCBkaXJlY3Rpb24gPSB0ZW1wVmVjM2I7XG4gICAgICAgIGNvbnN0IGEgPSB0ZW1wVmVjM2M7XG4gICAgICAgIGNvbnN0IGIgPSB0ZW1wVmVjM2Q7XG4gICAgICAgIGNvbnN0IGMgPSB0ZW1wVmVjM2U7XG4gICAgICAgIGNvbnN0IGNsb3Nlc3RGYWNlTm9ybWFsID0gdGVtcFZlYzNmO1xuICAgICAgICBjb25zdCBmYWNlTm9ybWFsID0gdGVtcFZlYzNnO1xuICAgICAgICBjb25zdCBiYXJ5Y29vcmQgPSB0ZW1wVmVjM2g7XG4gICAgICAgIGNvbnN0IHV2QSA9IHRlbXBWZWMyYTtcbiAgICAgICAgY29uc3QgdXZCID0gdGVtcFZlYzJiO1xuICAgICAgICBjb25zdCB1dkMgPSB0ZW1wVmVjMmM7XG5cbiAgICAgICAgZm9yIChsZXQgaSA9IGhpdHMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgICAgIGNvbnN0IG1lc2ggPSBoaXRzW2ldO1xuICAgICAgICAgICAgaW52V29ybGRNYXQ0LmludmVyc2UobWVzaC53b3JsZE1hdHJpeCk7XG5cbiAgICAgICAgICAgIC8vIEdldCBtYXggZGlzdGFuY2UgbG9jYWxseVxuICAgICAgICAgICAgbGV0IGxvY2FsTWF4RGlzdGFuY2U7XG4gICAgICAgICAgICBpZiAobWF4RGlzdGFuY2UpIHtcbiAgICAgICAgICAgICAgICBkaXJlY3Rpb24uY29weSh0aGlzLmRpcmVjdGlvbikuc2NhbGVSb3RhdGVNYXRyaXg0KGludldvcmxkTWF0NCk7XG4gICAgICAgICAgICAgICAgbG9jYWxNYXhEaXN0YW5jZSA9IG1heERpc3RhbmNlICogZGlyZWN0aW9uLmxlbigpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBUYWtlIHdvcmxkIHNwYWNlIHJheSBhbmQgbWFrZSBpdCBvYmplY3Qgc3BhY2UgdG8gYWxpZ24gd2l0aCBib3VuZGluZyBib3hcbiAgICAgICAgICAgIG9yaWdpbi5jb3B5KHRoaXMub3JpZ2luKS5hcHBseU1hdHJpeDQoaW52V29ybGRNYXQ0KTtcbiAgICAgICAgICAgIGRpcmVjdGlvbi5jb3B5KHRoaXMuZGlyZWN0aW9uKS50cmFuc2Zvcm1EaXJlY3Rpb24oaW52V29ybGRNYXQ0KTtcblxuICAgICAgICAgICAgbGV0IGxvY2FsRGlzdGFuY2UgPSAwO1xuICAgICAgICAgICAgbGV0IGNsb3Nlc3RBLCBjbG9zZXN0QiwgY2xvc2VzdEM7XG5cbiAgICAgICAgICAgIGNvbnN0IGdlb21ldHJ5ID0gbWVzaC5nZW9tZXRyeTtcbiAgICAgICAgICAgIGNvbnN0IGF0dHJpYnV0ZXMgPSBnZW9tZXRyeS5hdHRyaWJ1dGVzO1xuICAgICAgICAgICAgY29uc3QgaW5kZXggPSBhdHRyaWJ1dGVzLmluZGV4O1xuXG4gICAgICAgICAgICBjb25zdCBzdGFydCA9IE1hdGgubWF4KDAsIGdlb21ldHJ5LmRyYXdSYW5nZS5zdGFydCk7XG4gICAgICAgICAgICBjb25zdCBlbmQgPSBNYXRoLm1pbihpbmRleCA/IGluZGV4LmNvdW50IDogYXR0cmlidXRlcy5wb3NpdGlvbi5jb3VudCwgZ2VvbWV0cnkuZHJhd1JhbmdlLnN0YXJ0ICsgZ2VvbWV0cnkuZHJhd1JhbmdlLmNvdW50KTtcblxuICAgICAgICAgICAgZm9yIChsZXQgaiA9IHN0YXJ0OyBqIDwgZW5kOyBqICs9IDMpIHtcbiAgICAgICAgICAgICAgICAvLyBQb3NpdGlvbiBhdHRyaWJ1dGUgaW5kaWNlcyBmb3IgZWFjaCB0cmlhbmdsZVxuICAgICAgICAgICAgICAgIGNvbnN0IGFpID0gaW5kZXggPyBpbmRleC5kYXRhW2pdIDogajtcbiAgICAgICAgICAgICAgICBjb25zdCBiaSA9IGluZGV4ID8gaW5kZXguZGF0YVtqICsgMV0gOiBqICsgMTtcbiAgICAgICAgICAgICAgICBjb25zdCBjaSA9IGluZGV4ID8gaW5kZXguZGF0YVtqICsgMl0gOiBqICsgMjtcblxuICAgICAgICAgICAgICAgIGEuZnJvbUFycmF5KGF0dHJpYnV0ZXMucG9zaXRpb24uZGF0YSwgYWkgKiAzKTtcbiAgICAgICAgICAgICAgICBiLmZyb21BcnJheShhdHRyaWJ1dGVzLnBvc2l0aW9uLmRhdGEsIGJpICogMyk7XG4gICAgICAgICAgICAgICAgYy5mcm9tQXJyYXkoYXR0cmlidXRlcy5wb3NpdGlvbi5kYXRhLCBjaSAqIDMpO1xuXG4gICAgICAgICAgICAgICAgY29uc3QgZGlzdGFuY2UgPSB0aGlzLmludGVyc2VjdFRyaWFuZ2xlKGEsIGIsIGMsIGN1bGxGYWNlLCBvcmlnaW4sIGRpcmVjdGlvbiwgZmFjZU5vcm1hbCk7XG4gICAgICAgICAgICAgICAgaWYgKCFkaXN0YW5jZSkgY29udGludWU7XG5cbiAgICAgICAgICAgICAgICAvLyBUb28gZmFyIGF3YXlcbiAgICAgICAgICAgICAgICBpZiAobWF4RGlzdGFuY2UgJiYgZGlzdGFuY2UgPiBsb2NhbE1heERpc3RhbmNlKSBjb250aW51ZTtcblxuICAgICAgICAgICAgICAgIGlmICghbG9jYWxEaXN0YW5jZSB8fCBkaXN0YW5jZSA8IGxvY2FsRGlzdGFuY2UpIHtcbiAgICAgICAgICAgICAgICAgICAgbG9jYWxEaXN0YW5jZSA9IGRpc3RhbmNlO1xuICAgICAgICAgICAgICAgICAgICBjbG9zZXN0QSA9IGFpO1xuICAgICAgICAgICAgICAgICAgICBjbG9zZXN0QiA9IGJpO1xuICAgICAgICAgICAgICAgICAgICBjbG9zZXN0QyA9IGNpO1xuICAgICAgICAgICAgICAgICAgICBjbG9zZXN0RmFjZU5vcm1hbC5jb3B5KGZhY2VOb3JtYWwpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCFsb2NhbERpc3RhbmNlKSBoaXRzLnNwbGljZShpLCAxKTtcblxuICAgICAgICAgICAgLy8gVXBkYXRlIGhpdCB2YWx1ZXMgZnJvbSBib3VuZHMtdGVzdFxuICAgICAgICAgICAgbWVzaC5oaXQubG9jYWxQb2ludC5jb3B5KGRpcmVjdGlvbikubXVsdGlwbHkobG9jYWxEaXN0YW5jZSkuYWRkKG9yaWdpbik7XG4gICAgICAgICAgICBtZXNoLmhpdC5wb2ludC5jb3B5KG1lc2guaGl0LmxvY2FsUG9pbnQpLmFwcGx5TWF0cml4NChtZXNoLndvcmxkTWF0cml4KTtcbiAgICAgICAgICAgIG1lc2guaGl0LmRpc3RhbmNlID0gbWVzaC5oaXQucG9pbnQuZGlzdGFuY2UodGhpcy5vcmlnaW4pO1xuXG4gICAgICAgICAgICAvLyBBZGQgdW5pcXVlIGhpdCBvYmplY3RzIG9uIG1lc2ggdG8gYXZvaWQgZ2VuZXJhdGluZyBsb3RzIG9mIG9iamVjdHNcbiAgICAgICAgICAgIGlmICghbWVzaC5oaXQuZmFjZU5vcm1hbCkge1xuICAgICAgICAgICAgICAgIG1lc2guaGl0LmxvY2FsRmFjZU5vcm1hbCA9IG5ldyBWZWMzKCk7XG4gICAgICAgICAgICAgICAgbWVzaC5oaXQuZmFjZU5vcm1hbCA9IG5ldyBWZWMzKCk7XG4gICAgICAgICAgICAgICAgbWVzaC5oaXQudXYgPSBuZXcgVmVjMigpO1xuICAgICAgICAgICAgICAgIG1lc2guaGl0LmxvY2FsTm9ybWFsID0gbmV3IFZlYzMoKTtcbiAgICAgICAgICAgICAgICBtZXNoLmhpdC5ub3JtYWwgPSBuZXcgVmVjMygpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBBZGQgZmFjZSBub3JtYWwgZGF0YSB3aGljaCBpcyBhbHJlYWR5IGNvbXB1dGVkXG4gICAgICAgICAgICBtZXNoLmhpdC5sb2NhbEZhY2VOb3JtYWwuY29weShjbG9zZXN0RmFjZU5vcm1hbCk7XG4gICAgICAgICAgICBtZXNoLmhpdC5mYWNlTm9ybWFsLmNvcHkobWVzaC5oaXQubG9jYWxGYWNlTm9ybWFsKS50cmFuc2Zvcm1EaXJlY3Rpb24obWVzaC53b3JsZE1hdHJpeCk7XG5cbiAgICAgICAgICAgIC8vIE9wdGlvbmFsIGRhdGEsIG9wdCBvdXQgdG8gb3B0aW1pc2UgYSBiaXQgaWYgbmVjZXNzYXJ5XG4gICAgICAgICAgICBpZiAoaW5jbHVkZVVWIHx8IGluY2x1ZGVOb3JtYWwpIHtcbiAgICAgICAgICAgICAgICAvLyBDYWxjdWxhdGUgYmFyeWNvb3JkcyB0byBmaW5kIHV2IHZhbHVlcyBhdCBoaXQgcG9pbnRcbiAgICAgICAgICAgICAgICBhLmZyb21BcnJheShhdHRyaWJ1dGVzLnBvc2l0aW9uLmRhdGEsIGNsb3Nlc3RBICogMyk7XG4gICAgICAgICAgICAgICAgYi5mcm9tQXJyYXkoYXR0cmlidXRlcy5wb3NpdGlvbi5kYXRhLCBjbG9zZXN0QiAqIDMpO1xuICAgICAgICAgICAgICAgIGMuZnJvbUFycmF5KGF0dHJpYnV0ZXMucG9zaXRpb24uZGF0YSwgY2xvc2VzdEMgKiAzKTtcbiAgICAgICAgICAgICAgICB0aGlzLmdldEJhcnljb29yZChtZXNoLmhpdC5sb2NhbFBvaW50LCBhLCBiLCBjLCBiYXJ5Y29vcmQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoaW5jbHVkZVVWICYmIGF0dHJpYnV0ZXMudXYpIHtcbiAgICAgICAgICAgICAgICB1dkEuZnJvbUFycmF5KGF0dHJpYnV0ZXMudXYuZGF0YSwgY2xvc2VzdEEgKiAyKTtcbiAgICAgICAgICAgICAgICB1dkIuZnJvbUFycmF5KGF0dHJpYnV0ZXMudXYuZGF0YSwgY2xvc2VzdEIgKiAyKTtcbiAgICAgICAgICAgICAgICB1dkMuZnJvbUFycmF5KGF0dHJpYnV0ZXMudXYuZGF0YSwgY2xvc2VzdEMgKiAyKTtcbiAgICAgICAgICAgICAgICBtZXNoLmhpdC51di5zZXQoXG4gICAgICAgICAgICAgICAgICAgIHV2QS54ICogYmFyeWNvb3JkLnggKyB1dkIueCAqIGJhcnljb29yZC55ICsgdXZDLnggKiBiYXJ5Y29vcmQueixcbiAgICAgICAgICAgICAgICAgICAgdXZBLnkgKiBiYXJ5Y29vcmQueCArIHV2Qi55ICogYmFyeWNvb3JkLnkgKyB1dkMueSAqIGJhcnljb29yZC56XG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGluY2x1ZGVOb3JtYWwgJiYgYXR0cmlidXRlcy5ub3JtYWwpIHtcbiAgICAgICAgICAgICAgICBhLmZyb21BcnJheShhdHRyaWJ1dGVzLm5vcm1hbC5kYXRhLCBjbG9zZXN0QSAqIDMpO1xuICAgICAgICAgICAgICAgIGIuZnJvbUFycmF5KGF0dHJpYnV0ZXMubm9ybWFsLmRhdGEsIGNsb3Nlc3RCICogMyk7XG4gICAgICAgICAgICAgICAgYy5mcm9tQXJyYXkoYXR0cmlidXRlcy5ub3JtYWwuZGF0YSwgY2xvc2VzdEMgKiAzKTtcbiAgICAgICAgICAgICAgICBtZXNoLmhpdC5sb2NhbE5vcm1hbC5zZXQoXG4gICAgICAgICAgICAgICAgICAgIGEueCAqIGJhcnljb29yZC54ICsgYi54ICogYmFyeWNvb3JkLnkgKyBjLnggKiBiYXJ5Y29vcmQueixcbiAgICAgICAgICAgICAgICAgICAgYS55ICogYmFyeWNvb3JkLnggKyBiLnkgKiBiYXJ5Y29vcmQueSArIGMueSAqIGJhcnljb29yZC56LFxuICAgICAgICAgICAgICAgICAgICBhLnogKiBiYXJ5Y29vcmQueCArIGIueiAqIGJhcnljb29yZC55ICsgYy56ICogYmFyeWNvb3JkLnpcbiAgICAgICAgICAgICAgICApO1xuXG4gICAgICAgICAgICAgICAgbWVzaC5oaXQubm9ybWFsLmNvcHkobWVzaC5oaXQubG9jYWxOb3JtYWwpLnRyYW5zZm9ybURpcmVjdGlvbihtZXNoLndvcmxkTWF0cml4KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGhpdHMuc29ydCgoYSwgYikgPT4gYS5oaXQuZGlzdGFuY2UgLSBiLmhpdC5kaXN0YW5jZSk7XG4gICAgICAgIHJldHVybiBoaXRzO1xuICAgIH1cblxuICAgIGludGVyc2VjdFNwaGVyZShzcGhlcmUsIG9yaWdpbiA9IHRoaXMub3JpZ2luLCBkaXJlY3Rpb24gPSB0aGlzLmRpcmVjdGlvbikge1xuICAgICAgICBjb25zdCByYXkgPSB0ZW1wVmVjM2M7XG4gICAgICAgIHJheS5zdWIoc3BoZXJlLmNlbnRlciwgb3JpZ2luKTtcbiAgICAgICAgY29uc3QgdGNhID0gcmF5LmRvdChkaXJlY3Rpb24pO1xuICAgICAgICBjb25zdCBkMiA9IHJheS5kb3QocmF5KSAtIHRjYSAqIHRjYTtcbiAgICAgICAgY29uc3QgcmFkaXVzMiA9IHNwaGVyZS5yYWRpdXMgKiBzcGhlcmUucmFkaXVzO1xuICAgICAgICBpZiAoZDIgPiByYWRpdXMyKSByZXR1cm4gMDtcbiAgICAgICAgY29uc3QgdGhjID0gTWF0aC5zcXJ0KHJhZGl1czIgLSBkMik7XG4gICAgICAgIGNvbnN0IHQwID0gdGNhIC0gdGhjO1xuICAgICAgICBjb25zdCB0MSA9IHRjYSArIHRoYztcbiAgICAgICAgaWYgKHQwIDwgMCAmJiB0MSA8IDApIHJldHVybiAwO1xuICAgICAgICBpZiAodDAgPCAwKSByZXR1cm4gdDE7XG4gICAgICAgIHJldHVybiB0MDtcbiAgICB9XG5cbiAgICAvLyBSYXkgQUFCQiAtIFJheSBBeGlzIGFsaWduZWQgYm91bmRpbmcgYm94IHRlc3RpbmdcbiAgICBpbnRlcnNlY3RCb3goYm94LCBvcmlnaW4gPSB0aGlzLm9yaWdpbiwgZGlyZWN0aW9uID0gdGhpcy5kaXJlY3Rpb24pIHtcbiAgICAgICAgbGV0IHRtaW4sIHRtYXgsIHRZbWluLCB0WW1heCwgdFptaW4sIHRabWF4O1xuICAgICAgICBjb25zdCBpbnZkaXJ4ID0gMSAvIGRpcmVjdGlvbi54O1xuICAgICAgICBjb25zdCBpbnZkaXJ5ID0gMSAvIGRpcmVjdGlvbi55O1xuICAgICAgICBjb25zdCBpbnZkaXJ6ID0gMSAvIGRpcmVjdGlvbi56O1xuICAgICAgICBjb25zdCBtaW4gPSBib3gubWluO1xuICAgICAgICBjb25zdCBtYXggPSBib3gubWF4O1xuICAgICAgICB0bWluID0gKChpbnZkaXJ4ID49IDAgPyBtaW4ueCA6IG1heC54KSAtIG9yaWdpbi54KSAqIGludmRpcng7XG4gICAgICAgIHRtYXggPSAoKGludmRpcnggPj0gMCA/IG1heC54IDogbWluLngpIC0gb3JpZ2luLngpICogaW52ZGlyeDtcbiAgICAgICAgdFltaW4gPSAoKGludmRpcnkgPj0gMCA/IG1pbi55IDogbWF4LnkpIC0gb3JpZ2luLnkpICogaW52ZGlyeTtcbiAgICAgICAgdFltYXggPSAoKGludmRpcnkgPj0gMCA/IG1heC55IDogbWluLnkpIC0gb3JpZ2luLnkpICogaW52ZGlyeTtcbiAgICAgICAgaWYgKHRtaW4gPiB0WW1heCB8fCB0WW1pbiA+IHRtYXgpIHJldHVybiAwO1xuICAgICAgICBpZiAodFltaW4gPiB0bWluKSB0bWluID0gdFltaW47XG4gICAgICAgIGlmICh0WW1heCA8IHRtYXgpIHRtYXggPSB0WW1heDtcbiAgICAgICAgdFptaW4gPSAoKGludmRpcnogPj0gMCA/IG1pbi56IDogbWF4LnopIC0gb3JpZ2luLnopICogaW52ZGlyejtcbiAgICAgICAgdFptYXggPSAoKGludmRpcnogPj0gMCA/IG1heC56IDogbWluLnopIC0gb3JpZ2luLnopICogaW52ZGlyejtcbiAgICAgICAgaWYgKHRtaW4gPiB0Wm1heCB8fCB0Wm1pbiA+IHRtYXgpIHJldHVybiAwO1xuICAgICAgICBpZiAodFptaW4gPiB0bWluKSB0bWluID0gdFptaW47XG4gICAgICAgIGlmICh0Wm1heCA8IHRtYXgpIHRtYXggPSB0Wm1heDtcbiAgICAgICAgaWYgKHRtYXggPCAwKSByZXR1cm4gMDtcbiAgICAgICAgcmV0dXJuIHRtaW4gPj0gMCA/IHRtaW4gOiB0bWF4O1xuICAgIH1cblxuICAgIGludGVyc2VjdFRyaWFuZ2xlKGEsIGIsIGMsIGJhY2tmYWNlQ3VsbGluZyA9IHRydWUsIG9yaWdpbiA9IHRoaXMub3JpZ2luLCBkaXJlY3Rpb24gPSB0aGlzLmRpcmVjdGlvbiwgbm9ybWFsID0gdGVtcFZlYzNnKSB7XG4gICAgICAgIC8vIGZyb20gaHR0cHM6Ly9naXRodWIuY29tL21yZG9vYi90aHJlZS5qcy9ibG9iL21hc3Rlci9zcmMvbWF0aC9SYXkuanNcbiAgICAgICAgLy8gd2hpY2ggaXMgZnJvbSBodHRwOi8vd3d3Lmdlb21ldHJpY3Rvb2xzLmNvbS9HVEVuZ2luZS9JbmNsdWRlL01hdGhlbWF0aWNzL0d0ZUludHJSYXkzVHJpYW5nbGUzLmhcbiAgICAgICAgY29uc3QgZWRnZTEgPSB0ZW1wVmVjM2g7XG4gICAgICAgIGNvbnN0IGVkZ2UyID0gdGVtcFZlYzNpO1xuICAgICAgICBjb25zdCBkaWZmID0gdGVtcFZlYzNqO1xuICAgICAgICBlZGdlMS5zdWIoYiwgYSk7XG4gICAgICAgIGVkZ2UyLnN1YihjLCBhKTtcbiAgICAgICAgbm9ybWFsLmNyb3NzKGVkZ2UxLCBlZGdlMik7XG4gICAgICAgIGxldCBEZE4gPSBkaXJlY3Rpb24uZG90KG5vcm1hbCk7XG4gICAgICAgIGlmICghRGROKSByZXR1cm4gMDtcbiAgICAgICAgbGV0IHNpZ247XG4gICAgICAgIGlmIChEZE4gPiAwKSB7XG4gICAgICAgICAgICBpZiAoYmFja2ZhY2VDdWxsaW5nKSByZXR1cm4gMDtcbiAgICAgICAgICAgIHNpZ24gPSAxO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc2lnbiA9IC0xO1xuICAgICAgICAgICAgRGROID0gLURkTjtcbiAgICAgICAgfVxuICAgICAgICBkaWZmLnN1YihvcmlnaW4sIGEpO1xuICAgICAgICBsZXQgRGRReEUyID0gc2lnbiAqIGRpcmVjdGlvbi5kb3QoZWRnZTIuY3Jvc3MoZGlmZiwgZWRnZTIpKTtcbiAgICAgICAgaWYgKERkUXhFMiA8IDApIHJldHVybiAwO1xuICAgICAgICBsZXQgRGRFMXhRID0gc2lnbiAqIGRpcmVjdGlvbi5kb3QoZWRnZTEuY3Jvc3MoZGlmZikpO1xuICAgICAgICBpZiAoRGRFMXhRIDwgMCkgcmV0dXJuIDA7XG4gICAgICAgIGlmIChEZFF4RTIgKyBEZEUxeFEgPiBEZE4pIHJldHVybiAwO1xuICAgICAgICBsZXQgUWROID0gLXNpZ24gKiBkaWZmLmRvdChub3JtYWwpO1xuICAgICAgICBpZiAoUWROIDwgMCkgcmV0dXJuIDA7XG4gICAgICAgIHJldHVybiBRZE4gLyBEZE47XG4gICAgfVxuXG4gICAgZ2V0QmFyeWNvb3JkKHBvaW50LCBhLCBiLCBjLCB0YXJnZXQgPSB0ZW1wVmVjM2gpIHtcbiAgICAgICAgLy8gRnJvbSBodHRwczovL2dpdGh1Yi5jb20vbXJkb29iL3RocmVlLmpzL2Jsb2IvbWFzdGVyL3NyYy9tYXRoL1RyaWFuZ2xlLmpzXG4gICAgICAgIC8vIHN0YXRpYy9pbnN0YW5jZSBtZXRob2QgdG8gY2FsY3VsYXRlIGJhcnljZW50cmljIGNvb3JkaW5hdGVzXG4gICAgICAgIC8vIGJhc2VkIG9uOiBodHRwOi8vd3d3LmJsYWNrcGF3bi5jb20vdGV4dHMvcG9pbnRpbnBvbHkvZGVmYXVsdC5odG1sXG4gICAgICAgIGNvbnN0IHYwID0gdGVtcFZlYzNpO1xuICAgICAgICBjb25zdCB2MSA9IHRlbXBWZWMzajtcbiAgICAgICAgY29uc3QgdjIgPSB0ZW1wVmVjM2s7XG4gICAgICAgIHYwLnN1YihjLCBhKTtcbiAgICAgICAgdjEuc3ViKGIsIGEpO1xuICAgICAgICB2Mi5zdWIocG9pbnQsIGEpO1xuICAgICAgICBjb25zdCBkb3QwMCA9IHYwLmRvdCh2MCk7XG4gICAgICAgIGNvbnN0IGRvdDAxID0gdjAuZG90KHYxKTtcbiAgICAgICAgY29uc3QgZG90MDIgPSB2MC5kb3QodjIpO1xuICAgICAgICBjb25zdCBkb3QxMSA9IHYxLmRvdCh2MSk7XG4gICAgICAgIGNvbnN0IGRvdDEyID0gdjEuZG90KHYyKTtcbiAgICAgICAgY29uc3QgZGVub20gPSBkb3QwMCAqIGRvdDExIC0gZG90MDEgKiBkb3QwMTtcbiAgICAgICAgaWYgKGRlbm9tID09PSAwKSByZXR1cm4gdGFyZ2V0LnNldCgtMiwgLTEsIC0xKTtcbiAgICAgICAgY29uc3QgaW52RGVub20gPSAxIC8gZGVub207XG4gICAgICAgIGNvbnN0IHUgPSAoZG90MTEgKiBkb3QwMiAtIGRvdDAxICogZG90MTIpICogaW52RGVub207XG4gICAgICAgIGNvbnN0IHYgPSAoZG90MDAgKiBkb3QxMiAtIGRvdDAxICogZG90MDIpICogaW52RGVub207XG4gICAgICAgIHJldHVybiB0YXJnZXQuc2V0KDEgLSB1IC0gdiwgdiwgdSk7XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgQ2FtZXJhIH0gZnJvbSAnLi4vY29yZS9DYW1lcmEuanMnO1xuaW1wb3J0IHsgUHJvZ3JhbSB9IGZyb20gJy4uL2NvcmUvUHJvZ3JhbS5qcyc7XG5pbXBvcnQgeyBSZW5kZXJUYXJnZXQgfSBmcm9tICcuLi9jb3JlL1JlbmRlclRhcmdldC5qcyc7XG5cbmV4cG9ydCBjbGFzcyBTaGFkb3cge1xuICAgIGNvbnN0cnVjdG9yKGdsLCB7IGxpZ2h0ID0gbmV3IENhbWVyYShnbCksIHdpZHRoID0gMTAyNCwgaGVpZ2h0ID0gd2lkdGggfSkge1xuICAgICAgICB0aGlzLmdsID0gZ2w7XG5cbiAgICAgICAgdGhpcy5saWdodCA9IGxpZ2h0O1xuXG4gICAgICAgIHRoaXMudGFyZ2V0ID0gbmV3IFJlbmRlclRhcmdldChnbCwgeyB3aWR0aCwgaGVpZ2h0IH0pO1xuXG4gICAgICAgIHRoaXMuZGVwdGhQcm9ncmFtID0gbmV3IFByb2dyYW0oZ2wsIHtcbiAgICAgICAgICAgIHZlcnRleDogZGVmYXVsdFZlcnRleCxcbiAgICAgICAgICAgIGZyYWdtZW50OiBkZWZhdWx0RnJhZ21lbnQsXG4gICAgICAgICAgICBjdWxsRmFjZTogbnVsbCxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5jYXN0TWVzaGVzID0gW107XG4gICAgfVxuXG4gICAgYWRkKHtcbiAgICAgICAgbWVzaCxcbiAgICAgICAgcmVjZWl2ZSA9IHRydWUsXG4gICAgICAgIGNhc3QgPSB0cnVlLFxuICAgICAgICB2ZXJ0ZXggPSBkZWZhdWx0VmVydGV4LFxuICAgICAgICBmcmFnbWVudCA9IGRlZmF1bHRGcmFnbWVudCxcbiAgICAgICAgdW5pZm9ybVByb2plY3Rpb24gPSAnc2hhZG93UHJvamVjdGlvbk1hdHJpeCcsXG4gICAgICAgIHVuaWZvcm1WaWV3ID0gJ3NoYWRvd1ZpZXdNYXRyaXgnLFxuICAgICAgICB1bmlmb3JtVGV4dHVyZSA9ICd0U2hhZG93JyxcbiAgICB9KSB7XG4gICAgICAgIC8vIEFkZCB1bmlmb3JtcyB0byBleGlzdGluZyBwcm9ncmFtXG4gICAgICAgIGlmIChyZWNlaXZlICYmICFtZXNoLnByb2dyYW0udW5pZm9ybXNbdW5pZm9ybVByb2plY3Rpb25dKSB7XG4gICAgICAgICAgICBtZXNoLnByb2dyYW0udW5pZm9ybXNbdW5pZm9ybVByb2plY3Rpb25dID0geyB2YWx1ZTogdGhpcy5saWdodC5wcm9qZWN0aW9uTWF0cml4IH07XG4gICAgICAgICAgICBtZXNoLnByb2dyYW0udW5pZm9ybXNbdW5pZm9ybVZpZXddID0geyB2YWx1ZTogdGhpcy5saWdodC52aWV3TWF0cml4IH07XG4gICAgICAgICAgICBtZXNoLnByb2dyYW0udW5pZm9ybXNbdW5pZm9ybVRleHR1cmVdID0geyB2YWx1ZTogdGhpcy50YXJnZXQudGV4dHVyZSB9O1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFjYXN0KSByZXR1cm47XG4gICAgICAgIHRoaXMuY2FzdE1lc2hlcy5wdXNoKG1lc2gpO1xuXG4gICAgICAgIC8vIFN0b3JlIHByb2dyYW0gZm9yIHdoZW4gc3dpdGNoaW5nIGJldHdlZW4gZGVwdGggb3ZlcnJpZGVcbiAgICAgICAgbWVzaC5jb2xvclByb2dyYW0gPSBtZXNoLnByb2dyYW07XG5cbiAgICAgICAgLy8gQ2hlY2sgaWYgZGVwdGggcHJvZ3JhbSBhbHJlYWR5IGF0dGFjaGVkXG4gICAgICAgIGlmIChtZXNoLmRlcHRoUHJvZ3JhbSkgcmV0dXJuO1xuXG4gICAgICAgIC8vIFVzZSBnbG9iYWwgZGVwdGggb3ZlcnJpZGUgaWYgbm90aGluZyBjdXN0b20gcGFzc2VkIGluXG4gICAgICAgIGlmICh2ZXJ0ZXggPT09IGRlZmF1bHRWZXJ0ZXggJiYgZnJhZ21lbnQgPT09IGRlZmF1bHRGcmFnbWVudCkge1xuICAgICAgICAgICAgbWVzaC5kZXB0aFByb2dyYW0gPSB0aGlzLmRlcHRoUHJvZ3JhbTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENyZWF0ZSBjdXN0b20gb3ZlcnJpZGUgcHJvZ3JhbVxuICAgICAgICBtZXNoLmRlcHRoUHJvZ3JhbSA9IG5ldyBQcm9ncmFtKHRoaXMuZ2wsIHtcbiAgICAgICAgICAgIHZlcnRleCxcbiAgICAgICAgICAgIGZyYWdtZW50LFxuICAgICAgICAgICAgY3VsbEZhY2U6IG51bGwsXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHJlbmRlcih7IHNjZW5lIH0pIHtcbiAgICAgICAgLy8gRm9yIGRlcHRoIHJlbmRlciwgcmVwbGFjZSBwcm9ncmFtIHdpdGggZGVwdGggb3ZlcnJpZGUuXG4gICAgICAgIC8vIEhpZGUgbWVzaGVzIG5vdCBjYXN0aW5nIHNoYWRvd3MuXG4gICAgICAgIHNjZW5lLnRyYXZlcnNlKChub2RlKSA9PiB7XG4gICAgICAgICAgICBpZiAoIW5vZGUuZHJhdykgcmV0dXJuO1xuICAgICAgICAgICAgaWYgKCEhfnRoaXMuY2FzdE1lc2hlcy5pbmRleE9mKG5vZGUpKSB7XG4gICAgICAgICAgICAgICAgbm9kZS5wcm9ncmFtID0gbm9kZS5kZXB0aFByb2dyYW07XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG5vZGUuaXNGb3JjZVZpc2liaWxpdHkgPSBub2RlLnZpc2libGU7XG4gICAgICAgICAgICAgICAgbm9kZS52aXNpYmxlID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIFJlbmRlciB0aGUgZGVwdGggc2hhZG93IG1hcCB1c2luZyB0aGUgbGlnaHQgYXMgdGhlIGNhbWVyYVxuICAgICAgICB0aGlzLmdsLnJlbmRlcmVyLnJlbmRlcih7XG4gICAgICAgICAgICBzY2VuZSxcbiAgICAgICAgICAgIGNhbWVyYTogdGhpcy5saWdodCxcbiAgICAgICAgICAgIHRhcmdldDogdGhpcy50YXJnZXQsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIFRoZW4gc3dpdGNoIHRoZSBwcm9ncmFtIGJhY2sgdG8gdGhlIG5vcm1hbCBvbmVcbiAgICAgICAgc2NlbmUudHJhdmVyc2UoKG5vZGUpID0+IHtcbiAgICAgICAgICAgIGlmICghbm9kZS5kcmF3KSByZXR1cm47XG4gICAgICAgICAgICBpZiAoISF+dGhpcy5jYXN0TWVzaGVzLmluZGV4T2Yobm9kZSkpIHtcbiAgICAgICAgICAgICAgICBub2RlLnByb2dyYW0gPSBub2RlLmNvbG9yUHJvZ3JhbTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbm9kZS52aXNpYmxlID0gbm9kZS5pc0ZvcmNlVmlzaWJpbGl0eTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxufVxuXG5jb25zdCBkZWZhdWx0VmVydGV4ID0gLyogZ2xzbCAqLyBgXG4gICAgYXR0cmlidXRlIHZlYzMgcG9zaXRpb247XG4gICAgYXR0cmlidXRlIHZlYzIgdXY7XG5cbiAgICB1bmlmb3JtIG1hdDQgbW9kZWxWaWV3TWF0cml4O1xuICAgIHVuaWZvcm0gbWF0NCBwcm9qZWN0aW9uTWF0cml4O1xuXG4gICAgdm9pZCBtYWluKCkge1xuICAgICAgICBnbF9Qb3NpdGlvbiA9IHByb2plY3Rpb25NYXRyaXggKiBtb2RlbFZpZXdNYXRyaXggKiB2ZWM0KHBvc2l0aW9uLCAxLjApO1xuICAgIH1cbmA7XG5cbmNvbnN0IGRlZmF1bHRGcmFnbWVudCA9IC8qIGdsc2wgKi8gYFxuICAgIHByZWNpc2lvbiBoaWdocCBmbG9hdDtcblxuICAgIHZlYzQgcGFja1JHQkEgKGZsb2F0IHYpIHtcbiAgICAgICAgdmVjNCBwYWNrID0gZnJhY3QodmVjNCgxLjAsIDI1NS4wLCA2NTAyNS4wLCAxNjU4MTM3NS4wKSAqIHYpO1xuICAgICAgICBwYWNrIC09IHBhY2sueXp3dyAqIHZlYzIoMS4wIC8gMjU1LjAsIDAuMCkueHh4eTtcbiAgICAgICAgcmV0dXJuIHBhY2s7XG4gICAgfVxuXG4gICAgdm9pZCBtYWluKCkge1xuICAgICAgICBnbF9GcmFnQ29sb3IgPSBwYWNrUkdCQShnbF9GcmFnQ29vcmQueik7XG4gICAgfVxuYDtcbiIsImltcG9ydCB7IE1lc2ggfSBmcm9tICcuLi9jb3JlL01lc2guanMnO1xuaW1wb3J0IHsgVHJhbnNmb3JtIH0gZnJvbSAnLi4vY29yZS9UcmFuc2Zvcm0uanMnO1xuaW1wb3J0IHsgTWF0NCB9IGZyb20gJy4uL21hdGgvTWF0NC5qcyc7XG5pbXBvcnQgeyBUZXh0dXJlIH0gZnJvbSAnLi4vY29yZS9UZXh0dXJlLmpzJztcbmltcG9ydCB7IEFuaW1hdGlvbiB9IGZyb20gJy4vQW5pbWF0aW9uLmpzJztcblxuY29uc3QgdGVtcE1hdDQgPSBuZXcgTWF0NCgpO1xuXG5leHBvcnQgY2xhc3MgU2tpbiBleHRlbmRzIE1lc2gge1xuICAgIGNvbnN0cnVjdG9yKGdsLCB7IHJpZywgZ2VvbWV0cnksIHByb2dyYW0sIG1vZGUgPSBnbC5UUklBTkdMRVMgfSA9IHt9KSB7XG4gICAgICAgIHN1cGVyKGdsLCB7IGdlb21ldHJ5LCBwcm9ncmFtLCBtb2RlIH0pO1xuXG4gICAgICAgIHRoaXMuY3JlYXRlQm9uZXMocmlnKTtcbiAgICAgICAgdGhpcy5jcmVhdGVCb25lVGV4dHVyZSgpO1xuICAgICAgICB0aGlzLmFuaW1hdGlvbnMgPSBbXTtcblxuICAgICAgICBPYmplY3QuYXNzaWduKHRoaXMucHJvZ3JhbS51bmlmb3Jtcywge1xuICAgICAgICAgICAgYm9uZVRleHR1cmU6IHsgdmFsdWU6IHRoaXMuYm9uZVRleHR1cmUgfSxcbiAgICAgICAgICAgIGJvbmVUZXh0dXJlU2l6ZTogeyB2YWx1ZTogdGhpcy5ib25lVGV4dHVyZVNpemUgfSxcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgY3JlYXRlQm9uZXMocmlnKSB7XG4gICAgICAgIC8vIENyZWF0ZSByb290IHNvIHRoYXQgY2FuIHNpbXBseSB1cGRhdGUgd29ybGQgbWF0cml4IG9mIHdob2xlIHNrZWxldG9uXG4gICAgICAgIHRoaXMucm9vdCA9IG5ldyBUcmFuc2Zvcm0oKTtcblxuICAgICAgICAvLyBDcmVhdGUgYm9uZXNcbiAgICAgICAgdGhpcy5ib25lcyA9IFtdO1xuICAgICAgICBpZiAoIXJpZy5ib25lcyB8fCAhcmlnLmJvbmVzLmxlbmd0aCkgcmV0dXJuO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHJpZy5ib25lcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgY29uc3QgYm9uZSA9IG5ldyBUcmFuc2Zvcm0oKTtcblxuICAgICAgICAgICAgLy8gU2V0IGluaXRpYWwgdmFsdWVzIChiaW5kIHBvc2UpXG4gICAgICAgICAgICBib25lLnBvc2l0aW9uLmZyb21BcnJheShyaWcuYmluZFBvc2UucG9zaXRpb24sIGkgKiAzKTtcbiAgICAgICAgICAgIGJvbmUucXVhdGVybmlvbi5mcm9tQXJyYXkocmlnLmJpbmRQb3NlLnF1YXRlcm5pb24sIGkgKiA0KTtcbiAgICAgICAgICAgIGJvbmUuc2NhbGUuZnJvbUFycmF5KHJpZy5iaW5kUG9zZS5zY2FsZSwgaSAqIDMpO1xuXG4gICAgICAgICAgICB0aGlzLmJvbmVzLnB1c2goYm9uZSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBPbmNlIGNyZWF0ZWQsIHNldCB0aGUgaGllcmFyY2h5XG4gICAgICAgIHJpZy5ib25lcy5mb3JFYWNoKChkYXRhLCBpKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmJvbmVzW2ldLm5hbWUgPSBkYXRhLm5hbWU7XG4gICAgICAgICAgICBpZiAoZGF0YS5wYXJlbnQgPT09IC0xKSByZXR1cm4gdGhpcy5ib25lc1tpXS5zZXRQYXJlbnQodGhpcy5yb290KTtcbiAgICAgICAgICAgIHRoaXMuYm9uZXNbaV0uc2V0UGFyZW50KHRoaXMuYm9uZXNbZGF0YS5wYXJlbnRdKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gVGhlbiB1cGRhdGUgdG8gY2FsY3VsYXRlIHdvcmxkIG1hdHJpY2VzXG4gICAgICAgIHRoaXMucm9vdC51cGRhdGVNYXRyaXhXb3JsZCh0cnVlKTtcblxuICAgICAgICAvLyBTdG9yZSBpbnZlcnNlIG9mIGJpbmQgcG9zZSB0byBjYWxjdWxhdGUgZGlmZmVyZW5jZXNcbiAgICAgICAgdGhpcy5ib25lcy5mb3JFYWNoKChib25lKSA9PiB7XG4gICAgICAgICAgICBib25lLmJpbmRJbnZlcnNlID0gbmV3IE1hdDQoLi4uYm9uZS53b3JsZE1hdHJpeCkuaW52ZXJzZSgpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBjcmVhdGVCb25lVGV4dHVyZSgpIHtcbiAgICAgICAgaWYgKCF0aGlzLmJvbmVzLmxlbmd0aCkgcmV0dXJuO1xuICAgICAgICBjb25zdCBzaXplID0gTWF0aC5tYXgoNCwgTWF0aC5wb3coMiwgTWF0aC5jZWlsKE1hdGgubG9nKE1hdGguc3FydCh0aGlzLmJvbmVzLmxlbmd0aCAqIDQpKSAvIE1hdGguTE4yKSkpO1xuICAgICAgICB0aGlzLmJvbmVNYXRyaWNlcyA9IG5ldyBGbG9hdDMyQXJyYXkoc2l6ZSAqIHNpemUgKiA0KTtcbiAgICAgICAgdGhpcy5ib25lVGV4dHVyZVNpemUgPSBzaXplO1xuICAgICAgICB0aGlzLmJvbmVUZXh0dXJlID0gbmV3IFRleHR1cmUodGhpcy5nbCwge1xuICAgICAgICAgICAgaW1hZ2U6IHRoaXMuYm9uZU1hdHJpY2VzLFxuICAgICAgICAgICAgZ2VuZXJhdGVNaXBtYXBzOiBmYWxzZSxcbiAgICAgICAgICAgIHR5cGU6IHRoaXMuZ2wuRkxPQVQsXG4gICAgICAgICAgICBpbnRlcm5hbEZvcm1hdDogdGhpcy5nbC5yZW5kZXJlci5pc1dlYmdsMiA/IHRoaXMuZ2wuUkdCQTMyRiA6IHRoaXMuZ2wuUkdCQSxcbiAgICAgICAgICAgIG1pbkZpbHRlcjogdGhpcy5nbC5ORUFSRVNULFxuICAgICAgICAgICAgbWFnRmlsdGVyOiB0aGlzLmdsLk5FQVJFU1QsXG4gICAgICAgICAgICBmbGlwWTogZmFsc2UsXG4gICAgICAgICAgICB3aWR0aDogc2l6ZSxcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgYWRkQW5pbWF0aW9uKGRhdGEpIHtcbiAgICAgICAgY29uc3QgYW5pbWF0aW9uID0gbmV3IEFuaW1hdGlvbih7IG9iamVjdHM6IHRoaXMuYm9uZXMsIGRhdGEgfSk7XG4gICAgICAgIHRoaXMuYW5pbWF0aW9ucy5wdXNoKGFuaW1hdGlvbik7XG4gICAgICAgIHJldHVybiBhbmltYXRpb247XG4gICAgfVxuXG4gICAgdXBkYXRlKCkge1xuICAgICAgICAvLyBDYWxjdWxhdGUgY29tYmluZWQgYW5pbWF0aW9uIHdlaWdodFxuICAgICAgICBsZXQgdG90YWwgPSAwO1xuICAgICAgICB0aGlzLmFuaW1hdGlvbnMuZm9yRWFjaCgoYW5pbWF0aW9uKSA9PiAodG90YWwgKz0gYW5pbWF0aW9uLndlaWdodCkpO1xuXG4gICAgICAgIHRoaXMuYW5pbWF0aW9ucy5mb3JFYWNoKChhbmltYXRpb24sIGkpID0+IHtcbiAgICAgICAgICAgIC8vIGZvcmNlIGZpcnN0IGFuaW1hdGlvbiB0byBzZXQgaW4gb3JkZXIgdG8gcmVzZXQgZnJhbWVcbiAgICAgICAgICAgIGFuaW1hdGlvbi51cGRhdGUodG90YWwsIGkgPT09IDApO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBkcmF3KHsgY2FtZXJhIH0gPSB7fSkge1xuICAgICAgICAvLyBVcGRhdGUgd29ybGQgbWF0cmljZXMgbWFudWFsbHksIGFzIG5vdCBwYXJ0IG9mIHNjZW5lIGdyYXBoXG4gICAgICAgIHRoaXMucm9vdC51cGRhdGVNYXRyaXhXb3JsZCh0cnVlKTtcblxuICAgICAgICAvLyBVcGRhdGUgYm9uZSB0ZXh0dXJlXG4gICAgICAgIHRoaXMuYm9uZXMuZm9yRWFjaCgoYm9uZSwgaSkgPT4ge1xuICAgICAgICAgICAgLy8gRmluZCBkaWZmZXJlbmNlIGJldHdlZW4gY3VycmVudCBhbmQgYmluZCBwb3NlXG4gICAgICAgICAgICB0ZW1wTWF0NC5tdWx0aXBseShib25lLndvcmxkTWF0cml4LCBib25lLmJpbmRJbnZlcnNlKTtcbiAgICAgICAgICAgIHRoaXMuYm9uZU1hdHJpY2VzLnNldCh0ZW1wTWF0NCwgaSAqIDE2KTtcbiAgICAgICAgfSk7XG4gICAgICAgIGlmICh0aGlzLmJvbmVUZXh0dXJlKSB0aGlzLmJvbmVUZXh0dXJlLm5lZWRzVXBkYXRlID0gdHJ1ZTtcblxuICAgICAgICBzdXBlci5kcmF3KHsgY2FtZXJhIH0pO1xuICAgIH1cbn1cbiIsImltcG9ydCB7IEdlb21ldHJ5IH0gZnJvbSAnLi4vY29yZS9HZW9tZXRyeS5qcyc7XG5pbXBvcnQgeyBWZWMzIH0gZnJvbSAnLi4vbWF0aC9WZWMzLmpzJztcblxuZXhwb3J0IGNsYXNzIFNwaGVyZSBleHRlbmRzIEdlb21ldHJ5IHtcbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgZ2wsXG4gICAgICAgIHtcbiAgICAgICAgICAgIHJhZGl1cyA9IDAuNSxcbiAgICAgICAgICAgIHdpZHRoU2VnbWVudHMgPSAxNixcbiAgICAgICAgICAgIGhlaWdodFNlZ21lbnRzID0gTWF0aC5jZWlsKHdpZHRoU2VnbWVudHMgKiAwLjUpLFxuICAgICAgICAgICAgcGhpU3RhcnQgPSAwLFxuICAgICAgICAgICAgcGhpTGVuZ3RoID0gTWF0aC5QSSAqIDIsXG4gICAgICAgICAgICB0aGV0YVN0YXJ0ID0gMCxcbiAgICAgICAgICAgIHRoZXRhTGVuZ3RoID0gTWF0aC5QSSxcbiAgICAgICAgICAgIGF0dHJpYnV0ZXMgPSB7fSxcbiAgICAgICAgfSA9IHt9XG4gICAgKSB7XG4gICAgICAgIGNvbnN0IHdTZWdzID0gd2lkdGhTZWdtZW50cztcbiAgICAgICAgY29uc3QgaFNlZ3MgPSBoZWlnaHRTZWdtZW50cztcbiAgICAgICAgY29uc3QgcFN0YXJ0ID0gcGhpU3RhcnQ7XG4gICAgICAgIGNvbnN0IHBMZW5ndGggPSBwaGlMZW5ndGg7XG4gICAgICAgIGNvbnN0IHRTdGFydCA9IHRoZXRhU3RhcnQ7XG4gICAgICAgIGNvbnN0IHRMZW5ndGggPSB0aGV0YUxlbmd0aDtcblxuICAgICAgICBjb25zdCBudW0gPSAod1NlZ3MgKyAxKSAqIChoU2VncyArIDEpO1xuICAgICAgICBjb25zdCBudW1JbmRpY2VzID0gd1NlZ3MgKiBoU2VncyAqIDY7XG5cbiAgICAgICAgY29uc3QgcG9zaXRpb24gPSBuZXcgRmxvYXQzMkFycmF5KG51bSAqIDMpO1xuICAgICAgICBjb25zdCBub3JtYWwgPSBuZXcgRmxvYXQzMkFycmF5KG51bSAqIDMpO1xuICAgICAgICBjb25zdCB1diA9IG5ldyBGbG9hdDMyQXJyYXkobnVtICogMik7XG4gICAgICAgIGNvbnN0IGluZGV4ID0gbnVtID4gNjU1MzYgPyBuZXcgVWludDMyQXJyYXkobnVtSW5kaWNlcykgOiBuZXcgVWludDE2QXJyYXkobnVtSW5kaWNlcyk7XG5cbiAgICAgICAgbGV0IGkgPSAwO1xuICAgICAgICBsZXQgaXYgPSAwO1xuICAgICAgICBsZXQgaWkgPSAwO1xuICAgICAgICBsZXQgdGUgPSB0U3RhcnQgKyB0TGVuZ3RoO1xuICAgICAgICBjb25zdCBncmlkID0gW107XG5cbiAgICAgICAgbGV0IG4gPSBuZXcgVmVjMygpO1xuXG4gICAgICAgIGZvciAobGV0IGl5ID0gMDsgaXkgPD0gaFNlZ3M7IGl5KyspIHtcbiAgICAgICAgICAgIGxldCB2Um93ID0gW107XG4gICAgICAgICAgICBsZXQgdiA9IGl5IC8gaFNlZ3M7XG4gICAgICAgICAgICBmb3IgKGxldCBpeCA9IDA7IGl4IDw9IHdTZWdzOyBpeCsrLCBpKyspIHtcbiAgICAgICAgICAgICAgICBsZXQgdSA9IGl4IC8gd1NlZ3M7XG4gICAgICAgICAgICAgICAgbGV0IHggPSAtcmFkaXVzICogTWF0aC5jb3MocFN0YXJ0ICsgdSAqIHBMZW5ndGgpICogTWF0aC5zaW4odFN0YXJ0ICsgdiAqIHRMZW5ndGgpO1xuICAgICAgICAgICAgICAgIGxldCB5ID0gcmFkaXVzICogTWF0aC5jb3ModFN0YXJ0ICsgdiAqIHRMZW5ndGgpO1xuICAgICAgICAgICAgICAgIGxldCB6ID0gcmFkaXVzICogTWF0aC5zaW4ocFN0YXJ0ICsgdSAqIHBMZW5ndGgpICogTWF0aC5zaW4odFN0YXJ0ICsgdiAqIHRMZW5ndGgpO1xuXG4gICAgICAgICAgICAgICAgcG9zaXRpb25baSAqIDNdID0geDtcbiAgICAgICAgICAgICAgICBwb3NpdGlvbltpICogMyArIDFdID0geTtcbiAgICAgICAgICAgICAgICBwb3NpdGlvbltpICogMyArIDJdID0gejtcblxuICAgICAgICAgICAgICAgIG4uc2V0KHgsIHksIHopLm5vcm1hbGl6ZSgpO1xuICAgICAgICAgICAgICAgIG5vcm1hbFtpICogM10gPSBuLng7XG4gICAgICAgICAgICAgICAgbm9ybWFsW2kgKiAzICsgMV0gPSBuLnk7XG4gICAgICAgICAgICAgICAgbm9ybWFsW2kgKiAzICsgMl0gPSBuLno7XG5cbiAgICAgICAgICAgICAgICB1dltpICogMl0gPSB1O1xuICAgICAgICAgICAgICAgIHV2W2kgKiAyICsgMV0gPSAxIC0gdjtcblxuICAgICAgICAgICAgICAgIHZSb3cucHVzaChpdisrKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZ3JpZC5wdXNoKHZSb3cpO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yIChsZXQgaXkgPSAwOyBpeSA8IGhTZWdzOyBpeSsrKSB7XG4gICAgICAgICAgICBmb3IgKGxldCBpeCA9IDA7IGl4IDwgd1NlZ3M7IGl4KyspIHtcbiAgICAgICAgICAgICAgICBsZXQgYSA9IGdyaWRbaXldW2l4ICsgMV07XG4gICAgICAgICAgICAgICAgbGV0IGIgPSBncmlkW2l5XVtpeF07XG4gICAgICAgICAgICAgICAgbGV0IGMgPSBncmlkW2l5ICsgMV1baXhdO1xuICAgICAgICAgICAgICAgIGxldCBkID0gZ3JpZFtpeSArIDFdW2l4ICsgMV07XG5cbiAgICAgICAgICAgICAgICBpZiAoaXkgIT09IDAgfHwgdFN0YXJ0ID4gMCkge1xuICAgICAgICAgICAgICAgICAgICBpbmRleFtpaSAqIDNdID0gYTtcbiAgICAgICAgICAgICAgICAgICAgaW5kZXhbaWkgKiAzICsgMV0gPSBiO1xuICAgICAgICAgICAgICAgICAgICBpbmRleFtpaSAqIDMgKyAyXSA9IGQ7XG4gICAgICAgICAgICAgICAgICAgIGlpKys7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChpeSAhPT0gaFNlZ3MgLSAxIHx8IHRlIDwgTWF0aC5QSSkge1xuICAgICAgICAgICAgICAgICAgICBpbmRleFtpaSAqIDNdID0gYjtcbiAgICAgICAgICAgICAgICAgICAgaW5kZXhbaWkgKiAzICsgMV0gPSBjO1xuICAgICAgICAgICAgICAgICAgICBpbmRleFtpaSAqIDMgKyAyXSA9IGQ7XG4gICAgICAgICAgICAgICAgICAgIGlpKys7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgT2JqZWN0LmFzc2lnbihhdHRyaWJ1dGVzLCB7XG4gICAgICAgICAgICBwb3NpdGlvbjogeyBzaXplOiAzLCBkYXRhOiBwb3NpdGlvbiB9LFxuICAgICAgICAgICAgbm9ybWFsOiB7IHNpemU6IDMsIGRhdGE6IG5vcm1hbCB9LFxuICAgICAgICAgICAgdXY6IHsgc2l6ZTogMiwgZGF0YTogdXYgfSxcbiAgICAgICAgICAgIGluZGV4OiB7IGRhdGE6IGluZGV4IH0sXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHN1cGVyKGdsLCBhdHRyaWJ1dGVzKTtcbiAgICB9XG59XG4iLCJleHBvcnQgZnVuY3Rpb24gVGV4dCh7XG4gICAgZm9udCxcbiAgICB0ZXh0LFxuICAgIHdpZHRoID0gSW5maW5pdHksXG4gICAgYWxpZ24gPSAnbGVmdCcsXG4gICAgc2l6ZSA9IDEsXG4gICAgbGV0dGVyU3BhY2luZyA9IDAsXG4gICAgbGluZUhlaWdodCA9IDEuNCxcbiAgICB3b3JkU3BhY2luZyA9IDAsXG4gICAgd29yZEJyZWFrID0gZmFsc2UsXG59KSB7XG4gICAgY29uc3QgX3RoaXMgPSB0aGlzO1xuICAgIGxldCBnbHlwaHMsIGJ1ZmZlcnM7XG4gICAgbGV0IGZvbnRIZWlnaHQsIGJhc2VsaW5lLCBzY2FsZTtcblxuICAgIGNvbnN0IG5ld2xpbmUgPSAvXFxuLztcbiAgICBjb25zdCB3aGl0ZXNwYWNlID0gL1xccy87XG5cbiAgICB7XG4gICAgICAgIHBhcnNlRm9udCgpO1xuICAgICAgICBjcmVhdGVHZW9tZXRyeSgpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHBhcnNlRm9udCgpIHtcbiAgICAgICAgZ2x5cGhzID0ge307XG4gICAgICAgIGZvbnQuY2hhcnMuZm9yRWFjaCgoZCkgPT4gKGdseXBoc1tkLmNoYXJdID0gZCkpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNyZWF0ZUdlb21ldHJ5KCkge1xuICAgICAgICBmb250SGVpZ2h0ID0gZm9udC5jb21tb24ubGluZUhlaWdodDtcbiAgICAgICAgYmFzZWxpbmUgPSBmb250LmNvbW1vbi5iYXNlO1xuXG4gICAgICAgIC8vIFVzZSBiYXNlbGluZSBzbyB0aGF0IGFjdHVhbCB0ZXh0IGhlaWdodCBpcyBhcyBjbG9zZSB0byAnc2l6ZScgdmFsdWUgYXMgcG9zc2libGVcbiAgICAgICAgc2NhbGUgPSBzaXplIC8gYmFzZWxpbmU7XG5cbiAgICAgICAgLy8gU3RyaXAgc3BhY2VzIGFuZCBuZXdsaW5lcyB0byBnZXQgYWN0dWFsIGNoYXJhY3RlciBsZW5ndGggZm9yIGJ1ZmZlcnNcbiAgICAgICAgbGV0IGNoYXJzID0gdGV4dC5yZXBsYWNlKC9bIFxcbl0vZywgJycpO1xuICAgICAgICBsZXQgbnVtQ2hhcnMgPSBjaGFycy5sZW5ndGg7XG5cbiAgICAgICAgLy8gQ3JlYXRlIG91dHB1dCBidWZmZXJzXG4gICAgICAgIGJ1ZmZlcnMgPSB7XG4gICAgICAgICAgICBwb3NpdGlvbjogbmV3IEZsb2F0MzJBcnJheShudW1DaGFycyAqIDQgKiAzKSxcbiAgICAgICAgICAgIHV2OiBuZXcgRmxvYXQzMkFycmF5KG51bUNoYXJzICogNCAqIDIpLFxuICAgICAgICAgICAgaWQ6IG5ldyBGbG9hdDMyQXJyYXkobnVtQ2hhcnMgKiA0KSxcbiAgICAgICAgICAgIGluZGV4OiBuZXcgVWludDE2QXJyYXkobnVtQ2hhcnMgKiA2KSxcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBTZXQgdmFsdWVzIGZvciBidWZmZXJzIHRoYXQgZG9uJ3QgcmVxdWlyZSBjYWxjdWxhdGlvblxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG51bUNoYXJzOyBpKyspIHtcbiAgICAgICAgICAgIGJ1ZmZlcnMuaWRbaV0gPSBpO1xuICAgICAgICAgICAgYnVmZmVycy5pbmRleC5zZXQoW2kgKiA0LCBpICogNCArIDIsIGkgKiA0ICsgMSwgaSAqIDQgKyAxLCBpICogNCArIDIsIGkgKiA0ICsgM10sIGkgKiA2KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxheW91dCgpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxheW91dCgpIHtcbiAgICAgICAgY29uc3QgbGluZXMgPSBbXTtcblxuICAgICAgICBsZXQgY3Vyc29yID0gMDtcblxuICAgICAgICBsZXQgd29yZEN1cnNvciA9IDA7XG4gICAgICAgIGxldCB3b3JkV2lkdGggPSAwO1xuICAgICAgICBsZXQgbGluZSA9IG5ld0xpbmUoKTtcblxuICAgICAgICBmdW5jdGlvbiBuZXdMaW5lKCkge1xuICAgICAgICAgICAgY29uc3QgbGluZSA9IHtcbiAgICAgICAgICAgICAgICB3aWR0aDogMCxcbiAgICAgICAgICAgICAgICBnbHlwaHM6IFtdLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGxpbmVzLnB1c2gobGluZSk7XG4gICAgICAgICAgICB3b3JkQ3Vyc29yID0gY3Vyc29yO1xuICAgICAgICAgICAgd29yZFdpZHRoID0gMDtcbiAgICAgICAgICAgIHJldHVybiBsaW5lO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IG1heFRpbWVzID0gMTAwO1xuICAgICAgICBsZXQgY291bnQgPSAwO1xuICAgICAgICB3aGlsZSAoY3Vyc29yIDwgdGV4dC5sZW5ndGggJiYgY291bnQgPCBtYXhUaW1lcykge1xuICAgICAgICAgICAgY291bnQrKztcblxuICAgICAgICAgICAgY29uc3QgY2hhciA9IHRleHRbY3Vyc29yXTtcblxuICAgICAgICAgICAgLy8gU2tpcCB3aGl0ZXNwYWNlIGF0IHN0YXJ0IG9mIGxpbmVcbiAgICAgICAgICAgIGlmICghbGluZS53aWR0aCAmJiB3aGl0ZXNwYWNlLnRlc3QoY2hhcikpIHtcbiAgICAgICAgICAgICAgICBjdXJzb3IrKztcbiAgICAgICAgICAgICAgICB3b3JkQ3Vyc29yID0gY3Vyc29yO1xuICAgICAgICAgICAgICAgIHdvcmRXaWR0aCA9IDA7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIElmIG5ld2xpbmUgY2hhciwgc2tpcCB0byBuZXh0IGxpbmVcbiAgICAgICAgICAgIGlmIChuZXdsaW5lLnRlc3QoY2hhcikpIHtcbiAgICAgICAgICAgICAgICBjdXJzb3IrKztcbiAgICAgICAgICAgICAgICBsaW5lID0gbmV3TGluZSgpO1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCBnbHlwaCA9IGdseXBoc1tjaGFyXSB8fCBnbHlwaHNbJyAnXTtcblxuICAgICAgICAgICAgLy8gRmluZCBhbnkgYXBwbGljYWJsZSBrZXJuIHBhaXJzXG4gICAgICAgICAgICBpZiAobGluZS5nbHlwaHMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcHJldkdseXBoID0gbGluZS5nbHlwaHNbbGluZS5nbHlwaHMubGVuZ3RoIC0gMV1bMF07XG4gICAgICAgICAgICAgICAgbGV0IGtlcm4gPSBnZXRLZXJuUGFpck9mZnNldChnbHlwaC5pZCwgcHJldkdseXBoLmlkKSAqIHNjYWxlO1xuICAgICAgICAgICAgICAgIGxpbmUud2lkdGggKz0ga2VybjtcbiAgICAgICAgICAgICAgICB3b3JkV2lkdGggKz0ga2VybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gYWRkIGNoYXIgdG8gbGluZVxuICAgICAgICAgICAgbGluZS5nbHlwaHMucHVzaChbZ2x5cGgsIGxpbmUud2lkdGhdKTtcblxuICAgICAgICAgICAgLy8gY2FsY3VsYXRlIGFkdmFuY2UgZm9yIG5leHQgZ2x5cGhcbiAgICAgICAgICAgIGxldCBhZHZhbmNlID0gMDtcblxuICAgICAgICAgICAgLy8gSWYgd2hpdGVzcGFjZSwgdXBkYXRlIGxvY2F0aW9uIG9mIGN1cnJlbnQgd29yZCBmb3IgbGluZSBicmVha3NcbiAgICAgICAgICAgIGlmICh3aGl0ZXNwYWNlLnRlc3QoY2hhcikpIHtcbiAgICAgICAgICAgICAgICB3b3JkQ3Vyc29yID0gY3Vyc29yO1xuICAgICAgICAgICAgICAgIHdvcmRXaWR0aCA9IDA7XG5cbiAgICAgICAgICAgICAgICAvLyBBZGQgd29yZHNwYWNpbmdcbiAgICAgICAgICAgICAgICBhZHZhbmNlICs9IHdvcmRTcGFjaW5nICogc2l6ZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gQWRkIGxldHRlcnNwYWNpbmdcbiAgICAgICAgICAgICAgICBhZHZhbmNlICs9IGxldHRlclNwYWNpbmcgKiBzaXplO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBhZHZhbmNlICs9IGdseXBoLnhhZHZhbmNlICogc2NhbGU7XG5cbiAgICAgICAgICAgIGxpbmUud2lkdGggKz0gYWR2YW5jZTtcbiAgICAgICAgICAgIHdvcmRXaWR0aCArPSBhZHZhbmNlO1xuXG4gICAgICAgICAgICAvLyBJZiB3aWR0aCBkZWZpbmVkXG4gICAgICAgICAgICBpZiAobGluZS53aWR0aCA+IHdpZHRoKSB7XG4gICAgICAgICAgICAgICAgLy8gSWYgY2FuIGJyZWFrIHdvcmRzLCB1bmRvIGxhdGVzdCBnbHlwaCBpZiBsaW5lIG5vdCBlbXB0eSBhbmQgY3JlYXRlIG5ldyBsaW5lXG4gICAgICAgICAgICAgICAgaWYgKHdvcmRCcmVhayAmJiBsaW5lLmdseXBocy5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgICAgICAgICAgIGxpbmUud2lkdGggLT0gYWR2YW5jZTtcbiAgICAgICAgICAgICAgICAgICAgbGluZS5nbHlwaHMucG9wKCk7XG4gICAgICAgICAgICAgICAgICAgIGxpbmUgPSBuZXdMaW5lKCk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIElmIG5vdCBmaXJzdCB3b3JkLCB1bmRvIGN1cnJlbnQgd29yZCBhbmQgY3Vyc29yIGFuZCBjcmVhdGUgbmV3IGxpbmVcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKCF3b3JkQnJlYWsgJiYgd29yZFdpZHRoICE9PSBsaW5lLndpZHRoKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBudW1HbHlwaHMgPSBjdXJzb3IgLSB3b3JkQ3Vyc29yICsgMTtcbiAgICAgICAgICAgICAgICAgICAgbGluZS5nbHlwaHMuc3BsaWNlKC1udW1HbHlwaHMsIG51bUdseXBocyk7XG4gICAgICAgICAgICAgICAgICAgIGN1cnNvciA9IHdvcmRDdXJzb3I7XG4gICAgICAgICAgICAgICAgICAgIGxpbmUud2lkdGggLT0gd29yZFdpZHRoO1xuICAgICAgICAgICAgICAgICAgICBsaW5lID0gbmV3TGluZSgpO1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGN1cnNvcisrO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gUmVtb3ZlIGxhc3QgbGluZSBpZiBlbXB0eVxuICAgICAgICBpZiAoIWxpbmUud2lkdGgpIGxpbmVzLnBvcCgpO1xuXG4gICAgICAgIHBvcHVsYXRlQnVmZmVycyhsaW5lcyk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcG9wdWxhdGVCdWZmZXJzKGxpbmVzKSB7XG4gICAgICAgIGNvbnN0IHRleFcgPSBmb250LmNvbW1vbi5zY2FsZVc7XG4gICAgICAgIGNvbnN0IHRleEggPSBmb250LmNvbW1vbi5zY2FsZUg7XG5cbiAgICAgICAgLy8gRm9yIGFsbCBmb250cyB0ZXN0ZWQsIGEgbGl0dGxlIG9mZnNldCB3YXMgbmVlZGVkIHRvIGJlIHJpZ2h0IG9uIHRoZSBiYXNlbGluZSwgaGVuY2UgMC4wNy5cbiAgICAgICAgbGV0IHkgPSAwLjA3ICogc2l6ZTtcbiAgICAgICAgbGV0IGogPSAwO1xuXG4gICAgICAgIGZvciAobGV0IGxpbmVJbmRleCA9IDA7IGxpbmVJbmRleCA8IGxpbmVzLmxlbmd0aDsgbGluZUluZGV4KyspIHtcbiAgICAgICAgICAgIGxldCBsaW5lID0gbGluZXNbbGluZUluZGV4XTtcblxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsaW5lLmdseXBocy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGNvbnN0IGdseXBoID0gbGluZS5nbHlwaHNbaV1bMF07XG4gICAgICAgICAgICAgICAgbGV0IHggPSBsaW5lLmdseXBoc1tpXVsxXTtcblxuICAgICAgICAgICAgICAgIGlmIChhbGlnbiA9PT0gJ2NlbnRlcicpIHtcbiAgICAgICAgICAgICAgICAgICAgeCAtPSBsaW5lLndpZHRoICogMC41O1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoYWxpZ24gPT09ICdyaWdodCcpIHtcbiAgICAgICAgICAgICAgICAgICAgeCAtPSBsaW5lLndpZHRoO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIElmIHNwYWNlLCBkb24ndCBhZGQgdG8gZ2VvbWV0cnlcbiAgICAgICAgICAgICAgICBpZiAod2hpdGVzcGFjZS50ZXN0KGdseXBoLmNoYXIpKSBjb250aW51ZTtcblxuICAgICAgICAgICAgICAgIC8vIEFwcGx5IGNoYXIgc3ByaXRlIG9mZnNldHNcbiAgICAgICAgICAgICAgICB4ICs9IGdseXBoLnhvZmZzZXQgKiBzY2FsZTtcbiAgICAgICAgICAgICAgICB5IC09IGdseXBoLnlvZmZzZXQgKiBzY2FsZTtcblxuICAgICAgICAgICAgICAgIC8vIGVhY2ggbGV0dGVyIGlzIGEgcXVhZC4gYXhpcyBib3R0b20gbGVmdFxuICAgICAgICAgICAgICAgIGxldCB3ID0gZ2x5cGgud2lkdGggKiBzY2FsZTtcbiAgICAgICAgICAgICAgICBsZXQgaCA9IGdseXBoLmhlaWdodCAqIHNjYWxlO1xuICAgICAgICAgICAgICAgIGJ1ZmZlcnMucG9zaXRpb24uc2V0KFt4LCB5IC0gaCwgMCwgeCwgeSwgMCwgeCArIHcsIHkgLSBoLCAwLCB4ICsgdywgeSwgMF0sIGogKiA0ICogMyk7XG5cbiAgICAgICAgICAgICAgICBsZXQgdSA9IGdseXBoLnggLyB0ZXhXO1xuICAgICAgICAgICAgICAgIGxldCB1dyA9IGdseXBoLndpZHRoIC8gdGV4VztcbiAgICAgICAgICAgICAgICBsZXQgdiA9IDEuMCAtIGdseXBoLnkgLyB0ZXhIO1xuICAgICAgICAgICAgICAgIGxldCB2aCA9IGdseXBoLmhlaWdodCAvIHRleEg7XG4gICAgICAgICAgICAgICAgYnVmZmVycy51di5zZXQoW3UsIHYgLSB2aCwgdSwgdiwgdSArIHV3LCB2IC0gdmgsIHUgKyB1dywgdl0sIGogKiA0ICogMik7XG5cbiAgICAgICAgICAgICAgICAvLyBSZXNldCBjdXJzb3IgdG8gYmFzZWxpbmVcbiAgICAgICAgICAgICAgICB5ICs9IGdseXBoLnlvZmZzZXQgKiBzY2FsZTtcblxuICAgICAgICAgICAgICAgIGorKztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgeSAtPSBzaXplICogbGluZUhlaWdodDtcbiAgICAgICAgfVxuXG4gICAgICAgIF90aGlzLmJ1ZmZlcnMgPSBidWZmZXJzO1xuICAgICAgICBfdGhpcy5udW1MaW5lcyA9IGxpbmVzLmxlbmd0aDtcbiAgICAgICAgX3RoaXMuaGVpZ2h0ID0gX3RoaXMubnVtTGluZXMgKiBzaXplICogbGluZUhlaWdodDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRLZXJuUGFpck9mZnNldChpZDEsIGlkMikge1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGZvbnQua2VybmluZ3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGxldCBrID0gZm9udC5rZXJuaW5nc1tpXTtcbiAgICAgICAgICAgIGlmIChrLmZpcnN0IDwgaWQxKSBjb250aW51ZTtcbiAgICAgICAgICAgIGlmIChrLnNlY29uZCA8IGlkMikgY29udGludWU7XG4gICAgICAgICAgICBpZiAoay5maXJzdCA+IGlkMSkgcmV0dXJuIDA7XG4gICAgICAgICAgICBpZiAoay5maXJzdCA9PT0gaWQxICYmIGsuc2Vjb25kID4gaWQyKSByZXR1cm4gMDtcbiAgICAgICAgICAgIHJldHVybiBrLmFtb3VudDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gMDtcbiAgICB9XG5cbiAgICAvLyBVcGRhdGUgYnVmZmVycyB0byBsYXlvdXQgd2l0aCBuZXcgbGF5b3V0XG4gICAgdGhpcy5yZXNpemUgPSBmdW5jdGlvbiAob3B0aW9ucykge1xuICAgICAgICAoeyB3aWR0aCB9ID0gb3B0aW9ucyk7XG4gICAgICAgIGxheW91dCgpO1xuICAgIH07XG5cbiAgICAvLyBDb21wbGV0ZWx5IGNoYW5nZSB0ZXh0IChsaWtlIGNyZWF0aW5nIG5ldyBUZXh0KVxuICAgIHRoaXMudXBkYXRlID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgICAgICAgKHsgdGV4dCB9ID0gb3B0aW9ucyk7XG4gICAgICAgIGNyZWF0ZUdlb21ldHJ5KCk7XG4gICAgfTtcbn1cbiIsImltcG9ydCB7IFRleHR1cmUgfSBmcm9tICcuLi9jb3JlL1RleHR1cmUuanMnO1xuaW1wb3J0IHsgS1RYVGV4dHVyZSB9IGZyb20gJy4vS1RYVGV4dHVyZS5qcyc7XG5cbi8vIEZvciBjb21wcmVzc2VkIHRleHR1cmVzLCBnZW5lcmF0ZSB1c2luZyBodHRwczovL2dpdGh1Yi5jb20vVGltdmFuU2NoZXJwZW56ZWVsL3RleHR1cmUtY29tcHJlc3NvclxuXG5sZXQgY2FjaGUgPSB7fTtcbmNvbnN0IHN1cHBvcnRlZEV4dGVuc2lvbnMgPSBbXTtcblxuZXhwb3J0IGNsYXNzIFRleHR1cmVMb2FkZXIge1xuICAgIHN0YXRpYyBsb2FkKFxuICAgICAgICBnbCxcbiAgICAgICAge1xuICAgICAgICAgICAgc3JjLCAvLyBzdHJpbmcgb3Igb2JqZWN0IG9mIGV4dGVuc2lvbjpzcmMga2V5LXZhbHVlc1xuICAgICAgICAgICAgLy8ge1xuICAgICAgICAgICAgLy8gICAgIHB2cnRjOiAnLi4ua3R4JyxcbiAgICAgICAgICAgIC8vICAgICBzM3RjOiAnLi4ua3R4JyxcbiAgICAgICAgICAgIC8vICAgICBldGM6ICcuLi5rdHgnLFxuICAgICAgICAgICAgLy8gICAgIGV0YzE6ICcuLi5rdHgnLFxuICAgICAgICAgICAgLy8gICAgIGFzdGM6ICcuLi5rdHgnLFxuICAgICAgICAgICAgLy8gICAgIHdlYnA6ICcuLi53ZWJwJyxcbiAgICAgICAgICAgIC8vICAgICBqcGc6ICcuLi5qcGcnLFxuICAgICAgICAgICAgLy8gICAgIHBuZzogJy4uLnBuZycsXG4gICAgICAgICAgICAvLyB9XG5cbiAgICAgICAgICAgIC8vIE9ubHkgcHJvcHMgcmVsZXZhbnQgdG8gS1RYVGV4dHVyZVxuICAgICAgICAgICAgd3JhcFMgPSBnbC5DTEFNUF9UT19FREdFLFxuICAgICAgICAgICAgd3JhcFQgPSBnbC5DTEFNUF9UT19FREdFLFxuICAgICAgICAgICAgYW5pc290cm9weSA9IDAsXG5cbiAgICAgICAgICAgIC8vIEZvciByZWd1bGFyIGltYWdlc1xuICAgICAgICAgICAgZm9ybWF0ID0gZ2wuUkdCQSxcbiAgICAgICAgICAgIGludGVybmFsRm9ybWF0ID0gZm9ybWF0LFxuICAgICAgICAgICAgZ2VuZXJhdGVNaXBtYXBzID0gdHJ1ZSxcbiAgICAgICAgICAgIG1pbkZpbHRlciA9IGdlbmVyYXRlTWlwbWFwcyA/IGdsLk5FQVJFU1RfTUlQTUFQX0xJTkVBUiA6IGdsLkxJTkVBUixcbiAgICAgICAgICAgIG1hZ0ZpbHRlciA9IGdsLkxJTkVBUixcbiAgICAgICAgICAgIHByZW11bHRpcGx5QWxwaGEgPSBmYWxzZSxcbiAgICAgICAgICAgIHVucGFja0FsaWdubWVudCA9IDQsXG4gICAgICAgICAgICBmbGlwWSA9IHRydWUsXG4gICAgICAgIH0gPSB7fVxuICAgICkge1xuICAgICAgICBjb25zdCBzdXBwb3J0ID0gdGhpcy5nZXRTdXBwb3J0ZWRFeHRlbnNpb25zKGdsKTtcbiAgICAgICAgbGV0IGV4dCA9ICdub25lJztcblxuICAgICAgICAvLyBJZiBzcmMgaXMgc3RyaW5nLCBkZXRlcm1pbmUgd2hpY2ggZm9ybWF0IGZyb20gdGhlIGV4dGVuc2lvblxuICAgICAgICBpZiAodHlwZW9mIHNyYyA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIGV4dCA9IHNyYy5zcGxpdCgnLicpLnBvcCgpLnNwbGl0KCc/JylbMF0udG9Mb3dlckNhc2UoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIElmIHNyYyBpcyBvYmplY3QsIHVzZSBzdXBwb3J0ZWQgZXh0ZW5zaW9ucyBhbmQgcHJvdmlkZWQgbGlzdCB0byBjaG9vc2UgYmVzdCBvcHRpb25cbiAgICAgICAgLy8gR2V0IGZpcnN0IHN1cHBvcnRlZCBtYXRjaCwgc28gcHV0IGluIG9yZGVyIG9mIHByZWZlcmVuY2VcbiAgICAgICAgaWYgKHR5cGVvZiBzcmMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IHByb3AgaW4gc3JjKSB7XG4gICAgICAgICAgICAgICAgaWYgKHN1cHBvcnQuaW5jbHVkZXMocHJvcC50b0xvd2VyQ2FzZSgpKSkge1xuICAgICAgICAgICAgICAgICAgICBleHQgPSBwcm9wLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgICAgICAgICAgICAgIHNyYyA9IHNyY1twcm9wXTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gU3RyaW5naWZ5IHByb3BzXG4gICAgICAgIGNvbnN0IGNhY2hlSUQgPVxuICAgICAgICAgICAgc3JjICtcbiAgICAgICAgICAgIHdyYXBTICtcbiAgICAgICAgICAgIHdyYXBUICtcbiAgICAgICAgICAgIGFuaXNvdHJvcHkgK1xuICAgICAgICAgICAgZm9ybWF0ICtcbiAgICAgICAgICAgIGludGVybmFsRm9ybWF0ICtcbiAgICAgICAgICAgIGdlbmVyYXRlTWlwbWFwcyArXG4gICAgICAgICAgICBtaW5GaWx0ZXIgK1xuICAgICAgICAgICAgbWFnRmlsdGVyICtcbiAgICAgICAgICAgIHByZW11bHRpcGx5QWxwaGEgK1xuICAgICAgICAgICAgdW5wYWNrQWxpZ25tZW50ICtcbiAgICAgICAgICAgIGZsaXBZICtcbiAgICAgICAgICAgIGdsLnJlbmRlcmVyLmlkO1xuXG4gICAgICAgIC8vIENoZWNrIGNhY2hlIGZvciBleGlzdGluZyB0ZXh0dXJlXG4gICAgICAgIGlmIChjYWNoZVtjYWNoZUlEXSkgcmV0dXJuIGNhY2hlW2NhY2hlSURdO1xuXG4gICAgICAgIGxldCB0ZXh0dXJlO1xuICAgICAgICBzd2l0Y2ggKGV4dCkge1xuICAgICAgICAgICAgY2FzZSAna3R4JzpcbiAgICAgICAgICAgIGNhc2UgJ3B2cnRjJzpcbiAgICAgICAgICAgIGNhc2UgJ3MzdGMnOlxuICAgICAgICAgICAgY2FzZSAnZXRjJzpcbiAgICAgICAgICAgIGNhc2UgJ2V0YzEnOlxuICAgICAgICAgICAgY2FzZSAnYXN0Yyc6XG4gICAgICAgICAgICAgICAgLy8gTG9hZCBjb21wcmVzc2VkIHRleHR1cmUgdXNpbmcgS1RYIGZvcm1hdFxuICAgICAgICAgICAgICAgIHRleHR1cmUgPSBuZXcgS1RYVGV4dHVyZShnbCwge1xuICAgICAgICAgICAgICAgICAgICBzcmMsXG4gICAgICAgICAgICAgICAgICAgIHdyYXBTLFxuICAgICAgICAgICAgICAgICAgICB3cmFwVCxcbiAgICAgICAgICAgICAgICAgICAgYW5pc290cm9weSxcbiAgICAgICAgICAgICAgICAgICAgbWluRmlsdGVyLFxuICAgICAgICAgICAgICAgICAgICBtYWdGaWx0ZXIsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgdGV4dHVyZS5sb2FkZWQgPSB0aGlzLmxvYWRLVFgoc3JjLCB0ZXh0dXJlKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ3dlYnAnOlxuICAgICAgICAgICAgY2FzZSAnanBnJzpcbiAgICAgICAgICAgIGNhc2UgJ2pwZWcnOlxuICAgICAgICAgICAgY2FzZSAncG5nJzpcbiAgICAgICAgICAgICAgICB0ZXh0dXJlID0gbmV3IFRleHR1cmUoZ2wsIHtcbiAgICAgICAgICAgICAgICAgICAgd3JhcFMsXG4gICAgICAgICAgICAgICAgICAgIHdyYXBULFxuICAgICAgICAgICAgICAgICAgICBhbmlzb3Ryb3B5LFxuICAgICAgICAgICAgICAgICAgICBmb3JtYXQsXG4gICAgICAgICAgICAgICAgICAgIGludGVybmFsRm9ybWF0LFxuICAgICAgICAgICAgICAgICAgICBnZW5lcmF0ZU1pcG1hcHMsXG4gICAgICAgICAgICAgICAgICAgIG1pbkZpbHRlcixcbiAgICAgICAgICAgICAgICAgICAgbWFnRmlsdGVyLFxuICAgICAgICAgICAgICAgICAgICBwcmVtdWx0aXBseUFscGhhLFxuICAgICAgICAgICAgICAgICAgICB1bnBhY2tBbGlnbm1lbnQsXG4gICAgICAgICAgICAgICAgICAgIGZsaXBZLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHRleHR1cmUubG9hZGVkID0gdGhpcy5sb2FkSW1hZ2UoZ2wsIHNyYywgdGV4dHVyZSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignTm8gc3VwcG9ydGVkIGZvcm1hdCBzdXBwbGllZCcpO1xuICAgICAgICAgICAgICAgIHRleHR1cmUgPSBuZXcgVGV4dHVyZShnbCk7XG4gICAgICAgIH1cblxuICAgICAgICB0ZXh0dXJlLmV4dCA9IGV4dDtcbiAgICAgICAgY2FjaGVbY2FjaGVJRF0gPSB0ZXh0dXJlO1xuICAgICAgICByZXR1cm4gdGV4dHVyZTtcbiAgICB9XG5cbiAgICBzdGF0aWMgZ2V0U3VwcG9ydGVkRXh0ZW5zaW9ucyhnbCkge1xuICAgICAgICBpZiAoc3VwcG9ydGVkRXh0ZW5zaW9ucy5sZW5ndGgpIHJldHVybiBzdXBwb3J0ZWRFeHRlbnNpb25zO1xuXG4gICAgICAgIGNvbnN0IGV4dGVuc2lvbnMgPSB7XG4gICAgICAgICAgICBwdnJ0YzogZ2wucmVuZGVyZXIuZ2V0RXh0ZW5zaW9uKCdXRUJHTF9jb21wcmVzc2VkX3RleHR1cmVfcHZydGMnKSB8fCBnbC5yZW5kZXJlci5nZXRFeHRlbnNpb24oJ1dFQktJVF9XRUJHTF9jb21wcmVzc2VkX3RleHR1cmVfcHZydGMnKSxcbiAgICAgICAgICAgIHMzdGM6XG4gICAgICAgICAgICAgICAgZ2wucmVuZGVyZXIuZ2V0RXh0ZW5zaW9uKCdXRUJHTF9jb21wcmVzc2VkX3RleHR1cmVfczN0YycpIHx8XG4gICAgICAgICAgICAgICAgZ2wucmVuZGVyZXIuZ2V0RXh0ZW5zaW9uKCdNT1pfV0VCR0xfY29tcHJlc3NlZF90ZXh0dXJlX3MzdGMnKSB8fFxuICAgICAgICAgICAgICAgIGdsLnJlbmRlcmVyLmdldEV4dGVuc2lvbignV0VCS0lUX1dFQkdMX2NvbXByZXNzZWRfdGV4dHVyZV9zM3RjJyksXG4gICAgICAgICAgICBldGM6IGdsLnJlbmRlcmVyLmdldEV4dGVuc2lvbignV0VCR0xfY29tcHJlc3NlZF90ZXh0dXJlX2V0YycpLFxuICAgICAgICAgICAgZXRjMTogZ2wucmVuZGVyZXIuZ2V0RXh0ZW5zaW9uKCdXRUJHTF9jb21wcmVzc2VkX3RleHR1cmVfZXRjMScpLFxuICAgICAgICAgICAgYXN0YzogZ2wucmVuZGVyZXIuZ2V0RXh0ZW5zaW9uKCdXRUJHTF9jb21wcmVzc2VkX3RleHR1cmVfYXN0YycpLFxuICAgICAgICB9O1xuXG4gICAgICAgIGZvciAoY29uc3QgZXh0IGluIGV4dGVuc2lvbnMpIGlmIChleHRlbnNpb25zW2V4dF0pIHN1cHBvcnRlZEV4dGVuc2lvbnMucHVzaChleHQpO1xuXG4gICAgICAgIC8vIENoZWNrIGZvciBXZWJQIHN1cHBvcnRcbiAgICAgICAgaWYgKGRldGVjdFdlYlApIHN1cHBvcnRlZEV4dGVuc2lvbnMucHVzaCgnd2VicCcpO1xuXG4gICAgICAgIC8vIEZvcm1hdHMgc3VwcG9ydGVkIGJ5IGFsbFxuICAgICAgICBzdXBwb3J0ZWRFeHRlbnNpb25zLnB1c2goJ3BuZycsICdqcGcnKTtcblxuICAgICAgICByZXR1cm4gc3VwcG9ydGVkRXh0ZW5zaW9ucztcbiAgICB9XG5cbiAgICBzdGF0aWMgbG9hZEtUWChzcmMsIHRleHR1cmUpIHtcbiAgICAgICAgcmV0dXJuIGZldGNoKHNyYylcbiAgICAgICAgICAgIC50aGVuKChyZXMpID0+IHJlcy5hcnJheUJ1ZmZlcigpKVxuICAgICAgICAgICAgLnRoZW4oKGJ1ZmZlcikgPT4gdGV4dHVyZS5wYXJzZUJ1ZmZlcihidWZmZXIpKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgbG9hZEltYWdlKGdsLCBzcmMsIHRleHR1cmUpIHtcbiAgICAgICAgcmV0dXJuIGRlY29kZUltYWdlKHNyYykudGhlbigoaW1nQm1wKSA9PiB7XG4gICAgICAgICAgICAvLyBDYXRjaCBub24gUE9UIHRleHR1cmVzIGFuZCB1cGRhdGUgcGFyYW1zIHRvIGF2b2lkIGVycm9yc1xuICAgICAgICAgICAgaWYgKCFwb3dlck9mVHdvKGltZ0JtcC53aWR0aCkgfHwgIXBvd2VyT2ZUd28oaW1nQm1wLmhlaWdodCkpIHtcbiAgICAgICAgICAgICAgICBpZiAodGV4dHVyZS5nZW5lcmF0ZU1pcG1hcHMpIHRleHR1cmUuZ2VuZXJhdGVNaXBtYXBzID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgaWYgKHRleHR1cmUubWluRmlsdGVyID09PSBnbC5ORUFSRVNUX01JUE1BUF9MSU5FQVIpIHRleHR1cmUubWluRmlsdGVyID0gZ2wuTElORUFSO1xuICAgICAgICAgICAgICAgIGlmICh0ZXh0dXJlLndyYXBTID09PSBnbC5SRVBFQVQpIHRleHR1cmUud3JhcFMgPSB0ZXh0dXJlLndyYXBUID0gZ2wuQ0xBTVBfVE9fRURHRTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGV4dHVyZS5pbWFnZSA9IGltZ0JtcDtcblxuICAgICAgICAgICAgLy8gRm9yIGNyZWF0ZUltYWdlQml0bWFwLCBjbG9zZSBvbmNlIHVwbG9hZGVkXG4gICAgICAgICAgICB0ZXh0dXJlLm9uVXBkYXRlID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChpbWdCbXAuY2xvc2UpIGltZ0JtcC5jbG9zZSgpO1xuICAgICAgICAgICAgICAgIHRleHR1cmUub25VcGRhdGUgPSBudWxsO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgcmV0dXJuIGltZ0JtcDtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgc3RhdGljIGNsZWFyQ2FjaGUoKSB7XG4gICAgICAgIGNhY2hlID0ge307XG4gICAgfVxufVxuXG5mdW5jdGlvbiBkZXRlY3RXZWJQKCkge1xuICAgIHJldHVybiBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKS50b0RhdGFVUkwoJ2ltYWdlL3dlYnAnKS5pbmRleE9mKCdkYXRhOmltYWdlL3dlYnAnKSA9PSAwO1xufVxuXG5mdW5jdGlvbiBwb3dlck9mVHdvKHZhbHVlKSB7XG4gICAgcmV0dXJuIE1hdGgubG9nMih2YWx1ZSkgJSAxID09PSAwO1xufVxuXG5mdW5jdGlvbiBkZWNvZGVJbWFnZShzcmMpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgY29uc3QgaW1nID0gbmV3IEltYWdlKCk7XG4gICAgICAgIGltZy5jcm9zc09yaWdpbiA9ICcnO1xuICAgICAgICBpbWcuc3JjID0gc3JjO1xuXG4gICAgICAgIC8vIE9ubHkgY2hyb21lJ3MgaW1wbGVtZW50YXRpb24gb2YgY3JlYXRlSW1hZ2VCaXRtYXAgaXMgZnVsbHkgc3VwcG9ydGVkXG4gICAgICAgIGNvbnN0IGlzQ2hyb21lID0gbmF2aWdhdG9yLnVzZXJBZ2VudC50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKCdjaHJvbWUnKTtcbiAgICAgICAgaWYgKCEhd2luZG93LmNyZWF0ZUltYWdlQml0bWFwICYmIGlzQ2hyb21lKSB7XG4gICAgICAgICAgICBpbWcub25sb2FkID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgIGNyZWF0ZUltYWdlQml0bWFwKGltZywge1xuICAgICAgICAgICAgICAgICAgICBpbWFnZU9yaWVudGF0aW9uOiAnZmxpcFknLFxuICAgICAgICAgICAgICAgICAgICBwcmVtdWx0aXBseUFscGhhOiAnbm9uZScsXG4gICAgICAgICAgICAgICAgfSkudGhlbigoaW1nQm1wKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoaW1nQm1wKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpbWcub25sb2FkID0gKCkgPT4gcmVzb2x2ZShpbWcpO1xuICAgICAgICB9XG4gICAgfSk7XG59XG4iLCIvLyBodHRwczovL2dpdGh1Yi5jb20vbXJkb29iL3RocmVlLmpzL2Jsb2IvbWFzdGVyL3NyYy9nZW9tZXRyaWVzL1RvcnVzR2VvbWV0cnkuanNcblxuaW1wb3J0IHsgR2VvbWV0cnkgfSBmcm9tICcuLi9jb3JlL0dlb21ldHJ5LmpzJztcbmltcG9ydCB7IFZlYzMgfSBmcm9tICcuLi9tYXRoL1ZlYzMuanMnO1xuXG5leHBvcnQgY2xhc3MgVG9ydXMgZXh0ZW5kcyBHZW9tZXRyeSB7XG4gICAgY29uc3RydWN0b3IoZ2wsIHsgcmFkaXVzID0gMC41LCB0dWJlID0gMC4yLCByYWRpYWxTZWdtZW50cyA9IDgsIHR1YnVsYXJTZWdtZW50cyA9IDYsIGFyYyA9IE1hdGguUEkgKiAyLCBhdHRyaWJ1dGVzID0ge30gfSA9IHt9KSB7XG4gICAgICAgIGNvbnN0IG51bSA9IChyYWRpYWxTZWdtZW50cyArIDEpICogKHR1YnVsYXJTZWdtZW50cyArIDEpO1xuICAgICAgICBjb25zdCBudW1JbmRpY2VzID0gcmFkaWFsU2VnbWVudHMgKiB0dWJ1bGFyU2VnbWVudHMgKiA2O1xuXG4gICAgICAgIGNvbnN0IHZlcnRpY2VzID0gbmV3IEZsb2F0MzJBcnJheShudW0gKiAzKTtcbiAgICAgICAgY29uc3Qgbm9ybWFscyA9IG5ldyBGbG9hdDMyQXJyYXkobnVtICogMyk7XG4gICAgICAgIGNvbnN0IHV2cyA9IG5ldyBGbG9hdDMyQXJyYXkobnVtICogMik7XG4gICAgICAgIGNvbnN0IGluZGljZXMgPSBudW0gPiA2NTUzNiA/IG5ldyBVaW50MzJBcnJheShudW1JbmRpY2VzKSA6IG5ldyBVaW50MTZBcnJheShudW1JbmRpY2VzKTtcblxuICAgICAgICBjb25zdCBjZW50ZXIgPSBuZXcgVmVjMygpO1xuICAgICAgICBjb25zdCB2ZXJ0ZXggPSBuZXcgVmVjMygpO1xuICAgICAgICBjb25zdCBub3JtYWwgPSBuZXcgVmVjMygpO1xuXG4gICAgICAgIC8vIGdlbmVyYXRlIHZlcnRpY2VzLCBub3JtYWxzIGFuZCB1dnNcbiAgICAgICAgbGV0IGlkeCA9IDA7XG4gICAgICAgIGZvciAobGV0IGogPSAwOyBqIDw9IHJhZGlhbFNlZ21lbnRzOyBqKyspIHtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDw9IHR1YnVsYXJTZWdtZW50czsgaSsrLCBpZHgrKykge1xuICAgICAgICAgICAgICAgIGNvbnN0IHUgPSAoaSAvIHR1YnVsYXJTZWdtZW50cykgKiBhcmM7XG4gICAgICAgICAgICAgICAgY29uc3QgdiA9IChqIC8gcmFkaWFsU2VnbWVudHMpICogTWF0aC5QSSAqIDI7XG5cbiAgICAgICAgICAgICAgICAvLyB2ZXJ0ZXhcbiAgICAgICAgICAgICAgICB2ZXJ0ZXgueCA9IChyYWRpdXMgKyB0dWJlICogTWF0aC5jb3ModikpICogTWF0aC5jb3ModSk7XG4gICAgICAgICAgICAgICAgdmVydGV4LnkgPSAocmFkaXVzICsgdHViZSAqIE1hdGguY29zKHYpKSAqIE1hdGguc2luKHUpO1xuICAgICAgICAgICAgICAgIHZlcnRleC56ID0gdHViZSAqIE1hdGguc2luKHYpO1xuXG4gICAgICAgICAgICAgICAgdmVydGljZXMuc2V0KFt2ZXJ0ZXgueCwgdmVydGV4LnksIHZlcnRleC56XSwgaWR4ICogMyk7XG5cbiAgICAgICAgICAgICAgICAvLyBub3JtYWxcbiAgICAgICAgICAgICAgICBjZW50ZXIueCA9IHJhZGl1cyAqIE1hdGguY29zKHUpO1xuICAgICAgICAgICAgICAgIGNlbnRlci55ID0gcmFkaXVzICogTWF0aC5zaW4odSk7XG4gICAgICAgICAgICAgICAgbm9ybWFsLnN1Yih2ZXJ0ZXgsIGNlbnRlcikubm9ybWFsaXplKCk7XG5cbiAgICAgICAgICAgICAgICBub3JtYWxzLnNldChbbm9ybWFsLngsIG5vcm1hbC55LCBub3JtYWwuel0sIGlkeCAqIDMpO1xuXG4gICAgICAgICAgICAgICAgLy8gdXZcbiAgICAgICAgICAgICAgICB1dnMuc2V0KFtpIC8gdHVidWxhclNlZ21lbnRzLCBqIC8gcmFkaWFsU2VnbWVudHNdLCBpZHggKiAyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGdlbmVyYXRlIGluZGljZXNcbiAgICAgICAgaWR4ID0gMDtcbiAgICAgICAgZm9yIChsZXQgaiA9IDE7IGogPD0gcmFkaWFsU2VnbWVudHM7IGorKykge1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDE7IGkgPD0gdHVidWxhclNlZ21lbnRzOyBpKyssIGlkeCsrKSB7XG4gICAgICAgICAgICAgICAgLy8gaW5kaWNlc1xuICAgICAgICAgICAgICAgIGNvbnN0IGEgPSAodHVidWxhclNlZ21lbnRzICsgMSkgKiBqICsgaSAtIDE7XG4gICAgICAgICAgICAgICAgY29uc3QgYiA9ICh0dWJ1bGFyU2VnbWVudHMgKyAxKSAqIChqIC0gMSkgKyBpIC0gMTtcbiAgICAgICAgICAgICAgICBjb25zdCBjID0gKHR1YnVsYXJTZWdtZW50cyArIDEpICogKGogLSAxKSArIGk7XG4gICAgICAgICAgICAgICAgY29uc3QgZCA9ICh0dWJ1bGFyU2VnbWVudHMgKyAxKSAqIGogKyBpO1xuXG4gICAgICAgICAgICAgICAgLy8gZmFjZXNcbiAgICAgICAgICAgICAgICBpbmRpY2VzLnNldChbYSwgYiwgZCwgYiwgYywgZF0sIGlkeCAqIDYpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgT2JqZWN0LmFzc2lnbihhdHRyaWJ1dGVzLCB7XG4gICAgICAgICAgICBwb3NpdGlvbjogeyBzaXplOiAzLCBkYXRhOiB2ZXJ0aWNlcyB9LFxuICAgICAgICAgICAgbm9ybWFsOiB7IHNpemU6IDMsIGRhdGE6IG5vcm1hbHMgfSxcbiAgICAgICAgICAgIHV2OiB7IHNpemU6IDIsIGRhdGE6IHV2cyB9LFxuICAgICAgICAgICAgaW5kZXg6IHsgZGF0YTogaW5kaWNlcyB9LFxuICAgICAgICB9KTtcblxuICAgICAgICBzdXBlcihnbCwgYXR0cmlidXRlcyk7XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgR2VvbWV0cnkgfSBmcm9tICcuLi9jb3JlL0dlb21ldHJ5LmpzJztcblxuZXhwb3J0IGNsYXNzIFRyaWFuZ2xlIGV4dGVuZHMgR2VvbWV0cnkge1xuICAgIGNvbnN0cnVjdG9yKGdsLCB7IGF0dHJpYnV0ZXMgPSB7fSB9ID0ge30pIHtcbiAgICAgICAgT2JqZWN0LmFzc2lnbihhdHRyaWJ1dGVzLCB7XG4gICAgICAgICAgICBwb3NpdGlvbjogeyBzaXplOiAyLCBkYXRhOiBuZXcgRmxvYXQzMkFycmF5KFstMSwgLTEsIDMsIC0xLCAtMSwgM10pIH0sXG4gICAgICAgICAgICB1djogeyBzaXplOiAyLCBkYXRhOiBuZXcgRmxvYXQzMkFycmF5KFswLCAwLCAyLCAwLCAwLCAyXSkgfSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgc3VwZXIoZ2wsIGF0dHJpYnV0ZXMpO1xuICAgIH1cbn1cbiIsImltcG9ydCAqIGFzIENvbG9yRnVuYyBmcm9tICcuL2Z1bmN0aW9ucy9Db2xvckZ1bmMuanMnO1xuXG4vLyBDb2xvciBzdG9yZWQgYXMgYW4gYXJyYXkgb2YgUkdCIGRlY2ltYWwgdmFsdWVzIChiZXR3ZWVuIDAgPiAxKVxuLy8gQ29uc3RydWN0b3IgYW5kIHNldCBtZXRob2QgYWNjZXB0IGZvbGxvd2luZyBmb3JtYXRzOlxuLy8gbmV3IENvbG9yKCkgLSBFbXB0eSAoZGVmYXVsdHMgdG8gYmxhY2spXG4vLyBuZXcgQ29sb3IoWzAuMiwgMC40LCAxLjBdKSAtIERlY2ltYWwgQXJyYXkgKG9yIGFub3RoZXIgQ29sb3IgaW5zdGFuY2UpXG4vLyBuZXcgQ29sb3IoMC43LCAwLjAsIDAuMSkgLSBEZWNpbWFsIFJHQiB2YWx1ZXNcbi8vIG5ldyBDb2xvcignI2ZmMDAwMCcpIC0gSGV4IHN0cmluZ1xuLy8gbmV3IENvbG9yKCcjY2NjJykgLSBTaG9ydC1oYW5kIEhleCBzdHJpbmdcbi8vIG5ldyBDb2xvcigweDRmMjdlOCkgLSBOdW1iZXJcbi8vIG5ldyBDb2xvcigncmVkJykgLSBDb2xvciBuYW1lIHN0cmluZyAoc2hvcnQgbGlzdCBpbiBDb2xvckZ1bmMuanMpXG5cbmV4cG9ydCBjbGFzcyBDb2xvciBleHRlbmRzIEFycmF5IHtcbiAgICBjb25zdHJ1Y3Rvcihjb2xvcikge1xuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShjb2xvcikpIHJldHVybiBzdXBlciguLi5jb2xvcik7XG4gICAgICAgIHJldHVybiBzdXBlciguLi5Db2xvckZ1bmMucGFyc2VDb2xvciguLi5hcmd1bWVudHMpKTtcbiAgICB9XG5cbiAgICBnZXQgcigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXNbMF07XG4gICAgfVxuXG4gICAgZ2V0IGcoKSB7XG4gICAgICAgIHJldHVybiB0aGlzWzFdO1xuICAgIH1cblxuICAgIGdldCBiKCkge1xuICAgICAgICByZXR1cm4gdGhpc1syXTtcbiAgICB9XG5cbiAgICBzZXQgcih2KSB7XG4gICAgICAgIHRoaXNbMF0gPSB2O1xuICAgIH1cblxuICAgIHNldCBnKHYpIHtcbiAgICAgICAgdGhpc1sxXSA9IHY7XG4gICAgfVxuXG4gICAgc2V0IGIodikge1xuICAgICAgICB0aGlzWzJdID0gdjtcbiAgICB9XG5cbiAgICBzZXQoY29sb3IpIHtcbiAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkoY29sb3IpKSByZXR1cm4gdGhpcy5jb3B5KGNvbG9yKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29weShDb2xvckZ1bmMucGFyc2VDb2xvciguLi5hcmd1bWVudHMpKTtcbiAgICB9XG5cbiAgICBjb3B5KHYpIHtcbiAgICAgICAgdGhpc1swXSA9IHZbMF07XG4gICAgICAgIHRoaXNbMV0gPSB2WzFdO1xuICAgICAgICB0aGlzWzJdID0gdlsyXTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxufVxuIiwiaW1wb3J0ICogYXMgRXVsZXJGdW5jIGZyb20gJy4vZnVuY3Rpb25zL0V1bGVyRnVuYy5qcyc7XG5pbXBvcnQgeyBNYXQ0IH0gZnJvbSAnLi9NYXQ0LmpzJztcblxuY29uc3QgdG1wTWF0NCA9IG5ldyBNYXQ0KCk7XG5cbmV4cG9ydCBjbGFzcyBFdWxlciBleHRlbmRzIEFycmF5IHtcbiAgICBjb25zdHJ1Y3Rvcih4ID0gMCwgeSA9IHgsIHogPSB4LCBvcmRlciA9ICdZWFonKSB7XG4gICAgICAgIHN1cGVyKHgsIHksIHopO1xuICAgICAgICB0aGlzLm9yZGVyID0gb3JkZXI7XG4gICAgICAgIHRoaXMub25DaGFuZ2UgPSAoKSA9PiB7fTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgZ2V0IHgoKSB7XG4gICAgICAgIHJldHVybiB0aGlzWzBdO1xuICAgIH1cblxuICAgIGdldCB5KCkge1xuICAgICAgICByZXR1cm4gdGhpc1sxXTtcbiAgICB9XG5cbiAgICBnZXQgeigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXNbMl07XG4gICAgfVxuXG4gICAgc2V0IHgodikge1xuICAgICAgICB0aGlzWzBdID0gdjtcbiAgICAgICAgdGhpcy5vbkNoYW5nZSgpO1xuICAgIH1cblxuICAgIHNldCB5KHYpIHtcbiAgICAgICAgdGhpc1sxXSA9IHY7XG4gICAgICAgIHRoaXMub25DaGFuZ2UoKTtcbiAgICB9XG5cbiAgICBzZXQgeih2KSB7XG4gICAgICAgIHRoaXNbMl0gPSB2O1xuICAgICAgICB0aGlzLm9uQ2hhbmdlKCk7XG4gICAgfVxuXG4gICAgc2V0KHgsIHkgPSB4LCB6ID0geCkge1xuICAgICAgICBpZiAoeC5sZW5ndGgpIHJldHVybiB0aGlzLmNvcHkoeCk7XG4gICAgICAgIHRoaXNbMF0gPSB4O1xuICAgICAgICB0aGlzWzFdID0geTtcbiAgICAgICAgdGhpc1syXSA9IHo7XG4gICAgICAgIHRoaXMub25DaGFuZ2UoKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgY29weSh2KSB7XG4gICAgICAgIHRoaXNbMF0gPSB2WzBdO1xuICAgICAgICB0aGlzWzFdID0gdlsxXTtcbiAgICAgICAgdGhpc1syXSA9IHZbMl07XG4gICAgICAgIHRoaXMub25DaGFuZ2UoKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgcmVvcmRlcihvcmRlcikge1xuICAgICAgICB0aGlzLm9yZGVyID0gb3JkZXI7XG4gICAgICAgIHRoaXMub25DaGFuZ2UoKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgZnJvbVJvdGF0aW9uTWF0cml4KG0sIG9yZGVyID0gdGhpcy5vcmRlcikge1xuICAgICAgICBFdWxlckZ1bmMuZnJvbVJvdGF0aW9uTWF0cml4KHRoaXMsIG0sIG9yZGVyKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgZnJvbVF1YXRlcm5pb24ocSwgb3JkZXIgPSB0aGlzLm9yZGVyKSB7XG4gICAgICAgIHRtcE1hdDQuZnJvbVF1YXRlcm5pb24ocSk7XG4gICAgICAgIHJldHVybiB0aGlzLmZyb21Sb3RhdGlvbk1hdHJpeCh0bXBNYXQ0LCBvcmRlcik7XG4gICAgfVxuXG4gICAgdG9BcnJheShhID0gW10sIG8gPSAwKSB7XG4gICAgICAgIGFbb10gPSB0aGlzWzBdO1xuICAgICAgICBhW28gKyAxXSA9IHRoaXNbMV07XG4gICAgICAgIGFbbyArIDJdID0gdGhpc1syXTtcbiAgICAgICAgcmV0dXJuIGE7XG4gICAgfVxufVxuIiwiaW1wb3J0ICogYXMgTWF0M0Z1bmMgZnJvbSAnLi9mdW5jdGlvbnMvTWF0M0Z1bmMuanMnO1xuXG5leHBvcnQgY2xhc3MgTWF0MyBleHRlbmRzIEFycmF5IHtcbiAgICBjb25zdHJ1Y3RvcihtMDAgPSAxLCBtMDEgPSAwLCBtMDIgPSAwLCBtMTAgPSAwLCBtMTEgPSAxLCBtMTIgPSAwLCBtMjAgPSAwLCBtMjEgPSAwLCBtMjIgPSAxKSB7XG4gICAgICAgIHN1cGVyKG0wMCwgbTAxLCBtMDIsIG0xMCwgbTExLCBtMTIsIG0yMCwgbTIxLCBtMjIpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBzZXQobTAwLCBtMDEsIG0wMiwgbTEwLCBtMTEsIG0xMiwgbTIwLCBtMjEsIG0yMikge1xuICAgICAgICBpZiAobTAwLmxlbmd0aCkgcmV0dXJuIHRoaXMuY29weShtMDApO1xuICAgICAgICBNYXQzRnVuYy5zZXQodGhpcywgbTAwLCBtMDEsIG0wMiwgbTEwLCBtMTEsIG0xMiwgbTIwLCBtMjEsIG0yMik7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHRyYW5zbGF0ZSh2LCBtID0gdGhpcykge1xuICAgICAgICBNYXQzRnVuYy50cmFuc2xhdGUodGhpcywgbSwgdik7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHJvdGF0ZSh2LCBtID0gdGhpcykge1xuICAgICAgICBNYXQzRnVuYy5yb3RhdGUodGhpcywgbSwgdik7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHNjYWxlKHYsIG0gPSB0aGlzKSB7XG4gICAgICAgIE1hdDNGdW5jLnNjYWxlKHRoaXMsIG0sIHYpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBtdWx0aXBseShtYSwgbWIpIHtcbiAgICAgICAgaWYgKG1iKSB7XG4gICAgICAgICAgICBNYXQzRnVuYy5tdWx0aXBseSh0aGlzLCBtYSwgbWIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgTWF0M0Z1bmMubXVsdGlwbHkodGhpcywgdGhpcywgbWEpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGlkZW50aXR5KCkge1xuICAgICAgICBNYXQzRnVuYy5pZGVudGl0eSh0aGlzKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgY29weShtKSB7XG4gICAgICAgIE1hdDNGdW5jLmNvcHkodGhpcywgbSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGZyb21NYXRyaXg0KG0pIHtcbiAgICAgICAgTWF0M0Z1bmMuZnJvbU1hdDQodGhpcywgbSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGZyb21RdWF0ZXJuaW9uKHEpIHtcbiAgICAgICAgTWF0M0Z1bmMuZnJvbVF1YXQodGhpcywgcSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGZyb21CYXNpcyh2ZWMzYSwgdmVjM2IsIHZlYzNjKSB7XG4gICAgICAgIHRoaXMuc2V0KHZlYzNhWzBdLCB2ZWMzYVsxXSwgdmVjM2FbMl0sIHZlYzNiWzBdLCB2ZWMzYlsxXSwgdmVjM2JbMl0sIHZlYzNjWzBdLCB2ZWMzY1sxXSwgdmVjM2NbMl0pO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBpbnZlcnNlKG0gPSB0aGlzKSB7XG4gICAgICAgIE1hdDNGdW5jLmludmVydCh0aGlzLCBtKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgZ2V0Tm9ybWFsTWF0cml4KG0pIHtcbiAgICAgICAgTWF0M0Z1bmMubm9ybWFsRnJvbU1hdDQodGhpcywgbSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbn1cbiIsImltcG9ydCAqIGFzIE1hdDRGdW5jIGZyb20gJy4vZnVuY3Rpb25zL01hdDRGdW5jLmpzJztcblxuZXhwb3J0IGNsYXNzIE1hdDQgZXh0ZW5kcyBBcnJheSB7XG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIG0wMCA9IDEsXG4gICAgICAgIG0wMSA9IDAsXG4gICAgICAgIG0wMiA9IDAsXG4gICAgICAgIG0wMyA9IDAsXG4gICAgICAgIG0xMCA9IDAsXG4gICAgICAgIG0xMSA9IDEsXG4gICAgICAgIG0xMiA9IDAsXG4gICAgICAgIG0xMyA9IDAsXG4gICAgICAgIG0yMCA9IDAsXG4gICAgICAgIG0yMSA9IDAsXG4gICAgICAgIG0yMiA9IDEsXG4gICAgICAgIG0yMyA9IDAsXG4gICAgICAgIG0zMCA9IDAsXG4gICAgICAgIG0zMSA9IDAsXG4gICAgICAgIG0zMiA9IDAsXG4gICAgICAgIG0zMyA9IDFcbiAgICApIHtcbiAgICAgICAgc3VwZXIobTAwLCBtMDEsIG0wMiwgbTAzLCBtMTAsIG0xMSwgbTEyLCBtMTMsIG0yMCwgbTIxLCBtMjIsIG0yMywgbTMwLCBtMzEsIG0zMiwgbTMzKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgZ2V0IHgoKSB7XG4gICAgICAgIHJldHVybiB0aGlzWzEyXTtcbiAgICB9XG5cbiAgICBnZXQgeSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXNbMTNdO1xuICAgIH1cblxuICAgIGdldCB6KCkge1xuICAgICAgICByZXR1cm4gdGhpc1sxNF07XG4gICAgfVxuXG4gICAgZ2V0IHcoKSB7XG4gICAgICAgIHJldHVybiB0aGlzWzE1XTtcbiAgICB9XG5cbiAgICBzZXQgeCh2KSB7XG4gICAgICAgIHRoaXNbMTJdID0gdjtcbiAgICB9XG5cbiAgICBzZXQgeSh2KSB7XG4gICAgICAgIHRoaXNbMTNdID0gdjtcbiAgICB9XG5cbiAgICBzZXQgeih2KSB7XG4gICAgICAgIHRoaXNbMTRdID0gdjtcbiAgICB9XG5cbiAgICBzZXQgdyh2KSB7XG4gICAgICAgIHRoaXNbMTVdID0gdjtcbiAgICB9XG5cbiAgICBzZXQobTAwLCBtMDEsIG0wMiwgbTAzLCBtMTAsIG0xMSwgbTEyLCBtMTMsIG0yMCwgbTIxLCBtMjIsIG0yMywgbTMwLCBtMzEsIG0zMiwgbTMzKSB7XG4gICAgICAgIGlmIChtMDAubGVuZ3RoKSByZXR1cm4gdGhpcy5jb3B5KG0wMCk7XG4gICAgICAgIE1hdDRGdW5jLnNldCh0aGlzLCBtMDAsIG0wMSwgbTAyLCBtMDMsIG0xMCwgbTExLCBtMTIsIG0xMywgbTIwLCBtMjEsIG0yMiwgbTIzLCBtMzAsIG0zMSwgbTMyLCBtMzMpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICB0cmFuc2xhdGUodiwgbSA9IHRoaXMpIHtcbiAgICAgICAgTWF0NEZ1bmMudHJhbnNsYXRlKHRoaXMsIG0sIHYpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICByb3RhdGUodiwgYXhpcywgbSA9IHRoaXMpIHtcbiAgICAgICAgTWF0NEZ1bmMucm90YXRlKHRoaXMsIG0sIHYsIGF4aXMpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBzY2FsZSh2LCBtID0gdGhpcykge1xuICAgICAgICBNYXQ0RnVuYy5zY2FsZSh0aGlzLCBtLCB0eXBlb2YgdiA9PT0gJ251bWJlcicgPyBbdiwgdiwgdl0gOiB2KTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgbXVsdGlwbHkobWEsIG1iKSB7XG4gICAgICAgIGlmIChtYikge1xuICAgICAgICAgICAgTWF0NEZ1bmMubXVsdGlwbHkodGhpcywgbWEsIG1iKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIE1hdDRGdW5jLm11bHRpcGx5KHRoaXMsIHRoaXMsIG1hKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBpZGVudGl0eSgpIHtcbiAgICAgICAgTWF0NEZ1bmMuaWRlbnRpdHkodGhpcyk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGNvcHkobSkge1xuICAgICAgICBNYXQ0RnVuYy5jb3B5KHRoaXMsIG0pO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBmcm9tUGVyc3BlY3RpdmVGcnVzdHJ1bSh7IGxlZnQsIHJpZ2h0LCBib3R0b20sIHRvcCwgbmVhciwgZmFyIH0pIHtcbiAgICAgICAgTWF0NEZ1bmMucGVyc3BlY3RpdmVGcnVzdHJ1bSh0aGlzLCBsZWZ0LCByaWdodCwgdG9wLCBib3R0b20sIG5lYXIsIGZhcik7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGZyb21QZXJzcGVjdGl2ZSh7IGZvdiwgYXNwZWN0LCBuZWFyLCBmYXIgfSA9IHt9KSB7XG4gICAgICAgIE1hdDRGdW5jLnBlcnNwZWN0aXZlKHRoaXMsIGZvdiwgYXNwZWN0LCBuZWFyLCBmYXIpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBmcm9tT3J0aG9nb25hbCh7IGxlZnQsIHJpZ2h0LCBib3R0b20sIHRvcCwgbmVhciwgZmFyIH0pIHtcbiAgICAgICAgTWF0NEZ1bmMub3J0aG8odGhpcywgbGVmdCwgcmlnaHQsIGJvdHRvbSwgdG9wLCBuZWFyLCBmYXIpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBmcm9tUXVhdGVybmlvbihxKSB7XG4gICAgICAgIE1hdDRGdW5jLmZyb21RdWF0KHRoaXMsIHEpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBzZXRQb3NpdGlvbih2KSB7XG4gICAgICAgIHRoaXMueCA9IHZbMF07XG4gICAgICAgIHRoaXMueSA9IHZbMV07XG4gICAgICAgIHRoaXMueiA9IHZbMl07XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGludmVyc2UobSA9IHRoaXMpIHtcbiAgICAgICAgTWF0NEZ1bmMuaW52ZXJ0KHRoaXMsIG0pO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBjb21wb3NlKHEsIHBvcywgc2NhbGUpIHtcbiAgICAgICAgTWF0NEZ1bmMuZnJvbVJvdGF0aW9uVHJhbnNsYXRpb25TY2FsZSh0aGlzLCBxLCBwb3MsIHNjYWxlKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgZ2V0Um90YXRpb24ocSkge1xuICAgICAgICBNYXQ0RnVuYy5nZXRSb3RhdGlvbihxLCB0aGlzKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgZ2V0VHJhbnNsYXRpb24ocG9zKSB7XG4gICAgICAgIE1hdDRGdW5jLmdldFRyYW5zbGF0aW9uKHBvcywgdGhpcyk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGdldFNjYWxpbmcoc2NhbGUpIHtcbiAgICAgICAgTWF0NEZ1bmMuZ2V0U2NhbGluZyhzY2FsZSwgdGhpcyk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGdldE1heFNjYWxlT25BeGlzKCkge1xuICAgICAgICByZXR1cm4gTWF0NEZ1bmMuZ2V0TWF4U2NhbGVPbkF4aXModGhpcyk7XG4gICAgfVxuXG4gICAgbG9va0F0KGV5ZSwgdGFyZ2V0LCB1cCkge1xuICAgICAgICBNYXQ0RnVuYy50YXJnZXRUbyh0aGlzLCBleWUsIHRhcmdldCwgdXApO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBkZXRlcm1pbmFudCgpIHtcbiAgICAgICAgcmV0dXJuIE1hdDRGdW5jLmRldGVybWluYW50KHRoaXMpO1xuICAgIH1cblxuICAgIGZyb21BcnJheShhLCBvID0gMCkge1xuICAgICAgICB0aGlzWzBdID0gYVtvXTtcbiAgICAgICAgdGhpc1sxXSA9IGFbbyArIDFdO1xuICAgICAgICB0aGlzWzJdID0gYVtvICsgMl07XG4gICAgICAgIHRoaXNbM10gPSBhW28gKyAzXTtcbiAgICAgICAgdGhpc1s0XSA9IGFbbyArIDRdO1xuICAgICAgICB0aGlzWzVdID0gYVtvICsgNV07XG4gICAgICAgIHRoaXNbNl0gPSBhW28gKyA2XTtcbiAgICAgICAgdGhpc1s3XSA9IGFbbyArIDddO1xuICAgICAgICB0aGlzWzhdID0gYVtvICsgOF07XG4gICAgICAgIHRoaXNbOV0gPSBhW28gKyA5XTtcbiAgICAgICAgdGhpc1sxMF0gPSBhW28gKyAxMF07XG4gICAgICAgIHRoaXNbMTFdID0gYVtvICsgMTFdO1xuICAgICAgICB0aGlzWzEyXSA9IGFbbyArIDEyXTtcbiAgICAgICAgdGhpc1sxM10gPSBhW28gKyAxM107XG4gICAgICAgIHRoaXNbMTRdID0gYVtvICsgMTRdO1xuICAgICAgICB0aGlzWzE1XSA9IGFbbyArIDE1XTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgdG9BcnJheShhID0gW10sIG8gPSAwKSB7XG4gICAgICAgIGFbb10gPSB0aGlzWzBdO1xuICAgICAgICBhW28gKyAxXSA9IHRoaXNbMV07XG4gICAgICAgIGFbbyArIDJdID0gdGhpc1syXTtcbiAgICAgICAgYVtvICsgM10gPSB0aGlzWzNdO1xuICAgICAgICBhW28gKyA0XSA9IHRoaXNbNF07XG4gICAgICAgIGFbbyArIDVdID0gdGhpc1s1XTtcbiAgICAgICAgYVtvICsgNl0gPSB0aGlzWzZdO1xuICAgICAgICBhW28gKyA3XSA9IHRoaXNbN107XG4gICAgICAgIGFbbyArIDhdID0gdGhpc1s4XTtcbiAgICAgICAgYVtvICsgOV0gPSB0aGlzWzldO1xuICAgICAgICBhW28gKyAxMF0gPSB0aGlzWzEwXTtcbiAgICAgICAgYVtvICsgMTFdID0gdGhpc1sxMV07XG4gICAgICAgIGFbbyArIDEyXSA9IHRoaXNbMTJdO1xuICAgICAgICBhW28gKyAxM10gPSB0aGlzWzEzXTtcbiAgICAgICAgYVtvICsgMTRdID0gdGhpc1sxNF07XG4gICAgICAgIGFbbyArIDE1XSA9IHRoaXNbMTVdO1xuICAgICAgICByZXR1cm4gYTtcbiAgICB9XG59XG4iLCJpbXBvcnQgKiBhcyBRdWF0RnVuYyBmcm9tICcuL2Z1bmN0aW9ucy9RdWF0RnVuYy5qcyc7XG5cbmV4cG9ydCBjbGFzcyBRdWF0IGV4dGVuZHMgQXJyYXkge1xuICAgIGNvbnN0cnVjdG9yKHggPSAwLCB5ID0gMCwgeiA9IDAsIHcgPSAxKSB7XG4gICAgICAgIHN1cGVyKHgsIHksIHosIHcpO1xuICAgICAgICB0aGlzLm9uQ2hhbmdlID0gKCkgPT4ge307XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGdldCB4KCkge1xuICAgICAgICByZXR1cm4gdGhpc1swXTtcbiAgICB9XG5cbiAgICBnZXQgeSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXNbMV07XG4gICAgfVxuXG4gICAgZ2V0IHooKSB7XG4gICAgICAgIHJldHVybiB0aGlzWzJdO1xuICAgIH1cblxuICAgIGdldCB3KCkge1xuICAgICAgICByZXR1cm4gdGhpc1szXTtcbiAgICB9XG5cbiAgICBzZXQgeCh2KSB7XG4gICAgICAgIHRoaXNbMF0gPSB2O1xuICAgICAgICB0aGlzLm9uQ2hhbmdlKCk7XG4gICAgfVxuXG4gICAgc2V0IHkodikge1xuICAgICAgICB0aGlzWzFdID0gdjtcbiAgICAgICAgdGhpcy5vbkNoYW5nZSgpO1xuICAgIH1cblxuICAgIHNldCB6KHYpIHtcbiAgICAgICAgdGhpc1syXSA9IHY7XG4gICAgICAgIHRoaXMub25DaGFuZ2UoKTtcbiAgICB9XG5cbiAgICBzZXQgdyh2KSB7XG4gICAgICAgIHRoaXNbM10gPSB2O1xuICAgICAgICB0aGlzLm9uQ2hhbmdlKCk7XG4gICAgfVxuXG4gICAgaWRlbnRpdHkoKSB7XG4gICAgICAgIFF1YXRGdW5jLmlkZW50aXR5KHRoaXMpO1xuICAgICAgICB0aGlzLm9uQ2hhbmdlKCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHNldCh4LCB5LCB6LCB3KSB7XG4gICAgICAgIGlmICh4Lmxlbmd0aCkgcmV0dXJuIHRoaXMuY29weSh4KTtcbiAgICAgICAgUXVhdEZ1bmMuc2V0KHRoaXMsIHgsIHksIHosIHcpO1xuICAgICAgICB0aGlzLm9uQ2hhbmdlKCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHJvdGF0ZVgoYSkge1xuICAgICAgICBRdWF0RnVuYy5yb3RhdGVYKHRoaXMsIHRoaXMsIGEpO1xuICAgICAgICB0aGlzLm9uQ2hhbmdlKCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHJvdGF0ZVkoYSkge1xuICAgICAgICBRdWF0RnVuYy5yb3RhdGVZKHRoaXMsIHRoaXMsIGEpO1xuICAgICAgICB0aGlzLm9uQ2hhbmdlKCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHJvdGF0ZVooYSkge1xuICAgICAgICBRdWF0RnVuYy5yb3RhdGVaKHRoaXMsIHRoaXMsIGEpO1xuICAgICAgICB0aGlzLm9uQ2hhbmdlKCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGludmVyc2UocSA9IHRoaXMpIHtcbiAgICAgICAgUXVhdEZ1bmMuaW52ZXJ0KHRoaXMsIHEpO1xuICAgICAgICB0aGlzLm9uQ2hhbmdlKCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGNvbmp1Z2F0ZShxID0gdGhpcykge1xuICAgICAgICBRdWF0RnVuYy5jb25qdWdhdGUodGhpcywgcSk7XG4gICAgICAgIHRoaXMub25DaGFuZ2UoKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgY29weShxKSB7XG4gICAgICAgIFF1YXRGdW5jLmNvcHkodGhpcywgcSk7XG4gICAgICAgIHRoaXMub25DaGFuZ2UoKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgbm9ybWFsaXplKHEgPSB0aGlzKSB7XG4gICAgICAgIFF1YXRGdW5jLm5vcm1hbGl6ZSh0aGlzLCBxKTtcbiAgICAgICAgdGhpcy5vbkNoYW5nZSgpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBtdWx0aXBseShxQSwgcUIpIHtcbiAgICAgICAgaWYgKHFCKSB7XG4gICAgICAgICAgICBRdWF0RnVuYy5tdWx0aXBseSh0aGlzLCBxQSwgcUIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgUXVhdEZ1bmMubXVsdGlwbHkodGhpcywgdGhpcywgcUEpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMub25DaGFuZ2UoKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgZG90KHYpIHtcbiAgICAgICAgcmV0dXJuIFF1YXRGdW5jLmRvdCh0aGlzLCB2KTtcbiAgICB9XG5cbiAgICBmcm9tTWF0cml4MyhtYXRyaXgzKSB7XG4gICAgICAgIFF1YXRGdW5jLmZyb21NYXQzKHRoaXMsIG1hdHJpeDMpO1xuICAgICAgICB0aGlzLm9uQ2hhbmdlKCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGZyb21FdWxlcihldWxlcikge1xuICAgICAgICBRdWF0RnVuYy5mcm9tRXVsZXIodGhpcywgZXVsZXIsIGV1bGVyLm9yZGVyKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgZnJvbUF4aXNBbmdsZShheGlzLCBhKSB7XG4gICAgICAgIFF1YXRGdW5jLnNldEF4aXNBbmdsZSh0aGlzLCBheGlzLCBhKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgc2xlcnAocSwgdCkge1xuICAgICAgICBRdWF0RnVuYy5zbGVycCh0aGlzLCB0aGlzLCBxLCB0KTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgZnJvbUFycmF5KGEsIG8gPSAwKSB7XG4gICAgICAgIHRoaXNbMF0gPSBhW29dO1xuICAgICAgICB0aGlzWzFdID0gYVtvICsgMV07XG4gICAgICAgIHRoaXNbMl0gPSBhW28gKyAyXTtcbiAgICAgICAgdGhpc1szXSA9IGFbbyArIDNdO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICB0b0FycmF5KGEgPSBbXSwgbyA9IDApIHtcbiAgICAgICAgYVtvXSA9IHRoaXNbMF07XG4gICAgICAgIGFbbyArIDFdID0gdGhpc1sxXTtcbiAgICAgICAgYVtvICsgMl0gPSB0aGlzWzJdO1xuICAgICAgICBhW28gKyAzXSA9IHRoaXNbM107XG4gICAgICAgIHJldHVybiBhO1xuICAgIH1cbn1cbiIsImltcG9ydCAqIGFzIFZlYzJGdW5jIGZyb20gJy4vZnVuY3Rpb25zL1ZlYzJGdW5jLmpzJztcblxuZXhwb3J0IGNsYXNzIFZlYzIgZXh0ZW5kcyBBcnJheSB7XG4gICAgY29uc3RydWN0b3IoeCA9IDAsIHkgPSB4KSB7XG4gICAgICAgIHN1cGVyKHgsIHkpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBnZXQgeCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXNbMF07XG4gICAgfVxuXG4gICAgZ2V0IHkoKSB7XG4gICAgICAgIHJldHVybiB0aGlzWzFdO1xuICAgIH1cblxuICAgIHNldCB4KHYpIHtcbiAgICAgICAgdGhpc1swXSA9IHY7XG4gICAgfVxuXG4gICAgc2V0IHkodikge1xuICAgICAgICB0aGlzWzFdID0gdjtcbiAgICB9XG5cbiAgICBzZXQoeCwgeSA9IHgpIHtcbiAgICAgICAgaWYgKHgubGVuZ3RoKSByZXR1cm4gdGhpcy5jb3B5KHgpO1xuICAgICAgICBWZWMyRnVuYy5zZXQodGhpcywgeCwgeSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGNvcHkodikge1xuICAgICAgICBWZWMyRnVuYy5jb3B5KHRoaXMsIHYpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBhZGQodmEsIHZiKSB7XG4gICAgICAgIGlmICh2YikgVmVjMkZ1bmMuYWRkKHRoaXMsIHZhLCB2Yik7XG4gICAgICAgIGVsc2UgVmVjMkZ1bmMuYWRkKHRoaXMsIHRoaXMsIHZhKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgc3ViKHZhLCB2Yikge1xuICAgICAgICBpZiAodmIpIFZlYzJGdW5jLnN1YnRyYWN0KHRoaXMsIHZhLCB2Yik7XG4gICAgICAgIGVsc2UgVmVjMkZ1bmMuc3VidHJhY3QodGhpcywgdGhpcywgdmEpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBtdWx0aXBseSh2KSB7XG4gICAgICAgIGlmICh2Lmxlbmd0aCkgVmVjMkZ1bmMubXVsdGlwbHkodGhpcywgdGhpcywgdik7XG4gICAgICAgIGVsc2UgVmVjMkZ1bmMuc2NhbGUodGhpcywgdGhpcywgdik7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGRpdmlkZSh2KSB7XG4gICAgICAgIGlmICh2Lmxlbmd0aCkgVmVjMkZ1bmMuZGl2aWRlKHRoaXMsIHRoaXMsIHYpO1xuICAgICAgICBlbHNlIFZlYzJGdW5jLnNjYWxlKHRoaXMsIHRoaXMsIDEgLyB2KTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgaW52ZXJzZSh2ID0gdGhpcykge1xuICAgICAgICBWZWMyRnVuYy5pbnZlcnNlKHRoaXMsIHYpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvLyBDYW4ndCB1c2UgJ2xlbmd0aCcgYXMgQXJyYXkucHJvdG90eXBlIHVzZXMgaXRcbiAgICBsZW4oKSB7XG4gICAgICAgIHJldHVybiBWZWMyRnVuYy5sZW5ndGgodGhpcyk7XG4gICAgfVxuXG4gICAgZGlzdGFuY2Uodikge1xuICAgICAgICBpZiAodikgcmV0dXJuIFZlYzJGdW5jLmRpc3RhbmNlKHRoaXMsIHYpO1xuICAgICAgICBlbHNlIHJldHVybiBWZWMyRnVuYy5sZW5ndGgodGhpcyk7XG4gICAgfVxuXG4gICAgc3F1YXJlZExlbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc3F1YXJlZERpc3RhbmNlKCk7XG4gICAgfVxuXG4gICAgc3F1YXJlZERpc3RhbmNlKHYpIHtcbiAgICAgICAgaWYgKHYpIHJldHVybiBWZWMyRnVuYy5zcXVhcmVkRGlzdGFuY2UodGhpcywgdik7XG4gICAgICAgIGVsc2UgcmV0dXJuIFZlYzJGdW5jLnNxdWFyZWRMZW5ndGgodGhpcyk7XG4gICAgfVxuXG4gICAgbmVnYXRlKHYgPSB0aGlzKSB7XG4gICAgICAgIFZlYzJGdW5jLm5lZ2F0ZSh0aGlzLCB2KTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgY3Jvc3ModmEsIHZiKSB7XG4gICAgICAgIGlmICh2YikgcmV0dXJuIFZlYzJGdW5jLmNyb3NzKHZhLCB2Yik7XG4gICAgICAgIHJldHVybiBWZWMyRnVuYy5jcm9zcyh0aGlzLCB2YSk7XG4gICAgfVxuXG4gICAgc2NhbGUodikge1xuICAgICAgICBWZWMyRnVuYy5zY2FsZSh0aGlzLCB0aGlzLCB2KTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgbm9ybWFsaXplKCkge1xuICAgICAgICBWZWMyRnVuYy5ub3JtYWxpemUodGhpcywgdGhpcyk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGRvdCh2KSB7XG4gICAgICAgIHJldHVybiBWZWMyRnVuYy5kb3QodGhpcywgdik7XG4gICAgfVxuXG4gICAgZXF1YWxzKHYpIHtcbiAgICAgICAgcmV0dXJuIFZlYzJGdW5jLmV4YWN0RXF1YWxzKHRoaXMsIHYpO1xuICAgIH1cblxuICAgIGFwcGx5TWF0cml4MyhtYXQzKSB7XG4gICAgICAgIFZlYzJGdW5jLnRyYW5zZm9ybU1hdDModGhpcywgdGhpcywgbWF0Myk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGFwcGx5TWF0cml4NChtYXQ0KSB7XG4gICAgICAgIFZlYzJGdW5jLnRyYW5zZm9ybU1hdDQodGhpcywgdGhpcywgbWF0NCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGxlcnAodiwgYSkge1xuICAgICAgICBWZWMyRnVuYy5sZXJwKHRoaXMsIHRoaXMsIHYsIGEpO1xuICAgIH1cblxuICAgIGNsb25lKCkge1xuICAgICAgICByZXR1cm4gbmV3IFZlYzIodGhpc1swXSwgdGhpc1sxXSk7XG4gICAgfVxuXG4gICAgZnJvbUFycmF5KGEsIG8gPSAwKSB7XG4gICAgICAgIHRoaXNbMF0gPSBhW29dO1xuICAgICAgICB0aGlzWzFdID0gYVtvICsgMV07XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHRvQXJyYXkoYSA9IFtdLCBvID0gMCkge1xuICAgICAgICBhW29dID0gdGhpc1swXTtcbiAgICAgICAgYVtvICsgMV0gPSB0aGlzWzFdO1xuICAgICAgICByZXR1cm4gYTtcbiAgICB9XG59XG4iLCJpbXBvcnQgKiBhcyBWZWMzRnVuYyBmcm9tICcuL2Z1bmN0aW9ucy9WZWMzRnVuYy5qcyc7XG5cbmV4cG9ydCBjbGFzcyBWZWMzIGV4dGVuZHMgQXJyYXkge1xuICAgIGNvbnN0cnVjdG9yKHggPSAwLCB5ID0geCwgeiA9IHgpIHtcbiAgICAgICAgc3VwZXIoeCwgeSwgeik7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGdldCB4KCkge1xuICAgICAgICByZXR1cm4gdGhpc1swXTtcbiAgICB9XG5cbiAgICBnZXQgeSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXNbMV07XG4gICAgfVxuXG4gICAgZ2V0IHooKSB7XG4gICAgICAgIHJldHVybiB0aGlzWzJdO1xuICAgIH1cblxuICAgIHNldCB4KHYpIHtcbiAgICAgICAgdGhpc1swXSA9IHY7XG4gICAgfVxuXG4gICAgc2V0IHkodikge1xuICAgICAgICB0aGlzWzFdID0gdjtcbiAgICB9XG5cbiAgICBzZXQgeih2KSB7XG4gICAgICAgIHRoaXNbMl0gPSB2O1xuICAgIH1cblxuICAgIHNldCh4LCB5ID0geCwgeiA9IHgpIHtcbiAgICAgICAgaWYgKHgubGVuZ3RoKSByZXR1cm4gdGhpcy5jb3B5KHgpO1xuICAgICAgICBWZWMzRnVuYy5zZXQodGhpcywgeCwgeSwgeik7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGNvcHkodikge1xuICAgICAgICBWZWMzRnVuYy5jb3B5KHRoaXMsIHYpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBhZGQodmEsIHZiKSB7XG4gICAgICAgIGlmICh2YikgVmVjM0Z1bmMuYWRkKHRoaXMsIHZhLCB2Yik7XG4gICAgICAgIGVsc2UgVmVjM0Z1bmMuYWRkKHRoaXMsIHRoaXMsIHZhKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgc3ViKHZhLCB2Yikge1xuICAgICAgICBpZiAodmIpIFZlYzNGdW5jLnN1YnRyYWN0KHRoaXMsIHZhLCB2Yik7XG4gICAgICAgIGVsc2UgVmVjM0Z1bmMuc3VidHJhY3QodGhpcywgdGhpcywgdmEpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBtdWx0aXBseSh2KSB7XG4gICAgICAgIGlmICh2Lmxlbmd0aCkgVmVjM0Z1bmMubXVsdGlwbHkodGhpcywgdGhpcywgdik7XG4gICAgICAgIGVsc2UgVmVjM0Z1bmMuc2NhbGUodGhpcywgdGhpcywgdik7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGRpdmlkZSh2KSB7XG4gICAgICAgIGlmICh2Lmxlbmd0aCkgVmVjM0Z1bmMuZGl2aWRlKHRoaXMsIHRoaXMsIHYpO1xuICAgICAgICBlbHNlIFZlYzNGdW5jLnNjYWxlKHRoaXMsIHRoaXMsIDEgLyB2KTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgaW52ZXJzZSh2ID0gdGhpcykge1xuICAgICAgICBWZWMzRnVuYy5pbnZlcnNlKHRoaXMsIHYpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvLyBDYW4ndCB1c2UgJ2xlbmd0aCcgYXMgQXJyYXkucHJvdG90eXBlIHVzZXMgaXRcbiAgICBsZW4oKSB7XG4gICAgICAgIHJldHVybiBWZWMzRnVuYy5sZW5ndGgodGhpcyk7XG4gICAgfVxuXG4gICAgZGlzdGFuY2Uodikge1xuICAgICAgICBpZiAodikgcmV0dXJuIFZlYzNGdW5jLmRpc3RhbmNlKHRoaXMsIHYpO1xuICAgICAgICBlbHNlIHJldHVybiBWZWMzRnVuYy5sZW5ndGgodGhpcyk7XG4gICAgfVxuXG4gICAgc3F1YXJlZExlbigpIHtcbiAgICAgICAgcmV0dXJuIFZlYzNGdW5jLnNxdWFyZWRMZW5ndGgodGhpcyk7XG4gICAgfVxuXG4gICAgc3F1YXJlZERpc3RhbmNlKHYpIHtcbiAgICAgICAgaWYgKHYpIHJldHVybiBWZWMzRnVuYy5zcXVhcmVkRGlzdGFuY2UodGhpcywgdik7XG4gICAgICAgIGVsc2UgcmV0dXJuIFZlYzNGdW5jLnNxdWFyZWRMZW5ndGgodGhpcyk7XG4gICAgfVxuXG4gICAgbmVnYXRlKHYgPSB0aGlzKSB7XG4gICAgICAgIFZlYzNGdW5jLm5lZ2F0ZSh0aGlzLCB2KTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgY3Jvc3ModmEsIHZiKSB7XG4gICAgICAgIGlmICh2YikgVmVjM0Z1bmMuY3Jvc3ModGhpcywgdmEsIHZiKTtcbiAgICAgICAgZWxzZSBWZWMzRnVuYy5jcm9zcyh0aGlzLCB0aGlzLCB2YSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHNjYWxlKHYpIHtcbiAgICAgICAgVmVjM0Z1bmMuc2NhbGUodGhpcywgdGhpcywgdik7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIG5vcm1hbGl6ZSgpIHtcbiAgICAgICAgVmVjM0Z1bmMubm9ybWFsaXplKHRoaXMsIHRoaXMpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBkb3Qodikge1xuICAgICAgICByZXR1cm4gVmVjM0Z1bmMuZG90KHRoaXMsIHYpO1xuICAgIH1cblxuICAgIGVxdWFscyh2KSB7XG4gICAgICAgIHJldHVybiBWZWMzRnVuYy5leGFjdEVxdWFscyh0aGlzLCB2KTtcbiAgICB9XG5cbiAgICBhcHBseU1hdHJpeDQobWF0NCkge1xuICAgICAgICBWZWMzRnVuYy50cmFuc2Zvcm1NYXQ0KHRoaXMsIHRoaXMsIG1hdDQpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBzY2FsZVJvdGF0ZU1hdHJpeDQobWF0NCkge1xuICAgICAgICBWZWMzRnVuYy5zY2FsZVJvdGF0ZU1hdDQodGhpcywgdGhpcywgbWF0NCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGFwcGx5UXVhdGVybmlvbihxKSB7XG4gICAgICAgIFZlYzNGdW5jLnRyYW5zZm9ybVF1YXQodGhpcywgdGhpcywgcSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGFuZ2xlKHYpIHtcbiAgICAgICAgcmV0dXJuIFZlYzNGdW5jLmFuZ2xlKHRoaXMsIHYpO1xuICAgIH1cblxuICAgIGxlcnAodiwgdCkge1xuICAgICAgICBWZWMzRnVuYy5sZXJwKHRoaXMsIHRoaXMsIHYsIHQpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBjbG9uZSgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBWZWMzKHRoaXNbMF0sIHRoaXNbMV0sIHRoaXNbMl0pO1xuICAgIH1cblxuICAgIGZyb21BcnJheShhLCBvID0gMCkge1xuICAgICAgICB0aGlzWzBdID0gYVtvXTtcbiAgICAgICAgdGhpc1sxXSA9IGFbbyArIDFdO1xuICAgICAgICB0aGlzWzJdID0gYVtvICsgMl07XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHRvQXJyYXkoYSA9IFtdLCBvID0gMCkge1xuICAgICAgICBhW29dID0gdGhpc1swXTtcbiAgICAgICAgYVtvICsgMV0gPSB0aGlzWzFdO1xuICAgICAgICBhW28gKyAyXSA9IHRoaXNbMl07XG4gICAgICAgIHJldHVybiBhO1xuICAgIH1cblxuICAgIHRyYW5zZm9ybURpcmVjdGlvbihtYXQ0KSB7XG4gICAgICAgIGNvbnN0IHggPSB0aGlzWzBdO1xuICAgICAgICBjb25zdCB5ID0gdGhpc1sxXTtcbiAgICAgICAgY29uc3QgeiA9IHRoaXNbMl07XG5cbiAgICAgICAgdGhpc1swXSA9IG1hdDRbMF0gKiB4ICsgbWF0NFs0XSAqIHkgKyBtYXQ0WzhdICogejtcbiAgICAgICAgdGhpc1sxXSA9IG1hdDRbMV0gKiB4ICsgbWF0NFs1XSAqIHkgKyBtYXQ0WzldICogejtcbiAgICAgICAgdGhpc1syXSA9IG1hdDRbMl0gKiB4ICsgbWF0NFs2XSAqIHkgKyBtYXQ0WzEwXSAqIHo7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMubm9ybWFsaXplKCk7XG4gICAgfVxufVxuIiwiaW1wb3J0ICogYXMgVmVjNEZ1bmMgZnJvbSAnLi9mdW5jdGlvbnMvVmVjNEZ1bmMuanMnO1xuXG5leHBvcnQgY2xhc3MgVmVjNCBleHRlbmRzIEFycmF5IHtcbiAgICBjb25zdHJ1Y3Rvcih4ID0gMCwgeSA9IHgsIHogPSB4LCB3ID0geCkge1xuICAgICAgICBzdXBlcih4LCB5LCB6LCB3KTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgZ2V0IHgoKSB7XG4gICAgICAgIHJldHVybiB0aGlzWzBdO1xuICAgIH1cblxuICAgIGdldCB5KCkge1xuICAgICAgICByZXR1cm4gdGhpc1sxXTtcbiAgICB9XG5cbiAgICBnZXQgeigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXNbMl07XG4gICAgfVxuXG4gICAgZ2V0IHcoKSB7XG4gICAgICAgIHJldHVybiB0aGlzWzNdO1xuICAgIH1cblxuICAgIHNldCB4KHYpIHtcbiAgICAgICAgdGhpc1swXSA9IHY7XG4gICAgfVxuXG4gICAgc2V0IHkodikge1xuICAgICAgICB0aGlzWzFdID0gdjtcbiAgICB9XG5cbiAgICBzZXQgeih2KSB7XG4gICAgICAgIHRoaXNbMl0gPSB2O1xuICAgIH1cblxuICAgIHNldCB3KHYpIHtcbiAgICAgICAgdGhpc1szXSA9IHY7XG4gICAgfVxuXG4gICAgc2V0KHgsIHksIHosIHcpIHtcbiAgICAgICAgaWYgKHgubGVuZ3RoKSByZXR1cm4gdGhpcy5jb3B5KHgpO1xuICAgICAgICBWZWM0RnVuYy5zZXQodGhpcywgeCwgeSwgeiwgdyk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGNvcHkodikge1xuICAgICAgICBWZWM0RnVuYy5jb3B5KHRoaXMsIHYpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBub3JtYWxpemUoKSB7XG4gICAgICAgIFZlYzRGdW5jLm5vcm1hbGl6ZSh0aGlzLCB0aGlzKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgZnJvbUFycmF5KGEsIG8gPSAwKSB7XG4gICAgICAgIHRoaXNbMF0gPSBhW29dO1xuICAgICAgICB0aGlzWzFdID0gYVtvICsgMV07XG4gICAgICAgIHRoaXNbMl0gPSBhW28gKyAyXTtcbiAgICAgICAgdGhpc1szXSA9IGFbbyArIDNdO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICB0b0FycmF5KGEgPSBbXSwgbyA9IDApIHtcbiAgICAgICAgYVtvXSA9IHRoaXNbMF07XG4gICAgICAgIGFbbyArIDFdID0gdGhpc1sxXTtcbiAgICAgICAgYVtvICsgMl0gPSB0aGlzWzJdO1xuICAgICAgICBhW28gKyAzXSA9IHRoaXNbM107XG4gICAgICAgIHJldHVybiBhO1xuICAgIH1cbn1cbiIsImNvbnN0IE5BTUVTID0ge1xuICAgIGJsYWNrOiAnIzAwMDAwMCcsXG4gICAgd2hpdGU6ICcjZmZmZmZmJyxcbiAgICByZWQ6ICcjZmYwMDAwJyxcbiAgICBncmVlbjogJyMwMGZmMDAnLFxuICAgIGJsdWU6ICcjMDAwMGZmJyxcbiAgICBmdWNoc2lhOiAnI2ZmMDBmZicsXG4gICAgY3lhbjogJyMwMGZmZmYnLFxuICAgIHllbGxvdzogJyNmZmZmMDAnLFxuICAgIG9yYW5nZTogJyNmZjgwMDAnLFxufTtcblxuZXhwb3J0IGZ1bmN0aW9uIGhleFRvUkdCKGhleCkge1xuICAgIGlmIChoZXgubGVuZ3RoID09PSA0KSBoZXggPSBoZXhbMF0gKyBoZXhbMV0gKyBoZXhbMV0gKyBoZXhbMl0gKyBoZXhbMl0gKyBoZXhbM10gKyBoZXhbM107XG4gICAgY29uc3QgcmdiID0gL14jPyhbYS1mXFxkXXsyfSkoW2EtZlxcZF17Mn0pKFthLWZcXGRdezJ9KSQvaS5leGVjKGhleCk7XG4gICAgaWYgKCFyZ2IpIGNvbnNvbGUud2FybihgVW5hYmxlIHRvIGNvbnZlcnQgaGV4IHN0cmluZyAke2hleH0gdG8gcmdiIHZhbHVlc2ApO1xuICAgIHJldHVybiBbcGFyc2VJbnQocmdiWzFdLCAxNikgLyAyNTUsIHBhcnNlSW50KHJnYlsyXSwgMTYpIC8gMjU1LCBwYXJzZUludChyZ2JbM10sIDE2KSAvIDI1NV07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBudW1iZXJUb1JHQihudW0pIHtcbiAgICBudW0gPSBwYXJzZUludChudW0pO1xuICAgIHJldHVybiBbKChudW0gPj4gMTYpICYgMjU1KSAvIDI1NSwgKChudW0gPj4gOCkgJiAyNTUpIC8gMjU1LCAobnVtICYgMjU1KSAvIDI1NV07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZUNvbG9yKGNvbG9yKSB7XG4gICAgLy8gRW1wdHlcbiAgICBpZiAoY29sb3IgPT09IHVuZGVmaW5lZCkgcmV0dXJuIFswLCAwLCAwXTtcblxuICAgIC8vIERlY2ltYWxcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMykgcmV0dXJuIGFyZ3VtZW50cztcblxuICAgIC8vIE51bWJlclxuICAgIGlmICghaXNOYU4oY29sb3IpKSByZXR1cm4gbnVtYmVyVG9SR0IoY29sb3IpO1xuXG4gICAgLy8gSGV4XG4gICAgaWYgKGNvbG9yWzBdID09PSAnIycpIHJldHVybiBoZXhUb1JHQihjb2xvcik7XG5cbiAgICAvLyBOYW1lc1xuICAgIGlmIChOQU1FU1tjb2xvci50b0xvd2VyQ2FzZSgpXSkgcmV0dXJuIGhleFRvUkdCKE5BTUVTW2NvbG9yLnRvTG93ZXJDYXNlKCldKTtcblxuICAgIGNvbnNvbGUud2FybignQ29sb3IgZm9ybWF0IG5vdCByZWNvZ25pc2VkJyk7XG4gICAgcmV0dXJuIFswLCAwLCAwXTtcbn1cbiIsIi8vIGFzc3VtZXMgdGhlIHVwcGVyIDN4MyBvZiBtIGlzIGEgcHVyZSByb3RhdGlvbiBtYXRyaXggKGkuZSwgdW5zY2FsZWQpXG5leHBvcnQgZnVuY3Rpb24gZnJvbVJvdGF0aW9uTWF0cml4KG91dCwgbSwgb3JkZXIgPSAnWVhaJykge1xuICAgIGlmIChvcmRlciA9PT0gJ1hZWicpIHtcbiAgICAgICAgb3V0WzFdID0gTWF0aC5hc2luKE1hdGgubWluKE1hdGgubWF4KG1bOF0sIC0xKSwgMSkpO1xuICAgICAgICBpZiAoTWF0aC5hYnMobVs4XSkgPCAwLjk5OTk5KSB7XG4gICAgICAgICAgICBvdXRbMF0gPSBNYXRoLmF0YW4yKC1tWzldLCBtWzEwXSk7XG4gICAgICAgICAgICBvdXRbMl0gPSBNYXRoLmF0YW4yKC1tWzRdLCBtWzBdKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG91dFswXSA9IE1hdGguYXRhbjIobVs2XSwgbVs1XSk7XG4gICAgICAgICAgICBvdXRbMl0gPSAwO1xuICAgICAgICB9XG4gICAgfSBlbHNlIGlmIChvcmRlciA9PT0gJ1lYWicpIHtcbiAgICAgICAgb3V0WzBdID0gTWF0aC5hc2luKC1NYXRoLm1pbihNYXRoLm1heChtWzldLCAtMSksIDEpKTtcbiAgICAgICAgaWYgKE1hdGguYWJzKG1bOV0pIDwgMC45OTk5OSkge1xuICAgICAgICAgICAgb3V0WzFdID0gTWF0aC5hdGFuMihtWzhdLCBtWzEwXSk7XG4gICAgICAgICAgICBvdXRbMl0gPSBNYXRoLmF0YW4yKG1bMV0sIG1bNV0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgb3V0WzFdID0gTWF0aC5hdGFuMigtbVsyXSwgbVswXSk7XG4gICAgICAgICAgICBvdXRbMl0gPSAwO1xuICAgICAgICB9XG4gICAgfSBlbHNlIGlmIChvcmRlciA9PT0gJ1pYWScpIHtcbiAgICAgICAgb3V0WzBdID0gTWF0aC5hc2luKE1hdGgubWluKE1hdGgubWF4KG1bNl0sIC0xKSwgMSkpO1xuICAgICAgICBpZiAoTWF0aC5hYnMobVs2XSkgPCAwLjk5OTk5KSB7XG4gICAgICAgICAgICBvdXRbMV0gPSBNYXRoLmF0YW4yKC1tWzJdLCBtWzEwXSk7XG4gICAgICAgICAgICBvdXRbMl0gPSBNYXRoLmF0YW4yKC1tWzRdLCBtWzVdKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG91dFsxXSA9IDA7XG4gICAgICAgICAgICBvdXRbMl0gPSBNYXRoLmF0YW4yKG1bMV0sIG1bMF0pO1xuICAgICAgICB9XG4gICAgfSBlbHNlIGlmIChvcmRlciA9PT0gJ1pZWCcpIHtcbiAgICAgICAgb3V0WzFdID0gTWF0aC5hc2luKC1NYXRoLm1pbihNYXRoLm1heChtWzJdLCAtMSksIDEpKTtcbiAgICAgICAgaWYgKE1hdGguYWJzKG1bMl0pIDwgMC45OTk5OSkge1xuICAgICAgICAgICAgb3V0WzBdID0gTWF0aC5hdGFuMihtWzZdLCBtWzEwXSk7XG4gICAgICAgICAgICBvdXRbMl0gPSBNYXRoLmF0YW4yKG1bMV0sIG1bMF0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgb3V0WzBdID0gMDtcbiAgICAgICAgICAgIG91dFsyXSA9IE1hdGguYXRhbjIoLW1bNF0sIG1bNV0pO1xuICAgICAgICB9XG4gICAgfSBlbHNlIGlmIChvcmRlciA9PT0gJ1laWCcpIHtcbiAgICAgICAgb3V0WzJdID0gTWF0aC5hc2luKE1hdGgubWluKE1hdGgubWF4KG1bMV0sIC0xKSwgMSkpO1xuICAgICAgICBpZiAoTWF0aC5hYnMobVsxXSkgPCAwLjk5OTk5KSB7XG4gICAgICAgICAgICBvdXRbMF0gPSBNYXRoLmF0YW4yKC1tWzldLCBtWzVdKTtcbiAgICAgICAgICAgIG91dFsxXSA9IE1hdGguYXRhbjIoLW1bMl0sIG1bMF0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgb3V0WzBdID0gMDtcbiAgICAgICAgICAgIG91dFsxXSA9IE1hdGguYXRhbjIobVs4XSwgbVsxMF0pO1xuICAgICAgICB9XG4gICAgfSBlbHNlIGlmIChvcmRlciA9PT0gJ1haWScpIHtcbiAgICAgICAgb3V0WzJdID0gTWF0aC5hc2luKC1NYXRoLm1pbihNYXRoLm1heChtWzRdLCAtMSksIDEpKTtcbiAgICAgICAgaWYgKE1hdGguYWJzKG1bNF0pIDwgMC45OTk5OSkge1xuICAgICAgICAgICAgb3V0WzBdID0gTWF0aC5hdGFuMihtWzZdLCBtWzVdKTtcbiAgICAgICAgICAgIG91dFsxXSA9IE1hdGguYXRhbjIobVs4XSwgbVswXSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBvdXRbMF0gPSBNYXRoLmF0YW4yKC1tWzldLCBtWzEwXSk7XG4gICAgICAgICAgICBvdXRbMV0gPSAwO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG91dDtcbn1cbiIsImNvbnN0IEVQU0lMT04gPSAwLjAwMDAwMTtcblxuLyoqXG4gKiBDb3BpZXMgdGhlIHVwcGVyLWxlZnQgM3gzIHZhbHVlcyBpbnRvIHRoZSBnaXZlbiBtYXQzLlxuICpcbiAqIEBwYXJhbSB7bWF0M30gb3V0IHRoZSByZWNlaXZpbmcgM3gzIG1hdHJpeFxuICogQHBhcmFtIHttYXQ0fSBhICAgdGhlIHNvdXJjZSA0eDQgbWF0cml4XG4gKiBAcmV0dXJucyB7bWF0M30gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmcm9tTWF0NChvdXQsIGEpIHtcbiAgICBvdXRbMF0gPSBhWzBdO1xuICAgIG91dFsxXSA9IGFbMV07XG4gICAgb3V0WzJdID0gYVsyXTtcbiAgICBvdXRbM10gPSBhWzRdO1xuICAgIG91dFs0XSA9IGFbNV07XG4gICAgb3V0WzVdID0gYVs2XTtcbiAgICBvdXRbNl0gPSBhWzhdO1xuICAgIG91dFs3XSA9IGFbOV07XG4gICAgb3V0WzhdID0gYVsxMF07XG4gICAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBDYWxjdWxhdGVzIGEgM3gzIG1hdHJpeCBmcm9tIHRoZSBnaXZlbiBxdWF0ZXJuaW9uXG4gKlxuICogQHBhcmFtIHttYXQzfSBvdXQgbWF0MyByZWNlaXZpbmcgb3BlcmF0aW9uIHJlc3VsdFxuICogQHBhcmFtIHtxdWF0fSBxIFF1YXRlcm5pb24gdG8gY3JlYXRlIG1hdHJpeCBmcm9tXG4gKlxuICogQHJldHVybnMge21hdDN9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gZnJvbVF1YXQob3V0LCBxKSB7XG4gICAgbGV0IHggPSBxWzBdLFxuICAgICAgICB5ID0gcVsxXSxcbiAgICAgICAgeiA9IHFbMl0sXG4gICAgICAgIHcgPSBxWzNdO1xuICAgIGxldCB4MiA9IHggKyB4O1xuICAgIGxldCB5MiA9IHkgKyB5O1xuICAgIGxldCB6MiA9IHogKyB6O1xuXG4gICAgbGV0IHh4ID0geCAqIHgyO1xuICAgIGxldCB5eCA9IHkgKiB4MjtcbiAgICBsZXQgeXkgPSB5ICogeTI7XG4gICAgbGV0IHp4ID0geiAqIHgyO1xuICAgIGxldCB6eSA9IHogKiB5MjtcbiAgICBsZXQgenogPSB6ICogejI7XG4gICAgbGV0IHd4ID0gdyAqIHgyO1xuICAgIGxldCB3eSA9IHcgKiB5MjtcbiAgICBsZXQgd3ogPSB3ICogejI7XG5cbiAgICBvdXRbMF0gPSAxIC0geXkgLSB6ejtcbiAgICBvdXRbM10gPSB5eCAtIHd6O1xuICAgIG91dFs2XSA9IHp4ICsgd3k7XG5cbiAgICBvdXRbMV0gPSB5eCArIHd6O1xuICAgIG91dFs0XSA9IDEgLSB4eCAtIHp6O1xuICAgIG91dFs3XSA9IHp5IC0gd3g7XG5cbiAgICBvdXRbMl0gPSB6eCAtIHd5O1xuICAgIG91dFs1XSA9IHp5ICsgd3g7XG4gICAgb3V0WzhdID0gMSAtIHh4IC0geXk7XG5cbiAgICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIENvcHkgdGhlIHZhbHVlcyBmcm9tIG9uZSBtYXQzIHRvIGFub3RoZXJcbiAqXG4gKiBAcGFyYW0ge21hdDN9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQzfSBhIHRoZSBzb3VyY2UgbWF0cml4XG4gKiBAcmV0dXJucyB7bWF0M30gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb3B5KG91dCwgYSkge1xuICAgIG91dFswXSA9IGFbMF07XG4gICAgb3V0WzFdID0gYVsxXTtcbiAgICBvdXRbMl0gPSBhWzJdO1xuICAgIG91dFszXSA9IGFbM107XG4gICAgb3V0WzRdID0gYVs0XTtcbiAgICBvdXRbNV0gPSBhWzVdO1xuICAgIG91dFs2XSA9IGFbNl07XG4gICAgb3V0WzddID0gYVs3XTtcbiAgICBvdXRbOF0gPSBhWzhdO1xuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogU2V0IHRoZSBjb21wb25lbnRzIG9mIGEgbWF0MyB0byB0aGUgZ2l2ZW4gdmFsdWVzXG4gKlxuICogQHBhcmFtIHttYXQzfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEByZXR1cm5zIHttYXQzfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNldChvdXQsIG0wMCwgbTAxLCBtMDIsIG0xMCwgbTExLCBtMTIsIG0yMCwgbTIxLCBtMjIpIHtcbiAgICBvdXRbMF0gPSBtMDA7XG4gICAgb3V0WzFdID0gbTAxO1xuICAgIG91dFsyXSA9IG0wMjtcbiAgICBvdXRbM10gPSBtMTA7XG4gICAgb3V0WzRdID0gbTExO1xuICAgIG91dFs1XSA9IG0xMjtcbiAgICBvdXRbNl0gPSBtMjA7XG4gICAgb3V0WzddID0gbTIxO1xuICAgIG91dFs4XSA9IG0yMjtcbiAgICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFNldCBhIG1hdDMgdG8gdGhlIGlkZW50aXR5IG1hdHJpeFxuICpcbiAqIEBwYXJhbSB7bWF0M30gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcmV0dXJucyB7bWF0M30gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpZGVudGl0eShvdXQpIHtcbiAgICBvdXRbMF0gPSAxO1xuICAgIG91dFsxXSA9IDA7XG4gICAgb3V0WzJdID0gMDtcbiAgICBvdXRbM10gPSAwO1xuICAgIG91dFs0XSA9IDE7XG4gICAgb3V0WzVdID0gMDtcbiAgICBvdXRbNl0gPSAwO1xuICAgIG91dFs3XSA9IDA7XG4gICAgb3V0WzhdID0gMTtcbiAgICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFRyYW5zcG9zZSB0aGUgdmFsdWVzIG9mIGEgbWF0M1xuICpcbiAqIEBwYXJhbSB7bWF0M30gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDN9IGEgdGhlIHNvdXJjZSBtYXRyaXhcbiAqIEByZXR1cm5zIHttYXQzfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRyYW5zcG9zZShvdXQsIGEpIHtcbiAgICAvLyBJZiB3ZSBhcmUgdHJhbnNwb3Npbmcgb3Vyc2VsdmVzIHdlIGNhbiBza2lwIGEgZmV3IHN0ZXBzIGJ1dCBoYXZlIHRvIGNhY2hlIHNvbWUgdmFsdWVzXG4gICAgaWYgKG91dCA9PT0gYSkge1xuICAgICAgICBsZXQgYTAxID0gYVsxXSxcbiAgICAgICAgICAgIGEwMiA9IGFbMl0sXG4gICAgICAgICAgICBhMTIgPSBhWzVdO1xuICAgICAgICBvdXRbMV0gPSBhWzNdO1xuICAgICAgICBvdXRbMl0gPSBhWzZdO1xuICAgICAgICBvdXRbM10gPSBhMDE7XG4gICAgICAgIG91dFs1XSA9IGFbN107XG4gICAgICAgIG91dFs2XSA9IGEwMjtcbiAgICAgICAgb3V0WzddID0gYTEyO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIG91dFswXSA9IGFbMF07XG4gICAgICAgIG91dFsxXSA9IGFbM107XG4gICAgICAgIG91dFsyXSA9IGFbNl07XG4gICAgICAgIG91dFszXSA9IGFbMV07XG4gICAgICAgIG91dFs0XSA9IGFbNF07XG4gICAgICAgIG91dFs1XSA9IGFbN107XG4gICAgICAgIG91dFs2XSA9IGFbMl07XG4gICAgICAgIG91dFs3XSA9IGFbNV07XG4gICAgICAgIG91dFs4XSA9IGFbOF07XG4gICAgfVxuXG4gICAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBJbnZlcnRzIGEgbWF0M1xuICpcbiAqIEBwYXJhbSB7bWF0M30gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDN9IGEgdGhlIHNvdXJjZSBtYXRyaXhcbiAqIEByZXR1cm5zIHttYXQzfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGludmVydChvdXQsIGEpIHtcbiAgICBsZXQgYTAwID0gYVswXSxcbiAgICAgICAgYTAxID0gYVsxXSxcbiAgICAgICAgYTAyID0gYVsyXTtcbiAgICBsZXQgYTEwID0gYVszXSxcbiAgICAgICAgYTExID0gYVs0XSxcbiAgICAgICAgYTEyID0gYVs1XTtcbiAgICBsZXQgYTIwID0gYVs2XSxcbiAgICAgICAgYTIxID0gYVs3XSxcbiAgICAgICAgYTIyID0gYVs4XTtcblxuICAgIGxldCBiMDEgPSBhMjIgKiBhMTEgLSBhMTIgKiBhMjE7XG4gICAgbGV0IGIxMSA9IC1hMjIgKiBhMTAgKyBhMTIgKiBhMjA7XG4gICAgbGV0IGIyMSA9IGEyMSAqIGExMCAtIGExMSAqIGEyMDtcblxuICAgIC8vIENhbGN1bGF0ZSB0aGUgZGV0ZXJtaW5hbnRcbiAgICBsZXQgZGV0ID0gYTAwICogYjAxICsgYTAxICogYjExICsgYTAyICogYjIxO1xuXG4gICAgaWYgKCFkZXQpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGRldCA9IDEuMCAvIGRldDtcblxuICAgIG91dFswXSA9IGIwMSAqIGRldDtcbiAgICBvdXRbMV0gPSAoLWEyMiAqIGEwMSArIGEwMiAqIGEyMSkgKiBkZXQ7XG4gICAgb3V0WzJdID0gKGExMiAqIGEwMSAtIGEwMiAqIGExMSkgKiBkZXQ7XG4gICAgb3V0WzNdID0gYjExICogZGV0O1xuICAgIG91dFs0XSA9IChhMjIgKiBhMDAgLSBhMDIgKiBhMjApICogZGV0O1xuICAgIG91dFs1XSA9ICgtYTEyICogYTAwICsgYTAyICogYTEwKSAqIGRldDtcbiAgICBvdXRbNl0gPSBiMjEgKiBkZXQ7XG4gICAgb3V0WzddID0gKC1hMjEgKiBhMDAgKyBhMDEgKiBhMjApICogZGV0O1xuICAgIG91dFs4XSA9IChhMTEgKiBhMDAgLSBhMDEgKiBhMTApICogZGV0O1xuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgZGV0ZXJtaW5hbnQgb2YgYSBtYXQzXG4gKlxuICogQHBhcmFtIHttYXQzfSBhIHRoZSBzb3VyY2UgbWF0cml4XG4gKiBAcmV0dXJucyB7TnVtYmVyfSBkZXRlcm1pbmFudCBvZiBhXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkZXRlcm1pbmFudChhKSB7XG4gICAgbGV0IGEwMCA9IGFbMF0sXG4gICAgICAgIGEwMSA9IGFbMV0sXG4gICAgICAgIGEwMiA9IGFbMl07XG4gICAgbGV0IGExMCA9IGFbM10sXG4gICAgICAgIGExMSA9IGFbNF0sXG4gICAgICAgIGExMiA9IGFbNV07XG4gICAgbGV0IGEyMCA9IGFbNl0sXG4gICAgICAgIGEyMSA9IGFbN10sXG4gICAgICAgIGEyMiA9IGFbOF07XG5cbiAgICByZXR1cm4gYTAwICogKGEyMiAqIGExMSAtIGExMiAqIGEyMSkgKyBhMDEgKiAoLWEyMiAqIGExMCArIGExMiAqIGEyMCkgKyBhMDIgKiAoYTIxICogYTEwIC0gYTExICogYTIwKTtcbn1cblxuLyoqXG4gKiBNdWx0aXBsaWVzIHR3byBtYXQzJ3NcbiAqXG4gKiBAcGFyYW0ge21hdDN9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge21hdDN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7bWF0M30gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtdWx0aXBseShvdXQsIGEsIGIpIHtcbiAgICBsZXQgYTAwID0gYVswXSxcbiAgICAgICAgYTAxID0gYVsxXSxcbiAgICAgICAgYTAyID0gYVsyXTtcbiAgICBsZXQgYTEwID0gYVszXSxcbiAgICAgICAgYTExID0gYVs0XSxcbiAgICAgICAgYTEyID0gYVs1XTtcbiAgICBsZXQgYTIwID0gYVs2XSxcbiAgICAgICAgYTIxID0gYVs3XSxcbiAgICAgICAgYTIyID0gYVs4XTtcblxuICAgIGxldCBiMDAgPSBiWzBdLFxuICAgICAgICBiMDEgPSBiWzFdLFxuICAgICAgICBiMDIgPSBiWzJdO1xuICAgIGxldCBiMTAgPSBiWzNdLFxuICAgICAgICBiMTEgPSBiWzRdLFxuICAgICAgICBiMTIgPSBiWzVdO1xuICAgIGxldCBiMjAgPSBiWzZdLFxuICAgICAgICBiMjEgPSBiWzddLFxuICAgICAgICBiMjIgPSBiWzhdO1xuXG4gICAgb3V0WzBdID0gYjAwICogYTAwICsgYjAxICogYTEwICsgYjAyICogYTIwO1xuICAgIG91dFsxXSA9IGIwMCAqIGEwMSArIGIwMSAqIGExMSArIGIwMiAqIGEyMTtcbiAgICBvdXRbMl0gPSBiMDAgKiBhMDIgKyBiMDEgKiBhMTIgKyBiMDIgKiBhMjI7XG5cbiAgICBvdXRbM10gPSBiMTAgKiBhMDAgKyBiMTEgKiBhMTAgKyBiMTIgKiBhMjA7XG4gICAgb3V0WzRdID0gYjEwICogYTAxICsgYjExICogYTExICsgYjEyICogYTIxO1xuICAgIG91dFs1XSA9IGIxMCAqIGEwMiArIGIxMSAqIGExMiArIGIxMiAqIGEyMjtcblxuICAgIG91dFs2XSA9IGIyMCAqIGEwMCArIGIyMSAqIGExMCArIGIyMiAqIGEyMDtcbiAgICBvdXRbN10gPSBiMjAgKiBhMDEgKyBiMjEgKiBhMTEgKyBiMjIgKiBhMjE7XG4gICAgb3V0WzhdID0gYjIwICogYTAyICsgYjIxICogYTEyICsgYjIyICogYTIyO1xuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogVHJhbnNsYXRlIGEgbWF0MyBieSB0aGUgZ2l2ZW4gdmVjdG9yXG4gKlxuICogQHBhcmFtIHttYXQzfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0M30gYSB0aGUgbWF0cml4IHRvIHRyYW5zbGF0ZVxuICogQHBhcmFtIHt2ZWMyfSB2IHZlY3RvciB0byB0cmFuc2xhdGUgYnlcbiAqIEByZXR1cm5zIHttYXQzfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRyYW5zbGF0ZShvdXQsIGEsIHYpIHtcbiAgICBsZXQgYTAwID0gYVswXSxcbiAgICAgICAgYTAxID0gYVsxXSxcbiAgICAgICAgYTAyID0gYVsyXSxcbiAgICAgICAgYTEwID0gYVszXSxcbiAgICAgICAgYTExID0gYVs0XSxcbiAgICAgICAgYTEyID0gYVs1XSxcbiAgICAgICAgYTIwID0gYVs2XSxcbiAgICAgICAgYTIxID0gYVs3XSxcbiAgICAgICAgYTIyID0gYVs4XSxcbiAgICAgICAgeCA9IHZbMF0sXG4gICAgICAgIHkgPSB2WzFdO1xuXG4gICAgb3V0WzBdID0gYTAwO1xuICAgIG91dFsxXSA9IGEwMTtcbiAgICBvdXRbMl0gPSBhMDI7XG5cbiAgICBvdXRbM10gPSBhMTA7XG4gICAgb3V0WzRdID0gYTExO1xuICAgIG91dFs1XSA9IGExMjtcblxuICAgIG91dFs2XSA9IHggKiBhMDAgKyB5ICogYTEwICsgYTIwO1xuICAgIG91dFs3XSA9IHggKiBhMDEgKyB5ICogYTExICsgYTIxO1xuICAgIG91dFs4XSA9IHggKiBhMDIgKyB5ICogYTEyICsgYTIyO1xuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogUm90YXRlcyBhIG1hdDMgYnkgdGhlIGdpdmVuIGFuZ2xlXG4gKlxuICogQHBhcmFtIHttYXQzfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0M30gYSB0aGUgbWF0cml4IHRvIHJvdGF0ZVxuICogQHBhcmFtIHtOdW1iZXJ9IHJhZCB0aGUgYW5nbGUgdG8gcm90YXRlIHRoZSBtYXRyaXggYnlcbiAqIEByZXR1cm5zIHttYXQzfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJvdGF0ZShvdXQsIGEsIHJhZCkge1xuICAgIGxldCBhMDAgPSBhWzBdLFxuICAgICAgICBhMDEgPSBhWzFdLFxuICAgICAgICBhMDIgPSBhWzJdLFxuICAgICAgICBhMTAgPSBhWzNdLFxuICAgICAgICBhMTEgPSBhWzRdLFxuICAgICAgICBhMTIgPSBhWzVdLFxuICAgICAgICBhMjAgPSBhWzZdLFxuICAgICAgICBhMjEgPSBhWzddLFxuICAgICAgICBhMjIgPSBhWzhdLFxuICAgICAgICBzID0gTWF0aC5zaW4ocmFkKSxcbiAgICAgICAgYyA9IE1hdGguY29zKHJhZCk7XG5cbiAgICBvdXRbMF0gPSBjICogYTAwICsgcyAqIGExMDtcbiAgICBvdXRbMV0gPSBjICogYTAxICsgcyAqIGExMTtcbiAgICBvdXRbMl0gPSBjICogYTAyICsgcyAqIGExMjtcblxuICAgIG91dFszXSA9IGMgKiBhMTAgLSBzICogYTAwO1xuICAgIG91dFs0XSA9IGMgKiBhMTEgLSBzICogYTAxO1xuICAgIG91dFs1XSA9IGMgKiBhMTIgLSBzICogYTAyO1xuXG4gICAgb3V0WzZdID0gYTIwO1xuICAgIG91dFs3XSA9IGEyMTtcbiAgICBvdXRbOF0gPSBhMjI7XG4gICAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBTY2FsZXMgdGhlIG1hdDMgYnkgdGhlIGRpbWVuc2lvbnMgaW4gdGhlIGdpdmVuIHZlYzJcbiAqXG4gKiBAcGFyYW0ge21hdDN9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQzfSBhIHRoZSBtYXRyaXggdG8gcm90YXRlXG4gKiBAcGFyYW0ge3ZlYzJ9IHYgdGhlIHZlYzIgdG8gc2NhbGUgdGhlIG1hdHJpeCBieVxuICogQHJldHVybnMge21hdDN9IG91dFxuICoqL1xuZXhwb3J0IGZ1bmN0aW9uIHNjYWxlKG91dCwgYSwgdikge1xuICAgIGxldCB4ID0gdlswXSxcbiAgICAgICAgeSA9IHZbMV07XG5cbiAgICBvdXRbMF0gPSB4ICogYVswXTtcbiAgICBvdXRbMV0gPSB4ICogYVsxXTtcbiAgICBvdXRbMl0gPSB4ICogYVsyXTtcblxuICAgIG91dFszXSA9IHkgKiBhWzNdO1xuICAgIG91dFs0XSA9IHkgKiBhWzRdO1xuICAgIG91dFs1XSA9IHkgKiBhWzVdO1xuXG4gICAgb3V0WzZdID0gYVs2XTtcbiAgICBvdXRbN10gPSBhWzddO1xuICAgIG91dFs4XSA9IGFbOF07XG4gICAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBDYWxjdWxhdGVzIGEgM3gzIG5vcm1hbCBtYXRyaXggKHRyYW5zcG9zZSBpbnZlcnNlKSBmcm9tIHRoZSA0eDQgbWF0cml4XG4gKlxuICogQHBhcmFtIHttYXQzfSBvdXQgbWF0MyByZWNlaXZpbmcgb3BlcmF0aW9uIHJlc3VsdFxuICogQHBhcmFtIHttYXQ0fSBhIE1hdDQgdG8gZGVyaXZlIHRoZSBub3JtYWwgbWF0cml4IGZyb21cbiAqXG4gKiBAcmV0dXJucyB7bWF0M30gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBub3JtYWxGcm9tTWF0NChvdXQsIGEpIHtcbiAgICBsZXQgYTAwID0gYVswXSxcbiAgICAgICAgYTAxID0gYVsxXSxcbiAgICAgICAgYTAyID0gYVsyXSxcbiAgICAgICAgYTAzID0gYVszXTtcbiAgICBsZXQgYTEwID0gYVs0XSxcbiAgICAgICAgYTExID0gYVs1XSxcbiAgICAgICAgYTEyID0gYVs2XSxcbiAgICAgICAgYTEzID0gYVs3XTtcbiAgICBsZXQgYTIwID0gYVs4XSxcbiAgICAgICAgYTIxID0gYVs5XSxcbiAgICAgICAgYTIyID0gYVsxMF0sXG4gICAgICAgIGEyMyA9IGFbMTFdO1xuICAgIGxldCBhMzAgPSBhWzEyXSxcbiAgICAgICAgYTMxID0gYVsxM10sXG4gICAgICAgIGEzMiA9IGFbMTRdLFxuICAgICAgICBhMzMgPSBhWzE1XTtcblxuICAgIGxldCBiMDAgPSBhMDAgKiBhMTEgLSBhMDEgKiBhMTA7XG4gICAgbGV0IGIwMSA9IGEwMCAqIGExMiAtIGEwMiAqIGExMDtcbiAgICBsZXQgYjAyID0gYTAwICogYTEzIC0gYTAzICogYTEwO1xuICAgIGxldCBiMDMgPSBhMDEgKiBhMTIgLSBhMDIgKiBhMTE7XG4gICAgbGV0IGIwNCA9IGEwMSAqIGExMyAtIGEwMyAqIGExMTtcbiAgICBsZXQgYjA1ID0gYTAyICogYTEzIC0gYTAzICogYTEyO1xuICAgIGxldCBiMDYgPSBhMjAgKiBhMzEgLSBhMjEgKiBhMzA7XG4gICAgbGV0IGIwNyA9IGEyMCAqIGEzMiAtIGEyMiAqIGEzMDtcbiAgICBsZXQgYjA4ID0gYTIwICogYTMzIC0gYTIzICogYTMwO1xuICAgIGxldCBiMDkgPSBhMjEgKiBhMzIgLSBhMjIgKiBhMzE7XG4gICAgbGV0IGIxMCA9IGEyMSAqIGEzMyAtIGEyMyAqIGEzMTtcbiAgICBsZXQgYjExID0gYTIyICogYTMzIC0gYTIzICogYTMyO1xuXG4gICAgLy8gQ2FsY3VsYXRlIHRoZSBkZXRlcm1pbmFudFxuICAgIGxldCBkZXQgPSBiMDAgKiBiMTEgLSBiMDEgKiBiMTAgKyBiMDIgKiBiMDkgKyBiMDMgKiBiMDggLSBiMDQgKiBiMDcgKyBiMDUgKiBiMDY7XG5cbiAgICBpZiAoIWRldCkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgZGV0ID0gMS4wIC8gZGV0O1xuXG4gICAgb3V0WzBdID0gKGExMSAqIGIxMSAtIGExMiAqIGIxMCArIGExMyAqIGIwOSkgKiBkZXQ7XG4gICAgb3V0WzFdID0gKGExMiAqIGIwOCAtIGExMCAqIGIxMSAtIGExMyAqIGIwNykgKiBkZXQ7XG4gICAgb3V0WzJdID0gKGExMCAqIGIxMCAtIGExMSAqIGIwOCArIGExMyAqIGIwNikgKiBkZXQ7XG5cbiAgICBvdXRbM10gPSAoYTAyICogYjEwIC0gYTAxICogYjExIC0gYTAzICogYjA5KSAqIGRldDtcbiAgICBvdXRbNF0gPSAoYTAwICogYjExIC0gYTAyICogYjA4ICsgYTAzICogYjA3KSAqIGRldDtcbiAgICBvdXRbNV0gPSAoYTAxICogYjA4IC0gYTAwICogYjEwIC0gYTAzICogYjA2KSAqIGRldDtcblxuICAgIG91dFs2XSA9IChhMzEgKiBiMDUgLSBhMzIgKiBiMDQgKyBhMzMgKiBiMDMpICogZGV0O1xuICAgIG91dFs3XSA9IChhMzIgKiBiMDIgLSBhMzAgKiBiMDUgLSBhMzMgKiBiMDEpICogZGV0O1xuICAgIG91dFs4XSA9IChhMzAgKiBiMDQgLSBhMzEgKiBiMDIgKyBhMzMgKiBiMDApICogZGV0O1xuXG4gICAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBHZW5lcmF0ZXMgYSAyRCBwcm9qZWN0aW9uIG1hdHJpeCB3aXRoIHRoZSBnaXZlbiBib3VuZHNcbiAqXG4gKiBAcGFyYW0ge21hdDN9IG91dCBtYXQzIGZydXN0dW0gbWF0cml4IHdpbGwgYmUgd3JpdHRlbiBpbnRvXG4gKiBAcGFyYW0ge251bWJlcn0gd2lkdGggV2lkdGggb2YgeW91ciBnbCBjb250ZXh0XG4gKiBAcGFyYW0ge251bWJlcn0gaGVpZ2h0IEhlaWdodCBvZiBnbCBjb250ZXh0XG4gKiBAcmV0dXJucyB7bWF0M30gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwcm9qZWN0aW9uKG91dCwgd2lkdGgsIGhlaWdodCkge1xuICAgIG91dFswXSA9IDIgLyB3aWR0aDtcbiAgICBvdXRbMV0gPSAwO1xuICAgIG91dFsyXSA9IDA7XG4gICAgb3V0WzNdID0gMDtcbiAgICBvdXRbNF0gPSAtMiAvIGhlaWdodDtcbiAgICBvdXRbNV0gPSAwO1xuICAgIG91dFs2XSA9IC0xO1xuICAgIG91dFs3XSA9IDE7XG4gICAgb3V0WzhdID0gMTtcbiAgICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIEFkZHMgdHdvIG1hdDMnc1xuICpcbiAqIEBwYXJhbSB7bWF0M30gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7bWF0M30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHttYXQzfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFkZChvdXQsIGEsIGIpIHtcbiAgICBvdXRbMF0gPSBhWzBdICsgYlswXTtcbiAgICBvdXRbMV0gPSBhWzFdICsgYlsxXTtcbiAgICBvdXRbMl0gPSBhWzJdICsgYlsyXTtcbiAgICBvdXRbM10gPSBhWzNdICsgYlszXTtcbiAgICBvdXRbNF0gPSBhWzRdICsgYls0XTtcbiAgICBvdXRbNV0gPSBhWzVdICsgYls1XTtcbiAgICBvdXRbNl0gPSBhWzZdICsgYls2XTtcbiAgICBvdXRbN10gPSBhWzddICsgYls3XTtcbiAgICBvdXRbOF0gPSBhWzhdICsgYls4XTtcbiAgICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFN1YnRyYWN0cyBtYXRyaXggYiBmcm9tIG1hdHJpeCBhXG4gKlxuICogQHBhcmFtIHttYXQzfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0M30gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHttYXQzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge21hdDN9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gc3VidHJhY3Qob3V0LCBhLCBiKSB7XG4gICAgb3V0WzBdID0gYVswXSAtIGJbMF07XG4gICAgb3V0WzFdID0gYVsxXSAtIGJbMV07XG4gICAgb3V0WzJdID0gYVsyXSAtIGJbMl07XG4gICAgb3V0WzNdID0gYVszXSAtIGJbM107XG4gICAgb3V0WzRdID0gYVs0XSAtIGJbNF07XG4gICAgb3V0WzVdID0gYVs1XSAtIGJbNV07XG4gICAgb3V0WzZdID0gYVs2XSAtIGJbNl07XG4gICAgb3V0WzddID0gYVs3XSAtIGJbN107XG4gICAgb3V0WzhdID0gYVs4XSAtIGJbOF07XG4gICAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBNdWx0aXBseSBlYWNoIGVsZW1lbnQgb2YgdGhlIG1hdHJpeCBieSBhIHNjYWxhci5cbiAqXG4gKiBAcGFyYW0ge21hdDN9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQzfSBhIHRoZSBtYXRyaXggdG8gc2NhbGVcbiAqIEBwYXJhbSB7TnVtYmVyfSBiIGFtb3VudCB0byBzY2FsZSB0aGUgbWF0cml4J3MgZWxlbWVudHMgYnlcbiAqIEByZXR1cm5zIHttYXQzfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG11bHRpcGx5U2NhbGFyKG91dCwgYSwgYikge1xuICAgIG91dFswXSA9IGFbMF0gKiBiO1xuICAgIG91dFsxXSA9IGFbMV0gKiBiO1xuICAgIG91dFsyXSA9IGFbMl0gKiBiO1xuICAgIG91dFszXSA9IGFbM10gKiBiO1xuICAgIG91dFs0XSA9IGFbNF0gKiBiO1xuICAgIG91dFs1XSA9IGFbNV0gKiBiO1xuICAgIG91dFs2XSA9IGFbNl0gKiBiO1xuICAgIG91dFs3XSA9IGFbN10gKiBiO1xuICAgIG91dFs4XSA9IGFbOF0gKiBiO1xuICAgIHJldHVybiBvdXQ7XG59XG4iLCJjb25zdCBFUFNJTE9OID0gMC4wMDAwMDE7XG5cbi8qKlxuICogQ29weSB0aGUgdmFsdWVzIGZyb20gb25lIG1hdDQgdG8gYW5vdGhlclxuICpcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDR9IGEgdGhlIHNvdXJjZSBtYXRyaXhcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvcHkob3V0LCBhKSB7XG4gICAgb3V0WzBdID0gYVswXTtcbiAgICBvdXRbMV0gPSBhWzFdO1xuICAgIG91dFsyXSA9IGFbMl07XG4gICAgb3V0WzNdID0gYVszXTtcbiAgICBvdXRbNF0gPSBhWzRdO1xuICAgIG91dFs1XSA9IGFbNV07XG4gICAgb3V0WzZdID0gYVs2XTtcbiAgICBvdXRbN10gPSBhWzddO1xuICAgIG91dFs4XSA9IGFbOF07XG4gICAgb3V0WzldID0gYVs5XTtcbiAgICBvdXRbMTBdID0gYVsxMF07XG4gICAgb3V0WzExXSA9IGFbMTFdO1xuICAgIG91dFsxMl0gPSBhWzEyXTtcbiAgICBvdXRbMTNdID0gYVsxM107XG4gICAgb3V0WzE0XSA9IGFbMTRdO1xuICAgIG91dFsxNV0gPSBhWzE1XTtcbiAgICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFNldCB0aGUgY29tcG9uZW50cyBvZiBhIG1hdDQgdG8gdGhlIGdpdmVuIHZhbHVlc1xuICpcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZXQob3V0LCBtMDAsIG0wMSwgbTAyLCBtMDMsIG0xMCwgbTExLCBtMTIsIG0xMywgbTIwLCBtMjEsIG0yMiwgbTIzLCBtMzAsIG0zMSwgbTMyLCBtMzMpIHtcbiAgICBvdXRbMF0gPSBtMDA7XG4gICAgb3V0WzFdID0gbTAxO1xuICAgIG91dFsyXSA9IG0wMjtcbiAgICBvdXRbM10gPSBtMDM7XG4gICAgb3V0WzRdID0gbTEwO1xuICAgIG91dFs1XSA9IG0xMTtcbiAgICBvdXRbNl0gPSBtMTI7XG4gICAgb3V0WzddID0gbTEzO1xuICAgIG91dFs4XSA9IG0yMDtcbiAgICBvdXRbOV0gPSBtMjE7XG4gICAgb3V0WzEwXSA9IG0yMjtcbiAgICBvdXRbMTFdID0gbTIzO1xuICAgIG91dFsxMl0gPSBtMzA7XG4gICAgb3V0WzEzXSA9IG0zMTtcbiAgICBvdXRbMTRdID0gbTMyO1xuICAgIG91dFsxNV0gPSBtMzM7XG4gICAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBTZXQgYSBtYXQ0IHRvIHRoZSBpZGVudGl0eSBtYXRyaXhcbiAqXG4gKiBAcGFyYW0ge21hdDR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHJldHVybnMge21hdDR9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gaWRlbnRpdHkob3V0KSB7XG4gICAgb3V0WzBdID0gMTtcbiAgICBvdXRbMV0gPSAwO1xuICAgIG91dFsyXSA9IDA7XG4gICAgb3V0WzNdID0gMDtcbiAgICBvdXRbNF0gPSAwO1xuICAgIG91dFs1XSA9IDE7XG4gICAgb3V0WzZdID0gMDtcbiAgICBvdXRbN10gPSAwO1xuICAgIG91dFs4XSA9IDA7XG4gICAgb3V0WzldID0gMDtcbiAgICBvdXRbMTBdID0gMTtcbiAgICBvdXRbMTFdID0gMDtcbiAgICBvdXRbMTJdID0gMDtcbiAgICBvdXRbMTNdID0gMDtcbiAgICBvdXRbMTRdID0gMDtcbiAgICBvdXRbMTVdID0gMTtcbiAgICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFRyYW5zcG9zZSB0aGUgdmFsdWVzIG9mIGEgbWF0NFxuICpcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDR9IGEgdGhlIHNvdXJjZSBtYXRyaXhcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRyYW5zcG9zZShvdXQsIGEpIHtcbiAgICAvLyBJZiB3ZSBhcmUgdHJhbnNwb3Npbmcgb3Vyc2VsdmVzIHdlIGNhbiBza2lwIGEgZmV3IHN0ZXBzIGJ1dCBoYXZlIHRvIGNhY2hlIHNvbWUgdmFsdWVzXG4gICAgaWYgKG91dCA9PT0gYSkge1xuICAgICAgICBsZXQgYTAxID0gYVsxXSxcbiAgICAgICAgICAgIGEwMiA9IGFbMl0sXG4gICAgICAgICAgICBhMDMgPSBhWzNdO1xuICAgICAgICBsZXQgYTEyID0gYVs2XSxcbiAgICAgICAgICAgIGExMyA9IGFbN107XG4gICAgICAgIGxldCBhMjMgPSBhWzExXTtcblxuICAgICAgICBvdXRbMV0gPSBhWzRdO1xuICAgICAgICBvdXRbMl0gPSBhWzhdO1xuICAgICAgICBvdXRbM10gPSBhWzEyXTtcbiAgICAgICAgb3V0WzRdID0gYTAxO1xuICAgICAgICBvdXRbNl0gPSBhWzldO1xuICAgICAgICBvdXRbN10gPSBhWzEzXTtcbiAgICAgICAgb3V0WzhdID0gYTAyO1xuICAgICAgICBvdXRbOV0gPSBhMTI7XG4gICAgICAgIG91dFsxMV0gPSBhWzE0XTtcbiAgICAgICAgb3V0WzEyXSA9IGEwMztcbiAgICAgICAgb3V0WzEzXSA9IGExMztcbiAgICAgICAgb3V0WzE0XSA9IGEyMztcbiAgICB9IGVsc2Uge1xuICAgICAgICBvdXRbMF0gPSBhWzBdO1xuICAgICAgICBvdXRbMV0gPSBhWzRdO1xuICAgICAgICBvdXRbMl0gPSBhWzhdO1xuICAgICAgICBvdXRbM10gPSBhWzEyXTtcbiAgICAgICAgb3V0WzRdID0gYVsxXTtcbiAgICAgICAgb3V0WzVdID0gYVs1XTtcbiAgICAgICAgb3V0WzZdID0gYVs5XTtcbiAgICAgICAgb3V0WzddID0gYVsxM107XG4gICAgICAgIG91dFs4XSA9IGFbMl07XG4gICAgICAgIG91dFs5XSA9IGFbNl07XG4gICAgICAgIG91dFsxMF0gPSBhWzEwXTtcbiAgICAgICAgb3V0WzExXSA9IGFbMTRdO1xuICAgICAgICBvdXRbMTJdID0gYVszXTtcbiAgICAgICAgb3V0WzEzXSA9IGFbN107XG4gICAgICAgIG91dFsxNF0gPSBhWzExXTtcbiAgICAgICAgb3V0WzE1XSA9IGFbMTVdO1xuICAgIH1cblxuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogSW52ZXJ0cyBhIG1hdDRcbiAqXG4gKiBAcGFyYW0ge21hdDR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQ0fSBhIHRoZSBzb3VyY2UgbWF0cml4XG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpbnZlcnQob3V0LCBhKSB7XG4gICAgbGV0IGEwMCA9IGFbMF0sXG4gICAgICAgIGEwMSA9IGFbMV0sXG4gICAgICAgIGEwMiA9IGFbMl0sXG4gICAgICAgIGEwMyA9IGFbM107XG4gICAgbGV0IGExMCA9IGFbNF0sXG4gICAgICAgIGExMSA9IGFbNV0sXG4gICAgICAgIGExMiA9IGFbNl0sXG4gICAgICAgIGExMyA9IGFbN107XG4gICAgbGV0IGEyMCA9IGFbOF0sXG4gICAgICAgIGEyMSA9IGFbOV0sXG4gICAgICAgIGEyMiA9IGFbMTBdLFxuICAgICAgICBhMjMgPSBhWzExXTtcbiAgICBsZXQgYTMwID0gYVsxMl0sXG4gICAgICAgIGEzMSA9IGFbMTNdLFxuICAgICAgICBhMzIgPSBhWzE0XSxcbiAgICAgICAgYTMzID0gYVsxNV07XG5cbiAgICBsZXQgYjAwID0gYTAwICogYTExIC0gYTAxICogYTEwO1xuICAgIGxldCBiMDEgPSBhMDAgKiBhMTIgLSBhMDIgKiBhMTA7XG4gICAgbGV0IGIwMiA9IGEwMCAqIGExMyAtIGEwMyAqIGExMDtcbiAgICBsZXQgYjAzID0gYTAxICogYTEyIC0gYTAyICogYTExO1xuICAgIGxldCBiMDQgPSBhMDEgKiBhMTMgLSBhMDMgKiBhMTE7XG4gICAgbGV0IGIwNSA9IGEwMiAqIGExMyAtIGEwMyAqIGExMjtcbiAgICBsZXQgYjA2ID0gYTIwICogYTMxIC0gYTIxICogYTMwO1xuICAgIGxldCBiMDcgPSBhMjAgKiBhMzIgLSBhMjIgKiBhMzA7XG4gICAgbGV0IGIwOCA9IGEyMCAqIGEzMyAtIGEyMyAqIGEzMDtcbiAgICBsZXQgYjA5ID0gYTIxICogYTMyIC0gYTIyICogYTMxO1xuICAgIGxldCBiMTAgPSBhMjEgKiBhMzMgLSBhMjMgKiBhMzE7XG4gICAgbGV0IGIxMSA9IGEyMiAqIGEzMyAtIGEyMyAqIGEzMjtcblxuICAgIC8vIENhbGN1bGF0ZSB0aGUgZGV0ZXJtaW5hbnRcbiAgICBsZXQgZGV0ID0gYjAwICogYjExIC0gYjAxICogYjEwICsgYjAyICogYjA5ICsgYjAzICogYjA4IC0gYjA0ICogYjA3ICsgYjA1ICogYjA2O1xuXG4gICAgaWYgKCFkZXQpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGRldCA9IDEuMCAvIGRldDtcblxuICAgIG91dFswXSA9IChhMTEgKiBiMTEgLSBhMTIgKiBiMTAgKyBhMTMgKiBiMDkpICogZGV0O1xuICAgIG91dFsxXSA9IChhMDIgKiBiMTAgLSBhMDEgKiBiMTEgLSBhMDMgKiBiMDkpICogZGV0O1xuICAgIG91dFsyXSA9IChhMzEgKiBiMDUgLSBhMzIgKiBiMDQgKyBhMzMgKiBiMDMpICogZGV0O1xuICAgIG91dFszXSA9IChhMjIgKiBiMDQgLSBhMjEgKiBiMDUgLSBhMjMgKiBiMDMpICogZGV0O1xuICAgIG91dFs0XSA9IChhMTIgKiBiMDggLSBhMTAgKiBiMTEgLSBhMTMgKiBiMDcpICogZGV0O1xuICAgIG91dFs1XSA9IChhMDAgKiBiMTEgLSBhMDIgKiBiMDggKyBhMDMgKiBiMDcpICogZGV0O1xuICAgIG91dFs2XSA9IChhMzIgKiBiMDIgLSBhMzAgKiBiMDUgLSBhMzMgKiBiMDEpICogZGV0O1xuICAgIG91dFs3XSA9IChhMjAgKiBiMDUgLSBhMjIgKiBiMDIgKyBhMjMgKiBiMDEpICogZGV0O1xuICAgIG91dFs4XSA9IChhMTAgKiBiMTAgLSBhMTEgKiBiMDggKyBhMTMgKiBiMDYpICogZGV0O1xuICAgIG91dFs5XSA9IChhMDEgKiBiMDggLSBhMDAgKiBiMTAgLSBhMDMgKiBiMDYpICogZGV0O1xuICAgIG91dFsxMF0gPSAoYTMwICogYjA0IC0gYTMxICogYjAyICsgYTMzICogYjAwKSAqIGRldDtcbiAgICBvdXRbMTFdID0gKGEyMSAqIGIwMiAtIGEyMCAqIGIwNCAtIGEyMyAqIGIwMCkgKiBkZXQ7XG4gICAgb3V0WzEyXSA9IChhMTEgKiBiMDcgLSBhMTAgKiBiMDkgLSBhMTIgKiBiMDYpICogZGV0O1xuICAgIG91dFsxM10gPSAoYTAwICogYjA5IC0gYTAxICogYjA3ICsgYTAyICogYjA2KSAqIGRldDtcbiAgICBvdXRbMTRdID0gKGEzMSAqIGIwMSAtIGEzMCAqIGIwMyAtIGEzMiAqIGIwMCkgKiBkZXQ7XG4gICAgb3V0WzE1XSA9IChhMjAgKiBiMDMgLSBhMjEgKiBiMDEgKyBhMjIgKiBiMDApICogZGV0O1xuXG4gICAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBkZXRlcm1pbmFudCBvZiBhIG1hdDRcbiAqXG4gKiBAcGFyYW0ge21hdDR9IGEgdGhlIHNvdXJjZSBtYXRyaXhcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IGRldGVybWluYW50IG9mIGFcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRldGVybWluYW50KGEpIHtcbiAgICBsZXQgYTAwID0gYVswXSxcbiAgICAgICAgYTAxID0gYVsxXSxcbiAgICAgICAgYTAyID0gYVsyXSxcbiAgICAgICAgYTAzID0gYVszXTtcbiAgICBsZXQgYTEwID0gYVs0XSxcbiAgICAgICAgYTExID0gYVs1XSxcbiAgICAgICAgYTEyID0gYVs2XSxcbiAgICAgICAgYTEzID0gYVs3XTtcbiAgICBsZXQgYTIwID0gYVs4XSxcbiAgICAgICAgYTIxID0gYVs5XSxcbiAgICAgICAgYTIyID0gYVsxMF0sXG4gICAgICAgIGEyMyA9IGFbMTFdO1xuICAgIGxldCBhMzAgPSBhWzEyXSxcbiAgICAgICAgYTMxID0gYVsxM10sXG4gICAgICAgIGEzMiA9IGFbMTRdLFxuICAgICAgICBhMzMgPSBhWzE1XTtcblxuICAgIGxldCBiMDAgPSBhMDAgKiBhMTEgLSBhMDEgKiBhMTA7XG4gICAgbGV0IGIwMSA9IGEwMCAqIGExMiAtIGEwMiAqIGExMDtcbiAgICBsZXQgYjAyID0gYTAwICogYTEzIC0gYTAzICogYTEwO1xuICAgIGxldCBiMDMgPSBhMDEgKiBhMTIgLSBhMDIgKiBhMTE7XG4gICAgbGV0IGIwNCA9IGEwMSAqIGExMyAtIGEwMyAqIGExMTtcbiAgICBsZXQgYjA1ID0gYTAyICogYTEzIC0gYTAzICogYTEyO1xuICAgIGxldCBiMDYgPSBhMjAgKiBhMzEgLSBhMjEgKiBhMzA7XG4gICAgbGV0IGIwNyA9IGEyMCAqIGEzMiAtIGEyMiAqIGEzMDtcbiAgICBsZXQgYjA4ID0gYTIwICogYTMzIC0gYTIzICogYTMwO1xuICAgIGxldCBiMDkgPSBhMjEgKiBhMzIgLSBhMjIgKiBhMzE7XG4gICAgbGV0IGIxMCA9IGEyMSAqIGEzMyAtIGEyMyAqIGEzMTtcbiAgICBsZXQgYjExID0gYTIyICogYTMzIC0gYTIzICogYTMyO1xuXG4gICAgLy8gQ2FsY3VsYXRlIHRoZSBkZXRlcm1pbmFudFxuICAgIHJldHVybiBiMDAgKiBiMTEgLSBiMDEgKiBiMTAgKyBiMDIgKiBiMDkgKyBiMDMgKiBiMDggLSBiMDQgKiBiMDcgKyBiMDUgKiBiMDY7XG59XG5cbi8qKlxuICogTXVsdGlwbGllcyB0d28gbWF0NHNcbiAqXG4gKiBAcGFyYW0ge21hdDR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQ0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge21hdDR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtdWx0aXBseShvdXQsIGEsIGIpIHtcbiAgICBsZXQgYTAwID0gYVswXSxcbiAgICAgICAgYTAxID0gYVsxXSxcbiAgICAgICAgYTAyID0gYVsyXSxcbiAgICAgICAgYTAzID0gYVszXTtcbiAgICBsZXQgYTEwID0gYVs0XSxcbiAgICAgICAgYTExID0gYVs1XSxcbiAgICAgICAgYTEyID0gYVs2XSxcbiAgICAgICAgYTEzID0gYVs3XTtcbiAgICBsZXQgYTIwID0gYVs4XSxcbiAgICAgICAgYTIxID0gYVs5XSxcbiAgICAgICAgYTIyID0gYVsxMF0sXG4gICAgICAgIGEyMyA9IGFbMTFdO1xuICAgIGxldCBhMzAgPSBhWzEyXSxcbiAgICAgICAgYTMxID0gYVsxM10sXG4gICAgICAgIGEzMiA9IGFbMTRdLFxuICAgICAgICBhMzMgPSBhWzE1XTtcblxuICAgIC8vIENhY2hlIG9ubHkgdGhlIGN1cnJlbnQgbGluZSBvZiB0aGUgc2Vjb25kIG1hdHJpeFxuICAgIGxldCBiMCA9IGJbMF0sXG4gICAgICAgIGIxID0gYlsxXSxcbiAgICAgICAgYjIgPSBiWzJdLFxuICAgICAgICBiMyA9IGJbM107XG4gICAgb3V0WzBdID0gYjAgKiBhMDAgKyBiMSAqIGExMCArIGIyICogYTIwICsgYjMgKiBhMzA7XG4gICAgb3V0WzFdID0gYjAgKiBhMDEgKyBiMSAqIGExMSArIGIyICogYTIxICsgYjMgKiBhMzE7XG4gICAgb3V0WzJdID0gYjAgKiBhMDIgKyBiMSAqIGExMiArIGIyICogYTIyICsgYjMgKiBhMzI7XG4gICAgb3V0WzNdID0gYjAgKiBhMDMgKyBiMSAqIGExMyArIGIyICogYTIzICsgYjMgKiBhMzM7XG5cbiAgICBiMCA9IGJbNF07XG4gICAgYjEgPSBiWzVdO1xuICAgIGIyID0gYls2XTtcbiAgICBiMyA9IGJbN107XG4gICAgb3V0WzRdID0gYjAgKiBhMDAgKyBiMSAqIGExMCArIGIyICogYTIwICsgYjMgKiBhMzA7XG4gICAgb3V0WzVdID0gYjAgKiBhMDEgKyBiMSAqIGExMSArIGIyICogYTIxICsgYjMgKiBhMzE7XG4gICAgb3V0WzZdID0gYjAgKiBhMDIgKyBiMSAqIGExMiArIGIyICogYTIyICsgYjMgKiBhMzI7XG4gICAgb3V0WzddID0gYjAgKiBhMDMgKyBiMSAqIGExMyArIGIyICogYTIzICsgYjMgKiBhMzM7XG5cbiAgICBiMCA9IGJbOF07XG4gICAgYjEgPSBiWzldO1xuICAgIGIyID0gYlsxMF07XG4gICAgYjMgPSBiWzExXTtcbiAgICBvdXRbOF0gPSBiMCAqIGEwMCArIGIxICogYTEwICsgYjIgKiBhMjAgKyBiMyAqIGEzMDtcbiAgICBvdXRbOV0gPSBiMCAqIGEwMSArIGIxICogYTExICsgYjIgKiBhMjEgKyBiMyAqIGEzMTtcbiAgICBvdXRbMTBdID0gYjAgKiBhMDIgKyBiMSAqIGExMiArIGIyICogYTIyICsgYjMgKiBhMzI7XG4gICAgb3V0WzExXSA9IGIwICogYTAzICsgYjEgKiBhMTMgKyBiMiAqIGEyMyArIGIzICogYTMzO1xuXG4gICAgYjAgPSBiWzEyXTtcbiAgICBiMSA9IGJbMTNdO1xuICAgIGIyID0gYlsxNF07XG4gICAgYjMgPSBiWzE1XTtcbiAgICBvdXRbMTJdID0gYjAgKiBhMDAgKyBiMSAqIGExMCArIGIyICogYTIwICsgYjMgKiBhMzA7XG4gICAgb3V0WzEzXSA9IGIwICogYTAxICsgYjEgKiBhMTEgKyBiMiAqIGEyMSArIGIzICogYTMxO1xuICAgIG91dFsxNF0gPSBiMCAqIGEwMiArIGIxICogYTEyICsgYjIgKiBhMjIgKyBiMyAqIGEzMjtcbiAgICBvdXRbMTVdID0gYjAgKiBhMDMgKyBiMSAqIGExMyArIGIyICogYTIzICsgYjMgKiBhMzM7XG4gICAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBUcmFuc2xhdGUgYSBtYXQ0IGJ5IHRoZSBnaXZlbiB2ZWN0b3JcbiAqXG4gKiBAcGFyYW0ge21hdDR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQ0fSBhIHRoZSBtYXRyaXggdG8gdHJhbnNsYXRlXG4gKiBAcGFyYW0ge3ZlYzN9IHYgdmVjdG9yIHRvIHRyYW5zbGF0ZSBieVxuICogQHJldHVybnMge21hdDR9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gdHJhbnNsYXRlKG91dCwgYSwgdikge1xuICAgIGxldCB4ID0gdlswXSxcbiAgICAgICAgeSA9IHZbMV0sXG4gICAgICAgIHogPSB2WzJdO1xuICAgIGxldCBhMDAsIGEwMSwgYTAyLCBhMDM7XG4gICAgbGV0IGExMCwgYTExLCBhMTIsIGExMztcbiAgICBsZXQgYTIwLCBhMjEsIGEyMiwgYTIzO1xuXG4gICAgaWYgKGEgPT09IG91dCkge1xuICAgICAgICBvdXRbMTJdID0gYVswXSAqIHggKyBhWzRdICogeSArIGFbOF0gKiB6ICsgYVsxMl07XG4gICAgICAgIG91dFsxM10gPSBhWzFdICogeCArIGFbNV0gKiB5ICsgYVs5XSAqIHogKyBhWzEzXTtcbiAgICAgICAgb3V0WzE0XSA9IGFbMl0gKiB4ICsgYVs2XSAqIHkgKyBhWzEwXSAqIHogKyBhWzE0XTtcbiAgICAgICAgb3V0WzE1XSA9IGFbM10gKiB4ICsgYVs3XSAqIHkgKyBhWzExXSAqIHogKyBhWzE1XTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBhMDAgPSBhWzBdO1xuICAgICAgICBhMDEgPSBhWzFdO1xuICAgICAgICBhMDIgPSBhWzJdO1xuICAgICAgICBhMDMgPSBhWzNdO1xuICAgICAgICBhMTAgPSBhWzRdO1xuICAgICAgICBhMTEgPSBhWzVdO1xuICAgICAgICBhMTIgPSBhWzZdO1xuICAgICAgICBhMTMgPSBhWzddO1xuICAgICAgICBhMjAgPSBhWzhdO1xuICAgICAgICBhMjEgPSBhWzldO1xuICAgICAgICBhMjIgPSBhWzEwXTtcbiAgICAgICAgYTIzID0gYVsxMV07XG5cbiAgICAgICAgb3V0WzBdID0gYTAwO1xuICAgICAgICBvdXRbMV0gPSBhMDE7XG4gICAgICAgIG91dFsyXSA9IGEwMjtcbiAgICAgICAgb3V0WzNdID0gYTAzO1xuICAgICAgICBvdXRbNF0gPSBhMTA7XG4gICAgICAgIG91dFs1XSA9IGExMTtcbiAgICAgICAgb3V0WzZdID0gYTEyO1xuICAgICAgICBvdXRbN10gPSBhMTM7XG4gICAgICAgIG91dFs4XSA9IGEyMDtcbiAgICAgICAgb3V0WzldID0gYTIxO1xuICAgICAgICBvdXRbMTBdID0gYTIyO1xuICAgICAgICBvdXRbMTFdID0gYTIzO1xuXG4gICAgICAgIG91dFsxMl0gPSBhMDAgKiB4ICsgYTEwICogeSArIGEyMCAqIHogKyBhWzEyXTtcbiAgICAgICAgb3V0WzEzXSA9IGEwMSAqIHggKyBhMTEgKiB5ICsgYTIxICogeiArIGFbMTNdO1xuICAgICAgICBvdXRbMTRdID0gYTAyICogeCArIGExMiAqIHkgKyBhMjIgKiB6ICsgYVsxNF07XG4gICAgICAgIG91dFsxNV0gPSBhMDMgKiB4ICsgYTEzICogeSArIGEyMyAqIHogKyBhWzE1XTtcbiAgICB9XG5cbiAgICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFNjYWxlcyB0aGUgbWF0NCBieSB0aGUgZGltZW5zaW9ucyBpbiB0aGUgZ2l2ZW4gdmVjMyBub3QgdXNpbmcgdmVjdG9yaXphdGlvblxuICpcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDR9IGEgdGhlIG1hdHJpeCB0byBzY2FsZVxuICogQHBhcmFtIHt2ZWMzfSB2IHRoZSB2ZWMzIHRvIHNjYWxlIHRoZSBtYXRyaXggYnlcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcbiAqKi9cbmV4cG9ydCBmdW5jdGlvbiBzY2FsZShvdXQsIGEsIHYpIHtcbiAgICBsZXQgeCA9IHZbMF0sXG4gICAgICAgIHkgPSB2WzFdLFxuICAgICAgICB6ID0gdlsyXTtcblxuICAgIG91dFswXSA9IGFbMF0gKiB4O1xuICAgIG91dFsxXSA9IGFbMV0gKiB4O1xuICAgIG91dFsyXSA9IGFbMl0gKiB4O1xuICAgIG91dFszXSA9IGFbM10gKiB4O1xuICAgIG91dFs0XSA9IGFbNF0gKiB5O1xuICAgIG91dFs1XSA9IGFbNV0gKiB5O1xuICAgIG91dFs2XSA9IGFbNl0gKiB5O1xuICAgIG91dFs3XSA9IGFbN10gKiB5O1xuICAgIG91dFs4XSA9IGFbOF0gKiB6O1xuICAgIG91dFs5XSA9IGFbOV0gKiB6O1xuICAgIG91dFsxMF0gPSBhWzEwXSAqIHo7XG4gICAgb3V0WzExXSA9IGFbMTFdICogejtcbiAgICBvdXRbMTJdID0gYVsxMl07XG4gICAgb3V0WzEzXSA9IGFbMTNdO1xuICAgIG91dFsxNF0gPSBhWzE0XTtcbiAgICBvdXRbMTVdID0gYVsxNV07XG4gICAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBSb3RhdGVzIGEgbWF0NCBieSB0aGUgZ2l2ZW4gYW5nbGUgYXJvdW5kIHRoZSBnaXZlbiBheGlzXG4gKlxuICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0NH0gYSB0aGUgbWF0cml4IHRvIHJvdGF0ZVxuICogQHBhcmFtIHtOdW1iZXJ9IHJhZCB0aGUgYW5nbGUgdG8gcm90YXRlIHRoZSBtYXRyaXggYnlcbiAqIEBwYXJhbSB7dmVjM30gYXhpcyB0aGUgYXhpcyB0byByb3RhdGUgYXJvdW5kXG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByb3RhdGUob3V0LCBhLCByYWQsIGF4aXMpIHtcbiAgICBsZXQgeCA9IGF4aXNbMF0sXG4gICAgICAgIHkgPSBheGlzWzFdLFxuICAgICAgICB6ID0gYXhpc1syXTtcbiAgICBsZXQgbGVuID0gTWF0aC5oeXBvdCh4LCB5LCB6KTtcbiAgICBsZXQgcywgYywgdDtcbiAgICBsZXQgYTAwLCBhMDEsIGEwMiwgYTAzO1xuICAgIGxldCBhMTAsIGExMSwgYTEyLCBhMTM7XG4gICAgbGV0IGEyMCwgYTIxLCBhMjIsIGEyMztcbiAgICBsZXQgYjAwLCBiMDEsIGIwMjtcbiAgICBsZXQgYjEwLCBiMTEsIGIxMjtcbiAgICBsZXQgYjIwLCBiMjEsIGIyMjtcblxuICAgIGlmIChNYXRoLmFicyhsZW4pIDwgRVBTSUxPTikge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBsZW4gPSAxIC8gbGVuO1xuICAgIHggKj0gbGVuO1xuICAgIHkgKj0gbGVuO1xuICAgIHogKj0gbGVuO1xuXG4gICAgcyA9IE1hdGguc2luKHJhZCk7XG4gICAgYyA9IE1hdGguY29zKHJhZCk7XG4gICAgdCA9IDEgLSBjO1xuXG4gICAgYTAwID0gYVswXTtcbiAgICBhMDEgPSBhWzFdO1xuICAgIGEwMiA9IGFbMl07XG4gICAgYTAzID0gYVszXTtcbiAgICBhMTAgPSBhWzRdO1xuICAgIGExMSA9IGFbNV07XG4gICAgYTEyID0gYVs2XTtcbiAgICBhMTMgPSBhWzddO1xuICAgIGEyMCA9IGFbOF07XG4gICAgYTIxID0gYVs5XTtcbiAgICBhMjIgPSBhWzEwXTtcbiAgICBhMjMgPSBhWzExXTtcblxuICAgIC8vIENvbnN0cnVjdCB0aGUgZWxlbWVudHMgb2YgdGhlIHJvdGF0aW9uIG1hdHJpeFxuICAgIGIwMCA9IHggKiB4ICogdCArIGM7XG4gICAgYjAxID0geSAqIHggKiB0ICsgeiAqIHM7XG4gICAgYjAyID0geiAqIHggKiB0IC0geSAqIHM7XG4gICAgYjEwID0geCAqIHkgKiB0IC0geiAqIHM7XG4gICAgYjExID0geSAqIHkgKiB0ICsgYztcbiAgICBiMTIgPSB6ICogeSAqIHQgKyB4ICogcztcbiAgICBiMjAgPSB4ICogeiAqIHQgKyB5ICogcztcbiAgICBiMjEgPSB5ICogeiAqIHQgLSB4ICogcztcbiAgICBiMjIgPSB6ICogeiAqIHQgKyBjO1xuXG4gICAgLy8gUGVyZm9ybSByb3RhdGlvbi1zcGVjaWZpYyBtYXRyaXggbXVsdGlwbGljYXRpb25cbiAgICBvdXRbMF0gPSBhMDAgKiBiMDAgKyBhMTAgKiBiMDEgKyBhMjAgKiBiMDI7XG4gICAgb3V0WzFdID0gYTAxICogYjAwICsgYTExICogYjAxICsgYTIxICogYjAyO1xuICAgIG91dFsyXSA9IGEwMiAqIGIwMCArIGExMiAqIGIwMSArIGEyMiAqIGIwMjtcbiAgICBvdXRbM10gPSBhMDMgKiBiMDAgKyBhMTMgKiBiMDEgKyBhMjMgKiBiMDI7XG4gICAgb3V0WzRdID0gYTAwICogYjEwICsgYTEwICogYjExICsgYTIwICogYjEyO1xuICAgIG91dFs1XSA9IGEwMSAqIGIxMCArIGExMSAqIGIxMSArIGEyMSAqIGIxMjtcbiAgICBvdXRbNl0gPSBhMDIgKiBiMTAgKyBhMTIgKiBiMTEgKyBhMjIgKiBiMTI7XG4gICAgb3V0WzddID0gYTAzICogYjEwICsgYTEzICogYjExICsgYTIzICogYjEyO1xuICAgIG91dFs4XSA9IGEwMCAqIGIyMCArIGExMCAqIGIyMSArIGEyMCAqIGIyMjtcbiAgICBvdXRbOV0gPSBhMDEgKiBiMjAgKyBhMTEgKiBiMjEgKyBhMjEgKiBiMjI7XG4gICAgb3V0WzEwXSA9IGEwMiAqIGIyMCArIGExMiAqIGIyMSArIGEyMiAqIGIyMjtcbiAgICBvdXRbMTFdID0gYTAzICogYjIwICsgYTEzICogYjIxICsgYTIzICogYjIyO1xuXG4gICAgaWYgKGEgIT09IG91dCkge1xuICAgICAgICAvLyBJZiB0aGUgc291cmNlIGFuZCBkZXN0aW5hdGlvbiBkaWZmZXIsIGNvcHkgdGhlIHVuY2hhbmdlZCBsYXN0IHJvd1xuICAgICAgICBvdXRbMTJdID0gYVsxMl07XG4gICAgICAgIG91dFsxM10gPSBhWzEzXTtcbiAgICAgICAgb3V0WzE0XSA9IGFbMTRdO1xuICAgICAgICBvdXRbMTVdID0gYVsxNV07XG4gICAgfVxuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgdHJhbnNsYXRpb24gdmVjdG9yIGNvbXBvbmVudCBvZiBhIHRyYW5zZm9ybWF0aW9uXG4gKiAgbWF0cml4LiBJZiBhIG1hdHJpeCBpcyBidWlsdCB3aXRoIGZyb21Sb3RhdGlvblRyYW5zbGF0aW9uLFxuICogIHRoZSByZXR1cm5lZCB2ZWN0b3Igd2lsbCBiZSB0aGUgc2FtZSBhcyB0aGUgdHJhbnNsYXRpb24gdmVjdG9yXG4gKiAgb3JpZ2luYWxseSBzdXBwbGllZC5cbiAqIEBwYXJhbSAge3ZlYzN9IG91dCBWZWN0b3IgdG8gcmVjZWl2ZSB0cmFuc2xhdGlvbiBjb21wb25lbnRcbiAqIEBwYXJhbSAge21hdDR9IG1hdCBNYXRyaXggdG8gYmUgZGVjb21wb3NlZCAoaW5wdXQpXG4gKiBAcmV0dXJuIHt2ZWMzfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFRyYW5zbGF0aW9uKG91dCwgbWF0KSB7XG4gICAgb3V0WzBdID0gbWF0WzEyXTtcbiAgICBvdXRbMV0gPSBtYXRbMTNdO1xuICAgIG91dFsyXSA9IG1hdFsxNF07XG5cbiAgICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIHNjYWxpbmcgZmFjdG9yIGNvbXBvbmVudCBvZiBhIHRyYW5zZm9ybWF0aW9uXG4gKiAgbWF0cml4LiBJZiBhIG1hdHJpeCBpcyBidWlsdCB3aXRoIGZyb21Sb3RhdGlvblRyYW5zbGF0aW9uU2NhbGVcbiAqICB3aXRoIGEgbm9ybWFsaXplZCBRdWF0ZXJuaW9uIHBhcmFtdGVyLCB0aGUgcmV0dXJuZWQgdmVjdG9yIHdpbGwgYmVcbiAqICB0aGUgc2FtZSBhcyB0aGUgc2NhbGluZyB2ZWN0b3JcbiAqICBvcmlnaW5hbGx5IHN1cHBsaWVkLlxuICogQHBhcmFtICB7dmVjM30gb3V0IFZlY3RvciB0byByZWNlaXZlIHNjYWxpbmcgZmFjdG9yIGNvbXBvbmVudFxuICogQHBhcmFtICB7bWF0NH0gbWF0IE1hdHJpeCB0byBiZSBkZWNvbXBvc2VkIChpbnB1dClcbiAqIEByZXR1cm4ge3ZlYzN9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0U2NhbGluZyhvdXQsIG1hdCkge1xuICAgIGxldCBtMTEgPSBtYXRbMF07XG4gICAgbGV0IG0xMiA9IG1hdFsxXTtcbiAgICBsZXQgbTEzID0gbWF0WzJdO1xuICAgIGxldCBtMjEgPSBtYXRbNF07XG4gICAgbGV0IG0yMiA9IG1hdFs1XTtcbiAgICBsZXQgbTIzID0gbWF0WzZdO1xuICAgIGxldCBtMzEgPSBtYXRbOF07XG4gICAgbGV0IG0zMiA9IG1hdFs5XTtcbiAgICBsZXQgbTMzID0gbWF0WzEwXTtcblxuICAgIG91dFswXSA9IE1hdGguaHlwb3QobTExLCBtMTIsIG0xMyk7XG4gICAgb3V0WzFdID0gTWF0aC5oeXBvdChtMjEsIG0yMiwgbTIzKTtcbiAgICBvdXRbMl0gPSBNYXRoLmh5cG90KG0zMSwgbTMyLCBtMzMpO1xuXG4gICAgcmV0dXJuIG91dDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldE1heFNjYWxlT25BeGlzKG1hdCkge1xuICAgIGxldCBtMTEgPSBtYXRbMF07XG4gICAgbGV0IG0xMiA9IG1hdFsxXTtcbiAgICBsZXQgbTEzID0gbWF0WzJdO1xuICAgIGxldCBtMjEgPSBtYXRbNF07XG4gICAgbGV0IG0yMiA9IG1hdFs1XTtcbiAgICBsZXQgbTIzID0gbWF0WzZdO1xuICAgIGxldCBtMzEgPSBtYXRbOF07XG4gICAgbGV0IG0zMiA9IG1hdFs5XTtcbiAgICBsZXQgbTMzID0gbWF0WzEwXTtcblxuICAgIGNvbnN0IHggPSBtMTEgKiBtMTEgKyBtMTIgKiBtMTIgKyBtMTMgKiBtMTM7XG4gICAgY29uc3QgeSA9IG0yMSAqIG0yMSArIG0yMiAqIG0yMiArIG0yMyAqIG0yMztcbiAgICBjb25zdCB6ID0gbTMxICogbTMxICsgbTMyICogbTMyICsgbTMzICogbTMzO1xuXG4gICAgcmV0dXJuIE1hdGguc3FydChNYXRoLm1heCh4LCB5LCB6KSk7XG59XG5cbi8qKlxuICogUmV0dXJucyBhIHF1YXRlcm5pb24gcmVwcmVzZW50aW5nIHRoZSByb3RhdGlvbmFsIGNvbXBvbmVudFxuICogIG9mIGEgdHJhbnNmb3JtYXRpb24gbWF0cml4LiBJZiBhIG1hdHJpeCBpcyBidWlsdCB3aXRoXG4gKiAgZnJvbVJvdGF0aW9uVHJhbnNsYXRpb24sIHRoZSByZXR1cm5lZCBxdWF0ZXJuaW9uIHdpbGwgYmUgdGhlXG4gKiAgc2FtZSBhcyB0aGUgcXVhdGVybmlvbiBvcmlnaW5hbGx5IHN1cHBsaWVkLlxuICogQHBhcmFtIHtxdWF0fSBvdXQgUXVhdGVybmlvbiB0byByZWNlaXZlIHRoZSByb3RhdGlvbiBjb21wb25lbnRcbiAqIEBwYXJhbSB7bWF0NH0gbWF0IE1hdHJpeCB0byBiZSBkZWNvbXBvc2VkIChpbnB1dClcbiAqIEByZXR1cm4ge3F1YXR9IG91dFxuICovXG5leHBvcnQgY29uc3QgZ2V0Um90YXRpb24gPSAoZnVuY3Rpb24gKCkge1xuICAgIGNvbnN0IHRlbXAgPSBbMCwgMCwgMF07XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gKG91dCwgbWF0KSB7XG4gICAgICAgIGxldCBzY2FsaW5nID0gdGVtcDtcbiAgICAgICAgZ2V0U2NhbGluZyhzY2FsaW5nLCBtYXQpO1xuXG4gICAgICAgIGxldCBpczEgPSAxIC8gc2NhbGluZ1swXTtcbiAgICAgICAgbGV0IGlzMiA9IDEgLyBzY2FsaW5nWzFdO1xuICAgICAgICBsZXQgaXMzID0gMSAvIHNjYWxpbmdbMl07XG5cbiAgICAgICAgbGV0IHNtMTEgPSBtYXRbMF0gKiBpczE7XG4gICAgICAgIGxldCBzbTEyID0gbWF0WzFdICogaXMyO1xuICAgICAgICBsZXQgc20xMyA9IG1hdFsyXSAqIGlzMztcbiAgICAgICAgbGV0IHNtMjEgPSBtYXRbNF0gKiBpczE7XG4gICAgICAgIGxldCBzbTIyID0gbWF0WzVdICogaXMyO1xuICAgICAgICBsZXQgc20yMyA9IG1hdFs2XSAqIGlzMztcbiAgICAgICAgbGV0IHNtMzEgPSBtYXRbOF0gKiBpczE7XG4gICAgICAgIGxldCBzbTMyID0gbWF0WzldICogaXMyO1xuICAgICAgICBsZXQgc20zMyA9IG1hdFsxMF0gKiBpczM7XG5cbiAgICAgICAgbGV0IHRyYWNlID0gc20xMSArIHNtMjIgKyBzbTMzO1xuICAgICAgICBsZXQgUyA9IDA7XG5cbiAgICAgICAgaWYgKHRyYWNlID4gMCkge1xuICAgICAgICAgICAgUyA9IE1hdGguc3FydCh0cmFjZSArIDEuMCkgKiAyO1xuICAgICAgICAgICAgb3V0WzNdID0gMC4yNSAqIFM7XG4gICAgICAgICAgICBvdXRbMF0gPSAoc20yMyAtIHNtMzIpIC8gUztcbiAgICAgICAgICAgIG91dFsxXSA9IChzbTMxIC0gc20xMykgLyBTO1xuICAgICAgICAgICAgb3V0WzJdID0gKHNtMTIgLSBzbTIxKSAvIFM7XG4gICAgICAgIH0gZWxzZSBpZiAoc20xMSA+IHNtMjIgJiYgc20xMSA+IHNtMzMpIHtcbiAgICAgICAgICAgIFMgPSBNYXRoLnNxcnQoMS4wICsgc20xMSAtIHNtMjIgLSBzbTMzKSAqIDI7XG4gICAgICAgICAgICBvdXRbM10gPSAoc20yMyAtIHNtMzIpIC8gUztcbiAgICAgICAgICAgIG91dFswXSA9IDAuMjUgKiBTO1xuICAgICAgICAgICAgb3V0WzFdID0gKHNtMTIgKyBzbTIxKSAvIFM7XG4gICAgICAgICAgICBvdXRbMl0gPSAoc20zMSArIHNtMTMpIC8gUztcbiAgICAgICAgfSBlbHNlIGlmIChzbTIyID4gc20zMykge1xuICAgICAgICAgICAgUyA9IE1hdGguc3FydCgxLjAgKyBzbTIyIC0gc20xMSAtIHNtMzMpICogMjtcbiAgICAgICAgICAgIG91dFszXSA9IChzbTMxIC0gc20xMykgLyBTO1xuICAgICAgICAgICAgb3V0WzBdID0gKHNtMTIgKyBzbTIxKSAvIFM7XG4gICAgICAgICAgICBvdXRbMV0gPSAwLjI1ICogUztcbiAgICAgICAgICAgIG91dFsyXSA9IChzbTIzICsgc20zMikgLyBTO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgUyA9IE1hdGguc3FydCgxLjAgKyBzbTMzIC0gc20xMSAtIHNtMjIpICogMjtcbiAgICAgICAgICAgIG91dFszXSA9IChzbTEyIC0gc20yMSkgLyBTO1xuICAgICAgICAgICAgb3V0WzBdID0gKHNtMzEgKyBzbTEzKSAvIFM7XG4gICAgICAgICAgICBvdXRbMV0gPSAoc20yMyArIHNtMzIpIC8gUztcbiAgICAgICAgICAgIG91dFsyXSA9IDAuMjUgKiBTO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG91dDtcbiAgICB9O1xufSkoKTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgbWF0cml4IGZyb20gYSBxdWF0ZXJuaW9uIHJvdGF0aW9uLCB2ZWN0b3IgdHJhbnNsYXRpb24gYW5kIHZlY3RvciBzY2FsZVxuICogVGhpcyBpcyBlcXVpdmFsZW50IHRvIChidXQgbXVjaCBmYXN0ZXIgdGhhbik6XG4gKlxuICogICAgIG1hdDQuaWRlbnRpdHkoZGVzdCk7XG4gKiAgICAgbWF0NC50cmFuc2xhdGUoZGVzdCwgdmVjKTtcbiAqICAgICBsZXQgcXVhdE1hdCA9IG1hdDQuY3JlYXRlKCk7XG4gKiAgICAgcXVhdDQudG9NYXQ0KHF1YXQsIHF1YXRNYXQpO1xuICogICAgIG1hdDQubXVsdGlwbHkoZGVzdCwgcXVhdE1hdCk7XG4gKiAgICAgbWF0NC5zY2FsZShkZXN0LCBzY2FsZSlcbiAqXG4gKiBAcGFyYW0ge21hdDR9IG91dCBtYXQ0IHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XG4gKiBAcGFyYW0ge3F1YXQ0fSBxIFJvdGF0aW9uIHF1YXRlcm5pb25cbiAqIEBwYXJhbSB7dmVjM30gdiBUcmFuc2xhdGlvbiB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjM30gcyBTY2FsaW5nIHZlY3RvclxuICogQHJldHVybnMge21hdDR9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gZnJvbVJvdGF0aW9uVHJhbnNsYXRpb25TY2FsZShvdXQsIHEsIHYsIHMpIHtcbiAgICAvLyBRdWF0ZXJuaW9uIG1hdGhcbiAgICBsZXQgeCA9IHFbMF0sXG4gICAgICAgIHkgPSBxWzFdLFxuICAgICAgICB6ID0gcVsyXSxcbiAgICAgICAgdyA9IHFbM107XG4gICAgbGV0IHgyID0geCArIHg7XG4gICAgbGV0IHkyID0geSArIHk7XG4gICAgbGV0IHoyID0geiArIHo7XG5cbiAgICBsZXQgeHggPSB4ICogeDI7XG4gICAgbGV0IHh5ID0geCAqIHkyO1xuICAgIGxldCB4eiA9IHggKiB6MjtcbiAgICBsZXQgeXkgPSB5ICogeTI7XG4gICAgbGV0IHl6ID0geSAqIHoyO1xuICAgIGxldCB6eiA9IHogKiB6MjtcbiAgICBsZXQgd3ggPSB3ICogeDI7XG4gICAgbGV0IHd5ID0gdyAqIHkyO1xuICAgIGxldCB3eiA9IHcgKiB6MjtcbiAgICBsZXQgc3ggPSBzWzBdO1xuICAgIGxldCBzeSA9IHNbMV07XG4gICAgbGV0IHN6ID0gc1syXTtcblxuICAgIG91dFswXSA9ICgxIC0gKHl5ICsgenopKSAqIHN4O1xuICAgIG91dFsxXSA9ICh4eSArIHd6KSAqIHN4O1xuICAgIG91dFsyXSA9ICh4eiAtIHd5KSAqIHN4O1xuICAgIG91dFszXSA9IDA7XG4gICAgb3V0WzRdID0gKHh5IC0gd3opICogc3k7XG4gICAgb3V0WzVdID0gKDEgLSAoeHggKyB6eikpICogc3k7XG4gICAgb3V0WzZdID0gKHl6ICsgd3gpICogc3k7XG4gICAgb3V0WzddID0gMDtcbiAgICBvdXRbOF0gPSAoeHogKyB3eSkgKiBzejtcbiAgICBvdXRbOV0gPSAoeXogLSB3eCkgKiBzejtcbiAgICBvdXRbMTBdID0gKDEgLSAoeHggKyB5eSkpICogc3o7XG4gICAgb3V0WzExXSA9IDA7XG4gICAgb3V0WzEyXSA9IHZbMF07XG4gICAgb3V0WzEzXSA9IHZbMV07XG4gICAgb3V0WzE0XSA9IHZbMl07XG4gICAgb3V0WzE1XSA9IDE7XG5cbiAgICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIENhbGN1bGF0ZXMgYSA0eDQgbWF0cml4IGZyb20gdGhlIGdpdmVuIHF1YXRlcm5pb25cbiAqXG4gKiBAcGFyYW0ge21hdDR9IG91dCBtYXQ0IHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XG4gKiBAcGFyYW0ge3F1YXR9IHEgUXVhdGVybmlvbiB0byBjcmVhdGUgbWF0cml4IGZyb21cbiAqXG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmcm9tUXVhdChvdXQsIHEpIHtcbiAgICBsZXQgeCA9IHFbMF0sXG4gICAgICAgIHkgPSBxWzFdLFxuICAgICAgICB6ID0gcVsyXSxcbiAgICAgICAgdyA9IHFbM107XG4gICAgbGV0IHgyID0geCArIHg7XG4gICAgbGV0IHkyID0geSArIHk7XG4gICAgbGV0IHoyID0geiArIHo7XG5cbiAgICBsZXQgeHggPSB4ICogeDI7XG4gICAgbGV0IHl4ID0geSAqIHgyO1xuICAgIGxldCB5eSA9IHkgKiB5MjtcbiAgICBsZXQgenggPSB6ICogeDI7XG4gICAgbGV0IHp5ID0geiAqIHkyO1xuICAgIGxldCB6eiA9IHogKiB6MjtcbiAgICBsZXQgd3ggPSB3ICogeDI7XG4gICAgbGV0IHd5ID0gdyAqIHkyO1xuICAgIGxldCB3eiA9IHcgKiB6MjtcblxuICAgIG91dFswXSA9IDEgLSB5eSAtIHp6O1xuICAgIG91dFsxXSA9IHl4ICsgd3o7XG4gICAgb3V0WzJdID0genggLSB3eTtcbiAgICBvdXRbM10gPSAwO1xuXG4gICAgb3V0WzRdID0geXggLSB3ejtcbiAgICBvdXRbNV0gPSAxIC0geHggLSB6ejtcbiAgICBvdXRbNl0gPSB6eSArIHd4O1xuICAgIG91dFs3XSA9IDA7XG5cbiAgICBvdXRbOF0gPSB6eCArIHd5O1xuICAgIG91dFs5XSA9IHp5IC0gd3g7XG4gICAgb3V0WzEwXSA9IDEgLSB4eCAtIHl5O1xuICAgIG91dFsxMV0gPSAwO1xuXG4gICAgb3V0WzEyXSA9IDA7XG4gICAgb3V0WzEzXSA9IDA7XG4gICAgb3V0WzE0XSA9IDA7XG4gICAgb3V0WzE1XSA9IDE7XG5cbiAgICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIEdlbmVyYXRlcyBhIHBlcnNwZWN0aXZlIHByb2plY3Rpb24gbWF0cml4IHdpdGggdGhlIGdpdmVuIGJvdW5kc1xuICpcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IG1hdDQgZnJ1c3R1bSBtYXRyaXggd2lsbCBiZSB3cml0dGVuIGludG9cbiAqIEBwYXJhbSB7bnVtYmVyfSBsZWZ0IFZlcnRpY2FsIGZpZWxkIG9mIHZpZXcgaW4gcmFkaWFuc1xuICogQHBhcmFtIHtudW1iZXJ9IHJpZ2h0IEFzcGVjdCByYXRpby4gdHlwaWNhbGx5IHZpZXdwb3J0IHdpZHRoL2hlaWdodFxuICogQHBhcmFtIHtudW1iZXJ9IHRvcCBWZXJ0aWNhbCBmaWVsZCBvZiB2aWV3IGluIHJhZGlhbnNcbiAqIEBwYXJhbSB7bnVtYmVyfSBib3R0b20gQXNwZWN0IHJhdGlvLiB0eXBpY2FsbHkgdmlld3BvcnQgd2lkdGgvaGVpZ2h0XG4gKiBAcGFyYW0ge251bWJlcn0gbmVhciBOZWFyIGJvdW5kIG9mIHRoZSBmcnVzdHVtXG4gKiBAcGFyYW0ge251bWJlcn0gZmFyIEZhciBib3VuZCBvZiB0aGUgZnJ1c3R1bVxuICogQHJldHVybnMge21hdDR9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gcGVyc3BlY3RpdmVGcnVzdHJ1bShvdXQsIGxlZnQsIHJpZ2h0LCB0b3AsIGJvdHRvbSwgbmVhciwgZmFyKSB7XG4gICAgdmFyIHggPSAyICogbmVhciAvICggcmlnaHQgLSBsZWZ0ICk7XG4gICAgdmFyIHkgPSAyICogbmVhciAvICggdG9wIC0gYm90dG9tICk7XG5cbiAgICB2YXIgYSA9ICggcmlnaHQgKyBsZWZ0ICkgLyAoIHJpZ2h0IC0gbGVmdCApO1xuICAgIHZhciBiID0gKCB0b3AgKyBib3R0b20gKSAvICggdG9wIC0gYm90dG9tICk7XG4gICAgdmFyIGMgPSAtICggZmFyICsgbmVhciApIC8gKCBmYXIgLSBuZWFyICk7XG4gICAgdmFyIGQgPSAtIDIgKiBmYXIgKiBuZWFyIC8gKCBmYXIgLSBuZWFyICk7XG5cbiAgICBvdXRbIDAgXSA9IHg7XHRvdXRbIDQgXSA9IDA7XHRvdXRbIDggXSA9IGE7XHRvdXRbIDEyIF0gPSAwO1xuICAgIG91dFsgMSBdID0gMDtcdG91dFsgNSBdID0geTtcdG91dFsgOSBdID0gYjtcdG91dFsgMTMgXSA9IDA7XG4gICAgb3V0WyAyIF0gPSAwO1x0b3V0WyA2IF0gPSAwO1x0b3V0WyAxMCBdID0gYztcdG91dFsgMTQgXSA9IGQ7XG4gICAgb3V0WyAzIF0gPSAwO1x0b3V0WyA3IF0gPSAwO1x0b3V0WyAxMSBdID0gLSAxO1x0b3V0WyAxNSBdID0gMDtcblxuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogR2VuZXJhdGVzIGEgcGVyc3BlY3RpdmUgcHJvamVjdGlvbiBtYXRyaXggd2l0aCB0aGUgZ2l2ZW4gYm91bmRzXG4gKlxuICogQHBhcmFtIHttYXQ0fSBvdXQgbWF0NCBmcnVzdHVtIG1hdHJpeCB3aWxsIGJlIHdyaXR0ZW4gaW50b1xuICogQHBhcmFtIHtudW1iZXJ9IGZvdnkgVmVydGljYWwgZmllbGQgb2YgdmlldyBpbiByYWRpYW5zXG4gKiBAcGFyYW0ge251bWJlcn0gYXNwZWN0IEFzcGVjdCByYXRpby4gdHlwaWNhbGx5IHZpZXdwb3J0IHdpZHRoL2hlaWdodFxuICogQHBhcmFtIHtudW1iZXJ9IG5lYXIgTmVhciBib3VuZCBvZiB0aGUgZnJ1c3R1bVxuICogQHBhcmFtIHtudW1iZXJ9IGZhciBGYXIgYm91bmQgb2YgdGhlIGZydXN0dW1cbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBlcnNwZWN0aXZlKG91dCwgZm92eSwgYXNwZWN0LCBuZWFyLCBmYXIpIHtcbiAgICBsZXQgZiA9IDEuMCAvIE1hdGgudGFuKGZvdnkgLyAyKTtcbiAgICBsZXQgbmYgPSAxIC8gKG5lYXIgLSBmYXIpO1xuICAgIG91dFswXSA9IGYgLyBhc3BlY3Q7XG4gICAgb3V0WzFdID0gMDtcbiAgICBvdXRbMl0gPSAwO1xuICAgIG91dFszXSA9IDA7XG4gICAgb3V0WzRdID0gMDtcbiAgICBvdXRbNV0gPSBmO1xuICAgIG91dFs2XSA9IDA7XG4gICAgb3V0WzddID0gMDtcbiAgICBvdXRbOF0gPSAwO1xuICAgIG91dFs5XSA9IDA7XG4gICAgb3V0WzEwXSA9IChmYXIgKyBuZWFyKSAqIG5mO1xuICAgIG91dFsxMV0gPSAtMTtcbiAgICBvdXRbMTJdID0gMDtcbiAgICBvdXRbMTNdID0gMDtcbiAgICBvdXRbMTRdID0gMiAqIGZhciAqIG5lYXIgKiBuZjtcbiAgICBvdXRbMTVdID0gMDtcbiAgICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIEdlbmVyYXRlcyBhIG9ydGhvZ29uYWwgcHJvamVjdGlvbiBtYXRyaXggd2l0aCB0aGUgZ2l2ZW4gYm91bmRzXG4gKlxuICogQHBhcmFtIHttYXQ0fSBvdXQgbWF0NCBmcnVzdHVtIG1hdHJpeCB3aWxsIGJlIHdyaXR0ZW4gaW50b1xuICogQHBhcmFtIHtudW1iZXJ9IGxlZnQgTGVmdCBib3VuZCBvZiB0aGUgZnJ1c3R1bVxuICogQHBhcmFtIHtudW1iZXJ9IHJpZ2h0IFJpZ2h0IGJvdW5kIG9mIHRoZSBmcnVzdHVtXG4gKiBAcGFyYW0ge251bWJlcn0gYm90dG9tIEJvdHRvbSBib3VuZCBvZiB0aGUgZnJ1c3R1bVxuICogQHBhcmFtIHtudW1iZXJ9IHRvcCBUb3AgYm91bmQgb2YgdGhlIGZydXN0dW1cbiAqIEBwYXJhbSB7bnVtYmVyfSBuZWFyIE5lYXIgYm91bmQgb2YgdGhlIGZydXN0dW1cbiAqIEBwYXJhbSB7bnVtYmVyfSBmYXIgRmFyIGJvdW5kIG9mIHRoZSBmcnVzdHVtXG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBvcnRobyhvdXQsIGxlZnQsIHJpZ2h0LCBib3R0b20sIHRvcCwgbmVhciwgZmFyKSB7XG4gICAgbGV0IGxyID0gMSAvIChsZWZ0IC0gcmlnaHQpO1xuICAgIGxldCBidCA9IDEgLyAoYm90dG9tIC0gdG9wKTtcbiAgICBsZXQgbmYgPSAxIC8gKG5lYXIgLSBmYXIpO1xuICAgIG91dFswXSA9IC0yICogbHI7XG4gICAgb3V0WzFdID0gMDtcbiAgICBvdXRbMl0gPSAwO1xuICAgIG91dFszXSA9IDA7XG4gICAgb3V0WzRdID0gMDtcbiAgICBvdXRbNV0gPSAtMiAqIGJ0O1xuICAgIG91dFs2XSA9IDA7XG4gICAgb3V0WzddID0gMDtcbiAgICBvdXRbOF0gPSAwO1xuICAgIG91dFs5XSA9IDA7XG4gICAgb3V0WzEwXSA9IDIgKiBuZjtcbiAgICBvdXRbMTFdID0gMDtcbiAgICBvdXRbMTJdID0gKGxlZnQgKyByaWdodCkgKiBscjtcbiAgICBvdXRbMTNdID0gKHRvcCArIGJvdHRvbSkgKiBidDtcbiAgICBvdXRbMTRdID0gKGZhciArIG5lYXIpICogbmY7XG4gICAgb3V0WzE1XSA9IDE7XG4gICAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBHZW5lcmF0ZXMgYSBtYXRyaXggdGhhdCBtYWtlcyBzb21ldGhpbmcgbG9vayBhdCBzb21ldGhpbmcgZWxzZS5cbiAqXG4gKiBAcGFyYW0ge21hdDR9IG91dCBtYXQ0IGZydXN0dW0gbWF0cml4IHdpbGwgYmUgd3JpdHRlbiBpbnRvXG4gKiBAcGFyYW0ge3ZlYzN9IGV5ZSBQb3NpdGlvbiBvZiB0aGUgdmlld2VyXG4gKiBAcGFyYW0ge3ZlYzN9IHRhcmdldCBQb2ludCB0aGUgdmlld2VyIGlzIGxvb2tpbmcgYXRcbiAqIEBwYXJhbSB7dmVjM30gdXAgdmVjMyBwb2ludGluZyB1cFxuICogQHJldHVybnMge21hdDR9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gdGFyZ2V0VG8ob3V0LCBleWUsIHRhcmdldCwgdXApIHtcbiAgICBsZXQgZXlleCA9IGV5ZVswXSxcbiAgICAgICAgZXlleSA9IGV5ZVsxXSxcbiAgICAgICAgZXlleiA9IGV5ZVsyXSxcbiAgICAgICAgdXB4ID0gdXBbMF0sXG4gICAgICAgIHVweSA9IHVwWzFdLFxuICAgICAgICB1cHogPSB1cFsyXTtcblxuICAgIGxldCB6MCA9IGV5ZXggLSB0YXJnZXRbMF0sXG4gICAgICAgIHoxID0gZXlleSAtIHRhcmdldFsxXSxcbiAgICAgICAgejIgPSBleWV6IC0gdGFyZ2V0WzJdO1xuXG4gICAgbGV0IGxlbiA9IHowICogejAgKyB6MSAqIHoxICsgejIgKiB6MjtcbiAgICBpZiAobGVuID09PSAwKSB7XG4gICAgICAgIC8vIGV5ZSBhbmQgdGFyZ2V0IGFyZSBpbiB0aGUgc2FtZSBwb3NpdGlvblxuICAgICAgICB6MiA9IDE7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgbGVuID0gMSAvIE1hdGguc3FydChsZW4pO1xuICAgICAgICB6MCAqPSBsZW47XG4gICAgICAgIHoxICo9IGxlbjtcbiAgICAgICAgejIgKj0gbGVuO1xuICAgIH1cblxuICAgIGxldCB4MCA9IHVweSAqIHoyIC0gdXB6ICogejEsXG4gICAgICAgIHgxID0gdXB6ICogejAgLSB1cHggKiB6MixcbiAgICAgICAgeDIgPSB1cHggKiB6MSAtIHVweSAqIHowO1xuXG4gICAgbGVuID0geDAgKiB4MCArIHgxICogeDEgKyB4MiAqIHgyO1xuICAgIGlmIChsZW4gPT09IDApIHtcbiAgICAgICAgLy8gdXAgYW5kIHogYXJlIHBhcmFsbGVsXG4gICAgICAgIGlmICh1cHopIHtcbiAgICAgICAgICAgIHVweCArPSAxZS02O1xuICAgICAgICB9IGVsc2UgaWYgKHVweSkge1xuICAgICAgICAgICAgdXB6ICs9IDFlLTY7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB1cHkgKz0gMWUtNjtcbiAgICAgICAgfVxuICAgICAgICAoeDAgPSB1cHkgKiB6MiAtIHVweiAqIHoxKSwgKHgxID0gdXB6ICogejAgLSB1cHggKiB6MiksICh4MiA9IHVweCAqIHoxIC0gdXB5ICogejApO1xuXG4gICAgICAgIGxlbiA9IHgwICogeDAgKyB4MSAqIHgxICsgeDIgKiB4MjtcbiAgICB9XG5cbiAgICBsZW4gPSAxIC8gTWF0aC5zcXJ0KGxlbik7XG4gICAgeDAgKj0gbGVuO1xuICAgIHgxICo9IGxlbjtcbiAgICB4MiAqPSBsZW47XG5cbiAgICBvdXRbMF0gPSB4MDtcbiAgICBvdXRbMV0gPSB4MTtcbiAgICBvdXRbMl0gPSB4MjtcbiAgICBvdXRbM10gPSAwO1xuICAgIG91dFs0XSA9IHoxICogeDIgLSB6MiAqIHgxO1xuICAgIG91dFs1XSA9IHoyICogeDAgLSB6MCAqIHgyO1xuICAgIG91dFs2XSA9IHowICogeDEgLSB6MSAqIHgwO1xuICAgIG91dFs3XSA9IDA7XG4gICAgb3V0WzhdID0gejA7XG4gICAgb3V0WzldID0gejE7XG4gICAgb3V0WzEwXSA9IHoyO1xuICAgIG91dFsxMV0gPSAwO1xuICAgIG91dFsxMl0gPSBleWV4O1xuICAgIG91dFsxM10gPSBleWV5O1xuICAgIG91dFsxNF0gPSBleWV6O1xuICAgIG91dFsxNV0gPSAxO1xuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogQWRkcyB0d28gbWF0NCdzXG4gKlxuICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0NH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHttYXQ0fSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge21hdDR9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gYWRkKG91dCwgYSwgYikge1xuICAgIG91dFswXSA9IGFbMF0gKyBiWzBdO1xuICAgIG91dFsxXSA9IGFbMV0gKyBiWzFdO1xuICAgIG91dFsyXSA9IGFbMl0gKyBiWzJdO1xuICAgIG91dFszXSA9IGFbM10gKyBiWzNdO1xuICAgIG91dFs0XSA9IGFbNF0gKyBiWzRdO1xuICAgIG91dFs1XSA9IGFbNV0gKyBiWzVdO1xuICAgIG91dFs2XSA9IGFbNl0gKyBiWzZdO1xuICAgIG91dFs3XSA9IGFbN10gKyBiWzddO1xuICAgIG91dFs4XSA9IGFbOF0gKyBiWzhdO1xuICAgIG91dFs5XSA9IGFbOV0gKyBiWzldO1xuICAgIG91dFsxMF0gPSBhWzEwXSArIGJbMTBdO1xuICAgIG91dFsxMV0gPSBhWzExXSArIGJbMTFdO1xuICAgIG91dFsxMl0gPSBhWzEyXSArIGJbMTJdO1xuICAgIG91dFsxM10gPSBhWzEzXSArIGJbMTNdO1xuICAgIG91dFsxNF0gPSBhWzE0XSArIGJbMTRdO1xuICAgIG91dFsxNV0gPSBhWzE1XSArIGJbMTVdO1xuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogU3VidHJhY3RzIG1hdHJpeCBiIGZyb20gbWF0cml4IGFcbiAqXG4gKiBAcGFyYW0ge21hdDR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQ0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge21hdDR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzdWJ0cmFjdChvdXQsIGEsIGIpIHtcbiAgICBvdXRbMF0gPSBhWzBdIC0gYlswXTtcbiAgICBvdXRbMV0gPSBhWzFdIC0gYlsxXTtcbiAgICBvdXRbMl0gPSBhWzJdIC0gYlsyXTtcbiAgICBvdXRbM10gPSBhWzNdIC0gYlszXTtcbiAgICBvdXRbNF0gPSBhWzRdIC0gYls0XTtcbiAgICBvdXRbNV0gPSBhWzVdIC0gYls1XTtcbiAgICBvdXRbNl0gPSBhWzZdIC0gYls2XTtcbiAgICBvdXRbN10gPSBhWzddIC0gYls3XTtcbiAgICBvdXRbOF0gPSBhWzhdIC0gYls4XTtcbiAgICBvdXRbOV0gPSBhWzldIC0gYls5XTtcbiAgICBvdXRbMTBdID0gYVsxMF0gLSBiWzEwXTtcbiAgICBvdXRbMTFdID0gYVsxMV0gLSBiWzExXTtcbiAgICBvdXRbMTJdID0gYVsxMl0gLSBiWzEyXTtcbiAgICBvdXRbMTNdID0gYVsxM10gLSBiWzEzXTtcbiAgICBvdXRbMTRdID0gYVsxNF0gLSBiWzE0XTtcbiAgICBvdXRbMTVdID0gYVsxNV0gLSBiWzE1XTtcbiAgICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIE11bHRpcGx5IGVhY2ggZWxlbWVudCBvZiB0aGUgbWF0cml4IGJ5IGEgc2NhbGFyLlxuICpcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDR9IGEgdGhlIG1hdHJpeCB0byBzY2FsZVxuICogQHBhcmFtIHtOdW1iZXJ9IGIgYW1vdW50IHRvIHNjYWxlIHRoZSBtYXRyaXgncyBlbGVtZW50cyBieVxuICogQHJldHVybnMge21hdDR9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gbXVsdGlwbHlTY2FsYXIob3V0LCBhLCBiKSB7XG4gICAgb3V0WzBdID0gYVswXSAqIGI7XG4gICAgb3V0WzFdID0gYVsxXSAqIGI7XG4gICAgb3V0WzJdID0gYVsyXSAqIGI7XG4gICAgb3V0WzNdID0gYVszXSAqIGI7XG4gICAgb3V0WzRdID0gYVs0XSAqIGI7XG4gICAgb3V0WzVdID0gYVs1XSAqIGI7XG4gICAgb3V0WzZdID0gYVs2XSAqIGI7XG4gICAgb3V0WzddID0gYVs3XSAqIGI7XG4gICAgb3V0WzhdID0gYVs4XSAqIGI7XG4gICAgb3V0WzldID0gYVs5XSAqIGI7XG4gICAgb3V0WzEwXSA9IGFbMTBdICogYjtcbiAgICBvdXRbMTFdID0gYVsxMV0gKiBiO1xuICAgIG91dFsxMl0gPSBhWzEyXSAqIGI7XG4gICAgb3V0WzEzXSA9IGFbMTNdICogYjtcbiAgICBvdXRbMTRdID0gYVsxNF0gKiBiO1xuICAgIG91dFsxNV0gPSBhWzE1XSAqIGI7XG4gICAgcmV0dXJuIG91dDtcbn1cbiIsImltcG9ydCAqIGFzIHZlYzQgZnJvbSAnLi9WZWM0RnVuYy5qcyc7XG5cbi8qKlxuICogU2V0IGEgcXVhdCB0byB0aGUgaWRlbnRpdHkgcXVhdGVybmlvblxuICpcbiAqIEBwYXJhbSB7cXVhdH0gb3V0IHRoZSByZWNlaXZpbmcgcXVhdGVybmlvblxuICogQHJldHVybnMge3F1YXR9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gaWRlbnRpdHkob3V0KSB7XG4gICAgb3V0WzBdID0gMDtcbiAgICBvdXRbMV0gPSAwO1xuICAgIG91dFsyXSA9IDA7XG4gICAgb3V0WzNdID0gMTtcbiAgICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFNldHMgYSBxdWF0IGZyb20gdGhlIGdpdmVuIGFuZ2xlIGFuZCByb3RhdGlvbiBheGlzLFxuICogdGhlbiByZXR1cm5zIGl0LlxuICpcbiAqIEBwYXJhbSB7cXVhdH0gb3V0IHRoZSByZWNlaXZpbmcgcXVhdGVybmlvblxuICogQHBhcmFtIHt2ZWMzfSBheGlzIHRoZSBheGlzIGFyb3VuZCB3aGljaCB0byByb3RhdGVcbiAqIEBwYXJhbSB7TnVtYmVyfSByYWQgdGhlIGFuZ2xlIGluIHJhZGlhbnNcbiAqIEByZXR1cm5zIHtxdWF0fSBvdXRcbiAqKi9cbmV4cG9ydCBmdW5jdGlvbiBzZXRBeGlzQW5nbGUob3V0LCBheGlzLCByYWQpIHtcbiAgICByYWQgPSByYWQgKiAwLjU7XG4gICAgbGV0IHMgPSBNYXRoLnNpbihyYWQpO1xuICAgIG91dFswXSA9IHMgKiBheGlzWzBdO1xuICAgIG91dFsxXSA9IHMgKiBheGlzWzFdO1xuICAgIG91dFsyXSA9IHMgKiBheGlzWzJdO1xuICAgIG91dFszXSA9IE1hdGguY29zKHJhZCk7XG4gICAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBNdWx0aXBsaWVzIHR3byBxdWF0c1xuICpcbiAqIEBwYXJhbSB7cXVhdH0gb3V0IHRoZSByZWNlaXZpbmcgcXVhdGVybmlvblxuICogQHBhcmFtIHtxdWF0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3F1YXR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7cXVhdH0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtdWx0aXBseShvdXQsIGEsIGIpIHtcbiAgICBsZXQgYXggPSBhWzBdLFxuICAgICAgICBheSA9IGFbMV0sXG4gICAgICAgIGF6ID0gYVsyXSxcbiAgICAgICAgYXcgPSBhWzNdO1xuICAgIGxldCBieCA9IGJbMF0sXG4gICAgICAgIGJ5ID0gYlsxXSxcbiAgICAgICAgYnogPSBiWzJdLFxuICAgICAgICBidyA9IGJbM107XG5cbiAgICBvdXRbMF0gPSBheCAqIGJ3ICsgYXcgKiBieCArIGF5ICogYnogLSBheiAqIGJ5O1xuICAgIG91dFsxXSA9IGF5ICogYncgKyBhdyAqIGJ5ICsgYXogKiBieCAtIGF4ICogYno7XG4gICAgb3V0WzJdID0gYXogKiBidyArIGF3ICogYnogKyBheCAqIGJ5IC0gYXkgKiBieDtcbiAgICBvdXRbM10gPSBhdyAqIGJ3IC0gYXggKiBieCAtIGF5ICogYnkgLSBheiAqIGJ6O1xuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogUm90YXRlcyBhIHF1YXRlcm5pb24gYnkgdGhlIGdpdmVuIGFuZ2xlIGFib3V0IHRoZSBYIGF4aXNcbiAqXG4gKiBAcGFyYW0ge3F1YXR9IG91dCBxdWF0IHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XG4gKiBAcGFyYW0ge3F1YXR9IGEgcXVhdCB0byByb3RhdGVcbiAqIEBwYXJhbSB7bnVtYmVyfSByYWQgYW5nbGUgKGluIHJhZGlhbnMpIHRvIHJvdGF0ZVxuICogQHJldHVybnMge3F1YXR9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gcm90YXRlWChvdXQsIGEsIHJhZCkge1xuICAgIHJhZCAqPSAwLjU7XG5cbiAgICBsZXQgYXggPSBhWzBdLFxuICAgICAgICBheSA9IGFbMV0sXG4gICAgICAgIGF6ID0gYVsyXSxcbiAgICAgICAgYXcgPSBhWzNdO1xuICAgIGxldCBieCA9IE1hdGguc2luKHJhZCksXG4gICAgICAgIGJ3ID0gTWF0aC5jb3MocmFkKTtcblxuICAgIG91dFswXSA9IGF4ICogYncgKyBhdyAqIGJ4O1xuICAgIG91dFsxXSA9IGF5ICogYncgKyBheiAqIGJ4O1xuICAgIG91dFsyXSA9IGF6ICogYncgLSBheSAqIGJ4O1xuICAgIG91dFszXSA9IGF3ICogYncgLSBheCAqIGJ4O1xuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogUm90YXRlcyBhIHF1YXRlcm5pb24gYnkgdGhlIGdpdmVuIGFuZ2xlIGFib3V0IHRoZSBZIGF4aXNcbiAqXG4gKiBAcGFyYW0ge3F1YXR9IG91dCBxdWF0IHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XG4gKiBAcGFyYW0ge3F1YXR9IGEgcXVhdCB0byByb3RhdGVcbiAqIEBwYXJhbSB7bnVtYmVyfSByYWQgYW5nbGUgKGluIHJhZGlhbnMpIHRvIHJvdGF0ZVxuICogQHJldHVybnMge3F1YXR9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gcm90YXRlWShvdXQsIGEsIHJhZCkge1xuICAgIHJhZCAqPSAwLjU7XG5cbiAgICBsZXQgYXggPSBhWzBdLFxuICAgICAgICBheSA9IGFbMV0sXG4gICAgICAgIGF6ID0gYVsyXSxcbiAgICAgICAgYXcgPSBhWzNdO1xuICAgIGxldCBieSA9IE1hdGguc2luKHJhZCksXG4gICAgICAgIGJ3ID0gTWF0aC5jb3MocmFkKTtcblxuICAgIG91dFswXSA9IGF4ICogYncgLSBheiAqIGJ5O1xuICAgIG91dFsxXSA9IGF5ICogYncgKyBhdyAqIGJ5O1xuICAgIG91dFsyXSA9IGF6ICogYncgKyBheCAqIGJ5O1xuICAgIG91dFszXSA9IGF3ICogYncgLSBheSAqIGJ5O1xuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogUm90YXRlcyBhIHF1YXRlcm5pb24gYnkgdGhlIGdpdmVuIGFuZ2xlIGFib3V0IHRoZSBaIGF4aXNcbiAqXG4gKiBAcGFyYW0ge3F1YXR9IG91dCBxdWF0IHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XG4gKiBAcGFyYW0ge3F1YXR9IGEgcXVhdCB0byByb3RhdGVcbiAqIEBwYXJhbSB7bnVtYmVyfSByYWQgYW5nbGUgKGluIHJhZGlhbnMpIHRvIHJvdGF0ZVxuICogQHJldHVybnMge3F1YXR9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gcm90YXRlWihvdXQsIGEsIHJhZCkge1xuICAgIHJhZCAqPSAwLjU7XG5cbiAgICBsZXQgYXggPSBhWzBdLFxuICAgICAgICBheSA9IGFbMV0sXG4gICAgICAgIGF6ID0gYVsyXSxcbiAgICAgICAgYXcgPSBhWzNdO1xuICAgIGxldCBieiA9IE1hdGguc2luKHJhZCksXG4gICAgICAgIGJ3ID0gTWF0aC5jb3MocmFkKTtcblxuICAgIG91dFswXSA9IGF4ICogYncgKyBheSAqIGJ6O1xuICAgIG91dFsxXSA9IGF5ICogYncgLSBheCAqIGJ6O1xuICAgIG91dFsyXSA9IGF6ICogYncgKyBhdyAqIGJ6O1xuICAgIG91dFszXSA9IGF3ICogYncgLSBheiAqIGJ6O1xuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogUGVyZm9ybXMgYSBzcGhlcmljYWwgbGluZWFyIGludGVycG9sYXRpb24gYmV0d2VlbiB0d28gcXVhdFxuICpcbiAqIEBwYXJhbSB7cXVhdH0gb3V0IHRoZSByZWNlaXZpbmcgcXVhdGVybmlvblxuICogQHBhcmFtIHtxdWF0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3F1YXR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcGFyYW0ge051bWJlcn0gdCBpbnRlcnBvbGF0aW9uIGFtb3VudCBiZXR3ZWVuIHRoZSB0d28gaW5wdXRzXG4gKiBAcmV0dXJucyB7cXVhdH0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzbGVycChvdXQsIGEsIGIsIHQpIHtcbiAgICAvLyBiZW5jaG1hcmtzOlxuICAgIC8vICAgIGh0dHA6Ly9qc3BlcmYuY29tL3F1YXRlcm5pb24tc2xlcnAtaW1wbGVtZW50YXRpb25zXG4gICAgbGV0IGF4ID0gYVswXSxcbiAgICAgICAgYXkgPSBhWzFdLFxuICAgICAgICBheiA9IGFbMl0sXG4gICAgICAgIGF3ID0gYVszXTtcbiAgICBsZXQgYnggPSBiWzBdLFxuICAgICAgICBieSA9IGJbMV0sXG4gICAgICAgIGJ6ID0gYlsyXSxcbiAgICAgICAgYncgPSBiWzNdO1xuXG4gICAgbGV0IG9tZWdhLCBjb3NvbSwgc2lub20sIHNjYWxlMCwgc2NhbGUxO1xuXG4gICAgLy8gY2FsYyBjb3NpbmVcbiAgICBjb3NvbSA9IGF4ICogYnggKyBheSAqIGJ5ICsgYXogKiBieiArIGF3ICogYnc7XG4gICAgLy8gYWRqdXN0IHNpZ25zIChpZiBuZWNlc3NhcnkpXG4gICAgaWYgKGNvc29tIDwgMC4wKSB7XG4gICAgICAgIGNvc29tID0gLWNvc29tO1xuICAgICAgICBieCA9IC1ieDtcbiAgICAgICAgYnkgPSAtYnk7XG4gICAgICAgIGJ6ID0gLWJ6O1xuICAgICAgICBidyA9IC1idztcbiAgICB9XG4gICAgLy8gY2FsY3VsYXRlIGNvZWZmaWNpZW50c1xuICAgIGlmICgxLjAgLSBjb3NvbSA+IDAuMDAwMDAxKSB7XG4gICAgICAgIC8vIHN0YW5kYXJkIGNhc2UgKHNsZXJwKVxuICAgICAgICBvbWVnYSA9IE1hdGguYWNvcyhjb3NvbSk7XG4gICAgICAgIHNpbm9tID0gTWF0aC5zaW4ob21lZ2EpO1xuICAgICAgICBzY2FsZTAgPSBNYXRoLnNpbigoMS4wIC0gdCkgKiBvbWVnYSkgLyBzaW5vbTtcbiAgICAgICAgc2NhbGUxID0gTWF0aC5zaW4odCAqIG9tZWdhKSAvIHNpbm9tO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIFwiZnJvbVwiIGFuZCBcInRvXCIgcXVhdGVybmlvbnMgYXJlIHZlcnkgY2xvc2VcbiAgICAgICAgLy8gIC4uLiBzbyB3ZSBjYW4gZG8gYSBsaW5lYXIgaW50ZXJwb2xhdGlvblxuICAgICAgICBzY2FsZTAgPSAxLjAgLSB0O1xuICAgICAgICBzY2FsZTEgPSB0O1xuICAgIH1cbiAgICAvLyBjYWxjdWxhdGUgZmluYWwgdmFsdWVzXG4gICAgb3V0WzBdID0gc2NhbGUwICogYXggKyBzY2FsZTEgKiBieDtcbiAgICBvdXRbMV0gPSBzY2FsZTAgKiBheSArIHNjYWxlMSAqIGJ5O1xuICAgIG91dFsyXSA9IHNjYWxlMCAqIGF6ICsgc2NhbGUxICogYno7XG4gICAgb3V0WzNdID0gc2NhbGUwICogYXcgKyBzY2FsZTEgKiBidztcblxuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgaW52ZXJzZSBvZiBhIHF1YXRcbiAqXG4gKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cbiAqIEBwYXJhbSB7cXVhdH0gYSBxdWF0IHRvIGNhbGN1bGF0ZSBpbnZlcnNlIG9mXG4gKiBAcmV0dXJucyB7cXVhdH0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpbnZlcnQob3V0LCBhKSB7XG4gICAgbGV0IGEwID0gYVswXSxcbiAgICAgICAgYTEgPSBhWzFdLFxuICAgICAgICBhMiA9IGFbMl0sXG4gICAgICAgIGEzID0gYVszXTtcbiAgICBsZXQgZG90ID0gYTAgKiBhMCArIGExICogYTEgKyBhMiAqIGEyICsgYTMgKiBhMztcbiAgICBsZXQgaW52RG90ID0gZG90ID8gMS4wIC8gZG90IDogMDtcblxuICAgIC8vIFRPRE86IFdvdWxkIGJlIGZhc3RlciB0byByZXR1cm4gWzAsMCwwLDBdIGltbWVkaWF0ZWx5IGlmIGRvdCA9PSAwXG5cbiAgICBvdXRbMF0gPSAtYTAgKiBpbnZEb3Q7XG4gICAgb3V0WzFdID0gLWExICogaW52RG90O1xuICAgIG91dFsyXSA9IC1hMiAqIGludkRvdDtcbiAgICBvdXRbM10gPSBhMyAqIGludkRvdDtcbiAgICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGNvbmp1Z2F0ZSBvZiBhIHF1YXRcbiAqIElmIHRoZSBxdWF0ZXJuaW9uIGlzIG5vcm1hbGl6ZWQsIHRoaXMgZnVuY3Rpb24gaXMgZmFzdGVyIHRoYW4gcXVhdC5pbnZlcnNlIGFuZCBwcm9kdWNlcyB0aGUgc2FtZSByZXN1bHQuXG4gKlxuICogQHBhcmFtIHtxdWF0fSBvdXQgdGhlIHJlY2VpdmluZyBxdWF0ZXJuaW9uXG4gKiBAcGFyYW0ge3F1YXR9IGEgcXVhdCB0byBjYWxjdWxhdGUgY29uanVnYXRlIG9mXG4gKiBAcmV0dXJucyB7cXVhdH0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb25qdWdhdGUob3V0LCBhKSB7XG4gICAgb3V0WzBdID0gLWFbMF07XG4gICAgb3V0WzFdID0gLWFbMV07XG4gICAgb3V0WzJdID0gLWFbMl07XG4gICAgb3V0WzNdID0gYVszXTtcbiAgICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBxdWF0ZXJuaW9uIGZyb20gdGhlIGdpdmVuIDN4MyByb3RhdGlvbiBtYXRyaXguXG4gKlxuICogTk9URTogVGhlIHJlc3VsdGFudCBxdWF0ZXJuaW9uIGlzIG5vdCBub3JtYWxpemVkLCBzbyB5b3Ugc2hvdWxkIGJlIHN1cmVcbiAqIHRvIHJlbm9ybWFsaXplIHRoZSBxdWF0ZXJuaW9uIHlvdXJzZWxmIHdoZXJlIG5lY2Vzc2FyeS5cbiAqXG4gKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cbiAqIEBwYXJhbSB7bWF0M30gbSByb3RhdGlvbiBtYXRyaXhcbiAqIEByZXR1cm5zIHtxdWF0fSBvdXRcbiAqIEBmdW5jdGlvblxuICovXG5leHBvcnQgZnVuY3Rpb24gZnJvbU1hdDMob3V0LCBtKSB7XG4gICAgLy8gQWxnb3JpdGhtIGluIEtlbiBTaG9lbWFrZSdzIGFydGljbGUgaW4gMTk4NyBTSUdHUkFQSCBjb3Vyc2Ugbm90ZXNcbiAgICAvLyBhcnRpY2xlIFwiUXVhdGVybmlvbiBDYWxjdWx1cyBhbmQgRmFzdCBBbmltYXRpb25cIi5cbiAgICBsZXQgZlRyYWNlID0gbVswXSArIG1bNF0gKyBtWzhdO1xuICAgIGxldCBmUm9vdDtcblxuICAgIGlmIChmVHJhY2UgPiAwLjApIHtcbiAgICAgICAgLy8gfHd8ID4gMS8yLCBtYXkgYXMgd2VsbCBjaG9vc2UgdyA+IDEvMlxuICAgICAgICBmUm9vdCA9IE1hdGguc3FydChmVHJhY2UgKyAxLjApOyAvLyAyd1xuICAgICAgICBvdXRbM10gPSAwLjUgKiBmUm9vdDtcbiAgICAgICAgZlJvb3QgPSAwLjUgLyBmUm9vdDsgLy8gMS8oNHcpXG4gICAgICAgIG91dFswXSA9IChtWzVdIC0gbVs3XSkgKiBmUm9vdDtcbiAgICAgICAgb3V0WzFdID0gKG1bNl0gLSBtWzJdKSAqIGZSb290O1xuICAgICAgICBvdXRbMl0gPSAobVsxXSAtIG1bM10pICogZlJvb3Q7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgLy8gfHd8IDw9IDEvMlxuICAgICAgICBsZXQgaSA9IDA7XG4gICAgICAgIGlmIChtWzRdID4gbVswXSkgaSA9IDE7XG4gICAgICAgIGlmIChtWzhdID4gbVtpICogMyArIGldKSBpID0gMjtcbiAgICAgICAgbGV0IGogPSAoaSArIDEpICUgMztcbiAgICAgICAgbGV0IGsgPSAoaSArIDIpICUgMztcblxuICAgICAgICBmUm9vdCA9IE1hdGguc3FydChtW2kgKiAzICsgaV0gLSBtW2ogKiAzICsgal0gLSBtW2sgKiAzICsga10gKyAxLjApO1xuICAgICAgICBvdXRbaV0gPSAwLjUgKiBmUm9vdDtcbiAgICAgICAgZlJvb3QgPSAwLjUgLyBmUm9vdDtcbiAgICAgICAgb3V0WzNdID0gKG1baiAqIDMgKyBrXSAtIG1bayAqIDMgKyBqXSkgKiBmUm9vdDtcbiAgICAgICAgb3V0W2pdID0gKG1baiAqIDMgKyBpXSArIG1baSAqIDMgKyBqXSkgKiBmUm9vdDtcbiAgICAgICAgb3V0W2tdID0gKG1bayAqIDMgKyBpXSArIG1baSAqIDMgKyBrXSkgKiBmUm9vdDtcbiAgICB9XG5cbiAgICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBxdWF0ZXJuaW9uIGZyb20gdGhlIGdpdmVuIGV1bGVyIGFuZ2xlIHgsIHksIHouXG4gKlxuICogQHBhcmFtIHtxdWF0fSBvdXQgdGhlIHJlY2VpdmluZyBxdWF0ZXJuaW9uXG4gKiBAcGFyYW0ge3ZlYzN9IGV1bGVyIEFuZ2xlcyB0byByb3RhdGUgYXJvdW5kIGVhY2ggYXhpcyBpbiBkZWdyZWVzLlxuICogQHBhcmFtIHtTdHJpbmd9IG9yZGVyIGRldGFpbGluZyBvcmRlciBvZiBvcGVyYXRpb25zLiBEZWZhdWx0ICdYWVonLlxuICogQHJldHVybnMge3F1YXR9IG91dFxuICogQGZ1bmN0aW9uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmcm9tRXVsZXIob3V0LCBldWxlciwgb3JkZXIgPSAnWVhaJykge1xuICAgIGxldCBzeCA9IE1hdGguc2luKGV1bGVyWzBdICogMC41KTtcbiAgICBsZXQgY3ggPSBNYXRoLmNvcyhldWxlclswXSAqIDAuNSk7XG4gICAgbGV0IHN5ID0gTWF0aC5zaW4oZXVsZXJbMV0gKiAwLjUpO1xuICAgIGxldCBjeSA9IE1hdGguY29zKGV1bGVyWzFdICogMC41KTtcbiAgICBsZXQgc3ogPSBNYXRoLnNpbihldWxlclsyXSAqIDAuNSk7XG4gICAgbGV0IGN6ID0gTWF0aC5jb3MoZXVsZXJbMl0gKiAwLjUpO1xuXG4gICAgaWYgKG9yZGVyID09PSAnWFlaJykge1xuICAgICAgICBvdXRbMF0gPSBzeCAqIGN5ICogY3ogKyBjeCAqIHN5ICogc3o7XG4gICAgICAgIG91dFsxXSA9IGN4ICogc3kgKiBjeiAtIHN4ICogY3kgKiBzejtcbiAgICAgICAgb3V0WzJdID0gY3ggKiBjeSAqIHN6ICsgc3ggKiBzeSAqIGN6O1xuICAgICAgICBvdXRbM10gPSBjeCAqIGN5ICogY3ogLSBzeCAqIHN5ICogc3o7XG4gICAgfSBlbHNlIGlmIChvcmRlciA9PT0gJ1lYWicpIHtcbiAgICAgICAgb3V0WzBdID0gc3ggKiBjeSAqIGN6ICsgY3ggKiBzeSAqIHN6O1xuICAgICAgICBvdXRbMV0gPSBjeCAqIHN5ICogY3ogLSBzeCAqIGN5ICogc3o7XG4gICAgICAgIG91dFsyXSA9IGN4ICogY3kgKiBzeiAtIHN4ICogc3kgKiBjejtcbiAgICAgICAgb3V0WzNdID0gY3ggKiBjeSAqIGN6ICsgc3ggKiBzeSAqIHN6O1xuICAgIH0gZWxzZSBpZiAob3JkZXIgPT09ICdaWFknKSB7XG4gICAgICAgIG91dFswXSA9IHN4ICogY3kgKiBjeiAtIGN4ICogc3kgKiBzejtcbiAgICAgICAgb3V0WzFdID0gY3ggKiBzeSAqIGN6ICsgc3ggKiBjeSAqIHN6O1xuICAgICAgICBvdXRbMl0gPSBjeCAqIGN5ICogc3ogKyBzeCAqIHN5ICogY3o7XG4gICAgICAgIG91dFszXSA9IGN4ICogY3kgKiBjeiAtIHN4ICogc3kgKiBzejtcbiAgICB9IGVsc2UgaWYgKG9yZGVyID09PSAnWllYJykge1xuICAgICAgICBvdXRbMF0gPSBzeCAqIGN5ICogY3ogLSBjeCAqIHN5ICogc3o7XG4gICAgICAgIG91dFsxXSA9IGN4ICogc3kgKiBjeiArIHN4ICogY3kgKiBzejtcbiAgICAgICAgb3V0WzJdID0gY3ggKiBjeSAqIHN6IC0gc3ggKiBzeSAqIGN6O1xuICAgICAgICBvdXRbM10gPSBjeCAqIGN5ICogY3ogKyBzeCAqIHN5ICogc3o7XG4gICAgfSBlbHNlIGlmIChvcmRlciA9PT0gJ1laWCcpIHtcbiAgICAgICAgb3V0WzBdID0gc3ggKiBjeSAqIGN6ICsgY3ggKiBzeSAqIHN6O1xuICAgICAgICBvdXRbMV0gPSBjeCAqIHN5ICogY3ogKyBzeCAqIGN5ICogc3o7XG4gICAgICAgIG91dFsyXSA9IGN4ICogY3kgKiBzeiAtIHN4ICogc3kgKiBjejtcbiAgICAgICAgb3V0WzNdID0gY3ggKiBjeSAqIGN6IC0gc3ggKiBzeSAqIHN6O1xuICAgIH0gZWxzZSBpZiAob3JkZXIgPT09ICdYWlknKSB7XG4gICAgICAgIG91dFswXSA9IHN4ICogY3kgKiBjeiAtIGN4ICogc3kgKiBzejtcbiAgICAgICAgb3V0WzFdID0gY3ggKiBzeSAqIGN6IC0gc3ggKiBjeSAqIHN6O1xuICAgICAgICBvdXRbMl0gPSBjeCAqIGN5ICogc3ogKyBzeCAqIHN5ICogY3o7XG4gICAgICAgIG91dFszXSA9IGN4ICogY3kgKiBjeiArIHN4ICogc3kgKiBzejtcbiAgICB9XG5cbiAgICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIENvcHkgdGhlIHZhbHVlcyBmcm9tIG9uZSBxdWF0IHRvIGFub3RoZXJcbiAqXG4gKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cbiAqIEBwYXJhbSB7cXVhdH0gYSB0aGUgc291cmNlIHF1YXRlcm5pb25cbiAqIEByZXR1cm5zIHtxdWF0fSBvdXRcbiAqIEBmdW5jdGlvblxuICovXG5leHBvcnQgY29uc3QgY29weSA9IHZlYzQuY29weTtcblxuLyoqXG4gKiBTZXQgdGhlIGNvbXBvbmVudHMgb2YgYSBxdWF0IHRvIHRoZSBnaXZlbiB2YWx1ZXNcbiAqXG4gKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cbiAqIEBwYXJhbSB7TnVtYmVyfSB4IFggY29tcG9uZW50XG4gKiBAcGFyYW0ge051bWJlcn0geSBZIGNvbXBvbmVudFxuICogQHBhcmFtIHtOdW1iZXJ9IHogWiBjb21wb25lbnRcbiAqIEBwYXJhbSB7TnVtYmVyfSB3IFcgY29tcG9uZW50XG4gKiBAcmV0dXJucyB7cXVhdH0gb3V0XG4gKiBAZnVuY3Rpb25cbiAqL1xuZXhwb3J0IGNvbnN0IHNldCA9IHZlYzQuc2V0O1xuXG4vKipcbiAqIEFkZHMgdHdvIHF1YXQnc1xuICpcbiAqIEBwYXJhbSB7cXVhdH0gb3V0IHRoZSByZWNlaXZpbmcgcXVhdGVybmlvblxuICogQHBhcmFtIHtxdWF0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3F1YXR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7cXVhdH0gb3V0XG4gKiBAZnVuY3Rpb25cbiAqL1xuZXhwb3J0IGNvbnN0IGFkZCA9IHZlYzQuYWRkO1xuXG4vKipcbiAqIFNjYWxlcyBhIHF1YXQgYnkgYSBzY2FsYXIgbnVtYmVyXG4gKlxuICogQHBhcmFtIHtxdWF0fSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7cXVhdH0gYSB0aGUgdmVjdG9yIHRvIHNjYWxlXG4gKiBAcGFyYW0ge051bWJlcn0gYiBhbW91bnQgdG8gc2NhbGUgdGhlIHZlY3RvciBieVxuICogQHJldHVybnMge3F1YXR9IG91dFxuICogQGZ1bmN0aW9uXG4gKi9cbmV4cG9ydCBjb25zdCBzY2FsZSA9IHZlYzQuc2NhbGU7XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgZG90IHByb2R1Y3Qgb2YgdHdvIHF1YXQnc1xuICpcbiAqIEBwYXJhbSB7cXVhdH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHtxdWF0fSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge051bWJlcn0gZG90IHByb2R1Y3Qgb2YgYSBhbmQgYlxuICogQGZ1bmN0aW9uXG4gKi9cbmV4cG9ydCBjb25zdCBkb3QgPSB2ZWM0LmRvdDtcblxuLyoqXG4gKiBQZXJmb3JtcyBhIGxpbmVhciBpbnRlcnBvbGF0aW9uIGJldHdlZW4gdHdvIHF1YXQnc1xuICpcbiAqIEBwYXJhbSB7cXVhdH0gb3V0IHRoZSByZWNlaXZpbmcgcXVhdGVybmlvblxuICogQHBhcmFtIHtxdWF0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3F1YXR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcGFyYW0ge051bWJlcn0gdCBpbnRlcnBvbGF0aW9uIGFtb3VudCBiZXR3ZWVuIHRoZSB0d28gaW5wdXRzXG4gKiBAcmV0dXJucyB7cXVhdH0gb3V0XG4gKiBAZnVuY3Rpb25cbiAqL1xuZXhwb3J0IGNvbnN0IGxlcnAgPSB2ZWM0LmxlcnA7XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgbGVuZ3RoIG9mIGEgcXVhdFxuICpcbiAqIEBwYXJhbSB7cXVhdH0gYSB2ZWN0b3IgdG8gY2FsY3VsYXRlIGxlbmd0aCBvZlxuICogQHJldHVybnMge051bWJlcn0gbGVuZ3RoIG9mIGFcbiAqL1xuZXhwb3J0IGNvbnN0IGxlbmd0aCA9IHZlYzQubGVuZ3RoO1xuXG4vKipcbiAqIE5vcm1hbGl6ZSBhIHF1YXRcbiAqXG4gKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cbiAqIEBwYXJhbSB7cXVhdH0gYSBxdWF0ZXJuaW9uIHRvIG5vcm1hbGl6ZVxuICogQHJldHVybnMge3F1YXR9IG91dFxuICogQGZ1bmN0aW9uXG4gKi9cbmV4cG9ydCBjb25zdCBub3JtYWxpemUgPSB2ZWM0Lm5vcm1hbGl6ZTtcbiIsImNvbnN0IEVQU0lMT04gPSAwLjAwMDAwMTtcblxuLyoqXG4gKiBDb3B5IHRoZSB2YWx1ZXMgZnJvbSBvbmUgdmVjMiB0byBhbm90aGVyXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgc291cmNlIHZlY3RvclxuICogQHJldHVybnMge3ZlYzJ9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gY29weShvdXQsIGEpIHtcbiAgICBvdXRbMF0gPSBhWzBdO1xuICAgIG91dFsxXSA9IGFbMV07XG4gICAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBTZXQgdGhlIGNvbXBvbmVudHMgb2YgYSB2ZWMyIHRvIHRoZSBnaXZlbiB2YWx1ZXNcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHtOdW1iZXJ9IHggWCBjb21wb25lbnRcbiAqIEBwYXJhbSB7TnVtYmVyfSB5IFkgY29tcG9uZW50XG4gKiBAcmV0dXJucyB7dmVjMn0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZXQob3V0LCB4LCB5KSB7XG4gICAgb3V0WzBdID0geDtcbiAgICBvdXRbMV0gPSB5O1xuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogQWRkcyB0d28gdmVjMidzXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMyfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge3ZlYzJ9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gYWRkKG91dCwgYSwgYikge1xuICAgIG91dFswXSA9IGFbMF0gKyBiWzBdO1xuICAgIG91dFsxXSA9IGFbMV0gKyBiWzFdO1xuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogU3VidHJhY3RzIHZlY3RvciBiIGZyb20gdmVjdG9yIGFcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMyfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzJ9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7dmVjMn0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzdWJ0cmFjdChvdXQsIGEsIGIpIHtcbiAgICBvdXRbMF0gPSBhWzBdIC0gYlswXTtcbiAgICBvdXRbMV0gPSBhWzFdIC0gYlsxXTtcbiAgICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIE11bHRpcGxpZXMgdHdvIHZlYzInc1xuICpcbiAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjMn0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG11bHRpcGx5KG91dCwgYSwgYikge1xuICAgIG91dFswXSA9IGFbMF0gKiBiWzBdO1xuICAgIG91dFsxXSA9IGFbMV0gKiBiWzFdO1xuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogRGl2aWRlcyB0d28gdmVjMidzXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMyfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge3ZlYzJ9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gZGl2aWRlKG91dCwgYSwgYikge1xuICAgIG91dFswXSA9IGFbMF0gLyBiWzBdO1xuICAgIG91dFsxXSA9IGFbMV0gLyBiWzFdO1xuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogU2NhbGVzIGEgdmVjMiBieSBhIHNjYWxhciBudW1iZXJcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMyfSBhIHRoZSB2ZWN0b3IgdG8gc2NhbGVcbiAqIEBwYXJhbSB7TnVtYmVyfSBiIGFtb3VudCB0byBzY2FsZSB0aGUgdmVjdG9yIGJ5XG4gKiBAcmV0dXJucyB7dmVjMn0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzY2FsZShvdXQsIGEsIGIpIHtcbiAgICBvdXRbMF0gPSBhWzBdICogYjtcbiAgICBvdXRbMV0gPSBhWzFdICogYjtcbiAgICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGV1Y2xpZGlhbiBkaXN0YW5jZSBiZXR3ZWVuIHR3byB2ZWMyJ3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjMn0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IGRpc3RhbmNlIGJldHdlZW4gYSBhbmQgYlxuICovXG5leHBvcnQgZnVuY3Rpb24gZGlzdGFuY2UoYSwgYikge1xuICAgIHZhciB4ID0gYlswXSAtIGFbMF0sXG4gICAgICAgIHkgPSBiWzFdIC0gYVsxXTtcbiAgICByZXR1cm4gTWF0aC5zcXJ0KHggKiB4ICsgeSAqIHkpO1xufVxuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIHNxdWFyZWQgZXVjbGlkaWFuIGRpc3RhbmNlIGJldHdlZW4gdHdvIHZlYzInc1xuICpcbiAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMyfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge051bWJlcn0gc3F1YXJlZCBkaXN0YW5jZSBiZXR3ZWVuIGEgYW5kIGJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNxdWFyZWREaXN0YW5jZShhLCBiKSB7XG4gICAgdmFyIHggPSBiWzBdIC0gYVswXSxcbiAgICAgICAgeSA9IGJbMV0gLSBhWzFdO1xuICAgIHJldHVybiB4ICogeCArIHkgKiB5O1xufVxuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGxlbmd0aCBvZiBhIHZlYzJcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdmVjdG9yIHRvIGNhbGN1bGF0ZSBsZW5ndGggb2ZcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IGxlbmd0aCBvZiBhXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBsZW5ndGgoYSkge1xuICAgIHZhciB4ID0gYVswXSxcbiAgICAgICAgeSA9IGFbMV07XG4gICAgcmV0dXJuIE1hdGguc3FydCh4ICogeCArIHkgKiB5KTtcbn1cblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBzcXVhcmVkIGxlbmd0aCBvZiBhIHZlYzJcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdmVjdG9yIHRvIGNhbGN1bGF0ZSBzcXVhcmVkIGxlbmd0aCBvZlxuICogQHJldHVybnMge051bWJlcn0gc3F1YXJlZCBsZW5ndGggb2YgYVxuICovXG5leHBvcnQgZnVuY3Rpb24gc3F1YXJlZExlbmd0aChhKSB7XG4gICAgdmFyIHggPSBhWzBdLFxuICAgICAgICB5ID0gYVsxXTtcbiAgICByZXR1cm4geCAqIHggKyB5ICogeTtcbn1cblxuLyoqXG4gKiBOZWdhdGVzIHRoZSBjb21wb25lbnRzIG9mIGEgdmVjMlxuICpcbiAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdmVjdG9yIHRvIG5lZ2F0ZVxuICogQHJldHVybnMge3ZlYzJ9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gbmVnYXRlKG91dCwgYSkge1xuICAgIG91dFswXSA9IC1hWzBdO1xuICAgIG91dFsxXSA9IC1hWzFdO1xuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgaW52ZXJzZSBvZiB0aGUgY29tcG9uZW50cyBvZiBhIHZlYzJcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMyfSBhIHZlY3RvciB0byBpbnZlcnRcbiAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGludmVyc2Uob3V0LCBhKSB7XG4gICAgb3V0WzBdID0gMS4wIC8gYVswXTtcbiAgICBvdXRbMV0gPSAxLjAgLyBhWzFdO1xuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogTm9ybWFsaXplIGEgdmVjMlxuICpcbiAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdmVjdG9yIHRvIG5vcm1hbGl6ZVxuICogQHJldHVybnMge3ZlYzJ9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gbm9ybWFsaXplKG91dCwgYSkge1xuICAgIHZhciB4ID0gYVswXSxcbiAgICAgICAgeSA9IGFbMV07XG4gICAgdmFyIGxlbiA9IHggKiB4ICsgeSAqIHk7XG4gICAgaWYgKGxlbiA+IDApIHtcbiAgICAgICAgLy9UT0RPOiBldmFsdWF0ZSB1c2Ugb2YgZ2xtX2ludnNxcnQgaGVyZT9cbiAgICAgICAgbGVuID0gMSAvIE1hdGguc3FydChsZW4pO1xuICAgIH1cbiAgICBvdXRbMF0gPSBhWzBdICogbGVuO1xuICAgIG91dFsxXSA9IGFbMV0gKiBsZW47XG4gICAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBkb3QgcHJvZHVjdCBvZiB0d28gdmVjMidzXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzJ9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBkb3QgcHJvZHVjdCBvZiBhIGFuZCBiXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkb3QoYSwgYikge1xuICAgIHJldHVybiBhWzBdICogYlswXSArIGFbMV0gKiBiWzFdO1xufVxuXG4vKipcbiAqIENvbXB1dGVzIHRoZSBjcm9zcyBwcm9kdWN0IG9mIHR3byB2ZWMyJ3NcbiAqIE5vdGUgdGhhdCB0aGUgY3Jvc3MgcHJvZHVjdCByZXR1cm5zIGEgc2NhbGFyXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzJ9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBjcm9zcyBwcm9kdWN0IG9mIGEgYW5kIGJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyb3NzKGEsIGIpIHtcbiAgICByZXR1cm4gYVswXSAqIGJbMV0gLSBhWzFdICogYlswXTtcbn1cblxuLyoqXG4gKiBQZXJmb3JtcyBhIGxpbmVhciBpbnRlcnBvbGF0aW9uIGJldHdlZW4gdHdvIHZlYzInc1xuICpcbiAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjMn0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEBwYXJhbSB7TnVtYmVyfSB0IGludGVycG9sYXRpb24gYW1vdW50IGJldHdlZW4gdGhlIHR3byBpbnB1dHNcbiAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxlcnAob3V0LCBhLCBiLCB0KSB7XG4gICAgdmFyIGF4ID0gYVswXSxcbiAgICAgICAgYXkgPSBhWzFdO1xuICAgIG91dFswXSA9IGF4ICsgdCAqIChiWzBdIC0gYXgpO1xuICAgIG91dFsxXSA9IGF5ICsgdCAqIChiWzFdIC0gYXkpO1xuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogVHJhbnNmb3JtcyB0aGUgdmVjMiB3aXRoIGEgbWF0MlxuICpcbiAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIHZlY3RvciB0byB0cmFuc2Zvcm1cbiAqIEBwYXJhbSB7bWF0Mn0gbSBtYXRyaXggdG8gdHJhbnNmb3JtIHdpdGhcbiAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRyYW5zZm9ybU1hdDIob3V0LCBhLCBtKSB7XG4gICAgdmFyIHggPSBhWzBdLFxuICAgICAgICB5ID0gYVsxXTtcbiAgICBvdXRbMF0gPSBtWzBdICogeCArIG1bMl0gKiB5O1xuICAgIG91dFsxXSA9IG1bMV0gKiB4ICsgbVszXSAqIHk7XG4gICAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBUcmFuc2Zvcm1zIHRoZSB2ZWMyIHdpdGggYSBtYXQyZFxuICpcbiAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIHZlY3RvciB0byB0cmFuc2Zvcm1cbiAqIEBwYXJhbSB7bWF0MmR9IG0gbWF0cml4IHRvIHRyYW5zZm9ybSB3aXRoXG4gKiBAcmV0dXJucyB7dmVjMn0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0cmFuc2Zvcm1NYXQyZChvdXQsIGEsIG0pIHtcbiAgICB2YXIgeCA9IGFbMF0sXG4gICAgICAgIHkgPSBhWzFdO1xuICAgIG91dFswXSA9IG1bMF0gKiB4ICsgbVsyXSAqIHkgKyBtWzRdO1xuICAgIG91dFsxXSA9IG1bMV0gKiB4ICsgbVszXSAqIHkgKyBtWzVdO1xuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogVHJhbnNmb3JtcyB0aGUgdmVjMiB3aXRoIGEgbWF0M1xuICogM3JkIHZlY3RvciBjb21wb25lbnQgaXMgaW1wbGljaXRseSAnMSdcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMyfSBhIHRoZSB2ZWN0b3IgdG8gdHJhbnNmb3JtXG4gKiBAcGFyYW0ge21hdDN9IG0gbWF0cml4IHRvIHRyYW5zZm9ybSB3aXRoXG4gKiBAcmV0dXJucyB7dmVjMn0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0cmFuc2Zvcm1NYXQzKG91dCwgYSwgbSkge1xuICAgIHZhciB4ID0gYVswXSxcbiAgICAgICAgeSA9IGFbMV07XG4gICAgb3V0WzBdID0gbVswXSAqIHggKyBtWzNdICogeSArIG1bNl07XG4gICAgb3V0WzFdID0gbVsxXSAqIHggKyBtWzRdICogeSArIG1bN107XG4gICAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBUcmFuc2Zvcm1zIHRoZSB2ZWMyIHdpdGggYSBtYXQ0XG4gKiAzcmQgdmVjdG9yIGNvbXBvbmVudCBpcyBpbXBsaWNpdGx5ICcwJ1xuICogNHRoIHZlY3RvciBjb21wb25lbnQgaXMgaW1wbGljaXRseSAnMSdcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMyfSBhIHRoZSB2ZWN0b3IgdG8gdHJhbnNmb3JtXG4gKiBAcGFyYW0ge21hdDR9IG0gbWF0cml4IHRvIHRyYW5zZm9ybSB3aXRoXG4gKiBAcmV0dXJucyB7dmVjMn0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0cmFuc2Zvcm1NYXQ0KG91dCwgYSwgbSkge1xuICAgIGxldCB4ID0gYVswXTtcbiAgICBsZXQgeSA9IGFbMV07XG4gICAgb3V0WzBdID0gbVswXSAqIHggKyBtWzRdICogeSArIG1bMTJdO1xuICAgIG91dFsxXSA9IG1bMV0gKiB4ICsgbVs1XSAqIHkgKyBtWzEzXTtcbiAgICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFJldHVybnMgd2hldGhlciBvciBub3QgdGhlIHZlY3RvcnMgZXhhY3RseSBoYXZlIHRoZSBzYW1lIGVsZW1lbnRzIGluIHRoZSBzYW1lIHBvc2l0aW9uICh3aGVuIGNvbXBhcmVkIHdpdGggPT09KVxuICpcbiAqIEBwYXJhbSB7dmVjMn0gYSBUaGUgZmlyc3QgdmVjdG9yLlxuICogQHBhcmFtIHt2ZWMyfSBiIFRoZSBzZWNvbmQgdmVjdG9yLlxuICogQHJldHVybnMge0Jvb2xlYW59IFRydWUgaWYgdGhlIHZlY3RvcnMgYXJlIGVxdWFsLCBmYWxzZSBvdGhlcndpc2UuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBleGFjdEVxdWFscyhhLCBiKSB7XG4gICAgcmV0dXJuIGFbMF0gPT09IGJbMF0gJiYgYVsxXSA9PT0gYlsxXTtcbn1cbiIsImNvbnN0IEVQU0lMT04gPSAwLjAwMDAwMTtcblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBsZW5ndGggb2YgYSB2ZWMzXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBhIHZlY3RvciB0byBjYWxjdWxhdGUgbGVuZ3RoIG9mXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBsZW5ndGggb2YgYVxuICovXG5leHBvcnQgZnVuY3Rpb24gbGVuZ3RoKGEpIHtcbiAgICBsZXQgeCA9IGFbMF07XG4gICAgbGV0IHkgPSBhWzFdO1xuICAgIGxldCB6ID0gYVsyXTtcbiAgICByZXR1cm4gTWF0aC5zcXJ0KHggKiB4ICsgeSAqIHkgKyB6ICogeik7XG59XG5cbi8qKlxuICogQ29weSB0aGUgdmFsdWVzIGZyb20gb25lIHZlYzMgdG8gYW5vdGhlclxuICpcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIHNvdXJjZSB2ZWN0b3JcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvcHkob3V0LCBhKSB7XG4gICAgb3V0WzBdID0gYVswXTtcbiAgICBvdXRbMV0gPSBhWzFdO1xuICAgIG91dFsyXSA9IGFbMl07XG4gICAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBTZXQgdGhlIGNvbXBvbmVudHMgb2YgYSB2ZWMzIHRvIHRoZSBnaXZlbiB2YWx1ZXNcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHtOdW1iZXJ9IHggWCBjb21wb25lbnRcbiAqIEBwYXJhbSB7TnVtYmVyfSB5IFkgY29tcG9uZW50XG4gKiBAcGFyYW0ge051bWJlcn0geiBaIGNvbXBvbmVudFxuICogQHJldHVybnMge3ZlYzN9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gc2V0KG91dCwgeCwgeSwgeikge1xuICAgIG91dFswXSA9IHg7XG4gICAgb3V0WzFdID0geTtcbiAgICBvdXRbMl0gPSB6O1xuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogQWRkcyB0d28gdmVjMydzXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjM30gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge3ZlYzN9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gYWRkKG91dCwgYSwgYikge1xuICAgIG91dFswXSA9IGFbMF0gKyBiWzBdO1xuICAgIG91dFsxXSA9IGFbMV0gKyBiWzFdO1xuICAgIG91dFsyXSA9IGFbMl0gKyBiWzJdO1xuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogU3VidHJhY3RzIHZlY3RvciBiIGZyb20gdmVjdG9yIGFcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzdWJ0cmFjdChvdXQsIGEsIGIpIHtcbiAgICBvdXRbMF0gPSBhWzBdIC0gYlswXTtcbiAgICBvdXRbMV0gPSBhWzFdIC0gYlsxXTtcbiAgICBvdXRbMl0gPSBhWzJdIC0gYlsyXTtcbiAgICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIE11bHRpcGxpZXMgdHdvIHZlYzMnc1xuICpcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjM30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG11bHRpcGx5KG91dCwgYSwgYikge1xuICAgIG91dFswXSA9IGFbMF0gKiBiWzBdO1xuICAgIG91dFsxXSA9IGFbMV0gKiBiWzFdO1xuICAgIG91dFsyXSA9IGFbMl0gKiBiWzJdO1xuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogRGl2aWRlcyB0d28gdmVjMydzXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjM30gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge3ZlYzN9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gZGl2aWRlKG91dCwgYSwgYikge1xuICAgIG91dFswXSA9IGFbMF0gLyBiWzBdO1xuICAgIG91dFsxXSA9IGFbMV0gLyBiWzFdO1xuICAgIG91dFsyXSA9IGFbMl0gLyBiWzJdO1xuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogU2NhbGVzIGEgdmVjMyBieSBhIHNjYWxhciBudW1iZXJcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMzfSBhIHRoZSB2ZWN0b3IgdG8gc2NhbGVcbiAqIEBwYXJhbSB7TnVtYmVyfSBiIGFtb3VudCB0byBzY2FsZSB0aGUgdmVjdG9yIGJ5XG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzY2FsZShvdXQsIGEsIGIpIHtcbiAgICBvdXRbMF0gPSBhWzBdICogYjtcbiAgICBvdXRbMV0gPSBhWzFdICogYjtcbiAgICBvdXRbMl0gPSBhWzJdICogYjtcbiAgICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGV1Y2xpZGlhbiBkaXN0YW5jZSBiZXR3ZWVuIHR3byB2ZWMzJ3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjM30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IGRpc3RhbmNlIGJldHdlZW4gYSBhbmQgYlxuICovXG5leHBvcnQgZnVuY3Rpb24gZGlzdGFuY2UoYSwgYikge1xuICAgIGxldCB4ID0gYlswXSAtIGFbMF07XG4gICAgbGV0IHkgPSBiWzFdIC0gYVsxXTtcbiAgICBsZXQgeiA9IGJbMl0gLSBhWzJdO1xuICAgIHJldHVybiBNYXRoLnNxcnQoeCAqIHggKyB5ICogeSArIHogKiB6KTtcbn1cblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBzcXVhcmVkIGV1Y2xpZGlhbiBkaXN0YW5jZSBiZXR3ZWVuIHR3byB2ZWMzJ3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjM30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IHNxdWFyZWQgZGlzdGFuY2UgYmV0d2VlbiBhIGFuZCBiXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzcXVhcmVkRGlzdGFuY2UoYSwgYikge1xuICAgIGxldCB4ID0gYlswXSAtIGFbMF07XG4gICAgbGV0IHkgPSBiWzFdIC0gYVsxXTtcbiAgICBsZXQgeiA9IGJbMl0gLSBhWzJdO1xuICAgIHJldHVybiB4ICogeCArIHkgKiB5ICsgeiAqIHo7XG59XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgc3F1YXJlZCBsZW5ndGggb2YgYSB2ZWMzXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBhIHZlY3RvciB0byBjYWxjdWxhdGUgc3F1YXJlZCBsZW5ndGggb2ZcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IHNxdWFyZWQgbGVuZ3RoIG9mIGFcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNxdWFyZWRMZW5ndGgoYSkge1xuICAgIGxldCB4ID0gYVswXTtcbiAgICBsZXQgeSA9IGFbMV07XG4gICAgbGV0IHogPSBhWzJdO1xuICAgIHJldHVybiB4ICogeCArIHkgKiB5ICsgeiAqIHo7XG59XG5cbi8qKlxuICogTmVnYXRlcyB0aGUgY29tcG9uZW50cyBvZiBhIHZlYzNcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMzfSBhIHZlY3RvciB0byBuZWdhdGVcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG5lZ2F0ZShvdXQsIGEpIHtcbiAgICBvdXRbMF0gPSAtYVswXTtcbiAgICBvdXRbMV0gPSAtYVsxXTtcbiAgICBvdXRbMl0gPSAtYVsyXTtcbiAgICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIGludmVyc2Ugb2YgdGhlIGNvbXBvbmVudHMgb2YgYSB2ZWMzXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjM30gYSB2ZWN0b3IgdG8gaW52ZXJ0XG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpbnZlcnNlKG91dCwgYSkge1xuICAgIG91dFswXSA9IDEuMCAvIGFbMF07XG4gICAgb3V0WzFdID0gMS4wIC8gYVsxXTtcbiAgICBvdXRbMl0gPSAxLjAgLyBhWzJdO1xuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogTm9ybWFsaXplIGEgdmVjM1xuICpcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdmVjdG9yIHRvIG5vcm1hbGl6ZVxuICogQHJldHVybnMge3ZlYzN9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gbm9ybWFsaXplKG91dCwgYSkge1xuICAgIGxldCB4ID0gYVswXTtcbiAgICBsZXQgeSA9IGFbMV07XG4gICAgbGV0IHogPSBhWzJdO1xuICAgIGxldCBsZW4gPSB4ICogeCArIHkgKiB5ICsgeiAqIHo7XG4gICAgaWYgKGxlbiA+IDApIHtcbiAgICAgICAgLy9UT0RPOiBldmFsdWF0ZSB1c2Ugb2YgZ2xtX2ludnNxcnQgaGVyZT9cbiAgICAgICAgbGVuID0gMSAvIE1hdGguc3FydChsZW4pO1xuICAgIH1cbiAgICBvdXRbMF0gPSBhWzBdICogbGVuO1xuICAgIG91dFsxXSA9IGFbMV0gKiBsZW47XG4gICAgb3V0WzJdID0gYVsyXSAqIGxlbjtcbiAgICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGRvdCBwcm9kdWN0IG9mIHR3byB2ZWMzJ3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjM30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IGRvdCBwcm9kdWN0IG9mIGEgYW5kIGJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRvdChhLCBiKSB7XG4gICAgcmV0dXJuIGFbMF0gKiBiWzBdICsgYVsxXSAqIGJbMV0gKyBhWzJdICogYlsyXTtcbn1cblxuLyoqXG4gKiBDb21wdXRlcyB0aGUgY3Jvc3MgcHJvZHVjdCBvZiB0d28gdmVjMydzXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjM30gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge3ZlYzN9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gY3Jvc3Mob3V0LCBhLCBiKSB7XG4gICAgbGV0IGF4ID0gYVswXSxcbiAgICAgICAgYXkgPSBhWzFdLFxuICAgICAgICBheiA9IGFbMl07XG4gICAgbGV0IGJ4ID0gYlswXSxcbiAgICAgICAgYnkgPSBiWzFdLFxuICAgICAgICBieiA9IGJbMl07XG5cbiAgICBvdXRbMF0gPSBheSAqIGJ6IC0gYXogKiBieTtcbiAgICBvdXRbMV0gPSBheiAqIGJ4IC0gYXggKiBiejtcbiAgICBvdXRbMl0gPSBheCAqIGJ5IC0gYXkgKiBieDtcbiAgICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFBlcmZvcm1zIGEgbGluZWFyIGludGVycG9sYXRpb24gYmV0d2VlbiB0d28gdmVjMydzXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjM30gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHBhcmFtIHtOdW1iZXJ9IHQgaW50ZXJwb2xhdGlvbiBhbW91bnQgYmV0d2VlbiB0aGUgdHdvIGlucHV0c1xuICogQHJldHVybnMge3ZlYzN9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gbGVycChvdXQsIGEsIGIsIHQpIHtcbiAgICBsZXQgYXggPSBhWzBdO1xuICAgIGxldCBheSA9IGFbMV07XG4gICAgbGV0IGF6ID0gYVsyXTtcbiAgICBvdXRbMF0gPSBheCArIHQgKiAoYlswXSAtIGF4KTtcbiAgICBvdXRbMV0gPSBheSArIHQgKiAoYlsxXSAtIGF5KTtcbiAgICBvdXRbMl0gPSBheiArIHQgKiAoYlsyXSAtIGF6KTtcbiAgICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFRyYW5zZm9ybXMgdGhlIHZlYzMgd2l0aCBhIG1hdDQuXG4gKiA0dGggdmVjdG9yIGNvbXBvbmVudCBpcyBpbXBsaWNpdGx5ICcxJ1xuICpcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIHZlY3RvciB0byB0cmFuc2Zvcm1cbiAqIEBwYXJhbSB7bWF0NH0gbSBtYXRyaXggdG8gdHJhbnNmb3JtIHdpdGhcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRyYW5zZm9ybU1hdDQob3V0LCBhLCBtKSB7XG4gICAgbGV0IHggPSBhWzBdLFxuICAgICAgICB5ID0gYVsxXSxcbiAgICAgICAgeiA9IGFbMl07XG4gICAgbGV0IHcgPSBtWzNdICogeCArIG1bN10gKiB5ICsgbVsxMV0gKiB6ICsgbVsxNV07XG4gICAgdyA9IHcgfHwgMS4wO1xuICAgIG91dFswXSA9IChtWzBdICogeCArIG1bNF0gKiB5ICsgbVs4XSAqIHogKyBtWzEyXSkgLyB3O1xuICAgIG91dFsxXSA9IChtWzFdICogeCArIG1bNV0gKiB5ICsgbVs5XSAqIHogKyBtWzEzXSkgLyB3O1xuICAgIG91dFsyXSA9IChtWzJdICogeCArIG1bNl0gKiB5ICsgbVsxMF0gKiB6ICsgbVsxNF0pIC8gdztcbiAgICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFNhbWUgYXMgYWJvdmUgYnV0IGRvZXNuJ3QgYXBwbHkgdHJhbnNsYXRpb24uXG4gKiBVc2VmdWwgZm9yIHJheXMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzY2FsZVJvdGF0ZU1hdDQob3V0LCBhLCBtKSB7XG4gICAgbGV0IHggPSBhWzBdLFxuICAgICAgICB5ID0gYVsxXSxcbiAgICAgICAgeiA9IGFbMl07XG4gICAgbGV0IHcgPSBtWzNdICogeCArIG1bN10gKiB5ICsgbVsxMV0gKiB6ICsgbVsxNV07XG4gICAgdyA9IHcgfHwgMS4wO1xuICAgIG91dFswXSA9IChtWzBdICogeCArIG1bNF0gKiB5ICsgbVs4XSAqIHopIC8gdztcbiAgICBvdXRbMV0gPSAobVsxXSAqIHggKyBtWzVdICogeSArIG1bOV0gKiB6KSAvIHc7XG4gICAgb3V0WzJdID0gKG1bMl0gKiB4ICsgbVs2XSAqIHkgKyBtWzEwXSAqIHopIC8gdztcbiAgICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFRyYW5zZm9ybXMgdGhlIHZlYzMgd2l0aCBhIG1hdDMuXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjM30gYSB0aGUgdmVjdG9yIHRvIHRyYW5zZm9ybVxuICogQHBhcmFtIHttYXQzfSBtIHRoZSAzeDMgbWF0cml4IHRvIHRyYW5zZm9ybSB3aXRoXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0cmFuc2Zvcm1NYXQzKG91dCwgYSwgbSkge1xuICAgIGxldCB4ID0gYVswXSxcbiAgICAgICAgeSA9IGFbMV0sXG4gICAgICAgIHogPSBhWzJdO1xuICAgIG91dFswXSA9IHggKiBtWzBdICsgeSAqIG1bM10gKyB6ICogbVs2XTtcbiAgICBvdXRbMV0gPSB4ICogbVsxXSArIHkgKiBtWzRdICsgeiAqIG1bN107XG4gICAgb3V0WzJdID0geCAqIG1bMl0gKyB5ICogbVs1XSArIHogKiBtWzhdO1xuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogVHJhbnNmb3JtcyB0aGUgdmVjMyB3aXRoIGEgcXVhdFxuICpcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIHZlY3RvciB0byB0cmFuc2Zvcm1cbiAqIEBwYXJhbSB7cXVhdH0gcSBxdWF0ZXJuaW9uIHRvIHRyYW5zZm9ybSB3aXRoXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0cmFuc2Zvcm1RdWF0KG91dCwgYSwgcSkge1xuICAgIC8vIGJlbmNobWFya3M6IGh0dHBzOi8vanNwZXJmLmNvbS9xdWF0ZXJuaW9uLXRyYW5zZm9ybS12ZWMzLWltcGxlbWVudGF0aW9ucy1maXhlZFxuXG4gICAgbGV0IHggPSBhWzBdLFxuICAgICAgICB5ID0gYVsxXSxcbiAgICAgICAgeiA9IGFbMl07XG4gICAgbGV0IHF4ID0gcVswXSxcbiAgICAgICAgcXkgPSBxWzFdLFxuICAgICAgICBxeiA9IHFbMl0sXG4gICAgICAgIHF3ID0gcVszXTtcblxuICAgIGxldCB1dnggPSBxeSAqIHogLSBxeiAqIHk7XG4gICAgbGV0IHV2eSA9IHF6ICogeCAtIHF4ICogejtcbiAgICBsZXQgdXZ6ID0gcXggKiB5IC0gcXkgKiB4O1xuXG4gICAgbGV0IHV1dnggPSBxeSAqIHV2eiAtIHF6ICogdXZ5O1xuICAgIGxldCB1dXZ5ID0gcXogKiB1dnggLSBxeCAqIHV2ejtcbiAgICBsZXQgdXV2eiA9IHF4ICogdXZ5IC0gcXkgKiB1dng7XG5cbiAgICBsZXQgdzIgPSBxdyAqIDI7XG4gICAgdXZ4ICo9IHcyO1xuICAgIHV2eSAqPSB3MjtcbiAgICB1dnogKj0gdzI7XG5cbiAgICB1dXZ4ICo9IDI7XG4gICAgdXV2eSAqPSAyO1xuICAgIHV1dnogKj0gMjtcblxuICAgIG91dFswXSA9IHggKyB1dnggKyB1dXZ4O1xuICAgIG91dFsxXSA9IHkgKyB1dnkgKyB1dXZ5O1xuICAgIG91dFsyXSA9IHogKyB1dnogKyB1dXZ6O1xuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogR2V0IHRoZSBhbmdsZSBiZXR3ZWVuIHR3byAzRCB2ZWN0b3JzXG4gKiBAcGFyYW0ge3ZlYzN9IGEgVGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjM30gYiBUaGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IFRoZSBhbmdsZSBpbiByYWRpYW5zXG4gKi9cbmV4cG9ydCBjb25zdCBhbmdsZSA9IChmdW5jdGlvbiAoKSB7XG4gICAgY29uc3QgdGVtcEEgPSBbMCwgMCwgMF07XG4gICAgY29uc3QgdGVtcEIgPSBbMCwgMCwgMF07XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gKGEsIGIpIHtcbiAgICAgICAgY29weSh0ZW1wQSwgYSk7XG4gICAgICAgIGNvcHkodGVtcEIsIGIpO1xuXG4gICAgICAgIG5vcm1hbGl6ZSh0ZW1wQSwgdGVtcEEpO1xuICAgICAgICBub3JtYWxpemUodGVtcEIsIHRlbXBCKTtcblxuICAgICAgICBsZXQgY29zaW5lID0gZG90KHRlbXBBLCB0ZW1wQik7XG5cbiAgICAgICAgaWYgKGNvc2luZSA+IDEuMCkge1xuICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgIH0gZWxzZSBpZiAoY29zaW5lIDwgLTEuMCkge1xuICAgICAgICAgICAgcmV0dXJuIE1hdGguUEk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gTWF0aC5hY29zKGNvc2luZSk7XG4gICAgICAgIH1cbiAgICB9O1xufSkoKTtcblxuLyoqXG4gKiBSZXR1cm5zIHdoZXRoZXIgb3Igbm90IHRoZSB2ZWN0b3JzIGhhdmUgZXhhY3RseSB0aGUgc2FtZSBlbGVtZW50cyBpbiB0aGUgc2FtZSBwb3NpdGlvbiAod2hlbiBjb21wYXJlZCB3aXRoID09PSlcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IGEgVGhlIGZpcnN0IHZlY3Rvci5cbiAqIEBwYXJhbSB7dmVjM30gYiBUaGUgc2Vjb25kIHZlY3Rvci5cbiAqIEByZXR1cm5zIHtCb29sZWFufSBUcnVlIGlmIHRoZSB2ZWN0b3JzIGFyZSBlcXVhbCwgZmFsc2Ugb3RoZXJ3aXNlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZXhhY3RFcXVhbHMoYSwgYikge1xuICAgIHJldHVybiBhWzBdID09PSBiWzBdICYmIGFbMV0gPT09IGJbMV0gJiYgYVsyXSA9PT0gYlsyXTtcbn1cbiIsImNvbnN0IEVQU0lMT04gPSAwLjAwMDAwMTtcblxuLyoqXG4gKiBDb3B5IHRoZSB2YWx1ZXMgZnJvbSBvbmUgdmVjNCB0byBhbm90aGVyXG4gKlxuICogQHBhcmFtIHt2ZWM0fSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjNH0gYSB0aGUgc291cmNlIHZlY3RvclxuICogQHJldHVybnMge3ZlYzR9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gY29weShvdXQsIGEpIHtcbiAgICBvdXRbMF0gPSBhWzBdO1xuICAgIG91dFsxXSA9IGFbMV07XG4gICAgb3V0WzJdID0gYVsyXTtcbiAgICBvdXRbM10gPSBhWzNdO1xuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogU2V0IHRoZSBjb21wb25lbnRzIG9mIGEgdmVjNCB0byB0aGUgZ2l2ZW4gdmFsdWVzXG4gKlxuICogQHBhcmFtIHt2ZWM0fSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7TnVtYmVyfSB4IFggY29tcG9uZW50XG4gKiBAcGFyYW0ge051bWJlcn0geSBZIGNvbXBvbmVudFxuICogQHBhcmFtIHtOdW1iZXJ9IHogWiBjb21wb25lbnRcbiAqIEBwYXJhbSB7TnVtYmVyfSB3IFcgY29tcG9uZW50XG4gKiBAcmV0dXJucyB7dmVjNH0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZXQob3V0LCB4LCB5LCB6LCB3KSB7XG4gICAgb3V0WzBdID0geDtcbiAgICBvdXRbMV0gPSB5O1xuICAgIG91dFsyXSA9IHo7XG4gICAgb3V0WzNdID0gdztcbiAgICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIEFkZHMgdHdvIHZlYzQnc1xuICpcbiAqIEBwYXJhbSB7dmVjNH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjNH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFkZChvdXQsIGEsIGIpIHtcbiAgICBvdXRbMF0gPSBhWzBdICsgYlswXTtcbiAgICBvdXRbMV0gPSBhWzFdICsgYlsxXTtcbiAgICBvdXRbMl0gPSBhWzJdICsgYlsyXTtcbiAgICBvdXRbM10gPSBhWzNdICsgYlszXTtcbiAgICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFNjYWxlcyBhIHZlYzQgYnkgYSBzY2FsYXIgbnVtYmVyXG4gKlxuICogQHBhcmFtIHt2ZWM0fSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjNH0gYSB0aGUgdmVjdG9yIHRvIHNjYWxlXG4gKiBAcGFyYW0ge051bWJlcn0gYiBhbW91bnQgdG8gc2NhbGUgdGhlIHZlY3RvciBieVxuICogQHJldHVybnMge3ZlYzR9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gc2NhbGUob3V0LCBhLCBiKSB7XG4gICAgb3V0WzBdID0gYVswXSAqIGI7XG4gICAgb3V0WzFdID0gYVsxXSAqIGI7XG4gICAgb3V0WzJdID0gYVsyXSAqIGI7XG4gICAgb3V0WzNdID0gYVszXSAqIGI7XG4gICAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBsZW5ndGggb2YgYSB2ZWM0XG4gKlxuICogQHBhcmFtIHt2ZWM0fSBhIHZlY3RvciB0byBjYWxjdWxhdGUgbGVuZ3RoIG9mXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBsZW5ndGggb2YgYVxuICovXG5leHBvcnQgZnVuY3Rpb24gbGVuZ3RoKGEpIHtcbiAgICBsZXQgeCA9IGFbMF07XG4gICAgbGV0IHkgPSBhWzFdO1xuICAgIGxldCB6ID0gYVsyXTtcbiAgICBsZXQgdyA9IGFbM107XG4gICAgcmV0dXJuIE1hdGguc3FydCh4ICogeCArIHkgKiB5ICsgeiAqIHogKyB3ICogdyk7XG59XG5cbi8qKlxuICogTm9ybWFsaXplIGEgdmVjNFxuICpcbiAqIEBwYXJhbSB7dmVjNH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzR9IGEgdmVjdG9yIHRvIG5vcm1hbGl6ZVxuICogQHJldHVybnMge3ZlYzR9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gbm9ybWFsaXplKG91dCwgYSkge1xuICAgIGxldCB4ID0gYVswXTtcbiAgICBsZXQgeSA9IGFbMV07XG4gICAgbGV0IHogPSBhWzJdO1xuICAgIGxldCB3ID0gYVszXTtcbiAgICBsZXQgbGVuID0geCAqIHggKyB5ICogeSArIHogKiB6ICsgdyAqIHc7XG4gICAgaWYgKGxlbiA+IDApIHtcbiAgICAgICAgbGVuID0gMSAvIE1hdGguc3FydChsZW4pO1xuICAgIH1cbiAgICBvdXRbMF0gPSB4ICogbGVuO1xuICAgIG91dFsxXSA9IHkgKiBsZW47XG4gICAgb3V0WzJdID0geiAqIGxlbjtcbiAgICBvdXRbM10gPSB3ICogbGVuO1xuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgZG90IHByb2R1Y3Qgb2YgdHdvIHZlYzQnc1xuICpcbiAqIEBwYXJhbSB7dmVjNH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWM0fSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge051bWJlcn0gZG90IHByb2R1Y3Qgb2YgYSBhbmQgYlxuICovXG5leHBvcnQgZnVuY3Rpb24gZG90KGEsIGIpIHtcbiAgICByZXR1cm4gYVswXSAqIGJbMF0gKyBhWzFdICogYlsxXSArIGFbMl0gKiBiWzJdICsgYVszXSAqIGJbM107XG59XG5cbi8qKlxuICogUGVyZm9ybXMgYSBsaW5lYXIgaW50ZXJwb2xhdGlvbiBiZXR3ZWVuIHR3byB2ZWM0J3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWM0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcGFyYW0ge051bWJlcn0gdCBpbnRlcnBvbGF0aW9uIGFtb3VudCBiZXR3ZWVuIHRoZSB0d28gaW5wdXRzXG4gKiBAcmV0dXJucyB7dmVjNH0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBsZXJwKG91dCwgYSwgYiwgdCkge1xuICAgIGxldCBheCA9IGFbMF07XG4gICAgbGV0IGF5ID0gYVsxXTtcbiAgICBsZXQgYXogPSBhWzJdO1xuICAgIGxldCBhdyA9IGFbM107XG4gICAgb3V0WzBdID0gYXggKyB0ICogKGJbMF0gLSBheCk7XG4gICAgb3V0WzFdID0gYXkgKyB0ICogKGJbMV0gLSBheSk7XG4gICAgb3V0WzJdID0gYXogKyB0ICogKGJbMl0gLSBheik7XG4gICAgb3V0WzNdID0gYXcgKyB0ICogKGJbM10gLSBhdyk7XG4gICAgcmV0dXJuIG91dDtcbn1cbiIsIi8vIENvcmVcbmV4cG9ydCB7IEdlb21ldHJ5IH0gZnJvbSAnLi9jb3JlL0dlb21ldHJ5LmpzJztcbmV4cG9ydCB7IFByb2dyYW0gfSBmcm9tICcuL2NvcmUvUHJvZ3JhbS5qcyc7XG5leHBvcnQgeyBSZW5kZXJlciB9IGZyb20gJy4vY29yZS9SZW5kZXJlci5qcyc7XG5leHBvcnQgeyBDYW1lcmEgfSBmcm9tICcuL2NvcmUvQ2FtZXJhLmpzJztcbmV4cG9ydCB7IFRyYW5zZm9ybSB9IGZyb20gJy4vY29yZS9UcmFuc2Zvcm0uanMnO1xuZXhwb3J0IHsgTWVzaCB9IGZyb20gJy4vY29yZS9NZXNoLmpzJztcbmV4cG9ydCB7IFRleHR1cmUgfSBmcm9tICcuL2NvcmUvVGV4dHVyZS5qcyc7XG5leHBvcnQgeyBSZW5kZXJUYXJnZXQgfSBmcm9tICcuL2NvcmUvUmVuZGVyVGFyZ2V0LmpzJztcblxuLy8gTWF0aHNcbmV4cG9ydCB7IENvbG9yIH0gZnJvbSAnLi9tYXRoL0NvbG9yLmpzJztcbmV4cG9ydCB7IEV1bGVyIH0gZnJvbSAnLi9tYXRoL0V1bGVyLmpzJztcbmV4cG9ydCB7IE1hdDMgfSBmcm9tICcuL21hdGgvTWF0My5qcyc7XG5leHBvcnQgeyBNYXQ0IH0gZnJvbSAnLi9tYXRoL01hdDQuanMnO1xuZXhwb3J0IHsgUXVhdCB9IGZyb20gJy4vbWF0aC9RdWF0LmpzJztcbmV4cG9ydCB7IFZlYzIgfSBmcm9tICcuL21hdGgvVmVjMi5qcyc7XG5leHBvcnQgeyBWZWMzIH0gZnJvbSAnLi9tYXRoL1ZlYzMuanMnO1xuZXhwb3J0IHsgVmVjNCB9IGZyb20gJy4vbWF0aC9WZWM0LmpzJztcblxuLy8gRXh0cmFzXG5leHBvcnQgeyBQbGFuZSB9IGZyb20gJy4vZXh0cmFzL1BsYW5lLmpzJztcbmV4cG9ydCB7IEJveCB9IGZyb20gJy4vZXh0cmFzL0JveC5qcyc7XG5leHBvcnQgeyBTcGhlcmUgfSBmcm9tICcuL2V4dHJhcy9TcGhlcmUuanMnO1xuZXhwb3J0IHsgQ3lsaW5kZXIgfSBmcm9tICcuL2V4dHJhcy9DeWxpbmRlci5qcyc7XG5leHBvcnQgeyBUcmlhbmdsZSB9IGZyb20gJy4vZXh0cmFzL1RyaWFuZ2xlLmpzJztcbmV4cG9ydCB7IFRvcnVzIH0gZnJvbSAnLi9leHRyYXMvVG9ydXMuanMnO1xuZXhwb3J0IHsgT3JiaXQgfSBmcm9tICcuL2V4dHJhcy9PcmJpdC5qcyc7XG5leHBvcnQgeyBSYXljYXN0IH0gZnJvbSAnLi9leHRyYXMvUmF5Y2FzdC5qcyc7XG5leHBvcnQgeyBDdXJ2ZSB9IGZyb20gJy4vZXh0cmFzL0N1cnZlLmpzJztcbmV4cG9ydCB7IFBvc3QgfSBmcm9tICcuL2V4dHJhcy9Qb3N0LmpzJztcbmV4cG9ydCB7IFNraW4gfSBmcm9tICcuL2V4dHJhcy9Ta2luLmpzJztcbmV4cG9ydCB7IEFuaW1hdGlvbiB9IGZyb20gJy4vZXh0cmFzL0FuaW1hdGlvbi5qcyc7XG5leHBvcnQgeyBUZXh0IH0gZnJvbSAnLi9leHRyYXMvVGV4dC5qcyc7XG5leHBvcnQgeyBOb3JtYWxQcm9ncmFtIH0gZnJvbSAnLi9leHRyYXMvTm9ybWFsUHJvZ3JhbS5qcyc7XG5leHBvcnQgeyBGbG93bWFwIH0gZnJvbSAnLi9leHRyYXMvRmxvd21hcC5qcyc7XG5leHBvcnQgeyBHUEdQVSB9IGZyb20gJy4vZXh0cmFzL0dQR1BVLmpzJztcbmV4cG9ydCB7IFBvbHlsaW5lIH0gZnJvbSAnLi9leHRyYXMvUG9seWxpbmUuanMnO1xuZXhwb3J0IHsgU2hhZG93IH0gZnJvbSAnLi9leHRyYXMvU2hhZG93LmpzJztcbmV4cG9ydCB7IEtUWFRleHR1cmUgfSBmcm9tICcuL2V4dHJhcy9LVFhUZXh0dXJlLmpzJztcbmV4cG9ydCB7IFRleHR1cmVMb2FkZXIgfSBmcm9tICcuL2V4dHJhcy9UZXh0dXJlTG9hZGVyLmpzJztcbmV4cG9ydCB7IEdMVEZMb2FkZXIgfSBmcm9tICcuL2V4dHJhcy9HTFRGTG9hZGVyLmpzJztcbmV4cG9ydCB7IEdMVEZTa2luIH0gZnJvbSAnLi9leHRyYXMvR0xURlNraW4uanMnO1xuXG4iLCJpbXBvcnQge1xuICAgIENhbWVyYSxcbiAgICBPR0xSZW5kZXJpbmdDb250ZXh0LFxuICAgIFBvc3QsXG4gICAgUG9zdEZCTyxcbiAgICBQb3N0T3B0aW9ucywgUHJvZ3JhbSxcbiAgICBSZW5kZXJlcixcbiAgICBSZW5kZXJUYXJnZXQsXG4gICAgUmVuZGVyVGFyZ2V0T3B0aW9ucyxcbiAgICBUcmFuc2Zvcm1cbn0gZnJvbSBcIi4uL29nbFwiO1xuXG5leHBvcnQgY2xhc3MgUGFzcyB7XG4gICAgZW5hYmxlZDogYm9vbGVhbjtcbiAgICByZW5kZXJUb1NjcmVlbjogYm9vbGVhbjtcbiAgICBuZWVkc1N3YXA6IGJvb2xlYW47XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMuZW5hYmxlZCA9IHRydWU7XG4gICAgICAgIHRoaXMucmVuZGVyVG9TY3JlZW4gPSBmYWxzZTtcbiAgICAgICAgdGhpcy5uZWVkc1N3YXAgPSB0cnVlO1xuICAgIH1cblxuICAgIHJlbmRlcihyZW5kZXJlcjogUmVuZGVyZXIsIHdyaXRlQnVmZmVyOiBSZW5kZXJUYXJnZXR8dW5kZWZpbmVkLCByZWFkQnVmZmVyOiBSZW5kZXJUYXJnZXQpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignTm90IGltcGxlbWVudGVkJyk7XG4gICAgfVxuICAgIHJlbmRlcldpdGhGQk8ocmVuZGVyZXI6IFJlbmRlcmVyLCBmYm86IFBvc3RGQk8pe1xuICAgICAgICBmYm8ucmVhZCAmJiB0aGlzLnJlbmRlcihyZW5kZXJlciwgZmJvLndyaXRlLCBmYm8ucmVhZCk7XG4gICAgfVxuICAgIHJlc2l6ZSh7IHdpZHRoLCBoZWlnaHQsIGRwciB9OiBQYXJ0aWFsPHtcbiAgICAgICAgd2lkdGg6IG51bWJlcjtcbiAgICAgICAgaGVpZ2h0OiBudW1iZXI7XG4gICAgICAgIGRwcjogbnVtYmVyO1xuICAgIH0+KTogdm9pZHtcbiAgICAgICAgY29uc29sZS5lcnJvcignTm90IGltcGxlbWVudGVkJyk7XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgUmVuZGVyUGFzcyBleHRlbmRzIFBhc3Mge1xuICAgIHByaXZhdGUgc2NlbmU6IFRyYW5zZm9ybTtcbiAgICBwcml2YXRlIGNhbWVyYTogQ2FtZXJhO1xuICAgIGNvbnN0cnVjdG9yKHNjZW5lOiBUcmFuc2Zvcm0sIGNhbWVyYTogQ2FtZXJhKSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIHRoaXMuc2NlbmUgPSBzY2VuZTtcbiAgICAgICAgdGhpcy5jYW1lcmEgPSBjYW1lcmE7XG4gICAgfVxuICAgIFxuICAgIHJlbmRlcihyZW5kZXJlcjogUmVuZGVyZXIsIHdyaXRlQnVmZmVyOiBSZW5kZXJUYXJnZXR8dW5kZWZpbmVkLCByZWFkQnVmZmVyOiBSZW5kZXJUYXJnZXQpIHtcbiAgICAgICAgcmVuZGVyZXIucmVuZGVyKHtzY2VuZTogdGhpcy5zY2VuZSwgY2FtZXJhOiB0aGlzLmNhbWVyYSwgdGFyZ2V0OiByZWFkQnVmZmVyfSk7XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgQ3VzdG9tUG9zdCBleHRlbmRzIFBvc3Qge1xuICAgIHBhc3NlczogUGFzc1tdID0gW107XG5cbiAgICBjb25zdHJ1Y3RvcihnbDogT0dMUmVuZGVyaW5nQ29udGV4dCwgb3B0aW9uczpQYXJ0aWFsPFBvc3RPcHRpb25zPiA9IHt9LCBmYm8/OiBQb3N0RkJPKSB7XG4gICAgICAgIHN1cGVyKGdsLCBvcHRpb25zLCBmYm8pO1xuICAgIH1cblxuICAgIGFkZFBhc3MocGFzczogUGFzcykge1xuICAgICAgICB0aGlzLnBhc3Nlcy5wdXNoKHBhc3MpO1xuICAgICAgICByZXR1cm4gcGFzcztcbiAgICB9XG5cbiAgICByZW5kZXIoeyB0YXJnZXQ9IHVuZGVmaW5lZCwgdXBkYXRlID0gdHJ1ZSwgc29ydCA9IHRydWUsIGZydXN0dW1DdWxsID0gdHJ1ZSB9KSB7XG4gICAgICAgIGNvbnN0IGVuYWJsZWRQYXNzZXMgPSB0aGlzLnBhc3Nlcy5maWx0ZXIoKHBhc3MpID0+IHBhc3MuZW5hYmxlZCk7XG4gICAgICAgIGVuYWJsZWRQYXNzZXMuZm9yRWFjaCgocGFzcywgaSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5fcmVuZGVyUGFzcyhwYXNzKTtcbiAgICAgICAgICAgIHBhc3MubmVlZHNTd2FwICYmIHRoaXMuZmJvLnN3YXAoKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIF9yZW5kZXJQYXNzKHBhc3M6IFBhc3MpIHtcbiAgICAgICAgcGFzcy5yZW5kZXJXaXRoRkJPKHRoaXMuZ2wucmVuZGVyZXIsIHRoaXMuZmJvKTtcbiAgICB9XG5cbiAgICByZXNpemUoeyB3aWR0aCwgaGVpZ2h0LCBkcHIgfTogUGFydGlhbDx7XG4gICAgICAgIHdpZHRoOiBudW1iZXI7XG4gICAgICAgIGhlaWdodDogbnVtYmVyO1xuICAgICAgICBkcHI6IG51bWJlcjtcbiAgICB9Pik6IHZvaWR7XG4gICAgICAgIHN1cGVyLnJlc2l6ZSh7d2lkdGg6IHdpZHRoLCBoZWlnaHQ6IGhlaWdodCwgZHByOiBkcHJ9KTtcbiAgICAgICAgdGhpcy5wYXNzZXMuZm9yRWFjaCggKHBhc3MpID0+IHtcbiAgICAgICAgICAgIHBhc3MucmVzaXplKHt3aWR0aCwgaGVpZ2h0LCBkcHJ9KTtcbiAgICAgICAgfSlcbiAgICB9XG59XG4iLCJpbXBvcnQge1xyXG4gICAgUmVuZGVyZXIsXHJcbiAgICBSZW5kZXJUYXJnZXQsXHJcbiAgICBQcm9ncmFtLFxyXG4gICAgVGV4dHVyZSxcclxuICAgIFRyYW5zZm9ybSxcclxuICAgIENhbWVyYSxcclxuICAgIE1lc2gsXHJcbiAgICBQbGFuZSxcclxuICAgIFZlYzIsXHJcbiAgICBPR0xSZW5kZXJpbmdDb250ZXh0XHJcbn0gZnJvbSAnLi4vb2dsJztcclxuXHJcblxyXG5leHBvcnQgY2xhc3MgVXRpbHMge1xyXG4gICAgc3RhdGljIHJlYWRvbmx5IGNvcHlWZXJ0ZXggPSAvKiBnbHNsICovIGBcclxuICAgIGF0dHJpYnV0ZSB2ZWMyIHV2O1xyXG4gICAgYXR0cmlidXRlIHZlYzMgcG9zaXRpb247XHJcbiAgICB2YXJ5aW5nIHZlYzIgdlV2O1xyXG4gICAgdW5pZm9ybSBtYXQ0IG1vZGVsTWF0cml4O1xyXG4gICAgdW5pZm9ybSBtYXQ0IHByb2plY3Rpb25NYXRyaXg7XHJcblxyXG4gICAgdm9pZCBtYWluKCkge1xyXG4gICAgICAgIHZVdiA9IHV2O1xyXG4gICAgICAgIGdsX1Bvc2l0aW9uID0gcHJvamVjdGlvbk1hdHJpeCAqIG1vZGVsTWF0cml4ICogdmVjNChwb3NpdGlvbiwgMSk7XHJcbiAgICB9XHJcbmA7XHJcbiAgICBzdGF0aWMgcmVhZG9ubHkgY29weUZyYWdtZW50ID0gLyogZ2xzbCAqLyBgXHJcbiAgICBwcmVjaXNpb24gaGlnaHAgZmxvYXQ7XHJcbiAgICB1bmlmb3JtIHNhbXBsZXIyRCB0TWFwO1xyXG4gICAgdmFyeWluZyB2ZWMyIHZVdjtcclxuICAgIHZvaWQgbWFpbigpIHtcclxuICAgICAgICBnbF9GcmFnQ29sb3IgPSB0ZXh0dXJlMkQodE1hcCwgdlV2KTtcclxuICAgIH1cclxuYDtcclxuICAgIHByaXZhdGUgc3RhdGljIGluc3RhbmNlTWFwXzogTWFwPHN0cmluZywgVXRpbHM+ID0gbmV3IE1hcDxzdHJpbmcsIFV0aWxzPigpO1xyXG4gICAgcHJpdmF0ZSBjb3B5cHJvZ3JhbV86IFByb2dyYW07XHJcbiAgICBwcml2YXRlIG9ydGhvU2NlbmVfOiBUcmFuc2Zvcm0gPSBuZXcgVHJhbnNmb3JtKCk7XHJcbiAgICBwcml2YXRlIG1lc2hfOiBNZXNoO1xyXG4gICAgcHJpdmF0ZSBvcnRob0NhbWVyYV86IENhbWVyYTtcclxuICAgIHByaXZhdGUgZ2w6IE9HTFJlbmRlcmluZ0NvbnRleHQ7XHJcblxyXG4gICAgY29uc3RydWN0b3IoZ2w6IE9HTFJlbmRlcmluZ0NvbnRleHQpIHtcclxuICAgICAgICB0aGlzLmdsID0gZ2w7XHJcbiAgICAgICAgdGhpcy5jb3B5cHJvZ3JhbV8gPSBuZXcgUHJvZ3JhbShnbCwge1xyXG4gICAgICAgICAgICB2ZXJ0ZXg6IFV0aWxzLmNvcHlWZXJ0ZXgsXHJcbiAgICAgICAgICAgIGZyYWdtZW50OiBVdGlscy5jb3B5RnJhZ21lbnQsXHJcbiAgICAgICAgICAgIHVuaWZvcm1zOiB7dE1hcDoge3ZhbHVlOiB7dGV4dHVyZTogbnVsbH19fSxcclxuICAgICAgICAgICAgZGVwdGhUZXN0OiBmYWxzZSxcclxuICAgICAgICAgICAgZGVwdGhXcml0ZTogZmFsc2UsXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5vcnRob0NhbWVyYV8gPSBuZXcgQ2FtZXJhKGdsKTtcclxuICAgICAgICB0aGlzLm9ydGhvQ2FtZXJhXy5vcnRob2dyYXBoaWMoe25lYXI6IDAsIGZhcjogMTAsIGxlZnQ6IC0xLCByaWdodDogMSwgYm90dG9tOiAtMSwgdG9wOiAxfSk7XHJcbiAgICAgICAgbGV0IHBsYW5lID0gbmV3IFBsYW5lKGdsLCB7d2lkdGg6IDIsIGhlaWdodDogMn0pO1xyXG4gICAgICAgIHRoaXMubWVzaF8gPSBuZXcgTWVzaChnbCwge2dlb21ldHJ5OiBwbGFuZX0pO1xyXG4gICAgICAgIHRoaXMubWVzaF8uc2V0UGFyZW50KHRoaXMub3J0aG9TY2VuZV8pO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzdGF0aWMgZ2V0SW5zdGFuY2UoZ2w6IGFueSk6IFV0aWxzIHtcclxuICAgICAgICBsZXQgaW5zID0gVXRpbHMuaW5zdGFuY2VNYXBfLmdldChnbC5jYW52YXMuaWQpO1xyXG4gICAgICAgIGlmICghaW5zKSBVdGlscy5pbnN0YW5jZU1hcF8uc2V0KGdsLmNhbnZhcy5pZCwgKGlucyA9IG5ldyBVdGlscyhnbCkpKTtcclxuICAgICAgICByZXR1cm4gaW5zO1xyXG4gICAgfVxyXG5cclxuICAgIHJlbmRlclBhc3MocmVuZGVyZXI6IFJlbmRlcmVyLCBwcm9ncmFtOiBQcm9ncmFtLCB0YXJnZXQ/OiBSZW5kZXJUYXJnZXQsIGNsZWFyPzogYm9vbGVhbikge1xyXG4gICAgICAgIHRoaXMubWVzaF8ucHJvZ3JhbSA9IHByb2dyYW07XHJcbiAgICAgICAgcmVuZGVyZXIucmVuZGVyKHtzY2VuZTogdGhpcy5vcnRob1NjZW5lXywgY2FtZXJhOiB0aGlzLm9ydGhvQ2FtZXJhXywgdGFyZ2V0LCBjbGVhcn0pO1xyXG4gICAgfVxyXG5cclxuICAgIGJsaXQocmVuZGVyZXI6IFJlbmRlcmVyLCBzb3VyY2U6IFJlbmRlclRhcmdldCB8IFRleHR1cmUsIHRhcmdldD86IFJlbmRlclRhcmdldCwgY2xlYXI/OiBib29sZWFuKSB7XHJcbiAgICAgICAgdGhpcy5jb3B5cHJvZ3JhbV8udW5pZm9ybXNbJ3RNYXAnXS52YWx1ZSA9IHNvdXJjZS50ZXh0dXJlID8gc291cmNlLnRleHR1cmUgOiBzb3VyY2U7XHJcbiAgICAgICAgdGhpcy5yZW5kZXJQYXNzKHJlbmRlcmVyLCB0aGlzLmNvcHlwcm9ncmFtXywgdGFyZ2V0LCBjbGVhcilcclxuICAgICAgICB0aGlzLm1lc2hfLnByb2dyYW0gPSB0aGlzLmNvcHlwcm9ncmFtXztcclxuICAgIH1cclxuXHJcbn1cclxuIiwiaW1wb3J0IHtcbiAgICBDYW1lcmEsXG4gICAgT0dMUmVuZGVyaW5nQ29udGV4dCxcbiAgICBQb3N0RkJPLCBQb3N0T3B0aW9ucyxcbiAgICBQcm9ncmFtLFxuICAgIFJlbmRlcmVyLFxuICAgIFJlbmRlclRhcmdldCxcbiAgICBSZW5kZXJUYXJnZXRPcHRpb25zLFxuICAgIFRyYW5zZm9ybVxufSBmcm9tIFwiLi4vb2dsXCI7XG5pbXBvcnQge1V0aWxzfSBmcm9tIFwiLi4vZXh0cmFzL1JlbmRlclV0aWxzXCI7XG5pbXBvcnQge0N1c3RvbVBvc3QsIFBhc3N9IGZyb20gXCIuLi9leHRyYXMvQ3VzdG9tUG9zdFwiO1xuaW1wb3J0IHtFbmNvZGluZ0hlbHBlciwgVG9uZU1hcHBpbmdIZWxwZXJ9IGZyb20gXCIuLi91dGlscy91dGlsXCI7XG5leHBvcnQgY2xhc3MgSERSUmVuZGVyUGFzcyBleHRlbmRzIFBhc3Mge1xuICAgIHByaXZhdGUgYmxhY2tQcm9ncmFtOiBQcm9ncmFtO1xuICAgIGdldCBjYW1lcmEoKTogQ2FtZXJhIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2NhbWVyYTtcbiAgICB9XG4gICAgZ2V0IHNjZW5lKCk6IFRyYW5zZm9ybSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zY2VuZTtcbiAgICB9XG4gICAgcHJpdmF0ZSBfc2NlbmU6IFRyYW5zZm9ybTtcbiAgICBwcml2YXRlIF9jYW1lcmE6IENhbWVyYTtcbiAgICBwcml2YXRlIGJsZW5kUHJvZ3JhbTogUHJvZ3JhbTtcbiAgICBwcml2YXRlIGdsOiBPR0xSZW5kZXJpbmdDb250ZXh0O1xuICAgIGNvbnN0cnVjdG9yKGdsOiBPR0xSZW5kZXJpbmdDb250ZXh0LCBzY2VuZTogVHJhbnNmb3JtLCBjYW1lcmE6IENhbWVyYSkge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzLmdsID0gZ2w7XG4gICAgICAgIHRoaXMuX3NjZW5lID0gc2NlbmU7XG4gICAgICAgIHRoaXMuX2NhbWVyYSA9IGNhbWVyYTtcbiAgICAgICAgdGhpcy5uZWVkc1N3YXAgPSB0cnVlO1xuICAgICAgICB0aGlzLmJsZW5kUHJvZ3JhbSA9IG5ldyBQcm9ncmFtKGdsLCB7dmVydGV4OiBVdGlscy5jb3B5VmVydGV4LCBmcmFnbWVudDogYFxuICAgICAgICAgICAgcHJlY2lzaW9uIGhpZ2hwIGZsb2F0O1xuICAgICAgICAgICAgI2RlZmluZSBpbnB1dEVuY29kaW5nICR7RW5jb2RpbmdIZWxwZXIuUkdCTTE2fVxuICAgICAgICAgICAgI2RlZmluZSBvdXRwdXRFbmNvZGluZyAke0VuY29kaW5nSGVscGVyLlJHQk0xNn1cbiAgICAgICAgICAgICR7RW5jb2RpbmdIZWxwZXIuc2hhZGVyQ2h1bmt9XG4gICAgICAgICAgICB1bmlmb3JtIHNhbXBsZXIyRCB0T3BhcXVlO1xuICAgICAgICAgICAgdW5pZm9ybSBzYW1wbGVyMkQgdFRyYW5zcGFyZW50O1xuICAgICAgICAgICAgdmFyeWluZyB2ZWMyIHZVdjtcbiAgICAgICAgICAgIHZvaWQgbWFpbigpIHtcbiAgICAgICAgICAgICAgICB2ZWMzIG9wYXF1ZSA9IGlucHV0VGV4ZWxUb0xpbmVhcih0ZXh0dXJlMkQodE9wYXF1ZSwgdlV2KSkucmdiO1xuICAgICAgICAgICAgICAgIHZlYzQgdHJhbnNwYXJlbnQgPSB0ZXh0dXJlMkQodFRyYW5zcGFyZW50LCB2VXYpO1xuICAgICAgICAgICAgICAgIGdsX0ZyYWdDb2xvciA9IGxpbmVhclRvT3V0cHV0VGV4ZWwodmVjNChvcGFxdWUgKiAoMS4gLSB0cmFuc3BhcmVudC5hKSArIHRyYW5zcGFyZW50LnJnYiAqIHRyYW5zcGFyZW50LmEsIDEuKSk7XG4gICAgICAgICAgICAgICAgLy8gZ2xfRnJhZ0NvbG9yID0gbGluZWFyVG9PdXRwdXRUZXhlbCh2ZWM0KG9wYXF1ZSwgMS4pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgYCwgdW5pZm9ybXM6IHtcbiAgICAgICAgICAgICAgICB0T3BhcXVlOiB7dmFsdWU6IHt0ZXh0dXJlOiBudWxsfX0sXG4gICAgICAgICAgICAgICAgdFRyYW5zcGFyZW50OiB7dmFsdWU6IHt0ZXh0dXJlOiBudWxsfX1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBkZXB0aFRlc3Q6IGZhbHNlLFxuICAgICAgICAgICAgZGVwdGhXcml0ZTogZmFsc2VcblxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5ibGFja1Byb2dyYW0gPSBuZXcgUHJvZ3JhbShnbCwge3ZlcnRleDogVXRpbHMuY29weVZlcnRleCwgZnJhZ21lbnQ6IGBcbiAgICAgICAgICAgIHByZWNpc2lvbiBoaWdocCBmbG9hdDtcbiAgICAgICAgICAgIHZhcnlpbmcgdmVjMiB2VXY7XG4gICAgICAgICAgICB2b2lkIG1haW4oKSB7XG4gICAgICAgICAgICAgICAgZ2xfRnJhZ0NvbG9yID0gdmVjNCgwLDAsMCwwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgYCwgdW5pZm9ybXM6IHtcbiAgICAgICAgICAgICAgICB0T3BhcXVlOiB7dmFsdWU6IHt0ZXh0dXJlOiBudWxsfX0sXG4gICAgICAgICAgICAgICAgdFRyYW5zcGFyZW50OiB7dmFsdWU6IHt0ZXh0dXJlOiBudWxsfX1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBkZXB0aFRlc3Q6IGZhbHNlLFxuICAgICAgICAgICAgZGVwdGhXcml0ZTogZmFsc2VcblxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICByZW5kZXJXaXRoRkJPKHJlbmRlcmVyOiBSZW5kZXJlciwgZmJvOiBIRFJGcmFtZSl7XG4gICAgICAgIHRoaXMuX3NjZW5lLnVwZGF0ZU1hdHJpeFdvcmxkKCk7XG4gICAgICAgIHJlbmRlcmVyLmdsLmNsZWFyQ29sb3IoMCwwLDAsMCk7XG4gICAgICAgIGlmIChmYm8udHJhbnNwYXJlbnQgJiYgZmJvLnJlYWQpIHtcbiAgICAgICAgICAgIGlmICghKGZiby50cmFuc3BhcmVudCAmJiBmYm8ucmVhZCkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsZXQgcmVuZGVyTGlzdCA9IHJlbmRlcmVyLnNvcnRSZW5kZXJMaXN0KHJlbmRlcmVyLnNjZW5lVG9SZW5kZXJMaXN0KHRoaXMuX3NjZW5lLCB0cnVlLCB0aGlzLl9jYW1lcmEpLCB0aGlzLl9jYW1lcmEsIHRydWUpO1xuICAgICAgICAgICAgcmVuZGVyZXIucmVuZGVyKHtcbiAgICAgICAgICAgICAgICBzY2VuZTogcmVuZGVyTGlzdC5vcGFxdWUsXG4gICAgICAgICAgICAgICAgY2FtZXJhOiB0aGlzLl9jYW1lcmEsXG4gICAgICAgICAgICAgICAgdGFyZ2V0OiBmYm8ucmVhZCxcbiAgICAgICAgICAgICAgICBzb3J0OiBmYWxzZSxcbiAgICAgICAgICAgICAgICBjbGVhcjogZmFsc2VcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy5nbC5iaW5kRnJhbWVidWZmZXIoZmJvLnRyYW5zcGFyZW50LnRhcmdldCwgZmJvLnRyYW5zcGFyZW50LmJ1ZmZlcik7XG4gICAgICAgICAgICBpZiAoZmJvLnJlYWQuZGVwdGggJiYgIWZiby5yZWFkLnN0ZW5jaWwpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmdsLmZyYW1lYnVmZmVyUmVuZGVyYnVmZmVyKGZiby50cmFuc3BhcmVudC50YXJnZXQsIHRoaXMuZ2wuREVQVEhfQVRUQUNITUVOVCwgdGhpcy5nbC5SRU5ERVJCVUZGRVIsIGZiby5yZWFkLmRlcHRoQnVmZmVyKTtcbiAgICAgICAgICAgIH1lbHNlIGlmIChmYm8ucmVhZC5zdGVuY2lsICYmICFmYm8ucmVhZC5kZXB0aCkge1xuICAgICAgICAgICAgICAgIHRoaXMuZ2wuZnJhbWVidWZmZXJSZW5kZXJidWZmZXIoZmJvLnRyYW5zcGFyZW50LnRhcmdldCwgdGhpcy5nbC5TVEVOQ0lMX0FUVEFDSE1FTlQsIHRoaXMuZ2wuUkVOREVSQlVGRkVSLCBmYm8ucmVhZC5zdGVuY2lsQnVmZmVyKTtcbiAgICAgICAgICAgIH1lbHNlIGlmIChmYm8ucmVhZC5kZXB0aCAmJiBmYm8ucmVhZC5zdGVuY2lsKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5nbC5mcmFtZWJ1ZmZlclJlbmRlcmJ1ZmZlcihmYm8udHJhbnNwYXJlbnQudGFyZ2V0LCB0aGlzLmdsLkRFUFRIX1NURU5DSUxfQVRUQUNITUVOVCwgdGhpcy5nbC5SRU5ERVJCVUZGRVIsIGZiby5yZWFkLmRlcHRoU3RlbmNpbEJ1ZmZlcik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmYm8udHJhbnNwYXJlbnQuZGVwdGggPSB0cnVlO1xuICAgICAgICAgICAgbGV0IG9sZENsZWFyQ29sb3IgPSByZW5kZXJlci5jb2xvcjtcbiAgICAgICAgICAgIGxldCBvbGRDbGVhckRlcHRoID0gcmVuZGVyZXIuZGVwdGg7XG4gICAgICAgICAgICByZW5kZXJlci5jb2xvciA9IHRydWU7XG4gICAgICAgICAgICByZW5kZXJlci5kZXB0aCA9IGZhbHNlO1xuICAgICAgICAgICAgLy90b2RvOiBjaGVjayBzdGVuY2lsXG4gICAgICAgICAgICByZW5kZXJlci5yZW5kZXIoe1xuICAgICAgICAgICAgICAgIHNjZW5lOiBbLi4ucmVuZGVyTGlzdC50cmFuc3BhcmVudCwgLi4ucmVuZGVyTGlzdC51aV0sXG4gICAgICAgICAgICAgICAgY2FtZXJhOiB0aGlzLl9jYW1lcmEsXG4gICAgICAgICAgICAgICAgdGFyZ2V0OiBmYm8udHJhbnNwYXJlbnQsXG4gICAgICAgICAgICAgICAgc29ydDogZmFsc2UsXG4gICAgICAgICAgICAgICAgY2xlYXI6IHRydWVcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy5ibGVuZFByb2dyYW0udW5pZm9ybXMudE9wYXF1ZS52YWx1ZSA9IGZiby5yZWFkLnRleHR1cmU7XG4gICAgICAgICAgICB0aGlzLmJsZW5kUHJvZ3JhbS51bmlmb3Jtcy50VHJhbnNwYXJlbnQudmFsdWUgPSBmYm8udHJhbnNwYXJlbnQudGV4dHVyZTtcbiAgICAgICAgICAgIFV0aWxzLmdldEluc3RhbmNlKHJlbmRlcmVyLmdsKS5yZW5kZXJQYXNzKHJlbmRlcmVyLCB0aGlzLmJsZW5kUHJvZ3JhbSwgZmJvLndyaXRlLCB0cnVlKTtcbiAgICAgICAgICAgIHJlbmRlcmVyLmNvbG9yID0gb2xkQ2xlYXJDb2xvcjtcbiAgICAgICAgICAgIHJlbmRlcmVyLmRlcHRoID0gb2xkQ2xlYXJEZXB0aDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlbmRlcmVyLnJlbmRlcih7c2NlbmU6IHRoaXMuX3NjZW5lLCBjYW1lcmE6IHRoaXMuX2NhbWVyYSwgdGFyZ2V0OiBmYm8ucmVhZH0pO1xuICAgICAgICB9XG4gICAgfVxufVxuZXhwb3J0IGNsYXNzIEhEUlRvbmVNYXBQYXNzIGV4dGVuZHMgUGFzcyB7XG4gICAgcHJpdmF0ZSB0b25lTWFwUHJvZ3JhbTogUHJvZ3JhbTtcbiAgICBwcml2YXRlIGdsOiBPR0xSZW5kZXJpbmdDb250ZXh0O1xuICAgIGNvbnN0cnVjdG9yKGdsOiBPR0xSZW5kZXJpbmdDb250ZXh0LCBoZHIgPSB0cnVlKSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIHRoaXMuZ2wgPSBnbDtcbiAgICAgICAgdGhpcy5uZWVkc1N3YXAgPSBmYWxzZTtcbiAgICAgICAgdGhpcy50b25lTWFwUHJvZ3JhbSA9IG5ldyBQcm9ncmFtKGdsLCB7dmVydGV4OiBVdGlscy5jb3B5VmVydGV4LCBmcmFnbWVudDogYFxuICAgICAgICAgICAgcHJlY2lzaW9uIGhpZ2hwIGZsb2F0O1xuICAgICAgICAgICAgI2RlZmluZSBpbnB1dEVuY29kaW5nICR7aGRyP0VuY29kaW5nSGVscGVyLlJHQk0xNjpFbmNvZGluZ0hlbHBlci5MaW5lYXJ9XG4gICAgICAgICAgICAjZGVmaW5lIG91dHB1dEVuY29kaW5nICR7RW5jb2RpbmdIZWxwZXIuc1JHQn1cbiAgICAgICAgICAgICNkZWZpbmUgdG9uZW1hcHBpbmdNb2RlICR7VG9uZU1hcHBpbmdIZWxwZXIuTGluZWFyfVxuICAgICAgICAgICAgJHtFbmNvZGluZ0hlbHBlci5zaGFkZXJDaHVua31cbiAgICAgICAgICAgICR7VG9uZU1hcHBpbmdIZWxwZXIuc2hhZGVyQ2h1bmt9XG4gICAgICAgICAgICB1bmlmb3JtIHNhbXBsZXIyRCB0TWFwO1xuICAgICAgICAgICAgdmFyeWluZyB2ZWMyIHZVdjtcbiAgICAgICAgICAgIHZvaWQgbWFpbigpIHtcbiAgICAgICAgICAgICAgICB2ZWM0IGNvbG9yID0gaW5wdXRUZXhlbFRvTGluZWFyKHRleHR1cmUyRCh0TWFwLCB2VXYpKTtcbiAgICAgICAgICAgICAgICBjb2xvci5yZ2IgPSB0b25lTWFwQ29sb3IoY29sb3IucmdiKTtcbiAgICAgICAgICAgICAgICBnbF9GcmFnQ29sb3IgPSBsaW5lYXJUb091dHB1dFRleGVsKGNvbG9yKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgYCwgdW5pZm9ybXM6IHtcbiAgICAgICAgICAgICAgICB0TWFwOiB7dmFsdWU6IHt0ZXh0dXJlOiBudWxsfX0sXG4gICAgICAgICAgICAgICAgLi4uVG9uZU1hcHBpbmdIZWxwZXIudW5pZm9ybXMgLy90b2RvOiB1bmlmb3JtIHV0aWxzIGNsb25lLlxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBkZXB0aFRlc3Q6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGRlcHRoV3JpdGU6IGZhbHNlXG4gICAgICAgICAgICB9XG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgcmVuZGVyV2l0aEZCTyhyZW5kZXJlcjogUmVuZGVyZXIsIGZibzogSERSRnJhbWUpe1xuICAgICAgICB0aGlzLnRvbmVNYXBQcm9ncmFtLnVuaWZvcm1zWyd0TWFwJ10udmFsdWUgPSBmYm8ucmVhZD8udGV4dHVyZTtcbiAgICAgICAgVXRpbHMuZ2V0SW5zdGFuY2UocmVuZGVyZXIuZ2wpLnJlbmRlclBhc3MocmVuZGVyZXIsIHRoaXMudG9uZU1hcFByb2dyYW0sIHRoaXMucmVuZGVyVG9TY3JlZW4gPyB1bmRlZmluZWQgOiBmYm8ud3JpdGUsIHRydWUpO1xuICAgIH1cbiAgICByZXNpemUoeyB3aWR0aCwgaGVpZ2h0LCBkcHIgfTogUGFydGlhbDx7XG4gICAgICAgIHdpZHRoOiBudW1iZXI7XG4gICAgICAgIGhlaWdodDogbnVtYmVyO1xuICAgICAgICBkcHI6IG51bWJlcjtcbiAgICB9Pik6IHZvaWR7XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgSERSSGVscGVyIHtcbiAgICByZWFkb25seSBmbG9hdGluZ1N1cHBvcnRFeHQgPSB7XG4gICAgICAgIHRleHR1cmU6ICdPRVNfdGV4dHVyZV9mbG9hdCcsXG4gICAgICAgIGxpbmVhcjogJ09FU190ZXh0dXJlX2Zsb2F0X2xpbmVhcicsXG4gICAgICAgIGNvbG9yOiAnV0VCR0xfY29sb3JfYnVmZmVyX2Zsb2F0JyxcbiAgICAgICAgaF90ZXh0dXJlOiAnT0VTX3RleHR1cmVfaGFsZl9mbG9hdCcsXG4gICAgICAgIGhfbGluZWFyOiAnT0VTX3RleHR1cmVfaGFsZl9mbG9hdF9saW5lYXInLFxuICAgICAgICBoX2NvbG9yOiAnRVhUX2NvbG9yX2J1ZmZlcl9oYWxmX2Zsb2F0JyxcbiAgICB9O1xuICAgIHByaXZhdGUgcmVhZG9ubHkgX2Zsb2F0aW5nU3VwcG9ydDogYW55ID0ge1xuICAgICAgICB0ZXh0dXJlOiBmYWxzZSxcbiAgICAgICAgbGluZWFyOiBmYWxzZSxcbiAgICAgICAgY29sb3I6IGZhbHNlLFxuICAgICAgICBoX3RleHR1cmU6IGZhbHNlLFxuICAgICAgICBoX2xpbmVhcjogZmFsc2UsXG4gICAgICAgIGhfY29sb3I6IGZhbHNlLFxuICAgIH07XG4gICAgcHJpdmF0ZSBnbDogT0dMUmVuZGVyaW5nQ29udGV4dDtcbiAgICBnZXQgaGFsZkZsb2F0VHlwZSgpOiBudW1iZXJ7XG4gICAgICAgIHJldHVybiB0aGlzLmZsb2F0aW5nU3VwcG9ydC5oX2NvbG9yID8gdGhpcy5mbG9hdGluZ1N1cHBvcnQuaF90ZXh0dXJlLkhBTEZfRkxPQVRfT0VTIDogdGhpcy5mbG9hdFR5cGU7XG4gICAgfTtcbiAgICBnZXQgZmxvYXRUeXBlKCk6IG51bWJlcntcbiAgICAgICAgcmV0dXJuICh0aGlzLmZsb2F0aW5nU3VwcG9ydC5jb2xvciA/IHRoaXMuZ2wuRkxPQVQgOiB0aGlzLmdsLlVOU0lHTkVEX0JZVEUpO1xuICAgIH07XG4gICAgZ2V0IGludFR5cGUoKTogbnVtYmVye1xuICAgICAgICByZXR1cm4gdGhpcy5nbC5VTlNJR05FRF9CWVRFO1xuICAgIH07XG4gICAgZ2V0IGNhbkZsb2F0RHJhdygpOiBudW1iZXJ7XG4gICAgICAgIHJldHVybiB0aGlzLmZsb2F0aW5nU3VwcG9ydC5oX2NvbG9yIHx8IHRoaXMuZmxvYXRpbmdTdXBwb3J0LmNvbG9yO1xuICAgIH07XG5cbiAgICBjb25zdHJ1Y3RvcihnbDogT0dMUmVuZGVyaW5nQ29udGV4dCkge1xuICAgICAgICB0aGlzLmdsID0gZ2w7XG4gICAgICAgIHRoaXMuaW5pdEZsb2F0U3VwcG9ydCgpO1xuICAgIH1cblxuICAgIGluaXRGbG9hdFN1cHBvcnQoKSB7XG4gICAgICAgIGxldCBleHQgPSB0aGlzLmdsLmdldEV4dGVuc2lvbih0aGlzLmZsb2F0aW5nU3VwcG9ydEV4dC50ZXh0dXJlKTtcbiAgICAgICAgaWYgKGV4dCkge1xuICAgICAgICAgICAgdGhpcy5fZmxvYXRpbmdTdXBwb3J0LnRleHR1cmUgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5fZmxvYXRpbmdTdXBwb3J0LmNvbG9yID0gdGhpcy5nbC5nZXRFeHRlbnNpb24odGhpcy5mbG9hdGluZ1N1cHBvcnRFeHQuY29sb3IpOyAvLyB0b2RvIGNoZWNrIGJ5IGRyYXdpbmdcbiAgICAgICAgICAgIHRoaXMuX2Zsb2F0aW5nU3VwcG9ydC5saW5lYXIgPSB0aGlzLmdsLmdldEV4dGVuc2lvbih0aGlzLmZsb2F0aW5nU3VwcG9ydEV4dC5saW5lYXIpO1xuICAgICAgICB9XG4gICAgICAgIGV4dCA9IHRoaXMuZ2wuZ2V0RXh0ZW5zaW9uKHRoaXMuZmxvYXRpbmdTdXBwb3J0RXh0LmhfdGV4dHVyZSk7XG4gICAgICAgIGlmIChleHQpIHtcbiAgICAgICAgICAgIHRoaXMuX2Zsb2F0aW5nU3VwcG9ydC5oX3RleHR1cmUgPSBleHQ7XG4gICAgICAgICAgICB0aGlzLl9mbG9hdGluZ1N1cHBvcnQuaF9jb2xvciA9IHRoaXMuZ2wuZ2V0RXh0ZW5zaW9uKHRoaXMuZmxvYXRpbmdTdXBwb3J0RXh0LmhfY29sb3IpO1xuICAgICAgICAgICAgdGhpcy5fZmxvYXRpbmdTdXBwb3J0LmhfbGluZWFyID0gdGhpcy5nbC5nZXRFeHRlbnNpb24odGhpcy5mbG9hdGluZ1N1cHBvcnRFeHQuaF9saW5lYXIpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGdldCBmbG9hdGluZ1N1cHBvcnQoKTogYW55IHtcbiAgICAgICAgcmV0dXJuIHsuLi50aGlzLl9mbG9hdGluZ1N1cHBvcnR9O1xuICAgIH1cblxuXG59XG5cbmV4cG9ydCBjbGFzcyBIRFJGcmFtZSBpbXBsZW1lbnRzIFBvc3RGQk97XG4gICAgcmVhZD86IFJlbmRlclRhcmdldDtcbiAgICB3cml0ZT86IFJlbmRlclRhcmdldDtcbiAgICB0cmFuc3BhcmVudD86IFJlbmRlclRhcmdldDtcbiAgICBwcml2YXRlIGdsOiBPR0xSZW5kZXJpbmdDb250ZXh0O1xuICAgIHByaXZhdGUgaGVscGVyOiBIRFJIZWxwZXI7XG5cbiAgICBjb25zdHJ1Y3RvcihnbDogT0dMUmVuZGVyaW5nQ29udGV4dCwgaGVscGVyOiBIRFJIZWxwZXIpIHtcbiAgICAgICAgdGhpcy5nbCA9IGdsO1xuICAgICAgICB0aGlzLmhlbHBlciA9IGhlbHBlcjtcbiAgICB9XG4gICAgc3dhcCgpOiB2b2lkIHtcbiAgICAgICAgbGV0IHQgPSB0aGlzLnJlYWQ7XG4gICAgICAgIHRoaXMucmVhZCA9IHRoaXMud3JpdGU7XG4gICAgICAgIHRoaXMud3JpdGUgPSB0O1xuICAgIH1cblxuICAgIGNyZWF0ZShvcHRpb25zOiBQYXJ0aWFsPFJlbmRlclRhcmdldE9wdGlvbnM+KXtcbiAgICAgICAgdGhpcy5yZWFkID0gbmV3IFJlbmRlclRhcmdldCh0aGlzLmdsLCBvcHRpb25zKTtcbiAgICAgICAgdGhpcy53cml0ZSA9IG5ldyBSZW5kZXJUYXJnZXQodGhpcy5nbCwgb3B0aW9ucyk7XG4gICAgICAgIHRoaXMudHJhbnNwYXJlbnQgPSBuZXcgUmVuZGVyVGFyZ2V0KHRoaXMuZ2wsIHtcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgICAgICB0eXBlOiB0aGlzLmhlbHBlci5oYWxmRmxvYXRUeXBlLFxuICAgICAgICAgICAgZm9ybWF0OiB0aGlzLmdsLlJHQkEsXG4gICAgICAgICAgICBkZXB0aDogZmFsc2UsXG4gICAgICAgICAgICBpbnRlcm5hbEZvcm1hdDogKHRoaXMuaGVscGVyLmNhbkZsb2F0RHJhdyAmJiB0aGlzLmdsLnJlbmRlcmVyLmlzV2ViZ2wyKSA/ICh0aGlzLmdsIGFzIFdlYkdMMlJlbmRlcmluZ0NvbnRleHQpLlJHQkEzMkYgOiB0aGlzLmdsLlJHQkEsXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGRpc3Bvc2UoKXtcbiAgICAgICAgdGhpcy5yZWFkICYmIHRoaXMucmVhZC5kaXNwb3NlKCk7XG4gICAgICAgIHRoaXMud3JpdGUgJiYgdGhpcy53cml0ZS5kaXNwb3NlKCk7XG4gICAgICAgIHRoaXMudHJhbnNwYXJlbnQgJiYgdGhpcy50cmFuc3BhcmVudC5kaXNwb3NlKCk7XG4gICAgICAgIHRoaXMucmVhZCA9IHVuZGVmaW5lZDtcbiAgICAgICAgdGhpcy53cml0ZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgdGhpcy50cmFuc3BhcmVudCA9IHVuZGVmaW5lZDtcbiAgICB9XG5cbn1cblxuZXhwb3J0IGludGVyZmFjZSBIRFJQb3N0T3B0aW9ucyBleHRlbmRzIFBvc3RPcHRpb25ze1xuICAgIC8vIGVuY29kaW5nOiBudW1iZXJcbn1cblxuZXhwb3J0IGNsYXNzIEhEUkNvbXBvc2VyIGV4dGVuZHMgQ3VzdG9tUG9zdHtcbiAgICBjb25zdHJ1Y3RvcihnbDogT0dMUmVuZGVyaW5nQ29udGV4dCwgb3B0aW9uczogUGFydGlhbDxIRFJQb3N0T3B0aW9ucz4pIHtcbiAgICAgICAgc3VwZXIoZ2wsIG9wdGlvbnMsIG5ldyBIRFJGcmFtZShnbCwgbmV3IEhEUkhlbHBlcihnbCkpKTtcbiAgICB9XG5cbiAgICBkaXNwb3NlRmJvKCkge1xuICAgICAgICAodGhpcy5mYm8gYXMgSERSRnJhbWUpLmRpc3Bvc2UoKTtcbiAgICB9XG5cbiAgICBpbml0RmJvKCkge1xuICAgICAgICAodGhpcy5mYm8gYXMgSERSRnJhbWUpLmNyZWF0ZSh0aGlzLm9wdGlvbnMpO1xuICAgIH1cbn1cbiIsImV4cG9ydCAqIGZyb20gXCIuL29nbFwiXG5cbmV4cG9ydCAqIGZyb20gJy4vbWF0ZXJpYWxzL3Bicm1hdGVyaWFsJztcbmV4cG9ydCAqIGZyb20gXCIuL3V0aWxzL3VuaWZvcm1VdGlsc1wiO1xuZXhwb3J0ICogZnJvbSBcIi4vdXRpbHMvcGJyaGVscGVyXCI7XG5leHBvcnQgKiBmcm9tIFwiLi91dGlscy91dGlsXCI7XG5leHBvcnQgKiBmcm9tIFwiLi91dGlscy9ldmVudGRpc3BhdGNoZXJcIjtcbmV4cG9ydCAqIGZyb20gXCIuL2V4dHJhcy9DdXN0b21Qb3N0XCI7XG5leHBvcnQgKiBmcm9tIFwiLi9leHRyYXMvUmVuZGVyVXRpbHNcIjtcbmV4cG9ydCAqIGZyb20gXCIuL2hkci9IRFJDb21wb3NlclwiO1xuIiwiaW1wb3J0IHBicnZlcnQgZnJvbSAnLi9zaGFkZXJzL3Bici52ZXJ0JztcbmltcG9ydCBwYnJmcmFnIGZyb20gJy4vc2hhZGVycy9wYnIuZnJhZyc7XG5pbXBvcnQge1Byb2dyYW1DYWNoZX0gZnJvbSAnLi4vdXRpbHMvcHJvZ3JhbWNhY2hlJztcbmltcG9ydCB7UHJvZ3JhbSwgVGV4dHVyZSwgVGV4dHVyZUxvYWRlciwgVmVjMywgVmVjNH0gZnJvbSBcIi4uL29nbFwiO1xuaW1wb3J0IHtFbmNvZGluZ0hlbHBlcn0gZnJvbSBcIi4uL3V0aWxzL3V0aWxcIjtcblxuZXhwb3J0IHR5cGUgVFVuaWZvcm1zID0gUmVjb3JkPHN0cmluZywgeyB2YWx1ZT86IGFueSB9PlxuXG5leHBvcnQgY2xhc3MgUEJSTWF0ZXJpYWwge1xuICAgIHByb3RlY3RlZCBzdGF0aWMgcmVhZG9ubHkgZGVmYXVsdFZlcnRleDogc3RyaW5nID0gcGJydmVydDtcbiAgICBwcm90ZWN0ZWQgc3RhdGljIHJlYWRvbmx5IGRlZmF1bHRGcmFnbWVudDogc3RyaW5nID0gYCR7cGJyZnJhZ31gXG5cbiAgICBwcml2YXRlIGdsXzogYW55O1xuICAgIHByaXZhdGUgcHJvZ3JhbV86IFByb2dyYW07XG4gICAgcHJpdmF0ZSB1bmlmb3Jtc186IGFueTtcbiAgICBwcml2YXRlIHN0YXRpYyBsdXRUZXh0dXJlTWFwOiBNYXA8c3RyaW5nLCBUZXh0dXJlPiA9IG5ldyBNYXA8c3RyaW5nLCBUZXh0dXJlPigpO1xuICAgIHByaXZhdGUgZW52TWFwU3BlY3VsYXJfPzogVGV4dHVyZTtcbiAgICBwcml2YXRlIGVudk1hcERpZmZ1c2VfPzogVGV4dHVyZTtcblxuICAgIHByaXZhdGUgY29sb3JfOiBWZWM0ID0gbmV3IFZlYzQoMSwgMSwgMSwgMSk7XG4gICAgcHJpdmF0ZSByb3VnaG5lc3NfOiBudW1iZXIgPSAwO1xuICAgIHByaXZhdGUgbWV0YWxuZXNzXzogbnVtYmVyID0gMDtcbiAgICBwcml2YXRlIGVudk1hcEludGVuc2l0eV86IG51bWJlciA9IDE7XG5cbiAgICBtYWtlRnJhZ21lbnRTaGFkZXIoZnJhZzogc3RyaW5nLCBoZHIgPSB0cnVlKXtcbiAgICAgICAgcmV0dXJuIGBcbnByZWNpc2lvbiBoaWdocCBmbG9hdDtcbnByZWNpc2lvbiBoaWdocCBpbnQ7XG4jZGVmaW5lIGlucHV0RW5jb2RpbmcgJHtoZHI/RW5jb2RpbmdIZWxwZXIuUkdCTTE2OkVuY29kaW5nSGVscGVyLkxpbmVhcn1cbiNkZWZpbmUgb3V0cHV0RW5jb2RpbmcgJHtoZHI/RW5jb2RpbmdIZWxwZXIuUkdCTTE2OkVuY29kaW5nSGVscGVyLkxpbmVhcn1cbiR7RW5jb2RpbmdIZWxwZXIuc2hhZGVyQ2h1bmt9XG4ke2ZyYWd9XG5gXG4gICAgfVxuICAgIGNvbnN0cnVjdG9yKGdsOiBhbnksIHBicnBhcmFtcz86IFBCUk1hdGVyaWFsUGFyYW1zLCBkZWZpbmVzPyA6IHN0cmluZywgdW5pZm9ybXM/OiBUVW5pZm9ybXMsIHNoYWRlcnM/OiB7ZnJhZz86IHN0cmluZywgdmVydD86IHN0cmluZ30sIGhkcj10cnVlKSB7XG4gICAgICAgIHRoaXMuZ2xfID0gZ2w7XG5cbiAgICAgICAgaWYoIVBCUk1hdGVyaWFsLmx1dFRleHR1cmVNYXAuZ2V0KGdsLmNhbnZhcy5pZCkpIHtcbiAgICAgICAgICAgIFBCUk1hdGVyaWFsLmx1dFRleHR1cmVNYXAuc2V0KGdsLmNhbnZhcy5pZCwgVGV4dHVyZUxvYWRlci5sb2FkKGdsLCB7XG4gICAgICAgICAgICAgIHNyYzogJ2h0dHBzOi8vYXNzZXRzLmpld2xyLmNvbS9qM2QvbHV0LnBuZycsXG4gICAgICAgICAgICB9KSk7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgcGJyVmVydCA9IHNoYWRlcnM/LnZlcnQgPz8gUEJSTWF0ZXJpYWwuZGVmYXVsdFZlcnRleDtcbiAgICAgICAgbGV0IHBickZyYWcgPSBzaGFkZXJzPy5mcmFnID8/IFBCUk1hdGVyaWFsLmRlZmF1bHRGcmFnbWVudDtcblxuICAgICAgICB0aGlzLmNvbG9yXyA9IHBicnBhcmFtcz8uYmFzZUNvbG9yRmFjdG9yICE9PSB1bmRlZmluZWQgPyBuZXcgVmVjNCgpLmNvcHkocGJycGFyYW1zLmJhc2VDb2xvckZhY3RvcikgOiBuZXcgVmVjNCgxLCAxLCAxLCAxKTtcbiAgICAgICAgdGhpcy5yb3VnaG5lc3MgPSBwYnJwYXJhbXM/LnJvdWdobmVzcyAhPT0gdW5kZWZpbmVkID8gcGJycGFyYW1zLnJvdWdobmVzcyA6IDA7XG4gICAgICAgIHRoaXMubWV0YWxuZXNzID0gcGJycGFyYW1zPy5tZXRhbG5lc3MgIT09IHVuZGVmaW5lZCA/IHBicnBhcmFtcy5tZXRhbG5lc3MgOiAwO1xuICAgICAgICB0aGlzLmVudk1hcEludGVuc2l0eSA9IHBicnBhcmFtcz8uZW52TWFwSW50ZW5zaXR5ICE9PSB1bmRlZmluZWQgPyBwYnJwYXJhbXM/LmVudk1hcEludGVuc2l0eSA6IDE7XG5cbiAgICAgICAgdGhpcy51bmlmb3Jtc18gPSB7XG4gICAgICAgICAgICB1QmFzZUNvbG9yRmFjdG9yOiB7IHZhbHVlOiBuZXcgVmVjNCgpLmNvcHkodGhpcy5jb2xvcl8pIH0sXG4gICAgICAgICAgICB0QmFzZUNvbG9yOiB7IHZhbHVlOiBwYnJwYXJhbXM/LmJhc2VDb2xvclRleHR1cmUgPyBwYnJwYXJhbXM/LmJhc2VDb2xvclRleHR1cmUudGV4dHVyZSA6IG51bGwgfSxcblxuICAgICAgICAgICAgdVJvdWdobmVzczogeyB2YWx1ZTogcGJycGFyYW1zPy5yb3VnaG5lc3MgIT09IHVuZGVmaW5lZCA/IHBicnBhcmFtcz8ucm91Z2huZXNzIDogMSB9LFxuICAgICAgICAgICAgdU1ldGFsbGljOiB7IHZhbHVlOiBwYnJwYXJhbXM/Lm1ldGFsbmVzcyAhPT0gdW5kZWZpbmVkID8gcGJycGFyYW1zPy5tZXRhbG5lc3MgOiAxIH0sXG5cbiAgICAgICAgICAgIHROb3JtYWw6IHsgdmFsdWU6IHsgdGV4dHVyZTogbnVsbH0gfSxcbiAgICAgICAgICAgIHVOb3JtYWxTY2FsZTogeyB2YWx1ZTogcGJycGFyYW1zPy5ub3JtYWxTY2FsZSB8fCAxIH0sXG5cbiAgICAgICAgICAgIHRPY2NsdXNpb246IHsgdmFsdWU6IHsgdGV4dHVyZTogbnVsbH0gfSxcblxuICAgICAgICAgICAgdEVtaXNzaXZlOiB7IHZhbHVlOiB7IHRleHR1cmU6IG51bGx9IH0sXG4gICAgICAgICAgICB1RW1pc3NpdmU6IHsgdmFsdWU6IHBicnBhcmFtcz8uZW1pc3NpdmUgfHwgWzAsIDAsIDBdIH0sXG5cbiAgICAgICAgICAgIHRMVVQ6IHsgdmFsdWU6IFBCUk1hdGVyaWFsLmx1dFRleHR1cmVNYXAuZ2V0KGdsLmNhbnZhcy5pZCkgfSxcbiAgICAgICAgICAgIHRFbnZEaWZmdXNlOiB7IHZhbHVlOiB7IHRleHR1cmU6IG51bGx9IH0sXG4gICAgICAgICAgICB0RW52U3BlY3VsYXI6IHsgdmFsdWU6IHsgdGV4dHVyZTogbnVsbH0gfSxcbiAgICAgICAgICAgIHVFbnZEaWZmdXNlOiB7IHZhbHVlOiAwLjUgfSxcbiAgICAgICAgICAgIHVFbnZTcGVjdWxhcjogeyB2YWx1ZTogMC41IH0sXG4gICAgICAgICAgICB1RW52TWFwSW50ZW5zaXR5OiB7IHZhbHVlOiAxIH0sXG5cbiAgICAgICAgICAgIHVBbHBoYTogeyB2YWx1ZTogcGJycGFyYW1zPy5hbHBoYSB9LFxuICAgICAgICAgICAgdUFscGhhQ3V0b2ZmOiB7IHZhbHVlOiBwYnJwYXJhbXM/LmFscGhhQ3V0b2ZmIH0sXG5cbiAgICAgICAgICAgIHVUcmFuc3BhcmVudDogeyB2YWx1ZTogcGJycGFyYW1zPy50cmFuc3BhcmVudCB9LFxuXG4gICAgICAgICAgICAuLi4odW5pZm9ybXM/P3t9KSxcbiAgICAgICAgfVxuICAgICAgICBkZWZpbmVzID0gZGVmaW5lcyA/IGRlZmluZXMgOiBgYDtcbiAgICAgICAgdGhpcy5wcm9ncmFtXyA9IHRoaXMuY3JlYXRlUHJvZ3JhbV8oZGVmaW5lcywgcGJyVmVydCwgcGJyRnJhZywgaGRyKTtcbiAgICB9XG5cbiAgICBnZXQgaXNQQlJNYXRlcmlhbCgpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgZ2V0IHByb2dyYW0oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnByb2dyYW1fO1xuICAgIH1cblxuICAgIHNldCBjb2xvcihjb2xvcjogVmVjNCkge1xuICAgICAgICB0aGlzLmNvbG9yXy5jb3B5KGNvbG9yKTtcbiAgICB9XG5cbiAgICBnZXQgY29sb3IoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbG9yXztcbiAgICB9XG5cbiAgICBzZXQgZW1pc3NpdmUoY29sb3I6IFZlYzMpIHtcbiAgICAgICAgbGV0IGNvbG9yXyA9IHRoaXMudW5pZm9ybXNfLnVFbWlzc2l2ZS52YWx1ZTtcbiAgICAgICAgY29sb3JfLmNvcHkoY29sb3IpO1xuICAgIH1cblxuICAgIGdldCBlbWlzc2l2ZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudW5pZm9ybXNfLnVFbWlzc2l2ZS52YWx1ZTtcbiAgICB9XG5cbiAgICBzZXQgcm91Z2huZXNzKHJvdWdobmVzczogbnVtYmVyKSB7XG4gICAgICAgIHRoaXMucm91Z2huZXNzXyA9IHJvdWdobmVzcztcbiAgICB9XG5cbiAgICBnZXQgcm91Z2huZXNzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5yb3VnaG5lc3NfO1xuICAgIH1cblxuICAgIHNldCBtZXRhbG5lc3MobWV0YWxuZXNzOiBudW1iZXIpIHtcbiAgICAgICAgdGhpcy5tZXRhbG5lc3NfID0gbWV0YWxuZXNzO1xuICAgIH1cblxuICAgIGdldCBtZXRhbG5lc3MoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm1ldGFsbmVzc187XG4gICAgfVxuXG4gICAgc2V0IG5vcm1hbFNjYWxlKG5vcm1hbFNjYWxlOiBudW1iZXIpIHtcbiAgICAgICAgdGhpcy51bmlmb3Jtc18udU5vcm1hbFNjYWxlLnZhbHVlID0gbm9ybWFsU2NhbGU7XG4gICAgfVxuXG4gICAgZ2V0IG5vcm1hbFNjYWxlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy51bmlmb3Jtc18udU5vcm1hbFNjYWxlLnZhbHVlO1xuICAgIH1cblxuICAgIHNldCBlbnZNYXBTcGVjdWxhcihlbnZNYXBTcGVjdWxhcjogYW55KSB7XG4gICAgICAgIHRoaXMuZW52TWFwU3BlY3VsYXJfID0gZW52TWFwU3BlY3VsYXI7XG4gICAgfVxuXG4gICAgZ2V0IGVudk1hcFNwZWN1bGFyKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5lbnZNYXBTcGVjdWxhcl87XG4gICAgfVxuXG4gICAgc2V0IGVudk1hcERpZmZ1c2UoZW52TWFwRGlmZnVzZTogYW55KSB7XG4gICAgICAgIHRoaXMuZW52TWFwRGlmZnVzZV8gPSBlbnZNYXBEaWZmdXNlO1xuICAgIH1cblxuICAgIGdldCBlbnZNYXBEaWZmdXNlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5lbnZNYXBEaWZmdXNlXztcbiAgICB9XG5cbiAgICBzZXQgZW52TWFwSW50ZW5zaXR5KGVudk1hcEludGVuc2l0eTogYW55KSB7XG4gICAgICAgIHRoaXMuZW52TWFwSW50ZW5zaXR5XyA9IGVudk1hcEludGVuc2l0eTtcbiAgICB9XG5cbiAgICBnZXQgZW52TWFwSW50ZW5zaXR5KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5lbnZNYXBJbnRlbnNpdHlfO1xuICAgIH1cblxuICAgIHB1YmxpYyBzZXJpYWxpemUoKSA6IFBCUk1hdGVyaWFsUGFyYW1zIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGJhc2VDb2xvcjogbmV3IFZlYzQoMSwgMSwgMSwgMSksXG4gICAgICAgICAgICBiYXNlQ29sb3JGYWN0b3I6IHRoaXMuY29sb3JfLmNvcHkobmV3IFZlYzQoKSksXG4gICAgICAgICAgICByb3VnaG5lc3M6IHRoaXMucm91Z2huZXNzXyxcbiAgICAgICAgICAgIG1ldGFsbmVzczogdGhpcy5tZXRhbG5lc3NfLFxuICAgICAgICAgICAgZW52TWFwSW50ZW5zaXR5OiB0aGlzLmVudk1hcEludGVuc2l0eVxuICAgICAgICAgICAgLy8gbm9ybWFsU2NhbGU6IHRoaXMubm9ybWFsU2NhbGVcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBsb2FkKHBhcmFtczogUEJSTWF0ZXJpYWxQYXJhbXMpIHtcbiAgICAgICAgaWYocGFyYW1zKSB7XG4gICAgICAgICAgICBpZihwYXJhbXMuYmFzZUNvbG9yRmFjdG9yKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jb2xvcl8ueCA9IHBhcmFtcy5iYXNlQ29sb3JGYWN0b3JbMF0gIT09IHVuZGVmaW5lZCA/IHBhcmFtcy5iYXNlQ29sb3JGYWN0b3JbMF0gOiBwYXJhbXMuYmFzZUNvbG9yRmFjdG9yLng7XG4gICAgICAgICAgICAgICAgdGhpcy5jb2xvcl8ueSA9IHBhcmFtcy5iYXNlQ29sb3JGYWN0b3JbMV0gIT09IHVuZGVmaW5lZCA/IHBhcmFtcy5iYXNlQ29sb3JGYWN0b3JbMV0gOiBwYXJhbXMuYmFzZUNvbG9yRmFjdG9yLnk7XG4gICAgICAgICAgICAgICAgdGhpcy5jb2xvcl8ueiA9IHBhcmFtcy5iYXNlQ29sb3JGYWN0b3JbMl0gIT09IHVuZGVmaW5lZCA/IHBhcmFtcy5iYXNlQ29sb3JGYWN0b3JbMl0gOiBwYXJhbXMuYmFzZUNvbG9yRmFjdG9yLno7XG4gICAgICAgICAgICAgICAgdGhpcy5jb2xvcl8udyA9IHBhcmFtcy5iYXNlQ29sb3JGYWN0b3JbM10gIT09IHVuZGVmaW5lZCA/IHBhcmFtcy5iYXNlQ29sb3JGYWN0b3JbM10gOiBwYXJhbXMuYmFzZUNvbG9yRmFjdG9yLnc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZihwYXJhbXMuZW1pc3NpdmUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmVtaXNzaXZlLnggPSBwYXJhbXMuZW1pc3NpdmUueDtcbiAgICAgICAgICAgICAgICB0aGlzLmVtaXNzaXZlLnkgPSBwYXJhbXMuZW1pc3NpdmUueTtcbiAgICAgICAgICAgICAgICB0aGlzLmVtaXNzaXZlLnogPSBwYXJhbXMuZW1pc3NpdmUuejtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmKHBhcmFtcy5yb3VnaG5lc3MgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIHRoaXMucm91Z2huZXNzID0gcGFyYW1zLnJvdWdobmVzcztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmKHBhcmFtcy5tZXRhbG5lc3MgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIHRoaXMubWV0YWxuZXNzID0gcGFyYW1zLm1ldGFsbmVzcztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmKHBhcmFtcy5lbnZNYXBJbnRlbnNpdHkgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIHRoaXMuZW52TWFwSW50ZW5zaXR5ID0gcGFyYW1zLmVudk1hcEludGVuc2l0eTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgfVxuXG4gICAgcHJpdmF0ZSBjcmVhdGVQcm9ncmFtXyhkZWZpbmVzOiBzdHJpbmcsIHZlcnRleD86IHN0cmluZywgZnJhZ21lbnQ/OiBzdHJpbmcsIGhkcjpib29sZWFuID0gdHJ1ZSkge1xuICAgICAgICB2ZXJ0ZXggPSB2ZXJ0ZXggPz8gUEJSTWF0ZXJpYWwuZGVmYXVsdFZlcnRleFxuICAgICAgICBmcmFnbWVudCA9IHRoaXMubWFrZUZyYWdtZW50U2hhZGVyKGZyYWdtZW50ID8/IFBCUk1hdGVyaWFsLmRlZmF1bHRGcmFnbWVudCwgaGRyKTtcblxuICAgICAgICB2ZXJ0ZXggPSBkZWZpbmVzICsgdmVydGV4O1xuICAgICAgICBmcmFnbWVudCA9IGRlZmluZXMgKyBmcmFnbWVudDtcblxuICAgICAgICBsZXQgcHJvZ3JhbSA9IFByb2dyYW1DYWNoZS5nZXRJbnN0YW5jZSgpLmNyZWF0ZVByb2dyYW0odGhpcy5nbF8sIHZlcnRleCwgZnJhZ21lbnQsIHRoaXMudW5pZm9ybXNfKTtcbiAgICAgICAgLy8gY29uc3QgcHJvZ3JhbSA9IG5ldyBQcm9ncmFtKHRoaXMuZ2xfLCB7XG4gICAgICAgIC8vICAgICB2ZXJ0ZXgsXG4gICAgICAgIC8vICAgICBmcmFnbWVudCxcbiAgICAgICAgLy8gICAgIHVuaWZvcm1zOiB0aGlzLnVuaWZvcm1zXyxcbiAgICAgICAgLy8gICAgIC8vIHRyYW5zcGFyZW50OiBwYnJwYXJhbXMuYWxwaGFNb2RlID09PSAnQkxFTkQnLFxuICAgICAgICAvLyAgICAgY3VsbEZhY2U6IHBicnBhcmFtcy5zaWRlID8gbnVsbCA6IHRoaXMuZ2xfLkJBQ0ssXG4gICAgICAgIC8vIH0pO1xuXG4gICAgICAgIHJldHVybiBwcm9ncmFtO1xuICAgIH1cbn1cblxuZXhwb3J0IGludGVyZmFjZSBQQlJNYXRlcmlhbFBhcmFtcyB7XG4gICAgYmFzZUNvbG9yPzogVmVjNCxcbiAgICBiYXNlQ29sb3JGYWN0b3I/OiBWZWM0LFxuICAgIGJhc2VDb2xvclRleHR1cmU/OiBUZXh0dXJlLFxuICAgIHRSTT86IFRleHR1cmUsXG4gICAgcm91Z2huZXNzPzogbnVtYmVyLFxuICAgIG1ldGFsbmVzcz86IG51bWJlcixcbiAgICBub3JtYWxNYXA/OiBUZXh0dXJlLFxuICAgIG5vcm1hbFNjYWxlPzogbnVtYmVyLFxuICAgIGFvTWFwPzogYW55LFxuXG4gICAgZW1pc3NpdmVNYXA/OiBUZXh0dXJlLFxuICAgIGVtaXNzaXZlSW50ZW5zaXR5PzogYW55LFxuICAgIGVtaXNzaXZlPzogVmVjMyxcblxuICAgIHRFbnZEaWZmdXNlPzogVGV4dHVyZSxcbiAgICB0RW52U3BlY3VsYXI/OiBUZXh0dXJlLFxuICAgIHVFbnZEaWZmdXNlPzogbnVtYmVyLFxuICAgIHVFbnZTcGVjdWxhcj86IG51bWJlcixcbiAgICB1RW52SW50ZW5zaXR5PzogbnVtYmVyLFxuXG4gICAgYWxwaGE/OiBudW1iZXIsXG4gICAgYWxwaGFDdXRvZmY/OiBudW1iZXIsXG4gICAgc2lkZT86IG51bWJlcixcbiAgICB0cmFuc3BhcmVudD86IGJvb2xlYW4sXG4gICAgZW52TWFwSW50ZW5zaXR5PzogbnVtYmVyXG59XG4iLCIvKipcbiAqIHBvcnRlZCBmcm9tIGh0dHBzOi8vZ2l0aHViLmNvbS9tcmRvb2IvZXZlbnRkaXNwYXRjaGVyLmpzL1xuICovXG5cbmV4cG9ydCBjbGFzcyBFdmVudERpc3BhdGNoZXIge1xuICAgIHByaXZhdGUgX2xpc3RlbmVyczogYW55O1xuICAgIFxuXHRhZGRFdmVudExpc3RlbmVyICggdHlwZTogc3RyaW5nLCBsaXN0ZW5lciA6IGFueSApIHtcblxuXHRcdGlmICggdGhpcy5fbGlzdGVuZXJzID09PSB1bmRlZmluZWQgKSB0aGlzLl9saXN0ZW5lcnMgPSB7fTtcblxuXHRcdHZhciBsaXN0ZW5lcnMgPSB0aGlzLl9saXN0ZW5lcnM7XG5cblx0XHRpZiAoIGxpc3RlbmVyc1sgdHlwZSBdID09PSB1bmRlZmluZWQgKSB7XG5cblx0XHRcdGxpc3RlbmVyc1sgdHlwZSBdID0gW107XG5cblx0XHR9XG5cblx0XHRpZiAoIGxpc3RlbmVyc1sgdHlwZSBdLmluZGV4T2YoIGxpc3RlbmVyICkgPT09IC0gMSApIHtcblxuXHRcdFx0bGlzdGVuZXJzWyB0eXBlIF0ucHVzaCggbGlzdGVuZXIgKTtcblxuXHRcdH1cblxuXHR9XG5cblx0aGFzRXZlbnRMaXN0ZW5lciggdHlwZTogc3RyaW5nLCBsaXN0ZW5lciA6IGFueSkge1xuXG5cdFx0aWYgKCB0aGlzLl9saXN0ZW5lcnMgPT09IHVuZGVmaW5lZCApIHJldHVybiBmYWxzZTtcblxuXHRcdHZhciBsaXN0ZW5lcnMgPSB0aGlzLl9saXN0ZW5lcnM7XG5cblx0XHRyZXR1cm4gbGlzdGVuZXJzWyB0eXBlIF0gIT09IHVuZGVmaW5lZCAmJiBsaXN0ZW5lcnNbIHR5cGUgXS5pbmRleE9mKCBsaXN0ZW5lciApICE9PSAtIDE7XG5cblx0fVxuXG5cdHJlbW92ZUV2ZW50TGlzdGVuZXIoIHR5cGUgOiBzdHJpbmcsIGxpc3RlbmVyIDogYW55KSB7XG5cblx0XHRpZiAoIHRoaXMuX2xpc3RlbmVycyA9PT0gdW5kZWZpbmVkICkgcmV0dXJuO1xuXG5cdFx0dmFyIGxpc3RlbmVycyA9IHRoaXMuX2xpc3RlbmVycztcblx0XHR2YXIgbGlzdGVuZXJBcnJheSA9IGxpc3RlbmVyc1sgdHlwZSBdO1xuXG5cdFx0aWYgKCBsaXN0ZW5lckFycmF5ICE9PSB1bmRlZmluZWQgKSB7XG5cblx0XHRcdHZhciBpbmRleCA9IGxpc3RlbmVyQXJyYXkuaW5kZXhPZiggbGlzdGVuZXIgKTtcblxuXHRcdFx0aWYgKCBpbmRleCAhPT0gLSAxICkge1xuXG5cdFx0XHRcdGxpc3RlbmVyQXJyYXkuc3BsaWNlKCBpbmRleCwgMSApO1xuXG5cdFx0XHR9XG5cblx0XHR9XG5cblx0fVxuXG5cdGRpc3BhdGNoRXZlbnQoIGV2ZW50IDogYW55ICkge1xuXG5cdFx0aWYgKCB0aGlzLl9saXN0ZW5lcnMgPT09IHVuZGVmaW5lZCApIHJldHVybjtcblxuXHRcdHZhciBsaXN0ZW5lcnMgPSB0aGlzLl9saXN0ZW5lcnM7XG5cdFx0dmFyIGxpc3RlbmVyQXJyYXkgPSBsaXN0ZW5lcnNbIGV2ZW50LnR5cGUgXTtcblxuXHRcdGlmICggbGlzdGVuZXJBcnJheSAhPT0gdW5kZWZpbmVkICkge1xuXG5cdFx0XHRldmVudC50YXJnZXQgPSB0aGlzO1xuXG5cdFx0XHQvLyBNYWtlIGEgY29weSwgaW4gY2FzZSBsaXN0ZW5lcnMgYXJlIHJlbW92ZWQgd2hpbGUgaXRlcmF0aW5nLlxuXHRcdFx0dmFyIGFycmF5ID0gbGlzdGVuZXJBcnJheS5zbGljZSggMCApO1xuXG5cdFx0XHRmb3IgKCB2YXIgaSA9IDAsIGwgPSBhcnJheS5sZW5ndGg7IGkgPCBsOyBpICsrICkge1xuXG5cdFx0XHRcdGFycmF5WyBpIF0uY2FsbCggdGhpcywgZXZlbnQgKTtcblxuXHRcdFx0fVxuXG5cdFx0fVxuXG5cdH1cbn0iLCJpbXBvcnQge1BCUk1hdGVyaWFsLCBQQlJNYXRlcmlhbFBhcmFtc30gZnJvbSBcIi4uL21hdGVyaWFscy9wYnJtYXRlcmlhbFwiO1xuaW1wb3J0IHtNZXNoLCBPR0xSZW5kZXJpbmdDb250ZXh0LCBUcmFuc2Zvcm0sIFZlYzR9IGZyb20gXCIuLi9vZ2xcIjtcblxuXG5mdW5jdGlvbiBnZXRQQlJQYXJhbXMoZ2x0Zk1hdGVyaWFsOiBhbnkpIHtcbiAgICBsZXQgcGJycGFyYW1zOiBQQlJNYXRlcmlhbFBhcmFtcyA9IHtcbiAgICAgICAgYmFzZUNvbG9yOiBnbHRmTWF0ZXJpYWwuYmFzZUNvbG9yID8gbmV3IFZlYzQoKS5mcm9tQXJyYXkoZ2x0Zk1hdGVyaWFsLmJhc2VDb2xvcikgOiBuZXcgVmVjNCgxLCAxLCAxKSxcbiAgICAgICAgYmFzZUNvbG9yRmFjdG9yOiBnbHRmTWF0ZXJpYWwuYmFzZUNvbG9yRmFjdG9yID8gbmV3IFZlYzQoKS5mcm9tQXJyYXkoZ2x0Zk1hdGVyaWFsLmJhc2VDb2xvckZhY3RvcikgOiBuZXcgVmVjNCgxLCAxLCAxKSxcbiAgICAgICAgcm91Z2huZXNzOiBnbHRmTWF0ZXJpYWwucm91Z2huZXNzRmFjdG9yICE9PSB1bmRlZmluZWQgPyBnbHRmTWF0ZXJpYWwucm91Z2huZXNzRmFjdG9yIDogMC41LFxuICAgICAgICBtZXRhbG5lc3M6IGdsdGZNYXRlcmlhbC5tZXRhbGxpY0ZhY3RvciAhPT0gdW5kZWZpbmVkID8gZ2x0Zk1hdGVyaWFsLm1ldGFsbGljRmFjdG9yIDogMC41LFxuICAgICAgICBhbHBoYTogMSxcbiAgICAgICAgYWxwaGFDdXRvZmY6IGdsdGZNYXRlcmlhbC5hbHBoYUN1dG9mZixcbiAgICAgICAgc2lkZTogZ2x0Zk1hdGVyaWFsLmRvdWJsZVNpZGVkICE9PSB1bmRlZmluZWQgPyBnbHRmTWF0ZXJpYWwuZG91YmxlU2lkZWQgOiBmYWxzZSxcbiAgICAgICAgdHJhbnNwYXJlbnQ6IGdsdGZNYXRlcmlhbC5hbHBoYU1vZGUgIT09IHVuZGVmaW5lZCA/IGdsdGZNYXRlcmlhbC5hbHBoYU1vZGUgPT09ICdCTEVORCcgOiBmYWxzZVxuICAgIH1cbiAgICByZXR1cm4gcGJycGFyYW1zO1xufVxuXG5mdW5jdGlvbiB1cGRhdGVVbmlmb3Jtc18obWF0ZXJpYWw/OiBQQlJNYXRlcmlhbCkge1xuICAgIGlmKG1hdGVyaWFsICYmIG1hdGVyaWFsIGluc3RhbmNlb2YgUEJSTWF0ZXJpYWwpIHtcbiAgICAgICAgbGV0IHByb2dyYW0gPSBtYXRlcmlhbC5wcm9ncmFtO1xuICAgICAgICBwcm9ncmFtLnVuaWZvcm1zWyd1QmFzZUNvbG9yRmFjdG9yJ10udmFsdWUuY29weShtYXRlcmlhbC5jb2xvcik7XG4gICAgICAgIHByb2dyYW0udW5pZm9ybXNbJ3VSb3VnaG5lc3MnXS52YWx1ZSA9IG1hdGVyaWFsLnJvdWdobmVzcztcbiAgICAgICAgcHJvZ3JhbS51bmlmb3Jtc1sndU1ldGFsbGljJ10udmFsdWUgPSBtYXRlcmlhbC5tZXRhbG5lc3M7XG4gICAgICAgIHByb2dyYW0udW5pZm9ybXNbJ3VFbnZNYXBJbnRlbnNpdHknXS52YWx1ZSA9IG1hdGVyaWFsLmVudk1hcEludGVuc2l0eTtcbiAgICAgICAgcHJvZ3JhbS51bmlmb3Jtc1sndEVudkRpZmZ1c2UnXS52YWx1ZSA9IG1hdGVyaWFsLmVudk1hcERpZmZ1c2U7XG4gICAgICAgIHByb2dyYW0udW5pZm9ybXNbJ3RFbnZTcGVjdWxhciddLnZhbHVlID0gbWF0ZXJpYWwuZW52TWFwU3BlY3VsYXI7XG4gICAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gYXNzaWduUEJSTWF0ZXJpYWxzKGdsOiBPR0xSZW5kZXJpbmdDb250ZXh0LCByb290OiBUcmFuc2Zvcm0sIG1hdGVyaWFsQ3Rvcj86IChnbDogT0dMUmVuZGVyaW5nQ29udGV4dCwgcDogUEJSTWF0ZXJpYWxQYXJhbXMsIGRlZmluZXM6IHN0cmluZyk9PlBCUk1hdGVyaWFsLCBoZHIgPSB0cnVlKSB7XG4gICAgcm9vdC50cmF2ZXJzZSgobm9kZSkgPT4ge1xuICAgICAgICBpZiAobm9kZSBpbnN0YW5jZW9mIE1lc2ggJiYgbm9kZS5wcm9ncmFtICYmICEobm9kZSBhcyBhbnkpPy5tYXRlcmlhbD8uaXNEaWFtb25kTWF0ZXJpYWwgJiYgbm9kZS5wcm9ncmFtLmdsdGZNYXRlcmlhbCkgeyAvL3RvZG86IGlzRGlhbW9uZE1hdGVyaWFsIG9uIG5vZGU/P1xuICAgICAgICAgICAgbGV0IGRlZmluZXMgPSBgJHtub2RlLmdlb21ldHJ5LmF0dHJpYnV0ZXMudXYgPyBgI2RlZmluZSBVVlxcbmAgOiBgYH1gO1xuICAgICAgICAgICAgbGV0IG1hdGVyaWFsID0gbWF0ZXJpYWxDdG9yID9cbiAgICAgICAgICAgICAgICBtYXRlcmlhbEN0b3IoZ2wsIGdldFBCUlBhcmFtcyhub2RlLnByb2dyYW0uZ2x0Zk1hdGVyaWFsKSwgZGVmaW5lcykgOlxuICAgICAgICAgICAgICAgIG5ldyBQQlJNYXRlcmlhbChnbCwgZ2V0UEJSUGFyYW1zKG5vZGUucHJvZ3JhbS5nbHRmTWF0ZXJpYWwpLCBkZWZpbmVzLCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgaGRyKTtcbiAgICAgICAgICAgIG5vZGUubWF0ZXJpYWwgPSBtYXRlcmlhbDtcbiAgICAgICAgICAgIG5vZGUucHJvZ3JhbSA9IG1hdGVyaWFsLnByb2dyYW07XG5cbiAgICAgICAgICAgIG5vZGUub25CZWZvcmVSZW5kZXIoICh2YWx1ZTogYW55KSA9PiB7XG4gICAgICAgICAgICAgICAgdXBkYXRlVW5pZm9ybXNfKG5vZGUubWF0ZXJpYWwpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYoKG5vZGUgYXMgYW55KT8ubWF0ZXJpYWw/LmlzRGlhbW9uZE1hdGVyaWFsKXtcbiAgICAgICAgICAgIChub2RlIGFzIE1lc2gpLnByb2dyYW0udHJhbnNwYXJlbnQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgfSk7XG59XG4iLCJpbXBvcnQge1Byb2dyYW19IGZyb20gJy4uL29nbCdcblxuZXhwb3J0IGNsYXNzIFByb2dyYW1DYWNoZSB7XG5cbiAgICBwcml2YXRlIHByb2dyYW1NYXBfOiBNYXA8c3RyaW5nLCBQcm9ncmFtPiA9IG5ldyBNYXA8c3RyaW5nLCBQcm9ncmFtPigpO1xuICAgIHByaXZhdGUgc3RhdGljIGluc3RhbmNlXzogUHJvZ3JhbUNhY2hlO1xuXG4gICAgcHJpdmF0ZSBjb25zdHJ1Y3RvcigpIHtcbiAgICB9XG5cbiAgICBzdGF0aWMgZ2V0SW5zdGFuY2UoKSB7XG4gICAgICAgIGlmKCF0aGlzLmluc3RhbmNlXykge1xuICAgICAgICAgICAgdGhpcy5pbnN0YW5jZV8gPSBuZXcgUHJvZ3JhbUNhY2hlKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuaW5zdGFuY2VfO1xuICAgIH1cblxuICAgIGNyZWF0ZVByb2dyYW0oZ2w6IGFueSwgdmVydGV4OiBzdHJpbmcsIGZyYWdtZW50OiBzdHJpbmcsIHVuaWZvcm1zOiBhbnkpIHtcbiAgICAgICAgbGV0IGtleSA9IHZlcnRleCArIGZyYWdtZW50ICsgZ2wuY2FudmFzLmlkO1xuICAgICAgICBsZXQgY2FjaGVkUHJvZ3JhbSA9IHRoaXMucHJvZ3JhbU1hcF8uZ2V0KGtleSk7XG4gICAgICAgIGlmKGNhY2hlZFByb2dyYW0pIHtcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRQcm9ncmFtO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHByb2dyYW0gPSBuZXcgUHJvZ3JhbShnbCwge1xuICAgICAgICAgICAgdmVydGV4LFxuICAgICAgICAgICAgZnJhZ21lbnQsXG4gICAgICAgICAgICB1bmlmb3JtczogdW5pZm9ybXMsXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLnByb2dyYW1NYXBfLnNldChrZXksIHByb2dyYW0pO1xuICAgICAgICByZXR1cm4gcHJvZ3JhbTtcbiAgICB9XG59XG4iLCIvKipcbiAqIFVuaWZvcm0gVXRpbGl0aWVzLFxuICovXG5pbXBvcnQge1RVbmlmb3Jtc30gZnJvbSBcIi4uL21hdGVyaWFscy9wYnJtYXRlcmlhbFwiO1xuXG5leHBvcnQgZnVuY3Rpb24gY2xvbmVVbmlmb3Jtcyggc3JjOiBUVW5pZm9ybXMgKSB7XG4gICAgY29uc3QgZHN0OiBhbnkgPSB7fTtcbiAgICBmb3IgKGxldCB1IGluIHNyYyApIHtcbiAgICAgICAgZHN0WyB1IF0gPSB7fTtcbiAgICAgICAgZm9yIChsZXQgcCBpbiBzcmNbIHUgXSApIHtcbiAgICAgICAgICAgIGNvbnN0IHByb3BlcnR5ID0gKHNyYyBhcyBhbnkpW3VdW3BdO1xuICAgICAgICAgICAgaWYgKCBwcm9wZXJ0eSAmJiAodHlwZW9mIHByb3BlcnR5LmNsb25lID09PSAnZnVuY3Rpb24nICkgKSB7XG4gICAgICAgICAgICAgICAgZHN0WyB1IF1bIHAgXSA9IHByb3BlcnR5LmNsb25lKCk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKCBBcnJheS5pc0FycmF5KCBwcm9wZXJ0eSApICkge1xuICAgICAgICAgICAgICAgIGRzdFsgdSBdWyBwIF0gPSBwcm9wZXJ0eS5zbGljZSgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBkc3RbIHUgXVsgcCBdID0gcHJvcGVydHk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGRzdDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1lcmdlVW5pZm9ybXMoIHVuaWZvcm1zOiBUVW5pZm9ybXMgKSB7XG4gICAgY29uc3QgbWVyZ2VkOiBhbnkgPSB7fTtcbiAgICBmb3IgKGxldCB1ID0gMDsgdSA8IHVuaWZvcm1zLmxlbmd0aDsgdSArKyApIHtcbiAgICAgICAgY29uc3QgdG1wID0gY2xvbmVVbmlmb3Jtcyh1bmlmb3Jtc1t1XSk7XG4gICAgICAgIGZvciAobGV0IHAgaW4gdG1wICkge1xuICAgICAgICAgICAgbWVyZ2VkWyBwIF0gPSB0bXBbIHAgXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbWVyZ2VkO1xufSIsImltcG9ydCB7TWVzaCwgUmVuZGVyZXIsIFRyYW5zZm9ybSwgVmVjM30gZnJvbSBcIi4uL29nbFwiO1xuaW1wb3J0IGVuY29kaW5nQ2h1bmsgZnJvbSBcIi4uL3NoYWRlcnMvZW5jb2RpbmdfcGFyLmdsc2xcIlxuaW1wb3J0IHRvbmVNYXBwaW5nQ2h1bmsgZnJvbSBcIi4uL3NoYWRlcnMvdG9uZW1hcHBpbmdfcGFyLmdsc2xcIlxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0U25hcHNob3REYXRhKHJlbmRlcmVyOiBSZW5kZXJlciwgbWltZVR5cGU/OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIG1pbWVUeXBlID0gbWltZVR5cGUgPz8gXCJpbWFnZS9wbmdcIjtcbiAgICByZXR1cm4gcmVuZGVyZXIuZ2wuY2FudmFzLnRvRGF0YVVSTChtaW1lVHlwZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRTbmFwc2hvdChyZW5kZXJlcjogUmVuZGVyZXIsIG9wdGlvbnM6IHsgbWltZVR5cGU/OiBzdHJpbmcsIGNvbnRleHQ/OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsIGNhbnZhcz86IEhUTUxDYW52YXNFbGVtZW50IH0pOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIGxldCBpbWdVcmwgPSBnZXRTbmFwc2hvdERhdGEocmVuZGVyZXIsIG9wdGlvbnMubWltZVR5cGUpO1xuICAgIGxldCBjb250ZXh0ID0gb3B0aW9ucy5jb250ZXh0ID8/IG9wdGlvbnMuY2FudmFzPy5nZXRDb250ZXh0KFwiMmRcIik7XG4gICAgaWYgKCFjb250ZXh0KVxuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGltZ1VybCk7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlPHN0cmluZz4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICBsZXQgaW1nID0gbmV3IEltYWdlKCk7XG4gICAgICAgIGltZy5vbmxvYWQgPSAoKSA9PiB7XG4gICAgICAgICAgICBjb250ZXh0Py5kcmF3SW1hZ2UoaW1nLCAwLCAwLCBjb250ZXh0IS5jYW52YXMud2lkdGgsIGNvbnRleHQhLmNhbnZhcy5oZWlnaHQpO1xuICAgICAgICAgICAgcmVzb2x2ZShpbWdVcmwpO1xuICAgICAgICB9O1xuICAgICAgICBpbWcuc3JjID0gaW1nVXJsO1xuICAgIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0UG9pbnRlclBvc2l0aW9uKHBvc2l0aW9uOiB7eDogbnVtYmVyLCB5OiBudW1iZXJ9LCBjYW52YXM6IEhUTUxDYW52YXNFbGVtZW50KSB7XG4gICAgY29uc3QgY2FudmFzQm91bmRzID0gY2FudmFzLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgIGxldCB4ID0gKChwb3NpdGlvbi54IC0gY2FudmFzQm91bmRzLmxlZnQpIC8gKGNhbnZhc0JvdW5kcy5yaWdodCAtIGNhbnZhc0JvdW5kcy5sZWZ0KSkgKiAyIC0gMTtcbiAgICBsZXQgeSA9IC0oKHBvc2l0aW9uLnkgLSBjYW52YXNCb3VuZHMudG9wKSAvIChjYW52YXNCb3VuZHMuYm90dG9tIC0gY2FudmFzQm91bmRzLnRvcCkpICogMiArIDE7XG4gICAgcmV0dXJueyB4OiB4LCB5OiB5fTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEFsbE1lc2hlcyhyb290OiBUcmFuc2Zvcm0pIHtcbiAgICBsZXQgbWVzaGVzIDogYW55ID0gW107XG4gICAgcm9vdC50cmF2ZXJzZSgoZ3JvdXApID0+IHtcbiAgICAgICAgaWYoKGdyb3VwIGFzIE1lc2gpPy5nZW9tZXRyeSkge1xuICAgICAgICAgICAgaWYgKCFncm91cC5wYXJlbnQpIHJldHVybjsgLy8gU2tpcCB1bmF0dGFjaGVkXG4gICAgICAgICAgICBtZXNoZXMucHVzaChncm91cCk7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gbWVzaGVzO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY29tcHV0ZUJvdW5kaW5nQm94KHJvb3Q6IFRyYW5zZm9ybSkge1xuICAgIGNvbnN0IG1pbiA9IG5ldyBWZWMzKCtJbmZpbml0eSk7XG4gICAgY29uc3QgbWF4ID0gbmV3IFZlYzMoLUluZmluaXR5KTtcbiAgICBcbiAgICBjb25zdCBib3VuZHNNaW4gPSBuZXcgVmVjMygpO1xuICAgIGNvbnN0IGJvdW5kc01heCA9IG5ldyBWZWMzKCk7XG4gICAgY29uc3QgYm91bmRzQ2VudGVyID0gbmV3IFZlYzMoKTtcbiAgICBjb25zdCBib3VuZHNTY2FsZSA9IG5ldyBWZWMzKCk7XG4gICAgXG4gICAgcm9vdC50cmF2ZXJzZSgoZ3JvdXApID0+IHtcbiAgICAgICAgbGV0IGdlb21ldHJ5ID0gKGdyb3VwIGFzIE1lc2gpPy5nZW9tZXRyeTtcbiAgICAgICAgaWYoZ2VvbWV0cnkpIHtcbiAgICAgICAgICAgIGlmICghZ3JvdXAucGFyZW50KSByZXR1cm47IC8vIFNraXAgdW5hdHRhY2hlZFxuXG4gICAgICAgICAgICBpZiAoIWdlb21ldHJ5LmJvdW5kcykgZ2VvbWV0cnkuY29tcHV0ZUJvdW5kaW5nU3BoZXJlKCk7XG5cbiAgICAgICAgICAgIGJvdW5kc0NlbnRlci5jb3B5KGdlb21ldHJ5LmJvdW5kcy5jZW50ZXIpLmFwcGx5TWF0cml4NChncm91cC53b3JsZE1hdHJpeCk7XG5cbiAgICAgICAgICAgIC8vIEdldCBtYXggd29ybGQgc2NhbGUgYXhpc1xuICAgICAgICAgICAgZ3JvdXAud29ybGRNYXRyaXguZ2V0U2NhbGluZyhib3VuZHNTY2FsZSk7XG4gICAgICAgICAgICBjb25zdCByYWRpdXNTY2FsZSA9IE1hdGgubWF4KE1hdGgubWF4KGJvdW5kc1NjYWxlWzBdLCBib3VuZHNTY2FsZVsxXSksIGJvdW5kc1NjYWxlWzJdKTtcbiAgICAgICAgICAgIGNvbnN0IHJhZGl1cyA9IGdlb21ldHJ5LmJvdW5kcy5yYWRpdXMgKiByYWRpdXNTY2FsZTtcblxuICAgICAgICAgICAgYm91bmRzTWluLnNldCgtcmFkaXVzKS5hZGQoYm91bmRzQ2VudGVyKTtcbiAgICAgICAgICAgIGJvdW5kc01heC5zZXQoK3JhZGl1cykuYWRkKGJvdW5kc0NlbnRlcik7XG5cbiAgICAgICAgICAgIC8vIEFwcGx5IHdvcmxkIG1hdHJpeCB0byBib3VuZHNcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgMzsgaSsrKSB7XG4gICAgICAgICAgICAgICAgbWluW2ldID0gTWF0aC5taW4obWluW2ldLCBib3VuZHNNaW5baV0pO1xuICAgICAgICAgICAgICAgIG1heFtpXSA9IE1hdGgubWF4KG1heFtpXSwgYm91bmRzTWF4W2ldKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIHttaW46IG1pbiwgbWF4OiBtYXh9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdHJhdmVyc2Uocm9vdDogVHJhbnNmb3JtLCBjYWxsQmFjazogYW55LCBmaWx0ZXI/OiBhbnkpIHtcbiAgICByb290LnRyYXZlcnNlKChncm91cDogVHJhbnNmb3JtKSA9PiB7XG4gICAgICAgIGlmKGZpbHRlcikge1xuICAgICAgICAgICAgaWYoZmlsdGVyKGdyb3VwKSkge1xuICAgICAgICAgICAgICAgIGNhbGxCYWNrKGdyb3VwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNhbGxCYWNrKGdyb3VwKTtcbiAgICAgICAgfVxuICAgIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdHJhdmVyc2VNZXNoZXMocm9vdDogVHJhbnNmb3JtLCBjYWxsQmFjazogYW55KSB7XG4gICAgdHJhdmVyc2Uocm9vdCwgY2FsbEJhY2ssIChncm91cDogVHJhbnNmb3JtKT0+IHtyZXR1cm4gKGdyb3VwIGFzIE1lc2gpLmdlb21ldHJ5ICE9IG51bGx9KTtcbn1cblxuZXhwb3J0IGNvbnN0IEVuY29kaW5nSGVscGVyID0ge1xuICAgIExpbmVhcjogMCxcbiAgICBzUkdCOiAxLFxuICAgIFJHQkU6IDIsXG4gICAgUkdCTTc6IDMsXG4gICAgUkdCTTE2OiA0LFxuICAgIFJHQkQ6IDUsXG4gICAgR2FtbWE6IDYsXG4gICAgc2hhZGVyQ2h1bms6IGVuY29kaW5nQ2h1bmtcbn07XG5leHBvcnQgY29uc3QgVG9uZU1hcHBpbmdIZWxwZXIgPSB7XG4gICAgTGluZWFyOiAwLFxuICAgIFJlaW5oYXJkOiAxLFxuICAgIENpbmVvbjogMixcbiAgICBBQ0VTRmlsbWljOiAzLFxuICAgIHVuaWZvcm1zOiB7XG4gICAgICAgIHRvbmVNYXBwaW5nRXhwb3N1cmU6IHt2YWx1ZTogMS59XG4gICAgfSxcbiAgICBzaGFkZXJDaHVuazogdG9uZU1hcHBpbmdDaHVua1xufVxuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0aWYoX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSkge1xuXHRcdHJldHVybiBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiLy8gc3RhcnR1cFxuLy8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4vLyBUaGlzIGVudHJ5IG1vZHVsZSBpcyByZWZlcmVuY2VkIGJ5IG90aGVyIG1vZHVsZXMgc28gaXQgY2FuJ3QgYmUgaW5saW5lZFxudmFyIF9fd2VicGFja19leHBvcnRzX18gPSBfX3dlYnBhY2tfcmVxdWlyZV9fKFwiLi9zcmMvaW5kZXgudHNcIik7XG4iXSwic291cmNlUm9vdCI6IiJ9