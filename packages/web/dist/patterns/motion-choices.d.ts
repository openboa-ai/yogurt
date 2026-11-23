type LetterLimitProps = {
    label: string;
    value: string;
    onChange: (value: string) => void;
    limit: number;
    placeholder?: string;
    onSubmit?: (value: string) => void;
};
export declare function LetterLimit({ label, value, onChange, limit, placeholder, onSubmit }: LetterLimitProps): import("react/jsx-runtime").JSX.Element;
export {};
