import api from "./axios";

const SKILLS = "/skills";

export type QuizQuestion = {
  id: number;
  order: number;
  question_text: string;
  options: string[];
};

export type QuizResponse = {
  roadmap_id: number;
  session_key: string;
  questions: QuizQuestion[];
};

export type SubmitQuizResponse = {
  passed: boolean;
  score: number;
  correct: number;
  total: number;
};

export async function getQuiz(roadmapId: number): Promise<QuizResponse> {
  const { data } = await api.get<QuizResponse>(
    `${SKILLS}/roadmaps/${roadmapId}/quiz/`
  );
  return data;
}

export async function submitQuiz(
  roadmapId: number,
  sessionKey: string,
  answers: number[]
): Promise<SubmitQuizResponse> {
  const { data } = await api.post<SubmitQuizResponse>(
    `${SKILLS}/roadmaps/${roadmapId}/quiz/submit/`,
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
