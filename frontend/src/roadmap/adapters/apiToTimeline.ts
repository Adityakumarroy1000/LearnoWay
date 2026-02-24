export function apiPathToTimeline(selectedPath: any, language: string) {
  if (!selectedPath) return { periods: [] };

  const langKey =
    language === "english"
      ? "English"
      : language === "bangla"
      ? "Bangla"
      : "Hindi";

  const periods = selectedPath.roadmaps.map((roadmap: any) => ({
    id: roadmap.id,
    title: roadmap.title,
    description: roadmap.micro_desc,
    duration: roadmap.duration,

    slides: roadmap.sub_maps.map((sub: any) => ({
      title: sub.title,
      text: sub.micro_desc,
    })),

    cards: roadmap.sub_maps.flatMap((sub: any) =>
      (sub.resources?.[langKey] || []).map((r: any) => ({
        front: r.link_type,
        back: r.link,
      }))
    ),

    quizId: roadmap.id,
    tools: roadmap.tools || [],
  }));

  return { periods };
}
