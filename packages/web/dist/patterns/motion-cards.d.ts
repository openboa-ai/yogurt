import { type ReactNode } from "react";
export declare function ExpandCard({ title, children }: {
    title: string;
    children: ReactNode;
}): import("react/jsx-runtime").JSX.Element;
type FanItem = {
    id: string;
    label: string;
    detail: string;
};
export declare function FanCards({ items }: {
    items: FanItem[];
}): import("react/jsx-runtime").JSX.Element;
export declare function StatCard({ label, value, detail, series }: {
    label: string;
    value: number;
    detail?: string;
    series?: readonly number[];
}): import("react/jsx-runtime").JSX.Element;
export declare function ProfileCard({ name, detail, initials, children, actions }: {
    name: string;
    detail: string;
    initials: string;
    children?: ReactNode;
    actions?: ReactNode;
}): import("react/jsx-runtime").JSX.Element;
export {};
