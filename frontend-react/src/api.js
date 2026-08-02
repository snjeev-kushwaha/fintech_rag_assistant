/**
 * api.js — Re-exports services for backward compatibility
 */
export { apiLogin, apiGetMe, apiHealth } from './services/authService';
export {
  apiGetDepartments,
  apiCreateDepartment,
  apiUpdateDepartment,
  apiDeleteDepartment,
} from './services/departmentService';
export {
  apiGetUsers,
  apiCreateUser,
  apiUpdateUser,
  apiDeleteUser,
} from './services/userService';
export { apiChat } from './services/chatService';
