export type AgentMotionFit = readonly [slide: number, lift: number, tilt: number, gazeX: number, gazeY: number];
export declare const agentColors: {
    readonly "slate.300": "#79B3D6";
    readonly "slate.400": "#5C9BC2";
    readonly "blue.300": "#86C0FE";
    readonly "blue.400": "#60A7F5";
    readonly "indigo.300": "#A6B4F7";
    readonly "violet.200": "#D0C4DC";
    readonly "violet.300": "#BBACCE";
    readonly "purple.400": "#B28CE0";
    readonly "magenta.300": "#EAA3D2";
    readonly "rose.300": "#D1ABBB";
    readonly "rose.400": "#BE94A7";
    readonly "red.400": "#FF7E77";
    readonly "terracotta.200": "#E7B9AE";
    readonly "terracotta.300": "#D88F7D";
    readonly "orange.400": "#F69A57";
    readonly "earth.300": "#C5B59F";
    readonly "ochre.200": "#E0CE9D";
    readonly "ochre.300": "#D6BB84";
    readonly "yellow.300": "#E9D985";
    readonly "lime.300": "#BED68F";
    readonly "sage.300": "#B0BEAB";
    readonly "sage.400": "#97AB91";
    readonly "teal.200": "#A9C8C3";
    readonly "teal.300": "#90B5B0";
    readonly "green.400": "#70BE7F";
    readonly "cyan.300": "#7DCDDC";
};
export declare const agentShapes: {
    readonly kai: {
        readonly name: "Kai";
        readonly color: "sage.300";
        readonly center: readonly [51, 50];
        readonly motion: "kai";
        readonly fit: readonly [1, 1, 1, 1, 1];
    };
    readonly sol: {
        readonly name: "Sol";
        readonly color: "terracotta.300";
        readonly center: readonly [50, 49];
        readonly motion: "sol";
        readonly fit: readonly [1, 1, 1, 1, 1];
    };
    readonly "wide-oval": {
        readonly name: "Wide oval";
        readonly color: "slate.400";
        readonly center: readonly [50, 53];
        readonly motion: "kai";
        readonly fit: readonly [0.72, 1, 0.9, 1, 1];
    };
    readonly "low-dome": {
        readonly name: "Low dome";
        readonly color: "violet.300";
        readonly center: readonly [50, 60];
        readonly motion: "kai";
        readonly fit: readonly [1, 1, 1, 1, 0.9];
    };
    readonly "round-triangle": {
        readonly name: "Round triangle";
        readonly color: "ochre.300";
        readonly center: readonly [50, 59];
        readonly motion: "kai";
        readonly fit: readonly [1, 1, 1, 0.83, 1];
    };
    readonly "tall-capsule": {
        readonly name: "Tall capsule";
        readonly color: "teal.300";
        readonly center: readonly [50, 52];
        readonly motion: "kai";
        readonly fit: readonly [1, 1, 1, 0.66, 1];
    };
    readonly "round-diamond": {
        readonly name: "Round diamond";
        readonly color: "rose.300";
        readonly center: readonly [50, 54];
        readonly motion: "kai";
        readonly fit: readonly [1, 1, 1, 0.86, 1];
    };
    readonly "wide-base": {
        readonly name: "Wide base";
        readonly color: "earth.300";
        readonly center: readonly [50, 56];
        readonly motion: "kai";
        readonly fit: readonly [0.91, 1, 1, 1, 1];
    };
    readonly "wide-crown": {
        readonly name: "Wide crown";
        readonly color: "sage.400";
        readonly center: readonly [50, 48];
        readonly motion: "kai";
        readonly fit: readonly [1, 1, 1, 1, 0.87];
    };
    readonly "tilted-oval": {
        readonly name: "Tilted oval";
        readonly color: "terracotta.200";
        readonly center: readonly [50, 55];
        readonly motion: "kai";
        readonly fit: readonly [1, 1, 0.86, 1, 1];
    };
    readonly drop: {
        readonly name: "Drop";
        readonly color: "teal.200";
        readonly center: readonly [51, 61];
        readonly motion: "kai";
        readonly fit: readonly [1, 1, 1, 0.8, 0.86];
    };
    readonly "round-star": {
        readonly name: "Round star";
        readonly color: "ochre.200";
        readonly center: readonly [50, 54];
        readonly motion: "kai";
        readonly fit: readonly [1, 1, 1, 0.78, 0.9];
    };
    readonly bean: {
        readonly name: "Bean";
        readonly color: "rose.400";
        readonly center: readonly [47, 55];
        readonly motion: "kai";
        readonly fit: readonly [1, 1, 1, 0.85, 1];
    };
    readonly "round-pentagon": {
        readonly name: "Round pentagon";
        readonly color: "slate.300";
        readonly center: readonly [50, 55];
        readonly motion: "kai";
        readonly fit: readonly [1, 1, 1, 1, 0.92];
    };
    readonly "round-heart": {
        readonly name: "Round heart";
        readonly color: "violet.200";
        readonly center: readonly [50, 50];
        readonly motion: "kai";
        readonly fit: readonly [1, 1, 1, 0.9, 0.9];
    };
};
export type AgentColor = keyof typeof agentColors;
export type AgentShape = keyof typeof agentShapes;
export type AgentVariant = "kai-top" | "kai-bottom" | "kai-right" | "kai-left" | "sol-bottom" | "sol-right" | "sol-left" | "wide-oval-top" | "wide-oval-bottom" | "wide-oval-right" | "wide-oval-left" | "low-dome-bottom" | "low-dome-left" | "low-dome-right" | "round-triangle-bottom" | "round-triangle-right" | "round-triangle-left" | "tall-capsule-top" | "tall-capsule-bottom" | "tall-capsule-right" | "tall-capsule-left" | "round-diamond-left" | "round-diamond-right" | "wide-base-top" | "wide-base-bottom" | "wide-base-right" | "wide-crown-top" | "wide-crown-left" | "wide-crown-right" | "tilted-oval-top" | "tilted-oval-bottom" | "tilted-oval-left" | "drop-bottom" | "drop-right" | "drop-left" | "round-star-right" | "round-star-left" | "bean-top" | "bean-bottom" | "bean-left" | "round-pentagon-bottom" | "round-pentagon-right" | "round-pentagon-left" | "round-heart-right" | "round-heart-left";
export type AgentNotch = "top" | "right" | "bottom" | "left";
export declare const agentVariants: Readonly<Record<AgentVariant, {
    shape: AgentShape;
    notch: AgentNotch;
    path: string;
}>>;
