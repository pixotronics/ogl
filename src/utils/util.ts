import {Mesh, PostFBO, ProgramOptions, Renderer, Transform, Vec3} from "../ogl";
import encodingChunk from "../shaders/encoding_par.glsl"
import toneMappingChunk from "../shaders/tonemapping_par.glsl"
import {Pass} from "../../dist";

export function getSnapshotData(renderer: Renderer, mimeType?: string): string {
    mimeType = mimeType ?? "image/png";
    return renderer.gl.canvas.toDataURL(mimeType);
}

export function getSnapshot(renderer: Renderer, options: { mimeType?: string, context?: CanvasRenderingContext2D, canvas?: HTMLCanvasElement }): Promise<string> {
    let imgUrl = getSnapshotData(renderer, options.mimeType);
    let context = options.context ?? options.canvas?.getContext("2d");
    if (!context)
        return Promise.resolve(imgUrl);
    return new Promise<string>((resolve, reject) => {
        let img = new Image();
        img.onload = () => {
            context?.drawImage(img, 0, 0, context!.canvas.width, context!.canvas.height);
            resolve(imgUrl);
        };
        img.src = imgUrl;
    });
}

export function getPointerPosition(position: {x: number, y: number}, canvas: HTMLCanvasElement) {
    const canvasBounds = canvas.getBoundingClientRect();
    let x = ((position.x - canvasBounds.left) / (canvasBounds.right - canvasBounds.left)) * 2 - 1;
    let y = -((position.y - canvasBounds.top) / (canvasBounds.bottom - canvasBounds.top)) * 2 + 1;
    return{ x: x, y: y};
}

export function getAllMeshes(root: Transform) {
    let meshes : any = [];
    root.traverse((group) => {
        if((group as Mesh)?.geometry) {
            if (!group.parent) return; // Skip unattached
            meshes.push(group);
        }
    });
    return meshes;
}

export function computeBoundingBox(root: Transform) {
    const min = new Vec3(+Infinity);
    const max = new Vec3(-Infinity);
    
    const boundsMin = new Vec3();
    const boundsMax = new Vec3();
    const boundsCenter = new Vec3();
    const boundsScale = new Vec3();
    
    root.traverse((group) => {
        let geometry = (group as Mesh)?.geometry;
        if(geometry) {
            if (!group.parent) return; // Skip unattached

            if (!geometry.bounds) geometry.computeBoundingSphere();

            boundsCenter.copy(geometry.bounds.center).applyMatrix4(group.worldMatrix);

            // Get max world scale axis
            group.worldMatrix.getScaling(boundsScale);
            const radiusScale = Math.max(Math.max(boundsScale[0], boundsScale[1]), boundsScale[2]);
            const radius = geometry.bounds.radius * radiusScale;

            boundsMin.set(-radius).add(boundsCenter);
            boundsMax.set(+radius).add(boundsCenter);

            // Apply world matrix to bounds
            for (let i = 0; i < 3; i++) {
                min[i] = Math.min(min[i], boundsMin[i]);
                max[i] = Math.max(max[i], boundsMax[i]);
            }
        }
    });

    return {min: min, max: max};
}

export function traverse(root: Transform, callBack: any, filter?: any) {
    root.traverse((group: Transform) => {
        if(filter) {
            if(filter(group)) {
                callBack(group);
            }
        } else {
            callBack(group);
        }
    });
}

export function traverseMeshes(root: Transform, callBack: any) {
    traverse(root, callBack, (group: Transform)=> {return (group as Mesh).geometry != null});
}

export const EncodingHelper = {
    Linear: 0,
    sRGB: 1,
    RGBE: 2,
    RGBM7: 3,
    RGBM16: 4,
    RGBD: 5,
    Gamma: 6,
    shaderChunk: encodingChunk
};
export const ToneMappingHelper = {
    Linear: 0,
    Reinhard: 1,
    Cineon: 2,
    ACESFilmic: 3,
    uniforms: {
        toneMappingExposure: {value: 1.}
    },
    shaderChunk: toneMappingChunk
}
