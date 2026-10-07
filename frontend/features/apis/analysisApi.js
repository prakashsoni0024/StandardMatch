import api from "../../lib/api";

export async function analyzePDF(file, token) {
  const formData = new FormData();

  formData.append("file", file, file.name);

  const response = await api.post("/analysis", formData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}

export async function getAnalyses(token) {
  const response = await api.get("/analysis", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}

export async function getAnalysisById(id, token) {
  const response = await api.get(`/analysis/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}

export async function downloadAnalysisPDF(id, token) {
  const response = await api.get(`/analysis/${id}/pdf`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    responseType: "blob",
  });

  return response.data;
}