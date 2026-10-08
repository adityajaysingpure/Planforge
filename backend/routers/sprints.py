from fastapi import APIRouter, HTTPException
from core.database import get_db
from models.project import SprintCreate, SprintUpdate
from bson import ObjectId
from datetime import datetime

router = APIRouter()


def _s(doc):
    doc["_id"] = str(doc["_id"])
    return doc


@router.get("/project/{project_id}")
async def list_sprints(project_id: str):
    db = get_db()
    sprints = await db.sprints.find(
        {"project_id": project_id}
    ).sort("start_date", 1).to_list(50)
    return [_s(s) for s in sprints]


@router.post("/", status_code=201)
async def create_sprint(payload: SprintCreate):
    db = get_db()
    doc = payload.model_dump()
    doc["is_active"] = False
    doc["created_at"] = datetime.utcnow()
    result = await db.sprints.insert_one(doc)
    doc["_id"] = str(result.inserted_id)
    return doc


@router.patch("/{sprint_id}")
async def update_sprint(sprint_id: str, payload: SprintUpdate):
    db = get_db()
    update_data = {k: v for k, v in payload.model_dump().items() if v is not None}

    # Only one active sprint per project at a time
    if update_data.get("is_active"):
        sprint = await db.sprints.find_one({"_id": ObjectId(sprint_id)})
        if sprint:
            await db.sprints.update_many(
                {"project_id": sprint["project_id"]},
                {"$set": {"is_active": False}}
            )

    result = await db.sprints.update_one(
        {"_id": ObjectId(sprint_id)}, {"$set": update_data}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Sprint not found.")
    return {"message": "Updated."}


@router.delete("/{sprint_id}")
async def delete_sprint(sprint_id: str):
    db = get_db()
    # Unassign tasks from this sprint rather than deleting them
    await db.tasks.update_many(
        {"sprint_id": sprint_id},
        {"$set": {"sprint_id": None}}
    )
    await db.sprints.delete_one({"_id": ObjectId(sprint_id)})
    return {"message": "Sprint deleted. Tasks moved to backlog."}
