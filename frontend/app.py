"""
FinSolve Technologies — RAG RBAC Chatbot
Streamlit Frontend Application
"""

import requests
import streamlit as st
from datetime import datetime

# ── Page Configuration ────────────────────────────────────────────────────────
st.set_page_config(
    page_title="FinSolve AI — RBAC Chatbot",
    page_icon="🏦",
    layout="wide",
    initial_sidebar_state="expanded",
)

BACKEND_URL = "http://127.0.0.1:8000"

# ── Custom CSS ────────────────────────────────────────────────────────────────
st.markdown("""
<style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

    /* ── Global Reset ─────────────────────────────────────────── */
    html, body, [class*="css"] {
        font-family: 'Inter', sans-serif;
    }

    /* ── Background ───────────────────────────────────────────── */
    .stApp {
        background: linear-gradient(135deg, #0a0e1a 0%, #0d1526 40%, #111827 100%);
        min-height: 100vh;
    }

    /* ── Hide Streamlit Default Elements ──────────────────────── */
    #MainMenu { visibility: hidden; }
    footer { visibility: hidden; }
    header { visibility: hidden; }
    .stDeployButton { display: none; }

    /* ── Sidebar ──────────────────────────────────────────────── */
    [data-testid="stSidebar"] {
        background: linear-gradient(180deg, #0d1526 0%, #111827 100%) !important;
        border-right: 1px solid rgba(255,255,255,0.06);
    }
    [data-testid="stSidebar"] > div {
        padding-top: 1.5rem;
    }

    /* ── Main content padding ─────────────────────────────────── */
    .block-container {
        padding-top: 1.5rem !important;
        padding-bottom: 2rem !important;
        max-width: 1200px;
    }

    /* ── Brand Header ─────────────────────────────────────────── */
    .brand-header {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 1rem 1.25rem;
        background: linear-gradient(135deg, rgba(99,102,241,0.15), rgba(168,85,247,0.08));
        border: 1px solid rgba(99,102,241,0.25);
        border-radius: 14px;
        margin-bottom: 1.5rem;
    }
    .brand-logo {
        font-size: 2.2rem;
    }
    .brand-name {
        font-size: 1.25rem;
        font-weight: 700;
        color: #e2e8f0;
        letter-spacing: -0.02em;
    }
    .brand-tagline {
        font-size: 0.72rem;
        color: #64748b;
        letter-spacing: 0.05em;
        text-transform: uppercase;
        margin-top: 2px;
    }

    /* ── Role Badge ───────────────────────────────────────────── */
    .role-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 6px 14px;
        border-radius: 50px;
        font-size: 0.82rem;
        font-weight: 600;
        letter-spacing: 0.01em;
        border: 1px solid;
        margin-bottom: 0.5rem;
    }

    /* ── User Info Card ───────────────────────────────────────── */
    .user-card {
        background: rgba(255,255,255,0.03);
        border: 1px solid rgba(255,255,255,0.07);
        border-radius: 12px;
        padding: 1rem 1.25rem;
        margin-bottom: 1rem;
    }
    .user-card-name {
        font-size: 0.95rem;
        font-weight: 600;
        color: #e2e8f0;
        margin-bottom: 4px;
    }
    .user-card-role {
        font-size: 0.78rem;
        color: #94a3b8;
    }

    /* ── Access Permissions Panel ─────────────────────────────── */
    .access-panel {
        background: rgba(255,255,255,0.02);
        border: 1px solid rgba(255,255,255,0.06);
        border-radius: 10px;
        padding: 0.85rem 1rem;
        margin-bottom: 1rem;
    }
    .access-panel-title {
        font-size: 0.72rem;
        font-weight: 600;
        color: #64748b;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        margin-bottom: 8px;
    }
    .access-item {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 0.8rem;
        color: #94a3b8;
        padding: 3px 0;
    }
    .access-dot-allowed { color: #22c55e; font-size: 0.6rem; }
    .access-dot-denied  { color: #374151; font-size: 0.6rem; }

    /* ── Login Page ───────────────────────────────────────────── */
    .login-container {
        max-width: 460px;
        margin: 0 auto;
        padding-top: 4rem;
    }
    .login-header {
        text-align: center;
        margin-bottom: 2.5rem;
    }
    .login-logo {
        font-size: 4rem;
        margin-bottom: 1rem;
    }
    .login-title {
        font-size: 2rem;
        font-weight: 800;
        color: #f1f5f9;
        letter-spacing: -0.03em;
        margin-bottom: 0.5rem;
    }
    .login-subtitle {
        font-size: 0.9rem;
        color: #64748b;
    }
    .login-card {
        background: rgba(255,255,255,0.03);
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 20px;
        padding: 2rem 2.25rem;
        backdrop-filter: blur(20px);
    }

    /* ── Input Styling ────────────────────────────────────────── */
    [data-testid="stTextInput"] input,
    [data-testid="stTextInput"] input:focus {
        background: rgba(255,255,255,0.04) !important;
        border: 1px solid rgba(255,255,255,0.1) !important;
        border-radius: 10px !important;
        color: #e2e8f0 !important;
        font-family: 'Inter', sans-serif !important;
        font-size: 0.9rem !important;
        padding: 0.6rem 0.9rem !important;
    }
    [data-testid="stTextInput"] input:focus {
        border-color: rgba(99,102,241,0.5) !important;
        box-shadow: 0 0 0 3px rgba(99,102,241,0.15) !important;
    }
    [data-testid="stTextInput"] label {
        color: #94a3b8 !important;
        font-size: 0.82rem !important;
        font-weight: 500 !important;
    }

    /* ── Buttons ──────────────────────────────────────────────── */
    .stButton > button {
        background: linear-gradient(135deg, #6366f1, #8b5cf6) !important;
        color: white !important;
        border: none !important;
        border-radius: 10px !important;
        font-weight: 600 !important;
        font-family: 'Inter', sans-serif !important;
        font-size: 0.9rem !important;
        padding: 0.65rem 1.5rem !important;
        width: 100% !important;
        transition: all 0.2s ease !important;
        letter-spacing: 0.01em !important;
    }
    .stButton > button:hover {
        transform: translateY(-1px) !important;
        box-shadow: 0 8px 25px rgba(99,102,241,0.4) !important;
    }
    .stButton > button:active {
        transform: translateY(0) !important;
    }

    /* ── Demo Users Table ─────────────────────────────────────── */
    .demo-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.78rem;
        margin-top: 0.5rem;
    }
    .demo-table th {
        color: #64748b;
        font-weight: 500;
        text-align: left;
        padding: 4px 8px;
        border-bottom: 1px solid rgba(255,255,255,0.05);
    }
    .demo-table td {
        color: #94a3b8;
        padding: 4px 8px;
    }
    .demo-table code {
        background: rgba(99,102,241,0.12);
        color: #a5b4fc;
        padding: 1px 5px;
        border-radius: 4px;
        font-size: 0.75rem;
    }

    /* ── Chat Messages ────────────────────────────────────────── */
    .chat-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1rem 0 0.75rem 0;
        border-bottom: 1px solid rgba(255,255,255,0.06);
        margin-bottom: 1.25rem;
    }
    .chat-title {
        font-size: 1.3rem;
        font-weight: 700;
        color: #f1f5f9;
        letter-spacing: -0.02em;
    }
    .chat-subtitle {
        font-size: 0.78rem;
        color: #64748b;
        margin-top: 2px;
    }

    /* ── Message Bubbles ──────────────────────────────────────── */
    .msg-user {
        display: flex;
        justify-content: flex-end;
        margin: 0.75rem 0;
    }
    .msg-user-bubble {
        background: linear-gradient(135deg, #6366f1, #8b5cf6);
        color: white;
        border-radius: 18px 18px 4px 18px;
        padding: 0.75rem 1.1rem;
        max-width: 70%;
        font-size: 0.88rem;
        line-height: 1.5;
        box-shadow: 0 4px 15px rgba(99,102,241,0.3);
    }
    .msg-bot {
        display: flex;
        justify-content: flex-start;
        margin: 0.75rem 0;
        gap: 10px;
    }
    .msg-bot-avatar {
        width: 34px;
        height: 34px;
        background: linear-gradient(135deg, rgba(99,102,241,0.2), rgba(168,85,247,0.2));
        border: 1px solid rgba(99,102,241,0.3);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1rem;
        flex-shrink: 0;
        margin-top: 2px;
    }
    .msg-bot-content {
        max-width: 80%;
    }
    .msg-bot-bubble {
        background: rgba(255,255,255,0.04);
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 4px 18px 18px 18px;
        padding: 0.85rem 1.1rem;
        font-size: 0.88rem;
        color: #cbd5e1;
        line-height: 1.65;
    }
    .msg-timestamp {
        font-size: 0.68rem;
        color: #475569;
        margin-top: 4px;
        padding: 0 4px;
    }

    /* ── Source Cards ─────────────────────────────────────────── */
    .sources-wrapper {
        margin-top: 0.5rem;
    }
    .source-card {
        background: rgba(99,102,241,0.05);
        border: 1px solid rgba(99,102,241,0.15);
        border-radius: 10px;
        padding: 0.65rem 0.9rem;
        margin-bottom: 0.4rem;
        font-size: 0.78rem;
    }
    .source-card-header {
        display: flex;
        align-items: center;
        gap: 6px;
        margin-bottom: 4px;
    }
    .source-file {
        font-weight: 600;
        color: #a5b4fc;
    }
    .source-dept {
        color: #64748b;
        font-size: 0.72rem;
    }
    .source-preview {
        color: #64748b;
        font-size: 0.74rem;
        line-height: 1.5;
        margin-top: 4px;
    }

    /* ── Suggestion Chips ─────────────────────────────────────── */
    .suggestions-row {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-bottom: 1.25rem;
    }
    .suggestion-chip {
        background: rgba(99,102,241,0.08);
        border: 1px solid rgba(99,102,241,0.2);
        border-radius: 50px;
        padding: 5px 14px;
        font-size: 0.78rem;
        color: #a5b4fc;
        cursor: pointer;
        transition: all 0.2s ease;
    }
    .suggestion-chip:hover {
        background: rgba(99,102,241,0.18);
        border-color: rgba(99,102,241,0.4);
    }

    /* ── Chat Input Area ──────────────────────────────────────── */
    .stChatInputContainer {
        background: rgba(255,255,255,0.03) !important;
        border: 1px solid rgba(255,255,255,0.08) !important;
        border-radius: 14px !important;
    }
    [data-testid="stChatInput"] {
        background: transparent !important;
    }
    [data-testid="stChatInput"] textarea {
        background: transparent !important;
        color: #e2e8f0 !important;
        font-family: 'Inter', sans-serif !important;
        font-size: 0.9rem !important;
    }

    /* ── Empty State ──────────────────────────────────────────── */
    .empty-state {
        text-align: center;
        padding: 4rem 2rem;
        color: #475569;
    }
    .empty-state-icon {
        font-size: 3.5rem;
        margin-bottom: 1rem;
        opacity: 0.6;
    }
    .empty-state-title {
        font-size: 1.1rem;
        font-weight: 600;
        color: #64748b;
        margin-bottom: 0.5rem;
    }
    .empty-state-text {
        font-size: 0.82rem;
        color: #374151;
        line-height: 1.6;
    }

    /* ── Divider ──────────────────────────────────────────────── */
    .section-divider {
        border: none;
        border-top: 1px solid rgba(255,255,255,0.05);
        margin: 1rem 0;
    }

    /* ── Scrollbar ────────────────────────────────────────────── */
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
    ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }

    /* ── Streamlit Alert Override ─────────────────────────────── */
    .stAlert {
        background: rgba(239,68,68,0.1) !important;
        border: 1px solid rgba(239,68,68,0.25) !important;
        border-radius: 10px !important;
        color: #fca5a5 !important;
    }

    /* ── Selectbox (login demo) ───────────────────────────────── */
    [data-testid="stSelectbox"] > div > div {
        background: rgba(255,255,255,0.04) !important;
        border: 1px solid rgba(255,255,255,0.1) !important;
        border-radius: 10px !important;
        color: #e2e8f0 !important;
    }

    /* ── Spinner ──────────────────────────────────────────────── */
    .stSpinner > div {
        border-color: #6366f1 transparent transparent !important;
    }

    /* ── Expander ─────────────────────────────────────────────── */
    .streamlit-expanderHeader {
        background: rgba(99,102,241,0.05) !important;
        border: 1px solid rgba(99,102,241,0.15) !important;
        border-radius: 8px !important;
        color: #a5b4fc !important;
        font-size: 0.8rem !important;
    }
    .streamlit-expanderContent {
        background: rgba(99,102,241,0.03) !important;
        border: 1px solid rgba(99,102,241,0.1) !important;
        border-top: none !important;
        border-radius: 0 0 8px 8px !important;
    }
</style>
""", unsafe_allow_html=True)


# ── Role Configuration ────────────────────────────────────────────────────────

ROLE_CONFIG = {
    "finance": {
        "color": "#22c55e",
        "emoji": "💰",
        "label": "Finance Team",
        "collections": ["Finance Data", "General Info"],
        "suggestions": [
            "What was our total revenue in 2024?",
            "Show me the net profit margin for Q4 2024",
            "What's the marketing budget breakdown?",
            "How much was spent on equipment in 2024?",
            "What are the reimbursement policy limits?",
        ],
    },
    "marketing": {
        "color": "#f97316",
        "emoji": "📈",
        "label": "Marketing Team",
        "collections": ["Marketing Data", "General Info"],
        "suggestions": [
            "What was our NPS score in 2024?",
            "Which campaign had the highest ROI?",
            "What were the top sales metrics last year?",
            "How did the Analytics v3 launch perform?",
            "What is our customer churn rate?",
        ],
    },
    "hr": {
        "color": "#a855f7",
        "emoji": "👥",
        "label": "HR Team",
        "collections": ["HR Data", "General Info"],
        "suggestions": [
            "What is the headcount by department?",
            "Show the payroll breakdown for 2024",
            "What is our company attrition rate?",
            "Who were the top performers in H2 2024?",
            "What is the attendance rate by department?",
        ],
    },
    "engineering": {
        "color": "#3b82f6",
        "emoji": "⚙️",
        "label": "Engineering Dept",
        "collections": ["Engineering Data", "General Info"],
        "suggestions": [
            "What tech stack does FinSolve use?",
            "What is our CI/CD deployment process?",
            "What are the P0 incident response procedures?",
            "What is the SLA for production uptime?",
            "How many engineers are in each squad?",
        ],
    },
    "executive": {
        "color": "#eab308",
        "emoji": "👑",
        "label": "C-Level Executive",
        "collections": ["All Departments"],
        "suggestions": [
            "Give me a 2024 business overview",
            "What is our ARR and growth rate?",
            "How did all departments perform in 2024?",
            "What are the key risks and opportunities?",
            "Compare headcount vs revenue growth",
        ],
    },
    "employee": {
        "color": "#94a3b8",
        "emoji": "🏢",
        "label": "Employee",
        "collections": ["General Info Only"],
        "suggestions": [
            "What is the leave policy?",
            "When are the upcoming company events?",
            "How do I apply for reimbursement?",
            "What are FinSolve's core values?",
            "What tools does the company use?",
        ],
    },
}

ACCESS_MAP = {
    "finance": {"Finance": True, "Marketing": True, "HR": False, "Engineering": False, "General": True},
    "marketing": {"Finance": False, "Marketing": True, "HR": False, "Engineering": False, "General": True},
    "hr": {"Finance": False, "Marketing": False, "HR": True, "Engineering": False, "General": True},
    "engineering": {"Finance": False, "Marketing": False, "HR": False, "Engineering": True, "General": True},
    "executive": {"Finance": True, "Marketing": True, "HR": True, "Engineering": True, "General": True},
    "employee": {"Finance": False, "Marketing": False, "HR": False, "Engineering": False, "General": True},
}

DEMO_USERS = [
    ("alice_finance", "finance123", "finance"),
    ("bob_marketing", "marketing123", "marketing"),
    ("carol_hr", "hr123", "hr"),
    ("dave_eng", "eng123", "engineering"),
    ("tony_cto", "executive123", "executive"),
    ("employee1", "employee123", "employee"),
]


# ── Session State ─────────────────────────────────────────────────────────────

def init_session():
    defaults = {
        "authenticated": False,
        "token": None,
        "role": None,
        "username": None,
        "role_color": None,
        "role_emoji": None,
        "display_name": None,
        "messages": [],
        "prefill_query": "",
    }
    for key, val in defaults.items():
        if key not in st.session_state:
            st.session_state[key] = val


# ── API Helpers ───────────────────────────────────────────────────────────────

def api_login(username: str, password: str) -> dict | None:
    try:
        response = requests.post(
            f"{BACKEND_URL}/auth/login",
            data={"username": username, "password": password},
            timeout=10,
        )
        if response.status_code == 200:
            return response.json()
        return None
    except requests.exceptions.ConnectionError:
        st.error("❌ Cannot connect to the backend. Make sure the FastAPI server is running.")
        return None
    except Exception as e:
        st.error(f"❌ Login error: {str(e)}")
        return None


def api_chat(message: str, token: str) -> dict | None:
    try:
        response = requests.post(
            f"{BACKEND_URL}/chat",
            json={"message": message},
            headers={"Authorization": f"Bearer {token}"},
            timeout=60,
        )
        if response.status_code == 200:
            return response.json()
        elif response.status_code == 401:
            st.error("Session expired. Please log in again.")
            logout()
            return None
        else:
            return {"answer": f"Error {response.status_code}: {response.text}", "sources": []}
    except requests.exceptions.Timeout:
        return {"answer": "⏱️ The response took too long. Please try again.", "sources": []}
    except requests.exceptions.ConnectionError:
        return {"answer": "❌ Cannot reach the backend. Is the FastAPI server running?", "sources": []}
    except Exception as e:
        return {"answer": f"❌ Unexpected error: {str(e)}", "sources": []}


def logout():
    for key in ["authenticated", "token", "role", "username", "role_color", "role_emoji", "display_name", "messages", "prefill_query"]:
        st.session_state[key] = None if key not in ["authenticated", "messages"] else (False if key == "authenticated" else [])
    st.rerun()


# ── Login Page ────────────────────────────────────────────────────────────────

def render_login_page():
    st.markdown('<div class="login-container">', unsafe_allow_html=True)

    # Header
    st.markdown("""
    <div class="login-header">
        <div class="login-logo">🏦</div>
        <div class="login-title">FinSolve AI</div>
        <div class="login-subtitle">Role-Based Intelligent Knowledge Assistant</div>
    </div>
    """, unsafe_allow_html=True)

    # Login card
    st.markdown('<div class="login-card">', unsafe_allow_html=True)

    with st.form("login_form", clear_on_submit=False):
        st.markdown('<p style="font-size:0.82rem;color:#94a3b8;font-weight:500;margin-bottom:4px;">USERNAME</p>', unsafe_allow_html=True)
        username = st.text_input("Username", label_visibility="collapsed", placeholder="Enter your username")

        st.markdown('<p style="font-size:0.82rem;color:#94a3b8;font-weight:500;margin:8px 0 4px 0;">PASSWORD</p>', unsafe_allow_html=True)
        password = st.text_input("Password", type="password", label_visibility="collapsed", placeholder="Enter your password")

        st.markdown("<br/>", unsafe_allow_html=True)
        submitted = st.form_submit_button("Sign In  →")

        if submitted:
            if not username or not password:
                st.error("Please enter both username and password.")
            else:
                with st.spinner("Authenticating..."):
                    result = api_login(username, password)
                if result:
                    st.session_state.authenticated = True
                    st.session_state.token = result["access_token"]
                    st.session_state.role = result["role"]
                    st.session_state.username = result["username"]
                    st.session_state.role_color = result["role_color"]
                    st.session_state.role_emoji = result["role_emoji"]
                    st.session_state.display_name = result["display_name"]
                    st.session_state.messages = []
                    st.rerun()
                else:
                    st.error("Invalid credentials. Check username and password.")

    st.markdown('</div>', unsafe_allow_html=True)  # close login-card

    # Demo users
    st.markdown("<br/>", unsafe_allow_html=True)
    st.markdown("""
    <div style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);
                border-radius:12px;padding:1rem 1.25rem;">
        <p style="font-size:0.72rem;color:#64748b;font-weight:600;
                  text-transform:uppercase;letter-spacing:0.08em;margin-bottom:10px;">
            Demo Credentials
        </p>
        <table class="demo-table">
            <tr>
                <th>Username</th><th>Password</th><th>Role</th>
            </tr>
            <tr><td><code>alice_finance</code></td><td><code>finance123</code></td><td>💰 Finance</td></tr>
            <tr><td><code>bob_marketing</code></td><td><code>marketing123</code></td><td>📈 Marketing</td></tr>
            <tr><td><code>carol_hr</code></td><td><code>hr123</code></td><td>👥 HR</td></tr>
            <tr><td><code>dave_eng</code></td><td><code>eng123</code></td><td>⚙️ Engineering</td></tr>
            <tr><td><code>tony_cto</code></td><td><code>executive123</code></td><td>👑 C-Level Exec</td></tr>
            <tr><td><code>employee1</code></td><td><code>employee123</code></td><td>🏢 Employee</td></tr>
        </table>
    </div>
    """, unsafe_allow_html=True)

    st.markdown('</div>', unsafe_allow_html=True)  # close login-container


# ── Sidebar ───────────────────────────────────────────────────────────────────

def render_sidebar():
    role = st.session_state.role
    username = st.session_state.username
    color = st.session_state.role_color
    emoji = st.session_state.role_emoji
    display = st.session_state.display_name
    config = ROLE_CONFIG.get(role, {})

    with st.sidebar:
        # Brand
        st.markdown("""
        <div class="brand-header">
            <div class="brand-logo">🏦</div>
            <div>
                <div class="brand-name">FinSolve AI</div>
                <div class="brand-tagline">RBAC Knowledge Assistant</div>
            </div>
        </div>
        """, unsafe_allow_html=True)

        # User card
        st.markdown(f"""
        <div class="user-card">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
                <div style="width:38px;height:38px;background:linear-gradient(135deg,{color}33,{color}11);
                            border:1px solid {color}44;border-radius:50%;display:flex;
                            align-items:center;justify-content:center;font-size:1.2rem;">
                    {emoji}
                </div>
                <div>
                    <div class="user-card-name">{username}</div>
                    <div class="user-card-role">{display}</div>
                </div>
            </div>
            <div class="role-badge" style="color:{color};border-color:{color}44;background:{color}11;">
                {emoji} {display}
            </div>
        </div>
        """, unsafe_allow_html=True)

        # Access permissions
        access = ACCESS_MAP.get(role, {})
        access_items = ""
        for dept, allowed in access.items():
            dot = f'<span class="access-dot-allowed">●</span>' if allowed else f'<span class="access-dot-denied">●</span>'
            color_text = "#e2e8f0" if allowed else "#374151"
            access_items += f'<div class="access-item">{dot} <span style="color:{color_text}">{dept}</span></div>'

        st.markdown(f"""
        <div class="access-panel">
            <div class="access-panel-title">Data Access Permissions</div>
            {access_items}
        </div>
        """, unsafe_allow_html=True)

        # Conversation controls
        st.markdown('<hr class="section-divider"/>', unsafe_allow_html=True)

        col1, col2 = st.columns(2)
        with col1:
            if st.button("🗑️ Clear Chat", use_container_width=True):
                st.session_state.messages = []
                st.rerun()
        with col2:
            if st.button("🚪 Sign Out", use_container_width=True):
                logout()

        # Stats
        st.markdown('<hr class="section-divider"/>', unsafe_allow_html=True)
        msg_count = len(st.session_state.messages)
        user_msgs = sum(1 for m in st.session_state.messages if m["role"] == "user")
        st.markdown(f"""
        <div style="display:flex;gap:12px;padding:4px 0;">
            <div style="flex:1;text-align:center;background:rgba(255,255,255,0.02);
                        border:1px solid rgba(255,255,255,0.05);border-radius:8px;padding:8px 4px;">
                <div style="font-size:1.2rem;font-weight:700;color:#e2e8f0;">{user_msgs}</div>
                <div style="font-size:0.68rem;color:#475569;margin-top:2px;">Queries</div>
            </div>
            <div style="flex:1;text-align:center;background:rgba(255,255,255,0.02);
                        border:1px solid rgba(255,255,255,0.05);border-radius:8px;padding:8px 4px;">
                <div style="font-size:1.2rem;font-weight:700;color:#e2e8f0;">{len(config.get('collections', []))}</div>
                <div style="font-size:0.68rem;color:#475569;margin-top:2px;">Sources</div>
            </div>
        </div>
        """, unsafe_allow_html=True)

        # Info
        st.markdown('<hr class="section-divider"/>', unsafe_allow_html=True)
        st.markdown("""
        <div style="font-size:0.72rem;color:#374151;line-height:1.7;padding:0 2px;">
            🔒 Powered by RAG + ChromaDB<br/>
            🤖 LLM: Google Gemini 1.5 Flash<br/>
            📊 Embeddings: MiniLM-L6-v2
        </div>
        """, unsafe_allow_html=True)


# ── Chat Page ─────────────────────────────────────────────────────────────────

def render_message(msg: dict):
    role_val = msg["role"]
    content = msg["content"]
    timestamp = msg.get("timestamp", "")
    sources = msg.get("sources", [])

    if role_val == "user":
        st.markdown(f"""
        <div class="msg-user">
            <div class="msg-user-bubble">{content}</div>
        </div>
        <div style="text-align:right;">
            <span class="msg-timestamp">{timestamp}</span>
        </div>
        """, unsafe_allow_html=True)
    else:
        st.markdown(f"""
        <div class="msg-bot">
            <div class="msg-bot-avatar">🤖</div>
            <div class="msg-bot-content">
                <div class="msg-bot-bubble">{content}</div>
            </div>
        </div>
        <span class="msg-timestamp">{timestamp}</span>
        """, unsafe_allow_html=True)

        # Render sources as expander
        if sources:
            with st.expander(f"📚 {len(sources)} Source{'s' if len(sources) > 1 else ''} Referenced", expanded=False):
                for src in sources:
                    st.markdown(f"""
                    <div class="source-card">
                        <div class="source-card-header">
                            <span>📄</span>
                            <span class="source-file">{src.get('source_file', 'Unknown')}</span>
                            <span class="source-dept">— {src.get('department', '')}</span>
                        </div>
                        <div class="source-preview">{src.get('content_preview', '')}</div>
                    </div>
                    """, unsafe_allow_html=True)


def render_chat_page():
    role = st.session_state.role
    color = st.session_state.role_color
    emoji = st.session_state.role_emoji
    display = st.session_state.display_name
    config = ROLE_CONFIG.get(role, {})

    render_sidebar()

    # Chat header
    st.markdown(f"""
    <div class="chat-header">
        <div>
            <div class="chat-title">FinSolve AI Assistant</div>
            <div class="chat-subtitle">Secure, role-based knowledge retrieval powered by RAG</div>
        </div>
        <div class="role-badge" style="color:{color};border-color:{color}44;background:{color}11;">
            {emoji} {display}
        </div>
    </div>
    """, unsafe_allow_html=True)

    # Messages area
    messages = st.session_state.messages
    chat_container = st.container()

    with chat_container:
        if not messages:
            # Empty state with suggestions
            st.markdown(f"""
            <div class="empty-state">
                <div class="empty-state-icon">{emoji}</div>
                <div class="empty-state-title">Hello! How can I help you today?</div>
                <div class="empty-state-text">
                    I have access to your <strong style="color:{color}">{display}</strong> data.<br/>
                    Ask me anything about your department's information.
                </div>
            </div>
            """, unsafe_allow_html=True)

            # Suggestion chips
            suggestions = config.get("suggestions", [])
            if suggestions:
                st.markdown('<p style="text-align:center;font-size:0.78rem;color:#475569;margin-bottom:8px;">Try asking:</p>', unsafe_allow_html=True)
                cols = st.columns(min(len(suggestions), 3))
                for i, (col, suggestion) in enumerate(zip(cols * 3, suggestions[:3])):
                    with col:
                        if st.button(f"💬 {suggestion[:40]}{'...' if len(suggestion) > 40 else ''}", key=f"sug_{i}", use_container_width=True):
                            st.session_state.prefill_query = suggestion
                            st.rerun()

                if len(suggestions) > 3:
                    cols2 = st.columns(min(len(suggestions) - 3, 3))
                    for i, (col, suggestion) in enumerate(zip(cols2 * 3, suggestions[3:6])):
                        with col:
                            if st.button(f"💬 {suggestion[:40]}{'...' if len(suggestion) > 40 else ''}", key=f"sug_{i+3}", use_container_width=True):
                                st.session_state.prefill_query = suggestion
                                st.rerun()
        else:
            for msg in messages:
                render_message(msg)

    # Chat input
    prefill = st.session_state.get("prefill_query", "")
    user_input = st.chat_input(
        f"Ask FinSolve AI anything ({display} access)...",
        key="chat_input",
    )

    # Handle prefill or actual input
    query = None
    if prefill:
        query = prefill
        st.session_state.prefill_query = ""
    elif user_input:
        query = user_input

    if query:
        timestamp = datetime.now().strftime("%I:%M %p")

        # Add user message
        st.session_state.messages.append({
            "role": "user",
            "content": query,
            "timestamp": timestamp,
        })

        # Get bot response
        with st.spinner("🔍 Searching knowledge base..."):
            result = api_chat(query, st.session_state.token)

        if result:
            bot_timestamp = datetime.now().strftime("%I:%M %p")
            st.session_state.messages.append({
                "role": "assistant",
                "content": result.get("answer", "No response received."),
                "timestamp": bot_timestamp,
                "sources": result.get("sources", []),
                "collections": result.get("collections_searched", []),
            })

        st.rerun()


# ── Main App ──────────────────────────────────────────────────────────────────

def main():
    init_session()

    if not st.session_state.authenticated:
        render_login_page()
    else:
        render_chat_page()


if __name__ == "__main__":
    main()
