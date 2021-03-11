import { Program, Texture, Vec3, Vec4 } from "../ogl";
export declare type TUniforms = Record<string, {
    value?: any;
}>;
export declare class PBRMaterial {
    protected static readonly defaultVertex: string;
    protected static readonly defaultFragment: string;
    private gl_;
    private program_;
    private uniforms_;
    private static lutTextureMap;
    private envMapSpecular_?;
    private envMapDiffuse_?;
    private color_;
    private roughness_;
    private metalness_;
    private envMapIntensity_;
    constructor(gl: any, pbrparams?: PBRMaterialParams, defines?: string, uniforms?: TUniforms, shaders?: {
        frag?: string;
        vert?: string;
    });
    get isPBRMaterial(): boolean;
    get program(): Program;
    set color(color: Vec4);
    get color(): Vec4;
    set emissive(color: Vec3);
    get emissive(): Vec3;
    set roughness(roughness: number);
    get roughness(): number;
    set metalness(metalness: number);
    get metalness(): number;
    set normalScale(normalScale: number);
    get normalScale(): number;
    set envMapSpecular(envMapSpecular: any);
    get envMapSpecular(): any;
    set envMapDiffuse(envMapDiffuse: any);
    get envMapDiffuse(): any;
    set envMapIntensity(envMapIntensity: any);
    get envMapIntensity(): any;
    serialize(): PBRMaterialParams;
    load(params: PBRMaterialParams): void;
    private createProgram_;
}
export interface PBRMaterialParams {
    baseColor?: Vec4;
    baseColorFactor?: Vec4;
    baseColorTexture?: Texture;
    tRM?: Texture;
    roughness?: number;
    metalness?: number;
    normalMap?: Texture;
    normalScale?: number;
    aoMap?: any;
    emissiveMap?: Texture;
    emissiveIntensity?: any;
    emissive?: Vec3;
    tEnvDiffuse?: Texture;
    tEnvSpecular?: Texture;
    uEnvDiffuse?: number;
    uEnvSpecular?: number;
    uEnvIntensity?: number;
    alpha?: number;
    alphaCutoff?: number;
    side?: number;
    transparent?: boolean;
    envMapIntensity?: number;
}
//# sourceMappingURL=pbrmaterial.d.ts.map