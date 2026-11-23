type FocusOption = {
    id: string;
    label: string;
    description: string;
};
type PlanOption = FocusOption & {
    price: string;
};
type ChoiceProps<T> = {
    value: string;
    onChange: (value: string) => void;
    options: T[];
};
export declare function FocusPicker(props: ChoiceProps<FocusOption>): import("react/jsx-runtime").JSX.Element;
export declare function PlanSwitch(props: ChoiceProps<PlanOption>): import("react/jsx-runtime").JSX.Element;
export {};
