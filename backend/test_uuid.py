import os
from dotenv import load_dotenv
load_dotenv()

from app.services import project_service

def test_fetch():
    projects = project_service.get_projects(limit=1)
    if projects:
        print(f"Project keys: {projects[0].keys()}")
        print(f"UUID: {projects[0].get('uuid')}")
    else:
        print("No projects found")

if __name__ == "__main__":
    test_fetch()
