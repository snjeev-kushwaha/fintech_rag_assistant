# 🏦 FinSolve Technologies — RAG RBAC Enterprise Chatbot

> A secure, role-based internal knowledge assistant and management dashboard for enterprise teams.

---

## 📖 What is this Project? (In Simple Words)

In a company, different departments handle sensitive, confidential data:
* **Finance** manages budget sheets, equipment procurement costs, and tax audits.
* **HR** oversees employee directories, attendance records, and company policies.
* **Engineering** manages architecture documentation, CI/CD processes, and operational runbooks.
* **Marketing** tracks campaign performance, customer feedback, and sales metrics.

**FinSolve AI** is an internal enterprise chatbot built with **Retrieval-Augmented Generation (RAG)** and **Role-Based Access Control (RBAC)**. 

When a user asks a question, the AI **strictly restricts search to documents the user's role is authorized to view**:
* An **Engineering team member** asking about financial budgets will be informed that no relevant documentation was found in their scope.
* A **Finance team member** asking about expense reports receives exact figures with source file citations.
* A **C-Level Executive** has full access across all corporate data.
* An **Administrator** can manage users, configure department access, and upload new knowledge base documents.

---

## 👥 Role Permissions Overview

* **Finance**: Access to financial reports, expense budgets, procurement costs, and general info.
* **Marketing**: Access to marketing campaigns, sales metrics, customer NPS feedback, and general info.
* **Human Resources**: Access to employee directories, payroll brackets, HR policies, and general info.
* **Engineering**: Access to technical architecture, CI/CD runbooks, development guidelines, and general info.
* **Executive (C-Level)**: Unrestricted access across all department knowledge bases.
* **Employee**: Access to general company information, policies, and FAQs.
* **System Administrator**: Full system access, document ingestion, user accounts management, and department control.

---

## 🏗️ Architecture Blueprint

```text
┌─────────────────────────────────────────────────────────────┐
│              React Vite Frontend (Port 5173)                │
│  - ChatGPT Dark UI Theme & Floating Chat Bar               │
│  - Multi-Session Chat History & Thread Management          │
│  - Document Attachment Upload (+)                           │
│  - Admin Control Center: User Accounts & Departments CRUD   │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               │ Authenticated REST API Requests
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 FastAPI Backend (Port 8000)                 │
│  - JWT & Bcrypt Authentication with RBAC Enforcement        │
│  - Modular Router Architecture (Auth, Chat, Admin, System)  │
│  - Dynamic Context Filtering (Distance Threshold <= 0.65)   │
└──────┬───────────────────────┬───────────────────────┬──────┘
       │                       │                       │
┌──────▼───────┐       ┌───────▼──────┐        ┌───────▼──────┐
│   ChromaDB   │       │   MongoDB    │        │  Local AI    │
│(Vector Store)│       │(Data Store)  │        │   (Ollama)   │
│ - Embeddings │       │ - User Data  │        │ - llama3.2   │
│ - Chunking   │       │ - Sessions   │        │ - Port 11434 │
└──────────────┘       └──────────────┘        └──────────────┘
```

---

## 📂 Project Directory Structure

```text
fin-tech/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app initialization, CORS & Lifespan
│   │   ├── api/                 # Modular REST API endpoints
│   │   │   ├── auth.py          # Authentication handlers
│   │   │   ├── chat.py          # RAG Chat & Session handlers
│   │   │   ├── departments.py   # Department management
│   │   │   ├── users.py         # User management
│   │   │   ├── system.py        # System health checks
│   │   │   └── router.py        # Master API router aggregator
│   │   ├── core/                # Core configurations & security
│   │   │   ├── config.py        # Pydantic Settings & environment variables
│   │   │   ├── security.py      # Password hashing & JWT token logic
│   │   │   └── rbac.py          # Role permissions & collection mappings
│   │   ├── db/                  # Database connections & data persistence
│   │   │   ├── mongo.py         # MongoDB client & collection singleton
│   │   │   ├── users_store.py   # User accounts database operations
│   │   │   ├── departments_store.py # Department database operations
│   │   │   ├── chat_store.py    # Chat session history operations
│   │   │   └── vector_store.py  # ChromaDB embeddings & similarity search
│   │   ├── models/              # Pydantic schemas
│   │   │   └── schemas.py       # Request/response validation models
│   │   └── services/            # Business logic
│   │       └── rag_service.py   # RAG pipeline & LLM synthesis (Ollama / Gemini)
│   ├── chroma_db/               # Local ChromaDB persistent vector storage
│   ├── data/                    # Department source documents (.txt)
│   ├── scripts/
│   │   └── ingest_data.py       # Knowledge base ingestion script
│   ├── Dockerfile               # Backend Dockerfile
│   ├── docker-compose.yml       # Backend Docker Compose (Backend + Mongo + Ollama)
│   ├── requirements.txt         # Python package dependencies
│   └── .env                     # Backend environment variables
│
├── frontend-react/
│   ├── src/                     # React application source code
│   │   ├── components/          # UI Components (Sidebar, ChatBox, AdminModal, etc.)
│   │   ├── services/            # API service calls
│   │   ├── App.jsx              # Main React layout & state manager
│   │   └── main.jsx             # React DOM root mount
│   ├── Dockerfile               # Frontend Dockerfile
│   ├── docker-compose.yml       # Frontend Docker Compose
│   ├── package.json             # Node.js dependencies
│   └── vite.config.js           # Vite development server configuration
│
└── README.md                    # Project documentation
```

---

## 🛠️ Step-by-Step Setup Guide

You can run the project using **Option 1 (Local Native)** or **Option 2 (Docker)**.

---

### Option 1: Local Native Setup

#### Prerequisites
* **Python 3.11+**
* **Node.js 18+** & `npm`
* **MongoDB** running on `localhost:27017`
* **Ollama** running locally on `localhost:11434` with model `llama3.2`

#### 1. Start MongoDB & Ollama Containers
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
# 1. Navigate to the backend folder
cd backend

# 2. Create and activate a Python virtual environment
python -m venv .venv
.\.venv\Scripts\Activate.ps1

# 3. Install backend dependencies
pip install -r requirements.txt

# 4. Ingest department documents into ChromaDB (Run once)
python scripts/ingest_data.py

# 5. Start the FastAPI backend server
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
Backend API will be running at: **`http://127.0.0.1:8000`**  
Interactive API Docs (Swagger UI): **`http://127.0.0.1:8000/docs`**

#### 3. Frontend Setup
Open a new terminal window:
```powershell
# 1. Navigate to the frontend folder
cd frontend-react

# 2. Install dependencies
npm install

# 3. Start Vite dev server
npm run dev
```
Open your browser and visit: **`http://localhost:5173`**

---

### Option 2: Full Docker Containerized Setup

Both `backend` and `frontend-react` have their own self-contained `docker-compose.yml` files.

#### 1. Start the Backend Stack (Backend + MongoDB + Ollama)
```powershell
cd backend
docker compose up -d --build
```

##### Pull LLaMA 3.2 into the Ollama container (first time only):
```powershell
docker exec -it finsolve-ollama ollama pull llama3.2
```

#### 2. Start the Frontend Stack
Open a new terminal:
```powershell
cd frontend-react
docker compose up -d --build
```

Frontend will be accessible at: **`http://localhost:5173`**

---

## 💡 Key Features Breakdown

1. **🔒 Secure Role-Based Access Control (RBAC)**: Enforces strict department-level data boundaries.
2. **🧠 ChromaDB Semantic Distance Filtering**: Low-relevance chunks are filtered out prior to response synthesis.
3. **🔄 Multi-Session MongoDB Persistence**: Previous chat threads are saved and restored seamlessly.
4. **⚡ Seamless Local AI Fallback**: Runs on local LLaMA 3.2 out-of-the-box, with optional Google Gemini API support.
5. **📁 Real-Time Attachment Indexing**: Upload files directly from the UI into department collections.
