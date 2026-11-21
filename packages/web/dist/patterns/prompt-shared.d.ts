import { type ReactNode, type Ref, type TextareaHTMLAttributes } from "react";
type EditorProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "value"> & {
    value: string;
    presentation: "composer" | "prompt";
    inputRef?: Ref<HTMLTextAreaElement>;
    after?: ReactNode;
};
/** The measurement node is presentation-only; the host continues to own input. */
export declare function PromptEditor({ value, presentation, rows, inputRef, after, ...props }: EditorProps): import("react/jsx-runtime").JSX.Element;
type ActionProps = {
    presentation: "composer" | "prompt";
    busy: boolean;
    ready: boolean;
    onStop?: () => void;
    renderComposer?: (button: Ref<HTMLButtonElement>, stopping: boolean) => ReactNode;
};
/** Separate button identities prevent a Stop click from submitting the form. */
export declare function PromptAction({ presentation, busy, ready, onStop, renderComposer }: ActionProps): string | number | bigint | boolean | import("react/jsx-runtime").JSX.Element | Iterable<ReactNode> | Promise<string | number | bigint | boolean | import("react").ReactPortal | import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null;
export {};
