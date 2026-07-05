# 🏦 FinSolve Technologies — RAG RBAC Chatbot

A **production-ready, role-based access control (RBAC) chatbot** built with Retrieval-Augmented Generation (RAG) for FinSolve Technologies. Each user gets secure, role-scoped AI responses based on their department.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│           Streamlit Frontend (Port 8501)                │
│   Login → Role Badge → Chat → Source Citations         │
└──────────────────────┬──────────────────────────────────┘
                       │ JWT-authenticated HTTP
┌──────────────────────▼──────────────────────────────────┐
│              FastAPI Backend (Port 8000)                 │
│  POST /auth/login  →  JWT Token + Role                  │
│  POST /chat        →  RBAC Check → RAG → Response       │
└──────────────────────┬──────────────────────────────────┘
                       │
         ┌─────────────▼────────────────┐
         │       RAG Pipeline           │
         │  1. RBAC → allowed depts     │
         │  2. ChromaDB semantic search  │
         │  3. Context augmentation      │
         │  4. Gemini 1.5 Flash LLM     │
         └──────────────────────────────┘
```

## 🔐 Role Permissions Matrix

| Role | Finance | Marketing | HR | Engineering | General |
|------|:-------:|:---------:|:--:|:-----------:|:-------:|
| `finance` | ✅ | ✅ | ❌ | ❌ | ✅ |
| `marketing` | ❌ | ✅ | ❌ | ❌ | ✅ |
| `hr` | ❌ | ❌ | ✅ | ❌ | ✅ |
| `engineering` | ❌ | ❌ | ❌ | ✅ | ✅ |
| `executive` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `employee` | ❌ | ❌ | ❌ | ❌ | ✅ |

## 📁 Project Structure

```
FinTech/
├── requirements.txt         # Python dependencies
├── .env                     # Your API keys (create from .env.example)
├── .env.example             # Environment variable template
│
├── data/                    # Department knowledge base documents
│   ├── finance/             # Financial reports, expenses, equipment costs
│   ├── marketing/           # Campaigns, NPS, sales metrics
│   ├── hr/                  # Employee records, payroll, attendance, reviews
│   ├── engineering/         # Architecture, CI/CD, operational runbooks
│   └── general/             # Policies, events, FAQs (all staff)
│
├── backend/
│   ├── main.py              # FastAPI application
│   ├── auth.py              # JWT authentication
│   ├── rbac.py              # Role-based access control
│   ├── rag_pipeline.py      # RAG: retrieve + generate
│   ├── vector_store.py      # ChromaDB operations
│   ├── models.py            # Pydantic data models
│   └── config.py            # Settings & environment config
│
├── scripts/
│   └── ingest_data.py       # One-time data ingestion script
│
└── frontend/
    └── app.py               # Streamlit chatbot UI
```

---

## 🚀 Quick Start

### 1. Prerequisites

- `uv` package manager (already installed if you're on this machine — check with `uv --version`)
- A free **Google Gemini API key** from [ai.google.dev](https://ai.google.dev)

### 2. Create Virtual Environment

Use `uv` to create a Python 3.11 virtual environment (recommended for full ML library compatibility):

```powershell
cd d:\FinTech
uv venv .venv --python 3.11
```

Activate it:

```powershell
# Windows PowerShell
.venv\Scripts\Activate.ps1

# Windows CMD
.venv\Scripts\activate.bat
```

### 3. Install Dependencies

```powershell
uv pip install -r requirements.txt --python .venv\Scripts\python.exe
```

### 4. Configure Environment

```powershell
# Copy the example env file
copy .env.example .env
```

Then open `.env` and add your Gemini API key:

```env
GEMINI_API_KEY=your_actual_key_here
```

Get a free key at **https://ai.google.dev → Get API key**.

### 5. Ingest Data (Run ONCE)

Embeds all 17 department documents (133 chunks) into ChromaDB:

```powershell
$env:PYTHONUTF8="1"
.venv\Scripts\python.exe scripts/ingest_data.py
```

> **Note:** `PYTHONUTF8=1` is required on Windows to prevent encoding errors. You should see 5 collections created: `engineering`, `finance`, `general`, `hr_data`, `marketing`.

### 6. Start the Backend

Open a terminal and run:

```powershell
$env:PYTHONUTF8="1"
.venv\Scripts\python.exe -m uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
```

Verify it's healthy: open **http://127.0.0.1:8000/health** — you should see all 5 collections listed.

### 7. Start the Frontend (new terminal)

```powershell
$env:PYTHONUTF8="1"
.venv\Scripts\python.exe -m streamlit run frontend/app.py --server.port 8501
```

Open your browser at **http://localhost:8501** 🎉

---

## 👤 Demo Users

| Username | Password | Role | Access |
|----------|----------|------|--------|
| `alice_finance` | `finance123` | 💰 Finance | Finance + General |
| `bob_marketing` | `marketing123` | 📈 Marketing | Marketing + General |
| `carol_hr` | `hr123` | 👥 HR | HR + General |
| `dave_eng` | `eng123` | ⚙️ Engineering | Engineering + General |
| `tony_cto` | `executive123` | 👑 C-Level Executive | **Full Access** |
| `employee1` | `employee123` | 🏢 Employee | General Only |

---

## 🔌 API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/health` | Health check + collections list | ❌ |
| `POST` | `/auth/login` | Login → JWT token | ❌ |
| `GET` | `/auth/me` | Current user info | ✅ |
| `POST` | `/chat` | RBAC-scoped RAG query | ✅ |
| `GET` | `/docs` | Interactive API docs (Swagger) | ❌ |

---

## 🧠 Tech Stack

| Component | Technology |
|-----------|-----------|
| **Backend** | FastAPI + Uvicorn |
| **Auth** | JWT (`python-jose`) + bcrypt |
| **Vector Store** | ChromaDB (persistent, local) |
| **Embeddings** | `sentence-transformers` (all-MiniLM-L6-v2) |
| **LLM** | Google Gemini 1.5 Flash |
| **Frontend** | Streamlit |
| **Data** | Synthetic department `.txt` documents |

---

## 🧪 RBAC Testing

Try these to verify access control works:

1. **Login as `employee1`** → ask "What is the payroll structure?" → should be **refused** (no HR access)
2. **Login as `carol_hr`** → ask "What is the payroll structure?" → should **retrieve HR data**
3. **Login as `tony_cto`** → ask "What was our revenue and who are our top performers?" → should get **all departments**
4. **Login as `alice_finance`** → ask "What was marketing spend on events?" → should retrieve **marketing expenses** (Finance has Marketing expense access)

---

## 📖 How RAG Works Here

```
User Query: "What was Q3 revenue?"
      │
      ▼
[RBAC] Check user role → allowed collections: ["finance", "general"]
      │
      ▼
[ChromaDB] Semantic search across finance + general collections
           → Returns top-5 most relevant text chunks
      │
      ▼
[Gemini] System prompt + context chunks + user query
         → Generates cited, accurate response
      │
      ▼
[Response] Answer + source document references
```

---

## ⚙️ Configuration

Edit `.env` to customize:

```env
GEMINI_API_KEY=your_key_here       # Required
GEMINI_MODEL=gemini-1.5-flash      # Or gemini-1.5-pro for better quality
JWT_SECRET_KEY=change-me-in-prod   # Use a strong random key
ACCESS_TOKEN_EXPIRE_MINUTES=60     # Token lifetime
CHROMA_PERSIST_DIR=./chroma_db     # Where vector DB is stored
```

---

## 🛠️ Troubleshooting

Three issues were encountered and fixed during the initial setup on Windows. If you hit any of these, here's what to do:

### 1. UnicodeEncodeError when running `ingest_data.py`

**Error:**
```
UnicodeEncodeError: 'charmap' codec can't encode character ...
```

**Cause:** Windows PowerShell defaults to `cp1252` encoding which can't render certain characters.

**Fix:** Always prefix Python commands with `$env:PYTHONUTF8="1"`:
```powershell
$env:PYTHONUTF8="1"
.venv\Scripts\python.exe scripts/ingest_data.py
```

---

### 2. ChromaDB rejects the `hr` collection name

**Error:**
```
ValueError: Expected collection name that ... contains 3-63 characters ... got hr
```

**Cause:** ChromaDB requires collection names to be **at least 3 characters**. The `hr` data folder maps to a 2-character collection name.

**Fix:** Already handled in `vector_store.py` via a `COLLECTION_NAME_MAP`. The `hr/` directory is stored as the `hr_data` collection automatically. No action needed — but note that the HR collection in ChromaDB is named `hr_data`, not `hr`.

---

### 3. `passlib` crashes with `bcrypt >= 5.0`

**Error:**
```
ValueError: password cannot be longer than 72 bytes, truncate manually if necessary
```

**Cause:** `passlib 1.7.4` is incompatible with `bcrypt >= 5.0`. Its internal bug-detection routine triggers the error at import time.

**Fix:** Already resolved — `auth.py` uses the `bcrypt` library directly (version `4.2.1`) instead of going through `passlib`. The `requirements.txt` pins `bcrypt==4.2.1`.

---

### 4. ChromaDB telemetry warnings (harmless)

**Message:**
```
Failed to send telemetry event ...: capture() takes 1 positional argument but 3 were given
```

**Cause:** A minor version mismatch between `chromadb 0.5.x` and its internal `posthog` telemetry client.

**Fix:** These are **harmless warnings** — the system works perfectly. To suppress them entirely, add this to your `.env`:
```env
ANONYMIZED_TELEMETRY=False
```

---

## 📋 Verify Everything is Working

Run this quick checklist after setup:

| Step | Command / URL | Expected Result |
|------|--------------|-----------------|
| ChromaDB ingested | `python scripts/ingest_data.py` | 5 collections, 133 total chunks |
| Backend healthy | `http://127.0.0.1:8000/health` | `{"status":"healthy","collections_loaded":[...]}` |
| Swagger UI | `http://127.0.0.1:8000/docs` | Interactive API documentation |
| Login works | POST `/auth/login` with `alice_finance` / `finance123` | JWT token returned |
| Chat works | POST `/chat` with Bearer token | AI answer + source citations |
| Frontend loads | `http://localhost:8501` | FinSolve AI login page |
