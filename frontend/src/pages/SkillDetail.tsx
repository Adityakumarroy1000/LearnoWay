import TimelineRenderer from "@/roadmap/TimelineRenderer";

import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  Clock,
  Users,
  Star,
  ExternalLink,
  Play,
  BookOpen,
  Globe,
  List,
  Zap,
  Download,
  MessageCircle, // For "About This Skill" (bot-like icon)
  Briefcase, // For "Career Opportunities"
  Wrench, // For "Tools You'll Need"
  X, // For modal close button
  ChevronDown,
  Menu,
} from "lucide-react";
import SkillPathSelector from "@/components/SkillPathSelector";
import ResourceViewer from "@/components/ResourceViewer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CustomNav from "@/components/CustomNavbar";
import PageTransition from "@/core/PageTransition";
import {
  getUserSkillProgress,
  saveUserSkillProgress,
} from "@/api/skillProgress";

const SkillDetail = () => {
  const { id } = useParams();
  const [skill, setSkill] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedPath, setSelectedPath] = useState<any>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("english");
  const [completedSubMapIds, setCompletedSubMapIds] = useState<number[]>([]);
  const [selectedResource, setSelectedResource] = useState<any>(null);
  const [selectedStageResources, setSelectedStageResources] = useState<any[]>(
    []
  );

  // New state for first-load animation
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  // New state for modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<{
    title: string;
    content: any;
  } | null>(null);

  // State for mobile info menu
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hoveredIcon, setHoveredIcon] = useState<string | null>(null);

  // ✅ Fetch course data dynamically
  useEffect(() => {
    const fetchSkill = async () => {
      try {
        const res = await fetch(
          `http://127.0.0.1:8000/api/skills/courses/${id}/`
        );
        if (!res.ok) throw new Error("Failed to load skill data");
        const data = await res.json();

        // ✅ normalize: ensure skill.paths contains data
        const normalizedData = {
          ...data,
          paths:
            data.paths && data.paths.length > 0
              ? data.paths
              : data.path_items || [],
        };

        setSkill(normalizedData);
        const numericSkillId = Number(id);
        if (!Number.isNaN(numericSkillId)) {
          try {
            const saved = await getUserSkillProgress(numericSkillId);
            if (saved.selected_language) {
              setSelectedLanguage(saved.selected_language);
            }
            if (Array.isArray(saved.completed_sub_map_ids)) {
              setCompletedSubMapIds(saved.completed_sub_map_ids);
            }
            if (saved.selected_path_id) {
              const savedPath = (normalizedData.paths || []).find(
                (p: any) => p.id === saved.selected_path_id
              );
              if (savedPath) setSelectedPath(savedPath);
            }
          } catch {
            // If not authenticated yet, keep UI usable without progress sync.
          }
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
        // Mark first load as complete after data loads
        setTimeout(() => setIsFirstLoad(false), 100); // Small delay for smooth animation
      }
    };
    fetchSkill();
  }, [id]);

  // ✅ lock scroll when resource viewer is open
  useEffect(() => {
    if (selectedResource) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedResource]);

  const handlePathSelect = (pathId: string, language: string) => {
    const selected = skill?.paths?.find(
      (p: any) => p.id.toString() === pathId.toString()
    );
    setSelectedPath(selected || null);
    setSelectedLanguage(language);
    const numericSkillId = Number(id);
    if (!Number.isNaN(numericSkillId) && selected) {
      void saveUserSkillProgress(numericSkillId, {
        selected_path_id: selected.id,
        selected_language: language as "english" | "bangla" | "hindi",
        track_activity: true,
      }).catch(() => undefined);
    }
  };

  // New function to open modal with content
  const openModal = (title: string, content: any) => {
    setModalContent({ title, content });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalContent(null);
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case "Video":
        return <Play className="w-4 h-4 text-red-500" />;
      case "Playlist":
        return <List className="w-4 h-4 text-blue-500" />;
      case "Web-Docs":
        return <Globe className="w-4 h-4 text-green-500" />;
      case "One-Shot":
        return <Zap className="w-4 h-4 text-purple-500" />;
      case "PDF":
        return <BookOpen className="w-4 h-4 text-yellow-500" />;
      default:
        return <BookOpen className="w-4 h-4" />;
    }
  };

  const getLanguageDisplay = (lang: string) => {
    switch (lang) {
      case "bangla":
        return "বাংলা";
      case "hindi":
        return "हिंदी";
      default:
        return "English";
    }
  };

  const downloadRoadmapPDF = () => {
    const blob = new Blob([JSON.stringify(skill, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${skill.title.replace(/\s+/g, "_")}_Roadmap.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const openResourceViewer = (resource: any, groupResources: any[]) => {
    setSelectedResource(resource);
    setSelectedStageResources(groupResources);
    const numericSkillId = Number(id);
    if (!Number.isNaN(numericSkillId)) {
      void saveUserSkillProgress(numericSkillId, {
        track_activity: true,
      }).catch(() => undefined);
    }
  };

  const closeResourceViewer = () => {
    setSelectedResource(null);
    setSelectedStageResources([]);
  };

  const loadingView = (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">Loading skill details...</span>
      </div>
    </div>
  );

  const errorView = (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 px-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 max-w-md w-full">
        <div className="text-center">
          <div className="text-5xl mb-4">!</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Error</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">{error || "Skill not found"}</p>
          <Link to="/">
            <Button className="w-full">Go Back Home</Button>
          </Link>
        </div>
      </div>
    </div>
  );

  // ✅ Get all sub_maps for the selected path only
  const allSubMaps =
    selectedPath?.roadmaps?.flatMap((roadmap: any) => roadmap.sub_maps || []) ||
    [];

  // ✅ Find how many sub_maps are completed
  const completedSubMaps = allSubMaps.filter((sub: any) =>
    completedSubMapIds.includes(sub.id)
  ).length;

  // ✅ Calculate progress percentage (based on sub_maps)
  const progress =
    allSubMaps.length > 0 ? (completedSubMaps / allSubMaps.length) * 100 : 0;

  useEffect(() => {
    const numericSkillId = Number(id);
    if (Number.isNaN(numericSkillId)) return;
    if (!selectedPath && completedSubMapIds.length === 0) return;

    void saveUserSkillProgress(numericSkillId, {
      selected_path_id: selectedPath?.id ?? null,
      selected_language: selectedLanguage as "english" | "bangla" | "hindi",
      completed_sub_map_ids: completedSubMapIds,
      track_activity: false,
    }).catch(() => undefined);
  }, [id, selectedPath, selectedLanguage, completedSubMapIds]);

  if (loading) return loadingView;
  if (error || !skill) return errorView;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      {/* Navbar */}
      <CustomNav />

      {selectedResource && (
        <ResourceViewer
          resource={selectedResource}
          allResources={selectedStageResources}
          onClose={closeResourceViewer}
          onResourceChange={setSelectedResource}
        />
      )}
      <PageTransition />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Enhanced Header with Better Responsiveness */}
        <div className="skill-header bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 sm:p-8 mb-8 transform transition-all duration-300 hover:shadow-xl">
          <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 items-start">
            {/* Icon Section */}
            <div className="text-5xl sm:text-6xl flex-shrink-0 transform hover:scale-110 transition-transform duration-300 leading-none">
              {skill.icon}
            </div>

            {/* Content Section */}
            <div className="flex-1 w-full min-w-0">
              {/* Title and Badges */}
              <div className="flex flex-col gap-2 mb-4">
                <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 dark:text-white break-words leading-tight">
                  {skill.title}
                </h1>
                <div className="flex gap-2 flex-wrap items-center">
                  <Badge variant="secondary" className="text-xs sm:text-sm whitespace-nowrap">
                    {skill.level}
                  </Badge>
                  {selectedPath && (
                    <Badge variant="outline" className="flex items-center gap-1 text-xs sm:text-sm whitespace-nowrap">
                      <Globe className="w-3 h-3" />
                      {getLanguageDisplay(selectedLanguage)}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Description */}
              <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 mb-5 line-clamp-3">
                {skill.description}
              </p>

              {/* Stats Grid - Responsive */}
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mb-6 w-full">
                <StatItem icon={Users} label="Students" value={skill.students} />
                <StatItem icon={Clock} label="Duration" value={skill.duration} />
                <StatItem
                  icon={Star}
                  label="Rating"
                  value={`${skill.rating} ⭐`}
                />
                <StatItem icon={BookOpen} label="Category" value={skill.category} />
              </div>

              {/* Progress Section - Full Width on Mobile */}
              {selectedPath && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 mb-2">
                        <span className="font-medium">Progress</span>
                        <span className="font-semibold text-blue-600 dark:text-blue-400">
                          {completedSubMaps} / {allSubMaps.length}
                        </span>
                      </div>
                      <Progress
                        value={progress}
                        className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full shadow-sm"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {Math.round(progress)}% complete
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={downloadRoadmapPDF}
                      className="w-full sm:w-auto whitespace-nowrap shadow-md hover:shadow-lg transition-shadow"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {!selectedPath ? (
          <SkillPathSelector
            skillTitle={skill.title}
            path_items={skill.path_items}
            onPathSelect={handlePathSelect}
          />
        ) : (
          <div className="space-y-8">
            {/* Main Content with Responsive Layout */}
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Main Roadmap Section */}
              <div className="flex-1 roadmap-full-width bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 sm:p-8 transform transition-all duration-300 w-full">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                    Learning Roadmap
                  </h2>
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedPath(null)}
                      className="w-full sm:w-auto whitespace-nowrap"
                    >
                      Change Path
                    </Button>

                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-gray-600 dark:text-gray-300 flex-shrink-0" />
                      <Select
                        value={selectedLanguage}
                        onValueChange={setSelectedLanguage}
                      >
                        <SelectTrigger className="w-32 sm:w-auto">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="english">English</SelectItem>
                          <SelectItem value="bangla">বাংলা</SelectItem>
                          <SelectItem value="hindi">हिंदी</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="relative pl-6 overflow-x-auto">
                  <TimelineRenderer
                    pathId={selectedPath.id}
                    roadmaps={selectedPath.roadmaps}
                    selectedLanguage={selectedLanguage}
                    completedSubMapIds={completedSubMapIds}
                    setCompletedSubMapIds={setCompletedSubMapIds}
                    onOpenResource={openResourceViewer}
                  />
                </div>
              </div>

              {/* Info Icons Section - Responsive */}
              <div className="flex lg:flex-col gap-3 w-full lg:w-auto justify-center lg:justify-start overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0">
                <InfoButton
                  icon={MessageCircle}
                  label="About This Skill"
                  color="blue"
                  delay="0.1"
                  isFirstLoad={isFirstLoad}
                  onClick={() =>
                    openModal(
                      "About This Skill",
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        {skill.overview}
                      </p>
                    )
                  }
                />
                <InfoButton
                  icon={Briefcase}
                  label="Career Opportunities"
                  color="green"
                  delay="0.2"
                  isFirstLoad={isFirstLoad}
                  onClick={() =>
                    openModal(
                      "Career Opportunities",
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {skill.career_opportunities.map(
                          (career: string, index: number) => (
                            <div
                              key={index}
                              className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800"
                            >
                              <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0 mt-1.5"></div>
                              <span className="text-gray-700 dark:text-gray-300 text-sm">
                                {career}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    )
                  }
                />
                <InfoButton
                  icon={Wrench}
                  label="Tools You'll Need"
                  color="purple"
                  delay="0.3"
                  isFirstLoad={isFirstLoad}
                  onClick={() =>
                    openModal(
                      "Tools You'll Need",
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {skill.tools_needed.map((tool: string, index: number) => (
                          <div
                            key={index}
                            className="flex items-start gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800"
                          >
                            <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0 mt-1.5"></div>
                            <span className="text-gray-700 dark:text-gray-300 text-sm">
                              {tool}
                            </span>
                          </div>
                        ))}
                      </div>
                    )
                  }
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Modal with Animations */}
      {modalOpen && modalContent && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300"
          onClick={closeModal}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto transform transition-all duration-300 animate-in zoom-in slide-in-from-bottom-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white pr-4">
                {modalContent.title}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg flex-shrink-0"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="text-gray-700 dark:text-gray-300">
              {modalContent.content}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Helper Component: Stat Item
  function StatItem({
    icon: Icon,
    label,
    value,
  }: {
    icon: any;
    label: string;
    value: string | number;
  }) {
    return (
      <div className="flex items-center gap-3 p-3 sm:p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl border border-blue-200 dark:border-blue-700 hover:shadow-md transition-shadow">
        <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
        <div className="min-w-0">
          <p className="text-xs text-gray-600 dark:text-gray-400 font-medium uppercase tracking-wide">
            {label}
          </p>
          <p className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white truncate">
            {value}
          </p>
        </div>
      </div>
    );
  }

  // Helper Component: Info Button
  function InfoButton({
    icon: Icon,
    label,
    color,
    delay,
    isFirstLoad,
    onClick,
  }: {
    icon: any;
    label: string;
    color: string;
    delay: string;
    isFirstLoad: boolean;
    onClick: () => void;
  }) {
    const colorClasses = {
      blue: "bg-blue-500 hover:bg-blue-600 focus:ring-blue-300",
      green: "bg-green-500 hover:bg-green-600 focus:ring-green-300",
      purple: "bg-purple-500 hover:bg-purple-600 focus:ring-purple-300",
    };

    return (
      <div className="relative group">
        <button
          onClick={onClick}
          className={`w-12 h-12 lg:w-14 lg:h-14 ${colorClasses[color as keyof typeof colorClasses]} text-white rounded-full flex items-center justify-center transition-all duration-300 focus:outline-none focus:ring-2 shadow-lg hover:shadow-xl transform hover:scale-110 ${
            isFirstLoad
              ? "opacity-0 translate-y-4"
              : "opacity-100 translate-y-0"
          }`}
          style={{ transitionDelay: delay }}
          aria-label={label}
        >
          <Icon className="w-6 h-6" />
        </button>
        {/* Tooltip */}
        <div className="absolute left-full ml-3 px-3 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-40 shadow-lg">
          {label}
          <div className="absolute right-full mr-1 w-2 h-2 bg-gray-900 dark:bg-white transform -rotate-45"></div>
        </div>
      </div>
    );
  }
};

export default SkillDetail;
