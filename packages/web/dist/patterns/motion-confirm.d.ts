type ConfirmProps = {
    label: string;
    onConfirm: () => void;
};
/** A pointer hold confirms after one second; keyboard activation requires a second activation. */
export declare function HoldButton({ label, onConfirm }: ConfirmProps): import("react/jsx-runtime").JSX.Element;
/** Drag the handle to the end and release; keyboard activation requires a second activation. */
export declare function SlideConfirm({ label, onConfirm }: ConfirmProps): import("react/jsx-runtime").JSX.Element;
export {};
