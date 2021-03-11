import { Camera, OGLRenderingContext, PostFBO, PostOptions, Renderer, RenderTarget, RenderTargetOptions, Transform } from "../ogl";
import { CustomPost, Pass } from "../extras/CustomPost";
export declare class HDRRenderPass extends Pass {
    private blackProgram;
    get camera(): Camera;
    get scene(): Transform;
    private _scene;
    private _camera;
    private blendProgram;
    private gl;
    constructor(gl: OGLRenderingContext, scene: Transform, camera: Camera);
    renderWithFBO(renderer: Renderer, fbo: HDRFrame): void;
}
export declare class HDRToneMapPass extends Pass {
    private toneMapProgram;
    private gl;
    constructor(gl: OGLRenderingContext);
    renderWithFBO(renderer: Renderer, fbo: HDRFrame): void;
    resize({ width, height, dpr }: Partial<{
        width: number;
        height: number;
        dpr: number;
    }>): void;
}
export declare class HDRHelper {
    readonly floatingSupportExt: {
        texture: string;
        linear: string;
        color: string;
        h_texture: string;
        h_linear: string;
        h_color: string;
    };
    private readonly _floatingSupport;
    private gl;
    get halfFloatType(): number;
    get floatType(): number;
    get intType(): number;
    get canFloatDraw(): number;
    constructor(gl: OGLRenderingContext);
    initFloatSupport(): void;
    get floatingSupport(): any;
}
export declare class HDRFrame implements PostFBO {
    read?: RenderTarget;
    write?: RenderTarget;
    transparent?: RenderTarget;
    private gl;
    private helper;
    constructor(gl: OGLRenderingContext, helper: HDRHelper);
    swap(): void;
    create(options: Partial<RenderTargetOptions>): void;
    dispose(): void;
}
export interface HDRPostOptions extends PostOptions {
}
export declare class HDRComposer extends CustomPost {
    constructor(gl: OGLRenderingContext, options: Partial<HDRPostOptions>);
    disposeFbo(): void;
    initFbo(): void;
}
//# sourceMappingURL=HDRComposer.d.ts.map