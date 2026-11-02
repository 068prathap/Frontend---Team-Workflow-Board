# Team Workflow Board

A small Trello-style board for a team's tasks. Tasks live in three columns (Backlog, In Progress, Done), can be created, edited, moved and deleted, can be filtered and sorted, and are saved in the browser.

## How to run

Requires Node 18.18 or newer.

```bash
npm install
npm run dev
```

Open http://localhost:3000.

| Script | What it does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm test` | Run the Jest + React Testing Library tests |
| `npm run build` | Production build |
| `npm run lint` | ESLint |

## Features

- **Board:** three status columns with a task count. Cards show title, priority, assignee, tags and "Updated 3 hours ago".
- **Move tasks** between columns with the status dropdown on each card.
- **Create, edit and delete** tasks in a modal form.
- **Validation:** title is required, with an accessible error message.
- **Unsaved changes:** closing the form (close button, Cancel, Escape, clicking outside) asks before throwing away edits, and the browser warns before leaving the page.
- **Filters and sort:** status (multi-select), priority, text search in title and description, sort by created date, updated date or priority. All of it is kept in the URL, so a filtered view can be shared and survives a refresh. Example: `/?status=Backlog,Done&priority=High&q=login&sort=updated`
- **Persistence:** localStorage with a versioned schema and a migration from the old format, with a notification when a migration runs.
- **Empty and error states:** no tasks yet, no tasks match the filters (with a "Clear filters" button), an empty column, broken or blocked storage, and validation errors.
- **Toasts** for created, updated and deleted tasks.

## Project structure

```
src/
  app/
    layout.tsx           root layout
    page.tsx             renders the Board
    globals.css          design tokens (colors, spacing, radius, font sizes) and base styles
  components/
    ui/                  reusable component library, no app logic
      Button.tsx         variants: primary, secondary, destructive; sizes: sm, md, lg
      Field.tsx          label + error wrapper shared by the inputs
      TextInput.tsx
      TextArea.tsx
      Select.tsx         takes plain strings or { value, label } options
      Tag.tsx            tones: neutral, red, amber, green
      Card.tsx
      Modal.tsx
      Toast.tsx
      Alert.tsx
      ui.module.css
    board/               app-specific components
      Board.tsx          container: wires hooks to the UI, owns form and toast state
      FilterBar.tsx
      Column.tsx
      TaskCard.tsx
      TaskForm.tsx       presentational form, gets values and callbacks as props
      board.module.css
  hooks/
    useTasks.ts          task list + localStorage load, save, migration and errors
    useFilters.ts        filter state + syncing it with the URL
  types/
    task.ts              Task, Status, Priority, TaskFormData, StoredBoard
    filters.ts           Filters, SortKey, defaults
  utils/
    filterTasks.ts       pure filter + sort function
    filterParams.ts      filters to and from a URL query string
    relativeTime.ts      "3 hours ago" formatting
```

### Component hierarchy

```
Board
  Button ("Add task")
  Alert (storage errors)
  FilterBar
    TextInput, checkboxes, Select x2, Button
  Column x3
    TaskCard
      Card, Tag, Select, Button
  Modal
    TaskForm
      TextInput, TextArea, Select, Button
  Toast
```

## Key decisions

- **Next.js (App Router) used as a single page app.** It is the setup I use at work, so I could focus on the features. Everything runs in the browser; there is no backend or API route.
- **State: React state and two custom hooks, no state library.** The data is one list of tasks used by one screen. `useTasks` owns the tasks and storage, `useFilters` owns the filters and the URL, and `Board` owns UI state (open form, form values, toast). Redux or Zustand would add setup without solving a real problem at this size.
- **Container and presentational split.** `Board` holds state and logic. `FilterBar`, `Column`, `TaskCard` and `TaskForm` only receive data and callbacks through props.
- **Pure functions for the logic.** Filtering, sorting and URL parsing live in `utils/` as plain functions, so they are easy to test without rendering anything.
- **Filters in the URL.** Filter state lives in React state and is written to the URL with `history.replaceState` whenever it changes, and read from the URL once on load. Unknown values in the URL (for example `?priority=Urgent`) fall back to the defaults. `replaceState` is used instead of `pushState` so typing in the search box does not fill the back button history.
- **Status and priority lists defined once.** `statusList` and `priorityList` drive both the TypeScript types and the UI, so adding a status is a one-line change.
- **Dates stored as ISO strings.** localStorage only stores text, and ISO strings also sort correctly as plain strings.
- **CSS Modules with CSS variables.** No UI kit. Colors, spacing and radius live in `globals.css` so every component uses the same values.

## Storage versioning and migration

Tasks are saved under the key `taskBoard`.

- **Version 1** (the first version of the app) saved a plain array of tasks: `[task, task]`.
- **Version 2** saves an object with a version number: `{ schemaVersion: 2, tasks: [task, task] }`.

On load, `useTasks` checks the saved data:

- nothing saved: start with an empty board
- a plain array: version 1 data, so it is loaded, saved back in the version 2 shape, and a toast says "Your saved tasks were updated to the new format"
- an object: version 2 data, used as it is
- unreadable data (or storage blocked): an error alert is shown, the app keeps working in memory, and the broken data is **not** overwritten, so nothing is lost by accident

The version number means a future shape change can be detected and upgraded the same way.

To try the migration, paste this in the browser console and refresh:

```js
localStorage.setItem("taskBoard", JSON.stringify([{ id: "1", title: "Old task", description: "", status: "Backlog", priority: "Low", assignee: "", tags: [], createdAt: "2026-10-01T10:00:00.000Z", updatedAt: "2026-10-01T10:00:00.000Z" }]))
```

## Performance fix

**Problem:** every keystroke in the task form re-rendered every task card on the board. The form values live in `Board`'s state, so each key press re-rendered `Board`, and with it every `Column` and `TaskCard`, even though no task changed.

**How it was found:** by counting `TaskCard` renders (a temporary counter in the component) while typing 10 characters into the form title with 5 tasks on the board: **100 renders** (5 cards x 10 keystrokes, doubled by React's development-mode double render). React DevTools' Profiler or "Highlight updates when components render" shows the same thing.

**Fix:**
- `TaskCard` and `Column` are wrapped in `React.memo`, so they skip rendering when their props have not changed.
- The callbacks they receive (`changeStatus`, `openForm`) are wrapped in `useCallback`, so they keep the same identity between renders. Without this, `memo` would not help.
- The filtered tasks and the per-column groups are built with `useMemo`, so each column gets the same array until the tasks or filters actually change.

**Result:** the same 10 keystrokes now cause **0** `TaskCard` renders.

## Testing

Jest + React Testing Library (`npm test`), 9 tests:

- **Core workflow** (`Board.test.tsx`): create a task (including the "Title is required" error and first-field focus), see it in the Backlog column with its tags, and check it was saved in the version 2 format.
- **UI behavior** (`Board.test.tsx`): changing a task's status moves it to the right column; typing in search filters the board and updates the URL; filters are restored from the URL on load; closing the form with unsaved changes asks first and returns focus to the Edit button.
- **Migration and storage errors** (`useTasks.test.ts`).
- **Filter and sort logic** (`filterTasks.test.ts`).

## Accessibility

- Every input has a `<label>`; the status dropdown on each card has a visually hidden label ("Status of <task title>"). The status filter is a `<fieldset>` with a `<legend>`.
- Validation errors are linked with `aria-describedby`, set `aria-invalid`, and are announced with `role="alert"`.
- Modal: `role="dialog"`, `aria-modal`, labelled by its title, focuses the first field when it opens, keeps Tab focus inside, closes on Escape, and returns focus to the button that opened it.
- Toasts use `role="status"`, storage errors use `role="alert"`.
- Columns are `<section>`s with headings, cards are list items, the filter bar is a `search` landmark.
- Visible focus outline on all interactive elements. Everything works with the keyboard only.

## Example refactor

The empty form values (`{ title: "", description: "", ... }`) were first written twice: once as the initial state and once in the reset function. I moved them into one `emptyForm` constant so adding a field means changing one place.

Later, the whole board was one `page.tsx` file with all state, storage and markup together. It was split into the `useTasks` hook (data and storage), the `ui` components (generic building blocks) and the `board` components (app-specific), with TypeScript types for each.

## Known limitations

- Moving tasks uses a dropdown, not drag and drop.
- "Updated 3 hours ago" refreshes when a task changes or the page reloads, not on a timer.
- Filters use `replaceState`, so the browser back button does not step through filter changes.
- Confirmations (discard changes, delete) use the browser's `window.confirm` instead of a custom modal.
- Delete has no undo.
- Only the title is validated (required). There is no length limit, and duplicate tags are allowed.

## AI assistance

I used Claude (an AI assistant) during this assignment.

**What I built myself:** the board columns, moving tasks with the status dropdown, the create and edit form, title validation, the unsaved changes warning on close, saving to localStorage, and the versioned schema with the migration. Claude reviewed my code after each step and pointed out problems (for example tags being split wrongly while typing, using the array index as a React key, and using the function form of `setState`). I made those fixes myself. These are the commits up to and including "Version the saved data and migrate old saves".

**What Claude did, because I ran short on time:** every commit after that one.

- "Add Task types and move storage into a useTasks hook"
- "Add UI component library with shared design tokens"
- "Split the board into components and enable strict TypeScript"
- "Write README with architecture, migration notes, limitations and AI use"
- "Add filters and sorting kept in the URL, relative update time, delete and storage error handling"
- "Memoize task cards and columns so typing in the form does not re-render the board"
- "Add Jest and React Testing Library tests for the main flows, filters and migration"
- "Update README for the finished app"

That covers splitting my single page into components and hooks, the TypeScript types, the visual design, accessibility, filters and sorting with the URL, relative time, delete, storage error handling, the performance fix, the tests, and this README. The storage, migration, create, edit and status logic inside the hooks is the logic I wrote earlier, moved into the new files.

**What I changed from Claude's suggestions:** I gave Claude the instructions for each part, based on this assignment, and guided it by checking the result in the browser and asking for changes when something was not right (for example, the dropdown arrows in the filter bar were not aligned). I did not rewrite Claude's code by hand.
