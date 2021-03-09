import {Camera, OGLRenderingContext, Post, PostOptions, Renderer, RenderTarget, Transform} from "../ogl";

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

    constructor(gl: OGLRenderingContext, options:Partial<PostOptions> = {}) {
        super(gl, options);
    }

    addPass(pass: Pass) {
        this.passes.push(pass);
        return pass;
    }

    render({ target= undefined, update = true, sort = true, frustumCull = true }) {
        const enabledPasses = this.passes.filter((pass) => pass.enabled);
        enabledPasses.forEach((pass, i) => {
            pass.render(this.gl.renderer, this.fbo.write, this.fbo.read);
            pass.needsSwap && this.fbo.swap();
        });
    }

    resize({ width, height, dpr }: Partial<{
        width: number;
        height: number;
        dpr: number;
    }>): void{
        this.fbo.read && this.fbo.read.dispose();
        this.fbo.write && this.fbo.write.dispose();
        super.resize({width: width, height: height, dpr: dpr});
        this.passes.forEach( (pass) => {
            pass.resize({width, height, dpr});
        })
    }
}