import { type ReactNode } from "react";
export interface DraftAttachment {
    id: string;
    name: string;
    detail?: string;
    progress?: number;
}
export interface ComposerTool {
    id: string;
    label: string;
    disabled?: boolean;
}
export interface ComposerContextChip {
    id: string;
    label: string;
    tone?: "neutral" | "brand" | "accent" | "warning";
}
export declare function Composer({ value, onValueChange, onSend, attachments, onRemoveAttachment, onAddAttachment, tools, onTool, pending, onStop, label, placeholder, toolLabel, sendTone, error, companion, header, contextChips, shortcutHint, mentionPeople, }: {
    value: string;
    onValueChange: (value: string) => void;
    onSend: (message: {
        text: string;
        attachmentIds: string[];
    }) => void;
    attachments?: readonly DraftAttachment[];
    onRemoveAttachment?: (id: string) => void;
    onAddAttachment?: () => void;
    tools?: readonly ComposerTool[];
    onTool?: (id: string) => void;
    pending?: boolean;
    onStop?: () => void;
    label?: string;
    placeholder?: string;
    toolLabel?: string;
    sendTone?: "brand" | "neutral";
    error?: string;
    companion?: ReactNode;
    header?: ReactNode;
    contextChips?: readonly ComposerContextChip[];
    shortcutHint?: string;
    mentionPeople?: readonly {
        id: string;
        label: string;
    }[];
}): import("react/jsx-runtime").JSX.Element;
export type VoiceState = "idle" | "recording" | "review" | "unavailable";
export declare function VoiceControl({ state, duration, preview, onStart, onStop, onSend, onDiscard, }: {
    state: VoiceState;
    duration?: string;
    preview?: ReactNode;
    onStart?: () => void;
    onStop?: () => void;
    onSend?: () => void;
    onDiscard?: () => void;
}): import("react/jsx-runtime").JSX.Element;
