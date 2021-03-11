import { Camera, OGLRenderingContext, Post, PostFBO, PostOptions, Renderer, RenderTarget, Transform } from "../ogl";
export declare class Pass {
    enabled: boolean;
    renderToScreen: boolean;
    needsSwap: boolean;
    constructor();
    render(renderer: Renderer, writeBuffer: RenderTarget | undefined, readBuffer: RenderTarget): void;
    renderWithFBO(renderer: Renderer, fbo: PostFBO): void;
    resize({ width, height, dpr }: Partial<{
        width: number;
        height: number;
        dpr: number;
    }>): void;
}
export declare class RenderPass extends Pass {
    private scene;
    private camera;
    constructor(scene: Transform, camera: Camera);
    render(renderer: Renderer, writeBuffer: RenderTarget | undefined, readBuffer: RenderTarget): void;
}
export declare class CustomPost extends Post {
    passes: Pass[];
    constructor(gl: OGLRenderingContext, options?: Partial<PostOptions>, fbo?: PostFBO);
    addPass(pass: Pass): Pass;
    render({ target, update, sort, frustumCull }: {
        target?: undefined;
        update?: boolean | undefined;
        sort?: boolean | undefined;
        frustumCull?: boolean | undefined;
    }): void;
    protected _renderPass(pass: Pass): void;
    resize({ width, height, dpr }: Partial<{
        width: number;
        height: number;
        dpr: number;
    }>): void;
}
//# sourceMappingURL=CustomPost.d.ts.map