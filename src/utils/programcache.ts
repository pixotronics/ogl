import {Program} from '../ogl'

export class ProgramCache {

    private programMap_: Map<string, Program> = new Map<string, Program>();
    private static instance_: ProgramCache;

    private constructor() {
    }

    static getInstance() {
        if(!this.instance_) {
            this.instance_ = new ProgramCache();
        }
        return this.instance_;
    }

    createProgram(gl: any, vertex: string, fragment: string, uniforms: any) {
        let key = vertex + fragment + gl.canvas.id;
        let cachedProgram = this.programMap_.get(key);
        if(cachedProgram) {
            return cachedProgram;
        }
        const program = new Program(gl, {
            vertex,
            fragment,
            uniforms: uniforms,
        });
        this.programMap_.set(key, program);
        return program;
    }
}
