/**
 * constants.js — Role config, access map, and demo users
 * Mirrors the ROLE_CONFIG / ACCESS_MAP / DEMO_USERS from the Streamlit frontend
 */

export const ROLE_CONFIG = {
  finance: {
    color: '#22c55e',
    emoji: '💰',
    label: 'Finance Team',
    collections: ['Finance Data', 'General Info'],
    suggestions: [
      'What was our total revenue in 2024?',
      'Show me the net profit margin for Q4 2024',
      "What's the marketing budget breakdown?",
      'How much was spent on equipment in 2024?',
      'What are the reimbursement policy limits?',
    ],
  },
  marketing: {
    color: '#f97316',
    emoji: '📈',
    label: 'Marketing Team',
    collections: ['Marketing Data', 'General Info'],
    suggestions: [
      'What was our NPS score in 2024?',
      'Which campaign had the highest ROI?',
      'What were the top sales metrics last year?',
      'How did the Analytics v3 launch perform?',
      'What is our customer churn rate?',
    ],
  },
  hr: {
    color: '#a855f7',
    emoji: '👥',
    label: 'HR Team',
    collections: ['HR Data', 'General Info'],
    suggestions: [
      'What is the headcount by department?',
      'Show the payroll breakdown for 2024',
      'What is our company attrition rate?',
      'Who were the top performers in H2 2024?',
      'What is the attendance rate by department?',
    ],
  },
  engineering: {
    color: '#3b82f6',
    emoji: '⚙️',
    label: 'Engineering Dept',
    collections: ['Engineering Data', 'General Info'],
    suggestions: [
      'What tech stack does FinSolve use?',
      'What is our CI/CD deployment process?',
      'What are the P0 incident response procedures?',
      'What is the SLA for production uptime?',
      'How many engineers are in each squad?',
    ],
  },
  executive: {
    color: '#eab308',
    emoji: '👑',
    label: 'C-Level Executive',
    collections: ['All Departments'],
    suggestions: [
      'Give me a 2024 business overview',
      'What is our ARR and growth rate?',
      'How did all departments perform in 2024?',
      'What are the key risks and opportunities?',
      'Compare headcount vs revenue growth',
    ],
  },
  employee: {
    color: '#94a3b8',
    emoji: '🏢',
    label: 'Employee',
    collections: ['General Info Only'],
    suggestions: [
      'What is the leave policy?',
      'When are the upcoming company events?',
      'How do I apply for reimbursement?',
      "What are FinSolve's core values?",
      'What tools does the company use?',
    ],
  },
  root: {
    color: '#ef4444',
    emoji: '🔑',
    label: 'System Administrator',
    collections: ['System-wide Management'],
    suggestions: [],
  },
};

export const ACCESS_MAP = {
  finance:     { Finance: true,  Marketing: true,  HR: false, Engineering: false, General: true },
  marketing:   { Finance: false, Marketing: true,  HR: false, Engineering: false, General: true },
  hr:          { Finance: false, Marketing: false, HR: true,  Engineering: false, General: true },
  engineering: { Finance: false, Marketing: false, HR: false, Engineering: true,  General: true },
  executive:   { Finance: true,  Marketing: true,  HR: true,  Engineering: true,  General: true },
  employee:    { Finance: false, Marketing: false, HR: false, Engineering: false, General: true },
  root:        { Finance: true,  Marketing: true,  HR: true,  Engineering: true,  General: true },
};

export const DEMO_USERS = [];
