import api from "./axios";

const SKILLS = "/skills";

export type ExamQuestion = {
  id: number;
  order: number;
  type: "multiple_choice" | "short_answer";
  question_text: string;
  options?: string[];
};

export type ExamResponse = {
  roadmap_id: number;
  session_key: string;
  questions: ExamQuestion[];
};

export type ExamReviewItem = {
  question_id: number;
  order: number;
  type: "multiple_choice" | "short_answer";
  question_text: string;
  is_correct: boolean;
  selected_index?: number | null;
  selected_text?: string | null;
  correct_index?: number | null;
  correct_text?: string | null;
  user_answer?: string;
  expected_keywords?: string[];
};

export type SubmitExamResponse = {
  passed: boolean;
  score: number;
  correct: number;
  total: number;
  review?: ExamReviewItem[];
};

export async function getExam(roadmapId: number): Promise<ExamResponse> {
  const { data } = await api.get<ExamResponse>(
    `${SKILLS}/roadmaps/${roadmapId}/exam/`
  );
  return data;
}

export async function submitExam(
  roadmapId: number,
  sessionKey: string,
  answers: (number | string)[]
): Promise<SubmitExamResponse> {
  const { data } = await api.post<SubmitExamResponse>(
    `${SKILLS}/roadmaps/${roadmapId}/exam/submit/`,
    { session_key: sessionKey, answers }
  );
  return data;
}

export async function getStageProgress(
  pathId: number
): Promise<{ passed_roadmap_ids: number[] }> {
  const { data } = await api.get<{ passed_roadmap_ids: number[] }>(
    `${SKILLS}/paths/${pathId}/stage-progress/`
  );
  return data;
}

