import {
    Camera,
    OGLRenderingContext,
    Post,
    PostFBO,
    PostOptions, Program,
    Renderer,
    RenderTarget,
    RenderTargetOptions,
    Transform
} from "../ogl";

export class Pass {
    enabled: boolean;
    renderToScreen: boolean;
    needsSwap: boolean;
    constructor() {
        this.enabled = true;
        this.renderToScreen = false;
        this.needsSwap = true;
    }

    render(renderer: Renderer, writeBuffer: RenderTarget|undefined, readBuffer: RenderTarget) {
        console.error('Not implemented');
    }
    renderWithFBO(renderer: Renderer, fbo: PostFBO){
        fbo.read && this.render(renderer, fbo.write, fbo.read);
    }
    resize({ width, height, dpr }: Partial<{
        width: number;
        height: number;
        dpr: number;
    }>): void{
        console.error('Not implemented');
    }
}

export class RenderPass extends Pass {
    private scene: Transform;
    private camera: Camera;
    constructor(scene: Transform, camera: Camera) {
        super();
        this.scene = scene;
        this.camera = camera;
    }
    
    render(renderer: Renderer, writeBuffer: RenderTarget|undefined, readBuffer: RenderTarget) {
        renderer.render({scene: this.scene, camera: this.camera, target: readBuffer});
    }
}

export class CustomPost extends Post {
    passes: Pass[] = [];

    constructor(gl: OGLRenderingContext, options:Partial<PostOptions> = {}, fbo?: PostFBO) {
        super(gl, options, fbo);
    }

    addPass(pass: Pass) {
        this.passes.push(pass);
        return pass;
    }

    render({ target= undefined, update = true, sort = true, frustumCull = true }) {
        const enabledPasses = this.passes.filter((pass) => pass.enabled);
        enabledPasses.forEach((pass, i) => {
            this._renderPass(pass);
            pass.needsSwap && this.fbo.swap();
        });
    }

    protected _renderPass(pass: Pass) {
        pass.renderWithFBO(this.gl.renderer, this.fbo);
    }

    resize({ width, height, dpr }: Partial<{
        width: number;
        height: number;
        dpr: number;
    }>): void{
        super.resize({width: width, height: height, dpr: dpr});
        this.passes.forEach( (pass) => {
            pass.resize({width, height, dpr});
        })
    }
}
