import {
    Camera,
    OGLRenderingContext,
    PostFBO, PostOptions,
    Program,
    Renderer,
    RenderTarget,
    RenderTargetOptions,
    Transform
} from "../ogl";
import {Utils} from "../extras/RenderUtils";
import {CustomPost, Pass} from "../extras/CustomPost";
import {EncodingHelper, ToneMappingHelper} from "../utils/util";
export class HDRRenderPass extends Pass {
    private blackProgram: Program;
    get camera(): Camera {
        return this._camera;
    }
    get scene(): Transform {
        return this._scene;
    }
    private _scene: Transform;
    private _camera: Camera;
    private blendProgram: Program;
    private gl: OGLRenderingContext;
    constructor(gl: OGLRenderingContext, scene: Transform, camera: Camera) {
        super();
        this.gl = gl;
        this._scene = scene;
        this._camera = camera;
        this.needsSwap = true;
        this.blendProgram = new Program(gl, {vertex: Utils.copyVertex, fragment: `
            precision highp float;
            #define inputEncoding ${EncodingHelper.RGBM16}
            #define outputEncoding ${EncodingHelper.RGBM16}
            ${EncodingHelper.shaderChunk}
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
                tOpaque: {value: {texture: undefined}},
                tTransparent: {value: {texture: undefined}}
            },
            depthTest: false,
            depthWrite: false

        });
        this.blackProgram = new Program(gl, {vertex: Utils.copyVertex, fragment: `
            precision highp float;
            varying vec2 vUv;
            void main() {
                gl_FragColor = vec4(0,0,0,0);
            }
        `, uniforms: {
                tOpaque: {value: {texture: undefined}},
                tTransparent: {value: {texture: undefined}}
            },
            depthTest: false,
            depthWrite: false

        });
    }

    renderWithFBO(renderer: Renderer, fbo: HDRFrame){
        this._scene.updateMatrixWorld();
        renderer.gl.clearColor(0,0,0,0);
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
            }else if (fbo.read.stencil && !fbo.read.depth) {
                this.gl.framebufferRenderbuffer(fbo.transparent.target, this.gl.STENCIL_ATTACHMENT, this.gl.RENDERBUFFER, fbo.read.stencilBuffer);
            }else if (fbo.read.depth && fbo.read.stencil) {
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
            Utils.getInstance(renderer.gl).renderPass(renderer, this.blendProgram, fbo.write, true);
            renderer.color = oldClearColor;
            renderer.depth = oldClearDepth;
        } else {
            renderer.render({scene: this._scene, camera: this._camera, target: fbo.read});
        }
    }
}
export class HDRToneMapPass extends Pass {
    private toneMapProgram: Program;
    private gl: OGLRenderingContext;
    constructor(gl: OGLRenderingContext, hdr = true) {
        super();
        this.gl = gl;
        this.needsSwap = false;
        this.toneMapProgram = new Program(gl, {vertex: Utils.copyVertex, fragment: `
            precision highp float;
            #define inputEncoding ${hdr?EncodingHelper.RGBM16:EncodingHelper.Linear}
            #define outputEncoding ${EncodingHelper.sRGB}
            #define tonemappingMode ${hdr?ToneMappingHelper.Linear:ToneMappingHelper.Linear}
            ${EncodingHelper.shaderChunk}
            ${ToneMappingHelper.shaderChunk}
            uniform sampler2D tMap;
            varying vec2 vUv;
            void main() {
                vec4 color = inputTexelToLinear(texture2D(tMap, vUv));
                color.rgb = toneMapColor(color.rgb*1.);
                gl_FragColor = linearToOutputTexel(color);
                // gl_FragColor.a = color.a;
            }
        `, uniforms: {
                tMap: {value: {texture: undefined}},
                ...ToneMappingHelper.uniforms //todo: uniform utils clone.
            },
                depthTest: false,
                depthWrite: false
            }
        );
    }

    renderWithFBO(renderer: Renderer, fbo: HDRFrame){
        this.toneMapProgram.uniforms['tMap'].value = fbo.read?.texture;
        Utils.getInstance(renderer.gl).renderPass(renderer, this.toneMapProgram, this.renderToScreen ? undefined : fbo.write, true);
        this.needsSwap = !this.renderToScreen;
    }
    resize({ width, height, dpr }: Partial<{
        width: number;
        height: number;
        dpr: number;
    }>): void{
    }
}

export class HDRHelper {
    readonly floatingSupportExt = {
        texture: 'OES_texture_float',
        linear: 'OES_texture_float_linear',
        color: 'WEBGL_color_buffer_float',
        h_texture: 'OES_texture_half_float',
        h_linear: 'OES_texture_half_float_linear',
        h_color: 'EXT_color_buffer_half_float',
    };
    private readonly _floatingSupport: any = {
        texture: false,
        linear: false,
        color: false,
        h_texture: false,
        h_linear: false,
        h_color: false,
    };
    private gl: OGLRenderingContext;
    get halfFloatType(): number{
        return this.floatingSupport.h_color ? this.floatingSupport.h_texture.HALF_FLOAT_OES : this.floatType;
    };
    get floatType(): number{
        return (this.floatingSupport.color ? this.gl.FLOAT : this.gl.UNSIGNED_BYTE);
    };
    get intType(): number{
        return this.gl.UNSIGNED_BYTE;
    };
    get canFloatDraw(): number{
        return this.floatingSupport.h_color || this.floatingSupport.color;
    };

    constructor(gl: OGLRenderingContext) {
        this.gl = gl;
        this.initFloatSupport();
    }

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
    get floatingSupport(): any {
        return {...this._floatingSupport};
    }


}

export class HDRFrame implements PostFBO{
    read?: RenderTarget;
    write?: RenderTarget;
    transparent?: RenderTarget;
    private gl: OGLRenderingContext;
    private helper: HDRHelper;

    constructor(gl: OGLRenderingContext, helper: HDRHelper) {
        this.gl = gl;
        this.helper = helper;
    }
    swap(): void {
        let t = this.read;
        this.read = this.write;
        this.write = t;
    }

    create(options: Partial<RenderTargetOptions>){
        this.read = new RenderTarget(this.gl, options);
        this.write = new RenderTarget(this.gl, options);
        this.transparent = new RenderTarget(this.gl, {
            ...options,
            type: this.helper.halfFloatType,
            format: this.gl.RGBA,
            depth: false,
            internalFormat: (this.helper.canFloatDraw && this.gl.renderer.isWebgl2) ? (this.gl as WebGL2RenderingContext).RGBA32F : this.gl.RGBA,
        });
    }

    dispose(){
        this.read && this.read.dispose();
        this.write && this.write.dispose();
        this.transparent && this.transparent.dispose();
        this.read = undefined;
        this.write = undefined;
        this.transparent = undefined;
    }

}

export interface HDRPostOptions extends PostOptions{
    // encoding: number
}

export class HDRComposer extends CustomPost{
    constructor(gl: OGLRenderingContext, options: Partial<HDRPostOptions>) {
        super(gl, options, new HDRFrame(gl, new HDRHelper(gl)));
    }

    disposeFbo() {
        (this.fbo as HDRFrame).dispose();
    }

    initFbo() {
        (this.fbo as HDRFrame).create(this.options);
    }
}
