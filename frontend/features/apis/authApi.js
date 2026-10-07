import api from "../../lib/api";

export async function registerUser(data) {
  const response = await api.post("/auth/register", data);
  return response.data;
}

export async function loginUser(data) {
  const response = await api.post("/auth/login", data);
  return response.data;
}

export async function getCurrentUser(token) {
  const response = await api.get("/auth/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}