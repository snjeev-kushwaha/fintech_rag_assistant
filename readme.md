# 🏦 FinSolve Technologies — Enterprise RBAC RAG Knowledge Platform

> An enterprise-grade, role-based AI knowledge assistant, document vector engine, and administration control center built with **FastAPI**, **React 19**, **ChromaDB**, and **MongoDB**.

---

## 📖 What is FinSolve?

In modern organizations, sensitive domain intelligence is partitioned across specialized departments:
* **Finance**: Budgets, CAPEX expenditure, procurement invoices, and audit filings.
* **Human Resources**: Payroll structures, headcount compensation, employee directories, and compliance policies.
* **Engineering**: Technical architecture, microservice runbooks, API specifications, and CI/CD pipelines.
* **Marketing & Sales**: Campaign ROI, pipeline conversion rates, and customer NPS feedback.

**FinSolve** combines **Retrieval-Augmented Generation (RAG)** with **Role-Based Access Control (RBAC)** to ensure employees can converse with an AI assistant that is **strictly bounded by their authorized department knowledge base**:
* An **Engineering team member** asking about finance budgets receives a scoped notice that no relevant documentation exists within their authorized domain.
* A **Finance team member** querying quarterly CAPEX receives precise calculations with direct source file citations.
* A **C-Level Executive** has unified oversight across all corporate domain collections.
* A **System Administrator** controls the multi-department lifecycle, provisions physical storage folders, manages user accounts, and monitors vector ingestion in real time.

## 🏗️ Technical Architecture

```text
┌────────────────────────────────────────────────────────────────────────┐
│                   React 19 Frontend (Port 5173)                        │
│  - Declarative URL Routing (/admin/departments, /admin/users, /chat)   │
│  - ChatGPT Dark/Light Modes + 11 Accent Color Presets                  │
│  - Real-Time Toast Notifications (Create, Update, Delete, Upload)      │
│  - Custom Confirm Delete Dialogs & Pagination Controls                 │
│  - Multi-Session Chat Threads with Rename/Delete Triple-Dot Menus      │
│  - Department Knowledge Document Explorer (Live Ingestion & Purge)     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    │ Authenticated Bearer JWT (Secure Headers & CORS)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   FastAPI Backend (Port 8000)                          │
│  - Security Middlewares: Anti-Clickjacking, HSTS, Rate Limiting        │
│  - Path Traversal Armor & File Size Verification (Max 25MB)            │
│  - Strict RBAC Enforcement & Root Account Safeguards                   │
│  - Automatic backend/data/<dept>/ Lifecycle Management                 │
│  - Modular Router: /auth, /chat, /admin/departments, /admin/users      │
└───────────┬───────────────────────┬───────────────────────────┬────────┘
            │                       │                           │
┌───────────▼───────────┐ ┌─────────▼───────────┐   ┌───────────▼───────────┐
│   ChromaDB (Vector)   │ │  MongoDB (Database) │   │     LLM Synthesizer   │
│ - Embeddings Store    │ │ - User Credentials  │   │ - Local Ollama (llama)│
│ - Auto Re-Indexing    │ │ - Chat Sessions     │   │ - Google Gemini API   │
│ - Distance Filtering  │ │ - Departments DB    │   │ - Dynamic Fallback    │
└───────────────────────┘ └─────────────────────┘   └───────────────────────┘
```

---

## 🔒 Enterprise Security Features

* **🛡️ HTTP Security Headers**: Automatic injection of `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `X-XSS-Protection: 1; mode=block`, `Strict-Transport-Security`, and `Referrer-Policy`.
* **🚦 Brute-Force Rate Limiting**: Sliding-window rate limiter on `POST /auth/login` blocking credential stuffing attacks (`HTTP 429`).
* **🎯 Strict CORS Whitelist**: Explicitly restricted to trusted client origins (`localhost:5173`, `127.0.0.1:5173`, `localhost:3000`).
* **📂 Path Traversal & Disk Armor**: File operations are strictly confined within `backend/data/` using canonical path validation and filename sanitization.
* **🔑 Token-Only Local Storage**: Persists only the cryptographic JWT token on the client, verifying live credentials on refresh via `GET /auth/me`.
* **🚫 Root Account Safeguards**: The system administrator (`root`) account cannot be deleted, renamed, or deactivated.

## 📂 Project Directory Structure

```text
fin-tech/
├── backend/
│   ├── app/
│   │   ├── main.py                  # FastAPI entrypoint, Security Middlewares & Lifespan
│   │   ├── api/                     # Modular REST API endpoints
│   │   │   ├── auth.py              # Login, token generation & /auth/me
│   │   │   ├── chat.py              # RAG Chat query, multi-session & attachments
│   │   │   ├── departments.py       # Department CRUD & Knowledge File sync
│   │   │   ├── users.py             # User account CRUD & RBAC management
│   │   │   ├── system.py            # System health metrics
│   │   │   └── router.py            # Master API router aggregator
│   │   ├── core/                    # Security, configuration & middlewares
│   │   │   ├── config.py            # Pydantic Settings & environment variables
│   │   │   ├── security.py          # Bcrypt password hashing & JWT handling
│   │   │   ├── security_utils.py    # Path traversal protection & file sanitization
│   │   │   ├── middleware.py        # Security headers & login rate limiter
│   │   │   └── rbac.py              # Role permissions & collection mappings
│   │   ├── db/                      # Persistent storage layers
│   │   │   ├── mongo.py             # MongoDB client singleton & index setup
│   │   │   ├── users_store.py       # MongoDB user database repository
│   │   │   ├── departments_store.py # MongoDB department repository
│   │   │   ├── chat_store.py        # MongoDB chat session repository
│   │   │   └── vector_store.py      # ChromaDB embeddings & re-indexing engine
│   │   ├── models/                  # Pydantic validation schemas & DTOs
│   │   │   └── schemas.py           # Request & response data models
│   │   └── services/                # Business logic
│   │       └── rag_service.py       # RAG pipeline & LLM generation (Ollama / Gemini)
│   ├── chroma_db/                   # ChromaDB persistent vector collection storage
│   ├── data/                        # Physical department documents (backend/data/<dept>/)
│   ├── scripts/
│   │   └── ingest_data.py           # Initial data ingestion script
│   ├── Dockerfile                   # Backend Dockerfile
│   ├── docker-compose.yml           # Backend Docker Compose (App + Mongo + Ollama)
│   ├── requirements.txt             # Python dependencies
│   └── .env                         # Backend environment variables
│
├── frontend-react/
│   ├── src/
│   │   ├── context/
│   │   │   ├── AuthContext.jsx      # Token-only session manager & /auth/me hydration
│   │   │   ├── ThemeContext.jsx     # Dark/Light theme & 11 palette presets
│   │   │   └── ToastContext.jsx     # Global auto-dismissing Toast alert system
│   │   ├── modules/
│   │   │   ├── control_center/      # Admin Control Center module
│   │   │   │   ├── components/      # Departments, Users & Sidebar components
│   │   │   │   ├── styles/          # 60fps GPU-accelerated Control Center CSS
│   │   │   │   └── ControlCenterLayout.jsx
│   │   │   └── platform_center/     # Scoped Department Chat module
│   │   │       ├── components/      # Chat messages, inputs, modals & sidebar
│   │   │       ├── pages/           # Chat dashboard & Team directory pages
│   │   │       └── PlatformCenterLayout.jsx
│   │   ├── shared/components/       # Reusable Icons, Modals, Spinners, Banners
│   │   │   ├── Icons.jsx            # Clean Enterprise SVG Iconography
│   │   │   └── ConfirmDeleteModal.jsx
│   │   ├── services/                # API communication clients
│   │   ├── App.jsx                  # Declarative URL Routes & Auth Guards
│   │   └── main.jsx                 # React DOM root with BrowserRouter
│   ├── Dockerfile                   # Frontend Dockerfile
│   ├── docker-compose.yml           # Frontend Docker Compose
│   ├── package.json                 # Node dependencies (React 19, React Router 7)
│   └── vite.config.js               # Vite bundler configuration
│
└── README.md                        # Master Project Documentation
```

---

## 🛠️ Step-by-Step Setup Guide

You can run the application using **Option 1 (Local Native)** or **Option 2 (Docker)**.

---

### Option 1: Local Native Setup

#### Prerequisites
* **Python 3.11+**
* **Node.js 18+** & `npm`
* **MongoDB** running on `localhost:27017`
* **Ollama** running locally on `localhost:11434` with model `llama3.2` (or a Google Gemini API Key)

#### 1. Start MongoDB & Ollama
```bash
# Start MongoDB container
docker run -d -p 27017:27017 --name local-mongodb mongo:latest

# Start Ollama container
docker run -d -p 11434:11434 --name ollama -v ollama:/root/.ollama ollama/ollama:latest

# Pull LLaMA 3.2 model into Ollama
docker exec -it ollama ollama pull llama3.2
```

#### 2. Backend Setup
```powershell
# 1. Navigate to backend directory
cd backend

# 2. Create and activate virtual environment
python -m venv .venv
.\.venv\Scripts\Activate.ps1

# 3. Install Python dependencies
pip install -r requirements.txt

# 4. Ingest starter department knowledge files
python scripts/ingest_data.py

# 5. Start the FastAPI backend server
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
* Backend API: **`http://127.0.0.1:8000`**
* Interactive Swagger Docs: **`http://127.0.0.1:8000/docs`**

#### 3. Frontend Setup
Open a new terminal window:
```powershell
# 1. Navigate to frontend directory
cd frontend-react

# 2. Install dependencies
npm install

# 3. Start Vite development server
npm run dev
```
* Open your browser and visit: **`http://localhost:5173`**

---

### Option 2: Docker Containerized Setup

#### 1. Start the Backend Stack (Backend + MongoDB + Ollama)
```powershell
cd backend
docker compose up -d --build
```
*(Pull LLaMA 3.2 on first run)*:
```powershell
docker exec -it finsolve-ollama ollama pull llama3.2
```

#### 2. Start the Frontend Stack
Open a new terminal:
```powershell
cd frontend-react
docker compose up -d --build
```
* Access the web application at: **`http://localhost:5173`**
