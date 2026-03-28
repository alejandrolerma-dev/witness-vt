"""
Local dev server for testing Lambda handlers.
"""
import json
import os
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# Load env vars
from dotenv import load_dotenv
load_dotenv("../.env")

# Import Lambda handlers
from session.handler import handler as session_handler
from process.handler import handler as process_handler
from save.handler import handler as save_handler
from retrieve.handler import handler as retrieve_handler

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def lambda_to_fastapi(lambda_response: dict) -> JSONResponse:
    """Convert Lambda response dict to FastAPI JSONResponse."""
    return JSONResponse(
        status_code=lambda_response["statusCode"],
        content=json.loads(lambda_response["body"]),
        headers=lambda_response.get("headers", {}),
    )


@app.post("/session")
async def create_session():
    """POST /session → session Lambda"""
    event = {"httpMethod": "POST", "headers": {}, "body": "{}"}
    result = session_handler(event, None)
    return lambda_to_fastapi(result)


@app.post("/process")
async def process_incident(request: Request):
    """POST /process → process Lambda"""
    body = await request.body()
    headers = dict(request.headers)
    event = {
        "httpMethod": "POST",
        "headers": headers,
        "body": body.decode("utf-8"),
    }
    result = process_handler(event, None)
    return lambda_to_fastapi(result)


@app.post("/save")
async def save_report(request: Request):
    """POST /save → save Lambda"""
    body = await request.body()
    headers = dict(request.headers)
    event = {
        "httpMethod": "POST",
        "headers": headers,
        "body": body.decode("utf-8"),
    }
    result = save_handler(event, None)
    return lambda_to_fastapi(result)


@app.get("/retrieve/{session_id}")
async def retrieve_report(session_id: str, request: Request):
    """GET /retrieve/{session_id} → retrieve Lambda"""
    headers = dict(request.headers)
    event = {
        "httpMethod": "GET",
        "headers": headers,
        "pathParameters": {"session_id": session_id},
    }
    result = retrieve_handler(event, None)
    return lambda_to_fastapi(result)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=3000)
