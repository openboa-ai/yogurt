import { type TextareaHTMLAttributes } from "react";
type Person = {
    id: string;
    label: string;
};
/** Shared local presentation; the host remains the owner of the draft and people. */
export declare function useMention({ people, value, onChange, collapsedOnly }: {
    people?: readonly Person[];
    value: string;
    onChange: (value: string) => void;
    collapsedOnly?: boolean;
}): {
    id: string;
    input: import("react").RefObject<HTMLTextAreaElement | null>;
    editorProps: Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "value">;
    open: boolean;
    options: Person[];
    index: number;
    marker: import("react").RefObject<HTMLSpanElement | null>;
    setActiveId: import("react").Dispatch<import("react").SetStateAction<string | null>>;
    select: (person: Person) => void;
};
export declare function MentionOptions({ mention }: {
    mention: ReturnType<typeof useMention>;
}): import("react/jsx-runtime").JSX.Element;
export {};
