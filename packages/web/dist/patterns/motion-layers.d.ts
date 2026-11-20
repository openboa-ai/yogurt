/** A contextual note that can be revealed with a pointer or keyboard focus. */
export declare function MorphTooltip({ label, detail }: {
    label: string;
    detail: string;
}): import("react/jsx-runtime").JSX.Element;
type LayerOption = {
    id: string;
    label: string;
};
/** A controlled listbox with an anchored panel and explicit selected state. */
export declare function SpringDropdown({ label, value, onChange, options }: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: LayerOption[];
}): import("react/jsx-runtime").JSX.Element;
/** A searchable command surface that returns the selected command ID. */
export declare function CommandButton({ label, items, onSelect }: {
    label: string;
    items: LayerOption[];
    onSelect: (id: string) => void;
}): import("react/jsx-runtime").JSX.Element;
export {};
