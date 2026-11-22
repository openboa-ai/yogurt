type CartButtonProps = {
    label: string;
    quantity: number;
    onQuantityChange: (quantity: number) => void;
    max?: number;
    addLabel?: string;
};
export declare function CartButton({ label, quantity, onQuantityChange, max, addLabel }: CartButtonProps): import("react/jsx-runtime").JSX.Element;
export {};
