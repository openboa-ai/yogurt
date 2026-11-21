export type Spring = {
    position: number;
    velocity: number;
    target: number;
    stiffness: number;
    damping: number;
};
export declare function spring(position: number, stiffness: number, damping: number): Spring;
export declare function snap(s: Spring, position: number): void;
export declare function advanceSprings(springs: readonly Spring[], elapsed: number): boolean;
export declare function playSprings(springs: readonly Spring[], paint: () => void): () => void;
