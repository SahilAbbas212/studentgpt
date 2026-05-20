import API from "./axios";

// ---------------- FILE UPLOAD ----------------

export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await API.post(
    "/api/upload/",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    }
  );

  return response.data;
};

// ---------------- GENERATE NOTES ----------------

export const generateNotes = async (text) => {
  const response = await API.post(
    "/api/notes/",
    { text }
  );

  return response.data;
};