// Simple auth token management
// In production, integrate with your auth system (Clerk, Firebase, etc.)

export const authManager = {
  setToken: (token: string) => {
    localStorage.setItem("adminToken", token);
  },

  getToken: () => {
    return localStorage.getItem("adminToken");
  },

  clearToken: () => {
    localStorage.removeItem("adminToken");
  },

  isAuthenticated: () => {
    return !!localStorage.getItem("adminToken");
  },
};
