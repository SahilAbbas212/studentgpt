import API from "./axios";

export const loginUser = async (email, password) => {
  const response = await API.post("/auth/login", { email, password });
  return response.data;
};

export const sendOTP = async (name, email, password) => {
  const response = await API.post("/auth/send-otp", { name, email, password });
  return response.data;
};

export const verifyOTP = async (email, otp) => {
  const response = await API.post("/auth/verify-otp", { email, otp });
  return response.data;
};