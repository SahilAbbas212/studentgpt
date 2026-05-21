import API from "./axios";

export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await API.post(
    "/upload/",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    }
  );

  return response.data;
};

export const generateNotes = async (text) => {
  const response = await API.post(
    "/notes/",
    { text }
  );

  return response.data;
};