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
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ("uniform mat4 viewMatrix;\nuniform mat3 normalMatrix;\nuniform vec3 cameraPosition;\nuniform vec4 uBaseColorFactor;\nuniform sampler2D tBaseColor;\nuniform sampler2D tRM;\nuniform float uRoughness;\nuniform float uMetallic;\nuniform sampler2D tNormal;\nuniform float uNormalScale;\nuniform sampler2D tEmissive;\nuniform vec3 uEmissive;\nuniform sampler2D tOcclusion;\nuniform sampler2D tLUT;\nuniform sampler2D tEnvDiffuse;\nuniform sampler2D tEnvSpecular;\nuniform float uEnvDiffuse;\nuniform float uEnvSpecular;\nuniform float uEnvMapIntensity;\nuniform float uAlpha;\nuniform float uAlphaCutoff;\nuniform bool uTransparent;\nvarying vec2 vUv;\nvarying vec3 vNormal;\nvarying vec3 vMPos;\nvarying vec4 vMVPos;\n\nconst float PI = 3.14159265359;\nconst float RECIPROCAL_PI = 0.31830988618;\nconst float RECIPROCAL_PI2 = 0.15915494;\nconst float LN2 = 0.6931472;\nconst float ENV_LODS = 6.0;\nvec4 SRGBtoLinear(vec4 srgb) {\n  vec3 linOut = pow(srgb.xyz, vec3(2.2));\n  return vec4(linOut, srgb.w);;\n}\nvec4 RGBMToLinear(in vec4 value) {\n  float maxRange = 6.0;\n  return vec4(value.xyz * value.w * maxRange, 1.0);\n}\nvec3 linearToSRGB(vec3 color) {\n  return pow(color, vec3(1.0 / 2.2));\n}\nvec3 getNormal() {\n  #ifdef NORMAL_MAP\n    vec3 pos_dx = dFdx(vMPos.xyz);\n    vec3 pos_dy = dFdy(vMPos.xyz);\n    vec2 tex_dx = dFdx(vUv);\n    vec2 tex_dy = dFdy(vUv);\n    // Tangent, Bitangent\n    vec3 t = normalize(pos_dx * tex_dy.t - pos_dy * tex_dx.t);\n    vec3 b = normalize(-pos_dx * tex_dy.s + pos_dy * tex_dx.s);\n    mat3 tbn = mat3(t, b, normalize(vNormal));\n    vec3 n = texture2D(tNormal, vUv).rgb * 2.0 - 1.0;\n    n.xy *= uNormalScale;\n    vec3 normal = normalize(tbn * n);\n    // Get world normal from view normal (normalMatrix * normal)\n    // return normalize((vec4(normal, 0.0) * viewMatrix).xyz);\n    return normalize(normal);\n  #else\n    return normalize(vNormal);\n  #endif\n}\n\nvec2 cartesianToPolar(vec3 n) {\n  vec2 uv;\n  uv.x = atan(n.z, n.x) * RECIPROCAL_PI2 + 0.5;\n  uv.y = asin(n.y) * RECIPROCAL_PI + 0.5;\n  return uv;\n}\n\nvoid getIBLContribution(inout vec3 diffuse, inout vec3 specular, float NdV, float roughness, vec3 n, vec3 reflection, vec3 diffuseColor, vec3 specularColor) {\n  vec3 brdf = SRGBtoLinear(texture2D(tLUT, vec2(NdV, roughness))).rgb;\n  vec3 diffuseLight = RGBMToLinear(texture2D(tEnvDiffuse, cartesianToPolar(n))).rgb;\n  diffuseLight = mix(vec3(1), diffuseLight, uEnvDiffuse);\n  // Sample 2 levels and mix between to get smoother degradation\n  float blend = roughness * ENV_LODS;\n  float level0 = floor(blend);\n  float level1 = min(ENV_LODS, level0 + 1.0);\n  blend -= level0;\n\n  // Sample the specular env map atlas depending on the roughness value\n  vec2 uvSpec = cartesianToPolar(reflection);\n  uvSpec.y /= 2.0;\n  vec2 uv0 = uvSpec;\n  vec2 uv1 = uvSpec;\n  uv0 /= pow(2.0, level0);\n  uv0.y += 1.0 - exp(-LN2 * level0);\n  uv1 /= pow(2.0, level1);\n  uv1.y += 1.0 - exp(-LN2 * level1);\n  vec3 specular0 = RGBMToLinear(texture2D(tEnvSpecular, uv0)).rgb;\n  vec3 specular1 = RGBMToLinear(texture2D(tEnvSpecular, uv1)).rgb;\n  vec3 specularLight = mix(specular0, specular1, blend);\n  diffuse = diffuseLight * diffuseColor;\n\n  // Bit of extra reflection for smooth materials\n  float reflectivity = pow((1.0 - roughness), 2.0) * 0.05;\n  specular = specularLight * (specularColor * brdf.x + brdf.y + reflectivity);\n  specular *= uEnvSpecular;\n}\n\nvoid main() {\n  vec4 baseColor = SRGBtoLinear(uBaseColorFactor);\n  #ifdef COLOR_MAP\n    baseColor *= SRGBtoLinear(texture2D(tBaseColor, vUv));\n  #endif\n  // Get base alpha\n  float alpha = baseColor.a;\n  #ifdef ALPHA_MASK\n    if (alpha < uAlphaCutoff) discard;\n  #endif\n  // RM map packed as gb = [nothing, roughness, metallic, nothing]\n  vec4 rmSample = vec4(1);\n  #ifdef RM_MAP\n    rmSample *= texture2D(tRM, vUv);\n  #endif\n  float roughness = clamp(rmSample.g * uRoughness, 0.04, 1.0);\n  float metallic = clamp(rmSample.b * uMetallic, 0.04, 1.0);\n  vec3 f0 = vec3(0.04);\n  vec3 diffuseColor = baseColor.rgb * (vec3(1.0) - f0) * (1.0 - metallic);\n  vec3 specularColor = mix(f0, baseColor.rgb, metallic);\n  vec3 specularEnvR0 = specularColor;\n  vec3 specularEnvR90 = vec3(clamp(max(max(specularColor.r, specularColor.g), specularColor.b) * 25.0, 0.0, 1.0));\n  vec3 N = getNormal();\n  vec3 V = normalize( - vMVPos.xyz);\n  vec3 reflection = normalize(reflect(-V, N));\n  float NdV = clamp(abs(dot(N, V)), 0.001, 1.0);\n  // Shading based off IBL lighting\n  vec3 color = vec3(0.);\n  vec3 diffuseIBL;\n  vec3 specularIBL;\n  getIBLContribution(diffuseIBL, specularIBL, NdV, roughness, N, reflection, diffuseColor, specularColor);\n  // Add IBL on top of color\n  color += (diffuseIBL + specularIBL) * uEnvMapIntensity;\n  // Add IBL spec to alpha for reflections on transparent surfaces (glass)\n  alpha = max(alpha, max(max(specularIBL.r, specularIBL.g), specularIBL.b));\n  #ifdef OCC_MAP\n    // TODO: figure out how to apply occlusion\n    // color *= SRGBtoLinear(texture2D(tOcclusion, vUv)).rgb;\n  #endif\n  color += uEmissive;\n  #ifdef EMISSIVE_MAP\n    vec3 emissive = SRGBtoLinear(texture2D(tEmissive, vUv)).rgb;\n    color = emissive;\n  #endif\n  // Apply uAlpha uniform at the end to overwrite any specular additions on transparent surfaces\n//  gl_FragColor.rgb = linearToSRGB(color);\n  if(uTransparent){\n    gl_FragColor = (vec4(color, alpha * uAlpha));\n  }else {\n//    gl_FragColor = linearToOutputTexel(vec4(color * alpha * uAlpha, 1.));\n    gl_FragColor = linearToOutputTexel(vec4(color * uAlpha, 1.));\n  }\n}\n");

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
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ("precision highp float;\nprecision highp int;\nattribute vec3 position;\n\n#ifdef UV\n    attribute vec2 uv;\n#else\n    const vec2 uv = vec2(0);\n#endif\nattribute vec3 normal;\n\nuniform mat4 modelViewMatrix;\nuniform mat4 projectionMatrix;\nuniform mat4 modelMatrix;\nuniform mat3 normalMatrix;\n\nvarying vec2 vUv;\nvarying vec3 vNormal;\nvarying vec3 vMPos;\nvarying vec4 vMVPos;\n\nvoid main() {\n    vec4 pos = vec4(position, 1);\n    vec3 nml = normalMatrix * normal;\n    vUv = uv;\n    vNormal = normalize(nml);\n    vec4 mPos = modelMatrix * pos;\n    vMPos = mPos.xyz / mPos.w;\n    vMVPos = modelViewMatrix * pos;\n    gl_Position = projectionMatrix * vMVPos;\n}\n");

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

            if (uniform && (uniform.value === undefined || uniform.value === null)) {
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
    this.autoRotate = autoRotate;
    this.autoRotateSpeed = autoRotateSpeed;
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
        if (this.autoRotate) {
            handleAutoRotate(this.autoRotateSpeed);
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

    function handleAutoRotate(speed) {
        const angle = ((2 * Math.PI) / 60 / 60) * speed;
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
                tOpaque: { value: { texture: undefined } },
                tTransparent: { value: { texture: undefined } }
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
                tOpaque: { value: { texture: undefined } },
                tTransparent: { value: { texture: undefined } }
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
            #define tonemappingMode ${hdr ? util_1.ToneMappingHelper.Linear : util_1.ToneMappingHelper.Linear}
            ${util_1.EncodingHelper.shaderChunk}
            ${util_1.ToneMappingHelper.shaderChunk}
            uniform sampler2D tMap;
            varying vec2 vUv;
            void main() {
                vec4 color = inputTexelToLinear(texture2D(tMap, vUv));
                color.rgb = toneMapColor(color.rgb*1.);
                gl_FragColor = linearToOutputTexel(color);
                // gl_FragColor.a = color.a;
            }
        `, uniforms: Object.assign({ tMap: { value: { texture: undefined } } }, util_1.ToneMappingHelper.uniforms //todo: uniform utils clone.
            ),
            depthTest: false,
            depthWrite: false });
    }
    renderWithFBO(renderer, fbo) {
        var _a;
        this.toneMapProgram.uniforms['tMap'].value = (_a = fbo.read) === null || _a === void 0 ? void 0 : _a.texture;
        RenderUtils_1.Utils.getInstance(renderer.gl).renderPass(renderer, this.toneMapProgram, this.renderToScreen ? undefined : fbo.write, true);
        this.needsSwap = !this.renderToScreen;
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
        var _a, _b;
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
        // if((node as any)?.material?.isDiamondMaterial){
        //     (node as Mesh).program.transparent = true;
        // }
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
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9vZ2wvd2VicGFjay91bml2ZXJzYWxNb2R1bGVEZWZpbml0aW9uIiwid2VicGFjazovL29nbC8uL3NyYy9tYXRlcmlhbHMvc2hhZGVycy9wYnIuZnJhZyIsIndlYnBhY2s6Ly9vZ2wvLi9zcmMvbWF0ZXJpYWxzL3NoYWRlcnMvcGJyLnZlcnQiLCJ3ZWJwYWNrOi8vb2dsLy4vc3JjL3NoYWRlcnMvZW5jb2RpbmdfcGFyLmdsc2wiLCJ3ZWJwYWNrOi8vb2dsLy4vc3JjL3NoYWRlcnMvdG9uZW1hcHBpbmdfcGFyLmdsc2wiLCJ3ZWJwYWNrOi8vb2dsLy4vc3JjL2NvcmUvQ2FtZXJhLmpzIiwid2VicGFjazovL29nbC8uL3NyYy9jb3JlL0dlb21ldHJ5LmpzIiwid2VicGFjazovL29nbC8uL3NyYy9jb3JlL01lc2guanMiLCJ3ZWJwYWNrOi8vb2dsLy4vc3JjL2NvcmUvUHJvZ3JhbS5qcyIsIndlYnBhY2s6Ly9vZ2wvLi9zcmMvY29yZS9SZW5kZXJUYXJnZXQuanMiLCJ3ZWJwYWNrOi8vb2dsLy4vc3JjL2NvcmUvUmVuZGVyZXIuanMiLCJ3ZWJwYWNrOi8vb2dsLy4vc3JjL2NvcmUvVGV4dHVyZS5qcyIsIndlYnBhY2s6Ly9vZ2wvLi9zcmMvY29yZS9UcmFuc2Zvcm0uanMiLCJ3ZWJwYWNrOi8vb2dsLy4vc3JjL2V4dHJhcy9BbmltYXRpb24uanMiLCJ3ZWJwYWNrOi8vb2dsLy4vc3JjL2V4dHJhcy9Cb3guanMiLCJ3ZWJwYWNrOi8vb2dsLy4vc3JjL2V4dHJhcy9DdXJ2ZS5qcyIsIndlYnBhY2s6Ly9vZ2wvLi9zcmMvZXh0cmFzL0N5bGluZGVyLmpzIiwid2VicGFjazovL29nbC8uL3NyYy9leHRyYXMvRmxvd21hcC5qcyIsIndlYnBhY2s6Ly9vZ2wvLi9zcmMvZXh0cmFzL0dMVEZBbmltYXRpb24uanMiLCJ3ZWJwYWNrOi8vb2dsLy4vc3JjL2V4dHJhcy9HTFRGTG9hZGVyLmpzIiwid2VicGFjazovL29nbC8uL3NyYy9leHRyYXMvR0xURlNraW4uanMiLCJ3ZWJwYWNrOi8vb2dsLy4vc3JjL2V4dHJhcy9HUEdQVS5qcyIsIndlYnBhY2s6Ly9vZ2wvLi9zcmMvZXh0cmFzL0tUWFRleHR1cmUuanMiLCJ3ZWJwYWNrOi8vb2dsLy4vc3JjL2V4dHJhcy9Ob3JtYWxQcm9ncmFtLmpzIiwid2VicGFjazovL29nbC8uL3NyYy9leHRyYXMvT3JiaXQuanMiLCJ3ZWJwYWNrOi8vb2dsLy4vc3JjL2V4dHJhcy9QbGFuZS5qcyIsIndlYnBhY2s6Ly9vZ2wvLi9zcmMvZXh0cmFzL1BvbHlsaW5lLmpzIiwid2VicGFjazovL29nbC8uL3NyYy9leHRyYXMvUG9zdC5qcyIsIndlYnBhY2s6Ly9vZ2wvLi9zcmMvZXh0cmFzL1JheWNhc3QuanMiLCJ3ZWJwYWNrOi8vb2dsLy4vc3JjL2V4dHJhcy9TaGFkb3cuanMiLCJ3ZWJwYWNrOi8vb2dsLy4vc3JjL2V4dHJhcy9Ta2luLmpzIiwid2VicGFjazovL29nbC8uL3NyYy9leHRyYXMvU3BoZXJlLmpzIiwid2VicGFjazovL29nbC8uL3NyYy9leHRyYXMvVGV4dC5qcyIsIndlYnBhY2s6Ly9vZ2wvLi9zcmMvZXh0cmFzL1RleHR1cmVMb2FkZXIuanMiLCJ3ZWJwYWNrOi8vb2dsLy4vc3JjL2V4dHJhcy9Ub3J1cy5qcyIsIndlYnBhY2s6Ly9vZ2wvLi9zcmMvZXh0cmFzL1RyaWFuZ2xlLmpzIiwid2VicGFjazovL29nbC8uL3NyYy9tYXRoL0NvbG9yLmpzIiwid2VicGFjazovL29nbC8uL3NyYy9tYXRoL0V1bGVyLmpzIiwid2VicGFjazovL29nbC8uL3NyYy9tYXRoL01hdDMuanMiLCJ3ZWJwYWNrOi8vb2dsLy4vc3JjL21hdGgvTWF0NC5qcyIsIndlYnBhY2s6Ly9vZ2wvLi9zcmMvbWF0aC9RdWF0LmpzIiwid2VicGFjazovL29nbC8uL3NyYy9tYXRoL1ZlYzIuanMiLCJ3ZWJwYWNrOi8vb2dsLy4vc3JjL21hdGgvVmVjMy5qcyIsIndlYnBhY2s6Ly9vZ2wvLi9zcmMvbWF0aC9WZWM0LmpzIiwid2VicGFjazovL29nbC8uL3NyYy9tYXRoL2Z1bmN0aW9ucy9Db2xvckZ1bmMuanMiLCJ3ZWJwYWNrOi8vb2dsLy4vc3JjL21hdGgvZnVuY3Rpb25zL0V1bGVyRnVuYy5qcyIsIndlYnBhY2s6Ly9vZ2wvLi9zcmMvbWF0aC9mdW5jdGlvbnMvTWF0M0Z1bmMuanMiLCJ3ZWJwYWNrOi8vb2dsLy4vc3JjL21hdGgvZnVuY3Rpb25zL01hdDRGdW5jLmpzIiwid2VicGFjazovL29nbC8uL3NyYy9tYXRoL2Z1bmN0aW9ucy9RdWF0RnVuYy5qcyIsIndlYnBhY2s6Ly9vZ2wvLi9zcmMvbWF0aC9mdW5jdGlvbnMvVmVjMkZ1bmMuanMiLCJ3ZWJwYWNrOi8vb2dsLy4vc3JjL21hdGgvZnVuY3Rpb25zL1ZlYzNGdW5jLmpzIiwid2VicGFjazovL29nbC8uL3NyYy9tYXRoL2Z1bmN0aW9ucy9WZWM0RnVuYy5qcyIsIndlYnBhY2s6Ly9vZ2wvLi9zcmMvb2dsLmpzIiwid2VicGFjazovL29nbC8uL3NyYy9leHRyYXMvQ3VzdG9tUG9zdC50cyIsIndlYnBhY2s6Ly9vZ2wvLi9zcmMvZXh0cmFzL1JlbmRlclV0aWxzLnRzIiwid2VicGFjazovL29nbC8uL3NyYy9oZHIvSERSQ29tcG9zZXIudHMiLCJ3ZWJwYWNrOi8vb2dsLy4vc3JjL2luZGV4LnRzIiwid2VicGFjazovL29nbC8uL3NyYy9tYXRlcmlhbHMvcGJybWF0ZXJpYWwudHMiLCJ3ZWJwYWNrOi8vb2dsLy4vc3JjL3V0aWxzL2V2ZW50ZGlzcGF0Y2hlci50cyIsIndlYnBhY2s6Ly9vZ2wvLi9zcmMvdXRpbHMvcGJyaGVscGVyLnRzIiwid2VicGFjazovL29nbC8uL3NyYy91dGlscy9wcm9ncmFtY2FjaGUudHMiLCJ3ZWJwYWNrOi8vb2dsLy4vc3JjL3V0aWxzL3VuaWZvcm1VdGlscy50cyIsIndlYnBhY2s6Ly9vZ2wvLi9zcmMvdXRpbHMvdXRpbC50cyIsIndlYnBhY2s6Ly9vZ2wvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vb2dsL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly9vZ2wvd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly9vZ2wvd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly9vZ2wvd2VicGFjay9zdGFydHVwIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUM7QUFDRCxPOzs7Ozs7Ozs7Ozs7OztBQ1ZBLGlFQUFlLHlCQUF5Qiw0QkFBNEIsOEJBQThCLGdDQUFnQywrQkFBK0Isd0JBQXdCLDJCQUEyQiwwQkFBMEIsNEJBQTRCLDZCQUE2Qiw4QkFBOEIseUJBQXlCLCtCQUErQix5QkFBeUIsZ0NBQWdDLGlDQUFpQyw0QkFBNEIsNkJBQTZCLGlDQUFpQyx1QkFBdUIsNkJBQTZCLDRCQUE0QixtQkFBbUIsdUJBQXVCLHFCQUFxQixzQkFBc0IsbUNBQW1DLDRDQUE0QywwQ0FBMEMsOEJBQThCLDZCQUE2QixnQ0FBZ0MsMkNBQTJDLGlDQUFpQyxHQUFHLG9DQUFvQyx5QkFBeUIscURBQXFELEdBQUcsaUNBQWlDLHVDQUF1QyxHQUFHLG9CQUFvQix5REFBeUQsb0NBQW9DLDhCQUE4Qiw4QkFBOEIsMkZBQTJGLGlFQUFpRSxnREFBZ0QsdURBQXVELDJCQUEyQix1Q0FBdUMsa0lBQWtJLCtCQUErQix5Q0FBeUMsYUFBYSxtQ0FBbUMsWUFBWSxpREFBaUQsMkNBQTJDLGNBQWMsR0FBRyxrS0FBa0ssd0VBQXdFLHNGQUFzRiwyREFBMkQseUdBQXlHLGdDQUFnQywrQ0FBK0Msb0JBQW9CLDBIQUEwSCxvQkFBb0Isc0JBQXNCLHNCQUFzQiw0QkFBNEIsc0NBQXNDLDRCQUE0QixzQ0FBc0Msb0VBQW9FLG9FQUFvRSwwREFBMEQsMENBQTBDLGlIQUFpSCxnRkFBZ0YsNkJBQTZCLEdBQUcsaUJBQWlCLG9EQUFvRCxnRkFBZ0YsNkRBQTZELDZEQUE2RCww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O0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBLDRCQUE0QiwrQ0FBSTtBQUNoQyx5QkFBeUIsK0NBQUk7QUFDN0IsMkJBQTJCLCtDQUFJOztBQUUvQjtBQUNBLHlCQUF5Qjs7QUFFekI7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtB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Q0EsV0FBVyxLQUFLO0FBQ2hCLFdBQVcsS0FBSztBQUNoQjtBQUNBLGFBQWEsS0FBSztBQUNsQjtBQUNPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLEtBQUs7QUFDaEIsV0FBVyxPQUFPO0FBQ2xCLFdBQVcsT0FBTztBQUNsQixhQUFhLEtBQUs7QUFDbEI7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsV0FBVyxLQUFLO0FBQ2hCLFdBQVcsS0FBSztBQUNoQixXQUFXLEtBQUs7QUFDaEIsYUFBYSxLQUFLO0FBQ2xCO0FBQ087QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsS0FBSztBQUNoQixXQUFXLEtBQUs7QUFDaEIsV0FBVyxLQUFLO0FBQ2hCLGFBQWEsS0FBSztBQUNsQjtBQUNPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLEtBQUs7QUFDaEIsV0FBVyxLQUFLO0FBQ2hCLFdBQVcsT0FBTztBQUNsQixhQUFhLEtBQUs7QUFDbEI7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7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QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLEtBQUs7QUFDaEIsV0FBVyxLQUFLO0FBQ2hCLFdBQVcsT0FBTztBQUNsQixhQUFhLEtBQUs7QUFDbEI7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ3I4QnNDOztBQUV0QztBQUNBO0FBQ0E7QUFDQSxXQUFXLEtBQUs7QUFDaEIsYUFBYSxLQUFLO0FBQ2xCO0FBQ087QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLEtBQUs7QUFDaEIsV0FBVyxLQUFLO0FBQ2hCLFdBQVcsT0FBTztBQUNsQixhQUFhLEtBQUs7QUFDbEI7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsV0FBVyxLQUFLO0FBQ2hCLFdBQVcsS0FBSztBQUNoQixXQUFXLEtBQUs7QUFDaEIsYUFBYSxLQUFLO0FBQ2xCO0FBQ087QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLEtBQUs7QUFDaEIsV0FBVyxLQUFLO0FBQ2hCLFdBQVcsT0FBTztBQUNsQixhQUFhLEtBQUs7QUFDbEI7QUFDTztBQUNQOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsV0FBVyxLQUFLO0FBQ2hCLFdBQVcsS0FBSztBQUNoQixXQUFXLE9BQU87QUFDbEIsYUFBYSxLQUFLO0FBQ2xCO0FBQ087QUFDUDs7QUFFQTtB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O0FBQ0E7QUFDQTtBQUNBLFdBQVcsS0FBSztBQUNoQixXQUFXLEtBQUs7QUFDaEIsYUFBYSxRQUFRO0FBQ3JCO0FBQ087QUFDUDtBQUNBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDOVlBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsS0FBSztBQUNoQixXQUFXLEtBQUs7QUFDaEIsYUFBYSxLQUFLO0FBQ2xCO0FBQ087QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsV0FBVyxLQUFLO0FBQ2hCLFdBQVcsT0FBTztBQUNsQixXQUFXLE9BQU87QUFDbEIsV0FBVyxPQUFPO0FBQ2xCLFdBQVcsT0FBTztBQUNsQixhQUFhLEtBQUs7QUFDbEI7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLEtBQUs7QUFDaEIsV0FBVyxLQUFLO0FBQ2hCLFdBQVcsS0FBSztBQUNoQixhQUFhLEtBQUs7QUFDbEI7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLEtBQUs7QUFDaEIsV0FBVyxLQUFLO0FBQ2hCLFdBQVcsT0FBTztBQUNsQixhQUFhLEtBQUs7QUFDbEI7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLEtBQUs7QUFDaEIsYUFBYSxPQUFPO0FBQ3BCO0FBQ087QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsV0FBVyxLQUFLO0FBQ2hCLFdBQVcsS0FBSztBQUNoQixhQUFhLEtBQUs7QUFDbEI7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsV0FBVyxLQUFLO0FBQ2hCLFdBQVcsS0FBSztBQUNoQixhQUFhLE9BQU87QUFD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V0FDeEU7V0FDQSwrQ0FBK0MsY0FBYztXQUM3RCxFOzs7OztVQ05BO1VBQ0E7VUFDQTtVQUNBIiwiZmlsZSI6ImluZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIHdlYnBhY2tVbml2ZXJzYWxNb2R1bGVEZWZpbml0aW9uKHJvb3QsIGZhY3RvcnkpIHtcblx0aWYodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUgPT09ICdvYmplY3QnKVxuXHRcdG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpO1xuXHRlbHNlIGlmKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZClcblx0XHRkZWZpbmUoW10sIGZhY3RvcnkpO1xuXHRlbHNlIGlmKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jylcblx0XHRleHBvcnRzW1wib2dsXCJdID0gZmFjdG9yeSgpO1xuXHRlbHNlXG5cdFx0cm9vdFtcIm9nbFwiXSA9IGZhY3RvcnkoKTtcbn0pKHNlbGYsIGZ1bmN0aW9uKCkge1xucmV0dXJuICIsImV4cG9ydCBkZWZhdWx0IFwidW5pZm9ybSBtYXQ0IHZpZXdNYXRyaXg7XFxudW5pZm9ybSBtYXQzIG5vcm1hbE1hdHJpeDtcXG51bmlmb3JtIHZlYzMgY2FtZXJhUG9zaXRpb247XFxudW5pZm9ybSB2ZWM0IHVCYXNlQ29sb3JGYWN0b3I7XFxudW5pZm9ybSBzYW1wbGVyMkQgdEJhc2VDb2xvcjtcXG51bmlmb3JtIHNhbXBsZXIyRCB0Uk07XFxudW5pZm9ybSBmbG9hdCB1Um91Z2huZXNzO1xcbnVuaWZvcm0gZmxvYXQgdU1ldGFsbGljO1xcbnVuaWZvcm0gc2FtcGxlcjJEIHROb3JtYWw7XFxudW5pZm9ybSBmbG9hdCB1Tm9ybWFsU2NhbGU7XFxudW5pZm9ybSBzYW1wbGVyMkQgdEVtaXNzaXZlO1xcbnVuaWZvcm0gdmVjMyB1RW1pc3NpdmU7XFxudW5pZm9ybSBzYW1wbGVyMkQgdE9jY2x1c2lvbjtcXG51bmlmb3JtIHNhbXBsZXIyRCB0TFVUO1xcbnVuaWZvcm0gc2FtcGxlcjJEIHRFbnZEaWZmdXNlO1xcbnVuaWZvcm0gc2FtcGxlcjJEIHRFbnZTcGVjdWxhcjtcXG51bmlmb3JtIGZsb2F0IHVFbnZEaWZmdXNlO1xcbnVuaWZvcm0gZmxvYXQgdUVudlNwZWN1bGFyO1xcbnVuaWZvcm0gZmxvYXQgdUVudk1hcEludGVuc2l0eTtcXG51bmlmb3JtIGZsb2F0IHVBbHBoYTtcXG51bmlmb3JtIGZsb2F0IHVBbHBoYUN1dG9mZjtcXG51bmlmb3JtIGJvb2wgdVRyYW5zcGFyZW50O1xcbnZhcnlpbmcgdmVjMiB2VXY7XFxudmFyeWluZyB2ZWMzIHZOb3JtYWw7XFxudmFyeWluZyB2ZWMzIHZNUG9zO1xcbnZhcnlpbmcgdmVjNCB2TVZQb3M7XFxuXFxuY29uc3QgZmxvYXQgUEkgPSAzLjE0MTU5MjY1MzU5O1xcbmNvbnN0IGZsb2F0IFJFQ0lQUk9DQUxfUEkgPSAwLjMxODMwOTg4NjE4O1xcbmNvbnN0IGZsb2F0IFJFQ0lQUk9DQUxfUEkyID0gMC4xNTkxNTQ5NDtcXG5jb25zdCBmbG9hdCBMTjIgPSAwLjY5MzE0NzI7XFxuY29uc3QgZmxvYXQgRU5WX0xPRFMgPSA2LjA7XFxudmVjNCBTUkdCdG9MaW5lYXIodmVjNCBzcmdiKSB7XFxuICB2ZWMzIGxpbk91dCA9IHBvdyhzcmdiLnh5eiwgdmVjMygyLjIpKTtcXG4gIHJldHVybiB2ZWM0KGxpbk91dCwgc3JnYi53KTs7XFxufVxcbnZlYzQgUkdCTVRvTGluZWFyKGluIHZlYzQgdmFsdWUpIHtcXG4gIGZsb2F0IG1heFJhbmdlID0gNi4wO1xcbiAgcmV0dXJuIHZlYzQodmFsdWUueHl6ICogdmFsdWUudyAqIG1heFJhbmdlLCAxLjApO1xcbn1cXG52ZWMzIGxpbmVhclRvU1JHQih2ZWMzIGNvbG9yKSB7XFxuICByZXR1cm4gcG93KGNvbG9yLCB2ZWMzKDEuMCAvIDIuMikpO1xcbn1cXG52ZWMzIGdldE5vcm1hbCgpIHtcXG4gICNpZmRlZiBOT1JNQUxfTUFQXFxuICAgIHZlYzMgcG9zX2R4ID0gZEZkeCh2TVBvcy54eXopO1xcbiAgICB2ZWMzIHBvc19keSA9IGRGZHkodk1Qb3MueHl6KTtcXG4gICAgdmVjMiB0ZXhfZHggPSBkRmR4KHZVdik7XFxuICAgIHZlYzIgdGV4X2R5ID0gZEZkeSh2VXYpO1xcbiAgICAvLyBUYW5nZW50LCBCaXRhbmdlbnRcXG4gICAgdmVjMyB0ID0gbm9ybWFsaXplKHBvc19keCAqIHRleF9keS50IC0gcG9zX2R5ICogdGV4X2R4LnQpO1xcbiAgICB2ZWMzIGIgPSBub3JtYWxpemUoLXBvc19keCAqIHRleF9keS5zICsgcG9zX2R5ICogdGV4X2R4LnMpO1xcbiAgICBtYXQzIHRibiA9IG1hdDModCwgYiwgbm9ybWFsaXplKHZOb3JtYWwpKTtcXG4gICAgdmVjMyBuID0gdGV4dHVyZTJEKHROb3JtYWwsIHZVdikucmdiICogMi4wIC0gMS4wO1xcbiAgICBuLnh5ICo9IHVOb3JtYWxTY2FsZTtcXG4gICAgdmVjMyBub3JtYWwgPSBub3JtYWxpemUodGJuICogbik7XFxuICAgIC8vIEdldCB3b3JsZCBub3JtYWwgZnJvbSB2aWV3IG5vcm1hbCAobm9ybWFsTWF0cml4ICogbm9ybWFsKVxcbiAgICAvLyByZXR1cm4gbm9ybWFsaXplKCh2ZWM0KG5vcm1hbCwgMC4wKSAqIHZpZXdNYXRyaXgpLnh5eik7XFxuICAgIHJldHVybiBub3JtYWxpemUobm9ybWFsKTtcXG4gICNlbHNlXFxuICAgIHJldHVybiBub3JtYWxpemUodk5vcm1hbCk7XFxuICAjZW5kaWZcXG59XFxuXFxudmVjMiBjYXJ0ZXNpYW5Ub1BvbGFyKHZlYzMgbikge1xcbiAgdmVjMiB1djtcXG4gIHV2LnggPSBhdGFuKG4ueiwgbi54KSAqIFJFQ0lQUk9DQUxfUEkyICsgMC41O1xcbiAgdXYueSA9IGFzaW4obi55KSAqIFJFQ0lQUk9DQUxfUEkgKyAwLjU7XFxuICByZXR1cm4gdXY7XFxufVxcblxcbnZvaWQgZ2V0SUJMQ29udHJpYnV0aW9uKGlub3V0IHZlYzMgZGlmZnVzZSwgaW5vdXQgdmVjMyBzcGVjdWxhciwgZmxvYXQgTmRWLCBmbG9hdCByb3VnaG5lc3MsIHZlYzMgbiwgdmVjMyByZWZsZWN0aW9uLCB2ZWMzIGRpZmZ1c2VDb2xvciwgdmVjMyBzcGVjdWxhckNvbG9yKSB7XFxuICB2ZWMzIGJyZGYgPSBTUkdCdG9MaW5lYXIodGV4dHVyZTJEKHRMVVQsIHZlYzIoTmRWLCByb3VnaG5lc3MpKSkucmdiO1xcbiAgdmVjMyBkaWZmdXNlTGlnaHQgPSBSR0JNVG9MaW5lYXIodGV4dHVyZTJEKHRFbnZEaWZmdXNlLCBjYXJ0ZXNpYW5Ub1BvbGFyKG4pKSkucmdiO1xcbiAgZGlmZnVzZUxpZ2h0ID0gbWl4KHZlYzMoMSksIGRpZmZ1c2VMaWdodCwgdUVudkRpZmZ1c2UpO1xcbiAgLy8gU2FtcGxlIDIgbGV2ZWxzIGFuZCBtaXggYmV0d2VlbiB0byBnZXQgc21vb3RoZXIgZGVncmFkYXRpb25cXG4gIGZsb2F0IGJsZW5kID0gcm91Z2huZXNzICogRU5WX0xPRFM7XFxuICBmbG9hdCBsZXZlbDAgPSBmbG9vcihibGVuZCk7XFxuICBmbG9hdCBsZXZlbDEgPSBtaW4oRU5WX0xPRFMsIGxldmVsMCArIDEuMCk7XFxuICBibGVuZCAtPSBsZXZlbDA7XFxuXFxuICAvLyBTYW1wbGUgdGhlIHNwZWN1bGFyIGVudiBtYXAgYXRsYXMgZGVwZW5kaW5nIG9uIHRoZSByb3VnaG5lc3MgdmFsdWVcXG4gIHZlYzIgdXZTcGVjID0gY2FydGVzaWFuVG9Qb2xhcihyZWZsZWN0aW9uKTtcXG4gIHV2U3BlYy55IC89IDIuMDtcXG4gIHZlYzIgdXYwID0gdXZTcGVjO1xcbiAgdmVjMiB1djEgPSB1dlNwZWM7XFxuICB1djAgLz0gcG93KDIuMCwgbGV2ZWwwKTtcXG4gIHV2MC55ICs9IDEuMCAtIGV4cCgtTE4yICogbGV2ZWwwKTtcXG4gIHV2MSAvPSBwb3coMi4wLCBsZXZlbDEpO1xcbiAgdXYxLnkgKz0gMS4wIC0gZXhwKC1MTjIgKiBsZXZlbDEpO1xcbiAgdmVjMyBzcGVjdWxhcjAgPSBSR0JNVG9MaW5lYXIodGV4dHVyZTJEKHRFbnZTcGVjdWxhciwgdXYwKSkucmdiO1xcbiAgdmVjMyBzcGVjdWxhcjEgPSBSR0JNVG9MaW5lYXIodGV4dHVyZTJEKHRFbnZTcGVjdWxhciwgdXYxKSkucmdiO1xcbiAgdmVjMyBzcGVjdWxhckxpZ2h0ID0gbWl4KHNwZWN1bGFyMCwgc3BlY3VsYXIxLCBibGVuZCk7XFxuICBkaWZmdXNlID0gZGlmZnVzZUxpZ2h0ICogZGlmZnVzZUNvbG9yO1xcblxcbiAgLy8gQml0IG9mIGV4dHJhIHJlZmxlY3Rpb24gZm9yIHNtb290aCBtYXRlcmlhbHNcXG4gIGZsb2F0IHJlZmxlY3Rpdml0eSA9IHBvdygoMS4wIC0gcm91Z2huZXNzKSwgMi4wKSAqIDAuMDU7XFxuICBzcGVjdWxhciA9IHNwZWN1bGFyTGlnaHQgKiAoc3BlY3VsYXJDb2xvciAqIGJyZGYueCArIGJyZGYueSArIHJlZmxlY3Rpdml0eSk7XFxuICBzcGVjdWxhciAqPSB1RW52U3BlY3VsYXI7XFxufVxcblxcbnZvaWQgbWFpbigpIHtcXG4gIHZlYzQgYmFzZUNvbG9yID0gU1JHQnRvTGluZWFyKHVCYXNlQ29sb3JGYWN0b3IpO1xcbiAgI2lmZGVmIENPTE9SX01BUFxcbiAgICBiYXNlQ29sb3IgKj0gU1JHQnRvTGluZWFyKHRleHR1cmUyRCh0QmFzZUNvbG9yLCB2VXYpKTtcXG4gICNlbmRpZlxcbiAgLy8gR2V0IGJhc2UgYWxwaGFcXG4gIGZsb2F0IGFscGhhID0gYmFzZUNvbG9yLmE7XFxuICAjaWZkZWYgQUxQSEFfTUFTS1xcbiAgICBpZiAoYWxwaGEgPCB1QWxwaGFDdXRvZmYpIGRpc2NhcmQ7XFxuICAjZW5kaWZcXG4gIC8vIFJNIG1hcCBwYWNrZWQgYXMgZ2IgPSBbbm90aGluZywgcm91Z2huZXNzLCBtZXRhbGxpYywgbm90aGluZ11cXG4gIHZlYzQgcm1TYW1wbGUgPSB2ZWM0KDEpO1xcbiAgI2lmZGVmIFJNX01BUFxcbiAgICBybVNhbXBsZSAqPSB0ZXh0dXJlMkQodFJNLCB2VXYpO1xcbiAgI2VuZGlmXFxuICBmbG9hdCByb3VnaG5lc3MgPSBjbGFtcChybVNhbXBsZS5nICogdVJvdWdobmVzcywgMC4wNCwgMS4wKTtcXG4gIGZsb2F0IG1ldGFsbGljID0gY2xhbXAocm1TYW1wbGUuYiAqIHVNZXRhbGxpYywgMC4wNCwgMS4wKTtcXG4gIHZlYzMgZjAgPSB2ZWMzKDAuMDQpO1xcbiAgdmVjMyBkaWZmdXNlQ29sb3IgPSBiYXNlQ29sb3IucmdiICogKHZlYzMoMS4wKSAtIGYwKSAqICgxLjAgLSBtZXRhbGxpYyk7XFxuICB2ZWMzIHNwZWN1bGFyQ29sb3IgPSBtaXgoZjAsIGJhc2VDb2xvci5yZ2IsIG1ldGFsbGljKTtcXG4gIHZlYzMgc3BlY3VsYXJFbnZSMCA9IHNwZWN1bGFyQ29sb3I7XFxuICB2ZWMzIHNwZWN1bGFyRW52UjkwID0gdmVjMyhjbGFtcChtYXgobWF4KHNwZWN1bGFyQ29sb3Iuciwgc3BlY3VsYXJDb2xvci5nKSwgc3BlY3VsYXJDb2xvci5iKSAqIDI1LjAsIDAuMCwgMS4wKSk7XFxuICB2ZWMzIE4gPSBnZXROb3JtYWwoKTtcXG4gIHZlYzMgViA9IG5vcm1hbGl6ZSggLSB2TVZQb3MueHl6KTtcXG4gIHZlYzMgcmVmbGVjdGlvbiA9IG5vcm1hbGl6ZShyZWZsZWN0KC1WLCBOKSk7XFxuICBmbG9hdCBOZFYgPSBjbGFtcChhYnMoZG90KE4sIFYpKSwgMC4wMDEsIDEuMCk7XFxuICAvLyBTaGFkaW5nIGJhc2VkIG9mZiBJQkwgbGlnaHRpbmdcXG4gIHZlYzMgY29sb3IgPSB2ZWMzKDAuKTtcXG4gIHZlYzMgZGlmZnVzZUlCTDtcXG4gIHZlYzMgc3BlY3VsYXJJQkw7XFxuICBnZXRJQkxDb250cmlidXRpb24oZGlmZnVzZUlCTCwgc3BlY3VsYXJJQkwsIE5kViwgcm91Z2huZXNzLCBOLCByZWZsZWN0aW9uLCBkaWZmdXNlQ29sb3IsIHNwZWN1bGFyQ29sb3IpO1xcbiAgLy8gQWRkIElCTCBvbiB0b3Agb2YgY29sb3JcXG4gIGNvbG9yICs9IChkaWZmdXNlSUJMICsgc3BlY3VsYXJJQkwpICogdUVudk1hcEludGVuc2l0eTtcXG4gIC8vIEFkZCBJQkwgc3BlYyB0byBhbHBoYSBmb3IgcmVmbGVjdGlvbnMgb24gdHJhbnNwYXJlbnQgc3VyZmFjZXMgKGdsYXNzKVxcbiAgYWxwaGEgPSBtYXgoYWxwaGEsIG1heChtYXgoc3BlY3VsYXJJQkwuciwgc3BlY3VsYXJJQkwuZyksIHNwZWN1bGFySUJMLmIpKTtcXG4gICNpZmRlZiBPQ0NfTUFQXFxuICAgIC8vIFRPRE86IGZpZ3VyZSBvdXQgaG93IHRvIGFwcGx5IG9jY2x1c2lvblxcbiAgICAvLyBjb2xvciAqPSBTUkdCdG9MaW5lYXIodGV4dHVyZTJEKHRPY2NsdXNpb24sIHZVdikpLnJnYjtcXG4gICNlbmRpZlxcbiAgY29sb3IgKz0gdUVtaXNzaXZlO1xcbiAgI2lmZGVmIEVNSVNTSVZFX01BUFxcbiAgICB2ZWMzIGVtaXNzaXZlID0gU1JHQnRvTGluZWFyKHRleHR1cmUyRCh0RW1pc3NpdmUsIHZVdikpLnJnYjtcXG4gICAgY29sb3IgPSBlbWlzc2l2ZTtcXG4gICNlbmRpZlxcbiAgLy8gQXBwbHkgdUFscGhhIHVuaWZvcm0gYXQgdGhlIGVuZCB0byBvdmVyd3JpdGUgYW55IHNwZWN1bGFyIGFkZGl0aW9ucyBvbiB0cmFuc3BhcmVudCBzdXJmYWNlc1xcbi8vICBnbF9GcmFnQ29sb3IucmdiID0gbGluZWFyVG9TUkdCKGNvbG9yKTtcXG4gIGlmKHVUcmFuc3BhcmVudCl7XFxuICAgIGdsX0ZyYWdDb2xvciA9ICh2ZWM0KGNvbG9yLCBhbHBoYSAqIHVBbHBoYSkpO1xcbiAgfWVsc2Uge1xcbi8vICAgIGdsX0ZyYWdDb2xvciA9IGxpbmVhclRvT3V0cHV0VGV4ZWwodmVjNChjb2xvciAqIGFscGhhICogdUFscGhhLCAxLikpO1xcbiAgICBnbF9GcmFnQ29sb3IgPSBsaW5lYXJUb091dHB1dFRleGVsKHZlYzQoY29sb3IgKiB1QWxwaGEsIDEuKSk7XFxuICB9XFxufVxcblwiOyIsImV4cG9ydCBkZWZhdWx0IFwicHJlY2lzaW9uIGhpZ2hwIGZsb2F0O1xcbnByZWNpc2lvbiBoaWdocCBpbnQ7XFxuYXR0cmlidXRlIHZlYzMgcG9zaXRpb247XFxuXFxuI2lmZGVmIFVWXFxuICAgIGF0dHJpYnV0ZSB2ZWMyIHV2O1xcbiNlbHNlXFxuICAgIGNvbnN0IHZlYzIgdXYgPSB2ZWMyKDApO1xcbiNlbmRpZlxcbmF0dHJpYnV0ZSB2ZWMzIG5vcm1hbDtcXG5cXG51bmlmb3JtIG1hdDQgbW9kZWxWaWV3TWF0cml4O1xcbnVuaWZvcm0gbWF0NCBwcm9qZWN0aW9uTWF0cml4O1xcbnVuaWZvcm0gbWF0NCBtb2RlbE1hdHJpeDtcXG51bmlmb3JtIG1hdDMgbm9ybWFsTWF0cml4O1xcblxcbnZhcnlpbmcgdmVjMiB2VXY7XFxudmFyeWluZyB2ZWMzIHZOb3JtYWw7XFxudmFyeWluZyB2ZWMzIHZNUG9zO1xcbnZhcnlpbmcgdmVjNCB2TVZQb3M7XFxuXFxudm9pZCBtYWluKCkge1xcbiAgICB2ZWM0IHBvcyA9IHZlYzQocG9zaXRpb24sIDEpO1xcbiAgICB2ZWMzIG5tbCA9IG5vcm1hbE1hdHJpeCAqIG5vcm1hbDtcXG4gICAgdlV2ID0gdXY7XFxuICAgIHZOb3JtYWwgPSBub3JtYWxpemUobm1sKTtcXG4gICAgdmVjNCBtUG9zID0gbW9kZWxNYXRyaXggKiBwb3M7XFxuICAgIHZNUG9zID0gbVBvcy54eXogLyBtUG9zLnc7XFxuICAgIHZNVlBvcyA9IG1vZGVsVmlld01hdHJpeCAqIHBvcztcXG4gICAgZ2xfUG9zaXRpb24gPSBwcm9qZWN0aW9uTWF0cml4ICogdk1WUG9zO1xcbn1cXG5cIjsiLCJleHBvcnQgZGVmYXVsdCBcIi8vIFRha2VuIGZyb20gdGhyZWVqcy5cXG4vLyBGb3IgYSBkaXNjdXNzaW9uIG9mIHdoYXQgdGhpcyBpcywgcGxlYXNlIHJlYWQgdGhpczogaHR0cDovL2xvdXNvZHJvbWUubmV0L2Jsb2cvbGlnaHQvMjAxMy8wNS8yNi9nYW1tYS1jb3JyZWN0LWFuZC1oZHItcmVuZGVyaW5nLWluLWEtMzItYml0cy1idWZmZXIvXFxudmVjNCBMaW5lYXJUb0xpbmVhciggaW4gdmVjNCB2YWx1ZSApIHtcXG4gICAgcmV0dXJuIHZhbHVlO1xcbn1cXG5cXG52ZWM0IEdhbW1hVG9MaW5lYXIoIGluIHZlYzQgdmFsdWUsIGluIGZsb2F0IGdhbW1hRmFjdG9yICkge1xcbiAgICByZXR1cm4gdmVjNCggcG93KCB2YWx1ZS5yZ2IsIHZlYzMoIGdhbW1hRmFjdG9yICkgKSwgdmFsdWUuYSApO1xcbn1cXG5cXG52ZWM0IExpbmVhclRvR2FtbWEoIGluIHZlYzQgdmFsdWUsIGluIGZsb2F0IGdhbW1hRmFjdG9yICkge1xcbiAgICByZXR1cm4gdmVjNCggcG93KCB2YWx1ZS5yZ2IsIHZlYzMoIDEuMCAvIGdhbW1hRmFjdG9yICkgKSwgdmFsdWUuYSApO1xcbn1cXG5cXG52ZWM0IHNSR0JUb0xpbmVhciggaW4gdmVjNCB2YWx1ZSApIHtcXG4gICAgcmV0dXJuIHZlYzQoIG1peCggcG93KCB2YWx1ZS5yZ2IgKiAwLjk0Nzg2NzI5ODYgKyB2ZWMzKCAwLjA1MjEzMjcwMTQgKSwgdmVjMyggMi40ICkgKSwgdmFsdWUucmdiICogMC4wNzczOTkzODA4LCB2ZWMzKCBsZXNzVGhhbkVxdWFsKCB2YWx1ZS5yZ2IsIHZlYzMoIDAuMDQwNDUgKSApICkgKSwgdmFsdWUuYSApO1xcbn1cXG5cXG52ZWM0IExpbmVhclRvc1JHQiggaW4gdmVjNCB2YWx1ZSApIHtcXG4gICAgcmV0dXJuIHZlYzQoIG1peCggcG93KCB2YWx1ZS5yZ2IsIHZlYzMoIDAuNDE2NjYgKSApICogMS4wNTUgLSB2ZWMzKCAwLjA1NSApLCB2YWx1ZS5yZ2IgKiAxMi45MiwgdmVjMyggbGVzc1RoYW5FcXVhbCggdmFsdWUucmdiLCB2ZWMzKCAwLjAwMzEzMDggKSApICkgKSwgdmFsdWUuYSApO1xcbn1cXG5cXG52ZWM0IFJHQkVUb0xpbmVhciggaW4gdmVjNCB2YWx1ZSApIHtcXG4gICAgcmV0dXJuIHZlYzQoIHZhbHVlLnJnYiAqIGV4cDIoIHZhbHVlLmEgKiAyNTUuMCAtIDEyOC4wICksIDEuMCApO1xcbn1cXG5cXG52ZWM0IExpbmVhclRvUkdCRSggaW4gdmVjNCB2YWx1ZSApIHtcXG4gICAgZmxvYXQgbWF4Q29tcG9uZW50ID0gbWF4KCBtYXgoIHZhbHVlLnIsIHZhbHVlLmcgKSwgdmFsdWUuYiApO1xcbiAgICBmbG9hdCBmRXhwID0gY2xhbXAoIGNlaWwoIGxvZzIoIG1heENvbXBvbmVudCApICksIC0xMjguMCwgMTI3LjAgKTtcXG4gICAgcmV0dXJuIHZlYzQoIHZhbHVlLnJnYiAvIGV4cDIoIGZFeHAgKSwgKCBmRXhwICsgMTI4LjAgKSAvIDI1NS4wICk7XFxuICAgIC8vIHJldHVybiB2ZWM0KCB2YWx1ZS5icmcsICggMy4wICsgMTI4LjAgKSAvIDI1Ni4wICk7XFxufVxcblxcbi8vIHJlZmVyZW5jZTogaHR0cDovL2l3YXNiZWluZ2lyb255LmJsb2dzcG90LmNhLzIwMTAvMDYvZGlmZmVyZW5jZS1iZXR3ZWVuLXJnYm0tYW5kLXJnYmQuaHRtbFxcbnZlYzQgUkdCTVRvTGluZWFyKCBpbiB2ZWM0IHZhbHVlLCBpbiBmbG9hdCBtYXhSYW5nZSApIHtcXG4gICAgcmV0dXJuIHZlYzQoIHZhbHVlLnJnYiAqIHZhbHVlLmEgKiBtYXhSYW5nZSwgMS4wICk7XFxufVxcblxcbnZlYzQgTGluZWFyVG9SR0JNKCBpbiB2ZWM0IHZhbHVlLCBpbiBmbG9hdCBtYXhSYW5nZSApIHtcXG4gICAgZmxvYXQgbWF4UkdCID0gbWF4KCB2YWx1ZS5yLCBtYXgoIHZhbHVlLmcsIHZhbHVlLmIgKSApO1xcbiAgICBmbG9hdCBNID0gY2xhbXAoIG1heFJHQiAvIG1heFJhbmdlLCAwLjAsIDEuMCApO1xcbiAgICBNID0gY2VpbCggTSAqIDI1NS4wICkgLyAyNTUuMDtcXG4gICAgcmV0dXJuIHZlYzQoIHZhbHVlLnJnYiAvICggTSAqIG1heFJhbmdlICksIE0gKTtcXG59XFxuXFxuLy8gcmVmZXJlbmNlOiBodHRwOi8vaXdhc2JlaW5naXJvbnkuYmxvZ3Nwb3QuY2EvMjAxMC8wNi9kaWZmZXJlbmNlLWJldHdlZW4tcmdibS1hbmQtcmdiZC5odG1sXFxudmVjNCBSR0JEVG9MaW5lYXIoIGluIHZlYzQgdmFsdWUsIGluIGZsb2F0IG1heFJhbmdlICkge1xcbiAgICByZXR1cm4gdmVjNCggdmFsdWUucmdiICogKCAoIG1heFJhbmdlIC8gMjU1LjAgKSAvIHZhbHVlLmEgKSwgMS4wICk7XFxufVxcblxcbnZlYzQgTGluZWFyVG9SR0JEKCBpbiB2ZWM0IHZhbHVlLCBpbiBmbG9hdCBtYXhSYW5nZSApIHtcXG4gICAgZmxvYXQgbWF4UkdCID0gbWF4KCB2YWx1ZS5yLCBtYXgoIHZhbHVlLmcsIHZhbHVlLmIgKSApO1xcbiAgICBmbG9hdCBEID0gbWF4KCBtYXhSYW5nZSAvIG1heFJHQiwgMS4wICk7XFxuICAgIC8vIE5PVEU6IFRoZSBpbXBsZW1lbnRhdGlvbiB3aXRoIG1pbiBjYXVzZXMgdGhlIHNoYWRlciB0byBub3QgY29tcGlsZSBvblxcbiAgICAvLyBhIGNvbW1vbiBBbGNhdGVsIEE1MDJETCBpbiBDaHJvbWUgNzgvQW5kcm9pZCA4LjEuIFNvbWUgcmVzZWFyY2ggc3VnZ2VzdHNcXG4gICAgLy8gdGhhdCB0aGUgY2hpcHNldCBpcyBNZWRpYXRlayBNVDY3Mzkgdy8gSU1HIFBvd2VyVlIgR0U4MTAwIEdQVS5cXG4gICAgLy8gRCA9IG1pbiggZmxvb3IoIEQgKSAvIDI1NS4wLCAxLjAgKTtcXG4gICAgRCA9IGNsYW1wKCBmbG9vciggRCApIC8gMjU1LjAsIDAuMCwgMS4wICk7XFxuICAgIHJldHVybiB2ZWM0KCB2YWx1ZS5yZ2IgKiAoIEQgKiAoIDI1NS4wIC8gbWF4UmFuZ2UgKSApLCBEICk7XFxufVxcblxcbi8vIExvZ0x1diByZWZlcmVuY2U6IGh0dHA6Ly9ncmFwaGljcmFudHMuYmxvZ3Nwb3QuY2EvMjAwOS8wNC9yZ2JtLWNvbG9yLWVuY29kaW5nLmh0bWxcXG5cXG4vLyBNIG1hdHJpeCwgZm9yIGVuY29kaW5nXFxuY29uc3QgbWF0MyBjTG9nTHV2TSA9IG1hdDMoIDAuMjIwOSwgMC4zMzkwLCAwLjQxODQsIDAuMTEzOCwgMC42NzgwLCAwLjczMTksIDAuMDEwMiwgMC4xMTMwLCAwLjI5NjkgKTtcXG52ZWM0IExpbmVhclRvTG9nTHV2KCBpbiB2ZWM0IHZhbHVlICkge1xcbiAgICB2ZWMzIFhwX1lfWFlacCA9IGNMb2dMdXZNICogdmFsdWUucmdiO1xcbiAgICBYcF9ZX1hZWnAgPSBtYXgoIFhwX1lfWFlacCwgdmVjMyggMWUtNiwgMWUtNiwgMWUtNiApICk7XFxuICAgIHZlYzQgdlJlc3VsdDtcXG4gICAgdlJlc3VsdC54eSA9IFhwX1lfWFlacC54eSAvIFhwX1lfWFlacC56O1xcbiAgICBmbG9hdCBMZSA9IDIuMCAqIGxvZzIoWHBfWV9YWVpwLnkpICsgMTI3LjA7XFxuICAgIHZSZXN1bHQudyA9IGZyYWN0KCBMZSApO1xcbiAgICB2UmVzdWx0LnogPSAoIExlIC0gKCBmbG9vciggdlJlc3VsdC53ICogMjU1LjAgKSApIC8gMjU1LjAgKSAvIDI1NS4wO1xcbiAgICByZXR1cm4gdlJlc3VsdDtcXG59XFxuXFxuLy8gSW52ZXJzZSBNIG1hdHJpeCwgZm9yIGRlY29kaW5nXFxuY29uc3QgbWF0MyBjTG9nTHV2SW52ZXJzZU0gPSBtYXQzKCA2LjAwMTQsIC0yLjcwMDgsIC0xLjc5OTYsIC0xLjMzMjAsIDMuMTAyOSwgLTUuNzcyMSwgMC4zMDA4LCAtMS4wODgyLCA1LjYyNjggKTtcXG52ZWM0IExvZ0x1dlRvTGluZWFyKCBpbiB2ZWM0IHZhbHVlICkge1xcbiAgICBmbG9hdCBMZSA9IHZhbHVlLnogKiAyNTUuMCArIHZhbHVlLnc7XFxuICAgIHZlYzMgWHBfWV9YWVpwO1xcbiAgICBYcF9ZX1hZWnAueSA9IGV4cDIoICggTGUgLSAxMjcuMCApIC8gMi4wICk7XFxuICAgIFhwX1lfWFlacC56ID0gWHBfWV9YWVpwLnkgLyB2YWx1ZS55O1xcbiAgICBYcF9ZX1hZWnAueCA9IHZhbHVlLnggKiBYcF9ZX1hZWnAuejtcXG4gICAgdmVjMyB2UkdCID0gY0xvZ0x1dkludmVyc2VNICogWHBfWV9YWVpwLnJnYjtcXG4gICAgcmV0dXJuIHZlYzQoIG1heCggdlJHQiwgMC4wICksIDEuMCApO1xcbn1cXG5cXG5cXG52ZWM0IGlucHV0VGV4ZWxUb0xpbmVhciggdmVjNCB2YWx1ZSApIHtcXG4gICAgaWYgKCBpbnB1dEVuY29kaW5nID09IDAgKSB7XFxuICAgICAgICByZXR1cm4gdmFsdWU7XFxuICAgIH0gZWxzZSBpZiAoIGlucHV0RW5jb2RpbmcgPT0gMSApIHtcXG4gICAgICAgIHJldHVybiBzUkdCVG9MaW5lYXIoIHZhbHVlICk7XFxuICAgIH0gZWxzZSBpZiAoIGlucHV0RW5jb2RpbmcgPT0gMiApIHtcXG4gICAgICAgIHJldHVybiBSR0JFVG9MaW5lYXIoIHZhbHVlICk7XFxuICAgIH0gZWxzZSBpZiAoIGlucHV0RW5jb2RpbmcgPT0gMyApIHtcXG4gICAgICAgIHJldHVybiBSR0JNVG9MaW5lYXIoIHZhbHVlLCA3LjAgKTtcXG4gICAgfSBlbHNlIGlmICggaW5wdXRFbmNvZGluZyA9PSA0ICkge1xcbiAgICAgICAgcmV0dXJuIFJHQk1Ub0xpbmVhciggdmFsdWUsIDE2LjAgKTtcXG4gICAgfSBlbHNlIGlmICggaW5wdXRFbmNvZGluZyA9PSA1ICkge1xcbiAgICAgICAgcmV0dXJuIFJHQkRUb0xpbmVhciggdmFsdWUsIDI1Ni4wICk7XFxuICAgIH0gZWxzZSB7XFxuICAgICAgICByZXR1cm4gR2FtbWFUb0xpbmVhciggdmFsdWUsIDIuMiApO1xcbiAgICB9XFxufVxcbnZlYzQgbGluZWFyVG9PdXRwdXRUZXhlbCggdmVjNCB2YWx1ZSApIHtcXG4gICAgaWYgKCBvdXRwdXRFbmNvZGluZyA9PSAwICkge1xcbiAgICAgICAgcmV0dXJuIHZhbHVlO1xcbiAgICB9IGVsc2UgaWYgKCBvdXRwdXRFbmNvZGluZyA9PSAxICkge1xcbiAgICAgICAgcmV0dXJuIExpbmVhclRvc1JHQiggdmFsdWUgKTtcXG4gICAgfSBlbHNlIGlmICggb3V0cHV0RW5jb2RpbmcgPT0gMiApIHtcXG4gICAgICAgIHJldHVybiBMaW5lYXJUb1JHQkUoIHZhbHVlICk7XFxuICAgIH0gZWxzZSBpZiAoIG91dHB1dEVuY29kaW5nID09IDMgKSB7XFxuICAgICAgICByZXR1cm4gTGluZWFyVG9SR0JNKCB2YWx1ZSwgNy4wICk7XFxuICAgIH0gZWxzZSBpZiAoIG91dHB1dEVuY29kaW5nID09IDQgKSB7XFxuICAgICAgICByZXR1cm4gTGluZWFyVG9SR0JNKCB2YWx1ZSwgMTYuMCApO1xcbiAgICB9IGVsc2UgaWYgKCBvdXRwdXRFbmNvZGluZyA9PSA1ICkge1xcbiAgICAgICAgcmV0dXJuIExpbmVhclRvUkdCRCggdmFsdWUsIDI1Ni4wICk7XFxuICAgIH0gZWxzZSB7XFxuICAgICAgICByZXR1cm4gTGluZWFyVG9HYW1tYSggdmFsdWUsIDIuMiApO1xcbiAgICB9XFxufVxcblxcblxcblwiOyIsImV4cG9ydCBkZWZhdWx0IFwidW5pZm9ybSBmbG9hdCB0b25lTWFwcGluZ0V4cG9zdXJlO1xcblxcbi8vIGV4cG9zdXJlIG9ubHlcXG52ZWMzIExpbmVhclRvbmVNYXBwaW5nKCB2ZWMzIGNvbG9yICkge1xcblxcbiAgICByZXR1cm4gdG9uZU1hcHBpbmdFeHBvc3VyZSAqIGNvbG9yO1xcblxcbn1cXG5cXG4vLyBzb3VyY2U6IGh0dHBzOi8vd3d3LmNzLnV0YWguZWR1L35yZWluaGFyZC9jZHJvbS9cXG52ZWMzIFJlaW5oYXJkVG9uZU1hcHBpbmcoIHZlYzMgY29sb3IgKSB7XFxuXFxuICAgIGNvbG9yICo9IHRvbmVNYXBwaW5nRXhwb3N1cmU7XFxuICAgIHJldHVybiBjbGFtcCAoIGNvbG9yIC8gKCB2ZWMzKCAxLjAgKSArIGNvbG9yICksIDAuLCAxLik7XFxuXFxufVxcblxcbi8vIHNvdXJjZTogaHR0cDovL2ZpbG1pY3dvcmxkcy5jb20vYmxvZy9maWxtaWMtdG9uZW1hcHBpbmctb3BlcmF0b3JzL1xcbnZlYzMgT3B0aW1pemVkQ2luZW9uVG9uZU1hcHBpbmcoIHZlYzMgY29sb3IgKSB7XFxuXFxuICAgIC8vIG9wdGltaXplZCBmaWxtaWMgb3BlcmF0b3IgYnkgSmltIEhlamwgYW5kIFJpY2hhcmQgQnVyZ2Vzcy1EYXdzb25cXG4gICAgY29sb3IgKj0gdG9uZU1hcHBpbmdFeHBvc3VyZTtcXG4gICAgY29sb3IgPSBtYXgoIHZlYzMoIDAuMCApLCBjb2xvciAtIDAuMDA0ICk7XFxuICAgIHJldHVybiBwb3coICggY29sb3IgKiAoIDYuMiAqIGNvbG9yICsgMC41ICkgKSAvICggY29sb3IgKiAoIDYuMiAqIGNvbG9yICsgMS43ICkgKyAwLjA2ICksIHZlYzMoIDIuMiApICk7XFxuXFxufVxcblxcbi8vIHNvdXJjZTogaHR0cHM6Ly9naXRodWIuY29tL3NlbGZzaGFkb3cvbHRjX2NvZGUvYmxvYi9tYXN0ZXIvd2ViZ2wvc2hhZGVycy9sdGMvbHRjX2JsaXQuZnNcXG52ZWMzIFJSVEFuZE9EVEZpdCggdmVjMyB2ICkge1xcblxcbiAgICB2ZWMzIGEgPSB2ICogKCB2ICsgMC4wMjQ1Nzg2ICkgLSAwLjAwMDA5MDUzNztcXG4gICAgdmVjMyBiID0gdiAqICggMC45ODM3MjkgKiB2ICsgMC40MzI5NTEwICkgKyAwLjIzODA4MTtcXG4gICAgcmV0dXJuIGEgLyBiO1xcblxcbn1cXG5cXG4vLyB0aGlzIGltcGxlbWVudGF0aW9uIG9mIEFDRVMgaXMgbW9kaWZpZWQgdG8gYWNjb21tb2RhdGUgYSBicmlnaHRlciB2aWV3aW5nIGVudmlyb25tZW50Llxcbi8vIHRoZSBzY2FsZSBmYWN0b3Igb2YgMS8wLjYgaXMgc3ViamVjdGl2ZS4gc2VlIGRpc2N1c3Npb24gaW4gIzE5NjIxLlxcblxcbnZlYzMgQUNFU0ZpbG1pY1RvbmVNYXBwaW5nKCB2ZWMzIGNvbG9yICkge1xcblxcbiAgICAvLyBzUkdCID0+IFhZWiA9PiBENjVfMl9ENjAgPT4gQVAxID0+IFJSVF9TQVRcXG4gICAgY29uc3QgbWF0MyBBQ0VTSW5wdXRNYXQgPSBtYXQzKFxcbiAgICB2ZWMzKCAwLjU5NzE5LCAwLjA3NjAwLCAwLjAyODQwICksIC8vIHRyYW5zcG9zZWQgZnJvbSBzb3VyY2VcXG4gICAgdmVjMyggMC4zNTQ1OCwgMC45MDgzNCwgMC4xMzM4MyApLFxcbiAgICB2ZWMzKCAwLjA0ODIzLCAwLjAxNTY2LCAwLjgzNzc3IClcXG4gICAgKTtcXG5cXG4gICAgLy8gT0RUX1NBVCA9PiBYWVogPT4gRDYwXzJfRDY1ID0+IHNSR0JcXG4gICAgY29uc3QgbWF0MyBBQ0VTT3V0cHV0TWF0ID0gbWF0MyhcXG4gICAgdmVjMyggIDEuNjA0NzUsIC0wLjEwMjA4LCAtMC4wMDMyNyApLCAvLyB0cmFuc3Bvc2VkIGZyb20gc291cmNlXFxuICAgIHZlYzMoIC0wLjUzMTA4LCAgMS4xMDgxMywgLTAuMDcyNzYgKSxcXG4gICAgdmVjMyggLTAuMDczNjcsIC0wLjAwNjA1LCAgMS4wNzYwMiApXFxuICAgICk7XFxuXFxuICAgIGNvbG9yICo9IHRvbmVNYXBwaW5nRXhwb3N1cmUgLyAwLjY7XFxuXFxuICAgIGNvbG9yID0gQUNFU0lucHV0TWF0ICogY29sb3I7XFxuXFxuICAgIC8vIEFwcGx5IFJSVCBhbmQgT0RUXFxuICAgIGNvbG9yID0gUlJUQW5kT0RURml0KCBjb2xvciApO1xcblxcbiAgICBjb2xvciA9IEFDRVNPdXRwdXRNYXQgKiBjb2xvcjtcXG5cXG4gICAgLy8gQ2xhbXAgdG8gWzAsIDFdXFxuICAgIHJldHVybiBjbGFtcCggY29sb3IsIDAuLCAxLiApO1xcblxcbn1cXG5cXG52ZWMzIEN1c3RvbVRvbmVNYXBwaW5nKCB2ZWMzIGNvbG9yICkgeyByZXR1cm4gY29sb3I7IH1cXG5cXG52ZWMzIHRvbmVNYXBDb2xvcih2ZWMzIHZhbHVlKXtcXG4gICAgaWYgKCB0b25lbWFwcGluZ01vZGUgPT0gMCApIHtcXG4gICAgICAgIHJldHVybiBMaW5lYXJUb25lTWFwcGluZyAoIHZhbHVlICk7XFxuICAgIH0gZWxzZSBpZiAoIHRvbmVtYXBwaW5nTW9kZSA9PSAxICkge1xcbiAgICAgICAgcmV0dXJuIFJlaW5oYXJkVG9uZU1hcHBpbmcgKCB2YWx1ZSApO1xcbiAgICB9IGVsc2UgaWYgKCB0b25lbWFwcGluZ01vZGUgPT0gMiApIHtcXG4gICAgICAgIHJldHVybiBPcHRpbWl6ZWRDaW5lb25Ub25lTWFwcGluZyAoIHZhbHVlICk7XFxuICAgIH0gZWxzZSBpZiAoIHRvbmVtYXBwaW5nTW9kZSA9PSAzICkge1xcbiAgICAgICAgcmV0dXJuIEFDRVNGaWxtaWNUb25lTWFwcGluZyAoIHZhbHVlICk7XFxuICAgIH0gZWxzZSB7XFxuICAgICAgICByZXR1cm4gdmFsdWU7XFxuICAgIH1cXG59XFxuXFxuXCI7IiwiaW1wb3J0IHsgVHJhbnNmb3JtIH0gZnJvbSAnLi9UcmFuc2Zvcm0uanMnO1xuaW1wb3J0IHsgTWF0NCB9IGZyb20gJy4uL21hdGgvTWF0NC5qcyc7XG5pbXBvcnQgeyBWZWMzIH0gZnJvbSAnLi4vbWF0aC9WZWMzLmpzJztcblxuY29uc3QgdGVtcE1hdDQgPSBuZXcgTWF0NCgpO1xuY29uc3QgdGVtcFZlYzNhID0gbmV3IFZlYzMoKTtcbmNvbnN0IHRlbXBWZWMzYiA9IG5ldyBWZWMzKCk7XG5cbmV4cG9ydCBjbGFzcyBDYW1lcmEgZXh0ZW5kcyBUcmFuc2Zvcm0ge1xuICAgIGNvbnN0cnVjdG9yKGdsLCB7IG5lYXIgPSAwLjEsIGZhciA9IDEwMCwgZm92ID0gNDUsIGFzcGVjdCA9IDEsIGxlZnQsIHJpZ2h0LCBib3R0b20sIHRvcCwgem9vbSA9IDEgfSA9IHt9KSB7XG4gICAgICAgIHN1cGVyKCk7XG5cbiAgICAgICAgT2JqZWN0LmFzc2lnbih0aGlzLCB7IG5lYXIsIGZhciwgZm92LCBhc3BlY3QsIGxlZnQsIHJpZ2h0LCBib3R0b20sIHRvcCwgem9vbSB9KTtcblxuICAgICAgICB0aGlzLnByb2plY3Rpb25NYXRyaXggPSBuZXcgTWF0NCgpO1xuICAgICAgICB0aGlzLnZpZXdNYXRyaXggPSBuZXcgTWF0NCgpO1xuICAgICAgICB0aGlzLnByb2plY3Rpb25WaWV3TWF0cml4ID0gbmV3IE1hdDQoKTtcbiAgICAgICAgdGhpcy53b3JsZFBvc2l0aW9uID0gbmV3IFZlYzMoKTtcblxuICAgICAgICAvLyBVc2Ugb3J0aG9ncmFwaGljIGlmIGxlZnQvcmlnaHQgc2V0LCBlbHNlIGRlZmF1bHQgdG8gcGVyc3BlY3RpdmUgY2FtZXJhXG4gICAgICAgIHRoaXMudHlwZSA9IGxlZnQgfHwgcmlnaHQgPyAnb3J0aG9ncmFwaGljJyA6ICdwZXJzcGVjdGl2ZSc7XG5cbiAgICAgICAgaWYgKHRoaXMudHlwZSA9PT0gJ29ydGhvZ3JhcGhpYycpIHRoaXMub3J0aG9ncmFwaGljKCk7XG4gICAgICAgIGVsc2UgdGhpcy5wZXJzcGVjdGl2ZSgpO1xuICAgIH1cblxuICAgIHNldFZpZXdPZmZzZXQoeCwgeSwgd2lkdGgsIGhlaWdodCkge1xuICAgICAgICBpZighdGhpcy52aWV3KSB7XG4gICAgICAgICAgICB0aGlzLnZpZXcgPSB7XG4gICAgICAgICAgICAgICAgb2Zmc2V0WDogeCxcbiAgICAgICAgICAgICAgICBvZmZzZXRZOiB5LFxuICAgICAgICAgICAgICAgIHdpZHRoOiB3aWR0aCxcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IGhlaWdodFxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHRoaXMudmlldy5vZmZzZXRYID0geDtcbiAgICAgICAgdGhpcy52aWV3Lm9mZnNldFkgPSB5O1xuICAgICAgICB0aGlzLnZpZXcud2lkdGggPSB3aWR0aDtcbiAgICAgICAgdGhpcy52aWV3LmhlaWdodCA9IGhlaWdodDtcbiAgICAgICAgaWYodGhpcy50eXBlID09PSAncGVyc3BlY3RpdmUnKSB7XG4gICAgICAgICAgICB0aGlzLnBlcnNwZWN0aXZlKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjbGVhclZpZXdPZmZzZXQoKSB7XG4gICAgICAgIHRoaXMudmlldyA9IG51bGw7XG4gICAgICAgIGlmKHRoaXMudHlwZSA9PT0gJ3BlcnNwZWN0aXZlJykge1xuICAgICAgICAgICAgdGhpcy5wZXJzcGVjdGl2ZSgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcGVyc3BlY3RpdmUoeyBuZWFyID0gdGhpcy5uZWFyLCBmYXIgPSB0aGlzLmZhciwgZm92ID0gdGhpcy5mb3YsIGFzcGVjdCA9IHRoaXMuYXNwZWN0IH0gPSB7fSkge1xuICAgICAgICBPYmplY3QuYXNzaWduKHRoaXMsIHsgbmVhciwgZmFyLCBmb3YsIGFzcGVjdCB9KTtcbiAgICAgICAgbGV0IHRvcCA9IG5lYXIgKiBNYXRoLnRhbiggTWF0aC5QSS8xODAgKiAwLjUgKiBmb3YgKSxcbiAgICAgICAgaGVpZ2h0ID0gMiAqIHRvcCxcbiAgICAgICAgd2lkdGggPSBhc3BlY3QgKiBoZWlnaHQsXG4gICAgICAgIGxlZnQgPSAtIDAuNSAqIHdpZHRoO1xuICAgICAgICBcbiAgICAgICAgaWYodGhpcy52aWV3KSB7XG4gICAgICAgICAgICBsZWZ0ICs9IHRoaXMudmlldy5vZmZzZXRYICogd2lkdGggLyB0aGlzLnZpZXcud2lkdGg7XG5cdFx0XHR0b3AgLT0gdGhpcy52aWV3Lm9mZnNldFkgKiBoZWlnaHQgLyB0aGlzLnZpZXcuaGVpZ2h0O1xuICAgICAgICB9XG4gICAgICAgIGxldCByaWdodCA9IGxlZnQgKyB3aWR0aDtcbiAgICAgICAgbGV0IGJvdHRvbSA9IHRvcCAtIGhlaWdodDtcblxuICAgICAgICB0aGlzLnByb2plY3Rpb25NYXRyaXguZnJvbVBlcnNwZWN0aXZlRnJ1c3RydW0oeyBsZWZ0LCByaWdodCwgdG9wLCBib3R0b20sIG5lYXIsIGZhciB9KTtcbiAgICAgICAgdGhpcy50eXBlID0gJ3BlcnNwZWN0aXZlJztcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgb3J0aG9ncmFwaGljKHtcbiAgICAgICAgbmVhciA9IHRoaXMubmVhcixcbiAgICAgICAgZmFyID0gdGhpcy5mYXIsXG4gICAgICAgIGxlZnQgPSB0aGlzLmxlZnQsXG4gICAgICAgIHJpZ2h0ID0gdGhpcy5yaWdodCxcbiAgICAgICAgYm90dG9tID0gdGhpcy5ib3R0b20sXG4gICAgICAgIHRvcCA9IHRoaXMudG9wLFxuICAgICAgICB6b29tID0gdGhpcy56b29tLFxuICAgIH0gPSB7fSkge1xuICAgICAgICBPYmplY3QuYXNzaWduKHRoaXMsIHsgbmVhciwgZmFyLCBsZWZ0LCByaWdodCwgYm90dG9tLCB0b3AsIHpvb20gfSk7XG4gICAgICAgIGxlZnQgLz0gem9vbTtcbiAgICAgICAgcmlnaHQgLz0gem9vbTtcbiAgICAgICAgYm90dG9tIC89IHpvb207XG4gICAgICAgIHRvcCAvPSB6b29tO1xuICAgICAgICB0aGlzLnByb2plY3Rpb25NYXRyaXguZnJvbU9ydGhvZ29uYWwoeyBsZWZ0LCByaWdodCwgYm90dG9tLCB0b3AsIG5lYXIsIGZhciB9KTtcbiAgICAgICAgdGhpcy50eXBlID0gJ29ydGhvZ3JhcGhpYyc7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHVwZGF0ZU1hdHJpeFdvcmxkKCkge1xuICAgICAgICBzdXBlci51cGRhdGVNYXRyaXhXb3JsZCgpO1xuICAgICAgICB0aGlzLnZpZXdNYXRyaXguaW52ZXJzZSh0aGlzLndvcmxkTWF0cml4KTtcbiAgICAgICAgdGhpcy53b3JsZE1hdHJpeC5nZXRUcmFuc2xhdGlvbih0aGlzLndvcmxkUG9zaXRpb24pO1xuXG4gICAgICAgIC8vIHVzZWQgZm9yIHNvcnRpbmdcbiAgICAgICAgdGhpcy5wcm9qZWN0aW9uVmlld01hdHJpeC5tdWx0aXBseSh0aGlzLnByb2plY3Rpb25NYXRyaXgsIHRoaXMudmlld01hdHJpeCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGxvb2tBdCh0YXJnZXQpIHtcbiAgICAgICAgc3VwZXIubG9va0F0KHRhcmdldCwgdHJ1ZSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8vIFByb2plY3QgM0QgY29vcmRpbmF0ZSB0byAyRCBwb2ludFxuICAgIHByb2plY3Qodikge1xuICAgICAgICB2LmFwcGx5TWF0cml4NCh0aGlzLnZpZXdNYXRyaXgpO1xuICAgICAgICB2LmFwcGx5TWF0cml4NCh0aGlzLnByb2plY3Rpb25NYXRyaXgpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvLyBVbnByb2plY3QgMkQgcG9pbnQgdG8gM0QgY29vcmRpbmF0ZVxuICAgIHVucHJvamVjdCh2KSB7XG4gICAgICAgIHYuYXBwbHlNYXRyaXg0KHRlbXBNYXQ0LmludmVyc2UodGhpcy5wcm9qZWN0aW9uTWF0cml4KSk7XG4gICAgICAgIHYuYXBwbHlNYXRyaXg0KHRoaXMud29ybGRNYXRyaXgpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICB1cGRhdGVGcnVzdHVtKCkge1xuICAgICAgICBpZiAoIXRoaXMuZnJ1c3R1bSkge1xuICAgICAgICAgICAgdGhpcy5mcnVzdHVtID0gW25ldyBWZWMzKCksIG5ldyBWZWMzKCksIG5ldyBWZWMzKCksIG5ldyBWZWMzKCksIG5ldyBWZWMzKCksIG5ldyBWZWMzKCldO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgbSA9IHRoaXMucHJvamVjdGlvblZpZXdNYXRyaXg7XG4gICAgICAgIHRoaXMuZnJ1c3R1bVswXS5zZXQobVszXSAtIG1bMF0sIG1bN10gLSBtWzRdLCBtWzExXSAtIG1bOF0pLmNvbnN0YW50ID0gbVsxNV0gLSBtWzEyXTsgLy8gLXhcbiAgICAgICAgdGhpcy5mcnVzdHVtWzFdLnNldChtWzNdICsgbVswXSwgbVs3XSArIG1bNF0sIG1bMTFdICsgbVs4XSkuY29uc3RhbnQgPSBtWzE1XSArIG1bMTJdOyAvLyAreFxuICAgICAgICB0aGlzLmZydXN0dW1bMl0uc2V0KG1bM10gKyBtWzFdLCBtWzddICsgbVs1XSwgbVsxMV0gKyBtWzldKS5jb25zdGFudCA9IG1bMTVdICsgbVsxM107IC8vICt5XG4gICAgICAgIHRoaXMuZnJ1c3R1bVszXS5zZXQobVszXSAtIG1bMV0sIG1bN10gLSBtWzVdLCBtWzExXSAtIG1bOV0pLmNvbnN0YW50ID0gbVsxNV0gLSBtWzEzXTsgLy8gLXlcbiAgICAgICAgdGhpcy5mcnVzdHVtWzRdLnNldChtWzNdIC0gbVsyXSwgbVs3XSAtIG1bNl0sIG1bMTFdIC0gbVsxMF0pLmNvbnN0YW50ID0gbVsxNV0gLSBtWzE0XTsgLy8gK3ogKGZhcilcbiAgICAgICAgdGhpcy5mcnVzdHVtWzVdLnNldChtWzNdICsgbVsyXSwgbVs3XSArIG1bNl0sIG1bMTFdICsgbVsxMF0pLmNvbnN0YW50ID0gbVsxNV0gKyBtWzE0XTsgLy8gLXogKG5lYXIpXG5cbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCA2OyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IGludkxlbiA9IDEuMCAvIHRoaXMuZnJ1c3R1bVtpXS5kaXN0YW5jZSgpO1xuICAgICAgICAgICAgdGhpcy5mcnVzdHVtW2ldLm11bHRpcGx5KGludkxlbik7XG4gICAgICAgICAgICB0aGlzLmZydXN0dW1baV0uY29uc3RhbnQgKj0gaW52TGVuO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnJ1c3R1bUludGVyc2VjdHNNZXNoKG5vZGUpIHtcbiAgICAgICAgLy8gSWYgbm8gcG9zaXRpb24gYXR0cmlidXRlLCB0cmVhdCBhcyBmcnVzdHVtQ3VsbGVkIGZhbHNlXG4gICAgICAgIGlmICghbm9kZS5nZW9tZXRyeS5hdHRyaWJ1dGVzLnBvc2l0aW9uKSByZXR1cm4gdHJ1ZTtcblxuICAgICAgICBpZiAoIW5vZGUuZ2VvbWV0cnkuYm91bmRzIHx8IG5vZGUuZ2VvbWV0cnkuYm91bmRzLnJhZGl1cyA9PT0gSW5maW5pdHkpIG5vZGUuZ2VvbWV0cnkuY29tcHV0ZUJvdW5kaW5nU3BoZXJlKCk7XG5cbiAgICAgICAgaWYgKCFub2RlLmdlb21ldHJ5LmJvdW5kcykgcmV0dXJuIHRydWU7XG5cbiAgICAgICAgY29uc3QgY2VudGVyID0gdGVtcFZlYzNhO1xuICAgICAgICBjZW50ZXIuY29weShub2RlLmdlb21ldHJ5LmJvdW5kcy5jZW50ZXIpO1xuICAgICAgICBjZW50ZXIuYXBwbHlNYXRyaXg0KG5vZGUud29ybGRNYXRyaXgpO1xuXG4gICAgICAgIGNvbnN0IHJhZGl1cyA9IG5vZGUuZ2VvbWV0cnkuYm91bmRzLnJhZGl1cyAqIG5vZGUud29ybGRNYXRyaXguZ2V0TWF4U2NhbGVPbkF4aXMoKTtcblxuICAgICAgICByZXR1cm4gdGhpcy5mcnVzdHVtSW50ZXJzZWN0c1NwaGVyZShjZW50ZXIsIHJhZGl1cyk7XG4gICAgfVxuXG4gICAgZnJ1c3R1bUludGVyc2VjdHNTcGhlcmUoY2VudGVyLCByYWRpdXMpIHtcbiAgICAgICAgY29uc3Qgbm9ybWFsID0gdGVtcFZlYzNiO1xuXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgNjsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBwbGFuZSA9IHRoaXMuZnJ1c3R1bVtpXTtcbiAgICAgICAgICAgIGNvbnN0IGRpc3RhbmNlID0gbm9ybWFsLmNvcHkocGxhbmUpLmRvdChjZW50ZXIpICsgcGxhbmUuY29uc3RhbnQ7XG4gICAgICAgICAgICBpZiAoZGlzdGFuY2UgPCAtcmFkaXVzKSByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxufVxuIiwiLy8gYXR0cmlidXRlIHBhcmFtc1xuLy8ge1xuLy8gICAgIGRhdGEgLSB0eXBlZCBhcnJheSBlZyBVSW50MTZBcnJheSBmb3IgaW5kaWNlcywgRmxvYXQzMkFycmF5XG4vLyAgICAgc2l6ZSAtIGludCBkZWZhdWx0IDFcbi8vICAgICBpbnN0YW5jZWQgLSBkZWZhdWx0IG51bGwuIFBhc3MgZGl2aXNvciBhbW91bnRcbi8vICAgICB0eXBlIC0gZ2wgZW51bSBkZWZhdWx0IGdsLlVOU0lHTkVEX1NIT1JUIGZvciAnaW5kZXgnLCBnbC5GTE9BVCBmb3Igb3RoZXJzXG4vLyAgICAgbm9ybWFsaXplZCAtIGJvb2xlYW4gZGVmYXVsdCBmYWxzZVxuXG4vLyAgICAgYnVmZmVyIC0gZ2wgYnVmZmVyLCBpZiBidWZmZXIgZXhpc3RzLCBkb24ndCBuZWVkIHRvIHByb3ZpZGUgZGF0YVxuLy8gICAgIHN0cmlkZSAtIGRlZmF1bHQgMCAtIGZvciB3aGVuIHBhc3NpbmcgaW4gYnVmZmVyXG4vLyAgICAgb2Zmc2V0IC0gZGVmYXVsdCAwIC0gZm9yIHdoZW4gcGFzc2luZyBpbiBidWZmZXJcbi8vICAgICBjb3VudCAtIGRlZmF1bHQgbnVsbCAtIGZvciB3aGVuIHBhc3NpbmcgaW4gYnVmZmVyXG4vLyAgICAgbWluIC0gYXJyYXkgLSBmb3Igd2hlbiBwYXNzaW5nIGluIGJ1ZmZlclxuLy8gICAgIG1heCAtIGFycmF5IC0gZm9yIHdoZW4gcGFzc2luZyBpbiBidWZmZXJcbi8vIH1cblxuLy8gVE9ETzogZml0IGluIHRyYW5zZm9ybSBmZWVkYmFja1xuLy8gVE9ETzogd2hlbiB3b3VsZCBJIGRpc2FibGVWZXJ0ZXhBdHRyaWJBcnJheSA/XG4vLyBUT0RPOiB1c2Ugb2Zmc2V0L3N0cmlkZSBpZiBleGlzdHNcblxuaW1wb3J0IHsgVmVjMyB9IGZyb20gJy4uL21hdGgvVmVjMy5qcyc7XG5cbmNvbnN0IHRlbXBWZWMzID0gbmV3IFZlYzMoKTtcblxubGV0IElEID0gMTtcbmxldCBBVFRSX0lEID0gMTtcblxuLy8gVG8gc3RvcCBpbmlmaW5pdGUgd2FybmluZ3NcbmxldCBpc0JvdW5kc1dhcm5lZCA9IGZhbHNlO1xuXG5leHBvcnQgY2xhc3MgR2VvbWV0cnkge1xuICAgIGNvbnN0cnVjdG9yKGdsLCBhdHRyaWJ1dGVzID0ge30pIHtcbiAgICAgICAgaWYgKCFnbC5jYW52YXMpIGNvbnNvbGUuZXJyb3IoJ2dsIG5vdCBwYXNzZWQgYXMgZmlyc3QgYXJndW1lbnQgdG8gR2VvbWV0cnknKTtcbiAgICAgICAgdGhpcy5nbCA9IGdsO1xuICAgICAgICB0aGlzLmF0dHJpYnV0ZXMgPSBhdHRyaWJ1dGVzO1xuICAgICAgICB0aGlzLmlkID0gSUQrKztcblxuICAgICAgICAvLyBTdG9yZSBvbmUgVkFPIHBlciBwcm9ncmFtIGF0dHJpYnV0ZSBsb2NhdGlvbnMgb3JkZXJcbiAgICAgICAgdGhpcy5WQU9zID0ge307XG5cbiAgICAgICAgdGhpcy5kcmF3UmFuZ2UgPSB7IHN0YXJ0OiAwLCBjb3VudDogMCB9O1xuICAgICAgICB0aGlzLmluc3RhbmNlZENvdW50ID0gMDtcblxuICAgICAgICAvLyBVbmJpbmQgY3VycmVudCBWQU8gc28gdGhhdCBuZXcgYnVmZmVycyBkb24ndCBnZXQgYWRkZWQgdG8gYWN0aXZlIG1lc2hcbiAgICAgICAgdGhpcy5nbC5yZW5kZXJlci5iaW5kVmVydGV4QXJyYXkobnVsbCk7XG4gICAgICAgIHRoaXMuZ2wucmVuZGVyZXIuY3VycmVudEdlb21ldHJ5ID0gbnVsbDtcblxuICAgICAgICAvLyBBbGlhcyBmb3Igc3RhdGUgc3RvcmUgdG8gYXZvaWQgcmVkdW5kYW50IGNhbGxzIGZvciBnbG9iYWwgc3RhdGVcbiAgICAgICAgdGhpcy5nbFN0YXRlID0gdGhpcy5nbC5yZW5kZXJlci5zdGF0ZTtcblxuICAgICAgICAvLyBjcmVhdGUgdGhlIGJ1ZmZlcnNcbiAgICAgICAgZm9yIChsZXQga2V5IGluIGF0dHJpYnV0ZXMpIHtcbiAgICAgICAgICAgIHRoaXMuYWRkQXR0cmlidXRlKGtleSwgYXR0cmlidXRlc1trZXldKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGFkZEF0dHJpYnV0ZShrZXksIGF0dHIpIHtcbiAgICAgICAgdGhpcy5hdHRyaWJ1dGVzW2tleV0gPSBhdHRyO1xuXG4gICAgICAgIC8vIFNldCBvcHRpb25zXG4gICAgICAgIGF0dHIuaWQgPSBBVFRSX0lEKys7IC8vIFRPRE86IGN1cnJlbnRseSB1bnVzZWQsIHJlbW92ZT9cbiAgICAgICAgYXR0ci5zaXplID0gYXR0ci5zaXplIHx8IDE7XG4gICAgICAgIGF0dHIudHlwZSA9XG4gICAgICAgICAgICBhdHRyLnR5cGUgfHxcbiAgICAgICAgICAgIChhdHRyLmRhdGEuY29uc3RydWN0b3IgPT09IEZsb2F0MzJBcnJheVxuICAgICAgICAgICAgICAgID8gdGhpcy5nbC5GTE9BVFxuICAgICAgICAgICAgICAgIDogYXR0ci5kYXRhLmNvbnN0cnVjdG9yID09PSBVaW50MTZBcnJheVxuICAgICAgICAgICAgICAgID8gdGhpcy5nbC5VTlNJR05FRF9TSE9SVFxuICAgICAgICAgICAgICAgIDogdGhpcy5nbC5VTlNJR05FRF9JTlQpOyAvLyBVaW50MzJBcnJheVxuICAgICAgICBhdHRyLnRhcmdldCA9IGtleSA9PT0gJ2luZGV4JyA/IHRoaXMuZ2wuRUxFTUVOVF9BUlJBWV9CVUZGRVIgOiB0aGlzLmdsLkFSUkFZX0JVRkZFUjtcbiAgICAgICAgYXR0ci5ub3JtYWxpemVkID0gYXR0ci5ub3JtYWxpemVkIHx8IGZhbHNlO1xuICAgICAgICBhdHRyLnN0cmlkZSA9IGF0dHIuc3RyaWRlIHx8IDA7XG4gICAgICAgIGF0dHIub2Zmc2V0ID0gYXR0ci5vZmZzZXQgfHwgMDtcbiAgICAgICAgYXR0ci5jb3VudCA9IGF0dHIuY291bnQgfHwgKGF0dHIuc3RyaWRlID8gYXR0ci5kYXRhLmJ5dGVMZW5ndGggLyBhdHRyLnN0cmlkZSA6IGF0dHIuZGF0YS5sZW5ndGggLyBhdHRyLnNpemUpO1xuICAgICAgICBhdHRyLmRpdmlzb3IgPSBhdHRyLmluc3RhbmNlZCB8fCAwO1xuICAgICAgICBhdHRyLm5lZWRzVXBkYXRlID0gZmFsc2U7XG5cbiAgICAgICAgaWYgKCFhdHRyLmJ1ZmZlcikge1xuICAgICAgICAgICAgYXR0ci5idWZmZXIgPSB0aGlzLmdsLmNyZWF0ZUJ1ZmZlcigpO1xuXG4gICAgICAgICAgICAvLyBQdXNoIGRhdGEgdG8gYnVmZmVyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZUF0dHJpYnV0ZShhdHRyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFVwZGF0ZSBnZW9tZXRyeSBjb3VudHMuIElmIGluZGV4ZWQsIGlnbm9yZSByZWd1bGFyIGF0dHJpYnV0ZXNcbiAgICAgICAgaWYgKGF0dHIuZGl2aXNvcikge1xuICAgICAgICAgICAgdGhpcy5pc0luc3RhbmNlZCA9IHRydWU7XG4gICAgICAgICAgICBpZiAodGhpcy5pbnN0YW5jZWRDb3VudCAmJiB0aGlzLmluc3RhbmNlZENvdW50ICE9PSBhdHRyLmNvdW50ICogYXR0ci5kaXZpc29yKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdnZW9tZXRyeSBoYXMgbXVsdGlwbGUgaW5zdGFuY2VkIGJ1ZmZlcnMgb2YgZGlmZmVyZW50IGxlbmd0aCcpO1xuICAgICAgICAgICAgICAgIHJldHVybiAodGhpcy5pbnN0YW5jZWRDb3VudCA9IE1hdGgubWluKHRoaXMuaW5zdGFuY2VkQ291bnQsIGF0dHIuY291bnQgKiBhdHRyLmRpdmlzb3IpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuaW5zdGFuY2VkQ291bnQgPSBhdHRyLmNvdW50ICogYXR0ci5kaXZpc29yO1xuICAgICAgICB9IGVsc2UgaWYgKGtleSA9PT0gJ2luZGV4Jykge1xuICAgICAgICAgICAgdGhpcy5kcmF3UmFuZ2UuY291bnQgPSBhdHRyLmNvdW50O1xuICAgICAgICB9IGVsc2UgaWYgKCF0aGlzLmF0dHJpYnV0ZXMuaW5kZXgpIHtcbiAgICAgICAgICAgIHRoaXMuZHJhd1JhbmdlLmNvdW50ID0gTWF0aC5tYXgodGhpcy5kcmF3UmFuZ2UuY291bnQsIGF0dHIuY291bnQpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgdXBkYXRlQXR0cmlidXRlKGF0dHIpIHtcbiAgICAgICAgaWYgKHRoaXMuZ2xTdGF0ZS5ib3VuZEJ1ZmZlciAhPT0gYXR0ci5idWZmZXIpIHtcbiAgICAgICAgICAgIHRoaXMuZ2wuYmluZEJ1ZmZlcihhdHRyLnRhcmdldCwgYXR0ci5idWZmZXIpO1xuICAgICAgICAgICAgdGhpcy5nbFN0YXRlLmJvdW5kQnVmZmVyID0gYXR0ci5idWZmZXI7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5nbC5idWZmZXJEYXRhKGF0dHIudGFyZ2V0LCBhdHRyLmRhdGEsIHRoaXMuZ2wuU1RBVElDX0RSQVcpO1xuICAgICAgICBhdHRyLm5lZWRzVXBkYXRlID0gZmFsc2U7XG4gICAgfVxuXG4gICAgc2V0SW5kZXgodmFsdWUpIHtcbiAgICAgICAgdGhpcy5hZGRBdHRyaWJ1dGUoJ2luZGV4JywgdmFsdWUpO1xuICAgIH1cblxuICAgIHNldERyYXdSYW5nZShzdGFydCwgY291bnQpIHtcbiAgICAgICAgdGhpcy5kcmF3UmFuZ2Uuc3RhcnQgPSBzdGFydDtcbiAgICAgICAgdGhpcy5kcmF3UmFuZ2UuY291bnQgPSBjb3VudDtcbiAgICB9XG5cbiAgICBzZXRJbnN0YW5jZWRDb3VudCh2YWx1ZSkge1xuICAgICAgICB0aGlzLmluc3RhbmNlZENvdW50ID0gdmFsdWU7XG4gICAgfVxuXG4gICAgY3JlYXRlVkFPKHByb2dyYW0pIHtcbiAgICAgICAgdGhpcy5WQU9zW3Byb2dyYW0uYXR0cmlidXRlT3JkZXJdID0gdGhpcy5nbC5yZW5kZXJlci5jcmVhdGVWZXJ0ZXhBcnJheSgpO1xuICAgICAgICB0aGlzLmdsLnJlbmRlcmVyLmJpbmRWZXJ0ZXhBcnJheSh0aGlzLlZBT3NbcHJvZ3JhbS5hdHRyaWJ1dGVPcmRlcl0pO1xuICAgICAgICB0aGlzLmJpbmRBdHRyaWJ1dGVzKHByb2dyYW0pO1xuICAgIH1cblxuICAgIGJpbmRBdHRyaWJ1dGVzKHByb2dyYW0pIHtcbiAgICAgICAgLy8gTGluayBhbGwgYXR0cmlidXRlcyB0byBwcm9ncmFtIHVzaW5nIGdsLnZlcnRleEF0dHJpYlBvaW50ZXJcbiAgICAgICAgcHJvZ3JhbS5hdHRyaWJ1dGVMb2NhdGlvbnMuZm9yRWFjaCgobG9jYXRpb24sIHsgbmFtZSwgdHlwZSB9KSA9PiB7XG4gICAgICAgICAgICAvLyBJZiBnZW9tZXRyeSBtaXNzaW5nIGEgcmVxdWlyZWQgc2hhZGVyIGF0dHJpYnV0ZVxuICAgICAgICAgICAgaWYgKCF0aGlzLmF0dHJpYnV0ZXNbbmFtZV0pIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYGFjdGl2ZSBhdHRyaWJ1dGUgJHtuYW1lfSBub3QgYmVpbmcgc3VwcGxpZWRgKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IGF0dHIgPSB0aGlzLmF0dHJpYnV0ZXNbbmFtZV07XG5cbiAgICAgICAgICAgIHRoaXMuZ2wuYmluZEJ1ZmZlcihhdHRyLnRhcmdldCwgYXR0ci5idWZmZXIpO1xuICAgICAgICAgICAgdGhpcy5nbFN0YXRlLmJvdW5kQnVmZmVyID0gYXR0ci5idWZmZXI7XG5cbiAgICAgICAgICAgIC8vIEZvciBtYXRyaXggYXR0cmlidXRlcywgYnVmZmVyIG5lZWRzIHRvIGJlIGRlZmluZWQgcGVyIGNvbHVtblxuICAgICAgICAgICAgbGV0IG51bUxvYyA9IDE7XG4gICAgICAgICAgICBpZiAodHlwZSA9PT0gMzU2NzQpIG51bUxvYyA9IDI7IC8vIG1hdDJcbiAgICAgICAgICAgIGlmICh0eXBlID09PSAzNTY3NSkgbnVtTG9jID0gMzsgLy8gbWF0M1xuICAgICAgICAgICAgaWYgKHR5cGUgPT09IDM1Njc2KSBudW1Mb2MgPSA0OyAvLyBtYXQ0XG5cbiAgICAgICAgICAgIGNvbnN0IHNpemUgPSBhdHRyLnNpemUgLyBudW1Mb2M7XG4gICAgICAgICAgICBjb25zdCBzdHJpZGUgPSBudW1Mb2MgPT09IDEgPyAwIDogbnVtTG9jICogbnVtTG9jICogbnVtTG9jO1xuICAgICAgICAgICAgY29uc3Qgb2Zmc2V0ID0gbnVtTG9jID09PSAxID8gMCA6IG51bUxvYyAqIG51bUxvYztcblxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBudW1Mb2M7IGkrKykge1xuICAgICAgICAgICAgICAgIHRoaXMuZ2wudmVydGV4QXR0cmliUG9pbnRlcihsb2NhdGlvbiArIGksIHNpemUsIGF0dHIudHlwZSwgYXR0ci5ub3JtYWxpemVkLCBhdHRyLnN0cmlkZSArIHN0cmlkZSwgYXR0ci5vZmZzZXQgKyBpICogb2Zmc2V0KTtcbiAgICAgICAgICAgICAgICB0aGlzLmdsLmVuYWJsZVZlcnRleEF0dHJpYkFycmF5KGxvY2F0aW9uICsgaSk7XG5cbiAgICAgICAgICAgICAgICAvLyBGb3IgaW5zdGFuY2VkIGF0dHJpYnV0ZXMsIGRpdmlzb3IgbmVlZHMgdG8gYmUgc2V0LlxuICAgICAgICAgICAgICAgIC8vIEZvciBmaXJlZm94LCBuZWVkIHRvIHNldCBiYWNrIHRvIDAgaWYgbm9uLWluc3RhbmNlZCBkcmF3biBhZnRlciBpbnN0YW5jZWQuIEVsc2Ugd29uJ3QgcmVuZGVyXG4gICAgICAgICAgICAgICAgdGhpcy5nbC5yZW5kZXJlci52ZXJ0ZXhBdHRyaWJEaXZpc29yKGxvY2F0aW9uICsgaSwgYXR0ci5kaXZpc29yKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gQmluZCBpbmRpY2VzIGlmIGdlb21ldHJ5IGluZGV4ZWRcbiAgICAgICAgaWYgKHRoaXMuYXR0cmlidXRlcy5pbmRleCkgdGhpcy5nbC5iaW5kQnVmZmVyKHRoaXMuZ2wuRUxFTUVOVF9BUlJBWV9CVUZGRVIsIHRoaXMuYXR0cmlidXRlcy5pbmRleC5idWZmZXIpO1xuICAgIH1cblxuICAgIGRyYXcoeyBwcm9ncmFtLCBtb2RlID0gdGhpcy5nbC5UUklBTkdMRVMgfSkge1xuICAgICAgICBpZiAodGhpcy5nbC5yZW5kZXJlci5jdXJyZW50R2VvbWV0cnkgIT09IGAke3RoaXMuaWR9XyR7cHJvZ3JhbS5hdHRyaWJ1dGVPcmRlcn1gKSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMuVkFPc1twcm9ncmFtLmF0dHJpYnV0ZU9yZGVyXSkgdGhpcy5jcmVhdGVWQU8ocHJvZ3JhbSk7XG4gICAgICAgICAgICB0aGlzLmdsLnJlbmRlcmVyLmJpbmRWZXJ0ZXhBcnJheSh0aGlzLlZBT3NbcHJvZ3JhbS5hdHRyaWJ1dGVPcmRlcl0pO1xuICAgICAgICAgICAgdGhpcy5nbC5yZW5kZXJlci5jdXJyZW50R2VvbWV0cnkgPSBgJHt0aGlzLmlkfV8ke3Byb2dyYW0uYXR0cmlidXRlT3JkZXJ9YDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENoZWNrIGlmIGFueSBhdHRyaWJ1dGVzIG5lZWQgdXBkYXRpbmdcbiAgICAgICAgcHJvZ3JhbS5hdHRyaWJ1dGVMb2NhdGlvbnMuZm9yRWFjaCgobG9jYXRpb24sIHsgbmFtZSB9KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBhdHRyID0gdGhpcy5hdHRyaWJ1dGVzW25hbWVdO1xuICAgICAgICAgICAgaWYgKGF0dHIubmVlZHNVcGRhdGUpIHRoaXMudXBkYXRlQXR0cmlidXRlKGF0dHIpO1xuICAgICAgICB9KTtcblxuICAgICAgICBpZiAodGhpcy5pc0luc3RhbmNlZCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuYXR0cmlidXRlcy5pbmRleCkge1xuICAgICAgICAgICAgICAgIHRoaXMuZ2wucmVuZGVyZXIuZHJhd0VsZW1lbnRzSW5zdGFuY2VkKFxuICAgICAgICAgICAgICAgICAgICBtb2RlLFxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRyYXdSYW5nZS5jb3VudCxcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hdHRyaWJ1dGVzLmluZGV4LnR5cGUsXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYXR0cmlidXRlcy5pbmRleC5vZmZzZXQgKyB0aGlzLmRyYXdSYW5nZS5zdGFydCAqIDIsXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW5zdGFuY2VkQ291bnRcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmdsLnJlbmRlcmVyLmRyYXdBcnJheXNJbnN0YW5jZWQobW9kZSwgdGhpcy5kcmF3UmFuZ2Uuc3RhcnQsIHRoaXMuZHJhd1JhbmdlLmNvdW50LCB0aGlzLmluc3RhbmNlZENvdW50KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmF0dHJpYnV0ZXMuaW5kZXgpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmdsLmRyYXdFbGVtZW50cyhtb2RlLCB0aGlzLmRyYXdSYW5nZS5jb3VudCwgdGhpcy5hdHRyaWJ1dGVzLmluZGV4LnR5cGUsIHRoaXMuYXR0cmlidXRlcy5pbmRleC5vZmZzZXQgKyB0aGlzLmRyYXdSYW5nZS5zdGFydCAqIDIpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmdsLmRyYXdBcnJheXMobW9kZSwgdGhpcy5kcmF3UmFuZ2Uuc3RhcnQsIHRoaXMuZHJhd1JhbmdlLmNvdW50KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGdldFBvc2l0aW9uQXJyYXkoKSB7XG4gICAgICAgIC8vIFVzZSBwb3NpdGlvbiBidWZmZXIsIG9yIG1pbi9tYXggaWYgYXZhaWxhYmxlXG4gICAgICAgIGNvbnN0IGF0dHIgPSB0aGlzLmF0dHJpYnV0ZXMucG9zaXRpb247XG4gICAgICAgIC8vIGlmIChhdHRyLm1pbikgcmV0dXJuIFsuLi5hdHRyLm1pbiwgLi4uYXR0ci5tYXhdO1xuICAgICAgICBpZiAoYXR0ci5kYXRhKSByZXR1cm4gYXR0ci5kYXRhO1xuICAgICAgICBpZiAoaXNCb3VuZHNXYXJuZWQpIHJldHVybjtcbiAgICAgICAgY29uc29sZS53YXJuKCdObyBwb3NpdGlvbiBidWZmZXIgZGF0YSBmb3VuZCB0byBjb21wdXRlIGJvdW5kcycpO1xuICAgICAgICByZXR1cm4gKGlzQm91bmRzV2FybmVkID0gdHJ1ZSk7XG4gICAgfVxuXG4gICAgY29tcHV0ZUJvdW5kaW5nQm94KGFycmF5KSB7XG4gICAgICAgIGlmICghYXJyYXkpIGFycmF5ID0gdGhpcy5nZXRQb3NpdGlvbkFycmF5KCk7XG5cbiAgICAgICAgaWYgKCF0aGlzLmJvdW5kcykge1xuICAgICAgICAgICAgdGhpcy5ib3VuZHMgPSB7XG4gICAgICAgICAgICAgICAgbWluOiBuZXcgVmVjMygpLFxuICAgICAgICAgICAgICAgIG1heDogbmV3IFZlYzMoKSxcbiAgICAgICAgICAgICAgICBjZW50ZXI6IG5ldyBWZWMzKCksXG4gICAgICAgICAgICAgICAgc2NhbGU6IG5ldyBWZWMzKCksXG4gICAgICAgICAgICAgICAgcmFkaXVzOiBJbmZpbml0eSxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBtaW4gPSB0aGlzLmJvdW5kcy5taW47XG4gICAgICAgIGNvbnN0IG1heCA9IHRoaXMuYm91bmRzLm1heDtcbiAgICAgICAgY29uc3QgY2VudGVyID0gdGhpcy5ib3VuZHMuY2VudGVyO1xuICAgICAgICBjb25zdCBzY2FsZSA9IHRoaXMuYm91bmRzLnNjYWxlO1xuXG4gICAgICAgIG1pbi5zZXQoK0luZmluaXR5KTtcbiAgICAgICAgbWF4LnNldCgtSW5maW5pdHkpO1xuXG4gICAgICAgIC8vIFRPRE86IHVzZSBvZmZzZXQvc3RyaWRlIGlmIGV4aXN0c1xuICAgICAgICAvLyBUT0RPOiBjaGVjayBzaXplIG9mIHBvc2l0aW9uIChlZyB0cmlhbmdsZSB3aXRoIFZlYzIpXG4gICAgICAgIGZvciAobGV0IGkgPSAwLCBsID0gYXJyYXkubGVuZ3RoOyBpIDwgbDsgaSArPSAzKSB7XG4gICAgICAgICAgICBjb25zdCB4ID0gYXJyYXlbaV07XG4gICAgICAgICAgICBjb25zdCB5ID0gYXJyYXlbaSArIDFdO1xuICAgICAgICAgICAgY29uc3QgeiA9IGFycmF5W2kgKyAyXTtcblxuICAgICAgICAgICAgbWluLnggPSBNYXRoLm1pbih4LCBtaW4ueCk7XG4gICAgICAgICAgICBtaW4ueSA9IE1hdGgubWluKHksIG1pbi55KTtcbiAgICAgICAgICAgIG1pbi56ID0gTWF0aC5taW4oeiwgbWluLnopO1xuXG4gICAgICAgICAgICBtYXgueCA9IE1hdGgubWF4KHgsIG1heC54KTtcbiAgICAgICAgICAgIG1heC55ID0gTWF0aC5tYXgoeSwgbWF4LnkpO1xuICAgICAgICAgICAgbWF4LnogPSBNYXRoLm1heCh6LCBtYXgueik7XG4gICAgICAgIH1cblxuICAgICAgICBzY2FsZS5zdWIobWF4LCBtaW4pO1xuICAgICAgICBjZW50ZXIuYWRkKG1pbiwgbWF4KS5kaXZpZGUoMik7XG4gICAgfVxuXG4gICAgY29tcHV0ZUJvdW5kaW5nU3BoZXJlKGFycmF5KSB7XG4gICAgICAgIGlmICghYXJyYXkpIGFycmF5ID0gdGhpcy5nZXRQb3NpdGlvbkFycmF5KCk7XG4gICAgICAgIGlmICghdGhpcy5ib3VuZHMpIHRoaXMuY29tcHV0ZUJvdW5kaW5nQm94KGFycmF5KTtcblxuICAgICAgICBsZXQgbWF4UmFkaXVzU3EgPSAwO1xuICAgICAgICBmb3IgKGxldCBpID0gMCwgbCA9IGFycmF5Lmxlbmd0aDsgaSA8IGw7IGkgKz0gMykge1xuICAgICAgICAgICAgdGVtcFZlYzMuZnJvbUFycmF5KGFycmF5LCBpKTtcbiAgICAgICAgICAgIG1heFJhZGl1c1NxID0gTWF0aC5tYXgobWF4UmFkaXVzU3EsIHRoaXMuYm91bmRzLmNlbnRlci5zcXVhcmVkRGlzdGFuY2UodGVtcFZlYzMpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuYm91bmRzLnJhZGl1cyA9IE1hdGguc3FydChtYXhSYWRpdXNTcSk7XG4gICAgfVxuXG4gICAgcmVtb3ZlKCkge1xuICAgICAgICBpZiAodGhpcy52YW8pIHRoaXMuZ2wucmVuZGVyZXIuZGVsZXRlVmVydGV4QXJyYXkodGhpcy52YW8pO1xuICAgICAgICBmb3IgKGxldCBrZXkgaW4gdGhpcy5hdHRyaWJ1dGVzKSB7XG4gICAgICAgICAgICB0aGlzLmdsLmRlbGV0ZUJ1ZmZlcih0aGlzLmF0dHJpYnV0ZXNba2V5XS5idWZmZXIpO1xuICAgICAgICAgICAgZGVsZXRlIHRoaXMuYXR0cmlidXRlc1trZXldO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgVHJhbnNmb3JtIH0gZnJvbSAnLi9UcmFuc2Zvcm0uanMnO1xuaW1wb3J0IHsgTWF0MyB9IGZyb20gJy4uL21hdGgvTWF0My5qcyc7XG5pbXBvcnQgeyBNYXQ0IH0gZnJvbSAnLi4vbWF0aC9NYXQ0LmpzJztcblxubGV0IElEID0gMDtcblxuZXhwb3J0IGNsYXNzIE1lc2ggZXh0ZW5kcyBUcmFuc2Zvcm0ge1xuICAgIGNvbnN0cnVjdG9yKGdsLCB7IGdlb21ldHJ5LCBwcm9ncmFtLCBtb2RlID0gZ2wuVFJJQU5HTEVTLCBmcnVzdHVtQ3VsbGVkID0gdHJ1ZSwgcmVuZGVyT3JkZXIgPSAwIH0gPSB7fSkge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICBpZiAoIWdsLmNhbnZhcykgY29uc29sZS5lcnJvcignZ2wgbm90IHBhc3NlZCBhcyBmaXJzdCBhcmd1bWVudCB0byBNZXNoJyk7XG4gICAgICAgIHRoaXMuZ2wgPSBnbDtcbiAgICAgICAgdGhpcy5pZCA9IElEKys7XG4gICAgICAgIHRoaXMuZ2VvbWV0cnkgPSBnZW9tZXRyeTtcbiAgICAgICAgdGhpcy5wcm9ncmFtID0gcHJvZ3JhbTtcbiAgICAgICAgdGhpcy5tb2RlID0gbW9kZTtcblxuICAgICAgICAvLyBVc2VkIHRvIHNraXAgZnJ1c3R1bSBjdWxsaW5nXG4gICAgICAgIHRoaXMuZnJ1c3R1bUN1bGxlZCA9IGZydXN0dW1DdWxsZWQ7XG5cbiAgICAgICAgLy8gT3ZlcnJpZGUgc29ydGluZyB0byBmb3JjZSBhbiBvcmRlclxuICAgICAgICB0aGlzLnJlbmRlck9yZGVyID0gcmVuZGVyT3JkZXI7XG4gICAgICAgIHRoaXMubW9kZWxWaWV3TWF0cml4ID0gbmV3IE1hdDQoKTtcbiAgICAgICAgdGhpcy5ub3JtYWxNYXRyaXggPSBuZXcgTWF0MygpO1xuICAgICAgICB0aGlzLmJlZm9yZVJlbmRlckNhbGxiYWNrcyA9IFtdO1xuICAgICAgICB0aGlzLmFmdGVyUmVuZGVyQ2FsbGJhY2tzID0gW107XG4gICAgfVxuXG4gICAgb25CZWZvcmVSZW5kZXIoZikge1xuICAgICAgICB0aGlzLmJlZm9yZVJlbmRlckNhbGxiYWNrcy5wdXNoKGYpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBvbkFmdGVyUmVuZGVyKGYpIHtcbiAgICAgICAgdGhpcy5hZnRlclJlbmRlckNhbGxiYWNrcy5wdXNoKGYpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBkcmF3KHsgY2FtZXJhLCBvdmVycmlkZVByb2dyYW0gfSA9IHt9KSB7XG4gICAgICAgIHRoaXMuYmVmb3JlUmVuZGVyQ2FsbGJhY2tzLmZvckVhY2goKGYpID0+IGYgJiYgZih7IG1lc2g6IHRoaXMsIGNhbWVyYSB9KSk7XG4gICAgICAgIGNvbnN0IHVzZWRQcm9ncmFtID0gb3ZlcnJpZGVQcm9ncmFtIHx8IHRoaXMucHJvZ3JhbTtcbiAgICAgICAgaWYgKGNhbWVyYSkge1xuICAgICAgICAgICAgLy8gQWRkIGVtcHR5IG1hdHJpeCB1bmlmb3JtcyB0byBwcm9ncmFtIGlmIHVuc2V0XG4gICAgICAgICAgICBpZiAoIXVzZWRQcm9ncmFtLnVuaWZvcm1zLm1vZGVsTWF0cml4KSB7XG4gICAgICAgICAgICAgICAgT2JqZWN0LmFzc2lnbih1c2VkUHJvZ3JhbS51bmlmb3Jtcywge1xuICAgICAgICAgICAgICAgICAgICBtb2RlbE1hdHJpeDogeyB2YWx1ZTogbnVsbCB9LFxuICAgICAgICAgICAgICAgICAgICB2aWV3TWF0cml4OiB7IHZhbHVlOiBudWxsIH0sXG4gICAgICAgICAgICAgICAgICAgIG1vZGVsVmlld01hdHJpeDogeyB2YWx1ZTogbnVsbCB9LFxuICAgICAgICAgICAgICAgICAgICBub3JtYWxNYXRyaXg6IHsgdmFsdWU6IG51bGwgfSxcbiAgICAgICAgICAgICAgICAgICAgcHJvamVjdGlvbk1hdHJpeDogeyB2YWx1ZTogbnVsbCB9LFxuICAgICAgICAgICAgICAgICAgICBjYW1lcmFQb3NpdGlvbjogeyB2YWx1ZTogbnVsbCB9LFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBTZXQgdGhlIG1hdHJpeCB1bmlmb3Jtc1xuICAgICAgICAgICAgdXNlZFByb2dyYW0udW5pZm9ybXMucHJvamVjdGlvbk1hdHJpeC52YWx1ZSA9IGNhbWVyYS5wcm9qZWN0aW9uTWF0cml4O1xuICAgICAgICAgICAgdXNlZFByb2dyYW0udW5pZm9ybXMuY2FtZXJhUG9zaXRpb24udmFsdWUgPSBjYW1lcmEud29ybGRQb3NpdGlvbjtcbiAgICAgICAgICAgIHVzZWRQcm9ncmFtLnVuaWZvcm1zLnZpZXdNYXRyaXgudmFsdWUgPSBjYW1lcmEudmlld01hdHJpeDtcbiAgICAgICAgICAgIHRoaXMubW9kZWxWaWV3TWF0cml4Lm11bHRpcGx5KGNhbWVyYS52aWV3TWF0cml4LCB0aGlzLndvcmxkTWF0cml4KTtcbiAgICAgICAgICAgIHRoaXMubm9ybWFsTWF0cml4LmdldE5vcm1hbE1hdHJpeCh0aGlzLm1vZGVsVmlld01hdHJpeCk7XG4gICAgICAgICAgICB1c2VkUHJvZ3JhbS51bmlmb3Jtcy5tb2RlbE1hdHJpeC52YWx1ZSA9IHRoaXMud29ybGRNYXRyaXg7XG4gICAgICAgICAgICB1c2VkUHJvZ3JhbS51bmlmb3Jtcy5tb2RlbFZpZXdNYXRyaXgudmFsdWUgPSB0aGlzLm1vZGVsVmlld01hdHJpeDtcbiAgICAgICAgICAgIHVzZWRQcm9ncmFtLnVuaWZvcm1zLm5vcm1hbE1hdHJpeC52YWx1ZSA9IHRoaXMubm9ybWFsTWF0cml4O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gZGV0ZXJtaW5lIGlmIGZhY2VzIG5lZWQgdG8gYmUgZmxpcHBlZCAtIHdoZW4gbWVzaCBzY2FsZWQgbmVnYXRpdmVseVxuICAgICAgICBsZXQgZmxpcEZhY2VzID0gdXNlZFByb2dyYW0uY3VsbEZhY2UgJiYgdGhpcy53b3JsZE1hdHJpeC5kZXRlcm1pbmFudCgpIDwgMDtcbiAgICAgICAgdXNlZFByb2dyYW0udXNlKHsgZmxpcEZhY2VzIH0pO1xuICAgICAgICB0aGlzLmdlb21ldHJ5LmRyYXcoeyBtb2RlOiB0aGlzLm1vZGUsIHByb2dyYW06IHVzZWRQcm9ncmFtIH0pO1xuICAgICAgICB0aGlzLmFmdGVyUmVuZGVyQ2FsbGJhY2tzLmZvckVhY2goKGYpID0+IGYgJiYgZih7IG1lc2g6IHRoaXMsIGNhbWVyYSB9KSk7XG4gICAgfVxufVxuIiwiLy8gVE9ETzogdXBsb2FkIGVtcHR5IHRleHR1cmUgaWYgbnVsbCA/IG1heWJlIG5vdFxuLy8gVE9ETzogdXBsb2FkIGlkZW50aXR5IG1hdHJpeCBpZiBudWxsID9cbi8vIFRPRE86IHNhbXBsZXIgQ3ViZVxuXG5sZXQgSUQgPSAxO1xuXG4vLyBjYWNoZSBvZiB0eXBlZCBhcnJheXMgdXNlZCB0byBmbGF0dGVuIHVuaWZvcm0gYXJyYXlzXG5jb25zdCBhcnJheUNhY2hlRjMyID0ge307XG5cbmV4cG9ydCBjbGFzcyBQcm9ncmFtIHtcbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgZ2wsXG4gICAgICAgIHtcbiAgICAgICAgICAgIHZlcnRleCxcbiAgICAgICAgICAgIGZyYWdtZW50LFxuICAgICAgICAgICAgdW5pZm9ybXMgPSB7fSxcblxuICAgICAgICAgICAgdHJhbnNwYXJlbnQgPSBmYWxzZSxcbiAgICAgICAgICAgIGN1bGxGYWNlID0gZ2wuQkFDSyxcbiAgICAgICAgICAgIGZyb250RmFjZSA9IGdsLkNDVyxcbiAgICAgICAgICAgIGRlcHRoVGVzdCA9IHRydWUsXG4gICAgICAgICAgICBkZXB0aFdyaXRlID0gdHJ1ZSxcbiAgICAgICAgICAgIGRlcHRoRnVuYyA9IGdsLkxFU1MsXG4gICAgICAgIH0gPSB7fVxuICAgICkge1xuICAgICAgICBpZiAoIWdsLmNhbnZhcykgY29uc29sZS5lcnJvcignZ2wgbm90IHBhc3NlZCBhcyBmaXN0IGFyZ3VtZW50IHRvIFByb2dyYW0nKTtcbiAgICAgICAgdGhpcy5nbCA9IGdsO1xuICAgICAgICB0aGlzLnVuaWZvcm1zID0gdW5pZm9ybXM7XG4gICAgICAgIHRoaXMuaWQgPSBJRCsrO1xuXG4gICAgICAgIGlmICghdmVydGV4KSBjb25zb2xlLndhcm4oJ3ZlcnRleCBzaGFkZXIgbm90IHN1cHBsaWVkJyk7XG4gICAgICAgIGlmICghZnJhZ21lbnQpIGNvbnNvbGUud2FybignZnJhZ21lbnQgc2hhZGVyIG5vdCBzdXBwbGllZCcpO1xuXG4gICAgICAgIC8vIFN0b3JlIHByb2dyYW0gc3RhdGVcbiAgICAgICAgdGhpcy50cmFuc3BhcmVudCA9IHRyYW5zcGFyZW50O1xuICAgICAgICB0aGlzLmN1bGxGYWNlID0gY3VsbEZhY2U7XG4gICAgICAgIHRoaXMuZnJvbnRGYWNlID0gZnJvbnRGYWNlO1xuICAgICAgICB0aGlzLmRlcHRoVGVzdCA9IGRlcHRoVGVzdDtcbiAgICAgICAgdGhpcy5kZXB0aFdyaXRlID0gZGVwdGhXcml0ZTtcbiAgICAgICAgdGhpcy5kZXB0aEZ1bmMgPSBkZXB0aEZ1bmM7XG4gICAgICAgIHRoaXMuYmxlbmRGdW5jID0ge307XG4gICAgICAgIHRoaXMuYmxlbmRFcXVhdGlvbiA9IHt9O1xuICAgICAgICB0aGlzLnVuaWZvcm1Mb2NhdGlvbnMgPSBuZXcgTWFwKCk7XG4gICAgICAgIHRoaXMuYXR0cmlidXRlTG9jYXRpb25zID0gbmV3IE1hcCgpO1xuXG4gICAgICAgIC8vIHNldCBkZWZhdWx0IGJsZW5kRnVuYyBpZiB0cmFuc3BhcmVudCBmbGFnZ2VkXG4gICAgICAgIGlmICh0aGlzLnRyYW5zcGFyZW50ICYmICF0aGlzLmJsZW5kRnVuYy5zcmMpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmdsLnJlbmRlcmVyLnByZW11bHRpcGxpZWRBbHBoYSkgdGhpcy5zZXRCbGVuZEZ1bmModGhpcy5nbC5PTkUsIHRoaXMuZ2wuT05FX01JTlVTX1NSQ19BTFBIQSk7XG4gICAgICAgICAgICBlbHNlIHRoaXMuc2V0QmxlbmRGdW5jKHRoaXMuZ2wuU1JDX0FMUEhBLCB0aGlzLmdsLk9ORV9NSU5VU19TUkNfQUxQSEEpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gY29tcGlsZSB2ZXJ0ZXggc2hhZGVyIGFuZCBsb2cgZXJyb3JzXG4gICAgICAgIGNvbnN0IHZlcnRleFNoYWRlciA9IGdsLmNyZWF0ZVNoYWRlcihnbC5WRVJURVhfU0hBREVSKTtcbiAgICAgICAgZ2wuc2hhZGVyU291cmNlKHZlcnRleFNoYWRlciwgdmVydGV4KTtcbiAgICAgICAgZ2wuY29tcGlsZVNoYWRlcih2ZXJ0ZXhTaGFkZXIpO1xuICAgICAgICBpZiAoZ2wuZ2V0U2hhZGVySW5mb0xvZyh2ZXJ0ZXhTaGFkZXIpICE9PSAnJykge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGAke2dsLmdldFNoYWRlckluZm9Mb2codmVydGV4U2hhZGVyKX1cXG5WZXJ0ZXggU2hhZGVyXFxuJHthZGRMaW5lTnVtYmVycyh2ZXJ0ZXgpfWApO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gY29tcGlsZSBmcmFnbWVudCBzaGFkZXIgYW5kIGxvZyBlcnJvcnNcbiAgICAgICAgY29uc3QgZnJhZ21lbnRTaGFkZXIgPSBnbC5jcmVhdGVTaGFkZXIoZ2wuRlJBR01FTlRfU0hBREVSKTtcbiAgICAgICAgZ2wuc2hhZGVyU291cmNlKGZyYWdtZW50U2hhZGVyLCBmcmFnbWVudCk7XG4gICAgICAgIGdsLmNvbXBpbGVTaGFkZXIoZnJhZ21lbnRTaGFkZXIpO1xuICAgICAgICBpZiAoZ2wuZ2V0U2hhZGVySW5mb0xvZyhmcmFnbWVudFNoYWRlcikgIT09ICcnKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYCR7Z2wuZ2V0U2hhZGVySW5mb0xvZyhmcmFnbWVudFNoYWRlcil9XFxuRnJhZ21lbnQgU2hhZGVyXFxuJHthZGRMaW5lTnVtYmVycyhmcmFnbWVudCl9YCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBjb21waWxlIHByb2dyYW0gYW5kIGxvZyBlcnJvcnNcbiAgICAgICAgdGhpcy5wcm9ncmFtID0gZ2wuY3JlYXRlUHJvZ3JhbSgpO1xuICAgICAgICBnbC5hdHRhY2hTaGFkZXIodGhpcy5wcm9ncmFtLCB2ZXJ0ZXhTaGFkZXIpO1xuICAgICAgICBnbC5hdHRhY2hTaGFkZXIodGhpcy5wcm9ncmFtLCBmcmFnbWVudFNoYWRlcik7XG4gICAgICAgIGdsLmxpbmtQcm9ncmFtKHRoaXMucHJvZ3JhbSk7XG4gICAgICAgIGlmICghZ2wuZ2V0UHJvZ3JhbVBhcmFtZXRlcih0aGlzLnByb2dyYW0sIGdsLkxJTktfU1RBVFVTKSkge1xuICAgICAgICAgICAgcmV0dXJuIGNvbnNvbGUud2FybihnbC5nZXRQcm9ncmFtSW5mb0xvZyh0aGlzLnByb2dyYW0pKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFJlbW92ZSBzaGFkZXIgb25jZSBsaW5rZWRcbiAgICAgICAgZ2wuZGVsZXRlU2hhZGVyKHZlcnRleFNoYWRlcik7XG4gICAgICAgIGdsLmRlbGV0ZVNoYWRlcihmcmFnbWVudFNoYWRlcik7XG5cbiAgICAgICAgLy8gR2V0IGFjdGl2ZSB1bmlmb3JtIGxvY2F0aW9uc1xuICAgICAgICBsZXQgbnVtVW5pZm9ybXMgPSBnbC5nZXRQcm9ncmFtUGFyYW1ldGVyKHRoaXMucHJvZ3JhbSwgZ2wuQUNUSVZFX1VOSUZPUk1TKTtcbiAgICAgICAgZm9yIChsZXQgdUluZGV4ID0gMDsgdUluZGV4IDwgbnVtVW5pZm9ybXM7IHVJbmRleCsrKSB7XG4gICAgICAgICAgICBsZXQgdW5pZm9ybSA9IGdsLmdldEFjdGl2ZVVuaWZvcm0odGhpcy5wcm9ncmFtLCB1SW5kZXgpO1xuICAgICAgICAgICAgdGhpcy51bmlmb3JtTG9jYXRpb25zLnNldCh1bmlmb3JtLCBnbC5nZXRVbmlmb3JtTG9jYXRpb24odGhpcy5wcm9ncmFtLCB1bmlmb3JtLm5hbWUpKTtcblxuICAgICAgICAgICAgLy8gc3BsaXQgdW5pZm9ybXMnIG5hbWVzIHRvIHNlcGFyYXRlIGFycmF5IGFuZCBzdHJ1Y3QgZGVjbGFyYXRpb25zXG4gICAgICAgICAgICBjb25zdCBzcGxpdCA9IHVuaWZvcm0ubmFtZS5tYXRjaCgvKFxcdyspL2cpO1xuXG4gICAgICAgICAgICB1bmlmb3JtLnVuaWZvcm1OYW1lID0gc3BsaXRbMF07XG5cbiAgICAgICAgICAgIGlmIChzcGxpdC5sZW5ndGggPT09IDMpIHtcbiAgICAgICAgICAgICAgICB1bmlmb3JtLmlzU3RydWN0QXJyYXkgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHVuaWZvcm0uc3RydWN0SW5kZXggPSBOdW1iZXIoc3BsaXRbMV0pO1xuICAgICAgICAgICAgICAgIHVuaWZvcm0uc3RydWN0UHJvcGVydHkgPSBzcGxpdFsyXTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoc3BsaXQubGVuZ3RoID09PSAyICYmIGlzTmFOKE51bWJlcihzcGxpdFsxXSkpKSB7XG4gICAgICAgICAgICAgICAgdW5pZm9ybS5pc1N0cnVjdCA9IHRydWU7XG4gICAgICAgICAgICAgICAgdW5pZm9ybS5zdHJ1Y3RQcm9wZXJ0eSA9IHNwbGl0WzFdO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gR2V0IGFjdGl2ZSBhdHRyaWJ1dGUgbG9jYXRpb25zXG4gICAgICAgIGNvbnN0IGxvY2F0aW9ucyA9IFtdO1xuICAgICAgICBjb25zdCBudW1BdHRyaWJzID0gZ2wuZ2V0UHJvZ3JhbVBhcmFtZXRlcih0aGlzLnByb2dyYW0sIGdsLkFDVElWRV9BVFRSSUJVVEVTKTtcbiAgICAgICAgZm9yIChsZXQgYUluZGV4ID0gMDsgYUluZGV4IDwgbnVtQXR0cmliczsgYUluZGV4KyspIHtcbiAgICAgICAgICAgIGNvbnN0IGF0dHJpYnV0ZSA9IGdsLmdldEFjdGl2ZUF0dHJpYih0aGlzLnByb2dyYW0sIGFJbmRleCk7XG4gICAgICAgICAgICBjb25zdCBsb2NhdGlvbiA9IGdsLmdldEF0dHJpYkxvY2F0aW9uKHRoaXMucHJvZ3JhbSwgYXR0cmlidXRlLm5hbWUpO1xuICAgICAgICAgICAgbG9jYXRpb25zW2xvY2F0aW9uXSA9IGF0dHJpYnV0ZS5uYW1lO1xuICAgICAgICAgICAgdGhpcy5hdHRyaWJ1dGVMb2NhdGlvbnMuc2V0KGF0dHJpYnV0ZSwgbG9jYXRpb24pO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuYXR0cmlidXRlT3JkZXIgPSBsb2NhdGlvbnMuam9pbignJyk7XG4gICAgfVxuXG4gICAgc2V0QmxlbmRGdW5jKHNyYywgZHN0LCBzcmNBbHBoYSwgZHN0QWxwaGEpIHtcbiAgICAgICAgdGhpcy5ibGVuZEZ1bmMuc3JjID0gc3JjO1xuICAgICAgICB0aGlzLmJsZW5kRnVuYy5kc3QgPSBkc3Q7XG4gICAgICAgIHRoaXMuYmxlbmRGdW5jLnNyY0FscGhhID0gc3JjQWxwaGE7XG4gICAgICAgIHRoaXMuYmxlbmRGdW5jLmRzdEFscGhhID0gZHN0QWxwaGE7XG4gICAgICAgIGlmIChzcmMpIHRoaXMudHJhbnNwYXJlbnQgPSB0cnVlO1xuICAgIH1cblxuICAgIHNldEJsZW5kRXF1YXRpb24obW9kZVJHQiwgbW9kZUFscGhhKSB7XG4gICAgICAgIHRoaXMuYmxlbmRFcXVhdGlvbi5tb2RlUkdCID0gbW9kZVJHQjtcbiAgICAgICAgdGhpcy5ibGVuZEVxdWF0aW9uLm1vZGVBbHBoYSA9IG1vZGVBbHBoYTtcbiAgICB9XG5cbiAgICBhcHBseVN0YXRlKCkge1xuICAgICAgICBpZiAodGhpcy5kZXB0aFRlc3QpIHRoaXMuZ2wucmVuZGVyZXIuZW5hYmxlKHRoaXMuZ2wuREVQVEhfVEVTVCk7XG4gICAgICAgIGVsc2UgdGhpcy5nbC5yZW5kZXJlci5kaXNhYmxlKHRoaXMuZ2wuREVQVEhfVEVTVCk7XG5cbiAgICAgICAgaWYgKHRoaXMuY3VsbEZhY2UpIHRoaXMuZ2wucmVuZGVyZXIuZW5hYmxlKHRoaXMuZ2wuQ1VMTF9GQUNFKTtcbiAgICAgICAgZWxzZSB0aGlzLmdsLnJlbmRlcmVyLmRpc2FibGUodGhpcy5nbC5DVUxMX0ZBQ0UpO1xuXG4gICAgICAgIGlmICh0aGlzLmJsZW5kRnVuYy5zcmMpIHRoaXMuZ2wucmVuZGVyZXIuZW5hYmxlKHRoaXMuZ2wuQkxFTkQpO1xuICAgICAgICBlbHNlIHRoaXMuZ2wucmVuZGVyZXIuZGlzYWJsZSh0aGlzLmdsLkJMRU5EKTtcblxuICAgICAgICBpZiAodGhpcy5jdWxsRmFjZSkgdGhpcy5nbC5yZW5kZXJlci5zZXRDdWxsRmFjZSh0aGlzLmN1bGxGYWNlKTtcbiAgICAgICAgdGhpcy5nbC5yZW5kZXJlci5zZXRGcm9udEZhY2UodGhpcy5mcm9udEZhY2UpO1xuICAgICAgICB0aGlzLmdsLnJlbmRlcmVyLnNldERlcHRoTWFzayh0aGlzLmRlcHRoV3JpdGUpO1xuICAgICAgICB0aGlzLmdsLnJlbmRlcmVyLnNldERlcHRoRnVuYyh0aGlzLmRlcHRoRnVuYyk7XG4gICAgICAgIGlmICh0aGlzLmJsZW5kRnVuYy5zcmMpXG4gICAgICAgICAgICB0aGlzLmdsLnJlbmRlcmVyLnNldEJsZW5kRnVuYyh0aGlzLmJsZW5kRnVuYy5zcmMsIHRoaXMuYmxlbmRGdW5jLmRzdCwgdGhpcy5ibGVuZEZ1bmMuc3JjQWxwaGEsIHRoaXMuYmxlbmRGdW5jLmRzdEFscGhhKTtcbiAgICAgICAgdGhpcy5nbC5yZW5kZXJlci5zZXRCbGVuZEVxdWF0aW9uKHRoaXMuYmxlbmRFcXVhdGlvbi5tb2RlUkdCLCB0aGlzLmJsZW5kRXF1YXRpb24ubW9kZUFscGhhKTtcbiAgICB9XG5cbiAgICB1c2UoeyBmbGlwRmFjZXMgPSBmYWxzZSB9ID0ge30pIHtcbiAgICAgICAgbGV0IHRleHR1cmVVbml0ID0gLTE7XG4gICAgICAgIGNvbnN0IHByb2dyYW1BY3RpdmUgPSB0aGlzLmdsLnJlbmRlcmVyLmN1cnJlbnRQcm9ncmFtID09PSB0aGlzLmlkO1xuXG4gICAgICAgIC8vIEF2b2lkIGdsIGNhbGwgaWYgcHJvZ3JhbSBhbHJlYWR5IGluIHVzZVxuICAgICAgICBpZiAoIXByb2dyYW1BY3RpdmUpIHtcbiAgICAgICAgICAgIHRoaXMuZ2wudXNlUHJvZ3JhbSh0aGlzLnByb2dyYW0pO1xuICAgICAgICAgICAgdGhpcy5nbC5yZW5kZXJlci5jdXJyZW50UHJvZ3JhbSA9IHRoaXMuaWQ7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBTZXQgb25seSB0aGUgYWN0aXZlIHVuaWZvcm1zIGZvdW5kIGluIHRoZSBzaGFkZXJcbiAgICAgICAgdGhpcy51bmlmb3JtTG9jYXRpb25zLmZvckVhY2goKGxvY2F0aW9uLCBhY3RpdmVVbmlmb3JtKSA9PiB7XG4gICAgICAgICAgICBsZXQgbmFtZSA9IGFjdGl2ZVVuaWZvcm0udW5pZm9ybU5hbWU7XG5cbiAgICAgICAgICAgIC8vIGdldCBzdXBwbGllZCB1bmlmb3JtXG4gICAgICAgICAgICBsZXQgdW5pZm9ybSA9IHRoaXMudW5pZm9ybXNbbmFtZV07XG5cbiAgICAgICAgICAgIC8vIEZvciBzdHJ1Y3RzLCBnZXQgdGhlIHNwZWNpZmljIHByb3BlcnR5IGluc3RlYWQgb2YgdGhlIGVudGlyZSBvYmplY3RcbiAgICAgICAgICAgIGlmIChhY3RpdmVVbmlmb3JtLmlzU3RydWN0KSB7XG4gICAgICAgICAgICAgICAgdW5pZm9ybSA9IHVuaWZvcm1bYWN0aXZlVW5pZm9ybS5zdHJ1Y3RQcm9wZXJ0eV07XG4gICAgICAgICAgICAgICAgbmFtZSArPSBgLiR7YWN0aXZlVW5pZm9ybS5zdHJ1Y3RQcm9wZXJ0eX1gO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGFjdGl2ZVVuaWZvcm0uaXNTdHJ1Y3RBcnJheSkge1xuICAgICAgICAgICAgICAgIHVuaWZvcm0gPSB1bmlmb3JtW2FjdGl2ZVVuaWZvcm0uc3RydWN0SW5kZXhdW2FjdGl2ZVVuaWZvcm0uc3RydWN0UHJvcGVydHldO1xuICAgICAgICAgICAgICAgIG5hbWUgKz0gYFske2FjdGl2ZVVuaWZvcm0uc3RydWN0SW5kZXh9XS4ke2FjdGl2ZVVuaWZvcm0uc3RydWN0UHJvcGVydHl9YDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCF1bmlmb3JtKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHdhcm4oYEFjdGl2ZSB1bmlmb3JtICR7bmFtZX0gaGFzIG5vdCBiZWVuIHN1cHBsaWVkYCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh1bmlmb3JtICYmICh1bmlmb3JtLnZhbHVlID09PSB1bmRlZmluZWQgfHwgdW5pZm9ybS52YWx1ZSA9PT0gbnVsbCkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gd2FybihgJHtuYW1lfSB1bmlmb3JtIGlzIG1pc3NpbmcgYSB2YWx1ZSBwYXJhbWV0ZXJgKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHVuaWZvcm0udmFsdWUudGV4dHVyZSkge1xuICAgICAgICAgICAgICAgIHRleHR1cmVVbml0ID0gdGV4dHVyZVVuaXQgKyAxO1xuXG4gICAgICAgICAgICAgICAgLy8gQ2hlY2sgaWYgdGV4dHVyZSBuZWVkcyB0byBiZSB1cGRhdGVkXG4gICAgICAgICAgICAgICAgdW5pZm9ybS52YWx1ZS51cGRhdGUodGV4dHVyZVVuaXQpO1xuICAgICAgICAgICAgICAgIHJldHVybiBzZXRVbmlmb3JtKHRoaXMuZ2wsIGFjdGl2ZVVuaWZvcm0udHlwZSwgbG9jYXRpb24sIHRleHR1cmVVbml0KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gRm9yIHRleHR1cmUgYXJyYXlzLCBzZXQgdW5pZm9ybSBhcyBhbiBhcnJheSBvZiB0ZXh0dXJlIHVuaXRzIGluc3RlYWQgb2YganVzdCBvbmVcbiAgICAgICAgICAgIGlmICh1bmlmb3JtLnZhbHVlLmxlbmd0aCAmJiB1bmlmb3JtLnZhbHVlWzBdLnRleHR1cmUpIHtcbiAgICAgICAgICAgICAgICBjb25zdCB0ZXh0dXJlVW5pdHMgPSBbXTtcbiAgICAgICAgICAgICAgICB1bmlmb3JtLnZhbHVlLmZvckVhY2goKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRleHR1cmVVbml0ID0gdGV4dHVyZVVuaXQgKyAxO1xuICAgICAgICAgICAgICAgICAgICB2YWx1ZS51cGRhdGUodGV4dHVyZVVuaXQpO1xuICAgICAgICAgICAgICAgICAgICB0ZXh0dXJlVW5pdHMucHVzaCh0ZXh0dXJlVW5pdCk7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gc2V0VW5pZm9ybSh0aGlzLmdsLCBhY3RpdmVVbmlmb3JtLnR5cGUsIGxvY2F0aW9uLCB0ZXh0dXJlVW5pdHMpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBzZXRVbmlmb3JtKHRoaXMuZ2wsIGFjdGl2ZVVuaWZvcm0udHlwZSwgbG9jYXRpb24sIHVuaWZvcm0udmFsdWUpO1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLmFwcGx5U3RhdGUoKTtcbiAgICAgICAgaWYgKGZsaXBGYWNlcykgdGhpcy5nbC5yZW5kZXJlci5zZXRGcm9udEZhY2UodGhpcy5mcm9udEZhY2UgPT09IHRoaXMuZ2wuQ0NXID8gdGhpcy5nbC5DVyA6IHRoaXMuZ2wuQ0NXKTtcbiAgICB9XG5cbiAgICByZW1vdmUoKSB7XG4gICAgICAgIHRoaXMuZ2wuZGVsZXRlUHJvZ3JhbSh0aGlzLnByb2dyYW0pO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gc2V0VW5pZm9ybShnbCwgdHlwZSwgbG9jYXRpb24sIHZhbHVlKSB7XG4gICAgdmFsdWUgPSB2YWx1ZS5sZW5ndGggPyBmbGF0dGVuKHZhbHVlKSA6IHZhbHVlO1xuICAgIGNvbnN0IHNldFZhbHVlID0gZ2wucmVuZGVyZXIuc3RhdGUudW5pZm9ybUxvY2F0aW9ucy5nZXQobG9jYXRpb24pO1xuXG4gICAgLy8gQXZvaWQgcmVkdW5kYW50IHVuaWZvcm0gY29tbWFuZHNcbiAgICBpZiAodmFsdWUubGVuZ3RoKSB7XG4gICAgICAgIGlmIChzZXRWYWx1ZSA9PT0gdW5kZWZpbmVkIHx8IHNldFZhbHVlLmxlbmd0aCAhPT0gdmFsdWUubGVuZ3RoKSB7XG4gICAgICAgICAgICAvLyBjbG9uZSBhcnJheSB0byBzdG9yZSBhcyBjYWNoZVxuICAgICAgICAgICAgZ2wucmVuZGVyZXIuc3RhdGUudW5pZm9ybUxvY2F0aW9ucy5zZXQobG9jYXRpb24sIHZhbHVlLnNsaWNlKDApKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChhcnJheXNFcXVhbChzZXRWYWx1ZSwgdmFsdWUpKSByZXR1cm47XG5cbiAgICAgICAgICAgIC8vIFVwZGF0ZSBjYWNoZWQgYXJyYXkgdmFsdWVzXG4gICAgICAgICAgICBzZXRWYWx1ZS5zZXQgPyBzZXRWYWx1ZS5zZXQodmFsdWUpIDogc2V0QXJyYXkoc2V0VmFsdWUsIHZhbHVlKTtcbiAgICAgICAgICAgIGdsLnJlbmRlcmVyLnN0YXRlLnVuaWZvcm1Mb2NhdGlvbnMuc2V0KGxvY2F0aW9uLCBzZXRWYWx1ZSk7XG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoc2V0VmFsdWUgPT09IHZhbHVlKSByZXR1cm47XG4gICAgICAgIGdsLnJlbmRlcmVyLnN0YXRlLnVuaWZvcm1Mb2NhdGlvbnMuc2V0KGxvY2F0aW9uLCB2YWx1ZSk7XG4gICAgfVxuXG4gICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICAgIGNhc2UgNTEyNjpcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZS5sZW5ndGggPyBnbC51bmlmb3JtMWZ2KGxvY2F0aW9uLCB2YWx1ZSkgOiBnbC51bmlmb3JtMWYobG9jYXRpb24sIHZhbHVlKTsgLy8gRkxPQVRcbiAgICAgICAgY2FzZSAzNTY2NDpcbiAgICAgICAgICAgIHJldHVybiBnbC51bmlmb3JtMmZ2KGxvY2F0aW9uLCB2YWx1ZSk7IC8vIEZMT0FUX1ZFQzJcbiAgICAgICAgY2FzZSAzNTY2NTpcbiAgICAgICAgICAgIHJldHVybiBnbC51bmlmb3JtM2Z2KGxvY2F0aW9uLCB2YWx1ZSk7IC8vIEZMT0FUX1ZFQzNcbiAgICAgICAgY2FzZSAzNTY2NjpcbiAgICAgICAgICAgIHJldHVybiBnbC51bmlmb3JtNGZ2KGxvY2F0aW9uLCB2YWx1ZSk7IC8vIEZMT0FUX1ZFQzRcbiAgICAgICAgY2FzZSAzNTY3MDogLy8gQk9PTFxuICAgICAgICBjYXNlIDUxMjQ6IC8vIElOVFxuICAgICAgICBjYXNlIDM1Njc4OiAvLyBTQU1QTEVSXzJEXG4gICAgICAgIGNhc2UgMzU2ODA6XG4gICAgICAgICAgICByZXR1cm4gdmFsdWUubGVuZ3RoID8gZ2wudW5pZm9ybTFpdihsb2NhdGlvbiwgdmFsdWUpIDogZ2wudW5pZm9ybTFpKGxvY2F0aW9uLCB2YWx1ZSk7IC8vIFNBTVBMRVJfQ1VCRVxuICAgICAgICBjYXNlIDM1NjcxOiAvLyBCT09MX1ZFQzJcbiAgICAgICAgY2FzZSAzNTY2NzpcbiAgICAgICAgICAgIHJldHVybiBnbC51bmlmb3JtMml2KGxvY2F0aW9uLCB2YWx1ZSk7IC8vIElOVF9WRUMyXG4gICAgICAgIGNhc2UgMzU2NzI6IC8vIEJPT0xfVkVDM1xuICAgICAgICBjYXNlIDM1NjY4OlxuICAgICAgICAgICAgcmV0dXJuIGdsLnVuaWZvcm0zaXYobG9jYXRpb24sIHZhbHVlKTsgLy8gSU5UX1ZFQzNcbiAgICAgICAgY2FzZSAzNTY3MzogLy8gQk9PTF9WRUM0XG4gICAgICAgIGNhc2UgMzU2Njk6XG4gICAgICAgICAgICByZXR1cm4gZ2wudW5pZm9ybTRpdihsb2NhdGlvbiwgdmFsdWUpOyAvLyBJTlRfVkVDNFxuICAgICAgICBjYXNlIDM1Njc0OlxuICAgICAgICAgICAgcmV0dXJuIGdsLnVuaWZvcm1NYXRyaXgyZnYobG9jYXRpb24sIGZhbHNlLCB2YWx1ZSk7IC8vIEZMT0FUX01BVDJcbiAgICAgICAgY2FzZSAzNTY3NTpcbiAgICAgICAgICAgIHJldHVybiBnbC51bmlmb3JtTWF0cml4M2Z2KGxvY2F0aW9uLCBmYWxzZSwgdmFsdWUpOyAvLyBGTE9BVF9NQVQzXG4gICAgICAgIGNhc2UgMzU2NzY6XG4gICAgICAgICAgICByZXR1cm4gZ2wudW5pZm9ybU1hdHJpeDRmdihsb2NhdGlvbiwgZmFsc2UsIHZhbHVlKTsgLy8gRkxPQVRfTUFUNFxuICAgIH1cbn1cblxuZnVuY3Rpb24gYWRkTGluZU51bWJlcnMoc3RyaW5nKSB7XG4gICAgbGV0IGxpbmVzID0gc3RyaW5nLnNwbGl0KCdcXG4nKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxpbmVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGxpbmVzW2ldID0gaSArIDEgKyAnOiAnICsgbGluZXNbaV07XG4gICAgfVxuICAgIHJldHVybiBsaW5lcy5qb2luKCdcXG4nKTtcbn1cblxuZnVuY3Rpb24gZmxhdHRlbihhKSB7XG4gICAgY29uc3QgYXJyYXlMZW4gPSBhLmxlbmd0aDtcbiAgICBjb25zdCB2YWx1ZUxlbiA9IGFbMF0ubGVuZ3RoO1xuICAgIGlmICh2YWx1ZUxlbiA9PT0gdW5kZWZpbmVkKSByZXR1cm4gYTtcbiAgICBjb25zdCBsZW5ndGggPSBhcnJheUxlbiAqIHZhbHVlTGVuO1xuICAgIGxldCB2YWx1ZSA9IGFycmF5Q2FjaGVGMzJbbGVuZ3RoXTtcbiAgICBpZiAoIXZhbHVlKSBhcnJheUNhY2hlRjMyW2xlbmd0aF0gPSB2YWx1ZSA9IG5ldyBGbG9hdDMyQXJyYXkobGVuZ3RoKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFycmF5TGVuOyBpKyspIHZhbHVlLnNldChhW2ldLCBpICogdmFsdWVMZW4pO1xuICAgIHJldHVybiB2YWx1ZTtcbn1cblxuZnVuY3Rpb24gYXJyYXlzRXF1YWwoYSwgYikge1xuICAgIGlmIChhLmxlbmd0aCAhPT0gYi5sZW5ndGgpIHJldHVybiBmYWxzZTtcbiAgICBmb3IgKGxldCBpID0gMCwgbCA9IGEubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIGlmIChhW2ldICE9PSBiW2ldKSByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xufVxuXG5mdW5jdGlvbiBzZXRBcnJheShhLCBiKSB7XG4gICAgZm9yIChsZXQgaSA9IDAsIGwgPSBhLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICBhW2ldID0gYltpXTtcbiAgICB9XG59XG5cbmxldCB3YXJuQ291bnQgPSAwO1xuZnVuY3Rpb24gd2FybihtZXNzYWdlKSB7XG4gICAgaWYgKHdhcm5Db3VudCA+IDEwMCkgcmV0dXJuO1xuICAgIGNvbnNvbGUud2FybihtZXNzYWdlKTtcbiAgICB3YXJuQ291bnQrKztcbiAgICBpZiAod2FybkNvdW50ID4gMTAwKSBjb25zb2xlLndhcm4oJ01vcmUgdGhhbiAxMDAgcHJvZ3JhbSB3YXJuaW5ncyAtIHN0b3BwaW5nIGxvZ3MuJyk7XG59XG4iLCIvLyBUT0RPOiBtdWx0aSB0YXJnZXQgcmVuZGVyaW5nXG4vLyBUT0RPOiB0ZXN0IHN0ZW5jaWwgYW5kIGRlcHRoXG4vLyBUT0RPOiBkZXN0cm95XG4vLyBUT0RPOiBibGl0IG9uIHJlc2l6ZT9cbmltcG9ydCB7IFRleHR1cmUgfSBmcm9tICcuL1RleHR1cmUuanMnO1xuXG5leHBvcnQgY2xhc3MgUmVuZGVyVGFyZ2V0IHtcbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgZ2wsXG4gICAgICAgIHtcbiAgICAgICAgICAgIHdpZHRoID0gZ2wuY2FudmFzLndpZHRoLFxuICAgICAgICAgICAgaGVpZ2h0ID0gZ2wuY2FudmFzLmhlaWdodCxcbiAgICAgICAgICAgIHRhcmdldCA9IGdsLkZSQU1FQlVGRkVSLFxuICAgICAgICAgICAgY29sb3IgPSAxLCAvLyBudW1iZXIgb2YgY29sb3IgYXR0YWNobWVudHNcbiAgICAgICAgICAgIGRlcHRoID0gdHJ1ZSxcbiAgICAgICAgICAgIHN0ZW5jaWwgPSBmYWxzZSxcbiAgICAgICAgICAgIGRlcHRoVGV4dHVyZSA9IGZhbHNlLCAvLyBub3RlIC0gc3RlbmNpbCBicmVha3NcbiAgICAgICAgICAgIHdyYXBTID0gZ2wuQ0xBTVBfVE9fRURHRSxcbiAgICAgICAgICAgIHdyYXBUID0gZ2wuQ0xBTVBfVE9fRURHRSxcbiAgICAgICAgICAgIG1pbkZpbHRlciA9IGdsLkxJTkVBUixcbiAgICAgICAgICAgIG1hZ0ZpbHRlciA9IG1pbkZpbHRlcixcbiAgICAgICAgICAgIHR5cGUgPSBnbC5VTlNJR05FRF9CWVRFLFxuICAgICAgICAgICAgZm9ybWF0ID0gZ2wuUkdCQSxcbiAgICAgICAgICAgIGludGVybmFsRm9ybWF0ID0gZm9ybWF0LFxuICAgICAgICAgICAgdW5wYWNrQWxpZ25tZW50LFxuICAgICAgICAgICAgcHJlbXVsdGlwbHlBbHBoYSxcbiAgICAgICAgfSA9IHt9XG4gICAgKSB7XG4gICAgICAgIHRoaXMuZ2wgPSBnbDtcbiAgICAgICAgdGhpcy53aWR0aCA9IHdpZHRoO1xuICAgICAgICB0aGlzLmhlaWdodCA9IGhlaWdodDtcbiAgICAgICAgdGhpcy5kZXB0aCA9IGRlcHRoO1xuICAgICAgICB0aGlzLmJ1ZmZlciA9IHRoaXMuZ2wuY3JlYXRlRnJhbWVidWZmZXIoKTtcbiAgICAgICAgdGhpcy50YXJnZXQgPSB0YXJnZXQ7XG4gICAgICAgIHRoaXMuZ2wuYmluZEZyYW1lYnVmZmVyKHRoaXMudGFyZ2V0LCB0aGlzLmJ1ZmZlcik7XG5cbiAgICAgICAgdGhpcy50ZXh0dXJlcyA9IFtdO1xuICAgICAgICBjb25zdCBkcmF3QnVmZmVycyA9IFtdO1xuXG4gICAgICAgIC8vIGNyZWF0ZSBhbmQgYXR0YWNoIHJlcXVpcmVkIG51bSBvZiBjb2xvciB0ZXh0dXJlc1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNvbG9yOyBpKyspIHtcbiAgICAgICAgICAgIHRoaXMudGV4dHVyZXMucHVzaChcbiAgICAgICAgICAgICAgICBuZXcgVGV4dHVyZShnbCwge1xuICAgICAgICAgICAgICAgICAgICB3aWR0aCxcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0LFxuICAgICAgICAgICAgICAgICAgICB3cmFwUyxcbiAgICAgICAgICAgICAgICAgICAgd3JhcFQsXG4gICAgICAgICAgICAgICAgICAgIG1pbkZpbHRlcixcbiAgICAgICAgICAgICAgICAgICAgbWFnRmlsdGVyLFxuICAgICAgICAgICAgICAgICAgICB0eXBlLFxuICAgICAgICAgICAgICAgICAgICBmb3JtYXQsXG4gICAgICAgICAgICAgICAgICAgIGludGVybmFsRm9ybWF0LFxuICAgICAgICAgICAgICAgICAgICB1bnBhY2tBbGlnbm1lbnQsXG4gICAgICAgICAgICAgICAgICAgIHByZW11bHRpcGx5QWxwaGEsXG4gICAgICAgICAgICAgICAgICAgIGZsaXBZOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgZ2VuZXJhdGVNaXBtYXBzOiBmYWxzZSxcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIHRoaXMudGV4dHVyZXNbaV0udXBkYXRlKCk7XG4gICAgICAgICAgICB0aGlzLmdsLmZyYW1lYnVmZmVyVGV4dHVyZTJEKHRoaXMudGFyZ2V0LCB0aGlzLmdsLkNPTE9SX0FUVEFDSE1FTlQwICsgaSwgdGhpcy5nbC5URVhUVVJFXzJELCB0aGlzLnRleHR1cmVzW2ldLnRleHR1cmUsIDAgLyogbGV2ZWwgKi8pO1xuICAgICAgICAgICAgZHJhd0J1ZmZlcnMucHVzaCh0aGlzLmdsLkNPTE9SX0FUVEFDSE1FTlQwICsgaSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBGb3IgbXVsdGktcmVuZGVyIHRhcmdldHMgc2hhZGVyIGFjY2Vzc1xuICAgICAgICBpZiAoZHJhd0J1ZmZlcnMubGVuZ3RoID4gMSkgdGhpcy5nbC5yZW5kZXJlci5kcmF3QnVmZmVycyhkcmF3QnVmZmVycyk7XG5cbiAgICAgICAgLy8gYWxpYXMgZm9yIG1ham9yaXR5IG9mIHVzZSBjYXNlc1xuICAgICAgICB0aGlzLnRleHR1cmUgPSB0aGlzLnRleHR1cmVzWzBdO1xuXG4gICAgICAgIC8vIG5vdGUgZGVwdGggdGV4dHVyZXMgYnJlYWsgc3RlbmNpbCAtIHNvIGNhbid0IHVzZSB0b2dldGhlclxuICAgICAgICBpZiAoZGVwdGhUZXh0dXJlICYmICh0aGlzLmdsLnJlbmRlcmVyLmlzV2ViZ2wyIHx8IHRoaXMuZ2wucmVuZGVyZXIuZ2V0RXh0ZW5zaW9uKCdXRUJHTF9kZXB0aF90ZXh0dXJlJykpKSB7XG4gICAgICAgICAgICB0aGlzLmRlcHRoVGV4dHVyZSA9IG5ldyBUZXh0dXJlKGdsLCB7XG4gICAgICAgICAgICAgICAgd2lkdGgsXG4gICAgICAgICAgICAgICAgaGVpZ2h0LFxuICAgICAgICAgICAgICAgIG1pbkZpbHRlcjogdGhpcy5nbC5ORUFSRVNULFxuICAgICAgICAgICAgICAgIG1hZ0ZpbHRlcjogdGhpcy5nbC5ORUFSRVNULFxuICAgICAgICAgICAgICAgIGZvcm1hdDogdGhpcy5nbC5ERVBUSF9DT01QT05FTlQsXG4gICAgICAgICAgICAgICAgaW50ZXJuYWxGb3JtYXQ6IGdsLnJlbmRlcmVyLmlzV2ViZ2wyID8gdGhpcy5nbC5ERVBUSF9DT01QT05FTlQxNiA6IHRoaXMuZ2wuREVQVEhfQ09NUE9ORU5ULFxuICAgICAgICAgICAgICAgIHR5cGU6IHRoaXMuZ2wuVU5TSUdORURfSU5ULFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLmRlcHRoVGV4dHVyZS51cGRhdGUoKTtcbiAgICAgICAgICAgIHRoaXMuZ2wuZnJhbWVidWZmZXJUZXh0dXJlMkQodGhpcy50YXJnZXQsIHRoaXMuZ2wuREVQVEhfQVRUQUNITUVOVCwgdGhpcy5nbC5URVhUVVJFXzJELCB0aGlzLmRlcHRoVGV4dHVyZS50ZXh0dXJlLCAwIC8qIGxldmVsICovKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIFJlbmRlciBidWZmZXJzXG4gICAgICAgICAgICBpZiAoZGVwdGggJiYgIXN0ZW5jaWwpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRlcHRoQnVmZmVyID0gdGhpcy5nbC5jcmVhdGVSZW5kZXJidWZmZXIoKTtcbiAgICAgICAgICAgICAgICB0aGlzLmdsLmJpbmRSZW5kZXJidWZmZXIodGhpcy5nbC5SRU5ERVJCVUZGRVIsIHRoaXMuZGVwdGhCdWZmZXIpO1xuICAgICAgICAgICAgICAgIHRoaXMuZ2wucmVuZGVyYnVmZmVyU3RvcmFnZSh0aGlzLmdsLlJFTkRFUkJVRkZFUiwgdGhpcy5nbC5ERVBUSF9DT01QT05FTlQxNiwgd2lkdGgsIGhlaWdodCk7XG4gICAgICAgICAgICAgICAgdGhpcy5nbC5mcmFtZWJ1ZmZlclJlbmRlcmJ1ZmZlcih0aGlzLnRhcmdldCwgdGhpcy5nbC5ERVBUSF9BVFRBQ0hNRU5ULCB0aGlzLmdsLlJFTkRFUkJVRkZFUiwgdGhpcy5kZXB0aEJ1ZmZlcik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChzdGVuY2lsICYmICFkZXB0aCkge1xuICAgICAgICAgICAgICAgIHRoaXMuc3RlbmNpbEJ1ZmZlciA9IHRoaXMuZ2wuY3JlYXRlUmVuZGVyYnVmZmVyKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5nbC5iaW5kUmVuZGVyYnVmZmVyKHRoaXMuZ2wuUkVOREVSQlVGRkVSLCB0aGlzLnN0ZW5jaWxCdWZmZXIpO1xuICAgICAgICAgICAgICAgIHRoaXMuZ2wucmVuZGVyYnVmZmVyU3RvcmFnZSh0aGlzLmdsLlJFTkRFUkJVRkZFUiwgdGhpcy5nbC5TVEVOQ0lMX0lOREVYOCwgd2lkdGgsIGhlaWdodCk7XG4gICAgICAgICAgICAgICAgdGhpcy5nbC5mcmFtZWJ1ZmZlclJlbmRlcmJ1ZmZlcih0aGlzLnRhcmdldCwgdGhpcy5nbC5TVEVOQ0lMX0FUVEFDSE1FTlQsIHRoaXMuZ2wuUkVOREVSQlVGRkVSLCB0aGlzLnN0ZW5jaWxCdWZmZXIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoZGVwdGggJiYgc3RlbmNpbCkge1xuICAgICAgICAgICAgICAgIHRoaXMuZGVwdGhTdGVuY2lsQnVmZmVyID0gdGhpcy5nbC5jcmVhdGVSZW5kZXJidWZmZXIoKTtcbiAgICAgICAgICAgICAgICB0aGlzLmdsLmJpbmRSZW5kZXJidWZmZXIodGhpcy5nbC5SRU5ERVJCVUZGRVIsIHRoaXMuZGVwdGhTdGVuY2lsQnVmZmVyKTtcbiAgICAgICAgICAgICAgICB0aGlzLmdsLnJlbmRlcmJ1ZmZlclN0b3JhZ2UodGhpcy5nbC5SRU5ERVJCVUZGRVIsIHRoaXMuZ2wuREVQVEhfU1RFTkNJTCwgd2lkdGgsIGhlaWdodCk7XG4gICAgICAgICAgICAgICAgdGhpcy5nbC5mcmFtZWJ1ZmZlclJlbmRlcmJ1ZmZlcih0aGlzLnRhcmdldCwgdGhpcy5nbC5ERVBUSF9TVEVOQ0lMX0FUVEFDSE1FTlQsIHRoaXMuZ2wuUkVOREVSQlVGRkVSLCB0aGlzLmRlcHRoU3RlbmNpbEJ1ZmZlcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmdsLmJpbmRGcmFtZWJ1ZmZlcih0aGlzLnRhcmdldCwgbnVsbCk7XG4gICAgfVxuXG4gICAgZGlzcG9zZSgpIHtcbiAgICAgICAgdGhpcy50ZXh0dXJlcy5mb3JFYWNoKCAodGV4dHVyZSkgPT4ge1xuICAgICAgICAgICAgdGV4dHVyZS5kaXNwb3NlKCk7XG4gICAgICAgIH0pXG4gICAgICAgIHRoaXMuZGVwdGhUZXh0dXJlICYmIHRoaXMuZGVwdGhUZXh0dXJlLmRpc3Bvc2UoKTtcbiAgICAgICAgdGhpcy5kZXB0aEJ1ZmZlciAmJiB0aGlzLmdsLmRlbGV0ZVJlbmRlcmJ1ZmZlcih0aGlzLmRlcHRoQnVmZmVyKTtcbiAgICAgICAgdGhpcy5zdGVuY2lsQnVmZmVyICYmIHRoaXMuZ2wuZGVsZXRlUmVuZGVyYnVmZmVyKHRoaXMuc3RlbmNpbEJ1ZmZlcik7XG4gICAgICAgIHRoaXMuZGVwdGhTdGVuY2lsQnVmZmVyICYmIHRoaXMuZ2wuZGVsZXRlUmVuZGVyYnVmZmVyKHRoaXMuZGVwdGhTdGVuY2lsQnVmZmVyKTtcbiAgICAgICAgdGhpcy5nbC5kZWxldGVGcmFtZWJ1ZmZlcih0aGlzLmJ1ZmZlcik7XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgVmVjMyB9IGZyb20gJy4uL21hdGgvVmVjMy5qcyc7XG5cbi8vIFRPRE86IEhhbmRsZSBjb250ZXh0IGxvc3MgaHR0cHM6Ly93d3cua2hyb25vcy5vcmcvd2ViZ2wvd2lraS9IYW5kbGluZ0NvbnRleHRMb3N0XG5cbi8vIE5vdCBhdXRvbWF0aWMgLSBkZXZzIHRvIHVzZSB0aGVzZSBtZXRob2RzIG1hbnVhbGx5XG4vLyBnbC5jb2xvck1hc2soIGNvbG9yTWFzaywgY29sb3JNYXNrLCBjb2xvck1hc2ssIGNvbG9yTWFzayApO1xuLy8gZ2wuY2xlYXJDb2xvciggciwgZywgYiwgYSApO1xuLy8gZ2wuc3RlbmNpbE1hc2soIHN0ZW5jaWxNYXNrICk7XG4vLyBnbC5zdGVuY2lsRnVuYyggc3RlbmNpbEZ1bmMsIHN0ZW5jaWxSZWYsIHN0ZW5jaWxNYXNrICk7XG4vLyBnbC5zdGVuY2lsT3AoIHN0ZW5jaWxGYWlsLCBzdGVuY2lsWkZhaWwsIHN0ZW5jaWxaUGFzcyApO1xuLy8gZ2wuY2xlYXJTdGVuY2lsKCBzdGVuY2lsICk7XG5cbmNvbnN0IHRlbXBWZWMzID0gbmV3IFZlYzMoKTtcbmxldCBJRCA9IDE7XG5cbmV4cG9ydCBjbGFzcyBSZW5kZXJlciB7XG4gICAgY29uc3RydWN0b3Ioe1xuICAgICAgICBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKSxcbiAgICAgICAgd2lkdGggPSAzMDAsXG4gICAgICAgIGhlaWdodCA9IDE1MCxcbiAgICAgICAgZHByID0gMSxcbiAgICAgICAgYWxwaGEgPSBmYWxzZSxcbiAgICAgICAgZGVwdGggPSB0cnVlLFxuICAgICAgICBzdGVuY2lsID0gZmFsc2UsXG4gICAgICAgIGFudGlhbGlhcyA9IGZhbHNlLFxuICAgICAgICBwcmVtdWx0aXBsaWVkQWxwaGEgPSBmYWxzZSxcbiAgICAgICAgcHJlc2VydmVEcmF3aW5nQnVmZmVyID0gZmFsc2UsXG4gICAgICAgIHBvd2VyUHJlZmVyZW5jZSA9ICdkZWZhdWx0JyxcbiAgICAgICAgYXV0b0NsZWFyID0gdHJ1ZSxcbiAgICAgICAgd2ViZ2wgPSAyLFxuICAgIH0gPSB7fSkge1xuICAgICAgICBjb25zdCBhdHRyaWJ1dGVzID0geyBhbHBoYSwgZGVwdGgsIHN0ZW5jaWwsIGFudGlhbGlhcywgcHJlbXVsdGlwbGllZEFscGhhLCBwcmVzZXJ2ZURyYXdpbmdCdWZmZXIsIHBvd2VyUHJlZmVyZW5jZSB9O1xuICAgICAgICB0aGlzLmRwciA9IGRwcjtcbiAgICAgICAgdGhpcy5hbHBoYSA9IGFscGhhO1xuICAgICAgICB0aGlzLmNvbG9yID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5kZXB0aCA9IGRlcHRoO1xuICAgICAgICB0aGlzLnN0ZW5jaWwgPSBzdGVuY2lsO1xuICAgICAgICB0aGlzLnByZW11bHRpcGxpZWRBbHBoYSA9IHByZW11bHRpcGxpZWRBbHBoYTtcbiAgICAgICAgdGhpcy5hdXRvQ2xlYXIgPSBhdXRvQ2xlYXI7XG4gICAgICAgIHRoaXMuaWQgPSBJRCsrO1xuXG4gICAgICAgIC8vIEF0dGVtcHQgV2ViR0wyIHVubGVzcyBmb3JjZWQgdG8gMSwgaWYgbm90IHN1cHBvcnRlZCBmYWxsYmFjayB0byBXZWJHTDFcbiAgICAgICAgdGhpcy5pc1dlYmdsMiA9ICEhdGhpcy5nbDtcbiAgICAgICAgaWYgKCF0aGlzLmdsKSB7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIEB0eXBlIHtPR0xSZW5kZXJpbmdDb250ZXh0fVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzLmdsID0gY2FudmFzLmdldENvbnRleHQoJ3dlYmdsJywgYXR0cmlidXRlcykgfHwgY2FudmFzLmdldENvbnRleHQoJ2V4cGVyaW1lbnRhbC13ZWJnbCcsIGF0dHJpYnV0ZXMpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghdGhpcy5nbCkgY29uc29sZS5lcnJvcigndW5hYmxlIHRvIGNyZWF0ZSB3ZWJnbCBjb250ZXh0Jyk7XG5cbiAgICAgICAgLy8gQXR0YWNoIHJlbmRlcmVyIHRvIGdsIHNvIHRoYXQgYWxsIGNsYXNzZXMgaGF2ZSBhY2Nlc3MgdG8gaW50ZXJuYWwgc3RhdGUgZnVuY3Rpb25zXG4gICAgICAgIHRoaXMuZ2wucmVuZGVyZXIgPSB0aGlzO1xuXG4gICAgICAgIC8vIGluaXRpYWxpc2Ugc2l6ZSB2YWx1ZXNcbiAgICAgICAgdGhpcy5zZXRTaXplKHdpZHRoLCBoZWlnaHQpO1xuXG4gICAgICAgIC8vIGdsIHN0YXRlIHN0b3JlcyB0byBhdm9pZCByZWR1bmRhbnQgY2FsbHMgb24gbWV0aG9kcyB1c2VkIGludGVybmFsbHlcbiAgICAgICAgdGhpcy5zdGF0ZSA9IHt9O1xuICAgICAgICB0aGlzLnN0YXRlLmJsZW5kRnVuYyA9IHsgc3JjOiB0aGlzLmdsLk9ORSwgZHN0OiB0aGlzLmdsLlpFUk8gfTtcbiAgICAgICAgdGhpcy5zdGF0ZS5ibGVuZEVxdWF0aW9uID0geyBtb2RlUkdCOiB0aGlzLmdsLkZVTkNfQUREIH07XG4gICAgICAgIHRoaXMuc3RhdGUuY3VsbEZhY2UgPSBudWxsO1xuICAgICAgICB0aGlzLnN0YXRlLmZyb250RmFjZSA9IHRoaXMuZ2wuQ0NXO1xuICAgICAgICB0aGlzLnN0YXRlLmRlcHRoTWFzayA9IHRydWU7XG4gICAgICAgIHRoaXMuc3RhdGUuZGVwdGhGdW5jID0gdGhpcy5nbC5MRVNTO1xuICAgICAgICB0aGlzLnN0YXRlLnByZW11bHRpcGx5QWxwaGEgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5zdGF0ZS5mbGlwWSA9IGZhbHNlO1xuICAgICAgICB0aGlzLnN0YXRlLnVucGFja0FsaWdubWVudCA9IDQ7XG4gICAgICAgIHRoaXMuc3RhdGUuZnJhbWVidWZmZXIgPSBudWxsO1xuICAgICAgICB0aGlzLnN0YXRlLnZpZXdwb3J0ID0geyB3aWR0aDogbnVsbCwgaGVpZ2h0OiBudWxsIH07XG4gICAgICAgIHRoaXMuc3RhdGUudGV4dHVyZVVuaXRzID0gW107XG4gICAgICAgIHRoaXMuc3RhdGUuYWN0aXZlVGV4dHVyZVVuaXQgPSAwO1xuICAgICAgICB0aGlzLnN0YXRlLmJvdW5kQnVmZmVyID0gbnVsbDtcbiAgICAgICAgdGhpcy5zdGF0ZS51bmlmb3JtTG9jYXRpb25zID0gbmV3IE1hcCgpO1xuXG4gICAgICAgIC8vIHN0b3JlIHJlcXVlc3RlZCBleHRlbnNpb25zXG4gICAgICAgIHRoaXMuZXh0ZW5zaW9ucyA9IHt9O1xuXG4gICAgICAgIC8vIEluaXRpYWxpc2UgZXh0cmEgZm9ybWF0IHR5cGVzXG4gICAgICAgIGlmICh0aGlzLmlzV2ViZ2wyKSB7XG4gICAgICAgICAgICB0aGlzLmdldEV4dGVuc2lvbignRVhUX2NvbG9yX2J1ZmZlcl9mbG9hdCcpO1xuICAgICAgICAgICAgdGhpcy5nZXRFeHRlbnNpb24oJ09FU190ZXh0dXJlX2Zsb2F0X2xpbmVhcicpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5nZXRFeHRlbnNpb24oJ09FU190ZXh0dXJlX2Zsb2F0Jyk7XG4gICAgICAgICAgICB0aGlzLmdldEV4dGVuc2lvbignT0VTX3RleHR1cmVfZmxvYXRfbGluZWFyJyk7XG4gICAgICAgICAgICB0aGlzLmdldEV4dGVuc2lvbignT0VTX3RleHR1cmVfaGFsZl9mbG9hdCcpO1xuICAgICAgICAgICAgdGhpcy5nZXRFeHRlbnNpb24oJ09FU190ZXh0dXJlX2hhbGZfZmxvYXRfbGluZWFyJyk7XG4gICAgICAgICAgICB0aGlzLmdldEV4dGVuc2lvbignT0VTX2VsZW1lbnRfaW5kZXhfdWludCcpO1xuICAgICAgICAgICAgdGhpcy5nZXRFeHRlbnNpb24oJ09FU19zdGFuZGFyZF9kZXJpdmF0aXZlcycpO1xuICAgICAgICAgICAgdGhpcy5nZXRFeHRlbnNpb24oJ0VYVF9zUkdCJyk7XG4gICAgICAgICAgICB0aGlzLmdldEV4dGVuc2lvbignV0VCR0xfZGVwdGhfdGV4dHVyZScpO1xuICAgICAgICAgICAgdGhpcy5nZXRFeHRlbnNpb24oJ1dFQkdMX2RyYXdfYnVmZmVycycpO1xuICAgICAgICAgICAgdGhpcy5nZXRFeHRlbnNpb24oJ1dFQkdMX2NvbG9yX2J1ZmZlcl9mbG9hdCcpO1xuICAgICAgICAgICAgdGhpcy5nZXRFeHRlbnNpb24oJ0VYVF9jb2xvcl9idWZmZXJfaGFsZl9mbG9hdCcpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ3JlYXRlIG1ldGhvZCBhbGlhc2VzIHVzaW5nIGV4dGVuc2lvbiAoV2ViR0wxKSBvciBuYXRpdmUgaWYgYXZhaWxhYmxlIChXZWJHTDIpXG4gICAgICAgIHRoaXMudmVydGV4QXR0cmliRGl2aXNvciA9IHRoaXMuZ2V0RXh0ZW5zaW9uKCdBTkdMRV9pbnN0YW5jZWRfYXJyYXlzJywgJ3ZlcnRleEF0dHJpYkRpdmlzb3InLCAndmVydGV4QXR0cmliRGl2aXNvckFOR0xFJyk7XG4gICAgICAgIHRoaXMuZHJhd0FycmF5c0luc3RhbmNlZCA9IHRoaXMuZ2V0RXh0ZW5zaW9uKCdBTkdMRV9pbnN0YW5jZWRfYXJyYXlzJywgJ2RyYXdBcnJheXNJbnN0YW5jZWQnLCAnZHJhd0FycmF5c0luc3RhbmNlZEFOR0xFJyk7XG4gICAgICAgIHRoaXMuZHJhd0VsZW1lbnRzSW5zdGFuY2VkID0gdGhpcy5nZXRFeHRlbnNpb24oJ0FOR0xFX2luc3RhbmNlZF9hcnJheXMnLCAnZHJhd0VsZW1lbnRzSW5zdGFuY2VkJywgJ2RyYXdFbGVtZW50c0luc3RhbmNlZEFOR0xFJyk7XG4gICAgICAgIHRoaXMuY3JlYXRlVmVydGV4QXJyYXkgPSB0aGlzLmdldEV4dGVuc2lvbignT0VTX3ZlcnRleF9hcnJheV9vYmplY3QnLCAnY3JlYXRlVmVydGV4QXJyYXknLCAnY3JlYXRlVmVydGV4QXJyYXlPRVMnKTtcbiAgICAgICAgdGhpcy5iaW5kVmVydGV4QXJyYXkgPSB0aGlzLmdldEV4dGVuc2lvbignT0VTX3ZlcnRleF9hcnJheV9vYmplY3QnLCAnYmluZFZlcnRleEFycmF5JywgJ2JpbmRWZXJ0ZXhBcnJheU9FUycpO1xuICAgICAgICB0aGlzLmRlbGV0ZVZlcnRleEFycmF5ID0gdGhpcy5nZXRFeHRlbnNpb24oJ09FU192ZXJ0ZXhfYXJyYXlfb2JqZWN0JywgJ2RlbGV0ZVZlcnRleEFycmF5JywgJ2RlbGV0ZVZlcnRleEFycmF5T0VTJyk7XG4gICAgICAgIHRoaXMuZHJhd0J1ZmZlcnMgPSB0aGlzLmdldEV4dGVuc2lvbignV0VCR0xfZHJhd19idWZmZXJzJywgJ2RyYXdCdWZmZXJzJywgJ2RyYXdCdWZmZXJzV0VCR0wnKTtcblxuICAgICAgICAvLyBTdG9yZSBkZXZpY2UgcGFyYW1ldGVyc1xuICAgICAgICB0aGlzLnBhcmFtZXRlcnMgPSB7fTtcbiAgICAgICAgdGhpcy5wYXJhbWV0ZXJzLm1heFRleHR1cmVVbml0cyA9IHRoaXMuZ2wuZ2V0UGFyYW1ldGVyKHRoaXMuZ2wuTUFYX0NPTUJJTkVEX1RFWFRVUkVfSU1BR0VfVU5JVFMpO1xuICAgICAgICB0aGlzLnBhcmFtZXRlcnMubWF4QW5pc290cm9weSA9IHRoaXMuZ2V0RXh0ZW5zaW9uKCdFWFRfdGV4dHVyZV9maWx0ZXJfYW5pc290cm9waWMnKVxuICAgICAgICAgICAgPyB0aGlzLmdsLmdldFBhcmFtZXRlcih0aGlzLmdldEV4dGVuc2lvbignRVhUX3RleHR1cmVfZmlsdGVyX2FuaXNvdHJvcGljJykuTUFYX1RFWFRVUkVfTUFYX0FOSVNPVFJPUFlfRVhUKVxuICAgICAgICAgICAgOiAwO1xuICAgIH1cblxuICAgIHNldFNpemUod2lkdGgsIGhlaWdodCkge1xuICAgICAgICB0aGlzLndpZHRoID0gd2lkdGg7XG4gICAgICAgIHRoaXMuaGVpZ2h0ID0gaGVpZ2h0O1xuXG4gICAgICAgIHRoaXMuZ2wuY2FudmFzLndpZHRoID0gd2lkdGggKiB0aGlzLmRwcjtcbiAgICAgICAgdGhpcy5nbC5jYW52YXMuaGVpZ2h0ID0gaGVpZ2h0ICogdGhpcy5kcHI7XG5cbiAgICAgICAgT2JqZWN0LmFzc2lnbih0aGlzLmdsLmNhbnZhcy5zdHlsZSwge1xuICAgICAgICAgICAgd2lkdGg6IHdpZHRoICsgJ3B4JyxcbiAgICAgICAgICAgIGhlaWdodDogaGVpZ2h0ICsgJ3B4JyxcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgc2V0Vmlld3BvcnQod2lkdGgsIGhlaWdodCkge1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS52aWV3cG9ydC53aWR0aCA9PT0gd2lkdGggJiYgdGhpcy5zdGF0ZS52aWV3cG9ydC5oZWlnaHQgPT09IGhlaWdodCkgcmV0dXJuO1xuICAgICAgICB0aGlzLnN0YXRlLnZpZXdwb3J0LndpZHRoID0gd2lkdGg7XG4gICAgICAgIHRoaXMuc3RhdGUudmlld3BvcnQuaGVpZ2h0ID0gaGVpZ2h0O1xuICAgICAgICB0aGlzLmdsLnZpZXdwb3J0KDAsIDAsIHdpZHRoLCBoZWlnaHQpO1xuICAgIH1cblxuICAgIGVuYWJsZShpZCkge1xuICAgICAgICBpZiAodGhpcy5zdGF0ZVtpZF0gPT09IHRydWUpIHJldHVybjtcbiAgICAgICAgdGhpcy5nbC5lbmFibGUoaWQpO1xuICAgICAgICB0aGlzLnN0YXRlW2lkXSA9IHRydWU7XG4gICAgfVxuXG4gICAgZGlzYWJsZShpZCkge1xuICAgICAgICBpZiAodGhpcy5zdGF0ZVtpZF0gPT09IGZhbHNlKSByZXR1cm47XG4gICAgICAgIHRoaXMuZ2wuZGlzYWJsZShpZCk7XG4gICAgICAgIHRoaXMuc3RhdGVbaWRdID0gZmFsc2U7XG4gICAgfVxuXG4gICAgc2V0QmxlbmRGdW5jKHNyYywgZHN0LCBzcmNBbHBoYSwgZHN0QWxwaGEpIHtcbiAgICAgICAgaWYgKFxuICAgICAgICAgICAgdGhpcy5zdGF0ZS5ibGVuZEZ1bmMuc3JjID09PSBzcmMgJiZcbiAgICAgICAgICAgIHRoaXMuc3RhdGUuYmxlbmRGdW5jLmRzdCA9PT0gZHN0ICYmXG4gICAgICAgICAgICB0aGlzLnN0YXRlLmJsZW5kRnVuYy5zcmNBbHBoYSA9PT0gc3JjQWxwaGEgJiZcbiAgICAgICAgICAgIHRoaXMuc3RhdGUuYmxlbmRGdW5jLmRzdEFscGhhID09PSBkc3RBbHBoYVxuICAgICAgICApXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIHRoaXMuc3RhdGUuYmxlbmRGdW5jLnNyYyA9IHNyYztcbiAgICAgICAgdGhpcy5zdGF0ZS5ibGVuZEZ1bmMuZHN0ID0gZHN0O1xuICAgICAgICB0aGlzLnN0YXRlLmJsZW5kRnVuYy5zcmNBbHBoYSA9IHNyY0FscGhhO1xuICAgICAgICB0aGlzLnN0YXRlLmJsZW5kRnVuYy5kc3RBbHBoYSA9IGRzdEFscGhhO1xuICAgICAgICBpZiAoc3JjQWxwaGEgIT09IHVuZGVmaW5lZCkgdGhpcy5nbC5ibGVuZEZ1bmNTZXBhcmF0ZShzcmMsIGRzdCwgc3JjQWxwaGEsIGRzdEFscGhhKTtcbiAgICAgICAgZWxzZSB0aGlzLmdsLmJsZW5kRnVuYyhzcmMsIGRzdCk7XG4gICAgfVxuXG4gICAgc2V0QmxlbmRFcXVhdGlvbihtb2RlUkdCLCBtb2RlQWxwaGEpIHtcbiAgICAgICAgbW9kZVJHQiA9IG1vZGVSR0IgfHwgdGhpcy5nbC5GVU5DX0FERDtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuYmxlbmRFcXVhdGlvbi5tb2RlUkdCID09PSBtb2RlUkdCICYmIHRoaXMuc3RhdGUuYmxlbmRFcXVhdGlvbi5tb2RlQWxwaGEgPT09IG1vZGVBbHBoYSkgcmV0dXJuO1xuICAgICAgICB0aGlzLnN0YXRlLmJsZW5kRXF1YXRpb24ubW9kZVJHQiA9IG1vZGVSR0I7XG4gICAgICAgIHRoaXMuc3RhdGUuYmxlbmRFcXVhdGlvbi5tb2RlQWxwaGEgPSBtb2RlQWxwaGE7XG4gICAgICAgIGlmIChtb2RlQWxwaGEgIT09IHVuZGVmaW5lZCkgdGhpcy5nbC5ibGVuZEVxdWF0aW9uU2VwYXJhdGUobW9kZVJHQiwgbW9kZUFscGhhKTtcbiAgICAgICAgZWxzZSB0aGlzLmdsLmJsZW5kRXF1YXRpb24obW9kZVJHQik7XG4gICAgfVxuXG4gICAgc2V0Q3VsbEZhY2UodmFsdWUpIHtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuY3VsbEZhY2UgPT09IHZhbHVlKSByZXR1cm47XG4gICAgICAgIHRoaXMuc3RhdGUuY3VsbEZhY2UgPSB2YWx1ZTtcbiAgICAgICAgdGhpcy5nbC5jdWxsRmFjZSh2YWx1ZSk7XG4gICAgfVxuXG4gICAgc2V0RnJvbnRGYWNlKHZhbHVlKSB7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLmZyb250RmFjZSA9PT0gdmFsdWUpIHJldHVybjtcbiAgICAgICAgdGhpcy5zdGF0ZS5mcm9udEZhY2UgPSB2YWx1ZTtcbiAgICAgICAgdGhpcy5nbC5mcm9udEZhY2UodmFsdWUpO1xuICAgIH1cblxuICAgIHNldERlcHRoTWFzayh2YWx1ZSkge1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5kZXB0aE1hc2sgPT09IHZhbHVlKSByZXR1cm47XG4gICAgICAgIHRoaXMuc3RhdGUuZGVwdGhNYXNrID0gdmFsdWU7XG4gICAgICAgIHRoaXMuZ2wuZGVwdGhNYXNrKHZhbHVlKTtcbiAgICB9XG5cbiAgICBzZXREZXB0aEZ1bmModmFsdWUpIHtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuZGVwdGhGdW5jID09PSB2YWx1ZSkgcmV0dXJuO1xuICAgICAgICB0aGlzLnN0YXRlLmRlcHRoRnVuYyA9IHZhbHVlO1xuICAgICAgICB0aGlzLmdsLmRlcHRoRnVuYyh2YWx1ZSk7XG4gICAgfVxuXG4gICAgYWN0aXZlVGV4dHVyZSh2YWx1ZSkge1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5hY3RpdmVUZXh0dXJlVW5pdCA9PT0gdmFsdWUpIHJldHVybjtcbiAgICAgICAgdGhpcy5zdGF0ZS5hY3RpdmVUZXh0dXJlVW5pdCA9IHZhbHVlO1xuICAgICAgICB0aGlzLmdsLmFjdGl2ZVRleHR1cmUodGhpcy5nbC5URVhUVVJFMCArIHZhbHVlKTtcbiAgICB9XG5cbiAgICBiaW5kRnJhbWVidWZmZXIoeyB0YXJnZXQgPSB0aGlzLmdsLkZSQU1FQlVGRkVSLCBidWZmZXIgPSBudWxsIH0gPSB7fSkge1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5mcmFtZWJ1ZmZlciA9PT0gYnVmZmVyKSByZXR1cm47XG4gICAgICAgIHRoaXMuc3RhdGUuZnJhbWVidWZmZXIgPSBidWZmZXI7XG4gICAgICAgIHRoaXMuZ2wuYmluZEZyYW1lYnVmZmVyKHRhcmdldCwgYnVmZmVyKTtcbiAgICB9XG5cbiAgICBnZXRFeHRlbnNpb24oZXh0ZW5zaW9uLCB3ZWJnbDJGdW5jLCBleHRGdW5jKSB7XG4gICAgICAgIC8vIGlmIHdlYmdsMiBmdW5jdGlvbiBzdXBwb3J0ZWQsIHJldHVybiBmdW5jIGJvdW5kIHRvIGdsIGNvbnRleHRcbiAgICAgICAgaWYgKHdlYmdsMkZ1bmMgJiYgdGhpcy5nbFt3ZWJnbDJGdW5jXSkgcmV0dXJuIHRoaXMuZ2xbd2ViZ2wyRnVuY10uYmluZCh0aGlzLmdsKTtcblxuICAgICAgICAvLyBmZXRjaCBleHRlbnNpb24gb25jZSBvbmx5XG4gICAgICAgIGlmICghdGhpcy5leHRlbnNpb25zW2V4dGVuc2lvbl0pIHtcbiAgICAgICAgICAgIHRoaXMuZXh0ZW5zaW9uc1tleHRlbnNpb25dID0gdGhpcy5nbC5nZXRFeHRlbnNpb24oZXh0ZW5zaW9uKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHJldHVybiBleHRlbnNpb24gaWYgbm8gZnVuY3Rpb24gcmVxdWVzdGVkXG4gICAgICAgIGlmICghd2ViZ2wyRnVuYykgcmV0dXJuIHRoaXMuZXh0ZW5zaW9uc1tleHRlbnNpb25dO1xuXG4gICAgICAgIC8vIFJldHVybiBudWxsIGlmIGV4dGVuc2lvbiBub3Qgc3VwcG9ydGVkXG4gICAgICAgIGlmICghdGhpcy5leHRlbnNpb25zW2V4dGVuc2lvbl0pIHJldHVybiBudWxsO1xuXG4gICAgICAgIC8vIHJldHVybiBleHRlbnNpb24gZnVuY3Rpb24sIGJvdW5kIHRvIGV4dGVuc2lvblxuICAgICAgICByZXR1cm4gdGhpcy5leHRlbnNpb25zW2V4dGVuc2lvbl1bZXh0RnVuY10uYmluZCh0aGlzLmV4dGVuc2lvbnNbZXh0ZW5zaW9uXSk7XG4gICAgfVxuXG4gICAgc29ydE9wYXF1ZShhLCBiKSB7XG4gICAgICAgIGlmIChhLnJlbmRlck9yZGVyICE9PSBiLnJlbmRlck9yZGVyKSB7XG4gICAgICAgICAgICByZXR1cm4gYS5yZW5kZXJPcmRlciAtIGIucmVuZGVyT3JkZXI7XG4gICAgICAgIH0gZWxzZSBpZiAoYS5wcm9ncmFtLmlkICE9PSBiLnByb2dyYW0uaWQpIHtcbiAgICAgICAgICAgIHJldHVybiBhLnByb2dyYW0uaWQgLSBiLnByb2dyYW0uaWQ7XG4gICAgICAgIH0gZWxzZSBpZiAoYS56RGVwdGggIT09IGIuekRlcHRoKSB7XG4gICAgICAgICAgICByZXR1cm4gYS56RGVwdGggLSBiLnpEZXB0aDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBiLmlkIC0gYS5pZDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHNvcnRUcmFuc3BhcmVudChhLCBiKSB7XG4gICAgICAgIGlmIChhLnJlbmRlck9yZGVyICE9PSBiLnJlbmRlck9yZGVyKSB7XG4gICAgICAgICAgICByZXR1cm4gYS5yZW5kZXJPcmRlciAtIGIucmVuZGVyT3JkZXI7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGEuekRlcHRoICE9PSBiLnpEZXB0aCkge1xuICAgICAgICAgICAgcmV0dXJuIGIuekRlcHRoIC0gYS56RGVwdGg7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gYi5pZCAtIGEuaWQ7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzb3J0VUkoYSwgYikge1xuICAgICAgICBpZiAoYS5yZW5kZXJPcmRlciAhPT0gYi5yZW5kZXJPcmRlcikge1xuICAgICAgICAgICAgcmV0dXJuIGEucmVuZGVyT3JkZXIgLSBiLnJlbmRlck9yZGVyO1xuICAgICAgICB9IGVsc2UgaWYgKGEucHJvZ3JhbS5pZCAhPT0gYi5wcm9ncmFtLmlkKSB7XG4gICAgICAgICAgICByZXR1cm4gYS5wcm9ncmFtLmlkIC0gYi5wcm9ncmFtLmlkO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGIuaWQgLSBhLmlkO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZ2V0UmVuZGVyTGlzdCh7IHNjZW5lLCBjYW1lcmEsIGZydXN0dW1DdWxsLCBzb3J0IH0pIHtcbiAgICAgICAgbGV0IHJlbmRlckxpc3QgPSBBcnJheS5pc0FycmF5KHNjZW5lKSA/IFsuLi5zY2VuZV0gOiB0aGlzLnNjZW5lVG9SZW5kZXJMaXN0KHNjZW5lLCBmcnVzdHVtQ3VsbCwgY2FtZXJhKTtcbiAgICAgICAgaWYgKHNvcnQpIHJlbmRlckxpc3QgPSB0aGlzLnNvcnRSZW5kZXJMaXN0KHJlbmRlckxpc3QsIGNhbWVyYSk7XG4gICAgICAgIHJldHVybiByZW5kZXJMaXN0O1xuICAgIH1cblxuICAgIHNjZW5lVG9SZW5kZXJMaXN0KHNjZW5lLCBmcnVzdHVtQ3VsbCwgY2FtZXJhKSB7XG4gICAgICAgIGlmIChjYW1lcmEgJiYgZnJ1c3R1bUN1bGwpIGNhbWVyYS51cGRhdGVGcnVzdHVtKCk7XG4gICAgICAgIGxldCByZW5kZXJMaXN0ID0gW107XG4gICAgICAgIC8vIEdldCB2aXNpYmxlXG4gICAgICAgIHNjZW5lLnRyYXZlcnNlKChub2RlKSA9PiB7XG4gICAgICAgICAgICBpZiAoIW5vZGUudmlzaWJsZSkgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICBpZiAoIW5vZGUuZHJhdykgcmV0dXJuO1xuXG4gICAgICAgICAgICBpZiAoZnJ1c3R1bUN1bGwgJiYgbm9kZS5mcnVzdHVtQ3VsbGVkICYmIGNhbWVyYSkge1xuICAgICAgICAgICAgICAgIGlmICghY2FtZXJhLmZydXN0dW1JbnRlcnNlY3RzTWVzaChub2RlKSkgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZW5kZXJMaXN0LnB1c2gobm9kZSk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gcmVuZGVyTGlzdDtcbiAgICB9XG5cbiAgICBzb3J0UmVuZGVyTGlzdChyZW5kZXJMaXN0LCBjYW1lcmEsIHNwbGl0ID0gZmFsc2UpIHtcbiAgICAgICAgY29uc3Qgb3BhcXVlID0gW107XG4gICAgICAgIGNvbnN0IHRyYW5zcGFyZW50ID0gW107IC8vIGRlcHRoVGVzdCB0cnVlXG4gICAgICAgIGNvbnN0IHVpID0gW107IC8vIGRlcHRoVGVzdCBmYWxzZVxuXG4gICAgICAgIHJlbmRlckxpc3QuZm9yRWFjaCgobm9kZSkgPT4ge1xuICAgICAgICAgICAgLy8gU3BsaXQgaW50byB0aGUgMyByZW5kZXIgZ3JvdXBzXG4gICAgICAgICAgICBpZiAoIW5vZGUucHJvZ3JhbS50cmFuc3BhcmVudCkge1xuICAgICAgICAgICAgICAgIG9wYXF1ZS5wdXNoKG5vZGUpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChub2RlLnByb2dyYW0uZGVwdGhUZXN0KSB7XG4gICAgICAgICAgICAgICAgdHJhbnNwYXJlbnQucHVzaChub2RlKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdWkucHVzaChub2RlKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbm9kZS56RGVwdGggPSAwO1xuXG4gICAgICAgICAgICAvLyBPbmx5IGNhbGN1bGF0ZSB6LWRlcHRoIGlmIHJlbmRlck9yZGVyIHVuc2V0IGFuZCBkZXB0aFRlc3QgaXMgdHJ1ZVxuICAgICAgICAgICAgaWYgKG5vZGUucmVuZGVyT3JkZXIgIT09IDAgfHwgIW5vZGUucHJvZ3JhbS5kZXB0aFRlc3QgfHwgIWNhbWVyYSkgcmV0dXJuO1xuXG4gICAgICAgICAgICAvLyB1cGRhdGUgei1kZXB0aFxuICAgICAgICAgICAgbm9kZS53b3JsZE1hdHJpeC5nZXRUcmFuc2xhdGlvbih0ZW1wVmVjMyk7XG4gICAgICAgICAgICB0ZW1wVmVjMy5hcHBseU1hdHJpeDQoY2FtZXJhLnByb2plY3Rpb25WaWV3TWF0cml4KTtcbiAgICAgICAgICAgIG5vZGUuekRlcHRoID0gdGVtcFZlYzMuejtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgb3BhcXVlLnNvcnQodGhpcy5zb3J0T3BhcXVlKTtcbiAgICAgICAgdHJhbnNwYXJlbnQuc29ydCh0aGlzLnNvcnRUcmFuc3BhcmVudCk7XG4gICAgICAgIHVpLnNvcnQodGhpcy5zb3J0VUkpO1xuXG4gICAgICAgIHJldHVybiBzcGxpdCA/IHtvcGFxdWUsIHRyYW5zcGFyZW50LCB1aX0gOiBvcGFxdWUuY29uY2F0KHRyYW5zcGFyZW50LCB1aSk7XG4gICAgfVxuXG4gICAgcmVuZGVyKHsgc2NlbmUsIGNhbWVyYSwgdGFyZ2V0ID0gbnVsbCwgdXBkYXRlID0gdHJ1ZSwgc29ydCA9IHRydWUsIGZydXN0dW1DdWxsID0gdHJ1ZSwgY2xlYXIsIG92ZXJyaWRlUHJvZ3JhbSB9KSB7XG4gICAgICAgIGlmICh0YXJnZXQgPT09IG51bGwpIHtcbiAgICAgICAgICAgIC8vIG1ha2Ugc3VyZSBubyByZW5kZXIgdGFyZ2V0IGJvdW5kIHNvIGRyYXdzIHRvIGNhbnZhc1xuICAgICAgICAgICAgdGhpcy5iaW5kRnJhbWVidWZmZXIoKTtcbiAgICAgICAgICAgIHRoaXMuc2V0Vmlld3BvcnQodGhpcy53aWR0aCAqIHRoaXMuZHByLCB0aGlzLmhlaWdodCAqIHRoaXMuZHByKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIGJpbmQgc3VwcGxpZWQgcmVuZGVyIHRhcmdldCBhbmQgdXBkYXRlIHZpZXdwb3J0XG4gICAgICAgICAgICB0aGlzLmJpbmRGcmFtZWJ1ZmZlcih0YXJnZXQpO1xuICAgICAgICAgICAgdGhpcy5zZXRWaWV3cG9ydCh0YXJnZXQud2lkdGgsIHRhcmdldC5oZWlnaHQpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGNsZWFyIHx8ICh0aGlzLmF1dG9DbGVhciAmJiBjbGVhciAhPT0gZmFsc2UpKSB7XG4gICAgICAgICAgICAvLyBFbnN1cmUgZGVwdGggYnVmZmVyIHdyaXRpbmcgaXMgZW5hYmxlZCBzbyBpdCBjYW4gYmUgY2xlYXJlZFxuICAgICAgICAgICAgaWYgKHRoaXMuZGVwdGggJiYgKCF0YXJnZXQgfHwgdGFyZ2V0LmRlcHRoKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuZW5hYmxlKHRoaXMuZ2wuREVQVEhfVEVTVCk7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXREZXB0aE1hc2sodHJ1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmdsLmNsZWFyKFxuICAgICAgICAgICAgICAgICh0aGlzLmNvbG9yID8gdGhpcy5nbC5DT0xPUl9CVUZGRVJfQklUIDogMCkgfFxuICAgICAgICAgICAgICAgICAgICAodGhpcy5kZXB0aCA/IHRoaXMuZ2wuREVQVEhfQlVGRkVSX0JJVCA6IDApIHxcbiAgICAgICAgICAgICAgICAgICAgKHRoaXMuc3RlbmNpbCA/IHRoaXMuZ2wuU1RFTkNJTF9CVUZGRVJfQklUIDogMClcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyB1cGRhdGVzIGFsbCBzY2VuZSBncmFwaCBtYXRyaWNlc1xuICAgICAgICBpZiAodXBkYXRlICYmICFBcnJheS5pc0FycmF5KHNjZW5lKSkgc2NlbmUudXBkYXRlTWF0cml4V29ybGQoKTtcblxuICAgICAgICAvLyBVcGRhdGUgY2FtZXJhIHNlcGFyYXRlbHksIGluIGNhc2Ugbm90IGluIHNjZW5lIGdyYXBoXG4gICAgICAgIGlmIChjYW1lcmEpIGNhbWVyYS51cGRhdGVNYXRyaXhXb3JsZCgpO1xuXG4gICAgICAgIC8vIEdldCByZW5kZXIgbGlzdCAtIGVudGFpbHMgY3VsbGluZyBhbmQgc29ydGluZ1xuICAgICAgICBjb25zdCByZW5kZXJMaXN0ID0gdGhpcy5nZXRSZW5kZXJMaXN0KHsgc2NlbmUsIGNhbWVyYSwgZnJ1c3R1bUN1bGwsIHNvcnQsIG92ZXJyaWRlUHJvZ3JhbSB9KTtcblxuICAgICAgICByZW5kZXJMaXN0LmZvckVhY2goKG5vZGUpID0+IHtcbiAgICAgICAgICAgIHRoaXMucmVuZGVyTm9kZShub2RlLCBjYW1lcmEsIG92ZXJyaWRlUHJvZ3JhbSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHJlbmRlck5vZGUobm9kZSwgY2FtZXJhLCBvdmVycmlkZVByb2dyYW0pIHtcbiAgICAgICAgbm9kZS5kcmF3KHtjYW1lcmEsIG92ZXJyaWRlUHJvZ3JhbX0pO1xuICAgIH1cbn1cbiIsIi8vIFRPRE86IGRlbGV0ZSB0ZXh0dXJlXG4vLyBUT0RPOiB1c2UgdGV4U3ViSW1hZ2UyRCBmb3IgdXBkYXRlcyAodmlkZW8gb3Igd2hlbiBsb2FkZWQpXG4vLyBUT0RPOiBuZWVkPyBlbmNvZGluZyA9IGxpbmVhckVuY29kaW5nXG4vLyBUT0RPOiBzdXBwb3J0IG5vbi1jb21wcmVzc2VkIG1pcG1hcHMgdXBsb2Fkc1xuXG5jb25zdCBlbXB0eVBpeGVsID0gbmV3IFVpbnQ4QXJyYXkoNCk7XG5cbmZ1bmN0aW9uIGlzUG93ZXJPZjIodmFsdWUpIHtcbiAgICByZXR1cm4gKHZhbHVlICYgKHZhbHVlIC0gMSkpID09PSAwO1xufVxuXG5sZXQgSUQgPSAxO1xuXG5leHBvcnQgY2xhc3MgVGV4dHVyZSB7XG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIGdsLFxuICAgICAgICB7XG4gICAgICAgICAgICBpbWFnZSxcbiAgICAgICAgICAgIHRhcmdldCA9IGdsLlRFWFRVUkVfMkQsXG4gICAgICAgICAgICB0eXBlID0gZ2wuVU5TSUdORURfQllURSxcbiAgICAgICAgICAgIGZvcm1hdCA9IGdsLlJHQkEsXG4gICAgICAgICAgICBpbnRlcm5hbEZvcm1hdCA9IGZvcm1hdCxcbiAgICAgICAgICAgIHdyYXBTID0gZ2wuQ0xBTVBfVE9fRURHRSxcbiAgICAgICAgICAgIHdyYXBUID0gZ2wuQ0xBTVBfVE9fRURHRSxcbiAgICAgICAgICAgIGdlbmVyYXRlTWlwbWFwcyA9IHRydWUsXG4gICAgICAgICAgICBtaW5GaWx0ZXIgPSBnZW5lcmF0ZU1pcG1hcHMgPyBnbC5ORUFSRVNUX01JUE1BUF9MSU5FQVIgOiBnbC5MSU5FQVIsXG4gICAgICAgICAgICBtYWdGaWx0ZXIgPSBnbC5MSU5FQVIsXG4gICAgICAgICAgICBwcmVtdWx0aXBseUFscGhhID0gZmFsc2UsXG4gICAgICAgICAgICB1bnBhY2tBbGlnbm1lbnQgPSA0LFxuICAgICAgICAgICAgZmxpcFkgPSB0YXJnZXQgPT0gZ2wuVEVYVFVSRV8yRCA/IHRydWUgOiBmYWxzZSxcbiAgICAgICAgICAgIGFuaXNvdHJvcHkgPSAwLFxuICAgICAgICAgICAgbGV2ZWwgPSAwLFxuICAgICAgICAgICAgd2lkdGgsIC8vIHVzZWQgZm9yIFJlbmRlclRhcmdldHMgb3IgRGF0YSBUZXh0dXJlc1xuICAgICAgICAgICAgaGVpZ2h0ID0gd2lkdGgsXG4gICAgICAgIH0gPSB7fVxuICAgICkge1xuICAgICAgICB0aGlzLmdsID0gZ2w7XG4gICAgICAgIHRoaXMuaWQgPSBJRCsrO1xuXG4gICAgICAgIHRoaXMuaW1hZ2UgPSBpbWFnZTtcbiAgICAgICAgdGhpcy50YXJnZXQgPSB0YXJnZXQ7XG4gICAgICAgIHRoaXMudHlwZSA9IHR5cGU7XG4gICAgICAgIHRoaXMuZm9ybWF0ID0gZm9ybWF0O1xuICAgICAgICB0aGlzLmludGVybmFsRm9ybWF0ID0gaW50ZXJuYWxGb3JtYXQ7XG4gICAgICAgIHRoaXMubWluRmlsdGVyID0gbWluRmlsdGVyO1xuICAgICAgICB0aGlzLm1hZ0ZpbHRlciA9IG1hZ0ZpbHRlcjtcbiAgICAgICAgdGhpcy53cmFwUyA9IHdyYXBTO1xuICAgICAgICB0aGlzLndyYXBUID0gd3JhcFQ7XG4gICAgICAgIHRoaXMuZ2VuZXJhdGVNaXBtYXBzID0gZ2VuZXJhdGVNaXBtYXBzO1xuICAgICAgICB0aGlzLnByZW11bHRpcGx5QWxwaGEgPSBwcmVtdWx0aXBseUFscGhhO1xuICAgICAgICB0aGlzLnVucGFja0FsaWdubWVudCA9IHVucGFja0FsaWdubWVudDtcbiAgICAgICAgdGhpcy5mbGlwWSA9IGZsaXBZO1xuICAgICAgICB0aGlzLmFuaXNvdHJvcHkgPSBNYXRoLm1pbihhbmlzb3Ryb3B5LCB0aGlzLmdsLnJlbmRlcmVyLnBhcmFtZXRlcnMubWF4QW5pc290cm9weSk7XG4gICAgICAgIHRoaXMubGV2ZWwgPSBsZXZlbDtcbiAgICAgICAgdGhpcy53aWR0aCA9IHdpZHRoO1xuICAgICAgICB0aGlzLmhlaWdodCA9IGhlaWdodDtcbiAgICAgICAgdGhpcy50ZXh0dXJlID0gdGhpcy5nbC5jcmVhdGVUZXh0dXJlKCk7XG5cbiAgICAgICAgdGhpcy5zdG9yZSA9IHtcbiAgICAgICAgICAgIGltYWdlOiBudWxsLFxuICAgICAgICB9O1xuXG4gICAgICAgIC8vIEFsaWFzIGZvciBzdGF0ZSBzdG9yZSB0byBhdm9pZCByZWR1bmRhbnQgY2FsbHMgZm9yIGdsb2JhbCBzdGF0ZVxuICAgICAgICB0aGlzLmdsU3RhdGUgPSB0aGlzLmdsLnJlbmRlcmVyLnN0YXRlO1xuXG4gICAgICAgIC8vIFN0YXRlIHN0b3JlIHRvIGF2b2lkIHJlZHVuZGFudCBjYWxscyBmb3IgcGVyLXRleHR1cmUgc3RhdGVcbiAgICAgICAgdGhpcy5zdGF0ZSA9IHt9O1xuICAgICAgICB0aGlzLnN0YXRlLm1pbkZpbHRlciA9IHRoaXMuZ2wuTkVBUkVTVF9NSVBNQVBfTElORUFSO1xuICAgICAgICB0aGlzLnN0YXRlLm1hZ0ZpbHRlciA9IHRoaXMuZ2wuTElORUFSO1xuICAgICAgICB0aGlzLnN0YXRlLndyYXBTID0gdGhpcy5nbC5SRVBFQVQ7XG4gICAgICAgIHRoaXMuc3RhdGUud3JhcFQgPSB0aGlzLmdsLlJFUEVBVDtcbiAgICAgICAgdGhpcy5zdGF0ZS5hbmlzb3Ryb3B5ID0gMDtcbiAgICB9XG5cbiAgICBiaW5kKCkge1xuICAgICAgICAvLyBBbHJlYWR5IGJvdW5kIHRvIGFjdGl2ZSB0ZXh0dXJlIHVuaXRcbiAgICAgICAgaWYgKHRoaXMuZ2xTdGF0ZS50ZXh0dXJlVW5pdHNbdGhpcy5nbFN0YXRlLmFjdGl2ZVRleHR1cmVVbml0XSA9PT0gdGhpcy5pZCkgcmV0dXJuO1xuICAgICAgICB0aGlzLmdsLmJpbmRUZXh0dXJlKHRoaXMudGFyZ2V0LCB0aGlzLnRleHR1cmUpO1xuICAgICAgICB0aGlzLmdsU3RhdGUudGV4dHVyZVVuaXRzW3RoaXMuZ2xTdGF0ZS5hY3RpdmVUZXh0dXJlVW5pdF0gPSB0aGlzLmlkO1xuICAgIH1cblxuICAgIHVwZGF0ZSh0ZXh0dXJlVW5pdCA9IDApIHtcbiAgICAgICAgY29uc3QgbmVlZHNVcGRhdGUgPSAhKHRoaXMuaW1hZ2UgPT09IHRoaXMuc3RvcmUuaW1hZ2UgJiYgIXRoaXMubmVlZHNVcGRhdGUpO1xuXG4gICAgICAgIC8vIE1ha2Ugc3VyZSB0aGF0IHRleHR1cmUgaXMgYm91bmQgdG8gaXRzIHRleHR1cmUgdW5pdFxuICAgICAgICBpZiAobmVlZHNVcGRhdGUgfHwgdGhpcy5nbFN0YXRlLnRleHR1cmVVbml0c1t0ZXh0dXJlVW5pdF0gIT09IHRoaXMuaWQpIHtcbiAgICAgICAgICAgIC8vIHNldCBhY3RpdmUgdGV4dHVyZSB1bml0IHRvIHBlcmZvcm0gdGV4dHVyZSBmdW5jdGlvbnNcbiAgICAgICAgICAgIHRoaXMuZ2wucmVuZGVyZXIuYWN0aXZlVGV4dHVyZSh0ZXh0dXJlVW5pdCk7XG4gICAgICAgICAgICB0aGlzLmJpbmQoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghbmVlZHNVcGRhdGUpIHJldHVybjtcbiAgICAgICAgdGhpcy5uZWVkc1VwZGF0ZSA9IGZhbHNlO1xuXG4gICAgICAgIGlmICh0aGlzLmZsaXBZICE9PSB0aGlzLmdsU3RhdGUuZmxpcFkpIHtcbiAgICAgICAgICAgIHRoaXMuZ2wucGl4ZWxTdG9yZWkodGhpcy5nbC5VTlBBQ0tfRkxJUF9ZX1dFQkdMLCB0aGlzLmZsaXBZKTtcbiAgICAgICAgICAgIHRoaXMuZ2xTdGF0ZS5mbGlwWSA9IHRoaXMuZmxpcFk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5wcmVtdWx0aXBseUFscGhhICE9PSB0aGlzLmdsU3RhdGUucHJlbXVsdGlwbHlBbHBoYSkge1xuICAgICAgICAgICAgdGhpcy5nbC5waXhlbFN0b3JlaSh0aGlzLmdsLlVOUEFDS19QUkVNVUxUSVBMWV9BTFBIQV9XRUJHTCwgdGhpcy5wcmVtdWx0aXBseUFscGhhKTtcbiAgICAgICAgICAgIHRoaXMuZ2xTdGF0ZS5wcmVtdWx0aXBseUFscGhhID0gdGhpcy5wcmVtdWx0aXBseUFscGhhO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMudW5wYWNrQWxpZ25tZW50ICE9PSB0aGlzLmdsU3RhdGUudW5wYWNrQWxpZ25tZW50KSB7XG4gICAgICAgICAgICB0aGlzLmdsLnBpeGVsU3RvcmVpKHRoaXMuZ2wuVU5QQUNLX0FMSUdOTUVOVCwgdGhpcy51bnBhY2tBbGlnbm1lbnQpO1xuICAgICAgICAgICAgdGhpcy5nbFN0YXRlLnVucGFja0FsaWdubWVudCA9IHRoaXMudW5wYWNrQWxpZ25tZW50O1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMubWluRmlsdGVyICE9PSB0aGlzLnN0YXRlLm1pbkZpbHRlcikge1xuICAgICAgICAgICAgdGhpcy5nbC50ZXhQYXJhbWV0ZXJpKHRoaXMudGFyZ2V0LCB0aGlzLmdsLlRFWFRVUkVfTUlOX0ZJTFRFUiwgdGhpcy5taW5GaWx0ZXIpO1xuICAgICAgICAgICAgdGhpcy5zdGF0ZS5taW5GaWx0ZXIgPSB0aGlzLm1pbkZpbHRlcjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLm1hZ0ZpbHRlciAhPT0gdGhpcy5zdGF0ZS5tYWdGaWx0ZXIpIHtcbiAgICAgICAgICAgIHRoaXMuZ2wudGV4UGFyYW1ldGVyaSh0aGlzLnRhcmdldCwgdGhpcy5nbC5URVhUVVJFX01BR19GSUxURVIsIHRoaXMubWFnRmlsdGVyKTtcbiAgICAgICAgICAgIHRoaXMuc3RhdGUubWFnRmlsdGVyID0gdGhpcy5tYWdGaWx0ZXI7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy53cmFwUyAhPT0gdGhpcy5zdGF0ZS53cmFwUykge1xuICAgICAgICAgICAgdGhpcy5nbC50ZXhQYXJhbWV0ZXJpKHRoaXMudGFyZ2V0LCB0aGlzLmdsLlRFWFRVUkVfV1JBUF9TLCB0aGlzLndyYXBTKTtcbiAgICAgICAgICAgIHRoaXMuc3RhdGUud3JhcFMgPSB0aGlzLndyYXBTO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMud3JhcFQgIT09IHRoaXMuc3RhdGUud3JhcFQpIHtcbiAgICAgICAgICAgIHRoaXMuZ2wudGV4UGFyYW1ldGVyaSh0aGlzLnRhcmdldCwgdGhpcy5nbC5URVhUVVJFX1dSQVBfVCwgdGhpcy53cmFwVCk7XG4gICAgICAgICAgICB0aGlzLnN0YXRlLndyYXBUID0gdGhpcy53cmFwVDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLmFuaXNvdHJvcHkgJiYgdGhpcy5hbmlzb3Ryb3B5ICE9PSB0aGlzLnN0YXRlLmFuaXNvdHJvcHkpIHtcbiAgICAgICAgICAgIHRoaXMuZ2wudGV4UGFyYW1ldGVyZihcbiAgICAgICAgICAgICAgICB0aGlzLnRhcmdldCxcbiAgICAgICAgICAgICAgICB0aGlzLmdsLnJlbmRlcmVyLmdldEV4dGVuc2lvbignRVhUX3RleHR1cmVfZmlsdGVyX2FuaXNvdHJvcGljJykuVEVYVFVSRV9NQVhfQU5JU09UUk9QWV9FWFQsXG4gICAgICAgICAgICAgICAgdGhpcy5hbmlzb3Ryb3B5XG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgdGhpcy5zdGF0ZS5hbmlzb3Ryb3B5ID0gdGhpcy5hbmlzb3Ryb3B5O1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuaW1hZ2UpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmltYWdlLndpZHRoKSB7XG4gICAgICAgICAgICAgICAgdGhpcy53aWR0aCA9IHRoaXMuaW1hZ2Uud2lkdGg7XG4gICAgICAgICAgICAgICAgdGhpcy5oZWlnaHQgPSB0aGlzLmltYWdlLmhlaWdodDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHRoaXMudGFyZ2V0ID09PSB0aGlzLmdsLlRFWFRVUkVfQ1VCRV9NQVApIHtcbiAgICAgICAgICAgICAgICAvLyBGb3IgY3ViZSBtYXBzXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCA2OyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5nbC50ZXhJbWFnZTJEKFxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5nbC5URVhUVVJFX0NVQkVfTUFQX1BPU0lUSVZFX1ggKyBpLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5sZXZlbCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaW50ZXJuYWxGb3JtYXQsXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmZvcm1hdCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudHlwZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaW1hZ2VbaV1cbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYgKEFycmF5QnVmZmVyLmlzVmlldyh0aGlzLmltYWdlKSkge1xuICAgICAgICAgICAgICAgIC8vIERhdGEgdGV4dHVyZVxuICAgICAgICAgICAgICAgIHRoaXMuZ2wudGV4SW1hZ2UyRCh0aGlzLnRhcmdldCwgdGhpcy5sZXZlbCwgdGhpcy5pbnRlcm5hbEZvcm1hdCwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQsIDAsIHRoaXMuZm9ybWF0LCB0aGlzLnR5cGUsIHRoaXMuaW1hZ2UpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLmltYWdlLmlzQ29tcHJlc3NlZFRleHR1cmUpIHtcbiAgICAgICAgICAgICAgICAvLyBDb21wcmVzc2VkIHRleHR1cmVcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBsZXZlbCA9IDA7IGxldmVsIDwgdGhpcy5pbWFnZS5sZW5ndGg7IGxldmVsKyspIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5nbC5jb21wcmVzc2VkVGV4SW1hZ2UyRChcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudGFyZ2V0LFxuICAgICAgICAgICAgICAgICAgICAgICAgbGV2ZWwsXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmludGVybmFsRm9ybWF0LFxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbWFnZVtsZXZlbF0ud2lkdGgsXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmltYWdlW2xldmVsXS5oZWlnaHQsXG4gICAgICAgICAgICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbWFnZVtsZXZlbF0uZGF0YVxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gUmVndWxhciB0ZXh0dXJlXG4gICAgICAgICAgICAgICAgdGhpcy5nbC50ZXhJbWFnZTJEKHRoaXMudGFyZ2V0LCB0aGlzLmxldmVsLCB0aGlzLmludGVybmFsRm9ybWF0LCB0aGlzLmZvcm1hdCwgdGhpcy50eXBlLCB0aGlzLmltYWdlKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHRoaXMuZ2VuZXJhdGVNaXBtYXBzKSB7XG4gICAgICAgICAgICAgICAgLy8gRm9yIFdlYkdMMSwgaWYgbm90IGEgcG93ZXIgb2YgMiwgdHVybiBvZmYgbWlwcywgc2V0IHdyYXBwaW5nIHRvIGNsYW1wIHRvIGVkZ2UgYW5kIG1pbkZpbHRlciB0byBsaW5lYXJcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMuZ2wucmVuZGVyZXIuaXNXZWJnbDIgJiYgKCFpc1Bvd2VyT2YyKHRoaXMuaW1hZ2Uud2lkdGgpIHx8ICFpc1Bvd2VyT2YyKHRoaXMuaW1hZ2UuaGVpZ2h0KSkpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5nZW5lcmF0ZU1pcG1hcHMgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy53cmFwUyA9IHRoaXMud3JhcFQgPSB0aGlzLmdsLkNMQU1QX1RPX0VER0U7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubWluRmlsdGVyID0gdGhpcy5nbC5MSU5FQVI7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5nbC5nZW5lcmF0ZU1pcG1hcCh0aGlzLnRhcmdldCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBDYWxsYmFjayBmb3Igd2hlbiBkYXRhIGlzIHB1c2hlZCB0byBHUFVcbiAgICAgICAgICAgIHRoaXMub25VcGRhdGUgJiYgdGhpcy5vblVwZGF0ZSgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKHRoaXMudGFyZ2V0ID09PSB0aGlzLmdsLlRFWFRVUkVfQ1VCRV9NQVApIHtcbiAgICAgICAgICAgICAgICAvLyBVcGxvYWQgZW1wdHkgcGl4ZWwgZm9yIGVhY2ggc2lkZSB3aGlsZSBubyBpbWFnZSB0byBhdm9pZCBlcnJvcnMgd2hpbGUgaW1hZ2Ugb3IgdmlkZW8gbG9hZGluZ1xuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgNjsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZ2wudGV4SW1hZ2UyRChcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZ2wuVEVYVFVSRV9DVUJFX01BUF9QT1NJVElWRV9YICsgaSxcbiAgICAgICAgICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmdsLlJHQkEsXG4gICAgICAgICAgICAgICAgICAgICAgICAxLFxuICAgICAgICAgICAgICAgICAgICAgICAgMSxcbiAgICAgICAgICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmdsLlJHQkEsXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmdsLlVOU0lHTkVEX0JZVEUsXG4gICAgICAgICAgICAgICAgICAgICAgICBlbXB0eVBpeGVsXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLndpZHRoKSB7XG4gICAgICAgICAgICAgICAgLy8gaW1hZ2UgaW50ZW50aW9uYWxseSBsZWZ0IG51bGwgZm9yIFJlbmRlclRhcmdldFxuICAgICAgICAgICAgICAgIHRoaXMuZ2wudGV4SW1hZ2UyRCh0aGlzLnRhcmdldCwgdGhpcy5sZXZlbCwgdGhpcy5pbnRlcm5hbEZvcm1hdCwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQsIDAsIHRoaXMuZm9ybWF0LCB0aGlzLnR5cGUsIG51bGwpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBVcGxvYWQgZW1wdHkgcGl4ZWwgaWYgbm8gaW1hZ2UgdG8gYXZvaWQgZXJyb3JzIHdoaWxlIGltYWdlIG9yIHZpZGVvIGxvYWRpbmdcbiAgICAgICAgICAgICAgICB0aGlzLmdsLnRleEltYWdlMkQodGhpcy50YXJnZXQsIDAsIHRoaXMuZ2wuUkdCQSwgMSwgMSwgMCwgdGhpcy5nbC5SR0JBLCB0aGlzLmdsLlVOU0lHTkVEX0JZVEUsIGVtcHR5UGl4ZWwpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHRoaXMuc3RvcmUuaW1hZ2UgPSB0aGlzLmltYWdlO1xuICAgIH1cblxuICAgIGRpc3Bvc2UoKSB7XG4gICAgICAgIHRoaXMuZ2wuZGVsZXRlVGV4dHVyZSh0aGlzLnRleHR1cmUpO1xuICAgICAgICB0aGlzLnRleHR1cmUgPSBudWxsO1xuICAgIH1cbn1cbiIsImltcG9ydCB7IFZlYzMgfSBmcm9tICcuLi9tYXRoL1ZlYzMuanMnO1xuaW1wb3J0IHsgUXVhdCB9IGZyb20gJy4uL21hdGgvUXVhdC5qcyc7XG5pbXBvcnQgeyBNYXQ0IH0gZnJvbSAnLi4vbWF0aC9NYXQ0LmpzJztcbmltcG9ydCB7IEV1bGVyIH0gZnJvbSAnLi4vbWF0aC9FdWxlci5qcyc7XG5cbmV4cG9ydCBjbGFzcyBUcmFuc2Zvcm0ge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLnBhcmVudCA9IG51bGw7XG4gICAgICAgIHRoaXMuY2hpbGRyZW4gPSBbXTtcbiAgICAgICAgdGhpcy52aXNpYmxlID0gdHJ1ZTtcblxuICAgICAgICB0aGlzLm1hdHJpeCA9IG5ldyBNYXQ0KCk7XG4gICAgICAgIHRoaXMud29ybGRNYXRyaXggPSBuZXcgTWF0NCgpO1xuICAgICAgICB0aGlzLm1hdHJpeEF1dG9VcGRhdGUgPSB0cnVlO1xuXG4gICAgICAgIHRoaXMucG9zaXRpb24gPSBuZXcgVmVjMygpO1xuICAgICAgICB0aGlzLnF1YXRlcm5pb24gPSBuZXcgUXVhdCgpO1xuICAgICAgICB0aGlzLnNjYWxlID0gbmV3IFZlYzMoMSk7XG4gICAgICAgIHRoaXMucm90YXRpb24gPSBuZXcgRXVsZXIoKTtcbiAgICAgICAgdGhpcy51cCA9IG5ldyBWZWMzKDAsIDEsIDApO1xuXG4gICAgICAgIHRoaXMucm90YXRpb24ub25DaGFuZ2UgPSAoKSA9PiB0aGlzLnF1YXRlcm5pb24uZnJvbUV1bGVyKHRoaXMucm90YXRpb24pO1xuICAgICAgICB0aGlzLnF1YXRlcm5pb24ub25DaGFuZ2UgPSAoKSA9PiB0aGlzLnJvdGF0aW9uLmZyb21RdWF0ZXJuaW9uKHRoaXMucXVhdGVybmlvbik7XG4gICAgfVxuXG4gICAgc2V0UGFyZW50KHBhcmVudCwgbm90aWZ5UGFyZW50ID0gdHJ1ZSkge1xuICAgICAgICBpZiAodGhpcy5wYXJlbnQgJiYgcGFyZW50ICE9PSB0aGlzLnBhcmVudCkgdGhpcy5wYXJlbnQucmVtb3ZlQ2hpbGQodGhpcywgZmFsc2UpO1xuICAgICAgICB0aGlzLnBhcmVudCA9IHBhcmVudDtcbiAgICAgICAgaWYgKG5vdGlmeVBhcmVudCAmJiBwYXJlbnQpIHBhcmVudC5hZGRDaGlsZCh0aGlzLCBmYWxzZSk7XG4gICAgfVxuXG4gICAgYWRkQ2hpbGQoY2hpbGQsIG5vdGlmeUNoaWxkID0gdHJ1ZSkge1xuICAgICAgICBpZiAoIX50aGlzLmNoaWxkcmVuLmluZGV4T2YoY2hpbGQpKSB0aGlzLmNoaWxkcmVuLnB1c2goY2hpbGQpO1xuICAgICAgICBpZiAobm90aWZ5Q2hpbGQpIGNoaWxkLnNldFBhcmVudCh0aGlzLCBmYWxzZSk7XG4gICAgfVxuXG4gICAgcmVtb3ZlQ2hpbGQoY2hpbGQsIG5vdGlmeUNoaWxkID0gdHJ1ZSkge1xuICAgICAgICBpZiAoISF+dGhpcy5jaGlsZHJlbi5pbmRleE9mKGNoaWxkKSkgdGhpcy5jaGlsZHJlbi5zcGxpY2UodGhpcy5jaGlsZHJlbi5pbmRleE9mKGNoaWxkKSwgMSk7XG4gICAgICAgIGlmIChub3RpZnlDaGlsZCkgY2hpbGQuc2V0UGFyZW50KG51bGwsIGZhbHNlKTtcbiAgICB9XG5cbiAgICB1cGRhdGVNYXRyaXhXb3JsZChmb3JjZSkge1xuICAgICAgICBpZiAodGhpcy5tYXRyaXhBdXRvVXBkYXRlKSB0aGlzLnVwZGF0ZU1hdHJpeCgpO1xuICAgICAgICBpZiAodGhpcy53b3JsZE1hdHJpeE5lZWRzVXBkYXRlIHx8IGZvcmNlKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5wYXJlbnQgPT09IG51bGwpIHRoaXMud29ybGRNYXRyaXguY29weSh0aGlzLm1hdHJpeCk7XG4gICAgICAgICAgICBlbHNlIHRoaXMud29ybGRNYXRyaXgubXVsdGlwbHkodGhpcy5wYXJlbnQud29ybGRNYXRyaXgsIHRoaXMubWF0cml4KTtcbiAgICAgICAgICAgIHRoaXMud29ybGRNYXRyaXhOZWVkc1VwZGF0ZSA9IGZhbHNlO1xuICAgICAgICAgICAgZm9yY2UgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yIChsZXQgaSA9IDAsIGwgPSB0aGlzLmNoaWxkcmVuLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICAgICAgdGhpcy5jaGlsZHJlbltpXS51cGRhdGVNYXRyaXhXb3JsZChmb3JjZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB1cGRhdGVNYXRyaXgoKSB7XG4gICAgICAgIHRoaXMubWF0cml4LmNvbXBvc2UodGhpcy5xdWF0ZXJuaW9uLCB0aGlzLnBvc2l0aW9uLCB0aGlzLnNjYWxlKTtcbiAgICAgICAgdGhpcy53b3JsZE1hdHJpeE5lZWRzVXBkYXRlID0gdHJ1ZTtcbiAgICB9XG5cbiAgICB0cmF2ZXJzZShjYWxsYmFjaykge1xuICAgICAgICAvLyBSZXR1cm4gdHJ1ZSBpbiBjYWxsYmFjayB0byBzdG9wIHRyYXZlcnNpbmcgY2hpbGRyZW5cbiAgICAgICAgaWYgKGNhbGxiYWNrKHRoaXMpKSByZXR1cm47XG4gICAgICAgIGZvciAobGV0IGkgPSAwLCBsID0gdGhpcy5jaGlsZHJlbi5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgICAgIHRoaXMuY2hpbGRyZW5baV0udHJhdmVyc2UoY2FsbGJhY2spO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZGVjb21wb3NlKCkge1xuICAgICAgICB0aGlzLm1hdHJpeC5nZXRUcmFuc2xhdGlvbih0aGlzLnBvc2l0aW9uKTtcbiAgICAgICAgdGhpcy5tYXRyaXguZ2V0Um90YXRpb24odGhpcy5xdWF0ZXJuaW9uKTtcbiAgICAgICAgdGhpcy5tYXRyaXguZ2V0U2NhbGluZyh0aGlzLnNjYWxlKTtcbiAgICAgICAgdGhpcy5yb3RhdGlvbi5mcm9tUXVhdGVybmlvbih0aGlzLnF1YXRlcm5pb24pO1xuICAgIH1cblxuICAgIGxvb2tBdCh0YXJnZXQsIGludmVydCA9IGZhbHNlKSB7XG4gICAgICAgIGlmIChpbnZlcnQpIHRoaXMubWF0cml4Lmxvb2tBdCh0aGlzLnBvc2l0aW9uLCB0YXJnZXQsIHRoaXMudXApO1xuICAgICAgICBlbHNlIHRoaXMubWF0cml4Lmxvb2tBdCh0YXJnZXQsIHRoaXMucG9zaXRpb24sIHRoaXMudXApO1xuICAgICAgICB0aGlzLm1hdHJpeC5nZXRSb3RhdGlvbih0aGlzLnF1YXRlcm5pb24pO1xuICAgICAgICB0aGlzLnJvdGF0aW9uLmZyb21RdWF0ZXJuaW9uKHRoaXMucXVhdGVybmlvbik7XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgVmVjMyB9IGZyb20gJy4uL21hdGgvVmVjMy5qcyc7XG5pbXBvcnQgeyBRdWF0IH0gZnJvbSAnLi4vbWF0aC9RdWF0LmpzJztcblxuY29uc3QgcHJldlBvcyA9IG5ldyBWZWMzKCk7XG5jb25zdCBwcmV2Um90ID0gbmV3IFF1YXQoKTtcbmNvbnN0IHByZXZTY2wgPSBuZXcgVmVjMygpO1xuXG5jb25zdCBuZXh0UG9zID0gbmV3IFZlYzMoKTtcbmNvbnN0IG5leHRSb3QgPSBuZXcgUXVhdCgpO1xuY29uc3QgbmV4dFNjbCA9IG5ldyBWZWMzKCk7XG5cbmV4cG9ydCBjbGFzcyBBbmltYXRpb24ge1xuICAgIGNvbnN0cnVjdG9yKHsgb2JqZWN0cywgZGF0YSB9KSB7XG4gICAgICAgIHRoaXMub2JqZWN0cyA9IG9iamVjdHM7XG4gICAgICAgIHRoaXMuZGF0YSA9IGRhdGE7XG4gICAgICAgIHRoaXMuZWxhcHNlZCA9IDA7XG4gICAgICAgIHRoaXMud2VpZ2h0ID0gMTtcbiAgICAgICAgdGhpcy5kdXJhdGlvbiA9IGRhdGEuZnJhbWVzLmxlbmd0aCAtIDE7XG4gICAgfVxuXG4gICAgdXBkYXRlKHRvdGFsV2VpZ2h0ID0gMSwgaXNTZXQpIHtcbiAgICAgICAgY29uc3Qgd2VpZ2h0ID0gaXNTZXQgPyAxIDogdGhpcy53ZWlnaHQgLyB0b3RhbFdlaWdodDtcbiAgICAgICAgY29uc3QgZWxhcHNlZCA9IHRoaXMuZWxhcHNlZCAlIHRoaXMuZHVyYXRpb247XG5cbiAgICAgICAgY29uc3QgZmxvb3JGcmFtZSA9IE1hdGguZmxvb3IoZWxhcHNlZCk7XG4gICAgICAgIGNvbnN0IGJsZW5kID0gZWxhcHNlZCAtIGZsb29yRnJhbWU7XG4gICAgICAgIGNvbnN0IHByZXZLZXkgPSB0aGlzLmRhdGEuZnJhbWVzW2Zsb29yRnJhbWVdO1xuICAgICAgICBjb25zdCBuZXh0S2V5ID0gdGhpcy5kYXRhLmZyYW1lc1soZmxvb3JGcmFtZSArIDEpICUgdGhpcy5kdXJhdGlvbl07XG5cbiAgICAgICAgdGhpcy5vYmplY3RzLmZvckVhY2goKG9iamVjdCwgaSkgPT4ge1xuICAgICAgICAgICAgcHJldlBvcy5mcm9tQXJyYXkocHJldktleS5wb3NpdGlvbiwgaSAqIDMpO1xuICAgICAgICAgICAgcHJldlJvdC5mcm9tQXJyYXkocHJldktleS5xdWF0ZXJuaW9uLCBpICogNCk7XG4gICAgICAgICAgICBwcmV2U2NsLmZyb21BcnJheShwcmV2S2V5LnNjYWxlLCBpICogMyk7XG5cbiAgICAgICAgICAgIG5leHRQb3MuZnJvbUFycmF5KG5leHRLZXkucG9zaXRpb24sIGkgKiAzKTtcbiAgICAgICAgICAgIG5leHRSb3QuZnJvbUFycmF5KG5leHRLZXkucXVhdGVybmlvbiwgaSAqIDQpO1xuICAgICAgICAgICAgbmV4dFNjbC5mcm9tQXJyYXkobmV4dEtleS5zY2FsZSwgaSAqIDMpO1xuXG4gICAgICAgICAgICBwcmV2UG9zLmxlcnAobmV4dFBvcywgYmxlbmQpO1xuICAgICAgICAgICAgcHJldlJvdC5zbGVycChuZXh0Um90LCBibGVuZCk7XG4gICAgICAgICAgICBwcmV2U2NsLmxlcnAobmV4dFNjbCwgYmxlbmQpO1xuXG4gICAgICAgICAgICBvYmplY3QucG9zaXRpb24ubGVycChwcmV2UG9zLCB3ZWlnaHQpO1xuICAgICAgICAgICAgb2JqZWN0LnF1YXRlcm5pb24uc2xlcnAocHJldlJvdCwgd2VpZ2h0KTtcbiAgICAgICAgICAgIG9iamVjdC5zY2FsZS5sZXJwKHByZXZTY2wsIHdlaWdodCk7XG4gICAgICAgIH0pO1xuICAgIH1cbn1cbiIsImltcG9ydCB7IEdlb21ldHJ5IH0gZnJvbSAnLi4vY29yZS9HZW9tZXRyeS5qcyc7XG5pbXBvcnQgeyBQbGFuZSB9IGZyb20gJy4vUGxhbmUuanMnO1xuXG5leHBvcnQgY2xhc3MgQm94IGV4dGVuZHMgR2VvbWV0cnkge1xuICAgIGNvbnN0cnVjdG9yKGdsLCB7IHdpZHRoID0gMSwgaGVpZ2h0ID0gMSwgZGVwdGggPSAxLCB3aWR0aFNlZ21lbnRzID0gMSwgaGVpZ2h0U2VnbWVudHMgPSAxLCBkZXB0aFNlZ21lbnRzID0gMSwgYXR0cmlidXRlcyA9IHt9IH0gPSB7fSkge1xuICAgICAgICBjb25zdCB3U2VncyA9IHdpZHRoU2VnbWVudHM7XG4gICAgICAgIGNvbnN0IGhTZWdzID0gaGVpZ2h0U2VnbWVudHM7XG4gICAgICAgIGNvbnN0IGRTZWdzID0gZGVwdGhTZWdtZW50cztcblxuICAgICAgICBjb25zdCBudW0gPSAod1NlZ3MgKyAxKSAqIChoU2VncyArIDEpICogMiArICh3U2VncyArIDEpICogKGRTZWdzICsgMSkgKiAyICsgKGhTZWdzICsgMSkgKiAoZFNlZ3MgKyAxKSAqIDI7XG4gICAgICAgIGNvbnN0IG51bUluZGljZXMgPSAod1NlZ3MgKiBoU2VncyAqIDIgKyB3U2VncyAqIGRTZWdzICogMiArIGhTZWdzICogZFNlZ3MgKiAyKSAqIDY7XG5cbiAgICAgICAgY29uc3QgcG9zaXRpb24gPSBuZXcgRmxvYXQzMkFycmF5KG51bSAqIDMpO1xuICAgICAgICBjb25zdCBub3JtYWwgPSBuZXcgRmxvYXQzMkFycmF5KG51bSAqIDMpO1xuICAgICAgICBjb25zdCB1diA9IG5ldyBGbG9hdDMyQXJyYXkobnVtICogMik7XG4gICAgICAgIGNvbnN0IGluZGV4ID0gbnVtID4gNjU1MzYgPyBuZXcgVWludDMyQXJyYXkobnVtSW5kaWNlcykgOiBuZXcgVWludDE2QXJyYXkobnVtSW5kaWNlcyk7XG5cbiAgICAgICAgbGV0IGkgPSAwO1xuICAgICAgICBsZXQgaWkgPSAwO1xuXG4gICAgICAgIC8vIGxlZnQsIHJpZ2h0XG4gICAgICAgIFBsYW5lLmJ1aWxkUGxhbmUocG9zaXRpb24sIG5vcm1hbCwgdXYsIGluZGV4LCBkZXB0aCwgaGVpZ2h0LCB3aWR0aCwgZFNlZ3MsIGhTZWdzLCAyLCAxLCAwLCAtMSwgLTEsIGksIGlpKTtcbiAgICAgICAgUGxhbmUuYnVpbGRQbGFuZShcbiAgICAgICAgICAgIHBvc2l0aW9uLFxuICAgICAgICAgICAgbm9ybWFsLFxuICAgICAgICAgICAgdXYsXG4gICAgICAgICAgICBpbmRleCxcbiAgICAgICAgICAgIGRlcHRoLFxuICAgICAgICAgICAgaGVpZ2h0LFxuICAgICAgICAgICAgLXdpZHRoLFxuICAgICAgICAgICAgZFNlZ3MsXG4gICAgICAgICAgICBoU2VncyxcbiAgICAgICAgICAgIDIsXG4gICAgICAgICAgICAxLFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDEsXG4gICAgICAgICAgICAtMSxcbiAgICAgICAgICAgIChpICs9IChkU2VncyArIDEpICogKGhTZWdzICsgMSkpLFxuICAgICAgICAgICAgKGlpICs9IGRTZWdzICogaFNlZ3MpXG4gICAgICAgICk7XG5cbiAgICAgICAgLy8gdG9wLCBib3R0b21cbiAgICAgICAgUGxhbmUuYnVpbGRQbGFuZShcbiAgICAgICAgICAgIHBvc2l0aW9uLFxuICAgICAgICAgICAgbm9ybWFsLFxuICAgICAgICAgICAgdXYsXG4gICAgICAgICAgICBpbmRleCxcbiAgICAgICAgICAgIHdpZHRoLFxuICAgICAgICAgICAgZGVwdGgsXG4gICAgICAgICAgICBoZWlnaHQsXG4gICAgICAgICAgICBkU2VncyxcbiAgICAgICAgICAgIGhTZWdzLFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDIsXG4gICAgICAgICAgICAxLFxuICAgICAgICAgICAgMSxcbiAgICAgICAgICAgIDEsXG4gICAgICAgICAgICAoaSArPSAoZFNlZ3MgKyAxKSAqIChoU2VncyArIDEpKSxcbiAgICAgICAgICAgIChpaSArPSBkU2VncyAqIGhTZWdzKVxuICAgICAgICApO1xuICAgICAgICBQbGFuZS5idWlsZFBsYW5lKFxuICAgICAgICAgICAgcG9zaXRpb24sXG4gICAgICAgICAgICBub3JtYWwsXG4gICAgICAgICAgICB1dixcbiAgICAgICAgICAgIGluZGV4LFxuICAgICAgICAgICAgd2lkdGgsXG4gICAgICAgICAgICBkZXB0aCxcbiAgICAgICAgICAgIC1oZWlnaHQsXG4gICAgICAgICAgICBkU2VncyxcbiAgICAgICAgICAgIGhTZWdzLFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDIsXG4gICAgICAgICAgICAxLFxuICAgICAgICAgICAgMSxcbiAgICAgICAgICAgIC0xLFxuICAgICAgICAgICAgKGkgKz0gKHdTZWdzICsgMSkgKiAoZFNlZ3MgKyAxKSksXG4gICAgICAgICAgICAoaWkgKz0gd1NlZ3MgKiBkU2VncylcbiAgICAgICAgKTtcblxuICAgICAgICAvLyBmcm9udCwgYmFja1xuICAgICAgICBQbGFuZS5idWlsZFBsYW5lKFxuICAgICAgICAgICAgcG9zaXRpb24sXG4gICAgICAgICAgICBub3JtYWwsXG4gICAgICAgICAgICB1dixcbiAgICAgICAgICAgIGluZGV4LFxuICAgICAgICAgICAgd2lkdGgsXG4gICAgICAgICAgICBoZWlnaHQsXG4gICAgICAgICAgICAtZGVwdGgsXG4gICAgICAgICAgICB3U2VncyxcbiAgICAgICAgICAgIGhTZWdzLFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDEsXG4gICAgICAgICAgICAyLFxuICAgICAgICAgICAgLTEsXG4gICAgICAgICAgICAtMSxcbiAgICAgICAgICAgIChpICs9ICh3U2VncyArIDEpICogKGRTZWdzICsgMSkpLFxuICAgICAgICAgICAgKGlpICs9IHdTZWdzICogZFNlZ3MpXG4gICAgICAgICk7XG4gICAgICAgIFBsYW5lLmJ1aWxkUGxhbmUoXG4gICAgICAgICAgICBwb3NpdGlvbixcbiAgICAgICAgICAgIG5vcm1hbCxcbiAgICAgICAgICAgIHV2LFxuICAgICAgICAgICAgaW5kZXgsXG4gICAgICAgICAgICB3aWR0aCxcbiAgICAgICAgICAgIGhlaWdodCxcbiAgICAgICAgICAgIGRlcHRoLFxuICAgICAgICAgICAgd1NlZ3MsXG4gICAgICAgICAgICBoU2VncyxcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAxLFxuICAgICAgICAgICAgMixcbiAgICAgICAgICAgIDEsXG4gICAgICAgICAgICAtMSxcbiAgICAgICAgICAgIChpICs9ICh3U2VncyArIDEpICogKGhTZWdzICsgMSkpLFxuICAgICAgICAgICAgKGlpICs9IHdTZWdzICogaFNlZ3MpXG4gICAgICAgICk7XG5cbiAgICAgICAgT2JqZWN0LmFzc2lnbihhdHRyaWJ1dGVzLCB7XG4gICAgICAgICAgICBwb3NpdGlvbjogeyBzaXplOiAzLCBkYXRhOiBwb3NpdGlvbiB9LFxuICAgICAgICAgICAgbm9ybWFsOiB7IHNpemU6IDMsIGRhdGE6IG5vcm1hbCB9LFxuICAgICAgICAgICAgdXY6IHsgc2l6ZTogMiwgZGF0YTogdXYgfSxcbiAgICAgICAgICAgIGluZGV4OiB7IGRhdGE6IGluZGV4IH0sXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHN1cGVyKGdsLCBhdHRyaWJ1dGVzKTtcbiAgICB9XG59XG4iLCJpbXBvcnQgeyBWZWMzIH0gZnJvbSAnLi4vbWF0aC9WZWMzLmpzJztcblxuY29uc3QgQ0FUTVVMTFJPTSA9ICdjYXRtdWxscm9tJztcbmNvbnN0IENVQklDQkVaSUVSID0gJ2N1YmljYmV6aWVyJztcbmNvbnN0IFFVQURSQVRJQ0JFWklFUiA9ICdxdWFkcmF0aWNiZXppZXInO1xuXG4vLyB0ZW1wXG5jb25zdCBfYTAgPSBuZXcgVmVjMygpLFxuICAgIF9hMSA9IG5ldyBWZWMzKCksXG4gICAgX2EyID0gbmV3IFZlYzMoKSxcbiAgICBfYTMgPSBuZXcgVmVjMygpO1xuXG4vKipcbiAqIEdldCB0aGUgY29udHJvbCBwb2ludHMgb2YgY3ViaWMgYmV6aWVyIGN1cnZlLlxuICogQHBhcmFtIHsqfSBpXG4gKiBAcGFyYW0geyp9IGFcbiAqIEBwYXJhbSB7Kn0gYlxuICovXG5mdW5jdGlvbiBnZXRDdHJsUG9pbnQocG9pbnRzLCBpLCBhID0gMC4xNjgsIGIgPSAwLjE2OCkge1xuICAgIGlmIChpIDwgMSkge1xuICAgICAgICBfYTAuc3ViKHBvaW50c1sxXSwgcG9pbnRzWzBdKS5zY2FsZShhKS5hZGQocG9pbnRzWzBdKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBfYTAuc3ViKHBvaW50c1tpICsgMV0sIHBvaW50c1tpIC0gMV0pXG4gICAgICAgICAgICAuc2NhbGUoYSlcbiAgICAgICAgICAgIC5hZGQocG9pbnRzW2ldKTtcbiAgICB9XG4gICAgaWYgKGkgPiBwb2ludHMubGVuZ3RoIC0gMykge1xuICAgICAgICBjb25zdCBsYXN0ID0gcG9pbnRzLmxlbmd0aCAtIDE7XG4gICAgICAgIF9hMS5zdWIocG9pbnRzW2xhc3QgLSAxXSwgcG9pbnRzW2xhc3RdKVxuICAgICAgICAgICAgLnNjYWxlKGIpXG4gICAgICAgICAgICAuYWRkKHBvaW50c1tsYXN0XSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgX2ExLnN1Yihwb2ludHNbaV0sIHBvaW50c1tpICsgMl0pXG4gICAgICAgICAgICAuc2NhbGUoYilcbiAgICAgICAgICAgIC5hZGQocG9pbnRzW2kgKyAxXSk7XG4gICAgfVxuICAgIHJldHVybiBbX2EwLmNsb25lKCksIF9hMS5jbG9uZSgpXTtcbn1cblxuZnVuY3Rpb24gZ2V0UXVhZHJhdGljQmV6aWVyUG9pbnQodCwgcDAsIGMwLCBwMSkge1xuICAgIGNvbnN0IGsgPSAxIC0gdDtcbiAgICBfYTAuY29weShwMCkuc2NhbGUoayAqKiAyKTtcbiAgICBfYTEuY29weShjMCkuc2NhbGUoMiAqIGsgKiB0KTtcbiAgICBfYTIuY29weShwMSkuc2NhbGUodCAqKiAyKTtcbiAgICBjb25zdCByZXQgPSBuZXcgVmVjMygpO1xuICAgIHJldC5hZGQoX2EwLCBfYTEpLmFkZChfYTIpO1xuICAgIHJldHVybiByZXQ7XG59XG5cbmZ1bmN0aW9uIGdldEN1YmljQmV6aWVyUG9pbnQodCwgcDAsIGMwLCBjMSwgcDEpIHtcbiAgICBjb25zdCBrID0gMSAtIHQ7XG4gICAgX2EwLmNvcHkocDApLnNjYWxlKGsgKiogMyk7XG4gICAgX2ExLmNvcHkoYzApLnNjYWxlKDMgKiBrICoqIDIgKiB0KTtcbiAgICBfYTIuY29weShjMSkuc2NhbGUoMyAqIGsgKiB0ICoqIDIpO1xuICAgIF9hMy5jb3B5KHAxKS5zY2FsZSh0ICoqIDMpO1xuICAgIGNvbnN0IHJldCA9IG5ldyBWZWMzKCk7XG4gICAgcmV0LmFkZChfYTAsIF9hMSkuYWRkKF9hMikuYWRkKF9hMyk7XG4gICAgcmV0dXJuIHJldDtcbn1cblxuZXhwb3J0IGNsYXNzIEN1cnZlIHtcbiAgICBjb25zdHJ1Y3Rvcih7IHBvaW50cyA9IFtuZXcgVmVjMygwLCAwLCAwKSwgbmV3IFZlYzMoMCwgMSwgMCksIG5ldyBWZWMzKDEsIDEsIDApLCBuZXcgVmVjMygxLCAwLCAwKV0sIGRpdmlzaW9ucyA9IDEyLCB0eXBlID0gQ0FUTVVMTFJPTSB9ID0ge30pIHtcbiAgICAgICAgdGhpcy5wb2ludHMgPSBwb2ludHM7XG4gICAgICAgIHRoaXMuZGl2aXNpb25zID0gZGl2aXNpb25zO1xuICAgICAgICB0aGlzLnR5cGUgPSB0eXBlO1xuICAgIH1cblxuICAgIF9nZXRRdWFkcmF0aWNCZXppZXJQb2ludHMoZGl2aXNpb25zID0gdGhpcy5kaXZpc2lvbnMpIHtcbiAgICAgICAgY29uc3QgcG9pbnRzID0gW107XG4gICAgICAgIGNvbnN0IGNvdW50ID0gdGhpcy5wb2ludHMubGVuZ3RoO1xuXG4gICAgICAgIGlmIChjb3VudCA8IDMpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybignTm90IGVub3VnaCBwb2ludHMgcHJvdmlkZWQuJyk7XG4gICAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBwMCA9IHRoaXMucG9pbnRzWzBdO1xuICAgICAgICBsZXQgYzAgPSB0aGlzLnBvaW50c1sxXSxcbiAgICAgICAgICAgIHAxID0gdGhpcy5wb2ludHNbMl07XG5cbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPD0gZGl2aXNpb25zOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IHAgPSBnZXRRdWFkcmF0aWNCZXppZXJQb2ludChpIC8gZGl2aXNpb25zLCBwMCwgYzAsIHAxKTtcbiAgICAgICAgICAgIHBvaW50cy5wdXNoKHApO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IG9mZnNldCA9IDM7XG4gICAgICAgIHdoaWxlIChjb3VudCAtIG9mZnNldCA+IDApIHtcbiAgICAgICAgICAgIHAwLmNvcHkocDEpO1xuICAgICAgICAgICAgYzAgPSBwMS5zY2FsZSgyKS5zdWIoYzApO1xuICAgICAgICAgICAgcDEgPSB0aGlzLnBvaW50c1tvZmZzZXRdO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDE7IGkgPD0gZGl2aXNpb25zOyBpKyspIHtcbiAgICAgICAgICAgICAgICBjb25zdCBwID0gZ2V0UXVhZHJhdGljQmV6aWVyUG9pbnQoaSAvIGRpdmlzaW9ucywgcDAsIGMwLCBwMSk7XG4gICAgICAgICAgICAgICAgcG9pbnRzLnB1c2gocCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBvZmZzZXQrKztcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBwb2ludHM7XG4gICAgfVxuXG4gICAgX2dldEN1YmljQmV6aWVyUG9pbnRzKGRpdmlzaW9ucyA9IHRoaXMuZGl2aXNpb25zKSB7XG4gICAgICAgIGNvbnN0IHBvaW50cyA9IFtdO1xuICAgICAgICBjb25zdCBjb3VudCA9IHRoaXMucG9pbnRzLmxlbmd0aDtcblxuICAgICAgICBpZiAoY291bnQgPCA0KSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oJ05vdCBlbm91Z2ggcG9pbnRzIHByb3ZpZGVkLicpO1xuICAgICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHAwID0gdGhpcy5wb2ludHNbMF0sXG4gICAgICAgICAgICBjMCA9IHRoaXMucG9pbnRzWzFdLFxuICAgICAgICAgICAgYzEgPSB0aGlzLnBvaW50c1syXSxcbiAgICAgICAgICAgIHAxID0gdGhpcy5wb2ludHNbM107XG5cbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPD0gZGl2aXNpb25zOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IHAgPSBnZXRDdWJpY0JlemllclBvaW50KGkgLyBkaXZpc2lvbnMsIHAwLCBjMCwgYzEsIHAxKTtcbiAgICAgICAgICAgIHBvaW50cy5wdXNoKHApO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IG9mZnNldCA9IDQ7XG4gICAgICAgIHdoaWxlIChjb3VudCAtIG9mZnNldCA+IDEpIHtcbiAgICAgICAgICAgIHAwLmNvcHkocDEpO1xuICAgICAgICAgICAgYzAgPSBwMS5zY2FsZSgyKS5zdWIoYzEpO1xuICAgICAgICAgICAgYzEgPSB0aGlzLnBvaW50c1tvZmZzZXRdO1xuICAgICAgICAgICAgcDEgPSB0aGlzLnBvaW50c1tvZmZzZXQgKyAxXTtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAxOyBpIDw9IGRpdmlzaW9uczsgaSsrKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcCA9IGdldEN1YmljQmV6aWVyUG9pbnQoaSAvIGRpdmlzaW9ucywgcDAsIGMwLCBjMSwgcDEpO1xuICAgICAgICAgICAgICAgIHBvaW50cy5wdXNoKHApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgb2Zmc2V0ICs9IDI7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcG9pbnRzO1xuICAgIH1cblxuICAgIF9nZXRDYXRtdWxsUm9tUG9pbnRzKGRpdmlzaW9ucyA9IHRoaXMuZGl2aXNpb25zLCBhID0gMC4xNjgsIGIgPSAwLjE2OCkge1xuICAgICAgICBjb25zdCBwb2ludHMgPSBbXTtcbiAgICAgICAgY29uc3QgY291bnQgPSB0aGlzLnBvaW50cy5sZW5ndGg7XG5cbiAgICAgICAgaWYgKGNvdW50IDw9IDIpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnBvaW50cztcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBwMDtcbiAgICAgICAgdGhpcy5wb2ludHMuZm9yRWFjaCgocCwgaSkgPT4ge1xuICAgICAgICAgICAgaWYgKGkgPT09IDApIHtcbiAgICAgICAgICAgICAgICBwMCA9IHA7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnN0IFtjMCwgYzFdID0gZ2V0Q3RybFBvaW50KHRoaXMucG9pbnRzLCBpIC0gMSwgYSwgYik7XG4gICAgICAgICAgICAgICAgY29uc3QgYyA9IG5ldyBDdXJ2ZSh7XG4gICAgICAgICAgICAgICAgICAgIHBvaW50czogW3AwLCBjMCwgYzEsIHBdLFxuICAgICAgICAgICAgICAgICAgICB0eXBlOiBDVUJJQ0JFWklFUixcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBwb2ludHMucG9wKCk7XG4gICAgICAgICAgICAgICAgcG9pbnRzLnB1c2goLi4uYy5nZXRQb2ludHMoZGl2aXNpb25zKSk7XG4gICAgICAgICAgICAgICAgcDAgPSBwO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gcG9pbnRzO1xuICAgIH1cblxuICAgIGdldFBvaW50cyhkaXZpc2lvbnMgPSB0aGlzLmRpdmlzaW9ucywgYSA9IDAuMTY4LCBiID0gMC4xNjgpIHtcbiAgICAgICAgY29uc3QgdHlwZSA9IHRoaXMudHlwZTtcblxuICAgICAgICBpZiAodHlwZSA9PT0gUVVBRFJBVElDQkVaSUVSKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fZ2V0UXVhZHJhdGljQmV6aWVyUG9pbnRzKGRpdmlzaW9ucyk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodHlwZSA9PT0gQ1VCSUNCRVpJRVIpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9nZXRDdWJpY0JlemllclBvaW50cyhkaXZpc2lvbnMpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHR5cGUgPT09IENBVE1VTExST00pIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9nZXRDYXRtdWxsUm9tUG9pbnRzKGRpdmlzaW9ucywgYSwgYik7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcy5wb2ludHM7XG4gICAgfVxufVxuXG5DdXJ2ZS5DQVRNVUxMUk9NID0gQ0FUTVVMTFJPTTtcbkN1cnZlLkNVQklDQkVaSUVSID0gQ1VCSUNCRVpJRVI7XG5DdXJ2ZS5RVUFEUkFUSUNCRVpJRVIgPSBRVUFEUkFUSUNCRVpJRVI7XG4iLCJpbXBvcnQgeyBHZW9tZXRyeSB9IGZyb20gJy4uL2NvcmUvR2VvbWV0cnkuanMnO1xuaW1wb3J0IHsgVmVjMyB9IGZyb20gJy4uL21hdGgvVmVjMy5qcyc7XG5cbmV4cG9ydCBjbGFzcyBDeWxpbmRlciBleHRlbmRzIEdlb21ldHJ5IHtcbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgZ2wsXG4gICAgICAgIHtcbiAgICAgICAgICAgIHJhZGl1c1RvcCA9IDAuNSxcbiAgICAgICAgICAgIHJhZGl1c0JvdHRvbSA9IDAuNSxcbiAgICAgICAgICAgIGhlaWdodCA9IDEsXG4gICAgICAgICAgICByYWRpYWxTZWdtZW50cyA9IDgsXG4gICAgICAgICAgICBoZWlnaHRTZWdtZW50cyA9IDEsXG4gICAgICAgICAgICBvcGVuRW5kZWQgPSBmYWxzZSxcbiAgICAgICAgICAgIHRoZXRhU3RhcnQgPSAwLFxuICAgICAgICAgICAgdGhldGFMZW5ndGggPSBNYXRoLlBJICogMixcbiAgICAgICAgICAgIGF0dHJpYnV0ZXMgPSB7fSxcbiAgICAgICAgfSA9IHt9XG4gICAgKSB7XG4gICAgICAgIGNvbnN0IHJTZWdzID0gcmFkaWFsU2VnbWVudHM7XG4gICAgICAgIGNvbnN0IGhTZWdzID0gaGVpZ2h0U2VnbWVudHM7XG4gICAgICAgIGNvbnN0IHRTdGFydCA9IHRoZXRhU3RhcnQ7XG4gICAgICAgIGNvbnN0IHRMZW5ndGggPSB0aGV0YUxlbmd0aDtcblxuICAgICAgICBjb25zdCBudW1DYXBzID0gb3BlbkVuZGVkID8gMCA6IHJhZGl1c0JvdHRvbSAmJiByYWRpdXNUb3AgPyAyIDogMTtcbiAgICAgICAgY29uc3QgbnVtID0gKHJTZWdzICsgMSkgKiAoaFNlZ3MgKyAxICsgbnVtQ2FwcykgKyBudW1DYXBzO1xuICAgICAgICBjb25zdCBudW1JbmRpY2VzID0gclNlZ3MgKiBoU2VncyAqIDYgKyBudW1DYXBzICogclNlZ3MgKiAzO1xuXG4gICAgICAgIGNvbnN0IHBvc2l0aW9uID0gbmV3IEZsb2F0MzJBcnJheShudW0gKiAzKTtcbiAgICAgICAgY29uc3Qgbm9ybWFsID0gbmV3IEZsb2F0MzJBcnJheShudW0gKiAzKTtcbiAgICAgICAgY29uc3QgdXYgPSBuZXcgRmxvYXQzMkFycmF5KG51bSAqIDIpO1xuICAgICAgICBjb25zdCBpbmRleCA9IG51bSA+IDY1NTM2ID8gbmV3IFVpbnQzMkFycmF5KG51bUluZGljZXMpIDogbmV3IFVpbnQxNkFycmF5KG51bUluZGljZXMpO1xuXG4gICAgICAgIGxldCBpID0gMDtcbiAgICAgICAgbGV0IGlpID0gMDtcbiAgICAgICAgY29uc3QgaW5kZXhBcnJheSA9IFtdO1xuXG4gICAgICAgIGFkZEhlaWdodCgpO1xuICAgICAgICBpZiAoIW9wZW5FbmRlZCkge1xuICAgICAgICAgICAgaWYgKHJhZGl1c1RvcCkgYWRkQ2FwKHRydWUpO1xuICAgICAgICAgICAgaWYgKHJhZGl1c0JvdHRvbSkgYWRkQ2FwKGZhbHNlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIGFkZEhlaWdodCgpIHtcbiAgICAgICAgICAgIGxldCB4LCB5O1xuICAgICAgICAgICAgY29uc3QgbiA9IG5ldyBWZWMzKCk7XG4gICAgICAgICAgICBjb25zdCBzbG9wZSA9IChyYWRpdXNCb3R0b20gLSByYWRpdXNUb3ApIC8gaGVpZ2h0O1xuXG4gICAgICAgICAgICBmb3IgKHkgPSAwOyB5IDw9IGhTZWdzOyB5KyspIHtcbiAgICAgICAgICAgICAgICBjb25zdCBpbmRleFJvdyA9IFtdO1xuICAgICAgICAgICAgICAgIGNvbnN0IHYgPSB5IC8gaFNlZ3M7XG5cbiAgICAgICAgICAgICAgICBjb25zdCByID0gdiAqIChyYWRpdXNCb3R0b20gLSByYWRpdXNUb3ApICsgcmFkaXVzVG9wO1xuICAgICAgICAgICAgICAgIGZvciAoeCA9IDA7IHggPD0gclNlZ3M7IHgrKykge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB1ID0geCAvIHJTZWdzO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB0aGV0YSA9IHUgKiB0TGVuZ3RoICsgdFN0YXJ0O1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBzaW5UaGV0YSA9IE1hdGguc2luKHRoZXRhKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY29zVGhldGEgPSBNYXRoLmNvcyh0aGV0YSk7XG5cbiAgICAgICAgICAgICAgICAgICAgcG9zaXRpb24uc2V0KFtyICogc2luVGhldGEsICgwLjUgLSB2KSAqIGhlaWdodCwgciAqIGNvc1RoZXRhXSwgaSAqIDMpO1xuICAgICAgICAgICAgICAgICAgICBuLnNldChzaW5UaGV0YSwgc2xvcGUsIGNvc1RoZXRhKS5ub3JtYWxpemUoKTtcbiAgICAgICAgICAgICAgICAgICAgbm9ybWFsLnNldChbbi54LCBuLnksIG4uel0sIGkgKiAzKTtcbiAgICAgICAgICAgICAgICAgICAgdXYuc2V0KFt1LCAxIC0gdl0sIGkgKiAyKTtcbiAgICAgICAgICAgICAgICAgICAgaW5kZXhSb3cucHVzaChpKyspO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpbmRleEFycmF5LnB1c2goaW5kZXhSb3cpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmb3IgKHggPSAwOyB4IDwgclNlZ3M7IHgrKykge1xuICAgICAgICAgICAgICAgIGZvciAoeSA9IDA7IHkgPCBoU2VnczsgeSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGEgPSBpbmRleEFycmF5W3ldW3hdO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBiID0gaW5kZXhBcnJheVt5ICsgMV1beF07XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGMgPSBpbmRleEFycmF5W3kgKyAxXVt4ICsgMV07XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGQgPSBpbmRleEFycmF5W3ldW3ggKyAxXTtcblxuICAgICAgICAgICAgICAgICAgICBpbmRleC5zZXQoW2EsIGIsIGQsIGIsIGMsIGRdLCBpaSAqIDMpO1xuICAgICAgICAgICAgICAgICAgICBpaSArPSAyO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIGFkZENhcChpc1RvcCkge1xuICAgICAgICAgICAgbGV0IHg7XG4gICAgICAgICAgICBjb25zdCByID0gaXNUb3AgPT09IHRydWUgPyByYWRpdXNUb3AgOiByYWRpdXNCb3R0b207XG4gICAgICAgICAgICBjb25zdCBzaWduID0gaXNUb3AgPT09IHRydWUgPyAxIDogLTE7XG5cbiAgICAgICAgICAgIGNvbnN0IGNlbnRlckluZGV4ID0gaTtcbiAgICAgICAgICAgIHBvc2l0aW9uLnNldChbMCwgMC41ICogaGVpZ2h0ICogc2lnbiwgMF0sIGkgKiAzKTtcbiAgICAgICAgICAgIG5vcm1hbC5zZXQoWzAsIHNpZ24sIDBdLCBpICogMyk7XG4gICAgICAgICAgICB1di5zZXQoWzAuNSwgMC41XSwgaSAqIDIpO1xuICAgICAgICAgICAgaSsrO1xuXG4gICAgICAgICAgICBmb3IgKHggPSAwOyB4IDw9IHJTZWdzOyB4KyspIHtcbiAgICAgICAgICAgICAgICBjb25zdCB1ID0geCAvIHJTZWdzO1xuICAgICAgICAgICAgICAgIGNvbnN0IHRoZXRhID0gdSAqIHRMZW5ndGggKyB0U3RhcnQ7XG4gICAgICAgICAgICAgICAgY29uc3QgY29zVGhldGEgPSBNYXRoLmNvcyh0aGV0YSk7XG4gICAgICAgICAgICAgICAgY29uc3Qgc2luVGhldGEgPSBNYXRoLnNpbih0aGV0YSk7XG5cbiAgICAgICAgICAgICAgICBwb3NpdGlvbi5zZXQoW3IgKiBzaW5UaGV0YSwgMC41ICogaGVpZ2h0ICogc2lnbiwgciAqIGNvc1RoZXRhXSwgaSAqIDMpO1xuICAgICAgICAgICAgICAgIG5vcm1hbC5zZXQoWzAsIHNpZ24sIDBdLCBpICogMyk7XG4gICAgICAgICAgICAgICAgdXYuc2V0KFtjb3NUaGV0YSAqIDAuNSArIDAuNSwgc2luVGhldGEgKiAwLjUgKiBzaWduICsgMC41XSwgaSAqIDIpO1xuICAgICAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZm9yICh4ID0gMDsgeCA8IHJTZWdzOyB4KyspIHtcbiAgICAgICAgICAgICAgICBjb25zdCBqID0gY2VudGVySW5kZXggKyB4ICsgMTtcbiAgICAgICAgICAgICAgICBpZiAoaXNUb3ApIHtcbiAgICAgICAgICAgICAgICAgICAgaW5kZXguc2V0KFtqLCBqICsgMSwgY2VudGVySW5kZXhdLCBpaSAqIDMpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGluZGV4LnNldChbaiArIDEsIGosIGNlbnRlckluZGV4XSwgaWkgKiAzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWkrKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIE9iamVjdC5hc3NpZ24oYXR0cmlidXRlcywge1xuICAgICAgICAgICAgcG9zaXRpb246IHsgc2l6ZTogMywgZGF0YTogcG9zaXRpb24gfSxcbiAgICAgICAgICAgIG5vcm1hbDogeyBzaXplOiAzLCBkYXRhOiBub3JtYWwgfSxcbiAgICAgICAgICAgIHV2OiB7IHNpemU6IDIsIGRhdGE6IHV2IH0sXG4gICAgICAgICAgICBpbmRleDogeyBkYXRhOiBpbmRleCB9LFxuICAgICAgICB9KTtcblxuICAgICAgICBzdXBlcihnbCwgYXR0cmlidXRlcyk7XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgUmVuZGVyVGFyZ2V0IH0gZnJvbSAnLi4vY29yZS9SZW5kZXJUYXJnZXQuanMnO1xuaW1wb3J0IHsgUHJvZ3JhbSB9IGZyb20gJy4uL2NvcmUvUHJvZ3JhbS5qcyc7XG5pbXBvcnQgeyBNZXNoIH0gZnJvbSAnLi4vY29yZS9NZXNoLmpzJztcbmltcG9ydCB7IFZlYzIgfSBmcm9tICcuLi9tYXRoL1ZlYzIuanMnO1xuaW1wb3J0IHsgVHJpYW5nbGUgfSBmcm9tICcuL1RyaWFuZ2xlLmpzJztcblxuZXhwb3J0IGNsYXNzIEZsb3dtYXAge1xuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICBnbCxcbiAgICAgICAge1xuICAgICAgICAgICAgc2l6ZSA9IDEyOCwgLy8gZGVmYXVsdCBzaXplIG9mIHRoZSByZW5kZXIgdGFyZ2V0c1xuICAgICAgICAgICAgZmFsbG9mZiA9IDAuMywgLy8gc2l6ZSBvZiB0aGUgc3RhbXAsIHBlcmNlbnRhZ2Ugb2YgdGhlIHNpemVcbiAgICAgICAgICAgIGFscGhhID0gMSwgLy8gb3BhY2l0eSBvZiB0aGUgc3RhbXBcbiAgICAgICAgICAgIGRpc3NpcGF0aW9uID0gMC45OCwgLy8gYWZmZWN0cyB0aGUgc3BlZWQgdGhhdCB0aGUgc3RhbXAgZmFkZXMuIENsb3NlciB0byAxIGlzIHNsb3dlclxuICAgICAgICAgICAgdHlwZSwgLy8gUGFzcyBpbiBnbC5GTE9BVCB0byBmb3JjZSBpdCwgZGVmYXVsdHMgdG8gZ2wuSEFMRl9GTE9BVFxuICAgICAgICB9ID0ge31cbiAgICApIHtcbiAgICAgICAgY29uc3QgX3RoaXMgPSB0aGlzO1xuICAgICAgICB0aGlzLmdsID0gZ2w7XG5cbiAgICAgICAgLy8gb3V0cHV0IHVuaWZvcm0gY29udGFpbmluZyByZW5kZXIgdGFyZ2V0IHRleHR1cmVzXG4gICAgICAgIHRoaXMudW5pZm9ybSA9IHsgdmFsdWU6IG51bGwgfTtcblxuICAgICAgICB0aGlzLm1hc2sgPSB7XG4gICAgICAgICAgICByZWFkOiBudWxsLFxuICAgICAgICAgICAgd3JpdGU6IG51bGwsXG5cbiAgICAgICAgICAgIC8vIEhlbHBlciBmdW5jdGlvbiB0byBwaW5nIHBvbmcgdGhlIHJlbmRlciB0YXJnZXRzIGFuZCB1cGRhdGUgdGhlIHVuaWZvcm1cbiAgICAgICAgICAgIHN3YXA6ICgpID0+IHtcbiAgICAgICAgICAgICAgICBsZXQgdGVtcCA9IF90aGlzLm1hc2sucmVhZDtcbiAgICAgICAgICAgICAgICBfdGhpcy5tYXNrLnJlYWQgPSBfdGhpcy5tYXNrLndyaXRlO1xuICAgICAgICAgICAgICAgIF90aGlzLm1hc2sud3JpdGUgPSB0ZW1wO1xuICAgICAgICAgICAgICAgIF90aGlzLnVuaWZvcm0udmFsdWUgPSBfdGhpcy5tYXNrLnJlYWQudGV4dHVyZTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH07XG5cbiAgICAgICAge1xuICAgICAgICAgICAgY3JlYXRlRkJPcygpO1xuXG4gICAgICAgICAgICB0aGlzLmFzcGVjdCA9IDE7XG4gICAgICAgICAgICB0aGlzLm1vdXNlID0gbmV3IFZlYzIoKTtcbiAgICAgICAgICAgIHRoaXMudmVsb2NpdHkgPSBuZXcgVmVjMigpO1xuXG4gICAgICAgICAgICB0aGlzLm1lc2ggPSBpbml0UHJvZ3JhbSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gY3JlYXRlRkJPcygpIHtcbiAgICAgICAgICAgIC8vIFJlcXVlc3RlZCB0eXBlIG5vdCBzdXBwb3J0ZWQsIGZhbGwgYmFjayB0byBoYWxmIGZsb2F0XG4gICAgICAgICAgICBpZiAoIXR5cGUpIHR5cGUgPSBnbC5IQUxGX0ZMT0FUIHx8IGdsLnJlbmRlcmVyLmV4dGVuc2lvbnNbJ09FU190ZXh0dXJlX2hhbGZfZmxvYXQnXS5IQUxGX0ZMT0FUX09FUztcblxuICAgICAgICAgICAgbGV0IG1pbkZpbHRlciA9ICgoKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGdsLnJlbmRlcmVyLmlzV2ViZ2wyKSByZXR1cm4gZ2wuTElORUFSO1xuICAgICAgICAgICAgICAgIGlmIChnbC5yZW5kZXJlci5leHRlbnNpb25zW2BPRVNfdGV4dHVyZV8ke3R5cGUgPT09IGdsLkZMT0FUID8gJycgOiAnaGFsZl8nfWZsb2F0X2xpbmVhcmBdKSByZXR1cm4gZ2wuTElORUFSO1xuICAgICAgICAgICAgICAgIHJldHVybiBnbC5ORUFSRVNUO1xuICAgICAgICAgICAgfSkoKTtcblxuICAgICAgICAgICAgY29uc3Qgb3B0aW9ucyA9IHtcbiAgICAgICAgICAgICAgICB3aWR0aDogc2l6ZSxcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IHNpemUsXG4gICAgICAgICAgICAgICAgdHlwZSxcbiAgICAgICAgICAgICAgICBmb3JtYXQ6IGdsLlJHQkEsXG4gICAgICAgICAgICAgICAgaW50ZXJuYWxGb3JtYXQ6IGdsLnJlbmRlcmVyLmlzV2ViZ2wyID8gKHR5cGUgPT09IGdsLkZMT0FUID8gZ2wuUkdCQTMyRiA6IGdsLlJHQkExNkYpIDogZ2wuUkdCQSxcbiAgICAgICAgICAgICAgICBtaW5GaWx0ZXIsXG4gICAgICAgICAgICAgICAgZGVwdGg6IGZhbHNlLFxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgX3RoaXMubWFzay5yZWFkID0gbmV3IFJlbmRlclRhcmdldChnbCwgb3B0aW9ucyk7XG4gICAgICAgICAgICBfdGhpcy5tYXNrLndyaXRlID0gbmV3IFJlbmRlclRhcmdldChnbCwgb3B0aW9ucyk7XG4gICAgICAgICAgICBfdGhpcy5tYXNrLnN3YXAoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIGluaXRQcm9ncmFtKCkge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBNZXNoKGdsLCB7XG4gICAgICAgICAgICAgICAgLy8gVHJpYW5nbGUgdGhhdCBpbmNsdWRlcyAtMSB0byAxIHJhbmdlIGZvciAncG9zaXRpb24nLCBhbmQgMCB0byAxIHJhbmdlIGZvciAndXYnLlxuICAgICAgICAgICAgICAgIGdlb21ldHJ5OiBuZXcgVHJpYW5nbGUoZ2wpLFxuXG4gICAgICAgICAgICAgICAgcHJvZ3JhbTogbmV3IFByb2dyYW0oZ2wsIHtcbiAgICAgICAgICAgICAgICAgICAgdmVydGV4LFxuICAgICAgICAgICAgICAgICAgICBmcmFnbWVudCxcbiAgICAgICAgICAgICAgICAgICAgdW5pZm9ybXM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRNYXA6IF90aGlzLnVuaWZvcm0sXG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHVGYWxsb2ZmOiB7IHZhbHVlOiBmYWxsb2ZmICogMC41IH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB1QWxwaGE6IHsgdmFsdWU6IGFscGhhIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB1RGlzc2lwYXRpb246IHsgdmFsdWU6IGRpc3NpcGF0aW9uIH0sXG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFVzZXIgbmVlZHMgdG8gdXBkYXRlIHRoZXNlXG4gICAgICAgICAgICAgICAgICAgICAgICB1QXNwZWN0OiB7IHZhbHVlOiAxIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB1TW91c2U6IHsgdmFsdWU6IF90aGlzLm1vdXNlIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB1VmVsb2NpdHk6IHsgdmFsdWU6IF90aGlzLnZlbG9jaXR5IH0sXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIGRlcHRoVGVzdDogZmFsc2UsXG4gICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHVwZGF0ZSgpIHtcbiAgICAgICAgdGhpcy5tZXNoLnByb2dyYW0udW5pZm9ybXMudUFzcGVjdC52YWx1ZSA9IHRoaXMuYXNwZWN0O1xuXG4gICAgICAgIHRoaXMuZ2wucmVuZGVyZXIucmVuZGVyKHtcbiAgICAgICAgICAgIHNjZW5lOiB0aGlzLm1lc2gsXG4gICAgICAgICAgICB0YXJnZXQ6IHRoaXMubWFzay53cml0ZSxcbiAgICAgICAgICAgIGNsZWFyOiBmYWxzZSxcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMubWFzay5zd2FwKCk7XG4gICAgfVxufVxuXG5jb25zdCB2ZXJ0ZXggPSAvKiBnbHNsICovIGBcbiAgICBhdHRyaWJ1dGUgdmVjMiB1djtcbiAgICBhdHRyaWJ1dGUgdmVjMiBwb3NpdGlvbjtcblxuICAgIHZhcnlpbmcgdmVjMiB2VXY7XG5cbiAgICB2b2lkIG1haW4oKSB7XG4gICAgICAgIHZVdiA9IHV2O1xuICAgICAgICBnbF9Qb3NpdGlvbiA9IHZlYzQocG9zaXRpb24sIDAsIDEpO1xuICAgIH1cbmA7XG5cbmNvbnN0IGZyYWdtZW50ID0gLyogZ2xzbCAqLyBgXG4gICAgcHJlY2lzaW9uIGhpZ2hwIGZsb2F0O1xuXG4gICAgdW5pZm9ybSBzYW1wbGVyMkQgdE1hcDtcblxuICAgIHVuaWZvcm0gZmxvYXQgdUZhbGxvZmY7XG4gICAgdW5pZm9ybSBmbG9hdCB1QWxwaGE7XG4gICAgdW5pZm9ybSBmbG9hdCB1RGlzc2lwYXRpb247XG4gICAgXG4gICAgdW5pZm9ybSBmbG9hdCB1QXNwZWN0O1xuICAgIHVuaWZvcm0gdmVjMiB1TW91c2U7XG4gICAgdW5pZm9ybSB2ZWMyIHVWZWxvY2l0eTtcblxuICAgIHZhcnlpbmcgdmVjMiB2VXY7XG5cbiAgICB2b2lkIG1haW4oKSB7XG4gICAgICAgIHZlYzQgY29sb3IgPSB0ZXh0dXJlMkQodE1hcCwgdlV2KSAqIHVEaXNzaXBhdGlvbjtcblxuICAgICAgICB2ZWMyIGN1cnNvciA9IHZVdiAtIHVNb3VzZTtcbiAgICAgICAgY3Vyc29yLnggKj0gdUFzcGVjdDtcblxuICAgICAgICB2ZWMzIHN0YW1wID0gdmVjMyh1VmVsb2NpdHkgKiB2ZWMyKDEsIC0xKSwgMS4wIC0gcG93KDEuMCAtIG1pbigxLjAsIGxlbmd0aCh1VmVsb2NpdHkpKSwgMy4wKSk7XG4gICAgICAgIGZsb2F0IGZhbGxvZmYgPSBzbW9vdGhzdGVwKHVGYWxsb2ZmLCAwLjAsIGxlbmd0aChjdXJzb3IpKSAqIHVBbHBoYTtcblxuICAgICAgICBjb2xvci5yZ2IgPSBtaXgoY29sb3IucmdiLCBzdGFtcCwgdmVjMyhmYWxsb2ZmKSk7XG5cbiAgICAgICAgZ2xfRnJhZ0NvbG9yID0gY29sb3I7XG4gICAgfVxuYDtcbiIsImltcG9ydCB7IFZlYzMgfSBmcm9tICcuLi9tYXRoL1ZlYzMuanMnO1xuaW1wb3J0IHsgUXVhdCB9IGZyb20gJy4uL21hdGgvUXVhdC5qcyc7XG5cbmNvbnN0IHRtcFZlYzNBID0gbmV3IFZlYzMoKTtcbmNvbnN0IHRtcFZlYzNCID0gbmV3IFZlYzMoKTtcbmNvbnN0IHRtcFZlYzNDID0gbmV3IFZlYzMoKTtcbmNvbnN0IHRtcFZlYzNEID0gbmV3IFZlYzMoKTtcblxuY29uc3QgdG1wUXVhdEEgPSBuZXcgUXVhdCgpO1xuY29uc3QgdG1wUXVhdEIgPSBuZXcgUXVhdCgpO1xuY29uc3QgdG1wUXVhdEMgPSBuZXcgUXVhdCgpO1xuY29uc3QgdG1wUXVhdEQgPSBuZXcgUXVhdCgpO1xuXG5leHBvcnQgY2xhc3MgR0xURkFuaW1hdGlvbiB7XG4gICAgY29uc3RydWN0b3IoZGF0YSwgd2VpZ2h0ID0gMSkge1xuICAgICAgICB0aGlzLmRhdGEgPSBkYXRhO1xuICAgICAgICB0aGlzLmVsYXBzZWQgPSAwO1xuICAgICAgICB0aGlzLndlaWdodCA9IHdlaWdodDtcblxuICAgICAgICAvLyBTZXQgdG8gZmFsc2UgdG8gbm90IGFwcGx5IG1vZHVsbyB0byBlbGFwc2VkIGFnYWluc3QgZHVyYXRpb25cbiAgICAgICAgdGhpcy5sb29wID0gdHJ1ZTtcblxuICAgICAgICAvLyBGaW5kIHN0YXJ0aW5nIHRpbWUgYXMgZXhwb3J0cyBmcm9tIGJsZW5kZXIgKHBlcmhhcHMgb3RoZXJzIHRvbykgZG9uJ3QgYWx3YXlzIHN0YXJ0IGZyb20gMFxuICAgICAgICB0aGlzLnN0YXJ0VGltZSA9IGRhdGEucmVkdWNlKChhLCB7IHRpbWVzIH0pID0+IE1hdGgubWluKGEsIHRpbWVzWzBdKSwgSW5maW5pdHkpO1xuICAgICAgICAvLyBHZXQgbGFyZ2VzdCBmaW5hbCB0aW1lIGluIGFsbCBjaGFubmVscyB0byBjYWxjdWxhdGUgZHVyYXRpb25cbiAgICAgICAgdGhpcy5lbmRUaW1lID0gZGF0YS5yZWR1Y2UoKGEsIHsgdGltZXMgfSkgPT4gTWF0aC5tYXgoYSwgdGltZXNbdGltZXMubGVuZ3RoIC0gMV0pLCAwKTtcbiAgICAgICAgdGhpcy5kdXJhdGlvbiA9IHRoaXMuZW5kVGltZSAtIHRoaXMuc3RhcnRUaW1lO1xuICAgIH1cblxuICAgIHVwZGF0ZSh0b3RhbFdlaWdodCA9IDEsIGlzU2V0KSB7XG4gICAgICAgIGNvbnN0IHdlaWdodCA9IGlzU2V0ID8gMSA6IHRoaXMud2VpZ2h0IC8gdG90YWxXZWlnaHQ7XG4gICAgICAgIGNvbnN0IGVsYXBzZWQgPSAodGhpcy5sb29wID8gdGhpcy5lbGFwc2VkICUgdGhpcy5kdXJhdGlvbiA6IE1hdGgubWluKHRoaXMuZWxhcHNlZCwgdGhpcy5kdXJhdGlvbiAtIDAuMDAxKSkgKyB0aGlzLnN0YXJ0VGltZTtcblxuICAgICAgICB0aGlzLmRhdGEuZm9yRWFjaCgoeyBub2RlLCB0cmFuc2Zvcm0sIGludGVycG9sYXRpb24sIHRpbWVzLCB2YWx1ZXMgfSkgPT4ge1xuICAgICAgICAgICAgLy8gR2V0IGluZGV4IG9mIHR3byB0aW1lIHZhbHVlcyBlbGFwc2VkIGlzIGJldHdlZW5cbiAgICAgICAgICAgIGNvbnN0IHByZXZJbmRleCA9XG4gICAgICAgICAgICAgICAgTWF0aC5tYXgoXG4gICAgICAgICAgICAgICAgICAgIDEsXG4gICAgICAgICAgICAgICAgICAgIHRpbWVzLmZpbmRJbmRleCgodCkgPT4gdCA+IGVsYXBzZWQpXG4gICAgICAgICAgICAgICAgKSAtIDE7XG4gICAgICAgICAgICBjb25zdCBuZXh0SW5kZXggPSBwcmV2SW5kZXggKyAxO1xuXG4gICAgICAgICAgICAvLyBHZXQgbGluZWFyIGJsZW5kL2FscGhhIGJldHdlZW4gdGhlIHR3b1xuICAgICAgICAgICAgbGV0IGFscGhhID0gKGVsYXBzZWQgLSB0aW1lc1twcmV2SW5kZXhdKSAvICh0aW1lc1tuZXh0SW5kZXhdIC0gdGltZXNbcHJldkluZGV4XSk7XG4gICAgICAgICAgICBpZiAoaW50ZXJwb2xhdGlvbiA9PT0gJ1NURVAnKSBhbHBoYSA9IDA7XG5cbiAgICAgICAgICAgIGxldCBwcmV2VmFsID0gdG1wVmVjM0E7XG4gICAgICAgICAgICBsZXQgcHJldlRhbiA9IHRtcFZlYzNCO1xuICAgICAgICAgICAgbGV0IG5leHRUYW4gPSB0bXBWZWMzQztcbiAgICAgICAgICAgIGxldCBuZXh0VmFsID0gdG1wVmVjM0Q7XG4gICAgICAgICAgICBsZXQgc2l6ZSA9IDM7XG5cbiAgICAgICAgICAgIGlmICh0cmFuc2Zvcm0gPT09ICdxdWF0ZXJuaW9uJykge1xuICAgICAgICAgICAgICAgIHByZXZWYWwgPSB0bXBRdWF0QTtcbiAgICAgICAgICAgICAgICBwcmV2VGFuID0gdG1wUXVhdEI7XG4gICAgICAgICAgICAgICAgbmV4dFRhbiA9IHRtcFF1YXRDO1xuICAgICAgICAgICAgICAgIG5leHRWYWwgPSB0bXBRdWF0RDtcbiAgICAgICAgICAgICAgICBzaXplID0gNDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGludGVycG9sYXRpb24gPT09ICdDVUJJQ1NQTElORScpIHtcbiAgICAgICAgICAgICAgICAvLyBHZXQgdGhlIHByZXYgYW5kIG5leHQgdmFsdWVzIGZyb20gdGhlIGluZGljZXNcbiAgICAgICAgICAgICAgICBwcmV2VmFsLmZyb21BcnJheSh2YWx1ZXMsIHByZXZJbmRleCAqIHNpemUgKiAzICsgc2l6ZSAqIDEpO1xuICAgICAgICAgICAgICAgIHByZXZUYW4uZnJvbUFycmF5KHZhbHVlcywgcHJldkluZGV4ICogc2l6ZSAqIDMgKyBzaXplICogMik7XG4gICAgICAgICAgICAgICAgbmV4dFRhbi5mcm9tQXJyYXkodmFsdWVzLCBuZXh0SW5kZXggKiBzaXplICogMyArIHNpemUgKiAwKTtcbiAgICAgICAgICAgICAgICBuZXh0VmFsLmZyb21BcnJheSh2YWx1ZXMsIG5leHRJbmRleCAqIHNpemUgKiAzICsgc2l6ZSAqIDEpO1xuXG4gICAgICAgICAgICAgICAgLy8gaW50ZXJwb2xhdGUgZm9yIGZpbmFsIHZhbHVlXG4gICAgICAgICAgICAgICAgcHJldlZhbCA9IHRoaXMuY3ViaWNTcGxpbmVJbnRlcnBvbGF0ZShhbHBoYSwgcHJldlZhbCwgcHJldlRhbiwgbmV4dFRhbiwgbmV4dFZhbCk7XG4gICAgICAgICAgICAgICAgaWYgKHNpemUgPT09IDQpIHByZXZWYWwubm9ybWFsaXplKCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIEdldCB0aGUgcHJldiBhbmQgbmV4dCB2YWx1ZXMgZnJvbSB0aGUgaW5kaWNlc1xuICAgICAgICAgICAgICAgIHByZXZWYWwuZnJvbUFycmF5KHZhbHVlcywgcHJldkluZGV4ICogc2l6ZSk7XG4gICAgICAgICAgICAgICAgbmV4dFZhbC5mcm9tQXJyYXkodmFsdWVzLCBuZXh0SW5kZXggKiBzaXplKTtcblxuICAgICAgICAgICAgICAgIC8vIGludGVycG9sYXRlIGZvciBmaW5hbCB2YWx1ZVxuICAgICAgICAgICAgICAgIGlmIChzaXplID09PSA0KSBwcmV2VmFsLnNsZXJwKG5leHRWYWwsIGFscGhhKTtcbiAgICAgICAgICAgICAgICBlbHNlIHByZXZWYWwubGVycChuZXh0VmFsLCBhbHBoYSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIGludGVycG9sYXRlIGJldHdlZW4gbXVsdGlwbGUgcG9zc2libGUgYW5pbWF0aW9uc1xuICAgICAgICAgICAgaWYgKHNpemUgPT09IDQpIG5vZGVbdHJhbnNmb3JtXS5zbGVycChwcmV2VmFsLCB3ZWlnaHQpO1xuICAgICAgICAgICAgZWxzZSBub2RlW3RyYW5zZm9ybV0ubGVycChwcmV2VmFsLCB3ZWlnaHQpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBjdWJpY1NwbGluZUludGVycG9sYXRlKHQsIHByZXZWYWwsIHByZXZUYW4sIG5leHRUYW4sIG5leHRWYWwpIHtcbiAgICAgICAgY29uc3QgdDIgPSB0ICogdDtcbiAgICAgICAgY29uc3QgdDMgPSB0MiAqIHQ7XG5cbiAgICAgICAgY29uc3QgczIgPSAzICogdDIgLSAyICogdDM7XG4gICAgICAgIGNvbnN0IHMzID0gdDMgLSB0MjtcbiAgICAgICAgY29uc3QgczAgPSAxIC0gczI7XG4gICAgICAgIGNvbnN0IHMxID0gczMgLSB0MiArIHQ7XG5cbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwcmV2VmFsLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBwcmV2VmFsW2ldID0gczAgKiBwcmV2VmFsW2ldICsgczEgKiAoMSAtIHQpICogcHJldlRhbltpXSArIHMyICogbmV4dFZhbFtpXSArIHMzICogdCAqIG5leHRUYW5baV07XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcHJldlZhbDtcbiAgICB9XG59XG4iLCJpbXBvcnQgeyBHZW9tZXRyeSB9IGZyb20gJy4uL2NvcmUvR2VvbWV0cnkuanMnO1xuaW1wb3J0IHsgVHJhbnNmb3JtIH0gZnJvbSAnLi4vY29yZS9UcmFuc2Zvcm0uanMnO1xuaW1wb3J0IHsgVGV4dHVyZSB9IGZyb20gJy4uL2NvcmUvVGV4dHVyZS5qcyc7XG5pbXBvcnQgeyBNZXNoIH0gZnJvbSAnLi4vY29yZS9NZXNoLmpzJztcbmltcG9ydCB7IEdMVEZBbmltYXRpb24gfSBmcm9tICcuL0dMVEZBbmltYXRpb24uanMnO1xuaW1wb3J0IHsgR0xURlNraW4gfSBmcm9tICcuL0dMVEZTa2luLmpzJztcbmltcG9ydCB7IE1hdDQgfSBmcm9tICcuLi9tYXRoL01hdDQuanMnO1xuaW1wb3J0IHsgTm9ybWFsUHJvZ3JhbSB9IGZyb20gJy4vTm9ybWFsUHJvZ3JhbS5qcyc7XG5cbi8vIFN1cHBvcnRzXG4vLyBbeF0gR2VvbWV0cnlcbi8vIFsgXSBTcGFyc2Ugc3VwcG9ydFxuLy8gW3hdIE5vZGVzIGFuZCBIaWVyYXJjaHlcbi8vIFt4XSBJbnN0YW5jaW5nXG4vLyBbIF0gTW9ycGggVGFyZ2V0c1xuLy8gW3hdIFNraW5zXG4vLyBbIF0gTWF0ZXJpYWxzXG4vLyBbeF0gVGV4dHVyZXNcbi8vIFt4XSBBbmltYXRpb25cbi8vIFsgXSBDYW1lcmFzXG4vLyBbIF0gRXh0ZW5zaW9uc1xuLy8gW3hdIEdMQiBzdXBwb3J0XG5cbi8vIFRPRE86IFNwYXJzZSBhY2Nlc3NvciBwYWNraW5nPyBGb3IgbW9ycGggdGFyZ2V0cyBiYXNpY2FsbHlcbi8vIFRPRE86IGluaXQgYWNjZXNzb3IgbWlzc2luZyBidWZmZXJWaWV3IHdpdGggMHNcbi8vIFRPRE86IG1vcnBoIHRhcmdldCBhbmltYXRpb25zXG4vLyBUT0RPOiB3aGF0IHRvIGRvIGlmIG11bHRpcGxlIGluc3RhbmNlcyBhcmUgaW4gZGlmZmVyZW50IGdyb3Vwcz8gT25seSB1c2VzIGxvY2FsIG1hdHJpY2VzXG4vLyBUT0RPOiB3aGF0IGlmIGluc3RhbmNpbmcgaXNuJ3Qgd2FudGVkPyBFZyBjb2xsaXNpb24gbWFwc1xuLy8gVE9ETzogaWUxMSBmYWxsYmFjayBmb3IgVGV4dERlY29kZXI/XG5cbmNvbnN0IFRZUEVfQVJSQVkgPSB7XG4gICAgNTEyMTogVWludDhBcnJheSxcbiAgICA1MTIyOiBJbnQxNkFycmF5LFxuICAgIDUxMjM6IFVpbnQxNkFycmF5LFxuICAgIDUxMjU6IFVpbnQzMkFycmF5LFxuICAgIDUxMjY6IEZsb2F0MzJBcnJheSxcbiAgICAnaW1hZ2UvanBlZyc6IFVpbnQ4QXJyYXksXG4gICAgJ2ltYWdlL3BuZyc6IFVpbnQ4QXJyYXksXG59O1xuXG5jb25zdCBUWVBFX1NJWkUgPSB7XG4gICAgU0NBTEFSOiAxLFxuICAgIFZFQzI6IDIsXG4gICAgVkVDMzogMyxcbiAgICBWRUM0OiA0LFxuICAgIE1BVDI6IDQsXG4gICAgTUFUMzogOSxcbiAgICBNQVQ0OiAxNixcbn07XG5cbmNvbnN0IEFUVFJJQlVURVMgPSB7XG4gICAgUE9TSVRJT046ICdwb3NpdGlvbicsXG4gICAgTk9STUFMOiAnbm9ybWFsJyxcbiAgICBUQU5HRU5UOiAndGFuZ2VudCcsXG4gICAgVEVYQ09PUkRfMDogJ3V2JyxcbiAgICBURVhDT09SRF8xOiAndXYyJyxcbiAgICBDT0xPUl8wOiAnY29sb3InLFxuICAgIFdFSUdIVFNfMDogJ3NraW5XZWlnaHQnLFxuICAgIEpPSU5UU18wOiAnc2tpbkluZGV4Jyxcbn07XG5cbmNvbnN0IFRSQU5TRk9STVMgPSB7XG4gICAgdHJhbnNsYXRpb246ICdwb3NpdGlvbicsXG4gICAgcm90YXRpb246ICdxdWF0ZXJuaW9uJyxcbiAgICBzY2FsZTogJ3NjYWxlJyxcbn07XG5cbmV4cG9ydCBjbGFzcyBHTFRGTG9hZGVyIHtcbiAgICBzdGF0aWMgYXN5bmMgbG9hZChnbCwgc3JjKSB7XG4gICAgICAgIGNvbnN0IGRpciA9IHNyYy5zcGxpdCgnLycpLnNsaWNlKDAsIC0xKS5qb2luKCcvJykgKyAnLyc7XG5cbiAgICAgICAgLy8gbG9hZCBtYWluIGRlc2NyaXB0aW9uIGpzb25cbiAgICAgICAgY29uc3QgZGVzYyA9IGF3YWl0IHRoaXMucGFyc2VEZXNjKHNyYyk7XG5cbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMucGFyc2UoZ2wsIGRlc2MsIGRpcik7XG4gICAgfVxuXG4gICAgc3RhdGljIGFzeW5jIHBhcnNlKGdsLCBkZXNjLCBkaXIpIHtcbiAgICAgICAgaWYgKGRlc2MuYXNzZXQgPT09IHVuZGVmaW5lZCB8fCBkZXNjLmFzc2V0LnZlcnNpb25bMF0gPCAyKSBjb25zb2xlLndhcm4oJ09ubHkgR0xURiA+PTIuMCBzdXBwb3J0ZWQuIEF0dGVtcHRpbmcgdG8gcGFyc2UuJyk7XG5cbiAgICAgICAgLy8gTG9hZCBidWZmZXJzIGFzeW5jXG4gICAgICAgIGNvbnN0IGJ1ZmZlcnMgPSBhd2FpdCB0aGlzLmxvYWRCdWZmZXJzKGRlc2MsIGRpcik7XG5cbiAgICAgICAgLy8gVW5iaW5kIGN1cnJlbnQgVkFPIHNvIHRoYXQgbmV3IGJ1ZmZlcnMgZG9uJ3QgZ2V0IGFkZGVkIHRvIGFjdGl2ZSBtZXNoXG4gICAgICAgIGdsLnJlbmRlcmVyLmJpbmRWZXJ0ZXhBcnJheShudWxsKTtcblxuICAgICAgICAvLyBDcmVhdGUgZ2wgYnVmZmVycyBmcm9tIGJ1ZmZlclZpZXdzXG4gICAgICAgIGNvbnN0IGJ1ZmZlclZpZXdzID0gdGhpcy5wYXJzZUJ1ZmZlclZpZXdzKGdsLCBkZXNjLCBidWZmZXJzKTtcblxuICAgICAgICAvLyBDcmVhdGUgaW1hZ2VzIGZyb20gZWl0aGVyIGJ1ZmZlclZpZXdzIG9yIHNlcGFyYXRlIGltYWdlIGZpbGVzXG4gICAgICAgIGNvbnN0IGltYWdlcyA9IHRoaXMucGFyc2VJbWFnZXMoZ2wsIGRlc2MsIGRpciwgYnVmZmVyVmlld3MpO1xuXG4gICAgICAgIGNvbnN0IHRleHR1cmVzID0gdGhpcy5wYXJzZVRleHR1cmVzKGdsLCBkZXNjLCBpbWFnZXMpO1xuXG4gICAgICAgIC8vIEp1c3QgcGFzcyB0aHJvdWdoIG1hdGVyaWFsIGRhdGEgZm9yIG5vd1xuICAgICAgICBjb25zdCBtYXRlcmlhbHMgPSB0aGlzLnBhcnNlTWF0ZXJpYWxzKGdsLCBkZXNjLCB0ZXh0dXJlcyk7XG5cbiAgICAgICAgLy8gRmV0Y2ggdGhlIGludmVyc2UgYmluZCBtYXRyaWNlcyBmb3Igc2tlbGV0b24gam9pbnRzXG4gICAgICAgIGNvbnN0IHNraW5zID0gdGhpcy5wYXJzZVNraW5zKGdsLCBkZXNjLCBidWZmZXJWaWV3cyk7XG5cbiAgICAgICAgLy8gQ3JlYXRlIGdlb21ldHJpZXMgZm9yIGVhY2ggbWVzaCBwcmltaXRpdmVcbiAgICAgICAgY29uc3QgbWVzaGVzID0gdGhpcy5wYXJzZU1lc2hlcyhnbCwgZGVzYywgYnVmZmVyVmlld3MsIG1hdGVyaWFscywgc2tpbnMpO1xuXG4gICAgICAgIC8vIENyZWF0ZSB0cmFuc2Zvcm1zLCBtZXNoZXMgYW5kIGhpZXJhcmNoeVxuICAgICAgICBjb25zdCBub2RlcyA9IHRoaXMucGFyc2VOb2RlcyhnbCwgZGVzYywgbWVzaGVzLCBza2lucyk7XG5cbiAgICAgICAgLy8gUGxhY2Ugbm9kZXMgaW4gc2tlbGV0b25zXG4gICAgICAgIHRoaXMucG9wdWxhdGVTa2lucyhza2lucywgbm9kZXMpO1xuXG4gICAgICAgIC8vIENyZWF0ZSBhbmltYXRpb24gaGFuZGxlcnNcbiAgICAgICAgY29uc3QgYW5pbWF0aW9ucyA9IHRoaXMucGFyc2VBbmltYXRpb25zKGdsLCBkZXNjLCBub2RlcywgYnVmZmVyVmlld3MpO1xuXG4gICAgICAgIC8vIEdldCB0b3AgbGV2ZWwgbm9kZXMgZm9yIGVhY2ggc2NlbmVcbiAgICAgICAgY29uc3Qgc2NlbmVzID0gdGhpcy5wYXJzZVNjZW5lcyhkZXNjLCBub2Rlcyk7XG4gICAgICAgIGNvbnN0IHNjZW5lID0gc2NlbmVzW2Rlc2Muc2NlbmVdO1xuXG4gICAgICAgIC8vIFJlbW92ZSBudWxsIG5vZGVzIChpbnN0YW5jZWQgdHJhbnNmb3JtcylcbiAgICAgICAgZm9yIChsZXQgaSA9IG5vZGVzLmxlbmd0aDsgaSA+PSAwOyBpLS0pIGlmICghbm9kZXNbaV0pIG5vZGVzLnNwbGljZShpLCAxKTtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAganNvbjogZGVzYyxcbiAgICAgICAgICAgIGJ1ZmZlcnMsXG4gICAgICAgICAgICBidWZmZXJWaWV3cyxcbiAgICAgICAgICAgIGltYWdlcyxcbiAgICAgICAgICAgIHRleHR1cmVzLFxuICAgICAgICAgICAgbWF0ZXJpYWxzLFxuICAgICAgICAgICAgbWVzaGVzLFxuICAgICAgICAgICAgbm9kZXMsXG4gICAgICAgICAgICBhbmltYXRpb25zLFxuICAgICAgICAgICAgc2NlbmVzLFxuICAgICAgICAgICAgc2NlbmUsXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgc3RhdGljIGFzeW5jIHBhcnNlRGVzYyhzcmMpIHtcbiAgICAgICAgaWYgKCFzcmMubWF0Y2goL1xcLmdsYiQvKSkge1xuICAgICAgICAgICAgcmV0dXJuIGF3YWl0IGZldGNoKHNyYykudGhlbigocmVzKSA9PiByZXMuanNvbigpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBhd2FpdCBmZXRjaChzcmMpXG4gICAgICAgICAgICAgICAgLnRoZW4oKHJlcykgPT4gcmVzLmFycmF5QnVmZmVyKCkpXG4gICAgICAgICAgICAgICAgLnRoZW4oKGdsYikgPT4gdGhpcy51bnBhY2tHTEIoZ2xiKSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBGcm9tIGh0dHBzOi8vZ2l0aHViLmNvbS9kb25tY2N1cmR5L2dsVEYtVHJhbnNmb3JtL2Jsb2IvZTQxMDhjYy9wYWNrYWdlcy9jb3JlL3NyYy9pby9pby50cyNMMzJcbiAgICBzdGF0aWMgdW5wYWNrR0xCKGdsYikge1xuICAgICAgICAvLyBEZWNvZGUgYW5kIHZlcmlmeSBHTEIgaGVhZGVyLlxuICAgICAgICBjb25zdCBoZWFkZXIgPSBuZXcgVWludDMyQXJyYXkoZ2xiLCAwLCAzKTtcbiAgICAgICAgaWYgKGhlYWRlclswXSAhPT0gMHg0NjU0NmM2Nykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGdsVEYgYXNzZXQuJyk7XG4gICAgICAgIH0gZWxzZSBpZiAoaGVhZGVyWzFdICE9PSAyKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFVuc3VwcG9ydGVkIGdsVEYgYmluYXJ5IHZlcnNpb24sIFwiJHtoZWFkZXJbMV19XCIuYCk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gRGVjb2RlIGFuZCB2ZXJpZnkgY2h1bmsgaGVhZGVycy5cbiAgICAgICAgY29uc3QganNvbkNodW5rSGVhZGVyID0gbmV3IFVpbnQzMkFycmF5KGdsYiwgMTIsIDIpO1xuICAgICAgICBjb25zdCBqc29uQnl0ZU9mZnNldCA9IDIwO1xuICAgICAgICBjb25zdCBqc29uQnl0ZUxlbmd0aCA9IGpzb25DaHVua0hlYWRlclswXTtcbiAgICAgICAgaWYgKGpzb25DaHVua0hlYWRlclsxXSAhPT0gMHg0ZTRmNTM0YSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmV4cGVjdGVkIEdMQiBsYXlvdXQuJyk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBEZWNvZGUgSlNPTi5cbiAgICAgICAgY29uc3QganNvblRleHQgPSBuZXcgVGV4dERlY29kZXIoKS5kZWNvZGUoZ2xiLnNsaWNlKGpzb25CeXRlT2Zmc2V0LCBqc29uQnl0ZU9mZnNldCArIGpzb25CeXRlTGVuZ3RoKSk7XG4gICAgICAgIGNvbnN0IGpzb24gPSBKU09OLnBhcnNlKGpzb25UZXh0KTtcbiAgICAgICAgLy8gSlNPTiBvbmx5XG4gICAgICAgIGlmIChqc29uQnl0ZU9mZnNldCArIGpzb25CeXRlTGVuZ3RoID09PSBnbGIuYnl0ZUxlbmd0aCkgcmV0dXJuIGpzb247XG5cbiAgICAgICAgY29uc3QgYmluYXJ5Q2h1bmtIZWFkZXIgPSBuZXcgVWludDMyQXJyYXkoZ2xiLCBqc29uQnl0ZU9mZnNldCArIGpzb25CeXRlTGVuZ3RoLCAyKTtcbiAgICAgICAgaWYgKGJpbmFyeUNodW5rSGVhZGVyWzFdICE9PSAweDAwNGU0OTQyKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1VuZXhwZWN0ZWQgR0xCIGxheW91dC4nKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBEZWNvZGUgY29udGVudC5cbiAgICAgICAgY29uc3QgYmluYXJ5Qnl0ZU9mZnNldCA9IGpzb25CeXRlT2Zmc2V0ICsganNvbkJ5dGVMZW5ndGggKyA4O1xuICAgICAgICBjb25zdCBiaW5hcnlCeXRlTGVuZ3RoID0gYmluYXJ5Q2h1bmtIZWFkZXJbMF07XG4gICAgICAgIGNvbnN0IGJpbmFyeSA9IGdsYi5zbGljZShiaW5hcnlCeXRlT2Zmc2V0LCBiaW5hcnlCeXRlT2Zmc2V0ICsgYmluYXJ5Qnl0ZUxlbmd0aCk7XG4gICAgICAgIC8vIEF0dGFjaCBiaW5hcnkgdG8gYnVmZmVyXG4gICAgICAgIGpzb24uYnVmZmVyc1swXS5iaW5hcnkgPSBiaW5hcnk7XG4gICAgICAgIHJldHVybiBqc29uO1xuICAgIH1cblxuICAgIC8vIFRocmVlanMgR0xURiBMb2FkZXIgaHR0cHM6Ly9naXRodWIuY29tL21yZG9vYi90aHJlZS5qcy9ibG9iL21hc3Rlci9leGFtcGxlcy9qcy9sb2FkZXJzL0dMVEZMb2FkZXIuanMjTDEwODVcbiAgICBzdGF0aWMgcmVzb2x2ZVVSSSh1cmksIGRpcikge1xuICAgICAgICAvLyBJbnZhbGlkIFVSSVxuICAgICAgICBpZiAodHlwZW9mIHVyaSAhPT0gJ3N0cmluZycgfHwgdXJpID09PSAnJykgcmV0dXJuICcnO1xuXG4gICAgICAgIC8vIEhvc3QgUmVsYXRpdmUgVVJJXG4gICAgICAgIGlmICgvXmh0dHBzPzpcXC9cXC8vaS50ZXN0KGRpcikgJiYgL15cXC8vLnRlc3QodXJpKSkge1xuICAgICAgICAgICAgZGlyID0gZGlyLnJlcGxhY2UoLyheaHR0cHM/OlxcL1xcL1teXFwvXSspLiovaSwgJyQxJyk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBBYnNvbHV0ZSBVUkkgaHR0cDovLywgaHR0cHM6Ly8sIC8vXG4gICAgICAgIGlmICgvXihodHRwcz86KT9cXC9cXC8vaS50ZXN0KHVyaSkpIHJldHVybiB1cmk7XG5cbiAgICAgICAgLy8gRGF0YSBVUklcbiAgICAgICAgaWYgKC9eZGF0YTouKiwuKiQvaS50ZXN0KHVyaSkpIHJldHVybiB1cmk7XG5cbiAgICAgICAgLy8gQmxvYiBVUklcbiAgICAgICAgaWYgKC9eYmxvYjouKiQvaS50ZXN0KHVyaSkpIHJldHVybiB1cmk7XG5cbiAgICAgICAgLy8gUmVsYXRpdmUgVVJJXG4gICAgICAgIHJldHVybiBkaXIgKyB1cmk7XG4gICAgfVxuXG4gICAgc3RhdGljIGFzeW5jIGxvYWRCdWZmZXJzKGRlc2MsIGRpcikge1xuICAgICAgICBpZiAoIWRlc2MuYnVmZmVycykgcmV0dXJuIG51bGw7XG4gICAgICAgIHJldHVybiBhd2FpdCBQcm9taXNlLmFsbChcbiAgICAgICAgICAgIGRlc2MuYnVmZmVycy5tYXAoKGJ1ZmZlcikgPT4ge1xuICAgICAgICAgICAgICAgIC8vIEZvciBHTEIsIGJpbmFyeSBidWZmZXIgcmVhZHkgdG8gZ29cbiAgICAgICAgICAgICAgICBpZiAoYnVmZmVyLmJpbmFyeSkgcmV0dXJuIGJ1ZmZlci5iaW5hcnk7XG4gICAgICAgICAgICAgICAgY29uc3QgdXJpID0gdGhpcy5yZXNvbHZlVVJJKGJ1ZmZlci51cmksIGRpcik7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZldGNoKHVyaSkudGhlbigocmVzKSA9PiByZXMuYXJyYXlCdWZmZXIoKSk7XG4gICAgICAgICAgICB9KVxuICAgICAgICApO1xuICAgIH1cblxuICAgIHN0YXRpYyBwYXJzZUJ1ZmZlclZpZXdzKGdsLCBkZXNjLCBidWZmZXJzKSB7XG4gICAgICAgIGlmICghZGVzYy5idWZmZXJWaWV3cykgcmV0dXJuIG51bGw7XG4gICAgICAgIC8vIENsb25lIHRvIGxlYXZlIGRlc2NyaXB0aW9uIHB1cmVcbiAgICAgICAgY29uc3QgYnVmZmVyVmlld3MgPSBkZXNjLmJ1ZmZlclZpZXdzLm1hcCgobykgPT4gT2JqZWN0LmFzc2lnbih7fSwgbykpO1xuXG4gICAgICAgIGRlc2MubWVzaGVzICYmXG4gICAgICAgICAgICBkZXNjLm1lc2hlcy5mb3JFYWNoKCh7IHByaW1pdGl2ZXMgfSkgPT4ge1xuICAgICAgICAgICAgICAgIHByaW1pdGl2ZXMuZm9yRWFjaCgoeyBhdHRyaWJ1dGVzLCBpbmRpY2VzIH0pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgLy8gRmxhZyBidWZmZXJWaWV3IGFzIGFuIGF0dHJpYnV0ZSwgc28gaXQga25vd3MgdG8gY3JlYXRlIGEgZ2wgYnVmZmVyXG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGF0dHIgaW4gYXR0cmlidXRlcykgYnVmZmVyVmlld3NbZGVzYy5hY2Nlc3NvcnNbYXR0cmlidXRlc1thdHRyXV0uYnVmZmVyVmlld10uaXNBdHRyaWJ1dGUgPSB0cnVlO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChpbmRpY2VzID09PSB1bmRlZmluZWQpIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgYnVmZmVyVmlld3NbZGVzYy5hY2Nlc3NvcnNbaW5kaWNlc10uYnVmZmVyVmlld10uaXNBdHRyaWJ1dGUgPSB0cnVlO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIE1ha2Ugc3VyZSBpbmRpY2VzIGJ1ZmZlclZpZXcgaGF2ZSBhIHRhcmdldCBwcm9wZXJ0eSBmb3IgZ2wgYnVmZmVyIGJpbmRpbmdcbiAgICAgICAgICAgICAgICAgICAgYnVmZmVyVmlld3NbZGVzYy5hY2Nlc3NvcnNbaW5kaWNlc10uYnVmZmVyVmlld10udGFyZ2V0ID0gZ2wuRUxFTUVOVF9BUlJBWV9CVUZGRVI7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAvLyBHZXQgY29tcG9uZW50VHlwZSBvZiBlYWNoIGJ1ZmZlclZpZXcgZnJvbSB0aGUgYWNjZXNzb3JzXG4gICAgICAgIGRlc2MuYWNjZXNzb3JzLmZvckVhY2goKHsgYnVmZmVyVmlldzogaSwgY29tcG9uZW50VHlwZSB9KSA9PiB7XG4gICAgICAgICAgICBidWZmZXJWaWV3c1tpXS5jb21wb25lbnRUeXBlID0gY29tcG9uZW50VHlwZTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gR2V0IG1pbWV0eXBlIG9mIGJ1ZmZlclZpZXcgZnJvbSBpbWFnZXNcbiAgICAgICAgZGVzYy5pbWFnZXMgJiZcbiAgICAgICAgICAgIGRlc2MuaW1hZ2VzLmZvckVhY2goKHsgdXJpLCBidWZmZXJWaWV3OiBpLCBtaW1lVHlwZSB9KSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGkgPT09IHVuZGVmaW5lZCkgcmV0dXJuO1xuICAgICAgICAgICAgICAgIGJ1ZmZlclZpZXdzW2ldLm1pbWVUeXBlID0gbWltZVR5cGU7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAvLyBQdXNoIGVhY2ggYnVmZmVyVmlldyB0byB0aGUgR1BVIGFzIGEgc2VwYXJhdGUgYnVmZmVyXG4gICAgICAgIGJ1ZmZlclZpZXdzLmZvckVhY2goXG4gICAgICAgICAgICAoXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBidWZmZXI6IGJ1ZmZlckluZGV4LCAvLyByZXF1aXJlZFxuICAgICAgICAgICAgICAgICAgICBieXRlT2Zmc2V0ID0gMCwgLy8gb3B0aW9uYWxcbiAgICAgICAgICAgICAgICAgICAgYnl0ZUxlbmd0aCwgLy8gcmVxdWlyZWRcbiAgICAgICAgICAgICAgICAgICAgYnl0ZVN0cmlkZSwgLy8gb3B0aW9uYWxcbiAgICAgICAgICAgICAgICAgICAgdGFyZ2V0ID0gZ2wuQVJSQVlfQlVGRkVSLCAvLyBvcHRpb25hbCwgYWRkZWQgYWJvdmUgZm9yIGVsZW1lbnRzXG4gICAgICAgICAgICAgICAgICAgIG5hbWUsIC8vIG9wdGlvbmFsXG4gICAgICAgICAgICAgICAgICAgIGV4dGVuc2lvbnMsIC8vIG9wdGlvbmFsXG4gICAgICAgICAgICAgICAgICAgIGV4dHJhcywgLy8gb3B0aW9uYWxcblxuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnRUeXBlLCAvLyBvcHRpb25hbCwgYWRkZWQgZnJvbSBhY2Nlc3NvciBhYm92ZVxuICAgICAgICAgICAgICAgICAgICBtaW1lVHlwZSwgLy8gb3B0aW9uYWwsIGFkZGVkIGZyb20gaW1hZ2VzIGFib3ZlXG4gICAgICAgICAgICAgICAgICAgIGlzQXR0cmlidXRlLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgaVxuICAgICAgICAgICAgKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgVHlwZUFycmF5ID0gVFlQRV9BUlJBWVtjb21wb25lbnRUeXBlIHx8IG1pbWVUeXBlXTtcbiAgICAgICAgICAgICAgICBjb25zdCBlbGVtZW50Qnl0ZXMgPSBUeXBlQXJyYXkuQllURVNfUEVSX0VMRU1FTlQ7XG5cbiAgICAgICAgICAgICAgICBjb25zdCBkYXRhID0gbmV3IFR5cGVBcnJheShidWZmZXJzW2J1ZmZlckluZGV4XSwgYnl0ZU9mZnNldCwgYnl0ZUxlbmd0aCAvIGVsZW1lbnRCeXRlcyk7XG4gICAgICAgICAgICAgICAgYnVmZmVyVmlld3NbaV0uZGF0YSA9IGRhdGE7XG4gICAgICAgICAgICAgICAgYnVmZmVyVmlld3NbaV0ub3JpZ2luYWxCdWZmZXIgPSBidWZmZXJzW2J1ZmZlckluZGV4XTtcblxuICAgICAgICAgICAgICAgIGlmICghaXNBdHRyaWJ1dGUpIHJldHVybjtcbiAgICAgICAgICAgICAgICAvLyBDcmVhdGUgZ2wgYnVmZmVycyBmb3IgdGhlIGJ1ZmZlclZpZXcsIHB1c2hpbmcgaXQgdG8gdGhlIEdQVVxuICAgICAgICAgICAgICAgIGNvbnN0IGJ1ZmZlciA9IGdsLmNyZWF0ZUJ1ZmZlcigpO1xuICAgICAgICAgICAgICAgIGdsLmJpbmRCdWZmZXIodGFyZ2V0LCBidWZmZXIpO1xuICAgICAgICAgICAgICAgIGdsLnJlbmRlcmVyLnN0YXRlLmJvdW5kQnVmZmVyID0gYnVmZmVyO1xuICAgICAgICAgICAgICAgIGdsLmJ1ZmZlckRhdGEodGFyZ2V0LCBkYXRhLCBnbC5TVEFUSUNfRFJBVyk7XG4gICAgICAgICAgICAgICAgYnVmZmVyVmlld3NbaV0uYnVmZmVyID0gYnVmZmVyO1xuICAgICAgICAgICAgfVxuICAgICAgICApO1xuXG4gICAgICAgIHJldHVybiBidWZmZXJWaWV3cztcbiAgICB9XG5cbiAgICBzdGF0aWMgcGFyc2VJbWFnZXMoZ2wsIGRlc2MsIGRpciwgYnVmZmVyVmlld3MpIHtcbiAgICAgICAgaWYgKCFkZXNjLmltYWdlcykgcmV0dXJuIG51bGw7XG4gICAgICAgIHJldHVybiBkZXNjLmltYWdlcy5tYXAoKHsgdXJpLCBidWZmZXJWaWV3OiBidWZmZXJWaWV3SW5kZXgsIG1pbWVUeXBlLCBuYW1lIH0pID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGltYWdlID0gbmV3IEltYWdlKCk7XG4gICAgICAgICAgICBpbWFnZS5uYW1lID0gbmFtZTtcbiAgICAgICAgICAgIGlmICh1cmkpIHtcbiAgICAgICAgICAgICAgICBpbWFnZS5zcmMgPSB0aGlzLnJlc29sdmVVUkkodXJpLCBkaXIpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChidWZmZXJWaWV3SW5kZXggIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHsgZGF0YSB9ID0gYnVmZmVyVmlld3NbYnVmZmVyVmlld0luZGV4XTtcbiAgICAgICAgICAgICAgICBjb25zdCBibG9iID0gbmV3IEJsb2IoW2RhdGFdLCB7IHR5cGU6IG1pbWVUeXBlIH0pO1xuICAgICAgICAgICAgICAgIGltYWdlLnNyYyA9IFVSTC5jcmVhdGVPYmplY3RVUkwoYmxvYik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpbWFnZS5yZWFkeSA9IG5ldyBQcm9taXNlKChyZXMpID0+IHtcbiAgICAgICAgICAgICAgICBpbWFnZS5vbmxvYWQgPSAoKSA9PiByZXMoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIGltYWdlO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBzdGF0aWMgcGFyc2VUZXh0dXJlcyhnbCwgZGVzYywgaW1hZ2VzKSB7XG4gICAgICAgIGlmICghZGVzYy50ZXh0dXJlcykgcmV0dXJuIG51bGw7XG4gICAgICAgIHJldHVybiBkZXNjLnRleHR1cmVzLm1hcCgoeyBzYW1wbGVyOiBzYW1wbGVySW5kZXgsIHNvdXJjZTogc291cmNlSW5kZXgsIG5hbWUsIGV4dGVuc2lvbnMsIGV4dHJhcyB9KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBvcHRpb25zID0ge1xuICAgICAgICAgICAgICAgIGZsaXBZOiBmYWxzZSxcbiAgICAgICAgICAgICAgICB3cmFwUzogZ2wuUkVQRUFULCAvLyBSZXBlYXQgYnkgZGVmYXVsdCwgb3Bwb3NlZCB0byBPR0wncyBjbGFtcCBieSBkZWZhdWx0XG4gICAgICAgICAgICAgICAgd3JhcFQ6IGdsLlJFUEVBVCxcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBjb25zdCBzYW1wbGVyID0gc2FtcGxlckluZGV4ICE9PSB1bmRlZmluZWQgPyBkZXNjLnNhbXBsZXJzW3NhbXBsZXJJbmRleF0gOiBudWxsO1xuICAgICAgICAgICAgaWYgKHNhbXBsZXIpIHtcbiAgICAgICAgICAgICAgICBbJ21hZ0ZpbHRlcicsICdtaW5GaWx0ZXInLCAnd3JhcFMnLCAnd3JhcFQnXS5mb3JFYWNoKChwcm9wKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChzYW1wbGVyW3Byb3BdKSBvcHRpb25zW3Byb3BdID0gc2FtcGxlcltwcm9wXTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IHRleHR1cmUgPSBuZXcgVGV4dHVyZShnbCwgb3B0aW9ucyk7XG4gICAgICAgICAgICB0ZXh0dXJlLm5hbWUgPSBuYW1lO1xuICAgICAgICAgICAgY29uc3QgaW1hZ2UgPSBpbWFnZXNbc291cmNlSW5kZXhdO1xuICAgICAgICAgICAgaW1hZ2UucmVhZHkudGhlbigoKSA9PiAodGV4dHVyZS5pbWFnZSA9IGltYWdlKSk7XG5cbiAgICAgICAgICAgIHJldHVybiB0ZXh0dXJlO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBzdGF0aWMgcGFyc2VNYXRlcmlhbHMoZ2wsIGRlc2MsIHRleHR1cmVzKSB7XG4gICAgICAgIGlmICghZGVzYy5tYXRlcmlhbHMpIHJldHVybiBudWxsO1xuICAgICAgICByZXR1cm4gZGVzYy5tYXRlcmlhbHMubWFwKFxuICAgICAgICAgICAgKHtcbiAgICAgICAgICAgICAgICBuYW1lLFxuICAgICAgICAgICAgICAgIGV4dGVuc2lvbnMsXG4gICAgICAgICAgICAgICAgZXh0cmFzLFxuICAgICAgICAgICAgICAgIHBick1ldGFsbGljUm91Z2huZXNzID0ge30sXG4gICAgICAgICAgICAgICAgbm9ybWFsVGV4dHVyZSxcbiAgICAgICAgICAgICAgICBvY2NsdXNpb25UZXh0dXJlLFxuICAgICAgICAgICAgICAgIGVtaXNzaXZlVGV4dHVyZSxcbiAgICAgICAgICAgICAgICBlbWlzc2l2ZUZhY3RvciA9IFswLCAwLCAwXSxcbiAgICAgICAgICAgICAgICBhbHBoYU1vZGUgPSAnT1BBUVVFJyxcbiAgICAgICAgICAgICAgICBhbHBoYUN1dG9mZiA9IDAuNSxcbiAgICAgICAgICAgICAgICBkb3VibGVTaWRlZCA9IGZhbHNlLFxuICAgICAgICAgICAgfSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHtcbiAgICAgICAgICAgICAgICAgICAgYmFzZUNvbG9yRmFjdG9yID0gWzEsIDEsIDEsIDFdLFxuICAgICAgICAgICAgICAgICAgICBiYXNlQ29sb3JUZXh0dXJlLFxuICAgICAgICAgICAgICAgICAgICBtZXRhbGxpY0ZhY3RvciA9IDEsXG4gICAgICAgICAgICAgICAgICAgIHJvdWdobmVzc0ZhY3RvciA9IDEsXG4gICAgICAgICAgICAgICAgICAgIG1ldGFsbGljUm91Z2huZXNzVGV4dHVyZSxcbiAgICAgICAgICAgICAgICAgICAgLy8gICBleHRlbnNpb25zLFxuICAgICAgICAgICAgICAgICAgICAvLyAgIGV4dHJhcyxcbiAgICAgICAgICAgICAgICB9ID0gcGJyTWV0YWxsaWNSb3VnaG5lc3M7XG5cbiAgICAgICAgICAgICAgICBpZiAoYmFzZUNvbG9yVGV4dHVyZSkge1xuICAgICAgICAgICAgICAgICAgICBiYXNlQ29sb3JUZXh0dXJlLnRleHR1cmUgPSB0ZXh0dXJlc1tiYXNlQ29sb3JUZXh0dXJlLmluZGV4XTtcbiAgICAgICAgICAgICAgICAgICAgLy8gdGV4Q29vcmRcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKG5vcm1hbFRleHR1cmUpIHtcbiAgICAgICAgICAgICAgICAgICAgbm9ybWFsVGV4dHVyZS50ZXh0dXJlID0gdGV4dHVyZXNbbm9ybWFsVGV4dHVyZS5pbmRleF07XG4gICAgICAgICAgICAgICAgICAgIC8vIHNjYWxlOiAxXG4gICAgICAgICAgICAgICAgICAgIC8vIHRleENvb3JkXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChtZXRhbGxpY1JvdWdobmVzc1RleHR1cmUpIHtcbiAgICAgICAgICAgICAgICAgICAgbWV0YWxsaWNSb3VnaG5lc3NUZXh0dXJlLnRleHR1cmUgPSB0ZXh0dXJlc1ttZXRhbGxpY1JvdWdobmVzc1RleHR1cmUuaW5kZXhdO1xuICAgICAgICAgICAgICAgICAgICAvLyB0ZXhDb29yZFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAob2NjbHVzaW9uVGV4dHVyZSkge1xuICAgICAgICAgICAgICAgICAgICBvY2NsdXNpb25UZXh0dXJlLnRleHR1cmUgPSB0ZXh0dXJlc1tvY2NsdXNpb25UZXh0dXJlLmluZGV4XTtcbiAgICAgICAgICAgICAgICAgICAgLy8gc3RyZW5ndGggMVxuICAgICAgICAgICAgICAgICAgICAvLyB0ZXhDb29yZFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoZW1pc3NpdmVUZXh0dXJlKSB7XG4gICAgICAgICAgICAgICAgICAgIGVtaXNzaXZlVGV4dHVyZS50ZXh0dXJlID0gdGV4dHVyZXNbZW1pc3NpdmVUZXh0dXJlLmluZGV4XTtcbiAgICAgICAgICAgICAgICAgICAgLy8gdGV4Q29vcmRcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBuYW1lLFxuICAgICAgICAgICAgICAgICAgICBiYXNlQ29sb3JGYWN0b3IsXG4gICAgICAgICAgICAgICAgICAgIGJhc2VDb2xvclRleHR1cmUsXG4gICAgICAgICAgICAgICAgICAgIG1ldGFsbGljRmFjdG9yLFxuICAgICAgICAgICAgICAgICAgICByb3VnaG5lc3NGYWN0b3IsXG4gICAgICAgICAgICAgICAgICAgIG1ldGFsbGljUm91Z2huZXNzVGV4dHVyZSxcbiAgICAgICAgICAgICAgICAgICAgbm9ybWFsVGV4dHVyZSxcbiAgICAgICAgICAgICAgICAgICAgb2NjbHVzaW9uVGV4dHVyZSxcbiAgICAgICAgICAgICAgICAgICAgZW1pc3NpdmVUZXh0dXJlLFxuICAgICAgICAgICAgICAgICAgICBlbWlzc2l2ZUZhY3RvcixcbiAgICAgICAgICAgICAgICAgICAgYWxwaGFNb2RlLFxuICAgICAgICAgICAgICAgICAgICBhbHBoYUN1dG9mZixcbiAgICAgICAgICAgICAgICAgICAgZG91YmxlU2lkZWQsXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgcGFyc2VTa2lucyhnbCwgZGVzYywgYnVmZmVyVmlld3MpIHtcbiAgICAgICAgaWYgKCFkZXNjLnNraW5zKSByZXR1cm4gbnVsbDtcbiAgICAgICAgcmV0dXJuIGRlc2Muc2tpbnMubWFwKFxuICAgICAgICAgICAgKHtcbiAgICAgICAgICAgICAgICBpbnZlcnNlQmluZE1hdHJpY2VzLCAvLyBvcHRpb25hbFxuICAgICAgICAgICAgICAgIHNrZWxldG9uLCAvLyBvcHRpb25hbFxuICAgICAgICAgICAgICAgIGpvaW50cywgLy8gcmVxdWlyZWRcbiAgICAgICAgICAgICAgICAvLyBuYW1lLFxuICAgICAgICAgICAgICAgIC8vIGV4dGVuc2lvbnMsXG4gICAgICAgICAgICAgICAgLy8gZXh0cmFzLFxuICAgICAgICAgICAgfSkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIGludmVyc2VCaW5kTWF0cmljZXM6IHRoaXMucGFyc2VBY2Nlc3NvcihpbnZlcnNlQmluZE1hdHJpY2VzLCBkZXNjLCBidWZmZXJWaWV3cyksXG4gICAgICAgICAgICAgICAgICAgIHNrZWxldG9uLFxuICAgICAgICAgICAgICAgICAgICBqb2ludHMsXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgcGFyc2VNZXNoZXMoZ2wsIGRlc2MsIGJ1ZmZlclZpZXdzLCBtYXRlcmlhbHMsIHNraW5zKSB7XG4gICAgICAgIGlmICghZGVzYy5tZXNoZXMpIHJldHVybiBudWxsO1xuICAgICAgICByZXR1cm4gZGVzYy5tZXNoZXMubWFwKFxuICAgICAgICAgICAgKFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgcHJpbWl0aXZlcywgLy8gcmVxdWlyZWRcbiAgICAgICAgICAgICAgICAgICAgd2VpZ2h0cywgLy8gb3B0aW9uYWxcbiAgICAgICAgICAgICAgICAgICAgbmFtZSwgLy8gb3B0aW9uYWxcbiAgICAgICAgICAgICAgICAgICAgZXh0ZW5zaW9ucywgLy8gb3B0aW9uYWxcbiAgICAgICAgICAgICAgICAgICAgZXh0cmFzLCAvLyBvcHRpb25hbFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgbWVzaEluZGV4XG4gICAgICAgICAgICApID0+IHtcbiAgICAgICAgICAgICAgICAvLyBUT0RPOiB3ZWlnaHRzIHN0dWZmID9cbiAgICAgICAgICAgICAgICAvLyBQYXJzZSB0aHJvdWdoIG5vZGVzIHRvIHNlZSBob3cgbWFueSBpbnN0YW5jZXMgdGhlcmUgYXJlXG4gICAgICAgICAgICAgICAgLy8gYW5kIGlmIHRoZXJlIGlzIGEgc2tpbiBhdHRhY2hlZFxuICAgICAgICAgICAgICAgIGxldCBudW1JbnN0YW5jZXMgPSAwO1xuICAgICAgICAgICAgICAgIGxldCBza2luSW5kZXggPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBkZXNjLm5vZGVzICYmXG4gICAgICAgICAgICAgICAgICAgIGRlc2Mubm9kZXMuZm9yRWFjaCgoeyBtZXNoLCBza2luIH0pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChtZXNoID09PSBtZXNoSW5kZXgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBudW1JbnN0YW5jZXMrKztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoc2tpbiAhPT0gdW5kZWZpbmVkKSBza2luSW5kZXggPSBza2luO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIHByaW1pdGl2ZXMgPSB0aGlzLnBhcnNlUHJpbWl0aXZlcyhnbCwgcHJpbWl0aXZlcywgZGVzYywgYnVmZmVyVmlld3MsIG1hdGVyaWFscywgbnVtSW5zdGFuY2VzKS5tYXAoKHsgZ2VvbWV0cnksIHByb2dyYW0sIG1vZGUgfSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAvLyBDcmVhdGUgZWl0aGVyIHNraW5uZWQgbWVzaCBvciByZWd1bGFyIG1lc2hcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbWVzaCA9XG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlb2Ygc2tpbkluZGV4ID09PSAnbnVtYmVyJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gbmV3IEdMVEZTa2luKGdsLCB7IHNrZWxldG9uOiBza2luc1tza2luSW5kZXhdLCBnZW9tZXRyeSwgcHJvZ3JhbSwgbW9kZSB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogbmV3IE1lc2goZ2wsIHsgZ2VvbWV0cnksIHByb2dyYW0sIG1vZGUgfSk7XG4gICAgICAgICAgICAgICAgICAgIG1lc2gubmFtZSA9IG5hbWU7XG4gICAgICAgICAgICAgICAgICAgIGlmIChtZXNoLmdlb21ldHJ5LmlzSW5zdGFuY2VkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBUYWcgbWVzaCBzbyB0aGF0IG5vZGVzIGNhbiBhZGQgdGhlaXIgdHJhbnNmb3JtcyB0byB0aGUgaW5zdGFuY2UgYXR0cmlidXRlXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNoLm51bUluc3RhbmNlcyA9IG51bUluc3RhbmNlcztcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEF2b2lkIGluY29ycmVjdCBjdWxsaW5nIGZvciBpbnN0YW5jZXNcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc2guZnJ1c3R1bUN1bGxlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBtZXNoO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgcHJpbWl0aXZlcyxcbiAgICAgICAgICAgICAgICAgICAgd2VpZ2h0cyxcbiAgICAgICAgICAgICAgICAgICAgbmFtZSxcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICApO1xuICAgIH1cblxuICAgIHN0YXRpYyBwYXJzZVByaW1pdGl2ZXMoZ2wsIHByaW1pdGl2ZXMsIGRlc2MsIGJ1ZmZlclZpZXdzLCBtYXRlcmlhbHMsIG51bUluc3RhbmNlcykge1xuICAgICAgICByZXR1cm4gcHJpbWl0aXZlcy5tYXAoXG4gICAgICAgICAgICAoe1xuICAgICAgICAgICAgICAgIGF0dHJpYnV0ZXMsIC8vIHJlcXVpcmVkXG4gICAgICAgICAgICAgICAgaW5kaWNlcywgLy8gb3B0aW9uYWxcbiAgICAgICAgICAgICAgICBtYXRlcmlhbDogbWF0ZXJpYWxJbmRleCwgLy8gb3B0aW9uYWxcbiAgICAgICAgICAgICAgICBtb2RlID0gNCwgLy8gb3B0aW9uYWxcbiAgICAgICAgICAgICAgICB0YXJnZXRzLCAvLyBvcHRpb25hbFxuICAgICAgICAgICAgICAgIGV4dGVuc2lvbnMsIC8vIG9wdGlvbmFsXG4gICAgICAgICAgICAgICAgZXh0cmFzLCAvLyBvcHRpb25hbFxuICAgICAgICAgICAgfSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGdlb21ldHJ5ID0gbmV3IEdlb21ldHJ5KGdsKTtcblxuICAgICAgICAgICAgICAgIC8vIEFkZCBlYWNoIGF0dHJpYnV0ZSBmb3VuZCBpbiBwcmltaXRpdmVcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBhdHRyIGluIGF0dHJpYnV0ZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgZ2VvbWV0cnkuYWRkQXR0cmlidXRlKEFUVFJJQlVURVNbYXR0cl0sIHRoaXMucGFyc2VBY2Nlc3NvcihhdHRyaWJ1dGVzW2F0dHJdLCBkZXNjLCBidWZmZXJWaWV3cykpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIEFkZCBpbmRleCBhdHRyaWJ1dGUgaWYgZm91bmRcbiAgICAgICAgICAgICAgICBpZiAoaW5kaWNlcyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIGdlb21ldHJ5LmFkZEF0dHJpYnV0ZSgnaW5kZXgnLCB0aGlzLnBhcnNlQWNjZXNzb3IoaW5kaWNlcywgZGVzYywgYnVmZmVyVmlld3MpKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBBZGQgaW5zdGFuY2VkIHRyYW5zZm9ybSBhdHRyaWJ1dGUgaWYgbXVsdGlwbGUgaW5zdGFuY2VzXG4gICAgICAgICAgICAgICAgaWYgKG51bUluc3RhbmNlcyA+IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgZ2VvbWV0cnkuYWRkQXR0cmlidXRlKCdpbnN0YW5jZU1hdHJpeCcsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGluc3RhbmNlZDogMSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNpemU6IDE2LFxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogbmV3IEZsb2F0MzJBcnJheShudW1JbnN0YW5jZXMgKiAxNiksXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIFRPRE86IG1hdGVyaWFsc1xuICAgICAgICAgICAgICAgIGNvbnN0IHByb2dyYW0gPSBuZXcgTm9ybWFsUHJvZ3JhbShnbCk7XG4gICAgICAgICAgICAgICAgaWYgKG1hdGVyaWFsSW5kZXggIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICBwcm9ncmFtLmdsdGZNYXRlcmlhbCA9IG1hdGVyaWFsc1ttYXRlcmlhbEluZGV4XTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBnZW9tZXRyeSxcbiAgICAgICAgICAgICAgICAgICAgcHJvZ3JhbSxcbiAgICAgICAgICAgICAgICAgICAgbW9kZSxcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICApO1xuICAgIH1cblxuICAgIHN0YXRpYyBwYXJzZUFjY2Vzc29yKGluZGV4LCBkZXNjLCBidWZmZXJWaWV3cykge1xuICAgICAgICAvLyBUT0RPOiBpbml0IG1pc3NpbmcgYnVmZmVyVmlldyB3aXRoIDBzXG4gICAgICAgIC8vIFRPRE86IHN1cHBvcnQgc3BhcnNlXG5cbiAgICAgICAgY29uc3Qge1xuICAgICAgICAgICAgYnVmZmVyVmlldzogYnVmZmVyVmlld0luZGV4LCAvLyBvcHRpb25hbFxuICAgICAgICAgICAgYnl0ZU9mZnNldCA9IDAsIC8vIG9wdGlvbmFsXG4gICAgICAgICAgICBjb21wb25lbnRUeXBlLCAvLyByZXF1aXJlZFxuICAgICAgICAgICAgbm9ybWFsaXplZCA9IGZhbHNlLCAvLyBvcHRpb25hbFxuICAgICAgICAgICAgY291bnQsIC8vIHJlcXVpcmVkXG4gICAgICAgICAgICB0eXBlLCAvLyByZXF1aXJlZFxuICAgICAgICAgICAgbWluLCAvLyBvcHRpb25hbFxuICAgICAgICAgICAgbWF4LCAvLyBvcHRpb25hbFxuICAgICAgICAgICAgc3BhcnNlLCAvLyBvcHRpb25hbFxuICAgICAgICAgICAgLy8gbmFtZSwgLy8gb3B0aW9uYWxcbiAgICAgICAgICAgIC8vIGV4dGVuc2lvbnMsIC8vIG9wdGlvbmFsXG4gICAgICAgICAgICAvLyBleHRyYXMsIC8vIG9wdGlvbmFsXG4gICAgICAgIH0gPSBkZXNjLmFjY2Vzc29yc1tpbmRleF07XG5cbiAgICAgICAgY29uc3Qge1xuICAgICAgICAgICAgZGF0YSwgLy8gYXR0YWNoZWQgaW4gcGFyc2VCdWZmZXJWaWV3c1xuICAgICAgICAgICAgb3JpZ2luYWxCdWZmZXIsIC8vIGF0dGFjaGVkIGluIHBhcnNlQnVmZmVyVmlld3NcbiAgICAgICAgICAgIGJ1ZmZlciwgLy8gcmVwbGFjZWQgdG8gYmUgdGhlIGFjdHVhbCBHTCBidWZmZXJcbiAgICAgICAgICAgIGJ5dGVPZmZzZXQ6IGJ1ZmZlckJ5dGVPZmZzZXQgPSAwLFxuICAgICAgICAgICAgLy8gYnl0ZUxlbmd0aCwgLy8gYXBwbGllZCBpbiBwYXJzZUJ1ZmZlclZpZXdzXG4gICAgICAgICAgICBieXRlU3RyaWRlID0gMCxcbiAgICAgICAgICAgIHRhcmdldCxcbiAgICAgICAgICAgIC8vIG5hbWUsXG4gICAgICAgICAgICAvLyBleHRlbnNpb25zLFxuICAgICAgICAgICAgLy8gZXh0cmFzLFxuICAgICAgICB9ID0gYnVmZmVyVmlld3NbYnVmZmVyVmlld0luZGV4XTtcblxuICAgICAgICBjb25zdCBzaXplID0gVFlQRV9TSVpFW3R5cGVdO1xuXG4gICAgICAgIC8vIFBhcnNlIGRhdGEgZnJvbSBqb2luZWQgYnVmZmVyc1xuICAgICAgICBjb25zdCBUeXBlQXJyYXkgPSBUWVBFX0FSUkFZW2NvbXBvbmVudFR5cGVdO1xuICAgICAgICBjb25zdCBlbGVtZW50Qnl0ZXMgPSBkYXRhLkJZVEVTX1BFUl9FTEVNRU5UO1xuICAgICAgICBjb25zdCBjb21wb25lbnRPZmZzZXQgPSBieXRlT2Zmc2V0IC8gZWxlbWVudEJ5dGVzO1xuICAgICAgICBjb25zdCBjb21wb25lbnRTdHJpZGUgPSBieXRlU3RyaWRlIC8gZWxlbWVudEJ5dGVzO1xuICAgICAgICBjb25zdCBpc0ludGVybGVhdmVkID0gISFieXRlU3RyaWRlICYmIGNvbXBvbmVudFN0cmlkZSAhPT0gc2l6ZTtcblxuICAgICAgICAvLyBUT0RPOiBpbnRlcmxlYXZlZFxuICAgICAgICBjb25zdCBuZXdEYXRhID0gaXNJbnRlcmxlYXZlZCA/IGRhdGEgOiBuZXcgVHlwZUFycmF5KG9yaWdpbmFsQnVmZmVyLCBieXRlT2Zmc2V0ICsgYnVmZmVyQnl0ZU9mZnNldCwgY291bnQgKiBzaXplKTtcblxuICAgICAgICAvLyBSZXR1cm4gYXR0cmlidXRlIGRhdGFcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGRhdGE6IG5ld0RhdGEsXG4gICAgICAgICAgICBzaXplLFxuICAgICAgICAgICAgdHlwZTogY29tcG9uZW50VHlwZSxcbiAgICAgICAgICAgIG5vcm1hbGl6ZWQsXG4gICAgICAgICAgICBidWZmZXIsXG4gICAgICAgICAgICBzdHJpZGU6IGJ5dGVTdHJpZGUsXG4gICAgICAgICAgICBvZmZzZXQ6IGJ5dGVPZmZzZXQsXG4gICAgICAgICAgICBjb3VudCxcbiAgICAgICAgICAgIG1pbixcbiAgICAgICAgICAgIG1heCxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBzdGF0aWMgcGFyc2VOb2RlcyhnbCwgZGVzYywgbWVzaGVzLCBza2lucykge1xuICAgICAgICBpZiAoIWRlc2Mubm9kZXMpIHJldHVybiBudWxsO1xuICAgICAgICBjb25zdCBub2RlcyA9IGRlc2Mubm9kZXMubWFwKFxuICAgICAgICAgICAgKHtcbiAgICAgICAgICAgICAgICBjYW1lcmEsIC8vIG9wdGlvbmFsXG4gICAgICAgICAgICAgICAgY2hpbGRyZW4sIC8vIG9wdGlvbmFsXG4gICAgICAgICAgICAgICAgc2tpbjogc2tpbkluZGV4LCAvLyBvcHRpb25hbFxuICAgICAgICAgICAgICAgIG1hdHJpeCwgLy8gb3B0aW9uYWxcbiAgICAgICAgICAgICAgICBtZXNoOiBtZXNoSW5kZXgsIC8vIG9wdGlvbmFsXG4gICAgICAgICAgICAgICAgcm90YXRpb24sIC8vIG9wdGlvbmFsXG4gICAgICAgICAgICAgICAgc2NhbGUsIC8vIG9wdGlvbmFsXG4gICAgICAgICAgICAgICAgdHJhbnNsYXRpb24sIC8vIG9wdGlvbmFsXG4gICAgICAgICAgICAgICAgd2VpZ2h0cywgLy8gb3B0aW9uYWxcbiAgICAgICAgICAgICAgICBuYW1lLCAvLyBvcHRpb25hbFxuICAgICAgICAgICAgICAgIGV4dGVuc2lvbnMsIC8vIG9wdGlvbmFsXG4gICAgICAgICAgICAgICAgZXh0cmFzLCAvLyBvcHRpb25hbFxuICAgICAgICAgICAgfSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IG5vZGUgPSBuZXcgVHJhbnNmb3JtKCk7XG4gICAgICAgICAgICAgICAgaWYgKG5hbWUpIG5vZGUubmFtZSA9IG5hbWU7XG5cbiAgICAgICAgICAgICAgICAvLyBBcHBseSB0cmFuc2Zvcm1hdGlvbnNcbiAgICAgICAgICAgICAgICBpZiAobWF0cml4KSB7XG4gICAgICAgICAgICAgICAgICAgIG5vZGUubWF0cml4LmNvcHkobWF0cml4KTtcbiAgICAgICAgICAgICAgICAgICAgbm9kZS5kZWNvbXBvc2UoKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBpZiAocm90YXRpb24pIG5vZGUucXVhdGVybmlvbi5jb3B5KHJvdGF0aW9uKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNjYWxlKSBub2RlLnNjYWxlLmNvcHkoc2NhbGUpO1xuICAgICAgICAgICAgICAgICAgICBpZiAodHJhbnNsYXRpb24pIG5vZGUucG9zaXRpb24uY29weSh0cmFuc2xhdGlvbik7XG4gICAgICAgICAgICAgICAgICAgIG5vZGUudXBkYXRlTWF0cml4KCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gRmxhZ3MgZm9yIGF2b2lkaW5nIGR1cGxpY2F0ZSB0cmFuc2Zvcm1zIGFuZCByZW1vdmluZyB1bnVzZWQgaW5zdGFuY2Ugbm9kZXNcbiAgICAgICAgICAgICAgICBsZXQgaXNJbnN0YW5jZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBsZXQgaXNGaXJzdEluc3RhbmNlID0gdHJ1ZTtcblxuICAgICAgICAgICAgICAgIC8vIGFkZCBtZXNoIGlmIGluY2x1ZGVkXG4gICAgICAgICAgICAgICAgaWYgKG1lc2hJbmRleCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIG1lc2hlc1ttZXNoSW5kZXhdLnByaW1pdGl2ZXMuZm9yRWFjaCgobWVzaCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG1lc2guZ2VvbWV0cnkuaXNJbnN0YW5jZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc0luc3RhbmNlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFtZXNoLmluc3RhbmNlQ291bnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVzaC5pbnN0YW5jZUNvdW50ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc0ZpcnN0SW5zdGFuY2UgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZS5tYXRyaXgudG9BcnJheShtZXNoLmdlb21ldHJ5LmF0dHJpYnV0ZXMuaW5zdGFuY2VNYXRyaXguZGF0YSwgbWVzaC5pbnN0YW5jZUNvdW50ICogMTYpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lc2guaW5zdGFuY2VDb3VudCsrO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG1lc2guaW5zdGFuY2VDb3VudCA9PT0gbWVzaC5udW1JbnN0YW5jZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gUmVtb3ZlIHByb3BlcnRpZXMgb25jZSBhbGwgaW5zdGFuY2VzIGFkZGVkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBtZXNoLm51bUluc3RhbmNlcztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVsZXRlIG1lc2guaW5zdGFuY2VDb3VudDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gRmxhZyBhdHRyaWJ1dGUgYXMgZGlydHlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVzaC5nZW9tZXRyeS5hdHRyaWJ1dGVzLmluc3RhbmNlTWF0cml4Lm5lZWRzVXBkYXRlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEZvciBpbnN0YW5jZXMsIG9ubHkgdGhlIGZpcnN0IG5vZGUgd2lsbCBhY3R1YWxseSBoYXZlIHRoZSBtZXNoXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaXNJbnN0YW5jZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoaXNGaXJzdEluc3RhbmNlKSBtZXNoLnNldFBhcmVudChub2RlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVzaC5zZXRQYXJlbnQobm9kZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIFJlc2V0IG5vZGUgaWYgaW5zdGFuY2VkIHRvIG5vdCBkdXBsaWNhdGUgdHJhbnNmb3Jtc1xuICAgICAgICAgICAgICAgIGlmIChpc0luc3RhbmNlZCkge1xuICAgICAgICAgICAgICAgICAgICAvLyBSZW1vdmUgdW51c2VkIG5vZGVzIGp1c3QgcHJvdmlkaW5nIGFuIGluc3RhbmNlIHRyYW5zZm9ybVxuICAgICAgICAgICAgICAgICAgICBpZiAoIWlzRmlyc3RJbnN0YW5jZSkgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICAgICAgICAgIC8vIEF2b2lkIGR1cGxpY2F0ZSB0cmFuc2Zvcm0gZm9yIG5vZGUgY29udGFpbmluZyB0aGUgaW5zdGFuY2VkIG1lc2hcbiAgICAgICAgICAgICAgICAgICAgbm9kZS5tYXRyaXguaWRlbnRpdHkoKTtcbiAgICAgICAgICAgICAgICAgICAgbm9kZS5kZWNvbXBvc2UoKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gbm9kZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgKTtcblxuICAgICAgICBkZXNjLm5vZGVzLmZvckVhY2goKHsgY2hpbGRyZW4gPSBbXSB9LCBpKSA9PiB7XG4gICAgICAgICAgICAvLyBTZXQgaGllcmFyY2h5IG5vdyBhbGwgbm9kZXMgY3JlYXRlZFxuICAgICAgICAgICAgY2hpbGRyZW4uZm9yRWFjaCgoY2hpbGRJbmRleCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICghbm9kZXNbY2hpbGRJbmRleF0pIHJldHVybjtcbiAgICAgICAgICAgICAgICBub2Rlc1tjaGlsZEluZGV4XS5zZXRQYXJlbnQobm9kZXNbaV0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBub2RlcztcbiAgICB9XG5cbiAgICBzdGF0aWMgcG9wdWxhdGVTa2lucyhza2lucywgbm9kZXMpIHtcbiAgICAgICAgaWYgKCFza2lucykgcmV0dXJuO1xuICAgICAgICBza2lucy5mb3JFYWNoKChza2luKSA9PiB7XG4gICAgICAgICAgICBza2luLmpvaW50cyA9IHNraW4uam9pbnRzLm1hcCgoaSwgaW5kZXgpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBqb2ludCA9IG5vZGVzW2ldO1xuICAgICAgICAgICAgICAgIGpvaW50LmJpbmRJbnZlcnNlID0gbmV3IE1hdDQoLi4uc2tpbi5pbnZlcnNlQmluZE1hdHJpY2VzLmRhdGEuc2xpY2UoaW5kZXggKiAxNiwgKGluZGV4ICsgMSkgKiAxNikpO1xuICAgICAgICAgICAgICAgIHJldHVybiBqb2ludDtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKHNraW4uc2tlbGV0b24pIHNraW4uc2tlbGV0b24gPSBub2Rlc1tza2luLnNrZWxldG9uXTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgc3RhdGljIHBhcnNlQW5pbWF0aW9ucyhnbCwgZGVzYywgbm9kZXMsIGJ1ZmZlclZpZXdzKSB7XG4gICAgICAgIGlmICghZGVzYy5hbmltYXRpb25zKSByZXR1cm4gbnVsbDtcbiAgICAgICAgcmV0dXJuIGRlc2MuYW5pbWF0aW9ucy5tYXAoXG4gICAgICAgICAgICAoe1xuICAgICAgICAgICAgICAgIGNoYW5uZWxzLCAvLyByZXF1aXJlZFxuICAgICAgICAgICAgICAgIHNhbXBsZXJzLCAvLyByZXF1aXJlZFxuICAgICAgICAgICAgICAgIG5hbWUsIC8vIG9wdGlvbmFsXG4gICAgICAgICAgICAgICAgLy8gZXh0ZW5zaW9ucywgLy8gb3B0aW9uYWxcbiAgICAgICAgICAgICAgICAvLyBleHRyYXMsICAvLyBvcHRpb25hbFxuICAgICAgICAgICAgfSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGRhdGEgPSBjaGFubmVscy5tYXAoXG4gICAgICAgICAgICAgICAgICAgICh7XG4gICAgICAgICAgICAgICAgICAgICAgICBzYW1wbGVyOiBzYW1wbGVySW5kZXgsIC8vIHJlcXVpcmVkXG4gICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXQsIC8vIHJlcXVpcmVkXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBleHRlbnNpb25zLCAvLyBvcHRpb25hbFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gZXh0cmFzLCAvLyBvcHRpb25hbFxuICAgICAgICAgICAgICAgICAgICB9KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5wdXQ6IGlucHV0SW5kZXgsIC8vIHJlcXVpcmVkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW50ZXJwb2xhdGlvbiA9ICdMSU5FQVInLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG91dHB1dDogb3V0cHV0SW5kZXgsIC8vIHJlcXVpcmVkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gZXh0ZW5zaW9ucywgLy8gb3B0aW9uYWxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBleHRyYXMsIC8vIG9wdGlvbmFsXG4gICAgICAgICAgICAgICAgICAgICAgICB9ID0gc2FtcGxlcnNbc2FtcGxlckluZGV4XTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vZGU6IG5vZGVJbmRleCwgLy8gb3B0aW9uYWwgLSBUT0RPOiB3aGVuIGlzIGl0IG5vdCBpbmNsdWRlZD9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXRoLCAvLyByZXF1aXJlZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGV4dGVuc2lvbnMsIC8vIG9wdGlvbmFsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gZXh0cmFzLCAvLyBvcHRpb25hbFxuICAgICAgICAgICAgICAgICAgICAgICAgfSA9IHRhcmdldDtcblxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgbm9kZSA9IG5vZGVzW25vZGVJbmRleF07XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB0cmFuc2Zvcm0gPSBUUkFOU0ZPUk1TW3BhdGhdO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdGltZXMgPSB0aGlzLnBhcnNlQWNjZXNzb3IoaW5wdXRJbmRleCwgZGVzYywgYnVmZmVyVmlld3MpLmRhdGE7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB2YWx1ZXMgPSB0aGlzLnBhcnNlQWNjZXNzb3Iob3V0cHV0SW5kZXgsIGRlc2MsIGJ1ZmZlclZpZXdzKS5kYXRhO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vZGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNmb3JtLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGludGVycG9sYXRpb24sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGltZXMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBuYW1lLFxuICAgICAgICAgICAgICAgICAgICBhbmltYXRpb246IG5ldyBHTFRGQW5pbWF0aW9uKGRhdGEpLFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgc3RhdGljIHBhcnNlU2NlbmVzKGRlc2MsIG5vZGVzKSB7XG4gICAgICAgIGlmICghZGVzYy5zY2VuZXMpIHJldHVybiBudWxsO1xuICAgICAgICByZXR1cm4gZGVzYy5zY2VuZXMubWFwKFxuICAgICAgICAgICAgKHtcbiAgICAgICAgICAgICAgICBub2Rlczogbm9kZXNJbmRpY2VzID0gW10sXG4gICAgICAgICAgICAgICAgbmFtZSwgLy8gb3B0aW9uYWxcbiAgICAgICAgICAgICAgICBleHRlbnNpb25zLFxuICAgICAgICAgICAgICAgIGV4dHJhcyxcbiAgICAgICAgICAgIH0pID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbm9kZXNJbmRpY2VzLnJlZHVjZSgobWFwLCBpKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIC8vIERvbid0IGFkZCBudWxsIG5vZGVzIChpbnN0YW5jZWQgdHJhbnNmb3JtcylcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5vZGVzW2ldKSBtYXAucHVzaChub2Rlc1tpXSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBtYXA7XG4gICAgICAgICAgICAgICAgfSwgW10pO1xuICAgICAgICAgICAgfVxuICAgICAgICApO1xuICAgIH1cbn1cbiIsImltcG9ydCB7IE1lc2ggfSBmcm9tICcuLi9jb3JlL01lc2guanMnO1xuaW1wb3J0IHsgTWF0NCB9IGZyb20gJy4uL21hdGgvTWF0NC5qcyc7XG5pbXBvcnQgeyBUZXh0dXJlIH0gZnJvbSAnLi4vY29yZS9UZXh0dXJlLmpzJztcblxuY29uc3QgdGVtcE1hdDQgPSBuZXcgTWF0NCgpO1xuY29uc3QgaWRlbnRpdHkgPSBuZXcgTWF0NCgpO1xuXG5leHBvcnQgY2xhc3MgR0xURlNraW4gZXh0ZW5kcyBNZXNoIHtcbiAgICBjb25zdHJ1Y3RvcihnbCwgeyBza2VsZXRvbiwgZ2VvbWV0cnksIHByb2dyYW0sIG1vZGUgPSBnbC5UUklBTkdMRVMgfSA9IHt9KSB7XG4gICAgICAgIHN1cGVyKGdsLCB7IGdlb21ldHJ5LCBwcm9ncmFtLCBtb2RlIH0pO1xuICAgICAgICB0aGlzLnNrZWxldG9uID0gc2tlbGV0b247XG4gICAgICAgIHRoaXMucHJvZ3JhbSA9IHByb2dyYW07XG4gICAgICAgIHRoaXMuY3JlYXRlQm9uZVRleHR1cmUoKTtcbiAgICAgICAgdGhpcy5hbmltYXRpb25zID0gW107XG4gICAgfVxuXG4gICAgY3JlYXRlQm9uZVRleHR1cmUoKSB7XG4gICAgICAgIGlmICghdGhpcy5za2VsZXRvbi5qb2ludHMubGVuZ3RoKSByZXR1cm47XG4gICAgICAgIGNvbnN0IHNpemUgPSBNYXRoLm1heCg0LCBNYXRoLnBvdygyLCBNYXRoLmNlaWwoTWF0aC5sb2coTWF0aC5zcXJ0KHRoaXMuc2tlbGV0b24uam9pbnRzLmxlbmd0aCAqIDQpKSAvIE1hdGguTE4yKSkpO1xuICAgICAgICB0aGlzLmJvbmVNYXRyaWNlcyA9IG5ldyBGbG9hdDMyQXJyYXkoc2l6ZSAqIHNpemUgKiA0KTtcbiAgICAgICAgdGhpcy5ib25lVGV4dHVyZVNpemUgPSBzaXplO1xuICAgICAgICB0aGlzLmJvbmVUZXh0dXJlID0gbmV3IFRleHR1cmUodGhpcy5nbCwge1xuICAgICAgICAgICAgaW1hZ2U6IHRoaXMuYm9uZU1hdHJpY2VzLFxuICAgICAgICAgICAgZ2VuZXJhdGVNaXBtYXBzOiBmYWxzZSxcbiAgICAgICAgICAgIHR5cGU6IHRoaXMuZ2wuRkxPQVQsXG4gICAgICAgICAgICBpbnRlcm5hbEZvcm1hdDogdGhpcy5nbC5yZW5kZXJlci5pc1dlYmdsMiA/IHRoaXMuZ2wuUkdCQTMyRiA6IHRoaXMuZ2wuUkdCQSxcbiAgICAgICAgICAgIG1pbkZpbHRlcjogdGhpcy5nbC5ORUFSRVNULFxuICAgICAgICAgICAgbWFnRmlsdGVyOiB0aGlzLmdsLk5FQVJFU1QsXG4gICAgICAgICAgICBmbGlwWTogZmFsc2UsXG4gICAgICAgICAgICB3aWR0aDogc2l6ZSxcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gYWRkQW5pbWF0aW9uKGRhdGEpIHtcbiAgICAvLyAgICAgY29uc3QgYW5pbWF0aW9uID0gbmV3IEFuaW1hdGlvbih7IG9iamVjdHM6IHRoaXMuYm9uZXMsIGRhdGEgfSk7XG4gICAgLy8gICAgIHRoaXMuYW5pbWF0aW9ucy5wdXNoKGFuaW1hdGlvbik7XG4gICAgLy8gICAgIHJldHVybiBhbmltYXRpb247XG4gICAgLy8gfVxuXG4gICAgLy8gdXBkYXRlQW5pbWF0aW9ucygpIHtcbiAgICAvLyAgICAgLy8gQ2FsY3VsYXRlIGNvbWJpbmVkIGFuaW1hdGlvbiB3ZWlnaHRcbiAgICAvLyAgICAgbGV0IHRvdGFsID0gMDtcbiAgICAvLyAgICAgdGhpcy5hbmltYXRpb25zLmZvckVhY2goKGFuaW1hdGlvbikgPT4gKHRvdGFsICs9IGFuaW1hdGlvbi53ZWlnaHQpKTtcblxuICAgIC8vICAgICB0aGlzLmFuaW1hdGlvbnMuZm9yRWFjaCgoYW5pbWF0aW9uLCBpKSA9PiB7XG4gICAgLy8gICAgICAgICAvLyBmb3JjZSBmaXJzdCBhbmltYXRpb24gdG8gc2V0IGluIG9yZGVyIHRvIHJlc2V0IGZyYW1lXG4gICAgLy8gICAgICAgICBhbmltYXRpb24udXBkYXRlKHRvdGFsLCBpID09PSAwKTtcbiAgICAvLyAgICAgfSk7XG4gICAgLy8gfVxuXG4gICAgdXBkYXRlVW5pZm9ybXMoKSB7XG4gICAgICAgIC8vIFVwZGF0ZSBib25lIHRleHR1cmVcbiAgICAgICAgdGhpcy5za2VsZXRvbi5qb2ludHMuZm9yRWFjaCgoYm9uZSwgaSkgPT4ge1xuICAgICAgICAgICAgLy8gRmluZCBkaWZmZXJlbmNlIGJldHdlZW4gY3VycmVudCBhbmQgYmluZCBwb3NlXG4gICAgICAgICAgICB0ZW1wTWF0NC5tdWx0aXBseShib25lLndvcmxkTWF0cml4LCBib25lLmJpbmRJbnZlcnNlKTtcbiAgICAgICAgICAgIHRoaXMuYm9uZU1hdHJpY2VzLnNldCh0ZW1wTWF0NCwgaSAqIDE2KTtcbiAgICAgICAgfSk7XG4gICAgICAgIGlmICh0aGlzLmJvbmVUZXh0dXJlKSB0aGlzLmJvbmVUZXh0dXJlLm5lZWRzVXBkYXRlID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBkcmF3KHsgY2FtZXJhIH0gPSB7fSkge1xuICAgICAgICBpZiAoIXRoaXMucHJvZ3JhbS51bmlmb3Jtcy5ib25lVGV4dHVyZSkge1xuICAgICAgICAgICAgT2JqZWN0LmFzc2lnbih0aGlzLnByb2dyYW0udW5pZm9ybXMsIHtcbiAgICAgICAgICAgICAgICBib25lVGV4dHVyZTogeyB2YWx1ZTogdGhpcy5ib25lVGV4dHVyZSB9LFxuICAgICAgICAgICAgICAgIGJvbmVUZXh0dXJlU2l6ZTogeyB2YWx1ZTogdGhpcy5ib25lVGV4dHVyZVNpemUgfSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy51cGRhdGVVbmlmb3JtcygpO1xuXG4gICAgICAgIC8vIFN3aXRjaCB0aGUgd29ybGQgbWF0cml4IHdpdGggaWRlbnRpdHkgdG8gaWdub3JlIGFueSB0cmFuc2Zvcm1zXG4gICAgICAgIC8vIG9uIHRoZSBtZXNoIGl0c2VsZiAtIG9ubHkgdXNlIHNrZWxldG9uJ3MgdHJhbnNmb3Jtc1xuICAgICAgICBjb25zdCBfd29ybGRNYXRyaXggPSB0aGlzLndvcmxkTWF0cml4O1xuICAgICAgICB0aGlzLndvcmxkTWF0cml4ID0gaWRlbnRpdHk7XG5cbiAgICAgICAgc3VwZXIuZHJhdyh7IGNhbWVyYSB9KTtcblxuICAgICAgICAvLyBTd2l0Y2ggYmFjayB0byBsZWF2ZSBpZGVudGl0eSB1bnRvdWNoZWRcbiAgICAgICAgdGhpcy53b3JsZE1hdHJpeCA9IF93b3JsZE1hdHJpeDtcbiAgICB9XG59XG4iLCJpbXBvcnQgeyBQcm9ncmFtIH0gZnJvbSAnLi4vY29yZS9Qcm9ncmFtLmpzJztcbmltcG9ydCB7IE1lc2ggfSBmcm9tICcuLi9jb3JlL01lc2guanMnO1xuaW1wb3J0IHsgVGV4dHVyZSB9IGZyb20gJy4uL2NvcmUvVGV4dHVyZS5qcyc7XG5pbXBvcnQgeyBSZW5kZXJUYXJnZXQgfSBmcm9tICcuLi9jb3JlL1JlbmRlclRhcmdldC5qcyc7XG5pbXBvcnQgeyBUcmlhbmdsZSB9IGZyb20gJy4vVHJpYW5nbGUuanMnO1xuXG5leHBvcnQgY2xhc3MgR1BHUFUge1xuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICBnbCxcbiAgICAgICAge1xuICAgICAgICAgICAgLy8gQWx3YXlzIHBhc3MgaW4gYXJyYXkgb2YgdmVjNHMgKFJHQkEgdmFsdWVzIHdpdGhpbiB0ZXh0dXJlKVxuICAgICAgICAgICAgZGF0YSA9IG5ldyBGbG9hdDMyQXJyYXkoMTYpLFxuICAgICAgICAgICAgZ2VvbWV0cnkgPSBuZXcgVHJpYW5nbGUoZ2wpLFxuICAgICAgICAgICAgdHlwZSwgLy8gUGFzcyBpbiBnbC5GTE9BVCB0byBmb3JjZSBpdCwgZGVmYXVsdHMgdG8gZ2wuSEFMRl9GTE9BVFxuICAgICAgICB9XG4gICAgKSB7XG4gICAgICAgIHRoaXMuZ2wgPSBnbDtcbiAgICAgICAgY29uc3QgaW5pdGlhbERhdGEgPSBkYXRhO1xuICAgICAgICB0aGlzLnBhc3NlcyA9IFtdO1xuICAgICAgICB0aGlzLmdlb21ldHJ5ID0gZ2VvbWV0cnk7XG4gICAgICAgIHRoaXMuZGF0YUxlbmd0aCA9IGluaXRpYWxEYXRhLmxlbmd0aCAvIDQ7XG5cbiAgICAgICAgLy8gV2luZG93cyBhbmQgaU9TIG9ubHkgbGlrZSBwb3dlciBvZiAyIHRleHR1cmVzXG4gICAgICAgIC8vIEZpbmQgc21hbGxlc3QgUE8yIHRoYXQgZml0cyBkYXRhXG4gICAgICAgIHRoaXMuc2l6ZSA9IE1hdGgucG93KDIsIE1hdGguY2VpbChNYXRoLmxvZyhNYXRoLmNlaWwoTWF0aC5zcXJ0KHRoaXMuZGF0YUxlbmd0aCkpKSAvIE1hdGguTE4yKSk7XG5cbiAgICAgICAgLy8gQ3JlYXRlIGNvb3JkcyBmb3Igb3V0cHV0IHRleHR1cmVcbiAgICAgICAgdGhpcy5jb29yZHMgPSBuZXcgRmxvYXQzMkFycmF5KHRoaXMuZGF0YUxlbmd0aCAqIDIpO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuZGF0YUxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCB4ID0gKGkgJSB0aGlzLnNpemUpIC8gdGhpcy5zaXplOyAvLyB0byBhZGQgMC41IHRvIGJlIGNlbnRlciBwaXhlbCA/XG4gICAgICAgICAgICBjb25zdCB5ID0gTWF0aC5mbG9vcihpIC8gdGhpcy5zaXplKSAvIHRoaXMuc2l6ZTtcbiAgICAgICAgICAgIHRoaXMuY29vcmRzLnNldChbeCwgeV0sIGkgKiAyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFVzZSBvcmlnaW5hbCBkYXRhIGlmIGFscmVhZHkgY29ycmVjdCBsZW5ndGggb2YgUE8yIHRleHR1cmUsIGVsc2UgY29weSB0byBuZXcgYXJyYXkgb2YgY29ycmVjdCBsZW5ndGhcbiAgICAgICAgY29uc3QgZmxvYXRBcnJheSA9ICgoKSA9PiB7XG4gICAgICAgICAgICBpZiAoaW5pdGlhbERhdGEubGVuZ3RoID09PSB0aGlzLnNpemUgKiB0aGlzLnNpemUgKiA0KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGluaXRpYWxEYXRhO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zdCBhID0gbmV3IEZsb2F0MzJBcnJheSh0aGlzLnNpemUgKiB0aGlzLnNpemUgKiA0KTtcbiAgICAgICAgICAgICAgICBhLnNldChpbml0aWFsRGF0YSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGE7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pKCk7XG5cbiAgICAgICAgLy8gQ3JlYXRlIG91dHB1dCB0ZXh0dXJlIHVuaWZvcm0gdXNpbmcgaW5wdXQgZmxvYXQgdGV4dHVyZSB3aXRoIGluaXRpYWwgZGF0YVxuICAgICAgICB0aGlzLnVuaWZvcm0gPSB7XG4gICAgICAgICAgICB2YWx1ZTogbmV3IFRleHR1cmUoZ2wsIHtcbiAgICAgICAgICAgICAgICBpbWFnZTogZmxvYXRBcnJheSxcbiAgICAgICAgICAgICAgICB0YXJnZXQ6IGdsLlRFWFRVUkVfMkQsXG4gICAgICAgICAgICAgICAgdHlwZTogZ2wuRkxPQVQsXG4gICAgICAgICAgICAgICAgZm9ybWF0OiBnbC5SR0JBLFxuICAgICAgICAgICAgICAgIGludGVybmFsRm9ybWF0OiBnbC5yZW5kZXJlci5pc1dlYmdsMiA/IGdsLlJHQkEzMkYgOiBnbC5SR0JBLFxuICAgICAgICAgICAgICAgIHdyYXBTOiBnbC5DTEFNUF9UT19FREdFLFxuICAgICAgICAgICAgICAgIHdyYXBUOiBnbC5DTEFNUF9UT19FREdFLFxuICAgICAgICAgICAgICAgIGdlbmVyYXRlTWlwbWFwczogZmFsc2UsXG4gICAgICAgICAgICAgICAgbWluRmlsdGVyOiBnbC5ORUFSRVNULFxuICAgICAgICAgICAgICAgIG1hZ0ZpbHRlcjogZ2wuTkVBUkVTVCxcbiAgICAgICAgICAgICAgICB3aWR0aDogdGhpcy5zaXplLFxuICAgICAgICAgICAgICAgIGZsaXBZOiBmYWxzZSxcbiAgICAgICAgICAgIH0pLFxuICAgICAgICB9O1xuXG4gICAgICAgIC8vIENyZWF0ZSBGQk9zXG4gICAgICAgIGNvbnN0IG9wdGlvbnMgPSB7XG4gICAgICAgICAgICB3aWR0aDogdGhpcy5zaXplLFxuICAgICAgICAgICAgaGVpZ2h0OiB0aGlzLnNpemUsXG4gICAgICAgICAgICB0eXBlOiB0eXBlIHx8IGdsLkhBTEZfRkxPQVQgfHwgZ2wucmVuZGVyZXIuZXh0ZW5zaW9uc1snT0VTX3RleHR1cmVfaGFsZl9mbG9hdCddLkhBTEZfRkxPQVRfT0VTLFxuICAgICAgICAgICAgZm9ybWF0OiBnbC5SR0JBLFxuICAgICAgICAgICAgaW50ZXJuYWxGb3JtYXQ6IGdsLnJlbmRlcmVyLmlzV2ViZ2wyID8gKHR5cGUgPT09IGdsLkZMT0FUID8gZ2wuUkdCQTMyRiA6IGdsLlJHQkExNkYpIDogZ2wuUkdCQSxcbiAgICAgICAgICAgIG1pbkZpbHRlcjogZ2wuTkVBUkVTVCxcbiAgICAgICAgICAgIGRlcHRoOiBmYWxzZSxcbiAgICAgICAgICAgIHVucGFja0FsaWdubWVudDogMSxcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmZibyA9IHtcbiAgICAgICAgICAgIHJlYWQ6IG5ldyBSZW5kZXJUYXJnZXQoZ2wsIG9wdGlvbnMpLFxuICAgICAgICAgICAgd3JpdGU6IG5ldyBSZW5kZXJUYXJnZXQoZ2wsIG9wdGlvbnMpLFxuICAgICAgICAgICAgc3dhcDogKCkgPT4ge1xuICAgICAgICAgICAgICAgIGxldCB0ZW1wID0gdGhpcy5mYm8ucmVhZDtcbiAgICAgICAgICAgICAgICB0aGlzLmZiby5yZWFkID0gdGhpcy5mYm8ud3JpdGU7XG4gICAgICAgICAgICAgICAgdGhpcy5mYm8ud3JpdGUgPSB0ZW1wO1xuICAgICAgICAgICAgICAgIHRoaXMudW5pZm9ybS52YWx1ZSA9IHRoaXMuZmJvLnJlYWQudGV4dHVyZTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgYWRkUGFzcyh7IHZlcnRleCA9IGRlZmF1bHRWZXJ0ZXgsIGZyYWdtZW50ID0gZGVmYXVsdEZyYWdtZW50LCB1bmlmb3JtcyA9IHt9LCB0ZXh0dXJlVW5pZm9ybSA9ICd0TWFwJywgZW5hYmxlZCA9IHRydWUgfSA9IHt9KSB7XG4gICAgICAgIHVuaWZvcm1zW3RleHR1cmVVbmlmb3JtXSA9IHRoaXMudW5pZm9ybTtcbiAgICAgICAgY29uc3QgcHJvZ3JhbSA9IG5ldyBQcm9ncmFtKHRoaXMuZ2wsIHsgdmVydGV4LCBmcmFnbWVudCwgdW5pZm9ybXMgfSk7XG4gICAgICAgIGNvbnN0IG1lc2ggPSBuZXcgTWVzaCh0aGlzLmdsLCB7IGdlb21ldHJ5OiB0aGlzLmdlb21ldHJ5LCBwcm9ncmFtIH0pO1xuXG4gICAgICAgIGNvbnN0IHBhc3MgPSB7XG4gICAgICAgICAgICBtZXNoLFxuICAgICAgICAgICAgcHJvZ3JhbSxcbiAgICAgICAgICAgIHVuaWZvcm1zLFxuICAgICAgICAgICAgZW5hYmxlZCxcbiAgICAgICAgICAgIHRleHR1cmVVbmlmb3JtLFxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMucGFzc2VzLnB1c2gocGFzcyk7XG4gICAgICAgIHJldHVybiBwYXNzO1xuICAgIH1cblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgY29uc3QgZW5hYmxlZFBhc3NlcyA9IHRoaXMucGFzc2VzLmZpbHRlcigocGFzcykgPT4gcGFzcy5lbmFibGVkKTtcblxuICAgICAgICBlbmFibGVkUGFzc2VzLmZvckVhY2goKHBhc3MsIGkpID0+IHtcbiAgICAgICAgICAgIHRoaXMuZ2wucmVuZGVyZXIucmVuZGVyKHtcbiAgICAgICAgICAgICAgICBzY2VuZTogcGFzcy5tZXNoLFxuICAgICAgICAgICAgICAgIHRhcmdldDogdGhpcy5mYm8ud3JpdGUsXG4gICAgICAgICAgICAgICAgY2xlYXI6IGZhbHNlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLmZiby5zd2FwKCk7XG4gICAgICAgIH0pO1xuICAgIH1cbn1cblxuY29uc3QgZGVmYXVsdFZlcnRleCA9IC8qIGdsc2wgKi8gYFxuICAgIGF0dHJpYnV0ZSB2ZWMyIHV2O1xuICAgIGF0dHJpYnV0ZSB2ZWMyIHBvc2l0aW9uO1xuXG4gICAgdmFyeWluZyB2ZWMyIHZVdjtcblxuICAgIHZvaWQgbWFpbigpIHtcbiAgICAgICAgdlV2ID0gdXY7XG4gICAgICAgIGdsX1Bvc2l0aW9uID0gdmVjNChwb3NpdGlvbiwgMCwgMSk7XG4gICAgfVxuYDtcblxuY29uc3QgZGVmYXVsdEZyYWdtZW50ID0gLyogZ2xzbCAqLyBgXG4gICAgcHJlY2lzaW9uIGhpZ2hwIGZsb2F0O1xuXG4gICAgdW5pZm9ybSBzYW1wbGVyMkQgdE1hcDtcbiAgICB2YXJ5aW5nIHZlYzIgdlV2O1xuXG4gICAgdm9pZCBtYWluKCkge1xuICAgICAgICBnbF9GcmFnQ29sb3IgPSB0ZXh0dXJlMkQodE1hcCwgdlV2KTtcbiAgICB9XG5gO1xuIiwiaW1wb3J0IHsgVGV4dHVyZSB9IGZyb20gJy4uL2NvcmUvVGV4dHVyZS5qcyc7XG5cbi8vIFRPRE86IFN1cHBvcnQgY3ViZW1hcHNcbi8vIEdlbmVyYXRlIHRleHR1cmVzIHVzaW5nIGh0dHBzOi8vZ2l0aHViLmNvbS9UaW12YW5TY2hlcnBlbnplZWwvdGV4dHVyZS1jb21wcmVzc29yXG5cbmV4cG9ydCBjbGFzcyBLVFhUZXh0dXJlIGV4dGVuZHMgVGV4dHVyZSB7XG4gICAgY29uc3RydWN0b3IoZ2wsIHsgYnVmZmVyLCB3cmFwUyA9IGdsLkNMQU1QX1RPX0VER0UsIHdyYXBUID0gZ2wuQ0xBTVBfVE9fRURHRSwgYW5pc290cm9weSA9IDAsIG1pbkZpbHRlciwgbWFnRmlsdGVyIH0gPSB7fSkge1xuICAgICAgICBzdXBlcihnbCwge1xuICAgICAgICAgICAgZ2VuZXJhdGVNaXBtYXBzOiBmYWxzZSxcbiAgICAgICAgICAgIHdyYXBTLFxuICAgICAgICAgICAgd3JhcFQsXG4gICAgICAgICAgICBhbmlzb3Ryb3B5LFxuICAgICAgICAgICAgbWluRmlsdGVyLFxuICAgICAgICAgICAgbWFnRmlsdGVyLFxuICAgICAgICB9KTtcblxuICAgICAgICBpZiAoYnVmZmVyKSByZXR1cm4gdGhpcy5wYXJzZUJ1ZmZlcihidWZmZXIpO1xuICAgIH1cblxuICAgIHBhcnNlQnVmZmVyKGJ1ZmZlcikge1xuICAgICAgICBjb25zdCBrdHggPSBuZXcgS2hyb25vc1RleHR1cmVDb250YWluZXIoYnVmZmVyKTtcbiAgICAgICAga3R4Lm1pcG1hcHMuaXNDb21wcmVzc2VkVGV4dHVyZSA9IHRydWU7XG5cbiAgICAgICAgLy8gVXBkYXRlIHRleHR1cmVcbiAgICAgICAgdGhpcy5pbWFnZSA9IGt0eC5taXBtYXBzO1xuICAgICAgICB0aGlzLmludGVybmFsRm9ybWF0ID0ga3R4LmdsSW50ZXJuYWxGb3JtYXQ7XG4gICAgICAgIGlmIChrdHgubnVtYmVyT2ZNaXBtYXBMZXZlbHMgPiAxKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5taW5GaWx0ZXIgPT09IHRoaXMuZ2wuTElORUFSKSB0aGlzLm1pbkZpbHRlciA9IHRoaXMuZ2wuTkVBUkVTVF9NSVBNQVBfTElORUFSO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKHRoaXMubWluRmlsdGVyID09PSB0aGlzLmdsLk5FQVJFU1RfTUlQTUFQX0xJTkVBUikgdGhpcy5taW5GaWx0ZXIgPSB0aGlzLmdsLkxJTkVBUjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFRPRE86IHN1cHBvcnQgY3ViZSBtYXBzXG4gICAgICAgIC8vIGt0eC5udW1iZXJPZkZhY2VzXG4gICAgfVxufVxuXG5mdW5jdGlvbiBLaHJvbm9zVGV4dHVyZUNvbnRhaW5lcihidWZmZXIpIHtcbiAgICBjb25zdCBpZENoZWNrID0gWzB4YWIsIDB4NGIsIDB4NTQsIDB4NTgsIDB4MjAsIDB4MzEsIDB4MzEsIDB4YmIsIDB4MGQsIDB4MGEsIDB4MWEsIDB4MGFdO1xuICAgIGNvbnN0IGlkID0gbmV3IFVpbnQ4QXJyYXkoYnVmZmVyLCAwLCAxMik7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpZC5sZW5ndGg7IGkrKykgaWYgKGlkW2ldICE9PSBpZENoZWNrW2ldKSByZXR1cm4gY29uc29sZS5lcnJvcignRmlsZSBtaXNzaW5nIEtUWCBpZGVudGlmaWVyJyk7XG5cbiAgICAvLyBUT0RPOiBJcyB0aGlzIGFsd2F5cyA0PyBUZXN0ZWQ6IFthbmRyb2lkLCBtYWNvc11cbiAgICBjb25zdCBzaXplID0gVWludDMyQXJyYXkuQllURVNfUEVSX0VMRU1FTlQ7XG4gICAgY29uc3QgaGVhZCA9IG5ldyBEYXRhVmlldyhidWZmZXIsIDEyLCAxMyAqIHNpemUpO1xuICAgIGNvbnN0IGxpdHRsZUVuZGlhbiA9IGhlYWQuZ2V0VWludDMyKDAsIHRydWUpID09PSAweDA0MDMwMjAxO1xuICAgIGNvbnN0IGdsVHlwZSA9IGhlYWQuZ2V0VWludDMyKDEgKiBzaXplLCBsaXR0bGVFbmRpYW4pO1xuICAgIGlmIChnbFR5cGUgIT09IDApIHJldHVybiBjb25zb2xlLndhcm4oJ29ubHkgY29tcHJlc3NlZCBmb3JtYXRzIGN1cnJlbnRseSBzdXBwb3J0ZWQnKTtcbiAgICB0aGlzLmdsSW50ZXJuYWxGb3JtYXQgPSBoZWFkLmdldFVpbnQzMig0ICogc2l6ZSwgbGl0dGxlRW5kaWFuKTtcbiAgICBsZXQgd2lkdGggPSBoZWFkLmdldFVpbnQzMig2ICogc2l6ZSwgbGl0dGxlRW5kaWFuKTtcbiAgICBsZXQgaGVpZ2h0ID0gaGVhZC5nZXRVaW50MzIoNyAqIHNpemUsIGxpdHRsZUVuZGlhbik7XG4gICAgdGhpcy5udW1iZXJPZkZhY2VzID0gaGVhZC5nZXRVaW50MzIoMTAgKiBzaXplLCBsaXR0bGVFbmRpYW4pO1xuICAgIHRoaXMubnVtYmVyT2ZNaXBtYXBMZXZlbHMgPSBNYXRoLm1heCgxLCBoZWFkLmdldFVpbnQzMigxMSAqIHNpemUsIGxpdHRsZUVuZGlhbikpO1xuICAgIGNvbnN0IGJ5dGVzT2ZLZXlWYWx1ZURhdGEgPSBoZWFkLmdldFVpbnQzMigxMiAqIHNpemUsIGxpdHRsZUVuZGlhbik7XG5cbiAgICB0aGlzLm1pcG1hcHMgPSBbXTtcbiAgICBsZXQgb2Zmc2V0ID0gMTIgKyAxMyAqIDQgKyBieXRlc09mS2V5VmFsdWVEYXRhO1xuICAgIGZvciAobGV0IGxldmVsID0gMDsgbGV2ZWwgPCB0aGlzLm51bWJlck9mTWlwbWFwTGV2ZWxzOyBsZXZlbCsrKSB7XG4gICAgICAgIGNvbnN0IGxldmVsU2l6ZSA9IG5ldyBJbnQzMkFycmF5KGJ1ZmZlciwgb2Zmc2V0LCAxKVswXTsgLy8gc2l6ZSBwZXIgZmFjZSwgc2luY2Ugbm90IHN1cHBvcnRpbmcgYXJyYXkgY3ViZW1hcHNcbiAgICAgICAgb2Zmc2V0ICs9IDQ7IC8vIGxldmVsU2l6ZSBmaWVsZFxuICAgICAgICBmb3IgKGxldCBmYWNlID0gMDsgZmFjZSA8IHRoaXMubnVtYmVyT2ZGYWNlczsgZmFjZSsrKSB7XG4gICAgICAgICAgICBjb25zdCBkYXRhID0gbmV3IFVpbnQ4QXJyYXkoYnVmZmVyLCBvZmZzZXQsIGxldmVsU2l6ZSk7XG4gICAgICAgICAgICB0aGlzLm1pcG1hcHMucHVzaCh7IGRhdGEsIHdpZHRoLCBoZWlnaHQgfSk7XG4gICAgICAgICAgICBvZmZzZXQgKz0gbGV2ZWxTaXplO1xuICAgICAgICAgICAgb2Zmc2V0ICs9IDMgLSAoKGxldmVsU2l6ZSArIDMpICUgNCk7IC8vIGFkZCBwYWRkaW5nIGZvciBvZGQgc2l6ZWQgaW1hZ2VcbiAgICAgICAgfVxuICAgICAgICB3aWR0aCA9IHdpZHRoID4+IDE7XG4gICAgICAgIGhlaWdodCA9IGhlaWdodCA+PiAxO1xuICAgIH1cbn1cbiIsImltcG9ydCB7IFByb2dyYW0gfSBmcm9tICcuLi9jb3JlL1Byb2dyYW0uanMnO1xuXG5jb25zdCB2ZXJ0ZXggPSAvKiBnbHNsICovIGBcbiAgICBwcmVjaXNpb24gaGlnaHAgZmxvYXQ7XG4gICAgcHJlY2lzaW9uIGhpZ2hwIGludDtcblxuICAgIGF0dHJpYnV0ZSB2ZWMzIHBvc2l0aW9uO1xuICAgIGF0dHJpYnV0ZSB2ZWMzIG5vcm1hbDtcblxuICAgIHVuaWZvcm0gbWF0MyBub3JtYWxNYXRyaXg7XG4gICAgdW5pZm9ybSBtYXQ0IG1vZGVsVmlld01hdHJpeDtcbiAgICB1bmlmb3JtIG1hdDQgcHJvamVjdGlvbk1hdHJpeDtcblxuICAgIHZhcnlpbmcgdmVjMyB2Tm9ybWFsO1xuXG4gICAgdm9pZCBtYWluKCkge1xuICAgICAgICB2Tm9ybWFsID0gbm9ybWFsaXplKG5vcm1hbE1hdHJpeCAqIG5vcm1hbCk7XG4gICAgICAgIGdsX1Bvc2l0aW9uID0gcHJvamVjdGlvbk1hdHJpeCAqIG1vZGVsVmlld01hdHJpeCAqIHZlYzQocG9zaXRpb24sIDEuMCk7XG4gICAgfVxuYDtcblxuY29uc3QgZnJhZ21lbnQgPSAvKiBnbHNsICovIGBcbiAgICBwcmVjaXNpb24gaGlnaHAgZmxvYXQ7XG4gICAgcHJlY2lzaW9uIGhpZ2hwIGludDtcblxuICAgIHZhcnlpbmcgdmVjMyB2Tm9ybWFsO1xuXG4gICAgdm9pZCBtYWluKCkge1xuICAgICAgICBnbF9GcmFnQ29sb3IucmdiID0gbm9ybWFsaXplKHZOb3JtYWwpO1xuICAgICAgICBnbF9GcmFnQ29sb3IuYSA9IDEuMDtcbiAgICB9XG5gO1xuXG5leHBvcnQgZnVuY3Rpb24gTm9ybWFsUHJvZ3JhbShnbCkge1xuICAgIHJldHVybiBuZXcgUHJvZ3JhbShnbCwge1xuICAgICAgICB2ZXJ0ZXg6IHZlcnRleCxcbiAgICAgICAgZnJhZ21lbnQ6IGZyYWdtZW50LFxuICAgICAgICBjdWxsRmFjZTogbnVsbCxcbiAgICB9KTtcbn1cbiIsIi8vIEJhc2VkIGZyb20gVGhyZWVKUycgT3JiaXRDb250cm9scyBjbGFzcywgcmV3cml0dGVuIHVzaW5nIGVzNiB3aXRoIHNvbWUgYWRkaXRpb25zIGFuZCBzdWJ0cmFjdGlvbnMuXG4vLyBUT0RPOiBhYnN0cmFjdCBldmVudCBoYW5kbGVycyBzbyBjYW4gYmUgZmVkIGZyb20gb3RoZXIgc291cmNlc1xuLy8gVE9ETzogbWFrZSBzY3JvbGwgem9vbSBtb3JlIGFjY3VyYXRlIHRoYW4ganVzdCA+LzwgemVyb1xuLy8gVE9ETzogYmUgYWJsZSB0byBwYXNzIGluIG5ldyBjYW1lcmEgcG9zaXRpb25cblxuaW1wb3J0IHsgVmVjMyB9IGZyb20gJy4uL21hdGgvVmVjMy5qcyc7XG5pbXBvcnQgeyBWZWMyIH0gZnJvbSAnLi4vbWF0aC9WZWMyLmpzJztcblxuY29uc3QgU1RBVEUgPSB7IE5PTkU6IC0xLCBST1RBVEU6IDAsIERPTExZOiAxLCBQQU46IDIsIERPTExZX1BBTjogMyB9O1xuY29uc3QgdGVtcFZlYzMgPSBuZXcgVmVjMygpO1xuY29uc3QgdGVtcFZlYzJhID0gbmV3IFZlYzIoKTtcbmNvbnN0IHRlbXBWZWMyYiA9IG5ldyBWZWMyKCk7XG5cbmV4cG9ydCBmdW5jdGlvbiBPcmJpdChcbiAgICBvYmplY3QsXG4gICAge1xuICAgICAgICBlbGVtZW50ID0gZG9jdW1lbnQsXG4gICAgICAgIGVuYWJsZWQgPSB0cnVlLFxuICAgICAgICB0YXJnZXQgPSBuZXcgVmVjMygpLFxuICAgICAgICBlYXNlID0gMC4yNSxcbiAgICAgICAgaW5lcnRpYSA9IDAuODUsXG4gICAgICAgIGVuYWJsZVJvdGF0ZSA9IHRydWUsXG4gICAgICAgIHJvdGF0ZVNwZWVkID0gMC4xLFxuICAgICAgICBhdXRvUm90YXRlID0gZmFsc2UsXG4gICAgICAgIGF1dG9Sb3RhdGVTcGVlZCA9IDEuMCxcbiAgICAgICAgZW5hYmxlWm9vbSA9IHRydWUsXG4gICAgICAgIHpvb21TcGVlZCA9IDEsXG4gICAgICAgIGVuYWJsZVBhbiA9IHRydWUsXG4gICAgICAgIHBhblNwZWVkID0gMC4xLFxuICAgICAgICBtaW5Qb2xhckFuZ2xlID0gMCxcbiAgICAgICAgbWF4UG9sYXJBbmdsZSA9IE1hdGguUEksXG4gICAgICAgIG1pbkF6aW11dGhBbmdsZSA9IC1JbmZpbml0eSxcbiAgICAgICAgbWF4QXppbXV0aEFuZ2xlID0gSW5maW5pdHksXG4gICAgICAgIG1pbkRpc3RhbmNlID0gMCxcbiAgICAgICAgbWF4RGlzdGFuY2UgPSBJbmZpbml0eSxcbiAgICB9ID0ge31cbikge1xuICAgIHRoaXMuZW5hYmxlZCA9IGVuYWJsZWQ7XG4gICAgdGhpcy50YXJnZXQgPSB0YXJnZXQ7XG4gICAgdGhpcy5yb3RhdGVTcGVlZCA9IHJvdGF0ZVNwZWVkO1xuICAgIHRoaXMucGFuU3BlZWQgPSBwYW5TcGVlZDtcbiAgICB0aGlzLmF1dG9Sb3RhdGUgPSBhdXRvUm90YXRlO1xuICAgIHRoaXMuYXV0b1JvdGF0ZVNwZWVkID0gYXV0b1JvdGF0ZVNwZWVkO1xuICAgIC8vIENhdGNoIGF0dGVtcHRzIHRvIGRpc2FibGUgLSBzZXQgdG8gMSBzbyBoYXMgbm8gZWZmZWN0XG4gICAgZWFzZSA9IGVhc2UgfHwgMTtcbiAgICBpbmVydGlhID0gaW5lcnRpYSB8fCAwO1xuXG4gICAgdGhpcy5taW5EaXN0YW5jZSA9IG1pbkRpc3RhbmNlO1xuICAgIHRoaXMubWF4RGlzdGFuY2UgPSBtYXhEaXN0YW5jZTtcblxuICAgIC8vIGN1cnJlbnQgcG9zaXRpb24gaW4gc3BoZXJpY2FsVGFyZ2V0IGNvb3JkaW5hdGVzXG4gICAgY29uc3Qgc3BoZXJpY2FsRGVsdGEgPSB7IHJhZGl1czogMSwgcGhpOiAwLCB0aGV0YTogMCB9O1xuICAgIGNvbnN0IHNwaGVyaWNhbFRhcmdldCA9IHsgcmFkaXVzOiAxLCBwaGk6IDAsIHRoZXRhOiAwIH07XG4gICAgY29uc3Qgc3BoZXJpY2FsID0geyByYWRpdXM6IDEsIHBoaTogMCwgdGhldGE6IDAgfTtcbiAgICBjb25zdCBwYW5EZWx0YSA9IG5ldyBWZWMzKCk7XG5cbiAgICAvLyBHcmFiIGluaXRpYWwgcG9zaXRpb24gdmFsdWVzXG4gICAgY29uc3Qgb2Zmc2V0ID0gbmV3IFZlYzMoKTtcbiAgICBvZmZzZXQuY29weShvYmplY3QucG9zaXRpb24pLnN1Yih0aGlzLnRhcmdldCk7XG4gICAgc3BoZXJpY2FsLnJhZGl1cyA9IHNwaGVyaWNhbFRhcmdldC5yYWRpdXMgPSBvZmZzZXQuZGlzdGFuY2UoKTtcbiAgICBzcGhlcmljYWwudGhldGEgPSBzcGhlcmljYWxUYXJnZXQudGhldGEgPSBNYXRoLmF0YW4yKG9mZnNldC54LCBvZmZzZXQueik7XG4gICAgc3BoZXJpY2FsLnBoaSA9IHNwaGVyaWNhbFRhcmdldC5waGkgPSBNYXRoLmFjb3MoTWF0aC5taW4oTWF0aC5tYXgob2Zmc2V0LnkgLyBzcGhlcmljYWxUYXJnZXQucmFkaXVzLCAtMSksIDEpKTtcblxuICAgIHRoaXMub2Zmc2V0ID0gb2Zmc2V0O1xuXG4gICAgdGhpcy51cGRhdGUgPSAoKSA9PiB7XG4gICAgICAgIGlmICh0aGlzLmF1dG9Sb3RhdGUpIHtcbiAgICAgICAgICAgIGhhbmRsZUF1dG9Sb3RhdGUodGhpcy5hdXRvUm90YXRlU3BlZWQpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gYXBwbHkgZGVsdGFcbiAgICAgICAgc3BoZXJpY2FsVGFyZ2V0LnJhZGl1cyAqPSBzcGhlcmljYWxEZWx0YS5yYWRpdXM7XG4gICAgICAgIHNwaGVyaWNhbFRhcmdldC50aGV0YSArPSBzcGhlcmljYWxEZWx0YS50aGV0YTtcbiAgICAgICAgc3BoZXJpY2FsVGFyZ2V0LnBoaSArPSBzcGhlcmljYWxEZWx0YS5waGk7XG5cbiAgICAgICAgLy8gYXBwbHkgYm91bmRhcmllc1xuICAgICAgICBzcGhlcmljYWxUYXJnZXQudGhldGEgPSBNYXRoLm1heChtaW5BemltdXRoQW5nbGUsIE1hdGgubWluKG1heEF6aW11dGhBbmdsZSwgc3BoZXJpY2FsVGFyZ2V0LnRoZXRhKSk7XG4gICAgICAgIHNwaGVyaWNhbFRhcmdldC5waGkgPSBNYXRoLm1heChtaW5Qb2xhckFuZ2xlLCBNYXRoLm1pbihtYXhQb2xhckFuZ2xlLCBzcGhlcmljYWxUYXJnZXQucGhpKSk7XG4gICAgICAgIHNwaGVyaWNhbFRhcmdldC5yYWRpdXMgPSBNYXRoLm1heCh0aGlzLm1pbkRpc3RhbmNlLCBNYXRoLm1pbih0aGlzLm1heERpc3RhbmNlLCBzcGhlcmljYWxUYXJnZXQucmFkaXVzKSk7XG5cbiAgICAgICAgLy8gZWFzZSB2YWx1ZXNcbiAgICAgICAgc3BoZXJpY2FsLnBoaSArPSAoc3BoZXJpY2FsVGFyZ2V0LnBoaSAtIHNwaGVyaWNhbC5waGkpICogZWFzZTtcbiAgICAgICAgc3BoZXJpY2FsLnRoZXRhICs9IChzcGhlcmljYWxUYXJnZXQudGhldGEgLSBzcGhlcmljYWwudGhldGEpICogZWFzZTtcbiAgICAgICAgc3BoZXJpY2FsLnJhZGl1cyArPSAoc3BoZXJpY2FsVGFyZ2V0LnJhZGl1cyAtIHNwaGVyaWNhbC5yYWRpdXMpICogZWFzZTtcblxuICAgICAgICAvLyBhcHBseSBwYW4gdG8gdGFyZ2V0LiBBcyBvZmZzZXQgaXMgcmVsYXRpdmUgdG8gdGFyZ2V0LCBpdCBhbHNvIHNoaWZ0c1xuICAgICAgICB0aGlzLnRhcmdldC5hZGQocGFuRGVsdGEpO1xuXG4gICAgICAgIC8vIGFwcGx5IHJvdGF0aW9uIHRvIG9mZnNldFxuICAgICAgICBsZXQgc2luUGhpUmFkaXVzID0gc3BoZXJpY2FsLnJhZGl1cyAqIE1hdGguc2luKE1hdGgubWF4KDAuMDAwMDAxLCBzcGhlcmljYWwucGhpKSk7XG4gICAgICAgIG9mZnNldC54ID0gc2luUGhpUmFkaXVzICogTWF0aC5zaW4oc3BoZXJpY2FsLnRoZXRhKTtcbiAgICAgICAgb2Zmc2V0LnkgPSBzcGhlcmljYWwucmFkaXVzICogTWF0aC5jb3Moc3BoZXJpY2FsLnBoaSk7XG4gICAgICAgIG9mZnNldC56ID0gc2luUGhpUmFkaXVzICogTWF0aC5jb3Moc3BoZXJpY2FsLnRoZXRhKTtcblxuICAgICAgICAvLyBBcHBseSB1cGRhdGVkIHZhbHVlcyB0byBvYmplY3RcbiAgICAgICAgb2JqZWN0LnBvc2l0aW9uLmNvcHkodGhpcy50YXJnZXQpLmFkZChvZmZzZXQpO1xuICAgICAgICBvYmplY3QubG9va0F0KHRoaXMudGFyZ2V0KTtcblxuICAgICAgICAvLyBBcHBseSBpbmVydGlhIHRvIHZhbHVlc1xuICAgICAgICBzcGhlcmljYWxEZWx0YS50aGV0YSAqPSBpbmVydGlhO1xuICAgICAgICBzcGhlcmljYWxEZWx0YS5waGkgKj0gaW5lcnRpYTtcbiAgICAgICAgcGFuRGVsdGEubXVsdGlwbHkoaW5lcnRpYSk7XG5cbiAgICAgICAgLy8gUmVzZXQgc2NhbGUgZXZlcnkgZnJhbWUgdG8gYXZvaWQgYXBwbHlpbmcgc2NhbGUgbXVsdGlwbGUgdGltZXNcbiAgICAgICAgc3BoZXJpY2FsRGVsdGEucmFkaXVzID0gMTtcbiAgICB9O1xuXG4gICAgLy8gVXBkYXRlcyBpbnRlcm5hbHMgd2l0aCBuZXcgcG9zaXRpb25cbiAgICB0aGlzLmZvcmNlUG9zaXRpb24gPSAoKSA9PiB7XG4gICAgICAgIG9mZnNldC5jb3B5KG9iamVjdC5wb3NpdGlvbikuc3ViKHRoaXMudGFyZ2V0KTtcbiAgICAgICAgc3BoZXJpY2FsLnJhZGl1cyA9IHNwaGVyaWNhbFRhcmdldC5yYWRpdXMgPSBvZmZzZXQuZGlzdGFuY2UoKTtcbiAgICAgICAgc3BoZXJpY2FsLnRoZXRhID0gc3BoZXJpY2FsVGFyZ2V0LnRoZXRhID0gTWF0aC5hdGFuMihvZmZzZXQueCwgb2Zmc2V0LnopO1xuICAgICAgICBzcGhlcmljYWwucGhpID0gc3BoZXJpY2FsVGFyZ2V0LnBoaSA9IE1hdGguYWNvcyhNYXRoLm1pbihNYXRoLm1heChvZmZzZXQueSAvIHNwaGVyaWNhbFRhcmdldC5yYWRpdXMsIC0xKSwgMSkpO1xuICAgICAgICBvYmplY3QubG9va0F0KHRoaXMudGFyZ2V0KTtcbiAgICB9O1xuXG4gICAgLy8gRXZlcnl0aGluZyBiZWxvdyBoZXJlIGp1c3QgdXBkYXRlcyBwYW5EZWx0YSBhbmQgc3BoZXJpY2FsRGVsdGFcbiAgICAvLyBVc2luZyB0aG9zZSB0d28gb2JqZWN0cycgdmFsdWVzLCB0aGUgb3JiaXQgaXMgY2FsY3VsYXRlZFxuXG4gICAgY29uc3Qgcm90YXRlU3RhcnQgPSBuZXcgVmVjMigpO1xuICAgIGNvbnN0IHBhblN0YXJ0ID0gbmV3IFZlYzIoKTtcbiAgICBjb25zdCBkb2xseVN0YXJ0ID0gbmV3IFZlYzIoKTtcblxuICAgIGxldCBzdGF0ZSA9IFNUQVRFLk5PTkU7XG4gICAgdGhpcy5tb3VzZUJ1dHRvbnMgPSB7IE9SQklUOiAwLCBaT09NOiAxLCBQQU46IDIgfTtcblxuICAgIGZ1bmN0aW9uIGdldFpvb21TY2FsZSgpIHtcbiAgICAgICAgcmV0dXJuIE1hdGgucG93KDAuOTUsIHpvb21TcGVlZCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcGFuTGVmdChkaXN0YW5jZSwgbSkge1xuICAgICAgICB0ZW1wVmVjMy5zZXQobVswXSwgbVsxXSwgbVsyXSk7XG4gICAgICAgIHRlbXBWZWMzLm11bHRpcGx5KC1kaXN0YW5jZSk7XG4gICAgICAgIHBhbkRlbHRhLmFkZCh0ZW1wVmVjMyk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcGFuVXAoZGlzdGFuY2UsIG0pIHtcbiAgICAgICAgdGVtcFZlYzMuc2V0KG1bNF0sIG1bNV0sIG1bNl0pO1xuICAgICAgICB0ZW1wVmVjMy5tdWx0aXBseShkaXN0YW5jZSk7XG4gICAgICAgIHBhbkRlbHRhLmFkZCh0ZW1wVmVjMyk7XG4gICAgfVxuXG4gICAgY29uc3QgcGFuID0gKGRlbHRhWCwgZGVsdGFZKSA9PiB7XG4gICAgICAgIGxldCBlbCA9IGVsZW1lbnQgPT09IGRvY3VtZW50ID8gZG9jdW1lbnQuYm9keSA6IGVsZW1lbnQ7XG4gICAgICAgIHRlbXBWZWMzLmNvcHkob2JqZWN0LnBvc2l0aW9uKS5zdWIodGhpcy50YXJnZXQpO1xuICAgICAgICBsZXQgdGFyZ2V0RGlzdGFuY2UgPSB0ZW1wVmVjMy5kaXN0YW5jZSgpO1xuICAgICAgICB0YXJnZXREaXN0YW5jZSAqPSBNYXRoLnRhbigoKChvYmplY3QuZm92IHx8IDQ1KSAvIDIpICogTWF0aC5QSSkgLyAxODAuMCk7XG4gICAgICAgIHBhbkxlZnQoKDIgKiBkZWx0YVggKiB0YXJnZXREaXN0YW5jZSkgLyBlbC5jbGllbnRIZWlnaHQsIG9iamVjdC5tYXRyaXgpO1xuICAgICAgICBwYW5VcCgoMiAqIGRlbHRhWSAqIHRhcmdldERpc3RhbmNlKSAvIGVsLmNsaWVudEhlaWdodCwgb2JqZWN0Lm1hdHJpeCk7XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIGRvbGx5KGRvbGx5U2NhbGUpIHtcbiAgICAgICAgc3BoZXJpY2FsRGVsdGEucmFkaXVzIC89IGRvbGx5U2NhbGU7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaGFuZGxlQXV0b1JvdGF0ZShzcGVlZCkge1xuICAgICAgICBjb25zdCBhbmdsZSA9ICgoMiAqIE1hdGguUEkpIC8gNjAgLyA2MCkgKiBzcGVlZDtcbiAgICAgICAgc3BoZXJpY2FsRGVsdGEudGhldGEgLT0gYW5nbGU7XG4gICAgfVxuXG4gICAgbGV0IGhhbmRsZU1vdmVSb3RhdGUgPSAoeCwgeSkgPT4ge1xuICAgICAgICB0ZW1wVmVjMmEuc2V0KHgsIHkpO1xuICAgICAgICB0ZW1wVmVjMmIuc3ViKHRlbXBWZWMyYSwgcm90YXRlU3RhcnQpLm11bHRpcGx5KHRoaXMucm90YXRlU3BlZWQpO1xuICAgICAgICBsZXQgZWwgPSBlbGVtZW50ID09PSBkb2N1bWVudCA/IGRvY3VtZW50LmJvZHkgOiBlbGVtZW50O1xuICAgICAgICBzcGhlcmljYWxEZWx0YS50aGV0YSAtPSAoMiAqIE1hdGguUEkgKiB0ZW1wVmVjMmIueCkgLyBlbC5jbGllbnRIZWlnaHQ7XG4gICAgICAgIHNwaGVyaWNhbERlbHRhLnBoaSAtPSAoMiAqIE1hdGguUEkgKiB0ZW1wVmVjMmIueSkgLyBlbC5jbGllbnRIZWlnaHQ7XG4gICAgICAgIHJvdGF0ZVN0YXJ0LmNvcHkodGVtcFZlYzJhKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBoYW5kbGVNb3VzZU1vdmVEb2xseShlKSB7XG4gICAgICAgIHRlbXBWZWMyYS5zZXQoZS5jbGllbnRYLCBlLmNsaWVudFkpO1xuICAgICAgICB0ZW1wVmVjMmIuc3ViKHRlbXBWZWMyYSwgZG9sbHlTdGFydCk7XG4gICAgICAgIGlmICh0ZW1wVmVjMmIueSA+IDApIHtcbiAgICAgICAgICAgIGRvbGx5KGdldFpvb21TY2FsZSgpKTtcbiAgICAgICAgfSBlbHNlIGlmICh0ZW1wVmVjMmIueSA8IDApIHtcbiAgICAgICAgICAgIGRvbGx5KDEgLyBnZXRab29tU2NhbGUoKSk7XG4gICAgICAgIH1cbiAgICAgICAgZG9sbHlTdGFydC5jb3B5KHRlbXBWZWMyYSk7XG4gICAgfVxuXG4gICAgbGV0IGhhbmRsZU1vdmVQYW4gPSAoeCwgeSkgPT4ge1xuICAgICAgICB0ZW1wVmVjMmEuc2V0KHgsIHkpO1xuICAgICAgICB0ZW1wVmVjMmIuc3ViKHRlbXBWZWMyYSwgcGFuU3RhcnQpLm11bHRpcGx5KHRoaXMucGFuU3BlZWQpO1xuICAgICAgICBwYW4odGVtcFZlYzJiLngsIHRlbXBWZWMyYi55KTtcbiAgICAgICAgcGFuU3RhcnQuY29weSh0ZW1wVmVjMmEpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGhhbmRsZVRvdWNoU3RhcnREb2xseVBhbihlKSB7XG4gICAgICAgIGlmIChlbmFibGVab29tKSB7XG4gICAgICAgICAgICBsZXQgZHggPSBlLnRvdWNoZXNbMF0ucGFnZVggLSBlLnRvdWNoZXNbMV0ucGFnZVg7XG4gICAgICAgICAgICBsZXQgZHkgPSBlLnRvdWNoZXNbMF0ucGFnZVkgLSBlLnRvdWNoZXNbMV0ucGFnZVk7XG4gICAgICAgICAgICBsZXQgZGlzdGFuY2UgPSBNYXRoLnNxcnQoZHggKiBkeCArIGR5ICogZHkpO1xuICAgICAgICAgICAgZG9sbHlTdGFydC5zZXQoMCwgZGlzdGFuY2UpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGVuYWJsZVBhbikge1xuICAgICAgICAgICAgbGV0IHggPSAwLjUgKiAoZS50b3VjaGVzWzBdLnBhZ2VYICsgZS50b3VjaGVzWzFdLnBhZ2VYKTtcbiAgICAgICAgICAgIGxldCB5ID0gMC41ICogKGUudG91Y2hlc1swXS5wYWdlWSArIGUudG91Y2hlc1sxXS5wYWdlWSk7XG4gICAgICAgICAgICBwYW5TdGFydC5zZXQoeCwgeSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBoYW5kbGVUb3VjaE1vdmVEb2xseVBhbihlKSB7XG4gICAgICAgIGlmIChlbmFibGVab29tKSB7XG4gICAgICAgICAgICBsZXQgZHggPSBlLnRvdWNoZXNbMF0ucGFnZVggLSBlLnRvdWNoZXNbMV0ucGFnZVg7XG4gICAgICAgICAgICBsZXQgZHkgPSBlLnRvdWNoZXNbMF0ucGFnZVkgLSBlLnRvdWNoZXNbMV0ucGFnZVk7XG4gICAgICAgICAgICBsZXQgZGlzdGFuY2UgPSBNYXRoLnNxcnQoZHggKiBkeCArIGR5ICogZHkpO1xuICAgICAgICAgICAgdGVtcFZlYzJhLnNldCgwLCBkaXN0YW5jZSk7XG4gICAgICAgICAgICB0ZW1wVmVjMmIuc2V0KDAsIE1hdGgucG93KHRlbXBWZWMyYS55IC8gZG9sbHlTdGFydC55LCB6b29tU3BlZWQpKTtcbiAgICAgICAgICAgIGRvbGx5KHRlbXBWZWMyYi55KTtcbiAgICAgICAgICAgIGRvbGx5U3RhcnQuY29weSh0ZW1wVmVjMmEpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGVuYWJsZVBhbikge1xuICAgICAgICAgICAgbGV0IHggPSAwLjUgKiAoZS50b3VjaGVzWzBdLnBhZ2VYICsgZS50b3VjaGVzWzFdLnBhZ2VYKTtcbiAgICAgICAgICAgIGxldCB5ID0gMC41ICogKGUudG91Y2hlc1swXS5wYWdlWSArIGUudG91Y2hlc1sxXS5wYWdlWSk7XG4gICAgICAgICAgICBoYW5kbGVNb3ZlUGFuKHgsIHkpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY29uc3Qgb25Nb3VzZURvd24gPSAoZSkgPT4ge1xuICAgICAgICBpZiAoIXRoaXMuZW5hYmxlZCkgcmV0dXJuO1xuXG4gICAgICAgIHN3aXRjaCAoZS5idXR0b24pIHtcbiAgICAgICAgICAgIGNhc2UgdGhpcy5tb3VzZUJ1dHRvbnMuT1JCSVQ6XG4gICAgICAgICAgICAgICAgaWYgKGVuYWJsZVJvdGF0ZSA9PT0gZmFsc2UpIHJldHVybjtcbiAgICAgICAgICAgICAgICByb3RhdGVTdGFydC5zZXQoZS5jbGllbnRYLCBlLmNsaWVudFkpO1xuICAgICAgICAgICAgICAgIHN0YXRlID0gU1RBVEUuUk9UQVRFO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSB0aGlzLm1vdXNlQnV0dG9ucy5aT09NOlxuICAgICAgICAgICAgICAgIGlmIChlbmFibGVab29tID09PSBmYWxzZSkgcmV0dXJuO1xuICAgICAgICAgICAgICAgIGRvbGx5U3RhcnQuc2V0KGUuY2xpZW50WCwgZS5jbGllbnRZKTtcbiAgICAgICAgICAgICAgICBzdGF0ZSA9IFNUQVRFLkRPTExZO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSB0aGlzLm1vdXNlQnV0dG9ucy5QQU46XG4gICAgICAgICAgICAgICAgaWYgKGVuYWJsZVBhbiA9PT0gZmFsc2UpIHJldHVybjtcbiAgICAgICAgICAgICAgICBwYW5TdGFydC5zZXQoZS5jbGllbnRYLCBlLmNsaWVudFkpO1xuICAgICAgICAgICAgICAgIHN0YXRlID0gU1RBVEUuUEFOO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHN0YXRlICE9PSBTVEFURS5OT05FKSB7XG4gICAgICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgb25Nb3VzZU1vdmUsIGZhbHNlKTtcbiAgICAgICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgb25Nb3VzZVVwLCBmYWxzZSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgY29uc3Qgb25Nb3VzZU1vdmUgPSAoZSkgPT4ge1xuICAgICAgICBpZiAoIXRoaXMuZW5hYmxlZCkgcmV0dXJuO1xuXG4gICAgICAgIHN3aXRjaCAoc3RhdGUpIHtcbiAgICAgICAgICAgIGNhc2UgU1RBVEUuUk9UQVRFOlxuICAgICAgICAgICAgICAgIGlmIChlbmFibGVSb3RhdGUgPT09IGZhbHNlKSByZXR1cm47XG4gICAgICAgICAgICAgICAgaGFuZGxlTW92ZVJvdGF0ZShlLmNsaWVudFgsIGUuY2xpZW50WSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFNUQVRFLkRPTExZOlxuICAgICAgICAgICAgICAgIGlmIChlbmFibGVab29tID09PSBmYWxzZSkgcmV0dXJuO1xuICAgICAgICAgICAgICAgIGhhbmRsZU1vdXNlTW92ZURvbGx5KGUpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBTVEFURS5QQU46XG4gICAgICAgICAgICAgICAgaWYgKGVuYWJsZVBhbiA9PT0gZmFsc2UpIHJldHVybjtcbiAgICAgICAgICAgICAgICBoYW5kbGVNb3ZlUGFuKGUuY2xpZW50WCwgZS5jbGllbnRZKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBjb25zdCBvbk1vdXNlVXAgPSAoKSA9PiB7XG4gICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCBvbk1vdXNlTW92ZSwgZmFsc2UpO1xuICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIG9uTW91c2VVcCwgZmFsc2UpO1xuICAgICAgICBzdGF0ZSA9IFNUQVRFLk5PTkU7XG4gICAgfTtcblxuICAgIGNvbnN0IG9uTW91c2VXaGVlbCA9IChlKSA9PiB7XG4gICAgICAgIGlmICghdGhpcy5lbmFibGVkIHx8ICFlbmFibGVab29tIHx8IChzdGF0ZSAhPT0gU1RBVEUuTk9ORSAmJiBzdGF0ZSAhPT0gU1RBVEUuUk9UQVRFKSkgcmV0dXJuO1xuICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgaWYgKGUuZGVsdGFZIDwgMCkge1xuICAgICAgICAgICAgZG9sbHkoMSAvIGdldFpvb21TY2FsZSgpKTtcbiAgICAgICAgfSBlbHNlIGlmIChlLmRlbHRhWSA+IDApIHtcbiAgICAgICAgICAgIGRvbGx5KGdldFpvb21TY2FsZSgpKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBjb25zdCBvblRvdWNoU3RhcnQgPSAoZSkgPT4ge1xuICAgICAgICBpZiAoIXRoaXMuZW5hYmxlZCkgcmV0dXJuO1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgc3dpdGNoIChlLnRvdWNoZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICAgICAgaWYgKGVuYWJsZVJvdGF0ZSA9PT0gZmFsc2UpIHJldHVybjtcbiAgICAgICAgICAgICAgICByb3RhdGVTdGFydC5zZXQoZS50b3VjaGVzWzBdLnBhZ2VYLCBlLnRvdWNoZXNbMF0ucGFnZVkpO1xuICAgICAgICAgICAgICAgIHN0YXRlID0gU1RBVEUuUk9UQVRFO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgICAgIGlmIChlbmFibGVab29tID09PSBmYWxzZSAmJiBlbmFibGVQYW4gPT09IGZhbHNlKSByZXR1cm47XG4gICAgICAgICAgICAgICAgaGFuZGxlVG91Y2hTdGFydERvbGx5UGFuKGUpO1xuICAgICAgICAgICAgICAgIHN0YXRlID0gU1RBVEUuRE9MTFlfUEFOO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICBzdGF0ZSA9IFNUQVRFLk5PTkU7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgY29uc3Qgb25Ub3VjaE1vdmUgPSAoZSkgPT4ge1xuICAgICAgICBpZiAoIXRoaXMuZW5hYmxlZCkgcmV0dXJuO1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG5cbiAgICAgICAgc3dpdGNoIChlLnRvdWNoZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICAgICAgaWYgKGVuYWJsZVJvdGF0ZSA9PT0gZmFsc2UpIHJldHVybjtcbiAgICAgICAgICAgICAgICBoYW5kbGVNb3ZlUm90YXRlKGUudG91Y2hlc1swXS5wYWdlWCwgZS50b3VjaGVzWzBdLnBhZ2VZKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgICAgICBpZiAoZW5hYmxlWm9vbSA9PT0gZmFsc2UgJiYgZW5hYmxlUGFuID09PSBmYWxzZSkgcmV0dXJuO1xuICAgICAgICAgICAgICAgIGhhbmRsZVRvdWNoTW92ZURvbGx5UGFuKGUpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICBzdGF0ZSA9IFNUQVRFLk5PTkU7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgY29uc3Qgb25Ub3VjaEVuZCA9ICgpID0+IHtcbiAgICAgICAgaWYgKCF0aGlzLmVuYWJsZWQpIHJldHVybjtcbiAgICAgICAgc3RhdGUgPSBTVEFURS5OT05FO1xuICAgIH07XG5cbiAgICBjb25zdCBvbkNvbnRleHRNZW51ID0gKGUpID0+IHtcbiAgICAgICAgaWYgKCF0aGlzLmVuYWJsZWQpIHJldHVybjtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBhZGRIYW5kbGVycygpIHtcbiAgICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdjb250ZXh0bWVudScsIG9uQ29udGV4dE1lbnUsIGZhbHNlKTtcbiAgICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCBvbk1vdXNlRG93biwgZmFsc2UpO1xuICAgICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3doZWVsJywgb25Nb3VzZVdoZWVsLCB7IHBhc3NpdmU6IGZhbHNlIH0pO1xuICAgICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCBvblRvdWNoU3RhcnQsIHsgcGFzc2l2ZTogZmFsc2UgfSk7XG4gICAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCBvblRvdWNoRW5kLCBmYWxzZSk7XG4gICAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgb25Ub3VjaE1vdmUsIHsgcGFzc2l2ZTogZmFsc2UgfSk7XG4gICAgfVxuXG4gICAgdGhpcy5yZW1vdmUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignY29udGV4dG1lbnUnLCBvbkNvbnRleHRNZW51KTtcbiAgICAgICAgZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCBvbk1vdXNlRG93bik7XG4gICAgICAgIGVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignd2hlZWwnLCBvbk1vdXNlV2hlZWwpO1xuICAgICAgICBlbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCBvblRvdWNoU3RhcnQpO1xuICAgICAgICBlbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgb25Ub3VjaEVuZCk7XG4gICAgICAgIGVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgb25Ub3VjaE1vdmUpO1xuICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgb25Nb3VzZU1vdmUpO1xuICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIG9uTW91c2VVcCk7XG4gICAgfTtcblxuICAgIGFkZEhhbmRsZXJzKCk7XG59XG4iLCJpbXBvcnQgeyBHZW9tZXRyeSB9IGZyb20gJy4uL2NvcmUvR2VvbWV0cnkuanMnO1xuXG5leHBvcnQgY2xhc3MgUGxhbmUgZXh0ZW5kcyBHZW9tZXRyeSB7XG4gICAgY29uc3RydWN0b3IoZ2wsIHsgd2lkdGggPSAxLCBoZWlnaHQgPSAxLCB3aWR0aFNlZ21lbnRzID0gMSwgaGVpZ2h0U2VnbWVudHMgPSAxLCBhdHRyaWJ1dGVzID0ge30gfSA9IHt9KSB7XG4gICAgICAgIGNvbnN0IHdTZWdzID0gd2lkdGhTZWdtZW50cztcbiAgICAgICAgY29uc3QgaFNlZ3MgPSBoZWlnaHRTZWdtZW50cztcblxuICAgICAgICAvLyBEZXRlcm1pbmUgbGVuZ3RoIG9mIGFycmF5c1xuICAgICAgICBjb25zdCBudW0gPSAod1NlZ3MgKyAxKSAqIChoU2VncyArIDEpO1xuICAgICAgICBjb25zdCBudW1JbmRpY2VzID0gd1NlZ3MgKiBoU2VncyAqIDY7XG5cbiAgICAgICAgLy8gR2VuZXJhdGUgZW1wdHkgYXJyYXlzIG9uY2VcbiAgICAgICAgY29uc3QgcG9zaXRpb24gPSBuZXcgRmxvYXQzMkFycmF5KG51bSAqIDMpO1xuICAgICAgICBjb25zdCBub3JtYWwgPSBuZXcgRmxvYXQzMkFycmF5KG51bSAqIDMpO1xuICAgICAgICBjb25zdCB1diA9IG5ldyBGbG9hdDMyQXJyYXkobnVtICogMik7XG4gICAgICAgIGNvbnN0IGluZGV4ID0gbnVtID4gNjU1MzYgPyBuZXcgVWludDMyQXJyYXkobnVtSW5kaWNlcykgOiBuZXcgVWludDE2QXJyYXkobnVtSW5kaWNlcyk7XG5cbiAgICAgICAgUGxhbmUuYnVpbGRQbGFuZShwb3NpdGlvbiwgbm9ybWFsLCB1diwgaW5kZXgsIHdpZHRoLCBoZWlnaHQsIDAsIHdTZWdzLCBoU2Vncyk7XG5cbiAgICAgICAgT2JqZWN0LmFzc2lnbihhdHRyaWJ1dGVzLCB7XG4gICAgICAgICAgICBwb3NpdGlvbjogeyBzaXplOiAzLCBkYXRhOiBwb3NpdGlvbiB9LFxuICAgICAgICAgICAgbm9ybWFsOiB7IHNpemU6IDMsIGRhdGE6IG5vcm1hbCB9LFxuICAgICAgICAgICAgdXY6IHsgc2l6ZTogMiwgZGF0YTogdXYgfSxcbiAgICAgICAgICAgIGluZGV4OiB7IGRhdGE6IGluZGV4IH0sXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHN1cGVyKGdsLCBhdHRyaWJ1dGVzKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgYnVpbGRQbGFuZShwb3NpdGlvbiwgbm9ybWFsLCB1diwgaW5kZXgsIHdpZHRoLCBoZWlnaHQsIGRlcHRoLCB3U2VncywgaFNlZ3MsIHUgPSAwLCB2ID0gMSwgdyA9IDIsIHVEaXIgPSAxLCB2RGlyID0gLTEsIGkgPSAwLCBpaSA9IDApIHtcbiAgICAgICAgY29uc3QgaW8gPSBpO1xuICAgICAgICBjb25zdCBzZWdXID0gd2lkdGggLyB3U2VncztcbiAgICAgICAgY29uc3Qgc2VnSCA9IGhlaWdodCAvIGhTZWdzO1xuXG4gICAgICAgIGZvciAobGV0IGl5ID0gMDsgaXkgPD0gaFNlZ3M7IGl5KyspIHtcbiAgICAgICAgICAgIGxldCB5ID0gaXkgKiBzZWdIIC0gaGVpZ2h0IC8gMjtcbiAgICAgICAgICAgIGZvciAobGV0IGl4ID0gMDsgaXggPD0gd1NlZ3M7IGl4KyssIGkrKykge1xuICAgICAgICAgICAgICAgIGxldCB4ID0gaXggKiBzZWdXIC0gd2lkdGggLyAyO1xuXG4gICAgICAgICAgICAgICAgcG9zaXRpb25baSAqIDMgKyB1XSA9IHggKiB1RGlyO1xuICAgICAgICAgICAgICAgIHBvc2l0aW9uW2kgKiAzICsgdl0gPSB5ICogdkRpcjtcbiAgICAgICAgICAgICAgICBwb3NpdGlvbltpICogMyArIHddID0gZGVwdGggLyAyO1xuXG4gICAgICAgICAgICAgICAgbm9ybWFsW2kgKiAzICsgdV0gPSAwO1xuICAgICAgICAgICAgICAgIG5vcm1hbFtpICogMyArIHZdID0gMDtcbiAgICAgICAgICAgICAgICBub3JtYWxbaSAqIDMgKyB3XSA9IGRlcHRoID49IDAgPyAxIDogLTE7XG5cbiAgICAgICAgICAgICAgICB1dltpICogMl0gPSBpeCAvIHdTZWdzO1xuICAgICAgICAgICAgICAgIHV2W2kgKiAyICsgMV0gPSAxIC0gaXkgLyBoU2VncztcblxuICAgICAgICAgICAgICAgIGlmIChpeSA9PT0gaFNlZ3MgfHwgaXggPT09IHdTZWdzKSBjb250aW51ZTtcbiAgICAgICAgICAgICAgICBsZXQgYSA9IGlvICsgaXggKyBpeSAqICh3U2VncyArIDEpO1xuICAgICAgICAgICAgICAgIGxldCBiID0gaW8gKyBpeCArIChpeSArIDEpICogKHdTZWdzICsgMSk7XG4gICAgICAgICAgICAgICAgbGV0IGMgPSBpbyArIGl4ICsgKGl5ICsgMSkgKiAod1NlZ3MgKyAxKSArIDE7XG4gICAgICAgICAgICAgICAgbGV0IGQgPSBpbyArIGl4ICsgaXkgKiAod1NlZ3MgKyAxKSArIDE7XG5cbiAgICAgICAgICAgICAgICBpbmRleFtpaSAqIDZdID0gYTtcbiAgICAgICAgICAgICAgICBpbmRleFtpaSAqIDYgKyAxXSA9IGI7XG4gICAgICAgICAgICAgICAgaW5kZXhbaWkgKiA2ICsgMl0gPSBkO1xuICAgICAgICAgICAgICAgIGluZGV4W2lpICogNiArIDNdID0gYjtcbiAgICAgICAgICAgICAgICBpbmRleFtpaSAqIDYgKyA0XSA9IGM7XG4gICAgICAgICAgICAgICAgaW5kZXhbaWkgKiA2ICsgNV0gPSBkO1xuICAgICAgICAgICAgICAgIGlpKys7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCJpbXBvcnQgeyBHZW9tZXRyeSB9IGZyb20gJy4uL2NvcmUvR2VvbWV0cnkuanMnO1xuaW1wb3J0IHsgUHJvZ3JhbSB9IGZyb20gJy4uL2NvcmUvUHJvZ3JhbS5qcyc7XG5pbXBvcnQgeyBNZXNoIH0gZnJvbSAnLi4vY29yZS9NZXNoLmpzJztcbmltcG9ydCB7IFZlYzIgfSBmcm9tICcuLi9tYXRoL1ZlYzIuanMnO1xuaW1wb3J0IHsgVmVjMyB9IGZyb20gJy4uL21hdGgvVmVjMy5qcyc7XG5pbXBvcnQgeyBDb2xvciB9IGZyb20gJy4uL21hdGgvQ29sb3IuanMnO1xuXG5jb25zdCB0bXAgPSBuZXcgVmVjMygpO1xuXG5leHBvcnQgY2xhc3MgUG9seWxpbmUge1xuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICBnbCxcbiAgICAgICAge1xuICAgICAgICAgICAgcG9pbnRzLCAvLyBBcnJheSBvZiBWZWMzc1xuICAgICAgICAgICAgdmVydGV4ID0gZGVmYXVsdFZlcnRleCxcbiAgICAgICAgICAgIGZyYWdtZW50ID0gZGVmYXVsdEZyYWdtZW50LFxuICAgICAgICAgICAgdW5pZm9ybXMgPSB7fSxcbiAgICAgICAgICAgIGF0dHJpYnV0ZXMgPSB7fSwgLy8gRm9yIHBhc3NpbmcgaW4gY3VzdG9tIGF0dHJpYnNcbiAgICAgICAgfVxuICAgICkge1xuICAgICAgICB0aGlzLmdsID0gZ2w7XG4gICAgICAgIHRoaXMucG9pbnRzID0gcG9pbnRzO1xuICAgICAgICB0aGlzLmNvdW50ID0gcG9pbnRzLmxlbmd0aDtcblxuICAgICAgICAvLyBDcmVhdGUgYnVmZmVyc1xuICAgICAgICB0aGlzLnBvc2l0aW9uID0gbmV3IEZsb2F0MzJBcnJheSh0aGlzLmNvdW50ICogMyAqIDIpO1xuICAgICAgICB0aGlzLnByZXYgPSBuZXcgRmxvYXQzMkFycmF5KHRoaXMuY291bnQgKiAzICogMik7XG4gICAgICAgIHRoaXMubmV4dCA9IG5ldyBGbG9hdDMyQXJyYXkodGhpcy5jb3VudCAqIDMgKiAyKTtcbiAgICAgICAgY29uc3Qgc2lkZSA9IG5ldyBGbG9hdDMyQXJyYXkodGhpcy5jb3VudCAqIDEgKiAyKTtcbiAgICAgICAgY29uc3QgdXYgPSBuZXcgRmxvYXQzMkFycmF5KHRoaXMuY291bnQgKiAyICogMik7XG4gICAgICAgIGNvbnN0IGluZGV4ID0gbmV3IFVpbnQxNkFycmF5KCh0aGlzLmNvdW50IC0gMSkgKiAzICogMik7XG5cbiAgICAgICAgLy8gU2V0IHN0YXRpYyBidWZmZXJzXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5jb3VudDsgaSsrKSB7XG4gICAgICAgICAgICBzaWRlLnNldChbLTEsIDFdLCBpICogMik7XG4gICAgICAgICAgICBjb25zdCB2ID0gaSAvICh0aGlzLmNvdW50IC0gMSk7XG4gICAgICAgICAgICB1di5zZXQoWzAsIHYsIDEsIHZdLCBpICogNCk7XG5cbiAgICAgICAgICAgIGlmIChpID09PSB0aGlzLmNvdW50IC0gMSkgY29udGludWU7XG4gICAgICAgICAgICBjb25zdCBpbmQgPSBpICogMjtcbiAgICAgICAgICAgIGluZGV4LnNldChbaW5kICsgMCwgaW5kICsgMSwgaW5kICsgMl0sIChpbmQgKyAwKSAqIDMpO1xuICAgICAgICAgICAgaW5kZXguc2V0KFtpbmQgKyAyLCBpbmQgKyAxLCBpbmQgKyAzXSwgKGluZCArIDEpICogMyk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBnZW9tZXRyeSA9ICh0aGlzLmdlb21ldHJ5ID0gbmV3IEdlb21ldHJ5KFxuICAgICAgICAgICAgZ2wsXG4gICAgICAgICAgICBPYmplY3QuYXNzaWduKGF0dHJpYnV0ZXMsIHtcbiAgICAgICAgICAgICAgICBwb3NpdGlvbjogeyBzaXplOiAzLCBkYXRhOiB0aGlzLnBvc2l0aW9uIH0sXG4gICAgICAgICAgICAgICAgcHJldjogeyBzaXplOiAzLCBkYXRhOiB0aGlzLnByZXYgfSxcbiAgICAgICAgICAgICAgICBuZXh0OiB7IHNpemU6IDMsIGRhdGE6IHRoaXMubmV4dCB9LFxuICAgICAgICAgICAgICAgIHNpZGU6IHsgc2l6ZTogMSwgZGF0YTogc2lkZSB9LFxuICAgICAgICAgICAgICAgIHV2OiB7IHNpemU6IDIsIGRhdGE6IHV2IH0sXG4gICAgICAgICAgICAgICAgaW5kZXg6IHsgc2l6ZTogMSwgZGF0YTogaW5kZXggfSxcbiAgICAgICAgICAgIH0pXG4gICAgICAgICkpO1xuXG4gICAgICAgIC8vIFBvcHVsYXRlIGR5bmFtaWMgYnVmZmVyc1xuICAgICAgICB0aGlzLnVwZGF0ZUdlb21ldHJ5KCk7XG5cbiAgICAgICAgaWYgKCF1bmlmb3Jtcy51UmVzb2x1dGlvbikgdGhpcy5yZXNvbHV0aW9uID0gdW5pZm9ybXMudVJlc29sdXRpb24gPSB7IHZhbHVlOiBuZXcgVmVjMigpIH07XG4gICAgICAgIGlmICghdW5pZm9ybXMudURQUikgdGhpcy5kcHIgPSB1bmlmb3Jtcy51RFBSID0geyB2YWx1ZTogMSB9O1xuICAgICAgICBpZiAoIXVuaWZvcm1zLnVUaGlja25lc3MpIHRoaXMudGhpY2tuZXNzID0gdW5pZm9ybXMudVRoaWNrbmVzcyA9IHsgdmFsdWU6IDEgfTtcbiAgICAgICAgaWYgKCF1bmlmb3Jtcy51Q29sb3IpIHRoaXMuY29sb3IgPSB1bmlmb3Jtcy51Q29sb3IgPSB7IHZhbHVlOiBuZXcgQ29sb3IoJyMwMDAnKSB9O1xuICAgICAgICBpZiAoIXVuaWZvcm1zLnVNaXRlcikgdGhpcy5taXRlciA9IHVuaWZvcm1zLnVNaXRlciA9IHsgdmFsdWU6IDEgfTtcblxuICAgICAgICAvLyBTZXQgc2l6ZSB1bmlmb3JtcycgdmFsdWVzXG4gICAgICAgIHRoaXMucmVzaXplKCk7XG5cbiAgICAgICAgY29uc3QgcHJvZ3JhbSA9ICh0aGlzLnByb2dyYW0gPSBuZXcgUHJvZ3JhbShnbCwge1xuICAgICAgICAgICAgdmVydGV4LFxuICAgICAgICAgICAgZnJhZ21lbnQsXG4gICAgICAgICAgICB1bmlmb3JtcyxcbiAgICAgICAgfSkpO1xuXG4gICAgICAgIHRoaXMubWVzaCA9IG5ldyBNZXNoKGdsLCB7IGdlb21ldHJ5LCBwcm9ncmFtIH0pO1xuICAgIH1cblxuICAgIHVwZGF0ZUdlb21ldHJ5KCkge1xuICAgICAgICB0aGlzLnBvaW50cy5mb3JFYWNoKChwLCBpKSA9PiB7XG4gICAgICAgICAgICBwLnRvQXJyYXkodGhpcy5wb3NpdGlvbiwgaSAqIDMgKiAyKTtcbiAgICAgICAgICAgIHAudG9BcnJheSh0aGlzLnBvc2l0aW9uLCBpICogMyAqIDIgKyAzKTtcblxuICAgICAgICAgICAgaWYgKCFpKSB7XG4gICAgICAgICAgICAgICAgLy8gSWYgZmlyc3QgcG9pbnQsIGNhbGN1bGF0ZSBwcmV2IHVzaW5nIHRoZSBkaXN0YW5jZSB0byAybmQgcG9pbnRcbiAgICAgICAgICAgICAgICB0bXAuY29weShwKVxuICAgICAgICAgICAgICAgICAgICAuc3ViKHRoaXMucG9pbnRzW2kgKyAxXSlcbiAgICAgICAgICAgICAgICAgICAgLmFkZChwKTtcbiAgICAgICAgICAgICAgICB0bXAudG9BcnJheSh0aGlzLnByZXYsIGkgKiAzICogMik7XG4gICAgICAgICAgICAgICAgdG1wLnRvQXJyYXkodGhpcy5wcmV2LCBpICogMyAqIDIgKyAzKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcC50b0FycmF5KHRoaXMubmV4dCwgKGkgLSAxKSAqIDMgKiAyKTtcbiAgICAgICAgICAgICAgICBwLnRvQXJyYXkodGhpcy5uZXh0LCAoaSAtIDEpICogMyAqIDIgKyAzKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGkgPT09IHRoaXMucG9pbnRzLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgICAgICAgICAvLyBJZiBsYXN0IHBvaW50LCBjYWxjdWxhdGUgbmV4dCB1c2luZyBkaXN0YW5jZSB0byAybmQgbGFzdCBwb2ludFxuICAgICAgICAgICAgICAgIHRtcC5jb3B5KHApXG4gICAgICAgICAgICAgICAgICAgIC5zdWIodGhpcy5wb2ludHNbaSAtIDFdKVxuICAgICAgICAgICAgICAgICAgICAuYWRkKHApO1xuICAgICAgICAgICAgICAgIHRtcC50b0FycmF5KHRoaXMubmV4dCwgaSAqIDMgKiAyKTtcbiAgICAgICAgICAgICAgICB0bXAudG9BcnJheSh0aGlzLm5leHQsIGkgKiAzICogMiArIDMpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBwLnRvQXJyYXkodGhpcy5wcmV2LCAoaSArIDEpICogMyAqIDIpO1xuICAgICAgICAgICAgICAgIHAudG9BcnJheSh0aGlzLnByZXYsIChpICsgMSkgKiAzICogMiArIDMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLmdlb21ldHJ5LmF0dHJpYnV0ZXMucG9zaXRpb24ubmVlZHNVcGRhdGUgPSB0cnVlO1xuICAgICAgICB0aGlzLmdlb21ldHJ5LmF0dHJpYnV0ZXMucHJldi5uZWVkc1VwZGF0ZSA9IHRydWU7XG4gICAgICAgIHRoaXMuZ2VvbWV0cnkuYXR0cmlidXRlcy5uZXh0Lm5lZWRzVXBkYXRlID0gdHJ1ZTtcbiAgICB9XG5cbiAgICAvLyBPbmx5IG5lZWQgdG8gY2FsbCBpZiBub3QgaGFuZGxpbmcgcmVzb2x1dGlvbiB1bmlmb3JtcyBtYW51YWxseVxuICAgIHJlc2l6ZSgpIHtcbiAgICAgICAgLy8gVXBkYXRlIGF1dG9tYXRpYyB1bmlmb3JtcyBpZiBub3Qgb3ZlcnJpZGRlblxuICAgICAgICBpZiAodGhpcy5yZXNvbHV0aW9uKSB0aGlzLnJlc29sdXRpb24udmFsdWUuc2V0KHRoaXMuZ2wuY2FudmFzLndpZHRoLCB0aGlzLmdsLmNhbnZhcy5oZWlnaHQpO1xuICAgICAgICBpZiAodGhpcy5kcHIpIHRoaXMuZHByLnZhbHVlID0gdGhpcy5nbC5yZW5kZXJlci5kcHI7XG4gICAgfVxufVxuXG5jb25zdCBkZWZhdWx0VmVydGV4ID0gLyogZ2xzbCAqLyBgXG4gICAgcHJlY2lzaW9uIGhpZ2hwIGZsb2F0O1xuXG4gICAgYXR0cmlidXRlIHZlYzMgcG9zaXRpb247XG4gICAgYXR0cmlidXRlIHZlYzMgbmV4dDtcbiAgICBhdHRyaWJ1dGUgdmVjMyBwcmV2O1xuICAgIGF0dHJpYnV0ZSB2ZWMyIHV2O1xuICAgIGF0dHJpYnV0ZSBmbG9hdCBzaWRlO1xuXG4gICAgdW5pZm9ybSBtYXQ0IG1vZGVsVmlld01hdHJpeDtcbiAgICB1bmlmb3JtIG1hdDQgcHJvamVjdGlvbk1hdHJpeDtcbiAgICB1bmlmb3JtIHZlYzIgdVJlc29sdXRpb247XG4gICAgdW5pZm9ybSBmbG9hdCB1RFBSO1xuICAgIHVuaWZvcm0gZmxvYXQgdVRoaWNrbmVzcztcbiAgICB1bmlmb3JtIGZsb2F0IHVNaXRlcjtcblxuICAgIHZhcnlpbmcgdmVjMiB2VXY7XG5cbiAgICB2ZWM0IGdldFBvc2l0aW9uKCkge1xuICAgICAgICBtYXQ0IG12cCA9IHByb2plY3Rpb25NYXRyaXggKiBtb2RlbFZpZXdNYXRyaXg7XG4gICAgICAgIHZlYzQgY3VycmVudCA9IG12cCAqIHZlYzQocG9zaXRpb24sIDEpO1xuICAgICAgICB2ZWM0IG5leHRQb3MgPSBtdnAgKiB2ZWM0KG5leHQsIDEpO1xuICAgICAgICB2ZWM0IHByZXZQb3MgPSBtdnAgKiB2ZWM0KHByZXYsIDEpO1xuXG4gICAgICAgIHZlYzIgYXNwZWN0ID0gdmVjMih1UmVzb2x1dGlvbi54IC8gdVJlc29sdXRpb24ueSwgMSk7ICAgIFxuICAgICAgICB2ZWMyIGN1cnJlbnRTY3JlZW4gPSBjdXJyZW50Lnh5IC8gY3VycmVudC53ICogYXNwZWN0O1xuICAgICAgICB2ZWMyIG5leHRTY3JlZW4gPSBuZXh0UG9zLnh5IC8gbmV4dFBvcy53ICogYXNwZWN0O1xuICAgICAgICB2ZWMyIHByZXZTY3JlZW4gPSBwcmV2UG9zLnh5IC8gcHJldlBvcy53ICogYXNwZWN0O1xuICAgIFxuICAgICAgICB2ZWMyIGRpcjEgPSBub3JtYWxpemUoY3VycmVudFNjcmVlbiAtIHByZXZTY3JlZW4pO1xuICAgICAgICB2ZWMyIGRpcjIgPSBub3JtYWxpemUobmV4dFNjcmVlbiAtIGN1cnJlbnRTY3JlZW4pO1xuICAgICAgICB2ZWMyIGRpciA9IG5vcm1hbGl6ZShkaXIxICsgZGlyMik7XG4gICAgXG4gICAgICAgIHZlYzIgbm9ybWFsID0gdmVjMigtZGlyLnksIGRpci54KTtcbiAgICAgICAgbm9ybWFsIC89IG1peCgxLjAsIG1heCgwLjMsIGRvdChub3JtYWwsIHZlYzIoLWRpcjEueSwgZGlyMS54KSkpLCB1TWl0ZXIpO1xuICAgICAgICBub3JtYWwgLz0gYXNwZWN0O1xuXG4gICAgICAgIGZsb2F0IHBpeGVsV2lkdGhSYXRpbyA9IDEuMCAvICh1UmVzb2x1dGlvbi55IC8gdURQUik7XG4gICAgICAgIGZsb2F0IHBpeGVsV2lkdGggPSBjdXJyZW50LncgKiBwaXhlbFdpZHRoUmF0aW87XG4gICAgICAgIG5vcm1hbCAqPSBwaXhlbFdpZHRoICogdVRoaWNrbmVzcztcbiAgICAgICAgY3VycmVudC54eSAtPSBub3JtYWwgKiBzaWRlO1xuICAgIFxuICAgICAgICByZXR1cm4gY3VycmVudDtcbiAgICB9XG5cbiAgICB2b2lkIG1haW4oKSB7XG4gICAgICAgIHZVdiA9IHV2O1xuICAgICAgICBnbF9Qb3NpdGlvbiA9IGdldFBvc2l0aW9uKCk7XG4gICAgfVxuYDtcblxuY29uc3QgZGVmYXVsdEZyYWdtZW50ID0gLyogZ2xzbCAqLyBgXG4gICAgcHJlY2lzaW9uIGhpZ2hwIGZsb2F0O1xuXG4gICAgdW5pZm9ybSB2ZWMzIHVDb2xvcjtcbiAgICBcbiAgICB2YXJ5aW5nIHZlYzIgdlV2O1xuXG4gICAgdm9pZCBtYWluKCkge1xuICAgICAgICBnbF9GcmFnQ29sb3IucmdiID0gdUNvbG9yO1xuICAgICAgICBnbF9GcmFnQ29sb3IuYSA9IDEuMDtcbiAgICB9XG5gO1xuIiwiLy8gVE9ETzogRGVzdHJveSByZW5kZXIgdGFyZ2V0cyBpZiBzaXplIGNoYW5nZWQgYW5kIGV4aXN0c1xuXG5pbXBvcnQgeyBQcm9ncmFtIH0gZnJvbSAnLi4vY29yZS9Qcm9ncmFtLmpzJztcbmltcG9ydCB7IE1lc2ggfSBmcm9tICcuLi9jb3JlL01lc2guanMnO1xuaW1wb3J0IHsgUmVuZGVyVGFyZ2V0IH0gZnJvbSAnLi4vY29yZS9SZW5kZXJUYXJnZXQuanMnO1xuaW1wb3J0IHsgVHJpYW5nbGUgfSBmcm9tICcuL1RyaWFuZ2xlLmpzJztcblxuLy8gTm90ZTogVXNlIEN1c3RvbVBvc3QsIG5vdCB0aGlzLlxuZXhwb3J0IGNsYXNzIFBvc3Qge1xuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICBnbCxcbiAgICAgICAge1xuICAgICAgICAgICAgd2lkdGgsXG4gICAgICAgICAgICBoZWlnaHQsXG4gICAgICAgICAgICBkcHIsXG4gICAgICAgICAgICB3cmFwUyA9IGdsLkNMQU1QX1RPX0VER0UsXG4gICAgICAgICAgICB3cmFwVCA9IGdsLkNMQU1QX1RPX0VER0UsXG4gICAgICAgICAgICBtaW5GaWx0ZXIgPSBnbC5MSU5FQVIsXG4gICAgICAgICAgICBtYWdGaWx0ZXIgPSBnbC5MSU5FQVIsXG4gICAgICAgICAgICBnZW9tZXRyeSA9IG5ldyBUcmlhbmdsZShnbCksXG4gICAgICAgICAgICB0YXJnZXRPbmx5ID0gbnVsbCxcbiAgICAgICAgfSA9IHt9LFxuICAgICAgICBmYm8gPSBudWxsLFxuICAgICkge1xuICAgICAgICB0aGlzLmdsID0gZ2w7XG5cbiAgICAgICAgdGhpcy5vcHRpb25zID0geyB3cmFwUywgd3JhcFQsIG1pbkZpbHRlciwgbWFnRmlsdGVyIH07XG5cbiAgICAgICAgdGhpcy5wYXNzZXMgPSBbXTtcblxuICAgICAgICB0aGlzLmdlb21ldHJ5ID0gZ2VvbWV0cnk7XG5cbiAgICAgICAgdGhpcy51bmlmb3JtID0geyB2YWx1ZTogbnVsbCB9O1xuICAgICAgICB0aGlzLnRhcmdldE9ubHkgPSB0YXJnZXRPbmx5O1xuXG4gICAgICAgIHRoaXMuZmJvID0gZmJvIHx8IHtcbiAgICAgICAgICAgIHJlYWQ6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIHdyaXRlOiB1bmRlZmluZWQsXG4gICAgICAgICAgICBzd2FwOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IHRlbXAgPSB0aGlzLmZiby5yZWFkO1xuICAgICAgICAgICAgICAgIHRoaXMuZmJvLnJlYWQgPSB0aGlzLmZiby53cml0ZTtcbiAgICAgICAgICAgICAgICB0aGlzLmZiby53cml0ZSA9IHRlbXA7XG4gICAgICAgICAgICB9LFxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMucmVzaXplKHsgd2lkdGgsIGhlaWdodCwgZHByIH0pO1xuICAgIH1cblxuICAgIGFkZFBhc3MoeyB2ZXJ0ZXggPSBkZWZhdWx0VmVydGV4LCBmcmFnbWVudCA9IGRlZmF1bHRGcmFnbWVudCwgdW5pZm9ybXMgPSB7fSwgdGV4dHVyZVVuaWZvcm0gPSAndE1hcCcsIGVuYWJsZWQgPSB0cnVlIH0gPSB7fSkge1xuICAgICAgICB1bmlmb3Jtc1t0ZXh0dXJlVW5pZm9ybV0gPSB7IHZhbHVlOiB0aGlzLmZiby5yZWFkLnRleHR1cmUgfTtcblxuICAgICAgICBjb25zdCBwcm9ncmFtID0gbmV3IFByb2dyYW0odGhpcy5nbCwgeyB2ZXJ0ZXgsIGZyYWdtZW50LCB1bmlmb3JtcyB9KTtcbiAgICAgICAgY29uc3QgbWVzaCA9IG5ldyBNZXNoKHRoaXMuZ2wsIHsgZ2VvbWV0cnk6IHRoaXMuZ2VvbWV0cnksIHByb2dyYW0gfSk7XG5cbiAgICAgICAgY29uc3QgcGFzcyA9IHtcbiAgICAgICAgICAgIG1lc2gsXG4gICAgICAgICAgICBwcm9ncmFtLFxuICAgICAgICAgICAgdW5pZm9ybXMsXG4gICAgICAgICAgICBlbmFibGVkLFxuICAgICAgICAgICAgdGV4dHVyZVVuaWZvcm0sXG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5wYXNzZXMucHVzaChwYXNzKTtcbiAgICAgICAgcmV0dXJuIHBhc3M7XG4gICAgfVxuXG4gICAgcmVzaXplKHsgd2lkdGgsIGhlaWdodCwgZHByIH0gPSB7fSkge1xuXG4gICAgICAgIGlmIChkcHIpIHRoaXMuZHByID0gZHByO1xuICAgICAgICBpZiAod2lkdGgpIHtcbiAgICAgICAgICAgIHRoaXMud2lkdGggPSB3aWR0aDtcbiAgICAgICAgICAgIHRoaXMuaGVpZ2h0ID0gaGVpZ2h0IHx8IHdpZHRoO1xuICAgICAgICB9XG5cbiAgICAgICAgZHByID0gdGhpcy5kcHIgfHwgdGhpcy5nbC5yZW5kZXJlci5kcHI7XG4gICAgICAgIHdpZHRoID0gKHRoaXMud2lkdGggfHwgdGhpcy5nbC5yZW5kZXJlci53aWR0aCkgKiBkcHI7XG4gICAgICAgIGhlaWdodCA9ICh0aGlzLmhlaWdodCB8fCB0aGlzLmdsLnJlbmRlcmVyLmhlaWdodCkgKiBkcHI7XG5cbiAgICAgICAgdGhpcy5vcHRpb25zLndpZHRoID0gd2lkdGg7XG4gICAgICAgIHRoaXMub3B0aW9ucy5oZWlnaHQgPSBoZWlnaHQ7XG4gICAgICAgIHRoaXMuZGlzcG9zZUZibygpO1xuICAgICAgICB0aGlzLmluaXRGYm8oKTtcbiAgICB9XG5cbiAgICBkaXNwb3NlRmJvKCkge1xuICAgICAgICB0aGlzLmZiby5yZWFkICYmIHRoaXMuZmJvLnJlYWQuZGlzcG9zZSgpO1xuICAgICAgICB0aGlzLmZiby53cml0ZSAmJiB0aGlzLmZiby53cml0ZS5kaXNwb3NlKCk7XG4gICAgICAgIHRoaXMuZmJvLnJlYWQgPSB1bmRlZmluZWQ7XG4gICAgICAgIHRoaXMuZmJvLndyaXRlID0gdW5kZWZpbmVkO1xuICAgIH1cbiAgICBpbml0RmJvKCkge1xuICAgICAgICB0aGlzLmZiby5yZWFkID0gbmV3IFJlbmRlclRhcmdldCh0aGlzLmdsLCB0aGlzLm9wdGlvbnMpO1xuICAgICAgICB0aGlzLmZiby53cml0ZSA9IG5ldyBSZW5kZXJUYXJnZXQodGhpcy5nbCwgdGhpcy5vcHRpb25zKTtcbiAgICB9XG5cbiAgICAvLyBVc2VzIHNhbWUgYXJndW1lbnRzIGFzIHJlbmRlcmVyLnJlbmRlclxuICAgIHJlbmRlcih7IHNjZW5lLCBjYW1lcmEsIHRhcmdldCA9IG51bGwsIHVwZGF0ZSA9IHRydWUsIHNvcnQgPSB0cnVlLCBmcnVzdHVtQ3VsbCA9IHRydWUgfSkge1xuICAgICAgICBjb25zdCBlbmFibGVkUGFzc2VzID0gdGhpcy5wYXNzZXMuZmlsdGVyKChwYXNzKSA9PiBwYXNzLmVuYWJsZWQpO1xuXG4gICAgICAgIHRoaXMuZ2wucmVuZGVyZXIucmVuZGVyKHtcbiAgICAgICAgICAgIHNjZW5lLFxuICAgICAgICAgICAgY2FtZXJhLFxuICAgICAgICAgICAgdGFyZ2V0OiBlbmFibGVkUGFzc2VzLmxlbmd0aCB8fCAoIXRhcmdldCAmJiB0aGlzLnRhcmdldE9ubHkpID8gdGhpcy5mYm8ud3JpdGUgOiB0YXJnZXQsXG4gICAgICAgICAgICB1cGRhdGUsXG4gICAgICAgICAgICBzb3J0LFxuICAgICAgICAgICAgZnJ1c3R1bUN1bGwsXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmZiby5zd2FwKCk7XG5cbiAgICAgICAgZW5hYmxlZFBhc3Nlcy5mb3JFYWNoKChwYXNzLCBpKSA9PiB7XG4gICAgICAgICAgICBwYXNzLm1lc2gucHJvZ3JhbS51bmlmb3Jtc1twYXNzLnRleHR1cmVVbmlmb3JtXS52YWx1ZSA9IHRoaXMuZmJvLnJlYWQudGV4dHVyZTtcbiAgICAgICAgICAgIHRoaXMuZ2wucmVuZGVyZXIucmVuZGVyKHtcbiAgICAgICAgICAgICAgICBzY2VuZTogcGFzcy5tZXNoLFxuICAgICAgICAgICAgICAgIHRhcmdldDogaSA9PT0gZW5hYmxlZFBhc3Nlcy5sZW5ndGggLSAxICYmICh0YXJnZXQgfHwgIXRoaXMudGFyZ2V0T25seSkgPyB0YXJnZXQgOiB0aGlzLmZiby53cml0ZSxcbiAgICAgICAgICAgICAgICBjbGVhcjogdHJ1ZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy5mYm8uc3dhcCgpO1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLnVuaWZvcm0udmFsdWUgPSB0aGlzLmZiby5yZWFkLnRleHR1cmU7XG4gICAgfVxufVxuXG5jb25zdCBkZWZhdWx0VmVydGV4ID0gLyogZ2xzbCAqLyBgXG4gICAgYXR0cmlidXRlIHZlYzIgdXY7XG4gICAgYXR0cmlidXRlIHZlYzIgcG9zaXRpb247XG5cbiAgICB2YXJ5aW5nIHZlYzIgdlV2O1xuXG4gICAgdm9pZCBtYWluKCkge1xuICAgICAgICB2VXYgPSB1djtcbiAgICAgICAgZ2xfUG9zaXRpb24gPSB2ZWM0KHBvc2l0aW9uLCAwLCAxKTtcbiAgICB9XG5gO1xuXG5jb25zdCBkZWZhdWx0RnJhZ21lbnQgPSAvKiBnbHNsICovIGBcbiAgICBwcmVjaXNpb24gaGlnaHAgZmxvYXQ7XG5cbiAgICB1bmlmb3JtIHNhbXBsZXIyRCB0TWFwO1xuICAgIHZhcnlpbmcgdmVjMiB2VXY7XG5cbiAgICB2b2lkIG1haW4oKSB7XG4gICAgICAgIGdsX0ZyYWdDb2xvciA9IHRleHR1cmUyRCh0TWFwLCB2VXYpO1xuICAgIH1cbmA7XG4iLCIvLyBUT0RPOiBiYXJ5Y2VudHJpYyBjb2RlIHNob3VsZG4ndCBiZSBoZXJlLCBidXQgd2hlcmU/XG4vLyBUT0RPOiBTcGhlcmVDYXN0P1xuXG5pbXBvcnQgeyBWZWMyIH0gZnJvbSAnLi4vbWF0aC9WZWMyLmpzJztcbmltcG9ydCB7IFZlYzMgfSBmcm9tICcuLi9tYXRoL1ZlYzMuanMnO1xuaW1wb3J0IHsgTWF0NCB9IGZyb20gJy4uL21hdGgvTWF0NC5qcyc7XG5cbmNvbnN0IHRlbXBWZWMyYSA9IG5ldyBWZWMyKCk7XG5jb25zdCB0ZW1wVmVjMmIgPSBuZXcgVmVjMigpO1xuY29uc3QgdGVtcFZlYzJjID0gbmV3IFZlYzIoKTtcblxuY29uc3QgdGVtcFZlYzNhID0gbmV3IFZlYzMoKTtcbmNvbnN0IHRlbXBWZWMzYiA9IG5ldyBWZWMzKCk7XG5jb25zdCB0ZW1wVmVjM2MgPSBuZXcgVmVjMygpO1xuY29uc3QgdGVtcFZlYzNkID0gbmV3IFZlYzMoKTtcbmNvbnN0IHRlbXBWZWMzZSA9IG5ldyBWZWMzKCk7XG5jb25zdCB0ZW1wVmVjM2YgPSBuZXcgVmVjMygpO1xuY29uc3QgdGVtcFZlYzNnID0gbmV3IFZlYzMoKTtcbmNvbnN0IHRlbXBWZWMzaCA9IG5ldyBWZWMzKCk7XG5jb25zdCB0ZW1wVmVjM2kgPSBuZXcgVmVjMygpO1xuY29uc3QgdGVtcFZlYzNqID0gbmV3IFZlYzMoKTtcbmNvbnN0IHRlbXBWZWMzayA9IG5ldyBWZWMzKCk7XG5cbmNvbnN0IHRlbXBNYXQ0ID0gbmV3IE1hdDQoKTtcblxuZXhwb3J0IGNsYXNzIFJheWNhc3Qge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLm9yaWdpbiA9IG5ldyBWZWMzKCk7XG4gICAgICAgIHRoaXMuZGlyZWN0aW9uID0gbmV3IFZlYzMoKTtcbiAgICB9XG5cbiAgICAvLyBTZXQgcmF5IGZyb20gbW91c2UgdW5wcm9qZWN0aW9uXG4gICAgY2FzdE1vdXNlKGNhbWVyYSwgbW91c2UgPSBbMCwgMF0pIHtcbiAgICAgICAgaWYgKGNhbWVyYS50eXBlID09PSAnb3J0aG9ncmFwaGljJykge1xuICAgICAgICAgICAgLy8gU2V0IG9yaWdpblxuICAgICAgICAgICAgLy8gU2luY2UgY2FtZXJhIGlzIG9ydGhvZ3JhcGhpYywgb3JpZ2luIGlzIG5vdCB0aGUgY2FtZXJhIHBvc2l0aW9uXG4gICAgICAgICAgICBjb25zdCB7IGxlZnQsIHJpZ2h0LCBib3R0b20sIHRvcCwgem9vbSB9ID0gY2FtZXJhO1xuICAgICAgICAgICAgY29uc3QgeCA9IGxlZnQgLyB6b29tICsgKChyaWdodCAtIGxlZnQpIC8gem9vbSkgKiAobW91c2VbMF0gKiAwLjUgKyAwLjUpO1xuICAgICAgICAgICAgY29uc3QgeSA9IGJvdHRvbSAvIHpvb20gKyAoKHRvcCAtIGJvdHRvbSkgLyB6b29tKSAqIChtb3VzZVsxXSAqIDAuNSArIDAuNSk7XG4gICAgICAgICAgICB0aGlzLm9yaWdpbi5zZXQoeCwgeSwgMCk7XG4gICAgICAgICAgICB0aGlzLm9yaWdpbi5hcHBseU1hdHJpeDQoY2FtZXJhLndvcmxkTWF0cml4KTtcblxuICAgICAgICAgICAgLy8gU2V0IGRpcmVjdGlvblxuICAgICAgICAgICAgLy8gaHR0cHM6Ly9jb21tdW5pdHkua2hyb25vcy5vcmcvdC9nZXQtZGlyZWN0aW9uLWZyb20tdHJhbnNmb3JtYXRpb24tbWF0cml4LW9yLXF1YXQvNjU1MDIvMlxuICAgICAgICAgICAgdGhpcy5kaXJlY3Rpb24ueCA9IC1jYW1lcmEud29ybGRNYXRyaXhbOF07XG4gICAgICAgICAgICB0aGlzLmRpcmVjdGlvbi55ID0gLWNhbWVyYS53b3JsZE1hdHJpeFs5XTtcbiAgICAgICAgICAgIHRoaXMuZGlyZWN0aW9uLnogPSAtY2FtZXJhLndvcmxkTWF0cml4WzEwXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIFNldCBvcmlnaW5cbiAgICAgICAgICAgIGNhbWVyYS53b3JsZE1hdHJpeC5nZXRUcmFuc2xhdGlvbih0aGlzLm9yaWdpbik7XG5cbiAgICAgICAgICAgIC8vIFNldCBkaXJlY3Rpb25cbiAgICAgICAgICAgIHRoaXMuZGlyZWN0aW9uLnNldChtb3VzZVswXSwgbW91c2VbMV0sIDAuNSk7XG4gICAgICAgICAgICBjYW1lcmEudW5wcm9qZWN0KHRoaXMuZGlyZWN0aW9uKTtcbiAgICAgICAgICAgIHRoaXMuZGlyZWN0aW9uLnN1Yih0aGlzLm9yaWdpbikubm9ybWFsaXplKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpbnRlcnNlY3RCb3VuZHMobWVzaGVzLCB7IG1heERpc3RhbmNlLCBvdXRwdXQgPSBbXSB9ID0ge30pIHtcbiAgICAgICAgaWYgKCFBcnJheS5pc0FycmF5KG1lc2hlcykpIG1lc2hlcyA9IFttZXNoZXNdO1xuXG4gICAgICAgIGNvbnN0IGludldvcmxkTWF0NCA9IHRlbXBNYXQ0O1xuICAgICAgICBjb25zdCBvcmlnaW4gPSB0ZW1wVmVjM2E7XG4gICAgICAgIGNvbnN0IGRpcmVjdGlvbiA9IHRlbXBWZWMzYjtcblxuICAgICAgICBjb25zdCBoaXRzID0gb3V0cHV0O1xuICAgICAgICBoaXRzLmxlbmd0aCA9IDA7XG5cbiAgICAgICAgbWVzaGVzLmZvckVhY2goKG1lc2gpID0+IHtcbiAgICAgICAgICAgIC8vIENyZWF0ZSBib3VuZHNcbiAgICAgICAgICAgIGlmICghbWVzaC5nZW9tZXRyeS5ib3VuZHMgfHwgbWVzaC5nZW9tZXRyeS5ib3VuZHMucmFkaXVzID09PSBJbmZpbml0eSkgbWVzaC5nZW9tZXRyeS5jb21wdXRlQm91bmRpbmdTcGhlcmUoKTtcbiAgICAgICAgICAgIGNvbnN0IGJvdW5kcyA9IG1lc2guZ2VvbWV0cnkuYm91bmRzO1xuICAgICAgICAgICAgaW52V29ybGRNYXQ0LmludmVyc2UobWVzaC53b3JsZE1hdHJpeCk7XG5cbiAgICAgICAgICAgIC8vIEdldCBtYXggZGlzdGFuY2UgbG9jYWxseVxuICAgICAgICAgICAgbGV0IGxvY2FsTWF4RGlzdGFuY2U7XG4gICAgICAgICAgICBpZiAobWF4RGlzdGFuY2UpIHtcbiAgICAgICAgICAgICAgICBkaXJlY3Rpb24uY29weSh0aGlzLmRpcmVjdGlvbikuc2NhbGVSb3RhdGVNYXRyaXg0KGludldvcmxkTWF0NCk7XG4gICAgICAgICAgICAgICAgbG9jYWxNYXhEaXN0YW5jZSA9IG1heERpc3RhbmNlICogZGlyZWN0aW9uLmxlbigpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBUYWtlIHdvcmxkIHNwYWNlIHJheSBhbmQgbWFrZSBpdCBvYmplY3Qgc3BhY2UgdG8gYWxpZ24gd2l0aCBib3VuZGluZyBib3hcbiAgICAgICAgICAgIG9yaWdpbi5jb3B5KHRoaXMub3JpZ2luKS5hcHBseU1hdHJpeDQoaW52V29ybGRNYXQ0KTtcbiAgICAgICAgICAgIGRpcmVjdGlvbi5jb3B5KHRoaXMuZGlyZWN0aW9uKS50cmFuc2Zvcm1EaXJlY3Rpb24oaW52V29ybGRNYXQ0KTtcblxuICAgICAgICAgICAgLy8gQnJlYWsgb3V0IGVhcmx5IGlmIGJvdW5kcyB0b28gZmFyIGF3YXkgZnJvbSBvcmlnaW5cbiAgICAgICAgICAgIGlmIChtYXhEaXN0YW5jZSkge1xuICAgICAgICAgICAgICAgIGlmIChvcmlnaW4uZGlzdGFuY2UoYm91bmRzLmNlbnRlcikgLSBib3VuZHMucmFkaXVzID4gbG9jYWxNYXhEaXN0YW5jZSkgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBsZXQgbG9jYWxEaXN0YW5jZSA9IDA7XG5cbiAgICAgICAgICAgIC8vIENoZWNrIG9yaWdpbiBpc24ndCBpbnNpZGUgYm91bmRzIGJlZm9yZSB0ZXN0aW5nIGludGVyc2VjdGlvblxuICAgICAgICAgICAgaWYgKG1lc2guZ2VvbWV0cnkucmF5Y2FzdCA9PT0gJ3NwaGVyZScpIHtcbiAgICAgICAgICAgICAgICBpZiAob3JpZ2luLmRpc3RhbmNlKGJvdW5kcy5jZW50ZXIpID4gYm91bmRzLnJhZGl1cykge1xuICAgICAgICAgICAgICAgICAgICBsb2NhbERpc3RhbmNlID0gdGhpcy5pbnRlcnNlY3RTcGhlcmUoYm91bmRzLCBvcmlnaW4sIGRpcmVjdGlvbik7XG4gICAgICAgICAgICAgICAgICAgIGlmICghbG9jYWxEaXN0YW5jZSkgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgICBvcmlnaW4ueCA8IGJvdW5kcy5taW4ueCB8fFxuICAgICAgICAgICAgICAgICAgICBvcmlnaW4ueCA+IGJvdW5kcy5tYXgueCB8fFxuICAgICAgICAgICAgICAgICAgICBvcmlnaW4ueSA8IGJvdW5kcy5taW4ueSB8fFxuICAgICAgICAgICAgICAgICAgICBvcmlnaW4ueSA+IGJvdW5kcy5tYXgueSB8fFxuICAgICAgICAgICAgICAgICAgICBvcmlnaW4ueiA8IGJvdW5kcy5taW4ueiB8fFxuICAgICAgICAgICAgICAgICAgICBvcmlnaW4ueiA+IGJvdW5kcy5tYXguelxuICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICBsb2NhbERpc3RhbmNlID0gdGhpcy5pbnRlcnNlY3RCb3goYm91bmRzLCBvcmlnaW4sIGRpcmVjdGlvbik7XG4gICAgICAgICAgICAgICAgICAgIGlmICghbG9jYWxEaXN0YW5jZSkgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKG1heERpc3RhbmNlICYmIGxvY2FsRGlzdGFuY2UgPiBsb2NhbE1heERpc3RhbmNlKSByZXR1cm47XG5cbiAgICAgICAgICAgIC8vIENyZWF0ZSBvYmplY3Qgb24gbWVzaCB0byBhdm9pZCBnZW5lcmF0aW5nIGxvdHMgb2Ygb2JqZWN0c1xuICAgICAgICAgICAgaWYgKCFtZXNoLmhpdCkgbWVzaC5oaXQgPSB7IGxvY2FsUG9pbnQ6IG5ldyBWZWMzKCksIHBvaW50OiBuZXcgVmVjMygpIH07XG5cbiAgICAgICAgICAgIG1lc2guaGl0LmxvY2FsUG9pbnQuY29weShkaXJlY3Rpb24pLm11bHRpcGx5KGxvY2FsRGlzdGFuY2UpLmFkZChvcmlnaW4pO1xuICAgICAgICAgICAgbWVzaC5oaXQucG9pbnQuY29weShtZXNoLmhpdC5sb2NhbFBvaW50KS5hcHBseU1hdHJpeDQobWVzaC53b3JsZE1hdHJpeCk7XG4gICAgICAgICAgICBtZXNoLmhpdC5kaXN0YW5jZSA9IG1lc2guaGl0LnBvaW50LmRpc3RhbmNlKHRoaXMub3JpZ2luKTtcblxuICAgICAgICAgICAgaGl0cy5wdXNoKG1lc2gpO1xuICAgICAgICB9KTtcblxuICAgICAgICBoaXRzLnNvcnQoKGEsIGIpID0+IGEuaGl0LmRpc3RhbmNlIC0gYi5oaXQuZGlzdGFuY2UpO1xuICAgICAgICByZXR1cm4gaGl0cztcbiAgICB9XG5cbiAgICBpbnRlcnNlY3RNZXNoZXMobWVzaGVzLCB7IGN1bGxGYWNlID0gdHJ1ZSwgbWF4RGlzdGFuY2UsIGluY2x1ZGVVViA9IHRydWUsIGluY2x1ZGVOb3JtYWwgPSB0cnVlLCBvdXRwdXQgPSBbXSB9ID0ge30pIHtcbiAgICAgICAgLy8gVGVzdCBib3VuZHMgZmlyc3QgYmVmb3JlIHRlc3RpbmcgZ2VvbWV0cnlcbiAgICAgICAgY29uc3QgaGl0cyA9IHRoaXMuaW50ZXJzZWN0Qm91bmRzKG1lc2hlcywgeyBtYXhEaXN0YW5jZSwgb3V0cHV0IH0pO1xuICAgICAgICBpZiAoIWhpdHMubGVuZ3RoKSByZXR1cm4gaGl0cztcblxuICAgICAgICBjb25zdCBpbnZXb3JsZE1hdDQgPSB0ZW1wTWF0NDtcbiAgICAgICAgY29uc3Qgb3JpZ2luID0gdGVtcFZlYzNhO1xuICAgICAgICBjb25zdCBkaXJlY3Rpb24gPSB0ZW1wVmVjM2I7XG4gICAgICAgIGNvbnN0IGEgPSB0ZW1wVmVjM2M7XG4gICAgICAgIGNvbnN0IGIgPSB0ZW1wVmVjM2Q7XG4gICAgICAgIGNvbnN0IGMgPSB0ZW1wVmVjM2U7XG4gICAgICAgIGNvbnN0IGNsb3Nlc3RGYWNlTm9ybWFsID0gdGVtcFZlYzNmO1xuICAgICAgICBjb25zdCBmYWNlTm9ybWFsID0gdGVtcFZlYzNnO1xuICAgICAgICBjb25zdCBiYXJ5Y29vcmQgPSB0ZW1wVmVjM2g7XG4gICAgICAgIGNvbnN0IHV2QSA9IHRlbXBWZWMyYTtcbiAgICAgICAgY29uc3QgdXZCID0gdGVtcFZlYzJiO1xuICAgICAgICBjb25zdCB1dkMgPSB0ZW1wVmVjMmM7XG5cbiAgICAgICAgZm9yIChsZXQgaSA9IGhpdHMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgICAgIGNvbnN0IG1lc2ggPSBoaXRzW2ldO1xuICAgICAgICAgICAgaW52V29ybGRNYXQ0LmludmVyc2UobWVzaC53b3JsZE1hdHJpeCk7XG5cbiAgICAgICAgICAgIC8vIEdldCBtYXggZGlzdGFuY2UgbG9jYWxseVxuICAgICAgICAgICAgbGV0IGxvY2FsTWF4RGlzdGFuY2U7XG4gICAgICAgICAgICBpZiAobWF4RGlzdGFuY2UpIHtcbiAgICAgICAgICAgICAgICBkaXJlY3Rpb24uY29weSh0aGlzLmRpcmVjdGlvbikuc2NhbGVSb3RhdGVNYXRyaXg0KGludldvcmxkTWF0NCk7XG4gICAgICAgICAgICAgICAgbG9jYWxNYXhEaXN0YW5jZSA9IG1heERpc3RhbmNlICogZGlyZWN0aW9uLmxlbigpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBUYWtlIHdvcmxkIHNwYWNlIHJheSBhbmQgbWFrZSBpdCBvYmplY3Qgc3BhY2UgdG8gYWxpZ24gd2l0aCBib3VuZGluZyBib3hcbiAgICAgICAgICAgIG9yaWdpbi5jb3B5KHRoaXMub3JpZ2luKS5hcHBseU1hdHJpeDQoaW52V29ybGRNYXQ0KTtcbiAgICAgICAgICAgIGRpcmVjdGlvbi5jb3B5KHRoaXMuZGlyZWN0aW9uKS50cmFuc2Zvcm1EaXJlY3Rpb24oaW52V29ybGRNYXQ0KTtcblxuICAgICAgICAgICAgbGV0IGxvY2FsRGlzdGFuY2UgPSAwO1xuICAgICAgICAgICAgbGV0IGNsb3Nlc3RBLCBjbG9zZXN0QiwgY2xvc2VzdEM7XG5cbiAgICAgICAgICAgIGNvbnN0IGdlb21ldHJ5ID0gbWVzaC5nZW9tZXRyeTtcbiAgICAgICAgICAgIGNvbnN0IGF0dHJpYnV0ZXMgPSBnZW9tZXRyeS5hdHRyaWJ1dGVzO1xuICAgICAgICAgICAgY29uc3QgaW5kZXggPSBhdHRyaWJ1dGVzLmluZGV4O1xuXG4gICAgICAgICAgICBjb25zdCBzdGFydCA9IE1hdGgubWF4KDAsIGdlb21ldHJ5LmRyYXdSYW5nZS5zdGFydCk7XG4gICAgICAgICAgICBjb25zdCBlbmQgPSBNYXRoLm1pbihpbmRleCA/IGluZGV4LmNvdW50IDogYXR0cmlidXRlcy5wb3NpdGlvbi5jb3VudCwgZ2VvbWV0cnkuZHJhd1JhbmdlLnN0YXJ0ICsgZ2VvbWV0cnkuZHJhd1JhbmdlLmNvdW50KTtcblxuICAgICAgICAgICAgZm9yIChsZXQgaiA9IHN0YXJ0OyBqIDwgZW5kOyBqICs9IDMpIHtcbiAgICAgICAgICAgICAgICAvLyBQb3NpdGlvbiBhdHRyaWJ1dGUgaW5kaWNlcyBmb3IgZWFjaCB0cmlhbmdsZVxuICAgICAgICAgICAgICAgIGNvbnN0IGFpID0gaW5kZXggPyBpbmRleC5kYXRhW2pdIDogajtcbiAgICAgICAgICAgICAgICBjb25zdCBiaSA9IGluZGV4ID8gaW5kZXguZGF0YVtqICsgMV0gOiBqICsgMTtcbiAgICAgICAgICAgICAgICBjb25zdCBjaSA9IGluZGV4ID8gaW5kZXguZGF0YVtqICsgMl0gOiBqICsgMjtcblxuICAgICAgICAgICAgICAgIGEuZnJvbUFycmF5KGF0dHJpYnV0ZXMucG9zaXRpb24uZGF0YSwgYWkgKiAzKTtcbiAgICAgICAgICAgICAgICBiLmZyb21BcnJheShhdHRyaWJ1dGVzLnBvc2l0aW9uLmRhdGEsIGJpICogMyk7XG4gICAgICAgICAgICAgICAgYy5mcm9tQXJyYXkoYXR0cmlidXRlcy5wb3NpdGlvbi5kYXRhLCBjaSAqIDMpO1xuXG4gICAgICAgICAgICAgICAgY29uc3QgZGlzdGFuY2UgPSB0aGlzLmludGVyc2VjdFRyaWFuZ2xlKGEsIGIsIGMsIGN1bGxGYWNlLCBvcmlnaW4sIGRpcmVjdGlvbiwgZmFjZU5vcm1hbCk7XG4gICAgICAgICAgICAgICAgaWYgKCFkaXN0YW5jZSkgY29udGludWU7XG5cbiAgICAgICAgICAgICAgICAvLyBUb28gZmFyIGF3YXlcbiAgICAgICAgICAgICAgICBpZiAobWF4RGlzdGFuY2UgJiYgZGlzdGFuY2UgPiBsb2NhbE1heERpc3RhbmNlKSBjb250aW51ZTtcblxuICAgICAgICAgICAgICAgIGlmICghbG9jYWxEaXN0YW5jZSB8fCBkaXN0YW5jZSA8IGxvY2FsRGlzdGFuY2UpIHtcbiAgICAgICAgICAgICAgICAgICAgbG9jYWxEaXN0YW5jZSA9IGRpc3RhbmNlO1xuICAgICAgICAgICAgICAgICAgICBjbG9zZXN0QSA9IGFpO1xuICAgICAgICAgICAgICAgICAgICBjbG9zZXN0QiA9IGJpO1xuICAgICAgICAgICAgICAgICAgICBjbG9zZXN0QyA9IGNpO1xuICAgICAgICAgICAgICAgICAgICBjbG9zZXN0RmFjZU5vcm1hbC5jb3B5KGZhY2VOb3JtYWwpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCFsb2NhbERpc3RhbmNlKSBoaXRzLnNwbGljZShpLCAxKTtcblxuICAgICAgICAgICAgLy8gVXBkYXRlIGhpdCB2YWx1ZXMgZnJvbSBib3VuZHMtdGVzdFxuICAgICAgICAgICAgbWVzaC5oaXQubG9jYWxQb2ludC5jb3B5KGRpcmVjdGlvbikubXVsdGlwbHkobG9jYWxEaXN0YW5jZSkuYWRkKG9yaWdpbik7XG4gICAgICAgICAgICBtZXNoLmhpdC5wb2ludC5jb3B5KG1lc2guaGl0LmxvY2FsUG9pbnQpLmFwcGx5TWF0cml4NChtZXNoLndvcmxkTWF0cml4KTtcbiAgICAgICAgICAgIG1lc2guaGl0LmRpc3RhbmNlID0gbWVzaC5oaXQucG9pbnQuZGlzdGFuY2UodGhpcy5vcmlnaW4pO1xuXG4gICAgICAgICAgICAvLyBBZGQgdW5pcXVlIGhpdCBvYmplY3RzIG9uIG1lc2ggdG8gYXZvaWQgZ2VuZXJhdGluZyBsb3RzIG9mIG9iamVjdHNcbiAgICAgICAgICAgIGlmICghbWVzaC5oaXQuZmFjZU5vcm1hbCkge1xuICAgICAgICAgICAgICAgIG1lc2guaGl0LmxvY2FsRmFjZU5vcm1hbCA9IG5ldyBWZWMzKCk7XG4gICAgICAgICAgICAgICAgbWVzaC5oaXQuZmFjZU5vcm1hbCA9IG5ldyBWZWMzKCk7XG4gICAgICAgICAgICAgICAgbWVzaC5oaXQudXYgPSBuZXcgVmVjMigpO1xuICAgICAgICAgICAgICAgIG1lc2guaGl0LmxvY2FsTm9ybWFsID0gbmV3IFZlYzMoKTtcbiAgICAgICAgICAgICAgICBtZXNoLmhpdC5ub3JtYWwgPSBuZXcgVmVjMygpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBBZGQgZmFjZSBub3JtYWwgZGF0YSB3aGljaCBpcyBhbHJlYWR5IGNvbXB1dGVkXG4gICAgICAgICAgICBtZXNoLmhpdC5sb2NhbEZhY2VOb3JtYWwuY29weShjbG9zZXN0RmFjZU5vcm1hbCk7XG4gICAgICAgICAgICBtZXNoLmhpdC5mYWNlTm9ybWFsLmNvcHkobWVzaC5oaXQubG9jYWxGYWNlTm9ybWFsKS50cmFuc2Zvcm1EaXJlY3Rpb24obWVzaC53b3JsZE1hdHJpeCk7XG5cbiAgICAgICAgICAgIC8vIE9wdGlvbmFsIGRhdGEsIG9wdCBvdXQgdG8gb3B0aW1pc2UgYSBiaXQgaWYgbmVjZXNzYXJ5XG4gICAgICAgICAgICBpZiAoaW5jbHVkZVVWIHx8IGluY2x1ZGVOb3JtYWwpIHtcbiAgICAgICAgICAgICAgICAvLyBDYWxjdWxhdGUgYmFyeWNvb3JkcyB0byBmaW5kIHV2IHZhbHVlcyBhdCBoaXQgcG9pbnRcbiAgICAgICAgICAgICAgICBhLmZyb21BcnJheShhdHRyaWJ1dGVzLnBvc2l0aW9uLmRhdGEsIGNsb3Nlc3RBICogMyk7XG4gICAgICAgICAgICAgICAgYi5mcm9tQXJyYXkoYXR0cmlidXRlcy5wb3NpdGlvbi5kYXRhLCBjbG9zZXN0QiAqIDMpO1xuICAgICAgICAgICAgICAgIGMuZnJvbUFycmF5KGF0dHJpYnV0ZXMucG9zaXRpb24uZGF0YSwgY2xvc2VzdEMgKiAzKTtcbiAgICAgICAgICAgICAgICB0aGlzLmdldEJhcnljb29yZChtZXNoLmhpdC5sb2NhbFBvaW50LCBhLCBiLCBjLCBiYXJ5Y29vcmQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoaW5jbHVkZVVWICYmIGF0dHJpYnV0ZXMudXYpIHtcbiAgICAgICAgICAgICAgICB1dkEuZnJvbUFycmF5KGF0dHJpYnV0ZXMudXYuZGF0YSwgY2xvc2VzdEEgKiAyKTtcbiAgICAgICAgICAgICAgICB1dkIuZnJvbUFycmF5KGF0dHJpYnV0ZXMudXYuZGF0YSwgY2xvc2VzdEIgKiAyKTtcbiAgICAgICAgICAgICAgICB1dkMuZnJvbUFycmF5KGF0dHJpYnV0ZXMudXYuZGF0YSwgY2xvc2VzdEMgKiAyKTtcbiAgICAgICAgICAgICAgICBtZXNoLmhpdC51di5zZXQoXG4gICAgICAgICAgICAgICAgICAgIHV2QS54ICogYmFyeWNvb3JkLnggKyB1dkIueCAqIGJhcnljb29yZC55ICsgdXZDLnggKiBiYXJ5Y29vcmQueixcbiAgICAgICAgICAgICAgICAgICAgdXZBLnkgKiBiYXJ5Y29vcmQueCArIHV2Qi55ICogYmFyeWNvb3JkLnkgKyB1dkMueSAqIGJhcnljb29yZC56XG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGluY2x1ZGVOb3JtYWwgJiYgYXR0cmlidXRlcy5ub3JtYWwpIHtcbiAgICAgICAgICAgICAgICBhLmZyb21BcnJheShhdHRyaWJ1dGVzLm5vcm1hbC5kYXRhLCBjbG9zZXN0QSAqIDMpO1xuICAgICAgICAgICAgICAgIGIuZnJvbUFycmF5KGF0dHJpYnV0ZXMubm9ybWFsLmRhdGEsIGNsb3Nlc3RCICogMyk7XG4gICAgICAgICAgICAgICAgYy5mcm9tQXJyYXkoYXR0cmlidXRlcy5ub3JtYWwuZGF0YSwgY2xvc2VzdEMgKiAzKTtcbiAgICAgICAgICAgICAgICBtZXNoLmhpdC5sb2NhbE5vcm1hbC5zZXQoXG4gICAgICAgICAgICAgICAgICAgIGEueCAqIGJhcnljb29yZC54ICsgYi54ICogYmFyeWNvb3JkLnkgKyBjLnggKiBiYXJ5Y29vcmQueixcbiAgICAgICAgICAgICAgICAgICAgYS55ICogYmFyeWNvb3JkLnggKyBiLnkgKiBiYXJ5Y29vcmQueSArIGMueSAqIGJhcnljb29yZC56LFxuICAgICAgICAgICAgICAgICAgICBhLnogKiBiYXJ5Y29vcmQueCArIGIueiAqIGJhcnljb29yZC55ICsgYy56ICogYmFyeWNvb3JkLnpcbiAgICAgICAgICAgICAgICApO1xuXG4gICAgICAgICAgICAgICAgbWVzaC5oaXQubm9ybWFsLmNvcHkobWVzaC5oaXQubG9jYWxOb3JtYWwpLnRyYW5zZm9ybURpcmVjdGlvbihtZXNoLndvcmxkTWF0cml4KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGhpdHMuc29ydCgoYSwgYikgPT4gYS5oaXQuZGlzdGFuY2UgLSBiLmhpdC5kaXN0YW5jZSk7XG4gICAgICAgIHJldHVybiBoaXRzO1xuICAgIH1cblxuICAgIGludGVyc2VjdFNwaGVyZShzcGhlcmUsIG9yaWdpbiA9IHRoaXMub3JpZ2luLCBkaXJlY3Rpb24gPSB0aGlzLmRpcmVjdGlvbikge1xuICAgICAgICBjb25zdCByYXkgPSB0ZW1wVmVjM2M7XG4gICAgICAgIHJheS5zdWIoc3BoZXJlLmNlbnRlciwgb3JpZ2luKTtcbiAgICAgICAgY29uc3QgdGNhID0gcmF5LmRvdChkaXJlY3Rpb24pO1xuICAgICAgICBjb25zdCBkMiA9IHJheS5kb3QocmF5KSAtIHRjYSAqIHRjYTtcbiAgICAgICAgY29uc3QgcmFkaXVzMiA9IHNwaGVyZS5yYWRpdXMgKiBzcGhlcmUucmFkaXVzO1xuICAgICAgICBpZiAoZDIgPiByYWRpdXMyKSByZXR1cm4gMDtcbiAgICAgICAgY29uc3QgdGhjID0gTWF0aC5zcXJ0KHJhZGl1czIgLSBkMik7XG4gICAgICAgIGNvbnN0IHQwID0gdGNhIC0gdGhjO1xuICAgICAgICBjb25zdCB0MSA9IHRjYSArIHRoYztcbiAgICAgICAgaWYgKHQwIDwgMCAmJiB0MSA8IDApIHJldHVybiAwO1xuICAgICAgICBpZiAodDAgPCAwKSByZXR1cm4gdDE7XG4gICAgICAgIHJldHVybiB0MDtcbiAgICB9XG5cbiAgICAvLyBSYXkgQUFCQiAtIFJheSBBeGlzIGFsaWduZWQgYm91bmRpbmcgYm94IHRlc3RpbmdcbiAgICBpbnRlcnNlY3RCb3goYm94LCBvcmlnaW4gPSB0aGlzLm9yaWdpbiwgZGlyZWN0aW9uID0gdGhpcy5kaXJlY3Rpb24pIHtcbiAgICAgICAgbGV0IHRtaW4sIHRtYXgsIHRZbWluLCB0WW1heCwgdFptaW4sIHRabWF4O1xuICAgICAgICBjb25zdCBpbnZkaXJ4ID0gMSAvIGRpcmVjdGlvbi54O1xuICAgICAgICBjb25zdCBpbnZkaXJ5ID0gMSAvIGRpcmVjdGlvbi55O1xuICAgICAgICBjb25zdCBpbnZkaXJ6ID0gMSAvIGRpcmVjdGlvbi56O1xuICAgICAgICBjb25zdCBtaW4gPSBib3gubWluO1xuICAgICAgICBjb25zdCBtYXggPSBib3gubWF4O1xuICAgICAgICB0bWluID0gKChpbnZkaXJ4ID49IDAgPyBtaW4ueCA6IG1heC54KSAtIG9yaWdpbi54KSAqIGludmRpcng7XG4gICAgICAgIHRtYXggPSAoKGludmRpcnggPj0gMCA/IG1heC54IDogbWluLngpIC0gb3JpZ2luLngpICogaW52ZGlyeDtcbiAgICAgICAgdFltaW4gPSAoKGludmRpcnkgPj0gMCA/IG1pbi55IDogbWF4LnkpIC0gb3JpZ2luLnkpICogaW52ZGlyeTtcbiAgICAgICAgdFltYXggPSAoKGludmRpcnkgPj0gMCA/IG1heC55IDogbWluLnkpIC0gb3JpZ2luLnkpICogaW52ZGlyeTtcbiAgICAgICAgaWYgKHRtaW4gPiB0WW1heCB8fCB0WW1pbiA+IHRtYXgpIHJldHVybiAwO1xuICAgICAgICBpZiAodFltaW4gPiB0bWluKSB0bWluID0gdFltaW47XG4gICAgICAgIGlmICh0WW1heCA8IHRtYXgpIHRtYXggPSB0WW1heDtcbiAgICAgICAgdFptaW4gPSAoKGludmRpcnogPj0gMCA/IG1pbi56IDogbWF4LnopIC0gb3JpZ2luLnopICogaW52ZGlyejtcbiAgICAgICAgdFptYXggPSAoKGludmRpcnogPj0gMCA/IG1heC56IDogbWluLnopIC0gb3JpZ2luLnopICogaW52ZGlyejtcbiAgICAgICAgaWYgKHRtaW4gPiB0Wm1heCB8fCB0Wm1pbiA+IHRtYXgpIHJldHVybiAwO1xuICAgICAgICBpZiAodFptaW4gPiB0bWluKSB0bWluID0gdFptaW47XG4gICAgICAgIGlmICh0Wm1heCA8IHRtYXgpIHRtYXggPSB0Wm1heDtcbiAgICAgICAgaWYgKHRtYXggPCAwKSByZXR1cm4gMDtcbiAgICAgICAgcmV0dXJuIHRtaW4gPj0gMCA/IHRtaW4gOiB0bWF4O1xuICAgIH1cblxuICAgIGludGVyc2VjdFRyaWFuZ2xlKGEsIGIsIGMsIGJhY2tmYWNlQ3VsbGluZyA9IHRydWUsIG9yaWdpbiA9IHRoaXMub3JpZ2luLCBkaXJlY3Rpb24gPSB0aGlzLmRpcmVjdGlvbiwgbm9ybWFsID0gdGVtcFZlYzNnKSB7XG4gICAgICAgIC8vIGZyb20gaHR0cHM6Ly9naXRodWIuY29tL21yZG9vYi90aHJlZS5qcy9ibG9iL21hc3Rlci9zcmMvbWF0aC9SYXkuanNcbiAgICAgICAgLy8gd2hpY2ggaXMgZnJvbSBodHRwOi8vd3d3Lmdlb21ldHJpY3Rvb2xzLmNvbS9HVEVuZ2luZS9JbmNsdWRlL01hdGhlbWF0aWNzL0d0ZUludHJSYXkzVHJpYW5nbGUzLmhcbiAgICAgICAgY29uc3QgZWRnZTEgPSB0ZW1wVmVjM2g7XG4gICAgICAgIGNvbnN0IGVkZ2UyID0gdGVtcFZlYzNpO1xuICAgICAgICBjb25zdCBkaWZmID0gdGVtcFZlYzNqO1xuICAgICAgICBlZGdlMS5zdWIoYiwgYSk7XG4gICAgICAgIGVkZ2UyLnN1YihjLCBhKTtcbiAgICAgICAgbm9ybWFsLmNyb3NzKGVkZ2UxLCBlZGdlMik7XG4gICAgICAgIGxldCBEZE4gPSBkaXJlY3Rpb24uZG90KG5vcm1hbCk7XG4gICAgICAgIGlmICghRGROKSByZXR1cm4gMDtcbiAgICAgICAgbGV0IHNpZ247XG4gICAgICAgIGlmIChEZE4gPiAwKSB7XG4gICAgICAgICAgICBpZiAoYmFja2ZhY2VDdWxsaW5nKSByZXR1cm4gMDtcbiAgICAgICAgICAgIHNpZ24gPSAxO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc2lnbiA9IC0xO1xuICAgICAgICAgICAgRGROID0gLURkTjtcbiAgICAgICAgfVxuICAgICAgICBkaWZmLnN1YihvcmlnaW4sIGEpO1xuICAgICAgICBsZXQgRGRReEUyID0gc2lnbiAqIGRpcmVjdGlvbi5kb3QoZWRnZTIuY3Jvc3MoZGlmZiwgZWRnZTIpKTtcbiAgICAgICAgaWYgKERkUXhFMiA8IDApIHJldHVybiAwO1xuICAgICAgICBsZXQgRGRFMXhRID0gc2lnbiAqIGRpcmVjdGlvbi5kb3QoZWRnZTEuY3Jvc3MoZGlmZikpO1xuICAgICAgICBpZiAoRGRFMXhRIDwgMCkgcmV0dXJuIDA7XG4gICAgICAgIGlmIChEZFF4RTIgKyBEZEUxeFEgPiBEZE4pIHJldHVybiAwO1xuICAgICAgICBsZXQgUWROID0gLXNpZ24gKiBkaWZmLmRvdChub3JtYWwpO1xuICAgICAgICBpZiAoUWROIDwgMCkgcmV0dXJuIDA7XG4gICAgICAgIHJldHVybiBRZE4gLyBEZE47XG4gICAgfVxuXG4gICAgZ2V0QmFyeWNvb3JkKHBvaW50LCBhLCBiLCBjLCB0YXJnZXQgPSB0ZW1wVmVjM2gpIHtcbiAgICAgICAgLy8gRnJvbSBodHRwczovL2dpdGh1Yi5jb20vbXJkb29iL3RocmVlLmpzL2Jsb2IvbWFzdGVyL3NyYy9tYXRoL1RyaWFuZ2xlLmpzXG4gICAgICAgIC8vIHN0YXRpYy9pbnN0YW5jZSBtZXRob2QgdG8gY2FsY3VsYXRlIGJhcnljZW50cmljIGNvb3JkaW5hdGVzXG4gICAgICAgIC8vIGJhc2VkIG9uOiBodHRwOi8vd3d3LmJsYWNrcGF3bi5jb20vdGV4dHMvcG9pbnRpbnBvbHkvZGVmYXVsdC5odG1sXG4gICAgICAgIGNvbnN0IHYwID0gdGVtcFZlYzNpO1xuICAgICAgICBjb25zdCB2MSA9IHRlbXBWZWMzajtcbiAgICAgICAgY29uc3QgdjIgPSB0ZW1wVmVjM2s7XG4gICAgICAgIHYwLnN1YihjLCBhKTtcbiAgICAgICAgdjEuc3ViKGIsIGEpO1xuICAgICAgICB2Mi5zdWIocG9pbnQsIGEpO1xuICAgICAgICBjb25zdCBkb3QwMCA9IHYwLmRvdCh2MCk7XG4gICAgICAgIGNvbnN0IGRvdDAxID0gdjAuZG90KHYxKTtcbiAgICAgICAgY29uc3QgZG90MDIgPSB2MC5kb3QodjIpO1xuICAgICAgICBjb25zdCBkb3QxMSA9IHYxLmRvdCh2MSk7XG4gICAgICAgIGNvbnN0IGRvdDEyID0gdjEuZG90KHYyKTtcbiAgICAgICAgY29uc3QgZGVub20gPSBkb3QwMCAqIGRvdDExIC0gZG90MDEgKiBkb3QwMTtcbiAgICAgICAgaWYgKGRlbm9tID09PSAwKSByZXR1cm4gdGFyZ2V0LnNldCgtMiwgLTEsIC0xKTtcbiAgICAgICAgY29uc3QgaW52RGVub20gPSAxIC8gZGVub207XG4gICAgICAgIGNvbnN0IHUgPSAoZG90MTEgKiBkb3QwMiAtIGRvdDAxICogZG90MTIpICogaW52RGVub207XG4gICAgICAgIGNvbnN0IHYgPSAoZG90MDAgKiBkb3QxMiAtIGRvdDAxICogZG90MDIpICogaW52RGVub207XG4gICAgICAgIHJldHVybiB0YXJnZXQuc2V0KDEgLSB1IC0gdiwgdiwgdSk7XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgQ2FtZXJhIH0gZnJvbSAnLi4vY29yZS9DYW1lcmEuanMnO1xuaW1wb3J0IHsgUHJvZ3JhbSB9IGZyb20gJy4uL2NvcmUvUHJvZ3JhbS5qcyc7XG5pbXBvcnQgeyBSZW5kZXJUYXJnZXQgfSBmcm9tICcuLi9jb3JlL1JlbmRlclRhcmdldC5qcyc7XG5cbmV4cG9ydCBjbGFzcyBTaGFkb3cge1xuICAgIGNvbnN0cnVjdG9yKGdsLCB7IGxpZ2h0ID0gbmV3IENhbWVyYShnbCksIHdpZHRoID0gMTAyNCwgaGVpZ2h0ID0gd2lkdGggfSkge1xuICAgICAgICB0aGlzLmdsID0gZ2w7XG5cbiAgICAgICAgdGhpcy5saWdodCA9IGxpZ2h0O1xuXG4gICAgICAgIHRoaXMudGFyZ2V0ID0gbmV3IFJlbmRlclRhcmdldChnbCwgeyB3aWR0aCwgaGVpZ2h0IH0pO1xuXG4gICAgICAgIHRoaXMuZGVwdGhQcm9ncmFtID0gbmV3IFByb2dyYW0oZ2wsIHtcbiAgICAgICAgICAgIHZlcnRleDogZGVmYXVsdFZlcnRleCxcbiAgICAgICAgICAgIGZyYWdtZW50OiBkZWZhdWx0RnJhZ21lbnQsXG4gICAgICAgICAgICBjdWxsRmFjZTogbnVsbCxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5jYXN0TWVzaGVzID0gW107XG4gICAgfVxuXG4gICAgYWRkKHtcbiAgICAgICAgbWVzaCxcbiAgICAgICAgcmVjZWl2ZSA9IHRydWUsXG4gICAgICAgIGNhc3QgPSB0cnVlLFxuICAgICAgICB2ZXJ0ZXggPSBkZWZhdWx0VmVydGV4LFxuICAgICAgICBmcmFnbWVudCA9IGRlZmF1bHRGcmFnbWVudCxcbiAgICAgICAgdW5pZm9ybVByb2plY3Rpb24gPSAnc2hhZG93UHJvamVjdGlvbk1hdHJpeCcsXG4gICAgICAgIHVuaWZvcm1WaWV3ID0gJ3NoYWRvd1ZpZXdNYXRyaXgnLFxuICAgICAgICB1bmlmb3JtVGV4dHVyZSA9ICd0U2hhZG93JyxcbiAgICB9KSB7XG4gICAgICAgIC8vIEFkZCB1bmlmb3JtcyB0byBleGlzdGluZyBwcm9ncmFtXG4gICAgICAgIGlmIChyZWNlaXZlICYmICFtZXNoLnByb2dyYW0udW5pZm9ybXNbdW5pZm9ybVByb2plY3Rpb25dKSB7XG4gICAgICAgICAgICBtZXNoLnByb2dyYW0udW5pZm9ybXNbdW5pZm9ybVByb2plY3Rpb25dID0geyB2YWx1ZTogdGhpcy5saWdodC5wcm9qZWN0aW9uTWF0cml4IH07XG4gICAgICAgICAgICBtZXNoLnByb2dyYW0udW5pZm9ybXNbdW5pZm9ybVZpZXddID0geyB2YWx1ZTogdGhpcy5saWdodC52aWV3TWF0cml4IH07XG4gICAgICAgICAgICBtZXNoLnByb2dyYW0udW5pZm9ybXNbdW5pZm9ybVRleHR1cmVdID0geyB2YWx1ZTogdGhpcy50YXJnZXQudGV4dHVyZSB9O1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFjYXN0KSByZXR1cm47XG4gICAgICAgIHRoaXMuY2FzdE1lc2hlcy5wdXNoKG1lc2gpO1xuXG4gICAgICAgIC8vIFN0b3JlIHByb2dyYW0gZm9yIHdoZW4gc3dpdGNoaW5nIGJldHdlZW4gZGVwdGggb3ZlcnJpZGVcbiAgICAgICAgbWVzaC5jb2xvclByb2dyYW0gPSBtZXNoLnByb2dyYW07XG5cbiAgICAgICAgLy8gQ2hlY2sgaWYgZGVwdGggcHJvZ3JhbSBhbHJlYWR5IGF0dGFjaGVkXG4gICAgICAgIGlmIChtZXNoLmRlcHRoUHJvZ3JhbSkgcmV0dXJuO1xuXG4gICAgICAgIC8vIFVzZSBnbG9iYWwgZGVwdGggb3ZlcnJpZGUgaWYgbm90aGluZyBjdXN0b20gcGFzc2VkIGluXG4gICAgICAgIGlmICh2ZXJ0ZXggPT09IGRlZmF1bHRWZXJ0ZXggJiYgZnJhZ21lbnQgPT09IGRlZmF1bHRGcmFnbWVudCkge1xuICAgICAgICAgICAgbWVzaC5kZXB0aFByb2dyYW0gPSB0aGlzLmRlcHRoUHJvZ3JhbTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENyZWF0ZSBjdXN0b20gb3ZlcnJpZGUgcHJvZ3JhbVxuICAgICAgICBtZXNoLmRlcHRoUHJvZ3JhbSA9IG5ldyBQcm9ncmFtKHRoaXMuZ2wsIHtcbiAgICAgICAgICAgIHZlcnRleCxcbiAgICAgICAgICAgIGZyYWdtZW50LFxuICAgICAgICAgICAgY3VsbEZhY2U6IG51bGwsXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHJlbmRlcih7IHNjZW5lIH0pIHtcbiAgICAgICAgLy8gRm9yIGRlcHRoIHJlbmRlciwgcmVwbGFjZSBwcm9ncmFtIHdpdGggZGVwdGggb3ZlcnJpZGUuXG4gICAgICAgIC8vIEhpZGUgbWVzaGVzIG5vdCBjYXN0aW5nIHNoYWRvd3MuXG4gICAgICAgIHNjZW5lLnRyYXZlcnNlKChub2RlKSA9PiB7XG4gICAgICAgICAgICBpZiAoIW5vZGUuZHJhdykgcmV0dXJuO1xuICAgICAgICAgICAgaWYgKCEhfnRoaXMuY2FzdE1lc2hlcy5pbmRleE9mKG5vZGUpKSB7XG4gICAgICAgICAgICAgICAgbm9kZS5wcm9ncmFtID0gbm9kZS5kZXB0aFByb2dyYW07XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG5vZGUuaXNGb3JjZVZpc2liaWxpdHkgPSBub2RlLnZpc2libGU7XG4gICAgICAgICAgICAgICAgbm9kZS52aXNpYmxlID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIFJlbmRlciB0aGUgZGVwdGggc2hhZG93IG1hcCB1c2luZyB0aGUgbGlnaHQgYXMgdGhlIGNhbWVyYVxuICAgICAgICB0aGlzLmdsLnJlbmRlcmVyLnJlbmRlcih7XG4gICAgICAgICAgICBzY2VuZSxcbiAgICAgICAgICAgIGNhbWVyYTogdGhpcy5saWdodCxcbiAgICAgICAgICAgIHRhcmdldDogdGhpcy50YXJnZXQsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIFRoZW4gc3dpdGNoIHRoZSBwcm9ncmFtIGJhY2sgdG8gdGhlIG5vcm1hbCBvbmVcbiAgICAgICAgc2NlbmUudHJhdmVyc2UoKG5vZGUpID0+IHtcbiAgICAgICAgICAgIGlmICghbm9kZS5kcmF3KSByZXR1cm47XG4gICAgICAgICAgICBpZiAoISF+dGhpcy5jYXN0TWVzaGVzLmluZGV4T2Yobm9kZSkpIHtcbiAgICAgICAgICAgICAgICBub2RlLnByb2dyYW0gPSBub2RlLmNvbG9yUHJvZ3JhbTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbm9kZS52aXNpYmxlID0gbm9kZS5pc0ZvcmNlVmlzaWJpbGl0eTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxufVxuXG5jb25zdCBkZWZhdWx0VmVydGV4ID0gLyogZ2xzbCAqLyBgXG4gICAgYXR0cmlidXRlIHZlYzMgcG9zaXRpb247XG4gICAgYXR0cmlidXRlIHZlYzIgdXY7XG5cbiAgICB1bmlmb3JtIG1hdDQgbW9kZWxWaWV3TWF0cml4O1xuICAgIHVuaWZvcm0gbWF0NCBwcm9qZWN0aW9uTWF0cml4O1xuXG4gICAgdm9pZCBtYWluKCkge1xuICAgICAgICBnbF9Qb3NpdGlvbiA9IHByb2plY3Rpb25NYXRyaXggKiBtb2RlbFZpZXdNYXRyaXggKiB2ZWM0KHBvc2l0aW9uLCAxLjApO1xuICAgIH1cbmA7XG5cbmNvbnN0IGRlZmF1bHRGcmFnbWVudCA9IC8qIGdsc2wgKi8gYFxuICAgIHByZWNpc2lvbiBoaWdocCBmbG9hdDtcblxuICAgIHZlYzQgcGFja1JHQkEgKGZsb2F0IHYpIHtcbiAgICAgICAgdmVjNCBwYWNrID0gZnJhY3QodmVjNCgxLjAsIDI1NS4wLCA2NTAyNS4wLCAxNjU4MTM3NS4wKSAqIHYpO1xuICAgICAgICBwYWNrIC09IHBhY2sueXp3dyAqIHZlYzIoMS4wIC8gMjU1LjAsIDAuMCkueHh4eTtcbiAgICAgICAgcmV0dXJuIHBhY2s7XG4gICAgfVxuXG4gICAgdm9pZCBtYWluKCkge1xuICAgICAgICBnbF9GcmFnQ29sb3IgPSBwYWNrUkdCQShnbF9GcmFnQ29vcmQueik7XG4gICAgfVxuYDtcbiIsImltcG9ydCB7IE1lc2ggfSBmcm9tICcuLi9jb3JlL01lc2guanMnO1xuaW1wb3J0IHsgVHJhbnNmb3JtIH0gZnJvbSAnLi4vY29yZS9UcmFuc2Zvcm0uanMnO1xuaW1wb3J0IHsgTWF0NCB9IGZyb20gJy4uL21hdGgvTWF0NC5qcyc7XG5pbXBvcnQgeyBUZXh0dXJlIH0gZnJvbSAnLi4vY29yZS9UZXh0dXJlLmpzJztcbmltcG9ydCB7IEFuaW1hdGlvbiB9IGZyb20gJy4vQW5pbWF0aW9uLmpzJztcblxuY29uc3QgdGVtcE1hdDQgPSBuZXcgTWF0NCgpO1xuXG5leHBvcnQgY2xhc3MgU2tpbiBleHRlbmRzIE1lc2gge1xuICAgIGNvbnN0cnVjdG9yKGdsLCB7IHJpZywgZ2VvbWV0cnksIHByb2dyYW0sIG1vZGUgPSBnbC5UUklBTkdMRVMgfSA9IHt9KSB7XG4gICAgICAgIHN1cGVyKGdsLCB7IGdlb21ldHJ5LCBwcm9ncmFtLCBtb2RlIH0pO1xuXG4gICAgICAgIHRoaXMuY3JlYXRlQm9uZXMocmlnKTtcbiAgICAgICAgdGhpcy5jcmVhdGVCb25lVGV4dHVyZSgpO1xuICAgICAgICB0aGlzLmFuaW1hdGlvbnMgPSBbXTtcblxuICAgICAgICBPYmplY3QuYXNzaWduKHRoaXMucHJvZ3JhbS51bmlmb3Jtcywge1xuICAgICAgICAgICAgYm9uZVRleHR1cmU6IHsgdmFsdWU6IHRoaXMuYm9uZVRleHR1cmUgfSxcbiAgICAgICAgICAgIGJvbmVUZXh0dXJlU2l6ZTogeyB2YWx1ZTogdGhpcy5ib25lVGV4dHVyZVNpemUgfSxcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgY3JlYXRlQm9uZXMocmlnKSB7XG4gICAgICAgIC8vIENyZWF0ZSByb290IHNvIHRoYXQgY2FuIHNpbXBseSB1cGRhdGUgd29ybGQgbWF0cml4IG9mIHdob2xlIHNrZWxldG9uXG4gICAgICAgIHRoaXMucm9vdCA9IG5ldyBUcmFuc2Zvcm0oKTtcblxuICAgICAgICAvLyBDcmVhdGUgYm9uZXNcbiAgICAgICAgdGhpcy5ib25lcyA9IFtdO1xuICAgICAgICBpZiAoIXJpZy5ib25lcyB8fCAhcmlnLmJvbmVzLmxlbmd0aCkgcmV0dXJuO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHJpZy5ib25lcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgY29uc3QgYm9uZSA9IG5ldyBUcmFuc2Zvcm0oKTtcblxuICAgICAgICAgICAgLy8gU2V0IGluaXRpYWwgdmFsdWVzIChiaW5kIHBvc2UpXG4gICAgICAgICAgICBib25lLnBvc2l0aW9uLmZyb21BcnJheShyaWcuYmluZFBvc2UucG9zaXRpb24sIGkgKiAzKTtcbiAgICAgICAgICAgIGJvbmUucXVhdGVybmlvbi5mcm9tQXJyYXkocmlnLmJpbmRQb3NlLnF1YXRlcm5pb24sIGkgKiA0KTtcbiAgICAgICAgICAgIGJvbmUuc2NhbGUuZnJvbUFycmF5KHJpZy5iaW5kUG9zZS5zY2FsZSwgaSAqIDMpO1xuXG4gICAgICAgICAgICB0aGlzLmJvbmVzLnB1c2goYm9uZSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBPbmNlIGNyZWF0ZWQsIHNldCB0aGUgaGllcmFyY2h5XG4gICAgICAgIHJpZy5ib25lcy5mb3JFYWNoKChkYXRhLCBpKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmJvbmVzW2ldLm5hbWUgPSBkYXRhLm5hbWU7XG4gICAgICAgICAgICBpZiAoZGF0YS5wYXJlbnQgPT09IC0xKSByZXR1cm4gdGhpcy5ib25lc1tpXS5zZXRQYXJlbnQodGhpcy5yb290KTtcbiAgICAgICAgICAgIHRoaXMuYm9uZXNbaV0uc2V0UGFyZW50KHRoaXMuYm9uZXNbZGF0YS5wYXJlbnRdKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gVGhlbiB1cGRhdGUgdG8gY2FsY3VsYXRlIHdvcmxkIG1hdHJpY2VzXG4gICAgICAgIHRoaXMucm9vdC51cGRhdGVNYXRyaXhXb3JsZCh0cnVlKTtcblxuICAgICAgICAvLyBTdG9yZSBpbnZlcnNlIG9mIGJpbmQgcG9zZSB0byBjYWxjdWxhdGUgZGlmZmVyZW5jZXNcbiAgICAgICAgdGhpcy5ib25lcy5mb3JFYWNoKChib25lKSA9PiB7XG4gICAgICAgICAgICBib25lLmJpbmRJbnZlcnNlID0gbmV3IE1hdDQoLi4uYm9uZS53b3JsZE1hdHJpeCkuaW52ZXJzZSgpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBjcmVhdGVCb25lVGV4dHVyZSgpIHtcbiAgICAgICAgaWYgKCF0aGlzLmJvbmVzLmxlbmd0aCkgcmV0dXJuO1xuICAgICAgICBjb25zdCBzaXplID0gTWF0aC5tYXgoNCwgTWF0aC5wb3coMiwgTWF0aC5jZWlsKE1hdGgubG9nKE1hdGguc3FydCh0aGlzLmJvbmVzLmxlbmd0aCAqIDQpKSAvIE1hdGguTE4yKSkpO1xuICAgICAgICB0aGlzLmJvbmVNYXRyaWNlcyA9IG5ldyBGbG9hdDMyQXJyYXkoc2l6ZSAqIHNpemUgKiA0KTtcbiAgICAgICAgdGhpcy5ib25lVGV4dHVyZVNpemUgPSBzaXplO1xuICAgICAgICB0aGlzLmJvbmVUZXh0dXJlID0gbmV3IFRleHR1cmUodGhpcy5nbCwge1xuICAgICAgICAgICAgaW1hZ2U6IHRoaXMuYm9uZU1hdHJpY2VzLFxuICAgICAgICAgICAgZ2VuZXJhdGVNaXBtYXBzOiBmYWxzZSxcbiAgICAgICAgICAgIHR5cGU6IHRoaXMuZ2wuRkxPQVQsXG4gICAgICAgICAgICBpbnRlcm5hbEZvcm1hdDogdGhpcy5nbC5yZW5kZXJlci5pc1dlYmdsMiA/IHRoaXMuZ2wuUkdCQTMyRiA6IHRoaXMuZ2wuUkdCQSxcbiAgICAgICAgICAgIG1pbkZpbHRlcjogdGhpcy5nbC5ORUFSRVNULFxuICAgICAgICAgICAgbWFnRmlsdGVyOiB0aGlzLmdsLk5FQVJFU1QsXG4gICAgICAgICAgICBmbGlwWTogZmFsc2UsXG4gICAgICAgICAgICB3aWR0aDogc2l6ZSxcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgYWRkQW5pbWF0aW9uKGRhdGEpIHtcbiAgICAgICAgY29uc3QgYW5pbWF0aW9uID0gbmV3IEFuaW1hdGlvbih7IG9iamVjdHM6IHRoaXMuYm9uZXMsIGRhdGEgfSk7XG4gICAgICAgIHRoaXMuYW5pbWF0aW9ucy5wdXNoKGFuaW1hdGlvbik7XG4gICAgICAgIHJldHVybiBhbmltYXRpb247XG4gICAgfVxuXG4gICAgdXBkYXRlKCkge1xuICAgICAgICAvLyBDYWxjdWxhdGUgY29tYmluZWQgYW5pbWF0aW9uIHdlaWdodFxuICAgICAgICBsZXQgdG90YWwgPSAwO1xuICAgICAgICB0aGlzLmFuaW1hdGlvbnMuZm9yRWFjaCgoYW5pbWF0aW9uKSA9PiAodG90YWwgKz0gYW5pbWF0aW9uLndlaWdodCkpO1xuXG4gICAgICAgIHRoaXMuYW5pbWF0aW9ucy5mb3JFYWNoKChhbmltYXRpb24sIGkpID0+IHtcbiAgICAgICAgICAgIC8vIGZvcmNlIGZpcnN0IGFuaW1hdGlvbiB0byBzZXQgaW4gb3JkZXIgdG8gcmVzZXQgZnJhbWVcbiAgICAgICAgICAgIGFuaW1hdGlvbi51cGRhdGUodG90YWwsIGkgPT09IDApO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBkcmF3KHsgY2FtZXJhIH0gPSB7fSkge1xuICAgICAgICAvLyBVcGRhdGUgd29ybGQgbWF0cmljZXMgbWFudWFsbHksIGFzIG5vdCBwYXJ0IG9mIHNjZW5lIGdyYXBoXG4gICAgICAgIHRoaXMucm9vdC51cGRhdGVNYXRyaXhXb3JsZCh0cnVlKTtcblxuICAgICAgICAvLyBVcGRhdGUgYm9uZSB0ZXh0dXJlXG4gICAgICAgIHRoaXMuYm9uZXMuZm9yRWFjaCgoYm9uZSwgaSkgPT4ge1xuICAgICAgICAgICAgLy8gRmluZCBkaWZmZXJlbmNlIGJldHdlZW4gY3VycmVudCBhbmQgYmluZCBwb3NlXG4gICAgICAgICAgICB0ZW1wTWF0NC5tdWx0aXBseShib25lLndvcmxkTWF0cml4LCBib25lLmJpbmRJbnZlcnNlKTtcbiAgICAgICAgICAgIHRoaXMuYm9uZU1hdHJpY2VzLnNldCh0ZW1wTWF0NCwgaSAqIDE2KTtcbiAgICAgICAgfSk7XG4gICAgICAgIGlmICh0aGlzLmJvbmVUZXh0dXJlKSB0aGlzLmJvbmVUZXh0dXJlLm5lZWRzVXBkYXRlID0gdHJ1ZTtcblxuICAgICAgICBzdXBlci5kcmF3KHsgY2FtZXJhIH0pO1xuICAgIH1cbn1cbiIsImltcG9ydCB7IEdlb21ldHJ5IH0gZnJvbSAnLi4vY29yZS9HZW9tZXRyeS5qcyc7XG5pbXBvcnQgeyBWZWMzIH0gZnJvbSAnLi4vbWF0aC9WZWMzLmpzJztcblxuZXhwb3J0IGNsYXNzIFNwaGVyZSBleHRlbmRzIEdlb21ldHJ5IHtcbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgZ2wsXG4gICAgICAgIHtcbiAgICAgICAgICAgIHJhZGl1cyA9IDAuNSxcbiAgICAgICAgICAgIHdpZHRoU2VnbWVudHMgPSAxNixcbiAgICAgICAgICAgIGhlaWdodFNlZ21lbnRzID0gTWF0aC5jZWlsKHdpZHRoU2VnbWVudHMgKiAwLjUpLFxuICAgICAgICAgICAgcGhpU3RhcnQgPSAwLFxuICAgICAgICAgICAgcGhpTGVuZ3RoID0gTWF0aC5QSSAqIDIsXG4gICAgICAgICAgICB0aGV0YVN0YXJ0ID0gMCxcbiAgICAgICAgICAgIHRoZXRhTGVuZ3RoID0gTWF0aC5QSSxcbiAgICAgICAgICAgIGF0dHJpYnV0ZXMgPSB7fSxcbiAgICAgICAgfSA9IHt9XG4gICAgKSB7XG4gICAgICAgIGNvbnN0IHdTZWdzID0gd2lkdGhTZWdtZW50cztcbiAgICAgICAgY29uc3QgaFNlZ3MgPSBoZWlnaHRTZWdtZW50cztcbiAgICAgICAgY29uc3QgcFN0YXJ0ID0gcGhpU3RhcnQ7XG4gICAgICAgIGNvbnN0IHBMZW5ndGggPSBwaGlMZW5ndGg7XG4gICAgICAgIGNvbnN0IHRTdGFydCA9IHRoZXRhU3RhcnQ7XG4gICAgICAgIGNvbnN0IHRMZW5ndGggPSB0aGV0YUxlbmd0aDtcblxuICAgICAgICBjb25zdCBudW0gPSAod1NlZ3MgKyAxKSAqIChoU2VncyArIDEpO1xuICAgICAgICBjb25zdCBudW1JbmRpY2VzID0gd1NlZ3MgKiBoU2VncyAqIDY7XG5cbiAgICAgICAgY29uc3QgcG9zaXRpb24gPSBuZXcgRmxvYXQzMkFycmF5KG51bSAqIDMpO1xuICAgICAgICBjb25zdCBub3JtYWwgPSBuZXcgRmxvYXQzMkFycmF5KG51bSAqIDMpO1xuICAgICAgICBjb25zdCB1diA9IG5ldyBGbG9hdDMyQXJyYXkobnVtICogMik7XG4gICAgICAgIGNvbnN0IGluZGV4ID0gbnVtID4gNjU1MzYgPyBuZXcgVWludDMyQXJyYXkobnVtSW5kaWNlcykgOiBuZXcgVWludDE2QXJyYXkobnVtSW5kaWNlcyk7XG5cbiAgICAgICAgbGV0IGkgPSAwO1xuICAgICAgICBsZXQgaXYgPSAwO1xuICAgICAgICBsZXQgaWkgPSAwO1xuICAgICAgICBsZXQgdGUgPSB0U3RhcnQgKyB0TGVuZ3RoO1xuICAgICAgICBjb25zdCBncmlkID0gW107XG5cbiAgICAgICAgbGV0IG4gPSBuZXcgVmVjMygpO1xuXG4gICAgICAgIGZvciAobGV0IGl5ID0gMDsgaXkgPD0gaFNlZ3M7IGl5KyspIHtcbiAgICAgICAgICAgIGxldCB2Um93ID0gW107XG4gICAgICAgICAgICBsZXQgdiA9IGl5IC8gaFNlZ3M7XG4gICAgICAgICAgICBmb3IgKGxldCBpeCA9IDA7IGl4IDw9IHdTZWdzOyBpeCsrLCBpKyspIHtcbiAgICAgICAgICAgICAgICBsZXQgdSA9IGl4IC8gd1NlZ3M7XG4gICAgICAgICAgICAgICAgbGV0IHggPSAtcmFkaXVzICogTWF0aC5jb3MocFN0YXJ0ICsgdSAqIHBMZW5ndGgpICogTWF0aC5zaW4odFN0YXJ0ICsgdiAqIHRMZW5ndGgpO1xuICAgICAgICAgICAgICAgIGxldCB5ID0gcmFkaXVzICogTWF0aC5jb3ModFN0YXJ0ICsgdiAqIHRMZW5ndGgpO1xuICAgICAgICAgICAgICAgIGxldCB6ID0gcmFkaXVzICogTWF0aC5zaW4ocFN0YXJ0ICsgdSAqIHBMZW5ndGgpICogTWF0aC5zaW4odFN0YXJ0ICsgdiAqIHRMZW5ndGgpO1xuXG4gICAgICAgICAgICAgICAgcG9zaXRpb25baSAqIDNdID0geDtcbiAgICAgICAgICAgICAgICBwb3NpdGlvbltpICogMyArIDFdID0geTtcbiAgICAgICAgICAgICAgICBwb3NpdGlvbltpICogMyArIDJdID0gejtcblxuICAgICAgICAgICAgICAgIG4uc2V0KHgsIHksIHopLm5vcm1hbGl6ZSgpO1xuICAgICAgICAgICAgICAgIG5vcm1hbFtpICogM10gPSBuLng7XG4gICAgICAgICAgICAgICAgbm9ybWFsW2kgKiAzICsgMV0gPSBuLnk7XG4gICAgICAgICAgICAgICAgbm9ybWFsW2kgKiAzICsgMl0gPSBuLno7XG5cbiAgICAgICAgICAgICAgICB1dltpICogMl0gPSB1O1xuICAgICAgICAgICAgICAgIHV2W2kgKiAyICsgMV0gPSAxIC0gdjtcblxuICAgICAgICAgICAgICAgIHZSb3cucHVzaChpdisrKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZ3JpZC5wdXNoKHZSb3cpO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yIChsZXQgaXkgPSAwOyBpeSA8IGhTZWdzOyBpeSsrKSB7XG4gICAgICAgICAgICBmb3IgKGxldCBpeCA9IDA7IGl4IDwgd1NlZ3M7IGl4KyspIHtcbiAgICAgICAgICAgICAgICBsZXQgYSA9IGdyaWRbaXldW2l4ICsgMV07XG4gICAgICAgICAgICAgICAgbGV0IGIgPSBncmlkW2l5XVtpeF07XG4gICAgICAgICAgICAgICAgbGV0IGMgPSBncmlkW2l5ICsgMV1baXhdO1xuICAgICAgICAgICAgICAgIGxldCBkID0gZ3JpZFtpeSArIDFdW2l4ICsgMV07XG5cbiAgICAgICAgICAgICAgICBpZiAoaXkgIT09IDAgfHwgdFN0YXJ0ID4gMCkge1xuICAgICAgICAgICAgICAgICAgICBpbmRleFtpaSAqIDNdID0gYTtcbiAgICAgICAgICAgICAgICAgICAgaW5kZXhbaWkgKiAzICsgMV0gPSBiO1xuICAgICAgICAgICAgICAgICAgICBpbmRleFtpaSAqIDMgKyAyXSA9IGQ7XG4gICAgICAgICAgICAgICAgICAgIGlpKys7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChpeSAhPT0gaFNlZ3MgLSAxIHx8IHRlIDwgTWF0aC5QSSkge1xuICAgICAgICAgICAgICAgICAgICBpbmRleFtpaSAqIDNdID0gYjtcbiAgICAgICAgICAgICAgICAgICAgaW5kZXhbaWkgKiAzICsgMV0gPSBjO1xuICAgICAgICAgICAgICAgICAgICBpbmRleFtpaSAqIDMgKyAyXSA9IGQ7XG4gICAgICAgICAgICAgICAgICAgIGlpKys7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgT2JqZWN0LmFzc2lnbihhdHRyaWJ1dGVzLCB7XG4gICAgICAgICAgICBwb3NpdGlvbjogeyBzaXplOiAzLCBkYXRhOiBwb3NpdGlvbiB9LFxuICAgICAgICAgICAgbm9ybWFsOiB7IHNpemU6IDMsIGRhdGE6IG5vcm1hbCB9LFxuICAgICAgICAgICAgdXY6IHsgc2l6ZTogMiwgZGF0YTogdXYgfSxcbiAgICAgICAgICAgIGluZGV4OiB7IGRhdGE6IGluZGV4IH0sXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHN1cGVyKGdsLCBhdHRyaWJ1dGVzKTtcbiAgICB9XG59XG4iLCJleHBvcnQgZnVuY3Rpb24gVGV4dCh7XG4gICAgZm9udCxcbiAgICB0ZXh0LFxuICAgIHdpZHRoID0gSW5maW5pdHksXG4gICAgYWxpZ24gPSAnbGVmdCcsXG4gICAgc2l6ZSA9IDEsXG4gICAgbGV0dGVyU3BhY2luZyA9IDAsXG4gICAgbGluZUhlaWdodCA9IDEuNCxcbiAgICB3b3JkU3BhY2luZyA9IDAsXG4gICAgd29yZEJyZWFrID0gZmFsc2UsXG59KSB7XG4gICAgY29uc3QgX3RoaXMgPSB0aGlzO1xuICAgIGxldCBnbHlwaHMsIGJ1ZmZlcnM7XG4gICAgbGV0IGZvbnRIZWlnaHQsIGJhc2VsaW5lLCBzY2FsZTtcblxuICAgIGNvbnN0IG5ld2xpbmUgPSAvXFxuLztcbiAgICBjb25zdCB3aGl0ZXNwYWNlID0gL1xccy87XG5cbiAgICB7XG4gICAgICAgIHBhcnNlRm9udCgpO1xuICAgICAgICBjcmVhdGVHZW9tZXRyeSgpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHBhcnNlRm9udCgpIHtcbiAgICAgICAgZ2x5cGhzID0ge307XG4gICAgICAgIGZvbnQuY2hhcnMuZm9yRWFjaCgoZCkgPT4gKGdseXBoc1tkLmNoYXJdID0gZCkpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNyZWF0ZUdlb21ldHJ5KCkge1xuICAgICAgICBmb250SGVpZ2h0ID0gZm9udC5jb21tb24ubGluZUhlaWdodDtcbiAgICAgICAgYmFzZWxpbmUgPSBmb250LmNvbW1vbi5iYXNlO1xuXG4gICAgICAgIC8vIFVzZSBiYXNlbGluZSBzbyB0aGF0IGFjdHVhbCB0ZXh0IGhlaWdodCBpcyBhcyBjbG9zZSB0byAnc2l6ZScgdmFsdWUgYXMgcG9zc2libGVcbiAgICAgICAgc2NhbGUgPSBzaXplIC8gYmFzZWxpbmU7XG5cbiAgICAgICAgLy8gU3RyaXAgc3BhY2VzIGFuZCBuZXdsaW5lcyB0byBnZXQgYWN0dWFsIGNoYXJhY3RlciBsZW5ndGggZm9yIGJ1ZmZlcnNcbiAgICAgICAgbGV0IGNoYXJzID0gdGV4dC5yZXBsYWNlKC9bIFxcbl0vZywgJycpO1xuICAgICAgICBsZXQgbnVtQ2hhcnMgPSBjaGFycy5sZW5ndGg7XG5cbiAgICAgICAgLy8gQ3JlYXRlIG91dHB1dCBidWZmZXJzXG4gICAgICAgIGJ1ZmZlcnMgPSB7XG4gICAgICAgICAgICBwb3NpdGlvbjogbmV3IEZsb2F0MzJBcnJheShudW1DaGFycyAqIDQgKiAzKSxcbiAgICAgICAgICAgIHV2OiBuZXcgRmxvYXQzMkFycmF5KG51bUNoYXJzICogNCAqIDIpLFxuICAgICAgICAgICAgaWQ6IG5ldyBGbG9hdDMyQXJyYXkobnVtQ2hhcnMgKiA0KSxcbiAgICAgICAgICAgIGluZGV4OiBuZXcgVWludDE2QXJyYXkobnVtQ2hhcnMgKiA2KSxcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBTZXQgdmFsdWVzIGZvciBidWZmZXJzIHRoYXQgZG9uJ3QgcmVxdWlyZSBjYWxjdWxhdGlvblxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG51bUNoYXJzOyBpKyspIHtcbiAgICAgICAgICAgIGJ1ZmZlcnMuaWRbaV0gPSBpO1xuICAgICAgICAgICAgYnVmZmVycy5pbmRleC5zZXQoW2kgKiA0LCBpICogNCArIDIsIGkgKiA0ICsgMSwgaSAqIDQgKyAxLCBpICogNCArIDIsIGkgKiA0ICsgM10sIGkgKiA2KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxheW91dCgpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxheW91dCgpIHtcbiAgICAgICAgY29uc3QgbGluZXMgPSBbXTtcblxuICAgICAgICBsZXQgY3Vyc29yID0gMDtcblxuICAgICAgICBsZXQgd29yZEN1cnNvciA9IDA7XG4gICAgICAgIGxldCB3b3JkV2lkdGggPSAwO1xuICAgICAgICBsZXQgbGluZSA9IG5ld0xpbmUoKTtcblxuICAgICAgICBmdW5jdGlvbiBuZXdMaW5lKCkge1xuICAgICAgICAgICAgY29uc3QgbGluZSA9IHtcbiAgICAgICAgICAgICAgICB3aWR0aDogMCxcbiAgICAgICAgICAgICAgICBnbHlwaHM6IFtdLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGxpbmVzLnB1c2gobGluZSk7XG4gICAgICAgICAgICB3b3JkQ3Vyc29yID0gY3Vyc29yO1xuICAgICAgICAgICAgd29yZFdpZHRoID0gMDtcbiAgICAgICAgICAgIHJldHVybiBsaW5lO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IG1heFRpbWVzID0gMTAwO1xuICAgICAgICBsZXQgY291bnQgPSAwO1xuICAgICAgICB3aGlsZSAoY3Vyc29yIDwgdGV4dC5sZW5ndGggJiYgY291bnQgPCBtYXhUaW1lcykge1xuICAgICAgICAgICAgY291bnQrKztcblxuICAgICAgICAgICAgY29uc3QgY2hhciA9IHRleHRbY3Vyc29yXTtcblxuICAgICAgICAgICAgLy8gU2tpcCB3aGl0ZXNwYWNlIGF0IHN0YXJ0IG9mIGxpbmVcbiAgICAgICAgICAgIGlmICghbGluZS53aWR0aCAmJiB3aGl0ZXNwYWNlLnRlc3QoY2hhcikpIHtcbiAgICAgICAgICAgICAgICBjdXJzb3IrKztcbiAgICAgICAgICAgICAgICB3b3JkQ3Vyc29yID0gY3Vyc29yO1xuICAgICAgICAgICAgICAgIHdvcmRXaWR0aCA9IDA7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIElmIG5ld2xpbmUgY2hhciwgc2tpcCB0byBuZXh0IGxpbmVcbiAgICAgICAgICAgIGlmIChuZXdsaW5lLnRlc3QoY2hhcikpIHtcbiAgICAgICAgICAgICAgICBjdXJzb3IrKztcbiAgICAgICAgICAgICAgICBsaW5lID0gbmV3TGluZSgpO1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCBnbHlwaCA9IGdseXBoc1tjaGFyXSB8fCBnbHlwaHNbJyAnXTtcblxuICAgICAgICAgICAgLy8gRmluZCBhbnkgYXBwbGljYWJsZSBrZXJuIHBhaXJzXG4gICAgICAgICAgICBpZiAobGluZS5nbHlwaHMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcHJldkdseXBoID0gbGluZS5nbHlwaHNbbGluZS5nbHlwaHMubGVuZ3RoIC0gMV1bMF07XG4gICAgICAgICAgICAgICAgbGV0IGtlcm4gPSBnZXRLZXJuUGFpck9mZnNldChnbHlwaC5pZCwgcHJldkdseXBoLmlkKSAqIHNjYWxlO1xuICAgICAgICAgICAgICAgIGxpbmUud2lkdGggKz0ga2VybjtcbiAgICAgICAgICAgICAgICB3b3JkV2lkdGggKz0ga2VybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gYWRkIGNoYXIgdG8gbGluZVxuICAgICAgICAgICAgbGluZS5nbHlwaHMucHVzaChbZ2x5cGgsIGxpbmUud2lkdGhdKTtcblxuICAgICAgICAgICAgLy8gY2FsY3VsYXRlIGFkdmFuY2UgZm9yIG5leHQgZ2x5cGhcbiAgICAgICAgICAgIGxldCBhZHZhbmNlID0gMDtcblxuICAgICAgICAgICAgLy8gSWYgd2hpdGVzcGFjZSwgdXBkYXRlIGxvY2F0aW9uIG9mIGN1cnJlbnQgd29yZCBmb3IgbGluZSBicmVha3NcbiAgICAgICAgICAgIGlmICh3aGl0ZXNwYWNlLnRlc3QoY2hhcikpIHtcbiAgICAgICAgICAgICAgICB3b3JkQ3Vyc29yID0gY3Vyc29yO1xuICAgICAgICAgICAgICAgIHdvcmRXaWR0aCA9IDA7XG5cbiAgICAgICAgICAgICAgICAvLyBBZGQgd29yZHNwYWNpbmdcbiAgICAgICAgICAgICAgICBhZHZhbmNlICs9IHdvcmRTcGFjaW5nICogc2l6ZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gQWRkIGxldHRlcnNwYWNpbmdcbiAgICAgICAgICAgICAgICBhZHZhbmNlICs9IGxldHRlclNwYWNpbmcgKiBzaXplO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBhZHZhbmNlICs9IGdseXBoLnhhZHZhbmNlICogc2NhbGU7XG5cbiAgICAgICAgICAgIGxpbmUud2lkdGggKz0gYWR2YW5jZTtcbiAgICAgICAgICAgIHdvcmRXaWR0aCArPSBhZHZhbmNlO1xuXG4gICAgICAgICAgICAvLyBJZiB3aWR0aCBkZWZpbmVkXG4gICAgICAgICAgICBpZiAobGluZS53aWR0aCA+IHdpZHRoKSB7XG4gICAgICAgICAgICAgICAgLy8gSWYgY2FuIGJyZWFrIHdvcmRzLCB1bmRvIGxhdGVzdCBnbHlwaCBpZiBsaW5lIG5vdCBlbXB0eSBhbmQgY3JlYXRlIG5ldyBsaW5lXG4gICAgICAgICAgICAgICAgaWYgKHdvcmRCcmVhayAmJiBsaW5lLmdseXBocy5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgICAgICAgICAgIGxpbmUud2lkdGggLT0gYWR2YW5jZTtcbiAgICAgICAgICAgICAgICAgICAgbGluZS5nbHlwaHMucG9wKCk7XG4gICAgICAgICAgICAgICAgICAgIGxpbmUgPSBuZXdMaW5lKCk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIElmIG5vdCBmaXJzdCB3b3JkLCB1bmRvIGN1cnJlbnQgd29yZCBhbmQgY3Vyc29yIGFuZCBjcmVhdGUgbmV3IGxpbmVcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKCF3b3JkQnJlYWsgJiYgd29yZFdpZHRoICE9PSBsaW5lLndpZHRoKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBudW1HbHlwaHMgPSBjdXJzb3IgLSB3b3JkQ3Vyc29yICsgMTtcbiAgICAgICAgICAgICAgICAgICAgbGluZS5nbHlwaHMuc3BsaWNlKC1udW1HbHlwaHMsIG51bUdseXBocyk7XG4gICAgICAgICAgICAgICAgICAgIGN1cnNvciA9IHdvcmRDdXJzb3I7XG4gICAgICAgICAgICAgICAgICAgIGxpbmUud2lkdGggLT0gd29yZFdpZHRoO1xuICAgICAgICAgICAgICAgICAgICBsaW5lID0gbmV3TGluZSgpO1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGN1cnNvcisrO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gUmVtb3ZlIGxhc3QgbGluZSBpZiBlbXB0eVxuICAgICAgICBpZiAoIWxpbmUud2lkdGgpIGxpbmVzLnBvcCgpO1xuXG4gICAgICAgIHBvcHVsYXRlQnVmZmVycyhsaW5lcyk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcG9wdWxhdGVCdWZmZXJzKGxpbmVzKSB7XG4gICAgICAgIGNvbnN0IHRleFcgPSBmb250LmNvbW1vbi5zY2FsZVc7XG4gICAgICAgIGNvbnN0IHRleEggPSBmb250LmNvbW1vbi5zY2FsZUg7XG5cbiAgICAgICAgLy8gRm9yIGFsbCBmb250cyB0ZXN0ZWQsIGEgbGl0dGxlIG9mZnNldCB3YXMgbmVlZGVkIHRvIGJlIHJpZ2h0IG9uIHRoZSBiYXNlbGluZSwgaGVuY2UgMC4wNy5cbiAgICAgICAgbGV0IHkgPSAwLjA3ICogc2l6ZTtcbiAgICAgICAgbGV0IGogPSAwO1xuXG4gICAgICAgIGZvciAobGV0IGxpbmVJbmRleCA9IDA7IGxpbmVJbmRleCA8IGxpbmVzLmxlbmd0aDsgbGluZUluZGV4KyspIHtcbiAgICAgICAgICAgIGxldCBsaW5lID0gbGluZXNbbGluZUluZGV4XTtcblxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsaW5lLmdseXBocy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGNvbnN0IGdseXBoID0gbGluZS5nbHlwaHNbaV1bMF07XG4gICAgICAgICAgICAgICAgbGV0IHggPSBsaW5lLmdseXBoc1tpXVsxXTtcblxuICAgICAgICAgICAgICAgIGlmIChhbGlnbiA9PT0gJ2NlbnRlcicpIHtcbiAgICAgICAgICAgICAgICAgICAgeCAtPSBsaW5lLndpZHRoICogMC41O1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoYWxpZ24gPT09ICdyaWdodCcpIHtcbiAgICAgICAgICAgICAgICAgICAgeCAtPSBsaW5lLndpZHRoO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIElmIHNwYWNlLCBkb24ndCBhZGQgdG8gZ2VvbWV0cnlcbiAgICAgICAgICAgICAgICBpZiAod2hpdGVzcGFjZS50ZXN0KGdseXBoLmNoYXIpKSBjb250aW51ZTtcblxuICAgICAgICAgICAgICAgIC8vIEFwcGx5IGNoYXIgc3ByaXRlIG9mZnNldHNcbiAgICAgICAgICAgICAgICB4ICs9IGdseXBoLnhvZmZzZXQgKiBzY2FsZTtcbiAgICAgICAgICAgICAgICB5IC09IGdseXBoLnlvZmZzZXQgKiBzY2FsZTtcblxuICAgICAgICAgICAgICAgIC8vIGVhY2ggbGV0dGVyIGlzIGEgcXVhZC4gYXhpcyBib3R0b20gbGVmdFxuICAgICAgICAgICAgICAgIGxldCB3ID0gZ2x5cGgud2lkdGggKiBzY2FsZTtcbiAgICAgICAgICAgICAgICBsZXQgaCA9IGdseXBoLmhlaWdodCAqIHNjYWxlO1xuICAgICAgICAgICAgICAgIGJ1ZmZlcnMucG9zaXRpb24uc2V0KFt4LCB5IC0gaCwgMCwgeCwgeSwgMCwgeCArIHcsIHkgLSBoLCAwLCB4ICsgdywgeSwgMF0sIGogKiA0ICogMyk7XG5cbiAgICAgICAgICAgICAgICBsZXQgdSA9IGdseXBoLnggLyB0ZXhXO1xuICAgICAgICAgICAgICAgIGxldCB1dyA9IGdseXBoLndpZHRoIC8gdGV4VztcbiAgICAgICAgICAgICAgICBsZXQgdiA9IDEuMCAtIGdseXBoLnkgLyB0ZXhIO1xuICAgICAgICAgICAgICAgIGxldCB2aCA9IGdseXBoLmhlaWdodCAvIHRleEg7XG4gICAgICAgICAgICAgICAgYnVmZmVycy51di5zZXQoW3UsIHYgLSB2aCwgdSwgdiwgdSArIHV3LCB2IC0gdmgsIHUgKyB1dywgdl0sIGogKiA0ICogMik7XG5cbiAgICAgICAgICAgICAgICAvLyBSZXNldCBjdXJzb3IgdG8gYmFzZWxpbmVcbiAgICAgICAgICAgICAgICB5ICs9IGdseXBoLnlvZmZzZXQgKiBzY2FsZTtcblxuICAgICAgICAgICAgICAgIGorKztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgeSAtPSBzaXplICogbGluZUhlaWdodDtcbiAgICAgICAgfVxuXG4gICAgICAgIF90aGlzLmJ1ZmZlcnMgPSBidWZmZXJzO1xuICAgICAgICBfdGhpcy5udW1MaW5lcyA9IGxpbmVzLmxlbmd0aDtcbiAgICAgICAgX3RoaXMuaGVpZ2h0ID0gX3RoaXMubnVtTGluZXMgKiBzaXplICogbGluZUhlaWdodDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRLZXJuUGFpck9mZnNldChpZDEsIGlkMikge1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGZvbnQua2VybmluZ3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGxldCBrID0gZm9udC5rZXJuaW5nc1tpXTtcbiAgICAgICAgICAgIGlmIChrLmZpcnN0IDwgaWQxKSBjb250aW51ZTtcbiAgICAgICAgICAgIGlmIChrLnNlY29uZCA8IGlkMikgY29udGludWU7XG4gICAgICAgICAgICBpZiAoay5maXJzdCA+IGlkMSkgcmV0dXJuIDA7XG4gICAgICAgICAgICBpZiAoay5maXJzdCA9PT0gaWQxICYmIGsuc2Vjb25kID4gaWQyKSByZXR1cm4gMDtcbiAgICAgICAgICAgIHJldHVybiBrLmFtb3VudDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gMDtcbiAgICB9XG5cbiAgICAvLyBVcGRhdGUgYnVmZmVycyB0byBsYXlvdXQgd2l0aCBuZXcgbGF5b3V0XG4gICAgdGhpcy5yZXNpemUgPSBmdW5jdGlvbiAob3B0aW9ucykge1xuICAgICAgICAoeyB3aWR0aCB9ID0gb3B0aW9ucyk7XG4gICAgICAgIGxheW91dCgpO1xuICAgIH07XG5cbiAgICAvLyBDb21wbGV0ZWx5IGNoYW5nZSB0ZXh0IChsaWtlIGNyZWF0aW5nIG5ldyBUZXh0KVxuICAgIHRoaXMudXBkYXRlID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgICAgICAgKHsgdGV4dCB9ID0gb3B0aW9ucyk7XG4gICAgICAgIGNyZWF0ZUdlb21ldHJ5KCk7XG4gICAgfTtcbn1cbiIsImltcG9ydCB7IFRleHR1cmUgfSBmcm9tICcuLi9jb3JlL1RleHR1cmUuanMnO1xuaW1wb3J0IHsgS1RYVGV4dHVyZSB9IGZyb20gJy4vS1RYVGV4dHVyZS5qcyc7XG5cbi8vIEZvciBjb21wcmVzc2VkIHRleHR1cmVzLCBnZW5lcmF0ZSB1c2luZyBodHRwczovL2dpdGh1Yi5jb20vVGltdmFuU2NoZXJwZW56ZWVsL3RleHR1cmUtY29tcHJlc3NvclxuXG5sZXQgY2FjaGUgPSB7fTtcbmNvbnN0IHN1cHBvcnRlZEV4dGVuc2lvbnMgPSBbXTtcblxuZXhwb3J0IGNsYXNzIFRleHR1cmVMb2FkZXIge1xuICAgIHN0YXRpYyBsb2FkKFxuICAgICAgICBnbCxcbiAgICAgICAge1xuICAgICAgICAgICAgc3JjLCAvLyBzdHJpbmcgb3Igb2JqZWN0IG9mIGV4dGVuc2lvbjpzcmMga2V5LXZhbHVlc1xuICAgICAgICAgICAgLy8ge1xuICAgICAgICAgICAgLy8gICAgIHB2cnRjOiAnLi4ua3R4JyxcbiAgICAgICAgICAgIC8vICAgICBzM3RjOiAnLi4ua3R4JyxcbiAgICAgICAgICAgIC8vICAgICBldGM6ICcuLi5rdHgnLFxuICAgICAgICAgICAgLy8gICAgIGV0YzE6ICcuLi5rdHgnLFxuICAgICAgICAgICAgLy8gICAgIGFzdGM6ICcuLi5rdHgnLFxuICAgICAgICAgICAgLy8gICAgIHdlYnA6ICcuLi53ZWJwJyxcbiAgICAgICAgICAgIC8vICAgICBqcGc6ICcuLi5qcGcnLFxuICAgICAgICAgICAgLy8gICAgIHBuZzogJy4uLnBuZycsXG4gICAgICAgICAgICAvLyB9XG5cbiAgICAgICAgICAgIC8vIE9ubHkgcHJvcHMgcmVsZXZhbnQgdG8gS1RYVGV4dHVyZVxuICAgICAgICAgICAgd3JhcFMgPSBnbC5DTEFNUF9UT19FREdFLFxuICAgICAgICAgICAgd3JhcFQgPSBnbC5DTEFNUF9UT19FREdFLFxuICAgICAgICAgICAgYW5pc290cm9weSA9IDAsXG5cbiAgICAgICAgICAgIC8vIEZvciByZWd1bGFyIGltYWdlc1xuICAgICAgICAgICAgZm9ybWF0ID0gZ2wuUkdCQSxcbiAgICAgICAgICAgIGludGVybmFsRm9ybWF0ID0gZm9ybWF0LFxuICAgICAgICAgICAgZ2VuZXJhdGVNaXBtYXBzID0gdHJ1ZSxcbiAgICAgICAgICAgIG1pbkZpbHRlciA9IGdlbmVyYXRlTWlwbWFwcyA/IGdsLk5FQVJFU1RfTUlQTUFQX0xJTkVBUiA6IGdsLkxJTkVBUixcbiAgICAgICAgICAgIG1hZ0ZpbHRlciA9IGdsLkxJTkVBUixcbiAgICAgICAgICAgIHByZW11bHRpcGx5QWxwaGEgPSBmYWxzZSxcbiAgICAgICAgICAgIHVucGFja0FsaWdubWVudCA9IDQsXG4gICAgICAgICAgICBmbGlwWSA9IHRydWUsXG4gICAgICAgIH0gPSB7fVxuICAgICkge1xuICAgICAgICBjb25zdCBzdXBwb3J0ID0gdGhpcy5nZXRTdXBwb3J0ZWRFeHRlbnNpb25zKGdsKTtcbiAgICAgICAgbGV0IGV4dCA9ICdub25lJztcblxuICAgICAgICAvLyBJZiBzcmMgaXMgc3RyaW5nLCBkZXRlcm1pbmUgd2hpY2ggZm9ybWF0IGZyb20gdGhlIGV4dGVuc2lvblxuICAgICAgICBpZiAodHlwZW9mIHNyYyA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIGV4dCA9IHNyYy5zcGxpdCgnLicpLnBvcCgpLnNwbGl0KCc/JylbMF0udG9Mb3dlckNhc2UoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIElmIHNyYyBpcyBvYmplY3QsIHVzZSBzdXBwb3J0ZWQgZXh0ZW5zaW9ucyBhbmQgcHJvdmlkZWQgbGlzdCB0byBjaG9vc2UgYmVzdCBvcHRpb25cbiAgICAgICAgLy8gR2V0IGZpcnN0IHN1cHBvcnRlZCBtYXRjaCwgc28gcHV0IGluIG9yZGVyIG9mIHByZWZlcmVuY2VcbiAgICAgICAgaWYgKHR5cGVvZiBzcmMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IHByb3AgaW4gc3JjKSB7XG4gICAgICAgICAgICAgICAgaWYgKHN1cHBvcnQuaW5jbHVkZXMocHJvcC50b0xvd2VyQ2FzZSgpKSkge1xuICAgICAgICAgICAgICAgICAgICBleHQgPSBwcm9wLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgICAgICAgICAgICAgIHNyYyA9IHNyY1twcm9wXTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gU3RyaW5naWZ5IHByb3BzXG4gICAgICAgIGNvbnN0IGNhY2hlSUQgPVxuICAgICAgICAgICAgc3JjICtcbiAgICAgICAgICAgIHdyYXBTICtcbiAgICAgICAgICAgIHdyYXBUICtcbiAgICAgICAgICAgIGFuaXNvdHJvcHkgK1xuICAgICAgICAgICAgZm9ybWF0ICtcbiAgICAgICAgICAgIGludGVybmFsRm9ybWF0ICtcbiAgICAgICAgICAgIGdlbmVyYXRlTWlwbWFwcyArXG4gICAgICAgICAgICBtaW5GaWx0ZXIgK1xuICAgICAgICAgICAgbWFnRmlsdGVyICtcbiAgICAgICAgICAgIHByZW11bHRpcGx5QWxwaGEgK1xuICAgICAgICAgICAgdW5wYWNrQWxpZ25tZW50ICtcbiAgICAgICAgICAgIGZsaXBZICtcbiAgICAgICAgICAgIGdsLnJlbmRlcmVyLmlkO1xuXG4gICAgICAgIC8vIENoZWNrIGNhY2hlIGZvciBleGlzdGluZyB0ZXh0dXJlXG4gICAgICAgIGlmIChjYWNoZVtjYWNoZUlEXSkgcmV0dXJuIGNhY2hlW2NhY2hlSURdO1xuXG4gICAgICAgIGxldCB0ZXh0dXJlO1xuICAgICAgICBzd2l0Y2ggKGV4dCkge1xuICAgICAgICAgICAgY2FzZSAna3R4JzpcbiAgICAgICAgICAgIGNhc2UgJ3B2cnRjJzpcbiAgICAgICAgICAgIGNhc2UgJ3MzdGMnOlxuICAgICAgICAgICAgY2FzZSAnZXRjJzpcbiAgICAgICAgICAgIGNhc2UgJ2V0YzEnOlxuICAgICAgICAgICAgY2FzZSAnYXN0Yyc6XG4gICAgICAgICAgICAgICAgLy8gTG9hZCBjb21wcmVzc2VkIHRleHR1cmUgdXNpbmcgS1RYIGZvcm1hdFxuICAgICAgICAgICAgICAgIHRleHR1cmUgPSBuZXcgS1RYVGV4dHVyZShnbCwge1xuICAgICAgICAgICAgICAgICAgICBzcmMsXG4gICAgICAgICAgICAgICAgICAgIHdyYXBTLFxuICAgICAgICAgICAgICAgICAgICB3cmFwVCxcbiAgICAgICAgICAgICAgICAgICAgYW5pc290cm9weSxcbiAgICAgICAgICAgICAgICAgICAgbWluRmlsdGVyLFxuICAgICAgICAgICAgICAgICAgICBtYWdGaWx0ZXIsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgdGV4dHVyZS5sb2FkZWQgPSB0aGlzLmxvYWRLVFgoc3JjLCB0ZXh0dXJlKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ3dlYnAnOlxuICAgICAgICAgICAgY2FzZSAnanBnJzpcbiAgICAgICAgICAgIGNhc2UgJ2pwZWcnOlxuICAgICAgICAgICAgY2FzZSAncG5nJzpcbiAgICAgICAgICAgICAgICB0ZXh0dXJlID0gbmV3IFRleHR1cmUoZ2wsIHtcbiAgICAgICAgICAgICAgICAgICAgd3JhcFMsXG4gICAgICAgICAgICAgICAgICAgIHdyYXBULFxuICAgICAgICAgICAgICAgICAgICBhbmlzb3Ryb3B5LFxuICAgICAgICAgICAgICAgICAgICBmb3JtYXQsXG4gICAgICAgICAgICAgICAgICAgIGludGVybmFsRm9ybWF0LFxuICAgICAgICAgICAgICAgICAgICBnZW5lcmF0ZU1pcG1hcHMsXG4gICAgICAgICAgICAgICAgICAgIG1pbkZpbHRlcixcbiAgICAgICAgICAgICAgICAgICAgbWFnRmlsdGVyLFxuICAgICAgICAgICAgICAgICAgICBwcmVtdWx0aXBseUFscGhhLFxuICAgICAgICAgICAgICAgICAgICB1bnBhY2tBbGlnbm1lbnQsXG4gICAgICAgICAgICAgICAgICAgIGZsaXBZLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHRleHR1cmUubG9hZGVkID0gdGhpcy5sb2FkSW1hZ2UoZ2wsIHNyYywgdGV4dHVyZSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignTm8gc3VwcG9ydGVkIGZvcm1hdCBzdXBwbGllZCcpO1xuICAgICAgICAgICAgICAgIHRleHR1cmUgPSBuZXcgVGV4dHVyZShnbCk7XG4gICAgICAgIH1cblxuICAgICAgICB0ZXh0dXJlLmV4dCA9IGV4dDtcbiAgICAgICAgY2FjaGVbY2FjaGVJRF0gPSB0ZXh0dXJlO1xuICAgICAgICByZXR1cm4gdGV4dHVyZTtcbiAgICB9XG5cbiAgICBzdGF0aWMgZ2V0U3VwcG9ydGVkRXh0ZW5zaW9ucyhnbCkge1xuICAgICAgICBpZiAoc3VwcG9ydGVkRXh0ZW5zaW9ucy5sZW5ndGgpIHJldHVybiBzdXBwb3J0ZWRFeHRlbnNpb25zO1xuXG4gICAgICAgIGNvbnN0IGV4dGVuc2lvbnMgPSB7XG4gICAgICAgICAgICBwdnJ0YzogZ2wucmVuZGVyZXIuZ2V0RXh0ZW5zaW9uKCdXRUJHTF9jb21wcmVzc2VkX3RleHR1cmVfcHZydGMnKSB8fCBnbC5yZW5kZXJlci5nZXRFeHRlbnNpb24oJ1dFQktJVF9XRUJHTF9jb21wcmVzc2VkX3RleHR1cmVfcHZydGMnKSxcbiAgICAgICAgICAgIHMzdGM6XG4gICAgICAgICAgICAgICAgZ2wucmVuZGVyZXIuZ2V0RXh0ZW5zaW9uKCdXRUJHTF9jb21wcmVzc2VkX3RleHR1cmVfczN0YycpIHx8XG4gICAgICAgICAgICAgICAgZ2wucmVuZGVyZXIuZ2V0RXh0ZW5zaW9uKCdNT1pfV0VCR0xfY29tcHJlc3NlZF90ZXh0dXJlX3MzdGMnKSB8fFxuICAgICAgICAgICAgICAgIGdsLnJlbmRlcmVyLmdldEV4dGVuc2lvbignV0VCS0lUX1dFQkdMX2NvbXByZXNzZWRfdGV4dHVyZV9zM3RjJyksXG4gICAgICAgICAgICBldGM6IGdsLnJlbmRlcmVyLmdldEV4dGVuc2lvbignV0VCR0xfY29tcHJlc3NlZF90ZXh0dXJlX2V0YycpLFxuICAgICAgICAgICAgZXRjMTogZ2wucmVuZGVyZXIuZ2V0RXh0ZW5zaW9uKCdXRUJHTF9jb21wcmVzc2VkX3RleHR1cmVfZXRjMScpLFxuICAgICAgICAgICAgYXN0YzogZ2wucmVuZGVyZXIuZ2V0RXh0ZW5zaW9uKCdXRUJHTF9jb21wcmVzc2VkX3RleHR1cmVfYXN0YycpLFxuICAgICAgICB9O1xuXG4gICAgICAgIGZvciAoY29uc3QgZXh0IGluIGV4dGVuc2lvbnMpIGlmIChleHRlbnNpb25zW2V4dF0pIHN1cHBvcnRlZEV4dGVuc2lvbnMucHVzaChleHQpO1xuXG4gICAgICAgIC8vIENoZWNrIGZvciBXZWJQIHN1cHBvcnRcbiAgICAgICAgaWYgKGRldGVjdFdlYlApIHN1cHBvcnRlZEV4dGVuc2lvbnMucHVzaCgnd2VicCcpO1xuXG4gICAgICAgIC8vIEZvcm1hdHMgc3VwcG9ydGVkIGJ5IGFsbFxuICAgICAgICBzdXBwb3J0ZWRFeHRlbnNpb25zLnB1c2goJ3BuZycsICdqcGcnKTtcblxuICAgICAgICByZXR1cm4gc3VwcG9ydGVkRXh0ZW5zaW9ucztcbiAgICB9XG5cbiAgICBzdGF0aWMgbG9hZEtUWChzcmMsIHRleHR1cmUpIHtcbiAgICAgICAgcmV0dXJuIGZldGNoKHNyYylcbiAgICAgICAgICAgIC50aGVuKChyZXMpID0+IHJlcy5hcnJheUJ1ZmZlcigpKVxuICAgICAgICAgICAgLnRoZW4oKGJ1ZmZlcikgPT4gdGV4dHVyZS5wYXJzZUJ1ZmZlcihidWZmZXIpKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgbG9hZEltYWdlKGdsLCBzcmMsIHRleHR1cmUpIHtcbiAgICAgICAgcmV0dXJuIGRlY29kZUltYWdlKHNyYykudGhlbigoaW1nQm1wKSA9PiB7XG4gICAgICAgICAgICAvLyBDYXRjaCBub24gUE9UIHRleHR1cmVzIGFuZCB1cGRhdGUgcGFyYW1zIHRvIGF2b2lkIGVycm9yc1xuICAgICAgICAgICAgaWYgKCFwb3dlck9mVHdvKGltZ0JtcC53aWR0aCkgfHwgIXBvd2VyT2ZUd28oaW1nQm1wLmhlaWdodCkpIHtcbiAgICAgICAgICAgICAgICBpZiAodGV4dHVyZS5nZW5lcmF0ZU1pcG1hcHMpIHRleHR1cmUuZ2VuZXJhdGVNaXBtYXBzID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgaWYgKHRleHR1cmUubWluRmlsdGVyID09PSBnbC5ORUFSRVNUX01JUE1BUF9MSU5FQVIpIHRleHR1cmUubWluRmlsdGVyID0gZ2wuTElORUFSO1xuICAgICAgICAgICAgICAgIGlmICh0ZXh0dXJlLndyYXBTID09PSBnbC5SRVBFQVQpIHRleHR1cmUud3JhcFMgPSB0ZXh0dXJlLndyYXBUID0gZ2wuQ0xBTVBfVE9fRURHRTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGV4dHVyZS5pbWFnZSA9IGltZ0JtcDtcblxuICAgICAgICAgICAgLy8gRm9yIGNyZWF0ZUltYWdlQml0bWFwLCBjbG9zZSBvbmNlIHVwbG9hZGVkXG4gICAgICAgICAgICB0ZXh0dXJlLm9uVXBkYXRlID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChpbWdCbXAuY2xvc2UpIGltZ0JtcC5jbG9zZSgpO1xuICAgICAgICAgICAgICAgIHRleHR1cmUub25VcGRhdGUgPSBudWxsO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgcmV0dXJuIGltZ0JtcDtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgc3RhdGljIGNsZWFyQ2FjaGUoKSB7XG4gICAgICAgIGNhY2hlID0ge307XG4gICAgfVxufVxuXG5mdW5jdGlvbiBkZXRlY3RXZWJQKCkge1xuICAgIHJldHVybiBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKS50b0RhdGFVUkwoJ2ltYWdlL3dlYnAnKS5pbmRleE9mKCdkYXRhOmltYWdlL3dlYnAnKSA9PSAwO1xufVxuXG5mdW5jdGlvbiBwb3dlck9mVHdvKHZhbHVlKSB7XG4gICAgcmV0dXJuIE1hdGgubG9nMih2YWx1ZSkgJSAxID09PSAwO1xufVxuXG5mdW5jdGlvbiBkZWNvZGVJbWFnZShzcmMpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgY29uc3QgaW1nID0gbmV3IEltYWdlKCk7XG4gICAgICAgIGltZy5jcm9zc09yaWdpbiA9ICcnO1xuICAgICAgICBpbWcuc3JjID0gc3JjO1xuXG4gICAgICAgIC8vIE9ubHkgY2hyb21lJ3MgaW1wbGVtZW50YXRpb24gb2YgY3JlYXRlSW1hZ2VCaXRtYXAgaXMgZnVsbHkgc3VwcG9ydGVkXG4gICAgICAgIGNvbnN0IGlzQ2hyb21lID0gbmF2aWdhdG9yLnVzZXJBZ2VudC50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKCdjaHJvbWUnKTtcbiAgICAgICAgaWYgKCEhd2luZG93LmNyZWF0ZUltYWdlQml0bWFwICYmIGlzQ2hyb21lKSB7XG4gICAgICAgICAgICBpbWcub25sb2FkID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgIGNyZWF0ZUltYWdlQml0bWFwKGltZywge1xuICAgICAgICAgICAgICAgICAgICBpbWFnZU9yaWVudGF0aW9uOiAnZmxpcFknLFxuICAgICAgICAgICAgICAgICAgICBwcmVtdWx0aXBseUFscGhhOiAnbm9uZScsXG4gICAgICAgICAgICAgICAgfSkudGhlbigoaW1nQm1wKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoaW1nQm1wKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpbWcub25sb2FkID0gKCkgPT4gcmVzb2x2ZShpbWcpO1xuICAgICAgICB9XG4gICAgfSk7XG59XG4iLCIvLyBodHRwczovL2dpdGh1Yi5jb20vbXJkb29iL3RocmVlLmpzL2Jsb2IvbWFzdGVyL3NyYy9nZW9tZXRyaWVzL1RvcnVzR2VvbWV0cnkuanNcblxuaW1wb3J0IHsgR2VvbWV0cnkgfSBmcm9tICcuLi9jb3JlL0dlb21ldHJ5LmpzJztcbmltcG9ydCB7IFZlYzMgfSBmcm9tICcuLi9tYXRoL1ZlYzMuanMnO1xuXG5leHBvcnQgY2xhc3MgVG9ydXMgZXh0ZW5kcyBHZW9tZXRyeSB7XG4gICAgY29uc3RydWN0b3IoZ2wsIHsgcmFkaXVzID0gMC41LCB0dWJlID0gMC4yLCByYWRpYWxTZWdtZW50cyA9IDgsIHR1YnVsYXJTZWdtZW50cyA9IDYsIGFyYyA9IE1hdGguUEkgKiAyLCBhdHRyaWJ1dGVzID0ge30gfSA9IHt9KSB7XG4gICAgICAgIGNvbnN0IG51bSA9IChyYWRpYWxTZWdtZW50cyArIDEpICogKHR1YnVsYXJTZWdtZW50cyArIDEpO1xuICAgICAgICBjb25zdCBudW1JbmRpY2VzID0gcmFkaWFsU2VnbWVudHMgKiB0dWJ1bGFyU2VnbWVudHMgKiA2O1xuXG4gICAgICAgIGNvbnN0IHZlcnRpY2VzID0gbmV3IEZsb2F0MzJBcnJheShudW0gKiAzKTtcbiAgICAgICAgY29uc3Qgbm9ybWFscyA9IG5ldyBGbG9hdDMyQXJyYXkobnVtICogMyk7XG4gICAgICAgIGNvbnN0IHV2cyA9IG5ldyBGbG9hdDMyQXJyYXkobnVtICogMik7XG4gICAgICAgIGNvbnN0IGluZGljZXMgPSBudW0gPiA2NTUzNiA/IG5ldyBVaW50MzJBcnJheShudW1JbmRpY2VzKSA6IG5ldyBVaW50MTZBcnJheShudW1JbmRpY2VzKTtcblxuICAgICAgICBjb25zdCBjZW50ZXIgPSBuZXcgVmVjMygpO1xuICAgICAgICBjb25zdCB2ZXJ0ZXggPSBuZXcgVmVjMygpO1xuICAgICAgICBjb25zdCBub3JtYWwgPSBuZXcgVmVjMygpO1xuXG4gICAgICAgIC8vIGdlbmVyYXRlIHZlcnRpY2VzLCBub3JtYWxzIGFuZCB1dnNcbiAgICAgICAgbGV0IGlkeCA9IDA7XG4gICAgICAgIGZvciAobGV0IGogPSAwOyBqIDw9IHJhZGlhbFNlZ21lbnRzOyBqKyspIHtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDw9IHR1YnVsYXJTZWdtZW50czsgaSsrLCBpZHgrKykge1xuICAgICAgICAgICAgICAgIGNvbnN0IHUgPSAoaSAvIHR1YnVsYXJTZWdtZW50cykgKiBhcmM7XG4gICAgICAgICAgICAgICAgY29uc3QgdiA9IChqIC8gcmFkaWFsU2VnbWVudHMpICogTWF0aC5QSSAqIDI7XG5cbiAgICAgICAgICAgICAgICAvLyB2ZXJ0ZXhcbiAgICAgICAgICAgICAgICB2ZXJ0ZXgueCA9IChyYWRpdXMgKyB0dWJlICogTWF0aC5jb3ModikpICogTWF0aC5jb3ModSk7XG4gICAgICAgICAgICAgICAgdmVydGV4LnkgPSAocmFkaXVzICsgdHViZSAqIE1hdGguY29zKHYpKSAqIE1hdGguc2luKHUpO1xuICAgICAgICAgICAgICAgIHZlcnRleC56ID0gdHViZSAqIE1hdGguc2luKHYpO1xuXG4gICAgICAgICAgICAgICAgdmVydGljZXMuc2V0KFt2ZXJ0ZXgueCwgdmVydGV4LnksIHZlcnRleC56XSwgaWR4ICogMyk7XG5cbiAgICAgICAgICAgICAgICAvLyBub3JtYWxcbiAgICAgICAgICAgICAgICBjZW50ZXIueCA9IHJhZGl1cyAqIE1hdGguY29zKHUpO1xuICAgICAgICAgICAgICAgIGNlbnRlci55ID0gcmFkaXVzICogTWF0aC5zaW4odSk7XG4gICAgICAgICAgICAgICAgbm9ybWFsLnN1Yih2ZXJ0ZXgsIGNlbnRlcikubm9ybWFsaXplKCk7XG5cbiAgICAgICAgICAgICAgICBub3JtYWxzLnNldChbbm9ybWFsLngsIG5vcm1hbC55LCBub3JtYWwuel0sIGlkeCAqIDMpO1xuXG4gICAgICAgICAgICAgICAgLy8gdXZcbiAgICAgICAgICAgICAgICB1dnMuc2V0KFtpIC8gdHVidWxhclNlZ21lbnRzLCBqIC8gcmFkaWFsU2VnbWVudHNdLCBpZHggKiAyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGdlbmVyYXRlIGluZGljZXNcbiAgICAgICAgaWR4ID0gMDtcbiAgICAgICAgZm9yIChsZXQgaiA9IDE7IGogPD0gcmFkaWFsU2VnbWVudHM7IGorKykge1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDE7IGkgPD0gdHVidWxhclNlZ21lbnRzOyBpKyssIGlkeCsrKSB7XG4gICAgICAgICAgICAgICAgLy8gaW5kaWNlc1xuICAgICAgICAgICAgICAgIGNvbnN0IGEgPSAodHVidWxhclNlZ21lbnRzICsgMSkgKiBqICsgaSAtIDE7XG4gICAgICAgICAgICAgICAgY29uc3QgYiA9ICh0dWJ1bGFyU2VnbWVudHMgKyAxKSAqIChqIC0gMSkgKyBpIC0gMTtcbiAgICAgICAgICAgICAgICBjb25zdCBjID0gKHR1YnVsYXJTZWdtZW50cyArIDEpICogKGogLSAxKSArIGk7XG4gICAgICAgICAgICAgICAgY29uc3QgZCA9ICh0dWJ1bGFyU2VnbWVudHMgKyAxKSAqIGogKyBpO1xuXG4gICAgICAgICAgICAgICAgLy8gZmFjZXNcbiAgICAgICAgICAgICAgICBpbmRpY2VzLnNldChbYSwgYiwgZCwgYiwgYywgZF0sIGlkeCAqIDYpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgT2JqZWN0LmFzc2lnbihhdHRyaWJ1dGVzLCB7XG4gICAgICAgICAgICBwb3NpdGlvbjogeyBzaXplOiAzLCBkYXRhOiB2ZXJ0aWNlcyB9LFxuICAgICAgICAgICAgbm9ybWFsOiB7IHNpemU6IDMsIGRhdGE6IG5vcm1hbHMgfSxcbiAgICAgICAgICAgIHV2OiB7IHNpemU6IDIsIGRhdGE6IHV2cyB9LFxuICAgICAgICAgICAgaW5kZXg6IHsgZGF0YTogaW5kaWNlcyB9LFxuICAgICAgICB9KTtcblxuICAgICAgICBzdXBlcihnbCwgYXR0cmlidXRlcyk7XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgR2VvbWV0cnkgfSBmcm9tICcuLi9jb3JlL0dlb21ldHJ5LmpzJztcblxuZXhwb3J0IGNsYXNzIFRyaWFuZ2xlIGV4dGVuZHMgR2VvbWV0cnkge1xuICAgIGNvbnN0cnVjdG9yKGdsLCB7IGF0dHJpYnV0ZXMgPSB7fSB9ID0ge30pIHtcbiAgICAgICAgT2JqZWN0LmFzc2lnbihhdHRyaWJ1dGVzLCB7XG4gICAgICAgICAgICBwb3NpdGlvbjogeyBzaXplOiAyLCBkYXRhOiBuZXcgRmxvYXQzMkFycmF5KFstMSwgLTEsIDMsIC0xLCAtMSwgM10pIH0sXG4gICAgICAgICAgICB1djogeyBzaXplOiAyLCBkYXRhOiBuZXcgRmxvYXQzMkFycmF5KFswLCAwLCAyLCAwLCAwLCAyXSkgfSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgc3VwZXIoZ2wsIGF0dHJpYnV0ZXMpO1xuICAgIH1cbn1cbiIsImltcG9ydCAqIGFzIENvbG9yRnVuYyBmcm9tICcuL2Z1bmN0aW9ucy9Db2xvckZ1bmMuanMnO1xuXG4vLyBDb2xvciBzdG9yZWQgYXMgYW4gYXJyYXkgb2YgUkdCIGRlY2ltYWwgdmFsdWVzIChiZXR3ZWVuIDAgPiAxKVxuLy8gQ29uc3RydWN0b3IgYW5kIHNldCBtZXRob2QgYWNjZXB0IGZvbGxvd2luZyBmb3JtYXRzOlxuLy8gbmV3IENvbG9yKCkgLSBFbXB0eSAoZGVmYXVsdHMgdG8gYmxhY2spXG4vLyBuZXcgQ29sb3IoWzAuMiwgMC40LCAxLjBdKSAtIERlY2ltYWwgQXJyYXkgKG9yIGFub3RoZXIgQ29sb3IgaW5zdGFuY2UpXG4vLyBuZXcgQ29sb3IoMC43LCAwLjAsIDAuMSkgLSBEZWNpbWFsIFJHQiB2YWx1ZXNcbi8vIG5ldyBDb2xvcignI2ZmMDAwMCcpIC0gSGV4IHN0cmluZ1xuLy8gbmV3IENvbG9yKCcjY2NjJykgLSBTaG9ydC1oYW5kIEhleCBzdHJpbmdcbi8vIG5ldyBDb2xvcigweDRmMjdlOCkgLSBOdW1iZXJcbi8vIG5ldyBDb2xvcigncmVkJykgLSBDb2xvciBuYW1lIHN0cmluZyAoc2hvcnQgbGlzdCBpbiBDb2xvckZ1bmMuanMpXG5cbmV4cG9ydCBjbGFzcyBDb2xvciBleHRlbmRzIEFycmF5IHtcbiAgICBjb25zdHJ1Y3Rvcihjb2xvcikge1xuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShjb2xvcikpIHJldHVybiBzdXBlciguLi5jb2xvcik7XG4gICAgICAgIHJldHVybiBzdXBlciguLi5Db2xvckZ1bmMucGFyc2VDb2xvciguLi5hcmd1bWVudHMpKTtcbiAgICB9XG5cbiAgICBnZXQgcigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXNbMF07XG4gICAgfVxuXG4gICAgZ2V0IGcoKSB7XG4gICAgICAgIHJldHVybiB0aGlzWzFdO1xuICAgIH1cblxuICAgIGdldCBiKCkge1xuICAgICAgICByZXR1cm4gdGhpc1syXTtcbiAgICB9XG5cbiAgICBzZXQgcih2KSB7XG4gICAgICAgIHRoaXNbMF0gPSB2O1xuICAgIH1cblxuICAgIHNldCBnKHYpIHtcbiAgICAgICAgdGhpc1sxXSA9IHY7XG4gICAgfVxuXG4gICAgc2V0IGIodikge1xuICAgICAgICB0aGlzWzJdID0gdjtcbiAgICB9XG5cbiAgICBzZXQoY29sb3IpIHtcbiAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkoY29sb3IpKSByZXR1cm4gdGhpcy5jb3B5KGNvbG9yKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29weShDb2xvckZ1bmMucGFyc2VDb2xvciguLi5hcmd1bWVudHMpKTtcbiAgICB9XG5cbiAgICBjb3B5KHYpIHtcbiAgICAgICAgdGhpc1swXSA9IHZbMF07XG4gICAgICAgIHRoaXNbMV0gPSB2WzFdO1xuICAgICAgICB0aGlzWzJdID0gdlsyXTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxufVxuIiwiaW1wb3J0ICogYXMgRXVsZXJGdW5jIGZyb20gJy4vZnVuY3Rpb25zL0V1bGVyRnVuYy5qcyc7XG5pbXBvcnQgeyBNYXQ0IH0gZnJvbSAnLi9NYXQ0LmpzJztcblxuY29uc3QgdG1wTWF0NCA9IG5ldyBNYXQ0KCk7XG5cbmV4cG9ydCBjbGFzcyBFdWxlciBleHRlbmRzIEFycmF5IHtcbiAgICBjb25zdHJ1Y3Rvcih4ID0gMCwgeSA9IHgsIHogPSB4LCBvcmRlciA9ICdZWFonKSB7XG4gICAgICAgIHN1cGVyKHgsIHksIHopO1xuICAgICAgICB0aGlzLm9yZGVyID0gb3JkZXI7XG4gICAgICAgIHRoaXMub25DaGFuZ2UgPSAoKSA9PiB7fTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgZ2V0IHgoKSB7XG4gICAgICAgIHJldHVybiB0aGlzWzBdO1xuICAgIH1cblxuICAgIGdldCB5KCkge1xuICAgICAgICByZXR1cm4gdGhpc1sxXTtcbiAgICB9XG5cbiAgICBnZXQgeigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXNbMl07XG4gICAgfVxuXG4gICAgc2V0IHgodikge1xuICAgICAgICB0aGlzWzBdID0gdjtcbiAgICAgICAgdGhpcy5vbkNoYW5nZSgpO1xuICAgIH1cblxuICAgIHNldCB5KHYpIHtcbiAgICAgICAgdGhpc1sxXSA9IHY7XG4gICAgICAgIHRoaXMub25DaGFuZ2UoKTtcbiAgICB9XG5cbiAgICBzZXQgeih2KSB7XG4gICAgICAgIHRoaXNbMl0gPSB2O1xuICAgICAgICB0aGlzLm9uQ2hhbmdlKCk7XG4gICAgfVxuXG4gICAgc2V0KHgsIHkgPSB4LCB6ID0geCkge1xuICAgICAgICBpZiAoeC5sZW5ndGgpIHJldHVybiB0aGlzLmNvcHkoeCk7XG4gICAgICAgIHRoaXNbMF0gPSB4O1xuICAgICAgICB0aGlzWzFdID0geTtcbiAgICAgICAgdGhpc1syXSA9IHo7XG4gICAgICAgIHRoaXMub25DaGFuZ2UoKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgY29weSh2KSB7XG4gICAgICAgIHRoaXNbMF0gPSB2WzBdO1xuICAgICAgICB0aGlzWzFdID0gdlsxXTtcbiAgICAgICAgdGhpc1syXSA9IHZbMl07XG4gICAgICAgIHRoaXMub25DaGFuZ2UoKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgcmVvcmRlcihvcmRlcikge1xuICAgICAgICB0aGlzLm9yZGVyID0gb3JkZXI7XG4gICAgICAgIHRoaXMub25DaGFuZ2UoKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgZnJvbVJvdGF0aW9uTWF0cml4KG0sIG9yZGVyID0gdGhpcy5vcmRlcikge1xuICAgICAgICBFdWxlckZ1bmMuZnJvbVJvdGF0aW9uTWF0cml4KHRoaXMsIG0sIG9yZGVyKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgZnJvbVF1YXRlcm5pb24ocSwgb3JkZXIgPSB0aGlzLm9yZGVyKSB7XG4gICAgICAgIHRtcE1hdDQuZnJvbVF1YXRlcm5pb24ocSk7XG4gICAgICAgIHJldHVybiB0aGlzLmZyb21Sb3RhdGlvbk1hdHJpeCh0bXBNYXQ0LCBvcmRlcik7XG4gICAgfVxuXG4gICAgdG9BcnJheShhID0gW10sIG8gPSAwKSB7XG4gICAgICAgIGFbb10gPSB0aGlzWzBdO1xuICAgICAgICBhW28gKyAxXSA9IHRoaXNbMV07XG4gICAgICAgIGFbbyArIDJdID0gdGhpc1syXTtcbiAgICAgICAgcmV0dXJuIGE7XG4gICAgfVxufVxuIiwiaW1wb3J0ICogYXMgTWF0M0Z1bmMgZnJvbSAnLi9mdW5jdGlvbnMvTWF0M0Z1bmMuanMnO1xuXG5leHBvcnQgY2xhc3MgTWF0MyBleHRlbmRzIEFycmF5IHtcbiAgICBjb25zdHJ1Y3RvcihtMDAgPSAxLCBtMDEgPSAwLCBtMDIgPSAwLCBtMTAgPSAwLCBtMTEgPSAxLCBtMTIgPSAwLCBtMjAgPSAwLCBtMjEgPSAwLCBtMjIgPSAxKSB7XG4gICAgICAgIHN1cGVyKG0wMCwgbTAxLCBtMDIsIG0xMCwgbTExLCBtMTIsIG0yMCwgbTIxLCBtMjIpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBzZXQobTAwLCBtMDEsIG0wMiwgbTEwLCBtMTEsIG0xMiwgbTIwLCBtMjEsIG0yMikge1xuICAgICAgICBpZiAobTAwLmxlbmd0aCkgcmV0dXJuIHRoaXMuY29weShtMDApO1xuICAgICAgICBNYXQzRnVuYy5zZXQodGhpcywgbTAwLCBtMDEsIG0wMiwgbTEwLCBtMTEsIG0xMiwgbTIwLCBtMjEsIG0yMik7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHRyYW5zbGF0ZSh2LCBtID0gdGhpcykge1xuICAgICAgICBNYXQzRnVuYy50cmFuc2xhdGUodGhpcywgbSwgdik7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHJvdGF0ZSh2LCBtID0gdGhpcykge1xuICAgICAgICBNYXQzRnVuYy5yb3RhdGUodGhpcywgbSwgdik7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHNjYWxlKHYsIG0gPSB0aGlzKSB7XG4gICAgICAgIE1hdDNGdW5jLnNjYWxlKHRoaXMsIG0sIHYpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBtdWx0aXBseShtYSwgbWIpIHtcbiAgICAgICAgaWYgKG1iKSB7XG4gICAgICAgICAgICBNYXQzRnVuYy5tdWx0aXBseSh0aGlzLCBtYSwgbWIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgTWF0M0Z1bmMubXVsdGlwbHkodGhpcywgdGhpcywgbWEpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGlkZW50aXR5KCkge1xuICAgICAgICBNYXQzRnVuYy5pZGVudGl0eSh0aGlzKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgY29weShtKSB7XG4gICAgICAgIE1hdDNGdW5jLmNvcHkodGhpcywgbSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGZyb21NYXRyaXg0KG0pIHtcbiAgICAgICAgTWF0M0Z1bmMuZnJvbU1hdDQodGhpcywgbSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGZyb21RdWF0ZXJuaW9uKHEpIHtcbiAgICAgICAgTWF0M0Z1bmMuZnJvbVF1YXQodGhpcywgcSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGZyb21CYXNpcyh2ZWMzYSwgdmVjM2IsIHZlYzNjKSB7XG4gICAgICAgIHRoaXMuc2V0KHZlYzNhWzBdLCB2ZWMzYVsxXSwgdmVjM2FbMl0sIHZlYzNiWzBdLCB2ZWMzYlsxXSwgdmVjM2JbMl0sIHZlYzNjWzBdLCB2ZWMzY1sxXSwgdmVjM2NbMl0pO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBpbnZlcnNlKG0gPSB0aGlzKSB7XG4gICAgICAgIE1hdDNGdW5jLmludmVydCh0aGlzLCBtKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgZ2V0Tm9ybWFsTWF0cml4KG0pIHtcbiAgICAgICAgTWF0M0Z1bmMubm9ybWFsRnJvbU1hdDQodGhpcywgbSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbn1cbiIsImltcG9ydCAqIGFzIE1hdDRGdW5jIGZyb20gJy4vZnVuY3Rpb25zL01hdDRGdW5jLmpzJztcblxuZXhwb3J0IGNsYXNzIE1hdDQgZXh0ZW5kcyBBcnJheSB7XG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIG0wMCA9IDEsXG4gICAgICAgIG0wMSA9IDAsXG4gICAgICAgIG0wMiA9IDAsXG4gICAgICAgIG0wMyA9IDAsXG4gICAgICAgIG0xMCA9IDAsXG4gICAgICAgIG0xMSA9IDEsXG4gICAgICAgIG0xMiA9IDAsXG4gICAgICAgIG0xMyA9IDAsXG4gICAgICAgIG0yMCA9IDAsXG4gICAgICAgIG0yMSA9IDAsXG4gICAgICAgIG0yMiA9IDEsXG4gICAgICAgIG0yMyA9IDAsXG4gICAgICAgIG0zMCA9IDAsXG4gICAgICAgIG0zMSA9IDAsXG4gICAgICAgIG0zMiA9IDAsXG4gICAgICAgIG0zMyA9IDFcbiAgICApIHtcbiAgICAgICAgc3VwZXIobTAwLCBtMDEsIG0wMiwgbTAzLCBtMTAsIG0xMSwgbTEyLCBtMTMsIG0yMCwgbTIxLCBtMjIsIG0yMywgbTMwLCBtMzEsIG0zMiwgbTMzKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgZ2V0IHgoKSB7XG4gICAgICAgIHJldHVybiB0aGlzWzEyXTtcbiAgICB9XG5cbiAgICBnZXQgeSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXNbMTNdO1xuICAgIH1cblxuICAgIGdldCB6KCkge1xuICAgICAgICByZXR1cm4gdGhpc1sxNF07XG4gICAgfVxuXG4gICAgZ2V0IHcoKSB7XG4gICAgICAgIHJldHVybiB0aGlzWzE1XTtcbiAgICB9XG5cbiAgICBzZXQgeCh2KSB7XG4gICAgICAgIHRoaXNbMTJdID0gdjtcbiAgICB9XG5cbiAgICBzZXQgeSh2KSB7XG4gICAgICAgIHRoaXNbMTNdID0gdjtcbiAgICB9XG5cbiAgICBzZXQgeih2KSB7XG4gICAgICAgIHRoaXNbMTRdID0gdjtcbiAgICB9XG5cbiAgICBzZXQgdyh2KSB7XG4gICAgICAgIHRoaXNbMTVdID0gdjtcbiAgICB9XG5cbiAgICBzZXQobTAwLCBtMDEsIG0wMiwgbTAzLCBtMTAsIG0xMSwgbTEyLCBtMTMsIG0yMCwgbTIxLCBtMjIsIG0yMywgbTMwLCBtMzEsIG0zMiwgbTMzKSB7XG4gICAgICAgIGlmIChtMDAubGVuZ3RoKSByZXR1cm4gdGhpcy5jb3B5KG0wMCk7XG4gICAgICAgIE1hdDRGdW5jLnNldCh0aGlzLCBtMDAsIG0wMSwgbTAyLCBtMDMsIG0xMCwgbTExLCBtMTIsIG0xMywgbTIwLCBtMjEsIG0yMiwgbTIzLCBtMzAsIG0zMSwgbTMyLCBtMzMpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICB0cmFuc2xhdGUodiwgbSA9IHRoaXMpIHtcbiAgICAgICAgTWF0NEZ1bmMudHJhbnNsYXRlKHRoaXMsIG0sIHYpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICByb3RhdGUodiwgYXhpcywgbSA9IHRoaXMpIHtcbiAgICAgICAgTWF0NEZ1bmMucm90YXRlKHRoaXMsIG0sIHYsIGF4aXMpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBzY2FsZSh2LCBtID0gdGhpcykge1xuICAgICAgICBNYXQ0RnVuYy5zY2FsZSh0aGlzLCBtLCB0eXBlb2YgdiA9PT0gJ251bWJlcicgPyBbdiwgdiwgdl0gOiB2KTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgbXVsdGlwbHkobWEsIG1iKSB7XG4gICAgICAgIGlmIChtYikge1xuICAgICAgICAgICAgTWF0NEZ1bmMubXVsdGlwbHkodGhpcywgbWEsIG1iKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIE1hdDRGdW5jLm11bHRpcGx5KHRoaXMsIHRoaXMsIG1hKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBpZGVudGl0eSgpIHtcbiAgICAgICAgTWF0NEZ1bmMuaWRlbnRpdHkodGhpcyk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGNvcHkobSkge1xuICAgICAgICBNYXQ0RnVuYy5jb3B5KHRoaXMsIG0pO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBmcm9tUGVyc3BlY3RpdmVGcnVzdHJ1bSh7IGxlZnQsIHJpZ2h0LCBib3R0b20sIHRvcCwgbmVhciwgZmFyIH0pIHtcbiAgICAgICAgTWF0NEZ1bmMucGVyc3BlY3RpdmVGcnVzdHJ1bSh0aGlzLCBsZWZ0LCByaWdodCwgdG9wLCBib3R0b20sIG5lYXIsIGZhcik7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGZyb21QZXJzcGVjdGl2ZSh7IGZvdiwgYXNwZWN0LCBuZWFyLCBmYXIgfSA9IHt9KSB7XG4gICAgICAgIE1hdDRGdW5jLnBlcnNwZWN0aXZlKHRoaXMsIGZvdiwgYXNwZWN0LCBuZWFyLCBmYXIpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBmcm9tT3J0aG9nb25hbCh7IGxlZnQsIHJpZ2h0LCBib3R0b20sIHRvcCwgbmVhciwgZmFyIH0pIHtcbiAgICAgICAgTWF0NEZ1bmMub3J0aG8odGhpcywgbGVmdCwgcmlnaHQsIGJvdHRvbSwgdG9wLCBuZWFyLCBmYXIpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBmcm9tUXVhdGVybmlvbihxKSB7XG4gICAgICAgIE1hdDRGdW5jLmZyb21RdWF0KHRoaXMsIHEpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBzZXRQb3NpdGlvbih2KSB7XG4gICAgICAgIHRoaXMueCA9IHZbMF07XG4gICAgICAgIHRoaXMueSA9IHZbMV07XG4gICAgICAgIHRoaXMueiA9IHZbMl07XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGludmVyc2UobSA9IHRoaXMpIHtcbiAgICAgICAgTWF0NEZ1bmMuaW52ZXJ0KHRoaXMsIG0pO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBjb21wb3NlKHEsIHBvcywgc2NhbGUpIHtcbiAgICAgICAgTWF0NEZ1bmMuZnJvbVJvdGF0aW9uVHJhbnNsYXRpb25TY2FsZSh0aGlzLCBxLCBwb3MsIHNjYWxlKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgZ2V0Um90YXRpb24ocSkge1xuICAgICAgICBNYXQ0RnVuYy5nZXRSb3RhdGlvbihxLCB0aGlzKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgZ2V0VHJhbnNsYXRpb24ocG9zKSB7XG4gICAgICAgIE1hdDRGdW5jLmdldFRyYW5zbGF0aW9uKHBvcywgdGhpcyk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGdldFNjYWxpbmcoc2NhbGUpIHtcbiAgICAgICAgTWF0NEZ1bmMuZ2V0U2NhbGluZyhzY2FsZSwgdGhpcyk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGdldE1heFNjYWxlT25BeGlzKCkge1xuICAgICAgICByZXR1cm4gTWF0NEZ1bmMuZ2V0TWF4U2NhbGVPbkF4aXModGhpcyk7XG4gICAgfVxuXG4gICAgbG9va0F0KGV5ZSwgdGFyZ2V0LCB1cCkge1xuICAgICAgICBNYXQ0RnVuYy50YXJnZXRUbyh0aGlzLCBleWUsIHRhcmdldCwgdXApO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBkZXRlcm1pbmFudCgpIHtcbiAgICAgICAgcmV0dXJuIE1hdDRGdW5jLmRldGVybWluYW50KHRoaXMpO1xuICAgIH1cblxuICAgIGZyb21BcnJheShhLCBvID0gMCkge1xuICAgICAgICB0aGlzWzBdID0gYVtvXTtcbiAgICAgICAgdGhpc1sxXSA9IGFbbyArIDFdO1xuICAgICAgICB0aGlzWzJdID0gYVtvICsgMl07XG4gICAgICAgIHRoaXNbM10gPSBhW28gKyAzXTtcbiAgICAgICAgdGhpc1s0XSA9IGFbbyArIDRdO1xuICAgICAgICB0aGlzWzVdID0gYVtvICsgNV07XG4gICAgICAgIHRoaXNbNl0gPSBhW28gKyA2XTtcbiAgICAgICAgdGhpc1s3XSA9IGFbbyArIDddO1xuICAgICAgICB0aGlzWzhdID0gYVtvICsgOF07XG4gICAgICAgIHRoaXNbOV0gPSBhW28gKyA5XTtcbiAgICAgICAgdGhpc1sxMF0gPSBhW28gKyAxMF07XG4gICAgICAgIHRoaXNbMTFdID0gYVtvICsgMTFdO1xuICAgICAgICB0aGlzWzEyXSA9IGFbbyArIDEyXTtcbiAgICAgICAgdGhpc1sxM10gPSBhW28gKyAxM107XG4gICAgICAgIHRoaXNbMTRdID0gYVtvICsgMTRdO1xuICAgICAgICB0aGlzWzE1XSA9IGFbbyArIDE1XTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgdG9BcnJheShhID0gW10sIG8gPSAwKSB7XG4gICAgICAgIGFbb10gPSB0aGlzWzBdO1xuICAgICAgICBhW28gKyAxXSA9IHRoaXNbMV07XG4gICAgICAgIGFbbyArIDJdID0gdGhpc1syXTtcbiAgICAgICAgYVtvICsgM10gPSB0aGlzWzNdO1xuICAgICAgICBhW28gKyA0XSA9IHRoaXNbNF07XG4gICAgICAgIGFbbyArIDVdID0gdGhpc1s1XTtcbiAgICAgICAgYVtvICsgNl0gPSB0aGlzWzZdO1xuICAgICAgICBhW28gKyA3XSA9IHRoaXNbN107XG4gICAgICAgIGFbbyArIDhdID0gdGhpc1s4XTtcbiAgICAgICAgYVtvICsgOV0gPSB0aGlzWzldO1xuICAgICAgICBhW28gKyAxMF0gPSB0aGlzWzEwXTtcbiAgICAgICAgYVtvICsgMTFdID0gdGhpc1sxMV07XG4gICAgICAgIGFbbyArIDEyXSA9IHRoaXNbMTJdO1xuICAgICAgICBhW28gKyAxM10gPSB0aGlzWzEzXTtcbiAgICAgICAgYVtvICsgMTRdID0gdGhpc1sxNF07XG4gICAgICAgIGFbbyArIDE1XSA9IHRoaXNbMTVdO1xuICAgICAgICByZXR1cm4gYTtcbiAgICB9XG59XG4iLCJpbXBvcnQgKiBhcyBRdWF0RnVuYyBmcm9tICcuL2Z1bmN0aW9ucy9RdWF0RnVuYy5qcyc7XG5cbmV4cG9ydCBjbGFzcyBRdWF0IGV4dGVuZHMgQXJyYXkge1xuICAgIGNvbnN0cnVjdG9yKHggPSAwLCB5ID0gMCwgeiA9IDAsIHcgPSAxKSB7XG4gICAgICAgIHN1cGVyKHgsIHksIHosIHcpO1xuICAgICAgICB0aGlzLm9uQ2hhbmdlID0gKCkgPT4ge307XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGdldCB4KCkge1xuICAgICAgICByZXR1cm4gdGhpc1swXTtcbiAgICB9XG5cbiAgICBnZXQgeSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXNbMV07XG4gICAgfVxuXG4gICAgZ2V0IHooKSB7XG4gICAgICAgIHJldHVybiB0aGlzWzJdO1xuICAgIH1cblxuICAgIGdldCB3KCkge1xuICAgICAgICByZXR1cm4gdGhpc1szXTtcbiAgICB9XG5cbiAgICBzZXQgeCh2KSB7XG4gICAgICAgIHRoaXNbMF0gPSB2O1xuICAgICAgICB0aGlzLm9uQ2hhbmdlKCk7XG4gICAgfVxuXG4gICAgc2V0IHkodikge1xuICAgICAgICB0aGlzWzFdID0gdjtcbiAgICAgICAgdGhpcy5vbkNoYW5nZSgpO1xuICAgIH1cblxuICAgIHNldCB6KHYpIHtcbiAgICAgICAgdGhpc1syXSA9IHY7XG4gICAgICAgIHRoaXMub25DaGFuZ2UoKTtcbiAgICB9XG5cbiAgICBzZXQgdyh2KSB7XG4gICAgICAgIHRoaXNbM10gPSB2O1xuICAgICAgICB0aGlzLm9uQ2hhbmdlKCk7XG4gICAgfVxuXG4gICAgaWRlbnRpdHkoKSB7XG4gICAgICAgIFF1YXRGdW5jLmlkZW50aXR5KHRoaXMpO1xuICAgICAgICB0aGlzLm9uQ2hhbmdlKCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHNldCh4LCB5LCB6LCB3KSB7XG4gICAgICAgIGlmICh4Lmxlbmd0aCkgcmV0dXJuIHRoaXMuY29weSh4KTtcbiAgICAgICAgUXVhdEZ1bmMuc2V0KHRoaXMsIHgsIHksIHosIHcpO1xuICAgICAgICB0aGlzLm9uQ2hhbmdlKCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHJvdGF0ZVgoYSkge1xuICAgICAgICBRdWF0RnVuYy5yb3RhdGVYKHRoaXMsIHRoaXMsIGEpO1xuICAgICAgICB0aGlzLm9uQ2hhbmdlKCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHJvdGF0ZVkoYSkge1xuICAgICAgICBRdWF0RnVuYy5yb3RhdGVZKHRoaXMsIHRoaXMsIGEpO1xuICAgICAgICB0aGlzLm9uQ2hhbmdlKCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHJvdGF0ZVooYSkge1xuICAgICAgICBRdWF0RnVuYy5yb3RhdGVaKHRoaXMsIHRoaXMsIGEpO1xuICAgICAgICB0aGlzLm9uQ2hhbmdlKCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGludmVyc2UocSA9IHRoaXMpIHtcbiAgICAgICAgUXVhdEZ1bmMuaW52ZXJ0KHRoaXMsIHEpO1xuICAgICAgICB0aGlzLm9uQ2hhbmdlKCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGNvbmp1Z2F0ZShxID0gdGhpcykge1xuICAgICAgICBRdWF0RnVuYy5jb25qdWdhdGUodGhpcywgcSk7XG4gICAgICAgIHRoaXMub25DaGFuZ2UoKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgY29weShxKSB7XG4gICAgICAgIFF1YXRGdW5jLmNvcHkodGhpcywgcSk7XG4gICAgICAgIHRoaXMub25DaGFuZ2UoKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgbm9ybWFsaXplKHEgPSB0aGlzKSB7XG4gICAgICAgIFF1YXRGdW5jLm5vcm1hbGl6ZSh0aGlzLCBxKTtcbiAgICAgICAgdGhpcy5vbkNoYW5nZSgpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBtdWx0aXBseShxQSwgcUIpIHtcbiAgICAgICAgaWYgKHFCKSB7XG4gICAgICAgICAgICBRdWF0RnVuYy5tdWx0aXBseSh0aGlzLCBxQSwgcUIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgUXVhdEZ1bmMubXVsdGlwbHkodGhpcywgdGhpcywgcUEpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMub25DaGFuZ2UoKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgZG90KHYpIHtcbiAgICAgICAgcmV0dXJuIFF1YXRGdW5jLmRvdCh0aGlzLCB2KTtcbiAgICB9XG5cbiAgICBmcm9tTWF0cml4MyhtYXRyaXgzKSB7XG4gICAgICAgIFF1YXRGdW5jLmZyb21NYXQzKHRoaXMsIG1hdHJpeDMpO1xuICAgICAgICB0aGlzLm9uQ2hhbmdlKCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGZyb21FdWxlcihldWxlcikge1xuICAgICAgICBRdWF0RnVuYy5mcm9tRXVsZXIodGhpcywgZXVsZXIsIGV1bGVyLm9yZGVyKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgZnJvbUF4aXNBbmdsZShheGlzLCBhKSB7XG4gICAgICAgIFF1YXRGdW5jLnNldEF4aXNBbmdsZSh0aGlzLCBheGlzLCBhKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgc2xlcnAocSwgdCkge1xuICAgICAgICBRdWF0RnVuYy5zbGVycCh0aGlzLCB0aGlzLCBxLCB0KTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgZnJvbUFycmF5KGEsIG8gPSAwKSB7XG4gICAgICAgIHRoaXNbMF0gPSBhW29dO1xuICAgICAgICB0aGlzWzFdID0gYVtvICsgMV07XG4gICAgICAgIHRoaXNbMl0gPSBhW28gKyAyXTtcbiAgICAgICAgdGhpc1szXSA9IGFbbyArIDNdO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICB0b0FycmF5KGEgPSBbXSwgbyA9IDApIHtcbiAgICAgICAgYVtvXSA9IHRoaXNbMF07XG4gICAgICAgIGFbbyArIDFdID0gdGhpc1sxXTtcbiAgICAgICAgYVtvICsgMl0gPSB0aGlzWzJdO1xuICAgICAgICBhW28gKyAzXSA9IHRoaXNbM107XG4gICAgICAgIHJldHVybiBhO1xuICAgIH1cbn1cbiIsImltcG9ydCAqIGFzIFZlYzJGdW5jIGZyb20gJy4vZnVuY3Rpb25zL1ZlYzJGdW5jLmpzJztcblxuZXhwb3J0IGNsYXNzIFZlYzIgZXh0ZW5kcyBBcnJheSB7XG4gICAgY29uc3RydWN0b3IoeCA9IDAsIHkgPSB4KSB7XG4gICAgICAgIHN1cGVyKHgsIHkpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBnZXQgeCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXNbMF07XG4gICAgfVxuXG4gICAgZ2V0IHkoKSB7XG4gICAgICAgIHJldHVybiB0aGlzWzFdO1xuICAgIH1cblxuICAgIHNldCB4KHYpIHtcbiAgICAgICAgdGhpc1swXSA9IHY7XG4gICAgfVxuXG4gICAgc2V0IHkodikge1xuICAgICAgICB0aGlzWzFdID0gdjtcbiAgICB9XG5cbiAgICBzZXQoeCwgeSA9IHgpIHtcbiAgICAgICAgaWYgKHgubGVuZ3RoKSByZXR1cm4gdGhpcy5jb3B5KHgpO1xuICAgICAgICBWZWMyRnVuYy5zZXQodGhpcywgeCwgeSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGNvcHkodikge1xuICAgICAgICBWZWMyRnVuYy5jb3B5KHRoaXMsIHYpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBhZGQodmEsIHZiKSB7XG4gICAgICAgIGlmICh2YikgVmVjMkZ1bmMuYWRkKHRoaXMsIHZhLCB2Yik7XG4gICAgICAgIGVsc2UgVmVjMkZ1bmMuYWRkKHRoaXMsIHRoaXMsIHZhKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgc3ViKHZhLCB2Yikge1xuICAgICAgICBpZiAodmIpIFZlYzJGdW5jLnN1YnRyYWN0KHRoaXMsIHZhLCB2Yik7XG4gICAgICAgIGVsc2UgVmVjMkZ1bmMuc3VidHJhY3QodGhpcywgdGhpcywgdmEpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBtdWx0aXBseSh2KSB7XG4gICAgICAgIGlmICh2Lmxlbmd0aCkgVmVjMkZ1bmMubXVsdGlwbHkodGhpcywgdGhpcywgdik7XG4gICAgICAgIGVsc2UgVmVjMkZ1bmMuc2NhbGUodGhpcywgdGhpcywgdik7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGRpdmlkZSh2KSB7XG4gICAgICAgIGlmICh2Lmxlbmd0aCkgVmVjMkZ1bmMuZGl2aWRlKHRoaXMsIHRoaXMsIHYpO1xuICAgICAgICBlbHNlIFZlYzJGdW5jLnNjYWxlKHRoaXMsIHRoaXMsIDEgLyB2KTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgaW52ZXJzZSh2ID0gdGhpcykge1xuICAgICAgICBWZWMyRnVuYy5pbnZlcnNlKHRoaXMsIHYpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvLyBDYW4ndCB1c2UgJ2xlbmd0aCcgYXMgQXJyYXkucHJvdG90eXBlIHVzZXMgaXRcbiAgICBsZW4oKSB7XG4gICAgICAgIHJldHVybiBWZWMyRnVuYy5sZW5ndGgodGhpcyk7XG4gICAgfVxuXG4gICAgZGlzdGFuY2Uodikge1xuICAgICAgICBpZiAodikgcmV0dXJuIFZlYzJGdW5jLmRpc3RhbmNlKHRoaXMsIHYpO1xuICAgICAgICBlbHNlIHJldHVybiBWZWMyRnVuYy5sZW5ndGgodGhpcyk7XG4gICAgfVxuXG4gICAgc3F1YXJlZExlbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc3F1YXJlZERpc3RhbmNlKCk7XG4gICAgfVxuXG4gICAgc3F1YXJlZERpc3RhbmNlKHYpIHtcbiAgICAgICAgaWYgKHYpIHJldHVybiBWZWMyRnVuYy5zcXVhcmVkRGlzdGFuY2UodGhpcywgdik7XG4gICAgICAgIGVsc2UgcmV0dXJuIFZlYzJGdW5jLnNxdWFyZWRMZW5ndGgodGhpcyk7XG4gICAgfVxuXG4gICAgbmVnYXRlKHYgPSB0aGlzKSB7XG4gICAgICAgIFZlYzJGdW5jLm5lZ2F0ZSh0aGlzLCB2KTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgY3Jvc3ModmEsIHZiKSB7XG4gICAgICAgIGlmICh2YikgcmV0dXJuIFZlYzJGdW5jLmNyb3NzKHZhLCB2Yik7XG4gICAgICAgIHJldHVybiBWZWMyRnVuYy5jcm9zcyh0aGlzLCB2YSk7XG4gICAgfVxuXG4gICAgc2NhbGUodikge1xuICAgICAgICBWZWMyRnVuYy5zY2FsZSh0aGlzLCB0aGlzLCB2KTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgbm9ybWFsaXplKCkge1xuICAgICAgICBWZWMyRnVuYy5ub3JtYWxpemUodGhpcywgdGhpcyk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGRvdCh2KSB7XG4gICAgICAgIHJldHVybiBWZWMyRnVuYy5kb3QodGhpcywgdik7XG4gICAgfVxuXG4gICAgZXF1YWxzKHYpIHtcbiAgICAgICAgcmV0dXJuIFZlYzJGdW5jLmV4YWN0RXF1YWxzKHRoaXMsIHYpO1xuICAgIH1cblxuICAgIGFwcGx5TWF0cml4MyhtYXQzKSB7XG4gICAgICAgIFZlYzJGdW5jLnRyYW5zZm9ybU1hdDModGhpcywgdGhpcywgbWF0Myk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGFwcGx5TWF0cml4NChtYXQ0KSB7XG4gICAgICAgIFZlYzJGdW5jLnRyYW5zZm9ybU1hdDQodGhpcywgdGhpcywgbWF0NCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGxlcnAodiwgYSkge1xuICAgICAgICBWZWMyRnVuYy5sZXJwKHRoaXMsIHRoaXMsIHYsIGEpO1xuICAgIH1cblxuICAgIGNsb25lKCkge1xuICAgICAgICByZXR1cm4gbmV3IFZlYzIodGhpc1swXSwgdGhpc1sxXSk7XG4gICAgfVxuXG4gICAgZnJvbUFycmF5KGEsIG8gPSAwKSB7XG4gICAgICAgIHRoaXNbMF0gPSBhW29dO1xuICAgICAgICB0aGlzWzFdID0gYVtvICsgMV07XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHRvQXJyYXkoYSA9IFtdLCBvID0gMCkge1xuICAgICAgICBhW29dID0gdGhpc1swXTtcbiAgICAgICAgYVtvICsgMV0gPSB0aGlzWzFdO1xuICAgICAgICByZXR1cm4gYTtcbiAgICB9XG59XG4iLCJpbXBvcnQgKiBhcyBWZWMzRnVuYyBmcm9tICcuL2Z1bmN0aW9ucy9WZWMzRnVuYy5qcyc7XG5cbmV4cG9ydCBjbGFzcyBWZWMzIGV4dGVuZHMgQXJyYXkge1xuICAgIGNvbnN0cnVjdG9yKHggPSAwLCB5ID0geCwgeiA9IHgpIHtcbiAgICAgICAgc3VwZXIoeCwgeSwgeik7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGdldCB4KCkge1xuICAgICAgICByZXR1cm4gdGhpc1swXTtcbiAgICB9XG5cbiAgICBnZXQgeSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXNbMV07XG4gICAgfVxuXG4gICAgZ2V0IHooKSB7XG4gICAgICAgIHJldHVybiB0aGlzWzJdO1xuICAgIH1cblxuICAgIHNldCB4KHYpIHtcbiAgICAgICAgdGhpc1swXSA9IHY7XG4gICAgfVxuXG4gICAgc2V0IHkodikge1xuICAgICAgICB0aGlzWzFdID0gdjtcbiAgICB9XG5cbiAgICBzZXQgeih2KSB7XG4gICAgICAgIHRoaXNbMl0gPSB2O1xuICAgIH1cblxuICAgIHNldCh4LCB5ID0geCwgeiA9IHgpIHtcbiAgICAgICAgaWYgKHgubGVuZ3RoKSByZXR1cm4gdGhpcy5jb3B5KHgpO1xuICAgICAgICBWZWMzRnVuYy5zZXQodGhpcywgeCwgeSwgeik7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGNvcHkodikge1xuICAgICAgICBWZWMzRnVuYy5jb3B5KHRoaXMsIHYpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBhZGQodmEsIHZiKSB7XG4gICAgICAgIGlmICh2YikgVmVjM0Z1bmMuYWRkKHRoaXMsIHZhLCB2Yik7XG4gICAgICAgIGVsc2UgVmVjM0Z1bmMuYWRkKHRoaXMsIHRoaXMsIHZhKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgc3ViKHZhLCB2Yikge1xuICAgICAgICBpZiAodmIpIFZlYzNGdW5jLnN1YnRyYWN0KHRoaXMsIHZhLCB2Yik7XG4gICAgICAgIGVsc2UgVmVjM0Z1bmMuc3VidHJhY3QodGhpcywgdGhpcywgdmEpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBtdWx0aXBseSh2KSB7XG4gICAgICAgIGlmICh2Lmxlbmd0aCkgVmVjM0Z1bmMubXVsdGlwbHkodGhpcywgdGhpcywgdik7XG4gICAgICAgIGVsc2UgVmVjM0Z1bmMuc2NhbGUodGhpcywgdGhpcywgdik7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGRpdmlkZSh2KSB7XG4gICAgICAgIGlmICh2Lmxlbmd0aCkgVmVjM0Z1bmMuZGl2aWRlKHRoaXMsIHRoaXMsIHYpO1xuICAgICAgICBlbHNlIFZlYzNGdW5jLnNjYWxlKHRoaXMsIHRoaXMsIDEgLyB2KTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgaW52ZXJzZSh2ID0gdGhpcykge1xuICAgICAgICBWZWMzRnVuYy5pbnZlcnNlKHRoaXMsIHYpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvLyBDYW4ndCB1c2UgJ2xlbmd0aCcgYXMgQXJyYXkucHJvdG90eXBlIHVzZXMgaXRcbiAgICBsZW4oKSB7XG4gICAgICAgIHJldHVybiBWZWMzRnVuYy5sZW5ndGgodGhpcyk7XG4gICAgfVxuXG4gICAgZGlzdGFuY2Uodikge1xuICAgICAgICBpZiAodikgcmV0dXJuIFZlYzNGdW5jLmRpc3RhbmNlKHRoaXMsIHYpO1xuICAgICAgICBlbHNlIHJldHVybiBWZWMzRnVuYy5sZW5ndGgodGhpcyk7XG4gICAgfVxuXG4gICAgc3F1YXJlZExlbigpIHtcbiAgICAgICAgcmV0dXJuIFZlYzNGdW5jLnNxdWFyZWRMZW5ndGgodGhpcyk7XG4gICAgfVxuXG4gICAgc3F1YXJlZERpc3RhbmNlKHYpIHtcbiAgICAgICAgaWYgKHYpIHJldHVybiBWZWMzRnVuYy5zcXVhcmVkRGlzdGFuY2UodGhpcywgdik7XG4gICAgICAgIGVsc2UgcmV0dXJuIFZlYzNGdW5jLnNxdWFyZWRMZW5ndGgodGhpcyk7XG4gICAgfVxuXG4gICAgbmVnYXRlKHYgPSB0aGlzKSB7XG4gICAgICAgIFZlYzNGdW5jLm5lZ2F0ZSh0aGlzLCB2KTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgY3Jvc3ModmEsIHZiKSB7XG4gICAgICAgIGlmICh2YikgVmVjM0Z1bmMuY3Jvc3ModGhpcywgdmEsIHZiKTtcbiAgICAgICAgZWxzZSBWZWMzRnVuYy5jcm9zcyh0aGlzLCB0aGlzLCB2YSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHNjYWxlKHYpIHtcbiAgICAgICAgVmVjM0Z1bmMuc2NhbGUodGhpcywgdGhpcywgdik7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIG5vcm1hbGl6ZSgpIHtcbiAgICAgICAgVmVjM0Z1bmMubm9ybWFsaXplKHRoaXMsIHRoaXMpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBkb3Qodikge1xuICAgICAgICByZXR1cm4gVmVjM0Z1bmMuZG90KHRoaXMsIHYpO1xuICAgIH1cblxuICAgIGVxdWFscyh2KSB7XG4gICAgICAgIHJldHVybiBWZWMzRnVuYy5leGFjdEVxdWFscyh0aGlzLCB2KTtcbiAgICB9XG5cbiAgICBhcHBseU1hdHJpeDQobWF0NCkge1xuICAgICAgICBWZWMzRnVuYy50cmFuc2Zvcm1NYXQ0KHRoaXMsIHRoaXMsIG1hdDQpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBzY2FsZVJvdGF0ZU1hdHJpeDQobWF0NCkge1xuICAgICAgICBWZWMzRnVuYy5zY2FsZVJvdGF0ZU1hdDQodGhpcywgdGhpcywgbWF0NCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGFwcGx5UXVhdGVybmlvbihxKSB7XG4gICAgICAgIFZlYzNGdW5jLnRyYW5zZm9ybVF1YXQodGhpcywgdGhpcywgcSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGFuZ2xlKHYpIHtcbiAgICAgICAgcmV0dXJuIFZlYzNGdW5jLmFuZ2xlKHRoaXMsIHYpO1xuICAgIH1cblxuICAgIGxlcnAodiwgdCkge1xuICAgICAgICBWZWMzRnVuYy5sZXJwKHRoaXMsIHRoaXMsIHYsIHQpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBjbG9uZSgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBWZWMzKHRoaXNbMF0sIHRoaXNbMV0sIHRoaXNbMl0pO1xuICAgIH1cblxuICAgIGZyb21BcnJheShhLCBvID0gMCkge1xuICAgICAgICB0aGlzWzBdID0gYVtvXTtcbiAgICAgICAgdGhpc1sxXSA9IGFbbyArIDFdO1xuICAgICAgICB0aGlzWzJdID0gYVtvICsgMl07XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHRvQXJyYXkoYSA9IFtdLCBvID0gMCkge1xuICAgICAgICBhW29dID0gdGhpc1swXTtcbiAgICAgICAgYVtvICsgMV0gPSB0aGlzWzFdO1xuICAgICAgICBhW28gKyAyXSA9IHRoaXNbMl07XG4gICAgICAgIHJldHVybiBhO1xuICAgIH1cblxuICAgIHRyYW5zZm9ybURpcmVjdGlvbihtYXQ0KSB7XG4gICAgICAgIGNvbnN0IHggPSB0aGlzWzBdO1xuICAgICAgICBjb25zdCB5ID0gdGhpc1sxXTtcbiAgICAgICAgY29uc3QgeiA9IHRoaXNbMl07XG5cbiAgICAgICAgdGhpc1swXSA9IG1hdDRbMF0gKiB4ICsgbWF0NFs0XSAqIHkgKyBtYXQ0WzhdICogejtcbiAgICAgICAgdGhpc1sxXSA9IG1hdDRbMV0gKiB4ICsgbWF0NFs1XSAqIHkgKyBtYXQ0WzldICogejtcbiAgICAgICAgdGhpc1syXSA9IG1hdDRbMl0gKiB4ICsgbWF0NFs2XSAqIHkgKyBtYXQ0WzEwXSAqIHo7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMubm9ybWFsaXplKCk7XG4gICAgfVxufVxuIiwiaW1wb3J0ICogYXMgVmVjNEZ1bmMgZnJvbSAnLi9mdW5jdGlvbnMvVmVjNEZ1bmMuanMnO1xuXG5leHBvcnQgY2xhc3MgVmVjNCBleHRlbmRzIEFycmF5IHtcbiAgICBjb25zdHJ1Y3Rvcih4ID0gMCwgeSA9IHgsIHogPSB4LCB3ID0geCkge1xuICAgICAgICBzdXBlcih4LCB5LCB6LCB3KTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgZ2V0IHgoKSB7XG4gICAgICAgIHJldHVybiB0aGlzWzBdO1xuICAgIH1cblxuICAgIGdldCB5KCkge1xuICAgICAgICByZXR1cm4gdGhpc1sxXTtcbiAgICB9XG5cbiAgICBnZXQgeigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXNbMl07XG4gICAgfVxuXG4gICAgZ2V0IHcoKSB7XG4gICAgICAgIHJldHVybiB0aGlzWzNdO1xuICAgIH1cblxuICAgIHNldCB4KHYpIHtcbiAgICAgICAgdGhpc1swXSA9IHY7XG4gICAgfVxuXG4gICAgc2V0IHkodikge1xuICAgICAgICB0aGlzWzFdID0gdjtcbiAgICB9XG5cbiAgICBzZXQgeih2KSB7XG4gICAgICAgIHRoaXNbMl0gPSB2O1xuICAgIH1cblxuICAgIHNldCB3KHYpIHtcbiAgICAgICAgdGhpc1szXSA9IHY7XG4gICAgfVxuXG4gICAgc2V0KHgsIHksIHosIHcpIHtcbiAgICAgICAgaWYgKHgubGVuZ3RoKSByZXR1cm4gdGhpcy5jb3B5KHgpO1xuICAgICAgICBWZWM0RnVuYy5zZXQodGhpcywgeCwgeSwgeiwgdyk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGNvcHkodikge1xuICAgICAgICBWZWM0RnVuYy5jb3B5KHRoaXMsIHYpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBub3JtYWxpemUoKSB7XG4gICAgICAgIFZlYzRGdW5jLm5vcm1hbGl6ZSh0aGlzLCB0aGlzKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgZnJvbUFycmF5KGEsIG8gPSAwKSB7XG4gICAgICAgIHRoaXNbMF0gPSBhW29dO1xuICAgICAgICB0aGlzWzFdID0gYVtvICsgMV07XG4gICAgICAgIHRoaXNbMl0gPSBhW28gKyAyXTtcbiAgICAgICAgdGhpc1szXSA9IGFbbyArIDNdO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICB0b0FycmF5KGEgPSBbXSwgbyA9IDApIHtcbiAgICAgICAgYVtvXSA9IHRoaXNbMF07XG4gICAgICAgIGFbbyArIDFdID0gdGhpc1sxXTtcbiAgICAgICAgYVtvICsgMl0gPSB0aGlzWzJdO1xuICAgICAgICBhW28gKyAzXSA9IHRoaXNbM107XG4gICAgICAgIHJldHVybiBhO1xuICAgIH1cbn1cbiIsImNvbnN0IE5BTUVTID0ge1xuICAgIGJsYWNrOiAnIzAwMDAwMCcsXG4gICAgd2hpdGU6ICcjZmZmZmZmJyxcbiAgICByZWQ6ICcjZmYwMDAwJyxcbiAgICBncmVlbjogJyMwMGZmMDAnLFxuICAgIGJsdWU6ICcjMDAwMGZmJyxcbiAgICBmdWNoc2lhOiAnI2ZmMDBmZicsXG4gICAgY3lhbjogJyMwMGZmZmYnLFxuICAgIHllbGxvdzogJyNmZmZmMDAnLFxuICAgIG9yYW5nZTogJyNmZjgwMDAnLFxufTtcblxuZXhwb3J0IGZ1bmN0aW9uIGhleFRvUkdCKGhleCkge1xuICAgIGlmIChoZXgubGVuZ3RoID09PSA0KSBoZXggPSBoZXhbMF0gKyBoZXhbMV0gKyBoZXhbMV0gKyBoZXhbMl0gKyBoZXhbMl0gKyBoZXhbM10gKyBoZXhbM107XG4gICAgY29uc3QgcmdiID0gL14jPyhbYS1mXFxkXXsyfSkoW2EtZlxcZF17Mn0pKFthLWZcXGRdezJ9KSQvaS5leGVjKGhleCk7XG4gICAgaWYgKCFyZ2IpIGNvbnNvbGUud2FybihgVW5hYmxlIHRvIGNvbnZlcnQgaGV4IHN0cmluZyAke2hleH0gdG8gcmdiIHZhbHVlc2ApO1xuICAgIHJldHVybiBbcGFyc2VJbnQocmdiWzFdLCAxNikgLyAyNTUsIHBhcnNlSW50KHJnYlsyXSwgMTYpIC8gMjU1LCBwYXJzZUludChyZ2JbM10sIDE2KSAvIDI1NV07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBudW1iZXJUb1JHQihudW0pIHtcbiAgICBudW0gPSBwYXJzZUludChudW0pO1xuICAgIHJldHVybiBbKChudW0gPj4gMTYpICYgMjU1KSAvIDI1NSwgKChudW0gPj4gOCkgJiAyNTUpIC8gMjU1LCAobnVtICYgMjU1KSAvIDI1NV07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZUNvbG9yKGNvbG9yKSB7XG4gICAgLy8gRW1wdHlcbiAgICBpZiAoY29sb3IgPT09IHVuZGVmaW5lZCkgcmV0dXJuIFswLCAwLCAwXTtcblxuICAgIC8vIERlY2ltYWxcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMykgcmV0dXJuIGFyZ3VtZW50cztcblxuICAgIC8vIE51bWJlclxuICAgIGlmICghaXNOYU4oY29sb3IpKSByZXR1cm4gbnVtYmVyVG9SR0IoY29sb3IpO1xuXG4gICAgLy8gSGV4XG4gICAgaWYgKGNvbG9yWzBdID09PSAnIycpIHJldHVybiBoZXhUb1JHQihjb2xvcik7XG5cbiAgICAvLyBOYW1lc1xuICAgIGlmIChOQU1FU1tjb2xvci50b0xvd2VyQ2FzZSgpXSkgcmV0dXJuIGhleFRvUkdCKE5BTUVTW2NvbG9yLnRvTG93ZXJDYXNlKCldKTtcblxuICAgIGNvbnNvbGUud2FybignQ29sb3IgZm9ybWF0IG5vdCByZWNvZ25pc2VkJyk7XG4gICAgcmV0dXJuIFswLCAwLCAwXTtcbn1cbiIsIi8vIGFzc3VtZXMgdGhlIHVwcGVyIDN4MyBvZiBtIGlzIGEgcHVyZSByb3RhdGlvbiBtYXRyaXggKGkuZSwgdW5zY2FsZWQpXG5leHBvcnQgZnVuY3Rpb24gZnJvbVJvdGF0aW9uTWF0cml4KG91dCwgbSwgb3JkZXIgPSAnWVhaJykge1xuICAgIGlmIChvcmRlciA9PT0gJ1hZWicpIHtcbiAgICAgICAgb3V0WzFdID0gTWF0aC5hc2luKE1hdGgubWluKE1hdGgubWF4KG1bOF0sIC0xKSwgMSkpO1xuICAgICAgICBpZiAoTWF0aC5hYnMobVs4XSkgPCAwLjk5OTk5KSB7XG4gICAgICAgICAgICBvdXRbMF0gPSBNYXRoLmF0YW4yKC1tWzldLCBtWzEwXSk7XG4gICAgICAgICAgICBvdXRbMl0gPSBNYXRoLmF0YW4yKC1tWzRdLCBtWzBdKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG91dFswXSA9IE1hdGguYXRhbjIobVs2XSwgbVs1XSk7XG4gICAgICAgICAgICBvdXRbMl0gPSAwO1xuICAgICAgICB9XG4gICAgfSBlbHNlIGlmIChvcmRlciA9PT0gJ1lYWicpIHtcbiAgICAgICAgb3V0WzBdID0gTWF0aC5hc2luKC1NYXRoLm1pbihNYXRoLm1heChtWzldLCAtMSksIDEpKTtcbiAgICAgICAgaWYgKE1hdGguYWJzKG1bOV0pIDwgMC45OTk5OSkge1xuICAgICAgICAgICAgb3V0WzFdID0gTWF0aC5hdGFuMihtWzhdLCBtWzEwXSk7XG4gICAgICAgICAgICBvdXRbMl0gPSBNYXRoLmF0YW4yKG1bMV0sIG1bNV0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgb3V0WzFdID0gTWF0aC5hdGFuMigtbVsyXSwgbVswXSk7XG4gICAgICAgICAgICBvdXRbMl0gPSAwO1xuICAgICAgICB9XG4gICAgfSBlbHNlIGlmIChvcmRlciA9PT0gJ1pYWScpIHtcbiAgICAgICAgb3V0WzBdID0gTWF0aC5hc2luKE1hdGgubWluKE1hdGgubWF4KG1bNl0sIC0xKSwgMSkpO1xuICAgICAgICBpZiAoTWF0aC5hYnMobVs2XSkgPCAwLjk5OTk5KSB7XG4gICAgICAgICAgICBvdXRbMV0gPSBNYXRoLmF0YW4yKC1tWzJdLCBtWzEwXSk7XG4gICAgICAgICAgICBvdXRbMl0gPSBNYXRoLmF0YW4yKC1tWzRdLCBtWzVdKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG91dFsxXSA9IDA7XG4gICAgICAgICAgICBvdXRbMl0gPSBNYXRoLmF0YW4yKG1bMV0sIG1bMF0pO1xuICAgICAgICB9XG4gICAgfSBlbHNlIGlmIChvcmRlciA9PT0gJ1pZWCcpIHtcbiAgICAgICAgb3V0WzFdID0gTWF0aC5hc2luKC1NYXRoLm1pbihNYXRoLm1heChtWzJdLCAtMSksIDEpKTtcbiAgICAgICAgaWYgKE1hdGguYWJzKG1bMl0pIDwgMC45OTk5OSkge1xuICAgICAgICAgICAgb3V0WzBdID0gTWF0aC5hdGFuMihtWzZdLCBtWzEwXSk7XG4gICAgICAgICAgICBvdXRbMl0gPSBNYXRoLmF0YW4yKG1bMV0sIG1bMF0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgb3V0WzBdID0gMDtcbiAgICAgICAgICAgIG91dFsyXSA9IE1hdGguYXRhbjIoLW1bNF0sIG1bNV0pO1xuICAgICAgICB9XG4gICAgfSBlbHNlIGlmIChvcmRlciA9PT0gJ1laWCcpIHtcbiAgICAgICAgb3V0WzJdID0gTWF0aC5hc2luKE1hdGgubWluKE1hdGgubWF4KG1bMV0sIC0xKSwgMSkpO1xuICAgICAgICBpZiAoTWF0aC5hYnMobVsxXSkgPCAwLjk5OTk5KSB7XG4gICAgICAgICAgICBvdXRbMF0gPSBNYXRoLmF0YW4yKC1tWzldLCBtWzVdKTtcbiAgICAgICAgICAgIG91dFsxXSA9IE1hdGguYXRhbjIoLW1bMl0sIG1bMF0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgb3V0WzBdID0gMDtcbiAgICAgICAgICAgIG91dFsxXSA9IE1hdGguYXRhbjIobVs4XSwgbVsxMF0pO1xuICAgICAgICB9XG4gICAgfSBlbHNlIGlmIChvcmRlciA9PT0gJ1haWScpIHtcbiAgICAgICAgb3V0WzJdID0gTWF0aC5hc2luKC1NYXRoLm1pbihNYXRoLm1heChtWzRdLCAtMSksIDEpKTtcbiAgICAgICAgaWYgKE1hdGguYWJzKG1bNF0pIDwgMC45OTk5OSkge1xuICAgICAgICAgICAgb3V0WzBdID0gTWF0aC5hdGFuMihtWzZdLCBtWzVdKTtcbiAgICAgICAgICAgIG91dFsxXSA9IE1hdGguYXRhbjIobVs4XSwgbVswXSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBvdXRbMF0gPSBNYXRoLmF0YW4yKC1tWzldLCBtWzEwXSk7XG4gICAgICAgICAgICBvdXRbMV0gPSAwO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG91dDtcbn1cbiIsImNvbnN0IEVQU0lMT04gPSAwLjAwMDAwMTtcblxuLyoqXG4gKiBDb3BpZXMgdGhlIHVwcGVyLWxlZnQgM3gzIHZhbHVlcyBpbnRvIHRoZSBnaXZlbiBtYXQzLlxuICpcbiAqIEBwYXJhbSB7bWF0M30gb3V0IHRoZSByZWNlaXZpbmcgM3gzIG1hdHJpeFxuICogQHBhcmFtIHttYXQ0fSBhICAgdGhlIHNvdXJjZSA0eDQgbWF0cml4XG4gKiBAcmV0dXJucyB7bWF0M30gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmcm9tTWF0NChvdXQsIGEpIHtcbiAgICBvdXRbMF0gPSBhWzBdO1xuICAgIG91dFsxXSA9IGFbMV07XG4gICAgb3V0WzJdID0gYVsyXTtcbiAgICBvdXRbM10gPSBhWzRdO1xuICAgIG91dFs0XSA9IGFbNV07XG4gICAgb3V0WzVdID0gYVs2XTtcbiAgICBvdXRbNl0gPSBhWzhdO1xuICAgIG91dFs3XSA9IGFbOV07XG4gICAgb3V0WzhdID0gYVsxMF07XG4gICAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBDYWxjdWxhdGVzIGEgM3gzIG1hdHJpeCBmcm9tIHRoZSBnaXZlbiBxdWF0ZXJuaW9uXG4gKlxuICogQHBhcmFtIHttYXQzfSBvdXQgbWF0MyByZWNlaXZpbmcgb3BlcmF0aW9uIHJlc3VsdFxuICogQHBhcmFtIHtxdWF0fSBxIFF1YXRlcm5pb24gdG8gY3JlYXRlIG1hdHJpeCBmcm9tXG4gKlxuICogQHJldHVybnMge21hdDN9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gZnJvbVF1YXQob3V0LCBxKSB7XG4gICAgbGV0IHggPSBxWzBdLFxuICAgICAgICB5ID0gcVsxXSxcbiAgICAgICAgeiA9IHFbMl0sXG4gICAgICAgIHcgPSBxWzNdO1xuICAgIGxldCB4MiA9IHggKyB4O1xuICAgIGxldCB5MiA9IHkgKyB5O1xuICAgIGxldCB6MiA9IHogKyB6O1xuXG4gICAgbGV0IHh4ID0geCAqIHgyO1xuICAgIGxldCB5eCA9IHkgKiB4MjtcbiAgICBsZXQgeXkgPSB5ICogeTI7XG4gICAgbGV0IHp4ID0geiAqIHgyO1xuICAgIGxldCB6eSA9IHogKiB5MjtcbiAgICBsZXQgenogPSB6ICogejI7XG4gICAgbGV0IHd4ID0gdyAqIHgyO1xuICAgIGxldCB3eSA9IHcgKiB5MjtcbiAgICBsZXQgd3ogPSB3ICogejI7XG5cbiAgICBvdXRbMF0gPSAxIC0geXkgLSB6ejtcbiAgICBvdXRbM10gPSB5eCAtIHd6O1xuICAgIG91dFs2XSA9IHp4ICsgd3k7XG5cbiAgICBvdXRbMV0gPSB5eCArIHd6O1xuICAgIG91dFs0XSA9IDEgLSB4eCAtIHp6O1xuICAgIG91dFs3XSA9IHp5IC0gd3g7XG5cbiAgICBvdXRbMl0gPSB6eCAtIHd5O1xuICAgIG91dFs1XSA9IHp5ICsgd3g7XG4gICAgb3V0WzhdID0gMSAtIHh4IC0geXk7XG5cbiAgICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIENvcHkgdGhlIHZhbHVlcyBmcm9tIG9uZSBtYXQzIHRvIGFub3RoZXJcbiAqXG4gKiBAcGFyYW0ge21hdDN9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQzfSBhIHRoZSBzb3VyY2UgbWF0cml4XG4gKiBAcmV0dXJucyB7bWF0M30gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb3B5KG91dCwgYSkge1xuICAgIG91dFswXSA9IGFbMF07XG4gICAgb3V0WzFdID0gYVsxXTtcbiAgICBvdXRbMl0gPSBhWzJdO1xuICAgIG91dFszXSA9IGFbM107XG4gICAgb3V0WzRdID0gYVs0XTtcbiAgICBvdXRbNV0gPSBhWzVdO1xuICAgIG91dFs2XSA9IGFbNl07XG4gICAgb3V0WzddID0gYVs3XTtcbiAgICBvdXRbOF0gPSBhWzhdO1xuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogU2V0IHRoZSBjb21wb25lbnRzIG9mIGEgbWF0MyB0byB0aGUgZ2l2ZW4gdmFsdWVzXG4gKlxuICogQHBhcmFtIHttYXQzfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEByZXR1cm5zIHttYXQzfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNldChvdXQsIG0wMCwgbTAxLCBtMDIsIG0xMCwgbTExLCBtMTIsIG0yMCwgbTIxLCBtMjIpIHtcbiAgICBvdXRbMF0gPSBtMDA7XG4gICAgb3V0WzFdID0gbTAxO1xuICAgIG91dFsyXSA9IG0wMjtcbiAgICBvdXRbM10gPSBtMTA7XG4gICAgb3V0WzRdID0gbTExO1xuICAgIG91dFs1XSA9IG0xMjtcbiAgICBvdXRbNl0gPSBtMjA7XG4gICAgb3V0WzddID0gbTIxO1xuICAgIG91dFs4XSA9IG0yMjtcbiAgICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFNldCBhIG1hdDMgdG8gdGhlIGlkZW50aXR5IG1hdHJpeFxuICpcbiAqIEBwYXJhbSB7bWF0M30gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcmV0dXJucyB7bWF0M30gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpZGVudGl0eShvdXQpIHtcbiAgICBvdXRbMF0gPSAxO1xuICAgIG91dFsxXSA9IDA7XG4gICAgb3V0WzJdID0gMDtcbiAgICBvdXRbM10gPSAwO1xuICAgIG91dFs0XSA9IDE7XG4gICAgb3V0WzVdID0gMDtcbiAgICBvdXRbNl0gPSAwO1xuICAgIG91dFs3XSA9IDA7XG4gICAgb3V0WzhdID0gMTtcbiAgICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFRyYW5zcG9zZSB0aGUgdmFsdWVzIG9mIGEgbWF0M1xuICpcbiAqIEBwYXJhbSB7bWF0M30gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDN9IGEgdGhlIHNvdXJjZSBtYXRyaXhcbiAqIEByZXR1cm5zIHttYXQzfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRyYW5zcG9zZShvdXQsIGEpIHtcbiAgICAvLyBJZiB3ZSBhcmUgdHJhbnNwb3Npbmcgb3Vyc2VsdmVzIHdlIGNhbiBza2lwIGEgZmV3IHN0ZXBzIGJ1dCBoYXZlIHRvIGNhY2hlIHNvbWUgdmFsdWVzXG4gICAgaWYgKG91dCA9PT0gYSkge1xuICAgICAgICBsZXQgYTAxID0gYVsxXSxcbiAgICAgICAgICAgIGEwMiA9IGFbMl0sXG4gICAgICAgICAgICBhMTIgPSBhWzVdO1xuICAgICAgICBvdXRbMV0gPSBhWzNdO1xuICAgICAgICBvdXRbMl0gPSBhWzZdO1xuICAgICAgICBvdXRbM10gPSBhMDE7XG4gICAgICAgIG91dFs1XSA9IGFbN107XG4gICAgICAgIG91dFs2XSA9IGEwMjtcbiAgICAgICAgb3V0WzddID0gYTEyO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIG91dFswXSA9IGFbMF07XG4gICAgICAgIG91dFsxXSA9IGFbM107XG4gICAgICAgIG91dFsyXSA9IGFbNl07XG4gICAgICAgIG91dFszXSA9IGFbMV07XG4gICAgICAgIG91dFs0XSA9IGFbNF07XG4gICAgICAgIG91dFs1XSA9IGFbN107XG4gICAgICAgIG91dFs2XSA9IGFbMl07XG4gICAgICAgIG91dFs3XSA9IGFbNV07XG4gICAgICAgIG91dFs4XSA9IGFbOF07XG4gICAgfVxuXG4gICAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBJbnZlcnRzIGEgbWF0M1xuICpcbiAqIEBwYXJhbSB7bWF0M30gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDN9IGEgdGhlIHNvdXJjZSBtYXRyaXhcbiAqIEByZXR1cm5zIHttYXQzfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGludmVydChvdXQsIGEpIHtcbiAgICBsZXQgYTAwID0gYVswXSxcbiAgICAgICAgYTAxID0gYVsxXSxcbiAgICAgICAgYTAyID0gYVsyXTtcbiAgICBsZXQgYTEwID0gYVszXSxcbiAgICAgICAgYTExID0gYVs0XSxcbiAgICAgICAgYTEyID0gYVs1XTtcbiAgICBsZXQgYTIwID0gYVs2XSxcbiAgICAgICAgYTIxID0gYVs3XSxcbiAgICAgICAgYTIyID0gYVs4XTtcblxuICAgIGxldCBiMDEgPSBhMjIgKiBhMTEgLSBhMTIgKiBhMjE7XG4gICAgbGV0IGIxMSA9IC1hMjIgKiBhMTAgKyBhMTIgKiBhMjA7XG4gICAgbGV0IGIyMSA9IGEyMSAqIGExMCAtIGExMSAqIGEyMDtcblxuICAgIC8vIENhbGN1bGF0ZSB0aGUgZGV0ZXJtaW5hbnRcbiAgICBsZXQgZGV0ID0gYTAwICogYjAxICsgYTAxICogYjExICsgYTAyICogYjIxO1xuXG4gICAgaWYgKCFkZXQpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGRldCA9IDEuMCAvIGRldDtcblxuICAgIG91dFswXSA9IGIwMSAqIGRldDtcbiAgICBvdXRbMV0gPSAoLWEyMiAqIGEwMSArIGEwMiAqIGEyMSkgKiBkZXQ7XG4gICAgb3V0WzJdID0gKGExMiAqIGEwMSAtIGEwMiAqIGExMSkgKiBkZXQ7XG4gICAgb3V0WzNdID0gYjExICogZGV0O1xuICAgIG91dFs0XSA9IChhMjIgKiBhMDAgLSBhMDIgKiBhMjApICogZGV0O1xuICAgIG91dFs1XSA9ICgtYTEyICogYTAwICsgYTAyICogYTEwKSAqIGRldDtcbiAgICBvdXRbNl0gPSBiMjEgKiBkZXQ7XG4gICAgb3V0WzddID0gKC1hMjEgKiBhMDAgKyBhMDEgKiBhMjApICogZGV0O1xuICAgIG91dFs4XSA9IChhMTEgKiBhMDAgLSBhMDEgKiBhMTApICogZGV0O1xuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgZGV0ZXJtaW5hbnQgb2YgYSBtYXQzXG4gKlxuICogQHBhcmFtIHttYXQzfSBhIHRoZSBzb3VyY2UgbWF0cml4XG4gKiBAcmV0dXJucyB7TnVtYmVyfSBkZXRlcm1pbmFudCBvZiBhXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkZXRlcm1pbmFudChhKSB7XG4gICAgbGV0IGEwMCA9IGFbMF0sXG4gICAgICAgIGEwMSA9IGFbMV0sXG4gICAgICAgIGEwMiA9IGFbMl07XG4gICAgbGV0IGExMCA9IGFbM10sXG4gICAgICAgIGExMSA9IGFbNF0sXG4gICAgICAgIGExMiA9IGFbNV07XG4gICAgbGV0IGEyMCA9IGFbNl0sXG4gICAgICAgIGEyMSA9IGFbN10sXG4gICAgICAgIGEyMiA9IGFbOF07XG5cbiAgICByZXR1cm4gYTAwICogKGEyMiAqIGExMSAtIGExMiAqIGEyMSkgKyBhMDEgKiAoLWEyMiAqIGExMCArIGExMiAqIGEyMCkgKyBhMDIgKiAoYTIxICogYTEwIC0gYTExICogYTIwKTtcbn1cblxuLyoqXG4gKiBNdWx0aXBsaWVzIHR3byBtYXQzJ3NcbiAqXG4gKiBAcGFyYW0ge21hdDN9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge21hdDN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7bWF0M30gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtdWx0aXBseShvdXQsIGEsIGIpIHtcbiAgICBsZXQgYTAwID0gYVswXSxcbiAgICAgICAgYTAxID0gYVsxXSxcbiAgICAgICAgYTAyID0gYVsyXTtcbiAgICBsZXQgYTEwID0gYVszXSxcbiAgICAgICAgYTExID0gYVs0XSxcbiAgICAgICAgYTEyID0gYVs1XTtcbiAgICBsZXQgYTIwID0gYVs2XSxcbiAgICAgICAgYTIxID0gYVs3XSxcbiAgICAgICAgYTIyID0gYVs4XTtcblxuICAgIGxldCBiMDAgPSBiWzBdLFxuICAgICAgICBiMDEgPSBiWzFdLFxuICAgICAgICBiMDIgPSBiWzJdO1xuICAgIGxldCBiMTAgPSBiWzNdLFxuICAgICAgICBiMTEgPSBiWzRdLFxuICAgICAgICBiMTIgPSBiWzVdO1xuICAgIGxldCBiMjAgPSBiWzZdLFxuICAgICAgICBiMjEgPSBiWzddLFxuICAgICAgICBiMjIgPSBiWzhdO1xuXG4gICAgb3V0WzBdID0gYjAwICogYTAwICsgYjAxICogYTEwICsgYjAyICogYTIwO1xuICAgIG91dFsxXSA9IGIwMCAqIGEwMSArIGIwMSAqIGExMSArIGIwMiAqIGEyMTtcbiAgICBvdXRbMl0gPSBiMDAgKiBhMDIgKyBiMDEgKiBhMTIgKyBiMDIgKiBhMjI7XG5cbiAgICBvdXRbM10gPSBiMTAgKiBhMDAgKyBiMTEgKiBhMTAgKyBiMTIgKiBhMjA7XG4gICAgb3V0WzRdID0gYjEwICogYTAxICsgYjExICogYTExICsgYjEyICogYTIxO1xuICAgIG91dFs1XSA9IGIxMCAqIGEwMiArIGIxMSAqIGExMiArIGIxMiAqIGEyMjtcblxuICAgIG91dFs2XSA9IGIyMCAqIGEwMCArIGIyMSAqIGExMCArIGIyMiAqIGEyMDtcbiAgICBvdXRbN10gPSBiMjAgKiBhMDEgKyBiMjEgKiBhMTEgKyBiMjIgKiBhMjE7XG4gICAgb3V0WzhdID0gYjIwICogYTAyICsgYjIxICogYTEyICsgYjIyICogYTIyO1xuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogVHJhbnNsYXRlIGEgbWF0MyBieSB0aGUgZ2l2ZW4gdmVjdG9yXG4gKlxuICogQHBhcmFtIHttYXQzfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0M30gYSB0aGUgbWF0cml4IHRvIHRyYW5zbGF0ZVxuICogQHBhcmFtIHt2ZWMyfSB2IHZlY3RvciB0byB0cmFuc2xhdGUgYnlcbiAqIEByZXR1cm5zIHttYXQzfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRyYW5zbGF0ZShvdXQsIGEsIHYpIHtcbiAgICBsZXQgYTAwID0gYVswXSxcbiAgICAgICAgYTAxID0gYVsxXSxcbiAgICAgICAgYTAyID0gYVsyXSxcbiAgICAgICAgYTEwID0gYVszXSxcbiAgICAgICAgYTExID0gYVs0XSxcbiAgICAgICAgYTEyID0gYVs1XSxcbiAgICAgICAgYTIwID0gYVs2XSxcbiAgICAgICAgYTIxID0gYVs3XSxcbiAgICAgICAgYTIyID0gYVs4XSxcbiAgICAgICAgeCA9IHZbMF0sXG4gICAgICAgIHkgPSB2WzFdO1xuXG4gICAgb3V0WzBdID0gYTAwO1xuICAgIG91dFsxXSA9IGEwMTtcbiAgICBvdXRbMl0gPSBhMDI7XG5cbiAgICBvdXRbM10gPSBhMTA7XG4gICAgb3V0WzRdID0gYTExO1xuICAgIG91dFs1XSA9IGExMjtcblxuICAgIG91dFs2XSA9IHggKiBhMDAgKyB5ICogYTEwICsgYTIwO1xuICAgIG91dFs3XSA9IHggKiBhMDEgKyB5ICogYTExICsgYTIxO1xuICAgIG91dFs4XSA9IHggKiBhMDIgKyB5ICogYTEyICsgYTIyO1xuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogUm90YXRlcyBhIG1hdDMgYnkgdGhlIGdpdmVuIGFuZ2xlXG4gKlxuICogQHBhcmFtIHttYXQzfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0M30gYSB0aGUgbWF0cml4IHRvIHJvdGF0ZVxuICogQHBhcmFtIHtOdW1iZXJ9IHJhZCB0aGUgYW5nbGUgdG8gcm90YXRlIHRoZSBtYXRyaXggYnlcbiAqIEByZXR1cm5zIHttYXQzfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJvdGF0ZShvdXQsIGEsIHJhZCkge1xuICAgIGxldCBhMDAgPSBhWzBdLFxuICAgICAgICBhMDEgPSBhWzFdLFxuICAgICAgICBhMDIgPSBhWzJdLFxuICAgICAgICBhMTAgPSBhWzNdLFxuICAgICAgICBhMTEgPSBhWzRdLFxuICAgICAgICBhMTIgPSBhWzVdLFxuICAgICAgICBhMjAgPSBhWzZdLFxuICAgICAgICBhMjEgPSBhWzddLFxuICAgICAgICBhMjIgPSBhWzhdLFxuICAgICAgICBzID0gTWF0aC5zaW4ocmFkKSxcbiAgICAgICAgYyA9IE1hdGguY29zKHJhZCk7XG5cbiAgICBvdXRbMF0gPSBjICogYTAwICsgcyAqIGExMDtcbiAgICBvdXRbMV0gPSBjICogYTAxICsgcyAqIGExMTtcbiAgICBvdXRbMl0gPSBjICogYTAyICsgcyAqIGExMjtcblxuICAgIG91dFszXSA9IGMgKiBhMTAgLSBzICogYTAwO1xuICAgIG91dFs0XSA9IGMgKiBhMTEgLSBzICogYTAxO1xuICAgIG91dFs1XSA9IGMgKiBhMTIgLSBzICogYTAyO1xuXG4gICAgb3V0WzZdID0gYTIwO1xuICAgIG91dFs3XSA9IGEyMTtcbiAgICBvdXRbOF0gPSBhMjI7XG4gICAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBTY2FsZXMgdGhlIG1hdDMgYnkgdGhlIGRpbWVuc2lvbnMgaW4gdGhlIGdpdmVuIHZlYzJcbiAqXG4gKiBAcGFyYW0ge21hdDN9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQzfSBhIHRoZSBtYXRyaXggdG8gcm90YXRlXG4gKiBAcGFyYW0ge3ZlYzJ9IHYgdGhlIHZlYzIgdG8gc2NhbGUgdGhlIG1hdHJpeCBieVxuICogQHJldHVybnMge21hdDN9IG91dFxuICoqL1xuZXhwb3J0IGZ1bmN0aW9uIHNjYWxlKG91dCwgYSwgdikge1xuICAgIGxldCB4ID0gdlswXSxcbiAgICAgICAgeSA9IHZbMV07XG5cbiAgICBvdXRbMF0gPSB4ICogYVswXTtcbiAgICBvdXRbMV0gPSB4ICogYVsxXTtcbiAgICBvdXRbMl0gPSB4ICogYVsyXTtcblxuICAgIG91dFszXSA9IHkgKiBhWzNdO1xuICAgIG91dFs0XSA9IHkgKiBhWzRdO1xuICAgIG91dFs1XSA9IHkgKiBhWzVdO1xuXG4gICAgb3V0WzZdID0gYVs2XTtcbiAgICBvdXRbN10gPSBhWzddO1xuICAgIG91dFs4XSA9IGFbOF07XG4gICAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBDYWxjdWxhdGVzIGEgM3gzIG5vcm1hbCBtYXRyaXggKHRyYW5zcG9zZSBpbnZlcnNlKSBmcm9tIHRoZSA0eDQgbWF0cml4XG4gKlxuICogQHBhcmFtIHttYXQzfSBvdXQgbWF0MyByZWNlaXZpbmcgb3BlcmF0aW9uIHJlc3VsdFxuICogQHBhcmFtIHttYXQ0fSBhIE1hdDQgdG8gZGVyaXZlIHRoZSBub3JtYWwgbWF0cml4IGZyb21cbiAqXG4gKiBAcmV0dXJucyB7bWF0M30gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBub3JtYWxGcm9tTWF0NChvdXQsIGEpIHtcbiAgICBsZXQgYTAwID0gYVswXSxcbiAgICAgICAgYTAxID0gYVsxXSxcbiAgICAgICAgYTAyID0gYVsyXSxcbiAgICAgICAgYTAzID0gYVszXTtcbiAgICBsZXQgYTEwID0gYVs0XSxcbiAgICAgICAgYTExID0gYVs1XSxcbiAgICAgICAgYTEyID0gYVs2XSxcbiAgICAgICAgYTEzID0gYVs3XTtcbiAgICBsZXQgYTIwID0gYVs4XSxcbiAgICAgICAgYTIxID0gYVs5XSxcbiAgICAgICAgYTIyID0gYVsxMF0sXG4gICAgICAgIGEyMyA9IGFbMTFdO1xuICAgIGxldCBhMzAgPSBhWzEyXSxcbiAgICAgICAgYTMxID0gYVsxM10sXG4gICAgICAgIGEzMiA9IGFbMTRdLFxuICAgICAgICBhMzMgPSBhWzE1XTtcblxuICAgIGxldCBiMDAgPSBhMDAgKiBhMTEgLSBhMDEgKiBhMTA7XG4gICAgbGV0IGIwMSA9IGEwMCAqIGExMiAtIGEwMiAqIGExMDtcbiAgICBsZXQgYjAyID0gYTAwICogYTEzIC0gYTAzICogYTEwO1xuICAgIGxldCBiMDMgPSBhMDEgKiBhMTIgLSBhMDIgKiBhMTE7XG4gICAgbGV0IGIwNCA9IGEwMSAqIGExMyAtIGEwMyAqIGExMTtcbiAgICBsZXQgYjA1ID0gYTAyICogYTEzIC0gYTAzICogYTEyO1xuICAgIGxldCBiMDYgPSBhMjAgKiBhMzEgLSBhMjEgKiBhMzA7XG4gICAgbGV0IGIwNyA9IGEyMCAqIGEzMiAtIGEyMiAqIGEzMDtcbiAgICBsZXQgYjA4ID0gYTIwICogYTMzIC0gYTIzICogYTMwO1xuICAgIGxldCBiMDkgPSBhMjEgKiBhMzIgLSBhMjIgKiBhMzE7XG4gICAgbGV0IGIxMCA9IGEyMSAqIGEzMyAtIGEyMyAqIGEzMTtcbiAgICBsZXQgYjExID0gYTIyICogYTMzIC0gYTIzICogYTMyO1xuXG4gICAgLy8gQ2FsY3VsYXRlIHRoZSBkZXRlcm1pbmFudFxuICAgIGxldCBkZXQgPSBiMDAgKiBiMTEgLSBiMDEgKiBiMTAgKyBiMDIgKiBiMDkgKyBiMDMgKiBiMDggLSBiMDQgKiBiMDcgKyBiMDUgKiBiMDY7XG5cbiAgICBpZiAoIWRldCkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgZGV0ID0gMS4wIC8gZGV0O1xuXG4gICAgb3V0WzBdID0gKGExMSAqIGIxMSAtIGExMiAqIGIxMCArIGExMyAqIGIwOSkgKiBkZXQ7XG4gICAgb3V0WzFdID0gKGExMiAqIGIwOCAtIGExMCAqIGIxMSAtIGExMyAqIGIwNykgKiBkZXQ7XG4gICAgb3V0WzJdID0gKGExMCAqIGIxMCAtIGExMSAqIGIwOCArIGExMyAqIGIwNikgKiBkZXQ7XG5cbiAgICBvdXRbM10gPSAoYTAyICogYjEwIC0gYTAxICogYjExIC0gYTAzICogYjA5KSAqIGRldDtcbiAgICBvdXRbNF0gPSAoYTAwICogYjExIC0gYTAyICogYjA4ICsgYTAzICogYjA3KSAqIGRldDtcbiAgICBvdXRbNV0gPSAoYTAxICogYjA4IC0gYTAwICogYjEwIC0gYTAzICogYjA2KSAqIGRldDtcblxuICAgIG91dFs2XSA9IChhMzEgKiBiMDUgLSBhMzIgKiBiMDQgKyBhMzMgKiBiMDMpICogZGV0O1xuICAgIG91dFs3XSA9IChhMzIgKiBiMDIgLSBhMzAgKiBiMDUgLSBhMzMgKiBiMDEpICogZGV0O1xuICAgIG91dFs4XSA9IChhMzAgKiBiMDQgLSBhMzEgKiBiMDIgKyBhMzMgKiBiMDApICogZGV0O1xuXG4gICAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBHZW5lcmF0ZXMgYSAyRCBwcm9qZWN0aW9uIG1hdHJpeCB3aXRoIHRoZSBnaXZlbiBib3VuZHNcbiAqXG4gKiBAcGFyYW0ge21hdDN9IG91dCBtYXQzIGZydXN0dW0gbWF0cml4IHdpbGwgYmUgd3JpdHRlbiBpbnRvXG4gKiBAcGFyYW0ge251bWJlcn0gd2lkdGggV2lkdGggb2YgeW91ciBnbCBjb250ZXh0XG4gKiBAcGFyYW0ge251bWJlcn0gaGVpZ2h0IEhlaWdodCBvZiBnbCBjb250ZXh0XG4gKiBAcmV0dXJucyB7bWF0M30gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwcm9qZWN0aW9uKG91dCwgd2lkdGgsIGhlaWdodCkge1xuICAgIG91dFswXSA9IDIgLyB3aWR0aDtcbiAgICBvdXRbMV0gPSAwO1xuICAgIG91dFsyXSA9IDA7XG4gICAgb3V0WzNdID0gMDtcbiAgICBvdXRbNF0gPSAtMiAvIGhlaWdodDtcbiAgICBvdXRbNV0gPSAwO1xuICAgIG91dFs2XSA9IC0xO1xuICAgIG91dFs3XSA9IDE7XG4gICAgb3V0WzhdID0gMTtcbiAgICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIEFkZHMgdHdvIG1hdDMnc1xuICpcbiAqIEBwYXJhbSB7bWF0M30gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7bWF0M30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHttYXQzfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFkZChvdXQsIGEsIGIpIHtcbiAgICBvdXRbMF0gPSBhWzBdICsgYlswXTtcbiAgICBvdXRbMV0gPSBhWzFdICsgYlsxXTtcbiAgICBvdXRbMl0gPSBhWzJdICsgYlsyXTtcbiAgICBvdXRbM10gPSBhWzNdICsgYlszXTtcbiAgICBvdXRbNF0gPSBhWzRdICsgYls0XTtcbiAgICBvdXRbNV0gPSBhWzVdICsgYls1XTtcbiAgICBvdXRbNl0gPSBhWzZdICsgYls2XTtcbiAgICBvdXRbN10gPSBhWzddICsgYls3XTtcbiAgICBvdXRbOF0gPSBhWzhdICsgYls4XTtcbiAgICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFN1YnRyYWN0cyBtYXRyaXggYiBmcm9tIG1hdHJpeCBhXG4gKlxuICogQHBhcmFtIHttYXQzfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0M30gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHttYXQzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge21hdDN9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gc3VidHJhY3Qob3V0LCBhLCBiKSB7XG4gICAgb3V0WzBdID0gYVswXSAtIGJbMF07XG4gICAgb3V0WzFdID0gYVsxXSAtIGJbMV07XG4gICAgb3V0WzJdID0gYVsyXSAtIGJbMl07XG4gICAgb3V0WzNdID0gYVszXSAtIGJbM107XG4gICAgb3V0WzRdID0gYVs0XSAtIGJbNF07XG4gICAgb3V0WzVdID0gYVs1XSAtIGJbNV07XG4gICAgb3V0WzZdID0gYVs2XSAtIGJbNl07XG4gICAgb3V0WzddID0gYVs3XSAtIGJbN107XG4gICAgb3V0WzhdID0gYVs4XSAtIGJbOF07XG4gICAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBNdWx0aXBseSBlYWNoIGVsZW1lbnQgb2YgdGhlIG1hdHJpeCBieSBhIHNjYWxhci5cbiAqXG4gKiBAcGFyYW0ge21hdDN9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQzfSBhIHRoZSBtYXRyaXggdG8gc2NhbGVcbiAqIEBwYXJhbSB7TnVtYmVyfSBiIGFtb3VudCB0byBzY2FsZSB0aGUgbWF0cml4J3MgZWxlbWVudHMgYnlcbiAqIEByZXR1cm5zIHttYXQzfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG11bHRpcGx5U2NhbGFyKG91dCwgYSwgYikge1xuICAgIG91dFswXSA9IGFbMF0gKiBiO1xuICAgIG91dFsxXSA9IGFbMV0gKiBiO1xuICAgIG91dFsyXSA9IGFbMl0gKiBiO1xuICAgIG91dFszXSA9IGFbM10gKiBiO1xuICAgIG91dFs0XSA9IGFbNF0gKiBiO1xuICAgIG91dFs1XSA9IGFbNV0gKiBiO1xuICAgIG91dFs2XSA9IGFbNl0gKiBiO1xuICAgIG91dFs3XSA9IGFbN10gKiBiO1xuICAgIG91dFs4XSA9IGFbOF0gKiBiO1xuICAgIHJldHVybiBvdXQ7XG59XG4iLCJjb25zdCBFUFNJTE9OID0gMC4wMDAwMDE7XG5cbi8qKlxuICogQ29weSB0aGUgdmFsdWVzIGZyb20gb25lIG1hdDQgdG8gYW5vdGhlclxuICpcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDR9IGEgdGhlIHNvdXJjZSBtYXRyaXhcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvcHkob3V0LCBhKSB7XG4gICAgb3V0WzBdID0gYVswXTtcbiAgICBvdXRbMV0gPSBhWzFdO1xuICAgIG91dFsyXSA9IGFbMl07XG4gICAgb3V0WzNdID0gYVszXTtcbiAgICBvdXRbNF0gPSBhWzRdO1xuICAgIG91dFs1XSA9IGFbNV07XG4gICAgb3V0WzZdID0gYVs2XTtcbiAgICBvdXRbN10gPSBhWzddO1xuICAgIG91dFs4XSA9IGFbOF07XG4gICAgb3V0WzldID0gYVs5XTtcbiAgICBvdXRbMTBdID0gYVsxMF07XG4gICAgb3V0WzExXSA9IGFbMTFdO1xuICAgIG91dFsxMl0gPSBhWzEyXTtcbiAgICBvdXRbMTNdID0gYVsxM107XG4gICAgb3V0WzE0XSA9IGFbMTRdO1xuICAgIG91dFsxNV0gPSBhWzE1XTtcbiAgICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFNldCB0aGUgY29tcG9uZW50cyBvZiBhIG1hdDQgdG8gdGhlIGdpdmVuIHZhbHVlc1xuICpcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZXQob3V0LCBtMDAsIG0wMSwgbTAyLCBtMDMsIG0xMCwgbTExLCBtMTIsIG0xMywgbTIwLCBtMjEsIG0yMiwgbTIzLCBtMzAsIG0zMSwgbTMyLCBtMzMpIHtcbiAgICBvdXRbMF0gPSBtMDA7XG4gICAgb3V0WzFdID0gbTAxO1xuICAgIG91dFsyXSA9IG0wMjtcbiAgICBvdXRbM10gPSBtMDM7XG4gICAgb3V0WzRdID0gbTEwO1xuICAgIG91dFs1XSA9IG0xMTtcbiAgICBvdXRbNl0gPSBtMTI7XG4gICAgb3V0WzddID0gbTEzO1xuICAgIG91dFs4XSA9IG0yMDtcbiAgICBvdXRbOV0gPSBtMjE7XG4gICAgb3V0WzEwXSA9IG0yMjtcbiAgICBvdXRbMTFdID0gbTIzO1xuICAgIG91dFsxMl0gPSBtMzA7XG4gICAgb3V0WzEzXSA9IG0zMTtcbiAgICBvdXRbMTRdID0gbTMyO1xuICAgIG91dFsxNV0gPSBtMzM7XG4gICAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBTZXQgYSBtYXQ0IHRvIHRoZSBpZGVudGl0eSBtYXRyaXhcbiAqXG4gKiBAcGFyYW0ge21hdDR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHJldHVybnMge21hdDR9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gaWRlbnRpdHkob3V0KSB7XG4gICAgb3V0WzBdID0gMTtcbiAgICBvdXRbMV0gPSAwO1xuICAgIG91dFsyXSA9IDA7XG4gICAgb3V0WzNdID0gMDtcbiAgICBvdXRbNF0gPSAwO1xuICAgIG91dFs1XSA9IDE7XG4gICAgb3V0WzZdID0gMDtcbiAgICBvdXRbN10gPSAwO1xuICAgIG91dFs4XSA9IDA7XG4gICAgb3V0WzldID0gMDtcbiAgICBvdXRbMTBdID0gMTtcbiAgICBvdXRbMTFdID0gMDtcbiAgICBvdXRbMTJdID0gMDtcbiAgICBvdXRbMTNdID0gMDtcbiAgICBvdXRbMTRdID0gMDtcbiAgICBvdXRbMTVdID0gMTtcbiAgICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFRyYW5zcG9zZSB0aGUgdmFsdWVzIG9mIGEgbWF0NFxuICpcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDR9IGEgdGhlIHNvdXJjZSBtYXRyaXhcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRyYW5zcG9zZShvdXQsIGEpIHtcbiAgICAvLyBJZiB3ZSBhcmUgdHJhbnNwb3Npbmcgb3Vyc2VsdmVzIHdlIGNhbiBza2lwIGEgZmV3IHN0ZXBzIGJ1dCBoYXZlIHRvIGNhY2hlIHNvbWUgdmFsdWVzXG4gICAgaWYgKG91dCA9PT0gYSkge1xuICAgICAgICBsZXQgYTAxID0gYVsxXSxcbiAgICAgICAgICAgIGEwMiA9IGFbMl0sXG4gICAgICAgICAgICBhMDMgPSBhWzNdO1xuICAgICAgICBsZXQgYTEyID0gYVs2XSxcbiAgICAgICAgICAgIGExMyA9IGFbN107XG4gICAgICAgIGxldCBhMjMgPSBhWzExXTtcblxuICAgICAgICBvdXRbMV0gPSBhWzRdO1xuICAgICAgICBvdXRbMl0gPSBhWzhdO1xuICAgICAgICBvdXRbM10gPSBhWzEyXTtcbiAgICAgICAgb3V0WzRdID0gYTAxO1xuICAgICAgICBvdXRbNl0gPSBhWzldO1xuICAgICAgICBvdXRbN10gPSBhWzEzXTtcbiAgICAgICAgb3V0WzhdID0gYTAyO1xuICAgICAgICBvdXRbOV0gPSBhMTI7XG4gICAgICAgIG91dFsxMV0gPSBhWzE0XTtcbiAgICAgICAgb3V0WzEyXSA9IGEwMztcbiAgICAgICAgb3V0WzEzXSA9IGExMztcbiAgICAgICAgb3V0WzE0XSA9IGEyMztcbiAgICB9IGVsc2Uge1xuICAgICAgICBvdXRbMF0gPSBhWzBdO1xuICAgICAgICBvdXRbMV0gPSBhWzRdO1xuICAgICAgICBvdXRbMl0gPSBhWzhdO1xuICAgICAgICBvdXRbM10gPSBhWzEyXTtcbiAgICAgICAgb3V0WzRdID0gYVsxXTtcbiAgICAgICAgb3V0WzVdID0gYVs1XTtcbiAgICAgICAgb3V0WzZdID0gYVs5XTtcbiAgICAgICAgb3V0WzddID0gYVsxM107XG4gICAgICAgIG91dFs4XSA9IGFbMl07XG4gICAgICAgIG91dFs5XSA9IGFbNl07XG4gICAgICAgIG91dFsxMF0gPSBhWzEwXTtcbiAgICAgICAgb3V0WzExXSA9IGFbMTRdO1xuICAgICAgICBvdXRbMTJdID0gYVszXTtcbiAgICAgICAgb3V0WzEzXSA9IGFbN107XG4gICAgICAgIG91dFsxNF0gPSBhWzExXTtcbiAgICAgICAgb3V0WzE1XSA9IGFbMTVdO1xuICAgIH1cblxuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogSW52ZXJ0cyBhIG1hdDRcbiAqXG4gKiBAcGFyYW0ge21hdDR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQ0fSBhIHRoZSBzb3VyY2UgbWF0cml4XG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpbnZlcnQob3V0LCBhKSB7XG4gICAgbGV0IGEwMCA9IGFbMF0sXG4gICAgICAgIGEwMSA9IGFbMV0sXG4gICAgICAgIGEwMiA9IGFbMl0sXG4gICAgICAgIGEwMyA9IGFbM107XG4gICAgbGV0IGExMCA9IGFbNF0sXG4gICAgICAgIGExMSA9IGFbNV0sXG4gICAgICAgIGExMiA9IGFbNl0sXG4gICAgICAgIGExMyA9IGFbN107XG4gICAgbGV0IGEyMCA9IGFbOF0sXG4gICAgICAgIGEyMSA9IGFbOV0sXG4gICAgICAgIGEyMiA9IGFbMTBdLFxuICAgICAgICBhMjMgPSBhWzExXTtcbiAgICBsZXQgYTMwID0gYVsxMl0sXG4gICAgICAgIGEzMSA9IGFbMTNdLFxuICAgICAgICBhMzIgPSBhWzE0XSxcbiAgICAgICAgYTMzID0gYVsxNV07XG5cbiAgICBsZXQgYjAwID0gYTAwICogYTExIC0gYTAxICogYTEwO1xuICAgIGxldCBiMDEgPSBhMDAgKiBhMTIgLSBhMDIgKiBhMTA7XG4gICAgbGV0IGIwMiA9IGEwMCAqIGExMyAtIGEwMyAqIGExMDtcbiAgICBsZXQgYjAzID0gYTAxICogYTEyIC0gYTAyICogYTExO1xuICAgIGxldCBiMDQgPSBhMDEgKiBhMTMgLSBhMDMgKiBhMTE7XG4gICAgbGV0IGIwNSA9IGEwMiAqIGExMyAtIGEwMyAqIGExMjtcbiAgICBsZXQgYjA2ID0gYTIwICogYTMxIC0gYTIxICogYTMwO1xuICAgIGxldCBiMDcgPSBhMjAgKiBhMzIgLSBhMjIgKiBhMzA7XG4gICAgbGV0IGIwOCA9IGEyMCAqIGEzMyAtIGEyMyAqIGEzMDtcbiAgICBsZXQgYjA5ID0gYTIxICogYTMyIC0gYTIyICogYTMxO1xuICAgIGxldCBiMTAgPSBhMjEgKiBhMzMgLSBhMjMgKiBhMzE7XG4gICAgbGV0IGIxMSA9IGEyMiAqIGEzMyAtIGEyMyAqIGEzMjtcblxuICAgIC8vIENhbGN1bGF0ZSB0aGUgZGV0ZXJtaW5hbnRcbiAgICBsZXQgZGV0ID0gYjAwICogYjExIC0gYjAxICogYjEwICsgYjAyICogYjA5ICsgYjAzICogYjA4IC0gYjA0ICogYjA3ICsgYjA1ICogYjA2O1xuXG4gICAgaWYgKCFkZXQpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGRldCA9IDEuMCAvIGRldDtcblxuICAgIG91dFswXSA9IChhMTEgKiBiMTEgLSBhMTIgKiBiMTAgKyBhMTMgKiBiMDkpICogZGV0O1xuICAgIG91dFsxXSA9IChhMDIgKiBiMTAgLSBhMDEgKiBiMTEgLSBhMDMgKiBiMDkpICogZGV0O1xuICAgIG91dFsyXSA9IChhMzEgKiBiMDUgLSBhMzIgKiBiMDQgKyBhMzMgKiBiMDMpICogZGV0O1xuICAgIG91dFszXSA9IChhMjIgKiBiMDQgLSBhMjEgKiBiMDUgLSBhMjMgKiBiMDMpICogZGV0O1xuICAgIG91dFs0XSA9IChhMTIgKiBiMDggLSBhMTAgKiBiMTEgLSBhMTMgKiBiMDcpICogZGV0O1xuICAgIG91dFs1XSA9IChhMDAgKiBiMTEgLSBhMDIgKiBiMDggKyBhMDMgKiBiMDcpICogZGV0O1xuICAgIG91dFs2XSA9IChhMzIgKiBiMDIgLSBhMzAgKiBiMDUgLSBhMzMgKiBiMDEpICogZGV0O1xuICAgIG91dFs3XSA9IChhMjAgKiBiMDUgLSBhMjIgKiBiMDIgKyBhMjMgKiBiMDEpICogZGV0O1xuICAgIG91dFs4XSA9IChhMTAgKiBiMTAgLSBhMTEgKiBiMDggKyBhMTMgKiBiMDYpICogZGV0O1xuICAgIG91dFs5XSA9IChhMDEgKiBiMDggLSBhMDAgKiBiMTAgLSBhMDMgKiBiMDYpICogZGV0O1xuICAgIG91dFsxMF0gPSAoYTMwICogYjA0IC0gYTMxICogYjAyICsgYTMzICogYjAwKSAqIGRldDtcbiAgICBvdXRbMTFdID0gKGEyMSAqIGIwMiAtIGEyMCAqIGIwNCAtIGEyMyAqIGIwMCkgKiBkZXQ7XG4gICAgb3V0WzEyXSA9IChhMTEgKiBiMDcgLSBhMTAgKiBiMDkgLSBhMTIgKiBiMDYpICogZGV0O1xuICAgIG91dFsxM10gPSAoYTAwICogYjA5IC0gYTAxICogYjA3ICsgYTAyICogYjA2KSAqIGRldDtcbiAgICBvdXRbMTRdID0gKGEzMSAqIGIwMSAtIGEzMCAqIGIwMyAtIGEzMiAqIGIwMCkgKiBkZXQ7XG4gICAgb3V0WzE1XSA9IChhMjAgKiBiMDMgLSBhMjEgKiBiMDEgKyBhMjIgKiBiMDApICogZGV0O1xuXG4gICAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBkZXRlcm1pbmFudCBvZiBhIG1hdDRcbiAqXG4gKiBAcGFyYW0ge21hdDR9IGEgdGhlIHNvdXJjZSBtYXRyaXhcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IGRldGVybWluYW50IG9mIGFcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRldGVybWluYW50KGEpIHtcbiAgICBsZXQgYTAwID0gYVswXSxcbiAgICAgICAgYTAxID0gYVsxXSxcbiAgICAgICAgYTAyID0gYVsyXSxcbiAgICAgICAgYTAzID0gYVszXTtcbiAgICBsZXQgYTEwID0gYVs0XSxcbiAgICAgICAgYTExID0gYVs1XSxcbiAgICAgICAgYTEyID0gYVs2XSxcbiAgICAgICAgYTEzID0gYVs3XTtcbiAgICBsZXQgYTIwID0gYVs4XSxcbiAgICAgICAgYTIxID0gYVs5XSxcbiAgICAgICAgYTIyID0gYVsxMF0sXG4gICAgICAgIGEyMyA9IGFbMTFdO1xuICAgIGxldCBhMzAgPSBhWzEyXSxcbiAgICAgICAgYTMxID0gYVsxM10sXG4gICAgICAgIGEzMiA9IGFbMTRdLFxuICAgICAgICBhMzMgPSBhWzE1XTtcblxuICAgIGxldCBiMDAgPSBhMDAgKiBhMTEgLSBhMDEgKiBhMTA7XG4gICAgbGV0IGIwMSA9IGEwMCAqIGExMiAtIGEwMiAqIGExMDtcbiAgICBsZXQgYjAyID0gYTAwICogYTEzIC0gYTAzICogYTEwO1xuICAgIGxldCBiMDMgPSBhMDEgKiBhMTIgLSBhMDIgKiBhMTE7XG4gICAgbGV0IGIwNCA9IGEwMSAqIGExMyAtIGEwMyAqIGExMTtcbiAgICBsZXQgYjA1ID0gYTAyICogYTEzIC0gYTAzICogYTEyO1xuICAgIGxldCBiMDYgPSBhMjAgKiBhMzEgLSBhMjEgKiBhMzA7XG4gICAgbGV0IGIwNyA9IGEyMCAqIGEzMiAtIGEyMiAqIGEzMDtcbiAgICBsZXQgYjA4ID0gYTIwICogYTMzIC0gYTIzICogYTMwO1xuICAgIGxldCBiMDkgPSBhMjEgKiBhMzIgLSBhMjIgKiBhMzE7XG4gICAgbGV0IGIxMCA9IGEyMSAqIGEzMyAtIGEyMyAqIGEzMTtcbiAgICBsZXQgYjExID0gYTIyICogYTMzIC0gYTIzICogYTMyO1xuXG4gICAgLy8gQ2FsY3VsYXRlIHRoZSBkZXRlcm1pbmFudFxuICAgIHJldHVybiBiMDAgKiBiMTEgLSBiMDEgKiBiMTAgKyBiMDIgKiBiMDkgKyBiMDMgKiBiMDggLSBiMDQgKiBiMDcgKyBiMDUgKiBiMDY7XG59XG5cbi8qKlxuICogTXVsdGlwbGllcyB0d28gbWF0NHNcbiAqXG4gKiBAcGFyYW0ge21hdDR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQ0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge21hdDR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtdWx0aXBseShvdXQsIGEsIGIpIHtcbiAgICBsZXQgYTAwID0gYVswXSxcbiAgICAgICAgYTAxID0gYVsxXSxcbiAgICAgICAgYTAyID0gYVsyXSxcbiAgICAgICAgYTAzID0gYVszXTtcbiAgICBsZXQgYTEwID0gYVs0XSxcbiAgICAgICAgYTExID0gYVs1XSxcbiAgICAgICAgYTEyID0gYVs2XSxcbiAgICAgICAgYTEzID0gYVs3XTtcbiAgICBsZXQgYTIwID0gYVs4XSxcbiAgICAgICAgYTIxID0gYVs5XSxcbiAgICAgICAgYTIyID0gYVsxMF0sXG4gICAgICAgIGEyMyA9IGFbMTFdO1xuICAgIGxldCBhMzAgPSBhWzEyXSxcbiAgICAgICAgYTMxID0gYVsxM10sXG4gICAgICAgIGEzMiA9IGFbMTRdLFxuICAgICAgICBhMzMgPSBhWzE1XTtcblxuICAgIC8vIENhY2hlIG9ubHkgdGhlIGN1cnJlbnQgbGluZSBvZiB0aGUgc2Vjb25kIG1hdHJpeFxuICAgIGxldCBiMCA9IGJbMF0sXG4gICAgICAgIGIxID0gYlsxXSxcbiAgICAgICAgYjIgPSBiWzJdLFxuICAgICAgICBiMyA9IGJbM107XG4gICAgb3V0WzBdID0gYjAgKiBhMDAgKyBiMSAqIGExMCArIGIyICogYTIwICsgYjMgKiBhMzA7XG4gICAgb3V0WzFdID0gYjAgKiBhMDEgKyBiMSAqIGExMSArIGIyICogYTIxICsgYjMgKiBhMzE7XG4gICAgb3V0WzJdID0gYjAgKiBhMDIgKyBiMSAqIGExMiArIGIyICogYTIyICsgYjMgKiBhMzI7XG4gICAgb3V0WzNdID0gYjAgKiBhMDMgKyBiMSAqIGExMyArIGIyICogYTIzICsgYjMgKiBhMzM7XG5cbiAgICBiMCA9IGJbNF07XG4gICAgYjEgPSBiWzVdO1xuICAgIGIyID0gYls2XTtcbiAgICBiMyA9IGJbN107XG4gICAgb3V0WzRdID0gYjAgKiBhMDAgKyBiMSAqIGExMCArIGIyICogYTIwICsgYjMgKiBhMzA7XG4gICAgb3V0WzVdID0gYjAgKiBhMDEgKyBiMSAqIGExMSArIGIyICogYTIxICsgYjMgKiBhMzE7XG4gICAgb3V0WzZdID0gYjAgKiBhMDIgKyBiMSAqIGExMiArIGIyICogYTIyICsgYjMgKiBhMzI7XG4gICAgb3V0WzddID0gYjAgKiBhMDMgKyBiMSAqIGExMyArIGIyICogYTIzICsgYjMgKiBhMzM7XG5cbiAgICBiMCA9IGJbOF07XG4gICAgYjEgPSBiWzldO1xuICAgIGIyID0gYlsxMF07XG4gICAgYjMgPSBiWzExXTtcbiAgICBvdXRbOF0gPSBiMCAqIGEwMCArIGIxICogYTEwICsgYjIgKiBhMjAgKyBiMyAqIGEzMDtcbiAgICBvdXRbOV0gPSBiMCAqIGEwMSArIGIxICogYTExICsgYjIgKiBhMjEgKyBiMyAqIGEzMTtcbiAgICBvdXRbMTBdID0gYjAgKiBhMDIgKyBiMSAqIGExMiArIGIyICogYTIyICsgYjMgKiBhMzI7XG4gICAgb3V0WzExXSA9IGIwICogYTAzICsgYjEgKiBhMTMgKyBiMiAqIGEyMyArIGIzICogYTMzO1xuXG4gICAgYjAgPSBiWzEyXTtcbiAgICBiMSA9IGJbMTNdO1xuICAgIGIyID0gYlsxNF07XG4gICAgYjMgPSBiWzE1XTtcbiAgICBvdXRbMTJdID0gYjAgKiBhMDAgKyBiMSAqIGExMCArIGIyICogYTIwICsgYjMgKiBhMzA7XG4gICAgb3V0WzEzXSA9IGIwICogYTAxICsgYjEgKiBhMTEgKyBiMiAqIGEyMSArIGIzICogYTMxO1xuICAgIG91dFsxNF0gPSBiMCAqIGEwMiArIGIxICogYTEyICsgYjIgKiBhMjIgKyBiMyAqIGEzMjtcbiAgICBvdXRbMTVdID0gYjAgKiBhMDMgKyBiMSAqIGExMyArIGIyICogYTIzICsgYjMgKiBhMzM7XG4gICAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBUcmFuc2xhdGUgYSBtYXQ0IGJ5IHRoZSBnaXZlbiB2ZWN0b3JcbiAqXG4gKiBAcGFyYW0ge21hdDR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQ0fSBhIHRoZSBtYXRyaXggdG8gdHJhbnNsYXRlXG4gKiBAcGFyYW0ge3ZlYzN9IHYgdmVjdG9yIHRvIHRyYW5zbGF0ZSBieVxuICogQHJldHVybnMge21hdDR9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gdHJhbnNsYXRlKG91dCwgYSwgdikge1xuICAgIGxldCB4ID0gdlswXSxcbiAgICAgICAgeSA9IHZbMV0sXG4gICAgICAgIHogPSB2WzJdO1xuICAgIGxldCBhMDAsIGEwMSwgYTAyLCBhMDM7XG4gICAgbGV0IGExMCwgYTExLCBhMTIsIGExMztcbiAgICBsZXQgYTIwLCBhMjEsIGEyMiwgYTIzO1xuXG4gICAgaWYgKGEgPT09IG91dCkge1xuICAgICAgICBvdXRbMTJdID0gYVswXSAqIHggKyBhWzRdICogeSArIGFbOF0gKiB6ICsgYVsxMl07XG4gICAgICAgIG91dFsxM10gPSBhWzFdICogeCArIGFbNV0gKiB5ICsgYVs5XSAqIHogKyBhWzEzXTtcbiAgICAgICAgb3V0WzE0XSA9IGFbMl0gKiB4ICsgYVs2XSAqIHkgKyBhWzEwXSAqIHogKyBhWzE0XTtcbiAgICAgICAgb3V0WzE1XSA9IGFbM10gKiB4ICsgYVs3XSAqIHkgKyBhWzExXSAqIHogKyBhWzE1XTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBhMDAgPSBhWzBdO1xuICAgICAgICBhMDEgPSBhWzFdO1xuICAgICAgICBhMDIgPSBhWzJdO1xuICAgICAgICBhMDMgPSBhWzNdO1xuICAgICAgICBhMTAgPSBhWzRdO1xuICAgICAgICBhMTEgPSBhWzVdO1xuICAgICAgICBhMTIgPSBhWzZdO1xuICAgICAgICBhMTMgPSBhWzddO1xuICAgICAgICBhMjAgPSBhWzhdO1xuICAgICAgICBhMjEgPSBhWzldO1xuICAgICAgICBhMjIgPSBhWzEwXTtcbiAgICAgICAgYTIzID0gYVsxMV07XG5cbiAgICAgICAgb3V0WzBdID0gYTAwO1xuICAgICAgICBvdXRbMV0gPSBhMDE7XG4gICAgICAgIG91dFsyXSA9IGEwMjtcbiAgICAgICAgb3V0WzNdID0gYTAzO1xuICAgICAgICBvdXRbNF0gPSBhMTA7XG4gICAgICAgIG91dFs1XSA9IGExMTtcbiAgICAgICAgb3V0WzZdID0gYTEyO1xuICAgICAgICBvdXRbN10gPSBhMTM7XG4gICAgICAgIG91dFs4XSA9IGEyMDtcbiAgICAgICAgb3V0WzldID0gYTIxO1xuICAgICAgICBvdXRbMTBdID0gYTIyO1xuICAgICAgICBvdXRbMTFdID0gYTIzO1xuXG4gICAgICAgIG91dFsxMl0gPSBhMDAgKiB4ICsgYTEwICogeSArIGEyMCAqIHogKyBhWzEyXTtcbiAgICAgICAgb3V0WzEzXSA9IGEwMSAqIHggKyBhMTEgKiB5ICsgYTIxICogeiArIGFbMTNdO1xuICAgICAgICBvdXRbMTRdID0gYTAyICogeCArIGExMiAqIHkgKyBhMjIgKiB6ICsgYVsxNF07XG4gICAgICAgIG91dFsxNV0gPSBhMDMgKiB4ICsgYTEzICogeSArIGEyMyAqIHogKyBhWzE1XTtcbiAgICB9XG5cbiAgICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFNjYWxlcyB0aGUgbWF0NCBieSB0aGUgZGltZW5zaW9ucyBpbiB0aGUgZ2l2ZW4gdmVjMyBub3QgdXNpbmcgdmVjdG9yaXphdGlvblxuICpcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDR9IGEgdGhlIG1hdHJpeCB0byBzY2FsZVxuICogQHBhcmFtIHt2ZWMzfSB2IHRoZSB2ZWMzIHRvIHNjYWxlIHRoZSBtYXRyaXggYnlcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcbiAqKi9cbmV4cG9ydCBmdW5jdGlvbiBzY2FsZShvdXQsIGEsIHYpIHtcbiAgICBsZXQgeCA9IHZbMF0sXG4gICAgICAgIHkgPSB2WzFdLFxuICAgICAgICB6ID0gdlsyXTtcblxuICAgIG91dFswXSA9IGFbMF0gKiB4O1xuICAgIG91dFsxXSA9IGFbMV0gKiB4O1xuICAgIG91dFsyXSA9IGFbMl0gKiB4O1xuICAgIG91dFszXSA9IGFbM10gKiB4O1xuICAgIG91dFs0XSA9IGFbNF0gKiB5O1xuICAgIG91dFs1XSA9IGFbNV0gKiB5O1xuICAgIG91dFs2XSA9IGFbNl0gKiB5O1xuICAgIG91dFs3XSA9IGFbN10gKiB5O1xuICAgIG91dFs4XSA9IGFbOF0gKiB6O1xuICAgIG91dFs5XSA9IGFbOV0gKiB6O1xuICAgIG91dFsxMF0gPSBhWzEwXSAqIHo7XG4gICAgb3V0WzExXSA9IGFbMTFdICogejtcbiAgICBvdXRbMTJdID0gYVsxMl07XG4gICAgb3V0WzEzXSA9IGFbMTNdO1xuICAgIG91dFsxNF0gPSBhWzE0XTtcbiAgICBvdXRbMTVdID0gYVsxNV07XG4gICAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBSb3RhdGVzIGEgbWF0NCBieSB0aGUgZ2l2ZW4gYW5nbGUgYXJvdW5kIHRoZSBnaXZlbiBheGlzXG4gKlxuICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0NH0gYSB0aGUgbWF0cml4IHRvIHJvdGF0ZVxuICogQHBhcmFtIHtOdW1iZXJ9IHJhZCB0aGUgYW5nbGUgdG8gcm90YXRlIHRoZSBtYXRyaXggYnlcbiAqIEBwYXJhbSB7dmVjM30gYXhpcyB0aGUgYXhpcyB0byByb3RhdGUgYXJvdW5kXG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByb3RhdGUob3V0LCBhLCByYWQsIGF4aXMpIHtcbiAgICBsZXQgeCA9IGF4aXNbMF0sXG4gICAgICAgIHkgPSBheGlzWzFdLFxuICAgICAgICB6ID0gYXhpc1syXTtcbiAgICBsZXQgbGVuID0gTWF0aC5oeXBvdCh4LCB5LCB6KTtcbiAgICBsZXQgcywgYywgdDtcbiAgICBsZXQgYTAwLCBhMDEsIGEwMiwgYTAzO1xuICAgIGxldCBhMTAsIGExMSwgYTEyLCBhMTM7XG4gICAgbGV0IGEyMCwgYTIxLCBhMjIsIGEyMztcbiAgICBsZXQgYjAwLCBiMDEsIGIwMjtcbiAgICBsZXQgYjEwLCBiMTEsIGIxMjtcbiAgICBsZXQgYjIwLCBiMjEsIGIyMjtcblxuICAgIGlmIChNYXRoLmFicyhsZW4pIDwgRVBTSUxPTikge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBsZW4gPSAxIC8gbGVuO1xuICAgIHggKj0gbGVuO1xuICAgIHkgKj0gbGVuO1xuICAgIHogKj0gbGVuO1xuXG4gICAgcyA9IE1hdGguc2luKHJhZCk7XG4gICAgYyA9IE1hdGguY29zKHJhZCk7XG4gICAgdCA9IDEgLSBjO1xuXG4gICAgYTAwID0gYVswXTtcbiAgICBhMDEgPSBhWzFdO1xuICAgIGEwMiA9IGFbMl07XG4gICAgYTAzID0gYVszXTtcbiAgICBhMTAgPSBhWzRdO1xuICAgIGExMSA9IGFbNV07XG4gICAgYTEyID0gYVs2XTtcbiAgICBhMTMgPSBhWzddO1xuICAgIGEyMCA9IGFbOF07XG4gICAgYTIxID0gYVs5XTtcbiAgICBhMjIgPSBhWzEwXTtcbiAgICBhMjMgPSBhWzExXTtcblxuICAgIC8vIENvbnN0cnVjdCB0aGUgZWxlbWVudHMgb2YgdGhlIHJvdGF0aW9uIG1hdHJpeFxuICAgIGIwMCA9IHggKiB4ICogdCArIGM7XG4gICAgYjAxID0geSAqIHggKiB0ICsgeiAqIHM7XG4gICAgYjAyID0geiAqIHggKiB0IC0geSAqIHM7XG4gICAgYjEwID0geCAqIHkgKiB0IC0geiAqIHM7XG4gICAgYjExID0geSAqIHkgKiB0ICsgYztcbiAgICBiMTIgPSB6ICogeSAqIHQgKyB4ICogcztcbiAgICBiMjAgPSB4ICogeiAqIHQgKyB5ICogcztcbiAgICBiMjEgPSB5ICogeiAqIHQgLSB4ICogcztcbiAgICBiMjIgPSB6ICogeiAqIHQgKyBjO1xuXG4gICAgLy8gUGVyZm9ybSByb3RhdGlvbi1zcGVjaWZpYyBtYXRyaXggbXVsdGlwbGljYXRpb25cbiAgICBvdXRbMF0gPSBhMDAgKiBiMDAgKyBhMTAgKiBiMDEgKyBhMjAgKiBiMDI7XG4gICAgb3V0WzFdID0gYTAxICogYjAwICsgYTExICogYjAxICsgYTIxICogYjAyO1xuICAgIG91dFsyXSA9IGEwMiAqIGIwMCArIGExMiAqIGIwMSArIGEyMiAqIGIwMjtcbiAgICBvdXRbM10gPSBhMDMgKiBiMDAgKyBhMTMgKiBiMDEgKyBhMjMgKiBiMDI7XG4gICAgb3V0WzRdID0gYTAwICogYjEwICsgYTEwICogYjExICsgYTIwICogYjEyO1xuICAgIG91dFs1XSA9IGEwMSAqIGIxMCArIGExMSAqIGIxMSArIGEyMSAqIGIxMjtcbiAgICBvdXRbNl0gPSBhMDIgKiBiMTAgKyBhMTIgKiBiMTEgKyBhMjIgKiBiMTI7XG4gICAgb3V0WzddID0gYTAzICogYjEwICsgYTEzICogYjExICsgYTIzICogYjEyO1xuICAgIG91dFs4XSA9IGEwMCAqIGIyMCArIGExMCAqIGIyMSArIGEyMCAqIGIyMjtcbiAgICBvdXRbOV0gPSBhMDEgKiBiMjAgKyBhMTEgKiBiMjEgKyBhMjEgKiBiMjI7XG4gICAgb3V0WzEwXSA9IGEwMiAqIGIyMCArIGExMiAqIGIyMSArIGEyMiAqIGIyMjtcbiAgICBvdXRbMTFdID0gYTAzICogYjIwICsgYTEzICogYjIxICsgYTIzICogYjIyO1xuXG4gICAgaWYgKGEgIT09IG91dCkge1xuICAgICAgICAvLyBJZiB0aGUgc291cmNlIGFuZCBkZXN0aW5hdGlvbiBkaWZmZXIsIGNvcHkgdGhlIHVuY2hhbmdlZCBsYXN0IHJvd1xuICAgICAgICBvdXRbMTJdID0gYVsxMl07XG4gICAgICAgIG91dFsxM10gPSBhWzEzXTtcbiAgICAgICAgb3V0WzE0XSA9IGFbMTRdO1xuICAgICAgICBvdXRbMTVdID0gYVsxNV07XG4gICAgfVxuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgdHJhbnNsYXRpb24gdmVjdG9yIGNvbXBvbmVudCBvZiBhIHRyYW5zZm9ybWF0aW9uXG4gKiAgbWF0cml4LiBJZiBhIG1hdHJpeCBpcyBidWlsdCB3aXRoIGZyb21Sb3RhdGlvblRyYW5zbGF0aW9uLFxuICogIHRoZSByZXR1cm5lZCB2ZWN0b3Igd2lsbCBiZSB0aGUgc2FtZSBhcyB0aGUgdHJhbnNsYXRpb24gdmVjdG9yXG4gKiAgb3JpZ2luYWxseSBzdXBwbGllZC5cbiAqIEBwYXJhbSAge3ZlYzN9IG91dCBWZWN0b3IgdG8gcmVjZWl2ZSB0cmFuc2xhdGlvbiBjb21wb25lbnRcbiAqIEBwYXJhbSAge21hdDR9IG1hdCBNYXRyaXggdG8gYmUgZGVjb21wb3NlZCAoaW5wdXQpXG4gKiBAcmV0dXJuIHt2ZWMzfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFRyYW5zbGF0aW9uKG91dCwgbWF0KSB7XG4gICAgb3V0WzBdID0gbWF0WzEyXTtcbiAgICBvdXRbMV0gPSBtYXRbMTNdO1xuICAgIG91dFsyXSA9IG1hdFsxNF07XG5cbiAgICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIHNjYWxpbmcgZmFjdG9yIGNvbXBvbmVudCBvZiBhIHRyYW5zZm9ybWF0aW9uXG4gKiAgbWF0cml4LiBJZiBhIG1hdHJpeCBpcyBidWlsdCB3aXRoIGZyb21Sb3RhdGlvblRyYW5zbGF0aW9uU2NhbGVcbiAqICB3aXRoIGEgbm9ybWFsaXplZCBRdWF0ZXJuaW9uIHBhcmFtdGVyLCB0aGUgcmV0dXJuZWQgdmVjdG9yIHdpbGwgYmVcbiAqICB0aGUgc2FtZSBhcyB0aGUgc2NhbGluZyB2ZWN0b3JcbiAqICBvcmlnaW5hbGx5IHN1cHBsaWVkLlxuICogQHBhcmFtICB7dmVjM30gb3V0IFZlY3RvciB0byByZWNlaXZlIHNjYWxpbmcgZmFjdG9yIGNvbXBvbmVudFxuICogQHBhcmFtICB7bWF0NH0gbWF0IE1hdHJpeCB0byBiZSBkZWNvbXBvc2VkIChpbnB1dClcbiAqIEByZXR1cm4ge3ZlYzN9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0U2NhbGluZyhvdXQsIG1hdCkge1xuICAgIGxldCBtMTEgPSBtYXRbMF07XG4gICAgbGV0IG0xMiA9IG1hdFsxXTtcbiAgICBsZXQgbTEzID0gbWF0WzJdO1xuICAgIGxldCBtMjEgPSBtYXRbNF07XG4gICAgbGV0IG0yMiA9IG1hdFs1XTtcbiAgICBsZXQgbTIzID0gbWF0WzZdO1xuICAgIGxldCBtMzEgPSBtYXRbOF07XG4gICAgbGV0IG0zMiA9IG1hdFs5XTtcbiAgICBsZXQgbTMzID0gbWF0WzEwXTtcblxuICAgIG91dFswXSA9IE1hdGguaHlwb3QobTExLCBtMTIsIG0xMyk7XG4gICAgb3V0WzFdID0gTWF0aC5oeXBvdChtMjEsIG0yMiwgbTIzKTtcbiAgICBvdXRbMl0gPSBNYXRoLmh5cG90KG0zMSwgbTMyLCBtMzMpO1xuXG4gICAgcmV0dXJuIG91dDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldE1heFNjYWxlT25BeGlzKG1hdCkge1xuICAgIGxldCBtMTEgPSBtYXRbMF07XG4gICAgbGV0IG0xMiA9IG1hdFsxXTtcbiAgICBsZXQgbTEzID0gbWF0WzJdO1xuICAgIGxldCBtMjEgPSBtYXRbNF07XG4gICAgbGV0IG0yMiA9IG1hdFs1XTtcbiAgICBsZXQgbTIzID0gbWF0WzZdO1xuICAgIGxldCBtMzEgPSBtYXRbOF07XG4gICAgbGV0IG0zMiA9IG1hdFs5XTtcbiAgICBsZXQgbTMzID0gbWF0WzEwXTtcblxuICAgIGNvbnN0IHggPSBtMTEgKiBtMTEgKyBtMTIgKiBtMTIgKyBtMTMgKiBtMTM7XG4gICAgY29uc3QgeSA9IG0yMSAqIG0yMSArIG0yMiAqIG0yMiArIG0yMyAqIG0yMztcbiAgICBjb25zdCB6ID0gbTMxICogbTMxICsgbTMyICogbTMyICsgbTMzICogbTMzO1xuXG4gICAgcmV0dXJuIE1hdGguc3FydChNYXRoLm1heCh4LCB5LCB6KSk7XG59XG5cbi8qKlxuICogUmV0dXJucyBhIHF1YXRlcm5pb24gcmVwcmVzZW50aW5nIHRoZSByb3RhdGlvbmFsIGNvbXBvbmVudFxuICogIG9mIGEgdHJhbnNmb3JtYXRpb24gbWF0cml4LiBJZiBhIG1hdHJpeCBpcyBidWlsdCB3aXRoXG4gKiAgZnJvbVJvdGF0aW9uVHJhbnNsYXRpb24sIHRoZSByZXR1cm5lZCBxdWF0ZXJuaW9uIHdpbGwgYmUgdGhlXG4gKiAgc2FtZSBhcyB0aGUgcXVhdGVybmlvbiBvcmlnaW5hbGx5IHN1cHBsaWVkLlxuICogQHBhcmFtIHtxdWF0fSBvdXQgUXVhdGVybmlvbiB0byByZWNlaXZlIHRoZSByb3RhdGlvbiBjb21wb25lbnRcbiAqIEBwYXJhbSB7bWF0NH0gbWF0IE1hdHJpeCB0byBiZSBkZWNvbXBvc2VkIChpbnB1dClcbiAqIEByZXR1cm4ge3F1YXR9IG91dFxuICovXG5leHBvcnQgY29uc3QgZ2V0Um90YXRpb24gPSAoZnVuY3Rpb24gKCkge1xuICAgIGNvbnN0IHRlbXAgPSBbMCwgMCwgMF07XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gKG91dCwgbWF0KSB7XG4gICAgICAgIGxldCBzY2FsaW5nID0gdGVtcDtcbiAgICAgICAgZ2V0U2NhbGluZyhzY2FsaW5nLCBtYXQpO1xuXG4gICAgICAgIGxldCBpczEgPSAxIC8gc2NhbGluZ1swXTtcbiAgICAgICAgbGV0IGlzMiA9IDEgLyBzY2FsaW5nWzFdO1xuICAgICAgICBsZXQgaXMzID0gMSAvIHNjYWxpbmdbMl07XG5cbiAgICAgICAgbGV0IHNtMTEgPSBtYXRbMF0gKiBpczE7XG4gICAgICAgIGxldCBzbTEyID0gbWF0WzFdICogaXMyO1xuICAgICAgICBsZXQgc20xMyA9IG1hdFsyXSAqIGlzMztcbiAgICAgICAgbGV0IHNtMjEgPSBtYXRbNF0gKiBpczE7XG4gICAgICAgIGxldCBzbTIyID0gbWF0WzVdICogaXMyO1xuICAgICAgICBsZXQgc20yMyA9IG1hdFs2XSAqIGlzMztcbiAgICAgICAgbGV0IHNtMzEgPSBtYXRbOF0gKiBpczE7XG4gICAgICAgIGxldCBzbTMyID0gbWF0WzldICogaXMyO1xuICAgICAgICBsZXQgc20zMyA9IG1hdFsxMF0gKiBpczM7XG5cbiAgICAgICAgbGV0IHRyYWNlID0gc20xMSArIHNtMjIgKyBzbTMzO1xuICAgICAgICBsZXQgUyA9IDA7XG5cbiAgICAgICAgaWYgKHRyYWNlID4gMCkge1xuICAgICAgICAgICAgUyA9IE1hdGguc3FydCh0cmFjZSArIDEuMCkgKiAyO1xuICAgICAgICAgICAgb3V0WzNdID0gMC4yNSAqIFM7XG4gICAgICAgICAgICBvdXRbMF0gPSAoc20yMyAtIHNtMzIpIC8gUztcbiAgICAgICAgICAgIG91dFsxXSA9IChzbTMxIC0gc20xMykgLyBTO1xuICAgICAgICAgICAgb3V0WzJdID0gKHNtMTIgLSBzbTIxKSAvIFM7XG4gICAgICAgIH0gZWxzZSBpZiAoc20xMSA+IHNtMjIgJiYgc20xMSA+IHNtMzMpIHtcbiAgICAgICAgICAgIFMgPSBNYXRoLnNxcnQoMS4wICsgc20xMSAtIHNtMjIgLSBzbTMzKSAqIDI7XG4gICAgICAgICAgICBvdXRbM10gPSAoc20yMyAtIHNtMzIpIC8gUztcbiAgICAgICAgICAgIG91dFswXSA9IDAuMjUgKiBTO1xuICAgICAgICAgICAgb3V0WzFdID0gKHNtMTIgKyBzbTIxKSAvIFM7XG4gICAgICAgICAgICBvdXRbMl0gPSAoc20zMSArIHNtMTMpIC8gUztcbiAgICAgICAgfSBlbHNlIGlmIChzbTIyID4gc20zMykge1xuICAgICAgICAgICAgUyA9IE1hdGguc3FydCgxLjAgKyBzbTIyIC0gc20xMSAtIHNtMzMpICogMjtcbiAgICAgICAgICAgIG91dFszXSA9IChzbTMxIC0gc20xMykgLyBTO1xuICAgICAgICAgICAgb3V0WzBdID0gKHNtMTIgKyBzbTIxKSAvIFM7XG4gICAgICAgICAgICBvdXRbMV0gPSAwLjI1ICogUztcbiAgICAgICAgICAgIG91dFsyXSA9IChzbTIzICsgc20zMikgLyBTO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgUyA9IE1hdGguc3FydCgxLjAgKyBzbTMzIC0gc20xMSAtIHNtMjIpICogMjtcbiAgICAgICAgICAgIG91dFszXSA9IChzbTEyIC0gc20yMSkgLyBTO1xuICAgICAgICAgICAgb3V0WzBdID0gKHNtMzEgKyBzbTEzKSAvIFM7XG4gICAgICAgICAgICBvdXRbMV0gPSAoc20yMyArIHNtMzIpIC8gUztcbiAgICAgICAgICAgIG91dFsyXSA9IDAuMjUgKiBTO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG91dDtcbiAgICB9O1xufSkoKTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgbWF0cml4IGZyb20gYSBxdWF0ZXJuaW9uIHJvdGF0aW9uLCB2ZWN0b3IgdHJhbnNsYXRpb24gYW5kIHZlY3RvciBzY2FsZVxuICogVGhpcyBpcyBlcXVpdmFsZW50IHRvIChidXQgbXVjaCBmYXN0ZXIgdGhhbik6XG4gKlxuICogICAgIG1hdDQuaWRlbnRpdHkoZGVzdCk7XG4gKiAgICAgbWF0NC50cmFuc2xhdGUoZGVzdCwgdmVjKTtcbiAqICAgICBsZXQgcXVhdE1hdCA9IG1hdDQuY3JlYXRlKCk7XG4gKiAgICAgcXVhdDQudG9NYXQ0KHF1YXQsIHF1YXRNYXQpO1xuICogICAgIG1hdDQubXVsdGlwbHkoZGVzdCwgcXVhdE1hdCk7XG4gKiAgICAgbWF0NC5zY2FsZShkZXN0LCBzY2FsZSlcbiAqXG4gKiBAcGFyYW0ge21hdDR9IG91dCBtYXQ0IHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XG4gKiBAcGFyYW0ge3F1YXQ0fSBxIFJvdGF0aW9uIHF1YXRlcm5pb25cbiAqIEBwYXJhbSB7dmVjM30gdiBUcmFuc2xhdGlvbiB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjM30gcyBTY2FsaW5nIHZlY3RvclxuICogQHJldHVybnMge21hdDR9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gZnJvbVJvdGF0aW9uVHJhbnNsYXRpb25TY2FsZShvdXQsIHEsIHYsIHMpIHtcbiAgICAvLyBRdWF0ZXJuaW9uIG1hdGhcbiAgICBsZXQgeCA9IHFbMF0sXG4gICAgICAgIHkgPSBxWzFdLFxuICAgICAgICB6ID0gcVsyXSxcbiAgICAgICAgdyA9IHFbM107XG4gICAgbGV0IHgyID0geCArIHg7XG4gICAgbGV0IHkyID0geSArIHk7XG4gICAgbGV0IHoyID0geiArIHo7XG5cbiAgICBsZXQgeHggPSB4ICogeDI7XG4gICAgbGV0IHh5ID0geCAqIHkyO1xuICAgIGxldCB4eiA9IHggKiB6MjtcbiAgICBsZXQgeXkgPSB5ICogeTI7XG4gICAgbGV0IHl6ID0geSAqIHoyO1xuICAgIGxldCB6eiA9IHogKiB6MjtcbiAgICBsZXQgd3ggPSB3ICogeDI7XG4gICAgbGV0IHd5ID0gdyAqIHkyO1xuICAgIGxldCB3eiA9IHcgKiB6MjtcbiAgICBsZXQgc3ggPSBzWzBdO1xuICAgIGxldCBzeSA9IHNbMV07XG4gICAgbGV0IHN6ID0gc1syXTtcblxuICAgIG91dFswXSA9ICgxIC0gKHl5ICsgenopKSAqIHN4O1xuICAgIG91dFsxXSA9ICh4eSArIHd6KSAqIHN4O1xuICAgIG91dFsyXSA9ICh4eiAtIHd5KSAqIHN4O1xuICAgIG91dFszXSA9IDA7XG4gICAgb3V0WzRdID0gKHh5IC0gd3opICogc3k7XG4gICAgb3V0WzVdID0gKDEgLSAoeHggKyB6eikpICogc3k7XG4gICAgb3V0WzZdID0gKHl6ICsgd3gpICogc3k7XG4gICAgb3V0WzddID0gMDtcbiAgICBvdXRbOF0gPSAoeHogKyB3eSkgKiBzejtcbiAgICBvdXRbOV0gPSAoeXogLSB3eCkgKiBzejtcbiAgICBvdXRbMTBdID0gKDEgLSAoeHggKyB5eSkpICogc3o7XG4gICAgb3V0WzExXSA9IDA7XG4gICAgb3V0WzEyXSA9IHZbMF07XG4gICAgb3V0WzEzXSA9IHZbMV07XG4gICAgb3V0WzE0XSA9IHZbMl07XG4gICAgb3V0WzE1XSA9IDE7XG5cbiAgICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIENhbGN1bGF0ZXMgYSA0eDQgbWF0cml4IGZyb20gdGhlIGdpdmVuIHF1YXRlcm5pb25cbiAqXG4gKiBAcGFyYW0ge21hdDR9IG91dCBtYXQ0IHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XG4gKiBAcGFyYW0ge3F1YXR9IHEgUXVhdGVybmlvbiB0byBjcmVhdGUgbWF0cml4IGZyb21cbiAqXG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmcm9tUXVhdChvdXQsIHEpIHtcbiAgICBsZXQgeCA9IHFbMF0sXG4gICAgICAgIHkgPSBxWzFdLFxuICAgICAgICB6ID0gcVsyXSxcbiAgICAgICAgdyA9IHFbM107XG4gICAgbGV0IHgyID0geCArIHg7XG4gICAgbGV0IHkyID0geSArIHk7XG4gICAgbGV0IHoyID0geiArIHo7XG5cbiAgICBsZXQgeHggPSB4ICogeDI7XG4gICAgbGV0IHl4ID0geSAqIHgyO1xuICAgIGxldCB5eSA9IHkgKiB5MjtcbiAgICBsZXQgenggPSB6ICogeDI7XG4gICAgbGV0IHp5ID0geiAqIHkyO1xuICAgIGxldCB6eiA9IHogKiB6MjtcbiAgICBsZXQgd3ggPSB3ICogeDI7XG4gICAgbGV0IHd5ID0gdyAqIHkyO1xuICAgIGxldCB3eiA9IHcgKiB6MjtcblxuICAgIG91dFswXSA9IDEgLSB5eSAtIHp6O1xuICAgIG91dFsxXSA9IHl4ICsgd3o7XG4gICAgb3V0WzJdID0genggLSB3eTtcbiAgICBvdXRbM10gPSAwO1xuXG4gICAgb3V0WzRdID0geXggLSB3ejtcbiAgICBvdXRbNV0gPSAxIC0geHggLSB6ejtcbiAgICBvdXRbNl0gPSB6eSArIHd4O1xuICAgIG91dFs3XSA9IDA7XG5cbiAgICBvdXRbOF0gPSB6eCArIHd5O1xuICAgIG91dFs5XSA9IHp5IC0gd3g7XG4gICAgb3V0WzEwXSA9IDEgLSB4eCAtIHl5O1xuICAgIG91dFsxMV0gPSAwO1xuXG4gICAgb3V0WzEyXSA9IDA7XG4gICAgb3V0WzEzXSA9IDA7XG4gICAgb3V0WzE0XSA9IDA7XG4gICAgb3V0WzE1XSA9IDE7XG5cbiAgICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIEdlbmVyYXRlcyBhIHBlcnNwZWN0aXZlIHByb2plY3Rpb24gbWF0cml4IHdpdGggdGhlIGdpdmVuIGJvdW5kc1xuICpcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IG1hdDQgZnJ1c3R1bSBtYXRyaXggd2lsbCBiZSB3cml0dGVuIGludG9cbiAqIEBwYXJhbSB7bnVtYmVyfSBsZWZ0IFZlcnRpY2FsIGZpZWxkIG9mIHZpZXcgaW4gcmFkaWFuc1xuICogQHBhcmFtIHtudW1iZXJ9IHJpZ2h0IEFzcGVjdCByYXRpby4gdHlwaWNhbGx5IHZpZXdwb3J0IHdpZHRoL2hlaWdodFxuICogQHBhcmFtIHtudW1iZXJ9IHRvcCBWZXJ0aWNhbCBmaWVsZCBvZiB2aWV3IGluIHJhZGlhbnNcbiAqIEBwYXJhbSB7bnVtYmVyfSBib3R0b20gQXNwZWN0IHJhdGlvLiB0eXBpY2FsbHkgdmlld3BvcnQgd2lkdGgvaGVpZ2h0XG4gKiBAcGFyYW0ge251bWJlcn0gbmVhciBOZWFyIGJvdW5kIG9mIHRoZSBmcnVzdHVtXG4gKiBAcGFyYW0ge251bWJlcn0gZmFyIEZhciBib3VuZCBvZiB0aGUgZnJ1c3R1bVxuICogQHJldHVybnMge21hdDR9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gcGVyc3BlY3RpdmVGcnVzdHJ1bShvdXQsIGxlZnQsIHJpZ2h0LCB0b3AsIGJvdHRvbSwgbmVhciwgZmFyKSB7XG4gICAgdmFyIHggPSAyICogbmVhciAvICggcmlnaHQgLSBsZWZ0ICk7XG4gICAgdmFyIHkgPSAyICogbmVhciAvICggdG9wIC0gYm90dG9tICk7XG5cbiAgICB2YXIgYSA9ICggcmlnaHQgKyBsZWZ0ICkgLyAoIHJpZ2h0IC0gbGVmdCApO1xuICAgIHZhciBiID0gKCB0b3AgKyBib3R0b20gKSAvICggdG9wIC0gYm90dG9tICk7XG4gICAgdmFyIGMgPSAtICggZmFyICsgbmVhciApIC8gKCBmYXIgLSBuZWFyICk7XG4gICAgdmFyIGQgPSAtIDIgKiBmYXIgKiBuZWFyIC8gKCBmYXIgLSBuZWFyICk7XG5cbiAgICBvdXRbIDAgXSA9IHg7XHRvdXRbIDQgXSA9IDA7XHRvdXRbIDggXSA9IGE7XHRvdXRbIDEyIF0gPSAwO1xuICAgIG91dFsgMSBdID0gMDtcdG91dFsgNSBdID0geTtcdG91dFsgOSBdID0gYjtcdG91dFsgMTMgXSA9IDA7XG4gICAgb3V0WyAyIF0gPSAwO1x0b3V0WyA2IF0gPSAwO1x0b3V0WyAxMCBdID0gYztcdG91dFsgMTQgXSA9IGQ7XG4gICAgb3V0WyAzIF0gPSAwO1x0b3V0WyA3IF0gPSAwO1x0b3V0WyAxMSBdID0gLSAxO1x0b3V0WyAxNSBdID0gMDtcblxuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogR2VuZXJhdGVzIGEgcGVyc3BlY3RpdmUgcHJvamVjdGlvbiBtYXRyaXggd2l0aCB0aGUgZ2l2ZW4gYm91bmRzXG4gKlxuICogQHBhcmFtIHttYXQ0fSBvdXQgbWF0NCBmcnVzdHVtIG1hdHJpeCB3aWxsIGJlIHdyaXR0ZW4gaW50b1xuICogQHBhcmFtIHtudW1iZXJ9IGZvdnkgVmVydGljYWwgZmllbGQgb2YgdmlldyBpbiByYWRpYW5zXG4gKiBAcGFyYW0ge251bWJlcn0gYXNwZWN0IEFzcGVjdCByYXRpby4gdHlwaWNhbGx5IHZpZXdwb3J0IHdpZHRoL2hlaWdodFxuICogQHBhcmFtIHtudW1iZXJ9IG5lYXIgTmVhciBib3VuZCBvZiB0aGUgZnJ1c3R1bVxuICogQHBhcmFtIHtudW1iZXJ9IGZhciBGYXIgYm91bmQgb2YgdGhlIGZydXN0dW1cbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBlcnNwZWN0aXZlKG91dCwgZm92eSwgYXNwZWN0LCBuZWFyLCBmYXIpIHtcbiAgICBsZXQgZiA9IDEuMCAvIE1hdGgudGFuKGZvdnkgLyAyKTtcbiAgICBsZXQgbmYgPSAxIC8gKG5lYXIgLSBmYXIpO1xuICAgIG91dFswXSA9IGYgLyBhc3BlY3Q7XG4gICAgb3V0WzFdID0gMDtcbiAgICBvdXRbMl0gPSAwO1xuICAgIG91dFszXSA9IDA7XG4gICAgb3V0WzRdID0gMDtcbiAgICBvdXRbNV0gPSBmO1xuICAgIG91dFs2XSA9IDA7XG4gICAgb3V0WzddID0gMDtcbiAgICBvdXRbOF0gPSAwO1xuICAgIG91dFs5XSA9IDA7XG4gICAgb3V0WzEwXSA9IChmYXIgKyBuZWFyKSAqIG5mO1xuICAgIG91dFsxMV0gPSAtMTtcbiAgICBvdXRbMTJdID0gMDtcbiAgICBvdXRbMTNdID0gMDtcbiAgICBvdXRbMTRdID0gMiAqIGZhciAqIG5lYXIgKiBuZjtcbiAgICBvdXRbMTVdID0gMDtcbiAgICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIEdlbmVyYXRlcyBhIG9ydGhvZ29uYWwgcHJvamVjdGlvbiBtYXRyaXggd2l0aCB0aGUgZ2l2ZW4gYm91bmRzXG4gKlxuICogQHBhcmFtIHttYXQ0fSBvdXQgbWF0NCBmcnVzdHVtIG1hdHJpeCB3aWxsIGJlIHdyaXR0ZW4gaW50b1xuICogQHBhcmFtIHtudW1iZXJ9IGxlZnQgTGVmdCBib3VuZCBvZiB0aGUgZnJ1c3R1bVxuICogQHBhcmFtIHtudW1iZXJ9IHJpZ2h0IFJpZ2h0IGJvdW5kIG9mIHRoZSBmcnVzdHVtXG4gKiBAcGFyYW0ge251bWJlcn0gYm90dG9tIEJvdHRvbSBib3VuZCBvZiB0aGUgZnJ1c3R1bVxuICogQHBhcmFtIHtudW1iZXJ9IHRvcCBUb3AgYm91bmQgb2YgdGhlIGZydXN0dW1cbiAqIEBwYXJhbSB7bnVtYmVyfSBuZWFyIE5lYXIgYm91bmQgb2YgdGhlIGZydXN0dW1cbiAqIEBwYXJhbSB7bnVtYmVyfSBmYXIgRmFyIGJvdW5kIG9mIHRoZSBmcnVzdHVtXG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBvcnRobyhvdXQsIGxlZnQsIHJpZ2h0LCBib3R0b20sIHRvcCwgbmVhciwgZmFyKSB7XG4gICAgbGV0IGxyID0gMSAvIChsZWZ0IC0gcmlnaHQpO1xuICAgIGxldCBidCA9IDEgLyAoYm90dG9tIC0gdG9wKTtcbiAgICBsZXQgbmYgPSAxIC8gKG5lYXIgLSBmYXIpO1xuICAgIG91dFswXSA9IC0yICogbHI7XG4gICAgb3V0WzFdID0gMDtcbiAgICBvdXRbMl0gPSAwO1xuICAgIG91dFszXSA9IDA7XG4gICAgb3V0WzRdID0gMDtcbiAgICBvdXRbNV0gPSAtMiAqIGJ0O1xuICAgIG91dFs2XSA9IDA7XG4gICAgb3V0WzddID0gMDtcbiAgICBvdXRbOF0gPSAwO1xuICAgIG91dFs5XSA9IDA7XG4gICAgb3V0WzEwXSA9IDIgKiBuZjtcbiAgICBvdXRbMTFdID0gMDtcbiAgICBvdXRbMTJdID0gKGxlZnQgKyByaWdodCkgKiBscjtcbiAgICBvdXRbMTNdID0gKHRvcCArIGJvdHRvbSkgKiBidDtcbiAgICBvdXRbMTRdID0gKGZhciArIG5lYXIpICogbmY7XG4gICAgb3V0WzE1XSA9IDE7XG4gICAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBHZW5lcmF0ZXMgYSBtYXRyaXggdGhhdCBtYWtlcyBzb21ldGhpbmcgbG9vayBhdCBzb21ldGhpbmcgZWxzZS5cbiAqXG4gKiBAcGFyYW0ge21hdDR9IG91dCBtYXQ0IGZydXN0dW0gbWF0cml4IHdpbGwgYmUgd3JpdHRlbiBpbnRvXG4gKiBAcGFyYW0ge3ZlYzN9IGV5ZSBQb3NpdGlvbiBvZiB0aGUgdmlld2VyXG4gKiBAcGFyYW0ge3ZlYzN9IHRhcmdldCBQb2ludCB0aGUgdmlld2VyIGlzIGxvb2tpbmcgYXRcbiAqIEBwYXJhbSB7dmVjM30gdXAgdmVjMyBwb2ludGluZyB1cFxuICogQHJldHVybnMge21hdDR9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gdGFyZ2V0VG8ob3V0LCBleWUsIHRhcmdldCwgdXApIHtcbiAgICBsZXQgZXlleCA9IGV5ZVswXSxcbiAgICAgICAgZXlleSA9IGV5ZVsxXSxcbiAgICAgICAgZXlleiA9IGV5ZVsyXSxcbiAgICAgICAgdXB4ID0gdXBbMF0sXG4gICAgICAgIHVweSA9IHVwWzFdLFxuICAgICAgICB1cHogPSB1cFsyXTtcblxuICAgIGxldCB6MCA9IGV5ZXggLSB0YXJnZXRbMF0sXG4gICAgICAgIHoxID0gZXlleSAtIHRhcmdldFsxXSxcbiAgICAgICAgejIgPSBleWV6IC0gdGFyZ2V0WzJdO1xuXG4gICAgbGV0IGxlbiA9IHowICogejAgKyB6MSAqIHoxICsgejIgKiB6MjtcbiAgICBpZiAobGVuID09PSAwKSB7XG4gICAgICAgIC8vIGV5ZSBhbmQgdGFyZ2V0IGFyZSBpbiB0aGUgc2FtZSBwb3NpdGlvblxuICAgICAgICB6MiA9IDE7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgbGVuID0gMSAvIE1hdGguc3FydChsZW4pO1xuICAgICAgICB6MCAqPSBsZW47XG4gICAgICAgIHoxICo9IGxlbjtcbiAgICAgICAgejIgKj0gbGVuO1xuICAgIH1cblxuICAgIGxldCB4MCA9IHVweSAqIHoyIC0gdXB6ICogejEsXG4gICAgICAgIHgxID0gdXB6ICogejAgLSB1cHggKiB6MixcbiAgICAgICAgeDIgPSB1cHggKiB6MSAtIHVweSAqIHowO1xuXG4gICAgbGVuID0geDAgKiB4MCArIHgxICogeDEgKyB4MiAqIHgyO1xuICAgIGlmIChsZW4gPT09IDApIHtcbiAgICAgICAgLy8gdXAgYW5kIHogYXJlIHBhcmFsbGVsXG4gICAgICAgIGlmICh1cHopIHtcbiAgICAgICAgICAgIHVweCArPSAxZS02O1xuICAgICAgICB9IGVsc2UgaWYgKHVweSkge1xuICAgICAgICAgICAgdXB6ICs9IDFlLTY7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB1cHkgKz0gMWUtNjtcbiAgICAgICAgfVxuICAgICAgICAoeDAgPSB1cHkgKiB6MiAtIHVweiAqIHoxKSwgKHgxID0gdXB6ICogejAgLSB1cHggKiB6MiksICh4MiA9IHVweCAqIHoxIC0gdXB5ICogejApO1xuXG4gICAgICAgIGxlbiA9IHgwICogeDAgKyB4MSAqIHgxICsgeDIgKiB4MjtcbiAgICB9XG5cbiAgICBsZW4gPSAxIC8gTWF0aC5zcXJ0KGxlbik7XG4gICAgeDAgKj0gbGVuO1xuICAgIHgxICo9IGxlbjtcbiAgICB4MiAqPSBsZW47XG5cbiAgICBvdXRbMF0gPSB4MDtcbiAgICBvdXRbMV0gPSB4MTtcbiAgICBvdXRbMl0gPSB4MjtcbiAgICBvdXRbM10gPSAwO1xuICAgIG91dFs0XSA9IHoxICogeDIgLSB6MiAqIHgxO1xuICAgIG91dFs1XSA9IHoyICogeDAgLSB6MCAqIHgyO1xuICAgIG91dFs2XSA9IHowICogeDEgLSB6MSAqIHgwO1xuICAgIG91dFs3XSA9IDA7XG4gICAgb3V0WzhdID0gejA7XG4gICAgb3V0WzldID0gejE7XG4gICAgb3V0WzEwXSA9IHoyO1xuICAgIG91dFsxMV0gPSAwO1xuICAgIG91dFsxMl0gPSBleWV4O1xuICAgIG91dFsxM10gPSBleWV5O1xuICAgIG91dFsxNF0gPSBleWV6O1xuICAgIG91dFsxNV0gPSAxO1xuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogQWRkcyB0d28gbWF0NCdzXG4gKlxuICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0NH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHttYXQ0fSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge21hdDR9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gYWRkKG91dCwgYSwgYikge1xuICAgIG91dFswXSA9IGFbMF0gKyBiWzBdO1xuICAgIG91dFsxXSA9IGFbMV0gKyBiWzFdO1xuICAgIG91dFsyXSA9IGFbMl0gKyBiWzJdO1xuICAgIG91dFszXSA9IGFbM10gKyBiWzNdO1xuICAgIG91dFs0XSA9IGFbNF0gKyBiWzRdO1xuICAgIG91dFs1XSA9IGFbNV0gKyBiWzVdO1xuICAgIG91dFs2XSA9IGFbNl0gKyBiWzZdO1xuICAgIG91dFs3XSA9IGFbN10gKyBiWzddO1xuICAgIG91dFs4XSA9IGFbOF0gKyBiWzhdO1xuICAgIG91dFs5XSA9IGFbOV0gKyBiWzldO1xuICAgIG91dFsxMF0gPSBhWzEwXSArIGJbMTBdO1xuICAgIG91dFsxMV0gPSBhWzExXSArIGJbMTFdO1xuICAgIG91dFsxMl0gPSBhWzEyXSArIGJbMTJdO1xuICAgIG91dFsxM10gPSBhWzEzXSArIGJbMTNdO1xuICAgIG91dFsxNF0gPSBhWzE0XSArIGJbMTRdO1xuICAgIG91dFsxNV0gPSBhWzE1XSArIGJbMTVdO1xuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogU3VidHJhY3RzIG1hdHJpeCBiIGZyb20gbWF0cml4IGFcbiAqXG4gKiBAcGFyYW0ge21hdDR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQ0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge21hdDR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzdWJ0cmFjdChvdXQsIGEsIGIpIHtcbiAgICBvdXRbMF0gPSBhWzBdIC0gYlswXTtcbiAgICBvdXRbMV0gPSBhWzFdIC0gYlsxXTtcbiAgICBvdXRbMl0gPSBhWzJdIC0gYlsyXTtcbiAgICBvdXRbM10gPSBhWzNdIC0gYlszXTtcbiAgICBvdXRbNF0gPSBhWzRdIC0gYls0XTtcbiAgICBvdXRbNV0gPSBhWzVdIC0gYls1XTtcbiAgICBvdXRbNl0gPSBhWzZdIC0gYls2XTtcbiAgICBvdXRbN10gPSBhWzddIC0gYls3XTtcbiAgICBvdXRbOF0gPSBhWzhdIC0gYls4XTtcbiAgICBvdXRbOV0gPSBhWzldIC0gYls5XTtcbiAgICBvdXRbMTBdID0gYVsxMF0gLSBiWzEwXTtcbiAgICBvdXRbMTFdID0gYVsxMV0gLSBiWzExXTtcbiAgICBvdXRbMTJdID0gYVsxMl0gLSBiWzEyXTtcbiAgICBvdXRbMTNdID0gYVsxM10gLSBiWzEzXTtcbiAgICBvdXRbMTRdID0gYVsxNF0gLSBiWzE0XTtcbiAgICBvdXRbMTVdID0gYVsxNV0gLSBiWzE1XTtcbiAgICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIE11bHRpcGx5IGVhY2ggZWxlbWVudCBvZiB0aGUgbWF0cml4IGJ5IGEgc2NhbGFyLlxuICpcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDR9IGEgdGhlIG1hdHJpeCB0byBzY2FsZVxuICogQHBhcmFtIHtOdW1iZXJ9IGIgYW1vdW50IHRvIHNjYWxlIHRoZSBtYXRyaXgncyBlbGVtZW50cyBieVxuICogQHJldHVybnMge21hdDR9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gbXVsdGlwbHlTY2FsYXIob3V0LCBhLCBiKSB7XG4gICAgb3V0WzBdID0gYVswXSAqIGI7XG4gICAgb3V0WzFdID0gYVsxXSAqIGI7XG4gICAgb3V0WzJdID0gYVsyXSAqIGI7XG4gICAgb3V0WzNdID0gYVszXSAqIGI7XG4gICAgb3V0WzRdID0gYVs0XSAqIGI7XG4gICAgb3V0WzVdID0gYVs1XSAqIGI7XG4gICAgb3V0WzZdID0gYVs2XSAqIGI7XG4gICAgb3V0WzddID0gYVs3XSAqIGI7XG4gICAgb3V0WzhdID0gYVs4XSAqIGI7XG4gICAgb3V0WzldID0gYVs5XSAqIGI7XG4gICAgb3V0WzEwXSA9IGFbMTBdICogYjtcbiAgICBvdXRbMTFdID0gYVsxMV0gKiBiO1xuICAgIG91dFsxMl0gPSBhWzEyXSAqIGI7XG4gICAgb3V0WzEzXSA9IGFbMTNdICogYjtcbiAgICBvdXRbMTRdID0gYVsxNF0gKiBiO1xuICAgIG91dFsxNV0gPSBhWzE1XSAqIGI7XG4gICAgcmV0dXJuIG91dDtcbn1cbiIsImltcG9ydCAqIGFzIHZlYzQgZnJvbSAnLi9WZWM0RnVuYy5qcyc7XG5cbi8qKlxuICogU2V0IGEgcXVhdCB0byB0aGUgaWRlbnRpdHkgcXVhdGVybmlvblxuICpcbiAqIEBwYXJhbSB7cXVhdH0gb3V0IHRoZSByZWNlaXZpbmcgcXVhdGVybmlvblxuICogQHJldHVybnMge3F1YXR9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gaWRlbnRpdHkob3V0KSB7XG4gICAgb3V0WzBdID0gMDtcbiAgICBvdXRbMV0gPSAwO1xuICAgIG91dFsyXSA9IDA7XG4gICAgb3V0WzNdID0gMTtcbiAgICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFNldHMgYSBxdWF0IGZyb20gdGhlIGdpdmVuIGFuZ2xlIGFuZCByb3RhdGlvbiBheGlzLFxuICogdGhlbiByZXR1cm5zIGl0LlxuICpcbiAqIEBwYXJhbSB7cXVhdH0gb3V0IHRoZSByZWNlaXZpbmcgcXVhdGVybmlvblxuICogQHBhcmFtIHt2ZWMzfSBheGlzIHRoZSBheGlzIGFyb3VuZCB3aGljaCB0byByb3RhdGVcbiAqIEBwYXJhbSB7TnVtYmVyfSByYWQgdGhlIGFuZ2xlIGluIHJhZGlhbnNcbiAqIEByZXR1cm5zIHtxdWF0fSBvdXRcbiAqKi9cbmV4cG9ydCBmdW5jdGlvbiBzZXRBeGlzQW5nbGUob3V0LCBheGlzLCByYWQpIHtcbiAgICByYWQgPSByYWQgKiAwLjU7XG4gICAgbGV0IHMgPSBNYXRoLnNpbihyYWQpO1xuICAgIG91dFswXSA9IHMgKiBheGlzWzBdO1xuICAgIG91dFsxXSA9IHMgKiBheGlzWzFdO1xuICAgIG91dFsyXSA9IHMgKiBheGlzWzJdO1xuICAgIG91dFszXSA9IE1hdGguY29zKHJhZCk7XG4gICAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBNdWx0aXBsaWVzIHR3byBxdWF0c1xuICpcbiAqIEBwYXJhbSB7cXVhdH0gb3V0IHRoZSByZWNlaXZpbmcgcXVhdGVybmlvblxuICogQHBhcmFtIHtxdWF0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3F1YXR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7cXVhdH0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtdWx0aXBseShvdXQsIGEsIGIpIHtcbiAgICBsZXQgYXggPSBhWzBdLFxuICAgICAgICBheSA9IGFbMV0sXG4gICAgICAgIGF6ID0gYVsyXSxcbiAgICAgICAgYXcgPSBhWzNdO1xuICAgIGxldCBieCA9IGJbMF0sXG4gICAgICAgIGJ5ID0gYlsxXSxcbiAgICAgICAgYnogPSBiWzJdLFxuICAgICAgICBidyA9IGJbM107XG5cbiAgICBvdXRbMF0gPSBheCAqIGJ3ICsgYXcgKiBieCArIGF5ICogYnogLSBheiAqIGJ5O1xuICAgIG91dFsxXSA9IGF5ICogYncgKyBhdyAqIGJ5ICsgYXogKiBieCAtIGF4ICogYno7XG4gICAgb3V0WzJdID0gYXogKiBidyArIGF3ICogYnogKyBheCAqIGJ5IC0gYXkgKiBieDtcbiAgICBvdXRbM10gPSBhdyAqIGJ3IC0gYXggKiBieCAtIGF5ICogYnkgLSBheiAqIGJ6O1xuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogUm90YXRlcyBhIHF1YXRlcm5pb24gYnkgdGhlIGdpdmVuIGFuZ2xlIGFib3V0IHRoZSBYIGF4aXNcbiAqXG4gKiBAcGFyYW0ge3F1YXR9IG91dCBxdWF0IHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XG4gKiBAcGFyYW0ge3F1YXR9IGEgcXVhdCB0byByb3RhdGVcbiAqIEBwYXJhbSB7bnVtYmVyfSByYWQgYW5nbGUgKGluIHJhZGlhbnMpIHRvIHJvdGF0ZVxuICogQHJldHVybnMge3F1YXR9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gcm90YXRlWChvdXQsIGEsIHJhZCkge1xuICAgIHJhZCAqPSAwLjU7XG5cbiAgICBsZXQgYXggPSBhWzBdLFxuICAgICAgICBheSA9IGFbMV0sXG4gICAgICAgIGF6ID0gYVsyXSxcbiAgICAgICAgYXcgPSBhWzNdO1xuICAgIGxldCBieCA9IE1hdGguc2luKHJhZCksXG4gICAgICAgIGJ3ID0gTWF0aC5jb3MocmFkKTtcblxuICAgIG91dFswXSA9IGF4ICogYncgKyBhdyAqIGJ4O1xuICAgIG91dFsxXSA9IGF5ICogYncgKyBheiAqIGJ4O1xuICAgIG91dFsyXSA9IGF6ICogYncgLSBheSAqIGJ4O1xuICAgIG91dFszXSA9IGF3ICogYncgLSBheCAqIGJ4O1xuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogUm90YXRlcyBhIHF1YXRlcm5pb24gYnkgdGhlIGdpdmVuIGFuZ2xlIGFib3V0IHRoZSBZIGF4aXNcbiAqXG4gKiBAcGFyYW0ge3F1YXR9IG91dCBxdWF0IHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XG4gKiBAcGFyYW0ge3F1YXR9IGEgcXVhdCB0byByb3RhdGVcbiAqIEBwYXJhbSB7bnVtYmVyfSByYWQgYW5nbGUgKGluIHJhZGlhbnMpIHRvIHJvdGF0ZVxuICogQHJldHVybnMge3F1YXR9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gcm90YXRlWShvdXQsIGEsIHJhZCkge1xuICAgIHJhZCAqPSAwLjU7XG5cbiAgICBsZXQgYXggPSBhWzBdLFxuICAgICAgICBheSA9IGFbMV0sXG4gICAgICAgIGF6ID0gYVsyXSxcbiAgICAgICAgYXcgPSBhWzNdO1xuICAgIGxldCBieSA9IE1hdGguc2luKHJhZCksXG4gICAgICAgIGJ3ID0gTWF0aC5jb3MocmFkKTtcblxuICAgIG91dFswXSA9IGF4ICogYncgLSBheiAqIGJ5O1xuICAgIG91dFsxXSA9IGF5ICogYncgKyBhdyAqIGJ5O1xuICAgIG91dFsyXSA9IGF6ICogYncgKyBheCAqIGJ5O1xuICAgIG91dFszXSA9IGF3ICogYncgLSBheSAqIGJ5O1xuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogUm90YXRlcyBhIHF1YXRlcm5pb24gYnkgdGhlIGdpdmVuIGFuZ2xlIGFib3V0IHRoZSBaIGF4aXNcbiAqXG4gKiBAcGFyYW0ge3F1YXR9IG91dCBxdWF0IHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XG4gKiBAcGFyYW0ge3F1YXR9IGEgcXVhdCB0byByb3RhdGVcbiAqIEBwYXJhbSB7bnVtYmVyfSByYWQgYW5nbGUgKGluIHJhZGlhbnMpIHRvIHJvdGF0ZVxuICogQHJldHVybnMge3F1YXR9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gcm90YXRlWihvdXQsIGEsIHJhZCkge1xuICAgIHJhZCAqPSAwLjU7XG5cbiAgICBsZXQgYXggPSBhWzBdLFxuICAgICAgICBheSA9IGFbMV0sXG4gICAgICAgIGF6ID0gYVsyXSxcbiAgICAgICAgYXcgPSBhWzNdO1xuICAgIGxldCBieiA9IE1hdGguc2luKHJhZCksXG4gICAgICAgIGJ3ID0gTWF0aC5jb3MocmFkKTtcblxuICAgIG91dFswXSA9IGF4ICogYncgKyBheSAqIGJ6O1xuICAgIG91dFsxXSA9IGF5ICogYncgLSBheCAqIGJ6O1xuICAgIG91dFsyXSA9IGF6ICogYncgKyBhdyAqIGJ6O1xuICAgIG91dFszXSA9IGF3ICogYncgLSBheiAqIGJ6O1xuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogUGVyZm9ybXMgYSBzcGhlcmljYWwgbGluZWFyIGludGVycG9sYXRpb24gYmV0d2VlbiB0d28gcXVhdFxuICpcbiAqIEBwYXJhbSB7cXVhdH0gb3V0IHRoZSByZWNlaXZpbmcgcXVhdGVybmlvblxuICogQHBhcmFtIHtxdWF0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3F1YXR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcGFyYW0ge051bWJlcn0gdCBpbnRlcnBvbGF0aW9uIGFtb3VudCBiZXR3ZWVuIHRoZSB0d28gaW5wdXRzXG4gKiBAcmV0dXJucyB7cXVhdH0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzbGVycChvdXQsIGEsIGIsIHQpIHtcbiAgICAvLyBiZW5jaG1hcmtzOlxuICAgIC8vICAgIGh0dHA6Ly9qc3BlcmYuY29tL3F1YXRlcm5pb24tc2xlcnAtaW1wbGVtZW50YXRpb25zXG4gICAgbGV0IGF4ID0gYVswXSxcbiAgICAgICAgYXkgPSBhWzFdLFxuICAgICAgICBheiA9IGFbMl0sXG4gICAgICAgIGF3ID0gYVszXTtcbiAgICBsZXQgYnggPSBiWzBdLFxuICAgICAgICBieSA9IGJbMV0sXG4gICAgICAgIGJ6ID0gYlsyXSxcbiAgICAgICAgYncgPSBiWzNdO1xuXG4gICAgbGV0IG9tZWdhLCBjb3NvbSwgc2lub20sIHNjYWxlMCwgc2NhbGUxO1xuXG4gICAgLy8gY2FsYyBjb3NpbmVcbiAgICBjb3NvbSA9IGF4ICogYnggKyBheSAqIGJ5ICsgYXogKiBieiArIGF3ICogYnc7XG4gICAgLy8gYWRqdXN0IHNpZ25zIChpZiBuZWNlc3NhcnkpXG4gICAgaWYgKGNvc29tIDwgMC4wKSB7XG4gICAgICAgIGNvc29tID0gLWNvc29tO1xuICAgICAgICBieCA9IC1ieDtcbiAgICAgICAgYnkgPSAtYnk7XG4gICAgICAgIGJ6ID0gLWJ6O1xuICAgICAgICBidyA9IC1idztcbiAgICB9XG4gICAgLy8gY2FsY3VsYXRlIGNvZWZmaWNpZW50c1xuICAgIGlmICgxLjAgLSBjb3NvbSA+IDAuMDAwMDAxKSB7XG4gICAgICAgIC8vIHN0YW5kYXJkIGNhc2UgKHNsZXJwKVxuICAgICAgICBvbWVnYSA9IE1hdGguYWNvcyhjb3NvbSk7XG4gICAgICAgIHNpbm9tID0gTWF0aC5zaW4ob21lZ2EpO1xuICAgICAgICBzY2FsZTAgPSBNYXRoLnNpbigoMS4wIC0gdCkgKiBvbWVnYSkgLyBzaW5vbTtcbiAgICAgICAgc2NhbGUxID0gTWF0aC5zaW4odCAqIG9tZWdhKSAvIHNpbm9tO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIFwiZnJvbVwiIGFuZCBcInRvXCIgcXVhdGVybmlvbnMgYXJlIHZlcnkgY2xvc2VcbiAgICAgICAgLy8gIC4uLiBzbyB3ZSBjYW4gZG8gYSBsaW5lYXIgaW50ZXJwb2xhdGlvblxuICAgICAgICBzY2FsZTAgPSAxLjAgLSB0O1xuICAgICAgICBzY2FsZTEgPSB0O1xuICAgIH1cbiAgICAvLyBjYWxjdWxhdGUgZmluYWwgdmFsdWVzXG4gICAgb3V0WzBdID0gc2NhbGUwICogYXggKyBzY2FsZTEgKiBieDtcbiAgICBvdXRbMV0gPSBzY2FsZTAgKiBheSArIHNjYWxlMSAqIGJ5O1xuICAgIG91dFsyXSA9IHNjYWxlMCAqIGF6ICsgc2NhbGUxICogYno7XG4gICAgb3V0WzNdID0gc2NhbGUwICogYXcgKyBzY2FsZTEgKiBidztcblxuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgaW52ZXJzZSBvZiBhIHF1YXRcbiAqXG4gKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cbiAqIEBwYXJhbSB7cXVhdH0gYSBxdWF0IHRvIGNhbGN1bGF0ZSBpbnZlcnNlIG9mXG4gKiBAcmV0dXJucyB7cXVhdH0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpbnZlcnQob3V0LCBhKSB7XG4gICAgbGV0IGEwID0gYVswXSxcbiAgICAgICAgYTEgPSBhWzFdLFxuICAgICAgICBhMiA9IGFbMl0sXG4gICAgICAgIGEzID0gYVszXTtcbiAgICBsZXQgZG90ID0gYTAgKiBhMCArIGExICogYTEgKyBhMiAqIGEyICsgYTMgKiBhMztcbiAgICBsZXQgaW52RG90ID0gZG90ID8gMS4wIC8gZG90IDogMDtcblxuICAgIC8vIFRPRE86IFdvdWxkIGJlIGZhc3RlciB0byByZXR1cm4gWzAsMCwwLDBdIGltbWVkaWF0ZWx5IGlmIGRvdCA9PSAwXG5cbiAgICBvdXRbMF0gPSAtYTAgKiBpbnZEb3Q7XG4gICAgb3V0WzFdID0gLWExICogaW52RG90O1xuICAgIG91dFsyXSA9IC1hMiAqIGludkRvdDtcbiAgICBvdXRbM10gPSBhMyAqIGludkRvdDtcbiAgICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGNvbmp1Z2F0ZSBvZiBhIHF1YXRcbiAqIElmIHRoZSBxdWF0ZXJuaW9uIGlzIG5vcm1hbGl6ZWQsIHRoaXMgZnVuY3Rpb24gaXMgZmFzdGVyIHRoYW4gcXVhdC5pbnZlcnNlIGFuZCBwcm9kdWNlcyB0aGUgc2FtZSByZXN1bHQuXG4gKlxuICogQHBhcmFtIHtxdWF0fSBvdXQgdGhlIHJlY2VpdmluZyBxdWF0ZXJuaW9uXG4gKiBAcGFyYW0ge3F1YXR9IGEgcXVhdCB0byBjYWxjdWxhdGUgY29uanVnYXRlIG9mXG4gKiBAcmV0dXJucyB7cXVhdH0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb25qdWdhdGUob3V0LCBhKSB7XG4gICAgb3V0WzBdID0gLWFbMF07XG4gICAgb3V0WzFdID0gLWFbMV07XG4gICAgb3V0WzJdID0gLWFbMl07XG4gICAgb3V0WzNdID0gYVszXTtcbiAgICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBxdWF0ZXJuaW9uIGZyb20gdGhlIGdpdmVuIDN4MyByb3RhdGlvbiBtYXRyaXguXG4gKlxuICogTk9URTogVGhlIHJlc3VsdGFudCBxdWF0ZXJuaW9uIGlzIG5vdCBub3JtYWxpemVkLCBzbyB5b3Ugc2hvdWxkIGJlIHN1cmVcbiAqIHRvIHJlbm9ybWFsaXplIHRoZSBxdWF0ZXJuaW9uIHlvdXJzZWxmIHdoZXJlIG5lY2Vzc2FyeS5cbiAqXG4gKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cbiAqIEBwYXJhbSB7bWF0M30gbSByb3RhdGlvbiBtYXRyaXhcbiAqIEByZXR1cm5zIHtxdWF0fSBvdXRcbiAqIEBmdW5jdGlvblxuICovXG5leHBvcnQgZnVuY3Rpb24gZnJvbU1hdDMob3V0LCBtKSB7XG4gICAgLy8gQWxnb3JpdGhtIGluIEtlbiBTaG9lbWFrZSdzIGFydGljbGUgaW4gMTk4NyBTSUdHUkFQSCBjb3Vyc2Ugbm90ZXNcbiAgICAvLyBhcnRpY2xlIFwiUXVhdGVybmlvbiBDYWxjdWx1cyBhbmQgRmFzdCBBbmltYXRpb25cIi5cbiAgICBsZXQgZlRyYWNlID0gbVswXSArIG1bNF0gKyBtWzhdO1xuICAgIGxldCBmUm9vdDtcblxuICAgIGlmIChmVHJhY2UgPiAwLjApIHtcbiAgICAgICAgLy8gfHd8ID4gMS8yLCBtYXkgYXMgd2VsbCBjaG9vc2UgdyA+IDEvMlxuICAgICAgICBmUm9vdCA9IE1hdGguc3FydChmVHJhY2UgKyAxLjApOyAvLyAyd1xuICAgICAgICBvdXRbM10gPSAwLjUgKiBmUm9vdDtcbiAgICAgICAgZlJvb3QgPSAwLjUgLyBmUm9vdDsgLy8gMS8oNHcpXG4gICAgICAgIG91dFswXSA9IChtWzVdIC0gbVs3XSkgKiBmUm9vdDtcbiAgICAgICAgb3V0WzFdID0gKG1bNl0gLSBtWzJdKSAqIGZSb290O1xuICAgICAgICBvdXRbMl0gPSAobVsxXSAtIG1bM10pICogZlJvb3Q7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgLy8gfHd8IDw9IDEvMlxuICAgICAgICBsZXQgaSA9IDA7XG4gICAgICAgIGlmIChtWzRdID4gbVswXSkgaSA9IDE7XG4gICAgICAgIGlmIChtWzhdID4gbVtpICogMyArIGldKSBpID0gMjtcbiAgICAgICAgbGV0IGogPSAoaSArIDEpICUgMztcbiAgICAgICAgbGV0IGsgPSAoaSArIDIpICUgMztcblxuICAgICAgICBmUm9vdCA9IE1hdGguc3FydChtW2kgKiAzICsgaV0gLSBtW2ogKiAzICsgal0gLSBtW2sgKiAzICsga10gKyAxLjApO1xuICAgICAgICBvdXRbaV0gPSAwLjUgKiBmUm9vdDtcbiAgICAgICAgZlJvb3QgPSAwLjUgLyBmUm9vdDtcbiAgICAgICAgb3V0WzNdID0gKG1baiAqIDMgKyBrXSAtIG1bayAqIDMgKyBqXSkgKiBmUm9vdDtcbiAgICAgICAgb3V0W2pdID0gKG1baiAqIDMgKyBpXSArIG1baSAqIDMgKyBqXSkgKiBmUm9vdDtcbiAgICAgICAgb3V0W2tdID0gKG1bayAqIDMgKyBpXSArIG1baSAqIDMgKyBrXSkgKiBmUm9vdDtcbiAgICB9XG5cbiAgICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBxdWF0ZXJuaW9uIGZyb20gdGhlIGdpdmVuIGV1bGVyIGFuZ2xlIHgsIHksIHouXG4gKlxuICogQHBhcmFtIHtxdWF0fSBvdXQgdGhlIHJlY2VpdmluZyBxdWF0ZXJuaW9uXG4gKiBAcGFyYW0ge3ZlYzN9IGV1bGVyIEFuZ2xlcyB0byByb3RhdGUgYXJvdW5kIGVhY2ggYXhpcyBpbiBkZWdyZWVzLlxuICogQHBhcmFtIHtTdHJpbmd9IG9yZGVyIGRldGFpbGluZyBvcmRlciBvZiBvcGVyYXRpb25zLiBEZWZhdWx0ICdYWVonLlxuICogQHJldHVybnMge3F1YXR9IG91dFxuICogQGZ1bmN0aW9uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmcm9tRXVsZXIob3V0LCBldWxlciwgb3JkZXIgPSAnWVhaJykge1xuICAgIGxldCBzeCA9IE1hdGguc2luKGV1bGVyWzBdICogMC41KTtcbiAgICBsZXQgY3ggPSBNYXRoLmNvcyhldWxlclswXSAqIDAuNSk7XG4gICAgbGV0IHN5ID0gTWF0aC5zaW4oZXVsZXJbMV0gKiAwLjUpO1xuICAgIGxldCBjeSA9IE1hdGguY29zKGV1bGVyWzFdICogMC41KTtcbiAgICBsZXQgc3ogPSBNYXRoLnNpbihldWxlclsyXSAqIDAuNSk7XG4gICAgbGV0IGN6ID0gTWF0aC5jb3MoZXVsZXJbMl0gKiAwLjUpO1xuXG4gICAgaWYgKG9yZGVyID09PSAnWFlaJykge1xuICAgICAgICBvdXRbMF0gPSBzeCAqIGN5ICogY3ogKyBjeCAqIHN5ICogc3o7XG4gICAgICAgIG91dFsxXSA9IGN4ICogc3kgKiBjeiAtIHN4ICogY3kgKiBzejtcbiAgICAgICAgb3V0WzJdID0gY3ggKiBjeSAqIHN6ICsgc3ggKiBzeSAqIGN6O1xuICAgICAgICBvdXRbM10gPSBjeCAqIGN5ICogY3ogLSBzeCAqIHN5ICogc3o7XG4gICAgfSBlbHNlIGlmIChvcmRlciA9PT0gJ1lYWicpIHtcbiAgICAgICAgb3V0WzBdID0gc3ggKiBjeSAqIGN6ICsgY3ggKiBzeSAqIHN6O1xuICAgICAgICBvdXRbMV0gPSBjeCAqIHN5ICogY3ogLSBzeCAqIGN5ICogc3o7XG4gICAgICAgIG91dFsyXSA9IGN4ICogY3kgKiBzeiAtIHN4ICogc3kgKiBjejtcbiAgICAgICAgb3V0WzNdID0gY3ggKiBjeSAqIGN6ICsgc3ggKiBzeSAqIHN6O1xuICAgIH0gZWxzZSBpZiAob3JkZXIgPT09ICdaWFknKSB7XG4gICAgICAgIG91dFswXSA9IHN4ICogY3kgKiBjeiAtIGN4ICogc3kgKiBzejtcbiAgICAgICAgb3V0WzFdID0gY3ggKiBzeSAqIGN6ICsgc3ggKiBjeSAqIHN6O1xuICAgICAgICBvdXRbMl0gPSBjeCAqIGN5ICogc3ogKyBzeCAqIHN5ICogY3o7XG4gICAgICAgIG91dFszXSA9IGN4ICogY3kgKiBjeiAtIHN4ICogc3kgKiBzejtcbiAgICB9IGVsc2UgaWYgKG9yZGVyID09PSAnWllYJykge1xuICAgICAgICBvdXRbMF0gPSBzeCAqIGN5ICogY3ogLSBjeCAqIHN5ICogc3o7XG4gICAgICAgIG91dFsxXSA9IGN4ICogc3kgKiBjeiArIHN4ICogY3kgKiBzejtcbiAgICAgICAgb3V0WzJdID0gY3ggKiBjeSAqIHN6IC0gc3ggKiBzeSAqIGN6O1xuICAgICAgICBvdXRbM10gPSBjeCAqIGN5ICogY3ogKyBzeCAqIHN5ICogc3o7XG4gICAgfSBlbHNlIGlmIChvcmRlciA9PT0gJ1laWCcpIHtcbiAgICAgICAgb3V0WzBdID0gc3ggKiBjeSAqIGN6ICsgY3ggKiBzeSAqIHN6O1xuICAgICAgICBvdXRbMV0gPSBjeCAqIHN5ICogY3ogKyBzeCAqIGN5ICogc3o7XG4gICAgICAgIG91dFsyXSA9IGN4ICogY3kgKiBzeiAtIHN4ICogc3kgKiBjejtcbiAgICAgICAgb3V0WzNdID0gY3ggKiBjeSAqIGN6IC0gc3ggKiBzeSAqIHN6O1xuICAgIH0gZWxzZSBpZiAob3JkZXIgPT09ICdYWlknKSB7XG4gICAgICAgIG91dFswXSA9IHN4ICogY3kgKiBjeiAtIGN4ICogc3kgKiBzejtcbiAgICAgICAgb3V0WzFdID0gY3ggKiBzeSAqIGN6IC0gc3ggKiBjeSAqIHN6O1xuICAgICAgICBvdXRbMl0gPSBjeCAqIGN5ICogc3ogKyBzeCAqIHN5ICogY3o7XG4gICAgICAgIG91dFszXSA9IGN4ICogY3kgKiBjeiArIHN4ICogc3kgKiBzejtcbiAgICB9XG5cbiAgICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIENvcHkgdGhlIHZhbHVlcyBmcm9tIG9uZSBxdWF0IHRvIGFub3RoZXJcbiAqXG4gKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cbiAqIEBwYXJhbSB7cXVhdH0gYSB0aGUgc291cmNlIHF1YXRlcm5pb25cbiAqIEByZXR1cm5zIHtxdWF0fSBvdXRcbiAqIEBmdW5jdGlvblxuICovXG5leHBvcnQgY29uc3QgY29weSA9IHZlYzQuY29weTtcblxuLyoqXG4gKiBTZXQgdGhlIGNvbXBvbmVudHMgb2YgYSBxdWF0IHRvIHRoZSBnaXZlbiB2YWx1ZXNcbiAqXG4gKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cbiAqIEBwYXJhbSB7TnVtYmVyfSB4IFggY29tcG9uZW50XG4gKiBAcGFyYW0ge051bWJlcn0geSBZIGNvbXBvbmVudFxuICogQHBhcmFtIHtOdW1iZXJ9IHogWiBjb21wb25lbnRcbiAqIEBwYXJhbSB7TnVtYmVyfSB3IFcgY29tcG9uZW50XG4gKiBAcmV0dXJucyB7cXVhdH0gb3V0XG4gKiBAZnVuY3Rpb25cbiAqL1xuZXhwb3J0IGNvbnN0IHNldCA9IHZlYzQuc2V0O1xuXG4vKipcbiAqIEFkZHMgdHdvIHF1YXQnc1xuICpcbiAqIEBwYXJhbSB7cXVhdH0gb3V0IHRoZSByZWNlaXZpbmcgcXVhdGVybmlvblxuICogQHBhcmFtIHtxdWF0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3F1YXR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7cXVhdH0gb3V0XG4gKiBAZnVuY3Rpb25cbiAqL1xuZXhwb3J0IGNvbnN0IGFkZCA9IHZlYzQuYWRkO1xuXG4vKipcbiAqIFNjYWxlcyBhIHF1YXQgYnkgYSBzY2FsYXIgbnVtYmVyXG4gKlxuICogQHBhcmFtIHtxdWF0fSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7cXVhdH0gYSB0aGUgdmVjdG9yIHRvIHNjYWxlXG4gKiBAcGFyYW0ge051bWJlcn0gYiBhbW91bnQgdG8gc2NhbGUgdGhlIHZlY3RvciBieVxuICogQHJldHVybnMge3F1YXR9IG91dFxuICogQGZ1bmN0aW9uXG4gKi9cbmV4cG9ydCBjb25zdCBzY2FsZSA9IHZlYzQuc2NhbGU7XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgZG90IHByb2R1Y3Qgb2YgdHdvIHF1YXQnc1xuICpcbiAqIEBwYXJhbSB7cXVhdH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHtxdWF0fSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge051bWJlcn0gZG90IHByb2R1Y3Qgb2YgYSBhbmQgYlxuICogQGZ1bmN0aW9uXG4gKi9cbmV4cG9ydCBjb25zdCBkb3QgPSB2ZWM0LmRvdDtcblxuLyoqXG4gKiBQZXJmb3JtcyBhIGxpbmVhciBpbnRlcnBvbGF0aW9uIGJldHdlZW4gdHdvIHF1YXQnc1xuICpcbiAqIEBwYXJhbSB7cXVhdH0gb3V0IHRoZSByZWNlaXZpbmcgcXVhdGVybmlvblxuICogQHBhcmFtIHtxdWF0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3F1YXR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcGFyYW0ge051bWJlcn0gdCBpbnRlcnBvbGF0aW9uIGFtb3VudCBiZXR3ZWVuIHRoZSB0d28gaW5wdXRzXG4gKiBAcmV0dXJucyB7cXVhdH0gb3V0XG4gKiBAZnVuY3Rpb25cbiAqL1xuZXhwb3J0IGNvbnN0IGxlcnAgPSB2ZWM0LmxlcnA7XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgbGVuZ3RoIG9mIGEgcXVhdFxuICpcbiAqIEBwYXJhbSB7cXVhdH0gYSB2ZWN0b3IgdG8gY2FsY3VsYXRlIGxlbmd0aCBvZlxuICogQHJldHVybnMge051bWJlcn0gbGVuZ3RoIG9mIGFcbiAqL1xuZXhwb3J0IGNvbnN0IGxlbmd0aCA9IHZlYzQubGVuZ3RoO1xuXG4vKipcbiAqIE5vcm1hbGl6ZSBhIHF1YXRcbiAqXG4gKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cbiAqIEBwYXJhbSB7cXVhdH0gYSBxdWF0ZXJuaW9uIHRvIG5vcm1hbGl6ZVxuICogQHJldHVybnMge3F1YXR9IG91dFxuICogQGZ1bmN0aW9uXG4gKi9cbmV4cG9ydCBjb25zdCBub3JtYWxpemUgPSB2ZWM0Lm5vcm1hbGl6ZTtcbiIsImNvbnN0IEVQU0lMT04gPSAwLjAwMDAwMTtcblxuLyoqXG4gKiBDb3B5IHRoZSB2YWx1ZXMgZnJvbSBvbmUgdmVjMiB0byBhbm90aGVyXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgc291cmNlIHZlY3RvclxuICogQHJldHVybnMge3ZlYzJ9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gY29weShvdXQsIGEpIHtcbiAgICBvdXRbMF0gPSBhWzBdO1xuICAgIG91dFsxXSA9IGFbMV07XG4gICAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBTZXQgdGhlIGNvbXBvbmVudHMgb2YgYSB2ZWMyIHRvIHRoZSBnaXZlbiB2YWx1ZXNcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHtOdW1iZXJ9IHggWCBjb21wb25lbnRcbiAqIEBwYXJhbSB7TnVtYmVyfSB5IFkgY29tcG9uZW50XG4gKiBAcmV0dXJucyB7dmVjMn0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZXQob3V0LCB4LCB5KSB7XG4gICAgb3V0WzBdID0geDtcbiAgICBvdXRbMV0gPSB5O1xuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogQWRkcyB0d28gdmVjMidzXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMyfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge3ZlYzJ9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gYWRkKG91dCwgYSwgYikge1xuICAgIG91dFswXSA9IGFbMF0gKyBiWzBdO1xuICAgIG91dFsxXSA9IGFbMV0gKyBiWzFdO1xuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogU3VidHJhY3RzIHZlY3RvciBiIGZyb20gdmVjdG9yIGFcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMyfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzJ9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7dmVjMn0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzdWJ0cmFjdChvdXQsIGEsIGIpIHtcbiAgICBvdXRbMF0gPSBhWzBdIC0gYlswXTtcbiAgICBvdXRbMV0gPSBhWzFdIC0gYlsxXTtcbiAgICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIE11bHRpcGxpZXMgdHdvIHZlYzInc1xuICpcbiAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjMn0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG11bHRpcGx5KG91dCwgYSwgYikge1xuICAgIG91dFswXSA9IGFbMF0gKiBiWzBdO1xuICAgIG91dFsxXSA9IGFbMV0gKiBiWzFdO1xuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogRGl2aWRlcyB0d28gdmVjMidzXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMyfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge3ZlYzJ9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gZGl2aWRlKG91dCwgYSwgYikge1xuICAgIG91dFswXSA9IGFbMF0gLyBiWzBdO1xuICAgIG91dFsxXSA9IGFbMV0gLyBiWzFdO1xuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogU2NhbGVzIGEgdmVjMiBieSBhIHNjYWxhciBudW1iZXJcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMyfSBhIHRoZSB2ZWN0b3IgdG8gc2NhbGVcbiAqIEBwYXJhbSB7TnVtYmVyfSBiIGFtb3VudCB0byBzY2FsZSB0aGUgdmVjdG9yIGJ5XG4gKiBAcmV0dXJucyB7dmVjMn0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzY2FsZShvdXQsIGEsIGIpIHtcbiAgICBvdXRbMF0gPSBhWzBdICogYjtcbiAgICBvdXRbMV0gPSBhWzFdICogYjtcbiAgICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGV1Y2xpZGlhbiBkaXN0YW5jZSBiZXR3ZWVuIHR3byB2ZWMyJ3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjMn0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IGRpc3RhbmNlIGJldHdlZW4gYSBhbmQgYlxuICovXG5leHBvcnQgZnVuY3Rpb24gZGlzdGFuY2UoYSwgYikge1xuICAgIHZhciB4ID0gYlswXSAtIGFbMF0sXG4gICAgICAgIHkgPSBiWzFdIC0gYVsxXTtcbiAgICByZXR1cm4gTWF0aC5zcXJ0KHggKiB4ICsgeSAqIHkpO1xufVxuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIHNxdWFyZWQgZXVjbGlkaWFuIGRpc3RhbmNlIGJldHdlZW4gdHdvIHZlYzInc1xuICpcbiAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMyfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge051bWJlcn0gc3F1YXJlZCBkaXN0YW5jZSBiZXR3ZWVuIGEgYW5kIGJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNxdWFyZWREaXN0YW5jZShhLCBiKSB7XG4gICAgdmFyIHggPSBiWzBdIC0gYVswXSxcbiAgICAgICAgeSA9IGJbMV0gLSBhWzFdO1xuICAgIHJldHVybiB4ICogeCArIHkgKiB5O1xufVxuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGxlbmd0aCBvZiBhIHZlYzJcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdmVjdG9yIHRvIGNhbGN1bGF0ZSBsZW5ndGggb2ZcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IGxlbmd0aCBvZiBhXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBsZW5ndGgoYSkge1xuICAgIHZhciB4ID0gYVswXSxcbiAgICAgICAgeSA9IGFbMV07XG4gICAgcmV0dXJuIE1hdGguc3FydCh4ICogeCArIHkgKiB5KTtcbn1cblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBzcXVhcmVkIGxlbmd0aCBvZiBhIHZlYzJcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdmVjdG9yIHRvIGNhbGN1bGF0ZSBzcXVhcmVkIGxlbmd0aCBvZlxuICogQHJldHVybnMge051bWJlcn0gc3F1YXJlZCBsZW5ndGggb2YgYVxuICovXG5leHBvcnQgZnVuY3Rpb24gc3F1YXJlZExlbmd0aChhKSB7XG4gICAgdmFyIHggPSBhWzBdLFxuICAgICAgICB5ID0gYVsxXTtcbiAgICByZXR1cm4geCAqIHggKyB5ICogeTtcbn1cblxuLyoqXG4gKiBOZWdhdGVzIHRoZSBjb21wb25lbnRzIG9mIGEgdmVjMlxuICpcbiAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdmVjdG9yIHRvIG5lZ2F0ZVxuICogQHJldHVybnMge3ZlYzJ9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gbmVnYXRlKG91dCwgYSkge1xuICAgIG91dFswXSA9IC1hWzBdO1xuICAgIG91dFsxXSA9IC1hWzFdO1xuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgaW52ZXJzZSBvZiB0aGUgY29tcG9uZW50cyBvZiBhIHZlYzJcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMyfSBhIHZlY3RvciB0byBpbnZlcnRcbiAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGludmVyc2Uob3V0LCBhKSB7XG4gICAgb3V0WzBdID0gMS4wIC8gYVswXTtcbiAgICBvdXRbMV0gPSAxLjAgLyBhWzFdO1xuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogTm9ybWFsaXplIGEgdmVjMlxuICpcbiAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdmVjdG9yIHRvIG5vcm1hbGl6ZVxuICogQHJldHVybnMge3ZlYzJ9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gbm9ybWFsaXplKG91dCwgYSkge1xuICAgIHZhciB4ID0gYVswXSxcbiAgICAgICAgeSA9IGFbMV07XG4gICAgdmFyIGxlbiA9IHggKiB4ICsgeSAqIHk7XG4gICAgaWYgKGxlbiA+IDApIHtcbiAgICAgICAgLy9UT0RPOiBldmFsdWF0ZSB1c2Ugb2YgZ2xtX2ludnNxcnQgaGVyZT9cbiAgICAgICAgbGVuID0gMSAvIE1hdGguc3FydChsZW4pO1xuICAgIH1cbiAgICBvdXRbMF0gPSBhWzBdICogbGVuO1xuICAgIG91dFsxXSA9IGFbMV0gKiBsZW47XG4gICAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBkb3QgcHJvZHVjdCBvZiB0d28gdmVjMidzXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzJ9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBkb3QgcHJvZHVjdCBvZiBhIGFuZCBiXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkb3QoYSwgYikge1xuICAgIHJldHVybiBhWzBdICogYlswXSArIGFbMV0gKiBiWzFdO1xufVxuXG4vKipcbiAqIENvbXB1dGVzIHRoZSBjcm9zcyBwcm9kdWN0IG9mIHR3byB2ZWMyJ3NcbiAqIE5vdGUgdGhhdCB0aGUgY3Jvc3MgcHJvZHVjdCByZXR1cm5zIGEgc2NhbGFyXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzJ9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBjcm9zcyBwcm9kdWN0IG9mIGEgYW5kIGJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyb3NzKGEsIGIpIHtcbiAgICByZXR1cm4gYVswXSAqIGJbMV0gLSBhWzFdICogYlswXTtcbn1cblxuLyoqXG4gKiBQZXJmb3JtcyBhIGxpbmVhciBpbnRlcnBvbGF0aW9uIGJldHdlZW4gdHdvIHZlYzInc1xuICpcbiAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjMn0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEBwYXJhbSB7TnVtYmVyfSB0IGludGVycG9sYXRpb24gYW1vdW50IGJldHdlZW4gdGhlIHR3byBpbnB1dHNcbiAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxlcnAob3V0LCBhLCBiLCB0KSB7XG4gICAgdmFyIGF4ID0gYVswXSxcbiAgICAgICAgYXkgPSBhWzFdO1xuICAgIG91dFswXSA9IGF4ICsgdCAqIChiWzBdIC0gYXgpO1xuICAgIG91dFsxXSA9IGF5ICsgdCAqIChiWzFdIC0gYXkpO1xuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogVHJhbnNmb3JtcyB0aGUgdmVjMiB3aXRoIGEgbWF0MlxuICpcbiAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIHZlY3RvciB0byB0cmFuc2Zvcm1cbiAqIEBwYXJhbSB7bWF0Mn0gbSBtYXRyaXggdG8gdHJhbnNmb3JtIHdpdGhcbiAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRyYW5zZm9ybU1hdDIob3V0LCBhLCBtKSB7XG4gICAgdmFyIHggPSBhWzBdLFxuICAgICAgICB5ID0gYVsxXTtcbiAgICBvdXRbMF0gPSBtWzBdICogeCArIG1bMl0gKiB5O1xuICAgIG91dFsxXSA9IG1bMV0gKiB4ICsgbVszXSAqIHk7XG4gICAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBUcmFuc2Zvcm1zIHRoZSB2ZWMyIHdpdGggYSBtYXQyZFxuICpcbiAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIHZlY3RvciB0byB0cmFuc2Zvcm1cbiAqIEBwYXJhbSB7bWF0MmR9IG0gbWF0cml4IHRvIHRyYW5zZm9ybSB3aXRoXG4gKiBAcmV0dXJucyB7dmVjMn0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0cmFuc2Zvcm1NYXQyZChvdXQsIGEsIG0pIHtcbiAgICB2YXIgeCA9IGFbMF0sXG4gICAgICAgIHkgPSBhWzFdO1xuICAgIG91dFswXSA9IG1bMF0gKiB4ICsgbVsyXSAqIHkgKyBtWzRdO1xuICAgIG91dFsxXSA9IG1bMV0gKiB4ICsgbVszXSAqIHkgKyBtWzVdO1xuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogVHJhbnNmb3JtcyB0aGUgdmVjMiB3aXRoIGEgbWF0M1xuICogM3JkIHZlY3RvciBjb21wb25lbnQgaXMgaW1wbGljaXRseSAnMSdcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMyfSBhIHRoZSB2ZWN0b3IgdG8gdHJhbnNmb3JtXG4gKiBAcGFyYW0ge21hdDN9IG0gbWF0cml4IHRvIHRyYW5zZm9ybSB3aXRoXG4gKiBAcmV0dXJucyB7dmVjMn0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0cmFuc2Zvcm1NYXQzKG91dCwgYSwgbSkge1xuICAgIHZhciB4ID0gYVswXSxcbiAgICAgICAgeSA9IGFbMV07XG4gICAgb3V0WzBdID0gbVswXSAqIHggKyBtWzNdICogeSArIG1bNl07XG4gICAgb3V0WzFdID0gbVsxXSAqIHggKyBtWzRdICogeSArIG1bN107XG4gICAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBUcmFuc2Zvcm1zIHRoZSB2ZWMyIHdpdGggYSBtYXQ0XG4gKiAzcmQgdmVjdG9yIGNvbXBvbmVudCBpcyBpbXBsaWNpdGx5ICcwJ1xuICogNHRoIHZlY3RvciBjb21wb25lbnQgaXMgaW1wbGljaXRseSAnMSdcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMyfSBhIHRoZSB2ZWN0b3IgdG8gdHJhbnNmb3JtXG4gKiBAcGFyYW0ge21hdDR9IG0gbWF0cml4IHRvIHRyYW5zZm9ybSB3aXRoXG4gKiBAcmV0dXJucyB7dmVjMn0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0cmFuc2Zvcm1NYXQ0KG91dCwgYSwgbSkge1xuICAgIGxldCB4ID0gYVswXTtcbiAgICBsZXQgeSA9IGFbMV07XG4gICAgb3V0WzBdID0gbVswXSAqIHggKyBtWzRdICogeSArIG1bMTJdO1xuICAgIG91dFsxXSA9IG1bMV0gKiB4ICsgbVs1XSAqIHkgKyBtWzEzXTtcbiAgICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFJldHVybnMgd2hldGhlciBvciBub3QgdGhlIHZlY3RvcnMgZXhhY3RseSBoYXZlIHRoZSBzYW1lIGVsZW1lbnRzIGluIHRoZSBzYW1lIHBvc2l0aW9uICh3aGVuIGNvbXBhcmVkIHdpdGggPT09KVxuICpcbiAqIEBwYXJhbSB7dmVjMn0gYSBUaGUgZmlyc3QgdmVjdG9yLlxuICogQHBhcmFtIHt2ZWMyfSBiIFRoZSBzZWNvbmQgdmVjdG9yLlxuICogQHJldHVybnMge0Jvb2xlYW59IFRydWUgaWYgdGhlIHZlY3RvcnMgYXJlIGVxdWFsLCBmYWxzZSBvdGhlcndpc2UuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBleGFjdEVxdWFscyhhLCBiKSB7XG4gICAgcmV0dXJuIGFbMF0gPT09IGJbMF0gJiYgYVsxXSA9PT0gYlsxXTtcbn1cbiIsImNvbnN0IEVQU0lMT04gPSAwLjAwMDAwMTtcblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBsZW5ndGggb2YgYSB2ZWMzXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBhIHZlY3RvciB0byBjYWxjdWxhdGUgbGVuZ3RoIG9mXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBsZW5ndGggb2YgYVxuICovXG5leHBvcnQgZnVuY3Rpb24gbGVuZ3RoKGEpIHtcbiAgICBsZXQgeCA9IGFbMF07XG4gICAgbGV0IHkgPSBhWzFdO1xuICAgIGxldCB6ID0gYVsyXTtcbiAgICByZXR1cm4gTWF0aC5zcXJ0KHggKiB4ICsgeSAqIHkgKyB6ICogeik7XG59XG5cbi8qKlxuICogQ29weSB0aGUgdmFsdWVzIGZyb20gb25lIHZlYzMgdG8gYW5vdGhlclxuICpcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIHNvdXJjZSB2ZWN0b3JcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvcHkob3V0LCBhKSB7XG4gICAgb3V0WzBdID0gYVswXTtcbiAgICBvdXRbMV0gPSBhWzFdO1xuICAgIG91dFsyXSA9IGFbMl07XG4gICAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBTZXQgdGhlIGNvbXBvbmVudHMgb2YgYSB2ZWMzIHRvIHRoZSBnaXZlbiB2YWx1ZXNcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHtOdW1iZXJ9IHggWCBjb21wb25lbnRcbiAqIEBwYXJhbSB7TnVtYmVyfSB5IFkgY29tcG9uZW50XG4gKiBAcGFyYW0ge051bWJlcn0geiBaIGNvbXBvbmVudFxuICogQHJldHVybnMge3ZlYzN9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gc2V0KG91dCwgeCwgeSwgeikge1xuICAgIG91dFswXSA9IHg7XG4gICAgb3V0WzFdID0geTtcbiAgICBvdXRbMl0gPSB6O1xuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogQWRkcyB0d28gdmVjMydzXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjM30gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge3ZlYzN9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gYWRkKG91dCwgYSwgYikge1xuICAgIG91dFswXSA9IGFbMF0gKyBiWzBdO1xuICAgIG91dFsxXSA9IGFbMV0gKyBiWzFdO1xuICAgIG91dFsyXSA9IGFbMl0gKyBiWzJdO1xuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogU3VidHJhY3RzIHZlY3RvciBiIGZyb20gdmVjdG9yIGFcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzdWJ0cmFjdChvdXQsIGEsIGIpIHtcbiAgICBvdXRbMF0gPSBhWzBdIC0gYlswXTtcbiAgICBvdXRbMV0gPSBhWzFdIC0gYlsxXTtcbiAgICBvdXRbMl0gPSBhWzJdIC0gYlsyXTtcbiAgICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIE11bHRpcGxpZXMgdHdvIHZlYzMnc1xuICpcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjM30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG11bHRpcGx5KG91dCwgYSwgYikge1xuICAgIG91dFswXSA9IGFbMF0gKiBiWzBdO1xuICAgIG91dFsxXSA9IGFbMV0gKiBiWzFdO1xuICAgIG91dFsyXSA9IGFbMl0gKiBiWzJdO1xuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogRGl2aWRlcyB0d28gdmVjMydzXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjM30gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge3ZlYzN9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gZGl2aWRlKG91dCwgYSwgYikge1xuICAgIG91dFswXSA9IGFbMF0gLyBiWzBdO1xuICAgIG91dFsxXSA9IGFbMV0gLyBiWzFdO1xuICAgIG91dFsyXSA9IGFbMl0gLyBiWzJdO1xuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogU2NhbGVzIGEgdmVjMyBieSBhIHNjYWxhciBudW1iZXJcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMzfSBhIHRoZSB2ZWN0b3IgdG8gc2NhbGVcbiAqIEBwYXJhbSB7TnVtYmVyfSBiIGFtb3VudCB0byBzY2FsZSB0aGUgdmVjdG9yIGJ5XG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzY2FsZShvdXQsIGEsIGIpIHtcbiAgICBvdXRbMF0gPSBhWzBdICogYjtcbiAgICBvdXRbMV0gPSBhWzFdICogYjtcbiAgICBvdXRbMl0gPSBhWzJdICogYjtcbiAgICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGV1Y2xpZGlhbiBkaXN0YW5jZSBiZXR3ZWVuIHR3byB2ZWMzJ3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjM30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IGRpc3RhbmNlIGJldHdlZW4gYSBhbmQgYlxuICovXG5leHBvcnQgZnVuY3Rpb24gZGlzdGFuY2UoYSwgYikge1xuICAgIGxldCB4ID0gYlswXSAtIGFbMF07XG4gICAgbGV0IHkgPSBiWzFdIC0gYVsxXTtcbiAgICBsZXQgeiA9IGJbMl0gLSBhWzJdO1xuICAgIHJldHVybiBNYXRoLnNxcnQoeCAqIHggKyB5ICogeSArIHogKiB6KTtcbn1cblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBzcXVhcmVkIGV1Y2xpZGlhbiBkaXN0YW5jZSBiZXR3ZWVuIHR3byB2ZWMzJ3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjM30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IHNxdWFyZWQgZGlzdGFuY2UgYmV0d2VlbiBhIGFuZCBiXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzcXVhcmVkRGlzdGFuY2UoYSwgYikge1xuICAgIGxldCB4ID0gYlswXSAtIGFbMF07XG4gICAgbGV0IHkgPSBiWzFdIC0gYVsxXTtcbiAgICBsZXQgeiA9IGJbMl0gLSBhWzJdO1xuICAgIHJldHVybiB4ICogeCArIHkgKiB5ICsgeiAqIHo7XG59XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgc3F1YXJlZCBsZW5ndGggb2YgYSB2ZWMzXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBhIHZlY3RvciB0byBjYWxjdWxhdGUgc3F1YXJlZCBsZW5ndGggb2ZcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IHNxdWFyZWQgbGVuZ3RoIG9mIGFcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNxdWFyZWRMZW5ndGgoYSkge1xuICAgIGxldCB4ID0gYVswXTtcbiAgICBsZXQgeSA9IGFbMV07XG4gICAgbGV0IHogPSBhWzJdO1xuICAgIHJldHVybiB4ICogeCArIHkgKiB5ICsgeiAqIHo7XG59XG5cbi8qKlxuICogTmVnYXRlcyB0aGUgY29tcG9uZW50cyBvZiBhIHZlYzNcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMzfSBhIHZlY3RvciB0byBuZWdhdGVcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG5lZ2F0ZShvdXQsIGEpIHtcbiAgICBvdXRbMF0gPSAtYVswXTtcbiAgICBvdXRbMV0gPSAtYVsxXTtcbiAgICBvdXRbMl0gPSAtYVsyXTtcbiAgICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIGludmVyc2Ugb2YgdGhlIGNvbXBvbmVudHMgb2YgYSB2ZWMzXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjM30gYSB2ZWN0b3IgdG8gaW52ZXJ0XG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpbnZlcnNlKG91dCwgYSkge1xuICAgIG91dFswXSA9IDEuMCAvIGFbMF07XG4gICAgb3V0WzFdID0gMS4wIC8gYVsxXTtcbiAgICBvdXRbMl0gPSAxLjAgLyBhWzJdO1xuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogTm9ybWFsaXplIGEgdmVjM1xuICpcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdmVjdG9yIHRvIG5vcm1hbGl6ZVxuICogQHJldHVybnMge3ZlYzN9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gbm9ybWFsaXplKG91dCwgYSkge1xuICAgIGxldCB4ID0gYVswXTtcbiAgICBsZXQgeSA9IGFbMV07XG4gICAgbGV0IHogPSBhWzJdO1xuICAgIGxldCBsZW4gPSB4ICogeCArIHkgKiB5ICsgeiAqIHo7XG4gICAgaWYgKGxlbiA+IDApIHtcbiAgICAgICAgLy9UT0RPOiBldmFsdWF0ZSB1c2Ugb2YgZ2xtX2ludnNxcnQgaGVyZT9cbiAgICAgICAgbGVuID0gMSAvIE1hdGguc3FydChsZW4pO1xuICAgIH1cbiAgICBvdXRbMF0gPSBhWzBdICogbGVuO1xuICAgIG91dFsxXSA9IGFbMV0gKiBsZW47XG4gICAgb3V0WzJdID0gYVsyXSAqIGxlbjtcbiAgICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGRvdCBwcm9kdWN0IG9mIHR3byB2ZWMzJ3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjM30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IGRvdCBwcm9kdWN0IG9mIGEgYW5kIGJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRvdChhLCBiKSB7XG4gICAgcmV0dXJuIGFbMF0gKiBiWzBdICsgYVsxXSAqIGJbMV0gKyBhWzJdICogYlsyXTtcbn1cblxuLyoqXG4gKiBDb21wdXRlcyB0aGUgY3Jvc3MgcHJvZHVjdCBvZiB0d28gdmVjMydzXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjM30gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge3ZlYzN9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gY3Jvc3Mob3V0LCBhLCBiKSB7XG4gICAgbGV0IGF4ID0gYVswXSxcbiAgICAgICAgYXkgPSBhWzFdLFxuICAgICAgICBheiA9IGFbMl07XG4gICAgbGV0IGJ4ID0gYlswXSxcbiAgICAgICAgYnkgPSBiWzFdLFxuICAgICAgICBieiA9IGJbMl07XG5cbiAgICBvdXRbMF0gPSBheSAqIGJ6IC0gYXogKiBieTtcbiAgICBvdXRbMV0gPSBheiAqIGJ4IC0gYXggKiBiejtcbiAgICBvdXRbMl0gPSBheCAqIGJ5IC0gYXkgKiBieDtcbiAgICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFBlcmZvcm1zIGEgbGluZWFyIGludGVycG9sYXRpb24gYmV0d2VlbiB0d28gdmVjMydzXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjM30gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHBhcmFtIHtOdW1iZXJ9IHQgaW50ZXJwb2xhdGlvbiBhbW91bnQgYmV0d2VlbiB0aGUgdHdvIGlucHV0c1xuICogQHJldHVybnMge3ZlYzN9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gbGVycChvdXQsIGEsIGIsIHQpIHtcbiAgICBsZXQgYXggPSBhWzBdO1xuICAgIGxldCBheSA9IGFbMV07XG4gICAgbGV0IGF6ID0gYVsyXTtcbiAgICBvdXRbMF0gPSBheCArIHQgKiAoYlswXSAtIGF4KTtcbiAgICBvdXRbMV0gPSBheSArIHQgKiAoYlsxXSAtIGF5KTtcbiAgICBvdXRbMl0gPSBheiArIHQgKiAoYlsyXSAtIGF6KTtcbiAgICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFRyYW5zZm9ybXMgdGhlIHZlYzMgd2l0aCBhIG1hdDQuXG4gKiA0dGggdmVjdG9yIGNvbXBvbmVudCBpcyBpbXBsaWNpdGx5ICcxJ1xuICpcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIHZlY3RvciB0byB0cmFuc2Zvcm1cbiAqIEBwYXJhbSB7bWF0NH0gbSBtYXRyaXggdG8gdHJhbnNmb3JtIHdpdGhcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRyYW5zZm9ybU1hdDQob3V0LCBhLCBtKSB7XG4gICAgbGV0IHggPSBhWzBdLFxuICAgICAgICB5ID0gYVsxXSxcbiAgICAgICAgeiA9IGFbMl07XG4gICAgbGV0IHcgPSBtWzNdICogeCArIG1bN10gKiB5ICsgbVsxMV0gKiB6ICsgbVsxNV07XG4gICAgdyA9IHcgfHwgMS4wO1xuICAgIG91dFswXSA9IChtWzBdICogeCArIG1bNF0gKiB5ICsgbVs4XSAqIHogKyBtWzEyXSkgLyB3O1xuICAgIG91dFsxXSA9IChtWzFdICogeCArIG1bNV0gKiB5ICsgbVs5XSAqIHogKyBtWzEzXSkgLyB3O1xuICAgIG91dFsyXSA9IChtWzJdICogeCArIG1bNl0gKiB5ICsgbVsxMF0gKiB6ICsgbVsxNF0pIC8gdztcbiAgICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFNhbWUgYXMgYWJvdmUgYnV0IGRvZXNuJ3QgYXBwbHkgdHJhbnNsYXRpb24uXG4gKiBVc2VmdWwgZm9yIHJheXMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzY2FsZVJvdGF0ZU1hdDQob3V0LCBhLCBtKSB7XG4gICAgbGV0IHggPSBhWzBdLFxuICAgICAgICB5ID0gYVsxXSxcbiAgICAgICAgeiA9IGFbMl07XG4gICAgbGV0IHcgPSBtWzNdICogeCArIG1bN10gKiB5ICsgbVsxMV0gKiB6ICsgbVsxNV07XG4gICAgdyA9IHcgfHwgMS4wO1xuICAgIG91dFswXSA9IChtWzBdICogeCArIG1bNF0gKiB5ICsgbVs4XSAqIHopIC8gdztcbiAgICBvdXRbMV0gPSAobVsxXSAqIHggKyBtWzVdICogeSArIG1bOV0gKiB6KSAvIHc7XG4gICAgb3V0WzJdID0gKG1bMl0gKiB4ICsgbVs2XSAqIHkgKyBtWzEwXSAqIHopIC8gdztcbiAgICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFRyYW5zZm9ybXMgdGhlIHZlYzMgd2l0aCBhIG1hdDMuXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjM30gYSB0aGUgdmVjdG9yIHRvIHRyYW5zZm9ybVxuICogQHBhcmFtIHttYXQzfSBtIHRoZSAzeDMgbWF0cml4IHRvIHRyYW5zZm9ybSB3aXRoXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0cmFuc2Zvcm1NYXQzKG91dCwgYSwgbSkge1xuICAgIGxldCB4ID0gYVswXSxcbiAgICAgICAgeSA9IGFbMV0sXG4gICAgICAgIHogPSBhWzJdO1xuICAgIG91dFswXSA9IHggKiBtWzBdICsgeSAqIG1bM10gKyB6ICogbVs2XTtcbiAgICBvdXRbMV0gPSB4ICogbVsxXSArIHkgKiBtWzRdICsgeiAqIG1bN107XG4gICAgb3V0WzJdID0geCAqIG1bMl0gKyB5ICogbVs1XSArIHogKiBtWzhdO1xuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogVHJhbnNmb3JtcyB0aGUgdmVjMyB3aXRoIGEgcXVhdFxuICpcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIHZlY3RvciB0byB0cmFuc2Zvcm1cbiAqIEBwYXJhbSB7cXVhdH0gcSBxdWF0ZXJuaW9uIHRvIHRyYW5zZm9ybSB3aXRoXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0cmFuc2Zvcm1RdWF0KG91dCwgYSwgcSkge1xuICAgIC8vIGJlbmNobWFya3M6IGh0dHBzOi8vanNwZXJmLmNvbS9xdWF0ZXJuaW9uLXRyYW5zZm9ybS12ZWMzLWltcGxlbWVudGF0aW9ucy1maXhlZFxuXG4gICAgbGV0IHggPSBhWzBdLFxuICAgICAgICB5ID0gYVsxXSxcbiAgICAgICAgeiA9IGFbMl07XG4gICAgbGV0IHF4ID0gcVswXSxcbiAgICAgICAgcXkgPSBxWzFdLFxuICAgICAgICBxeiA9IHFbMl0sXG4gICAgICAgIHF3ID0gcVszXTtcblxuICAgIGxldCB1dnggPSBxeSAqIHogLSBxeiAqIHk7XG4gICAgbGV0IHV2eSA9IHF6ICogeCAtIHF4ICogejtcbiAgICBsZXQgdXZ6ID0gcXggKiB5IC0gcXkgKiB4O1xuXG4gICAgbGV0IHV1dnggPSBxeSAqIHV2eiAtIHF6ICogdXZ5O1xuICAgIGxldCB1dXZ5ID0gcXogKiB1dnggLSBxeCAqIHV2ejtcbiAgICBsZXQgdXV2eiA9IHF4ICogdXZ5IC0gcXkgKiB1dng7XG5cbiAgICBsZXQgdzIgPSBxdyAqIDI7XG4gICAgdXZ4ICo9IHcyO1xuICAgIHV2eSAqPSB3MjtcbiAgICB1dnogKj0gdzI7XG5cbiAgICB1dXZ4ICo9IDI7XG4gICAgdXV2eSAqPSAyO1xuICAgIHV1dnogKj0gMjtcblxuICAgIG91dFswXSA9IHggKyB1dnggKyB1dXZ4O1xuICAgIG91dFsxXSA9IHkgKyB1dnkgKyB1dXZ5O1xuICAgIG91dFsyXSA9IHogKyB1dnogKyB1dXZ6O1xuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogR2V0IHRoZSBhbmdsZSBiZXR3ZWVuIHR3byAzRCB2ZWN0b3JzXG4gKiBAcGFyYW0ge3ZlYzN9IGEgVGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjM30gYiBUaGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IFRoZSBhbmdsZSBpbiByYWRpYW5zXG4gKi9cbmV4cG9ydCBjb25zdCBhbmdsZSA9IChmdW5jdGlvbiAoKSB7XG4gICAgY29uc3QgdGVtcEEgPSBbMCwgMCwgMF07XG4gICAgY29uc3QgdGVtcEIgPSBbMCwgMCwgMF07XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gKGEsIGIpIHtcbiAgICAgICAgY29weSh0ZW1wQSwgYSk7XG4gICAgICAgIGNvcHkodGVtcEIsIGIpO1xuXG4gICAgICAgIG5vcm1hbGl6ZSh0ZW1wQSwgdGVtcEEpO1xuICAgICAgICBub3JtYWxpemUodGVtcEIsIHRlbXBCKTtcblxuICAgICAgICBsZXQgY29zaW5lID0gZG90KHRlbXBBLCB0ZW1wQik7XG5cbiAgICAgICAgaWYgKGNvc2luZSA+IDEuMCkge1xuICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgIH0gZWxzZSBpZiAoY29zaW5lIDwgLTEuMCkge1xuICAgICAgICAgICAgcmV0dXJuIE1hdGguUEk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gTWF0aC5hY29zKGNvc2luZSk7XG4gICAgICAgIH1cbiAgICB9O1xufSkoKTtcblxuLyoqXG4gKiBSZXR1cm5zIHdoZXRoZXIgb3Igbm90IHRoZSB2ZWN0b3JzIGhhdmUgZXhhY3RseSB0aGUgc2FtZSBlbGVtZW50cyBpbiB0aGUgc2FtZSBwb3NpdGlvbiAod2hlbiBjb21wYXJlZCB3aXRoID09PSlcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IGEgVGhlIGZpcnN0IHZlY3Rvci5cbiAqIEBwYXJhbSB7dmVjM30gYiBUaGUgc2Vjb25kIHZlY3Rvci5cbiAqIEByZXR1cm5zIHtCb29sZWFufSBUcnVlIGlmIHRoZSB2ZWN0b3JzIGFyZSBlcXVhbCwgZmFsc2Ugb3RoZXJ3aXNlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZXhhY3RFcXVhbHMoYSwgYikge1xuICAgIHJldHVybiBhWzBdID09PSBiWzBdICYmIGFbMV0gPT09IGJbMV0gJiYgYVsyXSA9PT0gYlsyXTtcbn1cbiIsImNvbnN0IEVQU0lMT04gPSAwLjAwMDAwMTtcblxuLyoqXG4gKiBDb3B5IHRoZSB2YWx1ZXMgZnJvbSBvbmUgdmVjNCB0byBhbm90aGVyXG4gKlxuICogQHBhcmFtIHt2ZWM0fSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjNH0gYSB0aGUgc291cmNlIHZlY3RvclxuICogQHJldHVybnMge3ZlYzR9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gY29weShvdXQsIGEpIHtcbiAgICBvdXRbMF0gPSBhWzBdO1xuICAgIG91dFsxXSA9IGFbMV07XG4gICAgb3V0WzJdID0gYVsyXTtcbiAgICBvdXRbM10gPSBhWzNdO1xuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogU2V0IHRoZSBjb21wb25lbnRzIG9mIGEgdmVjNCB0byB0aGUgZ2l2ZW4gdmFsdWVzXG4gKlxuICogQHBhcmFtIHt2ZWM0fSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7TnVtYmVyfSB4IFggY29tcG9uZW50XG4gKiBAcGFyYW0ge051bWJlcn0geSBZIGNvbXBvbmVudFxuICogQHBhcmFtIHtOdW1iZXJ9IHogWiBjb21wb25lbnRcbiAqIEBwYXJhbSB7TnVtYmVyfSB3IFcgY29tcG9uZW50XG4gKiBAcmV0dXJucyB7dmVjNH0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZXQob3V0LCB4LCB5LCB6LCB3KSB7XG4gICAgb3V0WzBdID0geDtcbiAgICBvdXRbMV0gPSB5O1xuICAgIG91dFsyXSA9IHo7XG4gICAgb3V0WzNdID0gdztcbiAgICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIEFkZHMgdHdvIHZlYzQnc1xuICpcbiAqIEBwYXJhbSB7dmVjNH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjNH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFkZChvdXQsIGEsIGIpIHtcbiAgICBvdXRbMF0gPSBhWzBdICsgYlswXTtcbiAgICBvdXRbMV0gPSBhWzFdICsgYlsxXTtcbiAgICBvdXRbMl0gPSBhWzJdICsgYlsyXTtcbiAgICBvdXRbM10gPSBhWzNdICsgYlszXTtcbiAgICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFNjYWxlcyBhIHZlYzQgYnkgYSBzY2FsYXIgbnVtYmVyXG4gKlxuICogQHBhcmFtIHt2ZWM0fSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjNH0gYSB0aGUgdmVjdG9yIHRvIHNjYWxlXG4gKiBAcGFyYW0ge051bWJlcn0gYiBhbW91bnQgdG8gc2NhbGUgdGhlIHZlY3RvciBieVxuICogQHJldHVybnMge3ZlYzR9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gc2NhbGUob3V0LCBhLCBiKSB7XG4gICAgb3V0WzBdID0gYVswXSAqIGI7XG4gICAgb3V0WzFdID0gYVsxXSAqIGI7XG4gICAgb3V0WzJdID0gYVsyXSAqIGI7XG4gICAgb3V0WzNdID0gYVszXSAqIGI7XG4gICAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBsZW5ndGggb2YgYSB2ZWM0XG4gKlxuICogQHBhcmFtIHt2ZWM0fSBhIHZlY3RvciB0byBjYWxjdWxhdGUgbGVuZ3RoIG9mXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBsZW5ndGggb2YgYVxuICovXG5leHBvcnQgZnVuY3Rpb24gbGVuZ3RoKGEpIHtcbiAgICBsZXQgeCA9IGFbMF07XG4gICAgbGV0IHkgPSBhWzFdO1xuICAgIGxldCB6ID0gYVsyXTtcbiAgICBsZXQgdyA9IGFbM107XG4gICAgcmV0dXJuIE1hdGguc3FydCh4ICogeCArIHkgKiB5ICsgeiAqIHogKyB3ICogdyk7XG59XG5cbi8qKlxuICogTm9ybWFsaXplIGEgdmVjNFxuICpcbiAqIEBwYXJhbSB7dmVjNH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzR9IGEgdmVjdG9yIHRvIG5vcm1hbGl6ZVxuICogQHJldHVybnMge3ZlYzR9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gbm9ybWFsaXplKG91dCwgYSkge1xuICAgIGxldCB4ID0gYVswXTtcbiAgICBsZXQgeSA9IGFbMV07XG4gICAgbGV0IHogPSBhWzJdO1xuICAgIGxldCB3ID0gYVszXTtcbiAgICBsZXQgbGVuID0geCAqIHggKyB5ICogeSArIHogKiB6ICsgdyAqIHc7XG4gICAgaWYgKGxlbiA+IDApIHtcbiAgICAgICAgbGVuID0gMSAvIE1hdGguc3FydChsZW4pO1xuICAgIH1cbiAgICBvdXRbMF0gPSB4ICogbGVuO1xuICAgIG91dFsxXSA9IHkgKiBsZW47XG4gICAgb3V0WzJdID0geiAqIGxlbjtcbiAgICBvdXRbM10gPSB3ICogbGVuO1xuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgZG90IHByb2R1Y3Qgb2YgdHdvIHZlYzQnc1xuICpcbiAqIEBwYXJhbSB7dmVjNH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWM0fSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge051bWJlcn0gZG90IHByb2R1Y3Qgb2YgYSBhbmQgYlxuICovXG5leHBvcnQgZnVuY3Rpb24gZG90KGEsIGIpIHtcbiAgICByZXR1cm4gYVswXSAqIGJbMF0gKyBhWzFdICogYlsxXSArIGFbMl0gKiBiWzJdICsgYVszXSAqIGJbM107XG59XG5cbi8qKlxuICogUGVyZm9ybXMgYSBsaW5lYXIgaW50ZXJwb2xhdGlvbiBiZXR3ZWVuIHR3byB2ZWM0J3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWM0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcGFyYW0ge051bWJlcn0gdCBpbnRlcnBvbGF0aW9uIGFtb3VudCBiZXR3ZWVuIHRoZSB0d28gaW5wdXRzXG4gKiBAcmV0dXJucyB7dmVjNH0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBsZXJwKG91dCwgYSwgYiwgdCkge1xuICAgIGxldCBheCA9IGFbMF07XG4gICAgbGV0IGF5ID0gYVsxXTtcbiAgICBsZXQgYXogPSBhWzJdO1xuICAgIGxldCBhdyA9IGFbM107XG4gICAgb3V0WzBdID0gYXggKyB0ICogKGJbMF0gLSBheCk7XG4gICAgb3V0WzFdID0gYXkgKyB0ICogKGJbMV0gLSBheSk7XG4gICAgb3V0WzJdID0gYXogKyB0ICogKGJbMl0gLSBheik7XG4gICAgb3V0WzNdID0gYXcgKyB0ICogKGJbM10gLSBhdyk7XG4gICAgcmV0dXJuIG91dDtcbn1cbiIsIi8vIENvcmVcbmV4cG9ydCB7IEdlb21ldHJ5IH0gZnJvbSAnLi9jb3JlL0dlb21ldHJ5LmpzJztcbmV4cG9ydCB7IFByb2dyYW0gfSBmcm9tICcuL2NvcmUvUHJvZ3JhbS5qcyc7XG5leHBvcnQgeyBSZW5kZXJlciB9IGZyb20gJy4vY29yZS9SZW5kZXJlci5qcyc7XG5leHBvcnQgeyBDYW1lcmEgfSBmcm9tICcuL2NvcmUvQ2FtZXJhLmpzJztcbmV4cG9ydCB7IFRyYW5zZm9ybSB9IGZyb20gJy4vY29yZS9UcmFuc2Zvcm0uanMnO1xuZXhwb3J0IHsgTWVzaCB9IGZyb20gJy4vY29yZS9NZXNoLmpzJztcbmV4cG9ydCB7IFRleHR1cmUgfSBmcm9tICcuL2NvcmUvVGV4dHVyZS5qcyc7XG5leHBvcnQgeyBSZW5kZXJUYXJnZXQgfSBmcm9tICcuL2NvcmUvUmVuZGVyVGFyZ2V0LmpzJztcblxuLy8gTWF0aHNcbmV4cG9ydCB7IENvbG9yIH0gZnJvbSAnLi9tYXRoL0NvbG9yLmpzJztcbmV4cG9ydCB7IEV1bGVyIH0gZnJvbSAnLi9tYXRoL0V1bGVyLmpzJztcbmV4cG9ydCB7IE1hdDMgfSBmcm9tICcuL21hdGgvTWF0My5qcyc7XG5leHBvcnQgeyBNYXQ0IH0gZnJvbSAnLi9tYXRoL01hdDQuanMnO1xuZXhwb3J0IHsgUXVhdCB9IGZyb20gJy4vbWF0aC9RdWF0LmpzJztcbmV4cG9ydCB7IFZlYzIgfSBmcm9tICcuL21hdGgvVmVjMi5qcyc7XG5leHBvcnQgeyBWZWMzIH0gZnJvbSAnLi9tYXRoL1ZlYzMuanMnO1xuZXhwb3J0IHsgVmVjNCB9IGZyb20gJy4vbWF0aC9WZWM0LmpzJztcblxuLy8gRXh0cmFzXG5leHBvcnQgeyBQbGFuZSB9IGZyb20gJy4vZXh0cmFzL1BsYW5lLmpzJztcbmV4cG9ydCB7IEJveCB9IGZyb20gJy4vZXh0cmFzL0JveC5qcyc7XG5leHBvcnQgeyBTcGhlcmUgfSBmcm9tICcuL2V4dHJhcy9TcGhlcmUuanMnO1xuZXhwb3J0IHsgQ3lsaW5kZXIgfSBmcm9tICcuL2V4dHJhcy9DeWxpbmRlci5qcyc7XG5leHBvcnQgeyBUcmlhbmdsZSB9IGZyb20gJy4vZXh0cmFzL1RyaWFuZ2xlLmpzJztcbmV4cG9ydCB7IFRvcnVzIH0gZnJvbSAnLi9leHRyYXMvVG9ydXMuanMnO1xuZXhwb3J0IHsgT3JiaXQgfSBmcm9tICcuL2V4dHJhcy9PcmJpdC5qcyc7XG5leHBvcnQgeyBSYXljYXN0IH0gZnJvbSAnLi9leHRyYXMvUmF5Y2FzdC5qcyc7XG5leHBvcnQgeyBDdXJ2ZSB9IGZyb20gJy4vZXh0cmFzL0N1cnZlLmpzJztcbmV4cG9ydCB7IFBvc3QgfSBmcm9tICcuL2V4dHJhcy9Qb3N0LmpzJztcbmV4cG9ydCB7IFNraW4gfSBmcm9tICcuL2V4dHJhcy9Ta2luLmpzJztcbmV4cG9ydCB7IEFuaW1hdGlvbiB9IGZyb20gJy4vZXh0cmFzL0FuaW1hdGlvbi5qcyc7XG5leHBvcnQgeyBUZXh0IH0gZnJvbSAnLi9leHRyYXMvVGV4dC5qcyc7XG5leHBvcnQgeyBOb3JtYWxQcm9ncmFtIH0gZnJvbSAnLi9leHRyYXMvTm9ybWFsUHJvZ3JhbS5qcyc7XG5leHBvcnQgeyBGbG93bWFwIH0gZnJvbSAnLi9leHRyYXMvRmxvd21hcC5qcyc7XG5leHBvcnQgeyBHUEdQVSB9IGZyb20gJy4vZXh0cmFzL0dQR1BVLmpzJztcbmV4cG9ydCB7IFBvbHlsaW5lIH0gZnJvbSAnLi9leHRyYXMvUG9seWxpbmUuanMnO1xuZXhwb3J0IHsgU2hhZG93IH0gZnJvbSAnLi9leHRyYXMvU2hhZG93LmpzJztcbmV4cG9ydCB7IEtUWFRleHR1cmUgfSBmcm9tICcuL2V4dHJhcy9LVFhUZXh0dXJlLmpzJztcbmV4cG9ydCB7IFRleHR1cmVMb2FkZXIgfSBmcm9tICcuL2V4dHJhcy9UZXh0dXJlTG9hZGVyLmpzJztcbmV4cG9ydCB7IEdMVEZMb2FkZXIgfSBmcm9tICcuL2V4dHJhcy9HTFRGTG9hZGVyLmpzJztcbmV4cG9ydCB7IEdMVEZTa2luIH0gZnJvbSAnLi9leHRyYXMvR0xURlNraW4uanMnO1xuXG4iLCJpbXBvcnQge1xuICAgIENhbWVyYSxcbiAgICBPR0xSZW5kZXJpbmdDb250ZXh0LFxuICAgIFBvc3QsXG4gICAgUG9zdEZCTyxcbiAgICBQb3N0T3B0aW9ucywgUHJvZ3JhbSxcbiAgICBSZW5kZXJlcixcbiAgICBSZW5kZXJUYXJnZXQsXG4gICAgUmVuZGVyVGFyZ2V0T3B0aW9ucyxcbiAgICBUcmFuc2Zvcm1cbn0gZnJvbSBcIi4uL29nbFwiO1xuXG5leHBvcnQgY2xhc3MgUGFzcyB7XG4gICAgZW5hYmxlZDogYm9vbGVhbjtcbiAgICByZW5kZXJUb1NjcmVlbjogYm9vbGVhbjtcbiAgICBuZWVkc1N3YXA6IGJvb2xlYW47XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMuZW5hYmxlZCA9IHRydWU7XG4gICAgICAgIHRoaXMucmVuZGVyVG9TY3JlZW4gPSBmYWxzZTtcbiAgICAgICAgdGhpcy5uZWVkc1N3YXAgPSB0cnVlO1xuICAgIH1cblxuICAgIHJlbmRlcihyZW5kZXJlcjogUmVuZGVyZXIsIHdyaXRlQnVmZmVyOiBSZW5kZXJUYXJnZXR8dW5kZWZpbmVkLCByZWFkQnVmZmVyOiBSZW5kZXJUYXJnZXQpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignTm90IGltcGxlbWVudGVkJyk7XG4gICAgfVxuICAgIHJlbmRlcldpdGhGQk8ocmVuZGVyZXI6IFJlbmRlcmVyLCBmYm86IFBvc3RGQk8pe1xuICAgICAgICBmYm8ucmVhZCAmJiB0aGlzLnJlbmRlcihyZW5kZXJlciwgZmJvLndyaXRlLCBmYm8ucmVhZCk7XG4gICAgfVxuICAgIHJlc2l6ZSh7IHdpZHRoLCBoZWlnaHQsIGRwciB9OiBQYXJ0aWFsPHtcbiAgICAgICAgd2lkdGg6IG51bWJlcjtcbiAgICAgICAgaGVpZ2h0OiBudW1iZXI7XG4gICAgICAgIGRwcjogbnVtYmVyO1xuICAgIH0+KTogdm9pZHtcbiAgICAgICAgY29uc29sZS5lcnJvcignTm90IGltcGxlbWVudGVkJyk7XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgUmVuZGVyUGFzcyBleHRlbmRzIFBhc3Mge1xuICAgIHByaXZhdGUgc2NlbmU6IFRyYW5zZm9ybTtcbiAgICBwcml2YXRlIGNhbWVyYTogQ2FtZXJhO1xuICAgIGNvbnN0cnVjdG9yKHNjZW5lOiBUcmFuc2Zvcm0sIGNhbWVyYTogQ2FtZXJhKSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIHRoaXMuc2NlbmUgPSBzY2VuZTtcbiAgICAgICAgdGhpcy5jYW1lcmEgPSBjYW1lcmE7XG4gICAgfVxuICAgIFxuICAgIHJlbmRlcihyZW5kZXJlcjogUmVuZGVyZXIsIHdyaXRlQnVmZmVyOiBSZW5kZXJUYXJnZXR8dW5kZWZpbmVkLCByZWFkQnVmZmVyOiBSZW5kZXJUYXJnZXQpIHtcbiAgICAgICAgcmVuZGVyZXIucmVuZGVyKHtzY2VuZTogdGhpcy5zY2VuZSwgY2FtZXJhOiB0aGlzLmNhbWVyYSwgdGFyZ2V0OiByZWFkQnVmZmVyfSk7XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgQ3VzdG9tUG9zdCBleHRlbmRzIFBvc3Qge1xuICAgIHBhc3NlczogUGFzc1tdID0gW107XG5cbiAgICBjb25zdHJ1Y3RvcihnbDogT0dMUmVuZGVyaW5nQ29udGV4dCwgb3B0aW9uczpQYXJ0aWFsPFBvc3RPcHRpb25zPiA9IHt9LCBmYm8/OiBQb3N0RkJPKSB7XG4gICAgICAgIHN1cGVyKGdsLCBvcHRpb25zLCBmYm8pO1xuICAgIH1cblxuICAgIGFkZFBhc3MocGFzczogUGFzcykge1xuICAgICAgICB0aGlzLnBhc3Nlcy5wdXNoKHBhc3MpO1xuICAgICAgICByZXR1cm4gcGFzcztcbiAgICB9XG5cbiAgICByZW5kZXIoeyB0YXJnZXQ9IHVuZGVmaW5lZCwgdXBkYXRlID0gdHJ1ZSwgc29ydCA9IHRydWUsIGZydXN0dW1DdWxsID0gdHJ1ZSB9KSB7XG4gICAgICAgIGNvbnN0IGVuYWJsZWRQYXNzZXMgPSB0aGlzLnBhc3Nlcy5maWx0ZXIoKHBhc3MpID0+IHBhc3MuZW5hYmxlZCk7XG4gICAgICAgIGVuYWJsZWRQYXNzZXMuZm9yRWFjaCgocGFzcywgaSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5fcmVuZGVyUGFzcyhwYXNzKTtcbiAgICAgICAgICAgIHBhc3MubmVlZHNTd2FwICYmIHRoaXMuZmJvLnN3YXAoKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIF9yZW5kZXJQYXNzKHBhc3M6IFBhc3MpIHtcbiAgICAgICAgcGFzcy5yZW5kZXJXaXRoRkJPKHRoaXMuZ2wucmVuZGVyZXIsIHRoaXMuZmJvKTtcbiAgICB9XG5cbiAgICByZXNpemUoeyB3aWR0aCwgaGVpZ2h0LCBkcHIgfTogUGFydGlhbDx7XG4gICAgICAgIHdpZHRoOiBudW1iZXI7XG4gICAgICAgIGhlaWdodDogbnVtYmVyO1xuICAgICAgICBkcHI6IG51bWJlcjtcbiAgICB9Pik6IHZvaWR7XG4gICAgICAgIHN1cGVyLnJlc2l6ZSh7d2lkdGg6IHdpZHRoLCBoZWlnaHQ6IGhlaWdodCwgZHByOiBkcHJ9KTtcbiAgICAgICAgdGhpcy5wYXNzZXMuZm9yRWFjaCggKHBhc3MpID0+IHtcbiAgICAgICAgICAgIHBhc3MucmVzaXplKHt3aWR0aCwgaGVpZ2h0LCBkcHJ9KTtcbiAgICAgICAgfSlcbiAgICB9XG59XG4iLCJpbXBvcnQge1xuICAgIFJlbmRlcmVyLFxuICAgIFJlbmRlclRhcmdldCxcbiAgICBQcm9ncmFtLFxuICAgIFRleHR1cmUsXG4gICAgVHJhbnNmb3JtLFxuICAgIENhbWVyYSxcbiAgICBNZXNoLFxuICAgIFBsYW5lLFxuICAgIFZlYzIsXG4gICAgT0dMUmVuZGVyaW5nQ29udGV4dFxufSBmcm9tICcuLi9vZ2wnO1xuXG5cbmV4cG9ydCBjbGFzcyBVdGlscyB7XG4gICAgc3RhdGljIHJlYWRvbmx5IGNvcHlWZXJ0ZXggPSAvKiBnbHNsICovIGBcbiAgICBhdHRyaWJ1dGUgdmVjMiB1djtcbiAgICBhdHRyaWJ1dGUgdmVjMyBwb3NpdGlvbjtcbiAgICB2YXJ5aW5nIHZlYzIgdlV2O1xuICAgIHVuaWZvcm0gbWF0NCBtb2RlbE1hdHJpeDtcbiAgICB1bmlmb3JtIG1hdDQgcHJvamVjdGlvbk1hdHJpeDtcblxuICAgIHZvaWQgbWFpbigpIHtcbiAgICAgICAgdlV2ID0gdXY7XG4gICAgICAgIGdsX1Bvc2l0aW9uID0gcHJvamVjdGlvbk1hdHJpeCAqIG1vZGVsTWF0cml4ICogdmVjNChwb3NpdGlvbiwgMSk7XG4gICAgfVxuYDtcbiAgICBzdGF0aWMgcmVhZG9ubHkgY29weUZyYWdtZW50ID0gLyogZ2xzbCAqLyBgXG4gICAgcHJlY2lzaW9uIGhpZ2hwIGZsb2F0O1xuICAgIHVuaWZvcm0gc2FtcGxlcjJEIHRNYXA7XG4gICAgdmFyeWluZyB2ZWMyIHZVdjtcbiAgICB2b2lkIG1haW4oKSB7XG4gICAgICAgIGdsX0ZyYWdDb2xvciA9IHRleHR1cmUyRCh0TWFwLCB2VXYpO1xuICAgIH1cbmA7XG4gICAgcHJpdmF0ZSBzdGF0aWMgaW5zdGFuY2VNYXBfOiBNYXA8c3RyaW5nLCBVdGlscz4gPSBuZXcgTWFwPHN0cmluZywgVXRpbHM+KCk7XG4gICAgcHJpdmF0ZSBjb3B5cHJvZ3JhbV86IFByb2dyYW07XG4gICAgcHJpdmF0ZSBvcnRob1NjZW5lXzogVHJhbnNmb3JtID0gbmV3IFRyYW5zZm9ybSgpO1xuICAgIHByaXZhdGUgbWVzaF86IE1lc2g7XG4gICAgcHJpdmF0ZSBvcnRob0NhbWVyYV86IENhbWVyYTtcbiAgICBwcml2YXRlIGdsOiBPR0xSZW5kZXJpbmdDb250ZXh0O1xuXG4gICAgY29uc3RydWN0b3IoZ2w6IE9HTFJlbmRlcmluZ0NvbnRleHQpIHtcbiAgICAgICAgdGhpcy5nbCA9IGdsO1xuICAgICAgICB0aGlzLmNvcHlwcm9ncmFtXyA9IG5ldyBQcm9ncmFtKGdsLCB7XG4gICAgICAgICAgICB2ZXJ0ZXg6IFV0aWxzLmNvcHlWZXJ0ZXgsXG4gICAgICAgICAgICBmcmFnbWVudDogVXRpbHMuY29weUZyYWdtZW50LFxuICAgICAgICAgICAgdW5pZm9ybXM6IHt0TWFwOiB7dmFsdWU6IHt0ZXh0dXJlOiBudWxsfX19LFxuICAgICAgICAgICAgZGVwdGhUZXN0OiBmYWxzZSxcbiAgICAgICAgICAgIGRlcHRoV3JpdGU6IGZhbHNlLFxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5vcnRob0NhbWVyYV8gPSBuZXcgQ2FtZXJhKGdsKTtcbiAgICAgICAgdGhpcy5vcnRob0NhbWVyYV8ub3J0aG9ncmFwaGljKHtuZWFyOiAwLCBmYXI6IDEwLCBsZWZ0OiAtMSwgcmlnaHQ6IDEsIGJvdHRvbTogLTEsIHRvcDogMX0pO1xuICAgICAgICBsZXQgcGxhbmUgPSBuZXcgUGxhbmUoZ2wsIHt3aWR0aDogMiwgaGVpZ2h0OiAyfSk7XG4gICAgICAgIHRoaXMubWVzaF8gPSBuZXcgTWVzaChnbCwge2dlb21ldHJ5OiBwbGFuZX0pO1xuICAgICAgICB0aGlzLm1lc2hfLnNldFBhcmVudCh0aGlzLm9ydGhvU2NlbmVfKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgc3RhdGljIGdldEluc3RhbmNlKGdsOiBhbnkpOiBVdGlscyB7XG4gICAgICAgIGxldCBpbnMgPSBVdGlscy5pbnN0YW5jZU1hcF8uZ2V0KGdsLmNhbnZhcy5pZCk7XG4gICAgICAgIGlmICghaW5zKSBVdGlscy5pbnN0YW5jZU1hcF8uc2V0KGdsLmNhbnZhcy5pZCwgKGlucyA9IG5ldyBVdGlscyhnbCkpKTtcbiAgICAgICAgcmV0dXJuIGlucztcbiAgICB9XG5cbiAgICByZW5kZXJQYXNzKHJlbmRlcmVyOiBSZW5kZXJlciwgcHJvZ3JhbTogUHJvZ3JhbSwgdGFyZ2V0PzogUmVuZGVyVGFyZ2V0LCBjbGVhcj86IGJvb2xlYW4pIHtcbiAgICAgICAgdGhpcy5tZXNoXy5wcm9ncmFtID0gcHJvZ3JhbTtcbiAgICAgICAgcmVuZGVyZXIucmVuZGVyKHtzY2VuZTogdGhpcy5vcnRob1NjZW5lXywgY2FtZXJhOiB0aGlzLm9ydGhvQ2FtZXJhXywgdGFyZ2V0LCBjbGVhcn0pO1xuICAgIH1cblxuICAgIGJsaXQocmVuZGVyZXI6IFJlbmRlcmVyLCBzb3VyY2U6IFJlbmRlclRhcmdldCB8IFRleHR1cmUsIHRhcmdldD86IFJlbmRlclRhcmdldCwgY2xlYXI/OiBib29sZWFuKSB7XG4gICAgICAgIHRoaXMuY29weXByb2dyYW1fLnVuaWZvcm1zWyd0TWFwJ10udmFsdWUgPSBzb3VyY2UudGV4dHVyZSA/IHNvdXJjZS50ZXh0dXJlIDogc291cmNlO1xuICAgICAgICB0aGlzLnJlbmRlclBhc3MocmVuZGVyZXIsIHRoaXMuY29weXByb2dyYW1fLCB0YXJnZXQsIGNsZWFyKVxuICAgICAgICB0aGlzLm1lc2hfLnByb2dyYW0gPSB0aGlzLmNvcHlwcm9ncmFtXztcbiAgICB9XG5cbn1cbiIsImltcG9ydCB7XG4gICAgQ2FtZXJhLFxuICAgIE9HTFJlbmRlcmluZ0NvbnRleHQsXG4gICAgUG9zdEZCTywgUG9zdE9wdGlvbnMsXG4gICAgUHJvZ3JhbSxcbiAgICBSZW5kZXJlcixcbiAgICBSZW5kZXJUYXJnZXQsXG4gICAgUmVuZGVyVGFyZ2V0T3B0aW9ucyxcbiAgICBUcmFuc2Zvcm1cbn0gZnJvbSBcIi4uL29nbFwiO1xuaW1wb3J0IHtVdGlsc30gZnJvbSBcIi4uL2V4dHJhcy9SZW5kZXJVdGlsc1wiO1xuaW1wb3J0IHtDdXN0b21Qb3N0LCBQYXNzfSBmcm9tIFwiLi4vZXh0cmFzL0N1c3RvbVBvc3RcIjtcbmltcG9ydCB7RW5jb2RpbmdIZWxwZXIsIFRvbmVNYXBwaW5nSGVscGVyfSBmcm9tIFwiLi4vdXRpbHMvdXRpbFwiO1xuZXhwb3J0IGNsYXNzIEhEUlJlbmRlclBhc3MgZXh0ZW5kcyBQYXNzIHtcbiAgICBwcml2YXRlIGJsYWNrUHJvZ3JhbTogUHJvZ3JhbTtcbiAgICBnZXQgY2FtZXJhKCk6IENhbWVyYSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9jYW1lcmE7XG4gICAgfVxuICAgIGdldCBzY2VuZSgpOiBUcmFuc2Zvcm0ge1xuICAgICAgICByZXR1cm4gdGhpcy5fc2NlbmU7XG4gICAgfVxuICAgIHByaXZhdGUgX3NjZW5lOiBUcmFuc2Zvcm07XG4gICAgcHJpdmF0ZSBfY2FtZXJhOiBDYW1lcmE7XG4gICAgcHJpdmF0ZSBibGVuZFByb2dyYW06IFByb2dyYW07XG4gICAgcHJpdmF0ZSBnbDogT0dMUmVuZGVyaW5nQ29udGV4dDtcbiAgICBjb25zdHJ1Y3RvcihnbDogT0dMUmVuZGVyaW5nQ29udGV4dCwgc2NlbmU6IFRyYW5zZm9ybSwgY2FtZXJhOiBDYW1lcmEpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgdGhpcy5nbCA9IGdsO1xuICAgICAgICB0aGlzLl9zY2VuZSA9IHNjZW5lO1xuICAgICAgICB0aGlzLl9jYW1lcmEgPSBjYW1lcmE7XG4gICAgICAgIHRoaXMubmVlZHNTd2FwID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5ibGVuZFByb2dyYW0gPSBuZXcgUHJvZ3JhbShnbCwge3ZlcnRleDogVXRpbHMuY29weVZlcnRleCwgZnJhZ21lbnQ6IGBcbiAgICAgICAgICAgIHByZWNpc2lvbiBoaWdocCBmbG9hdDtcbiAgICAgICAgICAgICNkZWZpbmUgaW5wdXRFbmNvZGluZyAke0VuY29kaW5nSGVscGVyLlJHQk0xNn1cbiAgICAgICAgICAgICNkZWZpbmUgb3V0cHV0RW5jb2RpbmcgJHtFbmNvZGluZ0hlbHBlci5SR0JNMTZ9XG4gICAgICAgICAgICAke0VuY29kaW5nSGVscGVyLnNoYWRlckNodW5rfVxuICAgICAgICAgICAgdW5pZm9ybSBzYW1wbGVyMkQgdE9wYXF1ZTtcbiAgICAgICAgICAgIHVuaWZvcm0gc2FtcGxlcjJEIHRUcmFuc3BhcmVudDtcbiAgICAgICAgICAgIHZhcnlpbmcgdmVjMiB2VXY7XG4gICAgICAgICAgICB2b2lkIG1haW4oKSB7XG4gICAgICAgICAgICAgICAgdmVjMyBvcGFxdWUgPSBpbnB1dFRleGVsVG9MaW5lYXIodGV4dHVyZTJEKHRPcGFxdWUsIHZVdikpLnJnYjtcbiAgICAgICAgICAgICAgICB2ZWM0IHRyYW5zcGFyZW50ID0gdGV4dHVyZTJEKHRUcmFuc3BhcmVudCwgdlV2KTtcbiAgICAgICAgICAgICAgICBnbF9GcmFnQ29sb3IgPSBsaW5lYXJUb091dHB1dFRleGVsKHZlYzQob3BhcXVlICogKDEuIC0gdHJhbnNwYXJlbnQuYSkgKyB0cmFuc3BhcmVudC5yZ2IgKiB0cmFuc3BhcmVudC5hLCAxLikpO1xuICAgICAgICAgICAgICAgIC8vIGdsX0ZyYWdDb2xvciA9IGxpbmVhclRvT3V0cHV0VGV4ZWwodmVjNChvcGFxdWUsIDEuKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIGAsIHVuaWZvcm1zOiB7XG4gICAgICAgICAgICAgICAgdE9wYXF1ZToge3ZhbHVlOiB7dGV4dHVyZTogdW5kZWZpbmVkfX0sXG4gICAgICAgICAgICAgICAgdFRyYW5zcGFyZW50OiB7dmFsdWU6IHt0ZXh0dXJlOiB1bmRlZmluZWR9fVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGRlcHRoVGVzdDogZmFsc2UsXG4gICAgICAgICAgICBkZXB0aFdyaXRlOiBmYWxzZVxuXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmJsYWNrUHJvZ3JhbSA9IG5ldyBQcm9ncmFtKGdsLCB7dmVydGV4OiBVdGlscy5jb3B5VmVydGV4LCBmcmFnbWVudDogYFxuICAgICAgICAgICAgcHJlY2lzaW9uIGhpZ2hwIGZsb2F0O1xuICAgICAgICAgICAgdmFyeWluZyB2ZWMyIHZVdjtcbiAgICAgICAgICAgIHZvaWQgbWFpbigpIHtcbiAgICAgICAgICAgICAgICBnbF9GcmFnQ29sb3IgPSB2ZWM0KDAsMCwwLDApO1xuICAgICAgICAgICAgfVxuICAgICAgICBgLCB1bmlmb3Jtczoge1xuICAgICAgICAgICAgICAgIHRPcGFxdWU6IHt2YWx1ZToge3RleHR1cmU6IHVuZGVmaW5lZH19LFxuICAgICAgICAgICAgICAgIHRUcmFuc3BhcmVudDoge3ZhbHVlOiB7dGV4dHVyZTogdW5kZWZpbmVkfX1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBkZXB0aFRlc3Q6IGZhbHNlLFxuICAgICAgICAgICAgZGVwdGhXcml0ZTogZmFsc2VcblxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICByZW5kZXJXaXRoRkJPKHJlbmRlcmVyOiBSZW5kZXJlciwgZmJvOiBIRFJGcmFtZSl7XG4gICAgICAgIHRoaXMuX3NjZW5lLnVwZGF0ZU1hdHJpeFdvcmxkKCk7XG4gICAgICAgIHJlbmRlcmVyLmdsLmNsZWFyQ29sb3IoMCwwLDAsMCk7XG4gICAgICAgIGlmIChmYm8udHJhbnNwYXJlbnQgJiYgZmJvLnJlYWQpIHtcbiAgICAgICAgICAgIGlmICghKGZiby50cmFuc3BhcmVudCAmJiBmYm8ucmVhZCkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsZXQgcmVuZGVyTGlzdCA9IHJlbmRlcmVyLnNvcnRSZW5kZXJMaXN0KHJlbmRlcmVyLnNjZW5lVG9SZW5kZXJMaXN0KHRoaXMuX3NjZW5lLCB0cnVlLCB0aGlzLl9jYW1lcmEpLCB0aGlzLl9jYW1lcmEsIHRydWUpO1xuICAgICAgICAgICAgcmVuZGVyZXIucmVuZGVyKHtcbiAgICAgICAgICAgICAgICBzY2VuZTogcmVuZGVyTGlzdC5vcGFxdWUsXG4gICAgICAgICAgICAgICAgY2FtZXJhOiB0aGlzLl9jYW1lcmEsXG4gICAgICAgICAgICAgICAgdGFyZ2V0OiBmYm8ucmVhZCxcbiAgICAgICAgICAgICAgICBzb3J0OiBmYWxzZSxcbiAgICAgICAgICAgICAgICBjbGVhcjogZmFsc2VcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy5nbC5iaW5kRnJhbWVidWZmZXIoZmJvLnRyYW5zcGFyZW50LnRhcmdldCwgZmJvLnRyYW5zcGFyZW50LmJ1ZmZlcik7XG4gICAgICAgICAgICBpZiAoZmJvLnJlYWQuZGVwdGggJiYgIWZiby5yZWFkLnN0ZW5jaWwpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmdsLmZyYW1lYnVmZmVyUmVuZGVyYnVmZmVyKGZiby50cmFuc3BhcmVudC50YXJnZXQsIHRoaXMuZ2wuREVQVEhfQVRUQUNITUVOVCwgdGhpcy5nbC5SRU5ERVJCVUZGRVIsIGZiby5yZWFkLmRlcHRoQnVmZmVyKTtcbiAgICAgICAgICAgIH1lbHNlIGlmIChmYm8ucmVhZC5zdGVuY2lsICYmICFmYm8ucmVhZC5kZXB0aCkge1xuICAgICAgICAgICAgICAgIHRoaXMuZ2wuZnJhbWVidWZmZXJSZW5kZXJidWZmZXIoZmJvLnRyYW5zcGFyZW50LnRhcmdldCwgdGhpcy5nbC5TVEVOQ0lMX0FUVEFDSE1FTlQsIHRoaXMuZ2wuUkVOREVSQlVGRkVSLCBmYm8ucmVhZC5zdGVuY2lsQnVmZmVyKTtcbiAgICAgICAgICAgIH1lbHNlIGlmIChmYm8ucmVhZC5kZXB0aCAmJiBmYm8ucmVhZC5zdGVuY2lsKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5nbC5mcmFtZWJ1ZmZlclJlbmRlcmJ1ZmZlcihmYm8udHJhbnNwYXJlbnQudGFyZ2V0LCB0aGlzLmdsLkRFUFRIX1NURU5DSUxfQVRUQUNITUVOVCwgdGhpcy5nbC5SRU5ERVJCVUZGRVIsIGZiby5yZWFkLmRlcHRoU3RlbmNpbEJ1ZmZlcik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmYm8udHJhbnNwYXJlbnQuZGVwdGggPSB0cnVlO1xuICAgICAgICAgICAgbGV0IG9sZENsZWFyQ29sb3IgPSByZW5kZXJlci5jb2xvcjtcbiAgICAgICAgICAgIGxldCBvbGRDbGVhckRlcHRoID0gcmVuZGVyZXIuZGVwdGg7XG4gICAgICAgICAgICByZW5kZXJlci5jb2xvciA9IHRydWU7XG4gICAgICAgICAgICByZW5kZXJlci5kZXB0aCA9IGZhbHNlO1xuICAgICAgICAgICAgLy90b2RvOiBjaGVjayBzdGVuY2lsXG4gICAgICAgICAgICByZW5kZXJlci5yZW5kZXIoe1xuICAgICAgICAgICAgICAgIHNjZW5lOiBbLi4ucmVuZGVyTGlzdC50cmFuc3BhcmVudCwgLi4ucmVuZGVyTGlzdC51aV0sXG4gICAgICAgICAgICAgICAgY2FtZXJhOiB0aGlzLl9jYW1lcmEsXG4gICAgICAgICAgICAgICAgdGFyZ2V0OiBmYm8udHJhbnNwYXJlbnQsXG4gICAgICAgICAgICAgICAgc29ydDogZmFsc2UsXG4gICAgICAgICAgICAgICAgY2xlYXI6IHRydWVcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy5ibGVuZFByb2dyYW0udW5pZm9ybXMudE9wYXF1ZS52YWx1ZSA9IGZiby5yZWFkLnRleHR1cmU7XG4gICAgICAgICAgICB0aGlzLmJsZW5kUHJvZ3JhbS51bmlmb3Jtcy50VHJhbnNwYXJlbnQudmFsdWUgPSBmYm8udHJhbnNwYXJlbnQudGV4dHVyZTtcbiAgICAgICAgICAgIFV0aWxzLmdldEluc3RhbmNlKHJlbmRlcmVyLmdsKS5yZW5kZXJQYXNzKHJlbmRlcmVyLCB0aGlzLmJsZW5kUHJvZ3JhbSwgZmJvLndyaXRlLCB0cnVlKTtcbiAgICAgICAgICAgIHJlbmRlcmVyLmNvbG9yID0gb2xkQ2xlYXJDb2xvcjtcbiAgICAgICAgICAgIHJlbmRlcmVyLmRlcHRoID0gb2xkQ2xlYXJEZXB0aDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlbmRlcmVyLnJlbmRlcih7c2NlbmU6IHRoaXMuX3NjZW5lLCBjYW1lcmE6IHRoaXMuX2NhbWVyYSwgdGFyZ2V0OiBmYm8ucmVhZH0pO1xuICAgICAgICB9XG4gICAgfVxufVxuZXhwb3J0IGNsYXNzIEhEUlRvbmVNYXBQYXNzIGV4dGVuZHMgUGFzcyB7XG4gICAgcHJpdmF0ZSB0b25lTWFwUHJvZ3JhbTogUHJvZ3JhbTtcbiAgICBwcml2YXRlIGdsOiBPR0xSZW5kZXJpbmdDb250ZXh0O1xuICAgIGNvbnN0cnVjdG9yKGdsOiBPR0xSZW5kZXJpbmdDb250ZXh0LCBoZHIgPSB0cnVlKSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIHRoaXMuZ2wgPSBnbDtcbiAgICAgICAgdGhpcy5uZWVkc1N3YXAgPSBmYWxzZTtcbiAgICAgICAgdGhpcy50b25lTWFwUHJvZ3JhbSA9IG5ldyBQcm9ncmFtKGdsLCB7dmVydGV4OiBVdGlscy5jb3B5VmVydGV4LCBmcmFnbWVudDogYFxuICAgICAgICAgICAgcHJlY2lzaW9uIGhpZ2hwIGZsb2F0O1xuICAgICAgICAgICAgI2RlZmluZSBpbnB1dEVuY29kaW5nICR7aGRyP0VuY29kaW5nSGVscGVyLlJHQk0xNjpFbmNvZGluZ0hlbHBlci5MaW5lYXJ9XG4gICAgICAgICAgICAjZGVmaW5lIG91dHB1dEVuY29kaW5nICR7RW5jb2RpbmdIZWxwZXIuc1JHQn1cbiAgICAgICAgICAgICNkZWZpbmUgdG9uZW1hcHBpbmdNb2RlICR7aGRyP1RvbmVNYXBwaW5nSGVscGVyLkxpbmVhcjpUb25lTWFwcGluZ0hlbHBlci5MaW5lYXJ9XG4gICAgICAgICAgICAke0VuY29kaW5nSGVscGVyLnNoYWRlckNodW5rfVxuICAgICAgICAgICAgJHtUb25lTWFwcGluZ0hlbHBlci5zaGFkZXJDaHVua31cbiAgICAgICAgICAgIHVuaWZvcm0gc2FtcGxlcjJEIHRNYXA7XG4gICAgICAgICAgICB2YXJ5aW5nIHZlYzIgdlV2O1xuICAgICAgICAgICAgdm9pZCBtYWluKCkge1xuICAgICAgICAgICAgICAgIHZlYzQgY29sb3IgPSBpbnB1dFRleGVsVG9MaW5lYXIodGV4dHVyZTJEKHRNYXAsIHZVdikpO1xuICAgICAgICAgICAgICAgIGNvbG9yLnJnYiA9IHRvbmVNYXBDb2xvcihjb2xvci5yZ2IqMS4pO1xuICAgICAgICAgICAgICAgIGdsX0ZyYWdDb2xvciA9IGxpbmVhclRvT3V0cHV0VGV4ZWwoY29sb3IpO1xuICAgICAgICAgICAgICAgIC8vIGdsX0ZyYWdDb2xvci5hID0gY29sb3IuYTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgYCwgdW5pZm9ybXM6IHtcbiAgICAgICAgICAgICAgICB0TWFwOiB7dmFsdWU6IHt0ZXh0dXJlOiB1bmRlZmluZWR9fSxcbiAgICAgICAgICAgICAgICAuLi5Ub25lTWFwcGluZ0hlbHBlci51bmlmb3JtcyAvL3RvZG86IHVuaWZvcm0gdXRpbHMgY2xvbmUuXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGRlcHRoVGVzdDogZmFsc2UsXG4gICAgICAgICAgICAgICAgZGVwdGhXcml0ZTogZmFsc2VcbiAgICAgICAgICAgIH1cbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICByZW5kZXJXaXRoRkJPKHJlbmRlcmVyOiBSZW5kZXJlciwgZmJvOiBIRFJGcmFtZSl7XG4gICAgICAgIHRoaXMudG9uZU1hcFByb2dyYW0udW5pZm9ybXNbJ3RNYXAnXS52YWx1ZSA9IGZiby5yZWFkPy50ZXh0dXJlO1xuICAgICAgICBVdGlscy5nZXRJbnN0YW5jZShyZW5kZXJlci5nbCkucmVuZGVyUGFzcyhyZW5kZXJlciwgdGhpcy50b25lTWFwUHJvZ3JhbSwgdGhpcy5yZW5kZXJUb1NjcmVlbiA/IHVuZGVmaW5lZCA6IGZiby53cml0ZSwgdHJ1ZSk7XG4gICAgICAgIHRoaXMubmVlZHNTd2FwID0gIXRoaXMucmVuZGVyVG9TY3JlZW47XG4gICAgfVxuICAgIHJlc2l6ZSh7IHdpZHRoLCBoZWlnaHQsIGRwciB9OiBQYXJ0aWFsPHtcbiAgICAgICAgd2lkdGg6IG51bWJlcjtcbiAgICAgICAgaGVpZ2h0OiBudW1iZXI7XG4gICAgICAgIGRwcjogbnVtYmVyO1xuICAgIH0+KTogdm9pZHtcbiAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBIRFJIZWxwZXIge1xuICAgIHJlYWRvbmx5IGZsb2F0aW5nU3VwcG9ydEV4dCA9IHtcbiAgICAgICAgdGV4dHVyZTogJ09FU190ZXh0dXJlX2Zsb2F0JyxcbiAgICAgICAgbGluZWFyOiAnT0VTX3RleHR1cmVfZmxvYXRfbGluZWFyJyxcbiAgICAgICAgY29sb3I6ICdXRUJHTF9jb2xvcl9idWZmZXJfZmxvYXQnLFxuICAgICAgICBoX3RleHR1cmU6ICdPRVNfdGV4dHVyZV9oYWxmX2Zsb2F0JyxcbiAgICAgICAgaF9saW5lYXI6ICdPRVNfdGV4dHVyZV9oYWxmX2Zsb2F0X2xpbmVhcicsXG4gICAgICAgIGhfY29sb3I6ICdFWFRfY29sb3JfYnVmZmVyX2hhbGZfZmxvYXQnLFxuICAgIH07XG4gICAgcHJpdmF0ZSByZWFkb25seSBfZmxvYXRpbmdTdXBwb3J0OiBhbnkgPSB7XG4gICAgICAgIHRleHR1cmU6IGZhbHNlLFxuICAgICAgICBsaW5lYXI6IGZhbHNlLFxuICAgICAgICBjb2xvcjogZmFsc2UsXG4gICAgICAgIGhfdGV4dHVyZTogZmFsc2UsXG4gICAgICAgIGhfbGluZWFyOiBmYWxzZSxcbiAgICAgICAgaF9jb2xvcjogZmFsc2UsXG4gICAgfTtcbiAgICBwcml2YXRlIGdsOiBPR0xSZW5kZXJpbmdDb250ZXh0O1xuICAgIGdldCBoYWxmRmxvYXRUeXBlKCk6IG51bWJlcntcbiAgICAgICAgcmV0dXJuIHRoaXMuZmxvYXRpbmdTdXBwb3J0LmhfY29sb3IgPyB0aGlzLmZsb2F0aW5nU3VwcG9ydC5oX3RleHR1cmUuSEFMRl9GTE9BVF9PRVMgOiB0aGlzLmZsb2F0VHlwZTtcbiAgICB9O1xuICAgIGdldCBmbG9hdFR5cGUoKTogbnVtYmVye1xuICAgICAgICByZXR1cm4gKHRoaXMuZmxvYXRpbmdTdXBwb3J0LmNvbG9yID8gdGhpcy5nbC5GTE9BVCA6IHRoaXMuZ2wuVU5TSUdORURfQllURSk7XG4gICAgfTtcbiAgICBnZXQgaW50VHlwZSgpOiBudW1iZXJ7XG4gICAgICAgIHJldHVybiB0aGlzLmdsLlVOU0lHTkVEX0JZVEU7XG4gICAgfTtcbiAgICBnZXQgY2FuRmxvYXREcmF3KCk6IG51bWJlcntcbiAgICAgICAgcmV0dXJuIHRoaXMuZmxvYXRpbmdTdXBwb3J0LmhfY29sb3IgfHwgdGhpcy5mbG9hdGluZ1N1cHBvcnQuY29sb3I7XG4gICAgfTtcblxuICAgIGNvbnN0cnVjdG9yKGdsOiBPR0xSZW5kZXJpbmdDb250ZXh0KSB7XG4gICAgICAgIHRoaXMuZ2wgPSBnbDtcbiAgICAgICAgdGhpcy5pbml0RmxvYXRTdXBwb3J0KCk7XG4gICAgfVxuXG4gICAgaW5pdEZsb2F0U3VwcG9ydCgpIHtcbiAgICAgICAgbGV0IGV4dCA9IHRoaXMuZ2wuZ2V0RXh0ZW5zaW9uKHRoaXMuZmxvYXRpbmdTdXBwb3J0RXh0LnRleHR1cmUpO1xuICAgICAgICBpZiAoZXh0KSB7XG4gICAgICAgICAgICB0aGlzLl9mbG9hdGluZ1N1cHBvcnQudGV4dHVyZSA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLl9mbG9hdGluZ1N1cHBvcnQuY29sb3IgPSB0aGlzLmdsLmdldEV4dGVuc2lvbih0aGlzLmZsb2F0aW5nU3VwcG9ydEV4dC5jb2xvcik7IC8vIHRvZG8gY2hlY2sgYnkgZHJhd2luZ1xuICAgICAgICAgICAgdGhpcy5fZmxvYXRpbmdTdXBwb3J0LmxpbmVhciA9IHRoaXMuZ2wuZ2V0RXh0ZW5zaW9uKHRoaXMuZmxvYXRpbmdTdXBwb3J0RXh0LmxpbmVhcik7XG4gICAgICAgIH1cbiAgICAgICAgZXh0ID0gdGhpcy5nbC5nZXRFeHRlbnNpb24odGhpcy5mbG9hdGluZ1N1cHBvcnRFeHQuaF90ZXh0dXJlKTtcbiAgICAgICAgaWYgKGV4dCkge1xuICAgICAgICAgICAgdGhpcy5fZmxvYXRpbmdTdXBwb3J0LmhfdGV4dHVyZSA9IGV4dDtcbiAgICAgICAgICAgIHRoaXMuX2Zsb2F0aW5nU3VwcG9ydC5oX2NvbG9yID0gdGhpcy5nbC5nZXRFeHRlbnNpb24odGhpcy5mbG9hdGluZ1N1cHBvcnRFeHQuaF9jb2xvcik7XG4gICAgICAgICAgICB0aGlzLl9mbG9hdGluZ1N1cHBvcnQuaF9saW5lYXIgPSB0aGlzLmdsLmdldEV4dGVuc2lvbih0aGlzLmZsb2F0aW5nU3VwcG9ydEV4dC5oX2xpbmVhcik7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZ2V0IGZsb2F0aW5nU3VwcG9ydCgpOiBhbnkge1xuICAgICAgICByZXR1cm4gey4uLnRoaXMuX2Zsb2F0aW5nU3VwcG9ydH07XG4gICAgfVxuXG5cbn1cblxuZXhwb3J0IGNsYXNzIEhEUkZyYW1lIGltcGxlbWVudHMgUG9zdEZCT3tcbiAgICByZWFkPzogUmVuZGVyVGFyZ2V0O1xuICAgIHdyaXRlPzogUmVuZGVyVGFyZ2V0O1xuICAgIHRyYW5zcGFyZW50PzogUmVuZGVyVGFyZ2V0O1xuICAgIHByaXZhdGUgZ2w6IE9HTFJlbmRlcmluZ0NvbnRleHQ7XG4gICAgcHJpdmF0ZSBoZWxwZXI6IEhEUkhlbHBlcjtcblxuICAgIGNvbnN0cnVjdG9yKGdsOiBPR0xSZW5kZXJpbmdDb250ZXh0LCBoZWxwZXI6IEhEUkhlbHBlcikge1xuICAgICAgICB0aGlzLmdsID0gZ2w7XG4gICAgICAgIHRoaXMuaGVscGVyID0gaGVscGVyO1xuICAgIH1cbiAgICBzd2FwKCk6IHZvaWQge1xuICAgICAgICBsZXQgdCA9IHRoaXMucmVhZDtcbiAgICAgICAgdGhpcy5yZWFkID0gdGhpcy53cml0ZTtcbiAgICAgICAgdGhpcy53cml0ZSA9IHQ7XG4gICAgfVxuXG4gICAgY3JlYXRlKG9wdGlvbnM6IFBhcnRpYWw8UmVuZGVyVGFyZ2V0T3B0aW9ucz4pe1xuICAgICAgICB0aGlzLnJlYWQgPSBuZXcgUmVuZGVyVGFyZ2V0KHRoaXMuZ2wsIG9wdGlvbnMpO1xuICAgICAgICB0aGlzLndyaXRlID0gbmV3IFJlbmRlclRhcmdldCh0aGlzLmdsLCBvcHRpb25zKTtcbiAgICAgICAgdGhpcy50cmFuc3BhcmVudCA9IG5ldyBSZW5kZXJUYXJnZXQodGhpcy5nbCwge1xuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgICAgIHR5cGU6IHRoaXMuaGVscGVyLmhhbGZGbG9hdFR5cGUsXG4gICAgICAgICAgICBmb3JtYXQ6IHRoaXMuZ2wuUkdCQSxcbiAgICAgICAgICAgIGRlcHRoOiBmYWxzZSxcbiAgICAgICAgICAgIGludGVybmFsRm9ybWF0OiAodGhpcy5oZWxwZXIuY2FuRmxvYXREcmF3ICYmIHRoaXMuZ2wucmVuZGVyZXIuaXNXZWJnbDIpID8gKHRoaXMuZ2wgYXMgV2ViR0wyUmVuZGVyaW5nQ29udGV4dCkuUkdCQTMyRiA6IHRoaXMuZ2wuUkdCQSxcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZGlzcG9zZSgpe1xuICAgICAgICB0aGlzLnJlYWQgJiYgdGhpcy5yZWFkLmRpc3Bvc2UoKTtcbiAgICAgICAgdGhpcy53cml0ZSAmJiB0aGlzLndyaXRlLmRpc3Bvc2UoKTtcbiAgICAgICAgdGhpcy50cmFuc3BhcmVudCAmJiB0aGlzLnRyYW5zcGFyZW50LmRpc3Bvc2UoKTtcbiAgICAgICAgdGhpcy5yZWFkID0gdW5kZWZpbmVkO1xuICAgICAgICB0aGlzLndyaXRlID0gdW5kZWZpbmVkO1xuICAgICAgICB0aGlzLnRyYW5zcGFyZW50ID0gdW5kZWZpbmVkO1xuICAgIH1cblxufVxuXG5leHBvcnQgaW50ZXJmYWNlIEhEUlBvc3RPcHRpb25zIGV4dGVuZHMgUG9zdE9wdGlvbnN7XG4gICAgLy8gZW5jb2Rpbmc6IG51bWJlclxufVxuXG5leHBvcnQgY2xhc3MgSERSQ29tcG9zZXIgZXh0ZW5kcyBDdXN0b21Qb3N0e1xuICAgIGNvbnN0cnVjdG9yKGdsOiBPR0xSZW5kZXJpbmdDb250ZXh0LCBvcHRpb25zOiBQYXJ0aWFsPEhEUlBvc3RPcHRpb25zPikge1xuICAgICAgICBzdXBlcihnbCwgb3B0aW9ucywgbmV3IEhEUkZyYW1lKGdsLCBuZXcgSERSSGVscGVyKGdsKSkpO1xuICAgIH1cblxuICAgIGRpc3Bvc2VGYm8oKSB7XG4gICAgICAgICh0aGlzLmZibyBhcyBIRFJGcmFtZSkuZGlzcG9zZSgpO1xuICAgIH1cblxuICAgIGluaXRGYm8oKSB7XG4gICAgICAgICh0aGlzLmZibyBhcyBIRFJGcmFtZSkuY3JlYXRlKHRoaXMub3B0aW9ucyk7XG4gICAgfVxufVxuIiwiZXhwb3J0ICogZnJvbSBcIi4vb2dsXCJcblxuZXhwb3J0ICogZnJvbSAnLi9tYXRlcmlhbHMvcGJybWF0ZXJpYWwnO1xuZXhwb3J0ICogZnJvbSBcIi4vdXRpbHMvdW5pZm9ybVV0aWxzXCI7XG5leHBvcnQgKiBmcm9tIFwiLi91dGlscy9wYnJoZWxwZXJcIjtcbmV4cG9ydCAqIGZyb20gXCIuL3V0aWxzL3V0aWxcIjtcbmV4cG9ydCAqIGZyb20gXCIuL3V0aWxzL2V2ZW50ZGlzcGF0Y2hlclwiO1xuZXhwb3J0ICogZnJvbSBcIi4vZXh0cmFzL0N1c3RvbVBvc3RcIjtcbmV4cG9ydCAqIGZyb20gXCIuL2V4dHJhcy9SZW5kZXJVdGlsc1wiO1xuZXhwb3J0ICogZnJvbSBcIi4vaGRyL0hEUkNvbXBvc2VyXCI7XG4iLCJpbXBvcnQgcGJydmVydCBmcm9tICcuL3NoYWRlcnMvcGJyLnZlcnQnO1xuaW1wb3J0IHBicmZyYWcgZnJvbSAnLi9zaGFkZXJzL3Bici5mcmFnJztcbmltcG9ydCB7UHJvZ3JhbUNhY2hlfSBmcm9tICcuLi91dGlscy9wcm9ncmFtY2FjaGUnO1xuaW1wb3J0IHtQcm9ncmFtLCBUZXh0dXJlLCBUZXh0dXJlTG9hZGVyLCBWZWMzLCBWZWM0fSBmcm9tIFwiLi4vb2dsXCI7XG5pbXBvcnQge0VuY29kaW5nSGVscGVyfSBmcm9tIFwiLi4vdXRpbHMvdXRpbFwiO1xuXG5leHBvcnQgdHlwZSBUVW5pZm9ybXMgPSBSZWNvcmQ8c3RyaW5nLCB7IHZhbHVlPzogYW55IH0+XG5cbmV4cG9ydCBjbGFzcyBQQlJNYXRlcmlhbCB7XG4gICAgcHJvdGVjdGVkIHN0YXRpYyByZWFkb25seSBkZWZhdWx0VmVydGV4OiBzdHJpbmcgPSBwYnJ2ZXJ0O1xuICAgIHByb3RlY3RlZCBzdGF0aWMgcmVhZG9ubHkgZGVmYXVsdEZyYWdtZW50OiBzdHJpbmcgPSBgJHtwYnJmcmFnfWBcblxuICAgIHByaXZhdGUgZ2xfOiBhbnk7XG4gICAgcHJpdmF0ZSBwcm9ncmFtXzogUHJvZ3JhbTtcbiAgICBwcml2YXRlIHVuaWZvcm1zXzogYW55O1xuICAgIHByaXZhdGUgc3RhdGljIGx1dFRleHR1cmVNYXA6IE1hcDxzdHJpbmcsIFRleHR1cmU+ID0gbmV3IE1hcDxzdHJpbmcsIFRleHR1cmU+KCk7XG4gICAgcHJpdmF0ZSBlbnZNYXBTcGVjdWxhcl8/OiBUZXh0dXJlO1xuICAgIHByaXZhdGUgZW52TWFwRGlmZnVzZV8/OiBUZXh0dXJlO1xuXG4gICAgcHJpdmF0ZSBjb2xvcl86IFZlYzQgPSBuZXcgVmVjNCgxLCAxLCAxLCAxKTtcbiAgICBwcml2YXRlIHJvdWdobmVzc186IG51bWJlciA9IDA7XG4gICAgcHJpdmF0ZSBtZXRhbG5lc3NfOiBudW1iZXIgPSAwO1xuICAgIHByaXZhdGUgZW52TWFwSW50ZW5zaXR5XzogbnVtYmVyID0gMTtcblxuICAgIG1ha2VGcmFnbWVudFNoYWRlcihmcmFnOiBzdHJpbmcsIGhkciA9IHRydWUpe1xuICAgICAgICByZXR1cm4gYFxucHJlY2lzaW9uIGhpZ2hwIGZsb2F0O1xucHJlY2lzaW9uIGhpZ2hwIGludDtcbiNkZWZpbmUgaW5wdXRFbmNvZGluZyAke2hkcj9FbmNvZGluZ0hlbHBlci5SR0JNMTY6RW5jb2RpbmdIZWxwZXIuTGluZWFyfVxuI2RlZmluZSBvdXRwdXRFbmNvZGluZyAke2hkcj9FbmNvZGluZ0hlbHBlci5SR0JNMTY6RW5jb2RpbmdIZWxwZXIuTGluZWFyfVxuJHtFbmNvZGluZ0hlbHBlci5zaGFkZXJDaHVua31cbiR7ZnJhZ31cbmBcbiAgICB9XG4gICAgY29uc3RydWN0b3IoZ2w6IGFueSwgcGJycGFyYW1zPzogUEJSTWF0ZXJpYWxQYXJhbXMsIGRlZmluZXM/IDogc3RyaW5nLCB1bmlmb3Jtcz86IFRVbmlmb3Jtcywgc2hhZGVycz86IHtmcmFnPzogc3RyaW5nLCB2ZXJ0Pzogc3RyaW5nfSwgaGRyPXRydWUpIHtcbiAgICAgICAgdGhpcy5nbF8gPSBnbDtcblxuICAgICAgICBpZighUEJSTWF0ZXJpYWwubHV0VGV4dHVyZU1hcC5nZXQoZ2wuY2FudmFzLmlkKSkge1xuICAgICAgICAgICAgUEJSTWF0ZXJpYWwubHV0VGV4dHVyZU1hcC5zZXQoZ2wuY2FudmFzLmlkLCBUZXh0dXJlTG9hZGVyLmxvYWQoZ2wsIHtcbiAgICAgICAgICAgICAgc3JjOiAnaHR0cHM6Ly9hc3NldHMuamV3bHIuY29tL2ozZC9sdXQucG5nJyxcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBwYnJWZXJ0ID0gc2hhZGVycz8udmVydCA/PyBQQlJNYXRlcmlhbC5kZWZhdWx0VmVydGV4O1xuICAgICAgICBsZXQgcGJyRnJhZyA9IHNoYWRlcnM/LmZyYWcgPz8gUEJSTWF0ZXJpYWwuZGVmYXVsdEZyYWdtZW50O1xuXG4gICAgICAgIHRoaXMuY29sb3JfID0gcGJycGFyYW1zPy5iYXNlQ29sb3JGYWN0b3IgIT09IHVuZGVmaW5lZCA/IG5ldyBWZWM0KCkuY29weShwYnJwYXJhbXMuYmFzZUNvbG9yRmFjdG9yKSA6IG5ldyBWZWM0KDEsIDEsIDEsIDEpO1xuICAgICAgICB0aGlzLnJvdWdobmVzcyA9IHBicnBhcmFtcz8ucm91Z2huZXNzICE9PSB1bmRlZmluZWQgPyBwYnJwYXJhbXMucm91Z2huZXNzIDogMDtcbiAgICAgICAgdGhpcy5tZXRhbG5lc3MgPSBwYnJwYXJhbXM/Lm1ldGFsbmVzcyAhPT0gdW5kZWZpbmVkID8gcGJycGFyYW1zLm1ldGFsbmVzcyA6IDA7XG4gICAgICAgIHRoaXMuZW52TWFwSW50ZW5zaXR5ID0gcGJycGFyYW1zPy5lbnZNYXBJbnRlbnNpdHkgIT09IHVuZGVmaW5lZCA/IHBicnBhcmFtcz8uZW52TWFwSW50ZW5zaXR5IDogMTtcblxuICAgICAgICB0aGlzLnVuaWZvcm1zXyA9IHtcbiAgICAgICAgICAgIHVCYXNlQ29sb3JGYWN0b3I6IHsgdmFsdWU6IG5ldyBWZWM0KCkuY29weSh0aGlzLmNvbG9yXykgfSxcbiAgICAgICAgICAgIHRCYXNlQ29sb3I6IHsgdmFsdWU6IHBicnBhcmFtcz8uYmFzZUNvbG9yVGV4dHVyZSA/IHBicnBhcmFtcz8uYmFzZUNvbG9yVGV4dHVyZS50ZXh0dXJlIDogbnVsbCB9LFxuXG4gICAgICAgICAgICB1Um91Z2huZXNzOiB7IHZhbHVlOiBwYnJwYXJhbXM/LnJvdWdobmVzcyAhPT0gdW5kZWZpbmVkID8gcGJycGFyYW1zPy5yb3VnaG5lc3MgOiAxIH0sXG4gICAgICAgICAgICB1TWV0YWxsaWM6IHsgdmFsdWU6IHBicnBhcmFtcz8ubWV0YWxuZXNzICE9PSB1bmRlZmluZWQgPyBwYnJwYXJhbXM/Lm1ldGFsbmVzcyA6IDEgfSxcblxuICAgICAgICAgICAgdE5vcm1hbDogeyB2YWx1ZTogeyB0ZXh0dXJlOiBudWxsfSB9LFxuICAgICAgICAgICAgdU5vcm1hbFNjYWxlOiB7IHZhbHVlOiBwYnJwYXJhbXM/Lm5vcm1hbFNjYWxlIHx8IDEgfSxcblxuICAgICAgICAgICAgdE9jY2x1c2lvbjogeyB2YWx1ZTogeyB0ZXh0dXJlOiBudWxsfSB9LFxuXG4gICAgICAgICAgICB0RW1pc3NpdmU6IHsgdmFsdWU6IHsgdGV4dHVyZTogbnVsbH0gfSxcbiAgICAgICAgICAgIHVFbWlzc2l2ZTogeyB2YWx1ZTogcGJycGFyYW1zPy5lbWlzc2l2ZSB8fCBbMCwgMCwgMF0gfSxcblxuICAgICAgICAgICAgdExVVDogeyB2YWx1ZTogUEJSTWF0ZXJpYWwubHV0VGV4dHVyZU1hcC5nZXQoZ2wuY2FudmFzLmlkKSB9LFxuICAgICAgICAgICAgdEVudkRpZmZ1c2U6IHsgdmFsdWU6IHsgdGV4dHVyZTogbnVsbH0gfSxcbiAgICAgICAgICAgIHRFbnZTcGVjdWxhcjogeyB2YWx1ZTogeyB0ZXh0dXJlOiBudWxsfSB9LFxuICAgICAgICAgICAgdUVudkRpZmZ1c2U6IHsgdmFsdWU6IDAuNSB9LFxuICAgICAgICAgICAgdUVudlNwZWN1bGFyOiB7IHZhbHVlOiAwLjUgfSxcbiAgICAgICAgICAgIHVFbnZNYXBJbnRlbnNpdHk6IHsgdmFsdWU6IDEgfSxcblxuICAgICAgICAgICAgdUFscGhhOiB7IHZhbHVlOiBwYnJwYXJhbXM/LmFscGhhIH0sXG4gICAgICAgICAgICB1QWxwaGFDdXRvZmY6IHsgdmFsdWU6IHBicnBhcmFtcz8uYWxwaGFDdXRvZmYgfSxcblxuICAgICAgICAgICAgdVRyYW5zcGFyZW50OiB7IHZhbHVlOiBwYnJwYXJhbXM/LnRyYW5zcGFyZW50IH0sXG5cbiAgICAgICAgICAgIC4uLih1bmlmb3Jtcz8/e30pLFxuICAgICAgICB9XG4gICAgICAgIGRlZmluZXMgPSBkZWZpbmVzID8gZGVmaW5lcyA6IGBgO1xuICAgICAgICB0aGlzLnByb2dyYW1fID0gdGhpcy5jcmVhdGVQcm9ncmFtXyhkZWZpbmVzLCBwYnJWZXJ0LCBwYnJGcmFnLCBoZHIpO1xuICAgIH1cblxuICAgIGdldCBpc1BCUk1hdGVyaWFsKCkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBnZXQgcHJvZ3JhbSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJvZ3JhbV87XG4gICAgfVxuXG4gICAgc2V0IGNvbG9yKGNvbG9yOiBWZWM0KSB7XG4gICAgICAgIHRoaXMuY29sb3JfLmNvcHkoY29sb3IpO1xuICAgIH1cblxuICAgIGdldCBjb2xvcigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29sb3JfO1xuICAgIH1cblxuICAgIHNldCBlbWlzc2l2ZShjb2xvcjogVmVjMykge1xuICAgICAgICBsZXQgY29sb3JfID0gdGhpcy51bmlmb3Jtc18udUVtaXNzaXZlLnZhbHVlO1xuICAgICAgICBjb2xvcl8uY29weShjb2xvcik7XG4gICAgfVxuXG4gICAgZ2V0IGVtaXNzaXZlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy51bmlmb3Jtc18udUVtaXNzaXZlLnZhbHVlO1xuICAgIH1cblxuICAgIHNldCByb3VnaG5lc3Mocm91Z2huZXNzOiBudW1iZXIpIHtcbiAgICAgICAgdGhpcy5yb3VnaG5lc3NfID0gcm91Z2huZXNzO1xuICAgIH1cblxuICAgIGdldCByb3VnaG5lc3MoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnJvdWdobmVzc187XG4gICAgfVxuXG4gICAgc2V0IG1ldGFsbmVzcyhtZXRhbG5lc3M6IG51bWJlcikge1xuICAgICAgICB0aGlzLm1ldGFsbmVzc18gPSBtZXRhbG5lc3M7XG4gICAgfVxuXG4gICAgZ2V0IG1ldGFsbmVzcygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubWV0YWxuZXNzXztcbiAgICB9XG5cbiAgICBzZXQgbm9ybWFsU2NhbGUobm9ybWFsU2NhbGU6IG51bWJlcikge1xuICAgICAgICB0aGlzLnVuaWZvcm1zXy51Tm9ybWFsU2NhbGUudmFsdWUgPSBub3JtYWxTY2FsZTtcbiAgICB9XG5cbiAgICBnZXQgbm9ybWFsU2NhbGUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnVuaWZvcm1zXy51Tm9ybWFsU2NhbGUudmFsdWU7XG4gICAgfVxuXG4gICAgc2V0IGVudk1hcFNwZWN1bGFyKGVudk1hcFNwZWN1bGFyOiBhbnkpIHtcbiAgICAgICAgdGhpcy5lbnZNYXBTcGVjdWxhcl8gPSBlbnZNYXBTcGVjdWxhcjtcbiAgICB9XG5cbiAgICBnZXQgZW52TWFwU3BlY3VsYXIoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmVudk1hcFNwZWN1bGFyXztcbiAgICB9XG5cbiAgICBzZXQgZW52TWFwRGlmZnVzZShlbnZNYXBEaWZmdXNlOiBhbnkpIHtcbiAgICAgICAgdGhpcy5lbnZNYXBEaWZmdXNlXyA9IGVudk1hcERpZmZ1c2U7XG4gICAgfVxuXG4gICAgZ2V0IGVudk1hcERpZmZ1c2UoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmVudk1hcERpZmZ1c2VfO1xuICAgIH1cblxuICAgIHNldCBlbnZNYXBJbnRlbnNpdHkoZW52TWFwSW50ZW5zaXR5OiBhbnkpIHtcbiAgICAgICAgdGhpcy5lbnZNYXBJbnRlbnNpdHlfID0gZW52TWFwSW50ZW5zaXR5O1xuICAgIH1cblxuICAgIGdldCBlbnZNYXBJbnRlbnNpdHkoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmVudk1hcEludGVuc2l0eV87XG4gICAgfVxuXG4gICAgcHVibGljIHNlcmlhbGl6ZSgpIDogUEJSTWF0ZXJpYWxQYXJhbXMge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgYmFzZUNvbG9yOiBuZXcgVmVjNCgxLCAxLCAxLCAxKSxcbiAgICAgICAgICAgIGJhc2VDb2xvckZhY3RvcjogdGhpcy5jb2xvcl8uY29weShuZXcgVmVjNCgpKSxcbiAgICAgICAgICAgIHJvdWdobmVzczogdGhpcy5yb3VnaG5lc3NfLFxuICAgICAgICAgICAgbWV0YWxuZXNzOiB0aGlzLm1ldGFsbmVzc18sXG4gICAgICAgICAgICBlbnZNYXBJbnRlbnNpdHk6IHRoaXMuZW52TWFwSW50ZW5zaXR5XG4gICAgICAgICAgICAvLyBub3JtYWxTY2FsZTogdGhpcy5ub3JtYWxTY2FsZVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIGxvYWQocGFyYW1zOiBQQlJNYXRlcmlhbFBhcmFtcykge1xuICAgICAgICBpZihwYXJhbXMpIHtcbiAgICAgICAgICAgIGlmKHBhcmFtcy5iYXNlQ29sb3JGYWN0b3IpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbG9yXy54ID0gcGFyYW1zLmJhc2VDb2xvckZhY3RvclswXSAhPT0gdW5kZWZpbmVkID8gcGFyYW1zLmJhc2VDb2xvckZhY3RvclswXSA6IHBhcmFtcy5iYXNlQ29sb3JGYWN0b3IueDtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbG9yXy55ID0gcGFyYW1zLmJhc2VDb2xvckZhY3RvclsxXSAhPT0gdW5kZWZpbmVkID8gcGFyYW1zLmJhc2VDb2xvckZhY3RvclsxXSA6IHBhcmFtcy5iYXNlQ29sb3JGYWN0b3IueTtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbG9yXy56ID0gcGFyYW1zLmJhc2VDb2xvckZhY3RvclsyXSAhPT0gdW5kZWZpbmVkID8gcGFyYW1zLmJhc2VDb2xvckZhY3RvclsyXSA6IHBhcmFtcy5iYXNlQ29sb3JGYWN0b3IuejtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbG9yXy53ID0gcGFyYW1zLmJhc2VDb2xvckZhY3RvclszXSAhPT0gdW5kZWZpbmVkID8gcGFyYW1zLmJhc2VDb2xvckZhY3RvclszXSA6IHBhcmFtcy5iYXNlQ29sb3JGYWN0b3IudztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmKHBhcmFtcy5lbWlzc2l2ZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuZW1pc3NpdmUueCA9IHBhcmFtcy5lbWlzc2l2ZS54O1xuICAgICAgICAgICAgICAgIHRoaXMuZW1pc3NpdmUueSA9IHBhcmFtcy5lbWlzc2l2ZS55O1xuICAgICAgICAgICAgICAgIHRoaXMuZW1pc3NpdmUueiA9IHBhcmFtcy5lbWlzc2l2ZS56O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYocGFyYW1zLnJvdWdobmVzcyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5yb3VnaG5lc3MgPSBwYXJhbXMucm91Z2huZXNzO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYocGFyYW1zLm1ldGFsbmVzcyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tZXRhbG5lc3MgPSBwYXJhbXMubWV0YWxuZXNzO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYocGFyYW1zLmVudk1hcEludGVuc2l0eSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5lbnZNYXBJbnRlbnNpdHkgPSBwYXJhbXMuZW52TWFwSW50ZW5zaXR5O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICB9XG5cbiAgICBwcml2YXRlIGNyZWF0ZVByb2dyYW1fKGRlZmluZXM6IHN0cmluZywgdmVydGV4Pzogc3RyaW5nLCBmcmFnbWVudD86IHN0cmluZywgaGRyOmJvb2xlYW4gPSB0cnVlKSB7XG4gICAgICAgIHZlcnRleCA9IHZlcnRleCA/PyBQQlJNYXRlcmlhbC5kZWZhdWx0VmVydGV4XG4gICAgICAgIGZyYWdtZW50ID0gdGhpcy5tYWtlRnJhZ21lbnRTaGFkZXIoZnJhZ21lbnQgPz8gUEJSTWF0ZXJpYWwuZGVmYXVsdEZyYWdtZW50LCBoZHIpO1xuXG4gICAgICAgIHZlcnRleCA9IGRlZmluZXMgKyB2ZXJ0ZXg7XG4gICAgICAgIGZyYWdtZW50ID0gZGVmaW5lcyArIGZyYWdtZW50O1xuXG4gICAgICAgIGxldCBwcm9ncmFtID0gUHJvZ3JhbUNhY2hlLmdldEluc3RhbmNlKCkuY3JlYXRlUHJvZ3JhbSh0aGlzLmdsXywgdmVydGV4LCBmcmFnbWVudCwgdGhpcy51bmlmb3Jtc18pO1xuICAgICAgICAvLyBjb25zdCBwcm9ncmFtID0gbmV3IFByb2dyYW0odGhpcy5nbF8sIHtcbiAgICAgICAgLy8gICAgIHZlcnRleCxcbiAgICAgICAgLy8gICAgIGZyYWdtZW50LFxuICAgICAgICAvLyAgICAgdW5pZm9ybXM6IHRoaXMudW5pZm9ybXNfLFxuICAgICAgICAvLyAgICAgLy8gdHJhbnNwYXJlbnQ6IHBicnBhcmFtcy5hbHBoYU1vZGUgPT09ICdCTEVORCcsXG4gICAgICAgIC8vICAgICBjdWxsRmFjZTogcGJycGFyYW1zLnNpZGUgPyBudWxsIDogdGhpcy5nbF8uQkFDSyxcbiAgICAgICAgLy8gfSk7XG5cbiAgICAgICAgcmV0dXJuIHByb2dyYW07XG4gICAgfVxufVxuXG5leHBvcnQgaW50ZXJmYWNlIFBCUk1hdGVyaWFsUGFyYW1zIHtcbiAgICBiYXNlQ29sb3I/OiBWZWM0LFxuICAgIGJhc2VDb2xvckZhY3Rvcj86IFZlYzQsXG4gICAgYmFzZUNvbG9yVGV4dHVyZT86IFRleHR1cmUsXG4gICAgdFJNPzogVGV4dHVyZSxcbiAgICByb3VnaG5lc3M/OiBudW1iZXIsXG4gICAgbWV0YWxuZXNzPzogbnVtYmVyLFxuICAgIG5vcm1hbE1hcD86IFRleHR1cmUsXG4gICAgbm9ybWFsU2NhbGU/OiBudW1iZXIsXG4gICAgYW9NYXA/OiBhbnksXG5cbiAgICBlbWlzc2l2ZU1hcD86IFRleHR1cmUsXG4gICAgZW1pc3NpdmVJbnRlbnNpdHk/OiBhbnksXG4gICAgZW1pc3NpdmU/OiBWZWMzLFxuXG4gICAgdEVudkRpZmZ1c2U/OiBUZXh0dXJlLFxuICAgIHRFbnZTcGVjdWxhcj86IFRleHR1cmUsXG4gICAgdUVudkRpZmZ1c2U/OiBudW1iZXIsXG4gICAgdUVudlNwZWN1bGFyPzogbnVtYmVyLFxuICAgIHVFbnZJbnRlbnNpdHk/OiBudW1iZXIsXG5cbiAgICBhbHBoYT86IG51bWJlcixcbiAgICBhbHBoYUN1dG9mZj86IG51bWJlcixcbiAgICBzaWRlPzogbnVtYmVyLFxuICAgIHRyYW5zcGFyZW50PzogYm9vbGVhbixcbiAgICBlbnZNYXBJbnRlbnNpdHk/OiBudW1iZXJcbn1cbiIsIi8qKlxuICogcG9ydGVkIGZyb20gaHR0cHM6Ly9naXRodWIuY29tL21yZG9vYi9ldmVudGRpc3BhdGNoZXIuanMvXG4gKi9cblxuZXhwb3J0IGNsYXNzIEV2ZW50RGlzcGF0Y2hlciB7XG4gICAgcHJpdmF0ZSBfbGlzdGVuZXJzOiBhbnk7XG4gICAgXG5cdGFkZEV2ZW50TGlzdGVuZXIgKCB0eXBlOiBzdHJpbmcsIGxpc3RlbmVyIDogYW55ICkge1xuXG5cdFx0aWYgKCB0aGlzLl9saXN0ZW5lcnMgPT09IHVuZGVmaW5lZCApIHRoaXMuX2xpc3RlbmVycyA9IHt9O1xuXG5cdFx0dmFyIGxpc3RlbmVycyA9IHRoaXMuX2xpc3RlbmVycztcblxuXHRcdGlmICggbGlzdGVuZXJzWyB0eXBlIF0gPT09IHVuZGVmaW5lZCApIHtcblxuXHRcdFx0bGlzdGVuZXJzWyB0eXBlIF0gPSBbXTtcblxuXHRcdH1cblxuXHRcdGlmICggbGlzdGVuZXJzWyB0eXBlIF0uaW5kZXhPZiggbGlzdGVuZXIgKSA9PT0gLSAxICkge1xuXG5cdFx0XHRsaXN0ZW5lcnNbIHR5cGUgXS5wdXNoKCBsaXN0ZW5lciApO1xuXG5cdFx0fVxuXG5cdH1cblxuXHRoYXNFdmVudExpc3RlbmVyKCB0eXBlOiBzdHJpbmcsIGxpc3RlbmVyIDogYW55KSB7XG5cblx0XHRpZiAoIHRoaXMuX2xpc3RlbmVycyA9PT0gdW5kZWZpbmVkICkgcmV0dXJuIGZhbHNlO1xuXG5cdFx0dmFyIGxpc3RlbmVycyA9IHRoaXMuX2xpc3RlbmVycztcblxuXHRcdHJldHVybiBsaXN0ZW5lcnNbIHR5cGUgXSAhPT0gdW5kZWZpbmVkICYmIGxpc3RlbmVyc1sgdHlwZSBdLmluZGV4T2YoIGxpc3RlbmVyICkgIT09IC0gMTtcblxuXHR9XG5cblx0cmVtb3ZlRXZlbnRMaXN0ZW5lciggdHlwZSA6IHN0cmluZywgbGlzdGVuZXIgOiBhbnkpIHtcblxuXHRcdGlmICggdGhpcy5fbGlzdGVuZXJzID09PSB1bmRlZmluZWQgKSByZXR1cm47XG5cblx0XHR2YXIgbGlzdGVuZXJzID0gdGhpcy5fbGlzdGVuZXJzO1xuXHRcdHZhciBsaXN0ZW5lckFycmF5ID0gbGlzdGVuZXJzWyB0eXBlIF07XG5cblx0XHRpZiAoIGxpc3RlbmVyQXJyYXkgIT09IHVuZGVmaW5lZCApIHtcblxuXHRcdFx0dmFyIGluZGV4ID0gbGlzdGVuZXJBcnJheS5pbmRleE9mKCBsaXN0ZW5lciApO1xuXG5cdFx0XHRpZiAoIGluZGV4ICE9PSAtIDEgKSB7XG5cblx0XHRcdFx0bGlzdGVuZXJBcnJheS5zcGxpY2UoIGluZGV4LCAxICk7XG5cblx0XHRcdH1cblxuXHRcdH1cblxuXHR9XG5cblx0ZGlzcGF0Y2hFdmVudCggZXZlbnQgOiBhbnkgKSB7XG5cblx0XHRpZiAoIHRoaXMuX2xpc3RlbmVycyA9PT0gdW5kZWZpbmVkICkgcmV0dXJuO1xuXG5cdFx0dmFyIGxpc3RlbmVycyA9IHRoaXMuX2xpc3RlbmVycztcblx0XHR2YXIgbGlzdGVuZXJBcnJheSA9IGxpc3RlbmVyc1sgZXZlbnQudHlwZSBdO1xuXG5cdFx0aWYgKCBsaXN0ZW5lckFycmF5ICE9PSB1bmRlZmluZWQgKSB7XG5cblx0XHRcdGV2ZW50LnRhcmdldCA9IHRoaXM7XG5cblx0XHRcdC8vIE1ha2UgYSBjb3B5LCBpbiBjYXNlIGxpc3RlbmVycyBhcmUgcmVtb3ZlZCB3aGlsZSBpdGVyYXRpbmcuXG5cdFx0XHR2YXIgYXJyYXkgPSBsaXN0ZW5lckFycmF5LnNsaWNlKCAwICk7XG5cblx0XHRcdGZvciAoIHZhciBpID0gMCwgbCA9IGFycmF5Lmxlbmd0aDsgaSA8IGw7IGkgKysgKSB7XG5cblx0XHRcdFx0YXJyYXlbIGkgXS5jYWxsKCB0aGlzLCBldmVudCApO1xuXG5cdFx0XHR9XG5cblx0XHR9XG5cblx0fVxufSIsImltcG9ydCB7UEJSTWF0ZXJpYWwsIFBCUk1hdGVyaWFsUGFyYW1zfSBmcm9tIFwiLi4vbWF0ZXJpYWxzL3Bicm1hdGVyaWFsXCI7XG5pbXBvcnQge01lc2gsIE9HTFJlbmRlcmluZ0NvbnRleHQsIFRyYW5zZm9ybSwgVmVjNH0gZnJvbSBcIi4uL29nbFwiO1xuXG5cbmZ1bmN0aW9uIGdldFBCUlBhcmFtcyhnbHRmTWF0ZXJpYWw6IGFueSkge1xuICAgIGxldCBwYnJwYXJhbXM6IFBCUk1hdGVyaWFsUGFyYW1zID0ge1xuICAgICAgICBiYXNlQ29sb3I6IGdsdGZNYXRlcmlhbC5iYXNlQ29sb3IgPyBuZXcgVmVjNCgpLmZyb21BcnJheShnbHRmTWF0ZXJpYWwuYmFzZUNvbG9yKSA6IG5ldyBWZWM0KDEsIDEsIDEpLFxuICAgICAgICBiYXNlQ29sb3JGYWN0b3I6IGdsdGZNYXRlcmlhbC5iYXNlQ29sb3JGYWN0b3IgPyBuZXcgVmVjNCgpLmZyb21BcnJheShnbHRmTWF0ZXJpYWwuYmFzZUNvbG9yRmFjdG9yKSA6IG5ldyBWZWM0KDEsIDEsIDEpLFxuICAgICAgICByb3VnaG5lc3M6IGdsdGZNYXRlcmlhbC5yb3VnaG5lc3NGYWN0b3IgIT09IHVuZGVmaW5lZCA/IGdsdGZNYXRlcmlhbC5yb3VnaG5lc3NGYWN0b3IgOiAwLjUsXG4gICAgICAgIG1ldGFsbmVzczogZ2x0Zk1hdGVyaWFsLm1ldGFsbGljRmFjdG9yICE9PSB1bmRlZmluZWQgPyBnbHRmTWF0ZXJpYWwubWV0YWxsaWNGYWN0b3IgOiAwLjUsXG4gICAgICAgIGFscGhhOiAxLFxuICAgICAgICBhbHBoYUN1dG9mZjogZ2x0Zk1hdGVyaWFsLmFscGhhQ3V0b2ZmLFxuICAgICAgICBzaWRlOiBnbHRmTWF0ZXJpYWwuZG91YmxlU2lkZWQgIT09IHVuZGVmaW5lZCA/IGdsdGZNYXRlcmlhbC5kb3VibGVTaWRlZCA6IGZhbHNlLFxuICAgICAgICB0cmFuc3BhcmVudDogZ2x0Zk1hdGVyaWFsLmFscGhhTW9kZSAhPT0gdW5kZWZpbmVkID8gZ2x0Zk1hdGVyaWFsLmFscGhhTW9kZSA9PT0gJ0JMRU5EJyA6IGZhbHNlXG4gICAgfVxuICAgIHJldHVybiBwYnJwYXJhbXM7XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZVVuaWZvcm1zXyhtYXRlcmlhbD86IFBCUk1hdGVyaWFsKSB7XG4gICAgaWYobWF0ZXJpYWwgJiYgbWF0ZXJpYWwgaW5zdGFuY2VvZiBQQlJNYXRlcmlhbCkge1xuICAgICAgICBsZXQgcHJvZ3JhbSA9IG1hdGVyaWFsLnByb2dyYW07XG4gICAgICAgIHByb2dyYW0udW5pZm9ybXNbJ3VCYXNlQ29sb3JGYWN0b3InXS52YWx1ZS5jb3B5KG1hdGVyaWFsLmNvbG9yKTtcbiAgICAgICAgcHJvZ3JhbS51bmlmb3Jtc1sndVJvdWdobmVzcyddLnZhbHVlID0gbWF0ZXJpYWwucm91Z2huZXNzO1xuICAgICAgICBwcm9ncmFtLnVuaWZvcm1zWyd1TWV0YWxsaWMnXS52YWx1ZSA9IG1hdGVyaWFsLm1ldGFsbmVzcztcbiAgICAgICAgcHJvZ3JhbS51bmlmb3Jtc1sndUVudk1hcEludGVuc2l0eSddLnZhbHVlID0gbWF0ZXJpYWwuZW52TWFwSW50ZW5zaXR5O1xuICAgICAgICBwcm9ncmFtLnVuaWZvcm1zWyd0RW52RGlmZnVzZSddLnZhbHVlID0gbWF0ZXJpYWwuZW52TWFwRGlmZnVzZTtcbiAgICAgICAgcHJvZ3JhbS51bmlmb3Jtc1sndEVudlNwZWN1bGFyJ10udmFsdWUgPSBtYXRlcmlhbC5lbnZNYXBTcGVjdWxhcjtcbiAgICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhc3NpZ25QQlJNYXRlcmlhbHMoZ2w6IE9HTFJlbmRlcmluZ0NvbnRleHQsIHJvb3Q6IFRyYW5zZm9ybSwgbWF0ZXJpYWxDdG9yPzogKGdsOiBPR0xSZW5kZXJpbmdDb250ZXh0LCBwOiBQQlJNYXRlcmlhbFBhcmFtcywgZGVmaW5lczogc3RyaW5nKT0+UEJSTWF0ZXJpYWwsIGhkciA9IHRydWUpIHtcbiAgICByb290LnRyYXZlcnNlKChub2RlKSA9PiB7XG4gICAgICAgIGlmIChub2RlIGluc3RhbmNlb2YgTWVzaCAmJiBub2RlLnByb2dyYW0gJiYgIShub2RlIGFzIGFueSk/Lm1hdGVyaWFsPy5pc0RpYW1vbmRNYXRlcmlhbCAmJiBub2RlLnByb2dyYW0uZ2x0Zk1hdGVyaWFsKSB7IC8vdG9kbzogaXNEaWFtb25kTWF0ZXJpYWwgb24gbm9kZT8/XG4gICAgICAgICAgICBsZXQgZGVmaW5lcyA9IGAke25vZGUuZ2VvbWV0cnkuYXR0cmlidXRlcy51diA/IGAjZGVmaW5lIFVWXFxuYCA6IGBgfWA7XG4gICAgICAgICAgICBsZXQgbWF0ZXJpYWwgPSBtYXRlcmlhbEN0b3IgP1xuICAgICAgICAgICAgICAgIG1hdGVyaWFsQ3RvcihnbCwgZ2V0UEJSUGFyYW1zKG5vZGUucHJvZ3JhbS5nbHRmTWF0ZXJpYWwpLCBkZWZpbmVzKSA6XG4gICAgICAgICAgICAgICAgbmV3IFBCUk1hdGVyaWFsKGdsLCBnZXRQQlJQYXJhbXMobm9kZS5wcm9ncmFtLmdsdGZNYXRlcmlhbCksIGRlZmluZXMsIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCBoZHIpO1xuICAgICAgICAgICAgbm9kZS5tYXRlcmlhbCA9IG1hdGVyaWFsO1xuICAgICAgICAgICAgbm9kZS5wcm9ncmFtID0gbWF0ZXJpYWwucHJvZ3JhbTtcblxuICAgICAgICAgICAgbm9kZS5vbkJlZm9yZVJlbmRlciggKHZhbHVlOiBhbnkpID0+IHtcbiAgICAgICAgICAgICAgICB1cGRhdGVVbmlmb3Jtc18obm9kZS5tYXRlcmlhbCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICAvLyBpZigobm9kZSBhcyBhbnkpPy5tYXRlcmlhbD8uaXNEaWFtb25kTWF0ZXJpYWwpe1xuICAgICAgICAvLyAgICAgKG5vZGUgYXMgTWVzaCkucHJvZ3JhbS50cmFuc3BhcmVudCA9IHRydWU7XG4gICAgICAgIC8vIH1cbiAgICB9KTtcbn1cbiIsImltcG9ydCB7UHJvZ3JhbX0gZnJvbSAnLi4vb2dsJ1xuXG5leHBvcnQgY2xhc3MgUHJvZ3JhbUNhY2hlIHtcblxuICAgIHByaXZhdGUgcHJvZ3JhbU1hcF86IE1hcDxzdHJpbmcsIFByb2dyYW0+ID0gbmV3IE1hcDxzdHJpbmcsIFByb2dyYW0+KCk7XG4gICAgcHJpdmF0ZSBzdGF0aWMgaW5zdGFuY2VfOiBQcm9ncmFtQ2FjaGU7XG5cbiAgICBwcml2YXRlIGNvbnN0cnVjdG9yKCkge1xuICAgIH1cblxuICAgIHN0YXRpYyBnZXRJbnN0YW5jZSgpIHtcbiAgICAgICAgaWYoIXRoaXMuaW5zdGFuY2VfKSB7XG4gICAgICAgICAgICB0aGlzLmluc3RhbmNlXyA9IG5ldyBQcm9ncmFtQ2FjaGUoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5pbnN0YW5jZV87XG4gICAgfVxuXG4gICAgY3JlYXRlUHJvZ3JhbShnbDogYW55LCB2ZXJ0ZXg6IHN0cmluZywgZnJhZ21lbnQ6IHN0cmluZywgdW5pZm9ybXM6IGFueSkge1xuICAgICAgICBsZXQga2V5ID0gdmVydGV4ICsgZnJhZ21lbnQgKyBnbC5jYW52YXMuaWQ7XG4gICAgICAgIGxldCBjYWNoZWRQcm9ncmFtID0gdGhpcy5wcm9ncmFtTWFwXy5nZXQoa2V5KTtcbiAgICAgICAgaWYoY2FjaGVkUHJvZ3JhbSkge1xuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZFByb2dyYW07XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcHJvZ3JhbSA9IG5ldyBQcm9ncmFtKGdsLCB7XG4gICAgICAgICAgICB2ZXJ0ZXgsXG4gICAgICAgICAgICBmcmFnbWVudCxcbiAgICAgICAgICAgIHVuaWZvcm1zOiB1bmlmb3JtcyxcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMucHJvZ3JhbU1hcF8uc2V0KGtleSwgcHJvZ3JhbSk7XG4gICAgICAgIHJldHVybiBwcm9ncmFtO1xuICAgIH1cbn1cbiIsIi8qKlxuICogVW5pZm9ybSBVdGlsaXRpZXMsXG4gKi9cbmltcG9ydCB7VFVuaWZvcm1zfSBmcm9tIFwiLi4vbWF0ZXJpYWxzL3Bicm1hdGVyaWFsXCI7XG5cbmV4cG9ydCBmdW5jdGlvbiBjbG9uZVVuaWZvcm1zKCBzcmM6IFRVbmlmb3JtcyApIHtcbiAgICBjb25zdCBkc3Q6IGFueSA9IHt9O1xuICAgIGZvciAobGV0IHUgaW4gc3JjICkge1xuICAgICAgICBkc3RbIHUgXSA9IHt9O1xuICAgICAgICBmb3IgKGxldCBwIGluIHNyY1sgdSBdICkge1xuICAgICAgICAgICAgY29uc3QgcHJvcGVydHkgPSAoc3JjIGFzIGFueSlbdV1bcF07XG4gICAgICAgICAgICBpZiAoIHByb3BlcnR5ICYmICh0eXBlb2YgcHJvcGVydHkuY2xvbmUgPT09ICdmdW5jdGlvbicgKSApIHtcbiAgICAgICAgICAgICAgICBkc3RbIHUgXVsgcCBdID0gcHJvcGVydHkuY2xvbmUoKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIEFycmF5LmlzQXJyYXkoIHByb3BlcnR5ICkgKSB7XG4gICAgICAgICAgICAgICAgZHN0WyB1IF1bIHAgXSA9IHByb3BlcnR5LnNsaWNlKCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGRzdFsgdSBdWyBwIF0gPSBwcm9wZXJ0eTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZHN0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbWVyZ2VVbmlmb3JtcyggdW5pZm9ybXM6IFRVbmlmb3JtcyApIHtcbiAgICBjb25zdCBtZXJnZWQ6IGFueSA9IHt9O1xuICAgIGZvciAobGV0IHUgPSAwOyB1IDwgdW5pZm9ybXMubGVuZ3RoOyB1ICsrICkge1xuICAgICAgICBjb25zdCB0bXAgPSBjbG9uZVVuaWZvcm1zKHVuaWZvcm1zW3VdKTtcbiAgICAgICAgZm9yIChsZXQgcCBpbiB0bXAgKSB7XG4gICAgICAgICAgICBtZXJnZWRbIHAgXSA9IHRtcFsgcCBdO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBtZXJnZWQ7XG59IiwiaW1wb3J0IHtNZXNoLCBSZW5kZXJlciwgVHJhbnNmb3JtLCBWZWMzfSBmcm9tIFwiLi4vb2dsXCI7XG5pbXBvcnQgZW5jb2RpbmdDaHVuayBmcm9tIFwiLi4vc2hhZGVycy9lbmNvZGluZ19wYXIuZ2xzbFwiXG5pbXBvcnQgdG9uZU1hcHBpbmdDaHVuayBmcm9tIFwiLi4vc2hhZGVycy90b25lbWFwcGluZ19wYXIuZ2xzbFwiXG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRTbmFwc2hvdERhdGEocmVuZGVyZXI6IFJlbmRlcmVyLCBtaW1lVHlwZT86IHN0cmluZyk6IHN0cmluZyB7XG4gICAgbWltZVR5cGUgPSBtaW1lVHlwZSA/PyBcImltYWdlL3BuZ1wiO1xuICAgIHJldHVybiByZW5kZXJlci5nbC5jYW52YXMudG9EYXRhVVJMKG1pbWVUeXBlKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFNuYXBzaG90KHJlbmRlcmVyOiBSZW5kZXJlciwgb3B0aW9uczogeyBtaW1lVHlwZT86IHN0cmluZywgY29udGV4dD86IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCwgY2FudmFzPzogSFRNTENhbnZhc0VsZW1lbnQgfSk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgbGV0IGltZ1VybCA9IGdldFNuYXBzaG90RGF0YShyZW5kZXJlciwgb3B0aW9ucy5taW1lVHlwZSk7XG4gICAgbGV0IGNvbnRleHQgPSBvcHRpb25zLmNvbnRleHQgPz8gb3B0aW9ucy5jYW52YXM/LmdldENvbnRleHQoXCIyZFwiKTtcbiAgICBpZiAoIWNvbnRleHQpXG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoaW1nVXJsKTtcbiAgICByZXR1cm4gbmV3IFByb21pc2U8c3RyaW5nPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgIGxldCBpbWcgPSBuZXcgSW1hZ2UoKTtcbiAgICAgICAgaW1nLm9ubG9hZCA9ICgpID0+IHtcbiAgICAgICAgICAgIGNvbnRleHQ/LmRyYXdJbWFnZShpbWcsIDAsIDAsIGNvbnRleHQhLmNhbnZhcy53aWR0aCwgY29udGV4dCEuY2FudmFzLmhlaWdodCk7XG4gICAgICAgICAgICByZXNvbHZlKGltZ1VybCk7XG4gICAgICAgIH07XG4gICAgICAgIGltZy5zcmMgPSBpbWdVcmw7XG4gICAgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRQb2ludGVyUG9zaXRpb24ocG9zaXRpb246IHt4OiBudW1iZXIsIHk6IG51bWJlcn0sIGNhbnZhczogSFRNTENhbnZhc0VsZW1lbnQpIHtcbiAgICBjb25zdCBjYW52YXNCb3VuZHMgPSBjYW52YXMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgbGV0IHggPSAoKHBvc2l0aW9uLnggLSBjYW52YXNCb3VuZHMubGVmdCkgLyAoY2FudmFzQm91bmRzLnJpZ2h0IC0gY2FudmFzQm91bmRzLmxlZnQpKSAqIDIgLSAxO1xuICAgIGxldCB5ID0gLSgocG9zaXRpb24ueSAtIGNhbnZhc0JvdW5kcy50b3ApIC8gKGNhbnZhc0JvdW5kcy5ib3R0b20gLSBjYW52YXNCb3VuZHMudG9wKSkgKiAyICsgMTtcbiAgICByZXR1cm57IHg6IHgsIHk6IHl9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0QWxsTWVzaGVzKHJvb3Q6IFRyYW5zZm9ybSkge1xuICAgIGxldCBtZXNoZXMgOiBhbnkgPSBbXTtcbiAgICByb290LnRyYXZlcnNlKChncm91cCkgPT4ge1xuICAgICAgICBpZigoZ3JvdXAgYXMgTWVzaCk/Lmdlb21ldHJ5KSB7XG4gICAgICAgICAgICBpZiAoIWdyb3VwLnBhcmVudCkgcmV0dXJuOyAvLyBTa2lwIHVuYXR0YWNoZWRcbiAgICAgICAgICAgIG1lc2hlcy5wdXNoKGdyb3VwKTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBtZXNoZXM7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjb21wdXRlQm91bmRpbmdCb3gocm9vdDogVHJhbnNmb3JtKSB7XG4gICAgY29uc3QgbWluID0gbmV3IFZlYzMoK0luZmluaXR5KTtcbiAgICBjb25zdCBtYXggPSBuZXcgVmVjMygtSW5maW5pdHkpO1xuICAgIFxuICAgIGNvbnN0IGJvdW5kc01pbiA9IG5ldyBWZWMzKCk7XG4gICAgY29uc3QgYm91bmRzTWF4ID0gbmV3IFZlYzMoKTtcbiAgICBjb25zdCBib3VuZHNDZW50ZXIgPSBuZXcgVmVjMygpO1xuICAgIGNvbnN0IGJvdW5kc1NjYWxlID0gbmV3IFZlYzMoKTtcbiAgICBcbiAgICByb290LnRyYXZlcnNlKChncm91cCkgPT4ge1xuICAgICAgICBsZXQgZ2VvbWV0cnkgPSAoZ3JvdXAgYXMgTWVzaCk/Lmdlb21ldHJ5O1xuICAgICAgICBpZihnZW9tZXRyeSkge1xuICAgICAgICAgICAgaWYgKCFncm91cC5wYXJlbnQpIHJldHVybjsgLy8gU2tpcCB1bmF0dGFjaGVkXG5cbiAgICAgICAgICAgIGlmICghZ2VvbWV0cnkuYm91bmRzKSBnZW9tZXRyeS5jb21wdXRlQm91bmRpbmdTcGhlcmUoKTtcblxuICAgICAgICAgICAgYm91bmRzQ2VudGVyLmNvcHkoZ2VvbWV0cnkuYm91bmRzLmNlbnRlcikuYXBwbHlNYXRyaXg0KGdyb3VwLndvcmxkTWF0cml4KTtcblxuICAgICAgICAgICAgLy8gR2V0IG1heCB3b3JsZCBzY2FsZSBheGlzXG4gICAgICAgICAgICBncm91cC53b3JsZE1hdHJpeC5nZXRTY2FsaW5nKGJvdW5kc1NjYWxlKTtcbiAgICAgICAgICAgIGNvbnN0IHJhZGl1c1NjYWxlID0gTWF0aC5tYXgoTWF0aC5tYXgoYm91bmRzU2NhbGVbMF0sIGJvdW5kc1NjYWxlWzFdKSwgYm91bmRzU2NhbGVbMl0pO1xuICAgICAgICAgICAgY29uc3QgcmFkaXVzID0gZ2VvbWV0cnkuYm91bmRzLnJhZGl1cyAqIHJhZGl1c1NjYWxlO1xuXG4gICAgICAgICAgICBib3VuZHNNaW4uc2V0KC1yYWRpdXMpLmFkZChib3VuZHNDZW50ZXIpO1xuICAgICAgICAgICAgYm91bmRzTWF4LnNldCgrcmFkaXVzKS5hZGQoYm91bmRzQ2VudGVyKTtcblxuICAgICAgICAgICAgLy8gQXBwbHkgd29ybGQgbWF0cml4IHRvIGJvdW5kc1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCAzOyBpKyspIHtcbiAgICAgICAgICAgICAgICBtaW5baV0gPSBNYXRoLm1pbihtaW5baV0sIGJvdW5kc01pbltpXSk7XG4gICAgICAgICAgICAgICAgbWF4W2ldID0gTWF0aC5tYXgobWF4W2ldLCBib3VuZHNNYXhbaV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4ge21pbjogbWluLCBtYXg6IG1heH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0cmF2ZXJzZShyb290OiBUcmFuc2Zvcm0sIGNhbGxCYWNrOiBhbnksIGZpbHRlcj86IGFueSkge1xuICAgIHJvb3QudHJhdmVyc2UoKGdyb3VwOiBUcmFuc2Zvcm0pID0+IHtcbiAgICAgICAgaWYoZmlsdGVyKSB7XG4gICAgICAgICAgICBpZihmaWx0ZXIoZ3JvdXApKSB7XG4gICAgICAgICAgICAgICAgY2FsbEJhY2soZ3JvdXApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2FsbEJhY2soZ3JvdXApO1xuICAgICAgICB9XG4gICAgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0cmF2ZXJzZU1lc2hlcyhyb290OiBUcmFuc2Zvcm0sIGNhbGxCYWNrOiBhbnkpIHtcbiAgICB0cmF2ZXJzZShyb290LCBjYWxsQmFjaywgKGdyb3VwOiBUcmFuc2Zvcm0pPT4ge3JldHVybiAoZ3JvdXAgYXMgTWVzaCkuZ2VvbWV0cnkgIT0gbnVsbH0pO1xufVxuXG5leHBvcnQgY29uc3QgRW5jb2RpbmdIZWxwZXIgPSB7XG4gICAgTGluZWFyOiAwLFxuICAgIHNSR0I6IDEsXG4gICAgUkdCRTogMixcbiAgICBSR0JNNzogMyxcbiAgICBSR0JNMTY6IDQsXG4gICAgUkdCRDogNSxcbiAgICBHYW1tYTogNixcbiAgICBzaGFkZXJDaHVuazogZW5jb2RpbmdDaHVua1xufTtcbmV4cG9ydCBjb25zdCBUb25lTWFwcGluZ0hlbHBlciA9IHtcbiAgICBMaW5lYXI6IDAsXG4gICAgUmVpbmhhcmQ6IDEsXG4gICAgQ2luZW9uOiAyLFxuICAgIEFDRVNGaWxtaWM6IDMsXG4gICAgdW5pZm9ybXM6IHtcbiAgICAgICAgdG9uZU1hcHBpbmdFeHBvc3VyZToge3ZhbHVlOiAxLn1cbiAgICB9LFxuICAgIHNoYWRlckNodW5rOiB0b25lTWFwcGluZ0NodW5rXG59XG4iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsIi8vIHN0YXJ0dXBcbi8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuLy8gVGhpcyBlbnRyeSBtb2R1bGUgaXMgcmVmZXJlbmNlZCBieSBvdGhlciBtb2R1bGVzIHNvIGl0IGNhbid0IGJlIGlubGluZWRcbnZhciBfX3dlYnBhY2tfZXhwb3J0c19fID0gX193ZWJwYWNrX3JlcXVpcmVfXyhcIi4vc3JjL2luZGV4LnRzXCIpO1xuIl0sInNvdXJjZVJvb3QiOiIifQ==