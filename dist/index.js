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
#define inputEncoding ${util_1.EncodingHelper.Linear}
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9vZ2wvd2VicGFjay91bml2ZXJzYWxNb2R1bGVEZWZpbml0aW9uIiwid2VicGFjazovL29nbC8uL3NyYy9tYXRlcmlhbHMvc2hhZGVycy9wYnIuZnJhZyIsIndlYnBhY2s6Ly9vZ2wvLi9zcmMvbWF0ZXJpYWxzL3NoYWRlcnMvcGJyLnZlcnQiLCJ3ZWJwYWNrOi8vb2dsLy4vc3JjL3NoYWRlcnMvZW5jb2RpbmdfcGFyLmdsc2wiLCJ3ZWJwYWNrOi8vb2dsLy4vc3JjL3NoYWRlcnMvdG9uZW1hcHBpbmdfcGFyLmdsc2wiLCJ3ZWJwYWNrOi8vb2dsLy4vc3JjL2NvcmUvQ2FtZXJhLmpzIiwid2VicGFjazovL29nbC8uL3NyYy9jb3JlL0dlb21ldHJ5LmpzIiwid2VicGFjazovL29nbC8uL3NyYy9jb3JlL01lc2guanMiLCJ3ZWJwYWNrOi8vb2dsLy4vc3JjL2NvcmUvUHJvZ3JhbS5qcyIsIndlYnBhY2s6Ly9vZ2wvLi9zcmMvY29yZS9SZW5kZXJUYXJnZXQuanMiLCJ3ZWJwYWNrOi8vb2dsLy4vc3JjL2NvcmUvUmVuZGVyZXIuanMiLCJ3ZWJwYWNrOi8vb2dsLy4vc3JjL2NvcmUvVGV4dHVyZS5qcyIsIndlYnBhY2s6Ly9vZ2wvLi9zcmMvY29yZS9UcmFuc2Zvcm0uanMiLCJ3ZWJwYWNrOi8vb2dsLy4vc3JjL2V4dHJhcy9BbmltYXRpb24uanMiLCJ3ZWJwYWNrOi8vb2dsLy4vc3JjL2V4dHJhcy9Cb3guanMiLCJ3ZWJwYWNrOi8vb2dsLy4vc3JjL2V4dHJhcy9DdXJ2ZS5qcyIsIndlYnBhY2s6Ly9vZ2wvLi9zcmMvZXh0cmFzL0N5bGluZGVyLmpzIiwid2VicGFjazovL29nbC8uL3NyYy9leHRyYXMvRmxvd21hcC5qcyIsIndlYnBhY2s6Ly9vZ2wvLi9zcmMvZXh0cmFzL0dMVEZBbmltYXRpb24uanMiLCJ3ZWJwYWNrOi8vb2dsLy4vc3JjL2V4dHJhcy9HTFRGTG9hZGVyLmpzIiwid2VicGFjazovL29nbC8uL3NyYy9leHRyYXMvR0xURlNraW4uanMiLCJ3ZWJwYWNrOi8vb2dsLy4vc3JjL2V4dHJhcy9HUEdQVS5qcyIsIndlYnBhY2s6Ly9vZ2wvLi9zcmMvZXh0cmFzL0tUWFRleHR1cmUuanMiLCJ3ZWJwYWNrOi8vb2dsLy4vc3JjL2V4dHJhcy9Ob3JtYWxQcm9ncmFtLmpzIiwid2VicGFjazovL29nbC8uL3NyYy9leHRyYXMvT3JiaXQuanMiLCJ3ZWJwYWNrOi8vb2dsLy4vc3JjL2V4dHJhcy9QbGFuZS5qcyIsIndlYnBhY2s6Ly9vZ2wvLi9zcmMvZXh0cmFzL1BvbHlsaW5lLmpzIiwid2VicGFjazovL29nbC8uL3NyYy9leHRyYXMvUG9zdC5qcyIsIndlYnBhY2s6Ly9vZ2wvLi9zcmMvZXh0cmFzL1JheWNhc3QuanMiLCJ3ZWJwYWNrOi8vb2dsLy4vc3JjL2V4dHJhcy9TaGFkb3cuanMiLCJ3ZWJwYWNrOi8vb2dsLy4vc3JjL2V4dHJhcy9Ta2luLmpzIiwid2VicGFjazovL29nbC8uL3NyYy9leHRyYXMvU3BoZXJlLmpzIiwid2VicGFjazovL29nbC8uL3NyYy9leHRyYXMvVGV4dC5qcyIsIndlYnBhY2s6Ly9vZ2wvLi9zcmMvZXh0cmFzL1RleHR1cmVMb2FkZXIuanMiLCJ3ZWJwYWNrOi8vb2dsLy4vc3JjL2V4dHJhcy9Ub3J1cy5qcyIsIndlYnBhY2s6Ly9vZ2wvLi9zcmMvZXh0cmFzL1RyaWFuZ2xlLmpzIiwid2VicGFjazovL29nbC8uL3NyYy9tYXRoL0NvbG9yLmpzIiwid2VicGFjazovL29nbC8uL3NyYy9tYXRoL0V1bGVyLmpzIiwid2VicGFjazovL29nbC8uL3NyYy9tYXRoL01hdDMuanMiLCJ3ZWJwYWNrOi8vb2dsLy4vc3JjL21hdGgvTWF0NC5qcyIsIndlYnBhY2s6Ly9vZ2wvLi9zcmMvbWF0aC9RdWF0LmpzIiwid2VicGFjazovL29nbC8uL3NyYy9tYXRoL1ZlYzIuanMiLCJ3ZWJwYWNrOi8vb2dsLy4vc3JjL21hdGgvVmVjMy5qcyIsIndlYnBhY2s6Ly9vZ2wvLi9zcmMvbWF0aC9WZWM0LmpzIiwid2VicGFjazovL29nbC8uL3NyYy9tYXRoL2Z1bmN0aW9ucy9Db2xvckZ1bmMuanMiLCJ3ZWJwYWNrOi8vb2dsLy4vc3JjL21hdGgvZnVuY3Rpb25zL0V1bGVyRnVuYy5qcyIsIndlYnBhY2s6Ly9vZ2wvLi9zcmMvbWF0aC9mdW5jdGlvbnMvTWF0M0Z1bmMuanMiLCJ3ZWJwYWNrOi8vb2dsLy4vc3JjL21hdGgvZnVuY3Rpb25zL01hdDRGdW5jLmpzIiwid2VicGFjazovL29nbC8uL3NyYy9tYXRoL2Z1bmN0aW9ucy9RdWF0RnVuYy5qcyIsIndlYnBhY2s6Ly9vZ2wvLi9zcmMvbWF0aC9mdW5jdGlvbnMvVmVjMkZ1bmMuanMiLCJ3ZWJwYWNrOi8vb2dsLy4vc3JjL21hdGgvZnVuY3Rpb25zL1ZlYzNGdW5jLmpzIiwid2VicGFjazovL29nbC8uL3NyYy9tYXRoL2Z1bmN0aW9ucy9WZWM0RnVuYy5qcyIsIndlYnBhY2s6Ly9vZ2wvLi9zcmMvb2dsLmpzIiwid2VicGFjazovL29nbC8uL3NyYy9leHRyYXMvQ3VzdG9tUG9zdC50cyIsIndlYnBhY2s6Ly9vZ2wvLi9zcmMvZXh0cmFzL1JlbmRlclV0aWxzLnRzIiwid2VicGFjazovL29nbC8uL3NyYy9oZHIvSERSQ29tcG9zZXIudHMiLCJ3ZWJwYWNrOi8vb2dsLy4vc3JjL2luZGV4LnRzIiwid2VicGFjazovL29nbC8uL3NyYy9tYXRlcmlhbHMvcGJybWF0ZXJpYWwudHMiLCJ3ZWJwYWNrOi8vb2dsLy4vc3JjL3V0aWxzL2V2ZW50ZGlzcGF0Y2hlci50cyIsIndlYnBhY2s6Ly9vZ2wvLi9zcmMvdXRpbHMvcGJyaGVscGVyLnRzIiwid2VicGFjazovL29nbC8uL3NyYy91dGlscy9wcm9ncmFtY2FjaGUudHMiLCJ3ZWJwYWNrOi8vb2dsLy4vc3JjL3V0aWxzL3VuaWZvcm1VdGlscy50cyIsIndlYnBhY2s6Ly9vZ2wvLi9zcmMvdXRpbHMvdXRpbC50cyIsIndlYnBhY2s6Ly9vZ2wvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vb2dsL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly9vZ2wvd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly9vZ2wvd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly9vZ2wvd2VicGFjay9zdGFydHVwIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUM7QUFDRCxPOzs7Ozs7Ozs7Ozs7OztBQ1ZBLGlFQUFlLHlCQUF5Qiw0QkFBNEIsOEJBQThCLGdDQUFnQywrQkFBK0Isd0JBQXdCLDJCQUEyQiwwQkFBMEIsNEJBQTRCLDZCQUE2Qiw4QkFBOEIseUJBQXlCLCtCQUErQix5QkFBeUIsZ0NBQWdDLGlDQUFpQyw0QkFBNEIsNkJBQTZCLGlDQUFpQyx1QkFBdUIsNkJBQTZCLDRCQUE0QixtQkFBbUIsdUJBQXVCLHFCQUFxQixzQkFBc0IsbUNBQW1DLDRDQUE0QywwQ0FBMEMsOEJBQThCLDZCQUE2QixnQ0FBZ0MsMkNBQTJDLGlDQUFpQyxHQUFHLG9DQUFvQyx5QkFBeUIscURBQXFELEdBQUcsaUNBQWlDLHVDQUF1QyxHQUFHLG9CQUFvQiwyREFBMkQsb0NBQW9DLDhCQUE4Qiw4QkFBOEIsMkZBQTJGLGlFQUFpRSxnREFBZ0QsdURBQXVELDJCQUEyQix1Q0FBdUMsa0lBQWtJLCtCQUErQix5Q0FBeUMsYUFBYSxtQ0FBbUMsWUFBWSxpREFBaUQsMkNBQTJDLGNBQWMsR0FBRyxrS0FBa0ssd0VBQXdFLHNGQUFzRiwyREFBMkQseUdBQXlHLGdDQUFnQywrQ0FBK0Msb0JBQW9CLDRIQUE0SCxvQkFBb0Isc0JBQXNCLHNCQUFzQiw0QkFBNEIsc0NBQXNDLDRCQUE0QixzQ0FBc0Msb0VBQW9FLG9FQUFvRSwwREFBMEQsMENBQTBDLG1IQUFtSCxnRkFBZ0YsNkJBQTZCLEdBQUcsaUJBQWlCLHNDQUFzQyxnRkFBZ0YsNkRBQTZELDZEQUE2RCww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QUs7QUFDViw0QkFBNEI7QUFDNUI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHNCQUFzQjtBQUN0QjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLGdDQUFnQztBQUNoQyxvQ0FBb0M7QUFDcEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLCtCQUErQjtBQUMvQjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxxQkFBcUIsOENBQThDLEtBQUs7QUFDeEU7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FB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QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQSw0QkFBNEIsK0NBQUk7QUFDaEMseUJBQXlCLCtDQUFJO0FBQzdCLDJCQUEyQiwrQ0FBSTs7QUFFL0I7QUFDQSx5QkFBeUI7O0FBRXpCO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSx5REFBeUQsaUJBQWlCO0FBQzFFLDhEQUE4RCxpQkFBaUI7QUFDL0U7QUFDQSw0REFBNEQsaUJBQWlCO0FBQzdFOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7QUNoVytDOztBQUV4QyxvQkFBb0IsdURBQVE7QUFDbkMscUJBQXFCLDhFQUE4RSxFQUFFLEtBQUs7QUFDMUc7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBLHVCQUF1QiwwQkFBMEI7QUFDakQscUJBQXFCLHdCQUF3QjtBQUM3QyxpQkFBaUIsb0JBQW9CO0FBQ3JDLG9CQUFvQixjQUFjO0FBQ2xDLFNBQVM7O0FBRVQ7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSx3QkFBd0IsYUFBYTtBQUNyQztBQUNBLDRCQUE0QixhQUFhO0FBQ3pDOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ2xFK0M7QUFDRjtBQUNOO0FBQ0E7QUFDQTtBQUNFOztBQUV6QyxnQkFBZ0IsK0NBQUk7O0FBRWI7QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx5QkFBeUI7QUFDekIsMkJBQTJCO0FBQzNCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSx1QkFBdUIsZ0JBQWdCO0FBQ3ZDO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLDhDQUE4Qyx1REFBUTtBQUN0RDtBQUNBO0FBQ0EsMkJBQTJCLCtCQUErQjtBQUMxRCx1QkFBdUIsMkJBQTJCO0FBQ2xELHVCQUF1QiwyQkFBMkI7QUFDbEQsdUJBQXVCLHNCQUFzQjtBQUM3QyxxQkFBcUIsb0JBQW9CO0FBQ3pDLHdCQUF3Qix1QkFBdUI7QUFDL0MsYUFBYTtBQUNiOztBQUVBO0FBQ0E7O0FBRUEsNkVBQTZFLFlBQVksK0NBQUk7QUFDN0Ysd0RBQXdEO0FBQ3hELDBFQUEwRTtBQUMxRSw4REFBOEQsWUFBWSxpREFBSztBQUMvRSw4REFBOEQ7O0FBRTlEO0FBQ0E7O0FBRUEsNENBQTRDLHFEQUFPO0FBQ25EO0FBQ0E7QUFDQTtBQUNBLFNBQVM7O0FBRVQsd0JBQXdCLCtDQUFJLE1BQU0sb0JBQW9CO0FBQ3REOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQSxTQUFTOztBQUVUO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSw2RDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUN0TEE7O0FBRTZDO0FBQ047QUFDZ0I7QUFDZDs7QUFFekM7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMkJBQTJCLGtEQUFRO0FBQ25DO0FBQ0EsU0FBUyxLQUFLO0FBQ2Q7QUFDQTtBQUNBOztBQUVBLHdCQUF3Qjs7QUFFeEI7O0FBRUE7O0FBRUEsd0JBQXdCO0FBQ3hCOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiOztBQUVBLHFCQUFxQixxQkFBcUI7QUFDMUM7O0FBRUEsYUFBYSxrRUFBa0UsMkNBQTJDLEtBQUs7QUFDL0gsb0NBQW9DOztBQUVwQyw0QkFBNEIscURBQU8sV0FBVyw2QkFBNkI7QUFDM0UseUJBQXlCLCtDQUFJLFdBQVcsbUNBQW1DOztBQUUzRTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUEsWUFBWSxxQkFBcUIsS0FBSzs7QUFFdEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDRCQUE0QiwrREFBWTtBQUN4Qyw2QkFBNkIsK0RBQVk7QUFDekM7O0FBRUE7QUFDQSxZQUFZLCtFQUErRTtBQUMzRjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQSxTQUFTOztBQUVUO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ2hKQTtBQUNBOztBQUV1QztBQUNBO0FBQ0E7O0FBRXZDLHNCQUFzQiwrQ0FBSTtBQUMxQixzQkFBc0IsK0NBQUk7QUFDMUIsc0JBQXNCLCtDQUFJOztBQUUxQixzQkFBc0IsK0NBQUk7QUFDMUIsc0JBQXNCLCtDQUFJO0FBQzFCLHNCQUFzQiwrQ0FBSTtBQUMxQixzQkFBc0IsK0NBQUk7QUFDMUIsc0JBQXNCLCtDQUFJO0FBQzFCLHNCQUFzQiwrQ0FBSTtBQUMxQixzQkFBc0IsK0NBQUk7QUFDMUIsc0JBQXNCLCtDQUFJO0FBQzFCLHNCQUFzQiwrQ0FBSTtBQUMxQixzQkFBc0IsK0NBQUk7QUFDMUIsc0JBQXNCLCtDQUFJOztBQUUxQixxQkFBcUIsK0NBQUk7O0FBRWxCO0FBQ1A7QUFDQSwwQkFBMEIsK0NBQUk7QUFDOUIsNkJBQTZCLCtDQUFJO0FBQ2pDOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxtQkFBbUIsaUNBQWlDO0FBQ3BEO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsNkJBQTZCLDJCQUEyQixLQUFLO0FBQzdEOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0EsdUNBQXVDLGlCQUFpQiwrQ0FBSSxlQUFlLCtDQUFJOztBQUUvRTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxTQUFTOztBQUVUO0FBQ0E7QUFDQTs7QUFFQSw2QkFBNkIsb0ZBQW9GLEtBQUs7QUFDdEg7QUFDQSxtREFBbUQsc0JBQXNCO0FBQ3pFOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxxQ0FBcUMsUUFBUTtBQUM3QztBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQSwrQkFBK0IsU0FBUztBQUN4QztBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLCtDQUErQywrQ0FBSTtBQUNuRCwwQ0FBMEMsK0NBQUk7QUFDOUMsa0NBQWtDLCtDQUFJO0FBQ3RDLDJDQUEyQywrQ0FBSTtBQUMvQyxzQ0FBc0MsK0NBQUk7QUFDMUM7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDeFYyQztBQUNFO0FBQ1U7O0FBRWhEO0FBQ1AscUJBQXFCLGFBQWEsbURBQU0sb0NBQW9DO0FBQzVFOztBQUVBOztBQUVBLDBCQUEwQiwrREFBWSxNQUFNLGdCQUFnQjs7QUFFNUQsZ0NBQWdDLHFEQUFPO0FBQ3ZDO0FBQ0E7QUFDQTtBQUNBLFNBQVM7O0FBRVQ7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBLHdEQUF3RDtBQUN4RCxrREFBa0Q7QUFDbEQscURBQXFEO0FBQ3JEOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxnQ0FBZ0MscURBQU87QUFDdkM7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUOztBQUVBLFlBQVksUUFBUTtBQUNwQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0EsU0FBUzs7QUFFVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUzs7QUFFVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDckh1QztBQUNVO0FBQ1Y7QUFDTTtBQUNGOztBQUUzQyxxQkFBcUIsK0NBQUk7O0FBRWxCLG1CQUFtQiwrQ0FBSTtBQUM5QixxQkFBcUIsOENBQThDLEtBQUs7QUFDeEUsbUJBQW1CLDBCQUEwQjs7QUFFN0M7QUFDQTtBQUNBOztBQUVBO0FBQ0EsMEJBQTBCLDBCQUEwQjtBQUNwRCw4QkFBOEIsOEJBQThCO0FBQzVELFNBQVM7QUFDVDs7QUFFQTtBQUNBO0FBQ0Esd0JBQXdCLHlEQUFTOztBQUVqQztBQUNBO0FBQ0E7QUFDQSx1QkFBdUIsc0JBQXNCO0FBQzdDLDZCQUE2Qix5REFBUzs7QUFFdEM7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUzs7QUFFVDtBQUNBOztBQUVBO0FBQ0E7QUFDQSxtQ0FBbUMsK0NBQUk7QUFDdkMsU0FBUztBQUNUOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwrQkFBK0IscURBQU87QUFDdEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDs7QUFFQTtBQUNBLDhCQUE4QixvREFBUyxFQUFFLDRCQUE0QjtBQUNyRTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUOztBQUVBLFVBQVUsU0FBUyxLQUFLO0FBQ3hCO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDs7QUFFQSxvQkFBb0IsU0FBUztBQUM3QjtBQUNBOzs7Ozs7Ozs7Ozs7Ozs7OztBQ3hHK0M7QUFDUjs7QUFFaEMscUJBQXFCLHVEQUFRO0FBQ3BDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMkJBQTJCO0FBQzNCLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsb0JBQW9CLCtDQUFJOztBQUV4Qix3QkFBd0IsYUFBYTtBQUNyQztBQUNBO0FBQ0EsNEJBQTRCLGFBQWE7QUFDekM7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBLHdCQUF3QixZQUFZO0FBQ3BDLDRCQUE0QixZQUFZO0FBQ3hDO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSx1QkFBdUIsMEJBQTBCO0FBQ2pELHFCQUFxQix3QkFBd0I7QUFDN0MsaUJBQWlCLG9CQUFvQjtBQUNyQyxvQkFBb0IsY0FBYztBQUNsQyxTQUFTOztBQUVUO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7Ozs7O0FDbEdPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQztBQUNEO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLHVCQUF1QixjQUFjO0FBQ3JDO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQSwrQkFBK0IsMEJBQTBCO0FBQ3pEOztBQUVBLDJCQUEyQix3QkFBd0I7QUFDbkQ7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLHVCQUF1QiwwQkFBMEI7QUFDakQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxVQUFVLFFBQVE7QUFDbEI7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsVUFBVSxPQUFPO0FBQ2pCO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7Ozs7Ozs7QUM1TzZDO0FBQ0E7O0FBRTdDOztBQUVBO0FBQ0E7O0FBRU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw4QkFBOEIsc0RBQVU7QUFDeEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDhCQUE4QixxREFBTztBQUNyQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsOEJBQThCLHFEQUFPO0FBQ3JDOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxTQUFTO0FBQ1Q7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDck5BOztBQUUrQztBQUNSOztBQUVoQyxvQkFBb0IsdURBQVE7QUFDbkMscUJBQXFCLHNHQUFzRyxFQUFFLEtBQUs7QUFDbEk7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSwyQkFBMkIsK0NBQUk7QUFDL0IsMkJBQTJCLCtDQUFJO0FBQy9CLDJCQUEyQiwrQ0FBSTs7QUFFL0I7QUFDQTtBQUNBLHVCQUF1QixxQkFBcUI7QUFDNUMsMkJBQTJCLHNCQUFzQjtBQUNqRDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSx1QkFBdUIscUJBQXFCO0FBQzVDLDJCQUEyQixzQkFBc0I7QUFDakQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLHVCQUF1QiwwQkFBMEI7QUFDakQscUJBQXFCLHlCQUF5QjtBQUM5QyxpQkFBaUIscUJBQXFCO0FBQ3RDLG9CQUFvQixnQkFBZ0I7QUFDcEMsU0FBUzs7QUFFVDtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7QUNyRStDOztBQUV4Qyx1QkFBdUIsdURBQVE7QUFDdEMscUJBQXFCLGdCQUFnQixFQUFFLEtBQUs7QUFDNUM7QUFDQSx1QkFBdUIsMERBQTBEO0FBQ2pGLGlCQUFpQixzREFBc0Q7QUFDdkUsU0FBUzs7QUFFVDtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7QUNYc0Q7O0FBRXREO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFTztBQUNQO0FBQ0E7QUFDQSx3QkFBd0IsK0RBQW9CO0FBQzVDOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSx5QkFBeUIsK0RBQW9CO0FBQzdDOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7Ozs7OztBQ3JEc0Q7QUFDckI7O0FBRWpDLG9CQUFvQiwwQ0FBSTs7QUFFakI7QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsUUFBUSx1RUFBNEI7QUFDcEM7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7Ozs7OztBQy9Fb0Q7O0FBRTdDO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLFFBQVEsdURBQVk7QUFDcEI7QUFDQTs7QUFFQTtBQUNBLFFBQVEsNkRBQWtCO0FBQzFCO0FBQ0E7O0FBRUE7QUFDQSxRQUFRLDBEQUFlO0FBQ3ZCO0FBQ0E7O0FBRUE7QUFDQSxRQUFRLHlEQUFjO0FBQ3RCO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLFlBQVksNERBQWlCO0FBQzdCLFNBQVM7QUFDVCxZQUFZLDREQUFpQjtBQUM3QjtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxRQUFRLDREQUFpQjtBQUN6QjtBQUNBOztBQUVBO0FBQ0EsUUFBUSx3REFBYTtBQUNyQjtBQUNBOztBQUVBO0FBQ0EsUUFBUSw0REFBaUI7QUFDekI7QUFDQTs7QUFFQTtBQUNBLFFBQVEsNERBQWlCO0FBQ3pCO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxRQUFRLDBEQUFlO0FBQ3ZCO0FBQ0E7O0FBRUE7QUFDQSxRQUFRLGtFQUF1QjtBQUMvQjtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7QUN4RW9EOztBQUU3QztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxRQUFRLHVEQUFZO0FBQ3BCO0FBQ0E7O0FBRUE7QUFDQSxRQUFRLDZEQUFrQjtBQUMxQjtBQUNBOztBQUVBO0FBQ0EsUUFBUSwwREFBZTtBQUN2QjtBQUNBOztBQUVBO0FBQ0EsUUFBUSx5REFBYztBQUN0QjtBQUNBOztBQUVBO0FBQ0E7QUFDQSxZQUFZLDREQUFpQjtBQUM3QixTQUFTO0FBQ1QsWUFBWSw0REFBaUI7QUFDN0I7QUFDQTtBQUNBOztBQUVBO0FBQ0EsUUFBUSw0REFBaUI7QUFDekI7QUFDQTs7QUFFQTtBQUNBLFFBQVEsd0RBQWE7QUFDckI7QUFDQTs7QUFFQSw2QkFBNkIsc0NBQXNDO0FBQ25FLFFBQVEsdUVBQTRCO0FBQ3BDO0FBQ0E7O0FBRUEscUJBQXFCLHlCQUF5QixLQUFLO0FBQ25ELFFBQVEsK0RBQW9CO0FBQzVCO0FBQ0E7O0FBRUEsb0JBQW9CLHNDQUFzQztBQUMxRCxRQUFRLHlEQUFjO0FBQ3RCO0FBQ0E7O0FBRUE7QUFDQSxRQUFRLDREQUFpQjtBQUN6QjtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLFFBQVEsMERBQWU7QUFDdkI7QUFDQTs7QUFFQTtBQUNBLFFBQVEsZ0ZBQXFDO0FBQzdDO0FBQ0E7O0FBRUE7QUFDQSxRQUFRLCtEQUFvQjtBQUM1QjtBQUNBOztBQUVBO0FBQ0EsUUFBUSxrRUFBdUI7QUFDL0I7QUFDQTs7QUFFQTtBQUNBLFFBQVEsOERBQW1CO0FBQzNCO0FBQ0E7O0FBRUE7QUFDQSxlQUFlLHFFQUEwQjtBQUN6Qzs7QUFFQTtBQUNBLFFBQVEsNERBQWlCO0FBQ3pCO0FBQ0E7O0FBRUE7QUFDQSxlQUFlLCtEQUFvQjtBQUNuQzs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7Ozs7O0FDek1vRDs7QUFFN0M7QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLFFBQVEsNERBQWlCO0FBQ3pCO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsUUFBUSx1REFBWTtBQUNwQjtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxRQUFRLDJEQUFnQjtBQUN4QjtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxRQUFRLDJEQUFnQjtBQUN4QjtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxRQUFRLDJEQUFnQjtBQUN4QjtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxRQUFRLDBEQUFlO0FBQ3ZCO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLFFBQVEsNkRBQWtCO0FBQzFCO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLFFBQVEsd0RBQWE7QUFDckI7QUFDQTtBQUNBOztBQUVBO0FBQ0EsUUFBUSw2REFBa0I7QUFDMUI7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxZQUFZLDREQUFpQjtBQUM3QixTQUFTO0FBQ1QsWUFBWSw0REFBaUI7QUFDN0I7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxlQUFlLHVEQUFZO0FBQzNCOztBQUVBO0FBQ0EsUUFBUSw0REFBaUI7QUFDekI7QUFDQTtBQUNBOztBQUVBO0FBQ0EsUUFBUSw2REFBa0I7QUFDMUI7QUFDQTs7QUFFQTtBQUNBLFFBQVEsZ0VBQXFCO0FBQzdCO0FBQ0E7O0FBRUE7QUFDQSxRQUFRLHlEQUFjO0FBQ3RCO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7Ozs7OztBQ3RKb0Q7O0FBRTdDO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxRQUFRLHVEQUFZO0FBQ3BCO0FBQ0E7O0FBRUE7QUFDQSxRQUFRLHdEQUFhO0FBQ3JCO0FBQ0E7O0FBRUE7QUFDQSxnQkFBZ0IsdURBQVk7QUFDNUIsYUFBYSx1REFBWTtBQUN6QjtBQUNBOztBQUVBO0FBQ0EsZ0JBQWdCLDREQUFpQjtBQUNqQyxhQUFhLDREQUFpQjtBQUM5QjtBQUNBOztBQUVBO0FBQ0Esc0JBQXNCLDREQUFpQjtBQUN2QyxhQUFhLHlEQUFjO0FBQzNCO0FBQ0E7O0FBRUE7QUFDQSxzQkFBc0IsMERBQWU7QUFDckMsYUFBYSx5REFBYztBQUMzQjtBQUNBOztBQUVBO0FBQ0EsUUFBUSwyREFBZ0I7QUFDeEI7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsZUFBZSwwREFBZTtBQUM5Qjs7QUFFQTtBQUNBLHNCQUFzQiw0REFBaUI7QUFDdkMsb0JBQW9CLDBEQUFlO0FBQ25DOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLHNCQUFzQixtRUFBd0I7QUFDOUMsb0JBQW9CLGlFQUFzQjtBQUMxQzs7QUFFQTtBQUNBLFFBQVEsMERBQWU7QUFDdkI7QUFDQTs7QUFFQTtBQUNBLHVCQUF1Qix5REFBYztBQUNyQyxlQUFlLHlEQUFjO0FBQzdCOztBQUVBO0FBQ0EsUUFBUSx5REFBYztBQUN0QjtBQUNBOztBQUVBO0FBQ0EsUUFBUSw2REFBa0I7QUFDMUI7QUFDQTs7QUFFQTtBQUNBLGVBQWUsdURBQVk7QUFDM0I7O0FBRUE7QUFDQSxlQUFlLCtEQUFvQjtBQUNuQzs7QUFFQTtBQUNBLFFBQVEsaUVBQXNCO0FBQzlCO0FBQ0E7O0FBRUE7QUFDQSxRQUFRLGlFQUFzQjtBQUM5QjtBQUNBOztBQUVBO0FBQ0EsUUFBUSx3REFBYTtBQUNyQjs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7QUM1SW9EOztBQUU3QztBQUNQO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxRQUFRLHVEQUFZO0FBQ3BCO0FBQ0E7O0FBRUE7QUFDQSxRQUFRLHdEQUFhO0FBQ3JCO0FBQ0E7O0FBRUE7QUFDQSxnQkFBZ0IsdURBQVk7QUFDNUIsYUFBYSx1REFBWTtBQUN6QjtBQUNBOztBQUVBO0FBQ0EsZ0JBQWdCLDREQUFpQjtBQUNqQyxhQUFhLDREQUFpQjtBQUM5QjtBQUNBOztBQUVBO0FBQ0Esc0JBQXNCLDREQUFpQjtBQUN2QyxhQUFhLHlEQUFjO0FBQzNCO0FBQ0E7O0FBRUE7QUFDQSxzQkFBc0IsMERBQWU7QUFDckMsYUFBYSx5REFBYztBQUMzQjtBQUNBOztBQUVBO0FBQ0EsUUFBUSwyREFBZ0I7QUFDeEI7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsZUFBZSwwREFBZTtBQUM5Qjs7QUFFQTtBQUNBLHNCQUFzQiw0REFBaUI7QUFDdkMsb0JBQW9CLDBEQUFlO0FBQ25DOztBQUVBO0FBQ0EsZUFBZSxpRUFBc0I7QUFDckM7O0FBRUE7QUFDQSxzQkFBc0IsbUVBQXdCO0FBQzlDLG9CQUFvQixpRUFBc0I7QUFDMUM7O0FBRUE7QUFDQSxRQUFRLDBEQUFlO0FBQ3ZCO0FBQ0E7O0FBRUE7QUFDQSxnQkFBZ0IseURBQWM7QUFDOUIsYUFBYSx5REFBYztBQUMzQjtBQUNBOztBQUVBO0FBQ0EsUUFBUSx5REFBYztBQUN0QjtBQUNBOztBQUVBO0FBQ0EsUUFBUSw2REFBa0I7QUFDMUI7QUFDQTs7QUFFQTtBQUNBLGVBQWUsdURBQVk7QUFDM0I7O0FBRUE7QUFDQSxlQUFlLCtEQUFvQjtBQUNuQzs7QUFFQTtBQUNBLFFBQVEsaUVBQXNCO0FBQzlCO0FBQ0E7O0FBRUE7QUFDQSxRQUFRLG1FQUF3QjtBQUNoQztBQUNBOztBQUVBO0FBQ0EsUUFBUSxpRUFBc0I7QUFDOUI7QUFDQTs7QUFFQTtBQUNBLGVBQWUseURBQWM7QUFDN0I7O0FBRUE7QUFDQSxRQUFRLHdEQUFhO0FBQ3JCO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7Ozs7OztBQzdLb0Q7O0FBRTdDO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsUUFBUSx1REFBWTtBQUNwQjtBQUNBOztBQUVBO0FBQ0EsUUFBUSx3REFBYTtBQUNyQjtBQUNBOztBQUVBO0FBQ0EsUUFBUSw2REFBa0I7QUFDMUI7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7Ozs7OztBQ3ZFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVPO0FBQ1A7QUFDQSw2QkFBNkIsRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFFO0FBQ3ZELDJEQUEyRCxJQUFJO0FBQy9EO0FBQ0E7O0FBRU87QUFDUDtBQUNBO0FBQ0E7O0FBRU87QUFDUDtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7Ozs7QUMxQ0E7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDM0RBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsS0FBSztBQUNoQixXQUFXLEtBQUs7QUFDaEIsYUFBYSxLQUFLO0FBQ2xCO0FBQ087QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsS0FBSztBQUNoQixXQUFXLEtBQUs7QUFDaEI7QUFDQSxhQUFhLEtBQUs7QUFDbEI7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsS0FBSztBQUNoQixXQUFXLEtBQUs7QUFDaEIsYUFBYSxLQUFLO0FBQ2xCO0FBQ087QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsS0FBSztBQUNoQixhQUFhLEtBQUs7QUFDbEI7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsV0FBVyxLQUFLO0FBQ2hCLGFBQWEsS0FBSztBQUNsQjtBQUNPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLEtBQUs7QUFDaEIsV0FBVyxLQUFLO0FBQ2hCLGFBQWEsS0FBSztBQUNsQjtBQUNPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsS0FBSztBQUNoQixXQUFXLEtBQUs7QUFDaEIsYUFBYSxLQUFLO0FBQ2xCO0FBQ087QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLEtBQUs7QUFDaEIsYUFBYSxPQUFPO0FBQ3BCO0FBQ087QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLEtBQUs7QUFDaEIsV0FBVyxLQUFLO0FBQ2hCLFdBQVcsS0FBSztBQUNoQixhQUFhLEtBQUs7QUFDbEI7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsS0FBSztBQUNoQixXQUFXLEtBQUs7QUFDaEIsV0FBVyxLQUFLO0FBQ2hCLGFBQWEsS0FBSztBQUNsQjtBQUNPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsV0FBVyxLQUFLO0FBQ2hCLFdBQVcsS0FBSztBQUNoQixXQUFXLE9BQU87QUFDbEIsYUFBYSxLQUFLO0FBQ2xCO0FBQ087QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLEtBQUs7QUFDaEIsV0FBVyxLQUFLO0FBQ2hCLFdBQVcsS0FBSztBQUNoQixhQUFhLEtBQUs7QUFDbEI7QUFDTztBQUNQO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsS0FBSztBQUNoQixXQUFXLEtBQUs7QUFDaEI7QUFDQSxhQUFhLEtBQUs7QUFDbEI7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsV0FBVyxLQUFLO0FBQ2hCLFdBQVcsT0FBTztBQUNsQixXQUFXLE9BQU87QUFDbEIsYUFBYSxLQUFLO0FBQ2xCO0FBQ087QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsS0FBSztBQUNoQixXQUFXLEtBQUs7QUFDaEIsV0FBVyxLQUFLO0FBQ2hCLGFBQWEsS0FBSztBQUNsQjtBQUNPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLEtBQUs7QUFDaEIsV0FBVyxLQUFLO0FBQ2hCLFdBQVcsS0FBSztBQUNoQixhQUFhLEtBQUs7QUFDbEI7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsV0FBVyxLQUFLO0FBQ2hCLFdBQVcsS0FBSztBQUNoQixXQUFXLE9BQU87QUFDbEIsYUFBYSxLQUFLO0FBQ2xCO0FBQ087QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDcmZBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsS0FBSztBQUNoQixXQUFXLEtBQUs7QUFDaEIsYUFBYSxLQUFLO0FBQ2xCO0FBQ087QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsV0FBVyxLQUFLO0FBQ2hCLGFBQWEsS0FBSztBQUNsQjtBQUNPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsS0FBSztBQUNoQixhQUFhLEtBQUs7QUFDbEI7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLEtBQUs7QUFDaEIsV0FBVyxLQUFLO0FBQ2hCLGFBQWEsS0FBSztBQUNsQjtBQUNPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsS0FBSztBQUNoQixXQUFXLEtBQUs7QUFDaEIsYUFBYSxLQUFLO0FBQ2xCO0FBQ087QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsS0FBSztBQUNoQixhQUFhLE9BQU87QUFDcEI7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsV0FBVyxLQUFLO0FBQ2hCLFdBQVcsS0FBSztBQUNoQixXQUFXLEtBQUs7QUFDaEIsYUFBYSxLQUFLO0FBQ2xCO0FBQ087QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsS0FBSztBQUNoQixXQUFXLEtBQUs7QUFDaEIsV0FBVyxLQUFLO0FBQ2hCLGFBQWEsS0FBSztBQUNsQjtBQUNPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsV0FBVyxLQUFLO0FBQ2hCLFdBQVcsS0FBSztBQUNoQixXQUFXLEtBQUs7QUFDaEIsYUFBYSxLQUFLO0FBQ2xCO0FBQ087QUFDUDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsS0FBSztBQUNoQixXQUFXLEtBQUs7QUFDaEIsV0FBVyxPQUFPO0FBQ2xCLFdBQVcsS0FBSztBQUNoQixhQUFhLEtBQUs7QUFDbEI7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZLEtBQUs7QUFDakIsWUFBWSxLQUFLO0FBQ2pCLFlBQVksS0FBSztBQUNqQjtBQUNPO0FBQ1A7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWSxLQUFLO0FBQ2pCLFlBQVksS0FBSztBQUNqQixZQUFZLEtBQUs7QUFDakI7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVyxLQUFLO0FBQ2hCLFdBQVcsS0FBSztBQUNoQixZQUFZLEtBQUs7QUFDakI7QUFDTztBQUNQOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLENBQUM7O0FBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsS0FBSztBQUNoQixXQUFXLE1BQU07QUFDakIsV0FBVyxLQUFLO0FBQ2hCLFdBQVcsS0FBSztBQUNoQixhQUFhLEtBQUs7QUFDbEI7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFD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QTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLEtBQUs7QUFDaEIsV0FBVyxLQUFLO0FBQ2hCLFdBQVcsT0FBTztBQUNsQixhQUFhLEtBQUs7QUFDbEI7QUFDTztBQUNQOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsV0FBVyxLQUFLO0FBQ2hCLFdBQVcsS0FBSztBQUNoQixXQUFXLEtBQUs7QUFDaEIsV0FBVyxPQUFPO0FBQ2xCLGFBQWEsS0FBSztBQUNsQjtBQUNPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsS0FBSztBQUNoQixXQUFXLEtBQUs7QUFDaEIsYUFBYSxLQUFLO0FBQ2xCO0FBQ087QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVyxLQUFLO0FBQ2hCLFdBQVcsS0FBSztBQUNoQixhQUFhLEtBQUs7QUFDbEI7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLEtBQUs7QUFDaEIsV0FBVyxLQUFLO0FBQ2hCLGFBQWEsS0FBSztBQUNsQjtBQUNBO0FBQ087QUFDUDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0Esd0NBQXdD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Iiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIHdlYnBhY2tVbml2ZXJzYWxNb2R1bGVEZWZpbml0aW9uKHJvb3QsIGZhY3RvcnkpIHtcblx0aWYodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUgPT09ICdvYmplY3QnKVxuXHRcdG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpO1xuXHRlbHNlIGlmKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZClcblx0XHRkZWZpbmUoW10sIGZhY3RvcnkpO1xuXHRlbHNlIGlmKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jylcblx0XHRleHBvcnRzW1wib2dsXCJdID0gZmFjdG9yeSgpO1xuXHRlbHNlXG5cdFx0cm9vdFtcIm9nbFwiXSA9IGZhY3RvcnkoKTtcbn0pKHNlbGYsIGZ1bmN0aW9uKCkge1xucmV0dXJuICIsImV4cG9ydCBkZWZhdWx0IFwidW5pZm9ybSBtYXQ0IHZpZXdNYXRyaXg7XFxudW5pZm9ybSBtYXQzIG5vcm1hbE1hdHJpeDtcXG51bmlmb3JtIHZlYzMgY2FtZXJhUG9zaXRpb247XFxudW5pZm9ybSB2ZWM0IHVCYXNlQ29sb3JGYWN0b3I7XFxudW5pZm9ybSBzYW1wbGVyMkQgdEJhc2VDb2xvcjtcXG51bmlmb3JtIHNhbXBsZXIyRCB0Uk07XFxudW5pZm9ybSBmbG9hdCB1Um91Z2huZXNzO1xcbnVuaWZvcm0gZmxvYXQgdU1ldGFsbGljO1xcbnVuaWZvcm0gc2FtcGxlcjJEIHROb3JtYWw7XFxudW5pZm9ybSBmbG9hdCB1Tm9ybWFsU2NhbGU7XFxudW5pZm9ybSBzYW1wbGVyMkQgdEVtaXNzaXZlO1xcbnVuaWZvcm0gdmVjMyB1RW1pc3NpdmU7XFxudW5pZm9ybSBzYW1wbGVyMkQgdE9jY2x1c2lvbjtcXG51bmlmb3JtIHNhbXBsZXIyRCB0TFVUO1xcbnVuaWZvcm0gc2FtcGxlcjJEIHRFbnZEaWZmdXNlO1xcbnVuaWZvcm0gc2FtcGxlcjJEIHRFbnZTcGVjdWxhcjtcXG51bmlmb3JtIGZsb2F0IHVFbnZEaWZmdXNlO1xcbnVuaWZvcm0gZmxvYXQgdUVudlNwZWN1bGFyO1xcbnVuaWZvcm0gZmxvYXQgdUVudk1hcEludGVuc2l0eTtcXG51bmlmb3JtIGZsb2F0IHVBbHBoYTtcXG51bmlmb3JtIGZsb2F0IHVBbHBoYUN1dG9mZjtcXG51bmlmb3JtIGJvb2wgdVRyYW5zcGFyZW50O1xcbnZhcnlpbmcgdmVjMiB2VXY7XFxudmFyeWluZyB2ZWMzIHZOb3JtYWw7XFxudmFyeWluZyB2ZWMzIHZNUG9zO1xcbnZhcnlpbmcgdmVjNCB2TVZQb3M7XFxuXFxuY29uc3QgZmxvYXQgUEkgPSAzLjE0MTU5MjY1MzU5O1xcbmNvbnN0IGZsb2F0IFJFQ0lQUk9DQUxfUEkgPSAwLjMxODMwOTg4NjE4O1xcbmNvbnN0IGZsb2F0IFJFQ0lQUk9DQUxfUEkyID0gMC4xNTkxNTQ5NDtcXG5jb25zdCBmbG9hdCBMTjIgPSAwLjY5MzE0NzI7XFxuY29uc3QgZmxvYXQgRU5WX0xPRFMgPSA2LjA7XFxudmVjNCBTUkdCdG9MaW5lYXIodmVjNCBzcmdiKSB7XFxuICB2ZWMzIGxpbk91dCA9IHBvdyhzcmdiLnh5eiwgdmVjMygyLjIpKTtcXG4gIHJldHVybiB2ZWM0KGxpbk91dCwgc3JnYi53KTs7XFxufVxcbnZlYzQgUkdCTVRvTGluZWFyKGluIHZlYzQgdmFsdWUpIHtcXG4gIGZsb2F0IG1heFJhbmdlID0gNi4wO1xcbiAgcmV0dXJuIHZlYzQodmFsdWUueHl6ICogdmFsdWUudyAqIG1heFJhbmdlLCAxLjApO1xcbn1cXG52ZWMzIGxpbmVhclRvU1JHQih2ZWMzIGNvbG9yKSB7XFxuICByZXR1cm4gcG93KGNvbG9yLCB2ZWMzKDEuMCAvIDIuMikpO1xcbn1cXG52ZWMzIGdldE5vcm1hbCgpIHtcXG4gICNpZmRlZiBOT1JNQUxfTUFQICBcXG4gICAgdmVjMyBwb3NfZHggPSBkRmR4KHZNUG9zLnh5eik7XFxuICAgIHZlYzMgcG9zX2R5ID0gZEZkeSh2TVBvcy54eXopO1xcbiAgICB2ZWMyIHRleF9keCA9IGRGZHgodlV2KTtcXG4gICAgdmVjMiB0ZXhfZHkgPSBkRmR5KHZVdik7XFxuICAgIC8vIFRhbmdlbnQsIEJpdGFuZ2VudFxcbiAgICB2ZWMzIHQgPSBub3JtYWxpemUocG9zX2R4ICogdGV4X2R5LnQgLSBwb3NfZHkgKiB0ZXhfZHgudCk7XFxuICAgIHZlYzMgYiA9IG5vcm1hbGl6ZSgtcG9zX2R4ICogdGV4X2R5LnMgKyBwb3NfZHkgKiB0ZXhfZHgucyk7XFxuICAgIG1hdDMgdGJuID0gbWF0Myh0LCBiLCBub3JtYWxpemUodk5vcm1hbCkpO1xcbiAgICB2ZWMzIG4gPSB0ZXh0dXJlMkQodE5vcm1hbCwgdlV2KS5yZ2IgKiAyLjAgLSAxLjA7XFxuICAgIG4ueHkgKj0gdU5vcm1hbFNjYWxlO1xcbiAgICB2ZWMzIG5vcm1hbCA9IG5vcm1hbGl6ZSh0Ym4gKiBuKTtcXG4gICAgLy8gR2V0IHdvcmxkIG5vcm1hbCBmcm9tIHZpZXcgbm9ybWFsIChub3JtYWxNYXRyaXggKiBub3JtYWwpXFxuICAgIC8vIHJldHVybiBub3JtYWxpemUoKHZlYzQobm9ybWFsLCAwLjApICogdmlld01hdHJpeCkueHl6KTtcXG4gICAgcmV0dXJuIG5vcm1hbGl6ZShub3JtYWwpO1xcbiAgI2Vsc2VcXG4gICAgcmV0dXJuIG5vcm1hbGl6ZSh2Tm9ybWFsKTtcXG4gICNlbmRpZlxcbn1cXG5cXG52ZWMyIGNhcnRlc2lhblRvUG9sYXIodmVjMyBuKSB7XFxuICB2ZWMyIHV2O1xcbiAgdXYueCA9IGF0YW4obi56LCBuLngpICogUkVDSVBST0NBTF9QSTIgKyAwLjU7XFxuICB1di55ID0gYXNpbihuLnkpICogUkVDSVBST0NBTF9QSSArIDAuNTtcXG4gIHJldHVybiB1djtcXG59XFxuXFxudm9pZCBnZXRJQkxDb250cmlidXRpb24oaW5vdXQgdmVjMyBkaWZmdXNlLCBpbm91dCB2ZWMzIHNwZWN1bGFyLCBmbG9hdCBOZFYsIGZsb2F0IHJvdWdobmVzcywgdmVjMyBuLCB2ZWMzIHJlZmxlY3Rpb24sIHZlYzMgZGlmZnVzZUNvbG9yLCB2ZWMzIHNwZWN1bGFyQ29sb3IpIHtcXG4gIHZlYzMgYnJkZiA9IFNSR0J0b0xpbmVhcih0ZXh0dXJlMkQodExVVCwgdmVjMihOZFYsIHJvdWdobmVzcykpKS5yZ2I7XFxuICB2ZWMzIGRpZmZ1c2VMaWdodCA9IFJHQk1Ub0xpbmVhcih0ZXh0dXJlMkQodEVudkRpZmZ1c2UsIGNhcnRlc2lhblRvUG9sYXIobikpKS5yZ2I7XFxuICBkaWZmdXNlTGlnaHQgPSBtaXgodmVjMygxKSwgZGlmZnVzZUxpZ2h0LCB1RW52RGlmZnVzZSk7XFxuICAvLyBTYW1wbGUgMiBsZXZlbHMgYW5kIG1peCBiZXR3ZWVuIHRvIGdldCBzbW9vdGhlciBkZWdyYWRhdGlvblxcbiAgZmxvYXQgYmxlbmQgPSByb3VnaG5lc3MgKiBFTlZfTE9EUztcXG4gIGZsb2F0IGxldmVsMCA9IGZsb29yKGJsZW5kKTtcXG4gIGZsb2F0IGxldmVsMSA9IG1pbihFTlZfTE9EUywgbGV2ZWwwICsgMS4wKTtcXG4gIGJsZW5kIC09IGxldmVsMDtcXG4gIFxcbiAgLy8gU2FtcGxlIHRoZSBzcGVjdWxhciBlbnYgbWFwIGF0bGFzIGRlcGVuZGluZyBvbiB0aGUgcm91Z2huZXNzIHZhbHVlXFxuICB2ZWMyIHV2U3BlYyA9IGNhcnRlc2lhblRvUG9sYXIocmVmbGVjdGlvbik7XFxuICB1dlNwZWMueSAvPSAyLjA7XFxuICB2ZWMyIHV2MCA9IHV2U3BlYztcXG4gIHZlYzIgdXYxID0gdXZTcGVjO1xcbiAgdXYwIC89IHBvdygyLjAsIGxldmVsMCk7XFxuICB1djAueSArPSAxLjAgLSBleHAoLUxOMiAqIGxldmVsMCk7XFxuICB1djEgLz0gcG93KDIuMCwgbGV2ZWwxKTtcXG4gIHV2MS55ICs9IDEuMCAtIGV4cCgtTE4yICogbGV2ZWwxKTtcXG4gIHZlYzMgc3BlY3VsYXIwID0gUkdCTVRvTGluZWFyKHRleHR1cmUyRCh0RW52U3BlY3VsYXIsIHV2MCkpLnJnYjtcXG4gIHZlYzMgc3BlY3VsYXIxID0gUkdCTVRvTGluZWFyKHRleHR1cmUyRCh0RW52U3BlY3VsYXIsIHV2MSkpLnJnYjtcXG4gIHZlYzMgc3BlY3VsYXJMaWdodCA9IG1peChzcGVjdWxhcjAsIHNwZWN1bGFyMSwgYmxlbmQpO1xcbiAgZGlmZnVzZSA9IGRpZmZ1c2VMaWdodCAqIGRpZmZ1c2VDb2xvcjtcXG4gIFxcbiAgLy8gQml0IG9mIGV4dHJhIHJlZmxlY3Rpb24gZm9yIHNtb290aCBtYXRlcmlhbHNcXG4gIGZsb2F0IHJlZmxlY3Rpdml0eSA9IHBvdygoMS4wIC0gcm91Z2huZXNzKSwgMi4wKSAqIDAuMDU7XFxuICBzcGVjdWxhciA9IHNwZWN1bGFyTGlnaHQgKiAoc3BlY3VsYXJDb2xvciAqIGJyZGYueCArIGJyZGYueSArIHJlZmxlY3Rpdml0eSk7XFxuICBzcGVjdWxhciAqPSB1RW52U3BlY3VsYXI7XFxufVxcblxcbnZvaWQgbWFpbigpIHtcXG4gIHZlYzQgYmFzZUNvbG9yID0gdUJhc2VDb2xvckZhY3RvcjtcXG4gICNpZmRlZiBDT0xPUl9NQVBcXG4gICAgYmFzZUNvbG9yICo9IFNSR0J0b0xpbmVhcih0ZXh0dXJlMkQodEJhc2VDb2xvciwgdlV2KSk7XFxuICAjZW5kaWZcXG4gIC8vIEdldCBiYXNlIGFscGhhXFxuICBmbG9hdCBhbHBoYSA9IGJhc2VDb2xvci5hO1xcbiAgI2lmZGVmIEFMUEhBX01BU0tcXG4gICAgaWYgKGFscGhhIDwgdUFscGhhQ3V0b2ZmKSBkaXNjYXJkO1xcbiAgI2VuZGlmXFxuICAvLyBSTSBtYXAgcGFja2VkIGFzIGdiID0gW25vdGhpbmcsIHJvdWdobmVzcywgbWV0YWxsaWMsIG5vdGhpbmddXFxuICB2ZWM0IHJtU2FtcGxlID0gdmVjNCgxKTtcXG4gICNpZmRlZiBSTV9NQVBcXG4gICAgcm1TYW1wbGUgKj0gdGV4dHVyZTJEKHRSTSwgdlV2KTtcXG4gICNlbmRpZlxcbiAgZmxvYXQgcm91Z2huZXNzID0gY2xhbXAocm1TYW1wbGUuZyAqIHVSb3VnaG5lc3MsIDAuMDQsIDEuMCk7XFxuICBmbG9hdCBtZXRhbGxpYyA9IGNsYW1wKHJtU2FtcGxlLmIgKiB1TWV0YWxsaWMsIDAuMDQsIDEuMCk7XFxuICB2ZWMzIGYwID0gdmVjMygwLjA0KTtcXG4gIHZlYzMgZGlmZnVzZUNvbG9yID0gYmFzZUNvbG9yLnJnYiAqICh2ZWMzKDEuMCkgLSBmMCkgKiAoMS4wIC0gbWV0YWxsaWMpO1xcbiAgdmVjMyBzcGVjdWxhckNvbG9yID0gbWl4KGYwLCBiYXNlQ29sb3IucmdiLCBtZXRhbGxpYyk7XFxuICB2ZWMzIHNwZWN1bGFyRW52UjAgPSBzcGVjdWxhckNvbG9yO1xcbiAgdmVjMyBzcGVjdWxhckVudlI5MCA9IHZlYzMoY2xhbXAobWF4KG1heChzcGVjdWxhckNvbG9yLnIsIHNwZWN1bGFyQ29sb3IuZyksIHNwZWN1bGFyQ29sb3IuYikgKiAyNS4wLCAwLjAsIDEuMCkpO1xcbiAgdmVjMyBOID0gZ2V0Tm9ybWFsKCk7XFxuICB2ZWMzIFYgPSBub3JtYWxpemUoY2FtZXJhUG9zaXRpb24gLSB2TVBvcyk7XFxuICB2ZWMzIHJlZmxlY3Rpb24gPSBub3JtYWxpemUocmVmbGVjdCgtViwgTikpO1xcbiAgZmxvYXQgTmRWID0gY2xhbXAoYWJzKGRvdChOLCBWKSksIDAuMDAxLCAxLjApO1xcbiAgLy8gU2hhZGluZyBiYXNlZCBvZmYgSUJMIGxpZ2h0aW5nXFxuICB2ZWMzIGNvbG9yID0gdmVjMygwLik7XFxuICB2ZWMzIGRpZmZ1c2VJQkw7XFxuICB2ZWMzIHNwZWN1bGFySUJMO1xcbiAgZ2V0SUJMQ29udHJpYnV0aW9uKGRpZmZ1c2VJQkwsIHNwZWN1bGFySUJMLCBOZFYsIHJvdWdobmVzcywgTiwgcmVmbGVjdGlvbiwgZGlmZnVzZUNvbG9yLCBzcGVjdWxhckNvbG9yKTtcXG4gIC8vIEFkZCBJQkwgb24gdG9wIG9mIGNvbG9yXFxuICBjb2xvciArPSAoZGlmZnVzZUlCTCArIHNwZWN1bGFySUJMKSAqIHVFbnZNYXBJbnRlbnNpdHk7XFxuICAvLyBBZGQgSUJMIHNwZWMgdG8gYWxwaGEgZm9yIHJlZmxlY3Rpb25zIG9uIHRyYW5zcGFyZW50IHN1cmZhY2VzIChnbGFzcylcXG4gIGFscGhhID0gbWF4KGFscGhhLCBtYXgobWF4KHNwZWN1bGFySUJMLnIsIHNwZWN1bGFySUJMLmcpLCBzcGVjdWxhcklCTC5iKSk7XFxuICAjaWZkZWYgT0NDX01BUCAgXFxuICAgIC8vIFRPRE86IGZpZ3VyZSBvdXQgaG93IHRvIGFwcGx5IG9jY2x1c2lvblxcbiAgICAvLyBjb2xvciAqPSBTUkdCdG9MaW5lYXIodGV4dHVyZTJEKHRPY2NsdXNpb24sIHZVdikpLnJnYjtcXG4gICNlbmRpZlxcbiAgY29sb3IgKz0gdUVtaXNzaXZlO1xcbiAgI2lmZGVmIEVNSVNTSVZFX01BUCAgXFxuICAgIHZlYzMgZW1pc3NpdmUgPSBTUkdCdG9MaW5lYXIodGV4dHVyZTJEKHRFbWlzc2l2ZSwgdlV2KSkucmdiO1xcbiAgICBjb2xvciA9IGVtaXNzaXZlO1xcbiAgI2VuZGlmXFxuICAvLyBBcHBseSB1QWxwaGEgdW5pZm9ybSBhdCB0aGUgZW5kIHRvIG92ZXJ3cml0ZSBhbnkgc3BlY3VsYXIgYWRkaXRpb25zIG9uIHRyYW5zcGFyZW50IHN1cmZhY2VzXFxuLy8gIGdsX0ZyYWdDb2xvci5yZ2IgPSBsaW5lYXJUb1NSR0IoY29sb3IpO1xcbiAgaWYodVRyYW5zcGFyZW50KXtcXG4gICAgZ2xfRnJhZ0NvbG9yID0gKHZlYzQoY29sb3IsIGFscGhhICogdUFscGhhKSk7XFxuICB9ZWxzZSB7XFxuICAgIGdsX0ZyYWdDb2xvciA9IGxpbmVhclRvT3V0cHV0VGV4ZWwodmVjNChjb2xvciAqIGFscGhhICogdUFscGhhLCAxLikpO1xcbiAgfVxcbn1cIjsiLCJleHBvcnQgZGVmYXVsdCBcInByZWNpc2lvbiBoaWdocCBmbG9hdDtcXG5wcmVjaXNpb24gaGlnaHAgaW50O1xcbmF0dHJpYnV0ZSB2ZWMzIHBvc2l0aW9uO1xcblxcbiNpZmRlZiBVVlxcbiAgICBhdHRyaWJ1dGUgdmVjMiB1djtcXG4jZWxzZVxcbiAgICBjb25zdCB2ZWMyIHV2ID0gdmVjMigwKTtcXG4jZW5kaWZcXG5hdHRyaWJ1dGUgdmVjMyBub3JtYWw7XFxuXFxudW5pZm9ybSBtYXQ0IG1vZGVsVmlld01hdHJpeDtcXG51bmlmb3JtIG1hdDQgcHJvamVjdGlvbk1hdHJpeDtcXG51bmlmb3JtIG1hdDQgbW9kZWxNYXRyaXg7XFxudW5pZm9ybSBtYXQzIG5vcm1hbE1hdHJpeDtcXG5cXG52YXJ5aW5nIHZlYzIgdlV2O1xcbnZhcnlpbmcgdmVjMyB2Tm9ybWFsO1xcbnZhcnlpbmcgdmVjMyB2TVBvcztcXG52YXJ5aW5nIHZlYzQgdk1WUG9zO1xcblxcbnZvaWQgbWFpbigpIHtcXG4gICAgdmVjNCBwb3MgPSB2ZWM0KHBvc2l0aW9uLCAxKTtcXG4gICAgdmVjMyBubWwgPSBub3JtYWw7XFxuICAgIHZVdiA9IHV2O1xcbiAgICB2Tm9ybWFsID0gbm9ybWFsaXplKG5tbCk7XFxuICAgIHZlYzQgbVBvcyA9IG1vZGVsTWF0cml4ICogcG9zO1xcbiAgICB2TVBvcyA9IG1Qb3MueHl6IC8gbVBvcy53O1xcbiAgICB2TVZQb3MgPSBtb2RlbFZpZXdNYXRyaXggKiBwb3M7XFxuICAgIGdsX1Bvc2l0aW9uID0gcHJvamVjdGlvbk1hdHJpeCAqIHZNVlBvcztcXG59XCI7IiwiZXhwb3J0IGRlZmF1bHQgXCIvLyBUYWtlbiBmcm9tIHRocmVlanMuXFxuLy8gRm9yIGEgZGlzY3Vzc2lvbiBvZiB3aGF0IHRoaXMgaXMsIHBsZWFzZSByZWFkIHRoaXM6IGh0dHA6Ly9sb3Vzb2Ryb21lLm5ldC9ibG9nL2xpZ2h0LzIwMTMvMDUvMjYvZ2FtbWEtY29ycmVjdC1hbmQtaGRyLXJlbmRlcmluZy1pbi1hLTMyLWJpdHMtYnVmZmVyL1xcbnZlYzQgTGluZWFyVG9MaW5lYXIoIGluIHZlYzQgdmFsdWUgKSB7XFxuICAgIHJldHVybiB2YWx1ZTtcXG59XFxuXFxudmVjNCBHYW1tYVRvTGluZWFyKCBpbiB2ZWM0IHZhbHVlLCBpbiBmbG9hdCBnYW1tYUZhY3RvciApIHtcXG4gICAgcmV0dXJuIHZlYzQoIHBvdyggdmFsdWUucmdiLCB2ZWMzKCBnYW1tYUZhY3RvciApICksIHZhbHVlLmEgKTtcXG59XFxuXFxudmVjNCBMaW5lYXJUb0dhbW1hKCBpbiB2ZWM0IHZhbHVlLCBpbiBmbG9hdCBnYW1tYUZhY3RvciApIHtcXG4gICAgcmV0dXJuIHZlYzQoIHBvdyggdmFsdWUucmdiLCB2ZWMzKCAxLjAgLyBnYW1tYUZhY3RvciApICksIHZhbHVlLmEgKTtcXG59XFxuXFxudmVjNCBzUkdCVG9MaW5lYXIoIGluIHZlYzQgdmFsdWUgKSB7XFxuICAgIHJldHVybiB2ZWM0KCBtaXgoIHBvdyggdmFsdWUucmdiICogMC45NDc4NjcyOTg2ICsgdmVjMyggMC4wNTIxMzI3MDE0ICksIHZlYzMoIDIuNCApICksIHZhbHVlLnJnYiAqIDAuMDc3Mzk5MzgwOCwgdmVjMyggbGVzc1RoYW5FcXVhbCggdmFsdWUucmdiLCB2ZWMzKCAwLjA0MDQ1ICkgKSApICksIHZhbHVlLmEgKTtcXG59XFxuXFxudmVjNCBMaW5lYXJUb3NSR0IoIGluIHZlYzQgdmFsdWUgKSB7XFxuICAgIHJldHVybiB2ZWM0KCBtaXgoIHBvdyggdmFsdWUucmdiLCB2ZWMzKCAwLjQxNjY2ICkgKSAqIDEuMDU1IC0gdmVjMyggMC4wNTUgKSwgdmFsdWUucmdiICogMTIuOTIsIHZlYzMoIGxlc3NUaGFuRXF1YWwoIHZhbHVlLnJnYiwgdmVjMyggMC4wMDMxMzA4ICkgKSApICksIHZhbHVlLmEgKTtcXG59XFxuXFxudmVjNCBSR0JFVG9MaW5lYXIoIGluIHZlYzQgdmFsdWUgKSB7XFxuICAgIHJldHVybiB2ZWM0KCB2YWx1ZS5yZ2IgKiBleHAyKCB2YWx1ZS5hICogMjU1LjAgLSAxMjguMCApLCAxLjAgKTtcXG59XFxuXFxudmVjNCBMaW5lYXJUb1JHQkUoIGluIHZlYzQgdmFsdWUgKSB7XFxuICAgIGZsb2F0IG1heENvbXBvbmVudCA9IG1heCggbWF4KCB2YWx1ZS5yLCB2YWx1ZS5nICksIHZhbHVlLmIgKTtcXG4gICAgZmxvYXQgZkV4cCA9IGNsYW1wKCBjZWlsKCBsb2cyKCBtYXhDb21wb25lbnQgKSApLCAtMTI4LjAsIDEyNy4wICk7XFxuICAgIHJldHVybiB2ZWM0KCB2YWx1ZS5yZ2IgLyBleHAyKCBmRXhwICksICggZkV4cCArIDEyOC4wICkgLyAyNTUuMCApO1xcbiAgICAvLyByZXR1cm4gdmVjNCggdmFsdWUuYnJnLCAoIDMuMCArIDEyOC4wICkgLyAyNTYuMCApO1xcbn1cXG5cXG4vLyByZWZlcmVuY2U6IGh0dHA6Ly9pd2FzYmVpbmdpcm9ueS5ibG9nc3BvdC5jYS8yMDEwLzA2L2RpZmZlcmVuY2UtYmV0d2Vlbi1yZ2JtLWFuZC1yZ2JkLmh0bWxcXG52ZWM0IFJHQk1Ub0xpbmVhciggaW4gdmVjNCB2YWx1ZSwgaW4gZmxvYXQgbWF4UmFuZ2UgKSB7XFxuICAgIHJldHVybiB2ZWM0KCB2YWx1ZS5yZ2IgKiB2YWx1ZS5hICogbWF4UmFuZ2UsIDEuMCApO1xcbn1cXG5cXG52ZWM0IExpbmVhclRvUkdCTSggaW4gdmVjNCB2YWx1ZSwgaW4gZmxvYXQgbWF4UmFuZ2UgKSB7XFxuICAgIGZsb2F0IG1heFJHQiA9IG1heCggdmFsdWUuciwgbWF4KCB2YWx1ZS5nLCB2YWx1ZS5iICkgKTtcXG4gICAgZmxvYXQgTSA9IGNsYW1wKCBtYXhSR0IgLyBtYXhSYW5nZSwgMC4wLCAxLjAgKTtcXG4gICAgTSA9IGNlaWwoIE0gKiAyNTUuMCApIC8gMjU1LjA7XFxuICAgIHJldHVybiB2ZWM0KCB2YWx1ZS5yZ2IgLyAoIE0gKiBtYXhSYW5nZSApLCBNICk7XFxufVxcblxcbi8vIHJlZmVyZW5jZTogaHR0cDovL2l3YXNiZWluZ2lyb255LmJsb2dzcG90LmNhLzIwMTAvMDYvZGlmZmVyZW5jZS1iZXR3ZWVuLXJnYm0tYW5kLXJnYmQuaHRtbFxcbnZlYzQgUkdCRFRvTGluZWFyKCBpbiB2ZWM0IHZhbHVlLCBpbiBmbG9hdCBtYXhSYW5nZSApIHtcXG4gICAgcmV0dXJuIHZlYzQoIHZhbHVlLnJnYiAqICggKCBtYXhSYW5nZSAvIDI1NS4wICkgLyB2YWx1ZS5hICksIDEuMCApO1xcbn1cXG5cXG52ZWM0IExpbmVhclRvUkdCRCggaW4gdmVjNCB2YWx1ZSwgaW4gZmxvYXQgbWF4UmFuZ2UgKSB7XFxuICAgIGZsb2F0IG1heFJHQiA9IG1heCggdmFsdWUuciwgbWF4KCB2YWx1ZS5nLCB2YWx1ZS5iICkgKTtcXG4gICAgZmxvYXQgRCA9IG1heCggbWF4UmFuZ2UgLyBtYXhSR0IsIDEuMCApO1xcbiAgICAvLyBOT1RFOiBUaGUgaW1wbGVtZW50YXRpb24gd2l0aCBtaW4gY2F1c2VzIHRoZSBzaGFkZXIgdG8gbm90IGNvbXBpbGUgb25cXG4gICAgLy8gYSBjb21tb24gQWxjYXRlbCBBNTAyREwgaW4gQ2hyb21lIDc4L0FuZHJvaWQgOC4xLiBTb21lIHJlc2VhcmNoIHN1Z2dlc3RzXFxuICAgIC8vIHRoYXQgdGhlIGNoaXBzZXQgaXMgTWVkaWF0ZWsgTVQ2NzM5IHcvIElNRyBQb3dlclZSIEdFODEwMCBHUFUuXFxuICAgIC8vIEQgPSBtaW4oIGZsb29yKCBEICkgLyAyNTUuMCwgMS4wICk7XFxuICAgIEQgPSBjbGFtcCggZmxvb3IoIEQgKSAvIDI1NS4wLCAwLjAsIDEuMCApO1xcbiAgICByZXR1cm4gdmVjNCggdmFsdWUucmdiICogKCBEICogKCAyNTUuMCAvIG1heFJhbmdlICkgKSwgRCApO1xcbn1cXG5cXG4vLyBMb2dMdXYgcmVmZXJlbmNlOiBodHRwOi8vZ3JhcGhpY3JhbnRzLmJsb2dzcG90LmNhLzIwMDkvMDQvcmdibS1jb2xvci1lbmNvZGluZy5odG1sXFxuXFxuLy8gTSBtYXRyaXgsIGZvciBlbmNvZGluZ1xcbmNvbnN0IG1hdDMgY0xvZ0x1dk0gPSBtYXQzKCAwLjIyMDksIDAuMzM5MCwgMC40MTg0LCAwLjExMzgsIDAuNjc4MCwgMC43MzE5LCAwLjAxMDIsIDAuMTEzMCwgMC4yOTY5ICk7XFxudmVjNCBMaW5lYXJUb0xvZ0x1diggaW4gdmVjNCB2YWx1ZSApIHtcXG4gICAgdmVjMyBYcF9ZX1hZWnAgPSBjTG9nTHV2TSAqIHZhbHVlLnJnYjtcXG4gICAgWHBfWV9YWVpwID0gbWF4KCBYcF9ZX1hZWnAsIHZlYzMoIDFlLTYsIDFlLTYsIDFlLTYgKSApO1xcbiAgICB2ZWM0IHZSZXN1bHQ7XFxuICAgIHZSZXN1bHQueHkgPSBYcF9ZX1hZWnAueHkgLyBYcF9ZX1hZWnAuejtcXG4gICAgZmxvYXQgTGUgPSAyLjAgKiBsb2cyKFhwX1lfWFlacC55KSArIDEyNy4wO1xcbiAgICB2UmVzdWx0LncgPSBmcmFjdCggTGUgKTtcXG4gICAgdlJlc3VsdC56ID0gKCBMZSAtICggZmxvb3IoIHZSZXN1bHQudyAqIDI1NS4wICkgKSAvIDI1NS4wICkgLyAyNTUuMDtcXG4gICAgcmV0dXJuIHZSZXN1bHQ7XFxufVxcblxcbi8vIEludmVyc2UgTSBtYXRyaXgsIGZvciBkZWNvZGluZ1xcbmNvbnN0IG1hdDMgY0xvZ0x1dkludmVyc2VNID0gbWF0MyggNi4wMDE0LCAtMi43MDA4LCAtMS43OTk2LCAtMS4zMzIwLCAzLjEwMjksIC01Ljc3MjEsIDAuMzAwOCwgLTEuMDg4MiwgNS42MjY4ICk7XFxudmVjNCBMb2dMdXZUb0xpbmVhciggaW4gdmVjNCB2YWx1ZSApIHtcXG4gICAgZmxvYXQgTGUgPSB2YWx1ZS56ICogMjU1LjAgKyB2YWx1ZS53O1xcbiAgICB2ZWMzIFhwX1lfWFlacDtcXG4gICAgWHBfWV9YWVpwLnkgPSBleHAyKCAoIExlIC0gMTI3LjAgKSAvIDIuMCApO1xcbiAgICBYcF9ZX1hZWnAueiA9IFhwX1lfWFlacC55IC8gdmFsdWUueTtcXG4gICAgWHBfWV9YWVpwLnggPSB2YWx1ZS54ICogWHBfWV9YWVpwLno7XFxuICAgIHZlYzMgdlJHQiA9IGNMb2dMdXZJbnZlcnNlTSAqIFhwX1lfWFlacC5yZ2I7XFxuICAgIHJldHVybiB2ZWM0KCBtYXgoIHZSR0IsIDAuMCApLCAxLjAgKTtcXG59XFxuXFxuXFxudmVjNCBpbnB1dFRleGVsVG9MaW5lYXIoIHZlYzQgdmFsdWUgKSB7XFxuICAgIGlmICggaW5wdXRFbmNvZGluZyA9PSAwICkge1xcbiAgICAgICAgcmV0dXJuIHZhbHVlO1xcbiAgICB9IGVsc2UgaWYgKCBpbnB1dEVuY29kaW5nID09IDEgKSB7XFxuICAgICAgICByZXR1cm4gc1JHQlRvTGluZWFyKCB2YWx1ZSApO1xcbiAgICB9IGVsc2UgaWYgKCBpbnB1dEVuY29kaW5nID09IDIgKSB7XFxuICAgICAgICByZXR1cm4gUkdCRVRvTGluZWFyKCB2YWx1ZSApO1xcbiAgICB9IGVsc2UgaWYgKCBpbnB1dEVuY29kaW5nID09IDMgKSB7XFxuICAgICAgICByZXR1cm4gUkdCTVRvTGluZWFyKCB2YWx1ZSwgNy4wICk7XFxuICAgIH0gZWxzZSBpZiAoIGlucHV0RW5jb2RpbmcgPT0gNCApIHtcXG4gICAgICAgIHJldHVybiBSR0JNVG9MaW5lYXIoIHZhbHVlLCAxNi4wICk7XFxuICAgIH0gZWxzZSBpZiAoIGlucHV0RW5jb2RpbmcgPT0gNSApIHtcXG4gICAgICAgIHJldHVybiBSR0JEVG9MaW5lYXIoIHZhbHVlLCAyNTYuMCApO1xcbiAgICB9IGVsc2Uge1xcbiAgICAgICAgcmV0dXJuIEdhbW1hVG9MaW5lYXIoIHZhbHVlLCAyLjIgKTtcXG4gICAgfVxcbn1cXG52ZWM0IGxpbmVhclRvT3V0cHV0VGV4ZWwoIHZlYzQgdmFsdWUgKSB7XFxuICAgIGlmICggb3V0cHV0RW5jb2RpbmcgPT0gMCApIHtcXG4gICAgICAgIHJldHVybiB2YWx1ZTtcXG4gICAgfSBlbHNlIGlmICggb3V0cHV0RW5jb2RpbmcgPT0gMSApIHtcXG4gICAgICAgIHJldHVybiBMaW5lYXJUb3NSR0IoIHZhbHVlICk7XFxuICAgIH0gZWxzZSBpZiAoIG91dHB1dEVuY29kaW5nID09IDIgKSB7XFxuICAgICAgICByZXR1cm4gTGluZWFyVG9SR0JFKCB2YWx1ZSApO1xcbiAgICB9IGVsc2UgaWYgKCBvdXRwdXRFbmNvZGluZyA9PSAzICkge1xcbiAgICAgICAgcmV0dXJuIExpbmVhclRvUkdCTSggdmFsdWUsIDcuMCApO1xcbiAgICB9IGVsc2UgaWYgKCBvdXRwdXRFbmNvZGluZyA9PSA0ICkge1xcbiAgICAgICAgcmV0dXJuIExpbmVhclRvUkdCTSggdmFsdWUsIDE2LjAgKTtcXG4gICAgfSBlbHNlIGlmICggb3V0cHV0RW5jb2RpbmcgPT0gNSApIHtcXG4gICAgICAgIHJldHVybiBMaW5lYXJUb1JHQkQoIHZhbHVlLCAyNTYuMCApO1xcbiAgICB9IGVsc2Uge1xcbiAgICAgICAgcmV0dXJuIExpbmVhclRvR2FtbWEoIHZhbHVlLCAyLjIgKTtcXG4gICAgfVxcbn1cXG5cXG5cXG5cIjsiLCJleHBvcnQgZGVmYXVsdCBcInVuaWZvcm0gZmxvYXQgdG9uZU1hcHBpbmdFeHBvc3VyZTtcXG5cXG4vLyBleHBvc3VyZSBvbmx5XFxudmVjMyBMaW5lYXJUb25lTWFwcGluZyggdmVjMyBjb2xvciApIHtcXG5cXG4gICAgcmV0dXJuIHRvbmVNYXBwaW5nRXhwb3N1cmUgKiBjb2xvcjtcXG5cXG59XFxuXFxuLy8gc291cmNlOiBodHRwczovL3d3dy5jcy51dGFoLmVkdS9+cmVpbmhhcmQvY2Ryb20vXFxudmVjMyBSZWluaGFyZFRvbmVNYXBwaW5nKCB2ZWMzIGNvbG9yICkge1xcblxcbiAgICBjb2xvciAqPSB0b25lTWFwcGluZ0V4cG9zdXJlO1xcbiAgICByZXR1cm4gY2xhbXAgKCBjb2xvciAvICggdmVjMyggMS4wICkgKyBjb2xvciApLCAwLiwgMS4pO1xcblxcbn1cXG5cXG4vLyBzb3VyY2U6IGh0dHA6Ly9maWxtaWN3b3JsZHMuY29tL2Jsb2cvZmlsbWljLXRvbmVtYXBwaW5nLW9wZXJhdG9ycy9cXG52ZWMzIE9wdGltaXplZENpbmVvblRvbmVNYXBwaW5nKCB2ZWMzIGNvbG9yICkge1xcblxcbiAgICAvLyBvcHRpbWl6ZWQgZmlsbWljIG9wZXJhdG9yIGJ5IEppbSBIZWpsIGFuZCBSaWNoYXJkIEJ1cmdlc3MtRGF3c29uXFxuICAgIGNvbG9yICo9IHRvbmVNYXBwaW5nRXhwb3N1cmU7XFxuICAgIGNvbG9yID0gbWF4KCB2ZWMzKCAwLjAgKSwgY29sb3IgLSAwLjAwNCApO1xcbiAgICByZXR1cm4gcG93KCAoIGNvbG9yICogKCA2LjIgKiBjb2xvciArIDAuNSApICkgLyAoIGNvbG9yICogKCA2LjIgKiBjb2xvciArIDEuNyApICsgMC4wNiApLCB2ZWMzKCAyLjIgKSApO1xcblxcbn1cXG5cXG4vLyBzb3VyY2U6IGh0dHBzOi8vZ2l0aHViLmNvbS9zZWxmc2hhZG93L2x0Y19jb2RlL2Jsb2IvbWFzdGVyL3dlYmdsL3NoYWRlcnMvbHRjL2x0Y19ibGl0LmZzXFxudmVjMyBSUlRBbmRPRFRGaXQoIHZlYzMgdiApIHtcXG5cXG4gICAgdmVjMyBhID0gdiAqICggdiArIDAuMDI0NTc4NiApIC0gMC4wMDAwOTA1Mzc7XFxuICAgIHZlYzMgYiA9IHYgKiAoIDAuOTgzNzI5ICogdiArIDAuNDMyOTUxMCApICsgMC4yMzgwODE7XFxuICAgIHJldHVybiBhIC8gYjtcXG5cXG59XFxuXFxuLy8gdGhpcyBpbXBsZW1lbnRhdGlvbiBvZiBBQ0VTIGlzIG1vZGlmaWVkIHRvIGFjY29tbW9kYXRlIGEgYnJpZ2h0ZXIgdmlld2luZyBlbnZpcm9ubWVudC5cXG4vLyB0aGUgc2NhbGUgZmFjdG9yIG9mIDEvMC42IGlzIHN1YmplY3RpdmUuIHNlZSBkaXNjdXNzaW9uIGluICMxOTYyMS5cXG5cXG52ZWMzIEFDRVNGaWxtaWNUb25lTWFwcGluZyggdmVjMyBjb2xvciApIHtcXG5cXG4gICAgLy8gc1JHQiA9PiBYWVogPT4gRDY1XzJfRDYwID0+IEFQMSA9PiBSUlRfU0FUXFxuICAgIGNvbnN0IG1hdDMgQUNFU0lucHV0TWF0ID0gbWF0MyhcXG4gICAgdmVjMyggMC41OTcxOSwgMC4wNzYwMCwgMC4wMjg0MCApLCAvLyB0cmFuc3Bvc2VkIGZyb20gc291cmNlXFxuICAgIHZlYzMoIDAuMzU0NTgsIDAuOTA4MzQsIDAuMTMzODMgKSxcXG4gICAgdmVjMyggMC4wNDgyMywgMC4wMTU2NiwgMC44Mzc3NyApXFxuICAgICk7XFxuXFxuICAgIC8vIE9EVF9TQVQgPT4gWFlaID0+IEQ2MF8yX0Q2NSA9PiBzUkdCXFxuICAgIGNvbnN0IG1hdDMgQUNFU091dHB1dE1hdCA9IG1hdDMoXFxuICAgIHZlYzMoICAxLjYwNDc1LCAtMC4xMDIwOCwgLTAuMDAzMjcgKSwgLy8gdHJhbnNwb3NlZCBmcm9tIHNvdXJjZVxcbiAgICB2ZWMzKCAtMC41MzEwOCwgIDEuMTA4MTMsIC0wLjA3Mjc2ICksXFxuICAgIHZlYzMoIC0wLjA3MzY3LCAtMC4wMDYwNSwgIDEuMDc2MDIgKVxcbiAgICApO1xcblxcbiAgICBjb2xvciAqPSB0b25lTWFwcGluZ0V4cG9zdXJlIC8gMC42O1xcblxcbiAgICBjb2xvciA9IEFDRVNJbnB1dE1hdCAqIGNvbG9yO1xcblxcbiAgICAvLyBBcHBseSBSUlQgYW5kIE9EVFxcbiAgICBjb2xvciA9IFJSVEFuZE9EVEZpdCggY29sb3IgKTtcXG5cXG4gICAgY29sb3IgPSBBQ0VTT3V0cHV0TWF0ICogY29sb3I7XFxuXFxuICAgIC8vIENsYW1wIHRvIFswLCAxXVxcbiAgICByZXR1cm4gY2xhbXAoIGNvbG9yLCAwLiwgMS4gKTtcXG5cXG59XFxuXFxudmVjMyBDdXN0b21Ub25lTWFwcGluZyggdmVjMyBjb2xvciApIHsgcmV0dXJuIGNvbG9yOyB9XFxuXFxudmVjMyB0b25lTWFwQ29sb3IodmVjMyB2YWx1ZSl7XFxuICAgIGlmICggdG9uZW1hcHBpbmdNb2RlID09IDAgKSB7XFxuICAgICAgICByZXR1cm4gTGluZWFyVG9uZU1hcHBpbmcgKCB2YWx1ZSApO1xcbiAgICB9IGVsc2UgaWYgKCB0b25lbWFwcGluZ01vZGUgPT0gMSApIHtcXG4gICAgICAgIHJldHVybiBSZWluaGFyZFRvbmVNYXBwaW5nICggdmFsdWUgKTtcXG4gICAgfSBlbHNlIGlmICggdG9uZW1hcHBpbmdNb2RlID09IDIgKSB7XFxuICAgICAgICByZXR1cm4gT3B0aW1pemVkQ2luZW9uVG9uZU1hcHBpbmcgKCB2YWx1ZSApO1xcbiAgICB9IGVsc2UgaWYgKCB0b25lbWFwcGluZ01vZGUgPT0gMyApIHtcXG4gICAgICAgIHJldHVybiBBQ0VTRmlsbWljVG9uZU1hcHBpbmcgKCB2YWx1ZSApO1xcbiAgICB9IGVsc2Uge1xcbiAgICAgICAgcmV0dXJuIHZhbHVlO1xcbiAgICB9XFxufVxcblxcblwiOyIsImltcG9ydCB7IFRyYW5zZm9ybSB9IGZyb20gJy4vVHJhbnNmb3JtLmpzJztcbmltcG9ydCB7IE1hdDQgfSBmcm9tICcuLi9tYXRoL01hdDQuanMnO1xuaW1wb3J0IHsgVmVjMyB9IGZyb20gJy4uL21hdGgvVmVjMy5qcyc7XG5cbmNvbnN0IHRlbXBNYXQ0ID0gbmV3IE1hdDQoKTtcbmNvbnN0IHRlbXBWZWMzYSA9IG5ldyBWZWMzKCk7XG5jb25zdCB0ZW1wVmVjM2IgPSBuZXcgVmVjMygpO1xuXG5leHBvcnQgY2xhc3MgQ2FtZXJhIGV4dGVuZHMgVHJhbnNmb3JtIHtcbiAgICBjb25zdHJ1Y3RvcihnbCwgeyBuZWFyID0gMC4xLCBmYXIgPSAxMDAsIGZvdiA9IDQ1LCBhc3BlY3QgPSAxLCBsZWZ0LCByaWdodCwgYm90dG9tLCB0b3AsIHpvb20gPSAxIH0gPSB7fSkge1xuICAgICAgICBzdXBlcigpO1xuXG4gICAgICAgIE9iamVjdC5hc3NpZ24odGhpcywgeyBuZWFyLCBmYXIsIGZvdiwgYXNwZWN0LCBsZWZ0LCByaWdodCwgYm90dG9tLCB0b3AsIHpvb20gfSk7XG5cbiAgICAgICAgdGhpcy5wcm9qZWN0aW9uTWF0cml4ID0gbmV3IE1hdDQoKTtcbiAgICAgICAgdGhpcy52aWV3TWF0cml4ID0gbmV3IE1hdDQoKTtcbiAgICAgICAgdGhpcy5wcm9qZWN0aW9uVmlld01hdHJpeCA9IG5ldyBNYXQ0KCk7XG4gICAgICAgIHRoaXMud29ybGRQb3NpdGlvbiA9IG5ldyBWZWMzKCk7XG5cbiAgICAgICAgLy8gVXNlIG9ydGhvZ3JhcGhpYyBpZiBsZWZ0L3JpZ2h0IHNldCwgZWxzZSBkZWZhdWx0IHRvIHBlcnNwZWN0aXZlIGNhbWVyYVxuICAgICAgICB0aGlzLnR5cGUgPSBsZWZ0IHx8IHJpZ2h0ID8gJ29ydGhvZ3JhcGhpYycgOiAncGVyc3BlY3RpdmUnO1xuXG4gICAgICAgIGlmICh0aGlzLnR5cGUgPT09ICdvcnRob2dyYXBoaWMnKSB0aGlzLm9ydGhvZ3JhcGhpYygpO1xuICAgICAgICBlbHNlIHRoaXMucGVyc3BlY3RpdmUoKTtcbiAgICB9XG5cbiAgICBzZXRWaWV3T2Zmc2V0KHgsIHksIHdpZHRoLCBoZWlnaHQpIHtcbiAgICAgICAgaWYoIXRoaXMudmlldykge1xuICAgICAgICAgICAgdGhpcy52aWV3ID0ge1xuICAgICAgICAgICAgICAgIG9mZnNldFg6IHgsXG4gICAgICAgICAgICAgICAgb2Zmc2V0WTogeSxcbiAgICAgICAgICAgICAgICB3aWR0aDogd2lkdGgsXG4gICAgICAgICAgICAgICAgaGVpZ2h0OiBoZWlnaHRcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aGlzLnZpZXcub2Zmc2V0WCA9IHg7XG4gICAgICAgIHRoaXMudmlldy5vZmZzZXRZID0geTtcbiAgICAgICAgdGhpcy52aWV3LndpZHRoID0gd2lkdGg7XG4gICAgICAgIHRoaXMudmlldy5oZWlnaHQgPSBoZWlnaHQ7XG4gICAgICAgIGlmKHRoaXMudHlwZSA9PT0gJ3BlcnNwZWN0aXZlJykge1xuICAgICAgICAgICAgdGhpcy5wZXJzcGVjdGl2ZSgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY2xlYXJWaWV3T2Zmc2V0KCkge1xuICAgICAgICB0aGlzLnZpZXcgPSBudWxsO1xuICAgICAgICBpZih0aGlzLnR5cGUgPT09ICdwZXJzcGVjdGl2ZScpIHtcbiAgICAgICAgICAgIHRoaXMucGVyc3BlY3RpdmUoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHBlcnNwZWN0aXZlKHsgbmVhciA9IHRoaXMubmVhciwgZmFyID0gdGhpcy5mYXIsIGZvdiA9IHRoaXMuZm92LCBhc3BlY3QgPSB0aGlzLmFzcGVjdCB9ID0ge30pIHtcbiAgICAgICAgT2JqZWN0LmFzc2lnbih0aGlzLCB7IG5lYXIsIGZhciwgZm92LCBhc3BlY3QgfSk7XG4gICAgICAgIGxldCB0b3AgPSBuZWFyICogTWF0aC50YW4oIE1hdGguUEkvMTgwICogMC41ICogZm92ICksXG4gICAgICAgIGhlaWdodCA9IDIgKiB0b3AsXG4gICAgICAgIHdpZHRoID0gYXNwZWN0ICogaGVpZ2h0LFxuICAgICAgICBsZWZ0ID0gLSAwLjUgKiB3aWR0aDtcbiAgICAgICAgXG4gICAgICAgIGlmKHRoaXMudmlldykge1xuICAgICAgICAgICAgbGVmdCArPSB0aGlzLnZpZXcub2Zmc2V0WCAqIHdpZHRoIC8gdGhpcy52aWV3LndpZHRoO1xuXHRcdFx0dG9wIC09IHRoaXMudmlldy5vZmZzZXRZICogaGVpZ2h0IC8gdGhpcy52aWV3LmhlaWdodDtcbiAgICAgICAgfVxuICAgICAgICBsZXQgcmlnaHQgPSBsZWZ0ICsgd2lkdGg7XG4gICAgICAgIGxldCBib3R0b20gPSB0b3AgLSBoZWlnaHQ7XG5cbiAgICAgICAgdGhpcy5wcm9qZWN0aW9uTWF0cml4LmZyb21QZXJzcGVjdGl2ZUZydXN0cnVtKHsgbGVmdCwgcmlnaHQsIHRvcCwgYm90dG9tLCBuZWFyLCBmYXIgfSk7XG4gICAgICAgIHRoaXMudHlwZSA9ICdwZXJzcGVjdGl2ZSc7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIG9ydGhvZ3JhcGhpYyh7XG4gICAgICAgIG5lYXIgPSB0aGlzLm5lYXIsXG4gICAgICAgIGZhciA9IHRoaXMuZmFyLFxuICAgICAgICBsZWZ0ID0gdGhpcy5sZWZ0LFxuICAgICAgICByaWdodCA9IHRoaXMucmlnaHQsXG4gICAgICAgIGJvdHRvbSA9IHRoaXMuYm90dG9tLFxuICAgICAgICB0b3AgPSB0aGlzLnRvcCxcbiAgICAgICAgem9vbSA9IHRoaXMuem9vbSxcbiAgICB9ID0ge30pIHtcbiAgICAgICAgT2JqZWN0LmFzc2lnbih0aGlzLCB7IG5lYXIsIGZhciwgbGVmdCwgcmlnaHQsIGJvdHRvbSwgdG9wLCB6b29tIH0pO1xuICAgICAgICBsZWZ0IC89IHpvb207XG4gICAgICAgIHJpZ2h0IC89IHpvb207XG4gICAgICAgIGJvdHRvbSAvPSB6b29tO1xuICAgICAgICB0b3AgLz0gem9vbTtcbiAgICAgICAgdGhpcy5wcm9qZWN0aW9uTWF0cml4LmZyb21PcnRob2dvbmFsKHsgbGVmdCwgcmlnaHQsIGJvdHRvbSwgdG9wLCBuZWFyLCBmYXIgfSk7XG4gICAgICAgIHRoaXMudHlwZSA9ICdvcnRob2dyYXBoaWMnO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICB1cGRhdGVNYXRyaXhXb3JsZCgpIHtcbiAgICAgICAgc3VwZXIudXBkYXRlTWF0cml4V29ybGQoKTtcbiAgICAgICAgdGhpcy52aWV3TWF0cml4LmludmVyc2UodGhpcy53b3JsZE1hdHJpeCk7XG4gICAgICAgIHRoaXMud29ybGRNYXRyaXguZ2V0VHJhbnNsYXRpb24odGhpcy53b3JsZFBvc2l0aW9uKTtcblxuICAgICAgICAvLyB1c2VkIGZvciBzb3J0aW5nXG4gICAgICAgIHRoaXMucHJvamVjdGlvblZpZXdNYXRyaXgubXVsdGlwbHkodGhpcy5wcm9qZWN0aW9uTWF0cml4LCB0aGlzLnZpZXdNYXRyaXgpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBsb29rQXQodGFyZ2V0KSB7XG4gICAgICAgIHN1cGVyLmxvb2tBdCh0YXJnZXQsIHRydWUpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvLyBQcm9qZWN0IDNEIGNvb3JkaW5hdGUgdG8gMkQgcG9pbnRcbiAgICBwcm9qZWN0KHYpIHtcbiAgICAgICAgdi5hcHBseU1hdHJpeDQodGhpcy52aWV3TWF0cml4KTtcbiAgICAgICAgdi5hcHBseU1hdHJpeDQodGhpcy5wcm9qZWN0aW9uTWF0cml4KTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLy8gVW5wcm9qZWN0IDJEIHBvaW50IHRvIDNEIGNvb3JkaW5hdGVcbiAgICB1bnByb2plY3Qodikge1xuICAgICAgICB2LmFwcGx5TWF0cml4NCh0ZW1wTWF0NC5pbnZlcnNlKHRoaXMucHJvamVjdGlvbk1hdHJpeCkpO1xuICAgICAgICB2LmFwcGx5TWF0cml4NCh0aGlzLndvcmxkTWF0cml4KTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgdXBkYXRlRnJ1c3R1bSgpIHtcbiAgICAgICAgaWYgKCF0aGlzLmZydXN0dW0pIHtcbiAgICAgICAgICAgIHRoaXMuZnJ1c3R1bSA9IFtuZXcgVmVjMygpLCBuZXcgVmVjMygpLCBuZXcgVmVjMygpLCBuZXcgVmVjMygpLCBuZXcgVmVjMygpLCBuZXcgVmVjMygpXTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IG0gPSB0aGlzLnByb2plY3Rpb25WaWV3TWF0cml4O1xuICAgICAgICB0aGlzLmZydXN0dW1bMF0uc2V0KG1bM10gLSBtWzBdLCBtWzddIC0gbVs0XSwgbVsxMV0gLSBtWzhdKS5jb25zdGFudCA9IG1bMTVdIC0gbVsxMl07IC8vIC14XG4gICAgICAgIHRoaXMuZnJ1c3R1bVsxXS5zZXQobVszXSArIG1bMF0sIG1bN10gKyBtWzRdLCBtWzExXSArIG1bOF0pLmNvbnN0YW50ID0gbVsxNV0gKyBtWzEyXTsgLy8gK3hcbiAgICAgICAgdGhpcy5mcnVzdHVtWzJdLnNldChtWzNdICsgbVsxXSwgbVs3XSArIG1bNV0sIG1bMTFdICsgbVs5XSkuY29uc3RhbnQgPSBtWzE1XSArIG1bMTNdOyAvLyAreVxuICAgICAgICB0aGlzLmZydXN0dW1bM10uc2V0KG1bM10gLSBtWzFdLCBtWzddIC0gbVs1XSwgbVsxMV0gLSBtWzldKS5jb25zdGFudCA9IG1bMTVdIC0gbVsxM107IC8vIC15XG4gICAgICAgIHRoaXMuZnJ1c3R1bVs0XS5zZXQobVszXSAtIG1bMl0sIG1bN10gLSBtWzZdLCBtWzExXSAtIG1bMTBdKS5jb25zdGFudCA9IG1bMTVdIC0gbVsxNF07IC8vICt6IChmYXIpXG4gICAgICAgIHRoaXMuZnJ1c3R1bVs1XS5zZXQobVszXSArIG1bMl0sIG1bN10gKyBtWzZdLCBtWzExXSArIG1bMTBdKS5jb25zdGFudCA9IG1bMTVdICsgbVsxNF07IC8vIC16IChuZWFyKVxuXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgNjsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBpbnZMZW4gPSAxLjAgLyB0aGlzLmZydXN0dW1baV0uZGlzdGFuY2UoKTtcbiAgICAgICAgICAgIHRoaXMuZnJ1c3R1bVtpXS5tdWx0aXBseShpbnZMZW4pO1xuICAgICAgICAgICAgdGhpcy5mcnVzdHVtW2ldLmNvbnN0YW50ICo9IGludkxlbjtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZydXN0dW1JbnRlcnNlY3RzTWVzaChub2RlKSB7XG4gICAgICAgIC8vIElmIG5vIHBvc2l0aW9uIGF0dHJpYnV0ZSwgdHJlYXQgYXMgZnJ1c3R1bUN1bGxlZCBmYWxzZVxuICAgICAgICBpZiAoIW5vZGUuZ2VvbWV0cnkuYXR0cmlidXRlcy5wb3NpdGlvbikgcmV0dXJuIHRydWU7XG5cbiAgICAgICAgaWYgKCFub2RlLmdlb21ldHJ5LmJvdW5kcyB8fCBub2RlLmdlb21ldHJ5LmJvdW5kcy5yYWRpdXMgPT09IEluZmluaXR5KSBub2RlLmdlb21ldHJ5LmNvbXB1dGVCb3VuZGluZ1NwaGVyZSgpO1xuXG4gICAgICAgIGlmICghbm9kZS5nZW9tZXRyeS5ib3VuZHMpIHJldHVybiB0cnVlO1xuXG4gICAgICAgIGNvbnN0IGNlbnRlciA9IHRlbXBWZWMzYTtcbiAgICAgICAgY2VudGVyLmNvcHkobm9kZS5nZW9tZXRyeS5ib3VuZHMuY2VudGVyKTtcbiAgICAgICAgY2VudGVyLmFwcGx5TWF0cml4NChub2RlLndvcmxkTWF0cml4KTtcblxuICAgICAgICBjb25zdCByYWRpdXMgPSBub2RlLmdlb21ldHJ5LmJvdW5kcy5yYWRpdXMgKiBub2RlLndvcmxkTWF0cml4LmdldE1heFNjYWxlT25BeGlzKCk7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuZnJ1c3R1bUludGVyc2VjdHNTcGhlcmUoY2VudGVyLCByYWRpdXMpO1xuICAgIH1cblxuICAgIGZydXN0dW1JbnRlcnNlY3RzU3BoZXJlKGNlbnRlciwgcmFkaXVzKSB7XG4gICAgICAgIGNvbnN0IG5vcm1hbCA9IHRlbXBWZWMzYjtcblxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDY7IGkrKykge1xuICAgICAgICAgICAgY29uc3QgcGxhbmUgPSB0aGlzLmZydXN0dW1baV07XG4gICAgICAgICAgICBjb25zdCBkaXN0YW5jZSA9IG5vcm1hbC5jb3B5KHBsYW5lKS5kb3QoY2VudGVyKSArIHBsYW5lLmNvbnN0YW50O1xuICAgICAgICAgICAgaWYgKGRpc3RhbmNlIDwgLXJhZGl1cykgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbn1cbiIsIi8vIGF0dHJpYnV0ZSBwYXJhbXNcbi8vIHtcbi8vICAgICBkYXRhIC0gdHlwZWQgYXJyYXkgZWcgVUludDE2QXJyYXkgZm9yIGluZGljZXMsIEZsb2F0MzJBcnJheVxuLy8gICAgIHNpemUgLSBpbnQgZGVmYXVsdCAxXG4vLyAgICAgaW5zdGFuY2VkIC0gZGVmYXVsdCBudWxsLiBQYXNzIGRpdmlzb3IgYW1vdW50XG4vLyAgICAgdHlwZSAtIGdsIGVudW0gZGVmYXVsdCBnbC5VTlNJR05FRF9TSE9SVCBmb3IgJ2luZGV4JywgZ2wuRkxPQVQgZm9yIG90aGVyc1xuLy8gICAgIG5vcm1hbGl6ZWQgLSBib29sZWFuIGRlZmF1bHQgZmFsc2VcblxuLy8gICAgIGJ1ZmZlciAtIGdsIGJ1ZmZlciwgaWYgYnVmZmVyIGV4aXN0cywgZG9uJ3QgbmVlZCB0byBwcm92aWRlIGRhdGFcbi8vICAgICBzdHJpZGUgLSBkZWZhdWx0IDAgLSBmb3Igd2hlbiBwYXNzaW5nIGluIGJ1ZmZlclxuLy8gICAgIG9mZnNldCAtIGRlZmF1bHQgMCAtIGZvciB3aGVuIHBhc3NpbmcgaW4gYnVmZmVyXG4vLyAgICAgY291bnQgLSBkZWZhdWx0IG51bGwgLSBmb3Igd2hlbiBwYXNzaW5nIGluIGJ1ZmZlclxuLy8gICAgIG1pbiAtIGFycmF5IC0gZm9yIHdoZW4gcGFzc2luZyBpbiBidWZmZXJcbi8vICAgICBtYXggLSBhcnJheSAtIGZvciB3aGVuIHBhc3NpbmcgaW4gYnVmZmVyXG4vLyB9XG5cbi8vIFRPRE86IGZpdCBpbiB0cmFuc2Zvcm0gZmVlZGJhY2tcbi8vIFRPRE86IHdoZW4gd291bGQgSSBkaXNhYmxlVmVydGV4QXR0cmliQXJyYXkgP1xuLy8gVE9ETzogdXNlIG9mZnNldC9zdHJpZGUgaWYgZXhpc3RzXG5cbmltcG9ydCB7IFZlYzMgfSBmcm9tICcuLi9tYXRoL1ZlYzMuanMnO1xuXG5jb25zdCB0ZW1wVmVjMyA9IG5ldyBWZWMzKCk7XG5cbmxldCBJRCA9IDE7XG5sZXQgQVRUUl9JRCA9IDE7XG5cbi8vIFRvIHN0b3AgaW5pZmluaXRlIHdhcm5pbmdzXG5sZXQgaXNCb3VuZHNXYXJuZWQgPSBmYWxzZTtcblxuZXhwb3J0IGNsYXNzIEdlb21ldHJ5IHtcbiAgICBjb25zdHJ1Y3RvcihnbCwgYXR0cmlidXRlcyA9IHt9KSB7XG4gICAgICAgIGlmICghZ2wuY2FudmFzKSBjb25zb2xlLmVycm9yKCdnbCBub3QgcGFzc2VkIGFzIGZpcnN0IGFyZ3VtZW50IHRvIEdlb21ldHJ5Jyk7XG4gICAgICAgIHRoaXMuZ2wgPSBnbDtcbiAgICAgICAgdGhpcy5hdHRyaWJ1dGVzID0gYXR0cmlidXRlcztcbiAgICAgICAgdGhpcy5pZCA9IElEKys7XG5cbiAgICAgICAgLy8gU3RvcmUgb25lIFZBTyBwZXIgcHJvZ3JhbSBhdHRyaWJ1dGUgbG9jYXRpb25zIG9yZGVyXG4gICAgICAgIHRoaXMuVkFPcyA9IHt9O1xuXG4gICAgICAgIHRoaXMuZHJhd1JhbmdlID0geyBzdGFydDogMCwgY291bnQ6IDAgfTtcbiAgICAgICAgdGhpcy5pbnN0YW5jZWRDb3VudCA9IDA7XG5cbiAgICAgICAgLy8gVW5iaW5kIGN1cnJlbnQgVkFPIHNvIHRoYXQgbmV3IGJ1ZmZlcnMgZG9uJ3QgZ2V0IGFkZGVkIHRvIGFjdGl2ZSBtZXNoXG4gICAgICAgIHRoaXMuZ2wucmVuZGVyZXIuYmluZFZlcnRleEFycmF5KG51bGwpO1xuICAgICAgICB0aGlzLmdsLnJlbmRlcmVyLmN1cnJlbnRHZW9tZXRyeSA9IG51bGw7XG5cbiAgICAgICAgLy8gQWxpYXMgZm9yIHN0YXRlIHN0b3JlIHRvIGF2b2lkIHJlZHVuZGFudCBjYWxscyBmb3IgZ2xvYmFsIHN0YXRlXG4gICAgICAgIHRoaXMuZ2xTdGF0ZSA9IHRoaXMuZ2wucmVuZGVyZXIuc3RhdGU7XG5cbiAgICAgICAgLy8gY3JlYXRlIHRoZSBidWZmZXJzXG4gICAgICAgIGZvciAobGV0IGtleSBpbiBhdHRyaWJ1dGVzKSB7XG4gICAgICAgICAgICB0aGlzLmFkZEF0dHJpYnV0ZShrZXksIGF0dHJpYnV0ZXNba2V5XSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBhZGRBdHRyaWJ1dGUoa2V5LCBhdHRyKSB7XG4gICAgICAgIHRoaXMuYXR0cmlidXRlc1trZXldID0gYXR0cjtcblxuICAgICAgICAvLyBTZXQgb3B0aW9uc1xuICAgICAgICBhdHRyLmlkID0gQVRUUl9JRCsrOyAvLyBUT0RPOiBjdXJyZW50bHkgdW51c2VkLCByZW1vdmU/XG4gICAgICAgIGF0dHIuc2l6ZSA9IGF0dHIuc2l6ZSB8fCAxO1xuICAgICAgICBhdHRyLnR5cGUgPVxuICAgICAgICAgICAgYXR0ci50eXBlIHx8XG4gICAgICAgICAgICAoYXR0ci5kYXRhLmNvbnN0cnVjdG9yID09PSBGbG9hdDMyQXJyYXlcbiAgICAgICAgICAgICAgICA/IHRoaXMuZ2wuRkxPQVRcbiAgICAgICAgICAgICAgICA6IGF0dHIuZGF0YS5jb25zdHJ1Y3RvciA9PT0gVWludDE2QXJyYXlcbiAgICAgICAgICAgICAgICA/IHRoaXMuZ2wuVU5TSUdORURfU0hPUlRcbiAgICAgICAgICAgICAgICA6IHRoaXMuZ2wuVU5TSUdORURfSU5UKTsgLy8gVWludDMyQXJyYXlcbiAgICAgICAgYXR0ci50YXJnZXQgPSBrZXkgPT09ICdpbmRleCcgPyB0aGlzLmdsLkVMRU1FTlRfQVJSQVlfQlVGRkVSIDogdGhpcy5nbC5BUlJBWV9CVUZGRVI7XG4gICAgICAgIGF0dHIubm9ybWFsaXplZCA9IGF0dHIubm9ybWFsaXplZCB8fCBmYWxzZTtcbiAgICAgICAgYXR0ci5zdHJpZGUgPSBhdHRyLnN0cmlkZSB8fCAwO1xuICAgICAgICBhdHRyLm9mZnNldCA9IGF0dHIub2Zmc2V0IHx8IDA7XG4gICAgICAgIGF0dHIuY291bnQgPSBhdHRyLmNvdW50IHx8IChhdHRyLnN0cmlkZSA/IGF0dHIuZGF0YS5ieXRlTGVuZ3RoIC8gYXR0ci5zdHJpZGUgOiBhdHRyLmRhdGEubGVuZ3RoIC8gYXR0ci5zaXplKTtcbiAgICAgICAgYXR0ci5kaXZpc29yID0gYXR0ci5pbnN0YW5jZWQgfHwgMDtcbiAgICAgICAgYXR0ci5uZWVkc1VwZGF0ZSA9IGZhbHNlO1xuXG4gICAgICAgIGlmICghYXR0ci5idWZmZXIpIHtcbiAgICAgICAgICAgIGF0dHIuYnVmZmVyID0gdGhpcy5nbC5jcmVhdGVCdWZmZXIoKTtcblxuICAgICAgICAgICAgLy8gUHVzaCBkYXRhIHRvIGJ1ZmZlclxuICAgICAgICAgICAgdGhpcy51cGRhdGVBdHRyaWJ1dGUoYXR0cik7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBVcGRhdGUgZ2VvbWV0cnkgY291bnRzLiBJZiBpbmRleGVkLCBpZ25vcmUgcmVndWxhciBhdHRyaWJ1dGVzXG4gICAgICAgIGlmIChhdHRyLmRpdmlzb3IpIHtcbiAgICAgICAgICAgIHRoaXMuaXNJbnN0YW5jZWQgPSB0cnVlO1xuICAgICAgICAgICAgaWYgKHRoaXMuaW5zdGFuY2VkQ291bnQgJiYgdGhpcy5pbnN0YW5jZWRDb3VudCAhPT0gYXR0ci5jb3VudCAqIGF0dHIuZGl2aXNvcikge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignZ2VvbWV0cnkgaGFzIG11bHRpcGxlIGluc3RhbmNlZCBidWZmZXJzIG9mIGRpZmZlcmVudCBsZW5ndGgnKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gKHRoaXMuaW5zdGFuY2VkQ291bnQgPSBNYXRoLm1pbih0aGlzLmluc3RhbmNlZENvdW50LCBhdHRyLmNvdW50ICogYXR0ci5kaXZpc29yKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmluc3RhbmNlZENvdW50ID0gYXR0ci5jb3VudCAqIGF0dHIuZGl2aXNvcjtcbiAgICAgICAgfSBlbHNlIGlmIChrZXkgPT09ICdpbmRleCcpIHtcbiAgICAgICAgICAgIHRoaXMuZHJhd1JhbmdlLmNvdW50ID0gYXR0ci5jb3VudDtcbiAgICAgICAgfSBlbHNlIGlmICghdGhpcy5hdHRyaWJ1dGVzLmluZGV4KSB7XG4gICAgICAgICAgICB0aGlzLmRyYXdSYW5nZS5jb3VudCA9IE1hdGgubWF4KHRoaXMuZHJhd1JhbmdlLmNvdW50LCBhdHRyLmNvdW50KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHVwZGF0ZUF0dHJpYnV0ZShhdHRyKSB7XG4gICAgICAgIGlmICh0aGlzLmdsU3RhdGUuYm91bmRCdWZmZXIgIT09IGF0dHIuYnVmZmVyKSB7XG4gICAgICAgICAgICB0aGlzLmdsLmJpbmRCdWZmZXIoYXR0ci50YXJnZXQsIGF0dHIuYnVmZmVyKTtcbiAgICAgICAgICAgIHRoaXMuZ2xTdGF0ZS5ib3VuZEJ1ZmZlciA9IGF0dHIuYnVmZmVyO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZ2wuYnVmZmVyRGF0YShhdHRyLnRhcmdldCwgYXR0ci5kYXRhLCB0aGlzLmdsLlNUQVRJQ19EUkFXKTtcbiAgICAgICAgYXR0ci5uZWVkc1VwZGF0ZSA9IGZhbHNlO1xuICAgIH1cblxuICAgIHNldEluZGV4KHZhbHVlKSB7XG4gICAgICAgIHRoaXMuYWRkQXR0cmlidXRlKCdpbmRleCcsIHZhbHVlKTtcbiAgICB9XG5cbiAgICBzZXREcmF3UmFuZ2Uoc3RhcnQsIGNvdW50KSB7XG4gICAgICAgIHRoaXMuZHJhd1JhbmdlLnN0YXJ0ID0gc3RhcnQ7XG4gICAgICAgIHRoaXMuZHJhd1JhbmdlLmNvdW50ID0gY291bnQ7XG4gICAgfVxuXG4gICAgc2V0SW5zdGFuY2VkQ291bnQodmFsdWUpIHtcbiAgICAgICAgdGhpcy5pbnN0YW5jZWRDb3VudCA9IHZhbHVlO1xuICAgIH1cblxuICAgIGNyZWF0ZVZBTyhwcm9ncmFtKSB7XG4gICAgICAgIHRoaXMuVkFPc1twcm9ncmFtLmF0dHJpYnV0ZU9yZGVyXSA9IHRoaXMuZ2wucmVuZGVyZXIuY3JlYXRlVmVydGV4QXJyYXkoKTtcbiAgICAgICAgdGhpcy5nbC5yZW5kZXJlci5iaW5kVmVydGV4QXJyYXkodGhpcy5WQU9zW3Byb2dyYW0uYXR0cmlidXRlT3JkZXJdKTtcbiAgICAgICAgdGhpcy5iaW5kQXR0cmlidXRlcyhwcm9ncmFtKTtcbiAgICB9XG5cbiAgICBiaW5kQXR0cmlidXRlcyhwcm9ncmFtKSB7XG4gICAgICAgIC8vIExpbmsgYWxsIGF0dHJpYnV0ZXMgdG8gcHJvZ3JhbSB1c2luZyBnbC52ZXJ0ZXhBdHRyaWJQb2ludGVyXG4gICAgICAgIHByb2dyYW0uYXR0cmlidXRlTG9jYXRpb25zLmZvckVhY2goKGxvY2F0aW9uLCB7IG5hbWUsIHR5cGUgfSkgPT4ge1xuICAgICAgICAgICAgLy8gSWYgZ2VvbWV0cnkgbWlzc2luZyBhIHJlcXVpcmVkIHNoYWRlciBhdHRyaWJ1dGVcbiAgICAgICAgICAgIGlmICghdGhpcy5hdHRyaWJ1dGVzW25hbWVdKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGBhY3RpdmUgYXR0cmlidXRlICR7bmFtZX0gbm90IGJlaW5nIHN1cHBsaWVkYCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCBhdHRyID0gdGhpcy5hdHRyaWJ1dGVzW25hbWVdO1xuXG4gICAgICAgICAgICB0aGlzLmdsLmJpbmRCdWZmZXIoYXR0ci50YXJnZXQsIGF0dHIuYnVmZmVyKTtcbiAgICAgICAgICAgIHRoaXMuZ2xTdGF0ZS5ib3VuZEJ1ZmZlciA9IGF0dHIuYnVmZmVyO1xuXG4gICAgICAgICAgICAvLyBGb3IgbWF0cml4IGF0dHJpYnV0ZXMsIGJ1ZmZlciBuZWVkcyB0byBiZSBkZWZpbmVkIHBlciBjb2x1bW5cbiAgICAgICAgICAgIGxldCBudW1Mb2MgPSAxO1xuICAgICAgICAgICAgaWYgKHR5cGUgPT09IDM1Njc0KSBudW1Mb2MgPSAyOyAvLyBtYXQyXG4gICAgICAgICAgICBpZiAodHlwZSA9PT0gMzU2NzUpIG51bUxvYyA9IDM7IC8vIG1hdDNcbiAgICAgICAgICAgIGlmICh0eXBlID09PSAzNTY3NikgbnVtTG9jID0gNDsgLy8gbWF0NFxuXG4gICAgICAgICAgICBjb25zdCBzaXplID0gYXR0ci5zaXplIC8gbnVtTG9jO1xuICAgICAgICAgICAgY29uc3Qgc3RyaWRlID0gbnVtTG9jID09PSAxID8gMCA6IG51bUxvYyAqIG51bUxvYyAqIG51bUxvYztcbiAgICAgICAgICAgIGNvbnN0IG9mZnNldCA9IG51bUxvYyA9PT0gMSA/IDAgOiBudW1Mb2MgKiBudW1Mb2M7XG5cbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbnVtTG9jOyBpKyspIHtcbiAgICAgICAgICAgICAgICB0aGlzLmdsLnZlcnRleEF0dHJpYlBvaW50ZXIobG9jYXRpb24gKyBpLCBzaXplLCBhdHRyLnR5cGUsIGF0dHIubm9ybWFsaXplZCwgYXR0ci5zdHJpZGUgKyBzdHJpZGUsIGF0dHIub2Zmc2V0ICsgaSAqIG9mZnNldCk7XG4gICAgICAgICAgICAgICAgdGhpcy5nbC5lbmFibGVWZXJ0ZXhBdHRyaWJBcnJheShsb2NhdGlvbiArIGkpO1xuXG4gICAgICAgICAgICAgICAgLy8gRm9yIGluc3RhbmNlZCBhdHRyaWJ1dGVzLCBkaXZpc29yIG5lZWRzIHRvIGJlIHNldC5cbiAgICAgICAgICAgICAgICAvLyBGb3IgZmlyZWZveCwgbmVlZCB0byBzZXQgYmFjayB0byAwIGlmIG5vbi1pbnN0YW5jZWQgZHJhd24gYWZ0ZXIgaW5zdGFuY2VkLiBFbHNlIHdvbid0IHJlbmRlclxuICAgICAgICAgICAgICAgIHRoaXMuZ2wucmVuZGVyZXIudmVydGV4QXR0cmliRGl2aXNvcihsb2NhdGlvbiArIGksIGF0dHIuZGl2aXNvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIEJpbmQgaW5kaWNlcyBpZiBnZW9tZXRyeSBpbmRleGVkXG4gICAgICAgIGlmICh0aGlzLmF0dHJpYnV0ZXMuaW5kZXgpIHRoaXMuZ2wuYmluZEJ1ZmZlcih0aGlzLmdsLkVMRU1FTlRfQVJSQVlfQlVGRkVSLCB0aGlzLmF0dHJpYnV0ZXMuaW5kZXguYnVmZmVyKTtcbiAgICB9XG5cbiAgICBkcmF3KHsgcHJvZ3JhbSwgbW9kZSA9IHRoaXMuZ2wuVFJJQU5HTEVTIH0pIHtcbiAgICAgICAgaWYgKHRoaXMuZ2wucmVuZGVyZXIuY3VycmVudEdlb21ldHJ5ICE9PSBgJHt0aGlzLmlkfV8ke3Byb2dyYW0uYXR0cmlidXRlT3JkZXJ9YCkge1xuICAgICAgICAgICAgaWYgKCF0aGlzLlZBT3NbcHJvZ3JhbS5hdHRyaWJ1dGVPcmRlcl0pIHRoaXMuY3JlYXRlVkFPKHByb2dyYW0pO1xuICAgICAgICAgICAgdGhpcy5nbC5yZW5kZXJlci5iaW5kVmVydGV4QXJyYXkodGhpcy5WQU9zW3Byb2dyYW0uYXR0cmlidXRlT3JkZXJdKTtcbiAgICAgICAgICAgIHRoaXMuZ2wucmVuZGVyZXIuY3VycmVudEdlb21ldHJ5ID0gYCR7dGhpcy5pZH1fJHtwcm9ncmFtLmF0dHJpYnV0ZU9yZGVyfWA7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBDaGVjayBpZiBhbnkgYXR0cmlidXRlcyBuZWVkIHVwZGF0aW5nXG4gICAgICAgIHByb2dyYW0uYXR0cmlidXRlTG9jYXRpb25zLmZvckVhY2goKGxvY2F0aW9uLCB7IG5hbWUgfSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgYXR0ciA9IHRoaXMuYXR0cmlidXRlc1tuYW1lXTtcbiAgICAgICAgICAgIGlmIChhdHRyLm5lZWRzVXBkYXRlKSB0aGlzLnVwZGF0ZUF0dHJpYnV0ZShhdHRyKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKHRoaXMuaXNJbnN0YW5jZWQpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmF0dHJpYnV0ZXMuaW5kZXgpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmdsLnJlbmRlcmVyLmRyYXdFbGVtZW50c0luc3RhbmNlZChcbiAgICAgICAgICAgICAgICAgICAgbW9kZSxcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kcmF3UmFuZ2UuY291bnQsXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYXR0cmlidXRlcy5pbmRleC50eXBlLFxuICAgICAgICAgICAgICAgICAgICB0aGlzLmF0dHJpYnV0ZXMuaW5kZXgub2Zmc2V0ICsgdGhpcy5kcmF3UmFuZ2Uuc3RhcnQgKiAyLFxuICAgICAgICAgICAgICAgICAgICB0aGlzLmluc3RhbmNlZENvdW50XG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5nbC5yZW5kZXJlci5kcmF3QXJyYXlzSW5zdGFuY2VkKG1vZGUsIHRoaXMuZHJhd1JhbmdlLnN0YXJ0LCB0aGlzLmRyYXdSYW5nZS5jb3VudCwgdGhpcy5pbnN0YW5jZWRDb3VudCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAodGhpcy5hdHRyaWJ1dGVzLmluZGV4KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5nbC5kcmF3RWxlbWVudHMobW9kZSwgdGhpcy5kcmF3UmFuZ2UuY291bnQsIHRoaXMuYXR0cmlidXRlcy5pbmRleC50eXBlLCB0aGlzLmF0dHJpYnV0ZXMuaW5kZXgub2Zmc2V0ICsgdGhpcy5kcmF3UmFuZ2Uuc3RhcnQgKiAyKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5nbC5kcmF3QXJyYXlzKG1vZGUsIHRoaXMuZHJhd1JhbmdlLnN0YXJ0LCB0aGlzLmRyYXdSYW5nZS5jb3VudCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBnZXRQb3NpdGlvbkFycmF5KCkge1xuICAgICAgICAvLyBVc2UgcG9zaXRpb24gYnVmZmVyLCBvciBtaW4vbWF4IGlmIGF2YWlsYWJsZVxuICAgICAgICBjb25zdCBhdHRyID0gdGhpcy5hdHRyaWJ1dGVzLnBvc2l0aW9uO1xuICAgICAgICAvLyBpZiAoYXR0ci5taW4pIHJldHVybiBbLi4uYXR0ci5taW4sIC4uLmF0dHIubWF4XTtcbiAgICAgICAgaWYgKGF0dHIuZGF0YSkgcmV0dXJuIGF0dHIuZGF0YTtcbiAgICAgICAgaWYgKGlzQm91bmRzV2FybmVkKSByZXR1cm47XG4gICAgICAgIGNvbnNvbGUud2FybignTm8gcG9zaXRpb24gYnVmZmVyIGRhdGEgZm91bmQgdG8gY29tcHV0ZSBib3VuZHMnKTtcbiAgICAgICAgcmV0dXJuIChpc0JvdW5kc1dhcm5lZCA9IHRydWUpO1xuICAgIH1cblxuICAgIGNvbXB1dGVCb3VuZGluZ0JveChhcnJheSkge1xuICAgICAgICBpZiAoIWFycmF5KSBhcnJheSA9IHRoaXMuZ2V0UG9zaXRpb25BcnJheSgpO1xuXG4gICAgICAgIGlmICghdGhpcy5ib3VuZHMpIHtcbiAgICAgICAgICAgIHRoaXMuYm91bmRzID0ge1xuICAgICAgICAgICAgICAgIG1pbjogbmV3IFZlYzMoKSxcbiAgICAgICAgICAgICAgICBtYXg6IG5ldyBWZWMzKCksXG4gICAgICAgICAgICAgICAgY2VudGVyOiBuZXcgVmVjMygpLFxuICAgICAgICAgICAgICAgIHNjYWxlOiBuZXcgVmVjMygpLFxuICAgICAgICAgICAgICAgIHJhZGl1czogSW5maW5pdHksXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgbWluID0gdGhpcy5ib3VuZHMubWluO1xuICAgICAgICBjb25zdCBtYXggPSB0aGlzLmJvdW5kcy5tYXg7XG4gICAgICAgIGNvbnN0IGNlbnRlciA9IHRoaXMuYm91bmRzLmNlbnRlcjtcbiAgICAgICAgY29uc3Qgc2NhbGUgPSB0aGlzLmJvdW5kcy5zY2FsZTtcblxuICAgICAgICBtaW4uc2V0KCtJbmZpbml0eSk7XG4gICAgICAgIG1heC5zZXQoLUluZmluaXR5KTtcblxuICAgICAgICAvLyBUT0RPOiB1c2Ugb2Zmc2V0L3N0cmlkZSBpZiBleGlzdHNcbiAgICAgICAgLy8gVE9ETzogY2hlY2sgc2l6ZSBvZiBwb3NpdGlvbiAoZWcgdHJpYW5nbGUgd2l0aCBWZWMyKVxuICAgICAgICBmb3IgKGxldCBpID0gMCwgbCA9IGFycmF5Lmxlbmd0aDsgaSA8IGw7IGkgKz0gMykge1xuICAgICAgICAgICAgY29uc3QgeCA9IGFycmF5W2ldO1xuICAgICAgICAgICAgY29uc3QgeSA9IGFycmF5W2kgKyAxXTtcbiAgICAgICAgICAgIGNvbnN0IHogPSBhcnJheVtpICsgMl07XG5cbiAgICAgICAgICAgIG1pbi54ID0gTWF0aC5taW4oeCwgbWluLngpO1xuICAgICAgICAgICAgbWluLnkgPSBNYXRoLm1pbih5LCBtaW4ueSk7XG4gICAgICAgICAgICBtaW4ueiA9IE1hdGgubWluKHosIG1pbi56KTtcblxuICAgICAgICAgICAgbWF4LnggPSBNYXRoLm1heCh4LCBtYXgueCk7XG4gICAgICAgICAgICBtYXgueSA9IE1hdGgubWF4KHksIG1heC55KTtcbiAgICAgICAgICAgIG1heC56ID0gTWF0aC5tYXgoeiwgbWF4LnopO1xuICAgICAgICB9XG5cbiAgICAgICAgc2NhbGUuc3ViKG1heCwgbWluKTtcbiAgICAgICAgY2VudGVyLmFkZChtaW4sIG1heCkuZGl2aWRlKDIpO1xuICAgIH1cblxuICAgIGNvbXB1dGVCb3VuZGluZ1NwaGVyZShhcnJheSkge1xuICAgICAgICBpZiAoIWFycmF5KSBhcnJheSA9IHRoaXMuZ2V0UG9zaXRpb25BcnJheSgpO1xuICAgICAgICBpZiAoIXRoaXMuYm91bmRzKSB0aGlzLmNvbXB1dGVCb3VuZGluZ0JveChhcnJheSk7XG5cbiAgICAgICAgbGV0IG1heFJhZGl1c1NxID0gMDtcbiAgICAgICAgZm9yIChsZXQgaSA9IDAsIGwgPSBhcnJheS5sZW5ndGg7IGkgPCBsOyBpICs9IDMpIHtcbiAgICAgICAgICAgIHRlbXBWZWMzLmZyb21BcnJheShhcnJheSwgaSk7XG4gICAgICAgICAgICBtYXhSYWRpdXNTcSA9IE1hdGgubWF4KG1heFJhZGl1c1NxLCB0aGlzLmJvdW5kcy5jZW50ZXIuc3F1YXJlZERpc3RhbmNlKHRlbXBWZWMzKSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmJvdW5kcy5yYWRpdXMgPSBNYXRoLnNxcnQobWF4UmFkaXVzU3EpO1xuICAgIH1cblxuICAgIHJlbW92ZSgpIHtcbiAgICAgICAgaWYgKHRoaXMudmFvKSB0aGlzLmdsLnJlbmRlcmVyLmRlbGV0ZVZlcnRleEFycmF5KHRoaXMudmFvKTtcbiAgICAgICAgZm9yIChsZXQga2V5IGluIHRoaXMuYXR0cmlidXRlcykge1xuICAgICAgICAgICAgdGhpcy5nbC5kZWxldGVCdWZmZXIodGhpcy5hdHRyaWJ1dGVzW2tleV0uYnVmZmVyKTtcbiAgICAgICAgICAgIGRlbGV0ZSB0aGlzLmF0dHJpYnV0ZXNba2V5XTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsImltcG9ydCB7IFRyYW5zZm9ybSB9IGZyb20gJy4vVHJhbnNmb3JtLmpzJztcbmltcG9ydCB7IE1hdDMgfSBmcm9tICcuLi9tYXRoL01hdDMuanMnO1xuaW1wb3J0IHsgTWF0NCB9IGZyb20gJy4uL21hdGgvTWF0NC5qcyc7XG5cbmxldCBJRCA9IDA7XG5cbmV4cG9ydCBjbGFzcyBNZXNoIGV4dGVuZHMgVHJhbnNmb3JtIHtcbiAgICBjb25zdHJ1Y3RvcihnbCwgeyBnZW9tZXRyeSwgcHJvZ3JhbSwgbW9kZSA9IGdsLlRSSUFOR0xFUywgZnJ1c3R1bUN1bGxlZCA9IHRydWUsIHJlbmRlck9yZGVyID0gMCB9ID0ge30pIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgaWYgKCFnbC5jYW52YXMpIGNvbnNvbGUuZXJyb3IoJ2dsIG5vdCBwYXNzZWQgYXMgZmlyc3QgYXJndW1lbnQgdG8gTWVzaCcpO1xuICAgICAgICB0aGlzLmdsID0gZ2w7XG4gICAgICAgIHRoaXMuaWQgPSBJRCsrO1xuICAgICAgICB0aGlzLmdlb21ldHJ5ID0gZ2VvbWV0cnk7XG4gICAgICAgIHRoaXMucHJvZ3JhbSA9IHByb2dyYW07XG4gICAgICAgIHRoaXMubW9kZSA9IG1vZGU7XG5cbiAgICAgICAgLy8gVXNlZCB0byBza2lwIGZydXN0dW0gY3VsbGluZ1xuICAgICAgICB0aGlzLmZydXN0dW1DdWxsZWQgPSBmcnVzdHVtQ3VsbGVkO1xuXG4gICAgICAgIC8vIE92ZXJyaWRlIHNvcnRpbmcgdG8gZm9yY2UgYW4gb3JkZXJcbiAgICAgICAgdGhpcy5yZW5kZXJPcmRlciA9IHJlbmRlck9yZGVyO1xuICAgICAgICB0aGlzLm1vZGVsVmlld01hdHJpeCA9IG5ldyBNYXQ0KCk7XG4gICAgICAgIHRoaXMubm9ybWFsTWF0cml4ID0gbmV3IE1hdDMoKTtcbiAgICAgICAgdGhpcy5iZWZvcmVSZW5kZXJDYWxsYmFja3MgPSBbXTtcbiAgICAgICAgdGhpcy5hZnRlclJlbmRlckNhbGxiYWNrcyA9IFtdO1xuICAgIH1cblxuICAgIG9uQmVmb3JlUmVuZGVyKGYpIHtcbiAgICAgICAgdGhpcy5iZWZvcmVSZW5kZXJDYWxsYmFja3MucHVzaChmKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgb25BZnRlclJlbmRlcihmKSB7XG4gICAgICAgIHRoaXMuYWZ0ZXJSZW5kZXJDYWxsYmFja3MucHVzaChmKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgZHJhdyh7IGNhbWVyYSwgb3ZlcnJpZGVQcm9ncmFtIH0gPSB7fSkge1xuICAgICAgICB0aGlzLmJlZm9yZVJlbmRlckNhbGxiYWNrcy5mb3JFYWNoKChmKSA9PiBmICYmIGYoeyBtZXNoOiB0aGlzLCBjYW1lcmEgfSkpO1xuICAgICAgICBjb25zdCB1c2VkUHJvZ3JhbSA9IG92ZXJyaWRlUHJvZ3JhbSB8fCB0aGlzLnByb2dyYW07XG4gICAgICAgIGlmIChjYW1lcmEpIHtcbiAgICAgICAgICAgIC8vIEFkZCBlbXB0eSBtYXRyaXggdW5pZm9ybXMgdG8gcHJvZ3JhbSBpZiB1bnNldFxuICAgICAgICAgICAgaWYgKCF1c2VkUHJvZ3JhbS51bmlmb3Jtcy5tb2RlbE1hdHJpeCkge1xuICAgICAgICAgICAgICAgIE9iamVjdC5hc3NpZ24odXNlZFByb2dyYW0udW5pZm9ybXMsIHtcbiAgICAgICAgICAgICAgICAgICAgbW9kZWxNYXRyaXg6IHsgdmFsdWU6IG51bGwgfSxcbiAgICAgICAgICAgICAgICAgICAgdmlld01hdHJpeDogeyB2YWx1ZTogbnVsbCB9LFxuICAgICAgICAgICAgICAgICAgICBtb2RlbFZpZXdNYXRyaXg6IHsgdmFsdWU6IG51bGwgfSxcbiAgICAgICAgICAgICAgICAgICAgbm9ybWFsTWF0cml4OiB7IHZhbHVlOiBudWxsIH0sXG4gICAgICAgICAgICAgICAgICAgIHByb2plY3Rpb25NYXRyaXg6IHsgdmFsdWU6IG51bGwgfSxcbiAgICAgICAgICAgICAgICAgICAgY2FtZXJhUG9zaXRpb246IHsgdmFsdWU6IG51bGwgfSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gU2V0IHRoZSBtYXRyaXggdW5pZm9ybXNcbiAgICAgICAgICAgIHVzZWRQcm9ncmFtLnVuaWZvcm1zLnByb2plY3Rpb25NYXRyaXgudmFsdWUgPSBjYW1lcmEucHJvamVjdGlvbk1hdHJpeDtcbiAgICAgICAgICAgIHVzZWRQcm9ncmFtLnVuaWZvcm1zLmNhbWVyYVBvc2l0aW9uLnZhbHVlID0gY2FtZXJhLndvcmxkUG9zaXRpb247XG4gICAgICAgICAgICB1c2VkUHJvZ3JhbS51bmlmb3Jtcy52aWV3TWF0cml4LnZhbHVlID0gY2FtZXJhLnZpZXdNYXRyaXg7XG4gICAgICAgICAgICB0aGlzLm1vZGVsVmlld01hdHJpeC5tdWx0aXBseShjYW1lcmEudmlld01hdHJpeCwgdGhpcy53b3JsZE1hdHJpeCk7XG4gICAgICAgICAgICB0aGlzLm5vcm1hbE1hdHJpeC5nZXROb3JtYWxNYXRyaXgodGhpcy5tb2RlbFZpZXdNYXRyaXgpO1xuICAgICAgICAgICAgdXNlZFByb2dyYW0udW5pZm9ybXMubW9kZWxNYXRyaXgudmFsdWUgPSB0aGlzLndvcmxkTWF0cml4O1xuICAgICAgICAgICAgdXNlZFByb2dyYW0udW5pZm9ybXMubW9kZWxWaWV3TWF0cml4LnZhbHVlID0gdGhpcy5tb2RlbFZpZXdNYXRyaXg7XG4gICAgICAgICAgICB1c2VkUHJvZ3JhbS51bmlmb3Jtcy5ub3JtYWxNYXRyaXgudmFsdWUgPSB0aGlzLm5vcm1hbE1hdHJpeDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGRldGVybWluZSBpZiBmYWNlcyBuZWVkIHRvIGJlIGZsaXBwZWQgLSB3aGVuIG1lc2ggc2NhbGVkIG5lZ2F0aXZlbHlcbiAgICAgICAgbGV0IGZsaXBGYWNlcyA9IHVzZWRQcm9ncmFtLmN1bGxGYWNlICYmIHRoaXMud29ybGRNYXRyaXguZGV0ZXJtaW5hbnQoKSA8IDA7XG4gICAgICAgIHVzZWRQcm9ncmFtLnVzZSh7IGZsaXBGYWNlcyB9KTtcbiAgICAgICAgdGhpcy5nZW9tZXRyeS5kcmF3KHsgbW9kZTogdGhpcy5tb2RlLCBwcm9ncmFtOiB1c2VkUHJvZ3JhbSB9KTtcbiAgICAgICAgdGhpcy5hZnRlclJlbmRlckNhbGxiYWNrcy5mb3JFYWNoKChmKSA9PiBmICYmIGYoeyBtZXNoOiB0aGlzLCBjYW1lcmEgfSkpO1xuICAgIH1cbn1cbiIsIi8vIFRPRE86IHVwbG9hZCBlbXB0eSB0ZXh0dXJlIGlmIG51bGwgPyBtYXliZSBub3Rcbi8vIFRPRE86IHVwbG9hZCBpZGVudGl0eSBtYXRyaXggaWYgbnVsbCA/XG4vLyBUT0RPOiBzYW1wbGVyIEN1YmVcblxubGV0IElEID0gMTtcblxuLy8gY2FjaGUgb2YgdHlwZWQgYXJyYXlzIHVzZWQgdG8gZmxhdHRlbiB1bmlmb3JtIGFycmF5c1xuY29uc3QgYXJyYXlDYWNoZUYzMiA9IHt9O1xuXG5leHBvcnQgY2xhc3MgUHJvZ3JhbSB7XG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIGdsLFxuICAgICAgICB7XG4gICAgICAgICAgICB2ZXJ0ZXgsXG4gICAgICAgICAgICBmcmFnbWVudCxcbiAgICAgICAgICAgIHVuaWZvcm1zID0ge30sXG5cbiAgICAgICAgICAgIHRyYW5zcGFyZW50ID0gZmFsc2UsXG4gICAgICAgICAgICBjdWxsRmFjZSA9IGdsLkJBQ0ssXG4gICAgICAgICAgICBmcm9udEZhY2UgPSBnbC5DQ1csXG4gICAgICAgICAgICBkZXB0aFRlc3QgPSB0cnVlLFxuICAgICAgICAgICAgZGVwdGhXcml0ZSA9IHRydWUsXG4gICAgICAgICAgICBkZXB0aEZ1bmMgPSBnbC5MRVNTLFxuICAgICAgICB9ID0ge31cbiAgICApIHtcbiAgICAgICAgaWYgKCFnbC5jYW52YXMpIGNvbnNvbGUuZXJyb3IoJ2dsIG5vdCBwYXNzZWQgYXMgZmlzdCBhcmd1bWVudCB0byBQcm9ncmFtJyk7XG4gICAgICAgIHRoaXMuZ2wgPSBnbDtcbiAgICAgICAgdGhpcy51bmlmb3JtcyA9IHVuaWZvcm1zO1xuICAgICAgICB0aGlzLmlkID0gSUQrKztcblxuICAgICAgICBpZiAoIXZlcnRleCkgY29uc29sZS53YXJuKCd2ZXJ0ZXggc2hhZGVyIG5vdCBzdXBwbGllZCcpO1xuICAgICAgICBpZiAoIWZyYWdtZW50KSBjb25zb2xlLndhcm4oJ2ZyYWdtZW50IHNoYWRlciBub3Qgc3VwcGxpZWQnKTtcblxuICAgICAgICAvLyBTdG9yZSBwcm9ncmFtIHN0YXRlXG4gICAgICAgIHRoaXMudHJhbnNwYXJlbnQgPSB0cmFuc3BhcmVudDtcbiAgICAgICAgdGhpcy5jdWxsRmFjZSA9IGN1bGxGYWNlO1xuICAgICAgICB0aGlzLmZyb250RmFjZSA9IGZyb250RmFjZTtcbiAgICAgICAgdGhpcy5kZXB0aFRlc3QgPSBkZXB0aFRlc3Q7XG4gICAgICAgIHRoaXMuZGVwdGhXcml0ZSA9IGRlcHRoV3JpdGU7XG4gICAgICAgIHRoaXMuZGVwdGhGdW5jID0gZGVwdGhGdW5jO1xuICAgICAgICB0aGlzLmJsZW5kRnVuYyA9IHt9O1xuICAgICAgICB0aGlzLmJsZW5kRXF1YXRpb24gPSB7fTtcbiAgICAgICAgdGhpcy51bmlmb3JtTG9jYXRpb25zID0gbmV3IE1hcCgpO1xuICAgICAgICB0aGlzLmF0dHJpYnV0ZUxvY2F0aW9ucyA9IG5ldyBNYXAoKTtcblxuICAgICAgICAvLyBzZXQgZGVmYXVsdCBibGVuZEZ1bmMgaWYgdHJhbnNwYXJlbnQgZmxhZ2dlZFxuICAgICAgICBpZiAodGhpcy50cmFuc3BhcmVudCAmJiAhdGhpcy5ibGVuZEZ1bmMuc3JjKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5nbC5yZW5kZXJlci5wcmVtdWx0aXBsaWVkQWxwaGEpIHRoaXMuc2V0QmxlbmRGdW5jKHRoaXMuZ2wuT05FLCB0aGlzLmdsLk9ORV9NSU5VU19TUkNfQUxQSEEpO1xuICAgICAgICAgICAgZWxzZSB0aGlzLnNldEJsZW5kRnVuYyh0aGlzLmdsLlNSQ19BTFBIQSwgdGhpcy5nbC5PTkVfTUlOVVNfU1JDX0FMUEhBKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGNvbXBpbGUgdmVydGV4IHNoYWRlciBhbmQgbG9nIGVycm9yc1xuICAgICAgICBjb25zdCB2ZXJ0ZXhTaGFkZXIgPSBnbC5jcmVhdGVTaGFkZXIoZ2wuVkVSVEVYX1NIQURFUik7XG4gICAgICAgIGdsLnNoYWRlclNvdXJjZSh2ZXJ0ZXhTaGFkZXIsIHZlcnRleCk7XG4gICAgICAgIGdsLmNvbXBpbGVTaGFkZXIodmVydGV4U2hhZGVyKTtcbiAgICAgICAgaWYgKGdsLmdldFNoYWRlckluZm9Mb2codmVydGV4U2hhZGVyKSAhPT0gJycpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgJHtnbC5nZXRTaGFkZXJJbmZvTG9nKHZlcnRleFNoYWRlcil9XFxuVmVydGV4IFNoYWRlclxcbiR7YWRkTGluZU51bWJlcnModmVydGV4KX1gKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGNvbXBpbGUgZnJhZ21lbnQgc2hhZGVyIGFuZCBsb2cgZXJyb3JzXG4gICAgICAgIGNvbnN0IGZyYWdtZW50U2hhZGVyID0gZ2wuY3JlYXRlU2hhZGVyKGdsLkZSQUdNRU5UX1NIQURFUik7XG4gICAgICAgIGdsLnNoYWRlclNvdXJjZShmcmFnbWVudFNoYWRlciwgZnJhZ21lbnQpO1xuICAgICAgICBnbC5jb21waWxlU2hhZGVyKGZyYWdtZW50U2hhZGVyKTtcbiAgICAgICAgaWYgKGdsLmdldFNoYWRlckluZm9Mb2coZnJhZ21lbnRTaGFkZXIpICE9PSAnJykge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGAke2dsLmdldFNoYWRlckluZm9Mb2coZnJhZ21lbnRTaGFkZXIpfVxcbkZyYWdtZW50IFNoYWRlclxcbiR7YWRkTGluZU51bWJlcnMoZnJhZ21lbnQpfWApO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gY29tcGlsZSBwcm9ncmFtIGFuZCBsb2cgZXJyb3JzXG4gICAgICAgIHRoaXMucHJvZ3JhbSA9IGdsLmNyZWF0ZVByb2dyYW0oKTtcbiAgICAgICAgZ2wuYXR0YWNoU2hhZGVyKHRoaXMucHJvZ3JhbSwgdmVydGV4U2hhZGVyKTtcbiAgICAgICAgZ2wuYXR0YWNoU2hhZGVyKHRoaXMucHJvZ3JhbSwgZnJhZ21lbnRTaGFkZXIpO1xuICAgICAgICBnbC5saW5rUHJvZ3JhbSh0aGlzLnByb2dyYW0pO1xuICAgICAgICBpZiAoIWdsLmdldFByb2dyYW1QYXJhbWV0ZXIodGhpcy5wcm9ncmFtLCBnbC5MSU5LX1NUQVRVUykpIHtcbiAgICAgICAgICAgIHJldHVybiBjb25zb2xlLndhcm4oZ2wuZ2V0UHJvZ3JhbUluZm9Mb2codGhpcy5wcm9ncmFtKSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBSZW1vdmUgc2hhZGVyIG9uY2UgbGlua2VkXG4gICAgICAgIGdsLmRlbGV0ZVNoYWRlcih2ZXJ0ZXhTaGFkZXIpO1xuICAgICAgICBnbC5kZWxldGVTaGFkZXIoZnJhZ21lbnRTaGFkZXIpO1xuXG4gICAgICAgIC8vIEdldCBhY3RpdmUgdW5pZm9ybSBsb2NhdGlvbnNcbiAgICAgICAgbGV0IG51bVVuaWZvcm1zID0gZ2wuZ2V0UHJvZ3JhbVBhcmFtZXRlcih0aGlzLnByb2dyYW0sIGdsLkFDVElWRV9VTklGT1JNUyk7XG4gICAgICAgIGZvciAobGV0IHVJbmRleCA9IDA7IHVJbmRleCA8IG51bVVuaWZvcm1zOyB1SW5kZXgrKykge1xuICAgICAgICAgICAgbGV0IHVuaWZvcm0gPSBnbC5nZXRBY3RpdmVVbmlmb3JtKHRoaXMucHJvZ3JhbSwgdUluZGV4KTtcbiAgICAgICAgICAgIHRoaXMudW5pZm9ybUxvY2F0aW9ucy5zZXQodW5pZm9ybSwgZ2wuZ2V0VW5pZm9ybUxvY2F0aW9uKHRoaXMucHJvZ3JhbSwgdW5pZm9ybS5uYW1lKSk7XG5cbiAgICAgICAgICAgIC8vIHNwbGl0IHVuaWZvcm1zJyBuYW1lcyB0byBzZXBhcmF0ZSBhcnJheSBhbmQgc3RydWN0IGRlY2xhcmF0aW9uc1xuICAgICAgICAgICAgY29uc3Qgc3BsaXQgPSB1bmlmb3JtLm5hbWUubWF0Y2goLyhcXHcrKS9nKTtcblxuICAgICAgICAgICAgdW5pZm9ybS51bmlmb3JtTmFtZSA9IHNwbGl0WzBdO1xuXG4gICAgICAgICAgICBpZiAoc3BsaXQubGVuZ3RoID09PSAzKSB7XG4gICAgICAgICAgICAgICAgdW5pZm9ybS5pc1N0cnVjdEFycmF5ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB1bmlmb3JtLnN0cnVjdEluZGV4ID0gTnVtYmVyKHNwbGl0WzFdKTtcbiAgICAgICAgICAgICAgICB1bmlmb3JtLnN0cnVjdFByb3BlcnR5ID0gc3BsaXRbMl07XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHNwbGl0Lmxlbmd0aCA9PT0gMiAmJiBpc05hTihOdW1iZXIoc3BsaXRbMV0pKSkge1xuICAgICAgICAgICAgICAgIHVuaWZvcm0uaXNTdHJ1Y3QgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHVuaWZvcm0uc3RydWN0UHJvcGVydHkgPSBzcGxpdFsxXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEdldCBhY3RpdmUgYXR0cmlidXRlIGxvY2F0aW9uc1xuICAgICAgICBjb25zdCBsb2NhdGlvbnMgPSBbXTtcbiAgICAgICAgY29uc3QgbnVtQXR0cmlicyA9IGdsLmdldFByb2dyYW1QYXJhbWV0ZXIodGhpcy5wcm9ncmFtLCBnbC5BQ1RJVkVfQVRUUklCVVRFUyk7XG4gICAgICAgIGZvciAobGV0IGFJbmRleCA9IDA7IGFJbmRleCA8IG51bUF0dHJpYnM7IGFJbmRleCsrKSB7XG4gICAgICAgICAgICBjb25zdCBhdHRyaWJ1dGUgPSBnbC5nZXRBY3RpdmVBdHRyaWIodGhpcy5wcm9ncmFtLCBhSW5kZXgpO1xuICAgICAgICAgICAgY29uc3QgbG9jYXRpb24gPSBnbC5nZXRBdHRyaWJMb2NhdGlvbih0aGlzLnByb2dyYW0sIGF0dHJpYnV0ZS5uYW1lKTtcbiAgICAgICAgICAgIGxvY2F0aW9uc1tsb2NhdGlvbl0gPSBhdHRyaWJ1dGUubmFtZTtcbiAgICAgICAgICAgIHRoaXMuYXR0cmlidXRlTG9jYXRpb25zLnNldChhdHRyaWJ1dGUsIGxvY2F0aW9uKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmF0dHJpYnV0ZU9yZGVyID0gbG9jYXRpb25zLmpvaW4oJycpO1xuICAgIH1cblxuICAgIHNldEJsZW5kRnVuYyhzcmMsIGRzdCwgc3JjQWxwaGEsIGRzdEFscGhhKSB7XG4gICAgICAgIHRoaXMuYmxlbmRGdW5jLnNyYyA9IHNyYztcbiAgICAgICAgdGhpcy5ibGVuZEZ1bmMuZHN0ID0gZHN0O1xuICAgICAgICB0aGlzLmJsZW5kRnVuYy5zcmNBbHBoYSA9IHNyY0FscGhhO1xuICAgICAgICB0aGlzLmJsZW5kRnVuYy5kc3RBbHBoYSA9IGRzdEFscGhhO1xuICAgICAgICBpZiAoc3JjKSB0aGlzLnRyYW5zcGFyZW50ID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBzZXRCbGVuZEVxdWF0aW9uKG1vZGVSR0IsIG1vZGVBbHBoYSkge1xuICAgICAgICB0aGlzLmJsZW5kRXF1YXRpb24ubW9kZVJHQiA9IG1vZGVSR0I7XG4gICAgICAgIHRoaXMuYmxlbmRFcXVhdGlvbi5tb2RlQWxwaGEgPSBtb2RlQWxwaGE7XG4gICAgfVxuXG4gICAgYXBwbHlTdGF0ZSgpIHtcbiAgICAgICAgaWYgKHRoaXMuZGVwdGhUZXN0KSB0aGlzLmdsLnJlbmRlcmVyLmVuYWJsZSh0aGlzLmdsLkRFUFRIX1RFU1QpO1xuICAgICAgICBlbHNlIHRoaXMuZ2wucmVuZGVyZXIuZGlzYWJsZSh0aGlzLmdsLkRFUFRIX1RFU1QpO1xuXG4gICAgICAgIGlmICh0aGlzLmN1bGxGYWNlKSB0aGlzLmdsLnJlbmRlcmVyLmVuYWJsZSh0aGlzLmdsLkNVTExfRkFDRSk7XG4gICAgICAgIGVsc2UgdGhpcy5nbC5yZW5kZXJlci5kaXNhYmxlKHRoaXMuZ2wuQ1VMTF9GQUNFKTtcblxuICAgICAgICBpZiAodGhpcy5ibGVuZEZ1bmMuc3JjKSB0aGlzLmdsLnJlbmRlcmVyLmVuYWJsZSh0aGlzLmdsLkJMRU5EKTtcbiAgICAgICAgZWxzZSB0aGlzLmdsLnJlbmRlcmVyLmRpc2FibGUodGhpcy5nbC5CTEVORCk7XG5cbiAgICAgICAgaWYgKHRoaXMuY3VsbEZhY2UpIHRoaXMuZ2wucmVuZGVyZXIuc2V0Q3VsbEZhY2UodGhpcy5jdWxsRmFjZSk7XG4gICAgICAgIHRoaXMuZ2wucmVuZGVyZXIuc2V0RnJvbnRGYWNlKHRoaXMuZnJvbnRGYWNlKTtcbiAgICAgICAgdGhpcy5nbC5yZW5kZXJlci5zZXREZXB0aE1hc2sodGhpcy5kZXB0aFdyaXRlKTtcbiAgICAgICAgdGhpcy5nbC5yZW5kZXJlci5zZXREZXB0aEZ1bmModGhpcy5kZXB0aEZ1bmMpO1xuICAgICAgICBpZiAodGhpcy5ibGVuZEZ1bmMuc3JjKVxuICAgICAgICAgICAgdGhpcy5nbC5yZW5kZXJlci5zZXRCbGVuZEZ1bmModGhpcy5ibGVuZEZ1bmMuc3JjLCB0aGlzLmJsZW5kRnVuYy5kc3QsIHRoaXMuYmxlbmRGdW5jLnNyY0FscGhhLCB0aGlzLmJsZW5kRnVuYy5kc3RBbHBoYSk7XG4gICAgICAgIHRoaXMuZ2wucmVuZGVyZXIuc2V0QmxlbmRFcXVhdGlvbih0aGlzLmJsZW5kRXF1YXRpb24ubW9kZVJHQiwgdGhpcy5ibGVuZEVxdWF0aW9uLm1vZGVBbHBoYSk7XG4gICAgfVxuXG4gICAgdXNlKHsgZmxpcEZhY2VzID0gZmFsc2UgfSA9IHt9KSB7XG4gICAgICAgIGxldCB0ZXh0dXJlVW5pdCA9IC0xO1xuICAgICAgICBjb25zdCBwcm9ncmFtQWN0aXZlID0gdGhpcy5nbC5yZW5kZXJlci5jdXJyZW50UHJvZ3JhbSA9PT0gdGhpcy5pZDtcblxuICAgICAgICAvLyBBdm9pZCBnbCBjYWxsIGlmIHByb2dyYW0gYWxyZWFkeSBpbiB1c2VcbiAgICAgICAgaWYgKCFwcm9ncmFtQWN0aXZlKSB7XG4gICAgICAgICAgICB0aGlzLmdsLnVzZVByb2dyYW0odGhpcy5wcm9ncmFtKTtcbiAgICAgICAgICAgIHRoaXMuZ2wucmVuZGVyZXIuY3VycmVudFByb2dyYW0gPSB0aGlzLmlkO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gU2V0IG9ubHkgdGhlIGFjdGl2ZSB1bmlmb3JtcyBmb3VuZCBpbiB0aGUgc2hhZGVyXG4gICAgICAgIHRoaXMudW5pZm9ybUxvY2F0aW9ucy5mb3JFYWNoKChsb2NhdGlvbiwgYWN0aXZlVW5pZm9ybSkgPT4ge1xuICAgICAgICAgICAgbGV0IG5hbWUgPSBhY3RpdmVVbmlmb3JtLnVuaWZvcm1OYW1lO1xuXG4gICAgICAgICAgICAvLyBnZXQgc3VwcGxpZWQgdW5pZm9ybVxuICAgICAgICAgICAgbGV0IHVuaWZvcm0gPSB0aGlzLnVuaWZvcm1zW25hbWVdO1xuXG4gICAgICAgICAgICAvLyBGb3Igc3RydWN0cywgZ2V0IHRoZSBzcGVjaWZpYyBwcm9wZXJ0eSBpbnN0ZWFkIG9mIHRoZSBlbnRpcmUgb2JqZWN0XG4gICAgICAgICAgICBpZiAoYWN0aXZlVW5pZm9ybS5pc1N0cnVjdCkge1xuICAgICAgICAgICAgICAgIHVuaWZvcm0gPSB1bmlmb3JtW2FjdGl2ZVVuaWZvcm0uc3RydWN0UHJvcGVydHldO1xuICAgICAgICAgICAgICAgIG5hbWUgKz0gYC4ke2FjdGl2ZVVuaWZvcm0uc3RydWN0UHJvcGVydHl9YDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChhY3RpdmVVbmlmb3JtLmlzU3RydWN0QXJyYXkpIHtcbiAgICAgICAgICAgICAgICB1bmlmb3JtID0gdW5pZm9ybVthY3RpdmVVbmlmb3JtLnN0cnVjdEluZGV4XVthY3RpdmVVbmlmb3JtLnN0cnVjdFByb3BlcnR5XTtcbiAgICAgICAgICAgICAgICBuYW1lICs9IGBbJHthY3RpdmVVbmlmb3JtLnN0cnVjdEluZGV4fV0uJHthY3RpdmVVbmlmb3JtLnN0cnVjdFByb3BlcnR5fWA7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICghdW5pZm9ybSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB3YXJuKGBBY3RpdmUgdW5pZm9ybSAke25hbWV9IGhhcyBub3QgYmVlbiBzdXBwbGllZGApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodW5pZm9ybSAmJiB1bmlmb3JtLnZhbHVlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gd2FybihgJHtuYW1lfSB1bmlmb3JtIGlzIG1pc3NpbmcgYSB2YWx1ZSBwYXJhbWV0ZXJgKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHVuaWZvcm0udmFsdWUudGV4dHVyZSkge1xuICAgICAgICAgICAgICAgIHRleHR1cmVVbml0ID0gdGV4dHVyZVVuaXQgKyAxO1xuXG4gICAgICAgICAgICAgICAgLy8gQ2hlY2sgaWYgdGV4dHVyZSBuZWVkcyB0byBiZSB1cGRhdGVkXG4gICAgICAgICAgICAgICAgdW5pZm9ybS52YWx1ZS51cGRhdGUodGV4dHVyZVVuaXQpO1xuICAgICAgICAgICAgICAgIHJldHVybiBzZXRVbmlmb3JtKHRoaXMuZ2wsIGFjdGl2ZVVuaWZvcm0udHlwZSwgbG9jYXRpb24sIHRleHR1cmVVbml0KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gRm9yIHRleHR1cmUgYXJyYXlzLCBzZXQgdW5pZm9ybSBhcyBhbiBhcnJheSBvZiB0ZXh0dXJlIHVuaXRzIGluc3RlYWQgb2YganVzdCBvbmVcbiAgICAgICAgICAgIGlmICh1bmlmb3JtLnZhbHVlLmxlbmd0aCAmJiB1bmlmb3JtLnZhbHVlWzBdLnRleHR1cmUpIHtcbiAgICAgICAgICAgICAgICBjb25zdCB0ZXh0dXJlVW5pdHMgPSBbXTtcbiAgICAgICAgICAgICAgICB1bmlmb3JtLnZhbHVlLmZvckVhY2goKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRleHR1cmVVbml0ID0gdGV4dHVyZVVuaXQgKyAxO1xuICAgICAgICAgICAgICAgICAgICB2YWx1ZS51cGRhdGUodGV4dHVyZVVuaXQpO1xuICAgICAgICAgICAgICAgICAgICB0ZXh0dXJlVW5pdHMucHVzaCh0ZXh0dXJlVW5pdCk7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gc2V0VW5pZm9ybSh0aGlzLmdsLCBhY3RpdmVVbmlmb3JtLnR5cGUsIGxvY2F0aW9uLCB0ZXh0dXJlVW5pdHMpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBzZXRVbmlmb3JtKHRoaXMuZ2wsIGFjdGl2ZVVuaWZvcm0udHlwZSwgbG9jYXRpb24sIHVuaWZvcm0udmFsdWUpO1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLmFwcGx5U3RhdGUoKTtcbiAgICAgICAgaWYgKGZsaXBGYWNlcykgdGhpcy5nbC5yZW5kZXJlci5zZXRGcm9udEZhY2UodGhpcy5mcm9udEZhY2UgPT09IHRoaXMuZ2wuQ0NXID8gdGhpcy5nbC5DVyA6IHRoaXMuZ2wuQ0NXKTtcbiAgICB9XG5cbiAgICByZW1vdmUoKSB7XG4gICAgICAgIHRoaXMuZ2wuZGVsZXRlUHJvZ3JhbSh0aGlzLnByb2dyYW0pO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gc2V0VW5pZm9ybShnbCwgdHlwZSwgbG9jYXRpb24sIHZhbHVlKSB7XG4gICAgdmFsdWUgPSB2YWx1ZS5sZW5ndGggPyBmbGF0dGVuKHZhbHVlKSA6IHZhbHVlO1xuICAgIGNvbnN0IHNldFZhbHVlID0gZ2wucmVuZGVyZXIuc3RhdGUudW5pZm9ybUxvY2F0aW9ucy5nZXQobG9jYXRpb24pO1xuXG4gICAgLy8gQXZvaWQgcmVkdW5kYW50IHVuaWZvcm0gY29tbWFuZHNcbiAgICBpZiAodmFsdWUubGVuZ3RoKSB7XG4gICAgICAgIGlmIChzZXRWYWx1ZSA9PT0gdW5kZWZpbmVkIHx8IHNldFZhbHVlLmxlbmd0aCAhPT0gdmFsdWUubGVuZ3RoKSB7XG4gICAgICAgICAgICAvLyBjbG9uZSBhcnJheSB0byBzdG9yZSBhcyBjYWNoZVxuICAgICAgICAgICAgZ2wucmVuZGVyZXIuc3RhdGUudW5pZm9ybUxvY2F0aW9ucy5zZXQobG9jYXRpb24sIHZhbHVlLnNsaWNlKDApKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChhcnJheXNFcXVhbChzZXRWYWx1ZSwgdmFsdWUpKSByZXR1cm47XG5cbiAgICAgICAgICAgIC8vIFVwZGF0ZSBjYWNoZWQgYXJyYXkgdmFsdWVzXG4gICAgICAgICAgICBzZXRWYWx1ZS5zZXQgPyBzZXRWYWx1ZS5zZXQodmFsdWUpIDogc2V0QXJyYXkoc2V0VmFsdWUsIHZhbHVlKTtcbiAgICAgICAgICAgIGdsLnJlbmRlcmVyLnN0YXRlLnVuaWZvcm1Mb2NhdGlvbnMuc2V0KGxvY2F0aW9uLCBzZXRWYWx1ZSk7XG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoc2V0VmFsdWUgPT09IHZhbHVlKSByZXR1cm47XG4gICAgICAgIGdsLnJlbmRlcmVyLnN0YXRlLnVuaWZvcm1Mb2NhdGlvbnMuc2V0KGxvY2F0aW9uLCB2YWx1ZSk7XG4gICAgfVxuXG4gICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICAgIGNhc2UgNTEyNjpcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZS5sZW5ndGggPyBnbC51bmlmb3JtMWZ2KGxvY2F0aW9uLCB2YWx1ZSkgOiBnbC51bmlmb3JtMWYobG9jYXRpb24sIHZhbHVlKTsgLy8gRkxPQVRcbiAgICAgICAgY2FzZSAzNTY2NDpcbiAgICAgICAgICAgIHJldHVybiBnbC51bmlmb3JtMmZ2KGxvY2F0aW9uLCB2YWx1ZSk7IC8vIEZMT0FUX1ZFQzJcbiAgICAgICAgY2FzZSAzNTY2NTpcbiAgICAgICAgICAgIHJldHVybiBnbC51bmlmb3JtM2Z2KGxvY2F0aW9uLCB2YWx1ZSk7IC8vIEZMT0FUX1ZFQzNcbiAgICAgICAgY2FzZSAzNTY2NjpcbiAgICAgICAgICAgIHJldHVybiBnbC51bmlmb3JtNGZ2KGxvY2F0aW9uLCB2YWx1ZSk7IC8vIEZMT0FUX1ZFQzRcbiAgICAgICAgY2FzZSAzNTY3MDogLy8gQk9PTFxuICAgICAgICBjYXNlIDUxMjQ6IC8vIElOVFxuICAgICAgICBjYXNlIDM1Njc4OiAvLyBTQU1QTEVSXzJEXG4gICAgICAgIGNhc2UgMzU2ODA6XG4gICAgICAgICAgICByZXR1cm4gdmFsdWUubGVuZ3RoID8gZ2wudW5pZm9ybTFpdihsb2NhdGlvbiwgdmFsdWUpIDogZ2wudW5pZm9ybTFpKGxvY2F0aW9uLCB2YWx1ZSk7IC8vIFNBTVBMRVJfQ1VCRVxuICAgICAgICBjYXNlIDM1NjcxOiAvLyBCT09MX1ZFQzJcbiAgICAgICAgY2FzZSAzNTY2NzpcbiAgICAgICAgICAgIHJldHVybiBnbC51bmlmb3JtMml2KGxvY2F0aW9uLCB2YWx1ZSk7IC8vIElOVF9WRUMyXG4gICAgICAgIGNhc2UgMzU2NzI6IC8vIEJPT0xfVkVDM1xuICAgICAgICBjYXNlIDM1NjY4OlxuICAgICAgICAgICAgcmV0dXJuIGdsLnVuaWZvcm0zaXYobG9jYXRpb24sIHZhbHVlKTsgLy8gSU5UX1ZFQzNcbiAgICAgICAgY2FzZSAzNTY3MzogLy8gQk9PTF9WRUM0XG4gICAgICAgIGNhc2UgMzU2Njk6XG4gICAgICAgICAgICByZXR1cm4gZ2wudW5pZm9ybTRpdihsb2NhdGlvbiwgdmFsdWUpOyAvLyBJTlRfVkVDNFxuICAgICAgICBjYXNlIDM1Njc0OlxuICAgICAgICAgICAgcmV0dXJuIGdsLnVuaWZvcm1NYXRyaXgyZnYobG9jYXRpb24sIGZhbHNlLCB2YWx1ZSk7IC8vIEZMT0FUX01BVDJcbiAgICAgICAgY2FzZSAzNTY3NTpcbiAgICAgICAgICAgIHJldHVybiBnbC51bmlmb3JtTWF0cml4M2Z2KGxvY2F0aW9uLCBmYWxzZSwgdmFsdWUpOyAvLyBGTE9BVF9NQVQzXG4gICAgICAgIGNhc2UgMzU2NzY6XG4gICAgICAgICAgICByZXR1cm4gZ2wudW5pZm9ybU1hdHJpeDRmdihsb2NhdGlvbiwgZmFsc2UsIHZhbHVlKTsgLy8gRkxPQVRfTUFUNFxuICAgIH1cbn1cblxuZnVuY3Rpb24gYWRkTGluZU51bWJlcnMoc3RyaW5nKSB7XG4gICAgbGV0IGxpbmVzID0gc3RyaW5nLnNwbGl0KCdcXG4nKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxpbmVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGxpbmVzW2ldID0gaSArIDEgKyAnOiAnICsgbGluZXNbaV07XG4gICAgfVxuICAgIHJldHVybiBsaW5lcy5qb2luKCdcXG4nKTtcbn1cblxuZnVuY3Rpb24gZmxhdHRlbihhKSB7XG4gICAgY29uc3QgYXJyYXlMZW4gPSBhLmxlbmd0aDtcbiAgICBjb25zdCB2YWx1ZUxlbiA9IGFbMF0ubGVuZ3RoO1xuICAgIGlmICh2YWx1ZUxlbiA9PT0gdW5kZWZpbmVkKSByZXR1cm4gYTtcbiAgICBjb25zdCBsZW5ndGggPSBhcnJheUxlbiAqIHZhbHVlTGVuO1xuICAgIGxldCB2YWx1ZSA9IGFycmF5Q2FjaGVGMzJbbGVuZ3RoXTtcbiAgICBpZiAoIXZhbHVlKSBhcnJheUNhY2hlRjMyW2xlbmd0aF0gPSB2YWx1ZSA9IG5ldyBGbG9hdDMyQXJyYXkobGVuZ3RoKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFycmF5TGVuOyBpKyspIHZhbHVlLnNldChhW2ldLCBpICogdmFsdWVMZW4pO1xuICAgIHJldHVybiB2YWx1ZTtcbn1cblxuZnVuY3Rpb24gYXJyYXlzRXF1YWwoYSwgYikge1xuICAgIGlmIChhLmxlbmd0aCAhPT0gYi5sZW5ndGgpIHJldHVybiBmYWxzZTtcbiAgICBmb3IgKGxldCBpID0gMCwgbCA9IGEubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIGlmIChhW2ldICE9PSBiW2ldKSByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xufVxuXG5mdW5jdGlvbiBzZXRBcnJheShhLCBiKSB7XG4gICAgZm9yIChsZXQgaSA9IDAsIGwgPSBhLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICBhW2ldID0gYltpXTtcbiAgICB9XG59XG5cbmxldCB3YXJuQ291bnQgPSAwO1xuZnVuY3Rpb24gd2FybihtZXNzYWdlKSB7XG4gICAgaWYgKHdhcm5Db3VudCA+IDEwMCkgcmV0dXJuO1xuICAgIGNvbnNvbGUud2FybihtZXNzYWdlKTtcbiAgICB3YXJuQ291bnQrKztcbiAgICBpZiAod2FybkNvdW50ID4gMTAwKSBjb25zb2xlLndhcm4oJ01vcmUgdGhhbiAxMDAgcHJvZ3JhbSB3YXJuaW5ncyAtIHN0b3BwaW5nIGxvZ3MuJyk7XG59XG4iLCIvLyBUT0RPOiBtdWx0aSB0YXJnZXQgcmVuZGVyaW5nXG4vLyBUT0RPOiB0ZXN0IHN0ZW5jaWwgYW5kIGRlcHRoXG4vLyBUT0RPOiBkZXN0cm95XG4vLyBUT0RPOiBibGl0IG9uIHJlc2l6ZT9cbmltcG9ydCB7IFRleHR1cmUgfSBmcm9tICcuL1RleHR1cmUuanMnO1xuXG5leHBvcnQgY2xhc3MgUmVuZGVyVGFyZ2V0IHtcbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgZ2wsXG4gICAgICAgIHtcbiAgICAgICAgICAgIHdpZHRoID0gZ2wuY2FudmFzLndpZHRoLFxuICAgICAgICAgICAgaGVpZ2h0ID0gZ2wuY2FudmFzLmhlaWdodCxcbiAgICAgICAgICAgIHRhcmdldCA9IGdsLkZSQU1FQlVGRkVSLFxuICAgICAgICAgICAgY29sb3IgPSAxLCAvLyBudW1iZXIgb2YgY29sb3IgYXR0YWNobWVudHNcbiAgICAgICAgICAgIGRlcHRoID0gdHJ1ZSxcbiAgICAgICAgICAgIHN0ZW5jaWwgPSBmYWxzZSxcbiAgICAgICAgICAgIGRlcHRoVGV4dHVyZSA9IGZhbHNlLCAvLyBub3RlIC0gc3RlbmNpbCBicmVha3NcbiAgICAgICAgICAgIHdyYXBTID0gZ2wuQ0xBTVBfVE9fRURHRSxcbiAgICAgICAgICAgIHdyYXBUID0gZ2wuQ0xBTVBfVE9fRURHRSxcbiAgICAgICAgICAgIG1pbkZpbHRlciA9IGdsLkxJTkVBUixcbiAgICAgICAgICAgIG1hZ0ZpbHRlciA9IG1pbkZpbHRlcixcbiAgICAgICAgICAgIHR5cGUgPSBnbC5VTlNJR05FRF9CWVRFLFxuICAgICAgICAgICAgZm9ybWF0ID0gZ2wuUkdCQSxcbiAgICAgICAgICAgIGludGVybmFsRm9ybWF0ID0gZm9ybWF0LFxuICAgICAgICAgICAgdW5wYWNrQWxpZ25tZW50LFxuICAgICAgICAgICAgcHJlbXVsdGlwbHlBbHBoYSxcbiAgICAgICAgfSA9IHt9XG4gICAgKSB7XG4gICAgICAgIHRoaXMuZ2wgPSBnbDtcbiAgICAgICAgdGhpcy53aWR0aCA9IHdpZHRoO1xuICAgICAgICB0aGlzLmhlaWdodCA9IGhlaWdodDtcbiAgICAgICAgdGhpcy5kZXB0aCA9IGRlcHRoO1xuICAgICAgICB0aGlzLmJ1ZmZlciA9IHRoaXMuZ2wuY3JlYXRlRnJhbWVidWZmZXIoKTtcbiAgICAgICAgdGhpcy50YXJnZXQgPSB0YXJnZXQ7XG4gICAgICAgIHRoaXMuZ2wuYmluZEZyYW1lYnVmZmVyKHRoaXMudGFyZ2V0LCB0aGlzLmJ1ZmZlcik7XG5cbiAgICAgICAgdGhpcy50ZXh0dXJlcyA9IFtdO1xuICAgICAgICBjb25zdCBkcmF3QnVmZmVycyA9IFtdO1xuXG4gICAgICAgIC8vIGNyZWF0ZSBhbmQgYXR0YWNoIHJlcXVpcmVkIG51bSBvZiBjb2xvciB0ZXh0dXJlc1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNvbG9yOyBpKyspIHtcbiAgICAgICAgICAgIHRoaXMudGV4dHVyZXMucHVzaChcbiAgICAgICAgICAgICAgICBuZXcgVGV4dHVyZShnbCwge1xuICAgICAgICAgICAgICAgICAgICB3aWR0aCxcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0LFxuICAgICAgICAgICAgICAgICAgICB3cmFwUyxcbiAgICAgICAgICAgICAgICAgICAgd3JhcFQsXG4gICAgICAgICAgICAgICAgICAgIG1pbkZpbHRlcixcbiAgICAgICAgICAgICAgICAgICAgbWFnRmlsdGVyLFxuICAgICAgICAgICAgICAgICAgICB0eXBlLFxuICAgICAgICAgICAgICAgICAgICBmb3JtYXQsXG4gICAgICAgICAgICAgICAgICAgIGludGVybmFsRm9ybWF0LFxuICAgICAgICAgICAgICAgICAgICB1bnBhY2tBbGlnbm1lbnQsXG4gICAgICAgICAgICAgICAgICAgIHByZW11bHRpcGx5QWxwaGEsXG4gICAgICAgICAgICAgICAgICAgIGZsaXBZOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgZ2VuZXJhdGVNaXBtYXBzOiBmYWxzZSxcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIHRoaXMudGV4dHVyZXNbaV0udXBkYXRlKCk7XG4gICAgICAgICAgICB0aGlzLmdsLmZyYW1lYnVmZmVyVGV4dHVyZTJEKHRoaXMudGFyZ2V0LCB0aGlzLmdsLkNPTE9SX0FUVEFDSE1FTlQwICsgaSwgdGhpcy5nbC5URVhUVVJFXzJELCB0aGlzLnRleHR1cmVzW2ldLnRleHR1cmUsIDAgLyogbGV2ZWwgKi8pO1xuICAgICAgICAgICAgZHJhd0J1ZmZlcnMucHVzaCh0aGlzLmdsLkNPTE9SX0FUVEFDSE1FTlQwICsgaSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBGb3IgbXVsdGktcmVuZGVyIHRhcmdldHMgc2hhZGVyIGFjY2Vzc1xuICAgICAgICBpZiAoZHJhd0J1ZmZlcnMubGVuZ3RoID4gMSkgdGhpcy5nbC5yZW5kZXJlci5kcmF3QnVmZmVycyhkcmF3QnVmZmVycyk7XG5cbiAgICAgICAgLy8gYWxpYXMgZm9yIG1ham9yaXR5IG9mIHVzZSBjYXNlc1xuICAgICAgICB0aGlzLnRleHR1cmUgPSB0aGlzLnRleHR1cmVzWzBdO1xuXG4gICAgICAgIC8vIG5vdGUgZGVwdGggdGV4dHVyZXMgYnJlYWsgc3RlbmNpbCAtIHNvIGNhbid0IHVzZSB0b2dldGhlclxuICAgICAgICBpZiAoZGVwdGhUZXh0dXJlICYmICh0aGlzLmdsLnJlbmRlcmVyLmlzV2ViZ2wyIHx8IHRoaXMuZ2wucmVuZGVyZXIuZ2V0RXh0ZW5zaW9uKCdXRUJHTF9kZXB0aF90ZXh0dXJlJykpKSB7XG4gICAgICAgICAgICB0aGlzLmRlcHRoVGV4dHVyZSA9IG5ldyBUZXh0dXJlKGdsLCB7XG4gICAgICAgICAgICAgICAgd2lkdGgsXG4gICAgICAgICAgICAgICAgaGVpZ2h0LFxuICAgICAgICAgICAgICAgIG1pbkZpbHRlcjogdGhpcy5nbC5ORUFSRVNULFxuICAgICAgICAgICAgICAgIG1hZ0ZpbHRlcjogdGhpcy5nbC5ORUFSRVNULFxuICAgICAgICAgICAgICAgIGZvcm1hdDogdGhpcy5nbC5ERVBUSF9DT01QT05FTlQsXG4gICAgICAgICAgICAgICAgaW50ZXJuYWxGb3JtYXQ6IGdsLnJlbmRlcmVyLmlzV2ViZ2wyID8gdGhpcy5nbC5ERVBUSF9DT01QT05FTlQxNiA6IHRoaXMuZ2wuREVQVEhfQ09NUE9ORU5ULFxuICAgICAgICAgICAgICAgIHR5cGU6IHRoaXMuZ2wuVU5TSUdORURfSU5ULFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLmRlcHRoVGV4dHVyZS51cGRhdGUoKTtcbiAgICAgICAgICAgIHRoaXMuZ2wuZnJhbWVidWZmZXJUZXh0dXJlMkQodGhpcy50YXJnZXQsIHRoaXMuZ2wuREVQVEhfQVRUQUNITUVOVCwgdGhpcy5nbC5URVhUVVJFXzJELCB0aGlzLmRlcHRoVGV4dHVyZS50ZXh0dXJlLCAwIC8qIGxldmVsICovKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIFJlbmRlciBidWZmZXJzXG4gICAgICAgICAgICBpZiAoZGVwdGggJiYgIXN0ZW5jaWwpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRlcHRoQnVmZmVyID0gdGhpcy5nbC5jcmVhdGVSZW5kZXJidWZmZXIoKTtcbiAgICAgICAgICAgICAgICB0aGlzLmdsLmJpbmRSZW5kZXJidWZmZXIodGhpcy5nbC5SRU5ERVJCVUZGRVIsIHRoaXMuZGVwdGhCdWZmZXIpO1xuICAgICAgICAgICAgICAgIHRoaXMuZ2wucmVuZGVyYnVmZmVyU3RvcmFnZSh0aGlzLmdsLlJFTkRFUkJVRkZFUiwgdGhpcy5nbC5ERVBUSF9DT01QT05FTlQxNiwgd2lkdGgsIGhlaWdodCk7XG4gICAgICAgICAgICAgICAgdGhpcy5nbC5mcmFtZWJ1ZmZlclJlbmRlcmJ1ZmZlcih0aGlzLnRhcmdldCwgdGhpcy5nbC5ERVBUSF9BVFRBQ0hNRU5ULCB0aGlzLmdsLlJFTkRFUkJVRkZFUiwgdGhpcy5kZXB0aEJ1ZmZlcik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChzdGVuY2lsICYmICFkZXB0aCkge1xuICAgICAgICAgICAgICAgIHRoaXMuc3RlbmNpbEJ1ZmZlciA9IHRoaXMuZ2wuY3JlYXRlUmVuZGVyYnVmZmVyKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5nbC5iaW5kUmVuZGVyYnVmZmVyKHRoaXMuZ2wuUkVOREVSQlVGRkVSLCB0aGlzLnN0ZW5jaWxCdWZmZXIpO1xuICAgICAgICAgICAgICAgIHRoaXMuZ2wucmVuZGVyYnVmZmVyU3RvcmFnZSh0aGlzLmdsLlJFTkRFUkJVRkZFUiwgdGhpcy5nbC5TVEVOQ0lMX0lOREVYOCwgd2lkdGgsIGhlaWdodCk7XG4gICAgICAgICAgICAgICAgdGhpcy5nbC5mcmFtZWJ1ZmZlclJlbmRlcmJ1ZmZlcih0aGlzLnRhcmdldCwgdGhpcy5nbC5TVEVOQ0lMX0FUVEFDSE1FTlQsIHRoaXMuZ2wuUkVOREVSQlVGRkVSLCB0aGlzLnN0ZW5jaWxCdWZmZXIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoZGVwdGggJiYgc3RlbmNpbCkge1xuICAgICAgICAgICAgICAgIHRoaXMuZGVwdGhTdGVuY2lsQnVmZmVyID0gdGhpcy5nbC5jcmVhdGVSZW5kZXJidWZmZXIoKTtcbiAgICAgICAgICAgICAgICB0aGlzLmdsLmJpbmRSZW5kZXJidWZmZXIodGhpcy5nbC5SRU5ERVJCVUZGRVIsIHRoaXMuZGVwdGhTdGVuY2lsQnVmZmVyKTtcbiAgICAgICAgICAgICAgICB0aGlzLmdsLnJlbmRlcmJ1ZmZlclN0b3JhZ2UodGhpcy5nbC5SRU5ERVJCVUZGRVIsIHRoaXMuZ2wuREVQVEhfU1RFTkNJTCwgd2lkdGgsIGhlaWdodCk7XG4gICAgICAgICAgICAgICAgdGhpcy5nbC5mcmFtZWJ1ZmZlclJlbmRlcmJ1ZmZlcih0aGlzLnRhcmdldCwgdGhpcy5nbC5ERVBUSF9TVEVOQ0lMX0FUVEFDSE1FTlQsIHRoaXMuZ2wuUkVOREVSQlVGRkVSLCB0aGlzLmRlcHRoU3RlbmNpbEJ1ZmZlcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmdsLmJpbmRGcmFtZWJ1ZmZlcih0aGlzLnRhcmdldCwgbnVsbCk7XG4gICAgfVxuXG4gICAgZGlzcG9zZSgpIHtcbiAgICAgICAgdGhpcy50ZXh0dXJlcy5mb3JFYWNoKCAodGV4dHVyZSkgPT4ge1xuICAgICAgICAgICAgdGV4dHVyZS5kaXNwb3NlKCk7XG4gICAgICAgIH0pXG4gICAgICAgIHRoaXMuZGVwdGhUZXh0dXJlICYmIHRoaXMuZGVwdGhUZXh0dXJlLmRpc3Bvc2UoKTtcbiAgICAgICAgdGhpcy5kZXB0aEJ1ZmZlciAmJiB0aGlzLmdsLmRlbGV0ZVJlbmRlcmJ1ZmZlcih0aGlzLmRlcHRoQnVmZmVyKTtcbiAgICAgICAgdGhpcy5zdGVuY2lsQnVmZmVyICYmIHRoaXMuZ2wuZGVsZXRlUmVuZGVyYnVmZmVyKHRoaXMuc3RlbmNpbEJ1ZmZlcik7XG4gICAgICAgIHRoaXMuZGVwdGhTdGVuY2lsQnVmZmVyICYmIHRoaXMuZ2wuZGVsZXRlUmVuZGVyYnVmZmVyKHRoaXMuZGVwdGhTdGVuY2lsQnVmZmVyKTtcbiAgICAgICAgdGhpcy5nbC5kZWxldGVGcmFtZWJ1ZmZlcih0aGlzLmJ1ZmZlcik7XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgVmVjMyB9IGZyb20gJy4uL21hdGgvVmVjMy5qcyc7XG5cbi8vIFRPRE86IEhhbmRsZSBjb250ZXh0IGxvc3MgaHR0cHM6Ly93d3cua2hyb25vcy5vcmcvd2ViZ2wvd2lraS9IYW5kbGluZ0NvbnRleHRMb3N0XG5cbi8vIE5vdCBhdXRvbWF0aWMgLSBkZXZzIHRvIHVzZSB0aGVzZSBtZXRob2RzIG1hbnVhbGx5XG4vLyBnbC5jb2xvck1hc2soIGNvbG9yTWFzaywgY29sb3JNYXNrLCBjb2xvck1hc2ssIGNvbG9yTWFzayApO1xuLy8gZ2wuY2xlYXJDb2xvciggciwgZywgYiwgYSApO1xuLy8gZ2wuc3RlbmNpbE1hc2soIHN0ZW5jaWxNYXNrICk7XG4vLyBnbC5zdGVuY2lsRnVuYyggc3RlbmNpbEZ1bmMsIHN0ZW5jaWxSZWYsIHN0ZW5jaWxNYXNrICk7XG4vLyBnbC5zdGVuY2lsT3AoIHN0ZW5jaWxGYWlsLCBzdGVuY2lsWkZhaWwsIHN0ZW5jaWxaUGFzcyApO1xuLy8gZ2wuY2xlYXJTdGVuY2lsKCBzdGVuY2lsICk7XG5cbmNvbnN0IHRlbXBWZWMzID0gbmV3IFZlYzMoKTtcbmxldCBJRCA9IDE7XG5cbmV4cG9ydCBjbGFzcyBSZW5kZXJlciB7XG4gICAgY29uc3RydWN0b3Ioe1xuICAgICAgICBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKSxcbiAgICAgICAgd2lkdGggPSAzMDAsXG4gICAgICAgIGhlaWdodCA9IDE1MCxcbiAgICAgICAgZHByID0gMSxcbiAgICAgICAgYWxwaGEgPSBmYWxzZSxcbiAgICAgICAgZGVwdGggPSB0cnVlLFxuICAgICAgICBzdGVuY2lsID0gZmFsc2UsXG4gICAgICAgIGFudGlhbGlhcyA9IGZhbHNlLFxuICAgICAgICBwcmVtdWx0aXBsaWVkQWxwaGEgPSBmYWxzZSxcbiAgICAgICAgcHJlc2VydmVEcmF3aW5nQnVmZmVyID0gZmFsc2UsXG4gICAgICAgIHBvd2VyUHJlZmVyZW5jZSA9ICdkZWZhdWx0JyxcbiAgICAgICAgYXV0b0NsZWFyID0gdHJ1ZSxcbiAgICAgICAgd2ViZ2wgPSAyLFxuICAgIH0gPSB7fSkge1xuICAgICAgICBjb25zdCBhdHRyaWJ1dGVzID0geyBhbHBoYSwgZGVwdGgsIHN0ZW5jaWwsIGFudGlhbGlhcywgcHJlbXVsdGlwbGllZEFscGhhLCBwcmVzZXJ2ZURyYXdpbmdCdWZmZXIsIHBvd2VyUHJlZmVyZW5jZSB9O1xuICAgICAgICB0aGlzLmRwciA9IGRwcjtcbiAgICAgICAgdGhpcy5hbHBoYSA9IGFscGhhO1xuICAgICAgICB0aGlzLmNvbG9yID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5kZXB0aCA9IGRlcHRoO1xuICAgICAgICB0aGlzLnN0ZW5jaWwgPSBzdGVuY2lsO1xuICAgICAgICB0aGlzLnByZW11bHRpcGxpZWRBbHBoYSA9IHByZW11bHRpcGxpZWRBbHBoYTtcbiAgICAgICAgdGhpcy5hdXRvQ2xlYXIgPSBhdXRvQ2xlYXI7XG4gICAgICAgIHRoaXMuaWQgPSBJRCsrO1xuXG4gICAgICAgIC8vIEF0dGVtcHQgV2ViR0wyIHVubGVzcyBmb3JjZWQgdG8gMSwgaWYgbm90IHN1cHBvcnRlZCBmYWxsYmFjayB0byBXZWJHTDFcbiAgICAgICAgdGhpcy5pc1dlYmdsMiA9ICEhdGhpcy5nbDtcbiAgICAgICAgaWYgKCF0aGlzLmdsKSB7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIEB0eXBlIHtPR0xSZW5kZXJpbmdDb250ZXh0fVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzLmdsID0gY2FudmFzLmdldENvbnRleHQoJ3dlYmdsJywgYXR0cmlidXRlcykgfHwgY2FudmFzLmdldENvbnRleHQoJ2V4cGVyaW1lbnRhbC13ZWJnbCcsIGF0dHJpYnV0ZXMpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghdGhpcy5nbCkgY29uc29sZS5lcnJvcigndW5hYmxlIHRvIGNyZWF0ZSB3ZWJnbCBjb250ZXh0Jyk7XG5cbiAgICAgICAgLy8gQXR0YWNoIHJlbmRlcmVyIHRvIGdsIHNvIHRoYXQgYWxsIGNsYXNzZXMgaGF2ZSBhY2Nlc3MgdG8gaW50ZXJuYWwgc3RhdGUgZnVuY3Rpb25zXG4gICAgICAgIHRoaXMuZ2wucmVuZGVyZXIgPSB0aGlzO1xuXG4gICAgICAgIC8vIGluaXRpYWxpc2Ugc2l6ZSB2YWx1ZXNcbiAgICAgICAgdGhpcy5zZXRTaXplKHdpZHRoLCBoZWlnaHQpO1xuXG4gICAgICAgIC8vIGdsIHN0YXRlIHN0b3JlcyB0byBhdm9pZCByZWR1bmRhbnQgY2FsbHMgb24gbWV0aG9kcyB1c2VkIGludGVybmFsbHlcbiAgICAgICAgdGhpcy5zdGF0ZSA9IHt9O1xuICAgICAgICB0aGlzLnN0YXRlLmJsZW5kRnVuYyA9IHsgc3JjOiB0aGlzLmdsLk9ORSwgZHN0OiB0aGlzLmdsLlpFUk8gfTtcbiAgICAgICAgdGhpcy5zdGF0ZS5ibGVuZEVxdWF0aW9uID0geyBtb2RlUkdCOiB0aGlzLmdsLkZVTkNfQUREIH07XG4gICAgICAgIHRoaXMuc3RhdGUuY3VsbEZhY2UgPSBudWxsO1xuICAgICAgICB0aGlzLnN0YXRlLmZyb250RmFjZSA9IHRoaXMuZ2wuQ0NXO1xuICAgICAgICB0aGlzLnN0YXRlLmRlcHRoTWFzayA9IHRydWU7XG4gICAgICAgIHRoaXMuc3RhdGUuZGVwdGhGdW5jID0gdGhpcy5nbC5MRVNTO1xuICAgICAgICB0aGlzLnN0YXRlLnByZW11bHRpcGx5QWxwaGEgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5zdGF0ZS5mbGlwWSA9IGZhbHNlO1xuICAgICAgICB0aGlzLnN0YXRlLnVucGFja0FsaWdubWVudCA9IDQ7XG4gICAgICAgIHRoaXMuc3RhdGUuZnJhbWVidWZmZXIgPSBudWxsO1xuICAgICAgICB0aGlzLnN0YXRlLnZpZXdwb3J0ID0geyB3aWR0aDogbnVsbCwgaGVpZ2h0OiBudWxsIH07XG4gICAgICAgIHRoaXMuc3RhdGUudGV4dHVyZVVuaXRzID0gW107XG4gICAgICAgIHRoaXMuc3RhdGUuYWN0aXZlVGV4dHVyZVVuaXQgPSAwO1xuICAgICAgICB0aGlzLnN0YXRlLmJvdW5kQnVmZmVyID0gbnVsbDtcbiAgICAgICAgdGhpcy5zdGF0ZS51bmlmb3JtTG9jYXRpb25zID0gbmV3IE1hcCgpO1xuXG4gICAgICAgIC8vIHN0b3JlIHJlcXVlc3RlZCBleHRlbnNpb25zXG4gICAgICAgIHRoaXMuZXh0ZW5zaW9ucyA9IHt9O1xuXG4gICAgICAgIC8vIEluaXRpYWxpc2UgZXh0cmEgZm9ybWF0IHR5cGVzXG4gICAgICAgIGlmICh0aGlzLmlzV2ViZ2wyKSB7XG4gICAgICAgICAgICB0aGlzLmdldEV4dGVuc2lvbignRVhUX2NvbG9yX2J1ZmZlcl9mbG9hdCcpO1xuICAgICAgICAgICAgdGhpcy5nZXRFeHRlbnNpb24oJ09FU190ZXh0dXJlX2Zsb2F0X2xpbmVhcicpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5nZXRFeHRlbnNpb24oJ09FU190ZXh0dXJlX2Zsb2F0Jyk7XG4gICAgICAgICAgICB0aGlzLmdldEV4dGVuc2lvbignT0VTX3RleHR1cmVfZmxvYXRfbGluZWFyJyk7XG4gICAgICAgICAgICB0aGlzLmdldEV4dGVuc2lvbignT0VTX3RleHR1cmVfaGFsZl9mbG9hdCcpO1xuICAgICAgICAgICAgdGhpcy5nZXRFeHRlbnNpb24oJ09FU190ZXh0dXJlX2hhbGZfZmxvYXRfbGluZWFyJyk7XG4gICAgICAgICAgICB0aGlzLmdldEV4dGVuc2lvbignT0VTX2VsZW1lbnRfaW5kZXhfdWludCcpO1xuICAgICAgICAgICAgdGhpcy5nZXRFeHRlbnNpb24oJ09FU19zdGFuZGFyZF9kZXJpdmF0aXZlcycpO1xuICAgICAgICAgICAgdGhpcy5nZXRFeHRlbnNpb24oJ0VYVF9zUkdCJyk7XG4gICAgICAgICAgICB0aGlzLmdldEV4dGVuc2lvbignV0VCR0xfZGVwdGhfdGV4dHVyZScpO1xuICAgICAgICAgICAgdGhpcy5nZXRFeHRlbnNpb24oJ1dFQkdMX2RyYXdfYnVmZmVycycpO1xuICAgICAgICAgICAgdGhpcy5nZXRFeHRlbnNpb24oJ1dFQkdMX2NvbG9yX2J1ZmZlcl9mbG9hdCcpO1xuICAgICAgICAgICAgdGhpcy5nZXRFeHRlbnNpb24oJ0VYVF9jb2xvcl9idWZmZXJfaGFsZl9mbG9hdCcpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ3JlYXRlIG1ldGhvZCBhbGlhc2VzIHVzaW5nIGV4dGVuc2lvbiAoV2ViR0wxKSBvciBuYXRpdmUgaWYgYXZhaWxhYmxlIChXZWJHTDIpXG4gICAgICAgIHRoaXMudmVydGV4QXR0cmliRGl2aXNvciA9IHRoaXMuZ2V0RXh0ZW5zaW9uKCdBTkdMRV9pbnN0YW5jZWRfYXJyYXlzJywgJ3ZlcnRleEF0dHJpYkRpdmlzb3InLCAndmVydGV4QXR0cmliRGl2aXNvckFOR0xFJyk7XG4gICAgICAgIHRoaXMuZHJhd0FycmF5c0luc3RhbmNlZCA9IHRoaXMuZ2V0RXh0ZW5zaW9uKCdBTkdMRV9pbnN0YW5jZWRfYXJyYXlzJywgJ2RyYXdBcnJheXNJbnN0YW5jZWQnLCAnZHJhd0FycmF5c0luc3RhbmNlZEFOR0xFJyk7XG4gICAgICAgIHRoaXMuZHJhd0VsZW1lbnRzSW5zdGFuY2VkID0gdGhpcy5nZXRFeHRlbnNpb24oJ0FOR0xFX2luc3RhbmNlZF9hcnJheXMnLCAnZHJhd0VsZW1lbnRzSW5zdGFuY2VkJywgJ2RyYXdFbGVtZW50c0luc3RhbmNlZEFOR0xFJyk7XG4gICAgICAgIHRoaXMuY3JlYXRlVmVydGV4QXJyYXkgPSB0aGlzLmdldEV4dGVuc2lvbignT0VTX3ZlcnRleF9hcnJheV9vYmplY3QnLCAnY3JlYXRlVmVydGV4QXJyYXknLCAnY3JlYXRlVmVydGV4QXJyYXlPRVMnKTtcbiAgICAgICAgdGhpcy5iaW5kVmVydGV4QXJyYXkgPSB0aGlzLmdldEV4dGVuc2lvbignT0VTX3ZlcnRleF9hcnJheV9vYmplY3QnLCAnYmluZFZlcnRleEFycmF5JywgJ2JpbmRWZXJ0ZXhBcnJheU9FUycpO1xuICAgICAgICB0aGlzLmRlbGV0ZVZlcnRleEFycmF5ID0gdGhpcy5nZXRFeHRlbnNpb24oJ09FU192ZXJ0ZXhfYXJyYXlfb2JqZWN0JywgJ2RlbGV0ZVZlcnRleEFycmF5JywgJ2RlbGV0ZVZlcnRleEFycmF5T0VTJyk7XG4gICAgICAgIHRoaXMuZHJhd0J1ZmZlcnMgPSB0aGlzLmdldEV4dGVuc2lvbignV0VCR0xfZHJhd19idWZmZXJzJywgJ2RyYXdCdWZmZXJzJywgJ2RyYXdCdWZmZXJzV0VCR0wnKTtcblxuICAgICAgICAvLyBTdG9yZSBkZXZpY2UgcGFyYW1ldGVyc1xuICAgICAgICB0aGlzLnBhcmFtZXRlcnMgPSB7fTtcbiAgICAgICAgdGhpcy5wYXJhbWV0ZXJzLm1heFRleHR1cmVVbml0cyA9IHRoaXMuZ2wuZ2V0UGFyYW1ldGVyKHRoaXMuZ2wuTUFYX0NPTUJJTkVEX1RFWFRVUkVfSU1BR0VfVU5JVFMpO1xuICAgICAgICB0aGlzLnBhcmFtZXRlcnMubWF4QW5pc290cm9weSA9IHRoaXMuZ2V0RXh0ZW5zaW9uKCdFWFRfdGV4dHVyZV9maWx0ZXJfYW5pc290cm9waWMnKVxuICAgICAgICAgICAgPyB0aGlzLmdsLmdldFBhcmFtZXRlcih0aGlzLmdldEV4dGVuc2lvbignRVhUX3RleHR1cmVfZmlsdGVyX2FuaXNvdHJvcGljJykuTUFYX1RFWFRVUkVfTUFYX0FOSVNPVFJPUFlfRVhUKVxuICAgICAgICAgICAgOiAwO1xuICAgIH1cblxuICAgIHNldFNpemUod2lkdGgsIGhlaWdodCkge1xuICAgICAgICB0aGlzLndpZHRoID0gd2lkdGg7XG4gICAgICAgIHRoaXMuaGVpZ2h0ID0gaGVpZ2h0O1xuXG4gICAgICAgIHRoaXMuZ2wuY2FudmFzLndpZHRoID0gd2lkdGggKiB0aGlzLmRwcjtcbiAgICAgICAgdGhpcy5nbC5jYW52YXMuaGVpZ2h0ID0gaGVpZ2h0ICogdGhpcy5kcHI7XG5cbiAgICAgICAgT2JqZWN0LmFzc2lnbih0aGlzLmdsLmNhbnZhcy5zdHlsZSwge1xuICAgICAgICAgICAgd2lkdGg6IHdpZHRoICsgJ3B4JyxcbiAgICAgICAgICAgIGhlaWdodDogaGVpZ2h0ICsgJ3B4JyxcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgc2V0Vmlld3BvcnQod2lkdGgsIGhlaWdodCkge1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS52aWV3cG9ydC53aWR0aCA9PT0gd2lkdGggJiYgdGhpcy5zdGF0ZS52aWV3cG9ydC5oZWlnaHQgPT09IGhlaWdodCkgcmV0dXJuO1xuICAgICAgICB0aGlzLnN0YXRlLnZpZXdwb3J0LndpZHRoID0gd2lkdGg7XG4gICAgICAgIHRoaXMuc3RhdGUudmlld3BvcnQuaGVpZ2h0ID0gaGVpZ2h0O1xuICAgICAgICB0aGlzLmdsLnZpZXdwb3J0KDAsIDAsIHdpZHRoLCBoZWlnaHQpO1xuICAgIH1cblxuICAgIGVuYWJsZShpZCkge1xuICAgICAgICBpZiAodGhpcy5zdGF0ZVtpZF0gPT09IHRydWUpIHJldHVybjtcbiAgICAgICAgdGhpcy5nbC5lbmFibGUoaWQpO1xuICAgICAgICB0aGlzLnN0YXRlW2lkXSA9IHRydWU7XG4gICAgfVxuXG4gICAgZGlzYWJsZShpZCkge1xuICAgICAgICBpZiAodGhpcy5zdGF0ZVtpZF0gPT09IGZhbHNlKSByZXR1cm47XG4gICAgICAgIHRoaXMuZ2wuZGlzYWJsZShpZCk7XG4gICAgICAgIHRoaXMuc3RhdGVbaWRdID0gZmFsc2U7XG4gICAgfVxuXG4gICAgc2V0QmxlbmRGdW5jKHNyYywgZHN0LCBzcmNBbHBoYSwgZHN0QWxwaGEpIHtcbiAgICAgICAgaWYgKFxuICAgICAgICAgICAgdGhpcy5zdGF0ZS5ibGVuZEZ1bmMuc3JjID09PSBzcmMgJiZcbiAgICAgICAgICAgIHRoaXMuc3RhdGUuYmxlbmRGdW5jLmRzdCA9PT0gZHN0ICYmXG4gICAgICAgICAgICB0aGlzLnN0YXRlLmJsZW5kRnVuYy5zcmNBbHBoYSA9PT0gc3JjQWxwaGEgJiZcbiAgICAgICAgICAgIHRoaXMuc3RhdGUuYmxlbmRGdW5jLmRzdEFscGhhID09PSBkc3RBbHBoYVxuICAgICAgICApXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIHRoaXMuc3RhdGUuYmxlbmRGdW5jLnNyYyA9IHNyYztcbiAgICAgICAgdGhpcy5zdGF0ZS5ibGVuZEZ1bmMuZHN0ID0gZHN0O1xuICAgICAgICB0aGlzLnN0YXRlLmJsZW5kRnVuYy5zcmNBbHBoYSA9IHNyY0FscGhhO1xuICAgICAgICB0aGlzLnN0YXRlLmJsZW5kRnVuYy5kc3RBbHBoYSA9IGRzdEFscGhhO1xuICAgICAgICBpZiAoc3JjQWxwaGEgIT09IHVuZGVmaW5lZCkgdGhpcy5nbC5ibGVuZEZ1bmNTZXBhcmF0ZShzcmMsIGRzdCwgc3JjQWxwaGEsIGRzdEFscGhhKTtcbiAgICAgICAgZWxzZSB0aGlzLmdsLmJsZW5kRnVuYyhzcmMsIGRzdCk7XG4gICAgfVxuXG4gICAgc2V0QmxlbmRFcXVhdGlvbihtb2RlUkdCLCBtb2RlQWxwaGEpIHtcbiAgICAgICAgbW9kZVJHQiA9IG1vZGVSR0IgfHwgdGhpcy5nbC5GVU5DX0FERDtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuYmxlbmRFcXVhdGlvbi5tb2RlUkdCID09PSBtb2RlUkdCICYmIHRoaXMuc3RhdGUuYmxlbmRFcXVhdGlvbi5tb2RlQWxwaGEgPT09IG1vZGVBbHBoYSkgcmV0dXJuO1xuICAgICAgICB0aGlzLnN0YXRlLmJsZW5kRXF1YXRpb24ubW9kZVJHQiA9IG1vZGVSR0I7XG4gICAgICAgIHRoaXMuc3RhdGUuYmxlbmRFcXVhdGlvbi5tb2RlQWxwaGEgPSBtb2RlQWxwaGE7XG4gICAgICAgIGlmIChtb2RlQWxwaGEgIT09IHVuZGVmaW5lZCkgdGhpcy5nbC5ibGVuZEVxdWF0aW9uU2VwYXJhdGUobW9kZVJHQiwgbW9kZUFscGhhKTtcbiAgICAgICAgZWxzZSB0aGlzLmdsLmJsZW5kRXF1YXRpb24obW9kZVJHQik7XG4gICAgfVxuXG4gICAgc2V0Q3VsbEZhY2UodmFsdWUpIHtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuY3VsbEZhY2UgPT09IHZhbHVlKSByZXR1cm47XG4gICAgICAgIHRoaXMuc3RhdGUuY3VsbEZhY2UgPSB2YWx1ZTtcbiAgICAgICAgdGhpcy5nbC5jdWxsRmFjZSh2YWx1ZSk7XG4gICAgfVxuXG4gICAgc2V0RnJvbnRGYWNlKHZhbHVlKSB7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLmZyb250RmFjZSA9PT0gdmFsdWUpIHJldHVybjtcbiAgICAgICAgdGhpcy5zdGF0ZS5mcm9udEZhY2UgPSB2YWx1ZTtcbiAgICAgICAgdGhpcy5nbC5mcm9udEZhY2UodmFsdWUpO1xuICAgIH1cblxuICAgIHNldERlcHRoTWFzayh2YWx1ZSkge1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5kZXB0aE1hc2sgPT09IHZhbHVlKSByZXR1cm47XG4gICAgICAgIHRoaXMuc3RhdGUuZGVwdGhNYXNrID0gdmFsdWU7XG4gICAgICAgIHRoaXMuZ2wuZGVwdGhNYXNrKHZhbHVlKTtcbiAgICB9XG5cbiAgICBzZXREZXB0aEZ1bmModmFsdWUpIHtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuZGVwdGhGdW5jID09PSB2YWx1ZSkgcmV0dXJuO1xuICAgICAgICB0aGlzLnN0YXRlLmRlcHRoRnVuYyA9IHZhbHVlO1xuICAgICAgICB0aGlzLmdsLmRlcHRoRnVuYyh2YWx1ZSk7XG4gICAgfVxuXG4gICAgYWN0aXZlVGV4dHVyZSh2YWx1ZSkge1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5hY3RpdmVUZXh0dXJlVW5pdCA9PT0gdmFsdWUpIHJldHVybjtcbiAgICAgICAgdGhpcy5zdGF0ZS5hY3RpdmVUZXh0dXJlVW5pdCA9IHZhbHVlO1xuICAgICAgICB0aGlzLmdsLmFjdGl2ZVRleHR1cmUodGhpcy5nbC5URVhUVVJFMCArIHZhbHVlKTtcbiAgICB9XG5cbiAgICBiaW5kRnJhbWVidWZmZXIoeyB0YXJnZXQgPSB0aGlzLmdsLkZSQU1FQlVGRkVSLCBidWZmZXIgPSBudWxsIH0gPSB7fSkge1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5mcmFtZWJ1ZmZlciA9PT0gYnVmZmVyKSByZXR1cm47XG4gICAgICAgIHRoaXMuc3RhdGUuZnJhbWVidWZmZXIgPSBidWZmZXI7XG4gICAgICAgIHRoaXMuZ2wuYmluZEZyYW1lYnVmZmVyKHRhcmdldCwgYnVmZmVyKTtcbiAgICB9XG5cbiAgICBnZXRFeHRlbnNpb24oZXh0ZW5zaW9uLCB3ZWJnbDJGdW5jLCBleHRGdW5jKSB7XG4gICAgICAgIC8vIGlmIHdlYmdsMiBmdW5jdGlvbiBzdXBwb3J0ZWQsIHJldHVybiBmdW5jIGJvdW5kIHRvIGdsIGNvbnRleHRcbiAgICAgICAgaWYgKHdlYmdsMkZ1bmMgJiYgdGhpcy5nbFt3ZWJnbDJGdW5jXSkgcmV0dXJuIHRoaXMuZ2xbd2ViZ2wyRnVuY10uYmluZCh0aGlzLmdsKTtcblxuICAgICAgICAvLyBmZXRjaCBleHRlbnNpb24gb25jZSBvbmx5XG4gICAgICAgIGlmICghdGhpcy5leHRlbnNpb25zW2V4dGVuc2lvbl0pIHtcbiAgICAgICAgICAgIHRoaXMuZXh0ZW5zaW9uc1tleHRlbnNpb25dID0gdGhpcy5nbC5nZXRFeHRlbnNpb24oZXh0ZW5zaW9uKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHJldHVybiBleHRlbnNpb24gaWYgbm8gZnVuY3Rpb24gcmVxdWVzdGVkXG4gICAgICAgIGlmICghd2ViZ2wyRnVuYykgcmV0dXJuIHRoaXMuZXh0ZW5zaW9uc1tleHRlbnNpb25dO1xuXG4gICAgICAgIC8vIFJldHVybiBudWxsIGlmIGV4dGVuc2lvbiBub3Qgc3VwcG9ydGVkXG4gICAgICAgIGlmICghdGhpcy5leHRlbnNpb25zW2V4dGVuc2lvbl0pIHJldHVybiBudWxsO1xuXG4gICAgICAgIC8vIHJldHVybiBleHRlbnNpb24gZnVuY3Rpb24sIGJvdW5kIHRvIGV4dGVuc2lvblxuICAgICAgICByZXR1cm4gdGhpcy5leHRlbnNpb25zW2V4dGVuc2lvbl1bZXh0RnVuY10uYmluZCh0aGlzLmV4dGVuc2lvbnNbZXh0ZW5zaW9uXSk7XG4gICAgfVxuXG4gICAgc29ydE9wYXF1ZShhLCBiKSB7XG4gICAgICAgIGlmIChhLnJlbmRlck9yZGVyICE9PSBiLnJlbmRlck9yZGVyKSB7XG4gICAgICAgICAgICByZXR1cm4gYS5yZW5kZXJPcmRlciAtIGIucmVuZGVyT3JkZXI7XG4gICAgICAgIH0gZWxzZSBpZiAoYS5wcm9ncmFtLmlkICE9PSBiLnByb2dyYW0uaWQpIHtcbiAgICAgICAgICAgIHJldHVybiBhLnByb2dyYW0uaWQgLSBiLnByb2dyYW0uaWQ7XG4gICAgICAgIH0gZWxzZSBpZiAoYS56RGVwdGggIT09IGIuekRlcHRoKSB7XG4gICAgICAgICAgICByZXR1cm4gYS56RGVwdGggLSBiLnpEZXB0aDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBiLmlkIC0gYS5pZDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHNvcnRUcmFuc3BhcmVudChhLCBiKSB7XG4gICAgICAgIGlmIChhLnJlbmRlck9yZGVyICE9PSBiLnJlbmRlck9yZGVyKSB7XG4gICAgICAgICAgICByZXR1cm4gYS5yZW5kZXJPcmRlciAtIGIucmVuZGVyT3JkZXI7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGEuekRlcHRoICE9PSBiLnpEZXB0aCkge1xuICAgICAgICAgICAgcmV0dXJuIGIuekRlcHRoIC0gYS56RGVwdGg7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gYi5pZCAtIGEuaWQ7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzb3J0VUkoYSwgYikge1xuICAgICAgICBpZiAoYS5yZW5kZXJPcmRlciAhPT0gYi5yZW5kZXJPcmRlcikge1xuICAgICAgICAgICAgcmV0dXJuIGEucmVuZGVyT3JkZXIgLSBiLnJlbmRlck9yZGVyO1xuICAgICAgICB9IGVsc2UgaWYgKGEucHJvZ3JhbS5pZCAhPT0gYi5wcm9ncmFtLmlkKSB7XG4gICAgICAgICAgICByZXR1cm4gYS5wcm9ncmFtLmlkIC0gYi5wcm9ncmFtLmlkO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGIuaWQgLSBhLmlkO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZ2V0UmVuZGVyTGlzdCh7IHNjZW5lLCBjYW1lcmEsIGZydXN0dW1DdWxsLCBzb3J0IH0pIHtcbiAgICAgICAgbGV0IHJlbmRlckxpc3QgPSBBcnJheS5pc0FycmF5KHNjZW5lKSA/IFsuLi5zY2VuZV0gOiB0aGlzLnNjZW5lVG9SZW5kZXJMaXN0KHNjZW5lLCBmcnVzdHVtQ3VsbCwgY2FtZXJhKTtcbiAgICAgICAgaWYgKHNvcnQpIHJlbmRlckxpc3QgPSB0aGlzLnNvcnRSZW5kZXJMaXN0KHJlbmRlckxpc3QsIGNhbWVyYSk7XG4gICAgICAgIHJldHVybiByZW5kZXJMaXN0O1xuICAgIH1cblxuICAgIHNjZW5lVG9SZW5kZXJMaXN0KHNjZW5lLCBmcnVzdHVtQ3VsbCwgY2FtZXJhKSB7XG4gICAgICAgIGlmIChjYW1lcmEgJiYgZnJ1c3R1bUN1bGwpIGNhbWVyYS51cGRhdGVGcnVzdHVtKCk7XG4gICAgICAgIGxldCByZW5kZXJMaXN0ID0gW107XG4gICAgICAgIC8vIEdldCB2aXNpYmxlXG4gICAgICAgIHNjZW5lLnRyYXZlcnNlKChub2RlKSA9PiB7XG4gICAgICAgICAgICBpZiAoIW5vZGUudmlzaWJsZSkgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICBpZiAoIW5vZGUuZHJhdykgcmV0dXJuO1xuXG4gICAgICAgICAgICBpZiAoZnJ1c3R1bUN1bGwgJiYgbm9kZS5mcnVzdHVtQ3VsbGVkICYmIGNhbWVyYSkge1xuICAgICAgICAgICAgICAgIGlmICghY2FtZXJhLmZydXN0dW1JbnRlcnNlY3RzTWVzaChub2RlKSkgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZW5kZXJMaXN0LnB1c2gobm9kZSk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gcmVuZGVyTGlzdDtcbiAgICB9XG5cbiAgICBzb3J0UmVuZGVyTGlzdChyZW5kZXJMaXN0LCBjYW1lcmEsIHNwbGl0ID0gZmFsc2UpIHtcbiAgICAgICAgY29uc3Qgb3BhcXVlID0gW107XG4gICAgICAgIGNvbnN0IHRyYW5zcGFyZW50ID0gW107IC8vIGRlcHRoVGVzdCB0cnVlXG4gICAgICAgIGNvbnN0IHVpID0gW107IC8vIGRlcHRoVGVzdCBmYWxzZVxuXG4gICAgICAgIHJlbmRlckxpc3QuZm9yRWFjaCgobm9kZSkgPT4ge1xuICAgICAgICAgICAgLy8gU3BsaXQgaW50byB0aGUgMyByZW5kZXIgZ3JvdXBzXG4gICAgICAgICAgICBpZiAoIW5vZGUucHJvZ3JhbS50cmFuc3BhcmVudCkge1xuICAgICAgICAgICAgICAgIG9wYXF1ZS5wdXNoKG5vZGUpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChub2RlLnByb2dyYW0uZGVwdGhUZXN0KSB7XG4gICAgICAgICAgICAgICAgdHJhbnNwYXJlbnQucHVzaChub2RlKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdWkucHVzaChub2RlKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbm9kZS56RGVwdGggPSAwO1xuXG4gICAgICAgICAgICAvLyBPbmx5IGNhbGN1bGF0ZSB6LWRlcHRoIGlmIHJlbmRlck9yZGVyIHVuc2V0IGFuZCBkZXB0aFRlc3QgaXMgdHJ1ZVxuICAgICAgICAgICAgaWYgKG5vZGUucmVuZGVyT3JkZXIgIT09IDAgfHwgIW5vZGUucHJvZ3JhbS5kZXB0aFRlc3QgfHwgIWNhbWVyYSkgcmV0dXJuO1xuXG4gICAgICAgICAgICAvLyB1cGRhdGUgei1kZXB0aFxuICAgICAgICAgICAgbm9kZS53b3JsZE1hdHJpeC5nZXRUcmFuc2xhdGlvbih0ZW1wVmVjMyk7XG4gICAgICAgICAgICB0ZW1wVmVjMy5hcHBseU1hdHJpeDQoY2FtZXJhLnByb2plY3Rpb25WaWV3TWF0cml4KTtcbiAgICAgICAgICAgIG5vZGUuekRlcHRoID0gdGVtcFZlYzMuejtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgb3BhcXVlLnNvcnQodGhpcy5zb3J0T3BhcXVlKTtcbiAgICAgICAgdHJhbnNwYXJlbnQuc29ydCh0aGlzLnNvcnRUcmFuc3BhcmVudCk7XG4gICAgICAgIHVpLnNvcnQodGhpcy5zb3J0VUkpO1xuXG4gICAgICAgIHJldHVybiBzcGxpdCA/IHtvcGFxdWUsIHRyYW5zcGFyZW50LCB1aX0gOiBvcGFxdWUuY29uY2F0KHRyYW5zcGFyZW50LCB1aSk7XG4gICAgfVxuXG4gICAgcmVuZGVyKHsgc2NlbmUsIGNhbWVyYSwgdGFyZ2V0ID0gbnVsbCwgdXBkYXRlID0gdHJ1ZSwgc29ydCA9IHRydWUsIGZydXN0dW1DdWxsID0gdHJ1ZSwgY2xlYXIsIG92ZXJyaWRlUHJvZ3JhbSB9KSB7XG4gICAgICAgIGlmICh0YXJnZXQgPT09IG51bGwpIHtcbiAgICAgICAgICAgIC8vIG1ha2Ugc3VyZSBubyByZW5kZXIgdGFyZ2V0IGJvdW5kIHNvIGRyYXdzIHRvIGNhbnZhc1xuICAgICAgICAgICAgdGhpcy5iaW5kRnJhbWVidWZmZXIoKTtcbiAgICAgICAgICAgIHRoaXMuc2V0Vmlld3BvcnQodGhpcy53aWR0aCAqIHRoaXMuZHByLCB0aGlzLmhlaWdodCAqIHRoaXMuZHByKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIGJpbmQgc3VwcGxpZWQgcmVuZGVyIHRhcmdldCBhbmQgdXBkYXRlIHZpZXdwb3J0XG4gICAgICAgICAgICB0aGlzLmJpbmRGcmFtZWJ1ZmZlcih0YXJnZXQpO1xuICAgICAgICAgICAgdGhpcy5zZXRWaWV3cG9ydCh0YXJnZXQud2lkdGgsIHRhcmdldC5oZWlnaHQpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGNsZWFyIHx8ICh0aGlzLmF1dG9DbGVhciAmJiBjbGVhciAhPT0gZmFsc2UpKSB7XG4gICAgICAgICAgICAvLyBFbnN1cmUgZGVwdGggYnVmZmVyIHdyaXRpbmcgaXMgZW5hYmxlZCBzbyBpdCBjYW4gYmUgY2xlYXJlZFxuICAgICAgICAgICAgaWYgKHRoaXMuZGVwdGggJiYgKCF0YXJnZXQgfHwgdGFyZ2V0LmRlcHRoKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuZW5hYmxlKHRoaXMuZ2wuREVQVEhfVEVTVCk7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXREZXB0aE1hc2sodHJ1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmdsLmNsZWFyKFxuICAgICAgICAgICAgICAgICh0aGlzLmNvbG9yID8gdGhpcy5nbC5DT0xPUl9CVUZGRVJfQklUIDogMCkgfFxuICAgICAgICAgICAgICAgICAgICAodGhpcy5kZXB0aCA/IHRoaXMuZ2wuREVQVEhfQlVGRkVSX0JJVCA6IDApIHxcbiAgICAgICAgICAgICAgICAgICAgKHRoaXMuc3RlbmNpbCA/IHRoaXMuZ2wuU1RFTkNJTF9CVUZGRVJfQklUIDogMClcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyB1cGRhdGVzIGFsbCBzY2VuZSBncmFwaCBtYXRyaWNlc1xuICAgICAgICBpZiAodXBkYXRlICYmICFBcnJheS5pc0FycmF5KHNjZW5lKSkgc2NlbmUudXBkYXRlTWF0cml4V29ybGQoKTtcblxuICAgICAgICAvLyBVcGRhdGUgY2FtZXJhIHNlcGFyYXRlbHksIGluIGNhc2Ugbm90IGluIHNjZW5lIGdyYXBoXG4gICAgICAgIGlmIChjYW1lcmEpIGNhbWVyYS51cGRhdGVNYXRyaXhXb3JsZCgpO1xuXG4gICAgICAgIC8vIEdldCByZW5kZXIgbGlzdCAtIGVudGFpbHMgY3VsbGluZyBhbmQgc29ydGluZ1xuICAgICAgICBjb25zdCByZW5kZXJMaXN0ID0gdGhpcy5nZXRSZW5kZXJMaXN0KHsgc2NlbmUsIGNhbWVyYSwgZnJ1c3R1bUN1bGwsIHNvcnQsIG92ZXJyaWRlUHJvZ3JhbSB9KTtcblxuICAgICAgICByZW5kZXJMaXN0LmZvckVhY2goKG5vZGUpID0+IHtcbiAgICAgICAgICAgIHRoaXMucmVuZGVyTm9kZShub2RlLCBjYW1lcmEsIG92ZXJyaWRlUHJvZ3JhbSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHJlbmRlck5vZGUobm9kZSwgY2FtZXJhLCBvdmVycmlkZVByb2dyYW0pIHtcbiAgICAgICAgbm9kZS5kcmF3KHtjYW1lcmEsIG92ZXJyaWRlUHJvZ3JhbX0pO1xuICAgIH1cbn1cbiIsIi8vIFRPRE86IGRlbGV0ZSB0ZXh0dXJlXG4vLyBUT0RPOiB1c2UgdGV4U3ViSW1hZ2UyRCBmb3IgdXBkYXRlcyAodmlkZW8gb3Igd2hlbiBsb2FkZWQpXG4vLyBUT0RPOiBuZWVkPyBlbmNvZGluZyA9IGxpbmVhckVuY29kaW5nXG4vLyBUT0RPOiBzdXBwb3J0IG5vbi1jb21wcmVzc2VkIG1pcG1hcHMgdXBsb2Fkc1xuXG5jb25zdCBlbXB0eVBpeGVsID0gbmV3IFVpbnQ4QXJyYXkoNCk7XG5cbmZ1bmN0aW9uIGlzUG93ZXJPZjIodmFsdWUpIHtcbiAgICByZXR1cm4gKHZhbHVlICYgKHZhbHVlIC0gMSkpID09PSAwO1xufVxuXG5sZXQgSUQgPSAxO1xuXG5leHBvcnQgY2xhc3MgVGV4dHVyZSB7XG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIGdsLFxuICAgICAgICB7XG4gICAgICAgICAgICBpbWFnZSxcbiAgICAgICAgICAgIHRhcmdldCA9IGdsLlRFWFRVUkVfMkQsXG4gICAgICAgICAgICB0eXBlID0gZ2wuVU5TSUdORURfQllURSxcbiAgICAgICAgICAgIGZvcm1hdCA9IGdsLlJHQkEsXG4gICAgICAgICAgICBpbnRlcm5hbEZvcm1hdCA9IGZvcm1hdCxcbiAgICAgICAgICAgIHdyYXBTID0gZ2wuQ0xBTVBfVE9fRURHRSxcbiAgICAgICAgICAgIHdyYXBUID0gZ2wuQ0xBTVBfVE9fRURHRSxcbiAgICAgICAgICAgIGdlbmVyYXRlTWlwbWFwcyA9IHRydWUsXG4gICAgICAgICAgICBtaW5GaWx0ZXIgPSBnZW5lcmF0ZU1pcG1hcHMgPyBnbC5ORUFSRVNUX01JUE1BUF9MSU5FQVIgOiBnbC5MSU5FQVIsXG4gICAgICAgICAgICBtYWdGaWx0ZXIgPSBnbC5MSU5FQVIsXG4gICAgICAgICAgICBwcmVtdWx0aXBseUFscGhhID0gZmFsc2UsXG4gICAgICAgICAgICB1bnBhY2tBbGlnbm1lbnQgPSA0LFxuICAgICAgICAgICAgZmxpcFkgPSB0YXJnZXQgPT0gZ2wuVEVYVFVSRV8yRCA/IHRydWUgOiBmYWxzZSxcbiAgICAgICAgICAgIGFuaXNvdHJvcHkgPSAwLFxuICAgICAgICAgICAgbGV2ZWwgPSAwLFxuICAgICAgICAgICAgd2lkdGgsIC8vIHVzZWQgZm9yIFJlbmRlclRhcmdldHMgb3IgRGF0YSBUZXh0dXJlc1xuICAgICAgICAgICAgaGVpZ2h0ID0gd2lkdGgsXG4gICAgICAgIH0gPSB7fVxuICAgICkge1xuICAgICAgICB0aGlzLmdsID0gZ2w7XG4gICAgICAgIHRoaXMuaWQgPSBJRCsrO1xuXG4gICAgICAgIHRoaXMuaW1hZ2UgPSBpbWFnZTtcbiAgICAgICAgdGhpcy50YXJnZXQgPSB0YXJnZXQ7XG4gICAgICAgIHRoaXMudHlwZSA9IHR5cGU7XG4gICAgICAgIHRoaXMuZm9ybWF0ID0gZm9ybWF0O1xuICAgICAgICB0aGlzLmludGVybmFsRm9ybWF0ID0gaW50ZXJuYWxGb3JtYXQ7XG4gICAgICAgIHRoaXMubWluRmlsdGVyID0gbWluRmlsdGVyO1xuICAgICAgICB0aGlzLm1hZ0ZpbHRlciA9IG1hZ0ZpbHRlcjtcbiAgICAgICAgdGhpcy53cmFwUyA9IHdyYXBTO1xuICAgICAgICB0aGlzLndyYXBUID0gd3JhcFQ7XG4gICAgICAgIHRoaXMuZ2VuZXJhdGVNaXBtYXBzID0gZ2VuZXJhdGVNaXBtYXBzO1xuICAgICAgICB0aGlzLnByZW11bHRpcGx5QWxwaGEgPSBwcmVtdWx0aXBseUFscGhhO1xuICAgICAgICB0aGlzLnVucGFja0FsaWdubWVudCA9IHVucGFja0FsaWdubWVudDtcbiAgICAgICAgdGhpcy5mbGlwWSA9IGZsaXBZO1xuICAgICAgICB0aGlzLmFuaXNvdHJvcHkgPSBNYXRoLm1pbihhbmlzb3Ryb3B5LCB0aGlzLmdsLnJlbmRlcmVyLnBhcmFtZXRlcnMubWF4QW5pc290cm9weSk7XG4gICAgICAgIHRoaXMubGV2ZWwgPSBsZXZlbDtcbiAgICAgICAgdGhpcy53aWR0aCA9IHdpZHRoO1xuICAgICAgICB0aGlzLmhlaWdodCA9IGhlaWdodDtcbiAgICAgICAgdGhpcy50ZXh0dXJlID0gdGhpcy5nbC5jcmVhdGVUZXh0dXJlKCk7XG5cbiAgICAgICAgdGhpcy5zdG9yZSA9IHtcbiAgICAgICAgICAgIGltYWdlOiBudWxsLFxuICAgICAgICB9O1xuXG4gICAgICAgIC8vIEFsaWFzIGZvciBzdGF0ZSBzdG9yZSB0byBhdm9pZCByZWR1bmRhbnQgY2FsbHMgZm9yIGdsb2JhbCBzdGF0ZVxuICAgICAgICB0aGlzLmdsU3RhdGUgPSB0aGlzLmdsLnJlbmRlcmVyLnN0YXRlO1xuXG4gICAgICAgIC8vIFN0YXRlIHN0b3JlIHRvIGF2b2lkIHJlZHVuZGFudCBjYWxscyBmb3IgcGVyLXRleHR1cmUgc3RhdGVcbiAgICAgICAgdGhpcy5zdGF0ZSA9IHt9O1xuICAgICAgICB0aGlzLnN0YXRlLm1pbkZpbHRlciA9IHRoaXMuZ2wuTkVBUkVTVF9NSVBNQVBfTElORUFSO1xuICAgICAgICB0aGlzLnN0YXRlLm1hZ0ZpbHRlciA9IHRoaXMuZ2wuTElORUFSO1xuICAgICAgICB0aGlzLnN0YXRlLndyYXBTID0gdGhpcy5nbC5SRVBFQVQ7XG4gICAgICAgIHRoaXMuc3RhdGUud3JhcFQgPSB0aGlzLmdsLlJFUEVBVDtcbiAgICAgICAgdGhpcy5zdGF0ZS5hbmlzb3Ryb3B5ID0gMDtcbiAgICB9XG5cbiAgICBiaW5kKCkge1xuICAgICAgICAvLyBBbHJlYWR5IGJvdW5kIHRvIGFjdGl2ZSB0ZXh0dXJlIHVuaXRcbiAgICAgICAgaWYgKHRoaXMuZ2xTdGF0ZS50ZXh0dXJlVW5pdHNbdGhpcy5nbFN0YXRlLmFjdGl2ZVRleHR1cmVVbml0XSA9PT0gdGhpcy5pZCkgcmV0dXJuO1xuICAgICAgICB0aGlzLmdsLmJpbmRUZXh0dXJlKHRoaXMudGFyZ2V0LCB0aGlzLnRleHR1cmUpO1xuICAgICAgICB0aGlzLmdsU3RhdGUudGV4dHVyZVVuaXRzW3RoaXMuZ2xTdGF0ZS5hY3RpdmVUZXh0dXJlVW5pdF0gPSB0aGlzLmlkO1xuICAgIH1cblxuICAgIHVwZGF0ZSh0ZXh0dXJlVW5pdCA9IDApIHtcbiAgICAgICAgY29uc3QgbmVlZHNVcGRhdGUgPSAhKHRoaXMuaW1hZ2UgPT09IHRoaXMuc3RvcmUuaW1hZ2UgJiYgIXRoaXMubmVlZHNVcGRhdGUpO1xuXG4gICAgICAgIC8vIE1ha2Ugc3VyZSB0aGF0IHRleHR1cmUgaXMgYm91bmQgdG8gaXRzIHRleHR1cmUgdW5pdFxuICAgICAgICBpZiAobmVlZHNVcGRhdGUgfHwgdGhpcy5nbFN0YXRlLnRleHR1cmVVbml0c1t0ZXh0dXJlVW5pdF0gIT09IHRoaXMuaWQpIHtcbiAgICAgICAgICAgIC8vIHNldCBhY3RpdmUgdGV4dHVyZSB1bml0IHRvIHBlcmZvcm0gdGV4dHVyZSBmdW5jdGlvbnNcbiAgICAgICAgICAgIHRoaXMuZ2wucmVuZGVyZXIuYWN0aXZlVGV4dHVyZSh0ZXh0dXJlVW5pdCk7XG4gICAgICAgICAgICB0aGlzLmJpbmQoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghbmVlZHNVcGRhdGUpIHJldHVybjtcbiAgICAgICAgdGhpcy5uZWVkc1VwZGF0ZSA9IGZhbHNlO1xuXG4gICAgICAgIGlmICh0aGlzLmZsaXBZICE9PSB0aGlzLmdsU3RhdGUuZmxpcFkpIHtcbiAgICAgICAgICAgIHRoaXMuZ2wucGl4ZWxTdG9yZWkodGhpcy5nbC5VTlBBQ0tfRkxJUF9ZX1dFQkdMLCB0aGlzLmZsaXBZKTtcbiAgICAgICAgICAgIHRoaXMuZ2xTdGF0ZS5mbGlwWSA9IHRoaXMuZmxpcFk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5wcmVtdWx0aXBseUFscGhhICE9PSB0aGlzLmdsU3RhdGUucHJlbXVsdGlwbHlBbHBoYSkge1xuICAgICAgICAgICAgdGhpcy5nbC5waXhlbFN0b3JlaSh0aGlzLmdsLlVOUEFDS19QUkVNVUxUSVBMWV9BTFBIQV9XRUJHTCwgdGhpcy5wcmVtdWx0aXBseUFscGhhKTtcbiAgICAgICAgICAgIHRoaXMuZ2xTdGF0ZS5wcmVtdWx0aXBseUFscGhhID0gdGhpcy5wcmVtdWx0aXBseUFscGhhO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMudW5wYWNrQWxpZ25tZW50ICE9PSB0aGlzLmdsU3RhdGUudW5wYWNrQWxpZ25tZW50KSB7XG4gICAgICAgICAgICB0aGlzLmdsLnBpeGVsU3RvcmVpKHRoaXMuZ2wuVU5QQUNLX0FMSUdOTUVOVCwgdGhpcy51bnBhY2tBbGlnbm1lbnQpO1xuICAgICAgICAgICAgdGhpcy5nbFN0YXRlLnVucGFja0FsaWdubWVudCA9IHRoaXMudW5wYWNrQWxpZ25tZW50O1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMubWluRmlsdGVyICE9PSB0aGlzLnN0YXRlLm1pbkZpbHRlcikge1xuICAgICAgICAgICAgdGhpcy5nbC50ZXhQYXJhbWV0ZXJpKHRoaXMudGFyZ2V0LCB0aGlzLmdsLlRFWFRVUkVfTUlOX0ZJTFRFUiwgdGhpcy5taW5GaWx0ZXIpO1xuICAgICAgICAgICAgdGhpcy5zdGF0ZS5taW5GaWx0ZXIgPSB0aGlzLm1pbkZpbHRlcjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLm1hZ0ZpbHRlciAhPT0gdGhpcy5zdGF0ZS5tYWdGaWx0ZXIpIHtcbiAgICAgICAgICAgIHRoaXMuZ2wudGV4UGFyYW1ldGVyaSh0aGlzLnRhcmdldCwgdGhpcy5nbC5URVhUVVJFX01BR19GSUxURVIsIHRoaXMubWFnRmlsdGVyKTtcbiAgICAgICAgICAgIHRoaXMuc3RhdGUubWFnRmlsdGVyID0gdGhpcy5tYWdGaWx0ZXI7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy53cmFwUyAhPT0gdGhpcy5zdGF0ZS53cmFwUykge1xuICAgICAgICAgICAgdGhpcy5nbC50ZXhQYXJhbWV0ZXJpKHRoaXMudGFyZ2V0LCB0aGlzLmdsLlRFWFRVUkVfV1JBUF9TLCB0aGlzLndyYXBTKTtcbiAgICAgICAgICAgIHRoaXMuc3RhdGUud3JhcFMgPSB0aGlzLndyYXBTO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMud3JhcFQgIT09IHRoaXMuc3RhdGUud3JhcFQpIHtcbiAgICAgICAgICAgIHRoaXMuZ2wudGV4UGFyYW1ldGVyaSh0aGlzLnRhcmdldCwgdGhpcy5nbC5URVhUVVJFX1dSQVBfVCwgdGhpcy53cmFwVCk7XG4gICAgICAgICAgICB0aGlzLnN0YXRlLndyYXBUID0gdGhpcy53cmFwVDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLmFuaXNvdHJvcHkgJiYgdGhpcy5hbmlzb3Ryb3B5ICE9PSB0aGlzLnN0YXRlLmFuaXNvdHJvcHkpIHtcbiAgICAgICAgICAgIHRoaXMuZ2wudGV4UGFyYW1ldGVyZihcbiAgICAgICAgICAgICAgICB0aGlzLnRhcmdldCxcbiAgICAgICAgICAgICAgICB0aGlzLmdsLnJlbmRlcmVyLmdldEV4dGVuc2lvbignRVhUX3RleHR1cmVfZmlsdGVyX2FuaXNvdHJvcGljJykuVEVYVFVSRV9NQVhfQU5JU09UUk9QWV9FWFQsXG4gICAgICAgICAgICAgICAgdGhpcy5hbmlzb3Ryb3B5XG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgdGhpcy5zdGF0ZS5hbmlzb3Ryb3B5ID0gdGhpcy5hbmlzb3Ryb3B5O1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuaW1hZ2UpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmltYWdlLndpZHRoKSB7XG4gICAgICAgICAgICAgICAgdGhpcy53aWR0aCA9IHRoaXMuaW1hZ2Uud2lkdGg7XG4gICAgICAgICAgICAgICAgdGhpcy5oZWlnaHQgPSB0aGlzLmltYWdlLmhlaWdodDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHRoaXMudGFyZ2V0ID09PSB0aGlzLmdsLlRFWFRVUkVfQ1VCRV9NQVApIHtcbiAgICAgICAgICAgICAgICAvLyBGb3IgY3ViZSBtYXBzXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCA2OyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5nbC50ZXhJbWFnZTJEKFxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5nbC5URVhUVVJFX0NVQkVfTUFQX1BPU0lUSVZFX1ggKyBpLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5sZXZlbCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaW50ZXJuYWxGb3JtYXQsXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmZvcm1hdCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudHlwZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaW1hZ2VbaV1cbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYgKEFycmF5QnVmZmVyLmlzVmlldyh0aGlzLmltYWdlKSkge1xuICAgICAgICAgICAgICAgIC8vIERhdGEgdGV4dHVyZVxuICAgICAgICAgICAgICAgIHRoaXMuZ2wudGV4SW1hZ2UyRCh0aGlzLnRhcmdldCwgdGhpcy5sZXZlbCwgdGhpcy5pbnRlcm5hbEZvcm1hdCwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQsIDAsIHRoaXMuZm9ybWF0LCB0aGlzLnR5cGUsIHRoaXMuaW1hZ2UpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLmltYWdlLmlzQ29tcHJlc3NlZFRleHR1cmUpIHtcbiAgICAgICAgICAgICAgICAvLyBDb21wcmVzc2VkIHRleHR1cmVcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBsZXZlbCA9IDA7IGxldmVsIDwgdGhpcy5pbWFnZS5sZW5ndGg7IGxldmVsKyspIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5nbC5jb21wcmVzc2VkVGV4SW1hZ2UyRChcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudGFyZ2V0LFxuICAgICAgICAgICAgICAgICAgICAgICAgbGV2ZWwsXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmludGVybmFsRm9ybWF0LFxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbWFnZVtsZXZlbF0ud2lkdGgsXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmltYWdlW2xldmVsXS5oZWlnaHQsXG4gICAgICAgICAgICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbWFnZVtsZXZlbF0uZGF0YVxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gUmVndWxhciB0ZXh0dXJlXG4gICAgICAgICAgICAgICAgdGhpcy5nbC50ZXhJbWFnZTJEKHRoaXMudGFyZ2V0LCB0aGlzLmxldmVsLCB0aGlzLmludGVybmFsRm9ybWF0LCB0aGlzLmZvcm1hdCwgdGhpcy50eXBlLCB0aGlzLmltYWdlKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHRoaXMuZ2VuZXJhdGVNaXBtYXBzKSB7XG4gICAgICAgICAgICAgICAgLy8gRm9yIFdlYkdMMSwgaWYgbm90IGEgcG93ZXIgb2YgMiwgdHVybiBvZmYgbWlwcywgc2V0IHdyYXBwaW5nIHRvIGNsYW1wIHRvIGVkZ2UgYW5kIG1pbkZpbHRlciB0byBsaW5lYXJcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMuZ2wucmVuZGVyZXIuaXNXZWJnbDIgJiYgKCFpc1Bvd2VyT2YyKHRoaXMuaW1hZ2Uud2lkdGgpIHx8ICFpc1Bvd2VyT2YyKHRoaXMuaW1hZ2UuaGVpZ2h0KSkpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5nZW5lcmF0ZU1pcG1hcHMgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy53cmFwUyA9IHRoaXMud3JhcFQgPSB0aGlzLmdsLkNMQU1QX1RPX0VER0U7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubWluRmlsdGVyID0gdGhpcy5nbC5MSU5FQVI7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5nbC5nZW5lcmF0ZU1pcG1hcCh0aGlzLnRhcmdldCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBDYWxsYmFjayBmb3Igd2hlbiBkYXRhIGlzIHB1c2hlZCB0byBHUFVcbiAgICAgICAgICAgIHRoaXMub25VcGRhdGUgJiYgdGhpcy5vblVwZGF0ZSgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKHRoaXMudGFyZ2V0ID09PSB0aGlzLmdsLlRFWFRVUkVfQ1VCRV9NQVApIHtcbiAgICAgICAgICAgICAgICAvLyBVcGxvYWQgZW1wdHkgcGl4ZWwgZm9yIGVhY2ggc2lkZSB3aGlsZSBubyBpbWFnZSB0byBhdm9pZCBlcnJvcnMgd2hpbGUgaW1hZ2Ugb3IgdmlkZW8gbG9hZGluZ1xuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgNjsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZ2wudGV4SW1hZ2UyRChcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZ2wuVEVYVFVSRV9DVUJFX01BUF9QT1NJVElWRV9YICsgaSxcbiAgICAgICAgICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmdsLlJHQkEsXG4gICAgICAgICAgICAgICAgICAgICAgICAxLFxuICAgICAgICAgICAgICAgICAgICAgICAgMSxcbiAgICAgICAgICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmdsLlJHQkEsXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmdsLlVOU0lHTkVEX0JZVEUsXG4gICAgICAgICAgICAgICAgICAgICAgICBlbXB0eVBpeGVsXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLndpZHRoKSB7XG4gICAgICAgICAgICAgICAgLy8gaW1hZ2UgaW50ZW50aW9uYWxseSBsZWZ0IG51bGwgZm9yIFJlbmRlclRhcmdldFxuICAgICAgICAgICAgICAgIHRoaXMuZ2wudGV4SW1hZ2UyRCh0aGlzLnRhcmdldCwgdGhpcy5sZXZlbCwgdGhpcy5pbnRlcm5hbEZvcm1hdCwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQsIDAsIHRoaXMuZm9ybWF0LCB0aGlzLnR5cGUsIG51bGwpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBVcGxvYWQgZW1wdHkgcGl4ZWwgaWYgbm8gaW1hZ2UgdG8gYXZvaWQgZXJyb3JzIHdoaWxlIGltYWdlIG9yIHZpZGVvIGxvYWRpbmdcbiAgICAgICAgICAgICAgICB0aGlzLmdsLnRleEltYWdlMkQodGhpcy50YXJnZXQsIDAsIHRoaXMuZ2wuUkdCQSwgMSwgMSwgMCwgdGhpcy5nbC5SR0JBLCB0aGlzLmdsLlVOU0lHTkVEX0JZVEUsIGVtcHR5UGl4ZWwpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHRoaXMuc3RvcmUuaW1hZ2UgPSB0aGlzLmltYWdlO1xuICAgIH1cblxuICAgIGRpc3Bvc2UoKSB7XG4gICAgICAgIHRoaXMuZ2wuZGVsZXRlVGV4dHVyZSh0aGlzLnRleHR1cmUpO1xuICAgICAgICB0aGlzLnRleHR1cmUgPSBudWxsO1xuICAgIH1cbn1cbiIsImltcG9ydCB7IFZlYzMgfSBmcm9tICcuLi9tYXRoL1ZlYzMuanMnO1xuaW1wb3J0IHsgUXVhdCB9IGZyb20gJy4uL21hdGgvUXVhdC5qcyc7XG5pbXBvcnQgeyBNYXQ0IH0gZnJvbSAnLi4vbWF0aC9NYXQ0LmpzJztcbmltcG9ydCB7IEV1bGVyIH0gZnJvbSAnLi4vbWF0aC9FdWxlci5qcyc7XG5cbmV4cG9ydCBjbGFzcyBUcmFuc2Zvcm0ge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLnBhcmVudCA9IG51bGw7XG4gICAgICAgIHRoaXMuY2hpbGRyZW4gPSBbXTtcbiAgICAgICAgdGhpcy52aXNpYmxlID0gdHJ1ZTtcblxuICAgICAgICB0aGlzLm1hdHJpeCA9IG5ldyBNYXQ0KCk7XG4gICAgICAgIHRoaXMud29ybGRNYXRyaXggPSBuZXcgTWF0NCgpO1xuICAgICAgICB0aGlzLm1hdHJpeEF1dG9VcGRhdGUgPSB0cnVlO1xuXG4gICAgICAgIHRoaXMucG9zaXRpb24gPSBuZXcgVmVjMygpO1xuICAgICAgICB0aGlzLnF1YXRlcm5pb24gPSBuZXcgUXVhdCgpO1xuICAgICAgICB0aGlzLnNjYWxlID0gbmV3IFZlYzMoMSk7XG4gICAgICAgIHRoaXMucm90YXRpb24gPSBuZXcgRXVsZXIoKTtcbiAgICAgICAgdGhpcy51cCA9IG5ldyBWZWMzKDAsIDEsIDApO1xuXG4gICAgICAgIHRoaXMucm90YXRpb24ub25DaGFuZ2UgPSAoKSA9PiB0aGlzLnF1YXRlcm5pb24uZnJvbUV1bGVyKHRoaXMucm90YXRpb24pO1xuICAgICAgICB0aGlzLnF1YXRlcm5pb24ub25DaGFuZ2UgPSAoKSA9PiB0aGlzLnJvdGF0aW9uLmZyb21RdWF0ZXJuaW9uKHRoaXMucXVhdGVybmlvbik7XG4gICAgfVxuXG4gICAgc2V0UGFyZW50KHBhcmVudCwgbm90aWZ5UGFyZW50ID0gdHJ1ZSkge1xuICAgICAgICBpZiAodGhpcy5wYXJlbnQgJiYgcGFyZW50ICE9PSB0aGlzLnBhcmVudCkgdGhpcy5wYXJlbnQucmVtb3ZlQ2hpbGQodGhpcywgZmFsc2UpO1xuICAgICAgICB0aGlzLnBhcmVudCA9IHBhcmVudDtcbiAgICAgICAgaWYgKG5vdGlmeVBhcmVudCAmJiBwYXJlbnQpIHBhcmVudC5hZGRDaGlsZCh0aGlzLCBmYWxzZSk7XG4gICAgfVxuXG4gICAgYWRkQ2hpbGQoY2hpbGQsIG5vdGlmeUNoaWxkID0gdHJ1ZSkge1xuICAgICAgICBpZiAoIX50aGlzLmNoaWxkcmVuLmluZGV4T2YoY2hpbGQpKSB0aGlzLmNoaWxkcmVuLnB1c2goY2hpbGQpO1xuICAgICAgICBpZiAobm90aWZ5Q2hpbGQpIGNoaWxkLnNldFBhcmVudCh0aGlzLCBmYWxzZSk7XG4gICAgfVxuXG4gICAgcmVtb3ZlQ2hpbGQoY2hpbGQsIG5vdGlmeUNoaWxkID0gdHJ1ZSkge1xuICAgICAgICBpZiAoISF+dGhpcy5jaGlsZHJlbi5pbmRleE9mKGNoaWxkKSkgdGhpcy5jaGlsZHJlbi5zcGxpY2UodGhpcy5jaGlsZHJlbi5pbmRleE9mKGNoaWxkKSwgMSk7XG4gICAgICAgIGlmIChub3RpZnlDaGlsZCkgY2hpbGQuc2V0UGFyZW50KG51bGwsIGZhbHNlKTtcbiAgICB9XG5cbiAgICB1cGRhdGVNYXRyaXhXb3JsZChmb3JjZSkge1xuICAgICAgICBpZiAodGhpcy5tYXRyaXhBdXRvVXBkYXRlKSB0aGlzLnVwZGF0ZU1hdHJpeCgpO1xuICAgICAgICBpZiAodGhpcy53b3JsZE1hdHJpeE5lZWRzVXBkYXRlIHx8IGZvcmNlKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5wYXJlbnQgPT09IG51bGwpIHRoaXMud29ybGRNYXRyaXguY29weSh0aGlzLm1hdHJpeCk7XG4gICAgICAgICAgICBlbHNlIHRoaXMud29ybGRNYXRyaXgubXVsdGlwbHkodGhpcy5wYXJlbnQud29ybGRNYXRyaXgsIHRoaXMubWF0cml4KTtcbiAgICAgICAgICAgIHRoaXMud29ybGRNYXRyaXhOZWVkc1VwZGF0ZSA9IGZhbHNlO1xuICAgICAgICAgICAgZm9yY2UgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yIChsZXQgaSA9IDAsIGwgPSB0aGlzLmNoaWxkcmVuLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICAgICAgdGhpcy5jaGlsZHJlbltpXS51cGRhdGVNYXRyaXhXb3JsZChmb3JjZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB1cGRhdGVNYXRyaXgoKSB7XG4gICAgICAgIHRoaXMubWF0cml4LmNvbXBvc2UodGhpcy5xdWF0ZXJuaW9uLCB0aGlzLnBvc2l0aW9uLCB0aGlzLnNjYWxlKTtcbiAgICAgICAgdGhpcy53b3JsZE1hdHJpeE5lZWRzVXBkYXRlID0gdHJ1ZTtcbiAgICB9XG5cbiAgICB0cmF2ZXJzZShjYWxsYmFjaykge1xuICAgICAgICAvLyBSZXR1cm4gdHJ1ZSBpbiBjYWxsYmFjayB0byBzdG9wIHRyYXZlcnNpbmcgY2hpbGRyZW5cbiAgICAgICAgaWYgKGNhbGxiYWNrKHRoaXMpKSByZXR1cm47XG4gICAgICAgIGZvciAobGV0IGkgPSAwLCBsID0gdGhpcy5jaGlsZHJlbi5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgICAgIHRoaXMuY2hpbGRyZW5baV0udHJhdmVyc2UoY2FsbGJhY2spO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZGVjb21wb3NlKCkge1xuICAgICAgICB0aGlzLm1hdHJpeC5nZXRUcmFuc2xhdGlvbih0aGlzLnBvc2l0aW9uKTtcbiAgICAgICAgdGhpcy5tYXRyaXguZ2V0Um90YXRpb24odGhpcy5xdWF0ZXJuaW9uKTtcbiAgICAgICAgdGhpcy5tYXRyaXguZ2V0U2NhbGluZyh0aGlzLnNjYWxlKTtcbiAgICAgICAgdGhpcy5yb3RhdGlvbi5mcm9tUXVhdGVybmlvbih0aGlzLnF1YXRlcm5pb24pO1xuICAgIH1cblxuICAgIGxvb2tBdCh0YXJnZXQsIGludmVydCA9IGZhbHNlKSB7XG4gICAgICAgIGlmIChpbnZlcnQpIHRoaXMubWF0cml4Lmxvb2tBdCh0aGlzLnBvc2l0aW9uLCB0YXJnZXQsIHRoaXMudXApO1xuICAgICAgICBlbHNlIHRoaXMubWF0cml4Lmxvb2tBdCh0YXJnZXQsIHRoaXMucG9zaXRpb24sIHRoaXMudXApO1xuICAgICAgICB0aGlzLm1hdHJpeC5nZXRSb3RhdGlvbih0aGlzLnF1YXRlcm5pb24pO1xuICAgICAgICB0aGlzLnJvdGF0aW9uLmZyb21RdWF0ZXJuaW9uKHRoaXMucXVhdGVybmlvbik7XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgVmVjMyB9IGZyb20gJy4uL21hdGgvVmVjMy5qcyc7XG5pbXBvcnQgeyBRdWF0IH0gZnJvbSAnLi4vbWF0aC9RdWF0LmpzJztcblxuY29uc3QgcHJldlBvcyA9IG5ldyBWZWMzKCk7XG5jb25zdCBwcmV2Um90ID0gbmV3IFF1YXQoKTtcbmNvbnN0IHByZXZTY2wgPSBuZXcgVmVjMygpO1xuXG5jb25zdCBuZXh0UG9zID0gbmV3IFZlYzMoKTtcbmNvbnN0IG5leHRSb3QgPSBuZXcgUXVhdCgpO1xuY29uc3QgbmV4dFNjbCA9IG5ldyBWZWMzKCk7XG5cbmV4cG9ydCBjbGFzcyBBbmltYXRpb24ge1xuICAgIGNvbnN0cnVjdG9yKHsgb2JqZWN0cywgZGF0YSB9KSB7XG4gICAgICAgIHRoaXMub2JqZWN0cyA9IG9iamVjdHM7XG4gICAgICAgIHRoaXMuZGF0YSA9IGRhdGE7XG4gICAgICAgIHRoaXMuZWxhcHNlZCA9IDA7XG4gICAgICAgIHRoaXMud2VpZ2h0ID0gMTtcbiAgICAgICAgdGhpcy5kdXJhdGlvbiA9IGRhdGEuZnJhbWVzLmxlbmd0aCAtIDE7XG4gICAgfVxuXG4gICAgdXBkYXRlKHRvdGFsV2VpZ2h0ID0gMSwgaXNTZXQpIHtcbiAgICAgICAgY29uc3Qgd2VpZ2h0ID0gaXNTZXQgPyAxIDogdGhpcy53ZWlnaHQgLyB0b3RhbFdlaWdodDtcbiAgICAgICAgY29uc3QgZWxhcHNlZCA9IHRoaXMuZWxhcHNlZCAlIHRoaXMuZHVyYXRpb247XG5cbiAgICAgICAgY29uc3QgZmxvb3JGcmFtZSA9IE1hdGguZmxvb3IoZWxhcHNlZCk7XG4gICAgICAgIGNvbnN0IGJsZW5kID0gZWxhcHNlZCAtIGZsb29yRnJhbWU7XG4gICAgICAgIGNvbnN0IHByZXZLZXkgPSB0aGlzLmRhdGEuZnJhbWVzW2Zsb29yRnJhbWVdO1xuICAgICAgICBjb25zdCBuZXh0S2V5ID0gdGhpcy5kYXRhLmZyYW1lc1soZmxvb3JGcmFtZSArIDEpICUgdGhpcy5kdXJhdGlvbl07XG5cbiAgICAgICAgdGhpcy5vYmplY3RzLmZvckVhY2goKG9iamVjdCwgaSkgPT4ge1xuICAgICAgICAgICAgcHJldlBvcy5mcm9tQXJyYXkocHJldktleS5wb3NpdGlvbiwgaSAqIDMpO1xuICAgICAgICAgICAgcHJldlJvdC5mcm9tQXJyYXkocHJldktleS5xdWF0ZXJuaW9uLCBpICogNCk7XG4gICAgICAgICAgICBwcmV2U2NsLmZyb21BcnJheShwcmV2S2V5LnNjYWxlLCBpICogMyk7XG5cbiAgICAgICAgICAgIG5leHRQb3MuZnJvbUFycmF5KG5leHRLZXkucG9zaXRpb24sIGkgKiAzKTtcbiAgICAgICAgICAgIG5leHRSb3QuZnJvbUFycmF5KG5leHRLZXkucXVhdGVybmlvbiwgaSAqIDQpO1xuICAgICAgICAgICAgbmV4dFNjbC5mcm9tQXJyYXkobmV4dEtleS5zY2FsZSwgaSAqIDMpO1xuXG4gICAgICAgICAgICBwcmV2UG9zLmxlcnAobmV4dFBvcywgYmxlbmQpO1xuICAgICAgICAgICAgcHJldlJvdC5zbGVycChuZXh0Um90LCBibGVuZCk7XG4gICAgICAgICAgICBwcmV2U2NsLmxlcnAobmV4dFNjbCwgYmxlbmQpO1xuXG4gICAgICAgICAgICBvYmplY3QucG9zaXRpb24ubGVycChwcmV2UG9zLCB3ZWlnaHQpO1xuICAgICAgICAgICAgb2JqZWN0LnF1YXRlcm5pb24uc2xlcnAocHJldlJvdCwgd2VpZ2h0KTtcbiAgICAgICAgICAgIG9iamVjdC5zY2FsZS5sZXJwKHByZXZTY2wsIHdlaWdodCk7XG4gICAgICAgIH0pO1xuICAgIH1cbn1cbiIsImltcG9ydCB7IEdlb21ldHJ5IH0gZnJvbSAnLi4vY29yZS9HZW9tZXRyeS5qcyc7XG5pbXBvcnQgeyBQbGFuZSB9IGZyb20gJy4vUGxhbmUuanMnO1xuXG5leHBvcnQgY2xhc3MgQm94IGV4dGVuZHMgR2VvbWV0cnkge1xuICAgIGNvbnN0cnVjdG9yKGdsLCB7IHdpZHRoID0gMSwgaGVpZ2h0ID0gMSwgZGVwdGggPSAxLCB3aWR0aFNlZ21lbnRzID0gMSwgaGVpZ2h0U2VnbWVudHMgPSAxLCBkZXB0aFNlZ21lbnRzID0gMSwgYXR0cmlidXRlcyA9IHt9IH0gPSB7fSkge1xuICAgICAgICBjb25zdCB3U2VncyA9IHdpZHRoU2VnbWVudHM7XG4gICAgICAgIGNvbnN0IGhTZWdzID0gaGVpZ2h0U2VnbWVudHM7XG4gICAgICAgIGNvbnN0IGRTZWdzID0gZGVwdGhTZWdtZW50cztcblxuICAgICAgICBjb25zdCBudW0gPSAod1NlZ3MgKyAxKSAqIChoU2VncyArIDEpICogMiArICh3U2VncyArIDEpICogKGRTZWdzICsgMSkgKiAyICsgKGhTZWdzICsgMSkgKiAoZFNlZ3MgKyAxKSAqIDI7XG4gICAgICAgIGNvbnN0IG51bUluZGljZXMgPSAod1NlZ3MgKiBoU2VncyAqIDIgKyB3U2VncyAqIGRTZWdzICogMiArIGhTZWdzICogZFNlZ3MgKiAyKSAqIDY7XG5cbiAgICAgICAgY29uc3QgcG9zaXRpb24gPSBuZXcgRmxvYXQzMkFycmF5KG51bSAqIDMpO1xuICAgICAgICBjb25zdCBub3JtYWwgPSBuZXcgRmxvYXQzMkFycmF5KG51bSAqIDMpO1xuICAgICAgICBjb25zdCB1diA9IG5ldyBGbG9hdDMyQXJyYXkobnVtICogMik7XG4gICAgICAgIGNvbnN0IGluZGV4ID0gbnVtID4gNjU1MzYgPyBuZXcgVWludDMyQXJyYXkobnVtSW5kaWNlcykgOiBuZXcgVWludDE2QXJyYXkobnVtSW5kaWNlcyk7XG5cbiAgICAgICAgbGV0IGkgPSAwO1xuICAgICAgICBsZXQgaWkgPSAwO1xuXG4gICAgICAgIC8vIGxlZnQsIHJpZ2h0XG4gICAgICAgIFBsYW5lLmJ1aWxkUGxhbmUocG9zaXRpb24sIG5vcm1hbCwgdXYsIGluZGV4LCBkZXB0aCwgaGVpZ2h0LCB3aWR0aCwgZFNlZ3MsIGhTZWdzLCAyLCAxLCAwLCAtMSwgLTEsIGksIGlpKTtcbiAgICAgICAgUGxhbmUuYnVpbGRQbGFuZShcbiAgICAgICAgICAgIHBvc2l0aW9uLFxuICAgICAgICAgICAgbm9ybWFsLFxuICAgICAgICAgICAgdXYsXG4gICAgICAgICAgICBpbmRleCxcbiAgICAgICAgICAgIGRlcHRoLFxuICAgICAgICAgICAgaGVpZ2h0LFxuICAgICAgICAgICAgLXdpZHRoLFxuICAgICAgICAgICAgZFNlZ3MsXG4gICAgICAgICAgICBoU2VncyxcbiAgICAgICAgICAgIDIsXG4gICAgICAgICAgICAxLFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDEsXG4gICAgICAgICAgICAtMSxcbiAgICAgICAgICAgIChpICs9IChkU2VncyArIDEpICogKGhTZWdzICsgMSkpLFxuICAgICAgICAgICAgKGlpICs9IGRTZWdzICogaFNlZ3MpXG4gICAgICAgICk7XG5cbiAgICAgICAgLy8gdG9wLCBib3R0b21cbiAgICAgICAgUGxhbmUuYnVpbGRQbGFuZShcbiAgICAgICAgICAgIHBvc2l0aW9uLFxuICAgICAgICAgICAgbm9ybWFsLFxuICAgICAgICAgICAgdXYsXG4gICAgICAgICAgICBpbmRleCxcbiAgICAgICAgICAgIHdpZHRoLFxuICAgICAgICAgICAgZGVwdGgsXG4gICAgICAgICAgICBoZWlnaHQsXG4gICAgICAgICAgICBkU2VncyxcbiAgICAgICAgICAgIGhTZWdzLFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDIsXG4gICAgICAgICAgICAxLFxuICAgICAgICAgICAgMSxcbiAgICAgICAgICAgIDEsXG4gICAgICAgICAgICAoaSArPSAoZFNlZ3MgKyAxKSAqIChoU2VncyArIDEpKSxcbiAgICAgICAgICAgIChpaSArPSBkU2VncyAqIGhTZWdzKVxuICAgICAgICApO1xuICAgICAgICBQbGFuZS5idWlsZFBsYW5lKFxuICAgICAgICAgICAgcG9zaXRpb24sXG4gICAgICAgICAgICBub3JtYWwsXG4gICAgICAgICAgICB1dixcbiAgICAgICAgICAgIGluZGV4LFxuICAgICAgICAgICAgd2lkdGgsXG4gICAgICAgICAgICBkZXB0aCxcbiAgICAgICAgICAgIC1oZWlnaHQsXG4gICAgICAgICAgICBkU2VncyxcbiAgICAgICAgICAgIGhTZWdzLFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDIsXG4gICAgICAgICAgICAxLFxuICAgICAgICAgICAgMSxcbiAgICAgICAgICAgIC0xLFxuICAgICAgICAgICAgKGkgKz0gKHdTZWdzICsgMSkgKiAoZFNlZ3MgKyAxKSksXG4gICAgICAgICAgICAoaWkgKz0gd1NlZ3MgKiBkU2VncylcbiAgICAgICAgKTtcblxuICAgICAgICAvLyBmcm9udCwgYmFja1xuICAgICAgICBQbGFuZS5idWlsZFBsYW5lKFxuICAgICAgICAgICAgcG9zaXRpb24sXG4gICAgICAgICAgICBub3JtYWwsXG4gICAgICAgICAgICB1dixcbiAgICAgICAgICAgIGluZGV4LFxuICAgICAgICAgICAgd2lkdGgsXG4gICAgICAgICAgICBoZWlnaHQsXG4gICAgICAgICAgICAtZGVwdGgsXG4gICAgICAgICAgICB3U2VncyxcbiAgICAgICAgICAgIGhTZWdzLFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDEsXG4gICAgICAgICAgICAyLFxuICAgICAgICAgICAgLTEsXG4gICAgICAgICAgICAtMSxcbiAgICAgICAgICAgIChpICs9ICh3U2VncyArIDEpICogKGRTZWdzICsgMSkpLFxuICAgICAgICAgICAgKGlpICs9IHdTZWdzICogZFNlZ3MpXG4gICAgICAgICk7XG4gICAgICAgIFBsYW5lLmJ1aWxkUGxhbmUoXG4gICAgICAgICAgICBwb3NpdGlvbixcbiAgICAgICAgICAgIG5vcm1hbCxcbiAgICAgICAgICAgIHV2LFxuICAgICAgICAgICAgaW5kZXgsXG4gICAgICAgICAgICB3aWR0aCxcbiAgICAgICAgICAgIGhlaWdodCxcbiAgICAgICAgICAgIGRlcHRoLFxuICAgICAgICAgICAgd1NlZ3MsXG4gICAgICAgICAgICBoU2VncyxcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAxLFxuICAgICAgICAgICAgMixcbiAgICAgICAgICAgIDEsXG4gICAgICAgICAgICAtMSxcbiAgICAgICAgICAgIChpICs9ICh3U2VncyArIDEpICogKGhTZWdzICsgMSkpLFxuICAgICAgICAgICAgKGlpICs9IHdTZWdzICogaFNlZ3MpXG4gICAgICAgICk7XG5cbiAgICAgICAgT2JqZWN0LmFzc2lnbihhdHRyaWJ1dGVzLCB7XG4gICAgICAgICAgICBwb3NpdGlvbjogeyBzaXplOiAzLCBkYXRhOiBwb3NpdGlvbiB9LFxuICAgICAgICAgICAgbm9ybWFsOiB7IHNpemU6IDMsIGRhdGE6IG5vcm1hbCB9LFxuICAgICAgICAgICAgdXY6IHsgc2l6ZTogMiwgZGF0YTogdXYgfSxcbiAgICAgICAgICAgIGluZGV4OiB7IGRhdGE6IGluZGV4IH0sXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHN1cGVyKGdsLCBhdHRyaWJ1dGVzKTtcbiAgICB9XG59XG4iLCJpbXBvcnQgeyBWZWMzIH0gZnJvbSAnLi4vbWF0aC9WZWMzLmpzJztcblxuY29uc3QgQ0FUTVVMTFJPTSA9ICdjYXRtdWxscm9tJztcbmNvbnN0IENVQklDQkVaSUVSID0gJ2N1YmljYmV6aWVyJztcbmNvbnN0IFFVQURSQVRJQ0JFWklFUiA9ICdxdWFkcmF0aWNiZXppZXInO1xuXG4vLyB0ZW1wXG5jb25zdCBfYTAgPSBuZXcgVmVjMygpLFxuICAgIF9hMSA9IG5ldyBWZWMzKCksXG4gICAgX2EyID0gbmV3IFZlYzMoKSxcbiAgICBfYTMgPSBuZXcgVmVjMygpO1xuXG4vKipcbiAqIEdldCB0aGUgY29udHJvbCBwb2ludHMgb2YgY3ViaWMgYmV6aWVyIGN1cnZlLlxuICogQHBhcmFtIHsqfSBpXG4gKiBAcGFyYW0geyp9IGFcbiAqIEBwYXJhbSB7Kn0gYlxuICovXG5mdW5jdGlvbiBnZXRDdHJsUG9pbnQocG9pbnRzLCBpLCBhID0gMC4xNjgsIGIgPSAwLjE2OCkge1xuICAgIGlmIChpIDwgMSkge1xuICAgICAgICBfYTAuc3ViKHBvaW50c1sxXSwgcG9pbnRzWzBdKS5zY2FsZShhKS5hZGQocG9pbnRzWzBdKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBfYTAuc3ViKHBvaW50c1tpICsgMV0sIHBvaW50c1tpIC0gMV0pXG4gICAgICAgICAgICAuc2NhbGUoYSlcbiAgICAgICAgICAgIC5hZGQocG9pbnRzW2ldKTtcbiAgICB9XG4gICAgaWYgKGkgPiBwb2ludHMubGVuZ3RoIC0gMykge1xuICAgICAgICBjb25zdCBsYXN0ID0gcG9pbnRzLmxlbmd0aCAtIDE7XG4gICAgICAgIF9hMS5zdWIocG9pbnRzW2xhc3QgLSAxXSwgcG9pbnRzW2xhc3RdKVxuICAgICAgICAgICAgLnNjYWxlKGIpXG4gICAgICAgICAgICAuYWRkKHBvaW50c1tsYXN0XSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgX2ExLnN1Yihwb2ludHNbaV0sIHBvaW50c1tpICsgMl0pXG4gICAgICAgICAgICAuc2NhbGUoYilcbiAgICAgICAgICAgIC5hZGQocG9pbnRzW2kgKyAxXSk7XG4gICAgfVxuICAgIHJldHVybiBbX2EwLmNsb25lKCksIF9hMS5jbG9uZSgpXTtcbn1cblxuZnVuY3Rpb24gZ2V0UXVhZHJhdGljQmV6aWVyUG9pbnQodCwgcDAsIGMwLCBwMSkge1xuICAgIGNvbnN0IGsgPSAxIC0gdDtcbiAgICBfYTAuY29weShwMCkuc2NhbGUoayAqKiAyKTtcbiAgICBfYTEuY29weShjMCkuc2NhbGUoMiAqIGsgKiB0KTtcbiAgICBfYTIuY29weShwMSkuc2NhbGUodCAqKiAyKTtcbiAgICBjb25zdCByZXQgPSBuZXcgVmVjMygpO1xuICAgIHJldC5hZGQoX2EwLCBfYTEpLmFkZChfYTIpO1xuICAgIHJldHVybiByZXQ7XG59XG5cbmZ1bmN0aW9uIGdldEN1YmljQmV6aWVyUG9pbnQodCwgcDAsIGMwLCBjMSwgcDEpIHtcbiAgICBjb25zdCBrID0gMSAtIHQ7XG4gICAgX2EwLmNvcHkocDApLnNjYWxlKGsgKiogMyk7XG4gICAgX2ExLmNvcHkoYzApLnNjYWxlKDMgKiBrICoqIDIgKiB0KTtcbiAgICBfYTIuY29weShjMSkuc2NhbGUoMyAqIGsgKiB0ICoqIDIpO1xuICAgIF9hMy5jb3B5KHAxKS5zY2FsZSh0ICoqIDMpO1xuICAgIGNvbnN0IHJldCA9IG5ldyBWZWMzKCk7XG4gICAgcmV0LmFkZChfYTAsIF9hMSkuYWRkKF9hMikuYWRkKF9hMyk7XG4gICAgcmV0dXJuIHJldDtcbn1cblxuZXhwb3J0IGNsYXNzIEN1cnZlIHtcbiAgICBjb25zdHJ1Y3Rvcih7IHBvaW50cyA9IFtuZXcgVmVjMygwLCAwLCAwKSwgbmV3IFZlYzMoMCwgMSwgMCksIG5ldyBWZWMzKDEsIDEsIDApLCBuZXcgVmVjMygxLCAwLCAwKV0sIGRpdmlzaW9ucyA9IDEyLCB0eXBlID0gQ0FUTVVMTFJPTSB9ID0ge30pIHtcbiAgICAgICAgdGhpcy5wb2ludHMgPSBwb2ludHM7XG4gICAgICAgIHRoaXMuZGl2aXNpb25zID0gZGl2aXNpb25zO1xuICAgICAgICB0aGlzLnR5cGUgPSB0eXBlO1xuICAgIH1cblxuICAgIF9nZXRRdWFkcmF0aWNCZXppZXJQb2ludHMoZGl2aXNpb25zID0gdGhpcy5kaXZpc2lvbnMpIHtcbiAgICAgICAgY29uc3QgcG9pbnRzID0gW107XG4gICAgICAgIGNvbnN0IGNvdW50ID0gdGhpcy5wb2ludHMubGVuZ3RoO1xuXG4gICAgICAgIGlmIChjb3VudCA8IDMpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybignTm90IGVub3VnaCBwb2ludHMgcHJvdmlkZWQuJyk7XG4gICAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBwMCA9IHRoaXMucG9pbnRzWzBdO1xuICAgICAgICBsZXQgYzAgPSB0aGlzLnBvaW50c1sxXSxcbiAgICAgICAgICAgIHAxID0gdGhpcy5wb2ludHNbMl07XG5cbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPD0gZGl2aXNpb25zOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IHAgPSBnZXRRdWFkcmF0aWNCZXppZXJQb2ludChpIC8gZGl2aXNpb25zLCBwMCwgYzAsIHAxKTtcbiAgICAgICAgICAgIHBvaW50cy5wdXNoKHApO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IG9mZnNldCA9IDM7XG4gICAgICAgIHdoaWxlIChjb3VudCAtIG9mZnNldCA+IDApIHtcbiAgICAgICAgICAgIHAwLmNvcHkocDEpO1xuICAgICAgICAgICAgYzAgPSBwMS5zY2FsZSgyKS5zdWIoYzApO1xuICAgICAgICAgICAgcDEgPSB0aGlzLnBvaW50c1tvZmZzZXRdO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDE7IGkgPD0gZGl2aXNpb25zOyBpKyspIHtcbiAgICAgICAgICAgICAgICBjb25zdCBwID0gZ2V0UXVhZHJhdGljQmV6aWVyUG9pbnQoaSAvIGRpdmlzaW9ucywgcDAsIGMwLCBwMSk7XG4gICAgICAgICAgICAgICAgcG9pbnRzLnB1c2gocCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBvZmZzZXQrKztcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBwb2ludHM7XG4gICAgfVxuXG4gICAgX2dldEN1YmljQmV6aWVyUG9pbnRzKGRpdmlzaW9ucyA9IHRoaXMuZGl2aXNpb25zKSB7XG4gICAgICAgIGNvbnN0IHBvaW50cyA9IFtdO1xuICAgICAgICBjb25zdCBjb3VudCA9IHRoaXMucG9pbnRzLmxlbmd0aDtcblxuICAgICAgICBpZiAoY291bnQgPCA0KSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oJ05vdCBlbm91Z2ggcG9pbnRzIHByb3ZpZGVkLicpO1xuICAgICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHAwID0gdGhpcy5wb2ludHNbMF0sXG4gICAgICAgICAgICBjMCA9IHRoaXMucG9pbnRzWzFdLFxuICAgICAgICAgICAgYzEgPSB0aGlzLnBvaW50c1syXSxcbiAgICAgICAgICAgIHAxID0gdGhpcy5wb2ludHNbM107XG5cbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPD0gZGl2aXNpb25zOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IHAgPSBnZXRDdWJpY0JlemllclBvaW50KGkgLyBkaXZpc2lvbnMsIHAwLCBjMCwgYzEsIHAxKTtcbiAgICAgICAgICAgIHBvaW50cy5wdXNoKHApO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IG9mZnNldCA9IDQ7XG4gICAgICAgIHdoaWxlIChjb3VudCAtIG9mZnNldCA+IDEpIHtcbiAgICAgICAgICAgIHAwLmNvcHkocDEpO1xuICAgICAgICAgICAgYzAgPSBwMS5zY2FsZSgyKS5zdWIoYzEpO1xuICAgICAgICAgICAgYzEgPSB0aGlzLnBvaW50c1tvZmZzZXRdO1xuICAgICAgICAgICAgcDEgPSB0aGlzLnBvaW50c1tvZmZzZXQgKyAxXTtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAxOyBpIDw9IGRpdmlzaW9uczsgaSsrKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcCA9IGdldEN1YmljQmV6aWVyUG9pbnQoaSAvIGRpdmlzaW9ucywgcDAsIGMwLCBjMSwgcDEpO1xuICAgICAgICAgICAgICAgIHBvaW50cy5wdXNoKHApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgb2Zmc2V0ICs9IDI7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcG9pbnRzO1xuICAgIH1cblxuICAgIF9nZXRDYXRtdWxsUm9tUG9pbnRzKGRpdmlzaW9ucyA9IHRoaXMuZGl2aXNpb25zLCBhID0gMC4xNjgsIGIgPSAwLjE2OCkge1xuICAgICAgICBjb25zdCBwb2ludHMgPSBbXTtcbiAgICAgICAgY29uc3QgY291bnQgPSB0aGlzLnBvaW50cy5sZW5ndGg7XG5cbiAgICAgICAgaWYgKGNvdW50IDw9IDIpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnBvaW50cztcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBwMDtcbiAgICAgICAgdGhpcy5wb2ludHMuZm9yRWFjaCgocCwgaSkgPT4ge1xuICAgICAgICAgICAgaWYgKGkgPT09IDApIHtcbiAgICAgICAgICAgICAgICBwMCA9IHA7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnN0IFtjMCwgYzFdID0gZ2V0Q3RybFBvaW50KHRoaXMucG9pbnRzLCBpIC0gMSwgYSwgYik7XG4gICAgICAgICAgICAgICAgY29uc3QgYyA9IG5ldyBDdXJ2ZSh7XG4gICAgICAgICAgICAgICAgICAgIHBvaW50czogW3AwLCBjMCwgYzEsIHBdLFxuICAgICAgICAgICAgICAgICAgICB0eXBlOiBDVUJJQ0JFWklFUixcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBwb2ludHMucG9wKCk7XG4gICAgICAgICAgICAgICAgcG9pbnRzLnB1c2goLi4uYy5nZXRQb2ludHMoZGl2aXNpb25zKSk7XG4gICAgICAgICAgICAgICAgcDAgPSBwO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gcG9pbnRzO1xuICAgIH1cblxuICAgIGdldFBvaW50cyhkaXZpc2lvbnMgPSB0aGlzLmRpdmlzaW9ucywgYSA9IDAuMTY4LCBiID0gMC4xNjgpIHtcbiAgICAgICAgY29uc3QgdHlwZSA9IHRoaXMudHlwZTtcblxuICAgICAgICBpZiAodHlwZSA9PT0gUVVBRFJBVElDQkVaSUVSKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fZ2V0UXVhZHJhdGljQmV6aWVyUG9pbnRzKGRpdmlzaW9ucyk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodHlwZSA9PT0gQ1VCSUNCRVpJRVIpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9nZXRDdWJpY0JlemllclBvaW50cyhkaXZpc2lvbnMpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHR5cGUgPT09IENBVE1VTExST00pIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9nZXRDYXRtdWxsUm9tUG9pbnRzKGRpdmlzaW9ucywgYSwgYik7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcy5wb2ludHM7XG4gICAgfVxufVxuXG5DdXJ2ZS5DQVRNVUxMUk9NID0gQ0FUTVVMTFJPTTtcbkN1cnZlLkNVQklDQkVaSUVSID0gQ1VCSUNCRVpJRVI7XG5DdXJ2ZS5RVUFEUkFUSUNCRVpJRVIgPSBRVUFEUkFUSUNCRVpJRVI7XG4iLCJpbXBvcnQgeyBHZW9tZXRyeSB9IGZyb20gJy4uL2NvcmUvR2VvbWV0cnkuanMnO1xuaW1wb3J0IHsgVmVjMyB9IGZyb20gJy4uL21hdGgvVmVjMy5qcyc7XG5cbmV4cG9ydCBjbGFzcyBDeWxpbmRlciBleHRlbmRzIEdlb21ldHJ5IHtcbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgZ2wsXG4gICAgICAgIHtcbiAgICAgICAgICAgIHJhZGl1c1RvcCA9IDAuNSxcbiAgICAgICAgICAgIHJhZGl1c0JvdHRvbSA9IDAuNSxcbiAgICAgICAgICAgIGhlaWdodCA9IDEsXG4gICAgICAgICAgICByYWRpYWxTZWdtZW50cyA9IDgsXG4gICAgICAgICAgICBoZWlnaHRTZWdtZW50cyA9IDEsXG4gICAgICAgICAgICBvcGVuRW5kZWQgPSBmYWxzZSxcbiAgICAgICAgICAgIHRoZXRhU3RhcnQgPSAwLFxuICAgICAgICAgICAgdGhldGFMZW5ndGggPSBNYXRoLlBJICogMixcbiAgICAgICAgICAgIGF0dHJpYnV0ZXMgPSB7fSxcbiAgICAgICAgfSA9IHt9XG4gICAgKSB7XG4gICAgICAgIGNvbnN0IHJTZWdzID0gcmFkaWFsU2VnbWVudHM7XG4gICAgICAgIGNvbnN0IGhTZWdzID0gaGVpZ2h0U2VnbWVudHM7XG4gICAgICAgIGNvbnN0IHRTdGFydCA9IHRoZXRhU3RhcnQ7XG4gICAgICAgIGNvbnN0IHRMZW5ndGggPSB0aGV0YUxlbmd0aDtcblxuICAgICAgICBjb25zdCBudW1DYXBzID0gb3BlbkVuZGVkID8gMCA6IHJhZGl1c0JvdHRvbSAmJiByYWRpdXNUb3AgPyAyIDogMTtcbiAgICAgICAgY29uc3QgbnVtID0gKHJTZWdzICsgMSkgKiAoaFNlZ3MgKyAxICsgbnVtQ2FwcykgKyBudW1DYXBzO1xuICAgICAgICBjb25zdCBudW1JbmRpY2VzID0gclNlZ3MgKiBoU2VncyAqIDYgKyBudW1DYXBzICogclNlZ3MgKiAzO1xuXG4gICAgICAgIGNvbnN0IHBvc2l0aW9uID0gbmV3IEZsb2F0MzJBcnJheShudW0gKiAzKTtcbiAgICAgICAgY29uc3Qgbm9ybWFsID0gbmV3IEZsb2F0MzJBcnJheShudW0gKiAzKTtcbiAgICAgICAgY29uc3QgdXYgPSBuZXcgRmxvYXQzMkFycmF5KG51bSAqIDIpO1xuICAgICAgICBjb25zdCBpbmRleCA9IG51bSA+IDY1NTM2ID8gbmV3IFVpbnQzMkFycmF5KG51bUluZGljZXMpIDogbmV3IFVpbnQxNkFycmF5KG51bUluZGljZXMpO1xuXG4gICAgICAgIGxldCBpID0gMDtcbiAgICAgICAgbGV0IGlpID0gMDtcbiAgICAgICAgY29uc3QgaW5kZXhBcnJheSA9IFtdO1xuXG4gICAgICAgIGFkZEhlaWdodCgpO1xuICAgICAgICBpZiAoIW9wZW5FbmRlZCkge1xuICAgICAgICAgICAgaWYgKHJhZGl1c1RvcCkgYWRkQ2FwKHRydWUpO1xuICAgICAgICAgICAgaWYgKHJhZGl1c0JvdHRvbSkgYWRkQ2FwKGZhbHNlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIGFkZEhlaWdodCgpIHtcbiAgICAgICAgICAgIGxldCB4LCB5O1xuICAgICAgICAgICAgY29uc3QgbiA9IG5ldyBWZWMzKCk7XG4gICAgICAgICAgICBjb25zdCBzbG9wZSA9IChyYWRpdXNCb3R0b20gLSByYWRpdXNUb3ApIC8gaGVpZ2h0O1xuXG4gICAgICAgICAgICBmb3IgKHkgPSAwOyB5IDw9IGhTZWdzOyB5KyspIHtcbiAgICAgICAgICAgICAgICBjb25zdCBpbmRleFJvdyA9IFtdO1xuICAgICAgICAgICAgICAgIGNvbnN0IHYgPSB5IC8gaFNlZ3M7XG5cbiAgICAgICAgICAgICAgICBjb25zdCByID0gdiAqIChyYWRpdXNCb3R0b20gLSByYWRpdXNUb3ApICsgcmFkaXVzVG9wO1xuICAgICAgICAgICAgICAgIGZvciAoeCA9IDA7IHggPD0gclNlZ3M7IHgrKykge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB1ID0geCAvIHJTZWdzO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB0aGV0YSA9IHUgKiB0TGVuZ3RoICsgdFN0YXJ0O1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBzaW5UaGV0YSA9IE1hdGguc2luKHRoZXRhKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY29zVGhldGEgPSBNYXRoLmNvcyh0aGV0YSk7XG5cbiAgICAgICAgICAgICAgICAgICAgcG9zaXRpb24uc2V0KFtyICogc2luVGhldGEsICgwLjUgLSB2KSAqIGhlaWdodCwgciAqIGNvc1RoZXRhXSwgaSAqIDMpO1xuICAgICAgICAgICAgICAgICAgICBuLnNldChzaW5UaGV0YSwgc2xvcGUsIGNvc1RoZXRhKS5ub3JtYWxpemUoKTtcbiAgICAgICAgICAgICAgICAgICAgbm9ybWFsLnNldChbbi54LCBuLnksIG4uel0sIGkgKiAzKTtcbiAgICAgICAgICAgICAgICAgICAgdXYuc2V0KFt1LCAxIC0gdl0sIGkgKiAyKTtcbiAgICAgICAgICAgICAgICAgICAgaW5kZXhSb3cucHVzaChpKyspO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpbmRleEFycmF5LnB1c2goaW5kZXhSb3cpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmb3IgKHggPSAwOyB4IDwgclNlZ3M7IHgrKykge1xuICAgICAgICAgICAgICAgIGZvciAoeSA9IDA7IHkgPCBoU2VnczsgeSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGEgPSBpbmRleEFycmF5W3ldW3hdO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBiID0gaW5kZXhBcnJheVt5ICsgMV1beF07XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGMgPSBpbmRleEFycmF5W3kgKyAxXVt4ICsgMV07XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGQgPSBpbmRleEFycmF5W3ldW3ggKyAxXTtcblxuICAgICAgICAgICAgICAgICAgICBpbmRleC5zZXQoW2EsIGIsIGQsIGIsIGMsIGRdLCBpaSAqIDMpO1xuICAgICAgICAgICAgICAgICAgICBpaSArPSAyO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIGFkZENhcChpc1RvcCkge1xuICAgICAgICAgICAgbGV0IHg7XG4gICAgICAgICAgICBjb25zdCByID0gaXNUb3AgPT09IHRydWUgPyByYWRpdXNUb3AgOiByYWRpdXNCb3R0b207XG4gICAgICAgICAgICBjb25zdCBzaWduID0gaXNUb3AgPT09IHRydWUgPyAxIDogLTE7XG5cbiAgICAgICAgICAgIGNvbnN0IGNlbnRlckluZGV4ID0gaTtcbiAgICAgICAgICAgIHBvc2l0aW9uLnNldChbMCwgMC41ICogaGVpZ2h0ICogc2lnbiwgMF0sIGkgKiAzKTtcbiAgICAgICAgICAgIG5vcm1hbC5zZXQoWzAsIHNpZ24sIDBdLCBpICogMyk7XG4gICAgICAgICAgICB1di5zZXQoWzAuNSwgMC41XSwgaSAqIDIpO1xuICAgICAgICAgICAgaSsrO1xuXG4gICAgICAgICAgICBmb3IgKHggPSAwOyB4IDw9IHJTZWdzOyB4KyspIHtcbiAgICAgICAgICAgICAgICBjb25zdCB1ID0geCAvIHJTZWdzO1xuICAgICAgICAgICAgICAgIGNvbnN0IHRoZXRhID0gdSAqIHRMZW5ndGggKyB0U3RhcnQ7XG4gICAgICAgICAgICAgICAgY29uc3QgY29zVGhldGEgPSBNYXRoLmNvcyh0aGV0YSk7XG4gICAgICAgICAgICAgICAgY29uc3Qgc2luVGhldGEgPSBNYXRoLnNpbih0aGV0YSk7XG5cbiAgICAgICAgICAgICAgICBwb3NpdGlvbi5zZXQoW3IgKiBzaW5UaGV0YSwgMC41ICogaGVpZ2h0ICogc2lnbiwgciAqIGNvc1RoZXRhXSwgaSAqIDMpO1xuICAgICAgICAgICAgICAgIG5vcm1hbC5zZXQoWzAsIHNpZ24sIDBdLCBpICogMyk7XG4gICAgICAgICAgICAgICAgdXYuc2V0KFtjb3NUaGV0YSAqIDAuNSArIDAuNSwgc2luVGhldGEgKiAwLjUgKiBzaWduICsgMC41XSwgaSAqIDIpO1xuICAgICAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZm9yICh4ID0gMDsgeCA8IHJTZWdzOyB4KyspIHtcbiAgICAgICAgICAgICAgICBjb25zdCBqID0gY2VudGVySW5kZXggKyB4ICsgMTtcbiAgICAgICAgICAgICAgICBpZiAoaXNUb3ApIHtcbiAgICAgICAgICAgICAgICAgICAgaW5kZXguc2V0KFtqLCBqICsgMSwgY2VudGVySW5kZXhdLCBpaSAqIDMpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGluZGV4LnNldChbaiArIDEsIGosIGNlbnRlckluZGV4XSwgaWkgKiAzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWkrKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIE9iamVjdC5hc3NpZ24oYXR0cmlidXRlcywge1xuICAgICAgICAgICAgcG9zaXRpb246IHsgc2l6ZTogMywgZGF0YTogcG9zaXRpb24gfSxcbiAgICAgICAgICAgIG5vcm1hbDogeyBzaXplOiAzLCBkYXRhOiBub3JtYWwgfSxcbiAgICAgICAgICAgIHV2OiB7IHNpemU6IDIsIGRhdGE6IHV2IH0sXG4gICAgICAgICAgICBpbmRleDogeyBkYXRhOiBpbmRleCB9LFxuICAgICAgICB9KTtcblxuICAgICAgICBzdXBlcihnbCwgYXR0cmlidXRlcyk7XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgUmVuZGVyVGFyZ2V0IH0gZnJvbSAnLi4vY29yZS9SZW5kZXJUYXJnZXQuanMnO1xuaW1wb3J0IHsgUHJvZ3JhbSB9IGZyb20gJy4uL2NvcmUvUHJvZ3JhbS5qcyc7XG5pbXBvcnQgeyBNZXNoIH0gZnJvbSAnLi4vY29yZS9NZXNoLmpzJztcbmltcG9ydCB7IFZlYzIgfSBmcm9tICcuLi9tYXRoL1ZlYzIuanMnO1xuaW1wb3J0IHsgVHJpYW5nbGUgfSBmcm9tICcuL1RyaWFuZ2xlLmpzJztcblxuZXhwb3J0IGNsYXNzIEZsb3dtYXAge1xuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICBnbCxcbiAgICAgICAge1xuICAgICAgICAgICAgc2l6ZSA9IDEyOCwgLy8gZGVmYXVsdCBzaXplIG9mIHRoZSByZW5kZXIgdGFyZ2V0c1xuICAgICAgICAgICAgZmFsbG9mZiA9IDAuMywgLy8gc2l6ZSBvZiB0aGUgc3RhbXAsIHBlcmNlbnRhZ2Ugb2YgdGhlIHNpemVcbiAgICAgICAgICAgIGFscGhhID0gMSwgLy8gb3BhY2l0eSBvZiB0aGUgc3RhbXBcbiAgICAgICAgICAgIGRpc3NpcGF0aW9uID0gMC45OCwgLy8gYWZmZWN0cyB0aGUgc3BlZWQgdGhhdCB0aGUgc3RhbXAgZmFkZXMuIENsb3NlciB0byAxIGlzIHNsb3dlclxuICAgICAgICAgICAgdHlwZSwgLy8gUGFzcyBpbiBnbC5GTE9BVCB0byBmb3JjZSBpdCwgZGVmYXVsdHMgdG8gZ2wuSEFMRl9GTE9BVFxuICAgICAgICB9ID0ge31cbiAgICApIHtcbiAgICAgICAgY29uc3QgX3RoaXMgPSB0aGlzO1xuICAgICAgICB0aGlzLmdsID0gZ2w7XG5cbiAgICAgICAgLy8gb3V0cHV0IHVuaWZvcm0gY29udGFpbmluZyByZW5kZXIgdGFyZ2V0IHRleHR1cmVzXG4gICAgICAgIHRoaXMudW5pZm9ybSA9IHsgdmFsdWU6IG51bGwgfTtcblxuICAgICAgICB0aGlzLm1hc2sgPSB7XG4gICAgICAgICAgICByZWFkOiBudWxsLFxuICAgICAgICAgICAgd3JpdGU6IG51bGwsXG5cbiAgICAgICAgICAgIC8vIEhlbHBlciBmdW5jdGlvbiB0byBwaW5nIHBvbmcgdGhlIHJlbmRlciB0YXJnZXRzIGFuZCB1cGRhdGUgdGhlIHVuaWZvcm1cbiAgICAgICAgICAgIHN3YXA6ICgpID0+IHtcbiAgICAgICAgICAgICAgICBsZXQgdGVtcCA9IF90aGlzLm1hc2sucmVhZDtcbiAgICAgICAgICAgICAgICBfdGhpcy5tYXNrLnJlYWQgPSBfdGhpcy5tYXNrLndyaXRlO1xuICAgICAgICAgICAgICAgIF90aGlzLm1hc2sud3JpdGUgPSB0ZW1wO1xuICAgICAgICAgICAgICAgIF90aGlzLnVuaWZvcm0udmFsdWUgPSBfdGhpcy5tYXNrLnJlYWQudGV4dHVyZTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH07XG5cbiAgICAgICAge1xuICAgICAgICAgICAgY3JlYXRlRkJPcygpO1xuXG4gICAgICAgICAgICB0aGlzLmFzcGVjdCA9IDE7XG4gICAgICAgICAgICB0aGlzLm1vdXNlID0gbmV3IFZlYzIoKTtcbiAgICAgICAgICAgIHRoaXMudmVsb2NpdHkgPSBuZXcgVmVjMigpO1xuXG4gICAgICAgICAgICB0aGlzLm1lc2ggPSBpbml0UHJvZ3JhbSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gY3JlYXRlRkJPcygpIHtcbiAgICAgICAgICAgIC8vIFJlcXVlc3RlZCB0eXBlIG5vdCBzdXBwb3J0ZWQsIGZhbGwgYmFjayB0byBoYWxmIGZsb2F0XG4gICAgICAgICAgICBpZiAoIXR5cGUpIHR5cGUgPSBnbC5IQUxGX0ZMT0FUIHx8IGdsLnJlbmRlcmVyLmV4dGVuc2lvbnNbJ09FU190ZXh0dXJlX2hhbGZfZmxvYXQnXS5IQUxGX0ZMT0FUX09FUztcblxuICAgICAgICAgICAgbGV0IG1pbkZpbHRlciA9ICgoKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGdsLnJlbmRlcmVyLmlzV2ViZ2wyKSByZXR1cm4gZ2wuTElORUFSO1xuICAgICAgICAgICAgICAgIGlmIChnbC5yZW5kZXJlci5leHRlbnNpb25zW2BPRVNfdGV4dHVyZV8ke3R5cGUgPT09IGdsLkZMT0FUID8gJycgOiAnaGFsZl8nfWZsb2F0X2xpbmVhcmBdKSByZXR1cm4gZ2wuTElORUFSO1xuICAgICAgICAgICAgICAgIHJldHVybiBnbC5ORUFSRVNUO1xuICAgICAgICAgICAgfSkoKTtcblxuICAgICAgICAgICAgY29uc3Qgb3B0aW9ucyA9IHtcbiAgICAgICAgICAgICAgICB3aWR0aDogc2l6ZSxcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IHNpemUsXG4gICAgICAgICAgICAgICAgdHlwZSxcbiAgICAgICAgICAgICAgICBmb3JtYXQ6IGdsLlJHQkEsXG4gICAgICAgICAgICAgICAgaW50ZXJuYWxGb3JtYXQ6IGdsLnJlbmRlcmVyLmlzV2ViZ2wyID8gKHR5cGUgPT09IGdsLkZMT0FUID8gZ2wuUkdCQTMyRiA6IGdsLlJHQkExNkYpIDogZ2wuUkdCQSxcbiAgICAgICAgICAgICAgICBtaW5GaWx0ZXIsXG4gICAgICAgICAgICAgICAgZGVwdGg6IGZhbHNlLFxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgX3RoaXMubWFzay5yZWFkID0gbmV3IFJlbmRlclRhcmdldChnbCwgb3B0aW9ucyk7XG4gICAgICAgICAgICBfdGhpcy5tYXNrLndyaXRlID0gbmV3IFJlbmRlclRhcmdldChnbCwgb3B0aW9ucyk7XG4gICAgICAgICAgICBfdGhpcy5tYXNrLnN3YXAoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIGluaXRQcm9ncmFtKCkge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBNZXNoKGdsLCB7XG4gICAgICAgICAgICAgICAgLy8gVHJpYW5nbGUgdGhhdCBpbmNsdWRlcyAtMSB0byAxIHJhbmdlIGZvciAncG9zaXRpb24nLCBhbmQgMCB0byAxIHJhbmdlIGZvciAndXYnLlxuICAgICAgICAgICAgICAgIGdlb21ldHJ5OiBuZXcgVHJpYW5nbGUoZ2wpLFxuXG4gICAgICAgICAgICAgICAgcHJvZ3JhbTogbmV3IFByb2dyYW0oZ2wsIHtcbiAgICAgICAgICAgICAgICAgICAgdmVydGV4LFxuICAgICAgICAgICAgICAgICAgICBmcmFnbWVudCxcbiAgICAgICAgICAgICAgICAgICAgdW5pZm9ybXM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRNYXA6IF90aGlzLnVuaWZvcm0sXG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHVGYWxsb2ZmOiB7IHZhbHVlOiBmYWxsb2ZmICogMC41IH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB1QWxwaGE6IHsgdmFsdWU6IGFscGhhIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB1RGlzc2lwYXRpb246IHsgdmFsdWU6IGRpc3NpcGF0aW9uIH0sXG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFVzZXIgbmVlZHMgdG8gdXBkYXRlIHRoZXNlXG4gICAgICAgICAgICAgICAgICAgICAgICB1QXNwZWN0OiB7IHZhbHVlOiAxIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB1TW91c2U6IHsgdmFsdWU6IF90aGlzLm1vdXNlIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB1VmVsb2NpdHk6IHsgdmFsdWU6IF90aGlzLnZlbG9jaXR5IH0sXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIGRlcHRoVGVzdDogZmFsc2UsXG4gICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHVwZGF0ZSgpIHtcbiAgICAgICAgdGhpcy5tZXNoLnByb2dyYW0udW5pZm9ybXMudUFzcGVjdC52YWx1ZSA9IHRoaXMuYXNwZWN0O1xuXG4gICAgICAgIHRoaXMuZ2wucmVuZGVyZXIucmVuZGVyKHtcbiAgICAgICAgICAgIHNjZW5lOiB0aGlzLm1lc2gsXG4gICAgICAgICAgICB0YXJnZXQ6IHRoaXMubWFzay53cml0ZSxcbiAgICAgICAgICAgIGNsZWFyOiBmYWxzZSxcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMubWFzay5zd2FwKCk7XG4gICAgfVxufVxuXG5jb25zdCB2ZXJ0ZXggPSAvKiBnbHNsICovIGBcbiAgICBhdHRyaWJ1dGUgdmVjMiB1djtcbiAgICBhdHRyaWJ1dGUgdmVjMiBwb3NpdGlvbjtcblxuICAgIHZhcnlpbmcgdmVjMiB2VXY7XG5cbiAgICB2b2lkIG1haW4oKSB7XG4gICAgICAgIHZVdiA9IHV2O1xuICAgICAgICBnbF9Qb3NpdGlvbiA9IHZlYzQocG9zaXRpb24sIDAsIDEpO1xuICAgIH1cbmA7XG5cbmNvbnN0IGZyYWdtZW50ID0gLyogZ2xzbCAqLyBgXG4gICAgcHJlY2lzaW9uIGhpZ2hwIGZsb2F0O1xuXG4gICAgdW5pZm9ybSBzYW1wbGVyMkQgdE1hcDtcblxuICAgIHVuaWZvcm0gZmxvYXQgdUZhbGxvZmY7XG4gICAgdW5pZm9ybSBmbG9hdCB1QWxwaGE7XG4gICAgdW5pZm9ybSBmbG9hdCB1RGlzc2lwYXRpb247XG4gICAgXG4gICAgdW5pZm9ybSBmbG9hdCB1QXNwZWN0O1xuICAgIHVuaWZvcm0gdmVjMiB1TW91c2U7XG4gICAgdW5pZm9ybSB2ZWMyIHVWZWxvY2l0eTtcblxuICAgIHZhcnlpbmcgdmVjMiB2VXY7XG5cbiAgICB2b2lkIG1haW4oKSB7XG4gICAgICAgIHZlYzQgY29sb3IgPSB0ZXh0dXJlMkQodE1hcCwgdlV2KSAqIHVEaXNzaXBhdGlvbjtcblxuICAgICAgICB2ZWMyIGN1cnNvciA9IHZVdiAtIHVNb3VzZTtcbiAgICAgICAgY3Vyc29yLnggKj0gdUFzcGVjdDtcblxuICAgICAgICB2ZWMzIHN0YW1wID0gdmVjMyh1VmVsb2NpdHkgKiB2ZWMyKDEsIC0xKSwgMS4wIC0gcG93KDEuMCAtIG1pbigxLjAsIGxlbmd0aCh1VmVsb2NpdHkpKSwgMy4wKSk7XG4gICAgICAgIGZsb2F0IGZhbGxvZmYgPSBzbW9vdGhzdGVwKHVGYWxsb2ZmLCAwLjAsIGxlbmd0aChjdXJzb3IpKSAqIHVBbHBoYTtcblxuICAgICAgICBjb2xvci5yZ2IgPSBtaXgoY29sb3IucmdiLCBzdGFtcCwgdmVjMyhmYWxsb2ZmKSk7XG5cbiAgICAgICAgZ2xfRnJhZ0NvbG9yID0gY29sb3I7XG4gICAgfVxuYDtcbiIsImltcG9ydCB7IFZlYzMgfSBmcm9tICcuLi9tYXRoL1ZlYzMuanMnO1xuaW1wb3J0IHsgUXVhdCB9IGZyb20gJy4uL21hdGgvUXVhdC5qcyc7XG5cbmNvbnN0IHRtcFZlYzNBID0gbmV3IFZlYzMoKTtcbmNvbnN0IHRtcFZlYzNCID0gbmV3IFZlYzMoKTtcbmNvbnN0IHRtcFZlYzNDID0gbmV3IFZlYzMoKTtcbmNvbnN0IHRtcFZlYzNEID0gbmV3IFZlYzMoKTtcblxuY29uc3QgdG1wUXVhdEEgPSBuZXcgUXVhdCgpO1xuY29uc3QgdG1wUXVhdEIgPSBuZXcgUXVhdCgpO1xuY29uc3QgdG1wUXVhdEMgPSBuZXcgUXVhdCgpO1xuY29uc3QgdG1wUXVhdEQgPSBuZXcgUXVhdCgpO1xuXG5leHBvcnQgY2xhc3MgR0xURkFuaW1hdGlvbiB7XG4gICAgY29uc3RydWN0b3IoZGF0YSwgd2VpZ2h0ID0gMSkge1xuICAgICAgICB0aGlzLmRhdGEgPSBkYXRhO1xuICAgICAgICB0aGlzLmVsYXBzZWQgPSAwO1xuICAgICAgICB0aGlzLndlaWdodCA9IHdlaWdodDtcblxuICAgICAgICAvLyBTZXQgdG8gZmFsc2UgdG8gbm90IGFwcGx5IG1vZHVsbyB0byBlbGFwc2VkIGFnYWluc3QgZHVyYXRpb25cbiAgICAgICAgdGhpcy5sb29wID0gdHJ1ZTtcblxuICAgICAgICAvLyBGaW5kIHN0YXJ0aW5nIHRpbWUgYXMgZXhwb3J0cyBmcm9tIGJsZW5kZXIgKHBlcmhhcHMgb3RoZXJzIHRvbykgZG9uJ3QgYWx3YXlzIHN0YXJ0IGZyb20gMFxuICAgICAgICB0aGlzLnN0YXJ0VGltZSA9IGRhdGEucmVkdWNlKChhLCB7IHRpbWVzIH0pID0+IE1hdGgubWluKGEsIHRpbWVzWzBdKSwgSW5maW5pdHkpO1xuICAgICAgICAvLyBHZXQgbGFyZ2VzdCBmaW5hbCB0aW1lIGluIGFsbCBjaGFubmVscyB0byBjYWxjdWxhdGUgZHVyYXRpb25cbiAgICAgICAgdGhpcy5lbmRUaW1lID0gZGF0YS5yZWR1Y2UoKGEsIHsgdGltZXMgfSkgPT4gTWF0aC5tYXgoYSwgdGltZXNbdGltZXMubGVuZ3RoIC0gMV0pLCAwKTtcbiAgICAgICAgdGhpcy5kdXJhdGlvbiA9IHRoaXMuZW5kVGltZSAtIHRoaXMuc3RhcnRUaW1lO1xuICAgIH1cblxuICAgIHVwZGF0ZSh0b3RhbFdlaWdodCA9IDEsIGlzU2V0KSB7XG4gICAgICAgIGNvbnN0IHdlaWdodCA9IGlzU2V0ID8gMSA6IHRoaXMud2VpZ2h0IC8gdG90YWxXZWlnaHQ7XG4gICAgICAgIGNvbnN0IGVsYXBzZWQgPSAodGhpcy5sb29wID8gdGhpcy5lbGFwc2VkICUgdGhpcy5kdXJhdGlvbiA6IE1hdGgubWluKHRoaXMuZWxhcHNlZCwgdGhpcy5kdXJhdGlvbiAtIDAuMDAxKSkgKyB0aGlzLnN0YXJ0VGltZTtcblxuICAgICAgICB0aGlzLmRhdGEuZm9yRWFjaCgoeyBub2RlLCB0cmFuc2Zvcm0sIGludGVycG9sYXRpb24sIHRpbWVzLCB2YWx1ZXMgfSkgPT4ge1xuICAgICAgICAgICAgLy8gR2V0IGluZGV4IG9mIHR3byB0aW1lIHZhbHVlcyBlbGFwc2VkIGlzIGJldHdlZW5cbiAgICAgICAgICAgIGNvbnN0IHByZXZJbmRleCA9XG4gICAgICAgICAgICAgICAgTWF0aC5tYXgoXG4gICAgICAgICAgICAgICAgICAgIDEsXG4gICAgICAgICAgICAgICAgICAgIHRpbWVzLmZpbmRJbmRleCgodCkgPT4gdCA+IGVsYXBzZWQpXG4gICAgICAgICAgICAgICAgKSAtIDE7XG4gICAgICAgICAgICBjb25zdCBuZXh0SW5kZXggPSBwcmV2SW5kZXggKyAxO1xuXG4gICAgICAgICAgICAvLyBHZXQgbGluZWFyIGJsZW5kL2FscGhhIGJldHdlZW4gdGhlIHR3b1xuICAgICAgICAgICAgbGV0IGFscGhhID0gKGVsYXBzZWQgLSB0aW1lc1twcmV2SW5kZXhdKSAvICh0aW1lc1tuZXh0SW5kZXhdIC0gdGltZXNbcHJldkluZGV4XSk7XG4gICAgICAgICAgICBpZiAoaW50ZXJwb2xhdGlvbiA9PT0gJ1NURVAnKSBhbHBoYSA9IDA7XG5cbiAgICAgICAgICAgIGxldCBwcmV2VmFsID0gdG1wVmVjM0E7XG4gICAgICAgICAgICBsZXQgcHJldlRhbiA9IHRtcFZlYzNCO1xuICAgICAgICAgICAgbGV0IG5leHRUYW4gPSB0bXBWZWMzQztcbiAgICAgICAgICAgIGxldCBuZXh0VmFsID0gdG1wVmVjM0Q7XG4gICAgICAgICAgICBsZXQgc2l6ZSA9IDM7XG5cbiAgICAgICAgICAgIGlmICh0cmFuc2Zvcm0gPT09ICdxdWF0ZXJuaW9uJykge1xuICAgICAgICAgICAgICAgIHByZXZWYWwgPSB0bXBRdWF0QTtcbiAgICAgICAgICAgICAgICBwcmV2VGFuID0gdG1wUXVhdEI7XG4gICAgICAgICAgICAgICAgbmV4dFRhbiA9IHRtcFF1YXRDO1xuICAgICAgICAgICAgICAgIG5leHRWYWwgPSB0bXBRdWF0RDtcbiAgICAgICAgICAgICAgICBzaXplID0gNDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGludGVycG9sYXRpb24gPT09ICdDVUJJQ1NQTElORScpIHtcbiAgICAgICAgICAgICAgICAvLyBHZXQgdGhlIHByZXYgYW5kIG5leHQgdmFsdWVzIGZyb20gdGhlIGluZGljZXNcbiAgICAgICAgICAgICAgICBwcmV2VmFsLmZyb21BcnJheSh2YWx1ZXMsIHByZXZJbmRleCAqIHNpemUgKiAzICsgc2l6ZSAqIDEpO1xuICAgICAgICAgICAgICAgIHByZXZUYW4uZnJvbUFycmF5KHZhbHVlcywgcHJldkluZGV4ICogc2l6ZSAqIDMgKyBzaXplICogMik7XG4gICAgICAgICAgICAgICAgbmV4dFRhbi5mcm9tQXJyYXkodmFsdWVzLCBuZXh0SW5kZXggKiBzaXplICogMyArIHNpemUgKiAwKTtcbiAgICAgICAgICAgICAgICBuZXh0VmFsLmZyb21BcnJheSh2YWx1ZXMsIG5leHRJbmRleCAqIHNpemUgKiAzICsgc2l6ZSAqIDEpO1xuXG4gICAgICAgICAgICAgICAgLy8gaW50ZXJwb2xhdGUgZm9yIGZpbmFsIHZhbHVlXG4gICAgICAgICAgICAgICAgcHJldlZhbCA9IHRoaXMuY3ViaWNTcGxpbmVJbnRlcnBvbGF0ZShhbHBoYSwgcHJldlZhbCwgcHJldlRhbiwgbmV4dFRhbiwgbmV4dFZhbCk7XG4gICAgICAgICAgICAgICAgaWYgKHNpemUgPT09IDQpIHByZXZWYWwubm9ybWFsaXplKCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIEdldCB0aGUgcHJldiBhbmQgbmV4dCB2YWx1ZXMgZnJvbSB0aGUgaW5kaWNlc1xuICAgICAgICAgICAgICAgIHByZXZWYWwuZnJvbUFycmF5KHZhbHVlcywgcHJldkluZGV4ICogc2l6ZSk7XG4gICAgICAgICAgICAgICAgbmV4dFZhbC5mcm9tQXJyYXkodmFsdWVzLCBuZXh0SW5kZXggKiBzaXplKTtcblxuICAgICAgICAgICAgICAgIC8vIGludGVycG9sYXRlIGZvciBmaW5hbCB2YWx1ZVxuICAgICAgICAgICAgICAgIGlmIChzaXplID09PSA0KSBwcmV2VmFsLnNsZXJwKG5leHRWYWwsIGFscGhhKTtcbiAgICAgICAgICAgICAgICBlbHNlIHByZXZWYWwubGVycChuZXh0VmFsLCBhbHBoYSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIGludGVycG9sYXRlIGJldHdlZW4gbXVsdGlwbGUgcG9zc2libGUgYW5pbWF0aW9uc1xuICAgICAgICAgICAgaWYgKHNpemUgPT09IDQpIG5vZGVbdHJhbnNmb3JtXS5zbGVycChwcmV2VmFsLCB3ZWlnaHQpO1xuICAgICAgICAgICAgZWxzZSBub2RlW3RyYW5zZm9ybV0ubGVycChwcmV2VmFsLCB3ZWlnaHQpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBjdWJpY1NwbGluZUludGVycG9sYXRlKHQsIHByZXZWYWwsIHByZXZUYW4sIG5leHRUYW4sIG5leHRWYWwpIHtcbiAgICAgICAgY29uc3QgdDIgPSB0ICogdDtcbiAgICAgICAgY29uc3QgdDMgPSB0MiAqIHQ7XG5cbiAgICAgICAgY29uc3QgczIgPSAzICogdDIgLSAyICogdDM7XG4gICAgICAgIGNvbnN0IHMzID0gdDMgLSB0MjtcbiAgICAgICAgY29uc3QgczAgPSAxIC0gczI7XG4gICAgICAgIGNvbnN0IHMxID0gczMgLSB0MiArIHQ7XG5cbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwcmV2VmFsLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBwcmV2VmFsW2ldID0gczAgKiBwcmV2VmFsW2ldICsgczEgKiAoMSAtIHQpICogcHJldlRhbltpXSArIHMyICogbmV4dFZhbFtpXSArIHMzICogdCAqIG5leHRUYW5baV07XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcHJldlZhbDtcbiAgICB9XG59XG4iLCJpbXBvcnQgeyBHZW9tZXRyeSB9IGZyb20gJy4uL2NvcmUvR2VvbWV0cnkuanMnO1xuaW1wb3J0IHsgVHJhbnNmb3JtIH0gZnJvbSAnLi4vY29yZS9UcmFuc2Zvcm0uanMnO1xuaW1wb3J0IHsgVGV4dHVyZSB9IGZyb20gJy4uL2NvcmUvVGV4dHVyZS5qcyc7XG5pbXBvcnQgeyBNZXNoIH0gZnJvbSAnLi4vY29yZS9NZXNoLmpzJztcbmltcG9ydCB7IEdMVEZBbmltYXRpb24gfSBmcm9tICcuL0dMVEZBbmltYXRpb24uanMnO1xuaW1wb3J0IHsgR0xURlNraW4gfSBmcm9tICcuL0dMVEZTa2luLmpzJztcbmltcG9ydCB7IE1hdDQgfSBmcm9tICcuLi9tYXRoL01hdDQuanMnO1xuaW1wb3J0IHsgTm9ybWFsUHJvZ3JhbSB9IGZyb20gJy4vTm9ybWFsUHJvZ3JhbS5qcyc7XG5cbi8vIFN1cHBvcnRzXG4vLyBbeF0gR2VvbWV0cnlcbi8vIFsgXSBTcGFyc2Ugc3VwcG9ydFxuLy8gW3hdIE5vZGVzIGFuZCBIaWVyYXJjaHlcbi8vIFt4XSBJbnN0YW5jaW5nXG4vLyBbIF0gTW9ycGggVGFyZ2V0c1xuLy8gW3hdIFNraW5zXG4vLyBbIF0gTWF0ZXJpYWxzXG4vLyBbeF0gVGV4dHVyZXNcbi8vIFt4XSBBbmltYXRpb25cbi8vIFsgXSBDYW1lcmFzXG4vLyBbIF0gRXh0ZW5zaW9uc1xuLy8gW3hdIEdMQiBzdXBwb3J0XG5cbi8vIFRPRE86IFNwYXJzZSBhY2Nlc3NvciBwYWNraW5nPyBGb3IgbW9ycGggdGFyZ2V0cyBiYXNpY2FsbHlcbi8vIFRPRE86IGluaXQgYWNjZXNzb3IgbWlzc2luZyBidWZmZXJWaWV3IHdpdGggMHNcbi8vIFRPRE86IG1vcnBoIHRhcmdldCBhbmltYXRpb25zXG4vLyBUT0RPOiB3aGF0IHRvIGRvIGlmIG11bHRpcGxlIGluc3RhbmNlcyBhcmUgaW4gZGlmZmVyZW50IGdyb3Vwcz8gT25seSB1c2VzIGxvY2FsIG1hdHJpY2VzXG4vLyBUT0RPOiB3aGF0IGlmIGluc3RhbmNpbmcgaXNuJ3Qgd2FudGVkPyBFZyBjb2xsaXNpb24gbWFwc1xuLy8gVE9ETzogaWUxMSBmYWxsYmFjayBmb3IgVGV4dERlY29kZXI/XG5cbmNvbnN0IFRZUEVfQVJSQVkgPSB7XG4gICAgNTEyMTogVWludDhBcnJheSxcbiAgICA1MTIyOiBJbnQxNkFycmF5LFxuICAgIDUxMjM6IFVpbnQxNkFycmF5LFxuICAgIDUxMjU6IFVpbnQzMkFycmF5LFxuICAgIDUxMjY6IEZsb2F0MzJBcnJheSxcbiAgICAnaW1hZ2UvanBlZyc6IFVpbnQ4QXJyYXksXG4gICAgJ2ltYWdlL3BuZyc6IFVpbnQ4QXJyYXksXG59O1xuXG5jb25zdCBUWVBFX1NJWkUgPSB7XG4gICAgU0NBTEFSOiAxLFxuICAgIFZFQzI6IDIsXG4gICAgVkVDMzogMyxcbiAgICBWRUM0OiA0LFxuICAgIE1BVDI6IDQsXG4gICAgTUFUMzogOSxcbiAgICBNQVQ0OiAxNixcbn07XG5cbmNvbnN0IEFUVFJJQlVURVMgPSB7XG4gICAgUE9TSVRJT046ICdwb3NpdGlvbicsXG4gICAgTk9STUFMOiAnbm9ybWFsJyxcbiAgICBUQU5HRU5UOiAndGFuZ2VudCcsXG4gICAgVEVYQ09PUkRfMDogJ3V2JyxcbiAgICBURVhDT09SRF8xOiAndXYyJyxcbiAgICBDT0xPUl8wOiAnY29sb3InLFxuICAgIFdFSUdIVFNfMDogJ3NraW5XZWlnaHQnLFxuICAgIEpPSU5UU18wOiAnc2tpbkluZGV4Jyxcbn07XG5cbmNvbnN0IFRSQU5TRk9STVMgPSB7XG4gICAgdHJhbnNsYXRpb246ICdwb3NpdGlvbicsXG4gICAgcm90YXRpb246ICdxdWF0ZXJuaW9uJyxcbiAgICBzY2FsZTogJ3NjYWxlJyxcbn07XG5cbmV4cG9ydCBjbGFzcyBHTFRGTG9hZGVyIHtcbiAgICBzdGF0aWMgYXN5bmMgbG9hZChnbCwgc3JjKSB7XG4gICAgICAgIGNvbnN0IGRpciA9IHNyYy5zcGxpdCgnLycpLnNsaWNlKDAsIC0xKS5qb2luKCcvJykgKyAnLyc7XG5cbiAgICAgICAgLy8gbG9hZCBtYWluIGRlc2NyaXB0aW9uIGpzb25cbiAgICAgICAgY29uc3QgZGVzYyA9IGF3YWl0IHRoaXMucGFyc2VEZXNjKHNyYyk7XG5cbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMucGFyc2UoZ2wsIGRlc2MsIGRpcik7XG4gICAgfVxuXG4gICAgc3RhdGljIGFzeW5jIHBhcnNlKGdsLCBkZXNjLCBkaXIpIHtcbiAgICAgICAgaWYgKGRlc2MuYXNzZXQgPT09IHVuZGVmaW5lZCB8fCBkZXNjLmFzc2V0LnZlcnNpb25bMF0gPCAyKSBjb25zb2xlLndhcm4oJ09ubHkgR0xURiA+PTIuMCBzdXBwb3J0ZWQuIEF0dGVtcHRpbmcgdG8gcGFyc2UuJyk7XG5cbiAgICAgICAgLy8gTG9hZCBidWZmZXJzIGFzeW5jXG4gICAgICAgIGNvbnN0IGJ1ZmZlcnMgPSBhd2FpdCB0aGlzLmxvYWRCdWZmZXJzKGRlc2MsIGRpcik7XG5cbiAgICAgICAgLy8gVW5iaW5kIGN1cnJlbnQgVkFPIHNvIHRoYXQgbmV3IGJ1ZmZlcnMgZG9uJ3QgZ2V0IGFkZGVkIHRvIGFjdGl2ZSBtZXNoXG4gICAgICAgIGdsLnJlbmRlcmVyLmJpbmRWZXJ0ZXhBcnJheShudWxsKTtcblxuICAgICAgICAvLyBDcmVhdGUgZ2wgYnVmZmVycyBmcm9tIGJ1ZmZlclZpZXdzXG4gICAgICAgIGNvbnN0IGJ1ZmZlclZpZXdzID0gdGhpcy5wYXJzZUJ1ZmZlclZpZXdzKGdsLCBkZXNjLCBidWZmZXJzKTtcblxuICAgICAgICAvLyBDcmVhdGUgaW1hZ2VzIGZyb20gZWl0aGVyIGJ1ZmZlclZpZXdzIG9yIHNlcGFyYXRlIGltYWdlIGZpbGVzXG4gICAgICAgIGNvbnN0IGltYWdlcyA9IHRoaXMucGFyc2VJbWFnZXMoZ2wsIGRlc2MsIGRpciwgYnVmZmVyVmlld3MpO1xuXG4gICAgICAgIGNvbnN0IHRleHR1cmVzID0gdGhpcy5wYXJzZVRleHR1cmVzKGdsLCBkZXNjLCBpbWFnZXMpO1xuXG4gICAgICAgIC8vIEp1c3QgcGFzcyB0aHJvdWdoIG1hdGVyaWFsIGRhdGEgZm9yIG5vd1xuICAgICAgICBjb25zdCBtYXRlcmlhbHMgPSB0aGlzLnBhcnNlTWF0ZXJpYWxzKGdsLCBkZXNjLCB0ZXh0dXJlcyk7XG5cbiAgICAgICAgLy8gRmV0Y2ggdGhlIGludmVyc2UgYmluZCBtYXRyaWNlcyBmb3Igc2tlbGV0b24gam9pbnRzXG4gICAgICAgIGNvbnN0IHNraW5zID0gdGhpcy5wYXJzZVNraW5zKGdsLCBkZXNjLCBidWZmZXJWaWV3cyk7XG5cbiAgICAgICAgLy8gQ3JlYXRlIGdlb21ldHJpZXMgZm9yIGVhY2ggbWVzaCBwcmltaXRpdmVcbiAgICAgICAgY29uc3QgbWVzaGVzID0gdGhpcy5wYXJzZU1lc2hlcyhnbCwgZGVzYywgYnVmZmVyVmlld3MsIG1hdGVyaWFscywgc2tpbnMpO1xuXG4gICAgICAgIC8vIENyZWF0ZSB0cmFuc2Zvcm1zLCBtZXNoZXMgYW5kIGhpZXJhcmNoeVxuICAgICAgICBjb25zdCBub2RlcyA9IHRoaXMucGFyc2VOb2RlcyhnbCwgZGVzYywgbWVzaGVzLCBza2lucyk7XG5cbiAgICAgICAgLy8gUGxhY2Ugbm9kZXMgaW4gc2tlbGV0b25zXG4gICAgICAgIHRoaXMucG9wdWxhdGVTa2lucyhza2lucywgbm9kZXMpO1xuXG4gICAgICAgIC8vIENyZWF0ZSBhbmltYXRpb24gaGFuZGxlcnNcbiAgICAgICAgY29uc3QgYW5pbWF0aW9ucyA9IHRoaXMucGFyc2VBbmltYXRpb25zKGdsLCBkZXNjLCBub2RlcywgYnVmZmVyVmlld3MpO1xuXG4gICAgICAgIC8vIEdldCB0b3AgbGV2ZWwgbm9kZXMgZm9yIGVhY2ggc2NlbmVcbiAgICAgICAgY29uc3Qgc2NlbmVzID0gdGhpcy5wYXJzZVNjZW5lcyhkZXNjLCBub2Rlcyk7XG4gICAgICAgIGNvbnN0IHNjZW5lID0gc2NlbmVzW2Rlc2Muc2NlbmVdO1xuXG4gICAgICAgIC8vIFJlbW92ZSBudWxsIG5vZGVzIChpbnN0YW5jZWQgdHJhbnNmb3JtcylcbiAgICAgICAgZm9yIChsZXQgaSA9IG5vZGVzLmxlbmd0aDsgaSA+PSAwOyBpLS0pIGlmICghbm9kZXNbaV0pIG5vZGVzLnNwbGljZShpLCAxKTtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAganNvbjogZGVzYyxcbiAgICAgICAgICAgIGJ1ZmZlcnMsXG4gICAgICAgICAgICBidWZmZXJWaWV3cyxcbiAgICAgICAgICAgIGltYWdlcyxcbiAgICAgICAgICAgIHRleHR1cmVzLFxuICAgICAgICAgICAgbWF0ZXJpYWxzLFxuICAgICAgICAgICAgbWVzaGVzLFxuICAgICAgICAgICAgbm9kZXMsXG4gICAgICAgICAgICBhbmltYXRpb25zLFxuICAgICAgICAgICAgc2NlbmVzLFxuICAgICAgICAgICAgc2NlbmUsXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgc3RhdGljIGFzeW5jIHBhcnNlRGVzYyhzcmMpIHtcbiAgICAgICAgaWYgKCFzcmMubWF0Y2goL1xcLmdsYiQvKSkge1xuICAgICAgICAgICAgcmV0dXJuIGF3YWl0IGZldGNoKHNyYykudGhlbigocmVzKSA9PiByZXMuanNvbigpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBhd2FpdCBmZXRjaChzcmMpXG4gICAgICAgICAgICAgICAgLnRoZW4oKHJlcykgPT4gcmVzLmFycmF5QnVmZmVyKCkpXG4gICAgICAgICAgICAgICAgLnRoZW4oKGdsYikgPT4gdGhpcy51bnBhY2tHTEIoZ2xiKSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBGcm9tIGh0dHBzOi8vZ2l0aHViLmNvbS9kb25tY2N1cmR5L2dsVEYtVHJhbnNmb3JtL2Jsb2IvZTQxMDhjYy9wYWNrYWdlcy9jb3JlL3NyYy9pby9pby50cyNMMzJcbiAgICBzdGF0aWMgdW5wYWNrR0xCKGdsYikge1xuICAgICAgICAvLyBEZWNvZGUgYW5kIHZlcmlmeSBHTEIgaGVhZGVyLlxuICAgICAgICBjb25zdCBoZWFkZXIgPSBuZXcgVWludDMyQXJyYXkoZ2xiLCAwLCAzKTtcbiAgICAgICAgaWYgKGhlYWRlclswXSAhPT0gMHg0NjU0NmM2Nykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGdsVEYgYXNzZXQuJyk7XG4gICAgICAgIH0gZWxzZSBpZiAoaGVhZGVyWzFdICE9PSAyKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFVuc3VwcG9ydGVkIGdsVEYgYmluYXJ5IHZlcnNpb24sIFwiJHtoZWFkZXJbMV19XCIuYCk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gRGVjb2RlIGFuZCB2ZXJpZnkgY2h1bmsgaGVhZGVycy5cbiAgICAgICAgY29uc3QganNvbkNodW5rSGVhZGVyID0gbmV3IFVpbnQzMkFycmF5KGdsYiwgMTIsIDIpO1xuICAgICAgICBjb25zdCBqc29uQnl0ZU9mZnNldCA9IDIwO1xuICAgICAgICBjb25zdCBqc29uQnl0ZUxlbmd0aCA9IGpzb25DaHVua0hlYWRlclswXTtcbiAgICAgICAgaWYgKGpzb25DaHVua0hlYWRlclsxXSAhPT0gMHg0ZTRmNTM0YSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmV4cGVjdGVkIEdMQiBsYXlvdXQuJyk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBEZWNvZGUgSlNPTi5cbiAgICAgICAgY29uc3QganNvblRleHQgPSBuZXcgVGV4dERlY29kZXIoKS5kZWNvZGUoZ2xiLnNsaWNlKGpzb25CeXRlT2Zmc2V0LCBqc29uQnl0ZU9mZnNldCArIGpzb25CeXRlTGVuZ3RoKSk7XG4gICAgICAgIGNvbnN0IGpzb24gPSBKU09OLnBhcnNlKGpzb25UZXh0KTtcbiAgICAgICAgLy8gSlNPTiBvbmx5XG4gICAgICAgIGlmIChqc29uQnl0ZU9mZnNldCArIGpzb25CeXRlTGVuZ3RoID09PSBnbGIuYnl0ZUxlbmd0aCkgcmV0dXJuIGpzb247XG5cbiAgICAgICAgY29uc3QgYmluYXJ5Q2h1bmtIZWFkZXIgPSBuZXcgVWludDMyQXJyYXkoZ2xiLCBqc29uQnl0ZU9mZnNldCArIGpzb25CeXRlTGVuZ3RoLCAyKTtcbiAgICAgICAgaWYgKGJpbmFyeUNodW5rSGVhZGVyWzFdICE9PSAweDAwNGU0OTQyKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1VuZXhwZWN0ZWQgR0xCIGxheW91dC4nKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBEZWNvZGUgY29udGVudC5cbiAgICAgICAgY29uc3QgYmluYXJ5Qnl0ZU9mZnNldCA9IGpzb25CeXRlT2Zmc2V0ICsganNvbkJ5dGVMZW5ndGggKyA4O1xuICAgICAgICBjb25zdCBiaW5hcnlCeXRlTGVuZ3RoID0gYmluYXJ5Q2h1bmtIZWFkZXJbMF07XG4gICAgICAgIGNvbnN0IGJpbmFyeSA9IGdsYi5zbGljZShiaW5hcnlCeXRlT2Zmc2V0LCBiaW5hcnlCeXRlT2Zmc2V0ICsgYmluYXJ5Qnl0ZUxlbmd0aCk7XG4gICAgICAgIC8vIEF0dGFjaCBiaW5hcnkgdG8gYnVmZmVyXG4gICAgICAgIGpzb24uYnVmZmVyc1swXS5iaW5hcnkgPSBiaW5hcnk7XG4gICAgICAgIHJldHVybiBqc29uO1xuICAgIH1cblxuICAgIC8vIFRocmVlanMgR0xURiBMb2FkZXIgaHR0cHM6Ly9naXRodWIuY29tL21yZG9vYi90aHJlZS5qcy9ibG9iL21hc3Rlci9leGFtcGxlcy9qcy9sb2FkZXJzL0dMVEZMb2FkZXIuanMjTDEwODVcbiAgICBzdGF0aWMgcmVzb2x2ZVVSSSh1cmksIGRpcikge1xuICAgICAgICAvLyBJbnZhbGlkIFVSSVxuICAgICAgICBpZiAodHlwZW9mIHVyaSAhPT0gJ3N0cmluZycgfHwgdXJpID09PSAnJykgcmV0dXJuICcnO1xuXG4gICAgICAgIC8vIEhvc3QgUmVsYXRpdmUgVVJJXG4gICAgICAgIGlmICgvXmh0dHBzPzpcXC9cXC8vaS50ZXN0KGRpcikgJiYgL15cXC8vLnRlc3QodXJpKSkge1xuICAgICAgICAgICAgZGlyID0gZGlyLnJlcGxhY2UoLyheaHR0cHM/OlxcL1xcL1teXFwvXSspLiovaSwgJyQxJyk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBBYnNvbHV0ZSBVUkkgaHR0cDovLywgaHR0cHM6Ly8sIC8vXG4gICAgICAgIGlmICgvXihodHRwcz86KT9cXC9cXC8vaS50ZXN0KHVyaSkpIHJldHVybiB1cmk7XG5cbiAgICAgICAgLy8gRGF0YSBVUklcbiAgICAgICAgaWYgKC9eZGF0YTouKiwuKiQvaS50ZXN0KHVyaSkpIHJldHVybiB1cmk7XG5cbiAgICAgICAgLy8gQmxvYiBVUklcbiAgICAgICAgaWYgKC9eYmxvYjouKiQvaS50ZXN0KHVyaSkpIHJldHVybiB1cmk7XG5cbiAgICAgICAgLy8gUmVsYXRpdmUgVVJJXG4gICAgICAgIHJldHVybiBkaXIgKyB1cmk7XG4gICAgfVxuXG4gICAgc3RhdGljIGFzeW5jIGxvYWRCdWZmZXJzKGRlc2MsIGRpcikge1xuICAgICAgICBpZiAoIWRlc2MuYnVmZmVycykgcmV0dXJuIG51bGw7XG4gICAgICAgIHJldHVybiBhd2FpdCBQcm9taXNlLmFsbChcbiAgICAgICAgICAgIGRlc2MuYnVmZmVycy5tYXAoKGJ1ZmZlcikgPT4ge1xuICAgICAgICAgICAgICAgIC8vIEZvciBHTEIsIGJpbmFyeSBidWZmZXIgcmVhZHkgdG8gZ29cbiAgICAgICAgICAgICAgICBpZiAoYnVmZmVyLmJpbmFyeSkgcmV0dXJuIGJ1ZmZlci5iaW5hcnk7XG4gICAgICAgICAgICAgICAgY29uc3QgdXJpID0gdGhpcy5yZXNvbHZlVVJJKGJ1ZmZlci51cmksIGRpcik7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZldGNoKHVyaSkudGhlbigocmVzKSA9PiByZXMuYXJyYXlCdWZmZXIoKSk7XG4gICAgICAgICAgICB9KVxuICAgICAgICApO1xuICAgIH1cblxuICAgIHN0YXRpYyBwYXJzZUJ1ZmZlclZpZXdzKGdsLCBkZXNjLCBidWZmZXJzKSB7XG4gICAgICAgIGlmICghZGVzYy5idWZmZXJWaWV3cykgcmV0dXJuIG51bGw7XG4gICAgICAgIC8vIENsb25lIHRvIGxlYXZlIGRlc2NyaXB0aW9uIHB1cmVcbiAgICAgICAgY29uc3QgYnVmZmVyVmlld3MgPSBkZXNjLmJ1ZmZlclZpZXdzLm1hcCgobykgPT4gT2JqZWN0LmFzc2lnbih7fSwgbykpO1xuXG4gICAgICAgIGRlc2MubWVzaGVzICYmXG4gICAgICAgICAgICBkZXNjLm1lc2hlcy5mb3JFYWNoKCh7IHByaW1pdGl2ZXMgfSkgPT4ge1xuICAgICAgICAgICAgICAgIHByaW1pdGl2ZXMuZm9yRWFjaCgoeyBhdHRyaWJ1dGVzLCBpbmRpY2VzIH0pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgLy8gRmxhZyBidWZmZXJWaWV3IGFzIGFuIGF0dHJpYnV0ZSwgc28gaXQga25vd3MgdG8gY3JlYXRlIGEgZ2wgYnVmZmVyXG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGF0dHIgaW4gYXR0cmlidXRlcykgYnVmZmVyVmlld3NbZGVzYy5hY2Nlc3NvcnNbYXR0cmlidXRlc1thdHRyXV0uYnVmZmVyVmlld10uaXNBdHRyaWJ1dGUgPSB0cnVlO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChpbmRpY2VzID09PSB1bmRlZmluZWQpIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgYnVmZmVyVmlld3NbZGVzYy5hY2Nlc3NvcnNbaW5kaWNlc10uYnVmZmVyVmlld10uaXNBdHRyaWJ1dGUgPSB0cnVlO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIE1ha2Ugc3VyZSBpbmRpY2VzIGJ1ZmZlclZpZXcgaGF2ZSBhIHRhcmdldCBwcm9wZXJ0eSBmb3IgZ2wgYnVmZmVyIGJpbmRpbmdcbiAgICAgICAgICAgICAgICAgICAgYnVmZmVyVmlld3NbZGVzYy5hY2Nlc3NvcnNbaW5kaWNlc10uYnVmZmVyVmlld10udGFyZ2V0ID0gZ2wuRUxFTUVOVF9BUlJBWV9CVUZGRVI7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAvLyBHZXQgY29tcG9uZW50VHlwZSBvZiBlYWNoIGJ1ZmZlclZpZXcgZnJvbSB0aGUgYWNjZXNzb3JzXG4gICAgICAgIGRlc2MuYWNjZXNzb3JzLmZvckVhY2goKHsgYnVmZmVyVmlldzogaSwgY29tcG9uZW50VHlwZSB9KSA9PiB7XG4gICAgICAgICAgICBidWZmZXJWaWV3c1tpXS5jb21wb25lbnRUeXBlID0gY29tcG9uZW50VHlwZTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gR2V0IG1pbWV0eXBlIG9mIGJ1ZmZlclZpZXcgZnJvbSBpbWFnZXNcbiAgICAgICAgZGVzYy5pbWFnZXMgJiZcbiAgICAgICAgICAgIGRlc2MuaW1hZ2VzLmZvckVhY2goKHsgdXJpLCBidWZmZXJWaWV3OiBpLCBtaW1lVHlwZSB9KSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGkgPT09IHVuZGVmaW5lZCkgcmV0dXJuO1xuICAgICAgICAgICAgICAgIGJ1ZmZlclZpZXdzW2ldLm1pbWVUeXBlID0gbWltZVR5cGU7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAvLyBQdXNoIGVhY2ggYnVmZmVyVmlldyB0byB0aGUgR1BVIGFzIGEgc2VwYXJhdGUgYnVmZmVyXG4gICAgICAgIGJ1ZmZlclZpZXdzLmZvckVhY2goXG4gICAgICAgICAgICAoXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBidWZmZXI6IGJ1ZmZlckluZGV4LCAvLyByZXF1aXJlZFxuICAgICAgICAgICAgICAgICAgICBieXRlT2Zmc2V0ID0gMCwgLy8gb3B0aW9uYWxcbiAgICAgICAgICAgICAgICAgICAgYnl0ZUxlbmd0aCwgLy8gcmVxdWlyZWRcbiAgICAgICAgICAgICAgICAgICAgYnl0ZVN0cmlkZSwgLy8gb3B0aW9uYWxcbiAgICAgICAgICAgICAgICAgICAgdGFyZ2V0ID0gZ2wuQVJSQVlfQlVGRkVSLCAvLyBvcHRpb25hbCwgYWRkZWQgYWJvdmUgZm9yIGVsZW1lbnRzXG4gICAgICAgICAgICAgICAgICAgIG5hbWUsIC8vIG9wdGlvbmFsXG4gICAgICAgICAgICAgICAgICAgIGV4dGVuc2lvbnMsIC8vIG9wdGlvbmFsXG4gICAgICAgICAgICAgICAgICAgIGV4dHJhcywgLy8gb3B0aW9uYWxcblxuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnRUeXBlLCAvLyBvcHRpb25hbCwgYWRkZWQgZnJvbSBhY2Nlc3NvciBhYm92ZVxuICAgICAgICAgICAgICAgICAgICBtaW1lVHlwZSwgLy8gb3B0aW9uYWwsIGFkZGVkIGZyb20gaW1hZ2VzIGFib3ZlXG4gICAgICAgICAgICAgICAgICAgIGlzQXR0cmlidXRlLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgaVxuICAgICAgICAgICAgKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgVHlwZUFycmF5ID0gVFlQRV9BUlJBWVtjb21wb25lbnRUeXBlIHx8IG1pbWVUeXBlXTtcbiAgICAgICAgICAgICAgICBjb25zdCBlbGVtZW50Qnl0ZXMgPSBUeXBlQXJyYXkuQllURVNfUEVSX0VMRU1FTlQ7XG5cbiAgICAgICAgICAgICAgICBjb25zdCBkYXRhID0gbmV3IFR5cGVBcnJheShidWZmZXJzW2J1ZmZlckluZGV4XSwgYnl0ZU9mZnNldCwgYnl0ZUxlbmd0aCAvIGVsZW1lbnRCeXRlcyk7XG4gICAgICAgICAgICAgICAgYnVmZmVyVmlld3NbaV0uZGF0YSA9IGRhdGE7XG4gICAgICAgICAgICAgICAgYnVmZmVyVmlld3NbaV0ub3JpZ2luYWxCdWZmZXIgPSBidWZmZXJzW2J1ZmZlckluZGV4XTtcblxuICAgICAgICAgICAgICAgIGlmICghaXNBdHRyaWJ1dGUpIHJldHVybjtcbiAgICAgICAgICAgICAgICAvLyBDcmVhdGUgZ2wgYnVmZmVycyBmb3IgdGhlIGJ1ZmZlclZpZXcsIHB1c2hpbmcgaXQgdG8gdGhlIEdQVVxuICAgICAgICAgICAgICAgIGNvbnN0IGJ1ZmZlciA9IGdsLmNyZWF0ZUJ1ZmZlcigpO1xuICAgICAgICAgICAgICAgIGdsLmJpbmRCdWZmZXIodGFyZ2V0LCBidWZmZXIpO1xuICAgICAgICAgICAgICAgIGdsLnJlbmRlcmVyLnN0YXRlLmJvdW5kQnVmZmVyID0gYnVmZmVyO1xuICAgICAgICAgICAgICAgIGdsLmJ1ZmZlckRhdGEodGFyZ2V0LCBkYXRhLCBnbC5TVEFUSUNfRFJBVyk7XG4gICAgICAgICAgICAgICAgYnVmZmVyVmlld3NbaV0uYnVmZmVyID0gYnVmZmVyO1xuICAgICAgICAgICAgfVxuICAgICAgICApO1xuXG4gICAgICAgIHJldHVybiBidWZmZXJWaWV3cztcbiAgICB9XG5cbiAgICBzdGF0aWMgcGFyc2VJbWFnZXMoZ2wsIGRlc2MsIGRpciwgYnVmZmVyVmlld3MpIHtcbiAgICAgICAgaWYgKCFkZXNjLmltYWdlcykgcmV0dXJuIG51bGw7XG4gICAgICAgIHJldHVybiBkZXNjLmltYWdlcy5tYXAoKHsgdXJpLCBidWZmZXJWaWV3OiBidWZmZXJWaWV3SW5kZXgsIG1pbWVUeXBlLCBuYW1lIH0pID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGltYWdlID0gbmV3IEltYWdlKCk7XG4gICAgICAgICAgICBpbWFnZS5uYW1lID0gbmFtZTtcbiAgICAgICAgICAgIGlmICh1cmkpIHtcbiAgICAgICAgICAgICAgICBpbWFnZS5zcmMgPSB0aGlzLnJlc29sdmVVUkkodXJpLCBkaXIpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChidWZmZXJWaWV3SW5kZXggIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHsgZGF0YSB9ID0gYnVmZmVyVmlld3NbYnVmZmVyVmlld0luZGV4XTtcbiAgICAgICAgICAgICAgICBjb25zdCBibG9iID0gbmV3IEJsb2IoW2RhdGFdLCB7IHR5cGU6IG1pbWVUeXBlIH0pO1xuICAgICAgICAgICAgICAgIGltYWdlLnNyYyA9IFVSTC5jcmVhdGVPYmplY3RVUkwoYmxvYik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpbWFnZS5yZWFkeSA9IG5ldyBQcm9taXNlKChyZXMpID0+IHtcbiAgICAgICAgICAgICAgICBpbWFnZS5vbmxvYWQgPSAoKSA9PiByZXMoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIGltYWdlO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBzdGF0aWMgcGFyc2VUZXh0dXJlcyhnbCwgZGVzYywgaW1hZ2VzKSB7XG4gICAgICAgIGlmICghZGVzYy50ZXh0dXJlcykgcmV0dXJuIG51bGw7XG4gICAgICAgIHJldHVybiBkZXNjLnRleHR1cmVzLm1hcCgoeyBzYW1wbGVyOiBzYW1wbGVySW5kZXgsIHNvdXJjZTogc291cmNlSW5kZXgsIG5hbWUsIGV4dGVuc2lvbnMsIGV4dHJhcyB9KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBvcHRpb25zID0ge1xuICAgICAgICAgICAgICAgIGZsaXBZOiBmYWxzZSxcbiAgICAgICAgICAgICAgICB3cmFwUzogZ2wuUkVQRUFULCAvLyBSZXBlYXQgYnkgZGVmYXVsdCwgb3Bwb3NlZCB0byBPR0wncyBjbGFtcCBieSBkZWZhdWx0XG4gICAgICAgICAgICAgICAgd3JhcFQ6IGdsLlJFUEVBVCxcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBjb25zdCBzYW1wbGVyID0gc2FtcGxlckluZGV4ICE9PSB1bmRlZmluZWQgPyBkZXNjLnNhbXBsZXJzW3NhbXBsZXJJbmRleF0gOiBudWxsO1xuICAgICAgICAgICAgaWYgKHNhbXBsZXIpIHtcbiAgICAgICAgICAgICAgICBbJ21hZ0ZpbHRlcicsICdtaW5GaWx0ZXInLCAnd3JhcFMnLCAnd3JhcFQnXS5mb3JFYWNoKChwcm9wKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChzYW1wbGVyW3Byb3BdKSBvcHRpb25zW3Byb3BdID0gc2FtcGxlcltwcm9wXTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IHRleHR1cmUgPSBuZXcgVGV4dHVyZShnbCwgb3B0aW9ucyk7XG4gICAgICAgICAgICB0ZXh0dXJlLm5hbWUgPSBuYW1lO1xuICAgICAgICAgICAgY29uc3QgaW1hZ2UgPSBpbWFnZXNbc291cmNlSW5kZXhdO1xuICAgICAgICAgICAgaW1hZ2UucmVhZHkudGhlbigoKSA9PiAodGV4dHVyZS5pbWFnZSA9IGltYWdlKSk7XG5cbiAgICAgICAgICAgIHJldHVybiB0ZXh0dXJlO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBzdGF0aWMgcGFyc2VNYXRlcmlhbHMoZ2wsIGRlc2MsIHRleHR1cmVzKSB7XG4gICAgICAgIGlmICghZGVzYy5tYXRlcmlhbHMpIHJldHVybiBudWxsO1xuICAgICAgICByZXR1cm4gZGVzYy5tYXRlcmlhbHMubWFwKFxuICAgICAgICAgICAgKHtcbiAgICAgICAgICAgICAgICBuYW1lLFxuICAgICAgICAgICAgICAgIGV4dGVuc2lvbnMsXG4gICAgICAgICAgICAgICAgZXh0cmFzLFxuICAgICAgICAgICAgICAgIHBick1ldGFsbGljUm91Z2huZXNzID0ge30sXG4gICAgICAgICAgICAgICAgbm9ybWFsVGV4dHVyZSxcbiAgICAgICAgICAgICAgICBvY2NsdXNpb25UZXh0dXJlLFxuICAgICAgICAgICAgICAgIGVtaXNzaXZlVGV4dHVyZSxcbiAgICAgICAgICAgICAgICBlbWlzc2l2ZUZhY3RvciA9IFswLCAwLCAwXSxcbiAgICAgICAgICAgICAgICBhbHBoYU1vZGUgPSAnT1BBUVVFJyxcbiAgICAgICAgICAgICAgICBhbHBoYUN1dG9mZiA9IDAuNSxcbiAgICAgICAgICAgICAgICBkb3VibGVTaWRlZCA9IGZhbHNlLFxuICAgICAgICAgICAgfSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHtcbiAgICAgICAgICAgICAgICAgICAgYmFzZUNvbG9yRmFjdG9yID0gWzEsIDEsIDEsIDFdLFxuICAgICAgICAgICAgICAgICAgICBiYXNlQ29sb3JUZXh0dXJlLFxuICAgICAgICAgICAgICAgICAgICBtZXRhbGxpY0ZhY3RvciA9IDEsXG4gICAgICAgICAgICAgICAgICAgIHJvdWdobmVzc0ZhY3RvciA9IDEsXG4gICAgICAgICAgICAgICAgICAgIG1ldGFsbGljUm91Z2huZXNzVGV4dHVyZSxcbiAgICAgICAgICAgICAgICAgICAgLy8gICBleHRlbnNpb25zLFxuICAgICAgICAgICAgICAgICAgICAvLyAgIGV4dHJhcyxcbiAgICAgICAgICAgICAgICB9ID0gcGJyTWV0YWxsaWNSb3VnaG5lc3M7XG5cbiAgICAgICAgICAgICAgICBpZiAoYmFzZUNvbG9yVGV4dHVyZSkge1xuICAgICAgICAgICAgICAgICAgICBiYXNlQ29sb3JUZXh0dXJlLnRleHR1cmUgPSB0ZXh0dXJlc1tiYXNlQ29sb3JUZXh0dXJlLmluZGV4XTtcbiAgICAgICAgICAgICAgICAgICAgLy8gdGV4Q29vcmRcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKG5vcm1hbFRleHR1cmUpIHtcbiAgICAgICAgICAgICAgICAgICAgbm9ybWFsVGV4dHVyZS50ZXh0dXJlID0gdGV4dHVyZXNbbm9ybWFsVGV4dHVyZS5pbmRleF07XG4gICAgICAgICAgICAgICAgICAgIC8vIHNjYWxlOiAxXG4gICAgICAgICAgICAgICAgICAgIC8vIHRleENvb3JkXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChtZXRhbGxpY1JvdWdobmVzc1RleHR1cmUpIHtcbiAgICAgICAgICAgICAgICAgICAgbWV0YWxsaWNSb3VnaG5lc3NUZXh0dXJlLnRleHR1cmUgPSB0ZXh0dXJlc1ttZXRhbGxpY1JvdWdobmVzc1RleHR1cmUuaW5kZXhdO1xuICAgICAgICAgICAgICAgICAgICAvLyB0ZXhDb29yZFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAob2NjbHVzaW9uVGV4dHVyZSkge1xuICAgICAgICAgICAgICAgICAgICBvY2NsdXNpb25UZXh0dXJlLnRleHR1cmUgPSB0ZXh0dXJlc1tvY2NsdXNpb25UZXh0dXJlLmluZGV4XTtcbiAgICAgICAgICAgICAgICAgICAgLy8gc3RyZW5ndGggMVxuICAgICAgICAgICAgICAgICAgICAvLyB0ZXhDb29yZFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoZW1pc3NpdmVUZXh0dXJlKSB7XG4gICAgICAgICAgICAgICAgICAgIGVtaXNzaXZlVGV4dHVyZS50ZXh0dXJlID0gdGV4dHVyZXNbZW1pc3NpdmVUZXh0dXJlLmluZGV4XTtcbiAgICAgICAgICAgICAgICAgICAgLy8gdGV4Q29vcmRcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBuYW1lLFxuICAgICAgICAgICAgICAgICAgICBiYXNlQ29sb3JGYWN0b3IsXG4gICAgICAgICAgICAgICAgICAgIGJhc2VDb2xvclRleHR1cmUsXG4gICAgICAgICAgICAgICAgICAgIG1ldGFsbGljRmFjdG9yLFxuICAgICAgICAgICAgICAgICAgICByb3VnaG5lc3NGYWN0b3IsXG4gICAgICAgICAgICAgICAgICAgIG1ldGFsbGljUm91Z2huZXNzVGV4dHVyZSxcbiAgICAgICAgICAgICAgICAgICAgbm9ybWFsVGV4dHVyZSxcbiAgICAgICAgICAgICAgICAgICAgb2NjbHVzaW9uVGV4dHVyZSxcbiAgICAgICAgICAgICAgICAgICAgZW1pc3NpdmVUZXh0dXJlLFxuICAgICAgICAgICAgICAgICAgICBlbWlzc2l2ZUZhY3RvcixcbiAgICAgICAgICAgICAgICAgICAgYWxwaGFNb2RlLFxuICAgICAgICAgICAgICAgICAgICBhbHBoYUN1dG9mZixcbiAgICAgICAgICAgICAgICAgICAgZG91YmxlU2lkZWQsXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgcGFyc2VTa2lucyhnbCwgZGVzYywgYnVmZmVyVmlld3MpIHtcbiAgICAgICAgaWYgKCFkZXNjLnNraW5zKSByZXR1cm4gbnVsbDtcbiAgICAgICAgcmV0dXJuIGRlc2Muc2tpbnMubWFwKFxuICAgICAgICAgICAgKHtcbiAgICAgICAgICAgICAgICBpbnZlcnNlQmluZE1hdHJpY2VzLCAvLyBvcHRpb25hbFxuICAgICAgICAgICAgICAgIHNrZWxldG9uLCAvLyBvcHRpb25hbFxuICAgICAgICAgICAgICAgIGpvaW50cywgLy8gcmVxdWlyZWRcbiAgICAgICAgICAgICAgICAvLyBuYW1lLFxuICAgICAgICAgICAgICAgIC8vIGV4dGVuc2lvbnMsXG4gICAgICAgICAgICAgICAgLy8gZXh0cmFzLFxuICAgICAgICAgICAgfSkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIGludmVyc2VCaW5kTWF0cmljZXM6IHRoaXMucGFyc2VBY2Nlc3NvcihpbnZlcnNlQmluZE1hdHJpY2VzLCBkZXNjLCBidWZmZXJWaWV3cyksXG4gICAgICAgICAgICAgICAgICAgIHNrZWxldG9uLFxuICAgICAgICAgICAgICAgICAgICBqb2ludHMsXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgcGFyc2VNZXNoZXMoZ2wsIGRlc2MsIGJ1ZmZlclZpZXdzLCBtYXRlcmlhbHMsIHNraW5zKSB7XG4gICAgICAgIGlmICghZGVzYy5tZXNoZXMpIHJldHVybiBudWxsO1xuICAgICAgICByZXR1cm4gZGVzYy5tZXNoZXMubWFwKFxuICAgICAgICAgICAgKFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgcHJpbWl0aXZlcywgLy8gcmVxdWlyZWRcbiAgICAgICAgICAgICAgICAgICAgd2VpZ2h0cywgLy8gb3B0aW9uYWxcbiAgICAgICAgICAgICAgICAgICAgbmFtZSwgLy8gb3B0aW9uYWxcbiAgICAgICAgICAgICAgICAgICAgZXh0ZW5zaW9ucywgLy8gb3B0aW9uYWxcbiAgICAgICAgICAgICAgICAgICAgZXh0cmFzLCAvLyBvcHRpb25hbFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgbWVzaEluZGV4XG4gICAgICAgICAgICApID0+IHtcbiAgICAgICAgICAgICAgICAvLyBUT0RPOiB3ZWlnaHRzIHN0dWZmID9cbiAgICAgICAgICAgICAgICAvLyBQYXJzZSB0aHJvdWdoIG5vZGVzIHRvIHNlZSBob3cgbWFueSBpbnN0YW5jZXMgdGhlcmUgYXJlXG4gICAgICAgICAgICAgICAgLy8gYW5kIGlmIHRoZXJlIGlzIGEgc2tpbiBhdHRhY2hlZFxuICAgICAgICAgICAgICAgIGxldCBudW1JbnN0YW5jZXMgPSAwO1xuICAgICAgICAgICAgICAgIGxldCBza2luSW5kZXggPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBkZXNjLm5vZGVzICYmXG4gICAgICAgICAgICAgICAgICAgIGRlc2Mubm9kZXMuZm9yRWFjaCgoeyBtZXNoLCBza2luIH0pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChtZXNoID09PSBtZXNoSW5kZXgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBudW1JbnN0YW5jZXMrKztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoc2tpbiAhPT0gdW5kZWZpbmVkKSBza2luSW5kZXggPSBza2luO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIHByaW1pdGl2ZXMgPSB0aGlzLnBhcnNlUHJpbWl0aXZlcyhnbCwgcHJpbWl0aXZlcywgZGVzYywgYnVmZmVyVmlld3MsIG1hdGVyaWFscywgbnVtSW5zdGFuY2VzKS5tYXAoKHsgZ2VvbWV0cnksIHByb2dyYW0sIG1vZGUgfSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAvLyBDcmVhdGUgZWl0aGVyIHNraW5uZWQgbWVzaCBvciByZWd1bGFyIG1lc2hcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbWVzaCA9XG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlb2Ygc2tpbkluZGV4ID09PSAnbnVtYmVyJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gbmV3IEdMVEZTa2luKGdsLCB7IHNrZWxldG9uOiBza2luc1tza2luSW5kZXhdLCBnZW9tZXRyeSwgcHJvZ3JhbSwgbW9kZSB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogbmV3IE1lc2goZ2wsIHsgZ2VvbWV0cnksIHByb2dyYW0sIG1vZGUgfSk7XG4gICAgICAgICAgICAgICAgICAgIG1lc2gubmFtZSA9IG5hbWU7XG4gICAgICAgICAgICAgICAgICAgIGlmIChtZXNoLmdlb21ldHJ5LmlzSW5zdGFuY2VkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBUYWcgbWVzaCBzbyB0aGF0IG5vZGVzIGNhbiBhZGQgdGhlaXIgdHJhbnNmb3JtcyB0byB0aGUgaW5zdGFuY2UgYXR0cmlidXRlXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNoLm51bUluc3RhbmNlcyA9IG51bUluc3RhbmNlcztcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEF2b2lkIGluY29ycmVjdCBjdWxsaW5nIGZvciBpbnN0YW5jZXNcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc2guZnJ1c3R1bUN1bGxlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBtZXNoO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgcHJpbWl0aXZlcyxcbiAgICAgICAgICAgICAgICAgICAgd2VpZ2h0cyxcbiAgICAgICAgICAgICAgICAgICAgbmFtZSxcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICApO1xuICAgIH1cblxuICAgIHN0YXRpYyBwYXJzZVByaW1pdGl2ZXMoZ2wsIHByaW1pdGl2ZXMsIGRlc2MsIGJ1ZmZlclZpZXdzLCBtYXRlcmlhbHMsIG51bUluc3RhbmNlcykge1xuICAgICAgICByZXR1cm4gcHJpbWl0aXZlcy5tYXAoXG4gICAgICAgICAgICAoe1xuICAgICAgICAgICAgICAgIGF0dHJpYnV0ZXMsIC8vIHJlcXVpcmVkXG4gICAgICAgICAgICAgICAgaW5kaWNlcywgLy8gb3B0aW9uYWxcbiAgICAgICAgICAgICAgICBtYXRlcmlhbDogbWF0ZXJpYWxJbmRleCwgLy8gb3B0aW9uYWxcbiAgICAgICAgICAgICAgICBtb2RlID0gNCwgLy8gb3B0aW9uYWxcbiAgICAgICAgICAgICAgICB0YXJnZXRzLCAvLyBvcHRpb25hbFxuICAgICAgICAgICAgICAgIGV4dGVuc2lvbnMsIC8vIG9wdGlvbmFsXG4gICAgICAgICAgICAgICAgZXh0cmFzLCAvLyBvcHRpb25hbFxuICAgICAgICAgICAgfSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGdlb21ldHJ5ID0gbmV3IEdlb21ldHJ5KGdsKTtcblxuICAgICAgICAgICAgICAgIC8vIEFkZCBlYWNoIGF0dHJpYnV0ZSBmb3VuZCBpbiBwcmltaXRpdmVcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBhdHRyIGluIGF0dHJpYnV0ZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgZ2VvbWV0cnkuYWRkQXR0cmlidXRlKEFUVFJJQlVURVNbYXR0cl0sIHRoaXMucGFyc2VBY2Nlc3NvcihhdHRyaWJ1dGVzW2F0dHJdLCBkZXNjLCBidWZmZXJWaWV3cykpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIEFkZCBpbmRleCBhdHRyaWJ1dGUgaWYgZm91bmRcbiAgICAgICAgICAgICAgICBpZiAoaW5kaWNlcyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIGdlb21ldHJ5LmFkZEF0dHJpYnV0ZSgnaW5kZXgnLCB0aGlzLnBhcnNlQWNjZXNzb3IoaW5kaWNlcywgZGVzYywgYnVmZmVyVmlld3MpKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBBZGQgaW5zdGFuY2VkIHRyYW5zZm9ybSBhdHRyaWJ1dGUgaWYgbXVsdGlwbGUgaW5zdGFuY2VzXG4gICAgICAgICAgICAgICAgaWYgKG51bUluc3RhbmNlcyA+IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgZ2VvbWV0cnkuYWRkQXR0cmlidXRlKCdpbnN0YW5jZU1hdHJpeCcsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGluc3RhbmNlZDogMSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNpemU6IDE2LFxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogbmV3IEZsb2F0MzJBcnJheShudW1JbnN0YW5jZXMgKiAxNiksXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIFRPRE86IG1hdGVyaWFsc1xuICAgICAgICAgICAgICAgIGNvbnN0IHByb2dyYW0gPSBuZXcgTm9ybWFsUHJvZ3JhbShnbCk7XG4gICAgICAgICAgICAgICAgaWYgKG1hdGVyaWFsSW5kZXggIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICBwcm9ncmFtLmdsdGZNYXRlcmlhbCA9IG1hdGVyaWFsc1ttYXRlcmlhbEluZGV4XTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBnZW9tZXRyeSxcbiAgICAgICAgICAgICAgICAgICAgcHJvZ3JhbSxcbiAgICAgICAgICAgICAgICAgICAgbW9kZSxcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICApO1xuICAgIH1cblxuICAgIHN0YXRpYyBwYXJzZUFjY2Vzc29yKGluZGV4LCBkZXNjLCBidWZmZXJWaWV3cykge1xuICAgICAgICAvLyBUT0RPOiBpbml0IG1pc3NpbmcgYnVmZmVyVmlldyB3aXRoIDBzXG4gICAgICAgIC8vIFRPRE86IHN1cHBvcnQgc3BhcnNlXG5cbiAgICAgICAgY29uc3Qge1xuICAgICAgICAgICAgYnVmZmVyVmlldzogYnVmZmVyVmlld0luZGV4LCAvLyBvcHRpb25hbFxuICAgICAgICAgICAgYnl0ZU9mZnNldCA9IDAsIC8vIG9wdGlvbmFsXG4gICAgICAgICAgICBjb21wb25lbnRUeXBlLCAvLyByZXF1aXJlZFxuICAgICAgICAgICAgbm9ybWFsaXplZCA9IGZhbHNlLCAvLyBvcHRpb25hbFxuICAgICAgICAgICAgY291bnQsIC8vIHJlcXVpcmVkXG4gICAgICAgICAgICB0eXBlLCAvLyByZXF1aXJlZFxuICAgICAgICAgICAgbWluLCAvLyBvcHRpb25hbFxuICAgICAgICAgICAgbWF4LCAvLyBvcHRpb25hbFxuICAgICAgICAgICAgc3BhcnNlLCAvLyBvcHRpb25hbFxuICAgICAgICAgICAgLy8gbmFtZSwgLy8gb3B0aW9uYWxcbiAgICAgICAgICAgIC8vIGV4dGVuc2lvbnMsIC8vIG9wdGlvbmFsXG4gICAgICAgICAgICAvLyBleHRyYXMsIC8vIG9wdGlvbmFsXG4gICAgICAgIH0gPSBkZXNjLmFjY2Vzc29yc1tpbmRleF07XG5cbiAgICAgICAgY29uc3Qge1xuICAgICAgICAgICAgZGF0YSwgLy8gYXR0YWNoZWQgaW4gcGFyc2VCdWZmZXJWaWV3c1xuICAgICAgICAgICAgb3JpZ2luYWxCdWZmZXIsIC8vIGF0dGFjaGVkIGluIHBhcnNlQnVmZmVyVmlld3NcbiAgICAgICAgICAgIGJ1ZmZlciwgLy8gcmVwbGFjZWQgdG8gYmUgdGhlIGFjdHVhbCBHTCBidWZmZXJcbiAgICAgICAgICAgIGJ5dGVPZmZzZXQ6IGJ1ZmZlckJ5dGVPZmZzZXQgPSAwLFxuICAgICAgICAgICAgLy8gYnl0ZUxlbmd0aCwgLy8gYXBwbGllZCBpbiBwYXJzZUJ1ZmZlclZpZXdzXG4gICAgICAgICAgICBieXRlU3RyaWRlID0gMCxcbiAgICAgICAgICAgIHRhcmdldCxcbiAgICAgICAgICAgIC8vIG5hbWUsXG4gICAgICAgICAgICAvLyBleHRlbnNpb25zLFxuICAgICAgICAgICAgLy8gZXh0cmFzLFxuICAgICAgICB9ID0gYnVmZmVyVmlld3NbYnVmZmVyVmlld0luZGV4XTtcblxuICAgICAgICBjb25zdCBzaXplID0gVFlQRV9TSVpFW3R5cGVdO1xuXG4gICAgICAgIC8vIFBhcnNlIGRhdGEgZnJvbSBqb2luZWQgYnVmZmVyc1xuICAgICAgICBjb25zdCBUeXBlQXJyYXkgPSBUWVBFX0FSUkFZW2NvbXBvbmVudFR5cGVdO1xuICAgICAgICBjb25zdCBlbGVtZW50Qnl0ZXMgPSBkYXRhLkJZVEVTX1BFUl9FTEVNRU5UO1xuICAgICAgICBjb25zdCBjb21wb25lbnRPZmZzZXQgPSBieXRlT2Zmc2V0IC8gZWxlbWVudEJ5dGVzO1xuICAgICAgICBjb25zdCBjb21wb25lbnRTdHJpZGUgPSBieXRlU3RyaWRlIC8gZWxlbWVudEJ5dGVzO1xuICAgICAgICBjb25zdCBpc0ludGVybGVhdmVkID0gISFieXRlU3RyaWRlICYmIGNvbXBvbmVudFN0cmlkZSAhPT0gc2l6ZTtcblxuICAgICAgICAvLyBUT0RPOiBpbnRlcmxlYXZlZFxuICAgICAgICBjb25zdCBuZXdEYXRhID0gaXNJbnRlcmxlYXZlZCA/IGRhdGEgOiBuZXcgVHlwZUFycmF5KG9yaWdpbmFsQnVmZmVyLCBieXRlT2Zmc2V0ICsgYnVmZmVyQnl0ZU9mZnNldCwgY291bnQgKiBzaXplKTtcblxuICAgICAgICAvLyBSZXR1cm4gYXR0cmlidXRlIGRhdGFcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGRhdGE6IG5ld0RhdGEsXG4gICAgICAgICAgICBzaXplLFxuICAgICAgICAgICAgdHlwZTogY29tcG9uZW50VHlwZSxcbiAgICAgICAgICAgIG5vcm1hbGl6ZWQsXG4gICAgICAgICAgICBidWZmZXIsXG4gICAgICAgICAgICBzdHJpZGU6IGJ5dGVTdHJpZGUsXG4gICAgICAgICAgICBvZmZzZXQ6IGJ5dGVPZmZzZXQsXG4gICAgICAgICAgICBjb3VudCxcbiAgICAgICAgICAgIG1pbixcbiAgICAgICAgICAgIG1heCxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBzdGF0aWMgcGFyc2VOb2RlcyhnbCwgZGVzYywgbWVzaGVzLCBza2lucykge1xuICAgICAgICBpZiAoIWRlc2Mubm9kZXMpIHJldHVybiBudWxsO1xuICAgICAgICBjb25zdCBub2RlcyA9IGRlc2Mubm9kZXMubWFwKFxuICAgICAgICAgICAgKHtcbiAgICAgICAgICAgICAgICBjYW1lcmEsIC8vIG9wdGlvbmFsXG4gICAgICAgICAgICAgICAgY2hpbGRyZW4sIC8vIG9wdGlvbmFsXG4gICAgICAgICAgICAgICAgc2tpbjogc2tpbkluZGV4LCAvLyBvcHRpb25hbFxuICAgICAgICAgICAgICAgIG1hdHJpeCwgLy8gb3B0aW9uYWxcbiAgICAgICAgICAgICAgICBtZXNoOiBtZXNoSW5kZXgsIC8vIG9wdGlvbmFsXG4gICAgICAgICAgICAgICAgcm90YXRpb24sIC8vIG9wdGlvbmFsXG4gICAgICAgICAgICAgICAgc2NhbGUsIC8vIG9wdGlvbmFsXG4gICAgICAgICAgICAgICAgdHJhbnNsYXRpb24sIC8vIG9wdGlvbmFsXG4gICAgICAgICAgICAgICAgd2VpZ2h0cywgLy8gb3B0aW9uYWxcbiAgICAgICAgICAgICAgICBuYW1lLCAvLyBvcHRpb25hbFxuICAgICAgICAgICAgICAgIGV4dGVuc2lvbnMsIC8vIG9wdGlvbmFsXG4gICAgICAgICAgICAgICAgZXh0cmFzLCAvLyBvcHRpb25hbFxuICAgICAgICAgICAgfSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IG5vZGUgPSBuZXcgVHJhbnNmb3JtKCk7XG4gICAgICAgICAgICAgICAgaWYgKG5hbWUpIG5vZGUubmFtZSA9IG5hbWU7XG5cbiAgICAgICAgICAgICAgICAvLyBBcHBseSB0cmFuc2Zvcm1hdGlvbnNcbiAgICAgICAgICAgICAgICBpZiAobWF0cml4KSB7XG4gICAgICAgICAgICAgICAgICAgIG5vZGUubWF0cml4LmNvcHkobWF0cml4KTtcbiAgICAgICAgICAgICAgICAgICAgbm9kZS5kZWNvbXBvc2UoKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBpZiAocm90YXRpb24pIG5vZGUucXVhdGVybmlvbi5jb3B5KHJvdGF0aW9uKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNjYWxlKSBub2RlLnNjYWxlLmNvcHkoc2NhbGUpO1xuICAgICAgICAgICAgICAgICAgICBpZiAodHJhbnNsYXRpb24pIG5vZGUucG9zaXRpb24uY29weSh0cmFuc2xhdGlvbik7XG4gICAgICAgICAgICAgICAgICAgIG5vZGUudXBkYXRlTWF0cml4KCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gRmxhZ3MgZm9yIGF2b2lkaW5nIGR1cGxpY2F0ZSB0cmFuc2Zvcm1zIGFuZCByZW1vdmluZyB1bnVzZWQgaW5zdGFuY2Ugbm9kZXNcbiAgICAgICAgICAgICAgICBsZXQgaXNJbnN0YW5jZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBsZXQgaXNGaXJzdEluc3RhbmNlID0gdHJ1ZTtcblxuICAgICAgICAgICAgICAgIC8vIGFkZCBtZXNoIGlmIGluY2x1ZGVkXG4gICAgICAgICAgICAgICAgaWYgKG1lc2hJbmRleCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIG1lc2hlc1ttZXNoSW5kZXhdLnByaW1pdGl2ZXMuZm9yRWFjaCgobWVzaCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG1lc2guZ2VvbWV0cnkuaXNJbnN0YW5jZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc0luc3RhbmNlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFtZXNoLmluc3RhbmNlQ291bnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVzaC5pbnN0YW5jZUNvdW50ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc0ZpcnN0SW5zdGFuY2UgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZS5tYXRyaXgudG9BcnJheShtZXNoLmdlb21ldHJ5LmF0dHJpYnV0ZXMuaW5zdGFuY2VNYXRyaXguZGF0YSwgbWVzaC5pbnN0YW5jZUNvdW50ICogMTYpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lc2guaW5zdGFuY2VDb3VudCsrO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG1lc2guaW5zdGFuY2VDb3VudCA9PT0gbWVzaC5udW1JbnN0YW5jZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gUmVtb3ZlIHByb3BlcnRpZXMgb25jZSBhbGwgaW5zdGFuY2VzIGFkZGVkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBtZXNoLm51bUluc3RhbmNlcztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVsZXRlIG1lc2guaW5zdGFuY2VDb3VudDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gRmxhZyBhdHRyaWJ1dGUgYXMgZGlydHlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVzaC5nZW9tZXRyeS5hdHRyaWJ1dGVzLmluc3RhbmNlTWF0cml4Lm5lZWRzVXBkYXRlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEZvciBpbnN0YW5jZXMsIG9ubHkgdGhlIGZpcnN0IG5vZGUgd2lsbCBhY3R1YWxseSBoYXZlIHRoZSBtZXNoXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaXNJbnN0YW5jZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoaXNGaXJzdEluc3RhbmNlKSBtZXNoLnNldFBhcmVudChub2RlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVzaC5zZXRQYXJlbnQobm9kZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIFJlc2V0IG5vZGUgaWYgaW5zdGFuY2VkIHRvIG5vdCBkdXBsaWNhdGUgdHJhbnNmb3Jtc1xuICAgICAgICAgICAgICAgIGlmIChpc0luc3RhbmNlZCkge1xuICAgICAgICAgICAgICAgICAgICAvLyBSZW1vdmUgdW51c2VkIG5vZGVzIGp1c3QgcHJvdmlkaW5nIGFuIGluc3RhbmNlIHRyYW5zZm9ybVxuICAgICAgICAgICAgICAgICAgICBpZiAoIWlzRmlyc3RJbnN0YW5jZSkgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICAgICAgICAgIC8vIEF2b2lkIGR1cGxpY2F0ZSB0cmFuc2Zvcm0gZm9yIG5vZGUgY29udGFpbmluZyB0aGUgaW5zdGFuY2VkIG1lc2hcbiAgICAgICAgICAgICAgICAgICAgbm9kZS5tYXRyaXguaWRlbnRpdHkoKTtcbiAgICAgICAgICAgICAgICAgICAgbm9kZS5kZWNvbXBvc2UoKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gbm9kZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgKTtcblxuICAgICAgICBkZXNjLm5vZGVzLmZvckVhY2goKHsgY2hpbGRyZW4gPSBbXSB9LCBpKSA9PiB7XG4gICAgICAgICAgICAvLyBTZXQgaGllcmFyY2h5IG5vdyBhbGwgbm9kZXMgY3JlYXRlZFxuICAgICAgICAgICAgY2hpbGRyZW4uZm9yRWFjaCgoY2hpbGRJbmRleCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICghbm9kZXNbY2hpbGRJbmRleF0pIHJldHVybjtcbiAgICAgICAgICAgICAgICBub2Rlc1tjaGlsZEluZGV4XS5zZXRQYXJlbnQobm9kZXNbaV0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBub2RlcztcbiAgICB9XG5cbiAgICBzdGF0aWMgcG9wdWxhdGVTa2lucyhza2lucywgbm9kZXMpIHtcbiAgICAgICAgaWYgKCFza2lucykgcmV0dXJuO1xuICAgICAgICBza2lucy5mb3JFYWNoKChza2luKSA9PiB7XG4gICAgICAgICAgICBza2luLmpvaW50cyA9IHNraW4uam9pbnRzLm1hcCgoaSwgaW5kZXgpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBqb2ludCA9IG5vZGVzW2ldO1xuICAgICAgICAgICAgICAgIGpvaW50LmJpbmRJbnZlcnNlID0gbmV3IE1hdDQoLi4uc2tpbi5pbnZlcnNlQmluZE1hdHJpY2VzLmRhdGEuc2xpY2UoaW5kZXggKiAxNiwgKGluZGV4ICsgMSkgKiAxNikpO1xuICAgICAgICAgICAgICAgIHJldHVybiBqb2ludDtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKHNraW4uc2tlbGV0b24pIHNraW4uc2tlbGV0b24gPSBub2Rlc1tza2luLnNrZWxldG9uXTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgc3RhdGljIHBhcnNlQW5pbWF0aW9ucyhnbCwgZGVzYywgbm9kZXMsIGJ1ZmZlclZpZXdzKSB7XG4gICAgICAgIGlmICghZGVzYy5hbmltYXRpb25zKSByZXR1cm4gbnVsbDtcbiAgICAgICAgcmV0dXJuIGRlc2MuYW5pbWF0aW9ucy5tYXAoXG4gICAgICAgICAgICAoe1xuICAgICAgICAgICAgICAgIGNoYW5uZWxzLCAvLyByZXF1aXJlZFxuICAgICAgICAgICAgICAgIHNhbXBsZXJzLCAvLyByZXF1aXJlZFxuICAgICAgICAgICAgICAgIG5hbWUsIC8vIG9wdGlvbmFsXG4gICAgICAgICAgICAgICAgLy8gZXh0ZW5zaW9ucywgLy8gb3B0aW9uYWxcbiAgICAgICAgICAgICAgICAvLyBleHRyYXMsICAvLyBvcHRpb25hbFxuICAgICAgICAgICAgfSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGRhdGEgPSBjaGFubmVscy5tYXAoXG4gICAgICAgICAgICAgICAgICAgICh7XG4gICAgICAgICAgICAgICAgICAgICAgICBzYW1wbGVyOiBzYW1wbGVySW5kZXgsIC8vIHJlcXVpcmVkXG4gICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXQsIC8vIHJlcXVpcmVkXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBleHRlbnNpb25zLCAvLyBvcHRpb25hbFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gZXh0cmFzLCAvLyBvcHRpb25hbFxuICAgICAgICAgICAgICAgICAgICB9KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5wdXQ6IGlucHV0SW5kZXgsIC8vIHJlcXVpcmVkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW50ZXJwb2xhdGlvbiA9ICdMSU5FQVInLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG91dHB1dDogb3V0cHV0SW5kZXgsIC8vIHJlcXVpcmVkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gZXh0ZW5zaW9ucywgLy8gb3B0aW9uYWxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBleHRyYXMsIC8vIG9wdGlvbmFsXG4gICAgICAgICAgICAgICAgICAgICAgICB9ID0gc2FtcGxlcnNbc2FtcGxlckluZGV4XTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vZGU6IG5vZGVJbmRleCwgLy8gb3B0aW9uYWwgLSBUT0RPOiB3aGVuIGlzIGl0IG5vdCBpbmNsdWRlZD9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXRoLCAvLyByZXF1aXJlZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGV4dGVuc2lvbnMsIC8vIG9wdGlvbmFsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gZXh0cmFzLCAvLyBvcHRpb25hbFxuICAgICAgICAgICAgICAgICAgICAgICAgfSA9IHRhcmdldDtcblxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgbm9kZSA9IG5vZGVzW25vZGVJbmRleF07XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB0cmFuc2Zvcm0gPSBUUkFOU0ZPUk1TW3BhdGhdO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdGltZXMgPSB0aGlzLnBhcnNlQWNjZXNzb3IoaW5wdXRJbmRleCwgZGVzYywgYnVmZmVyVmlld3MpLmRhdGE7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB2YWx1ZXMgPSB0aGlzLnBhcnNlQWNjZXNzb3Iob3V0cHV0SW5kZXgsIGRlc2MsIGJ1ZmZlclZpZXdzKS5kYXRhO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vZGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNmb3JtLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGludGVycG9sYXRpb24sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGltZXMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBuYW1lLFxuICAgICAgICAgICAgICAgICAgICBhbmltYXRpb246IG5ldyBHTFRGQW5pbWF0aW9uKGRhdGEpLFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgc3RhdGljIHBhcnNlU2NlbmVzKGRlc2MsIG5vZGVzKSB7XG4gICAgICAgIGlmICghZGVzYy5zY2VuZXMpIHJldHVybiBudWxsO1xuICAgICAgICByZXR1cm4gZGVzYy5zY2VuZXMubWFwKFxuICAgICAgICAgICAgKHtcbiAgICAgICAgICAgICAgICBub2Rlczogbm9kZXNJbmRpY2VzID0gW10sXG4gICAgICAgICAgICAgICAgbmFtZSwgLy8gb3B0aW9uYWxcbiAgICAgICAgICAgICAgICBleHRlbnNpb25zLFxuICAgICAgICAgICAgICAgIGV4dHJhcyxcbiAgICAgICAgICAgIH0pID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbm9kZXNJbmRpY2VzLnJlZHVjZSgobWFwLCBpKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIC8vIERvbid0IGFkZCBudWxsIG5vZGVzIChpbnN0YW5jZWQgdHJhbnNmb3JtcylcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5vZGVzW2ldKSBtYXAucHVzaChub2Rlc1tpXSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBtYXA7XG4gICAgICAgICAgICAgICAgfSwgW10pO1xuICAgICAgICAgICAgfVxuICAgICAgICApO1xuICAgIH1cbn1cbiIsImltcG9ydCB7IE1lc2ggfSBmcm9tICcuLi9jb3JlL01lc2guanMnO1xuaW1wb3J0IHsgTWF0NCB9IGZyb20gJy4uL21hdGgvTWF0NC5qcyc7XG5pbXBvcnQgeyBUZXh0dXJlIH0gZnJvbSAnLi4vY29yZS9UZXh0dXJlLmpzJztcblxuY29uc3QgdGVtcE1hdDQgPSBuZXcgTWF0NCgpO1xuY29uc3QgaWRlbnRpdHkgPSBuZXcgTWF0NCgpO1xuXG5leHBvcnQgY2xhc3MgR0xURlNraW4gZXh0ZW5kcyBNZXNoIHtcbiAgICBjb25zdHJ1Y3RvcihnbCwgeyBza2VsZXRvbiwgZ2VvbWV0cnksIHByb2dyYW0sIG1vZGUgPSBnbC5UUklBTkdMRVMgfSA9IHt9KSB7XG4gICAgICAgIHN1cGVyKGdsLCB7IGdlb21ldHJ5LCBwcm9ncmFtLCBtb2RlIH0pO1xuICAgICAgICB0aGlzLnNrZWxldG9uID0gc2tlbGV0b247XG4gICAgICAgIHRoaXMucHJvZ3JhbSA9IHByb2dyYW07XG4gICAgICAgIHRoaXMuY3JlYXRlQm9uZVRleHR1cmUoKTtcbiAgICAgICAgdGhpcy5hbmltYXRpb25zID0gW107XG4gICAgfVxuXG4gICAgY3JlYXRlQm9uZVRleHR1cmUoKSB7XG4gICAgICAgIGlmICghdGhpcy5za2VsZXRvbi5qb2ludHMubGVuZ3RoKSByZXR1cm47XG4gICAgICAgIGNvbnN0IHNpemUgPSBNYXRoLm1heCg0LCBNYXRoLnBvdygyLCBNYXRoLmNlaWwoTWF0aC5sb2coTWF0aC5zcXJ0KHRoaXMuc2tlbGV0b24uam9pbnRzLmxlbmd0aCAqIDQpKSAvIE1hdGguTE4yKSkpO1xuICAgICAgICB0aGlzLmJvbmVNYXRyaWNlcyA9IG5ldyBGbG9hdDMyQXJyYXkoc2l6ZSAqIHNpemUgKiA0KTtcbiAgICAgICAgdGhpcy5ib25lVGV4dHVyZVNpemUgPSBzaXplO1xuICAgICAgICB0aGlzLmJvbmVUZXh0dXJlID0gbmV3IFRleHR1cmUodGhpcy5nbCwge1xuICAgICAgICAgICAgaW1hZ2U6IHRoaXMuYm9uZU1hdHJpY2VzLFxuICAgICAgICAgICAgZ2VuZXJhdGVNaXBtYXBzOiBmYWxzZSxcbiAgICAgICAgICAgIHR5cGU6IHRoaXMuZ2wuRkxPQVQsXG4gICAgICAgICAgICBpbnRlcm5hbEZvcm1hdDogdGhpcy5nbC5yZW5kZXJlci5pc1dlYmdsMiA/IHRoaXMuZ2wuUkdCQTMyRiA6IHRoaXMuZ2wuUkdCQSxcbiAgICAgICAgICAgIG1pbkZpbHRlcjogdGhpcy5nbC5ORUFSRVNULFxuICAgICAgICAgICAgbWFnRmlsdGVyOiB0aGlzLmdsLk5FQVJFU1QsXG4gICAgICAgICAgICBmbGlwWTogZmFsc2UsXG4gICAgICAgICAgICB3aWR0aDogc2l6ZSxcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gYWRkQW5pbWF0aW9uKGRhdGEpIHtcbiAgICAvLyAgICAgY29uc3QgYW5pbWF0aW9uID0gbmV3IEFuaW1hdGlvbih7IG9iamVjdHM6IHRoaXMuYm9uZXMsIGRhdGEgfSk7XG4gICAgLy8gICAgIHRoaXMuYW5pbWF0aW9ucy5wdXNoKGFuaW1hdGlvbik7XG4gICAgLy8gICAgIHJldHVybiBhbmltYXRpb247XG4gICAgLy8gfVxuXG4gICAgLy8gdXBkYXRlQW5pbWF0aW9ucygpIHtcbiAgICAvLyAgICAgLy8gQ2FsY3VsYXRlIGNvbWJpbmVkIGFuaW1hdGlvbiB3ZWlnaHRcbiAgICAvLyAgICAgbGV0IHRvdGFsID0gMDtcbiAgICAvLyAgICAgdGhpcy5hbmltYXRpb25zLmZvckVhY2goKGFuaW1hdGlvbikgPT4gKHRvdGFsICs9IGFuaW1hdGlvbi53ZWlnaHQpKTtcblxuICAgIC8vICAgICB0aGlzLmFuaW1hdGlvbnMuZm9yRWFjaCgoYW5pbWF0aW9uLCBpKSA9PiB7XG4gICAgLy8gICAgICAgICAvLyBmb3JjZSBmaXJzdCBhbmltYXRpb24gdG8gc2V0IGluIG9yZGVyIHRvIHJlc2V0IGZyYW1lXG4gICAgLy8gICAgICAgICBhbmltYXRpb24udXBkYXRlKHRvdGFsLCBpID09PSAwKTtcbiAgICAvLyAgICAgfSk7XG4gICAgLy8gfVxuXG4gICAgdXBkYXRlVW5pZm9ybXMoKSB7XG4gICAgICAgIC8vIFVwZGF0ZSBib25lIHRleHR1cmVcbiAgICAgICAgdGhpcy5za2VsZXRvbi5qb2ludHMuZm9yRWFjaCgoYm9uZSwgaSkgPT4ge1xuICAgICAgICAgICAgLy8gRmluZCBkaWZmZXJlbmNlIGJldHdlZW4gY3VycmVudCBhbmQgYmluZCBwb3NlXG4gICAgICAgICAgICB0ZW1wTWF0NC5tdWx0aXBseShib25lLndvcmxkTWF0cml4LCBib25lLmJpbmRJbnZlcnNlKTtcbiAgICAgICAgICAgIHRoaXMuYm9uZU1hdHJpY2VzLnNldCh0ZW1wTWF0NCwgaSAqIDE2KTtcbiAgICAgICAgfSk7XG4gICAgICAgIGlmICh0aGlzLmJvbmVUZXh0dXJlKSB0aGlzLmJvbmVUZXh0dXJlLm5lZWRzVXBkYXRlID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBkcmF3KHsgY2FtZXJhIH0gPSB7fSkge1xuICAgICAgICBpZiAoIXRoaXMucHJvZ3JhbS51bmlmb3Jtcy5ib25lVGV4dHVyZSkge1xuICAgICAgICAgICAgT2JqZWN0LmFzc2lnbih0aGlzLnByb2dyYW0udW5pZm9ybXMsIHtcbiAgICAgICAgICAgICAgICBib25lVGV4dHVyZTogeyB2YWx1ZTogdGhpcy5ib25lVGV4dHVyZSB9LFxuICAgICAgICAgICAgICAgIGJvbmVUZXh0dXJlU2l6ZTogeyB2YWx1ZTogdGhpcy5ib25lVGV4dHVyZVNpemUgfSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy51cGRhdGVVbmlmb3JtcygpO1xuXG4gICAgICAgIC8vIFN3aXRjaCB0aGUgd29ybGQgbWF0cml4IHdpdGggaWRlbnRpdHkgdG8gaWdub3JlIGFueSB0cmFuc2Zvcm1zXG4gICAgICAgIC8vIG9uIHRoZSBtZXNoIGl0c2VsZiAtIG9ubHkgdXNlIHNrZWxldG9uJ3MgdHJhbnNmb3Jtc1xuICAgICAgICBjb25zdCBfd29ybGRNYXRyaXggPSB0aGlzLndvcmxkTWF0cml4O1xuICAgICAgICB0aGlzLndvcmxkTWF0cml4ID0gaWRlbnRpdHk7XG5cbiAgICAgICAgc3VwZXIuZHJhdyh7IGNhbWVyYSB9KTtcblxuICAgICAgICAvLyBTd2l0Y2ggYmFjayB0byBsZWF2ZSBpZGVudGl0eSB1bnRvdWNoZWRcbiAgICAgICAgdGhpcy53b3JsZE1hdHJpeCA9IF93b3JsZE1hdHJpeDtcbiAgICB9XG59XG4iLCJpbXBvcnQgeyBQcm9ncmFtIH0gZnJvbSAnLi4vY29yZS9Qcm9ncmFtLmpzJztcbmltcG9ydCB7IE1lc2ggfSBmcm9tICcuLi9jb3JlL01lc2guanMnO1xuaW1wb3J0IHsgVGV4dHVyZSB9IGZyb20gJy4uL2NvcmUvVGV4dHVyZS5qcyc7XG5pbXBvcnQgeyBSZW5kZXJUYXJnZXQgfSBmcm9tICcuLi9jb3JlL1JlbmRlclRhcmdldC5qcyc7XG5pbXBvcnQgeyBUcmlhbmdsZSB9IGZyb20gJy4vVHJpYW5nbGUuanMnO1xuXG5leHBvcnQgY2xhc3MgR1BHUFUge1xuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICBnbCxcbiAgICAgICAge1xuICAgICAgICAgICAgLy8gQWx3YXlzIHBhc3MgaW4gYXJyYXkgb2YgdmVjNHMgKFJHQkEgdmFsdWVzIHdpdGhpbiB0ZXh0dXJlKVxuICAgICAgICAgICAgZGF0YSA9IG5ldyBGbG9hdDMyQXJyYXkoMTYpLFxuICAgICAgICAgICAgZ2VvbWV0cnkgPSBuZXcgVHJpYW5nbGUoZ2wpLFxuICAgICAgICAgICAgdHlwZSwgLy8gUGFzcyBpbiBnbC5GTE9BVCB0byBmb3JjZSBpdCwgZGVmYXVsdHMgdG8gZ2wuSEFMRl9GTE9BVFxuICAgICAgICB9XG4gICAgKSB7XG4gICAgICAgIHRoaXMuZ2wgPSBnbDtcbiAgICAgICAgY29uc3QgaW5pdGlhbERhdGEgPSBkYXRhO1xuICAgICAgICB0aGlzLnBhc3NlcyA9IFtdO1xuICAgICAgICB0aGlzLmdlb21ldHJ5ID0gZ2VvbWV0cnk7XG4gICAgICAgIHRoaXMuZGF0YUxlbmd0aCA9IGluaXRpYWxEYXRhLmxlbmd0aCAvIDQ7XG5cbiAgICAgICAgLy8gV2luZG93cyBhbmQgaU9TIG9ubHkgbGlrZSBwb3dlciBvZiAyIHRleHR1cmVzXG4gICAgICAgIC8vIEZpbmQgc21hbGxlc3QgUE8yIHRoYXQgZml0cyBkYXRhXG4gICAgICAgIHRoaXMuc2l6ZSA9IE1hdGgucG93KDIsIE1hdGguY2VpbChNYXRoLmxvZyhNYXRoLmNlaWwoTWF0aC5zcXJ0KHRoaXMuZGF0YUxlbmd0aCkpKSAvIE1hdGguTE4yKSk7XG5cbiAgICAgICAgLy8gQ3JlYXRlIGNvb3JkcyBmb3Igb3V0cHV0IHRleHR1cmVcbiAgICAgICAgdGhpcy5jb29yZHMgPSBuZXcgRmxvYXQzMkFycmF5KHRoaXMuZGF0YUxlbmd0aCAqIDIpO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuZGF0YUxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCB4ID0gKGkgJSB0aGlzLnNpemUpIC8gdGhpcy5zaXplOyAvLyB0byBhZGQgMC41IHRvIGJlIGNlbnRlciBwaXhlbCA/XG4gICAgICAgICAgICBjb25zdCB5ID0gTWF0aC5mbG9vcihpIC8gdGhpcy5zaXplKSAvIHRoaXMuc2l6ZTtcbiAgICAgICAgICAgIHRoaXMuY29vcmRzLnNldChbeCwgeV0sIGkgKiAyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFVzZSBvcmlnaW5hbCBkYXRhIGlmIGFscmVhZHkgY29ycmVjdCBsZW5ndGggb2YgUE8yIHRleHR1cmUsIGVsc2UgY29weSB0byBuZXcgYXJyYXkgb2YgY29ycmVjdCBsZW5ndGhcbiAgICAgICAgY29uc3QgZmxvYXRBcnJheSA9ICgoKSA9PiB7XG4gICAgICAgICAgICBpZiAoaW5pdGlhbERhdGEubGVuZ3RoID09PSB0aGlzLnNpemUgKiB0aGlzLnNpemUgKiA0KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGluaXRpYWxEYXRhO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zdCBhID0gbmV3IEZsb2F0MzJBcnJheSh0aGlzLnNpemUgKiB0aGlzLnNpemUgKiA0KTtcbiAgICAgICAgICAgICAgICBhLnNldChpbml0aWFsRGF0YSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGE7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pKCk7XG5cbiAgICAgICAgLy8gQ3JlYXRlIG91dHB1dCB0ZXh0dXJlIHVuaWZvcm0gdXNpbmcgaW5wdXQgZmxvYXQgdGV4dHVyZSB3aXRoIGluaXRpYWwgZGF0YVxuICAgICAgICB0aGlzLnVuaWZvcm0gPSB7XG4gICAgICAgICAgICB2YWx1ZTogbmV3IFRleHR1cmUoZ2wsIHtcbiAgICAgICAgICAgICAgICBpbWFnZTogZmxvYXRBcnJheSxcbiAgICAgICAgICAgICAgICB0YXJnZXQ6IGdsLlRFWFRVUkVfMkQsXG4gICAgICAgICAgICAgICAgdHlwZTogZ2wuRkxPQVQsXG4gICAgICAgICAgICAgICAgZm9ybWF0OiBnbC5SR0JBLFxuICAgICAgICAgICAgICAgIGludGVybmFsRm9ybWF0OiBnbC5yZW5kZXJlci5pc1dlYmdsMiA/IGdsLlJHQkEzMkYgOiBnbC5SR0JBLFxuICAgICAgICAgICAgICAgIHdyYXBTOiBnbC5DTEFNUF9UT19FREdFLFxuICAgICAgICAgICAgICAgIHdyYXBUOiBnbC5DTEFNUF9UT19FREdFLFxuICAgICAgICAgICAgICAgIGdlbmVyYXRlTWlwbWFwczogZmFsc2UsXG4gICAgICAgICAgICAgICAgbWluRmlsdGVyOiBnbC5ORUFSRVNULFxuICAgICAgICAgICAgICAgIG1hZ0ZpbHRlcjogZ2wuTkVBUkVTVCxcbiAgICAgICAgICAgICAgICB3aWR0aDogdGhpcy5zaXplLFxuICAgICAgICAgICAgICAgIGZsaXBZOiBmYWxzZSxcbiAgICAgICAgICAgIH0pLFxuICAgICAgICB9O1xuXG4gICAgICAgIC8vIENyZWF0ZSBGQk9zXG4gICAgICAgIGNvbnN0IG9wdGlvbnMgPSB7XG4gICAgICAgICAgICB3aWR0aDogdGhpcy5zaXplLFxuICAgICAgICAgICAgaGVpZ2h0OiB0aGlzLnNpemUsXG4gICAgICAgICAgICB0eXBlOiB0eXBlIHx8IGdsLkhBTEZfRkxPQVQgfHwgZ2wucmVuZGVyZXIuZXh0ZW5zaW9uc1snT0VTX3RleHR1cmVfaGFsZl9mbG9hdCddLkhBTEZfRkxPQVRfT0VTLFxuICAgICAgICAgICAgZm9ybWF0OiBnbC5SR0JBLFxuICAgICAgICAgICAgaW50ZXJuYWxGb3JtYXQ6IGdsLnJlbmRlcmVyLmlzV2ViZ2wyID8gKHR5cGUgPT09IGdsLkZMT0FUID8gZ2wuUkdCQTMyRiA6IGdsLlJHQkExNkYpIDogZ2wuUkdCQSxcbiAgICAgICAgICAgIG1pbkZpbHRlcjogZ2wuTkVBUkVTVCxcbiAgICAgICAgICAgIGRlcHRoOiBmYWxzZSxcbiAgICAgICAgICAgIHVucGFja0FsaWdubWVudDogMSxcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmZibyA9IHtcbiAgICAgICAgICAgIHJlYWQ6IG5ldyBSZW5kZXJUYXJnZXQoZ2wsIG9wdGlvbnMpLFxuICAgICAgICAgICAgd3JpdGU6IG5ldyBSZW5kZXJUYXJnZXQoZ2wsIG9wdGlvbnMpLFxuICAgICAgICAgICAgc3dhcDogKCkgPT4ge1xuICAgICAgICAgICAgICAgIGxldCB0ZW1wID0gdGhpcy5mYm8ucmVhZDtcbiAgICAgICAgICAgICAgICB0aGlzLmZiby5yZWFkID0gdGhpcy5mYm8ud3JpdGU7XG4gICAgICAgICAgICAgICAgdGhpcy5mYm8ud3JpdGUgPSB0ZW1wO1xuICAgICAgICAgICAgICAgIHRoaXMudW5pZm9ybS52YWx1ZSA9IHRoaXMuZmJvLnJlYWQudGV4dHVyZTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgYWRkUGFzcyh7IHZlcnRleCA9IGRlZmF1bHRWZXJ0ZXgsIGZyYWdtZW50ID0gZGVmYXVsdEZyYWdtZW50LCB1bmlmb3JtcyA9IHt9LCB0ZXh0dXJlVW5pZm9ybSA9ICd0TWFwJywgZW5hYmxlZCA9IHRydWUgfSA9IHt9KSB7XG4gICAgICAgIHVuaWZvcm1zW3RleHR1cmVVbmlmb3JtXSA9IHRoaXMudW5pZm9ybTtcbiAgICAgICAgY29uc3QgcHJvZ3JhbSA9IG5ldyBQcm9ncmFtKHRoaXMuZ2wsIHsgdmVydGV4LCBmcmFnbWVudCwgdW5pZm9ybXMgfSk7XG4gICAgICAgIGNvbnN0IG1lc2ggPSBuZXcgTWVzaCh0aGlzLmdsLCB7IGdlb21ldHJ5OiB0aGlzLmdlb21ldHJ5LCBwcm9ncmFtIH0pO1xuXG4gICAgICAgIGNvbnN0IHBhc3MgPSB7XG4gICAgICAgICAgICBtZXNoLFxuICAgICAgICAgICAgcHJvZ3JhbSxcbiAgICAgICAgICAgIHVuaWZvcm1zLFxuICAgICAgICAgICAgZW5hYmxlZCxcbiAgICAgICAgICAgIHRleHR1cmVVbmlmb3JtLFxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMucGFzc2VzLnB1c2gocGFzcyk7XG4gICAgICAgIHJldHVybiBwYXNzO1xuICAgIH1cblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgY29uc3QgZW5hYmxlZFBhc3NlcyA9IHRoaXMucGFzc2VzLmZpbHRlcigocGFzcykgPT4gcGFzcy5lbmFibGVkKTtcblxuICAgICAgICBlbmFibGVkUGFzc2VzLmZvckVhY2goKHBhc3MsIGkpID0+IHtcbiAgICAgICAgICAgIHRoaXMuZ2wucmVuZGVyZXIucmVuZGVyKHtcbiAgICAgICAgICAgICAgICBzY2VuZTogcGFzcy5tZXNoLFxuICAgICAgICAgICAgICAgIHRhcmdldDogdGhpcy5mYm8ud3JpdGUsXG4gICAgICAgICAgICAgICAgY2xlYXI6IGZhbHNlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLmZiby5zd2FwKCk7XG4gICAgICAgIH0pO1xuICAgIH1cbn1cblxuY29uc3QgZGVmYXVsdFZlcnRleCA9IC8qIGdsc2wgKi8gYFxuICAgIGF0dHJpYnV0ZSB2ZWMyIHV2O1xuICAgIGF0dHJpYnV0ZSB2ZWMyIHBvc2l0aW9uO1xuXG4gICAgdmFyeWluZyB2ZWMyIHZVdjtcblxuICAgIHZvaWQgbWFpbigpIHtcbiAgICAgICAgdlV2ID0gdXY7XG4gICAgICAgIGdsX1Bvc2l0aW9uID0gdmVjNChwb3NpdGlvbiwgMCwgMSk7XG4gICAgfVxuYDtcblxuY29uc3QgZGVmYXVsdEZyYWdtZW50ID0gLyogZ2xzbCAqLyBgXG4gICAgcHJlY2lzaW9uIGhpZ2hwIGZsb2F0O1xuXG4gICAgdW5pZm9ybSBzYW1wbGVyMkQgdE1hcDtcbiAgICB2YXJ5aW5nIHZlYzIgdlV2O1xuXG4gICAgdm9pZCBtYWluKCkge1xuICAgICAgICBnbF9GcmFnQ29sb3IgPSB0ZXh0dXJlMkQodE1hcCwgdlV2KTtcbiAgICB9XG5gO1xuIiwiaW1wb3J0IHsgVGV4dHVyZSB9IGZyb20gJy4uL2NvcmUvVGV4dHVyZS5qcyc7XG5cbi8vIFRPRE86IFN1cHBvcnQgY3ViZW1hcHNcbi8vIEdlbmVyYXRlIHRleHR1cmVzIHVzaW5nIGh0dHBzOi8vZ2l0aHViLmNvbS9UaW12YW5TY2hlcnBlbnplZWwvdGV4dHVyZS1jb21wcmVzc29yXG5cbmV4cG9ydCBjbGFzcyBLVFhUZXh0dXJlIGV4dGVuZHMgVGV4dHVyZSB7XG4gICAgY29uc3RydWN0b3IoZ2wsIHsgYnVmZmVyLCB3cmFwUyA9IGdsLkNMQU1QX1RPX0VER0UsIHdyYXBUID0gZ2wuQ0xBTVBfVE9fRURHRSwgYW5pc290cm9weSA9IDAsIG1pbkZpbHRlciwgbWFnRmlsdGVyIH0gPSB7fSkge1xuICAgICAgICBzdXBlcihnbCwge1xuICAgICAgICAgICAgZ2VuZXJhdGVNaXBtYXBzOiBmYWxzZSxcbiAgICAgICAgICAgIHdyYXBTLFxuICAgICAgICAgICAgd3JhcFQsXG4gICAgICAgICAgICBhbmlzb3Ryb3B5LFxuICAgICAgICAgICAgbWluRmlsdGVyLFxuICAgICAgICAgICAgbWFnRmlsdGVyLFxuICAgICAgICB9KTtcblxuICAgICAgICBpZiAoYnVmZmVyKSByZXR1cm4gdGhpcy5wYXJzZUJ1ZmZlcihidWZmZXIpO1xuICAgIH1cblxuICAgIHBhcnNlQnVmZmVyKGJ1ZmZlcikge1xuICAgICAgICBjb25zdCBrdHggPSBuZXcgS2hyb25vc1RleHR1cmVDb250YWluZXIoYnVmZmVyKTtcbiAgICAgICAga3R4Lm1pcG1hcHMuaXNDb21wcmVzc2VkVGV4dHVyZSA9IHRydWU7XG5cbiAgICAgICAgLy8gVXBkYXRlIHRleHR1cmVcbiAgICAgICAgdGhpcy5pbWFnZSA9IGt0eC5taXBtYXBzO1xuICAgICAgICB0aGlzLmludGVybmFsRm9ybWF0ID0ga3R4LmdsSW50ZXJuYWxGb3JtYXQ7XG4gICAgICAgIGlmIChrdHgubnVtYmVyT2ZNaXBtYXBMZXZlbHMgPiAxKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5taW5GaWx0ZXIgPT09IHRoaXMuZ2wuTElORUFSKSB0aGlzLm1pbkZpbHRlciA9IHRoaXMuZ2wuTkVBUkVTVF9NSVBNQVBfTElORUFSO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKHRoaXMubWluRmlsdGVyID09PSB0aGlzLmdsLk5FQVJFU1RfTUlQTUFQX0xJTkVBUikgdGhpcy5taW5GaWx0ZXIgPSB0aGlzLmdsLkxJTkVBUjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFRPRE86IHN1cHBvcnQgY3ViZSBtYXBzXG4gICAgICAgIC8vIGt0eC5udW1iZXJPZkZhY2VzXG4gICAgfVxufVxuXG5mdW5jdGlvbiBLaHJvbm9zVGV4dHVyZUNvbnRhaW5lcihidWZmZXIpIHtcbiAgICBjb25zdCBpZENoZWNrID0gWzB4YWIsIDB4NGIsIDB4NTQsIDB4NTgsIDB4MjAsIDB4MzEsIDB4MzEsIDB4YmIsIDB4MGQsIDB4MGEsIDB4MWEsIDB4MGFdO1xuICAgIGNvbnN0IGlkID0gbmV3IFVpbnQ4QXJyYXkoYnVmZmVyLCAwLCAxMik7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpZC5sZW5ndGg7IGkrKykgaWYgKGlkW2ldICE9PSBpZENoZWNrW2ldKSByZXR1cm4gY29uc29sZS5lcnJvcignRmlsZSBtaXNzaW5nIEtUWCBpZGVudGlmaWVyJyk7XG5cbiAgICAvLyBUT0RPOiBJcyB0aGlzIGFsd2F5cyA0PyBUZXN0ZWQ6IFthbmRyb2lkLCBtYWNvc11cbiAgICBjb25zdCBzaXplID0gVWludDMyQXJyYXkuQllURVNfUEVSX0VMRU1FTlQ7XG4gICAgY29uc3QgaGVhZCA9IG5ldyBEYXRhVmlldyhidWZmZXIsIDEyLCAxMyAqIHNpemUpO1xuICAgIGNvbnN0IGxpdHRsZUVuZGlhbiA9IGhlYWQuZ2V0VWludDMyKDAsIHRydWUpID09PSAweDA0MDMwMjAxO1xuICAgIGNvbnN0IGdsVHlwZSA9IGhlYWQuZ2V0VWludDMyKDEgKiBzaXplLCBsaXR0bGVFbmRpYW4pO1xuICAgIGlmIChnbFR5cGUgIT09IDApIHJldHVybiBjb25zb2xlLndhcm4oJ29ubHkgY29tcHJlc3NlZCBmb3JtYXRzIGN1cnJlbnRseSBzdXBwb3J0ZWQnKTtcbiAgICB0aGlzLmdsSW50ZXJuYWxGb3JtYXQgPSBoZWFkLmdldFVpbnQzMig0ICogc2l6ZSwgbGl0dGxlRW5kaWFuKTtcbiAgICBsZXQgd2lkdGggPSBoZWFkLmdldFVpbnQzMig2ICogc2l6ZSwgbGl0dGxlRW5kaWFuKTtcbiAgICBsZXQgaGVpZ2h0ID0gaGVhZC5nZXRVaW50MzIoNyAqIHNpemUsIGxpdHRsZUVuZGlhbik7XG4gICAgdGhpcy5udW1iZXJPZkZhY2VzID0gaGVhZC5nZXRVaW50MzIoMTAgKiBzaXplLCBsaXR0bGVFbmRpYW4pO1xuICAgIHRoaXMubnVtYmVyT2ZNaXBtYXBMZXZlbHMgPSBNYXRoLm1heCgxLCBoZWFkLmdldFVpbnQzMigxMSAqIHNpemUsIGxpdHRsZUVuZGlhbikpO1xuICAgIGNvbnN0IGJ5dGVzT2ZLZXlWYWx1ZURhdGEgPSBoZWFkLmdldFVpbnQzMigxMiAqIHNpemUsIGxpdHRsZUVuZGlhbik7XG5cbiAgICB0aGlzLm1pcG1hcHMgPSBbXTtcbiAgICBsZXQgb2Zmc2V0ID0gMTIgKyAxMyAqIDQgKyBieXRlc09mS2V5VmFsdWVEYXRhO1xuICAgIGZvciAobGV0IGxldmVsID0gMDsgbGV2ZWwgPCB0aGlzLm51bWJlck9mTWlwbWFwTGV2ZWxzOyBsZXZlbCsrKSB7XG4gICAgICAgIGNvbnN0IGxldmVsU2l6ZSA9IG5ldyBJbnQzMkFycmF5KGJ1ZmZlciwgb2Zmc2V0LCAxKVswXTsgLy8gc2l6ZSBwZXIgZmFjZSwgc2luY2Ugbm90IHN1cHBvcnRpbmcgYXJyYXkgY3ViZW1hcHNcbiAgICAgICAgb2Zmc2V0ICs9IDQ7IC8vIGxldmVsU2l6ZSBmaWVsZFxuICAgICAgICBmb3IgKGxldCBmYWNlID0gMDsgZmFjZSA8IHRoaXMubnVtYmVyT2ZGYWNlczsgZmFjZSsrKSB7XG4gICAgICAgICAgICBjb25zdCBkYXRhID0gbmV3IFVpbnQ4QXJyYXkoYnVmZmVyLCBvZmZzZXQsIGxldmVsU2l6ZSk7XG4gICAgICAgICAgICB0aGlzLm1pcG1hcHMucHVzaCh7IGRhdGEsIHdpZHRoLCBoZWlnaHQgfSk7XG4gICAgICAgICAgICBvZmZzZXQgKz0gbGV2ZWxTaXplO1xuICAgICAgICAgICAgb2Zmc2V0ICs9IDMgLSAoKGxldmVsU2l6ZSArIDMpICUgNCk7IC8vIGFkZCBwYWRkaW5nIGZvciBvZGQgc2l6ZWQgaW1hZ2VcbiAgICAgICAgfVxuICAgICAgICB3aWR0aCA9IHdpZHRoID4+IDE7XG4gICAgICAgIGhlaWdodCA9IGhlaWdodCA+PiAxO1xuICAgIH1cbn1cbiIsImltcG9ydCB7IFByb2dyYW0gfSBmcm9tICcuLi9jb3JlL1Byb2dyYW0uanMnO1xuXG5jb25zdCB2ZXJ0ZXggPSAvKiBnbHNsICovIGBcbiAgICBwcmVjaXNpb24gaGlnaHAgZmxvYXQ7XG4gICAgcHJlY2lzaW9uIGhpZ2hwIGludDtcblxuICAgIGF0dHJpYnV0ZSB2ZWMzIHBvc2l0aW9uO1xuICAgIGF0dHJpYnV0ZSB2ZWMzIG5vcm1hbDtcblxuICAgIHVuaWZvcm0gbWF0MyBub3JtYWxNYXRyaXg7XG4gICAgdW5pZm9ybSBtYXQ0IG1vZGVsVmlld01hdHJpeDtcbiAgICB1bmlmb3JtIG1hdDQgcHJvamVjdGlvbk1hdHJpeDtcblxuICAgIHZhcnlpbmcgdmVjMyB2Tm9ybWFsO1xuXG4gICAgdm9pZCBtYWluKCkge1xuICAgICAgICB2Tm9ybWFsID0gbm9ybWFsaXplKG5vcm1hbE1hdHJpeCAqIG5vcm1hbCk7XG4gICAgICAgIGdsX1Bvc2l0aW9uID0gcHJvamVjdGlvbk1hdHJpeCAqIG1vZGVsVmlld01hdHJpeCAqIHZlYzQocG9zaXRpb24sIDEuMCk7XG4gICAgfVxuYDtcblxuY29uc3QgZnJhZ21lbnQgPSAvKiBnbHNsICovIGBcbiAgICBwcmVjaXNpb24gaGlnaHAgZmxvYXQ7XG4gICAgcHJlY2lzaW9uIGhpZ2hwIGludDtcblxuICAgIHZhcnlpbmcgdmVjMyB2Tm9ybWFsO1xuXG4gICAgdm9pZCBtYWluKCkge1xuICAgICAgICBnbF9GcmFnQ29sb3IucmdiID0gbm9ybWFsaXplKHZOb3JtYWwpO1xuICAgICAgICBnbF9GcmFnQ29sb3IuYSA9IDEuMDtcbiAgICB9XG5gO1xuXG5leHBvcnQgZnVuY3Rpb24gTm9ybWFsUHJvZ3JhbShnbCkge1xuICAgIHJldHVybiBuZXcgUHJvZ3JhbShnbCwge1xuICAgICAgICB2ZXJ0ZXg6IHZlcnRleCxcbiAgICAgICAgZnJhZ21lbnQ6IGZyYWdtZW50LFxuICAgICAgICBjdWxsRmFjZTogbnVsbCxcbiAgICB9KTtcbn1cbiIsIi8vIEJhc2VkIGZyb20gVGhyZWVKUycgT3JiaXRDb250cm9scyBjbGFzcywgcmV3cml0dGVuIHVzaW5nIGVzNiB3aXRoIHNvbWUgYWRkaXRpb25zIGFuZCBzdWJ0cmFjdGlvbnMuXG4vLyBUT0RPOiBhYnN0cmFjdCBldmVudCBoYW5kbGVycyBzbyBjYW4gYmUgZmVkIGZyb20gb3RoZXIgc291cmNlc1xuLy8gVE9ETzogbWFrZSBzY3JvbGwgem9vbSBtb3JlIGFjY3VyYXRlIHRoYW4ganVzdCA+LzwgemVyb1xuLy8gVE9ETzogYmUgYWJsZSB0byBwYXNzIGluIG5ldyBjYW1lcmEgcG9zaXRpb25cblxuaW1wb3J0IHsgVmVjMyB9IGZyb20gJy4uL21hdGgvVmVjMy5qcyc7XG5pbXBvcnQgeyBWZWMyIH0gZnJvbSAnLi4vbWF0aC9WZWMyLmpzJztcblxuY29uc3QgU1RBVEUgPSB7IE5PTkU6IC0xLCBST1RBVEU6IDAsIERPTExZOiAxLCBQQU46IDIsIERPTExZX1BBTjogMyB9O1xuY29uc3QgdGVtcFZlYzMgPSBuZXcgVmVjMygpO1xuY29uc3QgdGVtcFZlYzJhID0gbmV3IFZlYzIoKTtcbmNvbnN0IHRlbXBWZWMyYiA9IG5ldyBWZWMyKCk7XG5cbmV4cG9ydCBmdW5jdGlvbiBPcmJpdChcbiAgICBvYmplY3QsXG4gICAge1xuICAgICAgICBlbGVtZW50ID0gZG9jdW1lbnQsXG4gICAgICAgIGVuYWJsZWQgPSB0cnVlLFxuICAgICAgICB0YXJnZXQgPSBuZXcgVmVjMygpLFxuICAgICAgICBlYXNlID0gMC4yNSxcbiAgICAgICAgaW5lcnRpYSA9IDAuODUsXG4gICAgICAgIGVuYWJsZVJvdGF0ZSA9IHRydWUsXG4gICAgICAgIHJvdGF0ZVNwZWVkID0gMC4xLFxuICAgICAgICBhdXRvUm90YXRlID0gZmFsc2UsXG4gICAgICAgIGF1dG9Sb3RhdGVTcGVlZCA9IDEuMCxcbiAgICAgICAgZW5hYmxlWm9vbSA9IHRydWUsXG4gICAgICAgIHpvb21TcGVlZCA9IDEsXG4gICAgICAgIGVuYWJsZVBhbiA9IHRydWUsXG4gICAgICAgIHBhblNwZWVkID0gMC4xLFxuICAgICAgICBtaW5Qb2xhckFuZ2xlID0gMCxcbiAgICAgICAgbWF4UG9sYXJBbmdsZSA9IE1hdGguUEksXG4gICAgICAgIG1pbkF6aW11dGhBbmdsZSA9IC1JbmZpbml0eSxcbiAgICAgICAgbWF4QXppbXV0aEFuZ2xlID0gSW5maW5pdHksXG4gICAgICAgIG1pbkRpc3RhbmNlID0gMCxcbiAgICAgICAgbWF4RGlzdGFuY2UgPSBJbmZpbml0eSxcbiAgICB9ID0ge31cbikge1xuICAgIHRoaXMuZW5hYmxlZCA9IGVuYWJsZWQ7XG4gICAgdGhpcy50YXJnZXQgPSB0YXJnZXQ7XG4gICAgdGhpcy5yb3RhdGVTcGVlZCA9IHJvdGF0ZVNwZWVkO1xuICAgIHRoaXMucGFuU3BlZWQgPSBwYW5TcGVlZDtcbiAgICAvLyBDYXRjaCBhdHRlbXB0cyB0byBkaXNhYmxlIC0gc2V0IHRvIDEgc28gaGFzIG5vIGVmZmVjdFxuICAgIGVhc2UgPSBlYXNlIHx8IDE7XG4gICAgaW5lcnRpYSA9IGluZXJ0aWEgfHwgMDtcblxuICAgIHRoaXMubWluRGlzdGFuY2UgPSBtaW5EaXN0YW5jZTtcbiAgICB0aGlzLm1heERpc3RhbmNlID0gbWF4RGlzdGFuY2U7XG5cbiAgICAvLyBjdXJyZW50IHBvc2l0aW9uIGluIHNwaGVyaWNhbFRhcmdldCBjb29yZGluYXRlc1xuICAgIGNvbnN0IHNwaGVyaWNhbERlbHRhID0geyByYWRpdXM6IDEsIHBoaTogMCwgdGhldGE6IDAgfTtcbiAgICBjb25zdCBzcGhlcmljYWxUYXJnZXQgPSB7IHJhZGl1czogMSwgcGhpOiAwLCB0aGV0YTogMCB9O1xuICAgIGNvbnN0IHNwaGVyaWNhbCA9IHsgcmFkaXVzOiAxLCBwaGk6IDAsIHRoZXRhOiAwIH07XG4gICAgY29uc3QgcGFuRGVsdGEgPSBuZXcgVmVjMygpO1xuXG4gICAgLy8gR3JhYiBpbml0aWFsIHBvc2l0aW9uIHZhbHVlc1xuICAgIGNvbnN0IG9mZnNldCA9IG5ldyBWZWMzKCk7XG4gICAgb2Zmc2V0LmNvcHkob2JqZWN0LnBvc2l0aW9uKS5zdWIodGhpcy50YXJnZXQpO1xuICAgIHNwaGVyaWNhbC5yYWRpdXMgPSBzcGhlcmljYWxUYXJnZXQucmFkaXVzID0gb2Zmc2V0LmRpc3RhbmNlKCk7XG4gICAgc3BoZXJpY2FsLnRoZXRhID0gc3BoZXJpY2FsVGFyZ2V0LnRoZXRhID0gTWF0aC5hdGFuMihvZmZzZXQueCwgb2Zmc2V0LnopO1xuICAgIHNwaGVyaWNhbC5waGkgPSBzcGhlcmljYWxUYXJnZXQucGhpID0gTWF0aC5hY29zKE1hdGgubWluKE1hdGgubWF4KG9mZnNldC55IC8gc3BoZXJpY2FsVGFyZ2V0LnJhZGl1cywgLTEpLCAxKSk7XG5cbiAgICB0aGlzLm9mZnNldCA9IG9mZnNldDtcblxuICAgIHRoaXMudXBkYXRlID0gKCkgPT4ge1xuICAgICAgICBpZiAoYXV0b1JvdGF0ZSkge1xuICAgICAgICAgICAgaGFuZGxlQXV0b1JvdGF0ZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gYXBwbHkgZGVsdGFcbiAgICAgICAgc3BoZXJpY2FsVGFyZ2V0LnJhZGl1cyAqPSBzcGhlcmljYWxEZWx0YS5yYWRpdXM7XG4gICAgICAgIHNwaGVyaWNhbFRhcmdldC50aGV0YSArPSBzcGhlcmljYWxEZWx0YS50aGV0YTtcbiAgICAgICAgc3BoZXJpY2FsVGFyZ2V0LnBoaSArPSBzcGhlcmljYWxEZWx0YS5waGk7XG5cbiAgICAgICAgLy8gYXBwbHkgYm91bmRhcmllc1xuICAgICAgICBzcGhlcmljYWxUYXJnZXQudGhldGEgPSBNYXRoLm1heChtaW5BemltdXRoQW5nbGUsIE1hdGgubWluKG1heEF6aW11dGhBbmdsZSwgc3BoZXJpY2FsVGFyZ2V0LnRoZXRhKSk7XG4gICAgICAgIHNwaGVyaWNhbFRhcmdldC5waGkgPSBNYXRoLm1heChtaW5Qb2xhckFuZ2xlLCBNYXRoLm1pbihtYXhQb2xhckFuZ2xlLCBzcGhlcmljYWxUYXJnZXQucGhpKSk7XG4gICAgICAgIHNwaGVyaWNhbFRhcmdldC5yYWRpdXMgPSBNYXRoLm1heCh0aGlzLm1pbkRpc3RhbmNlLCBNYXRoLm1pbih0aGlzLm1heERpc3RhbmNlLCBzcGhlcmljYWxUYXJnZXQucmFkaXVzKSk7XG5cbiAgICAgICAgLy8gZWFzZSB2YWx1ZXNcbiAgICAgICAgc3BoZXJpY2FsLnBoaSArPSAoc3BoZXJpY2FsVGFyZ2V0LnBoaSAtIHNwaGVyaWNhbC5waGkpICogZWFzZTtcbiAgICAgICAgc3BoZXJpY2FsLnRoZXRhICs9IChzcGhlcmljYWxUYXJnZXQudGhldGEgLSBzcGhlcmljYWwudGhldGEpICogZWFzZTtcbiAgICAgICAgc3BoZXJpY2FsLnJhZGl1cyArPSAoc3BoZXJpY2FsVGFyZ2V0LnJhZGl1cyAtIHNwaGVyaWNhbC5yYWRpdXMpICogZWFzZTtcblxuICAgICAgICAvLyBhcHBseSBwYW4gdG8gdGFyZ2V0LiBBcyBvZmZzZXQgaXMgcmVsYXRpdmUgdG8gdGFyZ2V0LCBpdCBhbHNvIHNoaWZ0c1xuICAgICAgICB0aGlzLnRhcmdldC5hZGQocGFuRGVsdGEpO1xuXG4gICAgICAgIC8vIGFwcGx5IHJvdGF0aW9uIHRvIG9mZnNldFxuICAgICAgICBsZXQgc2luUGhpUmFkaXVzID0gc3BoZXJpY2FsLnJhZGl1cyAqIE1hdGguc2luKE1hdGgubWF4KDAuMDAwMDAxLCBzcGhlcmljYWwucGhpKSk7XG4gICAgICAgIG9mZnNldC54ID0gc2luUGhpUmFkaXVzICogTWF0aC5zaW4oc3BoZXJpY2FsLnRoZXRhKTtcbiAgICAgICAgb2Zmc2V0LnkgPSBzcGhlcmljYWwucmFkaXVzICogTWF0aC5jb3Moc3BoZXJpY2FsLnBoaSk7XG4gICAgICAgIG9mZnNldC56ID0gc2luUGhpUmFkaXVzICogTWF0aC5jb3Moc3BoZXJpY2FsLnRoZXRhKTtcblxuICAgICAgICAvLyBBcHBseSB1cGRhdGVkIHZhbHVlcyB0byBvYmplY3RcbiAgICAgICAgb2JqZWN0LnBvc2l0aW9uLmNvcHkodGhpcy50YXJnZXQpLmFkZChvZmZzZXQpO1xuICAgICAgICBvYmplY3QubG9va0F0KHRoaXMudGFyZ2V0KTtcblxuICAgICAgICAvLyBBcHBseSBpbmVydGlhIHRvIHZhbHVlc1xuICAgICAgICBzcGhlcmljYWxEZWx0YS50aGV0YSAqPSBpbmVydGlhO1xuICAgICAgICBzcGhlcmljYWxEZWx0YS5waGkgKj0gaW5lcnRpYTtcbiAgICAgICAgcGFuRGVsdGEubXVsdGlwbHkoaW5lcnRpYSk7XG5cbiAgICAgICAgLy8gUmVzZXQgc2NhbGUgZXZlcnkgZnJhbWUgdG8gYXZvaWQgYXBwbHlpbmcgc2NhbGUgbXVsdGlwbGUgdGltZXNcbiAgICAgICAgc3BoZXJpY2FsRGVsdGEucmFkaXVzID0gMTtcbiAgICB9O1xuXG4gICAgLy8gVXBkYXRlcyBpbnRlcm5hbHMgd2l0aCBuZXcgcG9zaXRpb25cbiAgICB0aGlzLmZvcmNlUG9zaXRpb24gPSAoKSA9PiB7XG4gICAgICAgIG9mZnNldC5jb3B5KG9iamVjdC5wb3NpdGlvbikuc3ViKHRoaXMudGFyZ2V0KTtcbiAgICAgICAgc3BoZXJpY2FsLnJhZGl1cyA9IHNwaGVyaWNhbFRhcmdldC5yYWRpdXMgPSBvZmZzZXQuZGlzdGFuY2UoKTtcbiAgICAgICAgc3BoZXJpY2FsLnRoZXRhID0gc3BoZXJpY2FsVGFyZ2V0LnRoZXRhID0gTWF0aC5hdGFuMihvZmZzZXQueCwgb2Zmc2V0LnopO1xuICAgICAgICBzcGhlcmljYWwucGhpID0gc3BoZXJpY2FsVGFyZ2V0LnBoaSA9IE1hdGguYWNvcyhNYXRoLm1pbihNYXRoLm1heChvZmZzZXQueSAvIHNwaGVyaWNhbFRhcmdldC5yYWRpdXMsIC0xKSwgMSkpO1xuICAgICAgICBvYmplY3QubG9va0F0KHRoaXMudGFyZ2V0KTtcbiAgICB9O1xuXG4gICAgLy8gRXZlcnl0aGluZyBiZWxvdyBoZXJlIGp1c3QgdXBkYXRlcyBwYW5EZWx0YSBhbmQgc3BoZXJpY2FsRGVsdGFcbiAgICAvLyBVc2luZyB0aG9zZSB0d28gb2JqZWN0cycgdmFsdWVzLCB0aGUgb3JiaXQgaXMgY2FsY3VsYXRlZFxuXG4gICAgY29uc3Qgcm90YXRlU3RhcnQgPSBuZXcgVmVjMigpO1xuICAgIGNvbnN0IHBhblN0YXJ0ID0gbmV3IFZlYzIoKTtcbiAgICBjb25zdCBkb2xseVN0YXJ0ID0gbmV3IFZlYzIoKTtcblxuICAgIGxldCBzdGF0ZSA9IFNUQVRFLk5PTkU7XG4gICAgdGhpcy5tb3VzZUJ1dHRvbnMgPSB7IE9SQklUOiAwLCBaT09NOiAxLCBQQU46IDIgfTtcblxuICAgIGZ1bmN0aW9uIGdldFpvb21TY2FsZSgpIHtcbiAgICAgICAgcmV0dXJuIE1hdGgucG93KDAuOTUsIHpvb21TcGVlZCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcGFuTGVmdChkaXN0YW5jZSwgbSkge1xuICAgICAgICB0ZW1wVmVjMy5zZXQobVswXSwgbVsxXSwgbVsyXSk7XG4gICAgICAgIHRlbXBWZWMzLm11bHRpcGx5KC1kaXN0YW5jZSk7XG4gICAgICAgIHBhbkRlbHRhLmFkZCh0ZW1wVmVjMyk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcGFuVXAoZGlzdGFuY2UsIG0pIHtcbiAgICAgICAgdGVtcFZlYzMuc2V0KG1bNF0sIG1bNV0sIG1bNl0pO1xuICAgICAgICB0ZW1wVmVjMy5tdWx0aXBseShkaXN0YW5jZSk7XG4gICAgICAgIHBhbkRlbHRhLmFkZCh0ZW1wVmVjMyk7XG4gICAgfVxuXG4gICAgY29uc3QgcGFuID0gKGRlbHRhWCwgZGVsdGFZKSA9PiB7XG4gICAgICAgIGxldCBlbCA9IGVsZW1lbnQgPT09IGRvY3VtZW50ID8gZG9jdW1lbnQuYm9keSA6IGVsZW1lbnQ7XG4gICAgICAgIHRlbXBWZWMzLmNvcHkob2JqZWN0LnBvc2l0aW9uKS5zdWIodGhpcy50YXJnZXQpO1xuICAgICAgICBsZXQgdGFyZ2V0RGlzdGFuY2UgPSB0ZW1wVmVjMy5kaXN0YW5jZSgpO1xuICAgICAgICB0YXJnZXREaXN0YW5jZSAqPSBNYXRoLnRhbigoKChvYmplY3QuZm92IHx8IDQ1KSAvIDIpICogTWF0aC5QSSkgLyAxODAuMCk7XG4gICAgICAgIHBhbkxlZnQoKDIgKiBkZWx0YVggKiB0YXJnZXREaXN0YW5jZSkgLyBlbC5jbGllbnRIZWlnaHQsIG9iamVjdC5tYXRyaXgpO1xuICAgICAgICBwYW5VcCgoMiAqIGRlbHRhWSAqIHRhcmdldERpc3RhbmNlKSAvIGVsLmNsaWVudEhlaWdodCwgb2JqZWN0Lm1hdHJpeCk7XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIGRvbGx5KGRvbGx5U2NhbGUpIHtcbiAgICAgICAgc3BoZXJpY2FsRGVsdGEucmFkaXVzIC89IGRvbGx5U2NhbGU7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaGFuZGxlQXV0b1JvdGF0ZSgpIHtcbiAgICAgICAgY29uc3QgYW5nbGUgPSAoKDIgKiBNYXRoLlBJKSAvIDYwIC8gNjApICogYXV0b1JvdGF0ZVNwZWVkO1xuICAgICAgICBzcGhlcmljYWxEZWx0YS50aGV0YSAtPSBhbmdsZTtcbiAgICB9XG5cbiAgICBsZXQgaGFuZGxlTW92ZVJvdGF0ZSA9ICh4LCB5KSA9PiB7XG4gICAgICAgIHRlbXBWZWMyYS5zZXQoeCwgeSk7XG4gICAgICAgIHRlbXBWZWMyYi5zdWIodGVtcFZlYzJhLCByb3RhdGVTdGFydCkubXVsdGlwbHkodGhpcy5yb3RhdGVTcGVlZCk7XG4gICAgICAgIGxldCBlbCA9IGVsZW1lbnQgPT09IGRvY3VtZW50ID8gZG9jdW1lbnQuYm9keSA6IGVsZW1lbnQ7XG4gICAgICAgIHNwaGVyaWNhbERlbHRhLnRoZXRhIC09ICgyICogTWF0aC5QSSAqIHRlbXBWZWMyYi54KSAvIGVsLmNsaWVudEhlaWdodDtcbiAgICAgICAgc3BoZXJpY2FsRGVsdGEucGhpIC09ICgyICogTWF0aC5QSSAqIHRlbXBWZWMyYi55KSAvIGVsLmNsaWVudEhlaWdodDtcbiAgICAgICAgcm90YXRlU3RhcnQuY29weSh0ZW1wVmVjMmEpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGhhbmRsZU1vdXNlTW92ZURvbGx5KGUpIHtcbiAgICAgICAgdGVtcFZlYzJhLnNldChlLmNsaWVudFgsIGUuY2xpZW50WSk7XG4gICAgICAgIHRlbXBWZWMyYi5zdWIodGVtcFZlYzJhLCBkb2xseVN0YXJ0KTtcbiAgICAgICAgaWYgKHRlbXBWZWMyYi55ID4gMCkge1xuICAgICAgICAgICAgZG9sbHkoZ2V0Wm9vbVNjYWxlKCkpO1xuICAgICAgICB9IGVsc2UgaWYgKHRlbXBWZWMyYi55IDwgMCkge1xuICAgICAgICAgICAgZG9sbHkoMSAvIGdldFpvb21TY2FsZSgpKTtcbiAgICAgICAgfVxuICAgICAgICBkb2xseVN0YXJ0LmNvcHkodGVtcFZlYzJhKTtcbiAgICB9XG5cbiAgICBsZXQgaGFuZGxlTW92ZVBhbiA9ICh4LCB5KSA9PiB7XG4gICAgICAgIHRlbXBWZWMyYS5zZXQoeCwgeSk7XG4gICAgICAgIHRlbXBWZWMyYi5zdWIodGVtcFZlYzJhLCBwYW5TdGFydCkubXVsdGlwbHkodGhpcy5wYW5TcGVlZCk7XG4gICAgICAgIHBhbih0ZW1wVmVjMmIueCwgdGVtcFZlYzJiLnkpO1xuICAgICAgICBwYW5TdGFydC5jb3B5KHRlbXBWZWMyYSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaGFuZGxlVG91Y2hTdGFydERvbGx5UGFuKGUpIHtcbiAgICAgICAgaWYgKGVuYWJsZVpvb20pIHtcbiAgICAgICAgICAgIGxldCBkeCA9IGUudG91Y2hlc1swXS5wYWdlWCAtIGUudG91Y2hlc1sxXS5wYWdlWDtcbiAgICAgICAgICAgIGxldCBkeSA9IGUudG91Y2hlc1swXS5wYWdlWSAtIGUudG91Y2hlc1sxXS5wYWdlWTtcbiAgICAgICAgICAgIGxldCBkaXN0YW5jZSA9IE1hdGguc3FydChkeCAqIGR4ICsgZHkgKiBkeSk7XG4gICAgICAgICAgICBkb2xseVN0YXJ0LnNldCgwLCBkaXN0YW5jZSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZW5hYmxlUGFuKSB7XG4gICAgICAgICAgICBsZXQgeCA9IDAuNSAqIChlLnRvdWNoZXNbMF0ucGFnZVggKyBlLnRvdWNoZXNbMV0ucGFnZVgpO1xuICAgICAgICAgICAgbGV0IHkgPSAwLjUgKiAoZS50b3VjaGVzWzBdLnBhZ2VZICsgZS50b3VjaGVzWzFdLnBhZ2VZKTtcbiAgICAgICAgICAgIHBhblN0YXJ0LnNldCh4LCB5KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGhhbmRsZVRvdWNoTW92ZURvbGx5UGFuKGUpIHtcbiAgICAgICAgaWYgKGVuYWJsZVpvb20pIHtcbiAgICAgICAgICAgIGxldCBkeCA9IGUudG91Y2hlc1swXS5wYWdlWCAtIGUudG91Y2hlc1sxXS5wYWdlWDtcbiAgICAgICAgICAgIGxldCBkeSA9IGUudG91Y2hlc1swXS5wYWdlWSAtIGUudG91Y2hlc1sxXS5wYWdlWTtcbiAgICAgICAgICAgIGxldCBkaXN0YW5jZSA9IE1hdGguc3FydChkeCAqIGR4ICsgZHkgKiBkeSk7XG4gICAgICAgICAgICB0ZW1wVmVjMmEuc2V0KDAsIGRpc3RhbmNlKTtcbiAgICAgICAgICAgIHRlbXBWZWMyYi5zZXQoMCwgTWF0aC5wb3codGVtcFZlYzJhLnkgLyBkb2xseVN0YXJ0LnksIHpvb21TcGVlZCkpO1xuICAgICAgICAgICAgZG9sbHkodGVtcFZlYzJiLnkpO1xuICAgICAgICAgICAgZG9sbHlTdGFydC5jb3B5KHRlbXBWZWMyYSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZW5hYmxlUGFuKSB7XG4gICAgICAgICAgICBsZXQgeCA9IDAuNSAqIChlLnRvdWNoZXNbMF0ucGFnZVggKyBlLnRvdWNoZXNbMV0ucGFnZVgpO1xuICAgICAgICAgICAgbGV0IHkgPSAwLjUgKiAoZS50b3VjaGVzWzBdLnBhZ2VZICsgZS50b3VjaGVzWzFdLnBhZ2VZKTtcbiAgICAgICAgICAgIGhhbmRsZU1vdmVQYW4oeCwgeSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBvbk1vdXNlRG93biA9IChlKSA9PiB7XG4gICAgICAgIGlmICghdGhpcy5lbmFibGVkKSByZXR1cm47XG5cbiAgICAgICAgc3dpdGNoIChlLmJ1dHRvbikge1xuICAgICAgICAgICAgY2FzZSB0aGlzLm1vdXNlQnV0dG9ucy5PUkJJVDpcbiAgICAgICAgICAgICAgICBpZiAoZW5hYmxlUm90YXRlID09PSBmYWxzZSkgcmV0dXJuO1xuICAgICAgICAgICAgICAgIHJvdGF0ZVN0YXJ0LnNldChlLmNsaWVudFgsIGUuY2xpZW50WSk7XG4gICAgICAgICAgICAgICAgc3RhdGUgPSBTVEFURS5ST1RBVEU7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIHRoaXMubW91c2VCdXR0b25zLlpPT006XG4gICAgICAgICAgICAgICAgaWYgKGVuYWJsZVpvb20gPT09IGZhbHNlKSByZXR1cm47XG4gICAgICAgICAgICAgICAgZG9sbHlTdGFydC5zZXQoZS5jbGllbnRYLCBlLmNsaWVudFkpO1xuICAgICAgICAgICAgICAgIHN0YXRlID0gU1RBVEUuRE9MTFk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIHRoaXMubW91c2VCdXR0b25zLlBBTjpcbiAgICAgICAgICAgICAgICBpZiAoZW5hYmxlUGFuID09PSBmYWxzZSkgcmV0dXJuO1xuICAgICAgICAgICAgICAgIHBhblN0YXJ0LnNldChlLmNsaWVudFgsIGUuY2xpZW50WSk7XG4gICAgICAgICAgICAgICAgc3RhdGUgPSBTVEFURS5QQU47XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoc3RhdGUgIT09IFNUQVRFLk5PTkUpIHtcbiAgICAgICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCBvbk1vdXNlTW92ZSwgZmFsc2UpO1xuICAgICAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCBvbk1vdXNlVXAsIGZhbHNlKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBjb25zdCBvbk1vdXNlTW92ZSA9IChlKSA9PiB7XG4gICAgICAgIGlmICghdGhpcy5lbmFibGVkKSByZXR1cm47XG5cbiAgICAgICAgc3dpdGNoIChzdGF0ZSkge1xuICAgICAgICAgICAgY2FzZSBTVEFURS5ST1RBVEU6XG4gICAgICAgICAgICAgICAgaWYgKGVuYWJsZVJvdGF0ZSA9PT0gZmFsc2UpIHJldHVybjtcbiAgICAgICAgICAgICAgICBoYW5kbGVNb3ZlUm90YXRlKGUuY2xpZW50WCwgZS5jbGllbnRZKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgU1RBVEUuRE9MTFk6XG4gICAgICAgICAgICAgICAgaWYgKGVuYWJsZVpvb20gPT09IGZhbHNlKSByZXR1cm47XG4gICAgICAgICAgICAgICAgaGFuZGxlTW91c2VNb3ZlRG9sbHkoZSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFNUQVRFLlBBTjpcbiAgICAgICAgICAgICAgICBpZiAoZW5hYmxlUGFuID09PSBmYWxzZSkgcmV0dXJuO1xuICAgICAgICAgICAgICAgIGhhbmRsZU1vdmVQYW4oZS5jbGllbnRYLCBlLmNsaWVudFkpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIGNvbnN0IG9uTW91c2VVcCA9ICgpID0+IHtcbiAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIG9uTW91c2VNb3ZlLCBmYWxzZSk7XG4gICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgb25Nb3VzZVVwLCBmYWxzZSk7XG4gICAgICAgIHN0YXRlID0gU1RBVEUuTk9ORTtcbiAgICB9O1xuXG4gICAgY29uc3Qgb25Nb3VzZVdoZWVsID0gKGUpID0+IHtcbiAgICAgICAgaWYgKCF0aGlzLmVuYWJsZWQgfHwgIWVuYWJsZVpvb20gfHwgKHN0YXRlICE9PSBTVEFURS5OT05FICYmIHN0YXRlICE9PSBTVEFURS5ST1RBVEUpKSByZXR1cm47XG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICBpZiAoZS5kZWx0YVkgPCAwKSB7XG4gICAgICAgICAgICBkb2xseSgxIC8gZ2V0Wm9vbVNjYWxlKCkpO1xuICAgICAgICB9IGVsc2UgaWYgKGUuZGVsdGFZID4gMCkge1xuICAgICAgICAgICAgZG9sbHkoZ2V0Wm9vbVNjYWxlKCkpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIGNvbnN0IG9uVG91Y2hTdGFydCA9IChlKSA9PiB7XG4gICAgICAgIGlmICghdGhpcy5lbmFibGVkKSByZXR1cm47XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICBzd2l0Y2ggKGUudG91Y2hlcy5sZW5ndGgpIHtcbiAgICAgICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgICAgICBpZiAoZW5hYmxlUm90YXRlID09PSBmYWxzZSkgcmV0dXJuO1xuICAgICAgICAgICAgICAgIHJvdGF0ZVN0YXJ0LnNldChlLnRvdWNoZXNbMF0ucGFnZVgsIGUudG91Y2hlc1swXS5wYWdlWSk7XG4gICAgICAgICAgICAgICAgc3RhdGUgPSBTVEFURS5ST1RBVEU7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICAgICAgaWYgKGVuYWJsZVpvb20gPT09IGZhbHNlICYmIGVuYWJsZVBhbiA9PT0gZmFsc2UpIHJldHVybjtcbiAgICAgICAgICAgICAgICBoYW5kbGVUb3VjaFN0YXJ0RG9sbHlQYW4oZSk7XG4gICAgICAgICAgICAgICAgc3RhdGUgPSBTVEFURS5ET0xMWV9QQU47XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHN0YXRlID0gU1RBVEUuTk9ORTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBjb25zdCBvblRvdWNoTW92ZSA9IChlKSA9PiB7XG4gICAgICAgIGlmICghdGhpcy5lbmFibGVkKSByZXR1cm47XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcblxuICAgICAgICBzd2l0Y2ggKGUudG91Y2hlcy5sZW5ndGgpIHtcbiAgICAgICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgICAgICBpZiAoZW5hYmxlUm90YXRlID09PSBmYWxzZSkgcmV0dXJuO1xuICAgICAgICAgICAgICAgIGhhbmRsZU1vdmVSb3RhdGUoZS50b3VjaGVzWzBdLnBhZ2VYLCBlLnRvdWNoZXNbMF0ucGFnZVkpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgICAgIGlmIChlbmFibGVab29tID09PSBmYWxzZSAmJiBlbmFibGVQYW4gPT09IGZhbHNlKSByZXR1cm47XG4gICAgICAgICAgICAgICAgaGFuZGxlVG91Y2hNb3ZlRG9sbHlQYW4oZSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHN0YXRlID0gU1RBVEUuTk9ORTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBjb25zdCBvblRvdWNoRW5kID0gKCkgPT4ge1xuICAgICAgICBpZiAoIXRoaXMuZW5hYmxlZCkgcmV0dXJuO1xuICAgICAgICBzdGF0ZSA9IFNUQVRFLk5PTkU7XG4gICAgfTtcblxuICAgIGNvbnN0IG9uQ29udGV4dE1lbnUgPSAoZSkgPT4ge1xuICAgICAgICBpZiAoIXRoaXMuZW5hYmxlZCkgcmV0dXJuO1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIGFkZEhhbmRsZXJzKCkge1xuICAgICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NvbnRleHRtZW51Jywgb25Db250ZXh0TWVudSwgZmFsc2UpO1xuICAgICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIG9uTW91c2VEb3duLCBmYWxzZSk7XG4gICAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignd2hlZWwnLCBvbk1vdXNlV2hlZWwsIHsgcGFzc2l2ZTogZmFsc2UgfSk7XG4gICAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIG9uVG91Y2hTdGFydCwgeyBwYXNzaXZlOiBmYWxzZSB9KTtcbiAgICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIG9uVG91Y2hFbmQsIGZhbHNlKTtcbiAgICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaG1vdmUnLCBvblRvdWNoTW92ZSwgeyBwYXNzaXZlOiBmYWxzZSB9KTtcbiAgICB9XG5cbiAgICB0aGlzLnJlbW92ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdjb250ZXh0bWVudScsIG9uQ29udGV4dE1lbnUpO1xuICAgICAgICBlbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIG9uTW91c2VEb3duKTtcbiAgICAgICAgZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCd3aGVlbCcsIG9uTW91c2VXaGVlbCk7XG4gICAgICAgIGVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIG9uVG91Y2hTdGFydCk7XG4gICAgICAgIGVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCBvblRvdWNoRW5kKTtcbiAgICAgICAgZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaG1vdmUnLCBvblRvdWNoTW92ZSk7XG4gICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCBvbk1vdXNlTW92ZSk7XG4gICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgb25Nb3VzZVVwKTtcbiAgICB9O1xuXG4gICAgYWRkSGFuZGxlcnMoKTtcbn1cbiIsImltcG9ydCB7IEdlb21ldHJ5IH0gZnJvbSAnLi4vY29yZS9HZW9tZXRyeS5qcyc7XG5cbmV4cG9ydCBjbGFzcyBQbGFuZSBleHRlbmRzIEdlb21ldHJ5IHtcbiAgICBjb25zdHJ1Y3RvcihnbCwgeyB3aWR0aCA9IDEsIGhlaWdodCA9IDEsIHdpZHRoU2VnbWVudHMgPSAxLCBoZWlnaHRTZWdtZW50cyA9IDEsIGF0dHJpYnV0ZXMgPSB7fSB9ID0ge30pIHtcbiAgICAgICAgY29uc3Qgd1NlZ3MgPSB3aWR0aFNlZ21lbnRzO1xuICAgICAgICBjb25zdCBoU2VncyA9IGhlaWdodFNlZ21lbnRzO1xuXG4gICAgICAgIC8vIERldGVybWluZSBsZW5ndGggb2YgYXJyYXlzXG4gICAgICAgIGNvbnN0IG51bSA9ICh3U2VncyArIDEpICogKGhTZWdzICsgMSk7XG4gICAgICAgIGNvbnN0IG51bUluZGljZXMgPSB3U2VncyAqIGhTZWdzICogNjtcblxuICAgICAgICAvLyBHZW5lcmF0ZSBlbXB0eSBhcnJheXMgb25jZVxuICAgICAgICBjb25zdCBwb3NpdGlvbiA9IG5ldyBGbG9hdDMyQXJyYXkobnVtICogMyk7XG4gICAgICAgIGNvbnN0IG5vcm1hbCA9IG5ldyBGbG9hdDMyQXJyYXkobnVtICogMyk7XG4gICAgICAgIGNvbnN0IHV2ID0gbmV3IEZsb2F0MzJBcnJheShudW0gKiAyKTtcbiAgICAgICAgY29uc3QgaW5kZXggPSBudW0gPiA2NTUzNiA/IG5ldyBVaW50MzJBcnJheShudW1JbmRpY2VzKSA6IG5ldyBVaW50MTZBcnJheShudW1JbmRpY2VzKTtcblxuICAgICAgICBQbGFuZS5idWlsZFBsYW5lKHBvc2l0aW9uLCBub3JtYWwsIHV2LCBpbmRleCwgd2lkdGgsIGhlaWdodCwgMCwgd1NlZ3MsIGhTZWdzKTtcblxuICAgICAgICBPYmplY3QuYXNzaWduKGF0dHJpYnV0ZXMsIHtcbiAgICAgICAgICAgIHBvc2l0aW9uOiB7IHNpemU6IDMsIGRhdGE6IHBvc2l0aW9uIH0sXG4gICAgICAgICAgICBub3JtYWw6IHsgc2l6ZTogMywgZGF0YTogbm9ybWFsIH0sXG4gICAgICAgICAgICB1djogeyBzaXplOiAyLCBkYXRhOiB1diB9LFxuICAgICAgICAgICAgaW5kZXg6IHsgZGF0YTogaW5kZXggfSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgc3VwZXIoZ2wsIGF0dHJpYnV0ZXMpO1xuICAgIH1cblxuICAgIHN0YXRpYyBidWlsZFBsYW5lKHBvc2l0aW9uLCBub3JtYWwsIHV2LCBpbmRleCwgd2lkdGgsIGhlaWdodCwgZGVwdGgsIHdTZWdzLCBoU2VncywgdSA9IDAsIHYgPSAxLCB3ID0gMiwgdURpciA9IDEsIHZEaXIgPSAtMSwgaSA9IDAsIGlpID0gMCkge1xuICAgICAgICBjb25zdCBpbyA9IGk7XG4gICAgICAgIGNvbnN0IHNlZ1cgPSB3aWR0aCAvIHdTZWdzO1xuICAgICAgICBjb25zdCBzZWdIID0gaGVpZ2h0IC8gaFNlZ3M7XG5cbiAgICAgICAgZm9yIChsZXQgaXkgPSAwOyBpeSA8PSBoU2VnczsgaXkrKykge1xuICAgICAgICAgICAgbGV0IHkgPSBpeSAqIHNlZ0ggLSBoZWlnaHQgLyAyO1xuICAgICAgICAgICAgZm9yIChsZXQgaXggPSAwOyBpeCA8PSB3U2VnczsgaXgrKywgaSsrKSB7XG4gICAgICAgICAgICAgICAgbGV0IHggPSBpeCAqIHNlZ1cgLSB3aWR0aCAvIDI7XG5cbiAgICAgICAgICAgICAgICBwb3NpdGlvbltpICogMyArIHVdID0geCAqIHVEaXI7XG4gICAgICAgICAgICAgICAgcG9zaXRpb25baSAqIDMgKyB2XSA9IHkgKiB2RGlyO1xuICAgICAgICAgICAgICAgIHBvc2l0aW9uW2kgKiAzICsgd10gPSBkZXB0aCAvIDI7XG5cbiAgICAgICAgICAgICAgICBub3JtYWxbaSAqIDMgKyB1XSA9IDA7XG4gICAgICAgICAgICAgICAgbm9ybWFsW2kgKiAzICsgdl0gPSAwO1xuICAgICAgICAgICAgICAgIG5vcm1hbFtpICogMyArIHddID0gZGVwdGggPj0gMCA/IDEgOiAtMTtcblxuICAgICAgICAgICAgICAgIHV2W2kgKiAyXSA9IGl4IC8gd1NlZ3M7XG4gICAgICAgICAgICAgICAgdXZbaSAqIDIgKyAxXSA9IDEgLSBpeSAvIGhTZWdzO1xuXG4gICAgICAgICAgICAgICAgaWYgKGl5ID09PSBoU2VncyB8fCBpeCA9PT0gd1NlZ3MpIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIGxldCBhID0gaW8gKyBpeCArIGl5ICogKHdTZWdzICsgMSk7XG4gICAgICAgICAgICAgICAgbGV0IGIgPSBpbyArIGl4ICsgKGl5ICsgMSkgKiAod1NlZ3MgKyAxKTtcbiAgICAgICAgICAgICAgICBsZXQgYyA9IGlvICsgaXggKyAoaXkgKyAxKSAqICh3U2VncyArIDEpICsgMTtcbiAgICAgICAgICAgICAgICBsZXQgZCA9IGlvICsgaXggKyBpeSAqICh3U2VncyArIDEpICsgMTtcblxuICAgICAgICAgICAgICAgIGluZGV4W2lpICogNl0gPSBhO1xuICAgICAgICAgICAgICAgIGluZGV4W2lpICogNiArIDFdID0gYjtcbiAgICAgICAgICAgICAgICBpbmRleFtpaSAqIDYgKyAyXSA9IGQ7XG4gICAgICAgICAgICAgICAgaW5kZXhbaWkgKiA2ICsgM10gPSBiO1xuICAgICAgICAgICAgICAgIGluZGV4W2lpICogNiArIDRdID0gYztcbiAgICAgICAgICAgICAgICBpbmRleFtpaSAqIDYgKyA1XSA9IGQ7XG4gICAgICAgICAgICAgICAgaWkrKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cbiIsImltcG9ydCB7IEdlb21ldHJ5IH0gZnJvbSAnLi4vY29yZS9HZW9tZXRyeS5qcyc7XG5pbXBvcnQgeyBQcm9ncmFtIH0gZnJvbSAnLi4vY29yZS9Qcm9ncmFtLmpzJztcbmltcG9ydCB7IE1lc2ggfSBmcm9tICcuLi9jb3JlL01lc2guanMnO1xuaW1wb3J0IHsgVmVjMiB9IGZyb20gJy4uL21hdGgvVmVjMi5qcyc7XG5pbXBvcnQgeyBWZWMzIH0gZnJvbSAnLi4vbWF0aC9WZWMzLmpzJztcbmltcG9ydCB7IENvbG9yIH0gZnJvbSAnLi4vbWF0aC9Db2xvci5qcyc7XG5cbmNvbnN0IHRtcCA9IG5ldyBWZWMzKCk7XG5cbmV4cG9ydCBjbGFzcyBQb2x5bGluZSB7XG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIGdsLFxuICAgICAgICB7XG4gICAgICAgICAgICBwb2ludHMsIC8vIEFycmF5IG9mIFZlYzNzXG4gICAgICAgICAgICB2ZXJ0ZXggPSBkZWZhdWx0VmVydGV4LFxuICAgICAgICAgICAgZnJhZ21lbnQgPSBkZWZhdWx0RnJhZ21lbnQsXG4gICAgICAgICAgICB1bmlmb3JtcyA9IHt9LFxuICAgICAgICAgICAgYXR0cmlidXRlcyA9IHt9LCAvLyBGb3IgcGFzc2luZyBpbiBjdXN0b20gYXR0cmlic1xuICAgICAgICB9XG4gICAgKSB7XG4gICAgICAgIHRoaXMuZ2wgPSBnbDtcbiAgICAgICAgdGhpcy5wb2ludHMgPSBwb2ludHM7XG4gICAgICAgIHRoaXMuY291bnQgPSBwb2ludHMubGVuZ3RoO1xuXG4gICAgICAgIC8vIENyZWF0ZSBidWZmZXJzXG4gICAgICAgIHRoaXMucG9zaXRpb24gPSBuZXcgRmxvYXQzMkFycmF5KHRoaXMuY291bnQgKiAzICogMik7XG4gICAgICAgIHRoaXMucHJldiA9IG5ldyBGbG9hdDMyQXJyYXkodGhpcy5jb3VudCAqIDMgKiAyKTtcbiAgICAgICAgdGhpcy5uZXh0ID0gbmV3IEZsb2F0MzJBcnJheSh0aGlzLmNvdW50ICogMyAqIDIpO1xuICAgICAgICBjb25zdCBzaWRlID0gbmV3IEZsb2F0MzJBcnJheSh0aGlzLmNvdW50ICogMSAqIDIpO1xuICAgICAgICBjb25zdCB1diA9IG5ldyBGbG9hdDMyQXJyYXkodGhpcy5jb3VudCAqIDIgKiAyKTtcbiAgICAgICAgY29uc3QgaW5kZXggPSBuZXcgVWludDE2QXJyYXkoKHRoaXMuY291bnQgLSAxKSAqIDMgKiAyKTtcblxuICAgICAgICAvLyBTZXQgc3RhdGljIGJ1ZmZlcnNcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmNvdW50OyBpKyspIHtcbiAgICAgICAgICAgIHNpZGUuc2V0KFstMSwgMV0sIGkgKiAyKTtcbiAgICAgICAgICAgIGNvbnN0IHYgPSBpIC8gKHRoaXMuY291bnQgLSAxKTtcbiAgICAgICAgICAgIHV2LnNldChbMCwgdiwgMSwgdl0sIGkgKiA0KTtcblxuICAgICAgICAgICAgaWYgKGkgPT09IHRoaXMuY291bnQgLSAxKSBjb250aW51ZTtcbiAgICAgICAgICAgIGNvbnN0IGluZCA9IGkgKiAyO1xuICAgICAgICAgICAgaW5kZXguc2V0KFtpbmQgKyAwLCBpbmQgKyAxLCBpbmQgKyAyXSwgKGluZCArIDApICogMyk7XG4gICAgICAgICAgICBpbmRleC5zZXQoW2luZCArIDIsIGluZCArIDEsIGluZCArIDNdLCAoaW5kICsgMSkgKiAzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGdlb21ldHJ5ID0gKHRoaXMuZ2VvbWV0cnkgPSBuZXcgR2VvbWV0cnkoXG4gICAgICAgICAgICBnbCxcbiAgICAgICAgICAgIE9iamVjdC5hc3NpZ24oYXR0cmlidXRlcywge1xuICAgICAgICAgICAgICAgIHBvc2l0aW9uOiB7IHNpemU6IDMsIGRhdGE6IHRoaXMucG9zaXRpb24gfSxcbiAgICAgICAgICAgICAgICBwcmV2OiB7IHNpemU6IDMsIGRhdGE6IHRoaXMucHJldiB9LFxuICAgICAgICAgICAgICAgIG5leHQ6IHsgc2l6ZTogMywgZGF0YTogdGhpcy5uZXh0IH0sXG4gICAgICAgICAgICAgICAgc2lkZTogeyBzaXplOiAxLCBkYXRhOiBzaWRlIH0sXG4gICAgICAgICAgICAgICAgdXY6IHsgc2l6ZTogMiwgZGF0YTogdXYgfSxcbiAgICAgICAgICAgICAgICBpbmRleDogeyBzaXplOiAxLCBkYXRhOiBpbmRleCB9LFxuICAgICAgICAgICAgfSlcbiAgICAgICAgKSk7XG5cbiAgICAgICAgLy8gUG9wdWxhdGUgZHluYW1pYyBidWZmZXJzXG4gICAgICAgIHRoaXMudXBkYXRlR2VvbWV0cnkoKTtcblxuICAgICAgICBpZiAoIXVuaWZvcm1zLnVSZXNvbHV0aW9uKSB0aGlzLnJlc29sdXRpb24gPSB1bmlmb3Jtcy51UmVzb2x1dGlvbiA9IHsgdmFsdWU6IG5ldyBWZWMyKCkgfTtcbiAgICAgICAgaWYgKCF1bmlmb3Jtcy51RFBSKSB0aGlzLmRwciA9IHVuaWZvcm1zLnVEUFIgPSB7IHZhbHVlOiAxIH07XG4gICAgICAgIGlmICghdW5pZm9ybXMudVRoaWNrbmVzcykgdGhpcy50aGlja25lc3MgPSB1bmlmb3Jtcy51VGhpY2tuZXNzID0geyB2YWx1ZTogMSB9O1xuICAgICAgICBpZiAoIXVuaWZvcm1zLnVDb2xvcikgdGhpcy5jb2xvciA9IHVuaWZvcm1zLnVDb2xvciA9IHsgdmFsdWU6IG5ldyBDb2xvcignIzAwMCcpIH07XG4gICAgICAgIGlmICghdW5pZm9ybXMudU1pdGVyKSB0aGlzLm1pdGVyID0gdW5pZm9ybXMudU1pdGVyID0geyB2YWx1ZTogMSB9O1xuXG4gICAgICAgIC8vIFNldCBzaXplIHVuaWZvcm1zJyB2YWx1ZXNcbiAgICAgICAgdGhpcy5yZXNpemUoKTtcblxuICAgICAgICBjb25zdCBwcm9ncmFtID0gKHRoaXMucHJvZ3JhbSA9IG5ldyBQcm9ncmFtKGdsLCB7XG4gICAgICAgICAgICB2ZXJ0ZXgsXG4gICAgICAgICAgICBmcmFnbWVudCxcbiAgICAgICAgICAgIHVuaWZvcm1zLFxuICAgICAgICB9KSk7XG5cbiAgICAgICAgdGhpcy5tZXNoID0gbmV3IE1lc2goZ2wsIHsgZ2VvbWV0cnksIHByb2dyYW0gfSk7XG4gICAgfVxuXG4gICAgdXBkYXRlR2VvbWV0cnkoKSB7XG4gICAgICAgIHRoaXMucG9pbnRzLmZvckVhY2goKHAsIGkpID0+IHtcbiAgICAgICAgICAgIHAudG9BcnJheSh0aGlzLnBvc2l0aW9uLCBpICogMyAqIDIpO1xuICAgICAgICAgICAgcC50b0FycmF5KHRoaXMucG9zaXRpb24sIGkgKiAzICogMiArIDMpO1xuXG4gICAgICAgICAgICBpZiAoIWkpIHtcbiAgICAgICAgICAgICAgICAvLyBJZiBmaXJzdCBwb2ludCwgY2FsY3VsYXRlIHByZXYgdXNpbmcgdGhlIGRpc3RhbmNlIHRvIDJuZCBwb2ludFxuICAgICAgICAgICAgICAgIHRtcC5jb3B5KHApXG4gICAgICAgICAgICAgICAgICAgIC5zdWIodGhpcy5wb2ludHNbaSArIDFdKVxuICAgICAgICAgICAgICAgICAgICAuYWRkKHApO1xuICAgICAgICAgICAgICAgIHRtcC50b0FycmF5KHRoaXMucHJldiwgaSAqIDMgKiAyKTtcbiAgICAgICAgICAgICAgICB0bXAudG9BcnJheSh0aGlzLnByZXYsIGkgKiAzICogMiArIDMpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBwLnRvQXJyYXkodGhpcy5uZXh0LCAoaSAtIDEpICogMyAqIDIpO1xuICAgICAgICAgICAgICAgIHAudG9BcnJheSh0aGlzLm5leHQsIChpIC0gMSkgKiAzICogMiArIDMpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoaSA9PT0gdGhpcy5wb2ludHMubGVuZ3RoIC0gMSkge1xuICAgICAgICAgICAgICAgIC8vIElmIGxhc3QgcG9pbnQsIGNhbGN1bGF0ZSBuZXh0IHVzaW5nIGRpc3RhbmNlIHRvIDJuZCBsYXN0IHBvaW50XG4gICAgICAgICAgICAgICAgdG1wLmNvcHkocClcbiAgICAgICAgICAgICAgICAgICAgLnN1Yih0aGlzLnBvaW50c1tpIC0gMV0pXG4gICAgICAgICAgICAgICAgICAgIC5hZGQocCk7XG4gICAgICAgICAgICAgICAgdG1wLnRvQXJyYXkodGhpcy5uZXh0LCBpICogMyAqIDIpO1xuICAgICAgICAgICAgICAgIHRtcC50b0FycmF5KHRoaXMubmV4dCwgaSAqIDMgKiAyICsgMyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHAudG9BcnJheSh0aGlzLnByZXYsIChpICsgMSkgKiAzICogMik7XG4gICAgICAgICAgICAgICAgcC50b0FycmF5KHRoaXMucHJldiwgKGkgKyAxKSAqIDMgKiAyICsgMyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuZ2VvbWV0cnkuYXR0cmlidXRlcy5wb3NpdGlvbi5uZWVkc1VwZGF0ZSA9IHRydWU7XG4gICAgICAgIHRoaXMuZ2VvbWV0cnkuYXR0cmlidXRlcy5wcmV2Lm5lZWRzVXBkYXRlID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5nZW9tZXRyeS5hdHRyaWJ1dGVzLm5leHQubmVlZHNVcGRhdGUgPSB0cnVlO1xuICAgIH1cblxuICAgIC8vIE9ubHkgbmVlZCB0byBjYWxsIGlmIG5vdCBoYW5kbGluZyByZXNvbHV0aW9uIHVuaWZvcm1zIG1hbnVhbGx5XG4gICAgcmVzaXplKCkge1xuICAgICAgICAvLyBVcGRhdGUgYXV0b21hdGljIHVuaWZvcm1zIGlmIG5vdCBvdmVycmlkZGVuXG4gICAgICAgIGlmICh0aGlzLnJlc29sdXRpb24pIHRoaXMucmVzb2x1dGlvbi52YWx1ZS5zZXQodGhpcy5nbC5jYW52YXMud2lkdGgsIHRoaXMuZ2wuY2FudmFzLmhlaWdodCk7XG4gICAgICAgIGlmICh0aGlzLmRwcikgdGhpcy5kcHIudmFsdWUgPSB0aGlzLmdsLnJlbmRlcmVyLmRwcjtcbiAgICB9XG59XG5cbmNvbnN0IGRlZmF1bHRWZXJ0ZXggPSAvKiBnbHNsICovIGBcbiAgICBwcmVjaXNpb24gaGlnaHAgZmxvYXQ7XG5cbiAgICBhdHRyaWJ1dGUgdmVjMyBwb3NpdGlvbjtcbiAgICBhdHRyaWJ1dGUgdmVjMyBuZXh0O1xuICAgIGF0dHJpYnV0ZSB2ZWMzIHByZXY7XG4gICAgYXR0cmlidXRlIHZlYzIgdXY7XG4gICAgYXR0cmlidXRlIGZsb2F0IHNpZGU7XG5cbiAgICB1bmlmb3JtIG1hdDQgbW9kZWxWaWV3TWF0cml4O1xuICAgIHVuaWZvcm0gbWF0NCBwcm9qZWN0aW9uTWF0cml4O1xuICAgIHVuaWZvcm0gdmVjMiB1UmVzb2x1dGlvbjtcbiAgICB1bmlmb3JtIGZsb2F0IHVEUFI7XG4gICAgdW5pZm9ybSBmbG9hdCB1VGhpY2tuZXNzO1xuICAgIHVuaWZvcm0gZmxvYXQgdU1pdGVyO1xuXG4gICAgdmFyeWluZyB2ZWMyIHZVdjtcblxuICAgIHZlYzQgZ2V0UG9zaXRpb24oKSB7XG4gICAgICAgIG1hdDQgbXZwID0gcHJvamVjdGlvbk1hdHJpeCAqIG1vZGVsVmlld01hdHJpeDtcbiAgICAgICAgdmVjNCBjdXJyZW50ID0gbXZwICogdmVjNChwb3NpdGlvbiwgMSk7XG4gICAgICAgIHZlYzQgbmV4dFBvcyA9IG12cCAqIHZlYzQobmV4dCwgMSk7XG4gICAgICAgIHZlYzQgcHJldlBvcyA9IG12cCAqIHZlYzQocHJldiwgMSk7XG5cbiAgICAgICAgdmVjMiBhc3BlY3QgPSB2ZWMyKHVSZXNvbHV0aW9uLnggLyB1UmVzb2x1dGlvbi55LCAxKTsgICAgXG4gICAgICAgIHZlYzIgY3VycmVudFNjcmVlbiA9IGN1cnJlbnQueHkgLyBjdXJyZW50LncgKiBhc3BlY3Q7XG4gICAgICAgIHZlYzIgbmV4dFNjcmVlbiA9IG5leHRQb3MueHkgLyBuZXh0UG9zLncgKiBhc3BlY3Q7XG4gICAgICAgIHZlYzIgcHJldlNjcmVlbiA9IHByZXZQb3MueHkgLyBwcmV2UG9zLncgKiBhc3BlY3Q7XG4gICAgXG4gICAgICAgIHZlYzIgZGlyMSA9IG5vcm1hbGl6ZShjdXJyZW50U2NyZWVuIC0gcHJldlNjcmVlbik7XG4gICAgICAgIHZlYzIgZGlyMiA9IG5vcm1hbGl6ZShuZXh0U2NyZWVuIC0gY3VycmVudFNjcmVlbik7XG4gICAgICAgIHZlYzIgZGlyID0gbm9ybWFsaXplKGRpcjEgKyBkaXIyKTtcbiAgICBcbiAgICAgICAgdmVjMiBub3JtYWwgPSB2ZWMyKC1kaXIueSwgZGlyLngpO1xuICAgICAgICBub3JtYWwgLz0gbWl4KDEuMCwgbWF4KDAuMywgZG90KG5vcm1hbCwgdmVjMigtZGlyMS55LCBkaXIxLngpKSksIHVNaXRlcik7XG4gICAgICAgIG5vcm1hbCAvPSBhc3BlY3Q7XG5cbiAgICAgICAgZmxvYXQgcGl4ZWxXaWR0aFJhdGlvID0gMS4wIC8gKHVSZXNvbHV0aW9uLnkgLyB1RFBSKTtcbiAgICAgICAgZmxvYXQgcGl4ZWxXaWR0aCA9IGN1cnJlbnQudyAqIHBpeGVsV2lkdGhSYXRpbztcbiAgICAgICAgbm9ybWFsICo9IHBpeGVsV2lkdGggKiB1VGhpY2tuZXNzO1xuICAgICAgICBjdXJyZW50Lnh5IC09IG5vcm1hbCAqIHNpZGU7XG4gICAgXG4gICAgICAgIHJldHVybiBjdXJyZW50O1xuICAgIH1cblxuICAgIHZvaWQgbWFpbigpIHtcbiAgICAgICAgdlV2ID0gdXY7XG4gICAgICAgIGdsX1Bvc2l0aW9uID0gZ2V0UG9zaXRpb24oKTtcbiAgICB9XG5gO1xuXG5jb25zdCBkZWZhdWx0RnJhZ21lbnQgPSAvKiBnbHNsICovIGBcbiAgICBwcmVjaXNpb24gaGlnaHAgZmxvYXQ7XG5cbiAgICB1bmlmb3JtIHZlYzMgdUNvbG9yO1xuICAgIFxuICAgIHZhcnlpbmcgdmVjMiB2VXY7XG5cbiAgICB2b2lkIG1haW4oKSB7XG4gICAgICAgIGdsX0ZyYWdDb2xvci5yZ2IgPSB1Q29sb3I7XG4gICAgICAgIGdsX0ZyYWdDb2xvci5hID0gMS4wO1xuICAgIH1cbmA7XG4iLCIvLyBUT0RPOiBEZXN0cm95IHJlbmRlciB0YXJnZXRzIGlmIHNpemUgY2hhbmdlZCBhbmQgZXhpc3RzXG5cbmltcG9ydCB7IFByb2dyYW0gfSBmcm9tICcuLi9jb3JlL1Byb2dyYW0uanMnO1xuaW1wb3J0IHsgTWVzaCB9IGZyb20gJy4uL2NvcmUvTWVzaC5qcyc7XG5pbXBvcnQgeyBSZW5kZXJUYXJnZXQgfSBmcm9tICcuLi9jb3JlL1JlbmRlclRhcmdldC5qcyc7XG5pbXBvcnQgeyBUcmlhbmdsZSB9IGZyb20gJy4vVHJpYW5nbGUuanMnO1xuXG4vLyBOb3RlOiBVc2UgQ3VzdG9tUG9zdCwgbm90IHRoaXMuXG5leHBvcnQgY2xhc3MgUG9zdCB7XG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIGdsLFxuICAgICAgICB7XG4gICAgICAgICAgICB3aWR0aCxcbiAgICAgICAgICAgIGhlaWdodCxcbiAgICAgICAgICAgIGRwcixcbiAgICAgICAgICAgIHdyYXBTID0gZ2wuQ0xBTVBfVE9fRURHRSxcbiAgICAgICAgICAgIHdyYXBUID0gZ2wuQ0xBTVBfVE9fRURHRSxcbiAgICAgICAgICAgIG1pbkZpbHRlciA9IGdsLkxJTkVBUixcbiAgICAgICAgICAgIG1hZ0ZpbHRlciA9IGdsLkxJTkVBUixcbiAgICAgICAgICAgIGdlb21ldHJ5ID0gbmV3IFRyaWFuZ2xlKGdsKSxcbiAgICAgICAgICAgIHRhcmdldE9ubHkgPSBudWxsLFxuICAgICAgICB9ID0ge30sXG4gICAgICAgIGZibyA9IG51bGwsXG4gICAgKSB7XG4gICAgICAgIHRoaXMuZ2wgPSBnbDtcblxuICAgICAgICB0aGlzLm9wdGlvbnMgPSB7IHdyYXBTLCB3cmFwVCwgbWluRmlsdGVyLCBtYWdGaWx0ZXIgfTtcblxuICAgICAgICB0aGlzLnBhc3NlcyA9IFtdO1xuXG4gICAgICAgIHRoaXMuZ2VvbWV0cnkgPSBnZW9tZXRyeTtcblxuICAgICAgICB0aGlzLnVuaWZvcm0gPSB7IHZhbHVlOiBudWxsIH07XG4gICAgICAgIHRoaXMudGFyZ2V0T25seSA9IHRhcmdldE9ubHk7XG5cbiAgICAgICAgdGhpcy5mYm8gPSBmYm8gfHwge1xuICAgICAgICAgICAgcmVhZDogdW5kZWZpbmVkLFxuICAgICAgICAgICAgd3JpdGU6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIHN3YXA6ICgpID0+IHtcbiAgICAgICAgICAgICAgICBsZXQgdGVtcCA9IHRoaXMuZmJvLnJlYWQ7XG4gICAgICAgICAgICAgICAgdGhpcy5mYm8ucmVhZCA9IHRoaXMuZmJvLndyaXRlO1xuICAgICAgICAgICAgICAgIHRoaXMuZmJvLndyaXRlID0gdGVtcDtcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5yZXNpemUoeyB3aWR0aCwgaGVpZ2h0LCBkcHIgfSk7XG4gICAgfVxuXG4gICAgYWRkUGFzcyh7IHZlcnRleCA9IGRlZmF1bHRWZXJ0ZXgsIGZyYWdtZW50ID0gZGVmYXVsdEZyYWdtZW50LCB1bmlmb3JtcyA9IHt9LCB0ZXh0dXJlVW5pZm9ybSA9ICd0TWFwJywgZW5hYmxlZCA9IHRydWUgfSA9IHt9KSB7XG4gICAgICAgIHVuaWZvcm1zW3RleHR1cmVVbmlmb3JtXSA9IHsgdmFsdWU6IHRoaXMuZmJvLnJlYWQudGV4dHVyZSB9O1xuXG4gICAgICAgIGNvbnN0IHByb2dyYW0gPSBuZXcgUHJvZ3JhbSh0aGlzLmdsLCB7IHZlcnRleCwgZnJhZ21lbnQsIHVuaWZvcm1zIH0pO1xuICAgICAgICBjb25zdCBtZXNoID0gbmV3IE1lc2godGhpcy5nbCwgeyBnZW9tZXRyeTogdGhpcy5nZW9tZXRyeSwgcHJvZ3JhbSB9KTtcblxuICAgICAgICBjb25zdCBwYXNzID0ge1xuICAgICAgICAgICAgbWVzaCxcbiAgICAgICAgICAgIHByb2dyYW0sXG4gICAgICAgICAgICB1bmlmb3JtcyxcbiAgICAgICAgICAgIGVuYWJsZWQsXG4gICAgICAgICAgICB0ZXh0dXJlVW5pZm9ybSxcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLnBhc3Nlcy5wdXNoKHBhc3MpO1xuICAgICAgICByZXR1cm4gcGFzcztcbiAgICB9XG5cbiAgICByZXNpemUoeyB3aWR0aCwgaGVpZ2h0LCBkcHIgfSA9IHt9KSB7XG5cbiAgICAgICAgaWYgKGRwcikgdGhpcy5kcHIgPSBkcHI7XG4gICAgICAgIGlmICh3aWR0aCkge1xuICAgICAgICAgICAgdGhpcy53aWR0aCA9IHdpZHRoO1xuICAgICAgICAgICAgdGhpcy5oZWlnaHQgPSBoZWlnaHQgfHwgd2lkdGg7XG4gICAgICAgIH1cblxuICAgICAgICBkcHIgPSB0aGlzLmRwciB8fCB0aGlzLmdsLnJlbmRlcmVyLmRwcjtcbiAgICAgICAgd2lkdGggPSAodGhpcy53aWR0aCB8fCB0aGlzLmdsLnJlbmRlcmVyLndpZHRoKSAqIGRwcjtcbiAgICAgICAgaGVpZ2h0ID0gKHRoaXMuaGVpZ2h0IHx8IHRoaXMuZ2wucmVuZGVyZXIuaGVpZ2h0KSAqIGRwcjtcblxuICAgICAgICB0aGlzLm9wdGlvbnMud2lkdGggPSB3aWR0aDtcbiAgICAgICAgdGhpcy5vcHRpb25zLmhlaWdodCA9IGhlaWdodDtcbiAgICAgICAgdGhpcy5kaXNwb3NlRmJvKCk7XG4gICAgICAgIHRoaXMuaW5pdEZibygpO1xuICAgIH1cblxuICAgIGRpc3Bvc2VGYm8oKSB7XG4gICAgICAgIHRoaXMuZmJvLnJlYWQgJiYgdGhpcy5mYm8ucmVhZC5kaXNwb3NlKCk7XG4gICAgICAgIHRoaXMuZmJvLndyaXRlICYmIHRoaXMuZmJvLndyaXRlLmRpc3Bvc2UoKTtcbiAgICAgICAgdGhpcy5mYm8ucmVhZCA9IHVuZGVmaW5lZDtcbiAgICAgICAgdGhpcy5mYm8ud3JpdGUgPSB1bmRlZmluZWQ7XG4gICAgfVxuICAgIGluaXRGYm8oKSB7XG4gICAgICAgIHRoaXMuZmJvLnJlYWQgPSBuZXcgUmVuZGVyVGFyZ2V0KHRoaXMuZ2wsIHRoaXMub3B0aW9ucyk7XG4gICAgICAgIHRoaXMuZmJvLndyaXRlID0gbmV3IFJlbmRlclRhcmdldCh0aGlzLmdsLCB0aGlzLm9wdGlvbnMpO1xuICAgIH1cblxuICAgIC8vIFVzZXMgc2FtZSBhcmd1bWVudHMgYXMgcmVuZGVyZXIucmVuZGVyXG4gICAgcmVuZGVyKHsgc2NlbmUsIGNhbWVyYSwgdGFyZ2V0ID0gbnVsbCwgdXBkYXRlID0gdHJ1ZSwgc29ydCA9IHRydWUsIGZydXN0dW1DdWxsID0gdHJ1ZSB9KSB7XG4gICAgICAgIGNvbnN0IGVuYWJsZWRQYXNzZXMgPSB0aGlzLnBhc3Nlcy5maWx0ZXIoKHBhc3MpID0+IHBhc3MuZW5hYmxlZCk7XG5cbiAgICAgICAgdGhpcy5nbC5yZW5kZXJlci5yZW5kZXIoe1xuICAgICAgICAgICAgc2NlbmUsXG4gICAgICAgICAgICBjYW1lcmEsXG4gICAgICAgICAgICB0YXJnZXQ6IGVuYWJsZWRQYXNzZXMubGVuZ3RoIHx8ICghdGFyZ2V0ICYmIHRoaXMudGFyZ2V0T25seSkgPyB0aGlzLmZiby53cml0ZSA6IHRhcmdldCxcbiAgICAgICAgICAgIHVwZGF0ZSxcbiAgICAgICAgICAgIHNvcnQsXG4gICAgICAgICAgICBmcnVzdHVtQ3VsbCxcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuZmJvLnN3YXAoKTtcblxuICAgICAgICBlbmFibGVkUGFzc2VzLmZvckVhY2goKHBhc3MsIGkpID0+IHtcbiAgICAgICAgICAgIHBhc3MubWVzaC5wcm9ncmFtLnVuaWZvcm1zW3Bhc3MudGV4dHVyZVVuaWZvcm1dLnZhbHVlID0gdGhpcy5mYm8ucmVhZC50ZXh0dXJlO1xuICAgICAgICAgICAgdGhpcy5nbC5yZW5kZXJlci5yZW5kZXIoe1xuICAgICAgICAgICAgICAgIHNjZW5lOiBwYXNzLm1lc2gsXG4gICAgICAgICAgICAgICAgdGFyZ2V0OiBpID09PSBlbmFibGVkUGFzc2VzLmxlbmd0aCAtIDEgJiYgKHRhcmdldCB8fCAhdGhpcy50YXJnZXRPbmx5KSA/IHRhcmdldCA6IHRoaXMuZmJvLndyaXRlLFxuICAgICAgICAgICAgICAgIGNsZWFyOiB0cnVlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLmZiby5zd2FwKCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMudW5pZm9ybS52YWx1ZSA9IHRoaXMuZmJvLnJlYWQudGV4dHVyZTtcbiAgICB9XG59XG5cbmNvbnN0IGRlZmF1bHRWZXJ0ZXggPSAvKiBnbHNsICovIGBcbiAgICBhdHRyaWJ1dGUgdmVjMiB1djtcbiAgICBhdHRyaWJ1dGUgdmVjMiBwb3NpdGlvbjtcblxuICAgIHZhcnlpbmcgdmVjMiB2VXY7XG5cbiAgICB2b2lkIG1haW4oKSB7XG4gICAgICAgIHZVdiA9IHV2O1xuICAgICAgICBnbF9Qb3NpdGlvbiA9IHZlYzQocG9zaXRpb24sIDAsIDEpO1xuICAgIH1cbmA7XG5cbmNvbnN0IGRlZmF1bHRGcmFnbWVudCA9IC8qIGdsc2wgKi8gYFxuICAgIHByZWNpc2lvbiBoaWdocCBmbG9hdDtcblxuICAgIHVuaWZvcm0gc2FtcGxlcjJEIHRNYXA7XG4gICAgdmFyeWluZyB2ZWMyIHZVdjtcblxuICAgIHZvaWQgbWFpbigpIHtcbiAgICAgICAgZ2xfRnJhZ0NvbG9yID0gdGV4dHVyZTJEKHRNYXAsIHZVdik7XG4gICAgfVxuYDtcbiIsIi8vIFRPRE86IGJhcnljZW50cmljIGNvZGUgc2hvdWxkbid0IGJlIGhlcmUsIGJ1dCB3aGVyZT9cbi8vIFRPRE86IFNwaGVyZUNhc3Q/XG5cbmltcG9ydCB7IFZlYzIgfSBmcm9tICcuLi9tYXRoL1ZlYzIuanMnO1xuaW1wb3J0IHsgVmVjMyB9IGZyb20gJy4uL21hdGgvVmVjMy5qcyc7XG5pbXBvcnQgeyBNYXQ0IH0gZnJvbSAnLi4vbWF0aC9NYXQ0LmpzJztcblxuY29uc3QgdGVtcFZlYzJhID0gbmV3IFZlYzIoKTtcbmNvbnN0IHRlbXBWZWMyYiA9IG5ldyBWZWMyKCk7XG5jb25zdCB0ZW1wVmVjMmMgPSBuZXcgVmVjMigpO1xuXG5jb25zdCB0ZW1wVmVjM2EgPSBuZXcgVmVjMygpO1xuY29uc3QgdGVtcFZlYzNiID0gbmV3IFZlYzMoKTtcbmNvbnN0IHRlbXBWZWMzYyA9IG5ldyBWZWMzKCk7XG5jb25zdCB0ZW1wVmVjM2QgPSBuZXcgVmVjMygpO1xuY29uc3QgdGVtcFZlYzNlID0gbmV3IFZlYzMoKTtcbmNvbnN0IHRlbXBWZWMzZiA9IG5ldyBWZWMzKCk7XG5jb25zdCB0ZW1wVmVjM2cgPSBuZXcgVmVjMygpO1xuY29uc3QgdGVtcFZlYzNoID0gbmV3IFZlYzMoKTtcbmNvbnN0IHRlbXBWZWMzaSA9IG5ldyBWZWMzKCk7XG5jb25zdCB0ZW1wVmVjM2ogPSBuZXcgVmVjMygpO1xuY29uc3QgdGVtcFZlYzNrID0gbmV3IFZlYzMoKTtcblxuY29uc3QgdGVtcE1hdDQgPSBuZXcgTWF0NCgpO1xuXG5leHBvcnQgY2xhc3MgUmF5Y2FzdCB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMub3JpZ2luID0gbmV3IFZlYzMoKTtcbiAgICAgICAgdGhpcy5kaXJlY3Rpb24gPSBuZXcgVmVjMygpO1xuICAgIH1cblxuICAgIC8vIFNldCByYXkgZnJvbSBtb3VzZSB1bnByb2plY3Rpb25cbiAgICBjYXN0TW91c2UoY2FtZXJhLCBtb3VzZSA9IFswLCAwXSkge1xuICAgICAgICBpZiAoY2FtZXJhLnR5cGUgPT09ICdvcnRob2dyYXBoaWMnKSB7XG4gICAgICAgICAgICAvLyBTZXQgb3JpZ2luXG4gICAgICAgICAgICAvLyBTaW5jZSBjYW1lcmEgaXMgb3J0aG9ncmFwaGljLCBvcmlnaW4gaXMgbm90IHRoZSBjYW1lcmEgcG9zaXRpb25cbiAgICAgICAgICAgIGNvbnN0IHsgbGVmdCwgcmlnaHQsIGJvdHRvbSwgdG9wLCB6b29tIH0gPSBjYW1lcmE7XG4gICAgICAgICAgICBjb25zdCB4ID0gbGVmdCAvIHpvb20gKyAoKHJpZ2h0IC0gbGVmdCkgLyB6b29tKSAqIChtb3VzZVswXSAqIDAuNSArIDAuNSk7XG4gICAgICAgICAgICBjb25zdCB5ID0gYm90dG9tIC8gem9vbSArICgodG9wIC0gYm90dG9tKSAvIHpvb20pICogKG1vdXNlWzFdICogMC41ICsgMC41KTtcbiAgICAgICAgICAgIHRoaXMub3JpZ2luLnNldCh4LCB5LCAwKTtcbiAgICAgICAgICAgIHRoaXMub3JpZ2luLmFwcGx5TWF0cml4NChjYW1lcmEud29ybGRNYXRyaXgpO1xuXG4gICAgICAgICAgICAvLyBTZXQgZGlyZWN0aW9uXG4gICAgICAgICAgICAvLyBodHRwczovL2NvbW11bml0eS5raHJvbm9zLm9yZy90L2dldC1kaXJlY3Rpb24tZnJvbS10cmFuc2Zvcm1hdGlvbi1tYXRyaXgtb3ItcXVhdC82NTUwMi8yXG4gICAgICAgICAgICB0aGlzLmRpcmVjdGlvbi54ID0gLWNhbWVyYS53b3JsZE1hdHJpeFs4XTtcbiAgICAgICAgICAgIHRoaXMuZGlyZWN0aW9uLnkgPSAtY2FtZXJhLndvcmxkTWF0cml4WzldO1xuICAgICAgICAgICAgdGhpcy5kaXJlY3Rpb24ueiA9IC1jYW1lcmEud29ybGRNYXRyaXhbMTBdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gU2V0IG9yaWdpblxuICAgICAgICAgICAgY2FtZXJhLndvcmxkTWF0cml4LmdldFRyYW5zbGF0aW9uKHRoaXMub3JpZ2luKTtcblxuICAgICAgICAgICAgLy8gU2V0IGRpcmVjdGlvblxuICAgICAgICAgICAgdGhpcy5kaXJlY3Rpb24uc2V0KG1vdXNlWzBdLCBtb3VzZVsxXSwgMC41KTtcbiAgICAgICAgICAgIGNhbWVyYS51bnByb2plY3QodGhpcy5kaXJlY3Rpb24pO1xuICAgICAgICAgICAgdGhpcy5kaXJlY3Rpb24uc3ViKHRoaXMub3JpZ2luKS5ub3JtYWxpemUoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGludGVyc2VjdEJvdW5kcyhtZXNoZXMsIHsgbWF4RGlzdGFuY2UsIG91dHB1dCA9IFtdIH0gPSB7fSkge1xuICAgICAgICBpZiAoIUFycmF5LmlzQXJyYXkobWVzaGVzKSkgbWVzaGVzID0gW21lc2hlc107XG5cbiAgICAgICAgY29uc3QgaW52V29ybGRNYXQ0ID0gdGVtcE1hdDQ7XG4gICAgICAgIGNvbnN0IG9yaWdpbiA9IHRlbXBWZWMzYTtcbiAgICAgICAgY29uc3QgZGlyZWN0aW9uID0gdGVtcFZlYzNiO1xuXG4gICAgICAgIGNvbnN0IGhpdHMgPSBvdXRwdXQ7XG4gICAgICAgIGhpdHMubGVuZ3RoID0gMDtcblxuICAgICAgICBtZXNoZXMuZm9yRWFjaCgobWVzaCkgPT4ge1xuICAgICAgICAgICAgLy8gQ3JlYXRlIGJvdW5kc1xuICAgICAgICAgICAgaWYgKCFtZXNoLmdlb21ldHJ5LmJvdW5kcyB8fCBtZXNoLmdlb21ldHJ5LmJvdW5kcy5yYWRpdXMgPT09IEluZmluaXR5KSBtZXNoLmdlb21ldHJ5LmNvbXB1dGVCb3VuZGluZ1NwaGVyZSgpO1xuICAgICAgICAgICAgY29uc3QgYm91bmRzID0gbWVzaC5nZW9tZXRyeS5ib3VuZHM7XG4gICAgICAgICAgICBpbnZXb3JsZE1hdDQuaW52ZXJzZShtZXNoLndvcmxkTWF0cml4KTtcblxuICAgICAgICAgICAgLy8gR2V0IG1heCBkaXN0YW5jZSBsb2NhbGx5XG4gICAgICAgICAgICBsZXQgbG9jYWxNYXhEaXN0YW5jZTtcbiAgICAgICAgICAgIGlmIChtYXhEaXN0YW5jZSkge1xuICAgICAgICAgICAgICAgIGRpcmVjdGlvbi5jb3B5KHRoaXMuZGlyZWN0aW9uKS5zY2FsZVJvdGF0ZU1hdHJpeDQoaW52V29ybGRNYXQ0KTtcbiAgICAgICAgICAgICAgICBsb2NhbE1heERpc3RhbmNlID0gbWF4RGlzdGFuY2UgKiBkaXJlY3Rpb24ubGVuKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFRha2Ugd29ybGQgc3BhY2UgcmF5IGFuZCBtYWtlIGl0IG9iamVjdCBzcGFjZSB0byBhbGlnbiB3aXRoIGJvdW5kaW5nIGJveFxuICAgICAgICAgICAgb3JpZ2luLmNvcHkodGhpcy5vcmlnaW4pLmFwcGx5TWF0cml4NChpbnZXb3JsZE1hdDQpO1xuICAgICAgICAgICAgZGlyZWN0aW9uLmNvcHkodGhpcy5kaXJlY3Rpb24pLnRyYW5zZm9ybURpcmVjdGlvbihpbnZXb3JsZE1hdDQpO1xuXG4gICAgICAgICAgICAvLyBCcmVhayBvdXQgZWFybHkgaWYgYm91bmRzIHRvbyBmYXIgYXdheSBmcm9tIG9yaWdpblxuICAgICAgICAgICAgaWYgKG1heERpc3RhbmNlKSB7XG4gICAgICAgICAgICAgICAgaWYgKG9yaWdpbi5kaXN0YW5jZShib3VuZHMuY2VudGVyKSAtIGJvdW5kcy5yYWRpdXMgPiBsb2NhbE1heERpc3RhbmNlKSByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGxldCBsb2NhbERpc3RhbmNlID0gMDtcblxuICAgICAgICAgICAgLy8gQ2hlY2sgb3JpZ2luIGlzbid0IGluc2lkZSBib3VuZHMgYmVmb3JlIHRlc3RpbmcgaW50ZXJzZWN0aW9uXG4gICAgICAgICAgICBpZiAobWVzaC5nZW9tZXRyeS5yYXljYXN0ID09PSAnc3BoZXJlJykge1xuICAgICAgICAgICAgICAgIGlmIChvcmlnaW4uZGlzdGFuY2UoYm91bmRzLmNlbnRlcikgPiBib3VuZHMucmFkaXVzKSB7XG4gICAgICAgICAgICAgICAgICAgIGxvY2FsRGlzdGFuY2UgPSB0aGlzLmludGVyc2VjdFNwaGVyZShib3VuZHMsIG9yaWdpbiwgZGlyZWN0aW9uKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFsb2NhbERpc3RhbmNlKSByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgICAgIG9yaWdpbi54IDwgYm91bmRzLm1pbi54IHx8XG4gICAgICAgICAgICAgICAgICAgIG9yaWdpbi54ID4gYm91bmRzLm1heC54IHx8XG4gICAgICAgICAgICAgICAgICAgIG9yaWdpbi55IDwgYm91bmRzLm1pbi55IHx8XG4gICAgICAgICAgICAgICAgICAgIG9yaWdpbi55ID4gYm91bmRzLm1heC55IHx8XG4gICAgICAgICAgICAgICAgICAgIG9yaWdpbi56IDwgYm91bmRzLm1pbi56IHx8XG4gICAgICAgICAgICAgICAgICAgIG9yaWdpbi56ID4gYm91bmRzLm1heC56XG4gICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgIGxvY2FsRGlzdGFuY2UgPSB0aGlzLmludGVyc2VjdEJveChib3VuZHMsIG9yaWdpbiwgZGlyZWN0aW9uKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFsb2NhbERpc3RhbmNlKSByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAobWF4RGlzdGFuY2UgJiYgbG9jYWxEaXN0YW5jZSA+IGxvY2FsTWF4RGlzdGFuY2UpIHJldHVybjtcblxuICAgICAgICAgICAgLy8gQ3JlYXRlIG9iamVjdCBvbiBtZXNoIHRvIGF2b2lkIGdlbmVyYXRpbmcgbG90cyBvZiBvYmplY3RzXG4gICAgICAgICAgICBpZiAoIW1lc2guaGl0KSBtZXNoLmhpdCA9IHsgbG9jYWxQb2ludDogbmV3IFZlYzMoKSwgcG9pbnQ6IG5ldyBWZWMzKCkgfTtcblxuICAgICAgICAgICAgbWVzaC5oaXQubG9jYWxQb2ludC5jb3B5KGRpcmVjdGlvbikubXVsdGlwbHkobG9jYWxEaXN0YW5jZSkuYWRkKG9yaWdpbik7XG4gICAgICAgICAgICBtZXNoLmhpdC5wb2ludC5jb3B5KG1lc2guaGl0LmxvY2FsUG9pbnQpLmFwcGx5TWF0cml4NChtZXNoLndvcmxkTWF0cml4KTtcbiAgICAgICAgICAgIG1lc2guaGl0LmRpc3RhbmNlID0gbWVzaC5oaXQucG9pbnQuZGlzdGFuY2UodGhpcy5vcmlnaW4pO1xuXG4gICAgICAgICAgICBoaXRzLnB1c2gobWVzaCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGhpdHMuc29ydCgoYSwgYikgPT4gYS5oaXQuZGlzdGFuY2UgLSBiLmhpdC5kaXN0YW5jZSk7XG4gICAgICAgIHJldHVybiBoaXRzO1xuICAgIH1cblxuICAgIGludGVyc2VjdE1lc2hlcyhtZXNoZXMsIHsgY3VsbEZhY2UgPSB0cnVlLCBtYXhEaXN0YW5jZSwgaW5jbHVkZVVWID0gdHJ1ZSwgaW5jbHVkZU5vcm1hbCA9IHRydWUsIG91dHB1dCA9IFtdIH0gPSB7fSkge1xuICAgICAgICAvLyBUZXN0IGJvdW5kcyBmaXJzdCBiZWZvcmUgdGVzdGluZyBnZW9tZXRyeVxuICAgICAgICBjb25zdCBoaXRzID0gdGhpcy5pbnRlcnNlY3RCb3VuZHMobWVzaGVzLCB7IG1heERpc3RhbmNlLCBvdXRwdXQgfSk7XG4gICAgICAgIGlmICghaGl0cy5sZW5ndGgpIHJldHVybiBoaXRzO1xuXG4gICAgICAgIGNvbnN0IGludldvcmxkTWF0NCA9IHRlbXBNYXQ0O1xuICAgICAgICBjb25zdCBvcmlnaW4gPSB0ZW1wVmVjM2E7XG4gICAgICAgIGNvbnN0IGRpcmVjdGlvbiA9IHRlbXBWZWMzYjtcbiAgICAgICAgY29uc3QgYSA9IHRlbXBWZWMzYztcbiAgICAgICAgY29uc3QgYiA9IHRlbXBWZWMzZDtcbiAgICAgICAgY29uc3QgYyA9IHRlbXBWZWMzZTtcbiAgICAgICAgY29uc3QgY2xvc2VzdEZhY2VOb3JtYWwgPSB0ZW1wVmVjM2Y7XG4gICAgICAgIGNvbnN0IGZhY2VOb3JtYWwgPSB0ZW1wVmVjM2c7XG4gICAgICAgIGNvbnN0IGJhcnljb29yZCA9IHRlbXBWZWMzaDtcbiAgICAgICAgY29uc3QgdXZBID0gdGVtcFZlYzJhO1xuICAgICAgICBjb25zdCB1dkIgPSB0ZW1wVmVjMmI7XG4gICAgICAgIGNvbnN0IHV2QyA9IHRlbXBWZWMyYztcblxuICAgICAgICBmb3IgKGxldCBpID0gaGl0cy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICAgICAgY29uc3QgbWVzaCA9IGhpdHNbaV07XG4gICAgICAgICAgICBpbnZXb3JsZE1hdDQuaW52ZXJzZShtZXNoLndvcmxkTWF0cml4KTtcblxuICAgICAgICAgICAgLy8gR2V0IG1heCBkaXN0YW5jZSBsb2NhbGx5XG4gICAgICAgICAgICBsZXQgbG9jYWxNYXhEaXN0YW5jZTtcbiAgICAgICAgICAgIGlmIChtYXhEaXN0YW5jZSkge1xuICAgICAgICAgICAgICAgIGRpcmVjdGlvbi5jb3B5KHRoaXMuZGlyZWN0aW9uKS5zY2FsZVJvdGF0ZU1hdHJpeDQoaW52V29ybGRNYXQ0KTtcbiAgICAgICAgICAgICAgICBsb2NhbE1heERpc3RhbmNlID0gbWF4RGlzdGFuY2UgKiBkaXJlY3Rpb24ubGVuKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFRha2Ugd29ybGQgc3BhY2UgcmF5IGFuZCBtYWtlIGl0IG9iamVjdCBzcGFjZSB0byBhbGlnbiB3aXRoIGJvdW5kaW5nIGJveFxuICAgICAgICAgICAgb3JpZ2luLmNvcHkodGhpcy5vcmlnaW4pLmFwcGx5TWF0cml4NChpbnZXb3JsZE1hdDQpO1xuICAgICAgICAgICAgZGlyZWN0aW9uLmNvcHkodGhpcy5kaXJlY3Rpb24pLnRyYW5zZm9ybURpcmVjdGlvbihpbnZXb3JsZE1hdDQpO1xuXG4gICAgICAgICAgICBsZXQgbG9jYWxEaXN0YW5jZSA9IDA7XG4gICAgICAgICAgICBsZXQgY2xvc2VzdEEsIGNsb3Nlc3RCLCBjbG9zZXN0QztcblxuICAgICAgICAgICAgY29uc3QgZ2VvbWV0cnkgPSBtZXNoLmdlb21ldHJ5O1xuICAgICAgICAgICAgY29uc3QgYXR0cmlidXRlcyA9IGdlb21ldHJ5LmF0dHJpYnV0ZXM7XG4gICAgICAgICAgICBjb25zdCBpbmRleCA9IGF0dHJpYnV0ZXMuaW5kZXg7XG5cbiAgICAgICAgICAgIGNvbnN0IHN0YXJ0ID0gTWF0aC5tYXgoMCwgZ2VvbWV0cnkuZHJhd1JhbmdlLnN0YXJ0KTtcbiAgICAgICAgICAgIGNvbnN0IGVuZCA9IE1hdGgubWluKGluZGV4ID8gaW5kZXguY291bnQgOiBhdHRyaWJ1dGVzLnBvc2l0aW9uLmNvdW50LCBnZW9tZXRyeS5kcmF3UmFuZ2Uuc3RhcnQgKyBnZW9tZXRyeS5kcmF3UmFuZ2UuY291bnQpO1xuXG4gICAgICAgICAgICBmb3IgKGxldCBqID0gc3RhcnQ7IGogPCBlbmQ7IGogKz0gMykge1xuICAgICAgICAgICAgICAgIC8vIFBvc2l0aW9uIGF0dHJpYnV0ZSBpbmRpY2VzIGZvciBlYWNoIHRyaWFuZ2xlXG4gICAgICAgICAgICAgICAgY29uc3QgYWkgPSBpbmRleCA/IGluZGV4LmRhdGFbal0gOiBqO1xuICAgICAgICAgICAgICAgIGNvbnN0IGJpID0gaW5kZXggPyBpbmRleC5kYXRhW2ogKyAxXSA6IGogKyAxO1xuICAgICAgICAgICAgICAgIGNvbnN0IGNpID0gaW5kZXggPyBpbmRleC5kYXRhW2ogKyAyXSA6IGogKyAyO1xuXG4gICAgICAgICAgICAgICAgYS5mcm9tQXJyYXkoYXR0cmlidXRlcy5wb3NpdGlvbi5kYXRhLCBhaSAqIDMpO1xuICAgICAgICAgICAgICAgIGIuZnJvbUFycmF5KGF0dHJpYnV0ZXMucG9zaXRpb24uZGF0YSwgYmkgKiAzKTtcbiAgICAgICAgICAgICAgICBjLmZyb21BcnJheShhdHRyaWJ1dGVzLnBvc2l0aW9uLmRhdGEsIGNpICogMyk7XG5cbiAgICAgICAgICAgICAgICBjb25zdCBkaXN0YW5jZSA9IHRoaXMuaW50ZXJzZWN0VHJpYW5nbGUoYSwgYiwgYywgY3VsbEZhY2UsIG9yaWdpbiwgZGlyZWN0aW9uLCBmYWNlTm9ybWFsKTtcbiAgICAgICAgICAgICAgICBpZiAoIWRpc3RhbmNlKSBjb250aW51ZTtcblxuICAgICAgICAgICAgICAgIC8vIFRvbyBmYXIgYXdheVxuICAgICAgICAgICAgICAgIGlmIChtYXhEaXN0YW5jZSAmJiBkaXN0YW5jZSA+IGxvY2FsTWF4RGlzdGFuY2UpIGNvbnRpbnVlO1xuXG4gICAgICAgICAgICAgICAgaWYgKCFsb2NhbERpc3RhbmNlIHx8IGRpc3RhbmNlIDwgbG9jYWxEaXN0YW5jZSkge1xuICAgICAgICAgICAgICAgICAgICBsb2NhbERpc3RhbmNlID0gZGlzdGFuY2U7XG4gICAgICAgICAgICAgICAgICAgIGNsb3Nlc3RBID0gYWk7XG4gICAgICAgICAgICAgICAgICAgIGNsb3Nlc3RCID0gYmk7XG4gICAgICAgICAgICAgICAgICAgIGNsb3Nlc3RDID0gY2k7XG4gICAgICAgICAgICAgICAgICAgIGNsb3Nlc3RGYWNlTm9ybWFsLmNvcHkoZmFjZU5vcm1hbCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIWxvY2FsRGlzdGFuY2UpIGhpdHMuc3BsaWNlKGksIDEpO1xuXG4gICAgICAgICAgICAvLyBVcGRhdGUgaGl0IHZhbHVlcyBmcm9tIGJvdW5kcy10ZXN0XG4gICAgICAgICAgICBtZXNoLmhpdC5sb2NhbFBvaW50LmNvcHkoZGlyZWN0aW9uKS5tdWx0aXBseShsb2NhbERpc3RhbmNlKS5hZGQob3JpZ2luKTtcbiAgICAgICAgICAgIG1lc2guaGl0LnBvaW50LmNvcHkobWVzaC5oaXQubG9jYWxQb2ludCkuYXBwbHlNYXRyaXg0KG1lc2gud29ybGRNYXRyaXgpO1xuICAgICAgICAgICAgbWVzaC5oaXQuZGlzdGFuY2UgPSBtZXNoLmhpdC5wb2ludC5kaXN0YW5jZSh0aGlzLm9yaWdpbik7XG5cbiAgICAgICAgICAgIC8vIEFkZCB1bmlxdWUgaGl0IG9iamVjdHMgb24gbWVzaCB0byBhdm9pZCBnZW5lcmF0aW5nIGxvdHMgb2Ygb2JqZWN0c1xuICAgICAgICAgICAgaWYgKCFtZXNoLmhpdC5mYWNlTm9ybWFsKSB7XG4gICAgICAgICAgICAgICAgbWVzaC5oaXQubG9jYWxGYWNlTm9ybWFsID0gbmV3IFZlYzMoKTtcbiAgICAgICAgICAgICAgICBtZXNoLmhpdC5mYWNlTm9ybWFsID0gbmV3IFZlYzMoKTtcbiAgICAgICAgICAgICAgICBtZXNoLmhpdC51diA9IG5ldyBWZWMyKCk7XG4gICAgICAgICAgICAgICAgbWVzaC5oaXQubG9jYWxOb3JtYWwgPSBuZXcgVmVjMygpO1xuICAgICAgICAgICAgICAgIG1lc2guaGl0Lm5vcm1hbCA9IG5ldyBWZWMzKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIEFkZCBmYWNlIG5vcm1hbCBkYXRhIHdoaWNoIGlzIGFscmVhZHkgY29tcHV0ZWRcbiAgICAgICAgICAgIG1lc2guaGl0LmxvY2FsRmFjZU5vcm1hbC5jb3B5KGNsb3Nlc3RGYWNlTm9ybWFsKTtcbiAgICAgICAgICAgIG1lc2guaGl0LmZhY2VOb3JtYWwuY29weShtZXNoLmhpdC5sb2NhbEZhY2VOb3JtYWwpLnRyYW5zZm9ybURpcmVjdGlvbihtZXNoLndvcmxkTWF0cml4KTtcblxuICAgICAgICAgICAgLy8gT3B0aW9uYWwgZGF0YSwgb3B0IG91dCB0byBvcHRpbWlzZSBhIGJpdCBpZiBuZWNlc3NhcnlcbiAgICAgICAgICAgIGlmIChpbmNsdWRlVVYgfHwgaW5jbHVkZU5vcm1hbCkge1xuICAgICAgICAgICAgICAgIC8vIENhbGN1bGF0ZSBiYXJ5Y29vcmRzIHRvIGZpbmQgdXYgdmFsdWVzIGF0IGhpdCBwb2ludFxuICAgICAgICAgICAgICAgIGEuZnJvbUFycmF5KGF0dHJpYnV0ZXMucG9zaXRpb24uZGF0YSwgY2xvc2VzdEEgKiAzKTtcbiAgICAgICAgICAgICAgICBiLmZyb21BcnJheShhdHRyaWJ1dGVzLnBvc2l0aW9uLmRhdGEsIGNsb3Nlc3RCICogMyk7XG4gICAgICAgICAgICAgICAgYy5mcm9tQXJyYXkoYXR0cmlidXRlcy5wb3NpdGlvbi5kYXRhLCBjbG9zZXN0QyAqIDMpO1xuICAgICAgICAgICAgICAgIHRoaXMuZ2V0QmFyeWNvb3JkKG1lc2guaGl0LmxvY2FsUG9pbnQsIGEsIGIsIGMsIGJhcnljb29yZCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChpbmNsdWRlVVYgJiYgYXR0cmlidXRlcy51dikge1xuICAgICAgICAgICAgICAgIHV2QS5mcm9tQXJyYXkoYXR0cmlidXRlcy51di5kYXRhLCBjbG9zZXN0QSAqIDIpO1xuICAgICAgICAgICAgICAgIHV2Qi5mcm9tQXJyYXkoYXR0cmlidXRlcy51di5kYXRhLCBjbG9zZXN0QiAqIDIpO1xuICAgICAgICAgICAgICAgIHV2Qy5mcm9tQXJyYXkoYXR0cmlidXRlcy51di5kYXRhLCBjbG9zZXN0QyAqIDIpO1xuICAgICAgICAgICAgICAgIG1lc2guaGl0LnV2LnNldChcbiAgICAgICAgICAgICAgICAgICAgdXZBLnggKiBiYXJ5Y29vcmQueCArIHV2Qi54ICogYmFyeWNvb3JkLnkgKyB1dkMueCAqIGJhcnljb29yZC56LFxuICAgICAgICAgICAgICAgICAgICB1dkEueSAqIGJhcnljb29yZC54ICsgdXZCLnkgKiBiYXJ5Y29vcmQueSArIHV2Qy55ICogYmFyeWNvb3JkLnpcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoaW5jbHVkZU5vcm1hbCAmJiBhdHRyaWJ1dGVzLm5vcm1hbCkge1xuICAgICAgICAgICAgICAgIGEuZnJvbUFycmF5KGF0dHJpYnV0ZXMubm9ybWFsLmRhdGEsIGNsb3Nlc3RBICogMyk7XG4gICAgICAgICAgICAgICAgYi5mcm9tQXJyYXkoYXR0cmlidXRlcy5ub3JtYWwuZGF0YSwgY2xvc2VzdEIgKiAzKTtcbiAgICAgICAgICAgICAgICBjLmZyb21BcnJheShhdHRyaWJ1dGVzLm5vcm1hbC5kYXRhLCBjbG9zZXN0QyAqIDMpO1xuICAgICAgICAgICAgICAgIG1lc2guaGl0LmxvY2FsTm9ybWFsLnNldChcbiAgICAgICAgICAgICAgICAgICAgYS54ICogYmFyeWNvb3JkLnggKyBiLnggKiBiYXJ5Y29vcmQueSArIGMueCAqIGJhcnljb29yZC56LFxuICAgICAgICAgICAgICAgICAgICBhLnkgKiBiYXJ5Y29vcmQueCArIGIueSAqIGJhcnljb29yZC55ICsgYy55ICogYmFyeWNvb3JkLnosXG4gICAgICAgICAgICAgICAgICAgIGEueiAqIGJhcnljb29yZC54ICsgYi56ICogYmFyeWNvb3JkLnkgKyBjLnogKiBiYXJ5Y29vcmQuelxuICAgICAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgICAgICBtZXNoLmhpdC5ub3JtYWwuY29weShtZXNoLmhpdC5sb2NhbE5vcm1hbCkudHJhbnNmb3JtRGlyZWN0aW9uKG1lc2gud29ybGRNYXRyaXgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaGl0cy5zb3J0KChhLCBiKSA9PiBhLmhpdC5kaXN0YW5jZSAtIGIuaGl0LmRpc3RhbmNlKTtcbiAgICAgICAgcmV0dXJuIGhpdHM7XG4gICAgfVxuXG4gICAgaW50ZXJzZWN0U3BoZXJlKHNwaGVyZSwgb3JpZ2luID0gdGhpcy5vcmlnaW4sIGRpcmVjdGlvbiA9IHRoaXMuZGlyZWN0aW9uKSB7XG4gICAgICAgIGNvbnN0IHJheSA9IHRlbXBWZWMzYztcbiAgICAgICAgcmF5LnN1YihzcGhlcmUuY2VudGVyLCBvcmlnaW4pO1xuICAgICAgICBjb25zdCB0Y2EgPSByYXkuZG90KGRpcmVjdGlvbik7XG4gICAgICAgIGNvbnN0IGQyID0gcmF5LmRvdChyYXkpIC0gdGNhICogdGNhO1xuICAgICAgICBjb25zdCByYWRpdXMyID0gc3BoZXJlLnJhZGl1cyAqIHNwaGVyZS5yYWRpdXM7XG4gICAgICAgIGlmIChkMiA+IHJhZGl1czIpIHJldHVybiAwO1xuICAgICAgICBjb25zdCB0aGMgPSBNYXRoLnNxcnQocmFkaXVzMiAtIGQyKTtcbiAgICAgICAgY29uc3QgdDAgPSB0Y2EgLSB0aGM7XG4gICAgICAgIGNvbnN0IHQxID0gdGNhICsgdGhjO1xuICAgICAgICBpZiAodDAgPCAwICYmIHQxIDwgMCkgcmV0dXJuIDA7XG4gICAgICAgIGlmICh0MCA8IDApIHJldHVybiB0MTtcbiAgICAgICAgcmV0dXJuIHQwO1xuICAgIH1cblxuICAgIC8vIFJheSBBQUJCIC0gUmF5IEF4aXMgYWxpZ25lZCBib3VuZGluZyBib3ggdGVzdGluZ1xuICAgIGludGVyc2VjdEJveChib3gsIG9yaWdpbiA9IHRoaXMub3JpZ2luLCBkaXJlY3Rpb24gPSB0aGlzLmRpcmVjdGlvbikge1xuICAgICAgICBsZXQgdG1pbiwgdG1heCwgdFltaW4sIHRZbWF4LCB0Wm1pbiwgdFptYXg7XG4gICAgICAgIGNvbnN0IGludmRpcnggPSAxIC8gZGlyZWN0aW9uLng7XG4gICAgICAgIGNvbnN0IGludmRpcnkgPSAxIC8gZGlyZWN0aW9uLnk7XG4gICAgICAgIGNvbnN0IGludmRpcnogPSAxIC8gZGlyZWN0aW9uLno7XG4gICAgICAgIGNvbnN0IG1pbiA9IGJveC5taW47XG4gICAgICAgIGNvbnN0IG1heCA9IGJveC5tYXg7XG4gICAgICAgIHRtaW4gPSAoKGludmRpcnggPj0gMCA/IG1pbi54IDogbWF4LngpIC0gb3JpZ2luLngpICogaW52ZGlyeDtcbiAgICAgICAgdG1heCA9ICgoaW52ZGlyeCA+PSAwID8gbWF4LnggOiBtaW4ueCkgLSBvcmlnaW4ueCkgKiBpbnZkaXJ4O1xuICAgICAgICB0WW1pbiA9ICgoaW52ZGlyeSA+PSAwID8gbWluLnkgOiBtYXgueSkgLSBvcmlnaW4ueSkgKiBpbnZkaXJ5O1xuICAgICAgICB0WW1heCA9ICgoaW52ZGlyeSA+PSAwID8gbWF4LnkgOiBtaW4ueSkgLSBvcmlnaW4ueSkgKiBpbnZkaXJ5O1xuICAgICAgICBpZiAodG1pbiA+IHRZbWF4IHx8IHRZbWluID4gdG1heCkgcmV0dXJuIDA7XG4gICAgICAgIGlmICh0WW1pbiA+IHRtaW4pIHRtaW4gPSB0WW1pbjtcbiAgICAgICAgaWYgKHRZbWF4IDwgdG1heCkgdG1heCA9IHRZbWF4O1xuICAgICAgICB0Wm1pbiA9ICgoaW52ZGlyeiA+PSAwID8gbWluLnogOiBtYXgueikgLSBvcmlnaW4ueikgKiBpbnZkaXJ6O1xuICAgICAgICB0Wm1heCA9ICgoaW52ZGlyeiA+PSAwID8gbWF4LnogOiBtaW4ueikgLSBvcmlnaW4ueikgKiBpbnZkaXJ6O1xuICAgICAgICBpZiAodG1pbiA+IHRabWF4IHx8IHRabWluID4gdG1heCkgcmV0dXJuIDA7XG4gICAgICAgIGlmICh0Wm1pbiA+IHRtaW4pIHRtaW4gPSB0Wm1pbjtcbiAgICAgICAgaWYgKHRabWF4IDwgdG1heCkgdG1heCA9IHRabWF4O1xuICAgICAgICBpZiAodG1heCA8IDApIHJldHVybiAwO1xuICAgICAgICByZXR1cm4gdG1pbiA+PSAwID8gdG1pbiA6IHRtYXg7XG4gICAgfVxuXG4gICAgaW50ZXJzZWN0VHJpYW5nbGUoYSwgYiwgYywgYmFja2ZhY2VDdWxsaW5nID0gdHJ1ZSwgb3JpZ2luID0gdGhpcy5vcmlnaW4sIGRpcmVjdGlvbiA9IHRoaXMuZGlyZWN0aW9uLCBub3JtYWwgPSB0ZW1wVmVjM2cpIHtcbiAgICAgICAgLy8gZnJvbSBodHRwczovL2dpdGh1Yi5jb20vbXJkb29iL3RocmVlLmpzL2Jsb2IvbWFzdGVyL3NyYy9tYXRoL1JheS5qc1xuICAgICAgICAvLyB3aGljaCBpcyBmcm9tIGh0dHA6Ly93d3cuZ2VvbWV0cmljdG9vbHMuY29tL0dURW5naW5lL0luY2x1ZGUvTWF0aGVtYXRpY3MvR3RlSW50clJheTNUcmlhbmdsZTMuaFxuICAgICAgICBjb25zdCBlZGdlMSA9IHRlbXBWZWMzaDtcbiAgICAgICAgY29uc3QgZWRnZTIgPSB0ZW1wVmVjM2k7XG4gICAgICAgIGNvbnN0IGRpZmYgPSB0ZW1wVmVjM2o7XG4gICAgICAgIGVkZ2UxLnN1YihiLCBhKTtcbiAgICAgICAgZWRnZTIuc3ViKGMsIGEpO1xuICAgICAgICBub3JtYWwuY3Jvc3MoZWRnZTEsIGVkZ2UyKTtcbiAgICAgICAgbGV0IERkTiA9IGRpcmVjdGlvbi5kb3Qobm9ybWFsKTtcbiAgICAgICAgaWYgKCFEZE4pIHJldHVybiAwO1xuICAgICAgICBsZXQgc2lnbjtcbiAgICAgICAgaWYgKERkTiA+IDApIHtcbiAgICAgICAgICAgIGlmIChiYWNrZmFjZUN1bGxpbmcpIHJldHVybiAwO1xuICAgICAgICAgICAgc2lnbiA9IDE7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzaWduID0gLTE7XG4gICAgICAgICAgICBEZE4gPSAtRGROO1xuICAgICAgICB9XG4gICAgICAgIGRpZmYuc3ViKG9yaWdpbiwgYSk7XG4gICAgICAgIGxldCBEZFF4RTIgPSBzaWduICogZGlyZWN0aW9uLmRvdChlZGdlMi5jcm9zcyhkaWZmLCBlZGdlMikpO1xuICAgICAgICBpZiAoRGRReEUyIDwgMCkgcmV0dXJuIDA7XG4gICAgICAgIGxldCBEZEUxeFEgPSBzaWduICogZGlyZWN0aW9uLmRvdChlZGdlMS5jcm9zcyhkaWZmKSk7XG4gICAgICAgIGlmIChEZEUxeFEgPCAwKSByZXR1cm4gMDtcbiAgICAgICAgaWYgKERkUXhFMiArIERkRTF4USA+IERkTikgcmV0dXJuIDA7XG4gICAgICAgIGxldCBRZE4gPSAtc2lnbiAqIGRpZmYuZG90KG5vcm1hbCk7XG4gICAgICAgIGlmIChRZE4gPCAwKSByZXR1cm4gMDtcbiAgICAgICAgcmV0dXJuIFFkTiAvIERkTjtcbiAgICB9XG5cbiAgICBnZXRCYXJ5Y29vcmQocG9pbnQsIGEsIGIsIGMsIHRhcmdldCA9IHRlbXBWZWMzaCkge1xuICAgICAgICAvLyBGcm9tIGh0dHBzOi8vZ2l0aHViLmNvbS9tcmRvb2IvdGhyZWUuanMvYmxvYi9tYXN0ZXIvc3JjL21hdGgvVHJpYW5nbGUuanNcbiAgICAgICAgLy8gc3RhdGljL2luc3RhbmNlIG1ldGhvZCB0byBjYWxjdWxhdGUgYmFyeWNlbnRyaWMgY29vcmRpbmF0ZXNcbiAgICAgICAgLy8gYmFzZWQgb246IGh0dHA6Ly93d3cuYmxhY2twYXduLmNvbS90ZXh0cy9wb2ludGlucG9seS9kZWZhdWx0Lmh0bWxcbiAgICAgICAgY29uc3QgdjAgPSB0ZW1wVmVjM2k7XG4gICAgICAgIGNvbnN0IHYxID0gdGVtcFZlYzNqO1xuICAgICAgICBjb25zdCB2MiA9IHRlbXBWZWMzaztcbiAgICAgICAgdjAuc3ViKGMsIGEpO1xuICAgICAgICB2MS5zdWIoYiwgYSk7XG4gICAgICAgIHYyLnN1Yihwb2ludCwgYSk7XG4gICAgICAgIGNvbnN0IGRvdDAwID0gdjAuZG90KHYwKTtcbiAgICAgICAgY29uc3QgZG90MDEgPSB2MC5kb3QodjEpO1xuICAgICAgICBjb25zdCBkb3QwMiA9IHYwLmRvdCh2Mik7XG4gICAgICAgIGNvbnN0IGRvdDExID0gdjEuZG90KHYxKTtcbiAgICAgICAgY29uc3QgZG90MTIgPSB2MS5kb3QodjIpO1xuICAgICAgICBjb25zdCBkZW5vbSA9IGRvdDAwICogZG90MTEgLSBkb3QwMSAqIGRvdDAxO1xuICAgICAgICBpZiAoZGVub20gPT09IDApIHJldHVybiB0YXJnZXQuc2V0KC0yLCAtMSwgLTEpO1xuICAgICAgICBjb25zdCBpbnZEZW5vbSA9IDEgLyBkZW5vbTtcbiAgICAgICAgY29uc3QgdSA9IChkb3QxMSAqIGRvdDAyIC0gZG90MDEgKiBkb3QxMikgKiBpbnZEZW5vbTtcbiAgICAgICAgY29uc3QgdiA9IChkb3QwMCAqIGRvdDEyIC0gZG90MDEgKiBkb3QwMikgKiBpbnZEZW5vbTtcbiAgICAgICAgcmV0dXJuIHRhcmdldC5zZXQoMSAtIHUgLSB2LCB2LCB1KTtcbiAgICB9XG59XG4iLCJpbXBvcnQgeyBDYW1lcmEgfSBmcm9tICcuLi9jb3JlL0NhbWVyYS5qcyc7XG5pbXBvcnQgeyBQcm9ncmFtIH0gZnJvbSAnLi4vY29yZS9Qcm9ncmFtLmpzJztcbmltcG9ydCB7IFJlbmRlclRhcmdldCB9IGZyb20gJy4uL2NvcmUvUmVuZGVyVGFyZ2V0LmpzJztcblxuZXhwb3J0IGNsYXNzIFNoYWRvdyB7XG4gICAgY29uc3RydWN0b3IoZ2wsIHsgbGlnaHQgPSBuZXcgQ2FtZXJhKGdsKSwgd2lkdGggPSAxMDI0LCBoZWlnaHQgPSB3aWR0aCB9KSB7XG4gICAgICAgIHRoaXMuZ2wgPSBnbDtcblxuICAgICAgICB0aGlzLmxpZ2h0ID0gbGlnaHQ7XG5cbiAgICAgICAgdGhpcy50YXJnZXQgPSBuZXcgUmVuZGVyVGFyZ2V0KGdsLCB7IHdpZHRoLCBoZWlnaHQgfSk7XG5cbiAgICAgICAgdGhpcy5kZXB0aFByb2dyYW0gPSBuZXcgUHJvZ3JhbShnbCwge1xuICAgICAgICAgICAgdmVydGV4OiBkZWZhdWx0VmVydGV4LFxuICAgICAgICAgICAgZnJhZ21lbnQ6IGRlZmF1bHRGcmFnbWVudCxcbiAgICAgICAgICAgIGN1bGxGYWNlOiBudWxsLFxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLmNhc3RNZXNoZXMgPSBbXTtcbiAgICB9XG5cbiAgICBhZGQoe1xuICAgICAgICBtZXNoLFxuICAgICAgICByZWNlaXZlID0gdHJ1ZSxcbiAgICAgICAgY2FzdCA9IHRydWUsXG4gICAgICAgIHZlcnRleCA9IGRlZmF1bHRWZXJ0ZXgsXG4gICAgICAgIGZyYWdtZW50ID0gZGVmYXVsdEZyYWdtZW50LFxuICAgICAgICB1bmlmb3JtUHJvamVjdGlvbiA9ICdzaGFkb3dQcm9qZWN0aW9uTWF0cml4JyxcbiAgICAgICAgdW5pZm9ybVZpZXcgPSAnc2hhZG93Vmlld01hdHJpeCcsXG4gICAgICAgIHVuaWZvcm1UZXh0dXJlID0gJ3RTaGFkb3cnLFxuICAgIH0pIHtcbiAgICAgICAgLy8gQWRkIHVuaWZvcm1zIHRvIGV4aXN0aW5nIHByb2dyYW1cbiAgICAgICAgaWYgKHJlY2VpdmUgJiYgIW1lc2gucHJvZ3JhbS51bmlmb3Jtc1t1bmlmb3JtUHJvamVjdGlvbl0pIHtcbiAgICAgICAgICAgIG1lc2gucHJvZ3JhbS51bmlmb3Jtc1t1bmlmb3JtUHJvamVjdGlvbl0gPSB7IHZhbHVlOiB0aGlzLmxpZ2h0LnByb2plY3Rpb25NYXRyaXggfTtcbiAgICAgICAgICAgIG1lc2gucHJvZ3JhbS51bmlmb3Jtc1t1bmlmb3JtVmlld10gPSB7IHZhbHVlOiB0aGlzLmxpZ2h0LnZpZXdNYXRyaXggfTtcbiAgICAgICAgICAgIG1lc2gucHJvZ3JhbS51bmlmb3Jtc1t1bmlmb3JtVGV4dHVyZV0gPSB7IHZhbHVlOiB0aGlzLnRhcmdldC50ZXh0dXJlIH07XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIWNhc3QpIHJldHVybjtcbiAgICAgICAgdGhpcy5jYXN0TWVzaGVzLnB1c2gobWVzaCk7XG5cbiAgICAgICAgLy8gU3RvcmUgcHJvZ3JhbSBmb3Igd2hlbiBzd2l0Y2hpbmcgYmV0d2VlbiBkZXB0aCBvdmVycmlkZVxuICAgICAgICBtZXNoLmNvbG9yUHJvZ3JhbSA9IG1lc2gucHJvZ3JhbTtcblxuICAgICAgICAvLyBDaGVjayBpZiBkZXB0aCBwcm9ncmFtIGFscmVhZHkgYXR0YWNoZWRcbiAgICAgICAgaWYgKG1lc2guZGVwdGhQcm9ncmFtKSByZXR1cm47XG5cbiAgICAgICAgLy8gVXNlIGdsb2JhbCBkZXB0aCBvdmVycmlkZSBpZiBub3RoaW5nIGN1c3RvbSBwYXNzZWQgaW5cbiAgICAgICAgaWYgKHZlcnRleCA9PT0gZGVmYXVsdFZlcnRleCAmJiBmcmFnbWVudCA9PT0gZGVmYXVsdEZyYWdtZW50KSB7XG4gICAgICAgICAgICBtZXNoLmRlcHRoUHJvZ3JhbSA9IHRoaXMuZGVwdGhQcm9ncmFtO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ3JlYXRlIGN1c3RvbSBvdmVycmlkZSBwcm9ncmFtXG4gICAgICAgIG1lc2guZGVwdGhQcm9ncmFtID0gbmV3IFByb2dyYW0odGhpcy5nbCwge1xuICAgICAgICAgICAgdmVydGV4LFxuICAgICAgICAgICAgZnJhZ21lbnQsXG4gICAgICAgICAgICBjdWxsRmFjZTogbnVsbCxcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmVuZGVyKHsgc2NlbmUgfSkge1xuICAgICAgICAvLyBGb3IgZGVwdGggcmVuZGVyLCByZXBsYWNlIHByb2dyYW0gd2l0aCBkZXB0aCBvdmVycmlkZS5cbiAgICAgICAgLy8gSGlkZSBtZXNoZXMgbm90IGNhc3Rpbmcgc2hhZG93cy5cbiAgICAgICAgc2NlbmUudHJhdmVyc2UoKG5vZGUpID0+IHtcbiAgICAgICAgICAgIGlmICghbm9kZS5kcmF3KSByZXR1cm47XG4gICAgICAgICAgICBpZiAoISF+dGhpcy5jYXN0TWVzaGVzLmluZGV4T2Yobm9kZSkpIHtcbiAgICAgICAgICAgICAgICBub2RlLnByb2dyYW0gPSBub2RlLmRlcHRoUHJvZ3JhbTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbm9kZS5pc0ZvcmNlVmlzaWJpbGl0eSA9IG5vZGUudmlzaWJsZTtcbiAgICAgICAgICAgICAgICBub2RlLnZpc2libGUgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gUmVuZGVyIHRoZSBkZXB0aCBzaGFkb3cgbWFwIHVzaW5nIHRoZSBsaWdodCBhcyB0aGUgY2FtZXJhXG4gICAgICAgIHRoaXMuZ2wucmVuZGVyZXIucmVuZGVyKHtcbiAgICAgICAgICAgIHNjZW5lLFxuICAgICAgICAgICAgY2FtZXJhOiB0aGlzLmxpZ2h0LFxuICAgICAgICAgICAgdGFyZ2V0OiB0aGlzLnRhcmdldCxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gVGhlbiBzd2l0Y2ggdGhlIHByb2dyYW0gYmFjayB0byB0aGUgbm9ybWFsIG9uZVxuICAgICAgICBzY2VuZS50cmF2ZXJzZSgobm9kZSkgPT4ge1xuICAgICAgICAgICAgaWYgKCFub2RlLmRyYXcpIHJldHVybjtcbiAgICAgICAgICAgIGlmICghIX50aGlzLmNhc3RNZXNoZXMuaW5kZXhPZihub2RlKSkge1xuICAgICAgICAgICAgICAgIG5vZGUucHJvZ3JhbSA9IG5vZGUuY29sb3JQcm9ncmFtO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBub2RlLnZpc2libGUgPSBub2RlLmlzRm9yY2VWaXNpYmlsaXR5O1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG59XG5cbmNvbnN0IGRlZmF1bHRWZXJ0ZXggPSAvKiBnbHNsICovIGBcbiAgICBhdHRyaWJ1dGUgdmVjMyBwb3NpdGlvbjtcbiAgICBhdHRyaWJ1dGUgdmVjMiB1djtcblxuICAgIHVuaWZvcm0gbWF0NCBtb2RlbFZpZXdNYXRyaXg7XG4gICAgdW5pZm9ybSBtYXQ0IHByb2plY3Rpb25NYXRyaXg7XG5cbiAgICB2b2lkIG1haW4oKSB7XG4gICAgICAgIGdsX1Bvc2l0aW9uID0gcHJvamVjdGlvbk1hdHJpeCAqIG1vZGVsVmlld01hdHJpeCAqIHZlYzQocG9zaXRpb24sIDEuMCk7XG4gICAgfVxuYDtcblxuY29uc3QgZGVmYXVsdEZyYWdtZW50ID0gLyogZ2xzbCAqLyBgXG4gICAgcHJlY2lzaW9uIGhpZ2hwIGZsb2F0O1xuXG4gICAgdmVjNCBwYWNrUkdCQSAoZmxvYXQgdikge1xuICAgICAgICB2ZWM0IHBhY2sgPSBmcmFjdCh2ZWM0KDEuMCwgMjU1LjAsIDY1MDI1LjAsIDE2NTgxMzc1LjApICogdik7XG4gICAgICAgIHBhY2sgLT0gcGFjay55end3ICogdmVjMigxLjAgLyAyNTUuMCwgMC4wKS54eHh5O1xuICAgICAgICByZXR1cm4gcGFjaztcbiAgICB9XG5cbiAgICB2b2lkIG1haW4oKSB7XG4gICAgICAgIGdsX0ZyYWdDb2xvciA9IHBhY2tSR0JBKGdsX0ZyYWdDb29yZC56KTtcbiAgICB9XG5gO1xuIiwiaW1wb3J0IHsgTWVzaCB9IGZyb20gJy4uL2NvcmUvTWVzaC5qcyc7XG5pbXBvcnQgeyBUcmFuc2Zvcm0gfSBmcm9tICcuLi9jb3JlL1RyYW5zZm9ybS5qcyc7XG5pbXBvcnQgeyBNYXQ0IH0gZnJvbSAnLi4vbWF0aC9NYXQ0LmpzJztcbmltcG9ydCB7IFRleHR1cmUgfSBmcm9tICcuLi9jb3JlL1RleHR1cmUuanMnO1xuaW1wb3J0IHsgQW5pbWF0aW9uIH0gZnJvbSAnLi9BbmltYXRpb24uanMnO1xuXG5jb25zdCB0ZW1wTWF0NCA9IG5ldyBNYXQ0KCk7XG5cbmV4cG9ydCBjbGFzcyBTa2luIGV4dGVuZHMgTWVzaCB7XG4gICAgY29uc3RydWN0b3IoZ2wsIHsgcmlnLCBnZW9tZXRyeSwgcHJvZ3JhbSwgbW9kZSA9IGdsLlRSSUFOR0xFUyB9ID0ge30pIHtcbiAgICAgICAgc3VwZXIoZ2wsIHsgZ2VvbWV0cnksIHByb2dyYW0sIG1vZGUgfSk7XG5cbiAgICAgICAgdGhpcy5jcmVhdGVCb25lcyhyaWcpO1xuICAgICAgICB0aGlzLmNyZWF0ZUJvbmVUZXh0dXJlKCk7XG4gICAgICAgIHRoaXMuYW5pbWF0aW9ucyA9IFtdO1xuXG4gICAgICAgIE9iamVjdC5hc3NpZ24odGhpcy5wcm9ncmFtLnVuaWZvcm1zLCB7XG4gICAgICAgICAgICBib25lVGV4dHVyZTogeyB2YWx1ZTogdGhpcy5ib25lVGV4dHVyZSB9LFxuICAgICAgICAgICAgYm9uZVRleHR1cmVTaXplOiB7IHZhbHVlOiB0aGlzLmJvbmVUZXh0dXJlU2l6ZSB9LFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBjcmVhdGVCb25lcyhyaWcpIHtcbiAgICAgICAgLy8gQ3JlYXRlIHJvb3Qgc28gdGhhdCBjYW4gc2ltcGx5IHVwZGF0ZSB3b3JsZCBtYXRyaXggb2Ygd2hvbGUgc2tlbGV0b25cbiAgICAgICAgdGhpcy5yb290ID0gbmV3IFRyYW5zZm9ybSgpO1xuXG4gICAgICAgIC8vIENyZWF0ZSBib25lc1xuICAgICAgICB0aGlzLmJvbmVzID0gW107XG4gICAgICAgIGlmICghcmlnLmJvbmVzIHx8ICFyaWcuYm9uZXMubGVuZ3RoKSByZXR1cm47XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcmlnLmJvbmVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBib25lID0gbmV3IFRyYW5zZm9ybSgpO1xuXG4gICAgICAgICAgICAvLyBTZXQgaW5pdGlhbCB2YWx1ZXMgKGJpbmQgcG9zZSlcbiAgICAgICAgICAgIGJvbmUucG9zaXRpb24uZnJvbUFycmF5KHJpZy5iaW5kUG9zZS5wb3NpdGlvbiwgaSAqIDMpO1xuICAgICAgICAgICAgYm9uZS5xdWF0ZXJuaW9uLmZyb21BcnJheShyaWcuYmluZFBvc2UucXVhdGVybmlvbiwgaSAqIDQpO1xuICAgICAgICAgICAgYm9uZS5zY2FsZS5mcm9tQXJyYXkocmlnLmJpbmRQb3NlLnNjYWxlLCBpICogMyk7XG5cbiAgICAgICAgICAgIHRoaXMuYm9uZXMucHVzaChib25lKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIE9uY2UgY3JlYXRlZCwgc2V0IHRoZSBoaWVyYXJjaHlcbiAgICAgICAgcmlnLmJvbmVzLmZvckVhY2goKGRhdGEsIGkpID0+IHtcbiAgICAgICAgICAgIHRoaXMuYm9uZXNbaV0ubmFtZSA9IGRhdGEubmFtZTtcbiAgICAgICAgICAgIGlmIChkYXRhLnBhcmVudCA9PT0gLTEpIHJldHVybiB0aGlzLmJvbmVzW2ldLnNldFBhcmVudCh0aGlzLnJvb3QpO1xuICAgICAgICAgICAgdGhpcy5ib25lc1tpXS5zZXRQYXJlbnQodGhpcy5ib25lc1tkYXRhLnBhcmVudF0pO1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyBUaGVuIHVwZGF0ZSB0byBjYWxjdWxhdGUgd29ybGQgbWF0cmljZXNcbiAgICAgICAgdGhpcy5yb290LnVwZGF0ZU1hdHJpeFdvcmxkKHRydWUpO1xuXG4gICAgICAgIC8vIFN0b3JlIGludmVyc2Ugb2YgYmluZCBwb3NlIHRvIGNhbGN1bGF0ZSBkaWZmZXJlbmNlc1xuICAgICAgICB0aGlzLmJvbmVzLmZvckVhY2goKGJvbmUpID0+IHtcbiAgICAgICAgICAgIGJvbmUuYmluZEludmVyc2UgPSBuZXcgTWF0NCguLi5ib25lLndvcmxkTWF0cml4KS5pbnZlcnNlKCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGNyZWF0ZUJvbmVUZXh0dXJlKCkge1xuICAgICAgICBpZiAoIXRoaXMuYm9uZXMubGVuZ3RoKSByZXR1cm47XG4gICAgICAgIGNvbnN0IHNpemUgPSBNYXRoLm1heCg0LCBNYXRoLnBvdygyLCBNYXRoLmNlaWwoTWF0aC5sb2coTWF0aC5zcXJ0KHRoaXMuYm9uZXMubGVuZ3RoICogNCkpIC8gTWF0aC5MTjIpKSk7XG4gICAgICAgIHRoaXMuYm9uZU1hdHJpY2VzID0gbmV3IEZsb2F0MzJBcnJheShzaXplICogc2l6ZSAqIDQpO1xuICAgICAgICB0aGlzLmJvbmVUZXh0dXJlU2l6ZSA9IHNpemU7XG4gICAgICAgIHRoaXMuYm9uZVRleHR1cmUgPSBuZXcgVGV4dHVyZSh0aGlzLmdsLCB7XG4gICAgICAgICAgICBpbWFnZTogdGhpcy5ib25lTWF0cmljZXMsXG4gICAgICAgICAgICBnZW5lcmF0ZU1pcG1hcHM6IGZhbHNlLFxuICAgICAgICAgICAgdHlwZTogdGhpcy5nbC5GTE9BVCxcbiAgICAgICAgICAgIGludGVybmFsRm9ybWF0OiB0aGlzLmdsLnJlbmRlcmVyLmlzV2ViZ2wyID8gdGhpcy5nbC5SR0JBMzJGIDogdGhpcy5nbC5SR0JBLFxuICAgICAgICAgICAgbWluRmlsdGVyOiB0aGlzLmdsLk5FQVJFU1QsXG4gICAgICAgICAgICBtYWdGaWx0ZXI6IHRoaXMuZ2wuTkVBUkVTVCxcbiAgICAgICAgICAgIGZsaXBZOiBmYWxzZSxcbiAgICAgICAgICAgIHdpZHRoOiBzaXplLFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBhZGRBbmltYXRpb24oZGF0YSkge1xuICAgICAgICBjb25zdCBhbmltYXRpb24gPSBuZXcgQW5pbWF0aW9uKHsgb2JqZWN0czogdGhpcy5ib25lcywgZGF0YSB9KTtcbiAgICAgICAgdGhpcy5hbmltYXRpb25zLnB1c2goYW5pbWF0aW9uKTtcbiAgICAgICAgcmV0dXJuIGFuaW1hdGlvbjtcbiAgICB9XG5cbiAgICB1cGRhdGUoKSB7XG4gICAgICAgIC8vIENhbGN1bGF0ZSBjb21iaW5lZCBhbmltYXRpb24gd2VpZ2h0XG4gICAgICAgIGxldCB0b3RhbCA9IDA7XG4gICAgICAgIHRoaXMuYW5pbWF0aW9ucy5mb3JFYWNoKChhbmltYXRpb24pID0+ICh0b3RhbCArPSBhbmltYXRpb24ud2VpZ2h0KSk7XG5cbiAgICAgICAgdGhpcy5hbmltYXRpb25zLmZvckVhY2goKGFuaW1hdGlvbiwgaSkgPT4ge1xuICAgICAgICAgICAgLy8gZm9yY2UgZmlyc3QgYW5pbWF0aW9uIHRvIHNldCBpbiBvcmRlciB0byByZXNldCBmcmFtZVxuICAgICAgICAgICAgYW5pbWF0aW9uLnVwZGF0ZSh0b3RhbCwgaSA9PT0gMCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGRyYXcoeyBjYW1lcmEgfSA9IHt9KSB7XG4gICAgICAgIC8vIFVwZGF0ZSB3b3JsZCBtYXRyaWNlcyBtYW51YWxseSwgYXMgbm90IHBhcnQgb2Ygc2NlbmUgZ3JhcGhcbiAgICAgICAgdGhpcy5yb290LnVwZGF0ZU1hdHJpeFdvcmxkKHRydWUpO1xuXG4gICAgICAgIC8vIFVwZGF0ZSBib25lIHRleHR1cmVcbiAgICAgICAgdGhpcy5ib25lcy5mb3JFYWNoKChib25lLCBpKSA9PiB7XG4gICAgICAgICAgICAvLyBGaW5kIGRpZmZlcmVuY2UgYmV0d2VlbiBjdXJyZW50IGFuZCBiaW5kIHBvc2VcbiAgICAgICAgICAgIHRlbXBNYXQ0Lm11bHRpcGx5KGJvbmUud29ybGRNYXRyaXgsIGJvbmUuYmluZEludmVyc2UpO1xuICAgICAgICAgICAgdGhpcy5ib25lTWF0cmljZXMuc2V0KHRlbXBNYXQ0LCBpICogMTYpO1xuICAgICAgICB9KTtcbiAgICAgICAgaWYgKHRoaXMuYm9uZVRleHR1cmUpIHRoaXMuYm9uZVRleHR1cmUubmVlZHNVcGRhdGUgPSB0cnVlO1xuXG4gICAgICAgIHN1cGVyLmRyYXcoeyBjYW1lcmEgfSk7XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgR2VvbWV0cnkgfSBmcm9tICcuLi9jb3JlL0dlb21ldHJ5LmpzJztcbmltcG9ydCB7IFZlYzMgfSBmcm9tICcuLi9tYXRoL1ZlYzMuanMnO1xuXG5leHBvcnQgY2xhc3MgU3BoZXJlIGV4dGVuZHMgR2VvbWV0cnkge1xuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICBnbCxcbiAgICAgICAge1xuICAgICAgICAgICAgcmFkaXVzID0gMC41LFxuICAgICAgICAgICAgd2lkdGhTZWdtZW50cyA9IDE2LFxuICAgICAgICAgICAgaGVpZ2h0U2VnbWVudHMgPSBNYXRoLmNlaWwod2lkdGhTZWdtZW50cyAqIDAuNSksXG4gICAgICAgICAgICBwaGlTdGFydCA9IDAsXG4gICAgICAgICAgICBwaGlMZW5ndGggPSBNYXRoLlBJICogMixcbiAgICAgICAgICAgIHRoZXRhU3RhcnQgPSAwLFxuICAgICAgICAgICAgdGhldGFMZW5ndGggPSBNYXRoLlBJLFxuICAgICAgICAgICAgYXR0cmlidXRlcyA9IHt9LFxuICAgICAgICB9ID0ge31cbiAgICApIHtcbiAgICAgICAgY29uc3Qgd1NlZ3MgPSB3aWR0aFNlZ21lbnRzO1xuICAgICAgICBjb25zdCBoU2VncyA9IGhlaWdodFNlZ21lbnRzO1xuICAgICAgICBjb25zdCBwU3RhcnQgPSBwaGlTdGFydDtcbiAgICAgICAgY29uc3QgcExlbmd0aCA9IHBoaUxlbmd0aDtcbiAgICAgICAgY29uc3QgdFN0YXJ0ID0gdGhldGFTdGFydDtcbiAgICAgICAgY29uc3QgdExlbmd0aCA9IHRoZXRhTGVuZ3RoO1xuXG4gICAgICAgIGNvbnN0IG51bSA9ICh3U2VncyArIDEpICogKGhTZWdzICsgMSk7XG4gICAgICAgIGNvbnN0IG51bUluZGljZXMgPSB3U2VncyAqIGhTZWdzICogNjtcblxuICAgICAgICBjb25zdCBwb3NpdGlvbiA9IG5ldyBGbG9hdDMyQXJyYXkobnVtICogMyk7XG4gICAgICAgIGNvbnN0IG5vcm1hbCA9IG5ldyBGbG9hdDMyQXJyYXkobnVtICogMyk7XG4gICAgICAgIGNvbnN0IHV2ID0gbmV3IEZsb2F0MzJBcnJheShudW0gKiAyKTtcbiAgICAgICAgY29uc3QgaW5kZXggPSBudW0gPiA2NTUzNiA/IG5ldyBVaW50MzJBcnJheShudW1JbmRpY2VzKSA6IG5ldyBVaW50MTZBcnJheShudW1JbmRpY2VzKTtcblxuICAgICAgICBsZXQgaSA9IDA7XG4gICAgICAgIGxldCBpdiA9IDA7XG4gICAgICAgIGxldCBpaSA9IDA7XG4gICAgICAgIGxldCB0ZSA9IHRTdGFydCArIHRMZW5ndGg7XG4gICAgICAgIGNvbnN0IGdyaWQgPSBbXTtcblxuICAgICAgICBsZXQgbiA9IG5ldyBWZWMzKCk7XG5cbiAgICAgICAgZm9yIChsZXQgaXkgPSAwOyBpeSA8PSBoU2VnczsgaXkrKykge1xuICAgICAgICAgICAgbGV0IHZSb3cgPSBbXTtcbiAgICAgICAgICAgIGxldCB2ID0gaXkgLyBoU2VncztcbiAgICAgICAgICAgIGZvciAobGV0IGl4ID0gMDsgaXggPD0gd1NlZ3M7IGl4KyssIGkrKykge1xuICAgICAgICAgICAgICAgIGxldCB1ID0gaXggLyB3U2VncztcbiAgICAgICAgICAgICAgICBsZXQgeCA9IC1yYWRpdXMgKiBNYXRoLmNvcyhwU3RhcnQgKyB1ICogcExlbmd0aCkgKiBNYXRoLnNpbih0U3RhcnQgKyB2ICogdExlbmd0aCk7XG4gICAgICAgICAgICAgICAgbGV0IHkgPSByYWRpdXMgKiBNYXRoLmNvcyh0U3RhcnQgKyB2ICogdExlbmd0aCk7XG4gICAgICAgICAgICAgICAgbGV0IHogPSByYWRpdXMgKiBNYXRoLnNpbihwU3RhcnQgKyB1ICogcExlbmd0aCkgKiBNYXRoLnNpbih0U3RhcnQgKyB2ICogdExlbmd0aCk7XG5cbiAgICAgICAgICAgICAgICBwb3NpdGlvbltpICogM10gPSB4O1xuICAgICAgICAgICAgICAgIHBvc2l0aW9uW2kgKiAzICsgMV0gPSB5O1xuICAgICAgICAgICAgICAgIHBvc2l0aW9uW2kgKiAzICsgMl0gPSB6O1xuXG4gICAgICAgICAgICAgICAgbi5zZXQoeCwgeSwgeikubm9ybWFsaXplKCk7XG4gICAgICAgICAgICAgICAgbm9ybWFsW2kgKiAzXSA9IG4ueDtcbiAgICAgICAgICAgICAgICBub3JtYWxbaSAqIDMgKyAxXSA9IG4ueTtcbiAgICAgICAgICAgICAgICBub3JtYWxbaSAqIDMgKyAyXSA9IG4uejtcblxuICAgICAgICAgICAgICAgIHV2W2kgKiAyXSA9IHU7XG4gICAgICAgICAgICAgICAgdXZbaSAqIDIgKyAxXSA9IDEgLSB2O1xuXG4gICAgICAgICAgICAgICAgdlJvdy5wdXNoKGl2KyspO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBncmlkLnB1c2godlJvdyk7XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKGxldCBpeSA9IDA7IGl5IDwgaFNlZ3M7IGl5KyspIHtcbiAgICAgICAgICAgIGZvciAobGV0IGl4ID0gMDsgaXggPCB3U2VnczsgaXgrKykge1xuICAgICAgICAgICAgICAgIGxldCBhID0gZ3JpZFtpeV1baXggKyAxXTtcbiAgICAgICAgICAgICAgICBsZXQgYiA9IGdyaWRbaXldW2l4XTtcbiAgICAgICAgICAgICAgICBsZXQgYyA9IGdyaWRbaXkgKyAxXVtpeF07XG4gICAgICAgICAgICAgICAgbGV0IGQgPSBncmlkW2l5ICsgMV1baXggKyAxXTtcblxuICAgICAgICAgICAgICAgIGlmIChpeSAhPT0gMCB8fCB0U3RhcnQgPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGluZGV4W2lpICogM10gPSBhO1xuICAgICAgICAgICAgICAgICAgICBpbmRleFtpaSAqIDMgKyAxXSA9IGI7XG4gICAgICAgICAgICAgICAgICAgIGluZGV4W2lpICogMyArIDJdID0gZDtcbiAgICAgICAgICAgICAgICAgICAgaWkrKztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGl5ICE9PSBoU2VncyAtIDEgfHwgdGUgPCBNYXRoLlBJKSB7XG4gICAgICAgICAgICAgICAgICAgIGluZGV4W2lpICogM10gPSBiO1xuICAgICAgICAgICAgICAgICAgICBpbmRleFtpaSAqIDMgKyAxXSA9IGM7XG4gICAgICAgICAgICAgICAgICAgIGluZGV4W2lpICogMyArIDJdID0gZDtcbiAgICAgICAgICAgICAgICAgICAgaWkrKztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBPYmplY3QuYXNzaWduKGF0dHJpYnV0ZXMsIHtcbiAgICAgICAgICAgIHBvc2l0aW9uOiB7IHNpemU6IDMsIGRhdGE6IHBvc2l0aW9uIH0sXG4gICAgICAgICAgICBub3JtYWw6IHsgc2l6ZTogMywgZGF0YTogbm9ybWFsIH0sXG4gICAgICAgICAgICB1djogeyBzaXplOiAyLCBkYXRhOiB1diB9LFxuICAgICAgICAgICAgaW5kZXg6IHsgZGF0YTogaW5kZXggfSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgc3VwZXIoZ2wsIGF0dHJpYnV0ZXMpO1xuICAgIH1cbn1cbiIsImV4cG9ydCBmdW5jdGlvbiBUZXh0KHtcbiAgICBmb250LFxuICAgIHRleHQsXG4gICAgd2lkdGggPSBJbmZpbml0eSxcbiAgICBhbGlnbiA9ICdsZWZ0JyxcbiAgICBzaXplID0gMSxcbiAgICBsZXR0ZXJTcGFjaW5nID0gMCxcbiAgICBsaW5lSGVpZ2h0ID0gMS40LFxuICAgIHdvcmRTcGFjaW5nID0gMCxcbiAgICB3b3JkQnJlYWsgPSBmYWxzZSxcbn0pIHtcbiAgICBjb25zdCBfdGhpcyA9IHRoaXM7XG4gICAgbGV0IGdseXBocywgYnVmZmVycztcbiAgICBsZXQgZm9udEhlaWdodCwgYmFzZWxpbmUsIHNjYWxlO1xuXG4gICAgY29uc3QgbmV3bGluZSA9IC9cXG4vO1xuICAgIGNvbnN0IHdoaXRlc3BhY2UgPSAvXFxzLztcblxuICAgIHtcbiAgICAgICAgcGFyc2VGb250KCk7XG4gICAgICAgIGNyZWF0ZUdlb21ldHJ5KCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcGFyc2VGb250KCkge1xuICAgICAgICBnbHlwaHMgPSB7fTtcbiAgICAgICAgZm9udC5jaGFycy5mb3JFYWNoKChkKSA9PiAoZ2x5cGhzW2QuY2hhcl0gPSBkKSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY3JlYXRlR2VvbWV0cnkoKSB7XG4gICAgICAgIGZvbnRIZWlnaHQgPSBmb250LmNvbW1vbi5saW5lSGVpZ2h0O1xuICAgICAgICBiYXNlbGluZSA9IGZvbnQuY29tbW9uLmJhc2U7XG5cbiAgICAgICAgLy8gVXNlIGJhc2VsaW5lIHNvIHRoYXQgYWN0dWFsIHRleHQgaGVpZ2h0IGlzIGFzIGNsb3NlIHRvICdzaXplJyB2YWx1ZSBhcyBwb3NzaWJsZVxuICAgICAgICBzY2FsZSA9IHNpemUgLyBiYXNlbGluZTtcblxuICAgICAgICAvLyBTdHJpcCBzcGFjZXMgYW5kIG5ld2xpbmVzIHRvIGdldCBhY3R1YWwgY2hhcmFjdGVyIGxlbmd0aCBmb3IgYnVmZmVyc1xuICAgICAgICBsZXQgY2hhcnMgPSB0ZXh0LnJlcGxhY2UoL1sgXFxuXS9nLCAnJyk7XG4gICAgICAgIGxldCBudW1DaGFycyA9IGNoYXJzLmxlbmd0aDtcblxuICAgICAgICAvLyBDcmVhdGUgb3V0cHV0IGJ1ZmZlcnNcbiAgICAgICAgYnVmZmVycyA9IHtcbiAgICAgICAgICAgIHBvc2l0aW9uOiBuZXcgRmxvYXQzMkFycmF5KG51bUNoYXJzICogNCAqIDMpLFxuICAgICAgICAgICAgdXY6IG5ldyBGbG9hdDMyQXJyYXkobnVtQ2hhcnMgKiA0ICogMiksXG4gICAgICAgICAgICBpZDogbmV3IEZsb2F0MzJBcnJheShudW1DaGFycyAqIDQpLFxuICAgICAgICAgICAgaW5kZXg6IG5ldyBVaW50MTZBcnJheShudW1DaGFycyAqIDYpLFxuICAgICAgICB9O1xuXG4gICAgICAgIC8vIFNldCB2YWx1ZXMgZm9yIGJ1ZmZlcnMgdGhhdCBkb24ndCByZXF1aXJlIGNhbGN1bGF0aW9uXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbnVtQ2hhcnM7IGkrKykge1xuICAgICAgICAgICAgYnVmZmVycy5pZFtpXSA9IGk7XG4gICAgICAgICAgICBidWZmZXJzLmluZGV4LnNldChbaSAqIDQsIGkgKiA0ICsgMiwgaSAqIDQgKyAxLCBpICogNCArIDEsIGkgKiA0ICsgMiwgaSAqIDQgKyAzXSwgaSAqIDYpO1xuICAgICAgICB9XG5cbiAgICAgICAgbGF5b3V0KCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbGF5b3V0KCkge1xuICAgICAgICBjb25zdCBsaW5lcyA9IFtdO1xuXG4gICAgICAgIGxldCBjdXJzb3IgPSAwO1xuXG4gICAgICAgIGxldCB3b3JkQ3Vyc29yID0gMDtcbiAgICAgICAgbGV0IHdvcmRXaWR0aCA9IDA7XG4gICAgICAgIGxldCBsaW5lID0gbmV3TGluZSgpO1xuXG4gICAgICAgIGZ1bmN0aW9uIG5ld0xpbmUoKSB7XG4gICAgICAgICAgICBjb25zdCBsaW5lID0ge1xuICAgICAgICAgICAgICAgIHdpZHRoOiAwLFxuICAgICAgICAgICAgICAgIGdseXBoczogW10sXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgbGluZXMucHVzaChsaW5lKTtcbiAgICAgICAgICAgIHdvcmRDdXJzb3IgPSBjdXJzb3I7XG4gICAgICAgICAgICB3b3JkV2lkdGggPSAwO1xuICAgICAgICAgICAgcmV0dXJuIGxpbmU7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgbWF4VGltZXMgPSAxMDA7XG4gICAgICAgIGxldCBjb3VudCA9IDA7XG4gICAgICAgIHdoaWxlIChjdXJzb3IgPCB0ZXh0Lmxlbmd0aCAmJiBjb3VudCA8IG1heFRpbWVzKSB7XG4gICAgICAgICAgICBjb3VudCsrO1xuXG4gICAgICAgICAgICBjb25zdCBjaGFyID0gdGV4dFtjdXJzb3JdO1xuXG4gICAgICAgICAgICAvLyBTa2lwIHdoaXRlc3BhY2UgYXQgc3RhcnQgb2YgbGluZVxuICAgICAgICAgICAgaWYgKCFsaW5lLndpZHRoICYmIHdoaXRlc3BhY2UudGVzdChjaGFyKSkge1xuICAgICAgICAgICAgICAgIGN1cnNvcisrO1xuICAgICAgICAgICAgICAgIHdvcmRDdXJzb3IgPSBjdXJzb3I7XG4gICAgICAgICAgICAgICAgd29yZFdpZHRoID0gMDtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gSWYgbmV3bGluZSBjaGFyLCBza2lwIHRvIG5leHQgbGluZVxuICAgICAgICAgICAgaWYgKG5ld2xpbmUudGVzdChjaGFyKSkge1xuICAgICAgICAgICAgICAgIGN1cnNvcisrO1xuICAgICAgICAgICAgICAgIGxpbmUgPSBuZXdMaW5lKCk7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IGdseXBoID0gZ2x5cGhzW2NoYXJdIHx8IGdseXBoc1snICddO1xuXG4gICAgICAgICAgICAvLyBGaW5kIGFueSBhcHBsaWNhYmxlIGtlcm4gcGFpcnNcbiAgICAgICAgICAgIGlmIChsaW5lLmdseXBocy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBwcmV2R2x5cGggPSBsaW5lLmdseXBoc1tsaW5lLmdseXBocy5sZW5ndGggLSAxXVswXTtcbiAgICAgICAgICAgICAgICBsZXQga2VybiA9IGdldEtlcm5QYWlyT2Zmc2V0KGdseXBoLmlkLCBwcmV2R2x5cGguaWQpICogc2NhbGU7XG4gICAgICAgICAgICAgICAgbGluZS53aWR0aCArPSBrZXJuO1xuICAgICAgICAgICAgICAgIHdvcmRXaWR0aCArPSBrZXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBhZGQgY2hhciB0byBsaW5lXG4gICAgICAgICAgICBsaW5lLmdseXBocy5wdXNoKFtnbHlwaCwgbGluZS53aWR0aF0pO1xuXG4gICAgICAgICAgICAvLyBjYWxjdWxhdGUgYWR2YW5jZSBmb3IgbmV4dCBnbHlwaFxuICAgICAgICAgICAgbGV0IGFkdmFuY2UgPSAwO1xuXG4gICAgICAgICAgICAvLyBJZiB3aGl0ZXNwYWNlLCB1cGRhdGUgbG9jYXRpb24gb2YgY3VycmVudCB3b3JkIGZvciBsaW5lIGJyZWFrc1xuICAgICAgICAgICAgaWYgKHdoaXRlc3BhY2UudGVzdChjaGFyKSkge1xuICAgICAgICAgICAgICAgIHdvcmRDdXJzb3IgPSBjdXJzb3I7XG4gICAgICAgICAgICAgICAgd29yZFdpZHRoID0gMDtcblxuICAgICAgICAgICAgICAgIC8vIEFkZCB3b3Jkc3BhY2luZ1xuICAgICAgICAgICAgICAgIGFkdmFuY2UgKz0gd29yZFNwYWNpbmcgKiBzaXplO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBBZGQgbGV0dGVyc3BhY2luZ1xuICAgICAgICAgICAgICAgIGFkdmFuY2UgKz0gbGV0dGVyU3BhY2luZyAqIHNpemU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGFkdmFuY2UgKz0gZ2x5cGgueGFkdmFuY2UgKiBzY2FsZTtcblxuICAgICAgICAgICAgbGluZS53aWR0aCArPSBhZHZhbmNlO1xuICAgICAgICAgICAgd29yZFdpZHRoICs9IGFkdmFuY2U7XG5cbiAgICAgICAgICAgIC8vIElmIHdpZHRoIGRlZmluZWRcbiAgICAgICAgICAgIGlmIChsaW5lLndpZHRoID4gd2lkdGgpIHtcbiAgICAgICAgICAgICAgICAvLyBJZiBjYW4gYnJlYWsgd29yZHMsIHVuZG8gbGF0ZXN0IGdseXBoIGlmIGxpbmUgbm90IGVtcHR5IGFuZCBjcmVhdGUgbmV3IGxpbmVcbiAgICAgICAgICAgICAgICBpZiAod29yZEJyZWFrICYmIGxpbmUuZ2x5cGhzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgbGluZS53aWR0aCAtPSBhZHZhbmNlO1xuICAgICAgICAgICAgICAgICAgICBsaW5lLmdseXBocy5wb3AoKTtcbiAgICAgICAgICAgICAgICAgICAgbGluZSA9IG5ld0xpbmUoKTtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gSWYgbm90IGZpcnN0IHdvcmQsIHVuZG8gY3VycmVudCB3b3JkIGFuZCBjdXJzb3IgYW5kIGNyZWF0ZSBuZXcgbGluZVxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoIXdvcmRCcmVhayAmJiB3b3JkV2lkdGggIT09IGxpbmUud2lkdGgpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IG51bUdseXBocyA9IGN1cnNvciAtIHdvcmRDdXJzb3IgKyAxO1xuICAgICAgICAgICAgICAgICAgICBsaW5lLmdseXBocy5zcGxpY2UoLW51bUdseXBocywgbnVtR2x5cGhzKTtcbiAgICAgICAgICAgICAgICAgICAgY3Vyc29yID0gd29yZEN1cnNvcjtcbiAgICAgICAgICAgICAgICAgICAgbGluZS53aWR0aCAtPSB3b3JkV2lkdGg7XG4gICAgICAgICAgICAgICAgICAgIGxpbmUgPSBuZXdMaW5lKCk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY3Vyc29yKys7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBSZW1vdmUgbGFzdCBsaW5lIGlmIGVtcHR5XG4gICAgICAgIGlmICghbGluZS53aWR0aCkgbGluZXMucG9wKCk7XG5cbiAgICAgICAgcG9wdWxhdGVCdWZmZXJzKGxpbmVzKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwb3B1bGF0ZUJ1ZmZlcnMobGluZXMpIHtcbiAgICAgICAgY29uc3QgdGV4VyA9IGZvbnQuY29tbW9uLnNjYWxlVztcbiAgICAgICAgY29uc3QgdGV4SCA9IGZvbnQuY29tbW9uLnNjYWxlSDtcblxuICAgICAgICAvLyBGb3IgYWxsIGZvbnRzIHRlc3RlZCwgYSBsaXR0bGUgb2Zmc2V0IHdhcyBuZWVkZWQgdG8gYmUgcmlnaHQgb24gdGhlIGJhc2VsaW5lLCBoZW5jZSAwLjA3LlxuICAgICAgICBsZXQgeSA9IDAuMDcgKiBzaXplO1xuICAgICAgICBsZXQgaiA9IDA7XG5cbiAgICAgICAgZm9yIChsZXQgbGluZUluZGV4ID0gMDsgbGluZUluZGV4IDwgbGluZXMubGVuZ3RoOyBsaW5lSW5kZXgrKykge1xuICAgICAgICAgICAgbGV0IGxpbmUgPSBsaW5lc1tsaW5lSW5kZXhdO1xuXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxpbmUuZ2x5cGhzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZ2x5cGggPSBsaW5lLmdseXBoc1tpXVswXTtcbiAgICAgICAgICAgICAgICBsZXQgeCA9IGxpbmUuZ2x5cGhzW2ldWzFdO1xuXG4gICAgICAgICAgICAgICAgaWYgKGFsaWduID09PSAnY2VudGVyJykge1xuICAgICAgICAgICAgICAgICAgICB4IC09IGxpbmUud2lkdGggKiAwLjU7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChhbGlnbiA9PT0gJ3JpZ2h0Jykge1xuICAgICAgICAgICAgICAgICAgICB4IC09IGxpbmUud2lkdGg7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gSWYgc3BhY2UsIGRvbid0IGFkZCB0byBnZW9tZXRyeVxuICAgICAgICAgICAgICAgIGlmICh3aGl0ZXNwYWNlLnRlc3QoZ2x5cGguY2hhcikpIGNvbnRpbnVlO1xuXG4gICAgICAgICAgICAgICAgLy8gQXBwbHkgY2hhciBzcHJpdGUgb2Zmc2V0c1xuICAgICAgICAgICAgICAgIHggKz0gZ2x5cGgueG9mZnNldCAqIHNjYWxlO1xuICAgICAgICAgICAgICAgIHkgLT0gZ2x5cGgueW9mZnNldCAqIHNjYWxlO1xuXG4gICAgICAgICAgICAgICAgLy8gZWFjaCBsZXR0ZXIgaXMgYSBxdWFkLiBheGlzIGJvdHRvbSBsZWZ0XG4gICAgICAgICAgICAgICAgbGV0IHcgPSBnbHlwaC53aWR0aCAqIHNjYWxlO1xuICAgICAgICAgICAgICAgIGxldCBoID0gZ2x5cGguaGVpZ2h0ICogc2NhbGU7XG4gICAgICAgICAgICAgICAgYnVmZmVycy5wb3NpdGlvbi5zZXQoW3gsIHkgLSBoLCAwLCB4LCB5LCAwLCB4ICsgdywgeSAtIGgsIDAsIHggKyB3LCB5LCAwXSwgaiAqIDQgKiAzKTtcblxuICAgICAgICAgICAgICAgIGxldCB1ID0gZ2x5cGgueCAvIHRleFc7XG4gICAgICAgICAgICAgICAgbGV0IHV3ID0gZ2x5cGgud2lkdGggLyB0ZXhXO1xuICAgICAgICAgICAgICAgIGxldCB2ID0gMS4wIC0gZ2x5cGgueSAvIHRleEg7XG4gICAgICAgICAgICAgICAgbGV0IHZoID0gZ2x5cGguaGVpZ2h0IC8gdGV4SDtcbiAgICAgICAgICAgICAgICBidWZmZXJzLnV2LnNldChbdSwgdiAtIHZoLCB1LCB2LCB1ICsgdXcsIHYgLSB2aCwgdSArIHV3LCB2XSwgaiAqIDQgKiAyKTtcblxuICAgICAgICAgICAgICAgIC8vIFJlc2V0IGN1cnNvciB0byBiYXNlbGluZVxuICAgICAgICAgICAgICAgIHkgKz0gZ2x5cGgueW9mZnNldCAqIHNjYWxlO1xuXG4gICAgICAgICAgICAgICAgaisrO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB5IC09IHNpemUgKiBsaW5lSGVpZ2h0O1xuICAgICAgICB9XG5cbiAgICAgICAgX3RoaXMuYnVmZmVycyA9IGJ1ZmZlcnM7XG4gICAgICAgIF90aGlzLm51bUxpbmVzID0gbGluZXMubGVuZ3RoO1xuICAgICAgICBfdGhpcy5oZWlnaHQgPSBfdGhpcy5udW1MaW5lcyAqIHNpemUgKiBsaW5lSGVpZ2h0O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdldEtlcm5QYWlyT2Zmc2V0KGlkMSwgaWQyKSB7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZm9udC5rZXJuaW5ncy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgbGV0IGsgPSBmb250Lmtlcm5pbmdzW2ldO1xuICAgICAgICAgICAgaWYgKGsuZmlyc3QgPCBpZDEpIGNvbnRpbnVlO1xuICAgICAgICAgICAgaWYgKGsuc2Vjb25kIDwgaWQyKSBjb250aW51ZTtcbiAgICAgICAgICAgIGlmIChrLmZpcnN0ID4gaWQxKSByZXR1cm4gMDtcbiAgICAgICAgICAgIGlmIChrLmZpcnN0ID09PSBpZDEgJiYgay5zZWNvbmQgPiBpZDIpIHJldHVybiAwO1xuICAgICAgICAgICAgcmV0dXJuIGsuYW1vdW50O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAwO1xuICAgIH1cblxuICAgIC8vIFVwZGF0ZSBidWZmZXJzIHRvIGxheW91dCB3aXRoIG5ldyBsYXlvdXRcbiAgICB0aGlzLnJlc2l6ZSA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gICAgICAgICh7IHdpZHRoIH0gPSBvcHRpb25zKTtcbiAgICAgICAgbGF5b3V0KCk7XG4gICAgfTtcblxuICAgIC8vIENvbXBsZXRlbHkgY2hhbmdlIHRleHQgKGxpa2UgY3JlYXRpbmcgbmV3IFRleHQpXG4gICAgdGhpcy51cGRhdGUgPSBmdW5jdGlvbiAob3B0aW9ucykge1xuICAgICAgICAoeyB0ZXh0IH0gPSBvcHRpb25zKTtcbiAgICAgICAgY3JlYXRlR2VvbWV0cnkoKTtcbiAgICB9O1xufVxuIiwiaW1wb3J0IHsgVGV4dHVyZSB9IGZyb20gJy4uL2NvcmUvVGV4dHVyZS5qcyc7XG5pbXBvcnQgeyBLVFhUZXh0dXJlIH0gZnJvbSAnLi9LVFhUZXh0dXJlLmpzJztcblxuLy8gRm9yIGNvbXByZXNzZWQgdGV4dHVyZXMsIGdlbmVyYXRlIHVzaW5nIGh0dHBzOi8vZ2l0aHViLmNvbS9UaW12YW5TY2hlcnBlbnplZWwvdGV4dHVyZS1jb21wcmVzc29yXG5cbmxldCBjYWNoZSA9IHt9O1xuY29uc3Qgc3VwcG9ydGVkRXh0ZW5zaW9ucyA9IFtdO1xuXG5leHBvcnQgY2xhc3MgVGV4dHVyZUxvYWRlciB7XG4gICAgc3RhdGljIGxvYWQoXG4gICAgICAgIGdsLFxuICAgICAgICB7XG4gICAgICAgICAgICBzcmMsIC8vIHN0cmluZyBvciBvYmplY3Qgb2YgZXh0ZW5zaW9uOnNyYyBrZXktdmFsdWVzXG4gICAgICAgICAgICAvLyB7XG4gICAgICAgICAgICAvLyAgICAgcHZydGM6ICcuLi5rdHgnLFxuICAgICAgICAgICAgLy8gICAgIHMzdGM6ICcuLi5rdHgnLFxuICAgICAgICAgICAgLy8gICAgIGV0YzogJy4uLmt0eCcsXG4gICAgICAgICAgICAvLyAgICAgZXRjMTogJy4uLmt0eCcsXG4gICAgICAgICAgICAvLyAgICAgYXN0YzogJy4uLmt0eCcsXG4gICAgICAgICAgICAvLyAgICAgd2VicDogJy4uLndlYnAnLFxuICAgICAgICAgICAgLy8gICAgIGpwZzogJy4uLmpwZycsXG4gICAgICAgICAgICAvLyAgICAgcG5nOiAnLi4ucG5nJyxcbiAgICAgICAgICAgIC8vIH1cblxuICAgICAgICAgICAgLy8gT25seSBwcm9wcyByZWxldmFudCB0byBLVFhUZXh0dXJlXG4gICAgICAgICAgICB3cmFwUyA9IGdsLkNMQU1QX1RPX0VER0UsXG4gICAgICAgICAgICB3cmFwVCA9IGdsLkNMQU1QX1RPX0VER0UsXG4gICAgICAgICAgICBhbmlzb3Ryb3B5ID0gMCxcblxuICAgICAgICAgICAgLy8gRm9yIHJlZ3VsYXIgaW1hZ2VzXG4gICAgICAgICAgICBmb3JtYXQgPSBnbC5SR0JBLFxuICAgICAgICAgICAgaW50ZXJuYWxGb3JtYXQgPSBmb3JtYXQsXG4gICAgICAgICAgICBnZW5lcmF0ZU1pcG1hcHMgPSB0cnVlLFxuICAgICAgICAgICAgbWluRmlsdGVyID0gZ2VuZXJhdGVNaXBtYXBzID8gZ2wuTkVBUkVTVF9NSVBNQVBfTElORUFSIDogZ2wuTElORUFSLFxuICAgICAgICAgICAgbWFnRmlsdGVyID0gZ2wuTElORUFSLFxuICAgICAgICAgICAgcHJlbXVsdGlwbHlBbHBoYSA9IGZhbHNlLFxuICAgICAgICAgICAgdW5wYWNrQWxpZ25tZW50ID0gNCxcbiAgICAgICAgICAgIGZsaXBZID0gdHJ1ZSxcbiAgICAgICAgfSA9IHt9XG4gICAgKSB7XG4gICAgICAgIGNvbnN0IHN1cHBvcnQgPSB0aGlzLmdldFN1cHBvcnRlZEV4dGVuc2lvbnMoZ2wpO1xuICAgICAgICBsZXQgZXh0ID0gJ25vbmUnO1xuXG4gICAgICAgIC8vIElmIHNyYyBpcyBzdHJpbmcsIGRldGVybWluZSB3aGljaCBmb3JtYXQgZnJvbSB0aGUgZXh0ZW5zaW9uXG4gICAgICAgIGlmICh0eXBlb2Ygc3JjID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgZXh0ID0gc3JjLnNwbGl0KCcuJykucG9wKCkuc3BsaXQoJz8nKVswXS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gSWYgc3JjIGlzIG9iamVjdCwgdXNlIHN1cHBvcnRlZCBleHRlbnNpb25zIGFuZCBwcm92aWRlZCBsaXN0IHRvIGNob29zZSBiZXN0IG9wdGlvblxuICAgICAgICAvLyBHZXQgZmlyc3Qgc3VwcG9ydGVkIG1hdGNoLCBzbyBwdXQgaW4gb3JkZXIgb2YgcHJlZmVyZW5jZVxuICAgICAgICBpZiAodHlwZW9mIHNyYyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgIGZvciAoY29uc3QgcHJvcCBpbiBzcmMpIHtcbiAgICAgICAgICAgICAgICBpZiAoc3VwcG9ydC5pbmNsdWRlcyhwcm9wLnRvTG93ZXJDYXNlKCkpKSB7XG4gICAgICAgICAgICAgICAgICAgIGV4dCA9IHByb3AudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgICAgICAgICAgICAgc3JjID0gc3JjW3Byb3BdO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBTdHJpbmdpZnkgcHJvcHNcbiAgICAgICAgY29uc3QgY2FjaGVJRCA9XG4gICAgICAgICAgICBzcmMgK1xuICAgICAgICAgICAgd3JhcFMgK1xuICAgICAgICAgICAgd3JhcFQgK1xuICAgICAgICAgICAgYW5pc290cm9weSArXG4gICAgICAgICAgICBmb3JtYXQgK1xuICAgICAgICAgICAgaW50ZXJuYWxGb3JtYXQgK1xuICAgICAgICAgICAgZ2VuZXJhdGVNaXBtYXBzICtcbiAgICAgICAgICAgIG1pbkZpbHRlciArXG4gICAgICAgICAgICBtYWdGaWx0ZXIgK1xuICAgICAgICAgICAgcHJlbXVsdGlwbHlBbHBoYSArXG4gICAgICAgICAgICB1bnBhY2tBbGlnbm1lbnQgK1xuICAgICAgICAgICAgZmxpcFkgK1xuICAgICAgICAgICAgZ2wucmVuZGVyZXIuaWQ7XG5cbiAgICAgICAgLy8gQ2hlY2sgY2FjaGUgZm9yIGV4aXN0aW5nIHRleHR1cmVcbiAgICAgICAgaWYgKGNhY2hlW2NhY2hlSURdKSByZXR1cm4gY2FjaGVbY2FjaGVJRF07XG5cbiAgICAgICAgbGV0IHRleHR1cmU7XG4gICAgICAgIHN3aXRjaCAoZXh0KSB7XG4gICAgICAgICAgICBjYXNlICdrdHgnOlxuICAgICAgICAgICAgY2FzZSAncHZydGMnOlxuICAgICAgICAgICAgY2FzZSAnczN0Yyc6XG4gICAgICAgICAgICBjYXNlICdldGMnOlxuICAgICAgICAgICAgY2FzZSAnZXRjMSc6XG4gICAgICAgICAgICBjYXNlICdhc3RjJzpcbiAgICAgICAgICAgICAgICAvLyBMb2FkIGNvbXByZXNzZWQgdGV4dHVyZSB1c2luZyBLVFggZm9ybWF0XG4gICAgICAgICAgICAgICAgdGV4dHVyZSA9IG5ldyBLVFhUZXh0dXJlKGdsLCB7XG4gICAgICAgICAgICAgICAgICAgIHNyYyxcbiAgICAgICAgICAgICAgICAgICAgd3JhcFMsXG4gICAgICAgICAgICAgICAgICAgIHdyYXBULFxuICAgICAgICAgICAgICAgICAgICBhbmlzb3Ryb3B5LFxuICAgICAgICAgICAgICAgICAgICBtaW5GaWx0ZXIsXG4gICAgICAgICAgICAgICAgICAgIG1hZ0ZpbHRlcixcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB0ZXh0dXJlLmxvYWRlZCA9IHRoaXMubG9hZEtUWChzcmMsIHRleHR1cmUpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnd2VicCc6XG4gICAgICAgICAgICBjYXNlICdqcGcnOlxuICAgICAgICAgICAgY2FzZSAnanBlZyc6XG4gICAgICAgICAgICBjYXNlICdwbmcnOlxuICAgICAgICAgICAgICAgIHRleHR1cmUgPSBuZXcgVGV4dHVyZShnbCwge1xuICAgICAgICAgICAgICAgICAgICB3cmFwUyxcbiAgICAgICAgICAgICAgICAgICAgd3JhcFQsXG4gICAgICAgICAgICAgICAgICAgIGFuaXNvdHJvcHksXG4gICAgICAgICAgICAgICAgICAgIGZvcm1hdCxcbiAgICAgICAgICAgICAgICAgICAgaW50ZXJuYWxGb3JtYXQsXG4gICAgICAgICAgICAgICAgICAgIGdlbmVyYXRlTWlwbWFwcyxcbiAgICAgICAgICAgICAgICAgICAgbWluRmlsdGVyLFxuICAgICAgICAgICAgICAgICAgICBtYWdGaWx0ZXIsXG4gICAgICAgICAgICAgICAgICAgIHByZW11bHRpcGx5QWxwaGEsXG4gICAgICAgICAgICAgICAgICAgIHVucGFja0FsaWdubWVudCxcbiAgICAgICAgICAgICAgICAgICAgZmxpcFksXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgdGV4dHVyZS5sb2FkZWQgPSB0aGlzLmxvYWRJbWFnZShnbCwgc3JjLCB0ZXh0dXJlKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdObyBzdXBwb3J0ZWQgZm9ybWF0IHN1cHBsaWVkJyk7XG4gICAgICAgICAgICAgICAgdGV4dHVyZSA9IG5ldyBUZXh0dXJlKGdsKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRleHR1cmUuZXh0ID0gZXh0O1xuICAgICAgICBjYWNoZVtjYWNoZUlEXSA9IHRleHR1cmU7XG4gICAgICAgIHJldHVybiB0ZXh0dXJlO1xuICAgIH1cblxuICAgIHN0YXRpYyBnZXRTdXBwb3J0ZWRFeHRlbnNpb25zKGdsKSB7XG4gICAgICAgIGlmIChzdXBwb3J0ZWRFeHRlbnNpb25zLmxlbmd0aCkgcmV0dXJuIHN1cHBvcnRlZEV4dGVuc2lvbnM7XG5cbiAgICAgICAgY29uc3QgZXh0ZW5zaW9ucyA9IHtcbiAgICAgICAgICAgIHB2cnRjOiBnbC5yZW5kZXJlci5nZXRFeHRlbnNpb24oJ1dFQkdMX2NvbXByZXNzZWRfdGV4dHVyZV9wdnJ0YycpIHx8IGdsLnJlbmRlcmVyLmdldEV4dGVuc2lvbignV0VCS0lUX1dFQkdMX2NvbXByZXNzZWRfdGV4dHVyZV9wdnJ0YycpLFxuICAgICAgICAgICAgczN0YzpcbiAgICAgICAgICAgICAgICBnbC5yZW5kZXJlci5nZXRFeHRlbnNpb24oJ1dFQkdMX2NvbXByZXNzZWRfdGV4dHVyZV9zM3RjJykgfHxcbiAgICAgICAgICAgICAgICBnbC5yZW5kZXJlci5nZXRFeHRlbnNpb24oJ01PWl9XRUJHTF9jb21wcmVzc2VkX3RleHR1cmVfczN0YycpIHx8XG4gICAgICAgICAgICAgICAgZ2wucmVuZGVyZXIuZ2V0RXh0ZW5zaW9uKCdXRUJLSVRfV0VCR0xfY29tcHJlc3NlZF90ZXh0dXJlX3MzdGMnKSxcbiAgICAgICAgICAgIGV0YzogZ2wucmVuZGVyZXIuZ2V0RXh0ZW5zaW9uKCdXRUJHTF9jb21wcmVzc2VkX3RleHR1cmVfZXRjJyksXG4gICAgICAgICAgICBldGMxOiBnbC5yZW5kZXJlci5nZXRFeHRlbnNpb24oJ1dFQkdMX2NvbXByZXNzZWRfdGV4dHVyZV9ldGMxJyksXG4gICAgICAgICAgICBhc3RjOiBnbC5yZW5kZXJlci5nZXRFeHRlbnNpb24oJ1dFQkdMX2NvbXByZXNzZWRfdGV4dHVyZV9hc3RjJyksXG4gICAgICAgIH07XG5cbiAgICAgICAgZm9yIChjb25zdCBleHQgaW4gZXh0ZW5zaW9ucykgaWYgKGV4dGVuc2lvbnNbZXh0XSkgc3VwcG9ydGVkRXh0ZW5zaW9ucy5wdXNoKGV4dCk7XG5cbiAgICAgICAgLy8gQ2hlY2sgZm9yIFdlYlAgc3VwcG9ydFxuICAgICAgICBpZiAoZGV0ZWN0V2ViUCkgc3VwcG9ydGVkRXh0ZW5zaW9ucy5wdXNoKCd3ZWJwJyk7XG5cbiAgICAgICAgLy8gRm9ybWF0cyBzdXBwb3J0ZWQgYnkgYWxsXG4gICAgICAgIHN1cHBvcnRlZEV4dGVuc2lvbnMucHVzaCgncG5nJywgJ2pwZycpO1xuXG4gICAgICAgIHJldHVybiBzdXBwb3J0ZWRFeHRlbnNpb25zO1xuICAgIH1cblxuICAgIHN0YXRpYyBsb2FkS1RYKHNyYywgdGV4dHVyZSkge1xuICAgICAgICByZXR1cm4gZmV0Y2goc3JjKVxuICAgICAgICAgICAgLnRoZW4oKHJlcykgPT4gcmVzLmFycmF5QnVmZmVyKCkpXG4gICAgICAgICAgICAudGhlbigoYnVmZmVyKSA9PiB0ZXh0dXJlLnBhcnNlQnVmZmVyKGJ1ZmZlcikpO1xuICAgIH1cblxuICAgIHN0YXRpYyBsb2FkSW1hZ2UoZ2wsIHNyYywgdGV4dHVyZSkge1xuICAgICAgICByZXR1cm4gZGVjb2RlSW1hZ2Uoc3JjKS50aGVuKChpbWdCbXApID0+IHtcbiAgICAgICAgICAgIC8vIENhdGNoIG5vbiBQT1QgdGV4dHVyZXMgYW5kIHVwZGF0ZSBwYXJhbXMgdG8gYXZvaWQgZXJyb3JzXG4gICAgICAgICAgICBpZiAoIXBvd2VyT2ZUd28oaW1nQm1wLndpZHRoKSB8fCAhcG93ZXJPZlR3byhpbWdCbXAuaGVpZ2h0KSkge1xuICAgICAgICAgICAgICAgIGlmICh0ZXh0dXJlLmdlbmVyYXRlTWlwbWFwcykgdGV4dHVyZS5nZW5lcmF0ZU1pcG1hcHMgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBpZiAodGV4dHVyZS5taW5GaWx0ZXIgPT09IGdsLk5FQVJFU1RfTUlQTUFQX0xJTkVBUikgdGV4dHVyZS5taW5GaWx0ZXIgPSBnbC5MSU5FQVI7XG4gICAgICAgICAgICAgICAgaWYgKHRleHR1cmUud3JhcFMgPT09IGdsLlJFUEVBVCkgdGV4dHVyZS53cmFwUyA9IHRleHR1cmUud3JhcFQgPSBnbC5DTEFNUF9UT19FREdFO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0ZXh0dXJlLmltYWdlID0gaW1nQm1wO1xuXG4gICAgICAgICAgICAvLyBGb3IgY3JlYXRlSW1hZ2VCaXRtYXAsIGNsb3NlIG9uY2UgdXBsb2FkZWRcbiAgICAgICAgICAgIHRleHR1cmUub25VcGRhdGUgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGltZ0JtcC5jbG9zZSkgaW1nQm1wLmNsb3NlKCk7XG4gICAgICAgICAgICAgICAgdGV4dHVyZS5vblVwZGF0ZSA9IG51bGw7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICByZXR1cm4gaW1nQm1wO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBzdGF0aWMgY2xlYXJDYWNoZSgpIHtcbiAgICAgICAgY2FjaGUgPSB7fTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGRldGVjdFdlYlAoKSB7XG4gICAgcmV0dXJuIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpLnRvRGF0YVVSTCgnaW1hZ2Uvd2VicCcpLmluZGV4T2YoJ2RhdGE6aW1hZ2Uvd2VicCcpID09IDA7XG59XG5cbmZ1bmN0aW9uIHBvd2VyT2ZUd28odmFsdWUpIHtcbiAgICByZXR1cm4gTWF0aC5sb2cyKHZhbHVlKSAlIDEgPT09IDA7XG59XG5cbmZ1bmN0aW9uIGRlY29kZUltYWdlKHNyYykge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICBjb25zdCBpbWcgPSBuZXcgSW1hZ2UoKTtcbiAgICAgICAgaW1nLmNyb3NzT3JpZ2luID0gJyc7XG4gICAgICAgIGltZy5zcmMgPSBzcmM7XG5cbiAgICAgICAgLy8gT25seSBjaHJvbWUncyBpbXBsZW1lbnRhdGlvbiBvZiBjcmVhdGVJbWFnZUJpdG1hcCBpcyBmdWxseSBzdXBwb3J0ZWRcbiAgICAgICAgY29uc3QgaXNDaHJvbWUgPSBuYXZpZ2F0b3IudXNlckFnZW50LnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoJ2Nocm9tZScpO1xuICAgICAgICBpZiAoISF3aW5kb3cuY3JlYXRlSW1hZ2VCaXRtYXAgJiYgaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIGltZy5vbmxvYWQgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgY3JlYXRlSW1hZ2VCaXRtYXAoaW1nLCB7XG4gICAgICAgICAgICAgICAgICAgIGltYWdlT3JpZW50YXRpb246ICdmbGlwWScsXG4gICAgICAgICAgICAgICAgICAgIHByZW11bHRpcGx5QWxwaGE6ICdub25lJyxcbiAgICAgICAgICAgICAgICB9KS50aGVuKChpbWdCbXApID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShpbWdCbXApO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGltZy5vbmxvYWQgPSAoKSA9PiByZXNvbHZlKGltZyk7XG4gICAgICAgIH1cbiAgICB9KTtcbn1cbiIsIi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9tcmRvb2IvdGhyZWUuanMvYmxvYi9tYXN0ZXIvc3JjL2dlb21ldHJpZXMvVG9ydXNHZW9tZXRyeS5qc1xuXG5pbXBvcnQgeyBHZW9tZXRyeSB9IGZyb20gJy4uL2NvcmUvR2VvbWV0cnkuanMnO1xuaW1wb3J0IHsgVmVjMyB9IGZyb20gJy4uL21hdGgvVmVjMy5qcyc7XG5cbmV4cG9ydCBjbGFzcyBUb3J1cyBleHRlbmRzIEdlb21ldHJ5IHtcbiAgICBjb25zdHJ1Y3RvcihnbCwgeyByYWRpdXMgPSAwLjUsIHR1YmUgPSAwLjIsIHJhZGlhbFNlZ21lbnRzID0gOCwgdHVidWxhclNlZ21lbnRzID0gNiwgYXJjID0gTWF0aC5QSSAqIDIsIGF0dHJpYnV0ZXMgPSB7fSB9ID0ge30pIHtcbiAgICAgICAgY29uc3QgbnVtID0gKHJhZGlhbFNlZ21lbnRzICsgMSkgKiAodHVidWxhclNlZ21lbnRzICsgMSk7XG4gICAgICAgIGNvbnN0IG51bUluZGljZXMgPSByYWRpYWxTZWdtZW50cyAqIHR1YnVsYXJTZWdtZW50cyAqIDY7XG5cbiAgICAgICAgY29uc3QgdmVydGljZXMgPSBuZXcgRmxvYXQzMkFycmF5KG51bSAqIDMpO1xuICAgICAgICBjb25zdCBub3JtYWxzID0gbmV3IEZsb2F0MzJBcnJheShudW0gKiAzKTtcbiAgICAgICAgY29uc3QgdXZzID0gbmV3IEZsb2F0MzJBcnJheShudW0gKiAyKTtcbiAgICAgICAgY29uc3QgaW5kaWNlcyA9IG51bSA+IDY1NTM2ID8gbmV3IFVpbnQzMkFycmF5KG51bUluZGljZXMpIDogbmV3IFVpbnQxNkFycmF5KG51bUluZGljZXMpO1xuXG4gICAgICAgIGNvbnN0IGNlbnRlciA9IG5ldyBWZWMzKCk7XG4gICAgICAgIGNvbnN0IHZlcnRleCA9IG5ldyBWZWMzKCk7XG4gICAgICAgIGNvbnN0IG5vcm1hbCA9IG5ldyBWZWMzKCk7XG5cbiAgICAgICAgLy8gZ2VuZXJhdGUgdmVydGljZXMsIG5vcm1hbHMgYW5kIHV2c1xuICAgICAgICBsZXQgaWR4ID0gMDtcbiAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPD0gcmFkaWFsU2VnbWVudHM7IGorKykge1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPD0gdHVidWxhclNlZ21lbnRzOyBpKyssIGlkeCsrKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgdSA9IChpIC8gdHVidWxhclNlZ21lbnRzKSAqIGFyYztcbiAgICAgICAgICAgICAgICBjb25zdCB2ID0gKGogLyByYWRpYWxTZWdtZW50cykgKiBNYXRoLlBJICogMjtcblxuICAgICAgICAgICAgICAgIC8vIHZlcnRleFxuICAgICAgICAgICAgICAgIHZlcnRleC54ID0gKHJhZGl1cyArIHR1YmUgKiBNYXRoLmNvcyh2KSkgKiBNYXRoLmNvcyh1KTtcbiAgICAgICAgICAgICAgICB2ZXJ0ZXgueSA9IChyYWRpdXMgKyB0dWJlICogTWF0aC5jb3ModikpICogTWF0aC5zaW4odSk7XG4gICAgICAgICAgICAgICAgdmVydGV4LnogPSB0dWJlICogTWF0aC5zaW4odik7XG5cbiAgICAgICAgICAgICAgICB2ZXJ0aWNlcy5zZXQoW3ZlcnRleC54LCB2ZXJ0ZXgueSwgdmVydGV4LnpdLCBpZHggKiAzKTtcblxuICAgICAgICAgICAgICAgIC8vIG5vcm1hbFxuICAgICAgICAgICAgICAgIGNlbnRlci54ID0gcmFkaXVzICogTWF0aC5jb3ModSk7XG4gICAgICAgICAgICAgICAgY2VudGVyLnkgPSByYWRpdXMgKiBNYXRoLnNpbih1KTtcbiAgICAgICAgICAgICAgICBub3JtYWwuc3ViKHZlcnRleCwgY2VudGVyKS5ub3JtYWxpemUoKTtcblxuICAgICAgICAgICAgICAgIG5vcm1hbHMuc2V0KFtub3JtYWwueCwgbm9ybWFsLnksIG5vcm1hbC56XSwgaWR4ICogMyk7XG5cbiAgICAgICAgICAgICAgICAvLyB1dlxuICAgICAgICAgICAgICAgIHV2cy5zZXQoW2kgLyB0dWJ1bGFyU2VnbWVudHMsIGogLyByYWRpYWxTZWdtZW50c10sIGlkeCAqIDIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gZ2VuZXJhdGUgaW5kaWNlc1xuICAgICAgICBpZHggPSAwO1xuICAgICAgICBmb3IgKGxldCBqID0gMTsgaiA8PSByYWRpYWxTZWdtZW50czsgaisrKSB7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMTsgaSA8PSB0dWJ1bGFyU2VnbWVudHM7IGkrKywgaWR4KyspIHtcbiAgICAgICAgICAgICAgICAvLyBpbmRpY2VzXG4gICAgICAgICAgICAgICAgY29uc3QgYSA9ICh0dWJ1bGFyU2VnbWVudHMgKyAxKSAqIGogKyBpIC0gMTtcbiAgICAgICAgICAgICAgICBjb25zdCBiID0gKHR1YnVsYXJTZWdtZW50cyArIDEpICogKGogLSAxKSArIGkgLSAxO1xuICAgICAgICAgICAgICAgIGNvbnN0IGMgPSAodHVidWxhclNlZ21lbnRzICsgMSkgKiAoaiAtIDEpICsgaTtcbiAgICAgICAgICAgICAgICBjb25zdCBkID0gKHR1YnVsYXJTZWdtZW50cyArIDEpICogaiArIGk7XG5cbiAgICAgICAgICAgICAgICAvLyBmYWNlc1xuICAgICAgICAgICAgICAgIGluZGljZXMuc2V0KFthLCBiLCBkLCBiLCBjLCBkXSwgaWR4ICogNik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBPYmplY3QuYXNzaWduKGF0dHJpYnV0ZXMsIHtcbiAgICAgICAgICAgIHBvc2l0aW9uOiB7IHNpemU6IDMsIGRhdGE6IHZlcnRpY2VzIH0sXG4gICAgICAgICAgICBub3JtYWw6IHsgc2l6ZTogMywgZGF0YTogbm9ybWFscyB9LFxuICAgICAgICAgICAgdXY6IHsgc2l6ZTogMiwgZGF0YTogdXZzIH0sXG4gICAgICAgICAgICBpbmRleDogeyBkYXRhOiBpbmRpY2VzIH0sXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHN1cGVyKGdsLCBhdHRyaWJ1dGVzKTtcbiAgICB9XG59XG4iLCJpbXBvcnQgeyBHZW9tZXRyeSB9IGZyb20gJy4uL2NvcmUvR2VvbWV0cnkuanMnO1xuXG5leHBvcnQgY2xhc3MgVHJpYW5nbGUgZXh0ZW5kcyBHZW9tZXRyeSB7XG4gICAgY29uc3RydWN0b3IoZ2wsIHsgYXR0cmlidXRlcyA9IHt9IH0gPSB7fSkge1xuICAgICAgICBPYmplY3QuYXNzaWduKGF0dHJpYnV0ZXMsIHtcbiAgICAgICAgICAgIHBvc2l0aW9uOiB7IHNpemU6IDIsIGRhdGE6IG5ldyBGbG9hdDMyQXJyYXkoWy0xLCAtMSwgMywgLTEsIC0xLCAzXSkgfSxcbiAgICAgICAgICAgIHV2OiB7IHNpemU6IDIsIGRhdGE6IG5ldyBGbG9hdDMyQXJyYXkoWzAsIDAsIDIsIDAsIDAsIDJdKSB9LFxuICAgICAgICB9KTtcblxuICAgICAgICBzdXBlcihnbCwgYXR0cmlidXRlcyk7XG4gICAgfVxufVxuIiwiaW1wb3J0ICogYXMgQ29sb3JGdW5jIGZyb20gJy4vZnVuY3Rpb25zL0NvbG9yRnVuYy5qcyc7XG5cbi8vIENvbG9yIHN0b3JlZCBhcyBhbiBhcnJheSBvZiBSR0IgZGVjaW1hbCB2YWx1ZXMgKGJldHdlZW4gMCA+IDEpXG4vLyBDb25zdHJ1Y3RvciBhbmQgc2V0IG1ldGhvZCBhY2NlcHQgZm9sbG93aW5nIGZvcm1hdHM6XG4vLyBuZXcgQ29sb3IoKSAtIEVtcHR5IChkZWZhdWx0cyB0byBibGFjaylcbi8vIG5ldyBDb2xvcihbMC4yLCAwLjQsIDEuMF0pIC0gRGVjaW1hbCBBcnJheSAob3IgYW5vdGhlciBDb2xvciBpbnN0YW5jZSlcbi8vIG5ldyBDb2xvcigwLjcsIDAuMCwgMC4xKSAtIERlY2ltYWwgUkdCIHZhbHVlc1xuLy8gbmV3IENvbG9yKCcjZmYwMDAwJykgLSBIZXggc3RyaW5nXG4vLyBuZXcgQ29sb3IoJyNjY2MnKSAtIFNob3J0LWhhbmQgSGV4IHN0cmluZ1xuLy8gbmV3IENvbG9yKDB4NGYyN2U4KSAtIE51bWJlclxuLy8gbmV3IENvbG9yKCdyZWQnKSAtIENvbG9yIG5hbWUgc3RyaW5nIChzaG9ydCBsaXN0IGluIENvbG9yRnVuYy5qcylcblxuZXhwb3J0IGNsYXNzIENvbG9yIGV4dGVuZHMgQXJyYXkge1xuICAgIGNvbnN0cnVjdG9yKGNvbG9yKSB7XG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KGNvbG9yKSkgcmV0dXJuIHN1cGVyKC4uLmNvbG9yKTtcbiAgICAgICAgcmV0dXJuIHN1cGVyKC4uLkNvbG9yRnVuYy5wYXJzZUNvbG9yKC4uLmFyZ3VtZW50cykpO1xuICAgIH1cblxuICAgIGdldCByKCkge1xuICAgICAgICByZXR1cm4gdGhpc1swXTtcbiAgICB9XG5cbiAgICBnZXQgZygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXNbMV07XG4gICAgfVxuXG4gICAgZ2V0IGIoKSB7XG4gICAgICAgIHJldHVybiB0aGlzWzJdO1xuICAgIH1cblxuICAgIHNldCByKHYpIHtcbiAgICAgICAgdGhpc1swXSA9IHY7XG4gICAgfVxuXG4gICAgc2V0IGcodikge1xuICAgICAgICB0aGlzWzFdID0gdjtcbiAgICB9XG5cbiAgICBzZXQgYih2KSB7XG4gICAgICAgIHRoaXNbMl0gPSB2O1xuICAgIH1cblxuICAgIHNldChjb2xvcikge1xuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShjb2xvcikpIHJldHVybiB0aGlzLmNvcHkoY29sb3IpO1xuICAgICAgICByZXR1cm4gdGhpcy5jb3B5KENvbG9yRnVuYy5wYXJzZUNvbG9yKC4uLmFyZ3VtZW50cykpO1xuICAgIH1cblxuICAgIGNvcHkodikge1xuICAgICAgICB0aGlzWzBdID0gdlswXTtcbiAgICAgICAgdGhpc1sxXSA9IHZbMV07XG4gICAgICAgIHRoaXNbMl0gPSB2WzJdO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG59XG4iLCJpbXBvcnQgKiBhcyBFdWxlckZ1bmMgZnJvbSAnLi9mdW5jdGlvbnMvRXVsZXJGdW5jLmpzJztcbmltcG9ydCB7IE1hdDQgfSBmcm9tICcuL01hdDQuanMnO1xuXG5jb25zdCB0bXBNYXQ0ID0gbmV3IE1hdDQoKTtcblxuZXhwb3J0IGNsYXNzIEV1bGVyIGV4dGVuZHMgQXJyYXkge1xuICAgIGNvbnN0cnVjdG9yKHggPSAwLCB5ID0geCwgeiA9IHgsIG9yZGVyID0gJ1lYWicpIHtcbiAgICAgICAgc3VwZXIoeCwgeSwgeik7XG4gICAgICAgIHRoaXMub3JkZXIgPSBvcmRlcjtcbiAgICAgICAgdGhpcy5vbkNoYW5nZSA9ICgpID0+IHt9O1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBnZXQgeCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXNbMF07XG4gICAgfVxuXG4gICAgZ2V0IHkoKSB7XG4gICAgICAgIHJldHVybiB0aGlzWzFdO1xuICAgIH1cblxuICAgIGdldCB6KCkge1xuICAgICAgICByZXR1cm4gdGhpc1syXTtcbiAgICB9XG5cbiAgICBzZXQgeCh2KSB7XG4gICAgICAgIHRoaXNbMF0gPSB2O1xuICAgICAgICB0aGlzLm9uQ2hhbmdlKCk7XG4gICAgfVxuXG4gICAgc2V0IHkodikge1xuICAgICAgICB0aGlzWzFdID0gdjtcbiAgICAgICAgdGhpcy5vbkNoYW5nZSgpO1xuICAgIH1cblxuICAgIHNldCB6KHYpIHtcbiAgICAgICAgdGhpc1syXSA9IHY7XG4gICAgICAgIHRoaXMub25DaGFuZ2UoKTtcbiAgICB9XG5cbiAgICBzZXQoeCwgeSA9IHgsIHogPSB4KSB7XG4gICAgICAgIGlmICh4Lmxlbmd0aCkgcmV0dXJuIHRoaXMuY29weSh4KTtcbiAgICAgICAgdGhpc1swXSA9IHg7XG4gICAgICAgIHRoaXNbMV0gPSB5O1xuICAgICAgICB0aGlzWzJdID0gejtcbiAgICAgICAgdGhpcy5vbkNoYW5nZSgpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBjb3B5KHYpIHtcbiAgICAgICAgdGhpc1swXSA9IHZbMF07XG4gICAgICAgIHRoaXNbMV0gPSB2WzFdO1xuICAgICAgICB0aGlzWzJdID0gdlsyXTtcbiAgICAgICAgdGhpcy5vbkNoYW5nZSgpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICByZW9yZGVyKG9yZGVyKSB7XG4gICAgICAgIHRoaXMub3JkZXIgPSBvcmRlcjtcbiAgICAgICAgdGhpcy5vbkNoYW5nZSgpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBmcm9tUm90YXRpb25NYXRyaXgobSwgb3JkZXIgPSB0aGlzLm9yZGVyKSB7XG4gICAgICAgIEV1bGVyRnVuYy5mcm9tUm90YXRpb25NYXRyaXgodGhpcywgbSwgb3JkZXIpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBmcm9tUXVhdGVybmlvbihxLCBvcmRlciA9IHRoaXMub3JkZXIpIHtcbiAgICAgICAgdG1wTWF0NC5mcm9tUXVhdGVybmlvbihxKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuZnJvbVJvdGF0aW9uTWF0cml4KHRtcE1hdDQsIG9yZGVyKTtcbiAgICB9XG5cbiAgICB0b0FycmF5KGEgPSBbXSwgbyA9IDApIHtcbiAgICAgICAgYVtvXSA9IHRoaXNbMF07XG4gICAgICAgIGFbbyArIDFdID0gdGhpc1sxXTtcbiAgICAgICAgYVtvICsgMl0gPSB0aGlzWzJdO1xuICAgICAgICByZXR1cm4gYTtcbiAgICB9XG59XG4iLCJpbXBvcnQgKiBhcyBNYXQzRnVuYyBmcm9tICcuL2Z1bmN0aW9ucy9NYXQzRnVuYy5qcyc7XG5cbmV4cG9ydCBjbGFzcyBNYXQzIGV4dGVuZHMgQXJyYXkge1xuICAgIGNvbnN0cnVjdG9yKG0wMCA9IDEsIG0wMSA9IDAsIG0wMiA9IDAsIG0xMCA9IDAsIG0xMSA9IDEsIG0xMiA9IDAsIG0yMCA9IDAsIG0yMSA9IDAsIG0yMiA9IDEpIHtcbiAgICAgICAgc3VwZXIobTAwLCBtMDEsIG0wMiwgbTEwLCBtMTEsIG0xMiwgbTIwLCBtMjEsIG0yMik7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHNldChtMDAsIG0wMSwgbTAyLCBtMTAsIG0xMSwgbTEyLCBtMjAsIG0yMSwgbTIyKSB7XG4gICAgICAgIGlmIChtMDAubGVuZ3RoKSByZXR1cm4gdGhpcy5jb3B5KG0wMCk7XG4gICAgICAgIE1hdDNGdW5jLnNldCh0aGlzLCBtMDAsIG0wMSwgbTAyLCBtMTAsIG0xMSwgbTEyLCBtMjAsIG0yMSwgbTIyKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgdHJhbnNsYXRlKHYsIG0gPSB0aGlzKSB7XG4gICAgICAgIE1hdDNGdW5jLnRyYW5zbGF0ZSh0aGlzLCBtLCB2KTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgcm90YXRlKHYsIG0gPSB0aGlzKSB7XG4gICAgICAgIE1hdDNGdW5jLnJvdGF0ZSh0aGlzLCBtLCB2KTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgc2NhbGUodiwgbSA9IHRoaXMpIHtcbiAgICAgICAgTWF0M0Z1bmMuc2NhbGUodGhpcywgbSwgdik7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIG11bHRpcGx5KG1hLCBtYikge1xuICAgICAgICBpZiAobWIpIHtcbiAgICAgICAgICAgIE1hdDNGdW5jLm11bHRpcGx5KHRoaXMsIG1hLCBtYik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBNYXQzRnVuYy5tdWx0aXBseSh0aGlzLCB0aGlzLCBtYSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgaWRlbnRpdHkoKSB7XG4gICAgICAgIE1hdDNGdW5jLmlkZW50aXR5KHRoaXMpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBjb3B5KG0pIHtcbiAgICAgICAgTWF0M0Z1bmMuY29weSh0aGlzLCBtKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgZnJvbU1hdHJpeDQobSkge1xuICAgICAgICBNYXQzRnVuYy5mcm9tTWF0NCh0aGlzLCBtKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgZnJvbVF1YXRlcm5pb24ocSkge1xuICAgICAgICBNYXQzRnVuYy5mcm9tUXVhdCh0aGlzLCBxKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgZnJvbUJhc2lzKHZlYzNhLCB2ZWMzYiwgdmVjM2MpIHtcbiAgICAgICAgdGhpcy5zZXQodmVjM2FbMF0sIHZlYzNhWzFdLCB2ZWMzYVsyXSwgdmVjM2JbMF0sIHZlYzNiWzFdLCB2ZWMzYlsyXSwgdmVjM2NbMF0sIHZlYzNjWzFdLCB2ZWMzY1syXSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGludmVyc2UobSA9IHRoaXMpIHtcbiAgICAgICAgTWF0M0Z1bmMuaW52ZXJ0KHRoaXMsIG0pO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBnZXROb3JtYWxNYXRyaXgobSkge1xuICAgICAgICBNYXQzRnVuYy5ub3JtYWxGcm9tTWF0NCh0aGlzLCBtKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxufVxuIiwiaW1wb3J0ICogYXMgTWF0NEZ1bmMgZnJvbSAnLi9mdW5jdGlvbnMvTWF0NEZ1bmMuanMnO1xuXG5leHBvcnQgY2xhc3MgTWF0NCBleHRlbmRzIEFycmF5IHtcbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgbTAwID0gMSxcbiAgICAgICAgbTAxID0gMCxcbiAgICAgICAgbTAyID0gMCxcbiAgICAgICAgbTAzID0gMCxcbiAgICAgICAgbTEwID0gMCxcbiAgICAgICAgbTExID0gMSxcbiAgICAgICAgbTEyID0gMCxcbiAgICAgICAgbTEzID0gMCxcbiAgICAgICAgbTIwID0gMCxcbiAgICAgICAgbTIxID0gMCxcbiAgICAgICAgbTIyID0gMSxcbiAgICAgICAgbTIzID0gMCxcbiAgICAgICAgbTMwID0gMCxcbiAgICAgICAgbTMxID0gMCxcbiAgICAgICAgbTMyID0gMCxcbiAgICAgICAgbTMzID0gMVxuICAgICkge1xuICAgICAgICBzdXBlcihtMDAsIG0wMSwgbTAyLCBtMDMsIG0xMCwgbTExLCBtMTIsIG0xMywgbTIwLCBtMjEsIG0yMiwgbTIzLCBtMzAsIG0zMSwgbTMyLCBtMzMpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBnZXQgeCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXNbMTJdO1xuICAgIH1cblxuICAgIGdldCB5KCkge1xuICAgICAgICByZXR1cm4gdGhpc1sxM107XG4gICAgfVxuXG4gICAgZ2V0IHooKSB7XG4gICAgICAgIHJldHVybiB0aGlzWzE0XTtcbiAgICB9XG5cbiAgICBnZXQgdygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXNbMTVdO1xuICAgIH1cblxuICAgIHNldCB4KHYpIHtcbiAgICAgICAgdGhpc1sxMl0gPSB2O1xuICAgIH1cblxuICAgIHNldCB5KHYpIHtcbiAgICAgICAgdGhpc1sxM10gPSB2O1xuICAgIH1cblxuICAgIHNldCB6KHYpIHtcbiAgICAgICAgdGhpc1sxNF0gPSB2O1xuICAgIH1cblxuICAgIHNldCB3KHYpIHtcbiAgICAgICAgdGhpc1sxNV0gPSB2O1xuICAgIH1cblxuICAgIHNldChtMDAsIG0wMSwgbTAyLCBtMDMsIG0xMCwgbTExLCBtMTIsIG0xMywgbTIwLCBtMjEsIG0yMiwgbTIzLCBtMzAsIG0zMSwgbTMyLCBtMzMpIHtcbiAgICAgICAgaWYgKG0wMC5sZW5ndGgpIHJldHVybiB0aGlzLmNvcHkobTAwKTtcbiAgICAgICAgTWF0NEZ1bmMuc2V0KHRoaXMsIG0wMCwgbTAxLCBtMDIsIG0wMywgbTEwLCBtMTEsIG0xMiwgbTEzLCBtMjAsIG0yMSwgbTIyLCBtMjMsIG0zMCwgbTMxLCBtMzIsIG0zMyk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHRyYW5zbGF0ZSh2LCBtID0gdGhpcykge1xuICAgICAgICBNYXQ0RnVuYy50cmFuc2xhdGUodGhpcywgbSwgdik7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHJvdGF0ZSh2LCBheGlzLCBtID0gdGhpcykge1xuICAgICAgICBNYXQ0RnVuYy5yb3RhdGUodGhpcywgbSwgdiwgYXhpcyk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHNjYWxlKHYsIG0gPSB0aGlzKSB7XG4gICAgICAgIE1hdDRGdW5jLnNjYWxlKHRoaXMsIG0sIHR5cGVvZiB2ID09PSAnbnVtYmVyJyA/IFt2LCB2LCB2XSA6IHYpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBtdWx0aXBseShtYSwgbWIpIHtcbiAgICAgICAgaWYgKG1iKSB7XG4gICAgICAgICAgICBNYXQ0RnVuYy5tdWx0aXBseSh0aGlzLCBtYSwgbWIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgTWF0NEZ1bmMubXVsdGlwbHkodGhpcywgdGhpcywgbWEpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGlkZW50aXR5KCkge1xuICAgICAgICBNYXQ0RnVuYy5pZGVudGl0eSh0aGlzKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgY29weShtKSB7XG4gICAgICAgIE1hdDRGdW5jLmNvcHkodGhpcywgbSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGZyb21QZXJzcGVjdGl2ZUZydXN0cnVtKHsgbGVmdCwgcmlnaHQsIGJvdHRvbSwgdG9wLCBuZWFyLCBmYXIgfSkge1xuICAgICAgICBNYXQ0RnVuYy5wZXJzcGVjdGl2ZUZydXN0cnVtKHRoaXMsIGxlZnQsIHJpZ2h0LCB0b3AsIGJvdHRvbSwgbmVhciwgZmFyKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgZnJvbVBlcnNwZWN0aXZlKHsgZm92LCBhc3BlY3QsIG5lYXIsIGZhciB9ID0ge30pIHtcbiAgICAgICAgTWF0NEZ1bmMucGVyc3BlY3RpdmUodGhpcywgZm92LCBhc3BlY3QsIG5lYXIsIGZhcik7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGZyb21PcnRob2dvbmFsKHsgbGVmdCwgcmlnaHQsIGJvdHRvbSwgdG9wLCBuZWFyLCBmYXIgfSkge1xuICAgICAgICBNYXQ0RnVuYy5vcnRobyh0aGlzLCBsZWZ0LCByaWdodCwgYm90dG9tLCB0b3AsIG5lYXIsIGZhcik7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGZyb21RdWF0ZXJuaW9uKHEpIHtcbiAgICAgICAgTWF0NEZ1bmMuZnJvbVF1YXQodGhpcywgcSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHNldFBvc2l0aW9uKHYpIHtcbiAgICAgICAgdGhpcy54ID0gdlswXTtcbiAgICAgICAgdGhpcy55ID0gdlsxXTtcbiAgICAgICAgdGhpcy56ID0gdlsyXTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgaW52ZXJzZShtID0gdGhpcykge1xuICAgICAgICBNYXQ0RnVuYy5pbnZlcnQodGhpcywgbSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGNvbXBvc2UocSwgcG9zLCBzY2FsZSkge1xuICAgICAgICBNYXQ0RnVuYy5mcm9tUm90YXRpb25UcmFuc2xhdGlvblNjYWxlKHRoaXMsIHEsIHBvcywgc2NhbGUpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBnZXRSb3RhdGlvbihxKSB7XG4gICAgICAgIE1hdDRGdW5jLmdldFJvdGF0aW9uKHEsIHRoaXMpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBnZXRUcmFuc2xhdGlvbihwb3MpIHtcbiAgICAgICAgTWF0NEZ1bmMuZ2V0VHJhbnNsYXRpb24ocG9zLCB0aGlzKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgZ2V0U2NhbGluZyhzY2FsZSkge1xuICAgICAgICBNYXQ0RnVuYy5nZXRTY2FsaW5nKHNjYWxlLCB0aGlzKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgZ2V0TWF4U2NhbGVPbkF4aXMoKSB7XG4gICAgICAgIHJldHVybiBNYXQ0RnVuYy5nZXRNYXhTY2FsZU9uQXhpcyh0aGlzKTtcbiAgICB9XG5cbiAgICBsb29rQXQoZXllLCB0YXJnZXQsIHVwKSB7XG4gICAgICAgIE1hdDRGdW5jLnRhcmdldFRvKHRoaXMsIGV5ZSwgdGFyZ2V0LCB1cCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGRldGVybWluYW50KCkge1xuICAgICAgICByZXR1cm4gTWF0NEZ1bmMuZGV0ZXJtaW5hbnQodGhpcyk7XG4gICAgfVxuXG4gICAgZnJvbUFycmF5KGEsIG8gPSAwKSB7XG4gICAgICAgIHRoaXNbMF0gPSBhW29dO1xuICAgICAgICB0aGlzWzFdID0gYVtvICsgMV07XG4gICAgICAgIHRoaXNbMl0gPSBhW28gKyAyXTtcbiAgICAgICAgdGhpc1szXSA9IGFbbyArIDNdO1xuICAgICAgICB0aGlzWzRdID0gYVtvICsgNF07XG4gICAgICAgIHRoaXNbNV0gPSBhW28gKyA1XTtcbiAgICAgICAgdGhpc1s2XSA9IGFbbyArIDZdO1xuICAgICAgICB0aGlzWzddID0gYVtvICsgN107XG4gICAgICAgIHRoaXNbOF0gPSBhW28gKyA4XTtcbiAgICAgICAgdGhpc1s5XSA9IGFbbyArIDldO1xuICAgICAgICB0aGlzWzEwXSA9IGFbbyArIDEwXTtcbiAgICAgICAgdGhpc1sxMV0gPSBhW28gKyAxMV07XG4gICAgICAgIHRoaXNbMTJdID0gYVtvICsgMTJdO1xuICAgICAgICB0aGlzWzEzXSA9IGFbbyArIDEzXTtcbiAgICAgICAgdGhpc1sxNF0gPSBhW28gKyAxNF07XG4gICAgICAgIHRoaXNbMTVdID0gYVtvICsgMTVdO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICB0b0FycmF5KGEgPSBbXSwgbyA9IDApIHtcbiAgICAgICAgYVtvXSA9IHRoaXNbMF07XG4gICAgICAgIGFbbyArIDFdID0gdGhpc1sxXTtcbiAgICAgICAgYVtvICsgMl0gPSB0aGlzWzJdO1xuICAgICAgICBhW28gKyAzXSA9IHRoaXNbM107XG4gICAgICAgIGFbbyArIDRdID0gdGhpc1s0XTtcbiAgICAgICAgYVtvICsgNV0gPSB0aGlzWzVdO1xuICAgICAgICBhW28gKyA2XSA9IHRoaXNbNl07XG4gICAgICAgIGFbbyArIDddID0gdGhpc1s3XTtcbiAgICAgICAgYVtvICsgOF0gPSB0aGlzWzhdO1xuICAgICAgICBhW28gKyA5XSA9IHRoaXNbOV07XG4gICAgICAgIGFbbyArIDEwXSA9IHRoaXNbMTBdO1xuICAgICAgICBhW28gKyAxMV0gPSB0aGlzWzExXTtcbiAgICAgICAgYVtvICsgMTJdID0gdGhpc1sxMl07XG4gICAgICAgIGFbbyArIDEzXSA9IHRoaXNbMTNdO1xuICAgICAgICBhW28gKyAxNF0gPSB0aGlzWzE0XTtcbiAgICAgICAgYVtvICsgMTVdID0gdGhpc1sxNV07XG4gICAgICAgIHJldHVybiBhO1xuICAgIH1cbn1cbiIsImltcG9ydCAqIGFzIFF1YXRGdW5jIGZyb20gJy4vZnVuY3Rpb25zL1F1YXRGdW5jLmpzJztcblxuZXhwb3J0IGNsYXNzIFF1YXQgZXh0ZW5kcyBBcnJheSB7XG4gICAgY29uc3RydWN0b3IoeCA9IDAsIHkgPSAwLCB6ID0gMCwgdyA9IDEpIHtcbiAgICAgICAgc3VwZXIoeCwgeSwgeiwgdyk7XG4gICAgICAgIHRoaXMub25DaGFuZ2UgPSAoKSA9PiB7fTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgZ2V0IHgoKSB7XG4gICAgICAgIHJldHVybiB0aGlzWzBdO1xuICAgIH1cblxuICAgIGdldCB5KCkge1xuICAgICAgICByZXR1cm4gdGhpc1sxXTtcbiAgICB9XG5cbiAgICBnZXQgeigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXNbMl07XG4gICAgfVxuXG4gICAgZ2V0IHcoKSB7XG4gICAgICAgIHJldHVybiB0aGlzWzNdO1xuICAgIH1cblxuICAgIHNldCB4KHYpIHtcbiAgICAgICAgdGhpc1swXSA9IHY7XG4gICAgICAgIHRoaXMub25DaGFuZ2UoKTtcbiAgICB9XG5cbiAgICBzZXQgeSh2KSB7XG4gICAgICAgIHRoaXNbMV0gPSB2O1xuICAgICAgICB0aGlzLm9uQ2hhbmdlKCk7XG4gICAgfVxuXG4gICAgc2V0IHoodikge1xuICAgICAgICB0aGlzWzJdID0gdjtcbiAgICAgICAgdGhpcy5vbkNoYW5nZSgpO1xuICAgIH1cblxuICAgIHNldCB3KHYpIHtcbiAgICAgICAgdGhpc1szXSA9IHY7XG4gICAgICAgIHRoaXMub25DaGFuZ2UoKTtcbiAgICB9XG5cbiAgICBpZGVudGl0eSgpIHtcbiAgICAgICAgUXVhdEZ1bmMuaWRlbnRpdHkodGhpcyk7XG4gICAgICAgIHRoaXMub25DaGFuZ2UoKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgc2V0KHgsIHksIHosIHcpIHtcbiAgICAgICAgaWYgKHgubGVuZ3RoKSByZXR1cm4gdGhpcy5jb3B5KHgpO1xuICAgICAgICBRdWF0RnVuYy5zZXQodGhpcywgeCwgeSwgeiwgdyk7XG4gICAgICAgIHRoaXMub25DaGFuZ2UoKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgcm90YXRlWChhKSB7XG4gICAgICAgIFF1YXRGdW5jLnJvdGF0ZVgodGhpcywgdGhpcywgYSk7XG4gICAgICAgIHRoaXMub25DaGFuZ2UoKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgcm90YXRlWShhKSB7XG4gICAgICAgIFF1YXRGdW5jLnJvdGF0ZVkodGhpcywgdGhpcywgYSk7XG4gICAgICAgIHRoaXMub25DaGFuZ2UoKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgcm90YXRlWihhKSB7XG4gICAgICAgIFF1YXRGdW5jLnJvdGF0ZVoodGhpcywgdGhpcywgYSk7XG4gICAgICAgIHRoaXMub25DaGFuZ2UoKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgaW52ZXJzZShxID0gdGhpcykge1xuICAgICAgICBRdWF0RnVuYy5pbnZlcnQodGhpcywgcSk7XG4gICAgICAgIHRoaXMub25DaGFuZ2UoKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgY29uanVnYXRlKHEgPSB0aGlzKSB7XG4gICAgICAgIFF1YXRGdW5jLmNvbmp1Z2F0ZSh0aGlzLCBxKTtcbiAgICAgICAgdGhpcy5vbkNoYW5nZSgpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBjb3B5KHEpIHtcbiAgICAgICAgUXVhdEZ1bmMuY29weSh0aGlzLCBxKTtcbiAgICAgICAgdGhpcy5vbkNoYW5nZSgpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBub3JtYWxpemUocSA9IHRoaXMpIHtcbiAgICAgICAgUXVhdEZ1bmMubm9ybWFsaXplKHRoaXMsIHEpO1xuICAgICAgICB0aGlzLm9uQ2hhbmdlKCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIG11bHRpcGx5KHFBLCBxQikge1xuICAgICAgICBpZiAocUIpIHtcbiAgICAgICAgICAgIFF1YXRGdW5jLm11bHRpcGx5KHRoaXMsIHFBLCBxQik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBRdWF0RnVuYy5tdWx0aXBseSh0aGlzLCB0aGlzLCBxQSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5vbkNoYW5nZSgpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBkb3Qodikge1xuICAgICAgICByZXR1cm4gUXVhdEZ1bmMuZG90KHRoaXMsIHYpO1xuICAgIH1cblxuICAgIGZyb21NYXRyaXgzKG1hdHJpeDMpIHtcbiAgICAgICAgUXVhdEZ1bmMuZnJvbU1hdDModGhpcywgbWF0cml4Myk7XG4gICAgICAgIHRoaXMub25DaGFuZ2UoKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgZnJvbUV1bGVyKGV1bGVyKSB7XG4gICAgICAgIFF1YXRGdW5jLmZyb21FdWxlcih0aGlzLCBldWxlciwgZXVsZXIub3JkZXIpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBmcm9tQXhpc0FuZ2xlKGF4aXMsIGEpIHtcbiAgICAgICAgUXVhdEZ1bmMuc2V0QXhpc0FuZ2xlKHRoaXMsIGF4aXMsIGEpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBzbGVycChxLCB0KSB7XG4gICAgICAgIFF1YXRGdW5jLnNsZXJwKHRoaXMsIHRoaXMsIHEsIHQpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBmcm9tQXJyYXkoYSwgbyA9IDApIHtcbiAgICAgICAgdGhpc1swXSA9IGFbb107XG4gICAgICAgIHRoaXNbMV0gPSBhW28gKyAxXTtcbiAgICAgICAgdGhpc1syXSA9IGFbbyArIDJdO1xuICAgICAgICB0aGlzWzNdID0gYVtvICsgM107XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHRvQXJyYXkoYSA9IFtdLCBvID0gMCkge1xuICAgICAgICBhW29dID0gdGhpc1swXTtcbiAgICAgICAgYVtvICsgMV0gPSB0aGlzWzFdO1xuICAgICAgICBhW28gKyAyXSA9IHRoaXNbMl07XG4gICAgICAgIGFbbyArIDNdID0gdGhpc1szXTtcbiAgICAgICAgcmV0dXJuIGE7XG4gICAgfVxufVxuIiwiaW1wb3J0ICogYXMgVmVjMkZ1bmMgZnJvbSAnLi9mdW5jdGlvbnMvVmVjMkZ1bmMuanMnO1xuXG5leHBvcnQgY2xhc3MgVmVjMiBleHRlbmRzIEFycmF5IHtcbiAgICBjb25zdHJ1Y3Rvcih4ID0gMCwgeSA9IHgpIHtcbiAgICAgICAgc3VwZXIoeCwgeSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGdldCB4KCkge1xuICAgICAgICByZXR1cm4gdGhpc1swXTtcbiAgICB9XG5cbiAgICBnZXQgeSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXNbMV07XG4gICAgfVxuXG4gICAgc2V0IHgodikge1xuICAgICAgICB0aGlzWzBdID0gdjtcbiAgICB9XG5cbiAgICBzZXQgeSh2KSB7XG4gICAgICAgIHRoaXNbMV0gPSB2O1xuICAgIH1cblxuICAgIHNldCh4LCB5ID0geCkge1xuICAgICAgICBpZiAoeC5sZW5ndGgpIHJldHVybiB0aGlzLmNvcHkoeCk7XG4gICAgICAgIFZlYzJGdW5jLnNldCh0aGlzLCB4LCB5KTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgY29weSh2KSB7XG4gICAgICAgIFZlYzJGdW5jLmNvcHkodGhpcywgdik7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGFkZCh2YSwgdmIpIHtcbiAgICAgICAgaWYgKHZiKSBWZWMyRnVuYy5hZGQodGhpcywgdmEsIHZiKTtcbiAgICAgICAgZWxzZSBWZWMyRnVuYy5hZGQodGhpcywgdGhpcywgdmEpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBzdWIodmEsIHZiKSB7XG4gICAgICAgIGlmICh2YikgVmVjMkZ1bmMuc3VidHJhY3QodGhpcywgdmEsIHZiKTtcbiAgICAgICAgZWxzZSBWZWMyRnVuYy5zdWJ0cmFjdCh0aGlzLCB0aGlzLCB2YSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIG11bHRpcGx5KHYpIHtcbiAgICAgICAgaWYgKHYubGVuZ3RoKSBWZWMyRnVuYy5tdWx0aXBseSh0aGlzLCB0aGlzLCB2KTtcbiAgICAgICAgZWxzZSBWZWMyRnVuYy5zY2FsZSh0aGlzLCB0aGlzLCB2KTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgZGl2aWRlKHYpIHtcbiAgICAgICAgaWYgKHYubGVuZ3RoKSBWZWMyRnVuYy5kaXZpZGUodGhpcywgdGhpcywgdik7XG4gICAgICAgIGVsc2UgVmVjMkZ1bmMuc2NhbGUodGhpcywgdGhpcywgMSAvIHYpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBpbnZlcnNlKHYgPSB0aGlzKSB7XG4gICAgICAgIFZlYzJGdW5jLmludmVyc2UodGhpcywgdik7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8vIENhbid0IHVzZSAnbGVuZ3RoJyBhcyBBcnJheS5wcm90b3R5cGUgdXNlcyBpdFxuICAgIGxlbigpIHtcbiAgICAgICAgcmV0dXJuIFZlYzJGdW5jLmxlbmd0aCh0aGlzKTtcbiAgICB9XG5cbiAgICBkaXN0YW5jZSh2KSB7XG4gICAgICAgIGlmICh2KSByZXR1cm4gVmVjMkZ1bmMuZGlzdGFuY2UodGhpcywgdik7XG4gICAgICAgIGVsc2UgcmV0dXJuIFZlYzJGdW5jLmxlbmd0aCh0aGlzKTtcbiAgICB9XG5cbiAgICBzcXVhcmVkTGVuKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zcXVhcmVkRGlzdGFuY2UoKTtcbiAgICB9XG5cbiAgICBzcXVhcmVkRGlzdGFuY2Uodikge1xuICAgICAgICBpZiAodikgcmV0dXJuIFZlYzJGdW5jLnNxdWFyZWREaXN0YW5jZSh0aGlzLCB2KTtcbiAgICAgICAgZWxzZSByZXR1cm4gVmVjMkZ1bmMuc3F1YXJlZExlbmd0aCh0aGlzKTtcbiAgICB9XG5cbiAgICBuZWdhdGUodiA9IHRoaXMpIHtcbiAgICAgICAgVmVjMkZ1bmMubmVnYXRlKHRoaXMsIHYpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBjcm9zcyh2YSwgdmIpIHtcbiAgICAgICAgaWYgKHZiKSByZXR1cm4gVmVjMkZ1bmMuY3Jvc3ModmEsIHZiKTtcbiAgICAgICAgcmV0dXJuIFZlYzJGdW5jLmNyb3NzKHRoaXMsIHZhKTtcbiAgICB9XG5cbiAgICBzY2FsZSh2KSB7XG4gICAgICAgIFZlYzJGdW5jLnNjYWxlKHRoaXMsIHRoaXMsIHYpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBub3JtYWxpemUoKSB7XG4gICAgICAgIFZlYzJGdW5jLm5vcm1hbGl6ZSh0aGlzLCB0aGlzKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgZG90KHYpIHtcbiAgICAgICAgcmV0dXJuIFZlYzJGdW5jLmRvdCh0aGlzLCB2KTtcbiAgICB9XG5cbiAgICBlcXVhbHModikge1xuICAgICAgICByZXR1cm4gVmVjMkZ1bmMuZXhhY3RFcXVhbHModGhpcywgdik7XG4gICAgfVxuXG4gICAgYXBwbHlNYXRyaXgzKG1hdDMpIHtcbiAgICAgICAgVmVjMkZ1bmMudHJhbnNmb3JtTWF0Myh0aGlzLCB0aGlzLCBtYXQzKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgYXBwbHlNYXRyaXg0KG1hdDQpIHtcbiAgICAgICAgVmVjMkZ1bmMudHJhbnNmb3JtTWF0NCh0aGlzLCB0aGlzLCBtYXQ0KTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgbGVycCh2LCBhKSB7XG4gICAgICAgIFZlYzJGdW5jLmxlcnAodGhpcywgdGhpcywgdiwgYSk7XG4gICAgfVxuXG4gICAgY2xvbmUoKSB7XG4gICAgICAgIHJldHVybiBuZXcgVmVjMih0aGlzWzBdLCB0aGlzWzFdKTtcbiAgICB9XG5cbiAgICBmcm9tQXJyYXkoYSwgbyA9IDApIHtcbiAgICAgICAgdGhpc1swXSA9IGFbb107XG4gICAgICAgIHRoaXNbMV0gPSBhW28gKyAxXTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgdG9BcnJheShhID0gW10sIG8gPSAwKSB7XG4gICAgICAgIGFbb10gPSB0aGlzWzBdO1xuICAgICAgICBhW28gKyAxXSA9IHRoaXNbMV07XG4gICAgICAgIHJldHVybiBhO1xuICAgIH1cbn1cbiIsImltcG9ydCAqIGFzIFZlYzNGdW5jIGZyb20gJy4vZnVuY3Rpb25zL1ZlYzNGdW5jLmpzJztcblxuZXhwb3J0IGNsYXNzIFZlYzMgZXh0ZW5kcyBBcnJheSB7XG4gICAgY29uc3RydWN0b3IoeCA9IDAsIHkgPSB4LCB6ID0geCkge1xuICAgICAgICBzdXBlcih4LCB5LCB6KTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgZ2V0IHgoKSB7XG4gICAgICAgIHJldHVybiB0aGlzWzBdO1xuICAgIH1cblxuICAgIGdldCB5KCkge1xuICAgICAgICByZXR1cm4gdGhpc1sxXTtcbiAgICB9XG5cbiAgICBnZXQgeigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXNbMl07XG4gICAgfVxuXG4gICAgc2V0IHgodikge1xuICAgICAgICB0aGlzWzBdID0gdjtcbiAgICB9XG5cbiAgICBzZXQgeSh2KSB7XG4gICAgICAgIHRoaXNbMV0gPSB2O1xuICAgIH1cblxuICAgIHNldCB6KHYpIHtcbiAgICAgICAgdGhpc1syXSA9IHY7XG4gICAgfVxuXG4gICAgc2V0KHgsIHkgPSB4LCB6ID0geCkge1xuICAgICAgICBpZiAoeC5sZW5ndGgpIHJldHVybiB0aGlzLmNvcHkoeCk7XG4gICAgICAgIFZlYzNGdW5jLnNldCh0aGlzLCB4LCB5LCB6KTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgY29weSh2KSB7XG4gICAgICAgIFZlYzNGdW5jLmNvcHkodGhpcywgdik7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGFkZCh2YSwgdmIpIHtcbiAgICAgICAgaWYgKHZiKSBWZWMzRnVuYy5hZGQodGhpcywgdmEsIHZiKTtcbiAgICAgICAgZWxzZSBWZWMzRnVuYy5hZGQodGhpcywgdGhpcywgdmEpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBzdWIodmEsIHZiKSB7XG4gICAgICAgIGlmICh2YikgVmVjM0Z1bmMuc3VidHJhY3QodGhpcywgdmEsIHZiKTtcbiAgICAgICAgZWxzZSBWZWMzRnVuYy5zdWJ0cmFjdCh0aGlzLCB0aGlzLCB2YSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIG11bHRpcGx5KHYpIHtcbiAgICAgICAgaWYgKHYubGVuZ3RoKSBWZWMzRnVuYy5tdWx0aXBseSh0aGlzLCB0aGlzLCB2KTtcbiAgICAgICAgZWxzZSBWZWMzRnVuYy5zY2FsZSh0aGlzLCB0aGlzLCB2KTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgZGl2aWRlKHYpIHtcbiAgICAgICAgaWYgKHYubGVuZ3RoKSBWZWMzRnVuYy5kaXZpZGUodGhpcywgdGhpcywgdik7XG4gICAgICAgIGVsc2UgVmVjM0Z1bmMuc2NhbGUodGhpcywgdGhpcywgMSAvIHYpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBpbnZlcnNlKHYgPSB0aGlzKSB7XG4gICAgICAgIFZlYzNGdW5jLmludmVyc2UodGhpcywgdik7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8vIENhbid0IHVzZSAnbGVuZ3RoJyBhcyBBcnJheS5wcm90b3R5cGUgdXNlcyBpdFxuICAgIGxlbigpIHtcbiAgICAgICAgcmV0dXJuIFZlYzNGdW5jLmxlbmd0aCh0aGlzKTtcbiAgICB9XG5cbiAgICBkaXN0YW5jZSh2KSB7XG4gICAgICAgIGlmICh2KSByZXR1cm4gVmVjM0Z1bmMuZGlzdGFuY2UodGhpcywgdik7XG4gICAgICAgIGVsc2UgcmV0dXJuIFZlYzNGdW5jLmxlbmd0aCh0aGlzKTtcbiAgICB9XG5cbiAgICBzcXVhcmVkTGVuKCkge1xuICAgICAgICByZXR1cm4gVmVjM0Z1bmMuc3F1YXJlZExlbmd0aCh0aGlzKTtcbiAgICB9XG5cbiAgICBzcXVhcmVkRGlzdGFuY2Uodikge1xuICAgICAgICBpZiAodikgcmV0dXJuIFZlYzNGdW5jLnNxdWFyZWREaXN0YW5jZSh0aGlzLCB2KTtcbiAgICAgICAgZWxzZSByZXR1cm4gVmVjM0Z1bmMuc3F1YXJlZExlbmd0aCh0aGlzKTtcbiAgICB9XG5cbiAgICBuZWdhdGUodiA9IHRoaXMpIHtcbiAgICAgICAgVmVjM0Z1bmMubmVnYXRlKHRoaXMsIHYpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBjcm9zcyh2YSwgdmIpIHtcbiAgICAgICAgaWYgKHZiKSBWZWMzRnVuYy5jcm9zcyh0aGlzLCB2YSwgdmIpO1xuICAgICAgICBlbHNlIFZlYzNGdW5jLmNyb3NzKHRoaXMsIHRoaXMsIHZhKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgc2NhbGUodikge1xuICAgICAgICBWZWMzRnVuYy5zY2FsZSh0aGlzLCB0aGlzLCB2KTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgbm9ybWFsaXplKCkge1xuICAgICAgICBWZWMzRnVuYy5ub3JtYWxpemUodGhpcywgdGhpcyk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGRvdCh2KSB7XG4gICAgICAgIHJldHVybiBWZWMzRnVuYy5kb3QodGhpcywgdik7XG4gICAgfVxuXG4gICAgZXF1YWxzKHYpIHtcbiAgICAgICAgcmV0dXJuIFZlYzNGdW5jLmV4YWN0RXF1YWxzKHRoaXMsIHYpO1xuICAgIH1cblxuICAgIGFwcGx5TWF0cml4NChtYXQ0KSB7XG4gICAgICAgIFZlYzNGdW5jLnRyYW5zZm9ybU1hdDQodGhpcywgdGhpcywgbWF0NCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHNjYWxlUm90YXRlTWF0cml4NChtYXQ0KSB7XG4gICAgICAgIFZlYzNGdW5jLnNjYWxlUm90YXRlTWF0NCh0aGlzLCB0aGlzLCBtYXQ0KTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgYXBwbHlRdWF0ZXJuaW9uKHEpIHtcbiAgICAgICAgVmVjM0Z1bmMudHJhbnNmb3JtUXVhdCh0aGlzLCB0aGlzLCBxKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgYW5nbGUodikge1xuICAgICAgICByZXR1cm4gVmVjM0Z1bmMuYW5nbGUodGhpcywgdik7XG4gICAgfVxuXG4gICAgbGVycCh2LCB0KSB7XG4gICAgICAgIFZlYzNGdW5jLmxlcnAodGhpcywgdGhpcywgdiwgdCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGNsb25lKCkge1xuICAgICAgICByZXR1cm4gbmV3IFZlYzModGhpc1swXSwgdGhpc1sxXSwgdGhpc1syXSk7XG4gICAgfVxuXG4gICAgZnJvbUFycmF5KGEsIG8gPSAwKSB7XG4gICAgICAgIHRoaXNbMF0gPSBhW29dO1xuICAgICAgICB0aGlzWzFdID0gYVtvICsgMV07XG4gICAgICAgIHRoaXNbMl0gPSBhW28gKyAyXTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgdG9BcnJheShhID0gW10sIG8gPSAwKSB7XG4gICAgICAgIGFbb10gPSB0aGlzWzBdO1xuICAgICAgICBhW28gKyAxXSA9IHRoaXNbMV07XG4gICAgICAgIGFbbyArIDJdID0gdGhpc1syXTtcbiAgICAgICAgcmV0dXJuIGE7XG4gICAgfVxuXG4gICAgdHJhbnNmb3JtRGlyZWN0aW9uKG1hdDQpIHtcbiAgICAgICAgY29uc3QgeCA9IHRoaXNbMF07XG4gICAgICAgIGNvbnN0IHkgPSB0aGlzWzFdO1xuICAgICAgICBjb25zdCB6ID0gdGhpc1syXTtcblxuICAgICAgICB0aGlzWzBdID0gbWF0NFswXSAqIHggKyBtYXQ0WzRdICogeSArIG1hdDRbOF0gKiB6O1xuICAgICAgICB0aGlzWzFdID0gbWF0NFsxXSAqIHggKyBtYXQ0WzVdICogeSArIG1hdDRbOV0gKiB6O1xuICAgICAgICB0aGlzWzJdID0gbWF0NFsyXSAqIHggKyBtYXQ0WzZdICogeSArIG1hdDRbMTBdICogejtcblxuICAgICAgICByZXR1cm4gdGhpcy5ub3JtYWxpemUoKTtcbiAgICB9XG59XG4iLCJpbXBvcnQgKiBhcyBWZWM0RnVuYyBmcm9tICcuL2Z1bmN0aW9ucy9WZWM0RnVuYy5qcyc7XG5cbmV4cG9ydCBjbGFzcyBWZWM0IGV4dGVuZHMgQXJyYXkge1xuICAgIGNvbnN0cnVjdG9yKHggPSAwLCB5ID0geCwgeiA9IHgsIHcgPSB4KSB7XG4gICAgICAgIHN1cGVyKHgsIHksIHosIHcpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBnZXQgeCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXNbMF07XG4gICAgfVxuXG4gICAgZ2V0IHkoKSB7XG4gICAgICAgIHJldHVybiB0aGlzWzFdO1xuICAgIH1cblxuICAgIGdldCB6KCkge1xuICAgICAgICByZXR1cm4gdGhpc1syXTtcbiAgICB9XG5cbiAgICBnZXQgdygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXNbM107XG4gICAgfVxuXG4gICAgc2V0IHgodikge1xuICAgICAgICB0aGlzWzBdID0gdjtcbiAgICB9XG5cbiAgICBzZXQgeSh2KSB7XG4gICAgICAgIHRoaXNbMV0gPSB2O1xuICAgIH1cblxuICAgIHNldCB6KHYpIHtcbiAgICAgICAgdGhpc1syXSA9IHY7XG4gICAgfVxuXG4gICAgc2V0IHcodikge1xuICAgICAgICB0aGlzWzNdID0gdjtcbiAgICB9XG5cbiAgICBzZXQoeCwgeSwgeiwgdykge1xuICAgICAgICBpZiAoeC5sZW5ndGgpIHJldHVybiB0aGlzLmNvcHkoeCk7XG4gICAgICAgIFZlYzRGdW5jLnNldCh0aGlzLCB4LCB5LCB6LCB3KTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgY29weSh2KSB7XG4gICAgICAgIFZlYzRGdW5jLmNvcHkodGhpcywgdik7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIG5vcm1hbGl6ZSgpIHtcbiAgICAgICAgVmVjNEZ1bmMubm9ybWFsaXplKHRoaXMsIHRoaXMpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBmcm9tQXJyYXkoYSwgbyA9IDApIHtcbiAgICAgICAgdGhpc1swXSA9IGFbb107XG4gICAgICAgIHRoaXNbMV0gPSBhW28gKyAxXTtcbiAgICAgICAgdGhpc1syXSA9IGFbbyArIDJdO1xuICAgICAgICB0aGlzWzNdID0gYVtvICsgM107XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHRvQXJyYXkoYSA9IFtdLCBvID0gMCkge1xuICAgICAgICBhW29dID0gdGhpc1swXTtcbiAgICAgICAgYVtvICsgMV0gPSB0aGlzWzFdO1xuICAgICAgICBhW28gKyAyXSA9IHRoaXNbMl07XG4gICAgICAgIGFbbyArIDNdID0gdGhpc1szXTtcbiAgICAgICAgcmV0dXJuIGE7XG4gICAgfVxufVxuIiwiY29uc3QgTkFNRVMgPSB7XG4gICAgYmxhY2s6ICcjMDAwMDAwJyxcbiAgICB3aGl0ZTogJyNmZmZmZmYnLFxuICAgIHJlZDogJyNmZjAwMDAnLFxuICAgIGdyZWVuOiAnIzAwZmYwMCcsXG4gICAgYmx1ZTogJyMwMDAwZmYnLFxuICAgIGZ1Y2hzaWE6ICcjZmYwMGZmJyxcbiAgICBjeWFuOiAnIzAwZmZmZicsXG4gICAgeWVsbG93OiAnI2ZmZmYwMCcsXG4gICAgb3JhbmdlOiAnI2ZmODAwMCcsXG59O1xuXG5leHBvcnQgZnVuY3Rpb24gaGV4VG9SR0IoaGV4KSB7XG4gICAgaWYgKGhleC5sZW5ndGggPT09IDQpIGhleCA9IGhleFswXSArIGhleFsxXSArIGhleFsxXSArIGhleFsyXSArIGhleFsyXSArIGhleFszXSArIGhleFszXTtcbiAgICBjb25zdCByZ2IgPSAvXiM/KFthLWZcXGRdezJ9KShbYS1mXFxkXXsyfSkoW2EtZlxcZF17Mn0pJC9pLmV4ZWMoaGV4KTtcbiAgICBpZiAoIXJnYikgY29uc29sZS53YXJuKGBVbmFibGUgdG8gY29udmVydCBoZXggc3RyaW5nICR7aGV4fSB0byByZ2IgdmFsdWVzYCk7XG4gICAgcmV0dXJuIFtwYXJzZUludChyZ2JbMV0sIDE2KSAvIDI1NSwgcGFyc2VJbnQocmdiWzJdLCAxNikgLyAyNTUsIHBhcnNlSW50KHJnYlszXSwgMTYpIC8gMjU1XTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG51bWJlclRvUkdCKG51bSkge1xuICAgIG51bSA9IHBhcnNlSW50KG51bSk7XG4gICAgcmV0dXJuIFsoKG51bSA+PiAxNikgJiAyNTUpIC8gMjU1LCAoKG51bSA+PiA4KSAmIDI1NSkgLyAyNTUsIChudW0gJiAyNTUpIC8gMjU1XTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlQ29sb3IoY29sb3IpIHtcbiAgICAvLyBFbXB0eVxuICAgIGlmIChjb2xvciA9PT0gdW5kZWZpbmVkKSByZXR1cm4gWzAsIDAsIDBdO1xuXG4gICAgLy8gRGVjaW1hbFxuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAzKSByZXR1cm4gYXJndW1lbnRzO1xuXG4gICAgLy8gTnVtYmVyXG4gICAgaWYgKCFpc05hTihjb2xvcikpIHJldHVybiBudW1iZXJUb1JHQihjb2xvcik7XG5cbiAgICAvLyBIZXhcbiAgICBpZiAoY29sb3JbMF0gPT09ICcjJykgcmV0dXJuIGhleFRvUkdCKGNvbG9yKTtcblxuICAgIC8vIE5hbWVzXG4gICAgaWYgKE5BTUVTW2NvbG9yLnRvTG93ZXJDYXNlKCldKSByZXR1cm4gaGV4VG9SR0IoTkFNRVNbY29sb3IudG9Mb3dlckNhc2UoKV0pO1xuXG4gICAgY29uc29sZS53YXJuKCdDb2xvciBmb3JtYXQgbm90IHJlY29nbmlzZWQnKTtcbiAgICByZXR1cm4gWzAsIDAsIDBdO1xufVxuIiwiLy8gYXNzdW1lcyB0aGUgdXBwZXIgM3gzIG9mIG0gaXMgYSBwdXJlIHJvdGF0aW9uIG1hdHJpeCAoaS5lLCB1bnNjYWxlZClcbmV4cG9ydCBmdW5jdGlvbiBmcm9tUm90YXRpb25NYXRyaXgob3V0LCBtLCBvcmRlciA9ICdZWFonKSB7XG4gICAgaWYgKG9yZGVyID09PSAnWFlaJykge1xuICAgICAgICBvdXRbMV0gPSBNYXRoLmFzaW4oTWF0aC5taW4oTWF0aC5tYXgobVs4XSwgLTEpLCAxKSk7XG4gICAgICAgIGlmIChNYXRoLmFicyhtWzhdKSA8IDAuOTk5OTkpIHtcbiAgICAgICAgICAgIG91dFswXSA9IE1hdGguYXRhbjIoLW1bOV0sIG1bMTBdKTtcbiAgICAgICAgICAgIG91dFsyXSA9IE1hdGguYXRhbjIoLW1bNF0sIG1bMF0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgb3V0WzBdID0gTWF0aC5hdGFuMihtWzZdLCBtWzVdKTtcbiAgICAgICAgICAgIG91dFsyXSA9IDA7XG4gICAgICAgIH1cbiAgICB9IGVsc2UgaWYgKG9yZGVyID09PSAnWVhaJykge1xuICAgICAgICBvdXRbMF0gPSBNYXRoLmFzaW4oLU1hdGgubWluKE1hdGgubWF4KG1bOV0sIC0xKSwgMSkpO1xuICAgICAgICBpZiAoTWF0aC5hYnMobVs5XSkgPCAwLjk5OTk5KSB7XG4gICAgICAgICAgICBvdXRbMV0gPSBNYXRoLmF0YW4yKG1bOF0sIG1bMTBdKTtcbiAgICAgICAgICAgIG91dFsyXSA9IE1hdGguYXRhbjIobVsxXSwgbVs1XSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBvdXRbMV0gPSBNYXRoLmF0YW4yKC1tWzJdLCBtWzBdKTtcbiAgICAgICAgICAgIG91dFsyXSA9IDA7XG4gICAgICAgIH1cbiAgICB9IGVsc2UgaWYgKG9yZGVyID09PSAnWlhZJykge1xuICAgICAgICBvdXRbMF0gPSBNYXRoLmFzaW4oTWF0aC5taW4oTWF0aC5tYXgobVs2XSwgLTEpLCAxKSk7XG4gICAgICAgIGlmIChNYXRoLmFicyhtWzZdKSA8IDAuOTk5OTkpIHtcbiAgICAgICAgICAgIG91dFsxXSA9IE1hdGguYXRhbjIoLW1bMl0sIG1bMTBdKTtcbiAgICAgICAgICAgIG91dFsyXSA9IE1hdGguYXRhbjIoLW1bNF0sIG1bNV0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgb3V0WzFdID0gMDtcbiAgICAgICAgICAgIG91dFsyXSA9IE1hdGguYXRhbjIobVsxXSwgbVswXSk7XG4gICAgICAgIH1cbiAgICB9IGVsc2UgaWYgKG9yZGVyID09PSAnWllYJykge1xuICAgICAgICBvdXRbMV0gPSBNYXRoLmFzaW4oLU1hdGgubWluKE1hdGgubWF4KG1bMl0sIC0xKSwgMSkpO1xuICAgICAgICBpZiAoTWF0aC5hYnMobVsyXSkgPCAwLjk5OTk5KSB7XG4gICAgICAgICAgICBvdXRbMF0gPSBNYXRoLmF0YW4yKG1bNl0sIG1bMTBdKTtcbiAgICAgICAgICAgIG91dFsyXSA9IE1hdGguYXRhbjIobVsxXSwgbVswXSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBvdXRbMF0gPSAwO1xuICAgICAgICAgICAgb3V0WzJdID0gTWF0aC5hdGFuMigtbVs0XSwgbVs1XSk7XG4gICAgICAgIH1cbiAgICB9IGVsc2UgaWYgKG9yZGVyID09PSAnWVpYJykge1xuICAgICAgICBvdXRbMl0gPSBNYXRoLmFzaW4oTWF0aC5taW4oTWF0aC5tYXgobVsxXSwgLTEpLCAxKSk7XG4gICAgICAgIGlmIChNYXRoLmFicyhtWzFdKSA8IDAuOTk5OTkpIHtcbiAgICAgICAgICAgIG91dFswXSA9IE1hdGguYXRhbjIoLW1bOV0sIG1bNV0pO1xuICAgICAgICAgICAgb3V0WzFdID0gTWF0aC5hdGFuMigtbVsyXSwgbVswXSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBvdXRbMF0gPSAwO1xuICAgICAgICAgICAgb3V0WzFdID0gTWF0aC5hdGFuMihtWzhdLCBtWzEwXSk7XG4gICAgICAgIH1cbiAgICB9IGVsc2UgaWYgKG9yZGVyID09PSAnWFpZJykge1xuICAgICAgICBvdXRbMl0gPSBNYXRoLmFzaW4oLU1hdGgubWluKE1hdGgubWF4KG1bNF0sIC0xKSwgMSkpO1xuICAgICAgICBpZiAoTWF0aC5hYnMobVs0XSkgPCAwLjk5OTk5KSB7XG4gICAgICAgICAgICBvdXRbMF0gPSBNYXRoLmF0YW4yKG1bNl0sIG1bNV0pO1xuICAgICAgICAgICAgb3V0WzFdID0gTWF0aC5hdGFuMihtWzhdLCBtWzBdKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG91dFswXSA9IE1hdGguYXRhbjIoLW1bOV0sIG1bMTBdKTtcbiAgICAgICAgICAgIG91dFsxXSA9IDA7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gb3V0O1xufVxuIiwiY29uc3QgRVBTSUxPTiA9IDAuMDAwMDAxO1xuXG4vKipcbiAqIENvcGllcyB0aGUgdXBwZXItbGVmdCAzeDMgdmFsdWVzIGludG8gdGhlIGdpdmVuIG1hdDMuXG4gKlxuICogQHBhcmFtIHttYXQzfSBvdXQgdGhlIHJlY2VpdmluZyAzeDMgbWF0cml4XG4gKiBAcGFyYW0ge21hdDR9IGEgICB0aGUgc291cmNlIDR4NCBtYXRyaXhcbiAqIEByZXR1cm5zIHttYXQzfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZyb21NYXQ0KG91dCwgYSkge1xuICAgIG91dFswXSA9IGFbMF07XG4gICAgb3V0WzFdID0gYVsxXTtcbiAgICBvdXRbMl0gPSBhWzJdO1xuICAgIG91dFszXSA9IGFbNF07XG4gICAgb3V0WzRdID0gYVs1XTtcbiAgICBvdXRbNV0gPSBhWzZdO1xuICAgIG91dFs2XSA9IGFbOF07XG4gICAgb3V0WzddID0gYVs5XTtcbiAgICBvdXRbOF0gPSBhWzEwXTtcbiAgICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIENhbGN1bGF0ZXMgYSAzeDMgbWF0cml4IGZyb20gdGhlIGdpdmVuIHF1YXRlcm5pb25cbiAqXG4gKiBAcGFyYW0ge21hdDN9IG91dCBtYXQzIHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XG4gKiBAcGFyYW0ge3F1YXR9IHEgUXVhdGVybmlvbiB0byBjcmVhdGUgbWF0cml4IGZyb21cbiAqXG4gKiBAcmV0dXJucyB7bWF0M30gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmcm9tUXVhdChvdXQsIHEpIHtcbiAgICBsZXQgeCA9IHFbMF0sXG4gICAgICAgIHkgPSBxWzFdLFxuICAgICAgICB6ID0gcVsyXSxcbiAgICAgICAgdyA9IHFbM107XG4gICAgbGV0IHgyID0geCArIHg7XG4gICAgbGV0IHkyID0geSArIHk7XG4gICAgbGV0IHoyID0geiArIHo7XG5cbiAgICBsZXQgeHggPSB4ICogeDI7XG4gICAgbGV0IHl4ID0geSAqIHgyO1xuICAgIGxldCB5eSA9IHkgKiB5MjtcbiAgICBsZXQgenggPSB6ICogeDI7XG4gICAgbGV0IHp5ID0geiAqIHkyO1xuICAgIGxldCB6eiA9IHogKiB6MjtcbiAgICBsZXQgd3ggPSB3ICogeDI7XG4gICAgbGV0IHd5ID0gdyAqIHkyO1xuICAgIGxldCB3eiA9IHcgKiB6MjtcblxuICAgIG91dFswXSA9IDEgLSB5eSAtIHp6O1xuICAgIG91dFszXSA9IHl4IC0gd3o7XG4gICAgb3V0WzZdID0genggKyB3eTtcblxuICAgIG91dFsxXSA9IHl4ICsgd3o7XG4gICAgb3V0WzRdID0gMSAtIHh4IC0geno7XG4gICAgb3V0WzddID0genkgLSB3eDtcblxuICAgIG91dFsyXSA9IHp4IC0gd3k7XG4gICAgb3V0WzVdID0genkgKyB3eDtcbiAgICBvdXRbOF0gPSAxIC0geHggLSB5eTtcblxuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogQ29weSB0aGUgdmFsdWVzIGZyb20gb25lIG1hdDMgdG8gYW5vdGhlclxuICpcbiAqIEBwYXJhbSB7bWF0M30gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDN9IGEgdGhlIHNvdXJjZSBtYXRyaXhcbiAqIEByZXR1cm5zIHttYXQzfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvcHkob3V0LCBhKSB7XG4gICAgb3V0WzBdID0gYVswXTtcbiAgICBvdXRbMV0gPSBhWzFdO1xuICAgIG91dFsyXSA9IGFbMl07XG4gICAgb3V0WzNdID0gYVszXTtcbiAgICBvdXRbNF0gPSBhWzRdO1xuICAgIG91dFs1XSA9IGFbNV07XG4gICAgb3V0WzZdID0gYVs2XTtcbiAgICBvdXRbN10gPSBhWzddO1xuICAgIG91dFs4XSA9IGFbOF07XG4gICAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBTZXQgdGhlIGNvbXBvbmVudHMgb2YgYSBtYXQzIHRvIHRoZSBnaXZlbiB2YWx1ZXNcbiAqXG4gKiBAcGFyYW0ge21hdDN9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHJldHVybnMge21hdDN9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gc2V0KG91dCwgbTAwLCBtMDEsIG0wMiwgbTEwLCBtMTEsIG0xMiwgbTIwLCBtMjEsIG0yMikge1xuICAgIG91dFswXSA9IG0wMDtcbiAgICBvdXRbMV0gPSBtMDE7XG4gICAgb3V0WzJdID0gbTAyO1xuICAgIG91dFszXSA9IG0xMDtcbiAgICBvdXRbNF0gPSBtMTE7XG4gICAgb3V0WzVdID0gbTEyO1xuICAgIG91dFs2XSA9IG0yMDtcbiAgICBvdXRbN10gPSBtMjE7XG4gICAgb3V0WzhdID0gbTIyO1xuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogU2V0IGEgbWF0MyB0byB0aGUgaWRlbnRpdHkgbWF0cml4XG4gKlxuICogQHBhcmFtIHttYXQzfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEByZXR1cm5zIHttYXQzfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlkZW50aXR5KG91dCkge1xuICAgIG91dFswXSA9IDE7XG4gICAgb3V0WzFdID0gMDtcbiAgICBvdXRbMl0gPSAwO1xuICAgIG91dFszXSA9IDA7XG4gICAgb3V0WzRdID0gMTtcbiAgICBvdXRbNV0gPSAwO1xuICAgIG91dFs2XSA9IDA7XG4gICAgb3V0WzddID0gMDtcbiAgICBvdXRbOF0gPSAxO1xuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogVHJhbnNwb3NlIHRoZSB2YWx1ZXMgb2YgYSBtYXQzXG4gKlxuICogQHBhcmFtIHttYXQzfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0M30gYSB0aGUgc291cmNlIG1hdHJpeFxuICogQHJldHVybnMge21hdDN9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gdHJhbnNwb3NlKG91dCwgYSkge1xuICAgIC8vIElmIHdlIGFyZSB0cmFuc3Bvc2luZyBvdXJzZWx2ZXMgd2UgY2FuIHNraXAgYSBmZXcgc3RlcHMgYnV0IGhhdmUgdG8gY2FjaGUgc29tZSB2YWx1ZXNcbiAgICBpZiAob3V0ID09PSBhKSB7XG4gICAgICAgIGxldCBhMDEgPSBhWzFdLFxuICAgICAgICAgICAgYTAyID0gYVsyXSxcbiAgICAgICAgICAgIGExMiA9IGFbNV07XG4gICAgICAgIG91dFsxXSA9IGFbM107XG4gICAgICAgIG91dFsyXSA9IGFbNl07XG4gICAgICAgIG91dFszXSA9IGEwMTtcbiAgICAgICAgb3V0WzVdID0gYVs3XTtcbiAgICAgICAgb3V0WzZdID0gYTAyO1xuICAgICAgICBvdXRbN10gPSBhMTI7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgb3V0WzBdID0gYVswXTtcbiAgICAgICAgb3V0WzFdID0gYVszXTtcbiAgICAgICAgb3V0WzJdID0gYVs2XTtcbiAgICAgICAgb3V0WzNdID0gYVsxXTtcbiAgICAgICAgb3V0WzRdID0gYVs0XTtcbiAgICAgICAgb3V0WzVdID0gYVs3XTtcbiAgICAgICAgb3V0WzZdID0gYVsyXTtcbiAgICAgICAgb3V0WzddID0gYVs1XTtcbiAgICAgICAgb3V0WzhdID0gYVs4XTtcbiAgICB9XG5cbiAgICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIEludmVydHMgYSBtYXQzXG4gKlxuICogQHBhcmFtIHttYXQzfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0M30gYSB0aGUgc291cmNlIG1hdHJpeFxuICogQHJldHVybnMge21hdDN9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gaW52ZXJ0KG91dCwgYSkge1xuICAgIGxldCBhMDAgPSBhWzBdLFxuICAgICAgICBhMDEgPSBhWzFdLFxuICAgICAgICBhMDIgPSBhWzJdO1xuICAgIGxldCBhMTAgPSBhWzNdLFxuICAgICAgICBhMTEgPSBhWzRdLFxuICAgICAgICBhMTIgPSBhWzVdO1xuICAgIGxldCBhMjAgPSBhWzZdLFxuICAgICAgICBhMjEgPSBhWzddLFxuICAgICAgICBhMjIgPSBhWzhdO1xuXG4gICAgbGV0IGIwMSA9IGEyMiAqIGExMSAtIGExMiAqIGEyMTtcbiAgICBsZXQgYjExID0gLWEyMiAqIGExMCArIGExMiAqIGEyMDtcbiAgICBsZXQgYjIxID0gYTIxICogYTEwIC0gYTExICogYTIwO1xuXG4gICAgLy8gQ2FsY3VsYXRlIHRoZSBkZXRlcm1pbmFudFxuICAgIGxldCBkZXQgPSBhMDAgKiBiMDEgKyBhMDEgKiBiMTEgKyBhMDIgKiBiMjE7XG5cbiAgICBpZiAoIWRldCkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgZGV0ID0gMS4wIC8gZGV0O1xuXG4gICAgb3V0WzBdID0gYjAxICogZGV0O1xuICAgIG91dFsxXSA9ICgtYTIyICogYTAxICsgYTAyICogYTIxKSAqIGRldDtcbiAgICBvdXRbMl0gPSAoYTEyICogYTAxIC0gYTAyICogYTExKSAqIGRldDtcbiAgICBvdXRbM10gPSBiMTEgKiBkZXQ7XG4gICAgb3V0WzRdID0gKGEyMiAqIGEwMCAtIGEwMiAqIGEyMCkgKiBkZXQ7XG4gICAgb3V0WzVdID0gKC1hMTIgKiBhMDAgKyBhMDIgKiBhMTApICogZGV0O1xuICAgIG91dFs2XSA9IGIyMSAqIGRldDtcbiAgICBvdXRbN10gPSAoLWEyMSAqIGEwMCArIGEwMSAqIGEyMCkgKiBkZXQ7XG4gICAgb3V0WzhdID0gKGExMSAqIGEwMCAtIGEwMSAqIGExMCkgKiBkZXQ7XG4gICAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBkZXRlcm1pbmFudCBvZiBhIG1hdDNcbiAqXG4gKiBAcGFyYW0ge21hdDN9IGEgdGhlIHNvdXJjZSBtYXRyaXhcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IGRldGVybWluYW50IG9mIGFcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRldGVybWluYW50KGEpIHtcbiAgICBsZXQgYTAwID0gYVswXSxcbiAgICAgICAgYTAxID0gYVsxXSxcbiAgICAgICAgYTAyID0gYVsyXTtcbiAgICBsZXQgYTEwID0gYVszXSxcbiAgICAgICAgYTExID0gYVs0XSxcbiAgICAgICAgYTEyID0gYVs1XTtcbiAgICBsZXQgYTIwID0gYVs2XSxcbiAgICAgICAgYTIxID0gYVs3XSxcbiAgICAgICAgYTIyID0gYVs4XTtcblxuICAgIHJldHVybiBhMDAgKiAoYTIyICogYTExIC0gYTEyICogYTIxKSArIGEwMSAqICgtYTIyICogYTEwICsgYTEyICogYTIwKSArIGEwMiAqIChhMjEgKiBhMTAgLSBhMTEgKiBhMjApO1xufVxuXG4vKipcbiAqIE11bHRpcGxpZXMgdHdvIG1hdDMnc1xuICpcbiAqIEBwYXJhbSB7bWF0M30gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7bWF0M30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHttYXQzfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG11bHRpcGx5KG91dCwgYSwgYikge1xuICAgIGxldCBhMDAgPSBhWzBdLFxuICAgICAgICBhMDEgPSBhWzFdLFxuICAgICAgICBhMDIgPSBhWzJdO1xuICAgIGxldCBhMTAgPSBhWzNdLFxuICAgICAgICBhMTEgPSBhWzRdLFxuICAgICAgICBhMTIgPSBhWzVdO1xuICAgIGxldCBhMjAgPSBhWzZdLFxuICAgICAgICBhMjEgPSBhWzddLFxuICAgICAgICBhMjIgPSBhWzhdO1xuXG4gICAgbGV0IGIwMCA9IGJbMF0sXG4gICAgICAgIGIwMSA9IGJbMV0sXG4gICAgICAgIGIwMiA9IGJbMl07XG4gICAgbGV0IGIxMCA9IGJbM10sXG4gICAgICAgIGIxMSA9IGJbNF0sXG4gICAgICAgIGIxMiA9IGJbNV07XG4gICAgbGV0IGIyMCA9IGJbNl0sXG4gICAgICAgIGIyMSA9IGJbN10sXG4gICAgICAgIGIyMiA9IGJbOF07XG5cbiAgICBvdXRbMF0gPSBiMDAgKiBhMDAgKyBiMDEgKiBhMTAgKyBiMDIgKiBhMjA7XG4gICAgb3V0WzFdID0gYjAwICogYTAxICsgYjAxICogYTExICsgYjAyICogYTIxO1xuICAgIG91dFsyXSA9IGIwMCAqIGEwMiArIGIwMSAqIGExMiArIGIwMiAqIGEyMjtcblxuICAgIG91dFszXSA9IGIxMCAqIGEwMCArIGIxMSAqIGExMCArIGIxMiAqIGEyMDtcbiAgICBvdXRbNF0gPSBiMTAgKiBhMDEgKyBiMTEgKiBhMTEgKyBiMTIgKiBhMjE7XG4gICAgb3V0WzVdID0gYjEwICogYTAyICsgYjExICogYTEyICsgYjEyICogYTIyO1xuXG4gICAgb3V0WzZdID0gYjIwICogYTAwICsgYjIxICogYTEwICsgYjIyICogYTIwO1xuICAgIG91dFs3XSA9IGIyMCAqIGEwMSArIGIyMSAqIGExMSArIGIyMiAqIGEyMTtcbiAgICBvdXRbOF0gPSBiMjAgKiBhMDIgKyBiMjEgKiBhMTIgKyBiMjIgKiBhMjI7XG4gICAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBUcmFuc2xhdGUgYSBtYXQzIGJ5IHRoZSBnaXZlbiB2ZWN0b3JcbiAqXG4gKiBAcGFyYW0ge21hdDN9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQzfSBhIHRoZSBtYXRyaXggdG8gdHJhbnNsYXRlXG4gKiBAcGFyYW0ge3ZlYzJ9IHYgdmVjdG9yIHRvIHRyYW5zbGF0ZSBieVxuICogQHJldHVybnMge21hdDN9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gdHJhbnNsYXRlKG91dCwgYSwgdikge1xuICAgIGxldCBhMDAgPSBhWzBdLFxuICAgICAgICBhMDEgPSBhWzFdLFxuICAgICAgICBhMDIgPSBhWzJdLFxuICAgICAgICBhMTAgPSBhWzNdLFxuICAgICAgICBhMTEgPSBhWzRdLFxuICAgICAgICBhMTIgPSBhWzVdLFxuICAgICAgICBhMjAgPSBhWzZdLFxuICAgICAgICBhMjEgPSBhWzddLFxuICAgICAgICBhMjIgPSBhWzhdLFxuICAgICAgICB4ID0gdlswXSxcbiAgICAgICAgeSA9IHZbMV07XG5cbiAgICBvdXRbMF0gPSBhMDA7XG4gICAgb3V0WzFdID0gYTAxO1xuICAgIG91dFsyXSA9IGEwMjtcblxuICAgIG91dFszXSA9IGExMDtcbiAgICBvdXRbNF0gPSBhMTE7XG4gICAgb3V0WzVdID0gYTEyO1xuXG4gICAgb3V0WzZdID0geCAqIGEwMCArIHkgKiBhMTAgKyBhMjA7XG4gICAgb3V0WzddID0geCAqIGEwMSArIHkgKiBhMTEgKyBhMjE7XG4gICAgb3V0WzhdID0geCAqIGEwMiArIHkgKiBhMTIgKyBhMjI7XG4gICAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBSb3RhdGVzIGEgbWF0MyBieSB0aGUgZ2l2ZW4gYW5nbGVcbiAqXG4gKiBAcGFyYW0ge21hdDN9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQzfSBhIHRoZSBtYXRyaXggdG8gcm90YXRlXG4gKiBAcGFyYW0ge051bWJlcn0gcmFkIHRoZSBhbmdsZSB0byByb3RhdGUgdGhlIG1hdHJpeCBieVxuICogQHJldHVybnMge21hdDN9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gcm90YXRlKG91dCwgYSwgcmFkKSB7XG4gICAgbGV0IGEwMCA9IGFbMF0sXG4gICAgICAgIGEwMSA9IGFbMV0sXG4gICAgICAgIGEwMiA9IGFbMl0sXG4gICAgICAgIGExMCA9IGFbM10sXG4gICAgICAgIGExMSA9IGFbNF0sXG4gICAgICAgIGExMiA9IGFbNV0sXG4gICAgICAgIGEyMCA9IGFbNl0sXG4gICAgICAgIGEyMSA9IGFbN10sXG4gICAgICAgIGEyMiA9IGFbOF0sXG4gICAgICAgIHMgPSBNYXRoLnNpbihyYWQpLFxuICAgICAgICBjID0gTWF0aC5jb3MocmFkKTtcblxuICAgIG91dFswXSA9IGMgKiBhMDAgKyBzICogYTEwO1xuICAgIG91dFsxXSA9IGMgKiBhMDEgKyBzICogYTExO1xuICAgIG91dFsyXSA9IGMgKiBhMDIgKyBzICogYTEyO1xuXG4gICAgb3V0WzNdID0gYyAqIGExMCAtIHMgKiBhMDA7XG4gICAgb3V0WzRdID0gYyAqIGExMSAtIHMgKiBhMDE7XG4gICAgb3V0WzVdID0gYyAqIGExMiAtIHMgKiBhMDI7XG5cbiAgICBvdXRbNl0gPSBhMjA7XG4gICAgb3V0WzddID0gYTIxO1xuICAgIG91dFs4XSA9IGEyMjtcbiAgICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFNjYWxlcyB0aGUgbWF0MyBieSB0aGUgZGltZW5zaW9ucyBpbiB0aGUgZ2l2ZW4gdmVjMlxuICpcbiAqIEBwYXJhbSB7bWF0M30gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDN9IGEgdGhlIG1hdHJpeCB0byByb3RhdGVcbiAqIEBwYXJhbSB7dmVjMn0gdiB0aGUgdmVjMiB0byBzY2FsZSB0aGUgbWF0cml4IGJ5XG4gKiBAcmV0dXJucyB7bWF0M30gb3V0XG4gKiovXG5leHBvcnQgZnVuY3Rpb24gc2NhbGUob3V0LCBhLCB2KSB7XG4gICAgbGV0IHggPSB2WzBdLFxuICAgICAgICB5ID0gdlsxXTtcblxuICAgIG91dFswXSA9IHggKiBhWzBdO1xuICAgIG91dFsxXSA9IHggKiBhWzFdO1xuICAgIG91dFsyXSA9IHggKiBhWzJdO1xuXG4gICAgb3V0WzNdID0geSAqIGFbM107XG4gICAgb3V0WzRdID0geSAqIGFbNF07XG4gICAgb3V0WzVdID0geSAqIGFbNV07XG5cbiAgICBvdXRbNl0gPSBhWzZdO1xuICAgIG91dFs3XSA9IGFbN107XG4gICAgb3V0WzhdID0gYVs4XTtcbiAgICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIENhbGN1bGF0ZXMgYSAzeDMgbm9ybWFsIG1hdHJpeCAodHJhbnNwb3NlIGludmVyc2UpIGZyb20gdGhlIDR4NCBtYXRyaXhcbiAqXG4gKiBAcGFyYW0ge21hdDN9IG91dCBtYXQzIHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XG4gKiBAcGFyYW0ge21hdDR9IGEgTWF0NCB0byBkZXJpdmUgdGhlIG5vcm1hbCBtYXRyaXggZnJvbVxuICpcbiAqIEByZXR1cm5zIHttYXQzfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG5vcm1hbEZyb21NYXQ0KG91dCwgYSkge1xuICAgIGxldCBhMDAgPSBhWzBdLFxuICAgICAgICBhMDEgPSBhWzFdLFxuICAgICAgICBhMDIgPSBhWzJdLFxuICAgICAgICBhMDMgPSBhWzNdO1xuICAgIGxldCBhMTAgPSBhWzRdLFxuICAgICAgICBhMTEgPSBhWzVdLFxuICAgICAgICBhMTIgPSBhWzZdLFxuICAgICAgICBhMTMgPSBhWzddO1xuICAgIGxldCBhMjAgPSBhWzhdLFxuICAgICAgICBhMjEgPSBhWzldLFxuICAgICAgICBhMjIgPSBhWzEwXSxcbiAgICAgICAgYTIzID0gYVsxMV07XG4gICAgbGV0IGEzMCA9IGFbMTJdLFxuICAgICAgICBhMzEgPSBhWzEzXSxcbiAgICAgICAgYTMyID0gYVsxNF0sXG4gICAgICAgIGEzMyA9IGFbMTVdO1xuXG4gICAgbGV0IGIwMCA9IGEwMCAqIGExMSAtIGEwMSAqIGExMDtcbiAgICBsZXQgYjAxID0gYTAwICogYTEyIC0gYTAyICogYTEwO1xuICAgIGxldCBiMDIgPSBhMDAgKiBhMTMgLSBhMDMgKiBhMTA7XG4gICAgbGV0IGIwMyA9IGEwMSAqIGExMiAtIGEwMiAqIGExMTtcbiAgICBsZXQgYjA0ID0gYTAxICogYTEzIC0gYTAzICogYTExO1xuICAgIGxldCBiMDUgPSBhMDIgKiBhMTMgLSBhMDMgKiBhMTI7XG4gICAgbGV0IGIwNiA9IGEyMCAqIGEzMSAtIGEyMSAqIGEzMDtcbiAgICBsZXQgYjA3ID0gYTIwICogYTMyIC0gYTIyICogYTMwO1xuICAgIGxldCBiMDggPSBhMjAgKiBhMzMgLSBhMjMgKiBhMzA7XG4gICAgbGV0IGIwOSA9IGEyMSAqIGEzMiAtIGEyMiAqIGEzMTtcbiAgICBsZXQgYjEwID0gYTIxICogYTMzIC0gYTIzICogYTMxO1xuICAgIGxldCBiMTEgPSBhMjIgKiBhMzMgLSBhMjMgKiBhMzI7XG5cbiAgICAvLyBDYWxjdWxhdGUgdGhlIGRldGVybWluYW50XG4gICAgbGV0IGRldCA9IGIwMCAqIGIxMSAtIGIwMSAqIGIxMCArIGIwMiAqIGIwOSArIGIwMyAqIGIwOCAtIGIwNCAqIGIwNyArIGIwNSAqIGIwNjtcblxuICAgIGlmICghZGV0KSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBkZXQgPSAxLjAgLyBkZXQ7XG5cbiAgICBvdXRbMF0gPSAoYTExICogYjExIC0gYTEyICogYjEwICsgYTEzICogYjA5KSAqIGRldDtcbiAgICBvdXRbMV0gPSAoYTEyICogYjA4IC0gYTEwICogYjExIC0gYTEzICogYjA3KSAqIGRldDtcbiAgICBvdXRbMl0gPSAoYTEwICogYjEwIC0gYTExICogYjA4ICsgYTEzICogYjA2KSAqIGRldDtcblxuICAgIG91dFszXSA9IChhMDIgKiBiMTAgLSBhMDEgKiBiMTEgLSBhMDMgKiBiMDkpICogZGV0O1xuICAgIG91dFs0XSA9IChhMDAgKiBiMTEgLSBhMDIgKiBiMDggKyBhMDMgKiBiMDcpICogZGV0O1xuICAgIG91dFs1XSA9IChhMDEgKiBiMDggLSBhMDAgKiBiMTAgLSBhMDMgKiBiMDYpICogZGV0O1xuXG4gICAgb3V0WzZdID0gKGEzMSAqIGIwNSAtIGEzMiAqIGIwNCArIGEzMyAqIGIwMykgKiBkZXQ7XG4gICAgb3V0WzddID0gKGEzMiAqIGIwMiAtIGEzMCAqIGIwNSAtIGEzMyAqIGIwMSkgKiBkZXQ7XG4gICAgb3V0WzhdID0gKGEzMCAqIGIwNCAtIGEzMSAqIGIwMiArIGEzMyAqIGIwMCkgKiBkZXQ7XG5cbiAgICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIEdlbmVyYXRlcyBhIDJEIHByb2plY3Rpb24gbWF0cml4IHdpdGggdGhlIGdpdmVuIGJvdW5kc1xuICpcbiAqIEBwYXJhbSB7bWF0M30gb3V0IG1hdDMgZnJ1c3R1bSBtYXRyaXggd2lsbCBiZSB3cml0dGVuIGludG9cbiAqIEBwYXJhbSB7bnVtYmVyfSB3aWR0aCBXaWR0aCBvZiB5b3VyIGdsIGNvbnRleHRcbiAqIEBwYXJhbSB7bnVtYmVyfSBoZWlnaHQgSGVpZ2h0IG9mIGdsIGNvbnRleHRcbiAqIEByZXR1cm5zIHttYXQzfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHByb2plY3Rpb24ob3V0LCB3aWR0aCwgaGVpZ2h0KSB7XG4gICAgb3V0WzBdID0gMiAvIHdpZHRoO1xuICAgIG91dFsxXSA9IDA7XG4gICAgb3V0WzJdID0gMDtcbiAgICBvdXRbM10gPSAwO1xuICAgIG91dFs0XSA9IC0yIC8gaGVpZ2h0O1xuICAgIG91dFs1XSA9IDA7XG4gICAgb3V0WzZdID0gLTE7XG4gICAgb3V0WzddID0gMTtcbiAgICBvdXRbOF0gPSAxO1xuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogQWRkcyB0d28gbWF0MydzXG4gKlxuICogQHBhcmFtIHttYXQzfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0M30gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHttYXQzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge21hdDN9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gYWRkKG91dCwgYSwgYikge1xuICAgIG91dFswXSA9IGFbMF0gKyBiWzBdO1xuICAgIG91dFsxXSA9IGFbMV0gKyBiWzFdO1xuICAgIG91dFsyXSA9IGFbMl0gKyBiWzJdO1xuICAgIG91dFszXSA9IGFbM10gKyBiWzNdO1xuICAgIG91dFs0XSA9IGFbNF0gKyBiWzRdO1xuICAgIG91dFs1XSA9IGFbNV0gKyBiWzVdO1xuICAgIG91dFs2XSA9IGFbNl0gKyBiWzZdO1xuICAgIG91dFs3XSA9IGFbN10gKyBiWzddO1xuICAgIG91dFs4XSA9IGFbOF0gKyBiWzhdO1xuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogU3VidHJhY3RzIG1hdHJpeCBiIGZyb20gbWF0cml4IGFcbiAqXG4gKiBAcGFyYW0ge21hdDN9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge21hdDN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7bWF0M30gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzdWJ0cmFjdChvdXQsIGEsIGIpIHtcbiAgICBvdXRbMF0gPSBhWzBdIC0gYlswXTtcbiAgICBvdXRbMV0gPSBhWzFdIC0gYlsxXTtcbiAgICBvdXRbMl0gPSBhWzJdIC0gYlsyXTtcbiAgICBvdXRbM10gPSBhWzNdIC0gYlszXTtcbiAgICBvdXRbNF0gPSBhWzRdIC0gYls0XTtcbiAgICBvdXRbNV0gPSBhWzVdIC0gYls1XTtcbiAgICBvdXRbNl0gPSBhWzZdIC0gYls2XTtcbiAgICBvdXRbN10gPSBhWzddIC0gYls3XTtcbiAgICBvdXRbOF0gPSBhWzhdIC0gYls4XTtcbiAgICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIE11bHRpcGx5IGVhY2ggZWxlbWVudCBvZiB0aGUgbWF0cml4IGJ5IGEgc2NhbGFyLlxuICpcbiAqIEBwYXJhbSB7bWF0M30gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDN9IGEgdGhlIG1hdHJpeCB0byBzY2FsZVxuICogQHBhcmFtIHtOdW1iZXJ9IGIgYW1vdW50IHRvIHNjYWxlIHRoZSBtYXRyaXgncyBlbGVtZW50cyBieVxuICogQHJldHVybnMge21hdDN9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gbXVsdGlwbHlTY2FsYXIob3V0LCBhLCBiKSB7XG4gICAgb3V0WzBdID0gYVswXSAqIGI7XG4gICAgb3V0WzFdID0gYVsxXSAqIGI7XG4gICAgb3V0WzJdID0gYVsyXSAqIGI7XG4gICAgb3V0WzNdID0gYVszXSAqIGI7XG4gICAgb3V0WzRdID0gYVs0XSAqIGI7XG4gICAgb3V0WzVdID0gYVs1XSAqIGI7XG4gICAgb3V0WzZdID0gYVs2XSAqIGI7XG4gICAgb3V0WzddID0gYVs3XSAqIGI7XG4gICAgb3V0WzhdID0gYVs4XSAqIGI7XG4gICAgcmV0dXJuIG91dDtcbn1cbiIsImNvbnN0IEVQU0lMT04gPSAwLjAwMDAwMTtcblxuLyoqXG4gKiBDb3B5IHRoZSB2YWx1ZXMgZnJvbSBvbmUgbWF0NCB0byBhbm90aGVyXG4gKlxuICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0NH0gYSB0aGUgc291cmNlIG1hdHJpeFxuICogQHJldHVybnMge21hdDR9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gY29weShvdXQsIGEpIHtcbiAgICBvdXRbMF0gPSBhWzBdO1xuICAgIG91dFsxXSA9IGFbMV07XG4gICAgb3V0WzJdID0gYVsyXTtcbiAgICBvdXRbM10gPSBhWzNdO1xuICAgIG91dFs0XSA9IGFbNF07XG4gICAgb3V0WzVdID0gYVs1XTtcbiAgICBvdXRbNl0gPSBhWzZdO1xuICAgIG91dFs3XSA9IGFbN107XG4gICAgb3V0WzhdID0gYVs4XTtcbiAgICBvdXRbOV0gPSBhWzldO1xuICAgIG91dFsxMF0gPSBhWzEwXTtcbiAgICBvdXRbMTFdID0gYVsxMV07XG4gICAgb3V0WzEyXSA9IGFbMTJdO1xuICAgIG91dFsxM10gPSBhWzEzXTtcbiAgICBvdXRbMTRdID0gYVsxNF07XG4gICAgb3V0WzE1XSA9IGFbMTVdO1xuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogU2V0IHRoZSBjb21wb25lbnRzIG9mIGEgbWF0NCB0byB0aGUgZ2l2ZW4gdmFsdWVzXG4gKlxuICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNldChvdXQsIG0wMCwgbTAxLCBtMDIsIG0wMywgbTEwLCBtMTEsIG0xMiwgbTEzLCBtMjAsIG0yMSwgbTIyLCBtMjMsIG0zMCwgbTMxLCBtMzIsIG0zMykge1xuICAgIG91dFswXSA9IG0wMDtcbiAgICBvdXRbMV0gPSBtMDE7XG4gICAgb3V0WzJdID0gbTAyO1xuICAgIG91dFszXSA9IG0wMztcbiAgICBvdXRbNF0gPSBtMTA7XG4gICAgb3V0WzVdID0gbTExO1xuICAgIG91dFs2XSA9IG0xMjtcbiAgICBvdXRbN10gPSBtMTM7XG4gICAgb3V0WzhdID0gbTIwO1xuICAgIG91dFs5XSA9IG0yMTtcbiAgICBvdXRbMTBdID0gbTIyO1xuICAgIG91dFsxMV0gPSBtMjM7XG4gICAgb3V0WzEyXSA9IG0zMDtcbiAgICBvdXRbMTNdID0gbTMxO1xuICAgIG91dFsxNF0gPSBtMzI7XG4gICAgb3V0WzE1XSA9IG0zMztcbiAgICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFNldCBhIG1hdDQgdG8gdGhlIGlkZW50aXR5IG1hdHJpeFxuICpcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpZGVudGl0eShvdXQpIHtcbiAgICBvdXRbMF0gPSAxO1xuICAgIG91dFsxXSA9IDA7XG4gICAgb3V0WzJdID0gMDtcbiAgICBvdXRbM10gPSAwO1xuICAgIG91dFs0XSA9IDA7XG4gICAgb3V0WzVdID0gMTtcbiAgICBvdXRbNl0gPSAwO1xuICAgIG91dFs3XSA9IDA7XG4gICAgb3V0WzhdID0gMDtcbiAgICBvdXRbOV0gPSAwO1xuICAgIG91dFsxMF0gPSAxO1xuICAgIG91dFsxMV0gPSAwO1xuICAgIG91dFsxMl0gPSAwO1xuICAgIG91dFsxM10gPSAwO1xuICAgIG91dFsxNF0gPSAwO1xuICAgIG91dFsxNV0gPSAxO1xuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogVHJhbnNwb3NlIHRoZSB2YWx1ZXMgb2YgYSBtYXQ0XG4gKlxuICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0NH0gYSB0aGUgc291cmNlIG1hdHJpeFxuICogQHJldHVybnMge21hdDR9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gdHJhbnNwb3NlKG91dCwgYSkge1xuICAgIC8vIElmIHdlIGFyZSB0cmFuc3Bvc2luZyBvdXJzZWx2ZXMgd2UgY2FuIHNraXAgYSBmZXcgc3RlcHMgYnV0IGhhdmUgdG8gY2FjaGUgc29tZSB2YWx1ZXNcbiAgICBpZiAob3V0ID09PSBhKSB7XG4gICAgICAgIGxldCBhMDEgPSBhWzFdLFxuICAgICAgICAgICAgYTAyID0gYVsyXSxcbiAgICAgICAgICAgIGEwMyA9IGFbM107XG4gICAgICAgIGxldCBhMTIgPSBhWzZdLFxuICAgICAgICAgICAgYTEzID0gYVs3XTtcbiAgICAgICAgbGV0IGEyMyA9IGFbMTFdO1xuXG4gICAgICAgIG91dFsxXSA9IGFbNF07XG4gICAgICAgIG91dFsyXSA9IGFbOF07XG4gICAgICAgIG91dFszXSA9IGFbMTJdO1xuICAgICAgICBvdXRbNF0gPSBhMDE7XG4gICAgICAgIG91dFs2XSA9IGFbOV07XG4gICAgICAgIG91dFs3XSA9IGFbMTNdO1xuICAgICAgICBvdXRbOF0gPSBhMDI7XG4gICAgICAgIG91dFs5XSA9IGExMjtcbiAgICAgICAgb3V0WzExXSA9IGFbMTRdO1xuICAgICAgICBvdXRbMTJdID0gYTAzO1xuICAgICAgICBvdXRbMTNdID0gYTEzO1xuICAgICAgICBvdXRbMTRdID0gYTIzO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIG91dFswXSA9IGFbMF07XG4gICAgICAgIG91dFsxXSA9IGFbNF07XG4gICAgICAgIG91dFsyXSA9IGFbOF07XG4gICAgICAgIG91dFszXSA9IGFbMTJdO1xuICAgICAgICBvdXRbNF0gPSBhWzFdO1xuICAgICAgICBvdXRbNV0gPSBhWzVdO1xuICAgICAgICBvdXRbNl0gPSBhWzldO1xuICAgICAgICBvdXRbN10gPSBhWzEzXTtcbiAgICAgICAgb3V0WzhdID0gYVsyXTtcbiAgICAgICAgb3V0WzldID0gYVs2XTtcbiAgICAgICAgb3V0WzEwXSA9IGFbMTBdO1xuICAgICAgICBvdXRbMTFdID0gYVsxNF07XG4gICAgICAgIG91dFsxMl0gPSBhWzNdO1xuICAgICAgICBvdXRbMTNdID0gYVs3XTtcbiAgICAgICAgb3V0WzE0XSA9IGFbMTFdO1xuICAgICAgICBvdXRbMTVdID0gYVsxNV07XG4gICAgfVxuXG4gICAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBJbnZlcnRzIGEgbWF0NFxuICpcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDR9IGEgdGhlIHNvdXJjZSBtYXRyaXhcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGludmVydChvdXQsIGEpIHtcbiAgICBsZXQgYTAwID0gYVswXSxcbiAgICAgICAgYTAxID0gYVsxXSxcbiAgICAgICAgYTAyID0gYVsyXSxcbiAgICAgICAgYTAzID0gYVszXTtcbiAgICBsZXQgYTEwID0gYVs0XSxcbiAgICAgICAgYTExID0gYVs1XSxcbiAgICAgICAgYTEyID0gYVs2XSxcbiAgICAgICAgYTEzID0gYVs3XTtcbiAgICBsZXQgYTIwID0gYVs4XSxcbiAgICAgICAgYTIxID0gYVs5XSxcbiAgICAgICAgYTIyID0gYVsxMF0sXG4gICAgICAgIGEyMyA9IGFbMTFdO1xuICAgIGxldCBhMzAgPSBhWzEyXSxcbiAgICAgICAgYTMxID0gYVsxM10sXG4gICAgICAgIGEzMiA9IGFbMTRdLFxuICAgICAgICBhMzMgPSBhWzE1XTtcblxuICAgIGxldCBiMDAgPSBhMDAgKiBhMTEgLSBhMDEgKiBhMTA7XG4gICAgbGV0IGIwMSA9IGEwMCAqIGExMiAtIGEwMiAqIGExMDtcbiAgICBsZXQgYjAyID0gYTAwICogYTEzIC0gYTAzICogYTEwO1xuICAgIGxldCBiMDMgPSBhMDEgKiBhMTIgLSBhMDIgKiBhMTE7XG4gICAgbGV0IGIwNCA9IGEwMSAqIGExMyAtIGEwMyAqIGExMTtcbiAgICBsZXQgYjA1ID0gYTAyICogYTEzIC0gYTAzICogYTEyO1xuICAgIGxldCBiMDYgPSBhMjAgKiBhMzEgLSBhMjEgKiBhMzA7XG4gICAgbGV0IGIwNyA9IGEyMCAqIGEzMiAtIGEyMiAqIGEzMDtcbiAgICBsZXQgYjA4ID0gYTIwICogYTMzIC0gYTIzICogYTMwO1xuICAgIGxldCBiMDkgPSBhMjEgKiBhMzIgLSBhMjIgKiBhMzE7XG4gICAgbGV0IGIxMCA9IGEyMSAqIGEzMyAtIGEyMyAqIGEzMTtcbiAgICBsZXQgYjExID0gYTIyICogYTMzIC0gYTIzICogYTMyO1xuXG4gICAgLy8gQ2FsY3VsYXRlIHRoZSBkZXRlcm1pbmFudFxuICAgIGxldCBkZXQgPSBiMDAgKiBiMTEgLSBiMDEgKiBiMTAgKyBiMDIgKiBiMDkgKyBiMDMgKiBiMDggLSBiMDQgKiBiMDcgKyBiMDUgKiBiMDY7XG5cbiAgICBpZiAoIWRldCkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgZGV0ID0gMS4wIC8gZGV0O1xuXG4gICAgb3V0WzBdID0gKGExMSAqIGIxMSAtIGExMiAqIGIxMCArIGExMyAqIGIwOSkgKiBkZXQ7XG4gICAgb3V0WzFdID0gKGEwMiAqIGIxMCAtIGEwMSAqIGIxMSAtIGEwMyAqIGIwOSkgKiBkZXQ7XG4gICAgb3V0WzJdID0gKGEzMSAqIGIwNSAtIGEzMiAqIGIwNCArIGEzMyAqIGIwMykgKiBkZXQ7XG4gICAgb3V0WzNdID0gKGEyMiAqIGIwNCAtIGEyMSAqIGIwNSAtIGEyMyAqIGIwMykgKiBkZXQ7XG4gICAgb3V0WzRdID0gKGExMiAqIGIwOCAtIGExMCAqIGIxMSAtIGExMyAqIGIwNykgKiBkZXQ7XG4gICAgb3V0WzVdID0gKGEwMCAqIGIxMSAtIGEwMiAqIGIwOCArIGEwMyAqIGIwNykgKiBkZXQ7XG4gICAgb3V0WzZdID0gKGEzMiAqIGIwMiAtIGEzMCAqIGIwNSAtIGEzMyAqIGIwMSkgKiBkZXQ7XG4gICAgb3V0WzddID0gKGEyMCAqIGIwNSAtIGEyMiAqIGIwMiArIGEyMyAqIGIwMSkgKiBkZXQ7XG4gICAgb3V0WzhdID0gKGExMCAqIGIxMCAtIGExMSAqIGIwOCArIGExMyAqIGIwNikgKiBkZXQ7XG4gICAgb3V0WzldID0gKGEwMSAqIGIwOCAtIGEwMCAqIGIxMCAtIGEwMyAqIGIwNikgKiBkZXQ7XG4gICAgb3V0WzEwXSA9IChhMzAgKiBiMDQgLSBhMzEgKiBiMDIgKyBhMzMgKiBiMDApICogZGV0O1xuICAgIG91dFsxMV0gPSAoYTIxICogYjAyIC0gYTIwICogYjA0IC0gYTIzICogYjAwKSAqIGRldDtcbiAgICBvdXRbMTJdID0gKGExMSAqIGIwNyAtIGExMCAqIGIwOSAtIGExMiAqIGIwNikgKiBkZXQ7XG4gICAgb3V0WzEzXSA9IChhMDAgKiBiMDkgLSBhMDEgKiBiMDcgKyBhMDIgKiBiMDYpICogZGV0O1xuICAgIG91dFsxNF0gPSAoYTMxICogYjAxIC0gYTMwICogYjAzIC0gYTMyICogYjAwKSAqIGRldDtcbiAgICBvdXRbMTVdID0gKGEyMCAqIGIwMyAtIGEyMSAqIGIwMSArIGEyMiAqIGIwMCkgKiBkZXQ7XG5cbiAgICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGRldGVybWluYW50IG9mIGEgbWF0NFxuICpcbiAqIEBwYXJhbSB7bWF0NH0gYSB0aGUgc291cmNlIG1hdHJpeFxuICogQHJldHVybnMge051bWJlcn0gZGV0ZXJtaW5hbnQgb2YgYVxuICovXG5leHBvcnQgZnVuY3Rpb24gZGV0ZXJtaW5hbnQoYSkge1xuICAgIGxldCBhMDAgPSBhWzBdLFxuICAgICAgICBhMDEgPSBhWzFdLFxuICAgICAgICBhMDIgPSBhWzJdLFxuICAgICAgICBhMDMgPSBhWzNdO1xuICAgIGxldCBhMTAgPSBhWzRdLFxuICAgICAgICBhMTEgPSBhWzVdLFxuICAgICAgICBhMTIgPSBhWzZdLFxuICAgICAgICBhMTMgPSBhWzddO1xuICAgIGxldCBhMjAgPSBhWzhdLFxuICAgICAgICBhMjEgPSBhWzldLFxuICAgICAgICBhMjIgPSBhWzEwXSxcbiAgICAgICAgYTIzID0gYVsxMV07XG4gICAgbGV0IGEzMCA9IGFbMTJdLFxuICAgICAgICBhMzEgPSBhWzEzXSxcbiAgICAgICAgYTMyID0gYVsxNF0sXG4gICAgICAgIGEzMyA9IGFbMTVdO1xuXG4gICAgbGV0IGIwMCA9IGEwMCAqIGExMSAtIGEwMSAqIGExMDtcbiAgICBsZXQgYjAxID0gYTAwICogYTEyIC0gYTAyICogYTEwO1xuICAgIGxldCBiMDIgPSBhMDAgKiBhMTMgLSBhMDMgKiBhMTA7XG4gICAgbGV0IGIwMyA9IGEwMSAqIGExMiAtIGEwMiAqIGExMTtcbiAgICBsZXQgYjA0ID0gYTAxICogYTEzIC0gYTAzICogYTExO1xuICAgIGxldCBiMDUgPSBhMDIgKiBhMTMgLSBhMDMgKiBhMTI7XG4gICAgbGV0IGIwNiA9IGEyMCAqIGEzMSAtIGEyMSAqIGEzMDtcbiAgICBsZXQgYjA3ID0gYTIwICogYTMyIC0gYTIyICogYTMwO1xuICAgIGxldCBiMDggPSBhMjAgKiBhMzMgLSBhMjMgKiBhMzA7XG4gICAgbGV0IGIwOSA9IGEyMSAqIGEzMiAtIGEyMiAqIGEzMTtcbiAgICBsZXQgYjEwID0gYTIxICogYTMzIC0gYTIzICogYTMxO1xuICAgIGxldCBiMTEgPSBhMjIgKiBhMzMgLSBhMjMgKiBhMzI7XG5cbiAgICAvLyBDYWxjdWxhdGUgdGhlIGRldGVybWluYW50XG4gICAgcmV0dXJuIGIwMCAqIGIxMSAtIGIwMSAqIGIxMCArIGIwMiAqIGIwOSArIGIwMyAqIGIwOCAtIGIwNCAqIGIwNyArIGIwNSAqIGIwNjtcbn1cblxuLyoqXG4gKiBNdWx0aXBsaWVzIHR3byBtYXQ0c1xuICpcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7bWF0NH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG11bHRpcGx5KG91dCwgYSwgYikge1xuICAgIGxldCBhMDAgPSBhWzBdLFxuICAgICAgICBhMDEgPSBhWzFdLFxuICAgICAgICBhMDIgPSBhWzJdLFxuICAgICAgICBhMDMgPSBhWzNdO1xuICAgIGxldCBhMTAgPSBhWzRdLFxuICAgICAgICBhMTEgPSBhWzVdLFxuICAgICAgICBhMTIgPSBhWzZdLFxuICAgICAgICBhMTMgPSBhWzddO1xuICAgIGxldCBhMjAgPSBhWzhdLFxuICAgICAgICBhMjEgPSBhWzldLFxuICAgICAgICBhMjIgPSBhWzEwXSxcbiAgICAgICAgYTIzID0gYVsxMV07XG4gICAgbGV0IGEzMCA9IGFbMTJdLFxuICAgICAgICBhMzEgPSBhWzEzXSxcbiAgICAgICAgYTMyID0gYVsxNF0sXG4gICAgICAgIGEzMyA9IGFbMTVdO1xuXG4gICAgLy8gQ2FjaGUgb25seSB0aGUgY3VycmVudCBsaW5lIG9mIHRoZSBzZWNvbmQgbWF0cml4XG4gICAgbGV0IGIwID0gYlswXSxcbiAgICAgICAgYjEgPSBiWzFdLFxuICAgICAgICBiMiA9IGJbMl0sXG4gICAgICAgIGIzID0gYlszXTtcbiAgICBvdXRbMF0gPSBiMCAqIGEwMCArIGIxICogYTEwICsgYjIgKiBhMjAgKyBiMyAqIGEzMDtcbiAgICBvdXRbMV0gPSBiMCAqIGEwMSArIGIxICogYTExICsgYjIgKiBhMjEgKyBiMyAqIGEzMTtcbiAgICBvdXRbMl0gPSBiMCAqIGEwMiArIGIxICogYTEyICsgYjIgKiBhMjIgKyBiMyAqIGEzMjtcbiAgICBvdXRbM10gPSBiMCAqIGEwMyArIGIxICogYTEzICsgYjIgKiBhMjMgKyBiMyAqIGEzMztcblxuICAgIGIwID0gYls0XTtcbiAgICBiMSA9IGJbNV07XG4gICAgYjIgPSBiWzZdO1xuICAgIGIzID0gYls3XTtcbiAgICBvdXRbNF0gPSBiMCAqIGEwMCArIGIxICogYTEwICsgYjIgKiBhMjAgKyBiMyAqIGEzMDtcbiAgICBvdXRbNV0gPSBiMCAqIGEwMSArIGIxICogYTExICsgYjIgKiBhMjEgKyBiMyAqIGEzMTtcbiAgICBvdXRbNl0gPSBiMCAqIGEwMiArIGIxICogYTEyICsgYjIgKiBhMjIgKyBiMyAqIGEzMjtcbiAgICBvdXRbN10gPSBiMCAqIGEwMyArIGIxICogYTEzICsgYjIgKiBhMjMgKyBiMyAqIGEzMztcblxuICAgIGIwID0gYls4XTtcbiAgICBiMSA9IGJbOV07XG4gICAgYjIgPSBiWzEwXTtcbiAgICBiMyA9IGJbMTFdO1xuICAgIG91dFs4XSA9IGIwICogYTAwICsgYjEgKiBhMTAgKyBiMiAqIGEyMCArIGIzICogYTMwO1xuICAgIG91dFs5XSA9IGIwICogYTAxICsgYjEgKiBhMTEgKyBiMiAqIGEyMSArIGIzICogYTMxO1xuICAgIG91dFsxMF0gPSBiMCAqIGEwMiArIGIxICogYTEyICsgYjIgKiBhMjIgKyBiMyAqIGEzMjtcbiAgICBvdXRbMTFdID0gYjAgKiBhMDMgKyBiMSAqIGExMyArIGIyICogYTIzICsgYjMgKiBhMzM7XG5cbiAgICBiMCA9IGJbMTJdO1xuICAgIGIxID0gYlsxM107XG4gICAgYjIgPSBiWzE0XTtcbiAgICBiMyA9IGJbMTVdO1xuICAgIG91dFsxMl0gPSBiMCAqIGEwMCArIGIxICogYTEwICsgYjIgKiBhMjAgKyBiMyAqIGEzMDtcbiAgICBvdXRbMTNdID0gYjAgKiBhMDEgKyBiMSAqIGExMSArIGIyICogYTIxICsgYjMgKiBhMzE7XG4gICAgb3V0WzE0XSA9IGIwICogYTAyICsgYjEgKiBhMTIgKyBiMiAqIGEyMiArIGIzICogYTMyO1xuICAgIG91dFsxNV0gPSBiMCAqIGEwMyArIGIxICogYTEzICsgYjIgKiBhMjMgKyBiMyAqIGEzMztcbiAgICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFRyYW5zbGF0ZSBhIG1hdDQgYnkgdGhlIGdpdmVuIHZlY3RvclxuICpcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDR9IGEgdGhlIG1hdHJpeCB0byB0cmFuc2xhdGVcbiAqIEBwYXJhbSB7dmVjM30gdiB2ZWN0b3IgdG8gdHJhbnNsYXRlIGJ5XG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0cmFuc2xhdGUob3V0LCBhLCB2KSB7XG4gICAgbGV0IHggPSB2WzBdLFxuICAgICAgICB5ID0gdlsxXSxcbiAgICAgICAgeiA9IHZbMl07XG4gICAgbGV0IGEwMCwgYTAxLCBhMDIsIGEwMztcbiAgICBsZXQgYTEwLCBhMTEsIGExMiwgYTEzO1xuICAgIGxldCBhMjAsIGEyMSwgYTIyLCBhMjM7XG5cbiAgICBpZiAoYSA9PT0gb3V0KSB7XG4gICAgICAgIG91dFsxMl0gPSBhWzBdICogeCArIGFbNF0gKiB5ICsgYVs4XSAqIHogKyBhWzEyXTtcbiAgICAgICAgb3V0WzEzXSA9IGFbMV0gKiB4ICsgYVs1XSAqIHkgKyBhWzldICogeiArIGFbMTNdO1xuICAgICAgICBvdXRbMTRdID0gYVsyXSAqIHggKyBhWzZdICogeSArIGFbMTBdICogeiArIGFbMTRdO1xuICAgICAgICBvdXRbMTVdID0gYVszXSAqIHggKyBhWzddICogeSArIGFbMTFdICogeiArIGFbMTVdO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGEwMCA9IGFbMF07XG4gICAgICAgIGEwMSA9IGFbMV07XG4gICAgICAgIGEwMiA9IGFbMl07XG4gICAgICAgIGEwMyA9IGFbM107XG4gICAgICAgIGExMCA9IGFbNF07XG4gICAgICAgIGExMSA9IGFbNV07XG4gICAgICAgIGExMiA9IGFbNl07XG4gICAgICAgIGExMyA9IGFbN107XG4gICAgICAgIGEyMCA9IGFbOF07XG4gICAgICAgIGEyMSA9IGFbOV07XG4gICAgICAgIGEyMiA9IGFbMTBdO1xuICAgICAgICBhMjMgPSBhWzExXTtcblxuICAgICAgICBvdXRbMF0gPSBhMDA7XG4gICAgICAgIG91dFsxXSA9IGEwMTtcbiAgICAgICAgb3V0WzJdID0gYTAyO1xuICAgICAgICBvdXRbM10gPSBhMDM7XG4gICAgICAgIG91dFs0XSA9IGExMDtcbiAgICAgICAgb3V0WzVdID0gYTExO1xuICAgICAgICBvdXRbNl0gPSBhMTI7XG4gICAgICAgIG91dFs3XSA9IGExMztcbiAgICAgICAgb3V0WzhdID0gYTIwO1xuICAgICAgICBvdXRbOV0gPSBhMjE7XG4gICAgICAgIG91dFsxMF0gPSBhMjI7XG4gICAgICAgIG91dFsxMV0gPSBhMjM7XG5cbiAgICAgICAgb3V0WzEyXSA9IGEwMCAqIHggKyBhMTAgKiB5ICsgYTIwICogeiArIGFbMTJdO1xuICAgICAgICBvdXRbMTNdID0gYTAxICogeCArIGExMSAqIHkgKyBhMjEgKiB6ICsgYVsxM107XG4gICAgICAgIG91dFsxNF0gPSBhMDIgKiB4ICsgYTEyICogeSArIGEyMiAqIHogKyBhWzE0XTtcbiAgICAgICAgb3V0WzE1XSA9IGEwMyAqIHggKyBhMTMgKiB5ICsgYTIzICogeiArIGFbMTVdO1xuICAgIH1cblxuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogU2NhbGVzIHRoZSBtYXQ0IGJ5IHRoZSBkaW1lbnNpb25zIGluIHRoZSBnaXZlbiB2ZWMzIG5vdCB1c2luZyB2ZWN0b3JpemF0aW9uXG4gKlxuICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0NH0gYSB0aGUgbWF0cml4IHRvIHNjYWxlXG4gKiBAcGFyYW0ge3ZlYzN9IHYgdGhlIHZlYzMgdG8gc2NhbGUgdGhlIG1hdHJpeCBieVxuICogQHJldHVybnMge21hdDR9IG91dFxuICoqL1xuZXhwb3J0IGZ1bmN0aW9uIHNjYWxlKG91dCwgYSwgdikge1xuICAgIGxldCB4ID0gdlswXSxcbiAgICAgICAgeSA9IHZbMV0sXG4gICAgICAgIHogPSB2WzJdO1xuXG4gICAgb3V0WzBdID0gYVswXSAqIHg7XG4gICAgb3V0WzFdID0gYVsxXSAqIHg7XG4gICAgb3V0WzJdID0gYVsyXSAqIHg7XG4gICAgb3V0WzNdID0gYVszXSAqIHg7XG4gICAgb3V0WzRdID0gYVs0XSAqIHk7XG4gICAgb3V0WzVdID0gYVs1XSAqIHk7XG4gICAgb3V0WzZdID0gYVs2XSAqIHk7XG4gICAgb3V0WzddID0gYVs3XSAqIHk7XG4gICAgb3V0WzhdID0gYVs4XSAqIHo7XG4gICAgb3V0WzldID0gYVs5XSAqIHo7XG4gICAgb3V0WzEwXSA9IGFbMTBdICogejtcbiAgICBvdXRbMTFdID0gYVsxMV0gKiB6O1xuICAgIG91dFsxMl0gPSBhWzEyXTtcbiAgICBvdXRbMTNdID0gYVsxM107XG4gICAgb3V0WzE0XSA9IGFbMTRdO1xuICAgIG91dFsxNV0gPSBhWzE1XTtcbiAgICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFJvdGF0ZXMgYSBtYXQ0IGJ5IHRoZSBnaXZlbiBhbmdsZSBhcm91bmQgdGhlIGdpdmVuIGF4aXNcbiAqXG4gKiBAcGFyYW0ge21hdDR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQ0fSBhIHRoZSBtYXRyaXggdG8gcm90YXRlXG4gKiBAcGFyYW0ge051bWJlcn0gcmFkIHRoZSBhbmdsZSB0byByb3RhdGUgdGhlIG1hdHJpeCBieVxuICogQHBhcmFtIHt2ZWMzfSBheGlzIHRoZSBheGlzIHRvIHJvdGF0ZSBhcm91bmRcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJvdGF0ZShvdXQsIGEsIHJhZCwgYXhpcykge1xuICAgIGxldCB4ID0gYXhpc1swXSxcbiAgICAgICAgeSA9IGF4aXNbMV0sXG4gICAgICAgIHogPSBheGlzWzJdO1xuICAgIGxldCBsZW4gPSBNYXRoLmh5cG90KHgsIHksIHopO1xuICAgIGxldCBzLCBjLCB0O1xuICAgIGxldCBhMDAsIGEwMSwgYTAyLCBhMDM7XG4gICAgbGV0IGExMCwgYTExLCBhMTIsIGExMztcbiAgICBsZXQgYTIwLCBhMjEsIGEyMiwgYTIzO1xuICAgIGxldCBiMDAsIGIwMSwgYjAyO1xuICAgIGxldCBiMTAsIGIxMSwgYjEyO1xuICAgIGxldCBiMjAsIGIyMSwgYjIyO1xuXG4gICAgaWYgKE1hdGguYWJzKGxlbikgPCBFUFNJTE9OKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGxlbiA9IDEgLyBsZW47XG4gICAgeCAqPSBsZW47XG4gICAgeSAqPSBsZW47XG4gICAgeiAqPSBsZW47XG5cbiAgICBzID0gTWF0aC5zaW4ocmFkKTtcbiAgICBjID0gTWF0aC5jb3MocmFkKTtcbiAgICB0ID0gMSAtIGM7XG5cbiAgICBhMDAgPSBhWzBdO1xuICAgIGEwMSA9IGFbMV07XG4gICAgYTAyID0gYVsyXTtcbiAgICBhMDMgPSBhWzNdO1xuICAgIGExMCA9IGFbNF07XG4gICAgYTExID0gYVs1XTtcbiAgICBhMTIgPSBhWzZdO1xuICAgIGExMyA9IGFbN107XG4gICAgYTIwID0gYVs4XTtcbiAgICBhMjEgPSBhWzldO1xuICAgIGEyMiA9IGFbMTBdO1xuICAgIGEyMyA9IGFbMTFdO1xuXG4gICAgLy8gQ29uc3RydWN0IHRoZSBlbGVtZW50cyBvZiB0aGUgcm90YXRpb24gbWF0cml4XG4gICAgYjAwID0geCAqIHggKiB0ICsgYztcbiAgICBiMDEgPSB5ICogeCAqIHQgKyB6ICogcztcbiAgICBiMDIgPSB6ICogeCAqIHQgLSB5ICogcztcbiAgICBiMTAgPSB4ICogeSAqIHQgLSB6ICogcztcbiAgICBiMTEgPSB5ICogeSAqIHQgKyBjO1xuICAgIGIxMiA9IHogKiB5ICogdCArIHggKiBzO1xuICAgIGIyMCA9IHggKiB6ICogdCArIHkgKiBzO1xuICAgIGIyMSA9IHkgKiB6ICogdCAtIHggKiBzO1xuICAgIGIyMiA9IHogKiB6ICogdCArIGM7XG5cbiAgICAvLyBQZXJmb3JtIHJvdGF0aW9uLXNwZWNpZmljIG1hdHJpeCBtdWx0aXBsaWNhdGlvblxuICAgIG91dFswXSA9IGEwMCAqIGIwMCArIGExMCAqIGIwMSArIGEyMCAqIGIwMjtcbiAgICBvdXRbMV0gPSBhMDEgKiBiMDAgKyBhMTEgKiBiMDEgKyBhMjEgKiBiMDI7XG4gICAgb3V0WzJdID0gYTAyICogYjAwICsgYTEyICogYjAxICsgYTIyICogYjAyO1xuICAgIG91dFszXSA9IGEwMyAqIGIwMCArIGExMyAqIGIwMSArIGEyMyAqIGIwMjtcbiAgICBvdXRbNF0gPSBhMDAgKiBiMTAgKyBhMTAgKiBiMTEgKyBhMjAgKiBiMTI7XG4gICAgb3V0WzVdID0gYTAxICogYjEwICsgYTExICogYjExICsgYTIxICogYjEyO1xuICAgIG91dFs2XSA9IGEwMiAqIGIxMCArIGExMiAqIGIxMSArIGEyMiAqIGIxMjtcbiAgICBvdXRbN10gPSBhMDMgKiBiMTAgKyBhMTMgKiBiMTEgKyBhMjMgKiBiMTI7XG4gICAgb3V0WzhdID0gYTAwICogYjIwICsgYTEwICogYjIxICsgYTIwICogYjIyO1xuICAgIG91dFs5XSA9IGEwMSAqIGIyMCArIGExMSAqIGIyMSArIGEyMSAqIGIyMjtcbiAgICBvdXRbMTBdID0gYTAyICogYjIwICsgYTEyICogYjIxICsgYTIyICogYjIyO1xuICAgIG91dFsxMV0gPSBhMDMgKiBiMjAgKyBhMTMgKiBiMjEgKyBhMjMgKiBiMjI7XG5cbiAgICBpZiAoYSAhPT0gb3V0KSB7XG4gICAgICAgIC8vIElmIHRoZSBzb3VyY2UgYW5kIGRlc3RpbmF0aW9uIGRpZmZlciwgY29weSB0aGUgdW5jaGFuZ2VkIGxhc3Qgcm93XG4gICAgICAgIG91dFsxMl0gPSBhWzEyXTtcbiAgICAgICAgb3V0WzEzXSA9IGFbMTNdO1xuICAgICAgICBvdXRbMTRdID0gYVsxNF07XG4gICAgICAgIG91dFsxNV0gPSBhWzE1XTtcbiAgICB9XG4gICAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSB0cmFuc2xhdGlvbiB2ZWN0b3IgY29tcG9uZW50IG9mIGEgdHJhbnNmb3JtYXRpb25cbiAqICBtYXRyaXguIElmIGEgbWF0cml4IGlzIGJ1aWx0IHdpdGggZnJvbVJvdGF0aW9uVHJhbnNsYXRpb24sXG4gKiAgdGhlIHJldHVybmVkIHZlY3RvciB3aWxsIGJlIHRoZSBzYW1lIGFzIHRoZSB0cmFuc2xhdGlvbiB2ZWN0b3JcbiAqICBvcmlnaW5hbGx5IHN1cHBsaWVkLlxuICogQHBhcmFtICB7dmVjM30gb3V0IFZlY3RvciB0byByZWNlaXZlIHRyYW5zbGF0aW9uIGNvbXBvbmVudFxuICogQHBhcmFtICB7bWF0NH0gbWF0IE1hdHJpeCB0byBiZSBkZWNvbXBvc2VkIChpbnB1dClcbiAqIEByZXR1cm4ge3ZlYzN9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0VHJhbnNsYXRpb24ob3V0LCBtYXQpIHtcbiAgICBvdXRbMF0gPSBtYXRbMTJdO1xuICAgIG91dFsxXSA9IG1hdFsxM107XG4gICAgb3V0WzJdID0gbWF0WzE0XTtcblxuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgc2NhbGluZyBmYWN0b3IgY29tcG9uZW50IG9mIGEgdHJhbnNmb3JtYXRpb25cbiAqICBtYXRyaXguIElmIGEgbWF0cml4IGlzIGJ1aWx0IHdpdGggZnJvbVJvdGF0aW9uVHJhbnNsYXRpb25TY2FsZVxuICogIHdpdGggYSBub3JtYWxpemVkIFF1YXRlcm5pb24gcGFyYW10ZXIsIHRoZSByZXR1cm5lZCB2ZWN0b3Igd2lsbCBiZVxuICogIHRoZSBzYW1lIGFzIHRoZSBzY2FsaW5nIHZlY3RvclxuICogIG9yaWdpbmFsbHkgc3VwcGxpZWQuXG4gKiBAcGFyYW0gIHt2ZWMzfSBvdXQgVmVjdG9yIHRvIHJlY2VpdmUgc2NhbGluZyBmYWN0b3IgY29tcG9uZW50XG4gKiBAcGFyYW0gIHttYXQ0fSBtYXQgTWF0cml4IHRvIGJlIGRlY29tcG9zZWQgKGlucHV0KVxuICogQHJldHVybiB7dmVjM30gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRTY2FsaW5nKG91dCwgbWF0KSB7XG4gICAgbGV0IG0xMSA9IG1hdFswXTtcbiAgICBsZXQgbTEyID0gbWF0WzFdO1xuICAgIGxldCBtMTMgPSBtYXRbMl07XG4gICAgbGV0IG0yMSA9IG1hdFs0XTtcbiAgICBsZXQgbTIyID0gbWF0WzVdO1xuICAgIGxldCBtMjMgPSBtYXRbNl07XG4gICAgbGV0IG0zMSA9IG1hdFs4XTtcbiAgICBsZXQgbTMyID0gbWF0WzldO1xuICAgIGxldCBtMzMgPSBtYXRbMTBdO1xuXG4gICAgb3V0WzBdID0gTWF0aC5oeXBvdChtMTEsIG0xMiwgbTEzKTtcbiAgICBvdXRbMV0gPSBNYXRoLmh5cG90KG0yMSwgbTIyLCBtMjMpO1xuICAgIG91dFsyXSA9IE1hdGguaHlwb3QobTMxLCBtMzIsIG0zMyk7XG5cbiAgICByZXR1cm4gb3V0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0TWF4U2NhbGVPbkF4aXMobWF0KSB7XG4gICAgbGV0IG0xMSA9IG1hdFswXTtcbiAgICBsZXQgbTEyID0gbWF0WzFdO1xuICAgIGxldCBtMTMgPSBtYXRbMl07XG4gICAgbGV0IG0yMSA9IG1hdFs0XTtcbiAgICBsZXQgbTIyID0gbWF0WzVdO1xuICAgIGxldCBtMjMgPSBtYXRbNl07XG4gICAgbGV0IG0zMSA9IG1hdFs4XTtcbiAgICBsZXQgbTMyID0gbWF0WzldO1xuICAgIGxldCBtMzMgPSBtYXRbMTBdO1xuXG4gICAgY29uc3QgeCA9IG0xMSAqIG0xMSArIG0xMiAqIG0xMiArIG0xMyAqIG0xMztcbiAgICBjb25zdCB5ID0gbTIxICogbTIxICsgbTIyICogbTIyICsgbTIzICogbTIzO1xuICAgIGNvbnN0IHogPSBtMzEgKiBtMzEgKyBtMzIgKiBtMzIgKyBtMzMgKiBtMzM7XG5cbiAgICByZXR1cm4gTWF0aC5zcXJ0KE1hdGgubWF4KHgsIHksIHopKTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIGEgcXVhdGVybmlvbiByZXByZXNlbnRpbmcgdGhlIHJvdGF0aW9uYWwgY29tcG9uZW50XG4gKiAgb2YgYSB0cmFuc2Zvcm1hdGlvbiBtYXRyaXguIElmIGEgbWF0cml4IGlzIGJ1aWx0IHdpdGhcbiAqICBmcm9tUm90YXRpb25UcmFuc2xhdGlvbiwgdGhlIHJldHVybmVkIHF1YXRlcm5pb24gd2lsbCBiZSB0aGVcbiAqICBzYW1lIGFzIHRoZSBxdWF0ZXJuaW9uIG9yaWdpbmFsbHkgc3VwcGxpZWQuXG4gKiBAcGFyYW0ge3F1YXR9IG91dCBRdWF0ZXJuaW9uIHRvIHJlY2VpdmUgdGhlIHJvdGF0aW9uIGNvbXBvbmVudFxuICogQHBhcmFtIHttYXQ0fSBtYXQgTWF0cml4IHRvIGJlIGRlY29tcG9zZWQgKGlucHV0KVxuICogQHJldHVybiB7cXVhdH0gb3V0XG4gKi9cbmV4cG9ydCBjb25zdCBnZXRSb3RhdGlvbiA9IChmdW5jdGlvbiAoKSB7XG4gICAgY29uc3QgdGVtcCA9IFswLCAwLCAwXTtcblxuICAgIHJldHVybiBmdW5jdGlvbiAob3V0LCBtYXQpIHtcbiAgICAgICAgbGV0IHNjYWxpbmcgPSB0ZW1wO1xuICAgICAgICBnZXRTY2FsaW5nKHNjYWxpbmcsIG1hdCk7XG5cbiAgICAgICAgbGV0IGlzMSA9IDEgLyBzY2FsaW5nWzBdO1xuICAgICAgICBsZXQgaXMyID0gMSAvIHNjYWxpbmdbMV07XG4gICAgICAgIGxldCBpczMgPSAxIC8gc2NhbGluZ1syXTtcblxuICAgICAgICBsZXQgc20xMSA9IG1hdFswXSAqIGlzMTtcbiAgICAgICAgbGV0IHNtMTIgPSBtYXRbMV0gKiBpczI7XG4gICAgICAgIGxldCBzbTEzID0gbWF0WzJdICogaXMzO1xuICAgICAgICBsZXQgc20yMSA9IG1hdFs0XSAqIGlzMTtcbiAgICAgICAgbGV0IHNtMjIgPSBtYXRbNV0gKiBpczI7XG4gICAgICAgIGxldCBzbTIzID0gbWF0WzZdICogaXMzO1xuICAgICAgICBsZXQgc20zMSA9IG1hdFs4XSAqIGlzMTtcbiAgICAgICAgbGV0IHNtMzIgPSBtYXRbOV0gKiBpczI7XG4gICAgICAgIGxldCBzbTMzID0gbWF0WzEwXSAqIGlzMztcblxuICAgICAgICBsZXQgdHJhY2UgPSBzbTExICsgc20yMiArIHNtMzM7XG4gICAgICAgIGxldCBTID0gMDtcblxuICAgICAgICBpZiAodHJhY2UgPiAwKSB7XG4gICAgICAgICAgICBTID0gTWF0aC5zcXJ0KHRyYWNlICsgMS4wKSAqIDI7XG4gICAgICAgICAgICBvdXRbM10gPSAwLjI1ICogUztcbiAgICAgICAgICAgIG91dFswXSA9IChzbTIzIC0gc20zMikgLyBTO1xuICAgICAgICAgICAgb3V0WzFdID0gKHNtMzEgLSBzbTEzKSAvIFM7XG4gICAgICAgICAgICBvdXRbMl0gPSAoc20xMiAtIHNtMjEpIC8gUztcbiAgICAgICAgfSBlbHNlIGlmIChzbTExID4gc20yMiAmJiBzbTExID4gc20zMykge1xuICAgICAgICAgICAgUyA9IE1hdGguc3FydCgxLjAgKyBzbTExIC0gc20yMiAtIHNtMzMpICogMjtcbiAgICAgICAgICAgIG91dFszXSA9IChzbTIzIC0gc20zMikgLyBTO1xuICAgICAgICAgICAgb3V0WzBdID0gMC4yNSAqIFM7XG4gICAgICAgICAgICBvdXRbMV0gPSAoc20xMiArIHNtMjEpIC8gUztcbiAgICAgICAgICAgIG91dFsyXSA9IChzbTMxICsgc20xMykgLyBTO1xuICAgICAgICB9IGVsc2UgaWYgKHNtMjIgPiBzbTMzKSB7XG4gICAgICAgICAgICBTID0gTWF0aC5zcXJ0KDEuMCArIHNtMjIgLSBzbTExIC0gc20zMykgKiAyO1xuICAgICAgICAgICAgb3V0WzNdID0gKHNtMzEgLSBzbTEzKSAvIFM7XG4gICAgICAgICAgICBvdXRbMF0gPSAoc20xMiArIHNtMjEpIC8gUztcbiAgICAgICAgICAgIG91dFsxXSA9IDAuMjUgKiBTO1xuICAgICAgICAgICAgb3V0WzJdID0gKHNtMjMgKyBzbTMyKSAvIFM7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBTID0gTWF0aC5zcXJ0KDEuMCArIHNtMzMgLSBzbTExIC0gc20yMikgKiAyO1xuICAgICAgICAgICAgb3V0WzNdID0gKHNtMTIgLSBzbTIxKSAvIFM7XG4gICAgICAgICAgICBvdXRbMF0gPSAoc20zMSArIHNtMTMpIC8gUztcbiAgICAgICAgICAgIG91dFsxXSA9IChzbTIzICsgc20zMikgLyBTO1xuICAgICAgICAgICAgb3V0WzJdID0gMC4yNSAqIFM7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gb3V0O1xuICAgIH07XG59KSgpO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBtYXRyaXggZnJvbSBhIHF1YXRlcm5pb24gcm90YXRpb24sIHZlY3RvciB0cmFuc2xhdGlvbiBhbmQgdmVjdG9yIHNjYWxlXG4gKiBUaGlzIGlzIGVxdWl2YWxlbnQgdG8gKGJ1dCBtdWNoIGZhc3RlciB0aGFuKTpcbiAqXG4gKiAgICAgbWF0NC5pZGVudGl0eShkZXN0KTtcbiAqICAgICBtYXQ0LnRyYW5zbGF0ZShkZXN0LCB2ZWMpO1xuICogICAgIGxldCBxdWF0TWF0ID0gbWF0NC5jcmVhdGUoKTtcbiAqICAgICBxdWF0NC50b01hdDQocXVhdCwgcXVhdE1hdCk7XG4gKiAgICAgbWF0NC5tdWx0aXBseShkZXN0LCBxdWF0TWF0KTtcbiAqICAgICBtYXQ0LnNjYWxlKGRlc3QsIHNjYWxlKVxuICpcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IG1hdDQgcmVjZWl2aW5nIG9wZXJhdGlvbiByZXN1bHRcbiAqIEBwYXJhbSB7cXVhdDR9IHEgUm90YXRpb24gcXVhdGVybmlvblxuICogQHBhcmFtIHt2ZWMzfSB2IFRyYW5zbGF0aW9uIHZlY3RvclxuICogQHBhcmFtIHt2ZWMzfSBzIFNjYWxpbmcgdmVjdG9yXG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmcm9tUm90YXRpb25UcmFuc2xhdGlvblNjYWxlKG91dCwgcSwgdiwgcykge1xuICAgIC8vIFF1YXRlcm5pb24gbWF0aFxuICAgIGxldCB4ID0gcVswXSxcbiAgICAgICAgeSA9IHFbMV0sXG4gICAgICAgIHogPSBxWzJdLFxuICAgICAgICB3ID0gcVszXTtcbiAgICBsZXQgeDIgPSB4ICsgeDtcbiAgICBsZXQgeTIgPSB5ICsgeTtcbiAgICBsZXQgejIgPSB6ICsgejtcblxuICAgIGxldCB4eCA9IHggKiB4MjtcbiAgICBsZXQgeHkgPSB4ICogeTI7XG4gICAgbGV0IHh6ID0geCAqIHoyO1xuICAgIGxldCB5eSA9IHkgKiB5MjtcbiAgICBsZXQgeXogPSB5ICogejI7XG4gICAgbGV0IHp6ID0geiAqIHoyO1xuICAgIGxldCB3eCA9IHcgKiB4MjtcbiAgICBsZXQgd3kgPSB3ICogeTI7XG4gICAgbGV0IHd6ID0gdyAqIHoyO1xuICAgIGxldCBzeCA9IHNbMF07XG4gICAgbGV0IHN5ID0gc1sxXTtcbiAgICBsZXQgc3ogPSBzWzJdO1xuXG4gICAgb3V0WzBdID0gKDEgLSAoeXkgKyB6eikpICogc3g7XG4gICAgb3V0WzFdID0gKHh5ICsgd3opICogc3g7XG4gICAgb3V0WzJdID0gKHh6IC0gd3kpICogc3g7XG4gICAgb3V0WzNdID0gMDtcbiAgICBvdXRbNF0gPSAoeHkgLSB3eikgKiBzeTtcbiAgICBvdXRbNV0gPSAoMSAtICh4eCArIHp6KSkgKiBzeTtcbiAgICBvdXRbNl0gPSAoeXogKyB3eCkgKiBzeTtcbiAgICBvdXRbN10gPSAwO1xuICAgIG91dFs4XSA9ICh4eiArIHd5KSAqIHN6O1xuICAgIG91dFs5XSA9ICh5eiAtIHd4KSAqIHN6O1xuICAgIG91dFsxMF0gPSAoMSAtICh4eCArIHl5KSkgKiBzejtcbiAgICBvdXRbMTFdID0gMDtcbiAgICBvdXRbMTJdID0gdlswXTtcbiAgICBvdXRbMTNdID0gdlsxXTtcbiAgICBvdXRbMTRdID0gdlsyXTtcbiAgICBvdXRbMTVdID0gMTtcblxuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogQ2FsY3VsYXRlcyBhIDR4NCBtYXRyaXggZnJvbSB0aGUgZ2l2ZW4gcXVhdGVybmlvblxuICpcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IG1hdDQgcmVjZWl2aW5nIG9wZXJhdGlvbiByZXN1bHRcbiAqIEBwYXJhbSB7cXVhdH0gcSBRdWF0ZXJuaW9uIHRvIGNyZWF0ZSBtYXRyaXggZnJvbVxuICpcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZyb21RdWF0KG91dCwgcSkge1xuICAgIGxldCB4ID0gcVswXSxcbiAgICAgICAgeSA9IHFbMV0sXG4gICAgICAgIHogPSBxWzJdLFxuICAgICAgICB3ID0gcVszXTtcbiAgICBsZXQgeDIgPSB4ICsgeDtcbiAgICBsZXQgeTIgPSB5ICsgeTtcbiAgICBsZXQgejIgPSB6ICsgejtcblxuICAgIGxldCB4eCA9IHggKiB4MjtcbiAgICBsZXQgeXggPSB5ICogeDI7XG4gICAgbGV0IHl5ID0geSAqIHkyO1xuICAgIGxldCB6eCA9IHogKiB4MjtcbiAgICBsZXQgenkgPSB6ICogeTI7XG4gICAgbGV0IHp6ID0geiAqIHoyO1xuICAgIGxldCB3eCA9IHcgKiB4MjtcbiAgICBsZXQgd3kgPSB3ICogeTI7XG4gICAgbGV0IHd6ID0gdyAqIHoyO1xuXG4gICAgb3V0WzBdID0gMSAtIHl5IC0geno7XG4gICAgb3V0WzFdID0geXggKyB3ejtcbiAgICBvdXRbMl0gPSB6eCAtIHd5O1xuICAgIG91dFszXSA9IDA7XG5cbiAgICBvdXRbNF0gPSB5eCAtIHd6O1xuICAgIG91dFs1XSA9IDEgLSB4eCAtIHp6O1xuICAgIG91dFs2XSA9IHp5ICsgd3g7XG4gICAgb3V0WzddID0gMDtcblxuICAgIG91dFs4XSA9IHp4ICsgd3k7XG4gICAgb3V0WzldID0genkgLSB3eDtcbiAgICBvdXRbMTBdID0gMSAtIHh4IC0geXk7XG4gICAgb3V0WzExXSA9IDA7XG5cbiAgICBvdXRbMTJdID0gMDtcbiAgICBvdXRbMTNdID0gMDtcbiAgICBvdXRbMTRdID0gMDtcbiAgICBvdXRbMTVdID0gMTtcblxuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogR2VuZXJhdGVzIGEgcGVyc3BlY3RpdmUgcHJvamVjdGlvbiBtYXRyaXggd2l0aCB0aGUgZ2l2ZW4gYm91bmRzXG4gKlxuICogQHBhcmFtIHttYXQ0fSBvdXQgbWF0NCBmcnVzdHVtIG1hdHJpeCB3aWxsIGJlIHdyaXR0ZW4gaW50b1xuICogQHBhcmFtIHtudW1iZXJ9IGxlZnQgVmVydGljYWwgZmllbGQgb2YgdmlldyBpbiByYWRpYW5zXG4gKiBAcGFyYW0ge251bWJlcn0gcmlnaHQgQXNwZWN0IHJhdGlvLiB0eXBpY2FsbHkgdmlld3BvcnQgd2lkdGgvaGVpZ2h0XG4gKiBAcGFyYW0ge251bWJlcn0gdG9wIFZlcnRpY2FsIGZpZWxkIG9mIHZpZXcgaW4gcmFkaWFuc1xuICogQHBhcmFtIHtudW1iZXJ9IGJvdHRvbSBBc3BlY3QgcmF0aW8uIHR5cGljYWxseSB2aWV3cG9ydCB3aWR0aC9oZWlnaHRcbiAqIEBwYXJhbSB7bnVtYmVyfSBuZWFyIE5lYXIgYm91bmQgb2YgdGhlIGZydXN0dW1cbiAqIEBwYXJhbSB7bnVtYmVyfSBmYXIgRmFyIGJvdW5kIG9mIHRoZSBmcnVzdHVtXG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwZXJzcGVjdGl2ZUZydXN0cnVtKG91dCwgbGVmdCwgcmlnaHQsIHRvcCwgYm90dG9tLCBuZWFyLCBmYXIpIHtcbiAgICB2YXIgeCA9IDIgKiBuZWFyIC8gKCByaWdodCAtIGxlZnQgKTtcbiAgICB2YXIgeSA9IDIgKiBuZWFyIC8gKCB0b3AgLSBib3R0b20gKTtcblxuICAgIHZhciBhID0gKCByaWdodCArIGxlZnQgKSAvICggcmlnaHQgLSBsZWZ0ICk7XG4gICAgdmFyIGIgPSAoIHRvcCArIGJvdHRvbSApIC8gKCB0b3AgLSBib3R0b20gKTtcbiAgICB2YXIgYyA9IC0gKCBmYXIgKyBuZWFyICkgLyAoIGZhciAtIG5lYXIgKTtcbiAgICB2YXIgZCA9IC0gMiAqIGZhciAqIG5lYXIgLyAoIGZhciAtIG5lYXIgKTtcblxuICAgIG91dFsgMCBdID0geDtcdG91dFsgNCBdID0gMDtcdG91dFsgOCBdID0gYTtcdG91dFsgMTIgXSA9IDA7XG4gICAgb3V0WyAxIF0gPSAwO1x0b3V0WyA1IF0gPSB5O1x0b3V0WyA5IF0gPSBiO1x0b3V0WyAxMyBdID0gMDtcbiAgICBvdXRbIDIgXSA9IDA7XHRvdXRbIDYgXSA9IDA7XHRvdXRbIDEwIF0gPSBjO1x0b3V0WyAxNCBdID0gZDtcbiAgICBvdXRbIDMgXSA9IDA7XHRvdXRbIDcgXSA9IDA7XHRvdXRbIDExIF0gPSAtIDE7XHRvdXRbIDE1IF0gPSAwO1xuXG4gICAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBHZW5lcmF0ZXMgYSBwZXJzcGVjdGl2ZSBwcm9qZWN0aW9uIG1hdHJpeCB3aXRoIHRoZSBnaXZlbiBib3VuZHNcbiAqXG4gKiBAcGFyYW0ge21hdDR9IG91dCBtYXQ0IGZydXN0dW0gbWF0cml4IHdpbGwgYmUgd3JpdHRlbiBpbnRvXG4gKiBAcGFyYW0ge251bWJlcn0gZm92eSBWZXJ0aWNhbCBmaWVsZCBvZiB2aWV3IGluIHJhZGlhbnNcbiAqIEBwYXJhbSB7bnVtYmVyfSBhc3BlY3QgQXNwZWN0IHJhdGlvLiB0eXBpY2FsbHkgdmlld3BvcnQgd2lkdGgvaGVpZ2h0XG4gKiBAcGFyYW0ge251bWJlcn0gbmVhciBOZWFyIGJvdW5kIG9mIHRoZSBmcnVzdHVtXG4gKiBAcGFyYW0ge251bWJlcn0gZmFyIEZhciBib3VuZCBvZiB0aGUgZnJ1c3R1bVxuICogQHJldHVybnMge21hdDR9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gcGVyc3BlY3RpdmUob3V0LCBmb3Z5LCBhc3BlY3QsIG5lYXIsIGZhcikge1xuICAgIGxldCBmID0gMS4wIC8gTWF0aC50YW4oZm92eSAvIDIpO1xuICAgIGxldCBuZiA9IDEgLyAobmVhciAtIGZhcik7XG4gICAgb3V0WzBdID0gZiAvIGFzcGVjdDtcbiAgICBvdXRbMV0gPSAwO1xuICAgIG91dFsyXSA9IDA7XG4gICAgb3V0WzNdID0gMDtcbiAgICBvdXRbNF0gPSAwO1xuICAgIG91dFs1XSA9IGY7XG4gICAgb3V0WzZdID0gMDtcbiAgICBvdXRbN10gPSAwO1xuICAgIG91dFs4XSA9IDA7XG4gICAgb3V0WzldID0gMDtcbiAgICBvdXRbMTBdID0gKGZhciArIG5lYXIpICogbmY7XG4gICAgb3V0WzExXSA9IC0xO1xuICAgIG91dFsxMl0gPSAwO1xuICAgIG91dFsxM10gPSAwO1xuICAgIG91dFsxNF0gPSAyICogZmFyICogbmVhciAqIG5mO1xuICAgIG91dFsxNV0gPSAwO1xuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogR2VuZXJhdGVzIGEgb3J0aG9nb25hbCBwcm9qZWN0aW9uIG1hdHJpeCB3aXRoIHRoZSBnaXZlbiBib3VuZHNcbiAqXG4gKiBAcGFyYW0ge21hdDR9IG91dCBtYXQ0IGZydXN0dW0gbWF0cml4IHdpbGwgYmUgd3JpdHRlbiBpbnRvXG4gKiBAcGFyYW0ge251bWJlcn0gbGVmdCBMZWZ0IGJvdW5kIG9mIHRoZSBmcnVzdHVtXG4gKiBAcGFyYW0ge251bWJlcn0gcmlnaHQgUmlnaHQgYm91bmQgb2YgdGhlIGZydXN0dW1cbiAqIEBwYXJhbSB7bnVtYmVyfSBib3R0b20gQm90dG9tIGJvdW5kIG9mIHRoZSBmcnVzdHVtXG4gKiBAcGFyYW0ge251bWJlcn0gdG9wIFRvcCBib3VuZCBvZiB0aGUgZnJ1c3R1bVxuICogQHBhcmFtIHtudW1iZXJ9IG5lYXIgTmVhciBib3VuZCBvZiB0aGUgZnJ1c3R1bVxuICogQHBhcmFtIHtudW1iZXJ9IGZhciBGYXIgYm91bmQgb2YgdGhlIGZydXN0dW1cbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG9ydGhvKG91dCwgbGVmdCwgcmlnaHQsIGJvdHRvbSwgdG9wLCBuZWFyLCBmYXIpIHtcbiAgICBsZXQgbHIgPSAxIC8gKGxlZnQgLSByaWdodCk7XG4gICAgbGV0IGJ0ID0gMSAvIChib3R0b20gLSB0b3ApO1xuICAgIGxldCBuZiA9IDEgLyAobmVhciAtIGZhcik7XG4gICAgb3V0WzBdID0gLTIgKiBscjtcbiAgICBvdXRbMV0gPSAwO1xuICAgIG91dFsyXSA9IDA7XG4gICAgb3V0WzNdID0gMDtcbiAgICBvdXRbNF0gPSAwO1xuICAgIG91dFs1XSA9IC0yICogYnQ7XG4gICAgb3V0WzZdID0gMDtcbiAgICBvdXRbN10gPSAwO1xuICAgIG91dFs4XSA9IDA7XG4gICAgb3V0WzldID0gMDtcbiAgICBvdXRbMTBdID0gMiAqIG5mO1xuICAgIG91dFsxMV0gPSAwO1xuICAgIG91dFsxMl0gPSAobGVmdCArIHJpZ2h0KSAqIGxyO1xuICAgIG91dFsxM10gPSAodG9wICsgYm90dG9tKSAqIGJ0O1xuICAgIG91dFsxNF0gPSAoZmFyICsgbmVhcikgKiBuZjtcbiAgICBvdXRbMTVdID0gMTtcbiAgICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIEdlbmVyYXRlcyBhIG1hdHJpeCB0aGF0IG1ha2VzIHNvbWV0aGluZyBsb29rIGF0IHNvbWV0aGluZyBlbHNlLlxuICpcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IG1hdDQgZnJ1c3R1bSBtYXRyaXggd2lsbCBiZSB3cml0dGVuIGludG9cbiAqIEBwYXJhbSB7dmVjM30gZXllIFBvc2l0aW9uIG9mIHRoZSB2aWV3ZXJcbiAqIEBwYXJhbSB7dmVjM30gdGFyZ2V0IFBvaW50IHRoZSB2aWV3ZXIgaXMgbG9va2luZyBhdFxuICogQHBhcmFtIHt2ZWMzfSB1cCB2ZWMzIHBvaW50aW5nIHVwXG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0YXJnZXRUbyhvdXQsIGV5ZSwgdGFyZ2V0LCB1cCkge1xuICAgIGxldCBleWV4ID0gZXllWzBdLFxuICAgICAgICBleWV5ID0gZXllWzFdLFxuICAgICAgICBleWV6ID0gZXllWzJdLFxuICAgICAgICB1cHggPSB1cFswXSxcbiAgICAgICAgdXB5ID0gdXBbMV0sXG4gICAgICAgIHVweiA9IHVwWzJdO1xuXG4gICAgbGV0IHowID0gZXlleCAtIHRhcmdldFswXSxcbiAgICAgICAgejEgPSBleWV5IC0gdGFyZ2V0WzFdLFxuICAgICAgICB6MiA9IGV5ZXogLSB0YXJnZXRbMl07XG5cbiAgICBsZXQgbGVuID0gejAgKiB6MCArIHoxICogejEgKyB6MiAqIHoyO1xuICAgIGlmIChsZW4gPT09IDApIHtcbiAgICAgICAgLy8gZXllIGFuZCB0YXJnZXQgYXJlIGluIHRoZSBzYW1lIHBvc2l0aW9uXG4gICAgICAgIHoyID0gMTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBsZW4gPSAxIC8gTWF0aC5zcXJ0KGxlbik7XG4gICAgICAgIHowICo9IGxlbjtcbiAgICAgICAgejEgKj0gbGVuO1xuICAgICAgICB6MiAqPSBsZW47XG4gICAgfVxuXG4gICAgbGV0IHgwID0gdXB5ICogejIgLSB1cHogKiB6MSxcbiAgICAgICAgeDEgPSB1cHogKiB6MCAtIHVweCAqIHoyLFxuICAgICAgICB4MiA9IHVweCAqIHoxIC0gdXB5ICogejA7XG5cbiAgICBsZW4gPSB4MCAqIHgwICsgeDEgKiB4MSArIHgyICogeDI7XG4gICAgaWYgKGxlbiA9PT0gMCkge1xuICAgICAgICAvLyB1cCBhbmQgeiBhcmUgcGFyYWxsZWxcbiAgICAgICAgaWYgKHVweikge1xuICAgICAgICAgICAgdXB4ICs9IDFlLTY7XG4gICAgICAgIH0gZWxzZSBpZiAodXB5KSB7XG4gICAgICAgICAgICB1cHogKz0gMWUtNjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHVweSArPSAxZS02O1xuICAgICAgICB9XG4gICAgICAgICh4MCA9IHVweSAqIHoyIC0gdXB6ICogejEpLCAoeDEgPSB1cHogKiB6MCAtIHVweCAqIHoyKSwgKHgyID0gdXB4ICogejEgLSB1cHkgKiB6MCk7XG5cbiAgICAgICAgbGVuID0geDAgKiB4MCArIHgxICogeDEgKyB4MiAqIHgyO1xuICAgIH1cblxuICAgIGxlbiA9IDEgLyBNYXRoLnNxcnQobGVuKTtcbiAgICB4MCAqPSBsZW47XG4gICAgeDEgKj0gbGVuO1xuICAgIHgyICo9IGxlbjtcblxuICAgIG91dFswXSA9IHgwO1xuICAgIG91dFsxXSA9IHgxO1xuICAgIG91dFsyXSA9IHgyO1xuICAgIG91dFszXSA9IDA7XG4gICAgb3V0WzRdID0gejEgKiB4MiAtIHoyICogeDE7XG4gICAgb3V0WzVdID0gejIgKiB4MCAtIHowICogeDI7XG4gICAgb3V0WzZdID0gejAgKiB4MSAtIHoxICogeDA7XG4gICAgb3V0WzddID0gMDtcbiAgICBvdXRbOF0gPSB6MDtcbiAgICBvdXRbOV0gPSB6MTtcbiAgICBvdXRbMTBdID0gejI7XG4gICAgb3V0WzExXSA9IDA7XG4gICAgb3V0WzEyXSA9IGV5ZXg7XG4gICAgb3V0WzEzXSA9IGV5ZXk7XG4gICAgb3V0WzE0XSA9IGV5ZXo7XG4gICAgb3V0WzE1XSA9IDE7XG4gICAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBBZGRzIHR3byBtYXQ0J3NcbiAqXG4gKiBAcGFyYW0ge21hdDR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQ0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge21hdDR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhZGQob3V0LCBhLCBiKSB7XG4gICAgb3V0WzBdID0gYVswXSArIGJbMF07XG4gICAgb3V0WzFdID0gYVsxXSArIGJbMV07XG4gICAgb3V0WzJdID0gYVsyXSArIGJbMl07XG4gICAgb3V0WzNdID0gYVszXSArIGJbM107XG4gICAgb3V0WzRdID0gYVs0XSArIGJbNF07XG4gICAgb3V0WzVdID0gYVs1XSArIGJbNV07XG4gICAgb3V0WzZdID0gYVs2XSArIGJbNl07XG4gICAgb3V0WzddID0gYVs3XSArIGJbN107XG4gICAgb3V0WzhdID0gYVs4XSArIGJbOF07XG4gICAgb3V0WzldID0gYVs5XSArIGJbOV07XG4gICAgb3V0WzEwXSA9IGFbMTBdICsgYlsxMF07XG4gICAgb3V0WzExXSA9IGFbMTFdICsgYlsxMV07XG4gICAgb3V0WzEyXSA9IGFbMTJdICsgYlsxMl07XG4gICAgb3V0WzEzXSA9IGFbMTNdICsgYlsxM107XG4gICAgb3V0WzE0XSA9IGFbMTRdICsgYlsxNF07XG4gICAgb3V0WzE1XSA9IGFbMTVdICsgYlsxNV07XG4gICAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBTdWJ0cmFjdHMgbWF0cml4IGIgZnJvbSBtYXRyaXggYVxuICpcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7bWF0NH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHN1YnRyYWN0KG91dCwgYSwgYikge1xuICAgIG91dFswXSA9IGFbMF0gLSBiWzBdO1xuICAgIG91dFsxXSA9IGFbMV0gLSBiWzFdO1xuICAgIG91dFsyXSA9IGFbMl0gLSBiWzJdO1xuICAgIG91dFszXSA9IGFbM10gLSBiWzNdO1xuICAgIG91dFs0XSA9IGFbNF0gLSBiWzRdO1xuICAgIG91dFs1XSA9IGFbNV0gLSBiWzVdO1xuICAgIG91dFs2XSA9IGFbNl0gLSBiWzZdO1xuICAgIG91dFs3XSA9IGFbN10gLSBiWzddO1xuICAgIG91dFs4XSA9IGFbOF0gLSBiWzhdO1xuICAgIG91dFs5XSA9IGFbOV0gLSBiWzldO1xuICAgIG91dFsxMF0gPSBhWzEwXSAtIGJbMTBdO1xuICAgIG91dFsxMV0gPSBhWzExXSAtIGJbMTFdO1xuICAgIG91dFsxMl0gPSBhWzEyXSAtIGJbMTJdO1xuICAgIG91dFsxM10gPSBhWzEzXSAtIGJbMTNdO1xuICAgIG91dFsxNF0gPSBhWzE0XSAtIGJbMTRdO1xuICAgIG91dFsxNV0gPSBhWzE1XSAtIGJbMTVdO1xuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogTXVsdGlwbHkgZWFjaCBlbGVtZW50IG9mIHRoZSBtYXRyaXggYnkgYSBzY2FsYXIuXG4gKlxuICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0NH0gYSB0aGUgbWF0cml4IHRvIHNjYWxlXG4gKiBAcGFyYW0ge051bWJlcn0gYiBhbW91bnQgdG8gc2NhbGUgdGhlIG1hdHJpeCdzIGVsZW1lbnRzIGJ5XG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtdWx0aXBseVNjYWxhcihvdXQsIGEsIGIpIHtcbiAgICBvdXRbMF0gPSBhWzBdICogYjtcbiAgICBvdXRbMV0gPSBhWzFdICogYjtcbiAgICBvdXRbMl0gPSBhWzJdICogYjtcbiAgICBvdXRbM10gPSBhWzNdICogYjtcbiAgICBvdXRbNF0gPSBhWzRdICogYjtcbiAgICBvdXRbNV0gPSBhWzVdICogYjtcbiAgICBvdXRbNl0gPSBhWzZdICogYjtcbiAgICBvdXRbN10gPSBhWzddICogYjtcbiAgICBvdXRbOF0gPSBhWzhdICogYjtcbiAgICBvdXRbOV0gPSBhWzldICogYjtcbiAgICBvdXRbMTBdID0gYVsxMF0gKiBiO1xuICAgIG91dFsxMV0gPSBhWzExXSAqIGI7XG4gICAgb3V0WzEyXSA9IGFbMTJdICogYjtcbiAgICBvdXRbMTNdID0gYVsxM10gKiBiO1xuICAgIG91dFsxNF0gPSBhWzE0XSAqIGI7XG4gICAgb3V0WzE1XSA9IGFbMTVdICogYjtcbiAgICByZXR1cm4gb3V0O1xufVxuIiwiaW1wb3J0ICogYXMgdmVjNCBmcm9tICcuL1ZlYzRGdW5jLmpzJztcblxuLyoqXG4gKiBTZXQgYSBxdWF0IHRvIHRoZSBpZGVudGl0eSBxdWF0ZXJuaW9uXG4gKlxuICogQHBhcmFtIHtxdWF0fSBvdXQgdGhlIHJlY2VpdmluZyBxdWF0ZXJuaW9uXG4gKiBAcmV0dXJucyB7cXVhdH0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpZGVudGl0eShvdXQpIHtcbiAgICBvdXRbMF0gPSAwO1xuICAgIG91dFsxXSA9IDA7XG4gICAgb3V0WzJdID0gMDtcbiAgICBvdXRbM10gPSAxO1xuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogU2V0cyBhIHF1YXQgZnJvbSB0aGUgZ2l2ZW4gYW5nbGUgYW5kIHJvdGF0aW9uIGF4aXMsXG4gKiB0aGVuIHJldHVybnMgaXQuXG4gKlxuICogQHBhcmFtIHtxdWF0fSBvdXQgdGhlIHJlY2VpdmluZyBxdWF0ZXJuaW9uXG4gKiBAcGFyYW0ge3ZlYzN9IGF4aXMgdGhlIGF4aXMgYXJvdW5kIHdoaWNoIHRvIHJvdGF0ZVxuICogQHBhcmFtIHtOdW1iZXJ9IHJhZCB0aGUgYW5nbGUgaW4gcmFkaWFuc1xuICogQHJldHVybnMge3F1YXR9IG91dFxuICoqL1xuZXhwb3J0IGZ1bmN0aW9uIHNldEF4aXNBbmdsZShvdXQsIGF4aXMsIHJhZCkge1xuICAgIHJhZCA9IHJhZCAqIDAuNTtcbiAgICBsZXQgcyA9IE1hdGguc2luKHJhZCk7XG4gICAgb3V0WzBdID0gcyAqIGF4aXNbMF07XG4gICAgb3V0WzFdID0gcyAqIGF4aXNbMV07XG4gICAgb3V0WzJdID0gcyAqIGF4aXNbMl07XG4gICAgb3V0WzNdID0gTWF0aC5jb3MocmFkKTtcbiAgICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIE11bHRpcGxpZXMgdHdvIHF1YXRzXG4gKlxuICogQHBhcmFtIHtxdWF0fSBvdXQgdGhlIHJlY2VpdmluZyBxdWF0ZXJuaW9uXG4gKiBAcGFyYW0ge3F1YXR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7cXVhdH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHtxdWF0fSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG11bHRpcGx5KG91dCwgYSwgYikge1xuICAgIGxldCBheCA9IGFbMF0sXG4gICAgICAgIGF5ID0gYVsxXSxcbiAgICAgICAgYXogPSBhWzJdLFxuICAgICAgICBhdyA9IGFbM107XG4gICAgbGV0IGJ4ID0gYlswXSxcbiAgICAgICAgYnkgPSBiWzFdLFxuICAgICAgICBieiA9IGJbMl0sXG4gICAgICAgIGJ3ID0gYlszXTtcblxuICAgIG91dFswXSA9IGF4ICogYncgKyBhdyAqIGJ4ICsgYXkgKiBieiAtIGF6ICogYnk7XG4gICAgb3V0WzFdID0gYXkgKiBidyArIGF3ICogYnkgKyBheiAqIGJ4IC0gYXggKiBiejtcbiAgICBvdXRbMl0gPSBheiAqIGJ3ICsgYXcgKiBieiArIGF4ICogYnkgLSBheSAqIGJ4O1xuICAgIG91dFszXSA9IGF3ICogYncgLSBheCAqIGJ4IC0gYXkgKiBieSAtIGF6ICogYno7XG4gICAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBSb3RhdGVzIGEgcXVhdGVybmlvbiBieSB0aGUgZ2l2ZW4gYW5nbGUgYWJvdXQgdGhlIFggYXhpc1xuICpcbiAqIEBwYXJhbSB7cXVhdH0gb3V0IHF1YXQgcmVjZWl2aW5nIG9wZXJhdGlvbiByZXN1bHRcbiAqIEBwYXJhbSB7cXVhdH0gYSBxdWF0IHRvIHJvdGF0ZVxuICogQHBhcmFtIHtudW1iZXJ9IHJhZCBhbmdsZSAoaW4gcmFkaWFucykgdG8gcm90YXRlXG4gKiBAcmV0dXJucyB7cXVhdH0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByb3RhdGVYKG91dCwgYSwgcmFkKSB7XG4gICAgcmFkICo9IDAuNTtcblxuICAgIGxldCBheCA9IGFbMF0sXG4gICAgICAgIGF5ID0gYVsxXSxcbiAgICAgICAgYXogPSBhWzJdLFxuICAgICAgICBhdyA9IGFbM107XG4gICAgbGV0IGJ4ID0gTWF0aC5zaW4ocmFkKSxcbiAgICAgICAgYncgPSBNYXRoLmNvcyhyYWQpO1xuXG4gICAgb3V0WzBdID0gYXggKiBidyArIGF3ICogYng7XG4gICAgb3V0WzFdID0gYXkgKiBidyArIGF6ICogYng7XG4gICAgb3V0WzJdID0gYXogKiBidyAtIGF5ICogYng7XG4gICAgb3V0WzNdID0gYXcgKiBidyAtIGF4ICogYng7XG4gICAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBSb3RhdGVzIGEgcXVhdGVybmlvbiBieSB0aGUgZ2l2ZW4gYW5nbGUgYWJvdXQgdGhlIFkgYXhpc1xuICpcbiAqIEBwYXJhbSB7cXVhdH0gb3V0IHF1YXQgcmVjZWl2aW5nIG9wZXJhdGlvbiByZXN1bHRcbiAqIEBwYXJhbSB7cXVhdH0gYSBxdWF0IHRvIHJvdGF0ZVxuICogQHBhcmFtIHtudW1iZXJ9IHJhZCBhbmdsZSAoaW4gcmFkaWFucykgdG8gcm90YXRlXG4gKiBAcmV0dXJucyB7cXVhdH0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByb3RhdGVZKG91dCwgYSwgcmFkKSB7XG4gICAgcmFkICo9IDAuNTtcblxuICAgIGxldCBheCA9IGFbMF0sXG4gICAgICAgIGF5ID0gYVsxXSxcbiAgICAgICAgYXogPSBhWzJdLFxuICAgICAgICBhdyA9IGFbM107XG4gICAgbGV0IGJ5ID0gTWF0aC5zaW4ocmFkKSxcbiAgICAgICAgYncgPSBNYXRoLmNvcyhyYWQpO1xuXG4gICAgb3V0WzBdID0gYXggKiBidyAtIGF6ICogYnk7XG4gICAgb3V0WzFdID0gYXkgKiBidyArIGF3ICogYnk7XG4gICAgb3V0WzJdID0gYXogKiBidyArIGF4ICogYnk7XG4gICAgb3V0WzNdID0gYXcgKiBidyAtIGF5ICogYnk7XG4gICAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBSb3RhdGVzIGEgcXVhdGVybmlvbiBieSB0aGUgZ2l2ZW4gYW5nbGUgYWJvdXQgdGhlIFogYXhpc1xuICpcbiAqIEBwYXJhbSB7cXVhdH0gb3V0IHF1YXQgcmVjZWl2aW5nIG9wZXJhdGlvbiByZXN1bHRcbiAqIEBwYXJhbSB7cXVhdH0gYSBxdWF0IHRvIHJvdGF0ZVxuICogQHBhcmFtIHtudW1iZXJ9IHJhZCBhbmdsZSAoaW4gcmFkaWFucykgdG8gcm90YXRlXG4gKiBAcmV0dXJucyB7cXVhdH0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByb3RhdGVaKG91dCwgYSwgcmFkKSB7XG4gICAgcmFkICo9IDAuNTtcblxuICAgIGxldCBheCA9IGFbMF0sXG4gICAgICAgIGF5ID0gYVsxXSxcbiAgICAgICAgYXogPSBhWzJdLFxuICAgICAgICBhdyA9IGFbM107XG4gICAgbGV0IGJ6ID0gTWF0aC5zaW4ocmFkKSxcbiAgICAgICAgYncgPSBNYXRoLmNvcyhyYWQpO1xuXG4gICAgb3V0WzBdID0gYXggKiBidyArIGF5ICogYno7XG4gICAgb3V0WzFdID0gYXkgKiBidyAtIGF4ICogYno7XG4gICAgb3V0WzJdID0gYXogKiBidyArIGF3ICogYno7XG4gICAgb3V0WzNdID0gYXcgKiBidyAtIGF6ICogYno7XG4gICAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBQZXJmb3JtcyBhIHNwaGVyaWNhbCBsaW5lYXIgaW50ZXJwb2xhdGlvbiBiZXR3ZWVuIHR3byBxdWF0XG4gKlxuICogQHBhcmFtIHtxdWF0fSBvdXQgdGhlIHJlY2VpdmluZyBxdWF0ZXJuaW9uXG4gKiBAcGFyYW0ge3F1YXR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7cXVhdH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEBwYXJhbSB7TnVtYmVyfSB0IGludGVycG9sYXRpb24gYW1vdW50IGJldHdlZW4gdGhlIHR3byBpbnB1dHNcbiAqIEByZXR1cm5zIHtxdWF0fSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNsZXJwKG91dCwgYSwgYiwgdCkge1xuICAgIC8vIGJlbmNobWFya3M6XG4gICAgLy8gICAgaHR0cDovL2pzcGVyZi5jb20vcXVhdGVybmlvbi1zbGVycC1pbXBsZW1lbnRhdGlvbnNcbiAgICBsZXQgYXggPSBhWzBdLFxuICAgICAgICBheSA9IGFbMV0sXG4gICAgICAgIGF6ID0gYVsyXSxcbiAgICAgICAgYXcgPSBhWzNdO1xuICAgIGxldCBieCA9IGJbMF0sXG4gICAgICAgIGJ5ID0gYlsxXSxcbiAgICAgICAgYnogPSBiWzJdLFxuICAgICAgICBidyA9IGJbM107XG5cbiAgICBsZXQgb21lZ2EsIGNvc29tLCBzaW5vbSwgc2NhbGUwLCBzY2FsZTE7XG5cbiAgICAvLyBjYWxjIGNvc2luZVxuICAgIGNvc29tID0gYXggKiBieCArIGF5ICogYnkgKyBheiAqIGJ6ICsgYXcgKiBidztcbiAgICAvLyBhZGp1c3Qgc2lnbnMgKGlmIG5lY2Vzc2FyeSlcbiAgICBpZiAoY29zb20gPCAwLjApIHtcbiAgICAgICAgY29zb20gPSAtY29zb207XG4gICAgICAgIGJ4ID0gLWJ4O1xuICAgICAgICBieSA9IC1ieTtcbiAgICAgICAgYnogPSAtYno7XG4gICAgICAgIGJ3ID0gLWJ3O1xuICAgIH1cbiAgICAvLyBjYWxjdWxhdGUgY29lZmZpY2llbnRzXG4gICAgaWYgKDEuMCAtIGNvc29tID4gMC4wMDAwMDEpIHtcbiAgICAgICAgLy8gc3RhbmRhcmQgY2FzZSAoc2xlcnApXG4gICAgICAgIG9tZWdhID0gTWF0aC5hY29zKGNvc29tKTtcbiAgICAgICAgc2lub20gPSBNYXRoLnNpbihvbWVnYSk7XG4gICAgICAgIHNjYWxlMCA9IE1hdGguc2luKCgxLjAgLSB0KSAqIG9tZWdhKSAvIHNpbm9tO1xuICAgICAgICBzY2FsZTEgPSBNYXRoLnNpbih0ICogb21lZ2EpIC8gc2lub207XG4gICAgfSBlbHNlIHtcbiAgICAgICAgLy8gXCJmcm9tXCIgYW5kIFwidG9cIiBxdWF0ZXJuaW9ucyBhcmUgdmVyeSBjbG9zZVxuICAgICAgICAvLyAgLi4uIHNvIHdlIGNhbiBkbyBhIGxpbmVhciBpbnRlcnBvbGF0aW9uXG4gICAgICAgIHNjYWxlMCA9IDEuMCAtIHQ7XG4gICAgICAgIHNjYWxlMSA9IHQ7XG4gICAgfVxuICAgIC8vIGNhbGN1bGF0ZSBmaW5hbCB2YWx1ZXNcbiAgICBvdXRbMF0gPSBzY2FsZTAgKiBheCArIHNjYWxlMSAqIGJ4O1xuICAgIG91dFsxXSA9IHNjYWxlMCAqIGF5ICsgc2NhbGUxICogYnk7XG4gICAgb3V0WzJdID0gc2NhbGUwICogYXogKyBzY2FsZTEgKiBiejtcbiAgICBvdXRbM10gPSBzY2FsZTAgKiBhdyArIHNjYWxlMSAqIGJ3O1xuXG4gICAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBpbnZlcnNlIG9mIGEgcXVhdFxuICpcbiAqIEBwYXJhbSB7cXVhdH0gb3V0IHRoZSByZWNlaXZpbmcgcXVhdGVybmlvblxuICogQHBhcmFtIHtxdWF0fSBhIHF1YXQgdG8gY2FsY3VsYXRlIGludmVyc2Ugb2ZcbiAqIEByZXR1cm5zIHtxdWF0fSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGludmVydChvdXQsIGEpIHtcbiAgICBsZXQgYTAgPSBhWzBdLFxuICAgICAgICBhMSA9IGFbMV0sXG4gICAgICAgIGEyID0gYVsyXSxcbiAgICAgICAgYTMgPSBhWzNdO1xuICAgIGxldCBkb3QgPSBhMCAqIGEwICsgYTEgKiBhMSArIGEyICogYTIgKyBhMyAqIGEzO1xuICAgIGxldCBpbnZEb3QgPSBkb3QgPyAxLjAgLyBkb3QgOiAwO1xuXG4gICAgLy8gVE9ETzogV291bGQgYmUgZmFzdGVyIHRvIHJldHVybiBbMCwwLDAsMF0gaW1tZWRpYXRlbHkgaWYgZG90ID09IDBcblxuICAgIG91dFswXSA9IC1hMCAqIGludkRvdDtcbiAgICBvdXRbMV0gPSAtYTEgKiBpbnZEb3Q7XG4gICAgb3V0WzJdID0gLWEyICogaW52RG90O1xuICAgIG91dFszXSA9IGEzICogaW52RG90O1xuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgY29uanVnYXRlIG9mIGEgcXVhdFxuICogSWYgdGhlIHF1YXRlcm5pb24gaXMgbm9ybWFsaXplZCwgdGhpcyBmdW5jdGlvbiBpcyBmYXN0ZXIgdGhhbiBxdWF0LmludmVyc2UgYW5kIHByb2R1Y2VzIHRoZSBzYW1lIHJlc3VsdC5cbiAqXG4gKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cbiAqIEBwYXJhbSB7cXVhdH0gYSBxdWF0IHRvIGNhbGN1bGF0ZSBjb25qdWdhdGUgb2ZcbiAqIEByZXR1cm5zIHtxdWF0fSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvbmp1Z2F0ZShvdXQsIGEpIHtcbiAgICBvdXRbMF0gPSAtYVswXTtcbiAgICBvdXRbMV0gPSAtYVsxXTtcbiAgICBvdXRbMl0gPSAtYVsyXTtcbiAgICBvdXRbM10gPSBhWzNdO1xuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIHF1YXRlcm5pb24gZnJvbSB0aGUgZ2l2ZW4gM3gzIHJvdGF0aW9uIG1hdHJpeC5cbiAqXG4gKiBOT1RFOiBUaGUgcmVzdWx0YW50IHF1YXRlcm5pb24gaXMgbm90IG5vcm1hbGl6ZWQsIHNvIHlvdSBzaG91bGQgYmUgc3VyZVxuICogdG8gcmVub3JtYWxpemUgdGhlIHF1YXRlcm5pb24geW91cnNlbGYgd2hlcmUgbmVjZXNzYXJ5LlxuICpcbiAqIEBwYXJhbSB7cXVhdH0gb3V0IHRoZSByZWNlaXZpbmcgcXVhdGVybmlvblxuICogQHBhcmFtIHttYXQzfSBtIHJvdGF0aW9uIG1hdHJpeFxuICogQHJldHVybnMge3F1YXR9IG91dFxuICogQGZ1bmN0aW9uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmcm9tTWF0MyhvdXQsIG0pIHtcbiAgICAvLyBBbGdvcml0aG0gaW4gS2VuIFNob2VtYWtlJ3MgYXJ0aWNsZSBpbiAxOTg3IFNJR0dSQVBIIGNvdXJzZSBub3Rlc1xuICAgIC8vIGFydGljbGUgXCJRdWF0ZXJuaW9uIENhbGN1bHVzIGFuZCBGYXN0IEFuaW1hdGlvblwiLlxuICAgIGxldCBmVHJhY2UgPSBtWzBdICsgbVs0XSArIG1bOF07XG4gICAgbGV0IGZSb290O1xuXG4gICAgaWYgKGZUcmFjZSA+IDAuMCkge1xuICAgICAgICAvLyB8d3wgPiAxLzIsIG1heSBhcyB3ZWxsIGNob29zZSB3ID4gMS8yXG4gICAgICAgIGZSb290ID0gTWF0aC5zcXJ0KGZUcmFjZSArIDEuMCk7IC8vIDJ3XG4gICAgICAgIG91dFszXSA9IDAuNSAqIGZSb290O1xuICAgICAgICBmUm9vdCA9IDAuNSAvIGZSb290OyAvLyAxLyg0dylcbiAgICAgICAgb3V0WzBdID0gKG1bNV0gLSBtWzddKSAqIGZSb290O1xuICAgICAgICBvdXRbMV0gPSAobVs2XSAtIG1bMl0pICogZlJvb3Q7XG4gICAgICAgIG91dFsyXSA9IChtWzFdIC0gbVszXSkgKiBmUm9vdDtcbiAgICB9IGVsc2Uge1xuICAgICAgICAvLyB8d3wgPD0gMS8yXG4gICAgICAgIGxldCBpID0gMDtcbiAgICAgICAgaWYgKG1bNF0gPiBtWzBdKSBpID0gMTtcbiAgICAgICAgaWYgKG1bOF0gPiBtW2kgKiAzICsgaV0pIGkgPSAyO1xuICAgICAgICBsZXQgaiA9IChpICsgMSkgJSAzO1xuICAgICAgICBsZXQgayA9IChpICsgMikgJSAzO1xuXG4gICAgICAgIGZSb290ID0gTWF0aC5zcXJ0KG1baSAqIDMgKyBpXSAtIG1baiAqIDMgKyBqXSAtIG1bayAqIDMgKyBrXSArIDEuMCk7XG4gICAgICAgIG91dFtpXSA9IDAuNSAqIGZSb290O1xuICAgICAgICBmUm9vdCA9IDAuNSAvIGZSb290O1xuICAgICAgICBvdXRbM10gPSAobVtqICogMyArIGtdIC0gbVtrICogMyArIGpdKSAqIGZSb290O1xuICAgICAgICBvdXRbal0gPSAobVtqICogMyArIGldICsgbVtpICogMyArIGpdKSAqIGZSb290O1xuICAgICAgICBvdXRba10gPSAobVtrICogMyArIGldICsgbVtpICogMyArIGtdKSAqIGZSb290O1xuICAgIH1cblxuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIHF1YXRlcm5pb24gZnJvbSB0aGUgZ2l2ZW4gZXVsZXIgYW5nbGUgeCwgeSwgei5cbiAqXG4gKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cbiAqIEBwYXJhbSB7dmVjM30gZXVsZXIgQW5nbGVzIHRvIHJvdGF0ZSBhcm91bmQgZWFjaCBheGlzIGluIGRlZ3JlZXMuXG4gKiBAcGFyYW0ge1N0cmluZ30gb3JkZXIgZGV0YWlsaW5nIG9yZGVyIG9mIG9wZXJhdGlvbnMuIERlZmF1bHQgJ1hZWicuXG4gKiBAcmV0dXJucyB7cXVhdH0gb3V0XG4gKiBAZnVuY3Rpb25cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZyb21FdWxlcihvdXQsIGV1bGVyLCBvcmRlciA9ICdZWFonKSB7XG4gICAgbGV0IHN4ID0gTWF0aC5zaW4oZXVsZXJbMF0gKiAwLjUpO1xuICAgIGxldCBjeCA9IE1hdGguY29zKGV1bGVyWzBdICogMC41KTtcbiAgICBsZXQgc3kgPSBNYXRoLnNpbihldWxlclsxXSAqIDAuNSk7XG4gICAgbGV0IGN5ID0gTWF0aC5jb3MoZXVsZXJbMV0gKiAwLjUpO1xuICAgIGxldCBzeiA9IE1hdGguc2luKGV1bGVyWzJdICogMC41KTtcbiAgICBsZXQgY3ogPSBNYXRoLmNvcyhldWxlclsyXSAqIDAuNSk7XG5cbiAgICBpZiAob3JkZXIgPT09ICdYWVonKSB7XG4gICAgICAgIG91dFswXSA9IHN4ICogY3kgKiBjeiArIGN4ICogc3kgKiBzejtcbiAgICAgICAgb3V0WzFdID0gY3ggKiBzeSAqIGN6IC0gc3ggKiBjeSAqIHN6O1xuICAgICAgICBvdXRbMl0gPSBjeCAqIGN5ICogc3ogKyBzeCAqIHN5ICogY3o7XG4gICAgICAgIG91dFszXSA9IGN4ICogY3kgKiBjeiAtIHN4ICogc3kgKiBzejtcbiAgICB9IGVsc2UgaWYgKG9yZGVyID09PSAnWVhaJykge1xuICAgICAgICBvdXRbMF0gPSBzeCAqIGN5ICogY3ogKyBjeCAqIHN5ICogc3o7XG4gICAgICAgIG91dFsxXSA9IGN4ICogc3kgKiBjeiAtIHN4ICogY3kgKiBzejtcbiAgICAgICAgb3V0WzJdID0gY3ggKiBjeSAqIHN6IC0gc3ggKiBzeSAqIGN6O1xuICAgICAgICBvdXRbM10gPSBjeCAqIGN5ICogY3ogKyBzeCAqIHN5ICogc3o7XG4gICAgfSBlbHNlIGlmIChvcmRlciA9PT0gJ1pYWScpIHtcbiAgICAgICAgb3V0WzBdID0gc3ggKiBjeSAqIGN6IC0gY3ggKiBzeSAqIHN6O1xuICAgICAgICBvdXRbMV0gPSBjeCAqIHN5ICogY3ogKyBzeCAqIGN5ICogc3o7XG4gICAgICAgIG91dFsyXSA9IGN4ICogY3kgKiBzeiArIHN4ICogc3kgKiBjejtcbiAgICAgICAgb3V0WzNdID0gY3ggKiBjeSAqIGN6IC0gc3ggKiBzeSAqIHN6O1xuICAgIH0gZWxzZSBpZiAob3JkZXIgPT09ICdaWVgnKSB7XG4gICAgICAgIG91dFswXSA9IHN4ICogY3kgKiBjeiAtIGN4ICogc3kgKiBzejtcbiAgICAgICAgb3V0WzFdID0gY3ggKiBzeSAqIGN6ICsgc3ggKiBjeSAqIHN6O1xuICAgICAgICBvdXRbMl0gPSBjeCAqIGN5ICogc3ogLSBzeCAqIHN5ICogY3o7XG4gICAgICAgIG91dFszXSA9IGN4ICogY3kgKiBjeiArIHN4ICogc3kgKiBzejtcbiAgICB9IGVsc2UgaWYgKG9yZGVyID09PSAnWVpYJykge1xuICAgICAgICBvdXRbMF0gPSBzeCAqIGN5ICogY3ogKyBjeCAqIHN5ICogc3o7XG4gICAgICAgIG91dFsxXSA9IGN4ICogc3kgKiBjeiArIHN4ICogY3kgKiBzejtcbiAgICAgICAgb3V0WzJdID0gY3ggKiBjeSAqIHN6IC0gc3ggKiBzeSAqIGN6O1xuICAgICAgICBvdXRbM10gPSBjeCAqIGN5ICogY3ogLSBzeCAqIHN5ICogc3o7XG4gICAgfSBlbHNlIGlmIChvcmRlciA9PT0gJ1haWScpIHtcbiAgICAgICAgb3V0WzBdID0gc3ggKiBjeSAqIGN6IC0gY3ggKiBzeSAqIHN6O1xuICAgICAgICBvdXRbMV0gPSBjeCAqIHN5ICogY3ogLSBzeCAqIGN5ICogc3o7XG4gICAgICAgIG91dFsyXSA9IGN4ICogY3kgKiBzeiArIHN4ICogc3kgKiBjejtcbiAgICAgICAgb3V0WzNdID0gY3ggKiBjeSAqIGN6ICsgc3ggKiBzeSAqIHN6O1xuICAgIH1cblxuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogQ29weSB0aGUgdmFsdWVzIGZyb20gb25lIHF1YXQgdG8gYW5vdGhlclxuICpcbiAqIEBwYXJhbSB7cXVhdH0gb3V0IHRoZSByZWNlaXZpbmcgcXVhdGVybmlvblxuICogQHBhcmFtIHtxdWF0fSBhIHRoZSBzb3VyY2UgcXVhdGVybmlvblxuICogQHJldHVybnMge3F1YXR9IG91dFxuICogQGZ1bmN0aW9uXG4gKi9cbmV4cG9ydCBjb25zdCBjb3B5ID0gdmVjNC5jb3B5O1xuXG4vKipcbiAqIFNldCB0aGUgY29tcG9uZW50cyBvZiBhIHF1YXQgdG8gdGhlIGdpdmVuIHZhbHVlc1xuICpcbiAqIEBwYXJhbSB7cXVhdH0gb3V0IHRoZSByZWNlaXZpbmcgcXVhdGVybmlvblxuICogQHBhcmFtIHtOdW1iZXJ9IHggWCBjb21wb25lbnRcbiAqIEBwYXJhbSB7TnVtYmVyfSB5IFkgY29tcG9uZW50XG4gKiBAcGFyYW0ge051bWJlcn0geiBaIGNvbXBvbmVudFxuICogQHBhcmFtIHtOdW1iZXJ9IHcgVyBjb21wb25lbnRcbiAqIEByZXR1cm5zIHtxdWF0fSBvdXRcbiAqIEBmdW5jdGlvblxuICovXG5leHBvcnQgY29uc3Qgc2V0ID0gdmVjNC5zZXQ7XG5cbi8qKlxuICogQWRkcyB0d28gcXVhdCdzXG4gKlxuICogQHBhcmFtIHtxdWF0fSBvdXQgdGhlIHJlY2VpdmluZyBxdWF0ZXJuaW9uXG4gKiBAcGFyYW0ge3F1YXR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7cXVhdH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHtxdWF0fSBvdXRcbiAqIEBmdW5jdGlvblxuICovXG5leHBvcnQgY29uc3QgYWRkID0gdmVjNC5hZGQ7XG5cbi8qKlxuICogU2NhbGVzIGEgcXVhdCBieSBhIHNjYWxhciBudW1iZXJcbiAqXG4gKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHtxdWF0fSBhIHRoZSB2ZWN0b3IgdG8gc2NhbGVcbiAqIEBwYXJhbSB7TnVtYmVyfSBiIGFtb3VudCB0byBzY2FsZSB0aGUgdmVjdG9yIGJ5XG4gKiBAcmV0dXJucyB7cXVhdH0gb3V0XG4gKiBAZnVuY3Rpb25cbiAqL1xuZXhwb3J0IGNvbnN0IHNjYWxlID0gdmVjNC5zY2FsZTtcblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBkb3QgcHJvZHVjdCBvZiB0d28gcXVhdCdzXG4gKlxuICogQHBhcmFtIHtxdWF0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3F1YXR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBkb3QgcHJvZHVjdCBvZiBhIGFuZCBiXG4gKiBAZnVuY3Rpb25cbiAqL1xuZXhwb3J0IGNvbnN0IGRvdCA9IHZlYzQuZG90O1xuXG4vKipcbiAqIFBlcmZvcm1zIGEgbGluZWFyIGludGVycG9sYXRpb24gYmV0d2VlbiB0d28gcXVhdCdzXG4gKlxuICogQHBhcmFtIHtxdWF0fSBvdXQgdGhlIHJlY2VpdmluZyBxdWF0ZXJuaW9uXG4gKiBAcGFyYW0ge3F1YXR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7cXVhdH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEBwYXJhbSB7TnVtYmVyfSB0IGludGVycG9sYXRpb24gYW1vdW50IGJldHdlZW4gdGhlIHR3byBpbnB1dHNcbiAqIEByZXR1cm5zIHtxdWF0fSBvdXRcbiAqIEBmdW5jdGlvblxuICovXG5leHBvcnQgY29uc3QgbGVycCA9IHZlYzQubGVycDtcblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBsZW5ndGggb2YgYSBxdWF0XG4gKlxuICogQHBhcmFtIHtxdWF0fSBhIHZlY3RvciB0byBjYWxjdWxhdGUgbGVuZ3RoIG9mXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBsZW5ndGggb2YgYVxuICovXG5leHBvcnQgY29uc3QgbGVuZ3RoID0gdmVjNC5sZW5ndGg7XG5cbi8qKlxuICogTm9ybWFsaXplIGEgcXVhdFxuICpcbiAqIEBwYXJhbSB7cXVhdH0gb3V0IHRoZSByZWNlaXZpbmcgcXVhdGVybmlvblxuICogQHBhcmFtIHtxdWF0fSBhIHF1YXRlcm5pb24gdG8gbm9ybWFsaXplXG4gKiBAcmV0dXJucyB7cXVhdH0gb3V0XG4gKiBAZnVuY3Rpb25cbiAqL1xuZXhwb3J0IGNvbnN0IG5vcm1hbGl6ZSA9IHZlYzQubm9ybWFsaXplO1xuIiwiY29uc3QgRVBTSUxPTiA9IDAuMDAwMDAxO1xuXG4vKipcbiAqIENvcHkgdGhlIHZhbHVlcyBmcm9tIG9uZSB2ZWMyIHRvIGFub3RoZXJcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMyfSBhIHRoZSBzb3VyY2UgdmVjdG9yXG4gKiBAcmV0dXJucyB7dmVjMn0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb3B5KG91dCwgYSkge1xuICAgIG91dFswXSA9IGFbMF07XG4gICAgb3V0WzFdID0gYVsxXTtcbiAgICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFNldCB0aGUgY29tcG9uZW50cyBvZiBhIHZlYzIgdG8gdGhlIGdpdmVuIHZhbHVlc1xuICpcbiAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge051bWJlcn0geCBYIGNvbXBvbmVudFxuICogQHBhcmFtIHtOdW1iZXJ9IHkgWSBjb21wb25lbnRcbiAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNldChvdXQsIHgsIHkpIHtcbiAgICBvdXRbMF0gPSB4O1xuICAgIG91dFsxXSA9IHk7XG4gICAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBBZGRzIHR3byB2ZWMyJ3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMyfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzJ9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7dmVjMn0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhZGQob3V0LCBhLCBiKSB7XG4gICAgb3V0WzBdID0gYVswXSArIGJbMF07XG4gICAgb3V0WzFdID0gYVsxXSArIGJbMV07XG4gICAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBTdWJ0cmFjdHMgdmVjdG9yIGIgZnJvbSB2ZWN0b3IgYVxuICpcbiAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjMn0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHN1YnRyYWN0KG91dCwgYSwgYikge1xuICAgIG91dFswXSA9IGFbMF0gLSBiWzBdO1xuICAgIG91dFsxXSA9IGFbMV0gLSBiWzFdO1xuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogTXVsdGlwbGllcyB0d28gdmVjMidzXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMyfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge3ZlYzJ9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gbXVsdGlwbHkob3V0LCBhLCBiKSB7XG4gICAgb3V0WzBdID0gYVswXSAqIGJbMF07XG4gICAgb3V0WzFdID0gYVsxXSAqIGJbMV07XG4gICAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBEaXZpZGVzIHR3byB2ZWMyJ3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMyfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzJ9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7dmVjMn0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkaXZpZGUob3V0LCBhLCBiKSB7XG4gICAgb3V0WzBdID0gYVswXSAvIGJbMF07XG4gICAgb3V0WzFdID0gYVsxXSAvIGJbMV07XG4gICAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBTY2FsZXMgYSB2ZWMyIGJ5IGEgc2NhbGFyIG51bWJlclxuICpcbiAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIHZlY3RvciB0byBzY2FsZVxuICogQHBhcmFtIHtOdW1iZXJ9IGIgYW1vdW50IHRvIHNjYWxlIHRoZSB2ZWN0b3IgYnlcbiAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNjYWxlKG91dCwgYSwgYikge1xuICAgIG91dFswXSA9IGFbMF0gKiBiO1xuICAgIG91dFsxXSA9IGFbMV0gKiBiO1xuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgZXVjbGlkaWFuIGRpc3RhbmNlIGJldHdlZW4gdHdvIHZlYzInc1xuICpcbiAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMyfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge051bWJlcn0gZGlzdGFuY2UgYmV0d2VlbiBhIGFuZCBiXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkaXN0YW5jZShhLCBiKSB7XG4gICAgdmFyIHggPSBiWzBdIC0gYVswXSxcbiAgICAgICAgeSA9IGJbMV0gLSBhWzFdO1xuICAgIHJldHVybiBNYXRoLnNxcnQoeCAqIHggKyB5ICogeSk7XG59XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgc3F1YXJlZCBldWNsaWRpYW4gZGlzdGFuY2UgYmV0d2VlbiB0d28gdmVjMidzXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzJ9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBzcXVhcmVkIGRpc3RhbmNlIGJldHdlZW4gYSBhbmQgYlxuICovXG5leHBvcnQgZnVuY3Rpb24gc3F1YXJlZERpc3RhbmNlKGEsIGIpIHtcbiAgICB2YXIgeCA9IGJbMF0gLSBhWzBdLFxuICAgICAgICB5ID0gYlsxXSAtIGFbMV07XG4gICAgcmV0dXJuIHggKiB4ICsgeSAqIHk7XG59XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgbGVuZ3RoIG9mIGEgdmVjMlxuICpcbiAqIEBwYXJhbSB7dmVjMn0gYSB2ZWN0b3IgdG8gY2FsY3VsYXRlIGxlbmd0aCBvZlxuICogQHJldHVybnMge051bWJlcn0gbGVuZ3RoIG9mIGFcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxlbmd0aChhKSB7XG4gICAgdmFyIHggPSBhWzBdLFxuICAgICAgICB5ID0gYVsxXTtcbiAgICByZXR1cm4gTWF0aC5zcXJ0KHggKiB4ICsgeSAqIHkpO1xufVxuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIHNxdWFyZWQgbGVuZ3RoIG9mIGEgdmVjMlxuICpcbiAqIEBwYXJhbSB7dmVjMn0gYSB2ZWN0b3IgdG8gY2FsY3VsYXRlIHNxdWFyZWQgbGVuZ3RoIG9mXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBzcXVhcmVkIGxlbmd0aCBvZiBhXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzcXVhcmVkTGVuZ3RoKGEpIHtcbiAgICB2YXIgeCA9IGFbMF0sXG4gICAgICAgIHkgPSBhWzFdO1xuICAgIHJldHVybiB4ICogeCArIHkgKiB5O1xufVxuXG4vKipcbiAqIE5lZ2F0ZXMgdGhlIGNvbXBvbmVudHMgb2YgYSB2ZWMyXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjMn0gYSB2ZWN0b3IgdG8gbmVnYXRlXG4gKiBAcmV0dXJucyB7dmVjMn0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBuZWdhdGUob3V0LCBhKSB7XG4gICAgb3V0WzBdID0gLWFbMF07XG4gICAgb3V0WzFdID0gLWFbMV07XG4gICAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBpbnZlcnNlIG9mIHRoZSBjb21wb25lbnRzIG9mIGEgdmVjMlxuICpcbiAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdmVjdG9yIHRvIGludmVydFxuICogQHJldHVybnMge3ZlYzJ9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gaW52ZXJzZShvdXQsIGEpIHtcbiAgICBvdXRbMF0gPSAxLjAgLyBhWzBdO1xuICAgIG91dFsxXSA9IDEuMCAvIGFbMV07XG4gICAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBOb3JtYWxpemUgYSB2ZWMyXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjMn0gYSB2ZWN0b3IgdG8gbm9ybWFsaXplXG4gKiBAcmV0dXJucyB7dmVjMn0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBub3JtYWxpemUob3V0LCBhKSB7XG4gICAgdmFyIHggPSBhWzBdLFxuICAgICAgICB5ID0gYVsxXTtcbiAgICB2YXIgbGVuID0geCAqIHggKyB5ICogeTtcbiAgICBpZiAobGVuID4gMCkge1xuICAgICAgICAvL1RPRE86IGV2YWx1YXRlIHVzZSBvZiBnbG1faW52c3FydCBoZXJlP1xuICAgICAgICBsZW4gPSAxIC8gTWF0aC5zcXJ0KGxlbik7XG4gICAgfVxuICAgIG91dFswXSA9IGFbMF0gKiBsZW47XG4gICAgb3V0WzFdID0gYVsxXSAqIGxlbjtcbiAgICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGRvdCBwcm9kdWN0IG9mIHR3byB2ZWMyJ3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjMn0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IGRvdCBwcm9kdWN0IG9mIGEgYW5kIGJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRvdChhLCBiKSB7XG4gICAgcmV0dXJuIGFbMF0gKiBiWzBdICsgYVsxXSAqIGJbMV07XG59XG5cbi8qKlxuICogQ29tcHV0ZXMgdGhlIGNyb3NzIHByb2R1Y3Qgb2YgdHdvIHZlYzInc1xuICogTm90ZSB0aGF0IHRoZSBjcm9zcyBwcm9kdWN0IHJldHVybnMgYSBzY2FsYXJcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjMn0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IGNyb3NzIHByb2R1Y3Qgb2YgYSBhbmQgYlxuICovXG5leHBvcnQgZnVuY3Rpb24gY3Jvc3MoYSwgYikge1xuICAgIHJldHVybiBhWzBdICogYlsxXSAtIGFbMV0gKiBiWzBdO1xufVxuXG4vKipcbiAqIFBlcmZvcm1zIGEgbGluZWFyIGludGVycG9sYXRpb24gYmV0d2VlbiB0d28gdmVjMidzXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMyfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHBhcmFtIHtOdW1iZXJ9IHQgaW50ZXJwb2xhdGlvbiBhbW91bnQgYmV0d2VlbiB0aGUgdHdvIGlucHV0c1xuICogQHJldHVybnMge3ZlYzJ9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gbGVycChvdXQsIGEsIGIsIHQpIHtcbiAgICB2YXIgYXggPSBhWzBdLFxuICAgICAgICBheSA9IGFbMV07XG4gICAgb3V0WzBdID0gYXggKyB0ICogKGJbMF0gLSBheCk7XG4gICAgb3V0WzFdID0gYXkgKyB0ICogKGJbMV0gLSBheSk7XG4gICAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBUcmFuc2Zvcm1zIHRoZSB2ZWMyIHdpdGggYSBtYXQyXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgdmVjdG9yIHRvIHRyYW5zZm9ybVxuICogQHBhcmFtIHttYXQyfSBtIG1hdHJpeCB0byB0cmFuc2Zvcm0gd2l0aFxuICogQHJldHVybnMge3ZlYzJ9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gdHJhbnNmb3JtTWF0MihvdXQsIGEsIG0pIHtcbiAgICB2YXIgeCA9IGFbMF0sXG4gICAgICAgIHkgPSBhWzFdO1xuICAgIG91dFswXSA9IG1bMF0gKiB4ICsgbVsyXSAqIHk7XG4gICAgb3V0WzFdID0gbVsxXSAqIHggKyBtWzNdICogeTtcbiAgICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFRyYW5zZm9ybXMgdGhlIHZlYzIgd2l0aCBhIG1hdDJkXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgdmVjdG9yIHRvIHRyYW5zZm9ybVxuICogQHBhcmFtIHttYXQyZH0gbSBtYXRyaXggdG8gdHJhbnNmb3JtIHdpdGhcbiAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRyYW5zZm9ybU1hdDJkKG91dCwgYSwgbSkge1xuICAgIHZhciB4ID0gYVswXSxcbiAgICAgICAgeSA9IGFbMV07XG4gICAgb3V0WzBdID0gbVswXSAqIHggKyBtWzJdICogeSArIG1bNF07XG4gICAgb3V0WzFdID0gbVsxXSAqIHggKyBtWzNdICogeSArIG1bNV07XG4gICAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBUcmFuc2Zvcm1zIHRoZSB2ZWMyIHdpdGggYSBtYXQzXG4gKiAzcmQgdmVjdG9yIGNvbXBvbmVudCBpcyBpbXBsaWNpdGx5ICcxJ1xuICpcbiAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIHZlY3RvciB0byB0cmFuc2Zvcm1cbiAqIEBwYXJhbSB7bWF0M30gbSBtYXRyaXggdG8gdHJhbnNmb3JtIHdpdGhcbiAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRyYW5zZm9ybU1hdDMob3V0LCBhLCBtKSB7XG4gICAgdmFyIHggPSBhWzBdLFxuICAgICAgICB5ID0gYVsxXTtcbiAgICBvdXRbMF0gPSBtWzBdICogeCArIG1bM10gKiB5ICsgbVs2XTtcbiAgICBvdXRbMV0gPSBtWzFdICogeCArIG1bNF0gKiB5ICsgbVs3XTtcbiAgICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFRyYW5zZm9ybXMgdGhlIHZlYzIgd2l0aCBhIG1hdDRcbiAqIDNyZCB2ZWN0b3IgY29tcG9uZW50IGlzIGltcGxpY2l0bHkgJzAnXG4gKiA0dGggdmVjdG9yIGNvbXBvbmVudCBpcyBpbXBsaWNpdGx5ICcxJ1xuICpcbiAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIHZlY3RvciB0byB0cmFuc2Zvcm1cbiAqIEBwYXJhbSB7bWF0NH0gbSBtYXRyaXggdG8gdHJhbnNmb3JtIHdpdGhcbiAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRyYW5zZm9ybU1hdDQob3V0LCBhLCBtKSB7XG4gICAgbGV0IHggPSBhWzBdO1xuICAgIGxldCB5ID0gYVsxXTtcbiAgICBvdXRbMF0gPSBtWzBdICogeCArIG1bNF0gKiB5ICsgbVsxMl07XG4gICAgb3V0WzFdID0gbVsxXSAqIHggKyBtWzVdICogeSArIG1bMTNdO1xuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogUmV0dXJucyB3aGV0aGVyIG9yIG5vdCB0aGUgdmVjdG9ycyBleGFjdGx5IGhhdmUgdGhlIHNhbWUgZWxlbWVudHMgaW4gdGhlIHNhbWUgcG9zaXRpb24gKHdoZW4gY29tcGFyZWQgd2l0aCA9PT0pXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBhIFRoZSBmaXJzdCB2ZWN0b3IuXG4gKiBAcGFyYW0ge3ZlYzJ9IGIgVGhlIHNlY29uZCB2ZWN0b3IuXG4gKiBAcmV0dXJucyB7Qm9vbGVhbn0gVHJ1ZSBpZiB0aGUgdmVjdG9ycyBhcmUgZXF1YWwsIGZhbHNlIG90aGVyd2lzZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGV4YWN0RXF1YWxzKGEsIGIpIHtcbiAgICByZXR1cm4gYVswXSA9PT0gYlswXSAmJiBhWzFdID09PSBiWzFdO1xufVxuIiwiY29uc3QgRVBTSUxPTiA9IDAuMDAwMDAxO1xuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGxlbmd0aCBvZiBhIHZlYzNcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdmVjdG9yIHRvIGNhbGN1bGF0ZSBsZW5ndGggb2ZcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IGxlbmd0aCBvZiBhXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBsZW5ndGgoYSkge1xuICAgIGxldCB4ID0gYVswXTtcbiAgICBsZXQgeSA9IGFbMV07XG4gICAgbGV0IHogPSBhWzJdO1xuICAgIHJldHVybiBNYXRoLnNxcnQoeCAqIHggKyB5ICogeSArIHogKiB6KTtcbn1cblxuLyoqXG4gKiBDb3B5IHRoZSB2YWx1ZXMgZnJvbSBvbmUgdmVjMyB0byBhbm90aGVyXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjM30gYSB0aGUgc291cmNlIHZlY3RvclxuICogQHJldHVybnMge3ZlYzN9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gY29weShvdXQsIGEpIHtcbiAgICBvdXRbMF0gPSBhWzBdO1xuICAgIG91dFsxXSA9IGFbMV07XG4gICAgb3V0WzJdID0gYVsyXTtcbiAgICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFNldCB0aGUgY29tcG9uZW50cyBvZiBhIHZlYzMgdG8gdGhlIGdpdmVuIHZhbHVlc1xuICpcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge051bWJlcn0geCBYIGNvbXBvbmVudFxuICogQHBhcmFtIHtOdW1iZXJ9IHkgWSBjb21wb25lbnRcbiAqIEBwYXJhbSB7TnVtYmVyfSB6IFogY29tcG9uZW50XG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZXQob3V0LCB4LCB5LCB6KSB7XG4gICAgb3V0WzBdID0geDtcbiAgICBvdXRbMV0gPSB5O1xuICAgIG91dFsyXSA9IHo7XG4gICAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBBZGRzIHR3byB2ZWMzJ3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhZGQob3V0LCBhLCBiKSB7XG4gICAgb3V0WzBdID0gYVswXSArIGJbMF07XG4gICAgb3V0WzFdID0gYVsxXSArIGJbMV07XG4gICAgb3V0WzJdID0gYVsyXSArIGJbMl07XG4gICAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBTdWJ0cmFjdHMgdmVjdG9yIGIgZnJvbSB2ZWN0b3IgYVxuICpcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjM30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHN1YnRyYWN0KG91dCwgYSwgYikge1xuICAgIG91dFswXSA9IGFbMF0gLSBiWzBdO1xuICAgIG91dFsxXSA9IGFbMV0gLSBiWzFdO1xuICAgIG91dFsyXSA9IGFbMl0gLSBiWzJdO1xuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogTXVsdGlwbGllcyB0d28gdmVjMydzXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjM30gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge3ZlYzN9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gbXVsdGlwbHkob3V0LCBhLCBiKSB7XG4gICAgb3V0WzBdID0gYVswXSAqIGJbMF07XG4gICAgb3V0WzFdID0gYVsxXSAqIGJbMV07XG4gICAgb3V0WzJdID0gYVsyXSAqIGJbMl07XG4gICAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBEaXZpZGVzIHR3byB2ZWMzJ3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkaXZpZGUob3V0LCBhLCBiKSB7XG4gICAgb3V0WzBdID0gYVswXSAvIGJbMF07XG4gICAgb3V0WzFdID0gYVsxXSAvIGJbMV07XG4gICAgb3V0WzJdID0gYVsyXSAvIGJbMl07XG4gICAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBTY2FsZXMgYSB2ZWMzIGJ5IGEgc2NhbGFyIG51bWJlclxuICpcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIHZlY3RvciB0byBzY2FsZVxuICogQHBhcmFtIHtOdW1iZXJ9IGIgYW1vdW50IHRvIHNjYWxlIHRoZSB2ZWN0b3IgYnlcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNjYWxlKG91dCwgYSwgYikge1xuICAgIG91dFswXSA9IGFbMF0gKiBiO1xuICAgIG91dFsxXSA9IGFbMV0gKiBiO1xuICAgIG91dFsyXSA9IGFbMl0gKiBiO1xuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgZXVjbGlkaWFuIGRpc3RhbmNlIGJldHdlZW4gdHdvIHZlYzMnc1xuICpcbiAqIEBwYXJhbSB7dmVjM30gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge051bWJlcn0gZGlzdGFuY2UgYmV0d2VlbiBhIGFuZCBiXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkaXN0YW5jZShhLCBiKSB7XG4gICAgbGV0IHggPSBiWzBdIC0gYVswXTtcbiAgICBsZXQgeSA9IGJbMV0gLSBhWzFdO1xuICAgIGxldCB6ID0gYlsyXSAtIGFbMl07XG4gICAgcmV0dXJuIE1hdGguc3FydCh4ICogeCArIHkgKiB5ICsgeiAqIHopO1xufVxuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIHNxdWFyZWQgZXVjbGlkaWFuIGRpc3RhbmNlIGJldHdlZW4gdHdvIHZlYzMnc1xuICpcbiAqIEBwYXJhbSB7dmVjM30gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge051bWJlcn0gc3F1YXJlZCBkaXN0YW5jZSBiZXR3ZWVuIGEgYW5kIGJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNxdWFyZWREaXN0YW5jZShhLCBiKSB7XG4gICAgbGV0IHggPSBiWzBdIC0gYVswXTtcbiAgICBsZXQgeSA9IGJbMV0gLSBhWzFdO1xuICAgIGxldCB6ID0gYlsyXSAtIGFbMl07XG4gICAgcmV0dXJuIHggKiB4ICsgeSAqIHkgKyB6ICogejtcbn1cblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBzcXVhcmVkIGxlbmd0aCBvZiBhIHZlYzNcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdmVjdG9yIHRvIGNhbGN1bGF0ZSBzcXVhcmVkIGxlbmd0aCBvZlxuICogQHJldHVybnMge051bWJlcn0gc3F1YXJlZCBsZW5ndGggb2YgYVxuICovXG5leHBvcnQgZnVuY3Rpb24gc3F1YXJlZExlbmd0aChhKSB7XG4gICAgbGV0IHggPSBhWzBdO1xuICAgIGxldCB5ID0gYVsxXTtcbiAgICBsZXQgeiA9IGFbMl07XG4gICAgcmV0dXJuIHggKiB4ICsgeSAqIHkgKyB6ICogejtcbn1cblxuLyoqXG4gKiBOZWdhdGVzIHRoZSBjb21wb25lbnRzIG9mIGEgdmVjM1xuICpcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdmVjdG9yIHRvIG5lZ2F0ZVxuICogQHJldHVybnMge3ZlYzN9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gbmVnYXRlKG91dCwgYSkge1xuICAgIG91dFswXSA9IC1hWzBdO1xuICAgIG91dFsxXSA9IC1hWzFdO1xuICAgIG91dFsyXSA9IC1hWzJdO1xuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgaW52ZXJzZSBvZiB0aGUgY29tcG9uZW50cyBvZiBhIHZlYzNcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMzfSBhIHZlY3RvciB0byBpbnZlcnRcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGludmVyc2Uob3V0LCBhKSB7XG4gICAgb3V0WzBdID0gMS4wIC8gYVswXTtcbiAgICBvdXRbMV0gPSAxLjAgLyBhWzFdO1xuICAgIG91dFsyXSA9IDEuMCAvIGFbMl07XG4gICAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBOb3JtYWxpemUgYSB2ZWMzXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjM30gYSB2ZWN0b3IgdG8gbm9ybWFsaXplXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBub3JtYWxpemUob3V0LCBhKSB7XG4gICAgbGV0IHggPSBhWzBdO1xuICAgIGxldCB5ID0gYVsxXTtcbiAgICBsZXQgeiA9IGFbMl07XG4gICAgbGV0IGxlbiA9IHggKiB4ICsgeSAqIHkgKyB6ICogejtcbiAgICBpZiAobGVuID4gMCkge1xuICAgICAgICAvL1RPRE86IGV2YWx1YXRlIHVzZSBvZiBnbG1faW52c3FydCBoZXJlP1xuICAgICAgICBsZW4gPSAxIC8gTWF0aC5zcXJ0KGxlbik7XG4gICAgfVxuICAgIG91dFswXSA9IGFbMF0gKiBsZW47XG4gICAgb3V0WzFdID0gYVsxXSAqIGxlbjtcbiAgICBvdXRbMl0gPSBhWzJdICogbGVuO1xuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgZG90IHByb2R1Y3Qgb2YgdHdvIHZlYzMnc1xuICpcbiAqIEBwYXJhbSB7dmVjM30gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge051bWJlcn0gZG90IHByb2R1Y3Qgb2YgYSBhbmQgYlxuICovXG5leHBvcnQgZnVuY3Rpb24gZG90KGEsIGIpIHtcbiAgICByZXR1cm4gYVswXSAqIGJbMF0gKyBhWzFdICogYlsxXSArIGFbMl0gKiBiWzJdO1xufVxuXG4vKipcbiAqIENvbXB1dGVzIHRoZSBjcm9zcyBwcm9kdWN0IG9mIHR3byB2ZWMzJ3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcm9zcyhvdXQsIGEsIGIpIHtcbiAgICBsZXQgYXggPSBhWzBdLFxuICAgICAgICBheSA9IGFbMV0sXG4gICAgICAgIGF6ID0gYVsyXTtcbiAgICBsZXQgYnggPSBiWzBdLFxuICAgICAgICBieSA9IGJbMV0sXG4gICAgICAgIGJ6ID0gYlsyXTtcblxuICAgIG91dFswXSA9IGF5ICogYnogLSBheiAqIGJ5O1xuICAgIG91dFsxXSA9IGF6ICogYnggLSBheCAqIGJ6O1xuICAgIG91dFsyXSA9IGF4ICogYnkgLSBheSAqIGJ4O1xuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogUGVyZm9ybXMgYSBsaW5lYXIgaW50ZXJwb2xhdGlvbiBiZXR3ZWVuIHR3byB2ZWMzJ3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcGFyYW0ge051bWJlcn0gdCBpbnRlcnBvbGF0aW9uIGFtb3VudCBiZXR3ZWVuIHRoZSB0d28gaW5wdXRzXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBsZXJwKG91dCwgYSwgYiwgdCkge1xuICAgIGxldCBheCA9IGFbMF07XG4gICAgbGV0IGF5ID0gYVsxXTtcbiAgICBsZXQgYXogPSBhWzJdO1xuICAgIG91dFswXSA9IGF4ICsgdCAqIChiWzBdIC0gYXgpO1xuICAgIG91dFsxXSA9IGF5ICsgdCAqIChiWzFdIC0gYXkpO1xuICAgIG91dFsyXSA9IGF6ICsgdCAqIChiWzJdIC0gYXopO1xuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogVHJhbnNmb3JtcyB0aGUgdmVjMyB3aXRoIGEgbWF0NC5cbiAqIDR0aCB2ZWN0b3IgY29tcG9uZW50IGlzIGltcGxpY2l0bHkgJzEnXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjM30gYSB0aGUgdmVjdG9yIHRvIHRyYW5zZm9ybVxuICogQHBhcmFtIHttYXQ0fSBtIG1hdHJpeCB0byB0cmFuc2Zvcm0gd2l0aFxuICogQHJldHVybnMge3ZlYzN9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gdHJhbnNmb3JtTWF0NChvdXQsIGEsIG0pIHtcbiAgICBsZXQgeCA9IGFbMF0sXG4gICAgICAgIHkgPSBhWzFdLFxuICAgICAgICB6ID0gYVsyXTtcbiAgICBsZXQgdyA9IG1bM10gKiB4ICsgbVs3XSAqIHkgKyBtWzExXSAqIHogKyBtWzE1XTtcbiAgICB3ID0gdyB8fCAxLjA7XG4gICAgb3V0WzBdID0gKG1bMF0gKiB4ICsgbVs0XSAqIHkgKyBtWzhdICogeiArIG1bMTJdKSAvIHc7XG4gICAgb3V0WzFdID0gKG1bMV0gKiB4ICsgbVs1XSAqIHkgKyBtWzldICogeiArIG1bMTNdKSAvIHc7XG4gICAgb3V0WzJdID0gKG1bMl0gKiB4ICsgbVs2XSAqIHkgKyBtWzEwXSAqIHogKyBtWzE0XSkgLyB3O1xuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogU2FtZSBhcyBhYm92ZSBidXQgZG9lc24ndCBhcHBseSB0cmFuc2xhdGlvbi5cbiAqIFVzZWZ1bCBmb3IgcmF5cy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNjYWxlUm90YXRlTWF0NChvdXQsIGEsIG0pIHtcbiAgICBsZXQgeCA9IGFbMF0sXG4gICAgICAgIHkgPSBhWzFdLFxuICAgICAgICB6ID0gYVsyXTtcbiAgICBsZXQgdyA9IG1bM10gKiB4ICsgbVs3XSAqIHkgKyBtWzExXSAqIHogKyBtWzE1XTtcbiAgICB3ID0gdyB8fCAxLjA7XG4gICAgb3V0WzBdID0gKG1bMF0gKiB4ICsgbVs0XSAqIHkgKyBtWzhdICogeikgLyB3O1xuICAgIG91dFsxXSA9IChtWzFdICogeCArIG1bNV0gKiB5ICsgbVs5XSAqIHopIC8gdztcbiAgICBvdXRbMl0gPSAobVsyXSAqIHggKyBtWzZdICogeSArIG1bMTBdICogeikgLyB3O1xuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogVHJhbnNmb3JtcyB0aGUgdmVjMyB3aXRoIGEgbWF0My5cbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMzfSBhIHRoZSB2ZWN0b3IgdG8gdHJhbnNmb3JtXG4gKiBAcGFyYW0ge21hdDN9IG0gdGhlIDN4MyBtYXRyaXggdG8gdHJhbnNmb3JtIHdpdGhcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRyYW5zZm9ybU1hdDMob3V0LCBhLCBtKSB7XG4gICAgbGV0IHggPSBhWzBdLFxuICAgICAgICB5ID0gYVsxXSxcbiAgICAgICAgeiA9IGFbMl07XG4gICAgb3V0WzBdID0geCAqIG1bMF0gKyB5ICogbVszXSArIHogKiBtWzZdO1xuICAgIG91dFsxXSA9IHggKiBtWzFdICsgeSAqIG1bNF0gKyB6ICogbVs3XTtcbiAgICBvdXRbMl0gPSB4ICogbVsyXSArIHkgKiBtWzVdICsgeiAqIG1bOF07XG4gICAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBUcmFuc2Zvcm1zIHRoZSB2ZWMzIHdpdGggYSBxdWF0XG4gKlxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjM30gYSB0aGUgdmVjdG9yIHRvIHRyYW5zZm9ybVxuICogQHBhcmFtIHtxdWF0fSBxIHF1YXRlcm5pb24gdG8gdHJhbnNmb3JtIHdpdGhcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRyYW5zZm9ybVF1YXQob3V0LCBhLCBxKSB7XG4gICAgLy8gYmVuY2htYXJrczogaHR0cHM6Ly9qc3BlcmYuY29tL3F1YXRlcm5pb24tdHJhbnNmb3JtLXZlYzMtaW1wbGVtZW50YXRpb25zLWZpeGVkXG5cbiAgICBsZXQgeCA9IGFbMF0sXG4gICAgICAgIHkgPSBhWzFdLFxuICAgICAgICB6ID0gYVsyXTtcbiAgICBsZXQgcXggPSBxWzBdLFxuICAgICAgICBxeSA9IHFbMV0sXG4gICAgICAgIHF6ID0gcVsyXSxcbiAgICAgICAgcXcgPSBxWzNdO1xuXG4gICAgbGV0IHV2eCA9IHF5ICogeiAtIHF6ICogeTtcbiAgICBsZXQgdXZ5ID0gcXogKiB4IC0gcXggKiB6O1xuICAgIGxldCB1dnogPSBxeCAqIHkgLSBxeSAqIHg7XG5cbiAgICBsZXQgdXV2eCA9IHF5ICogdXZ6IC0gcXogKiB1dnk7XG4gICAgbGV0IHV1dnkgPSBxeiAqIHV2eCAtIHF4ICogdXZ6O1xuICAgIGxldCB1dXZ6ID0gcXggKiB1dnkgLSBxeSAqIHV2eDtcblxuICAgIGxldCB3MiA9IHF3ICogMjtcbiAgICB1dnggKj0gdzI7XG4gICAgdXZ5ICo9IHcyO1xuICAgIHV2eiAqPSB3MjtcblxuICAgIHV1dnggKj0gMjtcbiAgICB1dXZ5ICo9IDI7XG4gICAgdXV2eiAqPSAyO1xuXG4gICAgb3V0WzBdID0geCArIHV2eCArIHV1dng7XG4gICAgb3V0WzFdID0geSArIHV2eSArIHV1dnk7XG4gICAgb3V0WzJdID0geiArIHV2eiArIHV1dno7XG4gICAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBHZXQgdGhlIGFuZ2xlIGJldHdlZW4gdHdvIDNEIHZlY3RvcnNcbiAqIEBwYXJhbSB7dmVjM30gYSBUaGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMzfSBiIFRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge051bWJlcn0gVGhlIGFuZ2xlIGluIHJhZGlhbnNcbiAqL1xuZXhwb3J0IGNvbnN0IGFuZ2xlID0gKGZ1bmN0aW9uICgpIHtcbiAgICBjb25zdCB0ZW1wQSA9IFswLCAwLCAwXTtcbiAgICBjb25zdCB0ZW1wQiA9IFswLCAwLCAwXTtcblxuICAgIHJldHVybiBmdW5jdGlvbiAoYSwgYikge1xuICAgICAgICBjb3B5KHRlbXBBLCBhKTtcbiAgICAgICAgY29weSh0ZW1wQiwgYik7XG5cbiAgICAgICAgbm9ybWFsaXplKHRlbXBBLCB0ZW1wQSk7XG4gICAgICAgIG5vcm1hbGl6ZSh0ZW1wQiwgdGVtcEIpO1xuXG4gICAgICAgIGxldCBjb3NpbmUgPSBkb3QodGVtcEEsIHRlbXBCKTtcblxuICAgICAgICBpZiAoY29zaW5lID4gMS4wKSB7XG4gICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgfSBlbHNlIGlmIChjb3NpbmUgPCAtMS4wKSB7XG4gICAgICAgICAgICByZXR1cm4gTWF0aC5QSTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBNYXRoLmFjb3MoY29zaW5lKTtcbiAgICAgICAgfVxuICAgIH07XG59KSgpO1xuXG4vKipcbiAqIFJldHVybnMgd2hldGhlciBvciBub3QgdGhlIHZlY3RvcnMgaGF2ZSBleGFjdGx5IHRoZSBzYW1lIGVsZW1lbnRzIGluIHRoZSBzYW1lIHBvc2l0aW9uICh3aGVuIGNvbXBhcmVkIHdpdGggPT09KVxuICpcbiAqIEBwYXJhbSB7dmVjM30gYSBUaGUgZmlyc3QgdmVjdG9yLlxuICogQHBhcmFtIHt2ZWMzfSBiIFRoZSBzZWNvbmQgdmVjdG9yLlxuICogQHJldHVybnMge0Jvb2xlYW59IFRydWUgaWYgdGhlIHZlY3RvcnMgYXJlIGVxdWFsLCBmYWxzZSBvdGhlcndpc2UuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBleGFjdEVxdWFscyhhLCBiKSB7XG4gICAgcmV0dXJuIGFbMF0gPT09IGJbMF0gJiYgYVsxXSA9PT0gYlsxXSAmJiBhWzJdID09PSBiWzJdO1xufVxuIiwiY29uc3QgRVBTSUxPTiA9IDAuMDAwMDAxO1xuXG4vKipcbiAqIENvcHkgdGhlIHZhbHVlcyBmcm9tIG9uZSB2ZWM0IHRvIGFub3RoZXJcbiAqXG4gKiBAcGFyYW0ge3ZlYzR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWM0fSBhIHRoZSBzb3VyY2UgdmVjdG9yXG4gKiBAcmV0dXJucyB7dmVjNH0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb3B5KG91dCwgYSkge1xuICAgIG91dFswXSA9IGFbMF07XG4gICAgb3V0WzFdID0gYVsxXTtcbiAgICBvdXRbMl0gPSBhWzJdO1xuICAgIG91dFszXSA9IGFbM107XG4gICAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBTZXQgdGhlIGNvbXBvbmVudHMgb2YgYSB2ZWM0IHRvIHRoZSBnaXZlbiB2YWx1ZXNcbiAqXG4gKiBAcGFyYW0ge3ZlYzR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHtOdW1iZXJ9IHggWCBjb21wb25lbnRcbiAqIEBwYXJhbSB7TnVtYmVyfSB5IFkgY29tcG9uZW50XG4gKiBAcGFyYW0ge051bWJlcn0geiBaIGNvbXBvbmVudFxuICogQHBhcmFtIHtOdW1iZXJ9IHcgVyBjb21wb25lbnRcbiAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNldChvdXQsIHgsIHksIHosIHcpIHtcbiAgICBvdXRbMF0gPSB4O1xuICAgIG91dFsxXSA9IHk7XG4gICAgb3V0WzJdID0gejtcbiAgICBvdXRbM10gPSB3O1xuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogQWRkcyB0d28gdmVjNCdzXG4gKlxuICogQHBhcmFtIHt2ZWM0fSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjNH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWM0fSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge3ZlYzR9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gYWRkKG91dCwgYSwgYikge1xuICAgIG91dFswXSA9IGFbMF0gKyBiWzBdO1xuICAgIG91dFsxXSA9IGFbMV0gKyBiWzFdO1xuICAgIG91dFsyXSA9IGFbMl0gKyBiWzJdO1xuICAgIG91dFszXSA9IGFbM10gKyBiWzNdO1xuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogU2NhbGVzIGEgdmVjNCBieSBhIHNjYWxhciBudW1iZXJcbiAqXG4gKiBAcGFyYW0ge3ZlYzR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWM0fSBhIHRoZSB2ZWN0b3IgdG8gc2NhbGVcbiAqIEBwYXJhbSB7TnVtYmVyfSBiIGFtb3VudCB0byBzY2FsZSB0aGUgdmVjdG9yIGJ5XG4gKiBAcmV0dXJucyB7dmVjNH0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzY2FsZShvdXQsIGEsIGIpIHtcbiAgICBvdXRbMF0gPSBhWzBdICogYjtcbiAgICBvdXRbMV0gPSBhWzFdICogYjtcbiAgICBvdXRbMl0gPSBhWzJdICogYjtcbiAgICBvdXRbM10gPSBhWzNdICogYjtcbiAgICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGxlbmd0aCBvZiBhIHZlYzRcbiAqXG4gKiBAcGFyYW0ge3ZlYzR9IGEgdmVjdG9yIHRvIGNhbGN1bGF0ZSBsZW5ndGggb2ZcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IGxlbmd0aCBvZiBhXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBsZW5ndGgoYSkge1xuICAgIGxldCB4ID0gYVswXTtcbiAgICBsZXQgeSA9IGFbMV07XG4gICAgbGV0IHogPSBhWzJdO1xuICAgIGxldCB3ID0gYVszXTtcbiAgICByZXR1cm4gTWF0aC5zcXJ0KHggKiB4ICsgeSAqIHkgKyB6ICogeiArIHcgKiB3KTtcbn1cblxuLyoqXG4gKiBOb3JtYWxpemUgYSB2ZWM0XG4gKlxuICogQHBhcmFtIHt2ZWM0fSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjNH0gYSB2ZWN0b3IgdG8gbm9ybWFsaXplXG4gKiBAcmV0dXJucyB7dmVjNH0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBub3JtYWxpemUob3V0LCBhKSB7XG4gICAgbGV0IHggPSBhWzBdO1xuICAgIGxldCB5ID0gYVsxXTtcbiAgICBsZXQgeiA9IGFbMl07XG4gICAgbGV0IHcgPSBhWzNdO1xuICAgIGxldCBsZW4gPSB4ICogeCArIHkgKiB5ICsgeiAqIHogKyB3ICogdztcbiAgICBpZiAobGVuID4gMCkge1xuICAgICAgICBsZW4gPSAxIC8gTWF0aC5zcXJ0KGxlbik7XG4gICAgfVxuICAgIG91dFswXSA9IHggKiBsZW47XG4gICAgb3V0WzFdID0geSAqIGxlbjtcbiAgICBvdXRbMl0gPSB6ICogbGVuO1xuICAgIG91dFszXSA9IHcgKiBsZW47XG4gICAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBkb3QgcHJvZHVjdCBvZiB0d28gdmVjNCdzXG4gKlxuICogQHBhcmFtIHt2ZWM0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBkb3QgcHJvZHVjdCBvZiBhIGFuZCBiXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkb3QoYSwgYikge1xuICAgIHJldHVybiBhWzBdICogYlswXSArIGFbMV0gKiBiWzFdICsgYVsyXSAqIGJbMl0gKyBhWzNdICogYlszXTtcbn1cblxuLyoqXG4gKiBQZXJmb3JtcyBhIGxpbmVhciBpbnRlcnBvbGF0aW9uIGJldHdlZW4gdHdvIHZlYzQnc1xuICpcbiAqIEBwYXJhbSB7dmVjNH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjNH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEBwYXJhbSB7TnVtYmVyfSB0IGludGVycG9sYXRpb24gYW1vdW50IGJldHdlZW4gdGhlIHR3byBpbnB1dHNcbiAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxlcnAob3V0LCBhLCBiLCB0KSB7XG4gICAgbGV0IGF4ID0gYVswXTtcbiAgICBsZXQgYXkgPSBhWzFdO1xuICAgIGxldCBheiA9IGFbMl07XG4gICAgbGV0IGF3ID0gYVszXTtcbiAgICBvdXRbMF0gPSBheCArIHQgKiAoYlswXSAtIGF4KTtcbiAgICBvdXRbMV0gPSBheSArIHQgKiAoYlsxXSAtIGF5KTtcbiAgICBvdXRbMl0gPSBheiArIHQgKiAoYlsyXSAtIGF6KTtcbiAgICBvdXRbM10gPSBhdyArIHQgKiAoYlszXSAtIGF3KTtcbiAgICByZXR1cm4gb3V0O1xufVxuIiwiLy8gQ29yZVxuZXhwb3J0IHsgR2VvbWV0cnkgfSBmcm9tICcuL2NvcmUvR2VvbWV0cnkuanMnO1xuZXhwb3J0IHsgUHJvZ3JhbSB9IGZyb20gJy4vY29yZS9Qcm9ncmFtLmpzJztcbmV4cG9ydCB7IFJlbmRlcmVyIH0gZnJvbSAnLi9jb3JlL1JlbmRlcmVyLmpzJztcbmV4cG9ydCB7IENhbWVyYSB9IGZyb20gJy4vY29yZS9DYW1lcmEuanMnO1xuZXhwb3J0IHsgVHJhbnNmb3JtIH0gZnJvbSAnLi9jb3JlL1RyYW5zZm9ybS5qcyc7XG5leHBvcnQgeyBNZXNoIH0gZnJvbSAnLi9jb3JlL01lc2guanMnO1xuZXhwb3J0IHsgVGV4dHVyZSB9IGZyb20gJy4vY29yZS9UZXh0dXJlLmpzJztcbmV4cG9ydCB7IFJlbmRlclRhcmdldCB9IGZyb20gJy4vY29yZS9SZW5kZXJUYXJnZXQuanMnO1xuXG4vLyBNYXRoc1xuZXhwb3J0IHsgQ29sb3IgfSBmcm9tICcuL21hdGgvQ29sb3IuanMnO1xuZXhwb3J0IHsgRXVsZXIgfSBmcm9tICcuL21hdGgvRXVsZXIuanMnO1xuZXhwb3J0IHsgTWF0MyB9IGZyb20gJy4vbWF0aC9NYXQzLmpzJztcbmV4cG9ydCB7IE1hdDQgfSBmcm9tICcuL21hdGgvTWF0NC5qcyc7XG5leHBvcnQgeyBRdWF0IH0gZnJvbSAnLi9tYXRoL1F1YXQuanMnO1xuZXhwb3J0IHsgVmVjMiB9IGZyb20gJy4vbWF0aC9WZWMyLmpzJztcbmV4cG9ydCB7IFZlYzMgfSBmcm9tICcuL21hdGgvVmVjMy5qcyc7XG5leHBvcnQgeyBWZWM0IH0gZnJvbSAnLi9tYXRoL1ZlYzQuanMnO1xuXG4vLyBFeHRyYXNcbmV4cG9ydCB7IFBsYW5lIH0gZnJvbSAnLi9leHRyYXMvUGxhbmUuanMnO1xuZXhwb3J0IHsgQm94IH0gZnJvbSAnLi9leHRyYXMvQm94LmpzJztcbmV4cG9ydCB7IFNwaGVyZSB9IGZyb20gJy4vZXh0cmFzL1NwaGVyZS5qcyc7XG5leHBvcnQgeyBDeWxpbmRlciB9IGZyb20gJy4vZXh0cmFzL0N5bGluZGVyLmpzJztcbmV4cG9ydCB7IFRyaWFuZ2xlIH0gZnJvbSAnLi9leHRyYXMvVHJpYW5nbGUuanMnO1xuZXhwb3J0IHsgVG9ydXMgfSBmcm9tICcuL2V4dHJhcy9Ub3J1cy5qcyc7XG5leHBvcnQgeyBPcmJpdCB9IGZyb20gJy4vZXh0cmFzL09yYml0LmpzJztcbmV4cG9ydCB7IFJheWNhc3QgfSBmcm9tICcuL2V4dHJhcy9SYXljYXN0LmpzJztcbmV4cG9ydCB7IEN1cnZlIH0gZnJvbSAnLi9leHRyYXMvQ3VydmUuanMnO1xuZXhwb3J0IHsgUG9zdCB9IGZyb20gJy4vZXh0cmFzL1Bvc3QuanMnO1xuZXhwb3J0IHsgU2tpbiB9IGZyb20gJy4vZXh0cmFzL1NraW4uanMnO1xuZXhwb3J0IHsgQW5pbWF0aW9uIH0gZnJvbSAnLi9leHRyYXMvQW5pbWF0aW9uLmpzJztcbmV4cG9ydCB7IFRleHQgfSBmcm9tICcuL2V4dHJhcy9UZXh0LmpzJztcbmV4cG9ydCB7IE5vcm1hbFByb2dyYW0gfSBmcm9tICcuL2V4dHJhcy9Ob3JtYWxQcm9ncmFtLmpzJztcbmV4cG9ydCB7IEZsb3dtYXAgfSBmcm9tICcuL2V4dHJhcy9GbG93bWFwLmpzJztcbmV4cG9ydCB7IEdQR1BVIH0gZnJvbSAnLi9leHRyYXMvR1BHUFUuanMnO1xuZXhwb3J0IHsgUG9seWxpbmUgfSBmcm9tICcuL2V4dHJhcy9Qb2x5bGluZS5qcyc7XG5leHBvcnQgeyBTaGFkb3cgfSBmcm9tICcuL2V4dHJhcy9TaGFkb3cuanMnO1xuZXhwb3J0IHsgS1RYVGV4dHVyZSB9IGZyb20gJy4vZXh0cmFzL0tUWFRleHR1cmUuanMnO1xuZXhwb3J0IHsgVGV4dHVyZUxvYWRlciB9IGZyb20gJy4vZXh0cmFzL1RleHR1cmVMb2FkZXIuanMnO1xuZXhwb3J0IHsgR0xURkxvYWRlciB9IGZyb20gJy4vZXh0cmFzL0dMVEZMb2FkZXIuanMnO1xuZXhwb3J0IHsgR0xURlNraW4gfSBmcm9tICcuL2V4dHJhcy9HTFRGU2tpbi5qcyc7XG5cbiIsImltcG9ydCB7XG4gICAgQ2FtZXJhLFxuICAgIE9HTFJlbmRlcmluZ0NvbnRleHQsXG4gICAgUG9zdCxcbiAgICBQb3N0RkJPLFxuICAgIFBvc3RPcHRpb25zLCBQcm9ncmFtLFxuICAgIFJlbmRlcmVyLFxuICAgIFJlbmRlclRhcmdldCxcbiAgICBSZW5kZXJUYXJnZXRPcHRpb25zLFxuICAgIFRyYW5zZm9ybVxufSBmcm9tIFwiLi4vb2dsXCI7XG5cbmV4cG9ydCBjbGFzcyBQYXNzIHtcbiAgICBlbmFibGVkOiBib29sZWFuO1xuICAgIHJlbmRlclRvU2NyZWVuOiBib29sZWFuO1xuICAgIG5lZWRzU3dhcDogYm9vbGVhbjtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5lbmFibGVkID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5yZW5kZXJUb1NjcmVlbiA9IGZhbHNlO1xuICAgICAgICB0aGlzLm5lZWRzU3dhcCA9IHRydWU7XG4gICAgfVxuXG4gICAgcmVuZGVyKHJlbmRlcmVyOiBSZW5kZXJlciwgd3JpdGVCdWZmZXI6IFJlbmRlclRhcmdldHx1bmRlZmluZWQsIHJlYWRCdWZmZXI6IFJlbmRlclRhcmdldCkge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdOb3QgaW1wbGVtZW50ZWQnKTtcbiAgICB9XG4gICAgcmVuZGVyV2l0aEZCTyhyZW5kZXJlcjogUmVuZGVyZXIsIGZibzogUG9zdEZCTyl7XG4gICAgICAgIGZiby5yZWFkICYmIHRoaXMucmVuZGVyKHJlbmRlcmVyLCBmYm8ud3JpdGUsIGZiby5yZWFkKTtcbiAgICB9XG4gICAgcmVzaXplKHsgd2lkdGgsIGhlaWdodCwgZHByIH06IFBhcnRpYWw8e1xuICAgICAgICB3aWR0aDogbnVtYmVyO1xuICAgICAgICBoZWlnaHQ6IG51bWJlcjtcbiAgICAgICAgZHByOiBudW1iZXI7XG4gICAgfT4pOiB2b2lke1xuICAgICAgICBjb25zb2xlLmVycm9yKCdOb3QgaW1wbGVtZW50ZWQnKTtcbiAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBSZW5kZXJQYXNzIGV4dGVuZHMgUGFzcyB7XG4gICAgcHJpdmF0ZSBzY2VuZTogVHJhbnNmb3JtO1xuICAgIHByaXZhdGUgY2FtZXJhOiBDYW1lcmE7XG4gICAgY29uc3RydWN0b3Ioc2NlbmU6IFRyYW5zZm9ybSwgY2FtZXJhOiBDYW1lcmEpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgdGhpcy5zY2VuZSA9IHNjZW5lO1xuICAgICAgICB0aGlzLmNhbWVyYSA9IGNhbWVyYTtcbiAgICB9XG4gICAgXG4gICAgcmVuZGVyKHJlbmRlcmVyOiBSZW5kZXJlciwgd3JpdGVCdWZmZXI6IFJlbmRlclRhcmdldHx1bmRlZmluZWQsIHJlYWRCdWZmZXI6IFJlbmRlclRhcmdldCkge1xuICAgICAgICByZW5kZXJlci5yZW5kZXIoe3NjZW5lOiB0aGlzLnNjZW5lLCBjYW1lcmE6IHRoaXMuY2FtZXJhLCB0YXJnZXQ6IHJlYWRCdWZmZXJ9KTtcbiAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBDdXN0b21Qb3N0IGV4dGVuZHMgUG9zdCB7XG4gICAgcGFzc2VzOiBQYXNzW10gPSBbXTtcblxuICAgIGNvbnN0cnVjdG9yKGdsOiBPR0xSZW5kZXJpbmdDb250ZXh0LCBvcHRpb25zOlBhcnRpYWw8UG9zdE9wdGlvbnM+ID0ge30sIGZibz86IFBvc3RGQk8pIHtcbiAgICAgICAgc3VwZXIoZ2wsIG9wdGlvbnMsIGZibyk7XG4gICAgfVxuXG4gICAgYWRkUGFzcyhwYXNzOiBQYXNzKSB7XG4gICAgICAgIHRoaXMucGFzc2VzLnB1c2gocGFzcyk7XG4gICAgICAgIHJldHVybiBwYXNzO1xuICAgIH1cblxuICAgIHJlbmRlcih7IHRhcmdldD0gdW5kZWZpbmVkLCB1cGRhdGUgPSB0cnVlLCBzb3J0ID0gdHJ1ZSwgZnJ1c3R1bUN1bGwgPSB0cnVlIH0pIHtcbiAgICAgICAgY29uc3QgZW5hYmxlZFBhc3NlcyA9IHRoaXMucGFzc2VzLmZpbHRlcigocGFzcykgPT4gcGFzcy5lbmFibGVkKTtcbiAgICAgICAgZW5hYmxlZFBhc3Nlcy5mb3JFYWNoKChwYXNzLCBpKSA9PiB7XG4gICAgICAgICAgICB0aGlzLl9yZW5kZXJQYXNzKHBhc3MpO1xuICAgICAgICAgICAgcGFzcy5uZWVkc1N3YXAgJiYgdGhpcy5mYm8uc3dhcCgpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgX3JlbmRlclBhc3MocGFzczogUGFzcykge1xuICAgICAgICBwYXNzLnJlbmRlcldpdGhGQk8odGhpcy5nbC5yZW5kZXJlciwgdGhpcy5mYm8pO1xuICAgIH1cblxuICAgIHJlc2l6ZSh7IHdpZHRoLCBoZWlnaHQsIGRwciB9OiBQYXJ0aWFsPHtcbiAgICAgICAgd2lkdGg6IG51bWJlcjtcbiAgICAgICAgaGVpZ2h0OiBudW1iZXI7XG4gICAgICAgIGRwcjogbnVtYmVyO1xuICAgIH0+KTogdm9pZHtcbiAgICAgICAgc3VwZXIucmVzaXplKHt3aWR0aDogd2lkdGgsIGhlaWdodDogaGVpZ2h0LCBkcHI6IGRwcn0pO1xuICAgICAgICB0aGlzLnBhc3Nlcy5mb3JFYWNoKCAocGFzcykgPT4ge1xuICAgICAgICAgICAgcGFzcy5yZXNpemUoe3dpZHRoLCBoZWlnaHQsIGRwcn0pO1xuICAgICAgICB9KVxuICAgIH1cbn1cbiIsImltcG9ydCB7XHJcbiAgICBSZW5kZXJlcixcclxuICAgIFJlbmRlclRhcmdldCxcclxuICAgIFByb2dyYW0sXHJcbiAgICBUZXh0dXJlLFxyXG4gICAgVHJhbnNmb3JtLFxyXG4gICAgQ2FtZXJhLFxyXG4gICAgTWVzaCxcclxuICAgIFBsYW5lLFxyXG4gICAgVmVjMixcclxuICAgIE9HTFJlbmRlcmluZ0NvbnRleHRcclxufSBmcm9tICcuLi9vZ2wnO1xyXG5cclxuXHJcbmV4cG9ydCBjbGFzcyBVdGlscyB7XHJcbiAgICBzdGF0aWMgcmVhZG9ubHkgY29weVZlcnRleCA9IC8qIGdsc2wgKi8gYFxyXG4gICAgYXR0cmlidXRlIHZlYzIgdXY7XHJcbiAgICBhdHRyaWJ1dGUgdmVjMyBwb3NpdGlvbjtcclxuICAgIHZhcnlpbmcgdmVjMiB2VXY7XHJcbiAgICB1bmlmb3JtIG1hdDQgbW9kZWxNYXRyaXg7XHJcbiAgICB1bmlmb3JtIG1hdDQgcHJvamVjdGlvbk1hdHJpeDtcclxuXHJcbiAgICB2b2lkIG1haW4oKSB7XHJcbiAgICAgICAgdlV2ID0gdXY7XHJcbiAgICAgICAgZ2xfUG9zaXRpb24gPSBwcm9qZWN0aW9uTWF0cml4ICogbW9kZWxNYXRyaXggKiB2ZWM0KHBvc2l0aW9uLCAxKTtcclxuICAgIH1cclxuYDtcclxuICAgIHN0YXRpYyByZWFkb25seSBjb3B5RnJhZ21lbnQgPSAvKiBnbHNsICovIGBcclxuICAgIHByZWNpc2lvbiBoaWdocCBmbG9hdDtcclxuICAgIHVuaWZvcm0gc2FtcGxlcjJEIHRNYXA7XHJcbiAgICB2YXJ5aW5nIHZlYzIgdlV2O1xyXG4gICAgdm9pZCBtYWluKCkge1xyXG4gICAgICAgIGdsX0ZyYWdDb2xvciA9IHRleHR1cmUyRCh0TWFwLCB2VXYpO1xyXG4gICAgfVxyXG5gO1xyXG4gICAgcHJpdmF0ZSBzdGF0aWMgaW5zdGFuY2VNYXBfOiBNYXA8c3RyaW5nLCBVdGlscz4gPSBuZXcgTWFwPHN0cmluZywgVXRpbHM+KCk7XHJcbiAgICBwcml2YXRlIGNvcHlwcm9ncmFtXzogUHJvZ3JhbTtcclxuICAgIHByaXZhdGUgb3J0aG9TY2VuZV86IFRyYW5zZm9ybSA9IG5ldyBUcmFuc2Zvcm0oKTtcclxuICAgIHByaXZhdGUgbWVzaF86IE1lc2g7XHJcbiAgICBwcml2YXRlIG9ydGhvQ2FtZXJhXzogQ2FtZXJhO1xyXG4gICAgcHJpdmF0ZSBnbDogT0dMUmVuZGVyaW5nQ29udGV4dDtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihnbDogT0dMUmVuZGVyaW5nQ29udGV4dCkge1xyXG4gICAgICAgIHRoaXMuZ2wgPSBnbDtcclxuICAgICAgICB0aGlzLmNvcHlwcm9ncmFtXyA9IG5ldyBQcm9ncmFtKGdsLCB7XHJcbiAgICAgICAgICAgIHZlcnRleDogVXRpbHMuY29weVZlcnRleCxcclxuICAgICAgICAgICAgZnJhZ21lbnQ6IFV0aWxzLmNvcHlGcmFnbWVudCxcclxuICAgICAgICAgICAgdW5pZm9ybXM6IHt0TWFwOiB7dmFsdWU6IHt0ZXh0dXJlOiBudWxsfX19LFxyXG4gICAgICAgICAgICBkZXB0aFRlc3Q6IGZhbHNlLFxyXG4gICAgICAgICAgICBkZXB0aFdyaXRlOiBmYWxzZSxcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLm9ydGhvQ2FtZXJhXyA9IG5ldyBDYW1lcmEoZ2wpO1xyXG4gICAgICAgIHRoaXMub3J0aG9DYW1lcmFfLm9ydGhvZ3JhcGhpYyh7bmVhcjogMCwgZmFyOiAxMCwgbGVmdDogLTEsIHJpZ2h0OiAxLCBib3R0b206IC0xLCB0b3A6IDF9KTtcclxuICAgICAgICBsZXQgcGxhbmUgPSBuZXcgUGxhbmUoZ2wsIHt3aWR0aDogMiwgaGVpZ2h0OiAyfSk7XHJcbiAgICAgICAgdGhpcy5tZXNoXyA9IG5ldyBNZXNoKGdsLCB7Z2VvbWV0cnk6IHBsYW5lfSk7XHJcbiAgICAgICAgdGhpcy5tZXNoXy5zZXRQYXJlbnQodGhpcy5vcnRob1NjZW5lXyk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHN0YXRpYyBnZXRJbnN0YW5jZShnbDogYW55KTogVXRpbHMge1xyXG4gICAgICAgIGxldCBpbnMgPSBVdGlscy5pbnN0YW5jZU1hcF8uZ2V0KGdsLmNhbnZhcy5pZCk7XHJcbiAgICAgICAgaWYgKCFpbnMpIFV0aWxzLmluc3RhbmNlTWFwXy5zZXQoZ2wuY2FudmFzLmlkLCAoaW5zID0gbmV3IFV0aWxzKGdsKSkpO1xyXG4gICAgICAgIHJldHVybiBpbnM7XHJcbiAgICB9XHJcblxyXG4gICAgcmVuZGVyUGFzcyhyZW5kZXJlcjogUmVuZGVyZXIsIHByb2dyYW06IFByb2dyYW0sIHRhcmdldD86IFJlbmRlclRhcmdldCwgY2xlYXI/OiBib29sZWFuKSB7XHJcbiAgICAgICAgdGhpcy5tZXNoXy5wcm9ncmFtID0gcHJvZ3JhbTtcclxuICAgICAgICByZW5kZXJlci5yZW5kZXIoe3NjZW5lOiB0aGlzLm9ydGhvU2NlbmVfLCBjYW1lcmE6IHRoaXMub3J0aG9DYW1lcmFfLCB0YXJnZXQsIGNsZWFyfSk7XHJcbiAgICB9XHJcblxyXG4gICAgYmxpdChyZW5kZXJlcjogUmVuZGVyZXIsIHNvdXJjZTogUmVuZGVyVGFyZ2V0IHwgVGV4dHVyZSwgdGFyZ2V0PzogUmVuZGVyVGFyZ2V0LCBjbGVhcj86IGJvb2xlYW4pIHtcclxuICAgICAgICB0aGlzLmNvcHlwcm9ncmFtXy51bmlmb3Jtc1sndE1hcCddLnZhbHVlID0gc291cmNlLnRleHR1cmUgPyBzb3VyY2UudGV4dHVyZSA6IHNvdXJjZTtcclxuICAgICAgICB0aGlzLnJlbmRlclBhc3MocmVuZGVyZXIsIHRoaXMuY29weXByb2dyYW1fLCB0YXJnZXQsIGNsZWFyKVxyXG4gICAgICAgIHRoaXMubWVzaF8ucHJvZ3JhbSA9IHRoaXMuY29weXByb2dyYW1fO1xyXG4gICAgfVxyXG5cclxufVxyXG4iLCJpbXBvcnQge1xuICAgIENhbWVyYSxcbiAgICBPR0xSZW5kZXJpbmdDb250ZXh0LFxuICAgIFBvc3RGQk8sIFBvc3RPcHRpb25zLFxuICAgIFByb2dyYW0sXG4gICAgUmVuZGVyZXIsXG4gICAgUmVuZGVyVGFyZ2V0LFxuICAgIFJlbmRlclRhcmdldE9wdGlvbnMsXG4gICAgVHJhbnNmb3JtXG59IGZyb20gXCIuLi9vZ2xcIjtcbmltcG9ydCB7VXRpbHN9IGZyb20gXCIuLi9leHRyYXMvUmVuZGVyVXRpbHNcIjtcbmltcG9ydCB7Q3VzdG9tUG9zdCwgUGFzc30gZnJvbSBcIi4uL2V4dHJhcy9DdXN0b21Qb3N0XCI7XG5pbXBvcnQge0VuY29kaW5nSGVscGVyLCBUb25lTWFwcGluZ0hlbHBlcn0gZnJvbSBcIi4uL3V0aWxzL3V0aWxcIjtcbmV4cG9ydCBjbGFzcyBIRFJSZW5kZXJQYXNzIGV4dGVuZHMgUGFzcyB7XG4gICAgcHJpdmF0ZSBibGFja1Byb2dyYW06IFByb2dyYW07XG4gICAgZ2V0IGNhbWVyYSgpOiBDYW1lcmEge1xuICAgICAgICByZXR1cm4gdGhpcy5fY2FtZXJhO1xuICAgIH1cbiAgICBnZXQgc2NlbmUoKTogVHJhbnNmb3JtIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NjZW5lO1xuICAgIH1cbiAgICBwcml2YXRlIF9zY2VuZTogVHJhbnNmb3JtO1xuICAgIHByaXZhdGUgX2NhbWVyYTogQ2FtZXJhO1xuICAgIHByaXZhdGUgYmxlbmRQcm9ncmFtOiBQcm9ncmFtO1xuICAgIHByaXZhdGUgZ2w6IE9HTFJlbmRlcmluZ0NvbnRleHQ7XG4gICAgY29uc3RydWN0b3IoZ2w6IE9HTFJlbmRlcmluZ0NvbnRleHQsIHNjZW5lOiBUcmFuc2Zvcm0sIGNhbWVyYTogQ2FtZXJhKSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIHRoaXMuZ2wgPSBnbDtcbiAgICAgICAgdGhpcy5fc2NlbmUgPSBzY2VuZTtcbiAgICAgICAgdGhpcy5fY2FtZXJhID0gY2FtZXJhO1xuICAgICAgICB0aGlzLm5lZWRzU3dhcCA9IHRydWU7XG4gICAgICAgIHRoaXMuYmxlbmRQcm9ncmFtID0gbmV3IFByb2dyYW0oZ2wsIHt2ZXJ0ZXg6IFV0aWxzLmNvcHlWZXJ0ZXgsIGZyYWdtZW50OiBgXG4gICAgICAgICAgICBwcmVjaXNpb24gaGlnaHAgZmxvYXQ7XG4gICAgICAgICAgICAjZGVmaW5lIGlucHV0RW5jb2RpbmcgJHtFbmNvZGluZ0hlbHBlci5SR0JNMTZ9XG4gICAgICAgICAgICAjZGVmaW5lIG91dHB1dEVuY29kaW5nICR7RW5jb2RpbmdIZWxwZXIuUkdCTTE2fVxuICAgICAgICAgICAgJHtFbmNvZGluZ0hlbHBlci5zaGFkZXJDaHVua31cbiAgICAgICAgICAgIHVuaWZvcm0gc2FtcGxlcjJEIHRPcGFxdWU7XG4gICAgICAgICAgICB1bmlmb3JtIHNhbXBsZXIyRCB0VHJhbnNwYXJlbnQ7XG4gICAgICAgICAgICB2YXJ5aW5nIHZlYzIgdlV2O1xuICAgICAgICAgICAgdm9pZCBtYWluKCkge1xuICAgICAgICAgICAgICAgIHZlYzMgb3BhcXVlID0gaW5wdXRUZXhlbFRvTGluZWFyKHRleHR1cmUyRCh0T3BhcXVlLCB2VXYpKS5yZ2I7XG4gICAgICAgICAgICAgICAgdmVjNCB0cmFuc3BhcmVudCA9IHRleHR1cmUyRCh0VHJhbnNwYXJlbnQsIHZVdik7XG4gICAgICAgICAgICAgICAgZ2xfRnJhZ0NvbG9yID0gbGluZWFyVG9PdXRwdXRUZXhlbCh2ZWM0KG9wYXF1ZSAqICgxLiAtIHRyYW5zcGFyZW50LmEpICsgdHJhbnNwYXJlbnQucmdiICogdHJhbnNwYXJlbnQuYSwgMS4pKTtcbiAgICAgICAgICAgICAgICAvLyBnbF9GcmFnQ29sb3IgPSBsaW5lYXJUb091dHB1dFRleGVsKHZlYzQob3BhcXVlLCAxLikpO1xuICAgICAgICAgICAgfVxuICAgICAgICBgLCB1bmlmb3Jtczoge1xuICAgICAgICAgICAgICAgIHRPcGFxdWU6IHt2YWx1ZToge3RleHR1cmU6IG51bGx9fSxcbiAgICAgICAgICAgICAgICB0VHJhbnNwYXJlbnQ6IHt2YWx1ZToge3RleHR1cmU6IG51bGx9fVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGRlcHRoVGVzdDogZmFsc2UsXG4gICAgICAgICAgICBkZXB0aFdyaXRlOiBmYWxzZVxuXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmJsYWNrUHJvZ3JhbSA9IG5ldyBQcm9ncmFtKGdsLCB7dmVydGV4OiBVdGlscy5jb3B5VmVydGV4LCBmcmFnbWVudDogYFxuICAgICAgICAgICAgcHJlY2lzaW9uIGhpZ2hwIGZsb2F0O1xuICAgICAgICAgICAgdmFyeWluZyB2ZWMyIHZVdjtcbiAgICAgICAgICAgIHZvaWQgbWFpbigpIHtcbiAgICAgICAgICAgICAgICBnbF9GcmFnQ29sb3IgPSB2ZWM0KDAsMCwwLDApO1xuICAgICAgICAgICAgfVxuICAgICAgICBgLCB1bmlmb3Jtczoge1xuICAgICAgICAgICAgICAgIHRPcGFxdWU6IHt2YWx1ZToge3RleHR1cmU6IG51bGx9fSxcbiAgICAgICAgICAgICAgICB0VHJhbnNwYXJlbnQ6IHt2YWx1ZToge3RleHR1cmU6IG51bGx9fVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGRlcHRoVGVzdDogZmFsc2UsXG4gICAgICAgICAgICBkZXB0aFdyaXRlOiBmYWxzZVxuXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHJlbmRlcldpdGhGQk8ocmVuZGVyZXI6IFJlbmRlcmVyLCBmYm86IEhEUkZyYW1lKXtcbiAgICAgICAgdGhpcy5fc2NlbmUudXBkYXRlTWF0cml4V29ybGQoKTtcbiAgICAgICAgcmVuZGVyZXIuZ2wuY2xlYXJDb2xvcigwLDAsMCwwKTtcbiAgICAgICAgaWYgKGZiby50cmFuc3BhcmVudCAmJiBmYm8ucmVhZCkge1xuICAgICAgICAgICAgaWYgKCEoZmJvLnRyYW5zcGFyZW50ICYmIGZiby5yZWFkKSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxldCByZW5kZXJMaXN0ID0gcmVuZGVyZXIuc29ydFJlbmRlckxpc3QocmVuZGVyZXIuc2NlbmVUb1JlbmRlckxpc3QodGhpcy5fc2NlbmUsIHRydWUsIHRoaXMuX2NhbWVyYSksIHRoaXMuX2NhbWVyYSwgdHJ1ZSk7XG4gICAgICAgICAgICByZW5kZXJlci5yZW5kZXIoe1xuICAgICAgICAgICAgICAgIHNjZW5lOiByZW5kZXJMaXN0Lm9wYXF1ZSxcbiAgICAgICAgICAgICAgICBjYW1lcmE6IHRoaXMuX2NhbWVyYSxcbiAgICAgICAgICAgICAgICB0YXJnZXQ6IGZiby5yZWFkLFxuICAgICAgICAgICAgICAgIHNvcnQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGNsZWFyOiBmYWxzZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLmdsLmJpbmRGcmFtZWJ1ZmZlcihmYm8udHJhbnNwYXJlbnQudGFyZ2V0LCBmYm8udHJhbnNwYXJlbnQuYnVmZmVyKTtcbiAgICAgICAgICAgIGlmIChmYm8ucmVhZC5kZXB0aCAmJiAhZmJvLnJlYWQuc3RlbmNpbCkge1xuICAgICAgICAgICAgICAgIHRoaXMuZ2wuZnJhbWVidWZmZXJSZW5kZXJidWZmZXIoZmJvLnRyYW5zcGFyZW50LnRhcmdldCwgdGhpcy5nbC5ERVBUSF9BVFRBQ0hNRU5ULCB0aGlzLmdsLlJFTkRFUkJVRkZFUiwgZmJvLnJlYWQuZGVwdGhCdWZmZXIpO1xuICAgICAgICAgICAgfWVsc2UgaWYgKGZiby5yZWFkLnN0ZW5jaWwgJiYgIWZiby5yZWFkLmRlcHRoKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5nbC5mcmFtZWJ1ZmZlclJlbmRlcmJ1ZmZlcihmYm8udHJhbnNwYXJlbnQudGFyZ2V0LCB0aGlzLmdsLlNURU5DSUxfQVRUQUNITUVOVCwgdGhpcy5nbC5SRU5ERVJCVUZGRVIsIGZiby5yZWFkLnN0ZW5jaWxCdWZmZXIpO1xuICAgICAgICAgICAgfWVsc2UgaWYgKGZiby5yZWFkLmRlcHRoICYmIGZiby5yZWFkLnN0ZW5jaWwpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmdsLmZyYW1lYnVmZmVyUmVuZGVyYnVmZmVyKGZiby50cmFuc3BhcmVudC50YXJnZXQsIHRoaXMuZ2wuREVQVEhfU1RFTkNJTF9BVFRBQ0hNRU5ULCB0aGlzLmdsLlJFTkRFUkJVRkZFUiwgZmJvLnJlYWQuZGVwdGhTdGVuY2lsQnVmZmVyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZiby50cmFuc3BhcmVudC5kZXB0aCA9IHRydWU7XG4gICAgICAgICAgICBsZXQgb2xkQ2xlYXJDb2xvciA9IHJlbmRlcmVyLmNvbG9yO1xuICAgICAgICAgICAgbGV0IG9sZENsZWFyRGVwdGggPSByZW5kZXJlci5kZXB0aDtcbiAgICAgICAgICAgIHJlbmRlcmVyLmNvbG9yID0gdHJ1ZTtcbiAgICAgICAgICAgIHJlbmRlcmVyLmRlcHRoID0gZmFsc2U7XG4gICAgICAgICAgICAvL3RvZG86IGNoZWNrIHN0ZW5jaWxcbiAgICAgICAgICAgIHJlbmRlcmVyLnJlbmRlcih7XG4gICAgICAgICAgICAgICAgc2NlbmU6IFsuLi5yZW5kZXJMaXN0LnRyYW5zcGFyZW50LCAuLi5yZW5kZXJMaXN0LnVpXSxcbiAgICAgICAgICAgICAgICBjYW1lcmE6IHRoaXMuX2NhbWVyYSxcbiAgICAgICAgICAgICAgICB0YXJnZXQ6IGZiby50cmFuc3BhcmVudCxcbiAgICAgICAgICAgICAgICBzb3J0OiBmYWxzZSxcbiAgICAgICAgICAgICAgICBjbGVhcjogdHJ1ZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLmJsZW5kUHJvZ3JhbS51bmlmb3Jtcy50T3BhcXVlLnZhbHVlID0gZmJvLnJlYWQudGV4dHVyZTtcbiAgICAgICAgICAgIHRoaXMuYmxlbmRQcm9ncmFtLnVuaWZvcm1zLnRUcmFuc3BhcmVudC52YWx1ZSA9IGZiby50cmFuc3BhcmVudC50ZXh0dXJlO1xuICAgICAgICAgICAgVXRpbHMuZ2V0SW5zdGFuY2UocmVuZGVyZXIuZ2wpLnJlbmRlclBhc3MocmVuZGVyZXIsIHRoaXMuYmxlbmRQcm9ncmFtLCBmYm8ud3JpdGUsIHRydWUpO1xuICAgICAgICAgICAgcmVuZGVyZXIuY29sb3IgPSBvbGRDbGVhckNvbG9yO1xuICAgICAgICAgICAgcmVuZGVyZXIuZGVwdGggPSBvbGRDbGVhckRlcHRoO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVuZGVyZXIucmVuZGVyKHtzY2VuZTogdGhpcy5fc2NlbmUsIGNhbWVyYTogdGhpcy5fY2FtZXJhLCB0YXJnZXQ6IGZiby5yZWFkfSk7XG4gICAgICAgIH1cbiAgICB9XG59XG5leHBvcnQgY2xhc3MgSERSVG9uZU1hcFBhc3MgZXh0ZW5kcyBQYXNzIHtcbiAgICBwcml2YXRlIHRvbmVNYXBQcm9ncmFtOiBQcm9ncmFtO1xuICAgIHByaXZhdGUgZ2w6IE9HTFJlbmRlcmluZ0NvbnRleHQ7XG4gICAgY29uc3RydWN0b3IoZ2w6IE9HTFJlbmRlcmluZ0NvbnRleHQsIGhkciA9IHRydWUpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgdGhpcy5nbCA9IGdsO1xuICAgICAgICB0aGlzLm5lZWRzU3dhcCA9IGZhbHNlO1xuICAgICAgICB0aGlzLnRvbmVNYXBQcm9ncmFtID0gbmV3IFByb2dyYW0oZ2wsIHt2ZXJ0ZXg6IFV0aWxzLmNvcHlWZXJ0ZXgsIGZyYWdtZW50OiBgXG4gICAgICAgICAgICBwcmVjaXNpb24gaGlnaHAgZmxvYXQ7XG4gICAgICAgICAgICAjZGVmaW5lIGlucHV0RW5jb2RpbmcgJHtoZHI/RW5jb2RpbmdIZWxwZXIuUkdCTTE2OkVuY29kaW5nSGVscGVyLkxpbmVhcn1cbiAgICAgICAgICAgICNkZWZpbmUgb3V0cHV0RW5jb2RpbmcgJHtFbmNvZGluZ0hlbHBlci5zUkdCfVxuICAgICAgICAgICAgI2RlZmluZSB0b25lbWFwcGluZ01vZGUgJHtUb25lTWFwcGluZ0hlbHBlci5MaW5lYXJ9XG4gICAgICAgICAgICAke0VuY29kaW5nSGVscGVyLnNoYWRlckNodW5rfVxuICAgICAgICAgICAgJHtUb25lTWFwcGluZ0hlbHBlci5zaGFkZXJDaHVua31cbiAgICAgICAgICAgIHVuaWZvcm0gc2FtcGxlcjJEIHRNYXA7XG4gICAgICAgICAgICB2YXJ5aW5nIHZlYzIgdlV2O1xuICAgICAgICAgICAgdm9pZCBtYWluKCkge1xuICAgICAgICAgICAgICAgIHZlYzQgY29sb3IgPSBpbnB1dFRleGVsVG9MaW5lYXIodGV4dHVyZTJEKHRNYXAsIHZVdikpO1xuICAgICAgICAgICAgICAgIGNvbG9yLnJnYiA9IHRvbmVNYXBDb2xvcihjb2xvci5yZ2IpO1xuICAgICAgICAgICAgICAgIGdsX0ZyYWdDb2xvciA9IGxpbmVhclRvT3V0cHV0VGV4ZWwoY29sb3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICBgLCB1bmlmb3Jtczoge1xuICAgICAgICAgICAgICAgIHRNYXA6IHt2YWx1ZToge3RleHR1cmU6IG51bGx9fSxcbiAgICAgICAgICAgICAgICAuLi5Ub25lTWFwcGluZ0hlbHBlci51bmlmb3JtcyAvL3RvZG86IHVuaWZvcm0gdXRpbHMgY2xvbmUuXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGRlcHRoVGVzdDogZmFsc2UsXG4gICAgICAgICAgICAgICAgZGVwdGhXcml0ZTogZmFsc2VcbiAgICAgICAgICAgIH1cbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICByZW5kZXJXaXRoRkJPKHJlbmRlcmVyOiBSZW5kZXJlciwgZmJvOiBIRFJGcmFtZSl7XG4gICAgICAgIHRoaXMudG9uZU1hcFByb2dyYW0udW5pZm9ybXNbJ3RNYXAnXS52YWx1ZSA9IGZiby5yZWFkPy50ZXh0dXJlO1xuICAgICAgICBVdGlscy5nZXRJbnN0YW5jZShyZW5kZXJlci5nbCkucmVuZGVyUGFzcyhyZW5kZXJlciwgdGhpcy50b25lTWFwUHJvZ3JhbSwgdGhpcy5yZW5kZXJUb1NjcmVlbiA/IHVuZGVmaW5lZCA6IGZiby53cml0ZSwgdHJ1ZSk7XG4gICAgfVxuICAgIHJlc2l6ZSh7IHdpZHRoLCBoZWlnaHQsIGRwciB9OiBQYXJ0aWFsPHtcbiAgICAgICAgd2lkdGg6IG51bWJlcjtcbiAgICAgICAgaGVpZ2h0OiBudW1iZXI7XG4gICAgICAgIGRwcjogbnVtYmVyO1xuICAgIH0+KTogdm9pZHtcbiAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBIRFJIZWxwZXIge1xuICAgIHJlYWRvbmx5IGZsb2F0aW5nU3VwcG9ydEV4dCA9IHtcbiAgICAgICAgdGV4dHVyZTogJ09FU190ZXh0dXJlX2Zsb2F0JyxcbiAgICAgICAgbGluZWFyOiAnT0VTX3RleHR1cmVfZmxvYXRfbGluZWFyJyxcbiAgICAgICAgY29sb3I6ICdXRUJHTF9jb2xvcl9idWZmZXJfZmxvYXQnLFxuICAgICAgICBoX3RleHR1cmU6ICdPRVNfdGV4dHVyZV9oYWxmX2Zsb2F0JyxcbiAgICAgICAgaF9saW5lYXI6ICdPRVNfdGV4dHVyZV9oYWxmX2Zsb2F0X2xpbmVhcicsXG4gICAgICAgIGhfY29sb3I6ICdFWFRfY29sb3JfYnVmZmVyX2hhbGZfZmxvYXQnLFxuICAgIH07XG4gICAgcHJpdmF0ZSByZWFkb25seSBfZmxvYXRpbmdTdXBwb3J0OiBhbnkgPSB7XG4gICAgICAgIHRleHR1cmU6IGZhbHNlLFxuICAgICAgICBsaW5lYXI6IGZhbHNlLFxuICAgICAgICBjb2xvcjogZmFsc2UsXG4gICAgICAgIGhfdGV4dHVyZTogZmFsc2UsXG4gICAgICAgIGhfbGluZWFyOiBmYWxzZSxcbiAgICAgICAgaF9jb2xvcjogZmFsc2UsXG4gICAgfTtcbiAgICBwcml2YXRlIGdsOiBPR0xSZW5kZXJpbmdDb250ZXh0O1xuICAgIGdldCBoYWxmRmxvYXRUeXBlKCk6IG51bWJlcntcbiAgICAgICAgcmV0dXJuIHRoaXMuZmxvYXRpbmdTdXBwb3J0LmhfY29sb3IgPyB0aGlzLmZsb2F0aW5nU3VwcG9ydC5oX3RleHR1cmUuSEFMRl9GTE9BVF9PRVMgOiB0aGlzLmZsb2F0VHlwZTtcbiAgICB9O1xuICAgIGdldCBmbG9hdFR5cGUoKTogbnVtYmVye1xuICAgICAgICByZXR1cm4gKHRoaXMuZmxvYXRpbmdTdXBwb3J0LmNvbG9yID8gdGhpcy5nbC5GTE9BVCA6IHRoaXMuZ2wuVU5TSUdORURfQllURSk7XG4gICAgfTtcbiAgICBnZXQgaW50VHlwZSgpOiBudW1iZXJ7XG4gICAgICAgIHJldHVybiB0aGlzLmdsLlVOU0lHTkVEX0JZVEU7XG4gICAgfTtcbiAgICBnZXQgY2FuRmxvYXREcmF3KCk6IG51bWJlcntcbiAgICAgICAgcmV0dXJuIHRoaXMuZmxvYXRpbmdTdXBwb3J0LmhfY29sb3IgfHwgdGhpcy5mbG9hdGluZ1N1cHBvcnQuY29sb3I7XG4gICAgfTtcblxuICAgIGNvbnN0cnVjdG9yKGdsOiBPR0xSZW5kZXJpbmdDb250ZXh0KSB7XG4gICAgICAgIHRoaXMuZ2wgPSBnbDtcbiAgICAgICAgdGhpcy5pbml0RmxvYXRTdXBwb3J0KCk7XG4gICAgfVxuXG4gICAgaW5pdEZsb2F0U3VwcG9ydCgpIHtcbiAgICAgICAgbGV0IGV4dCA9IHRoaXMuZ2wuZ2V0RXh0ZW5zaW9uKHRoaXMuZmxvYXRpbmdTdXBwb3J0RXh0LnRleHR1cmUpO1xuICAgICAgICBpZiAoZXh0KSB7XG4gICAgICAgICAgICB0aGlzLl9mbG9hdGluZ1N1cHBvcnQudGV4dHVyZSA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLl9mbG9hdGluZ1N1cHBvcnQuY29sb3IgPSB0aGlzLmdsLmdldEV4dGVuc2lvbih0aGlzLmZsb2F0aW5nU3VwcG9ydEV4dC5jb2xvcik7IC8vIHRvZG8gY2hlY2sgYnkgZHJhd2luZ1xuICAgICAgICAgICAgdGhpcy5fZmxvYXRpbmdTdXBwb3J0LmxpbmVhciA9IHRoaXMuZ2wuZ2V0RXh0ZW5zaW9uKHRoaXMuZmxvYXRpbmdTdXBwb3J0RXh0LmxpbmVhcik7XG4gICAgICAgIH1cbiAgICAgICAgZXh0ID0gdGhpcy5nbC5nZXRFeHRlbnNpb24odGhpcy5mbG9hdGluZ1N1cHBvcnRFeHQuaF90ZXh0dXJlKTtcbiAgICAgICAgaWYgKGV4dCkge1xuICAgICAgICAgICAgdGhpcy5fZmxvYXRpbmdTdXBwb3J0LmhfdGV4dHVyZSA9IGV4dDtcbiAgICAgICAgICAgIHRoaXMuX2Zsb2F0aW5nU3VwcG9ydC5oX2NvbG9yID0gdGhpcy5nbC5nZXRFeHRlbnNpb24odGhpcy5mbG9hdGluZ1N1cHBvcnRFeHQuaF9jb2xvcik7XG4gICAgICAgICAgICB0aGlzLl9mbG9hdGluZ1N1cHBvcnQuaF9saW5lYXIgPSB0aGlzLmdsLmdldEV4dGVuc2lvbih0aGlzLmZsb2F0aW5nU3VwcG9ydEV4dC5oX2xpbmVhcik7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZ2V0IGZsb2F0aW5nU3VwcG9ydCgpOiBhbnkge1xuICAgICAgICByZXR1cm4gey4uLnRoaXMuX2Zsb2F0aW5nU3VwcG9ydH07XG4gICAgfVxuXG5cbn1cblxuZXhwb3J0IGNsYXNzIEhEUkZyYW1lIGltcGxlbWVudHMgUG9zdEZCT3tcbiAgICByZWFkPzogUmVuZGVyVGFyZ2V0O1xuICAgIHdyaXRlPzogUmVuZGVyVGFyZ2V0O1xuICAgIHRyYW5zcGFyZW50PzogUmVuZGVyVGFyZ2V0O1xuICAgIHByaXZhdGUgZ2w6IE9HTFJlbmRlcmluZ0NvbnRleHQ7XG4gICAgcHJpdmF0ZSBoZWxwZXI6IEhEUkhlbHBlcjtcblxuICAgIGNvbnN0cnVjdG9yKGdsOiBPR0xSZW5kZXJpbmdDb250ZXh0LCBoZWxwZXI6IEhEUkhlbHBlcikge1xuICAgICAgICB0aGlzLmdsID0gZ2w7XG4gICAgICAgIHRoaXMuaGVscGVyID0gaGVscGVyO1xuICAgIH1cbiAgICBzd2FwKCk6IHZvaWQge1xuICAgICAgICBsZXQgdCA9IHRoaXMucmVhZDtcbiAgICAgICAgdGhpcy5yZWFkID0gdGhpcy53cml0ZTtcbiAgICAgICAgdGhpcy53cml0ZSA9IHQ7XG4gICAgfVxuXG4gICAgY3JlYXRlKG9wdGlvbnM6IFBhcnRpYWw8UmVuZGVyVGFyZ2V0T3B0aW9ucz4pe1xuICAgICAgICB0aGlzLnJlYWQgPSBuZXcgUmVuZGVyVGFyZ2V0KHRoaXMuZ2wsIG9wdGlvbnMpO1xuICAgICAgICB0aGlzLndyaXRlID0gbmV3IFJlbmRlclRhcmdldCh0aGlzLmdsLCBvcHRpb25zKTtcbiAgICAgICAgdGhpcy50cmFuc3BhcmVudCA9IG5ldyBSZW5kZXJUYXJnZXQodGhpcy5nbCwge1xuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgICAgIHR5cGU6IHRoaXMuaGVscGVyLmhhbGZGbG9hdFR5cGUsXG4gICAgICAgICAgICBmb3JtYXQ6IHRoaXMuZ2wuUkdCQSxcbiAgICAgICAgICAgIGRlcHRoOiBmYWxzZSxcbiAgICAgICAgICAgIGludGVybmFsRm9ybWF0OiAodGhpcy5oZWxwZXIuY2FuRmxvYXREcmF3ICYmIHRoaXMuZ2wucmVuZGVyZXIuaXNXZWJnbDIpID8gKHRoaXMuZ2wgYXMgV2ViR0wyUmVuZGVyaW5nQ29udGV4dCkuUkdCQTMyRiA6IHRoaXMuZ2wuUkdCQSxcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZGlzcG9zZSgpe1xuICAgICAgICB0aGlzLnJlYWQgJiYgdGhpcy5yZWFkLmRpc3Bvc2UoKTtcbiAgICAgICAgdGhpcy53cml0ZSAmJiB0aGlzLndyaXRlLmRpc3Bvc2UoKTtcbiAgICAgICAgdGhpcy50cmFuc3BhcmVudCAmJiB0aGlzLnRyYW5zcGFyZW50LmRpc3Bvc2UoKTtcbiAgICAgICAgdGhpcy5yZWFkID0gdW5kZWZpbmVkO1xuICAgICAgICB0aGlzLndyaXRlID0gdW5kZWZpbmVkO1xuICAgICAgICB0aGlzLnRyYW5zcGFyZW50ID0gdW5kZWZpbmVkO1xuICAgIH1cblxufVxuXG5leHBvcnQgaW50ZXJmYWNlIEhEUlBvc3RPcHRpb25zIGV4dGVuZHMgUG9zdE9wdGlvbnN7XG4gICAgLy8gZW5jb2Rpbmc6IG51bWJlclxufVxuXG5leHBvcnQgY2xhc3MgSERSQ29tcG9zZXIgZXh0ZW5kcyBDdXN0b21Qb3N0e1xuICAgIGNvbnN0cnVjdG9yKGdsOiBPR0xSZW5kZXJpbmdDb250ZXh0LCBvcHRpb25zOiBQYXJ0aWFsPEhEUlBvc3RPcHRpb25zPikge1xuICAgICAgICBzdXBlcihnbCwgb3B0aW9ucywgbmV3IEhEUkZyYW1lKGdsLCBuZXcgSERSSGVscGVyKGdsKSkpO1xuICAgIH1cblxuICAgIGRpc3Bvc2VGYm8oKSB7XG4gICAgICAgICh0aGlzLmZibyBhcyBIRFJGcmFtZSkuZGlzcG9zZSgpO1xuICAgIH1cblxuICAgIGluaXRGYm8oKSB7XG4gICAgICAgICh0aGlzLmZibyBhcyBIRFJGcmFtZSkuY3JlYXRlKHRoaXMub3B0aW9ucyk7XG4gICAgfVxufVxuIiwiZXhwb3J0ICogZnJvbSBcIi4vb2dsXCJcblxuZXhwb3J0ICogZnJvbSAnLi9tYXRlcmlhbHMvcGJybWF0ZXJpYWwnO1xuZXhwb3J0ICogZnJvbSBcIi4vdXRpbHMvdW5pZm9ybVV0aWxzXCI7XG5leHBvcnQgKiBmcm9tIFwiLi91dGlscy9wYnJoZWxwZXJcIjtcbmV4cG9ydCAqIGZyb20gXCIuL3V0aWxzL3V0aWxcIjtcbmV4cG9ydCAqIGZyb20gXCIuL3V0aWxzL2V2ZW50ZGlzcGF0Y2hlclwiO1xuZXhwb3J0ICogZnJvbSBcIi4vZXh0cmFzL0N1c3RvbVBvc3RcIjtcbmV4cG9ydCAqIGZyb20gXCIuL2V4dHJhcy9SZW5kZXJVdGlsc1wiO1xuZXhwb3J0ICogZnJvbSBcIi4vaGRyL0hEUkNvbXBvc2VyXCI7XG4iLCJpbXBvcnQgcGJydmVydCBmcm9tICcuL3NoYWRlcnMvcGJyLnZlcnQnO1xuaW1wb3J0IHBicmZyYWcgZnJvbSAnLi9zaGFkZXJzL3Bici5mcmFnJztcbmltcG9ydCB7UHJvZ3JhbUNhY2hlfSBmcm9tICcuLi91dGlscy9wcm9ncmFtY2FjaGUnO1xuaW1wb3J0IHtQcm9ncmFtLCBUZXh0dXJlLCBUZXh0dXJlTG9hZGVyLCBWZWMzLCBWZWM0fSBmcm9tIFwiLi4vb2dsXCI7XG5pbXBvcnQge0VuY29kaW5nSGVscGVyfSBmcm9tIFwiLi4vdXRpbHMvdXRpbFwiO1xuXG5leHBvcnQgdHlwZSBUVW5pZm9ybXMgPSBSZWNvcmQ8c3RyaW5nLCB7IHZhbHVlPzogYW55IH0+XG5cbmV4cG9ydCBjbGFzcyBQQlJNYXRlcmlhbCB7XG4gICAgcHJvdGVjdGVkIHN0YXRpYyByZWFkb25seSBkZWZhdWx0VmVydGV4OiBzdHJpbmcgPSBwYnJ2ZXJ0O1xuICAgIHByb3RlY3RlZCBzdGF0aWMgcmVhZG9ubHkgZGVmYXVsdEZyYWdtZW50OiBzdHJpbmcgPSBgJHtwYnJmcmFnfWBcblxuICAgIHByaXZhdGUgZ2xfOiBhbnk7XG4gICAgcHJpdmF0ZSBwcm9ncmFtXzogUHJvZ3JhbTtcbiAgICBwcml2YXRlIHVuaWZvcm1zXzogYW55O1xuICAgIHByaXZhdGUgc3RhdGljIGx1dFRleHR1cmVNYXA6IE1hcDxzdHJpbmcsIFRleHR1cmU+ID0gbmV3IE1hcDxzdHJpbmcsIFRleHR1cmU+KCk7XG4gICAgcHJpdmF0ZSBlbnZNYXBTcGVjdWxhcl8/OiBUZXh0dXJlO1xuICAgIHByaXZhdGUgZW52TWFwRGlmZnVzZV8/OiBUZXh0dXJlO1xuXG4gICAgcHJpdmF0ZSBjb2xvcl86IFZlYzQgPSBuZXcgVmVjNCgxLCAxLCAxLCAxKTtcbiAgICBwcml2YXRlIHJvdWdobmVzc186IG51bWJlciA9IDA7XG4gICAgcHJpdmF0ZSBtZXRhbG5lc3NfOiBudW1iZXIgPSAwO1xuICAgIHByaXZhdGUgZW52TWFwSW50ZW5zaXR5XzogbnVtYmVyID0gMTtcblxuICAgIG1ha2VGcmFnbWVudFNoYWRlcihmcmFnOiBzdHJpbmcsIGhkciA9IHRydWUpe1xuICAgICAgICByZXR1cm4gYFxucHJlY2lzaW9uIGhpZ2hwIGZsb2F0O1xucHJlY2lzaW9uIGhpZ2hwIGludDtcbiNkZWZpbmUgaW5wdXRFbmNvZGluZyAke0VuY29kaW5nSGVscGVyLkxpbmVhcn1cbiNkZWZpbmUgb3V0cHV0RW5jb2RpbmcgJHtoZHI/RW5jb2RpbmdIZWxwZXIuUkdCTTE2OkVuY29kaW5nSGVscGVyLkxpbmVhcn1cbiR7RW5jb2RpbmdIZWxwZXIuc2hhZGVyQ2h1bmt9XG4ke2ZyYWd9XG5gXG4gICAgfVxuICAgIGNvbnN0cnVjdG9yKGdsOiBhbnksIHBicnBhcmFtcz86IFBCUk1hdGVyaWFsUGFyYW1zLCBkZWZpbmVzPyA6IHN0cmluZywgdW5pZm9ybXM/OiBUVW5pZm9ybXMsIHNoYWRlcnM/OiB7ZnJhZz86IHN0cmluZywgdmVydD86IHN0cmluZ30sIGhkcj10cnVlKSB7XG4gICAgICAgIHRoaXMuZ2xfID0gZ2w7XG5cbiAgICAgICAgaWYoIVBCUk1hdGVyaWFsLmx1dFRleHR1cmVNYXAuZ2V0KGdsLmNhbnZhcy5pZCkpIHtcbiAgICAgICAgICAgIFBCUk1hdGVyaWFsLmx1dFRleHR1cmVNYXAuc2V0KGdsLmNhbnZhcy5pZCwgVGV4dHVyZUxvYWRlci5sb2FkKGdsLCB7XG4gICAgICAgICAgICAgIHNyYzogJ2h0dHBzOi8vYXNzZXRzLmpld2xyLmNvbS9qM2QvbHV0LnBuZycsXG4gICAgICAgICAgICB9KSk7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgcGJyVmVydCA9IHNoYWRlcnM/LnZlcnQgPz8gUEJSTWF0ZXJpYWwuZGVmYXVsdFZlcnRleDtcbiAgICAgICAgbGV0IHBickZyYWcgPSBzaGFkZXJzPy5mcmFnID8/IFBCUk1hdGVyaWFsLmRlZmF1bHRGcmFnbWVudDtcblxuICAgICAgICB0aGlzLmNvbG9yXyA9IHBicnBhcmFtcz8uYmFzZUNvbG9yRmFjdG9yICE9PSB1bmRlZmluZWQgPyBuZXcgVmVjNCgpLmNvcHkocGJycGFyYW1zLmJhc2VDb2xvckZhY3RvcikgOiBuZXcgVmVjNCgxLCAxLCAxLCAxKTtcbiAgICAgICAgdGhpcy5yb3VnaG5lc3MgPSBwYnJwYXJhbXM/LnJvdWdobmVzcyAhPT0gdW5kZWZpbmVkID8gcGJycGFyYW1zLnJvdWdobmVzcyA6IDA7XG4gICAgICAgIHRoaXMubWV0YWxuZXNzID0gcGJycGFyYW1zPy5tZXRhbG5lc3MgIT09IHVuZGVmaW5lZCA/IHBicnBhcmFtcy5tZXRhbG5lc3MgOiAwO1xuICAgICAgICB0aGlzLmVudk1hcEludGVuc2l0eSA9IHBicnBhcmFtcz8uZW52TWFwSW50ZW5zaXR5ICE9PSB1bmRlZmluZWQgPyBwYnJwYXJhbXM/LmVudk1hcEludGVuc2l0eSA6IDE7XG5cbiAgICAgICAgdGhpcy51bmlmb3Jtc18gPSB7XG4gICAgICAgICAgICB1QmFzZUNvbG9yRmFjdG9yOiB7IHZhbHVlOiBuZXcgVmVjNCgpLmNvcHkodGhpcy5jb2xvcl8pIH0sXG4gICAgICAgICAgICB0QmFzZUNvbG9yOiB7IHZhbHVlOiBwYnJwYXJhbXM/LmJhc2VDb2xvclRleHR1cmUgPyBwYnJwYXJhbXM/LmJhc2VDb2xvclRleHR1cmUudGV4dHVyZSA6IG51bGwgfSxcblxuICAgICAgICAgICAgdVJvdWdobmVzczogeyB2YWx1ZTogcGJycGFyYW1zPy5yb3VnaG5lc3MgIT09IHVuZGVmaW5lZCA/IHBicnBhcmFtcz8ucm91Z2huZXNzIDogMSB9LFxuICAgICAgICAgICAgdU1ldGFsbGljOiB7IHZhbHVlOiBwYnJwYXJhbXM/Lm1ldGFsbmVzcyAhPT0gdW5kZWZpbmVkID8gcGJycGFyYW1zPy5tZXRhbG5lc3MgOiAxIH0sXG5cbiAgICAgICAgICAgIHROb3JtYWw6IHsgdmFsdWU6IHsgdGV4dHVyZTogbnVsbH0gfSxcbiAgICAgICAgICAgIHVOb3JtYWxTY2FsZTogeyB2YWx1ZTogcGJycGFyYW1zPy5ub3JtYWxTY2FsZSB8fCAxIH0sXG5cbiAgICAgICAgICAgIHRPY2NsdXNpb246IHsgdmFsdWU6IHsgdGV4dHVyZTogbnVsbH0gfSxcblxuICAgICAgICAgICAgdEVtaXNzaXZlOiB7IHZhbHVlOiB7IHRleHR1cmU6IG51bGx9IH0sXG4gICAgICAgICAgICB1RW1pc3NpdmU6IHsgdmFsdWU6IHBicnBhcmFtcz8uZW1pc3NpdmUgfHwgWzAsIDAsIDBdIH0sXG5cbiAgICAgICAgICAgIHRMVVQ6IHsgdmFsdWU6IFBCUk1hdGVyaWFsLmx1dFRleHR1cmVNYXAuZ2V0KGdsLmNhbnZhcy5pZCkgfSxcbiAgICAgICAgICAgIHRFbnZEaWZmdXNlOiB7IHZhbHVlOiB7IHRleHR1cmU6IG51bGx9IH0sXG4gICAgICAgICAgICB0RW52U3BlY3VsYXI6IHsgdmFsdWU6IHsgdGV4dHVyZTogbnVsbH0gfSxcbiAgICAgICAgICAgIHVFbnZEaWZmdXNlOiB7IHZhbHVlOiAwLjUgfSxcbiAgICAgICAgICAgIHVFbnZTcGVjdWxhcjogeyB2YWx1ZTogMC41IH0sXG4gICAgICAgICAgICB1RW52TWFwSW50ZW5zaXR5OiB7IHZhbHVlOiAxIH0sXG5cbiAgICAgICAgICAgIHVBbHBoYTogeyB2YWx1ZTogcGJycGFyYW1zPy5hbHBoYSB9LFxuICAgICAgICAgICAgdUFscGhhQ3V0b2ZmOiB7IHZhbHVlOiBwYnJwYXJhbXM/LmFscGhhQ3V0b2ZmIH0sXG5cbiAgICAgICAgICAgIHVUcmFuc3BhcmVudDogeyB2YWx1ZTogcGJycGFyYW1zPy50cmFuc3BhcmVudCB9LFxuXG4gICAgICAgICAgICAuLi4odW5pZm9ybXM/P3t9KSxcbiAgICAgICAgfVxuICAgICAgICBkZWZpbmVzID0gZGVmaW5lcyA/IGRlZmluZXMgOiBgYDtcbiAgICAgICAgdGhpcy5wcm9ncmFtXyA9IHRoaXMuY3JlYXRlUHJvZ3JhbV8oZGVmaW5lcywgcGJyVmVydCwgcGJyRnJhZywgaGRyKTtcbiAgICB9XG5cbiAgICBnZXQgaXNQQlJNYXRlcmlhbCgpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgZ2V0IHByb2dyYW0oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnByb2dyYW1fO1xuICAgIH1cblxuICAgIHNldCBjb2xvcihjb2xvcjogVmVjNCkge1xuICAgICAgICB0aGlzLmNvbG9yXy5jb3B5KGNvbG9yKTtcbiAgICB9XG5cbiAgICBnZXQgY29sb3IoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbG9yXztcbiAgICB9XG5cbiAgICBzZXQgZW1pc3NpdmUoY29sb3I6IFZlYzMpIHtcbiAgICAgICAgbGV0IGNvbG9yXyA9IHRoaXMudW5pZm9ybXNfLnVFbWlzc2l2ZS52YWx1ZTtcbiAgICAgICAgY29sb3JfLmNvcHkoY29sb3IpO1xuICAgIH1cblxuICAgIGdldCBlbWlzc2l2ZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudW5pZm9ybXNfLnVFbWlzc2l2ZS52YWx1ZTtcbiAgICB9XG5cbiAgICBzZXQgcm91Z2huZXNzKHJvdWdobmVzczogbnVtYmVyKSB7XG4gICAgICAgIHRoaXMucm91Z2huZXNzXyA9IHJvdWdobmVzcztcbiAgICB9XG5cbiAgICBnZXQgcm91Z2huZXNzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5yb3VnaG5lc3NfO1xuICAgIH1cblxuICAgIHNldCBtZXRhbG5lc3MobWV0YWxuZXNzOiBudW1iZXIpIHtcbiAgICAgICAgdGhpcy5tZXRhbG5lc3NfID0gbWV0YWxuZXNzO1xuICAgIH1cblxuICAgIGdldCBtZXRhbG5lc3MoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm1ldGFsbmVzc187XG4gICAgfVxuXG4gICAgc2V0IG5vcm1hbFNjYWxlKG5vcm1hbFNjYWxlOiBudW1iZXIpIHtcbiAgICAgICAgdGhpcy51bmlmb3Jtc18udU5vcm1hbFNjYWxlLnZhbHVlID0gbm9ybWFsU2NhbGU7XG4gICAgfVxuXG4gICAgZ2V0IG5vcm1hbFNjYWxlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy51bmlmb3Jtc18udU5vcm1hbFNjYWxlLnZhbHVlO1xuICAgIH1cblxuICAgIHNldCBlbnZNYXBTcGVjdWxhcihlbnZNYXBTcGVjdWxhcjogYW55KSB7XG4gICAgICAgIHRoaXMuZW52TWFwU3BlY3VsYXJfID0gZW52TWFwU3BlY3VsYXI7XG4gICAgfVxuXG4gICAgZ2V0IGVudk1hcFNwZWN1bGFyKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5lbnZNYXBTcGVjdWxhcl87XG4gICAgfVxuXG4gICAgc2V0IGVudk1hcERpZmZ1c2UoZW52TWFwRGlmZnVzZTogYW55KSB7XG4gICAgICAgIHRoaXMuZW52TWFwRGlmZnVzZV8gPSBlbnZNYXBEaWZmdXNlO1xuICAgIH1cblxuICAgIGdldCBlbnZNYXBEaWZmdXNlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5lbnZNYXBEaWZmdXNlXztcbiAgICB9XG5cbiAgICBzZXQgZW52TWFwSW50ZW5zaXR5KGVudk1hcEludGVuc2l0eTogYW55KSB7XG4gICAgICAgIHRoaXMuZW52TWFwSW50ZW5zaXR5XyA9IGVudk1hcEludGVuc2l0eTtcbiAgICB9XG5cbiAgICBnZXQgZW52TWFwSW50ZW5zaXR5KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5lbnZNYXBJbnRlbnNpdHlfO1xuICAgIH1cblxuICAgIHB1YmxpYyBzZXJpYWxpemUoKSA6IFBCUk1hdGVyaWFsUGFyYW1zIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGJhc2VDb2xvcjogbmV3IFZlYzQoMSwgMSwgMSwgMSksXG4gICAgICAgICAgICBiYXNlQ29sb3JGYWN0b3I6IHRoaXMuY29sb3JfLmNvcHkobmV3IFZlYzQoKSksXG4gICAgICAgICAgICByb3VnaG5lc3M6IHRoaXMucm91Z2huZXNzXyxcbiAgICAgICAgICAgIG1ldGFsbmVzczogdGhpcy5tZXRhbG5lc3NfLFxuICAgICAgICAgICAgZW52TWFwSW50ZW5zaXR5OiB0aGlzLmVudk1hcEludGVuc2l0eVxuICAgICAgICAgICAgLy8gbm9ybWFsU2NhbGU6IHRoaXMubm9ybWFsU2NhbGVcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBsb2FkKHBhcmFtczogUEJSTWF0ZXJpYWxQYXJhbXMpIHtcbiAgICAgICAgaWYocGFyYW1zKSB7XG4gICAgICAgICAgICBpZihwYXJhbXMuYmFzZUNvbG9yRmFjdG9yKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jb2xvcl8ueCA9IHBhcmFtcy5iYXNlQ29sb3JGYWN0b3JbMF0gIT09IHVuZGVmaW5lZCA/IHBhcmFtcy5iYXNlQ29sb3JGYWN0b3JbMF0gOiBwYXJhbXMuYmFzZUNvbG9yRmFjdG9yLng7XG4gICAgICAgICAgICAgICAgdGhpcy5jb2xvcl8ueSA9IHBhcmFtcy5iYXNlQ29sb3JGYWN0b3JbMV0gIT09IHVuZGVmaW5lZCA/IHBhcmFtcy5iYXNlQ29sb3JGYWN0b3JbMV0gOiBwYXJhbXMuYmFzZUNvbG9yRmFjdG9yLnk7XG4gICAgICAgICAgICAgICAgdGhpcy5jb2xvcl8ueiA9IHBhcmFtcy5iYXNlQ29sb3JGYWN0b3JbMl0gIT09IHVuZGVmaW5lZCA/IHBhcmFtcy5iYXNlQ29sb3JGYWN0b3JbMl0gOiBwYXJhbXMuYmFzZUNvbG9yRmFjdG9yLno7XG4gICAgICAgICAgICAgICAgdGhpcy5jb2xvcl8udyA9IHBhcmFtcy5iYXNlQ29sb3JGYWN0b3JbM10gIT09IHVuZGVmaW5lZCA/IHBhcmFtcy5iYXNlQ29sb3JGYWN0b3JbM10gOiBwYXJhbXMuYmFzZUNvbG9yRmFjdG9yLnc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZihwYXJhbXMuZW1pc3NpdmUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmVtaXNzaXZlLnggPSBwYXJhbXMuZW1pc3NpdmUueDtcbiAgICAgICAgICAgICAgICB0aGlzLmVtaXNzaXZlLnkgPSBwYXJhbXMuZW1pc3NpdmUueTtcbiAgICAgICAgICAgICAgICB0aGlzLmVtaXNzaXZlLnogPSBwYXJhbXMuZW1pc3NpdmUuejtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmKHBhcmFtcy5yb3VnaG5lc3MgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIHRoaXMucm91Z2huZXNzID0gcGFyYW1zLnJvdWdobmVzcztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmKHBhcmFtcy5tZXRhbG5lc3MgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIHRoaXMubWV0YWxuZXNzID0gcGFyYW1zLm1ldGFsbmVzcztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmKHBhcmFtcy5lbnZNYXBJbnRlbnNpdHkgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIHRoaXMuZW52TWFwSW50ZW5zaXR5ID0gcGFyYW1zLmVudk1hcEludGVuc2l0eTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgfVxuXG4gICAgcHJpdmF0ZSBjcmVhdGVQcm9ncmFtXyhkZWZpbmVzOiBzdHJpbmcsIHZlcnRleD86IHN0cmluZywgZnJhZ21lbnQ/OiBzdHJpbmcsIGhkcjpib29sZWFuID0gdHJ1ZSkge1xuICAgICAgICB2ZXJ0ZXggPSB2ZXJ0ZXggPz8gUEJSTWF0ZXJpYWwuZGVmYXVsdFZlcnRleFxuICAgICAgICBmcmFnbWVudCA9IHRoaXMubWFrZUZyYWdtZW50U2hhZGVyKGZyYWdtZW50ID8/IFBCUk1hdGVyaWFsLmRlZmF1bHRGcmFnbWVudCwgaGRyKTtcblxuICAgICAgICB2ZXJ0ZXggPSBkZWZpbmVzICsgdmVydGV4O1xuICAgICAgICBmcmFnbWVudCA9IGRlZmluZXMgKyBmcmFnbWVudDtcblxuICAgICAgICBsZXQgcHJvZ3JhbSA9IFByb2dyYW1DYWNoZS5nZXRJbnN0YW5jZSgpLmNyZWF0ZVByb2dyYW0odGhpcy5nbF8sIHZlcnRleCwgZnJhZ21lbnQsIHRoaXMudW5pZm9ybXNfKTtcbiAgICAgICAgLy8gY29uc3QgcHJvZ3JhbSA9IG5ldyBQcm9ncmFtKHRoaXMuZ2xfLCB7XG4gICAgICAgIC8vICAgICB2ZXJ0ZXgsXG4gICAgICAgIC8vICAgICBmcmFnbWVudCxcbiAgICAgICAgLy8gICAgIHVuaWZvcm1zOiB0aGlzLnVuaWZvcm1zXyxcbiAgICAgICAgLy8gICAgIC8vIHRyYW5zcGFyZW50OiBwYnJwYXJhbXMuYWxwaGFNb2RlID09PSAnQkxFTkQnLFxuICAgICAgICAvLyAgICAgY3VsbEZhY2U6IHBicnBhcmFtcy5zaWRlID8gbnVsbCA6IHRoaXMuZ2xfLkJBQ0ssXG4gICAgICAgIC8vIH0pO1xuXG4gICAgICAgIHJldHVybiBwcm9ncmFtO1xuICAgIH1cbn1cblxuZXhwb3J0IGludGVyZmFjZSBQQlJNYXRlcmlhbFBhcmFtcyB7XG4gICAgYmFzZUNvbG9yPzogVmVjNCxcbiAgICBiYXNlQ29sb3JGYWN0b3I/OiBWZWM0LFxuICAgIGJhc2VDb2xvclRleHR1cmU/OiBUZXh0dXJlLFxuICAgIHRSTT86IFRleHR1cmUsXG4gICAgcm91Z2huZXNzPzogbnVtYmVyLFxuICAgIG1ldGFsbmVzcz86IG51bWJlcixcbiAgICBub3JtYWxNYXA/OiBUZXh0dXJlLFxuICAgIG5vcm1hbFNjYWxlPzogbnVtYmVyLFxuICAgIGFvTWFwPzogYW55LFxuXG4gICAgZW1pc3NpdmVNYXA/OiBUZXh0dXJlLFxuICAgIGVtaXNzaXZlSW50ZW5zaXR5PzogYW55LFxuICAgIGVtaXNzaXZlPzogVmVjMyxcblxuICAgIHRFbnZEaWZmdXNlPzogVGV4dHVyZSxcbiAgICB0RW52U3BlY3VsYXI/OiBUZXh0dXJlLFxuICAgIHVFbnZEaWZmdXNlPzogbnVtYmVyLFxuICAgIHVFbnZTcGVjdWxhcj86IG51bWJlcixcbiAgICB1RW52SW50ZW5zaXR5PzogbnVtYmVyLFxuXG4gICAgYWxwaGE/OiBudW1iZXIsXG4gICAgYWxwaGFDdXRvZmY/OiBudW1iZXIsXG4gICAgc2lkZT86IG51bWJlcixcbiAgICB0cmFuc3BhcmVudD86IGJvb2xlYW4sXG4gICAgZW52TWFwSW50ZW5zaXR5PzogbnVtYmVyXG59XG4iLCIvKipcbiAqIHBvcnRlZCBmcm9tIGh0dHBzOi8vZ2l0aHViLmNvbS9tcmRvb2IvZXZlbnRkaXNwYXRjaGVyLmpzL1xuICovXG5cbmV4cG9ydCBjbGFzcyBFdmVudERpc3BhdGNoZXIge1xuICAgIHByaXZhdGUgX2xpc3RlbmVyczogYW55O1xuICAgIFxuXHRhZGRFdmVudExpc3RlbmVyICggdHlwZTogc3RyaW5nLCBsaXN0ZW5lciA6IGFueSApIHtcblxuXHRcdGlmICggdGhpcy5fbGlzdGVuZXJzID09PSB1bmRlZmluZWQgKSB0aGlzLl9saXN0ZW5lcnMgPSB7fTtcblxuXHRcdHZhciBsaXN0ZW5lcnMgPSB0aGlzLl9saXN0ZW5lcnM7XG5cblx0XHRpZiAoIGxpc3RlbmVyc1sgdHlwZSBdID09PSB1bmRlZmluZWQgKSB7XG5cblx0XHRcdGxpc3RlbmVyc1sgdHlwZSBdID0gW107XG5cblx0XHR9XG5cblx0XHRpZiAoIGxpc3RlbmVyc1sgdHlwZSBdLmluZGV4T2YoIGxpc3RlbmVyICkgPT09IC0gMSApIHtcblxuXHRcdFx0bGlzdGVuZXJzWyB0eXBlIF0ucHVzaCggbGlzdGVuZXIgKTtcblxuXHRcdH1cblxuXHR9XG5cblx0aGFzRXZlbnRMaXN0ZW5lciggdHlwZTogc3RyaW5nLCBsaXN0ZW5lciA6IGFueSkge1xuXG5cdFx0aWYgKCB0aGlzLl9saXN0ZW5lcnMgPT09IHVuZGVmaW5lZCApIHJldHVybiBmYWxzZTtcblxuXHRcdHZhciBsaXN0ZW5lcnMgPSB0aGlzLl9saXN0ZW5lcnM7XG5cblx0XHRyZXR1cm4gbGlzdGVuZXJzWyB0eXBlIF0gIT09IHVuZGVmaW5lZCAmJiBsaXN0ZW5lcnNbIHR5cGUgXS5pbmRleE9mKCBsaXN0ZW5lciApICE9PSAtIDE7XG5cblx0fVxuXG5cdHJlbW92ZUV2ZW50TGlzdGVuZXIoIHR5cGUgOiBzdHJpbmcsIGxpc3RlbmVyIDogYW55KSB7XG5cblx0XHRpZiAoIHRoaXMuX2xpc3RlbmVycyA9PT0gdW5kZWZpbmVkICkgcmV0dXJuO1xuXG5cdFx0dmFyIGxpc3RlbmVycyA9IHRoaXMuX2xpc3RlbmVycztcblx0XHR2YXIgbGlzdGVuZXJBcnJheSA9IGxpc3RlbmVyc1sgdHlwZSBdO1xuXG5cdFx0aWYgKCBsaXN0ZW5lckFycmF5ICE9PSB1bmRlZmluZWQgKSB7XG5cblx0XHRcdHZhciBpbmRleCA9IGxpc3RlbmVyQXJyYXkuaW5kZXhPZiggbGlzdGVuZXIgKTtcblxuXHRcdFx0aWYgKCBpbmRleCAhPT0gLSAxICkge1xuXG5cdFx0XHRcdGxpc3RlbmVyQXJyYXkuc3BsaWNlKCBpbmRleCwgMSApO1xuXG5cdFx0XHR9XG5cblx0XHR9XG5cblx0fVxuXG5cdGRpc3BhdGNoRXZlbnQoIGV2ZW50IDogYW55ICkge1xuXG5cdFx0aWYgKCB0aGlzLl9saXN0ZW5lcnMgPT09IHVuZGVmaW5lZCApIHJldHVybjtcblxuXHRcdHZhciBsaXN0ZW5lcnMgPSB0aGlzLl9saXN0ZW5lcnM7XG5cdFx0dmFyIGxpc3RlbmVyQXJyYXkgPSBsaXN0ZW5lcnNbIGV2ZW50LnR5cGUgXTtcblxuXHRcdGlmICggbGlzdGVuZXJBcnJheSAhPT0gdW5kZWZpbmVkICkge1xuXG5cdFx0XHRldmVudC50YXJnZXQgPSB0aGlzO1xuXG5cdFx0XHQvLyBNYWtlIGEgY29weSwgaW4gY2FzZSBsaXN0ZW5lcnMgYXJlIHJlbW92ZWQgd2hpbGUgaXRlcmF0aW5nLlxuXHRcdFx0dmFyIGFycmF5ID0gbGlzdGVuZXJBcnJheS5zbGljZSggMCApO1xuXG5cdFx0XHRmb3IgKCB2YXIgaSA9IDAsIGwgPSBhcnJheS5sZW5ndGg7IGkgPCBsOyBpICsrICkge1xuXG5cdFx0XHRcdGFycmF5WyBpIF0uY2FsbCggdGhpcywgZXZlbnQgKTtcblxuXHRcdFx0fVxuXG5cdFx0fVxuXG5cdH1cbn0iLCJpbXBvcnQge1BCUk1hdGVyaWFsLCBQQlJNYXRlcmlhbFBhcmFtc30gZnJvbSBcIi4uL21hdGVyaWFscy9wYnJtYXRlcmlhbFwiO1xuaW1wb3J0IHtNZXNoLCBPR0xSZW5kZXJpbmdDb250ZXh0LCBUcmFuc2Zvcm0sIFZlYzR9IGZyb20gXCIuLi9vZ2xcIjtcblxuXG5mdW5jdGlvbiBnZXRQQlJQYXJhbXMoZ2x0Zk1hdGVyaWFsOiBhbnkpIHtcbiAgICBsZXQgcGJycGFyYW1zOiBQQlJNYXRlcmlhbFBhcmFtcyA9IHtcbiAgICAgICAgYmFzZUNvbG9yOiBnbHRmTWF0ZXJpYWwuYmFzZUNvbG9yID8gbmV3IFZlYzQoKS5mcm9tQXJyYXkoZ2x0Zk1hdGVyaWFsLmJhc2VDb2xvcikgOiBuZXcgVmVjNCgxLCAxLCAxKSxcbiAgICAgICAgYmFzZUNvbG9yRmFjdG9yOiBnbHRmTWF0ZXJpYWwuYmFzZUNvbG9yRmFjdG9yID8gbmV3IFZlYzQoKS5mcm9tQXJyYXkoZ2x0Zk1hdGVyaWFsLmJhc2VDb2xvckZhY3RvcikgOiBuZXcgVmVjNCgxLCAxLCAxKSxcbiAgICAgICAgcm91Z2huZXNzOiBnbHRmTWF0ZXJpYWwucm91Z2huZXNzRmFjdG9yICE9PSB1bmRlZmluZWQgPyBnbHRmTWF0ZXJpYWwucm91Z2huZXNzRmFjdG9yIDogMC41LFxuICAgICAgICBtZXRhbG5lc3M6IGdsdGZNYXRlcmlhbC5tZXRhbGxpY0ZhY3RvciAhPT0gdW5kZWZpbmVkID8gZ2x0Zk1hdGVyaWFsLm1ldGFsbGljRmFjdG9yIDogMC41LFxuICAgICAgICBhbHBoYTogMSxcbiAgICAgICAgYWxwaGFDdXRvZmY6IGdsdGZNYXRlcmlhbC5hbHBoYUN1dG9mZixcbiAgICAgICAgc2lkZTogZ2x0Zk1hdGVyaWFsLmRvdWJsZVNpZGVkICE9PSB1bmRlZmluZWQgPyBnbHRmTWF0ZXJpYWwuZG91YmxlU2lkZWQgOiBmYWxzZSxcbiAgICAgICAgdHJhbnNwYXJlbnQ6IGdsdGZNYXRlcmlhbC5hbHBoYU1vZGUgIT09IHVuZGVmaW5lZCA/IGdsdGZNYXRlcmlhbC5hbHBoYU1vZGUgPT09ICdCTEVORCcgOiBmYWxzZVxuICAgIH1cbiAgICByZXR1cm4gcGJycGFyYW1zO1xufVxuXG5mdW5jdGlvbiB1cGRhdGVVbmlmb3Jtc18obWF0ZXJpYWw/OiBQQlJNYXRlcmlhbCkge1xuICAgIGlmKG1hdGVyaWFsICYmIG1hdGVyaWFsIGluc3RhbmNlb2YgUEJSTWF0ZXJpYWwpIHtcbiAgICAgICAgbGV0IHByb2dyYW0gPSBtYXRlcmlhbC5wcm9ncmFtO1xuICAgICAgICBwcm9ncmFtLnVuaWZvcm1zWyd1QmFzZUNvbG9yRmFjdG9yJ10udmFsdWUuY29weShtYXRlcmlhbC5jb2xvcik7XG4gICAgICAgIHByb2dyYW0udW5pZm9ybXNbJ3VSb3VnaG5lc3MnXS52YWx1ZSA9IG1hdGVyaWFsLnJvdWdobmVzcztcbiAgICAgICAgcHJvZ3JhbS51bmlmb3Jtc1sndU1ldGFsbGljJ10udmFsdWUgPSBtYXRlcmlhbC5tZXRhbG5lc3M7XG4gICAgICAgIHByb2dyYW0udW5pZm9ybXNbJ3VFbnZNYXBJbnRlbnNpdHknXS52YWx1ZSA9IG1hdGVyaWFsLmVudk1hcEludGVuc2l0eTtcbiAgICAgICAgcHJvZ3JhbS51bmlmb3Jtc1sndEVudkRpZmZ1c2UnXS52YWx1ZSA9IG1hdGVyaWFsLmVudk1hcERpZmZ1c2U7XG4gICAgICAgIHByb2dyYW0udW5pZm9ybXNbJ3RFbnZTcGVjdWxhciddLnZhbHVlID0gbWF0ZXJpYWwuZW52TWFwU3BlY3VsYXI7XG4gICAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gYXNzaWduUEJSTWF0ZXJpYWxzKGdsOiBPR0xSZW5kZXJpbmdDb250ZXh0LCByb290OiBUcmFuc2Zvcm0sIG1hdGVyaWFsQ3Rvcj86IChnbDogT0dMUmVuZGVyaW5nQ29udGV4dCwgcDogUEJSTWF0ZXJpYWxQYXJhbXMsIGRlZmluZXM6IHN0cmluZyk9PlBCUk1hdGVyaWFsLCBoZHIgPSB0cnVlKSB7XG4gICAgcm9vdC50cmF2ZXJzZSgobm9kZSkgPT4ge1xuICAgICAgICBpZiAobm9kZSBpbnN0YW5jZW9mIE1lc2ggJiYgbm9kZS5wcm9ncmFtICYmICEobm9kZSBhcyBhbnkpPy5tYXRlcmlhbD8uaXNEaWFtb25kTWF0ZXJpYWwgJiYgbm9kZS5wcm9ncmFtLmdsdGZNYXRlcmlhbCkgeyAvL3RvZG86IGlzRGlhbW9uZE1hdGVyaWFsIG9uIG5vZGU/P1xuICAgICAgICAgICAgbGV0IGRlZmluZXMgPSBgJHtub2RlLmdlb21ldHJ5LmF0dHJpYnV0ZXMudXYgPyBgI2RlZmluZSBVVlxcbmAgOiBgYH1gO1xuICAgICAgICAgICAgbGV0IG1hdGVyaWFsID0gbWF0ZXJpYWxDdG9yID9cbiAgICAgICAgICAgICAgICBtYXRlcmlhbEN0b3IoZ2wsIGdldFBCUlBhcmFtcyhub2RlLnByb2dyYW0uZ2x0Zk1hdGVyaWFsKSwgZGVmaW5lcykgOlxuICAgICAgICAgICAgICAgIG5ldyBQQlJNYXRlcmlhbChnbCwgZ2V0UEJSUGFyYW1zKG5vZGUucHJvZ3JhbS5nbHRmTWF0ZXJpYWwpLCBkZWZpbmVzLCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgaGRyKTtcbiAgICAgICAgICAgIG5vZGUubWF0ZXJpYWwgPSBtYXRlcmlhbDtcbiAgICAgICAgICAgIG5vZGUucHJvZ3JhbSA9IG1hdGVyaWFsLnByb2dyYW07XG5cbiAgICAgICAgICAgIG5vZGUub25CZWZvcmVSZW5kZXIoICh2YWx1ZTogYW55KSA9PiB7XG4gICAgICAgICAgICAgICAgdXBkYXRlVW5pZm9ybXNfKG5vZGUubWF0ZXJpYWwpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYoKG5vZGUgYXMgYW55KT8ubWF0ZXJpYWw/LmlzRGlhbW9uZE1hdGVyaWFsKXtcbiAgICAgICAgICAgIChub2RlIGFzIE1lc2gpLnByb2dyYW0udHJhbnNwYXJlbnQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgfSk7XG59XG4iLCJpbXBvcnQge1Byb2dyYW19IGZyb20gJy4uL29nbCdcblxuZXhwb3J0IGNsYXNzIFByb2dyYW1DYWNoZSB7XG5cbiAgICBwcml2YXRlIHByb2dyYW1NYXBfOiBNYXA8c3RyaW5nLCBQcm9ncmFtPiA9IG5ldyBNYXA8c3RyaW5nLCBQcm9ncmFtPigpO1xuICAgIHByaXZhdGUgc3RhdGljIGluc3RhbmNlXzogUHJvZ3JhbUNhY2hlO1xuXG4gICAgcHJpdmF0ZSBjb25zdHJ1Y3RvcigpIHtcbiAgICB9XG5cbiAgICBzdGF0aWMgZ2V0SW5zdGFuY2UoKSB7XG4gICAgICAgIGlmKCF0aGlzLmluc3RhbmNlXykge1xuICAgICAgICAgICAgdGhpcy5pbnN0YW5jZV8gPSBuZXcgUHJvZ3JhbUNhY2hlKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuaW5zdGFuY2VfO1xuICAgIH1cblxuICAgIGNyZWF0ZVByb2dyYW0oZ2w6IGFueSwgdmVydGV4OiBzdHJpbmcsIGZyYWdtZW50OiBzdHJpbmcsIHVuaWZvcm1zOiBhbnkpIHtcbiAgICAgICAgbGV0IGtleSA9IHZlcnRleCArIGZyYWdtZW50ICsgZ2wuY2FudmFzLmlkO1xuICAgICAgICBsZXQgY2FjaGVkUHJvZ3JhbSA9IHRoaXMucHJvZ3JhbU1hcF8uZ2V0KGtleSk7XG4gICAgICAgIGlmKGNhY2hlZFByb2dyYW0pIHtcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRQcm9ncmFtO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHByb2dyYW0gPSBuZXcgUHJvZ3JhbShnbCwge1xuICAgICAgICAgICAgdmVydGV4LFxuICAgICAgICAgICAgZnJhZ21lbnQsXG4gICAgICAgICAgICB1bmlmb3JtczogdW5pZm9ybXMsXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLnByb2dyYW1NYXBfLnNldChrZXksIHByb2dyYW0pO1xuICAgICAgICByZXR1cm4gcHJvZ3JhbTtcbiAgICB9XG59XG4iLCIvKipcbiAqIFVuaWZvcm0gVXRpbGl0aWVzLFxuICovXG5pbXBvcnQge1RVbmlmb3Jtc30gZnJvbSBcIi4uL21hdGVyaWFscy9wYnJtYXRlcmlhbFwiO1xuXG5leHBvcnQgZnVuY3Rpb24gY2xvbmVVbmlmb3Jtcyggc3JjOiBUVW5pZm9ybXMgKSB7XG4gICAgY29uc3QgZHN0OiBhbnkgPSB7fTtcbiAgICBmb3IgKGxldCB1IGluIHNyYyApIHtcbiAgICAgICAgZHN0WyB1IF0gPSB7fTtcbiAgICAgICAgZm9yIChsZXQgcCBpbiBzcmNbIHUgXSApIHtcbiAgICAgICAgICAgIGNvbnN0IHByb3BlcnR5ID0gKHNyYyBhcyBhbnkpW3VdW3BdO1xuICAgICAgICAgICAgaWYgKCBwcm9wZXJ0eSAmJiAodHlwZW9mIHByb3BlcnR5LmNsb25lID09PSAnZnVuY3Rpb24nICkgKSB7XG4gICAgICAgICAgICAgICAgZHN0WyB1IF1bIHAgXSA9IHByb3BlcnR5LmNsb25lKCk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKCBBcnJheS5pc0FycmF5KCBwcm9wZXJ0eSApICkge1xuICAgICAgICAgICAgICAgIGRzdFsgdSBdWyBwIF0gPSBwcm9wZXJ0eS5zbGljZSgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBkc3RbIHUgXVsgcCBdID0gcHJvcGVydHk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGRzdDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1lcmdlVW5pZm9ybXMoIHVuaWZvcm1zOiBUVW5pZm9ybXMgKSB7XG4gICAgY29uc3QgbWVyZ2VkOiBhbnkgPSB7fTtcbiAgICBmb3IgKGxldCB1ID0gMDsgdSA8IHVuaWZvcm1zLmxlbmd0aDsgdSArKyApIHtcbiAgICAgICAgY29uc3QgdG1wID0gY2xvbmVVbmlmb3Jtcyh1bmlmb3Jtc1t1XSk7XG4gICAgICAgIGZvciAobGV0IHAgaW4gdG1wICkge1xuICAgICAgICAgICAgbWVyZ2VkWyBwIF0gPSB0bXBbIHAgXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbWVyZ2VkO1xufSIsImltcG9ydCB7TWVzaCwgUmVuZGVyZXIsIFRyYW5zZm9ybSwgVmVjM30gZnJvbSBcIi4uL29nbFwiO1xuaW1wb3J0IGVuY29kaW5nQ2h1bmsgZnJvbSBcIi4uL3NoYWRlcnMvZW5jb2RpbmdfcGFyLmdsc2xcIlxuaW1wb3J0IHRvbmVNYXBwaW5nQ2h1bmsgZnJvbSBcIi4uL3NoYWRlcnMvdG9uZW1hcHBpbmdfcGFyLmdsc2xcIlxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0U25hcHNob3REYXRhKHJlbmRlcmVyOiBSZW5kZXJlciwgbWltZVR5cGU/OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIG1pbWVUeXBlID0gbWltZVR5cGUgPz8gXCJpbWFnZS9wbmdcIjtcbiAgICByZXR1cm4gcmVuZGVyZXIuZ2wuY2FudmFzLnRvRGF0YVVSTChtaW1lVHlwZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRTbmFwc2hvdChyZW5kZXJlcjogUmVuZGVyZXIsIG9wdGlvbnM6IHsgbWltZVR5cGU/OiBzdHJpbmcsIGNvbnRleHQ/OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsIGNhbnZhcz86IEhUTUxDYW52YXNFbGVtZW50IH0pOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIGxldCBpbWdVcmwgPSBnZXRTbmFwc2hvdERhdGEocmVuZGVyZXIsIG9wdGlvbnMubWltZVR5cGUpO1xuICAgIGxldCBjb250ZXh0ID0gb3B0aW9ucy5jb250ZXh0ID8/IG9wdGlvbnMuY2FudmFzPy5nZXRDb250ZXh0KFwiMmRcIik7XG4gICAgaWYgKCFjb250ZXh0KVxuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGltZ1VybCk7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlPHN0cmluZz4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICBsZXQgaW1nID0gbmV3IEltYWdlKCk7XG4gICAgICAgIGltZy5vbmxvYWQgPSAoKSA9PiB7XG4gICAgICAgICAgICBjb250ZXh0Py5kcmF3SW1hZ2UoaW1nLCAwLCAwLCBjb250ZXh0IS5jYW52YXMud2lkdGgsIGNvbnRleHQhLmNhbnZhcy5oZWlnaHQpO1xuICAgICAgICAgICAgcmVzb2x2ZShpbWdVcmwpO1xuICAgICAgICB9O1xuICAgICAgICBpbWcuc3JjID0gaW1nVXJsO1xuICAgIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0UG9pbnRlclBvc2l0aW9uKHBvc2l0aW9uOiB7eDogbnVtYmVyLCB5OiBudW1iZXJ9LCBjYW52YXM6IEhUTUxDYW52YXNFbGVtZW50KSB7XG4gICAgY29uc3QgY2FudmFzQm91bmRzID0gY2FudmFzLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgIGxldCB4ID0gKChwb3NpdGlvbi54IC0gY2FudmFzQm91bmRzLmxlZnQpIC8gKGNhbnZhc0JvdW5kcy5yaWdodCAtIGNhbnZhc0JvdW5kcy5sZWZ0KSkgKiAyIC0gMTtcbiAgICBsZXQgeSA9IC0oKHBvc2l0aW9uLnkgLSBjYW52YXNCb3VuZHMudG9wKSAvIChjYW52YXNCb3VuZHMuYm90dG9tIC0gY2FudmFzQm91bmRzLnRvcCkpICogMiArIDE7XG4gICAgcmV0dXJueyB4OiB4LCB5OiB5fTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEFsbE1lc2hlcyhyb290OiBUcmFuc2Zvcm0pIHtcbiAgICBsZXQgbWVzaGVzIDogYW55ID0gW107XG4gICAgcm9vdC50cmF2ZXJzZSgoZ3JvdXApID0+IHtcbiAgICAgICAgaWYoKGdyb3VwIGFzIE1lc2gpPy5nZW9tZXRyeSkge1xuICAgICAgICAgICAgaWYgKCFncm91cC5wYXJlbnQpIHJldHVybjsgLy8gU2tpcCB1bmF0dGFjaGVkXG4gICAgICAgICAgICBtZXNoZXMucHVzaChncm91cCk7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gbWVzaGVzO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY29tcHV0ZUJvdW5kaW5nQm94KHJvb3Q6IFRyYW5zZm9ybSkge1xuICAgIGNvbnN0IG1pbiA9IG5ldyBWZWMzKCtJbmZpbml0eSk7XG4gICAgY29uc3QgbWF4ID0gbmV3IFZlYzMoLUluZmluaXR5KTtcbiAgICBcbiAgICBjb25zdCBib3VuZHNNaW4gPSBuZXcgVmVjMygpO1xuICAgIGNvbnN0IGJvdW5kc01heCA9IG5ldyBWZWMzKCk7XG4gICAgY29uc3QgYm91bmRzQ2VudGVyID0gbmV3IFZlYzMoKTtcbiAgICBjb25zdCBib3VuZHNTY2FsZSA9IG5ldyBWZWMzKCk7XG4gICAgXG4gICAgcm9vdC50cmF2ZXJzZSgoZ3JvdXApID0+IHtcbiAgICAgICAgbGV0IGdlb21ldHJ5ID0gKGdyb3VwIGFzIE1lc2gpPy5nZW9tZXRyeTtcbiAgICAgICAgaWYoZ2VvbWV0cnkpIHtcbiAgICAgICAgICAgIGlmICghZ3JvdXAucGFyZW50KSByZXR1cm47IC8vIFNraXAgdW5hdHRhY2hlZFxuXG4gICAgICAgICAgICBpZiAoIWdlb21ldHJ5LmJvdW5kcykgZ2VvbWV0cnkuY29tcHV0ZUJvdW5kaW5nU3BoZXJlKCk7XG5cbiAgICAgICAgICAgIGJvdW5kc0NlbnRlci5jb3B5KGdlb21ldHJ5LmJvdW5kcy5jZW50ZXIpLmFwcGx5TWF0cml4NChncm91cC53b3JsZE1hdHJpeCk7XG5cbiAgICAgICAgICAgIC8vIEdldCBtYXggd29ybGQgc2NhbGUgYXhpc1xuICAgICAgICAgICAgZ3JvdXAud29ybGRNYXRyaXguZ2V0U2NhbGluZyhib3VuZHNTY2FsZSk7XG4gICAgICAgICAgICBjb25zdCByYWRpdXNTY2FsZSA9IE1hdGgubWF4KE1hdGgubWF4KGJvdW5kc1NjYWxlWzBdLCBib3VuZHNTY2FsZVsxXSksIGJvdW5kc1NjYWxlWzJdKTtcbiAgICAgICAgICAgIGNvbnN0IHJhZGl1cyA9IGdlb21ldHJ5LmJvdW5kcy5yYWRpdXMgKiByYWRpdXNTY2FsZTtcblxuICAgICAgICAgICAgYm91bmRzTWluLnNldCgtcmFkaXVzKS5hZGQoYm91bmRzQ2VudGVyKTtcbiAgICAgICAgICAgIGJvdW5kc01heC5zZXQoK3JhZGl1cykuYWRkKGJvdW5kc0NlbnRlcik7XG5cbiAgICAgICAgICAgIC8vIEFwcGx5IHdvcmxkIG1hdHJpeCB0byBib3VuZHNcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgMzsgaSsrKSB7XG4gICAgICAgICAgICAgICAgbWluW2ldID0gTWF0aC5taW4obWluW2ldLCBib3VuZHNNaW5baV0pO1xuICAgICAgICAgICAgICAgIG1heFtpXSA9IE1hdGgubWF4KG1heFtpXSwgYm91bmRzTWF4W2ldKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIHttaW46IG1pbiwgbWF4OiBtYXh9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdHJhdmVyc2Uocm9vdDogVHJhbnNmb3JtLCBjYWxsQmFjazogYW55LCBmaWx0ZXI/OiBhbnkpIHtcbiAgICByb290LnRyYXZlcnNlKChncm91cDogVHJhbnNmb3JtKSA9PiB7XG4gICAgICAgIGlmKGZpbHRlcikge1xuICAgICAgICAgICAgaWYoZmlsdGVyKGdyb3VwKSkge1xuICAgICAgICAgICAgICAgIGNhbGxCYWNrKGdyb3VwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNhbGxCYWNrKGdyb3VwKTtcbiAgICAgICAgfVxuICAgIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdHJhdmVyc2VNZXNoZXMocm9vdDogVHJhbnNmb3JtLCBjYWxsQmFjazogYW55KSB7XG4gICAgdHJhdmVyc2Uocm9vdCwgY2FsbEJhY2ssIChncm91cDogVHJhbnNmb3JtKT0+IHtyZXR1cm4gKGdyb3VwIGFzIE1lc2gpLmdlb21ldHJ5ICE9IG51bGx9KTtcbn1cblxuZXhwb3J0IGNvbnN0IEVuY29kaW5nSGVscGVyID0ge1xuICAgIExpbmVhcjogMCxcbiAgICBzUkdCOiAxLFxuICAgIFJHQkU6IDIsXG4gICAgUkdCTTc6IDMsXG4gICAgUkdCTTE2OiA0LFxuICAgIFJHQkQ6IDUsXG4gICAgR2FtbWE6IDYsXG4gICAgc2hhZGVyQ2h1bms6IGVuY29kaW5nQ2h1bmtcbn07XG5leHBvcnQgY29uc3QgVG9uZU1hcHBpbmdIZWxwZXIgPSB7XG4gICAgTGluZWFyOiAwLFxuICAgIFJlaW5oYXJkOiAxLFxuICAgIENpbmVvbjogMixcbiAgICBBQ0VTRmlsbWljOiAzLFxuICAgIHVuaWZvcm1zOiB7XG4gICAgICAgIHRvbmVNYXBwaW5nRXhwb3N1cmU6IHt2YWx1ZTogMS59XG4gICAgfSxcbiAgICBzaGFkZXJDaHVuazogdG9uZU1hcHBpbmdDaHVua1xufVxuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0aWYoX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSkge1xuXHRcdHJldHVybiBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiLy8gc3RhcnR1cFxuLy8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4vLyBUaGlzIGVudHJ5IG1vZHVsZSBpcyByZWZlcmVuY2VkIGJ5IG90aGVyIG1vZHVsZXMgc28gaXQgY2FuJ3QgYmUgaW5saW5lZFxudmFyIF9fd2VicGFja19leHBvcnRzX18gPSBfX3dlYnBhY2tfcmVxdWlyZV9fKFwiLi9zcmMvaW5kZXgudHNcIik7XG4iXSwic291cmNlUm9vdCI6IiJ9