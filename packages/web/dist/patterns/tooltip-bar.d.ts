import { type IconName } from "../foundation/foundation.js";
type Tool = {
    id: string;
    label: string;
    detail: string;
    icon: IconName;
};
export declare function MorphTooltipBar({ label, tools, value, onChange }: {
    label: string;
    tools: readonly Tool[];
    value: string;
    onChange: (value: string) => void;
}): import("react/jsx-runtime").JSX.Element;
export {};
