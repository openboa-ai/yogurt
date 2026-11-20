type ElasticRangeProps = {
    label: string;
    value: number;
    min: number;
    max: number;
    step: number;
    onChange: (value: number) => void;
    formatValue: (value: number) => string;
};
export declare function ElasticRange({ label, value, min, max, step, onChange, formatValue }: ElasticRangeProps): import("react/jsx-runtime").JSX.Element;
export {};
