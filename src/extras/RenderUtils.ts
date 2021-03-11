import {
    Renderer,
    RenderTarget,
    Program,
    Texture,
    Transform,
    Camera,
    Mesh,
    Plane,
    Vec2,
    OGLRenderingContext
} from '../ogl';


export class Utils {
    static readonly copyVertex = /* glsl */ `
    attribute vec2 uv;
    attribute vec3 position;
    varying vec2 vUv;
    uniform mat4 modelMatrix;
    uniform mat4 projectionMatrix;

    void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelMatrix * vec4(position, 1);
    }
`;
    static readonly copyFragment = /* glsl */ `
    precision highp float;
    uniform sampler2D tMap;
    varying vec2 vUv;
    void main() {
        gl_FragColor = texture2D(tMap, vUv);
    }
`;
    private static instanceMap_: Map<string, Utils> = new Map<string, Utils>();
    private copyprogram_: Program;
    private orthoScene_: Transform = new Transform();
    private mesh_: Mesh;
    private orthoCamera_: Camera;
    private gl: OGLRenderingContext;

    constructor(gl: OGLRenderingContext) {
        this.gl = gl;
        this.copyprogram_ = new Program(gl, {
            vertex: Utils.copyVertex,
            fragment: Utils.copyFragment,
            uniforms: {tMap: {value: {texture: null}}},
            depthTest: false,
            depthWrite: false,
        });
        this.orthoCamera_ = new Camera(gl);
        this.orthoCamera_.orthographic({near: 0, far: 10, left: -1, right: 1, bottom: -1, top: 1});
        let plane = new Plane(gl, {width: 2, height: 2});
        this.mesh_ = new Mesh(gl, {geometry: plane});
        this.mesh_.setParent(this.orthoScene_);
    }

    public static getInstance(gl: any): Utils {
        let ins = Utils.instanceMap_.get(gl.canvas.id);
        if (!ins) Utils.instanceMap_.set(gl.canvas.id, (ins = new Utils(gl)));
        return ins;
    }

    renderPass(renderer: Renderer, program: Program, target?: RenderTarget, clear?: boolean) {
        this.mesh_.program = program;
        renderer.render({scene: this.orthoScene_, camera: this.orthoCamera_, target, clear});
    }

    blit(renderer: Renderer, source: RenderTarget | Texture, target?: RenderTarget, clear?: boolean) {
        this.copyprogram_.uniforms['tMap'].value = source.texture ? source.texture : source;
        this.renderPass(renderer, this.copyprogram_, target, clear)
        this.mesh_.program = this.copyprogram_;
    }

}
