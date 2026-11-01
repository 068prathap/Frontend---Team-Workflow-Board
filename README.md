# Team Workflow Board

A small Trello-style board for a team's tasks. Tasks live in three columns (Backlog, In Progress, Done), can be created, edited and moved between columns, and are saved in the browser.

## How to run

Requires Node 18.18 or newer.

```bash
npm install
npm run dev
```

Open http://localhost:3000.

Other scripts: `npm run build` (production build), `npm run lint`.

## What works

- Board with three status columns, each with a task count and a "No tasks" empty state
- Task cards show title, priority, assignee and tags
- Move a task between columns with the status dropdown on its card
- Create and edit tasks in a modal form
- Validation: title is required, with an accessible error message
- Unsaved changes warning when closing the form (close button, Cancel, Escape, clicking outside) and when leaving the page
- Tasks saved in localStorage with a versioned schema and a migration from the old format, with a notification when a migration runs
- Toast messages for "Task created" and "Task updated"

## Project structure

```
src/
  app/
    layout.tsx         root layout
    page.tsx           renders the Board
    globals.css        design tokens (colors, spacing, radius, font sizes) and base styles
  components/
    ui/                reusable component library
      Button.tsx       variants: primary, secondary, destructive; sizes: sm, md, lg
      Field.tsx        label + error wrapper shared by the form inputs
      TextInput.tsx
      TextArea.tsx
      Select.tsx
      Tag.tsx          tones: neutral, red, amber, green
      Card.tsx
      Modal.tsx
      Toast.tsx
      ui.module.css
    board/             app-specific components
      Board.tsx        container: form state, modal, toast
      Column.tsx
      TaskCard.tsx
      TaskForm.tsx     presentational form, gets values and callbacks as props
      board.module.css
  hooks/
    useTasks.ts        task list state + localStorage load, save and migration
  types/
    task.ts            Task, Status, Priority, TaskFormData, StoredBoard
```

### Component hierarchy

```
Board
  Button ("Add task")
  Column x3
    TaskCard
      Card, Tag, Select, Button
  Modal
    TaskForm
      TextInput, TextArea, Select, Button
  Toast
```

## Key decisions

- **Next.js (App Router) as a single page app.** It is the setup I use at work, so I could focus on the features. Everything runs in the browser; there is no backend or API route.
- **State: React state + one custom hook, no state library.** The data is one list of tasks used by one screen. `useTasks` owns the list and the storage logic, and `Board` owns the UI state (which form is open, form values, toast). Redux or Zustand would add setup without solving a real problem here.
- **Container and presentational split.** `Board` holds state and logic. `Column`, `TaskCard` and `TaskForm` only get data and callbacks through props, so they are easy to read and reuse.
- **Status and priority lists are defined once.** `statusList` and `priorityList` in `types/task.ts` drive both the TypeScript types (`Status`, `Priority`) and the UI (columns, dropdowns), so adding a status is a one-line change.
- **Dates stored as ISO strings.** localStorage only stores text, so dates are kept as strings from the start.
- **CSS Modules with CSS variables.** No UI kit. Colors, spacing and radius live in `globals.css` so every component uses the same values.

## Storage versioning and migration

Tasks are saved under the key `taskBoard`.

- **Version 1** (the first version of the app) saved a plain array of tasks: `[task, task]`.
- **Version 2** saves an object with a version number: `{ schemaVersion: 2, tasks: [task, task] }`.

On load, `useTasks` checks the saved data:

- nothing saved: start with an empty board
- a plain array: version 1 data, so it is loaded, saved back in the version 2 shape, and a toast says "Your saved tasks were updated to the new format"
- an object: version 2 data, used as it is

The version number means a future shape change can be detected and upgraded the same way.

To try the migration, paste this in the browser console and refresh:

```js
localStorage.setItem("taskBoard", JSON.stringify([{ id: "1", title: "Old task", description: "", status: "Backlog", priority: "Low", assignee: "", tags: [], createdAt: "2026-10-01T10:00:00.000Z", updatedAt: "2026-10-01T10:00:00.000Z" }]))
```

## Accessibility

- Every input has a `<label>`; the status dropdown on each card has a visually hidden label ("Status of <task title>")
- Validation errors are linked to the input with `aria-describedby`, set `aria-invalid`, and are announced with `role="alert"`
- Modal: `role="dialog"`, `aria-modal`, labelled by its title, focuses the first field when it opens, keeps Tab focus inside, closes on Escape, and returns focus to the button that opened it
- Toasts use `role="status"` so screen readers announce them
- Columns are `<section>`s with headings, and cards are list items
- Visible focus outline on all interactive elements

## Example refactor

The empty form values (`{ title: "", description: "", ... }`) were first written twice: once as the initial state and once in the reset function. I moved them into one `emptyForm` constant so adding a field means changing one place.

Later, the whole board was one `page.tsx` file with all state, storage and markup together. It was split into the `useTasks` hook (data and storage), the `ui` components (generic building blocks) and the `board` components (app-specific), with TypeScript types for each.

## Known limitations

- **Filters and sorting are not built** (status, priority, text search, sort by date or priority, and keeping them in the URL).
- **No "updated 3 hours ago"** on the cards yet.
- **No tests.** Jest and React Testing Library are not set up yet.
- **Storage errors are not handled.** If the saved data is broken or localStorage is blocked, the page does not show a friendly error yet.
- **No delete** for tasks.
- **No performance pass** with React DevTools yet.
- Only the title is validated. Selects always hold a valid value and the other fields are optional.

## AI assistance

I used Claude (an AI assistant) during this assignment.

**What I built myself:** the board columns, moving tasks with the status dropdown, the create and edit form, title validation, the unsaved changes warning on close, saving to localStorage, and the versioned schema with the migration. Claude reviewed my code after each step and pointed out problems (for example tags being split wrongly while typing, using the array index as a React key, and using the function form of `setState`). I made those fixes myself. These are the commits up to "Version the saved data and migrate old saves".

**What Claude did, because I ran short on time:** the last three commits.

- "Add Task types and move storage into a useTasks hook"
- "Add UI component library with shared design tokens"
- "Split the board into components and enable strict TypeScript"

That covers splitting my single page into the `ui` and `board` components and the `useTasks` hook, adding the TypeScript types and turning on strict mode, the visual design, the accessibility work (labels, modal focus handling, keyboard support, ARIA attributes), the "leave page" warning, the toasts for create and update, and this README. The logic inside is the logic I wrote earlier, moved into the new files.
