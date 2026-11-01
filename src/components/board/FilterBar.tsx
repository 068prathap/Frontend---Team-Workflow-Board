import { priorityList, statusList, type Priority, type Status } from "@/types/task";
import { sortOptions, type Filters, type SortKey } from "@/types/filters";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { TextInput } from "@/components/ui/TextInput";
import styles from "./board.module.css";

type FilterBarProps = {
  filters: Filters;
  isFiltered: boolean;
  onChange: (changes: Partial<Filters>) => void;
  onClear: () => void;
};

export function FilterBar({ filters, isFiltered, onChange, onClear }: FilterBarProps) {
  function toggleStatus(status: Status) {
    const next = filters.status.includes(status)
      ? filters.status.filter((item) => item !== status)
      : [...filters.status, status];
    onChange({ status: next });
  }

  return (
    <div className={styles.filterBar} role="search">
      <div className={styles.searchField}>
        <TextInput
          label="Search"
          type="search"
          placeholder="Search title or description"
          value={filters.search}
          onChange={(e) => onChange({ search: e.target.value })}
        />
      </div>

      <fieldset className={styles.statusFilter}>
        <legend className={styles.legend}>Status</legend>
        <div className={styles.checkboxes}>
          {statusList.map((status) => (
            <label key={status} className={styles.checkbox}>
              <input
                type="checkbox"
                checked={filters.status.includes(status)}
                onChange={() => toggleStatus(status)}
              />
              {status}
            </label>
          ))}
        </div>
      </fieldset>

      <Select
        label="Priority"
        options={["All", ...priorityList]}
        value={filters.priority}
        onChange={(e) => onChange({ priority: e.target.value as Priority | "All" })}
      />

      <Select
        label="Sort by"
        options={sortOptions}
        value={filters.sort}
        onChange={(e) => onChange({ sort: e.target.value as SortKey })}
      />

      {isFiltered && (
        <Button variant="secondary" size="sm" className={styles.clearButton} onClick={onClear}>
          Clear filters
        </Button>
      )}
    </div>
  );
}
