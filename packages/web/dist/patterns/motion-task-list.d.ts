type TaskState = "queued" | "running" | "done" | "failed";
interface TaskStep {
    id: string;
    label: string;
    state: TaskState;
    detail?: string;
}
export interface TaskListItem extends TaskStep {
    steps?: TaskStep[];
}
export declare function TaskList({ label, tasks }: {
    label: string;
    tasks: TaskListItem[];
}): import("react/jsx-runtime").JSX.Element;
export {};
