import uuid
import os
import time
import html
from datetime import datetime
from collections import defaultdict
from fastapi import FastAPI, File, UploadFile, Depends, HTTPException, Header, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from sqlalchemy.orm import Session

import models
from database import engine, get_db
from forensics import run_forensic_suite

# ── Create DB tables on startup ──────────────────────────────────────────────
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="SheGuard API", version="1.0.0")

# ── CORS ─────────────────────────────────────────────────────────────────────
# Read allowed origins from the environment variable set in render.yaml.
# Multiple origins can be comma-separated:
#   ALLOWED_ORIGINS=https://sheguard-app.onrender.com,http://localhost:8080
_raw_origins = os.environ.get("ALLOWED_ORIGINS", "http://localhost:8080")
ALLOWED_ORIGINS = [o.strip() for o in _raw_origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type", "X-Requested-With", "X-Dashboard-Pin"],
)

# ── Rate limiter ─────────────────────────────────────────────────────────────
_rate_store: dict[str, list[float]] = defaultdict(list)
MAX_REQUESTS = 10
WINDOW_SECONDS = 60

def check_rate_limit(request: Request):
    ip = request.client.host if request.client else "unknown"
    now = time.time()
    window_start = now - WINDOW_SECONDS
    _rate_store[ip] = [t for t in _rate_store[ip] if t > window_start]
    if len(_rate_store[ip]) >= MAX_REQUESTS:
        raise HTTPException(
            status_code=429,
            detail="Too many requests. Please wait before analysing another image.",
        )
    _rate_store[ip].append(now)

# ── Input sanitisation ───────────────────────────────────────────────────────
def sanitize(value: str, max_len: int = 255) -> str:
    return html.escape(str(value).strip())[:max_len]

# ── CSRF header check ────────────────────────────────────────────────────────
def verify_csrf(x_requested_with: str = Header(None)):
    if x_requested_with != "sheguard-client":
        raise HTTPException(status_code=403, detail="Invalid request source.")


# ── Health check (used by Render's health-check probe) ──────────────────────
@app.get("/health")
def health():
    return {"status": "healthy", "service": "sheguard-api"}


# ── Analyse image ────────────────────────────────────────────────────────────
@app.post("/api/analyze")
async def analyze_image(
    request: Request,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    x_requested_with: str = Header(None),
):
    verify_csrf(x_requested_with)
    check_rate_limit(request)

    MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB
    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="File too large. Maximum size is 10 MB.")

    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file is not an image.")

    allowed_types = {"image/jpeg", "image/jpg", "image/png", "image/webp"}
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Unsupported format. Use JPG, PNG, or WEBP.")

    try:
        analysis = run_forensic_suite(contents)
        case_id = f"SG-{uuid.uuid4().hex[:6].upper()}"

        db_case = models.AnalysisCase(
            case_id=case_id,
            image_status=analysis["imageStatus"],
            confidence_score=analysis["confidenceScore"],
            forensic_score=analysis["forensicScore"],
            risk_level=analysis["riskLevel"],
            face_manipulation=analysis["details"]["faceManipulation"],
            splice_detection=analysis["details"]["spliceDetection"],
            metadata_anomaly=analysis["details"]["metadataAnomaly"],
            noise_analysis=analysis["details"]["noiseAnalysis"],
            ela_image_data=analysis.get("ela_image", ""),
        )
        db.add(db_case)
        db.commit()
        db.refresh(db_case)

        return {
            "caseId": case_id,
            "imageStatus": analysis["imageStatus"],
            "confidenceScore": analysis["confidenceScore"],
            "forensicScore": analysis["forensicScore"],
            "timestamp": db_case.timestamp.isoformat(),
            "riskLevel": analysis["riskLevel"],
            "details": analysis["details"],
            "metadata": analysis.get("metadata", {}),
            "ela_image": analysis.get("ela_image", ""),
            "elaApplicable": analysis.get("elaApplicable", True),
        }
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail="Analysis failed. Please try again.")


# ── Submit incident report ───────────────────────────────────────────────────
@app.post("/api/reports")
def create_report(
    report_data: dict,
    db: Session = Depends(get_db),
    x_requested_with: str = Header(None),
):
    verify_csrf(x_requested_with)

    required = ["name", "email", "gender", "age", "location", "contact", "description"]
    for key in required:
        if key not in report_data or not str(report_data[key]).strip():
            raise HTTPException(status_code=400, detail=f"Missing required field: {key}")

    name        = sanitize(report_data["name"], 100)
    email       = sanitize(report_data["email"], 254)
    gender      = sanitize(report_data["gender"], 50)
    age         = sanitize(str(report_data["age"]), 3)
    location    = sanitize(report_data["location"], 200)
    contact     = sanitize(report_data["contact"], 20)
    description = sanitize(report_data["description"], 2000)

    if "@" not in email or "." not in email.split("@")[-1]:
        raise HTTPException(status_code=400, detail="Invalid email address.")

    case_id = f"SG-{uuid.uuid4().hex[:6].upper()}"
    db_report = models.IncidentReport(
        case_id=case_id,
        name=name,
        email=email,
        gender=gender,
        age=age,
        location=location,
        contact=contact,
        description=description,
        status="Filed",
        submitted_at=datetime.utcnow(),
    )
    db.add(db_report)
    db.commit()
    db.refresh(db_report)

    return {
        "caseId": db_report.case_id,
        "name": db_report.name,
        "gender": db_report.gender,
        "status": db_report.status,
        "submittedAt": db_report.submitted_at.isoformat(),
    }


# ── List reports (PIN-protected) ─────────────────────────────────────────────
DASHBOARD_PIN = os.environ.get("DASHBOARD_PIN", "")

@app.get("/api/reports")
def get_reports(
    x_dashboard_pin: str = Header(None),
    db: Session = Depends(get_db),
):
    if not DASHBOARD_PIN or x_dashboard_pin != DASHBOARD_PIN:
        raise HTTPException(status_code=401, detail="Unauthorized.")
    reports = (
        db.query(models.IncidentReport)
        .order_by(models.IncidentReport.submitted_at.desc())
        .all()
    )
    return [
        {
            "caseId": r.case_id,
            "gender": r.gender,
            "location": r.location,
            "status": r.status,
            "submittedAt": r.submitted_at.isoformat(),
        }
        for r in reports
    ]


# ── List cases ───────────────────────────────────────────────────────────────
@app.get("/api/cases")
def get_cases(db: Session = Depends(get_db)):
    cases = (
        db.query(models.AnalysisCase)
        .order_by(models.AnalysisCase.timestamp.desc())
        .all()
    )
    return [
        {
            "caseId": c.case_id,
            "imageStatus": c.image_status,
            "confidenceScore": c.confidence_score,
            "forensicScore": c.forensic_score,
            "timestamp": c.timestamp.isoformat(),
            "riskLevel": c.risk_level,
            "details": {
                "faceManipulation": c.face_manipulation,
                "spliceDetection": c.splice_detection,
                "metadataAnomaly": c.metadata_anomaly,
                "noiseAnalysis": c.noise_analysis,
            },
        }
        for c in cases
    ]


# ── Serve frontend static build (optional fallback) ──────────────────────────
# When Render serves the frontend as a separate static site this block is
# not needed.  It is kept as a safety net if you ever run both services
# from a single process (e.g. local Docker).
_static_dir = os.path.join(os.path.dirname(__file__), "static")
if os.path.isdir(_static_dir):
    app.mount("/assets", StaticFiles(directory=os.path.join(_static_dir, "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        if full_path.startswith("api/") or full_path == "health":
            raise HTTPException(status_code=404)
        candidate = os.path.join(_static_dir, full_path)
        if os.path.isfile(candidate):
            return FileResponse(candidate)
        return FileResponse(os.path.join(_static_dir, "index.html"))
