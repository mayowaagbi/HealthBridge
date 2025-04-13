import api from "./apiAdapter";

const authAdapter = {
  login: async (credentials) => {
    const { data } = await api.post("/auth/login", credentials);
    return data;
  },

  logout: async () => {
    await api.post("/auth/logout");
  },

  refreshToken: async () => {
    const { data } = await api.post("/auth/refresh-token");
    return data;
  },

  register: async (userData) => {
    const { data } = await api.post("/auth/register", userData);
    return data;
  },

  getCurrentUser: async () => {
    const { data } = await api.get("/auth/me");
    return data;
  },
};

export default authAdapter;
