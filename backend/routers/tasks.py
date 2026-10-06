from fastapi import APIRouter, HTTPException, Query
from core.database import get_db
from models.project import TaskCreate, TaskUpdate
from bson import ObjectId
from datetime import datetime
from typing import Optional

router = APIRouter()


def _s(doc):
    doc["_id"] = str(doc["_id"])
    return doc


@router.get("/project/{project_id}")
async def list_tasks(
    project_id: str,
    sprint_id: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
):
    db = get_db()
    query: dict = {"project_id": project_id}

    if sprint_id == "backlog":
        query["sprint_id"] = None
    elif sprint_id:
        query["sprint_id"] = sprint_id

    if status:
        query["status"] = status
    if priority:
        query["priority"] = priority

    tasks = await db.tasks.find(query).sort(
        [("priority", -1), ("created_at", -1)]
    ).to_list(500)
    return [_s(t) for t in tasks]


@router.post("/", status_code=201)
async def create_task(payload: TaskCreate):
    db = get_db()
    doc = payload.model_dump()
    doc["created_at"] = datetime.utcnow()
    doc["updated_at"] = datetime.utcnow()
    result = await db.tasks.insert_one(doc)
    doc["_id"] = str(result.inserted_id)
    return doc


@router.get("/{task_id}")
async def get_task(task_id: str):
    db = get_db()
    task = await db.tasks.find_one({"_id": ObjectId(task_id)})
    if not task:
        raise HTTPException(status_code=404, detail="Task not found.")
    return _s(task)


@router.patch("/{task_id}")
async def update_task(task_id: str, payload: TaskUpdate):
    db = get_db()
    update_data = {k: v for k, v in payload.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.utcnow()
    result = await db.tasks.update_one(
        {"_id": ObjectId(task_id)}, {"$set": update_data}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Task not found.")
    return {"message": "Updated."}


@router.patch("/{task_id}/status")
async def cycle_task_status(task_id: str, status: str):
    """
    Dedicated status-update endpoint — called on board column click.
    Keeps the main PATCH clean.
    """
    valid = ["todo", "in_progress", "in_review", "done"]
    if status not in valid:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid}")
    db = get_db()
    await db.tasks.update_one(
        {"_id": ObjectId(task_id)},
        {"$set": {"status": status, "updated_at": datetime.utcnow()}}
    )
    return {"message": "Status updated.", "status": status}


@router.delete("/{task_id}")
async def delete_task(task_id: str):
    db = get_db()
    result = await db.tasks.delete_one({"_id": ObjectId(task_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Task not found.")
    return {"message": "Deleted."}
