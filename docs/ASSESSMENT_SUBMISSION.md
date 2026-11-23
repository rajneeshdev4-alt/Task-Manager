# Assessment submission notes

These notes match the code in this repository. Use them for the written answers and the on-camera video.

## Three technical decisions

### 1. Feature module and a service layer

**Decision.** The API is split into `task.routes`, `task.validation`, `task.controller`, and `task.service`. Controllers call `sendSuccess`. Failures go through `error.middleware`.

**Problem.** Mixing queries, status codes, and validation in one file makes the list endpoint hard to change without breaking create and stats.

**Why this approach.** Each request has the same path: validate, run one service function, return one JSON shape. The service is where filters, pagination, and the stats aggregation live.

**Alternatives.** A single `routes.js`, or a heavier framework with repositories and dependency injection. Both were more machinery than this API needs.

**Benefit.** A new field is added in the schema, the Zod schema, and the service. HTTP status codes stay consistent, and the Jest tests hit the real routes.

### 2. Server-side queries, a sort whitelist, and a priority rank

**Decision.** `GET /api/v1/tasks` filters, sorts, and paginates in MongoDB. `sortBy` must be one of `createdAt`, `updatedAt`, `dueDate`, `priority`, or `title`. Priority is saved again as `priorityOrder` (`low=1`, `medium=2`, `high=3`). Search is an escaped regular expression on title and description. Indexes cover status plus created date, priority plus created date, due date plus status, and created date.

**Problem.** Loading every task into the browser and sorting there does not scale, and letting the client name a sort field would let a request pass an operator into MongoDB. Alphabetical priority order is wrong.

**Why this approach.** The example URL in the assessment is a server query. Whitelisting is a small map, not a query builder. A numeric rank sorts correctly with a normal `find().sort()`.

**Alternatives.** A MongoDB text index, which matches whole words and wants its own sort. Sorting priority in JavaScript after the query, which breaks once pagination is real. An aggregation for every list request, which is harder to read for the same result.

**Benefit.** Search, status, priority, and overdue work together. A bad `sortBy` returns 400. The page size is capped at 50. Stats use one `$facet` aggregation instead of five round trips.

### 3. Filters in the URL, with one Axios client and a task context

**Decision.** The dashboard keeps search, status, priority, overdue, sort, and page in the query string. `TaskContext` loads the list and the stats. `services/api.js` sets the base URL from `VITE_API_URL` and turns API errors into a message the screen can show. Creating, editing, deleting, or changing status loads both the list and the stats again.

**Problem.** Filter state that lives only in React is lost on refresh, and it is easy to update the table while the overdue card still shows the old count.

**Why this approach.** The URL is already the right place for a list view. Context avoids passing the same handlers through every card. A second request after a write is simple and correct for this size of app.

**Alternatives.** Redux, which adds a store for one resource. Optimistic updates, which feel faster but are easier to get wrong when the server rejects a write. Mock data in the dashboard, which would hide integration bugs.

**Benefit.** Reset filters clears the query string and the default list comes back. The charts follow the database. The form uses React Hook Form and Zod, and the submit button stays disabled until the request finishes, so a double click does not create two tasks.

## Three features deliberately not implemented

### 1. Accounts and per-user tasks

There is no login and no JWT. The header says "Shared workspace" on purpose. The assessment never asks for users, and a login screen would not make the task API better. Adding it later means a user collection, a `userId` on each task, and a filter on every query.

### 2. Live updates across browsers

There are no websockets. After my own action, the app reloads the list and the stats. Pushing every change to other open tabs needs a connection per client, reconnect handling, and a rule for whose edit wins. That cost is not justified for one person reviewing the app. A later version can publish task events from the service after the write succeeds.

### 3. Recurring tasks and reminders

A task has one due date. It does not repeat, and the app does not send email or push notifications. Recurrence needs a schedule, a next-run date, and a worker that is still running when nobody has the site open. I would add that as a separate job, not inside the request that creates a task.

## One limitation

**Last-write-wins updates.** `versionKey` is off, and `PUT /tasks/:id` replaces the fields it receives without checking `updatedAt`. If two people save the same task, the second save overwrites the first with no warning.

**Impact.** A title or status change can disappear. The dashboard will show the second save, so it still matches the database, but the first person's work is gone.

**Why it is still here.** The brief is a single shared board, and the time went into validation, filters, pagination, and the dashboard. A version field that nothing checks would only look like a fix.

**One more day.** I would return `updatedAt` with the task, send it back on save, and compare it in `updateTask`. If the stored value differs, the API returns 409. The edit modal would tell the user the task changed and offer to reload it. The same check belongs on the status route. I would add two API tests: a stale save is rejected, and a current save still works.

## Video script

About two and a half minutes. Speak in the first person. You do not need to read the headings out loud.

---

Hi, I'm walking through the task manager I built for this assessment.

The first decision was how I split the API. Each task request goes through a route, a Zod schema, a small controller, and a service. The controller only sends the response. The service is where the query, the pagination, and the dashboard counts live. I did it this way so the JSON shape stays the same on every endpoint, and so I can change a filter without touching the HTTP layer. I considered putting it all in one routes file. That is fine for a demo, and it gets messy as soon as validation and errors are involved.

The second decision is that filtering and sorting happen in MongoDB, not in the browser. The list endpoint takes search, status, priority, overdue, page, and sort. Sort fields are whitelisted, so a request cannot pass a Mongo operator in as a field name. Priority was the awkward one. If I sorted the word high, low, medium alphabetically, the order would be wrong. So I store a number next to the priority, one, two, and three, and I sort on that. Search is a case-insensitive match on the title and the description, with the user input escaped. The dashboard counts come from one aggregation, so the cards, the charts, and the recent list are real records. If the collection is empty, the charts say there is no data yet.

The third decision is on the React side. Filters sit in the URL. If I refresh the page, or hit back, I am still on the same search. One context loads the tasks and the statistics. Axios is set up once, and the base URL comes from the environment. When I create, edit, delete, or mark a task complete, I load the list and the stats again. That keeps the overdue card in step with the table. I also keep the save button disabled while the request is running, so a double click does not create two tasks.

I left three things out on purpose.

I did not add login. The screen is one shared workspace. Accounts would mean a user on every task, and the brief never asked for that.

I did not add live updates. The page refreshes its own data after I change something. Websockets only start to matter when several people have the board open, and they bring reconnect and conflict problems with them.

I did not add recurring tasks or email reminders. A due date is enough for this version. Repeating work needs a background job that runs even when the site is closed.

The limitation I would fix with one more day is concurrent edits. Right now the last save wins. If two people edit the same task, the second save overwrites the first, and the app does not warn anyone. I would send the updated time back with the form, compare it on the server, and return a conflict if the task changed. The modal would then ask the user to reload before saving again.

That is the shape of the app: a small API with the rules in one service, queries that stay on the server, and a dashboard that reads the same database the forms write to.

---

## Camera cheat sheet

- API split: route, Zod, controller, service. One JSON shape.
- Filters run in MongoDB. Sort fields are whitelisted.
- Priority is stored as 1, 2, 3 so the order is low, medium, high.
- Search matches title and description. Input is escaped.
- Stats are one aggregation. Empty data stays empty.
- Filters live in the URL. Refresh keeps them.
- After every save, reload the list and the stats.
- Save button disables while the request runs.
- Left out: login, live updates, recurring tasks and reminders.
- Limitation: last save wins. Next day, compare `updatedAt` and return 409.
