uniform mat4 viewMatrix;
uniform mat3 normalMatrix;
uniform vec3 cameraPosition;
uniform vec4 uBaseColorFactor;
uniform sampler2D tBaseColor;
uniform sampler2D tRM;
uniform float uRoughness;
uniform float uMetallic;
uniform sampler2D tNormal;
uniform float uNormalScale;
uniform sampler2D tEmissive;
uniform vec3 uEmissive;
uniform sampler2D tOcclusion;
uniform sampler2D tLUT;
uniform sampler2D tEnvDiffuse;
uniform sampler2D tEnvSpecular;
uniform float uEnvDiffuse;
uniform float uEnvSpecular;
uniform float uEnvMapIntensity;
uniform float uAlpha;
uniform float uAlphaCutoff;
uniform bool uTransparent;
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vMPos;
varying vec4 vMVPos;

const float PI = 3.14159265359;
const float RECIPROCAL_PI = 0.31830988618;
const float RECIPROCAL_PI2 = 0.15915494;
const float LN2 = 0.6931472;
const float ENV_LODS = 6.0;
vec4 SRGBtoLinear(vec4 srgb) {
  vec3 linOut = pow(srgb.xyz, vec3(2.2));
  return vec4(linOut, srgb.w);;
}
vec4 RGBMToLinear(in vec4 value) {
  float maxRange = 6.0;
  return vec4(value.xyz * value.w * maxRange, 1.0);
}
vec3 linearToSRGB(vec3 color) {
  return pow(color, vec3(1.0 / 2.2));
}
vec3 getNormal() {
  #ifdef NORMAL_MAP  
    vec3 pos_dx = dFdx(vMPos.xyz);
    vec3 pos_dy = dFdy(vMPos.xyz);
    vec2 tex_dx = dFdx(vUv);
    vec2 tex_dy = dFdy(vUv);
    // Tangent, Bitangent
    vec3 t = normalize(pos_dx * tex_dy.t - pos_dy * tex_dx.t);
    vec3 b = normalize(-pos_dx * tex_dy.s + pos_dy * tex_dx.s);
    mat3 tbn = mat3(t, b, normalize(vNormal));
    vec3 n = texture2D(tNormal, vUv).rgb * 2.0 - 1.0;
    n.xy *= uNormalScale;
    vec3 normal = normalize(tbn * n);
    // Get world normal from view normal (normalMatrix * normal)
    // return normalize((vec4(normal, 0.0) * viewMatrix).xyz);
    return normalize(normal);
  #else
    return normalize(vNormal);
  #endif
}

vec2 cartesianToPolar(vec3 n) {
  vec2 uv;
  uv.x = atan(n.z, n.x) * RECIPROCAL_PI2 + 0.5;
  uv.y = asin(n.y) * RECIPROCAL_PI + 0.5;
  return uv;
}

void getIBLContribution(inout vec3 diffuse, inout vec3 specular, float NdV, float roughness, vec3 n, vec3 reflection, vec3 diffuseColor, vec3 specularColor) {
  vec3 brdf = SRGBtoLinear(texture2D(tLUT, vec2(NdV, roughness))).rgb;
  vec3 diffuseLight = RGBMToLinear(texture2D(tEnvDiffuse, cartesianToPolar(n))).rgb;
  diffuseLight = mix(vec3(1), diffuseLight, uEnvDiffuse);
  // Sample 2 levels and mix between to get smoother degradation
  float blend = roughness * ENV_LODS;
  float level0 = floor(blend);
  float level1 = min(ENV_LODS, level0 + 1.0);
  blend -= level0;
  
  // Sample the specular env map atlas depending on the roughness value
  vec2 uvSpec = cartesianToPolar(reflection);
  uvSpec.y /= 2.0;
  vec2 uv0 = uvSpec;
  vec2 uv1 = uvSpec;
  uv0 /= pow(2.0, level0);
  uv0.y += 1.0 - exp(-LN2 * level0);
  uv1 /= pow(2.0, level1);
  uv1.y += 1.0 - exp(-LN2 * level1);
  vec3 specular0 = RGBMToLinear(texture2D(tEnvSpecular, uv0)).rgb;
  vec3 specular1 = RGBMToLinear(texture2D(tEnvSpecular, uv1)).rgb;
  vec3 specularLight = mix(specular0, specular1, blend);
  diffuse = diffuseLight * diffuseColor;
  
  // Bit of extra reflection for smooth materials
  float reflectivity = pow((1.0 - roughness), 2.0) * 0.05;
  specular = specularLight * (specularColor * brdf.x + brdf.y + reflectivity);
  specular *= uEnvSpecular;
}

void main() {
  vec4 baseColor = uBaseColorFactor;
  #ifdef COLOR_MAP
    baseColor *= SRGBtoLinear(texture2D(tBaseColor, vUv));
  #endif
  // Get base alpha
  float alpha = baseColor.a;
  #ifdef ALPHA_MASK
    if (alpha < uAlphaCutoff) discard;
  #endif
  // RM map packed as gb = [nothing, roughness, metallic, nothing]
  vec4 rmSample = vec4(1);
  #ifdef RM_MAP
    rmSample *= texture2D(tRM, vUv);
  #endif
  float roughness = clamp(rmSample.g * uRoughness, 0.04, 1.0);
  float metallic = clamp(rmSample.b * uMetallic, 0.04, 1.0);
  vec3 f0 = vec3(0.04);
  vec3 diffuseColor = baseColor.rgb * (vec3(1.0) - f0) * (1.0 - metallic);
  vec3 specularColor = mix(f0, baseColor.rgb, metallic);
  vec3 specularEnvR0 = specularColor;
  vec3 specularEnvR90 = vec3(clamp(max(max(specularColor.r, specularColor.g), specularColor.b) * 25.0, 0.0, 1.0));
  vec3 N = getNormal();
  vec3 V = normalize(cameraPosition - vMPos);
  vec3 reflection = normalize(reflect(-V, N));
  float NdV = clamp(abs(dot(N, V)), 0.001, 1.0);
  // Shading based off IBL lighting
  vec3 color = vec3(0.);
  vec3 diffuseIBL;
  vec3 specularIBL;
  getIBLContribution(diffuseIBL, specularIBL, NdV, roughness, N, reflection, diffuseColor, specularColor);
  // Add IBL on top of color
  color += (diffuseIBL + specularIBL) * uEnvMapIntensity;
  // Add IBL spec to alpha for reflections on transparent surfaces (glass)
  alpha = max(alpha, max(max(specularIBL.r, specularIBL.g), specularIBL.b));
  #ifdef OCC_MAP  
    // TODO: figure out how to apply occlusion
    // color *= SRGBtoLinear(texture2D(tOcclusion, vUv)).rgb;
  #endif
  color += uEmissive;
  #ifdef EMISSIVE_MAP  
    vec3 emissive = SRGBtoLinear(texture2D(tEmissive, vUv)).rgb;
    color = emissive;
  #endif
  // Apply uAlpha uniform at the end to overwrite any specular additions on transparent surfaces
//  gl_FragColor.rgb = linearToSRGB(color);
  if(uTransparent){
    gl_FragColor = (vec4(color, alpha * uAlpha));
  }else {
    gl_FragColor = linearToOutputTexel(vec4(color * alpha * uAlpha, 1.));
  }
}