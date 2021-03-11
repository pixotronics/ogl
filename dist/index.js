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
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ("#ifndef saturate\n#define saturate (a) clamp( a, 0.0, 1.0 )\n#endif\n\nuniform float toneMappingExposure;\n\n// exposure only\nvec3 LinearToneMapping( vec3 color ) {\n\n    return toneMappingExposure * color;\n\n}\n\n// source: https://www.cs.utah.edu/~reinhard/cdrom/\nvec3 ReinhardToneMapping( vec3 color ) {\n\n    color *= toneMappingExposure;\n    return saturate ( color / ( vec3( 1.0 ) + color ) );\n\n}\n\n// source: http://filmicworlds.com/blog/filmic-tonemapping-operators/\nvec3 OptimizedCineonToneMapping( vec3 color ) {\n\n    // optimized filmic operator by Jim Hejl and Richard Burgess-Dawson\n    color *= toneMappingExposure;\n    color = max( vec3( 0.0 ), color - 0.004 );\n    return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );\n\n}\n\n// source: https://github.com/selfshadow/ltc_code/blob/master/webgl/shaders/ltc/ltc_blit.fs\nvec3 RRTAndODTFit( vec3 v ) {\n\n    vec3 a = v * ( v + 0.0245786 ) - 0.000090537;\n    vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;\n    return a / b;\n\n}\n\n// this implementation of ACES is modified to accommodate a brighter viewing environment.\n// the scale factor of 1/0.6 is subjective. see discussion in #19621.\n\nvec3 ACESFilmicToneMapping( vec3 color ) {\n\n    // sRGB => XYZ => D65_2_D60 => AP1 => RRT_SAT\n    const mat3 ACESInputMat = mat3(\n    vec3( 0.59719, 0.07600, 0.02840 ), // transposed from source\n    vec3( 0.35458, 0.90834, 0.13383 ),\n    vec3( 0.04823, 0.01566, 0.83777 )\n    );\n\n    // ODT_SAT => XYZ => D60_2_D65 => sRGB\n    const mat3 ACESOutputMat = mat3(\n    vec3(  1.60475, -0.10208, -0.00327 ), // transposed from source\n    vec3( -0.53108,  1.10813, -0.07276 ),\n    vec3( -0.07367, -0.00605,  1.07602 )\n    );\n\n    color *= toneMappingExposure / 0.6;\n\n    color = ACESInputMat * color;\n\n    // Apply RRT and ODT\n    color = RRTAndODTFit( color );\n\n    color = ACESOutputMat * color;\n\n    // Clamp to [0, 1]\n    return saturate( color );\n\n}\n\nvec3 CustomToneMapping( vec3 color ) { return color; }\n\nvec3 toneMapColor(vec3 value){\n    if ( tonemappingMode == 0 ) {\n        return LinearToneMapping ( value );\n    } else if ( tonemappingMode == 1 ) {\n        return ReinhardToneMapping ( value );\n    } else if ( tonemappingMode == 2 ) {\n        return OptimizedCineonToneMapping ( value );\n    } else if ( tonemappingMode == 3 ) {\n        return ACESFilmicToneMapping ( value );\n    } else {\n        return value;\n    }\n}\n\n");

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
    constructor(gl) {
        super();
        this.gl = gl;
        this.needsSwap = false;
        this.toneMapProgram = new ogl_1.Program(gl, { vertex: RenderUtils_1.Utils.copyVertex, fragment: `
            precision highp float;
            #define inputEncoding ${util_1.EncodingHelper.RGBM16}
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
        let pbrVert = (_a = shaders === null || shaders === void 0 ? void 0 : shaders.vert) !== null && _a !== void 0 ? _a : PBRMaterial.defaultVertex;
        let pbrFrag = (_b = shaders === null || shaders === void 0 ? void 0 : shaders.frag) !== null && _b !== void 0 ? _b : PBRMaterial.defaultFragment;
        this.color_ = (pbrparams === null || pbrparams === void 0 ? void 0 : pbrparams.baseColorFactor) !== undefined ? new ogl_1.Vec4().copy(pbrparams.baseColorFactor) : new ogl_1.Vec4(1, 1, 1, 1);
        this.roughness = (pbrparams === null || pbrparams === void 0 ? void 0 : pbrparams.roughness) !== undefined ? pbrparams.roughness : 0;
        this.metalness = (pbrparams === null || pbrparams === void 0 ? void 0 : pbrparams.metalness) !== undefined ? pbrparams.metalness : 0;
        this.envMapIntensity = (pbrparams === null || pbrparams === void 0 ? void 0 : pbrparams.envMapIntensity) !== undefined ? pbrparams === null || pbrparams === void 0 ? void 0 : pbrparams.envMapIntensity : 1;
        this.uniforms_ = Object.assign({ uBaseColorFactor: { value: new ogl_1.Vec4().copy(this.color_) }, tBaseColor: { value: (pbrparams === null || pbrparams === void 0 ? void 0 : pbrparams.baseColorTexture) ? pbrparams === null || pbrparams === void 0 ? void 0 : pbrparams.baseColorTexture.texture : null }, uRoughness: { value: (pbrparams === null || pbrparams === void 0 ? void 0 : pbrparams.roughness) !== undefined ? pbrparams === null || pbrparams === void 0 ? void 0 : pbrparams.roughness : 1 }, uMetallic: { value: (pbrparams === null || pbrparams === void 0 ? void 0 : pbrparams.metalness) !== undefined ? pbrparams === null || pbrparams === void 0 ? void 0 : pbrparams.metalness : 1 }, tNormal: { value: { texture: null } }, uNormalScale: { value: (pbrparams === null || pbrparams === void 0 ? void 0 : pbrparams.normalScale) || 1 }, tOcclusion: { value: { texture: null } }, tEmissive: { value: { texture: null } }, uEmissive: { value: (pbrparams === null || pbrparams === void 0 ? void 0 : pbrparams.emissive) || [0, 0, 0] }, tLUT: { value: PBRMaterial.lutTextureMap.get(gl.canvas.id) }, tEnvDiffuse: { value: { texture: null } }, tEnvSpecular: { value: { texture: null } }, uEnvDiffuse: { value: 0.5 }, uEnvSpecular: { value: 0.5 }, uEnvMapIntensity: { value: 1 }, uAlpha: { value: pbrparams === null || pbrparams === void 0 ? void 0 : pbrparams.alpha }, uAlphaCutoff: { value: pbrparams === null || pbrparams === void 0 ? void 0 : pbrparams.alphaCutoff }, uTransparent: { value: pbrparams === null || pbrparams === void 0 ? void 0 : pbrparams.transparent } }, (uniforms !== null && uniforms !== void 0 ? uniforms : {}));
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
PBRMaterial.defaultFragment = `
precision highp float;
precision highp int;
#define inputEncoding ${util_1.EncodingHelper.Linear}
#define outputEncoding ${util_1.EncodingHelper.RGBM16}
${util_1.EncodingHelper.shaderChunk} 
${pbr_frag_1.default}
`;
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
        var _a, _b, _c, _d;
        if (node instanceof ogl_1.Mesh && node.program && !((_b = (_a = node) === null || _a === void 0 ? void 0 : _a.material) === null || _b === void 0 ? void 0 : _b.isDiamondMaterial) && node.program.gltfMaterial) { //todo: isDiamondMaterial on node??
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9vZ2wvd2VicGFjay91bml2ZXJzYWxNb2R1bGVEZWZpbml0aW9uIiwid2VicGFjazovL29nbC8uL3NyYy9tYXRlcmlhbHMvc2hhZGVycy9wYnIuZnJhZyIsIndlYnBhY2s6Ly9vZ2wvLi9zcmMvbWF0ZXJpYWxzL3NoYWRlcnMvcGJyLnZlcnQiLCJ3ZWJwYWNrOi8vb2dsLy4vc3JjL3NoYWRlcnMvZW5jb2RpbmdfcGFyLmdsc2wiLCJ3ZWJwYWNrOi8vb2dsLy4vc3JjL3NoYWRlcnMvdG9uZW1hcHBpbmdfcGFyLmdsc2wiLCJ3ZWJwYWNrOi8vb2dsLy4vc3JjL2NvcmUvQ2FtZXJhLmpzIiwid2VicGFjazovL29nbC8uL3NyYy9jb3JlL0dlb21ldHJ5LmpzIiwid2VicGFjazovL29nbC8uL3NyYy9jb3JlL01lc2guanMiLCJ3ZWJwYWNrOi8vb2dsLy4vc3JjL2NvcmUvUHJvZ3JhbS5qcyIsIndlYnBhY2s6Ly9vZ2wvLi9zcmMvY29yZS9SZW5kZXJUYXJnZXQuanMiLCJ3ZWJwYWNrOi8vb2dsLy4vc3JjL2NvcmUvUmVuZGVyZXIuanMiLCJ3ZWJwYWNrOi8vb2dsLy4vc3JjL2NvcmUvVGV4dHVyZS5qcyIsIndlYnBhY2s6Ly9vZ2wvLi9zcmMvY29yZS9UcmFuc2Zvcm0uanMiLCJ3ZWJwYWNrOi8vb2dsLy4vc3JjL2V4dHJhcy9BbmltYXRpb24uanMiLCJ3ZWJwYWNrOi8vb2dsLy4vc3JjL2V4dHJhcy9Cb3guanMiLCJ3ZWJwYWNrOi8vb2dsLy4vc3JjL2V4dHJhcy9DdXJ2ZS5qcyIsIndlYnBhY2s6Ly9vZ2wvLi9zcmMvZXh0cmFzL0N5bGluZGVyLmpzIiwid2VicGFjazovL29nbC8uL3NyYy9leHRyYXMvRmxvd21hcC5qcyIsIndlYnBhY2s6Ly9vZ2wvLi9zcmMvZXh0cmFzL0dMVEZBbmltYXRpb24uanMiLCJ3ZWJwYWNrOi8vb2dsLy4vc3JjL2V4dHJhcy9HTFRGTG9hZGVyLmpzIiwid2VicGFjazovL29nbC8uL3NyYy9leHRyYXMvR0xURlNraW4uanMiLCJ3ZWJwYWNrOi8vb2dsLy4vc3JjL2V4dHJhcy9HUEdQVS5qcyIsIndlYnBhY2s6Ly9vZ2wvLi9zcmMvZXh0cmFzL0tUWFRleHR1cmUuanMiLCJ3ZWJwYWNrOi8vb2dsLy4vc3JjL2V4dHJhcy9Ob3JtYWxQcm9ncmFtLmpzIiwid2VicGFjazovL29nbC8uL3NyYy9leHRyYXMvT3JiaXQuanMiLCJ3ZWJwYWNrOi8vb2dsLy4vc3JjL2V4dHJhcy9QbGFuZS5qcyIsIndlYnBhY2s6Ly9vZ2wvLi9zcmMvZXh0cmFzL1BvbHlsaW5lLmpzIiwid2VicGFjazovL29nbC8uL3NyYy9leHRyYXMvUG9zdC5qcyIsIndlYnBhY2s6Ly9vZ2wvLi9zcmMvZXh0cmFzL1JheWNhc3QuanMiLCJ3ZWJwYWNrOi8vb2dsLy4vc3JjL2V4dHJhcy9TaGFkb3cuanMiLCJ3ZWJwYWNrOi8vb2dsLy4vc3JjL2V4dHJhcy9Ta2luLmpzIiwid2VicGFjazovL29nbC8uL3NyYy9leHRyYXMvU3BoZXJlLmpzIiwid2VicGFjazovL29nbC8uL3NyYy9leHRyYXMvVGV4dC5qcyIsIndlYnBhY2s6Ly9vZ2wvLi9zcmMvZXh0cmFzL1RleHR1cmVMb2FkZXIuanMiLCJ3ZWJwYWNrOi8vb2dsLy4vc3JjL2V4dHJhcy9Ub3J1cy5qcyIsIndlYnBhY2s6Ly9vZ2wvLi9zcmMvZXh0cmFzL1RyaWFuZ2xlLmpzIiwid2VicGFjazovL29nbC8uL3NyYy9tYXRoL0NvbG9yLmpzIiwid2VicGFjazovL29nbC8uL3NyYy9tYXRoL0V1bGVyLmpzIiwid2VicGFjazovL29nbC8uL3NyYy9tYXRoL01hdDMuanMiLCJ3ZWJwYWNrOi8vb2dsLy4vc3JjL21hdGgvTWF0NC5qcyIsIndlYnBhY2s6Ly9vZ2wvLi9zcmMvbWF0aC9RdWF0LmpzIiwid2VicGFjazovL29nbC8uL3NyYy9tYXRoL1ZlYzIuanMiLCJ3ZWJwYWNrOi8vb2dsLy4vc3JjL21hdGgvVmVjMy5qcyIsIndlYnBhY2s6Ly9vZ2wvLi9zcmMvbWF0aC9WZWM0LmpzIiwid2VicGFjazovL29nbC8uL3NyYy9tYXRoL2Z1bmN0aW9ucy9Db2xvckZ1bmMuanMiLCJ3ZWJwYWNrOi8vb2dsLy4vc3JjL21hdGgvZnVuY3Rpb25zL0V1bGVyRnVuYy5qcyIsIndlYnBhY2s6Ly9vZ2wvLi9zcmMvbWF0aC9mdW5jdGlvbnMvTWF0M0Z1bmMuanMiLCJ3ZWJwYWNrOi8vb2dsLy4vc3JjL21hdGgvZnVuY3Rpb25zL01hdDRGdW5jLmpzIiwid2VicGFjazovL29nbC8uL3NyYy9tYXRoL2Z1bmN0aW9ucy9RdWF0RnVuYy5qcyIsIndlYnBhY2s6Ly9vZ2wvLi9zcmMvbWF0aC9mdW5jdGlvbnMvVmVjMkZ1bmMuanMiLCJ3ZWJwYWNrOi8vb2dsLy4vc3JjL21hdGgvZnVuY3Rpb25zL1ZlYzNGdW5jLmpzIiwid2VicGFjazovL29nbC8uL3NyYy9tYXRoL2Z1bmN0aW9ucy9WZWM0RnVuYy5qcyIsIndlYnBhY2s6Ly9vZ2wvLi9zcmMvb2dsLmpzIiwid2VicGFjazovL29nbC8uL3NyYy9leHRyYXMvQ3VzdG9tUG9zdC50cyIsIndlYnBhY2s6Ly9vZ2wvLi9zcmMvZXh0cmFzL1JlbmRlclV0aWxzLnRzIiwid2VicGFjazovL29nbC8uL3NyYy9oZHIvSERSQ29tcG9zZXIudHMiLCJ3ZWJwYWNrOi8vb2dsLy4vc3JjL2luZGV4LnRzIiwid2VicGFjazovL29nbC8uL3NyYy9tYXRlcmlhbHMvcGJybWF0ZXJpYWwudHMiLCJ3ZWJwYWNrOi8vb2dsLy4vc3JjL3V0aWxzL2V2ZW50ZGlzcGF0Y2hlci50cyIsIndlYnBhY2s6Ly9vZ2wvLi9zcmMvdXRpbHMvcGJyaGVscGVyLnRzIiwid2VicGFjazovL29nbC8uL3NyYy91dGlscy9wcm9ncmFtY2FjaGUudHMiLCJ3ZWJwYWNrOi8vb2dsLy4vc3JjL3V0aWxzL3VuaWZvcm1VdGlscy50cyIsIndlYnBhY2s6Ly9vZ2wvLi9zcmMvdXRpbHMvdXRpbC50cyIsIndlYnBhY2s6Ly9vZ2wvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vb2dsL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly9vZ2wvd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly9vZ2wvd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly9vZ2wvd2VicGFjay9zdGFydHVwIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUM7QUFDRCxPOzs7Ozs7Ozs7Ozs7OztBQ1ZBLGlFQUFlLHlCQUF5Qiw0QkFBNEIsOEJBQThCLGdDQUFnQywrQkFBK0Isd0JBQXdCLDJCQUEyQiwwQkFBMEIsNEJBQTRCLDZCQUE2Qiw4QkFBOEIseUJBQXlCLCtCQUErQix5QkFBeUIsZ0NBQWdDLGlDQUFpQyw0QkFBNEIsNkJBQTZCLGlDQUFpQyx1QkFBdUIsNkJBQTZCLDRCQUE0QixtQkFBbUIsdUJBQXVCLHFCQUFxQixzQkFBc0IsbUNBQW1DLDRDQUE0QywwQ0FBMEMsOEJBQThCLDZCQUE2QixnQ0FBZ0MsMkNBQTJDLGlDQUFpQyxHQUFHLG9DQUFvQyx5QkFBeUIscURBQXFELEdBQUcsaUNBQWlDLHVDQUF1QyxHQUFHLG9CQUFvQiwyREFBMkQsb0NBQW9DLDhCQUE4Qiw4QkFBOEIsMkZBQTJGLGlFQUFpRSxnREFBZ0QsdURBQXVELDJCQUEyQix1Q0FBdUMsa0lBQWtJLCtCQUErQix5Q0FBeUMsYUFBYSxtQ0FBbUMsWUFBWSxpREFBaUQsMkNBQTJDLGNBQWMsR0FBRyxrS0FBa0ssd0VBQXdFLHNGQUFzRiwyREFBMkQseUdBQXlHLGdDQUFnQywrQ0FBK0Msb0JBQW9CLDRIQUE0SCxvQkFBb0Isc0JBQXNCLHNCQUFzQiw0QkFBNEIsc0NBQXNDLDRCQUE0QixzQ0FBc0Msb0VBQW9FLG9FQUFvRSwwREFBMEQsMENBQTBDLG1IQUFtSCxnRkFBZ0YsNkJBQTZCLEdBQUcsaUJBQWlCLHNDQUFzQyxnRkFBZ0YsNkRBQTZELDZEQUE2RCww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QUs7QUFDViw0QkFBNEI7QUFDNUI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHNCQUFzQjtBQUN0QjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLGdDQUFnQztBQUNoQyxvQ0FBb0M7QUFDcEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLCtCQUErQjtBQUMvQjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxxQkFBcUIsOENBQThDLEtBQUs7QUFDeEU7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FB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QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQSw0QkFBNEIsK0NBQUk7QUFDaEMseUJBQXlCLCtDQUFJO0FBQzdCLDJCQUEyQiwrQ0FBSTs7QUFFL0I7QUFDQSx5QkFBeUI7O0FBRXpCO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFD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QUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsS0FBSztBQUNoQixhQUFhLE9BQU87QUFDcEI7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsV0FBVyxLQUFLO0FBQ2hCLFdBQVcsS0FBSztBQUNoQixXQUFXLEtBQUs7QUFDaEIsYUFBYSxLQUFLO0FBQ2xCO0FBQ087QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsS0FBSztBQUNoQixXQUFXLEtBQUs7QUFDaEIsV0FBVyxLQUFLO0FBQ2hCLGFBQWEsS0FBSztBQUNsQjtBQUNPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsV0FBVyxLQUFLO0FBQ2hCLFdBQVcsS0FBSztBQUNoQixXQUFXLEtBQUs7QUFDaEIsYUFBYSxLQUFLO0FBQ2xCO0FBQ087QUFDUDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsS0FBSztBQUNoQixXQUFXLEtBQUs7QUFDaEIsV0FBVyxPQUFPO0FBQ2xCLFdBQVcsS0FBSztBQUNoQixhQUFhLEtBQUs7QUFDbEI7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZLEtBQUs7QUFDakIsWUFBWSxLQUFLO0FBQ2pCLFlBQVksS0FBSztBQUNqQjtBQUNPO0FBQ1A7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWSxLQUFLO0FBQ2pCLFlBQVksS0FBSztBQUNqQixZQUFZLEtBQUs7QUFDakI7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVyxLQUFLO0FBQ2hCLFdBQVcsS0FBSztBQUNoQixZQUFZLEtBQUs7QUFDakI7QUFDTztBQUNQOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLENBQUM7O0FBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsS0FBSztBQUNoQixXQUFXLE1BQU07QUFDakIsV0FBVyxLQUFLO0FBQ2hCLFdBQVcsS0FBSztBQUNoQixhQUFhLEtBQUs7QUFDbEI7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFD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QTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLEtBQUs7QUFDaEIsV0FBVyxLQUFLO0FBQ2hCLFdBQVcsT0FBTztBQUNsQixhQUFhLEtBQUs7QUFDbEI7QUFDTztBQUNQOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsV0FBVyxLQUFLO0FBQ2hCLFdBQVcsS0FBSztBQUNoQixXQUFXLEtBQUs7QUFDaEIsV0FBVyxPQUFPO0FBQ2xCLGFBQWEsS0FBSztBQUNsQjtBQUNPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsS0FBSztBQUNoQixXQUFXLEtBQUs7QUFDaEIsYUFBYSxLQUFLO0FBQ2xCO0FBQ087QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVyxLQUFLO0FBQ2hCLFdBQVcsS0FBSztBQUNoQixhQUFhLEtBQUs7QUFDbEI7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLEtBQUs7QUFDaEIsV0FBVyxLQUFLO0FBQ2hCLGFBQWEsS0FBSztBQUNsQjtBQUNBO0FBQ087QUFDUDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0Esd0NBQXdD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Q1AsSUFBSSxFQUFFLENBQUM7SUFDUCxLQUFLLEVBQUUsQ0FBQztJQUNSLE1BQU0sRUFBRSxDQUFDO0lBQ1QsSUFBSSxFQUFFLENBQUM7SUFDUCxLQUFLLEVBQUUsQ0FBQztJQUNSLFdBQVcsRUFBRSwyQkFBYTtDQUM3QixDQUFDO0FBQ1cseUJBQWlCLEdBQUc7SUFDN0IsTUFBTSxFQUFFLENBQUM7SUFDVCxRQUFRLEVBQUUsQ0FBQztJQUNYLE1BQU0sRUFBRSxDQUFDO0lBQ1QsVUFBVSxFQUFFLENBQUM7SUFDYixRQUFRLEVBQUU7UUFDTixtQkFBbUIsRUFBRSxFQUFDLEtBQUssRUFBRSxFQUFFLEVBQUM7S0FDbkM7SUFDRCxXQUFXLEVBQUUsOEJBQWdCO0NBQ2hDOzs7Ozs7O1VDbEhEO1VBQ0E7O1VBRUE7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBOztVQUVBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBOzs7OztXQ3JCQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLHdDQUF3Qyx5Q0FBeUM7V0FDakY7V0FDQTtXQUNBLEU7Ozs7O1dDUEEsd0Y7Ozs7O1dDQUE7V0FDQTtXQUNBO1dBQ0Esc0RBQXNELGtCQUFrQjtXQUN4RTtXQUNBLCtDQUErQyxjQUFjO1dBQzdELEU7Ozs7O1VDTkE7VUFDQTtVQUNBO1VBQ0EiLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gd2VicGFja1VuaXZlcnNhbE1vZHVsZURlZmluaXRpb24ocm9vdCwgZmFjdG9yeSkge1xuXHRpZih0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcpXG5cdFx0bW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCk7XG5cdGVsc2UgaWYodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKVxuXHRcdGRlZmluZShbXSwgZmFjdG9yeSk7XG5cdGVsc2UgaWYodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKVxuXHRcdGV4cG9ydHNbXCJvZ2xcIl0gPSBmYWN0b3J5KCk7XG5cdGVsc2Vcblx0XHRyb290W1wib2dsXCJdID0gZmFjdG9yeSgpO1xufSkoc2VsZiwgZnVuY3Rpb24oKSB7XG5yZXR1cm4gIiwiZXhwb3J0IGRlZmF1bHQgXCJ1bmlmb3JtIG1hdDQgdmlld01hdHJpeDtcXG51bmlmb3JtIG1hdDMgbm9ybWFsTWF0cml4O1xcbnVuaWZvcm0gdmVjMyBjYW1lcmFQb3NpdGlvbjtcXG51bmlmb3JtIHZlYzQgdUJhc2VDb2xvckZhY3RvcjtcXG51bmlmb3JtIHNhbXBsZXIyRCB0QmFzZUNvbG9yO1xcbnVuaWZvcm0gc2FtcGxlcjJEIHRSTTtcXG51bmlmb3JtIGZsb2F0IHVSb3VnaG5lc3M7XFxudW5pZm9ybSBmbG9hdCB1TWV0YWxsaWM7XFxudW5pZm9ybSBzYW1wbGVyMkQgdE5vcm1hbDtcXG51bmlmb3JtIGZsb2F0IHVOb3JtYWxTY2FsZTtcXG51bmlmb3JtIHNhbXBsZXIyRCB0RW1pc3NpdmU7XFxudW5pZm9ybSB2ZWMzIHVFbWlzc2l2ZTtcXG51bmlmb3JtIHNhbXBsZXIyRCB0T2NjbHVzaW9uO1xcbnVuaWZvcm0gc2FtcGxlcjJEIHRMVVQ7XFxudW5pZm9ybSBzYW1wbGVyMkQgdEVudkRpZmZ1c2U7XFxudW5pZm9ybSBzYW1wbGVyMkQgdEVudlNwZWN1bGFyO1xcbnVuaWZvcm0gZmxvYXQgdUVudkRpZmZ1c2U7XFxudW5pZm9ybSBmbG9hdCB1RW52U3BlY3VsYXI7XFxudW5pZm9ybSBmbG9hdCB1RW52TWFwSW50ZW5zaXR5O1xcbnVuaWZvcm0gZmxvYXQgdUFscGhhO1xcbnVuaWZvcm0gZmxvYXQgdUFscGhhQ3V0b2ZmO1xcbnVuaWZvcm0gYm9vbCB1VHJhbnNwYXJlbnQ7XFxudmFyeWluZyB2ZWMyIHZVdjtcXG52YXJ5aW5nIHZlYzMgdk5vcm1hbDtcXG52YXJ5aW5nIHZlYzMgdk1Qb3M7XFxudmFyeWluZyB2ZWM0IHZNVlBvcztcXG5cXG5jb25zdCBmbG9hdCBQSSA9IDMuMTQxNTkyNjUzNTk7XFxuY29uc3QgZmxvYXQgUkVDSVBST0NBTF9QSSA9IDAuMzE4MzA5ODg2MTg7XFxuY29uc3QgZmxvYXQgUkVDSVBST0NBTF9QSTIgPSAwLjE1OTE1NDk0O1xcbmNvbnN0IGZsb2F0IExOMiA9IDAuNjkzMTQ3MjtcXG5jb25zdCBmbG9hdCBFTlZfTE9EUyA9IDYuMDtcXG52ZWM0IFNSR0J0b0xpbmVhcih2ZWM0IHNyZ2IpIHtcXG4gIHZlYzMgbGluT3V0ID0gcG93KHNyZ2IueHl6LCB2ZWMzKDIuMikpO1xcbiAgcmV0dXJuIHZlYzQobGluT3V0LCBzcmdiLncpOztcXG59XFxudmVjNCBSR0JNVG9MaW5lYXIoaW4gdmVjNCB2YWx1ZSkge1xcbiAgZmxvYXQgbWF4UmFuZ2UgPSA2LjA7XFxuICByZXR1cm4gdmVjNCh2YWx1ZS54eXogKiB2YWx1ZS53ICogbWF4UmFuZ2UsIDEuMCk7XFxufVxcbnZlYzMgbGluZWFyVG9TUkdCKHZlYzMgY29sb3IpIHtcXG4gIHJldHVybiBwb3coY29sb3IsIHZlYzMoMS4wIC8gMi4yKSk7XFxufVxcbnZlYzMgZ2V0Tm9ybWFsKCkge1xcbiAgI2lmZGVmIE5PUk1BTF9NQVAgIFxcbiAgICB2ZWMzIHBvc19keCA9IGRGZHgodk1Qb3MueHl6KTtcXG4gICAgdmVjMyBwb3NfZHkgPSBkRmR5KHZNUG9zLnh5eik7XFxuICAgIHZlYzIgdGV4X2R4ID0gZEZkeCh2VXYpO1xcbiAgICB2ZWMyIHRleF9keSA9IGRGZHkodlV2KTtcXG4gICAgLy8gVGFuZ2VudCwgQml0YW5nZW50XFxuICAgIHZlYzMgdCA9IG5vcm1hbGl6ZShwb3NfZHggKiB0ZXhfZHkudCAtIHBvc19keSAqIHRleF9keC50KTtcXG4gICAgdmVjMyBiID0gbm9ybWFsaXplKC1wb3NfZHggKiB0ZXhfZHkucyArIHBvc19keSAqIHRleF9keC5zKTtcXG4gICAgbWF0MyB0Ym4gPSBtYXQzKHQsIGIsIG5vcm1hbGl6ZSh2Tm9ybWFsKSk7XFxuICAgIHZlYzMgbiA9IHRleHR1cmUyRCh0Tm9ybWFsLCB2VXYpLnJnYiAqIDIuMCAtIDEuMDtcXG4gICAgbi54eSAqPSB1Tm9ybWFsU2NhbGU7XFxuICAgIHZlYzMgbm9ybWFsID0gbm9ybWFsaXplKHRibiAqIG4pO1xcbiAgICAvLyBHZXQgd29ybGQgbm9ybWFsIGZyb20gdmlldyBub3JtYWwgKG5vcm1hbE1hdHJpeCAqIG5vcm1hbClcXG4gICAgLy8gcmV0dXJuIG5vcm1hbGl6ZSgodmVjNChub3JtYWwsIDAuMCkgKiB2aWV3TWF0cml4KS54eXopO1xcbiAgICByZXR1cm4gbm9ybWFsaXplKG5vcm1hbCk7XFxuICAjZWxzZVxcbiAgICByZXR1cm4gbm9ybWFsaXplKHZOb3JtYWwpO1xcbiAgI2VuZGlmXFxufVxcblxcbnZlYzIgY2FydGVzaWFuVG9Qb2xhcih2ZWMzIG4pIHtcXG4gIHZlYzIgdXY7XFxuICB1di54ID0gYXRhbihuLnosIG4ueCkgKiBSRUNJUFJPQ0FMX1BJMiArIDAuNTtcXG4gIHV2LnkgPSBhc2luKG4ueSkgKiBSRUNJUFJPQ0FMX1BJICsgMC41O1xcbiAgcmV0dXJuIHV2O1xcbn1cXG5cXG52b2lkIGdldElCTENvbnRyaWJ1dGlvbihpbm91dCB2ZWMzIGRpZmZ1c2UsIGlub3V0IHZlYzMgc3BlY3VsYXIsIGZsb2F0IE5kViwgZmxvYXQgcm91Z2huZXNzLCB2ZWMzIG4sIHZlYzMgcmVmbGVjdGlvbiwgdmVjMyBkaWZmdXNlQ29sb3IsIHZlYzMgc3BlY3VsYXJDb2xvcikge1xcbiAgdmVjMyBicmRmID0gU1JHQnRvTGluZWFyKHRleHR1cmUyRCh0TFVULCB2ZWMyKE5kViwgcm91Z2huZXNzKSkpLnJnYjtcXG4gIHZlYzMgZGlmZnVzZUxpZ2h0ID0gUkdCTVRvTGluZWFyKHRleHR1cmUyRCh0RW52RGlmZnVzZSwgY2FydGVzaWFuVG9Qb2xhcihuKSkpLnJnYjtcXG4gIGRpZmZ1c2VMaWdodCA9IG1peCh2ZWMzKDEpLCBkaWZmdXNlTGlnaHQsIHVFbnZEaWZmdXNlKTtcXG4gIC8vIFNhbXBsZSAyIGxldmVscyBhbmQgbWl4IGJldHdlZW4gdG8gZ2V0IHNtb290aGVyIGRlZ3JhZGF0aW9uXFxuICBmbG9hdCBibGVuZCA9IHJvdWdobmVzcyAqIEVOVl9MT0RTO1xcbiAgZmxvYXQgbGV2ZWwwID0gZmxvb3IoYmxlbmQpO1xcbiAgZmxvYXQgbGV2ZWwxID0gbWluKEVOVl9MT0RTLCBsZXZlbDAgKyAxLjApO1xcbiAgYmxlbmQgLT0gbGV2ZWwwO1xcbiAgXFxuICAvLyBTYW1wbGUgdGhlIHNwZWN1bGFyIGVudiBtYXAgYXRsYXMgZGVwZW5kaW5nIG9uIHRoZSByb3VnaG5lc3MgdmFsdWVcXG4gIHZlYzIgdXZTcGVjID0gY2FydGVzaWFuVG9Qb2xhcihyZWZsZWN0aW9uKTtcXG4gIHV2U3BlYy55IC89IDIuMDtcXG4gIHZlYzIgdXYwID0gdXZTcGVjO1xcbiAgdmVjMiB1djEgPSB1dlNwZWM7XFxuICB1djAgLz0gcG93KDIuMCwgbGV2ZWwwKTtcXG4gIHV2MC55ICs9IDEuMCAtIGV4cCgtTE4yICogbGV2ZWwwKTtcXG4gIHV2MSAvPSBwb3coMi4wLCBsZXZlbDEpO1xcbiAgdXYxLnkgKz0gMS4wIC0gZXhwKC1MTjIgKiBsZXZlbDEpO1xcbiAgdmVjMyBzcGVjdWxhcjAgPSBSR0JNVG9MaW5lYXIodGV4dHVyZTJEKHRFbnZTcGVjdWxhciwgdXYwKSkucmdiO1xcbiAgdmVjMyBzcGVjdWxhcjEgPSBSR0JNVG9MaW5lYXIodGV4dHVyZTJEKHRFbnZTcGVjdWxhciwgdXYxKSkucmdiO1xcbiAgdmVjMyBzcGVjdWxhckxpZ2h0ID0gbWl4KHNwZWN1bGFyMCwgc3BlY3VsYXIxLCBibGVuZCk7XFxuICBkaWZmdXNlID0gZGlmZnVzZUxpZ2h0ICogZGlmZnVzZUNvbG9yO1xcbiAgXFxuICAvLyBCaXQgb2YgZXh0cmEgcmVmbGVjdGlvbiBmb3Igc21vb3RoIG1hdGVyaWFsc1xcbiAgZmxvYXQgcmVmbGVjdGl2aXR5ID0gcG93KCgxLjAgLSByb3VnaG5lc3MpLCAyLjApICogMC4wNTtcXG4gIHNwZWN1bGFyID0gc3BlY3VsYXJMaWdodCAqIChzcGVjdWxhckNvbG9yICogYnJkZi54ICsgYnJkZi55ICsgcmVmbGVjdGl2aXR5KTtcXG4gIHNwZWN1bGFyICo9IHVFbnZTcGVjdWxhcjtcXG59XFxuXFxudm9pZCBtYWluKCkge1xcbiAgdmVjNCBiYXNlQ29sb3IgPSB1QmFzZUNvbG9yRmFjdG9yO1xcbiAgI2lmZGVmIENPTE9SX01BUFxcbiAgICBiYXNlQ29sb3IgKj0gU1JHQnRvTGluZWFyKHRleHR1cmUyRCh0QmFzZUNvbG9yLCB2VXYpKTtcXG4gICNlbmRpZlxcbiAgLy8gR2V0IGJhc2UgYWxwaGFcXG4gIGZsb2F0IGFscGhhID0gYmFzZUNvbG9yLmE7XFxuICAjaWZkZWYgQUxQSEFfTUFTS1xcbiAgICBpZiAoYWxwaGEgPCB1QWxwaGFDdXRvZmYpIGRpc2NhcmQ7XFxuICAjZW5kaWZcXG4gIC8vIFJNIG1hcCBwYWNrZWQgYXMgZ2IgPSBbbm90aGluZywgcm91Z2huZXNzLCBtZXRhbGxpYywgbm90aGluZ11cXG4gIHZlYzQgcm1TYW1wbGUgPSB2ZWM0KDEpO1xcbiAgI2lmZGVmIFJNX01BUFxcbiAgICBybVNhbXBsZSAqPSB0ZXh0dXJlMkQodFJNLCB2VXYpO1xcbiAgI2VuZGlmXFxuICBmbG9hdCByb3VnaG5lc3MgPSBjbGFtcChybVNhbXBsZS5nICogdVJvdWdobmVzcywgMC4wNCwgMS4wKTtcXG4gIGZsb2F0IG1ldGFsbGljID0gY2xhbXAocm1TYW1wbGUuYiAqIHVNZXRhbGxpYywgMC4wNCwgMS4wKTtcXG4gIHZlYzMgZjAgPSB2ZWMzKDAuMDQpO1xcbiAgdmVjMyBkaWZmdXNlQ29sb3IgPSBiYXNlQ29sb3IucmdiICogKHZlYzMoMS4wKSAtIGYwKSAqICgxLjAgLSBtZXRhbGxpYyk7XFxuICB2ZWMzIHNwZWN1bGFyQ29sb3IgPSBtaXgoZjAsIGJhc2VDb2xvci5yZ2IsIG1ldGFsbGljKTtcXG4gIHZlYzMgc3BlY3VsYXJFbnZSMCA9IHNwZWN1bGFyQ29sb3I7XFxuICB2ZWMzIHNwZWN1bGFyRW52UjkwID0gdmVjMyhjbGFtcChtYXgobWF4KHNwZWN1bGFyQ29sb3Iuciwgc3BlY3VsYXJDb2xvci5nKSwgc3BlY3VsYXJDb2xvci5iKSAqIDI1LjAsIDAuMCwgMS4wKSk7XFxuICB2ZWMzIE4gPSBnZXROb3JtYWwoKTtcXG4gIHZlYzMgViA9IG5vcm1hbGl6ZShjYW1lcmFQb3NpdGlvbiAtIHZNUG9zKTtcXG4gIHZlYzMgcmVmbGVjdGlvbiA9IG5vcm1hbGl6ZShyZWZsZWN0KC1WLCBOKSk7XFxuICBmbG9hdCBOZFYgPSBjbGFtcChhYnMoZG90KE4sIFYpKSwgMC4wMDEsIDEuMCk7XFxuICAvLyBTaGFkaW5nIGJhc2VkIG9mZiBJQkwgbGlnaHRpbmdcXG4gIHZlYzMgY29sb3IgPSB2ZWMzKDAuKTtcXG4gIHZlYzMgZGlmZnVzZUlCTDtcXG4gIHZlYzMgc3BlY3VsYXJJQkw7XFxuICBnZXRJQkxDb250cmlidXRpb24oZGlmZnVzZUlCTCwgc3BlY3VsYXJJQkwsIE5kViwgcm91Z2huZXNzLCBOLCByZWZsZWN0aW9uLCBkaWZmdXNlQ29sb3IsIHNwZWN1bGFyQ29sb3IpO1xcbiAgLy8gQWRkIElCTCBvbiB0b3Agb2YgY29sb3JcXG4gIGNvbG9yICs9IChkaWZmdXNlSUJMICsgc3BlY3VsYXJJQkwpICogdUVudk1hcEludGVuc2l0eTtcXG4gIC8vIEFkZCBJQkwgc3BlYyB0byBhbHBoYSBmb3IgcmVmbGVjdGlvbnMgb24gdHJhbnNwYXJlbnQgc3VyZmFjZXMgKGdsYXNzKVxcbiAgYWxwaGEgPSBtYXgoYWxwaGEsIG1heChtYXgoc3BlY3VsYXJJQkwuciwgc3BlY3VsYXJJQkwuZyksIHNwZWN1bGFySUJMLmIpKTtcXG4gICNpZmRlZiBPQ0NfTUFQICBcXG4gICAgLy8gVE9ETzogZmlndXJlIG91dCBob3cgdG8gYXBwbHkgb2NjbHVzaW9uXFxuICAgIC8vIGNvbG9yICo9IFNSR0J0b0xpbmVhcih0ZXh0dXJlMkQodE9jY2x1c2lvbiwgdlV2KSkucmdiO1xcbiAgI2VuZGlmXFxuICBjb2xvciArPSB1RW1pc3NpdmU7XFxuICAjaWZkZWYgRU1JU1NJVkVfTUFQICBcXG4gICAgdmVjMyBlbWlzc2l2ZSA9IFNSR0J0b0xpbmVhcih0ZXh0dXJlMkQodEVtaXNzaXZlLCB2VXYpKS5yZ2I7XFxuICAgIGNvbG9yID0gZW1pc3NpdmU7XFxuICAjZW5kaWZcXG4gIC8vIEFwcGx5IHVBbHBoYSB1bmlmb3JtIGF0IHRoZSBlbmQgdG8gb3ZlcndyaXRlIGFueSBzcGVjdWxhciBhZGRpdGlvbnMgb24gdHJhbnNwYXJlbnQgc3VyZmFjZXNcXG4vLyAgZ2xfRnJhZ0NvbG9yLnJnYiA9IGxpbmVhclRvU1JHQihjb2xvcik7XFxuICBpZih1VHJhbnNwYXJlbnQpe1xcbiAgICBnbF9GcmFnQ29sb3IgPSAodmVjNChjb2xvciwgYWxwaGEgKiB1QWxwaGEpKTtcXG4gIH1lbHNlIHtcXG4gICAgZ2xfRnJhZ0NvbG9yID0gbGluZWFyVG9PdXRwdXRUZXhlbCh2ZWM0KGNvbG9yICogYWxwaGEgKiB1QWxwaGEsIDEuKSk7XFxuICB9XFxufVwiOyIsImV4cG9ydCBkZWZhdWx0IFwicHJlY2lzaW9uIGhpZ2hwIGZsb2F0O1xcbnByZWNpc2lvbiBoaWdocCBpbnQ7XFxuYXR0cmlidXRlIHZlYzMgcG9zaXRpb247XFxuXFxuI2lmZGVmIFVWXFxuICAgIGF0dHJpYnV0ZSB2ZWMyIHV2O1xcbiNlbHNlXFxuICAgIGNvbnN0IHZlYzIgdXYgPSB2ZWMyKDApO1xcbiNlbmRpZlxcbmF0dHJpYnV0ZSB2ZWMzIG5vcm1hbDtcXG5cXG51bmlmb3JtIG1hdDQgbW9kZWxWaWV3TWF0cml4O1xcbnVuaWZvcm0gbWF0NCBwcm9qZWN0aW9uTWF0cml4O1xcbnVuaWZvcm0gbWF0NCBtb2RlbE1hdHJpeDtcXG51bmlmb3JtIG1hdDMgbm9ybWFsTWF0cml4O1xcblxcbnZhcnlpbmcgdmVjMiB2VXY7XFxudmFyeWluZyB2ZWMzIHZOb3JtYWw7XFxudmFyeWluZyB2ZWMzIHZNUG9zO1xcbnZhcnlpbmcgdmVjNCB2TVZQb3M7XFxuXFxudm9pZCBtYWluKCkge1xcbiAgICB2ZWM0IHBvcyA9IHZlYzQocG9zaXRpb24sIDEpO1xcbiAgICB2ZWMzIG5tbCA9IG5vcm1hbDtcXG4gICAgdlV2ID0gdXY7XFxuICAgIHZOb3JtYWwgPSBub3JtYWxpemUobm1sKTtcXG4gICAgdmVjNCBtUG9zID0gbW9kZWxNYXRyaXggKiBwb3M7XFxuICAgIHZNUG9zID0gbVBvcy54eXogLyBtUG9zLnc7XFxuICAgIHZNVlBvcyA9IG1vZGVsVmlld01hdHJpeCAqIHBvcztcXG4gICAgZ2xfUG9zaXRpb24gPSBwcm9qZWN0aW9uTWF0cml4ICogdk1WUG9zO1xcbn1cIjsiLCJleHBvcnQgZGVmYXVsdCBcIi8vIFRha2VuIGZyb20gdGhyZWVqcy5cXG4vLyBGb3IgYSBkaXNjdXNzaW9uIG9mIHdoYXQgdGhpcyBpcywgcGxlYXNlIHJlYWQgdGhpczogaHR0cDovL2xvdXNvZHJvbWUubmV0L2Jsb2cvbGlnaHQvMjAxMy8wNS8yNi9nYW1tYS1jb3JyZWN0LWFuZC1oZHItcmVuZGVyaW5nLWluLWEtMzItYml0cy1idWZmZXIvXFxudmVjNCBMaW5lYXJUb0xpbmVhciggaW4gdmVjNCB2YWx1ZSApIHtcXG4gICAgcmV0dXJuIHZhbHVlO1xcbn1cXG5cXG52ZWM0IEdhbW1hVG9MaW5lYXIoIGluIHZlYzQgdmFsdWUsIGluIGZsb2F0IGdhbW1hRmFjdG9yICkge1xcbiAgICByZXR1cm4gdmVjNCggcG93KCB2YWx1ZS5yZ2IsIHZlYzMoIGdhbW1hRmFjdG9yICkgKSwgdmFsdWUuYSApO1xcbn1cXG5cXG52ZWM0IExpbmVhclRvR2FtbWEoIGluIHZlYzQgdmFsdWUsIGluIGZsb2F0IGdhbW1hRmFjdG9yICkge1xcbiAgICByZXR1cm4gdmVjNCggcG93KCB2YWx1ZS5yZ2IsIHZlYzMoIDEuMCAvIGdhbW1hRmFjdG9yICkgKSwgdmFsdWUuYSApO1xcbn1cXG5cXG52ZWM0IHNSR0JUb0xpbmVhciggaW4gdmVjNCB2YWx1ZSApIHtcXG4gICAgcmV0dXJuIHZlYzQoIG1peCggcG93KCB2YWx1ZS5yZ2IgKiAwLjk0Nzg2NzI5ODYgKyB2ZWMzKCAwLjA1MjEzMjcwMTQgKSwgdmVjMyggMi40ICkgKSwgdmFsdWUucmdiICogMC4wNzczOTkzODA4LCB2ZWMzKCBsZXNzVGhhbkVxdWFsKCB2YWx1ZS5yZ2IsIHZlYzMoIDAuMDQwNDUgKSApICkgKSwgdmFsdWUuYSApO1xcbn1cXG5cXG52ZWM0IExpbmVhclRvc1JHQiggaW4gdmVjNCB2YWx1ZSApIHtcXG4gICAgcmV0dXJuIHZlYzQoIG1peCggcG93KCB2YWx1ZS5yZ2IsIHZlYzMoIDAuNDE2NjYgKSApICogMS4wNTUgLSB2ZWMzKCAwLjA1NSApLCB2YWx1ZS5yZ2IgKiAxMi45MiwgdmVjMyggbGVzc1RoYW5FcXVhbCggdmFsdWUucmdiLCB2ZWMzKCAwLjAwMzEzMDggKSApICkgKSwgdmFsdWUuYSApO1xcbn1cXG5cXG52ZWM0IFJHQkVUb0xpbmVhciggaW4gdmVjNCB2YWx1ZSApIHtcXG4gICAgcmV0dXJuIHZlYzQoIHZhbHVlLnJnYiAqIGV4cDIoIHZhbHVlLmEgKiAyNTUuMCAtIDEyOC4wICksIDEuMCApO1xcbn1cXG5cXG52ZWM0IExpbmVhclRvUkdCRSggaW4gdmVjNCB2YWx1ZSApIHtcXG4gICAgZmxvYXQgbWF4Q29tcG9uZW50ID0gbWF4KCBtYXgoIHZhbHVlLnIsIHZhbHVlLmcgKSwgdmFsdWUuYiApO1xcbiAgICBmbG9hdCBmRXhwID0gY2xhbXAoIGNlaWwoIGxvZzIoIG1heENvbXBvbmVudCApICksIC0xMjguMCwgMTI3LjAgKTtcXG4gICAgcmV0dXJuIHZlYzQoIHZhbHVlLnJnYiAvIGV4cDIoIGZFeHAgKSwgKCBmRXhwICsgMTI4LjAgKSAvIDI1NS4wICk7XFxuICAgIC8vIHJldHVybiB2ZWM0KCB2YWx1ZS5icmcsICggMy4wICsgMTI4LjAgKSAvIDI1Ni4wICk7XFxufVxcblxcbi8vIHJlZmVyZW5jZTogaHR0cDovL2l3YXNiZWluZ2lyb255LmJsb2dzcG90LmNhLzIwMTAvMDYvZGlmZmVyZW5jZS1iZXR3ZWVuLXJnYm0tYW5kLXJnYmQuaHRtbFxcbnZlYzQgUkdCTVRvTGluZWFyKCBpbiB2ZWM0IHZhbHVlLCBpbiBmbG9hdCBtYXhSYW5nZSApIHtcXG4gICAgcmV0dXJuIHZlYzQoIHZhbHVlLnJnYiAqIHZhbHVlLmEgKiBtYXhSYW5nZSwgMS4wICk7XFxufVxcblxcbnZlYzQgTGluZWFyVG9SR0JNKCBpbiB2ZWM0IHZhbHVlLCBpbiBmbG9hdCBtYXhSYW5nZSApIHtcXG4gICAgZmxvYXQgbWF4UkdCID0gbWF4KCB2YWx1ZS5yLCBtYXgoIHZhbHVlLmcsIHZhbHVlLmIgKSApO1xcbiAgICBmbG9hdCBNID0gY2xhbXAoIG1heFJHQiAvIG1heFJhbmdlLCAwLjAsIDEuMCApO1xcbiAgICBNID0gY2VpbCggTSAqIDI1NS4wICkgLyAyNTUuMDtcXG4gICAgcmV0dXJuIHZlYzQoIHZhbHVlLnJnYiAvICggTSAqIG1heFJhbmdlICksIE0gKTtcXG59XFxuXFxuLy8gcmVmZXJlbmNlOiBodHRwOi8vaXdhc2JlaW5naXJvbnkuYmxvZ3Nwb3QuY2EvMjAxMC8wNi9kaWZmZXJlbmNlLWJldHdlZW4tcmdibS1hbmQtcmdiZC5odG1sXFxudmVjNCBSR0JEVG9MaW5lYXIoIGluIHZlYzQgdmFsdWUsIGluIGZsb2F0IG1heFJhbmdlICkge1xcbiAgICByZXR1cm4gdmVjNCggdmFsdWUucmdiICogKCAoIG1heFJhbmdlIC8gMjU1LjAgKSAvIHZhbHVlLmEgKSwgMS4wICk7XFxufVxcblxcbnZlYzQgTGluZWFyVG9SR0JEKCBpbiB2ZWM0IHZhbHVlLCBpbiBmbG9hdCBtYXhSYW5nZSApIHtcXG4gICAgZmxvYXQgbWF4UkdCID0gbWF4KCB2YWx1ZS5yLCBtYXgoIHZhbHVlLmcsIHZhbHVlLmIgKSApO1xcbiAgICBmbG9hdCBEID0gbWF4KCBtYXhSYW5nZSAvIG1heFJHQiwgMS4wICk7XFxuICAgIC8vIE5PVEU6IFRoZSBpbXBsZW1lbnRhdGlvbiB3aXRoIG1pbiBjYXVzZXMgdGhlIHNoYWRlciB0byBub3QgY29tcGlsZSBvblxcbiAgICAvLyBhIGNvbW1vbiBBbGNhdGVsIEE1MDJETCBpbiBDaHJvbWUgNzgvQW5kcm9pZCA4LjEuIFNvbWUgcmVzZWFyY2ggc3VnZ2VzdHNcXG4gICAgLy8gdGhhdCB0aGUgY2hpcHNldCBpcyBNZWRpYXRlayBNVDY3Mzkgdy8gSU1HIFBvd2VyVlIgR0U4MTAwIEdQVS5cXG4gICAgLy8gRCA9IG1pbiggZmxvb3IoIEQgKSAvIDI1NS4wLCAxLjAgKTtcXG4gICAgRCA9IGNsYW1wKCBmbG9vciggRCApIC8gMjU1LjAsIDAuMCwgMS4wICk7XFxuICAgIHJldHVybiB2ZWM0KCB2YWx1ZS5yZ2IgKiAoIEQgKiAoIDI1NS4wIC8gbWF4UmFuZ2UgKSApLCBEICk7XFxufVxcblxcbi8vIExvZ0x1diByZWZlcmVuY2U6IGh0dHA6Ly9ncmFwaGljcmFudHMuYmxvZ3Nwb3QuY2EvMjAwOS8wNC9yZ2JtLWNvbG9yLWVuY29kaW5nLmh0bWxcXG5cXG4vLyBNIG1hdHJpeCwgZm9yIGVuY29kaW5nXFxuY29uc3QgbWF0MyBjTG9nTHV2TSA9IG1hdDMoIDAuMjIwOSwgMC4zMzkwLCAwLjQxODQsIDAuMTEzOCwgMC42NzgwLCAwLjczMTksIDAuMDEwMiwgMC4xMTMwLCAwLjI5NjkgKTtcXG52ZWM0IExpbmVhclRvTG9nTHV2KCBpbiB2ZWM0IHZhbHVlICkge1xcbiAgICB2ZWMzIFhwX1lfWFlacCA9IGNMb2dMdXZNICogdmFsdWUucmdiO1xcbiAgICBYcF9ZX1hZWnAgPSBtYXgoIFhwX1lfWFlacCwgdmVjMyggMWUtNiwgMWUtNiwgMWUtNiApICk7XFxuICAgIHZlYzQgdlJlc3VsdDtcXG4gICAgdlJlc3VsdC54eSA9IFhwX1lfWFlacC54eSAvIFhwX1lfWFlacC56O1xcbiAgICBmbG9hdCBMZSA9IDIuMCAqIGxvZzIoWHBfWV9YWVpwLnkpICsgMTI3LjA7XFxuICAgIHZSZXN1bHQudyA9IGZyYWN0KCBMZSApO1xcbiAgICB2UmVzdWx0LnogPSAoIExlIC0gKCBmbG9vciggdlJlc3VsdC53ICogMjU1LjAgKSApIC8gMjU1LjAgKSAvIDI1NS4wO1xcbiAgICByZXR1cm4gdlJlc3VsdDtcXG59XFxuXFxuLy8gSW52ZXJzZSBNIG1hdHJpeCwgZm9yIGRlY29kaW5nXFxuY29uc3QgbWF0MyBjTG9nTHV2SW52ZXJzZU0gPSBtYXQzKCA2LjAwMTQsIC0yLjcwMDgsIC0xLjc5OTYsIC0xLjMzMjAsIDMuMTAyOSwgLTUuNzcyMSwgMC4zMDA4LCAtMS4wODgyLCA1LjYyNjggKTtcXG52ZWM0IExvZ0x1dlRvTGluZWFyKCBpbiB2ZWM0IHZhbHVlICkge1xcbiAgICBmbG9hdCBMZSA9IHZhbHVlLnogKiAyNTUuMCArIHZhbHVlLnc7XFxuICAgIHZlYzMgWHBfWV9YWVpwO1xcbiAgICBYcF9ZX1hZWnAueSA9IGV4cDIoICggTGUgLSAxMjcuMCApIC8gMi4wICk7XFxuICAgIFhwX1lfWFlacC56ID0gWHBfWV9YWVpwLnkgLyB2YWx1ZS55O1xcbiAgICBYcF9ZX1hZWnAueCA9IHZhbHVlLnggKiBYcF9ZX1hZWnAuejtcXG4gICAgdmVjMyB2UkdCID0gY0xvZ0x1dkludmVyc2VNICogWHBfWV9YWVpwLnJnYjtcXG4gICAgcmV0dXJuIHZlYzQoIG1heCggdlJHQiwgMC4wICksIDEuMCApO1xcbn1cXG5cXG5cXG52ZWM0IGlucHV0VGV4ZWxUb0xpbmVhciggdmVjNCB2YWx1ZSApIHtcXG4gICAgaWYgKCBpbnB1dEVuY29kaW5nID09IDAgKSB7XFxuICAgICAgICByZXR1cm4gdmFsdWU7XFxuICAgIH0gZWxzZSBpZiAoIGlucHV0RW5jb2RpbmcgPT0gMSApIHtcXG4gICAgICAgIHJldHVybiBzUkdCVG9MaW5lYXIoIHZhbHVlICk7XFxuICAgIH0gZWxzZSBpZiAoIGlucHV0RW5jb2RpbmcgPT0gMiApIHtcXG4gICAgICAgIHJldHVybiBSR0JFVG9MaW5lYXIoIHZhbHVlICk7XFxuICAgIH0gZWxzZSBpZiAoIGlucHV0RW5jb2RpbmcgPT0gMyApIHtcXG4gICAgICAgIHJldHVybiBSR0JNVG9MaW5lYXIoIHZhbHVlLCA3LjAgKTtcXG4gICAgfSBlbHNlIGlmICggaW5wdXRFbmNvZGluZyA9PSA0ICkge1xcbiAgICAgICAgcmV0dXJuIFJHQk1Ub0xpbmVhciggdmFsdWUsIDE2LjAgKTtcXG4gICAgfSBlbHNlIGlmICggaW5wdXRFbmNvZGluZyA9PSA1ICkge1xcbiAgICAgICAgcmV0dXJuIFJHQkRUb0xpbmVhciggdmFsdWUsIDI1Ni4wICk7XFxuICAgIH0gZWxzZSB7XFxuICAgICAgICByZXR1cm4gR2FtbWFUb0xpbmVhciggdmFsdWUsIDIuMiApO1xcbiAgICB9XFxufVxcbnZlYzQgbGluZWFyVG9PdXRwdXRUZXhlbCggdmVjNCB2YWx1ZSApIHtcXG4gICAgaWYgKCBvdXRwdXRFbmNvZGluZyA9PSAwICkge1xcbiAgICAgICAgcmV0dXJuIHZhbHVlO1xcbiAgICB9IGVsc2UgaWYgKCBvdXRwdXRFbmNvZGluZyA9PSAxICkge1xcbiAgICAgICAgcmV0dXJuIExpbmVhclRvc1JHQiggdmFsdWUgKTtcXG4gICAgfSBlbHNlIGlmICggb3V0cHV0RW5jb2RpbmcgPT0gMiApIHtcXG4gICAgICAgIHJldHVybiBMaW5lYXJUb1JHQkUoIHZhbHVlICk7XFxuICAgIH0gZWxzZSBpZiAoIG91dHB1dEVuY29kaW5nID09IDMgKSB7XFxuICAgICAgICByZXR1cm4gTGluZWFyVG9SR0JNKCB2YWx1ZSwgNy4wICk7XFxuICAgIH0gZWxzZSBpZiAoIG91dHB1dEVuY29kaW5nID09IDQgKSB7XFxuICAgICAgICByZXR1cm4gTGluZWFyVG9SR0JNKCB2YWx1ZSwgMTYuMCApO1xcbiAgICB9IGVsc2UgaWYgKCBvdXRwdXRFbmNvZGluZyA9PSA1ICkge1xcbiAgICAgICAgcmV0dXJuIExpbmVhclRvUkdCRCggdmFsdWUsIDI1Ni4wICk7XFxuICAgIH0gZWxzZSB7XFxuICAgICAgICByZXR1cm4gTGluZWFyVG9HYW1tYSggdmFsdWUsIDIuMiApO1xcbiAgICB9XFxufVxcblxcblxcblwiOyIsImV4cG9ydCBkZWZhdWx0IFwiI2lmbmRlZiBzYXR1cmF0ZVxcbiNkZWZpbmUgc2F0dXJhdGUgKGEpIGNsYW1wKCBhLCAwLjAsIDEuMCApXFxuI2VuZGlmXFxuXFxudW5pZm9ybSBmbG9hdCB0b25lTWFwcGluZ0V4cG9zdXJlO1xcblxcbi8vIGV4cG9zdXJlIG9ubHlcXG52ZWMzIExpbmVhclRvbmVNYXBwaW5nKCB2ZWMzIGNvbG9yICkge1xcblxcbiAgICByZXR1cm4gdG9uZU1hcHBpbmdFeHBvc3VyZSAqIGNvbG9yO1xcblxcbn1cXG5cXG4vLyBzb3VyY2U6IGh0dHBzOi8vd3d3LmNzLnV0YWguZWR1L35yZWluaGFyZC9jZHJvbS9cXG52ZWMzIFJlaW5oYXJkVG9uZU1hcHBpbmcoIHZlYzMgY29sb3IgKSB7XFxuXFxuICAgIGNvbG9yICo9IHRvbmVNYXBwaW5nRXhwb3N1cmU7XFxuICAgIHJldHVybiBzYXR1cmF0ZSAoIGNvbG9yIC8gKCB2ZWMzKCAxLjAgKSArIGNvbG9yICkgKTtcXG5cXG59XFxuXFxuLy8gc291cmNlOiBodHRwOi8vZmlsbWljd29ybGRzLmNvbS9ibG9nL2ZpbG1pYy10b25lbWFwcGluZy1vcGVyYXRvcnMvXFxudmVjMyBPcHRpbWl6ZWRDaW5lb25Ub25lTWFwcGluZyggdmVjMyBjb2xvciApIHtcXG5cXG4gICAgLy8gb3B0aW1pemVkIGZpbG1pYyBvcGVyYXRvciBieSBKaW0gSGVqbCBhbmQgUmljaGFyZCBCdXJnZXNzLURhd3NvblxcbiAgICBjb2xvciAqPSB0b25lTWFwcGluZ0V4cG9zdXJlO1xcbiAgICBjb2xvciA9IG1heCggdmVjMyggMC4wICksIGNvbG9yIC0gMC4wMDQgKTtcXG4gICAgcmV0dXJuIHBvdyggKCBjb2xvciAqICggNi4yICogY29sb3IgKyAwLjUgKSApIC8gKCBjb2xvciAqICggNi4yICogY29sb3IgKyAxLjcgKSArIDAuMDYgKSwgdmVjMyggMi4yICkgKTtcXG5cXG59XFxuXFxuLy8gc291cmNlOiBodHRwczovL2dpdGh1Yi5jb20vc2VsZnNoYWRvdy9sdGNfY29kZS9ibG9iL21hc3Rlci93ZWJnbC9zaGFkZXJzL2x0Yy9sdGNfYmxpdC5mc1xcbnZlYzMgUlJUQW5kT0RURml0KCB2ZWMzIHYgKSB7XFxuXFxuICAgIHZlYzMgYSA9IHYgKiAoIHYgKyAwLjAyNDU3ODYgKSAtIDAuMDAwMDkwNTM3O1xcbiAgICB2ZWMzIGIgPSB2ICogKCAwLjk4MzcyOSAqIHYgKyAwLjQzMjk1MTAgKSArIDAuMjM4MDgxO1xcbiAgICByZXR1cm4gYSAvIGI7XFxuXFxufVxcblxcbi8vIHRoaXMgaW1wbGVtZW50YXRpb24gb2YgQUNFUyBpcyBtb2RpZmllZCB0byBhY2NvbW1vZGF0ZSBhIGJyaWdodGVyIHZpZXdpbmcgZW52aXJvbm1lbnQuXFxuLy8gdGhlIHNjYWxlIGZhY3RvciBvZiAxLzAuNiBpcyBzdWJqZWN0aXZlLiBzZWUgZGlzY3Vzc2lvbiBpbiAjMTk2MjEuXFxuXFxudmVjMyBBQ0VTRmlsbWljVG9uZU1hcHBpbmcoIHZlYzMgY29sb3IgKSB7XFxuXFxuICAgIC8vIHNSR0IgPT4gWFlaID0+IEQ2NV8yX0Q2MCA9PiBBUDEgPT4gUlJUX1NBVFxcbiAgICBjb25zdCBtYXQzIEFDRVNJbnB1dE1hdCA9IG1hdDMoXFxuICAgIHZlYzMoIDAuNTk3MTksIDAuMDc2MDAsIDAuMDI4NDAgKSwgLy8gdHJhbnNwb3NlZCBmcm9tIHNvdXJjZVxcbiAgICB2ZWMzKCAwLjM1NDU4LCAwLjkwODM0LCAwLjEzMzgzICksXFxuICAgIHZlYzMoIDAuMDQ4MjMsIDAuMDE1NjYsIDAuODM3NzcgKVxcbiAgICApO1xcblxcbiAgICAvLyBPRFRfU0FUID0+IFhZWiA9PiBENjBfMl9ENjUgPT4gc1JHQlxcbiAgICBjb25zdCBtYXQzIEFDRVNPdXRwdXRNYXQgPSBtYXQzKFxcbiAgICB2ZWMzKCAgMS42MDQ3NSwgLTAuMTAyMDgsIC0wLjAwMzI3ICksIC8vIHRyYW5zcG9zZWQgZnJvbSBzb3VyY2VcXG4gICAgdmVjMyggLTAuNTMxMDgsICAxLjEwODEzLCAtMC4wNzI3NiApLFxcbiAgICB2ZWMzKCAtMC4wNzM2NywgLTAuMDA2MDUsICAxLjA3NjAyIClcXG4gICAgKTtcXG5cXG4gICAgY29sb3IgKj0gdG9uZU1hcHBpbmdFeHBvc3VyZSAvIDAuNjtcXG5cXG4gICAgY29sb3IgPSBBQ0VTSW5wdXRNYXQgKiBjb2xvcjtcXG5cXG4gICAgLy8gQXBwbHkgUlJUIGFuZCBPRFRcXG4gICAgY29sb3IgPSBSUlRBbmRPRFRGaXQoIGNvbG9yICk7XFxuXFxuICAgIGNvbG9yID0gQUNFU091dHB1dE1hdCAqIGNvbG9yO1xcblxcbiAgICAvLyBDbGFtcCB0byBbMCwgMV1cXG4gICAgcmV0dXJuIHNhdHVyYXRlKCBjb2xvciApO1xcblxcbn1cXG5cXG52ZWMzIEN1c3RvbVRvbmVNYXBwaW5nKCB2ZWMzIGNvbG9yICkgeyByZXR1cm4gY29sb3I7IH1cXG5cXG52ZWMzIHRvbmVNYXBDb2xvcih2ZWMzIHZhbHVlKXtcXG4gICAgaWYgKCB0b25lbWFwcGluZ01vZGUgPT0gMCApIHtcXG4gICAgICAgIHJldHVybiBMaW5lYXJUb25lTWFwcGluZyAoIHZhbHVlICk7XFxuICAgIH0gZWxzZSBpZiAoIHRvbmVtYXBwaW5nTW9kZSA9PSAxICkge1xcbiAgICAgICAgcmV0dXJuIFJlaW5oYXJkVG9uZU1hcHBpbmcgKCB2YWx1ZSApO1xcbiAgICB9IGVsc2UgaWYgKCB0b25lbWFwcGluZ01vZGUgPT0gMiApIHtcXG4gICAgICAgIHJldHVybiBPcHRpbWl6ZWRDaW5lb25Ub25lTWFwcGluZyAoIHZhbHVlICk7XFxuICAgIH0gZWxzZSBpZiAoIHRvbmVtYXBwaW5nTW9kZSA9PSAzICkge1xcbiAgICAgICAgcmV0dXJuIEFDRVNGaWxtaWNUb25lTWFwcGluZyAoIHZhbHVlICk7XFxuICAgIH0gZWxzZSB7XFxuICAgICAgICByZXR1cm4gdmFsdWU7XFxuICAgIH1cXG59XFxuXFxuXCI7IiwiaW1wb3J0IHsgVHJhbnNmb3JtIH0gZnJvbSAnLi9UcmFuc2Zvcm0uanMnO1xuaW1wb3J0IHsgTWF0NCB9IGZyb20gJy4uL21hdGgvTWF0NC5qcyc7XG5pbXBvcnQgeyBWZWMzIH0gZnJvbSAnLi4vbWF0aC9WZWMzLmpzJztcblxuY29uc3QgdGVtcE1hdDQgPSBuZXcgTWF0NCgpO1xuY29uc3QgdGVtcFZlYzNhID0gbmV3IFZlYzMoKTtcbmNvbnN0IHRlbXBWZWMzYiA9IG5ldyBWZWMzKCk7XG5cbmV4cG9ydCBjbGFzcyBDYW1lcmEgZXh0ZW5kcyBUcmFuc2Zvcm0ge1xuICAgIGNvbnN0cnVjdG9yKGdsLCB7IG5lYXIgPSAwLjEsIGZhciA9IDEwMCwgZm92ID0gNDUsIGFzcGVjdCA9IDEsIGxlZnQsIHJpZ2h0LCBib3R0b20sIHRvcCwgem9vbSA9IDEgfSA9IHt9KSB7XG4gICAgICAgIHN1cGVyKCk7XG5cbiAgICAgICAgT2JqZWN0LmFzc2lnbih0aGlzLCB7IG5lYXIsIGZhciwgZm92LCBhc3BlY3QsIGxlZnQsIHJpZ2h0LCBib3R0b20sIHRvcCwgem9vbSB9KTtcblxuICAgICAgICB0aGlzLnByb2plY3Rpb25NYXRyaXggPSBuZXcgTWF0NCgpO1xuICAgICAgICB0aGlzLnZpZXdNYXRyaXggPSBuZXcgTWF0NCgpO1xuICAgICAgICB0aGlzLnByb2plY3Rpb25WaWV3TWF0cml4ID0gbmV3IE1hdDQoKTtcbiAgICAgICAgdGhpcy53b3JsZFBvc2l0aW9uID0gbmV3IFZlYzMoKTtcblxuICAgICAgICAvLyBVc2Ugb3J0aG9ncmFwaGljIGlmIGxlZnQvcmlnaHQgc2V0LCBlbHNlIGRlZmF1bHQgdG8gcGVyc3BlY3RpdmUgY2FtZXJhXG4gICAgICAgIHRoaXMudHlwZSA9IGxlZnQgfHwgcmlnaHQgPyAnb3J0aG9ncmFwaGljJyA6ICdwZXJzcGVjdGl2ZSc7XG5cbiAgICAgICAgaWYgKHRoaXMudHlwZSA9PT0gJ29ydGhvZ3JhcGhpYycpIHRoaXMub3J0aG9ncmFwaGljKCk7XG4gICAgICAgIGVsc2UgdGhpcy5wZXJzcGVjdGl2ZSgpO1xuICAgIH1cblxuICAgIHNldFZpZXdPZmZzZXQoeCwgeSwgd2lkdGgsIGhlaWdodCkge1xuICAgICAgICBpZighdGhpcy52aWV3KSB7XG4gICAgICAgICAgICB0aGlzLnZpZXcgPSB7XG4gICAgICAgICAgICAgICAgb2Zmc2V0WDogeCxcbiAgICAgICAgICAgICAgICBvZmZzZXRZOiB5LFxuICAgICAgICAgICAgICAgIHdpZHRoOiB3aWR0aCxcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IGhlaWdodFxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHRoaXMudmlldy5vZmZzZXRYID0geDtcbiAgICAgICAgdGhpcy52aWV3Lm9mZnNldFkgPSB5O1xuICAgICAgICB0aGlzLnZpZXcud2lkdGggPSB3aWR0aDtcbiAgICAgICAgdGhpcy52aWV3LmhlaWdodCA9IGhlaWdodDtcbiAgICAgICAgaWYodGhpcy50eXBlID09PSAncGVyc3BlY3RpdmUnKSB7XG4gICAgICAgICAgICB0aGlzLnBlcnNwZWN0aXZlKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjbGVhclZpZXdPZmZzZXQoKSB7XG4gICAgICAgIHRoaXMudmlldyA9IG51bGw7XG4gICAgICAgIGlmKHRoaXMudHlwZSA9PT0gJ3BlcnNwZWN0aXZlJykge1xuICAgICAgICAgICAgdGhpcy5wZXJzcGVjdGl2ZSgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcGVyc3BlY3RpdmUoeyBuZWFyID0gdGhpcy5uZWFyLCBmYXIgPSB0aGlzLmZhciwgZm92ID0gdGhpcy5mb3YsIGFzcGVjdCA9IHRoaXMuYXNwZWN0IH0gPSB7fSkge1xuICAgICAgICBPYmplY3QuYXNzaWduKHRoaXMsIHsgbmVhciwgZmFyLCBmb3YsIGFzcGVjdCB9KTtcbiAgICAgICAgbGV0IHRvcCA9IG5lYXIgKiBNYXRoLnRhbiggTWF0aC5QSS8xODAgKiAwLjUgKiBmb3YgKSxcbiAgICAgICAgaGVpZ2h0ID0gMiAqIHRvcCxcbiAgICAgICAgd2lkdGggPSBhc3BlY3QgKiBoZWlnaHQsXG4gICAgICAgIGxlZnQgPSAtIDAuNSAqIHdpZHRoO1xuICAgICAgICBcbiAgICAgICAgaWYodGhpcy52aWV3KSB7XG4gICAgICAgICAgICBsZWZ0ICs9IHRoaXMudmlldy5vZmZzZXRYICogd2lkdGggLyB0aGlzLnZpZXcud2lkdGg7XG5cdFx0XHR0b3AgLT0gdGhpcy52aWV3Lm9mZnNldFkgKiBoZWlnaHQgLyB0aGlzLnZpZXcuaGVpZ2h0O1xuICAgICAgICB9XG4gICAgICAgIGxldCByaWdodCA9IGxlZnQgKyB3aWR0aDtcbiAgICAgICAgbGV0IGJvdHRvbSA9IHRvcCAtIGhlaWdodDtcblxuICAgICAgICB0aGlzLnByb2plY3Rpb25NYXRyaXguZnJvbVBlcnNwZWN0aXZlRnJ1c3RydW0oeyBsZWZ0LCByaWdodCwgdG9wLCBib3R0b20sIG5lYXIsIGZhciB9KTtcbiAgICAgICAgdGhpcy50eXBlID0gJ3BlcnNwZWN0aXZlJztcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgb3J0aG9ncmFwaGljKHtcbiAgICAgICAgbmVhciA9IHRoaXMubmVhcixcbiAgICAgICAgZmFyID0gdGhpcy5mYXIsXG4gICAgICAgIGxlZnQgPSB0aGlzLmxlZnQsXG4gICAgICAgIHJpZ2h0ID0gdGhpcy5yaWdodCxcbiAgICAgICAgYm90dG9tID0gdGhpcy5ib3R0b20sXG4gICAgICAgIHRvcCA9IHRoaXMudG9wLFxuICAgICAgICB6b29tID0gdGhpcy56b29tLFxuICAgIH0gPSB7fSkge1xuICAgICAgICBPYmplY3QuYXNzaWduKHRoaXMsIHsgbmVhciwgZmFyLCBsZWZ0LCByaWdodCwgYm90dG9tLCB0b3AsIHpvb20gfSk7XG4gICAgICAgIGxlZnQgLz0gem9vbTtcbiAgICAgICAgcmlnaHQgLz0gem9vbTtcbiAgICAgICAgYm90dG9tIC89IHpvb207XG4gICAgICAgIHRvcCAvPSB6b29tO1xuICAgICAgICB0aGlzLnByb2plY3Rpb25NYXRyaXguZnJvbU9ydGhvZ29uYWwoeyBsZWZ0LCByaWdodCwgYm90dG9tLCB0b3AsIG5lYXIsIGZhciB9KTtcbiAgICAgICAgdGhpcy50eXBlID0gJ29ydGhvZ3JhcGhpYyc7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHVwZGF0ZU1hdHJpeFdvcmxkKCkge1xuICAgICAgICBzdXBlci51cGRhdGVNYXRyaXhXb3JsZCgpO1xuICAgICAgICB0aGlzLnZpZXdNYXRyaXguaW52ZXJzZSh0aGlzLndvcmxkTWF0cml4KTtcbiAgICAgICAgdGhpcy53b3JsZE1hdHJpeC5nZXRUcmFuc2xhdGlvbih0aGlzLndvcmxkUG9zaXRpb24pO1xuXG4gICAgICAgIC8vIHVzZWQgZm9yIHNvcnRpbmdcbiAgICAgICAgdGhpcy5wcm9qZWN0aW9uVmlld01hdHJpeC5tdWx0aXBseSh0aGlzLnByb2plY3Rpb25NYXRyaXgsIHRoaXMudmlld01hdHJpeCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGxvb2tBdCh0YXJnZXQpIHtcbiAgICAgICAgc3VwZXIubG9va0F0KHRhcmdldCwgdHJ1ZSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8vIFByb2plY3QgM0QgY29vcmRpbmF0ZSB0byAyRCBwb2ludFxuICAgIHByb2plY3Qodikge1xuICAgICAgICB2LmFwcGx5TWF0cml4NCh0aGlzLnZpZXdNYXRyaXgpO1xuICAgICAgICB2LmFwcGx5TWF0cml4NCh0aGlzLnByb2plY3Rpb25NYXRyaXgpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvLyBVbnByb2plY3QgMkQgcG9pbnQgdG8gM0QgY29vcmRpbmF0ZVxuICAgIHVucHJvamVjdCh2KSB7XG4gICAgICAgIHYuYXBwbHlNYXRyaXg0KHRlbXBNYXQ0LmludmVyc2UodGhpcy5wcm9qZWN0aW9uTWF0cml4KSk7XG4gICAgICAgIHYuYXBwbHlNYXRyaXg0KHRoaXMud29ybGRNYXRyaXgpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICB1cGRhdGVGcnVzdHVtKCkge1xuICAgICAgICBpZiAoIXRoaXMuZnJ1c3R1bSkge1xuICAgICAgICAgICAgdGhpcy5mcnVzdHVtID0gW25ldyBWZWMzKCksIG5ldyBWZWMzKCksIG5ldyBWZWMzKCksIG5ldyBWZWMzKCksIG5ldyBWZWMzKCksIG5ldyBWZWMzKCldO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgbSA9IHRoaXMucHJvamVjdGlvblZpZXdNYXRyaXg7XG4gICAgICAgIHRoaXMuZnJ1c3R1bVswXS5zZXQobVszXSAtIG1bMF0sIG1bN10gLSBtWzRdLCBtWzExXSAtIG1bOF0pLmNvbnN0YW50ID0gbVsxNV0gLSBtWzEyXTsgLy8gLXhcbiAgICAgICAgdGhpcy5mcnVzdHVtWzFdLnNldChtWzNdICsgbVswXSwgbVs3XSArIG1bNF0sIG1bMTFdICsgbVs4XSkuY29uc3RhbnQgPSBtWzE1XSArIG1bMTJdOyAvLyAreFxuICAgICAgICB0aGlzLmZydXN0dW1bMl0uc2V0KG1bM10gKyBtWzFdLCBtWzddICsgbVs1XSwgbVsxMV0gKyBtWzldKS5jb25zdGFudCA9IG1bMTVdICsgbVsxM107IC8vICt5XG4gICAgICAgIHRoaXMuZnJ1c3R1bVszXS5zZXQobVszXSAtIG1bMV0sIG1bN10gLSBtWzVdLCBtWzExXSAtIG1bOV0pLmNvbnN0YW50ID0gbVsxNV0gLSBtWzEzXTsgLy8gLXlcbiAgICAgICAgdGhpcy5mcnVzdHVtWzRdLnNldChtWzNdIC0gbVsyXSwgbVs3XSAtIG1bNl0sIG1bMTFdIC0gbVsxMF0pLmNvbnN0YW50ID0gbVsxNV0gLSBtWzE0XTsgLy8gK3ogKGZhcilcbiAgICAgICAgdGhpcy5mcnVzdHVtWzVdLnNldChtWzNdICsgbVsyXSwgbVs3XSArIG1bNl0sIG1bMTFdICsgbVsxMF0pLmNvbnN0YW50ID0gbVsxNV0gKyBtWzE0XTsgLy8gLXogKG5lYXIpXG5cbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCA2OyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IGludkxlbiA9IDEuMCAvIHRoaXMuZnJ1c3R1bVtpXS5kaXN0YW5jZSgpO1xuICAgICAgICAgICAgdGhpcy5mcnVzdHVtW2ldLm11bHRpcGx5KGludkxlbik7XG4gICAgICAgICAgICB0aGlzLmZydXN0dW1baV0uY29uc3RhbnQgKj0gaW52TGVuO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnJ1c3R1bUludGVyc2VjdHNNZXNoKG5vZGUpIHtcbiAgICAgICAgLy8gSWYgbm8gcG9zaXRpb24gYXR0cmlidXRlLCB0cmVhdCBhcyBmcnVzdHVtQ3VsbGVkIGZhbHNlXG4gICAgICAgIGlmICghbm9kZS5nZW9tZXRyeS5hdHRyaWJ1dGVzLnBvc2l0aW9uKSByZXR1cm4gdHJ1ZTtcblxuICAgICAgICBpZiAoIW5vZGUuZ2VvbWV0cnkuYm91bmRzIHx8IG5vZGUuZ2VvbWV0cnkuYm91bmRzLnJhZGl1cyA9PT0gSW5maW5pdHkpIG5vZGUuZ2VvbWV0cnkuY29tcHV0ZUJvdW5kaW5nU3BoZXJlKCk7XG5cbiAgICAgICAgaWYgKCFub2RlLmdlb21ldHJ5LmJvdW5kcykgcmV0dXJuIHRydWU7XG5cbiAgICAgICAgY29uc3QgY2VudGVyID0gdGVtcFZlYzNhO1xuICAgICAgICBjZW50ZXIuY29weShub2RlLmdlb21ldHJ5LmJvdW5kcy5jZW50ZXIpO1xuICAgICAgICBjZW50ZXIuYXBwbHlNYXRyaXg0KG5vZGUud29ybGRNYXRyaXgpO1xuXG4gICAgICAgIGNvbnN0IHJhZGl1cyA9IG5vZGUuZ2VvbWV0cnkuYm91bmRzLnJhZGl1cyAqIG5vZGUud29ybGRNYXRyaXguZ2V0TWF4U2NhbGVPbkF4aXMoKTtcblxuICAgICAgICByZXR1cm4gdGhpcy5mcnVzdHVtSW50ZXJzZWN0c1NwaGVyZShjZW50ZXIsIHJhZGl1cyk7XG4gICAgfVxuXG4gICAgZnJ1c3R1bUludGVyc2VjdHNTcGhlcmUoY2VudGVyLCByYWRpdXMpIHtcbiAgICAgICAgY29uc3Qgbm9ybWFsID0gdGVtcFZlYzNiO1xuXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgNjsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBwbGFuZSA9IHRoaXMuZnJ1c3R1bVtpXTtcbiAgICAgICAgICAgIGNvbnN0IGRpc3RhbmNlID0gbm9ybWFsLmNvcHkocGxhbmUpLmRvdChjZW50ZXIpICsgcGxhbmUuY29uc3RhbnQ7XG4gICAgICAgICAgICBpZiAoZGlzdGFuY2UgPCAtcmFkaXVzKSByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxufVxuIiwiLy8gYXR0cmlidXRlIHBhcmFtc1xuLy8ge1xuLy8gICAgIGRhdGEgLSB0eXBlZCBhcnJheSBlZyBVSW50MTZBcnJheSBmb3IgaW5kaWNlcywgRmxvYXQzMkFycmF5XG4vLyAgICAgc2l6ZSAtIGludCBkZWZhdWx0IDFcbi8vICAgICBpbnN0YW5jZWQgLSBkZWZhdWx0IG51bGwuIFBhc3MgZGl2aXNvciBhbW91bnRcbi8vICAgICB0eXBlIC0gZ2wgZW51bSBkZWZhdWx0IGdsLlVOU0lHTkVEX1NIT1JUIGZvciAnaW5kZXgnLCBnbC5GTE9BVCBmb3Igb3RoZXJzXG4vLyAgICAgbm9ybWFsaXplZCAtIGJvb2xlYW4gZGVmYXVsdCBmYWxzZVxuXG4vLyAgICAgYnVmZmVyIC0gZ2wgYnVmZmVyLCBpZiBidWZmZXIgZXhpc3RzLCBkb24ndCBuZWVkIHRvIHByb3ZpZGUgZGF0YVxuLy8gICAgIHN0cmlkZSAtIGRlZmF1bHQgMCAtIGZvciB3aGVuIHBhc3NpbmcgaW4gYnVmZmVyXG4vLyAgICAgb2Zmc2V0IC0gZGVmYXVsdCAwIC0gZm9yIHdoZW4gcGFzc2luZyBpbiBidWZmZXJcbi8vICAgICBjb3VudCAtIGRlZmF1bHQgbnVsbCAtIGZvciB3aGVuIHBhc3NpbmcgaW4gYnVmZmVyXG4vLyAgICAgbWluIC0gYXJyYXkgLSBmb3Igd2hlbiBwYXNzaW5nIGluIGJ1ZmZlclxuLy8gICAgIG1heCAtIGFycmF5IC0gZm9yIHdoZW4gcGFzc2luZyBpbiBidWZmZXJcbi8vIH1cblxuLy8gVE9ETzogZml0IGluIHRyYW5zZm9ybSBmZWVkYmFja1xuLy8gVE9ETzogd2hlbiB3b3VsZCBJIGRpc2FibGVWZXJ0ZXhBdHRyaWJBcnJheSA/XG4vLyBUT0RPOiB1c2Ugb2Zmc2V0L3N0cmlkZSBpZiBleGlzdHNcblxuaW1wb3J0IHsgVmVjMyB9IGZyb20gJy4uL21hdGgvVmVjMy5qcyc7XG5cbmNvbnN0IHRlbXBWZWMzID0gbmV3IFZlYzMoKTtcblxubGV0IElEID0gMTtcbmxldCBBVFRSX0lEID0gMTtcblxuLy8gVG8gc3RvcCBpbmlmaW5pdGUgd2FybmluZ3NcbmxldCBpc0JvdW5kc1dhcm5lZCA9IGZhbHNlO1xuXG5leHBvcnQgY2xhc3MgR2VvbWV0cnkge1xuICAgIGNvbnN0cnVjdG9yKGdsLCBhdHRyaWJ1dGVzID0ge30pIHtcbiAgICAgICAgaWYgKCFnbC5jYW52YXMpIGNvbnNvbGUuZXJyb3IoJ2dsIG5vdCBwYXNzZWQgYXMgZmlyc3QgYXJndW1lbnQgdG8gR2VvbWV0cnknKTtcbiAgICAgICAgdGhpcy5nbCA9IGdsO1xuICAgICAgICB0aGlzLmF0dHJpYnV0ZXMgPSBhdHRyaWJ1dGVzO1xuICAgICAgICB0aGlzLmlkID0gSUQrKztcblxuICAgICAgICAvLyBTdG9yZSBvbmUgVkFPIHBlciBwcm9ncmFtIGF0dHJpYnV0ZSBsb2NhdGlvbnMgb3JkZXJcbiAgICAgICAgdGhpcy5WQU9zID0ge307XG5cbiAgICAgICAgdGhpcy5kcmF3UmFuZ2UgPSB7IHN0YXJ0OiAwLCBjb3VudDogMCB9O1xuICAgICAgICB0aGlzLmluc3RhbmNlZENvdW50ID0gMDtcblxuICAgICAgICAvLyBVbmJpbmQgY3VycmVudCBWQU8gc28gdGhhdCBuZXcgYnVmZmVycyBkb24ndCBnZXQgYWRkZWQgdG8gYWN0aXZlIG1lc2hcbiAgICAgICAgdGhpcy5nbC5yZW5kZXJlci5iaW5kVmVydGV4QXJyYXkobnVsbCk7XG4gICAgICAgIHRoaXMuZ2wucmVuZGVyZXIuY3VycmVudEdlb21ldHJ5ID0gbnVsbDtcblxuICAgICAgICAvLyBBbGlhcyBmb3Igc3RhdGUgc3RvcmUgdG8gYXZvaWQgcmVkdW5kYW50IGNhbGxzIGZvciBnbG9iYWwgc3RhdGVcbiAgICAgICAgdGhpcy5nbFN0YXRlID0gdGhpcy5nbC5yZW5kZXJlci5zdGF0ZTtcblxuICAgICAgICAvLyBjcmVhdGUgdGhlIGJ1ZmZlcnNcbiAgICAgICAgZm9yIChsZXQga2V5IGluIGF0dHJpYnV0ZXMpIHtcbiAgICAgICAgICAgIHRoaXMuYWRkQXR0cmlidXRlKGtleSwgYXR0cmlidXRlc1trZXldKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGFkZEF0dHJpYnV0ZShrZXksIGF0dHIpIHtcbiAgICAgICAgdGhpcy5hdHRyaWJ1dGVzW2tleV0gPSBhdHRyO1xuXG4gICAgICAgIC8vIFNldCBvcHRpb25zXG4gICAgICAgIGF0dHIuaWQgPSBBVFRSX0lEKys7IC8vIFRPRE86IGN1cnJlbnRseSB1bnVzZWQsIHJlbW92ZT9cbiAgICAgICAgYXR0ci5zaXplID0gYXR0ci5zaXplIHx8IDE7XG4gICAgICAgIGF0dHIudHlwZSA9XG4gICAgICAgICAgICBhdHRyLnR5cGUgfHxcbiAgICAgICAgICAgIChhdHRyLmRhdGEuY29uc3RydWN0b3IgPT09IEZsb2F0MzJBcnJheVxuICAgICAgICAgICAgICAgID8gdGhpcy5nbC5GTE9BVFxuICAgICAgICAgICAgICAgIDogYXR0ci5kYXRhLmNvbnN0cnVjdG9yID09PSBVaW50MTZBcnJheVxuICAgICAgICAgICAgICAgID8gdGhpcy5nbC5VTlNJR05FRF9TSE9SVFxuICAgICAgICAgICAgICAgIDogdGhpcy5nbC5VTlNJR05FRF9JTlQpOyAvLyBVaW50MzJBcnJheVxuICAgICAgICBhdHRyLnRhcmdldCA9IGtleSA9PT0gJ2luZGV4JyA/IHRoaXMuZ2wuRUxFTUVOVF9BUlJBWV9CVUZGRVIgOiB0aGlzLmdsLkFSUkFZX0JVRkZFUjtcbiAgICAgICAgYXR0ci5ub3JtYWxpemVkID0gYXR0ci5ub3JtYWxpemVkIHx8IGZhbHNlO1xuICAgICAgICBhdHRyLnN0cmlkZSA9IGF0dHIuc3RyaWRlIHx8IDA7XG4gICAgICAgIGF0dHIub2Zmc2V0ID0gYXR0ci5vZmZzZXQgfHwgMDtcbiAgICAgICAgYXR0ci5jb3VudCA9IGF0dHIuY291bnQgfHwgKGF0dHIuc3RyaWRlID8gYXR0ci5kYXRhLmJ5dGVMZW5ndGggLyBhdHRyLnN0cmlkZSA6IGF0dHIuZGF0YS5sZW5ndGggLyBhdHRyLnNpemUpO1xuICAgICAgICBhdHRyLmRpdmlzb3IgPSBhdHRyLmluc3RhbmNlZCB8fCAwO1xuICAgICAgICBhdHRyLm5lZWRzVXBkYXRlID0gZmFsc2U7XG5cbiAgICAgICAgaWYgKCFhdHRyLmJ1ZmZlcikge1xuICAgICAgICAgICAgYXR0ci5idWZmZXIgPSB0aGlzLmdsLmNyZWF0ZUJ1ZmZlcigpO1xuXG4gICAgICAgICAgICAvLyBQdXNoIGRhdGEgdG8gYnVmZmVyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZUF0dHJpYnV0ZShhdHRyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFVwZGF0ZSBnZW9tZXRyeSBjb3VudHMuIElmIGluZGV4ZWQsIGlnbm9yZSByZWd1bGFyIGF0dHJpYnV0ZXNcbiAgICAgICAgaWYgKGF0dHIuZGl2aXNvcikge1xuICAgICAgICAgICAgdGhpcy5pc0luc3RhbmNlZCA9IHRydWU7XG4gICAgICAgICAgICBpZiAodGhpcy5pbnN0YW5jZWRDb3VudCAmJiB0aGlzLmluc3RhbmNlZENvdW50ICE9PSBhdHRyLmNvdW50ICogYXR0ci5kaXZpc29yKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdnZW9tZXRyeSBoYXMgbXVsdGlwbGUgaW5zdGFuY2VkIGJ1ZmZlcnMgb2YgZGlmZmVyZW50IGxlbmd0aCcpO1xuICAgICAgICAgICAgICAgIHJldHVybiAodGhpcy5pbnN0YW5jZWRDb3VudCA9IE1hdGgubWluKHRoaXMuaW5zdGFuY2VkQ291bnQsIGF0dHIuY291bnQgKiBhdHRyLmRpdmlzb3IpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuaW5zdGFuY2VkQ291bnQgPSBhdHRyLmNvdW50ICogYXR0ci5kaXZpc29yO1xuICAgICAgICB9IGVsc2UgaWYgKGtleSA9PT0gJ2luZGV4Jykge1xuICAgICAgICAgICAgdGhpcy5kcmF3UmFuZ2UuY291bnQgPSBhdHRyLmNvdW50O1xuICAgICAgICB9IGVsc2UgaWYgKCF0aGlzLmF0dHJpYnV0ZXMuaW5kZXgpIHtcbiAgICAgICAgICAgIHRoaXMuZHJhd1JhbmdlLmNvdW50ID0gTWF0aC5tYXgodGhpcy5kcmF3UmFuZ2UuY291bnQsIGF0dHIuY291bnQpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgdXBkYXRlQXR0cmlidXRlKGF0dHIpIHtcbiAgICAgICAgaWYgKHRoaXMuZ2xTdGF0ZS5ib3VuZEJ1ZmZlciAhPT0gYXR0ci5idWZmZXIpIHtcbiAgICAgICAgICAgIHRoaXMuZ2wuYmluZEJ1ZmZlcihhdHRyLnRhcmdldCwgYXR0ci5idWZmZXIpO1xuICAgICAgICAgICAgdGhpcy5nbFN0YXRlLmJvdW5kQnVmZmVyID0gYXR0ci5idWZmZXI7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5nbC5idWZmZXJEYXRhKGF0dHIudGFyZ2V0LCBhdHRyLmRhdGEsIHRoaXMuZ2wuU1RBVElDX0RSQVcpO1xuICAgICAgICBhdHRyLm5lZWRzVXBkYXRlID0gZmFsc2U7XG4gICAgfVxuXG4gICAgc2V0SW5kZXgodmFsdWUpIHtcbiAgICAgICAgdGhpcy5hZGRBdHRyaWJ1dGUoJ2luZGV4JywgdmFsdWUpO1xuICAgIH1cblxuICAgIHNldERyYXdSYW5nZShzdGFydCwgY291bnQpIHtcbiAgICAgICAgdGhpcy5kcmF3UmFuZ2Uuc3RhcnQgPSBzdGFydDtcbiAgICAgICAgdGhpcy5kcmF3UmFuZ2UuY291bnQgPSBjb3VudDtcbiAgICB9XG5cbiAgICBzZXRJbnN0YW5jZWRDb3VudCh2YWx1ZSkge1xuICAgICAgICB0aGlzLmluc3RhbmNlZENvdW50ID0gdmFsdWU7XG4gICAgfVxuXG4gICAgY3JlYXRlVkFPKHByb2dyYW0pIHtcbiAgICAgICAgdGhpcy5WQU9zW3Byb2dyYW0uYXR0cmlidXRlT3JkZXJdID0gdGhpcy5nbC5yZW5kZXJlci5jcmVhdGVWZXJ0ZXhBcnJheSgpO1xuICAgICAgICB0aGlzLmdsLnJlbmRlcmVyLmJpbmRWZXJ0ZXhBcnJheSh0aGlzLlZBT3NbcHJvZ3JhbS5hdHRyaWJ1dGVPcmRlcl0pO1xuICAgICAgICB0aGlzLmJpbmRBdHRyaWJ1dGVzKHByb2dyYW0pO1xuICAgIH1cblxuICAgIGJpbmRBdHRyaWJ1dGVzKHByb2dyYW0pIHtcbiAgICAgICAgLy8gTGluayBhbGwgYXR0cmlidXRlcyB0byBwcm9ncmFtIHVzaW5nIGdsLnZlcnRleEF0dHJpYlBvaW50ZXJcbiAgICAgICAgcHJvZ3JhbS5hdHRyaWJ1dGVMb2NhdGlvbnMuZm9yRWFjaCgobG9jYXRpb24sIHsgbmFtZSwgdHlwZSB9KSA9PiB7XG4gICAgICAgICAgICAvLyBJZiBnZW9tZXRyeSBtaXNzaW5nIGEgcmVxdWlyZWQgc2hhZGVyIGF0dHJpYnV0ZVxuICAgICAgICAgICAgaWYgKCF0aGlzLmF0dHJpYnV0ZXNbbmFtZV0pIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYGFjdGl2ZSBhdHRyaWJ1dGUgJHtuYW1lfSBub3QgYmVpbmcgc3VwcGxpZWRgKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IGF0dHIgPSB0aGlzLmF0dHJpYnV0ZXNbbmFtZV07XG5cbiAgICAgICAgICAgIHRoaXMuZ2wuYmluZEJ1ZmZlcihhdHRyLnRhcmdldCwgYXR0ci5idWZmZXIpO1xuICAgICAgICAgICAgdGhpcy5nbFN0YXRlLmJvdW5kQnVmZmVyID0gYXR0ci5idWZmZXI7XG5cbiAgICAgICAgICAgIC8vIEZvciBtYXRyaXggYXR0cmlidXRlcywgYnVmZmVyIG5lZWRzIHRvIGJlIGRlZmluZWQgcGVyIGNvbHVtblxuICAgICAgICAgICAgbGV0IG51bUxvYyA9IDE7XG4gICAgICAgICAgICBpZiAodHlwZSA9PT0gMzU2NzQpIG51bUxvYyA9IDI7IC8vIG1hdDJcbiAgICAgICAgICAgIGlmICh0eXBlID09PSAzNTY3NSkgbnVtTG9jID0gMzsgLy8gbWF0M1xuICAgICAgICAgICAgaWYgKHR5cGUgPT09IDM1Njc2KSBudW1Mb2MgPSA0OyAvLyBtYXQ0XG5cbiAgICAgICAgICAgIGNvbnN0IHNpemUgPSBhdHRyLnNpemUgLyBudW1Mb2M7XG4gICAgICAgICAgICBjb25zdCBzdHJpZGUgPSBudW1Mb2MgPT09IDEgPyAwIDogbnVtTG9jICogbnVtTG9jICogbnVtTG9jO1xuICAgICAgICAgICAgY29uc3Qgb2Zmc2V0ID0gbnVtTG9jID09PSAxID8gMCA6IG51bUxvYyAqIG51bUxvYztcblxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBudW1Mb2M7IGkrKykge1xuICAgICAgICAgICAgICAgIHRoaXMuZ2wudmVydGV4QXR0cmliUG9pbnRlcihsb2NhdGlvbiArIGksIHNpemUsIGF0dHIudHlwZSwgYXR0ci5ub3JtYWxpemVkLCBhdHRyLnN0cmlkZSArIHN0cmlkZSwgYXR0ci5vZmZzZXQgKyBpICogb2Zmc2V0KTtcbiAgICAgICAgICAgICAgICB0aGlzLmdsLmVuYWJsZVZlcnRleEF0dHJpYkFycmF5KGxvY2F0aW9uICsgaSk7XG5cbiAgICAgICAgICAgICAgICAvLyBGb3IgaW5zdGFuY2VkIGF0dHJpYnV0ZXMsIGRpdmlzb3IgbmVlZHMgdG8gYmUgc2V0LlxuICAgICAgICAgICAgICAgIC8vIEZvciBmaXJlZm94LCBuZWVkIHRvIHNldCBiYWNrIHRvIDAgaWYgbm9uLWluc3RhbmNlZCBkcmF3biBhZnRlciBpbnN0YW5jZWQuIEVsc2Ugd29uJ3QgcmVuZGVyXG4gICAgICAgICAgICAgICAgdGhpcy5nbC5yZW5kZXJlci52ZXJ0ZXhBdHRyaWJEaXZpc29yKGxvY2F0aW9uICsgaSwgYXR0ci5kaXZpc29yKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gQmluZCBpbmRpY2VzIGlmIGdlb21ldHJ5IGluZGV4ZWRcbiAgICAgICAgaWYgKHRoaXMuYXR0cmlidXRlcy5pbmRleCkgdGhpcy5nbC5iaW5kQnVmZmVyKHRoaXMuZ2wuRUxFTUVOVF9BUlJBWV9CVUZGRVIsIHRoaXMuYXR0cmlidXRlcy5pbmRleC5idWZmZXIpO1xuICAgIH1cblxuICAgIGRyYXcoeyBwcm9ncmFtLCBtb2RlID0gdGhpcy5nbC5UUklBTkdMRVMgfSkge1xuICAgICAgICBpZiAodGhpcy5nbC5yZW5kZXJlci5jdXJyZW50R2VvbWV0cnkgIT09IGAke3RoaXMuaWR9XyR7cHJvZ3JhbS5hdHRyaWJ1dGVPcmRlcn1gKSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMuVkFPc1twcm9ncmFtLmF0dHJpYnV0ZU9yZGVyXSkgdGhpcy5jcmVhdGVWQU8ocHJvZ3JhbSk7XG4gICAgICAgICAgICB0aGlzLmdsLnJlbmRlcmVyLmJpbmRWZXJ0ZXhBcnJheSh0aGlzLlZBT3NbcHJvZ3JhbS5hdHRyaWJ1dGVPcmRlcl0pO1xuICAgICAgICAgICAgdGhpcy5nbC5yZW5kZXJlci5jdXJyZW50R2VvbWV0cnkgPSBgJHt0aGlzLmlkfV8ke3Byb2dyYW0uYXR0cmlidXRlT3JkZXJ9YDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENoZWNrIGlmIGFueSBhdHRyaWJ1dGVzIG5lZWQgdXBkYXRpbmdcbiAgICAgICAgcHJvZ3JhbS5hdHRyaWJ1dGVMb2NhdGlvbnMuZm9yRWFjaCgobG9jYXRpb24sIHsgbmFtZSB9KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBhdHRyID0gdGhpcy5hdHRyaWJ1dGVzW25hbWVdO1xuICAgICAgICAgICAgaWYgKGF0dHIubmVlZHNVcGRhdGUpIHRoaXMudXBkYXRlQXR0cmlidXRlKGF0dHIpO1xuICAgICAgICB9KTtcblxuICAgICAgICBpZiAodGhpcy5pc0luc3RhbmNlZCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuYXR0cmlidXRlcy5pbmRleCkge1xuICAgICAgICAgICAgICAgIHRoaXMuZ2wucmVuZGVyZXIuZHJhd0VsZW1lbnRzSW5zdGFuY2VkKFxuICAgICAgICAgICAgICAgICAgICBtb2RlLFxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRyYXdSYW5nZS5jb3VudCxcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hdHRyaWJ1dGVzLmluZGV4LnR5cGUsXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYXR0cmlidXRlcy5pbmRleC5vZmZzZXQgKyB0aGlzLmRyYXdSYW5nZS5zdGFydCAqIDIsXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW5zdGFuY2VkQ291bnRcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmdsLnJlbmRlcmVyLmRyYXdBcnJheXNJbnN0YW5jZWQobW9kZSwgdGhpcy5kcmF3UmFuZ2Uuc3RhcnQsIHRoaXMuZHJhd1JhbmdlLmNvdW50LCB0aGlzLmluc3RhbmNlZENvdW50KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmF0dHJpYnV0ZXMuaW5kZXgpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmdsLmRyYXdFbGVtZW50cyhtb2RlLCB0aGlzLmRyYXdSYW5nZS5jb3VudCwgdGhpcy5hdHRyaWJ1dGVzLmluZGV4LnR5cGUsIHRoaXMuYXR0cmlidXRlcy5pbmRleC5vZmZzZXQgKyB0aGlzLmRyYXdSYW5nZS5zdGFydCAqIDIpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmdsLmRyYXdBcnJheXMobW9kZSwgdGhpcy5kcmF3UmFuZ2Uuc3RhcnQsIHRoaXMuZHJhd1JhbmdlLmNvdW50KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGdldFBvc2l0aW9uQXJyYXkoKSB7XG4gICAgICAgIC8vIFVzZSBwb3NpdGlvbiBidWZmZXIsIG9yIG1pbi9tYXggaWYgYXZhaWxhYmxlXG4gICAgICAgIGNvbnN0IGF0dHIgPSB0aGlzLmF0dHJpYnV0ZXMucG9zaXRpb247XG4gICAgICAgIC8vIGlmIChhdHRyLm1pbikgcmV0dXJuIFsuLi5hdHRyLm1pbiwgLi4uYXR0ci5tYXhdO1xuICAgICAgICBpZiAoYXR0ci5kYXRhKSByZXR1cm4gYXR0ci5kYXRhO1xuICAgICAgICBpZiAoaXNCb3VuZHNXYXJuZWQpIHJldHVybjtcbiAgICAgICAgY29uc29sZS53YXJuKCdObyBwb3NpdGlvbiBidWZmZXIgZGF0YSBmb3VuZCB0byBjb21wdXRlIGJvdW5kcycpO1xuICAgICAgICByZXR1cm4gKGlzQm91bmRzV2FybmVkID0gdHJ1ZSk7XG4gICAgfVxuXG4gICAgY29tcHV0ZUJvdW5kaW5nQm94KGFycmF5KSB7XG4gICAgICAgIGlmICghYXJyYXkpIGFycmF5ID0gdGhpcy5nZXRQb3NpdGlvbkFycmF5KCk7XG5cbiAgICAgICAgaWYgKCF0aGlzLmJvdW5kcykge1xuICAgICAgICAgICAgdGhpcy5ib3VuZHMgPSB7XG4gICAgICAgICAgICAgICAgbWluOiBuZXcgVmVjMygpLFxuICAgICAgICAgICAgICAgIG1heDogbmV3IFZlYzMoKSxcbiAgICAgICAgICAgICAgICBjZW50ZXI6IG5ldyBWZWMzKCksXG4gICAgICAgICAgICAgICAgc2NhbGU6IG5ldyBWZWMzKCksXG4gICAgICAgICAgICAgICAgcmFkaXVzOiBJbmZpbml0eSxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBtaW4gPSB0aGlzLmJvdW5kcy5taW47XG4gICAgICAgIGNvbnN0IG1heCA9IHRoaXMuYm91bmRzLm1heDtcbiAgICAgICAgY29uc3QgY2VudGVyID0gdGhpcy5ib3VuZHMuY2VudGVyO1xuICAgICAgICBjb25zdCBzY2FsZSA9IHRoaXMuYm91bmRzLnNjYWxlO1xuXG4gICAgICAgIG1pbi5zZXQoK0luZmluaXR5KTtcbiAgICAgICAgbWF4LnNldCgtSW5maW5pdHkpO1xuXG4gICAgICAgIC8vIFRPRE86IHVzZSBvZmZzZXQvc3RyaWRlIGlmIGV4aXN0c1xuICAgICAgICAvLyBUT0RPOiBjaGVjayBzaXplIG9mIHBvc2l0aW9uIChlZyB0cmlhbmdsZSB3aXRoIFZlYzIpXG4gICAgICAgIGZvciAobGV0IGkgPSAwLCBsID0gYXJyYXkubGVuZ3RoOyBpIDwgbDsgaSArPSAzKSB7XG4gICAgICAgICAgICBjb25zdCB4ID0gYXJyYXlbaV07XG4gICAgICAgICAgICBjb25zdCB5ID0gYXJyYXlbaSArIDFdO1xuICAgICAgICAgICAgY29uc3QgeiA9IGFycmF5W2kgKyAyXTtcblxuICAgICAgICAgICAgbWluLnggPSBNYXRoLm1pbih4LCBtaW4ueCk7XG4gICAgICAgICAgICBtaW4ueSA9IE1hdGgubWluKHksIG1pbi55KTtcbiAgICAgICAgICAgIG1pbi56ID0gTWF0aC5taW4oeiwgbWluLnopO1xuXG4gICAgICAgICAgICBtYXgueCA9IE1hdGgubWF4KHgsIG1heC54KTtcbiAgICAgICAgICAgIG1heC55ID0gTWF0aC5tYXgoeSwgbWF4LnkpO1xuICAgICAgICAgICAgbWF4LnogPSBNYXRoLm1heCh6LCBtYXgueik7XG4gICAgICAgIH1cblxuICAgICAgICBzY2FsZS5zdWIobWF4LCBtaW4pO1xuICAgICAgICBjZW50ZXIuYWRkKG1pbiwgbWF4KS5kaXZpZGUoMik7XG4gICAgfVxuXG4gICAgY29tcHV0ZUJvdW5kaW5nU3BoZXJlKGFycmF5KSB7XG4gICAgICAgIGlmICghYXJyYXkpIGFycmF5ID0gdGhpcy5nZXRQb3NpdGlvbkFycmF5KCk7XG4gICAgICAgIGlmICghdGhpcy5ib3VuZHMpIHRoaXMuY29tcHV0ZUJvdW5kaW5nQm94KGFycmF5KTtcblxuICAgICAgICBsZXQgbWF4UmFkaXVzU3EgPSAwO1xuICAgICAgICBmb3IgKGxldCBpID0gMCwgbCA9IGFycmF5Lmxlbmd0aDsgaSA8IGw7IGkgKz0gMykge1xuICAgICAgICAgICAgdGVtcFZlYzMuZnJvbUFycmF5KGFycmF5LCBpKTtcbiAgICAgICAgICAgIG1heFJhZGl1c1NxID0gTWF0aC5tYXgobWF4UmFkaXVzU3EsIHRoaXMuYm91bmRzLmNlbnRlci5zcXVhcmVkRGlzdGFuY2UodGVtcFZlYzMpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuYm91bmRzLnJhZGl1cyA9IE1hdGguc3FydChtYXhSYWRpdXNTcSk7XG4gICAgfVxuXG4gICAgcmVtb3ZlKCkge1xuICAgICAgICBpZiAodGhpcy52YW8pIHRoaXMuZ2wucmVuZGVyZXIuZGVsZXRlVmVydGV4QXJyYXkodGhpcy52YW8pO1xuICAgICAgICBmb3IgKGxldCBrZXkgaW4gdGhpcy5hdHRyaWJ1dGVzKSB7XG4gICAgICAgICAgICB0aGlzLmdsLmRlbGV0ZUJ1ZmZlcih0aGlzLmF0dHJpYnV0ZXNba2V5XS5idWZmZXIpO1xuICAgICAgICAgICAgZGVsZXRlIHRoaXMuYXR0cmlidXRlc1trZXldO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgVHJhbnNmb3JtIH0gZnJvbSAnLi9UcmFuc2Zvcm0uanMnO1xuaW1wb3J0IHsgTWF0MyB9IGZyb20gJy4uL21hdGgvTWF0My5qcyc7XG5pbXBvcnQgeyBNYXQ0IH0gZnJvbSAnLi4vbWF0aC9NYXQ0LmpzJztcblxubGV0IElEID0gMDtcblxuZXhwb3J0IGNsYXNzIE1lc2ggZXh0ZW5kcyBUcmFuc2Zvcm0ge1xuICAgIGNvbnN0cnVjdG9yKGdsLCB7IGdlb21ldHJ5LCBwcm9ncmFtLCBtb2RlID0gZ2wuVFJJQU5HTEVTLCBmcnVzdHVtQ3VsbGVkID0gdHJ1ZSwgcmVuZGVyT3JkZXIgPSAwIH0gPSB7fSkge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICBpZiAoIWdsLmNhbnZhcykgY29uc29sZS5lcnJvcignZ2wgbm90IHBhc3NlZCBhcyBmaXJzdCBhcmd1bWVudCB0byBNZXNoJyk7XG4gICAgICAgIHRoaXMuZ2wgPSBnbDtcbiAgICAgICAgdGhpcy5pZCA9IElEKys7XG4gICAgICAgIHRoaXMuZ2VvbWV0cnkgPSBnZW9tZXRyeTtcbiAgICAgICAgdGhpcy5wcm9ncmFtID0gcHJvZ3JhbTtcbiAgICAgICAgdGhpcy5tb2RlID0gbW9kZTtcblxuICAgICAgICAvLyBVc2VkIHRvIHNraXAgZnJ1c3R1bSBjdWxsaW5nXG4gICAgICAgIHRoaXMuZnJ1c3R1bUN1bGxlZCA9IGZydXN0dW1DdWxsZWQ7XG5cbiAgICAgICAgLy8gT3ZlcnJpZGUgc29ydGluZyB0byBmb3JjZSBhbiBvcmRlclxuICAgICAgICB0aGlzLnJlbmRlck9yZGVyID0gcmVuZGVyT3JkZXI7XG4gICAgICAgIHRoaXMubW9kZWxWaWV3TWF0cml4ID0gbmV3IE1hdDQoKTtcbiAgICAgICAgdGhpcy5ub3JtYWxNYXRyaXggPSBuZXcgTWF0MygpO1xuICAgICAgICB0aGlzLmJlZm9yZVJlbmRlckNhbGxiYWNrcyA9IFtdO1xuICAgICAgICB0aGlzLmFmdGVyUmVuZGVyQ2FsbGJhY2tzID0gW107XG4gICAgfVxuXG4gICAgb25CZWZvcmVSZW5kZXIoZikge1xuICAgICAgICB0aGlzLmJlZm9yZVJlbmRlckNhbGxiYWNrcy5wdXNoKGYpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBvbkFmdGVyUmVuZGVyKGYpIHtcbiAgICAgICAgdGhpcy5hZnRlclJlbmRlckNhbGxiYWNrcy5wdXNoKGYpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBkcmF3KHsgY2FtZXJhLCBvdmVycmlkZVByb2dyYW0gfSA9IHt9KSB7XG4gICAgICAgIHRoaXMuYmVmb3JlUmVuZGVyQ2FsbGJhY2tzLmZvckVhY2goKGYpID0+IGYgJiYgZih7IG1lc2g6IHRoaXMsIGNhbWVyYSB9KSk7XG4gICAgICAgIGNvbnN0IHVzZWRQcm9ncmFtID0gb3ZlcnJpZGVQcm9ncmFtIHx8IHRoaXMucHJvZ3JhbTtcbiAgICAgICAgaWYgKGNhbWVyYSkge1xuICAgICAgICAgICAgLy8gQWRkIGVtcHR5IG1hdHJpeCB1bmlmb3JtcyB0byBwcm9ncmFtIGlmIHVuc2V0XG4gICAgICAgICAgICBpZiAoIXVzZWRQcm9ncmFtLnVuaWZvcm1zLm1vZGVsTWF0cml4KSB7XG4gICAgICAgICAgICAgICAgT2JqZWN0LmFzc2lnbih1c2VkUHJvZ3JhbS51bmlmb3Jtcywge1xuICAgICAgICAgICAgICAgICAgICBtb2RlbE1hdHJpeDogeyB2YWx1ZTogbnVsbCB9LFxuICAgICAgICAgICAgICAgICAgICB2aWV3TWF0cml4OiB7IHZhbHVlOiBudWxsIH0sXG4gICAgICAgICAgICAgICAgICAgIG1vZGVsVmlld01hdHJpeDogeyB2YWx1ZTogbnVsbCB9LFxuICAgICAgICAgICAgICAgICAgICBub3JtYWxNYXRyaXg6IHsgdmFsdWU6IG51bGwgfSxcbiAgICAgICAgICAgICAgICAgICAgcHJvamVjdGlvbk1hdHJpeDogeyB2YWx1ZTogbnVsbCB9LFxuICAgICAgICAgICAgICAgICAgICBjYW1lcmFQb3NpdGlvbjogeyB2YWx1ZTogbnVsbCB9LFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBTZXQgdGhlIG1hdHJpeCB1bmlmb3Jtc1xuICAgICAgICAgICAgdXNlZFByb2dyYW0udW5pZm9ybXMucHJvamVjdGlvbk1hdHJpeC52YWx1ZSA9IGNhbWVyYS5wcm9qZWN0aW9uTWF0cml4O1xuICAgICAgICAgICAgdXNlZFByb2dyYW0udW5pZm9ybXMuY2FtZXJhUG9zaXRpb24udmFsdWUgPSBjYW1lcmEud29ybGRQb3NpdGlvbjtcbiAgICAgICAgICAgIHVzZWRQcm9ncmFtLnVuaWZvcm1zLnZpZXdNYXRyaXgudmFsdWUgPSBjYW1lcmEudmlld01hdHJpeDtcbiAgICAgICAgICAgIHRoaXMubW9kZWxWaWV3TWF0cml4Lm11bHRpcGx5KGNhbWVyYS52aWV3TWF0cml4LCB0aGlzLndvcmxkTWF0cml4KTtcbiAgICAgICAgICAgIHRoaXMubm9ybWFsTWF0cml4LmdldE5vcm1hbE1hdHJpeCh0aGlzLm1vZGVsVmlld01hdHJpeCk7XG4gICAgICAgICAgICB1c2VkUHJvZ3JhbS51bmlmb3Jtcy5tb2RlbE1hdHJpeC52YWx1ZSA9IHRoaXMud29ybGRNYXRyaXg7XG4gICAgICAgICAgICB1c2VkUHJvZ3JhbS51bmlmb3Jtcy5tb2RlbFZpZXdNYXRyaXgudmFsdWUgPSB0aGlzLm1vZGVsVmlld01hdHJpeDtcbiAgICAgICAgICAgIHVzZWRQcm9ncmFtLnVuaWZvcm1zLm5vcm1hbE1hdHJpeC52YWx1ZSA9IHRoaXMubm9ybWFsTWF0cml4O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gZGV0ZXJtaW5lIGlmIGZhY2VzIG5lZWQgdG8gYmUgZmxpcHBlZCAtIHdoZW4gbWVzaCBzY2FsZWQgbmVnYXRpdmVseVxuICAgICAgICBsZXQgZmxpcEZhY2VzID0gdXNlZFByb2dyYW0uY3VsbEZhY2UgJiYgdGhpcy53b3JsZE1hdHJpeC5kZXRlcm1pbmFudCgpIDwgMDtcbiAgICAgICAgdXNlZFByb2dyYW0udXNlKHsgZmxpcEZhY2VzIH0pO1xuICAgICAgICB0aGlzLmdlb21ldHJ5LmRyYXcoeyBtb2RlOiB0aGlzLm1vZGUsIHByb2dyYW06IHVzZWRQcm9ncmFtIH0pO1xuICAgICAgICB0aGlzLmFmdGVyUmVuZGVyQ2FsbGJhY2tzLmZvckVhY2goKGYpID0+IGYgJiYgZih7IG1lc2g6IHRoaXMsIGNhbWVyYSB9KSk7XG4gICAgfVxufVxuIiwiLy8gVE9ETzogdXBsb2FkIGVtcHR5IHRleHR1cmUgaWYgbnVsbCA/IG1heWJlIG5vdFxuLy8gVE9ETzogdXBsb2FkIGlkZW50aXR5IG1hdHJpeCBpZiBudWxsID9cbi8vIFRPRE86IHNhbXBsZXIgQ3ViZVxuXG5sZXQgSUQgPSAxO1xuXG4vLyBjYWNoZSBvZiB0eXBlZCBhcnJheXMgdXNlZCB0byBmbGF0dGVuIHVuaWZvcm0gYXJyYXlzXG5jb25zdCBhcnJheUNhY2hlRjMyID0ge307XG5cbmV4cG9ydCBjbGFzcyBQcm9ncmFtIHtcbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgZ2wsXG4gICAgICAgIHtcbiAgICAgICAgICAgIHZlcnRleCxcbiAgICAgICAgICAgIGZyYWdtZW50LFxuICAgICAgICAgICAgdW5pZm9ybXMgPSB7fSxcblxuICAgICAgICAgICAgdHJhbnNwYXJlbnQgPSBmYWxzZSxcbiAgICAgICAgICAgIGN1bGxGYWNlID0gZ2wuQkFDSyxcbiAgICAgICAgICAgIGZyb250RmFjZSA9IGdsLkNDVyxcbiAgICAgICAgICAgIGRlcHRoVGVzdCA9IHRydWUsXG4gICAgICAgICAgICBkZXB0aFdyaXRlID0gdHJ1ZSxcbiAgICAgICAgICAgIGRlcHRoRnVuYyA9IGdsLkxFU1MsXG4gICAgICAgIH0gPSB7fVxuICAgICkge1xuICAgICAgICBpZiAoIWdsLmNhbnZhcykgY29uc29sZS5lcnJvcignZ2wgbm90IHBhc3NlZCBhcyBmaXN0IGFyZ3VtZW50IHRvIFByb2dyYW0nKTtcbiAgICAgICAgdGhpcy5nbCA9IGdsO1xuICAgICAgICB0aGlzLnVuaWZvcm1zID0gdW5pZm9ybXM7XG4gICAgICAgIHRoaXMuaWQgPSBJRCsrO1xuXG4gICAgICAgIGlmICghdmVydGV4KSBjb25zb2xlLndhcm4oJ3ZlcnRleCBzaGFkZXIgbm90IHN1cHBsaWVkJyk7XG4gICAgICAgIGlmICghZnJhZ21lbnQpIGNvbnNvbGUud2FybignZnJhZ21lbnQgc2hhZGVyIG5vdCBzdXBwbGllZCcpO1xuXG4gICAgICAgIC8vIFN0b3JlIHByb2dyYW0gc3RhdGVcbiAgICAgICAgdGhpcy50cmFuc3BhcmVudCA9IHRyYW5zcGFyZW50O1xuICAgICAgICB0aGlzLmN1bGxGYWNlID0gY3VsbEZhY2U7XG4gICAgICAgIHRoaXMuZnJvbnRGYWNlID0gZnJvbnRGYWNlO1xuICAgICAgICB0aGlzLmRlcHRoVGVzdCA9IGRlcHRoVGVzdDtcbiAgICAgICAgdGhpcy5kZXB0aFdyaXRlID0gZGVwdGhXcml0ZTtcbiAgICAgICAgdGhpcy5kZXB0aEZ1bmMgPSBkZXB0aEZ1bmM7XG4gICAgICAgIHRoaXMuYmxlbmRGdW5jID0ge307XG4gICAgICAgIHRoaXMuYmxlbmRFcXVhdGlvbiA9IHt9O1xuICAgICAgICB0aGlzLnVuaWZvcm1Mb2NhdGlvbnMgPSBuZXcgTWFwKCk7XG4gICAgICAgIHRoaXMuYXR0cmlidXRlTG9jYXRpb25zID0gbmV3IE1hcCgpO1xuXG4gICAgICAgIC8vIHNldCBkZWZhdWx0IGJsZW5kRnVuYyBpZiB0cmFuc3BhcmVudCBmbGFnZ2VkXG4gICAgICAgIGlmICh0aGlzLnRyYW5zcGFyZW50ICYmICF0aGlzLmJsZW5kRnVuYy5zcmMpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmdsLnJlbmRlcmVyLnByZW11bHRpcGxpZWRBbHBoYSkgdGhpcy5zZXRCbGVuZEZ1bmModGhpcy5nbC5PTkUsIHRoaXMuZ2wuT05FX01JTlVTX1NSQ19BTFBIQSk7XG4gICAgICAgICAgICBlbHNlIHRoaXMuc2V0QmxlbmRGdW5jKHRoaXMuZ2wuU1JDX0FMUEhBLCB0aGlzLmdsLk9ORV9NSU5VU19TUkNfQUxQSEEpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gY29tcGlsZSB2ZXJ0ZXggc2hhZGVyIGFuZCBsb2cgZXJyb3JzXG4gICAgICAgIGNvbnN0IHZlcnRleFNoYWRlciA9IGdsLmNyZWF0ZVNoYWRlcihnbC5WRVJURVhfU0hBREVSKTtcbiAgICAgICAgZ2wuc2hhZGVyU291cmNlKHZlcnRleFNoYWRlciwgdmVydGV4KTtcbiAgICAgICAgZ2wuY29tcGlsZVNoYWRlcih2ZXJ0ZXhTaGFkZXIpO1xuICAgICAgICBpZiAoZ2wuZ2V0U2hhZGVySW5mb0xvZyh2ZXJ0ZXhTaGFkZXIpICE9PSAnJykge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGAke2dsLmdldFNoYWRlckluZm9Mb2codmVydGV4U2hhZGVyKX1cXG5WZXJ0ZXggU2hhZGVyXFxuJHthZGRMaW5lTnVtYmVycyh2ZXJ0ZXgpfWApO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gY29tcGlsZSBmcmFnbWVudCBzaGFkZXIgYW5kIGxvZyBlcnJvcnNcbiAgICAgICAgY29uc3QgZnJhZ21lbnRTaGFkZXIgPSBnbC5jcmVhdGVTaGFkZXIoZ2wuRlJBR01FTlRfU0hBREVSKTtcbiAgICAgICAgZ2wuc2hhZGVyU291cmNlKGZyYWdtZW50U2hhZGVyLCBmcmFnbWVudCk7XG4gICAgICAgIGdsLmNvbXBpbGVTaGFkZXIoZnJhZ21lbnRTaGFkZXIpO1xuICAgICAgICBpZiAoZ2wuZ2V0U2hhZGVySW5mb0xvZyhmcmFnbWVudFNoYWRlcikgIT09ICcnKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYCR7Z2wuZ2V0U2hhZGVySW5mb0xvZyhmcmFnbWVudFNoYWRlcil9XFxuRnJhZ21lbnQgU2hhZGVyXFxuJHthZGRMaW5lTnVtYmVycyhmcmFnbWVudCl9YCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBjb21waWxlIHByb2dyYW0gYW5kIGxvZyBlcnJvcnNcbiAgICAgICAgdGhpcy5wcm9ncmFtID0gZ2wuY3JlYXRlUHJvZ3JhbSgpO1xuICAgICAgICBnbC5hdHRhY2hTaGFkZXIodGhpcy5wcm9ncmFtLCB2ZXJ0ZXhTaGFkZXIpO1xuICAgICAgICBnbC5hdHRhY2hTaGFkZXIodGhpcy5wcm9ncmFtLCBmcmFnbWVudFNoYWRlcik7XG4gICAgICAgIGdsLmxpbmtQcm9ncmFtKHRoaXMucHJvZ3JhbSk7XG4gICAgICAgIGlmICghZ2wuZ2V0UHJvZ3JhbVBhcmFtZXRlcih0aGlzLnByb2dyYW0sIGdsLkxJTktfU1RBVFVTKSkge1xuICAgICAgICAgICAgcmV0dXJuIGNvbnNvbGUud2FybihnbC5nZXRQcm9ncmFtSW5mb0xvZyh0aGlzLnByb2dyYW0pKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFJlbW92ZSBzaGFkZXIgb25jZSBsaW5rZWRcbiAgICAgICAgZ2wuZGVsZXRlU2hhZGVyKHZlcnRleFNoYWRlcik7XG4gICAgICAgIGdsLmRlbGV0ZVNoYWRlcihmcmFnbWVudFNoYWRlcik7XG5cbiAgICAgICAgLy8gR2V0IGFjdGl2ZSB1bmlmb3JtIGxvY2F0aW9uc1xuICAgICAgICBsZXQgbnVtVW5pZm9ybXMgPSBnbC5nZXRQcm9ncmFtUGFyYW1ldGVyKHRoaXMucHJvZ3JhbSwgZ2wuQUNUSVZFX1VOSUZPUk1TKTtcbiAgICAgICAgZm9yIChsZXQgdUluZGV4ID0gMDsgdUluZGV4IDwgbnVtVW5pZm9ybXM7IHVJbmRleCsrKSB7XG4gICAgICAgICAgICBsZXQgdW5pZm9ybSA9IGdsLmdldEFjdGl2ZVVuaWZvcm0odGhpcy5wcm9ncmFtLCB1SW5kZXgpO1xuICAgICAgICAgICAgdGhpcy51bmlmb3JtTG9jYXRpb25zLnNldCh1bmlmb3JtLCBnbC5nZXRVbmlmb3JtTG9jYXRpb24odGhpcy5wcm9ncmFtLCB1bmlmb3JtLm5hbWUpKTtcblxuICAgICAgICAgICAgLy8gc3BsaXQgdW5pZm9ybXMnIG5hbWVzIHRvIHNlcGFyYXRlIGFycmF5IGFuZCBzdHJ1Y3QgZGVjbGFyYXRpb25zXG4gICAgICAgICAgICBjb25zdCBzcGxpdCA9IHVuaWZvcm0ubmFtZS5tYXRjaCgvKFxcdyspL2cpO1xuXG4gICAgICAgICAgICB1bmlmb3JtLnVuaWZvcm1OYW1lID0gc3BsaXRbMF07XG5cbiAgICAgICAgICAgIGlmIChzcGxpdC5sZW5ndGggPT09IDMpIHtcbiAgICAgICAgICAgICAgICB1bmlmb3JtLmlzU3RydWN0QXJyYXkgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHVuaWZvcm0uc3RydWN0SW5kZXggPSBOdW1iZXIoc3BsaXRbMV0pO1xuICAgICAgICAgICAgICAgIHVuaWZvcm0uc3RydWN0UHJvcGVydHkgPSBzcGxpdFsyXTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoc3BsaXQubGVuZ3RoID09PSAyICYmIGlzTmFOKE51bWJlcihzcGxpdFsxXSkpKSB7XG4gICAgICAgICAgICAgICAgdW5pZm9ybS5pc1N0cnVjdCA9IHRydWU7XG4gICAgICAgICAgICAgICAgdW5pZm9ybS5zdHJ1Y3RQcm9wZXJ0eSA9IHNwbGl0WzFdO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gR2V0IGFjdGl2ZSBhdHRyaWJ1dGUgbG9jYXRpb25zXG4gICAgICAgIGNvbnN0IGxvY2F0aW9ucyA9IFtdO1xuICAgICAgICBjb25zdCBudW1BdHRyaWJzID0gZ2wuZ2V0UHJvZ3JhbVBhcmFtZXRlcih0aGlzLnByb2dyYW0sIGdsLkFDVElWRV9BVFRSSUJVVEVTKTtcbiAgICAgICAgZm9yIChsZXQgYUluZGV4ID0gMDsgYUluZGV4IDwgbnVtQXR0cmliczsgYUluZGV4KyspIHtcbiAgICAgICAgICAgIGNvbnN0IGF0dHJpYnV0ZSA9IGdsLmdldEFjdGl2ZUF0dHJpYih0aGlzLnByb2dyYW0sIGFJbmRleCk7XG4gICAgICAgICAgICBjb25zdCBsb2NhdGlvbiA9IGdsLmdldEF0dHJpYkxvY2F0aW9uKHRoaXMucHJvZ3JhbSwgYXR0cmlidXRlLm5hbWUpO1xuICAgICAgICAgICAgbG9jYXRpb25zW2xvY2F0aW9uXSA9IGF0dHJpYnV0ZS5uYW1lO1xuICAgICAgICAgICAgdGhpcy5hdHRyaWJ1dGVMb2NhdGlvbnMuc2V0KGF0dHJpYnV0ZSwgbG9jYXRpb24pO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuYXR0cmlidXRlT3JkZXIgPSBsb2NhdGlvbnMuam9pbignJyk7XG4gICAgfVxuXG4gICAgc2V0QmxlbmRGdW5jKHNyYywgZHN0LCBzcmNBbHBoYSwgZHN0QWxwaGEpIHtcbiAgICAgICAgdGhpcy5ibGVuZEZ1bmMuc3JjID0gc3JjO1xuICAgICAgICB0aGlzLmJsZW5kRnVuYy5kc3QgPSBkc3Q7XG4gICAgICAgIHRoaXMuYmxlbmRGdW5jLnNyY0FscGhhID0gc3JjQWxwaGE7XG4gICAgICAgIHRoaXMuYmxlbmRGdW5jLmRzdEFscGhhID0gZHN0QWxwaGE7XG4gICAgICAgIGlmIChzcmMpIHRoaXMudHJhbnNwYXJlbnQgPSB0cnVlO1xuICAgIH1cblxuICAgIHNldEJsZW5kRXF1YXRpb24obW9kZVJHQiwgbW9kZUFscGhhKSB7XG4gICAgICAgIHRoaXMuYmxlbmRFcXVhdGlvbi5tb2RlUkdCID0gbW9kZVJHQjtcbiAgICAgICAgdGhpcy5ibGVuZEVxdWF0aW9uLm1vZGVBbHBoYSA9IG1vZGVBbHBoYTtcbiAgICB9XG5cbiAgICBhcHBseVN0YXRlKCkge1xuICAgICAgICBpZiAodGhpcy5kZXB0aFRlc3QpIHRoaXMuZ2wucmVuZGVyZXIuZW5hYmxlKHRoaXMuZ2wuREVQVEhfVEVTVCk7XG4gICAgICAgIGVsc2UgdGhpcy5nbC5yZW5kZXJlci5kaXNhYmxlKHRoaXMuZ2wuREVQVEhfVEVTVCk7XG5cbiAgICAgICAgaWYgKHRoaXMuY3VsbEZhY2UpIHRoaXMuZ2wucmVuZGVyZXIuZW5hYmxlKHRoaXMuZ2wuQ1VMTF9GQUNFKTtcbiAgICAgICAgZWxzZSB0aGlzLmdsLnJlbmRlcmVyLmRpc2FibGUodGhpcy5nbC5DVUxMX0ZBQ0UpO1xuXG4gICAgICAgIGlmICh0aGlzLmJsZW5kRnVuYy5zcmMpIHRoaXMuZ2wucmVuZGVyZXIuZW5hYmxlKHRoaXMuZ2wuQkxFTkQpO1xuICAgICAgICBlbHNlIHRoaXMuZ2wucmVuZGVyZXIuZGlzYWJsZSh0aGlzLmdsLkJMRU5EKTtcblxuICAgICAgICBpZiAodGhpcy5jdWxsRmFjZSkgdGhpcy5nbC5yZW5kZXJlci5zZXRDdWxsRmFjZSh0aGlzLmN1bGxGYWNlKTtcbiAgICAgICAgdGhpcy5nbC5yZW5kZXJlci5zZXRGcm9udEZhY2UodGhpcy5mcm9udEZhY2UpO1xuICAgICAgICB0aGlzLmdsLnJlbmRlcmVyLnNldERlcHRoTWFzayh0aGlzLmRlcHRoV3JpdGUpO1xuICAgICAgICB0aGlzLmdsLnJlbmRlcmVyLnNldERlcHRoRnVuYyh0aGlzLmRlcHRoRnVuYyk7XG4gICAgICAgIGlmICh0aGlzLmJsZW5kRnVuYy5zcmMpXG4gICAgICAgICAgICB0aGlzLmdsLnJlbmRlcmVyLnNldEJsZW5kRnVuYyh0aGlzLmJsZW5kRnVuYy5zcmMsIHRoaXMuYmxlbmRGdW5jLmRzdCwgdGhpcy5ibGVuZEZ1bmMuc3JjQWxwaGEsIHRoaXMuYmxlbmRGdW5jLmRzdEFscGhhKTtcbiAgICAgICAgdGhpcy5nbC5yZW5kZXJlci5zZXRCbGVuZEVxdWF0aW9uKHRoaXMuYmxlbmRFcXVhdGlvbi5tb2RlUkdCLCB0aGlzLmJsZW5kRXF1YXRpb24ubW9kZUFscGhhKTtcbiAgICB9XG5cbiAgICB1c2UoeyBmbGlwRmFjZXMgPSBmYWxzZSB9ID0ge30pIHtcbiAgICAgICAgbGV0IHRleHR1cmVVbml0ID0gLTE7XG4gICAgICAgIGNvbnN0IHByb2dyYW1BY3RpdmUgPSB0aGlzLmdsLnJlbmRlcmVyLmN1cnJlbnRQcm9ncmFtID09PSB0aGlzLmlkO1xuXG4gICAgICAgIC8vIEF2b2lkIGdsIGNhbGwgaWYgcHJvZ3JhbSBhbHJlYWR5IGluIHVzZVxuICAgICAgICBpZiAoIXByb2dyYW1BY3RpdmUpIHtcbiAgICAgICAgICAgIHRoaXMuZ2wudXNlUHJvZ3JhbSh0aGlzLnByb2dyYW0pO1xuICAgICAgICAgICAgdGhpcy5nbC5yZW5kZXJlci5jdXJyZW50UHJvZ3JhbSA9IHRoaXMuaWQ7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBTZXQgb25seSB0aGUgYWN0aXZlIHVuaWZvcm1zIGZvdW5kIGluIHRoZSBzaGFkZXJcbiAgICAgICAgdGhpcy51bmlmb3JtTG9jYXRpb25zLmZvckVhY2goKGxvY2F0aW9uLCBhY3RpdmVVbmlmb3JtKSA9PiB7XG4gICAgICAgICAgICBsZXQgbmFtZSA9IGFjdGl2ZVVuaWZvcm0udW5pZm9ybU5hbWU7XG5cbiAgICAgICAgICAgIC8vIGdldCBzdXBwbGllZCB1bmlmb3JtXG4gICAgICAgICAgICBsZXQgdW5pZm9ybSA9IHRoaXMudW5pZm9ybXNbbmFtZV07XG5cbiAgICAgICAgICAgIC8vIEZvciBzdHJ1Y3RzLCBnZXQgdGhlIHNwZWNpZmljIHByb3BlcnR5IGluc3RlYWQgb2YgdGhlIGVudGlyZSBvYmplY3RcbiAgICAgICAgICAgIGlmIChhY3RpdmVVbmlmb3JtLmlzU3RydWN0KSB7XG4gICAgICAgICAgICAgICAgdW5pZm9ybSA9IHVuaWZvcm1bYWN0aXZlVW5pZm9ybS5zdHJ1Y3RQcm9wZXJ0eV07XG4gICAgICAgICAgICAgICAgbmFtZSArPSBgLiR7YWN0aXZlVW5pZm9ybS5zdHJ1Y3RQcm9wZXJ0eX1gO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGFjdGl2ZVVuaWZvcm0uaXNTdHJ1Y3RBcnJheSkge1xuICAgICAgICAgICAgICAgIHVuaWZvcm0gPSB1bmlmb3JtW2FjdGl2ZVVuaWZvcm0uc3RydWN0SW5kZXhdW2FjdGl2ZVVuaWZvcm0uc3RydWN0UHJvcGVydHldO1xuICAgICAgICAgICAgICAgIG5hbWUgKz0gYFske2FjdGl2ZVVuaWZvcm0uc3RydWN0SW5kZXh9XS4ke2FjdGl2ZVVuaWZvcm0uc3RydWN0UHJvcGVydHl9YDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCF1bmlmb3JtKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHdhcm4oYEFjdGl2ZSB1bmlmb3JtICR7bmFtZX0gaGFzIG5vdCBiZWVuIHN1cHBsaWVkYCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh1bmlmb3JtICYmIHVuaWZvcm0udmFsdWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB3YXJuKGAke25hbWV9IHVuaWZvcm0gaXMgbWlzc2luZyBhIHZhbHVlIHBhcmFtZXRlcmApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodW5pZm9ybS52YWx1ZS50ZXh0dXJlKSB7XG4gICAgICAgICAgICAgICAgdGV4dHVyZVVuaXQgPSB0ZXh0dXJlVW5pdCArIDE7XG5cbiAgICAgICAgICAgICAgICAvLyBDaGVjayBpZiB0ZXh0dXJlIG5lZWRzIHRvIGJlIHVwZGF0ZWRcbiAgICAgICAgICAgICAgICB1bmlmb3JtLnZhbHVlLnVwZGF0ZSh0ZXh0dXJlVW5pdCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHNldFVuaWZvcm0odGhpcy5nbCwgYWN0aXZlVW5pZm9ybS50eXBlLCBsb2NhdGlvbiwgdGV4dHVyZVVuaXQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBGb3IgdGV4dHVyZSBhcnJheXMsIHNldCB1bmlmb3JtIGFzIGFuIGFycmF5IG9mIHRleHR1cmUgdW5pdHMgaW5zdGVhZCBvZiBqdXN0IG9uZVxuICAgICAgICAgICAgaWYgKHVuaWZvcm0udmFsdWUubGVuZ3RoICYmIHVuaWZvcm0udmFsdWVbMF0udGV4dHVyZSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHRleHR1cmVVbml0cyA9IFtdO1xuICAgICAgICAgICAgICAgIHVuaWZvcm0udmFsdWUuZm9yRWFjaCgodmFsdWUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGV4dHVyZVVuaXQgPSB0ZXh0dXJlVW5pdCArIDE7XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlLnVwZGF0ZSh0ZXh0dXJlVW5pdCk7XG4gICAgICAgICAgICAgICAgICAgIHRleHR1cmVVbml0cy5wdXNoKHRleHR1cmVVbml0KTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIHJldHVybiBzZXRVbmlmb3JtKHRoaXMuZ2wsIGFjdGl2ZVVuaWZvcm0udHlwZSwgbG9jYXRpb24sIHRleHR1cmVVbml0cyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHNldFVuaWZvcm0odGhpcy5nbCwgYWN0aXZlVW5pZm9ybS50eXBlLCBsb2NhdGlvbiwgdW5pZm9ybS52YWx1ZSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuYXBwbHlTdGF0ZSgpO1xuICAgICAgICBpZiAoZmxpcEZhY2VzKSB0aGlzLmdsLnJlbmRlcmVyLnNldEZyb250RmFjZSh0aGlzLmZyb250RmFjZSA9PT0gdGhpcy5nbC5DQ1cgPyB0aGlzLmdsLkNXIDogdGhpcy5nbC5DQ1cpO1xuICAgIH1cblxuICAgIHJlbW92ZSgpIHtcbiAgICAgICAgdGhpcy5nbC5kZWxldGVQcm9ncmFtKHRoaXMucHJvZ3JhbSk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBzZXRVbmlmb3JtKGdsLCB0eXBlLCBsb2NhdGlvbiwgdmFsdWUpIHtcbiAgICB2YWx1ZSA9IHZhbHVlLmxlbmd0aCA/IGZsYXR0ZW4odmFsdWUpIDogdmFsdWU7XG4gICAgY29uc3Qgc2V0VmFsdWUgPSBnbC5yZW5kZXJlci5zdGF0ZS51bmlmb3JtTG9jYXRpb25zLmdldChsb2NhdGlvbik7XG5cbiAgICAvLyBBdm9pZCByZWR1bmRhbnQgdW5pZm9ybSBjb21tYW5kc1xuICAgIGlmICh2YWx1ZS5sZW5ndGgpIHtcbiAgICAgICAgaWYgKHNldFZhbHVlID09PSB1bmRlZmluZWQgfHwgc2V0VmFsdWUubGVuZ3RoICE9PSB2YWx1ZS5sZW5ndGgpIHtcbiAgICAgICAgICAgIC8vIGNsb25lIGFycmF5IHRvIHN0b3JlIGFzIGNhY2hlXG4gICAgICAgICAgICBnbC5yZW5kZXJlci5zdGF0ZS51bmlmb3JtTG9jYXRpb25zLnNldChsb2NhdGlvbiwgdmFsdWUuc2xpY2UoMCkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKGFycmF5c0VxdWFsKHNldFZhbHVlLCB2YWx1ZSkpIHJldHVybjtcblxuICAgICAgICAgICAgLy8gVXBkYXRlIGNhY2hlZCBhcnJheSB2YWx1ZXNcbiAgICAgICAgICAgIHNldFZhbHVlLnNldCA/IHNldFZhbHVlLnNldCh2YWx1ZSkgOiBzZXRBcnJheShzZXRWYWx1ZSwgdmFsdWUpO1xuICAgICAgICAgICAgZ2wucmVuZGVyZXIuc3RhdGUudW5pZm9ybUxvY2F0aW9ucy5zZXQobG9jYXRpb24sIHNldFZhbHVlKTtcbiAgICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChzZXRWYWx1ZSA9PT0gdmFsdWUpIHJldHVybjtcbiAgICAgICAgZ2wucmVuZGVyZXIuc3RhdGUudW5pZm9ybUxvY2F0aW9ucy5zZXQobG9jYXRpb24sIHZhbHVlKTtcbiAgICB9XG5cbiAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgICAgY2FzZSA1MTI2OlxuICAgICAgICAgICAgcmV0dXJuIHZhbHVlLmxlbmd0aCA/IGdsLnVuaWZvcm0xZnYobG9jYXRpb24sIHZhbHVlKSA6IGdsLnVuaWZvcm0xZihsb2NhdGlvbiwgdmFsdWUpOyAvLyBGTE9BVFxuICAgICAgICBjYXNlIDM1NjY0OlxuICAgICAgICAgICAgcmV0dXJuIGdsLnVuaWZvcm0yZnYobG9jYXRpb24sIHZhbHVlKTsgLy8gRkxPQVRfVkVDMlxuICAgICAgICBjYXNlIDM1NjY1OlxuICAgICAgICAgICAgcmV0dXJuIGdsLnVuaWZvcm0zZnYobG9jYXRpb24sIHZhbHVlKTsgLy8gRkxPQVRfVkVDM1xuICAgICAgICBjYXNlIDM1NjY2OlxuICAgICAgICAgICAgcmV0dXJuIGdsLnVuaWZvcm00ZnYobG9jYXRpb24sIHZhbHVlKTsgLy8gRkxPQVRfVkVDNFxuICAgICAgICBjYXNlIDM1NjcwOiAvLyBCT09MXG4gICAgICAgIGNhc2UgNTEyNDogLy8gSU5UXG4gICAgICAgIGNhc2UgMzU2Nzg6IC8vIFNBTVBMRVJfMkRcbiAgICAgICAgY2FzZSAzNTY4MDpcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZS5sZW5ndGggPyBnbC51bmlmb3JtMWl2KGxvY2F0aW9uLCB2YWx1ZSkgOiBnbC51bmlmb3JtMWkobG9jYXRpb24sIHZhbHVlKTsgLy8gU0FNUExFUl9DVUJFXG4gICAgICAgIGNhc2UgMzU2NzE6IC8vIEJPT0xfVkVDMlxuICAgICAgICBjYXNlIDM1NjY3OlxuICAgICAgICAgICAgcmV0dXJuIGdsLnVuaWZvcm0yaXYobG9jYXRpb24sIHZhbHVlKTsgLy8gSU5UX1ZFQzJcbiAgICAgICAgY2FzZSAzNTY3MjogLy8gQk9PTF9WRUMzXG4gICAgICAgIGNhc2UgMzU2Njg6XG4gICAgICAgICAgICByZXR1cm4gZ2wudW5pZm9ybTNpdihsb2NhdGlvbiwgdmFsdWUpOyAvLyBJTlRfVkVDM1xuICAgICAgICBjYXNlIDM1NjczOiAvLyBCT09MX1ZFQzRcbiAgICAgICAgY2FzZSAzNTY2OTpcbiAgICAgICAgICAgIHJldHVybiBnbC51bmlmb3JtNGl2KGxvY2F0aW9uLCB2YWx1ZSk7IC8vIElOVF9WRUM0XG4gICAgICAgIGNhc2UgMzU2NzQ6XG4gICAgICAgICAgICByZXR1cm4gZ2wudW5pZm9ybU1hdHJpeDJmdihsb2NhdGlvbiwgZmFsc2UsIHZhbHVlKTsgLy8gRkxPQVRfTUFUMlxuICAgICAgICBjYXNlIDM1Njc1OlxuICAgICAgICAgICAgcmV0dXJuIGdsLnVuaWZvcm1NYXRyaXgzZnYobG9jYXRpb24sIGZhbHNlLCB2YWx1ZSk7IC8vIEZMT0FUX01BVDNcbiAgICAgICAgY2FzZSAzNTY3NjpcbiAgICAgICAgICAgIHJldHVybiBnbC51bmlmb3JtTWF0cml4NGZ2KGxvY2F0aW9uLCBmYWxzZSwgdmFsdWUpOyAvLyBGTE9BVF9NQVQ0XG4gICAgfVxufVxuXG5mdW5jdGlvbiBhZGRMaW5lTnVtYmVycyhzdHJpbmcpIHtcbiAgICBsZXQgbGluZXMgPSBzdHJpbmcuc3BsaXQoJ1xcbicpO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGluZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgbGluZXNbaV0gPSBpICsgMSArICc6ICcgKyBsaW5lc1tpXTtcbiAgICB9XG4gICAgcmV0dXJuIGxpbmVzLmpvaW4oJ1xcbicpO1xufVxuXG5mdW5jdGlvbiBmbGF0dGVuKGEpIHtcbiAgICBjb25zdCBhcnJheUxlbiA9IGEubGVuZ3RoO1xuICAgIGNvbnN0IHZhbHVlTGVuID0gYVswXS5sZW5ndGg7XG4gICAgaWYgKHZhbHVlTGVuID09PSB1bmRlZmluZWQpIHJldHVybiBhO1xuICAgIGNvbnN0IGxlbmd0aCA9IGFycmF5TGVuICogdmFsdWVMZW47XG4gICAgbGV0IHZhbHVlID0gYXJyYXlDYWNoZUYzMltsZW5ndGhdO1xuICAgIGlmICghdmFsdWUpIGFycmF5Q2FjaGVGMzJbbGVuZ3RoXSA9IHZhbHVlID0gbmV3IEZsb2F0MzJBcnJheShsZW5ndGgpO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYXJyYXlMZW47IGkrKykgdmFsdWUuc2V0KGFbaV0sIGkgKiB2YWx1ZUxlbik7XG4gICAgcmV0dXJuIHZhbHVlO1xufVxuXG5mdW5jdGlvbiBhcnJheXNFcXVhbChhLCBiKSB7XG4gICAgaWYgKGEubGVuZ3RoICE9PSBiLmxlbmd0aCkgcmV0dXJuIGZhbHNlO1xuICAgIGZvciAobGV0IGkgPSAwLCBsID0gYS5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgaWYgKGFbaV0gIT09IGJbaV0pIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG59XG5cbmZ1bmN0aW9uIHNldEFycmF5KGEsIGIpIHtcbiAgICBmb3IgKGxldCBpID0gMCwgbCA9IGEubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIGFbaV0gPSBiW2ldO1xuICAgIH1cbn1cblxubGV0IHdhcm5Db3VudCA9IDA7XG5mdW5jdGlvbiB3YXJuKG1lc3NhZ2UpIHtcbiAgICBpZiAod2FybkNvdW50ID4gMTAwKSByZXR1cm47XG4gICAgY29uc29sZS53YXJuKG1lc3NhZ2UpO1xuICAgIHdhcm5Db3VudCsrO1xuICAgIGlmICh3YXJuQ291bnQgPiAxMDApIGNvbnNvbGUud2FybignTW9yZSB0aGFuIDEwMCBwcm9ncmFtIHdhcm5pbmdzIC0gc3RvcHBpbmcgbG9ncy4nKTtcbn1cbiIsIi8vIFRPRE86IG11bHRpIHRhcmdldCByZW5kZXJpbmdcbi8vIFRPRE86IHRlc3Qgc3RlbmNpbCBhbmQgZGVwdGhcbi8vIFRPRE86IGRlc3Ryb3lcbi8vIFRPRE86IGJsaXQgb24gcmVzaXplP1xuaW1wb3J0IHsgVGV4dHVyZSB9IGZyb20gJy4vVGV4dHVyZS5qcyc7XG5cbmV4cG9ydCBjbGFzcyBSZW5kZXJUYXJnZXQge1xuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICBnbCxcbiAgICAgICAge1xuICAgICAgICAgICAgd2lkdGggPSBnbC5jYW52YXMud2lkdGgsXG4gICAgICAgICAgICBoZWlnaHQgPSBnbC5jYW52YXMuaGVpZ2h0LFxuICAgICAgICAgICAgdGFyZ2V0ID0gZ2wuRlJBTUVCVUZGRVIsXG4gICAgICAgICAgICBjb2xvciA9IDEsIC8vIG51bWJlciBvZiBjb2xvciBhdHRhY2htZW50c1xuICAgICAgICAgICAgZGVwdGggPSB0cnVlLFxuICAgICAgICAgICAgc3RlbmNpbCA9IGZhbHNlLFxuICAgICAgICAgICAgZGVwdGhUZXh0dXJlID0gZmFsc2UsIC8vIG5vdGUgLSBzdGVuY2lsIGJyZWFrc1xuICAgICAgICAgICAgd3JhcFMgPSBnbC5DTEFNUF9UT19FREdFLFxuICAgICAgICAgICAgd3JhcFQgPSBnbC5DTEFNUF9UT19FREdFLFxuICAgICAgICAgICAgbWluRmlsdGVyID0gZ2wuTElORUFSLFxuICAgICAgICAgICAgbWFnRmlsdGVyID0gbWluRmlsdGVyLFxuICAgICAgICAgICAgdHlwZSA9IGdsLlVOU0lHTkVEX0JZVEUsXG4gICAgICAgICAgICBmb3JtYXQgPSBnbC5SR0JBLFxuICAgICAgICAgICAgaW50ZXJuYWxGb3JtYXQgPSBmb3JtYXQsXG4gICAgICAgICAgICB1bnBhY2tBbGlnbm1lbnQsXG4gICAgICAgICAgICBwcmVtdWx0aXBseUFscGhhLFxuICAgICAgICB9ID0ge31cbiAgICApIHtcbiAgICAgICAgdGhpcy5nbCA9IGdsO1xuICAgICAgICB0aGlzLndpZHRoID0gd2lkdGg7XG4gICAgICAgIHRoaXMuaGVpZ2h0ID0gaGVpZ2h0O1xuICAgICAgICB0aGlzLmRlcHRoID0gZGVwdGg7XG4gICAgICAgIHRoaXMuYnVmZmVyID0gdGhpcy5nbC5jcmVhdGVGcmFtZWJ1ZmZlcigpO1xuICAgICAgICB0aGlzLnRhcmdldCA9IHRhcmdldDtcbiAgICAgICAgdGhpcy5nbC5iaW5kRnJhbWVidWZmZXIodGhpcy50YXJnZXQsIHRoaXMuYnVmZmVyKTtcblxuICAgICAgICB0aGlzLnRleHR1cmVzID0gW107XG4gICAgICAgIGNvbnN0IGRyYXdCdWZmZXJzID0gW107XG5cbiAgICAgICAgLy8gY3JlYXRlIGFuZCBhdHRhY2ggcmVxdWlyZWQgbnVtIG9mIGNvbG9yIHRleHR1cmVzXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY29sb3I7IGkrKykge1xuICAgICAgICAgICAgdGhpcy50ZXh0dXJlcy5wdXNoKFxuICAgICAgICAgICAgICAgIG5ldyBUZXh0dXJlKGdsLCB7XG4gICAgICAgICAgICAgICAgICAgIHdpZHRoLFxuICAgICAgICAgICAgICAgICAgICBoZWlnaHQsXG4gICAgICAgICAgICAgICAgICAgIHdyYXBTLFxuICAgICAgICAgICAgICAgICAgICB3cmFwVCxcbiAgICAgICAgICAgICAgICAgICAgbWluRmlsdGVyLFxuICAgICAgICAgICAgICAgICAgICBtYWdGaWx0ZXIsXG4gICAgICAgICAgICAgICAgICAgIHR5cGUsXG4gICAgICAgICAgICAgICAgICAgIGZvcm1hdCxcbiAgICAgICAgICAgICAgICAgICAgaW50ZXJuYWxGb3JtYXQsXG4gICAgICAgICAgICAgICAgICAgIHVucGFja0FsaWdubWVudCxcbiAgICAgICAgICAgICAgICAgICAgcHJlbXVsdGlwbHlBbHBoYSxcbiAgICAgICAgICAgICAgICAgICAgZmxpcFk6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBnZW5lcmF0ZU1pcG1hcHM6IGZhbHNlLFxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgdGhpcy50ZXh0dXJlc1tpXS51cGRhdGUoKTtcbiAgICAgICAgICAgIHRoaXMuZ2wuZnJhbWVidWZmZXJUZXh0dXJlMkQodGhpcy50YXJnZXQsIHRoaXMuZ2wuQ09MT1JfQVRUQUNITUVOVDAgKyBpLCB0aGlzLmdsLlRFWFRVUkVfMkQsIHRoaXMudGV4dHVyZXNbaV0udGV4dHVyZSwgMCAvKiBsZXZlbCAqLyk7XG4gICAgICAgICAgICBkcmF3QnVmZmVycy5wdXNoKHRoaXMuZ2wuQ09MT1JfQVRUQUNITUVOVDAgKyBpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEZvciBtdWx0aS1yZW5kZXIgdGFyZ2V0cyBzaGFkZXIgYWNjZXNzXG4gICAgICAgIGlmIChkcmF3QnVmZmVycy5sZW5ndGggPiAxKSB0aGlzLmdsLnJlbmRlcmVyLmRyYXdCdWZmZXJzKGRyYXdCdWZmZXJzKTtcblxuICAgICAgICAvLyBhbGlhcyBmb3IgbWFqb3JpdHkgb2YgdXNlIGNhc2VzXG4gICAgICAgIHRoaXMudGV4dHVyZSA9IHRoaXMudGV4dHVyZXNbMF07XG5cbiAgICAgICAgLy8gbm90ZSBkZXB0aCB0ZXh0dXJlcyBicmVhayBzdGVuY2lsIC0gc28gY2FuJ3QgdXNlIHRvZ2V0aGVyXG4gICAgICAgIGlmIChkZXB0aFRleHR1cmUgJiYgKHRoaXMuZ2wucmVuZGVyZXIuaXNXZWJnbDIgfHwgdGhpcy5nbC5yZW5kZXJlci5nZXRFeHRlbnNpb24oJ1dFQkdMX2RlcHRoX3RleHR1cmUnKSkpIHtcbiAgICAgICAgICAgIHRoaXMuZGVwdGhUZXh0dXJlID0gbmV3IFRleHR1cmUoZ2wsIHtcbiAgICAgICAgICAgICAgICB3aWR0aCxcbiAgICAgICAgICAgICAgICBoZWlnaHQsXG4gICAgICAgICAgICAgICAgbWluRmlsdGVyOiB0aGlzLmdsLk5FQVJFU1QsXG4gICAgICAgICAgICAgICAgbWFnRmlsdGVyOiB0aGlzLmdsLk5FQVJFU1QsXG4gICAgICAgICAgICAgICAgZm9ybWF0OiB0aGlzLmdsLkRFUFRIX0NPTVBPTkVOVCxcbiAgICAgICAgICAgICAgICBpbnRlcm5hbEZvcm1hdDogZ2wucmVuZGVyZXIuaXNXZWJnbDIgPyB0aGlzLmdsLkRFUFRIX0NPTVBPTkVOVDE2IDogdGhpcy5nbC5ERVBUSF9DT01QT05FTlQsXG4gICAgICAgICAgICAgICAgdHlwZTogdGhpcy5nbC5VTlNJR05FRF9JTlQsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMuZGVwdGhUZXh0dXJlLnVwZGF0ZSgpO1xuICAgICAgICAgICAgdGhpcy5nbC5mcmFtZWJ1ZmZlclRleHR1cmUyRCh0aGlzLnRhcmdldCwgdGhpcy5nbC5ERVBUSF9BVFRBQ0hNRU5ULCB0aGlzLmdsLlRFWFRVUkVfMkQsIHRoaXMuZGVwdGhUZXh0dXJlLnRleHR1cmUsIDAgLyogbGV2ZWwgKi8pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gUmVuZGVyIGJ1ZmZlcnNcbiAgICAgICAgICAgIGlmIChkZXB0aCAmJiAhc3RlbmNpbCkge1xuICAgICAgICAgICAgICAgIHRoaXMuZGVwdGhCdWZmZXIgPSB0aGlzLmdsLmNyZWF0ZVJlbmRlcmJ1ZmZlcigpO1xuICAgICAgICAgICAgICAgIHRoaXMuZ2wuYmluZFJlbmRlcmJ1ZmZlcih0aGlzLmdsLlJFTkRFUkJVRkZFUiwgdGhpcy5kZXB0aEJ1ZmZlcik7XG4gICAgICAgICAgICAgICAgdGhpcy5nbC5yZW5kZXJidWZmZXJTdG9yYWdlKHRoaXMuZ2wuUkVOREVSQlVGRkVSLCB0aGlzLmdsLkRFUFRIX0NPTVBPTkVOVDE2LCB3aWR0aCwgaGVpZ2h0KTtcbiAgICAgICAgICAgICAgICB0aGlzLmdsLmZyYW1lYnVmZmVyUmVuZGVyYnVmZmVyKHRoaXMudGFyZ2V0LCB0aGlzLmdsLkRFUFRIX0FUVEFDSE1FTlQsIHRoaXMuZ2wuUkVOREVSQlVGRkVSLCB0aGlzLmRlcHRoQnVmZmVyKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHN0ZW5jaWwgJiYgIWRlcHRoKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zdGVuY2lsQnVmZmVyID0gdGhpcy5nbC5jcmVhdGVSZW5kZXJidWZmZXIoKTtcbiAgICAgICAgICAgICAgICB0aGlzLmdsLmJpbmRSZW5kZXJidWZmZXIodGhpcy5nbC5SRU5ERVJCVUZGRVIsIHRoaXMuc3RlbmNpbEJ1ZmZlcik7XG4gICAgICAgICAgICAgICAgdGhpcy5nbC5yZW5kZXJidWZmZXJTdG9yYWdlKHRoaXMuZ2wuUkVOREVSQlVGRkVSLCB0aGlzLmdsLlNURU5DSUxfSU5ERVg4LCB3aWR0aCwgaGVpZ2h0KTtcbiAgICAgICAgICAgICAgICB0aGlzLmdsLmZyYW1lYnVmZmVyUmVuZGVyYnVmZmVyKHRoaXMudGFyZ2V0LCB0aGlzLmdsLlNURU5DSUxfQVRUQUNITUVOVCwgdGhpcy5nbC5SRU5ERVJCVUZGRVIsIHRoaXMuc3RlbmNpbEJ1ZmZlcik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChkZXB0aCAmJiBzdGVuY2lsKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kZXB0aFN0ZW5jaWxCdWZmZXIgPSB0aGlzLmdsLmNyZWF0ZVJlbmRlcmJ1ZmZlcigpO1xuICAgICAgICAgICAgICAgIHRoaXMuZ2wuYmluZFJlbmRlcmJ1ZmZlcih0aGlzLmdsLlJFTkRFUkJVRkZFUiwgdGhpcy5kZXB0aFN0ZW5jaWxCdWZmZXIpO1xuICAgICAgICAgICAgICAgIHRoaXMuZ2wucmVuZGVyYnVmZmVyU3RvcmFnZSh0aGlzLmdsLlJFTkRFUkJVRkZFUiwgdGhpcy5nbC5ERVBUSF9TVEVOQ0lMLCB3aWR0aCwgaGVpZ2h0KTtcbiAgICAgICAgICAgICAgICB0aGlzLmdsLmZyYW1lYnVmZmVyUmVuZGVyYnVmZmVyKHRoaXMudGFyZ2V0LCB0aGlzLmdsLkRFUFRIX1NURU5DSUxfQVRUQUNITUVOVCwgdGhpcy5nbC5SRU5ERVJCVUZGRVIsIHRoaXMuZGVwdGhTdGVuY2lsQnVmZmVyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuZ2wuYmluZEZyYW1lYnVmZmVyKHRoaXMudGFyZ2V0LCBudWxsKTtcbiAgICB9XG5cbiAgICBkaXNwb3NlKCkge1xuICAgICAgICB0aGlzLnRleHR1cmVzLmZvckVhY2goICh0ZXh0dXJlKSA9PiB7XG4gICAgICAgICAgICB0ZXh0dXJlLmRpc3Bvc2UoKTtcbiAgICAgICAgfSlcbiAgICAgICAgdGhpcy5kZXB0aFRleHR1cmUgJiYgdGhpcy5kZXB0aFRleHR1cmUuZGlzcG9zZSgpO1xuICAgICAgICB0aGlzLmRlcHRoQnVmZmVyICYmIHRoaXMuZ2wuZGVsZXRlUmVuZGVyYnVmZmVyKHRoaXMuZGVwdGhCdWZmZXIpO1xuICAgICAgICB0aGlzLnN0ZW5jaWxCdWZmZXIgJiYgdGhpcy5nbC5kZWxldGVSZW5kZXJidWZmZXIodGhpcy5zdGVuY2lsQnVmZmVyKTtcbiAgICAgICAgdGhpcy5kZXB0aFN0ZW5jaWxCdWZmZXIgJiYgdGhpcy5nbC5kZWxldGVSZW5kZXJidWZmZXIodGhpcy5kZXB0aFN0ZW5jaWxCdWZmZXIpO1xuICAgICAgICB0aGlzLmdsLmRlbGV0ZUZyYW1lYnVmZmVyKHRoaXMuYnVmZmVyKTtcbiAgICB9XG59XG4iLCJpbXBvcnQgeyBWZWMzIH0gZnJvbSAnLi4vbWF0aC9WZWMzLmpzJztcblxuLy8gVE9ETzogSGFuZGxlIGNvbnRleHQgbG9zcyBodHRwczovL3d3dy5raHJvbm9zLm9yZy93ZWJnbC93aWtpL0hhbmRsaW5nQ29udGV4dExvc3RcblxuLy8gTm90IGF1dG9tYXRpYyAtIGRldnMgdG8gdXNlIHRoZXNlIG1ldGhvZHMgbWFudWFsbHlcbi8vIGdsLmNvbG9yTWFzayggY29sb3JNYXNrLCBjb2xvck1hc2ssIGNvbG9yTWFzaywgY29sb3JNYXNrICk7XG4vLyBnbC5jbGVhckNvbG9yKCByLCBnLCBiLCBhICk7XG4vLyBnbC5zdGVuY2lsTWFzayggc3RlbmNpbE1hc2sgKTtcbi8vIGdsLnN0ZW5jaWxGdW5jKCBzdGVuY2lsRnVuYywgc3RlbmNpbFJlZiwgc3RlbmNpbE1hc2sgKTtcbi8vIGdsLnN0ZW5jaWxPcCggc3RlbmNpbEZhaWwsIHN0ZW5jaWxaRmFpbCwgc3RlbmNpbFpQYXNzICk7XG4vLyBnbC5jbGVhclN0ZW5jaWwoIHN0ZW5jaWwgKTtcblxuY29uc3QgdGVtcFZlYzMgPSBuZXcgVmVjMygpO1xubGV0IElEID0gMTtcblxuZXhwb3J0IGNsYXNzIFJlbmRlcmVyIHtcbiAgICBjb25zdHJ1Y3Rvcih7XG4gICAgICAgIGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpLFxuICAgICAgICB3aWR0aCA9IDMwMCxcbiAgICAgICAgaGVpZ2h0ID0gMTUwLFxuICAgICAgICBkcHIgPSAxLFxuICAgICAgICBhbHBoYSA9IGZhbHNlLFxuICAgICAgICBkZXB0aCA9IHRydWUsXG4gICAgICAgIHN0ZW5jaWwgPSBmYWxzZSxcbiAgICAgICAgYW50aWFsaWFzID0gZmFsc2UsXG4gICAgICAgIHByZW11bHRpcGxpZWRBbHBoYSA9IGZhbHNlLFxuICAgICAgICBwcmVzZXJ2ZURyYXdpbmdCdWZmZXIgPSBmYWxzZSxcbiAgICAgICAgcG93ZXJQcmVmZXJlbmNlID0gJ2RlZmF1bHQnLFxuICAgICAgICBhdXRvQ2xlYXIgPSB0cnVlLFxuICAgICAgICB3ZWJnbCA9IDIsXG4gICAgfSA9IHt9KSB7XG4gICAgICAgIGNvbnN0IGF0dHJpYnV0ZXMgPSB7IGFscGhhLCBkZXB0aCwgc3RlbmNpbCwgYW50aWFsaWFzLCBwcmVtdWx0aXBsaWVkQWxwaGEsIHByZXNlcnZlRHJhd2luZ0J1ZmZlciwgcG93ZXJQcmVmZXJlbmNlIH07XG4gICAgICAgIHRoaXMuZHByID0gZHByO1xuICAgICAgICB0aGlzLmFscGhhID0gYWxwaGE7XG4gICAgICAgIHRoaXMuY29sb3IgPSB0cnVlO1xuICAgICAgICB0aGlzLmRlcHRoID0gZGVwdGg7XG4gICAgICAgIHRoaXMuc3RlbmNpbCA9IHN0ZW5jaWw7XG4gICAgICAgIHRoaXMucHJlbXVsdGlwbGllZEFscGhhID0gcHJlbXVsdGlwbGllZEFscGhhO1xuICAgICAgICB0aGlzLmF1dG9DbGVhciA9IGF1dG9DbGVhcjtcbiAgICAgICAgdGhpcy5pZCA9IElEKys7XG5cbiAgICAgICAgLy8gQXR0ZW1wdCBXZWJHTDIgdW5sZXNzIGZvcmNlZCB0byAxLCBpZiBub3Qgc3VwcG9ydGVkIGZhbGxiYWNrIHRvIFdlYkdMMVxuICAgICAgICB0aGlzLmlzV2ViZ2wyID0gISF0aGlzLmdsO1xuICAgICAgICBpZiAoIXRoaXMuZ2wpIHtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogQHR5cGUge09HTFJlbmRlcmluZ0NvbnRleHR9XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXMuZ2wgPSBjYW52YXMuZ2V0Q29udGV4dCgnd2ViZ2wnLCBhdHRyaWJ1dGVzKSB8fCBjYW52YXMuZ2V0Q29udGV4dCgnZXhwZXJpbWVudGFsLXdlYmdsJywgYXR0cmlidXRlcyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCF0aGlzLmdsKSBjb25zb2xlLmVycm9yKCd1bmFibGUgdG8gY3JlYXRlIHdlYmdsIGNvbnRleHQnKTtcblxuICAgICAgICAvLyBBdHRhY2ggcmVuZGVyZXIgdG8gZ2wgc28gdGhhdCBhbGwgY2xhc3NlcyBoYXZlIGFjY2VzcyB0byBpbnRlcm5hbCBzdGF0ZSBmdW5jdGlvbnNcbiAgICAgICAgdGhpcy5nbC5yZW5kZXJlciA9IHRoaXM7XG5cbiAgICAgICAgLy8gaW5pdGlhbGlzZSBzaXplIHZhbHVlc1xuICAgICAgICB0aGlzLnNldFNpemUod2lkdGgsIGhlaWdodCk7XG5cbiAgICAgICAgLy8gZ2wgc3RhdGUgc3RvcmVzIHRvIGF2b2lkIHJlZHVuZGFudCBjYWxscyBvbiBtZXRob2RzIHVzZWQgaW50ZXJuYWxseVxuICAgICAgICB0aGlzLnN0YXRlID0ge307XG4gICAgICAgIHRoaXMuc3RhdGUuYmxlbmRGdW5jID0geyBzcmM6IHRoaXMuZ2wuT05FLCBkc3Q6IHRoaXMuZ2wuWkVSTyB9O1xuICAgICAgICB0aGlzLnN0YXRlLmJsZW5kRXF1YXRpb24gPSB7IG1vZGVSR0I6IHRoaXMuZ2wuRlVOQ19BREQgfTtcbiAgICAgICAgdGhpcy5zdGF0ZS5jdWxsRmFjZSA9IG51bGw7XG4gICAgICAgIHRoaXMuc3RhdGUuZnJvbnRGYWNlID0gdGhpcy5nbC5DQ1c7XG4gICAgICAgIHRoaXMuc3RhdGUuZGVwdGhNYXNrID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5zdGF0ZS5kZXB0aEZ1bmMgPSB0aGlzLmdsLkxFU1M7XG4gICAgICAgIHRoaXMuc3RhdGUucHJlbXVsdGlwbHlBbHBoYSA9IGZhbHNlO1xuICAgICAgICB0aGlzLnN0YXRlLmZsaXBZID0gZmFsc2U7XG4gICAgICAgIHRoaXMuc3RhdGUudW5wYWNrQWxpZ25tZW50ID0gNDtcbiAgICAgICAgdGhpcy5zdGF0ZS5mcmFtZWJ1ZmZlciA9IG51bGw7XG4gICAgICAgIHRoaXMuc3RhdGUudmlld3BvcnQgPSB7IHdpZHRoOiBudWxsLCBoZWlnaHQ6IG51bGwgfTtcbiAgICAgICAgdGhpcy5zdGF0ZS50ZXh0dXJlVW5pdHMgPSBbXTtcbiAgICAgICAgdGhpcy5zdGF0ZS5hY3RpdmVUZXh0dXJlVW5pdCA9IDA7XG4gICAgICAgIHRoaXMuc3RhdGUuYm91bmRCdWZmZXIgPSBudWxsO1xuICAgICAgICB0aGlzLnN0YXRlLnVuaWZvcm1Mb2NhdGlvbnMgPSBuZXcgTWFwKCk7XG5cbiAgICAgICAgLy8gc3RvcmUgcmVxdWVzdGVkIGV4dGVuc2lvbnNcbiAgICAgICAgdGhpcy5leHRlbnNpb25zID0ge307XG5cbiAgICAgICAgLy8gSW5pdGlhbGlzZSBleHRyYSBmb3JtYXQgdHlwZXNcbiAgICAgICAgaWYgKHRoaXMuaXNXZWJnbDIpIHtcbiAgICAgICAgICAgIHRoaXMuZ2V0RXh0ZW5zaW9uKCdFWFRfY29sb3JfYnVmZmVyX2Zsb2F0Jyk7XG4gICAgICAgICAgICB0aGlzLmdldEV4dGVuc2lvbignT0VTX3RleHR1cmVfZmxvYXRfbGluZWFyJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmdldEV4dGVuc2lvbignT0VTX3RleHR1cmVfZmxvYXQnKTtcbiAgICAgICAgICAgIHRoaXMuZ2V0RXh0ZW5zaW9uKCdPRVNfdGV4dHVyZV9mbG9hdF9saW5lYXInKTtcbiAgICAgICAgICAgIHRoaXMuZ2V0RXh0ZW5zaW9uKCdPRVNfdGV4dHVyZV9oYWxmX2Zsb2F0Jyk7XG4gICAgICAgICAgICB0aGlzLmdldEV4dGVuc2lvbignT0VTX3RleHR1cmVfaGFsZl9mbG9hdF9saW5lYXInKTtcbiAgICAgICAgICAgIHRoaXMuZ2V0RXh0ZW5zaW9uKCdPRVNfZWxlbWVudF9pbmRleF91aW50Jyk7XG4gICAgICAgICAgICB0aGlzLmdldEV4dGVuc2lvbignT0VTX3N0YW5kYXJkX2Rlcml2YXRpdmVzJyk7XG4gICAgICAgICAgICB0aGlzLmdldEV4dGVuc2lvbignRVhUX3NSR0InKTtcbiAgICAgICAgICAgIHRoaXMuZ2V0RXh0ZW5zaW9uKCdXRUJHTF9kZXB0aF90ZXh0dXJlJyk7XG4gICAgICAgICAgICB0aGlzLmdldEV4dGVuc2lvbignV0VCR0xfZHJhd19idWZmZXJzJyk7XG4gICAgICAgICAgICB0aGlzLmdldEV4dGVuc2lvbignV0VCR0xfY29sb3JfYnVmZmVyX2Zsb2F0Jyk7XG4gICAgICAgICAgICB0aGlzLmdldEV4dGVuc2lvbignRVhUX2NvbG9yX2J1ZmZlcl9oYWxmX2Zsb2F0Jyk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBDcmVhdGUgbWV0aG9kIGFsaWFzZXMgdXNpbmcgZXh0ZW5zaW9uIChXZWJHTDEpIG9yIG5hdGl2ZSBpZiBhdmFpbGFibGUgKFdlYkdMMilcbiAgICAgICAgdGhpcy52ZXJ0ZXhBdHRyaWJEaXZpc29yID0gdGhpcy5nZXRFeHRlbnNpb24oJ0FOR0xFX2luc3RhbmNlZF9hcnJheXMnLCAndmVydGV4QXR0cmliRGl2aXNvcicsICd2ZXJ0ZXhBdHRyaWJEaXZpc29yQU5HTEUnKTtcbiAgICAgICAgdGhpcy5kcmF3QXJyYXlzSW5zdGFuY2VkID0gdGhpcy5nZXRFeHRlbnNpb24oJ0FOR0xFX2luc3RhbmNlZF9hcnJheXMnLCAnZHJhd0FycmF5c0luc3RhbmNlZCcsICdkcmF3QXJyYXlzSW5zdGFuY2VkQU5HTEUnKTtcbiAgICAgICAgdGhpcy5kcmF3RWxlbWVudHNJbnN0YW5jZWQgPSB0aGlzLmdldEV4dGVuc2lvbignQU5HTEVfaW5zdGFuY2VkX2FycmF5cycsICdkcmF3RWxlbWVudHNJbnN0YW5jZWQnLCAnZHJhd0VsZW1lbnRzSW5zdGFuY2VkQU5HTEUnKTtcbiAgICAgICAgdGhpcy5jcmVhdGVWZXJ0ZXhBcnJheSA9IHRoaXMuZ2V0RXh0ZW5zaW9uKCdPRVNfdmVydGV4X2FycmF5X29iamVjdCcsICdjcmVhdGVWZXJ0ZXhBcnJheScsICdjcmVhdGVWZXJ0ZXhBcnJheU9FUycpO1xuICAgICAgICB0aGlzLmJpbmRWZXJ0ZXhBcnJheSA9IHRoaXMuZ2V0RXh0ZW5zaW9uKCdPRVNfdmVydGV4X2FycmF5X29iamVjdCcsICdiaW5kVmVydGV4QXJyYXknLCAnYmluZFZlcnRleEFycmF5T0VTJyk7XG4gICAgICAgIHRoaXMuZGVsZXRlVmVydGV4QXJyYXkgPSB0aGlzLmdldEV4dGVuc2lvbignT0VTX3ZlcnRleF9hcnJheV9vYmplY3QnLCAnZGVsZXRlVmVydGV4QXJyYXknLCAnZGVsZXRlVmVydGV4QXJyYXlPRVMnKTtcbiAgICAgICAgdGhpcy5kcmF3QnVmZmVycyA9IHRoaXMuZ2V0RXh0ZW5zaW9uKCdXRUJHTF9kcmF3X2J1ZmZlcnMnLCAnZHJhd0J1ZmZlcnMnLCAnZHJhd0J1ZmZlcnNXRUJHTCcpO1xuXG4gICAgICAgIC8vIFN0b3JlIGRldmljZSBwYXJhbWV0ZXJzXG4gICAgICAgIHRoaXMucGFyYW1ldGVycyA9IHt9O1xuICAgICAgICB0aGlzLnBhcmFtZXRlcnMubWF4VGV4dHVyZVVuaXRzID0gdGhpcy5nbC5nZXRQYXJhbWV0ZXIodGhpcy5nbC5NQVhfQ09NQklORURfVEVYVFVSRV9JTUFHRV9VTklUUyk7XG4gICAgICAgIHRoaXMucGFyYW1ldGVycy5tYXhBbmlzb3Ryb3B5ID0gdGhpcy5nZXRFeHRlbnNpb24oJ0VYVF90ZXh0dXJlX2ZpbHRlcl9hbmlzb3Ryb3BpYycpXG4gICAgICAgICAgICA/IHRoaXMuZ2wuZ2V0UGFyYW1ldGVyKHRoaXMuZ2V0RXh0ZW5zaW9uKCdFWFRfdGV4dHVyZV9maWx0ZXJfYW5pc290cm9waWMnKS5NQVhfVEVYVFVSRV9NQVhfQU5JU09UUk9QWV9FWFQpXG4gICAgICAgICAgICA6IDA7XG4gICAgfVxuXG4gICAgc2V0U2l6ZSh3aWR0aCwgaGVpZ2h0KSB7XG4gICAgICAgIHRoaXMud2lkdGggPSB3aWR0aDtcbiAgICAgICAgdGhpcy5oZWlnaHQgPSBoZWlnaHQ7XG5cbiAgICAgICAgdGhpcy5nbC5jYW52YXMud2lkdGggPSB3aWR0aCAqIHRoaXMuZHByO1xuICAgICAgICB0aGlzLmdsLmNhbnZhcy5oZWlnaHQgPSBoZWlnaHQgKiB0aGlzLmRwcjtcblxuICAgICAgICBPYmplY3QuYXNzaWduKHRoaXMuZ2wuY2FudmFzLnN0eWxlLCB7XG4gICAgICAgICAgICB3aWR0aDogd2lkdGggKyAncHgnLFxuICAgICAgICAgICAgaGVpZ2h0OiBoZWlnaHQgKyAncHgnLFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBzZXRWaWV3cG9ydCh3aWR0aCwgaGVpZ2h0KSB7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLnZpZXdwb3J0LndpZHRoID09PSB3aWR0aCAmJiB0aGlzLnN0YXRlLnZpZXdwb3J0LmhlaWdodCA9PT0gaGVpZ2h0KSByZXR1cm47XG4gICAgICAgIHRoaXMuc3RhdGUudmlld3BvcnQud2lkdGggPSB3aWR0aDtcbiAgICAgICAgdGhpcy5zdGF0ZS52aWV3cG9ydC5oZWlnaHQgPSBoZWlnaHQ7XG4gICAgICAgIHRoaXMuZ2wudmlld3BvcnQoMCwgMCwgd2lkdGgsIGhlaWdodCk7XG4gICAgfVxuXG4gICAgZW5hYmxlKGlkKSB7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlW2lkXSA9PT0gdHJ1ZSkgcmV0dXJuO1xuICAgICAgICB0aGlzLmdsLmVuYWJsZShpZCk7XG4gICAgICAgIHRoaXMuc3RhdGVbaWRdID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBkaXNhYmxlKGlkKSB7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlW2lkXSA9PT0gZmFsc2UpIHJldHVybjtcbiAgICAgICAgdGhpcy5nbC5kaXNhYmxlKGlkKTtcbiAgICAgICAgdGhpcy5zdGF0ZVtpZF0gPSBmYWxzZTtcbiAgICB9XG5cbiAgICBzZXRCbGVuZEZ1bmMoc3JjLCBkc3QsIHNyY0FscGhhLCBkc3RBbHBoYSkge1xuICAgICAgICBpZiAoXG4gICAgICAgICAgICB0aGlzLnN0YXRlLmJsZW5kRnVuYy5zcmMgPT09IHNyYyAmJlxuICAgICAgICAgICAgdGhpcy5zdGF0ZS5ibGVuZEZ1bmMuZHN0ID09PSBkc3QgJiZcbiAgICAgICAgICAgIHRoaXMuc3RhdGUuYmxlbmRGdW5jLnNyY0FscGhhID09PSBzcmNBbHBoYSAmJlxuICAgICAgICAgICAgdGhpcy5zdGF0ZS5ibGVuZEZ1bmMuZHN0QWxwaGEgPT09IGRzdEFscGhhXG4gICAgICAgIClcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgdGhpcy5zdGF0ZS5ibGVuZEZ1bmMuc3JjID0gc3JjO1xuICAgICAgICB0aGlzLnN0YXRlLmJsZW5kRnVuYy5kc3QgPSBkc3Q7XG4gICAgICAgIHRoaXMuc3RhdGUuYmxlbmRGdW5jLnNyY0FscGhhID0gc3JjQWxwaGE7XG4gICAgICAgIHRoaXMuc3RhdGUuYmxlbmRGdW5jLmRzdEFscGhhID0gZHN0QWxwaGE7XG4gICAgICAgIGlmIChzcmNBbHBoYSAhPT0gdW5kZWZpbmVkKSB0aGlzLmdsLmJsZW5kRnVuY1NlcGFyYXRlKHNyYywgZHN0LCBzcmNBbHBoYSwgZHN0QWxwaGEpO1xuICAgICAgICBlbHNlIHRoaXMuZ2wuYmxlbmRGdW5jKHNyYywgZHN0KTtcbiAgICB9XG5cbiAgICBzZXRCbGVuZEVxdWF0aW9uKG1vZGVSR0IsIG1vZGVBbHBoYSkge1xuICAgICAgICBtb2RlUkdCID0gbW9kZVJHQiB8fCB0aGlzLmdsLkZVTkNfQUREO1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5ibGVuZEVxdWF0aW9uLm1vZGVSR0IgPT09IG1vZGVSR0IgJiYgdGhpcy5zdGF0ZS5ibGVuZEVxdWF0aW9uLm1vZGVBbHBoYSA9PT0gbW9kZUFscGhhKSByZXR1cm47XG4gICAgICAgIHRoaXMuc3RhdGUuYmxlbmRFcXVhdGlvbi5tb2RlUkdCID0gbW9kZVJHQjtcbiAgICAgICAgdGhpcy5zdGF0ZS5ibGVuZEVxdWF0aW9uLm1vZGVBbHBoYSA9IG1vZGVBbHBoYTtcbiAgICAgICAgaWYgKG1vZGVBbHBoYSAhPT0gdW5kZWZpbmVkKSB0aGlzLmdsLmJsZW5kRXF1YXRpb25TZXBhcmF0ZShtb2RlUkdCLCBtb2RlQWxwaGEpO1xuICAgICAgICBlbHNlIHRoaXMuZ2wuYmxlbmRFcXVhdGlvbihtb2RlUkdCKTtcbiAgICB9XG5cbiAgICBzZXRDdWxsRmFjZSh2YWx1ZSkge1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5jdWxsRmFjZSA9PT0gdmFsdWUpIHJldHVybjtcbiAgICAgICAgdGhpcy5zdGF0ZS5jdWxsRmFjZSA9IHZhbHVlO1xuICAgICAgICB0aGlzLmdsLmN1bGxGYWNlKHZhbHVlKTtcbiAgICB9XG5cbiAgICBzZXRGcm9udEZhY2UodmFsdWUpIHtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuZnJvbnRGYWNlID09PSB2YWx1ZSkgcmV0dXJuO1xuICAgICAgICB0aGlzLnN0YXRlLmZyb250RmFjZSA9IHZhbHVlO1xuICAgICAgICB0aGlzLmdsLmZyb250RmFjZSh2YWx1ZSk7XG4gICAgfVxuXG4gICAgc2V0RGVwdGhNYXNrKHZhbHVlKSB7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLmRlcHRoTWFzayA9PT0gdmFsdWUpIHJldHVybjtcbiAgICAgICAgdGhpcy5zdGF0ZS5kZXB0aE1hc2sgPSB2YWx1ZTtcbiAgICAgICAgdGhpcy5nbC5kZXB0aE1hc2sodmFsdWUpO1xuICAgIH1cblxuICAgIHNldERlcHRoRnVuYyh2YWx1ZSkge1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5kZXB0aEZ1bmMgPT09IHZhbHVlKSByZXR1cm47XG4gICAgICAgIHRoaXMuc3RhdGUuZGVwdGhGdW5jID0gdmFsdWU7XG4gICAgICAgIHRoaXMuZ2wuZGVwdGhGdW5jKHZhbHVlKTtcbiAgICB9XG5cbiAgICBhY3RpdmVUZXh0dXJlKHZhbHVlKSB7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLmFjdGl2ZVRleHR1cmVVbml0ID09PSB2YWx1ZSkgcmV0dXJuO1xuICAgICAgICB0aGlzLnN0YXRlLmFjdGl2ZVRleHR1cmVVbml0ID0gdmFsdWU7XG4gICAgICAgIHRoaXMuZ2wuYWN0aXZlVGV4dHVyZSh0aGlzLmdsLlRFWFRVUkUwICsgdmFsdWUpO1xuICAgIH1cblxuICAgIGJpbmRGcmFtZWJ1ZmZlcih7IHRhcmdldCA9IHRoaXMuZ2wuRlJBTUVCVUZGRVIsIGJ1ZmZlciA9IG51bGwgfSA9IHt9KSB7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLmZyYW1lYnVmZmVyID09PSBidWZmZXIpIHJldHVybjtcbiAgICAgICAgdGhpcy5zdGF0ZS5mcmFtZWJ1ZmZlciA9IGJ1ZmZlcjtcbiAgICAgICAgdGhpcy5nbC5iaW5kRnJhbWVidWZmZXIodGFyZ2V0LCBidWZmZXIpO1xuICAgIH1cblxuICAgIGdldEV4dGVuc2lvbihleHRlbnNpb24sIHdlYmdsMkZ1bmMsIGV4dEZ1bmMpIHtcbiAgICAgICAgLy8gaWYgd2ViZ2wyIGZ1bmN0aW9uIHN1cHBvcnRlZCwgcmV0dXJuIGZ1bmMgYm91bmQgdG8gZ2wgY29udGV4dFxuICAgICAgICBpZiAod2ViZ2wyRnVuYyAmJiB0aGlzLmdsW3dlYmdsMkZ1bmNdKSByZXR1cm4gdGhpcy5nbFt3ZWJnbDJGdW5jXS5iaW5kKHRoaXMuZ2wpO1xuXG4gICAgICAgIC8vIGZldGNoIGV4dGVuc2lvbiBvbmNlIG9ubHlcbiAgICAgICAgaWYgKCF0aGlzLmV4dGVuc2lvbnNbZXh0ZW5zaW9uXSkge1xuICAgICAgICAgICAgdGhpcy5leHRlbnNpb25zW2V4dGVuc2lvbl0gPSB0aGlzLmdsLmdldEV4dGVuc2lvbihleHRlbnNpb24pO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gcmV0dXJuIGV4dGVuc2lvbiBpZiBubyBmdW5jdGlvbiByZXF1ZXN0ZWRcbiAgICAgICAgaWYgKCF3ZWJnbDJGdW5jKSByZXR1cm4gdGhpcy5leHRlbnNpb25zW2V4dGVuc2lvbl07XG5cbiAgICAgICAgLy8gUmV0dXJuIG51bGwgaWYgZXh0ZW5zaW9uIG5vdCBzdXBwb3J0ZWRcbiAgICAgICAgaWYgKCF0aGlzLmV4dGVuc2lvbnNbZXh0ZW5zaW9uXSkgcmV0dXJuIG51bGw7XG5cbiAgICAgICAgLy8gcmV0dXJuIGV4dGVuc2lvbiBmdW5jdGlvbiwgYm91bmQgdG8gZXh0ZW5zaW9uXG4gICAgICAgIHJldHVybiB0aGlzLmV4dGVuc2lvbnNbZXh0ZW5zaW9uXVtleHRGdW5jXS5iaW5kKHRoaXMuZXh0ZW5zaW9uc1tleHRlbnNpb25dKTtcbiAgICB9XG5cbiAgICBzb3J0T3BhcXVlKGEsIGIpIHtcbiAgICAgICAgaWYgKGEucmVuZGVyT3JkZXIgIT09IGIucmVuZGVyT3JkZXIpIHtcbiAgICAgICAgICAgIHJldHVybiBhLnJlbmRlck9yZGVyIC0gYi5yZW5kZXJPcmRlcjtcbiAgICAgICAgfSBlbHNlIGlmIChhLnByb2dyYW0uaWQgIT09IGIucHJvZ3JhbS5pZCkge1xuICAgICAgICAgICAgcmV0dXJuIGEucHJvZ3JhbS5pZCAtIGIucHJvZ3JhbS5pZDtcbiAgICAgICAgfSBlbHNlIGlmIChhLnpEZXB0aCAhPT0gYi56RGVwdGgpIHtcbiAgICAgICAgICAgIHJldHVybiBhLnpEZXB0aCAtIGIuekRlcHRoO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGIuaWQgLSBhLmlkO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc29ydFRyYW5zcGFyZW50KGEsIGIpIHtcbiAgICAgICAgaWYgKGEucmVuZGVyT3JkZXIgIT09IGIucmVuZGVyT3JkZXIpIHtcbiAgICAgICAgICAgIHJldHVybiBhLnJlbmRlck9yZGVyIC0gYi5yZW5kZXJPcmRlcjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoYS56RGVwdGggIT09IGIuekRlcHRoKSB7XG4gICAgICAgICAgICByZXR1cm4gYi56RGVwdGggLSBhLnpEZXB0aDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBiLmlkIC0gYS5pZDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHNvcnRVSShhLCBiKSB7XG4gICAgICAgIGlmIChhLnJlbmRlck9yZGVyICE9PSBiLnJlbmRlck9yZGVyKSB7XG4gICAgICAgICAgICByZXR1cm4gYS5yZW5kZXJPcmRlciAtIGIucmVuZGVyT3JkZXI7XG4gICAgICAgIH0gZWxzZSBpZiAoYS5wcm9ncmFtLmlkICE9PSBiLnByb2dyYW0uaWQpIHtcbiAgICAgICAgICAgIHJldHVybiBhLnByb2dyYW0uaWQgLSBiLnByb2dyYW0uaWQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gYi5pZCAtIGEuaWQ7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBnZXRSZW5kZXJMaXN0KHsgc2NlbmUsIGNhbWVyYSwgZnJ1c3R1bUN1bGwsIHNvcnQgfSkge1xuICAgICAgICBsZXQgcmVuZGVyTGlzdCA9IEFycmF5LmlzQXJyYXkoc2NlbmUpID8gWy4uLnNjZW5lXSA6IHRoaXMuc2NlbmVUb1JlbmRlckxpc3Qoc2NlbmUsIGZydXN0dW1DdWxsLCBjYW1lcmEpO1xuICAgICAgICBpZiAoc29ydCkgcmVuZGVyTGlzdCA9IHRoaXMuc29ydFJlbmRlckxpc3QocmVuZGVyTGlzdCwgY2FtZXJhKTtcbiAgICAgICAgcmV0dXJuIHJlbmRlckxpc3Q7XG4gICAgfVxuXG4gICAgc2NlbmVUb1JlbmRlckxpc3Qoc2NlbmUsIGZydXN0dW1DdWxsLCBjYW1lcmEpIHtcbiAgICAgICAgaWYgKGNhbWVyYSAmJiBmcnVzdHVtQ3VsbCkgY2FtZXJhLnVwZGF0ZUZydXN0dW0oKTtcbiAgICAgICAgbGV0IHJlbmRlckxpc3QgPSBbXTtcbiAgICAgICAgLy8gR2V0IHZpc2libGVcbiAgICAgICAgc2NlbmUudHJhdmVyc2UoKG5vZGUpID0+IHtcbiAgICAgICAgICAgIGlmICghbm9kZS52aXNpYmxlKSByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIGlmICghbm9kZS5kcmF3KSByZXR1cm47XG5cbiAgICAgICAgICAgIGlmIChmcnVzdHVtQ3VsbCAmJiBub2RlLmZydXN0dW1DdWxsZWQgJiYgY2FtZXJhKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFjYW1lcmEuZnJ1c3R1bUludGVyc2VjdHNNZXNoKG5vZGUpKSByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJlbmRlckxpc3QucHVzaChub2RlKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiByZW5kZXJMaXN0O1xuICAgIH1cblxuICAgIHNvcnRSZW5kZXJMaXN0KHJlbmRlckxpc3QsIGNhbWVyYSwgc3BsaXQgPSBmYWxzZSkge1xuICAgICAgICBjb25zdCBvcGFxdWUgPSBbXTtcbiAgICAgICAgY29uc3QgdHJhbnNwYXJlbnQgPSBbXTsgLy8gZGVwdGhUZXN0IHRydWVcbiAgICAgICAgY29uc3QgdWkgPSBbXTsgLy8gZGVwdGhUZXN0IGZhbHNlXG5cbiAgICAgICAgcmVuZGVyTGlzdC5mb3JFYWNoKChub2RlKSA9PiB7XG4gICAgICAgICAgICAvLyBTcGxpdCBpbnRvIHRoZSAzIHJlbmRlciBncm91cHNcbiAgICAgICAgICAgIGlmICghbm9kZS5wcm9ncmFtLnRyYW5zcGFyZW50KSB7XG4gICAgICAgICAgICAgICAgb3BhcXVlLnB1c2gobm9kZSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKG5vZGUucHJvZ3JhbS5kZXB0aFRlc3QpIHtcbiAgICAgICAgICAgICAgICB0cmFuc3BhcmVudC5wdXNoKG5vZGUpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB1aS5wdXNoKG5vZGUpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBub2RlLnpEZXB0aCA9IDA7XG5cbiAgICAgICAgICAgIC8vIE9ubHkgY2FsY3VsYXRlIHotZGVwdGggaWYgcmVuZGVyT3JkZXIgdW5zZXQgYW5kIGRlcHRoVGVzdCBpcyB0cnVlXG4gICAgICAgICAgICBpZiAobm9kZS5yZW5kZXJPcmRlciAhPT0gMCB8fCAhbm9kZS5wcm9ncmFtLmRlcHRoVGVzdCB8fCAhY2FtZXJhKSByZXR1cm47XG5cbiAgICAgICAgICAgIC8vIHVwZGF0ZSB6LWRlcHRoXG4gICAgICAgICAgICBub2RlLndvcmxkTWF0cml4LmdldFRyYW5zbGF0aW9uKHRlbXBWZWMzKTtcbiAgICAgICAgICAgIHRlbXBWZWMzLmFwcGx5TWF0cml4NChjYW1lcmEucHJvamVjdGlvblZpZXdNYXRyaXgpO1xuICAgICAgICAgICAgbm9kZS56RGVwdGggPSB0ZW1wVmVjMy56O1xuICAgICAgICB9KTtcblxuICAgICAgICBvcGFxdWUuc29ydCh0aGlzLnNvcnRPcGFxdWUpO1xuICAgICAgICB0cmFuc3BhcmVudC5zb3J0KHRoaXMuc29ydFRyYW5zcGFyZW50KTtcbiAgICAgICAgdWkuc29ydCh0aGlzLnNvcnRVSSk7XG5cbiAgICAgICAgcmV0dXJuIHNwbGl0ID8ge29wYXF1ZSwgdHJhbnNwYXJlbnQsIHVpfSA6IG9wYXF1ZS5jb25jYXQodHJhbnNwYXJlbnQsIHVpKTtcbiAgICB9XG5cbiAgICByZW5kZXIoeyBzY2VuZSwgY2FtZXJhLCB0YXJnZXQgPSBudWxsLCB1cGRhdGUgPSB0cnVlLCBzb3J0ID0gdHJ1ZSwgZnJ1c3R1bUN1bGwgPSB0cnVlLCBjbGVhciwgb3ZlcnJpZGVQcm9ncmFtIH0pIHtcbiAgICAgICAgaWYgKHRhcmdldCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgLy8gbWFrZSBzdXJlIG5vIHJlbmRlciB0YXJnZXQgYm91bmQgc28gZHJhd3MgdG8gY2FudmFzXG4gICAgICAgICAgICB0aGlzLmJpbmRGcmFtZWJ1ZmZlcigpO1xuICAgICAgICAgICAgdGhpcy5zZXRWaWV3cG9ydCh0aGlzLndpZHRoICogdGhpcy5kcHIsIHRoaXMuaGVpZ2h0ICogdGhpcy5kcHIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gYmluZCBzdXBwbGllZCByZW5kZXIgdGFyZ2V0IGFuZCB1cGRhdGUgdmlld3BvcnRcbiAgICAgICAgICAgIHRoaXMuYmluZEZyYW1lYnVmZmVyKHRhcmdldCk7XG4gICAgICAgICAgICB0aGlzLnNldFZpZXdwb3J0KHRhcmdldC53aWR0aCwgdGFyZ2V0LmhlaWdodCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoY2xlYXIgfHwgKHRoaXMuYXV0b0NsZWFyICYmIGNsZWFyICE9PSBmYWxzZSkpIHtcbiAgICAgICAgICAgIC8vIEVuc3VyZSBkZXB0aCBidWZmZXIgd3JpdGluZyBpcyBlbmFibGVkIHNvIGl0IGNhbiBiZSBjbGVhcmVkXG4gICAgICAgICAgICBpZiAodGhpcy5kZXB0aCAmJiAoIXRhcmdldCB8fCB0YXJnZXQuZGVwdGgpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5lbmFibGUodGhpcy5nbC5ERVBUSF9URVNUKTtcbiAgICAgICAgICAgICAgICB0aGlzLnNldERlcHRoTWFzayh0cnVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuZ2wuY2xlYXIoXG4gICAgICAgICAgICAgICAgKHRoaXMuY29sb3IgPyB0aGlzLmdsLkNPTE9SX0JVRkZFUl9CSVQgOiAwKSB8XG4gICAgICAgICAgICAgICAgICAgICh0aGlzLmRlcHRoID8gdGhpcy5nbC5ERVBUSF9CVUZGRVJfQklUIDogMCkgfFxuICAgICAgICAgICAgICAgICAgICAodGhpcy5zdGVuY2lsID8gdGhpcy5nbC5TVEVOQ0lMX0JVRkZFUl9CSVQgOiAwKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHVwZGF0ZXMgYWxsIHNjZW5lIGdyYXBoIG1hdHJpY2VzXG4gICAgICAgIGlmICh1cGRhdGUgJiYgIUFycmF5LmlzQXJyYXkoc2NlbmUpKSBzY2VuZS51cGRhdGVNYXRyaXhXb3JsZCgpO1xuXG4gICAgICAgIC8vIFVwZGF0ZSBjYW1lcmEgc2VwYXJhdGVseSwgaW4gY2FzZSBub3QgaW4gc2NlbmUgZ3JhcGhcbiAgICAgICAgaWYgKGNhbWVyYSkgY2FtZXJhLnVwZGF0ZU1hdHJpeFdvcmxkKCk7XG5cbiAgICAgICAgLy8gR2V0IHJlbmRlciBsaXN0IC0gZW50YWlscyBjdWxsaW5nIGFuZCBzb3J0aW5nXG4gICAgICAgIGNvbnN0IHJlbmRlckxpc3QgPSB0aGlzLmdldFJlbmRlckxpc3QoeyBzY2VuZSwgY2FtZXJhLCBmcnVzdHVtQ3VsbCwgc29ydCwgb3ZlcnJpZGVQcm9ncmFtIH0pO1xuXG4gICAgICAgIHJlbmRlckxpc3QuZm9yRWFjaCgobm9kZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5yZW5kZXJOb2RlKG5vZGUsIGNhbWVyYSwgb3ZlcnJpZGVQcm9ncmFtKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmVuZGVyTm9kZShub2RlLCBjYW1lcmEsIG92ZXJyaWRlUHJvZ3JhbSkge1xuICAgICAgICBub2RlLmRyYXcoe2NhbWVyYSwgb3ZlcnJpZGVQcm9ncmFtfSk7XG4gICAgfVxufVxuIiwiLy8gVE9ETzogZGVsZXRlIHRleHR1cmVcbi8vIFRPRE86IHVzZSB0ZXhTdWJJbWFnZTJEIGZvciB1cGRhdGVzICh2aWRlbyBvciB3aGVuIGxvYWRlZClcbi8vIFRPRE86IG5lZWQ/IGVuY29kaW5nID0gbGluZWFyRW5jb2Rpbmdcbi8vIFRPRE86IHN1cHBvcnQgbm9uLWNvbXByZXNzZWQgbWlwbWFwcyB1cGxvYWRzXG5cbmNvbnN0IGVtcHR5UGl4ZWwgPSBuZXcgVWludDhBcnJheSg0KTtcblxuZnVuY3Rpb24gaXNQb3dlck9mMih2YWx1ZSkge1xuICAgIHJldHVybiAodmFsdWUgJiAodmFsdWUgLSAxKSkgPT09IDA7XG59XG5cbmxldCBJRCA9IDE7XG5cbmV4cG9ydCBjbGFzcyBUZXh0dXJlIHtcbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgZ2wsXG4gICAgICAgIHtcbiAgICAgICAgICAgIGltYWdlLFxuICAgICAgICAgICAgdGFyZ2V0ID0gZ2wuVEVYVFVSRV8yRCxcbiAgICAgICAgICAgIHR5cGUgPSBnbC5VTlNJR05FRF9CWVRFLFxuICAgICAgICAgICAgZm9ybWF0ID0gZ2wuUkdCQSxcbiAgICAgICAgICAgIGludGVybmFsRm9ybWF0ID0gZm9ybWF0LFxuICAgICAgICAgICAgd3JhcFMgPSBnbC5DTEFNUF9UT19FREdFLFxuICAgICAgICAgICAgd3JhcFQgPSBnbC5DTEFNUF9UT19FREdFLFxuICAgICAgICAgICAgZ2VuZXJhdGVNaXBtYXBzID0gdHJ1ZSxcbiAgICAgICAgICAgIG1pbkZpbHRlciA9IGdlbmVyYXRlTWlwbWFwcyA/IGdsLk5FQVJFU1RfTUlQTUFQX0xJTkVBUiA6IGdsLkxJTkVBUixcbiAgICAgICAgICAgIG1hZ0ZpbHRlciA9IGdsLkxJTkVBUixcbiAgICAgICAgICAgIHByZW11bHRpcGx5QWxwaGEgPSBmYWxzZSxcbiAgICAgICAgICAgIHVucGFja0FsaWdubWVudCA9IDQsXG4gICAgICAgICAgICBmbGlwWSA9IHRhcmdldCA9PSBnbC5URVhUVVJFXzJEID8gdHJ1ZSA6IGZhbHNlLFxuICAgICAgICAgICAgYW5pc290cm9weSA9IDAsXG4gICAgICAgICAgICBsZXZlbCA9IDAsXG4gICAgICAgICAgICB3aWR0aCwgLy8gdXNlZCBmb3IgUmVuZGVyVGFyZ2V0cyBvciBEYXRhIFRleHR1cmVzXG4gICAgICAgICAgICBoZWlnaHQgPSB3aWR0aCxcbiAgICAgICAgfSA9IHt9XG4gICAgKSB7XG4gICAgICAgIHRoaXMuZ2wgPSBnbDtcbiAgICAgICAgdGhpcy5pZCA9IElEKys7XG5cbiAgICAgICAgdGhpcy5pbWFnZSA9IGltYWdlO1xuICAgICAgICB0aGlzLnRhcmdldCA9IHRhcmdldDtcbiAgICAgICAgdGhpcy50eXBlID0gdHlwZTtcbiAgICAgICAgdGhpcy5mb3JtYXQgPSBmb3JtYXQ7XG4gICAgICAgIHRoaXMuaW50ZXJuYWxGb3JtYXQgPSBpbnRlcm5hbEZvcm1hdDtcbiAgICAgICAgdGhpcy5taW5GaWx0ZXIgPSBtaW5GaWx0ZXI7XG4gICAgICAgIHRoaXMubWFnRmlsdGVyID0gbWFnRmlsdGVyO1xuICAgICAgICB0aGlzLndyYXBTID0gd3JhcFM7XG4gICAgICAgIHRoaXMud3JhcFQgPSB3cmFwVDtcbiAgICAgICAgdGhpcy5nZW5lcmF0ZU1pcG1hcHMgPSBnZW5lcmF0ZU1pcG1hcHM7XG4gICAgICAgIHRoaXMucHJlbXVsdGlwbHlBbHBoYSA9IHByZW11bHRpcGx5QWxwaGE7XG4gICAgICAgIHRoaXMudW5wYWNrQWxpZ25tZW50ID0gdW5wYWNrQWxpZ25tZW50O1xuICAgICAgICB0aGlzLmZsaXBZID0gZmxpcFk7XG4gICAgICAgIHRoaXMuYW5pc290cm9weSA9IE1hdGgubWluKGFuaXNvdHJvcHksIHRoaXMuZ2wucmVuZGVyZXIucGFyYW1ldGVycy5tYXhBbmlzb3Ryb3B5KTtcbiAgICAgICAgdGhpcy5sZXZlbCA9IGxldmVsO1xuICAgICAgICB0aGlzLndpZHRoID0gd2lkdGg7XG4gICAgICAgIHRoaXMuaGVpZ2h0ID0gaGVpZ2h0O1xuICAgICAgICB0aGlzLnRleHR1cmUgPSB0aGlzLmdsLmNyZWF0ZVRleHR1cmUoKTtcblxuICAgICAgICB0aGlzLnN0b3JlID0ge1xuICAgICAgICAgICAgaW1hZ2U6IG51bGwsXG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gQWxpYXMgZm9yIHN0YXRlIHN0b3JlIHRvIGF2b2lkIHJlZHVuZGFudCBjYWxscyBmb3IgZ2xvYmFsIHN0YXRlXG4gICAgICAgIHRoaXMuZ2xTdGF0ZSA9IHRoaXMuZ2wucmVuZGVyZXIuc3RhdGU7XG5cbiAgICAgICAgLy8gU3RhdGUgc3RvcmUgdG8gYXZvaWQgcmVkdW5kYW50IGNhbGxzIGZvciBwZXItdGV4dHVyZSBzdGF0ZVxuICAgICAgICB0aGlzLnN0YXRlID0ge307XG4gICAgICAgIHRoaXMuc3RhdGUubWluRmlsdGVyID0gdGhpcy5nbC5ORUFSRVNUX01JUE1BUF9MSU5FQVI7XG4gICAgICAgIHRoaXMuc3RhdGUubWFnRmlsdGVyID0gdGhpcy5nbC5MSU5FQVI7XG4gICAgICAgIHRoaXMuc3RhdGUud3JhcFMgPSB0aGlzLmdsLlJFUEVBVDtcbiAgICAgICAgdGhpcy5zdGF0ZS53cmFwVCA9IHRoaXMuZ2wuUkVQRUFUO1xuICAgICAgICB0aGlzLnN0YXRlLmFuaXNvdHJvcHkgPSAwO1xuICAgIH1cblxuICAgIGJpbmQoKSB7XG4gICAgICAgIC8vIEFscmVhZHkgYm91bmQgdG8gYWN0aXZlIHRleHR1cmUgdW5pdFxuICAgICAgICBpZiAodGhpcy5nbFN0YXRlLnRleHR1cmVVbml0c1t0aGlzLmdsU3RhdGUuYWN0aXZlVGV4dHVyZVVuaXRdID09PSB0aGlzLmlkKSByZXR1cm47XG4gICAgICAgIHRoaXMuZ2wuYmluZFRleHR1cmUodGhpcy50YXJnZXQsIHRoaXMudGV4dHVyZSk7XG4gICAgICAgIHRoaXMuZ2xTdGF0ZS50ZXh0dXJlVW5pdHNbdGhpcy5nbFN0YXRlLmFjdGl2ZVRleHR1cmVVbml0XSA9IHRoaXMuaWQ7XG4gICAgfVxuXG4gICAgdXBkYXRlKHRleHR1cmVVbml0ID0gMCkge1xuICAgICAgICBjb25zdCBuZWVkc1VwZGF0ZSA9ICEodGhpcy5pbWFnZSA9PT0gdGhpcy5zdG9yZS5pbWFnZSAmJiAhdGhpcy5uZWVkc1VwZGF0ZSk7XG5cbiAgICAgICAgLy8gTWFrZSBzdXJlIHRoYXQgdGV4dHVyZSBpcyBib3VuZCB0byBpdHMgdGV4dHVyZSB1bml0XG4gICAgICAgIGlmIChuZWVkc1VwZGF0ZSB8fCB0aGlzLmdsU3RhdGUudGV4dHVyZVVuaXRzW3RleHR1cmVVbml0XSAhPT0gdGhpcy5pZCkge1xuICAgICAgICAgICAgLy8gc2V0IGFjdGl2ZSB0ZXh0dXJlIHVuaXQgdG8gcGVyZm9ybSB0ZXh0dXJlIGZ1bmN0aW9uc1xuICAgICAgICAgICAgdGhpcy5nbC5yZW5kZXJlci5hY3RpdmVUZXh0dXJlKHRleHR1cmVVbml0KTtcbiAgICAgICAgICAgIHRoaXMuYmluZCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFuZWVkc1VwZGF0ZSkgcmV0dXJuO1xuICAgICAgICB0aGlzLm5lZWRzVXBkYXRlID0gZmFsc2U7XG5cbiAgICAgICAgaWYgKHRoaXMuZmxpcFkgIT09IHRoaXMuZ2xTdGF0ZS5mbGlwWSkge1xuICAgICAgICAgICAgdGhpcy5nbC5waXhlbFN0b3JlaSh0aGlzLmdsLlVOUEFDS19GTElQX1lfV0VCR0wsIHRoaXMuZmxpcFkpO1xuICAgICAgICAgICAgdGhpcy5nbFN0YXRlLmZsaXBZID0gdGhpcy5mbGlwWTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLnByZW11bHRpcGx5QWxwaGEgIT09IHRoaXMuZ2xTdGF0ZS5wcmVtdWx0aXBseUFscGhhKSB7XG4gICAgICAgICAgICB0aGlzLmdsLnBpeGVsU3RvcmVpKHRoaXMuZ2wuVU5QQUNLX1BSRU1VTFRJUExZX0FMUEhBX1dFQkdMLCB0aGlzLnByZW11bHRpcGx5QWxwaGEpO1xuICAgICAgICAgICAgdGhpcy5nbFN0YXRlLnByZW11bHRpcGx5QWxwaGEgPSB0aGlzLnByZW11bHRpcGx5QWxwaGE7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy51bnBhY2tBbGlnbm1lbnQgIT09IHRoaXMuZ2xTdGF0ZS51bnBhY2tBbGlnbm1lbnQpIHtcbiAgICAgICAgICAgIHRoaXMuZ2wucGl4ZWxTdG9yZWkodGhpcy5nbC5VTlBBQ0tfQUxJR05NRU5ULCB0aGlzLnVucGFja0FsaWdubWVudCk7XG4gICAgICAgICAgICB0aGlzLmdsU3RhdGUudW5wYWNrQWxpZ25tZW50ID0gdGhpcy51bnBhY2tBbGlnbm1lbnQ7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5taW5GaWx0ZXIgIT09IHRoaXMuc3RhdGUubWluRmlsdGVyKSB7XG4gICAgICAgICAgICB0aGlzLmdsLnRleFBhcmFtZXRlcmkodGhpcy50YXJnZXQsIHRoaXMuZ2wuVEVYVFVSRV9NSU5fRklMVEVSLCB0aGlzLm1pbkZpbHRlcik7XG4gICAgICAgICAgICB0aGlzLnN0YXRlLm1pbkZpbHRlciA9IHRoaXMubWluRmlsdGVyO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMubWFnRmlsdGVyICE9PSB0aGlzLnN0YXRlLm1hZ0ZpbHRlcikge1xuICAgICAgICAgICAgdGhpcy5nbC50ZXhQYXJhbWV0ZXJpKHRoaXMudGFyZ2V0LCB0aGlzLmdsLlRFWFRVUkVfTUFHX0ZJTFRFUiwgdGhpcy5tYWdGaWx0ZXIpO1xuICAgICAgICAgICAgdGhpcy5zdGF0ZS5tYWdGaWx0ZXIgPSB0aGlzLm1hZ0ZpbHRlcjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLndyYXBTICE9PSB0aGlzLnN0YXRlLndyYXBTKSB7XG4gICAgICAgICAgICB0aGlzLmdsLnRleFBhcmFtZXRlcmkodGhpcy50YXJnZXQsIHRoaXMuZ2wuVEVYVFVSRV9XUkFQX1MsIHRoaXMud3JhcFMpO1xuICAgICAgICAgICAgdGhpcy5zdGF0ZS53cmFwUyA9IHRoaXMud3JhcFM7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy53cmFwVCAhPT0gdGhpcy5zdGF0ZS53cmFwVCkge1xuICAgICAgICAgICAgdGhpcy5nbC50ZXhQYXJhbWV0ZXJpKHRoaXMudGFyZ2V0LCB0aGlzLmdsLlRFWFRVUkVfV1JBUF9ULCB0aGlzLndyYXBUKTtcbiAgICAgICAgICAgIHRoaXMuc3RhdGUud3JhcFQgPSB0aGlzLndyYXBUO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuYW5pc290cm9weSAmJiB0aGlzLmFuaXNvdHJvcHkgIT09IHRoaXMuc3RhdGUuYW5pc290cm9weSkge1xuICAgICAgICAgICAgdGhpcy5nbC50ZXhQYXJhbWV0ZXJmKFxuICAgICAgICAgICAgICAgIHRoaXMudGFyZ2V0LFxuICAgICAgICAgICAgICAgIHRoaXMuZ2wucmVuZGVyZXIuZ2V0RXh0ZW5zaW9uKCdFWFRfdGV4dHVyZV9maWx0ZXJfYW5pc290cm9waWMnKS5URVhUVVJFX01BWF9BTklTT1RST1BZX0VYVCxcbiAgICAgICAgICAgICAgICB0aGlzLmFuaXNvdHJvcHlcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICB0aGlzLnN0YXRlLmFuaXNvdHJvcHkgPSB0aGlzLmFuaXNvdHJvcHk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5pbWFnZSkge1xuICAgICAgICAgICAgaWYgKHRoaXMuaW1hZ2Uud2lkdGgpIHtcbiAgICAgICAgICAgICAgICB0aGlzLndpZHRoID0gdGhpcy5pbWFnZS53aWR0aDtcbiAgICAgICAgICAgICAgICB0aGlzLmhlaWdodCA9IHRoaXMuaW1hZ2UuaGVpZ2h0O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodGhpcy50YXJnZXQgPT09IHRoaXMuZ2wuVEVYVFVSRV9DVUJFX01BUCkge1xuICAgICAgICAgICAgICAgIC8vIEZvciBjdWJlIG1hcHNcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDY7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmdsLnRleEltYWdlMkQoXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmdsLlRFWFRVUkVfQ1VCRV9NQVBfUE9TSVRJVkVfWCArIGksXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmxldmVsLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbnRlcm5hbEZvcm1hdCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZm9ybWF0LFxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy50eXBlLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbWFnZVtpXVxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAoQXJyYXlCdWZmZXIuaXNWaWV3KHRoaXMuaW1hZ2UpKSB7XG4gICAgICAgICAgICAgICAgLy8gRGF0YSB0ZXh0dXJlXG4gICAgICAgICAgICAgICAgdGhpcy5nbC50ZXhJbWFnZTJEKHRoaXMudGFyZ2V0LCB0aGlzLmxldmVsLCB0aGlzLmludGVybmFsRm9ybWF0LCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCwgMCwgdGhpcy5mb3JtYXQsIHRoaXMudHlwZSwgdGhpcy5pbWFnZSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuaW1hZ2UuaXNDb21wcmVzc2VkVGV4dHVyZSkge1xuICAgICAgICAgICAgICAgIC8vIENvbXByZXNzZWQgdGV4dHVyZVxuICAgICAgICAgICAgICAgIGZvciAobGV0IGxldmVsID0gMDsgbGV2ZWwgPCB0aGlzLmltYWdlLmxlbmd0aDsgbGV2ZWwrKykge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmdsLmNvbXByZXNzZWRUZXhJbWFnZTJEKFxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy50YXJnZXQsXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXZlbCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaW50ZXJuYWxGb3JtYXQsXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmltYWdlW2xldmVsXS53aWR0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaW1hZ2VbbGV2ZWxdLmhlaWdodCxcbiAgICAgICAgICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmltYWdlW2xldmVsXS5kYXRhXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBSZWd1bGFyIHRleHR1cmVcbiAgICAgICAgICAgICAgICB0aGlzLmdsLnRleEltYWdlMkQodGhpcy50YXJnZXQsIHRoaXMubGV2ZWwsIHRoaXMuaW50ZXJuYWxGb3JtYXQsIHRoaXMuZm9ybWF0LCB0aGlzLnR5cGUsIHRoaXMuaW1hZ2UpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodGhpcy5nZW5lcmF0ZU1pcG1hcHMpIHtcbiAgICAgICAgICAgICAgICAvLyBGb3IgV2ViR0wxLCBpZiBub3QgYSBwb3dlciBvZiAyLCB0dXJuIG9mZiBtaXBzLCBzZXQgd3JhcHBpbmcgdG8gY2xhbXAgdG8gZWRnZSBhbmQgbWluRmlsdGVyIHRvIGxpbmVhclxuICAgICAgICAgICAgICAgIGlmICghdGhpcy5nbC5yZW5kZXJlci5pc1dlYmdsMiAmJiAoIWlzUG93ZXJPZjIodGhpcy5pbWFnZS53aWR0aCkgfHwgIWlzUG93ZXJPZjIodGhpcy5pbWFnZS5oZWlnaHQpKSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmdlbmVyYXRlTWlwbWFwcyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLndyYXBTID0gdGhpcy53cmFwVCA9IHRoaXMuZ2wuQ0xBTVBfVE9fRURHRTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5taW5GaWx0ZXIgPSB0aGlzLmdsLkxJTkVBUjtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmdsLmdlbmVyYXRlTWlwbWFwKHRoaXMudGFyZ2V0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIENhbGxiYWNrIGZvciB3aGVuIGRhdGEgaXMgcHVzaGVkIHRvIEdQVVxuICAgICAgICAgICAgdGhpcy5vblVwZGF0ZSAmJiB0aGlzLm9uVXBkYXRlKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAodGhpcy50YXJnZXQgPT09IHRoaXMuZ2wuVEVYVFVSRV9DVUJFX01BUCkge1xuICAgICAgICAgICAgICAgIC8vIFVwbG9hZCBlbXB0eSBwaXhlbCBmb3IgZWFjaCBzaWRlIHdoaWxlIG5vIGltYWdlIHRvIGF2b2lkIGVycm9ycyB3aGlsZSBpbWFnZSBvciB2aWRlbyBsb2FkaW5nXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCA2OyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5nbC50ZXhJbWFnZTJEKFxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5nbC5URVhUVVJFX0NVQkVfTUFQX1BPU0lUSVZFX1ggKyBpLFxuICAgICAgICAgICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZ2wuUkdCQSxcbiAgICAgICAgICAgICAgICAgICAgICAgIDEsXG4gICAgICAgICAgICAgICAgICAgICAgICAxLFxuICAgICAgICAgICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZ2wuUkdCQSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZ2wuVU5TSUdORURfQllURSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVtcHR5UGl4ZWxcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMud2lkdGgpIHtcbiAgICAgICAgICAgICAgICAvLyBpbWFnZSBpbnRlbnRpb25hbGx5IGxlZnQgbnVsbCBmb3IgUmVuZGVyVGFyZ2V0XG4gICAgICAgICAgICAgICAgdGhpcy5nbC50ZXhJbWFnZTJEKHRoaXMudGFyZ2V0LCB0aGlzLmxldmVsLCB0aGlzLmludGVybmFsRm9ybWF0LCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCwgMCwgdGhpcy5mb3JtYXQsIHRoaXMudHlwZSwgbnVsbCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIFVwbG9hZCBlbXB0eSBwaXhlbCBpZiBubyBpbWFnZSB0byBhdm9pZCBlcnJvcnMgd2hpbGUgaW1hZ2Ugb3IgdmlkZW8gbG9hZGluZ1xuICAgICAgICAgICAgICAgIHRoaXMuZ2wudGV4SW1hZ2UyRCh0aGlzLnRhcmdldCwgMCwgdGhpcy5nbC5SR0JBLCAxLCAxLCAwLCB0aGlzLmdsLlJHQkEsIHRoaXMuZ2wuVU5TSUdORURfQllURSwgZW1wdHlQaXhlbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zdG9yZS5pbWFnZSA9IHRoaXMuaW1hZ2U7XG4gICAgfVxuXG4gICAgZGlzcG9zZSgpIHtcbiAgICAgICAgdGhpcy5nbC5kZWxldGVUZXh0dXJlKHRoaXMudGV4dHVyZSk7XG4gICAgICAgIHRoaXMudGV4dHVyZSA9IG51bGw7XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgVmVjMyB9IGZyb20gJy4uL21hdGgvVmVjMy5qcyc7XG5pbXBvcnQgeyBRdWF0IH0gZnJvbSAnLi4vbWF0aC9RdWF0LmpzJztcbmltcG9ydCB7IE1hdDQgfSBmcm9tICcuLi9tYXRoL01hdDQuanMnO1xuaW1wb3J0IHsgRXVsZXIgfSBmcm9tICcuLi9tYXRoL0V1bGVyLmpzJztcblxuZXhwb3J0IGNsYXNzIFRyYW5zZm9ybSB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMucGFyZW50ID0gbnVsbDtcbiAgICAgICAgdGhpcy5jaGlsZHJlbiA9IFtdO1xuICAgICAgICB0aGlzLnZpc2libGUgPSB0cnVlO1xuXG4gICAgICAgIHRoaXMubWF0cml4ID0gbmV3IE1hdDQoKTtcbiAgICAgICAgdGhpcy53b3JsZE1hdHJpeCA9IG5ldyBNYXQ0KCk7XG4gICAgICAgIHRoaXMubWF0cml4QXV0b1VwZGF0ZSA9IHRydWU7XG5cbiAgICAgICAgdGhpcy5wb3NpdGlvbiA9IG5ldyBWZWMzKCk7XG4gICAgICAgIHRoaXMucXVhdGVybmlvbiA9IG5ldyBRdWF0KCk7XG4gICAgICAgIHRoaXMuc2NhbGUgPSBuZXcgVmVjMygxKTtcbiAgICAgICAgdGhpcy5yb3RhdGlvbiA9IG5ldyBFdWxlcigpO1xuICAgICAgICB0aGlzLnVwID0gbmV3IFZlYzMoMCwgMSwgMCk7XG5cbiAgICAgICAgdGhpcy5yb3RhdGlvbi5vbkNoYW5nZSA9ICgpID0+IHRoaXMucXVhdGVybmlvbi5mcm9tRXVsZXIodGhpcy5yb3RhdGlvbik7XG4gICAgICAgIHRoaXMucXVhdGVybmlvbi5vbkNoYW5nZSA9ICgpID0+IHRoaXMucm90YXRpb24uZnJvbVF1YXRlcm5pb24odGhpcy5xdWF0ZXJuaW9uKTtcbiAgICB9XG5cbiAgICBzZXRQYXJlbnQocGFyZW50LCBub3RpZnlQYXJlbnQgPSB0cnVlKSB7XG4gICAgICAgIGlmICh0aGlzLnBhcmVudCAmJiBwYXJlbnQgIT09IHRoaXMucGFyZW50KSB0aGlzLnBhcmVudC5yZW1vdmVDaGlsZCh0aGlzLCBmYWxzZSk7XG4gICAgICAgIHRoaXMucGFyZW50ID0gcGFyZW50O1xuICAgICAgICBpZiAobm90aWZ5UGFyZW50ICYmIHBhcmVudCkgcGFyZW50LmFkZENoaWxkKHRoaXMsIGZhbHNlKTtcbiAgICB9XG5cbiAgICBhZGRDaGlsZChjaGlsZCwgbm90aWZ5Q2hpbGQgPSB0cnVlKSB7XG4gICAgICAgIGlmICghfnRoaXMuY2hpbGRyZW4uaW5kZXhPZihjaGlsZCkpIHRoaXMuY2hpbGRyZW4ucHVzaChjaGlsZCk7XG4gICAgICAgIGlmIChub3RpZnlDaGlsZCkgY2hpbGQuc2V0UGFyZW50KHRoaXMsIGZhbHNlKTtcbiAgICB9XG5cbiAgICByZW1vdmVDaGlsZChjaGlsZCwgbm90aWZ5Q2hpbGQgPSB0cnVlKSB7XG4gICAgICAgIGlmICghIX50aGlzLmNoaWxkcmVuLmluZGV4T2YoY2hpbGQpKSB0aGlzLmNoaWxkcmVuLnNwbGljZSh0aGlzLmNoaWxkcmVuLmluZGV4T2YoY2hpbGQpLCAxKTtcbiAgICAgICAgaWYgKG5vdGlmeUNoaWxkKSBjaGlsZC5zZXRQYXJlbnQobnVsbCwgZmFsc2UpO1xuICAgIH1cblxuICAgIHVwZGF0ZU1hdHJpeFdvcmxkKGZvcmNlKSB7XG4gICAgICAgIGlmICh0aGlzLm1hdHJpeEF1dG9VcGRhdGUpIHRoaXMudXBkYXRlTWF0cml4KCk7XG4gICAgICAgIGlmICh0aGlzLndvcmxkTWF0cml4TmVlZHNVcGRhdGUgfHwgZm9yY2UpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnBhcmVudCA9PT0gbnVsbCkgdGhpcy53b3JsZE1hdHJpeC5jb3B5KHRoaXMubWF0cml4KTtcbiAgICAgICAgICAgIGVsc2UgdGhpcy53b3JsZE1hdHJpeC5tdWx0aXBseSh0aGlzLnBhcmVudC53b3JsZE1hdHJpeCwgdGhpcy5tYXRyaXgpO1xuICAgICAgICAgICAgdGhpcy53b3JsZE1hdHJpeE5lZWRzVXBkYXRlID0gZmFsc2U7XG4gICAgICAgICAgICBmb3JjZSA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKGxldCBpID0gMCwgbCA9IHRoaXMuY2hpbGRyZW4ubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgICAgICB0aGlzLmNoaWxkcmVuW2ldLnVwZGF0ZU1hdHJpeFdvcmxkKGZvcmNlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHVwZGF0ZU1hdHJpeCgpIHtcbiAgICAgICAgdGhpcy5tYXRyaXguY29tcG9zZSh0aGlzLnF1YXRlcm5pb24sIHRoaXMucG9zaXRpb24sIHRoaXMuc2NhbGUpO1xuICAgICAgICB0aGlzLndvcmxkTWF0cml4TmVlZHNVcGRhdGUgPSB0cnVlO1xuICAgIH1cblxuICAgIHRyYXZlcnNlKGNhbGxiYWNrKSB7XG4gICAgICAgIC8vIFJldHVybiB0cnVlIGluIGNhbGxiYWNrIHRvIHN0b3AgdHJhdmVyc2luZyBjaGlsZHJlblxuICAgICAgICBpZiAoY2FsbGJhY2sodGhpcykpIHJldHVybjtcbiAgICAgICAgZm9yIChsZXQgaSA9IDAsIGwgPSB0aGlzLmNoaWxkcmVuLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICAgICAgdGhpcy5jaGlsZHJlbltpXS50cmF2ZXJzZShjYWxsYmFjayk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBkZWNvbXBvc2UoKSB7XG4gICAgICAgIHRoaXMubWF0cml4LmdldFRyYW5zbGF0aW9uKHRoaXMucG9zaXRpb24pO1xuICAgICAgICB0aGlzLm1hdHJpeC5nZXRSb3RhdGlvbih0aGlzLnF1YXRlcm5pb24pO1xuICAgICAgICB0aGlzLm1hdHJpeC5nZXRTY2FsaW5nKHRoaXMuc2NhbGUpO1xuICAgICAgICB0aGlzLnJvdGF0aW9uLmZyb21RdWF0ZXJuaW9uKHRoaXMucXVhdGVybmlvbik7XG4gICAgfVxuXG4gICAgbG9va0F0KHRhcmdldCwgaW52ZXJ0ID0gZmFsc2UpIHtcbiAgICAgICAgaWYgKGludmVydCkgdGhpcy5tYXRyaXgubG9va0F0KHRoaXMucG9zaXRpb24sIHRhcmdldCwgdGhpcy51cCk7XG4gICAgICAgIGVsc2UgdGhpcy5tYXRyaXgubG9va0F0KHRhcmdldCwgdGhpcy5wb3NpdGlvbiwgdGhpcy51cCk7XG4gICAgICAgIHRoaXMubWF0cml4LmdldFJvdGF0aW9uKHRoaXMucXVhdGVybmlvbik7XG4gICAgICAgIHRoaXMucm90YXRpb24uZnJvbVF1YXRlcm5pb24odGhpcy5xdWF0ZXJuaW9uKTtcbiAgICB9XG59XG4iLCJpbXBvcnQgeyBWZWMzIH0gZnJvbSAnLi4vbWF0aC9WZWMzLmpzJztcbmltcG9ydCB7IFF1YXQgfSBmcm9tICcuLi9tYXRoL1F1YXQuanMnO1xuXG5jb25zdCBwcmV2UG9zID0gbmV3IFZlYzMoKTtcbmNvbnN0IHByZXZSb3QgPSBuZXcgUXVhdCgpO1xuY29uc3QgcHJldlNjbCA9IG5ldyBWZWMzKCk7XG5cbmNvbnN0IG5leHRQb3MgPSBuZXcgVmVjMygpO1xuY29uc3QgbmV4dFJvdCA9IG5ldyBRdWF0KCk7XG5jb25zdCBuZXh0U2NsID0gbmV3IFZlYzMoKTtcblxuZXhwb3J0IGNsYXNzIEFuaW1hdGlvbiB7XG4gICAgY29uc3RydWN0b3IoeyBvYmplY3RzLCBkYXRhIH0pIHtcbiAgICAgICAgdGhpcy5vYmplY3RzID0gb2JqZWN0cztcbiAgICAgICAgdGhpcy5kYXRhID0gZGF0YTtcbiAgICAgICAgdGhpcy5lbGFwc2VkID0gMDtcbiAgICAgICAgdGhpcy53ZWlnaHQgPSAxO1xuICAgICAgICB0aGlzLmR1cmF0aW9uID0gZGF0YS5mcmFtZXMubGVuZ3RoIC0gMTtcbiAgICB9XG5cbiAgICB1cGRhdGUodG90YWxXZWlnaHQgPSAxLCBpc1NldCkge1xuICAgICAgICBjb25zdCB3ZWlnaHQgPSBpc1NldCA/IDEgOiB0aGlzLndlaWdodCAvIHRvdGFsV2VpZ2h0O1xuICAgICAgICBjb25zdCBlbGFwc2VkID0gdGhpcy5lbGFwc2VkICUgdGhpcy5kdXJhdGlvbjtcblxuICAgICAgICBjb25zdCBmbG9vckZyYW1lID0gTWF0aC5mbG9vcihlbGFwc2VkKTtcbiAgICAgICAgY29uc3QgYmxlbmQgPSBlbGFwc2VkIC0gZmxvb3JGcmFtZTtcbiAgICAgICAgY29uc3QgcHJldktleSA9IHRoaXMuZGF0YS5mcmFtZXNbZmxvb3JGcmFtZV07XG4gICAgICAgIGNvbnN0IG5leHRLZXkgPSB0aGlzLmRhdGEuZnJhbWVzWyhmbG9vckZyYW1lICsgMSkgJSB0aGlzLmR1cmF0aW9uXTtcblxuICAgICAgICB0aGlzLm9iamVjdHMuZm9yRWFjaCgob2JqZWN0LCBpKSA9PiB7XG4gICAgICAgICAgICBwcmV2UG9zLmZyb21BcnJheShwcmV2S2V5LnBvc2l0aW9uLCBpICogMyk7XG4gICAgICAgICAgICBwcmV2Um90LmZyb21BcnJheShwcmV2S2V5LnF1YXRlcm5pb24sIGkgKiA0KTtcbiAgICAgICAgICAgIHByZXZTY2wuZnJvbUFycmF5KHByZXZLZXkuc2NhbGUsIGkgKiAzKTtcblxuICAgICAgICAgICAgbmV4dFBvcy5mcm9tQXJyYXkobmV4dEtleS5wb3NpdGlvbiwgaSAqIDMpO1xuICAgICAgICAgICAgbmV4dFJvdC5mcm9tQXJyYXkobmV4dEtleS5xdWF0ZXJuaW9uLCBpICogNCk7XG4gICAgICAgICAgICBuZXh0U2NsLmZyb21BcnJheShuZXh0S2V5LnNjYWxlLCBpICogMyk7XG5cbiAgICAgICAgICAgIHByZXZQb3MubGVycChuZXh0UG9zLCBibGVuZCk7XG4gICAgICAgICAgICBwcmV2Um90LnNsZXJwKG5leHRSb3QsIGJsZW5kKTtcbiAgICAgICAgICAgIHByZXZTY2wubGVycChuZXh0U2NsLCBibGVuZCk7XG5cbiAgICAgICAgICAgIG9iamVjdC5wb3NpdGlvbi5sZXJwKHByZXZQb3MsIHdlaWdodCk7XG4gICAgICAgICAgICBvYmplY3QucXVhdGVybmlvbi5zbGVycChwcmV2Um90LCB3ZWlnaHQpO1xuICAgICAgICAgICAgb2JqZWN0LnNjYWxlLmxlcnAocHJldlNjbCwgd2VpZ2h0KTtcbiAgICAgICAgfSk7XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgR2VvbWV0cnkgfSBmcm9tICcuLi9jb3JlL0dlb21ldHJ5LmpzJztcbmltcG9ydCB7IFBsYW5lIH0gZnJvbSAnLi9QbGFuZS5qcyc7XG5cbmV4cG9ydCBjbGFzcyBCb3ggZXh0ZW5kcyBHZW9tZXRyeSB7XG4gICAgY29uc3RydWN0b3IoZ2wsIHsgd2lkdGggPSAxLCBoZWlnaHQgPSAxLCBkZXB0aCA9IDEsIHdpZHRoU2VnbWVudHMgPSAxLCBoZWlnaHRTZWdtZW50cyA9IDEsIGRlcHRoU2VnbWVudHMgPSAxLCBhdHRyaWJ1dGVzID0ge30gfSA9IHt9KSB7XG4gICAgICAgIGNvbnN0IHdTZWdzID0gd2lkdGhTZWdtZW50cztcbiAgICAgICAgY29uc3QgaFNlZ3MgPSBoZWlnaHRTZWdtZW50cztcbiAgICAgICAgY29uc3QgZFNlZ3MgPSBkZXB0aFNlZ21lbnRzO1xuXG4gICAgICAgIGNvbnN0IG51bSA9ICh3U2VncyArIDEpICogKGhTZWdzICsgMSkgKiAyICsgKHdTZWdzICsgMSkgKiAoZFNlZ3MgKyAxKSAqIDIgKyAoaFNlZ3MgKyAxKSAqIChkU2VncyArIDEpICogMjtcbiAgICAgICAgY29uc3QgbnVtSW5kaWNlcyA9ICh3U2VncyAqIGhTZWdzICogMiArIHdTZWdzICogZFNlZ3MgKiAyICsgaFNlZ3MgKiBkU2VncyAqIDIpICogNjtcblxuICAgICAgICBjb25zdCBwb3NpdGlvbiA9IG5ldyBGbG9hdDMyQXJyYXkobnVtICogMyk7XG4gICAgICAgIGNvbnN0IG5vcm1hbCA9IG5ldyBGbG9hdDMyQXJyYXkobnVtICogMyk7XG4gICAgICAgIGNvbnN0IHV2ID0gbmV3IEZsb2F0MzJBcnJheShudW0gKiAyKTtcbiAgICAgICAgY29uc3QgaW5kZXggPSBudW0gPiA2NTUzNiA/IG5ldyBVaW50MzJBcnJheShudW1JbmRpY2VzKSA6IG5ldyBVaW50MTZBcnJheShudW1JbmRpY2VzKTtcblxuICAgICAgICBsZXQgaSA9IDA7XG4gICAgICAgIGxldCBpaSA9IDA7XG5cbiAgICAgICAgLy8gbGVmdCwgcmlnaHRcbiAgICAgICAgUGxhbmUuYnVpbGRQbGFuZShwb3NpdGlvbiwgbm9ybWFsLCB1diwgaW5kZXgsIGRlcHRoLCBoZWlnaHQsIHdpZHRoLCBkU2VncywgaFNlZ3MsIDIsIDEsIDAsIC0xLCAtMSwgaSwgaWkpO1xuICAgICAgICBQbGFuZS5idWlsZFBsYW5lKFxuICAgICAgICAgICAgcG9zaXRpb24sXG4gICAgICAgICAgICBub3JtYWwsXG4gICAgICAgICAgICB1dixcbiAgICAgICAgICAgIGluZGV4LFxuICAgICAgICAgICAgZGVwdGgsXG4gICAgICAgICAgICBoZWlnaHQsXG4gICAgICAgICAgICAtd2lkdGgsXG4gICAgICAgICAgICBkU2VncyxcbiAgICAgICAgICAgIGhTZWdzLFxuICAgICAgICAgICAgMixcbiAgICAgICAgICAgIDEsXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgMSxcbiAgICAgICAgICAgIC0xLFxuICAgICAgICAgICAgKGkgKz0gKGRTZWdzICsgMSkgKiAoaFNlZ3MgKyAxKSksXG4gICAgICAgICAgICAoaWkgKz0gZFNlZ3MgKiBoU2VncylcbiAgICAgICAgKTtcblxuICAgICAgICAvLyB0b3AsIGJvdHRvbVxuICAgICAgICBQbGFuZS5idWlsZFBsYW5lKFxuICAgICAgICAgICAgcG9zaXRpb24sXG4gICAgICAgICAgICBub3JtYWwsXG4gICAgICAgICAgICB1dixcbiAgICAgICAgICAgIGluZGV4LFxuICAgICAgICAgICAgd2lkdGgsXG4gICAgICAgICAgICBkZXB0aCxcbiAgICAgICAgICAgIGhlaWdodCxcbiAgICAgICAgICAgIGRTZWdzLFxuICAgICAgICAgICAgaFNlZ3MsXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgMixcbiAgICAgICAgICAgIDEsXG4gICAgICAgICAgICAxLFxuICAgICAgICAgICAgMSxcbiAgICAgICAgICAgIChpICs9IChkU2VncyArIDEpICogKGhTZWdzICsgMSkpLFxuICAgICAgICAgICAgKGlpICs9IGRTZWdzICogaFNlZ3MpXG4gICAgICAgICk7XG4gICAgICAgIFBsYW5lLmJ1aWxkUGxhbmUoXG4gICAgICAgICAgICBwb3NpdGlvbixcbiAgICAgICAgICAgIG5vcm1hbCxcbiAgICAgICAgICAgIHV2LFxuICAgICAgICAgICAgaW5kZXgsXG4gICAgICAgICAgICB3aWR0aCxcbiAgICAgICAgICAgIGRlcHRoLFxuICAgICAgICAgICAgLWhlaWdodCxcbiAgICAgICAgICAgIGRTZWdzLFxuICAgICAgICAgICAgaFNlZ3MsXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgMixcbiAgICAgICAgICAgIDEsXG4gICAgICAgICAgICAxLFxuICAgICAgICAgICAgLTEsXG4gICAgICAgICAgICAoaSArPSAod1NlZ3MgKyAxKSAqIChkU2VncyArIDEpKSxcbiAgICAgICAgICAgIChpaSArPSB3U2VncyAqIGRTZWdzKVxuICAgICAgICApO1xuXG4gICAgICAgIC8vIGZyb250LCBiYWNrXG4gICAgICAgIFBsYW5lLmJ1aWxkUGxhbmUoXG4gICAgICAgICAgICBwb3NpdGlvbixcbiAgICAgICAgICAgIG5vcm1hbCxcbiAgICAgICAgICAgIHV2LFxuICAgICAgICAgICAgaW5kZXgsXG4gICAgICAgICAgICB3aWR0aCxcbiAgICAgICAgICAgIGhlaWdodCxcbiAgICAgICAgICAgIC1kZXB0aCxcbiAgICAgICAgICAgIHdTZWdzLFxuICAgICAgICAgICAgaFNlZ3MsXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgMSxcbiAgICAgICAgICAgIDIsXG4gICAgICAgICAgICAtMSxcbiAgICAgICAgICAgIC0xLFxuICAgICAgICAgICAgKGkgKz0gKHdTZWdzICsgMSkgKiAoZFNlZ3MgKyAxKSksXG4gICAgICAgICAgICAoaWkgKz0gd1NlZ3MgKiBkU2VncylcbiAgICAgICAgKTtcbiAgICAgICAgUGxhbmUuYnVpbGRQbGFuZShcbiAgICAgICAgICAgIHBvc2l0aW9uLFxuICAgICAgICAgICAgbm9ybWFsLFxuICAgICAgICAgICAgdXYsXG4gICAgICAgICAgICBpbmRleCxcbiAgICAgICAgICAgIHdpZHRoLFxuICAgICAgICAgICAgaGVpZ2h0LFxuICAgICAgICAgICAgZGVwdGgsXG4gICAgICAgICAgICB3U2VncyxcbiAgICAgICAgICAgIGhTZWdzLFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDEsXG4gICAgICAgICAgICAyLFxuICAgICAgICAgICAgMSxcbiAgICAgICAgICAgIC0xLFxuICAgICAgICAgICAgKGkgKz0gKHdTZWdzICsgMSkgKiAoaFNlZ3MgKyAxKSksXG4gICAgICAgICAgICAoaWkgKz0gd1NlZ3MgKiBoU2VncylcbiAgICAgICAgKTtcblxuICAgICAgICBPYmplY3QuYXNzaWduKGF0dHJpYnV0ZXMsIHtcbiAgICAgICAgICAgIHBvc2l0aW9uOiB7IHNpemU6IDMsIGRhdGE6IHBvc2l0aW9uIH0sXG4gICAgICAgICAgICBub3JtYWw6IHsgc2l6ZTogMywgZGF0YTogbm9ybWFsIH0sXG4gICAgICAgICAgICB1djogeyBzaXplOiAyLCBkYXRhOiB1diB9LFxuICAgICAgICAgICAgaW5kZXg6IHsgZGF0YTogaW5kZXggfSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgc3VwZXIoZ2wsIGF0dHJpYnV0ZXMpO1xuICAgIH1cbn1cbiIsImltcG9ydCB7IFZlYzMgfSBmcm9tICcuLi9tYXRoL1ZlYzMuanMnO1xuXG5jb25zdCBDQVRNVUxMUk9NID0gJ2NhdG11bGxyb20nO1xuY29uc3QgQ1VCSUNCRVpJRVIgPSAnY3ViaWNiZXppZXInO1xuY29uc3QgUVVBRFJBVElDQkVaSUVSID0gJ3F1YWRyYXRpY2Jlemllcic7XG5cbi8vIHRlbXBcbmNvbnN0IF9hMCA9IG5ldyBWZWMzKCksXG4gICAgX2ExID0gbmV3IFZlYzMoKSxcbiAgICBfYTIgPSBuZXcgVmVjMygpLFxuICAgIF9hMyA9IG5ldyBWZWMzKCk7XG5cbi8qKlxuICogR2V0IHRoZSBjb250cm9sIHBvaW50cyBvZiBjdWJpYyBiZXppZXIgY3VydmUuXG4gKiBAcGFyYW0geyp9IGlcbiAqIEBwYXJhbSB7Kn0gYVxuICogQHBhcmFtIHsqfSBiXG4gKi9cbmZ1bmN0aW9uIGdldEN0cmxQb2ludChwb2ludHMsIGksIGEgPSAwLjE2OCwgYiA9IDAuMTY4KSB7XG4gICAgaWYgKGkgPCAxKSB7XG4gICAgICAgIF9hMC5zdWIocG9pbnRzWzFdLCBwb2ludHNbMF0pLnNjYWxlKGEpLmFkZChwb2ludHNbMF0pO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIF9hMC5zdWIocG9pbnRzW2kgKyAxXSwgcG9pbnRzW2kgLSAxXSlcbiAgICAgICAgICAgIC5zY2FsZShhKVxuICAgICAgICAgICAgLmFkZChwb2ludHNbaV0pO1xuICAgIH1cbiAgICBpZiAoaSA+IHBvaW50cy5sZW5ndGggLSAzKSB7XG4gICAgICAgIGNvbnN0IGxhc3QgPSBwb2ludHMubGVuZ3RoIC0gMTtcbiAgICAgICAgX2ExLnN1Yihwb2ludHNbbGFzdCAtIDFdLCBwb2ludHNbbGFzdF0pXG4gICAgICAgICAgICAuc2NhbGUoYilcbiAgICAgICAgICAgIC5hZGQocG9pbnRzW2xhc3RdKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBfYTEuc3ViKHBvaW50c1tpXSwgcG9pbnRzW2kgKyAyXSlcbiAgICAgICAgICAgIC5zY2FsZShiKVxuICAgICAgICAgICAgLmFkZChwb2ludHNbaSArIDFdKTtcbiAgICB9XG4gICAgcmV0dXJuIFtfYTAuY2xvbmUoKSwgX2ExLmNsb25lKCldO1xufVxuXG5mdW5jdGlvbiBnZXRRdWFkcmF0aWNCZXppZXJQb2ludCh0LCBwMCwgYzAsIHAxKSB7XG4gICAgY29uc3QgayA9IDEgLSB0O1xuICAgIF9hMC5jb3B5KHAwKS5zY2FsZShrICoqIDIpO1xuICAgIF9hMS5jb3B5KGMwKS5zY2FsZSgyICogayAqIHQpO1xuICAgIF9hMi5jb3B5KHAxKS5zY2FsZSh0ICoqIDIpO1xuICAgIGNvbnN0IHJldCA9IG5ldyBWZWMzKCk7XG4gICAgcmV0LmFkZChfYTAsIF9hMSkuYWRkKF9hMik7XG4gICAgcmV0dXJuIHJldDtcbn1cblxuZnVuY3Rpb24gZ2V0Q3ViaWNCZXppZXJQb2ludCh0LCBwMCwgYzAsIGMxLCBwMSkge1xuICAgIGNvbnN0IGsgPSAxIC0gdDtcbiAgICBfYTAuY29weShwMCkuc2NhbGUoayAqKiAzKTtcbiAgICBfYTEuY29weShjMCkuc2NhbGUoMyAqIGsgKiogMiAqIHQpO1xuICAgIF9hMi5jb3B5KGMxKS5zY2FsZSgzICogayAqIHQgKiogMik7XG4gICAgX2EzLmNvcHkocDEpLnNjYWxlKHQgKiogMyk7XG4gICAgY29uc3QgcmV0ID0gbmV3IFZlYzMoKTtcbiAgICByZXQuYWRkKF9hMCwgX2ExKS5hZGQoX2EyKS5hZGQoX2EzKTtcbiAgICByZXR1cm4gcmV0O1xufVxuXG5leHBvcnQgY2xhc3MgQ3VydmUge1xuICAgIGNvbnN0cnVjdG9yKHsgcG9pbnRzID0gW25ldyBWZWMzKDAsIDAsIDApLCBuZXcgVmVjMygwLCAxLCAwKSwgbmV3IFZlYzMoMSwgMSwgMCksIG5ldyBWZWMzKDEsIDAsIDApXSwgZGl2aXNpb25zID0gMTIsIHR5cGUgPSBDQVRNVUxMUk9NIH0gPSB7fSkge1xuICAgICAgICB0aGlzLnBvaW50cyA9IHBvaW50cztcbiAgICAgICAgdGhpcy5kaXZpc2lvbnMgPSBkaXZpc2lvbnM7XG4gICAgICAgIHRoaXMudHlwZSA9IHR5cGU7XG4gICAgfVxuXG4gICAgX2dldFF1YWRyYXRpY0JlemllclBvaW50cyhkaXZpc2lvbnMgPSB0aGlzLmRpdmlzaW9ucykge1xuICAgICAgICBjb25zdCBwb2ludHMgPSBbXTtcbiAgICAgICAgY29uc3QgY291bnQgPSB0aGlzLnBvaW50cy5sZW5ndGg7XG5cbiAgICAgICAgaWYgKGNvdW50IDwgMykge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKCdOb3QgZW5vdWdoIHBvaW50cyBwcm92aWRlZC4nKTtcbiAgICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHAwID0gdGhpcy5wb2ludHNbMF07XG4gICAgICAgIGxldCBjMCA9IHRoaXMucG9pbnRzWzFdLFxuICAgICAgICAgICAgcDEgPSB0aGlzLnBvaW50c1syXTtcblxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8PSBkaXZpc2lvbnM7IGkrKykge1xuICAgICAgICAgICAgY29uc3QgcCA9IGdldFF1YWRyYXRpY0JlemllclBvaW50KGkgLyBkaXZpc2lvbnMsIHAwLCBjMCwgcDEpO1xuICAgICAgICAgICAgcG9pbnRzLnB1c2gocCk7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgb2Zmc2V0ID0gMztcbiAgICAgICAgd2hpbGUgKGNvdW50IC0gb2Zmc2V0ID4gMCkge1xuICAgICAgICAgICAgcDAuY29weShwMSk7XG4gICAgICAgICAgICBjMCA9IHAxLnNjYWxlKDIpLnN1YihjMCk7XG4gICAgICAgICAgICBwMSA9IHRoaXMucG9pbnRzW29mZnNldF07XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMTsgaSA8PSBkaXZpc2lvbnM7IGkrKykge1xuICAgICAgICAgICAgICAgIGNvbnN0IHAgPSBnZXRRdWFkcmF0aWNCZXppZXJQb2ludChpIC8gZGl2aXNpb25zLCBwMCwgYzAsIHAxKTtcbiAgICAgICAgICAgICAgICBwb2ludHMucHVzaChwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG9mZnNldCsrO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHBvaW50cztcbiAgICB9XG5cbiAgICBfZ2V0Q3ViaWNCZXppZXJQb2ludHMoZGl2aXNpb25zID0gdGhpcy5kaXZpc2lvbnMpIHtcbiAgICAgICAgY29uc3QgcG9pbnRzID0gW107XG4gICAgICAgIGNvbnN0IGNvdW50ID0gdGhpcy5wb2ludHMubGVuZ3RoO1xuXG4gICAgICAgIGlmIChjb3VudCA8IDQpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybignTm90IGVub3VnaCBwb2ludHMgcHJvdmlkZWQuJyk7XG4gICAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgcDAgPSB0aGlzLnBvaW50c1swXSxcbiAgICAgICAgICAgIGMwID0gdGhpcy5wb2ludHNbMV0sXG4gICAgICAgICAgICBjMSA9IHRoaXMucG9pbnRzWzJdLFxuICAgICAgICAgICAgcDEgPSB0aGlzLnBvaW50c1szXTtcblxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8PSBkaXZpc2lvbnM7IGkrKykge1xuICAgICAgICAgICAgY29uc3QgcCA9IGdldEN1YmljQmV6aWVyUG9pbnQoaSAvIGRpdmlzaW9ucywgcDAsIGMwLCBjMSwgcDEpO1xuICAgICAgICAgICAgcG9pbnRzLnB1c2gocCk7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgb2Zmc2V0ID0gNDtcbiAgICAgICAgd2hpbGUgKGNvdW50IC0gb2Zmc2V0ID4gMSkge1xuICAgICAgICAgICAgcDAuY29weShwMSk7XG4gICAgICAgICAgICBjMCA9IHAxLnNjYWxlKDIpLnN1YihjMSk7XG4gICAgICAgICAgICBjMSA9IHRoaXMucG9pbnRzW29mZnNldF07XG4gICAgICAgICAgICBwMSA9IHRoaXMucG9pbnRzW29mZnNldCArIDFdO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDE7IGkgPD0gZGl2aXNpb25zOyBpKyspIHtcbiAgICAgICAgICAgICAgICBjb25zdCBwID0gZ2V0Q3ViaWNCZXppZXJQb2ludChpIC8gZGl2aXNpb25zLCBwMCwgYzAsIGMxLCBwMSk7XG4gICAgICAgICAgICAgICAgcG9pbnRzLnB1c2gocCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBvZmZzZXQgKz0gMjtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBwb2ludHM7XG4gICAgfVxuXG4gICAgX2dldENhdG11bGxSb21Qb2ludHMoZGl2aXNpb25zID0gdGhpcy5kaXZpc2lvbnMsIGEgPSAwLjE2OCwgYiA9IDAuMTY4KSB7XG4gICAgICAgIGNvbnN0IHBvaW50cyA9IFtdO1xuICAgICAgICBjb25zdCBjb3VudCA9IHRoaXMucG9pbnRzLmxlbmd0aDtcblxuICAgICAgICBpZiAoY291bnQgPD0gMikge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMucG9pbnRzO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHAwO1xuICAgICAgICB0aGlzLnBvaW50cy5mb3JFYWNoKChwLCBpKSA9PiB7XG4gICAgICAgICAgICBpZiAoaSA9PT0gMCkge1xuICAgICAgICAgICAgICAgIHAwID0gcDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc3QgW2MwLCBjMV0gPSBnZXRDdHJsUG9pbnQodGhpcy5wb2ludHMsIGkgLSAxLCBhLCBiKTtcbiAgICAgICAgICAgICAgICBjb25zdCBjID0gbmV3IEN1cnZlKHtcbiAgICAgICAgICAgICAgICAgICAgcG9pbnRzOiBbcDAsIGMwLCBjMSwgcF0sXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IENVQklDQkVaSUVSLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHBvaW50cy5wb3AoKTtcbiAgICAgICAgICAgICAgICBwb2ludHMucHVzaCguLi5jLmdldFBvaW50cyhkaXZpc2lvbnMpKTtcbiAgICAgICAgICAgICAgICBwMCA9IHA7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBwb2ludHM7XG4gICAgfVxuXG4gICAgZ2V0UG9pbnRzKGRpdmlzaW9ucyA9IHRoaXMuZGl2aXNpb25zLCBhID0gMC4xNjgsIGIgPSAwLjE2OCkge1xuICAgICAgICBjb25zdCB0eXBlID0gdGhpcy50eXBlO1xuXG4gICAgICAgIGlmICh0eXBlID09PSBRVUFEUkFUSUNCRVpJRVIpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9nZXRRdWFkcmF0aWNCZXppZXJQb2ludHMoZGl2aXNpb25zKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0eXBlID09PSBDVUJJQ0JFWklFUikge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2dldEN1YmljQmV6aWVyUG9pbnRzKGRpdmlzaW9ucyk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodHlwZSA9PT0gQ0FUTVVMTFJPTSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2dldENhdG11bGxSb21Qb2ludHMoZGl2aXNpb25zLCBhLCBiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzLnBvaW50cztcbiAgICB9XG59XG5cbkN1cnZlLkNBVE1VTExST00gPSBDQVRNVUxMUk9NO1xuQ3VydmUuQ1VCSUNCRVpJRVIgPSBDVUJJQ0JFWklFUjtcbkN1cnZlLlFVQURSQVRJQ0JFWklFUiA9IFFVQURSQVRJQ0JFWklFUjtcbiIsImltcG9ydCB7IEdlb21ldHJ5IH0gZnJvbSAnLi4vY29yZS9HZW9tZXRyeS5qcyc7XG5pbXBvcnQgeyBWZWMzIH0gZnJvbSAnLi4vbWF0aC9WZWMzLmpzJztcblxuZXhwb3J0IGNsYXNzIEN5bGluZGVyIGV4dGVuZHMgR2VvbWV0cnkge1xuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICBnbCxcbiAgICAgICAge1xuICAgICAgICAgICAgcmFkaXVzVG9wID0gMC41LFxuICAgICAgICAgICAgcmFkaXVzQm90dG9tID0gMC41LFxuICAgICAgICAgICAgaGVpZ2h0ID0gMSxcbiAgICAgICAgICAgIHJhZGlhbFNlZ21lbnRzID0gOCxcbiAgICAgICAgICAgIGhlaWdodFNlZ21lbnRzID0gMSxcbiAgICAgICAgICAgIG9wZW5FbmRlZCA9IGZhbHNlLFxuICAgICAgICAgICAgdGhldGFTdGFydCA9IDAsXG4gICAgICAgICAgICB0aGV0YUxlbmd0aCA9IE1hdGguUEkgKiAyLFxuICAgICAgICAgICAgYXR0cmlidXRlcyA9IHt9LFxuICAgICAgICB9ID0ge31cbiAgICApIHtcbiAgICAgICAgY29uc3QgclNlZ3MgPSByYWRpYWxTZWdtZW50cztcbiAgICAgICAgY29uc3QgaFNlZ3MgPSBoZWlnaHRTZWdtZW50cztcbiAgICAgICAgY29uc3QgdFN0YXJ0ID0gdGhldGFTdGFydDtcbiAgICAgICAgY29uc3QgdExlbmd0aCA9IHRoZXRhTGVuZ3RoO1xuXG4gICAgICAgIGNvbnN0IG51bUNhcHMgPSBvcGVuRW5kZWQgPyAwIDogcmFkaXVzQm90dG9tICYmIHJhZGl1c1RvcCA/IDIgOiAxO1xuICAgICAgICBjb25zdCBudW0gPSAoclNlZ3MgKyAxKSAqIChoU2VncyArIDEgKyBudW1DYXBzKSArIG51bUNhcHM7XG4gICAgICAgIGNvbnN0IG51bUluZGljZXMgPSByU2VncyAqIGhTZWdzICogNiArIG51bUNhcHMgKiByU2VncyAqIDM7XG5cbiAgICAgICAgY29uc3QgcG9zaXRpb24gPSBuZXcgRmxvYXQzMkFycmF5KG51bSAqIDMpO1xuICAgICAgICBjb25zdCBub3JtYWwgPSBuZXcgRmxvYXQzMkFycmF5KG51bSAqIDMpO1xuICAgICAgICBjb25zdCB1diA9IG5ldyBGbG9hdDMyQXJyYXkobnVtICogMik7XG4gICAgICAgIGNvbnN0IGluZGV4ID0gbnVtID4gNjU1MzYgPyBuZXcgVWludDMyQXJyYXkobnVtSW5kaWNlcykgOiBuZXcgVWludDE2QXJyYXkobnVtSW5kaWNlcyk7XG5cbiAgICAgICAgbGV0IGkgPSAwO1xuICAgICAgICBsZXQgaWkgPSAwO1xuICAgICAgICBjb25zdCBpbmRleEFycmF5ID0gW107XG5cbiAgICAgICAgYWRkSGVpZ2h0KCk7XG4gICAgICAgIGlmICghb3BlbkVuZGVkKSB7XG4gICAgICAgICAgICBpZiAocmFkaXVzVG9wKSBhZGRDYXAodHJ1ZSk7XG4gICAgICAgICAgICBpZiAocmFkaXVzQm90dG9tKSBhZGRDYXAoZmFsc2UpO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gYWRkSGVpZ2h0KCkge1xuICAgICAgICAgICAgbGV0IHgsIHk7XG4gICAgICAgICAgICBjb25zdCBuID0gbmV3IFZlYzMoKTtcbiAgICAgICAgICAgIGNvbnN0IHNsb3BlID0gKHJhZGl1c0JvdHRvbSAtIHJhZGl1c1RvcCkgLyBoZWlnaHQ7XG5cbiAgICAgICAgICAgIGZvciAoeSA9IDA7IHkgPD0gaFNlZ3M7IHkrKykge1xuICAgICAgICAgICAgICAgIGNvbnN0IGluZGV4Um93ID0gW107XG4gICAgICAgICAgICAgICAgY29uc3QgdiA9IHkgLyBoU2VncztcblxuICAgICAgICAgICAgICAgIGNvbnN0IHIgPSB2ICogKHJhZGl1c0JvdHRvbSAtIHJhZGl1c1RvcCkgKyByYWRpdXNUb3A7XG4gICAgICAgICAgICAgICAgZm9yICh4ID0gMDsgeCA8PSByU2VnczsgeCsrKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHUgPSB4IC8gclNlZ3M7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHRoZXRhID0gdSAqIHRMZW5ndGggKyB0U3RhcnQ7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHNpblRoZXRhID0gTWF0aC5zaW4odGhldGEpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBjb3NUaGV0YSA9IE1hdGguY29zKHRoZXRhKTtcblxuICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbi5zZXQoW3IgKiBzaW5UaGV0YSwgKDAuNSAtIHYpICogaGVpZ2h0LCByICogY29zVGhldGFdLCBpICogMyk7XG4gICAgICAgICAgICAgICAgICAgIG4uc2V0KHNpblRoZXRhLCBzbG9wZSwgY29zVGhldGEpLm5vcm1hbGl6ZSgpO1xuICAgICAgICAgICAgICAgICAgICBub3JtYWwuc2V0KFtuLngsIG4ueSwgbi56XSwgaSAqIDMpO1xuICAgICAgICAgICAgICAgICAgICB1di5zZXQoW3UsIDEgLSB2XSwgaSAqIDIpO1xuICAgICAgICAgICAgICAgICAgICBpbmRleFJvdy5wdXNoKGkrKyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGluZGV4QXJyYXkucHVzaChpbmRleFJvdyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZvciAoeCA9IDA7IHggPCByU2VnczsgeCsrKSB7XG4gICAgICAgICAgICAgICAgZm9yICh5ID0gMDsgeSA8IGhTZWdzOyB5KyspIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgYSA9IGluZGV4QXJyYXlbeV1beF07XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGIgPSBpbmRleEFycmF5W3kgKyAxXVt4XTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgYyA9IGluZGV4QXJyYXlbeSArIDFdW3ggKyAxXTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZCA9IGluZGV4QXJyYXlbeV1beCArIDFdO1xuXG4gICAgICAgICAgICAgICAgICAgIGluZGV4LnNldChbYSwgYiwgZCwgYiwgYywgZF0sIGlpICogMyk7XG4gICAgICAgICAgICAgICAgICAgIGlpICs9IDI7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gYWRkQ2FwKGlzVG9wKSB7XG4gICAgICAgICAgICBsZXQgeDtcbiAgICAgICAgICAgIGNvbnN0IHIgPSBpc1RvcCA9PT0gdHJ1ZSA/IHJhZGl1c1RvcCA6IHJhZGl1c0JvdHRvbTtcbiAgICAgICAgICAgIGNvbnN0IHNpZ24gPSBpc1RvcCA9PT0gdHJ1ZSA/IDEgOiAtMTtcblxuICAgICAgICAgICAgY29uc3QgY2VudGVySW5kZXggPSBpO1xuICAgICAgICAgICAgcG9zaXRpb24uc2V0KFswLCAwLjUgKiBoZWlnaHQgKiBzaWduLCAwXSwgaSAqIDMpO1xuICAgICAgICAgICAgbm9ybWFsLnNldChbMCwgc2lnbiwgMF0sIGkgKiAzKTtcbiAgICAgICAgICAgIHV2LnNldChbMC41LCAwLjVdLCBpICogMik7XG4gICAgICAgICAgICBpKys7XG5cbiAgICAgICAgICAgIGZvciAoeCA9IDA7IHggPD0gclNlZ3M7IHgrKykge1xuICAgICAgICAgICAgICAgIGNvbnN0IHUgPSB4IC8gclNlZ3M7XG4gICAgICAgICAgICAgICAgY29uc3QgdGhldGEgPSB1ICogdExlbmd0aCArIHRTdGFydDtcbiAgICAgICAgICAgICAgICBjb25zdCBjb3NUaGV0YSA9IE1hdGguY29zKHRoZXRhKTtcbiAgICAgICAgICAgICAgICBjb25zdCBzaW5UaGV0YSA9IE1hdGguc2luKHRoZXRhKTtcblxuICAgICAgICAgICAgICAgIHBvc2l0aW9uLnNldChbciAqIHNpblRoZXRhLCAwLjUgKiBoZWlnaHQgKiBzaWduLCByICogY29zVGhldGFdLCBpICogMyk7XG4gICAgICAgICAgICAgICAgbm9ybWFsLnNldChbMCwgc2lnbiwgMF0sIGkgKiAzKTtcbiAgICAgICAgICAgICAgICB1di5zZXQoW2Nvc1RoZXRhICogMC41ICsgMC41LCBzaW5UaGV0YSAqIDAuNSAqIHNpZ24gKyAwLjVdLCBpICogMik7XG4gICAgICAgICAgICAgICAgaSsrO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmb3IgKHggPSAwOyB4IDwgclNlZ3M7IHgrKykge1xuICAgICAgICAgICAgICAgIGNvbnN0IGogPSBjZW50ZXJJbmRleCArIHggKyAxO1xuICAgICAgICAgICAgICAgIGlmIChpc1RvcCkge1xuICAgICAgICAgICAgICAgICAgICBpbmRleC5zZXQoW2osIGogKyAxLCBjZW50ZXJJbmRleF0sIGlpICogMyk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaW5kZXguc2V0KFtqICsgMSwgaiwgY2VudGVySW5kZXhdLCBpaSAqIDMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpaSsrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgT2JqZWN0LmFzc2lnbihhdHRyaWJ1dGVzLCB7XG4gICAgICAgICAgICBwb3NpdGlvbjogeyBzaXplOiAzLCBkYXRhOiBwb3NpdGlvbiB9LFxuICAgICAgICAgICAgbm9ybWFsOiB7IHNpemU6IDMsIGRhdGE6IG5vcm1hbCB9LFxuICAgICAgICAgICAgdXY6IHsgc2l6ZTogMiwgZGF0YTogdXYgfSxcbiAgICAgICAgICAgIGluZGV4OiB7IGRhdGE6IGluZGV4IH0sXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHN1cGVyKGdsLCBhdHRyaWJ1dGVzKTtcbiAgICB9XG59XG4iLCJpbXBvcnQgeyBSZW5kZXJUYXJnZXQgfSBmcm9tICcuLi9jb3JlL1JlbmRlclRhcmdldC5qcyc7XG5pbXBvcnQgeyBQcm9ncmFtIH0gZnJvbSAnLi4vY29yZS9Qcm9ncmFtLmpzJztcbmltcG9ydCB7IE1lc2ggfSBmcm9tICcuLi9jb3JlL01lc2guanMnO1xuaW1wb3J0IHsgVmVjMiB9IGZyb20gJy4uL21hdGgvVmVjMi5qcyc7XG5pbXBvcnQgeyBUcmlhbmdsZSB9IGZyb20gJy4vVHJpYW5nbGUuanMnO1xuXG5leHBvcnQgY2xhc3MgRmxvd21hcCB7XG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIGdsLFxuICAgICAgICB7XG4gICAgICAgICAgICBzaXplID0gMTI4LCAvLyBkZWZhdWx0IHNpemUgb2YgdGhlIHJlbmRlciB0YXJnZXRzXG4gICAgICAgICAgICBmYWxsb2ZmID0gMC4zLCAvLyBzaXplIG9mIHRoZSBzdGFtcCwgcGVyY2VudGFnZSBvZiB0aGUgc2l6ZVxuICAgICAgICAgICAgYWxwaGEgPSAxLCAvLyBvcGFjaXR5IG9mIHRoZSBzdGFtcFxuICAgICAgICAgICAgZGlzc2lwYXRpb24gPSAwLjk4LCAvLyBhZmZlY3RzIHRoZSBzcGVlZCB0aGF0IHRoZSBzdGFtcCBmYWRlcy4gQ2xvc2VyIHRvIDEgaXMgc2xvd2VyXG4gICAgICAgICAgICB0eXBlLCAvLyBQYXNzIGluIGdsLkZMT0FUIHRvIGZvcmNlIGl0LCBkZWZhdWx0cyB0byBnbC5IQUxGX0ZMT0FUXG4gICAgICAgIH0gPSB7fVxuICAgICkge1xuICAgICAgICBjb25zdCBfdGhpcyA9IHRoaXM7XG4gICAgICAgIHRoaXMuZ2wgPSBnbDtcblxuICAgICAgICAvLyBvdXRwdXQgdW5pZm9ybSBjb250YWluaW5nIHJlbmRlciB0YXJnZXQgdGV4dHVyZXNcbiAgICAgICAgdGhpcy51bmlmb3JtID0geyB2YWx1ZTogbnVsbCB9O1xuXG4gICAgICAgIHRoaXMubWFzayA9IHtcbiAgICAgICAgICAgIHJlYWQ6IG51bGwsXG4gICAgICAgICAgICB3cml0ZTogbnVsbCxcblxuICAgICAgICAgICAgLy8gSGVscGVyIGZ1bmN0aW9uIHRvIHBpbmcgcG9uZyB0aGUgcmVuZGVyIHRhcmdldHMgYW5kIHVwZGF0ZSB0aGUgdW5pZm9ybVxuICAgICAgICAgICAgc3dhcDogKCkgPT4ge1xuICAgICAgICAgICAgICAgIGxldCB0ZW1wID0gX3RoaXMubWFzay5yZWFkO1xuICAgICAgICAgICAgICAgIF90aGlzLm1hc2sucmVhZCA9IF90aGlzLm1hc2sud3JpdGU7XG4gICAgICAgICAgICAgICAgX3RoaXMubWFzay53cml0ZSA9IHRlbXA7XG4gICAgICAgICAgICAgICAgX3RoaXMudW5pZm9ybS52YWx1ZSA9IF90aGlzLm1hc2sucmVhZC50ZXh0dXJlO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgfTtcblxuICAgICAgICB7XG4gICAgICAgICAgICBjcmVhdGVGQk9zKCk7XG5cbiAgICAgICAgICAgIHRoaXMuYXNwZWN0ID0gMTtcbiAgICAgICAgICAgIHRoaXMubW91c2UgPSBuZXcgVmVjMigpO1xuICAgICAgICAgICAgdGhpcy52ZWxvY2l0eSA9IG5ldyBWZWMyKCk7XG5cbiAgICAgICAgICAgIHRoaXMubWVzaCA9IGluaXRQcm9ncmFtKCk7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBjcmVhdGVGQk9zKCkge1xuICAgICAgICAgICAgLy8gUmVxdWVzdGVkIHR5cGUgbm90IHN1cHBvcnRlZCwgZmFsbCBiYWNrIHRvIGhhbGYgZmxvYXRcbiAgICAgICAgICAgIGlmICghdHlwZSkgdHlwZSA9IGdsLkhBTEZfRkxPQVQgfHwgZ2wucmVuZGVyZXIuZXh0ZW5zaW9uc1snT0VTX3RleHR1cmVfaGFsZl9mbG9hdCddLkhBTEZfRkxPQVRfT0VTO1xuXG4gICAgICAgICAgICBsZXQgbWluRmlsdGVyID0gKCgpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoZ2wucmVuZGVyZXIuaXNXZWJnbDIpIHJldHVybiBnbC5MSU5FQVI7XG4gICAgICAgICAgICAgICAgaWYgKGdsLnJlbmRlcmVyLmV4dGVuc2lvbnNbYE9FU190ZXh0dXJlXyR7dHlwZSA9PT0gZ2wuRkxPQVQgPyAnJyA6ICdoYWxmXyd9ZmxvYXRfbGluZWFyYF0pIHJldHVybiBnbC5MSU5FQVI7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGdsLk5FQVJFU1Q7XG4gICAgICAgICAgICB9KSgpO1xuXG4gICAgICAgICAgICBjb25zdCBvcHRpb25zID0ge1xuICAgICAgICAgICAgICAgIHdpZHRoOiBzaXplLFxuICAgICAgICAgICAgICAgIGhlaWdodDogc2l6ZSxcbiAgICAgICAgICAgICAgICB0eXBlLFxuICAgICAgICAgICAgICAgIGZvcm1hdDogZ2wuUkdCQSxcbiAgICAgICAgICAgICAgICBpbnRlcm5hbEZvcm1hdDogZ2wucmVuZGVyZXIuaXNXZWJnbDIgPyAodHlwZSA9PT0gZ2wuRkxPQVQgPyBnbC5SR0JBMzJGIDogZ2wuUkdCQTE2RikgOiBnbC5SR0JBLFxuICAgICAgICAgICAgICAgIG1pbkZpbHRlcixcbiAgICAgICAgICAgICAgICBkZXB0aDogZmFsc2UsXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBfdGhpcy5tYXNrLnJlYWQgPSBuZXcgUmVuZGVyVGFyZ2V0KGdsLCBvcHRpb25zKTtcbiAgICAgICAgICAgIF90aGlzLm1hc2sud3JpdGUgPSBuZXcgUmVuZGVyVGFyZ2V0KGdsLCBvcHRpb25zKTtcbiAgICAgICAgICAgIF90aGlzLm1hc2suc3dhcCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gaW5pdFByb2dyYW0oKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IE1lc2goZ2wsIHtcbiAgICAgICAgICAgICAgICAvLyBUcmlhbmdsZSB0aGF0IGluY2x1ZGVzIC0xIHRvIDEgcmFuZ2UgZm9yICdwb3NpdGlvbicsIGFuZCAwIHRvIDEgcmFuZ2UgZm9yICd1dicuXG4gICAgICAgICAgICAgICAgZ2VvbWV0cnk6IG5ldyBUcmlhbmdsZShnbCksXG5cbiAgICAgICAgICAgICAgICBwcm9ncmFtOiBuZXcgUHJvZ3JhbShnbCwge1xuICAgICAgICAgICAgICAgICAgICB2ZXJ0ZXgsXG4gICAgICAgICAgICAgICAgICAgIGZyYWdtZW50LFxuICAgICAgICAgICAgICAgICAgICB1bmlmb3Jtczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgdE1hcDogX3RoaXMudW5pZm9ybSxcblxuICAgICAgICAgICAgICAgICAgICAgICAgdUZhbGxvZmY6IHsgdmFsdWU6IGZhbGxvZmYgKiAwLjUgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHVBbHBoYTogeyB2YWx1ZTogYWxwaGEgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHVEaXNzaXBhdGlvbjogeyB2YWx1ZTogZGlzc2lwYXRpb24gfSxcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gVXNlciBuZWVkcyB0byB1cGRhdGUgdGhlc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIHVBc3BlY3Q6IHsgdmFsdWU6IDEgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHVNb3VzZTogeyB2YWx1ZTogX3RoaXMubW91c2UgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHVWZWxvY2l0eTogeyB2YWx1ZTogX3RoaXMudmVsb2NpdHkgfSxcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgZGVwdGhUZXN0OiBmYWxzZSxcbiAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgdXBkYXRlKCkge1xuICAgICAgICB0aGlzLm1lc2gucHJvZ3JhbS51bmlmb3Jtcy51QXNwZWN0LnZhbHVlID0gdGhpcy5hc3BlY3Q7XG5cbiAgICAgICAgdGhpcy5nbC5yZW5kZXJlci5yZW5kZXIoe1xuICAgICAgICAgICAgc2NlbmU6IHRoaXMubWVzaCxcbiAgICAgICAgICAgIHRhcmdldDogdGhpcy5tYXNrLndyaXRlLFxuICAgICAgICAgICAgY2xlYXI6IGZhbHNlLFxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5tYXNrLnN3YXAoKTtcbiAgICB9XG59XG5cbmNvbnN0IHZlcnRleCA9IC8qIGdsc2wgKi8gYFxuICAgIGF0dHJpYnV0ZSB2ZWMyIHV2O1xuICAgIGF0dHJpYnV0ZSB2ZWMyIHBvc2l0aW9uO1xuXG4gICAgdmFyeWluZyB2ZWMyIHZVdjtcblxuICAgIHZvaWQgbWFpbigpIHtcbiAgICAgICAgdlV2ID0gdXY7XG4gICAgICAgIGdsX1Bvc2l0aW9uID0gdmVjNChwb3NpdGlvbiwgMCwgMSk7XG4gICAgfVxuYDtcblxuY29uc3QgZnJhZ21lbnQgPSAvKiBnbHNsICovIGBcbiAgICBwcmVjaXNpb24gaGlnaHAgZmxvYXQ7XG5cbiAgICB1bmlmb3JtIHNhbXBsZXIyRCB0TWFwO1xuXG4gICAgdW5pZm9ybSBmbG9hdCB1RmFsbG9mZjtcbiAgICB1bmlmb3JtIGZsb2F0IHVBbHBoYTtcbiAgICB1bmlmb3JtIGZsb2F0IHVEaXNzaXBhdGlvbjtcbiAgICBcbiAgICB1bmlmb3JtIGZsb2F0IHVBc3BlY3Q7XG4gICAgdW5pZm9ybSB2ZWMyIHVNb3VzZTtcbiAgICB1bmlmb3JtIHZlYzIgdVZlbG9jaXR5O1xuXG4gICAgdmFyeWluZyB2ZWMyIHZVdjtcblxuICAgIHZvaWQgbWFpbigpIHtcbiAgICAgICAgdmVjNCBjb2xvciA9IHRleHR1cmUyRCh0TWFwLCB2VXYpICogdURpc3NpcGF0aW9uO1xuXG4gICAgICAgIHZlYzIgY3Vyc29yID0gdlV2IC0gdU1vdXNlO1xuICAgICAgICBjdXJzb3IueCAqPSB1QXNwZWN0O1xuXG4gICAgICAgIHZlYzMgc3RhbXAgPSB2ZWMzKHVWZWxvY2l0eSAqIHZlYzIoMSwgLTEpLCAxLjAgLSBwb3coMS4wIC0gbWluKDEuMCwgbGVuZ3RoKHVWZWxvY2l0eSkpLCAzLjApKTtcbiAgICAgICAgZmxvYXQgZmFsbG9mZiA9IHNtb290aHN0ZXAodUZhbGxvZmYsIDAuMCwgbGVuZ3RoKGN1cnNvcikpICogdUFscGhhO1xuXG4gICAgICAgIGNvbG9yLnJnYiA9IG1peChjb2xvci5yZ2IsIHN0YW1wLCB2ZWMzKGZhbGxvZmYpKTtcblxuICAgICAgICBnbF9GcmFnQ29sb3IgPSBjb2xvcjtcbiAgICB9XG5gO1xuIiwiaW1wb3J0IHsgVmVjMyB9IGZyb20gJy4uL21hdGgvVmVjMy5qcyc7XG5pbXBvcnQgeyBRdWF0IH0gZnJvbSAnLi4vbWF0aC9RdWF0LmpzJztcblxuY29uc3QgdG1wVmVjM0EgPSBuZXcgVmVjMygpO1xuY29uc3QgdG1wVmVjM0IgPSBuZXcgVmVjMygpO1xuY29uc3QgdG1wVmVjM0MgPSBuZXcgVmVjMygpO1xuY29uc3QgdG1wVmVjM0QgPSBuZXcgVmVjMygpO1xuXG5jb25zdCB0bXBRdWF0QSA9IG5ldyBRdWF0KCk7XG5jb25zdCB0bXBRdWF0QiA9IG5ldyBRdWF0KCk7XG5jb25zdCB0bXBRdWF0QyA9IG5ldyBRdWF0KCk7XG5jb25zdCB0bXBRdWF0RCA9IG5ldyBRdWF0KCk7XG5cbmV4cG9ydCBjbGFzcyBHTFRGQW5pbWF0aW9uIHtcbiAgICBjb25zdHJ1Y3RvcihkYXRhLCB3ZWlnaHQgPSAxKSB7XG4gICAgICAgIHRoaXMuZGF0YSA9IGRhdGE7XG4gICAgICAgIHRoaXMuZWxhcHNlZCA9IDA7XG4gICAgICAgIHRoaXMud2VpZ2h0ID0gd2VpZ2h0O1xuXG4gICAgICAgIC8vIFNldCB0byBmYWxzZSB0byBub3QgYXBwbHkgbW9kdWxvIHRvIGVsYXBzZWQgYWdhaW5zdCBkdXJhdGlvblxuICAgICAgICB0aGlzLmxvb3AgPSB0cnVlO1xuXG4gICAgICAgIC8vIEZpbmQgc3RhcnRpbmcgdGltZSBhcyBleHBvcnRzIGZyb20gYmxlbmRlciAocGVyaGFwcyBvdGhlcnMgdG9vKSBkb24ndCBhbHdheXMgc3RhcnQgZnJvbSAwXG4gICAgICAgIHRoaXMuc3RhcnRUaW1lID0gZGF0YS5yZWR1Y2UoKGEsIHsgdGltZXMgfSkgPT4gTWF0aC5taW4oYSwgdGltZXNbMF0pLCBJbmZpbml0eSk7XG4gICAgICAgIC8vIEdldCBsYXJnZXN0IGZpbmFsIHRpbWUgaW4gYWxsIGNoYW5uZWxzIHRvIGNhbGN1bGF0ZSBkdXJhdGlvblxuICAgICAgICB0aGlzLmVuZFRpbWUgPSBkYXRhLnJlZHVjZSgoYSwgeyB0aW1lcyB9KSA9PiBNYXRoLm1heChhLCB0aW1lc1t0aW1lcy5sZW5ndGggLSAxXSksIDApO1xuICAgICAgICB0aGlzLmR1cmF0aW9uID0gdGhpcy5lbmRUaW1lIC0gdGhpcy5zdGFydFRpbWU7XG4gICAgfVxuXG4gICAgdXBkYXRlKHRvdGFsV2VpZ2h0ID0gMSwgaXNTZXQpIHtcbiAgICAgICAgY29uc3Qgd2VpZ2h0ID0gaXNTZXQgPyAxIDogdGhpcy53ZWlnaHQgLyB0b3RhbFdlaWdodDtcbiAgICAgICAgY29uc3QgZWxhcHNlZCA9ICh0aGlzLmxvb3AgPyB0aGlzLmVsYXBzZWQgJSB0aGlzLmR1cmF0aW9uIDogTWF0aC5taW4odGhpcy5lbGFwc2VkLCB0aGlzLmR1cmF0aW9uIC0gMC4wMDEpKSArIHRoaXMuc3RhcnRUaW1lO1xuXG4gICAgICAgIHRoaXMuZGF0YS5mb3JFYWNoKCh7IG5vZGUsIHRyYW5zZm9ybSwgaW50ZXJwb2xhdGlvbiwgdGltZXMsIHZhbHVlcyB9KSA9PiB7XG4gICAgICAgICAgICAvLyBHZXQgaW5kZXggb2YgdHdvIHRpbWUgdmFsdWVzIGVsYXBzZWQgaXMgYmV0d2VlblxuICAgICAgICAgICAgY29uc3QgcHJldkluZGV4ID1cbiAgICAgICAgICAgICAgICBNYXRoLm1heChcbiAgICAgICAgICAgICAgICAgICAgMSxcbiAgICAgICAgICAgICAgICAgICAgdGltZXMuZmluZEluZGV4KCh0KSA9PiB0ID4gZWxhcHNlZClcbiAgICAgICAgICAgICAgICApIC0gMTtcbiAgICAgICAgICAgIGNvbnN0IG5leHRJbmRleCA9IHByZXZJbmRleCArIDE7XG5cbiAgICAgICAgICAgIC8vIEdldCBsaW5lYXIgYmxlbmQvYWxwaGEgYmV0d2VlbiB0aGUgdHdvXG4gICAgICAgICAgICBsZXQgYWxwaGEgPSAoZWxhcHNlZCAtIHRpbWVzW3ByZXZJbmRleF0pIC8gKHRpbWVzW25leHRJbmRleF0gLSB0aW1lc1twcmV2SW5kZXhdKTtcbiAgICAgICAgICAgIGlmIChpbnRlcnBvbGF0aW9uID09PSAnU1RFUCcpIGFscGhhID0gMDtcblxuICAgICAgICAgICAgbGV0IHByZXZWYWwgPSB0bXBWZWMzQTtcbiAgICAgICAgICAgIGxldCBwcmV2VGFuID0gdG1wVmVjM0I7XG4gICAgICAgICAgICBsZXQgbmV4dFRhbiA9IHRtcFZlYzNDO1xuICAgICAgICAgICAgbGV0IG5leHRWYWwgPSB0bXBWZWMzRDtcbiAgICAgICAgICAgIGxldCBzaXplID0gMztcblxuICAgICAgICAgICAgaWYgKHRyYW5zZm9ybSA9PT0gJ3F1YXRlcm5pb24nKSB7XG4gICAgICAgICAgICAgICAgcHJldlZhbCA9IHRtcFF1YXRBO1xuICAgICAgICAgICAgICAgIHByZXZUYW4gPSB0bXBRdWF0QjtcbiAgICAgICAgICAgICAgICBuZXh0VGFuID0gdG1wUXVhdEM7XG4gICAgICAgICAgICAgICAgbmV4dFZhbCA9IHRtcFF1YXREO1xuICAgICAgICAgICAgICAgIHNpemUgPSA0O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoaW50ZXJwb2xhdGlvbiA9PT0gJ0NVQklDU1BMSU5FJykge1xuICAgICAgICAgICAgICAgIC8vIEdldCB0aGUgcHJldiBhbmQgbmV4dCB2YWx1ZXMgZnJvbSB0aGUgaW5kaWNlc1xuICAgICAgICAgICAgICAgIHByZXZWYWwuZnJvbUFycmF5KHZhbHVlcywgcHJldkluZGV4ICogc2l6ZSAqIDMgKyBzaXplICogMSk7XG4gICAgICAgICAgICAgICAgcHJldlRhbi5mcm9tQXJyYXkodmFsdWVzLCBwcmV2SW5kZXggKiBzaXplICogMyArIHNpemUgKiAyKTtcbiAgICAgICAgICAgICAgICBuZXh0VGFuLmZyb21BcnJheSh2YWx1ZXMsIG5leHRJbmRleCAqIHNpemUgKiAzICsgc2l6ZSAqIDApO1xuICAgICAgICAgICAgICAgIG5leHRWYWwuZnJvbUFycmF5KHZhbHVlcywgbmV4dEluZGV4ICogc2l6ZSAqIDMgKyBzaXplICogMSk7XG5cbiAgICAgICAgICAgICAgICAvLyBpbnRlcnBvbGF0ZSBmb3IgZmluYWwgdmFsdWVcbiAgICAgICAgICAgICAgICBwcmV2VmFsID0gdGhpcy5jdWJpY1NwbGluZUludGVycG9sYXRlKGFscGhhLCBwcmV2VmFsLCBwcmV2VGFuLCBuZXh0VGFuLCBuZXh0VmFsKTtcbiAgICAgICAgICAgICAgICBpZiAoc2l6ZSA9PT0gNCkgcHJldlZhbC5ub3JtYWxpemUoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gR2V0IHRoZSBwcmV2IGFuZCBuZXh0IHZhbHVlcyBmcm9tIHRoZSBpbmRpY2VzXG4gICAgICAgICAgICAgICAgcHJldlZhbC5mcm9tQXJyYXkodmFsdWVzLCBwcmV2SW5kZXggKiBzaXplKTtcbiAgICAgICAgICAgICAgICBuZXh0VmFsLmZyb21BcnJheSh2YWx1ZXMsIG5leHRJbmRleCAqIHNpemUpO1xuXG4gICAgICAgICAgICAgICAgLy8gaW50ZXJwb2xhdGUgZm9yIGZpbmFsIHZhbHVlXG4gICAgICAgICAgICAgICAgaWYgKHNpemUgPT09IDQpIHByZXZWYWwuc2xlcnAobmV4dFZhbCwgYWxwaGEpO1xuICAgICAgICAgICAgICAgIGVsc2UgcHJldlZhbC5sZXJwKG5leHRWYWwsIGFscGhhKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gaW50ZXJwb2xhdGUgYmV0d2VlbiBtdWx0aXBsZSBwb3NzaWJsZSBhbmltYXRpb25zXG4gICAgICAgICAgICBpZiAoc2l6ZSA9PT0gNCkgbm9kZVt0cmFuc2Zvcm1dLnNsZXJwKHByZXZWYWwsIHdlaWdodCk7XG4gICAgICAgICAgICBlbHNlIG5vZGVbdHJhbnNmb3JtXS5sZXJwKHByZXZWYWwsIHdlaWdodCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGN1YmljU3BsaW5lSW50ZXJwb2xhdGUodCwgcHJldlZhbCwgcHJldlRhbiwgbmV4dFRhbiwgbmV4dFZhbCkge1xuICAgICAgICBjb25zdCB0MiA9IHQgKiB0O1xuICAgICAgICBjb25zdCB0MyA9IHQyICogdDtcblxuICAgICAgICBjb25zdCBzMiA9IDMgKiB0MiAtIDIgKiB0MztcbiAgICAgICAgY29uc3QgczMgPSB0MyAtIHQyO1xuICAgICAgICBjb25zdCBzMCA9IDEgLSBzMjtcbiAgICAgICAgY29uc3QgczEgPSBzMyAtIHQyICsgdDtcblxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHByZXZWYWwubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHByZXZWYWxbaV0gPSBzMCAqIHByZXZWYWxbaV0gKyBzMSAqICgxIC0gdCkgKiBwcmV2VGFuW2ldICsgczIgKiBuZXh0VmFsW2ldICsgczMgKiB0ICogbmV4dFRhbltpXTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBwcmV2VmFsO1xuICAgIH1cbn1cbiIsImltcG9ydCB7IEdlb21ldHJ5IH0gZnJvbSAnLi4vY29yZS9HZW9tZXRyeS5qcyc7XG5pbXBvcnQgeyBUcmFuc2Zvcm0gfSBmcm9tICcuLi9jb3JlL1RyYW5zZm9ybS5qcyc7XG5pbXBvcnQgeyBUZXh0dXJlIH0gZnJvbSAnLi4vY29yZS9UZXh0dXJlLmpzJztcbmltcG9ydCB7IE1lc2ggfSBmcm9tICcuLi9jb3JlL01lc2guanMnO1xuaW1wb3J0IHsgR0xURkFuaW1hdGlvbiB9IGZyb20gJy4vR0xURkFuaW1hdGlvbi5qcyc7XG5pbXBvcnQgeyBHTFRGU2tpbiB9IGZyb20gJy4vR0xURlNraW4uanMnO1xuaW1wb3J0IHsgTWF0NCB9IGZyb20gJy4uL21hdGgvTWF0NC5qcyc7XG5pbXBvcnQgeyBOb3JtYWxQcm9ncmFtIH0gZnJvbSAnLi9Ob3JtYWxQcm9ncmFtLmpzJztcblxuLy8gU3VwcG9ydHNcbi8vIFt4XSBHZW9tZXRyeVxuLy8gWyBdIFNwYXJzZSBzdXBwb3J0XG4vLyBbeF0gTm9kZXMgYW5kIEhpZXJhcmNoeVxuLy8gW3hdIEluc3RhbmNpbmdcbi8vIFsgXSBNb3JwaCBUYXJnZXRzXG4vLyBbeF0gU2tpbnNcbi8vIFsgXSBNYXRlcmlhbHNcbi8vIFt4XSBUZXh0dXJlc1xuLy8gW3hdIEFuaW1hdGlvblxuLy8gWyBdIENhbWVyYXNcbi8vIFsgXSBFeHRlbnNpb25zXG4vLyBbeF0gR0xCIHN1cHBvcnRcblxuLy8gVE9ETzogU3BhcnNlIGFjY2Vzc29yIHBhY2tpbmc/IEZvciBtb3JwaCB0YXJnZXRzIGJhc2ljYWxseVxuLy8gVE9ETzogaW5pdCBhY2Nlc3NvciBtaXNzaW5nIGJ1ZmZlclZpZXcgd2l0aCAwc1xuLy8gVE9ETzogbW9ycGggdGFyZ2V0IGFuaW1hdGlvbnNcbi8vIFRPRE86IHdoYXQgdG8gZG8gaWYgbXVsdGlwbGUgaW5zdGFuY2VzIGFyZSBpbiBkaWZmZXJlbnQgZ3JvdXBzPyBPbmx5IHVzZXMgbG9jYWwgbWF0cmljZXNcbi8vIFRPRE86IHdoYXQgaWYgaW5zdGFuY2luZyBpc24ndCB3YW50ZWQ/IEVnIGNvbGxpc2lvbiBtYXBzXG4vLyBUT0RPOiBpZTExIGZhbGxiYWNrIGZvciBUZXh0RGVjb2Rlcj9cblxuY29uc3QgVFlQRV9BUlJBWSA9IHtcbiAgICA1MTIxOiBVaW50OEFycmF5LFxuICAgIDUxMjI6IEludDE2QXJyYXksXG4gICAgNTEyMzogVWludDE2QXJyYXksXG4gICAgNTEyNTogVWludDMyQXJyYXksXG4gICAgNTEyNjogRmxvYXQzMkFycmF5LFxuICAgICdpbWFnZS9qcGVnJzogVWludDhBcnJheSxcbiAgICAnaW1hZ2UvcG5nJzogVWludDhBcnJheSxcbn07XG5cbmNvbnN0IFRZUEVfU0laRSA9IHtcbiAgICBTQ0FMQVI6IDEsXG4gICAgVkVDMjogMixcbiAgICBWRUMzOiAzLFxuICAgIFZFQzQ6IDQsXG4gICAgTUFUMjogNCxcbiAgICBNQVQzOiA5LFxuICAgIE1BVDQ6IDE2LFxufTtcblxuY29uc3QgQVRUUklCVVRFUyA9IHtcbiAgICBQT1NJVElPTjogJ3Bvc2l0aW9uJyxcbiAgICBOT1JNQUw6ICdub3JtYWwnLFxuICAgIFRBTkdFTlQ6ICd0YW5nZW50JyxcbiAgICBURVhDT09SRF8wOiAndXYnLFxuICAgIFRFWENPT1JEXzE6ICd1djInLFxuICAgIENPTE9SXzA6ICdjb2xvcicsXG4gICAgV0VJR0hUU18wOiAnc2tpbldlaWdodCcsXG4gICAgSk9JTlRTXzA6ICdza2luSW5kZXgnLFxufTtcblxuY29uc3QgVFJBTlNGT1JNUyA9IHtcbiAgICB0cmFuc2xhdGlvbjogJ3Bvc2l0aW9uJyxcbiAgICByb3RhdGlvbjogJ3F1YXRlcm5pb24nLFxuICAgIHNjYWxlOiAnc2NhbGUnLFxufTtcblxuZXhwb3J0IGNsYXNzIEdMVEZMb2FkZXIge1xuICAgIHN0YXRpYyBhc3luYyBsb2FkKGdsLCBzcmMpIHtcbiAgICAgICAgY29uc3QgZGlyID0gc3JjLnNwbGl0KCcvJykuc2xpY2UoMCwgLTEpLmpvaW4oJy8nKSArICcvJztcblxuICAgICAgICAvLyBsb2FkIG1haW4gZGVzY3JpcHRpb24ganNvblxuICAgICAgICBjb25zdCBkZXNjID0gYXdhaXQgdGhpcy5wYXJzZURlc2Moc3JjKTtcblxuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5wYXJzZShnbCwgZGVzYywgZGlyKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgYXN5bmMgcGFyc2UoZ2wsIGRlc2MsIGRpcikge1xuICAgICAgICBpZiAoZGVzYy5hc3NldCA9PT0gdW5kZWZpbmVkIHx8IGRlc2MuYXNzZXQudmVyc2lvblswXSA8IDIpIGNvbnNvbGUud2FybignT25seSBHTFRGID49Mi4wIHN1cHBvcnRlZC4gQXR0ZW1wdGluZyB0byBwYXJzZS4nKTtcblxuICAgICAgICAvLyBMb2FkIGJ1ZmZlcnMgYXN5bmNcbiAgICAgICAgY29uc3QgYnVmZmVycyA9IGF3YWl0IHRoaXMubG9hZEJ1ZmZlcnMoZGVzYywgZGlyKTtcblxuICAgICAgICAvLyBVbmJpbmQgY3VycmVudCBWQU8gc28gdGhhdCBuZXcgYnVmZmVycyBkb24ndCBnZXQgYWRkZWQgdG8gYWN0aXZlIG1lc2hcbiAgICAgICAgZ2wucmVuZGVyZXIuYmluZFZlcnRleEFycmF5KG51bGwpO1xuXG4gICAgICAgIC8vIENyZWF0ZSBnbCBidWZmZXJzIGZyb20gYnVmZmVyVmlld3NcbiAgICAgICAgY29uc3QgYnVmZmVyVmlld3MgPSB0aGlzLnBhcnNlQnVmZmVyVmlld3MoZ2wsIGRlc2MsIGJ1ZmZlcnMpO1xuXG4gICAgICAgIC8vIENyZWF0ZSBpbWFnZXMgZnJvbSBlaXRoZXIgYnVmZmVyVmlld3Mgb3Igc2VwYXJhdGUgaW1hZ2UgZmlsZXNcbiAgICAgICAgY29uc3QgaW1hZ2VzID0gdGhpcy5wYXJzZUltYWdlcyhnbCwgZGVzYywgZGlyLCBidWZmZXJWaWV3cyk7XG5cbiAgICAgICAgY29uc3QgdGV4dHVyZXMgPSB0aGlzLnBhcnNlVGV4dHVyZXMoZ2wsIGRlc2MsIGltYWdlcyk7XG5cbiAgICAgICAgLy8gSnVzdCBwYXNzIHRocm91Z2ggbWF0ZXJpYWwgZGF0YSBmb3Igbm93XG4gICAgICAgIGNvbnN0IG1hdGVyaWFscyA9IHRoaXMucGFyc2VNYXRlcmlhbHMoZ2wsIGRlc2MsIHRleHR1cmVzKTtcblxuICAgICAgICAvLyBGZXRjaCB0aGUgaW52ZXJzZSBiaW5kIG1hdHJpY2VzIGZvciBza2VsZXRvbiBqb2ludHNcbiAgICAgICAgY29uc3Qgc2tpbnMgPSB0aGlzLnBhcnNlU2tpbnMoZ2wsIGRlc2MsIGJ1ZmZlclZpZXdzKTtcblxuICAgICAgICAvLyBDcmVhdGUgZ2VvbWV0cmllcyBmb3IgZWFjaCBtZXNoIHByaW1pdGl2ZVxuICAgICAgICBjb25zdCBtZXNoZXMgPSB0aGlzLnBhcnNlTWVzaGVzKGdsLCBkZXNjLCBidWZmZXJWaWV3cywgbWF0ZXJpYWxzLCBza2lucyk7XG5cbiAgICAgICAgLy8gQ3JlYXRlIHRyYW5zZm9ybXMsIG1lc2hlcyBhbmQgaGllcmFyY2h5XG4gICAgICAgIGNvbnN0IG5vZGVzID0gdGhpcy5wYXJzZU5vZGVzKGdsLCBkZXNjLCBtZXNoZXMsIHNraW5zKTtcblxuICAgICAgICAvLyBQbGFjZSBub2RlcyBpbiBza2VsZXRvbnNcbiAgICAgICAgdGhpcy5wb3B1bGF0ZVNraW5zKHNraW5zLCBub2Rlcyk7XG5cbiAgICAgICAgLy8gQ3JlYXRlIGFuaW1hdGlvbiBoYW5kbGVyc1xuICAgICAgICBjb25zdCBhbmltYXRpb25zID0gdGhpcy5wYXJzZUFuaW1hdGlvbnMoZ2wsIGRlc2MsIG5vZGVzLCBidWZmZXJWaWV3cyk7XG5cbiAgICAgICAgLy8gR2V0IHRvcCBsZXZlbCBub2RlcyBmb3IgZWFjaCBzY2VuZVxuICAgICAgICBjb25zdCBzY2VuZXMgPSB0aGlzLnBhcnNlU2NlbmVzKGRlc2MsIG5vZGVzKTtcbiAgICAgICAgY29uc3Qgc2NlbmUgPSBzY2VuZXNbZGVzYy5zY2VuZV07XG5cbiAgICAgICAgLy8gUmVtb3ZlIG51bGwgbm9kZXMgKGluc3RhbmNlZCB0cmFuc2Zvcm1zKVxuICAgICAgICBmb3IgKGxldCBpID0gbm9kZXMubGVuZ3RoOyBpID49IDA7IGktLSkgaWYgKCFub2Rlc1tpXSkgbm9kZXMuc3BsaWNlKGksIDEpO1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBqc29uOiBkZXNjLFxuICAgICAgICAgICAgYnVmZmVycyxcbiAgICAgICAgICAgIGJ1ZmZlclZpZXdzLFxuICAgICAgICAgICAgaW1hZ2VzLFxuICAgICAgICAgICAgdGV4dHVyZXMsXG4gICAgICAgICAgICBtYXRlcmlhbHMsXG4gICAgICAgICAgICBtZXNoZXMsXG4gICAgICAgICAgICBub2RlcyxcbiAgICAgICAgICAgIGFuaW1hdGlvbnMsXG4gICAgICAgICAgICBzY2VuZXMsXG4gICAgICAgICAgICBzY2VuZSxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBzdGF0aWMgYXN5bmMgcGFyc2VEZXNjKHNyYykge1xuICAgICAgICBpZiAoIXNyYy5tYXRjaCgvXFwuZ2xiJC8pKSB7XG4gICAgICAgICAgICByZXR1cm4gYXdhaXQgZmV0Y2goc3JjKS50aGVuKChyZXMpID0+IHJlcy5qc29uKCkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGF3YWl0IGZldGNoKHNyYylcbiAgICAgICAgICAgICAgICAudGhlbigocmVzKSA9PiByZXMuYXJyYXlCdWZmZXIoKSlcbiAgICAgICAgICAgICAgICAudGhlbigoZ2xiKSA9PiB0aGlzLnVucGFja0dMQihnbGIpKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIEZyb20gaHR0cHM6Ly9naXRodWIuY29tL2Rvbm1jY3VyZHkvZ2xURi1UcmFuc2Zvcm0vYmxvYi9lNDEwOGNjL3BhY2thZ2VzL2NvcmUvc3JjL2lvL2lvLnRzI0wzMlxuICAgIHN0YXRpYyB1bnBhY2tHTEIoZ2xiKSB7XG4gICAgICAgIC8vIERlY29kZSBhbmQgdmVyaWZ5IEdMQiBoZWFkZXIuXG4gICAgICAgIGNvbnN0IGhlYWRlciA9IG5ldyBVaW50MzJBcnJheShnbGIsIDAsIDMpO1xuICAgICAgICBpZiAoaGVhZGVyWzBdICE9PSAweDQ2NTQ2YzY3KSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgZ2xURiBhc3NldC4nKTtcbiAgICAgICAgfSBlbHNlIGlmIChoZWFkZXJbMV0gIT09IDIpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgVW5zdXBwb3J0ZWQgZ2xURiBiaW5hcnkgdmVyc2lvbiwgXCIke2hlYWRlclsxXX1cIi5gKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBEZWNvZGUgYW5kIHZlcmlmeSBjaHVuayBoZWFkZXJzLlxuICAgICAgICBjb25zdCBqc29uQ2h1bmtIZWFkZXIgPSBuZXcgVWludDMyQXJyYXkoZ2xiLCAxMiwgMik7XG4gICAgICAgIGNvbnN0IGpzb25CeXRlT2Zmc2V0ID0gMjA7XG4gICAgICAgIGNvbnN0IGpzb25CeXRlTGVuZ3RoID0ganNvbkNodW5rSGVhZGVyWzBdO1xuICAgICAgICBpZiAoanNvbkNodW5rSGVhZGVyWzFdICE9PSAweDRlNGY1MzRhKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1VuZXhwZWN0ZWQgR0xCIGxheW91dC4nKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIERlY29kZSBKU09OLlxuICAgICAgICBjb25zdCBqc29uVGV4dCA9IG5ldyBUZXh0RGVjb2RlcigpLmRlY29kZShnbGIuc2xpY2UoanNvbkJ5dGVPZmZzZXQsIGpzb25CeXRlT2Zmc2V0ICsganNvbkJ5dGVMZW5ndGgpKTtcbiAgICAgICAgY29uc3QganNvbiA9IEpTT04ucGFyc2UoanNvblRleHQpO1xuICAgICAgICAvLyBKU09OIG9ubHlcbiAgICAgICAgaWYgKGpzb25CeXRlT2Zmc2V0ICsganNvbkJ5dGVMZW5ndGggPT09IGdsYi5ieXRlTGVuZ3RoKSByZXR1cm4ganNvbjtcblxuICAgICAgICBjb25zdCBiaW5hcnlDaHVua0hlYWRlciA9IG5ldyBVaW50MzJBcnJheShnbGIsIGpzb25CeXRlT2Zmc2V0ICsganNvbkJ5dGVMZW5ndGgsIDIpO1xuICAgICAgICBpZiAoYmluYXJ5Q2h1bmtIZWFkZXJbMV0gIT09IDB4MDA0ZTQ5NDIpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVW5leHBlY3RlZCBHTEIgbGF5b3V0LicpO1xuICAgICAgICB9XG4gICAgICAgIC8vIERlY29kZSBjb250ZW50LlxuICAgICAgICBjb25zdCBiaW5hcnlCeXRlT2Zmc2V0ID0ganNvbkJ5dGVPZmZzZXQgKyBqc29uQnl0ZUxlbmd0aCArIDg7XG4gICAgICAgIGNvbnN0IGJpbmFyeUJ5dGVMZW5ndGggPSBiaW5hcnlDaHVua0hlYWRlclswXTtcbiAgICAgICAgY29uc3QgYmluYXJ5ID0gZ2xiLnNsaWNlKGJpbmFyeUJ5dGVPZmZzZXQsIGJpbmFyeUJ5dGVPZmZzZXQgKyBiaW5hcnlCeXRlTGVuZ3RoKTtcbiAgICAgICAgLy8gQXR0YWNoIGJpbmFyeSB0byBidWZmZXJcbiAgICAgICAganNvbi5idWZmZXJzWzBdLmJpbmFyeSA9IGJpbmFyeTtcbiAgICAgICAgcmV0dXJuIGpzb247XG4gICAgfVxuXG4gICAgLy8gVGhyZWVqcyBHTFRGIExvYWRlciBodHRwczovL2dpdGh1Yi5jb20vbXJkb29iL3RocmVlLmpzL2Jsb2IvbWFzdGVyL2V4YW1wbGVzL2pzL2xvYWRlcnMvR0xURkxvYWRlci5qcyNMMTA4NVxuICAgIHN0YXRpYyByZXNvbHZlVVJJKHVyaSwgZGlyKSB7XG4gICAgICAgIC8vIEludmFsaWQgVVJJXG4gICAgICAgIGlmICh0eXBlb2YgdXJpICE9PSAnc3RyaW5nJyB8fCB1cmkgPT09ICcnKSByZXR1cm4gJyc7XG5cbiAgICAgICAgLy8gSG9zdCBSZWxhdGl2ZSBVUklcbiAgICAgICAgaWYgKC9eaHR0cHM/OlxcL1xcLy9pLnRlc3QoZGlyKSAmJiAvXlxcLy8udGVzdCh1cmkpKSB7XG4gICAgICAgICAgICBkaXIgPSBkaXIucmVwbGFjZSgvKF5odHRwcz86XFwvXFwvW15cXC9dKykuKi9pLCAnJDEnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEFic29sdXRlIFVSSSBodHRwOi8vLCBodHRwczovLywgLy9cbiAgICAgICAgaWYgKC9eKGh0dHBzPzopP1xcL1xcLy9pLnRlc3QodXJpKSkgcmV0dXJuIHVyaTtcblxuICAgICAgICAvLyBEYXRhIFVSSVxuICAgICAgICBpZiAoL15kYXRhOi4qLC4qJC9pLnRlc3QodXJpKSkgcmV0dXJuIHVyaTtcblxuICAgICAgICAvLyBCbG9iIFVSSVxuICAgICAgICBpZiAoL15ibG9iOi4qJC9pLnRlc3QodXJpKSkgcmV0dXJuIHVyaTtcblxuICAgICAgICAvLyBSZWxhdGl2ZSBVUklcbiAgICAgICAgcmV0dXJuIGRpciArIHVyaTtcbiAgICB9XG5cbiAgICBzdGF0aWMgYXN5bmMgbG9hZEJ1ZmZlcnMoZGVzYywgZGlyKSB7XG4gICAgICAgIGlmICghZGVzYy5idWZmZXJzKSByZXR1cm4gbnVsbDtcbiAgICAgICAgcmV0dXJuIGF3YWl0IFByb21pc2UuYWxsKFxuICAgICAgICAgICAgZGVzYy5idWZmZXJzLm1hcCgoYnVmZmVyKSA9PiB7XG4gICAgICAgICAgICAgICAgLy8gRm9yIEdMQiwgYmluYXJ5IGJ1ZmZlciByZWFkeSB0byBnb1xuICAgICAgICAgICAgICAgIGlmIChidWZmZXIuYmluYXJ5KSByZXR1cm4gYnVmZmVyLmJpbmFyeTtcbiAgICAgICAgICAgICAgICBjb25zdCB1cmkgPSB0aGlzLnJlc29sdmVVUkkoYnVmZmVyLnVyaSwgZGlyKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmV0Y2godXJpKS50aGVuKChyZXMpID0+IHJlcy5hcnJheUJ1ZmZlcigpKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgc3RhdGljIHBhcnNlQnVmZmVyVmlld3MoZ2wsIGRlc2MsIGJ1ZmZlcnMpIHtcbiAgICAgICAgaWYgKCFkZXNjLmJ1ZmZlclZpZXdzKSByZXR1cm4gbnVsbDtcbiAgICAgICAgLy8gQ2xvbmUgdG8gbGVhdmUgZGVzY3JpcHRpb24gcHVyZVxuICAgICAgICBjb25zdCBidWZmZXJWaWV3cyA9IGRlc2MuYnVmZmVyVmlld3MubWFwKChvKSA9PiBPYmplY3QuYXNzaWduKHt9LCBvKSk7XG5cbiAgICAgICAgZGVzYy5tZXNoZXMgJiZcbiAgICAgICAgICAgIGRlc2MubWVzaGVzLmZvckVhY2goKHsgcHJpbWl0aXZlcyB9KSA9PiB7XG4gICAgICAgICAgICAgICAgcHJpbWl0aXZlcy5mb3JFYWNoKCh7IGF0dHJpYnV0ZXMsIGluZGljZXMgfSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAvLyBGbGFnIGJ1ZmZlclZpZXcgYXMgYW4gYXR0cmlidXRlLCBzbyBpdCBrbm93cyB0byBjcmVhdGUgYSBnbCBidWZmZXJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgYXR0ciBpbiBhdHRyaWJ1dGVzKSBidWZmZXJWaWV3c1tkZXNjLmFjY2Vzc29yc1thdHRyaWJ1dGVzW2F0dHJdXS5idWZmZXJWaWV3XS5pc0F0dHJpYnV0ZSA9IHRydWU7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGluZGljZXMgPT09IHVuZGVmaW5lZCkgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICBidWZmZXJWaWV3c1tkZXNjLmFjY2Vzc29yc1tpbmRpY2VzXS5idWZmZXJWaWV3XS5pc0F0dHJpYnV0ZSA9IHRydWU7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gTWFrZSBzdXJlIGluZGljZXMgYnVmZmVyVmlldyBoYXZlIGEgdGFyZ2V0IHByb3BlcnR5IGZvciBnbCBidWZmZXIgYmluZGluZ1xuICAgICAgICAgICAgICAgICAgICBidWZmZXJWaWV3c1tkZXNjLmFjY2Vzc29yc1tpbmRpY2VzXS5idWZmZXJWaWV3XS50YXJnZXQgPSBnbC5FTEVNRU5UX0FSUkFZX0JVRkZFUjtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIC8vIEdldCBjb21wb25lbnRUeXBlIG9mIGVhY2ggYnVmZmVyVmlldyBmcm9tIHRoZSBhY2Nlc3NvcnNcbiAgICAgICAgZGVzYy5hY2Nlc3NvcnMuZm9yRWFjaCgoeyBidWZmZXJWaWV3OiBpLCBjb21wb25lbnRUeXBlIH0pID0+IHtcbiAgICAgICAgICAgIGJ1ZmZlclZpZXdzW2ldLmNvbXBvbmVudFR5cGUgPSBjb21wb25lbnRUeXBlO1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyBHZXQgbWltZXR5cGUgb2YgYnVmZmVyVmlldyBmcm9tIGltYWdlc1xuICAgICAgICBkZXNjLmltYWdlcyAmJlxuICAgICAgICAgICAgZGVzYy5pbWFnZXMuZm9yRWFjaCgoeyB1cmksIGJ1ZmZlclZpZXc6IGksIG1pbWVUeXBlIH0pID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoaSA9PT0gdW5kZWZpbmVkKSByZXR1cm47XG4gICAgICAgICAgICAgICAgYnVmZmVyVmlld3NbaV0ubWltZVR5cGUgPSBtaW1lVHlwZTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIC8vIFB1c2ggZWFjaCBidWZmZXJWaWV3IHRvIHRoZSBHUFUgYXMgYSBzZXBhcmF0ZSBidWZmZXJcbiAgICAgICAgYnVmZmVyVmlld3MuZm9yRWFjaChcbiAgICAgICAgICAgIChcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGJ1ZmZlcjogYnVmZmVySW5kZXgsIC8vIHJlcXVpcmVkXG4gICAgICAgICAgICAgICAgICAgIGJ5dGVPZmZzZXQgPSAwLCAvLyBvcHRpb25hbFxuICAgICAgICAgICAgICAgICAgICBieXRlTGVuZ3RoLCAvLyByZXF1aXJlZFxuICAgICAgICAgICAgICAgICAgICBieXRlU3RyaWRlLCAvLyBvcHRpb25hbFxuICAgICAgICAgICAgICAgICAgICB0YXJnZXQgPSBnbC5BUlJBWV9CVUZGRVIsIC8vIG9wdGlvbmFsLCBhZGRlZCBhYm92ZSBmb3IgZWxlbWVudHNcbiAgICAgICAgICAgICAgICAgICAgbmFtZSwgLy8gb3B0aW9uYWxcbiAgICAgICAgICAgICAgICAgICAgZXh0ZW5zaW9ucywgLy8gb3B0aW9uYWxcbiAgICAgICAgICAgICAgICAgICAgZXh0cmFzLCAvLyBvcHRpb25hbFxuXG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudFR5cGUsIC8vIG9wdGlvbmFsLCBhZGRlZCBmcm9tIGFjY2Vzc29yIGFib3ZlXG4gICAgICAgICAgICAgICAgICAgIG1pbWVUeXBlLCAvLyBvcHRpb25hbCwgYWRkZWQgZnJvbSBpbWFnZXMgYWJvdmVcbiAgICAgICAgICAgICAgICAgICAgaXNBdHRyaWJ1dGUsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBpXG4gICAgICAgICAgICApID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBUeXBlQXJyYXkgPSBUWVBFX0FSUkFZW2NvbXBvbmVudFR5cGUgfHwgbWltZVR5cGVdO1xuICAgICAgICAgICAgICAgIGNvbnN0IGVsZW1lbnRCeXRlcyA9IFR5cGVBcnJheS5CWVRFU19QRVJfRUxFTUVOVDtcblxuICAgICAgICAgICAgICAgIGNvbnN0IGRhdGEgPSBuZXcgVHlwZUFycmF5KGJ1ZmZlcnNbYnVmZmVySW5kZXhdLCBieXRlT2Zmc2V0LCBieXRlTGVuZ3RoIC8gZWxlbWVudEJ5dGVzKTtcbiAgICAgICAgICAgICAgICBidWZmZXJWaWV3c1tpXS5kYXRhID0gZGF0YTtcbiAgICAgICAgICAgICAgICBidWZmZXJWaWV3c1tpXS5vcmlnaW5hbEJ1ZmZlciA9IGJ1ZmZlcnNbYnVmZmVySW5kZXhdO1xuXG4gICAgICAgICAgICAgICAgaWYgKCFpc0F0dHJpYnV0ZSkgcmV0dXJuO1xuICAgICAgICAgICAgICAgIC8vIENyZWF0ZSBnbCBidWZmZXJzIGZvciB0aGUgYnVmZmVyVmlldywgcHVzaGluZyBpdCB0byB0aGUgR1BVXG4gICAgICAgICAgICAgICAgY29uc3QgYnVmZmVyID0gZ2wuY3JlYXRlQnVmZmVyKCk7XG4gICAgICAgICAgICAgICAgZ2wuYmluZEJ1ZmZlcih0YXJnZXQsIGJ1ZmZlcik7XG4gICAgICAgICAgICAgICAgZ2wucmVuZGVyZXIuc3RhdGUuYm91bmRCdWZmZXIgPSBidWZmZXI7XG4gICAgICAgICAgICAgICAgZ2wuYnVmZmVyRGF0YSh0YXJnZXQsIGRhdGEsIGdsLlNUQVRJQ19EUkFXKTtcbiAgICAgICAgICAgICAgICBidWZmZXJWaWV3c1tpXS5idWZmZXIgPSBidWZmZXI7XG4gICAgICAgICAgICB9XG4gICAgICAgICk7XG5cbiAgICAgICAgcmV0dXJuIGJ1ZmZlclZpZXdzO1xuICAgIH1cblxuICAgIHN0YXRpYyBwYXJzZUltYWdlcyhnbCwgZGVzYywgZGlyLCBidWZmZXJWaWV3cykge1xuICAgICAgICBpZiAoIWRlc2MuaW1hZ2VzKSByZXR1cm4gbnVsbDtcbiAgICAgICAgcmV0dXJuIGRlc2MuaW1hZ2VzLm1hcCgoeyB1cmksIGJ1ZmZlclZpZXc6IGJ1ZmZlclZpZXdJbmRleCwgbWltZVR5cGUsIG5hbWUgfSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgaW1hZ2UgPSBuZXcgSW1hZ2UoKTtcbiAgICAgICAgICAgIGltYWdlLm5hbWUgPSBuYW1lO1xuICAgICAgICAgICAgaWYgKHVyaSkge1xuICAgICAgICAgICAgICAgIGltYWdlLnNyYyA9IHRoaXMucmVzb2x2ZVVSSSh1cmksIGRpcik7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGJ1ZmZlclZpZXdJbmRleCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgeyBkYXRhIH0gPSBidWZmZXJWaWV3c1tidWZmZXJWaWV3SW5kZXhdO1xuICAgICAgICAgICAgICAgIGNvbnN0IGJsb2IgPSBuZXcgQmxvYihbZGF0YV0sIHsgdHlwZTogbWltZVR5cGUgfSk7XG4gICAgICAgICAgICAgICAgaW1hZ2Uuc3JjID0gVVJMLmNyZWF0ZU9iamVjdFVSTChibG9iKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGltYWdlLnJlYWR5ID0gbmV3IFByb21pc2UoKHJlcykgPT4ge1xuICAgICAgICAgICAgICAgIGltYWdlLm9ubG9hZCA9ICgpID0+IHJlcygpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gaW1hZ2U7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHN0YXRpYyBwYXJzZVRleHR1cmVzKGdsLCBkZXNjLCBpbWFnZXMpIHtcbiAgICAgICAgaWYgKCFkZXNjLnRleHR1cmVzKSByZXR1cm4gbnVsbDtcbiAgICAgICAgcmV0dXJuIGRlc2MudGV4dHVyZXMubWFwKCh7IHNhbXBsZXI6IHNhbXBsZXJJbmRleCwgc291cmNlOiBzb3VyY2VJbmRleCwgbmFtZSwgZXh0ZW5zaW9ucywgZXh0cmFzIH0pID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG9wdGlvbnMgPSB7XG4gICAgICAgICAgICAgICAgZmxpcFk6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHdyYXBTOiBnbC5SRVBFQVQsIC8vIFJlcGVhdCBieSBkZWZhdWx0LCBvcHBvc2VkIHRvIE9HTCdzIGNsYW1wIGJ5IGRlZmF1bHRcbiAgICAgICAgICAgICAgICB3cmFwVDogZ2wuUkVQRUFULFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGNvbnN0IHNhbXBsZXIgPSBzYW1wbGVySW5kZXggIT09IHVuZGVmaW5lZCA/IGRlc2Muc2FtcGxlcnNbc2FtcGxlckluZGV4XSA6IG51bGw7XG4gICAgICAgICAgICBpZiAoc2FtcGxlcikge1xuICAgICAgICAgICAgICAgIFsnbWFnRmlsdGVyJywgJ21pbkZpbHRlcicsICd3cmFwUycsICd3cmFwVCddLmZvckVhY2goKHByb3ApID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNhbXBsZXJbcHJvcF0pIG9wdGlvbnNbcHJvcF0gPSBzYW1wbGVyW3Byb3BdO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgdGV4dHVyZSA9IG5ldyBUZXh0dXJlKGdsLCBvcHRpb25zKTtcbiAgICAgICAgICAgIHRleHR1cmUubmFtZSA9IG5hbWU7XG4gICAgICAgICAgICBjb25zdCBpbWFnZSA9IGltYWdlc1tzb3VyY2VJbmRleF07XG4gICAgICAgICAgICBpbWFnZS5yZWFkeS50aGVuKCgpID0+ICh0ZXh0dXJlLmltYWdlID0gaW1hZ2UpKTtcblxuICAgICAgICAgICAgcmV0dXJuIHRleHR1cmU7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHN0YXRpYyBwYXJzZU1hdGVyaWFscyhnbCwgZGVzYywgdGV4dHVyZXMpIHtcbiAgICAgICAgaWYgKCFkZXNjLm1hdGVyaWFscykgcmV0dXJuIG51bGw7XG4gICAgICAgIHJldHVybiBkZXNjLm1hdGVyaWFscy5tYXAoXG4gICAgICAgICAgICAoe1xuICAgICAgICAgICAgICAgIG5hbWUsXG4gICAgICAgICAgICAgICAgZXh0ZW5zaW9ucyxcbiAgICAgICAgICAgICAgICBleHRyYXMsXG4gICAgICAgICAgICAgICAgcGJyTWV0YWxsaWNSb3VnaG5lc3MgPSB7fSxcbiAgICAgICAgICAgICAgICBub3JtYWxUZXh0dXJlLFxuICAgICAgICAgICAgICAgIG9jY2x1c2lvblRleHR1cmUsXG4gICAgICAgICAgICAgICAgZW1pc3NpdmVUZXh0dXJlLFxuICAgICAgICAgICAgICAgIGVtaXNzaXZlRmFjdG9yID0gWzAsIDAsIDBdLFxuICAgICAgICAgICAgICAgIGFscGhhTW9kZSA9ICdPUEFRVUUnLFxuICAgICAgICAgICAgICAgIGFscGhhQ3V0b2ZmID0gMC41LFxuICAgICAgICAgICAgICAgIGRvdWJsZVNpZGVkID0gZmFsc2UsXG4gICAgICAgICAgICB9KSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3Qge1xuICAgICAgICAgICAgICAgICAgICBiYXNlQ29sb3JGYWN0b3IgPSBbMSwgMSwgMSwgMV0sXG4gICAgICAgICAgICAgICAgICAgIGJhc2VDb2xvclRleHR1cmUsXG4gICAgICAgICAgICAgICAgICAgIG1ldGFsbGljRmFjdG9yID0gMSxcbiAgICAgICAgICAgICAgICAgICAgcm91Z2huZXNzRmFjdG9yID0gMSxcbiAgICAgICAgICAgICAgICAgICAgbWV0YWxsaWNSb3VnaG5lc3NUZXh0dXJlLFxuICAgICAgICAgICAgICAgICAgICAvLyAgIGV4dGVuc2lvbnMsXG4gICAgICAgICAgICAgICAgICAgIC8vICAgZXh0cmFzLFxuICAgICAgICAgICAgICAgIH0gPSBwYnJNZXRhbGxpY1JvdWdobmVzcztcblxuICAgICAgICAgICAgICAgIGlmIChiYXNlQ29sb3JUZXh0dXJlKSB7XG4gICAgICAgICAgICAgICAgICAgIGJhc2VDb2xvclRleHR1cmUudGV4dHVyZSA9IHRleHR1cmVzW2Jhc2VDb2xvclRleHR1cmUuaW5kZXhdO1xuICAgICAgICAgICAgICAgICAgICAvLyB0ZXhDb29yZFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAobm9ybWFsVGV4dHVyZSkge1xuICAgICAgICAgICAgICAgICAgICBub3JtYWxUZXh0dXJlLnRleHR1cmUgPSB0ZXh0dXJlc1tub3JtYWxUZXh0dXJlLmluZGV4XTtcbiAgICAgICAgICAgICAgICAgICAgLy8gc2NhbGU6IDFcbiAgICAgICAgICAgICAgICAgICAgLy8gdGV4Q29vcmRcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKG1ldGFsbGljUm91Z2huZXNzVGV4dHVyZSkge1xuICAgICAgICAgICAgICAgICAgICBtZXRhbGxpY1JvdWdobmVzc1RleHR1cmUudGV4dHVyZSA9IHRleHR1cmVzW21ldGFsbGljUm91Z2huZXNzVGV4dHVyZS5pbmRleF07XG4gICAgICAgICAgICAgICAgICAgIC8vIHRleENvb3JkXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChvY2NsdXNpb25UZXh0dXJlKSB7XG4gICAgICAgICAgICAgICAgICAgIG9jY2x1c2lvblRleHR1cmUudGV4dHVyZSA9IHRleHR1cmVzW29jY2x1c2lvblRleHR1cmUuaW5kZXhdO1xuICAgICAgICAgICAgICAgICAgICAvLyBzdHJlbmd0aCAxXG4gICAgICAgICAgICAgICAgICAgIC8vIHRleENvb3JkXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChlbWlzc2l2ZVRleHR1cmUpIHtcbiAgICAgICAgICAgICAgICAgICAgZW1pc3NpdmVUZXh0dXJlLnRleHR1cmUgPSB0ZXh0dXJlc1tlbWlzc2l2ZVRleHR1cmUuaW5kZXhdO1xuICAgICAgICAgICAgICAgICAgICAvLyB0ZXhDb29yZFxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIG5hbWUsXG4gICAgICAgICAgICAgICAgICAgIGJhc2VDb2xvckZhY3RvcixcbiAgICAgICAgICAgICAgICAgICAgYmFzZUNvbG9yVGV4dHVyZSxcbiAgICAgICAgICAgICAgICAgICAgbWV0YWxsaWNGYWN0b3IsXG4gICAgICAgICAgICAgICAgICAgIHJvdWdobmVzc0ZhY3RvcixcbiAgICAgICAgICAgICAgICAgICAgbWV0YWxsaWNSb3VnaG5lc3NUZXh0dXJlLFxuICAgICAgICAgICAgICAgICAgICBub3JtYWxUZXh0dXJlLFxuICAgICAgICAgICAgICAgICAgICBvY2NsdXNpb25UZXh0dXJlLFxuICAgICAgICAgICAgICAgICAgICBlbWlzc2l2ZVRleHR1cmUsXG4gICAgICAgICAgICAgICAgICAgIGVtaXNzaXZlRmFjdG9yLFxuICAgICAgICAgICAgICAgICAgICBhbHBoYU1vZGUsXG4gICAgICAgICAgICAgICAgICAgIGFscGhhQ3V0b2ZmLFxuICAgICAgICAgICAgICAgICAgICBkb3VibGVTaWRlZCxcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICApO1xuICAgIH1cblxuICAgIHN0YXRpYyBwYXJzZVNraW5zKGdsLCBkZXNjLCBidWZmZXJWaWV3cykge1xuICAgICAgICBpZiAoIWRlc2Muc2tpbnMpIHJldHVybiBudWxsO1xuICAgICAgICByZXR1cm4gZGVzYy5za2lucy5tYXAoXG4gICAgICAgICAgICAoe1xuICAgICAgICAgICAgICAgIGludmVyc2VCaW5kTWF0cmljZXMsIC8vIG9wdGlvbmFsXG4gICAgICAgICAgICAgICAgc2tlbGV0b24sIC8vIG9wdGlvbmFsXG4gICAgICAgICAgICAgICAgam9pbnRzLCAvLyByZXF1aXJlZFxuICAgICAgICAgICAgICAgIC8vIG5hbWUsXG4gICAgICAgICAgICAgICAgLy8gZXh0ZW5zaW9ucyxcbiAgICAgICAgICAgICAgICAvLyBleHRyYXMsXG4gICAgICAgICAgICB9KSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgaW52ZXJzZUJpbmRNYXRyaWNlczogdGhpcy5wYXJzZUFjY2Vzc29yKGludmVyc2VCaW5kTWF0cmljZXMsIGRlc2MsIGJ1ZmZlclZpZXdzKSxcbiAgICAgICAgICAgICAgICAgICAgc2tlbGV0b24sXG4gICAgICAgICAgICAgICAgICAgIGpvaW50cyxcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICApO1xuICAgIH1cblxuICAgIHN0YXRpYyBwYXJzZU1lc2hlcyhnbCwgZGVzYywgYnVmZmVyVmlld3MsIG1hdGVyaWFscywgc2tpbnMpIHtcbiAgICAgICAgaWYgKCFkZXNjLm1lc2hlcykgcmV0dXJuIG51bGw7XG4gICAgICAgIHJldHVybiBkZXNjLm1lc2hlcy5tYXAoXG4gICAgICAgICAgICAoXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBwcmltaXRpdmVzLCAvLyByZXF1aXJlZFxuICAgICAgICAgICAgICAgICAgICB3ZWlnaHRzLCAvLyBvcHRpb25hbFxuICAgICAgICAgICAgICAgICAgICBuYW1lLCAvLyBvcHRpb25hbFxuICAgICAgICAgICAgICAgICAgICBleHRlbnNpb25zLCAvLyBvcHRpb25hbFxuICAgICAgICAgICAgICAgICAgICBleHRyYXMsIC8vIG9wdGlvbmFsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBtZXNoSW5kZXhcbiAgICAgICAgICAgICkgPT4ge1xuICAgICAgICAgICAgICAgIC8vIFRPRE86IHdlaWdodHMgc3R1ZmYgP1xuICAgICAgICAgICAgICAgIC8vIFBhcnNlIHRocm91Z2ggbm9kZXMgdG8gc2VlIGhvdyBtYW55IGluc3RhbmNlcyB0aGVyZSBhcmVcbiAgICAgICAgICAgICAgICAvLyBhbmQgaWYgdGhlcmUgaXMgYSBza2luIGF0dGFjaGVkXG4gICAgICAgICAgICAgICAgbGV0IG51bUluc3RhbmNlcyA9IDA7XG4gICAgICAgICAgICAgICAgbGV0IHNraW5JbmRleCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGRlc2Mubm9kZXMgJiZcbiAgICAgICAgICAgICAgICAgICAgZGVzYy5ub2Rlcy5mb3JFYWNoKCh7IG1lc2gsIHNraW4gfSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG1lc2ggPT09IG1lc2hJbmRleCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG51bUluc3RhbmNlcysrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChza2luICE9PSB1bmRlZmluZWQpIHNraW5JbmRleCA9IHNraW47XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgcHJpbWl0aXZlcyA9IHRoaXMucGFyc2VQcmltaXRpdmVzKGdsLCBwcmltaXRpdmVzLCBkZXNjLCBidWZmZXJWaWV3cywgbWF0ZXJpYWxzLCBudW1JbnN0YW5jZXMpLm1hcCgoeyBnZW9tZXRyeSwgcHJvZ3JhbSwgbW9kZSB9KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIC8vIENyZWF0ZSBlaXRoZXIgc2tpbm5lZCBtZXNoIG9yIHJlZ3VsYXIgbWVzaFxuICAgICAgICAgICAgICAgICAgICBjb25zdCBtZXNoID1cbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGVvZiBza2luSW5kZXggPT09ICdudW1iZXInXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPyBuZXcgR0xURlNraW4oZ2wsIHsgc2tlbGV0b246IHNraW5zW3NraW5JbmRleF0sIGdlb21ldHJ5LCBwcm9ncmFtLCBtb2RlIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgOiBuZXcgTWVzaChnbCwgeyBnZW9tZXRyeSwgcHJvZ3JhbSwgbW9kZSB9KTtcbiAgICAgICAgICAgICAgICAgICAgbWVzaC5uYW1lID0gbmFtZTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG1lc2guZ2VvbWV0cnkuaXNJbnN0YW5jZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRhZyBtZXNoIHNvIHRoYXQgbm9kZXMgY2FuIGFkZCB0aGVpciB0cmFuc2Zvcm1zIHRvIHRoZSBpbnN0YW5jZSBhdHRyaWJ1dGVcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc2gubnVtSW5zdGFuY2VzID0gbnVtSW5zdGFuY2VzO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gQXZvaWQgaW5jb3JyZWN0IGN1bGxpbmcgZm9yIGluc3RhbmNlc1xuICAgICAgICAgICAgICAgICAgICAgICAgbWVzaC5mcnVzdHVtQ3VsbGVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG1lc2g7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBwcmltaXRpdmVzLFxuICAgICAgICAgICAgICAgICAgICB3ZWlnaHRzLFxuICAgICAgICAgICAgICAgICAgICBuYW1lLFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgc3RhdGljIHBhcnNlUHJpbWl0aXZlcyhnbCwgcHJpbWl0aXZlcywgZGVzYywgYnVmZmVyVmlld3MsIG1hdGVyaWFscywgbnVtSW5zdGFuY2VzKSB7XG4gICAgICAgIHJldHVybiBwcmltaXRpdmVzLm1hcChcbiAgICAgICAgICAgICh7XG4gICAgICAgICAgICAgICAgYXR0cmlidXRlcywgLy8gcmVxdWlyZWRcbiAgICAgICAgICAgICAgICBpbmRpY2VzLCAvLyBvcHRpb25hbFxuICAgICAgICAgICAgICAgIG1hdGVyaWFsOiBtYXRlcmlhbEluZGV4LCAvLyBvcHRpb25hbFxuICAgICAgICAgICAgICAgIG1vZGUgPSA0LCAvLyBvcHRpb25hbFxuICAgICAgICAgICAgICAgIHRhcmdldHMsIC8vIG9wdGlvbmFsXG4gICAgICAgICAgICAgICAgZXh0ZW5zaW9ucywgLy8gb3B0aW9uYWxcbiAgICAgICAgICAgICAgICBleHRyYXMsIC8vIG9wdGlvbmFsXG4gICAgICAgICAgICB9KSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgZ2VvbWV0cnkgPSBuZXcgR2VvbWV0cnkoZ2wpO1xuXG4gICAgICAgICAgICAgICAgLy8gQWRkIGVhY2ggYXR0cmlidXRlIGZvdW5kIGluIHByaW1pdGl2ZVxuICAgICAgICAgICAgICAgIGZvciAobGV0IGF0dHIgaW4gYXR0cmlidXRlcykge1xuICAgICAgICAgICAgICAgICAgICBnZW9tZXRyeS5hZGRBdHRyaWJ1dGUoQVRUUklCVVRFU1thdHRyXSwgdGhpcy5wYXJzZUFjY2Vzc29yKGF0dHJpYnV0ZXNbYXR0cl0sIGRlc2MsIGJ1ZmZlclZpZXdzKSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gQWRkIGluZGV4IGF0dHJpYnV0ZSBpZiBmb3VuZFxuICAgICAgICAgICAgICAgIGlmIChpbmRpY2VzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgZ2VvbWV0cnkuYWRkQXR0cmlidXRlKCdpbmRleCcsIHRoaXMucGFyc2VBY2Nlc3NvcihpbmRpY2VzLCBkZXNjLCBidWZmZXJWaWV3cykpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIEFkZCBpbnN0YW5jZWQgdHJhbnNmb3JtIGF0dHJpYnV0ZSBpZiBtdWx0aXBsZSBpbnN0YW5jZXNcbiAgICAgICAgICAgICAgICBpZiAobnVtSW5zdGFuY2VzID4gMSkge1xuICAgICAgICAgICAgICAgICAgICBnZW9tZXRyeS5hZGRBdHRyaWJ1dGUoJ2luc3RhbmNlTWF0cml4Jywge1xuICAgICAgICAgICAgICAgICAgICAgICAgaW5zdGFuY2VkOiAxLFxuICAgICAgICAgICAgICAgICAgICAgICAgc2l6ZTogMTYsXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBuZXcgRmxvYXQzMkFycmF5KG51bUluc3RhbmNlcyAqIDE2KSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gVE9ETzogbWF0ZXJpYWxzXG4gICAgICAgICAgICAgICAgY29uc3QgcHJvZ3JhbSA9IG5ldyBOb3JtYWxQcm9ncmFtKGdsKTtcbiAgICAgICAgICAgICAgICBpZiAobWF0ZXJpYWxJbmRleCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIHByb2dyYW0uZ2x0Zk1hdGVyaWFsID0gbWF0ZXJpYWxzW21hdGVyaWFsSW5kZXhdO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIGdlb21ldHJ5LFxuICAgICAgICAgICAgICAgICAgICBwcm9ncmFtLFxuICAgICAgICAgICAgICAgICAgICBtb2RlLFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgc3RhdGljIHBhcnNlQWNjZXNzb3IoaW5kZXgsIGRlc2MsIGJ1ZmZlclZpZXdzKSB7XG4gICAgICAgIC8vIFRPRE86IGluaXQgbWlzc2luZyBidWZmZXJWaWV3IHdpdGggMHNcbiAgICAgICAgLy8gVE9ETzogc3VwcG9ydCBzcGFyc2VcblxuICAgICAgICBjb25zdCB7XG4gICAgICAgICAgICBidWZmZXJWaWV3OiBidWZmZXJWaWV3SW5kZXgsIC8vIG9wdGlvbmFsXG4gICAgICAgICAgICBieXRlT2Zmc2V0ID0gMCwgLy8gb3B0aW9uYWxcbiAgICAgICAgICAgIGNvbXBvbmVudFR5cGUsIC8vIHJlcXVpcmVkXG4gICAgICAgICAgICBub3JtYWxpemVkID0gZmFsc2UsIC8vIG9wdGlvbmFsXG4gICAgICAgICAgICBjb3VudCwgLy8gcmVxdWlyZWRcbiAgICAgICAgICAgIHR5cGUsIC8vIHJlcXVpcmVkXG4gICAgICAgICAgICBtaW4sIC8vIG9wdGlvbmFsXG4gICAgICAgICAgICBtYXgsIC8vIG9wdGlvbmFsXG4gICAgICAgICAgICBzcGFyc2UsIC8vIG9wdGlvbmFsXG4gICAgICAgICAgICAvLyBuYW1lLCAvLyBvcHRpb25hbFxuICAgICAgICAgICAgLy8gZXh0ZW5zaW9ucywgLy8gb3B0aW9uYWxcbiAgICAgICAgICAgIC8vIGV4dHJhcywgLy8gb3B0aW9uYWxcbiAgICAgICAgfSA9IGRlc2MuYWNjZXNzb3JzW2luZGV4XTtcblxuICAgICAgICBjb25zdCB7XG4gICAgICAgICAgICBkYXRhLCAvLyBhdHRhY2hlZCBpbiBwYXJzZUJ1ZmZlclZpZXdzXG4gICAgICAgICAgICBvcmlnaW5hbEJ1ZmZlciwgLy8gYXR0YWNoZWQgaW4gcGFyc2VCdWZmZXJWaWV3c1xuICAgICAgICAgICAgYnVmZmVyLCAvLyByZXBsYWNlZCB0byBiZSB0aGUgYWN0dWFsIEdMIGJ1ZmZlclxuICAgICAgICAgICAgYnl0ZU9mZnNldDogYnVmZmVyQnl0ZU9mZnNldCA9IDAsXG4gICAgICAgICAgICAvLyBieXRlTGVuZ3RoLCAvLyBhcHBsaWVkIGluIHBhcnNlQnVmZmVyVmlld3NcbiAgICAgICAgICAgIGJ5dGVTdHJpZGUgPSAwLFxuICAgICAgICAgICAgdGFyZ2V0LFxuICAgICAgICAgICAgLy8gbmFtZSxcbiAgICAgICAgICAgIC8vIGV4dGVuc2lvbnMsXG4gICAgICAgICAgICAvLyBleHRyYXMsXG4gICAgICAgIH0gPSBidWZmZXJWaWV3c1tidWZmZXJWaWV3SW5kZXhdO1xuXG4gICAgICAgIGNvbnN0IHNpemUgPSBUWVBFX1NJWkVbdHlwZV07XG5cbiAgICAgICAgLy8gUGFyc2UgZGF0YSBmcm9tIGpvaW5lZCBidWZmZXJzXG4gICAgICAgIGNvbnN0IFR5cGVBcnJheSA9IFRZUEVfQVJSQVlbY29tcG9uZW50VHlwZV07XG4gICAgICAgIGNvbnN0IGVsZW1lbnRCeXRlcyA9IGRhdGEuQllURVNfUEVSX0VMRU1FTlQ7XG4gICAgICAgIGNvbnN0IGNvbXBvbmVudE9mZnNldCA9IGJ5dGVPZmZzZXQgLyBlbGVtZW50Qnl0ZXM7XG4gICAgICAgIGNvbnN0IGNvbXBvbmVudFN0cmlkZSA9IGJ5dGVTdHJpZGUgLyBlbGVtZW50Qnl0ZXM7XG4gICAgICAgIGNvbnN0IGlzSW50ZXJsZWF2ZWQgPSAhIWJ5dGVTdHJpZGUgJiYgY29tcG9uZW50U3RyaWRlICE9PSBzaXplO1xuXG4gICAgICAgIC8vIFRPRE86IGludGVybGVhdmVkXG4gICAgICAgIGNvbnN0IG5ld0RhdGEgPSBpc0ludGVybGVhdmVkID8gZGF0YSA6IG5ldyBUeXBlQXJyYXkob3JpZ2luYWxCdWZmZXIsIGJ5dGVPZmZzZXQgKyBidWZmZXJCeXRlT2Zmc2V0LCBjb3VudCAqIHNpemUpO1xuXG4gICAgICAgIC8vIFJldHVybiBhdHRyaWJ1dGUgZGF0YVxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZGF0YTogbmV3RGF0YSxcbiAgICAgICAgICAgIHNpemUsXG4gICAgICAgICAgICB0eXBlOiBjb21wb25lbnRUeXBlLFxuICAgICAgICAgICAgbm9ybWFsaXplZCxcbiAgICAgICAgICAgIGJ1ZmZlcixcbiAgICAgICAgICAgIHN0cmlkZTogYnl0ZVN0cmlkZSxcbiAgICAgICAgICAgIG9mZnNldDogYnl0ZU9mZnNldCxcbiAgICAgICAgICAgIGNvdW50LFxuICAgICAgICAgICAgbWluLFxuICAgICAgICAgICAgbWF4LFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIHN0YXRpYyBwYXJzZU5vZGVzKGdsLCBkZXNjLCBtZXNoZXMsIHNraW5zKSB7XG4gICAgICAgIGlmICghZGVzYy5ub2RlcykgcmV0dXJuIG51bGw7XG4gICAgICAgIGNvbnN0IG5vZGVzID0gZGVzYy5ub2Rlcy5tYXAoXG4gICAgICAgICAgICAoe1xuICAgICAgICAgICAgICAgIGNhbWVyYSwgLy8gb3B0aW9uYWxcbiAgICAgICAgICAgICAgICBjaGlsZHJlbiwgLy8gb3B0aW9uYWxcbiAgICAgICAgICAgICAgICBza2luOiBza2luSW5kZXgsIC8vIG9wdGlvbmFsXG4gICAgICAgICAgICAgICAgbWF0cml4LCAvLyBvcHRpb25hbFxuICAgICAgICAgICAgICAgIG1lc2g6IG1lc2hJbmRleCwgLy8gb3B0aW9uYWxcbiAgICAgICAgICAgICAgICByb3RhdGlvbiwgLy8gb3B0aW9uYWxcbiAgICAgICAgICAgICAgICBzY2FsZSwgLy8gb3B0aW9uYWxcbiAgICAgICAgICAgICAgICB0cmFuc2xhdGlvbiwgLy8gb3B0aW9uYWxcbiAgICAgICAgICAgICAgICB3ZWlnaHRzLCAvLyBvcHRpb25hbFxuICAgICAgICAgICAgICAgIG5hbWUsIC8vIG9wdGlvbmFsXG4gICAgICAgICAgICAgICAgZXh0ZW5zaW9ucywgLy8gb3B0aW9uYWxcbiAgICAgICAgICAgICAgICBleHRyYXMsIC8vIG9wdGlvbmFsXG4gICAgICAgICAgICB9KSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3Qgbm9kZSA9IG5ldyBUcmFuc2Zvcm0oKTtcbiAgICAgICAgICAgICAgICBpZiAobmFtZSkgbm9kZS5uYW1lID0gbmFtZTtcblxuICAgICAgICAgICAgICAgIC8vIEFwcGx5IHRyYW5zZm9ybWF0aW9uc1xuICAgICAgICAgICAgICAgIGlmIChtYXRyaXgpIHtcbiAgICAgICAgICAgICAgICAgICAgbm9kZS5tYXRyaXguY29weShtYXRyaXgpO1xuICAgICAgICAgICAgICAgICAgICBub2RlLmRlY29tcG9zZSgpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChyb3RhdGlvbikgbm9kZS5xdWF0ZXJuaW9uLmNvcHkocm90YXRpb24pO1xuICAgICAgICAgICAgICAgICAgICBpZiAoc2NhbGUpIG5vZGUuc2NhbGUuY29weShzY2FsZSk7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0cmFuc2xhdGlvbikgbm9kZS5wb3NpdGlvbi5jb3B5KHRyYW5zbGF0aW9uKTtcbiAgICAgICAgICAgICAgICAgICAgbm9kZS51cGRhdGVNYXRyaXgoKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBGbGFncyBmb3IgYXZvaWRpbmcgZHVwbGljYXRlIHRyYW5zZm9ybXMgYW5kIHJlbW92aW5nIHVudXNlZCBpbnN0YW5jZSBub2Rlc1xuICAgICAgICAgICAgICAgIGxldCBpc0luc3RhbmNlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGxldCBpc0ZpcnN0SW5zdGFuY2UgPSB0cnVlO1xuXG4gICAgICAgICAgICAgICAgLy8gYWRkIG1lc2ggaWYgaW5jbHVkZWRcbiAgICAgICAgICAgICAgICBpZiAobWVzaEluZGV4ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgbWVzaGVzW21lc2hJbmRleF0ucHJpbWl0aXZlcy5mb3JFYWNoKChtZXNoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobWVzaC5nZW9tZXRyeS5pc0luc3RhbmNlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzSW5zdGFuY2VkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIW1lc2guaW5zdGFuY2VDb3VudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXNoLmluc3RhbmNlQ291bnQgPSAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzRmlyc3RJbnN0YW5jZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBub2RlLm1hdHJpeC50b0FycmF5KG1lc2guZ2VvbWV0cnkuYXR0cmlidXRlcy5pbnN0YW5jZU1hdHJpeC5kYXRhLCBtZXNoLmluc3RhbmNlQ291bnQgKiAxNik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVzaC5pbnN0YW5jZUNvdW50Kys7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobWVzaC5pbnN0YW5jZUNvdW50ID09PSBtZXNoLm51bUluc3RhbmNlcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBSZW1vdmUgcHJvcGVydGllcyBvbmNlIGFsbCBpbnN0YW5jZXMgYWRkZWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVsZXRlIG1lc2gubnVtSW5zdGFuY2VzO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWxldGUgbWVzaC5pbnN0YW5jZUNvdW50O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBGbGFnIGF0dHJpYnV0ZSBhcyBkaXJ0eVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXNoLmdlb21ldHJ5LmF0dHJpYnV0ZXMuaW5zdGFuY2VNYXRyaXgubmVlZHNVcGRhdGUgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gRm9yIGluc3RhbmNlcywgb25seSB0aGUgZmlyc3Qgbm9kZSB3aWxsIGFjdHVhbGx5IGhhdmUgdGhlIG1lc2hcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpc0luc3RhbmNlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpc0ZpcnN0SW5zdGFuY2UpIG1lc2guc2V0UGFyZW50KG5vZGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXNoLnNldFBhcmVudChub2RlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gUmVzZXQgbm9kZSBpZiBpbnN0YW5jZWQgdG8gbm90IGR1cGxpY2F0ZSB0cmFuc2Zvcm1zXG4gICAgICAgICAgICAgICAgaWYgKGlzSW5zdGFuY2VkKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFJlbW92ZSB1bnVzZWQgbm9kZXMganVzdCBwcm92aWRpbmcgYW4gaW5zdGFuY2UgdHJhbnNmb3JtXG4gICAgICAgICAgICAgICAgICAgIGlmICghaXNGaXJzdEluc3RhbmNlKSByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgLy8gQXZvaWQgZHVwbGljYXRlIHRyYW5zZm9ybSBmb3Igbm9kZSBjb250YWluaW5nIHRoZSBpbnN0YW5jZWQgbWVzaFxuICAgICAgICAgICAgICAgICAgICBub2RlLm1hdHJpeC5pZGVudGl0eSgpO1xuICAgICAgICAgICAgICAgICAgICBub2RlLmRlY29tcG9zZSgpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJldHVybiBub2RlO1xuICAgICAgICAgICAgfVxuICAgICAgICApO1xuXG4gICAgICAgIGRlc2Mubm9kZXMuZm9yRWFjaCgoeyBjaGlsZHJlbiA9IFtdIH0sIGkpID0+IHtcbiAgICAgICAgICAgIC8vIFNldCBoaWVyYXJjaHkgbm93IGFsbCBub2RlcyBjcmVhdGVkXG4gICAgICAgICAgICBjaGlsZHJlbi5mb3JFYWNoKChjaGlsZEluZGV4KSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCFub2Rlc1tjaGlsZEluZGV4XSkgcmV0dXJuO1xuICAgICAgICAgICAgICAgIG5vZGVzW2NoaWxkSW5kZXhdLnNldFBhcmVudChub2Rlc1tpXSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIG5vZGVzO1xuICAgIH1cblxuICAgIHN0YXRpYyBwb3B1bGF0ZVNraW5zKHNraW5zLCBub2Rlcykge1xuICAgICAgICBpZiAoIXNraW5zKSByZXR1cm47XG4gICAgICAgIHNraW5zLmZvckVhY2goKHNraW4pID0+IHtcbiAgICAgICAgICAgIHNraW4uam9pbnRzID0gc2tpbi5qb2ludHMubWFwKChpLCBpbmRleCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGpvaW50ID0gbm9kZXNbaV07XG4gICAgICAgICAgICAgICAgam9pbnQuYmluZEludmVyc2UgPSBuZXcgTWF0NCguLi5za2luLmludmVyc2VCaW5kTWF0cmljZXMuZGF0YS5zbGljZShpbmRleCAqIDE2LCAoaW5kZXggKyAxKSAqIDE2KSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGpvaW50O1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAoc2tpbi5za2VsZXRvbikgc2tpbi5za2VsZXRvbiA9IG5vZGVzW3NraW4uc2tlbGV0b25dO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBzdGF0aWMgcGFyc2VBbmltYXRpb25zKGdsLCBkZXNjLCBub2RlcywgYnVmZmVyVmlld3MpIHtcbiAgICAgICAgaWYgKCFkZXNjLmFuaW1hdGlvbnMpIHJldHVybiBudWxsO1xuICAgICAgICByZXR1cm4gZGVzYy5hbmltYXRpb25zLm1hcChcbiAgICAgICAgICAgICh7XG4gICAgICAgICAgICAgICAgY2hhbm5lbHMsIC8vIHJlcXVpcmVkXG4gICAgICAgICAgICAgICAgc2FtcGxlcnMsIC8vIHJlcXVpcmVkXG4gICAgICAgICAgICAgICAgbmFtZSwgLy8gb3B0aW9uYWxcbiAgICAgICAgICAgICAgICAvLyBleHRlbnNpb25zLCAvLyBvcHRpb25hbFxuICAgICAgICAgICAgICAgIC8vIGV4dHJhcywgIC8vIG9wdGlvbmFsXG4gICAgICAgICAgICB9KSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgZGF0YSA9IGNoYW5uZWxzLm1hcChcbiAgICAgICAgICAgICAgICAgICAgKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNhbXBsZXI6IHNhbXBsZXJJbmRleCwgLy8gcmVxdWlyZWRcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldCwgLy8gcmVxdWlyZWRcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGV4dGVuc2lvbnMsIC8vIG9wdGlvbmFsXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBleHRyYXMsIC8vIG9wdGlvbmFsXG4gICAgICAgICAgICAgICAgICAgIH0pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnB1dDogaW5wdXRJbmRleCwgLy8gcmVxdWlyZWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnRlcnBvbGF0aW9uID0gJ0xJTkVBUicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3V0cHV0OiBvdXRwdXRJbmRleCwgLy8gcmVxdWlyZWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBleHRlbnNpb25zLCAvLyBvcHRpb25hbFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGV4dHJhcywgLy8gb3B0aW9uYWxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gPSBzYW1wbGVyc1tzYW1wbGVySW5kZXhdO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZTogbm9kZUluZGV4LCAvLyBvcHRpb25hbCAtIFRPRE86IHdoZW4gaXMgaXQgbm90IGluY2x1ZGVkP1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhdGgsIC8vIHJlcXVpcmVkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gZXh0ZW5zaW9ucywgLy8gb3B0aW9uYWxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBleHRyYXMsIC8vIG9wdGlvbmFsXG4gICAgICAgICAgICAgICAgICAgICAgICB9ID0gdGFyZ2V0O1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBub2RlID0gbm9kZXNbbm9kZUluZGV4XTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHRyYW5zZm9ybSA9IFRSQU5TRk9STVNbcGF0aF07XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB0aW1lcyA9IHRoaXMucGFyc2VBY2Nlc3NvcihpbnB1dEluZGV4LCBkZXNjLCBidWZmZXJWaWV3cykuZGF0YTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHZhbHVlcyA9IHRoaXMucGFyc2VBY2Nlc3NvcihvdXRwdXRJbmRleCwgZGVzYywgYnVmZmVyVmlld3MpLmRhdGE7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2Zvcm0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW50ZXJwb2xhdGlvbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aW1lcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZXMsXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIG5hbWUsXG4gICAgICAgICAgICAgICAgICAgIGFuaW1hdGlvbjogbmV3IEdMVEZBbmltYXRpb24oZGF0YSksXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgcGFyc2VTY2VuZXMoZGVzYywgbm9kZXMpIHtcbiAgICAgICAgaWYgKCFkZXNjLnNjZW5lcykgcmV0dXJuIG51bGw7XG4gICAgICAgIHJldHVybiBkZXNjLnNjZW5lcy5tYXAoXG4gICAgICAgICAgICAoe1xuICAgICAgICAgICAgICAgIG5vZGVzOiBub2Rlc0luZGljZXMgPSBbXSxcbiAgICAgICAgICAgICAgICBuYW1lLCAvLyBvcHRpb25hbFxuICAgICAgICAgICAgICAgIGV4dGVuc2lvbnMsXG4gICAgICAgICAgICAgICAgZXh0cmFzLFxuICAgICAgICAgICAgfSkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBub2Rlc0luZGljZXMucmVkdWNlKChtYXAsIGkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgLy8gRG9uJ3QgYWRkIG51bGwgbm9kZXMgKGluc3RhbmNlZCB0cmFuc2Zvcm1zKVxuICAgICAgICAgICAgICAgICAgICBpZiAobm9kZXNbaV0pIG1hcC5wdXNoKG5vZGVzW2ldKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG1hcDtcbiAgICAgICAgICAgICAgICB9LCBbXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICk7XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgTWVzaCB9IGZyb20gJy4uL2NvcmUvTWVzaC5qcyc7XG5pbXBvcnQgeyBNYXQ0IH0gZnJvbSAnLi4vbWF0aC9NYXQ0LmpzJztcbmltcG9ydCB7IFRleHR1cmUgfSBmcm9tICcuLi9jb3JlL1RleHR1cmUuanMnO1xuXG5jb25zdCB0ZW1wTWF0NCA9IG5ldyBNYXQ0KCk7XG5jb25zdCBpZGVudGl0eSA9IG5ldyBNYXQ0KCk7XG5cbmV4cG9ydCBjbGFzcyBHTFRGU2tpbiBleHRlbmRzIE1lc2gge1xuICAgIGNvbnN0cnVjdG9yKGdsLCB7IHNrZWxldG9uLCBnZW9tZXRyeSwgcHJvZ3JhbSwgbW9kZSA9IGdsLlRSSUFOR0xFUyB9ID0ge30pIHtcbiAgICAgICAgc3VwZXIoZ2wsIHsgZ2VvbWV0cnksIHByb2dyYW0sIG1vZGUgfSk7XG4gICAgICAgIHRoaXMuc2tlbGV0b24gPSBza2VsZXRvbjtcbiAgICAgICAgdGhpcy5wcm9ncmFtID0gcHJvZ3JhbTtcbiAgICAgICAgdGhpcy5jcmVhdGVCb25lVGV4dHVyZSgpO1xuICAgICAgICB0aGlzLmFuaW1hdGlvbnMgPSBbXTtcbiAgICB9XG5cbiAgICBjcmVhdGVCb25lVGV4dHVyZSgpIHtcbiAgICAgICAgaWYgKCF0aGlzLnNrZWxldG9uLmpvaW50cy5sZW5ndGgpIHJldHVybjtcbiAgICAgICAgY29uc3Qgc2l6ZSA9IE1hdGgubWF4KDQsIE1hdGgucG93KDIsIE1hdGguY2VpbChNYXRoLmxvZyhNYXRoLnNxcnQodGhpcy5za2VsZXRvbi5qb2ludHMubGVuZ3RoICogNCkpIC8gTWF0aC5MTjIpKSk7XG4gICAgICAgIHRoaXMuYm9uZU1hdHJpY2VzID0gbmV3IEZsb2F0MzJBcnJheShzaXplICogc2l6ZSAqIDQpO1xuICAgICAgICB0aGlzLmJvbmVUZXh0dXJlU2l6ZSA9IHNpemU7XG4gICAgICAgIHRoaXMuYm9uZVRleHR1cmUgPSBuZXcgVGV4dHVyZSh0aGlzLmdsLCB7XG4gICAgICAgICAgICBpbWFnZTogdGhpcy5ib25lTWF0cmljZXMsXG4gICAgICAgICAgICBnZW5lcmF0ZU1pcG1hcHM6IGZhbHNlLFxuICAgICAgICAgICAgdHlwZTogdGhpcy5nbC5GTE9BVCxcbiAgICAgICAgICAgIGludGVybmFsRm9ybWF0OiB0aGlzLmdsLnJlbmRlcmVyLmlzV2ViZ2wyID8gdGhpcy5nbC5SR0JBMzJGIDogdGhpcy5nbC5SR0JBLFxuICAgICAgICAgICAgbWluRmlsdGVyOiB0aGlzLmdsLk5FQVJFU1QsXG4gICAgICAgICAgICBtYWdGaWx0ZXI6IHRoaXMuZ2wuTkVBUkVTVCxcbiAgICAgICAgICAgIGZsaXBZOiBmYWxzZSxcbiAgICAgICAgICAgIHdpZHRoOiBzaXplLFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBhZGRBbmltYXRpb24oZGF0YSkge1xuICAgIC8vICAgICBjb25zdCBhbmltYXRpb24gPSBuZXcgQW5pbWF0aW9uKHsgb2JqZWN0czogdGhpcy5ib25lcywgZGF0YSB9KTtcbiAgICAvLyAgICAgdGhpcy5hbmltYXRpb25zLnB1c2goYW5pbWF0aW9uKTtcbiAgICAvLyAgICAgcmV0dXJuIGFuaW1hdGlvbjtcbiAgICAvLyB9XG5cbiAgICAvLyB1cGRhdGVBbmltYXRpb25zKCkge1xuICAgIC8vICAgICAvLyBDYWxjdWxhdGUgY29tYmluZWQgYW5pbWF0aW9uIHdlaWdodFxuICAgIC8vICAgICBsZXQgdG90YWwgPSAwO1xuICAgIC8vICAgICB0aGlzLmFuaW1hdGlvbnMuZm9yRWFjaCgoYW5pbWF0aW9uKSA9PiAodG90YWwgKz0gYW5pbWF0aW9uLndlaWdodCkpO1xuXG4gICAgLy8gICAgIHRoaXMuYW5pbWF0aW9ucy5mb3JFYWNoKChhbmltYXRpb24sIGkpID0+IHtcbiAgICAvLyAgICAgICAgIC8vIGZvcmNlIGZpcnN0IGFuaW1hdGlvbiB0byBzZXQgaW4gb3JkZXIgdG8gcmVzZXQgZnJhbWVcbiAgICAvLyAgICAgICAgIGFuaW1hdGlvbi51cGRhdGUodG90YWwsIGkgPT09IDApO1xuICAgIC8vICAgICB9KTtcbiAgICAvLyB9XG5cbiAgICB1cGRhdGVVbmlmb3JtcygpIHtcbiAgICAgICAgLy8gVXBkYXRlIGJvbmUgdGV4dHVyZVxuICAgICAgICB0aGlzLnNrZWxldG9uLmpvaW50cy5mb3JFYWNoKChib25lLCBpKSA9PiB7XG4gICAgICAgICAgICAvLyBGaW5kIGRpZmZlcmVuY2UgYmV0d2VlbiBjdXJyZW50IGFuZCBiaW5kIHBvc2VcbiAgICAgICAgICAgIHRlbXBNYXQ0Lm11bHRpcGx5KGJvbmUud29ybGRNYXRyaXgsIGJvbmUuYmluZEludmVyc2UpO1xuICAgICAgICAgICAgdGhpcy5ib25lTWF0cmljZXMuc2V0KHRlbXBNYXQ0LCBpICogMTYpO1xuICAgICAgICB9KTtcbiAgICAgICAgaWYgKHRoaXMuYm9uZVRleHR1cmUpIHRoaXMuYm9uZVRleHR1cmUubmVlZHNVcGRhdGUgPSB0cnVlO1xuICAgIH1cblxuICAgIGRyYXcoeyBjYW1lcmEgfSA9IHt9KSB7XG4gICAgICAgIGlmICghdGhpcy5wcm9ncmFtLnVuaWZvcm1zLmJvbmVUZXh0dXJlKSB7XG4gICAgICAgICAgICBPYmplY3QuYXNzaWduKHRoaXMucHJvZ3JhbS51bmlmb3Jtcywge1xuICAgICAgICAgICAgICAgIGJvbmVUZXh0dXJlOiB7IHZhbHVlOiB0aGlzLmJvbmVUZXh0dXJlIH0sXG4gICAgICAgICAgICAgICAgYm9uZVRleHR1cmVTaXplOiB7IHZhbHVlOiB0aGlzLmJvbmVUZXh0dXJlU2l6ZSB9LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnVwZGF0ZVVuaWZvcm1zKCk7XG5cbiAgICAgICAgLy8gU3dpdGNoIHRoZSB3b3JsZCBtYXRyaXggd2l0aCBpZGVudGl0eSB0byBpZ25vcmUgYW55IHRyYW5zZm9ybXNcbiAgICAgICAgLy8gb24gdGhlIG1lc2ggaXRzZWxmIC0gb25seSB1c2Ugc2tlbGV0b24ncyB0cmFuc2Zvcm1zXG4gICAgICAgIGNvbnN0IF93b3JsZE1hdHJpeCA9IHRoaXMud29ybGRNYXRyaXg7XG4gICAgICAgIHRoaXMud29ybGRNYXRyaXggPSBpZGVudGl0eTtcblxuICAgICAgICBzdXBlci5kcmF3KHsgY2FtZXJhIH0pO1xuXG4gICAgICAgIC8vIFN3aXRjaCBiYWNrIHRvIGxlYXZlIGlkZW50aXR5IHVudG91Y2hlZFxuICAgICAgICB0aGlzLndvcmxkTWF0cml4ID0gX3dvcmxkTWF0cml4O1xuICAgIH1cbn1cbiIsImltcG9ydCB7IFByb2dyYW0gfSBmcm9tICcuLi9jb3JlL1Byb2dyYW0uanMnO1xuaW1wb3J0IHsgTWVzaCB9IGZyb20gJy4uL2NvcmUvTWVzaC5qcyc7XG5pbXBvcnQgeyBUZXh0dXJlIH0gZnJvbSAnLi4vY29yZS9UZXh0dXJlLmpzJztcbmltcG9ydCB7IFJlbmRlclRhcmdldCB9IGZyb20gJy4uL2NvcmUvUmVuZGVyVGFyZ2V0LmpzJztcbmltcG9ydCB7IFRyaWFuZ2xlIH0gZnJvbSAnLi9UcmlhbmdsZS5qcyc7XG5cbmV4cG9ydCBjbGFzcyBHUEdQVSB7XG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIGdsLFxuICAgICAgICB7XG4gICAgICAgICAgICAvLyBBbHdheXMgcGFzcyBpbiBhcnJheSBvZiB2ZWM0cyAoUkdCQSB2YWx1ZXMgd2l0aGluIHRleHR1cmUpXG4gICAgICAgICAgICBkYXRhID0gbmV3IEZsb2F0MzJBcnJheSgxNiksXG4gICAgICAgICAgICBnZW9tZXRyeSA9IG5ldyBUcmlhbmdsZShnbCksXG4gICAgICAgICAgICB0eXBlLCAvLyBQYXNzIGluIGdsLkZMT0FUIHRvIGZvcmNlIGl0LCBkZWZhdWx0cyB0byBnbC5IQUxGX0ZMT0FUXG4gICAgICAgIH1cbiAgICApIHtcbiAgICAgICAgdGhpcy5nbCA9IGdsO1xuICAgICAgICBjb25zdCBpbml0aWFsRGF0YSA9IGRhdGE7XG4gICAgICAgIHRoaXMucGFzc2VzID0gW107XG4gICAgICAgIHRoaXMuZ2VvbWV0cnkgPSBnZW9tZXRyeTtcbiAgICAgICAgdGhpcy5kYXRhTGVuZ3RoID0gaW5pdGlhbERhdGEubGVuZ3RoIC8gNDtcblxuICAgICAgICAvLyBXaW5kb3dzIGFuZCBpT1Mgb25seSBsaWtlIHBvd2VyIG9mIDIgdGV4dHVyZXNcbiAgICAgICAgLy8gRmluZCBzbWFsbGVzdCBQTzIgdGhhdCBmaXRzIGRhdGFcbiAgICAgICAgdGhpcy5zaXplID0gTWF0aC5wb3coMiwgTWF0aC5jZWlsKE1hdGgubG9nKE1hdGguY2VpbChNYXRoLnNxcnQodGhpcy5kYXRhTGVuZ3RoKSkpIC8gTWF0aC5MTjIpKTtcblxuICAgICAgICAvLyBDcmVhdGUgY29vcmRzIGZvciBvdXRwdXQgdGV4dHVyZVxuICAgICAgICB0aGlzLmNvb3JkcyA9IG5ldyBGbG9hdDMyQXJyYXkodGhpcy5kYXRhTGVuZ3RoICogMik7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5kYXRhTGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IHggPSAoaSAlIHRoaXMuc2l6ZSkgLyB0aGlzLnNpemU7IC8vIHRvIGFkZCAwLjUgdG8gYmUgY2VudGVyIHBpeGVsID9cbiAgICAgICAgICAgIGNvbnN0IHkgPSBNYXRoLmZsb29yKGkgLyB0aGlzLnNpemUpIC8gdGhpcy5zaXplO1xuICAgICAgICAgICAgdGhpcy5jb29yZHMuc2V0KFt4LCB5XSwgaSAqIDIpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gVXNlIG9yaWdpbmFsIGRhdGEgaWYgYWxyZWFkeSBjb3JyZWN0IGxlbmd0aCBvZiBQTzIgdGV4dHVyZSwgZWxzZSBjb3B5IHRvIG5ldyBhcnJheSBvZiBjb3JyZWN0IGxlbmd0aFxuICAgICAgICBjb25zdCBmbG9hdEFycmF5ID0gKCgpID0+IHtcbiAgICAgICAgICAgIGlmIChpbml0aWFsRGF0YS5sZW5ndGggPT09IHRoaXMuc2l6ZSAqIHRoaXMuc2l6ZSAqIDQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gaW5pdGlhbERhdGE7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnN0IGEgPSBuZXcgRmxvYXQzMkFycmF5KHRoaXMuc2l6ZSAqIHRoaXMuc2l6ZSAqIDQpO1xuICAgICAgICAgICAgICAgIGEuc2V0KGluaXRpYWxEYXRhKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gYTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkoKTtcblxuICAgICAgICAvLyBDcmVhdGUgb3V0cHV0IHRleHR1cmUgdW5pZm9ybSB1c2luZyBpbnB1dCBmbG9hdCB0ZXh0dXJlIHdpdGggaW5pdGlhbCBkYXRhXG4gICAgICAgIHRoaXMudW5pZm9ybSA9IHtcbiAgICAgICAgICAgIHZhbHVlOiBuZXcgVGV4dHVyZShnbCwge1xuICAgICAgICAgICAgICAgIGltYWdlOiBmbG9hdEFycmF5LFxuICAgICAgICAgICAgICAgIHRhcmdldDogZ2wuVEVYVFVSRV8yRCxcbiAgICAgICAgICAgICAgICB0eXBlOiBnbC5GTE9BVCxcbiAgICAgICAgICAgICAgICBmb3JtYXQ6IGdsLlJHQkEsXG4gICAgICAgICAgICAgICAgaW50ZXJuYWxGb3JtYXQ6IGdsLnJlbmRlcmVyLmlzV2ViZ2wyID8gZ2wuUkdCQTMyRiA6IGdsLlJHQkEsXG4gICAgICAgICAgICAgICAgd3JhcFM6IGdsLkNMQU1QX1RPX0VER0UsXG4gICAgICAgICAgICAgICAgd3JhcFQ6IGdsLkNMQU1QX1RPX0VER0UsXG4gICAgICAgICAgICAgICAgZ2VuZXJhdGVNaXBtYXBzOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBtaW5GaWx0ZXI6IGdsLk5FQVJFU1QsXG4gICAgICAgICAgICAgICAgbWFnRmlsdGVyOiBnbC5ORUFSRVNULFxuICAgICAgICAgICAgICAgIHdpZHRoOiB0aGlzLnNpemUsXG4gICAgICAgICAgICAgICAgZmxpcFk6IGZhbHNlLFxuICAgICAgICAgICAgfSksXG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gQ3JlYXRlIEZCT3NcbiAgICAgICAgY29uc3Qgb3B0aW9ucyA9IHtcbiAgICAgICAgICAgIHdpZHRoOiB0aGlzLnNpemUsXG4gICAgICAgICAgICBoZWlnaHQ6IHRoaXMuc2l6ZSxcbiAgICAgICAgICAgIHR5cGU6IHR5cGUgfHwgZ2wuSEFMRl9GTE9BVCB8fCBnbC5yZW5kZXJlci5leHRlbnNpb25zWydPRVNfdGV4dHVyZV9oYWxmX2Zsb2F0J10uSEFMRl9GTE9BVF9PRVMsXG4gICAgICAgICAgICBmb3JtYXQ6IGdsLlJHQkEsXG4gICAgICAgICAgICBpbnRlcm5hbEZvcm1hdDogZ2wucmVuZGVyZXIuaXNXZWJnbDIgPyAodHlwZSA9PT0gZ2wuRkxPQVQgPyBnbC5SR0JBMzJGIDogZ2wuUkdCQTE2RikgOiBnbC5SR0JBLFxuICAgICAgICAgICAgbWluRmlsdGVyOiBnbC5ORUFSRVNULFxuICAgICAgICAgICAgZGVwdGg6IGZhbHNlLFxuICAgICAgICAgICAgdW5wYWNrQWxpZ25tZW50OiAxLFxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuZmJvID0ge1xuICAgICAgICAgICAgcmVhZDogbmV3IFJlbmRlclRhcmdldChnbCwgb3B0aW9ucyksXG4gICAgICAgICAgICB3cml0ZTogbmV3IFJlbmRlclRhcmdldChnbCwgb3B0aW9ucyksXG4gICAgICAgICAgICBzd2FwOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IHRlbXAgPSB0aGlzLmZiby5yZWFkO1xuICAgICAgICAgICAgICAgIHRoaXMuZmJvLnJlYWQgPSB0aGlzLmZiby53cml0ZTtcbiAgICAgICAgICAgICAgICB0aGlzLmZiby53cml0ZSA9IHRlbXA7XG4gICAgICAgICAgICAgICAgdGhpcy51bmlmb3JtLnZhbHVlID0gdGhpcy5mYm8ucmVhZC50ZXh0dXJlO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBhZGRQYXNzKHsgdmVydGV4ID0gZGVmYXVsdFZlcnRleCwgZnJhZ21lbnQgPSBkZWZhdWx0RnJhZ21lbnQsIHVuaWZvcm1zID0ge30sIHRleHR1cmVVbmlmb3JtID0gJ3RNYXAnLCBlbmFibGVkID0gdHJ1ZSB9ID0ge30pIHtcbiAgICAgICAgdW5pZm9ybXNbdGV4dHVyZVVuaWZvcm1dID0gdGhpcy51bmlmb3JtO1xuICAgICAgICBjb25zdCBwcm9ncmFtID0gbmV3IFByb2dyYW0odGhpcy5nbCwgeyB2ZXJ0ZXgsIGZyYWdtZW50LCB1bmlmb3JtcyB9KTtcbiAgICAgICAgY29uc3QgbWVzaCA9IG5ldyBNZXNoKHRoaXMuZ2wsIHsgZ2VvbWV0cnk6IHRoaXMuZ2VvbWV0cnksIHByb2dyYW0gfSk7XG5cbiAgICAgICAgY29uc3QgcGFzcyA9IHtcbiAgICAgICAgICAgIG1lc2gsXG4gICAgICAgICAgICBwcm9ncmFtLFxuICAgICAgICAgICAgdW5pZm9ybXMsXG4gICAgICAgICAgICBlbmFibGVkLFxuICAgICAgICAgICAgdGV4dHVyZVVuaWZvcm0sXG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5wYXNzZXMucHVzaChwYXNzKTtcbiAgICAgICAgcmV0dXJuIHBhc3M7XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBjb25zdCBlbmFibGVkUGFzc2VzID0gdGhpcy5wYXNzZXMuZmlsdGVyKChwYXNzKSA9PiBwYXNzLmVuYWJsZWQpO1xuXG4gICAgICAgIGVuYWJsZWRQYXNzZXMuZm9yRWFjaCgocGFzcywgaSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5nbC5yZW5kZXJlci5yZW5kZXIoe1xuICAgICAgICAgICAgICAgIHNjZW5lOiBwYXNzLm1lc2gsXG4gICAgICAgICAgICAgICAgdGFyZ2V0OiB0aGlzLmZiby53cml0ZSxcbiAgICAgICAgICAgICAgICBjbGVhcjogZmFsc2UsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMuZmJvLnN3YXAoKTtcbiAgICAgICAgfSk7XG4gICAgfVxufVxuXG5jb25zdCBkZWZhdWx0VmVydGV4ID0gLyogZ2xzbCAqLyBgXG4gICAgYXR0cmlidXRlIHZlYzIgdXY7XG4gICAgYXR0cmlidXRlIHZlYzIgcG9zaXRpb247XG5cbiAgICB2YXJ5aW5nIHZlYzIgdlV2O1xuXG4gICAgdm9pZCBtYWluKCkge1xuICAgICAgICB2VXYgPSB1djtcbiAgICAgICAgZ2xfUG9zaXRpb24gPSB2ZWM0KHBvc2l0aW9uLCAwLCAxKTtcbiAgICB9XG5gO1xuXG5jb25zdCBkZWZhdWx0RnJhZ21lbnQgPSAvKiBnbHNsICovIGBcbiAgICBwcmVjaXNpb24gaGlnaHAgZmxvYXQ7XG5cbiAgICB1bmlmb3JtIHNhbXBsZXIyRCB0TWFwO1xuICAgIHZhcnlpbmcgdmVjMiB2VXY7XG5cbiAgICB2b2lkIG1haW4oKSB7XG4gICAgICAgIGdsX0ZyYWdDb2xvciA9IHRleHR1cmUyRCh0TWFwLCB2VXYpO1xuICAgIH1cbmA7XG4iLCJpbXBvcnQgeyBUZXh0dXJlIH0gZnJvbSAnLi4vY29yZS9UZXh0dXJlLmpzJztcblxuLy8gVE9ETzogU3VwcG9ydCBjdWJlbWFwc1xuLy8gR2VuZXJhdGUgdGV4dHVyZXMgdXNpbmcgaHR0cHM6Ly9naXRodWIuY29tL1RpbXZhblNjaGVycGVuemVlbC90ZXh0dXJlLWNvbXByZXNzb3JcblxuZXhwb3J0IGNsYXNzIEtUWFRleHR1cmUgZXh0ZW5kcyBUZXh0dXJlIHtcbiAgICBjb25zdHJ1Y3RvcihnbCwgeyBidWZmZXIsIHdyYXBTID0gZ2wuQ0xBTVBfVE9fRURHRSwgd3JhcFQgPSBnbC5DTEFNUF9UT19FREdFLCBhbmlzb3Ryb3B5ID0gMCwgbWluRmlsdGVyLCBtYWdGaWx0ZXIgfSA9IHt9KSB7XG4gICAgICAgIHN1cGVyKGdsLCB7XG4gICAgICAgICAgICBnZW5lcmF0ZU1pcG1hcHM6IGZhbHNlLFxuICAgICAgICAgICAgd3JhcFMsXG4gICAgICAgICAgICB3cmFwVCxcbiAgICAgICAgICAgIGFuaXNvdHJvcHksXG4gICAgICAgICAgICBtaW5GaWx0ZXIsXG4gICAgICAgICAgICBtYWdGaWx0ZXIsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmIChidWZmZXIpIHJldHVybiB0aGlzLnBhcnNlQnVmZmVyKGJ1ZmZlcik7XG4gICAgfVxuXG4gICAgcGFyc2VCdWZmZXIoYnVmZmVyKSB7XG4gICAgICAgIGNvbnN0IGt0eCA9IG5ldyBLaHJvbm9zVGV4dHVyZUNvbnRhaW5lcihidWZmZXIpO1xuICAgICAgICBrdHgubWlwbWFwcy5pc0NvbXByZXNzZWRUZXh0dXJlID0gdHJ1ZTtcblxuICAgICAgICAvLyBVcGRhdGUgdGV4dHVyZVxuICAgICAgICB0aGlzLmltYWdlID0ga3R4Lm1pcG1hcHM7XG4gICAgICAgIHRoaXMuaW50ZXJuYWxGb3JtYXQgPSBrdHguZ2xJbnRlcm5hbEZvcm1hdDtcbiAgICAgICAgaWYgKGt0eC5udW1iZXJPZk1pcG1hcExldmVscyA+IDEpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLm1pbkZpbHRlciA9PT0gdGhpcy5nbC5MSU5FQVIpIHRoaXMubWluRmlsdGVyID0gdGhpcy5nbC5ORUFSRVNUX01JUE1BUF9MSU5FQVI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAodGhpcy5taW5GaWx0ZXIgPT09IHRoaXMuZ2wuTkVBUkVTVF9NSVBNQVBfTElORUFSKSB0aGlzLm1pbkZpbHRlciA9IHRoaXMuZ2wuTElORUFSO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gVE9ETzogc3VwcG9ydCBjdWJlIG1hcHNcbiAgICAgICAgLy8ga3R4Lm51bWJlck9mRmFjZXNcbiAgICB9XG59XG5cbmZ1bmN0aW9uIEtocm9ub3NUZXh0dXJlQ29udGFpbmVyKGJ1ZmZlcikge1xuICAgIGNvbnN0IGlkQ2hlY2sgPSBbMHhhYiwgMHg0YiwgMHg1NCwgMHg1OCwgMHgyMCwgMHgzMSwgMHgzMSwgMHhiYiwgMHgwZCwgMHgwYSwgMHgxYSwgMHgwYV07XG4gICAgY29uc3QgaWQgPSBuZXcgVWludDhBcnJheShidWZmZXIsIDAsIDEyKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGlkLmxlbmd0aDsgaSsrKSBpZiAoaWRbaV0gIT09IGlkQ2hlY2tbaV0pIHJldHVybiBjb25zb2xlLmVycm9yKCdGaWxlIG1pc3NpbmcgS1RYIGlkZW50aWZpZXInKTtcblxuICAgIC8vIFRPRE86IElzIHRoaXMgYWx3YXlzIDQ/IFRlc3RlZDogW2FuZHJvaWQsIG1hY29zXVxuICAgIGNvbnN0IHNpemUgPSBVaW50MzJBcnJheS5CWVRFU19QRVJfRUxFTUVOVDtcbiAgICBjb25zdCBoZWFkID0gbmV3IERhdGFWaWV3KGJ1ZmZlciwgMTIsIDEzICogc2l6ZSk7XG4gICAgY29uc3QgbGl0dGxlRW5kaWFuID0gaGVhZC5nZXRVaW50MzIoMCwgdHJ1ZSkgPT09IDB4MDQwMzAyMDE7XG4gICAgY29uc3QgZ2xUeXBlID0gaGVhZC5nZXRVaW50MzIoMSAqIHNpemUsIGxpdHRsZUVuZGlhbik7XG4gICAgaWYgKGdsVHlwZSAhPT0gMCkgcmV0dXJuIGNvbnNvbGUud2Fybignb25seSBjb21wcmVzc2VkIGZvcm1hdHMgY3VycmVudGx5IHN1cHBvcnRlZCcpO1xuICAgIHRoaXMuZ2xJbnRlcm5hbEZvcm1hdCA9IGhlYWQuZ2V0VWludDMyKDQgKiBzaXplLCBsaXR0bGVFbmRpYW4pO1xuICAgIGxldCB3aWR0aCA9IGhlYWQuZ2V0VWludDMyKDYgKiBzaXplLCBsaXR0bGVFbmRpYW4pO1xuICAgIGxldCBoZWlnaHQgPSBoZWFkLmdldFVpbnQzMig3ICogc2l6ZSwgbGl0dGxlRW5kaWFuKTtcbiAgICB0aGlzLm51bWJlck9mRmFjZXMgPSBoZWFkLmdldFVpbnQzMigxMCAqIHNpemUsIGxpdHRsZUVuZGlhbik7XG4gICAgdGhpcy5udW1iZXJPZk1pcG1hcExldmVscyA9IE1hdGgubWF4KDEsIGhlYWQuZ2V0VWludDMyKDExICogc2l6ZSwgbGl0dGxlRW5kaWFuKSk7XG4gICAgY29uc3QgYnl0ZXNPZktleVZhbHVlRGF0YSA9IGhlYWQuZ2V0VWludDMyKDEyICogc2l6ZSwgbGl0dGxlRW5kaWFuKTtcblxuICAgIHRoaXMubWlwbWFwcyA9IFtdO1xuICAgIGxldCBvZmZzZXQgPSAxMiArIDEzICogNCArIGJ5dGVzT2ZLZXlWYWx1ZURhdGE7XG4gICAgZm9yIChsZXQgbGV2ZWwgPSAwOyBsZXZlbCA8IHRoaXMubnVtYmVyT2ZNaXBtYXBMZXZlbHM7IGxldmVsKyspIHtcbiAgICAgICAgY29uc3QgbGV2ZWxTaXplID0gbmV3IEludDMyQXJyYXkoYnVmZmVyLCBvZmZzZXQsIDEpWzBdOyAvLyBzaXplIHBlciBmYWNlLCBzaW5jZSBub3Qgc3VwcG9ydGluZyBhcnJheSBjdWJlbWFwc1xuICAgICAgICBvZmZzZXQgKz0gNDsgLy8gbGV2ZWxTaXplIGZpZWxkXG4gICAgICAgIGZvciAobGV0IGZhY2UgPSAwOyBmYWNlIDwgdGhpcy5udW1iZXJPZkZhY2VzOyBmYWNlKyspIHtcbiAgICAgICAgICAgIGNvbnN0IGRhdGEgPSBuZXcgVWludDhBcnJheShidWZmZXIsIG9mZnNldCwgbGV2ZWxTaXplKTtcbiAgICAgICAgICAgIHRoaXMubWlwbWFwcy5wdXNoKHsgZGF0YSwgd2lkdGgsIGhlaWdodCB9KTtcbiAgICAgICAgICAgIG9mZnNldCArPSBsZXZlbFNpemU7XG4gICAgICAgICAgICBvZmZzZXQgKz0gMyAtICgobGV2ZWxTaXplICsgMykgJSA0KTsgLy8gYWRkIHBhZGRpbmcgZm9yIG9kZCBzaXplZCBpbWFnZVxuICAgICAgICB9XG4gICAgICAgIHdpZHRoID0gd2lkdGggPj4gMTtcbiAgICAgICAgaGVpZ2h0ID0gaGVpZ2h0ID4+IDE7XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgUHJvZ3JhbSB9IGZyb20gJy4uL2NvcmUvUHJvZ3JhbS5qcyc7XG5cbmNvbnN0IHZlcnRleCA9IC8qIGdsc2wgKi8gYFxuICAgIHByZWNpc2lvbiBoaWdocCBmbG9hdDtcbiAgICBwcmVjaXNpb24gaGlnaHAgaW50O1xuXG4gICAgYXR0cmlidXRlIHZlYzMgcG9zaXRpb247XG4gICAgYXR0cmlidXRlIHZlYzMgbm9ybWFsO1xuXG4gICAgdW5pZm9ybSBtYXQzIG5vcm1hbE1hdHJpeDtcbiAgICB1bmlmb3JtIG1hdDQgbW9kZWxWaWV3TWF0cml4O1xuICAgIHVuaWZvcm0gbWF0NCBwcm9qZWN0aW9uTWF0cml4O1xuXG4gICAgdmFyeWluZyB2ZWMzIHZOb3JtYWw7XG5cbiAgICB2b2lkIG1haW4oKSB7XG4gICAgICAgIHZOb3JtYWwgPSBub3JtYWxpemUobm9ybWFsTWF0cml4ICogbm9ybWFsKTtcbiAgICAgICAgZ2xfUG9zaXRpb24gPSBwcm9qZWN0aW9uTWF0cml4ICogbW9kZWxWaWV3TWF0cml4ICogdmVjNChwb3NpdGlvbiwgMS4wKTtcbiAgICB9XG5gO1xuXG5jb25zdCBmcmFnbWVudCA9IC8qIGdsc2wgKi8gYFxuICAgIHByZWNpc2lvbiBoaWdocCBmbG9hdDtcbiAgICBwcmVjaXNpb24gaGlnaHAgaW50O1xuXG4gICAgdmFyeWluZyB2ZWMzIHZOb3JtYWw7XG5cbiAgICB2b2lkIG1haW4oKSB7XG4gICAgICAgIGdsX0ZyYWdDb2xvci5yZ2IgPSBub3JtYWxpemUodk5vcm1hbCk7XG4gICAgICAgIGdsX0ZyYWdDb2xvci5hID0gMS4wO1xuICAgIH1cbmA7XG5cbmV4cG9ydCBmdW5jdGlvbiBOb3JtYWxQcm9ncmFtKGdsKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9ncmFtKGdsLCB7XG4gICAgICAgIHZlcnRleDogdmVydGV4LFxuICAgICAgICBmcmFnbWVudDogZnJhZ21lbnQsXG4gICAgICAgIGN1bGxGYWNlOiBudWxsLFxuICAgIH0pO1xufVxuIiwiLy8gQmFzZWQgZnJvbSBUaHJlZUpTJyBPcmJpdENvbnRyb2xzIGNsYXNzLCByZXdyaXR0ZW4gdXNpbmcgZXM2IHdpdGggc29tZSBhZGRpdGlvbnMgYW5kIHN1YnRyYWN0aW9ucy5cbi8vIFRPRE86IGFic3RyYWN0IGV2ZW50IGhhbmRsZXJzIHNvIGNhbiBiZSBmZWQgZnJvbSBvdGhlciBzb3VyY2VzXG4vLyBUT0RPOiBtYWtlIHNjcm9sbCB6b29tIG1vcmUgYWNjdXJhdGUgdGhhbiBqdXN0ID4vPCB6ZXJvXG4vLyBUT0RPOiBiZSBhYmxlIHRvIHBhc3MgaW4gbmV3IGNhbWVyYSBwb3NpdGlvblxuXG5pbXBvcnQgeyBWZWMzIH0gZnJvbSAnLi4vbWF0aC9WZWMzLmpzJztcbmltcG9ydCB7IFZlYzIgfSBmcm9tICcuLi9tYXRoL1ZlYzIuanMnO1xuXG5jb25zdCBTVEFURSA9IHsgTk9ORTogLTEsIFJPVEFURTogMCwgRE9MTFk6IDEsIFBBTjogMiwgRE9MTFlfUEFOOiAzIH07XG5jb25zdCB0ZW1wVmVjMyA9IG5ldyBWZWMzKCk7XG5jb25zdCB0ZW1wVmVjMmEgPSBuZXcgVmVjMigpO1xuY29uc3QgdGVtcFZlYzJiID0gbmV3IFZlYzIoKTtcblxuZXhwb3J0IGZ1bmN0aW9uIE9yYml0KFxuICAgIG9iamVjdCxcbiAgICB7XG4gICAgICAgIGVsZW1lbnQgPSBkb2N1bWVudCxcbiAgICAgICAgZW5hYmxlZCA9IHRydWUsXG4gICAgICAgIHRhcmdldCA9IG5ldyBWZWMzKCksXG4gICAgICAgIGVhc2UgPSAwLjI1LFxuICAgICAgICBpbmVydGlhID0gMC44NSxcbiAgICAgICAgZW5hYmxlUm90YXRlID0gdHJ1ZSxcbiAgICAgICAgcm90YXRlU3BlZWQgPSAwLjEsXG4gICAgICAgIGF1dG9Sb3RhdGUgPSBmYWxzZSxcbiAgICAgICAgYXV0b1JvdGF0ZVNwZWVkID0gMS4wLFxuICAgICAgICBlbmFibGVab29tID0gdHJ1ZSxcbiAgICAgICAgem9vbVNwZWVkID0gMSxcbiAgICAgICAgZW5hYmxlUGFuID0gdHJ1ZSxcbiAgICAgICAgcGFuU3BlZWQgPSAwLjEsXG4gICAgICAgIG1pblBvbGFyQW5nbGUgPSAwLFxuICAgICAgICBtYXhQb2xhckFuZ2xlID0gTWF0aC5QSSxcbiAgICAgICAgbWluQXppbXV0aEFuZ2xlID0gLUluZmluaXR5LFxuICAgICAgICBtYXhBemltdXRoQW5nbGUgPSBJbmZpbml0eSxcbiAgICAgICAgbWluRGlzdGFuY2UgPSAwLFxuICAgICAgICBtYXhEaXN0YW5jZSA9IEluZmluaXR5LFxuICAgIH0gPSB7fVxuKSB7XG4gICAgdGhpcy5lbmFibGVkID0gZW5hYmxlZDtcbiAgICB0aGlzLnRhcmdldCA9IHRhcmdldDtcbiAgICB0aGlzLnJvdGF0ZVNwZWVkID0gcm90YXRlU3BlZWQ7XG4gICAgdGhpcy5wYW5TcGVlZCA9IHBhblNwZWVkO1xuICAgIC8vIENhdGNoIGF0dGVtcHRzIHRvIGRpc2FibGUgLSBzZXQgdG8gMSBzbyBoYXMgbm8gZWZmZWN0XG4gICAgZWFzZSA9IGVhc2UgfHwgMTtcbiAgICBpbmVydGlhID0gaW5lcnRpYSB8fCAwO1xuXG4gICAgdGhpcy5taW5EaXN0YW5jZSA9IG1pbkRpc3RhbmNlO1xuICAgIHRoaXMubWF4RGlzdGFuY2UgPSBtYXhEaXN0YW5jZTtcblxuICAgIC8vIGN1cnJlbnQgcG9zaXRpb24gaW4gc3BoZXJpY2FsVGFyZ2V0IGNvb3JkaW5hdGVzXG4gICAgY29uc3Qgc3BoZXJpY2FsRGVsdGEgPSB7IHJhZGl1czogMSwgcGhpOiAwLCB0aGV0YTogMCB9O1xuICAgIGNvbnN0IHNwaGVyaWNhbFRhcmdldCA9IHsgcmFkaXVzOiAxLCBwaGk6IDAsIHRoZXRhOiAwIH07XG4gICAgY29uc3Qgc3BoZXJpY2FsID0geyByYWRpdXM6IDEsIHBoaTogMCwgdGhldGE6IDAgfTtcbiAgICBjb25zdCBwYW5EZWx0YSA9IG5ldyBWZWMzKCk7XG5cbiAgICAvLyBHcmFiIGluaXRpYWwgcG9zaXRpb24gdmFsdWVzXG4gICAgY29uc3Qgb2Zmc2V0ID0gbmV3IFZlYzMoKTtcbiAgICBvZmZzZXQuY29weShvYmplY3QucG9zaXRpb24pLnN1Yih0aGlzLnRhcmdldCk7XG4gICAgc3BoZXJpY2FsLnJhZGl1cyA9IHNwaGVyaWNhbFRhcmdldC5yYWRpdXMgPSBvZmZzZXQuZGlzdGFuY2UoKTtcbiAgICBzcGhlcmljYWwudGhldGEgPSBzcGhlcmljYWxUYXJnZXQudGhldGEgPSBNYXRoLmF0YW4yKG9mZnNldC54LCBvZmZzZXQueik7XG4gICAgc3BoZXJpY2FsLnBoaSA9IHNwaGVyaWNhbFRhcmdldC5waGkgPSBNYXRoLmFjb3MoTWF0aC5taW4oTWF0aC5tYXgob2Zmc2V0LnkgLyBzcGhlcmljYWxUYXJnZXQucmFkaXVzLCAtMSksIDEpKTtcblxuICAgIHRoaXMub2Zmc2V0ID0gb2Zmc2V0O1xuXG4gICAgdGhpcy51cGRhdGUgPSAoKSA9PiB7XG4gICAgICAgIGlmIChhdXRvUm90YXRlKSB7XG4gICAgICAgICAgICBoYW5kbGVBdXRvUm90YXRlKCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBhcHBseSBkZWx0YVxuICAgICAgICBzcGhlcmljYWxUYXJnZXQucmFkaXVzICo9IHNwaGVyaWNhbERlbHRhLnJhZGl1cztcbiAgICAgICAgc3BoZXJpY2FsVGFyZ2V0LnRoZXRhICs9IHNwaGVyaWNhbERlbHRhLnRoZXRhO1xuICAgICAgICBzcGhlcmljYWxUYXJnZXQucGhpICs9IHNwaGVyaWNhbERlbHRhLnBoaTtcblxuICAgICAgICAvLyBhcHBseSBib3VuZGFyaWVzXG4gICAgICAgIHNwaGVyaWNhbFRhcmdldC50aGV0YSA9IE1hdGgubWF4KG1pbkF6aW11dGhBbmdsZSwgTWF0aC5taW4obWF4QXppbXV0aEFuZ2xlLCBzcGhlcmljYWxUYXJnZXQudGhldGEpKTtcbiAgICAgICAgc3BoZXJpY2FsVGFyZ2V0LnBoaSA9IE1hdGgubWF4KG1pblBvbGFyQW5nbGUsIE1hdGgubWluKG1heFBvbGFyQW5nbGUsIHNwaGVyaWNhbFRhcmdldC5waGkpKTtcbiAgICAgICAgc3BoZXJpY2FsVGFyZ2V0LnJhZGl1cyA9IE1hdGgubWF4KHRoaXMubWluRGlzdGFuY2UsIE1hdGgubWluKHRoaXMubWF4RGlzdGFuY2UsIHNwaGVyaWNhbFRhcmdldC5yYWRpdXMpKTtcblxuICAgICAgICAvLyBlYXNlIHZhbHVlc1xuICAgICAgICBzcGhlcmljYWwucGhpICs9IChzcGhlcmljYWxUYXJnZXQucGhpIC0gc3BoZXJpY2FsLnBoaSkgKiBlYXNlO1xuICAgICAgICBzcGhlcmljYWwudGhldGEgKz0gKHNwaGVyaWNhbFRhcmdldC50aGV0YSAtIHNwaGVyaWNhbC50aGV0YSkgKiBlYXNlO1xuICAgICAgICBzcGhlcmljYWwucmFkaXVzICs9IChzcGhlcmljYWxUYXJnZXQucmFkaXVzIC0gc3BoZXJpY2FsLnJhZGl1cykgKiBlYXNlO1xuXG4gICAgICAgIC8vIGFwcGx5IHBhbiB0byB0YXJnZXQuIEFzIG9mZnNldCBpcyByZWxhdGl2ZSB0byB0YXJnZXQsIGl0IGFsc28gc2hpZnRzXG4gICAgICAgIHRoaXMudGFyZ2V0LmFkZChwYW5EZWx0YSk7XG5cbiAgICAgICAgLy8gYXBwbHkgcm90YXRpb24gdG8gb2Zmc2V0XG4gICAgICAgIGxldCBzaW5QaGlSYWRpdXMgPSBzcGhlcmljYWwucmFkaXVzICogTWF0aC5zaW4oTWF0aC5tYXgoMC4wMDAwMDEsIHNwaGVyaWNhbC5waGkpKTtcbiAgICAgICAgb2Zmc2V0LnggPSBzaW5QaGlSYWRpdXMgKiBNYXRoLnNpbihzcGhlcmljYWwudGhldGEpO1xuICAgICAgICBvZmZzZXQueSA9IHNwaGVyaWNhbC5yYWRpdXMgKiBNYXRoLmNvcyhzcGhlcmljYWwucGhpKTtcbiAgICAgICAgb2Zmc2V0LnogPSBzaW5QaGlSYWRpdXMgKiBNYXRoLmNvcyhzcGhlcmljYWwudGhldGEpO1xuXG4gICAgICAgIC8vIEFwcGx5IHVwZGF0ZWQgdmFsdWVzIHRvIG9iamVjdFxuICAgICAgICBvYmplY3QucG9zaXRpb24uY29weSh0aGlzLnRhcmdldCkuYWRkKG9mZnNldCk7XG4gICAgICAgIG9iamVjdC5sb29rQXQodGhpcy50YXJnZXQpO1xuXG4gICAgICAgIC8vIEFwcGx5IGluZXJ0aWEgdG8gdmFsdWVzXG4gICAgICAgIHNwaGVyaWNhbERlbHRhLnRoZXRhICo9IGluZXJ0aWE7XG4gICAgICAgIHNwaGVyaWNhbERlbHRhLnBoaSAqPSBpbmVydGlhO1xuICAgICAgICBwYW5EZWx0YS5tdWx0aXBseShpbmVydGlhKTtcblxuICAgICAgICAvLyBSZXNldCBzY2FsZSBldmVyeSBmcmFtZSB0byBhdm9pZCBhcHBseWluZyBzY2FsZSBtdWx0aXBsZSB0aW1lc1xuICAgICAgICBzcGhlcmljYWxEZWx0YS5yYWRpdXMgPSAxO1xuICAgIH07XG5cbiAgICAvLyBVcGRhdGVzIGludGVybmFscyB3aXRoIG5ldyBwb3NpdGlvblxuICAgIHRoaXMuZm9yY2VQb3NpdGlvbiA9ICgpID0+IHtcbiAgICAgICAgb2Zmc2V0LmNvcHkob2JqZWN0LnBvc2l0aW9uKS5zdWIodGhpcy50YXJnZXQpO1xuICAgICAgICBzcGhlcmljYWwucmFkaXVzID0gc3BoZXJpY2FsVGFyZ2V0LnJhZGl1cyA9IG9mZnNldC5kaXN0YW5jZSgpO1xuICAgICAgICBzcGhlcmljYWwudGhldGEgPSBzcGhlcmljYWxUYXJnZXQudGhldGEgPSBNYXRoLmF0YW4yKG9mZnNldC54LCBvZmZzZXQueik7XG4gICAgICAgIHNwaGVyaWNhbC5waGkgPSBzcGhlcmljYWxUYXJnZXQucGhpID0gTWF0aC5hY29zKE1hdGgubWluKE1hdGgubWF4KG9mZnNldC55IC8gc3BoZXJpY2FsVGFyZ2V0LnJhZGl1cywgLTEpLCAxKSk7XG4gICAgICAgIG9iamVjdC5sb29rQXQodGhpcy50YXJnZXQpO1xuICAgIH07XG5cbiAgICAvLyBFdmVyeXRoaW5nIGJlbG93IGhlcmUganVzdCB1cGRhdGVzIHBhbkRlbHRhIGFuZCBzcGhlcmljYWxEZWx0YVxuICAgIC8vIFVzaW5nIHRob3NlIHR3byBvYmplY3RzJyB2YWx1ZXMsIHRoZSBvcmJpdCBpcyBjYWxjdWxhdGVkXG5cbiAgICBjb25zdCByb3RhdGVTdGFydCA9IG5ldyBWZWMyKCk7XG4gICAgY29uc3QgcGFuU3RhcnQgPSBuZXcgVmVjMigpO1xuICAgIGNvbnN0IGRvbGx5U3RhcnQgPSBuZXcgVmVjMigpO1xuXG4gICAgbGV0IHN0YXRlID0gU1RBVEUuTk9ORTtcbiAgICB0aGlzLm1vdXNlQnV0dG9ucyA9IHsgT1JCSVQ6IDAsIFpPT006IDEsIFBBTjogMiB9O1xuXG4gICAgZnVuY3Rpb24gZ2V0Wm9vbVNjYWxlKCkge1xuICAgICAgICByZXR1cm4gTWF0aC5wb3coMC45NSwgem9vbVNwZWVkKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwYW5MZWZ0KGRpc3RhbmNlLCBtKSB7XG4gICAgICAgIHRlbXBWZWMzLnNldChtWzBdLCBtWzFdLCBtWzJdKTtcbiAgICAgICAgdGVtcFZlYzMubXVsdGlwbHkoLWRpc3RhbmNlKTtcbiAgICAgICAgcGFuRGVsdGEuYWRkKHRlbXBWZWMzKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwYW5VcChkaXN0YW5jZSwgbSkge1xuICAgICAgICB0ZW1wVmVjMy5zZXQobVs0XSwgbVs1XSwgbVs2XSk7XG4gICAgICAgIHRlbXBWZWMzLm11bHRpcGx5KGRpc3RhbmNlKTtcbiAgICAgICAgcGFuRGVsdGEuYWRkKHRlbXBWZWMzKTtcbiAgICB9XG5cbiAgICBjb25zdCBwYW4gPSAoZGVsdGFYLCBkZWx0YVkpID0+IHtcbiAgICAgICAgbGV0IGVsID0gZWxlbWVudCA9PT0gZG9jdW1lbnQgPyBkb2N1bWVudC5ib2R5IDogZWxlbWVudDtcbiAgICAgICAgdGVtcFZlYzMuY29weShvYmplY3QucG9zaXRpb24pLnN1Yih0aGlzLnRhcmdldCk7XG4gICAgICAgIGxldCB0YXJnZXREaXN0YW5jZSA9IHRlbXBWZWMzLmRpc3RhbmNlKCk7XG4gICAgICAgIHRhcmdldERpc3RhbmNlICo9IE1hdGgudGFuKCgoKG9iamVjdC5mb3YgfHwgNDUpIC8gMikgKiBNYXRoLlBJKSAvIDE4MC4wKTtcbiAgICAgICAgcGFuTGVmdCgoMiAqIGRlbHRhWCAqIHRhcmdldERpc3RhbmNlKSAvIGVsLmNsaWVudEhlaWdodCwgb2JqZWN0Lm1hdHJpeCk7XG4gICAgICAgIHBhblVwKCgyICogZGVsdGFZICogdGFyZ2V0RGlzdGFuY2UpIC8gZWwuY2xpZW50SGVpZ2h0LCBvYmplY3QubWF0cml4KTtcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gZG9sbHkoZG9sbHlTY2FsZSkge1xuICAgICAgICBzcGhlcmljYWxEZWx0YS5yYWRpdXMgLz0gZG9sbHlTY2FsZTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBoYW5kbGVBdXRvUm90YXRlKCkge1xuICAgICAgICBjb25zdCBhbmdsZSA9ICgoMiAqIE1hdGguUEkpIC8gNjAgLyA2MCkgKiBhdXRvUm90YXRlU3BlZWQ7XG4gICAgICAgIHNwaGVyaWNhbERlbHRhLnRoZXRhIC09IGFuZ2xlO1xuICAgIH1cblxuICAgIGxldCBoYW5kbGVNb3ZlUm90YXRlID0gKHgsIHkpID0+IHtcbiAgICAgICAgdGVtcFZlYzJhLnNldCh4LCB5KTtcbiAgICAgICAgdGVtcFZlYzJiLnN1Yih0ZW1wVmVjMmEsIHJvdGF0ZVN0YXJ0KS5tdWx0aXBseSh0aGlzLnJvdGF0ZVNwZWVkKTtcbiAgICAgICAgbGV0IGVsID0gZWxlbWVudCA9PT0gZG9jdW1lbnQgPyBkb2N1bWVudC5ib2R5IDogZWxlbWVudDtcbiAgICAgICAgc3BoZXJpY2FsRGVsdGEudGhldGEgLT0gKDIgKiBNYXRoLlBJICogdGVtcFZlYzJiLngpIC8gZWwuY2xpZW50SGVpZ2h0O1xuICAgICAgICBzcGhlcmljYWxEZWx0YS5waGkgLT0gKDIgKiBNYXRoLlBJICogdGVtcFZlYzJiLnkpIC8gZWwuY2xpZW50SGVpZ2h0O1xuICAgICAgICByb3RhdGVTdGFydC5jb3B5KHRlbXBWZWMyYSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaGFuZGxlTW91c2VNb3ZlRG9sbHkoZSkge1xuICAgICAgICB0ZW1wVmVjMmEuc2V0KGUuY2xpZW50WCwgZS5jbGllbnRZKTtcbiAgICAgICAgdGVtcFZlYzJiLnN1Yih0ZW1wVmVjMmEsIGRvbGx5U3RhcnQpO1xuICAgICAgICBpZiAodGVtcFZlYzJiLnkgPiAwKSB7XG4gICAgICAgICAgICBkb2xseShnZXRab29tU2NhbGUoKSk7XG4gICAgICAgIH0gZWxzZSBpZiAodGVtcFZlYzJiLnkgPCAwKSB7XG4gICAgICAgICAgICBkb2xseSgxIC8gZ2V0Wm9vbVNjYWxlKCkpO1xuICAgICAgICB9XG4gICAgICAgIGRvbGx5U3RhcnQuY29weSh0ZW1wVmVjMmEpO1xuICAgIH1cblxuICAgIGxldCBoYW5kbGVNb3ZlUGFuID0gKHgsIHkpID0+IHtcbiAgICAgICAgdGVtcFZlYzJhLnNldCh4LCB5KTtcbiAgICAgICAgdGVtcFZlYzJiLnN1Yih0ZW1wVmVjMmEsIHBhblN0YXJ0KS5tdWx0aXBseSh0aGlzLnBhblNwZWVkKTtcbiAgICAgICAgcGFuKHRlbXBWZWMyYi54LCB0ZW1wVmVjMmIueSk7XG4gICAgICAgIHBhblN0YXJ0LmNvcHkodGVtcFZlYzJhKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBoYW5kbGVUb3VjaFN0YXJ0RG9sbHlQYW4oZSkge1xuICAgICAgICBpZiAoZW5hYmxlWm9vbSkge1xuICAgICAgICAgICAgbGV0IGR4ID0gZS50b3VjaGVzWzBdLnBhZ2VYIC0gZS50b3VjaGVzWzFdLnBhZ2VYO1xuICAgICAgICAgICAgbGV0IGR5ID0gZS50b3VjaGVzWzBdLnBhZ2VZIC0gZS50b3VjaGVzWzFdLnBhZ2VZO1xuICAgICAgICAgICAgbGV0IGRpc3RhbmNlID0gTWF0aC5zcXJ0KGR4ICogZHggKyBkeSAqIGR5KTtcbiAgICAgICAgICAgIGRvbGx5U3RhcnQuc2V0KDAsIGRpc3RhbmNlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChlbmFibGVQYW4pIHtcbiAgICAgICAgICAgIGxldCB4ID0gMC41ICogKGUudG91Y2hlc1swXS5wYWdlWCArIGUudG91Y2hlc1sxXS5wYWdlWCk7XG4gICAgICAgICAgICBsZXQgeSA9IDAuNSAqIChlLnRvdWNoZXNbMF0ucGFnZVkgKyBlLnRvdWNoZXNbMV0ucGFnZVkpO1xuICAgICAgICAgICAgcGFuU3RhcnQuc2V0KHgsIHkpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaGFuZGxlVG91Y2hNb3ZlRG9sbHlQYW4oZSkge1xuICAgICAgICBpZiAoZW5hYmxlWm9vbSkge1xuICAgICAgICAgICAgbGV0IGR4ID0gZS50b3VjaGVzWzBdLnBhZ2VYIC0gZS50b3VjaGVzWzFdLnBhZ2VYO1xuICAgICAgICAgICAgbGV0IGR5ID0gZS50b3VjaGVzWzBdLnBhZ2VZIC0gZS50b3VjaGVzWzFdLnBhZ2VZO1xuICAgICAgICAgICAgbGV0IGRpc3RhbmNlID0gTWF0aC5zcXJ0KGR4ICogZHggKyBkeSAqIGR5KTtcbiAgICAgICAgICAgIHRlbXBWZWMyYS5zZXQoMCwgZGlzdGFuY2UpO1xuICAgICAgICAgICAgdGVtcFZlYzJiLnNldCgwLCBNYXRoLnBvdyh0ZW1wVmVjMmEueSAvIGRvbGx5U3RhcnQueSwgem9vbVNwZWVkKSk7XG4gICAgICAgICAgICBkb2xseSh0ZW1wVmVjMmIueSk7XG4gICAgICAgICAgICBkb2xseVN0YXJ0LmNvcHkodGVtcFZlYzJhKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChlbmFibGVQYW4pIHtcbiAgICAgICAgICAgIGxldCB4ID0gMC41ICogKGUudG91Y2hlc1swXS5wYWdlWCArIGUudG91Y2hlc1sxXS5wYWdlWCk7XG4gICAgICAgICAgICBsZXQgeSA9IDAuNSAqIChlLnRvdWNoZXNbMF0ucGFnZVkgKyBlLnRvdWNoZXNbMV0ucGFnZVkpO1xuICAgICAgICAgICAgaGFuZGxlTW92ZVBhbih4LCB5KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IG9uTW91c2VEb3duID0gKGUpID0+IHtcbiAgICAgICAgaWYgKCF0aGlzLmVuYWJsZWQpIHJldHVybjtcblxuICAgICAgICBzd2l0Y2ggKGUuYnV0dG9uKSB7XG4gICAgICAgICAgICBjYXNlIHRoaXMubW91c2VCdXR0b25zLk9SQklUOlxuICAgICAgICAgICAgICAgIGlmIChlbmFibGVSb3RhdGUgPT09IGZhbHNlKSByZXR1cm47XG4gICAgICAgICAgICAgICAgcm90YXRlU3RhcnQuc2V0KGUuY2xpZW50WCwgZS5jbGllbnRZKTtcbiAgICAgICAgICAgICAgICBzdGF0ZSA9IFNUQVRFLlJPVEFURTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgdGhpcy5tb3VzZUJ1dHRvbnMuWk9PTTpcbiAgICAgICAgICAgICAgICBpZiAoZW5hYmxlWm9vbSA9PT0gZmFsc2UpIHJldHVybjtcbiAgICAgICAgICAgICAgICBkb2xseVN0YXJ0LnNldChlLmNsaWVudFgsIGUuY2xpZW50WSk7XG4gICAgICAgICAgICAgICAgc3RhdGUgPSBTVEFURS5ET0xMWTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgdGhpcy5tb3VzZUJ1dHRvbnMuUEFOOlxuICAgICAgICAgICAgICAgIGlmIChlbmFibGVQYW4gPT09IGZhbHNlKSByZXR1cm47XG4gICAgICAgICAgICAgICAgcGFuU3RhcnQuc2V0KGUuY2xpZW50WCwgZS5jbGllbnRZKTtcbiAgICAgICAgICAgICAgICBzdGF0ZSA9IFNUQVRFLlBBTjtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChzdGF0ZSAhPT0gU1RBVEUuTk9ORSkge1xuICAgICAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIG9uTW91c2VNb3ZlLCBmYWxzZSk7XG4gICAgICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIG9uTW91c2VVcCwgZmFsc2UpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIGNvbnN0IG9uTW91c2VNb3ZlID0gKGUpID0+IHtcbiAgICAgICAgaWYgKCF0aGlzLmVuYWJsZWQpIHJldHVybjtcblxuICAgICAgICBzd2l0Y2ggKHN0YXRlKSB7XG4gICAgICAgICAgICBjYXNlIFNUQVRFLlJPVEFURTpcbiAgICAgICAgICAgICAgICBpZiAoZW5hYmxlUm90YXRlID09PSBmYWxzZSkgcmV0dXJuO1xuICAgICAgICAgICAgICAgIGhhbmRsZU1vdmVSb3RhdGUoZS5jbGllbnRYLCBlLmNsaWVudFkpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBTVEFURS5ET0xMWTpcbiAgICAgICAgICAgICAgICBpZiAoZW5hYmxlWm9vbSA9PT0gZmFsc2UpIHJldHVybjtcbiAgICAgICAgICAgICAgICBoYW5kbGVNb3VzZU1vdmVEb2xseShlKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgU1RBVEUuUEFOOlxuICAgICAgICAgICAgICAgIGlmIChlbmFibGVQYW4gPT09IGZhbHNlKSByZXR1cm47XG4gICAgICAgICAgICAgICAgaGFuZGxlTW92ZVBhbihlLmNsaWVudFgsIGUuY2xpZW50WSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgY29uc3Qgb25Nb3VzZVVwID0gKCkgPT4ge1xuICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgb25Nb3VzZU1vdmUsIGZhbHNlKTtcbiAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCBvbk1vdXNlVXAsIGZhbHNlKTtcbiAgICAgICAgc3RhdGUgPSBTVEFURS5OT05FO1xuICAgIH07XG5cbiAgICBjb25zdCBvbk1vdXNlV2hlZWwgPSAoZSkgPT4ge1xuICAgICAgICBpZiAoIXRoaXMuZW5hYmxlZCB8fCAhZW5hYmxlWm9vbSB8fCAoc3RhdGUgIT09IFNUQVRFLk5PTkUgJiYgc3RhdGUgIT09IFNUQVRFLlJPVEFURSkpIHJldHVybjtcbiAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgIGlmIChlLmRlbHRhWSA8IDApIHtcbiAgICAgICAgICAgIGRvbGx5KDEgLyBnZXRab29tU2NhbGUoKSk7XG4gICAgICAgIH0gZWxzZSBpZiAoZS5kZWx0YVkgPiAwKSB7XG4gICAgICAgICAgICBkb2xseShnZXRab29tU2NhbGUoKSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgY29uc3Qgb25Ub3VjaFN0YXJ0ID0gKGUpID0+IHtcbiAgICAgICAgaWYgKCF0aGlzLmVuYWJsZWQpIHJldHVybjtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgIHN3aXRjaCAoZS50b3VjaGVzLmxlbmd0aCkge1xuICAgICAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgICAgIGlmIChlbmFibGVSb3RhdGUgPT09IGZhbHNlKSByZXR1cm47XG4gICAgICAgICAgICAgICAgcm90YXRlU3RhcnQuc2V0KGUudG91Y2hlc1swXS5wYWdlWCwgZS50b3VjaGVzWzBdLnBhZ2VZKTtcbiAgICAgICAgICAgICAgICBzdGF0ZSA9IFNUQVRFLlJPVEFURTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgICAgICBpZiAoZW5hYmxlWm9vbSA9PT0gZmFsc2UgJiYgZW5hYmxlUGFuID09PSBmYWxzZSkgcmV0dXJuO1xuICAgICAgICAgICAgICAgIGhhbmRsZVRvdWNoU3RhcnREb2xseVBhbihlKTtcbiAgICAgICAgICAgICAgICBzdGF0ZSA9IFNUQVRFLkRPTExZX1BBTjtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgc3RhdGUgPSBTVEFURS5OT05FO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIGNvbnN0IG9uVG91Y2hNb3ZlID0gKGUpID0+IHtcbiAgICAgICAgaWYgKCF0aGlzLmVuYWJsZWQpIHJldHVybjtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuXG4gICAgICAgIHN3aXRjaCAoZS50b3VjaGVzLmxlbmd0aCkge1xuICAgICAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgICAgIGlmIChlbmFibGVSb3RhdGUgPT09IGZhbHNlKSByZXR1cm47XG4gICAgICAgICAgICAgICAgaGFuZGxlTW92ZVJvdGF0ZShlLnRvdWNoZXNbMF0ucGFnZVgsIGUudG91Y2hlc1swXS5wYWdlWSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICAgICAgaWYgKGVuYWJsZVpvb20gPT09IGZhbHNlICYmIGVuYWJsZVBhbiA9PT0gZmFsc2UpIHJldHVybjtcbiAgICAgICAgICAgICAgICBoYW5kbGVUb3VjaE1vdmVEb2xseVBhbihlKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgc3RhdGUgPSBTVEFURS5OT05FO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIGNvbnN0IG9uVG91Y2hFbmQgPSAoKSA9PiB7XG4gICAgICAgIGlmICghdGhpcy5lbmFibGVkKSByZXR1cm47XG4gICAgICAgIHN0YXRlID0gU1RBVEUuTk9ORTtcbiAgICB9O1xuXG4gICAgY29uc3Qgb25Db250ZXh0TWVudSA9IChlKSA9PiB7XG4gICAgICAgIGlmICghdGhpcy5lbmFibGVkKSByZXR1cm47XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gYWRkSGFuZGxlcnMoKSB7XG4gICAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY29udGV4dG1lbnUnLCBvbkNvbnRleHRNZW51LCBmYWxzZSk7XG4gICAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgb25Nb3VzZURvd24sIGZhbHNlKTtcbiAgICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCd3aGVlbCcsIG9uTW91c2VXaGVlbCwgeyBwYXNzaXZlOiBmYWxzZSB9KTtcbiAgICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0Jywgb25Ub3VjaFN0YXJ0LCB7IHBhc3NpdmU6IGZhbHNlIH0pO1xuICAgICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgb25Ub3VjaEVuZCwgZmFsc2UpO1xuICAgICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIG9uVG91Y2hNb3ZlLCB7IHBhc3NpdmU6IGZhbHNlIH0pO1xuICAgIH1cblxuICAgIHRoaXMucmVtb3ZlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBlbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NvbnRleHRtZW51Jywgb25Db250ZXh0TWVudSk7XG4gICAgICAgIGVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgb25Nb3VzZURvd24pO1xuICAgICAgICBlbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3doZWVsJywgb25Nb3VzZVdoZWVsKTtcbiAgICAgICAgZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0Jywgb25Ub3VjaFN0YXJ0KTtcbiAgICAgICAgZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIG9uVG91Y2hFbmQpO1xuICAgICAgICBlbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIG9uVG91Y2hNb3ZlKTtcbiAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIG9uTW91c2VNb3ZlKTtcbiAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCBvbk1vdXNlVXApO1xuICAgIH07XG5cbiAgICBhZGRIYW5kbGVycygpO1xufVxuIiwiaW1wb3J0IHsgR2VvbWV0cnkgfSBmcm9tICcuLi9jb3JlL0dlb21ldHJ5LmpzJztcblxuZXhwb3J0IGNsYXNzIFBsYW5lIGV4dGVuZHMgR2VvbWV0cnkge1xuICAgIGNvbnN0cnVjdG9yKGdsLCB7IHdpZHRoID0gMSwgaGVpZ2h0ID0gMSwgd2lkdGhTZWdtZW50cyA9IDEsIGhlaWdodFNlZ21lbnRzID0gMSwgYXR0cmlidXRlcyA9IHt9IH0gPSB7fSkge1xuICAgICAgICBjb25zdCB3U2VncyA9IHdpZHRoU2VnbWVudHM7XG4gICAgICAgIGNvbnN0IGhTZWdzID0gaGVpZ2h0U2VnbWVudHM7XG5cbiAgICAgICAgLy8gRGV0ZXJtaW5lIGxlbmd0aCBvZiBhcnJheXNcbiAgICAgICAgY29uc3QgbnVtID0gKHdTZWdzICsgMSkgKiAoaFNlZ3MgKyAxKTtcbiAgICAgICAgY29uc3QgbnVtSW5kaWNlcyA9IHdTZWdzICogaFNlZ3MgKiA2O1xuXG4gICAgICAgIC8vIEdlbmVyYXRlIGVtcHR5IGFycmF5cyBvbmNlXG4gICAgICAgIGNvbnN0IHBvc2l0aW9uID0gbmV3IEZsb2F0MzJBcnJheShudW0gKiAzKTtcbiAgICAgICAgY29uc3Qgbm9ybWFsID0gbmV3IEZsb2F0MzJBcnJheShudW0gKiAzKTtcbiAgICAgICAgY29uc3QgdXYgPSBuZXcgRmxvYXQzMkFycmF5KG51bSAqIDIpO1xuICAgICAgICBjb25zdCBpbmRleCA9IG51bSA+IDY1NTM2ID8gbmV3IFVpbnQzMkFycmF5KG51bUluZGljZXMpIDogbmV3IFVpbnQxNkFycmF5KG51bUluZGljZXMpO1xuXG4gICAgICAgIFBsYW5lLmJ1aWxkUGxhbmUocG9zaXRpb24sIG5vcm1hbCwgdXYsIGluZGV4LCB3aWR0aCwgaGVpZ2h0LCAwLCB3U2VncywgaFNlZ3MpO1xuXG4gICAgICAgIE9iamVjdC5hc3NpZ24oYXR0cmlidXRlcywge1xuICAgICAgICAgICAgcG9zaXRpb246IHsgc2l6ZTogMywgZGF0YTogcG9zaXRpb24gfSxcbiAgICAgICAgICAgIG5vcm1hbDogeyBzaXplOiAzLCBkYXRhOiBub3JtYWwgfSxcbiAgICAgICAgICAgIHV2OiB7IHNpemU6IDIsIGRhdGE6IHV2IH0sXG4gICAgICAgICAgICBpbmRleDogeyBkYXRhOiBpbmRleCB9LFxuICAgICAgICB9KTtcblxuICAgICAgICBzdXBlcihnbCwgYXR0cmlidXRlcyk7XG4gICAgfVxuXG4gICAgc3RhdGljIGJ1aWxkUGxhbmUocG9zaXRpb24sIG5vcm1hbCwgdXYsIGluZGV4LCB3aWR0aCwgaGVpZ2h0LCBkZXB0aCwgd1NlZ3MsIGhTZWdzLCB1ID0gMCwgdiA9IDEsIHcgPSAyLCB1RGlyID0gMSwgdkRpciA9IC0xLCBpID0gMCwgaWkgPSAwKSB7XG4gICAgICAgIGNvbnN0IGlvID0gaTtcbiAgICAgICAgY29uc3Qgc2VnVyA9IHdpZHRoIC8gd1NlZ3M7XG4gICAgICAgIGNvbnN0IHNlZ0ggPSBoZWlnaHQgLyBoU2VncztcblxuICAgICAgICBmb3IgKGxldCBpeSA9IDA7IGl5IDw9IGhTZWdzOyBpeSsrKSB7XG4gICAgICAgICAgICBsZXQgeSA9IGl5ICogc2VnSCAtIGhlaWdodCAvIDI7XG4gICAgICAgICAgICBmb3IgKGxldCBpeCA9IDA7IGl4IDw9IHdTZWdzOyBpeCsrLCBpKyspIHtcbiAgICAgICAgICAgICAgICBsZXQgeCA9IGl4ICogc2VnVyAtIHdpZHRoIC8gMjtcblxuICAgICAgICAgICAgICAgIHBvc2l0aW9uW2kgKiAzICsgdV0gPSB4ICogdURpcjtcbiAgICAgICAgICAgICAgICBwb3NpdGlvbltpICogMyArIHZdID0geSAqIHZEaXI7XG4gICAgICAgICAgICAgICAgcG9zaXRpb25baSAqIDMgKyB3XSA9IGRlcHRoIC8gMjtcblxuICAgICAgICAgICAgICAgIG5vcm1hbFtpICogMyArIHVdID0gMDtcbiAgICAgICAgICAgICAgICBub3JtYWxbaSAqIDMgKyB2XSA9IDA7XG4gICAgICAgICAgICAgICAgbm9ybWFsW2kgKiAzICsgd10gPSBkZXB0aCA+PSAwID8gMSA6IC0xO1xuXG4gICAgICAgICAgICAgICAgdXZbaSAqIDJdID0gaXggLyB3U2VncztcbiAgICAgICAgICAgICAgICB1dltpICogMiArIDFdID0gMSAtIGl5IC8gaFNlZ3M7XG5cbiAgICAgICAgICAgICAgICBpZiAoaXkgPT09IGhTZWdzIHx8IGl4ID09PSB3U2VncykgY29udGludWU7XG4gICAgICAgICAgICAgICAgbGV0IGEgPSBpbyArIGl4ICsgaXkgKiAod1NlZ3MgKyAxKTtcbiAgICAgICAgICAgICAgICBsZXQgYiA9IGlvICsgaXggKyAoaXkgKyAxKSAqICh3U2VncyArIDEpO1xuICAgICAgICAgICAgICAgIGxldCBjID0gaW8gKyBpeCArIChpeSArIDEpICogKHdTZWdzICsgMSkgKyAxO1xuICAgICAgICAgICAgICAgIGxldCBkID0gaW8gKyBpeCArIGl5ICogKHdTZWdzICsgMSkgKyAxO1xuXG4gICAgICAgICAgICAgICAgaW5kZXhbaWkgKiA2XSA9IGE7XG4gICAgICAgICAgICAgICAgaW5kZXhbaWkgKiA2ICsgMV0gPSBiO1xuICAgICAgICAgICAgICAgIGluZGV4W2lpICogNiArIDJdID0gZDtcbiAgICAgICAgICAgICAgICBpbmRleFtpaSAqIDYgKyAzXSA9IGI7XG4gICAgICAgICAgICAgICAgaW5kZXhbaWkgKiA2ICsgNF0gPSBjO1xuICAgICAgICAgICAgICAgIGluZGV4W2lpICogNiArIDVdID0gZDtcbiAgICAgICAgICAgICAgICBpaSsrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgR2VvbWV0cnkgfSBmcm9tICcuLi9jb3JlL0dlb21ldHJ5LmpzJztcbmltcG9ydCB7IFByb2dyYW0gfSBmcm9tICcuLi9jb3JlL1Byb2dyYW0uanMnO1xuaW1wb3J0IHsgTWVzaCB9IGZyb20gJy4uL2NvcmUvTWVzaC5qcyc7XG5pbXBvcnQgeyBWZWMyIH0gZnJvbSAnLi4vbWF0aC9WZWMyLmpzJztcbmltcG9ydCB7IFZlYzMgfSBmcm9tICcuLi9tYXRoL1ZlYzMuanMnO1xuaW1wb3J0IHsgQ29sb3IgfSBmcm9tICcuLi9tYXRoL0NvbG9yLmpzJztcblxuY29uc3QgdG1wID0gbmV3IFZlYzMoKTtcblxuZXhwb3J0IGNsYXNzIFBvbHlsaW5lIHtcbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgZ2wsXG4gICAgICAgIHtcbiAgICAgICAgICAgIHBvaW50cywgLy8gQXJyYXkgb2YgVmVjM3NcbiAgICAgICAgICAgIHZlcnRleCA9IGRlZmF1bHRWZXJ0ZXgsXG4gICAgICAgICAgICBmcmFnbWVudCA9IGRlZmF1bHRGcmFnbWVudCxcbiAgICAgICAgICAgIHVuaWZvcm1zID0ge30sXG4gICAgICAgICAgICBhdHRyaWJ1dGVzID0ge30sIC8vIEZvciBwYXNzaW5nIGluIGN1c3RvbSBhdHRyaWJzXG4gICAgICAgIH1cbiAgICApIHtcbiAgICAgICAgdGhpcy5nbCA9IGdsO1xuICAgICAgICB0aGlzLnBvaW50cyA9IHBvaW50cztcbiAgICAgICAgdGhpcy5jb3VudCA9IHBvaW50cy5sZW5ndGg7XG5cbiAgICAgICAgLy8gQ3JlYXRlIGJ1ZmZlcnNcbiAgICAgICAgdGhpcy5wb3NpdGlvbiA9IG5ldyBGbG9hdDMyQXJyYXkodGhpcy5jb3VudCAqIDMgKiAyKTtcbiAgICAgICAgdGhpcy5wcmV2ID0gbmV3IEZsb2F0MzJBcnJheSh0aGlzLmNvdW50ICogMyAqIDIpO1xuICAgICAgICB0aGlzLm5leHQgPSBuZXcgRmxvYXQzMkFycmF5KHRoaXMuY291bnQgKiAzICogMik7XG4gICAgICAgIGNvbnN0IHNpZGUgPSBuZXcgRmxvYXQzMkFycmF5KHRoaXMuY291bnQgKiAxICogMik7XG4gICAgICAgIGNvbnN0IHV2ID0gbmV3IEZsb2F0MzJBcnJheSh0aGlzLmNvdW50ICogMiAqIDIpO1xuICAgICAgICBjb25zdCBpbmRleCA9IG5ldyBVaW50MTZBcnJheSgodGhpcy5jb3VudCAtIDEpICogMyAqIDIpO1xuXG4gICAgICAgIC8vIFNldCBzdGF0aWMgYnVmZmVyc1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuY291bnQ7IGkrKykge1xuICAgICAgICAgICAgc2lkZS5zZXQoWy0xLCAxXSwgaSAqIDIpO1xuICAgICAgICAgICAgY29uc3QgdiA9IGkgLyAodGhpcy5jb3VudCAtIDEpO1xuICAgICAgICAgICAgdXYuc2V0KFswLCB2LCAxLCB2XSwgaSAqIDQpO1xuXG4gICAgICAgICAgICBpZiAoaSA9PT0gdGhpcy5jb3VudCAtIDEpIGNvbnRpbnVlO1xuICAgICAgICAgICAgY29uc3QgaW5kID0gaSAqIDI7XG4gICAgICAgICAgICBpbmRleC5zZXQoW2luZCArIDAsIGluZCArIDEsIGluZCArIDJdLCAoaW5kICsgMCkgKiAzKTtcbiAgICAgICAgICAgIGluZGV4LnNldChbaW5kICsgMiwgaW5kICsgMSwgaW5kICsgM10sIChpbmQgKyAxKSAqIDMpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgZ2VvbWV0cnkgPSAodGhpcy5nZW9tZXRyeSA9IG5ldyBHZW9tZXRyeShcbiAgICAgICAgICAgIGdsLFxuICAgICAgICAgICAgT2JqZWN0LmFzc2lnbihhdHRyaWJ1dGVzLCB7XG4gICAgICAgICAgICAgICAgcG9zaXRpb246IHsgc2l6ZTogMywgZGF0YTogdGhpcy5wb3NpdGlvbiB9LFxuICAgICAgICAgICAgICAgIHByZXY6IHsgc2l6ZTogMywgZGF0YTogdGhpcy5wcmV2IH0sXG4gICAgICAgICAgICAgICAgbmV4dDogeyBzaXplOiAzLCBkYXRhOiB0aGlzLm5leHQgfSxcbiAgICAgICAgICAgICAgICBzaWRlOiB7IHNpemU6IDEsIGRhdGE6IHNpZGUgfSxcbiAgICAgICAgICAgICAgICB1djogeyBzaXplOiAyLCBkYXRhOiB1diB9LFxuICAgICAgICAgICAgICAgIGluZGV4OiB7IHNpemU6IDEsIGRhdGE6IGluZGV4IH0sXG4gICAgICAgICAgICB9KVxuICAgICAgICApKTtcblxuICAgICAgICAvLyBQb3B1bGF0ZSBkeW5hbWljIGJ1ZmZlcnNcbiAgICAgICAgdGhpcy51cGRhdGVHZW9tZXRyeSgpO1xuXG4gICAgICAgIGlmICghdW5pZm9ybXMudVJlc29sdXRpb24pIHRoaXMucmVzb2x1dGlvbiA9IHVuaWZvcm1zLnVSZXNvbHV0aW9uID0geyB2YWx1ZTogbmV3IFZlYzIoKSB9O1xuICAgICAgICBpZiAoIXVuaWZvcm1zLnVEUFIpIHRoaXMuZHByID0gdW5pZm9ybXMudURQUiA9IHsgdmFsdWU6IDEgfTtcbiAgICAgICAgaWYgKCF1bmlmb3Jtcy51VGhpY2tuZXNzKSB0aGlzLnRoaWNrbmVzcyA9IHVuaWZvcm1zLnVUaGlja25lc3MgPSB7IHZhbHVlOiAxIH07XG4gICAgICAgIGlmICghdW5pZm9ybXMudUNvbG9yKSB0aGlzLmNvbG9yID0gdW5pZm9ybXMudUNvbG9yID0geyB2YWx1ZTogbmV3IENvbG9yKCcjMDAwJykgfTtcbiAgICAgICAgaWYgKCF1bmlmb3Jtcy51TWl0ZXIpIHRoaXMubWl0ZXIgPSB1bmlmb3Jtcy51TWl0ZXIgPSB7IHZhbHVlOiAxIH07XG5cbiAgICAgICAgLy8gU2V0IHNpemUgdW5pZm9ybXMnIHZhbHVlc1xuICAgICAgICB0aGlzLnJlc2l6ZSgpO1xuXG4gICAgICAgIGNvbnN0IHByb2dyYW0gPSAodGhpcy5wcm9ncmFtID0gbmV3IFByb2dyYW0oZ2wsIHtcbiAgICAgICAgICAgIHZlcnRleCxcbiAgICAgICAgICAgIGZyYWdtZW50LFxuICAgICAgICAgICAgdW5pZm9ybXMsXG4gICAgICAgIH0pKTtcblxuICAgICAgICB0aGlzLm1lc2ggPSBuZXcgTWVzaChnbCwgeyBnZW9tZXRyeSwgcHJvZ3JhbSB9KTtcbiAgICB9XG5cbiAgICB1cGRhdGVHZW9tZXRyeSgpIHtcbiAgICAgICAgdGhpcy5wb2ludHMuZm9yRWFjaCgocCwgaSkgPT4ge1xuICAgICAgICAgICAgcC50b0FycmF5KHRoaXMucG9zaXRpb24sIGkgKiAzICogMik7XG4gICAgICAgICAgICBwLnRvQXJyYXkodGhpcy5wb3NpdGlvbiwgaSAqIDMgKiAyICsgMyk7XG5cbiAgICAgICAgICAgIGlmICghaSkge1xuICAgICAgICAgICAgICAgIC8vIElmIGZpcnN0IHBvaW50LCBjYWxjdWxhdGUgcHJldiB1c2luZyB0aGUgZGlzdGFuY2UgdG8gMm5kIHBvaW50XG4gICAgICAgICAgICAgICAgdG1wLmNvcHkocClcbiAgICAgICAgICAgICAgICAgICAgLnN1Yih0aGlzLnBvaW50c1tpICsgMV0pXG4gICAgICAgICAgICAgICAgICAgIC5hZGQocCk7XG4gICAgICAgICAgICAgICAgdG1wLnRvQXJyYXkodGhpcy5wcmV2LCBpICogMyAqIDIpO1xuICAgICAgICAgICAgICAgIHRtcC50b0FycmF5KHRoaXMucHJldiwgaSAqIDMgKiAyICsgMyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHAudG9BcnJheSh0aGlzLm5leHQsIChpIC0gMSkgKiAzICogMik7XG4gICAgICAgICAgICAgICAgcC50b0FycmF5KHRoaXMubmV4dCwgKGkgLSAxKSAqIDMgKiAyICsgMyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChpID09PSB0aGlzLnBvaW50cy5sZW5ndGggLSAxKSB7XG4gICAgICAgICAgICAgICAgLy8gSWYgbGFzdCBwb2ludCwgY2FsY3VsYXRlIG5leHQgdXNpbmcgZGlzdGFuY2UgdG8gMm5kIGxhc3QgcG9pbnRcbiAgICAgICAgICAgICAgICB0bXAuY29weShwKVxuICAgICAgICAgICAgICAgICAgICAuc3ViKHRoaXMucG9pbnRzW2kgLSAxXSlcbiAgICAgICAgICAgICAgICAgICAgLmFkZChwKTtcbiAgICAgICAgICAgICAgICB0bXAudG9BcnJheSh0aGlzLm5leHQsIGkgKiAzICogMik7XG4gICAgICAgICAgICAgICAgdG1wLnRvQXJyYXkodGhpcy5uZXh0LCBpICogMyAqIDIgKyAzKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcC50b0FycmF5KHRoaXMucHJldiwgKGkgKyAxKSAqIDMgKiAyKTtcbiAgICAgICAgICAgICAgICBwLnRvQXJyYXkodGhpcy5wcmV2LCAoaSArIDEpICogMyAqIDIgKyAzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5nZW9tZXRyeS5hdHRyaWJ1dGVzLnBvc2l0aW9uLm5lZWRzVXBkYXRlID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5nZW9tZXRyeS5hdHRyaWJ1dGVzLnByZXYubmVlZHNVcGRhdGUgPSB0cnVlO1xuICAgICAgICB0aGlzLmdlb21ldHJ5LmF0dHJpYnV0ZXMubmV4dC5uZWVkc1VwZGF0ZSA9IHRydWU7XG4gICAgfVxuXG4gICAgLy8gT25seSBuZWVkIHRvIGNhbGwgaWYgbm90IGhhbmRsaW5nIHJlc29sdXRpb24gdW5pZm9ybXMgbWFudWFsbHlcbiAgICByZXNpemUoKSB7XG4gICAgICAgIC8vIFVwZGF0ZSBhdXRvbWF0aWMgdW5pZm9ybXMgaWYgbm90IG92ZXJyaWRkZW5cbiAgICAgICAgaWYgKHRoaXMucmVzb2x1dGlvbikgdGhpcy5yZXNvbHV0aW9uLnZhbHVlLnNldCh0aGlzLmdsLmNhbnZhcy53aWR0aCwgdGhpcy5nbC5jYW52YXMuaGVpZ2h0KTtcbiAgICAgICAgaWYgKHRoaXMuZHByKSB0aGlzLmRwci52YWx1ZSA9IHRoaXMuZ2wucmVuZGVyZXIuZHByO1xuICAgIH1cbn1cblxuY29uc3QgZGVmYXVsdFZlcnRleCA9IC8qIGdsc2wgKi8gYFxuICAgIHByZWNpc2lvbiBoaWdocCBmbG9hdDtcblxuICAgIGF0dHJpYnV0ZSB2ZWMzIHBvc2l0aW9uO1xuICAgIGF0dHJpYnV0ZSB2ZWMzIG5leHQ7XG4gICAgYXR0cmlidXRlIHZlYzMgcHJldjtcbiAgICBhdHRyaWJ1dGUgdmVjMiB1djtcbiAgICBhdHRyaWJ1dGUgZmxvYXQgc2lkZTtcblxuICAgIHVuaWZvcm0gbWF0NCBtb2RlbFZpZXdNYXRyaXg7XG4gICAgdW5pZm9ybSBtYXQ0IHByb2plY3Rpb25NYXRyaXg7XG4gICAgdW5pZm9ybSB2ZWMyIHVSZXNvbHV0aW9uO1xuICAgIHVuaWZvcm0gZmxvYXQgdURQUjtcbiAgICB1bmlmb3JtIGZsb2F0IHVUaGlja25lc3M7XG4gICAgdW5pZm9ybSBmbG9hdCB1TWl0ZXI7XG5cbiAgICB2YXJ5aW5nIHZlYzIgdlV2O1xuXG4gICAgdmVjNCBnZXRQb3NpdGlvbigpIHtcbiAgICAgICAgbWF0NCBtdnAgPSBwcm9qZWN0aW9uTWF0cml4ICogbW9kZWxWaWV3TWF0cml4O1xuICAgICAgICB2ZWM0IGN1cnJlbnQgPSBtdnAgKiB2ZWM0KHBvc2l0aW9uLCAxKTtcbiAgICAgICAgdmVjNCBuZXh0UG9zID0gbXZwICogdmVjNChuZXh0LCAxKTtcbiAgICAgICAgdmVjNCBwcmV2UG9zID0gbXZwICogdmVjNChwcmV2LCAxKTtcblxuICAgICAgICB2ZWMyIGFzcGVjdCA9IHZlYzIodVJlc29sdXRpb24ueCAvIHVSZXNvbHV0aW9uLnksIDEpOyAgICBcbiAgICAgICAgdmVjMiBjdXJyZW50U2NyZWVuID0gY3VycmVudC54eSAvIGN1cnJlbnQudyAqIGFzcGVjdDtcbiAgICAgICAgdmVjMiBuZXh0U2NyZWVuID0gbmV4dFBvcy54eSAvIG5leHRQb3MudyAqIGFzcGVjdDtcbiAgICAgICAgdmVjMiBwcmV2U2NyZWVuID0gcHJldlBvcy54eSAvIHByZXZQb3MudyAqIGFzcGVjdDtcbiAgICBcbiAgICAgICAgdmVjMiBkaXIxID0gbm9ybWFsaXplKGN1cnJlbnRTY3JlZW4gLSBwcmV2U2NyZWVuKTtcbiAgICAgICAgdmVjMiBkaXIyID0gbm9ybWFsaXplKG5leHRTY3JlZW4gLSBjdXJyZW50U2NyZWVuKTtcbiAgICAgICAgdmVjMiBkaXIgPSBub3JtYWxpemUoZGlyMSArIGRpcjIpO1xuICAgIFxuICAgICAgICB2ZWMyIG5vcm1hbCA9IHZlYzIoLWRpci55LCBkaXIueCk7XG4gICAgICAgIG5vcm1hbCAvPSBtaXgoMS4wLCBtYXgoMC4zLCBkb3Qobm9ybWFsLCB2ZWMyKC1kaXIxLnksIGRpcjEueCkpKSwgdU1pdGVyKTtcbiAgICAgICAgbm9ybWFsIC89IGFzcGVjdDtcblxuICAgICAgICBmbG9hdCBwaXhlbFdpZHRoUmF0aW8gPSAxLjAgLyAodVJlc29sdXRpb24ueSAvIHVEUFIpO1xuICAgICAgICBmbG9hdCBwaXhlbFdpZHRoID0gY3VycmVudC53ICogcGl4ZWxXaWR0aFJhdGlvO1xuICAgICAgICBub3JtYWwgKj0gcGl4ZWxXaWR0aCAqIHVUaGlja25lc3M7XG4gICAgICAgIGN1cnJlbnQueHkgLT0gbm9ybWFsICogc2lkZTtcbiAgICBcbiAgICAgICAgcmV0dXJuIGN1cnJlbnQ7XG4gICAgfVxuXG4gICAgdm9pZCBtYWluKCkge1xuICAgICAgICB2VXYgPSB1djtcbiAgICAgICAgZ2xfUG9zaXRpb24gPSBnZXRQb3NpdGlvbigpO1xuICAgIH1cbmA7XG5cbmNvbnN0IGRlZmF1bHRGcmFnbWVudCA9IC8qIGdsc2wgKi8gYFxuICAgIHByZWNpc2lvbiBoaWdocCBmbG9hdDtcblxuICAgIHVuaWZvcm0gdmVjMyB1Q29sb3I7XG4gICAgXG4gICAgdmFyeWluZyB2ZWMyIHZVdjtcblxuICAgIHZvaWQgbWFpbigpIHtcbiAgICAgICAgZ2xfRnJhZ0NvbG9yLnJnYiA9IHVDb2xvcjtcbiAgICAgICAgZ2xfRnJhZ0NvbG9yLmEgPSAxLjA7XG4gICAgfVxuYDtcbiIsIi8vIFRPRE86IERlc3Ryb3kgcmVuZGVyIHRhcmdldHMgaWYgc2l6ZSBjaGFuZ2VkIGFuZCBleGlzdHNcblxuaW1wb3J0IHsgUHJvZ3JhbSB9IGZyb20gJy4uL2NvcmUvUHJvZ3JhbS5qcyc7XG5pbXBvcnQgeyBNZXNoIH0gZnJvbSAnLi4vY29yZS9NZXNoLmpzJztcbmltcG9ydCB7IFJlbmRlclRhcmdldCB9IGZyb20gJy4uL2NvcmUvUmVuZGVyVGFyZ2V0LmpzJztcbmltcG9ydCB7IFRyaWFuZ2xlIH0gZnJvbSAnLi9UcmlhbmdsZS5qcyc7XG5cbi8vIE5vdGU6IFVzZSBDdXN0b21Qb3N0LCBub3QgdGhpcy5cbmV4cG9ydCBjbGFzcyBQb3N0IHtcbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgZ2wsXG4gICAgICAgIHtcbiAgICAgICAgICAgIHdpZHRoLFxuICAgICAgICAgICAgaGVpZ2h0LFxuICAgICAgICAgICAgZHByLFxuICAgICAgICAgICAgd3JhcFMgPSBnbC5DTEFNUF9UT19FREdFLFxuICAgICAgICAgICAgd3JhcFQgPSBnbC5DTEFNUF9UT19FREdFLFxuICAgICAgICAgICAgbWluRmlsdGVyID0gZ2wuTElORUFSLFxuICAgICAgICAgICAgbWFnRmlsdGVyID0gZ2wuTElORUFSLFxuICAgICAgICAgICAgZ2VvbWV0cnkgPSBuZXcgVHJpYW5nbGUoZ2wpLFxuICAgICAgICAgICAgdGFyZ2V0T25seSA9IG51bGwsXG4gICAgICAgIH0gPSB7fSxcbiAgICAgICAgZmJvID0gbnVsbCxcbiAgICApIHtcbiAgICAgICAgdGhpcy5nbCA9IGdsO1xuXG4gICAgICAgIHRoaXMub3B0aW9ucyA9IHsgd3JhcFMsIHdyYXBULCBtaW5GaWx0ZXIsIG1hZ0ZpbHRlciB9O1xuXG4gICAgICAgIHRoaXMucGFzc2VzID0gW107XG5cbiAgICAgICAgdGhpcy5nZW9tZXRyeSA9IGdlb21ldHJ5O1xuXG4gICAgICAgIHRoaXMudW5pZm9ybSA9IHsgdmFsdWU6IG51bGwgfTtcbiAgICAgICAgdGhpcy50YXJnZXRPbmx5ID0gdGFyZ2V0T25seTtcblxuICAgICAgICB0aGlzLmZibyA9IGZibyB8fCB7XG4gICAgICAgICAgICByZWFkOiB1bmRlZmluZWQsXG4gICAgICAgICAgICB3cml0ZTogdW5kZWZpbmVkLFxuICAgICAgICAgICAgc3dhcDogKCkgPT4ge1xuICAgICAgICAgICAgICAgIGxldCB0ZW1wID0gdGhpcy5mYm8ucmVhZDtcbiAgICAgICAgICAgICAgICB0aGlzLmZiby5yZWFkID0gdGhpcy5mYm8ud3JpdGU7XG4gICAgICAgICAgICAgICAgdGhpcy5mYm8ud3JpdGUgPSB0ZW1wO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLnJlc2l6ZSh7IHdpZHRoLCBoZWlnaHQsIGRwciB9KTtcbiAgICB9XG5cbiAgICBhZGRQYXNzKHsgdmVydGV4ID0gZGVmYXVsdFZlcnRleCwgZnJhZ21lbnQgPSBkZWZhdWx0RnJhZ21lbnQsIHVuaWZvcm1zID0ge30sIHRleHR1cmVVbmlmb3JtID0gJ3RNYXAnLCBlbmFibGVkID0gdHJ1ZSB9ID0ge30pIHtcbiAgICAgICAgdW5pZm9ybXNbdGV4dHVyZVVuaWZvcm1dID0geyB2YWx1ZTogdGhpcy5mYm8ucmVhZC50ZXh0dXJlIH07XG5cbiAgICAgICAgY29uc3QgcHJvZ3JhbSA9IG5ldyBQcm9ncmFtKHRoaXMuZ2wsIHsgdmVydGV4LCBmcmFnbWVudCwgdW5pZm9ybXMgfSk7XG4gICAgICAgIGNvbnN0IG1lc2ggPSBuZXcgTWVzaCh0aGlzLmdsLCB7IGdlb21ldHJ5OiB0aGlzLmdlb21ldHJ5LCBwcm9ncmFtIH0pO1xuXG4gICAgICAgIGNvbnN0IHBhc3MgPSB7XG4gICAgICAgICAgICBtZXNoLFxuICAgICAgICAgICAgcHJvZ3JhbSxcbiAgICAgICAgICAgIHVuaWZvcm1zLFxuICAgICAgICAgICAgZW5hYmxlZCxcbiAgICAgICAgICAgIHRleHR1cmVVbmlmb3JtLFxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMucGFzc2VzLnB1c2gocGFzcyk7XG4gICAgICAgIHJldHVybiBwYXNzO1xuICAgIH1cblxuICAgIHJlc2l6ZSh7IHdpZHRoLCBoZWlnaHQsIGRwciB9ID0ge30pIHtcblxuICAgICAgICBpZiAoZHByKSB0aGlzLmRwciA9IGRwcjtcbiAgICAgICAgaWYgKHdpZHRoKSB7XG4gICAgICAgICAgICB0aGlzLndpZHRoID0gd2lkdGg7XG4gICAgICAgICAgICB0aGlzLmhlaWdodCA9IGhlaWdodCB8fCB3aWR0aDtcbiAgICAgICAgfVxuXG4gICAgICAgIGRwciA9IHRoaXMuZHByIHx8IHRoaXMuZ2wucmVuZGVyZXIuZHByO1xuICAgICAgICB3aWR0aCA9ICh0aGlzLndpZHRoIHx8IHRoaXMuZ2wucmVuZGVyZXIud2lkdGgpICogZHByO1xuICAgICAgICBoZWlnaHQgPSAodGhpcy5oZWlnaHQgfHwgdGhpcy5nbC5yZW5kZXJlci5oZWlnaHQpICogZHByO1xuXG4gICAgICAgIHRoaXMub3B0aW9ucy53aWR0aCA9IHdpZHRoO1xuICAgICAgICB0aGlzLm9wdGlvbnMuaGVpZ2h0ID0gaGVpZ2h0O1xuICAgICAgICB0aGlzLmRpc3Bvc2VGYm8oKTtcbiAgICAgICAgdGhpcy5pbml0RmJvKCk7XG4gICAgfVxuXG4gICAgZGlzcG9zZUZibygpIHtcbiAgICAgICAgdGhpcy5mYm8ucmVhZCAmJiB0aGlzLmZiby5yZWFkLmRpc3Bvc2UoKTtcbiAgICAgICAgdGhpcy5mYm8ud3JpdGUgJiYgdGhpcy5mYm8ud3JpdGUuZGlzcG9zZSgpO1xuICAgICAgICB0aGlzLmZiby5yZWFkID0gdW5kZWZpbmVkO1xuICAgICAgICB0aGlzLmZiby53cml0ZSA9IHVuZGVmaW5lZDtcbiAgICB9XG4gICAgaW5pdEZibygpIHtcbiAgICAgICAgdGhpcy5mYm8ucmVhZCA9IG5ldyBSZW5kZXJUYXJnZXQodGhpcy5nbCwgdGhpcy5vcHRpb25zKTtcbiAgICAgICAgdGhpcy5mYm8ud3JpdGUgPSBuZXcgUmVuZGVyVGFyZ2V0KHRoaXMuZ2wsIHRoaXMub3B0aW9ucyk7XG4gICAgfVxuXG4gICAgLy8gVXNlcyBzYW1lIGFyZ3VtZW50cyBhcyByZW5kZXJlci5yZW5kZXJcbiAgICByZW5kZXIoeyBzY2VuZSwgY2FtZXJhLCB0YXJnZXQgPSBudWxsLCB1cGRhdGUgPSB0cnVlLCBzb3J0ID0gdHJ1ZSwgZnJ1c3R1bUN1bGwgPSB0cnVlIH0pIHtcbiAgICAgICAgY29uc3QgZW5hYmxlZFBhc3NlcyA9IHRoaXMucGFzc2VzLmZpbHRlcigocGFzcykgPT4gcGFzcy5lbmFibGVkKTtcblxuICAgICAgICB0aGlzLmdsLnJlbmRlcmVyLnJlbmRlcih7XG4gICAgICAgICAgICBzY2VuZSxcbiAgICAgICAgICAgIGNhbWVyYSxcbiAgICAgICAgICAgIHRhcmdldDogZW5hYmxlZFBhc3Nlcy5sZW5ndGggfHwgKCF0YXJnZXQgJiYgdGhpcy50YXJnZXRPbmx5KSA/IHRoaXMuZmJvLndyaXRlIDogdGFyZ2V0LFxuICAgICAgICAgICAgdXBkYXRlLFxuICAgICAgICAgICAgc29ydCxcbiAgICAgICAgICAgIGZydXN0dW1DdWxsLFxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5mYm8uc3dhcCgpO1xuXG4gICAgICAgIGVuYWJsZWRQYXNzZXMuZm9yRWFjaCgocGFzcywgaSkgPT4ge1xuICAgICAgICAgICAgcGFzcy5tZXNoLnByb2dyYW0udW5pZm9ybXNbcGFzcy50ZXh0dXJlVW5pZm9ybV0udmFsdWUgPSB0aGlzLmZiby5yZWFkLnRleHR1cmU7XG4gICAgICAgICAgICB0aGlzLmdsLnJlbmRlcmVyLnJlbmRlcih7XG4gICAgICAgICAgICAgICAgc2NlbmU6IHBhc3MubWVzaCxcbiAgICAgICAgICAgICAgICB0YXJnZXQ6IGkgPT09IGVuYWJsZWRQYXNzZXMubGVuZ3RoIC0gMSAmJiAodGFyZ2V0IHx8ICF0aGlzLnRhcmdldE9ubHkpID8gdGFyZ2V0IDogdGhpcy5mYm8ud3JpdGUsXG4gICAgICAgICAgICAgICAgY2xlYXI6IHRydWUsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMuZmJvLnN3YXAoKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy51bmlmb3JtLnZhbHVlID0gdGhpcy5mYm8ucmVhZC50ZXh0dXJlO1xuICAgIH1cbn1cblxuY29uc3QgZGVmYXVsdFZlcnRleCA9IC8qIGdsc2wgKi8gYFxuICAgIGF0dHJpYnV0ZSB2ZWMyIHV2O1xuICAgIGF0dHJpYnV0ZSB2ZWMyIHBvc2l0aW9uO1xuXG4gICAgdmFyeWluZyB2ZWMyIHZVdjtcblxuICAgIHZvaWQgbWFpbigpIHtcbiAgICAgICAgdlV2ID0gdXY7XG4gICAgICAgIGdsX1Bvc2l0aW9uID0gdmVjNChwb3NpdGlvbiwgMCwgMSk7XG4gICAgfVxuYDtcblxuY29uc3QgZGVmYXVsdEZyYWdtZW50ID0gLyogZ2xzbCAqLyBgXG4gICAgcHJlY2lzaW9uIGhpZ2hwIGZsb2F0O1xuXG4gICAgdW5pZm9ybSBzYW1wbGVyMkQgdE1hcDtcbiAgICB2YXJ5aW5nIHZlYzIgdlV2O1xuXG4gICAgdm9pZCBtYWluKCkge1xuICAgICAgICBnbF9GcmFnQ29sb3IgPSB0ZXh0dXJlMkQodE1hcCwgdlV2KTtcbiAgICB9XG5gO1xuIiwiLy8gVE9ETzogYmFyeWNlbnRyaWMgY29kZSBzaG91bGRuJ3QgYmUgaGVyZSwgYnV0IHdoZXJlP1xuLy8gVE9ETzogU3BoZXJlQ2FzdD9cblxuaW1wb3J0IHsgVmVjMiB9IGZyb20gJy4uL21hdGgvVmVjMi5qcyc7XG5pbXBvcnQgeyBWZWMzIH0gZnJvbSAnLi4vbWF0aC9WZWMzLmpzJztcbmltcG9ydCB7IE1hdDQgfSBmcm9tICcuLi9tYXRoL01hdDQuanMnO1xuXG5jb25zdCB0ZW1wVmVjMmEgPSBuZXcgVmVjMigpO1xuY29uc3QgdGVtcFZlYzJiID0gbmV3IFZlYzIoKTtcbmNvbnN0IHRlbXBWZWMyYyA9IG5ldyBWZWMyKCk7XG5cbmNvbnN0IHRlbXBWZWMzYSA9IG5ldyBWZWMzKCk7XG5jb25zdCB0ZW1wVmVjM2IgPSBuZXcgVmVjMygpO1xuY29uc3QgdGVtcFZlYzNjID0gbmV3IFZlYzMoKTtcbmNvbnN0IHRlbXBWZWMzZCA9IG5ldyBWZWMzKCk7XG5jb25zdCB0ZW1wVmVjM2UgPSBuZXcgVmVjMygpO1xuY29uc3QgdGVtcFZlYzNmID0gbmV3IFZlYzMoKTtcbmNvbnN0IHRlbXBWZWMzZyA9IG5ldyBWZWMzKCk7XG5jb25zdCB0ZW1wVmVjM2ggPSBuZXcgVmVjMygpO1xuY29uc3QgdGVtcFZlYzNpID0gbmV3IFZlYzMoKTtcbmNvbnN0IHRlbXBWZWMzaiA9IG5ldyBWZWMzKCk7XG5jb25zdCB0ZW1wVmVjM2sgPSBuZXcgVmVjMygpO1xuXG5jb25zdCB0ZW1wTWF0NCA9IG5ldyBNYXQ0KCk7XG5cbmV4cG9ydCBjbGFzcyBSYXljYXN0IHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5vcmlnaW4gPSBuZXcgVmVjMygpO1xuICAgICAgICB0aGlzLmRpcmVjdGlvbiA9IG5ldyBWZWMzKCk7XG4gICAgfVxuXG4gICAgLy8gU2V0IHJheSBmcm9tIG1vdXNlIHVucHJvamVjdGlvblxuICAgIGNhc3RNb3VzZShjYW1lcmEsIG1vdXNlID0gWzAsIDBdKSB7XG4gICAgICAgIGlmIChjYW1lcmEudHlwZSA9PT0gJ29ydGhvZ3JhcGhpYycpIHtcbiAgICAgICAgICAgIC8vIFNldCBvcmlnaW5cbiAgICAgICAgICAgIC8vIFNpbmNlIGNhbWVyYSBpcyBvcnRob2dyYXBoaWMsIG9yaWdpbiBpcyBub3QgdGhlIGNhbWVyYSBwb3NpdGlvblxuICAgICAgICAgICAgY29uc3QgeyBsZWZ0LCByaWdodCwgYm90dG9tLCB0b3AsIHpvb20gfSA9IGNhbWVyYTtcbiAgICAgICAgICAgIGNvbnN0IHggPSBsZWZ0IC8gem9vbSArICgocmlnaHQgLSBsZWZ0KSAvIHpvb20pICogKG1vdXNlWzBdICogMC41ICsgMC41KTtcbiAgICAgICAgICAgIGNvbnN0IHkgPSBib3R0b20gLyB6b29tICsgKCh0b3AgLSBib3R0b20pIC8gem9vbSkgKiAobW91c2VbMV0gKiAwLjUgKyAwLjUpO1xuICAgICAgICAgICAgdGhpcy5vcmlnaW4uc2V0KHgsIHksIDApO1xuICAgICAgICAgICAgdGhpcy5vcmlnaW4uYXBwbHlNYXRyaXg0KGNhbWVyYS53b3JsZE1hdHJpeCk7XG5cbiAgICAgICAgICAgIC8vIFNldCBkaXJlY3Rpb25cbiAgICAgICAgICAgIC8vIGh0dHBzOi8vY29tbXVuaXR5Lmtocm9ub3Mub3JnL3QvZ2V0LWRpcmVjdGlvbi1mcm9tLXRyYW5zZm9ybWF0aW9uLW1hdHJpeC1vci1xdWF0LzY1NTAyLzJcbiAgICAgICAgICAgIHRoaXMuZGlyZWN0aW9uLnggPSAtY2FtZXJhLndvcmxkTWF0cml4WzhdO1xuICAgICAgICAgICAgdGhpcy5kaXJlY3Rpb24ueSA9IC1jYW1lcmEud29ybGRNYXRyaXhbOV07XG4gICAgICAgICAgICB0aGlzLmRpcmVjdGlvbi56ID0gLWNhbWVyYS53b3JsZE1hdHJpeFsxMF07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBTZXQgb3JpZ2luXG4gICAgICAgICAgICBjYW1lcmEud29ybGRNYXRyaXguZ2V0VHJhbnNsYXRpb24odGhpcy5vcmlnaW4pO1xuXG4gICAgICAgICAgICAvLyBTZXQgZGlyZWN0aW9uXG4gICAgICAgICAgICB0aGlzLmRpcmVjdGlvbi5zZXQobW91c2VbMF0sIG1vdXNlWzFdLCAwLjUpO1xuICAgICAgICAgICAgY2FtZXJhLnVucHJvamVjdCh0aGlzLmRpcmVjdGlvbik7XG4gICAgICAgICAgICB0aGlzLmRpcmVjdGlvbi5zdWIodGhpcy5vcmlnaW4pLm5vcm1hbGl6ZSgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaW50ZXJzZWN0Qm91bmRzKG1lc2hlcywgeyBtYXhEaXN0YW5jZSwgb3V0cHV0ID0gW10gfSA9IHt9KSB7XG4gICAgICAgIGlmICghQXJyYXkuaXNBcnJheShtZXNoZXMpKSBtZXNoZXMgPSBbbWVzaGVzXTtcblxuICAgICAgICBjb25zdCBpbnZXb3JsZE1hdDQgPSB0ZW1wTWF0NDtcbiAgICAgICAgY29uc3Qgb3JpZ2luID0gdGVtcFZlYzNhO1xuICAgICAgICBjb25zdCBkaXJlY3Rpb24gPSB0ZW1wVmVjM2I7XG5cbiAgICAgICAgY29uc3QgaGl0cyA9IG91dHB1dDtcbiAgICAgICAgaGl0cy5sZW5ndGggPSAwO1xuXG4gICAgICAgIG1lc2hlcy5mb3JFYWNoKChtZXNoKSA9PiB7XG4gICAgICAgICAgICAvLyBDcmVhdGUgYm91bmRzXG4gICAgICAgICAgICBpZiAoIW1lc2guZ2VvbWV0cnkuYm91bmRzIHx8IG1lc2guZ2VvbWV0cnkuYm91bmRzLnJhZGl1cyA9PT0gSW5maW5pdHkpIG1lc2guZ2VvbWV0cnkuY29tcHV0ZUJvdW5kaW5nU3BoZXJlKCk7XG4gICAgICAgICAgICBjb25zdCBib3VuZHMgPSBtZXNoLmdlb21ldHJ5LmJvdW5kcztcbiAgICAgICAgICAgIGludldvcmxkTWF0NC5pbnZlcnNlKG1lc2gud29ybGRNYXRyaXgpO1xuXG4gICAgICAgICAgICAvLyBHZXQgbWF4IGRpc3RhbmNlIGxvY2FsbHlcbiAgICAgICAgICAgIGxldCBsb2NhbE1heERpc3RhbmNlO1xuICAgICAgICAgICAgaWYgKG1heERpc3RhbmNlKSB7XG4gICAgICAgICAgICAgICAgZGlyZWN0aW9uLmNvcHkodGhpcy5kaXJlY3Rpb24pLnNjYWxlUm90YXRlTWF0cml4NChpbnZXb3JsZE1hdDQpO1xuICAgICAgICAgICAgICAgIGxvY2FsTWF4RGlzdGFuY2UgPSBtYXhEaXN0YW5jZSAqIGRpcmVjdGlvbi5sZW4oKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gVGFrZSB3b3JsZCBzcGFjZSByYXkgYW5kIG1ha2UgaXQgb2JqZWN0IHNwYWNlIHRvIGFsaWduIHdpdGggYm91bmRpbmcgYm94XG4gICAgICAgICAgICBvcmlnaW4uY29weSh0aGlzLm9yaWdpbikuYXBwbHlNYXRyaXg0KGludldvcmxkTWF0NCk7XG4gICAgICAgICAgICBkaXJlY3Rpb24uY29weSh0aGlzLmRpcmVjdGlvbikudHJhbnNmb3JtRGlyZWN0aW9uKGludldvcmxkTWF0NCk7XG5cbiAgICAgICAgICAgIC8vIEJyZWFrIG91dCBlYXJseSBpZiBib3VuZHMgdG9vIGZhciBhd2F5IGZyb20gb3JpZ2luXG4gICAgICAgICAgICBpZiAobWF4RGlzdGFuY2UpIHtcbiAgICAgICAgICAgICAgICBpZiAob3JpZ2luLmRpc3RhbmNlKGJvdW5kcy5jZW50ZXIpIC0gYm91bmRzLnJhZGl1cyA+IGxvY2FsTWF4RGlzdGFuY2UpIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbGV0IGxvY2FsRGlzdGFuY2UgPSAwO1xuXG4gICAgICAgICAgICAvLyBDaGVjayBvcmlnaW4gaXNuJ3QgaW5zaWRlIGJvdW5kcyBiZWZvcmUgdGVzdGluZyBpbnRlcnNlY3Rpb25cbiAgICAgICAgICAgIGlmIChtZXNoLmdlb21ldHJ5LnJheWNhc3QgPT09ICdzcGhlcmUnKSB7XG4gICAgICAgICAgICAgICAgaWYgKG9yaWdpbi5kaXN0YW5jZShib3VuZHMuY2VudGVyKSA+IGJvdW5kcy5yYWRpdXMpIHtcbiAgICAgICAgICAgICAgICAgICAgbG9jYWxEaXN0YW5jZSA9IHRoaXMuaW50ZXJzZWN0U3BoZXJlKGJvdW5kcywgb3JpZ2luLCBkaXJlY3Rpb24pO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWxvY2FsRGlzdGFuY2UpIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICAgb3JpZ2luLnggPCBib3VuZHMubWluLnggfHxcbiAgICAgICAgICAgICAgICAgICAgb3JpZ2luLnggPiBib3VuZHMubWF4LnggfHxcbiAgICAgICAgICAgICAgICAgICAgb3JpZ2luLnkgPCBib3VuZHMubWluLnkgfHxcbiAgICAgICAgICAgICAgICAgICAgb3JpZ2luLnkgPiBib3VuZHMubWF4LnkgfHxcbiAgICAgICAgICAgICAgICAgICAgb3JpZ2luLnogPCBib3VuZHMubWluLnogfHxcbiAgICAgICAgICAgICAgICAgICAgb3JpZ2luLnogPiBib3VuZHMubWF4LnpcbiAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgbG9jYWxEaXN0YW5jZSA9IHRoaXMuaW50ZXJzZWN0Qm94KGJvdW5kcywgb3JpZ2luLCBkaXJlY3Rpb24pO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWxvY2FsRGlzdGFuY2UpIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChtYXhEaXN0YW5jZSAmJiBsb2NhbERpc3RhbmNlID4gbG9jYWxNYXhEaXN0YW5jZSkgcmV0dXJuO1xuXG4gICAgICAgICAgICAvLyBDcmVhdGUgb2JqZWN0IG9uIG1lc2ggdG8gYXZvaWQgZ2VuZXJhdGluZyBsb3RzIG9mIG9iamVjdHNcbiAgICAgICAgICAgIGlmICghbWVzaC5oaXQpIG1lc2guaGl0ID0geyBsb2NhbFBvaW50OiBuZXcgVmVjMygpLCBwb2ludDogbmV3IFZlYzMoKSB9O1xuXG4gICAgICAgICAgICBtZXNoLmhpdC5sb2NhbFBvaW50LmNvcHkoZGlyZWN0aW9uKS5tdWx0aXBseShsb2NhbERpc3RhbmNlKS5hZGQob3JpZ2luKTtcbiAgICAgICAgICAgIG1lc2guaGl0LnBvaW50LmNvcHkobWVzaC5oaXQubG9jYWxQb2ludCkuYXBwbHlNYXRyaXg0KG1lc2gud29ybGRNYXRyaXgpO1xuICAgICAgICAgICAgbWVzaC5oaXQuZGlzdGFuY2UgPSBtZXNoLmhpdC5wb2ludC5kaXN0YW5jZSh0aGlzLm9yaWdpbik7XG5cbiAgICAgICAgICAgIGhpdHMucHVzaChtZXNoKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaGl0cy5zb3J0KChhLCBiKSA9PiBhLmhpdC5kaXN0YW5jZSAtIGIuaGl0LmRpc3RhbmNlKTtcbiAgICAgICAgcmV0dXJuIGhpdHM7XG4gICAgfVxuXG4gICAgaW50ZXJzZWN0TWVzaGVzKG1lc2hlcywgeyBjdWxsRmFjZSA9IHRydWUsIG1heERpc3RhbmNlLCBpbmNsdWRlVVYgPSB0cnVlLCBpbmNsdWRlTm9ybWFsID0gdHJ1ZSwgb3V0cHV0ID0gW10gfSA9IHt9KSB7XG4gICAgICAgIC8vIFRlc3QgYm91bmRzIGZpcnN0IGJlZm9yZSB0ZXN0aW5nIGdlb21ldHJ5XG4gICAgICAgIGNvbnN0IGhpdHMgPSB0aGlzLmludGVyc2VjdEJvdW5kcyhtZXNoZXMsIHsgbWF4RGlzdGFuY2UsIG91dHB1dCB9KTtcbiAgICAgICAgaWYgKCFoaXRzLmxlbmd0aCkgcmV0dXJuIGhpdHM7XG5cbiAgICAgICAgY29uc3QgaW52V29ybGRNYXQ0ID0gdGVtcE1hdDQ7XG4gICAgICAgIGNvbnN0IG9yaWdpbiA9IHRlbXBWZWMzYTtcbiAgICAgICAgY29uc3QgZGlyZWN0aW9uID0gdGVtcFZlYzNiO1xuICAgICAgICBjb25zdCBhID0gdGVtcFZlYzNjO1xuICAgICAgICBjb25zdCBiID0gdGVtcFZlYzNkO1xuICAgICAgICBjb25zdCBjID0gdGVtcFZlYzNlO1xuICAgICAgICBjb25zdCBjbG9zZXN0RmFjZU5vcm1hbCA9IHRlbXBWZWMzZjtcbiAgICAgICAgY29uc3QgZmFjZU5vcm1hbCA9IHRlbXBWZWMzZztcbiAgICAgICAgY29uc3QgYmFyeWNvb3JkID0gdGVtcFZlYzNoO1xuICAgICAgICBjb25zdCB1dkEgPSB0ZW1wVmVjMmE7XG4gICAgICAgIGNvbnN0IHV2QiA9IHRlbXBWZWMyYjtcbiAgICAgICAgY29uc3QgdXZDID0gdGVtcFZlYzJjO1xuXG4gICAgICAgIGZvciAobGV0IGkgPSBoaXRzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgICAgICBjb25zdCBtZXNoID0gaGl0c1tpXTtcbiAgICAgICAgICAgIGludldvcmxkTWF0NC5pbnZlcnNlKG1lc2gud29ybGRNYXRyaXgpO1xuXG4gICAgICAgICAgICAvLyBHZXQgbWF4IGRpc3RhbmNlIGxvY2FsbHlcbiAgICAgICAgICAgIGxldCBsb2NhbE1heERpc3RhbmNlO1xuICAgICAgICAgICAgaWYgKG1heERpc3RhbmNlKSB7XG4gICAgICAgICAgICAgICAgZGlyZWN0aW9uLmNvcHkodGhpcy5kaXJlY3Rpb24pLnNjYWxlUm90YXRlTWF0cml4NChpbnZXb3JsZE1hdDQpO1xuICAgICAgICAgICAgICAgIGxvY2FsTWF4RGlzdGFuY2UgPSBtYXhEaXN0YW5jZSAqIGRpcmVjdGlvbi5sZW4oKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gVGFrZSB3b3JsZCBzcGFjZSByYXkgYW5kIG1ha2UgaXQgb2JqZWN0IHNwYWNlIHRvIGFsaWduIHdpdGggYm91bmRpbmcgYm94XG4gICAgICAgICAgICBvcmlnaW4uY29weSh0aGlzLm9yaWdpbikuYXBwbHlNYXRyaXg0KGludldvcmxkTWF0NCk7XG4gICAgICAgICAgICBkaXJlY3Rpb24uY29weSh0aGlzLmRpcmVjdGlvbikudHJhbnNmb3JtRGlyZWN0aW9uKGludldvcmxkTWF0NCk7XG5cbiAgICAgICAgICAgIGxldCBsb2NhbERpc3RhbmNlID0gMDtcbiAgICAgICAgICAgIGxldCBjbG9zZXN0QSwgY2xvc2VzdEIsIGNsb3Nlc3RDO1xuXG4gICAgICAgICAgICBjb25zdCBnZW9tZXRyeSA9IG1lc2guZ2VvbWV0cnk7XG4gICAgICAgICAgICBjb25zdCBhdHRyaWJ1dGVzID0gZ2VvbWV0cnkuYXR0cmlidXRlcztcbiAgICAgICAgICAgIGNvbnN0IGluZGV4ID0gYXR0cmlidXRlcy5pbmRleDtcblxuICAgICAgICAgICAgY29uc3Qgc3RhcnQgPSBNYXRoLm1heCgwLCBnZW9tZXRyeS5kcmF3UmFuZ2Uuc3RhcnQpO1xuICAgICAgICAgICAgY29uc3QgZW5kID0gTWF0aC5taW4oaW5kZXggPyBpbmRleC5jb3VudCA6IGF0dHJpYnV0ZXMucG9zaXRpb24uY291bnQsIGdlb21ldHJ5LmRyYXdSYW5nZS5zdGFydCArIGdlb21ldHJ5LmRyYXdSYW5nZS5jb3VudCk7XG5cbiAgICAgICAgICAgIGZvciAobGV0IGogPSBzdGFydDsgaiA8IGVuZDsgaiArPSAzKSB7XG4gICAgICAgICAgICAgICAgLy8gUG9zaXRpb24gYXR0cmlidXRlIGluZGljZXMgZm9yIGVhY2ggdHJpYW5nbGVcbiAgICAgICAgICAgICAgICBjb25zdCBhaSA9IGluZGV4ID8gaW5kZXguZGF0YVtqXSA6IGo7XG4gICAgICAgICAgICAgICAgY29uc3QgYmkgPSBpbmRleCA/IGluZGV4LmRhdGFbaiArIDFdIDogaiArIDE7XG4gICAgICAgICAgICAgICAgY29uc3QgY2kgPSBpbmRleCA/IGluZGV4LmRhdGFbaiArIDJdIDogaiArIDI7XG5cbiAgICAgICAgICAgICAgICBhLmZyb21BcnJheShhdHRyaWJ1dGVzLnBvc2l0aW9uLmRhdGEsIGFpICogMyk7XG4gICAgICAgICAgICAgICAgYi5mcm9tQXJyYXkoYXR0cmlidXRlcy5wb3NpdGlvbi5kYXRhLCBiaSAqIDMpO1xuICAgICAgICAgICAgICAgIGMuZnJvbUFycmF5KGF0dHJpYnV0ZXMucG9zaXRpb24uZGF0YSwgY2kgKiAzKTtcblxuICAgICAgICAgICAgICAgIGNvbnN0IGRpc3RhbmNlID0gdGhpcy5pbnRlcnNlY3RUcmlhbmdsZShhLCBiLCBjLCBjdWxsRmFjZSwgb3JpZ2luLCBkaXJlY3Rpb24sIGZhY2VOb3JtYWwpO1xuICAgICAgICAgICAgICAgIGlmICghZGlzdGFuY2UpIGNvbnRpbnVlO1xuXG4gICAgICAgICAgICAgICAgLy8gVG9vIGZhciBhd2F5XG4gICAgICAgICAgICAgICAgaWYgKG1heERpc3RhbmNlICYmIGRpc3RhbmNlID4gbG9jYWxNYXhEaXN0YW5jZSkgY29udGludWU7XG5cbiAgICAgICAgICAgICAgICBpZiAoIWxvY2FsRGlzdGFuY2UgfHwgZGlzdGFuY2UgPCBsb2NhbERpc3RhbmNlKSB7XG4gICAgICAgICAgICAgICAgICAgIGxvY2FsRGlzdGFuY2UgPSBkaXN0YW5jZTtcbiAgICAgICAgICAgICAgICAgICAgY2xvc2VzdEEgPSBhaTtcbiAgICAgICAgICAgICAgICAgICAgY2xvc2VzdEIgPSBiaTtcbiAgICAgICAgICAgICAgICAgICAgY2xvc2VzdEMgPSBjaTtcbiAgICAgICAgICAgICAgICAgICAgY2xvc2VzdEZhY2VOb3JtYWwuY29weShmYWNlTm9ybWFsKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICghbG9jYWxEaXN0YW5jZSkgaGl0cy5zcGxpY2UoaSwgMSk7XG5cbiAgICAgICAgICAgIC8vIFVwZGF0ZSBoaXQgdmFsdWVzIGZyb20gYm91bmRzLXRlc3RcbiAgICAgICAgICAgIG1lc2guaGl0LmxvY2FsUG9pbnQuY29weShkaXJlY3Rpb24pLm11bHRpcGx5KGxvY2FsRGlzdGFuY2UpLmFkZChvcmlnaW4pO1xuICAgICAgICAgICAgbWVzaC5oaXQucG9pbnQuY29weShtZXNoLmhpdC5sb2NhbFBvaW50KS5hcHBseU1hdHJpeDQobWVzaC53b3JsZE1hdHJpeCk7XG4gICAgICAgICAgICBtZXNoLmhpdC5kaXN0YW5jZSA9IG1lc2guaGl0LnBvaW50LmRpc3RhbmNlKHRoaXMub3JpZ2luKTtcblxuICAgICAgICAgICAgLy8gQWRkIHVuaXF1ZSBoaXQgb2JqZWN0cyBvbiBtZXNoIHRvIGF2b2lkIGdlbmVyYXRpbmcgbG90cyBvZiBvYmplY3RzXG4gICAgICAgICAgICBpZiAoIW1lc2guaGl0LmZhY2VOb3JtYWwpIHtcbiAgICAgICAgICAgICAgICBtZXNoLmhpdC5sb2NhbEZhY2VOb3JtYWwgPSBuZXcgVmVjMygpO1xuICAgICAgICAgICAgICAgIG1lc2guaGl0LmZhY2VOb3JtYWwgPSBuZXcgVmVjMygpO1xuICAgICAgICAgICAgICAgIG1lc2guaGl0LnV2ID0gbmV3IFZlYzIoKTtcbiAgICAgICAgICAgICAgICBtZXNoLmhpdC5sb2NhbE5vcm1hbCA9IG5ldyBWZWMzKCk7XG4gICAgICAgICAgICAgICAgbWVzaC5oaXQubm9ybWFsID0gbmV3IFZlYzMoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gQWRkIGZhY2Ugbm9ybWFsIGRhdGEgd2hpY2ggaXMgYWxyZWFkeSBjb21wdXRlZFxuICAgICAgICAgICAgbWVzaC5oaXQubG9jYWxGYWNlTm9ybWFsLmNvcHkoY2xvc2VzdEZhY2VOb3JtYWwpO1xuICAgICAgICAgICAgbWVzaC5oaXQuZmFjZU5vcm1hbC5jb3B5KG1lc2guaGl0LmxvY2FsRmFjZU5vcm1hbCkudHJhbnNmb3JtRGlyZWN0aW9uKG1lc2gud29ybGRNYXRyaXgpO1xuXG4gICAgICAgICAgICAvLyBPcHRpb25hbCBkYXRhLCBvcHQgb3V0IHRvIG9wdGltaXNlIGEgYml0IGlmIG5lY2Vzc2FyeVxuICAgICAgICAgICAgaWYgKGluY2x1ZGVVViB8fCBpbmNsdWRlTm9ybWFsKSB7XG4gICAgICAgICAgICAgICAgLy8gQ2FsY3VsYXRlIGJhcnljb29yZHMgdG8gZmluZCB1diB2YWx1ZXMgYXQgaGl0IHBvaW50XG4gICAgICAgICAgICAgICAgYS5mcm9tQXJyYXkoYXR0cmlidXRlcy5wb3NpdGlvbi5kYXRhLCBjbG9zZXN0QSAqIDMpO1xuICAgICAgICAgICAgICAgIGIuZnJvbUFycmF5KGF0dHJpYnV0ZXMucG9zaXRpb24uZGF0YSwgY2xvc2VzdEIgKiAzKTtcbiAgICAgICAgICAgICAgICBjLmZyb21BcnJheShhdHRyaWJ1dGVzLnBvc2l0aW9uLmRhdGEsIGNsb3Nlc3RDICogMyk7XG4gICAgICAgICAgICAgICAgdGhpcy5nZXRCYXJ5Y29vcmQobWVzaC5oaXQubG9jYWxQb2ludCwgYSwgYiwgYywgYmFyeWNvb3JkKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGluY2x1ZGVVViAmJiBhdHRyaWJ1dGVzLnV2KSB7XG4gICAgICAgICAgICAgICAgdXZBLmZyb21BcnJheShhdHRyaWJ1dGVzLnV2LmRhdGEsIGNsb3Nlc3RBICogMik7XG4gICAgICAgICAgICAgICAgdXZCLmZyb21BcnJheShhdHRyaWJ1dGVzLnV2LmRhdGEsIGNsb3Nlc3RCICogMik7XG4gICAgICAgICAgICAgICAgdXZDLmZyb21BcnJheShhdHRyaWJ1dGVzLnV2LmRhdGEsIGNsb3Nlc3RDICogMik7XG4gICAgICAgICAgICAgICAgbWVzaC5oaXQudXYuc2V0KFxuICAgICAgICAgICAgICAgICAgICB1dkEueCAqIGJhcnljb29yZC54ICsgdXZCLnggKiBiYXJ5Y29vcmQueSArIHV2Qy54ICogYmFyeWNvb3JkLnosXG4gICAgICAgICAgICAgICAgICAgIHV2QS55ICogYmFyeWNvb3JkLnggKyB1dkIueSAqIGJhcnljb29yZC55ICsgdXZDLnkgKiBiYXJ5Y29vcmQuelxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChpbmNsdWRlTm9ybWFsICYmIGF0dHJpYnV0ZXMubm9ybWFsKSB7XG4gICAgICAgICAgICAgICAgYS5mcm9tQXJyYXkoYXR0cmlidXRlcy5ub3JtYWwuZGF0YSwgY2xvc2VzdEEgKiAzKTtcbiAgICAgICAgICAgICAgICBiLmZyb21BcnJheShhdHRyaWJ1dGVzLm5vcm1hbC5kYXRhLCBjbG9zZXN0QiAqIDMpO1xuICAgICAgICAgICAgICAgIGMuZnJvbUFycmF5KGF0dHJpYnV0ZXMubm9ybWFsLmRhdGEsIGNsb3Nlc3RDICogMyk7XG4gICAgICAgICAgICAgICAgbWVzaC5oaXQubG9jYWxOb3JtYWwuc2V0KFxuICAgICAgICAgICAgICAgICAgICBhLnggKiBiYXJ5Y29vcmQueCArIGIueCAqIGJhcnljb29yZC55ICsgYy54ICogYmFyeWNvb3JkLnosXG4gICAgICAgICAgICAgICAgICAgIGEueSAqIGJhcnljb29yZC54ICsgYi55ICogYmFyeWNvb3JkLnkgKyBjLnkgKiBiYXJ5Y29vcmQueixcbiAgICAgICAgICAgICAgICAgICAgYS56ICogYmFyeWNvb3JkLnggKyBiLnogKiBiYXJ5Y29vcmQueSArIGMueiAqIGJhcnljb29yZC56XG4gICAgICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgICAgIG1lc2guaGl0Lm5vcm1hbC5jb3B5KG1lc2guaGl0LmxvY2FsTm9ybWFsKS50cmFuc2Zvcm1EaXJlY3Rpb24obWVzaC53b3JsZE1hdHJpeCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBoaXRzLnNvcnQoKGEsIGIpID0+IGEuaGl0LmRpc3RhbmNlIC0gYi5oaXQuZGlzdGFuY2UpO1xuICAgICAgICByZXR1cm4gaGl0cztcbiAgICB9XG5cbiAgICBpbnRlcnNlY3RTcGhlcmUoc3BoZXJlLCBvcmlnaW4gPSB0aGlzLm9yaWdpbiwgZGlyZWN0aW9uID0gdGhpcy5kaXJlY3Rpb24pIHtcbiAgICAgICAgY29uc3QgcmF5ID0gdGVtcFZlYzNjO1xuICAgICAgICByYXkuc3ViKHNwaGVyZS5jZW50ZXIsIG9yaWdpbik7XG4gICAgICAgIGNvbnN0IHRjYSA9IHJheS5kb3QoZGlyZWN0aW9uKTtcbiAgICAgICAgY29uc3QgZDIgPSByYXkuZG90KHJheSkgLSB0Y2EgKiB0Y2E7XG4gICAgICAgIGNvbnN0IHJhZGl1czIgPSBzcGhlcmUucmFkaXVzICogc3BoZXJlLnJhZGl1cztcbiAgICAgICAgaWYgKGQyID4gcmFkaXVzMikgcmV0dXJuIDA7XG4gICAgICAgIGNvbnN0IHRoYyA9IE1hdGguc3FydChyYWRpdXMyIC0gZDIpO1xuICAgICAgICBjb25zdCB0MCA9IHRjYSAtIHRoYztcbiAgICAgICAgY29uc3QgdDEgPSB0Y2EgKyB0aGM7XG4gICAgICAgIGlmICh0MCA8IDAgJiYgdDEgPCAwKSByZXR1cm4gMDtcbiAgICAgICAgaWYgKHQwIDwgMCkgcmV0dXJuIHQxO1xuICAgICAgICByZXR1cm4gdDA7XG4gICAgfVxuXG4gICAgLy8gUmF5IEFBQkIgLSBSYXkgQXhpcyBhbGlnbmVkIGJvdW5kaW5nIGJveCB0ZXN0aW5nXG4gICAgaW50ZXJzZWN0Qm94KGJveCwgb3JpZ2luID0gdGhpcy5vcmlnaW4sIGRpcmVjdGlvbiA9IHRoaXMuZGlyZWN0aW9uKSB7XG4gICAgICAgIGxldCB0bWluLCB0bWF4LCB0WW1pbiwgdFltYXgsIHRabWluLCB0Wm1heDtcbiAgICAgICAgY29uc3QgaW52ZGlyeCA9IDEgLyBkaXJlY3Rpb24ueDtcbiAgICAgICAgY29uc3QgaW52ZGlyeSA9IDEgLyBkaXJlY3Rpb24ueTtcbiAgICAgICAgY29uc3QgaW52ZGlyeiA9IDEgLyBkaXJlY3Rpb24uejtcbiAgICAgICAgY29uc3QgbWluID0gYm94Lm1pbjtcbiAgICAgICAgY29uc3QgbWF4ID0gYm94Lm1heDtcbiAgICAgICAgdG1pbiA9ICgoaW52ZGlyeCA+PSAwID8gbWluLnggOiBtYXgueCkgLSBvcmlnaW4ueCkgKiBpbnZkaXJ4O1xuICAgICAgICB0bWF4ID0gKChpbnZkaXJ4ID49IDAgPyBtYXgueCA6IG1pbi54KSAtIG9yaWdpbi54KSAqIGludmRpcng7XG4gICAgICAgIHRZbWluID0gKChpbnZkaXJ5ID49IDAgPyBtaW4ueSA6IG1heC55KSAtIG9yaWdpbi55KSAqIGludmRpcnk7XG4gICAgICAgIHRZbWF4ID0gKChpbnZkaXJ5ID49IDAgPyBtYXgueSA6IG1pbi55KSAtIG9yaWdpbi55KSAqIGludmRpcnk7XG4gICAgICAgIGlmICh0bWluID4gdFltYXggfHwgdFltaW4gPiB0bWF4KSByZXR1cm4gMDtcbiAgICAgICAgaWYgKHRZbWluID4gdG1pbikgdG1pbiA9IHRZbWluO1xuICAgICAgICBpZiAodFltYXggPCB0bWF4KSB0bWF4ID0gdFltYXg7XG4gICAgICAgIHRabWluID0gKChpbnZkaXJ6ID49IDAgPyBtaW4ueiA6IG1heC56KSAtIG9yaWdpbi56KSAqIGludmRpcno7XG4gICAgICAgIHRabWF4ID0gKChpbnZkaXJ6ID49IDAgPyBtYXgueiA6IG1pbi56KSAtIG9yaWdpbi56KSAqIGludmRpcno7XG4gICAgICAgIGlmICh0bWluID4gdFptYXggfHwgdFptaW4gPiB0bWF4KSByZXR1cm4gMDtcbiAgICAgICAgaWYgKHRabWluID4gdG1pbikgdG1pbiA9IHRabWluO1xuICAgICAgICBpZiAodFptYXggPCB0bWF4KSB0bWF4ID0gdFptYXg7XG4gICAgICAgIGlmICh0bWF4IDwgMCkgcmV0dXJuIDA7XG4gICAgICAgIHJldHVybiB0bWluID49IDAgPyB0bWluIDogdG1heDtcbiAgICB9XG5cbiAgICBpbnRlcnNlY3RUcmlhbmdsZShhLCBiLCBjLCBiYWNrZmFjZUN1bGxpbmcgPSB0cnVlLCBvcmlnaW4gPSB0aGlzLm9yaWdpbiwgZGlyZWN0aW9uID0gdGhpcy5kaXJlY3Rpb24sIG5vcm1hbCA9IHRlbXBWZWMzZykge1xuICAgICAgICAvLyBmcm9tIGh0dHBzOi8vZ2l0aHViLmNvbS9tcmRvb2IvdGhyZWUuanMvYmxvYi9tYXN0ZXIvc3JjL21hdGgvUmF5LmpzXG4gICAgICAgIC8vIHdoaWNoIGlzIGZyb20gaHR0cDovL3d3dy5nZW9tZXRyaWN0b29scy5jb20vR1RFbmdpbmUvSW5jbHVkZS9NYXRoZW1hdGljcy9HdGVJbnRyUmF5M1RyaWFuZ2xlMy5oXG4gICAgICAgIGNvbnN0IGVkZ2UxID0gdGVtcFZlYzNoO1xuICAgICAgICBjb25zdCBlZGdlMiA9IHRlbXBWZWMzaTtcbiAgICAgICAgY29uc3QgZGlmZiA9IHRlbXBWZWMzajtcbiAgICAgICAgZWRnZTEuc3ViKGIsIGEpO1xuICAgICAgICBlZGdlMi5zdWIoYywgYSk7XG4gICAgICAgIG5vcm1hbC5jcm9zcyhlZGdlMSwgZWRnZTIpO1xuICAgICAgICBsZXQgRGROID0gZGlyZWN0aW9uLmRvdChub3JtYWwpO1xuICAgICAgICBpZiAoIURkTikgcmV0dXJuIDA7XG4gICAgICAgIGxldCBzaWduO1xuICAgICAgICBpZiAoRGROID4gMCkge1xuICAgICAgICAgICAgaWYgKGJhY2tmYWNlQ3VsbGluZykgcmV0dXJuIDA7XG4gICAgICAgICAgICBzaWduID0gMTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHNpZ24gPSAtMTtcbiAgICAgICAgICAgIERkTiA9IC1EZE47XG4gICAgICAgIH1cbiAgICAgICAgZGlmZi5zdWIob3JpZ2luLCBhKTtcbiAgICAgICAgbGV0IERkUXhFMiA9IHNpZ24gKiBkaXJlY3Rpb24uZG90KGVkZ2UyLmNyb3NzKGRpZmYsIGVkZ2UyKSk7XG4gICAgICAgIGlmIChEZFF4RTIgPCAwKSByZXR1cm4gMDtcbiAgICAgICAgbGV0IERkRTF4USA9IHNpZ24gKiBkaXJlY3Rpb24uZG90KGVkZ2UxLmNyb3NzKGRpZmYpKTtcbiAgICAgICAgaWYgKERkRTF4USA8IDApIHJldHVybiAwO1xuICAgICAgICBpZiAoRGRReEUyICsgRGRFMXhRID4gRGROKSByZXR1cm4gMDtcbiAgICAgICAgbGV0IFFkTiA9IC1zaWduICogZGlmZi5kb3Qobm9ybWFsKTtcbiAgICAgICAgaWYgKFFkTiA8IDApIHJldHVybiAwO1xuICAgICAgICByZXR1cm4gUWROIC8gRGROO1xuICAgIH1cblxuICAgIGdldEJhcnljb29yZChwb2ludCwgYSwgYiwgYywgdGFyZ2V0ID0gdGVtcFZlYzNoKSB7XG4gICAgICAgIC8vIEZyb20gaHR0cHM6Ly9naXRodWIuY29tL21yZG9vYi90aHJlZS5qcy9ibG9iL21hc3Rlci9zcmMvbWF0aC9UcmlhbmdsZS5qc1xuICAgICAgICAvLyBzdGF0aWMvaW5zdGFuY2UgbWV0aG9kIHRvIGNhbGN1bGF0ZSBiYXJ5Y2VudHJpYyBjb29yZGluYXRlc1xuICAgICAgICAvLyBiYXNlZCBvbjogaHR0cDovL3d3dy5ibGFja3Bhd24uY29tL3RleHRzL3BvaW50aW5wb2x5L2RlZmF1bHQuaHRtbFxuICAgICAgICBjb25zdCB2MCA9IHRlbXBWZWMzaTtcbiAgICAgICAgY29uc3QgdjEgPSB0ZW1wVmVjM2o7XG4gICAgICAgIGNvbnN0IHYyID0gdGVtcFZlYzNrO1xuICAgICAgICB2MC5zdWIoYywgYSk7XG4gICAgICAgIHYxLnN1YihiLCBhKTtcbiAgICAgICAgdjIuc3ViKHBvaW50LCBhKTtcbiAgICAgICAgY29uc3QgZG90MDAgPSB2MC5kb3QodjApO1xuICAgICAgICBjb25zdCBkb3QwMSA9IHYwLmRvdCh2MSk7XG4gICAgICAgIGNvbnN0IGRvdDAyID0gdjAuZG90KHYyKTtcbiAgICAgICAgY29uc3QgZG90MTEgPSB2MS5kb3QodjEpO1xuICAgICAgICBjb25zdCBkb3QxMiA9IHYxLmRvdCh2Mik7XG4gICAgICAgIGNvbnN0IGRlbm9tID0gZG90MDAgKiBkb3QxMSAtIGRvdDAxICogZG90MDE7XG4gICAgICAgIGlmIChkZW5vbSA9PT0gMCkgcmV0dXJuIHRhcmdldC5zZXQoLTIsIC0xLCAtMSk7XG4gICAgICAgIGNvbnN0IGludkRlbm9tID0gMSAvIGRlbm9tO1xuICAgICAgICBjb25zdCB1ID0gKGRvdDExICogZG90MDIgLSBkb3QwMSAqIGRvdDEyKSAqIGludkRlbm9tO1xuICAgICAgICBjb25zdCB2ID0gKGRvdDAwICogZG90MTIgLSBkb3QwMSAqIGRvdDAyKSAqIGludkRlbm9tO1xuICAgICAgICByZXR1cm4gdGFyZ2V0LnNldCgxIC0gdSAtIHYsIHYsIHUpO1xuICAgIH1cbn1cbiIsImltcG9ydCB7IENhbWVyYSB9IGZyb20gJy4uL2NvcmUvQ2FtZXJhLmpzJztcbmltcG9ydCB7IFByb2dyYW0gfSBmcm9tICcuLi9jb3JlL1Byb2dyYW0uanMnO1xuaW1wb3J0IHsgUmVuZGVyVGFyZ2V0IH0gZnJvbSAnLi4vY29yZS9SZW5kZXJUYXJnZXQuanMnO1xuXG5leHBvcnQgY2xhc3MgU2hhZG93IHtcbiAgICBjb25zdHJ1Y3RvcihnbCwgeyBsaWdodCA9IG5ldyBDYW1lcmEoZ2wpLCB3aWR0aCA9IDEwMjQsIGhlaWdodCA9IHdpZHRoIH0pIHtcbiAgICAgICAgdGhpcy5nbCA9IGdsO1xuXG4gICAgICAgIHRoaXMubGlnaHQgPSBsaWdodDtcblxuICAgICAgICB0aGlzLnRhcmdldCA9IG5ldyBSZW5kZXJUYXJnZXQoZ2wsIHsgd2lkdGgsIGhlaWdodCB9KTtcblxuICAgICAgICB0aGlzLmRlcHRoUHJvZ3JhbSA9IG5ldyBQcm9ncmFtKGdsLCB7XG4gICAgICAgICAgICB2ZXJ0ZXg6IGRlZmF1bHRWZXJ0ZXgsXG4gICAgICAgICAgICBmcmFnbWVudDogZGVmYXVsdEZyYWdtZW50LFxuICAgICAgICAgICAgY3VsbEZhY2U6IG51bGwsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuY2FzdE1lc2hlcyA9IFtdO1xuICAgIH1cblxuICAgIGFkZCh7XG4gICAgICAgIG1lc2gsXG4gICAgICAgIHJlY2VpdmUgPSB0cnVlLFxuICAgICAgICBjYXN0ID0gdHJ1ZSxcbiAgICAgICAgdmVydGV4ID0gZGVmYXVsdFZlcnRleCxcbiAgICAgICAgZnJhZ21lbnQgPSBkZWZhdWx0RnJhZ21lbnQsXG4gICAgICAgIHVuaWZvcm1Qcm9qZWN0aW9uID0gJ3NoYWRvd1Byb2plY3Rpb25NYXRyaXgnLFxuICAgICAgICB1bmlmb3JtVmlldyA9ICdzaGFkb3dWaWV3TWF0cml4JyxcbiAgICAgICAgdW5pZm9ybVRleHR1cmUgPSAndFNoYWRvdycsXG4gICAgfSkge1xuICAgICAgICAvLyBBZGQgdW5pZm9ybXMgdG8gZXhpc3RpbmcgcHJvZ3JhbVxuICAgICAgICBpZiAocmVjZWl2ZSAmJiAhbWVzaC5wcm9ncmFtLnVuaWZvcm1zW3VuaWZvcm1Qcm9qZWN0aW9uXSkge1xuICAgICAgICAgICAgbWVzaC5wcm9ncmFtLnVuaWZvcm1zW3VuaWZvcm1Qcm9qZWN0aW9uXSA9IHsgdmFsdWU6IHRoaXMubGlnaHQucHJvamVjdGlvbk1hdHJpeCB9O1xuICAgICAgICAgICAgbWVzaC5wcm9ncmFtLnVuaWZvcm1zW3VuaWZvcm1WaWV3XSA9IHsgdmFsdWU6IHRoaXMubGlnaHQudmlld01hdHJpeCB9O1xuICAgICAgICAgICAgbWVzaC5wcm9ncmFtLnVuaWZvcm1zW3VuaWZvcm1UZXh0dXJlXSA9IHsgdmFsdWU6IHRoaXMudGFyZ2V0LnRleHR1cmUgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghY2FzdCkgcmV0dXJuO1xuICAgICAgICB0aGlzLmNhc3RNZXNoZXMucHVzaChtZXNoKTtcblxuICAgICAgICAvLyBTdG9yZSBwcm9ncmFtIGZvciB3aGVuIHN3aXRjaGluZyBiZXR3ZWVuIGRlcHRoIG92ZXJyaWRlXG4gICAgICAgIG1lc2guY29sb3JQcm9ncmFtID0gbWVzaC5wcm9ncmFtO1xuXG4gICAgICAgIC8vIENoZWNrIGlmIGRlcHRoIHByb2dyYW0gYWxyZWFkeSBhdHRhY2hlZFxuICAgICAgICBpZiAobWVzaC5kZXB0aFByb2dyYW0pIHJldHVybjtcblxuICAgICAgICAvLyBVc2UgZ2xvYmFsIGRlcHRoIG92ZXJyaWRlIGlmIG5vdGhpbmcgY3VzdG9tIHBhc3NlZCBpblxuICAgICAgICBpZiAodmVydGV4ID09PSBkZWZhdWx0VmVydGV4ICYmIGZyYWdtZW50ID09PSBkZWZhdWx0RnJhZ21lbnQpIHtcbiAgICAgICAgICAgIG1lc2guZGVwdGhQcm9ncmFtID0gdGhpcy5kZXB0aFByb2dyYW07XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBDcmVhdGUgY3VzdG9tIG92ZXJyaWRlIHByb2dyYW1cbiAgICAgICAgbWVzaC5kZXB0aFByb2dyYW0gPSBuZXcgUHJvZ3JhbSh0aGlzLmdsLCB7XG4gICAgICAgICAgICB2ZXJ0ZXgsXG4gICAgICAgICAgICBmcmFnbWVudCxcbiAgICAgICAgICAgIGN1bGxGYWNlOiBudWxsLFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICByZW5kZXIoeyBzY2VuZSB9KSB7XG4gICAgICAgIC8vIEZvciBkZXB0aCByZW5kZXIsIHJlcGxhY2UgcHJvZ3JhbSB3aXRoIGRlcHRoIG92ZXJyaWRlLlxuICAgICAgICAvLyBIaWRlIG1lc2hlcyBub3QgY2FzdGluZyBzaGFkb3dzLlxuICAgICAgICBzY2VuZS50cmF2ZXJzZSgobm9kZSkgPT4ge1xuICAgICAgICAgICAgaWYgKCFub2RlLmRyYXcpIHJldHVybjtcbiAgICAgICAgICAgIGlmICghIX50aGlzLmNhc3RNZXNoZXMuaW5kZXhPZihub2RlKSkge1xuICAgICAgICAgICAgICAgIG5vZGUucHJvZ3JhbSA9IG5vZGUuZGVwdGhQcm9ncmFtO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBub2RlLmlzRm9yY2VWaXNpYmlsaXR5ID0gbm9kZS52aXNpYmxlO1xuICAgICAgICAgICAgICAgIG5vZGUudmlzaWJsZSA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBSZW5kZXIgdGhlIGRlcHRoIHNoYWRvdyBtYXAgdXNpbmcgdGhlIGxpZ2h0IGFzIHRoZSBjYW1lcmFcbiAgICAgICAgdGhpcy5nbC5yZW5kZXJlci5yZW5kZXIoe1xuICAgICAgICAgICAgc2NlbmUsXG4gICAgICAgICAgICBjYW1lcmE6IHRoaXMubGlnaHQsXG4gICAgICAgICAgICB0YXJnZXQ6IHRoaXMudGFyZ2V0LFxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBUaGVuIHN3aXRjaCB0aGUgcHJvZ3JhbSBiYWNrIHRvIHRoZSBub3JtYWwgb25lXG4gICAgICAgIHNjZW5lLnRyYXZlcnNlKChub2RlKSA9PiB7XG4gICAgICAgICAgICBpZiAoIW5vZGUuZHJhdykgcmV0dXJuO1xuICAgICAgICAgICAgaWYgKCEhfnRoaXMuY2FzdE1lc2hlcy5pbmRleE9mKG5vZGUpKSB7XG4gICAgICAgICAgICAgICAgbm9kZS5wcm9ncmFtID0gbm9kZS5jb2xvclByb2dyYW07XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG5vZGUudmlzaWJsZSA9IG5vZGUuaXNGb3JjZVZpc2liaWxpdHk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbn1cblxuY29uc3QgZGVmYXVsdFZlcnRleCA9IC8qIGdsc2wgKi8gYFxuICAgIGF0dHJpYnV0ZSB2ZWMzIHBvc2l0aW9uO1xuICAgIGF0dHJpYnV0ZSB2ZWMyIHV2O1xuXG4gICAgdW5pZm9ybSBtYXQ0IG1vZGVsVmlld01hdHJpeDtcbiAgICB1bmlmb3JtIG1hdDQgcHJvamVjdGlvbk1hdHJpeDtcblxuICAgIHZvaWQgbWFpbigpIHtcbiAgICAgICAgZ2xfUG9zaXRpb24gPSBwcm9qZWN0aW9uTWF0cml4ICogbW9kZWxWaWV3TWF0cml4ICogdmVjNChwb3NpdGlvbiwgMS4wKTtcbiAgICB9XG5gO1xuXG5jb25zdCBkZWZhdWx0RnJhZ21lbnQgPSAvKiBnbHNsICovIGBcbiAgICBwcmVjaXNpb24gaGlnaHAgZmxvYXQ7XG5cbiAgICB2ZWM0IHBhY2tSR0JBIChmbG9hdCB2KSB7XG4gICAgICAgIHZlYzQgcGFjayA9IGZyYWN0KHZlYzQoMS4wLCAyNTUuMCwgNjUwMjUuMCwgMTY1ODEzNzUuMCkgKiB2KTtcbiAgICAgICAgcGFjayAtPSBwYWNrLnl6d3cgKiB2ZWMyKDEuMCAvIDI1NS4wLCAwLjApLnh4eHk7XG4gICAgICAgIHJldHVybiBwYWNrO1xuICAgIH1cblxuICAgIHZvaWQgbWFpbigpIHtcbiAgICAgICAgZ2xfRnJhZ0NvbG9yID0gcGFja1JHQkEoZ2xfRnJhZ0Nvb3JkLnopO1xuICAgIH1cbmA7XG4iLCJpbXBvcnQgeyBNZXNoIH0gZnJvbSAnLi4vY29yZS9NZXNoLmpzJztcbmltcG9ydCB7IFRyYW5zZm9ybSB9IGZyb20gJy4uL2NvcmUvVHJhbnNmb3JtLmpzJztcbmltcG9ydCB7IE1hdDQgfSBmcm9tICcuLi9tYXRoL01hdDQuanMnO1xuaW1wb3J0IHsgVGV4dHVyZSB9IGZyb20gJy4uL2NvcmUvVGV4dHVyZS5qcyc7XG5pbXBvcnQgeyBBbmltYXRpb24gfSBmcm9tICcuL0FuaW1hdGlvbi5qcyc7XG5cbmNvbnN0IHRlbXBNYXQ0ID0gbmV3IE1hdDQoKTtcblxuZXhwb3J0IGNsYXNzIFNraW4gZXh0ZW5kcyBNZXNoIHtcbiAgICBjb25zdHJ1Y3RvcihnbCwgeyByaWcsIGdlb21ldHJ5LCBwcm9ncmFtLCBtb2RlID0gZ2wuVFJJQU5HTEVTIH0gPSB7fSkge1xuICAgICAgICBzdXBlcihnbCwgeyBnZW9tZXRyeSwgcHJvZ3JhbSwgbW9kZSB9KTtcblxuICAgICAgICB0aGlzLmNyZWF0ZUJvbmVzKHJpZyk7XG4gICAgICAgIHRoaXMuY3JlYXRlQm9uZVRleHR1cmUoKTtcbiAgICAgICAgdGhpcy5hbmltYXRpb25zID0gW107XG5cbiAgICAgICAgT2JqZWN0LmFzc2lnbih0aGlzLnByb2dyYW0udW5pZm9ybXMsIHtcbiAgICAgICAgICAgIGJvbmVUZXh0dXJlOiB7IHZhbHVlOiB0aGlzLmJvbmVUZXh0dXJlIH0sXG4gICAgICAgICAgICBib25lVGV4dHVyZVNpemU6IHsgdmFsdWU6IHRoaXMuYm9uZVRleHR1cmVTaXplIH0sXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGNyZWF0ZUJvbmVzKHJpZykge1xuICAgICAgICAvLyBDcmVhdGUgcm9vdCBzbyB0aGF0IGNhbiBzaW1wbHkgdXBkYXRlIHdvcmxkIG1hdHJpeCBvZiB3aG9sZSBza2VsZXRvblxuICAgICAgICB0aGlzLnJvb3QgPSBuZXcgVHJhbnNmb3JtKCk7XG5cbiAgICAgICAgLy8gQ3JlYXRlIGJvbmVzXG4gICAgICAgIHRoaXMuYm9uZXMgPSBbXTtcbiAgICAgICAgaWYgKCFyaWcuYm9uZXMgfHwgIXJpZy5ib25lcy5sZW5ndGgpIHJldHVybjtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCByaWcuYm9uZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IGJvbmUgPSBuZXcgVHJhbnNmb3JtKCk7XG5cbiAgICAgICAgICAgIC8vIFNldCBpbml0aWFsIHZhbHVlcyAoYmluZCBwb3NlKVxuICAgICAgICAgICAgYm9uZS5wb3NpdGlvbi5mcm9tQXJyYXkocmlnLmJpbmRQb3NlLnBvc2l0aW9uLCBpICogMyk7XG4gICAgICAgICAgICBib25lLnF1YXRlcm5pb24uZnJvbUFycmF5KHJpZy5iaW5kUG9zZS5xdWF0ZXJuaW9uLCBpICogNCk7XG4gICAgICAgICAgICBib25lLnNjYWxlLmZyb21BcnJheShyaWcuYmluZFBvc2Uuc2NhbGUsIGkgKiAzKTtcblxuICAgICAgICAgICAgdGhpcy5ib25lcy5wdXNoKGJvbmUpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gT25jZSBjcmVhdGVkLCBzZXQgdGhlIGhpZXJhcmNoeVxuICAgICAgICByaWcuYm9uZXMuZm9yRWFjaCgoZGF0YSwgaSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5ib25lc1tpXS5uYW1lID0gZGF0YS5uYW1lO1xuICAgICAgICAgICAgaWYgKGRhdGEucGFyZW50ID09PSAtMSkgcmV0dXJuIHRoaXMuYm9uZXNbaV0uc2V0UGFyZW50KHRoaXMucm9vdCk7XG4gICAgICAgICAgICB0aGlzLmJvbmVzW2ldLnNldFBhcmVudCh0aGlzLmJvbmVzW2RhdGEucGFyZW50XSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIFRoZW4gdXBkYXRlIHRvIGNhbGN1bGF0ZSB3b3JsZCBtYXRyaWNlc1xuICAgICAgICB0aGlzLnJvb3QudXBkYXRlTWF0cml4V29ybGQodHJ1ZSk7XG5cbiAgICAgICAgLy8gU3RvcmUgaW52ZXJzZSBvZiBiaW5kIHBvc2UgdG8gY2FsY3VsYXRlIGRpZmZlcmVuY2VzXG4gICAgICAgIHRoaXMuYm9uZXMuZm9yRWFjaCgoYm9uZSkgPT4ge1xuICAgICAgICAgICAgYm9uZS5iaW5kSW52ZXJzZSA9IG5ldyBNYXQ0KC4uLmJvbmUud29ybGRNYXRyaXgpLmludmVyc2UoKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgY3JlYXRlQm9uZVRleHR1cmUoKSB7XG4gICAgICAgIGlmICghdGhpcy5ib25lcy5sZW5ndGgpIHJldHVybjtcbiAgICAgICAgY29uc3Qgc2l6ZSA9IE1hdGgubWF4KDQsIE1hdGgucG93KDIsIE1hdGguY2VpbChNYXRoLmxvZyhNYXRoLnNxcnQodGhpcy5ib25lcy5sZW5ndGggKiA0KSkgLyBNYXRoLkxOMikpKTtcbiAgICAgICAgdGhpcy5ib25lTWF0cmljZXMgPSBuZXcgRmxvYXQzMkFycmF5KHNpemUgKiBzaXplICogNCk7XG4gICAgICAgIHRoaXMuYm9uZVRleHR1cmVTaXplID0gc2l6ZTtcbiAgICAgICAgdGhpcy5ib25lVGV4dHVyZSA9IG5ldyBUZXh0dXJlKHRoaXMuZ2wsIHtcbiAgICAgICAgICAgIGltYWdlOiB0aGlzLmJvbmVNYXRyaWNlcyxcbiAgICAgICAgICAgIGdlbmVyYXRlTWlwbWFwczogZmFsc2UsXG4gICAgICAgICAgICB0eXBlOiB0aGlzLmdsLkZMT0FULFxuICAgICAgICAgICAgaW50ZXJuYWxGb3JtYXQ6IHRoaXMuZ2wucmVuZGVyZXIuaXNXZWJnbDIgPyB0aGlzLmdsLlJHQkEzMkYgOiB0aGlzLmdsLlJHQkEsXG4gICAgICAgICAgICBtaW5GaWx0ZXI6IHRoaXMuZ2wuTkVBUkVTVCxcbiAgICAgICAgICAgIG1hZ0ZpbHRlcjogdGhpcy5nbC5ORUFSRVNULFxuICAgICAgICAgICAgZmxpcFk6IGZhbHNlLFxuICAgICAgICAgICAgd2lkdGg6IHNpemUsXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGFkZEFuaW1hdGlvbihkYXRhKSB7XG4gICAgICAgIGNvbnN0IGFuaW1hdGlvbiA9IG5ldyBBbmltYXRpb24oeyBvYmplY3RzOiB0aGlzLmJvbmVzLCBkYXRhIH0pO1xuICAgICAgICB0aGlzLmFuaW1hdGlvbnMucHVzaChhbmltYXRpb24pO1xuICAgICAgICByZXR1cm4gYW5pbWF0aW9uO1xuICAgIH1cblxuICAgIHVwZGF0ZSgpIHtcbiAgICAgICAgLy8gQ2FsY3VsYXRlIGNvbWJpbmVkIGFuaW1hdGlvbiB3ZWlnaHRcbiAgICAgICAgbGV0IHRvdGFsID0gMDtcbiAgICAgICAgdGhpcy5hbmltYXRpb25zLmZvckVhY2goKGFuaW1hdGlvbikgPT4gKHRvdGFsICs9IGFuaW1hdGlvbi53ZWlnaHQpKTtcblxuICAgICAgICB0aGlzLmFuaW1hdGlvbnMuZm9yRWFjaCgoYW5pbWF0aW9uLCBpKSA9PiB7XG4gICAgICAgICAgICAvLyBmb3JjZSBmaXJzdCBhbmltYXRpb24gdG8gc2V0IGluIG9yZGVyIHRvIHJlc2V0IGZyYW1lXG4gICAgICAgICAgICBhbmltYXRpb24udXBkYXRlKHRvdGFsLCBpID09PSAwKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZHJhdyh7IGNhbWVyYSB9ID0ge30pIHtcbiAgICAgICAgLy8gVXBkYXRlIHdvcmxkIG1hdHJpY2VzIG1hbnVhbGx5LCBhcyBub3QgcGFydCBvZiBzY2VuZSBncmFwaFxuICAgICAgICB0aGlzLnJvb3QudXBkYXRlTWF0cml4V29ybGQodHJ1ZSk7XG5cbiAgICAgICAgLy8gVXBkYXRlIGJvbmUgdGV4dHVyZVxuICAgICAgICB0aGlzLmJvbmVzLmZvckVhY2goKGJvbmUsIGkpID0+IHtcbiAgICAgICAgICAgIC8vIEZpbmQgZGlmZmVyZW5jZSBiZXR3ZWVuIGN1cnJlbnQgYW5kIGJpbmQgcG9zZVxuICAgICAgICAgICAgdGVtcE1hdDQubXVsdGlwbHkoYm9uZS53b3JsZE1hdHJpeCwgYm9uZS5iaW5kSW52ZXJzZSk7XG4gICAgICAgICAgICB0aGlzLmJvbmVNYXRyaWNlcy5zZXQodGVtcE1hdDQsIGkgKiAxNik7XG4gICAgICAgIH0pO1xuICAgICAgICBpZiAodGhpcy5ib25lVGV4dHVyZSkgdGhpcy5ib25lVGV4dHVyZS5uZWVkc1VwZGF0ZSA9IHRydWU7XG5cbiAgICAgICAgc3VwZXIuZHJhdyh7IGNhbWVyYSB9KTtcbiAgICB9XG59XG4iLCJpbXBvcnQgeyBHZW9tZXRyeSB9IGZyb20gJy4uL2NvcmUvR2VvbWV0cnkuanMnO1xuaW1wb3J0IHsgVmVjMyB9IGZyb20gJy4uL21hdGgvVmVjMy5qcyc7XG5cbmV4cG9ydCBjbGFzcyBTcGhlcmUgZXh0ZW5kcyBHZW9tZXRyeSB7XG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIGdsLFxuICAgICAgICB7XG4gICAgICAgICAgICByYWRpdXMgPSAwLjUsXG4gICAgICAgICAgICB3aWR0aFNlZ21lbnRzID0gMTYsXG4gICAgICAgICAgICBoZWlnaHRTZWdtZW50cyA9IE1hdGguY2VpbCh3aWR0aFNlZ21lbnRzICogMC41KSxcbiAgICAgICAgICAgIHBoaVN0YXJ0ID0gMCxcbiAgICAgICAgICAgIHBoaUxlbmd0aCA9IE1hdGguUEkgKiAyLFxuICAgICAgICAgICAgdGhldGFTdGFydCA9IDAsXG4gICAgICAgICAgICB0aGV0YUxlbmd0aCA9IE1hdGguUEksXG4gICAgICAgICAgICBhdHRyaWJ1dGVzID0ge30sXG4gICAgICAgIH0gPSB7fVxuICAgICkge1xuICAgICAgICBjb25zdCB3U2VncyA9IHdpZHRoU2VnbWVudHM7XG4gICAgICAgIGNvbnN0IGhTZWdzID0gaGVpZ2h0U2VnbWVudHM7XG4gICAgICAgIGNvbnN0IHBTdGFydCA9IHBoaVN0YXJ0O1xuICAgICAgICBjb25zdCBwTGVuZ3RoID0gcGhpTGVuZ3RoO1xuICAgICAgICBjb25zdCB0U3RhcnQgPSB0aGV0YVN0YXJ0O1xuICAgICAgICBjb25zdCB0TGVuZ3RoID0gdGhldGFMZW5ndGg7XG5cbiAgICAgICAgY29uc3QgbnVtID0gKHdTZWdzICsgMSkgKiAoaFNlZ3MgKyAxKTtcbiAgICAgICAgY29uc3QgbnVtSW5kaWNlcyA9IHdTZWdzICogaFNlZ3MgKiA2O1xuXG4gICAgICAgIGNvbnN0IHBvc2l0aW9uID0gbmV3IEZsb2F0MzJBcnJheShudW0gKiAzKTtcbiAgICAgICAgY29uc3Qgbm9ybWFsID0gbmV3IEZsb2F0MzJBcnJheShudW0gKiAzKTtcbiAgICAgICAgY29uc3QgdXYgPSBuZXcgRmxvYXQzMkFycmF5KG51bSAqIDIpO1xuICAgICAgICBjb25zdCBpbmRleCA9IG51bSA+IDY1NTM2ID8gbmV3IFVpbnQzMkFycmF5KG51bUluZGljZXMpIDogbmV3IFVpbnQxNkFycmF5KG51bUluZGljZXMpO1xuXG4gICAgICAgIGxldCBpID0gMDtcbiAgICAgICAgbGV0IGl2ID0gMDtcbiAgICAgICAgbGV0IGlpID0gMDtcbiAgICAgICAgbGV0IHRlID0gdFN0YXJ0ICsgdExlbmd0aDtcbiAgICAgICAgY29uc3QgZ3JpZCA9IFtdO1xuXG4gICAgICAgIGxldCBuID0gbmV3IFZlYzMoKTtcblxuICAgICAgICBmb3IgKGxldCBpeSA9IDA7IGl5IDw9IGhTZWdzOyBpeSsrKSB7XG4gICAgICAgICAgICBsZXQgdlJvdyA9IFtdO1xuICAgICAgICAgICAgbGV0IHYgPSBpeSAvIGhTZWdzO1xuICAgICAgICAgICAgZm9yIChsZXQgaXggPSAwOyBpeCA8PSB3U2VnczsgaXgrKywgaSsrKSB7XG4gICAgICAgICAgICAgICAgbGV0IHUgPSBpeCAvIHdTZWdzO1xuICAgICAgICAgICAgICAgIGxldCB4ID0gLXJhZGl1cyAqIE1hdGguY29zKHBTdGFydCArIHUgKiBwTGVuZ3RoKSAqIE1hdGguc2luKHRTdGFydCArIHYgKiB0TGVuZ3RoKTtcbiAgICAgICAgICAgICAgICBsZXQgeSA9IHJhZGl1cyAqIE1hdGguY29zKHRTdGFydCArIHYgKiB0TGVuZ3RoKTtcbiAgICAgICAgICAgICAgICBsZXQgeiA9IHJhZGl1cyAqIE1hdGguc2luKHBTdGFydCArIHUgKiBwTGVuZ3RoKSAqIE1hdGguc2luKHRTdGFydCArIHYgKiB0TGVuZ3RoKTtcblxuICAgICAgICAgICAgICAgIHBvc2l0aW9uW2kgKiAzXSA9IHg7XG4gICAgICAgICAgICAgICAgcG9zaXRpb25baSAqIDMgKyAxXSA9IHk7XG4gICAgICAgICAgICAgICAgcG9zaXRpb25baSAqIDMgKyAyXSA9IHo7XG5cbiAgICAgICAgICAgICAgICBuLnNldCh4LCB5LCB6KS5ub3JtYWxpemUoKTtcbiAgICAgICAgICAgICAgICBub3JtYWxbaSAqIDNdID0gbi54O1xuICAgICAgICAgICAgICAgIG5vcm1hbFtpICogMyArIDFdID0gbi55O1xuICAgICAgICAgICAgICAgIG5vcm1hbFtpICogMyArIDJdID0gbi56O1xuXG4gICAgICAgICAgICAgICAgdXZbaSAqIDJdID0gdTtcbiAgICAgICAgICAgICAgICB1dltpICogMiArIDFdID0gMSAtIHY7XG5cbiAgICAgICAgICAgICAgICB2Um93LnB1c2goaXYrKyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGdyaWQucHVzaCh2Um93KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAobGV0IGl5ID0gMDsgaXkgPCBoU2VnczsgaXkrKykge1xuICAgICAgICAgICAgZm9yIChsZXQgaXggPSAwOyBpeCA8IHdTZWdzOyBpeCsrKSB7XG4gICAgICAgICAgICAgICAgbGV0IGEgPSBncmlkW2l5XVtpeCArIDFdO1xuICAgICAgICAgICAgICAgIGxldCBiID0gZ3JpZFtpeV1baXhdO1xuICAgICAgICAgICAgICAgIGxldCBjID0gZ3JpZFtpeSArIDFdW2l4XTtcbiAgICAgICAgICAgICAgICBsZXQgZCA9IGdyaWRbaXkgKyAxXVtpeCArIDFdO1xuXG4gICAgICAgICAgICAgICAgaWYgKGl5ICE9PSAwIHx8IHRTdGFydCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgaW5kZXhbaWkgKiAzXSA9IGE7XG4gICAgICAgICAgICAgICAgICAgIGluZGV4W2lpICogMyArIDFdID0gYjtcbiAgICAgICAgICAgICAgICAgICAgaW5kZXhbaWkgKiAzICsgMl0gPSBkO1xuICAgICAgICAgICAgICAgICAgICBpaSsrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoaXkgIT09IGhTZWdzIC0gMSB8fCB0ZSA8IE1hdGguUEkpIHtcbiAgICAgICAgICAgICAgICAgICAgaW5kZXhbaWkgKiAzXSA9IGI7XG4gICAgICAgICAgICAgICAgICAgIGluZGV4W2lpICogMyArIDFdID0gYztcbiAgICAgICAgICAgICAgICAgICAgaW5kZXhbaWkgKiAzICsgMl0gPSBkO1xuICAgICAgICAgICAgICAgICAgICBpaSsrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIE9iamVjdC5hc3NpZ24oYXR0cmlidXRlcywge1xuICAgICAgICAgICAgcG9zaXRpb246IHsgc2l6ZTogMywgZGF0YTogcG9zaXRpb24gfSxcbiAgICAgICAgICAgIG5vcm1hbDogeyBzaXplOiAzLCBkYXRhOiBub3JtYWwgfSxcbiAgICAgICAgICAgIHV2OiB7IHNpemU6IDIsIGRhdGE6IHV2IH0sXG4gICAgICAgICAgICBpbmRleDogeyBkYXRhOiBpbmRleCB9LFxuICAgICAgICB9KTtcblxuICAgICAgICBzdXBlcihnbCwgYXR0cmlidXRlcyk7XG4gICAgfVxufVxuIiwiZXhwb3J0IGZ1bmN0aW9uIFRleHQoe1xuICAgIGZvbnQsXG4gICAgdGV4dCxcbiAgICB3aWR0aCA9IEluZmluaXR5LFxuICAgIGFsaWduID0gJ2xlZnQnLFxuICAgIHNpemUgPSAxLFxuICAgIGxldHRlclNwYWNpbmcgPSAwLFxuICAgIGxpbmVIZWlnaHQgPSAxLjQsXG4gICAgd29yZFNwYWNpbmcgPSAwLFxuICAgIHdvcmRCcmVhayA9IGZhbHNlLFxufSkge1xuICAgIGNvbnN0IF90aGlzID0gdGhpcztcbiAgICBsZXQgZ2x5cGhzLCBidWZmZXJzO1xuICAgIGxldCBmb250SGVpZ2h0LCBiYXNlbGluZSwgc2NhbGU7XG5cbiAgICBjb25zdCBuZXdsaW5lID0gL1xcbi87XG4gICAgY29uc3Qgd2hpdGVzcGFjZSA9IC9cXHMvO1xuXG4gICAge1xuICAgICAgICBwYXJzZUZvbnQoKTtcbiAgICAgICAgY3JlYXRlR2VvbWV0cnkoKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwYXJzZUZvbnQoKSB7XG4gICAgICAgIGdseXBocyA9IHt9O1xuICAgICAgICBmb250LmNoYXJzLmZvckVhY2goKGQpID0+IChnbHlwaHNbZC5jaGFyXSA9IGQpKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjcmVhdGVHZW9tZXRyeSgpIHtcbiAgICAgICAgZm9udEhlaWdodCA9IGZvbnQuY29tbW9uLmxpbmVIZWlnaHQ7XG4gICAgICAgIGJhc2VsaW5lID0gZm9udC5jb21tb24uYmFzZTtcblxuICAgICAgICAvLyBVc2UgYmFzZWxpbmUgc28gdGhhdCBhY3R1YWwgdGV4dCBoZWlnaHQgaXMgYXMgY2xvc2UgdG8gJ3NpemUnIHZhbHVlIGFzIHBvc3NpYmxlXG4gICAgICAgIHNjYWxlID0gc2l6ZSAvIGJhc2VsaW5lO1xuXG4gICAgICAgIC8vIFN0cmlwIHNwYWNlcyBhbmQgbmV3bGluZXMgdG8gZ2V0IGFjdHVhbCBjaGFyYWN0ZXIgbGVuZ3RoIGZvciBidWZmZXJzXG4gICAgICAgIGxldCBjaGFycyA9IHRleHQucmVwbGFjZSgvWyBcXG5dL2csICcnKTtcbiAgICAgICAgbGV0IG51bUNoYXJzID0gY2hhcnMubGVuZ3RoO1xuXG4gICAgICAgIC8vIENyZWF0ZSBvdXRwdXQgYnVmZmVyc1xuICAgICAgICBidWZmZXJzID0ge1xuICAgICAgICAgICAgcG9zaXRpb246IG5ldyBGbG9hdDMyQXJyYXkobnVtQ2hhcnMgKiA0ICogMyksXG4gICAgICAgICAgICB1djogbmV3IEZsb2F0MzJBcnJheShudW1DaGFycyAqIDQgKiAyKSxcbiAgICAgICAgICAgIGlkOiBuZXcgRmxvYXQzMkFycmF5KG51bUNoYXJzICogNCksXG4gICAgICAgICAgICBpbmRleDogbmV3IFVpbnQxNkFycmF5KG51bUNoYXJzICogNiksXG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gU2V0IHZhbHVlcyBmb3IgYnVmZmVycyB0aGF0IGRvbid0IHJlcXVpcmUgY2FsY3VsYXRpb25cbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBudW1DaGFyczsgaSsrKSB7XG4gICAgICAgICAgICBidWZmZXJzLmlkW2ldID0gaTtcbiAgICAgICAgICAgIGJ1ZmZlcnMuaW5kZXguc2V0KFtpICogNCwgaSAqIDQgKyAyLCBpICogNCArIDEsIGkgKiA0ICsgMSwgaSAqIDQgKyAyLCBpICogNCArIDNdLCBpICogNik7XG4gICAgICAgIH1cblxuICAgICAgICBsYXlvdXQoKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsYXlvdXQoKSB7XG4gICAgICAgIGNvbnN0IGxpbmVzID0gW107XG5cbiAgICAgICAgbGV0IGN1cnNvciA9IDA7XG5cbiAgICAgICAgbGV0IHdvcmRDdXJzb3IgPSAwO1xuICAgICAgICBsZXQgd29yZFdpZHRoID0gMDtcbiAgICAgICAgbGV0IGxpbmUgPSBuZXdMaW5lKCk7XG5cbiAgICAgICAgZnVuY3Rpb24gbmV3TGluZSgpIHtcbiAgICAgICAgICAgIGNvbnN0IGxpbmUgPSB7XG4gICAgICAgICAgICAgICAgd2lkdGg6IDAsXG4gICAgICAgICAgICAgICAgZ2x5cGhzOiBbXSxcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBsaW5lcy5wdXNoKGxpbmUpO1xuICAgICAgICAgICAgd29yZEN1cnNvciA9IGN1cnNvcjtcbiAgICAgICAgICAgIHdvcmRXaWR0aCA9IDA7XG4gICAgICAgICAgICByZXR1cm4gbGluZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBtYXhUaW1lcyA9IDEwMDtcbiAgICAgICAgbGV0IGNvdW50ID0gMDtcbiAgICAgICAgd2hpbGUgKGN1cnNvciA8IHRleHQubGVuZ3RoICYmIGNvdW50IDwgbWF4VGltZXMpIHtcbiAgICAgICAgICAgIGNvdW50Kys7XG5cbiAgICAgICAgICAgIGNvbnN0IGNoYXIgPSB0ZXh0W2N1cnNvcl07XG5cbiAgICAgICAgICAgIC8vIFNraXAgd2hpdGVzcGFjZSBhdCBzdGFydCBvZiBsaW5lXG4gICAgICAgICAgICBpZiAoIWxpbmUud2lkdGggJiYgd2hpdGVzcGFjZS50ZXN0KGNoYXIpKSB7XG4gICAgICAgICAgICAgICAgY3Vyc29yKys7XG4gICAgICAgICAgICAgICAgd29yZEN1cnNvciA9IGN1cnNvcjtcbiAgICAgICAgICAgICAgICB3b3JkV2lkdGggPSAwO1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBJZiBuZXdsaW5lIGNoYXIsIHNraXAgdG8gbmV4dCBsaW5lXG4gICAgICAgICAgICBpZiAobmV3bGluZS50ZXN0KGNoYXIpKSB7XG4gICAgICAgICAgICAgICAgY3Vyc29yKys7XG4gICAgICAgICAgICAgICAgbGluZSA9IG5ld0xpbmUoKTtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3QgZ2x5cGggPSBnbHlwaHNbY2hhcl0gfHwgZ2x5cGhzWycgJ107XG5cbiAgICAgICAgICAgIC8vIEZpbmQgYW55IGFwcGxpY2FibGUga2VybiBwYWlyc1xuICAgICAgICAgICAgaWYgKGxpbmUuZ2x5cGhzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHByZXZHbHlwaCA9IGxpbmUuZ2x5cGhzW2xpbmUuZ2x5cGhzLmxlbmd0aCAtIDFdWzBdO1xuICAgICAgICAgICAgICAgIGxldCBrZXJuID0gZ2V0S2VyblBhaXJPZmZzZXQoZ2x5cGguaWQsIHByZXZHbHlwaC5pZCkgKiBzY2FsZTtcbiAgICAgICAgICAgICAgICBsaW5lLndpZHRoICs9IGtlcm47XG4gICAgICAgICAgICAgICAgd29yZFdpZHRoICs9IGtlcm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIGFkZCBjaGFyIHRvIGxpbmVcbiAgICAgICAgICAgIGxpbmUuZ2x5cGhzLnB1c2goW2dseXBoLCBsaW5lLndpZHRoXSk7XG5cbiAgICAgICAgICAgIC8vIGNhbGN1bGF0ZSBhZHZhbmNlIGZvciBuZXh0IGdseXBoXG4gICAgICAgICAgICBsZXQgYWR2YW5jZSA9IDA7XG5cbiAgICAgICAgICAgIC8vIElmIHdoaXRlc3BhY2UsIHVwZGF0ZSBsb2NhdGlvbiBvZiBjdXJyZW50IHdvcmQgZm9yIGxpbmUgYnJlYWtzXG4gICAgICAgICAgICBpZiAod2hpdGVzcGFjZS50ZXN0KGNoYXIpKSB7XG4gICAgICAgICAgICAgICAgd29yZEN1cnNvciA9IGN1cnNvcjtcbiAgICAgICAgICAgICAgICB3b3JkV2lkdGggPSAwO1xuXG4gICAgICAgICAgICAgICAgLy8gQWRkIHdvcmRzcGFjaW5nXG4gICAgICAgICAgICAgICAgYWR2YW5jZSArPSB3b3JkU3BhY2luZyAqIHNpemU7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIEFkZCBsZXR0ZXJzcGFjaW5nXG4gICAgICAgICAgICAgICAgYWR2YW5jZSArPSBsZXR0ZXJTcGFjaW5nICogc2l6ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgYWR2YW5jZSArPSBnbHlwaC54YWR2YW5jZSAqIHNjYWxlO1xuXG4gICAgICAgICAgICBsaW5lLndpZHRoICs9IGFkdmFuY2U7XG4gICAgICAgICAgICB3b3JkV2lkdGggKz0gYWR2YW5jZTtcblxuICAgICAgICAgICAgLy8gSWYgd2lkdGggZGVmaW5lZFxuICAgICAgICAgICAgaWYgKGxpbmUud2lkdGggPiB3aWR0aCkge1xuICAgICAgICAgICAgICAgIC8vIElmIGNhbiBicmVhayB3b3JkcywgdW5kbyBsYXRlc3QgZ2x5cGggaWYgbGluZSBub3QgZW1wdHkgYW5kIGNyZWF0ZSBuZXcgbGluZVxuICAgICAgICAgICAgICAgIGlmICh3b3JkQnJlYWsgJiYgbGluZS5nbHlwaHMubGVuZ3RoID4gMSkge1xuICAgICAgICAgICAgICAgICAgICBsaW5lLndpZHRoIC09IGFkdmFuY2U7XG4gICAgICAgICAgICAgICAgICAgIGxpbmUuZ2x5cGhzLnBvcCgpO1xuICAgICAgICAgICAgICAgICAgICBsaW5lID0gbmV3TGluZSgpO1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBJZiBub3QgZmlyc3Qgd29yZCwgdW5kbyBjdXJyZW50IHdvcmQgYW5kIGN1cnNvciBhbmQgY3JlYXRlIG5ldyBsaW5lXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICghd29yZEJyZWFrICYmIHdvcmRXaWR0aCAhPT0gbGluZS53aWR0aCkge1xuICAgICAgICAgICAgICAgICAgICBsZXQgbnVtR2x5cGhzID0gY3Vyc29yIC0gd29yZEN1cnNvciArIDE7XG4gICAgICAgICAgICAgICAgICAgIGxpbmUuZ2x5cGhzLnNwbGljZSgtbnVtR2x5cGhzLCBudW1HbHlwaHMpO1xuICAgICAgICAgICAgICAgICAgICBjdXJzb3IgPSB3b3JkQ3Vyc29yO1xuICAgICAgICAgICAgICAgICAgICBsaW5lLndpZHRoIC09IHdvcmRXaWR0aDtcbiAgICAgICAgICAgICAgICAgICAgbGluZSA9IG5ld0xpbmUoKTtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjdXJzb3IrKztcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFJlbW92ZSBsYXN0IGxpbmUgaWYgZW1wdHlcbiAgICAgICAgaWYgKCFsaW5lLndpZHRoKSBsaW5lcy5wb3AoKTtcblxuICAgICAgICBwb3B1bGF0ZUJ1ZmZlcnMobGluZXMpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHBvcHVsYXRlQnVmZmVycyhsaW5lcykge1xuICAgICAgICBjb25zdCB0ZXhXID0gZm9udC5jb21tb24uc2NhbGVXO1xuICAgICAgICBjb25zdCB0ZXhIID0gZm9udC5jb21tb24uc2NhbGVIO1xuXG4gICAgICAgIC8vIEZvciBhbGwgZm9udHMgdGVzdGVkLCBhIGxpdHRsZSBvZmZzZXQgd2FzIG5lZWRlZCB0byBiZSByaWdodCBvbiB0aGUgYmFzZWxpbmUsIGhlbmNlIDAuMDcuXG4gICAgICAgIGxldCB5ID0gMC4wNyAqIHNpemU7XG4gICAgICAgIGxldCBqID0gMDtcblxuICAgICAgICBmb3IgKGxldCBsaW5lSW5kZXggPSAwOyBsaW5lSW5kZXggPCBsaW5lcy5sZW5ndGg7IGxpbmVJbmRleCsrKSB7XG4gICAgICAgICAgICBsZXQgbGluZSA9IGxpbmVzW2xpbmVJbmRleF07XG5cbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGluZS5nbHlwaHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBjb25zdCBnbHlwaCA9IGxpbmUuZ2x5cGhzW2ldWzBdO1xuICAgICAgICAgICAgICAgIGxldCB4ID0gbGluZS5nbHlwaHNbaV1bMV07XG5cbiAgICAgICAgICAgICAgICBpZiAoYWxpZ24gPT09ICdjZW50ZXInKSB7XG4gICAgICAgICAgICAgICAgICAgIHggLT0gbGluZS53aWR0aCAqIDAuNTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGFsaWduID09PSAncmlnaHQnKSB7XG4gICAgICAgICAgICAgICAgICAgIHggLT0gbGluZS53aWR0aDtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBJZiBzcGFjZSwgZG9uJ3QgYWRkIHRvIGdlb21ldHJ5XG4gICAgICAgICAgICAgICAgaWYgKHdoaXRlc3BhY2UudGVzdChnbHlwaC5jaGFyKSkgY29udGludWU7XG5cbiAgICAgICAgICAgICAgICAvLyBBcHBseSBjaGFyIHNwcml0ZSBvZmZzZXRzXG4gICAgICAgICAgICAgICAgeCArPSBnbHlwaC54b2Zmc2V0ICogc2NhbGU7XG4gICAgICAgICAgICAgICAgeSAtPSBnbHlwaC55b2Zmc2V0ICogc2NhbGU7XG5cbiAgICAgICAgICAgICAgICAvLyBlYWNoIGxldHRlciBpcyBhIHF1YWQuIGF4aXMgYm90dG9tIGxlZnRcbiAgICAgICAgICAgICAgICBsZXQgdyA9IGdseXBoLndpZHRoICogc2NhbGU7XG4gICAgICAgICAgICAgICAgbGV0IGggPSBnbHlwaC5oZWlnaHQgKiBzY2FsZTtcbiAgICAgICAgICAgICAgICBidWZmZXJzLnBvc2l0aW9uLnNldChbeCwgeSAtIGgsIDAsIHgsIHksIDAsIHggKyB3LCB5IC0gaCwgMCwgeCArIHcsIHksIDBdLCBqICogNCAqIDMpO1xuXG4gICAgICAgICAgICAgICAgbGV0IHUgPSBnbHlwaC54IC8gdGV4VztcbiAgICAgICAgICAgICAgICBsZXQgdXcgPSBnbHlwaC53aWR0aCAvIHRleFc7XG4gICAgICAgICAgICAgICAgbGV0IHYgPSAxLjAgLSBnbHlwaC55IC8gdGV4SDtcbiAgICAgICAgICAgICAgICBsZXQgdmggPSBnbHlwaC5oZWlnaHQgLyB0ZXhIO1xuICAgICAgICAgICAgICAgIGJ1ZmZlcnMudXYuc2V0KFt1LCB2IC0gdmgsIHUsIHYsIHUgKyB1dywgdiAtIHZoLCB1ICsgdXcsIHZdLCBqICogNCAqIDIpO1xuXG4gICAgICAgICAgICAgICAgLy8gUmVzZXQgY3Vyc29yIHRvIGJhc2VsaW5lXG4gICAgICAgICAgICAgICAgeSArPSBnbHlwaC55b2Zmc2V0ICogc2NhbGU7XG5cbiAgICAgICAgICAgICAgICBqKys7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHkgLT0gc2l6ZSAqIGxpbmVIZWlnaHQ7XG4gICAgICAgIH1cblxuICAgICAgICBfdGhpcy5idWZmZXJzID0gYnVmZmVycztcbiAgICAgICAgX3RoaXMubnVtTGluZXMgPSBsaW5lcy5sZW5ndGg7XG4gICAgICAgIF90aGlzLmhlaWdodCA9IF90aGlzLm51bUxpbmVzICogc2l6ZSAqIGxpbmVIZWlnaHQ7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0S2VyblBhaXJPZmZzZXQoaWQxLCBpZDIpIHtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBmb250Lmtlcm5pbmdzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBsZXQgayA9IGZvbnQua2VybmluZ3NbaV07XG4gICAgICAgICAgICBpZiAoay5maXJzdCA8IGlkMSkgY29udGludWU7XG4gICAgICAgICAgICBpZiAoay5zZWNvbmQgPCBpZDIpIGNvbnRpbnVlO1xuICAgICAgICAgICAgaWYgKGsuZmlyc3QgPiBpZDEpIHJldHVybiAwO1xuICAgICAgICAgICAgaWYgKGsuZmlyc3QgPT09IGlkMSAmJiBrLnNlY29uZCA+IGlkMikgcmV0dXJuIDA7XG4gICAgICAgICAgICByZXR1cm4gay5hbW91bnQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIDA7XG4gICAgfVxuXG4gICAgLy8gVXBkYXRlIGJ1ZmZlcnMgdG8gbGF5b3V0IHdpdGggbmV3IGxheW91dFxuICAgIHRoaXMucmVzaXplID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgICAgICAgKHsgd2lkdGggfSA9IG9wdGlvbnMpO1xuICAgICAgICBsYXlvdXQoKTtcbiAgICB9O1xuXG4gICAgLy8gQ29tcGxldGVseSBjaGFuZ2UgdGV4dCAobGlrZSBjcmVhdGluZyBuZXcgVGV4dClcbiAgICB0aGlzLnVwZGF0ZSA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gICAgICAgICh7IHRleHQgfSA9IG9wdGlvbnMpO1xuICAgICAgICBjcmVhdGVHZW9tZXRyeSgpO1xuICAgIH07XG59XG4iLCJpbXBvcnQgeyBUZXh0dXJlIH0gZnJvbSAnLi4vY29yZS9UZXh0dXJlLmpzJztcbmltcG9ydCB7IEtUWFRleHR1cmUgfSBmcm9tICcuL0tUWFRleHR1cmUuanMnO1xuXG4vLyBGb3IgY29tcHJlc3NlZCB0ZXh0dXJlcywgZ2VuZXJhdGUgdXNpbmcgaHR0cHM6Ly9naXRodWIuY29tL1RpbXZhblNjaGVycGVuemVlbC90ZXh0dXJlLWNvbXByZXNzb3JcblxubGV0IGNhY2hlID0ge307XG5jb25zdCBzdXBwb3J0ZWRFeHRlbnNpb25zID0gW107XG5cbmV4cG9ydCBjbGFzcyBUZXh0dXJlTG9hZGVyIHtcbiAgICBzdGF0aWMgbG9hZChcbiAgICAgICAgZ2wsXG4gICAgICAgIHtcbiAgICAgICAgICAgIHNyYywgLy8gc3RyaW5nIG9yIG9iamVjdCBvZiBleHRlbnNpb246c3JjIGtleS12YWx1ZXNcbiAgICAgICAgICAgIC8vIHtcbiAgICAgICAgICAgIC8vICAgICBwdnJ0YzogJy4uLmt0eCcsXG4gICAgICAgICAgICAvLyAgICAgczN0YzogJy4uLmt0eCcsXG4gICAgICAgICAgICAvLyAgICAgZXRjOiAnLi4ua3R4JyxcbiAgICAgICAgICAgIC8vICAgICBldGMxOiAnLi4ua3R4JyxcbiAgICAgICAgICAgIC8vICAgICBhc3RjOiAnLi4ua3R4JyxcbiAgICAgICAgICAgIC8vICAgICB3ZWJwOiAnLi4ud2VicCcsXG4gICAgICAgICAgICAvLyAgICAganBnOiAnLi4uanBnJyxcbiAgICAgICAgICAgIC8vICAgICBwbmc6ICcuLi5wbmcnLFxuICAgICAgICAgICAgLy8gfVxuXG4gICAgICAgICAgICAvLyBPbmx5IHByb3BzIHJlbGV2YW50IHRvIEtUWFRleHR1cmVcbiAgICAgICAgICAgIHdyYXBTID0gZ2wuQ0xBTVBfVE9fRURHRSxcbiAgICAgICAgICAgIHdyYXBUID0gZ2wuQ0xBTVBfVE9fRURHRSxcbiAgICAgICAgICAgIGFuaXNvdHJvcHkgPSAwLFxuXG4gICAgICAgICAgICAvLyBGb3IgcmVndWxhciBpbWFnZXNcbiAgICAgICAgICAgIGZvcm1hdCA9IGdsLlJHQkEsXG4gICAgICAgICAgICBpbnRlcm5hbEZvcm1hdCA9IGZvcm1hdCxcbiAgICAgICAgICAgIGdlbmVyYXRlTWlwbWFwcyA9IHRydWUsXG4gICAgICAgICAgICBtaW5GaWx0ZXIgPSBnZW5lcmF0ZU1pcG1hcHMgPyBnbC5ORUFSRVNUX01JUE1BUF9MSU5FQVIgOiBnbC5MSU5FQVIsXG4gICAgICAgICAgICBtYWdGaWx0ZXIgPSBnbC5MSU5FQVIsXG4gICAgICAgICAgICBwcmVtdWx0aXBseUFscGhhID0gZmFsc2UsXG4gICAgICAgICAgICB1bnBhY2tBbGlnbm1lbnQgPSA0LFxuICAgICAgICAgICAgZmxpcFkgPSB0cnVlLFxuICAgICAgICB9ID0ge31cbiAgICApIHtcbiAgICAgICAgY29uc3Qgc3VwcG9ydCA9IHRoaXMuZ2V0U3VwcG9ydGVkRXh0ZW5zaW9ucyhnbCk7XG4gICAgICAgIGxldCBleHQgPSAnbm9uZSc7XG5cbiAgICAgICAgLy8gSWYgc3JjIGlzIHN0cmluZywgZGV0ZXJtaW5lIHdoaWNoIGZvcm1hdCBmcm9tIHRoZSBleHRlbnNpb25cbiAgICAgICAgaWYgKHR5cGVvZiBzcmMgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICBleHQgPSBzcmMuc3BsaXQoJy4nKS5wb3AoKS5zcGxpdCgnPycpWzBdLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBJZiBzcmMgaXMgb2JqZWN0LCB1c2Ugc3VwcG9ydGVkIGV4dGVuc2lvbnMgYW5kIHByb3ZpZGVkIGxpc3QgdG8gY2hvb3NlIGJlc3Qgb3B0aW9uXG4gICAgICAgIC8vIEdldCBmaXJzdCBzdXBwb3J0ZWQgbWF0Y2gsIHNvIHB1dCBpbiBvcmRlciBvZiBwcmVmZXJlbmNlXG4gICAgICAgIGlmICh0eXBlb2Ygc3JjID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgZm9yIChjb25zdCBwcm9wIGluIHNyYykge1xuICAgICAgICAgICAgICAgIGlmIChzdXBwb3J0LmluY2x1ZGVzKHByb3AudG9Mb3dlckNhc2UoKSkpIHtcbiAgICAgICAgICAgICAgICAgICAgZXh0ID0gcHJvcC50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAgICAgICAgICAgICBzcmMgPSBzcmNbcHJvcF07XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFN0cmluZ2lmeSBwcm9wc1xuICAgICAgICBjb25zdCBjYWNoZUlEID1cbiAgICAgICAgICAgIHNyYyArXG4gICAgICAgICAgICB3cmFwUyArXG4gICAgICAgICAgICB3cmFwVCArXG4gICAgICAgICAgICBhbmlzb3Ryb3B5ICtcbiAgICAgICAgICAgIGZvcm1hdCArXG4gICAgICAgICAgICBpbnRlcm5hbEZvcm1hdCArXG4gICAgICAgICAgICBnZW5lcmF0ZU1pcG1hcHMgK1xuICAgICAgICAgICAgbWluRmlsdGVyICtcbiAgICAgICAgICAgIG1hZ0ZpbHRlciArXG4gICAgICAgICAgICBwcmVtdWx0aXBseUFscGhhICtcbiAgICAgICAgICAgIHVucGFja0FsaWdubWVudCArXG4gICAgICAgICAgICBmbGlwWSArXG4gICAgICAgICAgICBnbC5yZW5kZXJlci5pZDtcblxuICAgICAgICAvLyBDaGVjayBjYWNoZSBmb3IgZXhpc3RpbmcgdGV4dHVyZVxuICAgICAgICBpZiAoY2FjaGVbY2FjaGVJRF0pIHJldHVybiBjYWNoZVtjYWNoZUlEXTtcblxuICAgICAgICBsZXQgdGV4dHVyZTtcbiAgICAgICAgc3dpdGNoIChleHQpIHtcbiAgICAgICAgICAgIGNhc2UgJ2t0eCc6XG4gICAgICAgICAgICBjYXNlICdwdnJ0Yyc6XG4gICAgICAgICAgICBjYXNlICdzM3RjJzpcbiAgICAgICAgICAgIGNhc2UgJ2V0Yyc6XG4gICAgICAgICAgICBjYXNlICdldGMxJzpcbiAgICAgICAgICAgIGNhc2UgJ2FzdGMnOlxuICAgICAgICAgICAgICAgIC8vIExvYWQgY29tcHJlc3NlZCB0ZXh0dXJlIHVzaW5nIEtUWCBmb3JtYXRcbiAgICAgICAgICAgICAgICB0ZXh0dXJlID0gbmV3IEtUWFRleHR1cmUoZ2wsIHtcbiAgICAgICAgICAgICAgICAgICAgc3JjLFxuICAgICAgICAgICAgICAgICAgICB3cmFwUyxcbiAgICAgICAgICAgICAgICAgICAgd3JhcFQsXG4gICAgICAgICAgICAgICAgICAgIGFuaXNvdHJvcHksXG4gICAgICAgICAgICAgICAgICAgIG1pbkZpbHRlcixcbiAgICAgICAgICAgICAgICAgICAgbWFnRmlsdGVyLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHRleHR1cmUubG9hZGVkID0gdGhpcy5sb2FkS1RYKHNyYywgdGV4dHVyZSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICd3ZWJwJzpcbiAgICAgICAgICAgIGNhc2UgJ2pwZyc6XG4gICAgICAgICAgICBjYXNlICdqcGVnJzpcbiAgICAgICAgICAgIGNhc2UgJ3BuZyc6XG4gICAgICAgICAgICAgICAgdGV4dHVyZSA9IG5ldyBUZXh0dXJlKGdsLCB7XG4gICAgICAgICAgICAgICAgICAgIHdyYXBTLFxuICAgICAgICAgICAgICAgICAgICB3cmFwVCxcbiAgICAgICAgICAgICAgICAgICAgYW5pc290cm9weSxcbiAgICAgICAgICAgICAgICAgICAgZm9ybWF0LFxuICAgICAgICAgICAgICAgICAgICBpbnRlcm5hbEZvcm1hdCxcbiAgICAgICAgICAgICAgICAgICAgZ2VuZXJhdGVNaXBtYXBzLFxuICAgICAgICAgICAgICAgICAgICBtaW5GaWx0ZXIsXG4gICAgICAgICAgICAgICAgICAgIG1hZ0ZpbHRlcixcbiAgICAgICAgICAgICAgICAgICAgcHJlbXVsdGlwbHlBbHBoYSxcbiAgICAgICAgICAgICAgICAgICAgdW5wYWNrQWxpZ25tZW50LFxuICAgICAgICAgICAgICAgICAgICBmbGlwWSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB0ZXh0dXJlLmxvYWRlZCA9IHRoaXMubG9hZEltYWdlKGdsLCBzcmMsIHRleHR1cmUpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ05vIHN1cHBvcnRlZCBmb3JtYXQgc3VwcGxpZWQnKTtcbiAgICAgICAgICAgICAgICB0ZXh0dXJlID0gbmV3IFRleHR1cmUoZ2wpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGV4dHVyZS5leHQgPSBleHQ7XG4gICAgICAgIGNhY2hlW2NhY2hlSURdID0gdGV4dHVyZTtcbiAgICAgICAgcmV0dXJuIHRleHR1cmU7XG4gICAgfVxuXG4gICAgc3RhdGljIGdldFN1cHBvcnRlZEV4dGVuc2lvbnMoZ2wpIHtcbiAgICAgICAgaWYgKHN1cHBvcnRlZEV4dGVuc2lvbnMubGVuZ3RoKSByZXR1cm4gc3VwcG9ydGVkRXh0ZW5zaW9ucztcblxuICAgICAgICBjb25zdCBleHRlbnNpb25zID0ge1xuICAgICAgICAgICAgcHZydGM6IGdsLnJlbmRlcmVyLmdldEV4dGVuc2lvbignV0VCR0xfY29tcHJlc3NlZF90ZXh0dXJlX3B2cnRjJykgfHwgZ2wucmVuZGVyZXIuZ2V0RXh0ZW5zaW9uKCdXRUJLSVRfV0VCR0xfY29tcHJlc3NlZF90ZXh0dXJlX3B2cnRjJyksXG4gICAgICAgICAgICBzM3RjOlxuICAgICAgICAgICAgICAgIGdsLnJlbmRlcmVyLmdldEV4dGVuc2lvbignV0VCR0xfY29tcHJlc3NlZF90ZXh0dXJlX3MzdGMnKSB8fFxuICAgICAgICAgICAgICAgIGdsLnJlbmRlcmVyLmdldEV4dGVuc2lvbignTU9aX1dFQkdMX2NvbXByZXNzZWRfdGV4dHVyZV9zM3RjJykgfHxcbiAgICAgICAgICAgICAgICBnbC5yZW5kZXJlci5nZXRFeHRlbnNpb24oJ1dFQktJVF9XRUJHTF9jb21wcmVzc2VkX3RleHR1cmVfczN0YycpLFxuICAgICAgICAgICAgZXRjOiBnbC5yZW5kZXJlci5nZXRFeHRlbnNpb24oJ1dFQkdMX2NvbXByZXNzZWRfdGV4dHVyZV9ldGMnKSxcbiAgICAgICAgICAgIGV0YzE6IGdsLnJlbmRlcmVyLmdldEV4dGVuc2lvbignV0VCR0xfY29tcHJlc3NlZF90ZXh0dXJlX2V0YzEnKSxcbiAgICAgICAgICAgIGFzdGM6IGdsLnJlbmRlcmVyLmdldEV4dGVuc2lvbignV0VCR0xfY29tcHJlc3NlZF90ZXh0dXJlX2FzdGMnKSxcbiAgICAgICAgfTtcblxuICAgICAgICBmb3IgKGNvbnN0IGV4dCBpbiBleHRlbnNpb25zKSBpZiAoZXh0ZW5zaW9uc1tleHRdKSBzdXBwb3J0ZWRFeHRlbnNpb25zLnB1c2goZXh0KTtcblxuICAgICAgICAvLyBDaGVjayBmb3IgV2ViUCBzdXBwb3J0XG4gICAgICAgIGlmIChkZXRlY3RXZWJQKSBzdXBwb3J0ZWRFeHRlbnNpb25zLnB1c2goJ3dlYnAnKTtcblxuICAgICAgICAvLyBGb3JtYXRzIHN1cHBvcnRlZCBieSBhbGxcbiAgICAgICAgc3VwcG9ydGVkRXh0ZW5zaW9ucy5wdXNoKCdwbmcnLCAnanBnJyk7XG5cbiAgICAgICAgcmV0dXJuIHN1cHBvcnRlZEV4dGVuc2lvbnM7XG4gICAgfVxuXG4gICAgc3RhdGljIGxvYWRLVFgoc3JjLCB0ZXh0dXJlKSB7XG4gICAgICAgIHJldHVybiBmZXRjaChzcmMpXG4gICAgICAgICAgICAudGhlbigocmVzKSA9PiByZXMuYXJyYXlCdWZmZXIoKSlcbiAgICAgICAgICAgIC50aGVuKChidWZmZXIpID0+IHRleHR1cmUucGFyc2VCdWZmZXIoYnVmZmVyKSk7XG4gICAgfVxuXG4gICAgc3RhdGljIGxvYWRJbWFnZShnbCwgc3JjLCB0ZXh0dXJlKSB7XG4gICAgICAgIHJldHVybiBkZWNvZGVJbWFnZShzcmMpLnRoZW4oKGltZ0JtcCkgPT4ge1xuICAgICAgICAgICAgLy8gQ2F0Y2ggbm9uIFBPVCB0ZXh0dXJlcyBhbmQgdXBkYXRlIHBhcmFtcyB0byBhdm9pZCBlcnJvcnNcbiAgICAgICAgICAgIGlmICghcG93ZXJPZlR3byhpbWdCbXAud2lkdGgpIHx8ICFwb3dlck9mVHdvKGltZ0JtcC5oZWlnaHQpKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRleHR1cmUuZ2VuZXJhdGVNaXBtYXBzKSB0ZXh0dXJlLmdlbmVyYXRlTWlwbWFwcyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGlmICh0ZXh0dXJlLm1pbkZpbHRlciA9PT0gZ2wuTkVBUkVTVF9NSVBNQVBfTElORUFSKSB0ZXh0dXJlLm1pbkZpbHRlciA9IGdsLkxJTkVBUjtcbiAgICAgICAgICAgICAgICBpZiAodGV4dHVyZS53cmFwUyA9PT0gZ2wuUkVQRUFUKSB0ZXh0dXJlLndyYXBTID0gdGV4dHVyZS53cmFwVCA9IGdsLkNMQU1QX1RPX0VER0U7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRleHR1cmUuaW1hZ2UgPSBpbWdCbXA7XG5cbiAgICAgICAgICAgIC8vIEZvciBjcmVhdGVJbWFnZUJpdG1hcCwgY2xvc2Ugb25jZSB1cGxvYWRlZFxuICAgICAgICAgICAgdGV4dHVyZS5vblVwZGF0ZSA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoaW1nQm1wLmNsb3NlKSBpbWdCbXAuY2xvc2UoKTtcbiAgICAgICAgICAgICAgICB0ZXh0dXJlLm9uVXBkYXRlID0gbnVsbDtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHJldHVybiBpbWdCbXA7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHN0YXRpYyBjbGVhckNhY2hlKCkge1xuICAgICAgICBjYWNoZSA9IHt9O1xuICAgIH1cbn1cblxuZnVuY3Rpb24gZGV0ZWN0V2ViUCgpIHtcbiAgICByZXR1cm4gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJykudG9EYXRhVVJMKCdpbWFnZS93ZWJwJykuaW5kZXhPZignZGF0YTppbWFnZS93ZWJwJykgPT0gMDtcbn1cblxuZnVuY3Rpb24gcG93ZXJPZlR3byh2YWx1ZSkge1xuICAgIHJldHVybiBNYXRoLmxvZzIodmFsdWUpICUgMSA9PT0gMDtcbn1cblxuZnVuY3Rpb24gZGVjb2RlSW1hZ2Uoc3JjKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgIGNvbnN0IGltZyA9IG5ldyBJbWFnZSgpO1xuICAgICAgICBpbWcuY3Jvc3NPcmlnaW4gPSAnJztcbiAgICAgICAgaW1nLnNyYyA9IHNyYztcblxuICAgICAgICAvLyBPbmx5IGNocm9tZSdzIGltcGxlbWVudGF0aW9uIG9mIGNyZWF0ZUltYWdlQml0bWFwIGlzIGZ1bGx5IHN1cHBvcnRlZFxuICAgICAgICBjb25zdCBpc0Nocm9tZSA9IG5hdmlnYXRvci51c2VyQWdlbnQudG9Mb3dlckNhc2UoKS5pbmNsdWRlcygnY2hyb21lJyk7XG4gICAgICAgIGlmICghIXdpbmRvdy5jcmVhdGVJbWFnZUJpdG1hcCAmJiBpc0Nocm9tZSkge1xuICAgICAgICAgICAgaW1nLm9ubG9hZCA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICBjcmVhdGVJbWFnZUJpdG1hcChpbWcsIHtcbiAgICAgICAgICAgICAgICAgICAgaW1hZ2VPcmllbnRhdGlvbjogJ2ZsaXBZJyxcbiAgICAgICAgICAgICAgICAgICAgcHJlbXVsdGlwbHlBbHBoYTogJ25vbmUnLFxuICAgICAgICAgICAgICAgIH0pLnRoZW4oKGltZ0JtcCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKGltZ0JtcCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaW1nLm9ubG9hZCA9ICgpID0+IHJlc29sdmUoaW1nKTtcbiAgICAgICAgfVxuICAgIH0pO1xufVxuIiwiLy8gaHR0cHM6Ly9naXRodWIuY29tL21yZG9vYi90aHJlZS5qcy9ibG9iL21hc3Rlci9zcmMvZ2VvbWV0cmllcy9Ub3J1c0dlb21ldHJ5LmpzXG5cbmltcG9ydCB7IEdlb21ldHJ5IH0gZnJvbSAnLi4vY29yZS9HZW9tZXRyeS5qcyc7XG5pbXBvcnQgeyBWZWMzIH0gZnJvbSAnLi4vbWF0aC9WZWMzLmpzJztcblxuZXhwb3J0IGNsYXNzIFRvcnVzIGV4dGVuZHMgR2VvbWV0cnkge1xuICAgIGNvbnN0cnVjdG9yKGdsLCB7IHJhZGl1cyA9IDAuNSwgdHViZSA9IDAuMiwgcmFkaWFsU2VnbWVudHMgPSA4LCB0dWJ1bGFyU2VnbWVudHMgPSA2LCBhcmMgPSBNYXRoLlBJICogMiwgYXR0cmlidXRlcyA9IHt9IH0gPSB7fSkge1xuICAgICAgICBjb25zdCBudW0gPSAocmFkaWFsU2VnbWVudHMgKyAxKSAqICh0dWJ1bGFyU2VnbWVudHMgKyAxKTtcbiAgICAgICAgY29uc3QgbnVtSW5kaWNlcyA9IHJhZGlhbFNlZ21lbnRzICogdHVidWxhclNlZ21lbnRzICogNjtcblxuICAgICAgICBjb25zdCB2ZXJ0aWNlcyA9IG5ldyBGbG9hdDMyQXJyYXkobnVtICogMyk7XG4gICAgICAgIGNvbnN0IG5vcm1hbHMgPSBuZXcgRmxvYXQzMkFycmF5KG51bSAqIDMpO1xuICAgICAgICBjb25zdCB1dnMgPSBuZXcgRmxvYXQzMkFycmF5KG51bSAqIDIpO1xuICAgICAgICBjb25zdCBpbmRpY2VzID0gbnVtID4gNjU1MzYgPyBuZXcgVWludDMyQXJyYXkobnVtSW5kaWNlcykgOiBuZXcgVWludDE2QXJyYXkobnVtSW5kaWNlcyk7XG5cbiAgICAgICAgY29uc3QgY2VudGVyID0gbmV3IFZlYzMoKTtcbiAgICAgICAgY29uc3QgdmVydGV4ID0gbmV3IFZlYzMoKTtcbiAgICAgICAgY29uc3Qgbm9ybWFsID0gbmV3IFZlYzMoKTtcblxuICAgICAgICAvLyBnZW5lcmF0ZSB2ZXJ0aWNlcywgbm9ybWFscyBhbmQgdXZzXG4gICAgICAgIGxldCBpZHggPSAwO1xuICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8PSByYWRpYWxTZWdtZW50czsgaisrKSB7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8PSB0dWJ1bGFyU2VnbWVudHM7IGkrKywgaWR4KyspIHtcbiAgICAgICAgICAgICAgICBjb25zdCB1ID0gKGkgLyB0dWJ1bGFyU2VnbWVudHMpICogYXJjO1xuICAgICAgICAgICAgICAgIGNvbnN0IHYgPSAoaiAvIHJhZGlhbFNlZ21lbnRzKSAqIE1hdGguUEkgKiAyO1xuXG4gICAgICAgICAgICAgICAgLy8gdmVydGV4XG4gICAgICAgICAgICAgICAgdmVydGV4LnggPSAocmFkaXVzICsgdHViZSAqIE1hdGguY29zKHYpKSAqIE1hdGguY29zKHUpO1xuICAgICAgICAgICAgICAgIHZlcnRleC55ID0gKHJhZGl1cyArIHR1YmUgKiBNYXRoLmNvcyh2KSkgKiBNYXRoLnNpbih1KTtcbiAgICAgICAgICAgICAgICB2ZXJ0ZXgueiA9IHR1YmUgKiBNYXRoLnNpbih2KTtcblxuICAgICAgICAgICAgICAgIHZlcnRpY2VzLnNldChbdmVydGV4LngsIHZlcnRleC55LCB2ZXJ0ZXguel0sIGlkeCAqIDMpO1xuXG4gICAgICAgICAgICAgICAgLy8gbm9ybWFsXG4gICAgICAgICAgICAgICAgY2VudGVyLnggPSByYWRpdXMgKiBNYXRoLmNvcyh1KTtcbiAgICAgICAgICAgICAgICBjZW50ZXIueSA9IHJhZGl1cyAqIE1hdGguc2luKHUpO1xuICAgICAgICAgICAgICAgIG5vcm1hbC5zdWIodmVydGV4LCBjZW50ZXIpLm5vcm1hbGl6ZSgpO1xuXG4gICAgICAgICAgICAgICAgbm9ybWFscy5zZXQoW25vcm1hbC54LCBub3JtYWwueSwgbm9ybWFsLnpdLCBpZHggKiAzKTtcblxuICAgICAgICAgICAgICAgIC8vIHV2XG4gICAgICAgICAgICAgICAgdXZzLnNldChbaSAvIHR1YnVsYXJTZWdtZW50cywgaiAvIHJhZGlhbFNlZ21lbnRzXSwgaWR4ICogMik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBnZW5lcmF0ZSBpbmRpY2VzXG4gICAgICAgIGlkeCA9IDA7XG4gICAgICAgIGZvciAobGV0IGogPSAxOyBqIDw9IHJhZGlhbFNlZ21lbnRzOyBqKyspIHtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAxOyBpIDw9IHR1YnVsYXJTZWdtZW50czsgaSsrLCBpZHgrKykge1xuICAgICAgICAgICAgICAgIC8vIGluZGljZXNcbiAgICAgICAgICAgICAgICBjb25zdCBhID0gKHR1YnVsYXJTZWdtZW50cyArIDEpICogaiArIGkgLSAxO1xuICAgICAgICAgICAgICAgIGNvbnN0IGIgPSAodHVidWxhclNlZ21lbnRzICsgMSkgKiAoaiAtIDEpICsgaSAtIDE7XG4gICAgICAgICAgICAgICAgY29uc3QgYyA9ICh0dWJ1bGFyU2VnbWVudHMgKyAxKSAqIChqIC0gMSkgKyBpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGQgPSAodHVidWxhclNlZ21lbnRzICsgMSkgKiBqICsgaTtcblxuICAgICAgICAgICAgICAgIC8vIGZhY2VzXG4gICAgICAgICAgICAgICAgaW5kaWNlcy5zZXQoW2EsIGIsIGQsIGIsIGMsIGRdLCBpZHggKiA2KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIE9iamVjdC5hc3NpZ24oYXR0cmlidXRlcywge1xuICAgICAgICAgICAgcG9zaXRpb246IHsgc2l6ZTogMywgZGF0YTogdmVydGljZXMgfSxcbiAgICAgICAgICAgIG5vcm1hbDogeyBzaXplOiAzLCBkYXRhOiBub3JtYWxzIH0sXG4gICAgICAgICAgICB1djogeyBzaXplOiAyLCBkYXRhOiB1dnMgfSxcbiAgICAgICAgICAgIGluZGV4OiB7IGRhdGE6IGluZGljZXMgfSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgc3VwZXIoZ2wsIGF0dHJpYnV0ZXMpO1xuICAgIH1cbn1cbiIsImltcG9ydCB7IEdlb21ldHJ5IH0gZnJvbSAnLi4vY29yZS9HZW9tZXRyeS5qcyc7XG5cbmV4cG9ydCBjbGFzcyBUcmlhbmdsZSBleHRlbmRzIEdlb21ldHJ5IHtcbiAgICBjb25zdHJ1Y3RvcihnbCwgeyBhdHRyaWJ1dGVzID0ge30gfSA9IHt9KSB7XG4gICAgICAgIE9iamVjdC5hc3NpZ24oYXR0cmlidXRlcywge1xuICAgICAgICAgICAgcG9zaXRpb246IHsgc2l6ZTogMiwgZGF0YTogbmV3IEZsb2F0MzJBcnJheShbLTEsIC0xLCAzLCAtMSwgLTEsIDNdKSB9LFxuICAgICAgICAgICAgdXY6IHsgc2l6ZTogMiwgZGF0YTogbmV3IEZsb2F0MzJBcnJheShbMCwgMCwgMiwgMCwgMCwgMl0pIH0sXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHN1cGVyKGdsLCBhdHRyaWJ1dGVzKTtcbiAgICB9XG59XG4iLCJpbXBvcnQgKiBhcyBDb2xvckZ1bmMgZnJvbSAnLi9mdW5jdGlvbnMvQ29sb3JGdW5jLmpzJztcblxuLy8gQ29sb3Igc3RvcmVkIGFzIGFuIGFycmF5IG9mIFJHQiBkZWNpbWFsIHZhbHVlcyAoYmV0d2VlbiAwID4gMSlcbi8vIENvbnN0cnVjdG9yIGFuZCBzZXQgbWV0aG9kIGFjY2VwdCBmb2xsb3dpbmcgZm9ybWF0czpcbi8vIG5ldyBDb2xvcigpIC0gRW1wdHkgKGRlZmF1bHRzIHRvIGJsYWNrKVxuLy8gbmV3IENvbG9yKFswLjIsIDAuNCwgMS4wXSkgLSBEZWNpbWFsIEFycmF5IChvciBhbm90aGVyIENvbG9yIGluc3RhbmNlKVxuLy8gbmV3IENvbG9yKDAuNywgMC4wLCAwLjEpIC0gRGVjaW1hbCBSR0IgdmFsdWVzXG4vLyBuZXcgQ29sb3IoJyNmZjAwMDAnKSAtIEhleCBzdHJpbmdcbi8vIG5ldyBDb2xvcignI2NjYycpIC0gU2hvcnQtaGFuZCBIZXggc3RyaW5nXG4vLyBuZXcgQ29sb3IoMHg0ZjI3ZTgpIC0gTnVtYmVyXG4vLyBuZXcgQ29sb3IoJ3JlZCcpIC0gQ29sb3IgbmFtZSBzdHJpbmcgKHNob3J0IGxpc3QgaW4gQ29sb3JGdW5jLmpzKVxuXG5leHBvcnQgY2xhc3MgQ29sb3IgZXh0ZW5kcyBBcnJheSB7XG4gICAgY29uc3RydWN0b3IoY29sb3IpIHtcbiAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkoY29sb3IpKSByZXR1cm4gc3VwZXIoLi4uY29sb3IpO1xuICAgICAgICByZXR1cm4gc3VwZXIoLi4uQ29sb3JGdW5jLnBhcnNlQ29sb3IoLi4uYXJndW1lbnRzKSk7XG4gICAgfVxuXG4gICAgZ2V0IHIoKSB7XG4gICAgICAgIHJldHVybiB0aGlzWzBdO1xuICAgIH1cblxuICAgIGdldCBnKCkge1xuICAgICAgICByZXR1cm4gdGhpc1sxXTtcbiAgICB9XG5cbiAgICBnZXQgYigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXNbMl07XG4gICAgfVxuXG4gICAgc2V0IHIodikge1xuICAgICAgICB0aGlzWzBdID0gdjtcbiAgICB9XG5cbiAgICBzZXQgZyh2KSB7XG4gICAgICAgIHRoaXNbMV0gPSB2O1xuICAgIH1cblxuICAgIHNldCBiKHYpIHtcbiAgICAgICAgdGhpc1syXSA9IHY7XG4gICAgfVxuXG4gICAgc2V0KGNvbG9yKSB7XG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KGNvbG9yKSkgcmV0dXJuIHRoaXMuY29weShjb2xvcik7XG4gICAgICAgIHJldHVybiB0aGlzLmNvcHkoQ29sb3JGdW5jLnBhcnNlQ29sb3IoLi4uYXJndW1lbnRzKSk7XG4gICAgfVxuXG4gICAgY29weSh2KSB7XG4gICAgICAgIHRoaXNbMF0gPSB2WzBdO1xuICAgICAgICB0aGlzWzFdID0gdlsxXTtcbiAgICAgICAgdGhpc1syXSA9IHZbMl07XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbn1cbiIsImltcG9ydCAqIGFzIEV1bGVyRnVuYyBmcm9tICcuL2Z1bmN0aW9ucy9FdWxlckZ1bmMuanMnO1xuaW1wb3J0IHsgTWF0NCB9IGZyb20gJy4vTWF0NC5qcyc7XG5cbmNvbnN0IHRtcE1hdDQgPSBuZXcgTWF0NCgpO1xuXG5leHBvcnQgY2xhc3MgRXVsZXIgZXh0ZW5kcyBBcnJheSB7XG4gICAgY29uc3RydWN0b3IoeCA9IDAsIHkgPSB4LCB6ID0geCwgb3JkZXIgPSAnWVhaJykge1xuICAgICAgICBzdXBlcih4LCB5LCB6KTtcbiAgICAgICAgdGhpcy5vcmRlciA9IG9yZGVyO1xuICAgICAgICB0aGlzLm9uQ2hhbmdlID0gKCkgPT4ge307XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGdldCB4KCkge1xuICAgICAgICByZXR1cm4gdGhpc1swXTtcbiAgICB9XG5cbiAgICBnZXQgeSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXNbMV07XG4gICAgfVxuXG4gICAgZ2V0IHooKSB7XG4gICAgICAgIHJldHVybiB0aGlzWzJdO1xuICAgIH1cblxuICAgIHNldCB4KHYpIHtcbiAgICAgICAgdGhpc1swXSA9IHY7XG4gICAgICAgIHRoaXMub25DaGFuZ2UoKTtcbiAgICB9XG5cbiAgICBzZXQgeSh2KSB7XG4gICAgICAgIHRoaXNbMV0gPSB2O1xuICAgICAgICB0aGlzLm9uQ2hhbmdlKCk7XG4gICAgfVxuXG4gICAgc2V0IHoodikge1xuICAgICAgICB0aGlzWzJdID0gdjtcbiAgICAgICAgdGhpcy5vbkNoYW5nZSgpO1xuICAgIH1cblxuICAgIHNldCh4LCB5ID0geCwgeiA9IHgpIHtcbiAgICAgICAgaWYgKHgubGVuZ3RoKSByZXR1cm4gdGhpcy5jb3B5KHgpO1xuICAgICAgICB0aGlzWzBdID0geDtcbiAgICAgICAgdGhpc1sxXSA9IHk7XG4gICAgICAgIHRoaXNbMl0gPSB6O1xuICAgICAgICB0aGlzLm9uQ2hhbmdlKCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGNvcHkodikge1xuICAgICAgICB0aGlzWzBdID0gdlswXTtcbiAgICAgICAgdGhpc1sxXSA9IHZbMV07XG4gICAgICAgIHRoaXNbMl0gPSB2WzJdO1xuICAgICAgICB0aGlzLm9uQ2hhbmdlKCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHJlb3JkZXIob3JkZXIpIHtcbiAgICAgICAgdGhpcy5vcmRlciA9IG9yZGVyO1xuICAgICAgICB0aGlzLm9uQ2hhbmdlKCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGZyb21Sb3RhdGlvbk1hdHJpeChtLCBvcmRlciA9IHRoaXMub3JkZXIpIHtcbiAgICAgICAgRXVsZXJGdW5jLmZyb21Sb3RhdGlvbk1hdHJpeCh0aGlzLCBtLCBvcmRlcik7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGZyb21RdWF0ZXJuaW9uKHEsIG9yZGVyID0gdGhpcy5vcmRlcikge1xuICAgICAgICB0bXBNYXQ0LmZyb21RdWF0ZXJuaW9uKHEpO1xuICAgICAgICByZXR1cm4gdGhpcy5mcm9tUm90YXRpb25NYXRyaXgodG1wTWF0NCwgb3JkZXIpO1xuICAgIH1cblxuICAgIHRvQXJyYXkoYSA9IFtdLCBvID0gMCkge1xuICAgICAgICBhW29dID0gdGhpc1swXTtcbiAgICAgICAgYVtvICsgMV0gPSB0aGlzWzFdO1xuICAgICAgICBhW28gKyAyXSA9IHRoaXNbMl07XG4gICAgICAgIHJldHVybiBhO1xuICAgIH1cbn1cbiIsImltcG9ydCAqIGFzIE1hdDNGdW5jIGZyb20gJy4vZnVuY3Rpb25zL01hdDNGdW5jLmpzJztcblxuZXhwb3J0IGNsYXNzIE1hdDMgZXh0ZW5kcyBBcnJheSB7XG4gICAgY29uc3RydWN0b3IobTAwID0gMSwgbTAxID0gMCwgbTAyID0gMCwgbTEwID0gMCwgbTExID0gMSwgbTEyID0gMCwgbTIwID0gMCwgbTIxID0gMCwgbTIyID0gMSkge1xuICAgICAgICBzdXBlcihtMDAsIG0wMSwgbTAyLCBtMTAsIG0xMSwgbTEyLCBtMjAsIG0yMSwgbTIyKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgc2V0KG0wMCwgbTAxLCBtMDIsIG0xMCwgbTExLCBtMTIsIG0yMCwgbTIxLCBtMjIpIHtcbiAgICAgICAgaWYgKG0wMC5sZW5ndGgpIHJldHVybiB0aGlzLmNvcHkobTAwKTtcbiAgICAgICAgTWF0M0Z1bmMuc2V0KHRoaXMsIG0wMCwgbTAxLCBtMDIsIG0xMCwgbTExLCBtMTIsIG0yMCwgbTIxLCBtMjIpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICB0cmFuc2xhdGUodiwgbSA9IHRoaXMpIHtcbiAgICAgICAgTWF0M0Z1bmMudHJhbnNsYXRlKHRoaXMsIG0sIHYpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICByb3RhdGUodiwgbSA9IHRoaXMpIHtcbiAgICAgICAgTWF0M0Z1bmMucm90YXRlKHRoaXMsIG0sIHYpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBzY2FsZSh2LCBtID0gdGhpcykge1xuICAgICAgICBNYXQzRnVuYy5zY2FsZSh0aGlzLCBtLCB2KTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgbXVsdGlwbHkobWEsIG1iKSB7XG4gICAgICAgIGlmIChtYikge1xuICAgICAgICAgICAgTWF0M0Z1bmMubXVsdGlwbHkodGhpcywgbWEsIG1iKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIE1hdDNGdW5jLm11bHRpcGx5KHRoaXMsIHRoaXMsIG1hKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBpZGVudGl0eSgpIHtcbiAgICAgICAgTWF0M0Z1bmMuaWRlbnRpdHkodGhpcyk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGNvcHkobSkge1xuICAgICAgICBNYXQzRnVuYy5jb3B5KHRoaXMsIG0pO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBmcm9tTWF0cml4NChtKSB7XG4gICAgICAgIE1hdDNGdW5jLmZyb21NYXQ0KHRoaXMsIG0pO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBmcm9tUXVhdGVybmlvbihxKSB7XG4gICAgICAgIE1hdDNGdW5jLmZyb21RdWF0KHRoaXMsIHEpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBmcm9tQmFzaXModmVjM2EsIHZlYzNiLCB2ZWMzYykge1xuICAgICAgICB0aGlzLnNldCh2ZWMzYVswXSwgdmVjM2FbMV0sIHZlYzNhWzJdLCB2ZWMzYlswXSwgdmVjM2JbMV0sIHZlYzNiWzJdLCB2ZWMzY1swXSwgdmVjM2NbMV0sIHZlYzNjWzJdKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgaW52ZXJzZShtID0gdGhpcykge1xuICAgICAgICBNYXQzRnVuYy5pbnZlcnQodGhpcywgbSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGdldE5vcm1hbE1hdHJpeChtKSB7XG4gICAgICAgIE1hdDNGdW5jLm5vcm1hbEZyb21NYXQ0KHRoaXMsIG0pO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG59XG4iLCJpbXBvcnQgKiBhcyBNYXQ0RnVuYyBmcm9tICcuL2Z1bmN0aW9ucy9NYXQ0RnVuYy5qcyc7XG5cbmV4cG9ydCBjbGFzcyBNYXQ0IGV4dGVuZHMgQXJyYXkge1xuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICBtMDAgPSAxLFxuICAgICAgICBtMDEgPSAwLFxuICAgICAgICBtMDIgPSAwLFxuICAgICAgICBtMDMgPSAwLFxuICAgICAgICBtMTAgPSAwLFxuICAgICAgICBtMTEgPSAxLFxuICAgICAgICBtMTIgPSAwLFxuICAgICAgICBtMTMgPSAwLFxuICAgICAgICBtMjAgPSAwLFxuICAgICAgICBtMjEgPSAwLFxuICAgICAgICBtMjIgPSAxLFxuICAgICAgICBtMjMgPSAwLFxuICAgICAgICBtMzAgPSAwLFxuICAgICAgICBtMzEgPSAwLFxuICAgICAgICBtMzIgPSAwLFxuICAgICAgICBtMzMgPSAxXG4gICAgKSB7XG4gICAgICAgIHN1cGVyKG0wMCwgbTAxLCBtMDIsIG0wMywgbTEwLCBtMTEsIG0xMiwgbTEzLCBtMjAsIG0yMSwgbTIyLCBtMjMsIG0zMCwgbTMxLCBtMzIsIG0zMyk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGdldCB4KCkge1xuICAgICAgICByZXR1cm4gdGhpc1sxMl07XG4gICAgfVxuXG4gICAgZ2V0IHkoKSB7XG4gICAgICAgIHJldHVybiB0aGlzWzEzXTtcbiAgICB9XG5cbiAgICBnZXQgeigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXNbMTRdO1xuICAgIH1cblxuICAgIGdldCB3KCkge1xuICAgICAgICByZXR1cm4gdGhpc1sxNV07XG4gICAgfVxuXG4gICAgc2V0IHgodikge1xuICAgICAgICB0aGlzWzEyXSA9IHY7XG4gICAgfVxuXG4gICAgc2V0IHkodikge1xuICAgICAgICB0aGlzWzEzXSA9IHY7XG4gICAgfVxuXG4gICAgc2V0IHoodikge1xuICAgICAgICB0aGlzWzE0XSA9IHY7XG4gICAgfVxuXG4gICAgc2V0IHcodikge1xuICAgICAgICB0aGlzWzE1XSA9IHY7XG4gICAgfVxuXG4gICAgc2V0KG0wMCwgbTAxLCBtMDIsIG0wMywgbTEwLCBtMTEsIG0xMiwgbTEzLCBtMjAsIG0yMSwgbTIyLCBtMjMsIG0zMCwgbTMxLCBtMzIsIG0zMykge1xuICAgICAgICBpZiAobTAwLmxlbmd0aCkgcmV0dXJuIHRoaXMuY29weShtMDApO1xuICAgICAgICBNYXQ0RnVuYy5zZXQodGhpcywgbTAwLCBtMDEsIG0wMiwgbTAzLCBtMTAsIG0xMSwgbTEyLCBtMTMsIG0yMCwgbTIxLCBtMjIsIG0yMywgbTMwLCBtMzEsIG0zMiwgbTMzKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgdHJhbnNsYXRlKHYsIG0gPSB0aGlzKSB7XG4gICAgICAgIE1hdDRGdW5jLnRyYW5zbGF0ZSh0aGlzLCBtLCB2KTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgcm90YXRlKHYsIGF4aXMsIG0gPSB0aGlzKSB7XG4gICAgICAgIE1hdDRGdW5jLnJvdGF0ZSh0aGlzLCBtLCB2LCBheGlzKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgc2NhbGUodiwgbSA9IHRoaXMpIHtcbiAgICAgICAgTWF0NEZ1bmMuc2NhbGUodGhpcywgbSwgdHlwZW9mIHYgPT09ICdudW1iZXInID8gW3YsIHYsIHZdIDogdik7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIG11bHRpcGx5KG1hLCBtYikge1xuICAgICAgICBpZiAobWIpIHtcbiAgICAgICAgICAgIE1hdDRGdW5jLm11bHRpcGx5KHRoaXMsIG1hLCBtYik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBNYXQ0RnVuYy5tdWx0aXBseSh0aGlzLCB0aGlzLCBtYSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgaWRlbnRpdHkoKSB7XG4gICAgICAgIE1hdDRGdW5jLmlkZW50aXR5KHRoaXMpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBjb3B5KG0pIHtcbiAgICAgICAgTWF0NEZ1bmMuY29weSh0aGlzLCBtKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgZnJvbVBlcnNwZWN0aXZlRnJ1c3RydW0oeyBsZWZ0LCByaWdodCwgYm90dG9tLCB0b3AsIG5lYXIsIGZhciB9KSB7XG4gICAgICAgIE1hdDRGdW5jLnBlcnNwZWN0aXZlRnJ1c3RydW0odGhpcywgbGVmdCwgcmlnaHQsIHRvcCwgYm90dG9tLCBuZWFyLCBmYXIpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBmcm9tUGVyc3BlY3RpdmUoeyBmb3YsIGFzcGVjdCwgbmVhciwgZmFyIH0gPSB7fSkge1xuICAgICAgICBNYXQ0RnVuYy5wZXJzcGVjdGl2ZSh0aGlzLCBmb3YsIGFzcGVjdCwgbmVhciwgZmFyKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgZnJvbU9ydGhvZ29uYWwoeyBsZWZ0LCByaWdodCwgYm90dG9tLCB0b3AsIG5lYXIsIGZhciB9KSB7XG4gICAgICAgIE1hdDRGdW5jLm9ydGhvKHRoaXMsIGxlZnQsIHJpZ2h0LCBib3R0b20sIHRvcCwgbmVhciwgZmFyKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgZnJvbVF1YXRlcm5pb24ocSkge1xuICAgICAgICBNYXQ0RnVuYy5mcm9tUXVhdCh0aGlzLCBxKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgc2V0UG9zaXRpb24odikge1xuICAgICAgICB0aGlzLnggPSB2WzBdO1xuICAgICAgICB0aGlzLnkgPSB2WzFdO1xuICAgICAgICB0aGlzLnogPSB2WzJdO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBpbnZlcnNlKG0gPSB0aGlzKSB7XG4gICAgICAgIE1hdDRGdW5jLmludmVydCh0aGlzLCBtKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgY29tcG9zZShxLCBwb3MsIHNjYWxlKSB7XG4gICAgICAgIE1hdDRGdW5jLmZyb21Sb3RhdGlvblRyYW5zbGF0aW9uU2NhbGUodGhpcywgcSwgcG9zLCBzY2FsZSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGdldFJvdGF0aW9uKHEpIHtcbiAgICAgICAgTWF0NEZ1bmMuZ2V0Um90YXRpb24ocSwgdGhpcyk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGdldFRyYW5zbGF0aW9uKHBvcykge1xuICAgICAgICBNYXQ0RnVuYy5nZXRUcmFuc2xhdGlvbihwb3MsIHRoaXMpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBnZXRTY2FsaW5nKHNjYWxlKSB7XG4gICAgICAgIE1hdDRGdW5jLmdldFNjYWxpbmcoc2NhbGUsIHRoaXMpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBnZXRNYXhTY2FsZU9uQXhpcygpIHtcbiAgICAgICAgcmV0dXJuIE1hdDRGdW5jLmdldE1heFNjYWxlT25BeGlzKHRoaXMpO1xuICAgIH1cblxuICAgIGxvb2tBdChleWUsIHRhcmdldCwgdXApIHtcbiAgICAgICAgTWF0NEZ1bmMudGFyZ2V0VG8odGhpcywgZXllLCB0YXJnZXQsIHVwKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgZGV0ZXJtaW5hbnQoKSB7XG4gICAgICAgIHJldHVybiBNYXQ0RnVuYy5kZXRlcm1pbmFudCh0aGlzKTtcbiAgICB9XG5cbiAgICBmcm9tQXJyYXkoYSwgbyA9IDApIHtcbiAgICAgICAgdGhpc1swXSA9IGFbb107XG4gICAgICAgIHRoaXNbMV0gPSBhW28gKyAxXTtcbiAgICAgICAgdGhpc1syXSA9IGFbbyArIDJdO1xuICAgICAgICB0aGlzWzNdID0gYVtvICsgM107XG4gICAgICAgIHRoaXNbNF0gPSBhW28gKyA0XTtcbiAgICAgICAgdGhpc1s1XSA9IGFbbyArIDVdO1xuICAgICAgICB0aGlzWzZdID0gYVtvICsgNl07XG4gICAgICAgIHRoaXNbN10gPSBhW28gKyA3XTtcbiAgICAgICAgdGhpc1s4XSA9IGFbbyArIDhdO1xuICAgICAgICB0aGlzWzldID0gYVtvICsgOV07XG4gICAgICAgIHRoaXNbMTBdID0gYVtvICsgMTBdO1xuICAgICAgICB0aGlzWzExXSA9IGFbbyArIDExXTtcbiAgICAgICAgdGhpc1sxMl0gPSBhW28gKyAxMl07XG4gICAgICAgIHRoaXNbMTNdID0gYVtvICsgMTNdO1xuICAgICAgICB0aGlzWzE0XSA9IGFbbyArIDE0XTtcbiAgICAgICAgdGhpc1sxNV0gPSBhW28gKyAxNV07XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHRvQXJyYXkoYSA9IFtdLCBvID0gMCkge1xuICAgICAgICBhW29dID0gdGhpc1swXTtcbiAgICAgICAgYVtvICsgMV0gPSB0aGlzWzFdO1xuICAgICAgICBhW28gKyAyXSA9IHRoaXNbMl07XG4gICAgICAgIGFbbyArIDNdID0gdGhpc1szXTtcbiAgICAgICAgYVtvICsgNF0gPSB0aGlzWzRdO1xuICAgICAgICBhW28gKyA1XSA9IHRoaXNbNV07XG4gICAgICAgIGFbbyArIDZdID0gdGhpc1s2XTtcbiAgICAgICAgYVtvICsgN10gPSB0aGlzWzddO1xuICAgICAgICBhW28gKyA4XSA9IHRoaXNbOF07XG4gICAgICAgIGFbbyArIDldID0gdGhpc1s5XTtcbiAgICAgICAgYVtvICsgMTBdID0gdGhpc1sxMF07XG4gICAgICAgIGFbbyArIDExXSA9IHRoaXNbMTFdO1xuICAgICAgICBhW28gKyAxMl0gPSB0aGlzWzEyXTtcbiAgICAgICAgYVtvICsgMTNdID0gdGhpc1sxM107XG4gICAgICAgIGFbbyArIDE0XSA9IHRoaXNbMTRdO1xuICAgICAgICBhW28gKyAxNV0gPSB0aGlzWzE1XTtcbiAgICAgICAgcmV0dXJuIGE7XG4gICAgfVxufVxuIiwiaW1wb3J0ICogYXMgUXVhdEZ1bmMgZnJvbSAnLi9mdW5jdGlvbnMvUXVhdEZ1bmMuanMnO1xuXG5leHBvcnQgY2xhc3MgUXVhdCBleHRlbmRzIEFycmF5IHtcbiAgICBjb25zdHJ1Y3Rvcih4ID0gMCwgeSA9IDAsIHogPSAwLCB3ID0gMSkge1xuICAgICAgICBzdXBlcih4LCB5LCB6LCB3KTtcbiAgICAgICAgdGhpcy5vbkNoYW5nZSA9ICgpID0+IHt9O1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBnZXQgeCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXNbMF07XG4gICAgfVxuXG4gICAgZ2V0IHkoKSB7XG4gICAgICAgIHJldHVybiB0aGlzWzFdO1xuICAgIH1cblxuICAgIGdldCB6KCkge1xuICAgICAgICByZXR1cm4gdGhpc1syXTtcbiAgICB9XG5cbiAgICBnZXQgdygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXNbM107XG4gICAgfVxuXG4gICAgc2V0IHgodikge1xuICAgICAgICB0aGlzWzBdID0gdjtcbiAgICAgICAgdGhpcy5vbkNoYW5nZSgpO1xuICAgIH1cblxuICAgIHNldCB5KHYpIHtcbiAgICAgICAgdGhpc1sxXSA9IHY7XG4gICAgICAgIHRoaXMub25DaGFuZ2UoKTtcbiAgICB9XG5cbiAgICBzZXQgeih2KSB7XG4gICAgICAgIHRoaXNbMl0gPSB2O1xuICAgICAgICB0aGlzLm9uQ2hhbmdlKCk7XG4gICAgfVxuXG4gICAgc2V0IHcodikge1xuICAgICAgICB0aGlzWzNdID0gdjtcbiAgICAgICAgdGhpcy5vbkNoYW5nZSgpO1xuICAgIH1cblxuICAgIGlkZW50aXR5KCkge1xuICAgICAgICBRdWF0RnVuYy5pZGVudGl0eSh0aGlzKTtcbiAgICAgICAgdGhpcy5vbkNoYW5nZSgpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBzZXQoeCwgeSwgeiwgdykge1xuICAgICAgICBpZiAoeC5sZW5ndGgpIHJldHVybiB0aGlzLmNvcHkoeCk7XG4gICAgICAgIFF1YXRGdW5jLnNldCh0aGlzLCB4LCB5LCB6LCB3KTtcbiAgICAgICAgdGhpcy5vbkNoYW5nZSgpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICByb3RhdGVYKGEpIHtcbiAgICAgICAgUXVhdEZ1bmMucm90YXRlWCh0aGlzLCB0aGlzLCBhKTtcbiAgICAgICAgdGhpcy5vbkNoYW5nZSgpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICByb3RhdGVZKGEpIHtcbiAgICAgICAgUXVhdEZ1bmMucm90YXRlWSh0aGlzLCB0aGlzLCBhKTtcbiAgICAgICAgdGhpcy5vbkNoYW5nZSgpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICByb3RhdGVaKGEpIHtcbiAgICAgICAgUXVhdEZ1bmMucm90YXRlWih0aGlzLCB0aGlzLCBhKTtcbiAgICAgICAgdGhpcy5vbkNoYW5nZSgpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBpbnZlcnNlKHEgPSB0aGlzKSB7XG4gICAgICAgIFF1YXRGdW5jLmludmVydCh0aGlzLCBxKTtcbiAgICAgICAgdGhpcy5vbkNoYW5nZSgpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBjb25qdWdhdGUocSA9IHRoaXMpIHtcbiAgICAgICAgUXVhdEZ1bmMuY29uanVnYXRlKHRoaXMsIHEpO1xuICAgICAgICB0aGlzLm9uQ2hhbmdlKCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGNvcHkocSkge1xuICAgICAgICBRdWF0RnVuYy5jb3B5KHRoaXMsIHEpO1xuICAgICAgICB0aGlzLm9uQ2hhbmdlKCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIG5vcm1hbGl6ZShxID0gdGhpcykge1xuICAgICAgICBRdWF0RnVuYy5ub3JtYWxpemUodGhpcywgcSk7XG4gICAgICAgIHRoaXMub25DaGFuZ2UoKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgbXVsdGlwbHkocUEsIHFCKSB7XG4gICAgICAgIGlmIChxQikge1xuICAgICAgICAgICAgUXVhdEZ1bmMubXVsdGlwbHkodGhpcywgcUEsIHFCKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIFF1YXRGdW5jLm11bHRpcGx5KHRoaXMsIHRoaXMsIHFBKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLm9uQ2hhbmdlKCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGRvdCh2KSB7XG4gICAgICAgIHJldHVybiBRdWF0RnVuYy5kb3QodGhpcywgdik7XG4gICAgfVxuXG4gICAgZnJvbU1hdHJpeDMobWF0cml4Mykge1xuICAgICAgICBRdWF0RnVuYy5mcm9tTWF0Myh0aGlzLCBtYXRyaXgzKTtcbiAgICAgICAgdGhpcy5vbkNoYW5nZSgpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBmcm9tRXVsZXIoZXVsZXIpIHtcbiAgICAgICAgUXVhdEZ1bmMuZnJvbUV1bGVyKHRoaXMsIGV1bGVyLCBldWxlci5vcmRlcik7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGZyb21BeGlzQW5nbGUoYXhpcywgYSkge1xuICAgICAgICBRdWF0RnVuYy5zZXRBeGlzQW5nbGUodGhpcywgYXhpcywgYSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHNsZXJwKHEsIHQpIHtcbiAgICAgICAgUXVhdEZ1bmMuc2xlcnAodGhpcywgdGhpcywgcSwgdCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGZyb21BcnJheShhLCBvID0gMCkge1xuICAgICAgICB0aGlzWzBdID0gYVtvXTtcbiAgICAgICAgdGhpc1sxXSA9IGFbbyArIDFdO1xuICAgICAgICB0aGlzWzJdID0gYVtvICsgMl07XG4gICAgICAgIHRoaXNbM10gPSBhW28gKyAzXTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgdG9BcnJheShhID0gW10sIG8gPSAwKSB7XG4gICAgICAgIGFbb10gPSB0aGlzWzBdO1xuICAgICAgICBhW28gKyAxXSA9IHRoaXNbMV07XG4gICAgICAgIGFbbyArIDJdID0gdGhpc1syXTtcbiAgICAgICAgYVtvICsgM10gPSB0aGlzWzNdO1xuICAgICAgICByZXR1cm4gYTtcbiAgICB9XG59XG4iLCJpbXBvcnQgKiBhcyBWZWMyRnVuYyBmcm9tICcuL2Z1bmN0aW9ucy9WZWMyRnVuYy5qcyc7XG5cbmV4cG9ydCBjbGFzcyBWZWMyIGV4dGVuZHMgQXJyYXkge1xuICAgIGNvbnN0cnVjdG9yKHggPSAwLCB5ID0geCkge1xuICAgICAgICBzdXBlcih4LCB5KTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgZ2V0IHgoKSB7XG4gICAgICAgIHJldHVybiB0aGlzWzBdO1xuICAgIH1cblxuICAgIGdldCB5KCkge1xuICAgICAgICByZXR1cm4gdGhpc1sxXTtcbiAgICB9XG5cbiAgICBzZXQgeCh2KSB7XG4gICAgICAgIHRoaXNbMF0gPSB2O1xuICAgIH1cblxuICAgIHNldCB5KHYpIHtcbiAgICAgICAgdGhpc1sxXSA9IHY7XG4gICAgfVxuXG4gICAgc2V0KHgsIHkgPSB4KSB7XG4gICAgICAgIGlmICh4Lmxlbmd0aCkgcmV0dXJuIHRoaXMuY29weSh4KTtcbiAgICAgICAgVmVjMkZ1bmMuc2V0KHRoaXMsIHgsIHkpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBjb3B5KHYpIHtcbiAgICAgICAgVmVjMkZ1bmMuY29weSh0aGlzLCB2KTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgYWRkKHZhLCB2Yikge1xuICAgICAgICBpZiAodmIpIFZlYzJGdW5jLmFkZCh0aGlzLCB2YSwgdmIpO1xuICAgICAgICBlbHNlIFZlYzJGdW5jLmFkZCh0aGlzLCB0aGlzLCB2YSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHN1Yih2YSwgdmIpIHtcbiAgICAgICAgaWYgKHZiKSBWZWMyRnVuYy5zdWJ0cmFjdCh0aGlzLCB2YSwgdmIpO1xuICAgICAgICBlbHNlIFZlYzJGdW5jLnN1YnRyYWN0KHRoaXMsIHRoaXMsIHZhKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgbXVsdGlwbHkodikge1xuICAgICAgICBpZiAodi5sZW5ndGgpIFZlYzJGdW5jLm11bHRpcGx5KHRoaXMsIHRoaXMsIHYpO1xuICAgICAgICBlbHNlIFZlYzJGdW5jLnNjYWxlKHRoaXMsIHRoaXMsIHYpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBkaXZpZGUodikge1xuICAgICAgICBpZiAodi5sZW5ndGgpIFZlYzJGdW5jLmRpdmlkZSh0aGlzLCB0aGlzLCB2KTtcbiAgICAgICAgZWxzZSBWZWMyRnVuYy5zY2FsZSh0aGlzLCB0aGlzLCAxIC8gdik7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGludmVyc2UodiA9IHRoaXMpIHtcbiAgICAgICAgVmVjMkZ1bmMuaW52ZXJzZSh0aGlzLCB2KTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLy8gQ2FuJ3QgdXNlICdsZW5ndGgnIGFzIEFycmF5LnByb3RvdHlwZSB1c2VzIGl0XG4gICAgbGVuKCkge1xuICAgICAgICByZXR1cm4gVmVjMkZ1bmMubGVuZ3RoKHRoaXMpO1xuICAgIH1cblxuICAgIGRpc3RhbmNlKHYpIHtcbiAgICAgICAgaWYgKHYpIHJldHVybiBWZWMyRnVuYy5kaXN0YW5jZSh0aGlzLCB2KTtcbiAgICAgICAgZWxzZSByZXR1cm4gVmVjMkZ1bmMubGVuZ3RoKHRoaXMpO1xuICAgIH1cblxuICAgIHNxdWFyZWRMZW4oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNxdWFyZWREaXN0YW5jZSgpO1xuICAgIH1cblxuICAgIHNxdWFyZWREaXN0YW5jZSh2KSB7XG4gICAgICAgIGlmICh2KSByZXR1cm4gVmVjMkZ1bmMuc3F1YXJlZERpc3RhbmNlKHRoaXMsIHYpO1xuICAgICAgICBlbHNlIHJldHVybiBWZWMyRnVuYy5zcXVhcmVkTGVuZ3RoKHRoaXMpO1xuICAgIH1cblxuICAgIG5lZ2F0ZSh2ID0gdGhpcykge1xuICAgICAgICBWZWMyRnVuYy5uZWdhdGUodGhpcywgdik7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGNyb3NzKHZhLCB2Yikge1xuICAgICAgICBpZiAodmIpIHJldHVybiBWZWMyRnVuYy5jcm9zcyh2YSwgdmIpO1xuICAgICAgICByZXR1cm4gVmVjMkZ1bmMuY3Jvc3ModGhpcywgdmEpO1xuICAgIH1cblxuICAgIHNjYWxlKHYpIHtcbiAgICAgICAgVmVjMkZ1bmMuc2NhbGUodGhpcywgdGhpcywgdik7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIG5vcm1hbGl6ZSgpIHtcbiAgICAgICAgVmVjMkZ1bmMubm9ybWFsaXplKHRoaXMsIHRoaXMpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBkb3Qodikge1xuICAgICAgICByZXR1cm4gVmVjMkZ1bmMuZG90KHRoaXMsIHYpO1xuICAgIH1cblxuICAgIGVxdWFscyh2KSB7XG4gICAgICAgIHJldHVybiBWZWMyRnVuYy5leGFjdEVxdWFscyh0aGlzLCB2KTtcbiAgICB9XG5cbiAgICBhcHBseU1hdHJpeDMobWF0Mykge1xuICAgICAgICBWZWMyRnVuYy50cmFuc2Zvcm1NYXQzKHRoaXMsIHRoaXMsIG1hdDMpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBhcHBseU1hdHJpeDQobWF0NCkge1xuICAgICAgICBWZWMyRnVuYy50cmFuc2Zvcm1NYXQ0KHRoaXMsIHRoaXMsIG1hdDQpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBsZXJwKHYsIGEpIHtcbiAgICAgICAgVmVjMkZ1bmMubGVycCh0aGlzLCB0aGlzLCB2LCBhKTtcbiAgICB9XG5cbiAgICBjbG9uZSgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBWZWMyKHRoaXNbMF0sIHRoaXNbMV0pO1xuICAgIH1cblxuICAgIGZyb21BcnJheShhLCBvID0gMCkge1xuICAgICAgICB0aGlzWzBdID0gYVtvXTtcbiAgICAgICAgdGhpc1sxXSA9IGFbbyArIDFdO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICB0b0FycmF5KGEgPSBbXSwgbyA9IDApIHtcbiAgICAgICAgYVtvXSA9IHRoaXNbMF07XG4gICAgICAgIGFbbyArIDFdID0gdGhpc1sxXTtcbiAgICAgICAgcmV0dXJuIGE7XG4gICAgfVxufVxuIiwiaW1wb3J0ICogYXMgVmVjM0Z1bmMgZnJvbSAnLi9mdW5jdGlvbnMvVmVjM0Z1bmMuanMnO1xuXG5leHBvcnQgY2xhc3MgVmVjMyBleHRlbmRzIEFycmF5IHtcbiAgICBjb25zdHJ1Y3Rvcih4ID0gMCwgeSA9IHgsIHogPSB4KSB7XG4gICAgICAgIHN1cGVyKHgsIHksIHopO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBnZXQgeCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXNbMF07XG4gICAgfVxuXG4gICAgZ2V0IHkoKSB7XG4gICAgICAgIHJldHVybiB0aGlzWzFdO1xuICAgIH1cblxuICAgIGdldCB6KCkge1xuICAgICAgICByZXR1cm4gdGhpc1syXTtcbiAgICB9XG5cbiAgICBzZXQgeCh2KSB7XG4gICAgICAgIHRoaXNbMF0gPSB2O1xuICAgIH1cblxuICAgIHNldCB5KHYpIHtcbiAgICAgICAgdGhpc1sxXSA9IHY7XG4gICAgfVxuXG4gICAgc2V0IHoodikge1xuICAgICAgICB0aGlzWzJdID0gdjtcbiAgICB9XG5cbiAgICBzZXQoeCwgeSA9IHgsIHogPSB4KSB7XG4gICAgICAgIGlmICh4Lmxlbmd0aCkgcmV0dXJuIHRoaXMuY29weSh4KTtcbiAgICAgICAgVmVjM0Z1bmMuc2V0KHRoaXMsIHgsIHksIHopO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBjb3B5KHYpIHtcbiAgICAgICAgVmVjM0Z1bmMuY29weSh0aGlzLCB2KTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgYWRkKHZhLCB2Yikge1xuICAgICAgICBpZiAodmIpIFZlYzNGdW5jLmFkZCh0aGlzLCB2YSwgdmIpO1xuICAgICAgICBlbHNlIFZlYzNGdW5jLmFkZCh0aGlzLCB0aGlzLCB2YSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHN1Yih2YSwgdmIpIHtcbiAgICAgICAgaWYgKHZiKSBWZWMzRnVuYy5zdWJ0cmFjdCh0aGlzLCB2YSwgdmIpO1xuICAgICAgICBlbHNlIFZlYzNGdW5jLnN1YnRyYWN0KHRoaXMsIHRoaXMsIHZhKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgbXVsdGlwbHkodikge1xuICAgICAgICBpZiAodi5sZW5ndGgpIFZlYzNGdW5jLm11bHRpcGx5KHRoaXMsIHRoaXMsIHYpO1xuICAgICAgICBlbHNlIFZlYzNGdW5jLnNjYWxlKHRoaXMsIHRoaXMsIHYpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBkaXZpZGUodikge1xuICAgICAgICBpZiAodi5sZW5ndGgpIFZlYzNGdW5jLmRpdmlkZSh0aGlzLCB0aGlzLCB2KTtcbiAgICAgICAgZWxzZSBWZWMzRnVuYy5zY2FsZSh0aGlzLCB0aGlzLCAxIC8gdik7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGludmVyc2UodiA9IHRoaXMpIHtcbiAgICAgICAgVmVjM0Z1bmMuaW52ZXJzZSh0aGlzLCB2KTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLy8gQ2FuJ3QgdXNlICdsZW5ndGgnIGFzIEFycmF5LnByb3RvdHlwZSB1c2VzIGl0XG4gICAgbGVuKCkge1xuICAgICAgICByZXR1cm4gVmVjM0Z1bmMubGVuZ3RoKHRoaXMpO1xuICAgIH1cblxuICAgIGRpc3RhbmNlKHYpIHtcbiAgICAgICAgaWYgKHYpIHJldHVybiBWZWMzRnVuYy5kaXN0YW5jZSh0aGlzLCB2KTtcbiAgICAgICAgZWxzZSByZXR1cm4gVmVjM0Z1bmMubGVuZ3RoKHRoaXMpO1xuICAgIH1cblxuICAgIHNxdWFyZWRMZW4oKSB7XG4gICAgICAgIHJldHVybiBWZWMzRnVuYy5zcXVhcmVkTGVuZ3RoKHRoaXMpO1xuICAgIH1cblxuICAgIHNxdWFyZWREaXN0YW5jZSh2KSB7XG4gICAgICAgIGlmICh2KSByZXR1cm4gVmVjM0Z1bmMuc3F1YXJlZERpc3RhbmNlKHRoaXMsIHYpO1xuICAgICAgICBlbHNlIHJldHVybiBWZWMzRnVuYy5zcXVhcmVkTGVuZ3RoKHRoaXMpO1xuICAgIH1cblxuICAgIG5lZ2F0ZSh2ID0gdGhpcykge1xuICAgICAgICBWZWMzRnVuYy5uZWdhdGUodGhpcywgdik7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGNyb3NzKHZhLCB2Yikge1xuICAgICAgICBpZiAodmIpIFZlYzNGdW5jLmNyb3NzKHRoaXMsIHZhLCB2Yik7XG4gICAgICAgIGVsc2UgVmVjM0Z1bmMuY3Jvc3ModGhpcywgdGhpcywgdmEpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBzY2FsZSh2KSB7XG4gICAgICAgIFZlYzNGdW5jLnNjYWxlKHRoaXMsIHRoaXMsIHYpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBub3JtYWxpemUoKSB7XG4gICAgICAgIFZlYzNGdW5jLm5vcm1hbGl6ZSh0aGlzLCB0aGlzKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgZG90KHYpIHtcbiAgICAgICAgcmV0dXJuIFZlYzNGdW5jLmRvdCh0aGlzLCB2KTtcbiAgICB9XG5cbiAgICBlcXVhbHModikge1xuICAgICAgICByZXR1cm4gVmVjM0Z1bmMuZXhhY3RFcXVhbHModGhpcywgdik7XG4gICAgfVxuXG4gICAgYXBwbHlNYXRyaXg0KG1hdDQpIHtcbiAgICAgICAgVmVjM0Z1bmMudHJhbnNmb3JtTWF0NCh0aGlzLCB0aGlzLCBtYXQ0KTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgc2NhbGVSb3RhdGVNYXRyaXg0KG1hdDQpIHtcbiAgICAgICAgVmVjM0Z1bmMuc2NhbGVSb3RhdGVNYXQ0KHRoaXMsIHRoaXMsIG1hdDQpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBhcHBseVF1YXRlcm5pb24ocSkge1xuICAgICAgICBWZWMzRnVuYy50cmFuc2Zvcm1RdWF0KHRoaXMsIHRoaXMsIHEpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBhbmdsZSh2KSB7XG4gICAgICAgIHJldHVybiBWZWMzRnVuYy5hbmdsZSh0aGlzLCB2KTtcbiAgICB9XG5cbiAgICBsZXJwKHYsIHQpIHtcbiAgICAgICAgVmVjM0Z1bmMubGVycCh0aGlzLCB0aGlzLCB2LCB0KTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgY2xvbmUoKSB7XG4gICAgICAgIHJldHVybiBuZXcgVmVjMyh0aGlzWzBdLCB0aGlzWzFdLCB0aGlzWzJdKTtcbiAgICB9XG5cbiAgICBmcm9tQXJyYXkoYSwgbyA9IDApIHtcbiAgICAgICAgdGhpc1swXSA9IGFbb107XG4gICAgICAgIHRoaXNbMV0gPSBhW28gKyAxXTtcbiAgICAgICAgdGhpc1syXSA9IGFbbyArIDJdO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICB0b0FycmF5KGEgPSBbXSwgbyA9IDApIHtcbiAgICAgICAgYVtvXSA9IHRoaXNbMF07XG4gICAgICAgIGFbbyArIDFdID0gdGhpc1sxXTtcbiAgICAgICAgYVtvICsgMl0gPSB0aGlzWzJdO1xuICAgICAgICByZXR1cm4gYTtcbiAgICB9XG5cbiAgICB0cmFuc2Zvcm1EaXJlY3Rpb24obWF0NCkge1xuICAgICAgICBjb25zdCB4ID0gdGhpc1swXTtcbiAgICAgICAgY29uc3QgeSA9IHRoaXNbMV07XG4gICAgICAgIGNvbnN0IHogPSB0aGlzWzJdO1xuXG4gICAgICAgIHRoaXNbMF0gPSBtYXQ0WzBdICogeCArIG1hdDRbNF0gKiB5ICsgbWF0NFs4XSAqIHo7XG4gICAgICAgIHRoaXNbMV0gPSBtYXQ0WzFdICogeCArIG1hdDRbNV0gKiB5ICsgbWF0NFs5XSAqIHo7XG4gICAgICAgIHRoaXNbMl0gPSBtYXQ0WzJdICogeCArIG1hdDRbNl0gKiB5ICsgbWF0NFsxMF0gKiB6O1xuXG4gICAgICAgIHJldHVybiB0aGlzLm5vcm1hbGl6ZSgpO1xuICAgIH1cbn1cbiIsImltcG9ydCAqIGFzIFZlYzRGdW5jIGZyb20gJy4vZnVuY3Rpb25zL1ZlYzRGdW5jLmpzJztcblxuZXhwb3J0IGNsYXNzIFZlYzQgZXh0ZW5kcyBBcnJheSB7XG4gICAgY29uc3RydWN0b3IoeCA9IDAsIHkgPSB4LCB6ID0geCwgdyA9IHgpIHtcbiAgICAgICAgc3VwZXIoeCwgeSwgeiwgdyk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGdldCB4KCkge1xuICAgICAgICByZXR1cm4gdGhpc1swXTtcbiAgICB9XG5cbiAgICBnZXQgeSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXNbMV07XG4gICAgfVxuXG4gICAgZ2V0IHooKSB7XG4gICAgICAgIHJldHVybiB0aGlzWzJdO1xuICAgIH1cblxuICAgIGdldCB3KCkge1xuICAgICAgICByZXR1cm4gdGhpc1szXTtcbiAgICB9XG5cbiAgICBzZXQgeCh2KSB7XG4gICAgICAgIHRoaXNbMF0gPSB2O1xuICAgIH1cblxuICAgIHNldCB5KHYpIHtcbiAgICAgICAgdGhpc1sxXSA9IHY7XG4gICAgfVxuXG4gICAgc2V0IHoodikge1xuICAgICAgICB0aGlzWzJdID0gdjtcbiAgICB9XG5cbiAgICBzZXQgdyh2KSB7XG4gICAgICAgIHRoaXNbM10gPSB2O1xuICAgIH1cblxuICAgIHNldCh4LCB5LCB6LCB3KSB7XG4gICAgICAgIGlmICh4Lmxlbmd0aCkgcmV0dXJuIHRoaXMuY29weSh4KTtcbiAgICAgICAgVmVjNEZ1bmMuc2V0KHRoaXMsIHgsIHksIHosIHcpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBjb3B5KHYpIHtcbiAgICAgICAgVmVjNEZ1bmMuY29weSh0aGlzLCB2KTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgbm9ybWFsaXplKCkge1xuICAgICAgICBWZWM0RnVuYy5ub3JtYWxpemUodGhpcywgdGhpcyk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGZyb21BcnJheShhLCBvID0gMCkge1xuICAgICAgICB0aGlzWzBdID0gYVtvXTtcbiAgICAgICAgdGhpc1sxXSA9IGFbbyArIDFdO1xuICAgICAgICB0aGlzWzJdID0gYVtvICsgMl07XG4gICAgICAgIHRoaXNbM10gPSBhW28gKyAzXTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgdG9BcnJheShhID0gW10sIG8gPSAwKSB7XG4gICAgICAgIGFbb10gPSB0aGlzWzBdO1xuICAgICAgICBhW28gKyAxXSA9IHRoaXNbMV07XG4gICAgICAgIGFbbyArIDJdID0gdGhpc1syXTtcbiAgICAgICAgYVtvICsgM10gPSB0aGlzWzNdO1xuICAgICAgICByZXR1cm4gYTtcbiAgICB9XG59XG4iLCJjb25zdCBOQU1FUyA9IHtcbiAgICBibGFjazogJyMwMDAwMDAnLFxuICAgIHdoaXRlOiAnI2ZmZmZmZicsXG4gICAgcmVkOiAnI2ZmMDAwMCcsXG4gICAgZ3JlZW46ICcjMDBmZjAwJyxcbiAgICBibHVlOiAnIzAwMDBmZicsXG4gICAgZnVjaHNpYTogJyNmZjAwZmYnLFxuICAgIGN5YW46ICcjMDBmZmZmJyxcbiAgICB5ZWxsb3c6ICcjZmZmZjAwJyxcbiAgICBvcmFuZ2U6ICcjZmY4MDAwJyxcbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBoZXhUb1JHQihoZXgpIHtcbiAgICBpZiAoaGV4Lmxlbmd0aCA9PT0gNCkgaGV4ID0gaGV4WzBdICsgaGV4WzFdICsgaGV4WzFdICsgaGV4WzJdICsgaGV4WzJdICsgaGV4WzNdICsgaGV4WzNdO1xuICAgIGNvbnN0IHJnYiA9IC9eIz8oW2EtZlxcZF17Mn0pKFthLWZcXGRdezJ9KShbYS1mXFxkXXsyfSkkL2kuZXhlYyhoZXgpO1xuICAgIGlmICghcmdiKSBjb25zb2xlLndhcm4oYFVuYWJsZSB0byBjb252ZXJ0IGhleCBzdHJpbmcgJHtoZXh9IHRvIHJnYiB2YWx1ZXNgKTtcbiAgICByZXR1cm4gW3BhcnNlSW50KHJnYlsxXSwgMTYpIC8gMjU1LCBwYXJzZUludChyZ2JbMl0sIDE2KSAvIDI1NSwgcGFyc2VJbnQocmdiWzNdLCAxNikgLyAyNTVdO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbnVtYmVyVG9SR0IobnVtKSB7XG4gICAgbnVtID0gcGFyc2VJbnQobnVtKTtcbiAgICByZXR1cm4gWygobnVtID4+IDE2KSAmIDI1NSkgLyAyNTUsICgobnVtID4+IDgpICYgMjU1KSAvIDI1NSwgKG51bSAmIDI1NSkgLyAyNTVdO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VDb2xvcihjb2xvcikge1xuICAgIC8vIEVtcHR5XG4gICAgaWYgKGNvbG9yID09PSB1bmRlZmluZWQpIHJldHVybiBbMCwgMCwgMF07XG5cbiAgICAvLyBEZWNpbWFsXG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDMpIHJldHVybiBhcmd1bWVudHM7XG5cbiAgICAvLyBOdW1iZXJcbiAgICBpZiAoIWlzTmFOKGNvbG9yKSkgcmV0dXJuIG51bWJlclRvUkdCKGNvbG9yKTtcblxuICAgIC8vIEhleFxuICAgIGlmIChjb2xvclswXSA9PT0gJyMnKSByZXR1cm4gaGV4VG9SR0IoY29sb3IpO1xuXG4gICAgLy8gTmFtZXNcbiAgICBpZiAoTkFNRVNbY29sb3IudG9Mb3dlckNhc2UoKV0pIHJldHVybiBoZXhUb1JHQihOQU1FU1tjb2xvci50b0xvd2VyQ2FzZSgpXSk7XG5cbiAgICBjb25zb2xlLndhcm4oJ0NvbG9yIGZvcm1hdCBub3QgcmVjb2duaXNlZCcpO1xuICAgIHJldHVybiBbMCwgMCwgMF07XG59XG4iLCIvLyBhc3N1bWVzIHRoZSB1cHBlciAzeDMgb2YgbSBpcyBhIHB1cmUgcm90YXRpb24gbWF0cml4IChpLmUsIHVuc2NhbGVkKVxuZXhwb3J0IGZ1bmN0aW9uIGZyb21Sb3RhdGlvbk1hdHJpeChvdXQsIG0sIG9yZGVyID0gJ1lYWicpIHtcbiAgICBpZiAob3JkZXIgPT09ICdYWVonKSB7XG4gICAgICAgIG91dFsxXSA9IE1hdGguYXNpbihNYXRoLm1pbihNYXRoLm1heChtWzhdLCAtMSksIDEpKTtcbiAgICAgICAgaWYgKE1hdGguYWJzKG1bOF0pIDwgMC45OTk5OSkge1xuICAgICAgICAgICAgb3V0WzBdID0gTWF0aC5hdGFuMigtbVs5XSwgbVsxMF0pO1xuICAgICAgICAgICAgb3V0WzJdID0gTWF0aC5hdGFuMigtbVs0XSwgbVswXSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBvdXRbMF0gPSBNYXRoLmF0YW4yKG1bNl0sIG1bNV0pO1xuICAgICAgICAgICAgb3V0WzJdID0gMDtcbiAgICAgICAgfVxuICAgIH0gZWxzZSBpZiAob3JkZXIgPT09ICdZWFonKSB7XG4gICAgICAgIG91dFswXSA9IE1hdGguYXNpbigtTWF0aC5taW4oTWF0aC5tYXgobVs5XSwgLTEpLCAxKSk7XG4gICAgICAgIGlmIChNYXRoLmFicyhtWzldKSA8IDAuOTk5OTkpIHtcbiAgICAgICAgICAgIG91dFsxXSA9IE1hdGguYXRhbjIobVs4XSwgbVsxMF0pO1xuICAgICAgICAgICAgb3V0WzJdID0gTWF0aC5hdGFuMihtWzFdLCBtWzVdKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG91dFsxXSA9IE1hdGguYXRhbjIoLW1bMl0sIG1bMF0pO1xuICAgICAgICAgICAgb3V0WzJdID0gMDtcbiAgICAgICAgfVxuICAgIH0gZWxzZSBpZiAob3JkZXIgPT09ICdaWFknKSB7XG4gICAgICAgIG91dFswXSA9IE1hdGguYXNpbihNYXRoLm1pbihNYXRoLm1heChtWzZdLCAtMSksIDEpKTtcbiAgICAgICAgaWYgKE1hdGguYWJzKG1bNl0pIDwgMC45OTk5OSkge1xuICAgICAgICAgICAgb3V0WzFdID0gTWF0aC5hdGFuMigtbVsyXSwgbVsxMF0pO1xuICAgICAgICAgICAgb3V0WzJdID0gTWF0aC5hdGFuMigtbVs0XSwgbVs1XSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBvdXRbMV0gPSAwO1xuICAgICAgICAgICAgb3V0WzJdID0gTWF0aC5hdGFuMihtWzFdLCBtWzBdKTtcbiAgICAgICAgfVxuICAgIH0gZWxzZSBpZiAob3JkZXIgPT09ICdaWVgnKSB7XG4gICAgICAgIG91dFsxXSA9IE1hdGguYXNpbigtTWF0aC5taW4oTWF0aC5tYXgobVsyXSwgLTEpLCAxKSk7XG4gICAgICAgIGlmIChNYXRoLmFicyhtWzJdKSA8IDAuOTk5OTkpIHtcbiAgICAgICAgICAgIG91dFswXSA9IE1hdGguYXRhbjIobVs2XSwgbVsxMF0pO1xuICAgICAgICAgICAgb3V0WzJdID0gTWF0aC5hdGFuMihtWzFdLCBtWzBdKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG91dFswXSA9IDA7XG4gICAgICAgICAgICBvdXRbMl0gPSBNYXRoLmF0YW4yKC1tWzRdLCBtWzVdKTtcbiAgICAgICAgfVxuICAgIH0gZWxzZSBpZiAob3JkZXIgPT09ICdZWlgnKSB7XG4gICAgICAgIG91dFsyXSA9IE1hdGguYXNpbihNYXRoLm1pbihNYXRoLm1heChtWzFdLCAtMSksIDEpKTtcbiAgICAgICAgaWYgKE1hdGguYWJzKG1bMV0pIDwgMC45OTk5OSkge1xuICAgICAgICAgICAgb3V0WzBdID0gTWF0aC5hdGFuMigtbVs5XSwgbVs1XSk7XG4gICAgICAgICAgICBvdXRbMV0gPSBNYXRoLmF0YW4yKC1tWzJdLCBtWzBdKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG91dFswXSA9IDA7XG4gICAgICAgICAgICBvdXRbMV0gPSBNYXRoLmF0YW4yKG1bOF0sIG1bMTBdKTtcbiAgICAgICAgfVxuICAgIH0gZWxzZSBpZiAob3JkZXIgPT09ICdYWlknKSB7XG4gICAgICAgIG91dFsyXSA9IE1hdGguYXNpbigtTWF0aC5taW4oTWF0aC5tYXgobVs0XSwgLTEpLCAxKSk7XG4gICAgICAgIGlmIChNYXRoLmFicyhtWzRdKSA8IDAuOTk5OTkpIHtcbiAgICAgICAgICAgIG91dFswXSA9IE1hdGguYXRhbjIobVs2XSwgbVs1XSk7XG4gICAgICAgICAgICBvdXRbMV0gPSBNYXRoLmF0YW4yKG1bOF0sIG1bMF0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgb3V0WzBdID0gTWF0aC5hdGFuMigtbVs5XSwgbVsxMF0pO1xuICAgICAgICAgICAgb3V0WzFdID0gMDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBvdXQ7XG59XG4iLCJjb25zdCBFUFNJTE9OID0gMC4wMDAwMDE7XG5cbi8qKlxuICogQ29waWVzIHRoZSB1cHBlci1sZWZ0IDN4MyB2YWx1ZXMgaW50byB0aGUgZ2l2ZW4gbWF0My5cbiAqXG4gKiBAcGFyYW0ge21hdDN9IG91dCB0aGUgcmVjZWl2aW5nIDN4MyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0NH0gYSAgIHRoZSBzb3VyY2UgNHg0IG1hdHJpeFxuICogQHJldHVybnMge21hdDN9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gZnJvbU1hdDQob3V0LCBhKSB7XG4gICAgb3V0WzBdID0gYVswXTtcbiAgICBvdXRbMV0gPSBhWzFdO1xuICAgIG91dFsyXSA9IGFbMl07XG4gICAgb3V0WzNdID0gYVs0XTtcbiAgICBvdXRbNF0gPSBhWzVdO1xuICAgIG91dFs1XSA9IGFbNl07XG4gICAgb3V0WzZdID0gYVs4XTtcbiAgICBvdXRbN10gPSBhWzldO1xuICAgIG91dFs4XSA9IGFbMTBdO1xuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogQ2FsY3VsYXRlcyBhIDN4MyBtYXRyaXggZnJvbSB0aGUgZ2l2ZW4gcXVhdGVybmlvblxuICpcbiAqIEBwYXJhbSB7bWF0M30gb3V0IG1hdDMgcmVjZWl2aW5nIG9wZXJhdGlvbiByZXN1bHRcbiAqIEBwYXJhbSB7cXVhdH0gcSBRdWF0ZXJuaW9uIHRvIGNyZWF0ZSBtYXRyaXggZnJvbVxuICpcbiAqIEByZXR1cm5zIHttYXQzfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZyb21RdWF0KG91dCwgcSkge1xuICAgIGxldCB4ID0gcVswXSxcbiAgICAgICAgeSA9IHFbMV0sXG4gICAgICAgIHogPSBxWzJdLFxuICAgICAgICB3ID0gcVszXTtcbiAgICBsZXQgeDIgPSB4ICsgeDtcbiAgICBsZXQgeTIgPSB5ICsgeTtcbiAgICBsZXQgejIgPSB6ICsgejtcblxuICAgIGxldCB4eCA9IHggKiB4MjtcbiAgICBsZXQgeXggPSB5ICogeDI7XG4gICAgbGV0IHl5ID0geSAqIHkyO1xuICAgIGxldCB6eCA9IHogKiB4MjtcbiAgICBsZXQgenkgPSB6ICogeTI7XG4gICAgbGV0IHp6ID0geiAqIHoyO1xuICAgIGxldCB3eCA9IHcgKiB4MjtcbiAgICBsZXQgd3kgPSB3ICogeTI7XG4gICAgbGV0IHd6ID0gdyAqIHoyO1xuXG4gICAgb3V0WzBdID0gMSAtIHl5IC0geno7XG4gICAgb3V0WzNdID0geXggLSB3ejtcbiAgICBvdXRbNl0gPSB6eCArIHd5O1xuXG4gICAgb3V0WzFdID0geXggKyB3ejtcbiAgICBvdXRbNF0gPSAxIC0geHggLSB6ejtcbiAgICBvdXRbN10gPSB6eSAtIHd4O1xuXG4gICAgb3V0WzJdID0genggLSB3eTtcbiAgICBvdXRbNV0gPSB6eSArIHd4O1xuICAgIG91dFs4XSA9IDEgLSB4eCAtIHl5O1xuXG4gICAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBDb3B5IHRoZSB2YWx1ZXMgZnJvbSBvbmUgbWF0MyB0byBhbm90aGVyXG4gKlxuICogQHBhcmFtIHttYXQzfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0M30gYSB0aGUgc291cmNlIG1hdHJpeFxuICogQHJldHVybnMge21hdDN9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gY29weShvdXQsIGEpIHtcbiAgICBvdXRbMF0gPSBhWzBdO1xuICAgIG91dFsxXSA9IGFbMV07XG4gICAgb3V0WzJdID0gYVsyXTtcbiAgICBvdXRbM10gPSBhWzNdO1xuICAgIG91dFs0XSA9IGFbNF07XG4gICAgb3V0WzVdID0gYVs1XTtcbiAgICBvdXRbNl0gPSBhWzZdO1xuICAgIG91dFs3XSA9IGFbN107XG4gICAgb3V0WzhdID0gYVs4XTtcbiAgICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFNldCB0aGUgY29tcG9uZW50cyBvZiBhIG1hdDMgdG8gdGhlIGdpdmVuIHZhbHVlc1xuICpcbiAqIEBwYXJhbSB7bWF0M30gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcmV0dXJucyB7bWF0M30gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZXQob3V0LCBtMDAsIG0wMSwgbTAyLCBtMTAsIG0xMSwgbTEyLCBtMjAsIG0yMSwgbTIyKSB7XG4gICAgb3V0WzBdID0gbTAwO1xuICAgIG91dFsxXSA9IG0wMTtcbiAgICBvdXRbMl0gPSBtMDI7XG4gICAgb3V0WzNdID0gbTEwO1xuICAgIG91dFs0XSA9IG0xMTtcbiAgICBvdXRbNV0gPSBtMTI7XG4gICAgb3V0WzZdID0gbTIwO1xuICAgIG91dFs3XSA9IG0yMTtcbiAgICBvdXRbOF0gPSBtMjI7XG4gICAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBTZXQgYSBtYXQzIHRvIHRoZSBpZGVudGl0eSBtYXRyaXhcbiAqXG4gKiBAcGFyYW0ge21hdDN9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHJldHVybnMge21hdDN9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gaWRlbnRpdHkob3V0KSB7XG4gICAgb3V0WzBdID0gMTtcbiAgICBvdXRbMV0gPSAwO1xuICAgIG91dFsyXSA9IDA7XG4gICAgb3V0WzNdID0gMDtcbiAgICBvdXRbNF0gPSAxO1xuICAgIG91dFs1XSA9IDA7XG4gICAgb3V0WzZdID0gMDtcbiAgICBvdXRbN10gPSAwO1xuICAgIG91dFs4XSA9IDE7XG4gICAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBUcmFuc3Bvc2UgdGhlIHZhbHVlcyBvZiBhIG1hdDNcbiAqXG4gKiBAcGFyYW0ge21hdDN9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQzfSBhIHRoZSBzb3VyY2UgbWF0cml4XG4gKiBAcmV0dXJucyB7bWF0M30gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0cmFuc3Bvc2Uob3V0LCBhKSB7XG4gICAgLy8gSWYgd2UgYXJlIHRyYW5zcG9zaW5nIG91cnNlbHZlcyB3ZSBjYW4gc2tpcCBhIGZldyBzdGVwcyBidXQgaGF2ZSB0byBjYWNoZSBzb21lIHZhbHVlc1xuICAgIGlmIChvdXQgPT09IGEpIHtcbiAgICAgICAgbGV0IGEwMSA9IGFbMV0sXG4gICAgICAgICAgICBhMDIgPSBhWzJdLFxuICAgICAgICAgICAgYTEyID0gYVs1XTtcbiAgICAgICAgb3V0WzFdID0gYVszXTtcbiAgICAgICAgb3V0WzJdID0gYVs2XTtcbiAgICAgICAgb3V0WzNdID0gYTAxO1xuICAgICAgICBvdXRbNV0gPSBhWzddO1xuICAgICAgICBvdXRbNl0gPSBhMDI7XG4gICAgICAgIG91dFs3XSA9IGExMjtcbiAgICB9IGVsc2Uge1xuICAgICAgICBvdXRbMF0gPSBhWzBdO1xuICAgICAgICBvdXRbMV0gPSBhWzNdO1xuICAgICAgICBvdXRbMl0gPSBhWzZdO1xuICAgICAgICBvdXRbM10gPSBhWzFdO1xuICAgICAgICBvdXRbNF0gPSBhWzRdO1xuICAgICAgICBvdXRbNV0gPSBhWzddO1xuICAgICAgICBvdXRbNl0gPSBhWzJdO1xuICAgICAgICBvdXRbN10gPSBhWzVdO1xuICAgICAgICBvdXRbOF0gPSBhWzhdO1xuICAgIH1cblxuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogSW52ZXJ0cyBhIG1hdDNcbiAqXG4gKiBAcGFyYW0ge21hdDN9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQzfSBhIHRoZSBzb3VyY2UgbWF0cml4XG4gKiBAcmV0dXJucyB7bWF0M30gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpbnZlcnQob3V0LCBhKSB7XG4gICAgbGV0IGEwMCA9IGFbMF0sXG4gICAgICAgIGEwMSA9IGFbMV0sXG4gICAgICAgIGEwMiA9IGFbMl07XG4gICAgbGV0IGExMCA9IGFbM10sXG4gICAgICAgIGExMSA9IGFbNF0sXG4gICAgICAgIGExMiA9IGFbNV07XG4gICAgbGV0IGEyMCA9IGFbNl0sXG4gICAgICAgIGEyMSA9IGFbN10sXG4gICAgICAgIGEyMiA9IGFbOF07XG5cbiAgICBsZXQgYjAxID0gYTIyICogYTExIC0gYTEyICogYTIxO1xuICAgIGxldCBiMTEgPSAtYTIyICogYTEwICsgYTEyICogYTIwO1xuICAgIGxldCBiMjEgPSBhMjEgKiBhMTAgLSBhMTEgKiBhMjA7XG5cbiAgICAvLyBDYWxjdWxhdGUgdGhlIGRldGVybWluYW50XG4gICAgbGV0IGRldCA9IGEwMCAqIGIwMSArIGEwMSAqIGIxMSArIGEwMiAqIGIyMTtcblxuICAgIGlmICghZGV0KSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBkZXQgPSAxLjAgLyBkZXQ7XG5cbiAgICBvdXRbMF0gPSBiMDEgKiBkZXQ7XG4gICAgb3V0WzFdID0gKC1hMjIgKiBhMDEgKyBhMDIgKiBhMjEpICogZGV0O1xuICAgIG91dFsyXSA9IChhMTIgKiBhMDEgLSBhMDIgKiBhMTEpICogZGV0O1xuICAgIG91dFszXSA9IGIxMSAqIGRldDtcbiAgICBvdXRbNF0gPSAoYTIyICogYTAwIC0gYTAyICogYTIwKSAqIGRldDtcbiAgICBvdXRbNV0gPSAoLWExMiAqIGEwMCArIGEwMiAqIGExMCkgKiBkZXQ7XG4gICAgb3V0WzZdID0gYjIxICogZGV0O1xuICAgIG91dFs3XSA9ICgtYTIxICogYTAwICsgYTAxICogYTIwKSAqIGRldDtcbiAgICBvdXRbOF0gPSAoYTExICogYTAwIC0gYTAxICogYTEwKSAqIGRldDtcbiAgICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGRldGVybWluYW50IG9mIGEgbWF0M1xuICpcbiAqIEBwYXJhbSB7bWF0M30gYSB0aGUgc291cmNlIG1hdHJpeFxuICogQHJldHVybnMge051bWJlcn0gZGV0ZXJtaW5hbnQgb2YgYVxuICovXG5leHBvcnQgZnVuY3Rpb24gZGV0ZXJtaW5hbnQoYSkge1xuICAgIGxldCBhMDAgPSBhWzBdLFxuICAgICAgICBhMDEgPSBhWzFdLFxuICAgICAgICBhMDIgPSBhWzJdO1xuICAgIGxldCBhMTAgPSBhWzNdLFxuICAgICAgICBhMTEgPSBhWzRdLFxuICAgICAgICBhMTIgPSBhWzVdO1xuICAgIGxldCBhMjAgPSBhWzZdLFxuICAgICAgICBhMjEgPSBhWzddLFxuICAgICAgICBhMjIgPSBhWzhdO1xuXG4gICAgcmV0dXJuIGEwMCAqIChhMjIgKiBhMTEgLSBhMTIgKiBhMjEpICsgYTAxICogKC1hMjIgKiBhMTAgKyBhMTIgKiBhMjApICsgYTAyICogKGEyMSAqIGExMCAtIGExMSAqIGEyMCk7XG59XG5cbi8qKlxuICogTXVsdGlwbGllcyB0d28gbWF0MydzXG4gKlxuICogQHBhcmFtIHttYXQzfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0M30gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHttYXQzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge21hdDN9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gbXVsdGlwbHkob3V0LCBhLCBiKSB7XG4gICAgbGV0IGEwMCA9IGFbMF0sXG4gICAgICAgIGEwMSA9IGFbMV0sXG4gICAgICAgIGEwMiA9IGFbMl07XG4gICAgbGV0IGExMCA9IGFbM10sXG4gICAgICAgIGExMSA9IGFbNF0sXG4gICAgICAgIGExMiA9IGFbNV07XG4gICAgbGV0IGEyMCA9IGFbNl0sXG4gICAgICAgIGEyMSA9IGFbN10sXG4gICAgICAgIGEyMiA9IGFbOF07XG5cbiAgICBsZXQgYjAwID0gYlswXSxcbiAgICAgICAgYjAxID0gYlsxXSxcbiAgICAgICAgYjAyID0gYlsyXTtcbiAgICBsZXQgYjEwID0gYlszXSxcbiAgICAgICAgYjExID0gYls0XSxcbiAgICAgICAgYjEyID0gYls1XTtcbiAgICBsZXQgYjIwID0gYls2XSxcbiAgICAgICAgYjIxID0gYls3XSxcbiAgICAgICAgYjIyID0gYls4XTtcblxuICAgIG91dFswXSA9IGIwMCAqIGEwMCArIGIwMSAqIGExMCArIGIwMiAqIGEyMDtcbiAgICBvdXRbMV0gPSBiMDAgKiBhMDEgKyBiMDEgKiBhMTEgKyBiMDIgKiBhMjE7XG4gICAgb3V0WzJdID0gYjAwICogYTAyICsgYjAxICogYTEyICsgYjAyICogYTIyO1xuXG4gICAgb3V0WzNdID0gYjEwICogYTAwICsgYjExICogYTEwICsgYjEyICogYTIwO1xuICAgIG91dFs0XSA9IGIxMCAqIGEwMSArIGIxMSAqIGExMSArIGIxMiAqIGEyMTtcbiAgICBvdXRbNV0gPSBiMTAgKiBhMDIgKyBiMTEgKiBhMTIgKyBiMTIgKiBhMjI7XG5cbiAgICBvdXRbNl0gPSBiMjAgKiBhMDAgKyBiMjEgKiBhMTAgKyBiMjIgKiBhMjA7XG4gICAgb3V0WzddID0gYjIwICogYTAxICsgYjIxICogYTExICsgYjIyICogYTIxO1xuICAgIG91dFs4XSA9IGIyMCAqIGEwMiArIGIyMSAqIGExMiArIGIyMiAqIGEyMjtcbiAgICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFRyYW5zbGF0ZSBhIG1hdDMgYnkgdGhlIGdpdmVuIHZlY3RvclxuICpcbiAqIEBwYXJhbSB7bWF0M30gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDN9IGEgdGhlIG1hdHJpeCB0byB0cmFuc2xhdGVcbiAqIEBwYXJhbSB7dmVjMn0gdiB2ZWN0b3IgdG8gdHJhbnNsYXRlIGJ5XG4gKiBAcmV0dXJucyB7bWF0M30gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0cmFuc2xhdGUob3V0LCBhLCB2KSB7XG4gICAgbGV0IGEwMCA9IGFbMF0sXG4gICAgICAgIGEwMSA9IGFbMV0sXG4gICAgICAgIGEwMiA9IGFbMl0sXG4gICAgICAgIGExMCA9IGFbM10sXG4gICAgICAgIGExMSA9IGFbNF0sXG4gICAgICAgIGExMiA9IGFbNV0sXG4gICAgICAgIGEyMCA9IGFbNl0sXG4gICAgICAgIGEyMSA9IGFbN10sXG4gICAgICAgIGEyMiA9IGFbOF0sXG4gICAgICAgIHggPSB2WzBdLFxuICAgICAgICB5ID0gdlsxXTtcblxuICAgIG91dFswXSA9IGEwMDtcbiAgICBvdXRbMV0gPSBhMDE7XG4gICAgb3V0WzJdID0gYTAyO1xuXG4gICAgb3V0WzNdID0gYTEwO1xuICAgIG91dFs0XSA9IGExMTtcbiAgICBvdXRbNV0gPSBhMTI7XG5cbiAgICBvdXRbNl0gPSB4ICogYTAwICsgeSAqIGExMCArIGEyMDtcbiAgICBvdXRbN10gPSB4ICogYTAxICsgeSAqIGExMSArIGEyMTtcbiAgICBvdXRbOF0gPSB4ICogYTAyICsgeSAqIGExMiArIGEyMjtcbiAgICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFJvdGF0ZXMgYSBtYXQzIGJ5IHRoZSBnaXZlbiBhbmdsZVxuICpcbiAqIEBwYXJhbSB7bWF0M30gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDN9IGEgdGhlIG1hdHJpeCB0byByb3RhdGVcbiAqIEBwYXJhbSB7TnVtYmVyfSByYWQgdGhlIGFuZ2xlIHRvIHJvdGF0ZSB0aGUgbWF0cml4IGJ5XG4gKiBAcmV0dXJucyB7bWF0M30gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByb3RhdGUob3V0LCBhLCByYWQpIHtcbiAgICBsZXQgYTAwID0gYVswXSxcbiAgICAgICAgYTAxID0gYVsxXSxcbiAgICAgICAgYTAyID0gYVsyXSxcbiAgICAgICAgYTEwID0gYVszXSxcbiAgICAgICAgYTExID0gYVs0XSxcbiAgICAgICAgYTEyID0gYVs1XSxcbiAgICAgICAgYTIwID0gYVs2XSxcbiAgICAgICAgYTIxID0gYVs3XSxcbiAgICAgICAgYTIyID0gYVs4XSxcbiAgICAgICAgcyA9IE1hdGguc2luKHJhZCksXG4gICAgICAgIGMgPSBNYXRoLmNvcyhyYWQpO1xuXG4gICAgb3V0WzBdID0gYyAqIGEwMCArIHMgKiBhMTA7XG4gICAgb3V0WzFdID0gYyAqIGEwMSArIHMgKiBhMTE7XG4gICAgb3V0WzJdID0gYyAqIGEwMiArIHMgKiBhMTI7XG5cbiAgICBvdXRbM10gPSBjICogYTEwIC0gcyAqIGEwMDtcbiAgICBvdXRbNF0gPSBjICogYTExIC0gcyAqIGEwMTtcbiAgICBvdXRbNV0gPSBjICogYTEyIC0gcyAqIGEwMjtcblxuICAgIG91dFs2XSA9IGEyMDtcbiAgICBvdXRbN10gPSBhMjE7XG4gICAgb3V0WzhdID0gYTIyO1xuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogU2NhbGVzIHRoZSBtYXQzIGJ5IHRoZSBkaW1lbnNpb25zIGluIHRoZSBnaXZlbiB2ZWMyXG4gKlxuICogQHBhcmFtIHttYXQzfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0M30gYSB0aGUgbWF0cml4IHRvIHJvdGF0ZVxuICogQHBhcmFtIHt2ZWMyfSB2IHRoZSB2ZWMyIHRvIHNjYWxlIHRoZSBtYXRyaXggYnlcbiAqIEByZXR1cm5zIHttYXQzfSBvdXRcbiAqKi9cbmV4cG9ydCBmdW5jdGlvbiBzY2FsZShvdXQsIGEsIHYpIHtcbiAgICBsZXQgeCA9IHZbMF0sXG4gICAgICAgIHkgPSB2WzFdO1xuXG4gICAgb3V0WzBdID0geCAqIGFbMF07XG4gICAgb3V0WzFdID0geCAqIGFbMV07XG4gICAgb3V0WzJdID0geCAqIGFbMl07XG5cbiAgICBvdXRbM10gPSB5ICogYVszXTtcbiAgICBvdXRbNF0gPSB5ICogYVs0XTtcbiAgICBvdXRbNV0gPSB5ICogYVs1XTtcblxuICAgIG91dFs2XSA9IGFbNl07XG4gICAgb3V0WzddID0gYVs3XTtcbiAgICBvdXRbOF0gPSBhWzhdO1xuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogQ2FsY3VsYXRlcyBhIDN4MyBub3JtYWwgbWF0cml4ICh0cmFuc3Bvc2UgaW52ZXJzZSkgZnJvbSB0aGUgNHg0IG1hdHJpeFxuICpcbiAqIEBwYXJhbSB7bWF0M30gb3V0IG1hdDMgcmVjZWl2aW5nIG9wZXJhdGlvbiByZXN1bHRcbiAqIEBwYXJhbSB7bWF0NH0gYSBNYXQ0IHRvIGRlcml2ZSB0aGUgbm9ybWFsIG1hdHJpeCBmcm9tXG4gKlxuICogQHJldHVybnMge21hdDN9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gbm9ybWFsRnJvbU1hdDQob3V0LCBhKSB7XG4gICAgbGV0IGEwMCA9IGFbMF0sXG4gICAgICAgIGEwMSA9IGFbMV0sXG4gICAgICAgIGEwMiA9IGFbMl0sXG4gICAgICAgIGEwMyA9IGFbM107XG4gICAgbGV0IGExMCA9IGFbNF0sXG4gICAgICAgIGExMSA9IGFbNV0sXG4gICAgICAgIGExMiA9IGFbNl0sXG4gICAgICAgIGExMyA9IGFbN107XG4gICAgbGV0IGEyMCA9IGFbOF0sXG4gICAgICAgIGEyMSA9IGFbOV0sXG4gICAgICAgIGEyMiA9IGFbMTBdLFxuICAgICAgICBhMjMgPSBhWzExXTtcbiAgICBsZXQgYTMwID0gYVsxMl0sXG4gICAgICAgIGEzMSA9IGFbMTNdLFxuICAgICAgICBhMzIgPSBhWzE0XSxcbiAgICAgICAgYTMzID0gYVsxNV07XG5cbiAgICBsZXQgYjAwID0gYTAwICogYTExIC0gYTAxICogYTEwO1xuICAgIGxldCBiMDEgPSBhMDAgKiBhMTIgLSBhMDIgKiBhMTA7XG4gICAgbGV0IGIwMiA9IGEwMCAqIGExMyAtIGEwMyAqIGExMDtcbiAgICBsZXQgYjAzID0gYTAxICogYTEyIC0gYTAyICogYTExO1xuICAgIGxldCBiMDQgPSBhMDEgKiBhMTMgLSBhMDMgKiBhMTE7XG4gICAgbGV0IGIwNSA9IGEwMiAqIGExMyAtIGEwMyAqIGExMjtcbiAgICBsZXQgYjA2ID0gYTIwICogYTMxIC0gYTIxICogYTMwO1xuICAgIGxldCBiMDcgPSBhMjAgKiBhMzIgLSBhMjIgKiBhMzA7XG4gICAgbGV0IGIwOCA9IGEyMCAqIGEzMyAtIGEyMyAqIGEzMDtcbiAgICBsZXQgYjA5ID0gYTIxICogYTMyIC0gYTIyICogYTMxO1xuICAgIGxldCBiMTAgPSBhMjEgKiBhMzMgLSBhMjMgKiBhMzE7XG4gICAgbGV0IGIxMSA9IGEyMiAqIGEzMyAtIGEyMyAqIGEzMjtcblxuICAgIC8vIENhbGN1bGF0ZSB0aGUgZGV0ZXJtaW5hbnRcbiAgICBsZXQgZGV0ID0gYjAwICogYjExIC0gYjAxICogYjEwICsgYjAyICogYjA5ICsgYjAzICogYjA4IC0gYjA0ICogYjA3ICsgYjA1ICogYjA2O1xuXG4gICAgaWYgKCFkZXQpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGRldCA9IDEuMCAvIGRldDtcblxuICAgIG91dFswXSA9IChhMTEgKiBiMTEgLSBhMTIgKiBiMTAgKyBhMTMgKiBiMDkpICogZGV0O1xuICAgIG91dFsxXSA9IChhMTIgKiBiMDggLSBhMTAgKiBiMTEgLSBhMTMgKiBiMDcpICogZGV0O1xuICAgIG91dFsyXSA9IChhMTAgKiBiMTAgLSBhMTEgKiBiMDggKyBhMTMgKiBiMDYpICogZGV0O1xuXG4gICAgb3V0WzNdID0gKGEwMiAqIGIxMCAtIGEwMSAqIGIxMSAtIGEwMyAqIGIwOSkgKiBkZXQ7XG4gICAgb3V0WzRdID0gKGEwMCAqIGIxMSAtIGEwMiAqIGIwOCArIGEwMyAqIGIwNykgKiBkZXQ7XG4gICAgb3V0WzVdID0gKGEwMSAqIGIwOCAtIGEwMCAqIGIxMCAtIGEwMyAqIGIwNikgKiBkZXQ7XG5cbiAgICBvdXRbNl0gPSAoYTMxICogYjA1IC0gYTMyICogYjA0ICsgYTMzICogYjAzKSAqIGRldDtcbiAgICBvdXRbN10gPSAoYTMyICogYjAyIC0gYTMwICogYjA1IC0gYTMzICogYjAxKSAqIGRldDtcbiAgICBvdXRbOF0gPSAoYTMwICogYjA0IC0gYTMxICogYjAyICsgYTMzICogYjAwKSAqIGRldDtcblxuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogR2VuZXJhdGVzIGEgMkQgcHJvamVjdGlvbiBtYXRyaXggd2l0aCB0aGUgZ2l2ZW4gYm91bmRzXG4gKlxuICogQHBhcmFtIHttYXQzfSBvdXQgbWF0MyBmcnVzdHVtIG1hdHJpeCB3aWxsIGJlIHdyaXR0ZW4gaW50b1xuICogQHBhcmFtIHtudW1iZXJ9IHdpZHRoIFdpZHRoIG9mIHlvdXIgZ2wgY29udGV4dFxuICogQHBhcmFtIHtudW1iZXJ9IGhlaWdodCBIZWlnaHQgb2YgZ2wgY29udGV4dFxuICogQHJldHVybnMge21hdDN9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gcHJvamVjdGlvbihvdXQsIHdpZHRoLCBoZWlnaHQpIHtcbiAgICBvdXRbMF0gPSAyIC8gd2lkdGg7XG4gICAgb3V0WzFdID0gMDtcbiAgICBvdXRbMl0gPSAwO1xuICAgIG91dFszXSA9IDA7XG4gICAgb3V0WzRdID0gLTIgLyBoZWlnaHQ7XG4gICAgb3V0WzVdID0gMDtcbiAgICBvdXRbNl0gPSAtMTtcbiAgICBvdXRbN10gPSAxO1xuICAgIG91dFs4XSA9IDE7XG4gICAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBBZGRzIHR3byBtYXQzJ3NcbiAqXG4gKiBAcGFyYW0ge21hdDN9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge21hdDN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7bWF0M30gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhZGQob3V0LCBhLCBiKSB7XG4gICAgb3V0WzBdID0gYVswXSArIGJbMF07XG4gICAgb3V0WzFdID0gYVsxXSArIGJbMV07XG4gICAgb3V0WzJdID0gYVsyXSArIGJbMl07XG4gICAgb3V0WzNdID0gYVszXSArIGJbM107XG4gICAgb3V0WzRdID0gYVs0XSArIGJbNF07XG4gICAgb3V0WzVdID0gYVs1XSArIGJbNV07XG4gICAgb3V0WzZdID0gYVs2XSArIGJbNl07XG4gICAgb3V0WzddID0gYVs3XSArIGJbN107XG4gICAgb3V0WzhdID0gYVs4XSArIGJbOF07XG4gICAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBTdWJ0cmFjdHMgbWF0cml4IGIgZnJvbSBtYXRyaXggYVxuICpcbiAqIEBwYXJhbSB7bWF0M30gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7bWF0M30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHttYXQzfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHN1YnRyYWN0KG91dCwgYSwgYikge1xuICAgIG91dFswXSA9IGFbMF0gLSBiWzBdO1xuICAgIG91dFsxXSA9IGFbMV0gLSBiWzFdO1xuICAgIG91dFsyXSA9IGFbMl0gLSBiWzJdO1xuICAgIG91dFszXSA9IGFbM10gLSBiWzNdO1xuICAgIG91dFs0XSA9IGFbNF0gLSBiWzRdO1xuICAgIG91dFs1XSA9IGFbNV0gLSBiWzVdO1xuICAgIG91dFs2XSA9IGFbNl0gLSBiWzZdO1xuICAgIG91dFs3XSA9IGFbN10gLSBiWzddO1xuICAgIG91dFs4XSA9IGFbOF0gLSBiWzhdO1xuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogTXVsdGlwbHkgZWFjaCBlbGVtZW50IG9mIHRoZSBtYXRyaXggYnkgYSBzY2FsYXIuXG4gKlxuICogQHBhcmFtIHttYXQzfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0M30gYSB0aGUgbWF0cml4IHRvIHNjYWxlXG4gKiBAcGFyYW0ge051bWJlcn0gYiBhbW91bnQgdG8gc2NhbGUgdGhlIG1hdHJpeCdzIGVsZW1lbnRzIGJ5XG4gKiBAcmV0dXJucyB7bWF0M30gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtdWx0aXBseVNjYWxhcihvdXQsIGEsIGIpIHtcbiAgICBvdXRbMF0gPSBhWzBdICogYjtcbiAgICBvdXRbMV0gPSBhWzFdICogYjtcbiAgICBvdXRbMl0gPSBhWzJdICogYjtcbiAgICBvdXRbM10gPSBhWzNdICogYjtcbiAgICBvdXRbNF0gPSBhWzRdICogYjtcbiAgICBvdXRbNV0gPSBhWzVdICogYjtcbiAgICBvdXRbNl0gPSBhWzZdICogYjtcbiAgICBvdXRbN10gPSBhWzddICogYjtcbiAgICBvdXRbOF0gPSBhWzhdICogYjtcbiAgICByZXR1cm4gb3V0O1xufVxuIiwiY29uc3QgRVBTSUxPTiA9IDAuMDAwMDAxO1xuXG4vKipcbiAqIENvcHkgdGhlIHZhbHVlcyBmcm9tIG9uZSBtYXQ0IHRvIGFub3RoZXJcbiAqXG4gKiBAcGFyYW0ge21hdDR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQ0fSBhIHRoZSBzb3VyY2UgbWF0cml4XG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb3B5KG91dCwgYSkge1xuICAgIG91dFswXSA9IGFbMF07XG4gICAgb3V0WzFdID0gYVsxXTtcbiAgICBvdXRbMl0gPSBhWzJdO1xuICAgIG91dFszXSA9IGFbM107XG4gICAgb3V0WzRdID0gYVs0XTtcbiAgICBvdXRbNV0gPSBhWzVdO1xuICAgIG91dFs2XSA9IGFbNl07XG4gICAgb3V0WzddID0gYVs3XTtcbiAgICBvdXRbOF0gPSBhWzhdO1xuICAgIG91dFs5XSA9IGFbOV07XG4gICAgb3V0WzEwXSA9IGFbMTBdO1xuICAgIG91dFsxMV0gPSBhWzExXTtcbiAgICBvdXRbMTJdID0gYVsxMl07XG4gICAgb3V0WzEzXSA9IGFbMTNdO1xuICAgIG91dFsxNF0gPSBhWzE0XTtcbiAgICBvdXRbMTVdID0gYVsxNV07XG4gICAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBTZXQgdGhlIGNvbXBvbmVudHMgb2YgYSBtYXQ0IHRvIHRoZSBnaXZlbiB2YWx1ZXNcbiAqXG4gKiBAcGFyYW0ge21hdDR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHJldHVybnMge21hdDR9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gc2V0KG91dCwgbTAwLCBtMDEsIG0wMiwgbTAzLCBtMTAsIG0xMSwgbTEyLCBtMTMsIG0yMCwgbTIxLCBtMjIsIG0yMywgbTMwLCBtMzEsIG0zMiwgbTMzKSB7XG4gICAgb3V0WzBdID0gbTAwO1xuICAgIG91dFsxXSA9IG0wMTtcbiAgICBvdXRbMl0gPSBtMDI7XG4gICAgb3V0WzNdID0gbTAzO1xuICAgIG91dFs0XSA9IG0xMDtcbiAgICBvdXRbNV0gPSBtMTE7XG4gICAgb3V0WzZdID0gbTEyO1xuICAgIG91dFs3XSA9IG0xMztcbiAgICBvdXRbOF0gPSBtMjA7XG4gICAgb3V0WzldID0gbTIxO1xuICAgIG91dFsxMF0gPSBtMjI7XG4gICAgb3V0WzExXSA9IG0yMztcbiAgICBvdXRbMTJdID0gbTMwO1xuICAgIG91dFsxM10gPSBtMzE7XG4gICAgb3V0WzE0XSA9IG0zMjtcbiAgICBvdXRbMTVdID0gbTMzO1xuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogU2V0IGEgbWF0NCB0byB0aGUgaWRlbnRpdHkgbWF0cml4XG4gKlxuICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlkZW50aXR5KG91dCkge1xuICAgIG91dFswXSA9IDE7XG4gICAgb3V0WzFdID0gMDtcbiAgICBvdXRbMl0gPSAwO1xuICAgIG91dFszXSA9IDA7XG4gICAgb3V0WzRdID0gMDtcbiAgICBvdXRbNV0gPSAxO1xuICAgIG91dFs2XSA9IDA7XG4gICAgb3V0WzddID0gMDtcbiAgICBvdXRbOF0gPSAwO1xuICAgIG91dFs5XSA9IDA7XG4gICAgb3V0WzEwXSA9IDE7XG4gICAgb3V0WzExXSA9IDA7XG4gICAgb3V0WzEyXSA9IDA7XG4gICAgb3V0WzEzXSA9IDA7XG4gICAgb3V0WzE0XSA9IDA7XG4gICAgb3V0WzE1XSA9IDE7XG4gICAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBUcmFuc3Bvc2UgdGhlIHZhbHVlcyBvZiBhIG1hdDRcbiAqXG4gKiBAcGFyYW0ge21hdDR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQ0fSBhIHRoZSBzb3VyY2UgbWF0cml4XG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0cmFuc3Bvc2Uob3V0LCBhKSB7XG4gICAgLy8gSWYgd2UgYXJlIHRyYW5zcG9zaW5nIG91cnNlbHZlcyB3ZSBjYW4gc2tpcCBhIGZldyBzdGVwcyBidXQgaGF2ZSB0byBjYWNoZSBzb21lIHZhbHVlc1xuICAgIGlmIChvdXQgPT09IGEpIHtcbiAgICAgICAgbGV0IGEwMSA9IGFbMV0sXG4gICAgICAgICAgICBhMDIgPSBhWzJdLFxuICAgICAgICAgICAgYTAzID0gYVszXTtcbiAgICAgICAgbGV0IGExMiA9IGFbNl0sXG4gICAgICAgICAgICBhMTMgPSBhWzddO1xuICAgICAgICBsZXQgYTIzID0gYVsxMV07XG5cbiAgICAgICAgb3V0WzFdID0gYVs0XTtcbiAgICAgICAgb3V0WzJdID0gYVs4XTtcbiAgICAgICAgb3V0WzNdID0gYVsxMl07XG4gICAgICAgIG91dFs0XSA9IGEwMTtcbiAgICAgICAgb3V0WzZdID0gYVs5XTtcbiAgICAgICAgb3V0WzddID0gYVsxM107XG4gICAgICAgIG91dFs4XSA9IGEwMjtcbiAgICAgICAgb3V0WzldID0gYTEyO1xuICAgICAgICBvdXRbMTFdID0gYVsxNF07XG4gICAgICAgIG91dFsxMl0gPSBhMDM7XG4gICAgICAgIG91dFsxM10gPSBhMTM7XG4gICAgICAgIG91dFsxNF0gPSBhMjM7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgb3V0WzBdID0gYVswXTtcbiAgICAgICAgb3V0WzFdID0gYVs0XTtcbiAgICAgICAgb3V0WzJdID0gYVs4XTtcbiAgICAgICAgb3V0WzNdID0gYVsxMl07XG4gICAgICAgIG91dFs0XSA9IGFbMV07XG4gICAgICAgIG91dFs1XSA9IGFbNV07XG4gICAgICAgIG91dFs2XSA9IGFbOV07XG4gICAgICAgIG91dFs3XSA9IGFbMTNdO1xuICAgICAgICBvdXRbOF0gPSBhWzJdO1xuICAgICAgICBvdXRbOV0gPSBhWzZdO1xuICAgICAgICBvdXRbMTBdID0gYVsxMF07XG4gICAgICAgIG91dFsxMV0gPSBhWzE0XTtcbiAgICAgICAgb3V0WzEyXSA9IGFbM107XG4gICAgICAgIG91dFsxM10gPSBhWzddO1xuICAgICAgICBvdXRbMTRdID0gYVsxMV07XG4gICAgICAgIG91dFsxNV0gPSBhWzE1XTtcbiAgICB9XG5cbiAgICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIEludmVydHMgYSBtYXQ0XG4gKlxuICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0NH0gYSB0aGUgc291cmNlIG1hdHJpeFxuICogQHJldHVybnMge21hdDR9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gaW52ZXJ0KG91dCwgYSkge1xuICAgIGxldCBhMDAgPSBhWzBdLFxuICAgICAgICBhMDEgPSBhWzFdLFxuICAgICAgICBhMDIgPSBhWzJdLFxuICAgICAgICBhMDMgPSBhWzNdO1xuICAgIGxldCBhMTAgPSBhWzRdLFxuICAgICAgICBhMTEgPSBhWzVdLFxuICAgICAgICBhMTIgPSBhWzZdLFxuICAgICAgICBhMTMgPSBhWzddO1xuICAgIGxldCBhMjAgPSBhWzhdLFxuICAgICAgICBhMjEgPSBhWzldLFxuICAgICAgICBhMjIgPSBhWzEwXSxcbiAgICAgICAgYTIzID0gYVsxMV07XG4gICAgbGV0IGEzMCA9IGFbMTJdLFxuICAgICAgICBhMzEgPSBhWzEzXSxcbiAgICAgICAgYTMyID0gYVsxNF0sXG4gICAgICAgIGEzMyA9IGFbMTVdO1xuXG4gICAgbGV0IGIwMCA9IGEwMCAqIGExMSAtIGEwMSAqIGExMDtcbiAgICBsZXQgYjAxID0gYTAwICogYTEyIC0gYTAyICogYTEwO1xuICAgIGxldCBiMDIgPSBhMDAgKiBhMTMgLSBhMDMgKiBhMTA7XG4gICAgbGV0IGIwMyA9IGEwMSAqIGExMiAtIGEwMiAqIGExMTtcbiAgICBsZXQgYjA0ID0gYTAxICogYTEzIC0gYTAzICogYTExO1xuICAgIGxldCBiMDUgPSBhMDIgKiBhMTMgLSBhMDMgKiBhMTI7XG4gICAgbGV0IGIwNiA9IGEyMCAqIGEzMSAtIGEyMSAqIGEzMDtcbiAgICBsZXQgYjA3ID0gYTIwICogYTMyIC0gYTIyICogYTMwO1xuICAgIGxldCBiMDggPSBhMjAgKiBhMzMgLSBhMjMgKiBhMzA7XG4gICAgbGV0IGIwOSA9IGEyMSAqIGEzMiAtIGEyMiAqIGEzMTtcbiAgICBsZXQgYjEwID0gYTIxICogYTMzIC0gYTIzICogYTMxO1xuICAgIGxldCBiMTEgPSBhMjIgKiBhMzMgLSBhMjMgKiBhMzI7XG5cbiAgICAvLyBDYWxjdWxhdGUgdGhlIGRldGVybWluYW50XG4gICAgbGV0IGRldCA9IGIwMCAqIGIxMSAtIGIwMSAqIGIxMCArIGIwMiAqIGIwOSArIGIwMyAqIGIwOCAtIGIwNCAqIGIwNyArIGIwNSAqIGIwNjtcblxuICAgIGlmICghZGV0KSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBkZXQgPSAxLjAgLyBkZXQ7XG5cbiAgICBvdXRbMF0gPSAoYTExICogYjExIC0gYTEyICogYjEwICsgYTEzICogYjA5KSAqIGRldDtcbiAgICBvdXRbMV0gPSAoYTAyICogYjEwIC0gYTAxICogYjExIC0gYTAzICogYjA5KSAqIGRldDtcbiAgICBvdXRbMl0gPSAoYTMxICogYjA1IC0gYTMyICogYjA0ICsgYTMzICogYjAzKSAqIGRldDtcbiAgICBvdXRbM10gPSAoYTIyICogYjA0IC0gYTIxICogYjA1IC0gYTIzICogYjAzKSAqIGRldDtcbiAgICBvdXRbNF0gPSAoYTEyICogYjA4IC0gYTEwICogYjExIC0gYTEzICogYjA3KSAqIGRldDtcbiAgICBvdXRbNV0gPSAoYTAwICogYjExIC0gYTAyICogYjA4ICsgYTAzICogYjA3KSAqIGRldDtcbiAgICBvdXRbNl0gPSAoYTMyICogYjAyIC0gYTMwICogYjA1IC0gYTMzICogYjAxKSAqIGRldDtcbiAgICBvdXRbN10gPSAoYTIwICogYjA1IC0gYTIyICogYjAyICsgYTIzICogYjAxKSAqIGRldDtcbiAgICBvdXRbOF0gPSAoYTEwICogYjEwIC0gYTExICogYjA4ICsgYTEzICogYjA2KSAqIGRldDtcbiAgICBvdXRbOV0gPSAoYTAxICogYjA4IC0gYTAwICogYjEwIC0gYTAzICogYjA2KSAqIGRldDtcbiAgICBvdXRbMTBdID0gKGEzMCAqIGIwNCAtIGEzMSAqIGIwMiArIGEzMyAqIGIwMCkgKiBkZXQ7XG4gICAgb3V0WzExXSA9IChhMjEgKiBiMDIgLSBhMjAgKiBiMDQgLSBhMjMgKiBiMDApICogZGV0O1xuICAgIG91dFsxMl0gPSAoYTExICogYjA3IC0gYTEwICogYjA5IC0gYTEyICogYjA2KSAqIGRldDtcbiAgICBvdXRbMTNdID0gKGEwMCAqIGIwOSAtIGEwMSAqIGIwNyArIGEwMiAqIGIwNikgKiBkZXQ7XG4gICAgb3V0WzE0XSA9IChhMzEgKiBiMDEgLSBhMzAgKiBiMDMgLSBhMzIgKiBiMDApICogZGV0O1xuICAgIG91dFsxNV0gPSAoYTIwICogYjAzIC0gYTIxICogYjAxICsgYTIyICogYjAwKSAqIGRldDtcblxuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgZGV0ZXJtaW5hbnQgb2YgYSBtYXQ0XG4gKlxuICogQHBhcmFtIHttYXQ0fSBhIHRoZSBzb3VyY2UgbWF0cml4XG4gKiBAcmV0dXJucyB7TnVtYmVyfSBkZXRlcm1pbmFudCBvZiBhXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkZXRlcm1pbmFudChhKSB7XG4gICAgbGV0IGEwMCA9IGFbMF0sXG4gICAgICAgIGEwMSA9IGFbMV0sXG4gICAgICAgIGEwMiA9IGFbMl0sXG4gICAgICAgIGEwMyA9IGFbM107XG4gICAgbGV0IGExMCA9IGFbNF0sXG4gICAgICAgIGExMSA9IGFbNV0sXG4gICAgICAgIGExMiA9IGFbNl0sXG4gICAgICAgIGExMyA9IGFbN107XG4gICAgbGV0IGEyMCA9IGFbOF0sXG4gICAgICAgIGEyMSA9IGFbOV0sXG4gICAgICAgIGEyMiA9IGFbMTBdLFxuICAgICAgICBhMjMgPSBhWzExXTtcbiAgICBsZXQgYTMwID0gYVsxMl0sXG4gICAgICAgIGEzMSA9IGFbMTNdLFxuICAgICAgICBhMzIgPSBhWzE0XSxcbiAgICAgICAgYTMzID0gYVsxNV07XG5cbiAgICBsZXQgYjAwID0gYTAwICogYTExIC0gYTAxICogYTEwO1xuICAgIGxldCBiMDEgPSBhMDAgKiBhMTIgLSBhMDIgKiBhMTA7XG4gICAgbGV0IGIwMiA9IGEwMCAqIGExMyAtIGEwMyAqIGExMDtcbiAgICBsZXQgYjAzID0gYTAxICogYTEyIC0gYTAyICogYTExO1xuICAgIGxldCBiMDQgPSBhMDEgKiBhMTMgLSBhMDMgKiBhMTE7XG4gICAgbGV0IGIwNSA9IGEwMiAqIGExMyAtIGEwMyAqIGExMjtcbiAgICBsZXQgYjA2ID0gYTIwICogYTMxIC0gYTIxICogYTMwO1xuICAgIGxldCBiMDcgPSBhMjAgKiBhMzIgLSBhMjIgKiBhMzA7XG4gICAgbGV0IGIwOCA9IGEyMCAqIGEzMyAtIGEyMyAqIGEzMDtcbiAgICBsZXQgYjA5ID0gYTIxICogYTMyIC0gYTIyICogYTMxO1xuICAgIGxldCBiMTAgPSBhMjEgKiBhMzMgLSBhMjMgKiBhMzE7XG4gICAgbGV0IGIxMSA9IGEyMiAqIGEzMyAtIGEyMyAqIGEzMjtcblxuICAgIC8vIENhbGN1bGF0ZSB0aGUgZGV0ZXJtaW5hbnRcbiAgICByZXR1cm4gYjAwICogYjExIC0gYjAxICogYjEwICsgYjAyICogYjA5ICsgYjAzICogYjA4IC0gYjA0ICogYjA3ICsgYjA1ICogYjA2O1xufVxuXG4vKipcbiAqIE11bHRpcGxpZXMgdHdvIG1hdDRzXG4gKlxuICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0NH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHttYXQ0fSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge21hdDR9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gbXVsdGlwbHkob3V0LCBhLCBiKSB7XG4gICAgbGV0IGEwMCA9IGFbMF0sXG4gICAgICAgIGEwMSA9IGFbMV0sXG4gICAgICAgIGEwMiA9IGFbMl0sXG4gICAgICAgIGEwMyA9IGFbM107XG4gICAgbGV0IGExMCA9IGFbNF0sXG4gICAgICAgIGExMSA9IGFbNV0sXG4gICAgICAgIGExMiA9IGFbNl0sXG4gICAgICAgIGExMyA9IGFbN107XG4gICAgbGV0IGEyMCA9IGFbOF0sXG4gICAgICAgIGEyMSA9IGFbOV0sXG4gICAgICAgIGEyMiA9IGFbMTBdLFxuICAgICAgICBhMjMgPSBhWzExXTtcbiAgICBsZXQgYTMwID0gYVsxMl0sXG4gICAgICAgIGEzMSA9IGFbMTNdLFxuICAgICAgICBhMzIgPSBhWzE0XSxcbiAgICAgICAgYTMzID0gYVsxNV07XG5cbiAgICAvLyBDYWNoZSBvbmx5IHRoZSBjdXJyZW50IGxpbmUgb2YgdGhlIHNlY29uZCBtYXRyaXhcbiAgICBsZXQgYjAgPSBiWzBdLFxuICAgICAgICBiMSA9IGJbMV0sXG4gICAgICAgIGIyID0gYlsyXSxcbiAgICAgICAgYjMgPSBiWzNdO1xuICAgIG91dFswXSA9IGIwICogYTAwICsgYjEgKiBhMTAgKyBiMiAqIGEyMCArIGIzICogYTMwO1xuICAgIG91dFsxXSA9IGIwICogYTAxICsgYjEgKiBhMTEgKyBiMiAqIGEyMSArIGIzICogYTMxO1xuICAgIG91dFsyXSA9IGIwICogYTAyICsgYjEgKiBhMTIgKyBiMiAqIGEyMiArIGIzICogYTMyO1xuICAgIG91dFszXSA9IGIwICogYTAzICsgYjEgKiBhMTMgKyBiMiAqIGEyMyArIGIzICogYTMzO1xuXG4gICAgYjAgPSBiWzRdO1xuICAgIGIxID0gYls1XTtcbiAgICBiMiA9IGJbNl07XG4gICAgYjMgPSBiWzddO1xuICAgIG91dFs0XSA9IGIwICogYTAwICsgYjEgKiBhMTAgKyBiMiAqIGEyMCArIGIzICogYTMwO1xuICAgIG91dFs1XSA9IGIwICogYTAxICsgYjEgKiBhMTEgKyBiMiAqIGEyMSArIGIzICogYTMxO1xuICAgIG91dFs2XSA9IGIwICogYTAyICsgYjEgKiBhMTIgKyBiMiAqIGEyMiArIGIzICogYTMyO1xuICAgIG91dFs3XSA9IGIwICogYTAzICsgYjEgKiBhMTMgKyBiMiAqIGEyMyArIGIzICogYTMzO1xuXG4gICAgYjAgPSBiWzhdO1xuICAgIGIxID0gYls5XTtcbiAgICBiMiA9IGJbMTBdO1xuICAgIGIzID0gYlsxMV07XG4gICAgb3V0WzhdID0gYjAgKiBhMDAgKyBiMSAqIGExMCArIGIyICogYTIwICsgYjMgKiBhMzA7XG4gICAgb3V0WzldID0gYjAgKiBhMDEgKyBiMSAqIGExMSArIGIyICogYTIxICsgYjMgKiBhMzE7XG4gICAgb3V0WzEwXSA9IGIwICogYTAyICsgYjEgKiBhMTIgKyBiMiAqIGEyMiArIGIzICogYTMyO1xuICAgIG91dFsxMV0gPSBiMCAqIGEwMyArIGIxICogYTEzICsgYjIgKiBhMjMgKyBiMyAqIGEzMztcblxuICAgIGIwID0gYlsxMl07XG4gICAgYjEgPSBiWzEzXTtcbiAgICBiMiA9IGJbMTRdO1xuICAgIGIzID0gYlsxNV07XG4gICAgb3V0WzEyXSA9IGIwICogYTAwICsgYjEgKiBhMTAgKyBiMiAqIGEyMCArIGIzICogYTMwO1xuICAgIG91dFsxM10gPSBiMCAqIGEwMSArIGIxICogYTExICsgYjIgKiBhMjEgKyBiMyAqIGEzMTtcbiAgICBvdXRbMTRdID0gYjAgKiBhMDIgKyBiMSAqIGExMiArIGIyICogYTIyICsgYjMgKiBhMzI7XG4gICAgb3V0WzE1XSA9IGIwICogYTAzICsgYjEgKiBhMTMgKyBiMiAqIGEyMyArIGIzICogYTMzO1xuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogVHJhbnNsYXRlIGEgbWF0NCBieSB0aGUgZ2l2ZW4gdmVjdG9yXG4gKlxuICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0NH0gYSB0aGUgbWF0cml4IHRvIHRyYW5zbGF0ZVxuICogQHBhcmFtIHt2ZWMzfSB2IHZlY3RvciB0byB0cmFuc2xhdGUgYnlcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRyYW5zbGF0ZShvdXQsIGEsIHYpIHtcbiAgICBsZXQgeCA9IHZbMF0sXG4gICAgICAgIHkgPSB2WzFdLFxuICAgICAgICB6ID0gdlsyXTtcbiAgICBsZXQgYTAwLCBhMDEsIGEwMiwgYTAzO1xuICAgIGxldCBhMTAsIGExMSwgYTEyLCBhMTM7XG4gICAgbGV0IGEyMCwgYTIxLCBhMjIsIGEyMztcblxuICAgIGlmIChhID09PSBvdXQpIHtcbiAgICAgICAgb3V0WzEyXSA9IGFbMF0gKiB4ICsgYVs0XSAqIHkgKyBhWzhdICogeiArIGFbMTJdO1xuICAgICAgICBvdXRbMTNdID0gYVsxXSAqIHggKyBhWzVdICogeSArIGFbOV0gKiB6ICsgYVsxM107XG4gICAgICAgIG91dFsxNF0gPSBhWzJdICogeCArIGFbNl0gKiB5ICsgYVsxMF0gKiB6ICsgYVsxNF07XG4gICAgICAgIG91dFsxNV0gPSBhWzNdICogeCArIGFbN10gKiB5ICsgYVsxMV0gKiB6ICsgYVsxNV07XG4gICAgfSBlbHNlIHtcbiAgICAgICAgYTAwID0gYVswXTtcbiAgICAgICAgYTAxID0gYVsxXTtcbiAgICAgICAgYTAyID0gYVsyXTtcbiAgICAgICAgYTAzID0gYVszXTtcbiAgICAgICAgYTEwID0gYVs0XTtcbiAgICAgICAgYTExID0gYVs1XTtcbiAgICAgICAgYTEyID0gYVs2XTtcbiAgICAgICAgYTEzID0gYVs3XTtcbiAgICAgICAgYTIwID0gYVs4XTtcbiAgICAgICAgYTIxID0gYVs5XTtcbiAgICAgICAgYTIyID0gYVsxMF07XG4gICAgICAgIGEyMyA9IGFbMTFdO1xuXG4gICAgICAgIG91dFswXSA9IGEwMDtcbiAgICAgICAgb3V0WzFdID0gYTAxO1xuICAgICAgICBvdXRbMl0gPSBhMDI7XG4gICAgICAgIG91dFszXSA9IGEwMztcbiAgICAgICAgb3V0WzRdID0gYTEwO1xuICAgICAgICBvdXRbNV0gPSBhMTE7XG4gICAgICAgIG91dFs2XSA9IGExMjtcbiAgICAgICAgb3V0WzddID0gYTEzO1xuICAgICAgICBvdXRbOF0gPSBhMjA7XG4gICAgICAgIG91dFs5XSA9IGEyMTtcbiAgICAgICAgb3V0WzEwXSA9IGEyMjtcbiAgICAgICAgb3V0WzExXSA9IGEyMztcblxuICAgICAgICBvdXRbMTJdID0gYTAwICogeCArIGExMCAqIHkgKyBhMjAgKiB6ICsgYVsxMl07XG4gICAgICAgIG91dFsxM10gPSBhMDEgKiB4ICsgYTExICogeSArIGEyMSAqIHogKyBhWzEzXTtcbiAgICAgICAgb3V0WzE0XSA9IGEwMiAqIHggKyBhMTIgKiB5ICsgYTIyICogeiArIGFbMTRdO1xuICAgICAgICBvdXRbMTVdID0gYTAzICogeCArIGExMyAqIHkgKyBhMjMgKiB6ICsgYVsxNV07XG4gICAgfVxuXG4gICAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBTY2FsZXMgdGhlIG1hdDQgYnkgdGhlIGRpbWVuc2lvbnMgaW4gdGhlIGdpdmVuIHZlYzMgbm90IHVzaW5nIHZlY3Rvcml6YXRpb25cbiAqXG4gKiBAcGFyYW0ge21hdDR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQ0fSBhIHRoZSBtYXRyaXggdG8gc2NhbGVcbiAqIEBwYXJhbSB7dmVjM30gdiB0aGUgdmVjMyB0byBzY2FsZSB0aGUgbWF0cml4IGJ5XG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XG4gKiovXG5leHBvcnQgZnVuY3Rpb24gc2NhbGUob3V0LCBhLCB2KSB7XG4gICAgbGV0IHggPSB2WzBdLFxuICAgICAgICB5ID0gdlsxXSxcbiAgICAgICAgeiA9IHZbMl07XG5cbiAgICBvdXRbMF0gPSBhWzBdICogeDtcbiAgICBvdXRbMV0gPSBhWzFdICogeDtcbiAgICBvdXRbMl0gPSBhWzJdICogeDtcbiAgICBvdXRbM10gPSBhWzNdICogeDtcbiAgICBvdXRbNF0gPSBhWzRdICogeTtcbiAgICBvdXRbNV0gPSBhWzVdICogeTtcbiAgICBvdXRbNl0gPSBhWzZdICogeTtcbiAgICBvdXRbN10gPSBhWzddICogeTtcbiAgICBvdXRbOF0gPSBhWzhdICogejtcbiAgICBvdXRbOV0gPSBhWzldICogejtcbiAgICBvdXRbMTBdID0gYVsxMF0gKiB6O1xuICAgIG91dFsxMV0gPSBhWzExXSAqIHo7XG4gICAgb3V0WzEyXSA9IGFbMTJdO1xuICAgIG91dFsxM10gPSBhWzEzXTtcbiAgICBvdXRbMTRdID0gYVsxNF07XG4gICAgb3V0WzE1XSA9IGFbMTVdO1xuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogUm90YXRlcyBhIG1hdDQgYnkgdGhlIGdpdmVuIGFuZ2xlIGFyb3VuZCB0aGUgZ2l2ZW4gYXhpc1xuICpcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDR9IGEgdGhlIG1hdHJpeCB0byByb3RhdGVcbiAqIEBwYXJhbSB7TnVtYmVyfSByYWQgdGhlIGFuZ2xlIHRvIHJvdGF0ZSB0aGUgbWF0cml4IGJ5XG4gKiBAcGFyYW0ge3ZlYzN9IGF4aXMgdGhlIGF4aXMgdG8gcm90YXRlIGFyb3VuZFxuICogQHJldHVybnMge21hdDR9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gcm90YXRlKG91dCwgYSwgcmFkLCBheGlzKSB7XG4gICAgbGV0IHggPSBheGlzWzBdLFxuICAgICAgICB5ID0gYXhpc1sxXSxcbiAgICAgICAgeiA9IGF4aXNbMl07XG4gICAgbGV0IGxlbiA9IE1hdGguaHlwb3QoeCwgeSwgeik7XG4gICAgbGV0IHMsIGMsIHQ7XG4gICAgbGV0IGEwMCwgYTAxLCBhMDIsIGEwMztcbiAgICBsZXQgYTEwLCBhMTEsIGExMiwgYTEzO1xuICAgIGxldCBhMjAsIGEyMSwgYTIyLCBhMjM7XG4gICAgbGV0IGIwMCwgYjAxLCBiMDI7XG4gICAgbGV0IGIxMCwgYjExLCBiMTI7XG4gICAgbGV0IGIyMCwgYjIxLCBiMjI7XG5cbiAgICBpZiAoTWF0aC5hYnMobGVuKSA8IEVQU0lMT04pIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgbGVuID0gMSAvIGxlbjtcbiAgICB4ICo9IGxlbjtcbiAgICB5ICo9IGxlbjtcbiAgICB6ICo9IGxlbjtcblxuICAgIHMgPSBNYXRoLnNpbihyYWQpO1xuICAgIGMgPSBNYXRoLmNvcyhyYWQpO1xuICAgIHQgPSAxIC0gYztcblxuICAgIGEwMCA9IGFbMF07XG4gICAgYTAxID0gYVsxXTtcbiAgICBhMDIgPSBhWzJdO1xuICAgIGEwMyA9IGFbM107XG4gICAgYTEwID0gYVs0XTtcbiAgICBhMTEgPSBhWzVdO1xuICAgIGExMiA9IGFbNl07XG4gICAgYTEzID0gYVs3XTtcbiAgICBhMjAgPSBhWzhdO1xuICAgIGEyMSA9IGFbOV07XG4gICAgYTIyID0gYVsxMF07XG4gICAgYTIzID0gYVsxMV07XG5cbiAgICAvLyBDb25zdHJ1Y3QgdGhlIGVsZW1lbnRzIG9mIHRoZSByb3RhdGlvbiBtYXRyaXhcbiAgICBiMDAgPSB4ICogeCAqIHQgKyBjO1xuICAgIGIwMSA9IHkgKiB4ICogdCArIHogKiBzO1xuICAgIGIwMiA9IHogKiB4ICogdCAtIHkgKiBzO1xuICAgIGIxMCA9IHggKiB5ICogdCAtIHogKiBzO1xuICAgIGIxMSA9IHkgKiB5ICogdCArIGM7XG4gICAgYjEyID0geiAqIHkgKiB0ICsgeCAqIHM7XG4gICAgYjIwID0geCAqIHogKiB0ICsgeSAqIHM7XG4gICAgYjIxID0geSAqIHogKiB0IC0geCAqIHM7XG4gICAgYjIyID0geiAqIHogKiB0ICsgYztcblxuICAgIC8vIFBlcmZvcm0gcm90YXRpb24tc3BlY2lmaWMgbWF0cml4IG11bHRpcGxpY2F0aW9uXG4gICAgb3V0WzBdID0gYTAwICogYjAwICsgYTEwICogYjAxICsgYTIwICogYjAyO1xuICAgIG91dFsxXSA9IGEwMSAqIGIwMCArIGExMSAqIGIwMSArIGEyMSAqIGIwMjtcbiAgICBvdXRbMl0gPSBhMDIgKiBiMDAgKyBhMTIgKiBiMDEgKyBhMjIgKiBiMDI7XG4gICAgb3V0WzNdID0gYTAzICogYjAwICsgYTEzICogYjAxICsgYTIzICogYjAyO1xuICAgIG91dFs0XSA9IGEwMCAqIGIxMCArIGExMCAqIGIxMSArIGEyMCAqIGIxMjtcbiAgICBvdXRbNV0gPSBhMDEgKiBiMTAgKyBhMTEgKiBiMTEgKyBhMjEgKiBiMTI7XG4gICAgb3V0WzZdID0gYTAyICogYjEwICsgYTEyICogYjExICsgYTIyICogYjEyO1xuICAgIG91dFs3XSA9IGEwMyAqIGIxMCArIGExMyAqIGIxMSArIGEyMyAqIGIxMjtcbiAgICBvdXRbOF0gPSBhMDAgKiBiMjAgKyBhMTAgKiBiMjEgKyBhMjAgKiBiMjI7XG4gICAgb3V0WzldID0gYTAxICogYjIwICsgYTExICogYjIxICsgYTIxICogYjIyO1xuICAgIG91dFsxMF0gPSBhMDIgKiBiMjAgKyBhMTIgKiBiMjEgKyBhMjIgKiBiMjI7XG4gICAgb3V0WzExXSA9IGEwMyAqIGIyMCArIGExMyAqIGIyMSArIGEyMyAqIGIyMjtcblxuICAgIGlmIChhICE9PSBvdXQpIHtcbiAgICAgICAgLy8gSWYgdGhlIHNvdXJjZSBhbmQgZGVzdGluYXRpb24gZGlmZmVyLCBjb3B5IHRoZSB1bmNoYW5nZWQgbGFzdCByb3dcbiAgICAgICAgb3V0WzEyXSA9IGFbMTJdO1xuICAgICAgICBvdXRbMTNdID0gYVsxM107XG4gICAgICAgIG91dFsxNF0gPSBhWzE0XTtcbiAgICAgICAgb3V0WzE1XSA9IGFbMTVdO1xuICAgIH1cbiAgICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIHRyYW5zbGF0aW9uIHZlY3RvciBjb21wb25lbnQgb2YgYSB0cmFuc2Zvcm1hdGlvblxuICogIG1hdHJpeC4gSWYgYSBtYXRyaXggaXMgYnVpbHQgd2l0aCBmcm9tUm90YXRpb25UcmFuc2xhdGlvbixcbiAqICB0aGUgcmV0dXJuZWQgdmVjdG9yIHdpbGwgYmUgdGhlIHNhbWUgYXMgdGhlIHRyYW5zbGF0aW9uIHZlY3RvclxuICogIG9yaWdpbmFsbHkgc3VwcGxpZWQuXG4gKiBAcGFyYW0gIHt2ZWMzfSBvdXQgVmVjdG9yIHRvIHJlY2VpdmUgdHJhbnNsYXRpb24gY29tcG9uZW50XG4gKiBAcGFyYW0gIHttYXQ0fSBtYXQgTWF0cml4IHRvIGJlIGRlY29tcG9zZWQgKGlucHV0KVxuICogQHJldHVybiB7dmVjM30gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRUcmFuc2xhdGlvbihvdXQsIG1hdCkge1xuICAgIG91dFswXSA9IG1hdFsxMl07XG4gICAgb3V0WzFdID0gbWF0WzEzXTtcbiAgICBvdXRbMl0gPSBtYXRbMTRdO1xuXG4gICAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBzY2FsaW5nIGZhY3RvciBjb21wb25lbnQgb2YgYSB0cmFuc2Zvcm1hdGlvblxuICogIG1hdHJpeC4gSWYgYSBtYXRyaXggaXMgYnVpbHQgd2l0aCBmcm9tUm90YXRpb25UcmFuc2xhdGlvblNjYWxlXG4gKiAgd2l0aCBhIG5vcm1hbGl6ZWQgUXVhdGVybmlvbiBwYXJhbXRlciwgdGhlIHJldHVybmVkIHZlY3RvciB3aWxsIGJlXG4gKiAgdGhlIHNhbWUgYXMgdGhlIHNjYWxpbmcgdmVjdG9yXG4gKiAgb3JpZ2luYWxseSBzdXBwbGllZC5cbiAqIEBwYXJhbSAge3ZlYzN9IG91dCBWZWN0b3IgdG8gcmVjZWl2ZSBzY2FsaW5nIGZhY3RvciBjb21wb25lbnRcbiAqIEBwYXJhbSAge21hdDR9IG1hdCBNYXRyaXggdG8gYmUgZGVjb21wb3NlZCAoaW5wdXQpXG4gKiBAcmV0dXJuIHt2ZWMzfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFNjYWxpbmcob3V0LCBtYXQpIHtcbiAgICBsZXQgbTExID0gbWF0WzBdO1xuICAgIGxldCBtMTIgPSBtYXRbMV07XG4gICAgbGV0IG0xMyA9IG1hdFsyXTtcbiAgICBsZXQgbTIxID0gbWF0WzRdO1xuICAgIGxldCBtMjIgPSBtYXRbNV07XG4gICAgbGV0IG0yMyA9IG1hdFs2XTtcbiAgICBsZXQgbTMxID0gbWF0WzhdO1xuICAgIGxldCBtMzIgPSBtYXRbOV07XG4gICAgbGV0IG0zMyA9IG1hdFsxMF07XG5cbiAgICBvdXRbMF0gPSBNYXRoLmh5cG90KG0xMSwgbTEyLCBtMTMpO1xuICAgIG91dFsxXSA9IE1hdGguaHlwb3QobTIxLCBtMjIsIG0yMyk7XG4gICAgb3V0WzJdID0gTWF0aC5oeXBvdChtMzEsIG0zMiwgbTMzKTtcblxuICAgIHJldHVybiBvdXQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRNYXhTY2FsZU9uQXhpcyhtYXQpIHtcbiAgICBsZXQgbTExID0gbWF0WzBdO1xuICAgIGxldCBtMTIgPSBtYXRbMV07XG4gICAgbGV0IG0xMyA9IG1hdFsyXTtcbiAgICBsZXQgbTIxID0gbWF0WzRdO1xuICAgIGxldCBtMjIgPSBtYXRbNV07XG4gICAgbGV0IG0yMyA9IG1hdFs2XTtcbiAgICBsZXQgbTMxID0gbWF0WzhdO1xuICAgIGxldCBtMzIgPSBtYXRbOV07XG4gICAgbGV0IG0zMyA9IG1hdFsxMF07XG5cbiAgICBjb25zdCB4ID0gbTExICogbTExICsgbTEyICogbTEyICsgbTEzICogbTEzO1xuICAgIGNvbnN0IHkgPSBtMjEgKiBtMjEgKyBtMjIgKiBtMjIgKyBtMjMgKiBtMjM7XG4gICAgY29uc3QgeiA9IG0zMSAqIG0zMSArIG0zMiAqIG0zMiArIG0zMyAqIG0zMztcblxuICAgIHJldHVybiBNYXRoLnNxcnQoTWF0aC5tYXgoeCwgeSwgeikpO1xufVxuXG4vKipcbiAqIFJldHVybnMgYSBxdWF0ZXJuaW9uIHJlcHJlc2VudGluZyB0aGUgcm90YXRpb25hbCBjb21wb25lbnRcbiAqICBvZiBhIHRyYW5zZm9ybWF0aW9uIG1hdHJpeC4gSWYgYSBtYXRyaXggaXMgYnVpbHQgd2l0aFxuICogIGZyb21Sb3RhdGlvblRyYW5zbGF0aW9uLCB0aGUgcmV0dXJuZWQgcXVhdGVybmlvbiB3aWxsIGJlIHRoZVxuICogIHNhbWUgYXMgdGhlIHF1YXRlcm5pb24gb3JpZ2luYWxseSBzdXBwbGllZC5cbiAqIEBwYXJhbSB7cXVhdH0gb3V0IFF1YXRlcm5pb24gdG8gcmVjZWl2ZSB0aGUgcm90YXRpb24gY29tcG9uZW50XG4gKiBAcGFyYW0ge21hdDR9IG1hdCBNYXRyaXggdG8gYmUgZGVjb21wb3NlZCAoaW5wdXQpXG4gKiBAcmV0dXJuIHtxdWF0fSBvdXRcbiAqL1xuZXhwb3J0IGNvbnN0IGdldFJvdGF0aW9uID0gKGZ1bmN0aW9uICgpIHtcbiAgICBjb25zdCB0ZW1wID0gWzAsIDAsIDBdO1xuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIChvdXQsIG1hdCkge1xuICAgICAgICBsZXQgc2NhbGluZyA9IHRlbXA7XG4gICAgICAgIGdldFNjYWxpbmcoc2NhbGluZywgbWF0KTtcblxuICAgICAgICBsZXQgaXMxID0gMSAvIHNjYWxpbmdbMF07XG4gICAgICAgIGxldCBpczIgPSAxIC8gc2NhbGluZ1sxXTtcbiAgICAgICAgbGV0IGlzMyA9IDEgLyBzY2FsaW5nWzJdO1xuXG4gICAgICAgIGxldCBzbTExID0gbWF0WzBdICogaXMxO1xuICAgICAgICBsZXQgc20xMiA9IG1hdFsxXSAqIGlzMjtcbiAgICAgICAgbGV0IHNtMTMgPSBtYXRbMl0gKiBpczM7XG4gICAgICAgIGxldCBzbTIxID0gbWF0WzRdICogaXMxO1xuICAgICAgICBsZXQgc20yMiA9IG1hdFs1XSAqIGlzMjtcbiAgICAgICAgbGV0IHNtMjMgPSBtYXRbNl0gKiBpczM7XG4gICAgICAgIGxldCBzbTMxID0gbWF0WzhdICogaXMxO1xuICAgICAgICBsZXQgc20zMiA9IG1hdFs5XSAqIGlzMjtcbiAgICAgICAgbGV0IHNtMzMgPSBtYXRbMTBdICogaXMzO1xuXG4gICAgICAgIGxldCB0cmFjZSA9IHNtMTEgKyBzbTIyICsgc20zMztcbiAgICAgICAgbGV0IFMgPSAwO1xuXG4gICAgICAgIGlmICh0cmFjZSA+IDApIHtcbiAgICAgICAgICAgIFMgPSBNYXRoLnNxcnQodHJhY2UgKyAxLjApICogMjtcbiAgICAgICAgICAgIG91dFszXSA9IDAuMjUgKiBTO1xuICAgICAgICAgICAgb3V0WzBdID0gKHNtMjMgLSBzbTMyKSAvIFM7XG4gICAgICAgICAgICBvdXRbMV0gPSAoc20zMSAtIHNtMTMpIC8gUztcbiAgICAgICAgICAgIG91dFsyXSA9IChzbTEyIC0gc20yMSkgLyBTO1xuICAgICAgICB9IGVsc2UgaWYgKHNtMTEgPiBzbTIyICYmIHNtMTEgPiBzbTMzKSB7XG4gICAgICAgICAgICBTID0gTWF0aC5zcXJ0KDEuMCArIHNtMTEgLSBzbTIyIC0gc20zMykgKiAyO1xuICAgICAgICAgICAgb3V0WzNdID0gKHNtMjMgLSBzbTMyKSAvIFM7XG4gICAgICAgICAgICBvdXRbMF0gPSAwLjI1ICogUztcbiAgICAgICAgICAgIG91dFsxXSA9IChzbTEyICsgc20yMSkgLyBTO1xuICAgICAgICAgICAgb3V0WzJdID0gKHNtMzEgKyBzbTEzKSAvIFM7XG4gICAgICAgIH0gZWxzZSBpZiAoc20yMiA+IHNtMzMpIHtcbiAgICAgICAgICAgIFMgPSBNYXRoLnNxcnQoMS4wICsgc20yMiAtIHNtMTEgLSBzbTMzKSAqIDI7XG4gICAgICAgICAgICBvdXRbM10gPSAoc20zMSAtIHNtMTMpIC8gUztcbiAgICAgICAgICAgIG91dFswXSA9IChzbTEyICsgc20yMSkgLyBTO1xuICAgICAgICAgICAgb3V0WzFdID0gMC4yNSAqIFM7XG4gICAgICAgICAgICBvdXRbMl0gPSAoc20yMyArIHNtMzIpIC8gUztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIFMgPSBNYXRoLnNxcnQoMS4wICsgc20zMyAtIHNtMTEgLSBzbTIyKSAqIDI7XG4gICAgICAgICAgICBvdXRbM10gPSAoc20xMiAtIHNtMjEpIC8gUztcbiAgICAgICAgICAgIG91dFswXSA9IChzbTMxICsgc20xMykgLyBTO1xuICAgICAgICAgICAgb3V0WzFdID0gKHNtMjMgKyBzbTMyKSAvIFM7XG4gICAgICAgICAgICBvdXRbMl0gPSAwLjI1ICogUztcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBvdXQ7XG4gICAgfTtcbn0pKCk7XG5cbi8qKlxuICogQ3JlYXRlcyBhIG1hdHJpeCBmcm9tIGEgcXVhdGVybmlvbiByb3RhdGlvbiwgdmVjdG9yIHRyYW5zbGF0aW9uIGFuZCB2ZWN0b3Igc2NhbGVcbiAqIFRoaXMgaXMgZXF1aXZhbGVudCB0byAoYnV0IG11Y2ggZmFzdGVyIHRoYW4pOlxuICpcbiAqICAgICBtYXQ0LmlkZW50aXR5KGRlc3QpO1xuICogICAgIG1hdDQudHJhbnNsYXRlKGRlc3QsIHZlYyk7XG4gKiAgICAgbGV0IHF1YXRNYXQgPSBtYXQ0LmNyZWF0ZSgpO1xuICogICAgIHF1YXQ0LnRvTWF0NChxdWF0LCBxdWF0TWF0KTtcbiAqICAgICBtYXQ0Lm11bHRpcGx5KGRlc3QsIHF1YXRNYXQpO1xuICogICAgIG1hdDQuc2NhbGUoZGVzdCwgc2NhbGUpXG4gKlxuICogQHBhcmFtIHttYXQ0fSBvdXQgbWF0NCByZWNlaXZpbmcgb3BlcmF0aW9uIHJlc3VsdFxuICogQHBhcmFtIHtxdWF0NH0gcSBSb3RhdGlvbiBxdWF0ZXJuaW9uXG4gKiBAcGFyYW0ge3ZlYzN9IHYgVHJhbnNsYXRpb24gdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzN9IHMgU2NhbGluZyB2ZWN0b3JcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZyb21Sb3RhdGlvblRyYW5zbGF0aW9uU2NhbGUob3V0LCBxLCB2LCBzKSB7XG4gICAgLy8gUXVhdGVybmlvbiBtYXRoXG4gICAgbGV0IHggPSBxWzBdLFxuICAgICAgICB5ID0gcVsxXSxcbiAgICAgICAgeiA9IHFbMl0sXG4gICAgICAgIHcgPSBxWzNdO1xuICAgIGxldCB4MiA9IHggKyB4O1xuICAgIGxldCB5MiA9IHkgKyB5O1xuICAgIGxldCB6MiA9IHogKyB6O1xuXG4gICAgbGV0IHh4ID0geCAqIHgyO1xuICAgIGxldCB4eSA9IHggKiB5MjtcbiAgICBsZXQgeHogPSB4ICogejI7XG4gICAgbGV0IHl5ID0geSAqIHkyO1xuICAgIGxldCB5eiA9IHkgKiB6MjtcbiAgICBsZXQgenogPSB6ICogejI7XG4gICAgbGV0IHd4ID0gdyAqIHgyO1xuICAgIGxldCB3eSA9IHcgKiB5MjtcbiAgICBsZXQgd3ogPSB3ICogejI7XG4gICAgbGV0IHN4ID0gc1swXTtcbiAgICBsZXQgc3kgPSBzWzFdO1xuICAgIGxldCBzeiA9IHNbMl07XG5cbiAgICBvdXRbMF0gPSAoMSAtICh5eSArIHp6KSkgKiBzeDtcbiAgICBvdXRbMV0gPSAoeHkgKyB3eikgKiBzeDtcbiAgICBvdXRbMl0gPSAoeHogLSB3eSkgKiBzeDtcbiAgICBvdXRbM10gPSAwO1xuICAgIG91dFs0XSA9ICh4eSAtIHd6KSAqIHN5O1xuICAgIG91dFs1XSA9ICgxIC0gKHh4ICsgenopKSAqIHN5O1xuICAgIG91dFs2XSA9ICh5eiArIHd4KSAqIHN5O1xuICAgIG91dFs3XSA9IDA7XG4gICAgb3V0WzhdID0gKHh6ICsgd3kpICogc3o7XG4gICAgb3V0WzldID0gKHl6IC0gd3gpICogc3o7XG4gICAgb3V0WzEwXSA9ICgxIC0gKHh4ICsgeXkpKSAqIHN6O1xuICAgIG91dFsxMV0gPSAwO1xuICAgIG91dFsxMl0gPSB2WzBdO1xuICAgIG91dFsxM10gPSB2WzFdO1xuICAgIG91dFsxNF0gPSB2WzJdO1xuICAgIG91dFsxNV0gPSAxO1xuXG4gICAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBDYWxjdWxhdGVzIGEgNHg0IG1hdHJpeCBmcm9tIHRoZSBnaXZlbiBxdWF0ZXJuaW9uXG4gKlxuICogQHBhcmFtIHttYXQ0fSBvdXQgbWF0NCByZWNlaXZpbmcgb3BlcmF0aW9uIHJlc3VsdFxuICogQHBhcmFtIHtxdWF0fSBxIFF1YXRlcm5pb24gdG8gY3JlYXRlIG1hdHJpeCBmcm9tXG4gKlxuICogQHJldHVybnMge21hdDR9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gZnJvbVF1YXQob3V0LCBxKSB7XG4gICAgbGV0IHggPSBxWzBdLFxuICAgICAgICB5ID0gcVsxXSxcbiAgICAgICAgeiA9IHFbMl0sXG4gICAgICAgIHcgPSBxWzNdO1xuICAgIGxldCB4MiA9IHggKyB4O1xuICAgIGxldCB5MiA9IHkgKyB5O1xuICAgIGxldCB6MiA9IHogKyB6O1xuXG4gICAgbGV0IHh4ID0geCAqIHgyO1xuICAgIGxldCB5eCA9IHkgKiB4MjtcbiAgICBsZXQgeXkgPSB5ICogeTI7XG4gICAgbGV0IHp4ID0geiAqIHgyO1xuICAgIGxldCB6eSA9IHogKiB5MjtcbiAgICBsZXQgenogPSB6ICogejI7XG4gICAgbGV0IHd4ID0gdyAqIHgyO1xuICAgIGxldCB3eSA9IHcgKiB5MjtcbiAgICBsZXQgd3ogPSB3ICogejI7XG5cbiAgICBvdXRbMF0gPSAxIC0geXkgLSB6ejtcbiAgICBvdXRbMV0gPSB5eCArIHd6O1xuICAgIG91dFsyXSA9IHp4IC0gd3k7XG4gICAgb3V0WzNdID0gMDtcblxuICAgIG91dFs0XSA9IHl4IC0gd3o7XG4gICAgb3V0WzVdID0gMSAtIHh4IC0geno7XG4gICAgb3V0WzZdID0genkgKyB3eDtcbiAgICBvdXRbN10gPSAwO1xuXG4gICAgb3V0WzhdID0genggKyB3eTtcbiAgICBvdXRbOV0gPSB6eSAtIHd4O1xuICAgIG91dFsxMF0gPSAxIC0geHggLSB5eTtcbiAgICBvdXRbMTFdID0gMDtcblxuICAgIG91dFsxMl0gPSAwO1xuICAgIG91dFsxM10gPSAwO1xuICAgIG91dFsxNF0gPSAwO1xuICAgIG91dFsxNV0gPSAxO1xuXG4gICAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBHZW5lcmF0ZXMgYSBwZXJzcGVjdGl2ZSBwcm9qZWN0aW9uIG1hdHJpeCB3aXRoIHRoZSBnaXZlbiBib3VuZHNcbiAqXG4gKiBAcGFyYW0ge21hdDR9IG91dCBtYXQ0IGZydXN0dW0gbWF0cml4IHdpbGwgYmUgd3JpdHRlbiBpbnRvXG4gKiBAcGFyYW0ge251bWJlcn0gbGVmdCBWZXJ0aWNhbCBmaWVsZCBvZiB2aWV3IGluIHJhZGlhbnNcbiAqIEBwYXJhbSB7bnVtYmVyfSByaWdodCBBc3BlY3QgcmF0aW8uIHR5cGljYWxseSB2aWV3cG9ydCB3aWR0aC9oZWlnaHRcbiAqIEBwYXJhbSB7bnVtYmVyfSB0b3AgVmVydGljYWwgZmllbGQgb2YgdmlldyBpbiByYWRpYW5zXG4gKiBAcGFyYW0ge251bWJlcn0gYm90dG9tIEFzcGVjdCByYXRpby4gdHlwaWNhbGx5IHZpZXdwb3J0IHdpZHRoL2hlaWdodFxuICogQHBhcmFtIHtudW1iZXJ9IG5lYXIgTmVhciBib3VuZCBvZiB0aGUgZnJ1c3R1bVxuICogQHBhcmFtIHtudW1iZXJ9IGZhciBGYXIgYm91bmQgb2YgdGhlIGZydXN0dW1cbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBlcnNwZWN0aXZlRnJ1c3RydW0ob3V0LCBsZWZ0LCByaWdodCwgdG9wLCBib3R0b20sIG5lYXIsIGZhcikge1xuICAgIHZhciB4ID0gMiAqIG5lYXIgLyAoIHJpZ2h0IC0gbGVmdCApO1xuICAgIHZhciB5ID0gMiAqIG5lYXIgLyAoIHRvcCAtIGJvdHRvbSApO1xuXG4gICAgdmFyIGEgPSAoIHJpZ2h0ICsgbGVmdCApIC8gKCByaWdodCAtIGxlZnQgKTtcbiAgICB2YXIgYiA9ICggdG9wICsgYm90dG9tICkgLyAoIHRvcCAtIGJvdHRvbSApO1xuICAgIHZhciBjID0gLSAoIGZhciArIG5lYXIgKSAvICggZmFyIC0gbmVhciApO1xuICAgIHZhciBkID0gLSAyICogZmFyICogbmVhciAvICggZmFyIC0gbmVhciApO1xuXG4gICAgb3V0WyAwIF0gPSB4O1x0b3V0WyA0IF0gPSAwO1x0b3V0WyA4IF0gPSBhO1x0b3V0WyAxMiBdID0gMDtcbiAgICBvdXRbIDEgXSA9IDA7XHRvdXRbIDUgXSA9IHk7XHRvdXRbIDkgXSA9IGI7XHRvdXRbIDEzIF0gPSAwO1xuICAgIG91dFsgMiBdID0gMDtcdG91dFsgNiBdID0gMDtcdG91dFsgMTAgXSA9IGM7XHRvdXRbIDE0IF0gPSBkO1xuICAgIG91dFsgMyBdID0gMDtcdG91dFsgNyBdID0gMDtcdG91dFsgMTEgXSA9IC0gMTtcdG91dFsgMTUgXSA9IDA7XG5cbiAgICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIEdlbmVyYXRlcyBhIHBlcnNwZWN0aXZlIHByb2plY3Rpb24gbWF0cml4IHdpdGggdGhlIGdpdmVuIGJvdW5kc1xuICpcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IG1hdDQgZnJ1c3R1bSBtYXRyaXggd2lsbCBiZSB3cml0dGVuIGludG9cbiAqIEBwYXJhbSB7bnVtYmVyfSBmb3Z5IFZlcnRpY2FsIGZpZWxkIG9mIHZpZXcgaW4gcmFkaWFuc1xuICogQHBhcmFtIHtudW1iZXJ9IGFzcGVjdCBBc3BlY3QgcmF0aW8uIHR5cGljYWxseSB2aWV3cG9ydCB3aWR0aC9oZWlnaHRcbiAqIEBwYXJhbSB7bnVtYmVyfSBuZWFyIE5lYXIgYm91bmQgb2YgdGhlIGZydXN0dW1cbiAqIEBwYXJhbSB7bnVtYmVyfSBmYXIgRmFyIGJvdW5kIG9mIHRoZSBmcnVzdHVtXG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwZXJzcGVjdGl2ZShvdXQsIGZvdnksIGFzcGVjdCwgbmVhciwgZmFyKSB7XG4gICAgbGV0IGYgPSAxLjAgLyBNYXRoLnRhbihmb3Z5IC8gMik7XG4gICAgbGV0IG5mID0gMSAvIChuZWFyIC0gZmFyKTtcbiAgICBvdXRbMF0gPSBmIC8gYXNwZWN0O1xuICAgIG91dFsxXSA9IDA7XG4gICAgb3V0WzJdID0gMDtcbiAgICBvdXRbM10gPSAwO1xuICAgIG91dFs0XSA9IDA7XG4gICAgb3V0WzVdID0gZjtcbiAgICBvdXRbNl0gPSAwO1xuICAgIG91dFs3XSA9IDA7XG4gICAgb3V0WzhdID0gMDtcbiAgICBvdXRbOV0gPSAwO1xuICAgIG91dFsxMF0gPSAoZmFyICsgbmVhcikgKiBuZjtcbiAgICBvdXRbMTFdID0gLTE7XG4gICAgb3V0WzEyXSA9IDA7XG4gICAgb3V0WzEzXSA9IDA7XG4gICAgb3V0WzE0XSA9IDIgKiBmYXIgKiBuZWFyICogbmY7XG4gICAgb3V0WzE1XSA9IDA7XG4gICAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBHZW5lcmF0ZXMgYSBvcnRob2dvbmFsIHByb2plY3Rpb24gbWF0cml4IHdpdGggdGhlIGdpdmVuIGJvdW5kc1xuICpcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IG1hdDQgZnJ1c3R1bSBtYXRyaXggd2lsbCBiZSB3cml0dGVuIGludG9cbiAqIEBwYXJhbSB7bnVtYmVyfSBsZWZ0IExlZnQgYm91bmQgb2YgdGhlIGZydXN0dW1cbiAqIEBwYXJhbSB7bnVtYmVyfSByaWdodCBSaWdodCBib3VuZCBvZiB0aGUgZnJ1c3R1bVxuICogQHBhcmFtIHtudW1iZXJ9IGJvdHRvbSBCb3R0b20gYm91bmQgb2YgdGhlIGZydXN0dW1cbiAqIEBwYXJhbSB7bnVtYmVyfSB0b3AgVG9wIGJvdW5kIG9mIHRoZSBmcnVzdHVtXG4gKiBAcGFyYW0ge251bWJlcn0gbmVhciBOZWFyIGJvdW5kIG9mIHRoZSBmcnVzdHVtXG4gKiBAcGFyYW0ge251bWJlcn0gZmFyIEZhciBib3VuZCBvZiB0aGUgZnJ1c3R1bVxuICogQHJldHVybnMge21hdDR9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gb3J0aG8ob3V0LCBsZWZ0LCByaWdodCwgYm90dG9tLCB0b3AsIG5lYXIsIGZhcikge1xuICAgIGxldCBsciA9IDEgLyAobGVmdCAtIHJpZ2h0KTtcbiAgICBsZXQgYnQgPSAxIC8gKGJvdHRvbSAtIHRvcCk7XG4gICAgbGV0IG5mID0gMSAvIChuZWFyIC0gZmFyKTtcbiAgICBvdXRbMF0gPSAtMiAqIGxyO1xuICAgIG91dFsxXSA9IDA7XG4gICAgb3V0WzJdID0gMDtcbiAgICBvdXRbM10gPSAwO1xuICAgIG91dFs0XSA9IDA7XG4gICAgb3V0WzVdID0gLTIgKiBidDtcbiAgICBvdXRbNl0gPSAwO1xuICAgIG91dFs3XSA9IDA7XG4gICAgb3V0WzhdID0gMDtcbiAgICBvdXRbOV0gPSAwO1xuICAgIG91dFsxMF0gPSAyICogbmY7XG4gICAgb3V0WzExXSA9IDA7XG4gICAgb3V0WzEyXSA9IChsZWZ0ICsgcmlnaHQpICogbHI7XG4gICAgb3V0WzEzXSA9ICh0b3AgKyBib3R0b20pICogYnQ7XG4gICAgb3V0WzE0XSA9IChmYXIgKyBuZWFyKSAqIG5mO1xuICAgIG91dFsxNV0gPSAxO1xuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogR2VuZXJhdGVzIGEgbWF0cml4IHRoYXQgbWFrZXMgc29tZXRoaW5nIGxvb2sgYXQgc29tZXRoaW5nIGVsc2UuXG4gKlxuICogQHBhcmFtIHttYXQ0fSBvdXQgbWF0NCBmcnVzdHVtIG1hdHJpeCB3aWxsIGJlIHdyaXR0ZW4gaW50b1xuICogQHBhcmFtIHt2ZWMzfSBleWUgUG9zaXRpb24gb2YgdGhlIHZpZXdlclxuICogQHBhcmFtIHt2ZWMzfSB0YXJnZXQgUG9pbnQgdGhlIHZpZXdlciBpcyBsb29raW5nIGF0XG4gKiBAcGFyYW0ge3ZlYzN9IHVwIHZlYzMgcG9pbnRpbmcgdXBcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRhcmdldFRvKG91dCwgZXllLCB0YXJnZXQsIHVwKSB7XG4gICAgbGV0IGV5ZXggPSBleWVbMF0sXG4gICAgICAgIGV5ZXkgPSBleWVbMV0sXG4gICAgICAgIGV5ZXogPSBleWVbMl0sXG4gICAgICAgIHVweCA9IHVwWzBdLFxuICAgICAgICB1cHkgPSB1cFsxXSxcbiAgICAgICAgdXB6ID0gdXBbMl07XG5cbiAgICBsZXQgejAgPSBleWV4IC0gdGFyZ2V0WzBdLFxuICAgICAgICB6MSA9IGV5ZXkgLSB0YXJnZXRbMV0sXG4gICAgICAgIHoyID0gZXlleiAtIHRhcmdldFsyXTtcblxuICAgIGxldCBsZW4gPSB6MCAqIHowICsgejEgKiB6MSArIHoyICogejI7XG4gICAgaWYgKGxlbiA9PT0gMCkge1xuICAgICAgICAvLyBleWUgYW5kIHRhcmdldCBhcmUgaW4gdGhlIHNhbWUgcG9zaXRpb25cbiAgICAgICAgejIgPSAxO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGxlbiA9IDEgLyBNYXRoLnNxcnQobGVuKTtcbiAgICAgICAgejAgKj0gbGVuO1xuICAgICAgICB6MSAqPSBsZW47XG4gICAgICAgIHoyICo9IGxlbjtcbiAgICB9XG5cbiAgICBsZXQgeDAgPSB1cHkgKiB6MiAtIHVweiAqIHoxLFxuICAgICAgICB4MSA9IHVweiAqIHowIC0gdXB4ICogejIsXG4gICAgICAgIHgyID0gdXB4ICogejEgLSB1cHkgKiB6MDtcblxuICAgIGxlbiA9IHgwICogeDAgKyB4MSAqIHgxICsgeDIgKiB4MjtcbiAgICBpZiAobGVuID09PSAwKSB7XG4gICAgICAgIC8vIHVwIGFuZCB6IGFyZSBwYXJhbGxlbFxuICAgICAgICBpZiAodXB6KSB7XG4gICAgICAgICAgICB1cHggKz0gMWUtNjtcbiAgICAgICAgfSBlbHNlIGlmICh1cHkpIHtcbiAgICAgICAgICAgIHVweiArPSAxZS02O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdXB5ICs9IDFlLTY7XG4gICAgICAgIH1cbiAgICAgICAgKHgwID0gdXB5ICogejIgLSB1cHogKiB6MSksICh4MSA9IHVweiAqIHowIC0gdXB4ICogejIpLCAoeDIgPSB1cHggKiB6MSAtIHVweSAqIHowKTtcblxuICAgICAgICBsZW4gPSB4MCAqIHgwICsgeDEgKiB4MSArIHgyICogeDI7XG4gICAgfVxuXG4gICAgbGVuID0gMSAvIE1hdGguc3FydChsZW4pO1xuICAgIHgwICo9IGxlbjtcbiAgICB4MSAqPSBsZW47XG4gICAgeDIgKj0gbGVuO1xuXG4gICAgb3V0WzBdID0geDA7XG4gICAgb3V0WzFdID0geDE7XG4gICAgb3V0WzJdID0geDI7XG4gICAgb3V0WzNdID0gMDtcbiAgICBvdXRbNF0gPSB6MSAqIHgyIC0gejIgKiB4MTtcbiAgICBvdXRbNV0gPSB6MiAqIHgwIC0gejAgKiB4MjtcbiAgICBvdXRbNl0gPSB6MCAqIHgxIC0gejEgKiB4MDtcbiAgICBvdXRbN10gPSAwO1xuICAgIG91dFs4XSA9IHowO1xuICAgIG91dFs5XSA9IHoxO1xuICAgIG91dFsxMF0gPSB6MjtcbiAgICBvdXRbMTFdID0gMDtcbiAgICBvdXRbMTJdID0gZXlleDtcbiAgICBvdXRbMTNdID0gZXlleTtcbiAgICBvdXRbMTRdID0gZXllejtcbiAgICBvdXRbMTVdID0gMTtcbiAgICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIEFkZHMgdHdvIG1hdDQnc1xuICpcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7bWF0NH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFkZChvdXQsIGEsIGIpIHtcbiAgICBvdXRbMF0gPSBhWzBdICsgYlswXTtcbiAgICBvdXRbMV0gPSBhWzFdICsgYlsxXTtcbiAgICBvdXRbMl0gPSBhWzJdICsgYlsyXTtcbiAgICBvdXRbM10gPSBhWzNdICsgYlszXTtcbiAgICBvdXRbNF0gPSBhWzRdICsgYls0XTtcbiAgICBvdXRbNV0gPSBhWzVdICsgYls1XTtcbiAgICBvdXRbNl0gPSBhWzZdICsgYls2XTtcbiAgICBvdXRbN10gPSBhWzddICsgYls3XTtcbiAgICBvdXRbOF0gPSBhWzhdICsgYls4XTtcbiAgICBvdXRbOV0gPSBhWzldICsgYls5XTtcbiAgICBvdXRbMTBdID0gYVsxMF0gKyBiWzEwXTtcbiAgICBvdXRbMTFdID0gYVsxMV0gKyBiWzExXTtcbiAgICBvdXRbMTJdID0gYVsxMl0gKyBiWzEyXTtcbiAgICBvdXRbMTNdID0gYVsxM10gKyBiWzEzXTtcbiAgICBvdXRbMTRdID0gYVsxNF0gKyBiWzE0XTtcbiAgICBvdXRbMTVdID0gYVsxNV0gKyBiWzE1XTtcbiAgICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFN1YnRyYWN0cyBtYXRyaXggYiBmcm9tIG1hdHJpeCBhXG4gKlxuICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0NH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHttYXQ0fSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge21hdDR9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gc3VidHJhY3Qob3V0LCBhLCBiKSB7XG4gICAgb3V0WzBdID0gYVswXSAtIGJbMF07XG4gICAgb3V0WzFdID0gYVsxXSAtIGJbMV07XG4gICAgb3V0WzJdID0gYVsyXSAtIGJbMl07XG4gICAgb3V0WzNdID0gYVszXSAtIGJbM107XG4gICAgb3V0WzRdID0gYVs0XSAtIGJbNF07XG4gICAgb3V0WzVdID0gYVs1XSAtIGJbNV07XG4gICAgb3V0WzZdID0gYVs2XSAtIGJbNl07XG4gICAgb3V0WzddID0gYVs3XSAtIGJbN107XG4gICAgb3V0WzhdID0gYVs4XSAtIGJbOF07XG4gICAgb3V0WzldID0gYVs5XSAtIGJbOV07XG4gICAgb3V0WzEwXSA9IGFbMTBdIC0gYlsxMF07XG4gICAgb3V0WzExXSA9IGFbMTFdIC0gYlsxMV07XG4gICAgb3V0WzEyXSA9IGFbMTJdIC0gYlsxMl07XG4gICAgb3V0WzEzXSA9IGFbMTNdIC0gYlsxM107XG4gICAgb3V0WzE0XSA9IGFbMTRdIC0gYlsxNF07XG4gICAgb3V0WzE1XSA9IGFbMTVdIC0gYlsxNV07XG4gICAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBNdWx0aXBseSBlYWNoIGVsZW1lbnQgb2YgdGhlIG1hdHJpeCBieSBhIHNjYWxhci5cbiAqXG4gKiBAcGFyYW0ge21hdDR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQ0fSBhIHRoZSBtYXRyaXggdG8gc2NhbGVcbiAqIEBwYXJhbSB7TnVtYmVyfSBiIGFtb3VudCB0byBzY2FsZSB0aGUgbWF0cml4J3MgZWxlbWVudHMgYnlcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG11bHRpcGx5U2NhbGFyKG91dCwgYSwgYikge1xuICAgIG91dFswXSA9IGFbMF0gKiBiO1xuICAgIG91dFsxXSA9IGFbMV0gKiBiO1xuICAgIG91dFsyXSA9IGFbMl0gKiBiO1xuICAgIG91dFszXSA9IGFbM10gKiBiO1xuICAgIG91dFs0XSA9IGFbNF0gKiBiO1xuICAgIG91dFs1XSA9IGFbNV0gKiBiO1xuICAgIG91dFs2XSA9IGFbNl0gKiBiO1xuICAgIG91dFs3XSA9IGFbN10gKiBiO1xuICAgIG91dFs4XSA9IGFbOF0gKiBiO1xuICAgIG91dFs5XSA9IGFbOV0gKiBiO1xuICAgIG91dFsxMF0gPSBhWzEwXSAqIGI7XG4gICAgb3V0WzExXSA9IGFbMTFdICogYjtcbiAgICBvdXRbMTJdID0gYVsxMl0gKiBiO1xuICAgIG91dFsxM10gPSBhWzEzXSAqIGI7XG4gICAgb3V0WzE0XSA9IGFbMTRdICogYjtcbiAgICBvdXRbMTVdID0gYVsxNV0gKiBiO1xuICAgIHJldHVybiBvdXQ7XG59XG4iLCJpbXBvcnQgKiBhcyB2ZWM0IGZyb20gJy4vVmVjNEZ1bmMuanMnO1xuXG4vKipcbiAqIFNldCBhIHF1YXQgdG8gdGhlIGlkZW50aXR5IHF1YXRlcm5pb25cbiAqXG4gKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cbiAqIEByZXR1cm5zIHtxdWF0fSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlkZW50aXR5KG91dCkge1xuICAgIG91dFswXSA9IDA7XG4gICAgb3V0WzFdID0gMDtcbiAgICBvdXRbMl0gPSAwO1xuICAgIG91dFszXSA9IDE7XG4gICAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBTZXRzIGEgcXVhdCBmcm9tIHRoZSBnaXZlbiBhbmdsZSBhbmQgcm90YXRpb24gYXhpcyxcbiAqIHRoZW4gcmV0dXJucyBpdC5cbiAqXG4gKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cbiAqIEBwYXJhbSB7dmVjM30gYXhpcyB0aGUgYXhpcyBhcm91bmQgd2hpY2ggdG8gcm90YXRlXG4gKiBAcGFyYW0ge051bWJlcn0gcmFkIHRoZSBhbmdsZSBpbiByYWRpYW5zXG4gKiBAcmV0dXJucyB7cXVhdH0gb3V0XG4gKiovXG5leHBvcnQgZnVuY3Rpb24gc2V0QXhpc0FuZ2xlKG91dCwgYXhpcywgcmFkKSB7XG4gICAgcmFkID0gcmFkICogMC41O1xuICAgIGxldCBzID0gTWF0aC5zaW4ocmFkKTtcbiAgICBvdXRbMF0gPSBzICogYXhpc1swXTtcbiAgICBvdXRbMV0gPSBzICogYXhpc1sxXTtcbiAgICBvdXRbMl0gPSBzICogYXhpc1syXTtcbiAgICBvdXRbM10gPSBNYXRoLmNvcyhyYWQpO1xuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogTXVsdGlwbGllcyB0d28gcXVhdHNcbiAqXG4gKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cbiAqIEBwYXJhbSB7cXVhdH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHtxdWF0fSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge3F1YXR9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gbXVsdGlwbHkob3V0LCBhLCBiKSB7XG4gICAgbGV0IGF4ID0gYVswXSxcbiAgICAgICAgYXkgPSBhWzFdLFxuICAgICAgICBheiA9IGFbMl0sXG4gICAgICAgIGF3ID0gYVszXTtcbiAgICBsZXQgYnggPSBiWzBdLFxuICAgICAgICBieSA9IGJbMV0sXG4gICAgICAgIGJ6ID0gYlsyXSxcbiAgICAgICAgYncgPSBiWzNdO1xuXG4gICAgb3V0WzBdID0gYXggKiBidyArIGF3ICogYnggKyBheSAqIGJ6IC0gYXogKiBieTtcbiAgICBvdXRbMV0gPSBheSAqIGJ3ICsgYXcgKiBieSArIGF6ICogYnggLSBheCAqIGJ6O1xuICAgIG91dFsyXSA9IGF6ICogYncgKyBhdyAqIGJ6ICsgYXggKiBieSAtIGF5ICogYng7XG4gICAgb3V0WzNdID0gYXcgKiBidyAtIGF4ICogYnggLSBheSAqIGJ5IC0gYXogKiBiejtcbiAgICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFJvdGF0ZXMgYSBxdWF0ZXJuaW9uIGJ5IHRoZSBnaXZlbiBhbmdsZSBhYm91dCB0aGUgWCBheGlzXG4gKlxuICogQHBhcmFtIHtxdWF0fSBvdXQgcXVhdCByZWNlaXZpbmcgb3BlcmF0aW9uIHJlc3VsdFxuICogQHBhcmFtIHtxdWF0fSBhIHF1YXQgdG8gcm90YXRlXG4gKiBAcGFyYW0ge251bWJlcn0gcmFkIGFuZ2xlIChpbiByYWRpYW5zKSB0byByb3RhdGVcbiAqIEByZXR1cm5zIHtxdWF0fSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJvdGF0ZVgob3V0LCBhLCByYWQpIHtcbiAgICByYWQgKj0gMC41O1xuXG4gICAgbGV0IGF4ID0gYVswXSxcbiAgICAgICAgYXkgPSBhWzFdLFxuICAgICAgICBheiA9IGFbMl0sXG4gICAgICAgIGF3ID0gYVszXTtcbiAgICBsZXQgYnggPSBNYXRoLnNpbihyYWQpLFxuICAgICAgICBidyA9IE1hdGguY29zKHJhZCk7XG5cbiAgICBvdXRbMF0gPSBheCAqIGJ3ICsgYXcgKiBieDtcbiAgICBvdXRbMV0gPSBheSAqIGJ3ICsgYXogKiBieDtcbiAgICBvdXRbMl0gPSBheiAqIGJ3IC0gYXkgKiBieDtcbiAgICBvdXRbM10gPSBhdyAqIGJ3IC0gYXggKiBieDtcbiAgICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFJvdGF0ZXMgYSBxdWF0ZXJuaW9uIGJ5IHRoZSBnaXZlbiBhbmdsZSBhYm91dCB0aGUgWSBheGlzXG4gKlxuICogQHBhcmFtIHtxdWF0fSBvdXQgcXVhdCByZWNlaXZpbmcgb3BlcmF0aW9uIHJlc3VsdFxuICogQHBhcmFtIHtxdWF0fSBhIHF1YXQgdG8gcm90YXRlXG4gKiBAcGFyYW0ge251bWJlcn0gcmFkIGFuZ2xlIChpbiByYWRpYW5zKSB0byByb3RhdGVcbiAqIEByZXR1cm5zIHtxdWF0fSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJvdGF0ZVkob3V0LCBhLCByYWQpIHtcbiAgICByYWQgKj0gMC41O1xuXG4gICAgbGV0IGF4ID0gYVswXSxcbiAgICAgICAgYXkgPSBhWzFdLFxuICAgICAgICBheiA9IGFbMl0sXG4gICAgICAgIGF3ID0gYVszXTtcbiAgICBsZXQgYnkgPSBNYXRoLnNpbihyYWQpLFxuICAgICAgICBidyA9IE1hdGguY29zKHJhZCk7XG5cbiAgICBvdXRbMF0gPSBheCAqIGJ3IC0gYXogKiBieTtcbiAgICBvdXRbMV0gPSBheSAqIGJ3ICsgYXcgKiBieTtcbiAgICBvdXRbMl0gPSBheiAqIGJ3ICsgYXggKiBieTtcbiAgICBvdXRbM10gPSBhdyAqIGJ3IC0gYXkgKiBieTtcbiAgICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFJvdGF0ZXMgYSBxdWF0ZXJuaW9uIGJ5IHRoZSBnaXZlbiBhbmdsZSBhYm91dCB0aGUgWiBheGlzXG4gKlxuICogQHBhcmFtIHtxdWF0fSBvdXQgcXVhdCByZWNlaXZpbmcgb3BlcmF0aW9uIHJlc3VsdFxuICogQHBhcmFtIHtxdWF0fSBhIHF1YXQgdG8gcm90YXRlXG4gKiBAcGFyYW0ge251bWJlcn0gcmFkIGFuZ2xlIChpbiByYWRpYW5zKSB0byByb3RhdGVcbiAqIEByZXR1cm5zIHtxdWF0fSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJvdGF0ZVoob3V0LCBhLCByYWQpIHtcbiAgICByYWQgKj0gMC41O1xuXG4gICAgbGV0IGF4ID0gYVswXSxcbiAgICAgICAgYXkgPSBhWzFdLFxuICAgICAgICBheiA9IGFbMl0sXG4gICAgICAgIGF3ID0gYVszXTtcbiAgICBsZXQgYnogPSBNYXRoLnNpbihyYWQpLFxuICAgICAgICBidyA9IE1hdGguY29zKHJhZCk7XG5cbiAgICBvdXRbMF0gPSBheCAqIGJ3ICsgYXkgKiBiejtcbiAgICBvdXRbMV0gPSBheSAqIGJ3IC0gYXggKiBiejtcbiAgICBvdXRbMl0gPSBheiAqIGJ3ICsgYXcgKiBiejtcbiAgICBvdXRbM10gPSBhdyAqIGJ3IC0gYXogKiBiejtcbiAgICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFBlcmZvcm1zIGEgc3BoZXJpY2FsIGxpbmVhciBpbnRlcnBvbGF0aW9uIGJldHdlZW4gdHdvIHF1YXRcbiAqXG4gKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cbiAqIEBwYXJhbSB7cXVhdH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHtxdWF0fSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHBhcmFtIHtOdW1iZXJ9IHQgaW50ZXJwb2xhdGlvbiBhbW91bnQgYmV0d2VlbiB0aGUgdHdvIGlucHV0c1xuICogQHJldHVybnMge3F1YXR9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gc2xlcnAob3V0LCBhLCBiLCB0KSB7XG4gICAgLy8gYmVuY2htYXJrczpcbiAgICAvLyAgICBodHRwOi8vanNwZXJmLmNvbS9xdWF0ZXJuaW9uLXNsZXJwLWltcGxlbWVudGF0aW9uc1xuICAgIGxldCBheCA9IGFbMF0sXG4gICAgICAgIGF5ID0gYVsxXSxcbiAgICAgICAgYXogPSBhWzJdLFxuICAgICAgICBhdyA9IGFbM107XG4gICAgbGV0IGJ4ID0gYlswXSxcbiAgICAgICAgYnkgPSBiWzFdLFxuICAgICAgICBieiA9IGJbMl0sXG4gICAgICAgIGJ3ID0gYlszXTtcblxuICAgIGxldCBvbWVnYSwgY29zb20sIHNpbm9tLCBzY2FsZTAsIHNjYWxlMTtcblxuICAgIC8vIGNhbGMgY29zaW5lXG4gICAgY29zb20gPSBheCAqIGJ4ICsgYXkgKiBieSArIGF6ICogYnogKyBhdyAqIGJ3O1xuICAgIC8vIGFkanVzdCBzaWducyAoaWYgbmVjZXNzYXJ5KVxuICAgIGlmIChjb3NvbSA8IDAuMCkge1xuICAgICAgICBjb3NvbSA9IC1jb3NvbTtcbiAgICAgICAgYnggPSAtYng7XG4gICAgICAgIGJ5ID0gLWJ5O1xuICAgICAgICBieiA9IC1iejtcbiAgICAgICAgYncgPSAtYnc7XG4gICAgfVxuICAgIC8vIGNhbGN1bGF0ZSBjb2VmZmljaWVudHNcbiAgICBpZiAoMS4wIC0gY29zb20gPiAwLjAwMDAwMSkge1xuICAgICAgICAvLyBzdGFuZGFyZCBjYXNlIChzbGVycClcbiAgICAgICAgb21lZ2EgPSBNYXRoLmFjb3MoY29zb20pO1xuICAgICAgICBzaW5vbSA9IE1hdGguc2luKG9tZWdhKTtcbiAgICAgICAgc2NhbGUwID0gTWF0aC5zaW4oKDEuMCAtIHQpICogb21lZ2EpIC8gc2lub207XG4gICAgICAgIHNjYWxlMSA9IE1hdGguc2luKHQgKiBvbWVnYSkgLyBzaW5vbTtcbiAgICB9IGVsc2Uge1xuICAgICAgICAvLyBcImZyb21cIiBhbmQgXCJ0b1wiIHF1YXRlcm5pb25zIGFyZSB2ZXJ5IGNsb3NlXG4gICAgICAgIC8vICAuLi4gc28gd2UgY2FuIGRvIGEgbGluZWFyIGludGVycG9sYXRpb25cbiAgICAgICAgc2NhbGUwID0gMS4wIC0gdDtcbiAgICAgICAgc2NhbGUxID0gdDtcbiAgICB9XG4gICAgLy8gY2FsY3VsYXRlIGZpbmFsIHZhbHVlc1xuICAgIG91dFswXSA9IHNjYWxlMCAqIGF4ICsgc2NhbGUxICogYng7XG4gICAgb3V0WzFdID0gc2NhbGUwICogYXkgKyBzY2FsZTEgKiBieTtcbiAgICBvdXRbMl0gPSBzY2FsZTAgKiBheiArIHNjYWxlMSAqIGJ6O1xuICAgIG91dFszXSA9IHNjYWxlMCAqIGF3ICsgc2NhbGUxICogYnc7XG5cbiAgICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGludmVyc2Ugb2YgYSBxdWF0XG4gKlxuICogQHBhcmFtIHtxdWF0fSBvdXQgdGhlIHJlY2VpdmluZyBxdWF0ZXJuaW9uXG4gKiBAcGFyYW0ge3F1YXR9IGEgcXVhdCB0byBjYWxjdWxhdGUgaW52ZXJzZSBvZlxuICogQHJldHVybnMge3F1YXR9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gaW52ZXJ0KG91dCwgYSkge1xuICAgIGxldCBhMCA9IGFbMF0sXG4gICAgICAgIGExID0gYVsxXSxcbiAgICAgICAgYTIgPSBhWzJdLFxuICAgICAgICBhMyA9IGFbM107XG4gICAgbGV0IGRvdCA9IGEwICogYTAgKyBhMSAqIGExICsgYTIgKiBhMiArIGEzICogYTM7XG4gICAgbGV0IGludkRvdCA9IGRvdCA/IDEuMCAvIGRvdCA6IDA7XG5cbiAgICAvLyBUT0RPOiBXb3VsZCBiZSBmYXN0ZXIgdG8gcmV0dXJuIFswLDAsMCwwXSBpbW1lZGlhdGVseSBpZiBkb3QgPT0gMFxuXG4gICAgb3V0WzBdID0gLWEwICogaW52RG90O1xuICAgIG91dFsxXSA9IC1hMSAqIGludkRvdDtcbiAgICBvdXRbMl0gPSAtYTIgKiBpbnZEb3Q7XG4gICAgb3V0WzNdID0gYTMgKiBpbnZEb3Q7XG4gICAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBjb25qdWdhdGUgb2YgYSBxdWF0XG4gKiBJZiB0aGUgcXVhdGVybmlvbiBpcyBub3JtYWxpemVkLCB0aGlzIGZ1bmN0aW9uIGlzIGZhc3RlciB0aGFuIHF1YXQuaW52ZXJzZSBhbmQgcHJvZHVjZXMgdGhlIHNhbWUgcmVzdWx0LlxuICpcbiAqIEBwYXJhbSB7cXVhdH0gb3V0IHRoZSByZWNlaXZpbmcgcXVhdGVybmlvblxuICogQHBhcmFtIHtxdWF0fSBhIHF1YXQgdG8gY2FsY3VsYXRlIGNvbmp1Z2F0ZSBvZlxuICogQHJldHVybnMge3F1YXR9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gY29uanVnYXRlKG91dCwgYSkge1xuICAgIG91dFswXSA9IC1hWzBdO1xuICAgIG91dFsxXSA9IC1hWzFdO1xuICAgIG91dFsyXSA9IC1hWzJdO1xuICAgIG91dFszXSA9IGFbM107XG4gICAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgcXVhdGVybmlvbiBmcm9tIHRoZSBnaXZlbiAzeDMgcm90YXRpb24gbWF0cml4LlxuICpcbiAqIE5PVEU6IFRoZSByZXN1bHRhbnQgcXVhdGVybmlvbiBpcyBub3Qgbm9ybWFsaXplZCwgc28geW91IHNob3VsZCBiZSBzdXJlXG4gKiB0byByZW5vcm1hbGl6ZSB0aGUgcXVhdGVybmlvbiB5b3Vyc2VsZiB3aGVyZSBuZWNlc3NhcnkuXG4gKlxuICogQHBhcmFtIHtxdWF0fSBvdXQgdGhlIHJlY2VpdmluZyBxdWF0ZXJuaW9uXG4gKiBAcGFyYW0ge21hdDN9IG0gcm90YXRpb24gbWF0cml4XG4gKiBAcmV0dXJucyB7cXVhdH0gb3V0XG4gKiBAZnVuY3Rpb25cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZyb21NYXQzKG91dCwgbSkge1xuICAgIC8vIEFsZ29yaXRobSBpbiBLZW4gU2hvZW1ha2UncyBhcnRpY2xlIGluIDE5ODcgU0lHR1JBUEggY291cnNlIG5vdGVzXG4gICAgLy8gYXJ0aWNsZSBcIlF1YXRlcm5pb24gQ2FsY3VsdXMgYW5kIEZhc3QgQW5pbWF0aW9uXCIuXG4gICAgbGV0IGZUcmFjZSA9IG1bMF0gKyBtWzRdICsgbVs4XTtcbiAgICBsZXQgZlJvb3Q7XG5cbiAgICBpZiAoZlRyYWNlID4gMC4wKSB7XG4gICAgICAgIC8vIHx3fCA+IDEvMiwgbWF5IGFzIHdlbGwgY2hvb3NlIHcgPiAxLzJcbiAgICAgICAgZlJvb3QgPSBNYXRoLnNxcnQoZlRyYWNlICsgMS4wKTsgLy8gMndcbiAgICAgICAgb3V0WzNdID0gMC41ICogZlJvb3Q7XG4gICAgICAgIGZSb290ID0gMC41IC8gZlJvb3Q7IC8vIDEvKDR3KVxuICAgICAgICBvdXRbMF0gPSAobVs1XSAtIG1bN10pICogZlJvb3Q7XG4gICAgICAgIG91dFsxXSA9IChtWzZdIC0gbVsyXSkgKiBmUm9vdDtcbiAgICAgICAgb3V0WzJdID0gKG1bMV0gLSBtWzNdKSAqIGZSb290O1xuICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIHx3fCA8PSAxLzJcbiAgICAgICAgbGV0IGkgPSAwO1xuICAgICAgICBpZiAobVs0XSA+IG1bMF0pIGkgPSAxO1xuICAgICAgICBpZiAobVs4XSA+IG1baSAqIDMgKyBpXSkgaSA9IDI7XG4gICAgICAgIGxldCBqID0gKGkgKyAxKSAlIDM7XG4gICAgICAgIGxldCBrID0gKGkgKyAyKSAlIDM7XG5cbiAgICAgICAgZlJvb3QgPSBNYXRoLnNxcnQobVtpICogMyArIGldIC0gbVtqICogMyArIGpdIC0gbVtrICogMyArIGtdICsgMS4wKTtcbiAgICAgICAgb3V0W2ldID0gMC41ICogZlJvb3Q7XG4gICAgICAgIGZSb290ID0gMC41IC8gZlJvb3Q7XG4gICAgICAgIG91dFszXSA9IChtW2ogKiAzICsga10gLSBtW2sgKiAzICsgal0pICogZlJvb3Q7XG4gICAgICAgIG91dFtqXSA9IChtW2ogKiAzICsgaV0gKyBtW2kgKiAzICsgal0pICogZlJvb3Q7XG4gICAgICAgIG91dFtrXSA9IChtW2sgKiAzICsgaV0gKyBtW2kgKiAzICsga10pICogZlJvb3Q7XG4gICAgfVxuXG4gICAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgcXVhdGVybmlvbiBmcm9tIHRoZSBnaXZlbiBldWxlciBhbmdsZSB4LCB5LCB6LlxuICpcbiAqIEBwYXJhbSB7cXVhdH0gb3V0IHRoZSByZWNlaXZpbmcgcXVhdGVybmlvblxuICogQHBhcmFtIHt2ZWMzfSBldWxlciBBbmdsZXMgdG8gcm90YXRlIGFyb3VuZCBlYWNoIGF4aXMgaW4gZGVncmVlcy5cbiAqIEBwYXJhbSB7U3RyaW5nfSBvcmRlciBkZXRhaWxpbmcgb3JkZXIgb2Ygb3BlcmF0aW9ucy4gRGVmYXVsdCAnWFlaJy5cbiAqIEByZXR1cm5zIHtxdWF0fSBvdXRcbiAqIEBmdW5jdGlvblxuICovXG5leHBvcnQgZnVuY3Rpb24gZnJvbUV1bGVyKG91dCwgZXVsZXIsIG9yZGVyID0gJ1lYWicpIHtcbiAgICBsZXQgc3ggPSBNYXRoLnNpbihldWxlclswXSAqIDAuNSk7XG4gICAgbGV0IGN4ID0gTWF0aC5jb3MoZXVsZXJbMF0gKiAwLjUpO1xuICAgIGxldCBzeSA9IE1hdGguc2luKGV1bGVyWzFdICogMC41KTtcbiAgICBsZXQgY3kgPSBNYXRoLmNvcyhldWxlclsxXSAqIDAuNSk7XG4gICAgbGV0IHN6ID0gTWF0aC5zaW4oZXVsZXJbMl0gKiAwLjUpO1xuICAgIGxldCBjeiA9IE1hdGguY29zKGV1bGVyWzJdICogMC41KTtcblxuICAgIGlmIChvcmRlciA9PT0gJ1hZWicpIHtcbiAgICAgICAgb3V0WzBdID0gc3ggKiBjeSAqIGN6ICsgY3ggKiBzeSAqIHN6O1xuICAgICAgICBvdXRbMV0gPSBjeCAqIHN5ICogY3ogLSBzeCAqIGN5ICogc3o7XG4gICAgICAgIG91dFsyXSA9IGN4ICogY3kgKiBzeiArIHN4ICogc3kgKiBjejtcbiAgICAgICAgb3V0WzNdID0gY3ggKiBjeSAqIGN6IC0gc3ggKiBzeSAqIHN6O1xuICAgIH0gZWxzZSBpZiAob3JkZXIgPT09ICdZWFonKSB7XG4gICAgICAgIG91dFswXSA9IHN4ICogY3kgKiBjeiArIGN4ICogc3kgKiBzejtcbiAgICAgICAgb3V0WzFdID0gY3ggKiBzeSAqIGN6IC0gc3ggKiBjeSAqIHN6O1xuICAgICAgICBvdXRbMl0gPSBjeCAqIGN5ICogc3ogLSBzeCAqIHN5ICogY3o7XG4gICAgICAgIG91dFszXSA9IGN4ICogY3kgKiBjeiArIHN4ICogc3kgKiBzejtcbiAgICB9IGVsc2UgaWYgKG9yZGVyID09PSAnWlhZJykge1xuICAgICAgICBvdXRbMF0gPSBzeCAqIGN5ICogY3ogLSBjeCAqIHN5ICogc3o7XG4gICAgICAgIG91dFsxXSA9IGN4ICogc3kgKiBjeiArIHN4ICogY3kgKiBzejtcbiAgICAgICAgb3V0WzJdID0gY3ggKiBjeSAqIHN6ICsgc3ggKiBzeSAqIGN6O1xuICAgICAgICBvdXRbM10gPSBjeCAqIGN5ICogY3ogLSBzeCAqIHN5ICogc3o7XG4gICAgfSBlbHNlIGlmIChvcmRlciA9PT0gJ1pZWCcpIHtcbiAgICAgICAgb3V0WzBdID0gc3ggKiBjeSAqIGN6IC0gY3ggKiBzeSAqIHN6O1xuICAgICAgICBvdXRbMV0gPSBjeCAqIHN5ICogY3ogKyBzeCAqIGN5ICogc3o7XG4gICAgICAgIG91dFsyXSA9IGN4ICogY3kgKiBzeiAtIHN4ICogc3kgKiBjejtcbiAgICAgICAgb3V0WzNdID0gY3ggKiBjeSAqIGN6ICsgc3ggKiBzeSAqIHN6O1xuICAgIH0gZWxzZSBpZiAob3JkZXIgPT09ICdZWlgnKSB7XG4gICAgICAgIG91dFswXSA9IHN4ICogY3kgKiBjeiArIGN4ICogc3kgKiBzejtcbiAgICAgICAgb3V0WzFdID0gY3ggKiBzeSAqIGN6ICsgc3ggKiBjeSAqIHN6O1xuICAgICAgICBvdXRbMl0gPSBjeCAqIGN5ICogc3ogLSBzeCAqIHN5ICogY3o7XG4gICAgICAgIG91dFszXSA9IGN4ICogY3kgKiBjeiAtIHN4ICogc3kgKiBzejtcbiAgICB9IGVsc2UgaWYgKG9yZGVyID09PSAnWFpZJykge1xuICAgICAgICBvdXRbMF0gPSBzeCAqIGN5ICogY3ogLSBjeCAqIHN5ICogc3o7XG4gICAgICAgIG91dFsxXSA9IGN4ICogc3kgKiBjeiAtIHN4ICogY3kgKiBzejtcbiAgICAgICAgb3V0WzJdID0gY3ggKiBjeSAqIHN6ICsgc3ggKiBzeSAqIGN6O1xuICAgICAgICBvdXRbM10gPSBjeCAqIGN5ICogY3ogKyBzeCAqIHN5ICogc3o7XG4gICAgfVxuXG4gICAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBDb3B5IHRoZSB2YWx1ZXMgZnJvbSBvbmUgcXVhdCB0byBhbm90aGVyXG4gKlxuICogQHBhcmFtIHtxdWF0fSBvdXQgdGhlIHJlY2VpdmluZyBxdWF0ZXJuaW9uXG4gKiBAcGFyYW0ge3F1YXR9IGEgdGhlIHNvdXJjZSBxdWF0ZXJuaW9uXG4gKiBAcmV0dXJucyB7cXVhdH0gb3V0XG4gKiBAZnVuY3Rpb25cbiAqL1xuZXhwb3J0IGNvbnN0IGNvcHkgPSB2ZWM0LmNvcHk7XG5cbi8qKlxuICogU2V0IHRoZSBjb21wb25lbnRzIG9mIGEgcXVhdCB0byB0aGUgZ2l2ZW4gdmFsdWVzXG4gKlxuICogQHBhcmFtIHtxdWF0fSBvdXQgdGhlIHJlY2VpdmluZyBxdWF0ZXJuaW9uXG4gKiBAcGFyYW0ge051bWJlcn0geCBYIGNvbXBvbmVudFxuICogQHBhcmFtIHtOdW1iZXJ9IHkgWSBjb21wb25lbnRcbiAqIEBwYXJhbSB7TnVtYmVyfSB6IFogY29tcG9uZW50XG4gKiBAcGFyYW0ge051bWJlcn0gdyBXIGNvbXBvbmVudFxuICogQHJldHVybnMge3F1YXR9IG91dFxuICogQGZ1bmN0aW9uXG4gKi9cbmV4cG9ydCBjb25zdCBzZXQgPSB2ZWM0LnNldDtcblxuLyoqXG4gKiBBZGRzIHR3byBxdWF0J3NcbiAqXG4gKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cbiAqIEBwYXJhbSB7cXVhdH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHtxdWF0fSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge3F1YXR9IG91dFxuICogQGZ1bmN0aW9uXG4gKi9cbmV4cG9ydCBjb25zdCBhZGQgPSB2ZWM0LmFkZDtcblxuLyoqXG4gKiBTY2FsZXMgYSBxdWF0IGJ5IGEgc2NhbGFyIG51bWJlclxuICpcbiAqIEBwYXJhbSB7cXVhdH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3F1YXR9IGEgdGhlIHZlY3RvciB0byBzY2FsZVxuICogQHBhcmFtIHtOdW1iZXJ9IGIgYW1vdW50IHRvIHNjYWxlIHRoZSB2ZWN0b3IgYnlcbiAqIEByZXR1cm5zIHtxdWF0fSBvdXRcbiAqIEBmdW5jdGlvblxuICovXG5leHBvcnQgY29uc3Qgc2NhbGUgPSB2ZWM0LnNjYWxlO1xuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGRvdCBwcm9kdWN0IG9mIHR3byBxdWF0J3NcbiAqXG4gKiBAcGFyYW0ge3F1YXR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7cXVhdH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IGRvdCBwcm9kdWN0IG9mIGEgYW5kIGJcbiAqIEBmdW5jdGlvblxuICovXG5leHBvcnQgY29uc3QgZG90ID0gdmVjNC5kb3Q7XG5cbi8qKlxuICogUGVyZm9ybXMgYSBsaW5lYXIgaW50ZXJwb2xhdGlvbiBiZXR3ZWVuIHR3byBxdWF0J3NcbiAqXG4gKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cbiAqIEBwYXJhbSB7cXVhdH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHtxdWF0fSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHBhcmFtIHtOdW1iZXJ9IHQgaW50ZXJwb2xhdGlvbiBhbW91bnQgYmV0d2VlbiB0aGUgdHdvIGlucHV0c1xuICogQHJldHVybnMge3F1YXR9IG91dFxuICogQGZ1bmN0aW9uXG4gKi9cbmV4cG9ydCBjb25zdCBsZXJwID0gdmVjNC5sZXJwO1xuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGxlbmd0aCBvZiBhIHF1YXRcbiAqXG4gKiBAcGFyYW0ge3F1YXR9IGEgdmVjdG9yIHRvIGNhbGN1bGF0ZSBsZW5ndGggb2ZcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IGxlbmd0aCBvZiBhXG4gKi9cbmV4cG9ydCBjb25zdCBsZW5ndGggPSB2ZWM0Lmxlbmd0aDtcblxuLyoqXG4gKiBOb3JtYWxpemUgYSBxdWF0XG4gKlxuICogQHBhcmFtIHtxdWF0fSBvdXQgdGhlIHJlY2VpdmluZyBxdWF0ZXJuaW9uXG4gKiBAcGFyYW0ge3F1YXR9IGEgcXVhdGVybmlvbiB0byBub3JtYWxpemVcbiAqIEByZXR1cm5zIHtxdWF0fSBvdXRcbiAqIEBmdW5jdGlvblxuICovXG5leHBvcnQgY29uc3Qgbm9ybWFsaXplID0gdmVjNC5ub3JtYWxpemU7XG4iLCJjb25zdCBFUFNJTE9OID0gMC4wMDAwMDE7XG5cbi8qKlxuICogQ29weSB0aGUgdmFsdWVzIGZyb20gb25lIHZlYzIgdG8gYW5vdGhlclxuICpcbiAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIHNvdXJjZSB2ZWN0b3JcbiAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvcHkob3V0LCBhKSB7XG4gICAgb3V0WzBdID0gYVswXTtcbiAgICBvdXRbMV0gPSBhWzFdO1xuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogU2V0IHRoZSBjb21wb25lbnRzIG9mIGEgdmVjMiB0byB0aGUgZ2l2ZW4gdmFsdWVzXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7TnVtYmVyfSB4IFggY29tcG9uZW50XG4gKiBAcGFyYW0ge051bWJlcn0geSBZIGNvbXBvbmVudFxuICogQHJldHVybnMge3ZlYzJ9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gc2V0KG91dCwgeCwgeSkge1xuICAgIG91dFswXSA9IHg7XG4gICAgb3V0WzFdID0geTtcbiAgICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIEFkZHMgdHdvIHZlYzInc1xuICpcbiAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjMn0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFkZChvdXQsIGEsIGIpIHtcbiAgICBvdXRbMF0gPSBhWzBdICsgYlswXTtcbiAgICBvdXRbMV0gPSBhWzFdICsgYlsxXTtcbiAgICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFN1YnRyYWN0cyB2ZWN0b3IgYiBmcm9tIHZlY3RvciBhXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMyfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge3ZlYzJ9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gc3VidHJhY3Qob3V0LCBhLCBiKSB7XG4gICAgb3V0WzBdID0gYVswXSAtIGJbMF07XG4gICAgb3V0WzFdID0gYVsxXSAtIGJbMV07XG4gICAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBNdWx0aXBsaWVzIHR3byB2ZWMyJ3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMyfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzJ9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7dmVjMn0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtdWx0aXBseShvdXQsIGEsIGIpIHtcbiAgICBvdXRbMF0gPSBhWzBdICogYlswXTtcbiAgICBvdXRbMV0gPSBhWzFdICogYlsxXTtcbiAgICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIERpdmlkZXMgdHdvIHZlYzInc1xuICpcbiAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjMn0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRpdmlkZShvdXQsIGEsIGIpIHtcbiAgICBvdXRbMF0gPSBhWzBdIC8gYlswXTtcbiAgICBvdXRbMV0gPSBhWzFdIC8gYlsxXTtcbiAgICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFNjYWxlcyBhIHZlYzIgYnkgYSBzY2FsYXIgbnVtYmVyXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgdmVjdG9yIHRvIHNjYWxlXG4gKiBAcGFyYW0ge051bWJlcn0gYiBhbW91bnQgdG8gc2NhbGUgdGhlIHZlY3RvciBieVxuICogQHJldHVybnMge3ZlYzJ9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gc2NhbGUob3V0LCBhLCBiKSB7XG4gICAgb3V0WzBdID0gYVswXSAqIGI7XG4gICAgb3V0WzFdID0gYVsxXSAqIGI7XG4gICAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBldWNsaWRpYW4gZGlzdGFuY2UgYmV0d2VlbiB0d28gdmVjMidzXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzJ9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBkaXN0YW5jZSBiZXR3ZWVuIGEgYW5kIGJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRpc3RhbmNlKGEsIGIpIHtcbiAgICB2YXIgeCA9IGJbMF0gLSBhWzBdLFxuICAgICAgICB5ID0gYlsxXSAtIGFbMV07XG4gICAgcmV0dXJuIE1hdGguc3FydCh4ICogeCArIHkgKiB5KTtcbn1cblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBzcXVhcmVkIGV1Y2xpZGlhbiBkaXN0YW5jZSBiZXR3ZWVuIHR3byB2ZWMyJ3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjMn0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IHNxdWFyZWQgZGlzdGFuY2UgYmV0d2VlbiBhIGFuZCBiXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzcXVhcmVkRGlzdGFuY2UoYSwgYikge1xuICAgIHZhciB4ID0gYlswXSAtIGFbMF0sXG4gICAgICAgIHkgPSBiWzFdIC0gYVsxXTtcbiAgICByZXR1cm4geCAqIHggKyB5ICogeTtcbn1cblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBsZW5ndGggb2YgYSB2ZWMyXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBhIHZlY3RvciB0byBjYWxjdWxhdGUgbGVuZ3RoIG9mXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBsZW5ndGggb2YgYVxuICovXG5leHBvcnQgZnVuY3Rpb24gbGVuZ3RoKGEpIHtcbiAgICB2YXIgeCA9IGFbMF0sXG4gICAgICAgIHkgPSBhWzFdO1xuICAgIHJldHVybiBNYXRoLnNxcnQoeCAqIHggKyB5ICogeSk7XG59XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgc3F1YXJlZCBsZW5ndGggb2YgYSB2ZWMyXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBhIHZlY3RvciB0byBjYWxjdWxhdGUgc3F1YXJlZCBsZW5ndGggb2ZcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IHNxdWFyZWQgbGVuZ3RoIG9mIGFcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNxdWFyZWRMZW5ndGgoYSkge1xuICAgIHZhciB4ID0gYVswXSxcbiAgICAgICAgeSA9IGFbMV07XG4gICAgcmV0dXJuIHggKiB4ICsgeSAqIHk7XG59XG5cbi8qKlxuICogTmVnYXRlcyB0aGUgY29tcG9uZW50cyBvZiBhIHZlYzJcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMyfSBhIHZlY3RvciB0byBuZWdhdGVcbiAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG5lZ2F0ZShvdXQsIGEpIHtcbiAgICBvdXRbMF0gPSAtYVswXTtcbiAgICBvdXRbMV0gPSAtYVsxXTtcbiAgICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIGludmVyc2Ugb2YgdGhlIGNvbXBvbmVudHMgb2YgYSB2ZWMyXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjMn0gYSB2ZWN0b3IgdG8gaW52ZXJ0XG4gKiBAcmV0dXJucyB7dmVjMn0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpbnZlcnNlKG91dCwgYSkge1xuICAgIG91dFswXSA9IDEuMCAvIGFbMF07XG4gICAgb3V0WzFdID0gMS4wIC8gYVsxXTtcbiAgICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIE5vcm1hbGl6ZSBhIHZlYzJcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMyfSBhIHZlY3RvciB0byBub3JtYWxpemVcbiAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG5vcm1hbGl6ZShvdXQsIGEpIHtcbiAgICB2YXIgeCA9IGFbMF0sXG4gICAgICAgIHkgPSBhWzFdO1xuICAgIHZhciBsZW4gPSB4ICogeCArIHkgKiB5O1xuICAgIGlmIChsZW4gPiAwKSB7XG4gICAgICAgIC8vVE9ETzogZXZhbHVhdGUgdXNlIG9mIGdsbV9pbnZzcXJ0IGhlcmU/XG4gICAgICAgIGxlbiA9IDEgLyBNYXRoLnNxcnQobGVuKTtcbiAgICB9XG4gICAgb3V0WzBdID0gYVswXSAqIGxlbjtcbiAgICBvdXRbMV0gPSBhWzFdICogbGVuO1xuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgZG90IHByb2R1Y3Qgb2YgdHdvIHZlYzInc1xuICpcbiAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMyfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge051bWJlcn0gZG90IHByb2R1Y3Qgb2YgYSBhbmQgYlxuICovXG5leHBvcnQgZnVuY3Rpb24gZG90KGEsIGIpIHtcbiAgICByZXR1cm4gYVswXSAqIGJbMF0gKyBhWzFdICogYlsxXTtcbn1cblxuLyoqXG4gKiBDb21wdXRlcyB0aGUgY3Jvc3MgcHJvZHVjdCBvZiB0d28gdmVjMidzXG4gKiBOb3RlIHRoYXQgdGhlIGNyb3NzIHByb2R1Y3QgcmV0dXJucyBhIHNjYWxhclxuICpcbiAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMyfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge051bWJlcn0gY3Jvc3MgcHJvZHVjdCBvZiBhIGFuZCBiXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcm9zcyhhLCBiKSB7XG4gICAgcmV0dXJuIGFbMF0gKiBiWzFdIC0gYVsxXSAqIGJbMF07XG59XG5cbi8qKlxuICogUGVyZm9ybXMgYSBsaW5lYXIgaW50ZXJwb2xhdGlvbiBiZXR3ZWVuIHR3byB2ZWMyJ3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMyfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzJ9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcGFyYW0ge051bWJlcn0gdCBpbnRlcnBvbGF0aW9uIGFtb3VudCBiZXR3ZWVuIHRoZSB0d28gaW5wdXRzXG4gKiBAcmV0dXJucyB7dmVjMn0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBsZXJwKG91dCwgYSwgYiwgdCkge1xuICAgIHZhciBheCA9IGFbMF0sXG4gICAgICAgIGF5ID0gYVsxXTtcbiAgICBvdXRbMF0gPSBheCArIHQgKiAoYlswXSAtIGF4KTtcbiAgICBvdXRbMV0gPSBheSArIHQgKiAoYlsxXSAtIGF5KTtcbiAgICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFRyYW5zZm9ybXMgdGhlIHZlYzIgd2l0aCBhIG1hdDJcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMyfSBhIHRoZSB2ZWN0b3IgdG8gdHJhbnNmb3JtXG4gKiBAcGFyYW0ge21hdDJ9IG0gbWF0cml4IHRvIHRyYW5zZm9ybSB3aXRoXG4gKiBAcmV0dXJucyB7dmVjMn0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0cmFuc2Zvcm1NYXQyKG91dCwgYSwgbSkge1xuICAgIHZhciB4ID0gYVswXSxcbiAgICAgICAgeSA9IGFbMV07XG4gICAgb3V0WzBdID0gbVswXSAqIHggKyBtWzJdICogeTtcbiAgICBvdXRbMV0gPSBtWzFdICogeCArIG1bM10gKiB5O1xuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogVHJhbnNmb3JtcyB0aGUgdmVjMiB3aXRoIGEgbWF0MmRcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMyfSBhIHRoZSB2ZWN0b3IgdG8gdHJhbnNmb3JtXG4gKiBAcGFyYW0ge21hdDJkfSBtIG1hdHJpeCB0byB0cmFuc2Zvcm0gd2l0aFxuICogQHJldHVybnMge3ZlYzJ9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gdHJhbnNmb3JtTWF0MmQob3V0LCBhLCBtKSB7XG4gICAgdmFyIHggPSBhWzBdLFxuICAgICAgICB5ID0gYVsxXTtcbiAgICBvdXRbMF0gPSBtWzBdICogeCArIG1bMl0gKiB5ICsgbVs0XTtcbiAgICBvdXRbMV0gPSBtWzFdICogeCArIG1bM10gKiB5ICsgbVs1XTtcbiAgICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFRyYW5zZm9ybXMgdGhlIHZlYzIgd2l0aCBhIG1hdDNcbiAqIDNyZCB2ZWN0b3IgY29tcG9uZW50IGlzIGltcGxpY2l0bHkgJzEnXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgdmVjdG9yIHRvIHRyYW5zZm9ybVxuICogQHBhcmFtIHttYXQzfSBtIG1hdHJpeCB0byB0cmFuc2Zvcm0gd2l0aFxuICogQHJldHVybnMge3ZlYzJ9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gdHJhbnNmb3JtTWF0MyhvdXQsIGEsIG0pIHtcbiAgICB2YXIgeCA9IGFbMF0sXG4gICAgICAgIHkgPSBhWzFdO1xuICAgIG91dFswXSA9IG1bMF0gKiB4ICsgbVszXSAqIHkgKyBtWzZdO1xuICAgIG91dFsxXSA9IG1bMV0gKiB4ICsgbVs0XSAqIHkgKyBtWzddO1xuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogVHJhbnNmb3JtcyB0aGUgdmVjMiB3aXRoIGEgbWF0NFxuICogM3JkIHZlY3RvciBjb21wb25lbnQgaXMgaW1wbGljaXRseSAnMCdcbiAqIDR0aCB2ZWN0b3IgY29tcG9uZW50IGlzIGltcGxpY2l0bHkgJzEnXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgdmVjdG9yIHRvIHRyYW5zZm9ybVxuICogQHBhcmFtIHttYXQ0fSBtIG1hdHJpeCB0byB0cmFuc2Zvcm0gd2l0aFxuICogQHJldHVybnMge3ZlYzJ9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gdHJhbnNmb3JtTWF0NChvdXQsIGEsIG0pIHtcbiAgICBsZXQgeCA9IGFbMF07XG4gICAgbGV0IHkgPSBhWzFdO1xuICAgIG91dFswXSA9IG1bMF0gKiB4ICsgbVs0XSAqIHkgKyBtWzEyXTtcbiAgICBvdXRbMV0gPSBtWzFdICogeCArIG1bNV0gKiB5ICsgbVsxM107XG4gICAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHdoZXRoZXIgb3Igbm90IHRoZSB2ZWN0b3JzIGV4YWN0bHkgaGF2ZSB0aGUgc2FtZSBlbGVtZW50cyBpbiB0aGUgc2FtZSBwb3NpdGlvbiAod2hlbiBjb21wYXJlZCB3aXRoID09PSlcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgVGhlIGZpcnN0IHZlY3Rvci5cbiAqIEBwYXJhbSB7dmVjMn0gYiBUaGUgc2Vjb25kIHZlY3Rvci5cbiAqIEByZXR1cm5zIHtCb29sZWFufSBUcnVlIGlmIHRoZSB2ZWN0b3JzIGFyZSBlcXVhbCwgZmFsc2Ugb3RoZXJ3aXNlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZXhhY3RFcXVhbHMoYSwgYikge1xuICAgIHJldHVybiBhWzBdID09PSBiWzBdICYmIGFbMV0gPT09IGJbMV07XG59XG4iLCJjb25zdCBFUFNJTE9OID0gMC4wMDAwMDE7XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgbGVuZ3RoIG9mIGEgdmVjM1xuICpcbiAqIEBwYXJhbSB7dmVjM30gYSB2ZWN0b3IgdG8gY2FsY3VsYXRlIGxlbmd0aCBvZlxuICogQHJldHVybnMge051bWJlcn0gbGVuZ3RoIG9mIGFcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxlbmd0aChhKSB7XG4gICAgbGV0IHggPSBhWzBdO1xuICAgIGxldCB5ID0gYVsxXTtcbiAgICBsZXQgeiA9IGFbMl07XG4gICAgcmV0dXJuIE1hdGguc3FydCh4ICogeCArIHkgKiB5ICsgeiAqIHopO1xufVxuXG4vKipcbiAqIENvcHkgdGhlIHZhbHVlcyBmcm9tIG9uZSB2ZWMzIHRvIGFub3RoZXJcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMzfSBhIHRoZSBzb3VyY2UgdmVjdG9yXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb3B5KG91dCwgYSkge1xuICAgIG91dFswXSA9IGFbMF07XG4gICAgb3V0WzFdID0gYVsxXTtcbiAgICBvdXRbMl0gPSBhWzJdO1xuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogU2V0IHRoZSBjb21wb25lbnRzIG9mIGEgdmVjMyB0byB0aGUgZ2l2ZW4gdmFsdWVzXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7TnVtYmVyfSB4IFggY29tcG9uZW50XG4gKiBAcGFyYW0ge051bWJlcn0geSBZIGNvbXBvbmVudFxuICogQHBhcmFtIHtOdW1iZXJ9IHogWiBjb21wb25lbnRcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNldChvdXQsIHgsIHksIHopIHtcbiAgICBvdXRbMF0gPSB4O1xuICAgIG91dFsxXSA9IHk7XG4gICAgb3V0WzJdID0gejtcbiAgICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIEFkZHMgdHdvIHZlYzMnc1xuICpcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjM30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFkZChvdXQsIGEsIGIpIHtcbiAgICBvdXRbMF0gPSBhWzBdICsgYlswXTtcbiAgICBvdXRbMV0gPSBhWzFdICsgYlsxXTtcbiAgICBvdXRbMl0gPSBhWzJdICsgYlsyXTtcbiAgICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFN1YnRyYWN0cyB2ZWN0b3IgYiBmcm9tIHZlY3RvciBhXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjM30gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge3ZlYzN9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gc3VidHJhY3Qob3V0LCBhLCBiKSB7XG4gICAgb3V0WzBdID0gYVswXSAtIGJbMF07XG4gICAgb3V0WzFdID0gYVsxXSAtIGJbMV07XG4gICAgb3V0WzJdID0gYVsyXSAtIGJbMl07XG4gICAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBNdWx0aXBsaWVzIHR3byB2ZWMzJ3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtdWx0aXBseShvdXQsIGEsIGIpIHtcbiAgICBvdXRbMF0gPSBhWzBdICogYlswXTtcbiAgICBvdXRbMV0gPSBhWzFdICogYlsxXTtcbiAgICBvdXRbMl0gPSBhWzJdICogYlsyXTtcbiAgICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIERpdmlkZXMgdHdvIHZlYzMnc1xuICpcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjM30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRpdmlkZShvdXQsIGEsIGIpIHtcbiAgICBvdXRbMF0gPSBhWzBdIC8gYlswXTtcbiAgICBvdXRbMV0gPSBhWzFdIC8gYlsxXTtcbiAgICBvdXRbMl0gPSBhWzJdIC8gYlsyXTtcbiAgICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFNjYWxlcyBhIHZlYzMgYnkgYSBzY2FsYXIgbnVtYmVyXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjM30gYSB0aGUgdmVjdG9yIHRvIHNjYWxlXG4gKiBAcGFyYW0ge051bWJlcn0gYiBhbW91bnQgdG8gc2NhbGUgdGhlIHZlY3RvciBieVxuICogQHJldHVybnMge3ZlYzN9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gc2NhbGUob3V0LCBhLCBiKSB7XG4gICAgb3V0WzBdID0gYVswXSAqIGI7XG4gICAgb3V0WzFdID0gYVsxXSAqIGI7XG4gICAgb3V0WzJdID0gYVsyXSAqIGI7XG4gICAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBldWNsaWRpYW4gZGlzdGFuY2UgYmV0d2VlbiB0d28gdmVjMydzXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBkaXN0YW5jZSBiZXR3ZWVuIGEgYW5kIGJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRpc3RhbmNlKGEsIGIpIHtcbiAgICBsZXQgeCA9IGJbMF0gLSBhWzBdO1xuICAgIGxldCB5ID0gYlsxXSAtIGFbMV07XG4gICAgbGV0IHogPSBiWzJdIC0gYVsyXTtcbiAgICByZXR1cm4gTWF0aC5zcXJ0KHggKiB4ICsgeSAqIHkgKyB6ICogeik7XG59XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgc3F1YXJlZCBldWNsaWRpYW4gZGlzdGFuY2UgYmV0d2VlbiB0d28gdmVjMydzXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBzcXVhcmVkIGRpc3RhbmNlIGJldHdlZW4gYSBhbmQgYlxuICovXG5leHBvcnQgZnVuY3Rpb24gc3F1YXJlZERpc3RhbmNlKGEsIGIpIHtcbiAgICBsZXQgeCA9IGJbMF0gLSBhWzBdO1xuICAgIGxldCB5ID0gYlsxXSAtIGFbMV07XG4gICAgbGV0IHogPSBiWzJdIC0gYVsyXTtcbiAgICByZXR1cm4geCAqIHggKyB5ICogeSArIHogKiB6O1xufVxuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIHNxdWFyZWQgbGVuZ3RoIG9mIGEgdmVjM1xuICpcbiAqIEBwYXJhbSB7dmVjM30gYSB2ZWN0b3IgdG8gY2FsY3VsYXRlIHNxdWFyZWQgbGVuZ3RoIG9mXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBzcXVhcmVkIGxlbmd0aCBvZiBhXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzcXVhcmVkTGVuZ3RoKGEpIHtcbiAgICBsZXQgeCA9IGFbMF07XG4gICAgbGV0IHkgPSBhWzFdO1xuICAgIGxldCB6ID0gYVsyXTtcbiAgICByZXR1cm4geCAqIHggKyB5ICogeSArIHogKiB6O1xufVxuXG4vKipcbiAqIE5lZ2F0ZXMgdGhlIGNvbXBvbmVudHMgb2YgYSB2ZWMzXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjM30gYSB2ZWN0b3IgdG8gbmVnYXRlXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBuZWdhdGUob3V0LCBhKSB7XG4gICAgb3V0WzBdID0gLWFbMF07XG4gICAgb3V0WzFdID0gLWFbMV07XG4gICAgb3V0WzJdID0gLWFbMl07XG4gICAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBpbnZlcnNlIG9mIHRoZSBjb21wb25lbnRzIG9mIGEgdmVjM1xuICpcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdmVjdG9yIHRvIGludmVydFxuICogQHJldHVybnMge3ZlYzN9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gaW52ZXJzZShvdXQsIGEpIHtcbiAgICBvdXRbMF0gPSAxLjAgLyBhWzBdO1xuICAgIG91dFsxXSA9IDEuMCAvIGFbMV07XG4gICAgb3V0WzJdID0gMS4wIC8gYVsyXTtcbiAgICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIE5vcm1hbGl6ZSBhIHZlYzNcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMzfSBhIHZlY3RvciB0byBub3JtYWxpemVcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG5vcm1hbGl6ZShvdXQsIGEpIHtcbiAgICBsZXQgeCA9IGFbMF07XG4gICAgbGV0IHkgPSBhWzFdO1xuICAgIGxldCB6ID0gYVsyXTtcbiAgICBsZXQgbGVuID0geCAqIHggKyB5ICogeSArIHogKiB6O1xuICAgIGlmIChsZW4gPiAwKSB7XG4gICAgICAgIC8vVE9ETzogZXZhbHVhdGUgdXNlIG9mIGdsbV9pbnZzcXJ0IGhlcmU/XG4gICAgICAgIGxlbiA9IDEgLyBNYXRoLnNxcnQobGVuKTtcbiAgICB9XG4gICAgb3V0WzBdID0gYVswXSAqIGxlbjtcbiAgICBvdXRbMV0gPSBhWzFdICogbGVuO1xuICAgIG91dFsyXSA9IGFbMl0gKiBsZW47XG4gICAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBkb3QgcHJvZHVjdCBvZiB0d28gdmVjMydzXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBkb3QgcHJvZHVjdCBvZiBhIGFuZCBiXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkb3QoYSwgYikge1xuICAgIHJldHVybiBhWzBdICogYlswXSArIGFbMV0gKiBiWzFdICsgYVsyXSAqIGJbMl07XG59XG5cbi8qKlxuICogQ29tcHV0ZXMgdGhlIGNyb3NzIHByb2R1Y3Qgb2YgdHdvIHZlYzMnc1xuICpcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjM30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyb3NzKG91dCwgYSwgYikge1xuICAgIGxldCBheCA9IGFbMF0sXG4gICAgICAgIGF5ID0gYVsxXSxcbiAgICAgICAgYXogPSBhWzJdO1xuICAgIGxldCBieCA9IGJbMF0sXG4gICAgICAgIGJ5ID0gYlsxXSxcbiAgICAgICAgYnogPSBiWzJdO1xuXG4gICAgb3V0WzBdID0gYXkgKiBieiAtIGF6ICogYnk7XG4gICAgb3V0WzFdID0gYXogKiBieCAtIGF4ICogYno7XG4gICAgb3V0WzJdID0gYXggKiBieSAtIGF5ICogYng7XG4gICAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBQZXJmb3JtcyBhIGxpbmVhciBpbnRlcnBvbGF0aW9uIGJldHdlZW4gdHdvIHZlYzMnc1xuICpcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjM30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEBwYXJhbSB7TnVtYmVyfSB0IGludGVycG9sYXRpb24gYW1vdW50IGJldHdlZW4gdGhlIHR3byBpbnB1dHNcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxlcnAob3V0LCBhLCBiLCB0KSB7XG4gICAgbGV0IGF4ID0gYVswXTtcbiAgICBsZXQgYXkgPSBhWzFdO1xuICAgIGxldCBheiA9IGFbMl07XG4gICAgb3V0WzBdID0gYXggKyB0ICogKGJbMF0gLSBheCk7XG4gICAgb3V0WzFdID0gYXkgKyB0ICogKGJbMV0gLSBheSk7XG4gICAgb3V0WzJdID0gYXogKyB0ICogKGJbMl0gLSBheik7XG4gICAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBUcmFuc2Zvcm1zIHRoZSB2ZWMzIHdpdGggYSBtYXQ0LlxuICogNHRoIHZlY3RvciBjb21wb25lbnQgaXMgaW1wbGljaXRseSAnMSdcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMzfSBhIHRoZSB2ZWN0b3IgdG8gdHJhbnNmb3JtXG4gKiBAcGFyYW0ge21hdDR9IG0gbWF0cml4IHRvIHRyYW5zZm9ybSB3aXRoXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0cmFuc2Zvcm1NYXQ0KG91dCwgYSwgbSkge1xuICAgIGxldCB4ID0gYVswXSxcbiAgICAgICAgeSA9IGFbMV0sXG4gICAgICAgIHogPSBhWzJdO1xuICAgIGxldCB3ID0gbVszXSAqIHggKyBtWzddICogeSArIG1bMTFdICogeiArIG1bMTVdO1xuICAgIHcgPSB3IHx8IDEuMDtcbiAgICBvdXRbMF0gPSAobVswXSAqIHggKyBtWzRdICogeSArIG1bOF0gKiB6ICsgbVsxMl0pIC8gdztcbiAgICBvdXRbMV0gPSAobVsxXSAqIHggKyBtWzVdICogeSArIG1bOV0gKiB6ICsgbVsxM10pIC8gdztcbiAgICBvdXRbMl0gPSAobVsyXSAqIHggKyBtWzZdICogeSArIG1bMTBdICogeiArIG1bMTRdKSAvIHc7XG4gICAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBTYW1lIGFzIGFib3ZlIGJ1dCBkb2Vzbid0IGFwcGx5IHRyYW5zbGF0aW9uLlxuICogVXNlZnVsIGZvciByYXlzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gc2NhbGVSb3RhdGVNYXQ0KG91dCwgYSwgbSkge1xuICAgIGxldCB4ID0gYVswXSxcbiAgICAgICAgeSA9IGFbMV0sXG4gICAgICAgIHogPSBhWzJdO1xuICAgIGxldCB3ID0gbVszXSAqIHggKyBtWzddICogeSArIG1bMTFdICogeiArIG1bMTVdO1xuICAgIHcgPSB3IHx8IDEuMDtcbiAgICBvdXRbMF0gPSAobVswXSAqIHggKyBtWzRdICogeSArIG1bOF0gKiB6KSAvIHc7XG4gICAgb3V0WzFdID0gKG1bMV0gKiB4ICsgbVs1XSAqIHkgKyBtWzldICogeikgLyB3O1xuICAgIG91dFsyXSA9IChtWzJdICogeCArIG1bNl0gKiB5ICsgbVsxMF0gKiB6KSAvIHc7XG4gICAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBUcmFuc2Zvcm1zIHRoZSB2ZWMzIHdpdGggYSBtYXQzLlxuICpcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIHZlY3RvciB0byB0cmFuc2Zvcm1cbiAqIEBwYXJhbSB7bWF0M30gbSB0aGUgM3gzIG1hdHJpeCB0byB0cmFuc2Zvcm0gd2l0aFxuICogQHJldHVybnMge3ZlYzN9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gdHJhbnNmb3JtTWF0MyhvdXQsIGEsIG0pIHtcbiAgICBsZXQgeCA9IGFbMF0sXG4gICAgICAgIHkgPSBhWzFdLFxuICAgICAgICB6ID0gYVsyXTtcbiAgICBvdXRbMF0gPSB4ICogbVswXSArIHkgKiBtWzNdICsgeiAqIG1bNl07XG4gICAgb3V0WzFdID0geCAqIG1bMV0gKyB5ICogbVs0XSArIHogKiBtWzddO1xuICAgIG91dFsyXSA9IHggKiBtWzJdICsgeSAqIG1bNV0gKyB6ICogbVs4XTtcbiAgICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFRyYW5zZm9ybXMgdGhlIHZlYzMgd2l0aCBhIHF1YXRcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMzfSBhIHRoZSB2ZWN0b3IgdG8gdHJhbnNmb3JtXG4gKiBAcGFyYW0ge3F1YXR9IHEgcXVhdGVybmlvbiB0byB0cmFuc2Zvcm0gd2l0aFxuICogQHJldHVybnMge3ZlYzN9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gdHJhbnNmb3JtUXVhdChvdXQsIGEsIHEpIHtcbiAgICAvLyBiZW5jaG1hcmtzOiBodHRwczovL2pzcGVyZi5jb20vcXVhdGVybmlvbi10cmFuc2Zvcm0tdmVjMy1pbXBsZW1lbnRhdGlvbnMtZml4ZWRcblxuICAgIGxldCB4ID0gYVswXSxcbiAgICAgICAgeSA9IGFbMV0sXG4gICAgICAgIHogPSBhWzJdO1xuICAgIGxldCBxeCA9IHFbMF0sXG4gICAgICAgIHF5ID0gcVsxXSxcbiAgICAgICAgcXogPSBxWzJdLFxuICAgICAgICBxdyA9IHFbM107XG5cbiAgICBsZXQgdXZ4ID0gcXkgKiB6IC0gcXogKiB5O1xuICAgIGxldCB1dnkgPSBxeiAqIHggLSBxeCAqIHo7XG4gICAgbGV0IHV2eiA9IHF4ICogeSAtIHF5ICogeDtcblxuICAgIGxldCB1dXZ4ID0gcXkgKiB1dnogLSBxeiAqIHV2eTtcbiAgICBsZXQgdXV2eSA9IHF6ICogdXZ4IC0gcXggKiB1dno7XG4gICAgbGV0IHV1dnogPSBxeCAqIHV2eSAtIHF5ICogdXZ4O1xuXG4gICAgbGV0IHcyID0gcXcgKiAyO1xuICAgIHV2eCAqPSB3MjtcbiAgICB1dnkgKj0gdzI7XG4gICAgdXZ6ICo9IHcyO1xuXG4gICAgdXV2eCAqPSAyO1xuICAgIHV1dnkgKj0gMjtcbiAgICB1dXZ6ICo9IDI7XG5cbiAgICBvdXRbMF0gPSB4ICsgdXZ4ICsgdXV2eDtcbiAgICBvdXRbMV0gPSB5ICsgdXZ5ICsgdXV2eTtcbiAgICBvdXRbMl0gPSB6ICsgdXZ6ICsgdXV2ejtcbiAgICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIEdldCB0aGUgYW5nbGUgYmV0d2VlbiB0d28gM0QgdmVjdG9yc1xuICogQHBhcmFtIHt2ZWMzfSBhIFRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzN9IGIgVGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBUaGUgYW5nbGUgaW4gcmFkaWFuc1xuICovXG5leHBvcnQgY29uc3QgYW5nbGUgPSAoZnVuY3Rpb24gKCkge1xuICAgIGNvbnN0IHRlbXBBID0gWzAsIDAsIDBdO1xuICAgIGNvbnN0IHRlbXBCID0gWzAsIDAsIDBdO1xuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgICAgIGNvcHkodGVtcEEsIGEpO1xuICAgICAgICBjb3B5KHRlbXBCLCBiKTtcblxuICAgICAgICBub3JtYWxpemUodGVtcEEsIHRlbXBBKTtcbiAgICAgICAgbm9ybWFsaXplKHRlbXBCLCB0ZW1wQik7XG5cbiAgICAgICAgbGV0IGNvc2luZSA9IGRvdCh0ZW1wQSwgdGVtcEIpO1xuXG4gICAgICAgIGlmIChjb3NpbmUgPiAxLjApIHtcbiAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICB9IGVsc2UgaWYgKGNvc2luZSA8IC0xLjApIHtcbiAgICAgICAgICAgIHJldHVybiBNYXRoLlBJO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIE1hdGguYWNvcyhjb3NpbmUpO1xuICAgICAgICB9XG4gICAgfTtcbn0pKCk7XG5cbi8qKlxuICogUmV0dXJucyB3aGV0aGVyIG9yIG5vdCB0aGUgdmVjdG9ycyBoYXZlIGV4YWN0bHkgdGhlIHNhbWUgZWxlbWVudHMgaW4gdGhlIHNhbWUgcG9zaXRpb24gKHdoZW4gY29tcGFyZWQgd2l0aCA9PT0pXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBhIFRoZSBmaXJzdCB2ZWN0b3IuXG4gKiBAcGFyYW0ge3ZlYzN9IGIgVGhlIHNlY29uZCB2ZWN0b3IuXG4gKiBAcmV0dXJucyB7Qm9vbGVhbn0gVHJ1ZSBpZiB0aGUgdmVjdG9ycyBhcmUgZXF1YWwsIGZhbHNlIG90aGVyd2lzZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGV4YWN0RXF1YWxzKGEsIGIpIHtcbiAgICByZXR1cm4gYVswXSA9PT0gYlswXSAmJiBhWzFdID09PSBiWzFdICYmIGFbMl0gPT09IGJbMl07XG59XG4iLCJjb25zdCBFUFNJTE9OID0gMC4wMDAwMDE7XG5cbi8qKlxuICogQ29weSB0aGUgdmFsdWVzIGZyb20gb25lIHZlYzQgdG8gYW5vdGhlclxuICpcbiAqIEBwYXJhbSB7dmVjNH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzR9IGEgdGhlIHNvdXJjZSB2ZWN0b3JcbiAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvcHkob3V0LCBhKSB7XG4gICAgb3V0WzBdID0gYVswXTtcbiAgICBvdXRbMV0gPSBhWzFdO1xuICAgIG91dFsyXSA9IGFbMl07XG4gICAgb3V0WzNdID0gYVszXTtcbiAgICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFNldCB0aGUgY29tcG9uZW50cyBvZiBhIHZlYzQgdG8gdGhlIGdpdmVuIHZhbHVlc1xuICpcbiAqIEBwYXJhbSB7dmVjNH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge051bWJlcn0geCBYIGNvbXBvbmVudFxuICogQHBhcmFtIHtOdW1iZXJ9IHkgWSBjb21wb25lbnRcbiAqIEBwYXJhbSB7TnVtYmVyfSB6IFogY29tcG9uZW50XG4gKiBAcGFyYW0ge051bWJlcn0gdyBXIGNvbXBvbmVudFxuICogQHJldHVybnMge3ZlYzR9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gc2V0KG91dCwgeCwgeSwgeiwgdykge1xuICAgIG91dFswXSA9IHg7XG4gICAgb3V0WzFdID0geTtcbiAgICBvdXRbMl0gPSB6O1xuICAgIG91dFszXSA9IHc7XG4gICAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBBZGRzIHR3byB2ZWM0J3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWM0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7dmVjNH0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhZGQob3V0LCBhLCBiKSB7XG4gICAgb3V0WzBdID0gYVswXSArIGJbMF07XG4gICAgb3V0WzFdID0gYVsxXSArIGJbMV07XG4gICAgb3V0WzJdID0gYVsyXSArIGJbMl07XG4gICAgb3V0WzNdID0gYVszXSArIGJbM107XG4gICAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBTY2FsZXMgYSB2ZWM0IGJ5IGEgc2NhbGFyIG51bWJlclxuICpcbiAqIEBwYXJhbSB7dmVjNH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzR9IGEgdGhlIHZlY3RvciB0byBzY2FsZVxuICogQHBhcmFtIHtOdW1iZXJ9IGIgYW1vdW50IHRvIHNjYWxlIHRoZSB2ZWN0b3IgYnlcbiAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNjYWxlKG91dCwgYSwgYikge1xuICAgIG91dFswXSA9IGFbMF0gKiBiO1xuICAgIG91dFsxXSA9IGFbMV0gKiBiO1xuICAgIG91dFsyXSA9IGFbMl0gKiBiO1xuICAgIG91dFszXSA9IGFbM10gKiBiO1xuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgbGVuZ3RoIG9mIGEgdmVjNFxuICpcbiAqIEBwYXJhbSB7dmVjNH0gYSB2ZWN0b3IgdG8gY2FsY3VsYXRlIGxlbmd0aCBvZlxuICogQHJldHVybnMge051bWJlcn0gbGVuZ3RoIG9mIGFcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxlbmd0aChhKSB7XG4gICAgbGV0IHggPSBhWzBdO1xuICAgIGxldCB5ID0gYVsxXTtcbiAgICBsZXQgeiA9IGFbMl07XG4gICAgbGV0IHcgPSBhWzNdO1xuICAgIHJldHVybiBNYXRoLnNxcnQoeCAqIHggKyB5ICogeSArIHogKiB6ICsgdyAqIHcpO1xufVxuXG4vKipcbiAqIE5vcm1hbGl6ZSBhIHZlYzRcbiAqXG4gKiBAcGFyYW0ge3ZlYzR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWM0fSBhIHZlY3RvciB0byBub3JtYWxpemVcbiAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG5vcm1hbGl6ZShvdXQsIGEpIHtcbiAgICBsZXQgeCA9IGFbMF07XG4gICAgbGV0IHkgPSBhWzFdO1xuICAgIGxldCB6ID0gYVsyXTtcbiAgICBsZXQgdyA9IGFbM107XG4gICAgbGV0IGxlbiA9IHggKiB4ICsgeSAqIHkgKyB6ICogeiArIHcgKiB3O1xuICAgIGlmIChsZW4gPiAwKSB7XG4gICAgICAgIGxlbiA9IDEgLyBNYXRoLnNxcnQobGVuKTtcbiAgICB9XG4gICAgb3V0WzBdID0geCAqIGxlbjtcbiAgICBvdXRbMV0gPSB5ICogbGVuO1xuICAgIG91dFsyXSA9IHogKiBsZW47XG4gICAgb3V0WzNdID0gdyAqIGxlbjtcbiAgICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGRvdCBwcm9kdWN0IG9mIHR3byB2ZWM0J3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjNH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IGRvdCBwcm9kdWN0IG9mIGEgYW5kIGJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRvdChhLCBiKSB7XG4gICAgcmV0dXJuIGFbMF0gKiBiWzBdICsgYVsxXSAqIGJbMV0gKyBhWzJdICogYlsyXSArIGFbM10gKiBiWzNdO1xufVxuXG4vKipcbiAqIFBlcmZvcm1zIGEgbGluZWFyIGludGVycG9sYXRpb24gYmV0d2VlbiB0d28gdmVjNCdzXG4gKlxuICogQHBhcmFtIHt2ZWM0fSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjNH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWM0fSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHBhcmFtIHtOdW1iZXJ9IHQgaW50ZXJwb2xhdGlvbiBhbW91bnQgYmV0d2VlbiB0aGUgdHdvIGlucHV0c1xuICogQHJldHVybnMge3ZlYzR9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gbGVycChvdXQsIGEsIGIsIHQpIHtcbiAgICBsZXQgYXggPSBhWzBdO1xuICAgIGxldCBheSA9IGFbMV07XG4gICAgbGV0IGF6ID0gYVsyXTtcbiAgICBsZXQgYXcgPSBhWzNdO1xuICAgIG91dFswXSA9IGF4ICsgdCAqIChiWzBdIC0gYXgpO1xuICAgIG91dFsxXSA9IGF5ICsgdCAqIChiWzFdIC0gYXkpO1xuICAgIG91dFsyXSA9IGF6ICsgdCAqIChiWzJdIC0gYXopO1xuICAgIG91dFszXSA9IGF3ICsgdCAqIChiWzNdIC0gYXcpO1xuICAgIHJldHVybiBvdXQ7XG59XG4iLCIvLyBDb3JlXG5leHBvcnQgeyBHZW9tZXRyeSB9IGZyb20gJy4vY29yZS9HZW9tZXRyeS5qcyc7XG5leHBvcnQgeyBQcm9ncmFtIH0gZnJvbSAnLi9jb3JlL1Byb2dyYW0uanMnO1xuZXhwb3J0IHsgUmVuZGVyZXIgfSBmcm9tICcuL2NvcmUvUmVuZGVyZXIuanMnO1xuZXhwb3J0IHsgQ2FtZXJhIH0gZnJvbSAnLi9jb3JlL0NhbWVyYS5qcyc7XG5leHBvcnQgeyBUcmFuc2Zvcm0gfSBmcm9tICcuL2NvcmUvVHJhbnNmb3JtLmpzJztcbmV4cG9ydCB7IE1lc2ggfSBmcm9tICcuL2NvcmUvTWVzaC5qcyc7XG5leHBvcnQgeyBUZXh0dXJlIH0gZnJvbSAnLi9jb3JlL1RleHR1cmUuanMnO1xuZXhwb3J0IHsgUmVuZGVyVGFyZ2V0IH0gZnJvbSAnLi9jb3JlL1JlbmRlclRhcmdldC5qcyc7XG5cbi8vIE1hdGhzXG5leHBvcnQgeyBDb2xvciB9IGZyb20gJy4vbWF0aC9Db2xvci5qcyc7XG5leHBvcnQgeyBFdWxlciB9IGZyb20gJy4vbWF0aC9FdWxlci5qcyc7XG5leHBvcnQgeyBNYXQzIH0gZnJvbSAnLi9tYXRoL01hdDMuanMnO1xuZXhwb3J0IHsgTWF0NCB9IGZyb20gJy4vbWF0aC9NYXQ0LmpzJztcbmV4cG9ydCB7IFF1YXQgfSBmcm9tICcuL21hdGgvUXVhdC5qcyc7XG5leHBvcnQgeyBWZWMyIH0gZnJvbSAnLi9tYXRoL1ZlYzIuanMnO1xuZXhwb3J0IHsgVmVjMyB9IGZyb20gJy4vbWF0aC9WZWMzLmpzJztcbmV4cG9ydCB7IFZlYzQgfSBmcm9tICcuL21hdGgvVmVjNC5qcyc7XG5cbi8vIEV4dHJhc1xuZXhwb3J0IHsgUGxhbmUgfSBmcm9tICcuL2V4dHJhcy9QbGFuZS5qcyc7XG5leHBvcnQgeyBCb3ggfSBmcm9tICcuL2V4dHJhcy9Cb3guanMnO1xuZXhwb3J0IHsgU3BoZXJlIH0gZnJvbSAnLi9leHRyYXMvU3BoZXJlLmpzJztcbmV4cG9ydCB7IEN5bGluZGVyIH0gZnJvbSAnLi9leHRyYXMvQ3lsaW5kZXIuanMnO1xuZXhwb3J0IHsgVHJpYW5nbGUgfSBmcm9tICcuL2V4dHJhcy9UcmlhbmdsZS5qcyc7XG5leHBvcnQgeyBUb3J1cyB9IGZyb20gJy4vZXh0cmFzL1RvcnVzLmpzJztcbmV4cG9ydCB7IE9yYml0IH0gZnJvbSAnLi9leHRyYXMvT3JiaXQuanMnO1xuZXhwb3J0IHsgUmF5Y2FzdCB9IGZyb20gJy4vZXh0cmFzL1JheWNhc3QuanMnO1xuZXhwb3J0IHsgQ3VydmUgfSBmcm9tICcuL2V4dHJhcy9DdXJ2ZS5qcyc7XG5leHBvcnQgeyBQb3N0IH0gZnJvbSAnLi9leHRyYXMvUG9zdC5qcyc7XG5leHBvcnQgeyBTa2luIH0gZnJvbSAnLi9leHRyYXMvU2tpbi5qcyc7XG5leHBvcnQgeyBBbmltYXRpb24gfSBmcm9tICcuL2V4dHJhcy9BbmltYXRpb24uanMnO1xuZXhwb3J0IHsgVGV4dCB9IGZyb20gJy4vZXh0cmFzL1RleHQuanMnO1xuZXhwb3J0IHsgTm9ybWFsUHJvZ3JhbSB9IGZyb20gJy4vZXh0cmFzL05vcm1hbFByb2dyYW0uanMnO1xuZXhwb3J0IHsgRmxvd21hcCB9IGZyb20gJy4vZXh0cmFzL0Zsb3dtYXAuanMnO1xuZXhwb3J0IHsgR1BHUFUgfSBmcm9tICcuL2V4dHJhcy9HUEdQVS5qcyc7XG5leHBvcnQgeyBQb2x5bGluZSB9IGZyb20gJy4vZXh0cmFzL1BvbHlsaW5lLmpzJztcbmV4cG9ydCB7IFNoYWRvdyB9IGZyb20gJy4vZXh0cmFzL1NoYWRvdy5qcyc7XG5leHBvcnQgeyBLVFhUZXh0dXJlIH0gZnJvbSAnLi9leHRyYXMvS1RYVGV4dHVyZS5qcyc7XG5leHBvcnQgeyBUZXh0dXJlTG9hZGVyIH0gZnJvbSAnLi9leHRyYXMvVGV4dHVyZUxvYWRlci5qcyc7XG5leHBvcnQgeyBHTFRGTG9hZGVyIH0gZnJvbSAnLi9leHRyYXMvR0xURkxvYWRlci5qcyc7XG5leHBvcnQgeyBHTFRGU2tpbiB9IGZyb20gJy4vZXh0cmFzL0dMVEZTa2luLmpzJztcblxuIiwiaW1wb3J0IHtcbiAgICBDYW1lcmEsXG4gICAgT0dMUmVuZGVyaW5nQ29udGV4dCxcbiAgICBQb3N0LFxuICAgIFBvc3RGQk8sXG4gICAgUG9zdE9wdGlvbnMsIFByb2dyYW0sXG4gICAgUmVuZGVyZXIsXG4gICAgUmVuZGVyVGFyZ2V0LFxuICAgIFJlbmRlclRhcmdldE9wdGlvbnMsXG4gICAgVHJhbnNmb3JtXG59IGZyb20gXCIuLi9vZ2xcIjtcblxuZXhwb3J0IGNsYXNzIFBhc3Mge1xuICAgIGVuYWJsZWQ6IGJvb2xlYW47XG4gICAgcmVuZGVyVG9TY3JlZW46IGJvb2xlYW47XG4gICAgbmVlZHNTd2FwOiBib29sZWFuO1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLmVuYWJsZWQgPSB0cnVlO1xuICAgICAgICB0aGlzLnJlbmRlclRvU2NyZWVuID0gZmFsc2U7XG4gICAgICAgIHRoaXMubmVlZHNTd2FwID0gdHJ1ZTtcbiAgICB9XG5cbiAgICByZW5kZXIocmVuZGVyZXI6IFJlbmRlcmVyLCB3cml0ZUJ1ZmZlcjogUmVuZGVyVGFyZ2V0fHVuZGVmaW5lZCwgcmVhZEJ1ZmZlcjogUmVuZGVyVGFyZ2V0KSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ05vdCBpbXBsZW1lbnRlZCcpO1xuICAgIH1cbiAgICByZW5kZXJXaXRoRkJPKHJlbmRlcmVyOiBSZW5kZXJlciwgZmJvOiBQb3N0RkJPKXtcbiAgICAgICAgZmJvLnJlYWQgJiYgdGhpcy5yZW5kZXIocmVuZGVyZXIsIGZiby53cml0ZSwgZmJvLnJlYWQpO1xuICAgIH1cbiAgICByZXNpemUoeyB3aWR0aCwgaGVpZ2h0LCBkcHIgfTogUGFydGlhbDx7XG4gICAgICAgIHdpZHRoOiBudW1iZXI7XG4gICAgICAgIGhlaWdodDogbnVtYmVyO1xuICAgICAgICBkcHI6IG51bWJlcjtcbiAgICB9Pik6IHZvaWR7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ05vdCBpbXBsZW1lbnRlZCcpO1xuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIFJlbmRlclBhc3MgZXh0ZW5kcyBQYXNzIHtcbiAgICBwcml2YXRlIHNjZW5lOiBUcmFuc2Zvcm07XG4gICAgcHJpdmF0ZSBjYW1lcmE6IENhbWVyYTtcbiAgICBjb25zdHJ1Y3RvcihzY2VuZTogVHJhbnNmb3JtLCBjYW1lcmE6IENhbWVyYSkge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzLnNjZW5lID0gc2NlbmU7XG4gICAgICAgIHRoaXMuY2FtZXJhID0gY2FtZXJhO1xuICAgIH1cbiAgICBcbiAgICByZW5kZXIocmVuZGVyZXI6IFJlbmRlcmVyLCB3cml0ZUJ1ZmZlcjogUmVuZGVyVGFyZ2V0fHVuZGVmaW5lZCwgcmVhZEJ1ZmZlcjogUmVuZGVyVGFyZ2V0KSB7XG4gICAgICAgIHJlbmRlcmVyLnJlbmRlcih7c2NlbmU6IHRoaXMuc2NlbmUsIGNhbWVyYTogdGhpcy5jYW1lcmEsIHRhcmdldDogcmVhZEJ1ZmZlcn0pO1xuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIEN1c3RvbVBvc3QgZXh0ZW5kcyBQb3N0IHtcbiAgICBwYXNzZXM6IFBhc3NbXSA9IFtdO1xuXG4gICAgY29uc3RydWN0b3IoZ2w6IE9HTFJlbmRlcmluZ0NvbnRleHQsIG9wdGlvbnM6UGFydGlhbDxQb3N0T3B0aW9ucz4gPSB7fSwgZmJvPzogUG9zdEZCTykge1xuICAgICAgICBzdXBlcihnbCwgb3B0aW9ucywgZmJvKTtcbiAgICB9XG5cbiAgICBhZGRQYXNzKHBhc3M6IFBhc3MpIHtcbiAgICAgICAgdGhpcy5wYXNzZXMucHVzaChwYXNzKTtcbiAgICAgICAgcmV0dXJuIHBhc3M7XG4gICAgfVxuXG4gICAgcmVuZGVyKHsgdGFyZ2V0PSB1bmRlZmluZWQsIHVwZGF0ZSA9IHRydWUsIHNvcnQgPSB0cnVlLCBmcnVzdHVtQ3VsbCA9IHRydWUgfSkge1xuICAgICAgICBjb25zdCBlbmFibGVkUGFzc2VzID0gdGhpcy5wYXNzZXMuZmlsdGVyKChwYXNzKSA9PiBwYXNzLmVuYWJsZWQpO1xuICAgICAgICBlbmFibGVkUGFzc2VzLmZvckVhY2goKHBhc3MsIGkpID0+IHtcbiAgICAgICAgICAgIHRoaXMuX3JlbmRlclBhc3MocGFzcyk7XG4gICAgICAgICAgICBwYXNzLm5lZWRzU3dhcCAmJiB0aGlzLmZiby5zd2FwKCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBfcmVuZGVyUGFzcyhwYXNzOiBQYXNzKSB7XG4gICAgICAgIHBhc3MucmVuZGVyV2l0aEZCTyh0aGlzLmdsLnJlbmRlcmVyLCB0aGlzLmZibyk7XG4gICAgfVxuXG4gICAgcmVzaXplKHsgd2lkdGgsIGhlaWdodCwgZHByIH06IFBhcnRpYWw8e1xuICAgICAgICB3aWR0aDogbnVtYmVyO1xuICAgICAgICBoZWlnaHQ6IG51bWJlcjtcbiAgICAgICAgZHByOiBudW1iZXI7XG4gICAgfT4pOiB2b2lke1xuICAgICAgICBzdXBlci5yZXNpemUoe3dpZHRoOiB3aWR0aCwgaGVpZ2h0OiBoZWlnaHQsIGRwcjogZHByfSk7XG4gICAgICAgIHRoaXMucGFzc2VzLmZvckVhY2goIChwYXNzKSA9PiB7XG4gICAgICAgICAgICBwYXNzLnJlc2l6ZSh7d2lkdGgsIGhlaWdodCwgZHByfSk7XG4gICAgICAgIH0pXG4gICAgfVxufVxuIiwiaW1wb3J0IHtcclxuICAgIFJlbmRlcmVyLFxyXG4gICAgUmVuZGVyVGFyZ2V0LFxyXG4gICAgUHJvZ3JhbSxcclxuICAgIFRleHR1cmUsXHJcbiAgICBUcmFuc2Zvcm0sXHJcbiAgICBDYW1lcmEsXHJcbiAgICBNZXNoLFxyXG4gICAgUGxhbmUsXHJcbiAgICBWZWMyLFxyXG4gICAgT0dMUmVuZGVyaW5nQ29udGV4dFxyXG59IGZyb20gJy4uL29nbCc7XHJcblxyXG5cclxuZXhwb3J0IGNsYXNzIFV0aWxzIHtcclxuICAgIHN0YXRpYyByZWFkb25seSBjb3B5VmVydGV4ID0gLyogZ2xzbCAqLyBgXHJcbiAgICBhdHRyaWJ1dGUgdmVjMiB1djtcclxuICAgIGF0dHJpYnV0ZSB2ZWMzIHBvc2l0aW9uO1xyXG4gICAgdmFyeWluZyB2ZWMyIHZVdjtcclxuICAgIHVuaWZvcm0gbWF0NCBtb2RlbE1hdHJpeDtcclxuICAgIHVuaWZvcm0gbWF0NCBwcm9qZWN0aW9uTWF0cml4O1xyXG5cclxuICAgIHZvaWQgbWFpbigpIHtcclxuICAgICAgICB2VXYgPSB1djtcclxuICAgICAgICBnbF9Qb3NpdGlvbiA9IHByb2plY3Rpb25NYXRyaXggKiBtb2RlbE1hdHJpeCAqIHZlYzQocG9zaXRpb24sIDEpO1xyXG4gICAgfVxyXG5gO1xyXG4gICAgc3RhdGljIHJlYWRvbmx5IGNvcHlGcmFnbWVudCA9IC8qIGdsc2wgKi8gYFxyXG4gICAgcHJlY2lzaW9uIGhpZ2hwIGZsb2F0O1xyXG4gICAgdW5pZm9ybSBzYW1wbGVyMkQgdE1hcDtcclxuICAgIHZhcnlpbmcgdmVjMiB2VXY7XHJcbiAgICB2b2lkIG1haW4oKSB7XHJcbiAgICAgICAgZ2xfRnJhZ0NvbG9yID0gdGV4dHVyZTJEKHRNYXAsIHZVdik7XHJcbiAgICB9XHJcbmA7XHJcbiAgICBwcml2YXRlIHN0YXRpYyBpbnN0YW5jZU1hcF86IE1hcDxzdHJpbmcsIFV0aWxzPiA9IG5ldyBNYXA8c3RyaW5nLCBVdGlscz4oKTtcclxuICAgIHByaXZhdGUgY29weXByb2dyYW1fOiBQcm9ncmFtO1xyXG4gICAgcHJpdmF0ZSBvcnRob1NjZW5lXzogVHJhbnNmb3JtID0gbmV3IFRyYW5zZm9ybSgpO1xyXG4gICAgcHJpdmF0ZSBtZXNoXzogTWVzaDtcclxuICAgIHByaXZhdGUgb3J0aG9DYW1lcmFfOiBDYW1lcmE7XHJcbiAgICBwcml2YXRlIGdsOiBPR0xSZW5kZXJpbmdDb250ZXh0O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGdsOiBPR0xSZW5kZXJpbmdDb250ZXh0KSB7XHJcbiAgICAgICAgdGhpcy5nbCA9IGdsO1xyXG4gICAgICAgIHRoaXMuY29weXByb2dyYW1fID0gbmV3IFByb2dyYW0oZ2wsIHtcclxuICAgICAgICAgICAgdmVydGV4OiBVdGlscy5jb3B5VmVydGV4LFxyXG4gICAgICAgICAgICBmcmFnbWVudDogVXRpbHMuY29weUZyYWdtZW50LFxyXG4gICAgICAgICAgICB1bmlmb3Jtczoge3RNYXA6IHt2YWx1ZToge3RleHR1cmU6IG51bGx9fX0sXHJcbiAgICAgICAgICAgIGRlcHRoVGVzdDogZmFsc2UsXHJcbiAgICAgICAgICAgIGRlcHRoV3JpdGU6IGZhbHNlLFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMub3J0aG9DYW1lcmFfID0gbmV3IENhbWVyYShnbCk7XHJcbiAgICAgICAgdGhpcy5vcnRob0NhbWVyYV8ub3J0aG9ncmFwaGljKHtuZWFyOiAwLCBmYXI6IDEwLCBsZWZ0OiAtMSwgcmlnaHQ6IDEsIGJvdHRvbTogLTEsIHRvcDogMX0pO1xyXG4gICAgICAgIGxldCBwbGFuZSA9IG5ldyBQbGFuZShnbCwge3dpZHRoOiAyLCBoZWlnaHQ6IDJ9KTtcclxuICAgICAgICB0aGlzLm1lc2hfID0gbmV3IE1lc2goZ2wsIHtnZW9tZXRyeTogcGxhbmV9KTtcclxuICAgICAgICB0aGlzLm1lc2hfLnNldFBhcmVudCh0aGlzLm9ydGhvU2NlbmVfKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc3RhdGljIGdldEluc3RhbmNlKGdsOiBhbnkpOiBVdGlscyB7XHJcbiAgICAgICAgbGV0IGlucyA9IFV0aWxzLmluc3RhbmNlTWFwXy5nZXQoZ2wuY2FudmFzLmlkKTtcclxuICAgICAgICBpZiAoIWlucykgVXRpbHMuaW5zdGFuY2VNYXBfLnNldChnbC5jYW52YXMuaWQsIChpbnMgPSBuZXcgVXRpbHMoZ2wpKSk7XHJcbiAgICAgICAgcmV0dXJuIGlucztcclxuICAgIH1cclxuXHJcbiAgICByZW5kZXJQYXNzKHJlbmRlcmVyOiBSZW5kZXJlciwgcHJvZ3JhbTogUHJvZ3JhbSwgdGFyZ2V0PzogUmVuZGVyVGFyZ2V0LCBjbGVhcj86IGJvb2xlYW4pIHtcclxuICAgICAgICB0aGlzLm1lc2hfLnByb2dyYW0gPSBwcm9ncmFtO1xyXG4gICAgICAgIHJlbmRlcmVyLnJlbmRlcih7c2NlbmU6IHRoaXMub3J0aG9TY2VuZV8sIGNhbWVyYTogdGhpcy5vcnRob0NhbWVyYV8sIHRhcmdldCwgY2xlYXJ9KTtcclxuICAgIH1cclxuXHJcbiAgICBibGl0KHJlbmRlcmVyOiBSZW5kZXJlciwgc291cmNlOiBSZW5kZXJUYXJnZXQgfCBUZXh0dXJlLCB0YXJnZXQ/OiBSZW5kZXJUYXJnZXQsIGNsZWFyPzogYm9vbGVhbikge1xyXG4gICAgICAgIHRoaXMuY29weXByb2dyYW1fLnVuaWZvcm1zWyd0TWFwJ10udmFsdWUgPSBzb3VyY2UudGV4dHVyZSA/IHNvdXJjZS50ZXh0dXJlIDogc291cmNlO1xyXG4gICAgICAgIHRoaXMucmVuZGVyUGFzcyhyZW5kZXJlciwgdGhpcy5jb3B5cHJvZ3JhbV8sIHRhcmdldCwgY2xlYXIpXHJcbiAgICAgICAgdGhpcy5tZXNoXy5wcm9ncmFtID0gdGhpcy5jb3B5cHJvZ3JhbV87XHJcbiAgICB9XHJcblxyXG59XHJcbiIsImltcG9ydCB7XG4gICAgQ2FtZXJhLFxuICAgIE9HTFJlbmRlcmluZ0NvbnRleHQsXG4gICAgUG9zdEZCTywgUG9zdE9wdGlvbnMsXG4gICAgUHJvZ3JhbSxcbiAgICBSZW5kZXJlcixcbiAgICBSZW5kZXJUYXJnZXQsXG4gICAgUmVuZGVyVGFyZ2V0T3B0aW9ucyxcbiAgICBUcmFuc2Zvcm1cbn0gZnJvbSBcIi4uL29nbFwiO1xuaW1wb3J0IHtVdGlsc30gZnJvbSBcIi4uL2V4dHJhcy9SZW5kZXJVdGlsc1wiO1xuaW1wb3J0IHtDdXN0b21Qb3N0LCBQYXNzfSBmcm9tIFwiLi4vZXh0cmFzL0N1c3RvbVBvc3RcIjtcbmltcG9ydCB7RW5jb2RpbmdIZWxwZXIsIFRvbmVNYXBwaW5nSGVscGVyfSBmcm9tIFwiLi4vdXRpbHMvdXRpbFwiO1xuZXhwb3J0IGNsYXNzIEhEUlJlbmRlclBhc3MgZXh0ZW5kcyBQYXNzIHtcbiAgICBwcml2YXRlIGJsYWNrUHJvZ3JhbTogUHJvZ3JhbTtcbiAgICBnZXQgY2FtZXJhKCk6IENhbWVyYSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9jYW1lcmE7XG4gICAgfVxuICAgIGdldCBzY2VuZSgpOiBUcmFuc2Zvcm0ge1xuICAgICAgICByZXR1cm4gdGhpcy5fc2NlbmU7XG4gICAgfVxuICAgIHByaXZhdGUgX3NjZW5lOiBUcmFuc2Zvcm07XG4gICAgcHJpdmF0ZSBfY2FtZXJhOiBDYW1lcmE7XG4gICAgcHJpdmF0ZSBibGVuZFByb2dyYW06IFByb2dyYW07XG4gICAgcHJpdmF0ZSBnbDogT0dMUmVuZGVyaW5nQ29udGV4dDtcbiAgICBjb25zdHJ1Y3RvcihnbDogT0dMUmVuZGVyaW5nQ29udGV4dCwgc2NlbmU6IFRyYW5zZm9ybSwgY2FtZXJhOiBDYW1lcmEpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgdGhpcy5nbCA9IGdsO1xuICAgICAgICB0aGlzLl9zY2VuZSA9IHNjZW5lO1xuICAgICAgICB0aGlzLl9jYW1lcmEgPSBjYW1lcmE7XG4gICAgICAgIHRoaXMubmVlZHNTd2FwID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5ibGVuZFByb2dyYW0gPSBuZXcgUHJvZ3JhbShnbCwge3ZlcnRleDogVXRpbHMuY29weVZlcnRleCwgZnJhZ21lbnQ6IGBcbiAgICAgICAgICAgIHByZWNpc2lvbiBoaWdocCBmbG9hdDtcbiAgICAgICAgICAgICNkZWZpbmUgaW5wdXRFbmNvZGluZyAke0VuY29kaW5nSGVscGVyLlJHQk0xNn1cbiAgICAgICAgICAgICNkZWZpbmUgb3V0cHV0RW5jb2RpbmcgJHtFbmNvZGluZ0hlbHBlci5SR0JNMTZ9XG4gICAgICAgICAgICAke0VuY29kaW5nSGVscGVyLnNoYWRlckNodW5rfVxuICAgICAgICAgICAgdW5pZm9ybSBzYW1wbGVyMkQgdE9wYXF1ZTtcbiAgICAgICAgICAgIHVuaWZvcm0gc2FtcGxlcjJEIHRUcmFuc3BhcmVudDtcbiAgICAgICAgICAgIHZhcnlpbmcgdmVjMiB2VXY7XG4gICAgICAgICAgICB2b2lkIG1haW4oKSB7XG4gICAgICAgICAgICAgICAgdmVjMyBvcGFxdWUgPSBpbnB1dFRleGVsVG9MaW5lYXIodGV4dHVyZTJEKHRPcGFxdWUsIHZVdikpLnJnYjtcbiAgICAgICAgICAgICAgICB2ZWM0IHRyYW5zcGFyZW50ID0gdGV4dHVyZTJEKHRUcmFuc3BhcmVudCwgdlV2KTtcbiAgICAgICAgICAgICAgICBnbF9GcmFnQ29sb3IgPSBsaW5lYXJUb091dHB1dFRleGVsKHZlYzQob3BhcXVlICogKDEuIC0gdHJhbnNwYXJlbnQuYSkgKyB0cmFuc3BhcmVudC5yZ2IgKiB0cmFuc3BhcmVudC5hLCAxLikpO1xuICAgICAgICAgICAgICAgIC8vIGdsX0ZyYWdDb2xvciA9IGxpbmVhclRvT3V0cHV0VGV4ZWwodmVjNChvcGFxdWUsIDEuKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIGAsIHVuaWZvcm1zOiB7XG4gICAgICAgICAgICAgICAgdE9wYXF1ZToge3ZhbHVlOiB7dGV4dHVyZTogbnVsbH19LFxuICAgICAgICAgICAgICAgIHRUcmFuc3BhcmVudDoge3ZhbHVlOiB7dGV4dHVyZTogbnVsbH19XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZGVwdGhUZXN0OiBmYWxzZSxcbiAgICAgICAgICAgIGRlcHRoV3JpdGU6IGZhbHNlXG5cbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuYmxhY2tQcm9ncmFtID0gbmV3IFByb2dyYW0oZ2wsIHt2ZXJ0ZXg6IFV0aWxzLmNvcHlWZXJ0ZXgsIGZyYWdtZW50OiBgXG4gICAgICAgICAgICBwcmVjaXNpb24gaGlnaHAgZmxvYXQ7XG4gICAgICAgICAgICB2YXJ5aW5nIHZlYzIgdlV2O1xuICAgICAgICAgICAgdm9pZCBtYWluKCkge1xuICAgICAgICAgICAgICAgIGdsX0ZyYWdDb2xvciA9IHZlYzQoMCwwLDAsMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIGAsIHVuaWZvcm1zOiB7XG4gICAgICAgICAgICAgICAgdE9wYXF1ZToge3ZhbHVlOiB7dGV4dHVyZTogbnVsbH19LFxuICAgICAgICAgICAgICAgIHRUcmFuc3BhcmVudDoge3ZhbHVlOiB7dGV4dHVyZTogbnVsbH19XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZGVwdGhUZXN0OiBmYWxzZSxcbiAgICAgICAgICAgIGRlcHRoV3JpdGU6IGZhbHNlXG5cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmVuZGVyV2l0aEZCTyhyZW5kZXJlcjogUmVuZGVyZXIsIGZibzogSERSRnJhbWUpe1xuICAgICAgICB0aGlzLl9zY2VuZS51cGRhdGVNYXRyaXhXb3JsZCgpO1xuICAgICAgICByZW5kZXJlci5nbC5jbGVhckNvbG9yKDAsMCwwLDApO1xuICAgICAgICBpZiAoZmJvLnRyYW5zcGFyZW50ICYmIGZiby5yZWFkKSB7XG4gICAgICAgICAgICBpZiAoIShmYm8udHJhbnNwYXJlbnQgJiYgZmJvLnJlYWQpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbGV0IHJlbmRlckxpc3QgPSByZW5kZXJlci5zb3J0UmVuZGVyTGlzdChyZW5kZXJlci5zY2VuZVRvUmVuZGVyTGlzdCh0aGlzLl9zY2VuZSwgdHJ1ZSwgdGhpcy5fY2FtZXJhKSwgdGhpcy5fY2FtZXJhLCB0cnVlKTtcbiAgICAgICAgICAgIHJlbmRlcmVyLnJlbmRlcih7XG4gICAgICAgICAgICAgICAgc2NlbmU6IHJlbmRlckxpc3Qub3BhcXVlLFxuICAgICAgICAgICAgICAgIGNhbWVyYTogdGhpcy5fY2FtZXJhLFxuICAgICAgICAgICAgICAgIHRhcmdldDogZmJvLnJlYWQsXG4gICAgICAgICAgICAgICAgc29ydDogZmFsc2UsXG4gICAgICAgICAgICAgICAgY2xlYXI6IGZhbHNlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMuZ2wuYmluZEZyYW1lYnVmZmVyKGZiby50cmFuc3BhcmVudC50YXJnZXQsIGZiby50cmFuc3BhcmVudC5idWZmZXIpO1xuICAgICAgICAgICAgaWYgKGZiby5yZWFkLmRlcHRoICYmICFmYm8ucmVhZC5zdGVuY2lsKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5nbC5mcmFtZWJ1ZmZlclJlbmRlcmJ1ZmZlcihmYm8udHJhbnNwYXJlbnQudGFyZ2V0LCB0aGlzLmdsLkRFUFRIX0FUVEFDSE1FTlQsIHRoaXMuZ2wuUkVOREVSQlVGRkVSLCBmYm8ucmVhZC5kZXB0aEJ1ZmZlcik7XG4gICAgICAgICAgICB9ZWxzZSBpZiAoZmJvLnJlYWQuc3RlbmNpbCAmJiAhZmJvLnJlYWQuZGVwdGgpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmdsLmZyYW1lYnVmZmVyUmVuZGVyYnVmZmVyKGZiby50cmFuc3BhcmVudC50YXJnZXQsIHRoaXMuZ2wuU1RFTkNJTF9BVFRBQ0hNRU5ULCB0aGlzLmdsLlJFTkRFUkJVRkZFUiwgZmJvLnJlYWQuc3RlbmNpbEJ1ZmZlcik7XG4gICAgICAgICAgICB9ZWxzZSBpZiAoZmJvLnJlYWQuZGVwdGggJiYgZmJvLnJlYWQuc3RlbmNpbCkge1xuICAgICAgICAgICAgICAgIHRoaXMuZ2wuZnJhbWVidWZmZXJSZW5kZXJidWZmZXIoZmJvLnRyYW5zcGFyZW50LnRhcmdldCwgdGhpcy5nbC5ERVBUSF9TVEVOQ0lMX0FUVEFDSE1FTlQsIHRoaXMuZ2wuUkVOREVSQlVGRkVSLCBmYm8ucmVhZC5kZXB0aFN0ZW5jaWxCdWZmZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZmJvLnRyYW5zcGFyZW50LmRlcHRoID0gdHJ1ZTtcbiAgICAgICAgICAgIGxldCBvbGRDbGVhckNvbG9yID0gcmVuZGVyZXIuY29sb3I7XG4gICAgICAgICAgICBsZXQgb2xkQ2xlYXJEZXB0aCA9IHJlbmRlcmVyLmRlcHRoO1xuICAgICAgICAgICAgcmVuZGVyZXIuY29sb3IgPSB0cnVlO1xuICAgICAgICAgICAgcmVuZGVyZXIuZGVwdGggPSBmYWxzZTtcbiAgICAgICAgICAgIC8vdG9kbzogY2hlY2sgc3RlbmNpbFxuICAgICAgICAgICAgcmVuZGVyZXIucmVuZGVyKHtcbiAgICAgICAgICAgICAgICBzY2VuZTogWy4uLnJlbmRlckxpc3QudHJhbnNwYXJlbnQsIC4uLnJlbmRlckxpc3QudWldLFxuICAgICAgICAgICAgICAgIGNhbWVyYTogdGhpcy5fY2FtZXJhLFxuICAgICAgICAgICAgICAgIHRhcmdldDogZmJvLnRyYW5zcGFyZW50LFxuICAgICAgICAgICAgICAgIHNvcnQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGNsZWFyOiB0cnVlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMuYmxlbmRQcm9ncmFtLnVuaWZvcm1zLnRPcGFxdWUudmFsdWUgPSBmYm8ucmVhZC50ZXh0dXJlO1xuICAgICAgICAgICAgdGhpcy5ibGVuZFByb2dyYW0udW5pZm9ybXMudFRyYW5zcGFyZW50LnZhbHVlID0gZmJvLnRyYW5zcGFyZW50LnRleHR1cmU7XG4gICAgICAgICAgICBVdGlscy5nZXRJbnN0YW5jZShyZW5kZXJlci5nbCkucmVuZGVyUGFzcyhyZW5kZXJlciwgdGhpcy5ibGVuZFByb2dyYW0sIGZiby53cml0ZSwgdHJ1ZSk7XG4gICAgICAgICAgICByZW5kZXJlci5jb2xvciA9IG9sZENsZWFyQ29sb3I7XG4gICAgICAgICAgICByZW5kZXJlci5kZXB0aCA9IG9sZENsZWFyRGVwdGg7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZW5kZXJlci5yZW5kZXIoe3NjZW5lOiB0aGlzLl9zY2VuZSwgY2FtZXJhOiB0aGlzLl9jYW1lcmEsIHRhcmdldDogZmJvLnJlYWR9KTtcbiAgICAgICAgfVxuICAgIH1cbn1cbmV4cG9ydCBjbGFzcyBIRFJUb25lTWFwUGFzcyBleHRlbmRzIFBhc3Mge1xuICAgIHByaXZhdGUgdG9uZU1hcFByb2dyYW06IFByb2dyYW07XG4gICAgcHJpdmF0ZSBnbDogT0dMUmVuZGVyaW5nQ29udGV4dDtcbiAgICBjb25zdHJ1Y3RvcihnbDogT0dMUmVuZGVyaW5nQ29udGV4dCkge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzLmdsID0gZ2w7XG4gICAgICAgIHRoaXMubmVlZHNTd2FwID0gZmFsc2U7XG4gICAgICAgIHRoaXMudG9uZU1hcFByb2dyYW0gPSBuZXcgUHJvZ3JhbShnbCwge3ZlcnRleDogVXRpbHMuY29weVZlcnRleCwgZnJhZ21lbnQ6IGBcbiAgICAgICAgICAgIHByZWNpc2lvbiBoaWdocCBmbG9hdDtcbiAgICAgICAgICAgICNkZWZpbmUgaW5wdXRFbmNvZGluZyAke0VuY29kaW5nSGVscGVyLlJHQk0xNn1cbiAgICAgICAgICAgICNkZWZpbmUgb3V0cHV0RW5jb2RpbmcgJHtFbmNvZGluZ0hlbHBlci5zUkdCfVxuICAgICAgICAgICAgI2RlZmluZSB0b25lbWFwcGluZ01vZGUgJHtUb25lTWFwcGluZ0hlbHBlci5MaW5lYXJ9XG4gICAgICAgICAgICAke0VuY29kaW5nSGVscGVyLnNoYWRlckNodW5rfVxuICAgICAgICAgICAgJHtUb25lTWFwcGluZ0hlbHBlci5zaGFkZXJDaHVua31cbiAgICAgICAgICAgIHVuaWZvcm0gc2FtcGxlcjJEIHRNYXA7XG4gICAgICAgICAgICB2YXJ5aW5nIHZlYzIgdlV2O1xuICAgICAgICAgICAgdm9pZCBtYWluKCkge1xuICAgICAgICAgICAgICAgIHZlYzQgY29sb3IgPSBpbnB1dFRleGVsVG9MaW5lYXIodGV4dHVyZTJEKHRNYXAsIHZVdikpO1xuICAgICAgICAgICAgICAgIGNvbG9yLnJnYiA9IHRvbmVNYXBDb2xvcihjb2xvci5yZ2IpO1xuICAgICAgICAgICAgICAgIGdsX0ZyYWdDb2xvciA9IGxpbmVhclRvT3V0cHV0VGV4ZWwoY29sb3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICBgLCB1bmlmb3Jtczoge1xuICAgICAgICAgICAgICAgIHRNYXA6IHt2YWx1ZToge3RleHR1cmU6IG51bGx9fSxcbiAgICAgICAgICAgICAgICAuLi5Ub25lTWFwcGluZ0hlbHBlci51bmlmb3JtcyAvL3RvZG86IHVuaWZvcm0gdXRpbHMgY2xvbmUuXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGRlcHRoVGVzdDogZmFsc2UsXG4gICAgICAgICAgICAgICAgZGVwdGhXcml0ZTogZmFsc2VcbiAgICAgICAgICAgIH1cbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICByZW5kZXJXaXRoRkJPKHJlbmRlcmVyOiBSZW5kZXJlciwgZmJvOiBIRFJGcmFtZSl7XG4gICAgICAgIHRoaXMudG9uZU1hcFByb2dyYW0udW5pZm9ybXNbJ3RNYXAnXS52YWx1ZSA9IGZiby5yZWFkPy50ZXh0dXJlO1xuICAgICAgICBVdGlscy5nZXRJbnN0YW5jZShyZW5kZXJlci5nbCkucmVuZGVyUGFzcyhyZW5kZXJlciwgdGhpcy50b25lTWFwUHJvZ3JhbSwgdGhpcy5yZW5kZXJUb1NjcmVlbiA/IHVuZGVmaW5lZCA6IGZiby53cml0ZSwgdHJ1ZSk7XG4gICAgfVxuICAgIHJlc2l6ZSh7IHdpZHRoLCBoZWlnaHQsIGRwciB9OiBQYXJ0aWFsPHtcbiAgICAgICAgd2lkdGg6IG51bWJlcjtcbiAgICAgICAgaGVpZ2h0OiBudW1iZXI7XG4gICAgICAgIGRwcjogbnVtYmVyO1xuICAgIH0+KTogdm9pZHtcbiAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBIRFJIZWxwZXIge1xuICAgIHJlYWRvbmx5IGZsb2F0aW5nU3VwcG9ydEV4dCA9IHtcbiAgICAgICAgdGV4dHVyZTogJ09FU190ZXh0dXJlX2Zsb2F0JyxcbiAgICAgICAgbGluZWFyOiAnT0VTX3RleHR1cmVfZmxvYXRfbGluZWFyJyxcbiAgICAgICAgY29sb3I6ICdXRUJHTF9jb2xvcl9idWZmZXJfZmxvYXQnLFxuICAgICAgICBoX3RleHR1cmU6ICdPRVNfdGV4dHVyZV9oYWxmX2Zsb2F0JyxcbiAgICAgICAgaF9saW5lYXI6ICdPRVNfdGV4dHVyZV9oYWxmX2Zsb2F0X2xpbmVhcicsXG4gICAgICAgIGhfY29sb3I6ICdFWFRfY29sb3JfYnVmZmVyX2hhbGZfZmxvYXQnLFxuICAgIH07XG4gICAgcHJpdmF0ZSByZWFkb25seSBfZmxvYXRpbmdTdXBwb3J0OiBhbnkgPSB7XG4gICAgICAgIHRleHR1cmU6IGZhbHNlLFxuICAgICAgICBsaW5lYXI6IGZhbHNlLFxuICAgICAgICBjb2xvcjogZmFsc2UsXG4gICAgICAgIGhfdGV4dHVyZTogZmFsc2UsXG4gICAgICAgIGhfbGluZWFyOiBmYWxzZSxcbiAgICAgICAgaF9jb2xvcjogZmFsc2UsXG4gICAgfTtcbiAgICBwcml2YXRlIGdsOiBPR0xSZW5kZXJpbmdDb250ZXh0O1xuICAgIGdldCBoYWxmRmxvYXRUeXBlKCk6IG51bWJlcntcbiAgICAgICAgcmV0dXJuIHRoaXMuZmxvYXRpbmdTdXBwb3J0LmhfY29sb3IgPyB0aGlzLmZsb2F0aW5nU3VwcG9ydC5oX3RleHR1cmUuSEFMRl9GTE9BVF9PRVMgOiB0aGlzLmZsb2F0VHlwZTtcbiAgICB9O1xuICAgIGdldCBmbG9hdFR5cGUoKTogbnVtYmVye1xuICAgICAgICByZXR1cm4gKHRoaXMuZmxvYXRpbmdTdXBwb3J0LmNvbG9yID8gdGhpcy5nbC5GTE9BVCA6IHRoaXMuZ2wuVU5TSUdORURfQllURSk7XG4gICAgfTtcbiAgICBnZXQgaW50VHlwZSgpOiBudW1iZXJ7XG4gICAgICAgIHJldHVybiB0aGlzLmdsLlVOU0lHTkVEX0JZVEU7XG4gICAgfTtcbiAgICBnZXQgY2FuRmxvYXREcmF3KCk6IG51bWJlcntcbiAgICAgICAgcmV0dXJuIHRoaXMuZmxvYXRpbmdTdXBwb3J0LmhfY29sb3IgfHwgdGhpcy5mbG9hdGluZ1N1cHBvcnQuY29sb3I7XG4gICAgfTtcblxuICAgIGNvbnN0cnVjdG9yKGdsOiBPR0xSZW5kZXJpbmdDb250ZXh0KSB7XG4gICAgICAgIHRoaXMuZ2wgPSBnbDtcbiAgICAgICAgdGhpcy5pbml0RmxvYXRTdXBwb3J0KCk7XG4gICAgfVxuXG4gICAgaW5pdEZsb2F0U3VwcG9ydCgpIHtcbiAgICAgICAgbGV0IGV4dCA9IHRoaXMuZ2wuZ2V0RXh0ZW5zaW9uKHRoaXMuZmxvYXRpbmdTdXBwb3J0RXh0LnRleHR1cmUpO1xuICAgICAgICBpZiAoZXh0KSB7XG4gICAgICAgICAgICB0aGlzLl9mbG9hdGluZ1N1cHBvcnQudGV4dHVyZSA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLl9mbG9hdGluZ1N1cHBvcnQuY29sb3IgPSB0aGlzLmdsLmdldEV4dGVuc2lvbih0aGlzLmZsb2F0aW5nU3VwcG9ydEV4dC5jb2xvcik7IC8vIHRvZG8gY2hlY2sgYnkgZHJhd2luZ1xuICAgICAgICAgICAgdGhpcy5fZmxvYXRpbmdTdXBwb3J0LmxpbmVhciA9IHRoaXMuZ2wuZ2V0RXh0ZW5zaW9uKHRoaXMuZmxvYXRpbmdTdXBwb3J0RXh0LmxpbmVhcik7XG4gICAgICAgIH1cbiAgICAgICAgZXh0ID0gdGhpcy5nbC5nZXRFeHRlbnNpb24odGhpcy5mbG9hdGluZ1N1cHBvcnRFeHQuaF90ZXh0dXJlKTtcbiAgICAgICAgaWYgKGV4dCkge1xuICAgICAgICAgICAgdGhpcy5fZmxvYXRpbmdTdXBwb3J0LmhfdGV4dHVyZSA9IGV4dDtcbiAgICAgICAgICAgIHRoaXMuX2Zsb2F0aW5nU3VwcG9ydC5oX2NvbG9yID0gdGhpcy5nbC5nZXRFeHRlbnNpb24odGhpcy5mbG9hdGluZ1N1cHBvcnRFeHQuaF9jb2xvcik7XG4gICAgICAgICAgICB0aGlzLl9mbG9hdGluZ1N1cHBvcnQuaF9saW5lYXIgPSB0aGlzLmdsLmdldEV4dGVuc2lvbih0aGlzLmZsb2F0aW5nU3VwcG9ydEV4dC5oX2xpbmVhcik7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZ2V0IGZsb2F0aW5nU3VwcG9ydCgpOiBhbnkge1xuICAgICAgICByZXR1cm4gey4uLnRoaXMuX2Zsb2F0aW5nU3VwcG9ydH07XG4gICAgfVxuXG5cbn1cblxuZXhwb3J0IGNsYXNzIEhEUkZyYW1lIGltcGxlbWVudHMgUG9zdEZCT3tcbiAgICByZWFkPzogUmVuZGVyVGFyZ2V0O1xuICAgIHdyaXRlPzogUmVuZGVyVGFyZ2V0O1xuICAgIHRyYW5zcGFyZW50PzogUmVuZGVyVGFyZ2V0O1xuICAgIHByaXZhdGUgZ2w6IE9HTFJlbmRlcmluZ0NvbnRleHQ7XG4gICAgcHJpdmF0ZSBoZWxwZXI6IEhEUkhlbHBlcjtcblxuICAgIGNvbnN0cnVjdG9yKGdsOiBPR0xSZW5kZXJpbmdDb250ZXh0LCBoZWxwZXI6IEhEUkhlbHBlcikge1xuICAgICAgICB0aGlzLmdsID0gZ2w7XG4gICAgICAgIHRoaXMuaGVscGVyID0gaGVscGVyO1xuICAgIH1cbiAgICBzd2FwKCk6IHZvaWQge1xuICAgICAgICBsZXQgdCA9IHRoaXMucmVhZDtcbiAgICAgICAgdGhpcy5yZWFkID0gdGhpcy53cml0ZTtcbiAgICAgICAgdGhpcy53cml0ZSA9IHQ7XG4gICAgfVxuXG4gICAgY3JlYXRlKG9wdGlvbnM6IFBhcnRpYWw8UmVuZGVyVGFyZ2V0T3B0aW9ucz4pe1xuICAgICAgICB0aGlzLnJlYWQgPSBuZXcgUmVuZGVyVGFyZ2V0KHRoaXMuZ2wsIG9wdGlvbnMpO1xuICAgICAgICB0aGlzLndyaXRlID0gbmV3IFJlbmRlclRhcmdldCh0aGlzLmdsLCBvcHRpb25zKTtcbiAgICAgICAgdGhpcy50cmFuc3BhcmVudCA9IG5ldyBSZW5kZXJUYXJnZXQodGhpcy5nbCwge1xuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgICAgIHR5cGU6IHRoaXMuaGVscGVyLmhhbGZGbG9hdFR5cGUsXG4gICAgICAgICAgICBmb3JtYXQ6IHRoaXMuZ2wuUkdCQSxcbiAgICAgICAgICAgIGRlcHRoOiBmYWxzZSxcbiAgICAgICAgICAgIGludGVybmFsRm9ybWF0OiAodGhpcy5oZWxwZXIuY2FuRmxvYXREcmF3ICYmIHRoaXMuZ2wucmVuZGVyZXIuaXNXZWJnbDIpID8gKHRoaXMuZ2wgYXMgV2ViR0wyUmVuZGVyaW5nQ29udGV4dCkuUkdCQTMyRiA6IHRoaXMuZ2wuUkdCQSxcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZGlzcG9zZSgpe1xuICAgICAgICB0aGlzLnJlYWQgJiYgdGhpcy5yZWFkLmRpc3Bvc2UoKTtcbiAgICAgICAgdGhpcy53cml0ZSAmJiB0aGlzLndyaXRlLmRpc3Bvc2UoKTtcbiAgICAgICAgdGhpcy50cmFuc3BhcmVudCAmJiB0aGlzLnRyYW5zcGFyZW50LmRpc3Bvc2UoKTtcbiAgICAgICAgdGhpcy5yZWFkID0gdW5kZWZpbmVkO1xuICAgICAgICB0aGlzLndyaXRlID0gdW5kZWZpbmVkO1xuICAgICAgICB0aGlzLnRyYW5zcGFyZW50ID0gdW5kZWZpbmVkO1xuICAgIH1cblxufVxuXG5leHBvcnQgaW50ZXJmYWNlIEhEUlBvc3RPcHRpb25zIGV4dGVuZHMgUG9zdE9wdGlvbnN7XG4gICAgLy8gZW5jb2Rpbmc6IG51bWJlclxufVxuXG5leHBvcnQgY2xhc3MgSERSQ29tcG9zZXIgZXh0ZW5kcyBDdXN0b21Qb3N0e1xuICAgIGNvbnN0cnVjdG9yKGdsOiBPR0xSZW5kZXJpbmdDb250ZXh0LCBvcHRpb25zOiBQYXJ0aWFsPEhEUlBvc3RPcHRpb25zPikge1xuICAgICAgICBzdXBlcihnbCwgb3B0aW9ucywgbmV3IEhEUkZyYW1lKGdsLCBuZXcgSERSSGVscGVyKGdsKSkpO1xuICAgIH1cblxuICAgIGRpc3Bvc2VGYm8oKSB7XG4gICAgICAgICh0aGlzLmZibyBhcyBIRFJGcmFtZSkuZGlzcG9zZSgpO1xuICAgIH1cblxuICAgIGluaXRGYm8oKSB7XG4gICAgICAgICh0aGlzLmZibyBhcyBIRFJGcmFtZSkuY3JlYXRlKHRoaXMub3B0aW9ucyk7XG4gICAgfVxufVxuIiwiZXhwb3J0ICogZnJvbSBcIi4vb2dsXCJcblxuZXhwb3J0ICogZnJvbSAnLi9tYXRlcmlhbHMvcGJybWF0ZXJpYWwnO1xuZXhwb3J0ICogZnJvbSBcIi4vdXRpbHMvdW5pZm9ybVV0aWxzXCI7XG5leHBvcnQgKiBmcm9tIFwiLi91dGlscy9wYnJoZWxwZXJcIjtcbmV4cG9ydCAqIGZyb20gXCIuL3V0aWxzL3V0aWxcIjtcbmV4cG9ydCAqIGZyb20gXCIuL3V0aWxzL2V2ZW50ZGlzcGF0Y2hlclwiO1xuZXhwb3J0ICogZnJvbSBcIi4vZXh0cmFzL0N1c3RvbVBvc3RcIjtcbmV4cG9ydCAqIGZyb20gXCIuL2V4dHJhcy9SZW5kZXJVdGlsc1wiO1xuZXhwb3J0ICogZnJvbSBcIi4vaGRyL0hEUkNvbXBvc2VyXCI7XG4iLCJpbXBvcnQgcGJydmVydCBmcm9tICcuL3NoYWRlcnMvcGJyLnZlcnQnO1xuaW1wb3J0IHBicmZyYWcgZnJvbSAnLi9zaGFkZXJzL3Bici5mcmFnJztcbmltcG9ydCB7UHJvZ3JhbUNhY2hlfSBmcm9tICcuLi91dGlscy9wcm9ncmFtY2FjaGUnO1xuaW1wb3J0IHtQcm9ncmFtLCBUZXh0dXJlLCBUZXh0dXJlTG9hZGVyLCBWZWMzLCBWZWM0fSBmcm9tIFwiLi4vb2dsXCI7XG5pbXBvcnQge0VuY29kaW5nSGVscGVyfSBmcm9tIFwiLi4vdXRpbHMvdXRpbFwiO1xuXG5leHBvcnQgdHlwZSBUVW5pZm9ybXMgPSBSZWNvcmQ8c3RyaW5nLCB7IHZhbHVlPzogYW55IH0+XG5cbmV4cG9ydCBjbGFzcyBQQlJNYXRlcmlhbCB7XG4gICAgcHJvdGVjdGVkIHN0YXRpYyByZWFkb25seSBkZWZhdWx0VmVydGV4OiBzdHJpbmcgPSBwYnJ2ZXJ0O1xuICAgIHByb3RlY3RlZCBzdGF0aWMgcmVhZG9ubHkgZGVmYXVsdEZyYWdtZW50OiBzdHJpbmcgPSBgXG5wcmVjaXNpb24gaGlnaHAgZmxvYXQ7XG5wcmVjaXNpb24gaGlnaHAgaW50O1xuI2RlZmluZSBpbnB1dEVuY29kaW5nICR7RW5jb2RpbmdIZWxwZXIuTGluZWFyfVxuI2RlZmluZSBvdXRwdXRFbmNvZGluZyAke0VuY29kaW5nSGVscGVyLlJHQk0xNn1cbiR7RW5jb2RpbmdIZWxwZXIuc2hhZGVyQ2h1bmt9IFxuJHtwYnJmcmFnfVxuYFxuXG4gICAgcHJpdmF0ZSBnbF86IGFueTtcbiAgICBwcml2YXRlIHByb2dyYW1fOiBQcm9ncmFtO1xuICAgIHByaXZhdGUgdW5pZm9ybXNfOiBhbnk7XG4gICAgcHJpdmF0ZSBzdGF0aWMgbHV0VGV4dHVyZU1hcDogTWFwPHN0cmluZywgVGV4dHVyZT4gPSBuZXcgTWFwPHN0cmluZywgVGV4dHVyZT4oKTtcbiAgICBwcml2YXRlIGVudk1hcFNwZWN1bGFyXz86IFRleHR1cmU7XG4gICAgcHJpdmF0ZSBlbnZNYXBEaWZmdXNlXz86IFRleHR1cmU7XG5cbiAgICBwcml2YXRlIGNvbG9yXzogVmVjNCA9IG5ldyBWZWM0KDEsIDEsIDEsIDEpO1xuICAgIHByaXZhdGUgcm91Z2huZXNzXzogbnVtYmVyID0gMDtcbiAgICBwcml2YXRlIG1ldGFsbmVzc186IG51bWJlciA9IDA7XG4gICAgcHJpdmF0ZSBlbnZNYXBJbnRlbnNpdHlfOiBudW1iZXIgPSAxO1xuXG4gICAgY29uc3RydWN0b3IoZ2w6IGFueSwgcGJycGFyYW1zPzogUEJSTWF0ZXJpYWxQYXJhbXMsIGRlZmluZXM/IDogc3RyaW5nLCB1bmlmb3Jtcz86IFRVbmlmb3Jtcywgc2hhZGVycz86IHtmcmFnPzogc3RyaW5nLCB2ZXJ0Pzogc3RyaW5nfSkge1xuICAgICAgICB0aGlzLmdsXyA9IGdsO1xuXG4gICAgICAgIGlmKCFQQlJNYXRlcmlhbC5sdXRUZXh0dXJlTWFwLmdldChnbC5jYW52YXMuaWQpKSB7XG4gICAgICAgICAgICBQQlJNYXRlcmlhbC5sdXRUZXh0dXJlTWFwLnNldChnbC5jYW52YXMuaWQsIFRleHR1cmVMb2FkZXIubG9hZChnbCwge1xuICAgICAgICAgICAgICBzcmM6ICdodHRwczovL2Fzc2V0cy5qZXdsci5jb20vajNkL2x1dC5wbmcnLFxuICAgICAgICAgICAgfSkpO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHBiclZlcnQgPSBzaGFkZXJzPy52ZXJ0ID8/IFBCUk1hdGVyaWFsLmRlZmF1bHRWZXJ0ZXg7XG4gICAgICAgIGxldCBwYnJGcmFnID0gc2hhZGVycz8uZnJhZyA/PyBQQlJNYXRlcmlhbC5kZWZhdWx0RnJhZ21lbnQ7XG5cbiAgICAgICAgdGhpcy5jb2xvcl8gPSBwYnJwYXJhbXM/LmJhc2VDb2xvckZhY3RvciAhPT0gdW5kZWZpbmVkID8gbmV3IFZlYzQoKS5jb3B5KHBicnBhcmFtcy5iYXNlQ29sb3JGYWN0b3IpIDogbmV3IFZlYzQoMSwgMSwgMSwgMSk7XG4gICAgICAgIHRoaXMucm91Z2huZXNzID0gcGJycGFyYW1zPy5yb3VnaG5lc3MgIT09IHVuZGVmaW5lZCA/IHBicnBhcmFtcy5yb3VnaG5lc3MgOiAwO1xuICAgICAgICB0aGlzLm1ldGFsbmVzcyA9IHBicnBhcmFtcz8ubWV0YWxuZXNzICE9PSB1bmRlZmluZWQgPyBwYnJwYXJhbXMubWV0YWxuZXNzIDogMDtcbiAgICAgICAgdGhpcy5lbnZNYXBJbnRlbnNpdHkgPSBwYnJwYXJhbXM/LmVudk1hcEludGVuc2l0eSAhPT0gdW5kZWZpbmVkID8gcGJycGFyYW1zPy5lbnZNYXBJbnRlbnNpdHkgOiAxO1xuXG4gICAgICAgIHRoaXMudW5pZm9ybXNfID0ge1xuICAgICAgICAgICAgdUJhc2VDb2xvckZhY3RvcjogeyB2YWx1ZTogbmV3IFZlYzQoKS5jb3B5KHRoaXMuY29sb3JfKSB9LFxuICAgICAgICAgICAgdEJhc2VDb2xvcjogeyB2YWx1ZTogcGJycGFyYW1zPy5iYXNlQ29sb3JUZXh0dXJlID8gcGJycGFyYW1zPy5iYXNlQ29sb3JUZXh0dXJlLnRleHR1cmUgOiBudWxsIH0sXG5cbiAgICAgICAgICAgIHVSb3VnaG5lc3M6IHsgdmFsdWU6IHBicnBhcmFtcz8ucm91Z2huZXNzICE9PSB1bmRlZmluZWQgPyBwYnJwYXJhbXM/LnJvdWdobmVzcyA6IDEgfSxcbiAgICAgICAgICAgIHVNZXRhbGxpYzogeyB2YWx1ZTogcGJycGFyYW1zPy5tZXRhbG5lc3MgIT09IHVuZGVmaW5lZCA/IHBicnBhcmFtcz8ubWV0YWxuZXNzIDogMSB9LFxuXG4gICAgICAgICAgICB0Tm9ybWFsOiB7IHZhbHVlOiB7IHRleHR1cmU6IG51bGx9IH0sXG4gICAgICAgICAgICB1Tm9ybWFsU2NhbGU6IHsgdmFsdWU6IHBicnBhcmFtcz8ubm9ybWFsU2NhbGUgfHwgMSB9LFxuXG4gICAgICAgICAgICB0T2NjbHVzaW9uOiB7IHZhbHVlOiB7IHRleHR1cmU6IG51bGx9IH0sXG5cbiAgICAgICAgICAgIHRFbWlzc2l2ZTogeyB2YWx1ZTogeyB0ZXh0dXJlOiBudWxsfSB9LFxuICAgICAgICAgICAgdUVtaXNzaXZlOiB7IHZhbHVlOiBwYnJwYXJhbXM/LmVtaXNzaXZlIHx8IFswLCAwLCAwXSB9LFxuXG4gICAgICAgICAgICB0TFVUOiB7IHZhbHVlOiBQQlJNYXRlcmlhbC5sdXRUZXh0dXJlTWFwLmdldChnbC5jYW52YXMuaWQpIH0sXG4gICAgICAgICAgICB0RW52RGlmZnVzZTogeyB2YWx1ZTogeyB0ZXh0dXJlOiBudWxsfSB9LFxuICAgICAgICAgICAgdEVudlNwZWN1bGFyOiB7IHZhbHVlOiB7IHRleHR1cmU6IG51bGx9IH0sXG4gICAgICAgICAgICB1RW52RGlmZnVzZTogeyB2YWx1ZTogMC41IH0sXG4gICAgICAgICAgICB1RW52U3BlY3VsYXI6IHsgdmFsdWU6IDAuNSB9LFxuICAgICAgICAgICAgdUVudk1hcEludGVuc2l0eTogeyB2YWx1ZTogMSB9LFxuXG4gICAgICAgICAgICB1QWxwaGE6IHsgdmFsdWU6IHBicnBhcmFtcz8uYWxwaGEgfSxcbiAgICAgICAgICAgIHVBbHBoYUN1dG9mZjogeyB2YWx1ZTogcGJycGFyYW1zPy5hbHBoYUN1dG9mZiB9LFxuXG4gICAgICAgICAgICB1VHJhbnNwYXJlbnQ6IHsgdmFsdWU6IHBicnBhcmFtcz8udHJhbnNwYXJlbnQgfSxcblxuICAgICAgICAgICAgLi4uKHVuaWZvcm1zPz97fSksXG4gICAgICAgIH1cbiAgICAgICAgZGVmaW5lcyA9IGRlZmluZXMgPyBkZWZpbmVzIDogYGA7XG4gICAgICAgIHRoaXMucHJvZ3JhbV8gPSB0aGlzLmNyZWF0ZVByb2dyYW1fKGRlZmluZXMsIHBiclZlcnQsIHBickZyYWcpO1xuICAgIH1cblxuICAgIGdldCBpc1BCUk1hdGVyaWFsKCkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBnZXQgcHJvZ3JhbSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJvZ3JhbV87XG4gICAgfVxuXG4gICAgc2V0IGNvbG9yKGNvbG9yOiBWZWM0KSB7XG4gICAgICAgIHRoaXMuY29sb3JfLmNvcHkoY29sb3IpO1xuICAgIH1cblxuICAgIGdldCBjb2xvcigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29sb3JfO1xuICAgIH1cblxuICAgIHNldCBlbWlzc2l2ZShjb2xvcjogVmVjMykge1xuICAgICAgICBsZXQgY29sb3JfID0gdGhpcy51bmlmb3Jtc18udUVtaXNzaXZlLnZhbHVlO1xuICAgICAgICBjb2xvcl8uY29weShjb2xvcik7XG4gICAgfVxuXG4gICAgZ2V0IGVtaXNzaXZlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy51bmlmb3Jtc18udUVtaXNzaXZlLnZhbHVlO1xuICAgIH1cblxuICAgIHNldCByb3VnaG5lc3Mocm91Z2huZXNzOiBudW1iZXIpIHtcbiAgICAgICAgdGhpcy5yb3VnaG5lc3NfID0gcm91Z2huZXNzO1xuICAgIH1cblxuICAgIGdldCByb3VnaG5lc3MoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnJvdWdobmVzc187XG4gICAgfVxuXG4gICAgc2V0IG1ldGFsbmVzcyhtZXRhbG5lc3M6IG51bWJlcikge1xuICAgICAgICB0aGlzLm1ldGFsbmVzc18gPSBtZXRhbG5lc3M7XG4gICAgfVxuXG4gICAgZ2V0IG1ldGFsbmVzcygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubWV0YWxuZXNzXztcbiAgICB9XG5cbiAgICBzZXQgbm9ybWFsU2NhbGUobm9ybWFsU2NhbGU6IG51bWJlcikge1xuICAgICAgICB0aGlzLnVuaWZvcm1zXy51Tm9ybWFsU2NhbGUudmFsdWUgPSBub3JtYWxTY2FsZTtcbiAgICB9XG5cbiAgICBnZXQgbm9ybWFsU2NhbGUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnVuaWZvcm1zXy51Tm9ybWFsU2NhbGUudmFsdWU7XG4gICAgfVxuXG4gICAgc2V0IGVudk1hcFNwZWN1bGFyKGVudk1hcFNwZWN1bGFyOiBhbnkpIHtcbiAgICAgICAgdGhpcy5lbnZNYXBTcGVjdWxhcl8gPSBlbnZNYXBTcGVjdWxhcjtcbiAgICB9XG5cbiAgICBnZXQgZW52TWFwU3BlY3VsYXIoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmVudk1hcFNwZWN1bGFyXztcbiAgICB9XG5cbiAgICBzZXQgZW52TWFwRGlmZnVzZShlbnZNYXBEaWZmdXNlOiBhbnkpIHtcbiAgICAgICAgdGhpcy5lbnZNYXBEaWZmdXNlXyA9IGVudk1hcERpZmZ1c2U7XG4gICAgfVxuXG4gICAgZ2V0IGVudk1hcERpZmZ1c2UoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmVudk1hcERpZmZ1c2VfO1xuICAgIH1cblxuICAgIHNldCBlbnZNYXBJbnRlbnNpdHkoZW52TWFwSW50ZW5zaXR5OiBhbnkpIHtcbiAgICAgICAgdGhpcy5lbnZNYXBJbnRlbnNpdHlfID0gZW52TWFwSW50ZW5zaXR5O1xuICAgIH1cblxuICAgIGdldCBlbnZNYXBJbnRlbnNpdHkoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmVudk1hcEludGVuc2l0eV87XG4gICAgfVxuXG4gICAgcHVibGljIHNlcmlhbGl6ZSgpIDogUEJSTWF0ZXJpYWxQYXJhbXMge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgYmFzZUNvbG9yOiBuZXcgVmVjNCgxLCAxLCAxLCAxKSxcbiAgICAgICAgICAgIGJhc2VDb2xvckZhY3RvcjogdGhpcy5jb2xvcl8uY29weShuZXcgVmVjNCgpKSxcbiAgICAgICAgICAgIHJvdWdobmVzczogdGhpcy5yb3VnaG5lc3NfLFxuICAgICAgICAgICAgbWV0YWxuZXNzOiB0aGlzLm1ldGFsbmVzc18sXG4gICAgICAgICAgICBlbnZNYXBJbnRlbnNpdHk6IHRoaXMuZW52TWFwSW50ZW5zaXR5XG4gICAgICAgICAgICAvLyBub3JtYWxTY2FsZTogdGhpcy5ub3JtYWxTY2FsZVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIGxvYWQocGFyYW1zOiBQQlJNYXRlcmlhbFBhcmFtcykge1xuICAgICAgICBpZihwYXJhbXMpIHtcbiAgICAgICAgICAgIGlmKHBhcmFtcy5iYXNlQ29sb3JGYWN0b3IpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbG9yXy54ID0gcGFyYW1zLmJhc2VDb2xvckZhY3RvclswXSAhPT0gdW5kZWZpbmVkID8gcGFyYW1zLmJhc2VDb2xvckZhY3RvclswXSA6IHBhcmFtcy5iYXNlQ29sb3JGYWN0b3IueDtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbG9yXy55ID0gcGFyYW1zLmJhc2VDb2xvckZhY3RvclsxXSAhPT0gdW5kZWZpbmVkID8gcGFyYW1zLmJhc2VDb2xvckZhY3RvclsxXSA6IHBhcmFtcy5iYXNlQ29sb3JGYWN0b3IueTtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbG9yXy56ID0gcGFyYW1zLmJhc2VDb2xvckZhY3RvclsyXSAhPT0gdW5kZWZpbmVkID8gcGFyYW1zLmJhc2VDb2xvckZhY3RvclsyXSA6IHBhcmFtcy5iYXNlQ29sb3JGYWN0b3IuejtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbG9yXy53ID0gcGFyYW1zLmJhc2VDb2xvckZhY3RvclszXSAhPT0gdW5kZWZpbmVkID8gcGFyYW1zLmJhc2VDb2xvckZhY3RvclszXSA6IHBhcmFtcy5iYXNlQ29sb3JGYWN0b3IudztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmKHBhcmFtcy5lbWlzc2l2ZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuZW1pc3NpdmUueCA9IHBhcmFtcy5lbWlzc2l2ZS54O1xuICAgICAgICAgICAgICAgIHRoaXMuZW1pc3NpdmUueSA9IHBhcmFtcy5lbWlzc2l2ZS55O1xuICAgICAgICAgICAgICAgIHRoaXMuZW1pc3NpdmUueiA9IHBhcmFtcy5lbWlzc2l2ZS56O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYocGFyYW1zLnJvdWdobmVzcyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5yb3VnaG5lc3MgPSBwYXJhbXMucm91Z2huZXNzO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYocGFyYW1zLm1ldGFsbmVzcyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tZXRhbG5lc3MgPSBwYXJhbXMubWV0YWxuZXNzO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYocGFyYW1zLmVudk1hcEludGVuc2l0eSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5lbnZNYXBJbnRlbnNpdHkgPSBwYXJhbXMuZW52TWFwSW50ZW5zaXR5O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICB9XG5cbiAgICBwcml2YXRlIGNyZWF0ZVByb2dyYW1fKGRlZmluZXM6IHN0cmluZywgdmVydGV4Pzogc3RyaW5nLCBmcmFnbWVudD86IHN0cmluZykge1xuICAgICAgICB2ZXJ0ZXggPSB2ZXJ0ZXggPz8gUEJSTWF0ZXJpYWwuZGVmYXVsdFZlcnRleFxuICAgICAgICBmcmFnbWVudCA9IGZyYWdtZW50ID8/IFBCUk1hdGVyaWFsLmRlZmF1bHRGcmFnbWVudDtcblxuICAgICAgICB2ZXJ0ZXggPSBkZWZpbmVzICsgdmVydGV4O1xuICAgICAgICBmcmFnbWVudCA9IGRlZmluZXMgKyBmcmFnbWVudDtcblxuICAgICAgICBsZXQgcHJvZ3JhbSA9IFByb2dyYW1DYWNoZS5nZXRJbnN0YW5jZSgpLmNyZWF0ZVByb2dyYW0odGhpcy5nbF8sIHZlcnRleCwgZnJhZ21lbnQsIHRoaXMudW5pZm9ybXNfKTtcbiAgICAgICAgLy8gY29uc3QgcHJvZ3JhbSA9IG5ldyBQcm9ncmFtKHRoaXMuZ2xfLCB7XG4gICAgICAgIC8vICAgICB2ZXJ0ZXgsXG4gICAgICAgIC8vICAgICBmcmFnbWVudCxcbiAgICAgICAgLy8gICAgIHVuaWZvcm1zOiB0aGlzLnVuaWZvcm1zXyxcbiAgICAgICAgLy8gICAgIC8vIHRyYW5zcGFyZW50OiBwYnJwYXJhbXMuYWxwaGFNb2RlID09PSAnQkxFTkQnLFxuICAgICAgICAvLyAgICAgY3VsbEZhY2U6IHBicnBhcmFtcy5zaWRlID8gbnVsbCA6IHRoaXMuZ2xfLkJBQ0ssXG4gICAgICAgIC8vIH0pO1xuXG4gICAgICAgIHJldHVybiBwcm9ncmFtO1xuICAgIH1cbn1cblxuZXhwb3J0IGludGVyZmFjZSBQQlJNYXRlcmlhbFBhcmFtcyB7XG4gICAgYmFzZUNvbG9yPzogVmVjNCxcbiAgICBiYXNlQ29sb3JGYWN0b3I/OiBWZWM0LFxuICAgIGJhc2VDb2xvclRleHR1cmU/OiBUZXh0dXJlLFxuICAgIHRSTT86IFRleHR1cmUsXG4gICAgcm91Z2huZXNzPzogbnVtYmVyLFxuICAgIG1ldGFsbmVzcz86IG51bWJlcixcbiAgICBub3JtYWxNYXA/OiBUZXh0dXJlLFxuICAgIG5vcm1hbFNjYWxlPzogbnVtYmVyLFxuICAgIGFvTWFwPzogYW55LFxuXG4gICAgZW1pc3NpdmVNYXA/OiBUZXh0dXJlLFxuICAgIGVtaXNzaXZlSW50ZW5zaXR5PzogYW55LFxuICAgIGVtaXNzaXZlPzogVmVjMyxcblxuICAgIHRFbnZEaWZmdXNlPzogVGV4dHVyZSxcbiAgICB0RW52U3BlY3VsYXI/OiBUZXh0dXJlLFxuICAgIHVFbnZEaWZmdXNlPzogbnVtYmVyLFxuICAgIHVFbnZTcGVjdWxhcj86IG51bWJlcixcbiAgICB1RW52SW50ZW5zaXR5PzogbnVtYmVyLFxuXG4gICAgYWxwaGE/OiBudW1iZXIsXG4gICAgYWxwaGFDdXRvZmY/OiBudW1iZXIsXG4gICAgc2lkZT86IG51bWJlcixcbiAgICB0cmFuc3BhcmVudD86IGJvb2xlYW4sXG4gICAgZW52TWFwSW50ZW5zaXR5PzogbnVtYmVyXG59XG4iLCIvKipcbiAqIHBvcnRlZCBmcm9tIGh0dHBzOi8vZ2l0aHViLmNvbS9tcmRvb2IvZXZlbnRkaXNwYXRjaGVyLmpzL1xuICovXG5cbmV4cG9ydCBjbGFzcyBFdmVudERpc3BhdGNoZXIge1xuICAgIHByaXZhdGUgX2xpc3RlbmVyczogYW55O1xuICAgIFxuXHRhZGRFdmVudExpc3RlbmVyICggdHlwZTogc3RyaW5nLCBsaXN0ZW5lciA6IGFueSApIHtcblxuXHRcdGlmICggdGhpcy5fbGlzdGVuZXJzID09PSB1bmRlZmluZWQgKSB0aGlzLl9saXN0ZW5lcnMgPSB7fTtcblxuXHRcdHZhciBsaXN0ZW5lcnMgPSB0aGlzLl9saXN0ZW5lcnM7XG5cblx0XHRpZiAoIGxpc3RlbmVyc1sgdHlwZSBdID09PSB1bmRlZmluZWQgKSB7XG5cblx0XHRcdGxpc3RlbmVyc1sgdHlwZSBdID0gW107XG5cblx0XHR9XG5cblx0XHRpZiAoIGxpc3RlbmVyc1sgdHlwZSBdLmluZGV4T2YoIGxpc3RlbmVyICkgPT09IC0gMSApIHtcblxuXHRcdFx0bGlzdGVuZXJzWyB0eXBlIF0ucHVzaCggbGlzdGVuZXIgKTtcblxuXHRcdH1cblxuXHR9XG5cblx0aGFzRXZlbnRMaXN0ZW5lciggdHlwZTogc3RyaW5nLCBsaXN0ZW5lciA6IGFueSkge1xuXG5cdFx0aWYgKCB0aGlzLl9saXN0ZW5lcnMgPT09IHVuZGVmaW5lZCApIHJldHVybiBmYWxzZTtcblxuXHRcdHZhciBsaXN0ZW5lcnMgPSB0aGlzLl9saXN0ZW5lcnM7XG5cblx0XHRyZXR1cm4gbGlzdGVuZXJzWyB0eXBlIF0gIT09IHVuZGVmaW5lZCAmJiBsaXN0ZW5lcnNbIHR5cGUgXS5pbmRleE9mKCBsaXN0ZW5lciApICE9PSAtIDE7XG5cblx0fVxuXG5cdHJlbW92ZUV2ZW50TGlzdGVuZXIoIHR5cGUgOiBzdHJpbmcsIGxpc3RlbmVyIDogYW55KSB7XG5cblx0XHRpZiAoIHRoaXMuX2xpc3RlbmVycyA9PT0gdW5kZWZpbmVkICkgcmV0dXJuO1xuXG5cdFx0dmFyIGxpc3RlbmVycyA9IHRoaXMuX2xpc3RlbmVycztcblx0XHR2YXIgbGlzdGVuZXJBcnJheSA9IGxpc3RlbmVyc1sgdHlwZSBdO1xuXG5cdFx0aWYgKCBsaXN0ZW5lckFycmF5ICE9PSB1bmRlZmluZWQgKSB7XG5cblx0XHRcdHZhciBpbmRleCA9IGxpc3RlbmVyQXJyYXkuaW5kZXhPZiggbGlzdGVuZXIgKTtcblxuXHRcdFx0aWYgKCBpbmRleCAhPT0gLSAxICkge1xuXG5cdFx0XHRcdGxpc3RlbmVyQXJyYXkuc3BsaWNlKCBpbmRleCwgMSApO1xuXG5cdFx0XHR9XG5cblx0XHR9XG5cblx0fVxuXG5cdGRpc3BhdGNoRXZlbnQoIGV2ZW50IDogYW55ICkge1xuXG5cdFx0aWYgKCB0aGlzLl9saXN0ZW5lcnMgPT09IHVuZGVmaW5lZCApIHJldHVybjtcblxuXHRcdHZhciBsaXN0ZW5lcnMgPSB0aGlzLl9saXN0ZW5lcnM7XG5cdFx0dmFyIGxpc3RlbmVyQXJyYXkgPSBsaXN0ZW5lcnNbIGV2ZW50LnR5cGUgXTtcblxuXHRcdGlmICggbGlzdGVuZXJBcnJheSAhPT0gdW5kZWZpbmVkICkge1xuXG5cdFx0XHRldmVudC50YXJnZXQgPSB0aGlzO1xuXG5cdFx0XHQvLyBNYWtlIGEgY29weSwgaW4gY2FzZSBsaXN0ZW5lcnMgYXJlIHJlbW92ZWQgd2hpbGUgaXRlcmF0aW5nLlxuXHRcdFx0dmFyIGFycmF5ID0gbGlzdGVuZXJBcnJheS5zbGljZSggMCApO1xuXG5cdFx0XHRmb3IgKCB2YXIgaSA9IDAsIGwgPSBhcnJheS5sZW5ndGg7IGkgPCBsOyBpICsrICkge1xuXG5cdFx0XHRcdGFycmF5WyBpIF0uY2FsbCggdGhpcywgZXZlbnQgKTtcblxuXHRcdFx0fVxuXG5cdFx0fVxuXG5cdH1cbn0iLCJpbXBvcnQge1BCUk1hdGVyaWFsLCBQQlJNYXRlcmlhbFBhcmFtc30gZnJvbSBcIi4uL21hdGVyaWFscy9wYnJtYXRlcmlhbFwiO1xuaW1wb3J0IHtNZXNoLCBPR0xSZW5kZXJpbmdDb250ZXh0LCBUcmFuc2Zvcm0sIFZlYzR9IGZyb20gXCIuLi9vZ2xcIjtcblxuXG5mdW5jdGlvbiBnZXRQQlJQYXJhbXMoZ2x0Zk1hdGVyaWFsOiBhbnkpIHtcbiAgICBsZXQgcGJycGFyYW1zOiBQQlJNYXRlcmlhbFBhcmFtcyA9IHtcbiAgICAgICAgYmFzZUNvbG9yOiBnbHRmTWF0ZXJpYWwuYmFzZUNvbG9yID8gbmV3IFZlYzQoKS5mcm9tQXJyYXkoZ2x0Zk1hdGVyaWFsLmJhc2VDb2xvcikgOiBuZXcgVmVjNCgxLCAxLCAxKSxcbiAgICAgICAgYmFzZUNvbG9yRmFjdG9yOiBnbHRmTWF0ZXJpYWwuYmFzZUNvbG9yRmFjdG9yID8gbmV3IFZlYzQoKS5mcm9tQXJyYXkoZ2x0Zk1hdGVyaWFsLmJhc2VDb2xvckZhY3RvcikgOiBuZXcgVmVjNCgxLCAxLCAxKSxcbiAgICAgICAgcm91Z2huZXNzOiBnbHRmTWF0ZXJpYWwucm91Z2huZXNzRmFjdG9yICE9PSB1bmRlZmluZWQgPyBnbHRmTWF0ZXJpYWwucm91Z2huZXNzRmFjdG9yIDogMC41LFxuICAgICAgICBtZXRhbG5lc3M6IGdsdGZNYXRlcmlhbC5tZXRhbGxpY0ZhY3RvciAhPT0gdW5kZWZpbmVkID8gZ2x0Zk1hdGVyaWFsLm1ldGFsbGljRmFjdG9yIDogMC41LFxuICAgICAgICBhbHBoYTogMSxcbiAgICAgICAgYWxwaGFDdXRvZmY6IGdsdGZNYXRlcmlhbC5hbHBoYUN1dG9mZixcbiAgICAgICAgc2lkZTogZ2x0Zk1hdGVyaWFsLmRvdWJsZVNpZGVkICE9PSB1bmRlZmluZWQgPyBnbHRmTWF0ZXJpYWwuZG91YmxlU2lkZWQgOiBmYWxzZSxcbiAgICAgICAgdHJhbnNwYXJlbnQ6IGdsdGZNYXRlcmlhbC5hbHBoYU1vZGUgIT09IHVuZGVmaW5lZCA/IGdsdGZNYXRlcmlhbC5hbHBoYU1vZGUgPT09ICdCTEVORCcgOiBmYWxzZVxuICAgIH1cbiAgICByZXR1cm4gcGJycGFyYW1zO1xufVxuXG5mdW5jdGlvbiB1cGRhdGVVbmlmb3Jtc18obWF0ZXJpYWw/OiBQQlJNYXRlcmlhbCkge1xuICAgIGlmKG1hdGVyaWFsICYmIG1hdGVyaWFsIGluc3RhbmNlb2YgUEJSTWF0ZXJpYWwpIHtcbiAgICAgICAgbGV0IHByb2dyYW0gPSBtYXRlcmlhbC5wcm9ncmFtO1xuICAgICAgICBwcm9ncmFtLnVuaWZvcm1zWyd1QmFzZUNvbG9yRmFjdG9yJ10udmFsdWUuY29weShtYXRlcmlhbC5jb2xvcik7XG4gICAgICAgIHByb2dyYW0udW5pZm9ybXNbJ3VSb3VnaG5lc3MnXS52YWx1ZSA9IG1hdGVyaWFsLnJvdWdobmVzcztcbiAgICAgICAgcHJvZ3JhbS51bmlmb3Jtc1sndU1ldGFsbGljJ10udmFsdWUgPSBtYXRlcmlhbC5tZXRhbG5lc3M7XG4gICAgICAgIHByb2dyYW0udW5pZm9ybXNbJ3VFbnZNYXBJbnRlbnNpdHknXS52YWx1ZSA9IG1hdGVyaWFsLmVudk1hcEludGVuc2l0eTtcbiAgICAgICAgcHJvZ3JhbS51bmlmb3Jtc1sndEVudkRpZmZ1c2UnXS52YWx1ZSA9IG1hdGVyaWFsLmVudk1hcERpZmZ1c2U7XG4gICAgICAgIHByb2dyYW0udW5pZm9ybXNbJ3RFbnZTcGVjdWxhciddLnZhbHVlID0gbWF0ZXJpYWwuZW52TWFwU3BlY3VsYXI7XG4gICAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gYXNzaWduUEJSTWF0ZXJpYWxzKGdsOiBPR0xSZW5kZXJpbmdDb250ZXh0LCByb290OiBUcmFuc2Zvcm0sIG1hdGVyaWFsQ3Rvcj86IChnbDogT0dMUmVuZGVyaW5nQ29udGV4dCwgcDogUEJSTWF0ZXJpYWxQYXJhbXMsIGRlZmluZXM6IHN0cmluZyk9PlBCUk1hdGVyaWFsKSB7XG4gICAgcm9vdC50cmF2ZXJzZSgobm9kZSkgPT4ge1xuICAgICAgICBpZiAobm9kZSBpbnN0YW5jZW9mIE1lc2ggJiYgbm9kZS5wcm9ncmFtICYmICEobm9kZSBhcyBhbnkpPy5tYXRlcmlhbD8uaXNEaWFtb25kTWF0ZXJpYWwgJiYgbm9kZS5wcm9ncmFtLmdsdGZNYXRlcmlhbCkgeyAvL3RvZG86IGlzRGlhbW9uZE1hdGVyaWFsIG9uIG5vZGU/P1xuICAgICAgICAgICAgbGV0IGRlZmluZXMgPSBgJHtub2RlLmdlb21ldHJ5LmF0dHJpYnV0ZXMudXYgPyBgI2RlZmluZSBVVlxcbmAgOiBgYH1gO1xuICAgICAgICAgICAgbGV0IG1hdGVyaWFsID0gbWF0ZXJpYWxDdG9yID9cbiAgICAgICAgICAgICAgICBtYXRlcmlhbEN0b3IoZ2wsIGdldFBCUlBhcmFtcyhub2RlLnByb2dyYW0uZ2x0Zk1hdGVyaWFsKSwgZGVmaW5lcykgOlxuICAgICAgICAgICAgICAgIG5ldyBQQlJNYXRlcmlhbChnbCwgZ2V0UEJSUGFyYW1zKG5vZGUucHJvZ3JhbS5nbHRmTWF0ZXJpYWwpLCBkZWZpbmVzKTtcbiAgICAgICAgICAgIG5vZGUubWF0ZXJpYWwgPSBtYXRlcmlhbDtcbiAgICAgICAgICAgIG5vZGUucHJvZ3JhbSA9IG1hdGVyaWFsLnByb2dyYW07XG5cbiAgICAgICAgICAgIG5vZGUub25CZWZvcmVSZW5kZXIoICh2YWx1ZTogYW55KSA9PiB7XG4gICAgICAgICAgICAgICAgdXBkYXRlVW5pZm9ybXNfKG5vZGUubWF0ZXJpYWwpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYoKG5vZGUgYXMgYW55KT8ubWF0ZXJpYWw/LmlzRGlhbW9uZE1hdGVyaWFsKXtcbiAgICAgICAgICAgIChub2RlIGFzIE1lc2gpLnByb2dyYW0udHJhbnNwYXJlbnQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgfSk7XG59XG4iLCJpbXBvcnQge1Byb2dyYW19IGZyb20gJy4uL29nbCdcblxuZXhwb3J0IGNsYXNzIFByb2dyYW1DYWNoZSB7XG5cbiAgICBwcml2YXRlIHByb2dyYW1NYXBfOiBNYXA8c3RyaW5nLCBQcm9ncmFtPiA9IG5ldyBNYXA8c3RyaW5nLCBQcm9ncmFtPigpO1xuICAgIHByaXZhdGUgc3RhdGljIGluc3RhbmNlXzogUHJvZ3JhbUNhY2hlO1xuXG4gICAgcHJpdmF0ZSBjb25zdHJ1Y3RvcigpIHtcbiAgICB9XG5cbiAgICBzdGF0aWMgZ2V0SW5zdGFuY2UoKSB7XG4gICAgICAgIGlmKCF0aGlzLmluc3RhbmNlXykge1xuICAgICAgICAgICAgdGhpcy5pbnN0YW5jZV8gPSBuZXcgUHJvZ3JhbUNhY2hlKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuaW5zdGFuY2VfO1xuICAgIH1cblxuICAgIGNyZWF0ZVByb2dyYW0oZ2w6IGFueSwgdmVydGV4OiBzdHJpbmcsIGZyYWdtZW50OiBzdHJpbmcsIHVuaWZvcm1zOiBhbnkpIHtcbiAgICAgICAgbGV0IGtleSA9IHZlcnRleCArIGZyYWdtZW50ICsgZ2wuY2FudmFzLmlkO1xuICAgICAgICBsZXQgY2FjaGVkUHJvZ3JhbSA9IHRoaXMucHJvZ3JhbU1hcF8uZ2V0KGtleSk7XG4gICAgICAgIGlmKGNhY2hlZFByb2dyYW0pIHtcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRQcm9ncmFtO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHByb2dyYW0gPSBuZXcgUHJvZ3JhbShnbCwge1xuICAgICAgICAgICAgdmVydGV4LFxuICAgICAgICAgICAgZnJhZ21lbnQsXG4gICAgICAgICAgICB1bmlmb3JtczogdW5pZm9ybXMsXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLnByb2dyYW1NYXBfLnNldChrZXksIHByb2dyYW0pO1xuICAgICAgICByZXR1cm4gcHJvZ3JhbTtcbiAgICB9XG59XG4iLCIvKipcbiAqIFVuaWZvcm0gVXRpbGl0aWVzLFxuICovXG5pbXBvcnQge1RVbmlmb3Jtc30gZnJvbSBcIi4uL21hdGVyaWFscy9wYnJtYXRlcmlhbFwiO1xuXG5leHBvcnQgZnVuY3Rpb24gY2xvbmVVbmlmb3Jtcyggc3JjOiBUVW5pZm9ybXMgKSB7XG4gICAgY29uc3QgZHN0OiBhbnkgPSB7fTtcbiAgICBmb3IgKGxldCB1IGluIHNyYyApIHtcbiAgICAgICAgZHN0WyB1IF0gPSB7fTtcbiAgICAgICAgZm9yIChsZXQgcCBpbiBzcmNbIHUgXSApIHtcbiAgICAgICAgICAgIGNvbnN0IHByb3BlcnR5ID0gKHNyYyBhcyBhbnkpW3VdW3BdO1xuICAgICAgICAgICAgaWYgKCBwcm9wZXJ0eSAmJiAodHlwZW9mIHByb3BlcnR5LmNsb25lID09PSAnZnVuY3Rpb24nICkgKSB7XG4gICAgICAgICAgICAgICAgZHN0WyB1IF1bIHAgXSA9IHByb3BlcnR5LmNsb25lKCk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKCBBcnJheS5pc0FycmF5KCBwcm9wZXJ0eSApICkge1xuICAgICAgICAgICAgICAgIGRzdFsgdSBdWyBwIF0gPSBwcm9wZXJ0eS5zbGljZSgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBkc3RbIHUgXVsgcCBdID0gcHJvcGVydHk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGRzdDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1lcmdlVW5pZm9ybXMoIHVuaWZvcm1zOiBUVW5pZm9ybXMgKSB7XG4gICAgY29uc3QgbWVyZ2VkOiBhbnkgPSB7fTtcbiAgICBmb3IgKGxldCB1ID0gMDsgdSA8IHVuaWZvcm1zLmxlbmd0aDsgdSArKyApIHtcbiAgICAgICAgY29uc3QgdG1wID0gY2xvbmVVbmlmb3Jtcyh1bmlmb3Jtc1t1XSk7XG4gICAgICAgIGZvciAobGV0IHAgaW4gdG1wICkge1xuICAgICAgICAgICAgbWVyZ2VkWyBwIF0gPSB0bXBbIHAgXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbWVyZ2VkO1xufSIsImltcG9ydCB7TWVzaCwgUmVuZGVyZXIsIFRyYW5zZm9ybSwgVmVjM30gZnJvbSBcIi4uL29nbFwiO1xuaW1wb3J0IGVuY29kaW5nQ2h1bmsgZnJvbSBcIi4uL3NoYWRlcnMvZW5jb2RpbmdfcGFyLmdsc2xcIlxuaW1wb3J0IHRvbmVNYXBwaW5nQ2h1bmsgZnJvbSBcIi4uL3NoYWRlcnMvdG9uZW1hcHBpbmdfcGFyLmdsc2xcIlxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0U25hcHNob3REYXRhKHJlbmRlcmVyOiBSZW5kZXJlciwgbWltZVR5cGU/OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIG1pbWVUeXBlID0gbWltZVR5cGUgPz8gXCJpbWFnZS9wbmdcIjtcbiAgICByZXR1cm4gcmVuZGVyZXIuZ2wuY2FudmFzLnRvRGF0YVVSTChtaW1lVHlwZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRTbmFwc2hvdChyZW5kZXJlcjogUmVuZGVyZXIsIG9wdGlvbnM6IHsgbWltZVR5cGU/OiBzdHJpbmcsIGNvbnRleHQ/OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsIGNhbnZhcz86IEhUTUxDYW52YXNFbGVtZW50IH0pOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIGxldCBpbWdVcmwgPSBnZXRTbmFwc2hvdERhdGEocmVuZGVyZXIsIG9wdGlvbnMubWltZVR5cGUpO1xuICAgIGxldCBjb250ZXh0ID0gb3B0aW9ucy5jb250ZXh0ID8/IG9wdGlvbnMuY2FudmFzPy5nZXRDb250ZXh0KFwiMmRcIik7XG4gICAgaWYgKCFjb250ZXh0KVxuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGltZ1VybCk7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlPHN0cmluZz4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICBsZXQgaW1nID0gbmV3IEltYWdlKCk7XG4gICAgICAgIGltZy5vbmxvYWQgPSAoKSA9PiB7XG4gICAgICAgICAgICBjb250ZXh0Py5kcmF3SW1hZ2UoaW1nLCAwLCAwLCBjb250ZXh0IS5jYW52YXMud2lkdGgsIGNvbnRleHQhLmNhbnZhcy5oZWlnaHQpO1xuICAgICAgICAgICAgcmVzb2x2ZShpbWdVcmwpO1xuICAgICAgICB9O1xuICAgICAgICBpbWcuc3JjID0gaW1nVXJsO1xuICAgIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0UG9pbnRlclBvc2l0aW9uKHBvc2l0aW9uOiB7eDogbnVtYmVyLCB5OiBudW1iZXJ9LCBjYW52YXM6IEhUTUxDYW52YXNFbGVtZW50KSB7XG4gICAgY29uc3QgY2FudmFzQm91bmRzID0gY2FudmFzLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgIGxldCB4ID0gKChwb3NpdGlvbi54IC0gY2FudmFzQm91bmRzLmxlZnQpIC8gKGNhbnZhc0JvdW5kcy5yaWdodCAtIGNhbnZhc0JvdW5kcy5sZWZ0KSkgKiAyIC0gMTtcbiAgICBsZXQgeSA9IC0oKHBvc2l0aW9uLnkgLSBjYW52YXNCb3VuZHMudG9wKSAvIChjYW52YXNCb3VuZHMuYm90dG9tIC0gY2FudmFzQm91bmRzLnRvcCkpICogMiArIDE7XG4gICAgcmV0dXJueyB4OiB4LCB5OiB5fTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEFsbE1lc2hlcyhyb290OiBUcmFuc2Zvcm0pIHtcbiAgICBsZXQgbWVzaGVzIDogYW55ID0gW107XG4gICAgcm9vdC50cmF2ZXJzZSgoZ3JvdXApID0+IHtcbiAgICAgICAgaWYoKGdyb3VwIGFzIE1lc2gpPy5nZW9tZXRyeSkge1xuICAgICAgICAgICAgaWYgKCFncm91cC5wYXJlbnQpIHJldHVybjsgLy8gU2tpcCB1bmF0dGFjaGVkXG4gICAgICAgICAgICBtZXNoZXMucHVzaChncm91cCk7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gbWVzaGVzO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY29tcHV0ZUJvdW5kaW5nQm94KHJvb3Q6IFRyYW5zZm9ybSkge1xuICAgIGNvbnN0IG1pbiA9IG5ldyBWZWMzKCtJbmZpbml0eSk7XG4gICAgY29uc3QgbWF4ID0gbmV3IFZlYzMoLUluZmluaXR5KTtcbiAgICBcbiAgICBjb25zdCBib3VuZHNNaW4gPSBuZXcgVmVjMygpO1xuICAgIGNvbnN0IGJvdW5kc01heCA9IG5ldyBWZWMzKCk7XG4gICAgY29uc3QgYm91bmRzQ2VudGVyID0gbmV3IFZlYzMoKTtcbiAgICBjb25zdCBib3VuZHNTY2FsZSA9IG5ldyBWZWMzKCk7XG4gICAgXG4gICAgcm9vdC50cmF2ZXJzZSgoZ3JvdXApID0+IHtcbiAgICAgICAgbGV0IGdlb21ldHJ5ID0gKGdyb3VwIGFzIE1lc2gpPy5nZW9tZXRyeTtcbiAgICAgICAgaWYoZ2VvbWV0cnkpIHtcbiAgICAgICAgICAgIGlmICghZ3JvdXAucGFyZW50KSByZXR1cm47IC8vIFNraXAgdW5hdHRhY2hlZFxuXG4gICAgICAgICAgICBpZiAoIWdlb21ldHJ5LmJvdW5kcykgZ2VvbWV0cnkuY29tcHV0ZUJvdW5kaW5nU3BoZXJlKCk7XG5cbiAgICAgICAgICAgIGJvdW5kc0NlbnRlci5jb3B5KGdlb21ldHJ5LmJvdW5kcy5jZW50ZXIpLmFwcGx5TWF0cml4NChncm91cC53b3JsZE1hdHJpeCk7XG5cbiAgICAgICAgICAgIC8vIEdldCBtYXggd29ybGQgc2NhbGUgYXhpc1xuICAgICAgICAgICAgZ3JvdXAud29ybGRNYXRyaXguZ2V0U2NhbGluZyhib3VuZHNTY2FsZSk7XG4gICAgICAgICAgICBjb25zdCByYWRpdXNTY2FsZSA9IE1hdGgubWF4KE1hdGgubWF4KGJvdW5kc1NjYWxlWzBdLCBib3VuZHNTY2FsZVsxXSksIGJvdW5kc1NjYWxlWzJdKTtcbiAgICAgICAgICAgIGNvbnN0IHJhZGl1cyA9IGdlb21ldHJ5LmJvdW5kcy5yYWRpdXMgKiByYWRpdXNTY2FsZTtcblxuICAgICAgICAgICAgYm91bmRzTWluLnNldCgtcmFkaXVzKS5hZGQoYm91bmRzQ2VudGVyKTtcbiAgICAgICAgICAgIGJvdW5kc01heC5zZXQoK3JhZGl1cykuYWRkKGJvdW5kc0NlbnRlcik7XG5cbiAgICAgICAgICAgIC8vIEFwcGx5IHdvcmxkIG1hdHJpeCB0byBib3VuZHNcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgMzsgaSsrKSB7XG4gICAgICAgICAgICAgICAgbWluW2ldID0gTWF0aC5taW4obWluW2ldLCBib3VuZHNNaW5baV0pO1xuICAgICAgICAgICAgICAgIG1heFtpXSA9IE1hdGgubWF4KG1heFtpXSwgYm91bmRzTWF4W2ldKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIHttaW46IG1pbiwgbWF4OiBtYXh9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdHJhdmVyc2Uocm9vdDogVHJhbnNmb3JtLCBjYWxsQmFjazogYW55LCBmaWx0ZXI/OiBhbnkpIHtcbiAgICByb290LnRyYXZlcnNlKChncm91cDogVHJhbnNmb3JtKSA9PiB7XG4gICAgICAgIGlmKGZpbHRlcikge1xuICAgICAgICAgICAgaWYoZmlsdGVyKGdyb3VwKSkge1xuICAgICAgICAgICAgICAgIGNhbGxCYWNrKGdyb3VwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNhbGxCYWNrKGdyb3VwKTtcbiAgICAgICAgfVxuICAgIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdHJhdmVyc2VNZXNoZXMocm9vdDogVHJhbnNmb3JtLCBjYWxsQmFjazogYW55KSB7XG4gICAgdHJhdmVyc2Uocm9vdCwgY2FsbEJhY2ssIChncm91cDogVHJhbnNmb3JtKT0+IHtyZXR1cm4gKGdyb3VwIGFzIE1lc2gpLmdlb21ldHJ5ICE9IG51bGx9KTtcbn1cblxuZXhwb3J0IGNvbnN0IEVuY29kaW5nSGVscGVyID0ge1xuICAgIExpbmVhcjogMCxcbiAgICBzUkdCOiAxLFxuICAgIFJHQkU6IDIsXG4gICAgUkdCTTc6IDMsXG4gICAgUkdCTTE2OiA0LFxuICAgIFJHQkQ6IDUsXG4gICAgR2FtbWE6IDYsXG4gICAgc2hhZGVyQ2h1bms6IGVuY29kaW5nQ2h1bmtcbn07XG5leHBvcnQgY29uc3QgVG9uZU1hcHBpbmdIZWxwZXIgPSB7XG4gICAgTGluZWFyOiAwLFxuICAgIFJlaW5oYXJkOiAxLFxuICAgIENpbmVvbjogMixcbiAgICBBQ0VTRmlsbWljOiAzLFxuICAgIHVuaWZvcm1zOiB7XG4gICAgICAgIHRvbmVNYXBwaW5nRXhwb3N1cmU6IHt2YWx1ZTogMS59XG4gICAgfSxcbiAgICBzaGFkZXJDaHVuazogdG9uZU1hcHBpbmdDaHVua1xufVxuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0aWYoX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSkge1xuXHRcdHJldHVybiBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiLy8gc3RhcnR1cFxuLy8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4vLyBUaGlzIGVudHJ5IG1vZHVsZSBpcyByZWZlcmVuY2VkIGJ5IG90aGVyIG1vZHVsZXMgc28gaXQgY2FuJ3QgYmUgaW5saW5lZFxudmFyIF9fd2VicGFja19leHBvcnRzX18gPSBfX3dlYnBhY2tfcmVxdWlyZV9fKFwiLi9zcmMvaW5kZXgudHNcIik7XG4iXSwic291cmNlUm9vdCI6IiJ9