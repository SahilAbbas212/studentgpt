import API from "./axios";

export const generateQuiz = async (text, difficulty, count) => {
  const response = await API.post("/quiz/", {
    text,
    difficulty,
    count,
  });
  return response.data;
};