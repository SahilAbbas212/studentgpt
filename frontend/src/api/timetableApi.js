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