# 🗂️ PlanForge — Project & Sprint Management Tool

A full-stack project management application built with **ReactJS (60%)**, **FastAPI + Python (30%)**, and **MongoDB (10%)**.  
No AI. No fluff. Just clean sprint planning with a multi-step project wizard and a kanban board.

---

## Why It's Different

Most todo/kanban demos are single-file React with useState. PlanForge is structured like a real product:

- **Multi-step form wizard** using `forwardRef` + `useImperativeHandle` — each step validates itself when the parent calls `ref.current.validate()`. The parent never manages individual field state.
- **Optimistic UI throughout** — task status cycles instantly on click, project deletions reflect immediately, no spinners on every action.
- **Tag input with keyboard navigation** — press Enter or comma to add, Backspace on empty input removes the last tag.
- **Sprint-aware task board** — switch sprints from the sub-nav, toggle between board and backlog view.
- **MongoDB compound index** — `(project_id, sprint_id, status)` on tasks for the most common query.

---

## Tech Stack

| Layer    | Technology                                        | Weight |
|----------|---------------------------------------------------|--------|
| Frontend | ReactJS 18, React Router, Recharts               | 60%    |
| Backend  | Python, FastAPI, Uvicorn, Pydantic v2             | 30%    |
| Database | MongoDB (Motor async, compound index)             | 10%    |

---

## Key Frontend Patterns

### `forwardRef` + `useImperativeHandle` (multi-step form)
Each wizard step (StepBasics, StepStack, StepTeam, StepReview) is a `forwardRef` component that exposes a `validate()` method. The parent wizard calls `stepRefs[currentStep].current.validate()` on Next click — if it returns errors, navigation is blocked and errors are passed down as props.

```jsx
// In StepBasics.jsx
useImperativeHandle(ref, () => ({
  validate() {
    const errs = {};
    if (!data.name?.trim()) errs.name = "Project name is required.";
    return errs;
  },
}), [data.name]);

// In ProjectWizard.jsx (parent)
const ok = await stepRefs[step].current.validate();
if (Object.keys(ok).length > 0) { /* block navigation */ }
```

### Optimistic status cycling
Task status cycles through `todo → in_progress → in_review → done` on click, updating local state instantly and syncing to the API in the background.

```jsx
const cycleStatus = async (taskId) => {
  setTasks((prev) => prev.map((t) => {
    if (t._id !== taskId) return t;
    const next = STATUS_ORDER[(STATUS_ORDER.indexOf(t.status) + 1) % 4];
    return { ...t, status: next };
  }));
  await cycleTaskStatus(taskId, next).catch(() => load()); // revert on error
};
```

---

## Project Structure

```
planforge/
├── backend/
│   ├── main.py                   # FastAPI app + lifespan (index creation)
│   ├── core/
│   │   ├── config.py             # Pydantic settings
│   │   └── database.py           # Motor + compound index
│   ├── models/project.py         # Project, Sprint, Task schemas
│   └── routers/
│       ├── projects.py           # CRUD + stats aggregation
│       ├── sprints.py            # Sprint CRUD + active-sprint logic
│       └── tasks.py              # Task CRUD + /status patch endpoint
└── frontend/
    └── src/
        ├── services/api.js       # Axios layer
        ├── hooks/
        │   ├── useProjects.js    # Optimistic project CRUD
        │   ├── useTasks.js       # Optimistic tasks + status cycling
        │   └── useFormStep.js    # Multi-step form orchestration
        ├── components/
        │   ├── forms/
        │   │   ├── StepBasics.jsx    # forwardRef — name/description/dates
        │   │   ├── StepStack.jsx     # forwardRef — tag input + quick-add
        │   │   ├── StepTeam.jsx      # forwardRef — members + color picker
        │   │   ├── StepReview.jsx    # forwardRef — confirm + edit shortcuts
        │   │   ├── ProjectWizard.jsx # Orchestrates 4 steps
        │   │   └── TaskForm.jsx      # forwardRef — full task form
        │   ├── board/
        │   │   └── SprintBoard.jsx   # 4-column kanban board
        │   └── ui/
        │       └── ProjectCard.jsx   # Card with SVG progress ring
        └── pages/
            ├── Dashboard.jsx         # Projects grid + filter
            └── ProjectDetail.jsx     # Sprint board + sprint management
```

---

## Getting Started

### Backend
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate       # Windows
source .venv/bin/activate    # Mac/Linux
pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --reload
```
API: `http://localhost:8000` · Swagger: `http://localhost:8000/docs`

### Frontend
```bash
cd frontend
npm install
npm start
```
App: `http://localhost:3000`

---

## API Endpoints

| Method | Endpoint                        | Description                        |
|--------|---------------------------------|------------------------------------|
| GET    | /api/projects/                  | List all projects                  |
| POST   | /api/projects/                  | Create project                     |
| PATCH  | /api/projects/{id}              | Update project                     |
| DELETE | /api/projects/{id}              | Delete project + sprints + tasks   |
| GET    | /api/projects/{id}/stats        | Aggregated task stats              |
| GET    | /api/sprints/project/{id}       | List sprints for a project         |
| POST   | /api/sprints/                   | Create sprint                      |
| PATCH  | /api/sprints/{id}               | Update sprint / activate           |
| DELETE | /api/sprints/{id}               | Delete sprint, move tasks to backlog|
| GET    | /api/tasks/project/{id}         | List tasks (filter by sprint/status)|
| POST   | /api/tasks/                     | Create task                        |
| PATCH  | /api/tasks/{id}                 | Update task                        |
| PATCH  | /api/tasks/{id}/status          | Cycle task status                  |
| DELETE | /api/tasks/{id}                 | Delete task                        |

---

## Resume Bullet Points

> **PlanForge — Project & Sprint Management** | ReactJS, FastAPI, Python, MongoDB

- Architected a 4-step project creation wizard using `forwardRef` and `useImperativeHandle`, enabling each step to expose a `validate()` method called imperatively by the parent — keeping field state local to each step and eliminating unnecessary re-renders.
- Implemented optimistic task status cycling across a 4-column kanban board, updating local React state instantly on click and reverting to server state only on API failure.
- Designed a compound MongoDB index `(project_id, sprint_id, status)` on the tasks collection, reducing sprint board query time for projects with 500+ tasks.

---

## GitHub Description

```
🗂️ Full-stack project & sprint management tool. 
4-step wizard with forwardRef + useImperativeHandle, 
kanban board with optimistic status cycling, sprint 
switcher, and progress rings. ReactJS · FastAPI · MongoDB.
```

## GitHub Topics
```
reactjs fastapi python mongodb sprint-management kanban 
project-management useimperativehandle forwardref 
pydantic motor-asyncio
```
