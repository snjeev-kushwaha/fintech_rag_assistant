/**
 * constants.js — Dynamic configuration fallbacks
 * All departmental roles, access maps, and metadata are loaded dynamically from the database.
 */

export const ROLE_CONFIG = {
  root: {
    color: '#ef4444',
    label: 'System Administrator',
    collections: ['System-wide Management'],
    suggestions: [],
  },
};

export const ACCESS_MAP = {};

export const DEMO_USERS = [];
