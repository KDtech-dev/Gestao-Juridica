"use client";

import { PageSize } from "@/@core/types";
import { useCallback, useMemo, useState } from "react";

interface Options {
  initialPageSize?: PageSize;
  resetKey?: string;
}

export function usePagination<T>(
  items: T[],
  { initialPageSize = 5, resetKey = "" }: Options = {},
) {
  const [pageState, setPageState] = useState({ key: resetKey, page: 1 });
  const [pageSize, setPageSize] = useState<PageSize>(initialPageSize);

  const rawPage = pageState.key === resetKey ? pageState.page : 1;
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const page = Math.min(rawPage, totalPages); // clamp em vez de effect

  const setPage = useCallback(
    (next: number) => setPageState({ key: resetKey, page: next }),
    [resetKey],
  );

  const changePageSize = useCallback(
    (size: PageSize) => {
      setPageSize(size);
      setPageState({ key: resetKey, page: 1 });
    },
    [resetKey],
  );

  const goToItem = useCallback(
    (index: number) => setPage(Math.floor(index / pageSize) + 1),
    [pageSize, setPage],
  );

  const pageItems = useMemo(
    () => items.slice((page - 1) * pageSize, page * pageSize),
    [items, page, pageSize],
  );

  return {
    pageItems,
    page,
    totalPages,
    pageSize,
    setPage,
    changePageSize,
    goToItem,
  };
}