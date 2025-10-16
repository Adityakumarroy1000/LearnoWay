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



const SkillDetail = () => {
  const { id } = useParams();
  const [skill, setSkill] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedPath, setSelectedPath] = useState<any>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("english");
  const [completedResources, setCompletedResources] = useState<string[]>([]);
  const [expandedResourceGroups, setExpandedResourceGroups] = useState<
    string[]
  >([]);
  const [selectedResource, setSelectedResource] = useState<any>(null);
  const [selectedStageResources, setSelectedStageResources] = useState<any[]>(
    []
  );

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
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSkill();
  }, [id]);

  const handlePathSelect = (pathId: string, language: string) => {
    const selected = skill?.paths?.find(
      (p: any) => p.id.toString() === pathId.toString()
    );
    setSelectedPath(selected || null);
    setSelectedLanguage(language);
  };

  const toggleResourceGroup = (groupId: string) => {
    setExpandedResourceGroups((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId]
    );
  };

  const toggleResourceCompletion = (resourceId: string) => {
    setCompletedResources((prev) =>
      prev.includes(resourceId)
        ? prev.filter((id) => id !== resourceId)
        : [...prev, resourceId]
    );
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
  };

  const closeResourceViewer = () => {
    setSelectedResource(null);
    setSelectedStageResources([]);
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen text-xl text-gray-600 dark:text-gray-300">
        Loading skill details...
      </div>
    );

  if (error || !skill)
    return (
      <div className="flex justify-center items-center min-h-screen text-xl text-red-500">
        Error: {error || "Skill not found"}
      </div>
    );

  // ✅ Flatten resources for progress
  const allResources =
    selectedPath?.roadmaps?.flatMap((r: any) =>
      r.sub_maps?.flatMap((s: any) => {
        const resData = s.resources || {};
        const langKey =
          selectedLanguage === "english"
            ? "English"
            : selectedLanguage === "bangla"
            ? "Bangla"
            : "Hindi";
        return resData[langKey]?.map((res: any, i: number) => ({
          id: `${s.id}-${i}`,
          ...res,
        }));
      })
    ) || [];

  // ✅ Get all sub_maps for the selected path only
  const allSubMaps =
    selectedPath?.roadmaps?.flatMap((roadmap: any) => roadmap.sub_maps || []) ||
    [];

  // ✅ Find how many sub_maps are completed
  const completedSubMaps = allSubMaps.filter((sub: any) =>
    completedResources.includes(sub.id)
  ).length;

  // ✅ Calculate progress percentage (based on sub_maps)
  const progress =
    allSubMaps.length > 0 ? (completedSubMaps / allSubMaps.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      {/* Navbar */}
      <CustomNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-start gap-6">
            <div className="text-6xl">{skill.icon}</div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {skill.title}
                </h1>
                <Badge variant="secondary">{skill.level}</Badge>
                {selectedPath && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Globe className="w-3 h-3" />
                    {getLanguageDisplay(selectedLanguage)}
                  </Badge>
                )}
              </div>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-4">
                {skill.description}
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  <Users className="w-5 h-5" />
                  <span>{skill.students} students</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  <Clock className="w-5 h-5" />
                  <span>{skill.duration}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span>{skill.rating} rating</span>
                </div>
                <div className="text-gray-600 dark:text-gray-300">
                  <span className="font-medium">{skill.category}</span>
                </div>
              </div>

              {selectedPath && (
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 mb-1">
                      <span>Progress</span>
                      <span>
                        {completedSubMaps} / {allSubMaps.length} done
                      </span>
                    </div>
                    <Progress
                      value={progress}
                      className="h-2 bg-gradient-to-r dark:from-gray-700 dark:to-gray-600"
                    />
                  </div>
                  <Button size="lg" onClick={downloadRoadmapPDF}>
                    <Download className="w-4 h-4 mr-2" />
                    Download Roadmap
                  </Button>
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
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Roadmap */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center gap-4 mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Learning Roadmap
                </h2>
                <Button variant="outline" onClick={() => setSelectedPath(null)}>
                  Change Path
                </Button>

                <div className="flex items-center gap-2 ml-auto">
                  <Globe className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                  <Select
                    value={selectedLanguage}
                    onValueChange={setSelectedLanguage}
                  >
                    <SelectTrigger className="w-32">
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

              {selectedPath.roadmaps?.map((roadmap: any, rIndex: number) => (
                <Card
                  key={roadmap.id}
                  className="overflow-hidden dark:bg-gray-800"
                >
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 border-b">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {rIndex + 1}
                      </div>
                      <div>
                        <CardTitle className="text-xl dark:text-white">
                          {roadmap.title}
                        </CardTitle>
                        <CardDescription className="text-gray-600 dark:text-gray-300">
                          {roadmap.micro_desc} • {roadmap.duration}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    {roadmap.sub_maps?.map((sub: any) => {
                      const resData = sub.resources || {};
                      const langKey =
                        selectedLanguage === "english"
                          ? "English"
                          : selectedLanguage === "bangla"
                          ? "Bangla"
                          : "Hindi";
                      const resources = resData[langKey] || [];

                      return (
                        <div
                          key={sub.id}
                          className="border dark:border-gray-700 rounded-lg"
                        >
                          <button
                            onClick={() => toggleResourceGroup(sub.id)}
                            className="w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors rounded-lg"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 flex-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleResourceCompletion(sub.id);
                                  }}
                                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                                    completedResources.includes(sub.id)
                                      ? "bg-green-500 border-green-500 text-white"
                                      : "border-gray-300 hover:border-green-400"
                                  }`}
                                >
                                  {completedResources.includes(sub.id) && (
                                    <CheckCircle className="w-4 h-4" />
                                  )}
                                </button>

                                <div>
                                  <h4 className="font-semibold text-gray-900 dark:text-white">
                                    {sub.title}
                                  </h4>
                                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                    {sub.micro_desc}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {resources.length} resources available (Learn from any one of them)
                                  </p>
                                </div>
                              </div>
                              <div
                                className={`transform transition-transform ${
                                  expandedResourceGroups.includes(sub.id)
                                    ? "rotate-180"
                                    : ""
                                }`}
                              >
                                ▼
                              </div>
                            </div>
                          </button>

                          {expandedResourceGroups.includes(sub.id) && (
                            <div className="border-t dark:border-gray-700 p-4 space-y-3">
                              {resources.map((resource: any, index: number) => (
                                <div
                                  key={`${sub.id}-${index}`}
                                  className="border dark:border-gray-600 rounded-lg p-4 hover:shadow-md transition-shadow"
                                >
                                  <div className="flex items-start gap-4">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-2">
                                        {getResourceIcon(resource.link_type)}
                                        <h5 className="font-semibold text-gray-900 dark:text-white">
                                          {resource.link_type}
                                        </h5>
                                        <Badge
                                          variant="outline"
                                          className="text-xs"
                                        >
                                          {resource.link_type}
                                        </Badge>
                                      </div>
                                      <div className="flex justify-between items-center">
                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                          Resource
                                        </div>
                                        <div className="flex gap-2">
                                          <Button
                                            variant="default"
                                            size="sm"
                                            onClick={() =>
                                              openResourceViewer(
                                                resource,
                                                resources
                                              )
                                            }
                                          >
                                            <Play className="w-4 h-4 mr-1" />
                                            Watch
                                          </Button>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            asChild
                                          >
                                            <a
                                              href={resource.link}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                            >
                                              <ExternalLink className="w-4 h-4 mr-1" />
                                              External
                                            </a>
                                          </Button>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card className="dark:bg-gray-800">
                <CardHeader>
                  <CardTitle className="dark:text-white">
                    About This Skill
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {skill.overview}
                  </p>
                </CardContent>
              </Card>

              {/* Career Opportunities */}
              <Card className="dark:bg-gray-800">
                <CardHeader>
                  <CardTitle className="dark:text-white">
                    Career Opportunities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {skill.career_opportunities.map(
                      (career: string, index: number) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 text-gray-600 dark:text-gray-300"
                        >
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>{career}</span>
                        </div>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Tools Needed */}
              <Card className="dark:bg-gray-800">
                <CardHeader>
                  <CardTitle className="dark:text-white">
                    Tools You'll Need
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {skill.tools_needed.map((tool: string, index: number) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 text-gray-600 dark:text-gray-300"
                      >
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span>{tool}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>

      {selectedResource && (
        <ResourceViewer
          resource={selectedResource}
          allResources={selectedStageResources}
          onClose={closeResourceViewer}
          onResourceChange={setSelectedResource}
        />
      )}
    </div>
  );
};

export default SkillDetail;
