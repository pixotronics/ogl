import {PBRMaterial, PBRMaterialParams} from "../materials/pbrmaterial";
import {Mesh, OGLRenderingContext, Transform, Vec4} from "../ogl";


function getPBRParams(gltfMaterial: any) {
    let pbrparams: PBRMaterialParams = {
        baseColor: gltfMaterial.baseColor ? new Vec4().fromArray(gltfMaterial.baseColor) : new Vec4(1, 1, 1),
        baseColorFactor: gltfMaterial.baseColorFactor ? new Vec4().fromArray(gltfMaterial.baseColorFactor) : new Vec4(1, 1, 1),
        roughness: gltfMaterial.roughnessFactor !== undefined ? gltfMaterial.roughnessFactor : 0.5,
        metalness: gltfMaterial.metallicFactor !== undefined ? gltfMaterial.metallicFactor : 0.5,
        alpha: 1,
        alphaCutoff: gltfMaterial.alphaCutoff,
        side: gltfMaterial.doubleSided !== undefined ? gltfMaterial.doubleSided : false,
        transparent: gltfMaterial.alphaMode !== undefined ? gltfMaterial.alphaMode === 'BLEND' : false
    }
    return pbrparams;
}

function updateUniforms_(material?: PBRMaterial) {
    if(material && material instanceof PBRMaterial) {
        let program = material.program;
        program.uniforms['uBaseColorFactor'].value.copy(material.color);
        program.uniforms['uRoughness'].value = material.roughness;
        program.uniforms['uMetallic'].value = material.metalness;
        program.uniforms['uEnvMapIntensity'].value = material.envMapIntensity;
        program.uniforms['tEnvDiffuse'].value = material.envMapDiffuse;
        program.uniforms['tEnvSpecular'].value = material.envMapSpecular;
    }
}

export function assignPBRMaterials(gl: OGLRenderingContext, root: Transform, materialCtor?: (gl: OGLRenderingContext, p: PBRMaterialParams, defines: string)=>PBRMaterial) {
    root.traverse((node) => {
        if (node instanceof Mesh && node.program && !(node as any).isDiamondMaterial && node.program.gltfMaterial) { //todo: isDiamondMaterial on node??
            let defines = `${node.geometry.attributes.uv ? `#define UV\n` : ``}`;
            let material = materialCtor ?
                materialCtor(gl, getPBRParams(node.program.gltfMaterial), defines) :
                new PBRMaterial(gl, getPBRParams(node.program.gltfMaterial), defines);
            node.material = material;
            node.program = material.program;

            node.onBeforeRender( (value: any) => {
                updateUniforms_(node.material);
            });
        }
    });
}
