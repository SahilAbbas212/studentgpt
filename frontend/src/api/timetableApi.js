import API from "./axios";

export const generateTimetable = async (
  subjects,
  hours_per_day,
  goal,
  syllabus,
  routine,
  preferences
) => {
  const response = await API.post("/timetable/", {
    subjects,
    hours_per_day,
    goal,
    syllabus,
    routine,
    preferences,
  });
  return response.data;
};

export const saveTimetable = async (timetable) => {
  const res = await API.post("/timetable/save", { timetable }, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
  });
  return res.data;
};

export const getSavedTimetable = async () => {
  const res = await API.get("/timetable/saved", {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
  });
  return res.data;
};