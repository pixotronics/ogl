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
//# sourceMappingURL=util.d.ts.map