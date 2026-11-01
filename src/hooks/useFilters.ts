import { useCallback, useEffect, useState } from "react";
import { defaultFilters, type Filters } from "@/types/filters";
import { readFilters, writeFilters } from "@/utils/filterParams";

export function useFilters() {
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setFilters(readFilters(window.location.search));
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const query = writeFilters(filters);
    window.history.replaceState(null, "", query ? `?${query}` : window.location.pathname);
  }, [filters, ready]);

  const updateFilters = useCallback((changes: Partial<Filters>) => {
    setFilters((prev) => ({ ...prev, ...changes }));
  }, []);

  const clearFilters = useCallback(() => setFilters(defaultFilters), []);

  const isFiltered = writeFilters({ ...filters, sort: defaultFilters.sort }) !== "";

  return { filters, updateFilters, clearFilters, isFiltered };
}
