import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  BookOpen,
  ChevronRight,
  Lock,
  X,
  Target,
} from "lucide-react";
import { timelineShift } from "@/roadmap/animation/timelineShift";
import { verticalLineAnimation, verticalLinePulse } from "@/roadmap/animation/verticalLine";
import SubMapResourcePanel from "@/components/roadmap/SubMapResourcePanel";
import StageExamModal from "@/components/StageExamModal";
import { getStageProgress } from "@/api/exam";

gsap.registerPlugin(ScrollTrigger);

type TimelineRendererProps = {
  pathId: number;
  roadmaps: any[];
  selectedLanguage: string;
  completedSubMapIds: number[];
  setCompletedSubMapIds: React.Dispatch<React.SetStateAction<number[]>>;
  onOpenResource: (resource: any, groupResources: any[]) => void;
};

export default function TimelineRenderer({
  pathId,
  roadmaps,
  selectedLanguage,
  completedSubMapIds,
  setCompletedSubMapIds,
  onOpenResource,
}: TimelineRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedRoadmap, setSelectedRoadmap] = useState<any>(null);
  const [detailsOpen, setDetailsOpen] = useState<boolean>(false);
  const [hoveredRoadmap, setHoveredRoadmap] = useState<string | null>(null);
  const [passedRoadmapIds, setPassedRoadmapIds] = useState<number[]>([]);
  const [examOpenForRoadmap, setExamOpenForRoadmap] = useState<any>(null);
  const [loadingStageProgress, setLoadingStageProgress] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoadingStageProgress(true);
    getStageProgress(pathId)
      .then((res) => {
        if (!cancelled) setPassedRoadmapIds(res.passed_roadmap_ids || []);
      })
      .catch(() => {
        if (!cancelled) setPassedRoadmapIds([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingStageProgress(false);
      });
    return () => {
      cancelled = true;
    };
  }, [pathId]);

  useEffect(() => {
    verticalLineAnimation();
    verticalLinePulse();

    const ctx = gsap.context(() => {
      // Animated bubble entrance with stagger
      const bubbles = gsap.utils.toArray<HTMLElement>(".timeline-bubble");
      bubbles.forEach((bubble, i) => {
        gsap.from(bubble, {
          scrollTrigger: {
            trigger: bubble,
            start: "top 85%",
          },
          y: 50,
          opacity: 0,
          duration: 0.7,
          delay: i * 0.15,
          ease: "back.out",
        });
      });

      // Number circle animation
      const circles = gsap.utils.toArray<HTMLElement>(".timeline-circle");
      circles.forEach((circle, i) => {
        gsap.from(circle, {
          scrollTrigger: {
            trigger: circle,
            start: "top 80%",
          },
          scale: 0,
          opacity: 0,
          duration: 0.6,
          delay: i * 0.15,
          ease: "back.out",
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const isRoadmapUnlocked = (roadmap: any, index: number) => {
    if (index === 0) return true;
    const prevRoadmap = roadmaps[index - 1];
    return passedRoadmapIds.includes(prevRoadmap?.id);
  };

  const handleRoadmapClick = (roadmap: any, isLeft: boolean, isUnlocked: boolean) => {
    if (!isUnlocked) return;
    const isSelecting = selectedRoadmap?.id !== roadmap.id;
    setSelectedRoadmap(isSelecting ? roadmap : null);
    setDetailsOpen(false);
    timelineShift(isSelecting, isLeft);
  };

  const handleStartClick = (roadmap: any, isLeft: boolean, isUnlocked: boolean) => {
    if (!isUnlocked) return;
    if (!selectedRoadmap || selectedRoadmap.id !== roadmap.id) {
      setSelectedRoadmap(roadmap);
      timelineShift(true, isLeft);
    }
    setDetailsOpen(true);
  };

  const allSubMaps = selectedRoadmap?.sub_maps || [];
  const completedSubMaps = allSubMaps.filter((sub: any) =>
    completedSubMapIds.includes(sub.id)
  ).length;
  const progress =
    allSubMaps.length > 0 ? (completedSubMaps / allSubMaps.length) * 100 : 0;

  return (
    <div className="relative w-full">
      {/* Timeline Container */}
      <div
        ref={containerRef}
        className="timeline-container relative w-full py-8 px-4 sm:px-6 md:px-8"
      >
        {/* Central Vertical Line */}
        <div className="vertical-line absolute left-1/2 top-0 bottom-0 transform -translate-x-1/2 w-1 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500 rounded-full z-0 hidden sm:block shadow-lg shadow-blue-500/50"></div>

        {/* Render Roadmaps */}
        {roadmaps.map((roadmap, roadmapIndex) => {
          const isLeft = roadmapIndex % 2 === 0;
          const number = roadmapIndex + 1;
          const isUnlocked = isRoadmapUnlocked(roadmap, roadmapIndex);
          const isPassed = passedRoadmapIds.includes(roadmap.id);
          const isSelected = selectedRoadmap?.id === roadmap.id;
          const showDetails = isSelected && detailsOpen;
          const isHovered = hoveredRoadmap === roadmap.id;

          return (
            <div
              key={roadmapIndex}
              className="timeline-bubble relative w-full py-6 sm:py-10 transition-all duration-300"
            >
              {/* Timeline Circle with Number - Always centered */}
              <div className="hidden sm:flex absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 will-change-transform">
                <div
                  className={`w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full border-4 border-white dark:border-gray-800 shadow-lg flex items-center justify-center text-white font-bold text-sm transition-all duration-300 flex-shrink-0 ${
                    isSelected
                      ? "ring-4 ring-blue-300 dark:ring-blue-500 scale-110 shadow-xl shadow-blue-500/50"
                      : "hover:scale-105"
                  }`}
                >
                  {number}
                </div>
              </div>

              {/* Roadmap Box - Left or Right */}
              <div
                className={`timeline-box-wrapper w-full sm:w-[calc(50%-1.5rem)] px-4 sm:px-6 flex ${
                  selectedRoadmap && isLeft ? "sm:ml-auto justify-end" : (isLeft ? "sm:mr-auto justify-start" : "sm:ml-auto justify-end")
                }`}
              >
                <div
                  onMouseEnter={() => setHoveredRoadmap(roadmap.id)}
                  onMouseLeave={() => setHoveredRoadmap(null)}
                  onClick={() => handleRoadmapClick(roadmap, isLeft, isUnlocked)}
                  className={`roadmap-box w-full max-w-sm p-5 sm:p-6 bg-white dark:bg-gradient-to-br dark:from-gray-700 dark:to-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 z-20 relative cursor-pointer transform ${
                    isSelected
                      ? "ring-2 ring-blue-500 shadow-2xl shadow-blue-500/30 scale-105"
                      : isHovered
                      ? "shadow-xl scale-105"
                      : ""
                  }`}
                >
                  {!isUnlocked && (
                    <div className="absolute inset-0 rounded-2xl bg-gray-900/40 flex items-center justify-center z-10">
                      <div className="px-3 py-2 rounded-lg bg-white/90 text-gray-800 text-xs font-semibold flex items-center gap-2">
                        <Lock className="w-3.5 h-3.5" />
                        Pass previous stage exam to unlock
                      </div>
                    </div>
                  )}
                  {showDetails ? (
                    // Details Content
                    <div onClick={(e) => e.stopPropagation()} className="space-y-5">
                      {/* Header */}
                      <div className="border-b dark:border-gray-600 pb-4">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                            {selectedRoadmap.title}
                          </h2>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDetailsOpen(false);
                            }}
                            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors flex-shrink-0"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">
                          {selectedRoadmap.micro_desc || "No description."}
                        </p>
                      </div>

                      {/* Progress Section */}
                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center gap-2 mb-2">
                          <Target className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          <span className="font-semibold text-gray-900 dark:text-white text-sm">
                            Progress
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Progress value={progress} className="h-2 flex-1" />
                          <span className="text-sm font-bold text-blue-600 dark:text-blue-400 min-w-fit">
                            {completedSubMaps}/{allSubMaps.length}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                          {Math.round(progress)}% complete
                        </p>
                      </div>

                      {/* Resources */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                          <BookOpen className="w-5 h-5 text-blue-600" />
                          Sessions & Resources
                        </h3>
                        <SubMapResourcePanel
                          subMaps={selectedRoadmap.sub_maps}
                          selectedLanguage={selectedLanguage}
                          completedSubMapIds={completedSubMapIds}
                          setCompletedSubMapIds={setCompletedSubMapIds}
                          onOpenResource={onOpenResource}
                        />
                      </div>

                      {/* Exam Action (bottom of box) */}
                      <div className="flex items-center justify-between rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 p-3">
                        <div className="text-sm text-gray-700 dark:text-gray-300">
                          {isPassed
                            ? "Stage passed. Next stage unlocked."
                            : "Pass this stage exam to unlock the next stage."}
                        </div>
                        <Button
                          size="sm"
                          onClick={() => setExamOpenForRoadmap(selectedRoadmap)}
                          disabled={isPassed}
                        >
                          {isPassed ? "Passed" : "Take Exam"}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // Preview Content
                    <>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex-shrink-0">
                          <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                          {roadmap.title}
                        </h3>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base mb-4">
                        {roadmap.micro_desc || "No description available."}
                      </p>

                      {/* Quick Stats */}
                      <div className="flex gap-2 flex-wrap mb-4">
                        <Badge
                          variant="secondary"
                          className="text-xs sm:text-sm"
                        >
                          {roadmap.sub_maps?.length || 0} sessions
                        </Badge>
                        <Badge variant="outline" className="text-xs sm:text-sm">
                          <Clock className="w-3 h-3 mr-1" />
                          {roadmap.duration || "TBD"}
                        </Badge>
                      </div>

                      {/* Action Button */}
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartClick(roadmap, isLeft, isUnlocked);
                        }}
                        disabled={!isUnlocked || loadingStageProgress}
                        className="w-full text-sm sm:text-base font-semibold bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        {isUnlocked ? "Start Learning" : "Locked"}
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {examOpenForRoadmap && (
        <StageExamModal
          roadmapId={examOpenForRoadmap.id}
          roadmapTitle={examOpenForRoadmap.title}
          onClose={() => setExamOpenForRoadmap(null)}
          onPass={(roadmapId) => {
            setPassedRoadmapIds((prev) =>
              prev.includes(roadmapId) ? prev : [...prev, roadmapId]
            );
          }}
        />
      )}
    </div>
  );
}
