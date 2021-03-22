import { Renderer, Transform, Vec3 } from "../ogl";
export declare function getSnapshotData(renderer: Renderer, mimeType?: string): string;
export declare function getSnapshot(renderer: Renderer, options: {
    mimeType?: string;
    context?: CanvasRenderingContext2D;
    canvas?: HTMLCanvasElement;
}): Promise<string>;
export declare function getPointerPosition(position: {
    x: number;
    y: number;
}, canvas: HTMLCanvasElement): {
    x: number;
    y: number;
};
export declare function getAllMeshes(root: Transform): any;
export declare function computeBoundingBox(root: Transform): {
    min: Vec3;
    max: Vec3;
};
export declare function traverse(root: Transform, callBack: any, filter?: any): void;
export declare function traverseMeshes(root: Transform, callBack: any): void;
export declare const EncodingHelper: {
    Linear: number;
    sRGB: number;
    RGBE: number;
    RGBM7: number;
    RGBM16: number;
    RGBD: number;
    Gamma: number;
    shaderChunk: any;
};
export declare const ToneMappingHelper: {
    Linear: number;
    Reinhard: number;
    Cineon: number;
    ACESFilmic: number;
    uniforms: {
        toneMappingExposure: {
            value: number;
        };
    };
    shaderChunk: any;
};
//# sourceMappingURL=util.d.ts.map