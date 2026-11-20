export declare function MentionPicker({ label, people, value, onChange }: {
    label: string;
    people: {
        id: string;
        label: string;
    }[];
    value: string;
    onChange: (value: string) => void;
}): import("react/jsx-runtime").JSX.Element;
export declare function FileDrop({ label, onFiles, accept, multiple }: {
    label: string;
    onFiles: (files: File[]) => void;
    accept?: string;
    multiple?: boolean;
}): import("react/jsx-runtime").JSX.Element;
