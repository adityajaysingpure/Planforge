from fastapi import APIRouter, HTTPException
from core.database import get_db
from models.project import ProjectCreate, ProjectUpdate
from bson import ObjectId
from datetime import datetime

router = APIRouter()


def _s(doc: dict) -> dict:
    doc["_id"] = str(doc["_id"])
    return doc


@router.get("/")
async def list_projects():
    db = get_db()
    projects = await db.projects.find().sort("created_at", -1).to_list(100)
    return [_s(p) for p in projects]


@router.post("/", status_code=201)
async def create_project(payload: ProjectCreate):
    db = get_db()
    doc = payload.model_dump()
    doc["created_at"] = datetime.utcnow()
    doc["updated_at"] = datetime.utcnow()
    result = await db.projects.insert_one(doc)
    doc["_id"] = str(result.inserted_id)
    return doc


@router.get("/{project_id}")
async def get_project(project_id: str):
    db = get_db()
    project = await db.projects.find_one({"_id": ObjectId(project_id)})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found.")
    return _s(project)


@router.patch("/{project_id}")
async def update_project(project_id: str, payload: ProjectUpdate):
    db = get_db()
    update_data = {k: v for k, v in payload.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.utcnow()
    result = await db.projects.update_one(
        {"_id": ObjectId(project_id)}, {"$set": update_data}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Project not found.")
    return {"message": "Updated."}


@router.delete("/{project_id}")
async def delete_project(project_id: str):
    db = get_db()
    await db.projects.delete_one({"_id": ObjectId(project_id)})
    await db.sprints.delete_many({"project_id": project_id})
    await db.tasks.delete_many({"project_id": project_id})
    return {"message": "Project and all related data deleted."}


@router.get("/{project_id}/stats")
async def get_project_stats(project_id: str):
    """
    Aggregated task stats for a project — used for the progress ring
    on the project card and the detail page.
    """
    db = get_db()
    pipeline = [
        {"$match": {"project_id": project_id}},
        {"$group": {
            "_id": "$status",
            "count": {"$sum": 1},
            "points": {"$sum": {"$ifNull": ["$story_points", 0]}},
        }},
    ]
    results = await db.tasks.aggregate(pipeline).to_list(10)

    stats = {"todo": 0, "in_progress": 0, "in_review": 0, "done": 0, "total": 0}
    total_points = 0
    done_points  = 0

    for r in results:
        status = r["_id"]
        if status in stats:
            stats[status] = r["count"]
        stats["total"] += r["count"]
        total_points   += r["points"]
        if status == "done":
            done_points = r["points"]

    stats["total_points"] = total_points
    stats["done_points"]  = done_points
    stats["completion_pct"] = (
        round(stats["done"] / stats["total"] * 100)
        if stats["total"] > 0 else 0
    )
    return stats
