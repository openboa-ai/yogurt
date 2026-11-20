export declare function StreamingReply({ value, active }: {
    value: string;
    active?: boolean;
}): import("react/jsx-runtime").JSX.Element;
export declare function GhostSuggestion({ value, suggestion, onChange }: {
    value: string;
    suggestion: string;
    onChange: (value: string) => void;
}): import("react/jsx-runtime").JSX.Element;
export declare function PromptBox({ value, onChange, onSubmit, busy, onCancel }: {
    value: string;
    onChange: (value: string) => void;
    onSubmit: () => void;
    busy?: boolean;
    onCancel?: () => void;
}): import("react/jsx-runtime").JSX.Element;
export declare function ThinkingIndicator({ label, active }: {
    label?: string;
    active?: boolean;
}): import("react/jsx-runtime").JSX.Element | null;
