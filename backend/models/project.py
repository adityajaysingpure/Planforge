from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class ProjectStatus(str, Enum):
    active    = "active"
    on_hold   = "on_hold"
    completed = "completed"
    archived  = "archived"


class TaskStatus(str, Enum):
    todo        = "todo"
    in_progress = "in_progress"
    in_review   = "in_review"
    done        = "done"


class Priority(str, Enum):
    low    = "low"
    medium = "medium"
    high   = "high"
    urgent = "urgent"


# ── Project ──────────────────────────────────────────────────

class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None
    tech_stack: List[str] = []
    team_members: List[str] = []
    color: str = "#4f46e5"          # hex accent color chosen in step 3
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    status: ProjectStatus = ProjectStatus.active


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[ProjectStatus] = None
    color: Optional[str] = None
    tech_stack: Optional[List[str]] = None
    team_members: Optional[List[str]] = None


# ── Sprint ────────────────────────────────────────────────────

class SprintCreate(BaseModel):
    project_id: str
    name: str
    goal: Optional[str] = None
    start_date: datetime
    end_date: datetime


class SprintUpdate(BaseModel):
    name: Optional[str] = None
    goal: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    is_active: Optional[bool] = None


# ── Task ─────────────────────────────────────────────────────

class TaskCreate(BaseModel):
    project_id: str
    sprint_id: Optional[str] = None
    title: str
    description: Optional[str] = None
    status: TaskStatus = TaskStatus.todo
    priority: Priority = Priority.medium
    assignee: Optional[str] = None
    story_points: Optional[int] = None
    tags: List[str] = []
    due_date: Optional[datetime] = None


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[TaskStatus] = None
    priority: Optional[Priority] = None
    assignee: Optional[str] = None
    story_points: Optional[int] = None
    tags: Optional[List[str]] = None
    due_date: Optional[datetime] = None
    sprint_id: Optional[str] = None
