import api from "./axios";

const SKILLS = "/skills";

export type UserSkillProgress = {
  course_id: number;
  selected_path_id: number | null;
  selected_language: "english" | "bangla" | "hindi";
  completed_sub_map_ids: number[];
  last_accessed_at?: string | null;
  last_activity_at?: string | null;
};

export async function getUserSkillProgress(
  courseId: number
): Promise<UserSkillProgress> {
  const { data } = await api.get<UserSkillProgress>(
    `${SKILLS}/courses/${courseId}/user-progress/`
  );
  return data;
}

export async function saveUserSkillProgress(
  courseId: number,
  payload: Partial<{
    selected_path_id: number | null;
    selected_language: "english" | "bangla" | "hindi";
    completed_sub_map_ids: number[];
    track_activity: boolean;
  }>
): Promise<UserSkillProgress> {
  const { data } = await api.post<UserSkillProgress>(
    `${SKILLS}/courses/${courseId}/user-progress/`,
    payload
  );
  return data;
}
