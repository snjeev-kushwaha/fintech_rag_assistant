# 🏦 FinSolve Technologies — RAG RBAC Enterprise Chatbot & Control Center

A production-ready, **Role-Based Access Control (RBAC) Chatbot** and **Admin Control Center** built with **Retrieval-Augmented Generation (RAG)** for FinSolve Technologies. Each user gets secure, role-scoped AI responses based on their department, managed via a persistent local MongoDB database.

---

## 🏗️ Architecture Blueprint

```text
                               ┌──────────────────────────────────────────────┐
                               │       Vite React Frontend (Port 5173)        │
                               │  - Collapsible Chat Sidebar & Access List    │
                               │  - Admin Control Center: User Accounts CRUD │
                               └──────────────────────┬───────────────────────┘
                                                      │
                                                      │ JWT-authenticated REST
                                                      ▼
                               ┌──────────────────────────────────────────────┐
                               │          FastAPI Backend (Port 8000)         │
                               │  - JWT & bcrypt authentication               │
                               │  - Access Control Guards (/admin & /chat)    │
                               └──────┬───────────────────────────────┬───────┘
                                      │                               │
                      ┌───────────────▼───────────────┐     ┌─────────▼─────────┐
                      │   ChromaDB (Vector Store)     │     │      MongoDB      │
                      │  - 5 Document Collections     │     │   (Local Store)   │
                      │  - sentence-transformers      │     │  - User Records   │
                      │  - Semantic Chunks Retrieval  │     │  - Active Roles   │
                      └───────────────────────────────┘     └───────────────────┘
```

---

## 🔐 Security & Role Permissions Matrix

The chatbot ensures strict data boundaries. Retrieval-Augmented Generation only queries collections matching the user's role:

| Role | Finance Data | Marketing Data | HR Data | Engineering Data | General Company Info |
| :--- | :---: | :---: | :---: | :---: | :---: |
| `finance` | ✅ | ✅ *(Expenses)* | ❌ | ❌ | ✅ |
| `marketing` | ❌ | ✅ | ❌ | ❌ | ✅ |
| `hr` | ❌ | ❌ | ✅ | ❌ | ✅ |
| `engineering` | ❌ | ❌ | ❌ | ✅ | ✅ |
| `executive` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `employee` | ❌ | ❌ | ❌ | ❌ | ✅ *(General policies only)* |
| `root` | ❌ *(Admin)* | ❌ *(Admin)* | ❌ *(Admin)* | ❌ *(Admin)* | 👑 **System Control Center** |

---

## 📁 Repository Structure

```text
FinTech/
├── requirements.txt         # Python backend dependencies
├── .env                     # Local environment settings (keys, DB settings)
├── .env.example             # Environment template file
├── pyrightconfig.json       # Visual Studio Code Python path mapping
│
├── backend/
│   ├── main.py              # FastAPI endpoints & server startup
│   ├── auth.py              # JWT authentication & root guard dependencies
│   ├── models.py            # Pydantic schema validation models
│   ├── config.py            # BaseSettings configuration loader
│   ├── users_store.py       # MongoDB storage operations & database seeding
│   ├── vector_store.py      # ChromaDB setup and multi-collection search
│   ├── rbac.py              # RBAC query routing & collection matching rules
│   └── rag_pipeline.py      # RAG Pipeline: Retrieves chunks, selects LLM provider
│
├── scripts/
│   └── ingest_data.py       # Embedded document loader for ChromaDB
│
├── data/                    # Markdown/Text knowledge base documents
│   ├── finance/             # Budgets, reimbursement protocols, spreadsheets
│   ├── marketing/           # NPS feedback, campaigns, analytics
│   ├── hr/                  # HR directories, attendance policies, payroll brackets
│   ├── engineering/         # Tech stacks, CI/CD runbooks, microservices
│   └── general/             # Employee handbook, holidays, FAQs
│
└── frontend-react/          # Vite + React single-page application
    ├── package.json         # Node.js dependencies
    ├── vite.config.js       # Vite bundler rules
    ├── src/
    │   ├── main.jsx         # Render root
    │   ├── App.jsx          # React router & login guards
    │   ├── api.js           # API HTTP fetch helpers (chat, login, users CRUD)
    │   ├── constants.js     # Brand configs, colors, role configuration
    │   ├── context/
    │   │   └── AuthContext.jsx # Global auth session tokens manager
    │   └── pages/
    │       ├── LoginPage.jsx        # Login panel screen
    │       ├── ChatPage.jsx         # Collaborative chatbot & access permissions
    │       └── ControlCenterPage.jsx# System administrator management panel
```

---

## ⚡ Setup & Launch Guide

### 1. Pre-requisites
- **Python 3.11** or **uv** installed.
- **Node.js** (v18+) for frontend compilation.
- **MongoDB** running locally on port `27017` (via MSI installation or Docker container).
- **Ollama** running locally on port `11434` (via Docker or native installer).

---

### 2. Database Services Configurations

#### A. Run local MongoDB (or use MongoDB Compass)
If running inside Docker:
```bash
docker run -d -p 27017:27017 --name local-mongodb mongo:latest
```

#### B. Run Ollama (Local Llama 3.2 model container)
If using Docker, start the Ollama service:
```bash
docker run -d --name ollama -p 11434:11434 -v ollama:/root/.ollama ollama/ollama:latest
```
Then, pull the required models inside the running container:
```bash
# Pull Llama 3.2 model (approx 2.0 GB)
docker exec ollama ollama pull llama3.2

# Optional: pull embedder
docker exec ollama ollama pull nomic-embed-text
```

---

### 3. Backend Setup
1. **Activate the Virtual Environment**:
   ```powershell
   # PowerShell
   .venv\Scripts\Activate.ps1
   ```
2. **Install dependencies**:
   ```powershell
   uv pip install -r requirements.txt
   ```
3. **Configure Environment Variables**:
   Create a `.env` file in the root folder:
   ```env
   # LLM Provider selection: auto | gemini | ollama
   LLM_PROVIDER=ollama
   
   # Local Ollama config
   OLLAMA_BASE_URL=http://127.0.0.1:11434
   OLLAMA_MODEL=llama3.2
   
   # Google Gemini config (if using gemini provider)
   GEMINI_API_KEY=your_gemini_api_key_here
   GEMINI_MODEL=gemini-2.0-flash
   
   # MongoDB connection config
   MONGO_URI=mongodb://127.0.0.1:27017/
   MONGO_DB_NAME=finsolve_db
   ```
4. **Ingest Knowledge Documents**:
   Embed and populate ChromaDB:
   ```powershell
   $env:PYTHONUTF8="1"
   python scripts/ingest_data.py
   ```
5. **Start the FastAPI Backend**:
   ```powershell
   $env:PYTHONUTF8="1"
   python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000
   ```

---

### 4. Frontend Setup
1. Open a new terminal in the `frontend-react` folder:
   ```bash
   cd frontend-react
   npm install
   ```
2. **Launch Dev Server**:
   ```bash
   npm run dev
   ```
   Open **[http://localhost:5173](http://localhost:5173)** in your browser!

---

## 👥 Seed Credentials & Roles

On initial startup, MongoDB is automatically seeded with these default user records:

| Username | Default Password | Role Group | Scope Description |
| :--- | :--- | :--- | :--- |
| **`root`** | **`root123`** | `root` | 👑 **System Administrator Control Center** |
| `alice_finance` | `finance123` | `finance` | Financial spreadsheets + Marketing expenses |
| `bob_marketing` | `marketing123`| `marketing` | Campaign reports + Customer NPS |
| `carol_hr` | `hr123` | `hr` | Payroll structure + Employee performance |
| `dave_eng` | `eng123` | `engineering`| Architectural designs + Deploy protocols |
| `tony_cto` | `executive123`| `executive` | Full enterprise data retrieval |
| `employee1` | `employee123` | `employee` | General policies & directories only |

---

## 🔗 Core APIs List

| Method | Endpoint | Authorization | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/health` | Open | Health check & vector stores diagnostics |
| `POST`| `/auth/login` | Open | Sign in with credentials, returns JWT token |
| `POST`| `/chat` | Bearer Token | Processes role-based semantic search & text generation |
| `GET` | `/admin/users`| Root JWT Token| Lists all user accounts saved in local MongoDB |
| `POST`| `/admin/users`| Root JWT Token| Creates a new user in MongoDB |
| `PUT` | `/admin/users`| Root JWT Token| Modifies user role, name, status, or updates passwords |
| `DELETE`| `/admin/users`| Root JWT Token| Removes an account from MongoDB |

---

## 🧠 Technical Feature Insights

### A. Dynamic LLM Switch & Fallback
The RAG pipeline ([rag_pipeline.py](file:///d:/FinTech/backend/rag_pipeline.py)) handles LLM routing at startup and execution time:
- **Auto-Detection**: If `LLM_PROVIDER` is set to `auto`, it checks if a valid Gemini API key is configured. If not, it pings your local Ollama port and uses your active local model.
- **Fail-safe Fallback**: If `LLM_PROVIDER` is set to `gemini` but calls throw errors (quota constraints, network issues), the backend automatically redirects the prompt to your local **Ollama** model (`llama3.2`) in real-time, preventing service downtime.

### B. ChromaDB Vector Store Ingestion
The file [ingest_data.py](file:///d:/FinTech/scripts/ingest_data.py) utilizes `sentence-transformers` (`all-MiniLM-L6-v2`) to turn text files into 384-dimensional vectors. Documents inside `data/` are chunked, tagged with metadata (`source_file`, `department`), and sorted into 5 collections:
- `finance`, `marketing`, `hr_data`, `engineering`, and `general`.

### C. Sidebar Toggle Panel
To optimize layout space for viewing document sources, a slide toggle is integrated into the frontend. The layout transitions the sidebar's width and padding smoothly, while child elements maintain their styling to prevent text warping.


# Root User Login
username: root,
password: root123