import { Post } from './Post.js';

export class Pass {
    constructor() {
        this.enabled = true;
        this.renderToScreen = false;
        this.needsSwap = true;
    }

    render(renderer, writeBuffer, readBuffer) {
        console.error('Not implemented');
    }
}

export class RenderPass extends Pass {
    constructor(scene, camera) {
        super();
        this.scene = scene;
        this.camera = camera;
    }
    
    render(renderer, writeBuffer, readBuffer) {
        renderer.render({scene: this.scene, camera: this.camera, target: readBuffer});
    }
}

export class CustomPost extends Post {
    constructor(gl, options = {}) {
        super(gl, options);
    }

    addPass(pass) {
        this.passes.push(pass);
        return pass;
    }

    render({ target = null, update = true, sort = true, frustumCull = true }) {
        const enabledPasses = this.passes.filter((pass) => pass.enabled);
        enabledPasses.forEach((pass, i) => {
            pass.render(this.gl.renderer, this.fbo.write, this.fbo.read);
            pass.needsSwap && this.fbo.swap();
        });
    }

    resize({ width, height, dpr } = {}) {
        this.fbo.read && this.fbo.read.dispose();
        this.fbo.write && this.fbo.write.dispose();
        super.resize({width: width, height: height, dr: dpr});
        this.passes.forEach( (pass) => {
            pass.resize({width, height, dpr});
        })
    }
}