import { Renderer, RenderTarget, Program, Texture, OGLRenderingContext } from '../ogl';
export declare class Utils {
    static readonly copyVertex = "\n    attribute vec2 uv;\n    attribute vec3 position;\n    varying vec2 vUv;\n    uniform mat4 modelMatrix;\n    uniform mat4 projectionMatrix;\n\n    void main() {\n        vUv = uv;\n        gl_Position = projectionMatrix * modelMatrix * vec4(position, 1);\n    }\n";
    static readonly copyFragment = "\n    precision highp float;\n    uniform sampler2D tMap;\n    varying vec2 vUv;\n    void main() {\n        gl_FragColor = texture2D(tMap, vUv);\n    }\n";
    private static instanceMap_;
    private copyprogram_;
    private orthoScene_;
    private mesh_;
    private orthoCamera_;
    private gl;
    constructor(gl: OGLRenderingContext);
    static getInstance(gl: any): Utils;
    renderPass(renderer: Renderer, program: Program, target?: RenderTarget, clear?: boolean): void;
    blit(renderer: Renderer, source: RenderTarget | Texture, target?: RenderTarget, clear?: boolean): void;
}
//# sourceMappingURL=RenderUtils.d.ts.map