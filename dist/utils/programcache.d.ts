import { Program } from '../ogl';
export declare class ProgramCache {
    private programMap_;
    private static instance_;
    private constructor();
    static getInstance(): ProgramCache;
    createProgram(gl: any, vertex: string, fragment: string, uniforms: any): Program;
}
//# sourceMappingURL=programcache.d.ts.map