import API from "./axios";

export const generateFlashcards = async (text) => {
  const response = await API.post("/api/flashcards/", { text });
  return response.data;
};