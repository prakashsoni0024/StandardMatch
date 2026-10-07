import api from "../../lib/api";

export async function submitFeedback(
  analysisId,
  data,
  token
) {
  const response = await api.post(
    `/analysis/${analysisId}/feedback`,
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
}