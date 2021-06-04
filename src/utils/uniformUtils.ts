/**
 * Uniform Utilities,
 */
import {TUniforms} from "../materials/pbrmaterial";

export function cloneUniforms( src: TUniforms ) {
    const dst: any = {};
    for (let u in src ) {
        dst[ u ] = {};
        for (let p in src[ u ] ) {
            const property = (src as any)[u][p];
            if ( property && (typeof property.clone === 'function' ) ) {
                dst[ u ][ p ] = property.clone();
            } else if ( Array.isArray( property ) ) {
                dst[ u ][ p ] = property.slice();
            } else {
                dst[ u ][ p ] = property;
            }
        }
    }
    return dst;
}

export function mergeUniforms( uniforms: TUniforms ) {
    const merged: any = {};
    for (let u = 0; u < uniforms.length; u ++ ) {
        const tmp = cloneUniforms(uniforms[u]);
        for (let p in tmp ) {
            merged[ p ] = tmp[ p ];
        }
    }
    return merged;
}