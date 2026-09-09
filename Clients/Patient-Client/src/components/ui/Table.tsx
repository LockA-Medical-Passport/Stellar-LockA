"use client";

import { type ReactNode, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "./Skeleton";

export type SortDirection = "asc" | "desc";

export interface TableColumn<T> {
  key: string;
  header: ReactNode;
  render: (row: T) => ReactNode;
  /** Provide alongside `sortValue` to make the column header clickable. */
  sortable?: boolean;
  sortValue?: (row: T) => string | number;
  className?: string;
}

export interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  getRowId: (row: T) => string;
  loading?: boolean;
  emptyState?: ReactNode;
  /** Column sorted on first render. */
  initialSort?: { key: string; direction: SortDirection };
  className?: string;
}

const SKELETON_ROWS = 5;

export function Table<T>({
  columns,
  data,
  getRowId,
  loading = false,
  emptyState,
  initialSort,
  className,
}: TableProps<T>) {
  const [sort, setSort] = useState<{ key: string; direction: SortDirection } | null>(
    initialSort ?? null,
  );

  const rows = useMemo(() => {
    if (!sort) return data;
    const column = columns.find((candidate) => candidate.key === sort.key);
    if (!column?.sortValue) return data;

    const sorted = [...data].sort((a, b) => {
      const left = column.sortValue!(a);
      const right = column.sortValue!(b);
      if (left < right) return -1;
      if (left > right) return 1;
      return 0;
    });
    return sort.direction === "desc" ? sorted.reverse() : sorted;
  }, [data, columns, sort]);

  function toggleSort(column: TableColumn<T>) {
    if (!column.sortable) return;
    setSort((current) =>
      current?.key === column.key
        ? { key: column.key, direction: current.direction === "asc" ? "desc" : "asc" }
        : { key: column.key, direction: "asc" },
    );
  }

  return (
    <div className={cn("glass overflow-x-auto rounded-xl", className)}>
      <table className="w-full min-w-[640px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-white/10">
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={cn(
                  "px-4 py-3 text-xs font-semibold tracking-wide text-foreground/60 uppercase",
                  column.className,
                )}
              >
                {column.sortable ? (
                  <button
                    type="button"
                    onClick={() => toggleSort(column)}
                    className="inline-flex items-center gap-1 rounded hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-locka-cyan/50"
                  >
                    {column.header}
                    <SortIcon active={sort?.key === column.key} direction={sort?.direction} />
                  </button>
                ) : (
                  column.header
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            Array.from({ length: SKELETON_ROWS }).map((_, rowIndex) => (
              <tr key={rowIndex} className="border-b border-white/5">
                {columns.map((column) => (
                  <td key={column.key} className="px-4 py-3">
                    <Skeleton shape="text" className="w-3/4" />
                  </td>
                ))}
              </tr>
            ))
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-12 text-center">
                {emptyState ?? <span className="text-sm text-foreground/50">No data</span>}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr
                key={getRowId(row)}
                className="border-b border-white/5 transition-colors last:border-b-0 hover:bg-white/5"
              >
                {columns.map((column) => (
                  <td key={column.key} className={cn("px-4 py-3", column.className)}>
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function SortIcon({ active, direction }: { active?: boolean; direction?: SortDirection }) {
  return (
    <svg viewBox="0 0 12 12" className="size-3" aria-hidden="true">
      <path
        d="M3 4.5 6 2l3 2.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={active && direction === "asc" ? "text-locka-cyan" : "text-foreground/30"}
      />
      <path
        d="M3 7.5 6 10l3-2.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={active && direction === "desc" ? "text-locka-cyan" : "text-foreground/30"}
      />
    </svg>
  );
}
