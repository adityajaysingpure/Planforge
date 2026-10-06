# 🗂️ PlanForge — Project & Sprint Management Tool

PlanForge is a full-stack project and sprint management application built with **ReactJS, FastAPI, Python, and MongoDB**.

It helps teams create projects, manage sprints, organize tasks on a Kanban board, and track project progress from a single dashboard.

The project focuses on practical React patterns, API integration, MongoDB query optimization, and a responsive project management workflow.

---

## ✨ Features

* Create and manage projects
* 4-step project creation wizard
* Sprint creation and management
* Sprint-based Kanban board
* Task creation, editing, and deletion
* Quick task status updates
* Project progress tracking
* Project and task statistics
* Backlog management
* Tags with keyboard-based input
* Optimistic UI updates
* MongoDB indexing for frequently used task queries
* REST APIs built with FastAPI

---

## 🛠️ Tech Stack

### Frontend

* ReactJS 18
* React Router
* Recharts
* Axios
* React Hooks

### Backend

* Python
* FastAPI
* Uvicorn
* Pydantic v2

### Database

* MongoDB
* Motor
* Compound indexes

---

## 🧩 Project Creation Wizard

Creating a project is divided into four steps:

1. **Basic Information** — Project name, description, dates
2. **Technology Stack** — Tags and project technologies
3. **Team** — Team members and project settings
4. **Review** — Review the information before creating the project

Each step handles its own validation using React's `forwardRef` and `useImperativeHandle`.

The parent `ProjectWizard` can trigger validation on the current step without having to manage all of the individual form fields itself.

```jsx
useImperativeHandle(ref, () => ({
  validate() {
    const errors = {};

    if (!data.name?.trim()) {
      errors.name = "Project name is required.";
    }

    return errors;
  }
}), [data.name]);
```

The parent wizard can then call:

```jsx
const errors = stepRefs[currentStep].current.validate();
```

If validation fails, the wizard keeps the user on the current step and displays the relevant errors.

---

## 📋 Sprint & Kanban Management

Projects can contain multiple sprints, and tasks can be assigned to a particular sprint or kept in the backlog.

The task board is divided into four statuses:

```text
Todo → In Progress → In Review → Done
```

Users can switch between sprints from the project navigation and manage tasks directly from the Kanban board.

There is also a backlog view for tasks that aren't currently assigned to an active sprint.

---

## ⚡ Optimistic UI

Task status changes are handled optimistically.

When a user changes a task's status, the UI updates immediately instead of waiting for the API response. The API request runs in the background, and the task list is reloaded if the request fails.

This makes actions such as moving a task through the Kanban workflow feel much faster.

The same approach is used for selected project operations where an immediate UI update makes sense.

---

## 🏷️ Tag Input

The project wizard includes a simple keyboard-friendly tag input.

Supported interactions:

* `Enter` → Add tag
* `Comma` → Add tag
* `Backspace` on an empty input → Remove the last tag

This keeps adding technologies or project labels quick without requiring repeated mouse interactions.

---

## 🗄️ MongoDB Indexing

Tasks are frequently queried by project, sprint, and status.

To support this query pattern, PlanForge creates a compound index:

```text
(project_id, sprint_id, status)
```

This index is used for the task queries powering the sprint board and status-based filtering.

The index is created during the FastAPI application's startup lifecycle.

---

## 🏗️ Project Structure

```text
planforge/
│
├── backend/
│   ├── main.py
│   ├── core/
│   │   ├── config.py
│   │   └── database.py
│   │
│   ├── models/
│   │   └── project.py
│   │
│   └── routers/
│       ├── projects.py
│       ├── sprints.py
│       └── tasks.py
│
└── frontend/
    └── src/
        ├── services/
        │   └── api.js
        │
        ├── hooks/
        │   ├── useProjects.js
        │   ├── useTasks.js
        │   └── useFormStep.js
        │
        ├── components/
        │   ├── forms/
        │   │   ├── StepBasics.jsx
        │   │   ├── StepStack.jsx
        │   │   ├── StepTeam.jsx
        │   │   ├── StepReview.jsx
        │   │   ├── ProjectWizard.jsx
        │   │   └── TaskForm.jsx
        │   │
        │   ├── board/
        │   │   └── SprintBoard.jsx
        │   │
        │   └── ui/
        │       └── ProjectCard.jsx
        │
        └── pages/
            ├── Dashboard.jsx
            └── ProjectDetail.jsx
```

---

## 🔌 API

### Projects

| Method | Endpoint                   | Description                     |
| ------ | -------------------------- | ------------------------------- |
| GET    | `/api/projects/`           | Get all projects                |
| POST   | `/api/projects/`           | Create a project                |
| PATCH  | `/api/projects/{id}`       | Update a project                |
| DELETE | `/api/projects/{id}`       | Delete project and related data |
| GET    | `/api/projects/{id}/stats` | Get project task statistics     |

### Sprints

| Method | Endpoint                    | Description                 |
| ------ | --------------------------- | --------------------------- |
| GET    | `/api/sprints/project/{id}` | Get project sprints         |
| POST   | `/api/sprints/`             | Create a sprint             |
| PATCH  | `/api/sprints/{id}`         | Update or activate a sprint |
| DELETE | `/api/sprints/{id}`         | Delete a sprint             |

### Tasks

| Method | Endpoint                  | Description        |
| ------ | ------------------------- | ------------------ |
| GET    | `/api/tasks/project/{id}` | Get project tasks  |
| POST   | `/api/tasks/`             | Create a task      |
| PATCH  | `/api/tasks/{id}`         | Update a task      |
| PATCH  | `/api/tasks/{id}/status`  | Update task status |
| DELETE | `/api/tasks/{id}`         | Delete a task      |

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd planforge
```

### 2. Start the backend

```bash
cd backend

python -m venv .venv
```

Windows:

```bash
.venv\Scripts\activate
```

macOS/Linux:

```bash
source .venv/bin/activate
```

Install the dependencies:

```bash
pip install -r requirements.txt
```

Create your environment file:

```bash
cp .env.example .env
```

Start FastAPI:

```bash
uvicorn main:app --reload
```

Backend:

```text
http://localhost:8000
```

Swagger documentation:

```text
http://localhost:8000/docs
```

### 3. Start the frontend

Open another terminal:

```bash
cd frontend
npm install
npm start
```

Frontend:

```text
http://localhost:3000
```

---

## 🔄 Application Flow

```text
Create Project
      ↓
Project Wizard
      ↓
Create Project
      ↓
Create / Select Sprint
      ↓
Add Tasks
      ↓
Kanban Board
      ↓
Update Task Status
      ↓
Track Project Progress
```

---

## 💡 What I Focused On

The main goal of PlanForge was to build something closer to a real application rather than a basic CRUD demo.

Some of the areas I focused on were:

* Keeping form state isolated between wizard steps
* Reusable React hooks for projects and tasks
* Optimistic updates for better UI responsiveness
* Separating frontend API calls from components
* Designing REST endpoints around projects, sprints, and tasks
* Using MongoDB indexes around actual query patterns
* Handling sprint and backlog workflows
* Keeping the application structure scalable as features are added

---

## 📌 Resume Description

**PlanForge — Project & Sprint Management Tool**
*ReactJS · FastAPI · Python · MongoDB*

* Built a full-stack project management application with a 4-step React project wizard, sprint management, Kanban task board, and project progress tracking.
* Implemented `forwardRef` and `useImperativeHandle` to expose step-level validation from child components to the parent wizard while keeping form state localized.
* Added optimistic task status updates and a MongoDB compound index on `(project_id, sprint_id, status)` to support frequently used sprint board queries.

---

## 🎯 Future Improvements

* User authentication and role-based access
* Team member accounts
* Task priorities and due dates
* Drag-and-drop Kanban
* Sprint burndown charts
* Activity history
* Notifications
* Deployment with CI/CD

---

## 📖 Project Goal

PlanForge was built to practice and demonstrate how a React frontend, FastAPI backend, and MongoDB database can work together in a structured full-stack application.

The project also focuses on React patterns such as imperative handles, custom hooks, optimistic updates, and component-level state management.

---

## GitHub Repository Description

```text
🗂️ Full-stack project & sprint management tool built with ReactJS, FastAPI, Python, and MongoDB. Includes a 4-step project wizard, sprint management, Kanban board, optimistic UI, and progress tracking.
```

## GitHub Topics

```text
reactjs fastapi python mongodb project-management
sprint-management kanban rest-api pydantic
motor react-hooks forwardref useimperativehandle
optimistic-ui
```
