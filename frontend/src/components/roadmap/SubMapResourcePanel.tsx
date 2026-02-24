import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  Play,
  ExternalLink,
  BookOpen,
  Globe,
  List,
  Zap,
  ChevronDown,
  Flame,
} from "lucide-react";

type SubMapResourcePanelProps = {
  subMaps: any[];
  selectedLanguage: string;
  completedSubMapIds: number[];
  setCompletedSubMapIds: React.Dispatch<React.SetStateAction<number[]>>;
  onOpenResource: (resource: any, groupResources: any[]) => void;
};

export default function SubMapResourcePanel({
  subMaps,
  selectedLanguage,
  completedSubMapIds,
  setCompletedSubMapIds,
  onOpenResource,
}: SubMapResourcePanelProps) {
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
  const [hoveredResource, setHoveredResource] = useState<string | null>(null);

  const toggleGroup = (id: number) => {
    const key = String(id);
    setExpandedGroups((prev) =>
      prev.includes(key) ? prev.filter((x) => x !== key) : [...prev, key]
    );
  };

  const toggleComplete = (id: number) => {
    setCompletedSubMapIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "Video":
        return <Play className="w-5 h-5 text-red-500" />;
      case "Playlist":
        return <List className="w-5 h-5 text-blue-500" />;
      case "Web-Docs":
        return <Globe className="w-5 h-5 text-green-500" />;
      case "One-Shot":
        return <Zap className="w-5 h-5 text-purple-500" />;
      case "PDF":
        return <BookOpen className="w-5 h-5 text-yellow-500" />;
      default:
        return <BookOpen className="w-5 h-5" />;
    }
  };

  const langKey =
    selectedLanguage === "bangla"
      ? "Bangla"
      : selectedLanguage === "hindi"
      ? "Hindi"
      : "English";

  // Calculate overall progress
  const totalProgress =
    subMaps.length > 0
      ? (completedSubMapIds.length / subMaps.length) * 100
      : 0;

  return (
    <>
      {/* Overall Progress Card */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-4 mb-6 border border-blue-200 dark:border-blue-800">
        <div className="flex items-center gap-3 mb-3">
          <Flame className="w-5 h-5 text-orange-500" />
          <span className="font-semibold text-gray-900 dark:text-white">
            Overall Progress
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Progress value={totalProgress} className="h-2 flex-1" />
          <span className="text-sm font-bold text-blue-600 dark:text-blue-400 min-w-fit">
            {Math.round(totalProgress)}%
          </span>
        </div>
      </div>

      {/* SubMaps List */}
      <div className="space-y-4">
        {subMaps.map((sub: any, idx: number) => {
          const resources = sub.resources?.[langKey] || [];
          const progress = completedSubMapIds.includes(sub.id) ? 100 : 0;
          const isCompleted = completedSubMapIds.includes(sub.id);
          const isExpanded = expandedGroups.includes(String(sub.id));

          return (
            <Card
              key={sub.id}
              className={`overflow-hidden transition-all duration-300 transform hover:shadow-lg ${
                isCompleted
                  ? "bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800"
                  : "hover:scale-105"
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-3 w-full">
                  {/* Completion Checkbox and Info */}
                  <div className="flex gap-3 sm:gap-4 flex-1 min-w-0 items-start">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleComplete(sub.id);
                      }}
                      className={`flex-shrink-0 w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all duration-300 transform hover:scale-110 mt-0.5 ${
                        isCompleted
                          ? "bg-gradient-to-br from-green-400 to-green-600 border-green-600 text-white shadow-lg shadow-green-500/50"
                          : "border-gray-300 dark:border-gray-600 hover:border-green-400 dark:hover:border-green-400"
                      }`}
                      aria-label="Mark as complete"
                    >
                      {isCompleted && <CheckCircle className="w-5 h-5" />}
                    </button>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <CardTitle
                          className={`text-base sm:text-lg leading-tight ${
                            isCompleted
                              ? "text-green-700 dark:text-green-300 line-through"
                              : "text-gray-900 dark:text-white"
                          }`}
                        >
                          {idx + 1}. {sub.title}
                        </CardTitle>
                        {isCompleted && (
                          <Badge className="bg-green-500 hover:bg-green-600 ml-auto sm:ml-0 text-xs">
                            Complete
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {sub.micro_desc || "No description"}
                      </p>

                      {/* Resource Stats */}
                      <div className="flex items-center gap-2 sm:gap-3 mt-3 flex-wrap w-full">
                        <Badge variant="secondary" className="text-xs sm:text-sm">
                          {resources.length} resource{resources.length !== 1 ? "s" : ""}
                        </Badge>
                        <div className="flex items-center gap-2 h-5 flex-1 min-w-[120px] sm:min-w-[180px]">
                          <Progress value={progress} className="w-full h-1.5" />
                          <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 min-w-fit">
                            {Math.round(progress)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expand Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleGroup(sub.id);
                    }}
                    className={`flex-shrink-0 transition-transform duration-300 ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                  >
                    <ChevronDown className="w-5 h-5" />
                  </Button>
                </div>
              </CardHeader>

              {/* Expandable Resources Section */}
              {isExpanded && (
                <CardContent className="space-y-3 pt-0 border-t dark:border-gray-700">
                  {resources.length === 0 ? (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                      No resources available
                    </p>
                  ) : (
                    resources.map((res: any, i: number) => (
                      <div
                        key={i}
                        onMouseEnter={() => setHoveredResource(`${sub.id}-${i}`)}
                        onMouseLeave={() => setHoveredResource(null)}
                        className={`border rounded-xl p-4 transition-all duration-300 transform ${
                          hoveredResource === `${sub.id}-${i}`
                            ? "scale-105 shadow-lg bg-white dark:bg-gray-700"
                            : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600"
                        }`}
                      >
                        {/* Resource Header */}
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                            {getIcon(res.link_type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="font-semibold text-gray-900 dark:text-white block text-sm">
                              {res.link_type}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              Resource {i + 1}
                            </span>
                          </div>
                        </div>

                        {/* Resource Title */}
                        {res.title && (
                          <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 font-medium">
                            {res.title}
                          </p>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-2 flex-wrap">
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenResource(res, resources);
                            }}
                            className="flex-1 sm:flex-none text-xs sm:text-sm"
                          >
                            <Play className="w-4 h-4 mr-1" /> Watch
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            asChild
                            className="flex-1 sm:flex-none text-xs sm:text-sm"
                          >
                            <a href={res.link} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-4 h-4 mr-1" />
                              Visit
                            </a>
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </>
  );
}
