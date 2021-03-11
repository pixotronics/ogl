/**
 * ported from https://github.com/mrdoob/eventdispatcher.js/
 */
export declare class EventDispatcher {
    private _listeners;
    addEventListener(type: string, listener: any): void;
    hasEventListener(type: string, listener: any): boolean;
    removeEventListener(type: string, listener: any): void;
    dispatchEvent(event: any): void;
}
//# sourceMappingURL=eventdispatcher.d.ts.map