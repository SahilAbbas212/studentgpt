import API from "./axios";

export const askQuestion = async (question) => {
  const response = await API.post("/chat/", {
    question,
  });
  return response.data;
};