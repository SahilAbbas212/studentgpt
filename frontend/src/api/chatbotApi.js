import API from "./axios";

export const askQuestion = async (question) => {
  const response = await API.post("/api/chat/", {
    question,
  });
  return response.data;
};