declare const eventKinds: {
    task: {
        label: string;
        icon: "check";
    };
    handoff: {
        label: string;
        icon: "arrow";
    };
    artifact: {
        label: string;
        icon: "copy";
    };
    review: {
        label: string;
        icon: "info";
    };
    voice: {
        label: string;
        icon: "info";
    };
    routine: {
        label: string;
        icon: "clock";
    };
};
declare const eventStates: {
    running: {
        label: string;
        tone: "neutral";
    };
    ready: {
        label: string;
        tone: "success";
    };
    waiting: {
        label: string;
        tone: "warning";
    };
    failed: {
        label: string;
        tone: "danger";
    };
    done: {
        label: string;
        tone: "neutral";
    };
};
export interface WorkEventRecord {
    id: string;
    kind: keyof typeof eventKinds;
    title: string;
    detail?: string;
    time?: string;
    dateTime?: string;
    state?: keyof typeof eventStates;
}
export declare function WorkEvent({ event, onOpen, }: {
    event: WorkEventRecord;
    onOpen?: (id: string) => void;
}): import("react/jsx-runtime").JSX.Element;
declare const routineStates: {
    scheduled: {
        label: string;
        tone: "success";
    };
    paused: {
        label: string;
        tone: "neutral";
    };
    running: {
        label: string;
        tone: "neutral";
    };
    failed: {
        label: string;
        tone: "danger";
    };
};
export interface RoutineRecord {
    id: string;
    title: string;
    cadence: string;
    state: keyof typeof routineStates;
    nextRun?: string;
    lastRun?: string;
    canRun?: boolean;
}
export declare function RoutineRow({ routine, onInspect, onEdit, onRun, }: {
    routine: RoutineRecord;
    onInspect?: (id: string) => void;
    onEdit?: (id: string) => void;
    onRun?: (id: string) => void;
}): import("react/jsx-runtime").JSX.Element;
export {};
