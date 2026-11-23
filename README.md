# Taskflow

A MERN task manager built for the Hammoq Infosystems technical assessment. It lets a shared workspace create, search, filter, update, and complete tasks, and it shows dashboard numbers from the tasks stored in MongoDB.

## Assessment objective

Build a working task manager and explain the engineering choices behind it:

1. Working application and source code.
2. A short on-camera explanation of the three most important technical decisions.
3. Three features that were deliberately left out, with reasons.
4. One real limitation, and how one extra day would be spent on it.

The speaking script and cheat sheet are in [docs/ASSESSMENT_SUBMISSION.md](docs/ASSESSMENT_SUBMISSION.md).

## Features

- Create a task with title, description, priority, status, and an optional due date.
- Client and server validation, with field messages and a disabled submit button while a request is in flight.
- List, view, edit, delete, change status, and mark a task complete.
- Search title and description, filter by status, priority, and overdue, and sort by created date, due date, or priority.
- Server-side pagination. Filters are combined and can be reset.
- Summary cards, status and priority charts, a monthly creation trend, and recent tasks. Empty data is shown as an empty state, not as fake numbers.
- Loading skeletons, empty states, error states with retry, and a confirmation dialog before delete.
- Responsive layout: table on desktop, cards on smaller screens.

Authentication is not included. The assessment does not ask for accounts, and the screen is a single shared workspace.

## Technology stack

| Area | Choices |
| --- | --- |
| Frontend | React 19, Vite, JavaScript, Tailwind CSS 4, React Router, Axios, React Hook Form, Zod, Recharts, Lucide, React Hot Toast |
| Backend | Node.js, Express 5, MongoDB, Mongoose, Zod, Helmet, CORS, express-rate-limit, dotenv |
| Tests | Jest and Supertest on the API. Vitest and React Testing Library on the dashboard. API tests use `mongodb-memory-server`, so they never touch a real Atlas database. |

## Architecture

The API is split by feature. Routes validate input, controllers shape HTTP responses, and the task service owns queries and business rules. Errors go through one middleware.

The React app keeps API calls in `taskService`, screen state in `TaskContext`, and filters in the URL. After a create, update, status change, or delete, the list and the dashboard statistics are loaded again together so the cards do not stay stale.

```text
Browser
  Dashboard + TaskContext
    taskService (Axios)
      /api/v1/tasks
        routes -> validate -> controller -> service -> Task model
```

## Folder structure

```text
task-manager/
├── backend/
│   ├── src/
│   │   ├── config/database.js
│   │   ├── middleware/
│   │   ├── modules/task/
│   │   ├── utils/
│   │   ├── app.js
│   │   ├── server.js
│   │   └── seed.js
│   └── tests/tasks.test.js
├── frontend/
│   └── src/
│       ├── app/
│       ├── components/
│       ├── features/tasks/
│       ├── pages/
│       ├── services/api.js
│       └── hooks/
└── docs/ASSESSMENT_SUBMISSION.md
```

## Database schema

One `tasks` collection. Mongoose adds `createdAt` and `updatedAt`.

| Field | Rules |
| --- | --- |
| title | Required string, trimmed, 1–120 characters |
| description | Optional string, up to 2000 characters |
| priority | `low`, `medium`, or `high` |
| priorityOrder | `1`, `2`, or `3`. Kept in sync with priority so sorting is low → medium → high. Hidden from API responses. |
| status | `pending`, `in_progress`, or `completed` |
| dueDate | Date or null. A `YYYY-MM-DD` value is stored at the end of that UTC day. |

Indexes, chosen for the filters the API actually runs:

- `{ status: 1, createdAt: -1 }` for the default list and status filter
- `{ priority: 1, createdAt: -1 }` for the priority filter
- `{ dueDate: 1, status: 1 }` for the overdue filter
- `{ createdAt: -1 }` for the default sort and recent tasks

Search uses an escaped, case-insensitive regular expression on title and description. That supports partial words such as "meet" inside "meeting". A text index was skipped because it is whole-word and fights custom sorts. There is no separate user collection.

## API

Base URL: `/api/v1`

Success:

```json
{
  "success": true,
  "message": "Tasks retrieved successfully",
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 24,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

Validation errors return `400` with `errors: [{ field, message }]`. Unknown ids return `400`. Missing tasks return `404`.

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/health` | Process check |
| POST | `/tasks` | Create a task |
| GET | `/tasks` | List tasks |
| GET | `/tasks/stats` | Dashboard aggregates |
| GET | `/tasks/:id` | One task |
| PUT | `/tasks/:id` | Update a task |
| PATCH | `/tasks/:id/status` | Change status |
| DELETE | `/tasks/:id` | Delete a task |

List query parameters:

`search`, `status`, `priority`, `overdue=true|false`, `page`, `limit` (max 50), `sortBy`, `sortOrder=asc|desc`.

`sortBy` may only be `createdAt`, `updatedAt`, `dueDate`, `priority`, or `title`. Anything else is rejected before it reaches MongoDB.

Example:

```http
GET /api/v1/tasks?search=meeting&status=pending&priority=high&page=1&limit=10&sortBy=dueDate&sortOrder=asc
```

`GET /tasks/stats` returns summary counts, status distribution, priority distribution, monthly creation counts, and the five most recent tasks. Counts come from one aggregation with `$facet`.

## Prerequisites

- Node.js 20 or newer
- npm
- MongoDB running locally, or a MongoDB Atlas URI you keep only in `backend/.env`

## Installation

```bash
npm install --prefix backend
npm install --prefix frontend
```

## Environment setup

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Backend:

```text
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/task-manager
FRONTEND_URL=http://localhost:5173
```

Frontend:

```text
VITE_API_URL=http://localhost:5000/api/v1
```

`backend/.env` is gitignored. The MongoDB URI is never sent to the browser. The committed frontend example only contains the public API URL.

A local `backend/.env` is already present for `mongodb://127.0.0.1:27017/task-manager`. Replace `MONGODB_URI` if you use Atlas. Do not commit that file.

## MongoDB configuration

Start a local server, then optionally load sample tasks:

```bash
# macOS Homebrew example
brew services start mongodb-community

npm run seed
```

The seed script inserts five tasks only when the collection is empty, including one overdue task and tasks created in earlier months so the charts have something to draw.

## Backend execution

```bash
npm run dev:api
```

The API listens on port 5000. If MongoDB is down, the process logs the connection error and exits instead of serving a half-started app.

## Frontend execution

```bash
npm run dev:web
```

Open `http://localhost:5173`.

## Testing

```bash
npm test
```

Or separately:

```bash
npm test --prefix backend
npm test --prefix frontend
```

Backend tests cover create, required title, invalid priority and status, list, pagination, combined search and filters, sort whitelist, priority order, get, update, status change, delete, invalid ids, missing tasks, and dashboard statistics including the empty database. They boot MongoDB 7.0.14 through `mongodb-memory-server`. The library's default 8.x binary exits on macOS 12, so the test file pins 7.0.14. That database is thrown away after the run.

Frontend tests cover dashboard render, task list, loading, error and retry, create validation, create, edit, delete confirmation, search with status, and the empty list.

## Production build

```bash
npm run build
```

Vite writes the static app to `frontend/dist`. Preview it with:

```bash
npm run preview --prefix frontend
```

The API is started with `npm run start:api` and `NODE_ENV=production`. In production the error handler returns a generic message and does not send the stack.

## Security considerations

- Helmet sets secure response headers. `x-powered-by` is disabled.
- CORS allows only `FRONTEND_URL`.
- A rate limit of 300 requests per 15 minutes applies outside tests.
- JSON bodies are capped at 100kb.
- Zod schemas are strict, so unknown fields are rejected.
- Enum values and sort fields are whitelisted.
- Search text is escaped before it becomes a regular expression, so user input is not passed into MongoDB operators.
- Object ids are checked before queries, so a bad id becomes a 400 instead of an unhandled cast error.
- Secrets stay in environment variables. Stack traces are logged on the server and hidden in production.

## Important technical decisions

1. **Feature module plus a service layer.** Routes, validation, controllers, and the task service are separate. Controllers only translate HTTP. Query rules live in one place, which keeps the API consistent and the tests pointed at behavior rather than Express wiring.

2. **Server-side filtering, a sort whitelist, and a priority rank.** The list endpoint accepts the filters in the query string, paginates in MongoDB, and only sorts by known fields. Priority is stored as `priorityOrder` because alphabetical order would sort high, low, medium. Indexes match the status, priority, due date, and created-date queries.

3. **URL-backed task state and one API client.** Filters live in the query string through React Router, so refresh and the back button keep the current view. Axios is configured once. After every mutation the context reloads both the page of tasks and the statistics, so the charts follow the database.

## Known limitations

Updates are last-write-wins. The schema does not keep a version, and `PUT /tasks/:id` does not check `updatedAt`. Two people editing the same task can overwrite each other with no warning. That is acceptable for a single shared assessment workspace, and it is the first thing I would fix with another day.

Search is a case-insensitive regular expression. It is the right match behavior for short task titles, and it will get slower on a very large collection because it cannot use a normal index for a contains search.

## Future improvements

- Optimistic concurrency: send `updatedAt` with the edit and return 409 when the stored task changed.
- Sign-in and a `userId` on each task, then scope every query to that user.
- Live updates with a websocket only after more than one person is using the board.
- Recurring tasks and email reminders, with a worker rather than logic inside the request cycle.
- A text index or Atlas Search if the task collection grows past what a regex can handle.
- A browser end-to-end pass on top of the current API and component tests.

## Submission notes

Record the video from [docs/ASSESSMENT_SUBMISSION.md](docs/ASSESSMENT_SUBMISSION.md). It matches this codebase: shared workspace, no login, server-side filters, and last-write-wins updates.
