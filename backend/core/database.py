from motor.motor_asyncio import AsyncIOMotorClient
from core.config import get_settings

settings = get_settings()
client = AsyncIOMotorClient(settings.mongo_uri)
db = client[settings.db_name]


def get_db():
    return db


async def create_indexes():
    """
    Compound index on tasks — project_id + sprint_id + status.
    Speeds up the most common query: fetch all tasks for a sprint.
    """
    await db.tasks.create_index(
        [("project_id", 1), ("sprint_id", 1), ("status", 1)]
    )
    await db.sprints.create_index([("project_id", 1)])
