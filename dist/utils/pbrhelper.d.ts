import { PBRMaterial, PBRMaterialParams } from "../materials/pbrmaterial";
import { OGLRenderingContext, Transform } from "../ogl";
export declare function assignPBRMaterials(gl: OGLRenderingContext, root: Transform, materialCtor?: (gl: OGLRenderingContext, p: PBRMaterialParams, defines: string) => PBRMaterial): void;
//# sourceMappingURL=pbrhelper.d.ts.map