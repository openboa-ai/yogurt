import { type ReactNode } from "react";
export interface Fact {
    id: string;
    label: string;
    value: ReactNode;
    unit?: string;
}
export interface Observation {
    source: string;
    asOf: string;
    timeLabel?: string;
}
export declare function RecordFacts({ title, facts, source, asOf, timeLabel, }: Observation & {
    title?: string;
    facts: Fact[];
}): import("react/jsx-runtime").JSX.Element;
export type DataColumnKind = "identity" | "text" | "numeric" | "role" | "actions";
export interface DataColumn {
    id: string;
    label: string;
    kind?: DataColumnKind;
    align?: "start" | "end";
    numeric?: boolean;
    sortValue?: (row: DataRow) => string | number | null | undefined;
}
export interface DataRow {
    id: string;
    cells: Record<string, ReactNode>;
}
export declare function Table({ caption, children, }: {
    caption: string;
    children: ReactNode;
}): import("react/jsx-runtime").JSX.Element;
export declare function DataTable({ caption, columns, rows, }: {
    caption: string;
    columns: DataColumn[];
    rows: DataRow[];
}): import("react/jsx-runtime").JSX.Element;
export declare function Legend({ label }: {
    label: string;
}): import("react/jsx-runtime").JSX.Element;
export interface Reading {
    id: string;
    label: string;
    value: number | null;
}
export declare function Chart({ title, series, unit, points, source, asOf, timeLabel, }: Observation & {
    title: string;
    series: string;
    unit: string;
    points: Reading[];
}): import("react/jsx-runtime").JSX.Element;
