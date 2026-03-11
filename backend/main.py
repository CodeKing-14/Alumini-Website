from fastapi import FastAPI

app = FastAPI()
@app.get("/")
def view():
    return "This is the backend of this project"