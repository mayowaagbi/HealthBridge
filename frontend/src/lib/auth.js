export const getAuthToken = () => localStorage.getItem("token");

export const saveAuthToken = (token) => {
  localStorage.setItem("token", token);
};

export const removeAuthToken = () => {
  localStorage.removeItem("token");
};

export const isAuthenticated = () => !!getAuthToken();
