export type ResourceKind = "file" | "page" | "image" | "media" | "link" | "app" | "output";
export interface WorkspaceResource {
    id: string;
    title: string;
    kind: ResourceKind;
    detail?: string;
    pinned?: boolean;
}
export interface WorkspaceThread {
    id: string;
    title: string;
    preview?: string;
    updatedAt?: {
        dateTime: string;
        label: string;
    };
    unread?: boolean;
}
export declare const resourceLabels: Record<ResourceKind, string>;
export declare function ResourceRow({ resource, selected, onOpen, onPinChange, }: {
    resource: WorkspaceResource;
    selected?: boolean;
    onOpen?: (id: string) => void;
    onPinChange?: (id: string, pinned: boolean) => void;
}): import("react/jsx-runtime").JSX.Element;
export declare function ThreadRow({ thread, selected, onOpen, }: {
    thread: WorkspaceThread;
    selected?: boolean;
    onOpen?: (id: string) => void;
}): import("react/jsx-runtime").JSX.Element;
