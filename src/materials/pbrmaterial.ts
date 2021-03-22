import pbrvert from './shaders/pbr.vert';
import pbrfrag from './shaders/pbr.frag';
import {ProgramCache} from '../utils/programcache';
import {Program, Texture, TextureLoader, Vec3, Vec4} from "../ogl";
import {EncodingHelper} from "../utils/util";

export type TUniforms = Record<string, { value?: any }>

export class PBRMaterial {
    protected static readonly defaultVertex: string = pbrvert;
    protected static readonly defaultFragment: string = `${pbrfrag}`

    private gl_: any;
    private program_: Program;
    private uniforms_: any;
    private static lutTextureMap: Map<string, Texture> = new Map<string, Texture>();
    private envMapSpecular_?: Texture;
    private envMapDiffuse_?: Texture;

    private color_: Vec4 = new Vec4(1, 1, 1, 1);
    private roughness_: number = 0;
    private metalness_: number = 0;
    private envMapIntensity_: number = 1;

    makeFragmentShader(frag: string, hdr = true){
        return `
precision highp float;
precision highp int;
#define inputEncoding ${hdr?EncodingHelper.RGBM16:EncodingHelper.Linear}
#define outputEncoding ${hdr?EncodingHelper.RGBM16:EncodingHelper.Linear}
${EncodingHelper.shaderChunk}
${frag}
`
    }
    constructor(gl: any, pbrparams?: PBRMaterialParams, defines? : string, uniforms?: TUniforms, shaders?: {frag?: string, vert?: string}, hdr=true) {
        this.gl_ = gl;

        if(!PBRMaterial.lutTextureMap.get(gl.canvas.id)) {
            PBRMaterial.lutTextureMap.set(gl.canvas.id, TextureLoader.load(gl, {
              src: 'https://assets.jewlr.com/j3d/lut.png',
            }));
        }

        let pbrVert = shaders?.vert ?? PBRMaterial.defaultVertex;
        let pbrFrag = shaders?.frag ?? PBRMaterial.defaultFragment;

        this.color_ = pbrparams?.baseColorFactor !== undefined ? new Vec4().copy(pbrparams.baseColorFactor) : new Vec4(1, 1, 1, 1);
        this.roughness = pbrparams?.roughness !== undefined ? pbrparams.roughness : 0;
        this.metalness = pbrparams?.metalness !== undefined ? pbrparams.metalness : 0;
        this.envMapIntensity = pbrparams?.envMapIntensity !== undefined ? pbrparams?.envMapIntensity : 1;

        this.uniforms_ = {
            uBaseColorFactor: { value: new Vec4().copy(this.color_) },
            tBaseColor: { value: pbrparams?.baseColorTexture ? pbrparams?.baseColorTexture.texture : null },

            uRoughness: { value: pbrparams?.roughness !== undefined ? pbrparams?.roughness : 1 },
            uMetallic: { value: pbrparams?.metalness !== undefined ? pbrparams?.metalness : 1 },

            tNormal: { value: { texture: null} },
            uNormalScale: { value: pbrparams?.normalScale || 1 },

            tOcclusion: { value: { texture: null} },

            tEmissive: { value: { texture: null} },
            uEmissive: { value: pbrparams?.emissive || [0, 0, 0] },

            tLUT: { value: PBRMaterial.lutTextureMap.get(gl.canvas.id) },
            tEnvDiffuse: { value: { texture: null} },
            tEnvSpecular: { value: { texture: null} },
            uEnvDiffuse: { value: 0.5 },
            uEnvSpecular: { value: 0.5 },
            uEnvMapIntensity: { value: 1 },

            uAlpha: { value: pbrparams?.alpha },
            uAlphaCutoff: { value: pbrparams?.alphaCutoff },

            uTransparent: { value: pbrparams?.transparent },

            ...(uniforms??{}),
        }
        defines = defines ? defines : ``;
        this.program_ = this.createProgram_(defines, pbrVert, pbrFrag, hdr);
    }

    get isPBRMaterial() {
        return true;
    }

    get program() {
        return this.program_;
    }

    set color(color: Vec4) {
        this.color_.copy(color);
    }

    get color() {
        return this.color_;
    }

    set emissive(color: Vec3) {
        let color_ = this.uniforms_.uEmissive.value;
        color_.copy(color);
    }

    get emissive() {
        return this.uniforms_.uEmissive.value;
    }

    set roughness(roughness: number) {
        this.roughness_ = roughness;
    }

    get roughness() {
        return this.roughness_;
    }

    set metalness(metalness: number) {
        this.metalness_ = metalness;
    }

    get metalness() {
        return this.metalness_;
    }

    set normalScale(normalScale: number) {
        this.uniforms_.uNormalScale.value = normalScale;
    }

    get normalScale() {
        return this.uniforms_.uNormalScale.value;
    }

    set envMapSpecular(envMapSpecular: any) {
        this.envMapSpecular_ = envMapSpecular;
    }

    get envMapSpecular() {
        return this.envMapSpecular_;
    }

    set envMapDiffuse(envMapDiffuse: any) {
        this.envMapDiffuse_ = envMapDiffuse;
    }

    get envMapDiffuse() {
        return this.envMapDiffuse_;
    }

    set envMapIntensity(envMapIntensity: any) {
        this.envMapIntensity_ = envMapIntensity;
    }

    get envMapIntensity() {
        return this.envMapIntensity_;
    }

    public serialize() : PBRMaterialParams {
        return {
            baseColor: new Vec4(1, 1, 1, 1),
            baseColorFactor: this.color_.copy(new Vec4()),
            roughness: this.roughness_,
            metalness: this.metalness_,
            envMapIntensity: this.envMapIntensity
            // normalScale: this.normalScale
        }
    }

    public load(params: PBRMaterialParams) {
        if(params) {
            if(params.baseColorFactor) {
                this.color_.x = params.baseColorFactor[0] !== undefined ? params.baseColorFactor[0] : params.baseColorFactor.x;
                this.color_.y = params.baseColorFactor[1] !== undefined ? params.baseColorFactor[1] : params.baseColorFactor.y;
                this.color_.z = params.baseColorFactor[2] !== undefined ? params.baseColorFactor[2] : params.baseColorFactor.z;
                this.color_.w = params.baseColorFactor[3] !== undefined ? params.baseColorFactor[3] : params.baseColorFactor.w;
            }
            if(params.emissive) {
                this.emissive.x = params.emissive.x;
                this.emissive.y = params.emissive.y;
                this.emissive.z = params.emissive.z;
            }
            if(params.roughness !== undefined) {
                this.roughness = params.roughness;
            }
            if(params.metalness !== undefined) {
                this.metalness = params.metalness;
            }
            if(params.envMapIntensity !== undefined) {
                this.envMapIntensity = params.envMapIntensity;
            }
        }

    }

    private createProgram_(defines: string, vertex?: string, fragment?: string, hdr:boolean = true) {
        vertex = vertex ?? PBRMaterial.defaultVertex
        fragment = this.makeFragmentShader(fragment ?? PBRMaterial.defaultFragment, hdr);

        vertex = defines + vertex;
        fragment = defines + fragment;

        let program = ProgramCache.getInstance().createProgram(this.gl_, vertex, fragment, this.uniforms_);
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

export interface PBRMaterialParams {
    baseColor?: Vec4,
    baseColorFactor?: Vec4,
    baseColorTexture?: Texture,
    tRM?: Texture,
    roughness?: number,
    metalness?: number,
    normalMap?: Texture,
    normalScale?: number,
    aoMap?: any,

    emissiveMap?: Texture,
    emissiveIntensity?: any,
    emissive?: Vec3,

    tEnvDiffuse?: Texture,
    tEnvSpecular?: Texture,
    uEnvDiffuse?: number,
    uEnvSpecular?: number,
    uEnvIntensity?: number,

    alpha?: number,
    alphaCutoff?: number,
    side?: number,
    transparent?: boolean,
    envMapIntensity?: number
}
