export declare function MentionPicker({ label, people, value, onChange }: {
    label: string;
    people: {
        id: string;
        label: string;
    }[];
    value: string;
    onChange: (value: string) => void;
}): import("react/jsx-runtime").JSX.Element;
export declare function FileDrop({ label, onFiles, accept, multiple, progress }: {
    label: string;
    onFiles: (files: File[]) => void;
    accept?: string;
    multiple?: boolean;
    /** Caller-reported work on the selected files, as a fraction from zero to one. */
    progress?: number;
}): import("react/jsx-runtime").JSX.Element;
