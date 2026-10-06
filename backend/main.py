from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from routers import projects, sprints, tasks
from core.config import get_settings
from core.database import create_indexes

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    await create_indexes()
    yield


app = FastAPI(
    title=settings.app_name,
    description="Project and sprint management API.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(projects.router, prefix="/api/projects", tags=["Projects"])
app.include_router(sprints.router,  prefix="/api/sprints",  tags=["Sprints"])
app.include_router(tasks.router,    prefix="/api/tasks",    tags=["Tasks"])


@app.get("/", tags=["Health"])
def root():
    return {"status": "ok", "app": settings.app_name}
